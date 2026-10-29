// ============================================================
//  營地物資箱：放醫療包、杏仁水、急救包（溫特也可以拿、可以補；嚮導拿杏仁水和急救包）
//  ・箱子是地圖上放的「物資箱」物件（地圖編輯器的素材 tile_field_supply_box）；同一張地圖放幾個都共用同一份物資。第一次在這張地圖出任務時補滿 start 的數量，
//    之後就一直維持（用掉就少了，中止任務再回來也不會補），要溫特自己放東西進去。
//  ・嚮導身上最多帶 carry 個急救包、carry 瓶杏仁水：杏仁水恢復 SP，疏導花 SP，補血（隊友和自己）花急救包。
//    其中一樣用完就自己走回物資箱拿；沒用完但沒帶滿，手上沒事時也會回去補滿（地上有溫特放的就先撿地上的，js/ground-items.js）；
//    箱子裡也沒有的話，頭上冒思考泡泡顯示缺什麼。
//  ・存檔：localStorage（CAMP_SUPPLY_KEY），依地圖分開存；開始新遊戲會清掉（js/new-game.js）。
// ============================================================
const CAMP_SUPPLY = {
  slots: 20,                                   // 箱子幾格（一格放一個）
  items: ['medkit', 'almond-water', 'firstaid'],             // 能放什麼
  start: { medkit: 7, 'almond-water': 6, firstaid: 7 },      // 第一次出任務時箱子裡有多少
  guideItems: ['firstaid', 'almond-water'],                   // 嚮導身上帶的（醫療包是給溫特自己用的）
  carry: 5,                                    // 嚮導每樣最多帶幾個
  minTaint: 30,                                // 隊員汙染到多少，嚮導才會花 SP 疏導（太少不浪費）
  minHeal: 30,                                 // 隊員少多少血，嚮導才會花一個急救包補血
  sootheMul: 2,                                // 疏導量倍率（原本：艾德林一次清 15）
  box: { id: 'tile_field_supply_box',          // 地圖上的物資箱物件（data/tiles.js）
    art: { full: 'images/field-camp/field-base-01.png?v=20261024', some: 'images/field-camp/field-base-02.png?v=20261024', empty: 'images/field-camp/field-base-03.png?v=20261024' } },   // 10 個以上／1～9 個／空的（?v＝02、03 以前是 440×320 的營地疊圖，避免瀏覽器拿到舊圖）
};
const CAMP_SUPPLY_KEY = 'tudrc_camp_supply_v1';
const SUPPLY_KEY_OF = { medkit: 'medkit', 'almond-water': 'almond' };
let campSupplyData = {};
try { const d = JSON.parse(localStorage.getItem(CAMP_SUPPLY_KEY) || '{}'); if (d && typeof d === 'object') campSupplyData = d; } catch (_) {}
function saveCampSupply() { try { localStorage.setItem(CAMP_SUPPLY_KEY, JSON.stringify(campSupplyData)); } catch (_) {} }
const campSupplyMapId = () => (MAP && (MAP.id || MAP.name)) || 'map';
// 這張地圖的箱子（第一次來就補滿）
function campBox() {
  const id = campSupplyMapId();
  // 舊的新手區庫存也補滿一次；之後消耗、讀檔都維持實際數量。
  if (isNewbieMap() && !campSupplyData[id]?.newbieStockV1) {
    campSupplyData[id] = { ...NEWBIE_START.box, newbieStockV1: true };
    saveCampSupply();
  }
  if (!campSupplyData[id]) { campSupplyData[id] = { ...CAMP_SUPPLY.start }; saveCampSupply(); }
  else if (CAMP_SUPPLY.items.some(k => !(k in campSupplyData[id]))) {   // 舊存檔的箱子沒有後來加的物品（急救包）：補上初始數量
    for (const k of CAMP_SUPPLY.items) if (!(k in campSupplyData[id])) campSupplyData[id][k] = CAMP_SUPPLY.start[k] || 0;
    saveCampSupply();
  }
  return campSupplyData[id];
}
const campBoxTotal = () => CAMP_SUPPLY.items.reduce((sum, k) => sum + (campBox()[k] || 0), 0);

