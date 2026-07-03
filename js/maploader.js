/* ===== 地圖載入器：把「地圖編輯器」做的地圖接進遊戲 =====
   讀 data/maps.js 的第一張地圖，套用它的：
   - solid(不可穿透)→固定牆、breakable(可破壞)→障礙物
   - entrances(入口)→怪物生成點、camp(營地)→怪物目標
   - rules→覆蓋 data/balance.js 的數值
   - layers/stamps→畫出地板與裝飾圖片（含翻轉）
   想換玩哪張地圖，改最下面 pickMap() 的索引即可。
*/

// ---- 磚塊登錄（內建 + 編輯器匯出的自訂磚塊）----
const MAP_LAYER_ORDER = ['floor', 'ground', 'object', 'overlay', 'top'];
const TILE_REGISTRY = {};
function buildTileRegistry() {
  const builtin = [
    { id: 'floor', role: 'floor', file: 'images/background/Back-room-floor.png', w: 1, h: 1 },
    { id: 'wall', role: 'wall', file: null, w: 1, h: 1 },
    { id: 'obstacle', role: 'obstacle', file: null, w: 1, h: 1 },
  ];
  const custom = (typeof TILES_CUSTOM !== 'undefined' && TILES_CUSTOM) ? TILES_CUSTOM : [];
  [...builtin, ...custom].forEach(t => { TILE_REGISTRY[t.id] = t; });
}
const mapTileById = id => TILE_REGISTRY[id];
const mapTileW = t => (t && t.w) || 1;
const mapTileH = t => (t && t.h) || 1;

// ---- 圖片快取 ----
const mapImgCache = {};
function tileImage(t) {
  if (!t || !t.file) return null;
  let rec = mapImgCache[t.id];
  if (!rec) { rec = mapImgCache[t.id] = { img: new Image(), loaded: false }; rec.img.onload = () => { rec.loaded = true; }; rec.img.src = t.file; }
  return rec.loaded ? rec.img : null;
}
function preloadMapTiles() { Object.values(TILE_REGISTRY).forEach(t => { if (t.file) tileImage(t); }); }

// ---- 當前地圖 ----
let MAP = null, mapEntrances = [], mapBreakable = [];

function pickMap() {
  const list = (typeof MAPS_DEFAULT !== 'undefined' && MAPS_DEFAULT.length) ? MAPS_DEFAULT : [];
  return list[0] || null;   // 目前固定玩第一張；日後可加選單
}
function initMap() {
  buildTileRegistry(); preloadMapTiles();
  MAP = pickMap();
  if (!MAP) return;

  // 地圖大小（可比畫面大；鏡頭會跟著玩家捲動）
  if (MAP.cols) COLS = MAP.cols;
  if (MAP.rows) ROWS = MAP.rows;

  // 規則覆蓋數值（沒填的沿用 balance.js 預設）
  const R = MAP.rules || {};
  if (R.money != null) START.money = R.money;
  if (R.lives != null) START.lives = R.lives;
  if (R.guide != null) { START.guide = R.guide; START.guideMax = Math.max(START.guideMax, R.guide); }
  if (R.guideRegen != null) START.guideRegen = R.guideRegen;
  if (R.waves != null) WAVE_CFG.total = R.waves;
  if (R.count != null) WAVE_CFG.baseCount = R.count;
  if (R.countAdd != null) WAVE_CFG.addCount = R.countAdd;
  if (R.hp != null) WAVE_CFG.baseHp = R.hp;
  if (R.hpAdd != null) WAVE_CFG.addHp = R.hpAdd;
  if (R.speed != null) WAVE_CFG.baseSpeed = R.speed;
  if (R.speedAdd != null) WAVE_CFG.addSpeed = R.speedAdd;
  if (R.gap != null) WAVE_CFG.baseGap = R.gap;
  if (R.gapSub != null) WAVE_CFG.subGap = R.gapSub;
  if (R.reward != null) WAVE_CFG.reward = R.reward;

  // 結構：固定牆、可破壞、入口、營地
  mapWalls = new Set(MAP.solid || []);                                   // pathfinding.js 的全域
  campCells = new Set((MAP.camp && MAP.camp.length) ? MAP.camp : []);    // 空＝預設最下排
  mapEntrances = (MAP.entrances || []).map(k => k.split(',').map(Number));
  mapBreakable = (MAP.breakable || []).map(k => k.split(',').map(Number));
}

