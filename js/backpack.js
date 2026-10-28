// ============================================================
//  背包：左邊格子、右邊物品說明。按 B 或下方資訊條的「背包」打開，打開時遊戲暫停。
//  物品資料：商店的零食飲料在 data/supplies.js，其他物品在 data/items.js。
//  背包裡有什麼存在 supplyInventory（就在下面）：物品 id → 數量。商店、送禮、存檔都會用到。
// ============================================================
const supplyInventory = new Map();   // 背包裡的東西：物品 id → 數量
// 格數：「物品」、「彈藥包」一開始各 12 格，開發工坊升級（data/equipment.js 的 BAG_UPGRADES，等級存在 equipState.bag）。
// 同種物品每 20 個佔一格；彈藥包一種子彈一格。重要物品、隊員物資、防具沒有格數上限。
const BAG_STACK_MAX = 20;
const bagUnlimited = category => category === 'equip' || category === 'squadgear' || category === 'key';
const bagUpgradeKey = category => category === 'weapon' ? 'ammo' : 'items';
function bagLevel(key) {
  const b = equipState.bag || (equipState.bag = { items: 1, ammo: 1 });
  return Math.max(1, Math.min(BAG_UPGRADES[key].slots.length, b[key] | 0 || 1));
}
const bagCapacity = category => BAG_UPGRADES[bagUpgradeKey(category)].slots[bagLevel(bagUpgradeKey(category)) - 1];
function bagCategory(x) {
  const id = typeof x === 'string' ? x : x.id;
  const supply = typeof SUPPLIES !== 'undefined' && SUPPLIES.find(item => item.id === id);
  if (supply) return supply.kind === 'snack' || supply.kind === 'drink' ? 'squadgear' : 'consumable';
  const item = typeof ITEMS !== 'undefined' && ITEMS.find(item => item.id === id);
  return (item && item.category) || (typeof x === 'object' && x.category) || 'consumable';
}
function bagUsedSlots(inventory = supplyInventory, category = null) {
  if (category === 'weapon') return typeof ownedBullets === 'function' ? ownedBullets().length : 0;   // 彈藥包：一種子彈一格（手槍、一般子彈不佔）
  if (category === 'equip') return typeof ownedGear === 'function' ? ownedGear().length : 0;
  return [...inventory].reduce((sum, [id, n]) => sum + ((!category || bagCategory(id) === category) ? Math.ceil(Math.max(0, n) / BAG_STACK_MAX) : 0), 0);
}
const carryMax = () => Infinity;
function carryRoom(x, inventory = supplyInventory) {
  if (bagUnlimited(bagCategory(x))) return Infinity;
  const id = typeof x === 'string' ? x : x.id, n = inventory.get(id) || 0;
  const used = bagUsedSlots(inventory, bagCategory(x)), cap = bagCapacity(bagCategory(x));
  if (used > cap) return 0;
  return Math.max(0, cap - used) * BAG_STACK_MAX + (n % BAG_STACK_MAX ? BAG_STACK_MAX - n % BAG_STACK_MAX : 0);
}
// 直接寫入也遵守容量；減少數量不受限制。讀檔另走原生 set，保留舊存檔物品。
supplyInventory.set = function (id, n) {
  const old = this.get(id) || 0;
  n = Number.isFinite(n) ? Math.max(0, Math.floor(n)) : old;
  return Map.prototype.set.call(this, id, n > old ? old + Math.min(n - old, carryRoom(id, this)) : n);
};
function bagCanApply(changes) {
  const next = new Map(supplyInventory);
  for (const [id, delta] of changes) next.set(id, Math.max(0, (next.get(id) || 0) + delta));
  const categories = new Set(changes.map(([id]) => bagCategory(id)));
  return [...categories].every(category => bagUnlimited(category) || bagUsedSlots(next, category) <= bagCapacity(category));
}
function supplyGain(id, n = 1, quiet = false) {
  const got = Math.min(n, carryRoom(id));
  if (got > 0) supplyInventory.set(id, (supplyInventory.get(id) || 0) + got);
  if (got < n && !quiet && typeof systemNotice === 'function') {
    const it = typeof itemById === 'function' && itemById(id);
    systemNotice('這個分類空間不足（' + bagCapacity(bagCategory(id)) + ' 格，每格 ' + BAG_STACK_MAX + ' 個）：「' + (it ? it.name : id) + '」' + (got ? '只拿了 ' + got + ' 個' : '拿不下了'), true);
  }
  return got;
}
const backpackEl = document.getElementById('backpack');
const backpackGrid = document.getElementById('backpackGrid');
const backpackDetail = document.getElementById('backpackDetail');
let backpackOpen = false, backpackTab = 'consumable', backpackSel = null;
let backpackCampContext = null;
let campArmorOpen = false;   // true＝背包視窗現在是防具視窗（openArmorPanel）
let armorWho = 'winter';     // 防具視窗正在換誰的：'winter'＝部隊長（防具），其他＝隊員 type（隊員裝備，js/squad-gear.js）
let armorSlotPick = null;    // 點了隊員的空格：「穿上」就放這一格
const SQ_ARMOR_PREFIX = 'sgear:', SQ_WORN_PREFIX = 'sworn:';   // 右邊格子的 id／選到隊員身上第幾格
const armorForMember = () => campArmorOpen && armorWho !== 'winter';
let armorRemote = null;      // 從 T-Pad 隊員頁（V2「更換裝備」）打開的：{ member, solo }；只能換隊員的，關掉後回到 T-Pad 那一頁
function bagAtCampTent() {
  const spot = typeof campInteractionNearPlayer === 'function' && campInteractionNearPlayer();
  return !!spot && spot.kind === 'retreat';
}
function bagCanManageEquipment() {
  return campArmorOpen || MAP_SAFE || (backpackCampContext === G && bagAtCampTent());
}
// 能不能換防具：只有防具視窗裡、裝備箱旁邊
const bagCanChangeArmor = () => campArmorOpen || !!armorChestNearPlayer();
const armorWhereHint = () => '請到裝備箱調整防具';
const bagTabVisible = category => campArmorOpen ? category === 'equip' : category !== 'equip' && (category !== 'squadgear' || bagCanManageEquipment());   // 防具視窗只有「防具」分頁；背包沒有
let bagDropQty = 1;   // 「放在地上」旁邊選的數量（換選別的物品就回到 1）
// 能不能放在地上：重要物品不能；個別物品也可以在資料裡寫 noDrop: true（放下去的東西走過去可以撿回來，js/ground-items.js）
const canDrop = item => !!item && !item.noDrop && item.category !== 'key';

