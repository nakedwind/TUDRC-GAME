/* ===== 地圖編輯器 — 核心程式（圖層 + 大圖 + 圖片效果分離）=====
   圖片分兩層：🟫 地板層(floor) 在底、✨ 裝飾層(deco) 疊在上面(透明處透出地板)。
   另有多格大圖(stamps)疊最上面。以上都只是外觀。
   遊戲效果獨立標記：🧱 不可穿透(solid) / 💥 可破壞(breakable)。
   還可標怪物入口、營地，設定規則，Ctrl+Z 回復，自動存檔、可匯出。
   格線設定在 js/config.js；資料格式見 data/maps.js。
*/

const cv = document.getElementById('cv');
const ctx = cv.getContext('2d');
ctx.imageSmoothingEnabled = false;   // 像素圖不要模糊
const STORAGE_MAPS = 'tudrc_maps_v1';
const STORAGE_TILES = 'tudrc_tiles_v1';

// ---- UI 按鈕回饋 ----
const buttonSound = new Audio('music/Sound effects/按紐.mp3');
buttonSound.preload = 'auto';
buttonSound.volume = 0.55;
const mapClickSound = new Audio('music/Sound effects/對話框下一頁音效.mp3');
mapClickSound.preload = 'auto';
mapClickSound.volume = 0.55;

function playButtonSound() {
  buttonSound.currentTime = 0;
  buttonSound.play().catch(() => {});
}

function playMapClickSound() {
  mapClickSound.currentTime = 0;
  mapClickSound.play().catch(() => {});
}

function bounceButton(el) {
  el.classList.remove('ui-bounce');
  void el.offsetWidth;
  el.classList.add('ui-bounce');
}

let pressedControl = null;
document.addEventListener('pointerdown', e => {
  const control = e.target.closest('button, .tile');
  if (!control || control.disabled) return;
  pressedControl = control;
  control.classList.add('ui-pressing');
  playButtonSound();
});
document.addEventListener('pointerup', () => {
  if (!pressedControl) return;
  pressedControl.classList.remove('ui-pressing');
  bounceButton(pressedControl);
  pressedControl = null;
});
document.addEventListener('pointercancel', () => {
  if (!pressedControl) return;
  pressedControl.classList.remove('ui-pressing');
  pressedControl = null;
});
document.addEventListener('click', e => {
  const control = e.target.closest('button, .tile');
  if (!control || control.disabled || e.detail !== 0) return;
  playButtonSound();
  bounceButton(control);
});
document.addEventListener('animationend', e => {
  if (e.animationName === 'ui-button-bounce') e.target.classList.remove('ui-bounce');
});

// ---- 小工具 ----
const clone = (o) => JSON.parse(JSON.stringify(o));
const removeFrom = (arr, key) => { const i = arr.indexOf(key); if (i >= 0) arr.splice(i, 1); };
const toggle = (arr, key) => { const i = arr.indexOf(key); if (i >= 0) arr.splice(i, 1); else arr.push(key); };
const roleLabel = (r) => ({ floor: '地板', wall: '牆', obstacle: '障礙物' })[r] || r;
const tileW = (t) => (t && t.w) || 1;
const tileH = (t) => (t && t.h) || 1;
const isBig = (t) => tileW(t) > 1 || tileH(t) > 1;

// ---- 圖層（由底到上；要加減層改這裡即可）----
const LAYERS = [
  { id: 'floor', name: '🟫 地板' },
  { id: 'ground', name: '🌿 地面裝飾' },
  { id: 'object', name: '📦 物件' },
  { id: 'overlay', name: '🎯 物件裝飾' },
  { id: 'top', name: '☁️ 上層' },
];
const layerName = (id) => (LAYERS.find(l => l.id === id) || {}).name || id;
const emptyLayers = () => { const o = {}; LAYERS.forEach(l => o[l.id] = {}); return o; };

// ---- 內建磚塊（純圖片；牆/障礙先用色塊當佔位圖）----
const BUILTIN_TILES = [
  { id: 'floor', name: '地板', role: 'floor', file: 'background/Back-room-floor.png', w: 1, h: 1, builtin: true },
  { id: 'wall', name: '牆(灰)', role: 'wall', file: null, w: 1, h: 1, builtin: true },
  { id: 'obstacle', name: '障礙(棕)', role: 'obstacle', file: null, w: 1, h: 1, builtin: true },
];

// 預設入口＝最上排；預設營地＝最下兩排
function defEntrances() { const a = []; for (let c = 0; c < COLS; c++) a.push(c + ',' + SPAWN_ROW); return a; }
function defCamp() { const a = []; for (let c = 0; c < COLS; c++) { a.push(c + ',' + (ROWS - 2)); a.push(c + ',' + (ROWS - 1)); } return a; }
const effEntrances = (m) => new Set(m.entrances.length ? m.entrances : defEntrances());
const effCamp = (m) => new Set(m.camp.length ? m.camp : defCamp());

// ================= 資料 =================
let maps, curId, customTiles = [], brush = { mode: 'tile', tile: 'floor' }, activeLayer = 'floor';
let checkResult = null, hoverCell = null, painting = false, lastPaint = '', selection = null, selections = [];
let selectionDrag = null;
const hiddenLayers = new Set();

const palette = () => BUILTIN_TILES.concat(customTiles);
const tileById = (id) => palette().find(t => t.id === id);
const wallCells = (m) => new Set(m.solid);   // 只有「不可穿透」才擋路

