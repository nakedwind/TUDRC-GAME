// ============================================================
//  商店：便利商店、飲料店、販賣機共用購物介面
//  ・左邊商品、右邊購物車；結帳後東西放進背包（背包在 js/backpack.js）
//  ・補給：醫療包恢復 HP、杏仁水恢復 SP；戰鬥中按 1～0 快速使用（下方資訊條的快捷格）
//  ・零食、飲料：送禮用（js/gifts.js）
//  ・商品資料在 data/supplies.js
//  ・便利商店：只能在 1 樓 HOME Mart 的結帳櫃台（SHOP_COUNTER）靠近按 Spacenter 打開
//  ・飲料店：地圖編輯器「街道」分類的飲料店素材靠近按 Spacenter 打開，只賣飲料
//  ・販賣機：地圖上的販賣機（素材 id 含 vending）靠近按 Spacenter，用同一個介面，但只賣飲料（kind: 'drink'），購物車跟商店分開
//    2F應變中心的兩台（EOC_VENDING）：紅＝零食、綠＝飲料，各隨機 6 種、每種最多 3 個，每 10 分鐘（現實時間）重新抽、補滿
//  ・零食、飲料：溫特每一種最多帶 CARRY_LIMIT.max 個（所有商店、販賣機都照這個上限）
//  ・後室商店也賣全部的零食、飲料
//  ・後室商店：地圖編輯器「後室便利商店櫃台」靠近按 Spacenter。賣 BACKROOM_SHOP.stock（杏仁水只有這裡買得到），
//    也可以把背包裡的東西賣掉換錢（賣到的錢算進作戰經費，回基地時一起帶回去）
// ============================================================
const supplyShop = document.getElementById('supplyShop');
const supplyShopList = document.getElementById('supplyShopList');
const shopCartList = document.getElementById('cartList');
const storeCart = new Map(), vendingCart = new Map(), vendingCarts = { red: new Map(), green: new Map() };   // 購物車：商品 id → 數量（結帳後才放進背包）；一般商店與飲料店分開
let shopCart = storeCart;
let supplyShopOpen = false, supplyShopTab = 'all';
let vendingMode = false, drinkShopMode = false;   // 販賣機或飲料店模式都只賣飲料
const VENDING = { kinds: ['drink'], reach: 1, match: id => /vending/.test(id) };   // 賣什麼、離販賣機邊緣幾格內按得到、哪些素材算販賣機
const SHOP_COUNTER = { reach: 1.2, match: id => id === 'tile_cvs_checkout_counter' };   // 商店的結帳櫃台（地圖編輯器「結帳櫃台」）
const DRINK_SHOP = { kinds: ['drink'], reach: 1.2, match: id => String(id).startsWith('tile_street_drink_shop_') };
// 後室商店：stock＝賣什麼（price 沒寫就用商品本身的價錢）；sellRate＝賣掉的東西拿回原價的幾成；sellPrice＝沒有原價的東西賣多少
const BACKROOM_SHOP = {
  reach: 1.2, match: id => id === 'tile_cvs_checkout_counter_backroom',
  stock: [{ id: 'almond-water' }, { id: 'thermos' }, { id: 'medkit' }, { id: 'firstaid' }, { id: 'adrenaline' }, { id: 'battery', price: 20 }, { id: 'graffiti-red' }, { id: 'graffiti-blue' }, { id: 'graffiti-black' }],
  sellRate: .5, crystalSellPrice: 5, sellPrice: { battery: 10 },
};
const BACKROOM_ONLY = ['almond-water'];   // 只有在後室（戰鬥地圖）裡的店買得到；基地的便利商店、飲料店、販賣機不賣
// 後室（戰鬥地圖）裡的販賣機、飲料店（60BLUE）賣什麼；基地裡的照舊只賣飲料
const BACKROOM_VENDING = [{ id: 'almond-water' }];
const BACKROOM_DRINKSHOP = [{ id: 'almond-water' }, { id: 'thermos' }];
let backroomMode = false, backroomTab = 'buy';   // backroomTab：buy 購買／sell 賣出（便利商店、飲料店、後室商店都能賣；販賣機不收）
const shopCanSell = () => !vendingMode;
const backroomCart = new Map();
// 暫時開放後室商店購買全部特殊子彈；一般子彈本來就是無限。
const BACKROOM_BULLET_PRICE = 10;   // 每發售價
function backroomBulletStock() {
  return Object.entries(BULLETS).filter(([id, b]) => id !== 'pistol' && !b.removed).map(([id, b]) => ({
    id: 'shop-bullet:' + id, bullet: id, name: b.name, image: b.image, kind: 'ammo', price: BACKROOM_BULLET_PRICE,
    effect: '每份 1 發・持有 ' + bulletCount(id) + ' / ' + b.max,
  }));
}
const shopBulletRoom = item => item.bullet ? Math.max(0, BULLETS[item.bullet].max - bulletCount(item.bullet)) : Infinity;
// ---- 零食、飲料：溫特身上每一種最多帶幾個 ----
const CARRY_LIMIT = { kinds: ['snack', 'drink'], max: 2 };
const carryRoom = item => CARRY_LIMIT.kinds.includes(item.kind) ? Math.max(0, CARRY_LIMIT.max - (supplyInventory.get(item.id) || 0)) : Infinity;
// ---- 2F應變中心的兩台販賣機：紅＝零食、綠＝飲料 ----
// slots＝每台賣幾種（每次補貨時從全部的零食／飲料裡隨機抽）；max＝每種補滿時有幾個；refillMin＝幾分鐘（現實時間）補一次貨
// 庫存存在瀏覽器（store），關掉遊戲時間也照算；開新遊戲會重設（js/new-game.js）
const EOC_VENDING = { map: '2F應變中心', kinds: { red: 'snack', green: 'drink' }, slots: 6, max: 3, refillMin: 10, store: 'tudrc_vending_stock_v1' };
let vendingColor = null;   // 目前打開的是哪一台（red／green；其他地圖的販賣機＝null，照舊只賣飲料）
const vendingColorOf = id => (/vending_red/.test(id) ? 'red' : /vending_green/.test(id) ? 'green' : null);
const isEocVending = () => !!vendingColor && typeof MAP_SAFE !== 'undefined' && MAP_SAFE && MAP && String(MAP.name || '').trim() === EOC_VENDING.map;
function eocVendingState() {
  const period = EOC_VENDING.refillMin * 60000, now = Date.now();
  let st = null; try { st = JSON.parse(localStorage.getItem(EOC_VENDING.store) || 'null'); } catch (_) {}
  if (!st || !(st.at > 0) || now - st.at >= period || now < st.at) {
    st = { at: st && st.at > 0 && now >= st.at ? st.at + Math.floor((now - st.at) / period) * period : now };   // 照 10 分鐘一格往前推，補貨時間不會越拖越晚
    for (const [color, kind] of Object.entries(EOC_VENDING.kinds)) {
      const pool = SUPPLIES.filter(item => item.kind === kind && !item.special).map(item => item.id).sort(() => Math.random() - .5);
      st[color] = Object.fromEntries(pool.slice(0, EOC_VENDING.slots).map(id => [id, EOC_VENDING.max]));   // 商品 id → 剩幾個
    }
    try { localStorage.setItem(EOC_VENDING.store, JSON.stringify(st)); } catch (_) {}
  }
  return st;
}
const eocVendingMinutesLeft = () => Math.max(1, Math.ceil((eocVendingState().at + EOC_VENDING.refillMin * 60000 - Date.now()) / 60000));
// 這一格還能放幾個進購物車：子彈上限、零食飲料的持有上限、販賣機的庫存
function shopRoom(item) {
  let room = Math.min(shopBulletRoom(item), carryRoom(item));
  if (vendingMode && isEocVending()) room = Math.min(room, (eocVendingState()[vendingColor] || {})[item.id] || 0);
  return room;
}
function backroomStock(stock = BACKROOM_SHOP.stock) {
  return stock.map(s => {
    const base = supplyById(s.id) || (typeof itemById === 'function' ? itemById(s.id) : null); if (!base) return null;
    return { ...base, price: s.price ?? base.price, kind: base.kind || base.category || 'material' };
  }).filter(Boolean);
}
// 基地：便利商店賣一般商品、販賣機和飲料店只賣飲料；後室：販賣機、60BLUE 照上面的清單，便利商店多賣杏仁水
// 後室道具（special）只有後室商店賣
const shopItems = () => backroomMode ? [...backroomStock(), ...SUPPLIES.filter(item => (item.kind === 'snack' || item.kind === 'drink') && !item.special), ...backroomBulletStock()]   // 後室商店：全部的零食、飲料都賣
  : vendingMode && isEocVending() ? Object.keys(eocVendingState()[vendingColor] || {}).map(supplyById).filter(Boolean)   // 2F應變中心的販賣機：這次抽到的 6 種
  : vendingMode ? (MAP_SAFE ? SUPPLIES.filter(item => VENDING.kinds.includes(item.kind)) : backroomStock(BACKROOM_VENDING))
  : drinkShopMode ? (MAP_SAFE ? SUPPLIES.filter(item => VENDING.kinds.includes(item.kind)) : backroomStock(BACKROOM_DRINKSHOP))
  : [...SUPPLIES.filter(item => !item.special && (!MAP_SAFE || !BACKROOM_ONLY.includes(item.id))), ...(MAP_SAFE && typeof squadGearShopItems === 'function' ? squadGearShopItems() : [])];   // 基地的便利商店也賣隊員裝備（js/squad-gear.js）