// 所有物品：商店補給品歸在「消耗品」，再加上 data/items.js 的其他物品
const allItems = () => [...SUPPLIES.map(item => ({ ...item, category: item.kind === 'snack' || item.kind === 'drink' ? 'squadgear' : 'consumable' })), ...ITEMS];
const itemById = id => allItems().find(item => item.id === id) || null;
const categoryOf = id => ITEM_CATEGORIES.find(c => c.id === id) || { id, name: id, icon: '•' };
function itemDesc(item) {
  if (item.desc) return item.desc;
  if (item.kind === 'snack' || item.kind === 'drink') return '便利商店買來的。可以送給大家，看看誰喜歡。';
  return '';
}
// 「武器」分頁：第一排＝手槍＋彈匣格，下面＝擁有的子彈（拖曳到彈匣格就換子彈，js/magazine.js）
// 「防具」分頁：列出擁有的部隊長裝備（js/equipment.js 的 equipState），換裝備用左邊的裝備格
const WEAPON_TAB = { id: 'weapon', name: '彈藥包', icon: '🔫' };
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
  if (armorForMember()) return squadArmorItems();
  if (backpackTab === GEAR_TAB.id) return ownedGear();
  if (backpackTab === WEAPON_TAB.id) return [pistolEntry(), ...ownedBullets()].filter(Boolean);
  const items = allItems().filter(item => (supplyInventory.get(item.id) || 0) > 0 && item.category === backpackTab);
  if (backpackTab === 'squadgear') items.sort((a, b) => Number(!!b.squadGear) - Number(!!a.squadGear));
  return items;
}