function loadTiles() {
  const saved = localStorage.getItem(STORAGE_TILES);
  if (saved) { try { customTiles = JSON.parse(saved); } catch (e) { customTiles = clone(TILES_CUSTOM); } }
  else customTiles = clone(TILES_CUSTOM);
  if (!Array.isArray(customTiles)) customTiles = [];
  customTiles.forEach(t => { t.w = t.w || 1; t.h = t.h || 1; });
}
function saveTiles() { localStorage.setItem(STORAGE_TILES, JSON.stringify(customTiles)); }

function loadMaps() {
  const saved = localStorage.getItem(STORAGE_MAPS);
  if (saved) { try { maps = JSON.parse(saved); } catch (e) { maps = clone(MAPS_DEFAULT); } }
  else maps = clone(MAPS_DEFAULT);
  if (!Array.isArray(maps) || maps.length === 0) maps = clone(MAPS_DEFAULT);
  maps.forEach(fixMap);
  curId = maps[0].id;
}
// 補齊欄位；把舊格式一次性遷移（tiles平面→layers.floor；walls→solid）
function fixMap(m) {
  if (!m.layers) { m.layers = {}; if (m.tiles) m.layers.floor = m.tiles; }
  if (m.layers.deco) { m.layers.object = Object.assign({}, m.layers.object || {}, m.layers.deco); delete m.layers.deco; }  // 舊「裝飾層」併入「物件」
  LAYERS.forEach(l => { m.layers[l.id] = m.layers[l.id] || {}; });
  delete m.tiles;
  m.stamps = m.stamps || [];
  m.stamps.forEach(s => { if (!s.layer) s.layer = 'top'; });   // 舊大圖預設在最上層
  if (!m.solid) {
    m.solid = []; m.breakable = [];
    if (Array.isArray(m.walls)) m.walls.forEach(k => m.solid.push(k));
    for (const k in m.layers.floor) {
      const t = tileById(m.layers.floor[k]);
      if (t && t.role === 'wall' && m.solid.indexOf(k) < 0) m.solid.push(k);
      if (t && t.role === 'obstacle' && m.breakable.indexOf(k) < 0) m.breakable.push(k);
    }
  }
  m.breakable = m.breakable || [];
  delete m.walls;
  m.entrances = m.entrances || []; m.camp = m.camp || [];
  m.rules = Object.assign({
    money: 150, lives: 12, guide: 100, guideRegen: 9, waves: 5,
    count: 8, countAdd: 3, hp: 40, hpAdd: 28, speed: 44, speedAdd: 5,
    gap: 0.85, gapSub: 0.05, reward: 8,
  }, m.rules || {});
  m.name = m.name || '未命名地圖'; m.desc = m.desc || '';
  return m;
}
function saveMaps() { localStorage.setItem(STORAGE_MAPS, JSON.stringify(maps)); setStatus('已自動存檔 ✓', '#7ee0c0'); }
const curMap = () => maps.find(m => m.id === curId) || maps[0];

function setStatus(text, color) { const el = document.getElementById('status'); el.textContent = text; el.style.color = color || '#7ee0c0'; }

// ================= 回復（Undo / Ctrl+Z）=================
let undoStack = [];
function snapshot() { return JSON.stringify({ maps, tiles: customTiles, curId }); }
function pushUndo() { undoStack.push(snapshot()); if (undoStack.length > 60) undoStack.shift(); }
function undo() {
  if (!undoStack.length) { setStatus('沒有可回復的步驟了', '#9aa4b2'); return; }
  const s = JSON.parse(undoStack.pop());
  maps = s.maps; customTiles = s.tiles; curId = s.curId;
  selection = null; selections = [];
  if (!maps.find(m => m.id === curId)) curId = maps[0].id;
  if (!tileById(brush.tile)) brush = { mode: brush.mode, tile: 'floor' };
  localStorage.setItem(STORAGE_MAPS, JSON.stringify(maps));
  localStorage.setItem(STORAGE_TILES, JSON.stringify(customTiles));
  checkResult = null;
  refreshMapSelect(); renderPalette(); loadRules(); draw();
  setStatus('已回復上一步（還剩 ' + undoStack.length + ' 步可回復）', '#7ee0c0');
}
window.addEventListener('keydown', e => {
  const inField = /^(input|textarea)$/i.test(e.target.tagName || '');
  if ((e.ctrlKey || e.metaKey) && !e.shiftKey && (e.key === 'z' || e.key === 'Z')) { if (inField) return; e.preventDefault(); undo(); }
  if (e.key === 'Delete' && !inField && selections.length) { e.preventDefault(); deleteSelection(); }
});

// ================= 磚塊圖片載入 =================
const tileImgCache = {};
function ensureTileImg(t) {
  if (!t.file) return null;
  if (tileImgCache[t.id]) return tileImgCache[t.id];
  const img = new Image(); const rec = { img, loaded: false, error: false };
  img.onload = () => { rec.loaded = true; draw(); renderPalette(); };
  img.onerror = () => { rec.error = true; };
  img.src = t.file;
  tileImgCache[t.id] = rec; return rec;
}
function preloadTiles() { palette().forEach(t => { if (t.file) ensureTileImg(t); }); }

