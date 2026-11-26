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
// 陸橋（2 樓）的圖層：地圖編輯器圖層面板設成「2 樓」的圖層（圖層的 level＝2，js/map-levels.js）——裡面的圖蓋在一樓的人上面、2 樓的人走在它上面。
// 設成「2 樓上層」的（top2）永遠蓋在 2 樓的人上面（像屋簷）；其他照底部Y跟 2 樓的人排前後，地板類（非物件圖層）永遠在人下面。
let MAP_FLOOR2_LAYERS = new Set(), MAP_FLOOR2_TOP = new Set();
function computeFloor2Layers(m) {
  const L = MapLevels.floor2Layers(m);   // 只看圖層寫明的樓層，不看名字
  MAP_FLOOR2_LAYERS = L.all; MAP_FLOOR2_TOP = L.top;
}
const mapLayerOrderOf = m => (m && Array.isArray(m.layerOrder) && m.layerOrder.length) ? m.layerOrder.map(l => l.id) : DEFAULT_MAP_LAYER_ORDER;
const TILE_REGISTRY = {};
// map＝要載入的地圖：戰鬥地圖用地圖編輯器的素材設定、基地用基地編輯器的（js/map-data.js 的 mapTileCatalog）
function buildTileRegistry(map) {
  if (typeof standingObstacleCache !== 'undefined') standingObstacleCache.clear();   // 換地圖：素材可能不同，重新判斷哪些是立著的障礙物
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
// 地圖物件變成的建築／礦物／油桶…：用方向鍵微調過位置時，c、r 是最近的格子，剩下不到半格的像素在 o.off（見下面 seedMapObstacles）。
// 算這種東西的中心、光源、爆炸範圍時要加上這段像素，判定才會跟畫面上的圖對齊
const obstacleOff = o => (o && o.off) || [0, 0];
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
  if (!rec) {
    rec = mapImgCache[t.id] = { img: new Image(), loaded: false, tries: 0 };
    rec.img.onload = () => { rec.loaded = true; };
    // 下載失敗（例如一次要下載太多張圖、伺服器來不及回）：隔一下再重抓，最多 5 次。
    // 以前失敗一次就永遠不會再抓，地上就一直畫成一塊灰色方塊（F307 的地面裂痕 6 就是這樣）
    rec.img.onerror = () => {
      if (++rec.tries > 5) return;
      setTimeout(() => { rec.img.src = t.file + (t.file.includes('?') ? '&' : '?') + 'retry=' + rec.tries; }, 400 * rec.tries);
    };
    rec.img.src = t.file;
  }
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
  return elevatorStamps().some(stamp =>
    Math.abs(stamp.c + 1 - c) <= 1 && Math.abs(stamp.r - r) <= 1 &&
    (stamp === openElevatorStamp || elevatorOpenAnim?.stamp === stamp || elevatorCloseAnim?.stamp === stamp));
}
function setElevatorSolids(stamp, phase) {
  const tile = mapTileById(stamp.id), cfg = elevatorConfig(stamp.id);
  if (!tile || !cfg) return;
  const { c: c0, r: r0, off } = stampSolidOrigin(stamp);   // 擋路格照像素微調對齊圖片
  for (let dr = 0; dr < mapTileH(tile); dr++) for (let dc = 0; dc < mapTileW(tile); dc++) {
    mapWalls.delete((c0 + dc) + ',' + (r0 + dr));
  }
  for (const [dc, dr] of cfg[phase].solid || []) {
    if (dc >= 0 && dc < mapTileW(tile) && dr >= 0 && dr < mapTileH(tile)) {
      const key = (c0 + dc) + ',' + (r0 + dr);
      mapWalls.add(key); addStampSolidOffset(key, off);
    }
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
  if (typeof rememberStoryBuilds === 'function') rememberStoryBuilds();   // 離開劇情地圖：蓋的建築記下來，下次回來還在（js/combat-progress.js）
  if (typeof settleSortieMoney === 'function' && !(typeof pausedBattle !== 'undefined' && pausedBattle && pausedBattle.G === G)) settleSortieMoney();   // 離開戰鬥地圖：剩下的作戰經費帶回基地（js/progression.js）；走進劇情地圖、戰場暫停中的不算（還沒打完）
  const list = mapList();
  if (typeof AssetGate !== 'undefined' && AssetGate.arm) AssetGate.arm();   // 換地圖：這張地圖要的圖片下載好之前先擋住（js/asset-gate.js）
  if (i >= 0 && i < list.length) { MAP_INDEX = i; initMap(); }
}
// 活動限定圖層：基地編輯器裡，圖層名稱有「慶功宴時顯現」的只有慶功宴才出現，有「慶功宴時隱藏」的只有平常才出現。
// 物件的外觀、擋路、椅子都跟著圖層走；不屬於這兩種的圖層不受影響。
// （用手畫的「不可穿透格」不分圖層，慶功宴和平常共用同一份）
function mapEventView(m) {
  if (!m || !Array.isArray(m.layerOrder)) return m;
  const hideMark = typeof partyOn === 'function' && partyOn() ? '慶功宴時隱藏' : '慶功宴時顯現';
  const hide = new Set(m.layerOrder.filter(l => String(l.name || '').includes(hideMark)).map(l => l.id));
  const stamps = (m.stamps || []).filter(s => !hide.has(s.layer || 'top'));
  const hasCells = [...hide].some(id => Object.keys((m.layers || {})[id] || {}).length);
  if (!hasCells && stamps.length === (m.stamps || []).length) return m;   // 這些圖層是空的：照原本的地圖
  const layers = { ...m.layers }; hide.forEach(id => { layers[id] = {}; });
  return { ...m, layers, stamps };
}
function initMap() {
  const next = mapEventView(pickMap());
  buildTileRegistry(next);
  MAP = next;
  window.STORY_MODE = !!StoryScene.config();
  MAP_LAYER_ORDER = mapLayerOrderOf(MAP);   // 這張地圖自己的圖層
  MapLevels.syncDeck(MAP, mapTileById);        // 2 樓地面自動從圖層算的地圖：照現在的圖層、牆地板標記重算一次（js/map-levels.js）
  computeFloor2Layers(MAP);                 // 設成 2 樓的圖層＝陸橋
  if(typeof resetMapPower==='function')resetMapPower();
  preloadMapTiles(MAP);
  openElevatorStamp = null;
  elevatorCloseAnim = null;
  elevatorOpenAnim = null;
  if (!MAP) return;

  // 地圖大小（可比畫面大；鏡頭會跟著玩家捲動）
  if (MAP.cols) COLS = MAP.cols;
  if (MAP.rows) ROWS = MAP.rows;

  // 小房間等比例完整置中；比畫面大的地圖（不論寬或高）一律 1 倍再乘 VIEW_ZOOM，鏡頭跟著玩家捲動。
  // （以前「短而寬的地圖以高度填滿畫面」會讓 3F／4F 走廊比 2F 大一圈，已拿掉：人物大小在每層樓都一樣）
  const fitWidth = VIEW_W / (COLS * CELL), fitHeight = VIEW_H / (ROWS * CELL);
  VIEW_SCALE = Math.max(1, Math.min(fitWidth, fitHeight));
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
  const fund = typeof REWARDS_DATA !== 'undefined' && REWARDS_DATA.entryFunds ? REWARDS_DATA.entryFunds[MAP.id] : null;
  if (fund != null) START.money = fund;   // 第一次進入的作戰經費：以 data/rewards.js 為準（🏅 獎勵編輯器）；沒寫的地圖才用上面地圖規則裡的
  if (R.guide != null) { START.guide = R.guide; START.guideMax = Math.max(START.guideMax, R.guide); }
  if (R.guideRegen != null) START.guideRegen = R.guideRegen;

  // 結構：固定牆、可破壞、入口、營地
  mapWalls = new Set(MAP.solid || []);                                   // pathfinding.js 的全域
  setMapFloors(MAP.deck, MAP.ramps, MAP.solid2);
  if (typeof setTrackCells === 'function') setTrackCells(MAP.track);   // 🛤️ 捷運軌道（地圖編輯器的軌道筆刷；js/pathfinding.js、js/mrt-track.js）                                     // 陸橋：2 樓地面、樓層出入口（js/pathfinding.js）
  setMapWallFaces(MapLevels.wallFaceCells(MAP, mapTileById));                         // 平台邊緣的牆面：2 樓的人不能走上去（js/map-levels.js）
  setMapFloor1Auto(MapLevels.auto1FWalls(MAP, mapTileById));                         // 只有 2 樓的格子：1 樓的人走不進去（js/map-levels.js）
  // 牆格整組重建了：上一張地圖的門、捷運閘門、可炸牆、置物箱「加進去的格子」不能再拿來刪
  // （不然上一張地圖剛好在同一格有門，就會把這張地圖本來畫好的牆刪掉，人可以穿牆）
  if (typeof doorAddedWalls !== 'undefined') doorAddedWalls = new Set();
  if (typeof mrtAddedWalls !== 'undefined') mrtAddedWalls = new Set();
  if (typeof breakableWallCells !== 'undefined') { breakableWallCells = new Set(); breakableWallSolid = new Set(); }
  if (typeof storageAddedWalls !== 'undefined') storageAddedWalls = new Set();
  mapSolidOffsets = MAP.solidOffsets || {};                              // 不可穿透格的像素微調（要在電梯、椅子加擋路格之前）
  for (const stamp of MAP.stamps || []) if (isElevatorStamp(stamp)) setElevatorSolids(stamp, 'closed');
  // 每張椅子的擋路格由椅子編輯器決定；一般格子圖片與大圖擺放都套用。
  // 用方向鍵微調過位置的椅子：擋路格也照像素對齊圖片（stampSolidOrigin／addStampSolidOffset）
  const addChairSolid = (id, c, r, fx = false, fy = false, stamp = null) => {
    const cfg = chairConfig(id), tile = mapTileById(id);
    if (!cfg || !tile) return;
    const w = stamp ? mapStampW(stamp, tile) : mapTileW(tile), h = stamp ? mapStampH(stamp, tile) : mapTileH(tile);
    const cells = stamp ? mapStampCells(cfg.solid, mapTileW(tile), mapTileH(tile), mapStampTurn(stamp)) : cfg.solid;
    const off = stamp ? stampSolidOrigin(stamp).off : null;
    for (const [dx, dy] of cells) {
      const cc = c + (fx ? w - 1 - dx : dx), rr = r + (fy ? h - 1 - dy : dy), key = cc + ',' + rr;
      if (!inGrid(cc, rr) || mapWalls.has(key)) continue;   // 已經是牆（地圖上畫的不可穿透格）：照舊整格擋
      mapWalls.add(key); addStampSolidOffset(key, off);
    }
  };
  for (const layer of Object.values(MAP.layers || {})) for (const [key, id] of Object.entries(layer)) {
    const [c, r] = key.split(',').map(Number);
    addChairSolid(id, c, r);
  }
  for (const s of MAP.stamps || []) { const o = stampSolidOrigin(s); addChairSolid(s.id, o.c, o.r, !!s.fx, !!s.fy, s); }
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
  mapPortals = (MAP.portals || []).map(p => ({ c: p.c, r: p.r, to: p.to, ...(p.hidden ? { hidden: true } : {}), ...(p.to === MAP.id && Array.isArray(p.at) ? { at: [p.at[0], p.at[1]] } : {}), ...(p.ox ? { ox: p.ox } : {}), ...(p.oy ? { oy: p.oy } : {}), ...(p.radius > 0 ? { radius: p.radius } : {}), ...(Array.isArray(p.land) ? { land: [p.land[0], p.land[1]] } : {}), ...(p.locked ? { locked: true, lockText: p.lockText || '' } : {}) }));   // land＝🦶 落地點（從別處來到這個出入口時站的位置，js/game.js 的 placePlayerNearPortal）；hidden＝隱藏地道（js/rescue-dog.js）；locked＝鎖住的出入口（走到／按空白鍵只會說「鎖住了」，基地編輯器🎯出入口微調設定）；at＝同地圖傳送點送到哪一格（js/game.js 的 teleportInMap）   // 出入口：走到門旁按鍵可換地圖
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
// 所以判定時要連周圍 8 格一起看。找路（isWall）也照微調後的位置算：格子正中間被蓋住才算牆（見 js/pathfinding.js 的 wall1F）。
let mapSolidOffsets = {};
const solidOffsetAt = (c, r) => mapSolidOffsets[c + ',' + r];
// 物件自帶的擋路格（椅子、置物箱、電梯、捷運閘門）：用方向鍵微調過位置（ox、oy 像素）的物件，
// 先四捨五入到最近的格子（stampSolidOrigin），剩下的 ±半格記成這格的像素微調（addStampSolidOffset），擋路範圍就跟著圖片走
function stampSolidOrigin(s) {
  const ox = s.ox || 0, oy = s.oy || 0, dc = Math.round(ox / CELL), dr = Math.round(oy / CELL);
  return { c: s.c + dc, r: s.r + dr, off: [ox - dc * CELL, oy - dr * CELL] };
}
function addStampSolidOffset(key, off) {   // 回傳有沒有加（這格本來就有微調、或沒偏移就不加）
  if (!off || (!off[0] && !off[1]) || mapSolidOffsets[key]) return false;
  if (MAP && mapSolidOffsets === MAP.solidOffsets) mapSolidOffsets = { ...mapSolidOffsets };   // 別改到地圖資料本身
  mapSolidOffsets[key] = off.slice(); solidOffsetsChanged();
  return true;
}
// 電梯物件清單快取：地圖物件很多，每次碰撞判定都整張掃一遍會很慢
let elevatorStampCache = { list: null, src: null, len: -1 };
function elevatorStamps() {
  const src = MAP?.stamps || [];
  if (elevatorStampCache.src !== src || elevatorStampCache.len !== src.length)
    elevatorStampCache = { list: src.filter(isElevatorStamp), src, len: src.length };
  return elevatorStampCache.list;
}
// 這格在不在電梯上（整張電梯圖的範圍，再加門口前面一排）：不能蓋建築（js/build.js 的 canPlaceObstacle）
function elevatorCoversCell(c, r) {
  return elevatorStamps().some(stamp => {
    const tile = mapTileById(stamp.id); if (!tile) return false;
    const o = stampSolidOrigin(stamp);
    return c >= o.c && c < o.c + mapTileW(tile) && r >= o.r && r <= o.r + mapTileH(tile);
  });
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
// 陸橋：這個點上站的是誰（溫特、隊員、怪物、NPC）、在幾樓；找不到人＝0（不知道）。視線、瞄準用
function actorFloorNear(x, y) {
  let best = 0, bd = 26 * 26;
  const look = a => { if (!a) return; const dx = a.x - x, dy = a.y - y, d = dx * dx + dy * dy; if (d < bd) { bd = d; best = actorFloor(a); } };
  look(G.player); for (const t of G.towers) look(t); for (const e of G.enemies) if (!e.dead) look(e); for (const n of G.npcs) look(n);
  return best;
}
let losNoFloors = false;   // 算光照時設成 true：光照自己管樓層，不用每條線都找人
function hasLineOfSight(x0, y0, x1, y1) {
  if (hasFloors && !losNoFloors && typeof G !== 'undefined' && G && G.towers) {
    // 正在算爆炸（withBlastFloor）：爆炸點就是爆炸那一層，不看旁邊站的人（不然另一層的人剛好站在爆炸點上，會照錯的那層算牆）
    const fa = (typeof blastFloor !== 'undefined' && blastFloor) || actorFloorNear(x0, y0), fb = actorFloorNear(x1, y1);
    if (fa && fb && fa !== fb) return false;   // 一個在陸橋上、一個在下面：互相看不到、打不到
    return onFloorDo(fa || fb || floorCtx, () => lineOfSightRaw(x0, y0, x1, y1));   // 照這一層的牆算視線
  }
  return lineOfSightRaw(x0, y0, x1, y1);
}
function lineOfSightRaw(x0, y0, x1, y1) {
  // 視線一律照月台上的規則算（軌道是低下去的坑，看得過去）：在軌道裡的人也看得到、打得到月台上的怪物
  if (typeof trackCtx !== 'undefined' && trackCtx) { trackCtx = false; try { return lineOfSightRaw(x0, y0, x1, y1); } finally { trackCtx = true; } }
  if (typeof bigPearlBlocksLine === 'function' && bigPearlBlocksLine(x0, y0, x1, y1)) return false;   // 珍珠大童的大珍珠：擋住雙方的子彈和射線（js/pearl-elder.js）
  const clear = (ox, oy) => {
    const ax = x0 + ox, ay = y0 + oy, bx = x1 + ox, by = y1 + oy;
    const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / 6));
    for (let i = 1; i < n; i++) {
      const k = i / n, x = ax + (bx - ax) * k, y = ay + (by - ay) * k;
      // 捷運軌道上的碰撞格不擋視線、子彈（算光照時照舊擋，不改燈光；js/mrt-train.js 的 mrtSeeThroughCell）
      if (!losNoFloors && typeof mrtSeeThroughCell === 'function' && mrtSeeThroughCell(...cellAt(x, y))) continue;
      if (!losNoFloors && typeof tileSeeThroughCell === 'function' && tileSeeThroughCell(...cellAt(x, y))) continue;   // 玻璃月台門這類看得穿的素材（data/tiles.js 的 seeThrough，js/tile-collisions.js）
      if (solidBlocksPoint(x, y)) return false;
    }
    return true;
  };
  if (clear(0, 0)) return true;
  const d = Math.hypot(x1 - x0, y1 - y0) || 1, px = -(y1 - y0) / d * 5, py = (x1 - x0) / d * 5;
  return clear(px, py) || clear(-px, -py);
}
function solidBlocksPoint(x, y) {
  if (typeof trackCtx !== 'undefined' && trackCtx && trackCells.size) return trackBlocksIn(cellAt(x, y).join(','));   // 在捷運軌道裡：只看軌道格（js/pathfinding.js）
  const elevator = elevatorBlocksPoint(x, y);
  if (elevator !== null) return elevator;
  if (typeof tileBoxBlocksPoint === 'function' && tileBoxBlocksPoint(x, y)) return true;   // 素材碰撞方框（物件編輯器設定，js/tile-collisions.js）
  const [c, r] = cellAt(x, y);
  if (floorCtx === 2) return nudgedWallAt(x, y, isWallRaw, solid2OffsetAt);   // 二樓：照 2 樓的擋路格和 2 樓的像素微調（不吃一樓牆的微調）
  // 加速：這格和周圍 8 格都沒有微調過的紅格（大部分的地方）→ 直接看這格是不是紅格，不用把 9 格一格一格算（結果一樣，隊員找路一次要問上千次）
  if (typeof nudgeNearSet === 'function' && !nudgeNearSet().has(c + ',' + r)) return isWallRaw(c, r);
  if (isWallRaw(c, r) && !solidOffsetAt(c, r)) return true;     // 沒微調過：整格都擋（撞牆照原始紅格；找路用的 isWall 見 js/pathfinding.js）
  for (let dc = -1; dc <= 1; dc++) for (let dr = -1; dr <= 1; dr++) {
    const cc = c + dc, rr = r + dr;
    const off = solidOffsetAt(cc, rr);
    if (!off || !isWallRaw(cc, rr)) continue;
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
  for (const s of mapBases) seedBaseObstacle(s);
  seedOtherMapObstacles();
}
// 測試模式（開始畫面的 🧪 測試模式）：營地血量直接用這個，打不太壞，方便測 BOSS
const TEST_MODE_BASE_HP = 99999;
// 把一個營地擺上場（戰敗撤退時修回被打壞的營地也用這個，js/combat-progress.js）
function seedBaseObstacle(s) {
    const t = mapTileById(s.id);
    if (!t) return null;
    const w = mapStampW(s, t), h = mapStampH(s, t), baseW = mapTileW(t), baseH = mapTileH(t);
    const baseC = s.c + Math.round((s.ox || 0) / CELL), baseR = s.r + Math.round((s.oy || 0) / CELL);
    const hasCustomSolid = Array.isArray(s.baseSolid);
    const sourceSolid = hasCustomSolid ? s.baseSolid : (Array.isArray(t.baseSolid) ? t.baseSolid : []);
    // 編輯器存的 s.baseSolid 已經是翻轉、旋轉後畫面上的格子（js/map-editor.js 的 baseSolidForStamp），不要再翻一次
    const solid = hasCustomSolid ? sourceSolid.map(cell => cell.slice())
      : mapStampCells(sourceSolid, baseW, baseH, mapStampTurn(s)).map(([dc, dr]) => [s.fx ? w - 1 - dc : dc, s.fy ? h - 1 - dr : dr]);
    const hp = window.TEST_MODE ? TEST_MODE_BASE_HP : Math.max(1, Number(s.baseHp != null ? s.baseHp : t.baseHp) || 2000);
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
    return o;
}
// 地圖編輯器把物件放大／縮小（圖章的「大小 %」）時，擋路格也跟著變大／變小。
// 放大的基準跟畫圖一樣是「圖片底部中央」（js/stamp-transform.js 的 applyStampTransform）：
// 每一格擋路格照比例變大後，蓋到哪些格子的中心，那些格子就擋路；縮到一格都蓋不到時，至少留它中心所在的那格。
// cells：[第幾欄, 第幾列]（從圖片左上角算，可能變成負的＝超出原本圖片範圍）；w、h：圖片佔幾格；k：倍率（1＝原尺寸）
function scaleSolidCells(cells, w, h, k) {
  if (!k || k === 1) return cells;
  const sx = x => w / 2 + (x - w / 2) * k, sy = y => h + (y - h) * k;   // 原本的位置 → 放大後的位置（以格為單位）
  const out = new Map();
  for (const [dc, dr] of cells) {
    const x0 = sx(dc), x1 = sx(dc + 1), y0 = sy(dr), y1 = sy(dr + 1);
    let any = false;
    for (let c = Math.floor(x0); c < Math.ceil(x1); c++) for (let r = Math.floor(y0); r < Math.ceil(y1); r++) {
      if (c + .5 >= x0 && c + .5 < x1 && r + .5 >= y0 && r + .5 < y1) { out.set(c + ',' + r, [c, r]); any = true; }
    }
    if (!any) { const c = Math.floor((x0 + x1) / 2), r = Math.floor((y0 + y1) / 2); out.set(c + ',' + r, [c, r]); }
  }
  return [...out.values()];
}
function seedOtherMapObstacles() {
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
      const lamp = { kind: 'obstacle', mapSource: source, mapTileId: t.id, type: spec.type, c, r, w, h, solid: [], hp: spec.hp, maxhp: spec.hp, hitT: 0 };
      if (stamp) { const ox = stamp.ox || 0, oy = stamp.oy || 0, off = [ox - Math.round(ox / CELL) * CELL, oy - Math.round(oy / CELL) * CELL]; if (off[0] || off[1]) lamp.off = off; }   // 微調過的燈：光跟著圖走
      G.obstacles.push(lamp);
      return;
    }
    const solid0 = (stamp ? mapStampCells(spec.solid || [], mapTileW(t), mapTileH(t), mapStampTurn(stamp)) : (spec.solid || []))
      .map(([dc, dr]) => [stamp && stamp.fx ? w - 1 - dc : dc, stamp && stamp.fy ? h - 1 - dr : dr]);
    const solid = scaleSolidCells(solid0, w, h, stamp && typeof stampScaleOf === 'function' ? stampScaleOf(stamp) : 1)
      .filter(([dc, dr]) => inGrid(c + dc, r + dr) && !G.grid[(c + dc) + ',' + (r + dr)]);
    if (!solid.length) return;
    const o = { kind: 'obstacle', mapSource: source, mapTileId: t.id, type: spec.type,
      c, r, w, h, solid, hp: spec.hp, maxhp: spec.hp, hitT: 0, ore: !!spec.ore };
    // 用方向鍵微調過位置：c、r 已經對齊到最近的格子，剩下不到半格的像素記在 off，走路碰撞照微調後的範圍算（js/build.js 的 gridBlockAtPoint）
    if (stamp) { const ox = stamp.ox || 0, oy = stamp.oy || 0, off = [ox - Math.round(ox / CELL) * CELL, oy - Math.round(oy / CELL) * CELL]; if (off[0] || off[1]) o.off = off; }
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
  for (const o of G.obstacles) setMapObstacleFloor(o);   // 放在 2 樓的礦物、路障：算 2 樓的東西，擋 2 樓的人
}

// ---- 繪製地圖圖片（圖層由下往上，最後大圖）----
function drawMapTileImg(ctx, id, x, y, layer='top', fading=false) {
  let t = mapTileById(id); if (!t) return;
  const [c,r]=cellAt(x,y);
  const display=typeof storagePropDisplayTile==='function'?storagePropDisplayTile(id,c,r,layer):null;
  if(display===false)return;
  if(display)t=display;
  if (typeof ballBedHidden === 'function' && ballBedHidden(c + ',' + r, id)) return;   // 球球睡在這張床上：只畫睡覺圖（js/ball-poses.js）
  const secret = fading ? 1 : (typeof secretAlpha === 'function' ? secretAlpha(null, layer, c + ',' + r) : 1)   // 隱藏區圖層：炸開前不畫、炸開時淡入（js/breakable-walls.js）；fading＝已經套過透明度，不再算
    * (!fading && typeof poolLayerAlpha === 'function' ? poolLayerAlpha(layer) : 1);   // 池核的水位圖層：照水位淡入淡出（js/pool-tide.js）
  if (secret <= 0) return;
  if (secret < 1) { ctx.save(); ctx.globalAlpha *= secret; drawMapTileImg(ctx, id, x, y, layer, true); ctx.restore(); return; }
  if (t.color) { ctx.fillStyle = t.color; ctx.fillRect(x, y, CELL, CELL); return; }
  const img = tileImage(t);
  if (img) {
    ctx.save();if(typeof isPoweredLightTile==='function'&&isPoweredLightTile(t)&&!mapPowerIsOn())ctx.filter='brightness(0.35)';
    if (typeof doorCutoutClip === 'function' && (isOccLayer(layer) || layer === 'top')) doorCutoutClip(ctx, x, y, CELL, CELL);   // 打開的挖空門：立體物在門的範圍裡不畫
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
    if (/Poolcore_field-base\.png$/i.test(file)) {   // 池核基地：有畫 Poolcore_field-base-fail.png 就用它，沒有就照原本的樣子（不換成後室的綠色殘骸）
      const img = tileImage({ id: '__pool-base-fail', file: 'images/Poolcore/Poolcore_field-base-fail.png' });
      return img && img.complete && img.naturalWidth ? { ...t, id: '__pool-base-fail', file: 'images/Poolcore/Poolcore_field-base-fail.png' } : t;
    }
    return { ...t, id: '__field-base-fail', file: 'images/field-camp/field-base-fail.png' };
  }
  const poolLine = /Poolcore_warning_line\.png$/i.test(file);   // 池核的警戒線：壞掉時換成 Poolcore_warning-line-fail.png
  if (poolLine || file.endsWith('/warning-line.png') || t.name === 'warning-line') {
    const x = s.c * CELL + (s.ox || 0), y = s.r * CELL + (s.oy || 0);
    for (const base of G.destroyedBases) {
      const bt = mapTileById(base.id); if (!bt) continue;
      const bx = base.c * CELL + (base.ox || 0), by = base.r * CELL + (base.oy || 0);
      if (x < bx + mapStampW(base, bt) * CELL && x + mapStampW(s, t) * CELL > bx &&
          y < by + mapStampH(base, bt) * CELL && y + mapStampH(s, t) * CELL > by) {
        return poolLine ? { ...t, id: '__pool-warning-line-fail', file: 'images/Poolcore/Poolcore_warning-line-fail.png' } : { ...t, id: '__warning-line-fail', file: 'images/field-camp/warning-line-fail.png' };
      }
    }
  }
  return t;
}
// ---- 混合模式、不透明度、發光（地圖編輯器／基地編輯器選物件時設定，存在這個 stamp 上；素材本身不動）----
//   s.blend＝混合模式（canvas 的 globalCompositeOperation：overlay 覆蓋、multiply 色彩增值、soft-light 柔光、screen 濾色、lighter 相加…）
//   s.alpha＝不透明度 0～100（沒寫＝100）
//   s.glow＝會發光：黑幕畫完之後才畫（暗處也看得到），同時當成光源照亮周圍（s.glowR＝照亮半徑 px，沒寫＝160；光一樣會被牆擋住）
const MAP_GLOW_R = 160;
// 整個圖層的混合模式（編輯器圖層列的「整層混合」，存在 MAP.layerOrder 那一層的 blend）：
// 這層的東西先在另一張畫布上照平常疊好，整張再用這個混合模式蓋上去（層裡重疊的物件不會互相混合，跟 Photoshop 的群組一樣），見 drawMapLayerGroup
function mapLayerBlend(lid) {
  const list = MAP && Array.isArray(MAP.layerOrder) ? MAP.layerOrder : null; if (!list) return '';
  for (const l of list) if (l.id === lid) return l.blend || '';
  return '';
}
let mapBlendSuspend = false;   // 做重疊補畫的小畫布時暫時不套混合模式（補畫貼回畫面時才套，見 drawOverdrawPatch）
const mapStampBlend = s => mapBlendSuspend ? '' : (s.blend || '');
const mapItemBlend = it => it.kind === 'cell' ? '' : (it.stamp.blend || '');
// 整層混合的圖層：整層一起畫（地面那一輪照圖層順序畫，在角色下面；上層照樣在角色上面）。2 樓圖層要跟人排前後，不能整層一起畫
const mapGroupedLayer = lid => !!mapLayerBlend(lid) && !MAP_FLOOR2_LAYERS.has(lid);
// 椅子（要坐）、據點（要打）還是照原本自己排前後，不放進整層一起畫
const inMapLayerGroup = s => mapGroupedLayer(s.layer || 'top') && !isElevatorStamp(s) && !chairConfig(s.id) && !(mapTileById(s.id) || {}).baseHp;
let mapGroupCv = null;
let mapGroupDirty = null;   // 空白畫布上次畫到哪個範圍（畫面像素 [x, y, w, h]）；null＝下次整張清（MAP_FAST.water）
function drawMapLayerGroup(ctx, lid) {
  const list = mapStampGroups().grouped.get(lid) || [];
  const off = mapGroupCv || (mapGroupCv = document.createElement('canvas'));
  if (off.width !== ctx.canvas.width || off.height !== ctx.canvas.height) { off.width = ctx.canvas.width; off.height = ctx.canvas.height; mapGroupDirty = null; }
  const g = off.getContext('2d'), m = ctx.getTransform(), W = off.width, H = off.height;
  // 這一幀要畫哪些（畫面外的、被打壞的不畫）；這層有沒有一格一格的小圖
  const draws = list.filter(s => stampInDrawRect(s) && !(G.mapDestroyed && G.mapDestroyed.has(s)));
  let hasCells = false; for (const k in ((MAP.layers || {})[lid] || {})) { hasCells = true; break; }
  // 要處理的範圍（MAP_FAST.water）：只有大圖時＝那些圖的範圍（多留一格）；有小圖、熱身中、畫面有旋轉＝整個畫面
  let rect = [0, 0, W, H];
  if (MAP_FAST.water) {
    if (!draws.length && !hasCells) return;   // 畫面上沒有這層：整個跳過
    if (!hasCells && mapDrawRect && !m.b && !m.c) {
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      for (const s of draws) { const b = stampDrawBox(s); x0 = Math.min(x0, b.x0 - CELL); y0 = Math.min(y0, b.y0 - CELL); x1 = Math.max(x1, b.x1 + CELL); y1 = Math.max(y1, b.y1 + CELL); }
      const X0 = Math.max(0, Math.floor(m.a * x0 + m.e)), Y0 = Math.max(0, Math.floor(m.d * y0 + m.f)), X1 = Math.min(W, Math.ceil(m.a * x1 + m.e)), Y1 = Math.min(H, Math.ceil(m.d * y1 + m.f));
      if (X1 <= X0 || Y1 <= Y0) return;
      rect = [X0, Y0, X1 - X0, Y1 - Y0];
    }
  }
  g.setTransform(1, 0, 0, 1, 0, 0);
  if (MAP_FAST.water && mapGroupDirty) g.clearRect(...mapGroupDirty); else g.clearRect(0, 0, W, H);   // 只清上次畫過的地方
  g.setTransform(m); g.imageSmoothingEnabled = ctx.imageSmoothingEnabled; g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  if (hasCells || !MAP_FAST.water) drawLayerCellsInView(g, lid);
  for (const s of draws) drawMapStampImg(g, s);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = mapLayerBlend(lid); ctx.globalAlpha *= (typeof poolLayerAlpha === 'function' ? poolLayerAlpha(lid) : 1);
  if (MAP_FAST.water) ctx.drawImage(off, rect[0], rect[1], rect[2], rect[3], rect[0], rect[1], rect[2], rect[3]); else ctx.drawImage(off, 0, 0);
  ctx.restore();
  mapGroupDirty = MAP_FAST.water ? rect : null;
}
function drawMapStampImg(ctx, s, glowPass = false) {
  if (s.glow && !glowPass) return;   // 會發光的：drawMapGlow 在黑幕上面才畫
  const secret = typeof secretAlpha === 'function' ? secretAlpha(s) : 1;   // 隱藏區圖層：炸開前不畫（js/breakable-walls.js）
  if (secret <= 0) return;
  const alpha = (Number.isFinite(s.alpha) && s.alpha < 100 ? Math.max(0, s.alpha) / 100 : 1) * secret
    * (typeof mrtGateAlpha === 'function' ? mrtGateAlpha(s) : 1)   // 月台閘門：捷運開門時變淡（js/mrt-train.js）
    * (typeof poolLayerAlpha === 'function' ? poolLayerAlpha(s.layer) : 1);   // 池核的水位圖層（js/pool-tide.js）
  if (alpha <= 0) return;
  const blend = mapStampBlend(s);
  if (!blend && alpha === 1) { drawMapStampRaw(ctx, s); return; }
  ctx.save();
  if (blend) ctx.globalCompositeOperation = blend;
  ctx.globalAlpha *= alpha;
  drawMapStampRaw(ctx, s);
  ctx.restore();
}
// 會發光的物件：render.js 在蓋上黑幕之後呼叫，所以在黑暗裡也亮著（畫在角色上面）
function drawMapGlow(ctx) {
  if (!MAP) return;
  for (const s of MAP.stamps || []) if (s.glow && stampInDrawRect(s) && !(G.mapDestroyed && G.mapDestroyed.has(s))) drawMapStampImg(ctx, s, true);
}
// 會發光的物件當光源（js/lighting.js 的 getLights 呼叫）：光從圖片中心往外照
function mapGlowLights() {
  if (!MAP) return [];
  const out = [];
  for (const s of MAP.stamps || []) {
    if (!s.glow || (typeof secretAlpha === 'function' && secretAlpha(s) <= 0)) continue;   // 還沒炸開的隱藏區：不發光
    const t = mapTileById(s.id) || {};
    out.push({ x: OX + s.c * CELL + (s.ox || 0) + mapStampW(s, t) * CELL / 2, y: OY + s.r * CELL + (s.oy || 0) + mapStampH(s, t) * CELL / 2,
      r: s.glowR > 0 ? s.glowR : MAP_GLOW_R, floor: stampOn2F(s) ? 2 : 1 });
  }
  return out;
}
// 有設大小、角度的物件：整個畫法（門、閘門、手扶梯動畫…）都包在同一個變形裡（js/stamp-transform.js）
function drawMapStampRaw(ctx, s) {
  if (!stampHasTransform(s)) { drawMapStampPlain(ctx, s); return; }
  const t = mapTileById(s.id); if (!t) return;
  withStampTransform(ctx, s, OX + s.c * CELL + (s.ox || 0), OY + s.r * CELL + (s.oy || 0), mapStampW(s, t) * CELL, mapStampH(s, t) * CELL, () => drawMapStampPlain(ctx, s));
}
// 一張物件「這一刻」要畫哪張圖：原本的圖，再依狀態換掉（被破壞的據點、炸開的牆、解封的捷運口、
// 霧樹、鳥巢、置物箱）。回傳 null＝這一刻不畫（例如置物箱藏起來）。
// 畫圖（drawMapStampPlain）和重疊補畫檢查「圖載好了沒」（occluderImageReady）都用這一份，兩邊才會一致
function stampShownTile(s) {
  let t = mapTileById(s.id); if (!t) return null;
  t = destroyedBaseDisplayTile(s, t);
  if (typeof breakableWallDisplayTile === 'function') t = breakableWallDisplayTile(s, t);   // 可炸開的牆：裂痕／破洞（js/breakable-walls.js）
  if (typeof mrtDisplayTile === 'function') t = mrtDisplayTile(s, t);   // 解封的捷運入口換圖（js/mrt-locks.js）
  if (typeof fogTreeDisplayTile === 'function') t = fogTreeDisplayTile(s, t);   // 霧樹的水晶打破了：換成沒有水晶的樹（js/fog.js）
  if (typeof nestDisplayTile === 'function') t = nestDisplayTile(s, t);   // 鳥巢：有蛋／空巢換圖（js/chickens.js）
  const display = typeof storagePropDisplayTile === 'function' ? storagePropDisplayTile(s.id, s.c, s.r, s.layer || 'top', s) : null;
  if (display === false) return null;
  return display || t;
}
// 箱子類的換圖（大小可能跟原圖不同，畫的時候底部對齊）：剛補給過的彈藥箱換成打開的圖、
// 物資箱照箱子裡剩多少換成滿／剩一些／空的圖。沒有要換就回傳 null
function stampSwapTile(s) {
  return (typeof ammoCrateOpenTile === 'function' && ammoCrateOpenTile(s))   // 剛補給過的彈藥箱：換成打開的圖（js/flare.js）
    || (typeof supplyBoxTile === 'function' && supplyBoxTile(s)) || null;   // 物資箱：照箱子裡的數量換圖（js/camp-supply.js）
}
function drawMapStampPlain(ctx, s) {
  if (typeof G !== 'undefined' && G && G.mapDestroyed && G.mapDestroyed.has(s)) return;
  if (typeof doorStampOpen === 'function' && doorStampOpen(s)) return;   // 打開的門：圖片直接消失（挖空門洞的門：門洞、門框在 drawMapGround 最後畫、在角色下面，js/doors.js）
  if (typeof StoryScene !== 'undefined' && StoryScene.ownsStamp(s)) return;   // 回憶劇情的自動門：由 js/story-scene.js 自己畫開關動畫
  if (typeof ballBedHidden === 'function' && ballBedHidden(s)) return;   // 球球睡在這張床上：只畫睡覺圖（js/ball-poses.js）
  if (typeof G !== 'undefined' && G && G.flickerGlowStamps && G.flickerGlowStamps.has(s)) return;   // 疊在燈上的光暈圖（池核 LED）：由 js/flicker-light.js 畫在黑幕上面、跟著燈亮暗
  if (typeof poweredGlowHidden === 'function' && poweredGlowHidden(s)) return;   // 跟著電源的池核 LED 光暈圖：通電時才由 js/powered-lights.js 畫在黑幕上面
  let t = stampShownTile(s); if (!t) return;   // 這一刻實際要畫哪張圖（被破壞、換圖、置物箱藏起來…都算進去）
  let w = mapTileW(t) * CELL, h = mapTileH(t) * CELL, rot = mapStampTurn(s);
  // 旋轉後的圖跟編輯器一樣：左上角固定在 (c, r)＋微調，往右下佔「轉向後的寬高」，不再以原本大小的中心為準
  let x = OX + s.c * CELL + (s.ox || 0), y = OY + s.r * CELL + (s.oy || 0);
  const jit = typeof gourdKingWallJitter === 'function' ? gourdKingWallJitter(s) : null;   // BOSS 牆被撞的時候抖一下（js/gourd-king.js）
  if (jit) { x += jit[0]; y += jit[1]; }
  const opened = stampSwapTile(s);
  if (opened) { const h2 = mapTileH(opened) * CELL; y += h - h2; h = h2; w = mapTileW(opened) * CELL; t = opened; }
  if (t.color) { ctx.fillStyle = t.color; ctx.fillRect(x, y, w, h); return; }
  const img = isElevatorLightTile(t) && elevatorLightIsOpen(s.c, s.r) && elevatorLightOpenImage.complete && elevatorLightOpenImage.naturalWidth
    ? elevatorLightOpenImage : tileImage(t);
  if (img) {
    const gate=G.obstacles.find(o=>o.type==='irongate'&&o.mapSource===s);
    if(gate&&drawSlidingIronGate(ctx,gate,img,x,y,w,h))return;
    ctx.save();if(typeof isPoweredLightTile==='function'&&isPoweredLightTile(t)&&!mapPowerIsOn(circuitOf(s)))ctx.filter='brightness(0.35)';   // 電路編號（js/powered-lights.js）
    if (typeof doorCutoutClip === 'function' && stampIsOcc(s)) doorCutoutClip(ctx, x, y, rot % 2 ? h : w, rot % 2 ? w : h, s);   // 打開的挖空門：牆在門的範圍裡不畫（js/doors.js）
    const drawW = rot % 2 ? h : w, drawH = rot % 2 ? w : h;
    if (s.fx || s.fy || rot) {
      ctx.save(); ctx.translate(x + drawW / 2, y + drawH / 2); if (rot) ctx.rotate(rot * Math.PI / 2);
      ctx.scale(s.fx ? -1 : 1, s.fy ? -1 : 1);
      if(!(typeof drawMrtGateAnimation==='function'&&drawMrtGateAnimation(ctx,s,img,-w/2,-h/2,w,h))&&!(typeof drawMrtCardGate==='function'&&drawMrtCardGate(ctx,s,img,-w/2,-h/2,w,h))&&!(typeof drawEscalatorAnimation==='function'&&drawEscalatorAnimation(ctx,s,img,-w/2,-h/2,w,h))&&!(typeof drawKelpSway==='function'&&drawKelpSway(ctx,s,t,img,-w/2,-h/2,w,h)))ctx.drawImage(img,-w/2,-h/2,w,h);   // drawKelpSway：水草微微晃動（js/kelp-sway.js）
      ctx.restore();
    } else if(typeof drawMrtGateAnimation==='function'&&drawMrtGateAnimation(ctx,s,img,x,y,w,h)) {
      // 閘門的靜態機台與滑動門翼由專用繪製處理。
    } else if (typeof drawMrtCardGate === 'function' && drawMrtCardGate(ctx, s, img, x, y, w, h)) {
      // 月台閘門（閘門讀卡機）：兩片門板跟著捷運車門往左右滑開（js/mrt-train.js）
    } else if (typeof drawEscalatorAnimation === 'function' && drawEscalatorAnimation(ctx, s, img, x, y, w, h)) {
      // 手扶梯：階梯循環捲動（js/escalators.js）
    } else if (typeof drawKelpSway === 'function' && drawKelpSway(ctx, s, t, img, x, y, w, h)) {
      // 水草：根部固定、上面跟著水流微微左右擺（js/kelp-sway.js）
    } else {
      const hole = typeof mrtStampHole === 'function' ? mrtStampHole(s) : null;   // 打開的捷運閘門：門板那塊不畫（js/mrt-locks.js）
      if (hole) { ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.rect(x + hole[0] * w, y + hole[1] * h, hole[2] * w, hole[3] * h); ctx.clip('evenodd'); }
      ctx.drawImage(img, x, y, w, h);
      if (hole) ctx.restore();
      if (typeof drawMrtTimeBoard === 'function') drawMrtTimeBoard(ctx, s, x, y, w, h);   // 捷運時間牌：下一班幾秒到、開往哪站（js/mrt-time-board.js）
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
  for (const s of (MAP.stamps || [])) { const t = mapTileById(s.id) || {}, sc = s.c + Math.round((s.ox || 0) / CELL), sr = s.r + Math.round((s.oy || 0) / CELL); if (c >= sc && c < sc + mapStampW(s, t) && r >= sr && r < sr + mapStampH(s, t)) return true; }   // 微調過的物件：照圖實際蓋到的格子
  return false;
}

// ---- 深度排序：判斷一張圖是「會遮擋角色的立體物」還是「平的地面」----
//   規則：'top' 圖層永遠在角色上面（樹冠/屋簷）；
//   其餘圖層中，高度≥2格 或 放在 object/overlay 圖層 的，視為立體物 → 和角色一起排序；
//   剩下扁平的（多半是地板）留在地面、永遠在角色下面。
const OCC_MIN_H = 2;                                   // 幾格高(含)以上算「立體物」
const isOccLayer = lid => /^object\d*$/.test(lid) || lid === 'overlay';   // 物件、物件2～4、物件裝飾都是「立體物」
// 用格子筆刷畫的小圖有沒有勾「平貼地面」：勾了就算放在物件圖層，也當地板畫在角色下面（跟大圖的規則一樣）
const cellTileFlat = id => !!(mapTileById(id) || {}).flat;
// flat:true 的圖＝平貼地面（紅線、裂痕、碎石等），永遠畫在角色下方、不遮擋
// 這張圖是不是 2 樓的圖：照圖片的 level（地圖編輯器的「🏢 樓層」選單）；沒寫就跟著所在圖層的樓層（js/map-levels.js）
const stampOn2F = s => s && s.level != null ? s.level !== 1 : MAP_FLOOR2_LAYERS.has((s && s.layer) || 'top');
// 地圖上的物件變成會動的東西（門、腳踏車、捷運列車…）時畫在幾樓：2 樓的圖＝2，其他（1 樓、跨樓層）＝1
const stampDrawFloor = s => hasFloors && s && stampOn2F(s) && s.level !== 'span' ? 2 : 1;
// 所有 2 樓的圖蓋到的格子（跨樓層的圖只算上半段）：燈光用（js/lighting.js，2 樓的圖照 2 樓的亮度）。換地圖、物件數量變了就重算
let floor2CellsCache = null;
function floor2ArtCells() {
  const n = (MAP.stamps || []).length;
  if (floor2CellsCache && floor2CellsCache.map === MAP && floor2CellsCache.n === n) return floor2CellsCache;
  const all = new Set();
  const cover = (s, out, half) => {
    const t = mapTileById(s.id); if (!t) return;
    const w = mapStampW(s, t), h = mapStampH(s, t), c0 = s.c + (s.ox || 0) / CELL, r0 = s.r + (s.oy || 0) / CELL, r1 = half ? r0 + h / 2 : r0 + h;
    for (let c = Math.ceil(c0 - .5); c + .5 < c0 + w; c++) for (let r = Math.ceil(r0 - .5); r + .5 < r1; r++) out.add(c + ',' + r);
  };
  for (const lid of MAP_FLOOR2_LAYERS) for (const k of Object.keys((MAP.layers || {})[lid] || {})) all.add(k);
  floor2CellsCache = { map: MAP, n, all };
  for (const s of MAP.stamps || []) if (stampOn2F(s)) cover(s, all, stampConnects(s));
  return floor2CellsCache;
}
// 「只有 2 樓、沒有 1 樓」的格子：是 2 樓地面（不是樓層出入口），而且底下沒有任何一樓的圖（一樓圖層的格子圖、一樓圖層的物件都沒蓋到）。
// 陸橋（底下有一樓的地板）不算。蓋建築用：不管溫特站在幾樓，蓋在這種格子上一律算 2 樓（js/build.js 的 buildFloorAt）
let floor2OnlyCache = null;
function floor2OnlyCells() {
  const n = (MAP.stamps || []).length;
  if (floor2OnlyCache && floor2OnlyCache.map === MAP && floor2OnlyCache.n === n && floor2OnlyCache.deck === deckCells) return floor2OnlyCache.cells;
  // 2 樓地面裡，不是出入口、也沒用「🏢 樓層種類」筆刷刷成陸橋（MAP.bridge）的格子（js/map-levels.js）
  const cells = MapLevels.only2Cells(MAP, mapTileById);
  floor2OnlyCache = { map: MAP, n, deck: deckCells, cells };
  return cells;
}
// 這格一樓的牆是不是「2 樓的物件加的」（2 樓的人也要擋，js/pathfinding.js 的 deckBlocked）：
// 不是地圖編輯器手畫的一樓紅格（那個只擋一樓，2 樓另外用「2樓碰撞」畫），而且這格只有 2 樓、或被 2 樓物件圖層的圖蓋著。
// 置物箱、候車椅、門、電梯這些物件各自把擋路格加進一樓的牆，放在 2 樓時靠這條規則擋住 2 樓的人（開箱、開門拿掉牆時也自動跟著不擋）
let objWall2FCache = null;
function objectWallOn2F(k) {
  if (!MAP) return false;
  const n = (MAP.stamps || []).length;
  if (!objWall2FCache || objWall2FCache.map !== MAP || objWall2FCache.n !== n) {
    const cover = new Set();   // 2 樓物件圖層的圖蓋到的格子
    for (const s of MAP.stamps || []) {
      if (!stampOn2F(s) || !isOccLayer(s.layer || 'top')) continue;
      const t = mapTileById(s.id); if (!t) continue;
      const w = mapStampW(s, t), h = mapStampH(s, t), c0 = s.c + (s.ox || 0) / CELL, r0 = s.r + (s.oy || 0) / CELL;
      for (let c = Math.ceil(c0 - .5); c + .5 < c0 + w; c++) for (let r = Math.ceil(r0 - .5); r + .5 < r0 + h; r++) cover.add(c + ',' + r);
    }
    objWall2FCache = { map: MAP, n, cover, drawn: new Set(MAP.solid || []) };
  }
  if (objWall2FCache.drawn.has(k)) return false;
  return objWall2FCache.cover.has(k) || floor2OnlyCells().has(k);
}
// 地圖上擺的可破壞物件（礦物、路障…）算幾樓：擋路格全在 2 樓地面上，而且是 2 樓圖層的圖、或那裡只有 2 樓 → 2 樓（只擋 2 樓的人，js/build.js 的 barrierAt）
function setMapObstacleFloor(o) {
  if (!hasFloors || !o || o.playerBuilt) return;
  const cells = (o.solid && o.solid.length ? o.solid : [[0, 0]]).map(([dc, dr]) => (o.c + dc) + ',' + (o.r + dr));
  if (!cells.every(k => deckCells.has(k) && !rampCells.has(k))) return;
  const src = o.mapSource || o.baseStamp;
  const on2F = src && typeof src === 'object' ? stampOn2F(src) : typeof src === 'string' && MAP_FLOOR2_LAYERS.has(src.split(':')[0]);
  const only = floor2OnlyCells();
  if (on2F || cells.every(k => only.has(k))) o.floor = 2;
}
// 這種圖從圖片一半的高度分成上下兩段：下半段算一樓的東西（跟一樓的人照底部排前後），上半段算二樓的（蓋在一樓的人上面、跟二樓的人排前後）。
// 跨樓層的圖（從一樓立到二樓的柱子、牆、側面手扶梯）：地圖裡寫明 level＝'span' 的才算，上下兩半各算一層
function stampConnects(s) {
  return hasFloors && !!s && s.level === 'span';
}
// 樓梯類的連接物（人是踩在上面走的，不能蓋住人）：平貼的圖、手扶梯、或圖蓋到「樓層出入口」的格子
function stampIsStairs(s) {
  const t = mapTileById(s.id) || {};
  if (t.flat || (typeof escalatorSpec === 'function' && escalatorSpec(s.id))) return true;
  const w = mapStampW(s, t), h = mapStampH(s, t), c0 = s.c + (s.ox || 0) / CELL, r0 = s.r + (s.oy || 0) / CELL;
  for (let c = Math.ceil(c0 - .5); c + .5 < c0 + w; c++) for (let r = Math.ceil(r0 - .5); r + .5 < r0 + h; r++) if (rampCells.has(c + ',' + r)) return true;
  return false;
}
// 立在地上的障礙物（礦物、路障、探照燈…，不含埋在地上的地雷）：不管放在哪個圖層，都照底部跟人排前後。
// 不然放在「地面裝飾」「2樓地板」這種圖層時，會被當成地板，人走到石頭上半部還畫在石頭前面
const standingObstacleCache = new Map();
function stampIsStandingObstacle(s) {
  if (standingObstacleCache.has(s.id)) return standingObstacleCache.get(s.id);
  const t = mapTileById(s.id), yes = !!(t && isMapObstacleTile(t) && !mapObstacleSpec(t).trap);
  standingObstacleCache.set(s.id, yes);
  return yes;
}
const stampIsOcc = s => { const t = mapTileById(s.id) || {}; return stampOn2F(s) || Number.isFinite(s.sortDepth) || !!chairConfig(s.id) || !!t.baseHp || stampIsStandingObstacle(s) || (!t.flat && (mapStampH(s, t) > 1 || isOccLayer(s.layer || 'top'))); };

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
// ---- 畫面加速（池核這種物件很多、圖層很多的地圖特別需要）：畫出來的畫面完全一樣，只是少做重複的計算 ----
//   bounds：每張圖佔的範圍算一次就記住（圖沒移動、沒換大小就不重算），不用每一幀每張圖都重算
//   sig：遮擋補畫的「狀態有沒有變」每一幀每張圖只問一次（同一張圖會被好幾塊補畫問）
//   water：整層混合的圖層（池核的水）只清理、貼回真的有畫東西的範圍；畫面上沒有這層的圖就整個跳過
//   任何一個改成 false＝回到原本的做法（畫面出問題時可以先關掉比對）
const MAP_FAST = { bounds: true, sig: true, water: true };
let mapDrawFrame = 0;   // 第幾幀（drawMapGround 每一幀最先呼叫時 +1）
// 一張大圖畫出來大概佔哪個範圍（世界座標像素，寧可大一點）：旋轉、放大過的照畫出來的範圍
const stampBoxCache = new WeakMap();
function stampDrawBox(s) {
  // 先直接比對位置、大小、角度有沒有變（不用每一幀每張圖都組一串文字來比，2000 多張圖的地圖每幀省下不少時間）
  if (MAP_FAST.bounds) { const hit = stampBoxCache.get(s); if (hit && hit.id === s.id && hit.c === s.c && hit.r === s.r && hit.ox === s.ox && hit.oy === s.oy && hit.rot === s.rot && hit.scale === s.scale && hit.angle === s.angle) return hit; }
  const key = s.id + '|' + s.c + '|' + s.r + '|' + (s.ox || 0) + '|' + (s.oy || 0) + '|' + (s.rot || 0) + '|' + (s.scale || '') + '|' + (s.angle || '');
  const t = mapTileById(s.id) || {}, w = mapTileW(t) * CELL, h = mapTileH(t) * CELL;
  let box;
  if (stampHasTransform(s)) {   // 放大、轉過的物件：照畫出來的範圍算
    const b = stampVisualBox(s, OX + s.c * CELL + (s.ox || 0), OY + s.r * CELL + (s.oy || 0), mapStampW(s, t) * CELL, mapStampH(s, t) * CELL);
    box = { key, x0: b.x0, y0: b.y0, x1: b.x1, y1: b.y1 };
  } else {
    const half = Math.max(w, h) / 2, cx = OX + s.c * CELL + (s.ox || 0) + w / 2, cy = OY + s.r * CELL + (s.oy || 0) + h / 2;
    box = { key, x0: cx - half, y0: cy - half, x1: cx + half, y1: cy + half };
  }
  if (MAP_FAST.bounds) { Object.assign(box, { id: s.id, c: s.c, r: s.r, ox: s.ox, oy: s.oy, rot: s.rot, scale: s.scale, angle: s.angle }); stampBoxCache.set(s, box); }
  return box;
}
// 一張大圖有沒有任何一部分在範圍內（旋轉過的圖用比較寬的範圍判斷，寧可多畫不要切掉）
function stampInDrawRect(s) {
  const v = mapDrawRect; if (!v) return true;
  const b = stampDrawBox(s);
  return b.x1 > v.x0 && b.x0 < v.x1 && b.y1 > v.y0 && b.y0 < v.y1;
}
// 畫某一層範圍內的小圖（格子）
// onlyFlat＝true：只畫勾了「平貼地面」的小圖（物件圖層用：其他立體的小圖要跟角色排前後，不在這裡畫）
function drawLayerCellsInView(ctx, lid, onlyFlat) {
  const layer = MAP.layers ? (MAP.layers[lid] || {}) : {};
  const { c0, r0, c1, r1 } = mapDrawCells();
  for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) {
    const key = c + ',' + r, id = layer[key];
    if (!id || G.mapDestroyed.has(lid + ':' + key) || chairConfig(id)) continue;
    if (onlyFlat && !cellTileFlat(id)) continue;
    drawMapTileImg(ctx, id, OX + c * CELL, OY + r * CELL, lid);
  }
}
// 地面、上層要畫的物件先依圖層分好（同一張地圖只分一次）：
// 原本每一幀對每個圖層都把全部物件翻一遍（十幾層 × 上千個），大地圖光是挑物件就要 2 毫秒。
// 跟電梯清單一樣，物件數量變了（編輯器新增、刪除）就重分；順序照 MAP.stamps，畫出來的上下關係不變。
let mapStampGroupCache = { src: null, len: -1, ground: null, top: null, grouped: null };
function mapStampGroups() {
  const src = MAP?.stamps || [];
  if (mapStampGroupCache.src === src && mapStampGroupCache.len === src.length) return mapStampGroupCache;
  const ground = new Map(), top = [], grouped = new Map();
  for (const s of src) {
    if (isElevatorStamp(s)) continue;
    if (inMapLayerGroup(s)) { const gl = s.layer || 'top'; if (!grouped.has(gl)) grouped.set(gl, []); grouped.get(gl).push(s); continue; }   // 整層混合：整層一起畫
    const lid = s.layer || 'top';
    if (lid === 'top') {
      const t = mapTileById(s.id) || {};
      if (!chairConfig(s.id) && !t.baseHp && !Number.isFinite(s.sortDepth)) top.push(s);
    } else if (!stampIsOcc(s)) {
      if (!ground.has(lid)) ground.set(lid, []);
      ground.get(lid).push(s);
    }
  }
  return (mapStampGroupCache = { src, len: src.length, ground, top, grouped });
}
// 地面：所有「非立體物、非上層」的圖片，永遠畫在角色下面
function drawMapGround(ctx) {
  if (!MAP) return;
  updateMapDrawRect();   // 每一幀先算一次這一幀要畫的範圍（render.js 的 draw 最先畫地面）
  mapDrawFrame++;        // 新的一幀：遮擋補畫的狀態要重新問（occluderStateSig）
  const { ground } = mapStampGroups();
  for (const lid of MAP_LAYER_ORDER) {
    if (lid === 'top') continue;
    if (mapGroupedLayer(lid)) { drawMapLayerGroup(ctx, lid); continue; }   // 整層混合：整層當成一張圖
    if (!MAP_FLOOR2_LAYERS.has(lid)) {   // 2 樓圖層的小圖改走排序（蓋在一樓的人上面）
      if (!isOccLayer(lid)) drawLayerCellsInView(ctx, lid);
      else drawLayerCellsInView(ctx, lid, true);   // 物件圖層裡用格子筆刷畫的「平貼地面」小圖（例如水池邊的磁磚）也是地板，畫在角色下面
    }
    for (const s of ground.get(lid) || []) if (stampInDrawRect(s)) drawMapStampImg(ctx, s);
  }
  if (typeof drawOpenDoorsGround === 'function') drawOpenDoorsGround(ctx);   // 打開的挖空門：門洞的地板＋門框（在角色下面，js/doors.js）
}
// 上層：'top' 圖層，永遠畫在角色上面
function drawMapTop(ctx) {
  if (!MAP) return;
  if (mapGroupedLayer('top')) { drawMapLayerGroup(ctx, 'top'); return; }   // 整層混合：整層當成一張圖（椅子、據點照樣跟人排前後）
  drawLayerCellsInView(ctx, 'top');
  for (const s of mapStampGroups().top) if (stampInDrawRect(s)) drawMapStampImg(ctx, s);
}
// 立體物：會和角色互相遮擋，回傳 {y:底部Y, draw:畫它} 加進 out
//
// 排序用的「底部Y」有個例外：靠在別的東西上的裝飾（牆上的海報窗戶、櫃子上的咖啡機）自己很矮，
// 底部Y 比它依附的牆／櫃子小 → 只按自己的底部排，就會被後畫的牆／櫃子蓋掉。
// 所以先算「有效底部Y」：跟它重疊、而且在更下層的圖，底部比它低就跟著用那個的，
// 這樣它會緊接在那張圖之後畫出來，跟編輯器看到的上下關係一致。
// 重疊用「實際像素範圍」判斷（含方向鍵微調的 ox/oy），因為常常是靠微調才疊在一起、格子並沒有交集。
let occCache = null, occCacheFor = null, stairUpperRects = [];
// 平台邊緣、跨樓層的牆「下半段」的範圍（x, y, 寬, 高）：2 樓的東西不能畫在這裡（js/render.js 畫 2 樓時用 clipOutEdgeWallFaces 挖掉）
let edgeLowerRects = [];
// 側面的手扶梯（b.side）不算：它上半段的長方形還包含手扶梯後面的一樓地面，站在那裡的人不能被當成 2 樓（會畫到圍欄前面）；
// 真的站在手扶梯上的人由 js/escalators.js 的 escalatorRiderKey 自己決定畫在哪。燈光（js/lighting.js）還是整塊都算
// 這張圖有沒有自己的擋路格：置物箱（擋路格在 data/storage-boxes.js）、其他物件（data/prop-collisions.js），都是在物件編輯器設定的。
// 回傳一個「問某張圖」的小函式；物件編輯器的設定只讀一次，整張地圖共用
function stampOwnSolidChecker() {
  const propTiles = new Set();
  if (typeof propCollisionList === 'function') for (const o of propCollisionList()) if (o && o.tile && o.h && (o.h.solid || []).length) propTiles.add(o.tile);
  return s => {
    if (propTiles.has(s.id)) return true;
    const kind = typeof storagePropKindCached === 'function' ? storagePropKindCached(s.id) : null;
    return kind === 'closed' || kind === 'open';   // 置物箱（關著、打開的）
  };
}
function inStairUpper(x, y) { if (hasFloors && MAP) mapOccluders(); for (const b of stairUpperRects) if (!b.side && x >= b.x0 && x < b.x1 && y >= b.y0 && y < b.y1) return true; return false; }
function mapOccluders() {
  if (occCache && occCacheFor === MAP) return occCache;
  const items = [];
  MAP_LAYER_ORDER.forEach((lid, li) => {
    const layer = MAP.layers ? (MAP.layers[lid] || {}) : {};
    for (const key in layer) {
      const chair = chairConfig(layer[key]);
      if (!chair && mapGroupedLayer(lid)) continue;   // 整層混合：整層一起畫
      if (!chair && !(MAP_FLOOR2_LAYERS.has(lid) && lid !== 'top') && (lid === 'top' || !isOccLayer(lid))) continue;
      if (!chair && !MAP_FLOOR2_LAYERS.has(lid) && cellTileFlat(layer[key])) continue;   // 平貼地面的小圖：已經在地面那一輪畫過（drawMapGround），不跟角色排前後
      const [c, r] = key.split(',').map(Number), id = layer[key];
      const y0 = r * CELL;
      items.push({ li, x0: c * CELL, y0, x1: (c + 1) * CELL, y1: (r + 1) * CELL,
        sortY: chair ? y0 + chair.depth : null, fixedDepth: !!chair, kind: 'cell', id, c, r });
    }
    for (const s of (MAP.stamps || [])) {
      if (isElevatorStamp(s)) continue;
      if ((s.layer || 'top') !== lid || !stampIsOcc(s) || inMapLayerGroup(s)) continue;
      const t = mapTileById(s.id) || {};
      const chair = chairConfig(s.id);
      if (lid === 'top' && !t.baseHp && !chair && !Number.isFinite(s.sortDepth)) continue;
      const x0 = s.c * CELL + (s.ox || 0), y0 = s.r * CELL + (s.oy || 0), stampWpx = mapStampW(s, t) * CELL, stampHpx = mapStampH(s, t) * CELL;
      const depth = chair ? y0 + (s.fy ? mapStampH(s, t) * CELL - chair.depth : chair.depth) : t.baseHp
        ? Math.max(0, Math.min(mapStampH(s, t), Number.isFinite(s.baseDepth) ? s.baseDepth : (Number.isFinite(t.baseDepth) ? t.baseDepth : Math.max(1, mapStampH(s, t) - 2))))
        : (Number.isFinite(s.sortDepth) ? Math.max(0, Math.min(mapStampH(s, t), s.sortDepth))
          : (typeof tileCollisionDepthPx === 'function' && tileCollisionDepthPx(s, mapTileW(t) * CELL, mapTileH(t) * CELL) != null ? tileCollisionDepthPx(s, mapTileW(t) * CELL, mapTileH(t) * CELL) / CELL : null));   // 沒手動設遮擋線：素材有碰撞方框就用方框的中間（js/tile-collisions.js）
      // 排序看物件原本佔的範圍（樹根還在原地，放大的樹冠不影響前後）；vis＝畫出來實際蓋到的範圍，補畫上層圖時用
      const item = { li, x0, y0, x1: x0 + stampWpx, y1: y0 + stampHpx, vis: stampHasTransform(s) ? stampVisualBox(s, x0, y0, stampWpx, stampHpx) : null,
        sortY: depth == null ? null : chair ? depth : t.baseHp ? y0 + depth * CELL : stampDepthY(s, y0, stampHpx, depth * CELL), fixedDepth: depth != null, kind: 'stamp', stamp: s };
      const escY = typeof escalatorSideSortY === 'function' ? escalatorSideSortY(s, y0 + stampHpx) : null;   // 側面的手扶梯：排在站在上面的人之前（js/escalators.js）
      if (escY != null) { item.sortY = escY; item.fixedDepth = true; }
      if (stampConnects(s)) {   // 連接 1、2 樓的柱子：拆成下半段（一樓）、上半段（二樓）兩個，各畫各的那一半
        const mid = y0 + stampHpx / 2;
        items.push({ ...item, part: 'lower', splitY: mid }, { ...item, part: 'upper', splitY: mid });
      } else items.push(item);
    }
  });
  // items 已依圖層由下往上排好，所以下層的 y 一定先算完；
  // 這裡直接取下層「算完的 y」，疊好幾層也能接力（櫃子 → 咖啡機 → 杯子）。
  const ownSolid = stampOwnSolidChecker();
  for (const it of items) {
    it.y = it.fixedDepth ? it.sortY : it.y1;
    if (it.fixedDepth) continue;
    // 有自己擋路格的物件（置物箱、販賣機、營地的箱子…）是「站在地上」的，不是貼在牆上：前後一律只看自己的底部。
    // 不然放在一面比較長的牆前面，就會借到牆的底部，人物明明站在它前面卻被它蓋住（森林營地上面的置物箱就是這樣）
    if (it.kind === 'stamp' && ownSolid(it.stamp)) continue;
    for (const other of items) {                    // 找它底下那層、又跟它重疊的東西（牆、櫃子…）
      if (other.li >= it.li || other.y <= it.y) continue;
      if (itemOn2F(other) !== itemOn2F(it)) continue;    // 1 樓的東西（例如柱子）不能拿來當 2 樓牆壁的深度，不然 2 樓的牆會蓋住 2 樓的人
      if (itemOn2F(other) && !isOccLayer(MAP_LAYER_ORDER[other.li])) continue;   // 2 樓的地板不是「牆、櫃子」：不能拿來借深度（跟 1 樓的地板不在排序裡一樣）
      const overlapX = Math.min(it.x1, other.x1) - Math.max(it.x0, other.x0);
      const overlapY = Math.min(it.y1, other.y1) - Math.max(it.y0, other.y0);
      // 小杯子、海報等可貼在下層物件上；大型家具只碰到幾個像素的邊緣時不能借用對方的深度。
      const smallDecoration = it.y1 - it.y0 <= CELL;
      if (overlapX > 0 && (smallDecoration ? overlapY > 0 : overlapY >= CELL / 4)) it.y = other.y;
    }
  }
  // 標了「2樓」的圖（陸橋）：排在所有一樓的東西後面（蓋在一樓的人上面）；地板類的排在二樓的人後面、牆柱類的照底部Y跟二樓的人排前後
  for (const it of items) {
    const lid = MAP_LAYER_ORDER[it.li];
    const flat = it.kind === 'stamp' ? (it.part ? stampIsStairs(it.stamp) : !!(mapTileById(it.stamp.id) || {}).flat)
      : !it.fixedDepth && cellTileFlat(it.id);   // 平貼的圖（樓梯、手扶梯、地上的線，格子筆刷畫的也算）：人是踩在上面的，不能蓋住人
    it.floor = 1; it.band = DRAW_BAND.obj;   // 預設：一樓的物件，照底部 Y 跟人排前後（js/pathfinding.js 的 drawOrder）
    if (it.part === 'lower') { if (flat) { it.band = DRAW_BAND.ground; it.y = it.li; } continue; }   // 樓梯的下半段：一樓的地面，永遠在一樓的人下面
    if (it.part === 'upper') { it.floor = 2; if (flat) { it.band = DRAW_BAND.ground; it.y = it.li; } else it.y = it.splitY; continue; }   // 上半段：樓梯＝二樓的地面；柱子＝從分界那條線起算，跟二樓的人排前後
    if (!itemOn2F(it)) continue;
    // 2 樓的圖：地板類（平貼的圖、非物件圖層）＝2 樓的地板，在 2 樓的地上特效和人下面；物件類照底部 Y 跟 2 樓的人排前後；
    // 「2樓上層」圖層永遠在 2 樓的人上面。整個 2 樓都在 1 樓畫完之後才畫（蓋住橋下一樓的人）
    it.floor = 2;
    const standing = it.kind === 'stamp' && stampIsStandingObstacle(it.stamp);   // 礦物、路障：放在 2 樓地板圖層也照底部排前後
    if (flat || (!isOccLayer(lid) && !MAP_FLOOR2_TOP.has(lid) && !standing)) { it.band = DRAW_BAND.ground; it.y = it.li; }
    else if (MAP_FLOOR2_TOP.has(lid)) { it.band = DRAW_BAND.top; it.y = it.li; }
  }
  // 平台邊緣的牆（js/map-levels.js 的 wallFaceCells 算進來的那些）：2 樓的人站在牆頂上時，一律畫在這面牆後面（牆蓋住人）。
  // 照牆的最下緣排：2 樓的人走不到牆面，腳永遠碰不到最下緣，所以不會走到一半突然跳到牆前面。
  // 以前跨樓層的牆上半段照「圖片正中間那條線」排：人走到牆頂中間、腳超過那條線就突然跳到牆上面（B56 出過）
  const edgeWalls = new Set();
  MapLevels.wallFaceCells(MAP, mapTileById, null, edgeWalls);
  for (const it of items) {
    if (it.kind !== 'stamp' || !edgeWalls.has(it.stamp) || it.floor !== 2 || it.band !== DRAW_BAND.obj) continue;
    it.y = it.y1;
  }
  // 這種牆拆成上下兩半畫：下半段算 1 樓，在整個 2 樓之前就畫完了。2 樓的人、影子、建築只要有一點超過分界線往下，
  // 就會被畫在牆的下半段上面，看起來穿過牆（影子露出來、旁邊的燈蓋在牆上）。2 樓的東西本來就不可能在這面牆前面，
  // 所以畫 2 樓時把這些下半段整塊挖掉，什麼都畫不上去
  edgeLowerRects = items.filter(it => it.part === 'lower' && edgeWalls.has(it.stamp)).map(it => {
    const b = it.vis || it;
    return [OX + b.x0, OY + it.splitY, b.x1 - b.x0, b.y1 - it.splitY];
  }).filter(r => r[2] > 0 && r[3] > 0);
  // 2 樓的地板圖不畫在「牆面」的格子上（js/map-levels.js 的 wallFaceCells，跟擋路用同一份）：
  // 跨樓層的牆下半段算一樓、先畫，2 樓的地板在一樓全部畫完之後才畫；地板圖如果鋪到牆底下，就會把牆的下半段蓋掉，
  // 看起來牆面中間偏下那段變成地板（B56、R89 出過）。所以地板圖在牆面格子挖洞，讓底下的牆露出來
  const faces = typeof floor2WallFace !== 'undefined' ? floor2WallFace : null;
  if (faces && faces.size) for (const it of items) {
    if (it.part || it.floor !== 2 || it.band !== DRAW_BAND.ground) continue;
    const b = it.vis || it, holes = [];
    for (let c = Math.floor(b.x0 / CELL); c * CELL < b.x1; c++) for (let r = Math.floor(b.y0 / CELL); r * CELL < b.y1; r++) {
      if (!faces.has(c + ',' + r)) continue;
      const x0 = Math.max(b.x0, c * CELL), y0 = Math.max(b.y0, r * CELL), x1 = Math.min(b.x1, (c + 1) * CELL), y1 = Math.min(b.y1, (r + 1) * CELL);
      if (x1 > x0 && y1 > y0) holes.push([x0, y0, x1 - x0, y1 - y0]);
    }
    if (holes.length) it.faceHoles = { box: [b.x0, b.y0, b.x1 - b.x0, b.y1 - b.y0], holes };
  }
  // 樓梯（平貼、連接 1、2 樓的圖）的上半段範圍：站在裡面的人畫面上算 2 樓（js/pathfinding.js 的 visualFloor）
  stairUpperRects = items.filter(it => it.part === 'upper' && stampIsStairs(it.stamp)).map(it => ({ x0: OX + it.x0, x1: OX + it.x1, y0: OY + it.y0, y1: OY + it.splitY, side: typeof escalatorSideUsable === 'function' && escalatorSideUsable(it.stamp) }));
  buildLayerOverdraw(items);
  occCache = items; occCacheFor = MAP;
  return items;
}
// ---- 讓「編輯器裡在上層的圖」在遊戲裡也蓋在上面 ----
// 立體物依底部Y排序（角色才能走到前後），但這個順序可能跟編輯器的圖層相反：
// 例如牆上的監視器（平貼）、床頭牆板、比書桌低一點的椅子，進遊戲會被下層的牆／書桌蓋掉。
// 做法：畫完一個立體物之後，把「圖層比它高、跟它重疊、卻比它先畫」的圖，
// 只在重疊的範圍內再補畫一次。這樣只修正圖跟圖之間的上下，角色被遮擋的方式不變。
const itemOn2F = it => it.part ? it.part === 'upper' : it.kind === 'stamp' ? stampOn2F(it.stamp) : MAP_FLOOR2_LAYERS.has(MAP_LAYER_ORDER[it.li]);
function buildLayerOverdraw(items) {
  const flats = (MAP.stamps || []).filter(s => !isElevatorStamp(s) && (s.layer || 'top') !== 'top' && !stampIsOcc(s) && !inMapLayerGroup(s)).map(s => {
    const t = mapTileById(s.id) || {}, x0 = s.c * CELL + (s.ox || 0), y0 = s.r * CELL + (s.oy || 0);
    const fw = mapStampW(s, t) * CELL, fh = mapStampH(s, t) * CELL;
    return { flat: true, li: MAP_LAYER_ORDER.indexOf(s.layer || 'top'), x0, y0, x1: x0 + fw, y1: y0 + fh, vis: stampHasTransform(s) ? stampVisualBox(s, x0, y0, fw, fh) : null, kind: 'stamp', stamp: s };
  });
  // 立體物在遊戲裡的實際先後（底部Y，同樣的話照原本順序）
  const rank = new Map([...items].map((it, k) => ({ it, k })).sort((a, b) => a.it.y - b.it.y || a.k - b.k).map((o, n) => [o.it, n]));
  const order = new Map([...items, ...flats].map((it, k) => [it, k]));
  // 同一個圖層裡的物件：編輯器的物件清單可以拖曳排前後（m.stamps 越後面＝越前面）；格子圖算在同一層物件的下面
  const sub = it => it.kind === 'stamp' ? (MAP.stamps || []).indexOf(it.stamp) : -1;
  const higher = (a, x) => a.li > x.li || (a.li === x.li && sub(a) > sub(x));
  const groupLayers = mapGroupLayerBoxes();
  for (const x of items) {
    x.overdraw = [];
    for (const a of [...items, ...flats]) {
      if (a === x || !higher(a, x)) continue;                  // 只管比它上層（或同層排在它前面）的圖
      if (itemOn2F(a) !== itemOn2F(x)) continue;               // 1 樓的圖和 2 樓的圖前後由樓層決定，不互相補畫
      if (!a.flat && rank.get(a) > rank.get(x)) continue;       // 本來就比它晚畫，不用補
      const ab = a.vis || a, xb = x.vis || x;
      const cx0 = Math.max(ab.x0, xb.x0), cy0 = Math.max(ab.y0, xb.y0), cx1 = Math.min(ab.x1, xb.x1), cy1 = Math.min(ab.y1, xb.y1);
      if (cx1 <= cx0 || cy1 <= cy0) continue;
      x.overdraw.push({ a, clip: [cx0, cy0, cx1 - cx0, cy1 - cy0] });
    }
    // 整層混合的圖層（例如池核深水區用「色彩增值」疊上去的水）：地面那一輪就整層畫掉了，
    // 但立體物（例如抽水機平台的方塊）是之後才跟角色一起排序畫的，會蓋在水上面、看起來沒被淹到。
    // 所以「圖層比這個立體物高」的混合圖層，也要在這個立體物身上用同樣的混合模式再補一次（跟編輯器的疊法一樣）。
    if (!itemOn2F(x)) {
      const xb = x.vis || x;
      for (const g of groupLayers) {
        if (g.li <= x.li) continue;
        const list = []; let gx0 = Infinity, gy0 = Infinity, gx1 = -Infinity, gy1 = -Infinity;
        for (const b of g.boxes) {
          if (b.x1 <= xb.x0 || b.x0 >= xb.x1 || b.y1 <= xb.y0 || b.y0 >= xb.y1) continue;
          list.push(b.s); gx0 = Math.min(gx0, b.x0); gy0 = Math.min(gy0, b.y0); gx1 = Math.max(gx1, b.x1); gy1 = Math.max(gy1, b.y1);
        }
        if (!list.length) continue;
        const cx0 = Math.max(gx0, xb.x0), cy0 = Math.max(gy0, xb.y0), cx1 = Math.min(gx1, xb.x1), cy1 = Math.min(gy1, xb.y1);
        x.overdraw.push({ a: { li: g.li, group: g.lid }, list, clip: [cx0, cy0, cx1 - cx0, cy1 - cy0] });
      }
    }
    x.overdraw.sort((p, q) => p.a.li - q.a.li || (p.a.group ? 1 : 0) - (q.a.group ? 1 : 0) || sub(p.a) - sub(q.a) || (order.get(p.a) ?? 0) - (order.get(q.a) ?? 0));   // 依編輯器圖層（同層照前後）由下往上補畫
  }
}
// 整層混合的圖層裡每張圖蓋到的範圍（給上面的「補一次混合圖層」用）
function mapGroupLayerBoxes() {
  const out = [];
  for (const [lid, list] of mapStampGroups().grouped) {
    const boxes = list.map(s => {
      const t = mapTileById(s.id) || {}, x0 = s.c * CELL + (s.ox || 0), y0 = s.r * CELL + (s.oy || 0);
      const fw = mapStampW(s, t) * CELL, fh = mapStampH(s, t) * CELL, v = stampHasTransform(s) ? stampVisualBox(s, x0, y0, fw, fh) : null;
      return v ? { s, x0: v.x0, y0: v.y0, x1: v.x1, y1: v.y1 } : { s, x0, y0, x1: x0 + fw, y1: y0 + fh };
    });
    out.push({ lid, li: MAP_LAYER_ORDER.indexOf(lid), boxes });
  }
  return out;
}
function drawOccluderItem(ctx, it) {
  if (it.kind === 'cell') {
    if (!G.mapDestroyed.has(MAP_LAYER_ORDER[it.li] + ':' + it.c + ',' + it.r)) drawMapTileImg(ctx, it.id, OX + it.c * CELL, OY + it.r * CELL, MAP_LAYER_ORDER[it.li]);
  } else drawMapStampImg(ctx, it.stamp);
}
// 連接 1、2 樓的柱子：只畫自己那一半（下半段／上半段，分界在 it.splitY）
function withPartClip(ctx, it, fn) {
  if (it.faceHoles) {   // 2 樓地板圖：牆面那幾格挖掉不畫（上面 mapOccluders 算好的洞）
    const { box, holes } = it.faceHoles;
    ctx.save(); ctx.beginPath(); ctx.rect(OX + box[0], OY + box[1], box[2], box[3]);
    for (const h of holes) ctx.rect(OX + h[0], OY + h[1], h[2], h[3]);
    ctx.clip('evenodd'); fn(); ctx.restore(); return;
  }
  if (!it.part) { fn(); return; }
  ctx.save(); ctx.beginPath();
  const x = OX + it.x0 - CELL * 6, w = it.x1 - it.x0 + CELL * 12, my = OY + it.splitY;
  if (it.part === 'lower') ctx.rect(x, my, w, CELL * 40); else ctx.rect(x, my - CELL * 40, w, CELL * 40);
  ctx.clip(); fn(); ctx.restore();
}
// 開始畫 2 樓時呼叫（js/render.js）：把平台邊緣牆的下半段挖掉，之後畫的 2 樓東西都畫不到那裡。有挖就回傳 true（畫完要 ctx.restore()）
function clipOutEdgeWallFaces(ctx) {
  if (!MAP) return false;
  mapOccluders();
  if (!edgeLowerRects.length) return false;
  const v = mapDrawRect, BIG = 1e6;
  ctx.save();
  for (const [x, y, w, h] of edgeLowerRects) {
    if (v && (x + w < v.x0 || x > v.x1 || y + h < v.y0 || y > v.y1)) continue;   // 畫面外的不用挖
    const p = new Path2D(); p.rect(-BIG, -BIG, 2 * BIG, 2 * BIG); p.rect(x, y, w, h);
    ctx.clip(p, 'evenodd');   // 每挖一塊都跟前面的範圍取交集＝所有下半段都挖掉
  }
  return true;
}
function collectMapOccluders(ctx, out) {
  if (!MAP) return;
  const v = mapDrawFull ? null : (mapDrawRect || updateMapDrawRect());
  for (const it of mapOccluders()) {
    if (v && (it.kind === 'stamp' ? !stampInDrawRect(it.stamp)   // 在畫面範圍外：這一幀不畫
      : (it.x1 + OX <= v.x0 || it.x0 + OX >= v.x1 || it.y1 + OY <= v.y0 || it.y0 + OY >= v.y1))) continue;
    if (it.kind === 'cell' && G.mapDestroyed.has(MAP_LAYER_ORDER[it.li] + ':' + it.c + ',' + it.r)) continue;
    const y = typeof mrtMapItemSortY === 'function' ? mrtMapItemSortY(it, it.y) : it.y;   // 跟捷運列車底邊對齊的物件：整個排在車殼前面（js/mrt-train.js）
    out.push({ floor: it.floor, band: it.band, y, draw: () => withPartClip(ctx, it, () => {
      // 漂在水池上的小鴨、游泳圈：大型怪物落水的水浪經過時跟著晃（js/pool-surge.js 的 poolSurgeBobFor）
      const bob = typeof poolSurgeBobFor === 'function' ? poolSurgeBobFor(it) : null;
      if (bob) { ctx.save(); ctx.translate(bob.px + bob.dx, bob.py + bob.dy); ctx.rotate(bob.rot); ctx.translate(-bob.px, -bob.py); }
      drawOccluderItem(ctx, it);
      for (const od of it.overdraw || []) drawOverdrawPatch(ctx, it, od);   // 上層圖在重疊處補畫回來
      if (bob) ctx.restore();
    }) });
  }
}
// 補畫上層圖時，只補在「下層這張圖有畫東西的像素」上，不是整個重疊的長方形：
// 否則站在兩張圖之間的角色也會被蓋掉（例如坐在餐桌下排椅子上的人，頭被補畫的桌子整塊遮住）。
// 做法：在小畫布上畫上層圖，再用下層圖的形狀裁切（destination-in，不需要讀像素，雙擊開啟也能用）。
// 結果存起來重複使用；門開關、彈藥箱打開這類會變圖的，狀態一改就重做。
// 同一幀裡同一張圖會被好幾塊補畫問（MAP_FAST.sig）：第一次問完就記住，這一幀後面直接用
let occSigFrame = -1;
const occSigMemo = new Map();
function occluderStateSig(x) {
  if (!MAP_FAST.sig) return occluderStateSigNow(x);
  if (occSigFrame !== mapDrawFrame) { occSigFrame = mapDrawFrame; occSigMemo.clear(); }
  let v = occSigMemo.get(x);
  if (v === undefined) { v = occluderStateSigNow(x); occSigMemo.set(x, v); }
  return v;
}
function occluderStateSigNow(x) {
  if (x.kind === 'cell') {
    const layer = MAP_LAYER_ORDER[x.li], shown = typeof storagePropDisplayTile === 'function' ? storagePropDisplayTile(x.id, x.c, x.r, layer) : null;
    return (G.mapDestroyed.has(layer + ':' + x.c + ',' + x.r) ? 'x' : '') + (shown === false ? 'h' : shown ? (shown.id || 's') : '')   // h＝這格目前不顯示
      + (typeof secretAlpha === 'function' ? 'v' + Math.round(secretAlpha(null, layer, x.c + ',' + x.r) * 10) : '');
  }
  const s = x.stamp;
  const shown = typeof storagePropDisplayTile === 'function' ? storagePropDisplayTile(s.id, s.c, s.r, s.layer || 'top', s) : null;
  return (G.mapDestroyed && G.mapDestroyed.has(s) ? 'x' : '') + ((typeof doorStampOpen === 'function' && doorStampOpen(s)) ? 'o' : '')
    + (shown === false ? 'h' : shown ? (shown.id || 's') : '')   // 置物櫃開啟後，重疊補畫也必須換圖。
    + ((stampSwapTile(s) || {}).id || '')   // 彈藥箱打開、物資箱變成剩一些／空：換了圖，補畫也要重做（以前物資箱換圖不會重做）
    + (destroyedBaseDisplayTile(s, mapTileById(s.id) || {}).id || '')
    + (typeof breakableWallStage === 'function' && breakableWallStage(s) ? 'w' + breakableWallStage(s) : '')
    + (typeof ballBedHidden === 'function' && ballBedHidden(s) ? 'b' : '')
    + (typeof fogTreeStampBroken === 'function' && fogTreeStampBroken(s) ? 'f' : '')   // 霧樹水晶破了：換圖（js/fog.js）
    + (typeof nestStampSig === 'function' ? nestStampSig(s) : '')   // 鳥巢有蛋／空巢：換圖（js/chickens.js）
    + (typeof secretAlpha === 'function' ? 'v' + Math.round(secretAlpha(s) * 10) : '')   // 隱藏區圖層淡入中：補畫也要跟著重做
    + (typeof doorCutoutSig === 'function' ? doorCutoutSig(s) : '')   // 疊在這張圖上的挖空門開了／關了：門洞也要挖進補畫裡（js/doors.js）
    + (typeof escalatorAnimSig === 'function' ? escalatorAnimSig(s) : '');   // 會動的手扶梯：階梯捲到下一格，補畫也要跟著重做（不然疊在牆上的那一塊階梯不會動，js/escalators.js）
}
function occluderImageReady(x) {
  const s = x.kind === 'cell' ? null : x.stamp;
  const id = s ? s.id : x.id;
  const shown = typeof storagePropDisplayTile === 'function'
    ? storagePropDisplayTile(id, s ? s.c : x.c, s ? s.r : x.r, s ? (s.layer || 'top') : MAP_LAYER_ORDER[x.li], s) : null;
  if (shown === false) return true;
  if (!s) return !!tileImage(shown || mapTileById(id));   // 開啟圖尚未載好時，下一幀繼續重建，避免快取空白。
  // 物件：檢查「實際畫出來的那張圖」有沒有載好，不是原本那張。
  // 以前只看原本的圖：物資箱換上的「滿／剩一些／空」圖還沒下載完就做了補畫，補畫裡變成一塊深色方塊，
  // 之後又以為已經好了不再重做，營地就一直黑一塊（W118 營地的醫療箱）
  const t = stampShownTile(s);
  if (!t) return true;
  const swap = stampSwapTile(s);
  if (!swap && t.color && !t.file) return true;   // 純色方塊：沒有圖要等
  return !!tileImage(swap || t);
}
// 混合圖層補在立體物身上：小畫布畫那幾張水的圖，再用立體物的形狀裁切，最後用圖層的混合模式（例如色彩增值）貼回畫面
function drawGroupOverPatch(ctx, it, od) {
  const [cx, cy, cw, ch] = od.clip, lid = od.a.group;
  const alpha = typeof poolLayerAlpha === 'function' ? poolLayerAlpha(lid) : 1;   // 池核的水位：水退掉時這層變淡、消失
  if (alpha <= 0) return;
  const sig = occluderStateSig(it) + '|' + Math.round(alpha * 20);
  if (!od.patch || !od.ready || od.sig !== sig) {
    const c = od.patch || (od.patch = document.createElement('canvas'));
    c.width = Math.max(1, Math.ceil(cw)); c.height = Math.max(1, Math.ceil(ch));
    const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
    g.save(); g.translate(-(OX + cx), -(OY + cy));
    mapBlendSuspend = true;
    try {
      for (const s of od.list) if (!(G.mapDestroyed && G.mapDestroyed.has(s))) drawMapStampImg(g, s);
      g.globalCompositeOperation = 'destination-in';
      drawOccluderItem(g, it);                       // 只留立體物有畫東西的地方
    } finally { mapBlendSuspend = false; }
    g.restore();
    od.ready = occluderImageReady(it) && od.list.every(s => !!tileImage(mapTileById(s.id)));   // 圖還沒載完：下一幀再做一次
    od.sig = sig;
  }
  ctx.save(); ctx.globalCompositeOperation = mapLayerBlend(lid) || 'source-over'; ctx.globalAlpha *= alpha;   // 跟地面那一輪整層畫的時候一樣
  ctx.drawImage(od.patch, OX + cx, OY + cy); ctx.restore();
}
function drawOverdrawPatch(ctx, it, od) {
  if (od.a.group) { drawGroupOverPatch(ctx, it, od); return; }
  const [cx, cy, cw, ch] = od.clip;
  const sig = occluderStateSig(it) + '|' + occluderStateSig(od.a);
  if (!od.patch || !od.ready || od.sig !== sig) {
    const c = od.patch || (od.patch = document.createElement('canvas'));
    c.width = Math.max(1, Math.ceil(cw)); c.height = Math.max(1, Math.ceil(ch));
    const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
    g.save(); g.translate(-(OX + cx), -(OY + cy));
    mapBlendSuspend = true;                          // 小畫布上一律正常畫（混合模式會蓋掉 destination-in）
    try {
      drawOccluderItem(g, od.a);                     // 上層圖
      g.globalCompositeOperation = 'destination-in';
      drawOccluderItem(g, it);                       // 只留下層圖有畫東西的地方
    } finally { mapBlendSuspend = false; }
    g.restore();
    od.ready = occluderImageReady(it) && occluderImageReady(od.a);   // 圖還沒載完：下一幀再做一次
    od.sig = sig;
  }
  const blend = mapItemBlend(od.a);   // 上層圖有混合模式：補畫貼回畫面時照它的混合模式
  if (blend) { ctx.save(); ctx.globalCompositeOperation = blend; ctx.drawImage(od.patch, OX + cx, OY + cy); ctx.restore(); }
  else ctx.drawImage(od.patch, OX + cx, OY + cy);
}
// only：只畫這一台（劇情播放器要把每台電梯各自跟角色排前後，js/story-scene.js）；沒給＝全部都畫
// part（劇情用，js/story-scene.js）：'base'＝只畫電梯本體（開著＝開門的圖，不畫滑動中的門片）、'doors'＝只畫滑動中的兩片門；
// 中間可以畫站在電梯裡的人，人就會在電梯上面、門片裡面。沒給＝整台一起畫（遊戲裡照舊）
const elevatorIsOpen = stamp => (stamp === openElevatorStamp || elevatorOpenAnim?.stamp === stamp) && elevatorOpenImage.complete && elevatorOpenImage.naturalWidth;
function drawElevators(ctx, only, part) {
  for (const stamp of elevatorStamps()) {   // 只翻電梯（快取），不用每幀掃全部物件
    if (only && stamp !== only) continue;
    if (elevatorIsOpen(stamp)) {
      const x = OX + stamp.c * CELL + (stamp.ox || 0), y = OY + stamp.r * CELL + (stamp.oy || 0);
      if (part !== 'doors') ctx.drawImage(elevatorOpenImage, x, y, mapTileW(mapTileById(stamp.id)) * CELL, mapTileH(mapTileById(stamp.id)) * CELL);
      if (part === 'base') continue;
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
    } else if (part !== 'doors') drawMapStampImg(ctx, stamp);
  }
}

// 載入時立即套用地圖（在 game.js 之前）
initMap();