function renderBackpack() {
  if (!backpackEl) return;
  if (!bagTabVisible(backpackTab)) { backpackTab = 'consumable'; backpackSel = null; }
  document.getElementById('backpackTitle').textContent = campArmorOpen ? '防具' : '背包';
  document.getElementById('backpackCount').textContent = armorForMember() ? squadArmorItems().reduce((n, g) => n + g.count, 0) + ' 件' : campArmorOpen ? ownedGear().length + ' 件'
    : bagUsedSlots(supplyInventory, backpackTab) + (bagUnlimited(backpackTab) ? ' 格（無上限）' : ' / ' + bagCapacity(backpackTab) + ' 格');
  if (armorForMember()) renderSquadArmorPanel();   // 防具視窗選了隊員：左邊換成那位隊員的 3 格
  else if (typeof renderEquipPanel === 'function') renderEquipPanel();   // 左邊的部隊長裝備（js/equipment.js）
  backpackEl.classList.toggle('armor-mode', campArmorOpen);
  if (campArmorOpen) addArmorWhoTabs();   // 防具視窗：左邊一條選要換誰的
  else document.getElementById('equipPanel')?.classList.remove('with-who');
  // 分類分頁：有格數上限的（物品、彈藥包）在左邊，後面標「用了幾格/幾格」；沒有上限的（重要物品…）放在「|」右邊
  const tabBtn = cat => `<button type="button" role="tab" data-bag-tab="${cat.id}" class="${backpackTab === cat.id ? 'active' : ''}" aria-selected="${backpackTab === cat.id}">${BAG_ICON[cat.id] || (cat.icon ? cat.icon + ' ' : '')}${cat.name}${bagUnlimited(cat.id) ? '' : `<em class="bag-tab-count">${bagUsedSlots(supplyInventory, cat.id)}/${bagCapacity(cat.id)}</em>`}</button>`;
  const cats = [...ITEM_CATEGORIES, WEAPON_TAB, GEAR_TAB].filter(cat => bagTabVisible(cat.id));
  const limited = cats.filter(cat => !bagUnlimited(cat.id)), unlimited = cats.filter(cat => bagUnlimited(cat.id));
  document.getElementById('backpackTabs').innerHTML = limited.map(tabBtn).join('') + (limited.length && unlimited.length ? '<span class="bag-tab-sep" aria-hidden="true">|</span>' : '') + unlimited.map(tabBtn).join('');
  // 格子
  const items = ownedItems().flatMap(item => {
    if (item.bullet || item.gear || item.sgear) return [item];
    const n = supplyInventory.get(item.id) || 0;
    return Array.from({ length: Math.ceil(n / BAG_STACK_MAX) }, (_, i) => ({ ...item, stackCount: Math.min(BAG_STACK_MAX, n - i * BAG_STACK_MAX) }));
  });
  if (!items.some(item => item.id === backpackSel) && !(armorForMember() && String(backpackSel).startsWith(SQ_WORN_PREFIX))) backpackSel = items[0]?.id || null;
  const columns = window.innerWidth <= 560 ? 4 : window.innerWidth <= 900 ? 5 : 6;
  const slots = bagUnlimited(backpackTab) ? items.length : Math.max(bagCapacity(backpackTab), items.length);
  if (backpackTab === WEAPON_TAB.id) { renderWeaponGrid(items, columns); renderBackpackDetail(); return; }
  if (armorForMember()) { renderSquadArmorGrid(items); renderBackpackDetail(); return; }
  if (backpackTab === GEAR_TAB.id) { renderGearGrid(items, columns); renderBackpackDetail(); return; }
  let html = items.map(item => item.bullet ? bulletCellHtml(item) : item.gear ? gearCellHtml(item) : `<button type="button" class="bag-cell ${item.kind || item.category}${item.id === backpackSel ? ' sel' : ''}" data-bag-item="${item.id}" aria-label="${item.name} ×${item.stackCount}" aria-pressed="${item.id === backpackSel}">
      <img src="${item.image}" alt=""><b>${item.stackCount}</b><span class="bag-cell-name">${item.name}</span></button>`).join('');
  for (let i = items.length; i < slots; i++) html += '<span class="bag-cell empty" aria-hidden="true"></span>';
  backpackGrid.classList.add('no-anim');   // 重畫時不要重播滑鼠下那格的浮起動畫
  backpackGrid.innerHTML = html;
  requestAnimationFrame(() => requestAnimationFrame(() => backpackGrid.classList.remove('no-anim')));
  renderBackpackDetail();
}
function gearCellHtml(item) {
  const drag = campArmorOpen && !item.weapon ? ` draggable="true" data-drag-gear="${item.gear.id}"` : '';   // 防具視窗：可以拖到左邊的裝備格
  return `<button type="button" class="bag-cell gear${item.weapon ? ' weapon' : ''}${equipTier(item.lv)}${item.worn ? ' worn' : ''}${item.id === backpackSel ? ' sel' : ''}" data-bag-item="${item.id}"${drag} aria-label="${item.name} Lv${item.lv}${item.worn ? '（穿戴中）' : ''}" aria-pressed="${item.id === backpackSel}">
      ${item.image ? `<img src="${item.image}" alt="">` : `<i>${item.icon}</i>`}<b>Lv${item.lv}</b>${item.worn && !item.weapon ? `<u>${item.wornAs || '穿戴中'}</u>` : ''}<span class="bag-cell-name">${item.name}</span></button>`;
}
// ---- 防具分頁：依部位分段，整個分類共 35 格 ----
function renderGearGrid(items, columns) {
  let html = '';
  for (const [kind, name] of Object.entries(GEAR_KIND_NAME)) {
    const group = items.filter(g => g.gear.kind === kind);
    if (!group.length) continue;
    html += `<p class="bag-weapon-hint bag-gear-group">${name} <small>${group.length} 件</small></p>` + group.map(gearCellHtml).join('');
  }
  backpackGrid.classList.add('no-anim');
  backpackGrid.innerHTML = html;
  requestAnimationFrame(() => requestAnimationFrame(() => backpackGrid.classList.remove('no-anim')));
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
  const total = Math.max(bagCapacity('weapon'), bullets.length);
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
  setMagSlot(slot, id); sfx('magLoad'); afterMagazineChange();
}
function unloadMagazineSlot(slot) { if (typeof setMagSlot !== 'function') return; setMagSlot(slot, null); sfx('switch'); afterMagazineChange(); }
function renderBulletDetail(b) {
  backpackDetail.classList.remove('gear-detail');
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
    <div class="bag-actions">${btn}${b.free ? '' : '<p class="bag-note drag-hint">也可以直接拖曳到彈藥包分頁的彈匣格</p>'}</div>`;
}
// 裝備按鈕：只有一格能放就「裝備」；可以放兩格（主／副武器、隨身物品 1／2）就各一顆。已經在那格就變「卸下」
function gearButtons(g) {
  const kind = g.weapon ? 'weapon' : 'gear', id = g.weapon || g.gear.id;
  const slots = typeof slotsForGear === 'function' ? slotsForGear(kind, id) : [];
  return '<div class="bag-equip-buttons">' + slots.map(s => s.cur
    ? `<button type="button" class="bag-unequip" data-gear-off="${s.id}">卸下${slots.length > 1 ? '（' + s.name + '）' : ''}</button>`
    : `<button type="button" class="bag-use" data-gear-equip="${s.id}" data-gear-id="${id}">${slots.length > 1 ? '裝到' + s.name : '裝備'}</button>`).join('') + '</div>';
}
// 左邊點空格：選第一件能放這格的防具（從背包點：換成防具視窗）
function showGearForSlot(slotId) {
  if (!bagCanChangeArmor()) { systemNotice(armorWhereHint(), true); return; }
  const fit = ownedGear().find(g => slotsForGear(g.weapon ? 'weapon' : 'gear', g.weapon || g.gear.id).some(s => s.id === slotId && !s.cur));
  if (!campArmorOpen) { openArmorPanel(fit?.id); return; }
  backpackSel = fit ? fit.id : null;
  sfx('switch'); renderBackpack();
  if (!fit) systemNotice('沒有可以放這一格的裝備');
  backpackGrid.querySelector('.bag-cell.sel')?.focus();
}
function renderGearDetail(g) {
  const d = g.gear;
  backpackDetail.classList.add('gear-detail');
  backpackDetail.innerHTML = `
    <div class="bag-detail-image">${g.image ? `<img src="${g.image}" alt=""${g.weapon ? ' class="weapon"' : ''}>` : `<i class="bag-gear-emoji">${g.icon}</i>`}</div>
    <div class="bag-gear-heading"><h3>${g.name}</h3><div class="bag-tags"><span class="bag-tag">${g.weapon ? BAG_ICON.weapon + '武器' : BAG_ICON.equip + (GEAR_KIND_NAME[d.kind] || '裝備')}</span><span class="bag-tag effect">Lv${g.lv}</span>${g.worn ? `<span class="bag-tag worn">${g.wornAs || '穿戴中'}</span>` : ''}</div></div>
    ${(d.bagDesc || d.ownedDesc || d.desc) ? `<p class="bag-desc">${d.bagDesc || d.ownedDesc || d.desc}</p>` : ''}<!-- 說明：跟開發工坊連通（js/backpack-layout.js 的 applyWorkshopTexts） -->
    <div class="bag-gear-stats"><div class="bag-gear-stat"><small>目前效果</small><b>${d.stat(d.levels[g.lv - 1])}</b></div></div>
    <div class="bag-actions">${gearButtons(g)}<p class="bag-note gear-hint">升級找諾亞</p></div>`;
}
// ---- 防具視窗：借用背包視窗，只顯示「防具」分頁（排版、外觀跟背包的防具分頁一樣）----
// 只能靠近裝備箱按互動鍵開（基地、戰鬥地圖都一樣；裝備箱放在哪張地圖都可以）
// 裝備箱：地圖編輯器上傳的 ammo-crate02（素材 ID 或名稱都認）。要讓別的物件也能開防具，加在這裡
const ARMOR_CHEST = { tiles: ['tile_mvma4ws7', 'tile_mvotwe6t'], names: ['ammo-crate02', 'Poolcore_ammo_crate02'] };   // 池核版：Poolcore_ammo_crate02.png
const armorChestNearPlayer = () => typeof mapBoxNearPlayer === 'function' ? mapBoxNearPlayer('armor') : null;   // 判定範圍：js/camp-interactions.js 的 MAP_BOX
function useArmorChestNearPlayer() { if (!armorChestNearPlayer()) return false; openArmorPanel(); return true; }
function openArmorPanel(selection) {
  if (!G?.player || G.over || !armorChestNearPlayer()) return;
  closeBackpack(true);
  campArmorOpen = true; backpackTab = GEAR_TAB.id; backpackSel = null; armorWho = 'winter'; armorSlotPick = null;
  openBackpack({ camp: true });
  if (!backpackOpen) { campArmorOpen = false; backpackTab = 'consumable'; return; }
  if (selection) { backpackSel = selection; renderBackpack(); backpackGrid.querySelector('.bag-cell.sel')?.focus(); }
}
// 只換選取的格子：不重畫整個背包（重畫會讓格子、溫特立繪重新建立而閃一下）
function selectBackpackItem(id) {
  backpackSel = id; bagDropQty = 1;
  backpackGrid.querySelectorAll('.bag-cell[data-bag-item]').forEach(c => {
    const on = c.dataset.bagItem === id; c.classList.toggle('sel', on); c.setAttribute('aria-pressed', on);
  });
  renderBackpackDetail(); sfx('blip');
}
function renderBackpackDetail() {
  if (armorForMember()) { renderSquadArmorDetail(); return; }
  const bl = bulletEntryById(backpackSel); if (bl) { renderBulletDetail(bl); return; }
  const g = gearById(backpackSel); if (g) { renderGearDetail(g); return; }
  backpackDetail.classList.remove('gear-detail');
  const item = itemById(backpackSel);
  if (!item) {
    backpackDetail.innerHTML = '<div class="bag-detail-empty"><span>🎒</span><p>沒有物品</p></div>';
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
    <div class="bag-actions">
      ${usable ? `<button type="button" class="bag-use" data-bag-use="${item.id}">使用${kind ? `<kbd>${kind.key}</kbd>` : actKey ? `<kbd>${actKey}</kbd>` : ''}</button>` : noUseHtml(item.category === 'gift' ? '在基地和大家對話時可以送禮' : item.note || '無法使用')}
      ${canDrop(item) ? dropRowHtml(item, count) : '<p class="bag-note">無法放在地上</p>'}
    </div>`;
}
// 不能使用的物品：說明放在「可直接拖曳到下方快捷鍵」那一行，下面留一個看不見的「使用」按鈕佔位，
// 「放在地上」和數量才會停在跟能使用的物品一樣的位置（背包編輯器調的位置兩種都對得上）
const noUseHtml = note => `<div class="bag-quick bag-use-slot"><small class="bag-ghost" aria-hidden="true">可直接拖曳到下方快捷鍵</small><p class="bag-note">${note}</p></div>`
  + '<button type="button" class="bag-use bag-ghost" tabindex="-1" aria-hidden="true">使用</button>';