const shopItemById = id => shopItems().find(item => item.id === id) || null;
// 賣掉一個能拿多少錢（0＝不能賣：重要物品、回憶碎片這類 noDrop 的、沒有價錢的）
const CRYSTAL_SELL_ITEM = {id:'anomalous-crystals',name:'異質碎片',image:'images/碎片鑰匙/anomalous-shard.png'};
function sellPriceOf(item) {
  if(item?.id===CRYSTAL_SELL_ITEM.id)return backroomMode?BACKROOM_SHOP.crystalSellPrice:0;
  if (!item || item.noDrop || item.category === 'key') return 0;
  if (BACKROOM_SHOP.sellPrice[item.id] != null) return BACKROOM_SHOP.sellPrice[item.id];
  const sup = supplyById(item.id);
  return sup && sup.price ? Math.max(1, Math.floor(sup.price * BACKROOM_SHOP.sellRate)) : 0;
}
// 補給的效果（商品資料的 use）：hp＝醫療包恢復 HP（Q）、sp＝杏仁水恢復 SP（E）
const SUPPLY_KIND = {
  hp: { name: '醫療包', stat: 'HP', key: 'Q', icon: '❤', color: '#79dbad' },
  sp: { name: '杏仁水', stat: 'SP', key: 'E', icon: '✦', color: '#8cc7ff' },
};
const SHOP_KIND_ORDER = ['medical', 'snack', 'drink', 'squadgear'];   // 商店排序：補給 → 零食 → 飲料 → 隊員裝備
const supplyById = id => SUPPLIES.find(entry => entry.id === id);
function supplyEffect(item) { return item.use ? `${SUPPLY_KIND[item.use].stat} +${item.restore}` : '送禮用'; }
function supplyNeed(use) { return !G?.player ? 0 : use === 'hp' ? G.player.maxhp - G.player.hp : G.guideMax - G.guide; }
function supplyOwnedCount(use) { return SUPPLIES.reduce((sum, item) => sum + (item.use === use ? supplyInventory.get(item.id) || 0 : 0), 0); }
// 快捷使用時挑哪一個：剛好能補滿的裡面挑最小的（不浪費）；都補不滿就挑恢復最多的
function pickSupply(use) {
  const need = supplyNeed(use), owned = SUPPLIES.filter(item => item.use === use && supplyInventory.get(item.id) > 0);
  return owned.filter(item => item.restore >= need).sort((a, b) => a.restore - b.restore)[0] || owned.sort((a, b) => b.restore - a.restore)[0] || null;
}
function renderSupplyStatus() {   // 滑到商品上：下方資訊條的 HP／SP 條會亮出這個商品能補多少
  const bars = [['hp', 'playerHpBar', G?.player?.hp || 0, G?.player?.maxhp || 1], ['sp', 'playerEnergyBar', G?.guide || 0, G?.guideMax || 1]];
  for (const [kind, id, now, max] of bars) {
    const gain = document.getElementById(id)?.parentElement.querySelector('.gain'); if (!gain) continue;
    const add = supplyShopOpen && supplyHover && supplyHover.use === kind ? Math.min(supplyHover.restore, max - now) : 0;
    gain.style.left = Math.min(100, now / max * 100) + '%';
    gain.style.width = Math.max(0, add / max * 100) + '%';
  }
}
let supplyHover = null;
function renderSupplyShop() {
  if (!supplyShopList || !shopCartList) return;
  const money = Math.floor(G?.money || 0), left = money - cartTotal();   // left：扣掉購物車後還能花的錢
  document.getElementById('shopMoney').textContent = money;
  document.querySelectorAll('[data-supply-tab]').forEach(tab => {
    const n = shopItems().filter(item => tab.dataset.supplyTab === 'all' || item.kind === tab.dataset.supplyTab).length;
    tab.querySelector('em').textContent = n;
  });
  renderBackroomTabs();
  supplyShop.classList.toggle('selling', shopCanSell() && backroomTab === 'sell');
  if (shopCanSell() && backroomTab === 'sell') { renderSellList(money); renderCart(money); return; }
  const visible = shopItems().filter(item => vendingMode || backroomMode || supplyShopTab === 'all' || item.kind === supplyShopTab)
    .sort((a, b) => (SHOP_KIND_ORDER.indexOf(a.kind) - SHOP_KIND_ORDER.indexOf(b.kind)) || a.price - b.price);   // 補給 → 零食 → 飲料，各自由便宜到貴
  supplyShopList.innerHTML = visible.map(item => {
    const use = item.use && SUPPLY_KIND[item.use], inCart = shopCart.get(item.id) || 0, short = item.price - left;
    const full = inCart >= shopRoom(item);
    const left2 = isEocVending() ? (eocVendingState()[vendingColor] || {})[item.id] || 0 : null, owned = supplyInventory.get(item.id) || 0;
    const limitTxt = (left2 != null ? (left2 ? '・剩 ' + left2 + ' 個' : '・售完') : '') + (CARRY_LIMIT.kinds.includes(item.kind) ? '・持有 ' + owned + '/' + CARRY_LIMIT.max : '');
    return `<article class="shop-item ${item.kind} ${item.use || 'gift'}" data-item="${item.id}">
      ${inCart ? `<span class="shop-owned" title="購物車裡有 ${inCart} 個">🛒${inCart}</span>` : ''}
      <div class="shop-item-image"><img src="${item.image}" alt=""><strong title="${item.name}">${item.name}</strong></div>
      <span class="shop-effect">${use ? use.icon + ' ' + supplyEffect(item) : item.effect ? item.effect : item.id === 'battery' ? '🔋 手電筒用' : '🎁 送禮用'}${limitTxt}</span>
      <button class="shop-buy" type="button" data-buy-supply="${item.id}" ${full ? `disabled aria-label="${item.name}，已達持有上限"` : short > 0 ? `disabled aria-label="${item.name}，還差 $${short}"` : `aria-label="把 ${item.name} 加入購物車，$${item.price}"`}>${full ? '已達上限' : short > 0 ? `還差 $${short}` : `<span>加入</span><b>$${item.price}</b>`}</button>
    </article>`;
  }).join('');
  renderCart(money);
}
function renderCart(money) {
  const left = money - cartTotal();
  const cart = shopItems().filter(item => shopCart.get(item.id) > 0), total = cartTotal();
  document.getElementById('cartCount').textContent = [...shopCart.values()].reduce((sum, n) => sum + n, 0);
  document.getElementById('cartTotal').textContent = total;
  document.getElementById('cartRemain').textContent = money - total;
  document.getElementById('cartClear').disabled = !cart.length;
  const checkout = document.getElementById('cartCheckout');
  checkout.disabled = !cart.length || total > money;
  checkout.textContent = total > money ? `還差 $${total - money}` : '結帳';
  shopCartList.innerHTML = cart.length ? cart.map(item => {
    const n = shopCart.get(item.id);
    return `<div class="cart-row ${item.kind}" data-cart-item="${item.id}">
      <img src="${item.image}" alt=""><span class="slot-info"><strong>${item.name}</strong><small>$${item.price * n}</small></span>
      <span class="cart-qty"><button type="button" data-cart-dec="${item.id}" aria-label="${item.name} 少一個">${n > 1 ? '−' : '🗑'}</button><b>${n}</b><button type="button" data-cart-inc="${item.id}" aria-label="${item.name} 多一個" ${item.price > left ? 'disabled' : ''}>＋</button></span></div>`;
  }).join('') : '<span class="supply-empty">購物車是空的</span>';
  renderSupplyStatus();
}
// 下方資訊條的快捷格：醫療包（Q）、杏仁水（E）
let quickSupplyKey = '';
function renderQuickSupplies() {
  const box = document.getElementById('quickSupplies'); if (!box) return;
  const state = ['hp', 'sp'].map(kind => { const pick = pickSupply(kind); return [kind, pick?.id || '', supplyOwnedCount(kind), supplyNeed(kind) <= 0]; });
  const key = JSON.stringify(state); if (key === quickSupplyKey) return; quickSupplyKey = key;
  box.innerHTML = state.map(([kind, id, count, full]) => {
    const k = SUPPLY_KIND[kind], item = supplyById(id);
    const tip = !count ? `沒有${k.name}` : full ? `${k.stat} 已滿` : `${k.key}｜${item.name} ${supplyEffect(item)}`;
    return `<button class="quick-supply ${kind}" type="button" data-quick-supply="${kind}" ${!count || full ? 'disabled' : ''} title="${tip}" aria-label="${tip}">
      <span class="qs-icon">${item ? `<img src="${item.image}" alt="">` : k.icon}</span><span class="qs-text"><small>${k.name}</small><b>×${count}</b></span><kbd>${k.key}</kbd></button>`;
  }).join('');
}
// 「購買／賣出」分頁（後室商店取代分類分頁；便利商店在賣出時把分類分頁收起來）
function renderBackroomTabs() {
  let nav = supplyShop.querySelector('.backroom-tabs');
  if (!shopCanSell()) { if (nav) nav.remove(); return; }
  if (!nav) {
    nav = document.createElement('nav'); nav.className = 'supply-shop-tabs backroom-tabs'; nav.setAttribute('role', 'tablist');
    supplyShop.querySelector('.supply-shop-tabs').before(nav);
  }
  const sellable = [...supplyInventory.entries()].filter(([id, n]) => n > 0 && sellPriceOf(typeof itemById === 'function' ? itemById(id) : null) > 0).length + (backroomMode && training.crystals > 0 ? 1 : 0);
  nav.innerHTML = '<button type="button" role="tab" data-backroom-tab="buy" class="' + (backroomTab === 'buy' ? 'active' : '') + '">🛒 購買</button>' +
    '<button type="button" role="tab" data-backroom-tab="sell" class="' + (backroomTab === 'sell' ? 'active' : '') + '">💰 賣出 <em>' + sellable + '</em></button>';
}
// 賣出清單：背包裡能賣的東西，一次賣一個
function renderSellList() {
  const rows = [...supplyInventory.entries()].map(([id, n]) => ({ item: typeof itemById === 'function' ? itemById(id) : null, n }))
    .filter(r => r.item && r.n > 0 && sellPriceOf(r.item) > 0);
  if(backroomMode && training.crystals>0)rows.unshift({item:CRYSTAL_SELL_ITEM,n:training.crystals});
  supplyShopList.innerHTML = rows.length ? rows.map(({ item, n }) => `<article class="shop-item sell" data-item="${item.id}">
      <span class="shop-owned" title="背包裡有 ${n} 個">×${n}</span>
      <div class="shop-item-image"><img src="${item.image}" alt=""><strong title="${item.name}">${item.name}</strong></div>
      <span class="shop-effect">賣一個 $${sellPriceOf(item)}</span>
      <button class="shop-buy sell-btn" type="button" data-sell-item="${item.id}" aria-label="賣掉一個 ${item.name}，$${sellPriceOf(item)}"><span>賣出</span><b>+$${sellPriceOf(item)}</b></button>
    </article>`).join('') : '<p class="supply-empty" style="grid-column:1/-1">背包裡沒有可以賣的東西（重要物品、回憶碎片不能賣）</p>';
}
function sellItem(id) {
  if(id===CRYSTAL_SELL_ITEM.id){
    if(!G||!shopCanSell()||!backroomMode||training.crystals<1){sfx('error');return;}
    const price=BACKROOM_SHOP.crystalSellPrice;
    training.crystals-=1;G.money+=price;saveTraining();
    if(G.battle&&!MAP_SAFE)G.battle.sold=(G.battle.sold||0)+price;
    SFX.play('shopCheckout',.5,'shop-sell');updateHUD();renderSupplyShop();
    supplyShopList.querySelector('[data-sell-item="anomalous-crystals"]')?.focus();
    return;
  }
  const item = typeof itemById === 'function' ? itemById(id) : null, price = sellPriceOf(item), n = supplyInventory.get(id) || 0;
  if (!item || !price || n <= 0 || !G) { sfx('error'); return; }
  if (n <= 1) supplyInventory.delete(id); else supplyInventory.set(id, n - 1);
  G.money += price;
  if (G.battle && !MAP_SAFE) G.battle.sold = (G.battle.sold || 0) + price;   // 結算畫面
  SFX.play('shopCheckout', .5, 'shop-sell');
  updateHUD(); renderSupplyShop();
  const btn = supplyShopList.querySelector(`[data-sell-item="${id}"]`); if (btn) btn.focus();
}
// 商店／飲料店／販賣機／後室商店共用一個視窗：切換標題、分頁、購物車
function setShopMode(mode) {
  vendingMode = mode === 'vending'; drinkShopMode = mode === 'drinkshop'; backroomMode = mode === 'backroom';
  backroomTab = 'buy';
  if (!vendingMode) vendingColor = null;
  shopCart = backroomMode ? backroomCart : vendingMode && isEocVending() ? vendingCarts[vendingColor] : vendingMode || drinkShopMode ? vendingCart : storeCart;
  supplyShop.classList.toggle('vending', vendingMode);
  supplyShop.classList.toggle('drinkshop', drinkShopMode);
  supplyShop.classList.toggle('backroom', backroomMode);
  const eoc = vendingMode && isEocVending();
  const smallTitle = backroomMode ? '後室・便利商店' : eoc ? '自動販賣機・' + eocVendingMinutesLeft() + ' 分鐘後補貨' : vendingMode ? '自動販賣機' : drinkShopMode ? '飲料店' : '便利商店';
  const title = backroomMode ? '後室商店' : eoc ? (vendingColor === 'red' ? '零食販賣機' : '飲料販賣機') : vendingMode ? '販賣機' : drinkShopMode ? '飲料店' : '商店';
  supplyShop.querySelector('.shop-title small').textContent = smallTitle;
  document.getElementById('supplyShopTitle').textContent = title;
  supplyShop.querySelector('.shop-sign').textContent = eoc && vendingColor === 'red' ? '🍘' : vendingMode || drinkShopMode ? '🥤' : '24H';
  document.getElementById('supplyShopClose').setAttribute('aria-label', '關閉' + title + '（Esc）');
}
function openSupplyShop() {
  if (!G || G.over || !G.player || supplyShopOpen) return;
  if (!MAP_SAFE) return openBackroomShop();   // 在後室（戰鬥地圖）裡的便利商店櫃台＝後室商店
  setShopMode('store');
  supplyShopOpen = true; aimHeld = false; supplyHover = null; Object.keys(keys).forEach(key => { keys[key] = false; });
  closeBackpack(true); closeElevatorMenu(); closeDialogue(true); closeSentryMenu(); closeGroundMenu(); closeBuildMenu();
  renderSupplyShop(); supplyShop.classList.remove('hidden'); SFX.play('shopEnter', .7, 'shop-enter'); document.getElementById('supplyShopClose').focus();   // 全家便利商店進門聲
}
function openVendingMachine() {
  if (!G || G.over || !G.player || supplyShopOpen) return;
  const near = vendingNearPlayer(); vendingColor = near ? vendingColorOf(near.id) : null;   // 哪一台（2F應變中心：紅＝零食、綠＝飲料）
  setShopMode('vending');
  supplyShopOpen = true; aimHeld = false; supplyHover = null; Object.keys(keys).forEach(key => { keys[key] = false; });
  closeBackpack(true); closeElevatorMenu(); closeDialogue(true); closeSentryMenu(); closeGroundMenu(); closeBuildMenu();
  supplyShopList.scrollTop = 0; renderSupplyShop(); supplyShop.classList.remove('hidden'); SFX.play('vendingOpen', .7, 'vending-open'); document.getElementById('supplyShopClose').focus();
}
function openBackroomShop() {
  if (!G || G.over || !G.player || supplyShopOpen) return;
  setShopMode('backroom');
  supplyShopOpen = true; aimHeld = false; supplyHover = null; Object.keys(keys).forEach(key => { keys[key] = false; });
  closeBackpack(true); closeElevatorMenu(); closeDialogue(true); closeSentryMenu(); closeGroundMenu(); closeBuildMenu();
  supplyShopList.scrollTop = 0; renderSupplyShop(); supplyShop.classList.remove('hidden'); SFX.play('shopBell', .7, 'shop-bell'); document.getElementById('supplyShopClose').focus();   // 後室商店：打開時播便利商店門鈴
}
function backroomShopNearPlayer() { return shopStampNearPlayer(BACKROOM_SHOP); }
function openDrinkShop() {
  if (!G || G.over || !G.player || supplyShopOpen) return;
  setShopMode('drinkshop');
  supplyShopOpen = true; aimHeld = false; supplyHover = null; Object.keys(keys).forEach(key => { keys[key] = false; });
  closeBackpack(true); closeElevatorMenu(); closeDialogue(true); closeSentryMenu(); closeGroundMenu(); closeBuildMenu();
  supplyShopList.scrollTop = 0; renderSupplyShop(); supplyShop.classList.remove('hidden'); sfx('menu'); document.getElementById('supplyShopClose').focus();
}
// 玩家旁邊的販賣機、飲料店、便利商店櫃台（離素材邊緣 reach 格內）
function vendingNearPlayer() { return shopStampNearPlayer(VENDING); }
function drinkShopNearPlayer() { return shopStampNearPlayer(DRINK_SHOP); }
function shopCounterNearPlayer() { return shopStampNearPlayer(SHOP_COUNTER); }
function shopStampNearPlayer(cfg) {
  if (!G || !G.player || !MAP) return null;
  const p = G.player; let best = null, bestD = cfg.reach * CELL;
  for (const s of MAP.stamps || []) {
    if (!cfg.match(s.id)) continue;
    const t = mapTileById(s.id); if (!t) continue;
    const x0 = OX + s.c * CELL + (s.ox || 0), y0 = OY + s.r * CELL + (s.oy || 0), x1 = x0 + mapTileW(t) * CELL, y1 = y0 + mapTileH(t) * CELL;
    const d = Math.hypot(Math.max(x0 - p.x, 0, p.x - x1), Math.max(y0 - p.y, 0, p.y - y1));
    if (d <= bestD) { bestD = d; best = { x: (x0 + x1) / 2, top: y0, dist: d, id: s.id }; }
  }
  return best;
}
function closeSupplyShop(silent = false) { if (!supplyShopOpen) return; supplyShopOpen = false; supplyHover = null; renderSupplyStatus(); supplyShop.classList.add('hidden'); if (!silent) sfx('switch'); }
const cartTotal = () => shopItems().reduce((sum, item) => sum + item.price * (shopCart.get(item.id) || 0), 0);
function addToCart(id, focusCard = true) {
  const item = shopItemById(id);
  if (!item || !G || G.money - cartTotal() < item.price) { sfx('error'); return; }
  if ((shopCart.get(id) || 0) >= shopRoom(item)) { sfx('error'); return; }
  shopCart.set(id, (shopCart.get(id) || 0) + 1);
  sfx('button'); renderSupplyShop();
  const card = supplyShopList.querySelector(`[data-item="${id}"]`);   // 加入的那張卡片發光、冒出 +1
  if (card) { card.classList.add('bought'); const pop = document.createElement('i'); pop.className = 'shop-pop'; pop.textContent = '+1'; card.appendChild(pop); }
  const cart = document.querySelector('.shop-cart'); if (cart) { cart.classList.remove('bump'); void cart.offsetWidth; cart.classList.add('bump'); }
  if (focusCard) { const btn = card?.querySelector('.shop-buy'); if (btn && !btn.disabled) btn.focus(); }   // 鍵盤連按 Enter 可以一直加
}
function removeFromCart(id) {
  const n = shopCart.get(id) || 0; if (!n) return;
  if (n <= 1) shopCart.delete(id); else shopCart.set(id, n - 1);
  sfx('switch'); renderSupplyShop();
}
function checkoutCart() {
  const total = cartTotal();
  if (!shopCart.size || !G || total > G.money) { sfx('error'); return; }
  for (const [id, n] of shopCart) {
    const item = shopItemById(id);
    if (!item || n > shopRoom(item)) { sfx('error'); systemNotice(item && item.bullet ? '子彈已達持有上限，請調整購物車數量' : '超過持有上限（每種最多 ' + CARRY_LIMIT.max + ' 個）或販賣機庫存不夠，請調整購物車數量', true); return; }
  }
  const count = [...shopCart.values()].reduce((sum, n) => sum + n, 0);
  G.money -= total;
  if (typeof achieveOnSpend === 'function') achieveOnSpend(vendingMode ? 'vending' : 'shop', total, count, [...shopCart.keys()]);   // 成就：販賣機／商店的購買
  if (vendingMode && isEocVending()) {   // 2F應變中心的販賣機：扣庫存
    const st = eocVendingState(), box = st[vendingColor] || {};
    for (const [id, n] of shopCart) if (id in box) box[id] = Math.max(0, box[id] - n);
    try { localStorage.setItem(EOC_VENDING.store, JSON.stringify(st)); } catch (_) {}
  }
  for (const [id, n] of shopCart) {
    const item = shopItemById(id);
    if (item.bullet) addBullets(item.bullet, n);
    else supplyInventory.set(id, (supplyInventory.get(id) || 0) + n);
  }
  shopCart.clear();
  if (vendingMode) { SFX.play('vendingCheckout', .7, 'vending-checkout'); systemNotice(`販賣機掉出 ${count} 瓶飲料（$${total}），已放進背包`); }
  else if (drinkShopMode) { SFX.play('shopCheckout', .7, 'shop-checkout'); systemNotice(`飲料店結帳 $${total}，${count} 杯已放進背包`); }
  else if (backroomMode) { SFX.play('shopCheckout', .7, 'shop-checkout'); systemNotice(`後室商店結帳 $${total}，${count} 件已放進背包`); }
  else { SFX.play('shopCheckout', .7, 'shop-checkout'); systemNotice(`結帳 $${total}，${count} 件已放進背包`); }
  updateHUD(); renderSupplyShop();
  const link = document.getElementById('shopOpenBackpack'); link.classList.remove('flash'); void link.offsetWidth; link.classList.add('flash'); link.focus();
}
function useSupply(id) {
  const item = supplyById(id), count = supplyInventory.get(id) || 0;
  if (!item || !G?.player || count <= 0) return false;
  if (!item.use) return false;   // 零食飲料不能直接吃（送禮用）
  // 醫療包（補 HP）：站著包紮，進度條跑完才補血（js/channel-actions.js）；杏仁水照常馬上喝
  if (item.use === 'hp' && typeof startChannel === 'function') {
    if (playerChannel) return false;
    if (supplyNeed('hp') <= 0) { sfx('error'); flash('HP 已滿', G.player.x, G.player.y - 54, '#c9d3dc'); return false; }
    startChannel({ kind: 'medkit', total: CHANNEL_TIME.medkit, target: G.player, label: '包紮中', color: '#79dbad', onDone: () => applySupplyNow(id) });
    return true;
  }
  return applySupplyNow(id);
}
function applySupplyNow(id) {
  const item = supplyById(id), count = supplyInventory.get(id) || 0;
  if (!item || !G?.player || count <= 0) return false;
  const amount = item.restore;
  const restored = Math.min(amount, supplyNeed(item.use));
  if (restored <= 0) { sfx('error'); flash(`${SUPPLY_KIND[item.use].stat} 已滿`, G.player.x, G.player.y - 54, '#c9d3dc'); return false; }
  if (item.use === 'hp') G.player.hp += restored; else G.guide += restored;
  if (typeof achieveOnSupply === 'function') achieveOnSupply(item);   // 成就：一場戰鬥用了幾個醫療包、杏仁水
  if (count <= 1) supplyInventory.delete(id); else supplyInventory.set(id, count - 1);
  const k = SUPPLY_KIND[item.use];
  sfx(item.use === 'sp' ? 'drink' : 'soothe');   // 杏仁水：喝飲料的聲音；醫療包維持原本的聲音
  flash(`${item.name}　+${Math.ceil(restored)} ${k.stat}`, G.player.x, G.player.y - 54, k.color);
  updateHUD(); if (supplyShopOpen) renderSupplyShop(); if (backpackOpen) renderBackpack();
  return true;
}
function quickUseSupply(kind) {
  const k = SUPPLY_KIND[kind], item = pickSupply(kind);
  if (!item) { sfx('error'); flash(`沒有${k.name}了`, G.player.x, G.player.y - 54, '#c9d3dc'); return; }
  useSupply(item.id);
}
// 下方的「商店」按鈕拿掉了：商店要走到 1 樓 HOME Mart 的櫃台才能開
document.getElementById('shopOpenBackpack').addEventListener('click', () => { closeSupplyShop(true); openBackpack(); });
document.getElementById('quickSupplies').addEventListener('click', e => { const b = e.target.closest('[data-quick-supply]'); if (b && G?.player) quickUseSupply(b.dataset.quickSupply); });
document.getElementById('supplyShopClose').addEventListener('click', () => closeSupplyShop());
supplyShop.addEventListener('click', e => {
  const bt = e.target.closest('[data-backroom-tab]'); if (bt) { backroomTab = bt.dataset.backroomTab; supplyShopList.scrollTop = 0; sfx('switch'); renderSupplyShop(); return; }
  const sell = e.target.closest('[data-sell-item]'); if (sell) { sellItem(sell.dataset.sellItem); return; }
});
supplyShop.addEventListener('click', e => { if (e.target === supplyShop) { closeSupplyShop(); return; } if (e.target.closest('[data-backroom-tab], [data-sell-item]')) return; const buy = e.target.closest('[data-buy-supply]'); if (buy) addToCart(buy.dataset.buySupply);
  const inc = e.target.closest('[data-cart-inc]'); if (inc) { addToCart(inc.dataset.cartInc, false); shopCartList.querySelector(`[data-cart-inc="${inc.dataset.cartInc}"]:not(:disabled)`)?.focus(); }
  const dec = e.target.closest('[data-cart-dec]'); if (dec) { removeFromCart(dec.dataset.cartDec); (shopCartList.querySelector(`[data-cart-dec="${dec.dataset.cartDec}"]`) || document.getElementById('supplyShopClose')).focus(); }
  if (e.target.closest('#cartClear')) { shopCart.clear(); sfx('switch'); renderSupplyShop(); }
  if (e.target.closest('#cartCheckout')) checkoutCart(); });