function roundRect(x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
// 格子底：淡棋盤格，代表透明；圖片透明處會露出棋盤而非黑色
function drawCellBase(x, y) {
  const s = CELL / 2;
  ctx.fillStyle = '#171c24'; ctx.fillRect(x, y, CELL, CELL);
  ctx.fillStyle = '#12161d'; ctx.fillRect(x, y, s, s); ctx.fillRect(x + s, y + s, s, s);
}
// 畫 1×1 小圖（有圖用圖，沒圖用色塊佔位）
function drawTile(id, x, y) {
  const t = tileById(id);
  if (!t) return;
  if (t.file) { const rec = ensureTileImg(t); if (rec && rec.loaded) { ctx.drawImage(rec.img, x, y, CELL, CELL); return; } }
  if (t.role === 'wall') {
    ctx.fillStyle = '#3f434b'; ctx.fillRect(x + 2, y + 2, CELL - 4, CELL - 4);
    ctx.strokeStyle = '#565b64'; ctx.lineWidth = 2; ctx.strokeRect(x + 5, y + 5, CELL - 10, CELL - 10);
  } else if (t.role === 'obstacle') {
    ctx.fillStyle = '#7a5a3a'; roundRect(x + 4, y + 4, CELL - 8, CELL - 8, 5); ctx.fill();
    ctx.strokeStyle = '#5a4128'; ctx.lineWidth = 2; ctx.stroke();
  } else { ctx.fillStyle = '#20262f'; ctx.fillRect(x, y, CELL, CELL); }
}
// 畫多格大圖
function drawStamp(s) {
  const t = tileById(s.id); if (!t) return;
  const x = OX + s.c * CELL, y = OY + s.r * CELL, w = tileW(t) * CELL, h = tileH(t) * CELL;
  if (t.file) { const rec = ensureTileImg(t); if (rec && rec.loaded) { ctx.drawImage(rec.img, x, y, w, h); return; } }
  ctx.fillStyle = t.role === 'wall' ? '#3f434b' : (t.role === 'obstacle' ? '#7a5a3a' : '#2b3446');
  ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
  ctx.strokeStyle = '#8fd3ff'; ctx.lineWidth = 1; ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);
  ctx.fillStyle = '#c3ccd8'; ctx.font = '11px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(t.name, x + w / 2, y + h / 2);
}

// ================= 畫布繪製 =================
function draw() {
  const m = curMap();
  const ent = effEntrances(m), camp = effCamp(m);
  const solid = new Set(m.solid), breakable = new Set(m.breakable);
  const entIsDefault = m.entrances.length === 0, campIsDefault = m.camp.length === 0;

  ctx.clearRect(0, 0, cv.width, cv.height);
  // 每格先鋪棋盤底
  for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++) drawCellBase(OX + c * CELL, OY + r * CELL);
  // 由下往上：每層先畫小圖、再畫「屬於這層」的大圖
  for (const l of LAYERS) {
    if (hiddenLayers.has(l.id)) continue;
    for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++) { const id = m.layers[l.id][c + ',' + r]; if (id) drawTile(id, OX + c * CELL, OY + r * CELL); }
    for (const s of m.stamps) if ((s.layer || 'top') === l.id) drawStamp(s);
  }
  // 效果層 + 格線（畫在圖片之上）
  for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++) {
    const x = OX + c * CELL, y = OY + r * CELL, key = c + ',' + r;
    if (solid.has(key)) {
      ctx.fillStyle = 'rgba(200,50,50,.30)'; ctx.fillRect(x, y, CELL, CELL);
      ctx.strokeStyle = '#ff5b5b'; ctx.lineWidth = 2; ctx.strokeRect(x + 2.5, y + 2.5, CELL - 5, CELL - 5);
    }
    if (breakable.has(key)) {
      ctx.fillStyle = 'rgba(230,150,40,.26)'; ctx.fillRect(x, y, CELL, CELL);
      ctx.strokeStyle = '#ffb84d'; ctx.lineWidth = 2; ctx.setLineDash([5, 4]);
      ctx.strokeRect(x + 3, y + 3, CELL - 6, CELL - 6); ctx.setLineDash([]);
    }
    if (ent.has(key)) { ctx.fillStyle = entIsDefault ? 'rgba(210,60,90,.22)' : 'rgba(210,60,90,.45)'; ctx.fillRect(x, y, CELL, CELL); }
    if (camp.has(key)) { ctx.fillStyle = campIsDefault ? 'rgba(40,180,120,.18)' : 'rgba(40,180,120,.42)'; ctx.fillRect(x, y, CELL, CELL); }
    if (checkResult && checkResult.unreachable.has(key)) { ctx.fillStyle = 'rgba(255,80,80,.28)'; ctx.fillRect(x, y, CELL, CELL); }
    ctx.strokeStyle = 'rgba(255,255,255,.06)'; ctx.lineWidth = 1; ctx.strokeRect(x + .5, y + .5, CELL, CELL);
  }
  if (checkResult) {
    ctx.strokeStyle = '#ffd24a'; ctx.lineWidth = 3;
    checkResult.badEntrances.forEach(key => { const [c, r] = key.split(',').map(Number); ctx.strokeRect(OX + c * CELL + 2, OY + r * CELL + 2, CELL - 4, CELL - 4); });
  }
  ctx.fillStyle = '#e79'; ctx.font = '13px sans-serif'; ctx.textAlign = 'left';
  ctx.fillText('🔻 怪物入口' + (entIsDefault ? '（預設：最上排）' : ''), OX + 6, OY + 16);
  ctx.fillStyle = '#5ec89f'; ctx.textAlign = 'right';
  ctx.fillText('🏠 營地' + (campIsDefault ? '（預設：最下兩排）' : ''), OX + COLS * CELL - 6, OY + ROWS * CELL - 8);
  // 懸停：大圖顯示範圍，小圖顯示單格
  if (hoverCell) {
    const [c, r] = hoverCell;
    const sel = brush.mode === 'tile' ? tileById(brush.tile) : null;
    if (sel && isBig(sel)) {
      const w = tileW(sel), h = tileH(sel), fits = c + w <= COLS && r + h <= ROWS;
      ctx.strokeStyle = fits ? '#8fd3ff' : '#ff5b5b'; ctx.lineWidth = 2; ctx.setLineDash([6, 4]);
      ctx.strokeRect(OX + c * CELL + 1, OY + r * CELL + 1, w * CELL - 2, h * CELL - 2); ctx.setLineDash([]);
    } else {
      ctx.strokeStyle = '#8fd3ff'; ctx.lineWidth = 2; ctx.strokeRect(OX + c * CELL + 1, OY + r * CELL + 1, CELL - 2, CELL - 2);
    }
  }
  // 選取高亮（黃色虛線框）
  for (const selected of selections) {
    let rx = null, ry = 0, rw = CELL, rh = CELL;
    if (selected.type === 'stamp') { const s = m.stamps[selected.index]; if (s) { const t = tileById(s.id) || {}; rx = OX + s.c * CELL; ry = OY + s.r * CELL; rw = tileW(t) * CELL; rh = tileH(t) * CELL; } }
    else { const [c, r] = selected.key.split(',').map(Number); rx = OX + c * CELL; ry = OY + r * CELL; }
    if (rx != null) { ctx.strokeStyle = '#ffe14d'; ctx.lineWidth = 3; ctx.setLineDash([7, 4]); ctx.strokeRect(rx + 1.5, ry + 1.5, rw - 3, rh - 3); ctx.setLineDash([]); }
  }
}