// 「放在地上」：左邊直接調數量（只有一個就不顯示），按按鈕就放下（撿得回來，不用再確認）
function dropRowHtml(item, count) {
  const q = Math.min(bagDropQty, count);
  return `<div class="bag-drop-row">${count > 1 ? `<div class="bag-qty"><button type="button" data-drop-qty="-1" aria-label="少一個" ${q <= 1 ? 'disabled' : ''}>−</button><b>${q}</b><button type="button" data-drop-qty="1" aria-label="多一個" ${q >= count ? 'disabled' : ''}>＋</button></div>` : ''}<button type="button" class="bag-drop" data-bag-drop="${item.id}">放在地上</button></div>`;
}
function dropFromBackpack(id) {
  const item = itemById(id), count = supplyInventory.get(id) || 0, n = Math.min(bagDropQty, count);
  if (!canDrop(item) || n <= 0) { sfx('error'); return; }
  if (!dropItemOnGround(id, n)) return;   // 放在溫特腳邊（js/ground-items.js）
  bagDropQty = 1;
  sfx('place'); systemNotice(`已把 ${item.name} ×${n} 放在地上`);
  updateHUD(); renderBackpack(); if (typeof supplyShopOpen !== 'undefined' && supplyShopOpen) renderSupplyShop();
  (backpackDetail.querySelector('.bag-drop') || backpackGrid.querySelector('.bag-cell.sel') || document.getElementById('backpackClose')).focus();
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

function openBackpack(options = {}) {
  if (!G || G.over || !G.player || backpackOpen) return;
  backpackCampContext = options.camp === true && bagAtCampTent() ? G : null;
  if (options.category && bagTabVisible(options.category)) backpackTab = options.category;
  if (typeof closeSupplyShop === 'function') closeSupplyShop(true);
  backpackOpen = true; aimHeld = false; Object.keys(keys).forEach(key => { keys[key] = false; });
  closeElevatorMenu(); closeDialogue(true); closeSentryMenu(); closeGroundMenu(); closeBuildMenu();
  renderBackpack(); backpackEl.classList.remove('hidden'); sfx('menu');
  (backpackGrid.querySelector('.bag-cell.sel') || document.getElementById('backpackClose')).focus();
}
function closeBackpack(silent = false) {
  if (!backpackOpen) return; backpackOpen = false; bagDropQty = 1; backpackEl.classList.add('hidden'); if (!silent) sfx('switch');
  if (campArmorOpen) { campArmorOpen = false; backpackTab = 'consumable'; backpackSel = null; }   // 防具視窗關掉：下次按 B 是一般背包
  if (armorRemote) { const r = armorRemote; armorRemote = null; setTimeout(() => { if (typeof openSquadPageOf === 'function') openSquadPageOf(r.member, r.solo); }, 0); }   // 從 T-Pad 打開的：回到那位隊員的頁面
}

document.getElementById('backpackClose').addEventListener('click', () => closeBackpack());
backpackEl.addEventListener('click', e => {
  if (e.target === backpackEl) { closeBackpack(); return; }
  const tab = e.target.closest('[data-bag-tab]');
  if (tab) { if (!bagTabVisible(tab.dataset.bagTab)) return; backpackTab = tab.dataset.bagTab; backpackSel = null; bagDropQty = 1; renderBackpack(); sfx('switch'); return; }
  if (handleSquadArmorClick(e)) return;   // 防具視窗：選人、隊員的格子、穿上／卸下
  const cell = e.target.closest('#backpackGrid [data-bag-item]');   // 只認格子：右邊說明欄身上也有 data-bag-item（js/backpack-layout.js 寫的），不能把說明欄的按鈕當成點格子
  if (cell) { if (backpackSel !== cell.dataset.bagItem) selectBackpackItem(cell.dataset.bagItem); backpackGrid.querySelector('.bag-cell.sel')?.focus(); return; }
  if (e.target.closest('[data-bag-drop]')) { dropFromBackpack(e.target.closest('[data-bag-drop]').dataset.bagDrop); return; }
  const qtyBtn = e.target.closest('[data-drop-qty]');
  if (qtyBtn) {
    const max = supplyInventory.get(backpackSel) || 1, v = qtyBtn.dataset.dropQty;
    bagDropQty = Math.max(1, Math.min(max, bagDropQty + Number(v)));
    renderBackpackDetail(); sfx('blip');
    (backpackDetail.querySelector(`[data-drop-qty="${v}"]:not(:disabled)`) || backpackDetail.querySelector('.bag-drop')).focus();
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
// 防具視窗：防具 → 左邊部隊長裝備的格子（能放的格子會亮起來）
let bagDrag = null;   // { bullet }、{ slot } 或 { gear }
backpackGrid.addEventListener('dragstart', e => {
  const c = e.target.closest('[data-drag-bullet], [data-drag-slot], [data-drag-gear], [data-drag-sgear]'); if (!c) return;
  bagDrag = c.dataset.dragSgear ? { sgear: c.dataset.dragSgear } : c.dataset.dragGear ? { gear: c.dataset.dragGear } : c.dataset.dragSlot != null ? { slot: Number(c.dataset.dragSlot) } : { bullet: c.dataset.dragBullet };
  e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', JSON.stringify(bagDrag));
  backpackGrid.classList.add('dragging');
  if (bagDrag.sgear) document.querySelectorAll('#equipPanel [data-sq-slot]').forEach(s => s.classList.add('drop-ok'));   // 隊員裝備：三格都能放（放在有東西的格子＝換掉）
  if (bagDrag.gear) for (const s of slotsForGear('gear', bagDrag.gear)) document.querySelector(`#equipPanel [data-equip-slot="${s.id}"]`)?.classList.add('drop-ok');
});
backpackGrid.addEventListener('dragend', () => { bagDrag = null; backpackGrid.classList.remove('dragging'); document.querySelectorAll('#backpackGrid .drop-on, #equipPanel .drop-on, #equipPanel .drop-ok').forEach(c => c.classList.remove('drop-on', 'drop-ok')); });
const gearDropSlot = e => bagDrag?.gear || bagDrag?.sgear ? e.target.closest?.('#equipPanel .drop-ok') : null;   // 拖到能放這件防具的格子上
document.addEventListener('dragover', e => {
  if (!bagDrag?.gear && !bagDrag?.sgear) return;
  const slot = gearDropSlot(e);
  document.querySelectorAll('#equipPanel .drop-on').forEach(c => { if (c !== slot) c.classList.remove('drop-on'); });
  if (slot) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; slot.classList.add('drop-on'); }
});
document.addEventListener('drop', e => {
  const slot = gearDropSlot(e); if (!slot) return;
  e.preventDefault();
  const d = bagDrag; bagDrag = null;
  if (d.sgear) { wearSquadArmor(d.sgear, Number(slot.dataset.sqSlot)); return; }
  equipToSlot(slot.dataset.equipSlot, d.gear);
  backpackSel = 'gear:' + d.gear; renderBackpack();
});
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
    else if (d.slot !== to) { const m = magState(), id = m.load[d.slot]; if (id) { setMagSlot(to, id); sfx('magLoad'); afterMagazineChange(); } }   // setMagSlot 會把兩格對調
  } else if (d.slot != null) unloadMagazineSlot(d.slot);   // 從彈匣拖到其他地方＝拿下
});
backpackGrid.addEventListener('dblclick', e => { const cell = e.target.closest('[data-bag-item]'); if (!cell) return;   // 連點兩下直接使用（防具視窗的隊員裝備＝穿上）
  if (armorForMember() && cell.dataset.bagItem.startsWith(SQ_ARMOR_PREFIX)) wearSquadArmor(cell.dataset.bagItem.slice(SQ_ARMOR_PREFIX.length)); else useBackpackItem(cell.dataset.bagItem); });
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
  if ((k === 'delete' || k === 'backspace') && backpackSel && itemById(backpackSel)) { e.preventDefault(); dropFromBackpack(backpackSel); return; }   // Delete：照目前選的數量放在地上
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

