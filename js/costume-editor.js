/* ===== 服裝編輯器（服裝編輯器.html）=====
   調配件戴在每個角色、每個方向的位置，存到 data/costume-placement.js（格式見那個檔案開頭）。
   兩種範圍：
     ・配件專屬：只有這個配件、這個角色用（items）
     ・角色的欄位預設：這個角色所有同欄位配件的預設位置（anchors）；新配件沒調過就戴這裡，通常先調這個就夠
   畫配件用 js/costume-draw.js（和遊戲共用），所以這裡看到的就是遊戲裡的樣子。
*/
const CE_DIRS = ['front', 'left', 'back', 'right'];
const CE_DIR_NAMES = { front: '正面', left: '左側', back: '背面', right: '右側' };
const CE_FRAME_NAMES = ['站立', '走路 1', '走路 2'];
const CE_FILES = {
  front: ['0000_Front.png', '0001_Front-Walking01.png', '0002_Front-Walking02.png'],
  back: ['0009_back.png', '0010_back-walking01.png', '0011_back-walking02.png'],
  left: ['0003_Leftside.png', '0004_Leftside-walking01.png', '0005_Leftside-walking02.png'],
  right: ['0006_right-side.png', '0007_right-side-walking01.png', '0008_right-side-walking02.png'],
};
const CE_ZOOM = 7, CE_SIZE = 64 * CE_ZOOM;
const SLOT_NAME = Object.fromEntries(COSTUME_SLOTS.map(s => [s.id, s.name]));
const ceChars = Object.values(CHARACTERS).filter(c => c.sprite);
const ED = { char: 'winter', acc: (COSTUME_ACCESSORIES[0] || {}).id, dir: 'front', frame: 0, play: false, skin: null, scope: 'item', wear: {}, others: true, t0: performance.now() };
if (ED.acc) ED.wear[ACC_BY_ID[ED.acc].slot] = ED.acc;

// ---- 暫存：瀏覽器裡的編輯和專案檔三方合併（js/draft-sync.js）----
function loadDraft(useFile) {
  let data = COSTUME_PLACEMENT_DEFAULT;
  if (!useFile) { const merged = DraftSync.load(COSTUME_PLACEMENT_KEY, COSTUME_PLACEMENT_DEFAULT, { label: '配件位置' }); if (merged) data = merged; }
  data = JSON.parse(JSON.stringify(data));
  COSTUME_PLACEMENT.anchors = data.anchors || {}; COSTUME_PLACEMENT.items = data.items || {}; COSTUME_PLACEMENT.bob = data.bob || {}; COSTUME_PLACEMENT.offsets = data.offsets || {}; COSTUME_PLACEMENT.blocked = data.blocked || {}; COSTUME_PLACEMENT.layers = data.layers || {};
}
loadDraft(false);
function status(message, error = false) { const el = document.getElementById('status'); el.textContent = message; el.classList.toggle('error', !!error); }
function prune(o) {   // 拿掉空的物件
  for (const k of Object.keys(o)) { const v = o[k]; if (v && typeof v === 'object' && !Array.isArray(v)) { prune(v); if (!Object.keys(v).length) delete o[k]; } }
  return o;
}
function saveDraft() {
  prune(COSTUME_PLACEMENT.anchors); prune(COSTUME_PLACEMENT.items); prune(COSTUME_PLACEMENT.bob);
  for (const [id, o] of Object.entries(COSTUME_PLACEMENT.offsets || {})) if (!o || (!o.x && !o.y)) delete COSTUME_PLACEMENT.offsets[id];   // 0,0＝沒偏移，不用存
  for (const [id, list] of Object.entries(COSTUME_PLACEMENT.blocked || {})) if (!list || !list.length) delete COSTUME_PLACEMENT.blocked[id];
  try { localStorage.setItem(COSTUME_PLACEMENT_KEY, JSON.stringify(COSTUME_PLACEMENT)); status('已自動儲存到這台瀏覽器。'); }
  catch (e) { status('暫存失敗：' + e.message, true); }
  rememberStep();   // 上一步／下一步：記下這次改之前的樣子
}
// ---- 上一步／下一步（Ctrl+Z／Ctrl+Y）：每次自動暫存時，記下改之前的整份設定 ----
// 連續的修改（拖曳一次、按住方向鍵、一直滾）在 0.6 秒內算同一步，按一次 Ctrl+Z 就整段回去。記在這個頁面裡，重新整理就清掉。
const undoStack = [], redoStack = [];
let lastSnap = JSON.stringify(COSTUME_PLACEMENT), lastStepAt = 0, restoring = false;
function rememberStep() {
  if (restoring) return;
  const snap = JSON.stringify(COSTUME_PLACEMENT); if (snap === lastSnap) return;
  const now = performance.now();
  if (now - lastStepAt > 600) { undoStack.push(lastSnap); if (undoStack.length > 300) undoStack.shift(); }   // 跟上一次修改隔太久：算新的一步
  lastStepAt = now; lastSnap = snap; redoStack.length = 0;
}
function stepHistory(from, to, word) {
  if (!from.length) { status(word === 'undo' ? '沒有上一步了' : '沒有下一步了'); return; }
  to.push(JSON.stringify(COSTUME_PLACEMENT));
  const data = JSON.parse(from.pop());
  for (const k of Object.keys(COSTUME_PLACEMENT)) if (!(k in data)) delete COSTUME_PLACEMENT[k];
  Object.assign(COSTUME_PLACEMENT, data);
  restoring = true; saveDraft(); restoring = false;
  lastSnap = JSON.stringify(COSTUME_PLACEMENT); lastStepAt = 0;
  renderAll(); if (typeof drawStage === 'function') drawStage();
  status(word === 'undo' ? '↶ 回到上一步（已自動儲存到這台瀏覽器）' : '↷ 重做下一步（已自動儲存到這台瀏覽器）');
}
document.addEventListener('keydown', e => {
  if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
  const k = e.key.toLowerCase();
  if (k === 'z' && !e.shiftKey) { e.preventDefault(); stepHistory(undoStack, redoStack, 'undo'); }
  else if (k === 'y' || (k === 'z' && e.shiftKey)) { e.preventDefault(); stepHistory(redoStack, undoStack, 'redo'); }
}, true);
// 匯出：最裡層的 { x, y… } 和陣列寫成一行，比較好讀
function fmt(v, ind) {
  if (Array.isArray(v) || !v || typeof v !== 'object' || Object.values(v).every(x => !x || typeof x !== 'object' || Array.isArray(x) && x.every(y => !y || typeof y !== 'object' || Array.isArray(y))))
    return JSON.stringify(v);
  const keys = Object.keys(v); if (!keys.length) return '{}';
  const pad = '  '.repeat(ind + 1);
  return '{\n' + keys.map(k => pad + JSON.stringify(k) + ': ' + fmt(v[k], ind + 1)).join(',\n') + '\n' + '  '.repeat(ind) + '}';
}
function costumePlacementText() {
  saveDraft();
  const data = { anchors: COSTUME_PLACEMENT.anchors, items: COSTUME_PLACEMENT.items, bob: COSTUME_PLACEMENT.bob, offsets: COSTUME_PLACEMENT.offsets || {}, blocked: COSTUME_PLACEMENT.blocked || {}, layers: COSTUME_PLACEMENT.layers || {} };
  return '/* 由服裝編輯器匯出：配件戴在每個角色身上的位置（配件、角色清單在 data/costumes.js）。\n'
    + '   anchors[角色][欄位][方向]＝這個角色每個欄位的預設位置（新配件沒調過就用這個）\n'
    + '   items[配件][角色][方向]＝某個配件專屬的位置（優先）\n'
    + '     x、y＝配件中心在角色圖（64×64）的位置；scale＝縮放；rot＝旋轉（度）；behind＝畫在角色後面；hidden＝這個方向不畫；flip＝圖片左右翻轉\n'
    + '   bob[角色][方向]＝[走路第 1 張, 走路第 2 張] 頭部相對站立圖的位移 [dx, dy]（配件跟著晃）\n'
    + '   offsets[角色]＝角色身高偏移 { x, y }（矮的角色 y 填正數）：還沒調過的配件會加上；「複製給所有角色」時自動加上兩個角色偏移的差\n'
    + '   blocked[配件]＝[角色, …]：這些角色不能擁有、不能戴這個配件\n'
    + '   layers[配件]＝圖層：同時戴好幾個配件時數字大的蓋在上面（沒寫＝下身 1、背部 2、手部 3、頭飾 4、臉部 5） */\n'
    + 'const COSTUME_PLACEMENT_DEFAULT = {\n'
    + ['anchors', 'items', 'bob', 'offsets', 'blocked', 'layers'].map(k => '  ' + JSON.stringify(k) + ': ' + fmt(data[k], 1)).join(',\n') + '\n};\n';
}

