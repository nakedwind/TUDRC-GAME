// ============================================================
//  背包：左邊格子、右邊物品說明。按 B 或下方資訊條的「背包」打開，打開時遊戲暫停。
//  物品資料：商店的零食飲料在 data/supplies.js，其他物品在 data/items.js。
//  背包裡有什麼存在 supplyInventory（就在下面）：物品 id → 數量。商店、送禮、存檔都會用到。
// ============================================================
const supplyInventory = new Map();   // 背包裡的東西：物品 id → 數量
// ---- 溫特的持有上限：每一種東西最多帶幾個（沒寫＝無上限）----
// kinds＋max＝這幾類（零食、飲料）每一種最多幾個；items＝個別物品的上限（物品 id → 最多幾個，優先）
// 背包的數量一律照這個截掉：商店、撿到、置物櫃、任務獎勵…所有取得方式都一樣，之後新增的取得方式也自動套用。
// 會「撿起來」的地方請用 supplyGain(id, n)：拿不下時跳提示，回傳實際拿到幾個（0＝滿了，東西可以留在原地）。
const CARRY_LIMIT = { kinds: ['snack', 'drink'], max: 2,
  items: { 'medkit': 20, 'almond-water': 20, 'firstaid': 20, 'anomaly-firstaid': 20, 'adrenaline': 5, 'battery': 10 } };
