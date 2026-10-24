// ============================================================
//  放在地上的物品：背包裡按「放在地上」，東西就掉在溫特腳邊，走過去按互動鍵可以撿回來
//  ・存在 G.groundItems：{ id, qty, x, y, at }（qty＝這一堆有幾個，地上不顯示數字、靠近時的拾取提示才寫；at＝什麼時候放的，播從上面掉下來的動畫）。換地圖就清掉（G 每張地圖重建），不存檔。
//  ・撿起：跟地上的道具一樣走 js/storage-lockers.js 的拾取（kind 'ground-item'），遵守持有上限，拿不下的留在地上。
//  ・搜救犬球球：只撿 GROUND_ITEMS.kitItems（嚮導身上帶的急救包、杏仁水），叼去給身上還沒帶滿、最缺的嚮導（js/rescue-dog.js）；
//    嚮導都帶滿了就不撿。其他東西球球不碰，怪物也不會撿。
//  ・嚮導：身上急救包、杏仁水沒帶滿時，走過地上的就順手撿；用完了會先走去撿地上的，不用回營地物資箱（guideGroundStep）。
// ============================================================
const GROUND_ITEMS = { size: 26, sortDy: 10, guideReach: 30, throwReach: 120, kitItems: ['firstaid', 'almond-water'] };   // size：地上畫多大；throwReach：從快捷欄拖到地圖上，最遠丟多遠（px）

// 背包「放在地上」呼叫：從背包拿掉 qty 個，放在溫特面前一點點的地上（同一個位置已經有同樣的東西就疊在一起）
// aim＝{x, y}：丟到這個位置（快捷欄拖到地圖上，js/quick-slots.js）；太遠就丟到 throwReach 那麼遠。那裡有障礙物＝不能放（回傳 0）
const groundBlocked = (x, y) => typeof playerBlocked === 'function' ? playerBlocked(x, y) : solidBlocksPoint(x, y);
function groundDropSpot(aim) {   // 拖到 aim 會落在哪裡；有障礙物＝null
  const p = G && G.player; if (!p) return null;
  const dx = aim.x - p.x, dy = aim.y - p.y, d = Math.hypot(dx, dy), k = d > GROUND_ITEMS.throwReach ? GROUND_ITEMS.throwReach / d : 1;
  const x = p.x + dx * k, y = p.y + dy * k;
  return groundBlocked(x, y) ? null : { x, y };
}
function dropItemOnGround(id, qty = 1, aim = null) {
  const p = G && G.player, count = supplyInventory.get(id) || 0, n = Math.min(qty, count);
  if (!p || n <= 0) return 0;
  const off = { left: [-16, 4], right: [16, 4], back: [0, -10], front: [0, 12] }[p.dir] || [0, 12];
  let x = p.x + off[0], y = p.y + off[1];
  if (aim) { const spot = groundDropSpot(aim); if (!spot) return 0; ({ x, y } = spot); }
  else if (groundBlocked(x, y)) { x = p.x; y = p.y + 4; }   // 背包的「放在地上」：面前是牆就放在腳下
  if (n >= count) supplyInventory.delete(id); else supplyInventory.set(id, count - n);
  G.groundItems = G.groundItems || [];
  const pile = G.groundItems.find(g => g.id === id && Math.hypot(g.x - x, g.y - y) < 10);
  const at = performance.now() / 1000;   // 什麼時候放的：從上面掉下來的動畫（drawGroundItem）
  if (pile) Object.assign(pile, { qty: pile.qty + n, at }); else G.groundItems.push({ id, qty: n, x, y, at });
  return n;
}
function removeGroundItem(g, n) {
  g.qty -= n;
  if (g.qty <= 0) G.groundItems = (G.groundItems || []).filter(o => o !== g);
}
// js/storage-lockers.js 的拾取共用：溫特撿起來（拿得下幾個拿幾個）
function pickupGroundItem(g) {
  if (!g || !(G.groundItems || []).includes(g)) return false;
  const got = supplyGain(g.id, g.qty); if (!got) return false;   // 拿不下：留在地上（supplyGain 會跳提示）
  removeGroundItem(g, got);
  sfx('itemPickup'); if (typeof showItemPickupNotice === 'function') showItemPickupNotice(g.id, got);
  updateHUD(); if (typeof backpackOpen !== 'undefined' && backpackOpen) renderBackpack();
  return true;
}
const groundItemName = g => (itemById(g.id) || {}).name || '物品';

