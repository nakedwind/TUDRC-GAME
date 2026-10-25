/* ===== 🗺️ 戰鬥／劇情地圖編輯器共用核心（圖層 + 可翻轉圖片 + 圖片效果分離）=====
   圖片分兩層：🟫 地板層(floor) 在底、✨ 裝飾層(deco) 疊在上面(透明處透出地板)。
   另有多格大圖(stamps)疊最上面。以上都只是外觀。
   遊戲效果獨立標記：🧱 不可穿透(solid)；可破壞素材沿用自己的血量與碰撞。
   還可標怪物入口、營地，設定規則，Ctrl+Z 回復，自動存檔、可匯出。
   格線設定在 js/config.js。

   地圖編輯器.html 與 劇情地圖編輯器.html 共用這份程式和 css/map-editor.css，
   但透過 MAP_EDITOR_CONFIG 分別儲存到 data/maps.js 與 data/story-maps.js。
   基地地圖則由 基地編輯器.html（js/base-editor*.js）管理。
   三種地圖的清單與瀏覽器暫存互相獨立，素材庫 data/tiles.js（SHARED_TILES）共同使用。
*/

const cv = document.getElementById('cv');
const ctx = cv.getContext('2d');
ctx.imageSmoothingEnabled = false;   // 像素圖不要模糊
const EDITOR_SETTINGS = Object.assign({
  editorName: '地圖編輯器',
  mapLabel: '戰鬥地圖',
  sourceMaps: typeof BATTLE_MAPS !== 'undefined' ? BATTLE_MAPS : [],
  sourceDeletedMaps: typeof BATTLE_MAPS_DELETED !== 'undefined' ? BATTLE_MAPS_DELETED : [],
  storageMaps: 'tudrc_battle_maps_v1',
  storageDeletedMaps: 'tudrc_battle_deleted_maps_v1',
  storageSplitDone: 'tudrc_battle_editor_split_v1',
  defaultSafe: false,
  migrateOldShared: true,
  outputPath: 'data/maps.js',
  outputConst: 'BATTLE_MAPS',
  deletedConst: 'BATTLE_MAPS_DELETED',
  exportHeading: '戰鬥地圖（由「🗺️ 地圖編輯器」匯出）',
  exportDescription: '只放戰鬥地圖；基地（安全區域）的地圖在 data/base-maps.js，由「🏠 基地編輯器」管理。',
}, window.MAP_EDITOR_CONFIG || {});
const EDITOR_SOURCE_MAPS = Array.isArray(EDITOR_SETTINGS.sourceMaps) ? EDITOR_SETTINGS.sourceMaps : [];
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
// 瀏覽器暫存：每種地圖分類各用自己的 key，彼此不會覆蓋
const STORAGE_MAPS = EDITOR_SETTINGS.storageMaps;
// ---- 刪掉的地圖：記下來，才不會被「檔案裡有、暫存沒有就補回來」又加回去 ----
// ・自己刪的先記在瀏覽器（STORAGE_DELETED_MAPS）；按「存到專案」時寫進 data/maps.js 的 BATTLE_MAPS_DELETED，
//   其他人拉下來打開編輯器，他瀏覽器暫存裡的這張也會跟著刪掉（不然他一存檔又會寫回去）。
// ・刪掉後按「復原」把地圖找回來：記號會自動拿掉。（基地編輯器有自己的一份：js/base-editor.js）
const STORAGE_DELETED_MAPS = EDITOR_SETTINGS.storageDeletedMaps;
const FILE_DELETED_MAPS = Array.isArray(EDITOR_SETTINGS.sourceDeletedMaps) ? EDITOR_SETTINGS.sourceDeletedMaps : [];
let deletedMapIds = new Set(FILE_DELETED_MAPS);
try { for (const id of JSON.parse(localStorage.getItem(STORAGE_DELETED_MAPS) || '[]')) deletedMapIds.add(id); } catch (_) {}
function saveDeletedMaps() {
  // 打開編輯器時，檔案裡的地圖都已經補進來了；之後檔案裡有、清單裡卻沒有的＝自己刪掉的（刪除、復原、重做都照這個算）
  for (const m of EDITOR_SOURCE_MAPS) if (!maps.some(x => x.id === m.id)) deletedMapIds.add(m.id);
  for (const id of [...deletedMapIds]) if (maps.some(m => m.id === id)) deletedMapIds.delete(id);   // 還在清單裡的（復原回來的）就不算刪掉
  try { localStorage.setItem(STORAGE_DELETED_MAPS, JSON.stringify([...deletedMapIds])); } catch (_) {}
}
// 素材庫：三個編輯器共用同一份暫存（地圖暫存仍各自一份）
const STORAGE_TILES = 'tudrc_shared_tiles_v1';
const OWN_OLD_TILES = 'tudrc_battle_tiles_v1', OTHER_OLD_TILES = 'tudrc_base_tiles_v1';   // 素材還沒共用之前，兩個編輯器各自的素材暫存（第一次打開時合併過來，舊暫存不刪）
// 分開之前兩個編輯器共用的暫存：第一次打開時，把裡面的戰鬥地圖搬過來（舊暫存保留不刪，當作備份）
const OLD_SHARED_MAPS = 'tudrc_maps_v4';
const OLD_SHARED_TILES = 'tudrc_tiles_v3';
const STORAGE_SPLIT_DONE = EDITOR_SETTINGS.storageSplitDone;   // 搬過一次就不再搬（之後按「從檔案重設」才不會又搬回舊的）
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
const STORAGE_AMMO_CRATE_OPEN = 'tudrc_asset_ammo_crate_open_v2'; // 後補：彈藥箱（打開）；v2：圖改成 80×80（2×2 格），編輯器裡的素材大小跟著更新
const STORAGE_AMMO_CRATE_EMPTY = 'tudrc_asset_ammo_crate_empty_v1'; // 後補：彈藥箱（空）；指定內容物的彈藥箱開過後換這張（js/flare.js）
const STORAGE_SUPPLY_BOX = 'tudrc_asset_supply_box_v1';           // 後補：物資箱（js/camp-supply.js）
const STORAGE_ORE_TILES = 'tudrc_asset_ore_tiles_v2';              // 後補：三種異質礦（可炸開採集，js/ore.js）；v2：大型 2×2、稀有 2×3
const STORAGE_STREET_PACK = 'tudrc_asset_pack_street_v1';         // 街道素材包＋後補的捷運出口、路網圖、後室破損牆
const STORAGE_DRINK_SHOP_PACK = 'tudrc_asset_pack_drink_shop_v1'; // 新增的可互動飲料店素材
const STORAGE_POOLCORE_PACK = 'tudrc_asset_pack_poolcore_v5';       // 池核磁磚素材（v3：資料夾改名 images/Poolcore、加地板大中小；v5：柱子 1×4）
const STORAGE_HQ_PACK = 'tudrc_asset_pack_command_hq_v1';           // 指揮部素材包
const STORAGE_RESEARCH_LAB_PACK = 'tudrc_asset_pack_research_lab_v1'; // 研究部素材包
const STREET_PACK_IDS = new Set(["tile_street_ubike", "tile_street_scooter_delivery_green", "tile_street_scooter_delivery_pink", "tile_street_capsule_toy_machines", "tile_street_utility_box_painted", "tile_street_utility_box", "tile_street_folding_table", "tile_street_plastic_stool", "tile_street_plastic_stools_stacked", "tile_street_bottle_red", "tile_street_bollard_red", "tile_street_bollard_yellow", "tile_street_sign_no_entry", "tile_street_sign_stop", "tile_street_sign_scooter_lanes", "tile_street_sign_two_stage_turn", "tile_street_sign_turn_right", "tile_street_sign_no_left_turn", "tile_street_sign_speed_limit_50", "tile_street_traffic_light", "tile_street_name_sign_pole", "tile_street_crosswalk", "tile_street_area_map_board", "tile_street_stall_steak", "tile_street_stall_noodles", "tile_street_stall_drinks", "tile_mrt_exit_2", "tile_mrt_exit_2_sealed", "tile_mrt_map_kiosk", "tile_bg_backroom_wall02_dmg_crack", "tile_bg_backroom_wall02_hole2", "tile_street_claw_machine"]);
const STORAGE_BACKROOM_DAMAGE_EXTRA = 'tudrc_asset_backroom_damage_extra_v1'; // 後補：後室地板／牆面破損、看板、日光燈＋破損建築新素材
const STORAGE_BACKROOM_FLOOR_EDGE = 'tudrc_asset_backroom_floor_edge_v1';  // 後補：後室地板左緣／右緣
const STORAGE_BACKROOM_WALL_HALF_HOLE = 'tudrc_asset_backroom_wall_half_hole_v1'; // 後補：後室半牆、後室牆面（門洞）
const STORAGE_BACKROOM_DOOR_WOOD = 'tudrc_asset_backroom_door_wood_v1'; // 後補：後室木門（黃色，配門洞用）
const STORAGE_BACKROOM_CORE_PILLARS = 'tudrc_asset_backroom_core_pillars_v1'; // 後補：異質核心與柱子變化
const BACKROOM_CORE_PILLAR_IDS = new Set(['tile_bg_anomalous_core', 'tile_bg_backroom_pillar3', 'tile_bg_pillar', 'tile_bg_pillar02', 'tile_bg_pillar03', 'tile_bg_pillar04']);
const BACKROOM_DAMAGE_EXTRA_IDS = new Set(["tile_bg_backroom_floor03", "tile_bg_backroom_floor04", "tile_bg_backroom_wall02", "tile_bg_backroom_wall02_dmg_light", "tile_bg_backroom_wall02_dmg_medium", "tile_bg_backroom_wall02_dmg_heavy", "tile_bg_electric_light", "tile_bg_road_signs", "tile_bg_word_y28", "tile_dmg_pillar_damaged", "tile_dmg_floor_crack_cross", "tile_dmg_floor_crack_fork", "tile_dmg_floor_crack_stained", "tile_dmg_floor_stain_seep", "tile_dmg_floor_stain_smudge", "tile_dmg_rubble_brick_chunks", "tile_dmg_rubble_chips_02", "tile_dmg_rubble_scatter_02", "tile_dmg_rubble_slab_fragments", "tile_dmg_rubble_wall_chunks", "tile_dmg_rubble_rebar_chunk"]);
const STORAGE_OIL_TANK = 'tudrc_asset_pack_oil_tank_v2';   // 新增素材：油箱
const STORAGE_GRAFFITI_PENS = 'tudrc_asset_pack_graffiti_pens_v1';   // 新增素材：地上撿的塗鴉筆（js/graffiti.js）
const STORAGE_RESTAURANT_CHAIR_FIX = 'tudrc_fix_restaurant_folding_chairs_v1'; // 餐廳「飲水機」其實是折疊椅：改檔名與名稱
const STORAGE_TILE_SIZE_FIX = 'tudrc_fix_tile_sizes_v1';         // 修正登記尺寸與圖片不符的素材
const STORAGE_EOC_POSTER = 'tudrc_asset_eoc_distance_poster_v1'; // 後補的應變中心素材：安全距離海報
const STORAGE_EOC_WALL_ITEMS = 'tudrc_asset_eoc_wall_items_v1';  // 後補的應變中心素材：門（電子鎖）、消防栓箱
const STORAGE_DAMAGE_ASSETS_CLEANUP = 'tudrc_remove_unapproved_damage_assets_v1';

// 地圖畫布的點選音效；按鈕與切換的回饋由 ui-feedback.js 共用處理。
const mapClickSound = new Audio('Sound effects/介面/對話框下一頁音效.mp3');
mapClickSound.preload = 'auto';
mapClickSound.volume = 0.55;

function playMapClickSound() {
  mapClickSound.currentTime = 0;
  mapClickSound.play().catch(() => {});
}

// ---- 小工具 ----
// 戰鬥編輯器預設 safe=false；劇情編輯器預設 safe=true，並可在地圖規則中切換
const EDITOR_MAP_SAFE = !!EDITOR_SETTINGS.defaultSafe;
const clone = (o) => JSON.parse(JSON.stringify(o));
const removeFrom = (arr, key) => { const i = arr.indexOf(key); if (i >= 0) arr.splice(i, 1); };
const toggle = (arr, key) => { const i = arr.indexOf(key); if (i >= 0) arr.splice(i, 1); else arr.push(key); };
const roleLabel = (r) => ({ floor: '地板', wall: '牆', obstacle: '障礙物' })[r] || r;
const tileW = (t) => (t && t.w) || 1;
const tileH = (t) => (t && t.h) || 1;
const stampTurn = s => ((Number(s && s.rot) || 0) % 4 + 4) % 4;
const stampW = (s, t) => stampTurn(s) % 2 ? tileH(t) : tileW(t);
const stampH = (s, t) => stampTurn(s) % 2 ? tileW(t) : tileH(t);
const isBig = (t) => tileW(t) !== 1 || tileH(t) !== 1;
const tilePixelW = (t) => Math.round(tileW(t) * CELL);
const tilePixelH = (t) => Math.round(tileH(t) * CELL);

