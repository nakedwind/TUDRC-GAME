// ============================================================
//  便利商店：買零食（恢復 HP）、飲料（恢復 SP 精神能量）
//  ・左邊商品、右邊購物車；結帳後東西放進背包（背包在 js/backpack.js）
//  ・戰鬥中按 Q 吃零食、F 喝飲料（下方資訊條的快捷格）
//  ・商品資料在 data/supplies.js
// ============================================================
const supplyShop = document.getElementById('supplyShop');
const supplyShopList = document.getElementById('supplyShopList');
const shopCartList = document.getElementById('cartList');
const shopCart = new Map();   // 購物車：商品 id → 數量（結帳後才放進背包）
let supplyShopOpen = false, supplyShopTab = 'all';
const SUPPLY_KIND = {
  snack: { name: '零食', stat: 'HP', key: 'Q', icon: '❤', color: '#79dbad' },
  drink: { name: '飲料', stat: 'SP', key: 'F', icon: '✦', color: '#8cc7ff' },
};
const supplyById = id => SUPPLIES.find(entry => entry.id === id);
function supplyEffect(item) { return `${SUPPLY_KIND[item.kind].stat} +${item.restore}`; }
function supplyNeed(kind) { return !G?.player ? 0 : kind === 'snack' ? G.player.maxhp - G.player.hp : G.guideMax - G.guide; }
function supplyOwnedCount(kind) { return SUPPLIES.reduce((sum, item) => sum + (item.kind === kind ? supplyInventory.get(item.id) || 0 : 0), 0); }
// 快捷使用時挑哪一個：剛好能補滿的裡面挑最小的（不浪費）；都補不滿就挑恢復最多的
function pickSupply(kind) {
  const need = supplyNeed(kind), owned = SUPPLIES.filter(item => item.kind === kind && supplyInventory.get(item.id) > 0);
  return owned.filter(item => item.restore >= need).sort((a, b) => a.restore - b.restore)[0] || owned.sort((a, b) => b.restore - a.restore)[0] || null;
}
function renderSupplyStatus() {   // 滑到商品上：下方資訊條的 HP／SP 條會亮出這個商品能補多少
  const bars = [['snack', 'playerHpBar', G?.player?.hp || 0, G?.player?.maxhp || 1], ['drink', 'playerEnergyBar', G?.guide || 0, G?.guideMax || 1]];
  for (const [kind, id, now, max] of bars) {
    const gain = document.getElementById(id)?.parentElement.querySelector('.gain'); if (!gain) continue;
    const add = supplyShopOpen && supplyHover && supplyHover.kind === kind ? Math.min(supplyHover.restore, max - now) : 0;
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
    const n = SUPPLIES.filter(item => tab.dataset.supplyTab === 'all' || item.kind === tab.dataset.supplyTab).length;
    tab.querySelector('em').textContent = n;
  });
  const visible = SUPPLIES.filter(item => supplyShopTab === 'all' || item.kind === supplyShopTab)
    .sort((a, b) => (a.kind === b.kind ? 0 : a.kind === 'snack' ? -1 : 1) || a.price - b.price);   // 零食在前，各自由便宜到貴
  supplyShopList.innerHTML = visible.map(item => {
    const kind = SUPPLY_KIND[item.kind], inCart = shopCart.get(item.id) || 0, short = item.price - left;
    return `<article class="shop-item ${item.kind}" data-item="${item.id}">
      ${inCart ? `<span class="shop-owned" title="購物車裡有 ${inCart} 個">🛒${inCart}</span>` : ''}
      <div class="shop-item-image"><img src="${item.image}" alt=""><strong title="${item.name}">${item.name}</strong></div>
      <span class="shop-effect">${kind.icon} ${supplyEffect(item)}</span>
      <button class="shop-buy" type="button" data-buy-supply="${item.id}" ${short > 0 ? `disabled aria-label="${item.name}，還差 $${short}"` : `aria-label="把 ${item.name} 加入購物車，$${item.price}"`}>${short > 0 ? `還差 $${short}` : `<span>加入</span><b>$${item.price}</b>`}</button>
    </article>`;
  }).join('');
  const cart = SUPPLIES.filter(item => shopCart.get(item.id) > 0), total = cartTotal();
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
// 下方資訊條的快捷格：零食（Q）、飲料（F）
let quickSupplyKey = '';
function renderQuickSupplies() {
  const box = document.getElementById('quickSupplies'); if (!box) return;
  const state = ['snack', 'drink'].map(kind => { const pick = pickSupply(kind); return [kind, pick?.id || '', supplyOwnedCount(kind), supplyNeed(kind) <= 0]; });
  const key = JSON.stringify(state); if (key === quickSupplyKey) return; quickSupplyKey = key;
  box.innerHTML = state.map(([kind, id, count, full]) => {
    const k = SUPPLY_KIND[kind], item = supplyById(id);
    const tip = !count ? `沒有${k.name}` : full ? `${k.stat} 已滿` : `${k.key}｜${item.name} ${supplyEffect(item)}`;
    return `<button class="quick-supply ${kind}" type="button" data-quick-supply="${kind}" ${!count || full ? 'disabled' : ''} title="${tip}" aria-label="${tip}">
      <span class="qs-icon">${item ? `<img src="${item.image}" alt="">` : k.icon}</span><span class="qs-text"><small>${k.name}</small><b>×${count}</b></span><kbd>${k.key}</kbd></button>`;
  }).join('');
}
function openSupplyShop() {
  if (!G || G.over || !G.player || supplyShopOpen) return;
  supplyShopOpen = true; aimHeld = false; supplyHover = null; Object.keys(keys).forEach(key => { keys[key] = false; });
  closeBackpack(true); closeElevatorMenu(); closeDialogue(true); closeSentryMenu(); closeGroundMenu(); closeBuildMenu();
  renderSupplyShop(); supplyShop.classList.remove('hidden'); SFX.play('shopBell', .7, 'shop-bell'); document.getElementById('supplyShopClose').focus();
}
function closeSupplyShop(silent = false) { if (!supplyShopOpen) return; supplyShopOpen = false; supplyHover = null; renderSupplyStatus(); supplyShop.classList.add('hidden'); if (!silent) sfx('switch'); }
const cartTotal = () => SUPPLIES.reduce((sum, item) => sum + item.price * (shopCart.get(item.id) || 0), 0);
function addToCart(id, focusCard = true) {
  const item = supplyById(id);
  if (!item || !G || G.money - cartTotal() < item.price) { sfx('error'); return; }
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
  const count = [...shopCart.values()].reduce((sum, n) => sum + n, 0);
  G.money -= total;
  for (const [id, n] of shopCart) supplyInventory.set(id, (supplyInventory.get(id) || 0) + n);
  shopCart.clear();
  SFX.play('shopBell', .6, 'shop-checkout'); systemNotice(`結帳 $${total}，${count} 件已放進背包`);
  updateHUD(); renderSupplyShop();
  const link = document.getElementById('shopOpenBackpack'); link.classList.remove('flash'); void link.offsetWidth; link.classList.add('flash'); link.focus();
}
function useSupply(id) {
  const item = supplyById(id), count = supplyInventory.get(id) || 0;
  if (!item || !G?.player || count <= 0) return false;
  const restored = Math.min(item.restore, supplyNeed(item.kind));
  if (restored <= 0) { sfx('error'); flash(`${SUPPLY_KIND[item.kind].stat} 已滿`, G.player.x, G.player.y - 54, '#c9d3dc'); return false; }
  if (item.kind === 'snack') G.player.hp += restored; else G.guide += restored;
  if (count <= 1) supplyInventory.delete(id); else supplyInventory.set(id, count - 1);
  const k = SUPPLY_KIND[item.kind];
  sfx('soothe'); flash(`${item.name}　+${Math.ceil(restored)} ${k.stat}`, G.player.x, G.player.y - 54, k.color);
  updateHUD(); if (supplyShopOpen) renderSupplyShop(); if (backpackOpen) renderBackpack();
  return true;
}
function quickUseSupply(kind) {
  const k = SUPPLY_KIND[kind], item = pickSupply(kind);
  if (!item) { sfx('error'); flash(`沒有${k.name}了`, G.player.x, G.player.y - 54, '#c9d3dc'); return; }
  useSupply(item.id);
}
document.getElementById('supplyShopButton').addEventListener('click', openSupplyShop);
document.getElementById('hudShopButton').addEventListener('click', openSupplyShop);
document.getElementById('shopOpenBackpack').addEventListener('click', () => { closeSupplyShop(true); openBackpack(); });
document.getElementById('quickSupplies').addEventListener('click', e => { const b = e.target.closest('[data-quick-supply]'); if (b && G?.player) quickUseSupply(b.dataset.quickSupply); });
document.getElementById('supplyShopClose').addEventListener('click', () => closeSupplyShop());
supplyShop.addEventListener('click', e => { if (e.target === supplyShop) { closeSupplyShop(); return; } const buy = e.target.closest('[data-buy-supply]'); if (buy) addToCart(buy.dataset.buySupply);
  const inc = e.target.closest('[data-cart-inc]'); if (inc) { addToCart(inc.dataset.cartInc, false); shopCartList.querySelector(`[data-cart-inc="${inc.dataset.cartInc}"]:not(:disabled)`)?.focus(); }
  const dec = e.target.closest('[data-cart-dec]'); if (dec) { removeFromCart(dec.dataset.cartDec); (shopCartList.querySelector(`[data-cart-dec="${dec.dataset.cartDec}"]`) || document.getElementById('supplyShopClose')).focus(); }
  if (e.target.closest('#cartClear')) { shopCart.clear(); sfx('switch'); renderSupplyShop(); }
  if (e.target.closest('#cartCheckout')) checkoutCart(); });
