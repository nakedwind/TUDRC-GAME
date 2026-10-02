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
const isMapObstacleTile = t => !!(t && (t.role === 'obstacle' || String(t.file || '').replace(/\\/g, '/').includes('/item-obstacle/')));
function mapObstacleSpec(t) {
  const file = String(t.file || '').replace(/\\/g, '/');
  for (const ob of OBSTACLES) for (const orient of ['h', 'v']) {
    if (ob[orient] && ob[orient].file === file) return { type: ob.id, hp: ob.hp, solid: ob[orient].solid };
  }
  if (file.includes('07-Camping lights.png')) return { type: 'camping_lights', hp: 120, solid: [[0, mapTileH(t) - 1]] };
  const solid = [];
  for (let c = 0; c < mapTileW(t); c++) solid.push([c, mapTileH(t) - 1]);
  return { type: t.id, hp: BARRIER.hp, solid };
}

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
let MAP = null, mapEntrances = [], mapBreakable = [], mapPortals = [], mapBases = [];
// 安全場景（例如回基地）：不生怪、不套黑幕。由地圖的 safe 欄位決定（地圖編輯器可勾選）
let MAP_SAFE = false;
// 場景 NPC（克莉思、路德…）只在有勾「場景 NPC」的地圖出現
let MAP_NPCS = false;
const LIGHT_BASE_ENABLED = LIGHT.enabled;   // balance.js 的原始設定，離開安全場景要還原

