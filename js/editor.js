/* ===== 地圖編輯器 — 核心程式（圖層 + 可翻轉圖片 + 圖片效果分離）=====
   圖片分兩層：🟫 地板層(floor) 在底、✨ 裝飾層(deco) 疊在上面(透明處透出地板)。
   另有多格大圖(stamps)疊最上面。以上都只是外觀。
   遊戲效果獨立標記：🧱 不可穿透(solid) / 💥 可破壞(breakable)。
   還可標怪物入口、營地，設定規則，Ctrl+Z 回復，自動存檔、可匯出。
   格線設定在 js/config.js；資料格式見 data/maps.js。
*/

const cv = document.getElementById('cv');
const ctx = cv.getContext('2d');
ctx.imageSmoothingEnabled = false;   // 像素圖不要模糊
// 2026-09-24：備份並清除目前的編輯器暫存，載入今天 pull 的 84ae68e 地圖。
const PULL_RESTORE_MARKER = 'tudrc_pull_restore_84ae68e_done';
const PULL_RESTORE_APPLIED = (() => {
  if (localStorage.getItem(PULL_RESTORE_MARKER)) return false;
  const oldKeys = ['tudrc_maps_v4', 'tudrc_tiles_v3', 'tudrc_map_preview_v1', 'tudrc_maps_v3', 'tudrc_tiles_v2', 'tudrc_maps_v2', 'tudrc_tiles_v1'];
  try {
    oldKeys.forEach(key => {
      const value = localStorage.getItem(key);
      const backupKey = key + '_backup_before_84ae68e_20260924';
      if (value && !localStorage.getItem(backupKey)) localStorage.setItem(backupKey, value);
    });
  } catch (error) {
    console.warn('無法備份舊地圖暫存，已保留原資料。', error);
    return false;
  }
  oldKeys.forEach(key => localStorage.removeItem(key));
  localStorage.setItem(PULL_RESTORE_MARKER, '1');
  return true;
})();
const STORAGE_MAPS = 'tudrc_maps_v4';
const STORAGE_TILES = 'tudrc_tiles_v3';
const STORAGE_PREVIEW = 'tudrc_map_preview_v1';   // 「預覽遊戲」用：把編輯中的地圖交給遊戲畫面
const STORAGE_DECOR_PACK = 'tudrc_asset_pack_item_decorate_v1';
const STORAGE_OBSTACLE_PACK = 'tudrc_asset_pack_item_obstacle_v1';
const STORAGE_NEW_ASSETS_PACK = 'tudrc_asset_pack_new_materials_v6';
const STORAGE_STATION_HALL_PACK = 'tudrc_asset_pack_station_hall_v2';
const STORAGE_EOC_PACK = 'tudrc_asset_pack_eoc_v1';        // 應變中心素材包
const STORAGE_BG_EXTRA_PACK = 'tudrc_asset_pack_bg_extra_v1';   // 後補的背景建材（牆面前緣 2／3）
const STORAGE_DAMAGED_PACK = 'tudrc_asset_pack_damaged_v1';     // 破損建築素材包（含搬過來的裂痕／碎石）
const STORAGE_FIELD_PACK = 'tudrc_asset_pack_field_v1';        // 野營／軍用素材包（帳篷、貨櫃、發電機、彈藥箱、置物櫃）
const STORAGE_FIELD_BASE = 'tudrc_asset_field_base_v4';         // 可破壞臨時基地（v4：預設深度線改為第 4 格）
const STORAGE_SCENE_PROPS_PACK = 'tudrc_asset_pack_scene_props_v1'; // 場景專用物件（不屬於玩家建築選單）
const STORAGE_PROPS_FURNITURE = 'tudrc_asset_pack_props_furniture_v1'; // 後補家具（工作桌、沙發、層架、電視、床…）
const STORAGE_EOC_HYDRANTS = 'tudrc_asset_eoc_hydrants_v1';            // 後補消防栓箱（紅／白）
const STORAGE_COUNSELING_TISSUE_FIX = 'tudrc_fix_counseling_tissue_v1'; // 疏導室面紙盒改名，避免與應變中心的同檔名
const STORAGE_EOC_NO_ENTRY = 'tudrc_asset_eoc_no_entry_poster_v1';      // 後補的應變中心素材：禁止進入海報
const STORAGE_EOC_STAIRS_DESK = 'tudrc_asset_eoc_stairs_desk_v1'; // 樓梯、雙開門、書和筆
const STORAGE_DORM_PACK = 'tudrc_asset_pack_dorm_v1'; // 宿舍家具與房間設備
const STORAGE_COUNSELING_ROOM_PACK = 'tudrc_asset_pack_counseling_room_v1'; // 疏導室素材包
const STORAGE_RESTAURANT_PACK = 'tudrc_asset_pack_restaurant_v1'; // 餐廳素材包
const STORAGE_HOSPITAL_PACK = 'tudrc_asset_pack_hospital_v1';     // 醫院病房素材包
const STORAGE_CONTAINMENT_PACK = 'tudrc_asset_pack_containment_v1'; // 收容觀察室素材包
const STORAGE_MRT_PACK = 'tudrc_asset_pack_mrt_station_v1';       // 捷運車站素材包
const STORAGE_CVS_PACK = 'tudrc_asset_pack_convenience_store_v1'; // 便利商店素材包
const STORAGE_BACKROOM_DAMAGE_EXTRA = 'tudrc_asset_backroom_damage_extra_v1'; // 後補：後室地板／牆面破損、看板、日光燈＋破損建築新素材
const STORAGE_BACKROOM_FLOOR_EDGE = 'tudrc_asset_backroom_floor_edge_v1';  // 後補：後室地板左緣／右緣
const STORAGE_BACKROOM_WALL_HALF_HOLE = 'tudrc_asset_backroom_wall_half_hole_v1'; // 後補：後室半牆、後室牆面（門洞）
const STORAGE_BACKROOM_DOOR_WOOD = 'tudrc_asset_backroom_door_wood_v1'; // 後補：後室木門（黃色，配門洞用）
const STORAGE_BACKROOM_CORE_PILLARS = 'tudrc_asset_backroom_core_pillars_v1'; // 後補：異質核心與柱子變化
const BACKROOM_CORE_PILLAR_IDS = new Set(['tile_bg_anomalous_core', 'tile_bg_backroom_pillar3', 'tile_bg_pillar', 'tile_bg_pillar02', 'tile_bg_pillar03', 'tile_bg_pillar04']);
const BACKROOM_DAMAGE_EXTRA_IDS = new Set(["tile_bg_backroom_floor03", "tile_bg_backroom_floor04", "tile_bg_backroom_wall02", "tile_bg_backroom_wall02_dmg_light", "tile_bg_backroom_wall02_dmg_medium", "tile_bg_backroom_wall02_dmg_heavy", "tile_bg_electric_light", "tile_bg_road_signs", "tile_bg_word_y28", "tile_dmg_backroom_pillar_damaged", "tile_dmg_pillar_damaged", "tile_dmg_floor_crack_cross", "tile_dmg_floor_crack_fork", "tile_dmg_floor_crack_stained", "tile_dmg_floor_stain_seep", "tile_dmg_floor_stain_smudge", "tile_dmg_rubble_brick_chunks", "tile_dmg_rubble_chips_02", "tile_dmg_rubble_scatter_02", "tile_dmg_rubble_slab_fragments", "tile_dmg_rubble_wall_chunks", "tile_dmg_rubble_rebar_chunk"]);
const STORAGE_OIL_TANK = 'tudrc_asset_pack_oil_tank_v2';   // 新增素材：油箱
const STORAGE_RESTAURANT_CHAIR_FIX = 'tudrc_fix_restaurant_folding_chairs_v1'; // 餐廳「飲水機」其實是折疊椅：改檔名與名稱
const STORAGE_TILE_SIZE_FIX = 'tudrc_fix_tile_sizes_v1';         // 修正登記尺寸與圖片不符的素材
const STORAGE_EOC_POSTER = 'tudrc_asset_eoc_distance_poster_v1'; // 後補的應變中心素材：安全距離海報
const STORAGE_EOC_WALL_ITEMS = 'tudrc_asset_eoc_wall_items_v1';  // 後補的應變中心素材：門（電子鎖）、消防栓箱
const STORAGE_DAMAGE_ASSETS_CLEANUP = 'tudrc_remove_unapproved_damage_assets_v1';

// 地圖畫布的點選音效；按鈕與切換的回饋由 ui-feedback.js 共用處理。
const mapClickSound = new Audio('Sound effects/對話框下一頁音效.mp3');
mapClickSound.preload = 'auto';
mapClickSound.volume = 0.55;

function playMapClickSound() {
  mapClickSound.currentTime = 0;
  mapClickSound.play().catch(() => {});
}

// ---- 小工具 ----
const clone = (o) => JSON.parse(JSON.stringify(o));
const removeFrom = (arr, key) => { const i = arr.indexOf(key); if (i >= 0) arr.splice(i, 1); };
const toggle = (arr, key) => { const i = arr.indexOf(key); if (i >= 0) arr.splice(i, 1); else arr.push(key); };
const roleLabel = (r) => ({ floor: '地板', wall: '牆', obstacle: '障礙物' })[r] || r;
const tileW = (t) => (t && t.w) || 1;
const tileH = (t) => (t && t.h) || 1;
const isBig = (t) => tileW(t) !== 1 || tileH(t) !== 1;
const tilePixelW = (t) => Math.round(tileW(t) * CELL);
const tilePixelH = (t) => Math.round(tileH(t) * CELL);

// ---- 圖層（由底到上；要加減層改這裡即可）----
const LAYERS = [
  { id: 'floor', name: '🟫 地板' },
  { id: 'ground', name: '🌿 地面裝飾' },
  { id: 'ground2', name: '🍂 地面裝飾 2' },
  { id: 'ground3', name: '🩹 地面裝飾 3' },
  { id: 'object', name: '📦 物件' },
  { id: 'object2', name: '🧰 物件 2' },
  { id: 'object3', name: '🪑 物件 3' },
  { id: 'object4', name: '🚧 物件 4' },
  { id: 'overlay', name: '🎯 物件裝飾' },
  { id: 'top', name: '☁️ 上層' },
];
const layerName = (id) => (LAYERS.find(l => l.id === id) || {}).name || id;
const emptyLayers = () => { const o = {}; LAYERS.forEach(l => o[l.id] = {}); return o; };

