/* ===== 慶功宴：食堂出餐小遊戲（試玩版，設定在 data/party.js）=====
   流程：在作戰桌旁跟艾德林對話 →「🎉 慶功宴」→ 選要不要辦 → 轉場到餐廳 → 大家入座 → 點餐、打菜、出餐、回收 → 結算。
   ・溫特手上可以同時有：一個餐盤或碗，加上一樣食材。空白鍵／Enter 操作面向的東西，畫面會提示能做什麼。
   ・主餐：拿四格餐盤到打飯台打菜；有人要打飯台沒有的菜，就從冰箱拿生食去爐口煮。湯不能裝餐盤，要拿碗。
   ・裝錯：可以走到垃圾桶把餐盤倒空（盤子還在手上，算「浪費食物」）；也可以直接端給隊員，對方會吃，但滿意程度會下降。
   ・克莉思：隔一段時間會自己去開冰箱偷吃，走到她旁邊按互動鍵才能阻止。
   ・阿瓦倫：溫特送的餐他不收，被拒絕過一次之後，艾德林才會開始幫他裝餐、送餐。
   ・活動進行時才接管互動鍵和部分功能；活動結束就全部還原。
   必須在 js/game.js、js/meal.js、js/missions.js 之後載入。
*/
const party = { stage: null, guests: [], helpers: [], stations: {}, pots: [], steam: [], slots: [], dishesAtTable: [], foods: [], bowl: null, stats: null, time: 0, stock: { plate: 0, bowl: 0 }, arrive: [], arriveT: 0, avarenRefused: false, winterSay: null };
const partyOn = () => !!party.stage;
const partyPlaying = () => party.stage === 'play';
const partyActorId = a => a.kind === 'tower' ? a.type : a.id;
const partyName = id => (typeof CHARACTERS !== 'undefined' && CHARACTERS[id] && CHARACTERS[id].name) || (TYPES[id] && TYPES[id].name) || id;
const partyPick = list => list[Math.floor(Math.random() * list.length)];
const partyRand = ([a, b]) => a + Math.random() * (b - a);
const partyLine = (table, id) => partyPick(table[id] || table.default);
const partyImgs = {};
function partyImg(src) { if (!partyImgs[src]) { partyImgs[src] = new Image(); partyImgs[src].src = src; } return partyImgs[src]; }
const partySay = (a, text) => { if (a) a.say = { text, life: 3.2 }; };
const partyFood = id => PARTY.foods[id];

// ===== 活動進行中，暫時關掉其他互動（門、椅子、對話、商店…），人才不會端著菜走掉 =====
for (const name of ['interactionNearPlayer', 'seatNearPlayer', 'portalNearPlayer', 'elevatorNearPlayer', 'shopCounterNearPlayer', 'vendingNearPlayer', 'drinkShopNearPlayer', 'backroomShopNearPlayer', 'doorNearPlayer', 'toggleDoorNearPlayer', 'useStoragePropNearPlayer', 'useCampInteractionNearPlayer', 'pickupPropNearPlayer', 'usePosterNearPlayer', 'useNpcChatNearPlayer', 'updateNpcChats', 'tryStartMeal', 'npcChatStep', 'missionTableUsable', 'mealInviteAte', 'mapBoxNearPlayer']) {
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
  for (const d of party.dishesAtTable) list.push({ y: d.sortY, draw: () => partyDrawTableDish(d) });
  for (const s of party.slots) if (s.item) list.push({ y: s.y + 64, draw: () => partyDrawSlot(s) });   // 要排在桌子後面畫，才會在桌面上
};
const partyOrigSentry = window.updateSentry, partyOrigWanderer = window.updateWanderer;
window.updateSentry = function (t, dt) { if (partyOn() && t.hp > 0 && partyActorStep(t, dt)) return; partyOrigSentry(t, dt); };
window.updateWanderer = function (n, dt) { if (partyOn() && partyActorStep(n, dt)) return; partyOrigWanderer(n, dt); };

