/* ===== 慶功宴：食堂出餐小遊戲（試玩版，設定在 data/party.js）=====
   流程：在作戰桌旁跟艾德林對話 →「🎉 慶功宴」→ 選要不要辦 → 轉場到餐廳 → 選幫手 → 大家入座 → 點餐、煮飯、出餐、回收 → 結算。
   ・溫特一次只能拿一樣東西（食材、餐盤或碗）。空白鍵／Enter 互動，靠近工作站時會顯示能做什麼。
   ・每樣要煮的食材各佔一個爐口；煮好後放太久會烤焦。
   ・裝菜：拿著餐盤或碗去食材那裡直接裝；或先把餐盤放在出菜台，再把食材端過去放上去。
   ・活動進行時才接管互動鍵和部分功能；活動結束就全部還原，平常吃飯、爐灶煮生食都不受影響。
   必須在 js/game.js、js/meal.js、js/missions.js 之後載入。
*/
const party = { stage: null, guests: [], helpers: [], stations: {}, pots: [], steam: [], counter: [], dishesAtTable: [], stats: null, time: 0, stock: { plate: 0, bowl: 0 }, menu: [], arrive: [], arriveT: 0, hold: null };
const partyOn = () => !!party.stage;
const partyPlaying = () => party.stage === 'play';
const partyActorId = a => a.kind === 'tower' ? a.type : a.id;
const partyName = id => (typeof CHARACTERS !== 'undefined' && CHARACTERS[id] && CHARACTERS[id].name) || (TYPES[id] && TYPES[id].name) || id;
const partyPick = list => list[Math.floor(Math.random() * list.length)];
const partyLine = (table, id) => partyPick(table[id] || table.default);
const partyImgs = {};
function partyImg(src) { if (!partyImgs[src]) { partyImgs[src] = new Image(); partyImgs[src].src = src; } return partyImgs[src]; }
const partySay = (a, text) => { if (a) a.say = { text, life: 3.2 }; };
const partyIng = id => PARTY.ingredients[id];
const partyDish = id => PARTY.dishes[id];

// ===== 活動進行中，暫時關掉其他互動（門、椅子、對話、商店…），人才不會端著菜走掉 =====
for (const name of ['interactionNearPlayer', 'seatNearPlayer', 'portalNearPlayer', 'elevatorNearPlayer', 'shopCounterNearPlayer', 'vendingNearPlayer', 'drinkShopNearPlayer', 'backroomShopNearPlayer', 'doorNearPlayer', 'toggleDoorNearPlayer', 'useStoragePropNearPlayer', 'useCampInteractionNearPlayer', 'pickupPropNearPlayer', 'usePosterNearPlayer', 'useNpcChatNearPlayer', 'tryStartMeal', 'npcChatStep', 'missionTableUsable']) {
  const orig = window[name]; if (typeof orig !== 'function') continue;
  window[name] = function (...args) { if (partyOn()) return name === 'tryStartMeal' || name === 'npcChatStep' ? false : null; return orig.apply(this, args); };
}
// 轉場時全員都到餐廳（住院的人除外）
const partyOrigHomeHere = window.npcHomeHere;
window.npcHomeHere = function (id) {
  if (partyOn()) return !(typeof isHospitalized === 'function' && isHospitalized(id));
  return partyOrigHomeHere.apply(this, arguments);
};
// 互動鍵：活動中全部交給這裡
const partyOrigUseMeal = window.useMealNearPlayer;
window.useMealNearPlayer = function () {
  if (!partyOn()) return partyOrigUseMeal();
  if (partyPickerEl) { partyClosePicker(); return true; }
  if (partyPlaying()) { const a = partyPlayerAction(); if (a) a.run(); }
  return true;
};
const partyOrigMealPrompt = window.mealPrompt;
window.mealPrompt = function () { return partyOn() ? null : partyOrigMealPrompt(); };
// 每幀更新、畫面：接在吃飯的更新與畫面後面
const partyOrigUpdateMeal = window.updateMeal;
window.updateMeal = function (dt) { partyOrigUpdateMeal(dt); if (partyOn()) partyUpdate(dt); };
const partyOrigMealFx = window.drawMealFx;
window.drawMealFx = function (c) { partyOrigMealFx(c); if (partyOn()) partyDraw(c); };
const partyOrigSortables = window.mealSortables;
window.mealSortables = function (list) {
  partyOrigSortables(list);
  if (!partyOn()) return;
  for (const d of party.dishesAtTable) list.push({ y: d.y + 40, draw: () => partyDrawTableDish(d) });
  for (const c of party.counter) list.push({ y: c.y + 30, draw: () => partyDrawHeld(ctx, c.item, c.x, c.y, 24) });
};
const partyOrigSentry = window.updateSentry, partyOrigWanderer = window.updateWanderer;
window.updateSentry = function (t, dt) { if (partyOn() && t.hp > 0 && partyActorStep(t, dt)) return; partyOrigSentry(t, dt); };
window.updateWanderer = function (n, dt) { if (partyOn() && partyActorStep(n, dt)) return; partyOrigWanderer(n, dt); };

// ===== 工作站：從地圖上找出每種工作站的位置 =====
function partyBuildStations() {
  const out = {};
  for (const [kind, ids] of Object.entries(PARTY.tiles)) {
    const rects = mealStamps(ids);
    for (const layer of Object.values((MAP && MAP.layers) || {})) for (const [k, id] of Object.entries(layer)) {
      if (!ids.includes(id)) continue;
      const [c, r] = k.split(',').map(Number), x0 = OX + c * CELL, y0 = OY + r * CELL;
      rects.push({ x0, y0, w: CELL, h: CELL, x: x0 + CELL / 2, top: y0, bottom: y0 + CELL });
    }
    // 餐盤架、湯鍋的圖上半部是空的：判定範圍只算下半部，才不會擋到後面的冰箱
    if (kind === 'plate' || kind === 'soup') out[kind] = rects.map(r => ({ ...r, y0: r.y0 + r.h / 2, h: r.h / 2, top: r.y0 + r.h / 2 }));
    else out[kind] = rects;
  }
  party.stations = out;
  const stove = out.stove && out.stove[0];
  if (stove) stove.aim = burnerPos(stove.s, 1);   // 爐灶：幫手站在爐口前面，不是工作台的另一頭
  party.reachable = partyReachableCells();
}
function partyReachableCells() {   // 從溫特站的位置走得到哪些格子（幫手要站在走得到的地方）
  const [sc, sr] = cellAt(G.player.x, G.player.y), seen = new Set([sc + ',' + sr]), queue = [[sc, sr]];
  for (let i = 0; i < queue.length; i++) {
    const [c, r] = queue[i];
    for (const [dc, dr] of [[0, 1], [1, 0], [-1, 0], [0, -1]]) {
      const nc = c + dc, nr = r + dr, k = nc + ',' + nr;
      if (seen.has(k) || !inGrid(nc, nr) || edgeBetween(c, r, nc, nr) || !sentryCellWalkable(nc, nr, true)) continue;
      seen.add(k); queue.push([nc, nr]);
    }
  }
  return queue;
}
function partyApproach(rect) {     // 走到這個工作站要站哪裡（離它最近、走得到的格子）
  if (rect.approach) return rect.approach;
  let best = null, bd = Infinity;
  for (const [c, r] of party.reachable) {
    const [x, y] = center(c, r), d = (rect.aim ? Math.hypot(x - rect.aim.x, y - rect.aim.y) : mealDist(rect, x, y)) + (y < rect.y0 && rect.h >= CELL * 2 ? 40 : 0);   // 優先站在物件前面，不要繞到背後；aim＝要站在這一點附近
    if (d < bd) { bd = d; best = { x, y }; }
  }
  return rect.approach = best || { x: rect.x, y: rect.bottom + 10 };
}
const partyStation = kind => (party.stations[kind] || [])[0] || null;
function partyNearStation(kind, x, y, reach = 46) {
  let best = null, bd = reach;
  for (const r of party.stations[kind] || []) { const d = mealDist(r, x, y); if (d <= bd) { bd = d; best = r; } }
  return best;
}
const partyBurners = () => { const r = partyStation('stove'); return r ? COOKING.burners.map((_, k) => burnerPos(r.s, k)) : []; };
const partySlotPos = k => { const r = partyStation('counter'), at = PARTY.counterSpots[k] || PARTY.counterSpots[0]; return r ? { x: r.x0 + at[0], y: r.y0 + at[1] } : { x: 0, y: 0 }; };

