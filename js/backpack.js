// ============================================================
//  背包：左邊格子、右邊物品說明。按 B 或下方資訊條的「背包」打開，打開時遊戲暫停。
//  物品資料：商店的零食飲料在 data/supplies.js，其他物品在 data/items.js。
//  背包裡有什麼存在 supplyInventory（js/game.js）：物品 id → 數量。
// ============================================================
const BAG_MIN_SLOTS = 24;   // 至少畫幾格（不夠的用空格補滿，看起來像背包）
const backpackEl = document.getElementById('backpack');
const backpackGrid = document.getElementById('backpackGrid');
const backpackDetail = document.getElementById('backpackDetail');
let backpackOpen = false, backpackTab = 'all', backpackSel = null;
let backpackDrop = null;   // 正在確認丟棄：{ id, qty }；沒有在丟就是 null
// 能不能丟：重要物品不能丟；個別物品也可以在資料裡寫 noDrop: true
const canDrop = item => !!item && !item.noDrop && item.category !== 'key';

// 所有物品：商店補給品歸在「消耗品」，再加上 data/items.js 的其他物品
const allItems = () => [...SUPPLIES.map(item => ({ ...item, category: 'consumable' })), ...ITEMS];
const itemById = id => allItems().find(item => item.id === id) || null;
const categoryOf = id => ITEM_CATEGORIES.find(c => c.id === id) || { id, name: id, icon: '•' };
function itemDesc(item) {
  if (item.desc) return item.desc;
  return '';
}
function ownedItems() {
  return allItems().filter(item => (supplyInventory.get(item.id) || 0) > 0 && (backpackTab === 'all' || item.category === backpackTab));
}