// ---- 提供給 game.js 用的查詢 ----
function defaultEntranceCells() { const a = []; for (let c = 0; c < COLS; c++) a.push([c, SPAWN_ROW]); return a; }
function spawnCells() {
  const src = mapEntrances.length ? mapEntrances : defaultEntranceCells();
  return src.filter(([c, r]) => inGrid(c, r) && !isWall(c, r) && isFinite(flowAt(c, r)));
}
const isEntrance = (c, r) => mapEntrances.length ? mapEntrances.some(([ec, er]) => ec === c && er === r) : (r === SPAWN_ROW);

// 開局時把「可破壞」擺成障礙物（每次 newGame 呼叫）
function seedMapObstacles() {
  if (!MAP) return;
  for (const [c, r] of mapBreakable) {
    if (G.grid[c + ',' + r]) continue;
    const o = { kind: 'obstacle', c, r, hp: BARRIER.hp, maxhp: BARRIER.hp };
    G.grid[c + ',' + r] = o; G.obstacles.push(o);
  }
}

// ---- 繪製地圖圖片（圖層由下往上，最後大圖）----
function drawMapTileImg(ctx, id, x, y) {
  const t = mapTileById(id); if (!t) return;
  const img = tileImage(t);
  if (img) { ctx.drawImage(img, x, y, CELL, CELL); return; }
  if (t.role === 'wall') { ctx.fillStyle = '#3f434b'; ctx.fillRect(x + 2, y + 2, CELL - 4, CELL - 4); }
  else if (t.role === 'obstacle') { ctx.fillStyle = '#7a5a3a'; ctx.fillRect(x + 4, y + 4, CELL - 8, CELL - 8); }
  else { ctx.fillStyle = '#20262f'; ctx.fillRect(x, y, CELL, CELL); }
}
function drawMapStampImg(ctx, s) {
  const t = mapTileById(s.id); if (!t) return;
  const x = OX + s.c * CELL, y = OY + s.r * CELL, w = mapTileW(t) * CELL, h = mapTileH(t) * CELL;
  const img = tileImage(t);
  if (img) {
    if (s.fx || s.fy) {
      ctx.save(); ctx.translate(x + (s.fx ? w : 0), y + (s.fy ? h : 0)); ctx.scale(s.fx ? -1 : 1, s.fy ? -1 : 1);
      ctx.drawImage(img, 0, 0, w, h); ctx.restore();
    } else ctx.drawImage(img, x, y, w, h);
    return;
  }
  ctx.fillStyle = t.role === 'wall' ? '#3f434b' : (t.role === 'obstacle' ? '#7a5a3a' : '#2b3446');
  ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
}
function drawMapImages(ctx) {
  if (!MAP) return;
  for (const lid of MAP_LAYER_ORDER) {
    const layer = MAP.layers ? (MAP.layers[lid] || {}) : {};
    for (const key in layer) { const [c, r] = key.split(',').map(Number); drawMapTileImg(ctx, layer[key], OX + c * CELL, OY + r * CELL); }
    for (const s of (MAP.stamps || [])) if ((s.layer || 'top') === lid) drawMapStampImg(ctx, s);
  }
}
function hasImageAt(c, r) {
  if (!MAP) return false;
  const key = c + ',' + r;
  for (const lid of MAP_LAYER_ORDER) if (MAP.layers && MAP.layers[lid] && MAP.layers[lid][key]) return true;
  for (const s of (MAP.stamps || [])) { const t = mapTileById(s.id) || {}; if (c >= s.c && c < s.c + mapTileW(t) && r >= s.r && r < s.r + mapTileH(t)) return true; }
  return false;
}

// 載入時立即套用地圖（在 game.js 之前）
initMap();