// ===== 工作站：從地圖上找出每種工作站的位置 =====
function partyBuildStations() {
  const out = {};
  for (const [kind, ids] of Object.entries(PARTY.tiles)) {
    const rects = mealStamps(ids);
    // 餐盤架的圖上半部是空的：判定範圍只算下半部，才不會擋到後面的東西
    out[kind] = kind === 'plate' ? rects.map(r => ({ ...r, y0: r.y0 + r.h / 2, h: r.h / 2, top: r.y0 + r.h / 2 })) : rects;
  }
  out.buffet = mealStamps(MEAL.buffetTiles);
  party.stations = out;
  const stove = out.stove && out.stove[0];
  if (stove) stove.aim = { x: burnerPos(stove.s, 1).x, y: stove.bottom + 20 };   // 爐灶：幫手站在爐口正前方
  party.reachable = partyReachableCells();
  party.slots = PARTY.slots.map(([x, y], k) => ({ k, x: OX + x, y: OY + y, item: null }));
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
function partyApproachPoint(px, py) {   // 走得到、離這一點最近的位置
  let best = null, bd = Infinity;
  for (const [c, r] of party.reachable) { const [x, y] = center(c, r), d = Math.hypot(x - px, y - py); if (d < bd) { bd = d; best = { x, y }; } }
  return best || { x: px, y: py };
}
function partyApproach(rect) {     // 走到這個工作站要站哪裡
  if (rect.approach) return rect.approach;
  if (rect.aim) return rect.approach = partyApproachPoint(rect.aim.x, rect.aim.y);
  let best = null, bd = Infinity;
  for (const [c, r] of party.reachable) {
    const [x, y] = center(c, r), d = mealDist(rect, x, y) + (y < rect.y0 && rect.h >= CELL * 2 ? 40 : 0);   // 優先站在物件前面
    if (d < bd) { bd = d; best = { x, y }; }
  }
  return rect.approach = best || { x: rect.x, y: rect.bottom + 10 };
}
const partyStation = kind => (party.stations[kind] || [])[0] || null;
const partyOrderReach = 92;   // 溫特離座位多近才能幫對方點餐、送餐（像素）
// 這個座位溫特走得到旁邊嗎？（有些座位被桌子和牆包住，站再近也碰不到，就不安排點餐）
const partySeatServable = s => party.reachable.some(([c, r]) => { const [x, y] = center(c, r); return Math.hypot(x - s.x, y - s.y) < partyOrderReach; });
function partyNearStation(kind, x, y, reach = 46) {
  let best = null, bd = reach;
  for (const r of party.stations[kind] || []) { const d = mealDist(r, x, y); if (d <= bd) { bd = d; best = r; } }
  return best;
}
const partyError = text => { sfx('error'); systemNotice(text, true); };

// ===== 打飯台的菜與點餐內容 =====
// 餐盤裡每一格＝{ key, file, rect, whole }（meal.js 畫餐盤用）；key：打飯台的菜＝'素材id#第幾盤'，現煮的＝grilledFish 這種食物 id
function partyPanFood(r, k) { const pan = panOf(r, k); return { key: pan.key, ...pan.food }; }
function partyBuffetKeys() {   // 地圖上現在打得到哪些菜（湯不算）
  return (party.stations.buffet || []).flatMap(r => MEAL.pans.map((_, k) => r.s.id + '#' + k)).filter(key => key !== PARTY.soupPan && dishOf(key));
}
function partyCookedFood(id) { const f = partyFood(id); return { key: id, file: f.img, rect: null, whole: true }; }
const partyKeyName = key => partyFood(key) ? partyFood(key).name : (dishOf(key) || {}).name || key;
// 打飯台上這道菜的左右位置（畫面上越右邊數字越大）；要現煮的菜不在打飯台上，一律排在最後
function partyMenuX(key) {
  if (partyFood(key)) return -1;
  const [id, k] = key.split('#'), r = (party.stations.buffet || []).find(o => o.s.id === id);
  return r ? panOf(r, +k).x : -1;
}
function partyMakeOrder(kind, id) {
  if (kind !== 'tray') return { type: kind };
  const n = Math.round(partyRand(PARTY.trayDishes)), cooked = Math.random() < PARTY.cookedChance;
  const pool = partyBuffetKeys().filter(key => !mealWontEat(id, key)).sort(() => Math.random() - .5), items = [];
  if (cooked) items.push(partyPick(['grilledFish', 'grilledLoofah']));
  while (items.length < n && pool.length) items.push(pool.shift());
  items.sort((a, b) => partyMenuX(b) - partyMenuX(a));   // 大家都照打飯台由右到左的順序點餐：台詞、訂單都跟著這個順序
  return { type: 'tray', items };
}
function partyPickAgain() {
  const list = Object.entries(PARTY.againKinds); let t = Math.random() * list.reduce((s, [, w]) => s + w, 0);
  for (const [k, w] of list) if ((t -= w) <= 0) return k;
  return 'tray';
}
const partyOrderName = o => o.type === 'tray' ? o.items.map(partyKeyName).join('、') : o.type === 'soup' ? '一碗湯' : partyFood(o.type).name;
function partyTrayMatches(tray, order) {
  if (!tray || tray.dirty || !order || order.type !== 'tray' || tray.foods.length !== order.items.length) return false;
  return order.items.every(k => tray.foods.some(f => f.key === k));
}

// ===== 手上的東西 =====
const partyTrayOf = who => who === 'player' ? G.player.tray : (who.meal && who.meal.tray) || null;
const partySetTray = (who, t) => { if (who === 'player') G.player.tray = t; else if (t) who.meal = { tray: t, stage: 'party' }; else who.meal = null; };
const partyBowlOf = who => who === 'player' ? party.bowl : who.partyBowl || null;
const partySetBowl = (who, b) => { if (who === 'player') party.bowl = b; else who.partyBowl = b; };
const partyHasBox = who => !!(partyTrayOf(who) || partyBowlOf(who));
function partyTakeBox(who, kind) {
  if (party.stock[kind] <= 0) { if (who === 'player') partyError(kind === 'plate' ? '餐盤用完了，要把髒盤拿去回收區' : '碗用完了，要把髒碗拿去回收區'); return false; }
  party.stock[kind]--; if (kind === 'plate') partySetTray(who, newTray()); else partySetBowl(who, { soup: false, dirty: false });
  sfx('switch'); partyRenderHud(); return true;
}
function partyReturnBox(kind) { party.stock[kind]++; if (kind === 'plate') G.player.tray = null; else party.bowl = null; sfx('place'); partyRenderHud(); }
function partyRecycle(who) {
  if (partyTrayOf(who)) { party.stock.plate++; partySetTray(who, null); } else { party.stock.bowl++; partySetBowl(who, null); }
  sfx('place'); partyRenderHud();
}
function partyAddToTray(tray, food) { tray.foods.push(food); sfx('blip'); }
// 溫特手上有煮好的菜又拿著餐盤：自動裝進去，不用再按一次。
// 不裝的情況：餐盤滿了、已經有這道菜、這盤已經剛好符合某人的訂單（裝下去反而弄錯）；烤焦的也不裝
function partyAutoFillTray() {
  const T = G.player.tray; if (!T || T.dirty) return;
  for (const id of [...party.foods]) {
    if (!partyFood(id).from || T.foods.length >= MEAL.maxDishes || T.foods.some(f => f.key === id)) continue;
    if (party.guests.some(g => g.state === 'food' && partyTrayMatches(T, g.order))) return;
    party.foods.splice(party.foods.indexOf(id), 1); partyAddToTray(T, partyCookedFood(id));
  }
}
// 煮：把手上的生食放上空的爐口
const partyBurners = () => { const r = partyStation('stove'); return r ? stoveBurners(r.s).map((_, k) => burnerPos(r.s, k)) : []; };
function partyStovePut(rawId, owner) {
  const used = new Set(party.pots.map(p => p.k)), list = partyBurners(), k = list.findIndex((_, i) => !used.has(i));
  if (k < 0) return null;
  const f = partyFood(rawId), pos = list[k], pot = { k, id: rawId, to: f.cookTo, t: 0, cookTime: f.cook, burn: PARTY.burnAfter, x: pos.x, y: pos.y, owner };
  party.pots.push(pot);
  if (typeof sfxAt === 'function') sfxAt('fireImpact', pos.x, pos.y, .25, 'cook-start');
  return pot;
}
const partyPotDone = p => p.t >= p.cookTime, partyPotBurnt = p => p.t >= p.cookTime + p.burn;
const partyTakePot = p => party.pots.splice(party.pots.indexOf(p), 1);
function partyTableSpot(g) {
  const pos = trayPosForSeat(g.seat);
  return pos ? { x: pos.x, y: pos.y, sortY: pos.sortY } : { x: g.seat.x, y: g.seat.y - 30, sortY: g.seat.y };
}

// ===== 客人 =====
function partyTakeOrder(g) {
  g.orderWait = party.time - (g.t0 == null ? party.time : g.t0); g.t0 = party.time;   // 等人來點餐等了幾秒；接著開始算等上菜
  g.order = partyMakeOrder(g.nextKind || 'tray', g.id); g.nextKind = null;
  g.state = 'food'; g.wait = g.waitMax = PARTY.foodPatience / partyNature(g.id).food; g.complained = false;   // 每個人耐心不同（waitMax＝等待條滿格是幾秒）
  if (g.order.type === 'tray') g.preview = { foods: g.order.items.map(k => partyFood(k) ? partyCookedFood(k) : partyPanFoodByKey(k)), left: 1, dirty: false };
  sfx('blip'); partySay(g.a, partyOrderName(g.order) + '，麻煩了！'); partyRenderTickets();
}
function partyPanFoodByKey(key) {
  const [id, k] = key.split('#'), r = (party.stations.buffet || []).find(o => o.s.id === id);
  if (r) return partyPanFood(r, +k);
  const t = mapTileById(id);   // 這台打飯台沒擺在地圖上：圖還是從素材庫截，訂單才有圖
  return { key, file: t ? t.file : '', rect: t ? MEAL.pans[+k] : [0, 0, 1, 1] };
}
// 這一餐的滿意度（0～100）：從這個人的最高分開始，等點餐太久、等上菜太久、送錯都會扣分（數字在 data/party.js 的 mood、natures）
const partyPart = (t, grace, patience) => Math.max(0, Math.min(1, (t - grace) / patience));
const partyNature = id => ({ ...PARTY.natureDefault, ...(PARTY.natures[id] || {}) });
function partyMealScore(id, orderWait, foodWait, wrong) {
  const M = PARTY.mood, n = partyNature(id);
  // 越沒耐心的人，越早開始扣、也越快扣滿（跟頭上等待條用同一個耐心）
  const orderLoss = M.orderPenalty * partyPart(orderWait, M.orderGrace / n.order, PARTY.orderPatience / n.order);
  const foodLoss = M.foodPenalty * partyPart(foodWait, M.foodGrace / n.food, PARTY.foodPatience / n.food);
  return Math.max(M.min, n.start - orderLoss - foodLoss - (wrong ? M.wrongPenalty * n.wrong : 0));
}
function partyServed(g, burnt, wrong) {
  (g.scores = g.scores || []).push(partyMealScore(g.id, g.orderWait || 0, party.time - (g.t0 == null ? party.time : g.t0), wrong));
  g.served = true; party.stats.served++; if (g.wait < 0) party.stats.late++;
  if (wrong) party.stats.wrong++;
  if (wrong) { g.a.say = null; flash(PARTY.lines.wrongFlash, g.a.x, g.a.y - 64, '#ff8f7a', 1.8, true); }   // 送錯了：被送餐的人頭上跳提示（先收掉剛才的對話泡泡才不會蓋住）
  else partySay(g.a, burnt ? PARTY.lines.burntOk : partyLine(PARTY.lines.thanks, g.id));
  sfx('pop'); g.order = null; g.preview = null; partyRenderTickets();
}
// 這樣東西是不是對方點的（雷德什麼都吃：烤焦的也不算送錯）
function partyIsWrong(g, who, what) {
  const o = g.order; if (!o) return false;
  if (what === 'tray') return !partyTrayMatches(partyTrayOf(who), o);
  if (what === 'bowl') return o.type !== 'soup';
  return !(what === o.type || (g.id === 'red' && what === 'burnt'));
}
// 把東西送到桌上：what＝'tray'／'bowl'／食物 id。回傳 true＝送到了
function partyDeliver(g, who, what) {
  if (g.id === 'avaren' && !(who !== 'player' && partyActorId(who) === 'eldrin')) {   // 阿瓦倫只吃艾德林拿來的
    partySay(g.a, PARTY.lines.refuse);
    if (who === 'player') {   // 被拒絕過一次之後，艾德林才會開始幫他裝餐（js 的 partyEldrinThink）
      sfx('error'); systemNotice(PARTY.lines.refuseNotice, true);
      party.avarenRefused = true; partyRenderTickets();
    }
    return false;
  }
  const hated = what === 'tray' && partyTrayOf(who).foods.find(f => mealWontEat(g.id, f.key));
  if (hated) { sfx('error'); partySay(g.a, PARTY.lines.wontEat.replace('{dish}', dishOf(hated.key).name)); return false; }
  const spot = partyTableSpot(g), wrong = partyIsWrong(g, who, what);
  if (what === 'tray') {
    const tray = partyTrayOf(who);
    if (trayAtSeat(g.seat) || !placeTrayAt(g.seat, tray, g.a)) { if (who === 'player') partyError('桌上還沒清空'); return false; }
    partySetTray(who, null);
    const t = trayAtSeat(g.seat); if (t) t.eating = true;
    g.state = 'eatTray';
  } else if (what === 'bowl') {
    partySetBowl(who, null);
    g.table = { ...spot, kind: 'bowl', guest: g, dirty: false }; party.dishesAtTable.push(g.table);
    g.state = 'snack'; g.eat = PARTY.snackTime;
  } else {
    if (who === 'player') party.foods.splice(party.foods.indexOf(what), 1);
    g.table = { ...spot, kind: 'food', img: partyFood(what).img, guest: g }; party.dishesAtTable.push(g.table);
    g.state = 'snack'; g.eat = PARTY.snackTime;
  }
  partyServed(g, what === 'burnt', wrong);
  return true;
}
function partyDirtyTrayOf(g) { const t = g.seat && trayAtSeat(g.seat); return t && t.dirty ? t : null; }
function partyPickDirty(who, g) {   // 收髒盤／髒碗到手上，直接拿去回收區
  const t = partyDirtyTrayOf(g);
  if (t) { mealTrays().splice(mealTrays().indexOf(t), 1); partySetTray(who, { foods: t.foods, left: 0, dirty: true }); sfx('switch'); return true; }
  if (g.table && g.table.kind === 'bowl' && g.table.dirty) { party.dishesAtTable.splice(party.dishesAtTable.indexOf(g.table), 1); g.table = null; partySetBowl(who, { soup: false, dirty: true }); sfx('switch'); return true; }
  return false;
}
const partyHasDirty = g => !!(partyDirtyTrayOf(g) || (g.table && g.table.kind === 'bowl' && g.table.dirty));
function partyWaste(n = 1) { party.stats.waste += n; }

// ===== 溫特按互動鍵會做什麼（也拿來畫提示）=====
function partyPlayerAction() {
  const p = G.player, T = p.tray, B = party.bowl, F = party.foods, near = (x, y, r) => Math.hypot(x - p.x, y - p.y) < r;
  // 工作站靠得很近：列出現在能做的動作，選溫特「面向的那一個」（身體前方一點的位置離誰最近）
  const face = { left: [-1, 0], right: [1, 0], back: [0, -1], front: [0, 1] }[p.dir] || [0, 1];
  const fx = p.x + face[0] * 26, fy = p.y + face[1] * 26, opts = [];
  const add = (r, label, run, y, bias = 0, x = r.x) => opts.push({ score: mealDist(r, fx, fy) + bias, label, x, y: y != null ? y : r.top - 4, run });
  const spot = (x, y, s = 14) => ({ x0: x - s, y0: y - s, w: s * 2, h: s * 2, x, top: y - s, bottom: y + s });
  const handsFree = !T && !B, tray = T && !T.dirty ? T : null, bowl = B && !B.dirty ? B : null;
  for (const g of party.guests) {
    if (g.sneak) {   // 克莉思跑去開冰箱：走到她旁邊才能阻止，這時候也不能幫她點餐、送餐
      if ((g.sneak.phase === 'go' || g.sneak.phase === 'eat') && near(g.a.x, g.a.y, 76)) add(spot(g.a.x, g.a.y), '阻止' + partyName(g.id) + '偷吃', () => partyStopSneak(g), g.a.y - 60, -30);
      continue;
    }
    if (!g.seat || !near(g.seat.x, g.seat.y, partyOrderReach)) continue;
    const here = spot(g.a.x, g.a.y), y = g.a.y - 60, nm = partyName(g.id);
    if (g.state === 'order') add(here, '幫' + nm + '點餐', () => partyTakeOrder(g), y);
    else if (g.state === 'food' && g.order) {
      // 手上能吃的東西都可以端過去，就算不是對方點的（會變成送錯餐）；有點對的就優先端點對的
      const gives = [];
      if (tray && tray.foods.length) gives.push({ what: 'tray', word: '送餐給' });
      if (bowl && bowl.soup) gives.push({ what: 'bowl', word: '送湯給' });
      for (const id of new Set(F)) if (!partyFood(id).cookTo) gives.push({ what: id, word: '拿' + partyFood(id).name + '給' });
      const give = gives.map(o => ({ ...o, wrong: partyIsWrong(g, 'player', o.what) })).sort((a, b) => a.wrong - b.wrong)[0];
      if (give) add(here, give.word + nm, () => partyDeliver(g, 'player', give.what), y, give.wrong ? 6 : 0);
    }
    if (handsFree && partyHasDirty(g)) add(here, '收髒盤', () => partyPickDirty('player', g), y, 4);
  }
  // 爐口
  const stove = partyNearStation('stove', p.x, p.y, 40);
  if (stove) {
    const raw = F.find(id => partyFood(id).cookTo);
    if (raw) { const pots = partyBurners().length; add(stove, party.pots.length < pots ? '放上爐口：' + partyFood(raw).name : '爐口都滿了', () => { if (party.pots.length >= pots) return partyError('爐口都在煮了'); if (partyStovePut(raw, 'player')) F.splice(F.indexOf(raw), 1); }); }
    for (const q of party.pots) {
      if (!partyPotDone(q)) continue;
      const r = spot(q.x, q.y, 18), yy = q.y - 44, to = partyFood(q.to);
      if (partyPotBurnt(q)) {
        if (F.length < PARTY.handLimit) add(r, '拿走烤焦的', () => { partyTakePot(q); F.push('burnt'); party.stats.burnt++; sfx('error'); }, yy);
      } else if (tray && tray.foods.length < MEAL.maxDishes && !tray.foods.some(f => f.key === q.to)) add(r, '裝進餐盤：' + to.name, () => { partyTakePot(q); partyAddToTray(tray, partyCookedFood(q.to)); }, yy);
      else if (F.length < PARTY.handLimit) add(r, '起鍋：' + to.name, () => { partyTakePot(q); F.push(q.to); sfx('blip'); }, yy);
    }
  }
  // 打飯台
  const pan = mealPanAt(p.x, p.y, 30);
  if (pan) {
    const r = spot(pan.x, pan.y, 16), nm = (dishOf(pan.key) || {}).name || '菜', isSoup = pan.key === PARTY.soupPan;
    // 下面的 -10：人都站在這盤前面了，比旁邊的空檯子優先（除非正面向後面的料理台）
    const yy = mealHeadY(p) - (F.length ? 26 : 0);   // 提示放在溫特頭上才不會擋到人和餐盤；手上有食材時（圖畫在頭上）再往上一點
    if (isSoup) {
      if (bowl && !bowl.soup) add(r, '裝湯', () => { bowl.soup = true; sfx('blip'); }, yy, -10, p.x);
      else if (tray) add(r, '湯要用碗裝', () => partyError('湯不能裝在餐盤裡，要拿碗'), yy, -10, p.x);
      else if (handsFree) add(r, nm + '：先拿碗', () => partyError('要先拿碗'), yy, 30, p.x);
    } else if (tray) {
      if (tray.foods.length >= MEAL.maxDishes) add(r, '餐盤裝滿了', () => partyError('餐盤最多裝 ' + MEAL.maxDishes + ' 樣菜'), yy, -10, p.x);
      else if (tray.foods.some(f => f.key === pan.key)) add(r, '已經裝過' + nm, () => partyError('這道菜裝過了'), yy, -10, p.x);
      else add(r, '裝' + nm + '（' + tray.foods.length + '/' + MEAL.maxDishes + '）', () => partyAddToTray(tray, partyPanFoodByKey(pan.key)), yy, -10, p.x);
    } else if (handsFree) add(r, nm + '：先拿餐盤', () => partyError('要先拿餐盤才能打菜'), yy, 30, p.x);
  }
  // 餐盤架、碗
  for (const kind of ['plate', 'bowl']) {
    const r = partyNearStation(kind, p.x, p.y, 44); if (!r) continue;
    const word = kind === 'plate' ? '餐盤' : '碗', mine = kind === 'plate' ? T : B;
    if (handsFree) add(r, '拿' + word + '（剩 ' + party.stock[kind] + '）', () => partyTakeBox('player', kind));
    else if (mine && mine.dirty) add(r, '髒' + word + '要拿去回收區', () => partyError('髒的要拿去回收區'), null, 20);
    else if (mine && ((kind === 'plate' && mine.foods.length) || (kind === 'bowl' && mine.soup))) add(r, word + '裡有東西', () => partyError(word + '裡有東西時不能放回去，先倒進垃圾桶'), null, 20);
    else if (mine) add(r, '放回' + word, () => partyReturnBox(kind));
  }
  // 暫放的空位
  for (const s of party.slots) {
    if (!near(s.x, s.y, 80)) continue;   // 料理台比較深，手可以伸遠一點
    const r = spot(s.x, s.y), yy = s.y - 22;
    if (s.item) {
      if (s.item.kind === 'food') { if (F.length < PARTY.handLimit) add(r, '拿起' + partyFood(s.item.id).name, () => { F.push(s.item.id); s.item = null; sfx('switch'); }, yy); }
      else if (handsFree) add(r, '拿起來', () => { if (s.item.kind === 'tray') p.tray = s.item.tray; else party.bowl = s.item.bowl; s.item = null; sfx('switch'); }, yy);
      else for (const id of F) if (s.item.kind === 'tray' && !s.item.tray.dirty && partyFood(id).from && s.item.tray.foods.length < MEAL.maxDishes && !s.item.tray.foods.some(f => f.key === id)) add(r, '放進餐盤：' + partyFood(id).name, () => { F.splice(F.indexOf(id), 1); partyAddToTray(s.item.tray, partyCookedFood(id)); }, yy);
    } else if (T) add(r, '暫放餐盤', () => { s.item = { kind: 'tray', tray: T }; p.tray = null; sfx('place'); }, yy);
    else if (B) add(r, '暫放碗', () => { s.item = { kind: 'bowl', bowl: B }; party.bowl = null; sfx('place'); }, yy);
    else if (F.length) { const id = F[0]; add(r, '暫放' + partyFood(id).name, () => { F.splice(F.indexOf(id), 1); s.item = { kind: 'food', id }; sfx('place'); }, yy); }   // 甜點、煮好的菜也能放
  }
  // 冰箱
  const fridge = partyNearStation('fridge', p.x, p.y);
  if (fridge) add(fridge, F.length ? '冰箱（拿取／放回）' : '打開冰箱', () => partyOpenPicker(), null, 8);   // 冰箱圖比較大：旁邊有其他東西時讓給它們
  // 回收區：髒盤、髒碗
  const waste = partyNearStation('waste', p.x, p.y);
  if (waste && ((T && T.dirty) || (B && B.dirty))) add(waste, '回收', () => partyRecycle('player'));
  // 垃圾桶：先丟手上的食材，再倒掉餐盤、碗裡的東西（盤子、碗不會消失）
  const trash = partyNearStation('trash', p.x, p.y, 40);
  if (trash) {
    if (F.length) add(trash, '丟掉手上的食材', () => { partyWaste(F.length); F.length = 0; sfx('place'); });
    else if (tray && tray.foods.length) add(trash, '倒掉餐盤裡的菜', () => { partyWaste(tray.foods.length); tray.foods = []; sfx('place'); });
    else if (bowl && bowl.soup) add(trash, '倒掉湯', () => { partyWaste(1); bowl.soup = false; sfx('place'); });
  }
  return opts.sort((a, b) => a.score - b.score)[0] || null;
}

// ---- 冰箱選單（數字鍵或點一下；0＝全部放回；走開就關掉）----
let partyPickerEl = null;
function partyOpenPicker() {
  partyClosePicker();
  const list = Object.keys(PARTY.foods).filter(id => partyFood(id).fridge);
  const back = party.foods.filter(id => partyFood(id).fridge);
  const el = document.createElement('div'); el.id = 'partyPicker'; partyPickerEl = el;
  el.innerHTML = '<b>冰箱</b>' + list.map((id, i) => '<button type="button" data-id="' + id + '"><i>' + (i + 1) + '</i><img src="' + partyFood(id).img + '" alt=""><span>' + partyFood(id).name + '</span>' + (partyFood(id).cookTo ? '<img class="fl" src="' + PARTY.stoveImg + '" alt="要煮">' : '') + '</button>').join('') +
    (back.length ? '<button type="button" class="pk-back" data-back="1"><i>0</i><span>放回冰箱</span><small>' + back.map(id => partyFood(id).name).join('、') + '</small></button>' : '');
  el.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; if (b.dataset.back) partyPutBack(); else partyPickFood(b.dataset.id); });
  document.getElementById('wrap').appendChild(el);
  el.dataset.list = list.join(',');
  sfx('menu');
}
function partyPickFood(id) {
  if (party.foods.length >= PARTY.handLimit) { partyError('手上最多拿 ' + PARTY.handLimit + ' 樣，先放回冰箱或丟進垃圾桶'); return; }
  party.foods.push(id); sfx('switch');
  if (party.foods.length >= PARTY.handLimit) partyClosePicker(); else partyOpenPicker();
}
function partyPutBack() {   // 冰箱的東西放回去不算浪費；煮過的、烤焦的放不回冰箱，要丟垃圾桶
  party.foods = party.foods.filter(id => !partyFood(id).fridge); sfx('place'); partyClosePicker();
}
function partyClosePicker() { if (partyPickerEl) { partyPickerEl.remove(); partyPickerEl = null; } }
window.addEventListener('keydown', e => {
  if (partyPickerEl && /^[0-9]$/.test(e.key)) {
    e.preventDefault(); e.stopImmediatePropagation();
    if (e.key === '0') { if (partyPickerEl.querySelector('[data-back]')) partyPutBack(); return; }
    const id = partyPickerEl.dataset.list.split(',')[+e.key - 1]; if (id) partyPickFood(id);
  } else if (partyPickerEl && e.key === 'Escape') { e.stopImmediatePropagation(); partyClosePicker(); }
  if (partyTalkLock && /^[1-9]$/.test(e.key)) { const b = dialogueOptions.querySelectorAll('.party-choice')[+e.key - 1]; if (b) { e.preventDefault(); e.stopImmediatePropagation(); b.click(); } }   // 選項可以按數字鍵
  if (partyPanelOpen && !(e.target instanceof HTMLButtonElement)) e.stopImmediatePropagation();   // 結算時按鍵不控制角色
}, true);