// ---- 角色圖 ----
const ceSprites = {};   // 資料夾 → { front: [3 張], … }
function ceSet(folder) {
  if (ceSprites[folder]) return ceSprites[folder];
  const prefix = folder.replace('_', '') + '_', set = ceSprites[folder] = {};
  for (const d of CE_DIRS) set[d] = CE_FILES[d].map(f => { const img = new Image(); img.src = `images/character/${folder}/${prefix}${f}`; return img; });
  return set;
}
const ceReady = img => img && img.complete && img.naturalWidth;
const ceFace = folder => `images/character/${folder}/${folder.replace('_', '')}_0000_Front.png`;
// 這個角色可以穿的 skin：原本的 A、B、C（有圖的）＋專屬 skin
const ceSkinProbe = {};
function ceSkins(id) {
  const base = CHARACTERS[id].sprite.replace(/_[A-Z]$/, ''), list = [];
  for (const k of ['A', 'B', 'C']) {
    const folder = base + '_' + k;
    if (!(folder in ceSkinProbe)) { ceSkinProbe[folder] = null; const img = new Image(); img.onload = () => { ceSkinProbe[folder] = true; renderSkins(); }; img.onerror = () => { ceSkinProbe[folder] = false; }; img.src = ceFace(folder); }
    if (ceSkinProbe[folder] || folder === CHARACTERS[id].sprite) list.push({ folder, name: COSTUME_DEFAULT_SKINS[k] || '造型 ' + k });
  }
  for (const s of COSTUME_SKINS) if (s.char === id) list.push({ folder: s.folder, name: s.name });
  return list;
}
const ceFolder = () => ED.skin || CHARACTERS[ED.char].sprite;

