/* ===== 地圖載入器：把「地圖編輯器」「基地編輯器」做的地圖接進遊戲 =====
   地圖清單是 MAPS_DEFAULT（js/map-data.js 把戰鬥、基地、劇情三種地圖合在一起），
   載入其中一張，套用它的：
   - solid(不可穿透)→固定牆、breakable(可破壞)→障礙物
   - camp(營地)→怪物目標
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
// 怪物編輯器的單隻測試場：只存在此頁記憶體，不改既有地圖或正式遊戲存檔。
const MONSTER_PREVIEW_ID = /[?&]monsterPreview=1(&|$)/.test(location.search)
  ? new URLSearchParams(location.search).get('monsterId') || 'burrowing_mouse' : null;
if (MONSTER_PREVIEW_ID) {
  const floor = {};
  for (let c = 0; c < 24; c++) for (let r = 0; r < 14; r++) floor[c + ',' + r] = 'floor';
  PREVIEW = { map: { id: 'monster_preview', name: '怪物測試場', cols: 24, rows: 14, safe: false, npcs: false,
    layers: { floor }, stamps: [], solid: [], camp: ['3,10'], coreSpots: ['20,3'], coreCount: 1,
    spawnZone: [], portals: [], monsterMix: [{ id: MONSTER_PREVIEW_ID, weight: 100 }], rules: { money: 3000, guide: 100 } }, tiles: [] };
}

// 回憶預覽直接取正式劇情地圖；編輯器的 preview=1 仍優先保留其草稿。
if (/[?&]storyPreview=/.test(location.search) && !PREVIEW) {
  const scene = StoryScene.previewScene(), story = scene && MAP_DATA_STORY.find(m => m.id === scene.map);
  if (story) PREVIEW = { map: story, tiles: MAP_DATA_TILES };
}

// ---- 磚塊登錄（內建 + 編輯器匯出的自訂磚塊）----
const DEFAULT_MAP_LAYER_ORDER = ['floor', 'ground', 'ground2', 'ground3', 'object', 'object2', 'object3', 'object4', 'overlay', 'top'];
// 目前這張地圖的圖層順序（由底到上）：編輯器裡新增／刪除過圖層的地圖存在 MAP.layerOrder，沒改過的用上面的預設。
// 圖層的畫法看 id：ground…＝地面（在角色下面）、object…／overlay＝立體物（跟角色排前後）、top＝永遠在角色上面
let MAP_LAYER_ORDER = DEFAULT_MAP_LAYER_ORDER;
const mapLayerOrderOf = m => (m && Array.isArray(m.layerOrder) && m.layerOrder.length) ? m.layerOrder.map(l => l.id) : DEFAULT_MAP_LAYER_ORDER;
const TILE_REGISTRY = {};
// map＝要載入的地圖：戰鬥地圖用地圖編輯器的素材設定、基地用基地編輯器的（js/map-data.js 的 mapTileCatalog）
function buildTileRegistry(map) {
  const builtin = [
    { id: 'floor', role: 'floor', file: 'images/background/Back-room-floor.png', w: 1, h: 1 },
    { id: 'wall', role: 'wall', file: null, w: 1, h: 1 },
    { id: 'obstacle', role: 'obstacle', file: null, w: 1, h: 1 },
  ];
  const custom = (PREVIEW && PREVIEW.tiles) ? PREVIEW.tiles
    : (typeof mapTileCatalog === 'function') ? mapTileCatalog(map)
    : ((typeof TILES_CUSTOM !== 'undefined' && TILES_CUSTOM) ? TILES_CUSTOM : []);
  [...builtin, ...custom].forEach(t => {
    const entry=typeof ORE_TYPES!=='undefined'&&(ORE_TYPES[String(t.id).replace(/^tile_obstacle_/, '')] || Object.values(ORE_TYPES).find(spec=>spec.file===t.file));
    // 地圖的素材尺寸可能早於物件編輯器；障礙物外觀與碰撞使用同一份尺寸。
    const file = String(t.file || '').replace(/\\/g, '/');
    const variant = file && typeof OBSTACLES !== 'undefined'
      ? OBSTACLES.flatMap(o => [o.h, o.v]).find(v => v && String(v.file || '').replace(/\\/g, '/') === file) : null;
    TILE_REGISTRY[t.id] = entry ? {...t,name:entry.name,file:entry.file,w:entry.w,h:entry.h}
      : variant ? {...t,w:variant.w,h:variant.h} : t;
  });
}
const mapTileById = id => TILE_REGISTRY[id];
const mapTileW = t => (t && t.w) || 1;
const mapTileH = t => (t && t.h) || 1;
const mapStampTurn = s => ((Number(s && s.rot) || 0) % 4 + 4) % 4;
const mapStampW = (s, t) => mapStampTurn(s) % 2 ? mapTileH(t) : mapTileW(t);
const mapStampH = (s, t) => mapStampTurn(s) % 2 ? mapTileW(t) : mapTileH(t);
function mapStampCells(cells, w, h, rot) {
  return (cells || []).map(([c, r]) => rot === 1 ? [h - 1 - r, c] : rot === 2 ? [w - 1 - c, h - 1 - r] : rot === 3 ? [r, w - 1 - c] : [c, r]);
}
const isMapObstacleTile = t => !!(t && (t.role === 'obstacle' || String(t.file || '').replace(/\\/g, '/').includes('/item-obstacle/') ||
  (typeof oilItemByFile === 'function' && oilItemByFile(t.file))));   // 油桶／油箱（js/oil-barrels.js）
function mapObstacleSpec(t) {
  const file = String(t.file || '').replace(/\\/g, '/');
  const oil = typeof oilItemByFile === 'function' && oilItemByFile(file);
  if (oil) {   // 油桶／油箱：HP 沿用裝飾物件的設定，只有最下面那排擋路
    const deco = (typeof DECORATIONS !== 'undefined' && DECORATIONS.find(d => d.id === oil[0])) || {};
    const solid = []; for (let c = 0; c < mapTileW(t); c++) solid.push([c, mapTileH(t) - 1]);
    return { type: oil[0], hp: deco.hp || 30, solid };
  }
  const ore = typeof oreByFile === 'function' && oreByFile(file);
  if (ore) {   // 異質碎片礦物（js/ore.js）：最下面一整排擋路（大型、稀有礦有 2 格寬）
    const solid = []; for (let c = 0; c < mapTileW(t); c++) solid.push([c, mapTileH(t) - 1]);
    return { type: ore[0], hp: ore[1].hp ?? 9999, solid: ore[1].solid ?? solid, ore: true };
  }
  for (const ob of OBSTACLES) for (const orient of ['h', 'v']) {
    if (ob[orient] && ob[orient].file === file) return { type: ob.id, hp: ob.hp, solid: ob[orient].solid, trap: !!ob.trap };
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
// 預先下載素材：先只下載「這張地圖」用到的（載入畫面會等它們），
// 其他地圖的素材等這批下載完，再安靜地在背景下載（不擋遊戲，見 js/asset-gate.js）
function mapUsedTileIds(m) {
  const ids = new Set();
  if (!m) return ids;
  for (const s of m.stamps || []) ids.add(s.id);
  for (const layer of Object.values(m.layers || {})) for (const id of Object.values(layer)) ids.add(id);
  return ids;
}
function preloadMapTiles(m) {
  if(typeof MRT_GATE_ART!=='undefined'&&mapUsedTileIds(m).has('tile_mrt_ticket_gate')){
    tileImage(MRT_GATE_ART.frame);tileImage(MRT_GATE_ART.wings);
  }
  tileImage({ id: '__field-base-fail', file: 'images/field-camp/field-base-fail.png' });
  tileImage({ id: '__warning-line-fail', file: 'images/field-camp/warning-line-fail.png' });
  const used = mapUsedTileIds(m);
  if([...used].some(id=>String(mapTileById(id)?.file||'').endsWith('/storage-locker-closed.png')))used.add('tile_interactive_storage_locker_open');
  Object.values(TILE_REGISTRY).forEach(t => { if (t.file && used.has(t.id)) tileImage(t); });
  const rest = () => Object.values(TILE_REGISTRY).forEach(t => { if (t.file) tileImage(t); });
  if (typeof AssetGate === 'undefined') { rest(); return; }
  AssetGate.whenIdle(() => setTimeout(() => AssetGate.quiet(rest), 500));
}

// ---- 當前地圖 ----
let MAP = null, mapBreakable = [], mapPortals = [], mapBases = [];
// 安全場景（例如回基地）：不生怪、不套黑幕。由地圖的 safe 欄位決定（地圖編輯器可勾選）
let MAP_SAFE = false;
// 場景 NPC（克莉思、路德…）只在有勾「場景 NPC」的地圖出現
let MAP_NPCS = false;
// 劇情地圖（地圖編輯器勾「劇情地圖」＝地圖的 story 欄位）：只有溫特一個人走進來看劇情。
// 跟安全區一樣不生怪、沒有核心、不算戰鬥，但隊友不會跟進來、跟戰鬥地圖一樣有黑幕（MAP_FIELD）；從戰鬥地圖進來時戰場會暫停保存（js/combat-progress.js）
let MAP_STORY = false;
// 有黑幕、可以自己蓋建築放燈、頭燈和手電筒會亮的地方：戰鬥地圖，加上劇情地圖（劇情地圖一樣沒有怪物）
let MAP_FIELD = false;
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
  if (typeof settleSortieMoney === 'function' && !(typeof pausedBattle !== 'undefined' && pausedBattle && pausedBattle.G === G)) settleSortieMoney();   // 離開戰鬥地圖：剩下的作戰經費帶回基地（js/progression.js）；走進劇情地圖、戰場暫停中的不算（還沒打完）
  const list = mapList();
  if (typeof AssetGate !== 'undefined' && AssetGate.arm) AssetGate.arm();   // 換地圖：這張地圖要的圖片下載好之前先擋住（js/asset-gate.js）
  if (i >= 0 && i < list.length) { MAP_INDEX = i; initMap(); }
}
function initMap() {
  const next = pickMap();
  buildTileRegistry(next);
  MAP = next;
  window.STORY_MODE = !!StoryScene.config();
  MAP_LAYER_ORDER = mapLayerOrderOf(MAP);   // 這張地圖自己的圖層
  if(typeof resetMapPower==='function')resetMapPower();
  preloadMapTiles(MAP);
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
  // 大於畫面、需要捲動的大型地圖再放大 VIEW_ZOOM 倍；
  // 塞得進畫面的房間至少也放大 VIEW_ZOOM 倍（人物大小跟大地圖一致），本來就放得更大的小房間照樣填滿畫面
  if (fitWidth < 1 || fitHeight < 1) VIEW_SCALE *= VIEW_ZOOM;
  else VIEW_SCALE = Math.max(VIEW_SCALE, VIEW_ZOOM);

  // 安全場景：沒有怪物、沒有黑幕（整張地圖都是亮的）
  MAP_STORY = !window.STORY_MODE && !!MAP.story;
  MAP_SAFE = (window.STORY_MODE || !!MAP.safe || MAP_STORY) && !(typeof practiceOn === 'function' && practiceOn());   // 訓練室練習中：暫時當成戰鬥區域（js/practice.js）
  MAP_NPCS = !!MAP.npcs;
  MAP_FIELD = !MAP_SAFE || MAP_STORY;
  LIGHT.enabled = window.STORY_MODE ? !!StoryScene.config().darkness : LIGHT_BASE_ENABLED && MAP_FIELD;

  // 規則覆蓋數值（沒填的沿用 balance.js 預設）
  const R = MAP.rules || {};
  if (R.money != null) START.money = R.money;
  if (R.guide != null) { START.guide = R.guide; START.guideMax = Math.max(START.guideMax, R.guide); }
  if (R.guideRegen != null) START.guideRegen = R.guideRegen;

  // 結構：固定牆、可破壞、入口、營地
  mapWalls = new Set(MAP.solid || []);                                   // pathfinding.js 的全域
  // 牆格整組重建了：上一張地圖的門、捷運閘門、可炸牆、置物箱「加進去的格子」不能再拿來刪
  // （不然上一張地圖剛好在同一格有門，就會把這張地圖本來畫好的牆刪掉，人可以穿牆）
  if (typeof doorAddedWalls !== 'undefined') doorAddedWalls = new Set();
  if (typeof mrtAddedWalls !== 'undefined') mrtAddedWalls = new Set();
  if (typeof breakableWallCells !== 'undefined') { breakableWallCells = new Set(); breakableWallSolid = new Set(); }
  if (typeof storageAddedWalls !== 'undefined') storageAddedWalls = new Set();
  for (const stamp of MAP.stamps || []) if (isElevatorStamp(stamp)) setElevatorSolids(stamp, 'closed');
  mapSolidOffsets = MAP.solidOffsets || {};                              // 不可穿透格的像素微調
  // 每張椅子的擋路格由椅子編輯器決定；一般格子圖片與大圖擺放都套用。
  const addChairSolid = (id, c, r, fx = false, fy = false, stamp = null) => {
    const cfg = chairConfig(id), tile = mapTileById(id);
    if (!cfg || !tile) return;
    const w = stamp ? mapStampW(stamp, tile) : mapTileW(tile), h = stamp ? mapStampH(stamp, tile) : mapTileH(tile);
    const cells = stamp ? mapStampCells(cfg.solid, mapTileW(tile), mapTileH(tile), mapStampTurn(stamp)) : cfg.solid;
    for (const [dx, dy] of cells) {
      const cc = c + (fx ? w - 1 - dx : dx), rr = r + (fy ? h - 1 - dy : dy);
      if (inGrid(cc, rr)) mapWalls.add(cc + ',' + rr);
    }
  };
  for (const layer of Object.values(MAP.layers || {})) for (const [key, id] of Object.entries(layer)) {
    const [c, r] = key.split(',').map(Number);
    addChairSolid(id, c, r);
  }
  for (const s of MAP.stamps || []) addChairSolid(s.id,
    s.c + Math.round((s.ox || 0) / CELL), s.r + Math.round((s.oy || 0) / CELL), !!s.fx, !!s.fy, s);
  mapBases = (MAP.stamps || []).filter(s => {
    const t = mapTileById(s.id);
    return !!(t && t.baseHp);
  });
  // 地圖上有基地時，怪物自動把基地中央當成營地目標；不必另外手動畫營地格。
  const baseTargets = mapBases.map(s => {
    const t = mapTileById(s.id);
    const baseC = s.c + Math.round((s.ox || 0) / CELL), baseR = s.r + Math.round((s.oy || 0) / CELL);
    return (baseC + Math.floor(mapStampW(s, t) / 2)) + ',' + (baseR + Math.floor(mapStampH(s, t) / 2));
  });
  campCells = new Set(baseTargets.length ? baseTargets : ((MAP.camp && MAP.camp.length) ? MAP.camp : []));    // 空＝預設最下排
  mapBreakable = (MAP.breakable || []).map(k => k.split(',').map(Number));
  mapPortals = (MAP.portals || []).map(p => ({ c: p.c, r: p.r, to: p.to }));   // 出入口：走到門旁按鍵可換地圖
}
// 出入口查詢
function mapIndexById(id) { const list = mapList(); return list.findIndex(m => m && m.id === id); }
let lastPortalTrip = null;
function returnPortalCell(fromId, source = null) {
  const reciprocal = mapPortals.filter(p => p.to === fromId);
  if (!source) return reciprocal[0] || null;
  const stairDir = p => typeof stairPortalDir === 'function' ? stairPortalDir(p) : null;
  let candidates = reciprocal;
  if (source.stair) {
    const stairs = reciprocal.filter(p => stairDir(p));
    // 缺少回程連結時仍落在樓梯，不退回地圖的預設出生點。
    candidates = stairs.length ? stairs : reciprocal.length ? reciprocal : mapPortals.filter(p => stairDir(p));
  }
  const previous = lastPortalTrip;
  const returning = previous && previous.from === MAP.id && previous.to === fromId &&
    source.map === previous.arrivalMap && previous.arrival &&
    Math.hypot(source.c - previous.arrival.c, source.r - previous.arrival.r) <= 1.5;
  let back = returning ? candidates.find(p => p.c === previous.departure.c && p.r === previous.departure.r) : null;
  if (!back) {
    const opposite = source.stair === 'up' ? 'down' : 'up';
    const score = p => {
      const dir = stairDir(p);
      const kindPenalty = source.stair ? (dir ? 0 : 4) : (dir ? 4 : 0);
      const directionPenalty = source.stair && dir && dir !== opposite ? 2 : 0;
      const distance = Math.hypot((p.c + .5) / MAP.cols - (source.c + .5) / source.cols,
        (p.r + .5) / MAP.rows - (source.r + .5) / source.rows);
      return kindPenalty + directionPenalty + distance;
    };
    back = candidates.slice().sort((a, b) => score(a) - score(b))[0] || null;
  }
  lastPortalTrip = { from: fromId, to: MAP.id, departure: source, arrival: back, arrivalMap: MAP };
  return back;
}

// ---- 不可穿透格的像素微調 ----
// 一般的不可穿透格＝整格 40×40 都擋。地圖編輯器可以幫某些格子加上像素位移，
// 讓擋路範圍對齊美術（例如沙發用方向鍵微調過位置）。位移後的方框可能跨到鄰格，
// 所以判定時要連周圍 8 格一起看。怪物尋路仍然以「整格」為單位（見 pathfinding.js）。
let mapSolidOffsets = {};
const solidOffsetAt = (c, r) => mapSolidOffsets[c + ',' + r];
// 電梯物件清單快取：地圖物件很多，每次碰撞判定都整張掃一遍會很慢
let elevatorStampCache = { list: null, src: null, len: -1 };
function elevatorStamps() {
  const src = MAP?.stamps || [];
  if (elevatorStampCache.src !== src || elevatorStampCache.len !== src.length)
    elevatorStampCache = { list: src.filter(isElevatorStamp), src, len: src.length };
  return elevatorStampCache.list;
}
function elevatorBlocksPoint(x, y) {
  for (const stamp of elevatorStamps()) {
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
// ---- 視線：兩點之間有沒有被固定牆擋住 ----
// 只有地圖的固定牆（含微調過的牆面、關著的電梯門）會擋；玩家蓋的路障、鐵絲網等比較矮，可以從上面打過去。
// 沿線每 6px 檢查一次；線剛好擦過牆角時，左右各偏 5px 再試一次，有一條通就算看得到（避免卡卡的誤判）。
function hasLineOfSight(x0, y0, x1, y1) {
  const clear = (ox, oy) => {
    const ax = x0 + ox, ay = y0 + oy, bx = x1 + ox, by = y1 + oy;
    const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / 6));
    for (let i = 1; i < n; i++) {
      const k = i / n;
      if (solidBlocksPoint(ax + (bx - ax) * k, ay + (by - ay) * k)) return false;
    }
    return true;
  };
  if (clear(0, 0)) return true;
  const d = Math.hypot(x1 - x0, y1 - y0) || 1, px = -(y1 - y0) / d * 5, py = (x1 - x0) / d * 5;
  return clear(px, py) || clear(-px, -py);
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
// 舊的「波次入口」已經拿掉了：沒有格子是入口（保留這個函式，其他地方的判斷才不用一個個改）
const isEntrance = () => false;

// 開局時把「可破壞」擺成障礙物（每次 newGame 呼叫）
function seedMapObstacles() {
  if (!MAP) return;
  for (const s of mapBases) {
    const t = mapTileById(s.id);
    if (!t) continue;
    const w = mapStampW(s, t), h = mapStampH(s, t), baseW = mapTileW(t), baseH = mapTileH(t);
    const baseC = s.c + Math.round((s.ox || 0) / CELL), baseR = s.r + Math.round((s.oy || 0) / CELL);
    const hasCustomSolid = Array.isArray(s.baseSolid);
    const sourceSolid = hasCustomSolid ? s.baseSolid : (Array.isArray(t.baseSolid) ? t.baseSolid : []);
    // 編輯器存的 s.baseSolid 已經是翻轉、旋轉後畫面上的格子（js/map-editor.js 的 baseSolidForStamp），不要再翻一次
    const solid = hasCustomSolid ? sourceSolid.map(cell => cell.slice())
      : mapStampCells(sourceSolid, baseW, baseH, mapStampTurn(s)).map(([dc, dr]) => [s.fx ? w - 1 - dc : dc, s.fy ? h - 1 - dr : dr]);
    const hp = Math.max(1, Number(s.baseHp != null ? s.baseHp : t.baseHp) || 2000);
    const o = {
      kind: 'obstacle', isBase: true, mapTileId: t.id, baseStamp: s,
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
    const spec = mapObstacleSpec(t), w = stamp ? mapStampW(stamp, t) : mapTileW(t), h = stamp ? mapStampH(stamp, t) : mapTileH(t);
    if (spec.trap) {   // 地雷：埋在地上、不擋路
      G.obstacles.push({ kind: 'obstacle', mapSource: source, mapTileId: t.id, type: spec.type, c, r, w: 1, h: 1, solid: [], hp: spec.hp, maxhp: spec.hp, hitT: 0, trap: true });
      return;
    }
    const slow = typeof SLOW_BUILDINGS !== 'undefined' && SLOW_BUILDINGS[spec.type];
    if (slow) {   // 減速建築（鐵絲網）：不擋路，走在上面變慢
      G.obstacles.push({ kind: 'obstacle', mapSource: source, mapTileId: t.id, type: spec.type, c, r, w, h, solid: [], hp: spec.hp, maxhp: spec.hp, hitT: 0, slow });
      return;
    }
    const glow = LIGHT.buildings && LIGHT.buildings[spec.type];
    if (glow && !(spec.solid || []).length) {   // 露營燈：不擋路，但要擺上場才會發光（跟玩家自己放的一樣）；同一格不同圖層各畫一盞只算一盞
      if (G.obstacles.some(o => o.mapSource && o.type === spec.type && o.c === c && o.r === r)) return;
      G.obstacles.push({ kind: 'obstacle', mapSource: source, mapTileId: t.id, type: spec.type, c, r, w, h, solid: [], hp: spec.hp, maxhp: spec.hp, hitT: 0 });
      return;
    }
    const solid = (stamp ? mapStampCells(spec.solid || [], mapTileW(t), mapTileH(t), mapStampTurn(stamp)) : (spec.solid || []))
      .map(([dc, dr]) => [stamp && stamp.fx ? w - 1 - dc : dc, stamp && stamp.fy ? h - 1 - dr : dr])
      .filter(([dc, dr]) => inGrid(c + dc, r + dr) && !G.grid[(c + dc) + ',' + (r + dr)]);
    if (!solid.length) return;
    const o = { kind: 'obstacle', mapSource: source, mapTileId: t.id, type: spec.type,
      c, r, w, h, solid, hp: spec.hp, maxhp: spec.hp, hitT: 0, ore: !!spec.ore };
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
function drawMapTileImg(ctx, id, x, y, layer='top') {
  let t = mapTileById(id); if (!t) return;
  const [c,r]=cellAt(x,y);
  const display=typeof storagePropDisplayTile==='function'?storagePropDisplayTile(id,c,r,layer):null;
  if(display===false)return;
  if(display)t=display;
  if (typeof ballBedHidden === 'function' && ballBedHidden(c + ',' + r, id)) return;   // 球球睡在這張床上：只畫睡覺圖（js/ball-poses.js）
  if (t.color) { ctx.fillStyle = t.color; ctx.fillRect(x, y, CELL, CELL); return; }
  const img = tileImage(t);
  if (img) {
    ctx.save();if(typeof isPoweredLightTile==='function'&&isPoweredLightTile(t)&&!mapPowerIsOn())ctx.filter='brightness(0.35)';
    ctx.drawImage(img,x,y,CELL,CELL);ctx.restore();return;
  }
  if (t.role === 'wall') { ctx.fillStyle = '#3f434b'; ctx.fillRect(x + 2, y + 2, CELL - 4, CELL - 4); }
  else if (t.role === 'obstacle') { ctx.fillStyle = '#7a5a3a'; ctx.fillRect(x + 4, y + 4, CELL - 8, CELL - 8); }
  else { ctx.fillStyle = '#20262f'; ctx.fillRect(x, y, CELL, CELL); }
}
function destroyedBaseDisplayTile(s, t) {
  if (!G.destroyedBases?.size) return t;
  const file = String(t.file || '').replace(/\\/g, '/');
  if (G.destroyedBases.has(s) && (t.baseHp || file.endsWith('/field-base.png'))) {
    return { ...t, id: '__field-base-fail', file: 'images/field-camp/field-base-fail.png' };
  }
  if (file.endsWith('/warning-line.png') || t.name === 'warning-line') {
    const x = s.c * CELL + (s.ox || 0), y = s.r * CELL + (s.oy || 0);
    for (const base of G.destroyedBases) {
      const bt = mapTileById(base.id); if (!bt) continue;
      const bx = base.c * CELL + (base.ox || 0), by = base.r * CELL + (base.oy || 0);
      if (x < bx + mapStampW(base, bt) * CELL && x + mapStampW(s, t) * CELL > bx &&
          y < by + mapStampH(base, bt) * CELL && y + mapStampH(s, t) * CELL > by) {
        return { ...t, id: '__warning-line-fail', file: 'images/field-camp/warning-line-fail.png' };
      }
    }
  }
  return t;
}
function drawMapStampImg(ctx, s) {
  if (typeof G !== 'undefined' && G && G.mapDestroyed && G.mapDestroyed.has(s)) return;
  if (typeof doorStampOpen === 'function' && doorStampOpen(s)) return;   // 打開的門：圖片直接消失
  if (typeof ballBedHidden === 'function' && ballBedHidden(s)) return;   // 球球睡在這張床上：只畫睡覺圖（js/ball-poses.js）
  let t = mapTileById(s.id); if (!t) return;
  t = destroyedBaseDisplayTile(s, t);
  if (typeof breakableWallDisplayTile === 'function') t = breakableWallDisplayTile(s, t);   // 可炸開的牆：裂痕／破洞（js/breakable-walls.js）
  if (typeof mrtDisplayTile === 'function') t = mrtDisplayTile(s, t);   // 解封的捷運入口換圖（js/mrt-locks.js）
  const display=typeof storagePropDisplayTile==='function'?storagePropDisplayTile(s.id,s.c,s.r,s.layer||'top',s):null;
  if(display===false)return;
  if(display)t=display;
  let w = mapTileW(t) * CELL, h = mapTileH(t) * CELL, rot = mapStampTurn(s);
  // 旋轉後的圖跟編輯器一樣：左上角固定在 (c, r)＋微調，往右下佔「轉向後的寬高」，不再以原本大小的中心為準
  let x = OX + s.c * CELL + (s.ox || 0), y = OY + s.r * CELL + (s.oy || 0);
  const opened = (typeof ammoCrateOpenTile === 'function' && ammoCrateOpenTile(s))   // 剛補給過的彈藥箱：換成打開的圖
    || (typeof supplyBoxTile === 'function' && supplyBoxTile(s));   // 物資箱：照箱子裡的數量換圖（js/camp-supply.js）
  if (opened) { const h2 = mapTileH(opened) * CELL; y += h - h2; h = h2; w = mapTileW(opened) * CELL; t = opened; }
  if (t.color) { ctx.fillStyle = t.color; ctx.fillRect(x, y, w, h); return; }
  const img = isElevatorLightTile(t) && elevatorLightIsOpen(s.c, s.r) && elevatorLightOpenImage.complete && elevatorLightOpenImage.naturalWidth
    ? elevatorLightOpenImage : tileImage(t);
  if (img) {
    const gate=G.obstacles.find(o=>o.type==='irongate'&&o.mapSource===s);
    if(gate&&drawSlidingIronGate(ctx,gate,img,x,y,w,h))return;
    ctx.save();if(typeof isPoweredLightTile==='function'&&isPoweredLightTile(t)&&!mapPowerIsOn(circuitOf(s)))ctx.filter='brightness(0.35)';   // 電路編號（js/powered-lights.js）
    const drawW = rot % 2 ? h : w, drawH = rot % 2 ? w : h;
    if (s.fx || s.fy || rot) {
      ctx.save(); ctx.translate(x + drawW / 2, y + drawH / 2); if (rot) ctx.rotate(rot * Math.PI / 2);
      ctx.scale(s.fx ? -1 : 1, s.fy ? -1 : 1);
      if(!(typeof drawMrtGateAnimation==='function'&&drawMrtGateAnimation(ctx,s,img,-w/2,-h/2,w,h)))ctx.drawImage(img,-w/2,-h/2,w,h);
      ctx.restore();
    } else if(typeof drawMrtGateAnimation==='function'&&drawMrtGateAnimation(ctx,s,img,x,y,w,h)) {
      // 閘門的靜態機台與滑動門翼由專用繪製處理。
    } else {
      const hole = typeof mrtStampHole === 'function' ? mrtStampHole(s) : null;   // 打開的捷運閘門：門板那塊不畫（js/mrt-locks.js）
      if (hole) { ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.rect(x + hole[0] * w, y + hole[1] * h, hole[2] * w, hole[3] * h); ctx.clip('evenodd'); }
      ctx.drawImage(img, x, y, w, h);
      if (hole) ctx.restore();
    }
    ctx.restore();
    return;
  }
  ctx.fillStyle = t.role === 'wall' ? '#3f434b' : (t.role === 'obstacle' ? '#7a5a3a' : '#2b3446');
  ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
}
function drawMapImages(ctx) {
  if (!MAP) return;
  for (const lid of MAP_LAYER_ORDER) {
    const layer = MAP.layers ? (MAP.layers[lid] || {}) : {};
    for (const key in layer) { if (G.mapDestroyed.has(lid + ':' + key)) continue; const [c, r] = key.split(',').map(Number); drawMapTileImg(ctx, layer[key], OX + c * CELL, OY + r * CELL, lid); }
    for (const s of (MAP.stamps || [])) if ((s.layer || 'top') === lid) drawMapStampImg(ctx, s);
  }
}
function hasImageAt(c, r) {
  if (!MAP) return false;
  const key = c + ',' + r;
  for (const lid of MAP_LAYER_ORDER) if (MAP.layers && MAP.layers[lid] && MAP.layers[lid][key]) return true;
  for (const s of (MAP.stamps || [])) { const t = mapTileById(s.id) || {}; if (c >= s.c && c < s.c + mapStampW(s, t) && r >= s.r && r < s.r + mapStampH(s, t)) return true; }
  return false;
}

// ---- 深度排序：判斷一張圖是「會遮擋角色的立體物」還是「平的地面」----
//   規則：'top' 圖層永遠在角色上面（樹冠/屋簷）；
//   其餘圖層中，高度≥2格 或 放在 object/overlay 圖層 的，視為立體物 → 和角色一起排序；
//   剩下扁平的（多半是地板）留在地面、永遠在角色下面。
const OCC_MIN_H = 2;                                   // 幾格高(含)以上算「立體物」
const isOccLayer = lid => /^object\d*$/.test(lid) || lid === 'overlay';   // 物件、物件2～4、物件裝飾都是「立體物」
// flat:true 的圖＝平貼地面（紅線、裂痕、碎石等），永遠畫在角色下方、不遮擋
const stampIsOcc = s => { const t = mapTileById(s.id) || {}; return Number.isFinite(s.sortDepth) || !!chairConfig(s.id) || !!t.baseHp || (!t.flat && (mapStampH(s, t) > 1 || isOccLayer(s.layer || 'top'))); };

// ---- 只畫畫面看得到的地方 ----
// 大地圖（例如 Y 區 56×60 格）如果每一幀都把整張地圖的每一格、每張圖重畫一次，會很卡。
// 所以只畫「鏡頭照得到的範圍＋四周多 MAP_DRAW_MARGIN 格」：畫面約 260～300 格，四周各多 2 格後約 400 格。
// 緩衝讓走動時畫面邊緣先畫好，也讓只露出一角的大圖（高柱、牆）不會被切掉。地圖資料完全不變。
const MAP_DRAW_MARGIN = 2;   // 畫面四周多畫幾格（2＝總共約 400 格）
let mapDrawRect = null;      // 這一幀要畫的範圍（世界座標像素）
// 熱身：瀏覽器要等一張圖「第一次真的被畫出來」才會把它準備好（解碼），所以第一次走到新的地方會頓一下。
// 換地圖、圖片都下載好之後的第一幀，先把整張地圖畫一次，所有圖片一開始就準備好；之後才只畫看得到的範圍。
let mapDrawWarmFor = null;   // 已經熱身過的地圖
let mapDrawFull = false;     // 這一幀要畫整張地圖（熱身中）
function updateMapDrawRect() {
  mapDrawFull = false;
  if (MAP && mapDrawWarmFor !== MAP && (typeof AssetGate === 'undefined' || !AssetGate.pendingCount)) {
    mapDrawWarmFor = MAP; mapDrawFull = true; mapDrawRect = null;
    if (typeof AssetGate !== 'undefined' && AssetGate.arm) AssetGate.arm();   // 熱身這一幀才第一次用到的圖（換過的門、打開的櫃子…）也在剛進地圖時就載好
    return null;
  }
  if (typeof cam === 'undefined' || typeof viewW !== 'function') { mapDrawRect = null; return null; }
  const m = MAP_DRAW_MARGIN * CELL;
  return (mapDrawRect = { x0: cam.x - m, y0: cam.y - m, x1: cam.x + viewW() + m, y1: cam.y + viewH() + m });
}
// 這個範圍內有哪幾格（c0～c1、r0～r1）
function mapDrawCells() {
  const v = mapDrawFull ? null : (mapDrawRect || updateMapDrawRect());
  if (!v) return { c0: 0, r0: 0, c1: COLS - 1, r1: ROWS - 1 };
  return { c0: Math.max(0, Math.floor((v.x0 - OX) / CELL)), r0: Math.max(0, Math.floor((v.y0 - OY) / CELL)),
    c1: Math.min(COLS - 1, Math.floor((v.x1 - OX) / CELL)), r1: Math.min(ROWS - 1, Math.floor((v.y1 - OY) / CELL)) };
}
// 一張大圖有沒有任何一部分在範圍內（旋轉過的圖用比較寬的範圍判斷，寧可多畫不要切掉）
function stampInDrawRect(s) {
  const v = mapDrawRect; if (!v) return true;
  const t = mapTileById(s.id) || {}, w = mapTileW(t) * CELL, h = mapTileH(t) * CELL, half = Math.max(w, h) / 2;
  const cx = OX + s.c * CELL + (s.ox || 0) + w / 2, cy = OY + s.r * CELL + (s.oy || 0) + h / 2;
  return cx + half > v.x0 && cx - half < v.x1 && cy + half > v.y0 && cy - half < v.y1;
}
// 畫某一層範圍內的小圖（格子）
function drawLayerCellsInView(ctx, lid) {
  const layer = MAP.layers ? (MAP.layers[lid] || {}) : {};
  const { c0, r0, c1, r1 } = mapDrawCells();
  for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) {
    const key = c + ',' + r, id = layer[key];
    if (!id || G.mapDestroyed.has(lid + ':' + key) || chairConfig(id)) continue;
    drawMapTileImg(ctx, id, OX + c * CELL, OY + r * CELL, lid);
  }
}
// 地面：所有「非立體物、非上層」的圖片，永遠畫在角色下面
function drawMapGround(ctx) {
  if (!MAP) return;
  updateMapDrawRect();   // 每一幀先算一次這一幀要畫的範圍（render.js 的 draw 最先畫地面）
  for (const lid of MAP_LAYER_ORDER) {
    if (lid === 'top') continue;
    if (!isOccLayer(lid)) drawLayerCellsInView(ctx, lid);
    for (const s of (MAP.stamps || [])) if (!isElevatorStamp(s) && (s.layer || 'top') === lid && !stampIsOcc(s) && stampInDrawRect(s)) drawMapStampImg(ctx, s);
  }
}
// 上層：'top' 圖層，永遠畫在角色上面
function drawMapTop(ctx) {
  if (!MAP) return;
  drawLayerCellsInView(ctx, 'top');
  for (const s of (MAP.stamps || [])) {
    if (isElevatorStamp(s) || !stampInDrawRect(s)) continue;
    if (chairConfig(s.id)) continue;
    if ((s.layer || 'top') !== 'top') continue;
    const t = mapTileById(s.id) || {};
    if (!t.baseHp && !Number.isFinite(s.sortDepth)) drawMapStampImg(ctx, s);
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
      if (lid === 'top' && !t.baseHp && !chair && !Number.isFinite(s.sortDepth)) continue;
      const x0 = s.c * CELL + (s.ox || 0), y0 = s.r * CELL + (s.oy || 0), stampWpx = mapStampW(s, t) * CELL, stampHpx = mapStampH(s, t) * CELL;
      const depth = chair ? y0 + (s.fy ? mapStampH(s, t) * CELL - chair.depth : chair.depth) : t.baseHp
        ? Math.max(0, Math.min(mapStampH(s, t), Number.isFinite(s.baseDepth) ? s.baseDepth : (Number.isFinite(t.baseDepth) ? t.baseDepth : Math.max(1, mapStampH(s, t) - 2))))
        : (Number.isFinite(s.sortDepth) ? Math.max(0, Math.min(mapStampH(s, t), s.sortDepth)) : null);
      items.push({ li, x0, y0, x1: x0 + stampWpx, y1: y0 + stampHpx,
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
  buildLayerOverdraw(items);
  occCache = items; occCacheFor = MAP;
  return items;
}
// ---- 讓「編輯器裡在上層的圖」在遊戲裡也蓋在上面 ----
// 立體物依底部Y排序（角色才能走到前後），但這個順序可能跟編輯器的圖層相反：
// 例如牆上的監視器（平貼）、床頭牆板、比書桌低一點的椅子，進遊戲會被下層的牆／書桌蓋掉。
// 做法：畫完一個立體物之後，把「圖層比它高、跟它重疊、卻比它先畫」的圖，
// 只在重疊的範圍內再補畫一次。這樣只修正圖跟圖之間的上下，角色被遮擋的方式不變。
function buildLayerOverdraw(items) {
  const flats = (MAP.stamps || []).filter(s => !isElevatorStamp(s) && (s.layer || 'top') !== 'top' && !stampIsOcc(s)).map(s => {
    const t = mapTileById(s.id) || {}, x0 = s.c * CELL + (s.ox || 0), y0 = s.r * CELL + (s.oy || 0);
    return { flat: true, li: MAP_LAYER_ORDER.indexOf(s.layer || 'top'), x0, y0, x1: x0 + mapStampW(s, t) * CELL, y1: y0 + mapStampH(s, t) * CELL, kind: 'stamp', stamp: s };
  });
  // 立體物在遊戲裡的實際先後（底部Y，同樣的話照原本順序）
  const rank = new Map([...items].map((it, k) => ({ it, k })).sort((a, b) => a.it.y - b.it.y || a.k - b.k).map((o, n) => [o.it, n]));
  const order = new Map([...items, ...flats].map((it, k) => [it, k]));
  for (const x of items) {
    x.overdraw = [];
    for (const a of [...items, ...flats]) {
      if (a === x || a.li <= x.li) continue;                   // 只管比它上層的圖
      if (!a.flat && rank.get(a) > rank.get(x)) continue;       // 本來就比它晚畫，不用補
      const cx0 = Math.max(a.x0, x.x0), cy0 = Math.max(a.y0, x.y0), cx1 = Math.min(a.x1, x.x1), cy1 = Math.min(a.y1, x.y1);
      if (cx1 <= cx0 || cy1 <= cy0) continue;
      x.overdraw.push({ a, clip: [cx0, cy0, cx1 - cx0, cy1 - cy0] });
    }
    x.overdraw.sort((p, q) => p.a.li - q.a.li || order.get(p.a) - order.get(q.a));   // 依編輯器圖層由下往上補畫
  }
}
function drawOccluderItem(ctx, it) {
  if (it.kind === 'cell') {
    if (!G.mapDestroyed.has(MAP_LAYER_ORDER[it.li] + ':' + it.c + ',' + it.r)) drawMapTileImg(ctx, it.id, OX + it.c * CELL, OY + it.r * CELL, MAP_LAYER_ORDER[it.li]);
  } else drawMapStampImg(ctx, it.stamp);
}
function collectMapOccluders(ctx, out) {
  if (!MAP) return;
  const v = mapDrawFull ? null : (mapDrawRect || updateMapDrawRect());
  for (const it of mapOccluders()) {
    if (v && (it.kind === 'stamp' ? !stampInDrawRect(it.stamp)   // 在畫面範圍外：這一幀不畫
      : (it.x1 + OX <= v.x0 || it.x0 + OX >= v.x1 || it.y1 + OY <= v.y0 || it.y0 + OY >= v.y1))) continue;
    if (it.kind === 'cell' && G.mapDestroyed.has(MAP_LAYER_ORDER[it.li] + ':' + it.c + ',' + it.r)) continue;
    out.push({ y: it.y, draw: () => {
      drawOccluderItem(ctx, it);
      for (const od of it.overdraw || []) drawOverdrawPatch(ctx, it, od);   // 上層圖在重疊處補畫回來
    } });
  }
}
// 補畫上層圖時，只補在「下層這張圖有畫東西的像素」上，不是整個重疊的長方形：
// 否則站在兩張圖之間的角色也會被蓋掉（例如坐在餐桌下排椅子上的人，頭被補畫的桌子整塊遮住）。
// 做法：在小畫布上畫上層圖，再用下層圖的形狀裁切（destination-in，不需要讀像素，雙擊開啟也能用）。
// 結果存起來重複使用；門開關、彈藥箱打開這類會變圖的，狀態一改就重做。
function occluderStateSig(x) {
  if (x.kind === 'cell') {
    const layer = MAP_LAYER_ORDER[x.li], shown = typeof storagePropDisplayTile === 'function' ? storagePropDisplayTile(x.id, x.c, x.r, layer) : null;
    return (G.mapDestroyed.has(layer + ':' + x.c + ',' + x.r) ? 'x' : '') + (shown === false ? 'h' : shown ? (shown.id || 's') : '');   // h＝這格目前不顯示
  }
  const s = x.stamp;
  return (G.mapDestroyed && G.mapDestroyed.has(s) ? 'x' : '') + ((typeof doorStampOpen === 'function' && doorStampOpen(s)) ? 'o' : '')
    + ((typeof ammoCrateOpenTile === 'function' && ammoCrateOpenTile(s)) ? 'a' : '')
    + (destroyedBaseDisplayTile(s, mapTileById(s.id) || {}).id || '')
    + (typeof breakableWallStage === 'function' && breakableWallStage(s) ? 'w' + breakableWallStage(s) : '')
    + (typeof ballBedHidden === 'function' && ballBedHidden(s) ? 'b' : '');
}
function occluderImageReady(x) {
  return !!tileImage(mapTileById(x.kind === 'cell' ? x.id : x.stamp.id));
}
function drawOverdrawPatch(ctx, it, od) {
  const [cx, cy, cw, ch] = od.clip;
  const sig = occluderStateSig(it) + '|' + occluderStateSig(od.a);
  if (!od.patch || !od.ready || od.sig !== sig) {
    const c = od.patch || (od.patch = document.createElement('canvas'));
    c.width = Math.max(1, Math.ceil(cw)); c.height = Math.max(1, Math.ceil(ch));
    const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
    g.save(); g.translate(-(OX + cx), -(OY + cy));
    drawOccluderItem(g, od.a);                       // 上層圖
    g.globalCompositeOperation = 'destination-in';
    drawOccluderItem(g, it);                         // 只留下層圖有畫東西的地方
    g.restore();
    od.ready = occluderImageReady(it) && occluderImageReady(od.a);   // 圖還沒載完：下一幀再做一次
    od.sig = sig;
  }
  ctx.drawImage(od.patch, OX + cx, OY + cy);
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