// ===== 客人每幀怎麼動 =====
const partySpeed = a => a.kind === 'tower' ? (TYPES[a.type].walkSpeed || 80) : 70;
function partySeatGuest(g) {
  const a = g.a;
  a.sitFrom = { x: a.x, y: a.y }; a.sitting = g.seat; a.seatGoal = null; a.navPath = null; a.target = null;
  a.x = g.seat.x; a.y = g.seat.y; a.dir = g.seat.dir; a.moving = false;
}
function partyWantMore(g) {   // 這個人決定再點一份
  g.again = (g.again || 0) + 1; g.nextKind = partyPickAgain();
  g.state = 'think'; g.t = partyRand(PARTY.againThink); g.complained = false; g.againSay = PARTY.lines.again[g.nextKind];
}
function partyAfterMeal(g) {   // 吃完（桌子也清空了）：可能追加，不然就結束
  if ((g.again || 0) < PARTY.againMax && Math.random() < PARTY.againChance) partyWantMore(g);
  else g.state = 'done';
  partyRenderTickets();
}
// ---- 節奏：不讓溫特閒著發呆 ----
// 溫特現在有沒有事可做：有人等點餐，或有人等餐而且還沒有做好的放在檯子上（阿瓦倫只吃艾德林拿的，不算溫特的事）
function partyPlayerHasWork() {
  return party.guests.some(g => g.state === 'order' || (g.state === 'food' && g.id !== 'avaren' && !party.slots.some(s => s.item && partySlotFits(s.item, g.order))));
}
// 找下一個人點餐：還在想的人馬上想好 → 坐著聊天的人也餓了 → 吃飽的人再追加（阿瓦倫、偷吃中的克莉思不找）
function partyCallNext() {
  const thinking = party.guests.find(g => g.state === 'think' && !g.sneak);
  if (thinking) { thinking.t = 0; return; }
  const chatters = [...G.towers, ...G.npcs].filter(a => a.partyChat && a.sitting && trayPosForSeat(a.partyChat.seat) && partySeatServable(a.partyChat.seat));
  if (chatters.length) {
    const a = partyPick(chatters), C = a.partyChat;
    a.partyChat = null;
    party.guests.push({ a, id: partyActorId(a), seat: C.seat, approach: C.approach, state: 'think', t: 0, order: null, wait: 0, again: 0, joined: true });
    return;
  }
  const full = party.guests.filter(g => g.state === 'done' && g.id !== 'avaren' && !g.sneak);
  if (full.length) { const g = partyPick(full); partyWantMore(g); g.t = 0; partyRenderTickets(); }
}
function partyGuestStep(g, dt) {
  const a = g.a;
  updateNpcTalk(a, dt);
  if (g.state === 'outside') { a.moving = false; return; }
  if (g.state === 'walk') {
    if (moveSentryWithPath(a, g.approach.x, g.approach.y, partySpeed(a) * 1.25, dt) || (a.navFailed && (g.fail = (g.fail || 0) + dt) > 2)) {
      partySeatGuest(g); g.state = 'think'; g.t = partyRand(PARTY.thinkTime);
    }
    return;
  }
  if (g.sneak) { partySneakStep(g, dt); return; }   // 克莉思正在偷吃（這段時間等餐的時間不會減少）
  if (g.id === PARTY.sneaker && (g.sneakCd = (g.sneakCd == null ? partyRand(PARTY.sneakGap) : g.sneakCd) - dt) <= 0 && ['think', 'order', 'food', 'done'].includes(g.state)) { partySneakStart(g); return; }
  a.x = g.seat.x; a.y = g.seat.y; a.dir = g.seat.dir; a.moving = false; a.sitting = g.seat;
  if (g.state === 'think') {
    if ((g.t -= dt) <= 0) { g.state = 'order'; g.wait = g.waitMax = PARTY.orderPatience / partyNature(g.id).order; g.t0 = party.time; sfx('blip'); if (g.againSay) { partySay(a, g.againSay); g.againSay = null; } }
  } else if (g.state === 'order') {
    g.wait -= dt;
    if (g.wait <= 0 && !g.complained) { g.complained = true; party.stats.late++; partySay(a, partyLine(PARTY.lines.complainOrder, g.id)); }
  } else if (g.state === 'food') {
    g.wait -= dt;
    if (g.wait <= 0 && !g.complained) { g.complained = true; partySay(a, partyLine(PARTY.lines.complainFood, g.id)); }
  } else if (g.state === 'eatTray') {
    const t = trayAtSeat(g.seat);
    if (!t) partyAfterMeal(g); else if (t.dirty) g.state = 'dirty';
  } else if (g.state === 'snack') {
    if ((g.eat -= dt) <= 0) {
      if (g.table && g.table.kind === 'bowl') { g.table.dirty = true; g.state = 'dirty'; }
      else { if (g.table) party.dishesAtTable.splice(party.dishesAtTable.indexOf(g.table), 1); g.table = null; partyAfterMeal(g); }
    }
  } else if (g.state === 'dirty') {
    if (!partyHasDirty(g)) partyAfterMeal(g);
  }
}
// 克莉思偷吃：走去開冰箱 → 站在那裡吃（這段時間溫特可以阻止）→ 走回座位
// phase：go＝走過去、eat＝正在吃、stopped＝被溫特念了、back＝走回座位
function partySneakStart(g) {
  const fridge = partyStation('fridge'); if (!fridge) { g.sneakCd = partyRand(PARTY.sneakGap); return; }
  const q = partyApproach(fridge), snacks = Object.keys(PARTY.foods).filter(id => partyFood(id).snack);
  npcStandUp(g.a); g.a.navPath = null;
  g.sneak = { phase: 'go', x: q.x, y: q.y, t: 0, fail: 0, food: partyPick(snacks) };
  partySay(g.a, partyPick(PARTY.lines.sneakGo)); systemNotice(PARTY.lines.sneakNotice);
}
function partySneakStep(g, dt) {
  const a = g.a, S = g.sneak, speed = partySpeed(a) * 1.25;
  const arrived = (x, y) => moveSentryWithPath(a, x, y, speed, dt) || (a.navFailed && (S.fail += dt) > 2);
  if (S.phase === 'go') {
    if (arrived(S.x, S.y)) { S.phase = 'eat'; S.t = PARTY.sneakEat; S.fail = 0; a.navPath = null; a.moving = false; a.dir = 'back'; sfx('switch'); partySay(a, partyPick(PARTY.lines.sneakEat)); }
  } else if (S.phase === 'eat') {
    a.moving = false;
    if ((S.t -= dt) <= 0) { party.stats.stolen++; sfx('pop'); partySay(a, partyPick(PARTY.lines.sneakDone)); S.phase = 'back'; S.fail = 0; a.navPath = null; }
  } else if (S.phase === 'stopped') {
    a.moving = false;
    if ((S.t -= dt) <= 0) { partySay(a, PARTY.lines.stopReply); S.phase = 'back'; S.fail = 0; a.navPath = null; }   // 溫特說完，克莉思才回話、走回座位
  } else if (arrived(g.approach.x, g.approach.y)) {
    partySeatGuest(g); g.sneak = null; g.sneakCd = partyRand(PARTY.sneakGap);
  }
}
function partyStopSneak(g) {
  const S = g.sneak; if (!S) return;
  party.winterSay = { text: PARTY.lines.stop, life: 2 };
  S.phase = 'stopped'; S.t = 1.1; g.a.navPath = null; g.a.moving = false; g.a.say = null;
  sfx('button');
}