// ---- 開發工坊：背包擴充、彈藥包擴充（js/equipment.js 的 workshopEntries、workshopBuy 呼叫）----
function bagWorkshopEntries() {
  return Object.entries(BAG_UPGRADES).map(([key, u]) => {
    const lv = bagLevel(key), cost = u.cost[lv - 1] || 0;
    return { key: 'bag:' + key, kind: 'bag', def: u, name: u.name, lv, max: u.slots.length, icon: equipIcon(u), image: u.image || null, emoji: u.icon,
      tag: '背包', worn: false, about: '背包的「' + u.tab + '」分頁多 ' + (u.slots[1] - u.slots[0]) + ' 格（最多 ' + u.slots[u.slots.length - 1] + ' 格）', stat: n => u.tab + ' ' + u.slots[n - 1] + ' 格',
      canDev: false, where: '', upCost: cost, upMoney: lv < u.slots.length ? wsMoney('bag:' + key, lv - 1, cost) : 0, buy: 'bg:' + key };
  });
}
function bagWorkshopBuy(kind, key) {
  if (kind !== 'bg' || !BAG_UPGRADES[key]) return false;
  const u = BAG_UPGRADES[key], lv = bagLevel(key); if (lv >= u.slots.length) return true;
  if (!spendWorkshop(u.cost[lv - 1], wsMoney('bag:' + key, lv - 1, u.cost[lv - 1]))) return true;
  equipState.bag[key] = lv + 1; saveEquipment(); SFX.play('achievement', .7, 'equip-up');
  showWorkshopToast(u.icon + ' ' + u.name + '：「' + u.tab + '」可以放 ' + u.slots[lv] + ' 格');
  return true;
}