function carryMax(x) {   // x＝物品 id 或物品；Infinity＝無上限
  const id = typeof x === 'string' ? x : x && x.id; if (!id) return Infinity;
  if (id in CARRY_LIMIT.items) return CARRY_LIMIT.items[id];
  const kind = typeof x === 'object' && x.kind || (typeof SUPPLIES !== 'undefined' && (SUPPLIES.find(s => s.id === id) || {}).kind);
  return CARRY_LIMIT.kinds.includes(kind) ? CARRY_LIMIT.max : Infinity;
}
const carryRoom = x => Math.max(0, carryMax(x) - (supplyInventory.get(typeof x === 'string' ? x : x.id) || 0));   // 還能再拿幾個
supplyInventory.set = function (id, n) { return Map.prototype.set.call(this, id, Math.min(n, carryMax(id))); };   // 超過上限的部分不會放進背包
function supplyGain(id, n = 1, quiet = false) {
  const got = Math.min(n, carryRoom(id));
  if (got > 0) supplyInventory.set(id, (supplyInventory.get(id) || 0) + got);
  if (got < n && !quiet && typeof systemNotice === 'function') {
    const it = typeof itemById === 'function' && itemById(id);
    systemNotice('「' + (it ? it.name : id) + '」已達持有上限（最多 ' + carryMax(id) + ' 個）' + (got ? '，只拿了 ' + got + ' 個' : '，拿不下了'), true);
  }
  return got;
}
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
// 「武器」分頁：第一排＝手槍＋彈匣格，下面＝擁有的子彈（拖曳到彈匣格就換子彈，js/magazine.js）
// 「防具」分頁：列出擁有的部隊長裝備（js/equipment.js 的 equipState），換裝備用左邊的裝備格
const WEAPON_TAB = { id: 'weapon', name: '武器', icon: '🔫' };
const GEAR_TAB = { id: 'equip', name: '防具', icon: '🛡️' };
// 背包分頁、說明欄標籤的小圖示：實心剪影（跟隊員數值、NPC 頭上的圖示同一種風格），顏色跟著文字（currentColor）
const BAG_ICON = (() => {
  const svg = body => '<svg class="bag-ico" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">' + body + '</svg>';
  return {
    all: svg('<rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="8" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/><rect x="13" y="13" width="8" height="8" rx="2"/>'),
    consumable: svg('<path fill-rule="evenodd" d="M8.5 3.5H15.5A1.5 1.5 0 0 1 17 5V6.5H19.5A2 2 0 0 1 21.5 8.5V18.5A2 2 0 0 1 19.5 20.5H4.5A2 2 0 0 1 2.5 18.5V8.5A2 2 0 0 1 4.5 6.5H7V5A1.5 1.5 0 0 1 8.5 3.5ZM9.3 5.5V6.5H14.7V5.5ZM10.6 9.6V12.2H8V14.8H10.6V17.4H13.4V14.8H16V12.2H13.4V9.6Z"/>'),
    gift: svg('<path d="M3 8.5A1.5 1.5 0 0 1 4.5 7H10.6V11.6H3Z"/><path d="M13.4 7H19.5A1.5 1.5 0 0 1 21 8.5V11.6H13.4Z"/><path d="M4.3 13.4H10.6V21H5.8A1.5 1.5 0 0 1 4.3 19.5Z"/><path d="M13.4 13.4H19.7V19.5A1.5 1.5 0 0 1 18.2 21H13.4Z"/><path d="M12 6.4C10.4 3.2 6.6 2.6 6.4 4.8 6.3 6.3 9 6.8 12 6.8 15 6.8 17.7 6.3 17.6 4.8 17.4 2.6 13.6 3.2 12 6.4Z"/>'),
    material: svg('<path fill-rule="evenodd" d="M12 1.8 20.8 6.9V17.1L12 22.2 3.2 17.1V6.9ZM12 8.4A3.6 3.6 0 1 0 12 15.6 3.6 3.6 0 1 0 12 8.4Z"/>'),
    key: svg('<g transform="rotate(-45 12 12)"><path fill-rule="evenodd" d="M12 0.6A5.6 5.6 0 1 1 12 11.8 5.6 5.6 0 1 1 12 0.6ZM12 3.8A2.4 2.4 0 1 0 12 8.6 2.4 2.4 0 1 0 12 3.8Z"/><rect x="10.6" y="10.8" width="2.8" height="12.4" rx="1"/><rect x="12.6" y="16.2" width="4.4" height="2.4" rx=".6"/><rect x="12.6" y="20" width="3.4" height="2.4" rx=".6"/></g>'),   // 鑰匙：圓環＋鑰匙桿＋兩個齒，斜放
    equip: svg('<path fill-rule="evenodd" d="M12 1.8 20.5 5V11.2C20.5 16.6 16.9 20.3 12 22.3 7.1 20.3 3.5 16.6 3.5 11.2V5ZM12 5.6 7.2 7.5V11.4C7.2 14.4 9 16.8 12 18.3Z"/>'),
    weapon: svg('<rect x="18.8" y="3" width="2" height="2.2" rx=".5"/><rect x="2.4" y="3.2" width="2.6" height="2" rx=".5"/><path d="M2.4 4.6H21A1.4 1.4 0 0 1 22.4 6V10.4H2.4A1.2 1.2 0 0 1 1.2 9.2V5.8A1.2 1.2 0 0 1 2.4 4.6Z"/><path d="M4.2 10H11.4L10.6 13.4 7.6 21.4A1.2 1.2 0 0 1 6.5 22.2H2.1A.9.9 0 0 1 1.3 21Z"/><path fill-rule="evenodd" d="M10.8 10H16.8V11.8C16.8 14.6 14.8 16.6 12 16.6H9.4L10.4 13.6ZM12.7 11.8 12.2 14.6C13.9 14.6 14.9 13.6 14.9 12.2V11.8Z"/>'),   // 手槍側面：滑套＋前後準星、往後斜的握把、扳機護弓
  };
})();
const GEAR_KIND_NAME = { head: '頭部', body: '上身', legs: '下身', acc: '隨身物品' };
// ---- 子彈（背包裡顯示身上有的子彈；js/flare.js、js/magazine.js）----
const BULLET_PREFIX = 'bullet:';
function ownedBullets() {
  if (typeof BULLETS === 'undefined' || typeof bulletOwned !== 'function') return [];
  return Object.entries(BULLETS).filter(([id, b]) => id !== 'pistol' && !b.removed && bulletOwned(id)).map(([id, b]) => ({
    id: BULLET_PREFIX + id, bullet: id, name: b.name, image: b.image, icon: b.icon, def: b, count: bulletCount(id), max: b.max,
    free: typeof magIsFree === 'function' && magIsFree(id), loaded: typeof magazineCarries === 'function' && magazineCarries(id) }));
}
const bulletEntryById = id => String(id || '').startsWith(BULLET_PREFIX) ? ownedBullets().find(b => b.id === id) || null : null;
function pistolEntry() { return ownedGear(true).find(g => g.weapon === 'pistol') || null; }
function ownedGear(withWeapons) {
  if (typeof EQUIPMENT === 'undefined' || typeof equipState === 'undefined') return [];
  const worn = new Set(Object.values(equipState.equipped || {}).filter(Boolean));
  // 武器排前面（拿到的槍），再來是裝備；wornAs＝裝在哪一格（主武器／副武器）
  const L = equipState.loadout || {};
  const weapons = typeof WEAPON_UPGRADES === 'undefined' ? [] : Object.entries(WEAPON_UPGRADES).filter(([k, w]) => k === 'pistol' && (equipState.weapons[k] || 0) > 0).map(([k, w]) => ({   // 只有手槍（其他槍改成子彈）
    id: 'gear:w:' + k, name: w.name, image: w.image, icon: w.icon, gear: w, weapon: k, lv: equipState.weapons[k],
    worn: true, wornAs: '使用中' }));
  const armor = EQUIPMENT.filter(d => equipState.owned[d.id]).map(d => ({ id: 'gear:' + d.id, name: d.name, image: d.image, icon: d.icon, gear: d, lv: equipState.owned[d.id], worn: worn.has(d.id) }));
  return withWeapons ? weapons.concat(armor) : armor;   // 防具分頁只放裝備；手槍在武器分頁
}
const gearById = id => String(id || '').startsWith('gear:') ? ownedGear(true).find(g => g.id === id) || null : null;
function ownedItems() {
  if (backpackTab === GEAR_TAB.id) return ownedGear();
  if (backpackTab === WEAPON_TAB.id) return [pistolEntry(), ...ownedBullets()].filter(Boolean);
  const items = allItems().filter(item => (supplyInventory.get(item.id) || 0) > 0 && (backpackTab === 'all' || item.category === backpackTab));
  return backpackTab === 'all' ? items.concat(ownedBullets()) : items;   // 全部：最後面放身上的子彈
}

