// ============================================================
//  背包：左邊格子、右邊物品說明。按 B 或下方資訊條的「背包」打開，打開時遊戲暫停。
//  物品資料：商店的零食飲料在 data/supplies.js，其他物品在 data/items.js。
//  背包裡有什麼存在 supplyInventory（就在下面）：物品 id → 數量。商店、送禮、存檔都會用到。
// ============================================================
const supplyInventory = new Map();   // 背包裡的東西：物品 id → 數量
const BAG_MIN_SLOTS = 24;   // 至少畫幾格（不夠的用空格補滿，看起來像背包）
const backpackEl = document.getElementById('backpack');
const backpackGrid = document.getElementById('backpackGrid');
const backpackDetail = document.getElementById('backpackDetail');
let backpackOpen = false, backpackTab = 'all', backpackSel = null;
let backpackDrop = null;   // 正在確認丟棄：{ id, qty }；沒有在丟就是 null
// 能不能丟：重要物品不能丟；個別物品也可以在資料裡寫 noDrop: true
const canDrop = item => !!item && !item.noDrop && item.category !== 'key';

// 所有物品：商店補給品歸在「消耗品」，再加上 data/items.js 的其他物品
const allItems = () => [...SUPPLIES.map(item => ({ ...item, category: item.use || item.kind === 'medical' ? 'consumable' : 'gift' })), ...ITEMS];   // 補給、後室道具＝消耗品；零食飲料＝禮物
const itemById = id => allItems().find(item => item.id === id) || null;
const categoryOf = id => ITEM_CATEGORIES.find(c => c.id === id) || { id, name: id, icon: '•' };
function itemDesc(item) {
  if (item.desc) return item.desc;
  if (item.kind === 'snack' || item.kind === 'drink') return '便利商店買來的。可以送給大家，看看誰喜歡。';
  return '';
}
// 「裝備」分頁：列出擁有的部隊長裝備（js/equipment.js 的 equipState），只能看，換裝備用左邊的裝備格
const GEAR_TAB = { id: 'equip', name: '裝備', icon: '🛡️' };
const GEAR_KIND_NAME = { head: '頭部', body: '上身', legs: '下身', acc: '隨身物品' };
function ownedGear() {
  if (typeof EQUIPMENT === 'undefined' || typeof equipState === 'undefined') return [];
  const worn = new Set(Object.values(equipState.equipped || {}).filter(Boolean));
  // 武器排前面（拿到的槍），再來是裝備；wornAs＝裝在哪一格（主武器／副武器）
  const L = equipState.loadout || {};
  const weapons = typeof WEAPON_UPGRADES === 'undefined' ? [] : Object.entries(WEAPON_UPGRADES).filter(([k, w]) => !w.removed && (equipState.weapons[k] || 0) > 0).map(([k, w]) => ({
    id: 'gear:w:' + k, name: w.name, image: w.image, icon: w.icon, gear: w, weapon: k, lv: equipState.weapons[k],
    worn: L.main === k || L.sub === k, wornAs: L.main === k ? '主武器' : L.sub === k ? '副武器' : '' }));
  return weapons.concat(EQUIPMENT.filter(d => equipState.owned[d.id]).map(d => ({ id: 'gear:' + d.id, name: d.name, image: d.image, icon: d.icon, gear: d, lv: equipState.owned[d.id], worn: worn.has(d.id) })));
}
const gearById = id => String(id || '').startsWith('gear:') ? ownedGear().find(g => g.id === id) || null : null;
function ownedItems() {
  if (backpackTab === GEAR_TAB.id) return ownedGear();
  return allItems().filter(item => (supplyInventory.get(item.id) || 0) > 0 && (backpackTab === 'all' || item.category === backpackTab));
}