// ===== 拿在手上的東西（溫特和幫手共用）=====
// { t:'ing', id, cooked } 食材 ／ { t:'box', box, ings:[], dish } 餐盤或碗 ／ { t:'dirty', box } 髒的 ／ { t:'burnt' } 烤焦的
const partyHoldOf = who => who === 'player' ? party.hold : who.partyHold;
const partySetHold = (who, v) => { if (who === 'player') party.hold = v; else who.partyHold = v; };
function partyDishFor(box, ings) {   // 這些材料剛好是今天哪一道菜
  return party.menu.find(id => { const d = partyDish(id); return d.box === box && d.ings.length === ings.length && d.ings.every(i => ings.includes(i)); }) || null;
}
function partyCanAdd(box, ingId) {   // 這個容器放得下這個食材嗎（今天有這道菜才行）
  if (box.ings.includes(ingId)) return false;
  const next = [...box.ings, ingId];
  return party.menu.some(id => { const d = partyDish(id); return d.box === box.box && next.every(i => d.ings.includes(i)); });
}
function partyAddTo(box, ingId) { box.ings.push(ingId); box.dish = partyDishFor(box.box, box.ings); }
const partyReady = (ingId, cooked) => !partyIng(ingId).cook || cooked;   // 要煮的要煮好才能裝

// ===== 工作站的動作（who＝'player' 或幫手；回傳 true＝做到了）=====
function partyTakeBox(who, kind) {
  if (party.stock[kind] <= 0) { if (who === 'player') partyError(kind === 'plate' ? '餐盤用完了，記得回收！' : '碗用完了，記得回收！'); return false; }
  party.stock[kind]--; partySetHold(who, { t: 'box', box: kind, ings: [], dish: null }); sfx('switch'); partyRenderHud(); return true;
}
function partyStovePut(who) {
  const h = partyHoldOf(who), used = new Set(party.pots.map(p => p.k)), k = COOKING.burners.findIndex((_, i) => !used.has(i));
  if (k < 0) { if (who === 'player') partyError('三個爐口都在煮了'); return null; }
  const pos = partyBurners()[k], ing = partyIng(h.id);
  const pot = { k, id: h.id, t: 0, cookTime: ing.cook, burn: PARTY.burnAfter, x: pos.x, y: pos.y, owner: who };
  party.pots.push(pot); partySetHold(who, null);
  if (typeof sfxAt === 'function') sfxAt('fireImpact', pos.x, pos.y, .25, 'cook-start');
  return pot;
}
const partyPotDone = p => p.t >= p.cookTime, partyPotBurnt = p => p.t >= p.cookTime + p.burn;
function partyStoveTake(who, pot, into) {
  party.pots.splice(party.pots.indexOf(pot), 1);
  if (partyPotBurnt(pot)) { party.stats.burnt++; partySetHold(who, { t: 'burnt' }); sfx('error'); return 'burnt'; }
  if (into) partyAddTo(into, pot.id); else partySetHold(who, { t: 'ing', id: pot.id, cooked: true });
  sfx('blip'); return 'ok';
}
function partyCounterPut(who) {
  const h = partyHoldOf(who), used = new Set(party.counter.map(c => c.k));
  const k = [...Array(PARTY.counterSlots).keys()].find(i => !used.has(i));
  if (k == null) { if (who === 'player') partyError('出菜台放滿了'); return null; }
  const pos = partySlotPos(k), slot = { k, item: h, ...pos };
  party.counter.push(slot); partySetHold(who, null); sfx('place'); return slot;
}
function partyCounterTake(who, slot) { party.counter.splice(party.counter.indexOf(slot), 1); partySetHold(who, slot.item); sfx('switch'); }
function partyCounterAdd(who, slot) { const h = partyHoldOf(who); partyAddTo(slot.item, h.id); partySetHold(who, null); sfx('blip'); }
const partyError = text => { sfx('error'); systemNotice(text, true); };

// ===== 客人 =====
function partyTakeOrder(g) {
  g.dish = partyPick(party.menu); g.state = 'food'; g.wait = PARTY.foodPatience; g.complained = false; g.orderedAt = party.time;
  sfx('blip'); partySay(g.a, partyDish(g.dish).name + '，麻煩了！'); partyRenderTickets();
}
function partyDeliver(g, who, held) {
  const name = g.id, byEldrin = who !== 'player' && partyActorId(who) === 'eldrin';
  if (name === 'avaren' && !byEldrin) { partySay(g.a, PARTY.lines.refuse); if (who === 'player') partyError('阿瓦倫只吃艾德林拿的。放在出菜台，艾德林會幫忙端'); return false; }
  const burnt = held.t === 'burnt';
  partySetHold(who, null);
  const tray = trayAtSeat(g.seat);
  const spot = tray ? { x: tray.x, y: tray.y } : { x: g.seat.x, y: g.seat.y - 30 };
  g.table = { ...spot, img: burnt ? PARTY.burntImg : partyDish(g.dish).img, box: burnt ? 'plate' : partyDish(g.dish).box, dirty: false, guest: g };
  party.dishesAtTable.push(g.table);
  g.state = 'eat'; g.eat = PARTY.eatTime; g.served = true;
  if (burnt) partySay(g.a, PARTY.lines.burntOk);
  else partySay(g.a, partyLine(PARTY.lines.thanks, name));
  party.stats.served++; if (g.wait < 0) party.stats.late++;
  sfx('pop'); partyRenderTickets(); return true;
}
const partyAccepts = (g, held) => g.state === 'food' && held && ((held.t === 'box' && held.dish === g.dish) || (held.t === 'burnt' && g.id === 'red'));
function partyPickDirty(who, d) {
  party.dishesAtTable.splice(party.dishesAtTable.indexOf(d), 1);
  partySetHold(who, { t: 'dirty', box: d.box }); sfx('switch');
}
function partyRecycle(who) { const h = partyHoldOf(who); party.stock[h.box]++; partySetHold(who, null); sfx('place'); partyRenderHud(); }
function partyDiscard(who) {
  const h = partyHoldOf(who);
  if (h && (h.t === 'box' || h.t === 'dirty')) party.stock[h.box]++;
  partySetHold(who, null); sfx('place'); partyRenderHud();
}