// ---- 正在調哪一份位置 ----
const curAcc = () => ACC_BY_ID[ED.acc];
function scopeMap(create) {   // 方向 → 位置
  const acc = curAcc(); if (!acc) return null;
  const [root, a, b] = ED.scope === 'item' ? [COSTUME_PLACEMENT.items, acc.id, ED.char] : [COSTUME_PLACEMENT.anchors, ED.char, acc.slot];
  if (!root[a]) { if (!create) return null; root[a] = {}; }
  if (!root[a][b]) { if (!create) return null; root[a][b] = {}; }
  return root[a][b];
}
const slotDefault = (acc, dir) => (COSTUME_SLOT_ANCHORS[acc.slot] || {})[dir] || { x: 32, y: 16 };
function effective(dir = ED.dir) {   // 目前範圍下這個方向的位置（調預設時不看配件專屬）
  const acc = curAcc();
  if (ED.scope === 'item') return accPlacement(acc, ED.char, dir);
  return pick3(COSTUME_PLACEMENT.anchors, ED.char, acc.slot, dir) || slotDefault(acc, dir);
}
function cleanPl(p) {
  for (const k of ['x', 'y']) p[k] = Math.round((Number(p[k]) || 0) * 2) / 2;
  if (p.scale != null) { p.scale = Math.round(Math.max(0.1, Number(p.scale) || 1) * 100) / 100; if (p.scale === 1) delete p.scale; }
  if (p.rot != null) { p.rot = Math.round((((Number(p.rot) || 0) + 540) % 360 - 180) * 10) / 10; if (!p.rot) delete p.rot; }
  if (!p.behind) delete p.behind; if (!p.hidden) delete p.hidden; if (!p.flip) delete p.flip;
  return p;
}
function edit(fn, dir = ED.dir) {
  if (!curAcc()) return;
  const m = scopeMap(true), cur = Object.assign({}, m[dir] || effective(dir));
  if (cur.x == null || cur.y == null) { const d = slotDefault(curAcc(), 'front'); cur.x = cur.x ?? d.x ?? 32; cur.y = cur.y ?? d.y ?? 16; }   // 預設是「看不到」的方向（例如背面的眼鏡）
  fn(cur); m[dir] = cleanPl(cur);
  saveDraft(); renderPanel(); renderLists();
}

// ---- 畫 ----
const stage = document.getElementById('stage'), sctx = stage.getContext('2d');
// 整體預覽縮放（只是看的大小，不會改到配件的位置、縮放數值）：以畫面中心縮放；Alt＋滾輪、或上面的 − ＋ 按鈕
let viewZoom = 1;
const VIEW_MIN = 0.5, VIEW_MAX = 2, VIEW_STEP = 0.1;
function setViewZoom(z) {
  viewZoom = Math.round(Math.max(VIEW_MIN, Math.min(VIEW_MAX, z)) * 100) / 100;
  const t = document.getElementById('viewZoomText'); if (t) t.textContent = Math.round(viewZoom * 100) + '%';
  drawStage();
}
let selBox = null;
function wornAccs() {   // 要畫的配件：選中的那個＋（勾選時）其他欄位試戴的
  const acc = curAcc(), list = [];
  for (const slot of ACC_SLOTS) {
    const a = acc && slot === acc.slot ? acc : (ED.others && ED.wear[slot] && ACC_BY_ID[ED.wear[slot]]);
    if (a) list.push(a);
  }
  return sortAccsByLayer(list);   // 照圖層由下往上畫
}
function drawFigure(c, dir, frame, dx, dy, size, highlight) {
  const set = ceSet(ceFolder()), img = set[dir] && set[dir][frame], acc = curAcc();
  let box = null;
  const one = (a, layer) => {
    if (a !== acc) return drawAccessory(c, a, ED.char, dir, frame, dx, dy, size, layer);
    const pl = effective(dir);
    if (pl.hidden) {   // 這個方向不顯示：編輯畫面上淡淡畫出來，方便調
      if (!highlight || layer !== 'front' || pl.x == null) return null;
      c.save(); c.globalAlpha = 0.3; box = drawAccessory(c, a, ED.char, dir, frame, dx, dy, size, null, Object.assign({}, pl, { hidden: false, behind: false })); c.restore();
      return null;
    }
    const r = drawAccessory(c, a, ED.char, dir, frame, dx, dy, size, layer, pl);
    if (r) box = r;
    return r;
  };
  for (const a of wornAccs()) one(a, 'behind');
  if (ceReady(img)) { c.imageSmoothingEnabled = false; c.drawImage(img, dx, dy, size, size); }
  for (const a of wornAccs()) one(a, 'front');
  return box;
}
function drawStage() {
  const c = sctx, z = CE_ZOOM;
  c.clearRect(0, 0, CE_SIZE, CE_SIZE);
  c.fillStyle = '#0d141b'; c.fillRect(0, 0, CE_SIZE, CE_SIZE);   // 縮小時，格子外面的底色
  c.save(); c.translate(CE_SIZE / 2, CE_SIZE / 2); c.scale(viewZoom, viewZoom); c.translate(-CE_SIZE / 2, -CE_SIZE / 2);   // 整體預覽縮放：畫面裡的東西一起縮放
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { c.fillStyle = (x + y) % 2 ? '#17212c' : '#1c2834'; c.fillRect(x * 8 * z, y * 8 * z, 8 * z, 8 * z); }
  c.strokeStyle = 'rgba(255,255,255,.05)'; c.lineWidth = 1; c.beginPath();
  for (let i = 1; i < 64; i++) { c.moveTo(i * z + .5, 0); c.lineTo(i * z + .5, CE_SIZE); c.moveTo(0, i * z + .5); c.lineTo(CE_SIZE, i * z + .5); }
  c.stroke();
  c.strokeStyle = 'rgba(127,215,218,.18)'; c.beginPath(); c.moveTo(CE_SIZE / 2 + .5, 0); c.lineTo(CE_SIZE / 2 + .5, CE_SIZE); c.stroke();   // 中線
  const frame = ED.play ? [1, 0, 2, 0][Math.floor((performance.now() - ED.t0) / 160) % 4] : ED.frame;
  selBox = drawFigure(c, ED.dir, frame, 0, 0, CE_SIZE, true);
  if (selBox) {   // 選中的配件：虛線框＋中心十字
    const { cx, cy, w, h } = selBox;
    c.save(); c.strokeStyle = '#7fd7da'; c.setLineDash([6, 4]); c.lineWidth = 1.5;
    c.strokeRect(Math.round(cx - w / 2) - 2.5, Math.round(cy - h / 2) - 2.5, Math.round(w) + 5, Math.round(h) + 5);
    c.setLineDash([]); c.strokeStyle = '#ffd36f'; c.beginPath(); c.moveTo(cx - 6, cy); c.lineTo(cx + 6, cy); c.moveTo(cx, cy - 6); c.lineTo(cx, cy + 6); c.stroke();
    c.restore();
  }
  c.restore();   // 整體預覽縮放結束
}
const strip = document.getElementById('strip');
const stripCanvases = CE_DIRS.map(d => {
  const cv = document.createElement('canvas'); cv.width = cv.height = 128; cv.title = CE_DIR_NAMES[d];
  cv.addEventListener('click', () => setDir(d)); strip.appendChild(cv); return cv;
});
function drawStrip() {
  const frame = [1, 0, 2, 0][Math.floor((performance.now() - ED.t0) / 160) % 4];
  CE_DIRS.forEach((d, i) => {
    const cv = stripCanvases[i], c = cv.getContext('2d');
    c.clearRect(0, 0, 128, 128); cv.classList.toggle('on', d === ED.dir);
    drawFigure(c, d, frame, 0, 0, 128, false);
  });
}
function loop() { drawStage(); drawStrip(); requestAnimationFrame(loop); }

