/* ===== 🧱 牆地板編輯器 =====
   素材庫（data/tiles.js 的 SHARED_TILES）裡每張素材標成「🧱 牆」「🟫 地板」「⚪ 不是牆」或不標（說明見 js/surface-tags.js）。
   遊戲和地圖編輯器判斷牆和地板時看這份標記，不再看素材的名字猜。
   操作：點一張＝選它；Ctrl＋點＝多選／取消；Shift＋點＝選一整段；Ctrl＋A＝選目前看得到的全部。
         選好後按上面的按鈕，或按鍵盤 1＝牆、2＝地板、3＝不是牆、0＝拿掉標記。
   修改先存在這個瀏覽器（只記改過的素材，SURFACE_TAG_DRAFT），遊戲、地圖編輯器重新整理就套用；
   按「💾 存到專案」寫進 data/surface-tags.js。 */
const SurfaceTagEditor = (() => {
  const $ = id => document.getElementById(id);
  const tiles = typeof SHARED_TILES !== 'undefined' ? SHARED_TILES.filter(t => t && t.id && t.file) : [];
  const base = () => (typeof SURFACE_TAGS !== 'undefined' ? SURFACE_TAGS : {});
  // 草稿：只記跟專案檔不一樣的素材（值＝標記，null＝拿掉專案檔裡的標記）
  let draft = {}; try { draft = JSON.parse(localStorage.getItem(SURFACE_TAG_DRAFT) || '{}') || {}; } catch (_) { draft = {}; }
  for (const id of Object.keys(draft)) if ((draft[id] ?? null) === (base()[id] ?? null)) delete draft[id];   // 已經存到專案的：草稿拿掉
  const saveDraft = () => { try { if (Object.keys(draft).length) localStorage.setItem(SURFACE_TAG_DRAFT, JSON.stringify(draft)); else localStorage.removeItem(SURFACE_TAG_DRAFT); } catch (_) {} };
  saveDraft();
  // 牆頂幾列的草稿：只記跟專案檔不一樣的（值＝列數，null＝回到預設 1 列）
  const baseTop = () => (typeof SURFACE_WALL_TOP !== 'undefined' ? SURFACE_WALL_TOP : {});
  let topDraft = {}; try { topDraft = JSON.parse(localStorage.getItem(SURFACE_WALL_TOP_DRAFT) || '{}') || {}; } catch (_) { topDraft = {}; }
  for (const id of Object.keys(topDraft)) if ((topDraft[id] ?? null) === (baseTop()[id] ?? null)) delete topDraft[id];
  const saveTopDraft = () => { try { if (Object.keys(topDraft).length) localStorage.setItem(SURFACE_WALL_TOP_DRAFT, JSON.stringify(topDraft)); else localStorage.removeItem(SURFACE_WALL_TOP_DRAFT); } catch (_) {} };
  saveTopDraft();
  const changed = id => id in draft || id in topDraft;

  // 每張素材用在幾張戰鬥地圖（data/maps.js），方便先標常用的
  const usedIn = new Map();
  for (const m of (typeof BATTLE_MAPS !== 'undefined' ? BATTLE_MAPS : [])) {
    const ids = new Set();
    for (const s of m.stamps || []) ids.add(s.id);
    for (const layer of Object.values(m.layers || {})) for (const id of Object.values(layer || {})) if (id) ids.add(id);
    for (const id of ids) usedIn.set(id, (usedIn.get(id) || 0) + 1);
  }

  let filter = 'all', sel = new Set(), anchor = null, shown = [];
  const say = (m, err) => { const s = $('stStatus'); s.textContent = m; s.style.color = err ? '#ff8f8f' : ''; };
  const tagOf = id => surfaceTagOf(id);

  // ---- 改標記 ----
  function setTag(ids, tag) {
    let n = 0;
    for (const id of ids) {
      const now = SURFACE_TAG_KINDS[tag] ? tag : null;
      if (tagOf(id) === now) continue;
      if (now === (base()[id] ?? null)) delete draft[id]; else draft[id] = now;
      n++;
    }
    saveDraft(); render();
    const left = Object.keys(draft).length;
    say((n ? '✓ ' + n + ' 張改成「' + (SURFACE_TAG_KINDS[tag] ? SURFACE_TAG_KINDS[tag].label : '沒標') + '」' : '沒有要改的') + '（' + (left ? left + ' 張還沒存到專案，按 💾 存到專案' : '跟專案檔一樣') + '）');
  }
  // 設「牆頂幾列」（只改標成牆的；n＝null 回到預設）
  function setWallTop(ids, n) {
    let k = 0;
    for (const id of ids) {
      if (tagOf(id) !== 'wall') continue;
      const v = n == null ? null : Math.max(0, Math.min(10, Math.round(n)));
      const stored = v === SURFACE_WALL_TOP_DEFAULT ? null : v;   // 跟預設一樣就不記
      if ((surfaceWallTopData()[id] ?? null) === stored) continue;
      if (stored === (baseTop()[id] ?? null)) delete topDraft[id]; else topDraft[id] = stored;
      k++;
    }
    saveTopDraft(); render();
    say(k ? '✓ ' + k + ' 張牆的牆頂改成 ' + (n == null ? SURFACE_WALL_TOP_DEFAULT : n) + ' 列（2 樓平台邊緣時，從上面數這幾列可以走，下面是牆面）' : '選取的素材裡沒有要改的牆（只有標成 🧱 牆 的素材有牆頂）');
  }
  function source() {
    const data = surfaceTagData(), ids = Object.keys(data).filter(id => SURFACE_TAG_KINDS[data[id]]).sort();
    const topData = surfaceWallTopData(), tops = Object.keys(topData).filter(id => Number.isFinite(topData[id]) && topData[id] !== SURFACE_WALL_TOP_DEFAULT).sort();
    return '/* 素材的「牆／地板」標記：由 🧱 牆地板編輯器 匯出（說明見 js/surface-tags.js）。\n'
      + "   { 素材 id: 'wall'（牆）| 'floor'（地板）| 'none'（不是牆：門、閘門、欄杆…） }，沒列出來的素材＝沒標，照圖層判斷。 */\n"
      + 'const SURFACE_TAGS = {' + (ids.length ? '\n' + ids.map(id => '  ' + JSON.stringify(id) + ': ' + JSON.stringify(data[id])).join(',\n') + '\n' : '') + '};\n'
      + '// 牆頂幾列：標成「牆」的素材，從圖最上面往下幾列是牆頂（2 樓平台邊緣時，2 樓的人可以走到這幾列；再下面是牆面，走不進去）。\n'
      + '// 沒列出來的＝' + SURFACE_WALL_TOP_DEFAULT + ' 列。由 🧱 牆地板編輯器 匯出。\n'
      + 'const SURFACE_WALL_TOP = {' + (tops.length ? '\n' + tops.map(id => '  ' + JSON.stringify(id) + ': ' + topData[id]).join(',\n') + '\n' : '') + '};\n';
  }

  // ---- 清單 ----
  function counts() {
    const c = { all: tiles.length, untagged: 0, wall: 0, floor: 0, none: 0, changed: new Set([...Object.keys(draft), ...Object.keys(topDraft)]).size };
    for (const t of tiles) { const g = tagOf(t.id); c[g || 'untagged']++; }
    return c;
  }
  function render() {
    const q = $('stSearch').value.trim().toLowerCase(), onlyUsed = $('stOnlyUsed').checked, c = counts();
    for (const b of document.querySelectorAll('.st-filter button')) {
      const k = b.dataset.f; b.classList.toggle('on', k === filter);
      b.querySelector('i').textContent = c[k] ?? 0;
    }
    shown = tiles.filter(t => {
      const g = tagOf(t.id);
      if (filter === 'untagged' ? g : filter === 'changed' ? !changed(t.id) : filter !== 'all' && g !== filter) return false;
      if (onlyUsed && !usedIn.get(t.id)) return false;
      return !q || [t.name, t.id, t.file].some(v => String(v || '').toLowerCase().includes(q));
    });
    const grid = $('stGrid'); grid.innerHTML = '';
    const frag = document.createDocumentFragment();
    for (const t of shown) {
      const g = tagOf(t.id), k = SURFACE_TAG_KINDS[g];
      const card = document.createElement('button'); card.type = 'button';
      card.className = 'st-card' + (sel.has(t.id) ? ' sel' : '') + (changed(t.id) ? ' changed' : '');
      card.style.setProperty('--tag', k ? k.color : '#3a4757');
      card.innerHTML = '<div class="st-thumb"><img loading="lazy" alt=""></div><b></b><span class="st-tag"></span><small></small>';
      card.querySelector('img').src = t.file;
      card.querySelector('b').textContent = t.name || t.id;
      card.querySelector('.st-tag').textContent = k ? k.label : '沒標';
      if (g === 'wall') {   // 牆：縮圖上畫一條黃色虛線標出牆頂到哪裡（線以上＝牆頂，2 樓的人可以走；以下＝牆面）
        const n = surfaceWallTopOf(t.id), h = t.h || 1;
        card.querySelector('.st-tag').textContent += '・牆頂 ' + n + ' 列';
        const img = card.querySelector('img'), mark = document.createElement('i'); mark.className = 'st-top';
        const place = () => { mark.style.top = (img.offsetTop + img.offsetHeight * Math.min(1, n / h)) + 'px'; mark.style.left = img.offsetLeft + 'px'; mark.style.width = img.offsetWidth + 'px'; };
        img.addEventListener('load', place); requestAnimationFrame(place);
        card.querySelector('.st-thumb').appendChild(mark);
      }
      const u = usedIn.get(t.id) || 0;
      card.querySelector('small').textContent = (t.w || 1) + '×' + (t.h || 1) + ' 格' + (u ? '・用在 ' + u + ' 張地圖' : '') + (changed(t.id) ? '・未存' : '');
      card.title = t.id + '\n' + t.file;
      card.onclick = e => pick(t.id, e);
      frag.appendChild(card);
    }
    grid.appendChild(frag);
    if (!shown.length) grid.innerHTML = '<p class="help">找不到符合的素材</p>';
    for (const id of [...sel]) if (!tiles.some(t => t.id === id)) sel.delete(id);
    $('stSelN').textContent = sel.size ? '已選 ' + sel.size + ' 張：' : '先點素材選起來：';
    document.querySelectorAll('.st-act, .st-top-act').forEach(b => { b.disabled = !sel.size; });
  }
  function pick(id, e) {
    if (e.shiftKey && anchor) {
      const ids = shown.map(t => t.id), a = ids.indexOf(anchor), b = ids.indexOf(id);
      if (a >= 0 && b >= 0) { if (!e.ctrlKey && !e.metaKey) sel.clear(); for (const x of ids.slice(Math.min(a, b), Math.max(a, b) + 1)) sel.add(x); }
    } else if (e.ctrlKey || e.metaKey) { if (sel.has(id)) sel.delete(id); else sel.add(id); anchor = id; }
    else { sel = new Set([id]); anchor = id; }
    render();
  }

  // ---- 按鈕、鍵盤 ----
  document.querySelectorAll('.st-filter button').forEach(b => { b.onclick = () => { filter = b.dataset.f; render(); }; });
  let timer = null; $('stSearch').oninput = () => { clearTimeout(timer); timer = setTimeout(render, 200); };
  $('stOnlyUsed').onchange = render;
  $('stSize').oninput = () => document.documentElement.style.setProperty('--st-size', $('stSize').value + 'px');
  document.querySelectorAll('.st-act').forEach(b => { b.onclick = () => setTag([...sel], b.dataset.tag); });
  document.querySelectorAll('.st-top-act').forEach(b => { b.onclick = () => setWallTop([...sel], Number(b.dataset.top)); });
  $('stSelAll').onclick = () => { sel = new Set(shown.map(t => t.id)); render(); };
  $('stSelNone').onclick = () => { sel.clear(); render(); };
  $('stGuess').onclick = () => {
    const todo = tiles.filter(t => !tagOf(t.id) && surfaceTagGuess(t));
    if (!todo.length) { say('沒標的素材裡，名字看不出是牆、地板或門的（都標好了，或要自己一張張標）'); return; }
    const by = { wall: 0, floor: 0, none: 0 }; for (const t of todo) by[surfaceTagGuess(t)]++;
    if (!confirm('照名字幫「還沒標」的素材先填一個標記（之後還是要看一下對不對）：\n\n🧱 牆 ' + by.wall + ' 張、🟫 地板 ' + by.floor + ' 張、⚪ 不是牆 ' + by.none + ' 張\n\n已經標過的不會動。要填嗎？')) return;
    for (const t of todo) { const g = surfaceTagGuess(t); if (g === (base()[t.id] ?? null)) delete draft[t.id]; else draft[t.id] = g; }
    saveDraft(); filter = 'changed'; render(); say('✓ 已預填 ' + todo.length + ' 張，下面列的是剛改的，看一下有沒有猜錯');
  };
  $('stReset').onclick = () => {
    const n = new Set([...Object.keys(draft), ...Object.keys(topDraft)]).size;
    if (!n || !confirm('丟掉這個瀏覽器裡還沒存到專案的 ' + n + ' 張修改？')) return;
    draft = {}; saveDraft(); topDraft = {}; saveTopDraft(); render(); say('已回到專案檔的標記');
  };
  document.addEventListener('keydown', e => {
    if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    if ((e.ctrlKey || e.metaKey) && (e.key === 'a' || e.key === 'A')) { e.preventDefault(); $('stSelAll').click(); return; }
    if (e.ctrlKey || e.metaKey || e.altKey || !sel.size) return;
    const tag = { 1: 'wall', 2: 'floor', 3: 'none', 0: null }[e.key];
    if (tag !== undefined) { e.preventDefault(); setTag([...sel], tag); }
    if (e.key === 'Escape') { sel.clear(); render(); }
  });

  render();
  return { source };
})();