// ===== 溫特按互動鍵會做什麼（也拿來畫提示）=====
function partyPlayerAction() {
  const p = G.player, h = party.hold, near = (x, y, r) => Math.hypot(x - p.x, y - p.y) < r;
  // 工作站靠得很近：列出現在能做的動作，選溫特「面向的那一個」（身體前方一點的位置離誰最近）
  const face = { left: [-1, 0], right: [1, 0], back: [0, -1], front: [0, 1] }[p.dir] || [0, 1];
  const fx = p.x + face[0] * 26, fy = p.y + face[1] * 26, opts = [];
  const add = (r, label, run, y) => opts.push({ score: mealDist(r, fx, fy), label, x: r.x, y: y != null ? y : r.top - 4, run });
  const spot = (x, y, s = 14) => ({ x0: x - s, y0: y - s, w: s * 2, h: s * 2, x, top: y - s, bottom: y + s });
  for (const g of party.guests) {
    if (!g.seat || !near(g.seat.x, g.seat.y, 92)) continue;
    if (g.state === 'order') add(spot(g.a.x, g.a.y), '幫' + partyName(g.id) + '點餐', () => partyTakeOrder(g), g.a.y - 60);
    else if (partyAccepts(g, h)) add(spot(g.a.x, g.a.y), '送餐給' + partyName(g.id), () => partyDeliver(g, 'player', h), g.a.y - 60);
  }
  if (!h) for (const d of party.dishesAtTable) if (d.dirty && near(d.x, d.y, 92)) add(spot(d.x, d.y), '收' + (d.box === 'bowl' ? '碗' : '餐盤'), () => partyPickDirty('player', d), d.y - 20);
  const stove = partyNearStation('stove', p.x, p.y, 40);
  if (stove) {
    if (h && h.t === 'ing' && partyIng(h.id).cook && !h.cooked) add(stove, '放上爐口煮', () => partyStovePut('player'));
    for (const q of party.pots) {
      if (!partyPotDone(q)) continue;
      const r = spot(q.x, q.y, 18);
      if (partyPotBurnt(q)) { if (!h) add(r, '拿走烤焦的', () => partyStoveTake('player', q), q.y - 40); continue; }
      if (!h) add(r, '起鍋：' + partyIng(q.id).name, () => partyStoveTake('player', q), q.y - 40);
      else if (h.t === 'box' && partyCanAdd(h, q.id)) add(r, '裝進來：' + partyIng(q.id).name, () => partyStoveTake('player', q, h), q.y - 40);
    }
  }
  const counter = partyNearStation('counter', p.x, p.y);
  if (counter) {
    if (h && (h.t === 'box' || h.t === 'burnt')) add(counter, '放到出菜台', () => partyCounterPut('player'));
    for (const c of party.counter) {
      const r = spot(c.x, c.y);
      if (!h) add(r, c.item.dish ? '拿起：' + partyDish(c.item.dish).name : '拿起來', () => partyCounterTake('player', c), c.y - 20);
      else if (h.t === 'ing' && partyReady(h.id, h.cooked) && c.item.t === 'box' && partyCanAdd(c.item, h.id)) add(r, '放到' + (c.item.box === 'bowl' ? '碗' : '餐盤') + '裡', () => partyCounterAdd('player', c), c.y - 20);
    }
  }
  for (const box of ['plate', 'bowl']) {
    const r = partyNearStation(box, p.x, p.y, 44);
    if (r && !h) add(r, '拿' + (box === 'bowl' ? '碗' : '餐盤') + '（剩 ' + party.stock[box] + '）', () => partyTakeBox('player', box));
  }
  for (const kind of ['rice', 'soup', 'condiment']) {
    const r = partyNearStation(kind, p.x, p.y, kind === 'condiment' ? 74 : 46); if (!r) continue;   // 調味瓶在桌子中間，手可以伸遠一點
    const id = Object.keys(PARTY.ingredients).find(k => partyIng(k).from === kind && partyMenuNeeds(k)); if (!id) continue;
    if (!h) add(r, '拿' + partyIng(id).name, () => { party.hold = { t: 'ing', id, cooked: true }; sfx('switch'); });
    else if (h.t === 'box' && partyCanAdd(h, id)) add(r, '裝' + partyIng(id).name, () => { partyAddTo(h, id); sfx('blip'); });
  }
  const fridge = partyNearStation('fridge', p.x, p.y);
  if (fridge && (!h || h.t === 'box')) add(fridge, h ? '拿食材裝進來' : '拿食材', () => partyOpenPicker(h));
  const waste = partyNearStation('waste', p.x, p.y);
  if (waste && h && h.t === 'dirty') add(waste, '回收', () => partyRecycle('player'));
  const trash = partyNearStation('trash', p.x, p.y, 40);
  if (trash && h) add(trash, '丟掉', () => partyDiscard('player'));
  return opts.sort((a, b) => a.score - b.score)[0] || null;
}
const partyMenuNeeds = id => party.menu.some(d => partyDish(d).ings.includes(id));