// ---- 防具視窗：也能換 Y102 隊員的隊員裝備（左上角選人；部隊長＝原本的防具）----
// 隊員裝備的資料、穿上／卸下的規則在 js/squad-gear.js（一件只能給一個人、同一種一人只能穿一格）
const armorMembers = () => typeof squadMemberList === 'function' ? squadMemberList().filter(m => !m.noncombat && TYPES[m.type]).map(m => m.type) : [];
function squadArmorItems() {
  if (typeof squadGearList !== 'function') return [];
  return squadGearList().filter(g => (supplyInventory.get(g.id) || 0) > 0)
    .map(g => ({ id: SQ_ARMOR_PREFIX + g.id, name: g.name, image: squadGearImage(g), sgear: g, count: supplyInventory.get(g.id) }));
}
// 左上角：部隊長＋每位隊員的頭像，點了切換要換誰的
function addArmorWhoTabs() {
  const box = document.getElementById('equipPanel'); if (!box) return;
  const who = armorRemote ? armorMembers() : ['winter', ...armorMembers()];   // 從 T-Pad 打開：不能換部隊長的防具（那要到裝備箱）
  if (!who.includes(armorWho)) armorWho = who[0] || 'winter';
  const nameOf = id => id === 'winter' ? '部隊長' : (TYPES[id]?.name || id);
  const imgOf = id => memberPortraitPath(id === 'winter' ? CHARACTERS.winter : TYPES[id]);
  // 排版跟 T-Pad「Y102隊員」左邊的名單一樣：左邊一條直的頭像列，右邊是原本的內容
  const keep = box.querySelector('.armor-who')?.scrollTop || 0;
  const main = document.createElement('div'); main.className = 'armor-main';
  main.append(...box.childNodes);
  box.innerHTML = '<div class="armor-who" role="tablist" aria-label="要換誰的裝備">' + who.map(id =>
    `<span class="aw-item${id === armorWho ? ' on' : ''}"><button type="button" role="tab" data-armor-who="${id}" class="${id === armorWho ? 'on' : ''}" aria-selected="${id === armorWho}" title="${nameOf(id)}"><img src="${imgOf(id)}" alt="${nameOf(id)}"></button></span>`).join('') + '</div>';
  box.append(main); box.classList.add('with-who');
  box.querySelector('.armor-who').scrollTop = keep;
}
// 左邊：隊員的立繪＋3 格隊員裝備
function renderSquadArmorPanel() {
  const box = document.getElementById('equipPanel'); if (!box) return;
  const spec = TYPES[armorWho] || {}, gear = squadGearOf(armorWho);
  const slots = gear.map((id, i) => {
    const g = id && squadGearById(id), sel = backpackSel === SQ_WORN_PREFIX + i || (!g && armorSlotPick === i);
    return `<button type="button" class="doll-slot${g ? ' filled' : ''}${sel ? ' picking' : ''}" data-sq-slot="${i}" title="裝備 ${i + 1}${g ? '：' + g.name : '：未裝備'}">`
      + `<span>${g ? `<img src="${squadGearImage(g)}" alt="">` : '＋'}</span><small>${g ? g.name : '裝備 ' + (i + 1)}</small></button>`;
  }).join('');
  box.classList.remove('with-who');
  box.innerHTML = `<h3>${spec.name || armorWho}${spec.guide ? '嚮導' : '哨兵'}裝備</h3><div class="equip-doll sq-doll"><img class="doll-art sprite" data-member="${armorWho}" src="${memberPortraitPath(spec)}" alt="${spec.name || ''}"><div class="doll-slots">${slots}</div></div>`;
}
// 右邊：背包裡的隊員裝備
function renderSquadArmorGrid(items) {
  const name = (TYPES[armorWho]?.name || armorWho) + (TYPES[armorWho]?.guide ? '嚮導' : '哨兵');
  let html = `<p class="bag-weapon-hint bag-gear-group">隊員裝備 <small>點一下再按「穿上」，或直接拖到左邊${name}的格子</small></p>`;
  html += items.map(g => `<button type="button" class="bag-cell squadgear${g.id === backpackSel ? ' sel' : ''}" data-bag-item="${g.id}" draggable="true" data-drag-sgear="${g.sgear.id}" aria-label="${g.name} ×${g.count}" aria-pressed="${g.id === backpackSel}">
      <img src="${g.image}" alt=""><b>${g.count}</b><span class="bag-cell-name">${g.name}</span></button>`).join('');
  if (!items.length) html += '<p class="bag-weapon-hint">背包裡沒有隊員裝備 <small>可以找諾亞的開發工坊製作</small></p>';
  backpackGrid.classList.add('no-anim');
  backpackGrid.innerHTML = html;
  requestAnimationFrame(() => requestAnimationFrame(() => backpackGrid.classList.remove('no-anim')));
}
// 右下說明：選到背包裡的＝「穿上」；選到隊員身上的那格＝「卸下」
function renderSquadArmorDetail() {
  backpackDetail.classList.add('gear-detail');
  const worn = String(backpackSel || '').startsWith(SQ_WORN_PREFIX), slot = worn ? Number(backpackSel.slice(SQ_WORN_PREFIX.length)) : -1;
  const id = worn ? squadGearOf(armorWho)[slot] : String(backpackSel || '').startsWith(SQ_ARMOR_PREFIX) ? backpackSel.slice(SQ_ARMOR_PREFIX.length) : null;
  const g = id && squadGearById(id);
  if (!g) { backpackDetail.innerHTML = '<div class="bag-detail-empty"><span>🎽</span><p>點左邊的格子，或選一件隊員裝備</p></div>'; return; }
  const name = (TYPES[armorWho]?.name || armorWho) + (TYPES[armorWho]?.guide ? '嚮導' : '哨兵'), dup = !worn && squadGearWornAt(armorWho, g.id, -1) >= 0;
  const btn = worn ? `<button type="button" class="bag-unequip" data-sq-off="${slot}">卸下</button>`
    : dup ? `<p class="bag-note">${name}已經穿著同一種裝備了</p>`
    : `<button type="button" class="bag-use" data-sq-wear="${g.id}">穿上${armorSlotPick != null ? '（裝備 ' + (armorSlotPick + 1) + '）' : ''}</button>`;
  backpackDetail.innerHTML = `
    <div class="bag-detail-image"><img src="${squadGearImage(g)}" alt=""></div>
    <div class="bag-gear-heading"><h3>${g.name}</h3><div class="bag-tags"><span class="bag-tag">🎽 隊員裝備</span>${worn ? `<span class="bag-tag worn">${name}・裝備 ${slot + 1}</span>` : ''}</div></div>
    ${g.desc ? `<p class="bag-desc">${g.desc}</p>` : ''}
    <div class="bag-gear-stats"><div class="bag-gear-stat"><small>效果</small><b>${squadGearEffect(g) || '—'}</b></div></div>
    <div class="bag-actions">${btn}</div>`;
}
// 穿上：slot 沒指定就放剛剛點的空格，再不然放第一個空格；都滿了就請玩家拖到要換掉的那格
function wearSquadArmor(id, slot) {
  const list = squadGearOf(armorWho);
  if (slot == null) slot = armorSlotPick != null ? armorSlotPick : list.indexOf(null);
  if (slot < 0) { sfx('error'); systemNotice('三格都穿滿了：先卸下一件，或把裝備拖到要換掉的那一格', true); return; }
  if (equipSquadGear(armorWho, slot, id)) { sfx('wearGear'); armorSlotPick = null; backpackSel = SQ_WORN_PREFIX + slot; }
  else sfx('error');
  renderBackpack();
}
function handleSquadArmorClick(e) {
  if (!campArmorOpen) return false;
  const who = e.target.closest('[data-armor-who]');
  if (who) { if (who.dataset.armorWho !== armorWho) { armorWho = who.dataset.armorWho; backpackSel = null; armorSlotPick = null; sfx('switch'); renderBackpack(); } return true; }
  if (!armorForMember()) return false;
  const slot = e.target.closest('#equipPanel [data-sq-slot]');
  if (slot) {
    const i = Number(slot.dataset.sqSlot);
    if (squadGearOf(armorWho)[i]) { backpackSel = SQ_WORN_PREFIX + i; armorSlotPick = null; }
    else { armorSlotPick = i; const first = squadArmorItems().find(g => squadGearWornAt(armorWho, g.sgear.id, -1) < 0); backpackSel = first ? first.id : null; if (!first) systemNotice('背包裡沒有可以穿的隊員裝備，可以找諾亞的開發工坊製作'); }
    sfx('blip'); renderBackpack(); return true;
  }
  const wear = e.target.closest('[data-sq-wear]');
  if (wear) { wearSquadArmor(wear.dataset.sqWear); return true; }
  const off = e.target.closest('[data-sq-off]');
  if (off) { if (unequipSquadGear(armorWho, Number(off.dataset.sqOff))) { sfx('switch'); backpackSel = null; } else sfx('error'); renderBackpack(); return true; }
  return false;
}
// 從 T-Pad 隊員頁（V2 的「更換裝備」）打開防具視窗，直接選好這位隊員。
// 跟隊員裝備原本的規則一樣：基地、營地帳篷旁、裝備箱旁才能換；不行就回傳 false（T-Pad 跳提示）
function openArmorPanelFor(type) {
  if (!G?.player || G.over || !(MAP_SAFE || bagAtCampTent() || armorChestNearPlayer())) return false;
  const solo = typeof squadPageState !== 'undefined' ? squadPageState.solo : null;
  if (typeof closeTPad === 'function') closeTPad(true);
  closeBackpack(true);
  campArmorOpen = true; backpackTab = GEAR_TAB.id; backpackSel = null; armorWho = type; armorSlotPick = null;
  armorRemote = { member: type, solo };
  openBackpack({ camp: true });
  if (!backpackOpen) { campArmorOpen = false; armorRemote = null; backpackTab = 'consumable'; return false; }
  return true;
}