// ===== 幫手：一步一步照計畫走（plan＝接下來要走去哪裡、到了做什麼）=====
const partyStep = (x, y, run) => ({ x, y, run });
const partyStepAt = (rect, run) => { const q = partyApproach(rect); return partyStep(q.x, q.y, run); };
// 走到打飯台某一盤的前面（key 像 tile_xxx#2：哪一台、第幾盤）
const partyStepAtPan = (key, run) => {
  const [id, k] = key.split('#'), r = party.stations.buffet.find(b => b.s.id === id), q = partyApproachPoint(panOf(r, +k).x, r.y0);
  return partyStep(q.x, q.y, run);
};
function partyHelperStep(h, dt) {
  const a = h.a; updateNpcTalk(a, dt);
  if (h.resting) {   // 坐著聊天（諾亞）：每 0.5 秒看一下有沒有要幫忙的，有就起身
    const S = h.seat.seat; a.x = S.x; a.y = S.y; a.dir = S.dir; a.moving = false; a.sitting = S;
    if ((h.wait -= dt) > 0) return;
    h.wait = .5; h.plan = null; h.think(h);   // 先清掉走回座位那份已經做完的清單，才不會被當成有事要做
    if (h.plan) { h.resting = false; npcStandUp(a); h.wait = 0; }
    return;
  }
  if (a.sitting) npcStandUp(a);
  // 艾德林手上沒拿東西時，檯子上一有做好的餐就放下手邊的事去端（正要去收髒盤、正要幫阿瓦倫裝餐都一樣）
  if (h.id === 'eldrin' && h.plan && !party.slots.some(s => s.claim === h) && !partyHasBox(a) && !a.partyFood) {
    const urgent = partySlotPlan(h, () => true);
    if (urgent) { h.plan = urgent; h.wait = 0; a.navPath = null; }
  }
  if (h.wait > 0) { h.wait -= dt; a.moving = false; return; }
  const st = h.plan && h.plan[0];
  if (!st) { h.plan = null; h.think(h); if (!h.plan && h.wait <= 0) h.wait = .5; return; }
  if (st.x == null || moveSentryWithPath(a, st.x, st.y, partySpeed(a) * 1.6, dt) || (a.navFailed && (st.fail = (st.fail || 0) + dt) > 1)) {
    a.navPath = null; a.moving = false;
    const r = st.run ? st.run() : true;   // run 回傳 false＝還不能往下，等一下再試
    if (r === false) { h.wait = .3; return; }
    h.plan.shift(); h.wait = .2;
  }
}
// 空檯子上放著做好的餐，又正好有人點這個：端過去。canServe＝這個幫手可以送給誰
const partySlotFits = (item, order) => item.kind === 'tray' ? partyTrayMatches(item.tray, order) : item.kind === 'food' ? !!(order && order.type === item.id) : !!(order && order.type === 'soup' && item.bowl.soup && !item.bowl.dirty);
function partySlotPlan(h, canServe) {
  const a = h.a;
  for (const s of party.slots) {
    if (!s.item || s.claim) continue;
    const item = s.item, g = party.guests.find(o => canServe(o) && o.state === 'food' && !o.sneak && partySlotFits(item, o.order));
    if (!g) continue;
    const q = partyApproachPoint(s.x, s.y); s.claim = h;   // 先佔著，另一個幫手才不會白跑一趟
    return [
      partyStep(q.x, q.y, () => {
        s.claim = null; if (s.item !== item) return;   // 溫特先拿走了
        if (item.kind === 'tray') a.meal = { tray: item.tray, stage: 'party' }; else if (item.kind === 'food') a.partyFood = item.id; else a.partyBowl = item.bowl;
        s.item = null; sfx('switch');
      }),
      partyStep(g.approach.x, g.approach.y, () => {
        if (!partyHasBox(a) && !a.partyFood) return;
        const what = partyTrayOf(a) ? 'tray' : a.partyBowl ? 'bowl' : a.partyFood;
        if (g.state === 'food' && partySlotFits(item, g.order) && partyDeliver(g, a, what)) { a.partyFood = null; return; }
        if (what === 'tray') partyWaste(partyTrayOf(a).foods.length); else partyWaste(1);   // 走到時對方已經有餐了：這份就浪費了
        if (partyHasBox(a)) partyRecycle(a);
        a.partyFood = null;
      }),
    ];
  }
  return null;
}
function partyEldrinThink(h) {   // 艾德林挑工作的順序：檯子上做好的餐（有人在等、一趟就好）→ 阿瓦倫拒絕過溫特之後幫他裝餐 → 收髒盤
  h.plan = partySlotPlan(h, () => true);
  if (h.plan) return;
  const a = h.a, ava = party.avarenRefused && party.guests.find(g => g.id === 'avaren' && g.state === 'food' && g.order);
  if (ava && partyEldrinHasBox(ava.order)) { h.plan = partyEldrinPlan(h, ava); return; }
  const g = party.guests.find(o => partyHasDirty(o) && !party.helpers.some(q => q !== h && q.target === o));
  if (g) {
    h.plan = [
      partyStep(g.approach.x, g.approach.y, () => { if (partyHasDirty(g)) partyPickDirty(a, g); }),
      partyStepAt(partyStation('waste'), () => { if (partyHasBox(a)) partyRecycle(a); }),
    ];
    return;
  }
  h.wait = .5;
}
// 要裝阿瓦倫這份，現在有沒有乾淨的餐盤或碗可以拿：沒有就先去收髒盤，不然大家都在等他回收
const partyEldrinHasBox = o => o.type === 'tray' ? party.stock.plate > 0 : o.type === 'soup' ? party.stock.bowl > 0 : true;
function partyEldrinPlan(h, g) {
  const a = h.a, o = g.order, steps = [], fridge = partyStation('fridge'), stove = partyStation('stove');
  const deliver = what => partyStep(g.approach.x, g.approach.y, () => { if (g.state === 'food') partyDeliver(g, a, what); else if (partyHasBox(a)) partyRecycle(a); a.partyFood = null; });
  if (partyFood(o.type)) return [partyStepAt(fridge, () => { a.partyFood = o.type; sfx('switch'); }), deliver(o.type)];
  const takeBox = kind => partyStepAt(partyStation(kind), () => { if (!partyTakeBox(a, kind)) { h.plan = []; return false; } });   // 走到時剛好被拿光：這趟取消，回頭重新挑工作
  if (o.type === 'soup') return [takeBox('bowl'), partyStepAtPan(PARTY.soupPan, () => { a.partyBowl.soup = true; sfx('blip'); }), deliver('bowl')];
  steps.push(takeBox('plate'));
  for (const key of o.items) {
    if (partyFood(key)) {   // 要現煮：冰箱拿生的 → 放上爐口 → 等煮好 → 裝進餐盤
      let pot = null; const raw = partyFood(key).from;
      steps.push(partyStepAt(fridge, () => { a.partyFood = raw; sfx('switch'); }));
      steps.push(partyStepAt(stove, () => { pot = partyStovePut(raw, a); if (!pot) return false; a.partyFood = null; }));
      steps.push({ x: null, run: () => pot && partyPotDone(pot) ? true : false });
      steps.push({ x: null, run: () => { if (party.pots.includes(pot)) partyTakePot(pot); partyAddToTray(partyTrayOf(a), partyCookedFood(key)); } });
    } else {
      const f = partyPanFoodByKey(key);
      steps.push(partyStepAtPan(key, () => partyAddToTray(partyTrayOf(a), f)));
    }
  }
  steps.push(deliver('tray'));
  return steps;
}
function partyNoahThink(h) {   // 諾亞：平常坐著聊天；空檯子上有做好的東西、艾德林又騰不出手時，才起身去端（阿瓦倫的不端）
  const a = h.a, eld = party.helpers.find(q => q.id === 'eldrin');
  const eldrinBusy = !eld || partyHasBox(eld.a) || !!eld.a.partyFood;   // 艾德林手上空著的話，他自己會馬上去端
  const plan = eldrinBusy ? partySlotPlan(h, o => o.id !== 'avaren') : null;
  if (plan) { h.plan = plan; partySay(a, PARTY.noahSay); return; }
  if (!h.resting && h.seat) h.plan = [partyStep(h.seat.approach.x, h.seat.approach.y, () => { partySeatGuest({ a, seat: h.seat.seat }); h.resting = true; })];   // 沒事：回座位
}
function partyActorStep(a, dt) {
  const g = party.guests.find(o => o.a === a); if (g) { partyGuestStep(g, dt); return true; }
  const h = party.helpers.find(o => o.a === a); if (h) { if (partyPlaying()) partyHelperStep(h, dt); else { a.moving = false; updateNpcTalk(a, dt); } return true; }
  if (party.stage !== 'play') { a.moving = false; return true; }   // 開場對話時大家先別動
  if (a.partyChat) {   // 沒點餐的人：輪到時從門口進來，走到分配的位子坐下，之後只聊天
    const C = a.partyChat; updateNpcTalk(a, dt);
    if (C.delay > 0) {
      C.delay -= dt; a.moving = false;
      if (C.delay <= 0) { a.x = C.door.x; a.y = C.door.y; }
      return true;
    }
    if (a.sitting) { a.x = C.seat.x; a.y = C.seat.y; a.dir = C.seat.dir; a.moving = false; }
    else if (moveSentryWithPath(a, C.approach.x, C.approach.y, partySpeed(a), dt) || (a.navFailed && (C.fail += dt) > 2)) partySeatGuest(C);
    return true;
  }
  if (typeof inviteWander === 'function') { updateNpcTalk(a, dt); inviteWander(a, a.partyHome.x, a.partyHome.y, 120, partySpeed(a), dt); return true; }
  return false;
}

