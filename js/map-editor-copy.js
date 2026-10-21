/* Cross-editor copies wait in a durable inbox until the destination saves them. */
const MapCopy = (() => {
  const editors = [
    { key: 'tudrc_battle_maps_v1', label: '戰鬥地圖編輯器', page: '地圖編輯器.html' },
    { key: 'tudrc_base_maps_v1', label: '基地編輯器', page: '基地編輯器.html' },
    { key: 'tudrc_story_maps_v1', label: '劇情地圖編輯器', page: '劇情地圖編輯器.html' },
  ];
  const current = editors.find(e => e.key === STORAGE_MAPS);
  const channel = typeof BroadcastChannel === 'function' ? new BroadcastChannel('tudrc_map_copies_v1') : null;
  const inboxKey = key => 'tudrc_map_copy_inbox__' + key;
  const dbReady = new Promise((resolve, reject) => {
    const request = indexedDB.open('tudrc_editor', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('kv');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  async function inbox(key, update) {
    const db = await dbReady;
    return new Promise((resolve, reject) => {
      const tx = db.transaction('kv', update ? 'readwrite' : 'readonly');
      const store = tx.objectStore('kv'), request = store.get(inboxKey(key));
      let result;
      request.onsuccess = () => {
        try {
          const list = request.result || [];
          if (!Array.isArray(list)) throw new Error('複製佇列格式不正確');
          result = update ? update(list) : list;
          if (update) store.put(result, inboxKey(key));
        } catch (error) { tx.abort(); reject(error); }
      };
      tx.oncomplete = () => resolve(result);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error || new Error('複製未完成'));
    });
  }
  let receiving = false;
  async function receive() {
    if (receiving) return;
    receiving = true;
    try {
      let pending;
      while ((pending = await inbox(current.key)).length) {
        const added = pending.filter(m => !maps.some(old => old.id === m.id));
        if (added.length) {
          pushUndo();
          added.forEach(m => maps.push(fixMap(clone(m))));
          refreshMapSelect();
        }
        await EditorStore.setItem(STORAGE_MAPS, JSON.stringify(maps));
        const ids = new Set(pending.map(m => m.id));
        await inbox(current.key, list => list.filter(m => !ids.has(m.id)));
        setStatus('已收到複製地圖「' + pending.map(m => m.name).join('、') + '」，請按「存到專案」保存', '#7ee0c0');
      }
    } catch (error) {
      setStatus('接收複製地圖失敗，副本仍保留，請重新整理重試：' + error.message, '#ff8f8f');
    } finally { receiving = false; }
  }

  const dialog = document.createElement('dialog');
  dialog.className = 'map-copy-dialog';
  dialog.setAttribute('aria-labelledby', 'mapCopyTitle');
  dialog.innerHTML = '<form class="map-copy-form">' +
    '<h2 id="mapCopyTitle">複製地圖</h2>' +
    '<label>複製到<select name="destination" aria-label="目的編輯器"></select></label>' +
    '<label>副本名稱<input name="name" required maxlength="120" autocomplete="off"></label>' +
    '<p class="map-copy-result" role="status"></p>' +
    '<a class="btn map-copy-open" hidden>開啟目的編輯器</a>' +
    '<div class="map-copy-actions"><button type="button" class="btn" data-cancel>取消</button>' +
    '<button type="submit" class="btn">複製</button></div></form>';
  document.body.appendChild(dialog);
  const form = dialog.querySelector('form');
  const destination = form.elements.destination, nameInput = form.elements.name;
  const submit = form.querySelector('[type="submit"]'), cancel = form.querySelector('[data-cancel]');
  const result = form.querySelector('[role="status"]'), openLink = form.querySelector('a');
  for (const editor of editors) {
    const option = document.createElement('option');
    option.value = editor.key;
    option.textContent = editor.label + (editor === current ? '（目前）' : '');
    destination.appendChild(option);
  }
  let source = null, busy = false;
  cancel.onclick = () => dialog.close();
  dialog.addEventListener('cancel', event => { if (busy) event.preventDefault(); });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy || !source) return;
    const target = editors.find(e => e.key === destination.value);
    const copy = clone(source);
    copy.id = 'map_' + (typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Date.now().toString(36) + '_' + Math.random().toString(36).slice(2));
    copy.name = nameInput.value.trim() || source.name + '（複製）';
    // A portal back to this map should lead back to the new copy.
    for (const portal of copy.portals || []) if (portal.to === source.id) portal.to = copy.id;
    busy = true;
    submit.disabled = cancel.disabled = destination.disabled = nameInput.disabled = true;
    result.textContent = '複製中…';
    try {
      if (target === current) {
        pushUndo(); maps.push(fixMap(copy)); switchTo(copy.id);
        await EditorStore.setItem(STORAGE_MAPS, JSON.stringify(maps));
        saveMaps(); dialog.close();
      } else {
        await inbox(target.key, list => [...list, copy]);
        channel?.postMessage({ target: target.key });
        result.textContent = '已複製「' + copy.name + '」到' + target.label + '。請到該編輯器按「存到專案」。';
        openLink.href = target.page;
        openLink.hidden = false;
        submit.hidden = true;
        cancel.textContent = '完成';
        source = null;
      }
      setStatus('已複製「' + copy.name + '」到' + target.label, '#7ee0c0');
    } catch (error) {
      result.textContent = '複製失敗：' + error.message + '。請重試。';
    } finally {
      busy = false;
      submit.disabled = cancel.disabled = destination.disabled = nameInput.disabled = false;
    }
  });
  if (channel) channel.onmessage = event => { if (event.data?.target === current.key) receive(); };
  window.addEventListener('focus', receive);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) receive(); });
  receive();
  return {
    open() {
      source = clone(curMap());
      destination.value = current.key;
      nameInput.value = source.name + '（複製）';
      result.textContent = '';
      openLink.hidden = true;
      submit.hidden = false;
      cancel.textContent = '取消';
      dialog.showModal();
      destination.focus();
    },
  };
})();
