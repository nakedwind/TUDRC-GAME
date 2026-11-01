// ============================================================
//  收納櫃：指定的櫃子可以打開放東西。借用背包視窗（js/backpack.js），左邊不顯示溫特立繪。
//  ・哪些櫃子算：STORAGE_CABINETS（地圖 id＋第幾欄、第幾列＋素材 id），其他同樣的櫃子還是裝飾
//  ・上方分類條最右邊「背包｜櫃子」切換預覽；背包裡的東西按「放入櫃子」，櫃子裡的按「放到身上」
//  ・櫃子 slots 格，同種物品每 20 個佔一格（跟背包一樣）；只能放「物品」「隊員物資」，重要物品、子彈、防具不行
//  ・存在瀏覽器（tudrc_cabinets_v1），每個櫃子分開
// ============================================================
const STORAGE_CABINETS = [
  { map: 'map_mu5ad7t2', c: 37, r: 8, tiles: ['tile_prop_shelf_locker_unit', 'tile_prop_shelf_locker_unit_02'], name: '層架置物櫃', slots: 15 },   // 2F應變中心
];
const CABINET_TABS = ['consumable', 'squadgear'];   // 能放進櫃子的分類（背包預覽也只顯示這幾個分頁）
const CABINET_KEY = 'tudrc_cabinets_v1';
let cabinetData = {};
try { cabinetData = JSON.parse(localStorage.getItem(CABINET_KEY) || '{}') || {}; } catch (_) { cabinetData = {}; }
function saveCabinets() { try { localStorage.setItem(CABINET_KEY, JSON.stringify(cabinetData)); } catch (_) {} }
const cabinetSameMap = (a, b) => !!a && !!b && String(a).toLowerCase() === String(b).toLowerCase();
const cabinetDefFor = s => !!s && typeof MAP !== 'undefined' && MAP && STORAGE_CABINETS.find(d => cabinetSameMap(d.map, MAP.id) && d.c === s.c && d.r === s.r && d.tiles.includes(s.id)) || null;
// 靠近判定跟裝備箱一樣（js/camp-interactions.js 的 MAP_BOX，kind 'cabinet'）
const cabinetNearPlayer = () => typeof mapBoxNearPlayer === 'function' ? mapBoxNearPlayer('cabinet') : null;
function useCabinetNearPlayer() { const b = cabinetNearPlayer(); if (!b) return false; openCabinet(b.stamp); return true; }
function openCabinet(s) {
  const def = cabinetDefFor(s); if (!def || !G?.player || G.over) return;
  closeBackpack(true);
  cabinetOpen = { def, key: MAP.id + '@' + s.c + ',' + s.r }; cabinetView = 'cabinet'; backpackTab = 'consumable'; backpackSel = null;
  openBackpack();
  if (!backpackOpen) cabinetOpen = null;
}
function cabinetStore() { return cabinetData[cabinetOpen.key] || (cabinetData[cabinetOpen.key] = {}); }
const cabinetCount = id => cabinetOpen ? cabinetStore()[id] || 0 : 0;
const cabinetUsed = () => Object.values(cabinetStore()).reduce((sum, n) => sum + Math.ceil(Math.max(0, n) / BAG_STACK_MAX), 0);
function cabinetRoom(id) {
  const n = cabinetCount(id);
  return Math.max(0, cabinetOpen.def.slots - cabinetUsed()) * BAG_STACK_MAX + (n % BAG_STACK_MAX ? BAG_STACK_MAX - n % BAG_STACK_MAX : 0);
}
const cabinetItems = () => allItems().filter(item => cabinetCount(item.id) > 0);
function setCabinetView(view) {
  if (!cabinetOpen || cabinetView === view) return;
  cabinetView = view; backpackSel = null; bagDropQty = 1; sfx('switch'); renderBackpack();
}
// 分類條：背包預覽＝能放的分頁；櫃子預覽＝一個「櫃子 幾格/幾格」。最右邊都是「背包｜櫃子」切換
function cabinetTabsHtml(tabBtn, cats) {
  const left = cabinetView === 'cabinet'
    ? `<button type="button" role="tab" class="active" aria-selected="true">🗄️ ${cabinetOpen.def.name}<em class="bag-tab-count">${cabinetUsed()}/${cabinetOpen.def.slots}</em></button>`
    : cats.map(tabBtn).join('');
  const seg = v => `<button type="button" data-cabinet-view="${v}" class="${cabinetView === v ? 'active' : ''}" aria-pressed="${cabinetView === v}">${v === 'bag' ? '🎒 背包' : '🗄️ 櫃子'}</button>`;
  return left + `<span class="bag-view-toggle" role="group" aria-label="切換背包／櫃子預覽">${seg('bag')}${seg('cabinet')}</span>`;
}
function renderCabinetDetail() {
  backpackDetail.classList.remove('gear-detail');
  const inCab = cabinetView === 'cabinet', item = itemById(backpackSel);
  if (!item) { backpackDetail.innerHTML = `<div class="bag-detail-empty"><span>${inCab ? '🗄️' : '🎒'}</span><p>${inCab ? '櫃子裡沒有東西' : '沒有可以放進櫃子的物品'}</p></div>`; return; }
  const cat = categoryOf(item.category), count = inCab ? cabinetCount(item.id) : supplyInventory.get(item.id) || 0;
  const kind = item.use && SUPPLY_KIND[item.use], q = Math.min(bagDropQty, count);
  const qty = count > 1 ? `<div class="bag-qty"><button type="button" data-drop-qty="-1" aria-label="少一個" ${q <= 1 ? 'disabled' : ''}>−</button><b>${q}</b><button type="button" data-drop-qty="1" aria-label="多一個" ${q >= count ? 'disabled' : ''}>＋</button></div>` : '';
  backpackDetail.innerHTML = `
    <div class="bag-detail-image"><img src="${item.image}" alt=""></div>
    <div class="bag-item-heading"><h3>${item.name}</h3>
    <div class="bag-tags"><span class="bag-tag">${BAG_ICON[cat.id] || cat.icon + ' '}${cat.name}</span>${kind ? `<span class="bag-tag effect ${item.use}">${kind.icon} ${supplyEffect(item)}</span>` : item.effect ? `<span class="bag-tag effect">${item.effect}</span>` : ''}</div></div>
    ${itemDesc(item) ? `<p class="bag-desc">${itemDesc(item)}</p>` : ''}
    <div class="bag-actions">
      <div class="bag-quick bag-use-slot"><small>${inCab ? '櫃子裡有 ' + count + ' 個' : '身上有 ' + count + ' 個'}</small></div>
      <button type="button" class="bag-use" data-cabinet-move="${item.id}">${inCab ? '放到身上' : '放入櫃子'}</button>
      ${inCab ? `<div class="bag-drop-row">${qty}</div>` : canDrop(item) ? dropRowHtml(item, count) : `<div class="bag-drop-row">${qty}</div>`}
    </div>`;
}
// 搬 n 個：背包預覽＝背包 → 櫃子；櫃子預覽＝櫃子 → 背包（背包放不下的留在櫃子裡）
function cabinetMove(id, n) {
  if (!cabinetOpen) return;
  const item = itemById(id); if (!item) return;
  const store = cabinetStore();
  if (cabinetView === 'bag') {
    if (!CABINET_TABS.includes(item.category)) { sfx('error'); systemNotice('這個不能放進櫃子', true); return; }
    const have = supplyInventory.get(id) || 0, k = Math.min(n, have, cabinetRoom(id));
    if (k <= 0) { sfx('error'); systemNotice('櫃子滿了（' + cabinetOpen.def.slots + ' 格，每格 ' + BAG_STACK_MAX + ' 個）', true); return; }
    supplyInventory.set(id, have - k);
    store[id] = (store[id] || 0) + k;
  } else {
    const have = store[id] || 0, k = supplyGain(id, Math.min(n, have));   // 背包放不下：supplyGain 會跳提示
    if (k <= 0) { sfx('error'); return; }
    store[id] = have - k; if (!store[id]) delete store[id];
  }
  saveCabinets(); bagDropQty = 1; sfx('place');
  if (typeof updateHUD === 'function') updateHUD();
  renderBackpack();
  (backpackDetail.querySelector('.bag-use') || backpackGrid.querySelector('.bag-cell.sel') || document.getElementById('backpackClose')).focus();
}
