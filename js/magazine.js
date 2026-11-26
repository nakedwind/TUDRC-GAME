/* ===== 彈匣：出勤前選這次帶哪幾種特殊子彈（設定在 data/equipment.js 的 MAGAZINE、BULLETS）=====
   ・背包「武器」分頁：手槍右邊是彈匣格，把下面的子彈拖上去就換（js/backpack.js；隨時都能換）。只有一般子彈不佔格子；照明彈需裝進彈匣。
   ・戰鬥中滾輪只會換到彈匣裡的子彈（js/flare.js 的 weaponUsable）。
   ・特殊子彈打完（0 發）就從彈匣拿掉、空出那一格；之後又補到這種子彈，彈匣有空格就自動裝回去（magSyncEmpty）。
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
  if (magIsFree(id) || window.TEST_MODE || window.PREVIEW_UNLOCK) return true;   // 測試模式：拿到的子彈全部都能用滾輪換，不用裝進彈匣
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
// 子彈打完（0 發）：從彈匣拿掉、空出那一格（記在 emptied：因為打完才拿掉的）；之後又補到這種子彈（彈藥箱、撿到、買到），
// 彈匣有空格就自動裝回去，滿了就不裝（要自己到背包拖進彈匣）。notify＝要不要跳提示（讀檔時整理舊存檔不跳）。回傳有沒有改到
function magSyncEmpty(notify) {
  if (typeof equipState === 'undefined' || !equipState || typeof BULLETS === 'undefined') return false;
  const m = magState(), n = magSlotCount(), out = [], back = [];
  if (!Array.isArray(m.emptied)) m.emptied = [];
  m.load = m.load.map(id => {
    if (!id || !BULLETS[id] || magIsFree(id) || bulletCount(id) > 0) return id;
    if (!m.emptied.includes(id)) m.emptied.push(id);
    out.push(BULLETS[id].name); return null;
  });
  m.emptied = m.emptied.filter(id => {
    if (!BULLETS[id] || BULLETS[id].removed || !bulletOwned(id)) return false;
    if (bulletCount(id) <= 0) return true;   // 還是空的：繼續等
    if (m.load.slice(0, n).includes(id)) return false;   // 自己已經裝回去了
    const i = Array.from({ length: n }, (_, k) => k).find(k => !m.load[k]);
    if (i == null) return false;   // 彈匣滿了：不自動裝，要自己到背包拖
    m.load[i] = id; back.push(BULLETS[id].name); return false;
  });
  if (notify && typeof systemNotice === 'function') {
    if (out.length) systemNotice(out.join('、') + '打完了，從彈匣拿掉');
    if (back.length) systemNotice('🔫 ' + back.join('、') + '補到了，自動裝回彈匣');
  }
  return out.length > 0 || back.length > 0;
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
// ---- 開發工坊「補充彈藥」頁：跟商店一樣，商品卡按「加入一組」放進購物車，右邊結帳（一發的價錢：js/workshop-config.js 的 bulletPrice；只能在後室找到的不賣）----
// 畫面：js/workshop-config.js 的 workshopAmmoShopHtml（開發工坊編輯器的預覽也用它）
const wsAmmoCart = {};   // 購物車：子彈 id → 幾發（關掉工坊也記著，結帳才扣錢、放進彈藥包）
// 這種子彈還放得下幾發：購物車裡別種子彈會多佔掉的格子先扣掉（跟商店的 shopRoom 一樣）
function wsAmmoRoom(id) {
  let extra = 0;
  for (const [b, n] of Object.entries(wsAmmoCart)) if (n > 0 && b !== id && BULLETS[b]) extra += bulletStacks(b, bulletCount(b) + n) - (bulletOwned(b) ? bulletStacks(b) : 0);
  return Math.max(0, bulletRoom(id, extra));
}
function ammoShopEntries() {
  return Object.entries(BULLETS).filter(([id, b]) => bulletBuyable(id, b)).map(([id, b]) => {
    const room = wsAmmoRoom(id), price = bulletPrice(id);
    return { key: 'b:' + id, kind: 'ammo', bullet: id, def: b, name: b.name, lv: 0, max: 0, icon: wsAmmoIcon(bulletIcon(b, 'ws-bullet-img'), b), image: b.image, emoji: b.icon,
      tag: '子彈', worn: false, about: b.desc || '', price, have: bulletCount(id), room, set: b.max, n: Math.min(wsAmmoCart[id] || 0, room) };
  });
}
// 給 workshopAmmoShopHtml 的商品清單
const wsAmmoShopItems = list => list.map(e => ({ id: e.bullet, name: e.name, image: e.image, price: e.price, have: e.have, room: e.room, set: e.set, n: e.n, desc: e.about }));
const wsAmmoCartTotal = () => Object.entries(wsAmmoCart).reduce((sum, [id, n]) => sum + (BULLETS[id] ? bulletPrice(id) * n : 0), 0);
// 購物車裡這種改成 n 發（不超過放得下的、錢買得起的）
function wsAmmoCartSet(id, n) {
  const b = BULLETS[id]; if (!bulletBuyable(id, b)) return;
  const price = bulletPrice(id), others = wsAmmoCartTotal() - price * (wsAmmoCart[id] || 0);
  const afford = price > 0 ? Math.floor((Math.floor(G.money || 0) - others) / price) : Infinity;
  n = Math.max(0, Math.min(wsAmmoRoom(id), afford, Math.round(Number(n)) || 0));
  if (n) wsAmmoCart[id] = n; else delete wsAmmoCart[id];
}
// 商品卡的「加入一組」
function wsAmmoCartAdd(id) {
  const e = ammoShopEntries().find(x => x.bullet === id); if (!e) return false;
  const add = workshopAmmoAddCount(e, Math.floor(G.money || 0) - wsAmmoCartTotal());
  if (add <= 0) { sfx('error'); showWorkshopToast(e.room - e.n <= 0 ? '彈藥包滿了，先到「升級裝備」擴充彈藥包' : '經費不夠', true); return false; }
  wsAmmoCart[id] = (wsAmmoCart[id] || 0) + add; sfx('button');
  return true;
}
// 結帳：一次扣錢、全部放進彈藥包
function wsAmmoCheckout() {
  const list = ammoShopEntries().filter(e => (wsAmmoCart[e.bullet] || 0) > 0);
  if (!list.length) { sfx('error'); return; }
  if (list.some(e => wsAmmoCart[e.bullet] > e.room)) { sfx('error'); showWorkshopToast('彈藥包格子不夠，請調整購物車數量', true); return; }
  const total = list.reduce((sum, e) => sum + e.price * wsAmmoCart[e.bullet], 0), count = list.reduce((sum, e) => sum + wsAmmoCart[e.bullet], 0);
  if (!spendWorkshop(0, total)) return;   // 只花經費（js/equipment.js）
  for (const e of list) { addBullets(e.bullet, wsAmmoCart[e.bullet]); delete wsAmmoCart[e.bullet]; }
  SFX.play('shopCheckout', .7, 'ws-ammo-buy');   // 結帳聲（跟商店一樣）
  showWorkshopToast('🔫 結帳 $' + total + '，補充了 ' + count + ' 發子彈，到背包的彈藥包分頁裝進彈匣');
}
function magazineWorkshopBuy(kind, id) {
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
magSyncEmpty(false);   // 舊存檔：彈匣裡已經打完（0 發）的子彈先拿掉