function renderBackpack() {
  if (!backpackEl) return;
  const total = [...supplyInventory.values()].reduce((sum, n) => sum + n, 0);
  document.getElementById('backpackCount').textContent = total;
  // 分類分頁：顯示每一類有幾件
  document.getElementById('backpackTabs').innerHTML = [{ id: 'all', name: '全部', icon: '' }, ...ITEM_CATEGORIES].map(cat => {
    const n = allItems().filter(item => cat.id === 'all' || item.category === cat.id).reduce((sum, item) => sum + (supplyInventory.get(item.id) || 0), 0);
    return `<button type="button" role="tab" data-bag-tab="${cat.id}" class="${backpackTab === cat.id ? 'active' : ''}" aria-selected="${backpackTab === cat.id}">${cat.icon ? cat.icon + ' ' : ''}${cat.name} <em>${n}</em></button>`;
  }).join('');
  // 格子
  const items = ownedItems();
  if (!items.some(item => item.id === backpackSel)) backpackSel = items[0]?.id || null;
  const slots = Math.max(BAG_MIN_SLOTS, Math.ceil(items.length / 6) * 6);
  let html = items.map(item => `<button type="button" class="bag-cell ${item.kind || item.category}${item.id === backpackSel ? ' sel' : ''}" data-bag-item="${item.id}" aria-label="${item.name} ×${supplyInventory.get(item.id)}" aria-pressed="${item.id === backpackSel}">
      <img src="${item.image}" alt=""><b>${supplyInventory.get(item.id)}</b></button>`).join('');
  for (let i = items.length; i < slots; i++) html += '<span class="bag-cell empty" aria-hidden="true"></span>';
  backpackGrid.innerHTML = html;
  renderBackpackDetail();
}
function renderBackpackDetail() {
  const item = itemById(backpackSel);
  backpackDetail.classList.toggle('dropping', !!(backpackDrop && item && backpackDrop.id === item.id));   // 確認丟棄時把圖縮小，留空間給確認框
  if (!item) {
    backpackDetail.innerHTML = `<div class="bag-detail-empty"><span>🎒</span><p>${backpackTab === 'all' ? '背包是空的' : '沒有物品'}</p></div>`;
    return;
  }
  const cat = categoryOf(item.category), count = supplyInventory.get(item.id) || 0;
  const kind = item.kind && SUPPLY_KIND[item.kind];
  const full = kind && supplyNeed(item.kind) <= 0;
  const usable = !!kind || typeof item.use === 'function';
  backpackDetail.innerHTML = `
    <div class="bag-detail-image"><img src="${item.image}" alt=""></div>
    <h3>${item.name}</h3>
    <div class="bag-tags"><span class="bag-tag">${cat.icon} ${cat.name}</span>${kind ? `<span class="bag-tag effect ${item.kind}">${kind.icon} ${supplyEffect(item)}</span>` : ''}</div>
    ${itemDesc(item) ? `<p class="bag-desc">${itemDesc(item)}</p>` : ''}
    <div class="bag-owned">持有 <b>×${count}</b></div>
    <div class="bag-actions">${backpackDrop && backpackDrop.id === item.id ? `
      <div class="bag-drop-confirm" role="group" aria-label="確認丟棄">
        <p>丟棄幾個？<small>無法復原</small></p>
        ${count > 1 ? `<div class="bag-qty"><button type="button" data-drop-qty="-1" aria-label="少一個" ${backpackDrop.qty <= 1 ? 'disabled' : ''}>−</button><b>${backpackDrop.qty}</b><button type="button" data-drop-qty="1" aria-label="多一個" ${backpackDrop.qty >= count ? 'disabled' : ''}>＋</button><button type="button" class="bag-qty-all" data-drop-qty="all" ${backpackDrop.qty >= count ? 'disabled' : ''}>全部</button></div>` : ''}
        <div class="bag-drop-buttons"><button type="button" class="bag-drop-cancel" data-drop-cancel>取消</button><button type="button" class="bag-drop-ok" data-drop-ok>丟棄 ${backpackDrop.qty} 個</button></div>
      </div>` : `
      ${usable ? `<button type="button" class="bag-use" data-bag-use="${item.id}" ${full ? 'disabled' : ''}>${full ? `${kind.stat} 已滿` : '使用'}${kind && !full ? `<kbd>${kind.key}</kbd>` : ''}</button>` : '<p class="bag-note">無法使用</p>'}
      ${canDrop(item) ? `<button type="button" class="bag-drop" data-bag-drop="${item.id}">🗑 丟棄<kbd>Del</kbd></button>` : '<p class="bag-note">無法丟棄</p>'}`}
    </div>`;
}
function startDrop(id) {
  const item = itemById(id);
  if (!canDrop(item) || !(supplyInventory.get(id) > 0)) { sfx('error'); return; }
  backpackDrop = { id, qty: 1 }; renderBackpackDetail(); sfx('menu');
  backpackDetail.querySelector('.bag-drop-confirm')?.scrollIntoView({ block: 'nearest' });   // 畫面矮的時候，確認框也要看得到
  backpackDetail.querySelector('.bag-drop-cancel')?.focus();   // 焦點先放在「取消」，不小心按 Enter 也不會丟掉
}
function cancelDrop() { if (!backpackDrop) return; const id = backpackDrop.id; backpackDrop = null; renderBackpackDetail(); sfx('switch'); backpackDetail.querySelector(`[data-bag-drop="${id}"]`)?.focus(); }
function confirmDrop() {
  if (!backpackDrop) return;
  const { id, qty } = backpackDrop, item = itemById(id), count = supplyInventory.get(id) || 0, n = Math.min(qty, count);
  backpackDrop = null;
  if (n <= 0) return;
  if (n >= count) supplyInventory.delete(id); else supplyInventory.set(id, count - n);
  sfx('place'); systemNotice(`已丟棄 ${item.name} ×${n}`);
  updateHUD(); renderBackpack(); if (typeof supplyShopOpen !== 'undefined' && supplyShopOpen) renderSupplyShop();
  (backpackGrid.querySelector('.bag-cell.sel') || document.getElementById('backpackClose')).focus();
}
function useBackpackItem(id) {
  const item = itemById(id); if (!item) return;
  if (item.kind) useSupply(id);
  else if (typeof item.use === 'function') { item.use(); updateHUD(); }
  if (backpackOpen) renderBackpack();
}

function openBackpack() {
  if (!G || G.over || !G.player || backpackOpen) return;
  if (typeof closeSupplyShop === 'function') closeSupplyShop(true);
  backpackOpen = true; aimHeld = false; Object.keys(keys).forEach(key => { keys[key] = false; });
  closeElevatorMenu(); closeDialogue(true); closeSentryMenu(); closeGroundMenu(); closeBuildMenu();
  renderBackpack(); backpackEl.classList.remove('hidden'); sfx('menu');
  (backpackGrid.querySelector('.bag-cell.sel') || document.getElementById('backpackClose')).focus();
}
function closeBackpack(silent = false) { if (!backpackOpen) return; backpackOpen = false; backpackDrop = null; backpackEl.classList.add('hidden'); if (!silent) sfx('switch'); }