supplyShop.addEventListener('animationend', e => { if (e.target.classList.contains('shop-pop')) e.target.remove(); else e.target.classList.remove('bought', 'bump', 'flash'); });
supplyShopList.addEventListener('mouseover', e => { const card = e.target.closest('[data-item]'); const item = card ? supplyById(card.dataset.item) : null; if (item !== supplyHover) { supplyHover = item; renderSupplyStatus(); } });
supplyShopList.addEventListener('mouseleave', () => { supplyHover = null; renderSupplyStatus(); });
document.querySelectorAll('[data-supply-tab]').forEach(button => button.addEventListener('click', () => { supplyShopTab = button.dataset.supplyTab; document.querySelectorAll('[data-supply-tab]').forEach(tab => { tab.classList.toggle('active', tab === button); tab.setAttribute('aria-selected', tab === button); }); supplyShopList.scrollTop = 0; renderSupplyShop(); sfx('switch'); }));
window.addEventListener('keydown', e => {   // Q 吃零食、F 喝飲料
  const k = e.key.toLowerCase();
  if (e.repeat || (k !== 'q' && k !== 'f') || e.ctrlKey || e.altKey || e.metaKey) return;
  if (e.target instanceof Element && e.target.closest('input, textarea, select, [contenteditable]')) return;
  if (!G?.player || G.over || MAP_SAFE || dialogueState || elevatorMenuOpen || mapTransitioning || G.player.hp <= 0) return;
  e.preventDefault(); quickUseSupply(k === 'q' ? 'snack' : 'drink');
});