function renderBackpack() {
  if (!backpackEl) return;
  const total = [...supplyInventory.values()].reduce((sum, n) => sum + n, 0);
  document.getElementById('backpackCount').textContent = total;
  if (typeof renderEquipPanel === 'function') renderEquipPanel();   // 左邊的部隊長裝備（js/equipment.js）
  // 分類分頁：顯示每一類有幾件
  document.getElementById('backpackTabs').innerHTML = [{ id: 'all', name: '全部', icon: '' }, ...ITEM_CATEGORIES, GEAR_TAB].map(cat => {
    const n = cat === GEAR_TAB ? ownedGear().length : allItems().filter(item => cat.id === 'all' || item.category === cat.id).reduce((sum, item) => sum + (supplyInventory.get(item.id) || 0), 0);
    return `<button type="button" role="tab" data-bag-tab="${cat.id}" class="${backpackTab === cat.id ? 'active' : ''}" aria-selected="${backpackTab === cat.id}">${cat.icon ? cat.icon + ' ' : ''}${cat.name} <em>${n}</em></button>`;
  }).join('');
  // 格子
  const items = ownedItems();
  if (!items.some(item => item.id === backpackSel)) backpackSel = items[0]?.id || null;
  const columns = window.innerWidth <= 560 ? 4 : window.innerWidth <= 900 ? 5 : 7;
  const slots = Math.ceil(Math.max(BAG_MIN_SLOTS, items.length) / columns) * columns;
  let html = items.map(item => item.gear ? `<button type="button" class="bag-cell gear${item.weapon ? ' weapon' : ''}${item.worn ? ' worn' : ''}${item.id === backpackSel ? ' sel' : ''}" data-bag-item="${item.id}" aria-label="${item.name} Lv${item.lv}${item.worn ? '（穿戴中）' : ''}" aria-pressed="${item.id === backpackSel}">
      ${item.image ? `<img src="${item.image}" alt="">` : `<i>${item.icon}</i>`}<b>Lv${item.lv}</b>${item.worn ? `<u>${item.wornAs || '穿戴中'}</u>` : ''}</button>` : `<button type="button" class="bag-cell ${item.kind || item.category}${item.id === backpackSel ? ' sel' : ''}" data-bag-item="${item.id}" aria-label="${item.name} ×${supplyInventory.get(item.id)}" aria-pressed="${item.id === backpackSel}">
      <img src="${item.image}" alt=""><b>${supplyInventory.get(item.id)}</b></button>`).join('');
  for (let i = items.length; i < slots; i++) html += '<span class="bag-cell empty" aria-hidden="true"></span>';
  backpackGrid.classList.add('no-anim');   // 重畫時不要重播滑鼠下那格的浮起動畫
  backpackGrid.innerHTML = html;
  requestAnimationFrame(() => requestAnimationFrame(() => backpackGrid.classList.remove('no-anim')));
  renderBackpackDetail();
}
// 裝備按鈕：只有一格能放就「裝備」；可以放兩格（主／副武器、隨身物品 1／2）就各一顆。已經在那格就變「卸下」
function gearButtons(g) {
  const kind = g.weapon ? 'weapon' : 'gear', id = g.weapon || g.gear.id;
  const slots = typeof slotsForGear === 'function' ? slotsForGear(kind, id) : [];
  return '<div class="bag-equip-buttons">' + slots.map(s => s.cur
    ? `<button type="button" class="bag-unequip" data-gear-off="${s.id}">卸下${slots.length > 1 ? '（' + s.name + '）' : ''}</button>`
    : `<button type="button" class="bag-use" data-gear-equip="${s.id}" data-gear-id="${id}">${slots.length > 1 ? '裝到' + s.name : '裝備'}</button>`).join('') + '</div>';
}
// 左邊點空格：切到「裝備」分頁，選第一件能放這格的
function showGearForSlot(slotId) {
  backpackTab = GEAR_TAB.id; backpackDrop = null;
  const fit = ownedGear().find(g => slotsForGear(g.weapon ? 'weapon' : 'gear', g.weapon || g.gear.id).some(s => s.id === slotId && !s.cur));
  backpackSel = fit ? fit.id : null;
  sfx('switch'); renderBackpack();
  if (!fit) systemNotice('沒有可以放這一格的' + (slotId.startsWith('w:') ? '武器' : '裝備'));
  backpackGrid.querySelector('.bag-cell.sel')?.focus();
}
function renderGearDetail(g) {
  const d = g.gear;
  backpackDetail.classList.remove('dropping');
  backpackDetail.classList.add('gear-detail');
  backpackDetail.innerHTML = `
    <div class="bag-detail-image">${g.image ? `<img src="${g.image}" alt=""${g.weapon ? ' class="weapon"' : ''}>` : `<i class="bag-gear-emoji">${g.icon}</i>`}</div>
    <div class="bag-gear-heading"><h3>${g.name}</h3><div class="bag-tags"><span class="bag-tag">${g.weapon ? '🔫 武器' : GEAR_TAB.icon + ' ' + (GEAR_KIND_NAME[d.kind] || '裝備')}</span><span class="bag-tag effect">Lv${g.lv}</span>${g.worn ? `<span class="bag-tag worn">${g.wornAs || '穿戴中'}</span>` : ''}</div></div>
    <div class="bag-gear-stat"><small>目前效果</small><b>${d.stat(d.levels[g.lv - 1])}${g.weapon && d.field && typeof gunAmmo === 'function' ? '・彈藥 ' + (gunAmmo(g.weapon).mag + gunAmmo(g.weapon).reserve) + ' 發' : ''}</b></div>
    <div class="bag-actions">${gearButtons(g)}<p class="bag-note">升級找諾亞</p></div>`;
}
// 只換選取的格子：不重畫整個背包（重畫會讓格子、溫特立繪重新建立而閃一下）
function selectBackpackItem(id) {
  backpackSel = id; backpackDrop = null;
  backpackGrid.querySelectorAll('.bag-cell[data-bag-item]').forEach(c => {
    const on = c.dataset.bagItem === id; c.classList.toggle('sel', on); c.setAttribute('aria-pressed', on);
  });
  renderBackpackDetail(); sfx('blip');
}
function renderBackpackDetail() {
  const g = gearById(backpackSel); if (g) { renderGearDetail(g); return; }
  backpackDetail.classList.remove('gear-detail');
  const item = itemById(backpackSel);
  backpackDetail.classList.toggle('dropping', !!(backpackDrop && item && backpackDrop.id === item.id));   // 確認丟棄時把圖縮小，留空間給確認框
  if (!item) {
    backpackDetail.innerHTML = `<div class="bag-detail-empty"><span>🎒</span><p>${backpackTab === 'all' ? '背包是空的' : '沒有物品'}</p></div>`;
    return;
  }
  const cat = categoryOf(item.category), count = supplyInventory.get(item.id) || 0;
  const kind = item.use && SUPPLY_KIND[item.use];
  const full = kind && supplyNeed(item.use) <= 0;
  const usable = !!kind || !!item.act || typeof item.use === 'function';
  const actKey = { firstaid: 'H', adrenaline: 'J' }[item.act];
  backpackDetail.innerHTML = `
    <div class="bag-detail-image"><img src="${item.image}" alt=""></div>
    <h3>${item.name}</h3>
    <div class="bag-tags"><span class="bag-tag">${cat.icon} ${cat.name}</span>${kind ? `<span class="bag-tag effect ${item.use}">${kind.icon} ${supplyEffect(item)}</span>` : item.effect ? `<span class="bag-tag effect">${item.effect}</span>` : ''}${item.buff && typeof buffText === 'function' ? `<span class="bag-tag effect">出勤 ${buffText(item.buff)}</span>` : ''}</div>
    ${itemDesc(item) ? `<p class="bag-desc">${itemDesc(item)}</p>` : ''}
    <div class="bag-owned">持有 <b>×${count}</b></div>
    <div class="bag-actions">${backpackDrop && backpackDrop.id === item.id ? `
      <div class="bag-drop-confirm" role="group" aria-label="確認丟棄">
        <p>丟棄幾個？<small>無法復原</small></p>
        ${count > 1 ? `<div class="bag-qty"><button type="button" data-drop-qty="-1" aria-label="少一個" ${backpackDrop.qty <= 1 ? 'disabled' : ''}>−</button><b>${backpackDrop.qty}</b><button type="button" data-drop-qty="1" aria-label="多一個" ${backpackDrop.qty >= count ? 'disabled' : ''}>＋</button><button type="button" class="bag-qty-all" data-drop-qty="all" ${backpackDrop.qty >= count ? 'disabled' : ''}>全部</button></div>` : ''}
        <div class="bag-drop-buttons"><button type="button" class="bag-drop-cancel" data-drop-cancel>取消</button><button type="button" class="bag-drop-ok" data-drop-ok>丟棄 ${backpackDrop.qty} 個</button></div>
      </div>` : `
      ${usable ? `<button type="button" class="bag-use" data-bag-use="${item.id}" ${full ? 'disabled' : ''}>${full ? `${kind.stat} 已滿` : '使用'}${kind && !full ? `<kbd>${kind.key}</kbd>` : actKey ? `<kbd>${actKey}</kbd>` : ''}</button>` : (item.category === 'gift' ? '<p class="bag-note">在基地和大家對話時可以送禮</p>' : `<p class="bag-note">${item.note || '無法使用'}</p>`)}
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
  if (item.act === 'firstaid') { if (typeof useFirstAid === 'function') { closeBackpack(); useFirstAid(); } }   // 急救包、腎上腺素：關掉背包再用（js/equipment.js）
  else if (item.act === 'adrenaline') { if (typeof useAdrenaline === 'function') { closeBackpack(); useAdrenaline(); } }
  else if (item.act === 'graffiti') { if (typeof openGraffitiPalette === 'function') { closeBackpack(true); openGraffitiPalette(id); } }   // 塗鴉筆：選圖案再畫（js/graffiti.js）
  else if (typeof item.use === 'function') { item.use(); updateHUD(); }
  else if (item.use) useSupply(id);
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
  if (cell) { if (backpackSel !== cell.dataset.bagItem) selectBackpackItem(cell.dataset.bagItem); backpackGrid.querySelector('.bag-cell.sel')?.focus(); return; }
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
  const ge = e.target.closest('[data-gear-equip]');
  if (ge) { equipToSlot(ge.dataset.gearEquip, ge.dataset.gearId); backpackDetail.querySelector('[data-gear-off], [data-gear-equip]')?.focus(); return; }
  const go = e.target.closest('[data-gear-off]');
  if (go) { unequipSlot(go.dataset.gearOff); backpackDetail.querySelector('[data-gear-equip], [data-gear-off]')?.focus(); return; }
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
    if (items[next].id !== backpackSel) selectBackpackItem(items[next].id);
    backpackGrid.querySelector('.bag-cell.sel')?.focus();
  } else if (k === 'enter' && document.activeElement?.closest('#backpackGrid') && backpackSel) {
    e.preventDefault(); useBackpackItem(backpackSel); backpackGrid.querySelector('.bag-cell.sel')?.focus();
  }
});