// ================= 大圖放置 / 查詢 =================
function placeStamp(c, r, t) {
  const m = curMap(), w = tileW(t), h = tileH(t);
  if (c + w > COLS || r + h > ROWS) { setStatus('放不下：超出地圖邊界', '#ff8f8f'); return; }
  // 只移除「同一圖層」上重疊的大圖（不同層可疊放）
  m.stamps = m.stamps.filter(s => {
    if ((s.layer || 'top') !== activeLayer) return true;
    const st = tileById(s.id) || {}, sw = tileW(st), sh = tileH(st);
    const overlap = !(c + w <= s.c || s.c + sw <= c || r + h <= s.r || s.r + sh <= r);
    return !overlap;
  });
  m.stamps.push({ id: t.id, c, r, layer: activeLayer });
  checkResult = null; saveMaps(); draw();
}
function stampIndexAt(m, c, r) {
  for (let i = m.stamps.length - 1; i >= 0; i--) {
    const s = m.stamps[i], t = tileById(s.id) || {};
    if (c >= s.c && c < s.c + tileW(t) && r >= s.r && r < s.r + tileH(t)) return i;
  }
  return -1;
}

// ================= 畫格子（依目前畫筆）=================
function paintCell(c, r, isDown, additiveSelect = false) {
  if (!inGrid(c, r)) return;
  const m = curMap(), key = c + ',' + r;
  if (brush.mode === 'select') {
    if (isDown) {
      let picked = null;
      const si = stampIndexAt(m, c, r);
      if (si >= 0) picked = { type: 'stamp', index: si };
      else for (let i = LAYERS.length - 1; i >= 0; i--) { const id = LAYERS[i].id; if (m.layers[id][key]) { picked = { type: 'tile', layer: id, key }; break; } }
      if (!additiveSelect) {
        const alreadySelected = picked && selections.some(s => selectionId(s) === selectionId(picked));
        if (!alreadySelected) selections = picked ? [picked] : [];
      }
      else if (picked) {
        const id = selectionId(picked), existing = selections.findIndex(s => selectionId(s) === id);
        if (existing >= 0) selections.splice(existing, 1); else selections.push(picked);
      }
      selection = selections.length ? selections[selections.length - 1] : null;
      if (!picked) setStatus('這格沒有可選的物件', '#9aa4b2');
      else setStatus('已選取 ' + selections.length + ' 個物件' + (additiveSelect ? '（Shift 多選）' : ''), '#ffd479');
      refreshSelPanel(); draw();
    }
    return;
  }
  checkResult = null;
  if (brush.mode === 'tile') {
    const t = tileById(brush.tile); if (!t) return;
    if (isBig(t)) { if (isDown) placeStamp(c, r, t); return; }   // 大圖：只在按下時放一張
    m.layers[activeLayer][key] = brush.tile;                      // 小圖：貼到目前圖層
  } else if (brush.mode === 'solid') {
    if (effEntrances(m).has(key) || effCamp(m).has(key)) { setStatus('入口／營地上不能設不可穿透', '#ff8f8f'); return; }
    removeFrom(m.breakable, key); toggle(m.solid, key);
  } else if (brush.mode === 'breakable') {
    if (effEntrances(m).has(key) || effCamp(m).has(key)) { setStatus('入口／營地上不能設可破壞', '#ff8f8f'); return; }
    removeFrom(m.solid, key); toggle(m.breakable, key);
  } else if (brush.mode === 'entrance') {
    if (m.entrances.length === 0) m.entrances = defEntrances();
    removeFrom(m.solid, key); removeFrom(m.breakable, key); toggle(m.entrances, key);
  } else if (brush.mode === 'camp') {
    if (m.camp.length === 0) m.camp = defCamp();
    removeFrom(m.solid, key); removeFrom(m.breakable, key); toggle(m.camp, key);
  } else if (brush.mode === 'erase') {
    // 由上往下擦：大圖 → 最上面有圖的那層
    const si = stampIndexAt(m, c, r);
    if (si >= 0) m.stamps.splice(si, 1);
    else for (let i = LAYERS.length - 1; i >= 0; i--) { const id = LAYERS[i].id; if (m.layers[id][key]) { delete m.layers[id][key]; break; } }
  }
  saveMaps(); draw();
}

