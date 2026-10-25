/* ===== 🔍 找新素材（地圖編輯器、劇情地圖編輯器、基地編輯器共用）=====
   按「⋯ 更多」裡的「🔍 找新素材」：看一遍素材資料夾（各編輯器的 TILE_IMAGE_FOLDERS，連下一層子資料夾），
   把「資料夾裡有、但還沒加進編輯器」的圖列出來；每張可以改名稱、格數、平貼地面，按「加入」或「全部加入」就變成磚塊。
   ・資料夾的檔案清單是跟本機的小網站要的（「開啟編輯器.bat」或 python -m http.server 都會給資料夾清單）；
     直接雙擊 HTML 打開時拿不到清單，會提示改用「開啟編輯器.bat」。
   ・算「已經加過」：素材庫（data/tiles.js）、編輯器暫存、另一個編輯器加的，只要路徑一樣就算；
     路徑不一樣但檔名一樣、而且那個舊路徑的資料夾裡已經沒有這張圖（例如資料夾改名）也算加過，不重複列出。
   ・不是磚塊的圖（程式自己用的、還沒畫完的）按「略過」：之後不再列出（記在這台電腦的瀏覽器）；標題列的「顯示略過的」可以叫回來。
   ・加入後一樣要按「存到專案」才會寫進 data/tiles.js（跟「＋ 加入磚塊」一樣）。
   必須在 js/map-editor.js 或 js/base-editor.js 之後載入（用到 TILE_IMAGE_FOLDERS、customTiles、saveTiles…）。
*/
const ASSET_FINDER = { exts: /\.(png|jpe?g|gif|webp)$/i, depth: 1, skipDirs: /\/glow$/i, ignoreKey: 'tudrc_asset_finder_ignore_v1' };   // 圖檔副檔名；往下看幾層子資料夾；不看的子資料夾（礦物發光圖：程式用的）；「略過」的圖記在瀏覽器
let assetIgnored = new Set();
try { assetIgnored = new Set(JSON.parse(localStorage.getItem(ASSET_FINDER.ignoreKey) || '[]')); } catch (_) {}
const saveAssetIgnored = () => { try { localStorage.setItem(ASSET_FINDER.ignoreKey, JSON.stringify([...assetIgnored])); } catch (_) {} };
const assetPathKey = p => { let s = String(p || '').split('?')[0].replace(/\\/g, '/'); try { s = decodeURIComponent(s); } catch (_) {} return s.toLowerCase(); };
const assetFileName = p => assetPathKey(p).split('/').pop();