let MAP_INDEX = 0;   // 目前玩第幾張地圖（由開始畫面的地圖選單切換）
let openElevatorStamp = null;
let elevatorCloseAnim = null;
let elevatorOpenAnim = null;
const elevatorOpenImage = new Image();
elevatorOpenImage.src = 'images/應變中心/elevator-open.png';
const elevatorLightOpenImage = new Image();
elevatorLightOpenImage.src = 'images/應變中心/elevator-light02.png';
const isElevatorTile = tile => String(tile?.file || '').replaceAll('\\', '/').endsWith('/應變中心/elevator.png');
const isElevatorStamp = stamp => isElevatorTile(mapTileById(stamp.id));
const isElevatorLightTile = tile => String(tile?.file || '').replaceAll('\\', '/').endsWith('/應變中心/elevator-light01.png');
function elevatorLightIsOpen(c, r) {
  return (MAP?.stamps || []).some(stamp => isElevatorStamp(stamp) &&
    Math.abs(stamp.c + 1 - c) <= 1 && Math.abs(stamp.r - r) <= 1 &&
    (stamp === openElevatorStamp || elevatorOpenAnim?.stamp === stamp || elevatorCloseAnim?.stamp === stamp));
}
function setElevatorSolids(stamp, phase) {
  const tile = mapTileById(stamp.id), cfg = elevatorConfig(stamp.id);
  if (!tile || !cfg) return;
  const c0 = stamp.c + Math.round((stamp.ox || 0) / CELL);
  const r0 = stamp.r + Math.round((stamp.oy || 0) / CELL);
  for (let dr = 0; dr < mapTileH(tile); dr++) for (let dc = 0; dc < mapTileW(tile); dc++) {
    mapWalls.delete((c0 + dc) + ',' + (r0 + dr));
  }
  for (const [dc, dr] of cfg[phase].solid || []) {
    if (dc >= 0 && dc < mapTileW(tile) && dr >= 0 && dr < mapTileH(tile))
      mapWalls.add((c0 + dc) + ',' + (r0 + dr));
  }
}
function openElevator(stamp) {
  openElevatorStamp = stamp;
  setElevatorSolids(stamp, 'open');
}
function startElevatorOpen(stamp) {
  if (openElevatorStamp === stamp || elevatorOpenAnim) return;
  elevatorOpenAnim = { stamp, started: performance.now(), duration: 550 };
}
function finishElevatorOpen(stamp) {
  if (!MAP || !(MAP.stamps || []).includes(stamp) || elevatorOpenAnim?.stamp !== stamp) return;
  elevatorOpenAnim = null;
  openElevator(stamp);
}
function startElevatorClose(stamp) {
  elevatorCloseAnim = { stamp, started: performance.now(), duration: 550 };
}
function finishElevatorClose(stamp) {
  if (!MAP || !(MAP.stamps || []).includes(stamp)) return;
  elevatorCloseAnim = null;
  openElevatorStamp = null;
  setElevatorSolids(stamp, 'closed');
}
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
  openElevatorStamp = null;
  elevatorCloseAnim = null;
  elevatorOpenAnim = null;
  if (!MAP) return;

  // 地圖大小（可比畫面大；鏡頭會跟著玩家捲動）
  if (MAP.cols) COLS = MAP.cols;
  if (MAP.rows) ROWS = MAP.rows;

  // 短而寬的地圖以高度填滿畫面，左右由鏡頭跟隨玩家捲動；小房間仍等比例完整置中。
  const fitWidth = VIEW_W / (COLS * CELL), fitHeight = VIEW_H / (ROWS * CELL);
  VIEW_SCALE = Math.max(1, Math.min(fitWidth, fitHeight));
  if (fitWidth < 1 && fitHeight > 1) VIEW_SCALE = fitHeight;

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
  for (const stamp of MAP.stamps || []) if (isElevatorStamp(stamp)) setElevatorSolids(stamp, 'closed');
  mapSolidOffsets = MAP.solidOffsets || {};                              // 不可穿透格的像素微調
  // 每張椅子的擋路格由椅子編輯器決定；一般格子圖片與大圖擺放都套用。
  const addChairSolid = (id, c, r, fx = false, fy = false) => {
    const cfg = chairConfig(id), tile = mapTileById(id);
    if (!cfg || !tile) return;
    const w = mapTileW(tile), h = mapTileH(tile);
    for (const [dx, dy] of cfg.solid) {
      const cc = c + (fx ? w - 1 - dx : dx), rr = r + (fy ? h - 1 - dy : dy);
      if (inGrid(cc, rr)) mapWalls.add(cc + ',' + rr);
    }
  };
  for (const layer of Object.values(MAP.layers || {})) for (const [key, id] of Object.entries(layer)) {
    const [c, r] = key.split(',').map(Number);
    addChairSolid(id, c, r);
  }
  for (const s of MAP.stamps || []) addChairSolid(s.id,
    s.c + Math.round((s.ox || 0) / CELL), s.r + Math.round((s.oy || 0) / CELL), !!s.fx, !!s.fy);
  mapBases = (MAP.stamps || []).filter(s => {
    const t = mapTileById(s.id);
    return !!(t && t.baseHp);
  });
  // 地圖上有基地時，怪物自動把基地中央當成營地目標；不必另外手動畫營地格。
  const baseTargets = mapBases.map(s => {
    const t = mapTileById(s.id);
    const baseC = s.c + Math.round((s.ox || 0) / CELL), baseR = s.r + Math.round((s.oy || 0) / CELL);
    return (baseC + Math.floor(mapTileW(t) / 2)) + ',' + (baseR + Math.floor(mapTileH(t) / 2));
  });
  campCells = new Set(baseTargets.length ? baseTargets : ((MAP.camp && MAP.camp.length) ? MAP.camp : []));    // 空＝預設最下排
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
function elevatorBlocksPoint(x, y) {
  for (const stamp of MAP?.stamps || []) {
    if (!isElevatorStamp(stamp)) continue;
    const tile = mapTileById(stamp.id), cfg = elevatorConfig(stamp.id);
    if (!tile || !cfg) continue;
    const left = OX + stamp.c * CELL + (stamp.ox || 0), top = OY + stamp.r * CELL + (stamp.oy || 0);
    const lx = x - left, ly = y - top;
    const setting = cfg[stamp === openElevatorStamp ? 'open' : 'closed'];
    const fallback = ELEVATORS_DEFAULT[stamp.id]?.[stamp === openElevatorStamp ? 'open' : 'closed'];
    const passage = setting?.passage ?? fallback?.passage;
    // 開門後讓通道延伸到門檻外一個角色半徑，避免圖片的像素位移在入口留下擋路縫隙。
    const doorwayBottom = mapTileH(tile) * CELL + (typeof PLAYER !== 'undefined' ? PLAYER.r : 14);
    if (stamp === openElevatorStamp && passage && passage.w > 0 && passage.h > 0 &&
        lx >= passage.x && lx < passage.x + passage.w &&
        ly >= passage.y && ly < Math.max(passage.y + passage.h, doorwayBottom)) return false;
    if (lx < 0 || ly < 0 || lx >= mapTileW(tile) * CELL || ly >= mapTileH(tile) * CELL) continue;
    const c = Math.floor(lx / CELL), r = Math.floor(ly / CELL);
    if (passage && passage.w > 0 && passage.h > 0 &&
        lx >= passage.x && lx < passage.x + passage.w &&
        ly >= passage.y && ly < passage.y + passage.h) return false;
    const solid = (setting?.solid || []).some(([sc, sr]) => sc === c && sr === r);
    if (!solid) return false;
    const inset = key => Math.max(0, Math.min(CELL, Number(setting[key]) || 0));
    return !(c === 0 && lx < inset('leftInset')) &&
      !(c === mapTileW(tile) - 1 && lx >= mapTileW(tile) * CELL - inset('rightInset')) &&
      !(r === 0 && ly < inset('topInset')) &&
      !(r === mapTileH(tile) - 1 && ly >= mapTileH(tile) * CELL - inset('bottomInset'));
  }
  return null;
}
function solidBlocksPoint(x, y) {
  const elevator = elevatorBlocksPoint(x, y);
  if (elevator !== null) return elevator;
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
  for (const s of mapBases) {
    const t = mapTileById(s.id);
    if (!t) continue;
    const w = mapTileW(t), h = mapTileH(t);
    const baseC = s.c + Math.round((s.ox || 0) / CELL), baseR = s.r + Math.round((s.oy || 0) / CELL);
    const hasCustomSolid = Array.isArray(s.baseSolid);
    const sourceSolid = hasCustomSolid ? s.baseSolid : (Array.isArray(t.baseSolid) ? t.baseSolid : []);
    const solid = sourceSolid.map(([dc, dr]) => hasCustomSolid ? [dc, dr] : [s.fx ? w - 1 - dc : dc, s.fy ? h - 1 - dr : dr]);
    const hp = Math.max(1, Number(s.baseHp != null ? s.baseHp : t.baseHp) || 2000);
    const o = {
      kind: 'obstacle', isBase: true, mapTileId: t.id,
      c: baseC, r: baseR, w, h, solid, hp, maxhp: hp,
      artX: OX + s.c * CELL + (s.ox || 0),
      artY: OY + s.r * CELL + (s.oy || 0),
      orient: 'h', spawnT: undefined, hitT: 0,
    };
    solid.forEach(([dc, dr]) => {
      const c = baseC + dc, r = baseR + dr;
      if (inGrid(c, r)) G.grid[c + ',' + r] = o;
    });
    G.obstacles.push(o);
  }
  // 地圖編輯器的「障礙物」素材沿用可放置建築的碰撞格與 HP。
  // 不修改原始地圖；拆毀後只在本局隱藏該圖片。
  const addMapObstacle = (t, c, r, source, stamp = null) => {
    if (!isMapObstacleTile(t)) return;
    const spec = mapObstacleSpec(t), w = mapTileW(t), h = mapTileH(t);
    const solid = (spec.solid || []).map(([dc, dr]) => [stamp && stamp.fx ? w - 1 - dc : dc, stamp && stamp.fy ? h - 1 - dr : dr])
      .filter(([dc, dr]) => inGrid(c + dc, r + dr) && !G.grid[(c + dc) + ',' + (r + dr)]);
    if (!solid.length) return;
    const o = { kind: 'obstacle', mapSource: source, mapTileId: t.id, type: spec.type,
      c, r, w, h, solid, hp: spec.hp, maxhp: spec.hp, hitT: 0 };
    for (const [dc, dr] of solid) {
      const key = (c + dc) + ',' + (r + dr);
      mapWalls.delete(key); // 舊地圖若另畫了固定碰撞，改由可破壞物件接管。
      G.grid[key] = o;
    }
    G.obstacles.push(o);
  };
  for (const lid of MAP_LAYER_ORDER) {
    const layer = MAP.layers && MAP.layers[lid] || {};
    for (const [key, id] of Object.entries(layer)) {
      const [c, r] = key.split(',').map(Number);
      addMapObstacle(mapTileById(id), c, r, lid + ':' + key);
    }
  }
  for (const s of MAP.stamps || []) {
    const c = s.c + Math.round((s.ox || 0) / CELL), r = s.r + Math.round((s.oy || 0) / CELL);
    addMapObstacle(mapTileById(s.id), c, r, s, s);
  }
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
  if (typeof G !== 'undefined' && G && G.mapDestroyed && G.mapDestroyed.has(s)) return;
  const t = mapTileById(s.id); if (!t) return;
  const x = OX + s.c * CELL + (s.ox || 0), y = OY + s.r * CELL + (s.oy || 0), w = mapTileW(t) * CELL, h = mapTileH(t) * CELL;
  if (t.color) { ctx.fillStyle = t.color; ctx.fillRect(x, y, w, h); return; }
  const img = isElevatorLightTile(t) && elevatorLightIsOpen(s.c, s.r) && elevatorLightOpenImage.complete && elevatorLightOpenImage.naturalWidth
    ? elevatorLightOpenImage : tileImage(t);
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
    for (const key in layer) { if (G.mapDestroyed.has(lid + ':' + key)) continue; const [c, r] = key.split(',').map(Number); drawMapTileImg(ctx, layer[key], OX + c * CELL, OY + r * CELL); }
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
const stampIsOcc = s => { const t = mapTileById(s.id) || {}; return !!chairConfig(s.id) || !!t.baseHp || (!t.flat && (mapTileH(t) >= OCC_MIN_H || isOccLayer(s.layer || 'top'))); };

// 地面：所有「非立體物、非上層」的圖片，永遠畫在角色下面
function drawMapGround(ctx) {
  if (!MAP) return;
  for (const lid of MAP_LAYER_ORDER) {
    if (lid === 'top') continue;
    const layer = MAP.layers ? (MAP.layers[lid] || {}) : {};
    if (!isOccLayer(lid)) for (const key in layer) { if (G.mapDestroyed.has(lid + ':' + key) || chairConfig(layer[key])) continue; const [c, r] = key.split(',').map(Number); drawMapTileImg(ctx, layer[key], OX + c * CELL, OY + r * CELL); }
    for (const s of (MAP.stamps || [])) if (!isElevatorStamp(s) && (s.layer || 'top') === lid && !stampIsOcc(s)) drawMapStampImg(ctx, s);
  }
}
// 上層：'top' 圖層，永遠畫在角色上面
function drawMapTop(ctx) {
  if (!MAP) return;
  const layer = MAP.layers ? (MAP.layers.top || {}) : {};
  for (const key in layer) { if (G.mapDestroyed.has('top:' + key) || chairConfig(layer[key])) continue; const [c, r] = key.split(',').map(Number); drawMapTileImg(ctx, layer[key], OX + c * CELL, OY + r * CELL); }
  for (const s of (MAP.stamps || [])) {
    if (isElevatorStamp(s)) continue;
    if (chairConfig(s.id)) continue;
    if ((s.layer || 'top') !== 'top') continue;
    const t = mapTileById(s.id) || {};
    if (!t.baseHp) drawMapStampImg(ctx, s);
  }
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
    const layer = MAP.layers ? (MAP.layers[lid] || {}) : {};
    for (const key in layer) {
      const chair = chairConfig(layer[key]);
      if (!chair && (lid === 'top' || !isOccLayer(lid))) continue;
      const [c, r] = key.split(',').map(Number), id = layer[key];
      const y0 = r * CELL;
      items.push({ li, x0: c * CELL, y0, x1: (c + 1) * CELL, y1: (r + 1) * CELL,
        sortY: chair ? y0 + chair.depth : null, fixedDepth: !!chair, kind: 'cell', id, c, r });
    }
    for (const s of (MAP.stamps || [])) {
      if (isElevatorStamp(s)) continue;
      if ((s.layer || 'top') !== lid || !stampIsOcc(s)) continue;
      const t = mapTileById(s.id) || {};
      const chair = chairConfig(s.id);
      if (lid === 'top' && !t.baseHp && !chair) continue;
      const x0 = s.c * CELL + (s.ox || 0), y0 = s.r * CELL + (s.oy || 0);
      const depth = chair ? y0 + (s.fy ? mapTileH(t) * CELL - chair.depth : chair.depth) : t.baseHp
        ? Math.max(0, Math.min(mapTileH(t), Number.isFinite(s.baseDepth) ? s.baseDepth : (Number.isFinite(t.baseDepth) ? t.baseDepth : Math.max(1, mapTileH(t) - 2))))
        : (Number.isFinite(s.sortDepth) ? Math.max(0, Math.min(mapTileH(t), s.sortDepth)) : null);
      items.push({ li, x0, y0, x1: x0 + mapTileW(t) * CELL, y1: y0 + mapTileH(t) * CELL,
        sortY: depth == null ? null : chair ? depth : y0 + depth * CELL, fixedDepth: depth != null, kind: 'stamp', stamp: s });
    }
  });
  // items 已依圖層由下往上排好，所以下層的 y 一定先算完；
  // 這裡直接取下層「算完的 y」，疊好幾層也能接力（櫃子 → 咖啡機 → 杯子）。
  for (const it of items) {
    it.y = it.fixedDepth ? it.sortY : it.y1;
    if (it.fixedDepth) continue;
    for (const other of items) {                    // 找它底下那層、又跟它重疊的東西（牆、櫃子…）
      if (other.li >= it.li || other.y <= it.y) continue;
      const overlapX = Math.min(it.x1, other.x1) - Math.max(it.x0, other.x0);
      const overlapY = Math.min(it.y1, other.y1) - Math.max(it.y0, other.y0);
      // 小杯子、海報等可貼在下層物件上；大型家具只碰到幾個像素的邊緣時不能借用對方的深度。
      const smallDecoration = it.y1 - it.y0 <= CELL;
      if (overlapX > 0 && (smallDecoration ? overlapY > 0 : overlapY >= CELL / 4)) it.y = other.y;
    }
  }
  occCache = items; occCacheFor = MAP;
  return items;
}
function collectMapOccluders(ctx, out) {
  if (!MAP) return;
  for (const it of mapOccluders()) {
    if (it.kind === 'cell') { const { id, c, r, li } = it; const source = MAP_LAYER_ORDER[li] + ':' + c + ',' + r; if (!G.mapDestroyed.has(source)) out.push({ y: it.y, draw: () => drawMapTileImg(ctx, id, OX + c * CELL, OY + r * CELL) }); }
    else { const s = it.stamp; out.push({ y: it.y, draw: () => drawMapStampImg(ctx, s) }); }
  }
}
function drawElevators(ctx) {
  for (const stamp of MAP.stamps || []) {
    if (!isElevatorStamp(stamp)) continue;
    if ((stamp === openElevatorStamp || elevatorOpenAnim?.stamp === stamp) && elevatorOpenImage.complete && elevatorOpenImage.naturalWidth) {
      const x = OX + stamp.c * CELL + (stamp.ox || 0), y = OY + stamp.r * CELL + (stamp.oy || 0);
      ctx.drawImage(elevatorOpenImage, x, y, mapTileW(mapTileById(stamp.id)) * CELL, mapTileH(mapTileById(stamp.id)) * CELL);
      const animation = elevatorOpenAnim?.stamp === stamp ? elevatorOpenAnim : elevatorCloseAnim?.stamp === stamp ? elevatorCloseAnim : null;
      if (animation) {
        const closed = tileImage(mapTileById(stamp.id));
        if (closed) {
          const p = Math.min(1, (performance.now() - animation.started) / animation.duration);
          const eased = p * p * (3 - 2 * p);
          const gap = 34 * (animation === elevatorOpenAnim ? eased : 1 - eased);
          ctx.save();
          ctx.beginPath(); ctx.rect(x + 20, y + 31, 70, 89); ctx.clip();
          ctx.drawImage(closed, 21, 31, 34, 89, x + 21 - gap, y + 31, 34, 89);
          ctx.drawImage(closed, 55, 31, 34, 89, x + 55 + gap, y + 31, 34, 89);
          ctx.restore();
        }
      }
    } else drawMapStampImg(ctx, stamp);
  }
}

// 載入時立即套用地圖（在 game.js 之前）
initMap();