// ===== 每幀 =====
function partyUpdate(dt) {
  if (!partyPlaying() || !G || !G.player) return;
  party.time += dt;
  partyAutoFillTray();
  if (party.winterSay && (party.winterSay.life -= dt) <= 0) party.winterSay = null;
  if (party.arrive.length && (party.arriveT -= dt) <= 0) { const g = party.arrive.shift(); party.arriveT = PARTY.arriveGap; g.state = 'walk'; g.a.x = g.door.x; g.a.y = g.door.y; }
  for (const p of party.pots) { p.t += dt; if (Math.random() < dt * 10) party.steam.push({ x: p.x + (Math.random() - .5) * 12, y: p.y - 10, vy: -20 - Math.random() * 14, life: .8, age: 0 }); }
  for (const s of party.steam) { s.age += dt; s.y += s.vy * dt; }
  party.steam = party.steam.filter(s => s.age < s.life);
  if (partyPickerEl && !partyNearStation('fridge', G.player.x, G.player.y, 70)) partyClosePicker();
  partyUpdateBars();
  const lastStretch = PARTY.timeLimit - party.time <= PARTY.idleStop;   // 快結束了：不再找人點餐
  party.idleT = party.arrive.length || partyPlayerHasWork() ? 0 : party.idleT + dt;
  if (party.idleT >= PARTY.idleGap && !lastStretch) { party.idleT = 0; partyCallNext(); }
  const allDone = !party.arrive.length && party.guests.length && party.guests.every(g => g.state === 'done');
  if ((allDone && lastStretch) || party.time >= PARTY.timeLimit) partyFinish();
}