// ================= 滑鼠操作 =================
function cellFromEvent(e) {
  const rect = cv.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (cv.width / rect.width);
  const y = (e.clientY - rect.top) * (cv.height / rect.height);
  return cellAt(x, y);
}
function beginSelectionDrag(c, r) {
  if (brush.mode !== 'select' || !selections.length) { selectionDrag = null; return; }
  const m = curMap(), items = [];
  selections.forEach(sel => {
    if (sel.type === 'stamp') {
      const s = m.stamps[sel.index]; if (!s) return;
      const t = tileById(s.id) || {};
      items.push({ type: 'stamp', index: sel.index, c: s.c, r: s.r, w: tileW(t), h: tileH(t) });
    } else {
      const [tc, tr] = sel.key.split(',').map(Number);
      items.push({ type: 'tile', layer: sel.layer, key: sel.key, id: m.layers[sel.layer][sel.key], c: tc, r: tr, w: 1, h: 1 });
    }
  });
  if (!items.length) { selectionDrag = null; return; }
  const minC = Math.min(...items.map(item => item.c)), minR = Math.min(...items.map(item => item.r));
  const maxC = Math.max(...items.map(item => item.c + item.w)), maxR = Math.max(...items.map(item => item.r + item.h));
  selectionDrag = { startC: c, startR: r, items, layers: clone(m.layers), stamps: clone(m.stamps), minC, minR, maxC, maxR, dc: 0, dr: 0, moved: false };
}
function dragSelectionTo(c, r) {
  if (!selectionDrag) return;
  const d = selectionDrag, m = curMap();
  const dc = Math.max(-d.minC, Math.min(COLS - d.maxC, c - d.startC));
  const dr = Math.max(-d.minR, Math.min(ROWS - d.maxR, r - d.startR));
  if (dc === d.dc && dr === d.dr) return;
  d.dc = dc; d.dr = dr; d.moved = dc !== 0 || dr !== 0;
  m.layers = clone(d.layers); m.stamps = clone(d.stamps);
  d.items.filter(item => item.type === 'tile').forEach(item => delete m.layers[item.layer][item.key]);
  selections = d.items.map(item => {
    if (item.type === 'stamp') {
      const s = m.stamps[item.index]; s.c = item.c + dc; s.r = item.r + dr;
      return { type: 'stamp', index: item.index };
    }
    const key = (item.c + dc) + ',' + (item.r + dr);
    m.layers[item.layer][key] = item.id;
    return { type: 'tile', layer: item.layer, key };
  });
  selection = selections[selections.length - 1];
  setStatus('正在移動 ' + selections.length + ' 個物件（' + dc + ', ' + dr + '）', '#8fd3ff');
  draw();
}
cv.addEventListener('pointerdown', e => {
  playMapClickSound(); painting = true; cv.setPointerCapture(e.pointerId); pushUndo();
  const [c, r] = cellFromEvent(e); lastPaint = c + ',' + r; paintCell(c, r, true, e.shiftKey);
  if (!e.shiftKey) beginSelectionDrag(c, r);
});
cv.addEventListener('pointermove', e => {
  const [c, r] = cellFromEvent(e); hoverCell = inGrid(c, r) ? [c, r] : null;
  if (painting) {
    if (selectionDrag) dragSelectionTo(c, r);
    else { const key = c + ',' + r; if (key !== lastPaint) { lastPaint = key; paintCell(c, r, false); } }
  } else draw();
});
cv.addEventListener('pointerup', () => {
  painting = false;
  if (selectionDrag && selectionDrag.moved) { saveMaps(); refreshSelPanel(); setStatus('已移動 ' + selections.length + ' 個物件', '#7ee0c0'); }
  selectionDrag = null;
  if (undoStack.length && undoStack[undoStack.length - 1] === snapshot()) undoStack.pop();
});
cv.addEventListener('pointerleave', () => { hoverCell = null; draw(); });

// ================= 圖層切換（依 LAYERS 動態產生按鈕）=================
const layerBtnsEl = document.getElementById('layerBtns');
function renderLayers() {
  layerBtnsEl.innerHTML = '';
  LAYERS.forEach(l => {
    const group = document.createElement('span'); group.className = 'layer-group';
    const b = document.createElement('button'); b.className = 'layer' + (l.id === activeLayer ? ' sel' : ''); b.textContent = l.name; b.dataset.layer = l.id;
    b.addEventListener('click', () => { activeLayer = l.id; updateLayerUI(); setStatus('目前在「' + l.name + '」上編輯', '#b39ddb'); });
    const eye = document.createElement('button'); eye.className = 'layer-eye'; eye.dataset.layer = l.id;
    eye.addEventListener('click', () => {
      if (hiddenLayers.has(l.id)) hiddenLayers.delete(l.id); else hiddenLayers.add(l.id);
      updateLayerUI(); draw();
      setStatus((hiddenLayers.has(l.id) ? '已隱藏「' : '已顯示「') + l.name + '」', '#8fd3ff');
    });
    group.append(b, eye); layerBtnsEl.appendChild(group);
  });
  updateLayerUI();
}
function updateLayerUI() {
  document.querySelectorAll('.layer').forEach(b => b.classList.toggle('sel', b.dataset.layer === activeLayer));
  document.querySelectorAll('.layer-eye').forEach(eye => {
    const visible = !hiddenLayers.has(eye.dataset.layer);
    const layer = LAYERS.find(l => l.id === eye.dataset.layer);
    eye.textContent = visible ? '👁' : '◌';
    eye.classList.toggle('off', !visible);
    eye.setAttribute('aria-pressed', String(visible));
    eye.setAttribute('aria-label', (visible ? '隱藏' : '顯示') + (layer ? layer.name : '圖層'));
    eye.title = (visible ? '隱藏' : '顯示') + (layer ? layer.name : '圖層');
  });
}