// ---- 介面 ----
const $ = id => document.getElementById(id);
const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
// 左邊配件的分頁（skin 不在這裡，改在預覽上方的「服裝」下拉選單換）；選哪一頁記在這台瀏覽器
const ACC_TABS = ['head', 'face', 'back', 'hand', 'lower'];
const ACC_TAB_KEY = 'tudrc_costume_editor_tab';
ED.tab = (() => { try { const t = localStorage.getItem(ACC_TAB_KEY); if (ACC_TABS.includes(t)) return t; } catch (_) {} return (curAcc() && curAcc().slot) || ACC_TABS[0]; })();
ED.search = '';
const slotShort = slot => (COSTUME_SLOTS.find(x => x.id === slot) || {}).short || SLOT_NAME[slot] || slot;
function setTab(slot) { ED.tab = slot; try { localStorage.setItem(ACC_TAB_KEY, slot); } catch (_) {} renderLists(); }
function renderLists() {
  const acc = curAcc();
  // 角色：頭像格；小點＝這個配件已替他調過（綠＝專屬、藍＝預設）
  $('charList').innerHTML = ceChars.map(ch => {
    const own = acc && (COSTUME_PLACEMENT.items[acc.id] || {})[ch.id];
    const anchor = acc && !own && (COSTUME_PLACEMENT.anchors[ch.id] || {})[acc.slot];
    const dot = own ? '<i class="dot" title="已調專屬位置"></i>' : anchor ? '<i class="dot anchor" title="已調預設位置"></i>' : '';
    return '<button type="button" data-char="' + ch.id + '" class="' + (ch.id === ED.char ? 'on' : '') + '" title="' + esc(ch.name + '（' + ch.id + '）') + '">' + dot
      + '<span class="face"><img src="' + ceFace(ch.sprite) + '" alt=""></span><span>' + esc(ch.name) + '</span></button>';
  }).join('');
  const q = ED.search.trim().toLowerCase();
  $('slotTabs').innerHTML = ACC_TABS.map(slot => '<button type="button" data-tab="' + slot + '" class="' + (!q && slot === ED.tab ? 'on' : '') + '">'
    + slotShort(slot) + '<i>' + COSTUME_ACCESSORIES.filter(a => a.slot === slot).length + '</i></button>').join('');
  // 有搜尋字＝搜全部分頁；沒有＝只列這一頁
  const list = COSTUME_ACCESSORIES.filter(a => q ? (a.name + a.id).toLowerCase().includes(q) : a.slot === ED.tab);
  $('accList').innerHTML = list.map(a => '<button type="button" data-acc="' + a.id + '" class="' + (a.id === ED.acc ? 'on' : '') + '" title="' + esc(a.name + (a.rarity ? '・' + a.rarity : '') + (a.char ? '・' + ((CHARACTERS[a.char] || {}).name || a.char) + '專屬' : '')) + '">'
    + ((COSTUME_PLACEMENT.items[a.id] || {})[ED.char] ? '<i class="dot" title="已替這個角色調過"></i>' : '')
    + '<span class="icon"><img src="' + encodeURI(a.art.front) + '" alt=""></span><span>' + esc(a.name) + '</span>' + (q ? '<small>' + slotShort(a.slot) + '</small>' : '') + '</button>').join('')
    || '<p class="empty">' + (q ? '找不到「' + esc(ED.search) + '」' : '這一類還沒有配件') + '</p>';
}
// 預覽用的身體：這個角色能穿的服裝
function renderSkins() {
  $('skinSel').innerHTML = ceSkins(ED.char).map(s => '<option value="' + s.folder + '"' + (s.folder === ceFolder() ? ' selected' : '') + '>' + esc(s.name) + '</option>').join('');
}
function renderBars() {
  $('dirBar').innerHTML = CE_DIRS.map((d, i) => '<button type="button" data-dir="' + d + '" class="' + (d === ED.dir ? 'on' : '') + '" title="快捷鍵 ' + (i + 1) + '">' + CE_DIR_NAMES[d] + '</button>').join('');
  $('frameBar').innerHTML = CE_FRAME_NAMES.map((n, i) => '<button type="button" data-frame="' + i + '" class="' + (!ED.play && i === ED.frame ? 'on' : '') + '">' + n + '</button>').join('')
    + '<button type="button" data-play class="' + (ED.play ? 'on' : '') + '" title="走路動畫（空白鍵）">▶</button>';
  renderSkins();
}
function renderPanel() {
  const acc = curAcc(), ch = CHARACTERS[ED.char];
  const off = !acc;
  document.querySelectorAll('.settings input, .settings button').forEach(el => { if (!['previewGame', 'exportFile', 'resetFile', 'bobAuto', 'bobAutoAll', 'offAuto', 'offAutoAll', 'offx', 'offy'].includes(el.id) && !/^b[12][xy]$/.test(el.id) && !el.classList.contains('project-save-btn')) el.disabled = off; });
  $('bobWho').textContent = ch.name; $('bobDir').textContent = CE_DIR_NAMES[ED.dir];
  $('offWho').textContent = ch.name;
  if (!off) { const blocked = !costumeAllowed(ED.char, acc.id); $('fblock').checked = blocked; $('blockWho').textContent = ch.name; $('blockAcc').textContent = '「' + acc.name + '」'; $('blockNote').hidden = !blocked; }
  const charOff = costumeCharOffset(ED.char);
  if (document.activeElement !== $('offx')) $('offx').value = charOff.x;
  if (document.activeElement !== $('offy')) $('offy').value = charOff.y;
  const bob = (COSTUME_PLACEMENT.bob[ED.char] || {})[ED.dir] || [[0, 0], [0, 0]];
  $('b1x').value = bob[0][0]; $('b1y').value = bob[0][1]; $('b2x').value = bob[1][0]; $('b2y').value = bob[1][1];
  if (off) { $('fromNote').textContent = '先在 data/costumes.js 加配件'; return; }
  $('editTitle').textContent = acc.name + '・' + ch.name + '・' + CE_DIR_NAMES[ED.dir];
  $('scopeItemName').textContent = '這個配件';
  $('scopeAnchorName').textContent = '所有' + slotShort(acc.slot) + '預設';
  document.querySelectorAll('input[name=scope]').forEach(r => { r.checked = r.value === ED.scope; });
  const info = accPlacementInfo(acc, ED.char, ED.dir);
  const fromText = { item: '「' + acc.name + '」的專屬位置', anchor: ch.name + '的' + SLOT_NAME[acc.slot] + '預設位置', slot: '欄位的通用位置（還沒替' + ch.name + '調過）' }[info.from];
  let note = '遊戲裡用：<b>' + fromText + '</b>';
  if (ED.scope === 'anchor' && info.from === 'item') note += '<br>⚠ 這個方向有專屬位置，遊戲會用專屬位置。';
  if (ED.scope === 'item' && info.from !== 'item') note += '<br>動一下就變成專屬位置。';
  $('fromNote').innerHTML = note;
  const pl = effective();
  const set = (id, v) => { if (document.activeElement !== $(id)) $(id).value = v; };
  set('fx', pl.x ?? ''); set('fy', pl.y ?? ''); set('fscale', pl.scale || 1); set('frot', pl.rot || 0);
  renderLayer(acc);
  $('fbehind').checked = !!pl.behind; $('fhidden').checked = !!pl.hidden; $('fflip').checked = !!pl.flip;
  const side = ED.dir === 'left' || ED.dir === 'right';
  $('mirror').textContent = side ? (ED.dir === 'right' ? '⇋ 鏡射到左側' : '⇋ 鏡射到右側') : '⇋ 左右對調';
  $('mirror').title = side ? '把這一側的位置對稱複製到另一側（X 左右對稱、旋轉相反）' : '把配件移到臉的另一邊：X 左右對稱、旋轉相反、圖片翻面';
  const m = scopeMap(false);
  $('clearDir').disabled = !(m && m[ED.dir]); $('clearChar').disabled = !m; $('copyChars').disabled = !m;
  // 複製給其他配件：只在「配件專屬」時顯示；同系列（同欄位、id 開頭一樣，例如 bow-red／bow-blue）的預設勾起來
  $('copyAccBox').hidden = ED.scope !== 'item';
  $('copyAccFrom').textContent = '「' + acc.name + '」';
  if (ED.copyFor !== acc.id) {
    ED.copyFor = acc.id;
    $('copyAccList').innerHTML = COSTUME_ACCESSORIES.filter(a => a.id !== acc.id).map(a => '<label><input type="checkbox" value="' + a.id + '"' + (a.slot === acc.slot && a.id.split('-')[0] === acc.id.split('-')[0] ? ' checked' : '') + '>' + a.name + '</label>').join('') || '<span>沒有其他配件</span>';
  }
  $('copyAcc').disabled = !COSTUME_PLACEMENT.items[acc.id];
}
function renderAll() { renderLists(); renderBars(); renderPanel(); }
function setDir(d) { ED.dir = d; renderBars(); renderPanel(); }

