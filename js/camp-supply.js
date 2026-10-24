// ============================================================
//  營地物資箱：放醫療包、杏仁水、急救包（溫特也可以拿、可以補；嚮導拿杏仁水和急救包）
//  ・箱子是地圖上放的「物資箱」物件（地圖編輯器的素材 tile_field_supply_box）；同一張地圖放幾個都共用同一份物資。第一次在這張地圖出任務時補滿 start 的數量，
//    之後就一直維持（用掉就少了，中止任務再回來也不會補），要溫特自己放東西進去。
//  ・嚮導身上最多帶 carry 個急救包、carry 瓶杏仁水：杏仁水恢復 SP，疏導花 SP，補血（隊友和自己）花急救包。
//    其中一樣用完就自己走回物資箱拿（地上有溫特放的就先撿地上的，js/ground-items.js）；箱子裡也沒有的話，頭上冒思考泡泡顯示缺什麼。
//  ・存檔：localStorage（CAMP_SUPPLY_KEY），依地圖分開存；開始新遊戲會清掉（js/new-game.js）。
// ============================================================
const CAMP_SUPPLY = {
  slots: 20,                                   // 箱子幾格（一格放一個）
  items: ['medkit', 'almond-water', 'firstaid'],             // 能放什麼
  start: { medkit: 7, 'almond-water': 6, firstaid: 7 },      // 第一次出任務時箱子裡有多少
  guideItems: ['firstaid', 'almond-water'],                   // 嚮導身上帶的（醫療包是給溫特自己用的）
  carry: 3,                                    // 嚮導每樣最多帶幾個
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
    t.kit = { firstaid: 0, 'almond-water': 0 };
    if (!MAP_SAFE && campSupplySpot() && !window.TEST_MODE) refillGuideKit(t, true);   // 🧪 測試模式：空手出勤（方便測球球叼急救包、杏仁水給嚮導，js/ground-items.js）
  }
  return t.kit;
}
function refillGuideKit(t, silent) {
  const box = campBox(), got = [];
  for (const k of CAMP_SUPPLY.guideItems) {
    const n = Math.min(CAMP_SUPPLY.carry - (t.kit[k] || 0), box[k] || 0);
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

// ---- 嚮導自己回箱子拿（js/sentry.js 呼叫；回傳 true＝這一幀在走去拿，不做別的）----
function guideSupplyStep(t, dt) {
  if (MAP_SAFE || t.berserk || t.hp <= 0 || t.mode === 'goto') { t.supplyTrip = null; return false; }
  if (typeof guideGroundStep === 'function' && guideGroundStep(t, dt)) { t.supplyTrip = null; return true; }   // 地上有溫特放的急救包、杏仁水：先去撿（js/ground-items.js）
  if (window.TEST_MODE) { t.supplyTrip = null; return false; }   // 🧪 測試模式：不回物資箱拿，只靠地上的、球球叼來的
  const missing = guideMissing(t), box = campBox();
  const canGet = missing.filter(k => (box[k] || 0) > 0);
  if (!canGet.length) { t.supplyTrip = null; return false; }
  const spot = campSupplySpot(); if (!spot) { t.supplyTrip = null; return false; }
  if (!t.supplyTrip) {
    t.supplyTrip = { goal: campSupplyStand(t, spot) };
    if (!t.supplyTrip.goal) { t.supplyTrip = null; return false; }
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

// ---- 溫特打開物資箱：拿（放進背包）、放（從背包放進來）----
let campSupplyOpen = false, campSupplyEl = null;
function openCampSupply() {
  if (campSupplyOpen || !G || G.over) return;
  if (!campSupplyEl) {
    campSupplyEl = document.createElement('div'); campSupplyEl.id = 'campSupply'; campSupplyEl.className = 'hidden';
    campSupplyEl.addEventListener('click', e => {
      if (e.target === campSupplyEl || e.target.closest('.camp-supply-close')) { closeCampSupply(); return; }
      const take = e.target.closest('[data-supply-take]'); if (take) { campSupplyMove(take.dataset.supplyTake, -1); return; }
      const put = e.target.closest('[data-supply-put]'); if (put) campSupplyMove(put.dataset.supplyPut, 1);
    });
    (document.getElementById('wrap') || document.body).appendChild(campSupplyEl);
  }
  campSupplyOpen = true; aimHeld = false; Object.keys(keys).forEach(k => { keys[k] = false; });
  renderCampSupply(); campSupplyEl.classList.remove('hidden'); sfx('menu');
  setTimeout(() => campSupplyEl.querySelector('.camp-supply-close')?.focus(), 0);
}
function closeCampSupply() { if (!campSupplyOpen) return; campSupplyOpen = false; campSupplyEl.classList.add('hidden'); sfx('switch'); }
// dir：1＝從背包放進箱子、-1＝從箱子拿到背包
function campSupplyMove(k, dir) {
  const box = campBox(), bag = supplyInventory.get(k) || 0;
  if (dir > 0) {
    if (bag <= 0 || campBoxTotal() >= CAMP_SUPPLY.slots) { sfx('error'); return; }
    if (bag <= 1) supplyInventory.delete(k); else supplyInventory.set(k, bag - 1);
    box[k] = (box[k] || 0) + 1;
  } else {
    if ((box[k] || 0) <= 0) { sfx('error'); return; }
    if (!supplyGain(k, 1)) { sfx('error'); return; }   // 溫特拿不下了（持有上限）：留在箱子裡
    box[k]--;
  }
  saveCampSupply(); sfx('button'); updateHUD(); if (typeof saveGame === 'function') saveGame();
  renderCampSupply();
}
function renderCampSupply() {
  if (!campSupplyEl) return;
  const box = campBox(), total = campBoxTotal(), full = total >= CAMP_SUPPLY.slots;
  const cells = [];
  for (const k of CAMP_SUPPLY.items) for (let i = 0; i < (box[k] || 0); i++) cells.push('<span class="cs-cell" title="' + itemById(k).name + '"><img src="' + itemById(k).image + '" alt=""></span>');
  while (cells.length < CAMP_SUPPLY.slots) cells.push('<span class="cs-cell empty"></span>');
  const guides = (G.towers || []).filter(t => TYPES[t.type].guide && t.kit);
  campSupplyEl.innerHTML = '<section class="camp-supply-card" role="dialog" aria-modal="true" aria-label="營地物資箱">' +
    '<header><div><small>CAMP SUPPLY</small><h3>營地物資箱</h3><p>嚮導用完會自己回來拿</p></div><button type="button" class="camp-supply-close" aria-label="關閉（Esc）">×</button></header>' +
    '<div class="cs-grid">' + cells.join('') + '</div>' +
    '<div class="cs-rows">' + CAMP_SUPPLY.items.map(k => {
      const it = itemById(k), bag = supplyInventory.get(k) || 0;
      return '<div class="cs-row"><img src="' + it.image + '" alt=""><b>' + it.name + '</b><span>背包 <em>' + bag + '</em></span>' +
        '<button type="button" data-supply-take="' + k + '"' + ((box[k] || 0) <= 0 ? ' disabled' : '') + '>拿 1 個</button>' +
        '<button type="button" data-supply-put="' + k + '"' + (bag <= 0 || full ? ' disabled' : '') + '>放 1 個</button></div>';
    }).join('') + '</div>' +
    (guides.length ? '<footer>' + guides.map(t => TYPES[t.type].name + '身上：急救包 ' + (t.kit.firstaid || 0) + '・杏仁水 ' + t.kit['almond-water']).join('　') + '</footer>' : '') +
    '</section>';
}
window.addEventListener('keydown', e => {
  if (!campSupplyOpen) return;
  if (e.key === 'Escape' || (!e.repeat && (e.key === ' ' || e.key === 'Enter'))) { e.preventDefault(); e.stopImmediatePropagation(); closeCampSupply(); }
}, true);