// ---- 球球叼給嚮導：這個東西現在給誰（身上帶最少的那位；一樣少就給最近的）。沒人需要＝null ----
function groundItemGuide(id, from) {
  if (MAP_SAFE || !GROUND_ITEMS.kitItems.includes(id) || typeof guideKit !== 'function') return null;
  let best = null, bn = Infinity, bd = Infinity;
  for (const t of G.towers) {
    if (!TYPES[t.type] || !TYPES[t.type].guide || t.hp <= 0 || t.berserk) continue;
    const n = guideKit(t)[id] || 0; if (n >= CAMP_SUPPLY.carry) continue;
    const d = Math.hypot(t.x - from.x, t.y - from.y);
    if (n < bn || (n === bn && d < bd)) { best = t; bn = n; bd = d; }
  }
  return best;
}
function giveGuideItem(t, id) {
  const kit = guideKit(t); kit[id] = (kit[id] || 0) + 1;
  if (typeof sentryStatus === 'function') sentryStatus(t, '球球叼來了' + (itemById(id) || {}).name, '#9ff0c0');
  if (typeof campSupplyOpen !== 'undefined' && campSupplyOpen && typeof renderCampSupply === 'function') renderCampSupply();
}

// ---- 嚮導自己撿（js/camp-supply.js 的 guideSupplyStep 呼叫；回傳 true＝這一幀在走去撿）----
// 身上沒帶滿：走過旁邊順手撿；其中一樣用完了：先走去撿地上的，不用回營地物資箱拿
function guideGroundStep(t, dt) {
  const list = G.groundItems || [], kit = guideKit(t);
  const want = g => GROUND_ITEMS.kitItems.includes(g.id) && (kit[g.id] || 0) < CAMP_SUPPLY.carry;
  for (const g of list) if (want(g) && Math.hypot(g.x - t.x, g.y - t.y) < GROUND_ITEMS.guideReach) { guideTakeGround(t, g); t.groundTrip = null; return false; }
  let trip = t.groundTrip;
  if (trip && (!list.includes(trip.g) || !want(trip.g))) trip = t.groundTrip = null;
  if (!trip) {
    if ((t.groundTripCd = Math.max(0, (t.groundTripCd || 0) - dt)) > 0) return false;   // 剛剛走不到：等一下再找
    const missing = guideMissing(t);
    let best = null, bd = Infinity;
    for (const g of list) {
      if (!missing.includes(g.id) || !isLit(g.x, g.y)) continue;
      const d = Math.hypot(g.x - t.x, g.y - t.y); if (d < bd) { bd = d; best = g; }
    }
    if (!best) return false;
    trip = t.groundTrip = { g: best };
    if (typeof sentryStatus === 'function') sentryStatus(t, '去撿地上的' + groundItemName(best), '#8fd3ff');
  }
  if (moveSentryWithPath(t, trip.g.x, trip.g.y, (TYPES[t.type].walkSpeed || 80) * 1.3, dt)) { guideTakeGround(t, trip.g); t.groundTrip = null; t.navPath = null; return true; }
  if (t.navFailed) { t.groundTrip = null; t.navFailed = false; t.groundTripCd = 3; return false; }   // 走不到：改回營地拿
  t.target = null;
  return true;
}
function guideTakeGround(t, g) {
  const kit = guideKit(t), n = Math.min(g.qty, CAMP_SUPPLY.carry - (kit[g.id] || 0)); if (n <= 0) return;
  kit[g.id] = (kit[g.id] || 0) + n; removeGroundItem(g, n);
  if (typeof sentryStatus === 'function') sentryStatus(t, '撿起地上的' + groundItemName(g) + (n > 1 ? '×' + n : ''), '#9ff0c0');
  if (typeof sfxAt === 'function') sfxAt('pop', g.x, g.y, .5, 'guide-pick');
  if (typeof campSupplyOpen !== 'undefined' && campSupplyOpen && typeof renderCampSupply === 'function') renderCampSupply();
}