// ================= 調色盤 =================
const paletteEl = document.getElementById('palette');
function renderPalette() {
  paletteEl.innerHTML = '';
  palette().forEach(t => {
    const b = document.createElement('div'); b.className = 'tile' + (brush.mode === 'tile' && brush.tile === t.id ? ' sel' : '');
    let thumb;
    const rec = t.file ? ensureTileImg(t) : null;
    if (t.file && rec && rec.loaded) thumb = '<img class="thumb" src="' + t.file + '">';
    else thumb = '<span class="thumb swatch ' + t.role + '"></span>';
    const sizeTxt = isBig(t) ? (' ' + tileW(t) + '×' + tileH(t)) : '';
    b.innerHTML = thumb + '<span class="tname">' + t.name + '</span><small>' + (t.builtin ? roleLabel(t.role) : '圖片') + sizeTxt + '</small>';
    b.addEventListener('click', () => selectTile(t.id));
    if (!t.builtin) {
      const del = document.createElement('button'); del.className = 'del'; del.textContent = '✕'; del.title = '刪除這塊磚塊';
      del.addEventListener('click', ev => { ev.stopPropagation(); deleteTile(t.id); });
      b.appendChild(del);
    }
    paletteEl.appendChild(b);
  });
}
function selectTile(id) { brush = { mode: 'tile', tile: id }; clearSelection(); updateToolUI(); renderPalette(); }
function deleteTile(id) {
  const t = tileById(id); if (!t || t.builtin) return;
  if (!confirm('刪除磚塊「' + t.name + '」？（已經貼到地圖上的會一起消失）')) return;
  pushUndo();
  customTiles = customTiles.filter(x => x.id !== id); saveTiles();
  maps.forEach(m => {
    LAYERS.forEach(l => { for (const k in m.layers[l.id]) if (m.layers[l.id][k] === id) delete m.layers[l.id][k]; });
    m.stamps = m.stamps.filter(s => s.id !== id);
  });
  saveMaps();
  if (brush.tile === id) selectTile('floor');
  renderPalette(); draw();
}

// 工具按鈕
function updateToolUI() { document.querySelectorAll('.tool').forEach(b => b.classList.toggle('sel', brush.mode === b.dataset.mode)); }
document.querySelectorAll('.tool').forEach(btn => {
  btn.addEventListener('click', () => { brush = { mode: btn.dataset.mode, tile: brush.tile }; if (brush.mode !== 'select') clearSelection(); updateToolUI(); renderPalette(); });
});

// ================= 選取物件・改圖層 =================
function selectionId(sel) { return sel.type === 'stamp' ? 'stamp:' + sel.index : 'tile:' + sel.layer + ':' + sel.key; }
function clearSelection() { selection = null; selections = []; refreshSelPanel(); draw(); }
function selLayerId() {
  if (!selections.length) return null;
  const layers = selections.map(sel => sel.type === 'stamp' ? ((curMap().stamps[sel.index] || {}).layer || 'top') : sel.layer);
  return layers.every(id => id === layers[0]) ? layers[0] : null;
}
function refreshSelPanel() {
  const panel = document.getElementById('selPanel');
  const m = curMap();
  selections = selections.filter(sel => sel.type === 'stamp' ? !!m.stamps[sel.index] : !!(m.layers[sel.layer] && m.layers[sel.layer][sel.key] !== undefined));
  selection = selections.length ? selections[selections.length - 1] : null;
  if (!selection) { panel.classList.add('hidden'); return; }
  if (selections.length > 1) {
    document.getElementById('selName').textContent = selections.length + ' 個物件';
    const sl = document.getElementById('selLayer'); sl.innerHTML = '<option value="">選擇目標圖層</option>';
    LAYERS.forEach(l => { const o = document.createElement('option'); o.value = l.id; o.textContent = l.name; sl.appendChild(o); });
    panel.classList.remove('hidden'); return;
  }
  let name, curLayer;
  if (selection.type === 'stamp') {
    const s = m.stamps[selection.index]; if (!s) { selection = null; panel.classList.add('hidden'); return; }
    const t = tileById(s.id) || {}; name = (t.name || '大圖') + '（大圖 ' + tileW(t) + '×' + tileH(t) + '）'; curLayer = s.layer || 'top';
  } else {
    const id = m.layers[selection.layer] ? m.layers[selection.layer][selection.key] : undefined;
    if (id === undefined) { selection = null; panel.classList.add('hidden'); return; }
    const t = tileById(id) || {}; name = (t.name || '圖') + '（小圖）'; curLayer = selection.layer;
  }
  document.getElementById('selName').textContent = name;
  const sl = document.getElementById('selLayer'); sl.innerHTML = '';
  LAYERS.forEach(l => { const o = document.createElement('option'); o.value = l.id; o.textContent = l.name; if (l.id === curLayer) o.selected = true; sl.appendChild(o); });
  panel.classList.remove('hidden');
}
function moveSelectionToLayer(newLayerId) {
  if (!selections.length || !newLayerId) return;
  pushUndo(); const m = curMap();
  selections = selections.map(sel => {
    if (sel.type === 'stamp') { const s = m.stamps[sel.index]; if (s) s.layer = newLayerId; return sel; }
    const id = m.layers[sel.layer][sel.key]; delete m.layers[sel.layer][sel.key]; m.layers[newLayerId][sel.key] = id;
    return { type: 'tile', layer: newLayerId, key: sel.key };
  });
  selection = selections[selections.length - 1];
  saveMaps(); draw(); refreshSelPanel();
  setStatus('已把 ' + selections.length + ' 個物件移到「' + layerName(newLayerId) + '」', '#7ee0c0');
}
function moveSelBy(d) { const cur = selLayerId(); if (cur == null) { setStatus('不同圖層的多選物件請用圖層選單移動', '#ffd24a'); return; } let i = LAYERS.findIndex(l => l.id === cur); i = Math.max(0, Math.min(LAYERS.length - 1, i + d)); moveSelectionToLayer(LAYERS[i].id); }
function deleteSelection() {
  if (!selections.length) return; pushUndo(); const m = curMap(), count = selections.length;
  selections.filter(sel => sel.type === 'tile').forEach(sel => delete m.layers[sel.layer][sel.key]);
  selections.filter(sel => sel.type === 'stamp').map(sel => sel.index).sort((a, b) => b - a).forEach(index => { if (m.stamps[index]) m.stamps.splice(index, 1); });
  selection = null; selections = []; saveMaps(); draw(); refreshSelPanel(); setStatus('已刪除 ' + count + ' 個選取物件', '#ffd24a');
}
document.getElementById('selLayer').addEventListener('change', e => moveSelectionToLayer(e.target.value));
document.getElementById('selUp').addEventListener('click', () => moveSelBy(1));
document.getElementById('selDown').addEventListener('click', () => moveSelBy(-1));
document.getElementById('selDelete').addEventListener('click', deleteSelection);
document.getElementById('selClear').addEventListener('click', clearSelection);