// ---- 冰箱選食材（數字鍵或點一下；走開就關掉）----
let partyPickerEl = null;
function partyOpenPicker(holdBox) {
  partyClosePicker();
  const list = Object.keys(PARTY.ingredients).filter(id => ['fridge', 'cabinet'].includes(partyIng(id).from) && partyMenuNeeds(id) && (!holdBox || (!partyIng(id).cook && partyCanAdd(holdBox, id))));
  if (!list.length) { partyError(holdBox ? '這裡沒有可以直接裝的食材，要煮的請先煮好' : '今天不需要這裡的食材'); return; }
  const el = document.createElement('div'); el.id = 'partyPicker'; partyPickerEl = el;
  el.innerHTML = '<b>' + (holdBox ? '裝進去' : '拿哪個食材？') + '</b>' + list.map((id, i) => '<button type="button" data-id="' + id + '"><i>' + (i + 1) + '</i><img src="' + partyIng(id).img + '" alt=""><span>' + partyIng(id).name + '</span>' + (partyIng(id).cook ? '<img class="fl" src="' + PARTY.stoveImg + '" alt="要煮">' : '') + '</button>').join('');
  el.addEventListener('click', e => { const b = e.target.closest('button'); if (b) partyPickIng(b.dataset.id); });
  document.getElementById('wrap').appendChild(el);
  el.dataset.list = list.join(',');
  sfx('menu');
}
function partyPickIng(id) {
  const h = party.hold;
  if (h && h.t === 'box') { if (partyCanAdd(h, id)) { partyAddTo(h, id); sfx('blip'); } }
  else if (!h) { party.hold = { t: 'ing', id, cooked: false }; sfx('switch'); }
  partyClosePicker();
}
function partyClosePicker() { if (partyPickerEl) { partyPickerEl.remove(); partyPickerEl = null; } }
window.addEventListener('keydown', e => {
  if (partyPickerEl && /^[1-9]$/.test(e.key)) {
    const id = partyPickerEl.dataset.list.split(',')[+e.key - 1];
    if (id) { e.preventDefault(); e.stopImmediatePropagation(); partyPickIng(id); }
  } else if (partyPickerEl && e.key === 'Escape') { e.stopImmediatePropagation(); partyClosePicker(); }
  if (partyPanelOpen && !(e.target instanceof HTMLButtonElement)) e.stopImmediatePropagation();   // 對話、選幫手時按鍵不控制角色
}, true);

// ===== 客人和幫手每幀怎麼動 =====
function partyWalk(a, x, y, speed, dt) { return moveSentryWithPath(a, x, y, speed, dt); }
const partySpeed = a => a.kind === 'tower' ? (TYPES[a.type].walkSpeed || 80) : 70;
function partySeatGuest(g) {
  const a = g.a;
  a.sitFrom = { x: a.x, y: a.y }; a.sitting = g.seat; a.seatGoal = null; a.navPath = null; a.target = null;
  a.x = g.seat.x; a.y = g.seat.y; a.dir = g.seat.dir; a.moving = false;
  if (!trayAtSeat(g.seat)) placeTrayAt(g.seat, newTray(), a);   // 桌上先擺一個空托盤當位子
}
function partyGuestStep(g, dt) {
  const a = g.a;
  updateNpcTalk(a, dt);
  if (g.state === 'outside') { a.moving = false; return; }
  if (g.state === 'walk') {
    if (partyWalk(a, g.approach.x, g.approach.y, partySpeed(a) * 1.25, dt) || (a.navFailed && (g.fail = (g.fail || 0) + dt) > 2)) {
      partySeatGuest(g); g.state = 'think'; g.t = PARTY.thinkTime[0] + Math.random() * (PARTY.thinkTime[1] - PARTY.thinkTime[0]);
    }
    return;
  }
  if (g.state === 'steal') { partyStealStep(g, dt); return; }
  a.x = g.seat.x; a.y = g.seat.y; a.dir = g.seat.dir; a.moving = false; a.sitting = g.seat;
  if (g.state === 'think') { if ((g.t -= dt) <= 0) { g.state = 'order'; g.wait = PARTY.orderPatience; sfx('blip'); } }
  else if (g.state === 'order') {
    g.wait -= dt;
    if (g.wait <= 0 && !g.complained) { g.complained = true; party.stats.late++; partySay(a, partyLine(PARTY.lines.complainOrder, g.id)); }
  } else if (g.state === 'food') {
    g.wait -= dt;
    if (g.wait <= 0 && !g.complained) {
      g.complained = true; partySay(a, partyLine(PARTY.lines.complainFood, g.id));
      if (g.id === 'chris') partyTrySteal(g);
    }
    if (g.id === 'chris' && g.wait <= 0 && g.state === 'food' && (g.stealCd = (g.stealCd || 4) - dt) <= 0) { g.stealCd = 4; partyTrySteal(g); }
  } else if (g.state === 'eat') {
    if ((g.eat -= dt) <= 0) { g.state = 'done'; if (g.table) g.table.dirty = true; partyRenderTickets(); }
  }
}
// 克莉思等太久：自己去出菜台拿做好的菜偷吃
function partyTrySteal(g) {
  const slot = party.counter.find(c => c.item.t === 'box' && c.item.dish); if (!slot) return;
  g.steal = { slot, back: false }; g.state = 'steal'; npcStandUp(g.a); partySay(g.a, PARTY.lines.steal);
}
function partyStealStep(g, dt) {
  const a = g.a, S = g.steal, rect = partyStation('counter');
  if (!S.back) {
    if (!party.counter.includes(S.slot)) { S.back = true; S.got = null; return; }   // 被別人拿走了
    if (partyWalk(a, partyApproach(rect).x, partyApproach(rect).y, partySpeed(a) * 1.4, dt) || a.navFailed) {
      if (party.counter.includes(S.slot)) { party.counter.splice(party.counter.indexOf(S.slot), 1); S.got = S.slot.item; party.stats.stolen++; sfx('pop'); }
      S.back = true; a.navPath = null;
    }
    return;
  }
  if (partyWalk(a, g.approach.x, g.approach.y, partySpeed(a) * 1.4, dt) || a.navFailed) {
    partySeatGuest(g);
    if (S.got) { g.dish = S.got.dish; const heldDish = S.got; g.state = 'food'; partyDeliver(g, { kind: 'npc', id: 'chris', partyHold: heldDish }, heldDish); }
    else g.state = 'food';
    g.steal = null;
  }
}
// 幫手：一步一步做。goal＝走去哪裡、到了做什麼
function partyHelperStep(h, dt) {
  const a = h.a; updateNpcTalk(a, dt);
  if (a.sitting) npcStandUp(a);
  if (h.wait > 0) { h.wait -= dt; a.moving = false; return; }
  if (h.goal) {
    const speed = partySpeed(a) * (h.trait.speed || 1) * 1.5;
    if (partyWalk(a, h.goal.x, h.goal.y, speed, dt) || (a.navFailed && (h.goal.fail = (h.goal.fail || 0) + dt) > 1)) {
      const done = h.goal.done; h.goal = null; a.navPath = null; a.moving = false; h.wait = .25; done();
      if (h.trait.slack && Math.random() < h.trait.slack) { h.wait = h.trait.slackTime || 4; partySay(a, h.trait.say); }
    }
    return;
  }
  if (h.role === 'cook') partyCookThink(h); else partyServeThink(h);
}
const partyGo = (h, rect, done) => { const q = partyApproach(rect); h.goal = { x: q.x, y: q.y, done }; };
function partyCookThink(h) {
  const a = h.a, hold = a.partyHold, trash = partyStation('trash');
  if (hold && hold.t === 'burnt') { partyGo(h, trash, () => partyDiscard(a)); return; }
  let J = h.job;
  if (J && (J.guest.state !== 'food')) {   // 這張單已經不用做了
    if (hold) { partyGo(h, trash, () => partyDiscard(a)); return; }
    if (J.pot && party.pots.includes(J.pot)) party.pots.splice(party.pots.indexOf(J.pot), 1);
    J.guest.claimed = false; J = h.job = null;
  }
  if (!J) {
    const g = party.guests.find(o => o.state === 'food' && !o.claimed && !partyHasReady(o.dish)); if (!g) { h.wait = .6; return; }
    g.claimed = true; const d = partyDish(g.dish);
    J = h.job = { guest: g, dish: d, left: [...d.ings], slot: null, pot: null };
  }
  const counter = partyStation('counter');
  if (!J.slot) {
    if (hold && hold.t === 'box') { partyGo(h, counter, () => { const s = partyCounterPut(a); if (s) J.slot = s; else h.wait = 1; }); return; }
    if (party.stock[J.dish.box] <= 0) { h.wait = 1; return; }
    partyGo(h, partyStation(J.dish.box), () => partyTakeBox(a, J.dish.box)); return;
  }
  if (!party.counter.includes(J.slot)) { J.slot = null; J.left = [...J.dish.ings]; return; }   // 碗被端走了：重來
  const ing = J.left[0];
  if (!ing) { J.guest.claimed = false; h.job = null; h.wait = .4; return; }   // 做完了：放開這張單（萬一菜被端給別人，還可以再做一份）
  const info = partyIng(ing);
  if (hold && hold.t === 'ing' && partyReady(hold.id, hold.cooked)) { partyGo(h, counter, () => { if (party.counter.includes(J.slot) && partyCanAdd(J.slot.item, hold.id)) { partyCounterAdd(a, J.slot); J.left.shift(); } else partyDiscard(a); }); return; }
  if (info.cook) {
    if (J.pot) {
      if (!party.pots.includes(J.pot)) { J.pot = null; return; }
      if (partyPotDone(J.pot)) {
        if ((J.late = (J.late == null ? (h.trait.late || 0) : J.late) - .25) > 0) { h.wait = .25; return; }   // 希奧妮：煮好了還不去拿
        const pot = J.pot; J.late = null;
        partyGo(h, partyStation('stove'), () => { if (party.pots.includes(pot)) { partyStoveTake(a, pot); } J.pot = null; }); return;
      }
      h.wait = .3; return;
    }
    if (hold && hold.t === 'ing') { partyGo(h, partyStation('stove'), () => { const p = partyStovePut(a); if (p) J.pot = p; else h.wait = 1; }); return; }
    partyGo(h, partyStation('fridge'), () => { a.partyHold = { t: 'ing', id: ing, cooked: false }; sfx('switch'); });
    return;
  }
  const from = info.from === 'cabinet' ? 'fridge' : info.from, rect = partyStation(from);
  partyGo(h, rect, () => { a.partyHold = { t: 'ing', id: ing, cooked: true }; sfx('switch'); });
}
const partyHasReady = dish => party.counter.some(c => c.item.t === 'box' && c.item.dish === dish);
function partyServeThink(h) {
  const a = h.a, hold = a.partyHold, isEldrin = partyActorId(a) === 'eldrin';
  if (hold && hold.t === 'dirty') { partyGo(h, partyStation('waste'), () => partyRecycle(a)); return; }
  if (hold && hold.t === 'box') {
    const g = party.guests.find(o => partyAccepts(o, hold) && (o.id !== 'avaren' || isEldrin));
    if (!g) { partyGo(h, partyStation('counter'), () => { if (!partyCounterPut(a)) h.wait = 1; }); return; }
    h.goal = { x: g.approach.x, y: g.approach.y, done: () => { if (partyAccepts(g, a.partyHold)) partyDeliver(g, a, a.partyHold); } }; return;
  }
  if (h.free && (h.gap = (h.gap == null ? PARTY.noahFreeGap : h.gap) - .3) > 0) { h.wait = .3; return; }   // 諾亞：偶爾才順手端一盤
  const open = party.counter.find(c => c.item.t === 'box' && c.item.dish && party.guests.some(o => partyAccepts(o, c.item) && (o.id !== 'avaren' || isEldrin)));
  if (open) { partyGo(h, partyStation('counter'), () => { if (party.counter.includes(open)) { partyCounterTake(a, open); h.gap = PARTY.noahFreeGap; if (h.free) partySay(a, h.trait.say); } }); return; }
  if (!h.free) {
    const d = party.dishesAtTable.find(o => o.dirty && !o.taken);
    if (d) { d.taken = true; const g = d.guest; h.goal = { x: g.approach.x, y: g.approach.y, done: () => { if (party.dishesAtTable.includes(d)) partyPickDirty(a, d); } }; return; }
  }
  h.wait = .6;
}
function partyActorStep(a, dt) {
  const g = party.guests.find(o => o.a === a); if (g) { partyGuestStep(g, dt); return true; }
  const h = party.helpers.find(o => o.a === a); if (h) { if (partyPlaying()) partyHelperStep(h, dt); else { a.moving = false; updateNpcTalk(a, dt); } return true; }
  if (party.stage !== 'play') { a.moving = false; return true; }   // 選幫手的時候大家先別動
  if (typeof inviteWander === 'function') { updateNpcTalk(a, dt); inviteWander(a, a.partyHome.x, a.partyHome.y, 120, partySpeed(a), dt); return true; }
  return false;
}