function renderBackpack() {
  if (!backpackEl) return;
  const total = [...supplyInventory.values()].reduce((sum, n) => sum + n, 0);
  document.getElementById('backpackCount').textContent = total;
  if (typeof renderEquipPanel === 'function') renderEquipPanel();   // 左邊的部隊長裝備（js/equipment.js）
  // 分類分頁：顯示每一類有幾件
  document.getElementById('backpackTabs').innerHTML = [{ id: 'all', name: '全部', icon: '' }, ...ITEM_CATEGORIES, WEAPON_TAB, GEAR_TAB].map(cat => {
    return `<button type="button" role="tab" data-bag-tab="${cat.id}" class="${backpackTab === cat.id ? 'active' : ''}" aria-selected="${backpackTab === cat.id}">${BAG_ICON[cat.id] || (cat.icon ? cat.icon + ' ' : '')}${cat.name}</button>`;   // 分頁後面不顯示數量
  }).join('');
  // 格子
  const items = ownedItems();
  if (!items.some(item => item.id === backpackSel)) backpackSel = items[0]?.id || null;
  const columns = window.innerWidth <= 560 ? 4 : window.innerWidth <= 900 ? 5 : 7;
  const slots = Math.ceil(Math.max(BAG_MIN_SLOTS, items.length) / columns) * columns;
  if (backpackTab === WEAPON_TAB.id) { renderWeaponGrid(items, columns); renderBackpackDetail(); return; }
  let html = items.map(item => item.bullet ? bulletCellHtml(item) : item.gear ? `<button type="button" class="bag-cell gear${item.weapon ? ' weapon' : ''}${equipTier(item.lv)}${item.worn ? ' worn' : ''}${item.id === backpackSel ? ' sel' : ''}" data-bag-item="${item.id}" aria-label="${item.name} Lv${item.lv}${item.worn ? '（穿戴中）' : ''}" aria-pressed="${item.id === backpackSel}">
      ${item.image ? `<img src="${item.image}" alt="">` : `<i>${item.icon}</i>`}<b>Lv${item.lv}</b>${item.worn && !item.weapon ? `<u>${item.wornAs || '穿戴中'}</u>` : ''}<span class="bag-cell-name">${item.name}</span></button>` : `<button type="button" class="bag-cell ${item.kind || item.category}${item.id === backpackSel ? ' sel' : ''}" data-bag-item="${item.id}" aria-label="${item.name} ×${supplyInventory.get(item.id)}" aria-pressed="${item.id === backpackSel}">
      <img src="${item.image}" alt=""><b>${supplyInventory.get(item.id)}</b><span class="bag-cell-name">${item.name}</span></button>`).join('');
  for (let i = items.length; i < slots; i++) html += '<span class="bag-cell empty" aria-hidden="true"></span>';
  backpackGrid.classList.add('no-anim');   // 重畫時不要重播滑鼠下那格的浮起動畫
  backpackGrid.innerHTML = html;
  requestAnimationFrame(() => requestAnimationFrame(() => backpackGrid.classList.remove('no-anim')));
  renderBackpackDetail();
}
// ---- 武器分頁：第一排手槍＋彈匣格（可以拖曳子彈上去），下面是子彈 ----
function bulletCellHtml(b) {
  return `<button type="button" class="bag-cell bullet${b.loaded && !b.free ? ' loaded' : ''}${b.count <= 0 ? ' out' : ''}${b.id === backpackSel ? ' sel' : ''}" data-bag-item="${b.id}" draggable="true" data-drag-bullet="${b.bullet}" style="--bc:${b.def.color}" aria-label="${b.name} ${b.count}/${b.max}" aria-pressed="${b.id === backpackSel}">
      ${b.image ? `<img src="${b.image}" alt="">` : `<i>${b.icon}</i>`}<b>${b.count}</b>${b.free ? '<u class="free">不佔格</u>' : b.loaded ? '<u>彈匣中</u>' : ''}<span class="bag-cell-name">${b.name}</span></button>`;
}
function renderWeaponGrid(items, columns) {
  const pistol = items.find(x => x.weapon === 'pistol'), bullets = items.filter(x => x.bullet);
  const m = typeof magState === 'function' ? magState() : { load: [] }, n = typeof magSlotCount === 'function' ? magSlotCount() : 0, maxSlots = typeof MAGAZINE !== 'undefined' ? MAGAZINE.slots[MAGAZINE.slots.length - 1] : 0;
  let row = pistol ? `<button type="button" class="bag-cell gear weapon${equipTier(pistol.lv)}${pistol.id === backpackSel ? ' sel' : ''}" data-bag-item="${pistol.id}" aria-pressed="${pistol.id === backpackSel}"><img src="${pistol.image}" alt=""><b>Lv${pistol.lv}</b><span class="bag-cell-name">${pistol.name}</span></button>` : '';
  // 彈匣架：手槍右邊一整塊，裡面每一格中間有凹槽（可以把子彈拖進去）
  let slots = '';
  for (let i = 0; i < maxSlots; i++) {
    if (i >= n) { slots += `<span class="bag-cell mag-cell locked" title="到開發工坊升級彈匣"><u>彈匣 ${i + 1}</u><i>🔒</i><span class="bag-cell-name hint">升級解鎖</span></span>`; continue; }
    const id = m.load[i], b = id && typeof BULLETS !== 'undefined' && BULLETS[id];
    slots += b ? `<button type="button" class="bag-cell mag-cell filled${BULLET_PREFIX + id === backpackSel ? ' sel' : ''}" data-mag-slot="${i}" data-bag-item="${BULLET_PREFIX + id}" draggable="true" data-drag-slot="${i}" style="--bc:${b.color}" aria-label="彈匣第 ${i + 1} 格：${b.name}"><u>彈匣 ${i + 1}</u>${b.image ? `<img src="${b.image}" alt="">` : `<i>${b.icon}</i>`}<b>${bulletCount(id)}</b><span class="bag-cell-name">${b.name}</span></button>`
      : `<span class="bag-cell mag-cell" data-mag-slot="${i}" title="把下面的子彈拖到這裡"><u>彈匣 ${i + 1}</u><i>＋</i><span class="bag-cell-name hint">拖子彈到這裡</span></span>`;
  }
  const filled = m.load.slice(0, n).filter(Boolean).length;
  row += `<div class="bag-mag-rack" style="--rack-span:${Math.max(1, columns - (pistol ? 1 : 0))};--mag-max:${Math.min(maxSlots, columns > 4 ? maxSlots : 3)}"><div class="bag-mag-head">彈匣 <b>${filled} / ${n}</b><small>${n < maxSlots ? '開發工坊可以擴充到 ' + maxSlots + ' 格' : '已擴充到最多格'}</small></div><div class="bag-mag-slots">${slots}</div></div>`;
  let rest = bullets.map(bulletCellHtml).join('');
  const total = Math.ceil(Math.max(BAG_MIN_SLOTS - columns, bullets.length) / columns) * columns;
  for (let i = bullets.length; i < total; i++) rest += '<span class="bag-cell empty" aria-hidden="true"></span>';
  backpackGrid.classList.add('no-anim');
  backpackGrid.innerHTML = row + `<p class="bag-weapon-hint">子彈 <small>拖曳到上面的彈匣格就能換子彈；只有一般子彈不佔格子；照明彈也需要一格</small></p>` + rest;
  requestAnimationFrame(() => requestAnimationFrame(() => backpackGrid.classList.remove('no-anim')));
}
function afterMagazineChange() { renderBackpack(); if (typeof updateAmmoHud === 'function' && typeof G !== 'undefined' && G && G.player) { ammoHudKey = ''; updateAmmoHud(); } }
function loadBulletToMagazine(id, slot) {
  if (typeof setMagSlot !== 'function' || !BULLETS[id] || magIsFree(id)) return;
  const m = magState(), n = magSlotCount();
  if (slot == null) { slot = m.load.slice(0, n).indexOf(id); if (slot < 0) slot = Array.from({ length: n }, (_, i) => i).find(i => !m.load[i]); }
  if (slot == null || slot < 0) { sfx('error'); systemNotice('彈匣滿了：把子彈拖到想換掉的那一格上', true); return; }
  setMagSlot(slot, id); sfx('reload'); afterMagazineChange();
}
function unloadMagazineSlot(slot) { if (typeof setMagSlot !== 'function') return; setMagSlot(slot, null); sfx('switch'); afterMagazineChange(); }
function renderBulletDetail(b) {
  backpackDetail.classList.remove('dropping', 'gear-detail');
  const tag = typeof bulletSourceTag === 'function' ? bulletSourceTag(b.def) : '';
  const slot = magState().load.slice(0, magSlotCount()).indexOf(b.bullet);
  // 提示文字各有自己的 class：背包編輯器可以分開改字、調位置（js/backpack-layout.js 的 text.freeNote／text.dragNote）
  const btn = b.free ? '<p class="bag-note free-hint">一般子彈不佔彈匣格子，一定帶著</p>'
    : slot >= 0 ? `<button type="button" class="bag-unequip" data-mag-unload="${slot}">從彈匣拿下</button>`
    : `<button type="button" class="bag-use" data-mag-load="${b.bullet}">裝進彈匣</button>`;
  backpackDetail.innerHTML = `
    <div class="bag-detail-image bullet">${b.image ? `<img src="${b.image}" alt="">` : `<i class="bag-gear-emoji">${b.icon}</i>`}</div>
    <div class="bag-item-heading"><h3>${b.name}</h3>
    <div class="bag-tags"><span class="bag-tag">${BAG_ICON.weapon}子彈</span>${tag ? `<span class="bag-tag">${tag}</span>` : ''}${b.free ? '<span class="bag-tag worn">不佔格子</span>' : slot >= 0 ? `<span class="bag-tag worn">彈匣第 ${slot + 1} 格</span>` : ''}</div></div>
    ${(b.def.bagDesc || b.def.desc) ? `<p class="bag-desc">${b.def.bagDesc || b.def.desc}</p>` : ''}
    <div class="bag-actions">${btn}${b.free ? '' : '<p class="bag-note drag-hint">也可以直接拖曳到武器分頁的彈匣格</p>'}</div>`;
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
    <div class="bag-gear-heading"><h3>${g.name}</h3><div class="bag-tags"><span class="bag-tag">${g.weapon ? BAG_ICON.weapon + '武器' : BAG_ICON.equip + (GEAR_KIND_NAME[d.kind] || '裝備')}</span><span class="bag-tag effect">Lv${g.lv}</span>${g.worn ? `<span class="bag-tag worn">${g.wornAs || '穿戴中'}</span>` : ''}</div></div>
    ${(d.bagDesc || d.ownedDesc || d.desc) ? `<p class="bag-desc">${d.bagDesc || d.ownedDesc || d.desc}</p>` : ''}<!-- 說明：跟開發工坊連通（js/backpack-layout.js 的 applyWorkshopTexts） -->
    <div class="bag-gear-stats"><div class="bag-gear-stat"><small>目前效果</small><b>${d.stat(d.levels[g.lv - 1])}</b></div></div>
    <div class="bag-actions">${gearButtons(g)}<p class="bag-note gear-hint">升級找諾亞</p></div>`;
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
  const bl = bulletEntryById(backpackSel); if (bl) { renderBulletDetail(bl); return; }
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
  const actKey = { firstaid: 'H' }[item.act];   // 腎上腺素沒有固定按鍵了：放進快捷欄就用那一格的鍵（js/quick-slots.js）
  backpackDetail.innerHTML = `
    <div class="bag-detail-image"><img src="${item.image}" alt=""></div>
    <div class="bag-item-heading"><h3>${item.name}</h3>
    <div class="bag-tags"><span class="bag-tag">${BAG_ICON[cat.id] || cat.icon + ' '}${cat.name}</span>${kind ? `<span class="bag-tag effect ${item.use}">${kind.icon} ${supplyEffect(item)}</span>` : item.effect ? `<span class="bag-tag effect">${item.effect}</span>` : ''}${item.buff && typeof buffText === 'function' ? `<span class="bag-tag effect">出勤 ${buffText(item.buff)}</span>` : ''}</div></div>
    ${itemDesc(item) ? `<p class="bag-desc">${itemDesc(item)}</p>` : ''}
    <div class="bag-actions">${backpackDrop && backpackDrop.id === item.id ? `
      <div class="bag-drop-confirm" role="group" aria-label="確認丟棄">
        <p>丟棄幾個？<small>無法復原</small></p>
        ${count > 1 ? `<div class="bag-qty"><button type="button" data-drop-qty="-1" aria-label="少一個" ${backpackDrop.qty <= 1 ? 'disabled' : ''}>−</button><b>${backpackDrop.qty}</b><button type="button" data-drop-qty="1" aria-label="多一個" ${backpackDrop.qty >= count ? 'disabled' : ''}>＋</button><button type="button" class="bag-qty-all" data-drop-qty="all" ${backpackDrop.qty >= count ? 'disabled' : ''}>全部</button></div>` : ''}
        <div class="bag-drop-buttons"><button type="button" class="bag-drop-cancel" data-drop-cancel>取消</button><button type="button" class="bag-drop-ok" data-drop-ok>丟棄 ${backpackDrop.qty} 個</button></div>
      </div>` : `
      ${usable ? `<button type="button" class="bag-use" data-bag-use="${item.id}" ${full ? 'disabled' : ''}>${full ? `${kind.stat} 已滿` : '使用'}${kind && !full ? `<kbd>${kind.key}</kbd>` : actKey ? `<kbd>${actKey}</kbd>` : ''}</button>` : (item.category === 'gift' ? '<p class="bag-note">在基地和大家對話時可以送禮</p>' : `<p class="bag-note">${item.note || '無法使用'}</p>`)}
      ${canDrop(item) ? `<button type="button" class="bag-drop" data-bag-drop="${item.id}">🗑 丟棄</button>` : '<p class="bag-note">無法丟棄</p>'}`}
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
  const bl = bulletEntryById(id);   // 子彈：連點兩下＝裝進彈匣／從彈匣拿下
  if (bl) { if (bl.free) return; const slot = magState().load.slice(0, magSlotCount()).indexOf(bl.bullet); if (slot >= 0) unloadMagazineSlot(slot); else loadBulletToMagazine(bl.bullet); return; }
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
  const cell = e.target.closest('#backpackGrid [data-bag-item]');   // 只認格子：右邊說明欄身上也有 data-bag-item（js/backpack-layout.js 寫的），不能把說明欄的按鈕當成點格子
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
  const ml = e.target.closest('[data-mag-load]');
  if (ml) { loadBulletToMagazine(ml.dataset.magLoad); return; }
  const mu = e.target.closest('[data-mag-unload]');
  if (mu) { unloadMagazineSlot(Number(mu.dataset.magUnload)); return; }
  const use = e.target.closest('[data-bag-use]');
  if (use) { useBackpackItem(use.dataset.bagUse); (backpackDetail.querySelector('.bag-use:not(:disabled)') || backpackGrid.querySelector('.bag-cell.sel') || document.getElementById('backpackClose')).focus(); }
});
// 拖曳：子彈 → 彈匣格（裝進去／換掉那格）；彈匣格 → 另一格（互換）、拖回下面（拿下）
let bagDrag = null;   // { bullet } 或 { slot }
backpackGrid.addEventListener('dragstart', e => {
  const c = e.target.closest('[data-drag-bullet], [data-drag-slot]'); if (!c) return;
  bagDrag = c.dataset.dragSlot != null ? { slot: Number(c.dataset.dragSlot) } : { bullet: c.dataset.dragBullet };
  e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', JSON.stringify(bagDrag));
  backpackGrid.classList.add('dragging');
});
backpackGrid.addEventListener('dragend', () => { bagDrag = null; backpackGrid.classList.remove('dragging'); backpackGrid.querySelectorAll('.drop-on').forEach(c => c.classList.remove('drop-on')); });
backpackGrid.addEventListener('dragover', e => {
  if (!bagDrag) return;
  const slot = e.target.closest('.mag-cell[data-mag-slot]');
  backpackGrid.querySelectorAll('.drop-on').forEach(c => { if (c !== slot) c.classList.remove('drop-on'); });
  if (slot || bagDrag.slot != null) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }
  if (slot) slot.classList.add('drop-on');
});
backpackGrid.addEventListener('drop', e => {
  if (!bagDrag) return;
  e.preventDefault();
  const slotEl = e.target.closest('.mag-cell[data-mag-slot]'), d = bagDrag; bagDrag = null;
  if (slotEl) {
    const to = Number(slotEl.dataset.magSlot);
    if (d.bullet) loadBulletToMagazine(d.bullet, to);
    else if (d.slot !== to) { const m = magState(), id = m.load[d.slot]; if (id) { setMagSlot(to, id); sfx('reload'); afterMagazineChange(); } }   // setMagSlot 會把兩格對調
  } else if (d.slot != null) unloadMagazineSlot(d.slot);   // 從彈匣拖到其他地方＝拿下
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