// ---- 內建磚塊（純圖片；牆/障礙先用色塊當佔位圖）----
const BUILTIN_TILES = [
  { id: 'floor', name: '地板', role: 'floor', file: 'images/background/Back-room-floor.png', w: 1, h: 1, builtin: true },
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
let brushFlip = { fx: false, fy: false };   // 筆刷翻轉（大小圖都可用）
let tempTool = null, savedBrush = null, pickResult = null;   // Alt=臨時吸管 / Ctrl=臨時選取
let selectionDrag = null;
const hiddenLayers = new Set();
// 鎖定的圖層：看得到、但不能貼圖／擦除／選取／搬動（跟「隱藏」不一樣）
const lockedLayers = new Set();
const isLockedLayer = lid => lockedLayers.has(lid || 'top');
// 選取物件所在的圖層（大圖看 s.layer、小圖看 sel.layer）
function selectionLayer(sel) {
  if (!sel) return null;
  if (sel.type === 'tile') return sel.layer;
  const s = curMap().stamps[sel.index];
  return s ? (s.layer || 'top') : null;
}

const palette = () => BUILTIN_TILES.concat(customTiles);
const tileById = (id) => palette().find(t => t.id === id);
const wallCells = (m) => new Set(m.solid);   // 只有「不可穿透」才擋路

// match：id 前綴字串，或是 (tile) => boolean 的篩選函式（例如依資料夾挑素材）
function mergeDefaultAssetPack(match, storageKey, idOnly = false) {
  if (localStorage.getItem(storageKey)) return false;
  const picks = typeof match === 'function' ? match : (t => String(t.id).startsWith(match));
  const packTiles = TILES_CUSTOM.filter(picks);
  const baseName = f => String(f || '').replace(/\\/g, '/').split('/').pop().toLowerCase();
  const knownIds = new Set(TILES_CUSTOM.map(x => x.id));
  packTiles.forEach(t => {
    const filename = baseName(t.file);
    // 先用 id 找；找不到才用檔名找，而且只認「使用者自己加的素材」——
    // 不能拿別的內建素材來改（曾經因為兩張圖都叫 pillar.png，把大廳高柱改壞）。
    const existing = customTiles.find(x => x.id === t.id)
      || (!idOnly && customTiles.find(x => !knownIds.has(x.id) && filename && baseName(x.file) === filename));
    if (existing) {
      existing.file = t.file; existing.w = t.w; existing.h = t.h;
      if (t.flat) existing.flat = true; else delete existing.flat;   // 讓「平貼地面」標記同步到編輯器暫存，匯出才不會掉
      if (t.baseHp) {
        existing.baseHp = t.baseHp;
        existing.baseDepth = t.baseDepth;
        existing.baseSolid = clone(t.baseSolid || []);
      }
    } else customTiles.push(clone(t));
  });
  localStorage.setItem(storageKey, '1');
  return packTiles.length > 0;
}

function loadTiles() {
  const saved = localStorage.getItem(STORAGE_TILES);
  if (saved) { try { customTiles = JSON.parse(saved); } catch (e) { customTiles = clone(TILES_CUSTOM); } }
  else customTiles = clone(TILES_CUSTOM);
  if (!Array.isArray(customTiles)) customTiles = [];
  customTiles.forEach(t => { t.w = t.w || 1; t.h = t.h || 1; });

  // 尚未確認的破損建築概念圖不應留在素材清單；只清理先前誤匯入的一批。
  let damageAssetsRemoved = false;
  if (!localStorage.getItem(STORAGE_DAMAGE_ASSETS_CLEANUP)) {
    const before = customTiles.length;
    customTiles = customTiles.filter(t => !String(t.id).startsWith('tile_damage_'));
    damageAssetsRemoved = customTiles.length !== before;
    localStorage.setItem(STORAGE_DAMAGE_ASSETS_CLEANUP, '1');
  }

  // 新素材包各自只自動補入一次；保留使用者原有素材與地圖內容。
  const organizedAssetPaths = {
    'images/書和筆.png': 'images/應變中心/book-and-pen.png',
    'images/樓梯.png': 'images/應變中心/escape-stairs.png',
    'images/雙開門.png': 'images/應變中心/double-door-open.png',
    'images/exec-c68e3f9e-1fbc-46da-a9fe-b0d90fe5f862.png': 'images/宿舍/desk.png',
    'images/exec-e610ecc9-a73b-4d1c-96a0-ed77d8f75795.png': 'images/宿舍/office-chair-back.png',
    'images/圖層 100.png': 'images/宿舍/chair-blue.png',
    'images/圖層 102 拷貝 2.png': 'images/宿舍/shoe-bench.png',
    'images/圖層 105 拷貝.png': 'images/宿舍/desk-lamp.png',
    'images/圖層 111.png': 'images/宿舍/rug-blue.png',
    'images/圖層 113 拷貝.png': 'images/宿舍/wardrobe-lab-coat.png',
    'images/圖層 114 拷貝.png': 'images/宿舍/cabinet-tall.png',
    'images/圖層 114.png': 'images/宿舍/bedside-drawers.png',
    'images/圖層 115.png': 'images/宿舍/computer-monitor.png',
    'images/圖層 116 拷貝.png': 'images/宿舍/bed-horizontal.png',
    'images/圖層 83.png': 'images/宿舍/standing-fan.png',
    'images/圖層 86.png': 'images/宿舍/bed-vertical.png',
    'images/圖層 88.png': 'images/宿舍/air-conditioner.png',
    'images/圖層 90 拷貝.png': 'images/宿舍/window-blinds-wide.png',
    'images/圖層 90.png': 'images/宿舍/window-blinds-narrow.png',
    'images/圖層 98 拷貝 2.png': 'images/宿舍/binder-set.png',
  };
  let organizedPathsChanged = false;
  customTiles.forEach(t => {
    const replacement = organizedAssetPaths[String(t.file || '').replace(/\\/g, '/')];
    if (replacement) { t.file = replacement; organizedPathsChanged = true; }
  });
  const stairsDeskAdded = mergeDefaultAssetPack(t => ['tile_eoc_book_and_pen', 'tile_eoc_escape_stairs', 'tile_eoc_double_door_open'].includes(t.id), STORAGE_EOC_STAIRS_DESK);
  const dormAdded = mergeDefaultAssetPack('tile_dorm_', STORAGE_DORM_PACK);
  if (organizedPathsChanged || stairsDeskAdded || dormAdded) saveTiles();
  const decorAdded = mergeDefaultAssetPack('tile_decor_', STORAGE_DECOR_PACK);
  const obstaclesAdded = mergeDefaultAssetPack('tile_obstacle_', STORAGE_OBSTACLE_PACK);
  const newAssetsAdded = mergeDefaultAssetPack('tile_new_', STORAGE_NEW_ASSETS_PACK);
  const stationHallAdded = mergeDefaultAssetPack('tile_station_hall_', STORAGE_STATION_HALL_PACK);
  const eocAdded = mergeDefaultAssetPack('tile_eoc_', STORAGE_EOC_PACK);
  const bgExtraAdded = mergeDefaultAssetPack(t => String(t.id).startsWith('tile_bg_') && !BACKROOM_CORE_PILLAR_IDS.has(t.id), STORAGE_BG_EXTRA_PACK);
  const fieldAdded = mergeDefaultAssetPack('tile_field_', STORAGE_FIELD_PACK);   // 野營／軍用素材
  const fieldBaseAdded = mergeDefaultAssetPack(t => t.id === 'tile_field_base', STORAGE_FIELD_BASE);
  const scenePropsAdded = mergeDefaultAssetPack(t => String(t.file || '').includes('/scene-props/'), STORAGE_SCENE_PROPS_PACK);
  const propsFurnitureAdded = mergeDefaultAssetPack('tile_prop_', STORAGE_PROPS_FURNITURE);
  const eocHydrantsAdded = mergeDefaultAssetPack(t => t.id === 'tile_eoc_hydrant_red' || t.id === 'tile_eoc_hydrant_white', STORAGE_EOC_HYDRANTS);
  const counselingTissueFixed = mergeDefaultAssetPack(t => t.id === 'tile_counseling_tissue_box', STORAGE_COUNSELING_TISSUE_FIX);
  const noEntryAdded = mergeDefaultAssetPack(t => t.id === 'tile_eoc_no_entry_poster', STORAGE_EOC_NO_ENTRY);
  const counselingRoomAdded = mergeDefaultAssetPack('tile_counseling_', STORAGE_COUNSELING_ROOM_PACK);
  const restaurantAdded = mergeDefaultAssetPack('tile_restaurant_', STORAGE_RESTAURANT_PACK);
  const hospitalAdded = mergeDefaultAssetPack('tile_hospital_', STORAGE_HOSPITAL_PACK);
  const containmentAdded = mergeDefaultAssetPack('tile_containment_', STORAGE_CONTAINMENT_PACK);
  const mrtAdded = mergeDefaultAssetPack('tile_mrt_', STORAGE_MRT_PACK);
  const cvsAdded = mergeDefaultAssetPack('tile_cvs_', STORAGE_CVS_PACK);
  const backroomDamageAdded = mergeDefaultAssetPack(t => BACKROOM_DAMAGE_EXTRA_IDS.has(t.id), STORAGE_BACKROOM_DAMAGE_EXTRA);
  const backroomEdgeAdded = mergeDefaultAssetPack(t => t.id === 'tile_bg_backroom_floor05' || t.id === 'tile_bg_backroom_floor06', STORAGE_BACKROOM_FLOOR_EDGE);
  const backroomWallHalfHoleAdded = mergeDefaultAssetPack(t => t.id === 'tile_bg_backroom_wall02_half' || t.id === 'tile_bg_backroom_wall02_hole', STORAGE_BACKROOM_WALL_HALF_HOLE);
  const backroomDoorWoodAdded = mergeDefaultAssetPack(t => t.id === 'tile_bg_backroom_door_wood', STORAGE_BACKROOM_DOOR_WOOD);
  const oilTankAdded = mergeDefaultAssetPack(t => t.id === 'tile_new_decor_oil_tank', STORAGE_OIL_TANK);
  const backroomCorePillarsAdded = mergeDefaultAssetPack(t => BACKROOM_CORE_PILLAR_IDS.has(t.id), STORAGE_BACKROOM_CORE_PILLARS, true);
  let restaurantChairsFixed = false;
  if (!localStorage.getItem(STORAGE_RESTAURANT_CHAIR_FIX)) {   // 素材 id 不變，地圖上的擺放不受影響
    for (const id of ['tile_restaurant_water_dispenser_01', 'tile_restaurant_water_dispenser_02']) {
      const src = TILES_CUSTOM.find(t => t.id === id), own = customTiles.find(t => t.id === id);
      if (src && own) { own.file = src.file; own.name = src.name; restaurantChairsFixed = true; }
    }
    localStorage.setItem(STORAGE_RESTAURANT_CHAIR_FIX, '1');
  }
  // 破損建築：新素材（tile_dmg_）＋從 item-decorate 搬過來的裂痕／碎石（更新路徑與尺寸，地圖上的擺放不變）
  const damagedAdded = mergeDefaultAssetPack(t => String(t.file || '').includes('/破損建築/'), STORAGE_DAMAGED_PACK);
  // 兩個「柱子」曾因同檔名互相覆蓋：大廳高柱改回 2×8、補回應變中心的柱子
  const sizeFixed = mergeDefaultAssetPack(t => t.id === 'tile_station_hall_pillar' || t.id === 'tile_eoc_pillar', STORAGE_TILE_SIZE_FIX);
  const eocPosterAdded = mergeDefaultAssetPack(t => t.id === 'tile_eoc_distance_poster', STORAGE_EOC_POSTER);
  const eocWallAdded = mergeDefaultAssetPack(t => t.id === 'tile_eoc_security_door' || t.id === 'tile_eoc_fire_hydrant', STORAGE_EOC_WALL_ITEMS);
  if (decorAdded || obstaclesAdded || newAssetsAdded || stationHallAdded || eocAdded || bgExtraAdded || damageAssetsRemoved || damagedAdded || sizeFixed || eocPosterAdded || eocWallAdded || fieldAdded || fieldBaseAdded || scenePropsAdded || counselingRoomAdded || restaurantAdded || hospitalAdded || containmentAdded || mrtAdded || cvsAdded || backroomDamageAdded || backroomEdgeAdded || backroomWallHalfHoleAdded || backroomDoorWoodAdded || backroomCorePillarsAdded || restaurantChairsFixed || propsFurnitureAdded || eocHydrantsAdded || counselingTissueFixed || noEntryAdded || oilTankAdded) saveTiles();

  // 一次性遷移：圖片已搬到 images/ 資料夾，把瀏覽器暫存裡的舊路徑自動更新
  let migrated = false;
  customTiles.forEach(t => {
    if (t.file === 'background/roadblocks.png') { t.file = 'images/item-obstacle/04roadblocks.png'; migrated = true; }
    else if (t.file && t.file.startsWith('background/')) { t.file = 'images/' + t.file; migrated = true; }
  });
  if (migrated) saveTiles();
}
function saveTiles() { localStorage.setItem(STORAGE_TILES, JSON.stringify(customTiles)); }

function loadMaps() {
  const saved = localStorage.getItem(STORAGE_MAPS);
  if (saved) { try { maps = JSON.parse(saved); } catch (e) { maps = clone(MAPS_DEFAULT); } }
  else maps = clone(MAPS_DEFAULT);
  if (!Array.isArray(maps) || maps.length === 0) maps = clone(MAPS_DEFAULT);
  // 專案資料中若有瀏覽器暫存缺少的地圖，只補上缺少的項目，保留使用者目前的編輯內容。
  let restoredDefaults = false;
  MAPS_DEFAULT.forEach(defaultMap => {
    if (!maps.some(map => map.id === defaultMap.id)) {
      maps.push(clone(defaultMap));
      restoredDefaults = true;
    }
  });
  maps.forEach(fixMap);
  // 撤回先前自動加的四排地板；若使用者已在那裡編輯，保留其內容。
  let restoredEocHeight = false;
  const eoc = maps.find(map => map.id === 'map_mu5ad7t2');
  if (eoc && eoc.cols === 40 && eoc.rows === 18) {
    let onlyAddedFloor = true;
    for (let r = 14; r < 18; r++) for (let c = 0; c < 40; c++) {
      if (eoc.layers.floor[c + ',' + r] !== 'tile_new_bg_floor') onlyAddedFloor = false;
    }
    for (const [layer, cells] of Object.entries(eoc.layers)) {
      for (const key of Object.keys(cells)) {
        if (Number(key.split(',')[1]) >= 14 && layer !== 'floor') onlyAddedFloor = false;
      }
    }
    if ((eoc.stamps || []).some(s => s.r >= 14)) onlyAddedFloor = false;
    if (['solid', 'breakable', 'entrances', 'camp', 'coreSpots'].some(field =>
      (eoc[field] || []).some(key => Number(key.split(',')[1]) >= 14))) onlyAddedFloor = false;
    if ((eoc.portals || []).some(p => p.r >= 14)) onlyAddedFloor = false;
    if (onlyAddedFloor) {
      for (let r = 14; r < 18; r++) for (let c = 0; c < 40; c++) delete eoc.layers.floor[c + ',' + r];
      eoc.rows = 14;
      restoredEocHeight = true;
    }
  }
  if (restoredDefaults || restoredEocHeight) localStorage.setItem(STORAGE_MAPS, JSON.stringify(maps));
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
  m.coreSpots = Array.isArray(m.coreSpots) ? [...new Set(m.coreSpots)] : [];
  m.coreCount = m.coreCount != null && Number.isFinite(Number(m.coreCount))
    ? Math.max(1, Math.min(20, Math.floor(Number(m.coreCount))))
    : Math.max(1, Math.min(20, Math.floor(Number(m.difficulty) || 1)));
  m.rules = Object.assign({
    money: 150, guide: 100, guideRegen: 9, waves: 5,
    count: 8, countAdd: 3, hp: 40, hpAdd: 28, speed: 44, speedAdd: 5,
    gap: 0.85, gapSub: 0.05, reward: 8,
  }, m.rules || {});
  m.name = m.name || '未命名地圖'; m.desc = m.desc || '';
  m.solidOffsets = m.solidOffsets || {};   // 不可穿透格的像素微調：'c,r' → [dx, dy]
  Object.keys(m.solidOffsets).forEach(k => { if (m.solid.indexOf(k) < 0) delete m.solidOffsets[k]; });   // 沒有紅格就不留微調
  m.safe = !!m.safe;   // 安全場景：遊戲裡不生怪、不套黑幕
  m.npcs = !!m.npcs;   // 場景 NPC：這張地圖會不會出現克莉思、路德等人
  m.portals = Array.isArray(m.portals) ? m.portals : [];   // 出入口：[{c,r,to:目標地圖id}]
  m.cols = m.cols || 32; m.rows = m.rows || 18;   // 地圖大小（舊地圖沒存就用預設）
  return m;
}
// 依目前地圖的大小調整格數與畫布（畫布太大時外框會出現捲軸）
function applyMapSize() {
  const m = curMap();
  COLS = m.cols; ROWS = m.rows;
  const w = COLS * CELL, h = ROWS * CELL;
  if (cv.width !== w || cv.height !== h) {
    cv.width = w; cv.height = h;
    ctx.imageSmoothingEnabled = false;   // 改畫布大小會重置設定，要再關一次模糊
  }
  applyZoom();   // 依目前縮放倍率設定顯示大小
}
// ---- 縮放：只改「顯示大小」，畫布內部解析度不變；點擊座標會自動換算，不受影響 ----
let editorZoom = 0;   // 0＝尚未設定；第一次載入會自動「全覽整張」
function fitZoom() {
  const wrap = document.getElementById('wrap');
  const availW = Math.max(120, wrap.clientWidth - 4);
  const availH = Math.max(200, window.innerHeight * 0.82 - 4);
  return Math.max(0.1, Math.min(1, Math.min(availW / cv.width, availH / cv.height)));
}
function applyZoom() {
  if (!editorZoom) editorZoom = fitZoom();
  cv.style.maxWidth = 'none';
  cv.style.width = Math.round(cv.width * editorZoom) + 'px';
  cv.style.height = Math.round(cv.height * editorZoom) + 'px';
  const lbl = document.getElementById('zoomLabel');
  if (lbl) lbl.textContent = Math.round(editorZoom * 100) + '%';
}
function setZoom(z) { editorZoom = Math.max(0.1, Math.min(3, z)); applyZoom(); }
document.getElementById('zoomIn').onclick = () => setZoom(editorZoom * 1.25);
document.getElementById('zoomOut').onclick = () => setZoom(editorZoom / 1.25);
document.getElementById('zoomFit').onclick = () => { editorZoom = fitZoom(); applyZoom(); };
document.getElementById('zoom100').onclick = () => setZoom(1);
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
  applyMapSize(); refreshMapSelect(); renderPalette(); loadRules(); draw();
  setStatus('已回復上一步（還剩 ' + undoStack.length + ' 步可回復）', '#7ee0c0');
}
window.addEventListener('keydown', e => {
  const inField = /^(input|textarea)$/i.test(e.target.tagName || '');
  if (!inField && e.key === 'Alt' && !tempTool) { e.preventDefault(); enterTemp('pick'); return; }
  if (!inField && (e.key === 'Control' || e.key === 'Meta') && !tempTool) { enterTemp('select'); return; }
  if ((e.ctrlKey || e.metaKey) && !e.shiftKey && (e.key === 'z' || e.key === 'Z')) { if (inField) return; e.preventDefault(); undo(); }
  if (e.key === 'Delete' && !inField && selections.length) { e.preventDefault(); deleteSelection(); }
  if (!inField && (e.key === 'f' || e.key === 'F')) { e.preventDefault(); flipAction('x'); }
  if (!inField && (e.key === 'v' || e.key === 'V')) { e.preventDefault(); flipAction('y'); }
  // 方向鍵：微調選取物件的位置（不貼齊格線；按住 Shift 一次移多一點）
  // 1×1 小圖原本存成「格子」，格子只有格座標、沒有像素位移 → 第一次微調時先轉成 1×1 大圖。
  // 碰撞微調：方向鍵移動選中紅格的擋路範圍（Shift 一次多移一點，Delete 歸零）
  if (!inField && brush.mode === 'solidnudge' && solidNudgeCell) {
    const m = curMap();
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault(); delete m.solidOffsets[solidNudgeCell];
      saveMaps(); draw(); setStatus('這格的碰撞範圍已歸零（回到整格對齊）', '#7ee0c0');
      return;
    }
    if (/^Arrow(Left|Right|Up|Down)$/.test(e.key)) {
      e.preventDefault();
      const step = e.shiftKey ? 10 : 1;
      const off = m.solidOffsets[solidNudgeCell] || [0, 0];
      const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
      const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
      const clamp = v => Math.max(-39, Math.min(39, v));      // 最多偏移一格內，避免跳到別格
      const next = [clamp(off[0] + dx), clamp(off[1] + dy)];
      if (next[0] === 0 && next[1] === 0) delete m.solidOffsets[solidNudgeCell];
      else m.solidOffsets[solidNudgeCell] = next;
      saveMaps(); draw();
      setStatus('碰撞範圍偏移：' + next[0] + ', ' + next[1] + ' px', '#ffd479');
      return;
    }
  }
  if (!inField && /^Arrow(Left|Right|Up|Down)$/.test(e.key) && selections.length) {
    e.preventDefault();
    if (dropLockedSelections('微調位置')) return;
    const step = e.shiftKey ? 10 : 2;
    const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
    const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
    const m = curMap();
    let converted = 0;
    selections = selections.map(sel => {
      if (sel.type !== 'tile') return sel;
      const id = m.layers[sel.layer] && m.layers[sel.layer][sel.key];
      if (!id) return sel;
      const [c, r] = sel.key.split(',').map(Number);
      delete m.layers[sel.layer][sel.key];
      m.stamps.push({ id, c, r, layer: sel.layer });
      converted++;
      return { type: 'stamp', index: m.stamps.length - 1 };
    });
    selections.filter(s => s.type === 'stamp').forEach(sel => {
      const s = m.stamps[sel.index]; if (!s) return;
      s.ox = (s.ox || 0) + dx; s.oy = (s.oy || 0) + dy;
    });
    selection = selections.length ? selections[selections.length - 1] : null;
    refreshSelPanel(); saveMaps(); draw();
    if (converted) setStatus('已把 ' + converted + ' 張小圖轉成可微調的物件（想貼回格線按「↺ 回格線」）', '#8fd3ff');
  }
});
window.addEventListener('keyup', e => {
  if (!tempTool) return;
  if (tempTool === 'pick' && !e.altKey) exitTemp();
  else if (tempTool === 'select' && !e.ctrlKey && !e.metaKey) exitTemp();
});
window.addEventListener('blur', () => { if (tempTool) exitTemp(); });