// ===== 每幀 =====
function partyUpdate(dt) {
  if (!partyPlaying() || !G || !G.player) return;
  party.time += dt;
  if (party.arrive.length && (party.arriveT -= dt) <= 0) { const g = party.arrive.shift(); party.arriveT = PARTY.arriveGap; g.state = 'walk'; g.a.x = g.door.x; g.a.y = g.door.y; }
  for (const p of party.pots) { p.t += dt; if (Math.random() < dt * 10) party.steam.push({ x: p.x + (Math.random() - .5) * 12, y: p.y - 10, vy: -20 - Math.random() * 14, life: .8, age: 0 }); }
  for (const s of party.steam) { s.age += dt; s.y += s.vy * dt; }
  party.steam = party.steam.filter(s => s.age < s.life);
  if (partyPickerEl && !partyNearStation('fridge', G.player.x, G.player.y, 70)) partyClosePicker();
  partyUpdateBars();
  const allDone = !party.arrive.length && party.guests.length && party.guests.every(g => g.state === 'done') && !party.dishesAtTable.some(d => !d.dirty);
  if (allDone || party.time >= PARTY.timeLimit) partyFinish();
}

// ===== 畫面（地圖上）=====
function partyDrawBox(c, item, x, y, s) {   // 還沒裝完的餐盤／碗：用簡單圖形，上面排已經放的食材
  c.save(); c.imageSmoothingEnabled = false;
  if (item.box === 'bowl') {
    c.fillStyle = '#eef3f6'; c.beginPath(); c.moveTo(x - s * .5, y - s * .1); c.lineTo(x + s * .5, y - s * .1); c.lineTo(x + s * .3, y + s * .42); c.lineTo(x - s * .3, y + s * .42); c.closePath(); c.fill();
    c.strokeStyle = '#3a4650'; c.lineWidth = 1; c.stroke(); c.fillStyle = '#7fb0d6'; c.fillRect(x - s * .48, y - s * .12, s * .96, 2);
  } else {
    c.fillStyle = '#f4f8fa'; c.strokeStyle = '#3a4650'; c.lineWidth = 1; c.beginPath(); c.ellipse(x, y + s * .1, s * .55, s * .34, 0, 0, Math.PI * 2); c.fill(); c.stroke();
    c.strokeStyle = '#7fb0d6'; c.beginPath(); c.ellipse(x, y + s * .1, s * .45, s * .26, 0, 0, Math.PI * 2); c.stroke();
  }
  item.ings.forEach((id, i) => { const im = partyImg(partyIng(id).img), q = s * .5; if (im.complete && im.naturalWidth) c.drawImage(im, x - q * .95 + i * q * .62, y - q * .75, q, q); });
  c.restore();
}
function partyDrawHeld(c, item, x, y, s) {
  if (!item) return;
  c.save(); c.imageSmoothingEnabled = false;
  const pic = src => { const im = partyImg(src); if (im.complete && im.naturalWidth) c.drawImage(im, x - s / 2, y - s / 2, s, s); };
  if (item.t === 'ing') { pic(partyIng(item.id).img); if (item.cooked && partyIng(item.id).cook) { c.fillStyle = '#58c26a'; c.beginPath(); c.arc(x + s * .42, y - s * .35, 4, 0, Math.PI * 2); c.fill(); } }
  else if (item.t === 'burnt') pic(PARTY.burntImg);
  else if (item.t === 'dirty') { partyDrawBox(c, { box: item.box, ings: [] }, x, y, s); c.fillStyle = 'rgba(120,80,40,.8)'; c.fillRect(x - 4, y, 2, 2); c.fillRect(x + 3, y + 2, 2, 2); }
  else if (item.dish) pic(partyDish(item.dish).img);
  else partyDrawBox(c, item, x, y, s);
  c.restore();
}
function partyDrawTableDish(d) {
  ctx.save(); ctx.imageSmoothingEnabled = false;
  if (d.dirty) partyDrawBox(ctx, { box: d.box, ings: [] }, d.x, d.y - 2, 22);
  else { const im = partyImg(d.img); if (im.complete && im.naturalWidth) ctx.drawImage(im, d.x - 14, d.y - 18, 28, 28); }
  ctx.restore();
}
function partyBar(c, x, y, w, k, col) {
  c.fillStyle = 'rgba(0,0,0,.6)'; c.fillRect(x - w / 2 - 1, y - 1, w + 2, 6);
  c.fillStyle = col; c.fillRect(x - w / 2, y, w * Math.max(0, Math.min(1, k)), 4);
}
const partyBarCol = k => k > .5 ? '#5fb35a' : k > .22 ? '#e0b03c' : '#d9553f';
function partyDraw(c) {
  if (party.stage === 'setup' && !party.stats) return;   // 還在轉場、餐廳還沒佈置好
  const now = performance.now() / 1000;
  c.save();
  for (const p of party.pots) {   // 爐口：火、食材、進度
    const done = partyPotDone(p), burnt = partyPotBurnt(p);
    c.fillStyle = burnt ? 'rgba(60,60,60,.5)' : 'rgba(255,150,50,.35)'; c.beginPath(); c.arc(p.x, p.y, 16, 0, Math.PI * 2); c.fill();
    for (let j = 0; j < 6; j++) { const a = j / 6 * Math.PI * 2 + now * 3; c.fillStyle = j % 2 ? '#5aaaff' : '#ffbe5a'; c.fillRect(p.x + Math.cos(a) * 8 - 1, p.y + Math.sin(a) * 3 - 3, 2, 3 + Math.random() * 2); }
    const im = partyImg(burnt ? PARTY.burntImg : partyIng(p.id).img);
    if (im.complete && im.naturalWidth) { c.imageSmoothingEnabled = false; c.drawImage(im, p.x - 12 + (done ? 0 : Math.sin(now * 30 + p.k)), p.y - 24, 24, 24); }
    if (!done) partyBar(c, p.x, p.y - 34, 28, p.t / p.cookTime, '#ffb35c');
    else if (!burnt) { partyBar(c, p.x, p.y - 34, 28, 1 - (p.t - p.cookTime) / p.burn, (p.t - p.cookTime) / p.burn > .55 ? (Math.floor(now * 6) % 2 ? '#ff4b35' : '#ffd24d') : '#58c26a'); }
    else { c.font = 'bold 11px "Microsoft JhengHei", sans-serif'; c.textAlign = 'center'; c.fillStyle = '#ff8f7a'; c.fillText('烤焦了', p.x, p.y - 30); }
  }
  for (const s of party.steam) { c.fillStyle = 'rgba(235,240,245,' + (.3 * (1 - s.age / s.life)) + ')'; c.beginPath(); c.arc(s.x, s.y, 2 + s.age * 6, 0, Math.PI * 2); c.fill(); }
  for (const g of party.guests) {   // 客人頭上：想吃什麼、等多久
    const a = g.a, y = a.y - 62;
    if (g.state === 'think') { c.font = 'bold 13px "Microsoft JhengHei", sans-serif'; c.textAlign = 'center'; c.fillStyle = '#fff'; c.fillText('…', a.x, y + 4); }
    if (g.state === 'order') {
      c.fillStyle = '#fff6c9'; c.strokeStyle = '#6d5a24'; c.lineWidth = 1.5; c.beginPath(); c.arc(a.x, y - 6, 9 + Math.sin(now * 5), 0, Math.PI * 2); c.fill(); c.stroke();
      c.font = 'bold 13px sans-serif'; c.textAlign = 'center'; c.fillStyle = '#6d5a24'; c.fillText('?', a.x, y - 1);
      const k = g.wait / PARTY.orderPatience; partyBar(c, a.x, y + 6, 26, k, partyBarCol(k));
    }
    if (g.state === 'food') { const k = g.wait / PARTY.foodPatience; const im = partyImg(partyDish(g.dish).img); c.imageSmoothingEnabled = false; if (im.complete && im.naturalWidth) c.drawImage(im, a.x - 11, y - 20, 22, 22); partyBar(c, a.x, y + 4, 26, k, partyBarCol(k)); }
  }
  partyDrawHeld(c, party.hold, G.player.x, G.player.y - 58, 26);
  for (const h of party.helpers) partyDrawHeld(c, h.a.partyHold, h.a.x, h.a.y - 58, 22);
  c.restore();
  if (partyPlaying() && !dialogueState && !partyPanelOpen) { const a = partyPlayerAction(); if (a && typeof drawInteractPrompt === 'function') drawInteractPrompt(a.x, a.y, a.label); }
}