// ---- 物資箱：地圖上放的物資箱物件。圖片跟著箱子裡的數量換：10 個以上 01、1～9 個 02、0 個 03 ----
function supplyBoxSpots() {   // js/camp-interactions.js 的互動點（kind 'supply'）也用這個
  if (MAP_SAFE || !MAP) return [];
  const spots = [];
  for (const s of MAP.stamps || []) {
    if (s.id !== CAMP_SUPPLY.box.id) continue;
    const t = mapTileById(s.id); if (!t) continue;
    const x0 = OX + s.c * CELL + (s.ox || 0), y0 = OY + s.r * CELL + (s.oy || 0), w = mapStampW(s, t) * CELL, h = mapStampH(s, t) * CELL;
    spots.push({ kind: 'supply', stamp: s, x: x0 + w / 2, y: y0 + h, top: y0, left: x0, right: x0 + w, bottom: y0 + h });
  }
  return spots;
}
// 畫地圖物件時換圖（js/maploader.js 會問這裡）
function supplyBoxTile(s) {
  if (s.id !== CAMP_SUPPLY.box.id || MAP_SAFE) return null;
  const total = campBoxTotal(), k = total >= 10 ? 'full' : total > 0 ? 'some' : 'empty';
  return { ...mapTileById(s.id), id: '__supply-box-' + k, file: CAMP_SUPPLY.box.art[k] };
}
// 嚮導回來拿東西的箱子（有好幾個就拿第一個）
function campSupplySpot() { return supplyBoxSpots()[0] || null; }

// ---- 嚮導身上的補給 ----
function guideKit(t) {
  if (!t.kit) {   // 這次出勤剛開始：從箱子拿（人就在營地）
    if (isNewbieMap() && t.type === 'eldrin') {
      t.kit = { ...NEWBIE_START.guideKit };   // 自帶補給，不扣箱內的 6／7／7。
      return t.kit;
    }
    t.kit = { firstaid: 0, 'almond-water': 0 };
    if (!MAP_SAFE && campSupplySpot()) refillGuideKit(t, true);
  }
  return t.kit;
}
function refillGuideKit(t, silent) {
  const box = campBox(), got = [];
  for (const k of CAMP_SUPPLY.guideItems) {
    const n = Math.min(guideCarryTarget(t, k) - (t.kit[k] || 0), box[k] || 0);
    if (n > 0) { t.kit[k] += n; box[k] -= n; got.push(itemById(k).name + '×' + n); }
  }
  if (got.length) { saveCampSupply(); if (!silent && typeof sentryStatus === 'function') sentryStatus(t, '拿了 ' + got.join('、'), '#9ff0c0'); }
  if (campSupplyOpen) renderCampSupply();
  return got.length > 0;
}
// 杏仁水用來恢復 SP；沒有水時，只要 SP 足夠仍能疏導。
const guideCanSoothe = t => guideSPPractice() || guideSP(t) >= guideSPCost(t);
const guideCanHeal = t => !MAP_SAFE ? (guideKit(t).firstaid || 0) > 0 : true;
function guideUse(t, k) { if (MAP_SAFE) return; const kit = guideKit(t); kit[k] = Math.max(0, (kit[k] || 0) - 1); }
// 缺什麼（身上用完的）
const guideMissing = t => CAMP_SUPPLY.guideItems.filter(k => (guideKit(t)[k] || 0) <= 0);
// 沒帶滿的（還有，但不到 carry 個）
// 新手區艾德林維持每樣三個，避免開場立即把箱內補給拿走。
const guideCarryTarget = (t, k) => isNewbieMap() && t.type === 'eldrin' ? NEWBIE_START.guideKit[k] : CAMP_SUPPLY.carry;
const guideShort = t => CAMP_SUPPLY.guideItems.filter(k => (guideKit(t)[k] || 0) < guideCarryTarget(t, k));
// 手上沒事：沒有隊員需要疏導或補血（門檻跟 js/sentry.js 的照顧對象一樣）
const guideIdle = t => !G.towers.some(o => o !== t && o.hp > 0 && !TYPES[o.type].guide &&
  (o.berserk || (o.taint || 0) >= CAMP_SUPPLY.minTaint || o.maxhp - o.hp >= CAMP_SUPPLY.minHeal));
// 現在要去補的：用完的馬上補；都還有的話，沒帶滿的在手上沒事時（或已經在去拿的路上）補滿
// 地上的（js/ground-items.js）和物資箱都看這個，地上有就先撿地上的
function guideWants(t) {
  const missing = guideMissing(t);
  return missing.length ? missing : (t.supplyTrip || t.groundTrip || guideIdle(t)) ? guideShort(t) : [];
}