document.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.tab) { ED.search = ''; $('accSearch').value = ''; setTab(b.dataset.tab); }
  else if (b.dataset.char) { ED.char = b.dataset.char; ED.skin = null; renderAll(); }
  else if (b.dataset.acc) { ED.acc = b.dataset.acc; ED.wear[curAcc().slot] = ED.acc; renderAll(); }
  else if (b.dataset.dir) setDir(b.dataset.dir);
  else if (b.dataset.frame) { ED.frame = Number(b.dataset.frame); ED.play = false; renderBars(); }
  else if ('play' in b.dataset) { ED.play = !ED.play; ED.t0 = performance.now(); renderBars(); }
});
document.addEventListener('change', e => {
  if (e.target.id === 'others') { ED.others = e.target.checked; renderPanel(); }
  else if (e.target.id === 'skinSel') ED.skin = e.target.value;
  else if (e.target.name === 'scope') { ED.scope = e.target.value; renderPanel(); }
});
const numEdit = (id, key) => $(id).addEventListener('input', () => { const v = $(id).value; if (v === '' || isNaN(Number(v))) return; edit(p => { p[key] = Number(v); }); });
numEdit('fx', 'x'); numEdit('fy', 'y'); numEdit('fscale', 'scale'); numEdit('frot', 'rot');
$('fbehind').addEventListener('change', e => edit(p => { p.behind = e.target.checked; }));
$('fhidden').addEventListener('change', e => edit(p => { p.hidden = e.target.checked; }));
$('fflip').addEventListener('change', e => edit(p => { p.flip = e.target.checked; }));
$('mirror').addEventListener('click', () => {
  const src = effective();
  if (ED.dir === 'left' || ED.dir === 'right') {   // 側面：對稱複製到另一側（右側的圖本來就會自動翻面）
    const other = ED.dir === 'left' ? 'right' : 'left';
    edit(p => { Object.assign(p, src, { x: 64 - src.x, rot: src.rot ? -src.rot : 0 }); }, other);
    status('已把' + CE_DIR_NAMES[ED.dir] + '鏡射到' + CE_DIR_NAMES[other] + '。');
  } else {   // 正面、背面：在同一個方向換到另一邊，圖片也翻面
    edit(p => { p.x = 64 - p.x; p.rot = p.rot ? -p.rot : 0; p.flip = !p.flip; });
    status('已把' + CE_DIR_NAMES[ED.dir] + '的配件左右對調。');
  }
});
$('copyAllDirs').addEventListener('click', () => {
  const src = effective();
  for (const d of CE_DIRS) if (d !== ED.dir) edit(p => { p.scale = src.scale || 1; p.rot = src.rot || 0; }, d);
  status('已把縮放、旋轉複製到其他三個方向。');
});
$('accSearch').addEventListener('input', e => { ED.search = e.target.value; renderLists(); });
// 右邊折疊區塊：開合記在這台瀏覽器
const FOLD_KEY = 'tudrc_costume_editor_folds';
const folds = (() => { try { return JSON.parse(localStorage.getItem(FOLD_KEY) || '{}'); } catch (_) { return {}; } })();
document.querySelectorAll('details[data-key]').forEach(d => {
  if (folds[d.dataset.key]) d.open = true;
  d.addEventListener('toggle', () => { folds[d.dataset.key] = d.open; try { localStorage.setItem(FOLD_KEY, JSON.stringify(folds)); } catch (_) {} });
});
$('copyAcc').addEventListener('click', () => {
  const acc = curAcc(), src = COSTUME_PLACEMENT.items[acc.id];
  const targets = [...document.querySelectorAll('#copyAccList input:checked')].map(i => ACC_BY_ID[i.value]).filter(Boolean);
  if (!src) { status('「' + acc.name + '」還沒有專屬位置可以複製。', true); return; }
  if (!targets.length) { status('先勾選要複製給哪些配件。', true); return; }
  if (!confirm('把「' + acc.name + '」在所有角色的專屬位置，複製給「' + targets.map(a => a.name).join('」「') + '」？它們原本調好的會被蓋掉。')) return;
  for (const a of targets) COSTUME_PLACEMENT.items[a.id] = JSON.parse(JSON.stringify(src));
  saveDraft(); renderAll();
  status('已複製給' + targets.map(a => a.name).join('、') + '。記得存到專案。');
});
$('copyChars').addEventListener('click', () => {
  const m = scopeMap(false), acc = curAcc(); if (!m) return;
  const what = ED.scope === 'item' ? '「' + acc.name + '」的專屬位置' : SLOT_NAME[acc.slot] + '預設位置';
  if (!confirm('把' + CHARACTERS[ED.char].name + '的' + what + '（四個方向）複製給所有角色？其他角色原本調好的會被蓋掉。\n（會自動加上每個角色的身高偏移）')) return;
  const srcOff = costumeCharOffset(ED.char);
  for (const ch of ceChars) {
    if (ch.id === ED.char) continue;
    const copy = JSON.parse(JSON.stringify(m));
    const off = costumeCharOffset(ch.id), dx = off.x - srcOff.x, dy = off.y - srcOff.y;   // 身高偏移的差：矮的角色自動往下
    for (const d of Object.keys(copy)) { const p = copy[d]; if (!p) continue; if (typeof p.x === 'number') p.x += dx; if (typeof p.y === 'number') p.y += dy; }
    if (ED.scope === 'item') (COSTUME_PLACEMENT.items[acc.id] = COSTUME_PLACEMENT.items[acc.id] || {})[ch.id] = copy;
    else (COSTUME_PLACEMENT.anchors[ch.id] = COSTUME_PLACEMENT.anchors[ch.id] || {})[acc.slot] = copy;
  }
  saveDraft(); renderAll(); status('已複製給所有角色（已加上各角色的身高偏移），記得檢查一下。');
});
$('clearDir').addEventListener('click', () => { const m = scopeMap(false); if (m) delete m[ED.dir]; saveDraft(); renderAll(); });
$('clearChar').addEventListener('click', () => {
  if (!confirm('清除這個角色四個方向的設定？')) return;
  const acc = curAcc();
  if (ED.scope === 'item') { if (COSTUME_PLACEMENT.items[acc.id]) delete COSTUME_PLACEMENT.items[acc.id][ED.char]; }
  else if (COSTUME_PLACEMENT.anchors[ED.char]) delete COSTUME_PLACEMENT.anchors[ED.char][acc.slot];
  saveDraft(); renderAll();
});