// ===== 畫面（左上角訂單、計時）=====
let partyHudEl = null;
const partyTicketChip = id => '<span class="stack"><span class="ib"><img src="' + partyIng(id).img + '" alt="' + partyIng(id).name + '"></span>' + (partyIng(id).cook ? '<img class="fl" src="' + PARTY.stoveImg + '" alt="要煮">' : '<span class="fl"></span>') + '</span>';
function partyFace(id) {
  const set = (typeof sentrySprites !== 'undefined' && sentrySprites[id]) || (typeof wandererSprites !== 'undefined' && wandererSprites[id]);
  return (set && set.front && set.front[0] && set.front[0].src) || '';
}
function partyRenderHud() {
  if (!partyHudEl) {
    partyHudEl = document.createElement('div'); partyHudEl.id = 'partyHud';
    partyHudEl.innerHTML = '<div class="ph-top"><b>🎉 慶功宴</b><span class="ph-time"></span><span class="ph-stock"></span><button type="button" class="ph-end">提早結束</button></div><div class="ph-menu"></div><div class="ph-tickets"></div>';
    partyHudEl.querySelector('.ph-end').addEventListener('click', e => { e.currentTarget.blur(); partyFinish(); });
    document.getElementById('wrap').appendChild(partyHudEl);
  }
  partyHudEl.querySelector('.ph-stock').textContent = '餐盤 ' + party.stock.plate + '　碗 ' + party.stock.bowl;
  partyHudEl.querySelector('.ph-menu').textContent = '今日主菜：' + party.menu.map(id => partyDish(id).name).join('、');
}
function partyRenderTickets() {
  if (!partyHudEl) return;
  const open = party.guests.filter(g => g.state === 'food');
  partyHudEl.querySelector('.ph-tickets').innerHTML = open.map(g => {
    const d = partyDish(g.dish);
    return '<div class="ph-ticket" data-g="' + g.id + '"><div class="ph-bar"><i></i></div><div class="ph-who"><span class="ph-face" style="background-image:url(\'' + encodeURI(partyFace(g.id)) + '\')"></span>' + partyName(g.id) + '</div><img class="ph-dish" src="' + d.img + '" alt="' + d.name + '"><div class="ph-name">' + d.name + '</div><div class="ph-ings">' + d.ings.map(partyTicketChip).join('') + '</div></div>';
  }).join('');
}
function partyUpdateBars() {
  if (!partyHudEl) return;
  const left = Math.max(0, PARTY.timeLimit - party.time), m = Math.floor(left / 60), s = Math.floor(left % 60);
  partyHudEl.querySelector('.ph-time').textContent = '剩 ' + m + ':' + String(s).padStart(2, '0');
  for (const g of party.guests) {
    if (g.state !== 'food') continue;
    const bar = partyHudEl.querySelector('.ph-ticket[data-g="' + g.id + '"] .ph-bar i'); if (!bar) continue;
    const k = Math.max(0, g.wait / PARTY.foodPatience); bar.style.width = (k * 100) + '%'; bar.style.background = partyBarCol(k);
  }
}