// 跟本機小網站要一個資料夾的清單（目錄頁的 <a href>）：回傳 { files: [路徑], dirs: [路徑] }；拿不到回傳 null
async function listAssetFolder(folder) {
  try {
    const res = await fetch(encodeURI(folder.replace(/\/?$/, '/')), { cache: 'no-store' });
    if (!res.ok) return null;
    const html = await res.text();
    if (!/<a\s/i.test(html) || /<canvas|<script/i.test(html)) return null;   // 不是資料夾清單（例如資料夾裡有 index.html）
    const doc = new DOMParser().parseFromString(html, 'text/html'), files = [], dirs = [];
    for (const a of doc.querySelectorAll('a[href]')) {
      let href = a.getAttribute('href'); if (!href || /^(\?|#|\.\.|\/|[a-z]+:)/i.test(href)) continue;
      try { href = decodeURIComponent(href); } catch (_) {}
      const path = folder.replace(/\/$/, '') + '/' + href;
      if (href.endsWith('/')) dirs.push(path.replace(/\/$/, ''));
      else if (ASSET_FINDER.exts.test(href)) files.push(path);
    }
    return { files, dirs };
  } catch (_) { return null; }
}
async function scanAssetFolders() {
  const found = [], seen = new Set(); let reachable = 0;
  const walk = async (folder, depth) => {
    if (seen.has(folder)) return; seen.add(folder);
    const list = await listAssetFolder(folder); if (!list) return;
    reachable++; found.push(...list.files);
    if (depth > 0) for (const d of list.dirs) if (!ASSET_FINDER.skipDirs.test(d)) await walk(d, depth - 1);
  };
  for (const f of TILE_IMAGE_FOLDERS) await walk(f, ASSET_FINDER.depth);
  return { files: found, reachable };
}
// 編輯器裡已經有的素材（素材庫＋暫存＋另一個編輯器加的）
function knownAssetTiles() {
  const list = [...palette(), ...(typeof SHARED_TILES !== 'undefined' ? SHARED_TILES : [])];
  if (typeof foreignTiles !== 'undefined') list.push(...foreignTiles.values());
  return list.filter(t => t && t.file && !/^(data:|blob:)/i.test(t.file));
}
function newAssetFiles(files) {
  const onDisk = new Set(files.map(assetPathKey)), known = knownAssetTiles();
  const knownPaths = new Set(known.map(t => assetPathKey(t.file)));
  const movedNames = new Set(known.filter(t => !onDisk.has(assetPathKey(t.file))).map(t => assetFileName(t.file)));   // 路徑已經不在了的（資料夾改名、搬家）：用檔名認
  return [...new Set(files)].filter(f => !knownPaths.has(assetPathKey(f)) && !movedNames.has(assetFileName(f))).sort((a, b) => a.localeCompare(b));
}
// 建議佔幾格：寬高都能被 60 整除＝新素材（60px 一格），不然照舊 40px 一格（跟「＋ 加入磚塊」一樣）
function suggestAssetCells(img) {
  const pw = img.naturalWidth, ph = img.naturalHeight, per = pw % 60 === 0 && ph % 60 === 0 ? 60 : CELL;
  return { w: Math.max(1, Math.round(pw / per)), h: Math.max(1, Math.round(ph / per)), px: pw + '×' + ph };
}
const looksFlat = path => /floor|地板|地磚|carpet|地毯|crack|裂/i.test(path);   // 名字像地板的：預設勾「平貼地面」

// ---- 面板 ----
let assetFinderEl = null;
function assetFinderPanel() {
  if (assetFinderEl) return assetFinderEl;
  assetFinderEl = document.createElement('div'); assetFinderEl.className = 'asset-finder hidden';
  assetFinderEl.innerHTML = '<div class="asset-finder-card"><div class="asset-finder-head"><b>🔍 找新素材</b><span class="asset-finder-sum"></span>' +
    '<button type="button" class="btn" data-af="showIgnored" hidden>顯示略過的</button><button type="button" class="btn" data-af="rescan">↻ 重新找</button><button type="button" class="btn primary" data-af="all">＋ 全部加入</button><button type="button" class="btn" data-af="close">✕</button></div>' +
    '<div class="asset-finder-list"></div><div class="asset-finder-foot">加入後記得按「存到專案」，才會寫進 data/tiles.js。</div></div>';
  document.body.appendChild(assetFinderEl);
  assetFinderEl.addEventListener('click', e => {
    if (e.target === assetFinderEl) { closeAssetFinder(); return; }
    const b = e.target.closest('[data-af]'); if (!b) return;
    if (b.dataset.af === 'close') closeAssetFinder();
    else if (b.dataset.af === 'rescan') openAssetFinder();
    else if (b.dataset.af === 'all') addAssetRows([...assetFinderEl.querySelectorAll('.asset-row:not(.added)')]);
    else if (b.dataset.af === 'add') addAssetRows([b.closest('.asset-row')]);
    else if (b.dataset.af === 'skip') { const row = b.closest('.asset-row'); assetIgnored.add(assetPathKey(row.dataset.path)); saveAssetIgnored(); row.remove(); openAssetFinder(true); }
    else if (b.dataset.af === 'unskip') { const row = b.closest('.asset-row'); assetIgnored.delete(assetPathKey(row.dataset.path)); saveAssetIgnored(); openAssetFinder(true); }
    else if (b.dataset.af === 'showIgnored') { assetShowIgnored = !assetShowIgnored; openAssetFinder(true); }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !assetFinderEl.classList.contains('hidden')) closeAssetFinder(); });
  return assetFinderEl;
}
const closeAssetFinder = () => assetFinderEl && assetFinderEl.classList.add('hidden');
let assetShowIgnored = false, assetLastFiles = null;
async function openAssetFinder(reuse = false) {
  const el = assetFinderPanel(), list = el.querySelector('.asset-finder-list'), sum = el.querySelector('.asset-finder-sum');
  el.classList.remove('hidden'); list.innerHTML = '<p class="asset-finder-msg">正在看素材資料夾…</p>'; sum.textContent = '';
  if (location.protocol === 'file:') { list.innerHTML = '<p class="asset-finder-msg">直接雙擊打開的編輯器看不到資料夾裡有什麼。<br>請用「開啟編輯器.bat」打開編輯器再按一次。</p>'; return; }
  const { files, reachable } = reuse && assetLastFiles ? assetLastFiles : (assetLastFiles = await scanAssetFolders());   // 略過／叫回來：不用再看一次資料夾
  if (!reachable) { list.innerHTML = '<p class="asset-finder-msg">拿不到資料夾清單。請用「開啟編輯器.bat」打開編輯器再試一次。</p>'; return; }
  const all = newAssetFiles(files), skipped = all.filter(f => assetIgnored.has(assetPathKey(f)));
  const fresh = assetShowIgnored ? skipped : all.filter(f => !assetIgnored.has(assetPathKey(f)));
  const ign = el.querySelector('[data-af="showIgnored"]'); ign.hidden = !skipped.length && !assetShowIgnored; ign.textContent = assetShowIgnored ? '← 回到新素材' : '顯示略過的（' + skipped.length + '）';
  sum.textContent = assetShowIgnored ? '略過的圖：按「叫回來」就會再列出' : '看了 ' + files.length + ' 張圖，' + (fresh.length ? '有 ' + fresh.length + ' 張還沒加進編輯器' : '全部都加過了') + (skipped.length ? '（另外略過 ' + skipped.length + ' 張）' : '');
  el.querySelector('[data-af="all"]').disabled = !fresh.length || assetShowIgnored;
  if (!fresh.length) { list.innerHTML = '<p class="asset-finder-msg">' + (assetShowIgnored ? '沒有略過的圖' : '沒有新的圖 🎉') + '</p>'; return; }
  list.innerHTML = '';
  for (const path of fresh) {
    const row = document.createElement('div'); row.className = 'asset-row'; row.dataset.path = path;
    const name = path.split('/').pop().replace(/\.[^.]+$/, '');
    row.innerHTML = '<span class="asset-thumb"><img alt=""></span><div class="asset-info"><input type="text" class="asset-name"><small class="asset-path"></small></div>' +
      '<label>寬<input type="number" min="1" class="asset-w"></label><label>高<input type="number" min="1" class="asset-h"></label>' +
      '<label class="asset-flat" title="平貼地面：永遠畫在角色下面（地板、裂痕…）；不勾＝立體物（牆、柱子、家具…）"><input type="checkbox"> 平貼地面</label>' +
      (assetShowIgnored ? '<button type="button" class="btn" data-af="unskip">叫回來</button>' : '<button type="button" class="btn" data-af="add">加入</button><button type="button" class="btn" data-af="skip" title="不是磚塊的圖：之後不再列出">略過</button>');
    row.querySelector('.asset-name').value = name;
    row.querySelector('.asset-path').textContent = path;
    row.querySelector('.asset-flat input').checked = looksFlat(path);
    const img = row.querySelector('img');
    img.onload = () => { const s = suggestAssetCells(img); row.querySelector('.asset-w').value = s.w; row.querySelector('.asset-h').value = s.h; row.querySelector('.asset-path').textContent = path + '（' + s.px + ' px）'; };
    img.src = encodeURI(path);
    list.appendChild(row);
  }
}
function addAssetRows(rows) {
  rows = rows.filter(r => r && !r.classList.contains('added')); if (!rows.length) return;
  pushUndo();
  const stamp = Date.now().toString(36); let lastId = null;
  rows.forEach((row, i) => {
    const w = Math.max(1, parseInt(row.querySelector('.asset-w').value, 10) || 1), h = Math.max(1, parseInt(row.querySelector('.asset-h').value, 10) || 1);
    const tile = { id: 'tile_' + stamp + (rows.length > 1 ? '_' + i : ''), name: row.querySelector('.asset-name').value.trim() || row.dataset.path.split('/').pop(), role: 'floor', file: row.dataset.path, w, h };
    if (row.querySelector('.asset-flat input').checked) tile.flat = true;
    customTiles.push(tile); ensureTileImg(tile); lastId = tile.id;
    row.classList.add('added'); row.querySelector('[data-af="add"]').textContent = '✓ 已加入'; row.querySelector('[data-af="add"]').disabled = true;
  });
  saveTiles(); renderPalette(); if (lastId) selectTile(lastId);
  setStatus('已加入 ' + rows.length + ' 張新素材（記得按「存到專案」）', '#7ee0c0');
  if (!assetFinderEl.querySelector('.asset-row:not(.added)')) assetFinderEl.querySelector('[data-af="all"]').disabled = true;
}
document.getElementById('findNewTiles')?.addEventListener('click', e => { e.target.closest('details')?.removeAttribute('open'); openAssetFinder(); });