// ================= 磚塊圖片載入 =================
const tileImgCache = {};
const TILE_IMAGE_FOLDERS = [
  'images/background',
  'images/item-decorate',
  'images/item-obstacle',
  'images/01-station-hall',
  'images/應變中心',
  'images/宿舍',
  'images/破損建築',
  'images/餐廳',
  'images/醫院病房',
  'images/收容觀察室',
  'images/捷運車站',
  'images/convenience-store',
];
function tileImageSources(file) {
  if (!file || /^(data:|blob:)/i.test(file)) return file ? [file] : [];
  const clean = file.replace(/\\/g, '/');
  const filename = clean.split('/').pop();
  return [...new Set([clean, ...TILE_IMAGE_FOLDERS.map(folder => folder + '/' + filename)])];
}
function findProjectImagePath(filename) {
  const sources = TILE_IMAGE_FOLDERS.map(folder => folder + '/' + filename);
  return new Promise(resolve => {
    let index = 0;
    const tryNext = () => {
      if (index >= sources.length) { resolve(null); return; }
      const source = sources[index++];
      const probe = new Image();
      probe.onload = () => resolve(source);
      probe.onerror = tryNext;
      probe.src = source;
    };
    tryNext();
  });
}
function ensureTileImg(t) {
  if (!t.file) return null;
  if (tileImgCache[t.id]) return tileImgCache[t.id];
  const img = new Image(); const rec = { img, loaded: false, error: false, source: '' };
  const sources = tileImageSources(t.file);
  let sourceIndex = 0;
  const tryNext = () => {
    if (sourceIndex >= sources.length) { rec.error = true; renderPalette(); return; }
    rec.source = sources[sourceIndex++];
    img.src = rec.source;
  };
  img.onload = () => {
    rec.loaded = true; rec.error = false;
    if (t.file !== rec.source) { t.file = rec.source; saveTiles(); }
    draw(); renderPalette();
  };
  img.onerror = tryNext;
  tryNext();
  tileImgCache[t.id] = rec; return rec;
}
function preloadTiles() { palette().forEach(t => { if (t.file) ensureTileImg(t); }); }

function roundRect(x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
// 格子底：沒放素材的地方＝純黑
function drawCellBase(x, y) {
  ctx.fillStyle = '#000'; ctx.fillRect(x, y, CELL, CELL);
}
// 畫 1×1 小圖（有圖用圖，沒圖用色塊佔位）
function drawTile(id, x, y) {
  const t = tileById(id);
  if (!t) return;
  if (t.color) { ctx.fillStyle = t.color; ctx.fillRect(x, y, CELL, CELL); return; }
  if (t.file) { const rec = ensureTileImg(t); if (rec && rec.loaded) { ctx.drawImage(rec.img, x, y, CELL, CELL); return; } }
  if (t.role === 'wall') {
    ctx.fillStyle = '#3f434b'; ctx.fillRect(x + 2, y + 2, CELL - 4, CELL - 4);
    ctx.strokeStyle = '#565b64'; ctx.lineWidth = 2; ctx.strokeRect(x + 5, y + 5, CELL - 10, CELL - 10);
  } else if (t.role === 'obstacle') {
    ctx.fillStyle = '#7a5a3a'; roundRect(x + 4, y + 4, CELL - 8, CELL - 8, 5); ctx.fill();
    ctx.strokeStyle = '#5a4128'; ctx.lineWidth = 2; ctx.stroke();
  } else { ctx.fillStyle = '#20262f'; ctx.fillRect(x, y, CELL, CELL); }
}
// 畫圖片（可左右／上下翻轉）
function drawImageFlipped(img, x, y, w, h, fx, fy) {
  if (!fx && !fy) { ctx.drawImage(img, x, y, w, h); return; }
  ctx.save();
  ctx.translate(x + (fx ? w : 0), y + (fy ? h : 0));
  ctx.scale(fx ? -1 : 1, fy ? -1 : 1);
  ctx.drawImage(img, 0, 0, w, h);
  ctx.restore();
}
// 畫多格大圖
function drawStamp(s) {
  const t = tileById(s.id); if (!t) return;
  const x = OX + s.c * CELL + (s.ox || 0), y = OY + s.r * CELL + (s.oy || 0), w = tileW(t) * CELL, h = tileH(t) * CELL;
  if (t.color) { ctx.fillStyle = t.color; ctx.fillRect(x, y, w, h); return; }
  if (t.file) { const rec = ensureTileImg(t); if (rec && rec.loaded) { drawImageFlipped(rec.img, x, y, w, h, s.fx, s.fy); return; } }
  ctx.fillStyle = t.role === 'wall' ? '#3f434b' : (t.role === 'obstacle' ? '#7a5a3a' : '#2b3446');
  ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
  ctx.strokeStyle = '#8fd3ff'; ctx.lineWidth = 1; ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);
  ctx.fillStyle = '#c3ccd8'; ctx.font = '11px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(t.name, x + w / 2, y + h / 2);
}

// 基地碰撞以「每次擺放的 stamp」為單位保存；舊地圖沒有資料時沿用素材預設。
function baseSolidForStamp(s, t) {
  if (Array.isArray(s.baseSolid)) return s.baseSolid;
  const w = tileW(t), h = tileH(t);
  return clone(t.baseSolid || []).map(([dc, dr]) => [s.fx ? w - 1 - dc : dc, s.fy ? h - 1 - dr : dr]);
}

