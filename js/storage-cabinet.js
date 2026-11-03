// ============================================================
//  置物櫃：指定的櫃子可以打開放東西。借用物資箱的視窗（js/camp-supply.js 的 openCampSupply('cabinet')）：左邊櫃子、右邊溫特的背包，點格子或拖過去就搬到另一邊
//  ・哪些櫃子算：STORAGE_CABINETS 認素材 id，任何地圖擺了這個素材都是置物櫃；每個擺放位置（地圖＋第幾欄、第幾列）各自分開放東西
//  ・櫃子 slots 格，同種物品每 20 個佔一格（跟背包一樣）；只能放「物品」「隊員物資」，重要物品、子彈、防具不行
//  ・存在瀏覽器（tudrc_cabinets_v1），每個櫃子分開
// ============================================================
const STORAGE_CABINETS = [
  { tiles: ['tile_prop_shelf_locker_unit_02'], name: '置物櫃', slots: 20 },   // 層架置物櫃 02：20 格 × 每格 20 個＝最多 400 個
];
const CABINET_TABS = ['consumable', 'squadgear'];   // 能放進櫃子的分類
const CABINET_KEY = 'tudrc_cabinets_v1';
let cabinetData = {};
try { cabinetData = JSON.parse(localStorage.getItem(CABINET_KEY) || '{}') || {}; } catch (_) { cabinetData = {}; }
// 2F 的櫃子從 37,8 搬到 23,13：舊位置放的東西跟著搬過去
if (cabinetData['map_mu5ad7t2@37,8'] && !cabinetData['map_mu5ad7t2@23,13']) { cabinetData['map_mu5ad7t2@23,13'] = cabinetData['map_mu5ad7t2@37,8']; delete cabinetData['map_mu5ad7t2@37,8']; }
function saveCabinets() { try { localStorage.setItem(CABINET_KEY, JSON.stringify(cabinetData)); } catch (_) {} }
const cabinetDefFor = s => !!s && typeof MAP !== 'undefined' && MAP && STORAGE_CABINETS.find(d => d.tiles.includes(s.id)) || null;
// 靠近判定跟裝備箱一樣（js/camp-interactions.js 的 MAP_BOX，kind 'cabinet'）
const cabinetNearPlayer = () => typeof mapBoxNearPlayer === 'function' ? mapBoxNearPlayer('cabinet') : null;
function useCabinetNearPlayer() { const b = cabinetNearPlayer(); if (!b) return false; openCabinet(b.stamp); return true; }
let cabinetOpen = null;   // 打開中的櫃子 { def, key, image }
function openCabinet(s) {
  const def = cabinetDefFor(s); if (!def || !G?.player || G.over) return;
  cabinetOpen = { def, key: MAP.id + '@' + s.c + ',' + s.r, image: mapTileById(s.id)?.file || '' };
  openCampSupply('cabinet');
}
function cabinetStore() { return cabinetData[cabinetOpen.key] || (cabinetData[cabinetOpen.key] = {}); }
const cabinetCount = id => cabinetOpen ? cabinetStore()[id] || 0 : 0;
const cabinetUsed = () => Object.values(cabinetStore()).reduce((sum, n) => sum + Math.ceil(Math.max(0, n) / BAG_STACK_MAX), 0);
function cabinetRoom(id) {
  const n = cabinetCount(id);
  return Math.max(0, cabinetOpen.def.slots - cabinetUsed()) * BAG_STACK_MAX + (n % BAG_STACK_MAX ? BAG_STACK_MAX - n % BAG_STACK_MAX : 0);
}
// 物資箱視窗的設定（js/camp-supply.js 的 CAMP_BOXES 會拿這個）
const CABINET_BOX = {
  title: () => cabinetOpen.def.name, sub: '放身上的物品和隊員物資，每個櫃子分開放', icon: () => cabinetOpen.image, bagName: () => playerName() + '的背包', unit: '個',
  boxName: '櫃子', boxEmoji: '🗄️', crop: false,
  ids: () => allItems().filter(item => CABINET_TABS.includes(item.category)).map(item => item.id),
  box: cabinetCount, bag: id => supplyInventory.get(id) || 0, bagRoom: () => Infinity,
  boxRoom: id => cabinetRoom(id), boxCount: () => cabinetUsed() + ' / ' + cabinetOpen.def.slots + ' 格',
  fullMsg: () => '櫃子滿了（' + cabinetOpen.def.slots + ' 格，每格 ' + BAG_STACK_MAX + ' 個）',
  minCells: () => cabinetOpen.def.slots, stack: BAG_STACK_MAX,
  name: id => itemById(id).name, image: id => itemById(id).image, desc: id => itemDesc(itemById(id)),
  clickTake: () => 1, clickPut: () => 1,
  take(id, n) { const store = cabinetStore(), have = store[id] || 0, got = supplyGain(id, Math.min(n, have)); store[id] = have - got; if (!store[id]) delete store[id]; return got; },   // 背包放不下：留在櫃子裡
  put(id, n) { const have = supplyInventory.get(id) || 0, k = Math.min(n, have, cabinetRoom(id)); if (k <= 0) return 0;
    if (have - k <= 0) supplyInventory.delete(id); else supplyInventory.set(id, have - k); const store = cabinetStore(); store[id] = (store[id] || 0) + k; return k; },
  save: () => saveCabinets(),
};