// ---- 拖曳、滾輪、鍵盤 ----
let drag = null;
stage.addEventListener('pointerdown', e => {
  if (!curAcc()) return;
  const pl = effective(), r = stage.getBoundingClientRect();
  drag = { x: e.clientX, y: e.clientY, px: pl.x ?? 32, py: pl.y ?? 16, k: CE_SIZE / r.width };
  stage.setPointerCapture(e.pointerId);
});
stage.addEventListener('pointermove', e => {
  if (!drag) return;
  const nx = drag.px + (e.clientX - drag.x) * drag.k / (CE_ZOOM * viewZoom), ny = drag.py + (e.clientY - drag.y) * drag.k / (CE_ZOOM * viewZoom);   // 預覽縮放過也照樣跟著游標
  const pl = effective();
  if (Math.round(nx * 2) / 2 !== pl.x || Math.round(ny * 2) / 2 !== pl.y) edit(p => { p.x = nx; p.y = ny; });
});
const endDrag = () => { drag = null; };
stage.addEventListener('pointerup', endDrag); stage.addEventListener('pointercancel', endDrag);
stage.addEventListener('wheel', e => {
  if (e.altKey) { e.preventDefault(); setViewZoom(viewZoom + (e.deltaY < 0 ? VIEW_STEP : -VIEW_STEP)); return; }   // Alt＋滾輪：整體預覽縮放（不改配件）
  if (!curAcc()) return; e.preventDefault(); edit(p => { p.scale = (p.scale || 1) + (e.deltaY < 0 ? 0.05 : -0.05); });
}, { passive: false });
document.getElementById('viewZoomOut').addEventListener('click', () => setViewZoom(viewZoom - VIEW_STEP));
document.getElementById('viewZoomIn').addEventListener('click', () => setViewZoom(viewZoom + VIEW_STEP));
document.getElementById('viewZoomReset').addEventListener('click', () => setViewZoom(1));
document.addEventListener('keydown', e => {
  if (/^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement && document.activeElement.tagName) || e.ctrlKey || e.metaKey || e.altKey) return;
  const step = e.shiftKey ? 0.5 : 1, moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
  if (moves[e.key]) { e.preventDefault(); edit(p => { p.x += moves[e.key][0]; p.y += moves[e.key][1]; }); }
  else if (e.key === 'q' || e.key === 'Q') edit(p => { p.rot = (p.rot || 0) - (e.shiftKey ? 1 : 5); });
  else if (e.key === 'e' || e.key === 'E') edit(p => { p.rot = (p.rot || 0) + (e.shiftKey ? 1 : 5); });
  else if (e.key === '+' || e.key === '=') edit(p => { p.scale = (p.scale || 1) + 0.05; });
  else if (e.key === '-' || e.key === '_') edit(p => { p.scale = (p.scale || 1) - 0.05; });
  else if (/^[1-4]$/.test(e.key)) setDir(CE_DIRS[Number(e.key) - 1]);
  else if (e.key === ' ') { e.preventDefault(); ED.play = !ED.play; ED.t0 = performance.now(); renderBars(); }
});