// ===== 畫面（地圖上）=====
function partyDrawBowl(c, x, y, s, soup, dirty) {
  c.save();
  c.fillStyle = '#eef3f6'; c.strokeStyle = '#3a4650'; c.lineWidth = 1;
  c.beginPath(); c.moveTo(x - s * .5, y - s * .1); c.lineTo(x + s * .5, y - s * .1); c.lineTo(x + s * .3, y + s * .42); c.lineTo(x - s * .3, y + s * .42); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = soup ? '#d8b866' : dirty ? '#b9a98f' : '#cfdbe2'; c.beginPath(); c.ellipse(x, y - s * .1, s * .46, s * .13, 0, 0, Math.PI * 2); c.fill();
  c.restore();
}
function partyDrawFoodPic(c, id, x, y, s) { const im = partyImg(partyFood(id).img); if (im.complete && im.naturalWidth) { c.save(); c.imageSmoothingEnabled = false; const k = s / Math.max(im.naturalWidth, im.naturalHeight), w = im.naturalWidth * k, h = im.naturalHeight * k; c.drawImage(im, x - w / 2, y - h / 2, w, h); c.restore(); } }
function partyDrawSlot(s) { if (s.item.kind === 'tray') drawMealTray(ctx, s.x, s.y, s.item.tray, .8); else if (s.item.kind === 'food') partyDrawFoodPic(ctx, s.item.id, s.x, s.y - 4, 22); else partyDrawBowl(ctx, s.x, s.y, 20, s.item.bowl.soup, s.item.bowl.dirty); }
function partyDrawTableDish(d) {
  if (d.kind === 'bowl') partyDrawBowl(ctx, d.x, d.y, 20, !d.dirty, d.dirty);
  else { const im = partyImg(d.img); if (im.complete && im.naturalWidth) { ctx.save(); ctx.imageSmoothingEnabled = false; ctx.drawImage(im, d.x - 13, d.y - 15, 26, 26 * im.naturalHeight / im.naturalWidth); ctx.restore(); } }
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
    partyDrawFoodPic(c, burnt ? 'burnt' : done ? p.to : p.id, p.x + (done ? 0 : Math.sin(now * 30 + p.k)), p.y - 12, 24);
    if (!done) partyBar(c, p.x, p.y - 34, 28, p.t / p.cookTime, '#ffb35c');
    else if (!burnt) {
      const left = 1 - (p.t - p.cookTime) / p.burn;
      partyBar(c, p.x, p.y - 34, 28, left, left < .45 ? '#ff4b35' : '#58c26a');
      if (Math.floor(now * 5) % 2) {   // 煮好了、還沒燒焦：驚嘆號閃爍
        c.font = 'bold 22px "Microsoft JhengHei", sans-serif'; c.textAlign = 'center'; c.lineWidth = 4; c.strokeStyle = '#3b1208'; c.fillStyle = left < .45 ? '#ff5a3c' : '#ffd24d';
        c.strokeText('!', p.x, p.y - 40); c.fillText('!', p.x, p.y - 40);
      }
    } else { c.font = 'bold 11px "Microsoft JhengHei", sans-serif'; c.textAlign = 'center'; c.fillStyle = '#ff8f7a'; c.fillText('烤焦了', p.x, p.y - 30); }
  }
  for (const s of party.steam) { c.fillStyle = 'rgba(235,240,245,' + (.3 * (1 - s.age / s.life)) + ')'; c.beginPath(); c.arc(s.x, s.y, 2 + s.age * 6, 0, Math.PI * 2); c.fill(); }
  for (const g of party.guests) {   // 客人頭上：想吃什麼、等多久
    const a = g.a, y = a.y - 62;
    if (g.sneak) {   // 克莉思偷吃：頭上閃驚嘆號，吃的時候顯示手上的東西和還剩多久
      const S = g.sneak;
      if (S.phase === 'eat') { partyDrawFoodPic(c, S.food, a.x, y - 8, 22); partyBar(c, a.x, y + 6, 26, S.t / PARTY.sneakEat, '#ff4b35'); }
      if ((S.phase === 'go' || S.phase === 'eat') && Math.floor(now * 5) % 2) {
        c.font = 'bold 22px "Microsoft JhengHei", sans-serif'; c.textAlign = 'center'; c.lineWidth = 4; c.strokeStyle = '#3b1208'; c.fillStyle = '#ff5a3c';
        c.strokeText('!', a.x, y - 22); c.fillText('!', a.x, y - 22);
      }
      continue;
    }
    if (g.state === 'think') { c.font = 'bold 13px "Microsoft JhengHei", sans-serif'; c.textAlign = 'center'; c.fillStyle = '#fff'; c.fillText('…', a.x, y + 4); }
    if (g.state === 'order') {
      c.fillStyle = '#fff6c9'; c.strokeStyle = '#6d5a24'; c.lineWidth = 1.5; c.beginPath(); c.arc(a.x, y - 6, 9 + Math.sin(now * 5), 0, Math.PI * 2); c.fill(); c.stroke();
      c.font = 'bold 13px sans-serif'; c.textAlign = 'center'; c.fillStyle = '#6d5a24'; c.fillText('?', a.x, y - 1);
      const k = g.wait / g.waitMax; partyBar(c, a.x, y + 6, 26, k, partyBarCol(k));
    }
    if (g.state === 'food' && g.order) {
      const k = g.wait / g.waitMax;
      if (g.preview) drawMealTray(c, a.x, y - 8, g.preview, .6, false);
      else if (g.order.type === 'soup') partyDrawBowl(c, a.x, y - 8, 18, true);
      else partyDrawFoodPic(c, g.order.type, a.x, y - 8, 22);
      partyBar(c, a.x, y + 6, 26, k, partyBarCol(k));
    }
  }
  // 手上的食材、碗：頭上（餐盤 meal.js 會畫在胸前）
  const P = G.player;
  if (party.winterSay && typeof queueTowerBubble === 'function') queueTowerBubble(P, P.x, P.y - 50, party.winterSay.text);   // 溫特說話：跟隊員的泡泡畫在同一層
  party.foods.forEach((id, i) => partyDrawFoodPic(c, id, P.x + (party.foods.length > 1 ? i * 24 - 12 : 0), P.y - 62, 22));
  if (party.bowl) partyDrawBowl(c, P.x + 12, P.y + 2, 18, party.bowl.soup, party.bowl.dirty);
  for (const h of party.helpers) { if (h.a.partyFood) partyDrawFoodPic(c, h.a.partyFood, h.a.x, h.a.y - 62, 20); if (h.a.partyBowl) partyDrawBowl(c, h.a.x + 12, h.a.y + 2, 18, h.a.partyBowl.soup, h.a.partyBowl.dirty); }
  c.restore();
  if (partyPlaying() && !dialogueState && !partyPanelOpen && !partyPickerEl) { const a = partyPlayerAction(); if (a && typeof drawInteractPrompt === 'function') drawInteractPrompt(a.x, a.y, a.label); }
}