// 加入磚塊（純圖片，依圖片大小自動猜佔幾格）
const tileFile = document.getElementById('tileFile');
document.getElementById('undoBtn').addEventListener('click', undo);
document.getElementById('addTile').addEventListener('click', () => tileFile.click());
tileFile.addEventListener('change', () => {
  const f = tileFile.files[0]; if (!f) return;
  const path = 'background/' + f.name, nameDefault = f.name.replace(/\.[^.]+$/, '');
  const url = URL.createObjectURL(f), probe = new Image();
  probe.onload = () => { const wS = Math.max(1, Math.round(probe.naturalWidth / CELL)), hS = Math.max(1, Math.round(probe.naturalHeight / CELL)); URL.revokeObjectURL(url); finishAddTile(path, nameDefault, wS, hS); };
  probe.onerror = () => { URL.revokeObjectURL(url); finishAddTile(path, nameDefault, 1, 1); };
  probe.src = url;
  tileFile.value = '';
});
function finishAddTile(path, nameDefault, wS, hS) {
  const name = (prompt('磚塊名稱？（圖片會從 background/ 載入）', nameDefault) || nameDefault).trim();
  const w = Math.max(1, parseInt(prompt('這塊圖佔「幾格寬」？（依圖片大小建議）', wS), 10) || wS);
  const h = Math.max(1, parseInt(prompt('這塊圖佔「幾格高」？', hS), 10) || hS);
  pushUndo();
  const id = 'tile_' + Date.now().toString(36);
  customTiles.push({ id, name, role: 'floor', file: path, w, h });
  saveTiles(); ensureTileImg(customTiles[customTiles.length - 1]);
  selectTile(id);
  setStatus('已加入磚塊「' + name + '」（' + w + '×' + h + ' 格，圖片： ' + path + '）', '#7ee0c0');
}

// 全部填滿（只適用 1×1 小圖，填到目前圖層）
document.getElementById('fillAll').addEventListener('click', () => {
  if (brush.mode !== 'tile') { setStatus('請先在上面選一塊磚塊圖', '#ff8f8f'); return; }
  const t = tileById(brush.tile); if (!t) return;
  if (isBig(t)) { setStatus('「全部填滿」只能用 1×1 的小圖', '#ff8f8f'); return; }
  pushUndo();
  const m = curMap();
  for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++) m.layers[activeLayer][c + ',' + r] = brush.tile;
  saveMaps(); draw(); setStatus('已用「' + t.name + '」填滿「' + layerName(activeLayer) + '」', '#7ee0c0');
});

// ================= 檢查路徑（只看不可穿透）=================
document.getElementById('checkPath').addEventListener('click', () => {
  const m = curMap(), wall = wallCells(m), camp = effCamp(m), ent = effEntrances(m);
  const reachable = new Set(), q = [];
  camp.forEach(key => { if (!wall.has(key)) { reachable.add(key); q.push(key.split(',').map(Number)); } });
  let head = 0;
  while (head < q.length) {
    const [c, r] = q[head++];
    for (const [dc, dr] of [[0, 1], [0, -1], [-1, 0], [1, 0]]) {
      const nc = c + dc, nr = r + dr, key = nc + ',' + nr;
      if (!inGrid(nc, nr) || wall.has(key) || reachable.has(key)) continue;
      reachable.add(key); q.push([nc, nr]);
    }
  }
  const unreachable = new Set(), badEntrances = new Set();
  for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++) { const key = c + ',' + r; if (!wall.has(key) && !reachable.has(key)) unreachable.add(key); }
  ent.forEach(key => { if (!reachable.has(key)) badEntrances.add(key); });
  checkResult = { unreachable, badEntrances }; draw();
  if (badEntrances.size === 0) setStatus('✓ 所有入口都走得到營地，路線沒問題！', '#7ee0c0');
  else setStatus('⚠ 有 ' + badEntrances.size + ' 個入口被「不可穿透」完全擋死、走不到營地（黃框處）', '#ffd24a');
});