// ---- 嚮導自己回箱子拿（js/sentry.js 呼叫；回傳 true＝這一幀在走去拿，不做別的）----
function guideSupplyStep(t, dt) {
  if (MAP_SAFE || t.berserk || t.hp <= 0 || t.mode === 'goto') { t.supplyTrip = null; return false; }
  if (typeof guideGroundStep === 'function' && guideGroundStep(t, dt)) { t.supplyTrip = null; return true; }   // 地上有溫特放的急救包、杏仁水：先去撿（js/ground-items.js）
  const box = campBox(), canGet = guideWants(t).filter(k => (box[k] || 0) > 0);
  if (!canGet.length) { t.supplyTrip = null; return false; }
  const spot = campSupplySpot(); if (!spot) { t.supplyTrip = null; return false; }
  if (!t.supplyTrip) {
    if ((t.supplyRetryT = (t.supplyRetryT || 0) - dt) > 0) return false;   // 剛剛找不到路：等一下再找（找路很花時間，不要每幀都找）
    t.supplyTrip = { goal: campSupplyStand(t, spot) };
    if (!t.supplyTrip.goal) { t.supplyTrip = null; t.supplyRetryT = 1.5; return false; }
    if (typeof sentryStatus === 'function') sentryStatus(t, '回營地拿' + canGet.map(k => itemById(k).name).join('、'), '#8fd3ff');
  }
  const g = t.supplyTrip.goal, speed = (TYPES[t.type].walkSpeed || 80) * 1.3;
  if (Math.hypot(t.x - spot.x, t.y - spot.y) < CELL * 1.6 || moveSentryWithPath(t, g.x, g.y, speed, dt)) {
    refillGuideKit(t); t.supplyTrip = null; t.target = null; t.navPath = null; t.waitT = .4;
    return true;
  }
  if (t.navFailed) { t.supplyTrip = null; t.navFailed = false; }
  t.target = null;
  return true;
}
// 箱子前面能站的位置
function campSupplyStand(t, spot) {
  const [sc, sr] = cellAt(spot.x, spot.y);
  let best = null, bd = Infinity;
  for (let dr = -1; dr <= 3; dr++) for (let dc = -2; dc <= 2; dc++) {
    const c = sc + dc, r = sr + dr;
    if (!inGrid(c, r) || !sentryCellWalkable(c, r)) continue;
    const [x, y] = center(c, r), d = Math.hypot(x - spot.x, y - spot.y);
    if (d < bd && buildSentryPath(t, x, y)) { bd = d; best = { x, y }; }
  }
  return best;
}

// ---- 頭上的思考泡泡：身上用完、箱子也沒有（或正在走回去拿）時顯示缺的東西 ----
const supplyIconImgs = {};
function supplyIcon(k) {
  if (!supplyIconImgs[k]) { const img = new Image(); img.src = itemById(k).image; supplyIconImgs[k] = img; }
  return supplyIconImgs[k];
}
function drawGuideSupplyBubbles(ctx) {
  if (MAP_SAFE || !G || !G.towers) return;
  for (const t of G.towers) {
    if (!TYPES[t.type].guide || t.hp <= 0 || t.berserk || !t.kit) continue;
    const missing = guideMissing(t); if (!missing.length) continue;
    const bob = Math.sin(performance.now() / 400 + t.x * .01) * 2;
    const w = 14 + missing.length * 22, h = 26, x = Math.round(t.x + 6);
    let top = t.y - 92;
    if (t.bubbleAt && performance.now() - t.bubbleAt < 120) top = Math.min(top, t.bubbleTop - h - 16);   // 頭上正在說話：排到對話泡泡上面
    const y = Math.round(top + bob);
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,.95)'; ctx.strokeStyle = 'rgba(40,48,60,.85)'; ctx.lineWidth = 1.5;
    roundRect(x, y, w, h, 12); ctx.fill(); ctx.stroke();
    for (const [dx, dy, r] of [[4, h + 5, 4], [-1, h + 12, 2.5]]) { ctx.beginPath(); ctx.arc(x + dx, y + dy, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }   // 思考泡泡的小圓點
    ctx.imageSmoothingEnabled = false;
    missing.forEach((k, i) => {
      const img = supplyIcon(k), ix = x + 8 + i * 22, iy = y + 3;
      if (img.complete && img.naturalWidth) ctx.drawImage(img, ix, iy, 20, 20);
      if ((campBox()[k] || 0) <= 0) { ctx.strokeStyle = '#e04848'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ix + 2, iy + 18); ctx.lineTo(ix + 18, iy + 2); ctx.stroke(); }   // 箱子也沒了：紅色斜線
    });
    ctx.restore();
  }
}