// ---- 走路時頭的位移 ----
function setBob(id, dir, bob) {
  const all = COSTUME_PLACEMENT.bob[id] = COSTUME_PLACEMENT.bob[id] || {};
  if (bob.every(([x, y]) => !x && !y)) delete all[dir]; else all[dir] = bob;
}
['b1x', 'b1y', 'b2x', 'b2y'].forEach(id => $(id).addEventListener('input', () => {
  const n = k => Math.round(Number($(k).value) || 0);
  setBob(ED.char, ED.dir, [[n('b1x'), n('b1y')], [n('b2x'), n('b2y')]]); saveDraft();
}));
// 自動偵測：拿走路圖的上半部（頭）和站立圖比，找最吻合的位移；差很多（例如頭轉向）就當作沒動
function ceAlpha(img) {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const x = c.getContext('2d'); x.drawImage(img, 0, 0, 64, 64);
  const d = x.getImageData(0, 0, 64, 64).data, a = new Uint8Array(4096);   // file:// 開的頁面這裡會丟錯
  for (let i = 0; i < 4096; i++) a[i] = d[i * 4 + 3] > 0 ? 1 : 0;
  return a;
}
function detectShift(a0, a1) {
  let top = 0; while (top < 63 && !a0.slice(top * 64, top * 64 + 64).some(Boolean)) top++;
  const y0 = top, y1 = Math.min(64, top + 20);
  const score = (dx, dy) => { let s = 0; for (let y = y0; y < y1; y++) for (let x = 0; x < 64; x++) { const sy = y - dy, sx = x - dx; const v = sy >= 0 && sy < 64 && sx >= 0 && sx < 64 ? a0[sy * 64 + sx] : 0; if (v !== a1[y * 64 + x]) s++; } return s; };
  const zero = score(0, 0); let best = [zero, 0, 0];
  for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const s = score(dx, dy); if (s < best[0]) best = [s, dx, dy]; }
  if (zero - best[0] < 4 || best[0] > 30) return [0, 0];   // 改善很少或還是差很多：不算位移
  return [best[1], best[2]];
}
async function detectBob(id) {
  const set = ceSet(CHARACTERS[id].sprite);
  await Promise.all(CE_DIRS.flatMap(d => set[d]).map(img => img.complete ? null : new Promise(r => { img.onload = img.onerror = r; })));
  for (const d of CE_DIRS) {
    const f = set[d]; if (!f.every(ceReady)) continue;
    const a0 = ceAlpha(f[0]);
    setBob(id, d, [detectShift(a0, ceAlpha(f[1])), detectShift(a0, ceAlpha(f[2]))]);
  }
}
async function runDetect(ids) {
  try { for (const id of ids) await detectBob(id); saveDraft(); renderAll(); status('已偵測 ' + ids.length + ' 個角色走路時頭的位移，請在下面四個小圖確認。'); }
  catch (e) { status(e && e.name === 'SecurityError' ? '直接雙擊打開的編輯器（file://）不能讀圖片像素，請用本機伺服器打開，或手動填位移。' : '偵測失敗：' + (e && e.message || e), true); }
}
// ---- 身高偏移自動偵測：比較每個角色正面站立圖「頭頂」的高度，跟基準角色（溫特）差幾 px 就是 Y 偏移 ----
// 頭頂＝從上往下第一排有 OFF_DETECT.minPx 個以上不透明像素的地方（避開一兩根翹起來的呆毛）。X 偏移不動（手動調的照樣保留）。
const OFF_DETECT = { base: 'winter', minPx: 4 };
function headTopRow(a) {
  for (let y = 0; y < 64; y++) { let n = 0; for (let x = 0; x < 64; x++) n += a[y * 64 + x]; if (n >= OFF_DETECT.minPx) return y; }
  return null;
}
async function frontHeadTop(id) {
  const img = ceSet(CHARACTERS[id].sprite).front[0];
  if (!img.complete) await new Promise(r => { img.onload = img.onerror = r; });
  return ceReady(img) ? headTopRow(ceAlpha(img)) : null;
}
async function runOffsetDetect(ids) {
  try {
    const baseId = CHARACTERS[OFF_DETECT.base] ? OFF_DETECT.base : ceChars[0].id, baseTop = await frontHeadTop(baseId);
    if (baseTop == null) { status('讀不到' + CHARACTERS[baseId].name + '的圖片，沒辦法偵測。', true); return; }
    const done = [];
    COSTUME_PLACEMENT.offsets = COSTUME_PLACEMENT.offsets || {};
    for (const id of ids) {
      const top = await frontHeadTop(id); if (top == null) continue;
      const old = costumeCharOffset(id), y = id === baseId ? 0 : top - baseTop;
      COSTUME_PLACEMENT.offsets[id] = { x: old.x, y };
      done.push(CHARACTERS[id].name + (y ? (y > 0 ? ' +' : ' ') + y : ' 0'));
    }
    saveDraft(); renderAll();
    status('已偵測身高偏移（以' + CHARACTERS[baseId].name + '為基準）：' + done.join('、') + '。');
  } catch (e) { status(e && e.name === 'SecurityError' ? '直接雙擊打開的編輯器（file://）不能讀圖片像素，請用本機伺服器打開，或手動填偏移。' : '偵測失敗：' + (e && e.message || e), true); }
}
$('offAuto').addEventListener('click', () => runOffsetDetect([ED.char]));
$('offAutoAll').addEventListener('click', () => runOffsetDetect(ceChars.map(c => c.id)));
$('bobAuto').addEventListener('click', () => runDetect([ED.char]));
$('bobAutoAll').addEventListener('click', () => runDetect(ceChars.map(c => c.id)));