// ================= 畫布繪製 =================
let showGrid = true;    // 格線開關（可用工具列按鈕切換）
let showSolid = true;        // 不可穿透紅格的顯示開關（只影響顯示，設定本身不變）
let solidNudgeCell = null;   // 目前用「碰撞微調」選中的紅格（'c,r'）
function draw() {
  const m = curMap();
  const solid = new Set(m.solid), breakable = new Set(m.breakable);
  const coreSpots = new Set(m.coreSpots);

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
    if (showSolid && solid.has(key)) {
      const off = m.solidOffsets[key] || [0, 0];                 // 像素微調後的實際擋路範圍
      const sx2 = x + off[0], sy2 = y + off[1];
      ctx.fillStyle = 'rgba(200,50,50,.30)'; ctx.fillRect(sx2, sy2, CELL, CELL);
      ctx.strokeStyle = '#ff5b5b'; ctx.lineWidth = 2; ctx.strokeRect(sx2 + 2.5, sy2 + 2.5, CELL - 5, CELL - 5);
      if (off[0] || off[1]) {   // 有微調：用虛線標出原本的格子位置，方便對照
        ctx.strokeStyle = 'rgba(255,140,140,.45)'; ctx.lineWidth = 1; ctx.setLineDash([4, 3]);
        ctx.strokeRect(x + .5, y + .5, CELL - 1, CELL - 1); ctx.setLineDash([]);
      }
      if (solidNudgeCell === key) {   // 目前選中的格子
        ctx.strokeStyle = '#ffe14d'; ctx.lineWidth = 2; ctx.setLineDash([6, 3]);
        ctx.strokeRect(sx2 + 1, sy2 + 1, CELL - 2, CELL - 2); ctx.setLineDash([]);
      }
    }
    if (breakable.has(key)) {
      ctx.fillStyle = 'rgba(230,150,40,.26)'; ctx.fillRect(x, y, CELL, CELL);
      ctx.strokeStyle = '#ffb84d'; ctx.lineWidth = 2; ctx.setLineDash([5, 4]);
      ctx.strokeRect(x + 3, y + 3, CELL - 6, CELL - 6); ctx.setLineDash([]);
    }
    if (coreSpots.has(key)) {
      ctx.fillStyle = 'rgba(158,83,241,.38)'; ctx.fillRect(x, y, CELL, CELL);
      ctx.strokeStyle = '#dab5ff'; ctx.lineWidth = 2; ctx.strokeRect(x + 3, y + 3, CELL - 6, CELL - 6);
      ctx.fillStyle = '#fff'; ctx.font = '18px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('💠', x + CELL / 2, y + CELL / 2); ctx.textBaseline = 'alphabetic';
    }
    if (showGrid) { ctx.strokeStyle = 'rgba(255,255,255,.06)'; ctx.lineWidth = 1; ctx.strokeRect(x + .5, y + .5, CELL, CELL); }
  }
  ctx.fillStyle = '#dab5ff'; ctx.font = '13px sans-serif'; ctx.textAlign = 'left';
  ctx.fillText('💠 核心候選點 ' + m.coreSpots.length + ' 個／本局抽 ' + m.coreCount + ' 個', OX + 6, OY + 16);
  // 出入口記號（紫格＋🚪＋通往哪張地圖）
  for (const pt of (m.portals || [])) {
    const x = OX + pt.c * CELL, y = OY + pt.r * CELL;
    ctx.fillStyle = 'rgba(150,90,220,.45)'; ctx.fillRect(x, y, CELL, CELL);
    ctx.strokeStyle = '#b58cff'; ctx.lineWidth = 2; ctx.strokeRect(x + 2, y + 2, CELL - 4, CELL - 4);
    ctx.fillStyle = '#fff'; ctx.font = '16px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('🚪', x + CELL / 2, y + CELL / 2);
    const target = (maps.find(mm => mm.id === pt.to) || {}).name || '（目標已刪除）';
    ctx.font = 'bold 10px sans-serif'; ctx.textBaseline = 'top';
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,.85)'; ctx.strokeText('→' + target, x + CELL / 2, y + CELL + 1);
    ctx.fillStyle = '#d9c6ff'; ctx.fillText('→' + target, x + CELL / 2, y + CELL + 1);
  }
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  // 懸停：選到磚塊圖時先顯示 40% 半透明預覽（放置前看得到圖與位置），再加外框
  if (hoverCell) {
    const [c, r] = hoverCell;
    const sel = brush.mode === 'tile' ? tileById(brush.tile) : null;
    if (sel) {
      const big = isBig(sel), w = big ? tileW(sel) : 1, h = big ? tileH(sel) : 1;
      const fits = c < COLS && r < ROWS && c + w > 0 && r + h > 0;   // 允許超出邊緣（純外觀），只要有一格在地圖內
      // 半透明預覽圖
      ctx.save();
      ctx.globalAlpha = 0.4;
      if (big || brushFlip.fx || brushFlip.fy) drawStamp({ c, r, id: brush.tile, fx: brushFlip.fx, fy: brushFlip.fy });
      else drawTile(brush.tile, OX + c * CELL, OY + r * CELL);
      ctx.restore();
      // 外框（放不下時變紅）
      if (big) {
        ctx.strokeStyle = fits ? '#8fd3ff' : '#ff5b5b'; ctx.lineWidth = 2; ctx.setLineDash([6, 4]);
        ctx.strokeRect(OX + c * CELL + 1, OY + r * CELL + 1, w * CELL - 2, h * CELL - 2); ctx.setLineDash([]);
      } else {
        ctx.strokeStyle = '#8fd3ff'; ctx.lineWidth = 2; ctx.strokeRect(OX + c * CELL + 1, OY + r * CELL + 1, CELL - 2, CELL - 2);
      }
    } else {
      // 非貼圖工具（選取／不可穿透／清除等）維持單格外框
      ctx.strokeStyle = '#8fd3ff'; ctx.lineWidth = 2; ctx.strokeRect(OX + c * CELL + 1, OY + r * CELL + 1, CELL - 2, CELL - 2);
    }
  }
  // 選取高亮（黃色虛線框）
  for (const selected of selections) {
    let rx = null, ry = 0, rw = CELL, rh = CELL;
    if (selected.type === 'stamp') { const s = m.stamps[selected.index]; if (s) { const t = tileById(s.id) || {}; rx = OX + s.c * CELL + (s.ox || 0); ry = OY + s.r * CELL + (s.oy || 0); rw = tileW(t) * CELL; rh = tileH(t) * CELL; } }
    else { const [c, r] = selected.key.split(',').map(Number); rx = OX + c * CELL; ry = OY + r * CELL; }
    if (rx != null) { ctx.strokeStyle = '#ffe14d'; ctx.lineWidth = 3; ctx.setLineDash([7, 4]); ctx.strokeRect(rx + 1.5, ry + 1.5, rw - 3, rh - 3); ctx.setLineDash([]); }
  }
  // 選到基地時，把目前的碰撞格直接疊在基地圖上，所見即所得。
  if (selections.length === 1 && selections[0].type === 'stamp') {
    const s = m.stamps[selections[0].index], t = s && tileById(s.id);
    if (s && t && t.baseHp) {
      for (const [dc, dr] of baseSolidForStamp(s, t)) {
        const x = OX + (s.c + dc) * CELL + (s.ox || 0), y = OY + (s.r + dr) * CELL + (s.oy || 0);
        ctx.fillStyle = 'rgba(235,55,55,.34)'; ctx.fillRect(x, y, CELL, CELL);
        ctx.strokeStyle = '#ff6b6b'; ctx.lineWidth = 2; ctx.strokeRect(x + 2, y + 2, CELL - 4, CELL - 4);
      }
      const depth = Number.isFinite(s.baseDepth) ? s.baseDepth : (Number.isFinite(t.baseDepth) ? t.baseDepth : Math.max(1, tileH(t) - 2));
      const x = OX + s.c * CELL + (s.ox || 0), y = OY + s.r * CELL + (s.oy || 0) + depth * CELL;
      ctx.strokeStyle = '#55d9ff'; ctx.lineWidth = 3; ctx.setLineDash([9, 5]);
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + tileW(t) * CELL, y); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#55d9ff'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
      ctx.fillText('深度線 ' + depth, x + 5, y - 4);
    } else if (s && t && !t.flat && (s.layer || 'top') !== 'top' && (tileH(t) >= 2 || /^object\d*$/.test(s.layer || '') || s.layer === 'overlay')) {
      const depth = Number.isFinite(s.sortDepth) ? s.sortDepth : tileH(t);
      const x = OX + s.c * CELL + (s.ox || 0), y = OY + s.r * CELL + (s.oy || 0) + depth * CELL;
      ctx.strokeStyle = '#55d9ff'; ctx.lineWidth = 3; ctx.setLineDash([9, 5]);
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + tileW(t) * CELL, y); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#55d9ff'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
      ctx.fillText('人物遮擋線 ' + depth, x + 5, y - 4);
    }
  }
}

// ================= 可翻轉圖片放置 / 查詢 =================
function placeStamp(c, r, t) {
  const m = curMap(), w = tileW(t), h = tileH(t);
  if (c >= COLS || r >= ROWS || c + w <= 0 || r + h <= 0) { setStatus('放不下：整張圖都在地圖外', '#ff8f8f'); return; }   // 允許超出邊緣（大圖純外觀），只要有一格落在地圖內就能放
  // 只移除「同一圖層」上重疊的大圖（不同層可疊放）
  m.stamps = m.stamps.filter(s => {
    if ((s.layer || 'top') !== activeLayer) return true;
    const st = tileById(s.id) || {}, sw = tileW(st), sh = tileH(st);
    const overlap = !(c + w <= s.c || s.c + sw <= c || r + h <= s.r || s.r + sh <= r);
    return !overlap;
  });
  // 1×1 小圖翻轉後改用 stamp 儲存，先移除同格同層的普通小圖。
  if (w === 1 && h === 1) delete m.layers[activeLayer][c + ',' + r];
  const st = { id: t.id, c, r, layer: activeLayer };
  if (brushFlip.fx) st.fx = true;
  if (brushFlip.fy) st.fy = true;
  if (t.baseHp) {
    st.baseHp = t.baseHp;
    const defaultDepth = Number.isFinite(t.baseDepth) ? t.baseDepth : Math.max(1, h - 2);
    st.baseDepth = brushFlip.fy ? h - defaultDepth : defaultDepth;
    st.baseSolid = clone(t.baseSolid || []).map(([dc, dr]) => [brushFlip.fx ? w - 1 - dc : dc, brushFlip.fy ? h - 1 - dr : dr]);
  }
  m.stamps.push(st);
  checkResult = null; saveMaps(); draw();
}
function stampIndexAt(m, c, r) {
  for (let i = m.stamps.length - 1; i >= 0; i--) {
    const s = m.stamps[i];
    if (hiddenLayers.has(s.layer || 'top') || isLockedLayer(s.layer)) continue;   // 隱藏或鎖定的圖層：選不到／擦不到
    const t = tileById(s.id) || {};
    if (c >= s.c && c < s.c + tileW(t) && r >= s.r && r < s.r + tileH(t)) return i;
  }
  return -1;
}