// ===== 對話與面板 =====
let partyPanelOpen = false, partyPanelEl = null;
function partyPanel(html, bind) {
  partyClosePanel();
  const el = document.createElement('div'); el.id = 'partyPanel'; el.innerHTML = html; partyPanelEl = el; partyPanelOpen = true;
  Object.keys(keys).forEach(k => { keys[k] = false; });
  document.getElementById('wrap').appendChild(el);
  bind && bind(el);
}
function partyClosePanel() { if (partyPanelEl) partyPanelEl.remove(); partyPanelEl = null; partyPanelOpen = false; }
function partyTalk(text, choices) {   // 艾德林說一句話，下面是選項
  const face = partyFace('eldrin');
  partyPanel('<div class="pp-talk"><span class="ph-face big" style="background-image:url(\'' + encodeURI(face) + '\')"></span><div><b>' + partyName('eldrin') + '</b><p>' + text + '</p><div class="pp-btns">' + choices.map((c, i) => '<button type="button" data-i="' + i + '">' + c.label + '</button>').join('') + '</div></div></div>', el => {
    el.addEventListener('click', e => { const b = e.target.closest('[data-i]'); if (b) { sfx('button'); choices[+b.dataset.i].run(); } });
    el.querySelector('button').focus();
  });
  sfx('menu');
}
function partyAsk() {
  partyTalk(PARTY.lines.ask, [
    { label: '🎉 辦慶功宴', run: () => partyTalk(PARTY.lines.yes, [{ label: '走吧', run: () => { partyClosePanel(); partyGoToRestaurant(); } }]) },
    { label: '不辦', run: () => partyTalk(PARTY.lines.no, [{ label: '結束對話', run: partyClosePanel }]) },
  ]);
}
function partyGoToRestaurant() {
  const idx = mapList().findIndex(m => m && m.name === PARTY.mapName);
  if (idx < 0) { systemNotice('找不到餐廳地圖', true); return; }
  party.stage = 'setup'; party.stats = null;
  practiceTravel(() => {
    switchMap(idx); begin(false);
    if (typeof stairArmed !== 'undefined') stairArmed = false;
    Object.assign(party, { pots: [], steam: [], counter: [], dishesAtTable: [], guests: [], helpers: [], arrive: [], hold: null, time: 0, arriveT: 0, stock: { plate: PARTY.plates, bowl: PARTY.bowls }, stats: { served: 0, burnt: 0, late: 0, stolen: 0 } });
    party.menu = Object.keys(PARTY.dishes).sort(() => Math.random() - .5).slice(0, PARTY.menuSize);
    const [wx, wy] = center(...PARTY.start.winter); G.player.x = wx; G.player.y = wy; G.player.dir = 'back'; G.player.tray = null; G.player.sitting = null;
    const all = [...G.towers, ...G.npcs];
    const [ex, ey] = center(...PARTY.start.eldrin);
    const eldrin = all.find(a => partyActorId(a) === 'eldrin');
    if (eldrin) { eldrin.x = ex; eldrin.y = ey; eldrin.dir = 'front'; }
    partyBuildStations();
    const [dx, dy] = center(...PARTY.door);
    for (const a of all) { a.sitting = null; a.seatGoal = null; a.target = null; a.navPath = null; a.meal = null; a.partyHold = null; a.partyHome = { x: dx - CELL * 6, y: dy - CELL }; if (a !== eldrin) { a.x = dx; a.y = dy + CELL * 40; } }   // 其他人先在畫面外，等開始才走進來
    partyRenderHud();
    partyHelperPanel();
  });
}
function partyHelperPanel() {
  const ids = [...G.towers, ...G.npcs].map(partyActorId).filter(id => id !== 'eldrin' && id !== 'ball');
  const sel = { cook: null, serve: null };
  const render = () => {
    const col = (role, title) => '<div class="pp-col"><h4>' + title + '</h4><div class="pp-members">' + ids.map(id => '<button type="button" class="pp-m' + (sel[role] === id ? ' on' : '') + '" data-role="' + role + '" data-id="' + id + '"' + (sel[role === 'cook' ? 'serve' : 'cook'] === id ? ' disabled' : '') + '><span class="ph-face" style="background-image:url(\'' + encodeURI(partyFace(id)) + '\')"></span>' + partyName(id) + '</button>').join('') + '</div></div>';
    partyPanel('<div class="pp-card"><div class="pp-talk"><span class="ph-face big" style="background-image:url(\'' + encodeURI(partyFace('eldrin')) + '\')"></span><div><b>' + partyName('eldrin') + '</b><p>' + PARTY.lines.helper + '</p><small>艾德林固定幫忙端盤、收盤。可以再選一人煮飯、一人出餐，也可以不選。</small></div></div><div class="pp-cols">' + col('cook', '🍳 煮飯') + col('serve', '🍽️ 出餐') + '</div><p class="pp-menu">今日主菜：' + party.menu.map(id => partyDish(id).name).join('、') + '</p><div class="pp-btns"><button type="button" class="pp-go">開始！</button></div></div>', el => {
      el.addEventListener('click', e => {
        const m = e.target.closest('.pp-m');
        if (m && !m.disabled) { sel[m.dataset.role] = sel[m.dataset.role] === m.dataset.id ? null : m.dataset.id; sfx('button'); render(); return; }
        if (e.target.closest('.pp-go')) { sfx('button'); partyClosePanel(); partyBegin(sel); }
      });
    });
  };
  render();
}
function partyBegin(sel) {
  const all = [...G.towers, ...G.npcs], byId = id => all.find(a => partyActorId(a) === id);
  const [dx, dy] = center(...PARTY.door);
  const addHelper = (id, role, extra = {}) => { const a = byId(id); if (!a) return; party.helpers.push({ a, id, role, wait: 0, goal: null, job: null, trait: PARTY.helperTraits[id] || {}, ...extra }); if (a.y > dy + CELL) { a.x = dx; a.y = dy; } };
  addHelper('eldrin', 'serve');
  if (sel.cook) addHelper(sel.cook, 'cook');
  if (sel.serve) addHelper(sel.serve, 'serve');
  if (![sel.cook, sel.serve].includes('noah')) addHelper('noah', 'serve', { free: true });   // 諾亞沒被選到：偶爾順手端一盤
  const taken = new Set(party.helpers.map(h => h.id));
  const pool = all.map(partyActorId).filter(id => !taken.has(id) && id !== 'ball');
  const must = PARTY.mustGuests.filter(id => pool.includes(id)), rest = pool.filter(id => !must.includes(id)).sort(() => Math.random() - .5);
  const seats = mapSeats().filter(s => !s.bed && trayPosForSeat(s) && seatApproachPoint(s)).sort(() => Math.random() - .5);
  const guests = [...must, ...rest].slice(0, Math.min(PARTY.guestCount, seats.length));
  guests.forEach((id, i) => {
    const a = byId(id), seat = seats[i], approach = seatApproachPoint(seat);
    a.seatGoal = { seat, approach };   // 先佔位子
    const g = { a, id, seat, approach, state: 'outside', door: { x: dx, y: dy }, dish: null, wait: 0 };
    party.guests.push(g); party.arrive.push(g);
    a.x = dx; a.y = dy + CELL * 40;
  });
  for (const a of all) if (!party.guests.some(g => g.a === a) && !party.helpers.some(h => h.a === a) && a.y > dy + CELL) { a.x = dx; a.y = dy; }   // 不點餐的人：走進來在旁邊聊天
  party.stage = 'play'; partyRenderHud(); partyRenderTickets();
  systemNotice('慶功宴開始！到客人旁邊按空白鍵點餐');
}
function partyFinish() {
  if (party.stage !== 'play') return;
  party.stage = 'result'; partyClosePicker();
  let favor = 0;
  for (const g of party.guests) if (g.served && typeof favorPoints !== 'undefined') { favorPoints[g.id] = Math.max(0, (favorPoints[g.id] || 0) + PARTY.favorPerGuest); favor++; }
  const S = party.stats;
  partyPanel('<div class="pp-card"><div class="pp-talk"><span class="ph-face big" style="background-image:url(\'' + encodeURI(partyFace('eldrin')) + '\')"></span><div><b>' + partyName('eldrin') + '</b><p>' + PARTY.lines.end + '</p></div></div><ul class="pp-result"><li>送出餐點 <b>' + S.served + ' / ' + party.guests.length + '</b></li><li>烤焦 <b>' + S.burnt + '</b></li><li>讓人等太久 <b>' + S.late + '</b></li><li>被克莉思偷吃 <b>' + S.stolen + '</b></li><li>用時 <b>' + Math.round(party.time) + ' 秒</b></li><li>好感度 <b>' + favor + ' 人 +' + PARTY.favorPerGuest + '</b></li></ul><div class="pp-btns"><button type="button" class="pp-go">結束</button></div></div>', el => {
    el.querySelector('.pp-go').addEventListener('click', () => { sfx('button'); partyClosePanel(); partyLeave(); });
  });
}
function partyLeave() {   // 全部還原，重新佈置成平常的餐廳
  practiceTravel(() => {
    party.stage = null; party.guests = []; party.helpers = []; party.pots = []; party.counter = []; party.dishesAtTable = []; party.hold = null;
    if (partyHudEl) { partyHudEl.remove(); partyHudEl = null; }
    const idx = MAP_INDEX; switchMap(idx); begin(false);
    const [wx, wy] = center(...PARTY.start.winter); G.player.x = wx; G.player.y = wy;
    systemNotice('慶功宴結束，大家都回去了');
  });
}