// ---- 存檔 ----
$('previewGame').addEventListener('click', () => { saveDraft(); window.open('塔防原型.html?previewCostumes=1', 'costume_preview'); });
$('exportFile').addEventListener('click', () => {
  const url = URL.createObjectURL(new Blob([costumePlacementText()], { type: 'text/javascript' }));
  const link = document.createElement('a'); link.href = url; link.download = 'costume-placement.js'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  status('已下載 costume-placement.js，放到 data/ 取代舊檔。');
});
$('resetFile').addEventListener('click', () => {
  if (!confirm('丟掉瀏覽器裡的編輯，改用 data/costume-placement.js 的內容？')) return;
  try { localStorage.removeItem(COSTUME_PLACEMENT_KEY); } catch (_) {}
  DraftSync.forget(COSTUME_PLACEMENT_KEY); loadDraft(true); renderAll(); status('已從檔案重新載入。');
});

renderAll();
requestAnimationFrame(loop);

// ---- 角色身高偏移：比較矮／高的角色，配件整體要往下／往上幾 px ----
for (const id of ['offx', 'offy']) $(id).addEventListener('input', () => {
  const x = Number($('offx').value) || 0, y = Number($('offy').value) || 0;
  COSTUME_PLACEMENT.offsets = COSTUME_PLACEMENT.offsets || {};
  COSTUME_PLACEMENT.offsets[ED.char] = { x, y };
  saveDraft(); renderAll();
});

// ---- 圖層：同時戴好幾個配件時誰蓋誰（所有角色、所有方向共用）----
function renderLayer(acc) {
  const v = (COSTUME_PLACEMENT.layers || {})[acc.id];
  if (document.activeElement !== $('flayer')) $('flayer').value = accLayer(acc);
  $('layerReset').disabled = v == null;
  $('layerNote').textContent = v == null ? accLayer(acc) + '（預設）' : accLayer(acc) + '（預設 ' + accLayerDefault(acc) + '）';
  // 現在預覽身上戴的配件，由上（蓋在最上面）往下列
  const worn = wornAccs().slice().reverse();
  $('layerOrder').innerHTML = worn.length > 1 ? '由上到下：' + worn.map(a => '<b' + (a === acc ? ' class="me"' : '') + '>' + a.name + '（' + accLayer(a) + '）</b>').join(' ＞ ') : '勾「一起戴上其他配件」再點其他分頁的配件，可以看誰蓋誰。';
}
function setLayer(n) {
  const acc = curAcc(); if (!acc) return;
  const all = COSTUME_PLACEMENT.layers = COSTUME_PLACEMENT.layers || {};
  if (n == null || n === accLayerDefault(acc)) delete all[acc.id]; else all[acc.id] = n;
  saveDraft(); renderPanel();
}
$('flayer').addEventListener('input', () => { const v = $('flayer').value; if (v === '' || isNaN(Number(v))) return; setLayer(Number(v)); });
$('layerUp').addEventListener('click', () => { const acc = curAcc(); if (acc) setLayer(accLayer(acc) + 1); });
$('layerDown').addEventListener('click', () => { const acc = curAcc(); if (acc) setLayer(accLayer(acc) - 1); });
$('layerReset').addEventListener('click', () => setLayer(null));

// ---- 這個角色不能擁有這個配件（例如球球是狗，不能戴眼鏡）----
$('fblock').addEventListener('change', e => {
  const acc = curAcc(); if (!acc) return;
  const all = COSTUME_PLACEMENT.blocked = COSTUME_PLACEMENT.blocked || {};
  const list = (all[acc.id] || []).filter(id => id !== ED.char);
  if (e.target.checked) list.push(ED.char);
  all[acc.id] = list;
  saveDraft(); renderAll();
  status(e.target.checked ? CHARACTERS[ED.char].name + '不能擁有「' + acc.name + '」了：遊戲裡的衣櫃不會列出、不能送給他，身上有也不會顯示。' : CHARACTERS[ED.char].name + '又可以擁有「' + acc.name + '」了。');
});