// 吸管：偵測某格「最上層可見」的圖片 id（隱藏的圖層跳過）
function pickAt(m, c, r) {
  for (let i = LAYERS.length - 1; i >= 0; i--) {
    const lid = LAYERS[i].id;
    if (hiddenLayers.has(lid)) continue;
    for (let k = m.stamps.length - 1; k >= 0; k--) {
      const s = m.stamps[k]; if ((s.layer || 'top') !== lid) continue;
      const t = tileById(s.id) || {};
      if (c >= s.c && c < s.c + tileW(t) && r >= s.r && r < s.r + tileH(t)) return s.id;
    }
    const id = m.layers[lid] && m.layers[lid][c + ',' + r];
    if (id) return id;
  }
  return null;
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
      else for (let i = LAYERS.length - 1; i >= 0; i--) { const id = LAYERS[i].id; if (!hiddenLayers.has(id) && !isLockedLayer(id) && m.layers[id][key]) { picked = { type: 'tile', layer: id, key }; break; } }
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
  if (brush.mode === 'pick') {
    if (isDown) {
      const id = pickAt(m, c, r);
      if (id) {
        pickResult = id; const t = tileById(id) || {};
        if (tempTool === 'pick') { brush = { mode: 'pick', tile: id }; renderPalette(); setStatus('已吸取「' + (t.name || id) + '」（放開 Alt 開始畫）', '#7ee0c0'); }
        else { selectTile(id); setStatus('已吸取「' + (t.name || id) + '」，筆刷已切換', '#7ee0c0'); }
      } else setStatus('這格沒有圖片可吸取', '#ffd24a');
    }
    return;
  }
  checkResult = null;
  if (brush.mode === 'tile') {
    if (hiddenLayers.has(activeLayer)) { if (isDown) setStatus('「' + layerName(activeLayer) + '」被隱藏中，請先打開眼睛才能貼圖', '#ffd24a'); return; }
    if (isLockedLayer(activeLayer)) { if (isDown) setStatus('「' + layerName(activeLayer) + '」已鎖定，請先按 🔒 解鎖才能貼圖', '#ffd24a'); return; }
    const t = tileById(brush.tile); if (!t) return;
    if (isBig(t)) { if (isDown) placeStamp(c, r, t); return; }   // 大圖：只在按下時放一張
    if (brushFlip.fx || brushFlip.fy) { placeStamp(c, r, t); return; }   // 翻轉小圖：以 1×1 stamp 保存方向
    // 普通小圖覆蓋同格同層的翻轉小圖，避免兩張疊在一起。
    m.stamps = m.stamps.filter(s => !((s.layer || 'top') === activeLayer && s.c === c && s.r === r && tileW(tileById(s.id) || {}) === 1 && tileH(tileById(s.id) || {}) === 1));
    m.layers[activeLayer][key] = brush.tile;                      // 小圖：貼到目前圖層
  } else if (brush.mode === 'solid') {
    if (m.coreSpots.includes(key)) { setStatus('核心候選點不能設不可穿透，請先取消候選點', '#ff8f8f'); return; }
    removeFrom(m.breakable, key); toggle(m.solid, key);
    if (m.solid.indexOf(key) < 0) { delete m.solidOffsets[key]; if (solidNudgeCell === key) solidNudgeCell = null; }   // 取消紅格時一併清掉微調
  } else if (brush.mode === 'solidnudge') {
    if (!isDown) return;
    if (m.solid.indexOf(key) < 0) { solidNudgeCell = null; setStatus('這格不是「不可穿透」，先用 🧱 畫上紅格再微調', '#ffd24a'); draw(); return; }
    solidNudgeCell = key;
    const off = m.solidOffsets[key] || [0, 0];
    setStatus('已選這格碰撞範圍（目前偏移 ' + off[0] + ', ' + off[1] + '）：方向鍵移動、Shift 移多一點、Delete 歸零', '#ffd479');
    draw();
    return;
  } else if (brush.mode === 'breakable') {
    if (m.coreSpots.includes(key)) { setStatus('核心候選點不能設可破壞，請先取消候選點', '#ff8f8f'); return; }
    removeFrom(m.solid, key); toggle(m.breakable, key);
  } else if (brush.mode === 'core') {
    if (!isDown) return;
    if (!m.coreSpots.includes(key) && (m.solid.includes(key) || m.breakable.includes(key))) {
      setStatus('請選空格作為核心候選點', '#ff8f8f'); return;
    }
    toggle(m.coreSpots, key);
  } else if (brush.mode === 'portal') {
    if (!isDown) return;   // 只在按下時處理，避免拖曳一直跳視窗
    const pi = m.portals.findIndex(p => p.c === c && p.r === r);
    if (pi >= 0) { m.portals.splice(pi, 1); saveMaps(); draw(); setStatus('已移除出入口', '#ffd24a'); return; }
    const others = maps.filter(x => x.id !== m.id);
    if (!others.length) { setStatus('只有一張地圖，先新增另一張才能設出入口', '#ff8f8f'); return; }
    const listTxt = others.map((x, idx) => (idx + 1) + ') ' + x.name).join('\n');
    const ans = prompt('這個出入口要通到哪一張地圖？輸入編號：\n' + listTxt, '1');
    if (ans === null) return;
    const n = parseInt(ans, 10);
    if (!(n >= 1 && n <= others.length)) { setStatus('編號不正確', '#ff8f8f'); return; }
    m.portals.push({ c, r, to: others[n - 1].id });
    setStatus('已設出入口 → ' + others[n - 1].name, '#7ee0c0');
  } else if (brush.mode === 'erase') {
    // 由上往下擦：大圖 → 最上面有圖的那層
    const si = stampIndexAt(m, c, r);
    if (si >= 0) m.stamps.splice(si, 1);
    else for (let i = LAYERS.length - 1; i >= 0; i--) { const id = LAYERS[i].id; if (!hiddenLayers.has(id) && !isLockedLayer(id) && m.layers[id][key]) { delete m.layers[id][key]; break; } }
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
  if (selections.some(sel => isLockedLayer(selectionLayer(sel)))) {   // 鎖定圖層上的物件不能拖
    selectionDrag = null;
    setStatus('鎖定的圖層不能搬動物件（先按 🔒 解鎖）', '#ffd24a');
    return;
  }
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
  // 允許拖出地圖邊緣（純外觀），只要選取範圍還有一格留在地圖內
  const dc = Math.max(1 - d.maxC, Math.min(COLS - 1 - d.minC, c - d.startC));
  const dr = Math.max(1 - d.maxR, Math.min(ROWS - 1 - d.minR, r - d.startR));
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
  // 顯示順序反轉：上層在最上、地板在最下（不改 LAYERS 本身的疊圖 z 順序）
  [...LAYERS].reverse().forEach(l => {
    const group = document.createElement('span'); group.className = 'layer-group';
    const b = document.createElement('button'); b.className = 'layer' + (l.id === activeLayer ? ' sel' : ''); b.textContent = l.name; b.dataset.layer = l.id;
    b.addEventListener('click', () => { activeLayer = l.id; updateLayerUI(); setStatus('目前在「' + l.name + '」上編輯', '#b39ddb'); });
    const lock = document.createElement('button'); lock.className = 'layer-lock'; lock.dataset.layer = l.id;
    lock.addEventListener('click', () => {
      if (lockedLayers.has(l.id)) lockedLayers.delete(l.id);
      else {
        lockedLayers.add(l.id);
        const kept = selections.filter(sel => selectionLayer(sel) !== l.id);   // 鎖住的圖層不留在選取裡
        if (kept.length !== selections.length) { selections = kept; selection = selections[selections.length - 1] || null; refreshSelPanel(); }
      }
      updateLayerUI(); draw();
      setStatus((lockedLayers.has(l.id) ? '已鎖定「' + l.name + '」：看得到，但不能貼圖／擦除／選取' : '已解鎖「' + l.name + '」'), '#ffd479');
    });
    const eye = document.createElement('button'); eye.className = 'layer-eye'; eye.dataset.layer = l.id;
    eye.addEventListener('click', () => {
      if (hiddenLayers.has(l.id)) hiddenLayers.delete(l.id); else hiddenLayers.add(l.id);
      updateLayerUI(); draw();
      setStatus((hiddenLayers.has(l.id) ? '已隱藏「' : '已顯示「') + l.name + '」', '#8fd3ff');
    });
    group.append(b, lock, eye); layerBtnsEl.appendChild(group);
  });
  updateLayerUI();
}
function updateLayerUI() {
  document.querySelectorAll('.layer').forEach(b => b.classList.toggle('sel', b.dataset.layer === activeLayer));
  document.querySelectorAll('.layer-lock').forEach(btn => {
    const locked = lockedLayers.has(btn.dataset.layer);
    const layer = LAYERS.find(l => l.id === btn.dataset.layer);
    btn.textContent = locked ? '🔒' : '🔓';
    btn.classList.toggle('on', locked);
    btn.setAttribute('aria-pressed', String(locked));
    const label = (locked ? '解鎖' : '鎖定') + (layer ? layer.name : '圖層');
    btn.setAttribute('aria-label', label);
    btn.title = locked ? label + '（鎖定中：看得到，但不能編輯）' : label + '（鎖定後看得到，但不能貼圖／擦除／選取）';
  });
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
const PALETTE_CATEGORIES = [
  { id: 'all', name: '全部' },
  { id: 'color', name: '色塊' },
  { id: 'map', name: '地圖建材' },
  { id: 'decor', name: '裝飾物' },
  { id: 'obstacle', name: '障礙物' },
  { id: 'eoc', name: '應變中心' },
  { id: 'dorm', name: '宿舍' },
  { id: 'damaged', name: '破損建築' },
  { id: 'field', name: '野戰基地' },
  { id: 'scene', name: '場景物件' },
  { id: 'restaurant', name: '餐廳' },
  { id: 'hospital', name: '醫院病房' },
  { id: 'containment', name: '收容觀察室' },
  { id: 'mrt', name: '捷運車站' },
  { id: 'cvs', name: '便利商店' },
  { id: 'other', name: '其他' },
];
let activePaletteCategory = 'all';
function tileCategory(t) {
  const file = String(t.file || '').replace(/\\/g, '/').toLowerCase();
  if (t.systemColor) return 'color';
  if (t.builtin || file.includes('/background/') || file.includes('/01-station-hall/')) return 'map';
  if (file.includes('/應變中心/')) return 'eoc';
  if (file.includes('/宿舍/')) return 'dorm';
  if (file.includes('/破損建築/')) return 'damaged';
  if (file.includes('/field-camp/')) return 'field';
  if (file.includes('/scene-props/')) return 'scene';
  if (String(t.id || '').startsWith('tile_restaurant_') || file.includes('/餐廳/')) return 'restaurant';
  if (String(t.id || '').startsWith('tile_hospital_') || file.includes('/醫院病房/')) return 'hospital';
  if (String(t.id || '').startsWith('tile_containment_') || file.includes('/收容觀察室/')) return 'containment';
  if (String(t.id || '').startsWith('tile_mrt_') || file.includes('/捷運車站/')) return 'mrt';
  if (String(t.id || '').startsWith('tile_cvs_') || file.includes('/convenience-store/')) return 'cvs';
  if (file.includes('/item-decorate/')) return 'decor';
  if (file.includes('/item-obstacle/')) return 'obstacle';
  return 'other';
}
function renderPalette() {
  paletteEl.innerHTML = '';
  // 舊地圖仍可讀取內建佔位格，但不再提供灰牆與棕色障礙作為新素材。
  const allTiles = palette().filter(t => t.id !== 'wall' && t.id !== 'obstacle');
  const tabs = document.createElement('div'); tabs.className = 'palette-tabs';
  PALETTE_CATEGORIES.forEach(category => {
    const count = category.id === 'all' ? allTiles.length : allTiles.filter(t => tileCategory(t) === category.id).length;
    const tab = document.createElement('button');
    tab.type = 'button'; tab.className = 'palette-tab' + (activePaletteCategory === category.id ? ' sel' : '');
    tab.innerHTML = category.name + '<span class="count">' + count + '</span>';
    tab.addEventListener('click', () => { activePaletteCategory = category.id; renderPalette(); });
    tabs.appendChild(tab);
  });
  paletteEl.appendChild(tabs);

  const grid = document.createElement('div'); grid.className = 'palette-grid';
  const visibleTiles = activePaletteCategory === 'all' ? allTiles : allTiles.filter(t => tileCategory(t) === activePaletteCategory);
  visibleTiles.forEach(t => {
    const b = document.createElement('div'); b.className = 'tile' + (brush.mode === 'tile' && brush.tile === t.id ? ' sel' : '');
    let thumb;
    const rec = t.file ? ensureTileImg(t) : null;
    if (t.file) b.classList.add('has-image');
    if (t.file && rec && rec.loaded) thumb = '<img class="thumb" src="' + t.file + '" alt="完整圖片預覽">';
    else if (t.color) thumb = '<span class="thumb swatch" style="background:' + t.color + '"></span>';
    else thumb = '<span class="thumb swatch ' + t.role + '"></span>';
    const sizeTxt = t.systemColor ? (' ' + tilePixelW(t) + '×' + tilePixelH(t) + ' px') : (isBig(t) ? (' ' + tileW(t) + '×' + tileH(t)) : '');
    const isObstacleArt = String(t.file || '').replace(/\\/g, '/').includes('/item-obstacle/');
    const typeTxt = isObstacleArt
      ? (t.id === 'tile_obstacle_camping_lights' ? '可擋路・可破壞・小範圍發光' : String(t.id).startsWith('tile_ore_') ? '可擋路・用地雷炸開' : '可擋路・可破壞')
      : (t.systemColor ? '系統色塊' : (t.builtin ? roleLabel(t.role) : '圖片'));
    b.innerHTML = thumb + '<span class="tname">' + t.name + '</span><small>' + typeTxt + sizeTxt + '</small>';
    b.addEventListener('click', () => selectTile(t.id));
    if (!t.builtin) {
      const del = document.createElement('button'); del.className = 'del'; del.textContent = '✕'; del.title = '刪除這塊磚塊';
      del.addEventListener('click', ev => { ev.stopPropagation(); deleteTile(t.id); });
      b.appendChild(del);
    }
    grid.appendChild(b);
  });
  if (!visibleTiles.length) grid.innerHTML = '<div class="palette-empty">這個分類目前沒有素材</div>';
  paletteEl.appendChild(grid);
  updateFlatUI();
}
// ---- 素材屬性列：選到自訂磚塊時出現，可改「寬×高格數」與「平貼地面」----
const tilePropsRow = document.getElementById('tilePropsRow');
const tileFlatCb = document.getElementById('tileFlat');
const tileWInput = document.getElementById('tileW');
const tileHInput = document.getElementById('tileH');
const tileWUnit = document.getElementById('tileWUnit');
const tileHUnit = document.getElementById('tileHUnit');
const tileColorLabel = document.getElementById('tileColorLabel');
const tileColorInput = document.getElementById('tileColor');
const brushTile = () => (brush.mode === 'tile' ? tileById(brush.tile) : null);
function updateFlatUI() {   // 名稱沿用；現在也負責寬高欄位
  const t = brushTile();
  if (t && !t.builtin) {
    tileFlatCb.checked = !!t.flat;
    if (t.systemColor) {
      tileWInput.value = tilePixelW(t); tileHInput.value = tilePixelH(t);
      tileWInput.min = tileHInput.min = 20; tileWInput.max = tileHInput.max = 2000;
      tileWInput.step = tileHInput.step = 1; tileWUnit.textContent = tileHUnit.textContent = 'px';
      tileColorInput.value = t.color; tileColorLabel.classList.remove('hidden');
    } else {
      tileWInput.value = tileW(t); tileHInput.value = tileH(t);
      tileWInput.min = tileHInput.min = 1; tileWInput.max = tileHInput.max = 20;
      tileWInput.step = tileHInput.step = 1; tileWUnit.textContent = tileHUnit.textContent = '格';
      tileColorLabel.classList.add('hidden');
    }
    tilePropsRow.classList.remove('hidden');
  } else tilePropsRow.classList.add('hidden');
}
if (tileFlatCb) tileFlatCb.addEventListener('change', () => {
  const t = brushTile(); if (!t || t.builtin) return;
  if (tileFlatCb.checked) t.flat = true; else delete t.flat;
  saveTiles(); draw();
  setStatus('「' + t.name + '」' + (t.flat ? '已設為平貼地面（不遮角色）' : '已設為立體物（會遮角色）'), '#8fd3ff');
});
function setTileSize() {
  const t = brushTile(); if (!t || t.builtin) return;
  const isColor = !!t.systemColor;
  const min = isColor ? 20 : 1, max = isColor ? 2000 : 20;
  const shownW = Math.max(min, Math.min(max, parseInt(tileWInput.value, 10) || (isColor ? tilePixelW(t) : tileW(t))));
  const shownH = Math.max(min, Math.min(max, parseInt(tileHInput.value, 10) || (isColor ? tilePixelH(t) : tileH(t))));
  const w = isColor ? shownW / CELL : shownW, h = isColor ? shownH / CELL : shownH;
  tileWInput.value = shownW; tileHInput.value = shownH;
  if (t.w === w && t.h === h) return;
  t.w = w; t.h = h;
  saveTiles(); renderPalette(); draw();
  setStatus('「' + t.name + '」尺寸改為 ' + shownW + '×' + shownH + (isColor ? ' px' : ' 格'), '#7ee0c0');
}
if (tileWInput) tileWInput.addEventListener('change', setTileSize);
if (tileHInput) tileHInput.addEventListener('change', setTileSize);
if (tileColorInput) tileColorInput.addEventListener('input', () => {
  const t = brushTile(); if (!t || !t.systemColor) return;
  t.color = tileColorInput.value; saveTiles(); renderPalette(); draw();
});
function selectTile(id) {
  const selectedTile = tileById(id);
  if (activePaletteCategory !== 'all' && selectedTile && tileCategory(selectedTile) !== activePaletteCategory) {
    activePaletteCategory = tileCategory(selectedTile);
  }
  brush = { mode: 'tile', tile: id }; clearSelection(); updateToolUI(); renderPalette();
}
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

// Alt=臨時吸管、Ctrl=臨時選取；放開還原（吸到圖則保留新筆刷）
function enterTemp(mode) {
  if (tempTool || brush.mode === mode) return;
  tempTool = mode; savedBrush = { mode: brush.mode, tile: brush.tile }; pickResult = null;
  brush = { mode: mode, tile: brush.tile };
  updateToolUI(); renderPalette();
  setStatus(mode === 'pick' ? '吸管（放開 Alt 還原）' : '選取（放開 Ctrl 還原）', '#8fd3ff');
}
function exitTemp() {
  if (!tempTool) return;
  const keepPick = tempTool === 'pick' && pickResult, picked = pickResult;   // 吸到圖：放開後用該圖進入繪製
  tempTool = null;
  if (keepPick) brush = { mode: 'tile', tile: picked };
  else brush = savedBrush || brush;
  savedBrush = null; pickResult = null;
  updateToolUI(); renderPalette();
}

// ================= 選取物件・改圖層 =================
function selectionId(sel) { return sel.type === 'stamp' ? 'stamp:' + sel.index : 'tile:' + sel.layer + ':' + sel.key; }
function clearSelection() { selection = null; selections = []; refreshSelPanel(); draw(); }
function selLayerId() {
  if (!selections.length) return null;
  const layers = selections.map(sel => sel.type === 'stamp' ? ((curMap().stamps[sel.index] || {}).layer || 'top') : sel.layer);
  return layers.every(id => id === layers[0]) ? layers[0] : null;
}
function selectedBaseStamp() {
  if (selections.length !== 1 || selections[0].type !== 'stamp') return null;
  const s = curMap().stamps[selections[0].index];
  const t = s && tileById(s.id);
  return s && t && t.baseHp ? { s, t } : null;
}
function selectedDepthStamp() {
  if (selections.length !== 1 || selections[0].type !== 'stamp') return null;
  const s = curMap().stamps[selections[0].index], t = s && tileById(s.id);
  if (!s || !t || t.baseHp || t.flat || (s.layer || 'top') === 'top') return null;
  return tileH(t) >= 2 || /^object\d*$/.test(s.layer || '') || s.layer === 'overlay' ? { s, t } : null;
}
function refreshBaseCollisionPanel() {
  const panel = document.getElementById('baseCollisionPanel');
  const grid = document.getElementById('baseCollisionGrid');
  const picked = selectedBaseStamp();
  if (!picked) { panel.classList.add('hidden'); grid.innerHTML = ''; return; }
  const { s, t } = picked, w = tileW(t), h = tileH(t);
  const solid = baseSolidForStamp(s, t), blocked = new Set(solid.map(([c, r]) => c + ',' + r));
  panel.classList.remove('hidden');
  document.getElementById('baseHpInput').value = s.baseHp || t.baseHp || 2000;
  const depthInput = document.getElementById('baseDepthInput');
  depthInput.max = h;
  depthInput.value = Number.isFinite(s.baseDepth) ? s.baseDepth : (Number.isFinite(t.baseDepth) ? t.baseDepth : Math.max(1, h - 2));
  grid.style.gridTemplateColumns = 'repeat(' + w + ', 23px)';
  grid.innerHTML = '';
  for (let r = 0; r < h; r++) for (let c = 0; c < w; c++) {
    const key = c + ',' + r, b = document.createElement('button');
    b.type = 'button'; b.className = 'base-collision-cell' + (blocked.has(key) ? ' blocked' : '');
    b.title = blocked.has(key) ? '阻擋／可受攻擊（點擊改為可走）' : '可走動（點擊改為阻擋）';
    b.addEventListener('click', () => {
      pushUndo();
      const cells = baseSolidForStamp(s, t).map(cell => cell.slice());
      const index = cells.findIndex(([dc, dr]) => dc === c && dr === r);
      if (index >= 0) cells.splice(index, 1); else cells.push([c, r]);
      s.baseSolid = cells;
      saveMaps(); draw(); refreshBaseCollisionPanel();
      setStatus(index >= 0 ? '已改為可走動格' : '已改為基地碰撞格', index >= 0 ? '#7ee0c0' : '#ff8f8f');
    });
    grid.appendChild(b);
  }
}
// ---- 門：選到一扇門時，可以設定手動門／自動門 ----
function selectedDoorStamp() {
  if (typeof DOOR_TILES === 'undefined' || selections.length !== 1 || selections[0].type !== 'stamp') return null;
  const s = curMap().stamps[selections[0].index];
  return s && DOOR_TILES[s.id] ? s : null;
}
function refreshDoorControl() {
  const box = document.getElementById('selDoorControl'), select = document.getElementById('selDoorMode');
  const s = selectedDoorStamp();
  box.classList.toggle('hidden', !s);
  if (!s) return;
  if (!select.options.length) for (const [value, label] of Object.entries(DOOR_MODES)) {
    const o = document.createElement('option'); o.value = value; o.textContent = label; select.appendChild(o);
  }
  select.value = s.doorMode === 'auto' ? 'auto' : 'manual';
}
document.getElementById('selDoorMode').addEventListener('change', e => {
  const s = selectedDoorStamp(); if (!s) return;
  pushUndo();
  if (e.target.value === 'auto') s.doorMode = 'auto'; else delete s.doorMode;   // 手動門是預設，不另外存
  saveMaps(); draw();
  setStatus(e.target.value === 'auto' ? '已設為自動門：異質核心醒來時自動打開' : '已設為手動門：玩家按 E 開關', '#7ee0c0');
});
function refreshSelPanel() {
  const layerSelect = document.getElementById('selLayer');
  const depthInput = document.getElementById('selDepthInput');
  const depthAuto = document.getElementById('selDepthAuto');
  const m = curMap();
  selections = selections.filter(sel => sel.type === 'stamp' ? !!m.stamps[sel.index] : !!(m.layers[sel.layer] && m.layers[sel.layer][sel.key] !== undefined));
  selection = selections.length ? selections[selections.length - 1] : null;
  const hasSelection = !!selection;
  layerSelect.disabled = !hasSelection;
  ['selUp', 'selDown', 'selFlipX', 'selFlipY', 'selReset', 'selDelete', 'selClear'].forEach(id => {
    document.getElementById(id).disabled = !hasSelection;
  });
  depthInput.disabled = true;
  depthInput.value = '';
  depthAuto.disabled = true;
  if (!selection) {
    refreshDoorControl();
    document.getElementById('selName').textContent = '無';
    layerSelect.innerHTML = '<option value="">選取物件後設定</option>';
    refreshBaseCollisionPanel();
    return;
  }
  if (selections.length > 1) {
    refreshDoorControl();
    document.getElementById('selName').textContent = selections.length + ' 個物件';
    layerSelect.innerHTML = '<option value="">選擇目標圖層</option>';
    LAYERS.forEach(l => { const o = document.createElement('option'); o.value = l.id; o.textContent = l.name; layerSelect.appendChild(o); });
    refreshBaseCollisionPanel(); return;
  }
  let name, curLayer;
  if (selection.type === 'stamp') {
    const s = m.stamps[selection.index]; if (!s) { selections = []; selection = null; refreshSelPanel(); return; }
    const t = tileById(s.id) || {};
    const size = t.systemColor ? (tilePixelW(t) + '×' + tilePixelH(t) + ' px') : (tileW(t) + '×' + tileH(t) + ' 格');
    name = (t.name || '大圖') + '（' + size + '）'; curLayer = s.layer || 'top';
  } else {
    const id = m.layers[selection.layer] ? m.layers[selection.layer][selection.key] : undefined;
    if (id === undefined) { selections = []; selection = null; refreshSelPanel(); return; }
    const t = tileById(id) || {}; name = (t.name || '圖') + '（小圖）'; curLayer = selection.layer;
  }
  document.getElementById('selName').textContent = name;
  layerSelect.innerHTML = '';
  LAYERS.forEach(l => { const o = document.createElement('option'); o.value = l.id; o.textContent = l.name; if (l.id === curLayer) o.selected = true; layerSelect.appendChild(o); });
  refreshDoorControl();
  const depthStamp = selectedDepthStamp();
  if (depthStamp) {
    depthInput.max = tileH(depthStamp.t);
    depthInput.value = Number.isFinite(depthStamp.s.sortDepth) ? depthStamp.s.sortDepth : tileH(depthStamp.t);
    depthInput.disabled = false;
    depthAuto.disabled = false;
  }
  refreshBaseCollisionPanel();
}
function moveSelectionToLayer(newLayerId) {
  if (!selections.length || !newLayerId) return;
  if (isLockedLayer(newLayerId)) { setStatus('「' + layerName(newLayerId) + '」已鎖定，不能把物件移過去（先按 🔒 解鎖）', '#ffd24a'); refreshSelPanel(); return; }
  if (dropLockedSelections('搬移')) return;
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
  if (!selections.length) return;
  if (dropLockedSelections('刪除')) return;
  pushUndo(); const m = curMap(), count = selections.length;
  selections.filter(sel => sel.type === 'tile').forEach(sel => delete m.layers[sel.layer][sel.key]);
  selections.filter(sel => sel.type === 'stamp').map(sel => sel.index).sort((a, b) => b - a).forEach(index => { if (m.stamps[index]) m.stamps.splice(index, 1); });
  selection = null; selections = []; saveMaps(); draw(); refreshSelPanel(); setStatus('已刪除 ' + count + ' 個選取物件', '#ffd24a');
}
document.getElementById('selLayer').addEventListener('change', e => moveSelectionToLayer(e.target.value));
document.getElementById('selDepthInput').addEventListener('change', e => {
  const picked = selectedDepthStamp(); if (!picked) return;
  const value = Number(e.target.value);
  if (!Number.isFinite(value)) { refreshSelPanel(); return; }
  const next = Math.max(0, Math.min(tileH(picked.t), value));
  pushUndo(); picked.s.sortDepth = next;
  saveMaps(); draw(); refreshSelPanel();
  setStatus('人物遮擋線設在圖片頂端往下 ' + next + ' 格', '#55d9ff');
});
document.getElementById('selDepthAuto').addEventListener('click', () => {
  const picked = selectedDepthStamp(); if (!picked || !Number.isFinite(picked.s.sortDepth)) return;
  pushUndo(); delete picked.s.sortDepth;
  saveMaps(); draw(); refreshSelPanel();
  setStatus('已恢復自動深度', '#7ee0c0');
});
document.getElementById('selUp').addEventListener('click', () => moveSelBy(1));
document.getElementById('selDown').addEventListener('click', () => moveSelBy(-1));
document.getElementById('selDelete').addEventListener('click', deleteSelection);
document.getElementById('selClear').addEventListener('click', clearSelection);
document.getElementById('baseHpInput').addEventListener('change', e => {
  const picked = selectedBaseStamp(); if (!picked) return;
  pushUndo(); picked.s.baseHp = Math.max(1, parseInt(e.target.value, 10) || picked.t.baseHp || 2000);
  saveMaps(); refreshBaseCollisionPanel(); setStatus('基地 HP 已改為 ' + picked.s.baseHp, '#7ee0c0');
});
document.getElementById('baseDepthInput').addEventListener('change', e => {
  const picked = selectedBaseStamp(); if (!picked) return;
  const h = tileH(picked.t), next = Math.max(0, Math.min(h, parseInt(e.target.value, 10) || 0));
  pushUndo(); picked.s.baseDepth = next;
  saveMaps(); draw(); refreshBaseCollisionPanel();
  setStatus('基地深度線已設在第 ' + next + ' 格', '#55d9ff');
});
document.getElementById('baseCollisionReset').addEventListener('click', () => {
  const picked = selectedBaseStamp(); if (!picked) return;
  const { s, t } = picked, w = tileW(t), h = tileH(t);
  pushUndo();
  s.baseHp = t.baseHp || 2000;
  const defaultDepth = Number.isFinite(t.baseDepth) ? t.baseDepth : Math.max(1, h - 2);
  s.baseDepth = s.fy ? h - defaultDepth : defaultDepth;
  s.baseSolid = clone(t.baseSolid || []).map(([dc, dr]) => [s.fx ? w - 1 - dc : dc, s.fy ? h - 1 - dr : dr]);
  saveMaps(); draw(); refreshBaseCollisionPanel(); setStatus('基地碰撞、HP 與深度線已恢復預設', '#7ee0c0');
});

// ================= 翻轉（大小圖皆可）=================
function updateFlipUI() {
  const bx = document.getElementById('flipX'), by = document.getElementById('flipY');
  if (bx) bx.classList.toggle('on', brushFlip.fx);
  if (by) by.classList.toggle('on', brushFlip.fy);
}
function toggleBrushFlip(axis) {
  if (axis === 'x') brushFlip.fx = !brushFlip.fx; else brushFlip.fy = !brushFlip.fy;
  updateFlipUI(); draw();
  setStatus('筆刷' + (axis === 'x' ? '左右' : '上下') + '翻：' + ((axis === 'x' ? brushFlip.fx : brushFlip.fy) ? '開' : '關') + '（大小圖皆可）', '#b39ddb');
}
// 選取裡若有鎖定圖層的物件就先剔除；全部都被鎖住時回傳 true（呼叫端直接放棄這次操作）
function dropLockedSelections(what) {
  const kept = selections.filter(sel => !isLockedLayer(selectionLayer(sel)));
  if (kept.length === selections.length) return false;
  const removed = selections.length - kept.length;
  selections = kept; selection = selections[selections.length - 1] || null;
  refreshSelPanel(); draw();
  setStatus('有 ' + removed + ' 個物件在鎖定的圖層上，不能' + what + '（先按 🔒 解鎖）', '#ffd24a');
  return !selections.length;
}
function flipSelection(axis) {
  if (!selections.length) { setStatus('請先選取要翻轉的圖片', '#ffd24a'); return; }
  if (dropLockedSelections('翻轉')) return;
  pushUndo(); const m = curMap();
  selections = selections.map(sel => {
    if (sel.type === 'stamp') {
      const s = m.stamps[sel.index];
      if (s) {
        const t = tileById(s.id) || {}, w = tileW(t), h = tileH(t);
        if (t.baseHp) {
          const cells = baseSolidForStamp(s, t);
          s.baseSolid = cells.map(([dc, dr]) => axis === 'x' ? [w - 1 - dc, dr] : [dc, h - 1 - dr]);
          if (axis === 'y') {
            const depth = Number.isFinite(s.baseDepth) ? s.baseDepth : (Number.isFinite(t.baseDepth) ? t.baseDepth : Math.max(1, h - 2));
            s.baseDepth = h - depth;
          }
        }
        if (axis === 'x') s.fx = !s.fx; else s.fy = !s.fy;
      }
      return sel;
    }
    const id = m.layers[sel.layer] && m.layers[sel.layer][sel.key];
    if (!id) return sel;
    const [c, r] = sel.key.split(',').map(Number);
    delete m.layers[sel.layer][sel.key];
    const stamp = { id, c, r, layer: sel.layer };
    if (axis === 'x') stamp.fx = true; else stamp.fy = true;
    m.stamps.push(stamp);
    return { type: 'stamp', index: m.stamps.length - 1 };
  });
  selection = selections[selections.length - 1];
  saveMaps(); draw(); refreshSelPanel();
  setStatus('已' + (axis === 'x' ? '左右' : '上下') + '翻轉 ' + selections.length + ' 個圖片', '#7ee0c0');
}
// F / V 快捷鍵：有選取物件就翻選取，否則翻筆刷
function flipAction(axis) { if (selections.length) flipSelection(axis); else toggleBrushFlip(axis); }
document.getElementById('flipX').addEventListener('click', () => toggleBrushFlip('x'));
document.getElementById('flipY').addEventListener('click', () => toggleBrushFlip('y'));
document.getElementById('selFlipX').addEventListener('click', () => flipSelection('x'));
document.getElementById('selFlipY').addEventListener('click', () => flipSelection('y'));
document.getElementById('selReset').addEventListener('click', () => {
  const m = curMap(); let n = 0;
  selections.filter(s => s.type === 'stamp').forEach(sel => { const s = m.stamps[sel.index]; if (s && (s.ox || s.oy)) { delete s.ox; delete s.oy; n++; } });
  if (n) { saveMaps(); draw(); setStatus('已把 ' + n + ' 個物件貼回格線', '#7ee0c0'); }
  else setStatus('選取的物件沒有微調位置', '#9aa4b2');
});

// 加入磚塊（純圖片，依圖片大小自動猜佔幾格）
const tileFile = document.getElementById('tileFile');
document.getElementById('undoBtn').addEventListener('click', undo);
document.getElementById('addTile').addEventListener('click', () => tileFile.click());
tileFile.addEventListener('change', () => {
  const f = tileFile.files[0]; if (!f) return;
  const nameDefault = f.name.replace(/\.[^.]+$/, '');
  const reader = new FileReader();
  reader.onload = () => {
    const dataUrl = reader.result, probe = new Image();
    probe.onload = async () => {
      const wS = Math.max(1, Math.round(probe.naturalWidth / CELL));
      const hS = Math.max(1, Math.round(probe.naturalHeight / CELL));
      const projectPath = await findProjectImagePath(f.name);
      finishAddTile(projectPath || dataUrl, nameDefault, wS, hS);
    };
    probe.onerror = () => setStatus('圖片讀取失敗，請確認檔案格式是否正確', '#ff8f8f');
    probe.src = dataUrl;
  };
  reader.onerror = () => setStatus('圖片檔案讀取失敗，請重新選取', '#ff8f8f');
  reader.readAsDataURL(f);
  tileFile.value = '';
});
function finishAddTile(path, nameDefault, wS, hS) {
  const name = (prompt('磚塊名稱？', nameDefault) || nameDefault).trim();
  const w = Math.max(1, parseInt(prompt('這塊圖佔「幾格寬」？（依圖片大小建議）', wS), 10) || wS);
  const h = Math.max(1, parseInt(prompt('這塊圖佔「幾格高」？', hS), 10) || hS);
  const flat = confirm('這張圖是「平貼地面」嗎？\n\n【確定】＝平貼地面（地板、裂痕、紅線…）：永遠畫在角色下方，不會遮住角色。\n【取消】＝立體物（牆、柱子、家具…）：角色走到它後面時會被擋住。');
  pushUndo();
  const id = 'tile_' + Date.now().toString(36);
  const tile = { id, name, role: 'floor', file: path, w, h };
  if (flat) tile.flat = true;
  customTiles.push(tile);
  saveTiles(); ensureTileImg(customTiles[customTiles.length - 1]);
  selectTile(id);
  setStatus('已加入磚塊「' + name + '」（' + w + '×' + h + ' 格，圖片： ' + path + '）', '#7ee0c0');
}

// 系統繪製色塊：不建立圖片檔，直接儲存顏色與像素尺寸。
const colorBlockPanel = document.getElementById('colorBlockPanel');
document.getElementById('addColorBlock').addEventListener('click', () => {
  colorBlockPanel.classList.remove('hidden');
  document.getElementById('colorBlockName').focus();
});
document.getElementById('cancelColorBlock').addEventListener('click', () => colorBlockPanel.classList.add('hidden'));
document.getElementById('createColorBlock').addEventListener('click', () => {
  const nameInput = document.getElementById('colorBlockName');
  const color = document.getElementById('colorBlockColor').value;
  const widthInput = document.getElementById('colorBlockW'), heightInput = document.getElementById('colorBlockH');
  const width = Math.max(20, Math.min(2000, parseInt(widthInput.value, 10) || 40));
  const height = Math.max(20, Math.min(2000, parseInt(heightInput.value, 10) || 40));
  const name = nameInput.value.trim() || '色塊';
  widthInput.value = width; heightInput.value = height;
  pushUndo();
  const id = 'color_' + Date.now().toString(36);
  customTiles.push({ id, name, role: 'floor', color, w: width / CELL, h: height / CELL, systemColor: true, flat: true });
  saveTiles(); activePaletteCategory = 'color'; selectTile(id);
  colorBlockPanel.classList.add('hidden');
  setStatus('已建立色塊「' + name + '」（' + width + '×' + height + ' px）', '#7ee0c0');
});

// 全部填滿（只適用 1×1 小圖，填到目前圖層）
document.getElementById('fillAll').addEventListener('click', () => {
  if (brush.mode !== 'tile') { setStatus('請先在上面選一塊磚塊圖', '#ff8f8f'); return; }
  if (hiddenLayers.has(activeLayer)) { setStatus('「' + layerName(activeLayer) + '」被隱藏中，請先打開眼睛才能填滿', '#ffd24a'); return; }
  if (isLockedLayer(activeLayer)) { setStatus('「' + layerName(activeLayer) + '」已鎖定，請先按 🔒 解鎖才能填滿', '#ffd24a'); return; }
  const t = tileById(brush.tile); if (!t) return;
  if (isBig(t)) { setStatus('「全部填滿」只能用 1×1 的小圖', '#ff8f8f'); return; }
  pushUndo();
  const m = curMap();
  for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++) m.layers[activeLayer][c + ',' + r] = brush.tile;
  saveMaps(); draw(); setStatus('已用「' + t.name + '」填滿「' + layerName(activeLayer) + '」', '#7ee0c0');
});

// ================= 檢查核心候選位置 =================
document.getElementById('checkPath').addEventListener('click', () => {
  const m = curMap();
  const valid = m.coreSpots.filter(key => {
    const [c, r] = key.split(',').map(Number);
    return inGrid(c, r) && !m.solid.includes(key) && !m.breakable.includes(key);
  });
  if (m.safe) setStatus('這是安全區域，不會生成異質核心', '#ffd24a');
  else if (valid.length < m.coreCount) setStatus('⚠ 目前只有 ' + valid.length + ' 個可用候選點，請至少標記 ' + m.coreCount + ' 個', '#ffd24a');
  else setStatus('✓ ' + valid.length + ' 個可用候選點，每局隨機抽取 ' + m.coreCount + ' 個', '#7ee0c0');
});

// 格線開關
document.getElementById('gridToggle').addEventListener('click', e => {
  showGrid = !showGrid;
  e.currentTarget.textContent = showGrid ? '🔳 格線：開' : '🔲 格線：關';
  e.currentTarget.classList.toggle('off', !showGrid);
  draw();
  setStatus(showGrid ? '格線已開啟' : '格線已關閉', '#8fd3ff');
});

// 不可穿透紅格的顯示開關（純顯示，不會動到地圖的不可穿透設定）
document.getElementById('solidToggle').addEventListener('click', e => {
  showSolid = !showSolid;
  e.currentTarget.textContent = showSolid ? '🧱 紅格：開' : '🧱 紅格：關';
  e.currentTarget.classList.toggle('off', !showSolid);
  draw();
  setStatus(showSolid ? '已顯示不可穿透的紅格' : '已隱藏不可穿透的紅格（設定仍然保留，也還是可以繼續畫）', '#8fd3ff');
});

document.getElementById('clearLayout').addEventListener('click', () => {
  if (!confirm('確定清空這張地圖的所有圖層、大圖、不可穿透、可破壞與核心候選點？（規則數值不變）')) return;
  pushUndo();
  const m = curMap(); m.layers = emptyLayers(); m.stamps = []; m.solid = []; m.solidOffsets = {}; m.breakable = []; m.entrances = []; m.camp = []; m.coreSpots = []; checkResult = null; solidNudgeCell = null;
  saveMaps(); draw(); setStatus('已清空這張地圖', '#ffd24a');
});

// ================= 地圖管理 =================
const mapSelect = document.getElementById('mapSelect');
function refreshMapSelect() {
  mapSelect.innerHTML = '';
  maps.forEach(m => { const opt = document.createElement('option'); opt.value = m.id; opt.textContent = m.name; if (m.id === curId) opt.selected = true; mapSelect.appendChild(opt); });
}
function newId() { return 'map_' + Date.now().toString(36); }
function blankMap(name) { return fixMap({ id: newId(), name: name || '新地圖', desc: '', layers: emptyLayers(), stamps: [], solid: [], breakable: [], coreSpots: [], coreCount: 1, monsterMix: [{ id: 'slime', weight: 100 }], entrances: [], camp: [], rules: {} }); }
function switchTo(id) { curId = id; checkResult = null; selection = null; selections = []; applyMapSize(); refreshSelPanel(); refreshMapSelect(); loadRules(); draw(); }

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
const RULE_FIELDS = ['money', 'guide', 'guideRegen'];
function renderMonsterMix() {
  const panel = document.getElementById('monsterMixList'), map = curMap();
  panel.replaceChildren();
  const catalog = monsterCatalog(true);
  const current = new Map(monsterChoices(map, catalog).map(item => [item.id, item.weight]));
  catalog.forEach(monster => {
    const row = document.createElement('label');
    row.style.cssText = 'display:flex;align-items:center;gap:8px;font-size:13px';
    const toggle = document.createElement('input'); toggle.type = 'checkbox'; toggle.checked = current.has(monster.id); toggle.dataset.monsterId = monster.id;
    const name = document.createElement('span'); name.textContent = monster.name; name.style.flex = '1';
    const weight = document.createElement('input'); weight.type = 'number'; weight.min = '1'; weight.max = '999';
    weight.value = current.get(monster.id) || 100; weight.style.width = '70px'; weight.dataset.monsterWeight = monster.id;
    const unit = document.createElement('small'); unit.textContent = '權重';
    row.append(toggle, name, weight, unit); panel.append(row);
    toggle.addEventListener('change', saveMonsterMix);
    weight.addEventListener('change', saveMonsterMix);
  });
}
function saveMonsterMix() {
  const panel = document.getElementById('monsterMixList');
  const mix = [...panel.querySelectorAll('input[data-monster-id]')].filter(input => input.checked).map(input => ({
    id: input.dataset.monsterId,
    weight: Math.max(1, Math.min(999, Math.floor(Number(panel.querySelector(`input[data-monster-weight="${input.dataset.monsterId}"]`).value) || 1))),
  }));
  if (!mix.length) { setStatus('至少選一種異質體', '#ffd24a'); renderMonsterMix(); return; }
  pushUndo(); curMap().monsterMix = mix; saveMaps(); renderMonsterMix();
}
function loadRules() {
  const m = curMap();
  document.getElementById('f_name').value = m.name;
  document.getElementById('f_desc').value = m.desc;
  document.getElementById('f_cols').value = m.cols;
  document.getElementById('f_rows').value = m.rows;
  document.getElementById('f_safe').checked = !!m.safe;
  document.getElementById('f_npcs').checked = !!m.npcs;
  document.getElementById('f_coreCount').value = m.coreCount;
  RULE_FIELDS.forEach(k => { document.getElementById('f_' + k).value = m.rules[k]; });
  renderMonsterMix();
}
window.addEventListener('focus', renderMonsterMix);
// 寬、高旁的方向選單決定從哪一側增加／裁掉。
function bindSizeField(id, key) {
  document.getElementById(id).addEventListener('change', e => {
    const m = curMap();
    const requested = parseInt(e.target.value, 10);
    if (!Number.isFinite(requested)) { e.target.value = m[key]; return; }
    const v = Math.max(8, Math.min(200, requested));
    e.target.value = v;
    if (m[key] !== v) resizeMapSide(document.getElementById(id + 'Side').value, v - m[key]);
  });
}
bindSizeField('f_cols', 'cols');
bindSizeField('f_rows', 'rows');

// ---- 往指定方向增減格子 ----
// 往上／往左增加時，地圖上所有東西（圖層、大圖、不可穿透、入口、營地、出入口…）都要一起位移，
// 否則內容會相對跑掉。往上／往左減少時同理，並且要丟掉被切掉那幾排的內容。
function shiftMapContent(m, dc, dr) {
  const shiftKey = k => { const [c, r] = k.split(',').map(Number); return (c + dc) + ',' + (r + dr); };
  LAYERS.forEach(l => {
    const src = m.layers[l.id] || {}, out = {};
    for (const k in src) out[shiftKey(k)] = src[k];
    m.layers[l.id] = out;
  });
  (m.stamps || []).forEach(s => { s.c += dc; s.r += dr; });
  ['solid', 'breakable', 'entrances', 'camp', 'coreSpots'].forEach(key => { m[key] = (m[key] || []).map(shiftKey); });
  const off = {};
  for (const k in (m.solidOffsets || {})) off[shiftKey(k)] = m.solidOffsets[k];
  m.solidOffsets = off;
  (m.portals || []).forEach(p => { p.c += dc; p.r += dr; });
  if (solidNudgeCell) solidNudgeCell = shiftKey(solidNudgeCell);
}
// 把落在地圖外的內容清掉（縮小後用）
function dropOutsideContent(m) {
  const inside = (c, r) => c >= 0 && r >= 0 && c < m.cols && r < m.rows;
  const insideKey = k => { const [c, r] = k.split(',').map(Number); return inside(c, r); };
  let removed = 0;
  LAYERS.forEach(l => {
    const src = m.layers[l.id] || {}, out = {};
    for (const k in src) { if (insideKey(k)) out[k] = src[k]; else removed++; }
    m.layers[l.id] = out;
  });
  const before = (m.stamps || []).length;
  m.stamps = (m.stamps || []).filter(s => {
    const t = tileById(s.id) || {};
    return s.c + tileW(t) > 0 && s.r + tileH(t) > 0 && s.c < m.cols && s.r < m.rows;   // 還有一格在地圖內就留著
  });
  removed += before - m.stamps.length;
  ['solid', 'breakable', 'entrances', 'camp', 'coreSpots'].forEach(key => {
    const n = (m[key] || []).length;
    m[key] = (m[key] || []).filter(insideKey);
    removed += n - m[key].length;
  });
  const off = {};
  for (const k in (m.solidOffsets || {})) { if (insideKey(k)) off[k] = m.solidOffsets[k]; }
  m.solidOffsets = off;
  const pn = (m.portals || []).length;
  m.portals = (m.portals || []).filter(p => inside(p.c, p.r));
  removed += pn - m.portals.length;
  if (solidNudgeCell && !insideKey(solidNudgeCell)) solidNudgeCell = null;
  return removed;
}
const DIR_LABEL = { up: '上', down: '下', left: '左', right: '右' };
function resizeMapSide(dir, amount) {
  const m = curMap();
  const horizontal = (dir === 'left' || dir === 'right');
  const key = horizontal ? 'cols' : 'rows';
  const next = m[key] + amount;
  if (next < 8) { setStatus('地圖最小 8 格，不能再縮了', '#ff8f8f'); return; }
  if (next > 200) { setStatus('地圖最大 200 格', '#ff8f8f'); return; }
  pushUndo();
  m[key] = next;
  // 從上面／左邊增減時，內容要跟著位移（增加是正、減少是負）
  if (dir === 'up') shiftMapContent(m, 0, amount);
  else if (dir === 'left') shiftMapContent(m, amount, 0);
  const dropped = amount < 0 ? dropOutsideContent(m) : 0;
  clearSelection(); checkResult = null;
  applyMapSize(); saveMaps(); refreshSelPanel(); loadRules(); draw();
  const act = amount > 0 ? ('往' + DIR_LABEL[dir] + '加 ' + amount + ' 格') : ('從' + DIR_LABEL[dir] + '刪 ' + (-amount) + ' 格');
  setStatus(act + '：地圖變成 ' + m.cols + '×' + m.rows + (dropped ? '（有 ' + dropped + ' 個超出範圍的內容被刪掉，可用 Ctrl+Z 復原）' : ''), dropped ? '#ffd24a' : '#7ee0c0');
}
document.getElementById('f_name').addEventListener('input', e => { curMap().name = e.target.value; refreshMapSelect(); saveMaps(); });
document.getElementById('f_desc').addEventListener('input', e => { curMap().desc = e.target.value; saveMaps(); });
document.getElementById('f_npcs').addEventListener('change', e => {
  curMap().npcs = e.target.checked; saveMaps();
  setStatus(e.target.checked ? '這張地圖會出現場景 NPC（克莉思、克萊兒、路德、穆恩、艾德林、諾亞、阿瓦倫）' : '這張地圖不會出現場景 NPC', '#8fd3ff');
});
document.getElementById('f_safe').addEventListener('change', e => {
  curMap().safe = e.target.checked; saveMaps();
  setStatus(e.target.checked ? '這張地圖設為安全場景：遊戲裡不生怪、不套黑幕' : '這張地圖恢復成一般關卡（會生怪、有黑幕）', '#8fd3ff');
});
RULE_FIELDS.forEach(k => { document.getElementById('f_' + k).addEventListener('input', e => { const v = parseFloat(e.target.value); curMap().rules[k] = isNaN(v) ? 0 : v; saveMaps(); }); });
document.getElementById('f_coreCount').addEventListener('change', e => {
  const count = Math.max(1, Math.min(20, Math.floor(Number(e.target.value) || 1)));
  pushUndo(); curMap().coreCount = count; e.target.value = count;
  saveMaps(); draw();
});

// ================= 預覽遊戲畫面 =================
// 把「目前這張地圖」和自訂磚塊暫存起來，再開遊戲頁（?preview=1）讀它。
// 不用先匯出 maps.js，也不會動到 data/maps.js 或遊戲原本的地圖清單。
document.getElementById('previewGame').addEventListener('click', () => {
  const m = curMap();
  try {
    localStorage.setItem(STORAGE_PREVIEW, JSON.stringify({ map: clone(m), tiles: customTiles, at: Date.now() }));
  } catch (e) {
    setStatus('預覽失敗：暫存空間不足（地圖或圖片太大）', '#ff8f8f');
    return;
  }
  window.open('塔防原型.html?preview=1', 'tudrc_preview');
  setStatus('已用「' + m.name + '」開啟預覽視窗（改完地圖再按一次就會更新）', '#7ee0c0');
});

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
  loadTiles(); loadMaps(); applyMapSize(); preloadTiles(); renderPalette(); refreshMapSelect(); refreshSelPanel(); loadRules(); draw();
  setStatus('已重設為檔案內容', '#ffd24a');
});

// ================= 啟動 =================
loadTiles();
loadMaps();
applyMapSize();
preloadTiles();
renderPalette();
selectTile('floor');
renderLayers();
refreshMapSelect();
loadRules();
draw();
if (PULL_RESTORE_APPLIED) setStatus('舊瀏覽器紀錄已備份；目前已載入 Git 地圖版本 ✓', '#7ee0c0');
setStatus('編輯器已就緒。目前有 ' + maps.length + ' 張地圖、' + palette().length + ' 塊磚塊。', '#7ee0c0');