// ============================================================
//  營地彈藥箱：地圖上的「彈藥箱（打開）」（js/flare.js 的 AMMO_REFILL）。按 Space 打開，可以補子彈、把子彈放進去
//  ・一樣依地圖分開存（CAMP_AMMO_KEY）；開始新遊戲會清掉（js/new-game.js）
//  ・每次出勤（js/magazine.js 的 onMagazineSortie）：AMMO_BOX.sortie 裡拿到過（照明彈一開始就有、其他要開發）的子彈，
//    箱子裡各補到至少一組（BULLET_SET 發）；自己放進去多的會留著，不會越積越多
// ============================================================
const AMMO_BOX = { sortie: ['flare', 'tranq', 'paint', 'split', 'knock'], image: 'images/field-camp/ammo-crate-open.png' };
const CAMP_AMMO_KEY = 'tudrc_camp_ammo_v1';
let campAmmoData = {};
try { const d = JSON.parse(localStorage.getItem(CAMP_AMMO_KEY) || '{}'); if (d && typeof d === 'object') campAmmoData = d; } catch (_) {}
function saveCampAmmo() { try { localStorage.setItem(CAMP_AMMO_KEY, JSON.stringify(campAmmoData)); } catch (_) {} }
function campAmmo() { const id = campSupplyMapId(); return campAmmoData[id] || (campAmmoData[id] = {}); }
// 這張地圖有沒有彈藥箱
const mapHasAmmoBox = () => !!MAP && (MAP.stamps || []).some(s => { const t = mapTileById(s.id); return AMMO_REFILL.ids.includes(s.id) || (t && AMMO_REFILL.file.test(String(t.file || ''))); });
// 出勤：箱子裡每種補到一組；回傳補了哪些
function stockCampAmmoForSortie() {
  if (MAP_SAFE || !mapHasAmmoBox()) return [];
  const box = campAmmo(), got = [];
  for (const id of AMMO_BOX.sortie) {
    const b = BULLETS[id]; if (!b || b.removed || !bulletOwned(id)) continue;
    if ((box[id] || 0) < BULLET_SET) { box[id] = BULLET_SET; got.push(b.icon + b.name); }
  }
  saveCampAmmo();
  return got;
}

// ============================================================
//  箱子視窗（物資箱、彈藥箱共用）：外觀跟背包一樣。左邊箱子、右邊溫特的背包，點格子就搬到另一邊，也可以拖過去；
//  下方說明列可以選數量再按「拿到背包」「放進箱子」。兩種箱子的差別寫在 CAMP_BOXES。
// ============================================================
const ammoIdsOf = () => WEAPONS.map(w => w.id).filter(id => id !== 'pistol' && BULLETS[id] && !BULLETS[id].removed);
const CAMP_BOXES = {
  supply: {
    title: '營地物資箱', sub: '嚮導的急救包、杏仁水用完會自己回來拿', icon: () => CAMP_SUPPLY.box.art.full, bagName: '溫特的背包', unit: '個',
    ids: () => CAMP_SUPPLY.items,
    box: k => campBox()[k] || 0, bag: k => supplyInventory.get(k) || 0, bagMax: () => 0,
    boxRoom: () => CAMP_SUPPLY.slots - campBoxTotal(), boxCount: () => campBoxTotal() + ' / ' + CAMP_SUPPLY.slots + ' 個',
    name: k => itemById(k).name, image: k => itemById(k).image, desc: k => typeof itemDesc === 'function' ? itemDesc(itemById(k)) : '',
    clickTake: () => 1, clickPut: () => 1,
    take(k, n) { const box = campBox(); n = Math.min(n, box[k] || 0); const got = n > 0 ? supplyGain(k, n) : 0; box[k] -= got; return got; },   // 溫特拿不下（背包滿了）：留在箱子裡
    put(k, n) { const box = campBox(), bag = supplyInventory.get(k) || 0; n = Math.min(n, bag, CAMP_SUPPLY.slots - campBoxTotal()); if (n <= 0) return 0;
      if (bag - n <= 0) supplyInventory.delete(k); else supplyInventory.set(k, bag - n); box[k] = (box[k] || 0) + n; return n; },
    save: () => saveCampSupply(),
    footer: () => { const guides = (G.towers || []).filter(t => TYPES[t.type].guide && t.kit);
      return guides.map(t => TYPES[t.type].name + '身上：急救包 ' + (t.kit.firstaid || 0) + '・杏仁水 ' + (t.kit['almond-water'] || 0)).join('　'); },
  },
  ammo: {
    title: '營地彈藥箱', sub: '每次出勤，照明彈和開發好的子彈會各放一組（' + BULLET_SET + ' 發）進來', icon: () => AMMO_BOX.image, bagName: '溫特的彈藥包', unit: '發',
    ids: ammoIdsOf,
    box: id => campAmmo()[id] || 0, bag: id => bulletOwned(id) ? bulletCount(id) : 0, bagMax: id => BULLETS[id].max,
    boxRoom: () => Infinity, boxCount: () => '',
    name: id => BULLETS[id].name, image: id => BULLETS[id].image, desc: id => BULLETS[id].desc || '',
    clickTake: id => BULLETS[id].max - bulletCount(id), clickPut: id => bulletCount(id),   // 點一下：補滿／全部放回去
    take(id, n) { const box = campAmmo(); n = Math.min(n, box[id] || 0, BULLETS[id].max - bulletCount(id)); const got = n > 0 ? addBullets(id, n) : 0; box[id] -= got; return got; },   // 彈藥包滿了（新的一種放不下）：加不進去
    put(id, n) { n = Math.min(n, bulletOwned(id) ? bulletCount(id) : 0); if (n <= 0) return 0; bulletState().n[id] -= n; bulletSave(); const box = campAmmo(); box[id] = (box[id] || 0) + n; return n; },
    save: () => saveCampAmmo(),
    fillAll: true,
  },
};
const campBoxDef = () => CAMP_BOXES[campSupplyMode] || CAMP_BOXES.supply;
let campBoxSel = null, campBoxQty = 1, campBoxQtyKey = '', campBoxPop = false;   // campBoxPop：剛打開，視窗彈出來的動畫只播這一次（之後點格子重畫不再播）   // 選中的：{ side: 'box' | 'bag', id }；說明列的數量

