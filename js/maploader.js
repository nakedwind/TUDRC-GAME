/* ===== 地圖載入器：把「地圖編輯器」做的地圖接進遊戲 =====
   讀 data/maps.js 的第一張地圖，套用它的：
   - solid(不可穿透)→固定牆、breakable(可破壞)→障礙物
   - entrances(入口)→怪物生成點、camp(營地)→怪物目標
   - rules→覆蓋 data/balance.js 的數值
   - layers/stamps→畫出地板與裝飾圖片（含翻轉）
   想換玩哪張地圖，改最下面 pickMap() 的索引即可。
*/

// ---- 預覽模式：地圖編輯器按「▶ 預覽遊戲」時，用它暫存的地圖取代內建清單 ----
//      網址帶 ?preview=1 才會啟用；沒有暫存資料就照常跑內建地圖。
const PREVIEW_KEY = 'tudrc_map_preview_v1';
let PREVIEW = null;
if (/[?&]preview=1(&|$)/.test(location.search)) {
  try { PREVIEW = JSON.parse(localStorage.getItem(PREVIEW_KEY) || 'null'); } catch (e) { PREVIEW = null; }
  if (PREVIEW && !PREVIEW.map) PREVIEW = null;
}

// ---- 磚塊登錄（內建 + 編輯器匯出的自訂磚塊）----
const MAP_LAYER_ORDER = ['floor', 'ground', 'ground2', 'ground3', 'object', 'object2', 'object3', 'object4', 'overlay', 'top'];
const TILE_REGISTRY = {};
function buildTileRegistry() {
  const builtin = [
    { id: 'floor', role: 'floor', file: 'images/background/Back-room-floor.png', w: 1, h: 1 },
    { id: 'wall', role: 'wall', file: null, w: 1, h: 1 },
    { id: 'obstacle', role: 'obstacle', file: null, w: 1, h: 1 },
  ];
  const custom = (PREVIEW && PREVIEW.tiles) ? PREVIEW.tiles
    : ((typeof TILES_CUSTOM !== 'undefined' && TILES_CUSTOM) ? TILES_CUSTOM : []);
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
let MAP = null, mapEntrances = [], mapBreakable = [], mapPortals = [];
// 安全場景（例如回基地）：不生怪、不套黑幕。由地圖的 safe 欄位決定（地圖編輯器可勾選）
let MAP_SAFE = false;
// 場景 NPC（克莉思、路德…）只在有勾「場景 NPC」的地圖出現
let MAP_NPCS = false;
const LIGHT_BASE_ENABLED = LIGHT.enabled;   // balance.js 的原始設定，離開安全場景要還原

let MAP_INDEX = 0;   // 目前玩第幾張地圖（由開始畫面的地圖選單切換）
function mapList() {
  if (PREVIEW) return [PREVIEW.map];                 // 預覽模式：只有編輯中的那一張
  return (typeof MAPS_DEFAULT !== 'undefined' && MAPS_DEFAULT.length) ? MAPS_DEFAULT : [];
}
function pickMap() {
  const list = mapList();
  return list[MAP_INDEX] || list[0] || null;
}
function switchMap(i) {                 // 切換到第 i 張並重新載入地圖
  const list = mapList();
  if (i >= 0 && i < list.length) { MAP_INDEX = i; initMap(); }
}
function initMap() {
  buildTileRegistry(); preloadMapTiles();
  MAP = pickMap();
  if (!MAP) return;

  // 地圖大小（可比畫面大；鏡頭會跟著玩家捲動）
  if (MAP.cols) COLS = MAP.cols;
  if (MAP.rows) ROWS = MAP.rows;

  // 小地圖放大到填滿相框（等比例、取較小的倍率所以不會裁切）；地圖夠大就維持 1:1
  VIEW_SCALE = Math.max(1, Math.min(VIEW_W / (COLS * CELL), VIEW_H / (ROWS * CELL)));

  // 安全場景：沒有怪物、沒有黑幕（整張地圖都是亮的）
  MAP_SAFE = !!MAP.safe;
  MAP_NPCS = !!MAP.npcs;
  LIGHT.enabled = LIGHT_BASE_ENABLED && !MAP_SAFE;

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
  mapSolidOffsets = MAP.solidOffsets || {};                              // 不可穿透格的像素微調
  campCells = new Set((MAP.camp && MAP.camp.length) ? MAP.camp : []);    // 空＝預設最下排
  mapEntrances = (MAP.entrances || []).map(k => k.split(',').map(Number));
  mapBreakable = (MAP.breakable || []).map(k => k.split(',').map(Number));
  mapPortals = (MAP.portals || []).map(p => ({ c: p.c, r: p.r, to: p.to }));   // 出入口：走到門旁按鍵可換地圖
}
// 出入口查詢
function mapIndexById(id) { const list = mapList(); return list.findIndex(m => m && m.id === id); }
function returnPortalCell(fromId) { return mapPortals.find(p => p.to === fromId) || null; }

// ---- 不可穿透格的像素微調 ----
// 一般的不可穿透格＝整格 40×40 都擋。地圖編輯器可以幫某些格子加上像素位移，
// 讓擋路範圍對齊美術（例如沙發用方向鍵微調過位置）。位移後的方框可能跨到鄰格，
// 所以判定時要連周圍 8 格一起看。怪物尋路仍然以「整格」為單位（見 pathfinding.js）。
let mapSolidOffsets = {};
const solidOffsetAt = (c, r) => mapSolidOffsets[c + ',' + r];
function solidBlocksPoint(x, y) {
  const [c, r] = cellAt(x, y);
  if (isWall(c, r) && !solidOffsetAt(c, r)) return true;        // 沒微調過：整格都擋
  for (let dc = -1; dc <= 1; dc++) for (let dr = -1; dr <= 1; dr++) {
    const cc = c + dc, rr = r + dr;
    const off = solidOffsetAt(cc, rr);
    if (!off || !isWall(cc, rr)) continue;
    const x0 = OX + cc * CELL + off[0], y0 = OY + rr * CELL + off[1];
    if (x >= x0 && x < x0 + CELL && y >= y0 && y < y0 + CELL) return true;
  }
  return false;
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
  if (t.color) { ctx.fillStyle = t.color; ctx.fillRect(x, y, CELL, CELL); return; }
  const img = tileImage(t);
  if (img) { ctx.drawImage(img, x, y, CELL, CELL); return; }
  if (t.role === 'wall') { ctx.fillStyle = '#3f434b'; ctx.fillRect(x + 2, y + 2, CELL - 4, CELL - 4); }
  else if (t.role === 'obstacle') { ctx.fillStyle = '#7a5a3a'; ctx.fillRect(x + 4, y + 4, CELL - 8, CELL - 8); }
  else { ctx.fillStyle = '#20262f'; ctx.fillRect(x, y, CELL, CELL); }
}
function drawMapStampImg(ctx, s) {
  const t = mapTileById(s.id); if (!t) return;
  const x = OX + s.c * CELL + (s.ox || 0), y = OY + s.r * CELL + (s.oy || 0), w = mapTileW(t) * CELL, h = mapTileH(t) * CELL;
  if (t.color) { ctx.fillStyle = t.color; ctx.fillRect(x, y, w, h); return; }
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

// ---- 深度排序：判斷一張圖是「會遮擋角色的立體物」還是「平的地面」----
//   規則：'top' 圖層永遠在角色上面（樹冠/屋簷）；
//   其餘圖層中，高度≥2格 或 放在 object/overlay 圖層 的，視為立體物 → 和角色一起排序；
//   剩下扁平的（多半是地板）留在地面、永遠在角色下面。
const OCC_MIN_H = 2;                                   // 幾格高(含)以上算「立體物」
const isOccLayer = lid => /^object\d*$/.test(lid) || lid === 'overlay';   // 物件、物件2～4、物件裝飾都是「立體物」
// flat:true 的圖＝平貼地面（紅線、裂痕、碎石等），永遠畫在角色下方、不遮擋
const stampIsOcc = s => { const t = mapTileById(s.id) || {}; return !t.flat && (mapTileH(t) >= OCC_MIN_H || isOccLayer(s.layer || 'top')); };

// 地面：所有「非立體物、非上層」的圖片，永遠畫在角色下面
function drawMapGround(ctx) {
  if (!MAP) return;
  for (const lid of MAP_LAYER_ORDER) {
    if (lid === 'top') continue;
    const layer = MAP.layers ? (MAP.layers[lid] || {}) : {};
    if (!isOccLayer(lid)) for (const key in layer) { const [c, r] = key.split(',').map(Number); drawMapTileImg(ctx, layer[key], OX + c * CELL, OY + r * CELL); }
    for (const s of (MAP.stamps || [])) if ((s.layer || 'top') === lid && !stampIsOcc(s)) drawMapStampImg(ctx, s);
  }
}
// 上層：'top' 圖層，永遠畫在角色上面
function drawMapTop(ctx) {
  if (!MAP) return;
  const layer = MAP.layers ? (MAP.layers.top || {}) : {};
  for (const key in layer) { const [c, r] = key.split(',').map(Number); drawMapTileImg(ctx, layer[key], OX + c * CELL, OY + r * CELL); }
  for (const s of (MAP.stamps || [])) if ((s.layer || 'top') === 'top') drawMapStampImg(ctx, s);
}
// 立體物：會和角色互相遮擋，回傳 {y:底部Y, draw:畫它} 加進 out
//
// 排序用的「底部Y」有個例外：靠在別的東西上的裝飾（牆上的海報窗戶、櫃子上的咖啡機）自己很矮，
// 底部Y 比它依附的牆／櫃子小 → 只按自己的底部排，就會被後畫的牆／櫃子蓋掉。
// 所以先算「有效底部Y」：跟它重疊、而且在更下層的圖，底部比它低就跟著用那個的，
// 這樣它會緊接在那張圖之後畫出來，跟編輯器看到的上下關係一致。
// 重疊用「實際像素範圍」判斷（含方向鍵微調的 ox/oy），因為常常是靠微調才疊在一起、格子並沒有交集。
let occCache = null, occCacheFor = null;
function mapOccluders() {
  if (occCache && occCacheFor === MAP) return occCache;
  const items = [];
  MAP_LAYER_ORDER.forEach((lid, li) => {
    if (lid === 'top') return;
    const layer = MAP.layers ? (MAP.layers[lid] || {}) : {};
    if (isOccLayer(lid)) for (const key in layer) {
      const [c, r] = key.split(',').map(Number), id = layer[key];
      items.push({ li, x0: c * CELL, y0: r * CELL, x1: (c + 1) * CELL, y1: (r + 1) * CELL, kind: 'cell', id, c, r });
    }
    for (const s of (MAP.stamps || [])) {
      if ((s.layer || 'top') !== lid || !stampIsOcc(s)) continue;
      const t = mapTileById(s.id) || {};
      const x0 = s.c * CELL + (s.ox || 0), y0 = s.r * CELL + (s.oy || 0);
      items.push({ li, x0, y0, x1: x0 + mapTileW(t) * CELL, y1: y0 + mapTileH(t) * CELL, kind: 'stamp', stamp: s });
    }
  });
  // items 已依圖層由下往上排好，所以下層的 y 一定先算完；
  // 這裡直接取下層「算完的 y」，疊好幾層也能接力（櫃子 → 咖啡機 → 杯子）。
  for (const it of items) {
    it.y = it.y1;
    for (const other of items) {                    // 找它底下那層、又跟它重疊的東西（牆、櫃子…）
      if (other.li >= it.li || other.y <= it.y) continue;
      if (it.x0 < other.x1 && it.x1 > other.x0 && it.y0 < other.y1 && it.y1 > other.y0) it.y = other.y;
    }
  }
  occCache = items; occCacheFor = MAP;
  return items;
}
function collectMapOccluders(ctx, out) {
  if (!MAP) return;
  for (const it of mapOccluders()) {
    if (it.kind === 'cell') { const { id, c, r } = it; out.push({ y: it.y, draw: () => drawMapTileImg(ctx, id, OX + c * CELL, OY + r * CELL) }); }
    else { const s = it.stamp; out.push({ y: it.y, draw: () => drawMapStampImg(ctx, s) }); }
  }
}

// 載入時立即套用地圖（在 game.js 之前）
initMap();
