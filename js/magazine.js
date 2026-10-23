/* ===== 彈匣：出勤前選這次帶哪幾種特殊子彈（設定在 data/equipment.js 的 MAGAZINE、BULLETS）=====
   ・背包「武器」分頁：手槍右邊是彈匣格，把下面的子彈拖上去就換（js/backpack.js；隨時都能換）。只有一般子彈不佔格子；照明彈需裝進彈匣。
   ・戰鬥中滾輪只會換到彈匣裡的子彈（js/flare.js 的 weaponUsable）。
   ・彈匣一開始 2 格，開發工坊可以升級（最多 5 格）；開發工坊也能開發 source: 'develop' 的子彈。
   ・出勤時（基地 → 戰鬥）：開發的子彈（develop）自動補滿；後室撿的（field）打完就沒了。
   ・存在 equipState.magazine（跟裝備一起存，js/equipment.js 的 saveEquipment）：{ lv: 彈匣等級, load: [子彈 id…] }
   必須在 js/equipment.js、js/flare.js 之後載入。
*/
function magState() {
  const m = equipState.magazine || (equipState.magazine = { lv: 1, load: [] });
  m.lv = Math.max(1, Math.min(MAGAZINE.slots.length, m.lv | 0 || 1));
  if (!Array.isArray(m.load)) m.load = [];
  return m;
}
const magSlotCount = () => MAGAZINE.slots[magState().lv - 1];
const magIsFree = id => MAGAZINE.free.includes(id);
// 這種子彈這次有沒有帶著（滾輪換得到）
function magazineCarries(id) {
  if (magIsFree(id)) return true;
  const m = magState();
  return m.load.slice(0, magSlotCount()).includes(id);
}
// 可以裝進彈匣的子彈：拿到過、不是免費的、沒被拿掉的
const magCandidates = () => Object.keys(BULLETS).filter(id => !magIsFree(id) && !BULLETS[id].removed && bulletOwned(id));
function setMagSlot(i, id) {
  const m = magState(), load = Array.from({ length: magSlotCount() }, (_, k) => m.load[k] || null);
  if (id) { const j = load.indexOf(id); if (j >= 0 && j !== i) load[j] = load[i]; }   // 已經在別格：兩格對調
  load[i] = id || null;
  m.load = load; saveEquipment();
}
const bulletSourceTag = b => b.source === 'develop' ? '開發' : b.source === 'field' ? '後室' : b.source === 'supply' ? '補給' : '';

// ---- 出勤（基地 → 戰鬥，js/sortie-supply.js 的 onSortieNewGame 呼叫）：開發的子彈補滿 ----
function onMagazineSortie() {
  const m = magState(), filled = [];
  for (const id of m.load.slice(0, magSlotCount())) {
    const b = id && BULLETS[id];
    if (b && b.source === 'develop' && bulletOwned(id) && fillBullets(id) > 0) filled.push(b.icon + b.name);
  }
  if (filled.length) systemNotice('🧰 諾亞幫你補滿了' + filled.join('、'));
  const empty = m.load.slice(0, magSlotCount()).filter(id => id && BULLETS[id] && bulletCount(id) <= 0).map(id => BULLETS[id].name);
  if (empty.length) systemNotice('彈匣裡的' + empty.join('、') + '沒有子彈了', true);
}

// ---- 開發工坊（js/equipment.js 的 workshopEntries、workshopBuy 呼叫）----
// 子彈：可開發的（develop）放「可開發」分頁，開發好了放「可升級」分頁看說明（子彈不會升級）；彈匣：放「可升級」分頁
function magazineWorkshopEntries() {
  const bullets = Object.entries(BULLETS).filter(([id, b]) => b.source === 'develop' && !b.removed).map(([id, b]) => {
    const have = bulletOwned(id);
    return { key: 'b:' + id, kind: 'bullet', def: b, name: b.name, lv: have ? 1 : 0, max: 1, icon: bulletIcon(b, 'ws-bullet-img'), image: b.image, emoji: b.icon,
      tag: '子彈', worn: magazineCarries(id), about: b.desc || '', stat: () => '最多帶 ' + b.max + ' 發・出勤時自動補滿' + (have ? '・到背包的「武器」分頁裝進彈匣' : ''),
      canDev: !have, where: '', devCost: b.cost || 0, upCost: 0, buy: 'bd:' + id };
  });
  const m = magState();
  const mag = { key: 'm:magazine', kind: 'magazine', def: MAGAZINE, name: MAGAZINE.name, lv: m.lv, max: MAGAZINE.slots.length, icon: '<i>' + MAGAZINE.icon + '</i>', image: null, emoji: MAGAZINE.icon,
    tag: '彈匣', worn: false, about: MAGAZINE.desc || '', stat: n => '彈匣 ' + MAGAZINE.slots[n - 1] + ' 格',
    canDev: false, where: '', upCost: MAGAZINE.cost[m.lv - 1] || 0, buy: 'mg:magazine' };
  return { bullets, mag };
}
function magazineWorkshopBuy(kind, id) {
  if (kind === 'bd') {
    const b = BULLETS[id]; if (!b || b.source !== 'develop' || bulletOwned(id)) return false;
    if (!spendCrystals(b.cost || 0)) return true;
    addBullets(id, b.max); SFX.play('achievement', .7, 'equip-up');
    showWorkshopToast('🎁 諾亞開發好了「' + b.name + '」，到背包的武器分頁裝進彈匣');
    return true;
  }
  if (kind === 'mg') {
    const m = magState(); if (m.lv >= MAGAZINE.slots.length) return true;
    if (!spendCrystals(MAGAZINE.cost[m.lv - 1])) return true;
    m.lv++; saveEquipment(); SFX.play('achievement', .7, 'equip-up');
    showWorkshopToast('🔧 彈匣升級：可以裝 ' + magSlotCount() + ' 種子彈');
    return true;
  }
  return false;
}