let campSupplyOpen = false, campSupplyEl = null, campSupplyMode = 'supply';   // mode：supply＝物資箱、ammo＝彈藥箱（共用同一個視窗）
function openCampSupply(mode = 'supply') {
  if (campSupplyOpen || !G || G.over) return;
  campSupplyMode = mode; campBoxSel = null; campBoxPop = true;
  if (!campSupplyEl) {
    campSupplyEl = document.createElement('div'); campSupplyEl.id = 'campSupply'; campSupplyEl.className = 'hidden';
    campSupplyEl.addEventListener('click', e => {
      if (e.target === campSupplyEl || e.target.closest('.camp-supply-close')) { closeCampSupply(); return; }
      const cell = e.target.closest('[data-cb-cell]');
      if (cell) { const [side, id] = cell.dataset.cbCell.split(':'); campBoxClickCell(side, id); return; }
      const q = e.target.closest('[data-cb-qty]'); if (q) { campBoxQty += +q.dataset.cbQty; renderCampSupply(); return; }
      const mv = e.target.closest('[data-cb-move]'); if (mv && campBoxSel) { campBoxMove(campBoxSel.id, mv.dataset.cbMove, campBoxQty); return; }
      if (e.target.closest('[data-cb-fillall]')) campBoxFillAll();
    });
    // 拖曳：箱子的格子拖到背包那邊＝拿；背包的格子拖到箱子那邊＝放
    campSupplyEl.addEventListener('dragstart', e => { const cell = e.target.closest && e.target.closest('[data-cb-cell]'); if (!cell) return; e.dataTransfer.setData('text/x-camp-box', cell.dataset.cbCell); e.dataTransfer.effectAllowed = 'move'; });
    campSupplyEl.addEventListener('dragover', e => { const side = e.target.closest && e.target.closest('[data-cb-side]'); if (!side || ![...e.dataTransfer.types].includes('text/x-camp-box')) return; e.preventDefault(); side.classList.add('drop-over'); });
    campSupplyEl.addEventListener('dragleave', e => { const side = e.target.closest && e.target.closest('[data-cb-side]'); if (side && !side.contains(e.relatedTarget)) side.classList.remove('drop-over'); });
    campSupplyEl.addEventListener('drop', e => {
      const side = e.target.closest && e.target.closest('[data-cb-side]'); if (!side) return;
      e.preventDefault(); side.classList.remove('drop-over');
      const [from, id] = (e.dataTransfer.getData('text/x-camp-box') || '').split(':');
      if (id && from !== side.dataset.cbSide) campBoxDragCell(from, id);
    });
    (document.getElementById('wrap') || document.body).appendChild(campSupplyEl);
  }
  campSupplyOpen = true; aimHeld = false; Object.keys(keys).forEach(k => { keys[k] = false; });
  renderCampSupply(); campSupplyEl.classList.remove('hidden'); sfx('menu');
  setTimeout(() => campSupplyEl.querySelector('.camp-supply-close')?.focus(), 0);
}
function closeCampSupply() { if (!campSupplyOpen) return; campSupplyOpen = false; campSupplyEl.classList.add('hidden'); sfx('switch'); }
// 點格子：選它，並搬到另一邊（物資一次 1 個；子彈：箱子→補滿、背包→全部放回去）
function campBoxClickCell(side, id) {
  const B = campBoxDef();
  campBoxSel = { side: side === 'box' ? 'bag' : 'box', id };   // 搬過去之後，選取跟著到另一邊
  campBoxMove(id, side === 'box' ? 'take' : 'put', side === 'box' ? B.clickTake(id) : B.clickPut(id));
}
// 拖過去：物資箱一次搬一整格（最多 20 個，跟背包「同種物品每 20 個佔一格」一樣）；彈藥箱跟點一下一樣（補滿／全部放回去）
const CAMP_DRAG_STACK = 20;
function campBoxDragCell(side, id) {
  const B = campBoxDef();
  if (campSupplyMode === 'ammo') { campBoxClickCell(side, id); return; }
  campBoxSel = { side: side === 'box' ? 'bag' : 'box', id };
  campBoxMove(id, side === 'box' ? 'take' : 'put', Math.min(CAMP_DRAG_STACK, side === 'box' ? B.box(id) : B.bag(id)));
}
// dir：take＝從箱子拿到背包、put＝從背包放進箱子
function campBoxMove(id, dir, n, quiet) {
  const from = dir === 'take' ? 'box' : 'bag', start = campBoxFlyStart(from, id);   // 搬之前先記下格子在哪（動畫從這裡飛出去）
  const B = campBoxDef(), got = n > 0 ? B[dir](id, n) : 0;
  if (quiet) return got;
  if (got > 0) {
    B.save(); sfx(campSupplyMode === 'ammo' && dir === 'take' ? 'ammoRefill' : 'button');
    updateHUD(); if (typeof saveGame === 'function') saveGame();
  } else {
    sfx('error');
    if (dir === 'put' && B.boxRoom() <= 0) systemNotice('箱子滿了（' + CAMP_SUPPLY.slots + ' 個）', true);
  }
  renderCampSupply();
  if (got > 0) campBoxFly(start, from === 'box' ? 'bag' : 'box', id, got);
  return got;
}
function campBoxFillAll() {
  const B = campBoxDef(), flies = []; let n = 0;
  for (const id of B.ids()) if (B.box(id) > 0) {
    const start = campBoxFlyStart('box', id), got = campBoxMove(id, 'take', B.clickTake(id), true);
    if (got > 0) { n += got; flies.push([start, id, got]); }
  }
  if (n > 0) { B.save(); sfx('ammoRefill'); updateHUD(); if (typeof saveGame === 'function') saveGame(); } else sfx('error');
  renderCampSupply();
  flies.forEach(([start, id, got], i) => setTimeout(() => campBoxFly(start, 'bag', id, got, i > 0), i * 70));   // 一個接一個飛過去；音效只在第一個落地時播一次
}
// ---- 搬東西的動畫：物品從原本那格沿著弧線飛到另一邊的格子，落地時那格彈一下、冒出「+幾個」 ----
// 位置都換算成 #campSupply 裡的座標（遊戲畫面可能有縮放，用 getBoundingClientRect 跟實際寬度的比例換回來）
function campBoxLocal(rect) {
  const o = campSupplyEl.getBoundingClientRect(), k = o.width / (campSupplyEl.offsetWidth || o.width) || 1;
  return { x: (rect.left - o.left) / k, y: (rect.top - o.top) / k, w: rect.width / k, h: rect.height / k };
}
function campBoxFlyStart(side, id) {
  const cell = campSupplyEl && campSupplyEl.querySelector('[data-cb-cell="' + side + ':' + id + '"]');
  const img = cell && cell.querySelector('img');
  return img ? campBoxLocal(img.getBoundingClientRect()) : null;
}
let campBoxLandAt = 0;   // 上次播落地音效的時間：連續點很快時只播一次
function campBoxFly(start, toSide, id, n, silent) {
  if (!start || !campSupplyOpen) return;
  const cell = campSupplyEl.querySelector('[data-cb-cell="' + toSide + ':' + id + '"]'); if (!cell) return;
  const img = cell.querySelector('img'), end = campBoxLocal((img || cell).getBoundingClientRect());
  const fly = document.createElement('div'); fly.className = 'cb-fly';
  fly.innerHTML = '<img src="' + campBoxDef().image(id) + '" alt="">' + (n > 1 ? '<b>' + n + '</b>' : '');
  fly.style.width = start.w + 'px'; fly.style.height = start.h + 'px';
  campSupplyEl.appendChild(fly);
  const sx = end.w / start.w, sy = end.h / start.h, dx = end.x - start.x, dy = end.y - start.y;
  const at = (k, lift, s) => 'translate(' + (start.x + dx * k) + 'px,' + (start.y + dy * k - lift) + 'px) scale(' + s + ')';
  const anim = fly.animate([
    { transform: at(0, 0, 1), opacity: .6 },   // 飛行中半透明
    { transform: at(.5, 46, 1.18 * (1 + sx) / 2), opacity: .6, offset: .45 },   // 往上拋：弧線的最高點
    { transform: at(1, 0, Math.min(sx, sy)), opacity: .45 },
  ], { duration: 420, easing: 'cubic-bezier(.35,.1,.3,1)' });
  anim.onfinish = () => {
    fly.remove();
    cell.classList.remove('cb-land'); void cell.offsetWidth; cell.classList.add('cb-land');   // 落地：那格彈一下
    const now = performance.now();
    if (!silent && now - campBoxLandAt > 250) { campBoxLandAt = now; sfx('boxLand'); }
    const tip = document.createElement('span'); tip.className = 'cb-plus'; tip.textContent = '+' + n;
    tip.style.left = (end.x + end.w / 2) + 'px'; tip.style.top = end.y + 'px';
    campSupplyEl.appendChild(tip); setTimeout(() => tip.remove(), 700);
  };
}
function renderCampSupply() {
  if (!campSupplyEl) return;
  const B = campBoxDef(), ids = B.ids();
  const boxIds = ids.filter(id => B.box(id) > 0), bagIds = ids.filter(id => B.bag(id) > 0);
  if (campBoxSel && !(campBoxSel.side === 'box' ? boxIds : bagIds).includes(campBoxSel.id)) {   // 選的那格搬空了：看另一邊還有沒有
    const other = campBoxSel.side === 'box' ? bagIds : boxIds;
    campBoxSel = other.includes(campBoxSel.id) ? { side: campBoxSel.side === 'box' ? 'bag' : 'box', id: campBoxSel.id } : null;
  }
  if (!campBoxSel) campBoxSel = boxIds[0] ? { side: 'box', id: boxIds[0] } : bagIds[0] ? { side: 'bag', id: bagIds[0] } : null;
  const cell = (side, id) => {
    const n = side === 'box' ? B.box(id) : B.bag(id), max = side === 'bag' ? B.bagMax(id) : 0, sel = campBoxSel && campBoxSel.side === side && campBoxSel.id === id;
    return '<button type="button" class="bag-cell' + (campSupplyMode === 'ammo' ? ' bullet' : '') + (sel ? ' sel' : '') + '" data-cb-cell="' + side + ':' + id + '" draggable="true"' +
      (campSupplyMode === 'ammo' ? ' style="--bc:' + BULLETS[id].color + '"' : '') + ' title="' + (side === 'box' ? '點一下：拿到背包' : '點一下：放進箱子') + '" aria-label="' + B.name(id) + ' ' + n + '">' +
      '<img src="' + B.image(id) + '" alt=""><b>' + n + (max ? '<small>/' + max + '</small>' : '') + '</b><span class="bag-cell-name">' + B.name(id) + '</span></button>';
  };
  const pad = (list, min) => { let h = ''; for (let i = list.length; i < min; i++) h += '<span class="bag-cell empty" aria-hidden="true"></span>'; return h; };
  // 格數跟溫特身上一樣：彈藥箱＝彈藥包的格數、物資箱＝背包「物品」的格數（一開始 12 格，開發工坊升級會變多；js/backpack.js 的 bagCapacity）
  // 兩邊畫一樣多格；東西比格子多時再補一排
  const bagCap = typeof bagCapacity === 'function' ? bagCapacity(campSupplyMode === 'ammo' ? 'weapon' : 'consumable') || 8 : 8;
  const minCells = Math.max(Math.ceil(bagCap / 4) * 4, Math.ceil(Math.max(boxIds.length, bagIds.length) / 4) * 4);
  // 說明列
  let detail = '<div class="bag-detail-empty cb-empty"><span>' + (campSupplyMode === 'ammo' ? '🧰' : '📦') + '</span><p>箱子和背包裡都沒有東西</p></div>';
  if (campBoxSel) {
    const id = campBoxSel.id, inBox = B.box(id), inBag = B.bag(id), max = B.bagMax(id);
    const canTake = Math.min(inBox, max ? max - inBag : Infinity), canPut = Math.min(inBag, B.boxRoom()), qMax = Math.max(1, campBoxSel.side === 'box' ? canTake : canPut);
    const key = campSupplyMode + ':' + campBoxSel.side + ':' + id;
    if (key !== campBoxQtyKey) { campBoxQtyKey = key; campBoxQty = campSupplyMode === 'ammo' ? qMax : 1; }   // 換選別的：子彈預設整批、物資預設 1 個
    campBoxQty = Math.max(1, Math.min(qMax, campBoxQty | 0));
    detail = '<div class="bag-detail-image cb-image"><img src="' + B.image(id) + '" alt=""></div>' +
      '<div class="cb-info"><h3>' + B.name(id) + '</h3><p class="cb-counts">箱子 <b>' + inBox + '</b>・' + (campSupplyMode === 'ammo' ? '身上' : '背包') + ' <b>' + inBag + '</b>' + (max ? ' / ' + max : '') + ' ' + B.unit + '</p>' +
      (B.desc(id) ? '<p class="bag-desc">' + B.desc(id) + '</p>' : '') + '</div>' +
      '<div class="cb-actions"><div class="bag-qty"><button type="button" data-cb-qty="-1" aria-label="少一個"' + (campBoxQty <= 1 ? ' disabled' : '') + '>−</button><b>' + campBoxQty + '</b><button type="button" data-cb-qty="1" aria-label="多一個"' + (campBoxQty >= qMax ? ' disabled' : '') + '>＋</button></div>' +
      '<button type="button" class="bag-use" data-cb-move="take"' + (canTake <= 0 ? ' disabled' : '') + '>拿到' + (campSupplyMode === 'ammo' ? '身上' : '背包') + '</button>' +
      '<button type="button" class="bag-drop" data-cb-move="put"' + (canPut <= 0 ? ' disabled' : '') + '>放進箱子</button></div>';
  }
  const canFill = B.fillAll && ids.some(id => B.box(id) > 0 && B.bag(id) < B.bagMax(id));
  const foot = B.footer ? B.footer() : '';
  campSupplyEl.innerHTML = '<section class="backpack-card camp-box-card' + (campBoxPop ? ' pop' : '') + '" role="dialog" aria-modal="true" aria-label="' + B.title + '">' +
    '<header class="backpack-head"><div class="backpack-icon cb-icon" aria-hidden="true"><span class="cb-icon-crop"><img src="' + B.icon() + '" alt=""></span></div>' +
    '<div class="backpack-title"><h2>' + B.title + '</h2><p>' + B.sub + '</p></div>' +
    (B.fillAll ? '<button type="button" class="bag-use cb-fillall" data-cb-fillall' + (canFill ? '' : ' disabled') + '>全部補滿</button>' : '') +
    '<button type="button" class="camp-supply-close" aria-label="關閉（Esc）">×</button></header>' +
    '<div class="cb-body no-anim">' +
      '<div class="cb-side" data-cb-side="box"><h4>' + (campSupplyMode === 'ammo' ? '🧰' : '📦') + ' 箱子 <em>' + B.boxCount() + '</em></h4><div class="cb-grid">' + boxIds.map(id => cell('box', id)).join('') + pad(boxIds, minCells) + '</div></div>' +
      '<div class="cb-arrows" aria-hidden="true"><span>→</span><span>←</span></div>' +
      '<div class="cb-side" data-cb-side="bag"><h4>🎒 ' + B.bagName + '</h4><div class="cb-grid">' + bagIds.map(id => cell('bag', id)).join('') + pad(bagIds, minCells) + '</div></div>' +
    '</div>' +
    '<p class="cb-hint">點格子就搬到另一邊，也可以拖過去' + (campSupplyMode === 'ammo' ? '（箱子 → 身上：補滿；身上 → 箱子：全部放回去）' : '（點一下搬 1 個；拖過去一次搬一整格，最多 20 個）') + '；要指定數量用下面的 − ＋</p>' +
    '<div class="cb-detail">' + detail + '</div>' +
    (foot ? '<footer class="cb-foot">' + foot + '</footer>' : '') +
    '</section>';
  campBoxPop = false;
  const body = campSupplyEl.querySelector('.cb-body');   // 重畫時不要重播滑鼠下那格的浮起動畫（跟背包一樣）
  requestAnimationFrame(() => requestAnimationFrame(() => body && body.classList.remove('no-anim')));
}
window.addEventListener('keydown', e => {
  if (!campSupplyOpen) return;
  if (e.key === 'Escape' || (!e.repeat && (e.key === ' ' || e.key === 'Enter'))) { e.preventDefault(); e.stopImmediatePropagation(); closeCampSupply(); }
}, true);