// ===== 畫面（左上角訂單、計時）=====
let partyHudEl = null;
function partyTicketChip(key) {
  const f = partyFood(key), flame = f && f.from ? '<img class="fl" src="' + PARTY.stoveImg + '" alt="要煮">' : '<span class="fl"></span>';
  if (f) return '<span class="stack"><span class="ib" title="' + f.name + '"><img src="' + f.img + '" alt="' + f.name + '"></span>' + flame + '</span>';
  const r = partyPanFoodByKey(key), [x, y] = r.rect;   // 打飯台的菜：直接截打飯台圖上那一盤
  return '<span class="stack"><span class="ib pan" title="' + partyKeyName(key) + '" style="background-image:url(\'' + encodeURI(r.file) + '\');background-position:-' + (x + 1) + 'px -' + (y + 1) + 'px"></span>' + flame + '</span>';
}
function partyFace(id) {
  const set = (typeof sentrySprites !== 'undefined' && sentrySprites[id]) || (typeof wandererSprites !== 'undefined' && wandererSprites[id]);
  return (set && set.front && set.front[0] && set.front[0].src) || '';
}
// 圓形小頭像；data-char 讓 css 可以替個別角色另外裁（球球是狗，頭不在圖的正上方）
const partyFaceTag = id => '<span class="ph-face" data-char="' + id + '" style="background-image:url(\'' + encodeURI(partyFace(id)) + '\')"></span>';
function partyRenderHud() {
  if (!partyHudEl) {
    partyHudEl = document.createElement('div'); partyHudEl.id = 'partyHud';
    partyHudEl.innerHTML = '<div class="ph-top"><b>🎉 慶功宴</b><span class="ph-time"></span><span class="ph-stock"></span><button type="button" class="ph-end">提早結束</button></div><div class="ph-tickets"></div>';
    partyHudEl.querySelector('.ph-end').addEventListener('click', e => { e.currentTarget.blur(); partyFinish(); });
    document.getElementById('wrap').appendChild(partyHudEl);
  }
  partyHudEl.querySelector('.ph-stock').textContent = '餐盤 ' + party.stock.plate + '　碗 ' + party.stock.bowl;
}
function partyRenderTickets() {
  if (!partyHudEl) return;
  const open = party.guests.filter(g => g.state === 'food' && g.order);
  partyHudEl.querySelector('.ph-tickets').innerHTML = open.map(g => {
    const o = g.order, who = '<div class="ph-who">' + partyFaceTag(g.id) + partyName(g.id) + '</div>';
    let body;
    if (o.type === 'tray') body = '<div class="ph-kind">四格餐盤</div><div class="ph-ings">' + o.items.map(partyTicketChip).join('') + '</div>';
    else if (o.type === 'soup') body = '<div class="ph-kind">一碗湯（要拿碗）</div><div class="ph-ings">' + partyTicketChip(PARTY.soupPan) + '</div>';
    else body = '<div class="ph-kind">' + partyFood(o.type).name + '（不用裝盤）</div><div class="ph-ings">' + partyTicketChip(o.type) + '</div>';
    return '<div class="ph-ticket" data-g="' + g.id + '"><div class="ph-bar"><i></i></div>' + who + body + (g.id === 'avaren' && party.avarenRefused ? '<div class="ph-note">艾德林會處理</div>' : '') + '</div>';
  }).join('');
}
function partyUpdateBars() {
  if (!partyHudEl) return;
  const left = Math.max(0, PARTY.timeLimit - party.time), m = Math.floor(left / 60), s = Math.floor(left % 60);
  partyHudEl.querySelector('.ph-time').textContent = '剩 ' + m + ':' + String(s).padStart(2, '0');
  for (const g of party.guests) {
    if (g.state !== 'food') continue;
    const bar = partyHudEl.querySelector('.ph-ticket[data-g="' + g.id + '"] .ph-bar i'); if (!bar) continue;
    const k = Math.max(0, g.wait / g.waitMax); bar.style.width = (k * 100) + '%'; bar.style.background = partyBarCol(k);
  }
}