// ===== 艾德林的對話按鈕：在作戰桌旁、沒有任務要報告時才出現 =====
function partyAskButton() {
  let b = document.getElementById('dialogueParty');
  if (!b && typeof dialogueOptions !== 'undefined' && dialogueOptions) {
    b = document.createElement('button'); b.id = 'dialogueParty'; b.type = 'button'; b.className = 'hidden'; b.textContent = '🎉 慶功宴';
    b.addEventListener('click', () => { closeDialogue(true); partyAsk(); });
    dialogueOptions.appendChild(b);
  }
  return b;
}
const partyOrigDialogueVitals = window.onDialogueOpenedVitals;
window.onDialogueOpenedVitals = function (actor) {
  if (partyOrigDialogueVitals) partyOrigDialogueVitals(actor);
  const b = partyAskButton(); if (!b) return;
  const eldrin = actor && partyActorId(actor) === 'eldrin';
  const brief = typeof missionBriefReady === 'function' && eldrin && missionBriefReady(actor);
  const near = eldrin && typeof missionTablePos === 'function' && typeof onBaseMap === 'function' && onBaseMap() && Math.hypot(actor.x - missionTablePos().x, actor.y - missionTablePos().y) < CELL * 10;
  b.classList.toggle('hidden', !(eldrin && near && !brief && !partyOn()));
};
const partyOrigTextDialogue = window.openTextDialogue;
window.openTextDialogue = function (...args) { document.getElementById('dialogueParty')?.classList.add('hidden'); return partyOrigTextDialogue.apply(this, args); };
[PARTY.stoveImg, PARTY.burntImg].forEach(partyImg);