document.getElementById('backpackClose').addEventListener('click', () => closeBackpack());
backpackEl.addEventListener('click', e => {
  if (e.target === backpackEl) { closeBackpack(); return; }
  const tab = e.target.closest('[data-bag-tab]');
  if (tab) { backpackTab = tab.dataset.bagTab; backpackSel = null; backpackDrop = null; renderBackpack(); sfx('switch'); return; }
  const cell = e.target.closest('[data-bag-item]');
  if (cell) { if (backpackSel !== cell.dataset.bagItem) { backpackSel = cell.dataset.bagItem; backpackDrop = null; renderBackpack(); sfx('blip'); } backpackGrid.querySelector('.bag-cell.sel')?.focus(); return; }
  if (e.target.closest('[data-bag-drop]')) { startDrop(e.target.closest('[data-bag-drop]').dataset.bagDrop); return; }
  if (e.target.closest('[data-drop-cancel]')) { cancelDrop(); return; }
  if (e.target.closest('[data-drop-ok]')) { confirmDrop(); return; }
  const qtyBtn = e.target.closest('[data-drop-qty]');
  if (qtyBtn && backpackDrop) {
    const max = supplyInventory.get(backpackDrop.id) || 1, v = qtyBtn.dataset.dropQty;
    backpackDrop.qty = v === 'all' ? max : Math.max(1, Math.min(max, backpackDrop.qty + Number(v)));
    renderBackpackDetail(); sfx('blip');
    (backpackDetail.querySelector(`[data-drop-qty="${v}"]:not(:disabled)`) || backpackDetail.querySelector('.bag-drop-ok')).focus();
    return;
  }
  const use = e.target.closest('[data-bag-use]');
  if (use) { useBackpackItem(use.dataset.bagUse); (backpackDetail.querySelector('.bag-use:not(:disabled)') || backpackGrid.querySelector('.bag-cell.sel') || document.getElementById('backpackClose')).focus(); }
});
backpackGrid.addEventListener('dblclick', e => { const cell = e.target.closest('[data-bag-item]'); if (cell) useBackpackItem(cell.dataset.bagItem); });   // 連點兩下直接使用
['backpackButton', 'hudBackpackButton'].forEach(id => document.getElementById(id)?.addEventListener('click', openBackpack));

window.addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if (e.target instanceof Element && e.target.closest('input, textarea, select, [contenteditable]')) return;
  if (k === 'b' && !e.repeat && !e.ctrlKey && !e.altKey && !e.metaKey) {   // B：開關背包
    if (backpackOpen) { e.preventDefault(); closeBackpack(); }
    else if (!dialogueState && !elevatorMenuOpen && !mapTransitioning && !(typeof supplyShopOpen !== 'undefined' && supplyShopOpen)) { e.preventDefault(); openBackpack(); }
    return;
  }
  if (!backpackOpen) return;
  if (backpackDrop && k === 'escape') { e.preventDefault(); e.stopImmediatePropagation(); cancelDrop(); return; }
  if ((k === 'delete' || k === 'backspace') && !backpackDrop && backpackSel) { e.preventDefault(); startDrop(backpackSel); return; }
  if (backpackDrop) return;   // 確認丟棄時，方向鍵不要換物品
  // 方向鍵在格子之間移動；Enter 使用
  const items = ownedItems(), i = items.findIndex(item => item.id === backpackSel);
  const cols = getComputedStyle(backpackGrid).gridTemplateColumns.split(' ').length || 6;
  const step = { arrowleft: -1, arrowright: 1, arrowup: -cols, arrowdown: cols }[k];
  if (step && items.length && (document.activeElement?.closest('#backpackGrid') || document.activeElement === document.body)) {
    e.preventDefault();
    const next = Math.max(0, Math.min(items.length - 1, (i < 0 ? 0 : i) + step));
    if (items[next].id !== backpackSel) { backpackSel = items[next].id; backpackDrop = null; renderBackpack(); sfx('blip'); }
    backpackGrid.querySelector('.bag-cell.sel')?.focus();
  } else if (k === 'enter' && document.activeElement?.closest('#backpackGrid') && backpackSel) {
    e.preventDefault(); useBackpackItem(backpackSel); backpackGrid.querySelector('.bag-cell.sel')?.focus();
  }
});