document.getElementById('clearLayout').addEventListener('click', () => {
  if (!confirm('確定清空這張地圖的所有圖層、大圖、不可穿透、可破壞、入口、營地？（規則數值不變）')) return;
  pushUndo();
  const m = curMap(); m.layers = emptyLayers(); m.stamps = []; m.solid = []; m.breakable = []; m.entrances = []; m.camp = []; checkResult = null;
  saveMaps(); draw(); setStatus('已清空這張地圖', '#ffd24a');
});

// ================= 地圖管理 =================
const mapSelect = document.getElementById('mapSelect');
function refreshMapSelect() {
  mapSelect.innerHTML = '';
  maps.forEach(m => { const opt = document.createElement('option'); opt.value = m.id; opt.textContent = m.name; if (m.id === curId) opt.selected = true; mapSelect.appendChild(opt); });
}
function newId() { return 'map_' + Date.now().toString(36); }
function blankMap(name) { return fixMap({ id: newId(), name: name || '新地圖', desc: '', layers: emptyLayers(), stamps: [], solid: [], breakable: [], entrances: [], camp: [], rules: {} }); }
function switchTo(id) { curId = id; checkResult = null; selection = null; selections = []; refreshSelPanel(); refreshMapSelect(); loadRules(); draw(); }

mapSelect.addEventListener('change', () => switchTo(mapSelect.value));
document.getElementById('newMap').addEventListener('click', () => {
  const name = prompt('新地圖的名稱？', '新地圖 ' + (maps.length + 1)); if (name === null) return;
  pushUndo();
  const m = blankMap(name.trim() || '新地圖'); maps.push(m); switchTo(m.id); saveMaps();
});
document.getElementById('dupMap').addEventListener('click', () => {
  pushUndo();
  const src = curMap(), m = clone(src); m.id = newId(); m.name = src.name + '（複製）'; maps.push(m); switchTo(m.id); saveMaps();
});
document.getElementById('renameMap').addEventListener('click', () => {
  const m = curMap(), name = prompt('改名為？', m.name); if (name === null) return;
  pushUndo();
  m.name = name.trim() || m.name; refreshMapSelect(); loadRules(); saveMaps();
});
document.getElementById('delMap').addEventListener('click', () => {
  if (maps.length <= 1) { alert('至少要留一張地圖'); return; }
  const m = curMap(); if (!confirm('確定刪除地圖「' + m.name + '」？')) return;
  pushUndo();
  maps = maps.filter(x => x !== m); switchTo(maps[0].id); saveMaps();
});

// ================= 規則面板 =================
const RULE_FIELDS = ['money', 'lives', 'guide', 'guideRegen', 'waves', 'count', 'countAdd', 'hp', 'hpAdd', 'speed', 'speedAdd', 'gap', 'gapSub', 'reward'];
function loadRules() {
  const m = curMap();
  document.getElementById('f_name').value = m.name;
  document.getElementById('f_desc').value = m.desc;
  RULE_FIELDS.forEach(k => { document.getElementById('f_' + k).value = m.rules[k]; });
}
document.getElementById('f_name').addEventListener('input', e => { curMap().name = e.target.value; refreshMapSelect(); saveMaps(); });
document.getElementById('f_desc').addEventListener('input', e => { curMap().desc = e.target.value; saveMaps(); });
RULE_FIELDS.forEach(k => { document.getElementById('f_' + k).addEventListener('input', e => { const v = parseFloat(e.target.value); curMap().rules[k] = isNaN(v) ? 0 : v; saveMaps(); }); });

// ================= 匯出 / 重設 =================
function exportText() {
  return '/* ===== 磚塊與地圖資料（由地圖編輯器匯出）=====\n' +
    '   整段貼回 data/maps.js 覆蓋即可。 */\n' +
    'const TILES_CUSTOM = ' + JSON.stringify(customTiles, null, 2) + ';\n\n' +
    'const MAPS_DEFAULT = ' + JSON.stringify(maps, null, 2) + ';\n';
}
document.getElementById('genExport').addEventListener('click', () => { document.getElementById('exportOut').value = exportText(); setStatus('已產生匯出文字，請「複製」或「下載」後貼回 data/maps.js', '#8fd3ff'); });
document.getElementById('copyExport').addEventListener('click', () => {
  const ta = document.getElementById('exportOut'); if (!ta.value) ta.value = exportText();
  ta.select(); ta.setSelectionRange(0, 999999);
  try { document.execCommand('copy'); setStatus('已複製到剪貼簿 ✓', '#7ee0c0'); } catch (e) { setStatus('複製失敗，請手動選取文字複製', '#ff8f8f'); }
});
document.getElementById('downloadExport').addEventListener('click', () => {
  const blob = new Blob([exportText()], { type: 'text/javascript' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'maps.js'; a.click(); URL.revokeObjectURL(a.href);
  setStatus('已下載 maps.js，請把它覆蓋到 data/maps.js', '#7ee0c0');
});
document.getElementById('resetFile').addEventListener('click', () => {
  if (!confirm('確定丟棄瀏覽器暫存，改用 data/maps.js 檔案的內容？未匯出的變更會不見。')) return;
  localStorage.removeItem(STORAGE_MAPS); localStorage.removeItem(STORAGE_TILES);
  selection = null; selections = [];
  loadTiles(); loadMaps(); preloadTiles(); renderPalette(); refreshMapSelect(); refreshSelPanel(); loadRules(); draw();
  setStatus('已重設為檔案內容', '#ffd24a');
});

// ================= 啟動 =================
loadTiles();
loadMaps();
preloadTiles();
renderPalette();
selectTile('floor');
renderLayers();
refreshMapSelect();
loadRules();
draw();
setStatus('編輯器已就緒。目前有 ' + maps.length + ' 張地圖、' + palette().length + ' 塊磚塊。', '#7ee0c0');