// ---- 繪製：render.js 把每一個放進 sortables 依 y 排序（GROUND_ITEMS.sortDy），跟營地、物件的前後關係才對 ----
const groundItemImgs = {};
function groundItemImg(id) {
  if (!groundItemImgs[id]) { const it = itemById(id), img = new Image(); if (it && it.image) img.src = it.image; groundItemImgs[id] = img; }
  const img = groundItemImgs[id]; return img.complete && img.naturalWidth ? img : null;
}
function drawGroundItem(ctx, g) {
  const now = performance.now() / 1000, S = GROUND_ITEMS.size, x = g.x, y = g.y;
  const a = typeof dropAnim === 'function' ? dropAnim(now - (g.at || 0)) : null;   // 從上面掉下來 → 壓扁 → 回彈（跟放建築一樣，js/build.js）
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(x, y + 2, S * .36, S * .13, 0, 0, Math.PI * 2); ctx.fill();   // 影子
  const img = groundItemImg(g.id), bob = a ? 0 : Math.sin(now * 2.5 + g.x * .05) * 1;
  ctx.imageSmoothingEnabled = false;
  if (a) { ctx.translate(x, y + 2 + a.dy); ctx.scale(a.sx, a.sy); ctx.translate(-x, -(y + 2)); }   // 以底部中央為錨點縮放
  if (img) {
    const sc = S / Math.max(img.naturalWidth, img.naturalHeight), w = img.naturalWidth * sc, h = img.naturalHeight * sc;
    ctx.drawImage(img, x - w / 2, y - h + 2 + bob, w, h);
  } else { ctx.fillStyle = '#ffd479'; ctx.beginPath(); ctx.arc(x, y - 6, 5, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}
// 球球叼著的東西：畫在嘴巴的位置（render.js 放進 sortables，緊接在球球後面畫，被東西擋住時一起被擋）
const DOG_MOUTH = { right: [27, -2], left: [-27, -2], front: [-27, -2], back: [-27, -2], size: GROUND_ITEMS.size };   // front、back：球球的正面、背面圖跟朝左是同一張，所以位置一樣；size：跟地上的一樣大，不縮小
const dogCarryImgs = {};
function dogCarryImg(c) {
  const src = c.id ? (itemById(c.id) || {}).image : c.equip && typeof equipDef === 'function' ? (equipDef(c.equip) || {}).image : null;
  if (!src) return null;
  if (!dogCarryImgs[src]) { const img = new Image(); img.src = src; dogCarryImgs[src] = img; }
  const img = dogCarryImgs[src]; return img.complete && img.naturalWidth ? img : null;
}
function drawDogCarry(ctx, npc) {
  const c = npc.carryItem; if (!c) return;
  const [dx, dy] = DOG_MOUTH[npc.dir] || DOG_MOUTH.front, S = DOG_MOUTH.size, x = npc.x + dx, y = npc.y + dy;
  ctx.save(); ctx.imageSmoothingEnabled = false;
  if (c.shard) {   // 異質碎片：小顆紫色菱形
    ctx.translate(x, y); ctx.beginPath(); ctx.moveTo(0, -5); ctx.lineTo(3, 0); ctx.lineTo(0, 5); ctx.lineTo(-3, 0); ctx.closePath();
    ctx.fillStyle = c.shard.rare ? '#c48bff' : '#7d46c4'; ctx.fill(); ctx.lineWidth = 1; ctx.strokeStyle = '#140419'; ctx.stroke();
  } else {
    const img = dogCarryImg(c);
    if (img) { const sc = S / Math.max(img.naturalWidth, img.naturalHeight), w = img.naturalWidth * sc, h = img.naturalHeight * sc; ctx.drawImage(img, x - w / 2, y - h / 2, w, h); }
  }
  ctx.restore();
}