supplyShop.addEventListener('animationend', e => { if (e.target.classList.contains('shop-pop')) e.target.remove(); else e.target.classList.remove('bought', 'bump', 'flash'); });
supplyShopList.addEventListener('mouseover', e => { const card = e.target.closest('[data-item]'); const item = card ? supplyById(card.dataset.item) : null; if (item !== supplyHover) { supplyHover = item; renderSupplyStatus(); } });
supplyShopList.addEventListener('mouseleave', () => { supplyHover = null; renderSupplyStatus(); });
document.querySelectorAll('[data-supply-tab]').forEach(button => button.addEventListener('click', () => { supplyShopTab = button.dataset.supplyTab; document.querySelectorAll('[data-supply-tab]').forEach(tab => { tab.classList.toggle('active', tab === button); tab.setAttribute('aria-selected', tab === button); }); supplyShopList.scrollTop = 0; renderSupplyShop(); sfx('switch'); }));
window.addEventListener('keydown', e => {   // F 急救（旁邊的隊員需要急救時）；1～0 是快捷欄（js/quick-slots.js）
  const k = e.key.toLowerCase();
  if (e.repeat || k !== 'f' || e.ctrlKey || e.altKey || e.metaKey) return;
  if (e.target instanceof Element && e.target.closest('input, textarea, select, [contenteditable]')) return;
  if (!G?.player || G.over || MAP_SAFE || dialogueState || elevatorMenuOpen || mapTransitioning || G.player.hp <= 0) return;
  e.preventDefault();
  if (k === 'f') {   // F＝急救：旁邊的隊員需要急救、也有對應的急救包時才有作用（js/equipment.js）
    const aidT = typeof aidKeyTarget === 'function' ? aidKeyTarget() : null;
    if (aidT) firstAidOn(aidT);
    return;
  }
});
