/* ===== 所有編輯器共用：一鍵「💾 存到專案」=====
   第一次會請你選遊戲資料夾（有 塔防原型.html 的那個），之後一鍵就把匯出內容直接寫進 data/，
   不用再下載、手動覆蓋。資料夾只要選一次，所有編輯器共用。
   寫入前會把舊檔備份到 backups/編輯器存檔/（每種檔案保留最近 10 份）；內容沒變的檔案不會重寫。
   需要 Chrome 或 Edge；其他瀏覽器請照舊用「下載」。快捷鍵：Ctrl+S。

   用法（在編輯器頁面最後）：
     ProjectSave.attach({
       after: ['exportMonsters'],                       // 按鈕放在哪些按鈕後面（可以好幾個）
       files: [{ path: 'data/monsters.js', label: '怪物', text: () => exportText() }],
       status: (msg, isError) => ...,                   // 顯示訊息的方式
     });
*/
const ProjectSave = (() => {
  const DB_NAME = 'tudrc_editor', STORE = 'kv', HANDLE_KEY = 'projectDir';
  const BACKUP_DIR = ['backups', '編輯器存檔'], BACKUP_KEEP = 10;
  const idb = () => new Promise((res, rej) => {
    const r = indexedDB.open(DB_NAME, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE);
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  });
  async function getHandle() { try { const db = await idb(); return await new Promise(res => { const q = db.transaction(STORE).objectStore(STORE).get(HANDLE_KEY); q.onsuccess = () => res(q.result || null); q.onerror = () => res(null); }); } catch (_) { return null; } }
  async function setHandle(h) { try { const db = await idb(); db.transaction(STORE, 'readwrite').objectStore(STORE).put(h, HANDLE_KEY); } catch (_) {} }

  async function projectDir(pickAgain, say) {
    let dir = pickAgain ? null : await getHandle();
    if (dir) {
      let perm = await dir.queryPermission({ mode: 'readwrite' });
      if (perm !== 'granted') perm = await dir.requestPermission({ mode: 'readwrite' });
      if (perm === 'granted') return dir;
    }
    if (!window.showDirectoryPicker) throw new Error('這個瀏覽器不支援直接存檔，請用 Chrome 或 Edge，或改用「下載」');
    say('請選擇遊戲資料夾（裡面有 塔防原型.html 的那個資料夾）');
    dir = await window.showDirectoryPicker({ id: 'tudrc-game', mode: 'readwrite' });
    try { await dir.getFileHandle('塔防原型.html'); await dir.getDirectoryHandle('data'); }
    catch (_) { throw new Error('選的資料夾不對：裡面要有 塔防原型.html 和 data 資料夾'); }
    await setHandle(dir);
    return dir;
  }
  async function subDir(dir, parts, create) { for (const p of parts) dir = await dir.getDirectoryHandle(p, { create }); return dir; }
  // 寫一個檔案：回傳 'same'（沒變動）或 'saved'
  async function writeFile(root, path, text, stamp) {
    const parts = path.split('/'), name = parts.pop(), dir = await subDir(root, parts, false);
    try {   // 備份舊檔
      const old = await (await (await dir.getFileHandle(name)).getFile()).text();
      if (old === text) return 'same';
      const bdir = await subDir(root, BACKUP_DIR, true), base = name.replace(/\.js$/, '');
      const bf = await (await bdir.getFileHandle(base + '-' + stamp + '.js', { create: true })).createWritable();
      await bf.write(old); await bf.close();
      const olds = [];
      for await (const [n] of bdir.entries()) if (n.startsWith(base + '-') && /^\d{8}-\d{6}\.js$/.test(n.slice(base.length + 1))) olds.push(n);
      olds.sort();
      for (const n of olds.slice(0, Math.max(0, olds.length - BACKUP_KEEP))) await bdir.removeEntry(n);
    } catch (e) { if (e && e.name !== 'NotFoundError') console.warn('備份失敗', e); }
    const w = await (await dir.getFileHandle(name, { create: true })).createWritable();
    await w.write(text); await w.close();
    return 'saved';
  }
  const timeStamp = () => { const d = new Date(), z = n => String(n).padStart(2, '0'); return d.getFullYear() + z(d.getMonth() + 1) + z(d.getDate()) + '-' + z(d.getHours()) + z(d.getMinutes()) + z(d.getSeconds()); };

  // ---- 存檔保護（多人協作）：打開編輯器時記下每個檔案當時的內容（基準），存檔前再看一次 ----
  // ・檔案在你打開編輯器之後被改過（例如剛拉取朋友的版本）→ 先不存，請你重新整理（js/draft-sync.js 會自動合併）
  // ・編輯器讀到的是瀏覽器快取的舊檔案（跟硬碟上的不一樣）→ 先不存，請你按 Ctrl+F5
  const baselines = new Map();   // 檔案路徑 → Promise<{ fresh: 硬碟上的內容, stale: 頁面用的是不是快取舊檔 } | null>
  function baselineOf(path) {
    if (!baselines.has(path)) baselines.set(path, (async () => {
      if (location.protocol === 'file:') return null;   // 直接雙擊開啟：讀不到檔案，不檢查
      try {
        const res = await fetch(path + '?_fresh=' + Date.now(), { cache: 'no-store' });
        if (!res.ok) return null;
        const fresh = await res.text();
        let stale = false;
        const tag = [...document.scripts].find(sc => (sc.getAttribute('src') || '').split('?')[0] === path);
        if (tag) { try { stale = (await (await fetch(tag.getAttribute('src'))).text()) !== fresh; } catch (_) {} }
        return { fresh, stale };
      } catch (_) { return null; }
    })());
    return baselines.get(path);
  }
  async function readDisk(root, path) {
    try { const parts = path.split('/'), name = parts.pop(); return await (await (await (await subDir(root, parts, false)).getFileHandle(name)).getFile()).text(); }
    catch (_) { return null; }
  }
  async function checkBeforeSave(root, files) {
    for (const f of files) {
      const bl = await baselineOf(f.path); if (!bl) continue;
      const text = f.text();
      if (bl.stale) throw new Error('「' + f.label + '」：這個編輯器讀到的是瀏覽器快取的舊檔案，直接存會蓋掉新內容。請按 Ctrl+F5 重新整理這個頁面（你的修改會自動合併進來），再存一次。');
      const disk = await readDisk(root, f.path);
      if (disk != null && disk !== bl.fresh && disk !== text)
        throw new Error('「' + f.label + '」在你打開編輯器之後被更新了（例如剛拉取了朋友的版本）。為了不蓋掉新內容，這次先不存。請重新整理這個編輯器頁面（你的修改會自動和新版本合併），再存一次。');
    }
  }

  // 存這一頁的所有檔案
  async function save(files, say, pickAgain, buttons) {
    // 雙擊開啟（file://）沒辦法做下面的存檔保護：存之前再問一次（提醒列在 js/editor-nav.js）
    if (location.protocol === 'file:' && !confirm('你是直接雙擊開啟編輯器的，沒辦法檢查檔案有沒有被朋友或 Claude 更新過，存檔可能會蓋掉新內容。\n\n建議按「取消」，改用「開啟編輯器.bat」開啟後再存。\n確定還是要存嗎？')) {
      say('已取消存檔：請改用「開啟編輯器.bat」開啟編輯器再存。', true); return false;
    }
    buttons.forEach(b => { b.disabled = true; });
    try {
      const root = await projectDir(pickAgain, m => say(m, false)), stamp = timeStamp(), done = [];
      await checkBeforeSave(root, files);   // 先全部檢查過，有一個不行就整批不存
      for (const f of files) {
        const text = f.text();
        const r = await writeFile(root, f.path, text, stamp);
        baselines.set(f.path, Promise.resolve({ fresh: text, stale: false }));   // 存好了：之後以這次存的內容為基準
        done.push(f.label + (r === 'same' ? '（沒有變動）' : ' ✓'));
      }
      say('已存到專案：' + done.join('、') + '　遊戲頁按 Ctrl+F5 重新整理就會套用；舊檔備份在 backups/編輯器存檔/', false);
      return true;
    } catch (e) {
      if (e && e.name === 'AbortError') say('已取消存檔', false);
      else say('存到專案失敗：' + (e && e.message || e), true);
      return false;
    } finally { buttons.forEach(b => { b.disabled = false; }); }
  }

  function attach({ after = [], files, status, title }) {
    const say = (m, err) => { try { status(m, err); } catch (_) { console.log(m); } };
    // 頁面打開時就記下基準（有些檔案是其他程式之後才加進 files 的，所以等頁面載入完再補一次）
    const initBaselines = () => files.forEach(f => baselineOf(f.path));
    for (const ms of [0, 800, 2500]) setTimeout(initBaselines, ms);   // 編輯器程式是一個一個載入的（EditorStore.boot），晚加進來的檔案也要記到
    if (document.readyState !== 'complete') window.addEventListener('load', initBaselines, { once: true });
    const buttons = [];
    for (const id of [].concat(after)) {
      const ref = document.getElementById(id); if (!ref) continue;
      const b = document.createElement('button');
      b.type = 'button'; b.className = (ref.className || '') + ' project-save-btn';
      b.textContent = '💾 存到專案';
      b.title = title || ('直接寫進遊戲資料夾：' + files.map(f => f.path).join('、') + '（Ctrl+S）。按住 Shift 點可以重新選資料夾');
      b.addEventListener('click', e => save(files, say, e.shiftKey, buttons));
      ref.insertAdjacentElement('afterend', b);
      buttons.push(b);
    }
    document.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) { e.preventDefault(); save(files, say, false, buttons); }
    });
    return { save: pickAgain => save(files, say, pickAgain, buttons) };
  }
  return { attach, writeFile, subDir, projectDir };   // projectDir：開發工坊編輯器挑圖片時用（取得遊戲資料夾）
})();