// ---- 圖層（由底到上）----
// 每張地圖可以有自己的圖層清單：在右邊「🗂️ 圖層」新增／刪除／改名後，存在那張地圖的 layerOrder（[{ id, name }]）。
// 沒改過圖層的地圖不存 layerOrder，就用下面這組預設圖層。
// 圖層 id 決定遊戲裡的畫法（js/maploader.js）：ground…＝地面類（永遠畫在角色下面）、
// object…／overlay＝物件類（跟角色排前後）、top＝永遠畫在角色上面。新增的圖層會取 ground5、object5 這種 id。
const DEFAULT_LAYERS = [
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
const layersOf = m => (m && Array.isArray(m.layerOrder) && m.layerOrder.length) ? m.layerOrder : DEFAULT_LAYERS;
let LAYERS = DEFAULT_LAYERS;   // 目前這張地圖的圖層（換地圖、新增／刪除圖層時由 syncLayers 更新）
function syncLayers() {
  LAYERS = layersOf(curMap());
  if (!LAYERS.some(l => l.id === activeLayer)) activeLayer = LAYERS[0].id;
}
const layerName = (id) => (LAYERS.find(l => l.id === id) || {}).name || id;
const emptyLayers = (list = DEFAULT_LAYERS) => { const o = {}; list.forEach(l => o[l.id] = {}); return o; };

// ---- 內建磚塊（純圖片；牆/障礙先用色塊當佔位圖）----
const BUILTIN_TILES = [
  { id: 'floor', name: '地板', role: 'floor', file: 'images/background/Back-room-floor.png', w: 1, h: 1, builtin: true },
  { id: 'wall', name: '牆(灰)', role: 'wall', file: null, w: 1, h: 1, builtin: true },
  { id: 'obstacle', name: '障礙(棕)', role: 'obstacle', file: null, w: 1, h: 1, builtin: true },
];

// 預設入口＝最上排；預設營地＝最下兩排
function defCamp() { const a = []; for (let c = 0; c < COLS; c++) { a.push(c + ',' + (ROWS - 2)); a.push(c + ',' + (ROWS - 1)); } return a; }
const effCamp = (m) => new Set(m.camp.length ? m.camp : defCamp());

// ================= 資料 =================
let maps, curId, customTiles = [], brush = { mode: 'tile', tile: 'floor' }, activeLayer = 'floor';
let checkResult = null, hoverCell = null, painting = false, lastPaint = '', selection = null, selections = [];
let brushFlip = { fx: false, fy: false };   // 筆刷翻轉（大小圖都可用）
let brushRotation = 0;
let tempTool = null, savedBrush = null, pickResult = null;   // Alt=臨時吸管 / Ctrl=臨時選取
let pickedBrushPending = false;   // 吸管吸到的圖還沒放進地圖：這時按右鍵＝取消這次複製，回到「選取」
let selectionDrag = null;
// 物件擺放用「四分之一格」對齊（10px），不用整格整格跳；地板類小圖還是整格
const SUB = CELL / 4;
let pointerPx = null;   // 滑鼠目前在畫布上的像素位置
const snapSub = v => Math.floor(v / SUB) * SUB;
// 「只貼在整格」打勾時：物件也整格整格擺（ox、oy 都是 0），不打勾才用四分之一格
const STORAGE_SNAP_WHOLE = 'tudrc_editor_snap_whole_v1';
let snapWhole = false;
try { snapWhole = localStorage.getItem(STORAGE_SNAP_WHOLE) === '1'; } catch (_) {}
// 像素位置 → 擺放位置（格子 c、r＋格內偏移 ox、oy，都是 10px 的倍數）
function subPosAt(x, y) {
  if (snapWhole) return { c: Math.floor((x - OX) / CELL), r: Math.floor((y - OY) / CELL), ox: 0, oy: 0 };
  const gx = snapSub(x - OX), gy = snapSub(y - OY), c = Math.floor(gx / CELL), r = Math.floor(gy / CELL);
  return { c, r, ox: gx - c * CELL, oy: gy - r * CELL };
}
// 物件圖層（會跟角色排前後的那些）＋最上層：1×1 小圖也用四分之一格擺
const isObjectLayer = lid => /^object\d*$/.test(lid) || lid === 'overlay' || lid === 'top';
// 用畫出來的實際位置（含微調）找這個像素點上最上面的物件
// 點選物件：照圖層順序挑，上層的優先（跟右邊圖層面板、畫面上誰蓋誰一樣）；同一層裡比較晚放的優先
// hit(s, t)＝這個物件有沒有被點到。隱藏或鎖定的圖層：選不到／擦不到
function topStampIndex(m, hit) {
  let best = -1, bestRank = -1;
  for (let i = m.stamps.length - 1; i >= 0; i--) {
    const s = m.stamps[i], lid = s.layer || 'top';
    if (hiddenLayers.has(lid) || isLockedLayer(lid)) continue;
    const rank = LAYERS.findIndex(l => l.id === lid);
    if (rank <= bestRank) continue;   // 已經找到更上層的（或同一層、比較晚放的）
    const t = tileById(s.id) || {};
    if (hit(s, t)) { best = i; bestRank = rank; }
  }
  return best;
}
function stampIndexAtPx(m, x, y) {
  return topStampIndex(m, (s, t) => {
    const x0 = OX + s.c * CELL + (s.ox || 0), y0 = OY + s.r * CELL + (s.oy || 0);
    return x >= x0 && x < x0 + stampW(s, t) * CELL && y >= y0 && y < y0 + stampH(s, t) * CELL;
  });
}
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
  const packTiles = SHARED_TILES.filter(picks);
  const baseName = f => String(f || '').replace(/\\/g, '/').split('/').pop().toLowerCase();
  const knownIds = new Set(SHARED_TILES.map(x => x.id));
  packTiles.forEach(t => {
    const filename = baseName(t.file);
    // 先用 id 找；找不到才用檔名找，而且只認「使用者自己加的素材」——
    // 不能拿別的內建素材來改（曾經因為兩張圖都叫 pillar.png，把大廳高柱改壞）。
    const existing = customTiles.find(x => x.id === t.id)
      || (!idOnly && customTiles.find(x => !knownIds.has(x.id) && filename && baseName(x.file) === filename));
    if (existing) {
      existing.file = t.file; existing.w = t.w; existing.h = t.h;
      if (t.flat) existing.flat = true; else delete existing.flat;   // 讓「平貼地面」標記同步到編輯器暫存，匯出才不會掉
      if (t.water) existing.water = { ...t.water }; else delete existing.water;   // 「這是水」的設定也一樣
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

// 第一次打開分開後的編輯器：如果舊的共用暫存（分開之前兩個編輯器一起用的）裡有東西，就從那裡接著用，
// 還沒「存到專案」的編輯才不會不見。只搬一次；舊暫存本身不刪。
function oldSharedDraft(key) {
  if (localStorage.getItem(STORAGE_SPLIT_DONE)) return null;
  try { const v = JSON.parse(EditorStore.getItem(key) || 'null'); return Array.isArray(v) && v.length ? v : null; } catch (_) { return null; }
}
// 讀一份素材暫存（沒有或壞掉就回傳空陣列）
function draftTiles(key) { try { const v = JSON.parse(EditorStore.getItem(key) || 'null'); return Array.isArray(v) ? v : []; } catch (_) { return []; } }
function loadTiles() {
  let saved = EditorStore.getItem(STORAGE_TILES);
  // 第一次用共用素材庫：把以前兩個編輯器各自的素材暫存合在一起（同一個素材以這個編輯器的為準），都沒有就用檔案
  let migratedTiles = false;
  if (!saved) {
    const merged = [];
    for (const list of [draftTiles(OWN_OLD_TILES), draftTiles(OTHER_OLD_TILES), oldSharedDraft(OLD_SHARED_TILES) || []])
      for (const tile of list) if (tile && tile.id && !merged.some(x => x.id === tile.id)) merged.push(tile);
    if (merged.length) { saved = JSON.stringify(merged); migratedTiles = true; }
  }
  if (!migratedTiles && typeof DraftSync !== 'undefined') { const merged = DraftSync.load(STORAGE_TILES, SHARED_TILES, { store: EditorStore, label: '素材庫' }); if (merged) saved = JSON.stringify(merged); }   // 三方合併（js/draft-sync.js）
  if (saved) { try { customTiles = JSON.parse(saved); } catch (e) { customTiles = clone(SHARED_TILES); } }
  else customTiles = clone(SHARED_TILES);
  if (!Array.isArray(customTiles)) customTiles = [];
  // 檔案（data/tiles.js）裡有、暫存裡沒有的素材（例如別人新增、你剛 pull 下來的）：補進來
  let filledFromFile = false;
  for (const tile of SHARED_TILES) if (!customTiles.some(x => x.id === tile.id)) { customTiles.push(clone(tile)); filledFromFile = true; }
  if (migratedTiles || filledFromFile) saveTiles();
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
"images/層級鑰匙.png": "images/items/level-key.png",
"images/手電筒.png": "images/items/flashlight.png",
"images/扭蛋.png": "images/items/gashapon-capsule.png",
"images/杏仁水.png": "images/items/almond-water-large.png",
"images/杏仁水小.png": "images/items/almond-water-small.png",
"images/照明彈.png": "images/items/flare-ammo.png",
"images/置物箱.png": "images/scene-props/storage-locker-closed.png",
"images/置物箱02.png": "images/scene-props/storage-locker-open.png",
"images/置物箱鑰匙.png": "images/items/storage-locker-key.png",
"images/藥罐.png": "images/items/medicine-bottle.png",
"images/醫療箱.png": "images/items/medical-kit.png",
"images/電池.png": "images/items/battery.png",
"images/電源開關-開.png": "images/scene-props/power-switch-on.png",
"images/電源開關-關.png": "images/scene-props/power-switch-off.png",
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
  const streetAdded = mergeDefaultAssetPack(t => STREET_PACK_IDS.has(t.id), STORAGE_STREET_PACK);
  const drinkShopAdded = mergeDefaultAssetPack(t => String(t.id).startsWith('tile_street_drink_shop_'), STORAGE_DRINK_SHOP_PACK);
  const ammoCrateOpenAdded = mergeDefaultAssetPack(t => t.id === 'tile_field_ammo_crate_open', STORAGE_AMMO_CRATE_OPEN);
  if (SHARED_TILES.some(t => t.id === 'tile_field_ammo_crate_empty') && mergeDefaultAssetPack(t => t.id === 'tile_field_ammo_crate_empty', STORAGE_AMMO_CRATE_EMPTY)) saveTiles();   // 素材庫裡有了才記「已加過」
  const supplyBoxAdded = mergeDefaultAssetPack(t => t.id === 'tile_field_supply_box', STORAGE_SUPPLY_BOX);
  const oreTilesAdded = mergeDefaultAssetPack(t => String(t.id).startsWith('tile_obstacle_ore_'), STORAGE_ORE_TILES);
  const ironGateAdded=mergeDefaultAssetPack('tile_obstacle_irongate','tudrc_irongate_v1');
  const interactiveAdded = mergeDefaultAssetPack('tile_interactive_', 'tudrc_asset_interactive_20261013_v3');
  const poolcoreAdded = mergeDefaultAssetPack('tile_poolcore_', STORAGE_POOLCORE_PACK);
  const hqAdded = mergeDefaultAssetPack('tile_hq_', STORAGE_HQ_PACK);
  const breakableWallAdded = mergeDefaultAssetPack(t => t.id === 'tile_bg_backroom_wall02_breakable', 'tudrc_breakable_wall_v1');   // 後室牆面（可炸開）：js/breakable-walls.js
  const backroomCounterAdded = mergeDefaultAssetPack(t => t.id === 'tile_cvs_checkout_counter_backroom', 'tudrc_backroom_counter_v1');   // 後室商店櫃台（js/shop.js）
  const secretWallAdded = mergeDefaultAssetPack(t => t.id === 'tile_bg_backroom_wall02_secret', 'tudrc_secret_wall_v1');   // 後室牆面（可炸開・隱藏區）
  const backgroundExtrasAdded = mergeDefaultAssetPack('tile_bg_extra_', 'tudrc_asset_background_extras_20261018');
  const researchLabAdded = mergeDefaultAssetPack('tile_research_lab_', STORAGE_RESEARCH_LAB_PACK);
  const backroomDamageAdded = mergeDefaultAssetPack(t => BACKROOM_DAMAGE_EXTRA_IDS.has(t.id), STORAGE_BACKROOM_DAMAGE_EXTRA);
  const backroomEdgeAdded = mergeDefaultAssetPack(t => t.id === 'tile_bg_backroom_floor05' || t.id === 'tile_bg_backroom_floor06', STORAGE_BACKROOM_FLOOR_EDGE);
  const backroomWallHalfHoleAdded = mergeDefaultAssetPack(t => t.id === 'tile_bg_backroom_wall02_half' || t.id === 'tile_bg_backroom_wall02_hole', STORAGE_BACKROOM_WALL_HALF_HOLE);
  const backroomDoorWoodAdded = mergeDefaultAssetPack(t => t.id === 'tile_bg_backroom_door_wood', STORAGE_BACKROOM_DOOR_WOOD);
  const oilTankAdded = mergeDefaultAssetPack(t => t.id === 'tile_new_decor_oil_tank', STORAGE_OIL_TANK);
  const graffitiPensAdded = mergeDefaultAssetPack(t => String(t.id).startsWith('tile_interactive_pickup_graffiti_'), STORAGE_GRAFFITI_PENS);
  const trainingRoomAdded = mergeDefaultAssetPack('tile_training_', 'tudrc_asset_pack_training_room_v2');   // 地下訓練室素材包
  const floorSignsAdded = mergeDefaultAssetPack('tile_eoc_floor_sign_', 'tudrc_asset_eoc_floor_signs_v1', true);   // 應變中心：樓層標示 1F～4F、B1～B4
  const ballBedAdded = mergeDefaultAssetPack(t => t.id === 'tile_eoc_ball_bed', 'tudrc_asset_eoc_ball_bed_v1', true);   // 應變中心：球球的床（球球會去睡，js/ball-poses.js）
  const doorKeyAdded = mergeDefaultAssetPack(t => t.id === 'tile_interactive_pickup_backroom_door_key', 'tudrc_asset_pack_door_key_v1');   // 地上撿的後室門鑰匙（js/doors.js）
  const backroomCorePillarsAdded = mergeDefaultAssetPack(t => BACKROOM_CORE_PILLAR_IDS.has(t.id), STORAGE_BACKROOM_CORE_PILLARS, true);
  let restaurantChairsFixed = false;
  if (!localStorage.getItem(STORAGE_RESTAURANT_CHAIR_FIX)) {   // 素材 id 不變，地圖上的擺放不受影響
    for (const id of ['tile_restaurant_water_dispenser_01', 'tile_restaurant_water_dispenser_02']) {
      const src = SHARED_TILES.find(t => t.id === id), own = customTiles.find(t => t.id === id);
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
  if (supplyBoxAdded || backgroundExtrasAdded || ironGateAdded || interactiveAdded || decorAdded || obstaclesAdded || newAssetsAdded || stationHallAdded || eocAdded || bgExtraAdded || damageAssetsRemoved || damagedAdded || sizeFixed || eocPosterAdded || eocWallAdded || fieldAdded || fieldBaseAdded || scenePropsAdded || counselingRoomAdded || restaurantAdded || hospitalAdded || containmentAdded || mrtAdded || cvsAdded || streetAdded || drinkShopAdded || ammoCrateOpenAdded || oreTilesAdded || poolcoreAdded || hqAdded || breakableWallAdded || secretWallAdded || backroomCounterAdded || researchLabAdded || backroomDamageAdded || backroomEdgeAdded || backroomWallHalfHoleAdded || backroomDoorWoodAdded || backroomCorePillarsAdded || restaurantChairsFixed || propsFurnitureAdded || eocHydrantsAdded || counselingTissueFixed || noEntryAdded || oilTankAdded || graffitiPensAdded || doorKeyAdded || trainingRoomAdded || floorSignsAdded || ballBedAdded) saveTiles();

  // 一次性遷移：圖片已搬到 images/ 資料夾，把瀏覽器暫存裡的舊路徑自動更新
  let migrated = false;
  customTiles.forEach(t => {
    if (t.file === 'background/roadblocks.png') { t.file = 'images/item-obstacle/04roadblocks.png'; migrated = true; }
    else if (t.file && t.file.startsWith('background/')) { t.file = 'images/' + t.file; migrated = true; }
  });
  if (migrated) saveTiles();
}
// ================= 共用素材庫 =================
// 兩個編輯器的素材（磚塊）是同一份：存在共用暫存 STORAGE_TILES、存到專案時寫進 data/tiles.js。
// 兩個編輯器同時開著時，一邊加／改／刪素材，另一邊馬上收到（BroadcastChannel），不用重新整理。
const tileChannel = typeof BroadcastChannel === 'function' ? new BroadcastChannel('tudrc_shared_tiles') : null;
const foreignTiles = new Map();   // 另一個編輯器加進來的素材（Ctrl+Z 回到更早的步驟時不要把它們弄丟）
function saveTiles() {
  EditorStore.setItem(STORAGE_TILES, JSON.stringify(customTiles)).catch(e => setStatus('⚠️ 素材暫存失敗（' + (e && e.name || e) + '）', '#ff8f8f'));
  if (tileChannel) tileChannel.postMessage({ from: EDITOR_SETTINGS.editorName, tiles: customTiles });
}
if (tileChannel) tileChannel.onmessage = e => {
  const list = e.data && e.data.tiles; if (!Array.isArray(list)) return;
  const added = list.filter(tile => !customTiles.some(x => x.id === tile.id));
  added.forEach(tile => foreignTiles.set(tile.id, tile));
  for (const tile of list) { const old = customTiles.find(x => x.id === tile.id); if (old && old.file !== tile.file) delete tileImgCache[tile.id]; }   // 圖片換了：重新載入
  customTiles = list;
  if (!tileById(brush.tile)) brush = { mode: brush.mode, tile: 'floor' };
  preloadTiles(); renderPalette(); draw(); refreshSelPanel();
  setStatus((e.data.from || '另一個編輯器') + '更新了素材庫' + (added.length ? '：新增「' + added.map(x => x.name).join('、') + '」' : ''), '#8fd3ff');
};

function loadMaps() {
  let saved = EditorStore.getItem(STORAGE_MAPS);
  const shared = !saved && EDITOR_SETTINGS.migrateOldShared ? oldSharedDraft(OLD_SHARED_MAPS) : null;
  const sharedMaps = shared ? shared.filter(m => m && !m.safe) : null;   // 舊共用暫存：只搬戰鬥地圖（基地地圖由基地編輯器自己搬）
  if (sharedMaps && sharedMaps.length) saved = JSON.stringify(sharedMaps);
  localStorage.setItem(STORAGE_SPLIT_DONE, '1');
  // 暫存和專案檔三方合併：朋友推送、你剛拉下來的修改不會被舊暫存蓋掉（js/draft-sync.js）
  if (!(sharedMaps && sharedMaps.length) && typeof DraftSync !== 'undefined') { const merged = DraftSync.load(STORAGE_MAPS, EDITOR_SOURCE_MAPS, { store: EditorStore, label: EDITOR_SETTINGS.mapLabel }); if (merged) saved = JSON.stringify(merged); }
  if (saved) { try { maps = JSON.parse(saved); } catch (e) { maps = clone(EDITOR_SOURCE_MAPS); } }
  else maps = clone(EDITOR_SOURCE_MAPS);
  if (!Array.isArray(maps) || maps.length === 0) maps = clone(EDITOR_SOURCE_MAPS);
  // 專案檔記著已經刪掉的地圖（別人刪的）：瀏覽器暫存裡還有的話也拿掉（至少留一張）
  let restoredDefaults = false;
  const keep = maps.filter(m => !FILE_DELETED_MAPS.includes(m.id));
  if (keep.length && keep.length !== maps.length) { maps = keep; restoredDefaults = true; }
  // 專案資料中若有瀏覽器暫存缺少的地圖，只補上缺少的項目，保留使用者目前的編輯內容。刪掉的地圖不補回來。
  EDITOR_SOURCE_MAPS.forEach(defaultMap => {
    if (deletedMapIds.has(defaultMap.id)) return;
    if (!maps.some(map => map.id === defaultMap.id)) {
      maps.push(clone(defaultMap));
      restoredDefaults = true;
    }
  });
  maps.forEach(fixMap);
  if (restoredDefaults || (sharedMaps && sharedMaps.length)) EditorStore.setItem(STORAGE_MAPS, JSON.stringify(maps));
  curId = maps[0].id;
}
// 補齊欄位；把舊格式一次性遷移（tiles平面→layers.floor；walls→solid）
function fixMap(m) {
  if (!m.layers) { m.layers = {}; if (m.tiles) m.layers.floor = m.tiles; }
  if (m.layers.deco) { m.layers.object = Object.assign({}, m.layers.object || {}, m.layers.deco); delete m.layers.deco; }  // 舊「裝飾層」併入「物件」
  layersOf(m).forEach(l => { m.layers[l.id] = m.layers[l.id] || {}; });
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
  delete m.entrances;   // 舊的波次入口：已經不用了
  m.camp = m.camp || [];
  m.coreSpots = Array.isArray(m.coreSpots) ? [...new Set(m.coreSpots)] : [];
  m.spawnZone = Array.isArray(m.spawnZone) ? [...new Set(m.spawnZone)] : [];   // 怪物出生區（空的＝照舊：黑暗處都可能生怪）
  m.coreCount = m.coreCount != null && Number.isFinite(Number(m.coreCount))
    ? Math.max(1, Math.min(20, Math.floor(Number(m.coreCount))))
    : Math.max(1, Math.min(20, Math.floor(Number(m.difficulty) || 1)));
  m.rules = Object.assign({
    money: 3000, guide: 100, guideRegen: 9,
    speed: 44, reward: 8,   // 舊地圖（沒設定怪物組合）的史萊姆速度與獎勵
  }, m.rules || {});
  for (const k of ["waves", "count", "countAdd", "hp", "hpAdd", "speedAdd", "gap", "gapSub", "lives"]) delete m.rules[k];   // 舊的波次規則：已經不用了
  m.name = m.name || '未命名地圖'; m.desc = m.desc || '';
  m.solidOffsets = m.solidOffsets || {};   // 不可穿透格的像素微調：'c,r' → [dx, dy]
  Object.keys(m.solidOffsets).forEach(k => { if (m.solid.indexOf(k) < 0) delete m.solidOffsets[k]; });   // 沒有紅格就不留微調
  m.safe = !!m.safe;   // 安全場景：遊戲裡不生怪、不套黑幕
  m.npcs = !!m.npcs;   // 場景 NPC：這張地圖會不會出現克莉思、路德等人
  if (m.story) m.story = true; else delete m.story;   // 劇情地圖（時間暫停）：只有溫特一個人進來看劇情（js/maploader.js 的 MAP_STORY）
  m.portals = Array.isArray(m.portals) ? m.portals : [];   // 出入口：[{c,r,to:目標地圖id}]
  m.cols = m.cols || 32; m.rows = m.rows || 18;   // 地圖大小（舊地圖沒存就用預設）
  return m;
}
// ---- 遊戲畫質：畫布用跟遊戲一樣的放大倍率畫（js/config.js 的 VIEW_ZOOM，1.5 倍＝一格 60px）----
// 遊戲裡地圖放大 1.5 倍，60px 的素材剛好 1 個像素對 1 個像素；編輯器原本一格只畫 40px，
// 60px 的素材被縮小，有的 1px 線會不見、有的會變 2px。打開這個就能看到素材在遊戲裡真正的樣子（點擊、擺放都照常）。
const EDITOR_RES_KEY = 'tudrc_map_editor_game_res';
let EDITOR_RES = (() => { try { return localStorage.getItem(EDITOR_RES_KEY) === '1' ? (typeof VIEW_ZOOM !== 'undefined' ? VIEW_ZOOM : 1.5) : 1; } catch (_) { return 1; } })();
// 依目前地圖的大小調整格數與畫布（畫布太大時外框會出現捲軸）
function applyMapSize() {
  const m = curMap();
  syncLayers(); renderLayers();   // 每張地圖的圖層可能不一樣
  COLS = m.cols; ROWS = m.rows;
  const w = Math.round(COLS * CELL * EDITOR_RES), h = Math.round(ROWS * CELL * EDITOR_RES);   // 遊戲畫質：畫布的像素變多，顯示大小不變
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
  const maxHeight = parseFloat(getComputedStyle(wrap).maxHeight);
  const availH = Math.max(120, (Number.isFinite(maxHeight) ? maxHeight : window.innerHeight * 0.88) - 20);
  return Math.max(0.1, Math.min(1, Math.min(availW / (COLS * CELL), availH / (ROWS * CELL))));
}
function applyZoom() {
  if (!editorZoom) editorZoom = fitZoom();
  cv.style.maxWidth = 'none';
  cv.style.width = Math.round(COLS * CELL * editorZoom) + 'px';   // 顯示大小照地圖的格數算（遊戲畫質打開也一樣大）
  cv.style.height = Math.round(ROWS * CELL * editorZoom) + 'px';
  const lbl = document.getElementById('zoomLabel');
  if (lbl) lbl.textContent = Math.round(editorZoom * 100) + '%';
}
function setZoom(z) { editorZoom = Math.max(0.1, Math.min(3, z)); applyZoom(); }
document.getElementById('zoomIn').onclick = () => setZoom(editorZoom * 1.25);
document.getElementById('zoomOut').onclick = () => setZoom(editorZoom / 1.25);
document.getElementById('zoomFit').onclick = () => { editorZoom = fitZoom(); applyZoom(); };
document.getElementById('zoom100').onclick = () => setZoom(1);
// 「🎮 遊戲畫質」按鈕（放在 1:1 旁邊）：打開＝畫布跟遊戲一樣 1.5 倍，並縮放到跟遊戲一樣大（畫面上 1 個像素＝素材 1 個像素）
(() => {
  const z = document.getElementById('zoom100'); if (!z) return;
  const b = document.createElement('button'); b.className = 'btn'; b.id = 'gameRes';
  b.title = '用跟遊戲一樣的放大倍率畫地圖（一格 60px）：素材的細線不會被縮掉或變粗，看到的就是遊戲裡的樣子';
  const label = () => { b.textContent = EDITOR_RES > 1 ? '🎮 遊戲畫質：開' : '🎮 遊戲畫質：關'; b.setAttribute('aria-pressed', String(EDITOR_RES > 1)); };
  b.onclick = () => {
    EDITOR_RES = EDITOR_RES > 1 ? 1 : (typeof VIEW_ZOOM !== 'undefined' ? VIEW_ZOOM : 1.5);
    try { localStorage.setItem(EDITOR_RES_KEY, EDITOR_RES > 1 ? '1' : '0'); } catch (_) {}
    label(); applyMapSize();
    if (EDITOR_RES > 1) setZoom(EDITOR_RES);   // 跟遊戲一樣大
    draw();
  };
  label(); z.after(b);
})();
// Alt＋滑鼠滾輪：在地圖上直接縮放（往上滾＝放大、往下滾＝縮小），以滑鼠所在的位置為中心
document.getElementById('wrap').addEventListener('wheel', e => {
  if (!e.altKey || !e.deltaY) return;
  e.preventDefault();
  const wrap = e.currentTarget, rect = wrap.getBoundingClientRect();
  const mx = e.clientX - rect.left, my = e.clientY - rect.top;   // 滑鼠在地圖框裡的位置
  const old = editorZoom;
  const wx = (wrap.scrollLeft + mx - cv.offsetLeft) / old, wy = (wrap.scrollTop + my - cv.offsetTop) / old;   // 滑鼠指著地圖的哪一點
  setZoom(editorZoom * (e.deltaY < 0 ? 1.1 : 1 / 1.1));
  wrap.scrollLeft = wx * editorZoom + cv.offsetLeft - mx;   // 縮放後讓同一點還在滑鼠底下
  wrap.scrollTop = wy * editorZoom + cv.offsetTop - my;
}, { passive: false });
document.getElementById('expandEditor')?.addEventListener('click', () => {
  const expanded = document.body.classList.toggle('wide-editor');
  const button = document.getElementById('expandEditor');
  button.textContent = expanded ? '↙ 還原編輯區' : '⛶ 放大編輯區';
  button.setAttribute('aria-pressed', String(expanded));
  // 保留縮放倍率和目前編輯位置，只增加可見空間。
});
// 地圖暫存放在瀏覽器資料庫（js/map-editor-store.js）；寫入失敗要大聲提醒
function saveMaps() {
  saveDeletedMaps();   // 刪掉的地圖記下來；復原回來的拿掉記號
  EditorStore.setItem(STORAGE_MAPS, JSON.stringify(maps)).catch(e => setStatus('⚠️ 自動存檔失敗（' + (e && e.name || e) + '）：請馬上按「💾 存到專案」或「下載」保存！', '#ff8f8f'));
  setStatus('已自動存檔 ✓', '#7ee0c0');
  if (typeof refreshStorageInfoSoon === 'function') refreshStorageInfoSoon();
  refreshLayerListSoon();   // 圖層的物件清單、物件數量跟著更新
}
const curMap = () => maps.find(m => m.id === curId) || maps[0];

function setStatus(text, color) { const el = document.getElementById('status'); el.textContent = text; el.style.color = color || '#7ee0c0'; }

// ================= 回復（Undo / Ctrl+Z）=================
let undoStack = [], redoStack = [], redoBaseSnapshot = null;
function snapshot() { return JSON.stringify({ maps, tiles: customTiles, curId }); }
function pushUndo() {
  const current = snapshot();
  if (redoStack.length && current !== redoBaseSnapshot) redoStack = [];
  undoStack.push(current); if (undoStack.length > 60) undoStack.shift();
}
function undo() {
  if (!undoStack.length) { setStatus('沒有可回復的步驟了', '#9aa4b2'); return; }
  if (redoStack.length && snapshot() !== redoBaseSnapshot) redoStack = [];
  redoStack.push(snapshot());
  restoreEditorSnapshot(undoStack.pop());
  redoBaseSnapshot = snapshot();
  setStatus('已回復上一步（還剩 ' + undoStack.length + ' 步可回復）', '#7ee0c0');
}
function redo() {
  if (snapshot() !== redoBaseSnapshot) redoStack = [];
  if (!redoStack.length) { setStatus('沒有可重做的步驟了', '#9aa4b2'); return; }
  undoStack.push(snapshot()); if (undoStack.length > 60) undoStack.shift();
  restoreEditorSnapshot(redoStack.pop());
  redoBaseSnapshot = snapshot();
  setStatus('已重做上一步（還剩 ' + redoStack.length + ' 步可重做）', '#7ee0c0');
}
function restoreEditorSnapshot(value) {
  const s = JSON.parse(value);
  maps = s.maps; customTiles = s.tiles; curId = s.curId;
  for (const [id, tile] of foreignTiles) if (!customTiles.some(x => x.id === id)) customTiles.push(tile);   // 另一個編輯器加的素材留著
  selection = null; selections = [];
  if (!maps.some(m => m.id === curId)) curId = maps[0].id;
  if (!tileById(brush.tile)) brush = { mode: brush.mode, tile: 'floor' };
  saveDeletedMaps();   // 復原／重做刪除地圖：「已刪除」記號跟著更新
  EditorStore.setItem(STORAGE_MAPS, JSON.stringify(maps));
  saveTiles();   // 素材庫共用：回復後的素材也同步給另一個編輯器
  checkResult = null;
  applyMapSize(); refreshMapSelect(); renderPalette(); loadRules(); draw();
}
// ---- 複製／貼上（Ctrl+C／Ctrl+V）：把選取的物件（可以多選）整組複製，貼在滑鼠所在的格子 ----
// ・貼上時整組的形狀不變：整組最左上的那一格對到滑鼠的格子（大圖的格內微調 ox、oy 照抄）；滑鼠不在地圖上就貼在原本那組的右邊
// ・同一層同一格已經有小圖的話會蓋過去（跟貼圖一樣）；貼好的那一組會變成選取狀態，可以直接拖曳、再貼、或刪除
// ・剪貼簿只存在這個編輯器頁面裡（可以貼到別張地圖）；Ctrl+Z 可以復原
let editorClipboard = null;
function copySelection() {
  const m = curMap(), items = [];
  for (const sel of selections) {
    if (sel.type === 'stamp') { const s = m.stamps[sel.index]; if (s) items.push({ stamp: clone(s) }); }
    else { const id = m.layers[sel.layer] && m.layers[sel.layer][sel.key]; if (!id) continue; const [c, r] = sel.key.split(',').map(Number); items.push({ tile: { layer: sel.layer, c, r, id } }); }
  }
  if (!items.length) return;
  const cs = items.map(it => (it.stamp || it.tile).c), rs = items.map(it => (it.stamp || it.tile).r);
  editorClipboard = { items, c0: Math.min(...cs), r0: Math.min(...rs), w: Math.max(...cs) - Math.min(...cs) + 1, from: [Math.min(...cs), Math.min(...rs)] };
  setStatus('已複製 ' + items.length + ' 個物件（Ctrl+V 貼在滑鼠的位置）', '#7ee0c0');
}
function pasteClipboard() {
  const cb = editorClipboard; if (!cb || !cb.items.length) { setStatus('還沒有複製東西（先選取，再按 Ctrl+C）', '#ffd24a'); return; }
  const m = curMap();
  const [tc, tr] = hoverCell || [cb.from[0] + cb.w, cb.from[1]];   // 滑鼠不在地圖上：貼在原本那組的右邊
  const dc = tc - cb.c0, dr = tr - cb.r0, layerOk = lid => m.layers[lid] ? lid : activeLayer;   // 貼到別張地圖、沒有那個圖層：改放目前圖層
  pushUndo();
  const picked = []; let skipped = 0;
  for (const it of cb.items) {
    if (it.tile) {
      const c = it.tile.c + dc, r = it.tile.r + dr, lid = layerOk(it.tile.layer);
      if (!inGrid(c, r) || isLockedLayer(lid) || hiddenLayers.has(lid)) { skipped++; continue; }
      (m.layers[lid] = m.layers[lid] || {})[c + ',' + r] = it.tile.id;
      picked.push({ type: 'tile', layer: lid, key: c + ',' + r });
    } else {
      const s = clone(it.stamp); s.c += dc; s.r += dr; s.layer = layerOk(s.layer || 'top');
      if (!inGrid(s.c, s.r) || isLockedLayer(s.layer) || hiddenLayers.has(s.layer)) { skipped++; continue; }
      m.stamps.push(s); picked.push({ type: 'stamp', index: m.stamps.length - 1 });
    }
  }
  if (brush.mode !== 'select') { brush = { mode: 'select', tile: brush.tile }; updateToolUI(); renderPalette(); }
  selections = picked; selection = picked[picked.length - 1] || null;
  saveMaps(); draw(); refreshSelPanel(); refreshLayerListSoon();
  setStatus('已貼上 ' + picked.length + ' 個物件' + (skipped ? '（' + skipped + ' 個超出地圖或圖層鎖住／隱藏，沒貼）' : '') + '，Ctrl+Z 可以復原', '#7ee0c0');
}
window.addEventListener('keydown', e => {
  const inField = /^(input|textarea)$/i.test(e.target.tagName || '');
  if (!inField && e.key === 'Alt' && !tempTool) { e.preventDefault(); enterTemp('pick'); return; }
  if (!inField && (e.key === 'Control' || e.key === 'Meta') && !tempTool) { enterTemp('select'); return; }
  if ((e.ctrlKey || e.metaKey) && !e.shiftKey && (e.key === 'z' || e.key === 'Z')) { if (inField) return; e.preventDefault(); undo(); }
  if ((e.ctrlKey || e.metaKey) && !inField && ((e.key.toLowerCase() === 'y') || (e.shiftKey && e.key.toLowerCase() === 'z'))) { e.preventDefault(); redo(); return; }
  if ((e.ctrlKey || e.metaKey) && !inField && !e.shiftKey && !e.altKey && e.key.toLowerCase() === 'c') { if (selections.length) { e.preventDefault(); copySelection(); } return; }   // 複製選取的物件
  if ((e.ctrlKey || e.metaKey) && !inField && !e.shiftKey && !e.altKey && e.key.toLowerCase() === 'v') { e.preventDefault(); pasteClipboard(); return; }   // 貼在滑鼠的位置
  if (e.key === 'Delete' && !inField && selections.length) { e.preventDefault(); deleteSelection(); }
  if (!inField && (e.key === 'f' || e.key === 'F')) { e.preventDefault(); flipAction('x'); }
  // 工具快捷鍵：Q＝選取、E＝清除、I＝吸管（上下翻沒有快捷鍵，請點按鈕）
  const toolKey = { q: 'select', e: 'erase', i: 'pick' }[String(e.key).toLowerCase()];
  if (!inField && toolKey && !e.ctrlKey && !e.metaKey && !e.altKey && !tempTool) {
    e.preventDefault();
    const btn = document.querySelector('.tool[data-mode="' + toolKey + '"]'); if (btn) btn.click();
    return;
  }
  if (!inField && (e.key === 'r' || e.key === 'R')) { e.preventDefault(); rotateAction(); }
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
      s.ox = (s.ox || 0) + dx; s.oy = (s.oy || 0) + dy;   // 只動圖片，不可穿透格不跟著動
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
  'images/street',
  'images/池核',
  'images/Poolcore',   // 池核素材資料夾改名成英文（舊路徑的素材也找得到）
  'images/指揮部',
  'images/研究部',
  'images/地下訓練室',
  'images/回憶場景',
  'images/field-camp',
  'images/scene-props',
];   // 上傳的圖不在這些資料夾裡：會把整張圖嵌進素材庫（data:），之後改圖檔不會更新，所以新資料夾要加在這裡
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
// 圖片載入完成後要重畫地圖與素材清單。幾百張圖會陸續載入，
// 每張都立刻重畫會讓開啟編輯器卡上好幾十秒，所以合併成「每一幀最多重畫一次」。
let tileRefreshQueued = false;
function queueTileRefresh() {
  if (tileRefreshQueued) return;
  tileRefreshQueued = true;
  requestAnimationFrame(() => { tileRefreshQueued = false; draw(); renderPalette(); });
}
function ensureTileImg(t) {
  if (!t.file) return null;
  if (tileImgCache[t.id]) return tileImgCache[t.id];
  const img = new Image(); const rec = { img, loaded: false, error: false, source: '' };
  const sources = tileImageSources(t.file);
  let sourceIndex = 0;
  const tryNext = () => {
    if (sourceIndex >= sources.length) { rec.error = true; queueTileRefresh(); return; }
    rec.source = sources[sourceIndex++];
    img.src = rec.source;
  };
  img.onload = () => {
    rec.loaded = true; rec.error = false;
    if (t.file !== rec.source) { t.file = rec.source; saveTiles(); }
    queueTileRefresh();
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
// 這些小道具的圖不是正方形：在編輯器裡照原本的比例畫在格子正中間，不拉長、不壓扁（佔地格數不變）
const KEEP_RATIO_TILES = new Set([
  'tile_interactive_storage_locker_key',         // 置物箱鑰匙
  'tile_interactive_pickup_backroom_door_key',   // 後室門鑰匙
  'tile_interactive_pickup_almond_water',        // 杏仁水
  'tile_interactive_pickup_adrenaline',          // 腎上腺素
  'tile_interactive_pickup_battery',             // 電池
]);
// 在 w×h 的框裡，圖片照原比例能畫多大（置中）
function fitInBox(img, x, y, w, h) {
  const iw = img.naturalWidth || img.width || w, ih = img.naturalHeight || img.height || h;
  const k = Math.min(w / iw, h / ih), dw = iw * k, dh = ih * k;
  return [x + (w - dw) / 2, y + (h - dh) / 2, dw, dh];
}
// 道具的亮藍色發光邊：沿著圖案外形描一圈約 2px 的亮藍色（只在編輯器裡顯示，讓人一眼看出這是可以撿的道具）
const ITEM_GLOW_COLOR = '#4fd8ff';
const ITEM_GLOW_PX = 2;
const itemGlowCache = new WeakMap();   // 圖片 → 塗成亮藍色的剪影（只做一次）
function itemSilhouette(img) {
  let sil = itemGlowCache.get(img);
  if (sil) return sil;
  sil = document.createElement('canvas');
  sil.width = img.naturalWidth || img.width; sil.height = img.naturalHeight || img.height;
  const g = sil.getContext('2d');
  g.drawImage(img, 0, 0);
  g.globalCompositeOperation = 'source-in';   // 只留圖案的形狀，整塊塗成亮藍色
  g.fillStyle = ITEM_GLOW_COLOR; g.fillRect(0, 0, sil.width, sil.height);
  itemGlowCache.set(img, sil);
  return sil;
}
// 在圖案底下先畫發光邊（之後再把圖案本身蓋在上面）
function drawItemGlow(img, x, y, w, h) {
  const sil = itemSilhouette(img), d = ITEM_GLOW_PX;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.shadowColor = ITEM_GLOW_COLOR; ctx.shadowBlur = 6;   // 外圍再柔柔地亮一點
  ctx.drawImage(sil, x, y, w, h);
  ctx.shadowBlur = 0;
  for (const [dx, dy] of [[-d, 0], [d, 0], [0, -d], [0, d], [-d, -d], [d, -d], [-d, d], [d, d]]) ctx.drawImage(sil, x + dx, y + dy, w, h);
  ctx.restore();
}
// 畫 1×1 小圖（有圖用圖，沒圖用色塊佔位）
function drawTile(id, x, y) {
  const t = tileById(id);
  if (!t) return;
  if (t.color) { ctx.fillStyle = t.color; ctx.fillRect(x, y, CELL, CELL); return; }
  if (t.file) { const rec = ensureTileImg(t); if (rec && rec.loaded) {
    if (KEEP_RATIO_TILES.has(t.id)) { const box = fitInBox(rec.img, x, y, CELL, CELL); drawItemGlow(rec.img, ...box); ctx.drawImage(rec.img, ...box); }
    else ctx.drawImage(rec.img, x, y, CELL, CELL);
    return;
  } }
  if (t.role === 'wall') {
    ctx.fillStyle = '#3f434b'; ctx.fillRect(x + 2, y + 2, CELL - 4, CELL - 4);
    ctx.strokeStyle = '#565b64'; ctx.lineWidth = 2; ctx.strokeRect(x + 5, y + 5, CELL - 10, CELL - 10);
  } else if (t.role === 'obstacle') {
    ctx.fillStyle = '#7a5a3a'; roundRect(x + 4, y + 4, CELL - 8, CELL - 8, 5); ctx.fill();
    ctx.strokeStyle = '#5a4128'; ctx.lineWidth = 2; ctx.stroke();
  } else { ctx.fillStyle = '#20262f'; ctx.fillRect(x, y, CELL, CELL); }
}
// 畫圖片（可左右／上下翻轉）
// keepRatio＝照圖片原本的比例畫在框的正中間（不變形），並加上道具的亮藍色發光邊
function drawImageFlipped(img, x, y, w, h, fx, fy, rot = 0, keepRatio = false) {
  if (!fx && !fy && !rot) { if (keepRatio) { const box = fitInBox(img, x, y, w, h); drawItemGlow(img, ...box); ctx.drawImage(img, ...box); } else ctx.drawImage(img, x, y, w, h); return; }
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  if (rot) ctx.rotate(rot * Math.PI / 2);
  ctx.scale(fx ? -1 : 1, fy ? -1 : 1);
  const iw = rot % 2 ? h : w, ih = rot % 2 ? w : h;
  if (keepRatio) { const [, , dw, dh] = fitInBox(img, 0, 0, iw, ih); drawItemGlow(img, -dw / 2, -dh / 2, dw, dh); ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh); }
  else ctx.drawImage(img, -iw / 2, -ih / 2, iw, ih);
  ctx.restore();
}
// 畫多格大圖
// 混合模式、不透明度（選物件時設定，存在 stamp 上；遊戲照一樣的方式畫，見 js/maploader.js 的 drawMapStampImg）
function drawStamp(s) {
  const alpha = Number.isFinite(s.alpha) && s.alpha < 100 ? Math.max(0, s.alpha) / 100 : 1;
  if (!s.blend && alpha === 1) drawStampRaw(s);
  else { ctx.save(); if (s.blend) ctx.globalCompositeOperation = s.blend; ctx.globalAlpha *= alpha; drawStampRaw(s); ctx.restore(); }
  if (s.glow) {   // 發光：畫一圈淡淡的虛線，標出照亮的範圍（只在編輯器裡看得到）
    const t = tileById(s.id) || {}, cx = OX + s.c * CELL + (s.ox || 0) + stampW(s, t) * CELL / 2, cy = OY + s.r * CELL + (s.oy || 0) + stampH(s, t) * CELL / 2;
    ctx.save(); ctx.setLineDash([6, 5]); ctx.strokeStyle = 'rgba(255,214,102,.55)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, cy, s.glowR > 0 ? s.glowR : 160, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
  }
}
function drawStampRaw(s) {
  const t = tileById(s.id); if (!t) return;
  const drawW = stampW(s, t) * CELL, drawH = stampH(s, t) * CELL;
  const x = OX + s.c * CELL + (s.ox || 0), y = OY + s.r * CELL + (s.oy || 0);
  if (t.color) { ctx.fillStyle = t.color; ctx.fillRect(x, y, drawW, drawH); return; }
  const rot = stampTurn(s);
  if (t.file) { const rec = ensureTileImg(t); if (rec && rec.loaded) { drawImageFlipped(rec.img, x, y, drawW, drawH, s.fx, s.fy, rot, KEEP_RATIO_TILES.has(t.id)); return; } }
  ctx.fillStyle = t.role === 'wall' ? '#3f434b' : (t.role === 'obstacle' ? '#7a5a3a' : '#2b3446');
  ctx.fillRect(x + 2, y + 2, drawW - 4, drawH - 4);
  ctx.strokeStyle = '#8fd3ff'; ctx.lineWidth = 1; ctx.strokeRect(x + 2, y + 2, drawW - 4, drawH - 4);
  ctx.fillStyle = '#c3ccd8'; ctx.font = '11px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(t.name, x + drawW / 2, y + drawH / 2);
}

// 基地碰撞以「每次擺放的 stamp」為單位保存；舊地圖沒有資料時沿用素材預設。
function baseSolidForStamp(s, t) {
  if (Array.isArray(s.baseSolid)) return s.baseSolid;
  const w = tileW(t), h = tileH(t);
  const cells = rotateBaseCells(clone(t.baseSolid || []), w, h, stampTurn(s));
  return cells.map(([dc, dr]) => [s.fx ? stampW(s, t) - 1 - dc : dc, s.fy ? stampH(s, t) - 1 - dr : dr]);
}
function rotateBaseCells(cells, w, h, rot) {
  return cells.map(([c, r]) => rot === 1 ? [h - 1 - r, c] : rot === 2 ? [w - 1 - c, h - 1 - r] : rot === 3 ? [r, w - 1 - c] : [c, r]);
}

// ================= 畫布繪製 =================
let showGrid = true;    // 格線開關（可用工具列按鈕切換）
let showSolid = false;       // 不可穿透紅格的顯示開關（只影響顯示，設定本身不變）；載入／重新整理時預設關著
let solidNudgeCell = null;   // 目前用「碰撞微調」選中的紅格（'c,r'）
function draw() {
  const m = curMap();
  const solid = new Set(m.solid), breakable = new Set(m.breakable);
  const coreSpots = new Set(m.coreSpots), spawnZone = new Set(m.spawnZone || []);

  ctx.setTransform(EDITOR_RES, 0, 0, EDITOR_RES, 0, 0);   // 遊戲畫質：放大畫（座標照舊用一格 40）
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, COLS * CELL, ROWS * CELL);
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
    if (showSolid && spawnZone.has(key)) {   // 怪物出生區與紅格共用顯示開關
      ctx.fillStyle = 'rgba(80,220,120,.22)'; ctx.fillRect(x, y, CELL, CELL);
      ctx.strokeStyle = 'rgba(120,255,160,.75)'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]);
      ctx.strokeRect(x + 2.5, y + 2.5, CELL - 5, CELL - 5); ctx.setLineDash([]);
      ctx.globalAlpha = .7; ctx.font = '14px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('👾', x + CELL / 2, y + CELL / 2); ctx.textBaseline = 'alphabetic'; ctx.globalAlpha = 1;
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
  if (showSolid && (brush.mode === 'spawn' || (m.spawnZone || []).length)) {
    ctx.fillStyle = '#8cf5b0';
    ctx.fillText('👾 怪物出生區 ' + (m.spawnZone || []).length + ' 格' + ((m.spawnZone || []).length ? '' : '（沒畫＝黑暗處都可能生怪）'), OX + 6, OY + 34);
  }
  // 電路編號（開關、電燈右上角的黃色小圓牌）
  for (const s of (m.stamps || [])) {
    if (!s.circuit) continue;
    const x = OX + s.c * CELL + (s.ox || 0) + CELL - 6, y = OY + s.r * CELL + (s.oy || 0) + 6;
    ctx.fillStyle = '#ffd66e'; ctx.strokeStyle = '#3a2a08'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#3a2a08'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(String(s.circuit), x, y + .5); ctx.textBaseline = 'alphabetic';
  }
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
      const pw = brushRotation % 2 ? h : w, ph = brushRotation % 2 ? w : h;
      const fits = c < COLS && r < ROWS && c + pw > 0 && r + ph > 0;   // 允許超出邊緣（純外觀），只要有一格在地圖內
      // 物件：預覽畫在四分之一格對齊的位置（跟實際放下去的一樣）；地板類小圖照整格
      const free = big || brushFlip.fx || brushFlip.fy || brushRotation || isObjectLayer(activeLayer);
      const pos = free && pointerPx ? subPosAt(pointerPx.x, pointerPx.y) : { c, r, ox: 0, oy: 0 };
      const px = OX + pos.c * CELL + pos.ox, py = OY + pos.r * CELL + pos.oy;
      // 半透明預覽圖
      ctx.save();
      ctx.globalAlpha = 0.4;
      if (big || brushFlip.fx || brushFlip.fy || brushRotation) drawStamp({ c: pos.c, r: pos.r, ox: pos.ox, oy: pos.oy, id: brush.tile, fx: brushFlip.fx, fy: brushFlip.fy, rot: brushRotation });
      else drawTile(brush.tile, px, py);
      ctx.restore();
      // 外框（放不下時變紅）
      if (big) {
        ctx.strokeStyle = fits ? '#8fd3ff' : '#ff5b5b'; ctx.lineWidth = 2; ctx.setLineDash([6, 4]);
        ctx.strokeRect(px + 1, py + 1, pw * CELL - 2, ph * CELL - 2); ctx.setLineDash([]);
      } else {
        ctx.strokeStyle = '#8fd3ff'; ctx.lineWidth = 2; ctx.strokeRect(px + 1, py + 1, CELL - 2, CELL - 2);
      }
    } else {
      // 非貼圖工具（選取／不可穿透／清除等）維持單格外框
      ctx.strokeStyle = '#8fd3ff'; ctx.lineWidth = 2; ctx.strokeRect(OX + c * CELL + 1, OY + r * CELL + 1, CELL - 2, CELL - 2);
    }
  }
  // 選取高亮（黃色虛線框）
  for (const selected of selections) {
    let rx = null, ry = 0, rw = CELL, rh = CELL;
    if (selected.type === 'stamp') { const s = m.stamps[selected.index]; if (s) { const t = tileById(s.id) || {}; rx = OX + s.c * CELL + (s.ox || 0); ry = OY + s.r * CELL + (s.oy || 0); rw = stampW(s, t) * CELL; rh = stampH(s, t) * CELL; } }
    else { const [c, r] = selected.key.split(',').map(Number); rx = OX + c * CELL; ry = OY + r * CELL; }
    if (rx != null) { ctx.strokeStyle = '#ffe14d'; ctx.lineWidth = 3; ctx.setLineDash([7, 4]); ctx.strokeRect(rx + 1.5, ry + 1.5, rw - 3, rh - 3); ctx.setLineDash([]); }
  }
  // 選到基地時、或拿著「不可穿透」筆刷時，把基地目前的碰撞格直接疊在基地圖上，所見即所得。
  const baseOverlay = brush.mode === 'solid' ? m.stamps.map((s, i) => i).filter(i => (tileById(m.stamps[i].id) || {}).baseHp)
    : selections.length === 1 && selections[0].type === 'stamp' ? [selections[0].index] : [];
  for (const bi of baseOverlay) {
    const s = m.stamps[bi], t = s && tileById(s.id);
    if (s && t && t.baseHp) {
      for (const [dc, dr] of baseSolidForStamp(s, t)) {
        const x = OX + (s.c + dc) * CELL + (s.ox || 0), y = OY + (s.r + dr) * CELL + (s.oy || 0);
        ctx.fillStyle = 'rgba(235,55,55,.34)'; ctx.fillRect(x, y, CELL, CELL);
        ctx.strokeStyle = '#ff6b6b'; ctx.lineWidth = 2; ctx.strokeRect(x + 2, y + 2, CELL - 4, CELL - 4);
      }
      const depth = Number.isFinite(s.baseDepth) ? s.baseDepth : (Number.isFinite(t.baseDepth) ? t.baseDepth : Math.max(1, stampH(s, t) - 2));
      const x = OX + s.c * CELL + (s.ox || 0), y = OY + s.r * CELL + (s.oy || 0) + depth * CELL;
      ctx.strokeStyle = '#55d9ff'; ctx.lineWidth = 3; ctx.setLineDash([9, 5]);
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + stampW(s, t) * CELL, y); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#55d9ff'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
      ctx.fillText('深度線 ' + depth, x + 5, y - 4);
    } else if (s && t && (Number.isFinite(s.sortDepth) || (!t.flat && (s.layer || 'top') !== 'top' && (stampH(s, t) > 1 || /^object\d*$/.test(s.layer || '') || s.layer === 'overlay')))) {
      const depth = Number.isFinite(s.sortDepth) ? s.sortDepth : stampH(s, t);
      const x = OX + s.c * CELL + (s.ox || 0), y = OY + s.r * CELL + (s.oy || 0) + depth * CELL;
      ctx.strokeStyle = '#55d9ff'; ctx.lineWidth = 3; ctx.setLineDash([9, 5]);
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + stampW(s, t) * CELL, y); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#55d9ff'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
      ctx.fillText('人物遮擋線 ' + depth, x + 5, y - 4);
    }
  }
  drawLocateFlash();   // 從圖層物件清單選取時，物件周圍閃一個圈
}

// ================= 可翻轉圖片放置 / 查詢 =================
function placeStamp(c, r, t, ox = 0, oy = 0) {
  const m = curMap(), w = tileW(t), h = tileH(t), pw = brushRotation % 2 ? h : w, ph = brushRotation % 2 ? w : h;
  if (c >= COLS || r >= ROWS || c + pw <= 0 || r + ph <= 0) { setStatus('放不下：整張圖都在地圖外', '#ff8f8f'); return; }   // 允許超出邊緣（大圖純外觀），只要有一格落在地圖內就能放
  // 只移除「同一圖層」上跟新圖重疊超過一半的圖（不同層可疊放；靠得很近、只碰到一點邊的保留）
  const nx = c * CELL + ox, ny = r * CELL + oy, nw = pw * CELL, nh = ph * CELL;
  m.stamps = m.stamps.filter(s => {
    if ((s.layer || 'top') !== activeLayer) return true;
    const st = tileById(s.id) || {}, sx = s.c * CELL + (s.ox || 0), sy = s.r * CELL + (s.oy || 0), sw = stampW(s, st) * CELL, sh = stampH(s, st) * CELL;
    const ow = Math.min(nx + nw, sx + sw) - Math.max(nx, sx), oh = Math.min(ny + nh, sy + sh) - Math.max(ny, sy);
    if (ow <= 0 || oh <= 0) return true;
    return ow * oh <= Math.min(nw * nh, sw * sh) / 2;
  });
  // 1×1 小圖翻轉後改用 stamp 儲存，先移除同格同層的普通小圖。
    if (w === 1 && h === 1) delete m.layers[activeLayer][c + ',' + r];
  const st = { id: t.id, c, r, layer: activeLayer };
  if (ox) st.ox = ox;
  if (oy) st.oy = oy;
  if (brushFlip.fx) st.fx = true;
  if (brushFlip.fy) st.fy = true;
  if (brushRotation) st.rot = brushRotation;
  if (t.baseHp) {
    st.baseHp = t.baseHp;
    const defaultDepth = Number.isFinite(t.baseDepth) ? t.baseDepth : Math.max(1, h - 2);
    st.baseDepth = brushFlip.fy ? ph - defaultDepth : defaultDepth;
    st.baseSolid = rotateBaseCells(clone(t.baseSolid || []), w, h, brushRotation).map(([dc, dr]) => [brushFlip.fx ? pw - 1 - dc : dc, brushFlip.fy ? ph - 1 - dr : dr]);
  }
  m.stamps.push(st);
  checkResult = null; saveMaps(); draw();
}
function stampIndexAt(m, c, r) {   // 上層優先（topStampIndex）
  return topStampIndex(m, (s, t) => c >= s.c && c < s.c + stampW(s, t) && r >= s.r && r < s.r + stampH(s, t));
}

// 吸管：偵測某格「最上層可見」的圖片 id（隱藏的圖層跳過）
function pickAt(m, c, r) {
  for (let i = LAYERS.length - 1; i >= 0; i--) {
    const lid = LAYERS[i].id;
    if (hiddenLayers.has(lid)) continue;
    for (let k = m.stamps.length - 1; k >= 0; k--) {
      const s = m.stamps[k]; if ((s.layer || 'top') !== lid) continue;
      const t = tileById(s.id) || {};
      if (c >= s.c && c < s.c + stampW(s, t) && r >= s.r && r < s.r + stampH(s, t)) return s.id;
    }
    const id = m.layers[lid] && m.layers[lid][c + ',' + r];
    if (id) return id;
  }
  return null;
}

// ================= 畫格子（依目前畫筆）=================
let spawnPaintAdd = true;   // 怪物出生區筆刷：這一筆是畫上還是擦掉
// 這一格在哪個基地（臨時基地）上：回傳 { s, t, dc, dr }（dc、dr＝在基地圖裡的第幾格）；沒有＝null
function baseAtCell(m, c, r) {
  for (let i = m.stamps.length - 1; i >= 0; i--) {
    const s = m.stamps[i], t = tileById(s.id);
    if (!t || !t.baseHp || hiddenLayers.has(s.layer || 'top') || isLockedLayer(s.layer)) continue;
    const c0 = s.c + Math.round((s.ox || 0) / CELL), r0 = s.r + Math.round((s.oy || 0) / CELL);
    const dc = c - c0, dr = r - r0;
    if (dc >= 0 && dr >= 0 && dc < stampW(s, t) && dr < stampH(s, t)) return { s, t, dc, dr };
  }
  return null;
}
function pushBaseSolidToggle(s, t, dc, dr) {   // 基地的這一格：阻擋 ⇄ 可走
  const cells = baseSolidForStamp(s, t).map(cell => cell.slice());
  const index = cells.findIndex(([x, y]) => x === dc && y === dr);
  if (index >= 0) cells.splice(index, 1); else cells.push([dc, dr]);
  s.baseSolid = cells;
  setStatus(index >= 0 ? '基地這格改成可走動' : '基地這格改成阻擋（可受攻擊）', index >= 0 ? '#7ee0c0' : '#ff8f8f');
}
function paintCell(c, r, isDown, additiveSelect = false) {
  if (!inGrid(c, r)) return;
  const m = curMap(), key = c + ',' + r;
  if (brush.mode === 'select') {
    if (isDown) {
      let picked = null;
      const si = pointerPx ? stampIndexAtPx(m, pointerPx.x, pointerPx.y) : stampIndexAt(m, c, r);   // 微調過的物件：點它畫出來的位置
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
        else { selectTile(id); pickedBrushPending = true; setStatus('已吸取「' + (t.name || id) + '」，筆刷已切換（按右鍵取消）', '#7ee0c0'); }
      } else setStatus('這格沒有圖片可吸取', '#ffd24a');
    }
    return;
  }
  checkResult = null;
  if (brush.mode === 'tile') {
    if (hiddenLayers.has(activeLayer)) { if (isDown) setStatus('「' + layerName(activeLayer) + '」被隱藏中，請先打開眼睛才能貼圖', '#ffd24a'); return; }
    if (isLockedLayer(activeLayer)) { if (isDown) setStatus('「' + layerName(activeLayer) + '」已鎖定，請先按 🔒 解鎖才能貼圖', '#ffd24a'); return; }
    const t = tileById(brush.tile); if (!t) return;
    const pos = pointerPx ? subPosAt(pointerPx.x, pointerPx.y) : { c, r, ox: 0, oy: 0 };   // 四分之一格對齊的位置
    if (isBig(t)) { if (isDown) placeStamp(pos.c, pos.r, t, pos.ox, pos.oy); return; }   // 大圖：只在按下時放一張
    if (brushFlip.fx || brushFlip.fy || brushRotation) { placeStamp(pos.c, pos.r, t, pos.ox, pos.oy); return; }   // 轉向小圖：以 1×1 stamp 保存方向
    if (isObjectLayer(activeLayer) && (pos.ox || pos.oy)) { placeStamp(pos.c, pos.r, t, pos.ox, pos.oy); return; }   // 物件圖層的小圖：沒對齊格線就存成可微調的物件
    // 普通小圖覆蓋同格同層的翻轉小圖，避免兩張疊在一起。
    m.stamps = m.stamps.filter(s => !((s.layer || 'top') === activeLayer && s.c === c && s.r === r && tileW(tileById(s.id) || {}) === 1 && tileH(tileById(s.id) || {}) === 1));
    m.layers[activeLayer][key] = brush.tile;                      // 小圖：貼到目前圖層
  } else if (brush.mode === 'solid' && baseAtCell(m, c, r)) {
    // 點在基地上：改的是基地自己的碰撞格（跟著基地走、可受攻擊），不是地圖的紅格
    const { s, t, dc, dr } = baseAtCell(m, c, r);
    pushBaseSolidToggle(s, t, dc, dr);
    if (selectedBaseStamp()) refreshBaseCollisionPanel();
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
  } else if (brush.mode === 'spawn') {
    m.spawnZone = m.spawnZone || [];
    if (isDown) spawnPaintAdd = !m.spawnZone.includes(key);   // 按下的那格決定這一筆是「畫」還是「擦」
    if (spawnPaintAdd && (m.solid.includes(key) || m.breakable.includes(key))) return;   // 牆、可破壞格不能生怪
    if (spawnPaintAdd) { if (!m.spawnZone.includes(key)) m.spawnZone.push(key); }
    else removeFrom(m.spawnZone, key);
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
    // 頁面上的選單（js/map-picker.js）：地圖多的時候 prompt() 會把清單截斷，後面的地圖選不到
    pickMapDialog('這個出入口要通到哪一張地圖？', others).then(to => {
      if (!to) return;
      m.portals.push({ c, r, to: to.id });
      saveMaps(); draw();
      setStatus('已設出入口 → ' + to.name, '#7ee0c0');
    });
    return;
  } else if (brush.mode === 'erase') {
    // 由上往下擦：大圖 → 最上面有圖的那層
    const si = pointerPx ? stampIndexAtPx(m, pointerPx.x, pointerPx.y) : stampIndexAt(m, c, r);
    if (si >= 0) m.stamps.splice(si, 1);
    else for (let i = LAYERS.length - 1; i >= 0; i--) { const id = LAYERS[i].id; if (!hiddenLayers.has(id) && !isLockedLayer(id) && m.layers[id][key]) { delete m.layers[id][key]; break; } }
  }
  saveMaps(); draw();
}

// ================= 滑鼠操作 =================
function cellFromEvent(e) {
  const rect = cv.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (COLS * CELL / rect.width);   // 照地圖的格數換算（遊戲畫質打開時畫布像素比較多）
  const y = (e.clientY - rect.top) * (ROWS * CELL / rect.height);
  pointerPx = { x, y };   // 物件擺放、選取用的像素位置
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
      items.push({ type: 'stamp', index: sel.index, c: s.c, r: s.r, w: stampW(s, t), h: stampH(s, t), px: s.c * CELL + (s.ox || 0), py: s.r * CELL + (s.oy || 0) });
    } else {
      const [tc, tr] = sel.key.split(',').map(Number);
      items.push({ type: 'tile', layer: sel.layer, key: sel.key, id: m.layers[sel.layer][sel.key], c: tc, r: tr, w: 1, h: 1 });
    }
  });
  if (!items.length) { selectionDrag = null; return; }
  const minC = Math.min(...items.map(item => item.c)), minR = Math.min(...items.map(item => item.r));
  const maxC = Math.max(...items.map(item => item.c + item.w)), maxR = Math.max(...items.map(item => item.r + item.h));
  selectionDrag = { startC: c, startR: r, startPx: pointerPx ? { ...pointerPx } : null, items, layers: clone(m.layers), stamps: clone(m.stamps), minC, minR, maxC, maxR, dc: 0, dr: 0, dx: 0, dy: 0, moved: false };   // 只搬圖片；不可穿透格、可破壞格留在原地
}
function dragSelectionTo(c, r) {
  if (!selectionDrag) return;
  const d = selectionDrag, m = curMap();
  // 允許拖出地圖邊緣（純外觀），只要選取範圍還有一格留在地圖內
  const dc = Math.max(1 - d.maxC, Math.min(COLS - 1 - d.minC, c - d.startC));
  const dr = Math.max(1 - d.maxR, Math.min(ROWS - 1 - d.minR, r - d.startR));
  // 物件：滑鼠移動多少就搬多少（四分之一格對齊）；限制在跟整格同樣的範圍內
  const clampPx = (v, lo, hi) => Math.max(lo * CELL, Math.min(hi * CELL, v));
  const step = snapWhole ? CELL : SUB;   // 只貼在整格：一次搬一整格
  const dx = d.startPx && pointerPx ? clampPx(Math.round((pointerPx.x - d.startPx.x) / step) * step, 1 - d.maxC, COLS - 1 - d.minC) : dc * CELL;
  const dy = d.startPx && pointerPx ? clampPx(Math.round((pointerPx.y - d.startPx.y) / step) * step, 1 - d.maxR, ROWS - 1 - d.minR) : dr * CELL;
  if (dc === d.dc && dr === d.dr && dx === d.dx && dy === d.dy) return;
  d.dc = dc; d.dr = dr; d.dx = dx; d.dy = dy; d.moved = dc !== 0 || dr !== 0 || dx !== 0 || dy !== 0;
  m.layers = clone(d.layers); m.stamps = clone(d.stamps);
  d.items.filter(item => item.type === 'tile').forEach(item => delete m.layers[item.layer][item.key]);
  selections = d.items.map(item => {
    if (item.type === 'stamp') {
      const s = m.stamps[item.index], whole = v => snapWhole ? Math.round(v / CELL) * CELL : v;   // 原本在半格上的物件，搬動後四捨五入到整格
      const nx = whole(item.px + dx), ny = whole(item.py + dy);
      s.c = Math.floor(nx / CELL); s.r = Math.floor(ny / CELL);
      const ox = nx - s.c * CELL, oy = ny - s.r * CELL;
      if (ox) s.ox = ox; else delete s.ox;
      if (oy) s.oy = oy; else delete s.oy;
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
  if (brush.mode === 'tile') pickedBrushPending = false;   // 吸管吸到的圖已經放下去了，右鍵就不再取消它
  playMapClickSound(); painting = true; cv.setPointerCapture(e.pointerId); pushUndo();
  const [c, r] = cellFromEvent(e); lastPaint = c + ',' + r; paintCell(c, r, true, e.shiftKey);
  if (!e.shiftKey) beginSelectionDrag(c, r);
});
cv.addEventListener('pointermove', e => {
  const [c, r] = cellFromEvent(e); hoverCell = inGrid(c, r) ? [c, r] : null;
  if (painting) {
    if (selectionDrag) dragSelectionTo(c, r);
    else { const key = c + ',' + r; if (key !== lastPaint) { lastPaint = key; paintCell(c, r, false); } }
  } else draw();   // 懸停預覽跟著四分之一格移動
});
cv.addEventListener('pointerup', () => {
  painting = false;
  if (selectionDrag && selectionDrag.moved) { saveMaps(); refreshSelPanel(); setStatus('已移動 ' + selections.length + ' 個物件', '#7ee0c0'); }
  selectionDrag = null;
  if (undoStack.length && undoStack[undoStack.length - 1] === snapshot()) undoStack.pop();
});
cv.addEventListener('pointerleave', () => { hoverCell = null; draw(); });

// ================= 滑鼠右鍵・中鍵拖曳畫面 =================
// 右鍵：不跳出瀏覽器原本的選單（另存圖片、複製圖片…），直接「取消選取物件」；正要蓋物品時＝取消那個物品、回到「選取」。
//      （打字的欄位裡還是保留瀏覽器原本的選單，才能複製、貼上文字）
// 中鍵：按住拖曳＝上下左右移動地圖畫面（不會跳出瀏覽器的自動捲動）。
// 右鍵、中鍵都不會在地圖上畫東西或選物件。
const isTypingField = el => !!(el && el.closest && el.closest('input, textarea, select, [contenteditable="true"]'));
document.addEventListener('contextmenu', e => {
  if (isTypingField(e.target)) return;
  e.preventDefault();
  // 吸管吸到的圖還沒放進地圖：取消這次複製，回到「選取」
  if (pickedBrushPending && brush.mode === 'tile') {
    pickedBrushPending = false;
    brush = { mode: 'select', tile: brush.tile }; updateToolUI(); renderPalette(); draw();
    setStatus('已取消吸管複製，回到「選取」', '#9aa4b2'); return;
  }
  // 還按著 Alt、已經吸到圖：放開 Alt 後回到「選取」，不會變成畫這張圖
  if (tempTool === 'pick' && pickResult) {
    pickResult = null; savedBrush = { mode: 'select', tile: (savedBrush || brush).tile };
    setStatus('已取消吸管複製（放開 Alt 回到「選取」）', '#9aa4b2'); return;
  }
  // 選了圖、正要蓋（滑鼠上是半透明預覽）：右鍵＝不蓋了，回到「選取」
  if (brush.mode === 'tile' && brush.tile) {
    brush = { mode: 'select', tile: brush.tile }; updateToolUI(); renderPalette(); draw();
    setStatus('已取消選取的物品，回到「選取」', '#9aa4b2'); return;
  }
  if (!selections.length && !selection) return;
  clearSelection(); setStatus('已取消選取', '#9aa4b2');
});

const panWrap = document.getElementById('wrap');
let middlePan = null;   // 中鍵拖曳中：{ x, y, left, top }＝按下時的滑鼠位置和捲動位置
// 搶在地圖畫布之前攔下右鍵和中鍵（capture＝先處理），畫布就不會把它們當成畫圖
panWrap.addEventListener('pointerdown', e => {
  if (e.button === 0) return;
  e.stopPropagation();
  if (e.button !== 1) return;   // 右鍵：只開選單（上面的 contextmenu 會處理）
  e.preventDefault();
  middlePan = { x: e.clientX, y: e.clientY, left: panWrap.scrollLeft, top: panWrap.scrollTop };
  panWrap.setPointerCapture(e.pointerId);
  panWrap.classList.add('panning');
}, true);
panWrap.addEventListener('pointermove', e => {
  if (!middlePan) return;
  e.stopPropagation();
  panWrap.scrollLeft = middlePan.left - (e.clientX - middlePan.x);
  panWrap.scrollTop = middlePan.top - (e.clientY - middlePan.y);
}, true);
function endMiddlePan(e) {
  if (!middlePan) return;
  e.stopPropagation();
  middlePan = null; panWrap.classList.remove('panning');
}
panWrap.addEventListener('pointerup', endMiddlePan, true);
panWrap.addEventListener('pointercancel', endMiddlePan, true);
// 瀏覽器按中鍵會跳出「自動捲動」的圖示，這裡關掉它
panWrap.addEventListener('mousedown', e => { if (e.button === 1) e.preventDefault(); });
panWrap.addEventListener('auxclick', e => { if (e.button === 1) e.preventDefault(); });

// ================= 圖層面板（依 LAYERS 動態產生按鈕）=================
// ・點圖層＝在這層編輯，並在下面展開這層的物件清單；再點一次收起來。點清單裡的物件＝直接選取它（按住 Shift 可以多選）。
// ・「＋ 新增圖層」加在目前圖層的上面；「✎ 改名」（或雙擊圖層）改名字；「🗑 刪除圖層」連同上面的物件一起刪（Ctrl+Z 可以復原）。
const layerBtnsEl = document.getElementById('layerBtns');
let expandedLayer = null;      // 展開物件清單的圖層
let layerListLimit = 200;      // 清單一次最多列幾個（物件很多時按「再顯示」）
let layerListFilter = '';      // 清單的名稱搜尋
// 改圖層之前：沒改過的地圖先把預設圖層抄一份存進地圖（之後就是這張地圖自己的圖層）
function customizeLayers(m) {
  if (!Array.isArray(m.layerOrder) || !m.layerOrder.length) m.layerOrder = clone(DEFAULT_LAYERS);
  return m.layerOrder;
}
// 某一層上有哪些物件：上面的大圖（最上面的排前面）＋鋪在格子上的小圖（由上往下、由左往右）
function layerContents(m, lid) {
  const items = [];
  for (let i = m.stamps.length - 1; i >= 0; i--) {
    const s = m.stamps[i];
    if ((s.layer || 'top') === lid) items.push({ type: 'stamp', index: i, id: s.id, c: s.c, r: s.r });
  }
  const cells = Object.entries(m.layers[lid] || {}).map(([key, id]) => { const [c, r] = key.split(',').map(Number); return { type: 'tile', layer: lid, key, id, c, r }; });
  cells.sort((a, b) => a.r - b.r || a.c - b.c);
  return items.concat(cells);
}
function addLayer() {
  const m = curMap();
  const name = prompt('新圖層的名稱？', '新圖層'); if (name === null) return;
  const isObject = confirm('這個圖層要放「立體物件」嗎？\n\n【確定】＝物件類：會跟角色排前後（角色走到物件後面會被擋住）。\n【取消】＝地面類：永遠畫在角色下面（地毯、裂痕、地上的痕跡…）。');
  pushUndo();
  const list = customizeLayers(m), prefix = isObject ? 'object' : 'ground';
  let n = isObject ? 5 : 4;
  while (m.layers[prefix + n] || list.some(l => l.id === prefix + n)) n++;
  const id = prefix + n, at = list.findIndex(l => l.id === activeLayer);
  list.splice(at + 1, 0, { id, name: name.trim() || '新圖層' });   // 加在目前圖層的上面
  m.layers[id] = {};
  activeLayer = id; expandedLayer = id;
  syncLayers(); renderLayers(); refreshSelPanel(); saveMaps(); draw();
  setStatus('已新增圖層「' + (name.trim() || '新圖層') + '」（' + (isObject ? '物件類：會跟角色排前後' : '地面類：在角色下面') + '）', '#7ee0c0');
}
function renameLayer(id = activeLayer) {
  const m = curMap(), cur = layersOf(m).find(l => l.id === id); if (!cur) return;
  const name = prompt('圖層的新名稱？', cur.name);
  if (name === null || !name.trim() || name.trim() === cur.name) return;
  pushUndo();
  customizeLayers(m).find(l => l.id === id).name = name.trim();
  syncLayers(); renderLayers(); refreshSelPanel(); saveMaps();
  setStatus('圖層改名為「' + name.trim() + '」', '#7ee0c0');
}
function deleteLayer(id = activeLayer) {
  const m = curMap(), list = layersOf(m), cur = list.find(l => l.id === id); if (!cur) return;
  if (list.length <= 1) { alert('至少要留一個圖層'); return; }
  const count = layerContents(m, id).length;
  if (!confirm('刪除圖層「' + cur.name + '」？' + (count ? '\n\n這個圖層上有 ' + count + ' 個物件，會一起刪除（可以按 Ctrl+Z 復原）。\n想保留物件的話，先選取物件、用上方的「圖層」選單搬到別層再刪。' : ''))) return;
  pushUndo();
  const order = customizeLayers(m), i = order.findIndex(l => l.id === id);
  order.splice(i, 1);
  delete m.layers[id];
  m.stamps = m.stamps.filter(s => (s.layer || 'top') !== id);
  hiddenLayers.delete(id); lockedLayers.delete(id);
  if (expandedLayer === id) expandedLayer = null;
  activeLayer = order[Math.max(0, i - 1)].id;
  selection = null; selections = [];
  syncLayers(); renderLayers(); refreshSelPanel(); saveMaps(); draw();
  setStatus('已刪除圖層「' + cur.name + '」' + (count ? '（連同 ' + count + ' 個物件）' : ''), '#ffd24a');
}
// 從物件清單選取：跟在畫面上用「👆 選取」點到一樣（之後可以拖曳、翻轉、刪除、換圖層）
// 物件清單點選：直接點＝只選這一個；Ctrl＋點＝加選／取消這一個；Shift＋點＝選取「上一次點的那個」到這一個之間的全部（清單上的順序）
let layerListAnchor = null;   // Shift 範圍選取的起點（上一次直接點或 Ctrl＋點的那一個）
const layerItemPick = item => item.type === 'stamp' ? { type: 'stamp', index: item.index } : { type: 'tile', layer: item.layer, key: item.key };
function selectFromLayerList(item, mode = {}, list = null) {
  if (hiddenLayers.has(item.layer || layerOfItem(item))) { setStatus('這個圖層被隱藏中，請先打開眼睛 👁 才能選取', '#ffd24a'); return; }
  if (isLockedLayer(item.layer || layerOfItem(item))) { setStatus('這個圖層已鎖定，請先按 🔒 解鎖才能選取', '#ffd24a'); return; }
  const picked = layerItemPick(item);
  if (brush.mode !== 'select') { brush = { mode: 'select', tile: brush.tile }; updateToolUI(); renderPalette(); }
  const from = mode.shift && list && layerListAnchor ? list.findIndex(it => selectionId(layerItemPick(it)) === layerListAnchor) : -1;
  if (from >= 0) {   // Shift：起點到這一個之間全部選起來（起點不動，可以再 Shift 點別的改範圍）
    const to = list.indexOf(item), [a, b] = from <= to ? [from, to] : [to, from];
    selections = list.slice(a, b + 1).map(layerItemPick);
    if (from > to) selections.reverse();   // 最後一個＝剛點的那一個（右邊面板顯示它）
  } else {
    if (mode.ctrl) {
      const at = selections.findIndex(s => selectionId(s) === selectionId(picked));
      if (at >= 0) selections.splice(at, 1); else selections.push(picked);
    } else selections = [picked];
    layerListAnchor = selectionId(picked);
  }
  selection = selections.length ? selections[selections.length - 1] : null;
  refreshSelPanel(); scrollToItem(item); flashLocate(item); draw();
  setStatus('已選取「' + ((tileById(item.id) || {}).name || item.id) + '」（' + item.c + ', ' + item.r + '）' + (selections.length > 1 ? '，共 ' + selections.length + ' 個' : ''), '#ffd479');
}
const layerOfItem = item => item.type === 'stamp' ? ((curMap().stamps[item.index] || {}).layer || 'top') : item.layer;
// 物件在畫布上的範圍（像素）
function itemRect(item) {
  const m = curMap();
  if (item.type === 'stamp') {
    const s = m.stamps[item.index], t = (s && tileById(s.id)) || {};
    if (!s) return null;
    return { x: OX + s.c * CELL + (s.ox || 0), y: OY + s.r * CELL + (s.oy || 0), w: stampW(s, t) * CELL, h: stampH(s, t) * CELL };
  }
  return { x: OX + item.c * CELL, y: OY + item.r * CELL, w: CELL, h: CELL };
}
// 把畫面捲到選到的物件
function scrollToItem(item) {
  const rect = itemRect(item), wrap = document.getElementById('wrap'); if (!rect || !wrap) return;
  wrap.scrollTo({ left: (rect.x + rect.w / 2) * editorZoom - wrap.clientWidth / 2, top: (rect.y + rect.h / 2) * editorZoom - wrap.clientHeight / 2, behavior: 'smooth' });
}
// 選到之後在物件周圍閃一個圈，很小的物件也看得到在哪
let locateFlash = null;
function flashLocate(item) {
  const rect = itemRect(item); if (!rect) return;
  locateFlash = { ...rect, until: performance.now() + 1400 };
  const tick = () => { draw(); if (locateFlash && performance.now() < locateFlash.until) requestAnimationFrame(tick); else { locateFlash = null; draw(); } };
  requestAnimationFrame(tick);
}
function drawLocateFlash() {
  if (!locateFlash) return;
  const left = (locateFlash.until - performance.now()) / 1400; if (left <= 0) return;
  const cx = locateFlash.x + locateFlash.w / 2, cy = locateFlash.y + locateFlash.h / 2;
  const r = Math.max(locateFlash.w, locateFlash.h) / 2 + 14 + (1 - left) * 40;
  ctx.save();
  ctx.globalAlpha = Math.min(1, left * 1.5); ctx.strokeStyle = '#ffe14d'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
}
// 物件清單裡這一筆是不是目前選取的
const isItemSelected = item => selections.some(s => item.type === 'stamp' ? (s.type === 'stamp' && s.index === item.index) : (s.type === 'tile' && s.layer === item.layer && s.key === item.key));
function renderLayerItems(lid) {
  const m = curMap(), box = document.createElement('div'); box.className = 'layer-objs';
  const all = layerContents(m, lid);
  const filter = document.createElement('input');
  filter.type = 'search'; filter.className = 'layer-filter'; filter.placeholder = '搜尋物件名稱…'; filter.value = layerListFilter;
  filter.addEventListener('input', () => { layerListFilter = filter.value; layerListLimit = 200; renderLayers(); const f = layerBtnsEl.querySelector('.layer-filter'); if (f) { f.focus(); f.setSelectionRange(f.value.length, f.value.length); } });
  box.appendChild(filter);
  const word = layerListFilter.trim().toLowerCase();
  const list = word ? all.filter(it => String((tileById(it.id) || {}).name || it.id).toLowerCase().includes(word)) : all;
  if (!list.length) {
    const empty = document.createElement('div'); empty.className = 'layer-objs-empty';
    empty.textContent = all.length ? '沒有符合的物件' : '這個圖層還沒有物件';
    box.appendChild(empty); return box;
  }
  list.slice(0, layerListLimit).forEach(item => {
    const t = tileById(item.id) || {};
    const row = document.createElement('button'); row.type = 'button'; row.className = 'layer-obj' + (isItemSelected(item) ? ' sel' : '');
    row.title = '點一下選取（Ctrl＋點＝加選／取消；Shift＋點＝選取上一個點的到這一個之間的全部）';
    const rec = t.file ? ensureTileImg(t) : null;
    const thumb = rec && rec.loaded ? '<img src="' + t.file + '" alt="">' : '<span class="layer-obj-swatch"' + (t.color ? ' style="background:' + t.color + '"' : '') + '></span>';
    row.innerHTML = thumb + '<span class="layer-obj-name"></span><small>' + (item.type === 'stamp' ? '物件' : '格子') + '・' + item.c + ',' + item.r + '</small>';
    row.querySelector('.layer-obj-name').textContent = t.name || item.id;
    row.addEventListener('click', e => selectFromLayerList(item, { ctrl: e.ctrlKey || e.metaKey, shift: e.shiftKey }, list.slice(0, layerListLimit)));
    box.appendChild(row);
  });
  if (list.length > layerListLimit) {
    const more = document.createElement('button'); more.type = 'button'; more.className = 'btn layer-objs-more';
    more.textContent = '再顯示 200 個（還有 ' + (list.length - layerListLimit) + ' 個）';
    more.addEventListener('click', () => { layerListLimit += 200; renderLayers(); });
    box.appendChild(more);
  }
  return box;
}
// 畫面上的東西變了（貼圖、刪除、選取…）：物件清單晚一點再重畫（避免拖曳時一直重畫）
let layerListTimer = null;
function refreshLayerListSoon() {
  clearTimeout(layerListTimer);
  layerListTimer = setTimeout(() => { if (!document.activeElement || !document.activeElement.classList.contains('layer-filter')) renderLayers(); }, 250);
}
function renderLayers() {
  if (!layerBtnsEl) return;
  const m = curMap();
  if (expandedLayer && !LAYERS.some(l => l.id === expandedLayer)) expandedLayer = null;
  const oldList = layerBtnsEl.querySelector('.layer-objs'), keepScroll = oldList ? oldList.scrollTop : 0;   // 重畫後清單停在原本捲到的地方
  layerBtnsEl.innerHTML = '';
  // 新增／改名／刪除
  const tools = document.createElement('div'); tools.className = 'layer-tools';
  const mk = (text, title, fn, cls = '') => { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn ' + cls; b.textContent = text; b.title = title; b.addEventListener('click', fn); return b; };
  tools.append(
    mk('＋ 新增圖層', '在目前圖層的上面加一個新圖層', addLayer),
    mk('✎ 改名', '改目前圖層的名字（也可以雙擊圖層）', () => renameLayer()),
    mk('🗑 刪除圖層', '刪除目前圖層（上面的物件會一起刪掉）', () => deleteLayer(), 'danger'));
  layerBtnsEl.appendChild(tools);
  // 顯示順序反轉：上層在最上、地板在最下（不改 LAYERS 本身的疊圖 z 順序）
  [...LAYERS].reverse().forEach(l => {
    const group = document.createElement('span'); group.className = 'layer-group';
    const count = (m.stamps || []).filter(s => (s.layer || 'top') === l.id).length + Object.keys(m.layers[l.id] || {}).length;
    const b = document.createElement('button'); b.className = 'layer' + (l.id === activeLayer ? ' sel' : ''); b.dataset.layer = l.id;
    b.innerHTML = '<span class="layer-arrow">' + (expandedLayer === l.id ? '▾' : '▸') + '</span><span class="layer-label"></span><span class="layer-count">' + count + '</span>';
    b.querySelector('.layer-label').textContent = l.name;
    b.title = '點一下：在這層編輯並展開物件清單；雙擊：改名';
    b.addEventListener('click', () => {
      const wasActive = activeLayer === l.id;
      activeLayer = l.id;
      expandedLayer = wasActive && expandedLayer === l.id ? null : l.id;   // 再點一次同一層＝收起來
      layerListLimit = 200; layerListFilter = '';
      renderLayers(); setStatus('目前在「' + l.name + '」上編輯', '#b39ddb');
    });
    b.addEventListener('dblclick', e => { e.preventDefault(); renameLayer(l.id); });
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
    makeLayerDraggable(group, b, l);
    if (expandedLayer === l.id) layerBtnsEl.appendChild(renderLayerItems(l.id));   // 展開：這層的物件清單
  });
  const newList = layerBtnsEl.querySelector('.layer-objs'); if (newList) newList.scrollTop = keepScroll;
  updateLayerUI();
}
// ---- 拖曳圖層改前後：抓住圖層名稱拖到別的圖層上，放在它上面或下面（看放在那一格的上半還是下半）----
// 圖層上的物件跟著圖層走（物件記的是圖層 id，不用搬）；遊戲照 layerOrder 的順序疊圖（js/maploader.js），
// 但圖層的種類看 id：地面類（ground…）永遠在角色下面、物件類跟角色排前後、top 永遠在角色上面，拖過去也不會變
let layerDrag = null;   // 正在拖的圖層 id
function makeLayerDraggable(group, handle, l) {
  handle.draggable = true;
  handle.addEventListener('dragstart', e => {
    layerDrag = l.id; group.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', l.id); } catch (_) {}
  });
  handle.addEventListener('dragend', () => { layerDrag = null; layerBtnsEl.querySelectorAll('.layer-group').forEach(g => g.classList.remove('dragging', 'drop-above', 'drop-below')); });
  const above = e => { const r = group.getBoundingClientRect(); return e.clientY < r.top + r.height / 2; };
  group.addEventListener('dragover', e => {
    if (!layerDrag || layerDrag === l.id) return;
    e.preventDefault(); e.dataTransfer.dropEffect = 'move';
    const up = above(e); group.classList.toggle('drop-above', up); group.classList.toggle('drop-below', !up);
  });
  group.addEventListener('dragleave', e => { if (!group.contains(e.relatedTarget)) group.classList.remove('drop-above', 'drop-below'); });
  group.addEventListener('drop', e => {
    if (!layerDrag || layerDrag === l.id) return;
    e.preventDefault();
    moveLayer(layerDrag, l.id, above(e));
  });
}
// 把 id 這層搬到 target 那層的上面（up）或下面；清單上「上面」＝疊在比較上面（LAYERS 裡排在後面）
function moveLayer(id, target, up) {
  const m = curMap(); pushUndo();
  const list = customizeLayers(m), from = list.findIndex(x => x.id === id); if (from < 0) return;
  const [moved] = list.splice(from, 1);
  let at = list.findIndex(x => x.id === target); if (at < 0) { list.splice(from, 0, moved); return; }
  list.splice(up ? at + 1 : at, 0, moved);
  syncLayers(); renderLayers(); refreshSelPanel(); saveMaps(); draw();
  setStatus('「' + moved.name + '」移到「' + layerName(target) + '」的' + (up ? '上面' : '下面') + '（Ctrl+Z 可以復原）', '#b39ddb');
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
  { id: 'interactive', name: '互動與道具' },
  { id: 'restaurant', name: '餐廳' },
  { id: 'hospital', name: '醫院病房' },
  { id: 'containment', name: '收容觀察室' },
  { id: 'mrt', name: '捷運車站' },
  { id: 'cvs', name: '便利商店' },
  { id: 'street', name: '街道' },
  { id: 'poolcore', name: '池核' },
  { id: 'hq', name: '指揮部' },
  { id: 'research', name: '研究部' },
  { id: 'training', name: '地下訓練室' },
  { id: 'memory', name: '回憶場景' },
  { id: 'other', name: '其他' },
];
let activePaletteCategory = 'all';
// ---- 素材搜尋：在分類列的搜尋框打字，只顯示名稱（或檔名）含有這些字的素材；打越多字範圍越小 ----
let paletteSearch = '';
const paletteSearchInput = document.createElement('input');   // 只做一個，每次重畫素材列都放回同一個（打到一半的字不會不見）
paletteSearchInput.type = 'search'; paletteSearchInput.className = 'palette-search';
paletteSearchInput.placeholder = '🔍 搜尋素材'; paletteSearchInput.title = '輸入素材名稱或檔名裡的字（大小寫都可以）';
function applyPaletteSearch() {
  if (paletteSearchInput.value === paletteSearch) return;
  paletteSearch = paletteSearchInput.value;
  const pos = paletteSearchInput.selectionStart;
  renderPalette();
  paletteSearchInput.focus(); try { paletteSearchInput.setSelectionRange(pos, pos); } catch (_) {}
}
paletteSearchInput.addEventListener('input', e => { if (!e.isComposing) applyPaletteSearch(); });   // 注音／中文輸入選字中先不搜尋
paletteSearchInput.addEventListener('compositionend', applyPaletteSearch);
paletteSearchInput.addEventListener('keydown', e => { if (e.key === 'Escape') { paletteSearchInput.value = ''; applyPaletteSearch(); } });   // Esc＝清空搜尋
function tileMatchesSearch(t) {
  const q = paletteSearch.trim().toLowerCase(); if (!q) return true;
  return [t.name, t.id, t.file].some(v => String(v || '').toLowerCase().includes(q));
}
function tileCategory(t) {
  const file = String(t.file || '').replace(/\\/g, '/').toLowerCase();
  if (String(t.id || '').startsWith('tile_interactive_')) return 'interactive';
  if (t.systemColor) return 'color';
  if (t.builtin || file.includes('/background/') || file.includes('/01-station-hall/')) return 'map';
  if (String(t.id || '').startsWith('tile_poolcore_') || file.includes('/池核/') || file.includes('/poolcore/')) return 'poolcore';
  if (String(t.id || '').startsWith('tile_hq_') || file.includes('/指揮部/')) return 'hq';
  if (String(t.id || '').startsWith('tile_research_lab_') || file.includes('/研究部/')) return 'research';
  if (String(t.id || '').startsWith('tile_training_') || file.includes('/地下訓練室/')) return 'training';
  if (file.includes('/回憶場景/')) return 'memory';
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
  if (String(t.id || '').startsWith('tile_street_') || file.includes('/street/')) return 'street';
  if (file.includes('/item-decorate/')) return 'decor';
  if (file.includes('/item-obstacle/')) return 'obstacle';
  return 'other';
}
function renderPalette() {
  paletteEl.innerHTML = '';
  // 舊地圖仍可讀取內建佔位格，但不再提供灰牆與棕色障礙作為新素材。
  const allTiles = palette().filter(t => t.id !== 'wall' && t.id !== 'obstacle' && tileMatchesSearch(t));   // 有搜尋字時：分類數量也只算搜得到的
  const tabs = document.createElement('div'); tabs.className = 'palette-tabs';
  tabs.appendChild(paletteSearchInput);
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
    b.dataset.tileId = t.id;   // 右鍵選單（以檔案總管開啟）用
    let thumb;
    const rec = t.file ? ensureTileImg(t) : null;
    if (t.file) b.classList.add('has-image');
    if (t.file && rec && rec.loaded) thumb = '<img class="thumb" src="' + t.file + '" alt="完整圖片預覽">';
    else if (t.color) thumb = '<span class="thumb swatch" style="background:' + t.color + '"></span>';
    else thumb = '<span class="thumb swatch ' + t.role + '"></span>';
    const sizeTxt = t.systemColor ? (' ' + tilePixelW(t) + '×' + tilePixelH(t) + ' px') : (isBig(t) ? (' ' + tileW(t) + '×' + tileH(t)) : '');
    const isObstacleArt = String(t.file || '').replace(/\\/g, '/').includes('/item-obstacle/');
    const typeTxt = isObstacleArt
      ? (t.id === 'tile_obstacle_camping_lights' ? '可擋路・可破壞・小範圍發光' : /-ore-/.test(String(t.file || '')) ? '可擋路・用地雷或瓦斯爐炸開' : '可擋路・可破壞')
      : (String(t.id || '').startsWith('tile_street_drink_shop_') ? '可互動・靠近按 E／Enter 購買飲料' : (t.systemColor ? '系統色塊' : (t.builtin ? roleLabel(t.role) : '圖片')));
    b.innerHTML = thumb + '<span class="tname">' + t.name + '</span><small>' + typeTxt + sizeTxt + '</small>';
    b.addEventListener('click', () => selectTile(t.id));
    if (!t.builtin) {
      const del = document.createElement('button'); del.className = 'del'; del.textContent = '✕'; del.title = '刪除這塊磚塊';
      del.addEventListener('click', ev => { ev.stopPropagation(); deleteTile(t.id); });
      b.appendChild(del);
    }
    grid.appendChild(b);
  });
  if (!visibleTiles.length) {
    const empty = document.createElement('div'); empty.className = 'palette-empty';
    empty.textContent = paletteSearch.trim() ? '這個分類找不到含有「' + paletteSearch.trim() + '」的素材' : '這個分類目前沒有素材';
    grid.appendChild(empty);
  }
  paletteEl.appendChild(grid);
  updateFlatUI();
}

// ================= 素材圖右鍵：以檔案總管開啟 =================
// 對下方素材列的圖片按右鍵 → 「以檔案總管開啟」：打開這張圖所在的資料夾（並選好這張圖）。
// ・用「開啟編輯器.bat」打開編輯器時：真的跳出檔案總管（由 tools/editor-server.py 幫忙開）。
// ・直接雙擊 HTML 打開時：網頁不能自己開檔案總管（瀏覽器的安全限制），改成複製資料夾路徑，貼到檔案總管的網址列就好。
const tileMenu = document.createElement('div');
tileMenu.className = 'tile-ctxmenu'; tileMenu.hidden = true;
tileMenu.innerHTML = '<button type="button" data-tile-act="folder">📂 以檔案總管開啟</button>';
document.body.appendChild(tileMenu);
let tileMenuTarget = null;
const hideTileMenu = () => { tileMenu.hidden = true; tileMenuTarget = null; };
paletteEl.addEventListener('contextmenu', e => {
  const el = e.target.closest('.tile[data-tile-id]'); if (!el) return;
  e.preventDefault(); e.stopPropagation();   // 不跳出瀏覽器的選單，也不觸發「右鍵＝取消選取」
  tileMenuTarget = tileById(el.dataset.tileId);
  tileMenu.hidden = false;
  const w = tileMenu.offsetWidth, h = tileMenu.offsetHeight;
  tileMenu.style.left = Math.min(e.clientX, innerWidth - w - 4) + 'px';
  tileMenu.style.top = Math.min(e.clientY, innerHeight - h - 4) + 'px';
});
document.addEventListener('pointerdown', e => { if (!tileMenu.contains(e.target)) hideTileMenu(); }, true);
document.addEventListener('keydown', e => { if (e.key === 'Escape') hideTileMenu(); });
window.addEventListener('blur', hideTileMenu);
tileMenu.addEventListener('click', e => {
  if (!e.target.closest('[data-tile-act="folder"]')) return;
  const t = tileMenuTarget; hideTileMenu();
  if (t) openTileFolder(t);
});
function copyText(text) {   // 複製到剪貼簿（雙擊打開的網頁也能用）
  const ta = document.createElement('textarea'); ta.value = text; ta.style.cssText = 'position:fixed;left:-9999px;top:0';
  document.body.appendChild(ta); ta.select();
  let ok = false; try { ok = document.execCommand('copy'); } catch (_) {}
  ta.remove(); return ok;
}
async function openTileFolder(t) {
  const file = String(t.file || '').split('?')[0];
  if (!file) { setStatus('「' + t.name + '」是系統色塊，沒有圖片檔', '#ffd24a'); return; }
  if (file.startsWith('data:')) { setStatus('「' + t.name + '」是直接上傳到編輯器的圖片（存在資料裡），沒有對應的圖片檔', '#ffd24a'); return; }
  try {   // 用「開啟編輯器.bat」打開時：請本機的小幫手打開檔案總管
    const r = await fetch('/__open-folder?path=' + encodeURIComponent(file), { cache: 'no-store' });
    if (r.ok) { setStatus('📂 已用檔案總管打開：' + file, '#7ee0c0'); return; }
  } catch (_) {}
  // 沒有小幫手：複製資料夾路徑
  const local = location.protocol === 'file:' ? decodeURIComponent(location.pathname).replace(/^\/(?=[A-Za-z]:)/, '').replace(/[^/]*$/, '') : '';
  const folder = (local + file).replace(/\/[^/]*$/, '').replace(/\//g, '\\');
  const copied = copyText(folder);
  setStatus((copied ? '已複製資料夾路徑：' : '資料夾路徑：') + folder + (local ? '' : '（在遊戲資料夾裡）') +
    '　網頁不能自己打開檔案總管；把路徑貼到檔案總管上方的網址列就好。想一鍵打開，請用遊戲資料夾裡的「開啟編輯器.bat」打開編輯器。', '#ffd24a');
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
    updateWaterUI(t);
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
// ---- 水：勾「這是水」→ 角色走進這個素材的範圍會泡在水裡（遊戲裡的效果在 js/water.js）----
// 存在素材的 water：{ depth：水深（角色身高的 %）, speed：水中走路速度（%）, see：水下看得見（%） }
const WATER_EDIT_DEFAULT = { depth: 50, speed: 70, see: 45 };
const WATER_EDIT_RANGE = { depth: [5, 95], speed: [10, 100], see: [0, 100] };
const tileWaterCb = document.getElementById('tileWater'), tileWaterOpts = document.getElementById('tileWaterOpts');
const tileWaterInputs = { depth: document.getElementById('tileWaterDepth'), speed: document.getElementById('tileWaterSpeed'), see: document.getElementById('tileWaterSee') };
function updateWaterUI(t) {
  if (!tileWaterCb) return;
  tileWaterCb.checked = !!t.water;
  tileWaterOpts.classList.toggle('hidden', !t.water);
  for (const [k, el] of Object.entries(tileWaterInputs)) if (el && document.activeElement !== el) el.value = t.water ? (t.water[k] ?? WATER_EDIT_DEFAULT[k]) : WATER_EDIT_DEFAULT[k];
}
if (tileWaterCb) tileWaterCb.addEventListener('change', () => {
  const t = brushTile(); if (!t || t.builtin) return;
  pushUndo();
  if (tileWaterCb.checked) t.water = { ...WATER_EDIT_DEFAULT }; else delete t.water;
  updateWaterUI(t); saveTiles(); draw();
  setStatus('「' + t.name + '」' + (t.water ? '設為水：水深 ' + t.water.depth + '%、走路速度 ' + t.water.speed + '%、水下看得見 ' + t.water.see + '%' : '不再是水'), '#8fd3ff');
});
for (const [k, el] of Object.entries(tileWaterInputs)) if (el) el.addEventListener('change', () => {
  const t = brushTile(); if (!t || t.builtin || !t.water) return;
  const [lo, hi] = WATER_EDIT_RANGE[k], v = Math.max(lo, Math.min(hi, Math.round(+el.value || WATER_EDIT_DEFAULT[k])));
  pushUndo(); t.water[k] = v; el.value = v; saveTiles();
  setStatus('「' + t.name + '」水深 ' + t.water.depth + '%、走路速度 ' + t.water.speed + '%、水下看得見 ' + t.water.see + '%', '#8fd3ff');
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
  pickedBrushPending = false;
  const selectedTile = tileById(id);
  if (activePaletteCategory !== 'all' && selectedTile && tileCategory(selectedTile) !== activePaletteCategory) {
    activePaletteCategory = tileCategory(selectedTile);
  }
  brush = { mode: 'tile', tile: id }; clearSelection(); updateToolUI(); renderPalette();
}
// 素材庫三邊共用：其他分類的地圖還在用的素材不能刪（不然那邊的地圖會少東西）
async function otherEditorTileUse(id) {
  const names = new Set(), uses = m => (m.stamps || []).some(s => s.id === id) || Object.values(m.layers || {}).some(layer => Object.values(layer).includes(id));
  const catalogs = [
    { path: 'data/maps.js', constName: 'BATTLE_MAPS', storage: 'tudrc_battle_maps_v1', label: '戰鬥' },
    { path: 'data/base-maps.js', constName: 'BASE_MAPS', storage: 'tudrc_base_maps_v1', label: '基地' },
    { path: 'data/story-maps.js', constName: 'STORY_MAPS', storage: 'tudrc_story_maps_v1', label: '劇情' },
  ].filter(c => c.storage !== STORAGE_MAPS);
  for (const catalog of catalogs) {
    try {
      const source = await (await fetch(catalog.path, { cache: 'no-store' })).text();
      new Function(source + ';return ' + catalog.constName + ';')().forEach(m => { if (uses(m)) names.add(catalog.label + '：' + m.name); });
    } catch (_) {}
    try {
      const draft = JSON.parse(await EditorStore.getRaw(catalog.storage) || 'null');
      if (Array.isArray(draft)) draft.forEach(m => { if (uses(m)) names.add(catalog.label + '：' + m.name); });
    } catch (_) {}
  }
  return [...names];
}
async function deleteTile(id) {
  const t = tileById(id); if (!t || t.builtin) return;
  const usedThere = await otherEditorTileUse(id);
  if (usedThere.length) { alert('「' + t.name + '」是三個編輯器共用的素材，其他分類的地圖還在用：\n' + usedThere.join('、') + '\n\n請先到對應的編輯器把它從那些地圖拿掉，才能刪除。'); return; }
  if (!confirm('刪除磚塊「' + t.name + '」？（已經貼到地圖上的會一起消失）')) return;
  pushUndo();
  customTiles = customTiles.filter(x => x.id !== id); saveTiles();
  maps.forEach(m => {
    Object.values(m.layers).forEach(layer => { for (const k in layer) if (layer[k] === id) delete layer[k]; });
    m.stamps = m.stamps.filter(s => s.id !== id);
  });
  saveMaps();
  if (brush.tile === id) selectTile('floor');
  renderPalette(); draw();
}

// 工具按鈕
function updateToolUI() { document.querySelectorAll('.tool').forEach(b => b.classList.toggle('sel', brush.mode === b.dataset.mode)); }
document.querySelectorAll('.tool').forEach(btn => {
  btn.addEventListener('click', () => { pickedBrushPending = false; brush = { mode: btn.dataset.mode, tile: brush.tile }; if (brush.mode !== 'select') clearSelection(); updateToolUI(); renderPalette(); });
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
  if (keepPick) { brush = { mode: 'tile', tile: picked }; pickedBrushPending = true; }
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
  if (!s || !t || t.baseHp) return null;
  return { s, t };
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
  select.value = DOOR_MODES[s.doorMode] ? s.doorMode : 'manual';
  if (typeof refreshMemoryDoorFields === 'function') refreshMemoryDoorFields(s, (field, value) => {   // 記憶之門：鑰匙、劇情（js/memory-door-editor.js）
    pushUndo();
    if (value) s[field] = value; else delete s[field];
    saveMaps(); draw();
    setStatus('記憶之門已更新', '#7ee0c0');
  });
}
document.getElementById('selDoorMode').addEventListener('change', e => {
  const s = selectedDoorStamp(); if (!s) return;
  pushUndo();
  if (e.target.value !== 'manual') s.doorMode = e.target.value; else delete s.doorMode;   // 自由開關是預設，不另外存
  saveMaps(); draw(); refreshDoorControl();
  setStatus('已設為「' + DOOR_MODES[e.target.value] + '」', '#7ee0c0');
});
// ---- 混合模式、不透明度、發光：選一個物件時設定（存在這個 stamp 上，素材本身不動；遊戲的畫法見 js/maploader.js）----
// 小圖（格子）設了之後會變成大圖（stamp），位置、圖片都不變
const BLEND_MODES = [['', '一般'], ['overlay', '覆蓋'], ['multiply', '色彩增值'], ['soft-light', '柔光'], ['screen', '濾色'],
  ['lighter', '相加（發光）'], ['color-dodge', '加亮顏色'], ['hard-light', '實光'], ['lighten', '變亮'], ['darken', '變暗'], ['color-burn', '加深顏色'],
  ['difference', '差異化'], ['hue', '色相'], ['saturation', '飽和度'], ['color', '顏色'], ['luminosity', '明度']];
function selectedBlendTarget() {   // 只選一個物件時：{ s（大圖）或 sel（小圖）, id }
  if (selections.length !== 1) return null;
  const sel = selections[0], m = curMap();
  const s = sel.type === 'stamp' ? m.stamps[sel.index] : null, id = s ? s.id : m.layers[sel.layer]?.[sel.key];
  return id ? { sel, s, id } : null;
}
function refreshBlendControl() {
  let box = document.getElementById('blendControl');
  if (!box) {
    box = document.createElement('div'); box.id = 'blendControl'; box.className = 'blend-control';
    box.innerHTML = '<label>混合模式 <select id="blendMode">' + BLEND_MODES.map(([v, n]) => '<option value="' + v + '">' + n + '</option>').join('') + '</select></label>' +
      '<label>不透明度 <input type="number" id="blendAlpha" min="0" max="100" step="5" style="width:56px"> %</label>' +
      '<label title="黑幕畫完才畫這個物件（暗處也看得到），並且當成光源照亮周圍（光會被牆擋住）"><input type="checkbox" id="blendGlow"> 發光（照亮黑暗）</label>' +
      '<label id="blendGlowRBox">照亮半徑 <input type="number" id="blendGlowR" min="20" max="800" step="10" style="width:60px"> px</label>';
    document.getElementById('selControls').appendChild(box);
    const apply = () => {
      const picked = selectedBlendTarget(); if (!picked) return;
      if (dropLockedSelections('設定混合模式')) return;
      pushUndo(); let s = picked.s;
      if (!s) {   // 小圖：變成大圖才能存設定（位置不變）
        const [c, r] = picked.sel.key.split(',').map(Number);
        s = { id: picked.id, c, r, layer: picked.sel.layer };
        delete curMap().layers[picked.sel.layer][picked.sel.key]; curMap().stamps.push(s);
        selections = [{ type: 'stamp', index: curMap().stamps.length - 1 }]; selection = selections[0];
      }
      const mode = document.getElementById('blendMode').value, a = Math.round(Number(document.getElementById('blendAlpha').value));
      if (mode) s.blend = mode; else delete s.blend;
      if (Number.isFinite(a) && a >= 0 && a < 100) s.alpha = a; else delete s.alpha;
      if (document.getElementById('blendGlow').checked) {
        s.glow = true; const gr = Math.round(Number(document.getElementById('blendGlowR').value));
        if (Number.isFinite(gr) && gr > 0 && gr !== 160) s.glowR = gr; else delete s.glowR;
      } else { delete s.glow; delete s.glowR; }
      saveMaps(); draw(); refreshSelPanel();
      setStatus('已設定：' + (BLEND_MODES.find(b => b[0] === (s.blend || '')) || [, '一般'])[1] + '、不透明度 ' + (s.alpha ?? 100) + '%' + (s.glow ? '、發光（半徑 ' + (s.glowR || 160) + 'px）' : ''), '#7ee0c0');
    };
    box.querySelectorAll('select, input').forEach(el => el.addEventListener('change', apply));
  }
  const picked = selectedBlendTarget(); box.classList.toggle('hidden', !picked);
  if (!picked) return;
  const s = picked.s || {};
  document.getElementById('blendMode').value = s.blend || '';
  document.getElementById('blendAlpha').value = Number.isFinite(s.alpha) ? s.alpha : 100;
  document.getElementById('blendGlow').checked = !!s.glow;
  document.getElementById('blendGlowR').value = s.glowR > 0 ? s.glowR : 160;
  document.getElementById('blendGlowRBox').classList.toggle('hidden', !s.glow);
}
// 置物櫃內容跟著擺放的物件保存，避免同素材的所有櫃子共用獎勵。
function selectedLocker() {
  if (selections.length !== 1) return null;
  const sel = selections[0], m = curMap();
  const s = sel.type === 'stamp' ? m.stamps[sel.index] : null;
  const id = s ? s.id : m.layers[sel.layer]?.[sel.key];
  const t = tileById(id);
  if (!t) return null;
  if (id === 'tile_field_ammo_crate') return { sel, s, id, ammo: true };   // 彈藥箱：不用鑰匙、只能開一次（js/flare.js）；營地的補彈藥箱（打開的）只補彈藥，不能放東西
  if (!(id === 'tile_interactive_storage_locker' || /storage-locker-closed\.png$/.test(String(t.file || '')) || /置物[箱櫃].*關|置物[箱櫃]（上鎖）/.test(t.name || ''))) return null;
  return { sel, s, id };
}
function refreshLockerControl() {
  let box = document.getElementById('lockerLootControl');
  if (!box) {
    box = document.createElement('label'); box.id = 'lockerLootControl';
    const title = document.createElement('span'); title.id = 'lockerLootTitle'; box.append(title);
    const select = document.createElement('select'); select.id = 'lockerLootItem';
    const add = (value, name, parent = select) => { const o = document.createElement('option'); o.value = value; o.textContent = name; parent.appendChild(o); };
    add('random', '隨機掉落（原設定）'); add('empty', '空櫃');
    const groups = [
      ['補給、零食飲料', 'item', typeof SUPPLIES === 'undefined' ? [] : SUPPLIES],
      ['素材與重要物品', 'item', typeof ITEMS === 'undefined' ? [] : ITEMS],
      ['裝備', 'equipment', typeof EQUIPMENT === 'undefined' ? [] : EQUIPMENT],
      ['武器', 'weapon', typeof WEAPON_UPGRADES === 'undefined' ? [] : Object.entries(WEAPON_UPGRADES).map(([id, w]) => ({ ...w, id }))],
    ];
    groups.forEach(([label, kind, entries]) => { const g = document.createElement('optgroup'); g.label = label; entries.forEach(t => add(kind + ':' + t.id, t.name, g)); select.appendChild(g); });
    const qty = document.createElement('input'); qty.id = 'lockerLootQty'; qty.type = 'number'; qty.min = '1'; qty.max = '999'; qty.step = '1'; qty.style.width = '60px'; qty.setAttribute('aria-label', '置物櫃物品數量');
    box.append(select, ' 數量 ', qty); document.getElementById('selControls').appendChild(box);
    const change = () => {
      const picked = selectedLocker(); if (!picked) return;
      if (dropLockedSelections('設定置物櫃內容')) return;
      pushUndo(); let s = picked.s;
      if (!s) {
        const [c, r] = picked.sel.key.split(',').map(Number);
        s = { id: picked.id, c, r, layer: picked.sel.layer };
        delete curMap().layers[picked.sel.layer][picked.sel.key]; curMap().stamps.push(s);
        selections = [{ type: 'stamp', index: curMap().stamps.length - 1 }]; selection = selections[0];
      }
      const [kind, id] = select.value.split(':');
      if (kind === 'random') delete s.lockerLoot;
      else s.lockerLoot = { kind, ...(id ? { id } : {}), qty: kind === 'item' ? Math.max(1, Math.min(999, Math.floor(Number(qty.value) || 1))) : 1 };
      saveMaps(); refreshSelPanel(); draw(); setStatus('已設定這個' + (picked.ammo ? '彈藥箱' : '置物櫃') + '的內容', '#7ee0c0');
    };
    select.addEventListener('change', change); qty.addEventListener('change', change);
  }
  const picked = selectedLocker(); box.classList.toggle('hidden', !picked);
  if (!picked) return;
  const loot = picked.s?.lockerLoot;
  const select = document.getElementById('lockerLootItem'), qty = document.getElementById('lockerLootQty');
  // 彈藥箱沒指定內容＝空箱，不另外給「空櫃」選項
  document.getElementById('lockerLootTitle').textContent = picked.ammo ? '彈藥箱內容：' : '置物櫃內容：';
  select.options[0].textContent = picked.ammo ? '空箱（原設定）' : '隨機掉落（原設定）';
  select.options[1].hidden = !!picked.ammo;
  if (picked.ammo && loot?.kind === 'empty') select.value = 'random';
  select.value = loot ? loot.kind === 'empty' ? 'empty' : loot.kind + ':' + loot.id : 'random';
  qty.value = loot?.qty || 1; qty.disabled = !select.value.startsWith('item:');
}
// 電源開關、電源控制的電燈：設定電路編號（1～5），同編號的開關只控制同編號的燈（js/powered-lights.js）
const isCircuitTile = t => !!t && (/power-switch-(on|off)\.png$/.test(String(t.file || '').replace(/\\/g, '/')) || /^tile_interactive_power_switch/.test(t.id)
  || /electric-light-02\.png$/.test(String(t.file || '').replace(/\\/g, '/')) || t.id === 'tile_interactive_electric_light_02');
function selectedCircuitThing() {
  if (selections.length !== 1) return null;
  const sel = selections[0], m = curMap();
  const s = sel.type === 'stamp' ? m.stamps[sel.index] : null;
  const id = s ? s.id : m.layers[sel.layer]?.[sel.key];
  return isCircuitTile(tileById(id)) ? { sel, s, id } : null;
}
// 應變中心的房門：鎖住時溫特說的話（js/locked-doors.js；門前有出入口的門不會用到）
function selectedLockedDoor() {
  if (typeof LOCKED_DOOR_TILES === 'undefined' || selections.length !== 1 || selections[0].type !== 'stamp') return null;
  const s = curMap().stamps[selections[0].index];
  return s && LOCKED_DOOR_TILES.includes(s.id) ? s : null;
}
function refreshLockTextControl() {
  let box = document.getElementById('lockTextControl');
  if (!box) {
    box = document.createElement('label'); box.id = 'lockTextControl';
    box.append('鎖住時溫特說：');
    const input = document.createElement('input'); input.id = 'lockTextInput'; input.type = 'text'; input.style.width = '220px';
    input.placeholder = (typeof LOCKED_DOOR_TEXT !== 'undefined' ? LOCKED_DOOR_TEXT : '') + '（\\n 換下一句）';
    box.append(input); document.getElementById('selControls').appendChild(box);
    input.addEventListener('change', () => {
      const s = selectedLockedDoor(); if (!s) return;
      if (dropLockedSelections('設定門的台詞')) return;
      pushUndo();
      const v = input.value.trim().replace(/\\n/g, '\n');
      if (v) s.lockText = v; else delete s.lockText;
      saveMaps(); setStatus(v ? '已設定這扇門的台詞（門前沒有出入口時才會用到）' : '已改回預設台詞', '#7ee0c0');
    });
  }
  const s = selectedLockedDoor(); box.classList.toggle('hidden', !s);
  if (s) document.getElementById('lockTextInput').value = (s.lockText || '').replace(/\n/g, '\\n');
}
function refreshCircuitControl() {
  let box = document.getElementById('circuitControl');
  if (!box) {
    box = document.createElement('label'); box.id = 'circuitControl';
    box.append('電路編號：');
    const select = document.createElement('select'); select.id = 'circuitNumber';
    [['0', '不編號（全部連動）'], ['1', '1'], ['2', '2'], ['3', '3'], ['4', '4'], ['5', '5']].forEach(([v, n]) => { const o = document.createElement('option'); o.value = v; o.textContent = n; select.appendChild(o); });
    box.append(select); document.getElementById('selControls').appendChild(box);
    select.addEventListener('change', () => {
      const picked = selectedCircuitThing(); if (!picked) return;
      if (dropLockedSelections('設定電路編號')) return;
      pushUndo(); let s = picked.s;
      if (!s) {   // 鋪在圖層上的：轉成可以存設定的擺放物件
        const [c, r] = picked.sel.key.split(',').map(Number);
        s = { id: picked.id, c, r, layer: picked.sel.layer };
        delete curMap().layers[picked.sel.layer][picked.sel.key]; curMap().stamps.push(s);
        selections = [{ type: 'stamp', index: curMap().stamps.length - 1 }]; selection = selections[0];
      }
      const n = Number(select.value); if (n) s.circuit = n; else delete s.circuit;
      saveMaps(); refreshSelPanel(); draw(); setStatus(n ? '電路編號設為 ' + n + '：只跟同編號的開關／電燈連動' : '已取消電路編號', '#7ee0c0');
    });
  }
  const picked = selectedCircuitThing(); box.classList.toggle('hidden', !picked);
  if (picked) document.getElementById('circuitNumber').value = String(picked.s?.circuit || 0);
}
// 物件名稱太長會截成「…」，好讓選取列擠得進工具那一排；
// 但如果怎麼擠都會換到下一排（例如門、置物箱、電源開關有額外設定），就不截、直接顯示全名。
function fitSelName() {
  const nameEl = document.getElementById('selName'), bar = document.getElementById('selControls');
  const firstTool = document.querySelector('#tools .tool');
  if (!nameEl || !bar || !firstTool) return;
  nameEl.classList.remove('full');   // 先用截短的名字量看看
  const wrapped = bar.getBoundingClientRect().top - firstTool.getBoundingClientRect().top > 10;
  nameEl.classList.toggle('full', wrapped);
}
let fitSelNameFrame = 0;
function fitSelNameSoon() { cancelAnimationFrame(fitSelNameFrame); fitSelNameFrame = requestAnimationFrame(fitSelName); }   // 等選取列的按鈕都更新完再量
window.addEventListener('resize', fitSelNameSoon);
// 選到物件：右邊的圖層面板直接跳到它所在的圖層（亮紫色＝目前圖層），方便找它在哪一層
let lastFollowedSel = null;
function followSelectionLayer() {
  const id = selection ? selectionId(selection) : null;
  if (id === lastFollowedSel) return;   // 選取沒有變（只是重畫）：不要一直把圖層拉回去，自己點別的圖層也不會被搶走
  lastFollowedSel = id;
  if (!selection) return;
  const lid = selectionLayer(selection);
  if (!lid || !LAYERS.some(l => l.id === lid)) return;
  if (lid !== activeLayer) { activeLayer = lid; renderLayers(); }
  const b = layerBtnsEl && layerBtnsEl.querySelector('.layer[data-layer="' + lid + '"]');
  if (b) scrollIntoOwnList(b);   // 圖層很多時：只捲圖層清單本身，讓它看得到（不捲整個頁面）
}
// 只捲「最近的那個有捲軸的框」，不會把整個頁面拉走（scrollIntoView 會連整頁一起捲，選物件時畫面會被拉到下面的素材區）
function scrollIntoOwnList(el) {
  let box = el.parentElement;
  while (box && box !== document.body && box !== document.documentElement) {
    const oy = getComputedStyle(box).overflowY;
    if ((oy === 'auto' || oy === 'scroll') && box.scrollHeight > box.clientHeight) break;
    box = box.parentElement;
  }
  if (!box || box === document.body || box === document.documentElement) return;   // 清單沒有自己的捲軸：不動
  const r = el.getBoundingClientRect(), br = box.getBoundingClientRect();
  if (r.top < br.top) box.scrollTop -= br.top - r.top + 4;
  else if (r.bottom > br.bottom) box.scrollTop += r.bottom - br.bottom + 4;
}
function refreshSelPanel() {
  fitSelNameSoon();
  const layerSelect = document.getElementById('selLayer');
  const depthInput = document.getElementById('selDepthInput');
  const m = curMap();
  selections = selections.filter(sel => sel.type === 'stamp' ? !!m.stamps[sel.index] : !!(m.layers[sel.layer] && m.layers[sel.layer][sel.key] !== undefined));
  selection = selections.length ? selections[selections.length - 1] : null;
  followSelectionLayer();   // 圖層面板跳到選到的物件所在的圖層
  refreshLayerListSoon();   // 圖層物件清單：標出目前選取的物件
  const hasSelection = !!selection;
  refreshLockerControl();
  refreshCircuitControl();
  refreshLockTextControl();
  refreshBlendControl();   // 混合模式、不透明度、發光
  layerSelect.disabled = !hasSelection;
  ['selUp', 'selDown', 'selFlipX', 'selFlipY', 'selRotate', 'selReset', 'selDelete'].forEach(id => {
    document.getElementById(id).disabled = !hasSelection;
  });
  depthInput.disabled = true;
  depthInput.value = '';
  if (!selection) {
    refreshDoorControl();
    document.getElementById('selName').textContent = '無'; document.getElementById('selName').title = '';
    layerSelect.innerHTML = '<option value="">選取物件後設定</option>';
    refreshBaseCollisionPanel();
    return;
  }
  if (selections.length > 1) {
    refreshDoorControl();
    document.getElementById('selName').textContent = selections.length + ' 個物件'; document.getElementById('selName').title = '';
    layerSelect.innerHTML = '<option value="">選擇目標圖層</option>';
    [...LAYERS].reverse().forEach(l => { const o = document.createElement('option'); o.value = l.id; o.textContent = l.name; layerSelect.appendChild(o); });   // 跟右邊圖層面板一樣：上層在最上面
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
  document.getElementById('selName').title = name;   // 名字太長會被截成「…」，滑鼠停上去看全名
  layerSelect.innerHTML = '';
  [...LAYERS].reverse().forEach(l => { const o = document.createElement('option'); o.value = l.id; o.textContent = l.name; if (l.id === curLayer) o.selected = true; layerSelect.appendChild(o); });   // 跟右邊圖層面板一樣：上層在最上面
  refreshDoorControl();
  const depthStamp = selectedDepthStamp();
  if (depthStamp) {
    depthInput.max = stampH(depthStamp.s, depthStamp.t);
    depthInput.value = Number.isFinite(depthStamp.s.sortDepth) ? depthStamp.s.sortDepth : stampH(depthStamp.s, depthStamp.t);
    depthInput.disabled = false;
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
  const next = Math.max(0, Math.min(stampH(picked.s, picked.t), value));
  pushUndo(); picked.s.sortDepth = next;
  saveMaps(); draw(); refreshSelPanel();
  setStatus('人物遮擋線設在圖片頂端往下 ' + next + ' 格', '#55d9ff');
});
document.getElementById('selUp').addEventListener('click', () => moveSelBy(1));
document.getElementById('selDown').addEventListener('click', () => moveSelBy(-1));
document.getElementById('selDelete').addEventListener('click', deleteSelection);
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
  s.baseSolid = rotateBaseCells(clone(t.baseSolid || []), w, h, stampTurn(s)).map(([dc, dr]) => [s.fx ? stampW(s, t) - 1 - dc : dc, s.fy ? stampH(s, t) - 1 - dr : dr]);
  saveMaps(); draw(); refreshBaseCollisionPanel(); setStatus('基地碰撞、HP 與深度線已恢復預設', '#7ee0c0');
});

// ================= 翻轉（大小圖皆可）=================
function updateFlipUI() {
  const bx = document.getElementById('flipX'), by = document.getElementById('flipY');
  if (bx) bx.classList.toggle('on', brushFlip.fx);
  if (by) by.classList.toggle('on', brushFlip.fy);
}
function rotateBrush() {
  brushRotation = (brushRotation + 1) % 4;
  draw();
  setStatus('筆刷已旋轉 ' + brushRotation * 90 + '°（R 可連續旋轉）', '#b39ddb');
}
function rotateSelection() {
  if (!selections.length) { setStatus('請先選取要旋轉的圖片', '#ffd24a'); return; }
  if (dropLockedSelections('旋轉')) return;
  pushUndo();
  const m = curMap();
  selections = selections.map(sel => {
    if (sel.type === 'tile') {
      const id = m.layers[sel.layer] && m.layers[sel.layer][sel.key];
      if (!id) return sel;
      const [c, r] = sel.key.split(',').map(Number);
      delete m.layers[sel.layer][sel.key];
      m.stamps.push({ id, c, r, layer: sel.layer, rot: 1 });
      return { type: 'stamp', index: m.stamps.length - 1 };
    }
    const s = m.stamps[sel.index];
    if (!s) return sel;
    const t = tileById(s.id) || {}, h = tileH(t);
    const depthBefore = Number.isFinite(s.baseDepth) ? s.baseDepth : (Number.isFinite(t.baseDepth) ? t.baseDepth : Math.max(1, h - 2));
    if (t.baseHp) {
      const cells = rotateBaseCells(baseSolidForStamp(s, t), stampW(s, t), stampH(s, t), 1);
      s.baseSolid = cells;
      s.baseDepth = h - depthBefore;
    }
    s.rot = (stampTurn(s) + 1) % 4;
    return sel;
  });
  selection = selections[selections.length - 1] || null;
  saveMaps(); draw(); refreshSelPanel();
  setStatus('已旋轉 ' + selections.length + ' 個圖片 90°', '#7ee0c0');
}
function rotateAction() { if (selections.length) rotateSelection(); else rotateBrush(); }
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
        const t = tileById(s.id) || {}, h = tileH(t);
        if (t.baseHp) {
          const cells = baseSolidForStamp(s, t);
          s.baseSolid = cells.map(([dc, dr]) => axis === 'x' ? [stampW(s, t) - 1 - dc, dr] : [dc, stampH(s, t) - 1 - dr]);
          if (axis === 'y') {
      const depth = Number.isFinite(s.baseDepth) ? s.baseDepth : (Number.isFinite(t.baseDepth) ? t.baseDepth : Math.max(1, h - 2));
            s.baseDepth = stampH(s, t) - depth;
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
// F 快捷鍵（左右翻）：有選取物件就翻選取，否則翻筆刷
function flipAction(axis) { if (selections.length) flipSelection(axis); else toggleBrushFlip(axis); }
document.getElementById('selFlipX').addEventListener('click', () => flipSelection('x'));
document.getElementById('selFlipY').addEventListener('click', () => flipSelection('y'));
document.getElementById('selRotate')?.addEventListener('click', rotateSelection);
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
      // 猜佔幾格：新素材一格畫 60×60（遊戲放大 1.5 倍後剛好 1 點＝1 像素，線條不會粗細不一）；舊素材一格 40×40
      // 寬、高都能被 60 整除 → 當成新素材（÷60）；不然照舊（÷40）。只影響「建議的數字」，已經加過的素材不會變
      const pw = probe.naturalWidth, ph = probe.naturalHeight, new60 = pw % 60 === 0 && ph % 60 === 0, per = new60 ? 60 : CELL;
      const wS = Math.max(1, Math.round(pw / per));
      const hS = Math.max(1, Math.round(ph / per));
      const also40 = new60 && pw % CELL === 0 && ph % CELL === 0 && (pw / CELL !== wS || ph / CELL !== hS);   // 例如 120×120：新素材 2×2、舊素材 3×3
      const hint = new60 ? '依「60px 一格」的新素材建議' + (also40 ? '；如果是 40px 一格的舊素材，請改成 ' + pw / CELL + '×' + ph / CELL + ' 格' : '') : '依圖片大小建議';
      const projectPath = await findProjectImagePath(f.name);
      finishAddTile(projectPath || dataUrl, nameDefault, wS, hS, hint);
    };
    probe.onerror = () => setStatus('圖片讀取失敗，請確認檔案格式是否正確', '#ff8f8f');
    probe.src = dataUrl;
  };
  reader.onerror = () => setStatus('圖片檔案讀取失敗，請重新選取', '#ff8f8f');
  reader.readAsDataURL(f);
  tileFile.value = '';
});
function finishAddTile(path, nameDefault, wS, hS, hint = '依圖片大小建議') {
  const name = (prompt('磚塊名稱？', nameDefault) || nameDefault).trim();
  const w = Math.max(1, parseInt(prompt('這塊圖佔「幾格寬」？（' + hint + '）', wS), 10) || wS);
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

// 格線開關
document.getElementById('gridToggle').addEventListener('click', e => {
  showGrid = !showGrid;
  e.currentTarget.textContent = showGrid ? '🔳 格線：開' : '🔲 格線：關';
  e.currentTarget.classList.toggle('off', !showGrid);
  draw();
  setStatus(showGrid ? '格線已開啟' : '格線已關閉', '#8fd3ff');
});

// 「只貼在整格」勾選框：貼上、拖曳都只落在整格上（記在瀏覽器）
const snapWholeBox = document.getElementById('snapWhole');
if (snapWholeBox) {
  snapWholeBox.checked = snapWhole;
  snapWholeBox.addEventListener('change', () => {
    snapWhole = snapWholeBox.checked;
    try { localStorage.setItem(STORAGE_SNAP_WHOLE, snapWhole ? '1' : '0'); } catch (_) {}
    draw();
    setStatus(snapWhole ? '已改成只貼在整格' : '已恢復四分之一格微調', '#8fd3ff');
  });
}

// 不可穿透紅格的顯示開關（純顯示，不會動到地圖的不可穿透設定）
document.getElementById('solidToggle').addEventListener('click', e => {
  showSolid = !showSolid;
  e.currentTarget.textContent = showSolid ? '🧱 紅綠格：開' : '🧱 紅綠格：關';
  e.currentTarget.classList.toggle('off', !showSolid);
  draw();
  setStatus(showSolid ? '已顯示紅格與怪物出生區綠格' : '已隱藏紅格與怪物出生區綠格（設定保留）', '#8fd3ff');
});
{ const b = document.getElementById('solidToggle'); b.textContent = showSolid ? '🧱 紅綠格：開' : '🧱 紅綠格：關'; b.classList.toggle('off', !showSolid); }   // 按鈕一開始就照預設（關）

document.getElementById('clearLayout').addEventListener('click', () => {
  if (!confirm('確定清空這張地圖的所有圖層、大圖、不可穿透、可破壞與核心候選點？（規則數值不變）')) return;
  pushUndo();
  const m = curMap(); m.layers = emptyLayers(layersOf(m)); m.stamps = []; m.solid = []; m.solidOffsets = {}; m.breakable = []; m.camp = []; m.coreSpots = []; m.spawnZone = []; checkResult = null; solidNudgeCell = null;
  saveMaps(); draw(); setStatus('已清空這張地圖', '#ffd24a');
});

// ================= 地圖管理 =================
const mapSelect = document.getElementById('mapSelect');
function refreshMapSelect() {
  mapSelect.innerHTML = '';
  maps.forEach(m => { const opt = document.createElement('option'); opt.value = m.id; opt.textContent = m.name; if (m.id === curId) opt.selected = true; mapSelect.appendChild(opt); });
}
function newId() { return 'map_' + Date.now().toString(36); }
function blankMap(name) { return fixMap({ id: newId(), name: name || '新地圖', desc: '', layers: emptyLayers(), stamps: [], solid: [], breakable: [], coreSpots: [], spawnZone: [], coreCount: 1, monsterMix: [{ id: 'slime', weight: 100 }], camp: [], rules: {} }); }
function switchTo(id) { curId = id; checkResult = null; selection = null; selections = []; applyMapSize(); refreshSelPanel(); refreshMapSelect(); loadRules(); draw(); }

mapSelect.addEventListener('change', () => switchTo(mapSelect.value));
document.getElementById('newMap').addEventListener('click', () => {
  const name = prompt('新地圖的名稱？', '新地圖 ' + (maps.length + 1)); if (name === null) return;
  pushUndo();
  const m = blankMap(name.trim() || '新地圖'); m.safe = EDITOR_MAP_SAFE; maps.push(m); switchTo(m.id); saveMaps();
});
document.getElementById('dupMap').addEventListener('click', () => {
  MapCopy.open();
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
  deletedMapIds.add(m.id);   // 記下來：之後打開編輯器不會又從 data/maps.js 補回來
  maps = maps.filter(x => x !== m); switchTo(maps[0].id); saveMaps();
  setStatus('已刪除地圖「' + m.name + '」；按「💾 存到專案」後，其他人的編輯器也會跟著刪掉', '#ffd24a');
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
  document.getElementById('f_npcs').checked = !!m.npcs;
  const storyField = document.getElementById('f_story');
  if (storyField) storyField.checked = !!m.story;
  const safeField = document.getElementById('f_safe');
  if (safeField) safeField.checked = !!m.safe;
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
  layersOf(m).forEach(l => {
    const src = m.layers[l.id] || {}, out = {};
    for (const k in src) out[shiftKey(k)] = src[k];
    m.layers[l.id] = out;
  });
  (m.stamps || []).forEach(s => { s.c += dc; s.r += dr; });
  ['solid', 'breakable', 'camp', 'coreSpots', 'spawnZone'].forEach(key => { m[key] = (m[key] || []).map(shiftKey); });
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
  layersOf(m).forEach(l => {
    const src = m.layers[l.id] || {}, out = {};
    for (const k in src) { if (insideKey(k)) out[k] = src[k]; else removed++; }
    m.layers[l.id] = out;
  });
  const before = (m.stamps || []).length;
  m.stamps = (m.stamps || []).filter(s => {
    const t = tileById(s.id) || {};
    return s.c + stampW(s, t) > 0 && s.r + stampH(s, t) > 0 && s.c < m.cols && s.r < m.rows;   // 還有一格在地圖內就留著
  });
  removed += before - m.stamps.length;
  ['solid', 'breakable', 'camp', 'coreSpots', 'spawnZone'].forEach(key => {
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
const storyField = document.getElementById('f_story');
if (storyField) storyField.addEventListener('change', e => {
  pushUndo(); if (e.target.checked) curMap().story = true; else delete curMap().story; saveMaps();
  setStatus(e.target.checked ? '這張是劇情地圖：不生怪、沒有核心、有黑幕（要自己放燈），只有溫特一個人進來；從戰鬥地圖進來時那邊會時間暫停' : '這張地圖不是劇情地圖了', '#8fd3ff');
});
const safeField = document.getElementById('f_safe');
if (safeField) safeField.addEventListener('change', e => {
  pushUndo(); curMap().safe = e.target.checked; saveMaps();
  setStatus(e.target.checked ? '這張劇情地圖是安全場景：不生怪、不套黑幕' : '這張劇情地圖是戰鬥場景：啟用怪物與黑幕', '#8fd3ff');
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

// ================= 存檔用的文字 / 重設 =================
// 開頭這段說明要一字不差（存到專案時，內容沒變就不會重寫檔案）
function exportText() {
  return '/* ===== ' + EDITOR_SETTINGS.exportHeading + '=====\n' +
    '   ' + EDITOR_SETTINGS.exportDescription + '\n' +
    '   素材（磚塊）在三個編輯器共用的 data/tiles.js。\n' +
    '   整段貼回 ' + EDITOR_SETTINGS.outputPath + ' 覆蓋即可。 */\n' +
    'const ' + EDITOR_SETTINGS.outputConst + ' = ' + JSON.stringify(maps, null, 2) + ';\n' +
    deletedMapsExport();
}
// 刪掉的地圖 id（沒有刪過就不寫，檔案跟以前一樣）
function deletedMapsExport() {
  const ids = [...deletedMapIds].filter(id => !maps.some(m => m.id === id)).sort();
  return ids.length ? '// 刪掉的地圖：別人的編輯器打開時，瀏覽器暫存裡的這幾張也會跟著刪掉，不會再被補回來\nconst ' + EDITOR_SETTINGS.deletedConst + ' = ' + JSON.stringify(ids) + ';\n' : '';
}
// 共用素材庫 data/tiles.js（三個編輯器寫出來的內容一模一樣，開頭說明也要一字不差）
function tilesExportText() {
  return '/* ===== 素材庫：三個地圖編輯器共用的磚塊／素材 =====\n' +
    '   在任一個編輯器「⋯ 更多 → ＋ 加入磚塊」加的素材，三邊都能用；地圖本身依分類分開存\n' +
    '   （戰鬥地圖 data/maps.js、基地地圖 data/base-maps.js、劇情地圖 data/story-maps.js）。\n' +
    '   整段貼回 data/tiles.js 覆蓋即可。 */\n' +
    'const SHARED_TILES = ' + JSON.stringify(customTiles, null, 2) + ';\n';
}
document.getElementById('resetFile').addEventListener('click', () => {
  if (!confirm('確定丟棄瀏覽器暫存，改用 ' + EDITOR_SETTINGS.outputPath + ' 和 data/tiles.js 檔案的內容？還沒存到專案的變更會不見。\n（素材庫三個編輯器共用，其他編輯器的素材也會一起重設成檔案的內容）')) return;
  EditorStore.removeItem(STORAGE_MAPS); EditorStore.removeItem(STORAGE_TILES);
  localStorage.removeItem(STORAGE_DELETED_MAPS); deletedMapIds = new Set(FILE_DELETED_MAPS);   // 自己刪、還沒存到專案的也一起丟掉
  selection = null; selections = [];
  loadTiles(); saveTiles(); loadMaps(); applyMapSize(); preloadTiles();   // saveTiles：重設後的素材庫也告訴另一個編輯器
  renderPalette(); refreshMapSelect(); refreshSelPanel(); loadRules(); draw();
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
setStatus('編輯器已就緒。目前有 ' + maps.length + ' 張' + EDITOR_SETTINGS.mapLabel + '、' + palette().length + ' 塊磚塊。', '#7ee0c0');
