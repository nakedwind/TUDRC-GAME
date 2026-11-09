/* ===== 彈匣：出勤前選這次帶哪幾種特殊子彈（設定在 data/equipment.js 的 MAGAZINE、BULLETS）=====
   ・背包「武器」分頁：手槍右邊是彈匣格，把下面的子彈拖上去就換（js/backpack.js；隨時都能換）。只有一般子彈不佔格子；照明彈需裝進彈匣。
   ・戰鬥中滾輪只會換到彈匣裡的子彈（js/flare.js 的 weaponUsable）。
   ・彈匣一開始 2 格，開發工坊可以升級（最多 6 格）；開發工坊也能開發 source: 'develop' 的子彈。
   ・出勤時（基地 → 戰鬥）：照明彈和開發的子彈（develop）在營地的彈藥箱各放一組（js/camp-supply.js），要自己去箱子補；後室撿的（field）打完就沒了。
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
  if (magIsFree(id) || window.TEST_MODE) return true;   // 測試模式：拿到的子彈全部都能用滾輪換，不用裝進彈匣
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

// ---- 出勤（基地 → 戰鬥，js/sortie-supply.js 的 onSortieNewGame 呼叫）：營地的彈藥箱放子彈 ----
function onMagazineSortie() {
  const m = magState(), stocked = typeof stockCampAmmoForSortie === 'function' ? stockCampAmmoForSortie() : [];
  if (stocked.length) systemNotice('🧰 諾亞在營地的彈藥箱放了' + stocked.join('、') + '（各一組）');
  const empty = m.load.slice(0, magSlotCount()).filter(id => id && BULLETS[id] && bulletCount(id) <= 0).map(id => BULLETS[id].name);
  if (empty.length) systemNotice('彈匣裡的' + empty.join('、') + '沒有子彈了' + (stocked.length ? '，到營地的彈藥箱補' : ''), true);
}

// ---- 開發工坊（js/equipment.js 的 workshopEntries、workshopBuy 呼叫）----
// 子彈：可開發的（develop）放「可開發」分頁，開發好了放「可升級」分頁看說明（子彈不會升級）；彈匣：放「可升級」分頁
// 開發工坊格子裡的圖：套用開發工坊編輯器調的大小、位移（js/workshop-config.js）
const wsAmmoIcon = (h, d) => { const st = typeof workshopIconStyle === 'function' ? workshopIconStyle(d) : ''; return st ? h.replace(/^<(img|i)/, '<$1' + st) : h; };
function magazineWorkshopEntries() {
  const bullets = Object.entries(BULLETS).filter(([id, b]) => b.source === 'develop' && !b.removed).map(([id, b]) => {
    const have = bulletOwned(id);
    return { key: 'b:' + id, kind: 'bullet', def: b, name: b.name, lv: have ? 1 : 0, max: 1, icon: wsAmmoIcon(bulletIcon(b, 'ws-bullet-img'), b), image: b.image, emoji: b.icon,
      tag: '子彈', worn: magazineCarries(id), about: b.desc || '', stat: () => '一組 ' + b.max + ' 發（彈藥包一格）・每次出勤在營地的彈藥箱放一組' + (have ? '・到背包的「武器」分頁裝進彈匣' : ''),
      canDev: !have, where: '', devCost: b.cost || 0, upCost: 0, devMoney: wsMoney('b:' + id, 0, b.cost || 0), buy: 'bd:' + id };   // devMoney＝開發要花的經費
  });
  const m = magState();
  const mag = { key: 'm:magazine', kind: 'magazine', def: MAGAZINE, name: MAGAZINE.name, lv: m.lv, max: MAGAZINE.slots.length, icon: wsAmmoIcon(equipIcon(MAGAZINE), MAGAZINE), image: MAGAZINE.image || null, emoji: MAGAZINE.icon,
    tag: '彈匣', worn: false, about: MAGAZINE.desc || '', stat: n => '彈匣 ' + MAGAZINE.slots[n - 1] + ' 格',
    canDev: false, where: '', upCost: MAGAZINE.cost[m.lv - 1] || 0, upMoney: m.lv < MAGAZINE.slots.length ? wsMoney('m:magazine', m.lv - 1, MAGAZINE.cost[m.lv - 1] || 0) : 0, buy: 'mg:magazine' };
  return { bullets, mag };
}
// ---- 開發工坊「彈藥」頁：用經費買子彈（一發的價錢：js/workshop-config.js 的 bulletPrice；只能在後室找到的不賣）----
const wsAmmoQty = {};   // 每種子彈目前選了要買幾發（關掉工坊也記著）
function ammoShopEntries() {
  return Object.entries(BULLETS).filter(([id, b]) => bulletBuyable(id, b)).map(([id, b]) => {
    const room = bulletRoom(id), price = bulletPrice(id);
    if (wsAmmoQty[id] == null) wsAmmoQty[id] = b.max;   // 一開始選一組
    return { key: 'b:' + id, kind: 'ammo', bullet: id, def: b, name: b.name, lv: 0, max: 0, icon: wsAmmoIcon(bulletIcon(b, 'ws-bullet-img'), b), image: b.image, emoji: b.icon,
      tag: '子彈', worn: false, about: b.desc || '', price, have: bulletCount(id), room, set: b.max, buy: 'ab:' + id };
  });
}
function setAmmoQty(id, how) {   // how：'+1'、'-10'、'set'（一組）、'max'（放得下的最多、錢買得起的最多）或直接一個數字
  const b = BULLETS[id]; if (!b) return;
  const room = bulletRoom(id), price = bulletPrice(id), afford = price > 0 ? Math.floor(Math.floor(G.money || 0) / price) : room;
  const cur = wsAmmoQty[id] ?? b.max;
  let n = how === 'set' ? b.max : how === 'max' ? Math.min(room, afford) : typeof how === 'number' ? how : cur + Number(how);
  wsAmmoQty[id] = Math.max(0, Math.min(room, Math.round(n) || 0));
}
function magazineWorkshopBuy(kind, id) {
  if (kind === 'ab') {   // 買子彈
    const b = BULLETS[id]; if (!bulletBuyable(id, b)) return true;
    const n = Math.min(wsAmmoQty[id] || 0, bulletRoom(id)), price = bulletPrice(id);
    if (n <= 0) { sfx('error'); showWorkshopToast(bulletRoom(id) <= 0 ? '彈藥包滿了，先到「升級裝備」擴充彈藥包' : '先選要補充幾發', true); return true; }
    if (!spendWorkshop(0, n * price)) return true;   // 只花經費（js/equipment.js）
    addBullets(id, n); SFX.play('shopCheckout', .7, 'ws-ammo-buy');   // 結帳聲（跟商店一樣）
    showWorkshopToast('🔫 補充了' + b.name + ' ' + n + ' 發（$' + n * price + '），到背包的彈藥包分頁裝進彈匣');
    return true;
  }
  if (kind === 'bd') {
    const b = BULLETS[id]; if (!b || b.source !== 'develop' || bulletOwned(id)) return false;
    if (bagUsedSlots(supplyInventory, 'weapon') >= bagCapacity('weapon')) { systemNotice('彈藥包已滿（' + bagCapacity('weapon') + ' 格），先升級彈藥包擴充', true); return true; }
    if (!spendWorkshop(b.cost || 0, wsMoney('b:' + id, 0, b.cost || 0))) return true;   // 異質碎片＋經費（js/equipment.js）
    addBullets(id, b.max); workshopLevelFx('dev', b.name);   // 升級特效（js/equipment.js）
    showWorkshopToast('🎁 諾亞開發好了「' + b.name + '」，到背包的彈藥包分頁裝進彈匣');
    return true;
  }
  if (kind === 'mg') {
    const m = magState(); if (m.lv >= MAGAZINE.slots.length) return true;
    if (!spendWorkshop(MAGAZINE.cost[m.lv - 1], wsMoney('m:magazine', m.lv - 1, MAGAZINE.cost[m.lv - 1]))) return true;
    m.lv++; saveEquipment(); workshopLevelFx('up', '彈匣　' + (m.lv - 1) + ' → ' + m.lv + ' 級', m.lv >= MAGAZINE.slots.length);
    showWorkshopToast('🔧 彈匣升級：可以裝 ' + magSlotCount() + ' 種子彈');
    return true;
  }
  return false;
}