// ===== 對話：直接用遊戲原本的對話框，選項放在對話框右邊那一欄 =====
let partyPanelOpen = false, partyPanelEl = null;
let partyTalkLock = false, partyTalkDone = null;
function partyClearChoices() {
  if (typeof dialogueOptions !== 'undefined' && dialogueOptions) { dialogueOptions.querySelectorAll('.party-choice').forEach(b => b.remove()); updateDialogueOptions(); }
  dialogueNext.style.display = '';
  partyTalkLock = false;
}
function partyTalk(text, choices, done) {   // 艾德林說一句話。choices＝選項按鈕；沒有選項時，按下一句關掉對話再做 done
  if (dialogueState) closeDialogue(true);
  partyClearChoices();
  partyTalkDone = done || null;
  openTextDialogue({ name: partyName('eldrin'), image: partyFace('eldrin'), lines: [text], kind: 'eldrin' });
  if (!choices) return;
  partyTalkLock = true; dialogueNext.style.display = 'none';   // 一定要選一個才會往下走
  choices.forEach(c => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'party-choice'; b.textContent = c.label;
    b.addEventListener('click', () => { sfx('button'); partyClearChoices(); partyTalkDone = null; closeDialogue(true); c.run(); });
    dialogueOptions.appendChild(b);
  });
  updateDialogueOptions();
}
const partyOrigCloseDialogue = window.closeDialogue;
window.closeDialogue = function (silent) {
  if (partyTalkLock) return;   // 還沒選選項：Space、Esc 都不會關掉對話
  partyOrigCloseDialogue(silent);
  const done = partyTalkDone; partyTalkDone = null;
  if (done) done();
};
function partyPanel(html, bind) {   // 結算卡片：樣式跟訓練室、開發工坊的卡片同一套（.workshop-card）
  partyClosePanel();
  const el = document.createElement('div'); el.id = 'partyPanel'; el.innerHTML = html; partyPanelEl = el; partyPanelOpen = true;
  Object.keys(keys).forEach(k => { keys[k] = false; });
  document.getElementById('wrap').appendChild(el);
  bind && bind(el);
}
function partyClosePanel() { if (partyPanelEl) partyPanelEl.remove(); partyPanelEl = null; partyPanelOpen = false; }
function partyAsk() {
  partyTalk(PARTY.lines.ask, [
    { label: '🎉 辦慶功宴', run: () => partyTalk(PARTY.lines.yes, null, partyGoToRestaurant) },
    { label: '不辦', run: () => partyTalk(PARTY.lines.no) },
  ]);
}
function partyGoToRestaurant() {
  const idx = mapList().findIndex(m => m && m.name === PARTY.mapName);
  if (idx < 0) { systemNotice('找不到餐廳地圖', true); return; }
  if (mapTransitioning) return;
  party.stage = 'setup'; party.stats = null;
  practiceTravel(() => {
    switchMap(idx); begin(false);
    if (typeof stairArmed !== 'undefined') stairArmed = false;
    Object.assign(party, { pots: [], steam: [], dishesAtTable: [], guests: [], helpers: [], arrive: [], foods: [], bowl: null, time: 0, arriveT: 0, idleT: 0, avarenRefused: false, winterSay: null, stock: { plate: PARTY.plates, bowl: PARTY.bowls }, stats: { served: 0, burnt: 0, late: 0, stolen: 0, waste: 0, wrong: 0 } });
    const [wx, wy] = center(...PARTY.start.winter); G.player.x = wx; G.player.y = wy; G.player.dir = 'back'; G.player.tray = null; G.player.sitting = null;
    const all = [...G.towers, ...G.npcs];
    const [ex, ey] = center(...PARTY.start.eldrin);
    const eldrin = all.find(a => partyActorId(a) === 'eldrin');
    if (eldrin) { eldrin.x = ex; eldrin.y = ey; eldrin.dir = 'front'; }
    partyBuildStations();
    const [dx, dy] = center(...PARTY.door);
    for (const a of all) { a.sitting = null; a.seatGoal = null; a.target = null; a.navPath = null; a.meal = null; a.partyFood = null; a.partyBowl = null; a.partyChat = null; a.partyHome = { x: dx - CELL * 6, y: dy - CELL }; if (a !== eldrin) { a.x = dx; a.y = dy + CELL * 40; } }   // 其他人先在畫面外，等開始才走進來
    partyRenderHud();
    partyTalk(PARTY.lines.ready, [{ label: '開始！', run: partyBegin }]);
  });
}
function partyBegin() {
  const all = [...G.towers, ...G.npcs], byId = id => all.find(a => partyActorId(a) === id);
  const [dx, dy] = center(...PARTY.door);
  const addHelper = (id, think) => { const a = byId(id); if (!a) return; party.helpers.push({ a, id, wait: 0, plan: null, think }); if (a.y > dy + CELL) { a.x = dx; a.y = dy; } };
  addHelper('eldrin', partyEldrinThink);
  addHelper('noah', partyNoahThink);   // 諾亞：坐著聊天，艾德林忙不過來時起身幫忙端
  const taken = new Set(party.helpers.map(h => h.id));
  const pool = all.map(partyActorId).filter(id => !taken.has(id) && id !== 'ball');
  const must = PARTY.mustGuests.filter(id => pool.includes(id)), rest = pool.filter(id => !must.includes(id)).sort(() => Math.random() - .5);
  const usable = mapSeats().filter(s => !s.bed && seatApproachPoint(s));
  const seats = usable.filter(s => trayPosForSeat(s) && partySeatServable(s)).sort(() => Math.random() - .5);
  const guests = [...must, ...rest].slice(0, Math.min(PARTY.guestCount, seats.length));
  guests.forEach((id, i) => {
    const a = byId(id), seat = seats[i], approach = seatApproachPoint(seat);
    a.seatGoal = { seat, approach };   // 先佔位子
    const g = { a, id, seat, approach, state: 'outside', door: { x: dx, y: dy }, order: null, wait: 0, again: 0 };
    party.guests.push(g); party.arrive.push(g);
    a.x = dx; a.y = dy + CELL * 40;
  });
  // 不點餐的人也都找位子坐著聊天，跟點餐的人穿插著進來。先坐溫特碰不到的位置，再坐剩下有桌子的，最後才是沒桌子的高腳椅
  const chatters = all.filter(a => partyActorId(a) !== 'ball' && !party.guests.some(g => g.a === a) && !party.helpers.some(h => h.a === a));
  const orderSeats = seats.slice(0, guests.length), freeSeats = usable.filter(s => !orderSeats.includes(s));
  const seatRank = s => !partySeatServable(s) ? 0 : trayPosForSeat(s) ? 1 : 2;
  freeSeats.sort((p, q) => seatRank(p) - seatRank(q));
  chatters.forEach((a, i) => {
    const seat = freeSeats[i]; if (!seat) return;
    const approach = seatApproachPoint(seat);
    a.seatGoal = { seat, approach };
    a.partyChat = { a, seat, approach, fail: 0, delay: PARTY.arriveGap * (i + .5), door: { x: dx, y: dy } };
  });
  const noah = party.helpers.find(h => h.id === 'noah'), noahSeat = freeSeats[chatters.length];   // 諾亞也留一個位子，沒事就坐著聊天
  if (noah && noahSeat) { noah.seat = { seat: noahSeat, approach: seatApproachPoint(noahSeat) }; noah.a.seatGoal = noah.seat; }
  for (const a of all) if (!party.guests.some(g => g.a === a) && !party.helpers.some(h => h.a === a) && !a.partyChat && a.y > dy + CELL) { a.x = dx; a.y = dy; }   // 球球不坐椅子，直接進來走動
  party.stage = 'play'; partyRenderHud(); partyRenderTickets();
  systemNotice('慶功宴開始！客人頭上出現問號時，走過去按空白鍵點餐');
}
// 每個來的人這次的滿意程度（0～100），高的排前面
// 有點餐的人：每一餐分數的平均，時間到還沒吃到的那一餐算很低分；只在旁邊聊天、幫忙的人：看點餐的人平均被扣了多少（氣氛），再看他多在意
function partyMoods() {
  const M = PARTY.mood, avg = list => list.reduce((s, v) => s + v, 0) / list.length, byId = {};
  // 吃不到的分數也看個性：越沒耐心掉越多（score＝這種情況對普通人來說算幾分）
  const hungry = (id, score) => { const n = partyNature(id); return Math.max(M.min, n.start - (100 - score) * Math.min(1, n.food)); };
  for (const g of party.guests) {
    const list = [...(g.scores || [])], waiting = g.state === 'order' || g.state === 'food';
    // 時間到時才剛點餐、還沒等超過這個人的耐心：不算沒吃到（結束前才點的，來不及做不是溫特的錯）
    const justAsked = waiting && party.time - (g.t0 == null ? party.time : g.t0) <= M.foodGrace / partyNature(g.id).food;
    if (waiting && !justAsked) list.push(hungry(g.id, M.unserved));
    if (list.length) byId[g.id] = avg(list);
    else if (!justAsked && !g.joined) byId[g.id] = hungry(g.id, M.noMeal);   // 本來就排定要點餐，卻一餐都沒吃到
    // 其他情況（半路才加入、一餐都還沒吃到）：分數跟旁邊聊天的人一樣算
  }
  const rated = party.guests.filter(g => byId[g.id] != null);
  const loss = rated.length ? avg(rated.map(g => partyNature(g.id).start - byId[g.id])) : 100 - M.noMeal;
  const onlooker = id => { const n = partyNature(id); return Math.max(M.min, n.start - loss * n.food * .6); };
  return [...G.towers, ...G.npcs].map(partyActorId).map(id => ({ id, mood: Math.round(byId[id] == null ? onlooker(id) : byId[id]) })).sort((a, b) => b.mood - a.mood);
}
function partyCommentOf(m) {   // 依滿意程度挑這個人的評語（data/party.js 的 comments）
  const M = PARTY.mood, set = PARTY.comments[m.id] || PARTY.comments.default;
  return set[m.mood >= M.high ? 'high' : m.mood >= M.mid ? 'mid' : 'low'];
}
function partyToggleComment(el, btn, m) {   // 看評語：小視窗跳在按鈕旁邊，再按一次或點別的地方就關掉
  const old = el.querySelector('.pm-comment'), same = old && old.dataset.id === m.id;
  if (old) old.remove();
  if (same) return;
  sfx('menu');
  const c = document.createElement('div'); c.className = 'pm-comment'; c.dataset.id = m.id;
  c.innerHTML = '<div class="pm-comment-who">' + partyFaceTag(m.id) + partyName(m.id) + '</div><p>' + partyCommentOf(m) + '</p>';
  el.appendChild(c);
  // 位置：放在按鈕下面，下面放不下就放上面（畫面可能有縮放，所以要換算）
  const P = el.getBoundingClientRect(), B = btn.getBoundingClientRect(), k = P.width / el.offsetWidth || 1;
  let x = (B.right - P.left) / k - c.offsetWidth, y = (B.bottom - P.top) / k + 5;
  if (y + c.offsetHeight > el.clientHeight - 8) y = (B.top - P.top) / k - c.offsetHeight - 5;
  c.style.left = Math.max(8, x) + 'px'; c.style.top = Math.max(8, y) + 'px';
}
function partyFinish() {
  if (party.stage !== 'play') return;
  party.stage = 'result'; partyClosePicker();
  const fans = party.guests.filter(g => g.served);
  if (typeof favorPoints !== 'undefined') for (const g of fans) favorPoints[g.id] = Math.max(0, (favorPoints[g.id] || 0) + PARTY.favorPerGuest);
  const S = party.stats, moods = partyMoods();
  if (typeof addStat === 'function' && moods.every(m => m.mood >= PARTY.mood.high)) addStat('partyAllHappy');   // 成就：全場都滿意
  const row = (k, v) => '<li><span>' + k + '</span><b>' + v + '</b></li>';
  // 好感度：滑鼠移過去才列出是誰加的
  const favorTip = fans.length ? fans.map(g => '<span>' + partyName(g.id) + ' <b>+' + PARTY.favorPerGuest + '</b></span>').join('') : '<span>這次沒有人加好感度</span>';
  const favorRow = '<li class="party-favor" tabindex="0"><span>好感度</span><b>' + fans.length + ' 人各 +' + PARTY.favorPerGuest + '</b><div class="party-favor-tip">' + favorTip + '</div></li>';
  const moodRows = moods.map(m => '<li>' + partyFaceTag(m.id) + '<span class="pm-name">' + partyName(m.id) + '</span><span class="pm-bar" title="滿意程度 ' + m.mood + '%"><i style="width:' + m.mood + '%"></i></span><button type="button" class="pm-btn" data-id="' + m.id + '">看評語</button></li>').join('');
  partyPanel('<section class="workshop-card practice-card party-card" role="dialog" aria-modal="true" aria-label="慶功宴結算"><header class="workshop-head"><div class="workshop-title"><small>1F 餐廳・慶功宴</small><h2>慶功宴結算</h2><p>' + PARTY.lines.end + '</p></div></header><div class="workshop-body practice-body"><ul class="party-result">' +
    row('送出餐點', S.served) + row('浪費食物', S.waste) + row('烤焦', S.burnt) + row('讓人等太久', S.late) + row('被克莉思偷吃', S.stolen) + row('用時', Math.round(party.time) + ' 秒') + favorRow + row('送錯餐的次數', S.wrong) +
    '</ul><h3>大家的滿意程度</h3><ul class="party-moods">' + moodRows + '</ul><div class="pr-actions"><button type="button" class="ws-btn pp-go">結束</button></div></div></section>', el => {
    el.querySelector('.pp-go').addEventListener('click', () => { sfx('button'); partyClosePanel(); partyLeave(); });
    el.addEventListener('click', e => {
      const b = e.target.closest('.pm-btn');
      if (b) { partyToggleComment(el, b, moods.find(m => m.id === b.dataset.id)); return; }
      if (!e.target.closest('.pm-comment')) el.querySelector('.pm-comment')?.remove();
    });
  });
}
function partyLeave() {   // 全部還原，重新佈置成平常的餐廳
  practiceTravel(() => {
    party.stage = null; party.guests = []; party.helpers = []; party.pots = []; party.slots = []; party.dishesAtTable = []; party.foods = []; party.bowl = null;
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
Object.values(PARTY.foods).forEach(f => partyImg(f.img));
partyImg(PARTY.stoveImg);
