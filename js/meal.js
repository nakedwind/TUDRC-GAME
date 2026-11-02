// ============================================================
//  餐廳吃飯：拿餐盤 → 打飯區裝菜（最多 4 樣）→ 坐下放在桌上 →「開動！」4 秒吃完 → 髒盤拿去回收區（或直接離開）
//  ・溫特：右邊的餐盤架按互動鍵拿餐盤（拿錯了：還沒吃過的餐盤回到餐盤架按互動鍵＝「放回餐盤」）；打飯台按互動鍵＝把最靠近的那盤菜裝進去（同一道不能裝兩次）；
//    拿著有菜的餐盤到有桌子的椅子按互動鍵＝坐下並把餐盤放在桌上；坐著按互動鍵＝「開動！」（每秒少 1/4，4 秒吃完）；
//    吃完起身，桌上的髒盤可以收起來拿去回收區，或直接走掉（換地圖再回來，桌上的髒盤就不見了：桌上的餐盤只存在這一趟）
//  ・NPC（基地的人、隊員）：閒逛時有機率自己去吃一輪，一定會把髒盤拿去回收
//  ・美術沿用現有的圖：菜＝打飯台圖上三個菜盤裡的菜（截下來縮小），餐盤用程式畫（2×2 四格）
// ============================================================
const MEAL = {
  trayTiles: ['tile_restaurant_tray_stack'],                                              // 餐盤架
  trayReach: 44,       // 餐盤架放在出菜台後面：從客人那一側伸手拿，判定範圍比較大（px）
  buffetTiles: ['tile_restaurant_buffet_counter_01', 'tile_restaurant_buffet_counter_02', 'tile_musg7iyr'],   // 打飯台（每台三盤菜）
  pans: [[32, 22, 26, 24], [71, 22, 26, 24], [110, 22, 26, 24]],                          // 三盤菜在打飯台圖片上的位置（圖 160×80：左、上、寬、高）
  panImg: [160, 80],
  wasteTiles: ['tile_restaurant_waste_sorting_station'],                                  // 回收區
  tableTiles: ['tile_musc5wyq', 'tile_restaurant_partition_tall'],                        // 桌子：椅子前面是這些桌子才放得了餐盤
  // 桌面上放餐盤不會碰到道具、也不會超出桌邊的位置（桌子圖片的像素）；w、h＝餐盤在這張桌上佔多大（側面的桌子餐盤是直放）
  tableSpots: {
    tile_musc5wyq: { w: 32, h: 22, spots: [[36, 18], [124, 18], [36, 46], [78, 46], [124, 46]] },   // 長桌：調味瓶、面紙盒、筷筒在 x 52～106、y 4～34
    tile_restaurant_partition_tall: { w: 22, h: 32, spots: [[24, 20], [24, 54], [24, 205], [55, 20], [55, 56], [55, 92], [55, 128], [55, 164], [55, 200]] },   // 左邊的直桌：桌面 x 12～67，道具排在 x 22～41、y 74～180
  },
  // 餐盤要在桌子和桌上道具的中間：畫完餐盤，再把道具疊回去
  bakedProps: { tile_musc5wyq: { rect: [48, 2, 62, 34], surface: [24, 44] } },   // 長桌的道具畫死在桌子圖裡：rect＝道具的範圍，surface＝拿來當桌面底色的那一點（跟它同色的就是桌面，不疊回去）
  propTiles: ['tile_restaurant_condiment_bottles', 'tile_restaurant_napkin_holder', 'tile_restaurant_chopsticks_holder'],   // 另外擺在桌上的道具素材
  trayOnTable: { back: [0, -40], front: [0, 34], right: [28, -8], left: [-28, -8] },     // 坐下時餐盤放在哪（從座位往哪邊移，依坐的方向）
  trayArt: { file: 'images/餐廳/restaurant-tray-stack.png', crop: [2, 35, 36, 24], slots: [[6, 39, 8, 6], [19, 39, 15, 6], [6, 48, 17, 9], [28, 48, 6, 9]] },   // 餐盤：截餐盤架最上面那一個（圖片像素：左、上、寬、高）；四格＝左上小格、右上長格、左下長格、右下小格
  carryY: 4,           // 拿在手上時餐盤的高度（從角色的 y 往下幾 px；角色圖是 y-46～y+18，頭很大，胸前大約在 y+4）
  takeLine: '有吃飯，才有力氣工作。',   // 拿起餐盤時溫特說的話
  fullLine: '感覺現在活力充沛。',       // 吃完後溫特頭上的泡泡（「吃飽了！」消失才出現）
  fullFlash: 1.2,      // 「吃飽了！」停留幾秒
  maxDishes: 4,
  eatTime: 4,          // 幾秒吃完（每秒少 1/4）
  npc: { chance: .6, firstCd: [3, 15], cooldown: [60, 150], stop: .6, dishes: [2, 4], linger: [2, 5] },   // NPC：去吃的機率、第一次／之後多久才會再吃（秒）、每站停幾秒、裝幾樣、吃完再坐幾秒
};
// ---- 打飯台上的菜：名稱、吃了有什麼加成（⚠️ 2026-11-02 Claude 擬的，等使用者確認）----
// 每台三盤，順序＝圖上由左到右。加成：guard 減傷、rate 射速、speed 移速（小數，.05＝5%）；一盤裡的菜加起來就是這一餐的加成
const MEAL_DISHES = {
  tile_restaurant_buffet_counter_01: [
    { name: '滷肉丸', eff: { guard: .06 } },
    { name: '炒青菜', eff: { speed: .04 } },
    { name: '三色豆', eff: { speed: .05 } },
  ],
  tile_restaurant_buffet_counter_02: [
    { name: '咖哩', eff: { rate: .06 } },
    { name: '白飯', eff: { guard: .04 } },
    { name: '例湯', eff: { guard: .03, speed: .02 } },
  ],
  tile_musg7iyr: [
    { name: '饅頭', eff: { guard: .04 } },
    { name: '烤地瓜', eff: { speed: .03, rate: .02 } },
    { name: '炸雞腿', eff: { rate: .08 } },
  ],
};
const MEAL_EFF = { guard: { name: '減傷', color: '#ffd27a' }, rate: { name: '射速', color: '#ffe066' }, speed: { name: '移速', color: '#9ff0c0' } };
const dishOf = key => { const [id, k] = String(key || '').split('#'); return (MEAL_DISHES[id] || [])[+k] || null; };
const mealImgs = {};
function mealImg(src) { if (!mealImgs[src]) { mealImgs[src] = new Image(); mealImgs[src].src = src; } return mealImgs[src]; }
const mealTrays = () => G.mealTrays || (G.mealTrays = []);   // 桌上的餐盤（G 換地圖就重建：沒收的髒盤自己消失）
// ---- 地圖上的東西 ----
function mealStampRect(s) {
  const t = mapTileById(s.id), w = mapStampW(s, t) * CELL, h = mapStampH(s, t) * CELL;
  const x0 = OX + s.c * CELL + (s.ox || 0), y0 = OY + s.r * CELL + (s.oy || 0);
  return { s, t, x0, y0, w, h, x: x0 + w / 2, top: y0, bottom: y0 + h };
}
const mealStamps = ids => ((MAP && MAP.stamps) || []).filter(s => ids.includes(s.id) && mapTileById(s.id)).map(mealStampRect);
const mealMapReady = () => !!MAP && MAP_SAFE && mealStamps(MEAL.trayTiles).length && mealStamps(MEAL.buffetTiles).length && mealStamps(MEAL.wasteTiles).length;
// 離某個東西多近（量到圖的外框）
const mealDist = (r, x, y) => Math.hypot(Math.max(r.x0 - x, 0, x - (r.x0 + r.w)), Math.max(r.y0 - y, 0, y - (r.y0 + r.h)));
function mealNear(ids, x, y, reach = 30) {
  let best = null, bd = reach;
  for (const r of mealStamps(ids)) { const d = mealDist(r, x, y); if (d <= bd) { bd = d; best = r; } }
  return best;
}
// 打飯台上第 k 盤菜：在地圖上的中心、拿來畫的圖片範圍
function panOf(r, k) {
  const [px, py, pw, ph] = MEAL.pans[k], sx = r.w / MEAL.panImg[0], sy = r.h / MEAL.panImg[1];
  const u = (px + pw / 2) * sx;
  return { x: r.x0 + (r.s.fx ? r.w - u : u), y: r.y0 + (py + ph / 2) * sy, food: { file: r.t.file, rect: MEAL.pans[k] }, key: r.s.id + '#' + k };
}
const nearestPan = (r, x) => MEAL.pans.map((_, k) => panOf(r, k)).reduce((a, b) => Math.abs(b.x - x) < Math.abs(a.x - x) ? b : a);
// 椅子前面有沒有桌子：有就回傳餐盤要放的位置
// 一個位子的編號：長椅（卡座）的 key 整條都一樣，要加上座位的位置才分得開
const seatIdOf = seat => seat.key + '@' + Math.round(seat.x) + ',' + Math.round(seat.y);
function trayPosForSeat(seat) {
  const off = MEAL.trayOnTable[seat.dir] || MEAL.trayOnTable.back, x = seat.x + off[0], y = seat.y + off[1];
  const table = mealStamps(MEAL.tableTiles).find(r => x >= r.x0 && x <= r.x0 + r.w && y >= r.y0 && y <= r.y0 + r.h);
  if (!table) return null;
  const sortY = table.bottom + .3, cfg = MEAL.tableSpots[table.s.id];
  if (!cfg) return { x, y, sortY, tableId: table.s.id, tableX: table.x0, tableY: table.y0 };   // 這張桌子沒設擺放點：照坐的方向放
  // 桌上有設擺放點（避開桌上的道具）：挑離座位最近的；別人的餐盤佔走的不選，背對鏡頭的人也不選會被自己的頭擋住的
  const others = mealTrays().filter(t => t.seatKey !== seatIdOf(seat));
  let best = null, bd = Infinity;
  for (const [u, v] of cfg.spots) {
    const sx = table.x0 + (table.s.fx ? table.w - u : u), sy = table.y0 + v, d = Math.hypot(sx - seat.x, sy - seat.y);
    if (others.some(t => Math.abs(t.x - sx) < cfg.w && Math.abs(t.y - sy) < cfg.h)) continue;
    if (seat.dir === 'back' && Math.abs(sx - seat.x) < 24 && sy + 11 > seat.y - 46) continue;   // 角色圖的頭頂在 y-46
    if (d < bd) { bd = d; best = { x: sx, y: sy, sortY, tableId: table.s.id, tableX: table.x0, tableY: table.y0 }; }
  }
  return best;
}
const trayAtSeat = seat => mealTrays().find(t => t.seatKey === seatIdOf(seat));
const newTray = () => ({ foods: [], left: 1, dirty: false });
// ---- 溫特 ----
function placeTrayAt(seat, tray, owner) {
  const pos = trayPosForSeat(seat); if (!pos || trayAtSeat(seat)) return false;
  mealTrays().push({ ...tray, ...pos, seatKey: seatIdOf(seat), seat, owner, eatT: tray.eatT || 0, eating: false, turn: seat.dir === 'left' || seat.dir === 'right', mirror: seat.dir === 'left', flip: seat.dir === 'front' });   // 面向鏡頭坐的（桌子另一邊）：餐盤上下翻轉，格子的順序才對   // 側面的椅子：餐盤順時針轉 90 度（不然橫的餐盤會擋到臉）
  return true;
}
function mealPlayerAction(dry) {   // dry＝只問現在按互動鍵會做什麼（畫提示用）：回傳 { label, x, y, run }
  const p = G && G.player; if (!p || p.hp <= 0 || !mealMapReady()) return null;
  if (p.sitting) {
    const t = trayAtSeat(p.sitting);
    if (t && t.owner === 'player' && !t.dirty) return t.eating ? { label: '吃飯中…', x: p.x, y: p.y - 62, run: () => {} } : { label: '開動！', x: p.x, y: p.y - 62, run: () => { t.eating = true; } };
    if (!t && p.tray && !p.tray.dirty && p.tray.foods.length && trayPosForSeat(p.sitting)) return { label: '放下餐盤', x: p.x, y: p.y - 60, run: () => { placeTrayAt(p.sitting, p.tray, 'player'); p.tray = null; sfx('place'); } };
    return null;
  }
  if (p.tray) {
    const waste = mealNear(MEAL.wasteTiles, p.x, p.y);
    if (waste) return { label: '回收餐盤', x: waste.x, y: waste.top - 4, run: () => { p.tray = null; sfx('place'); systemNotice('餐盤收好了'); } };
    const buffet = !p.tray.dirty && mealNear(MEAL.buffetTiles, p.x, p.y);
    if (buffet) {
      const pan = nearestPan(buffet, p.x);
      if (p.tray.foods.length >= MEAL.maxDishes) return { label: '餐盤裝滿了', x: pan.x, y: buffet.top - 4, run: () => { sfx('error'); systemNotice('餐盤最多裝 ' + MEAL.maxDishes + ' 樣菜', true); } };
      if (p.tray.foods.some(f => f.key === pan.key)) return { label: '已經裝過這道', x: pan.x, y: buffet.top - 4, run: () => { sfx('error'); systemNotice('這道菜裝過了，換一道吧', true); } };
      return { label: '裝菜（' + p.tray.foods.length + '/' + MEAL.maxDishes + '）', x: pan.x, y: buffet.top - 4, run: () => { p.tray.foods.push({ ...pan.food, key: pan.key }); sfx('blip'); } };
    }
    const seat = !p.tray.dirty && p.tray.foods.length && typeof seatNearPlayer === 'function' ? seatNearPlayer() : null;
    const sitHere = seat && trayPosForSeat(seat) && !trayAtSeat(seat) ? { label: '坐下用餐', x: seat.x, y: seat.top - 6, run: () => { toggleSit(); if (p.sitting === seat && placeTrayAt(seat, p.tray, 'player')) p.tray = null; } } : null;
    const stack = mealNear(MEAL.trayTiles, p.x, p.y, MEAL.trayReach);
    // 不想吃了：乾淨的餐盤可以放回餐盤架（裝了菜也可以，菜就不要了）；髒盤要拿去回收區
    const backHere = !stack ? null : p.tray.dirty
      ? { label: '髒盤要拿去回收區', x: stack.x, y: stack.top - 4, run: () => { sfx('error'); systemNotice('吃過的餐盤請拿去回收區', true); } }
      : { label: '放回餐盤', x: stack.x, y: stack.top - 4, run: () => { p.tray = null; sfx('place'); systemNotice('餐盤放回去了'); } };
    // 餐盤架旁邊剛好有椅子：哪個離溫特比較近就用哪個（站在餐盤架前＝放回、站在椅子旁＝坐下）
    if (sitHere && backHere) return Math.hypot(seat.x - p.x, seat.y - p.y) < Math.hypot(stack.x - p.x, stack.bottom - p.y) ? sitHere : backHere;
    return sitHere || backHere;
  }
  const mine = mealTrays().filter(t => t.owner === 'player').find(t => Math.hypot(t.x - p.x, t.y - p.y) < 80 || (t.seat && Math.hypot(t.seat.x - p.x, t.seat.y - p.y) < 90));   // 離餐盤夠近，或站在自己剛剛坐的位子旁（餐盤可能放得比較遠）
  if (mine) return { label: mine.dirty ? '收髒盤' : '拿起餐盤', x: mine.x, y: mine.y - 22, run: () => { mealTrays().splice(mealTrays().indexOf(mine), 1); p.tray = { foods: mine.foods, left: mine.left, dirty: mine.dirty, eatT: mine.eatT }; sfx('switch'); } };
  const stack = mealNear(MEAL.trayTiles, p.x, p.y, MEAL.trayReach);
  if (stack) return { label: '拿餐盤', x: stack.x, y: stack.top - 4, run: () => { p.tray = newTray(); sfx('switch'); if (typeof winterSay === 'function') winterSay(MEAL.takeLine); systemNotice('不想吃了：回到餐盤架按互動鍵可以放回去'); } };
  return null;
}
const mealPrompt = () => mealPlayerAction(true);
function useMealNearPlayer() { const a = mealPlayerAction(); if (!a) return false; a.run(); return true; }
// ---- 吃：每秒少 1/4 ----
function updateMeal(dt) {
  if (G && G.player && G.player.mealSay) G.player.mealSay.t += dt;   // 泡泡跟「吃飽了！」一樣用遊戲時間算：它消失了泡泡才出來
  if (!G || !G.mealTrays) return;
  for (const t of G.mealTrays) {
    if (!t.eating || t.dirty) continue;
    const before = Math.floor(t.eatT); t.eatT += dt;
    if (Math.floor(t.eatT) > before && typeof sfxAt === 'function') sfxAt('pop', t.x, t.y, .25, 'meal-bite');
    t.left = Math.max(0, 1 - Math.floor(t.eatT) / 4);
    if (t.eatT >= MEAL.eatTime) { t.eating = false; t.dirty = true; t.left = 0; if (t.owner === 'player') { const p = G.player; flash('吃飽了！', p.x, p.y - 64, '#9ff0c0', MEAL.fullFlash, true); grantMealBuff(t.foods); } }   // 「吃飽了！」在溫特頭頂上方（不蓋到人）
  }
}
// ---- NPC：拿餐盤 → 裝 2～4 樣 → 找有桌子的空位坐下吃 → 再坐一下 → 起身把髒盤拿去回收 ----
const mealRand = ([a, b]) => a + Math.random() * (b - a);
function tryStartMeal(a) {
  if (a.mealCd == null) a.mealCd = mealRand(MEAL.npc.firstCd);
  if (a.mealCd > 0 || a.meal || Math.random() >= MEAL.npc.chance || !mealMapReady()) return false;
  const stacks = mealStamps(MEAL.trayTiles), buffets = mealStamps(MEAL.buffetTiles);
  const pans = buffets.flatMap(r => MEAL.pans.map((_, k) => panOf(r, k))).sort(() => Math.random() - .5).slice(0, Math.round(mealRand(MEAL.npc.dishes)));
  const stack = stacks[Math.floor(Math.random() * stacks.length)];
  a.meal = { stage: 'tray', stops: [{ x: stack.x, y: stack.bottom + MEAL.trayReach - 4, act: 'tray' }, ...pans.sort((p, q) => q.x - p.x).map(p => ({ x: p.x, y: buffets.find(r => p.key.startsWith(r.s.id)).bottom + 14, act: 'dish', food: { ...p.food, key: p.key } }))], wait: 0 };
  a.target = null; a.navPath = null; a.waitT = 0;
  return true;
}
function endMeal(a) { a.meal = null; a.mealCd = mealRand(MEAL.npc.cooldown); a.navPath = null; a.seatGoal = null; }
// 規則：餐盤裡有菜就一定吃完、吃完一定拿去回收——中途被打斷（閒聊、被抓起來、起身…）就回來接著做，不會把餐盤丟著
function mealStep(a, dt, speed) {
  if (a.mealCd > 0) a.mealCd -= dt;
  const m = a.meal; if (!m) return false;
  if (!MAP_SAFE || !mealMapReady()) { if (a.sitting) npcStandUp(a); endMeal(a); return false; }   // 離開餐廳了（桌上的餐盤跟著這張地圖一起不見）
  if (m.wait > 0) { m.wait -= dt; a.moving = false; return true; }
  const fail = () => { a.navPath = null; m.wait = .5; return (m.fails = (m.fails || 0) + 1) > 8; };   // 路走不通：等一下再試，試太多次才放棄這一步
  if (m.stage === 'tray') {   // 照順序走：餐盤架 → 每一盤菜
    const st = m.stops[0];
    if (!st) { m.stage = m.tray && m.tray.foods.length ? 'seat' : 'done'; m.fails = 0; return true; }
    if (moveSentryWithPath(a, st.x, st.y, speed, dt)) {
      if (st.act === 'tray') m.tray = newTray(); else if (m.tray) m.tray.foods.push(st.food);
      a.dir = 'back'; m.stops.shift(); m.wait = MEAL.npc.stop; a.navPath = null; m.fails = 0;
    } else if (a.navFailed && fail()) {
      if (!m.tray) { endMeal(a); return false; }   // 還沒拿到餐盤：不吃了也沒關係
      m.stops = m.stops.filter(s => s !== st);     // 這盤菜走不到：跳過，有菜就去吃
    }
    return true;
  }
  if (m.stage === 'seat') {   // 端著餐盤找有桌子的空位
    if (!a.seatGoal) {
      let best = null, bd = Infinity;
      for (const seat of mapSeats()) {
        if (seat.bed || seatTaken(seat, a) || trayAtSeat(seat) || !trayPosForSeat(seat) || (m.bad || []).includes(seatIdOf(seat))) continue;
        const ap = seatApproachPoint(seat), d = ap && Math.hypot(seat.x - a.x, seat.y - a.y);
        if (ap && d < bd) { bd = d; best = { seat, approach: ap }; }
      }
      if (!best) { m.bad = []; m.wait = 1.5; a.dir = 'front'; return true; }   // 沒有空位：端著等一下再找（不會不吃就走）
      a.seatGoal = best; a.navPath = null;
    }
    const g = a.seatGoal;
    if (seatTaken(g.seat, a) || trayAtSeat(g.seat)) { a.seatGoal = null; return true; }   // 被搶走了：再找一個
    if (moveSentryWithPath(a, g.approach.x, g.approach.y, speed, dt)) {
      a.sitFrom = { x: a.x, y: a.y }; a.sitting = g.seat; a.seatGoal = null; a.navPath = null; m.fails = 0;
      a.x = g.seat.x; a.y = g.seat.y; a.dir = g.seat.dir; a.moving = false;
      placeTrayAt(g.seat, m.tray, a); m.tray = null;
      const t = trayAtSeat(g.seat); if (t) t.eating = true;
      m.stage = 'eat'; m.linger = mealRand(MEAL.npc.linger);
    } else if (a.navFailed) { (m.bad = m.bad || []).push(seatIdOf(g.seat)); a.seatGoal = null; a.navPath = null; }   // 這個位子走不到：換一個
    return true;
  }
  if (m.stage === 'eat') {   // 坐著吃，吃完再坐一下
    const t = mealTrays().find(x => x.owner === a);
    if (!a.sitting || !t || t.seatKey !== seatIdOf(a.sitting)) {   // 被打斷了（被叫起來、被抓走…）：把桌上的餐盤拿回來，沒吃完就再找位子吃、吃完了就去回收
      if (a.sitting) npcStandUp(a);
      if (t) { mealTrays().splice(mealTrays().indexOf(t), 1); m.tray = { foods: t.foods, left: t.left, dirty: t.dirty, eatT: t.eatT }; }
      if (!m.tray) { endMeal(a); return false; }
      m.stage = m.tray.dirty ? 'waste' : 'seat'; a.navPath = null; a.waitT = 0;
      return true;
    }
    a.x = a.sitting.x; a.y = a.sitting.y; a.dir = a.sitting.dir; a.moving = false;
    t.eating = !t.dirty;
    if (t.dirty && (m.linger -= dt) <= 0) {
      mealTrays().splice(mealTrays().indexOf(t), 1); m.tray = { foods: t.foods, left: 0, dirty: true };
      npcStandUp(a); a.waitT = 0; m.stage = 'waste'; a.navPath = null; m.fails = 0;
    }
    return true;
  }
  if (m.stage === 'waste') {   // 髒盤拿去回收
    const wastes = mealStamps(MEAL.wasteTiles), w = wastes.reduce((p, q) => Math.hypot(q.x - a.x, q.y - a.y) < Math.hypot(p.x - a.x, p.y - a.y) ? q : p);
    if (moveSentryWithPath(a, w.x, w.bottom + 14, speed, dt)) { a.dir = 'back'; m.tray = null; endMeal(a); a.waitT = .6; }
    else if (a.navFailed && fail()) { m.tray = null; endMeal(a); }   // 一直走不到（被擋住）：最後還是當作收好了，不會把髒盤留在地圖上
    return true;
  }
  endMeal(a); return false;
}
// ---- 畫 ----
function drawMealTray(ctx, x, y, tray, s = 1, shadow = true) {
  const A = MEAL.trayArt, img = mealImg(A.file), [cx, cy, cw, ch] = A.crop, w = cw * s, h = ch * s, x0 = Math.round(x - w / 2), y0 = Math.round(y - h / 2);
  if (!img.complete || !img.naturalWidth) return;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  if (shadow) { ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.beginPath(); ctx.ellipse(x, y0 + h, w / 2, 2.2 * s, 0, 0, Math.PI * 2); ctx.fill(); }   // 影子（上下翻轉的不畫，不然影子會跑到上面）
  ctx.drawImage(img, cx, cy, cw, ch, x0, y0, w, h);   // 餐盤架最上面那個餐盤
  // 外框補一圈：縮小畫的時候最左邊那一欄像素會被吃掉；最下面截到的是下一個餐盤的邊，也蓋掉
  ctx.fillStyle = '#1d2228'; const L = Math.max(1, Math.round(s));
  ctx.fillRect(x0, y0 + 3 * s, L, h - 6 * s); ctx.fillRect(x0 + w - L, y0 + 3 * s, L, h - 6 * s); ctx.fillRect(x0 + 3 * s, y0 + h - L, w - 6 * s, L);
  ctx.fillRect(x0 + L, y0 + 2 * s, L, L); ctx.fillRect(x0 + L, y0 + h - 3 * s, L, L); ctx.fillRect(x0 + w - 2 * L, y0 + 2 * s, L, L); ctx.fillRect(x0 + w - 2 * L, y0 + h - 3 * s, L, L);   // 四個圓角
  A.slots.forEach(([sx0, sy0, sw0, sh0], i) => {
    const f = tray.foods[i]; if (!f) return;
    const sx = x0 + (sx0 - cx) * s, sy = y0 + (sy0 - cy) * s, sw = sw0 * s, sh = sh0 * s;   // 格子的位置是整張圖的像素：減掉截圖的起點
    if (tray.left > 0) {   // 菜：從打飯台的菜盤截一塊跟這格一樣比例的，吃掉多少就縮多少
      const food = mealImg(f.file), k = Math.sqrt(tray.left);
      if (food.complete && food.naturalWidth) {
        const [rx, ry, rw, rh] = f.rect, fx = food.naturalWidth / MEAL.panImg[0], fy = food.naturalHeight / MEAL.panImg[1], ar = sw0 / sh0;
        const uw = Math.min(rw, rh * ar), uh = uw / ar, dw = sw * k, dh = sh * k;
        ctx.drawImage(food, (rx + (rw - uw) / 2) * fx, (ry + (rh - uh) / 2) * fy, uw * fx, uh * fy, sx + (sw - dw) / 2, sy + (sh - dh) / 2, dw, dh);
      }
    }
    if (tray.dirty) { ctx.fillStyle = 'rgba(120,80,40,.75)'; ctx.fillRect(sx + sw * .25, sy + sh * .3, s, s); ctx.fillRect(sx + sw * .65, sy + sh * .55, s, s); ctx.fillRect(sx + sw * .4, sy + sh * .75, s, s); }   // 髒盤：剩一點渣
  });
  ctx.restore();
}
// 桌上的餐盤：面向鏡頭坐的上下翻轉；側面轉 90 度，坐在桌子右邊的再水平翻轉（靠人的那一邊才對）
function drawTableTray(t) {
  if (!t.turn && !t.flip) { drawMealTray(ctx, t.x, t.y, t, .9); return; }
  ctx.save(); ctx.translate(t.x, t.y);
  if (t.turn) { if (t.mirror) ctx.scale(-1, 1); ctx.rotate(Math.PI / 2); } else ctx.scale(1, -1);
  drawMealTray(ctx, 0, 0, t, .9, false);
  ctx.restore();
}
// 長桌的道具畫死在桌子圖裡：把道具那一塊截下來、跟桌面同色的地方挖空（file:// 開啟時讀不到像素，就回傳 null，不疊回去）
const bakedPropCache = {};
function bakedPropMask(id) {
  if (id in bakedPropCache) return bakedPropCache[id];
  const cfg = MEAL.bakedProps[id], t = mapTileById(id); if (!cfg || !t) return bakedPropCache[id] = null;
  const img = mealImg(t.file); if (!img.complete || !img.naturalWidth) return null;   // 圖還沒載入：下一幀再試
  const [x, y, w, h] = cfg.rect, c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); g.drawImage(img, -x, -y);
  try {
    const probe = document.createElement('canvas'); probe.width = probe.height = 1;
    const pg = probe.getContext('2d'); pg.drawImage(img, -cfg.surface[0], -cfg.surface[1]);
    const base = pg.getImageData(0, 0, 1, 1).data, d = g.getImageData(0, 0, w, h);
    for (let i = 0; i < d.data.length; i += 4) if (Math.abs(d.data[i] - base[0]) + Math.abs(d.data[i + 1] - base[1]) + Math.abs(d.data[i + 2] - base[2]) < 20) d.data[i + 3] = 0;
    g.putImageData(d, 0, 0);
  } catch (_) { return bakedPropCache[id] = null; }
  return bakedPropCache[id] = c;
}
// 另外擺在桌上的道具（地圖編輯器放的）：這張地圖有哪些（換地圖才重算）
let mealPropsFor = null, mealPropList = [];
function mealLooseProps() {
  if (mealPropsFor === MAP) return mealPropList;
  mealPropsFor = MAP; mealPropList = [];
  const add = (id, x, y) => { const t = mapTileById(id); if (t && MEAL.propTiles.includes(id)) mealPropList.push({ file: t.file, x, y, w: mapTileW(t) * CELL, h: mapTileH(t) * CELL }); };
  for (const layer of Object.values((MAP && MAP.layers) || {})) for (const [k, id] of Object.entries(layer)) { const [c, r] = k.split(',').map(Number); add(id, OX + c * CELL, OY + r * CELL); }
  for (const s of (MAP && MAP.stamps) || []) add(s.id, OX + s.c * CELL + (s.ox || 0), OY + s.r * CELL + (s.oy || 0));
  return mealPropList;
}
// 畫完餐盤，把碰到的道具疊回去：層級＝桌子 → 餐盤 → 桌上的道具
function drawPropsOverTray(t) {
  const w = (t.turn ? 24 : 36) * .9 / 2 + 1, h = (t.turn ? 36 : 24) * .9 / 2 + 1, hit = (x, y, pw, ph) => t.x + w > x && t.x - w < x + pw && t.y + h > y && t.y - h < y + ph;
  ctx.save(); ctx.imageSmoothingEnabled = false;
  const cfg = t.tableId && MEAL.bakedProps[t.tableId], mask = cfg && bakedPropMask(t.tableId);
  if (mask && hit(t.tableX + cfg.rect[0], t.tableY + cfg.rect[1], cfg.rect[2], cfg.rect[3])) ctx.drawImage(mask, t.tableX + cfg.rect[0], t.tableY + cfg.rect[1]);
  for (const p of mealLooseProps()) if (hit(p.x, p.y, p.w, p.h)) { const img = mealImg(p.file); if (img.complete && img.naturalWidth) ctx.drawImage(img, p.x, p.y, p.w, p.h); }
  ctx.restore();
}
function mealSortables(list) {
  if (!G || !MAP_SAFE) return;
  for (const t of G.mealTrays || []) list.push({ y: t.sortY, draw: () => {
    drawTableTray(t); drawPropsOverTray(t);
  } });
  // 拿在手上：胸前（往左、右走時偏到那一邊）；背對鏡頭時畫在身體後面（被身體擋住）
  const carry = (a, tray) => list.push({ y: a.y + (a.dir === 'back' ? 15 : 17.2), draw: () => drawMealTray(ctx, a.x + (a.dir === 'left' ? -9 : a.dir === 'right' ? 9 : 0), a.y + MEAL.carryY, tray, .75) });
  if (G.player && G.player.tray && !G.player.sitting) carry(G.player, G.player.tray);
  for (const a of [...G.npcs, ...G.towers]) if (a.meal && a.meal.tray && !a.sitting) carry(a, a.meal.tray);
}
// 桌上餐盤正在被吃：上面冒一點熱氣
function drawMealFx(ctx) {
  const p = G && G.player, say = p && p.mealSay, ms = performance.now(), from = MEAL.fullFlash + .15;
  if (say && say.t >= from && say.t < from + 3 && typeof queueTowerBubble === 'function') queueTowerBubble(p, p.x, p.y - 50, say.text);   // 溫特頭上的泡泡：跟隊員的對話泡泡一起畫在最上層（js/render.js 的 flushTowerBubbles）
  else if (say && say.t >= from + 3) p.mealSay = null;
  const now = ms / 1000;
  for (const t of (G && G.mealTrays) || []) {
    if (!t.eating) continue;
    for (let i = 0; i < 3; i++) {
      const f = (now * .8 + i / 3) % 1;
      ctx.fillStyle = 'rgba(240,240,240,' + (.35 * (1 - f)) + ')';
      ctx.beginPath(); ctx.arc(t.x - 6 + i * 6 + Math.sin(now * 3 + i) * 2, t.y - 8 - f * 16, 2 + f * 3, 0, Math.PI * 2); ctx.fill();
    }
  }
}

// ============================================================
//  飯後加成：溫特吃完一盤，裡面每道菜的加成加起來（MEAL_DISHES）
//  ・從吃完開始，到「下一次出勤結束、回到基地」才消失（不是幾秒）：在基地慢慢整理裝備再出發也來得及；再吃一盤＝換成新的
//  ・存在瀏覽器（tudrc_meal_buff_v1）；效果接到 js/food.js 的 foodBuff（減傷、射速、移速）
//  ・HP／SP 條右邊的「↑↑BUFF」按鈕：有加成才出現，點了跳出這餐吃了什麼、加了多少
// ============================================================
const MEAL_BUFF_KEY = 'tudrc_meal_buff_v1';
let mealBuff = null;   // { dishes: [{ name, eff, file, rect }], active（出勤中了沒） }
try { mealBuff = JSON.parse(localStorage.getItem(MEAL_BUFF_KEY) || 'null'); } catch (_) { mealBuff = null; }
const saveMealBuff = () => { try { if (mealBuff) localStorage.setItem(MEAL_BUFF_KEY, JSON.stringify(mealBuff)); else localStorage.removeItem(MEAL_BUFF_KEY); } catch (_) {} };
function mealBuffTotal(buff = mealBuff) {
  const sum = {};
  for (const d of (buff && buff.dishes) || []) for (const k in d.eff || {}) sum[k] = (sum[k] || 0) + d.eff[k];
  return sum;
}
const mealBuffVal = kind => mealBuff && !(typeof practiceOn === 'function' && practiceOn()) ? mealBuffTotal()[kind] || 0 : 0;   // js/food.js 的 foodBuff 加上這個（訓練室裡沒有加成）
function grantMealBuff(foods) {
  const dishes = foods.map(f => { const d = dishOf(f.key); return d && { name: d.name, eff: d.eff, file: f.file, rect: f.rect }; }).filter(Boolean);
  if (!dishes.length) return;
  mealBuff = { dishes, active: false }; saveMealBuff(); renderMealBuffButton();
  if (G && G.player) G.player.mealSay = { text: MEAL.fullLine, t: 0 };   // 「吃飽了！」消失之後，頭上才冒泡泡說一句（加成的數字看 BUFF 按鈕）
}
// 進入地圖時（js/game.js 的 begin 呼叫）：進戰鬥地圖＝開始用；出勤完回到基地＝用完了（劇情地圖是出勤途中，不算）
function mealBuffOnMap() {
  if (!mealBuff || window.TEST_MODE || (typeof MAP_STORY !== 'undefined' && MAP_STORY) || (typeof practiceOn === 'function' && practiceOn())) { renderMealBuffButton(); return; }   // 訓練室不算出勤：不會開始用，也不會用掉
  if (!MAP_SAFE && !mealBuff.active) { mealBuff.active = true; saveMealBuff(); }
  else if (MAP_SAFE && mealBuff.active) { mealBuff = null; saveMealBuff(); setTimeout(() => { if (typeof systemNotice === 'function') systemNotice('飯後加成用完了，記得再去餐廳吃飯'); }, 1200); }
  renderMealBuffButton();
}
// ---- HUD 按鈕＋說明小框 ----
const MEAL_UP_ICON = '<svg class="meal-up-icon" viewBox="0 0 286 337" aria-hidden="true"><polygon points="0,96 143,0 286,96 286,205 143,111 0,205" fill="#7be495"/><polygon points="7,232 143,146 278,232 278,334 143,245 7,334" fill="#3fbf6a"/></svg>';   // 跟開發工坊「可升級」同一個綠色雙箭頭
function renderMealBuffButton() {
  const player = document.querySelector('#hud .hud-player'); if (!player) return;
  let btn = document.getElementById('mealBuffBtn');
  if (!btn) {
    btn = document.createElement('button'); btn.id = 'mealBuffBtn'; btn.type = 'button'; btn.className = 'meal-buff-btn';
    btn.innerHTML = MEAL_UP_ICON + '<span>BUFF</span>'; btn.title = '飯後加成（點一下看詳細）';
    btn.addEventListener('click', e => { e.stopPropagation(); toggleMealBuffPanel(); });
    player.after(btn);   // 排在溫特狀態的右邊（自己佔位置，旁邊的快捷欄會讓開，不會疊在上面）
  }
  btn.hidden = !mealBuff;
  document.getElementById('hud')?.classList.toggle('has-meal-buff', !!mealBuff);
  if (!mealBuff) closeMealBuffPanel();
  else if (document.getElementById('mealBuffPanel')) fillMealBuffPanel();
}
function fillMealBuffPanel() {
  const box = document.getElementById('mealBuffPanel'); if (!box || !mealBuff) return;
  const pct = v => '+' + Math.round(v * 100) + '%';
  const effHtml = eff => Object.keys(eff).map(k => '<span style="color:' + MEAL_EFF[k].color + '">' + MEAL_EFF[k].name + ' ' + pct(eff[k]) + '</span>').join('');
  const thumb = d => { const [x, y, w, h] = d.rect || [0, 0, 0, 0]; return '<i class="mbp-thumb" style="background-image:url(\'' + encodeURI(d.file) + '\');background-position:-' + x + 'px -' + y + 'px;width:' + w + 'px;height:' + h + 'px"></i>'; };   // 菜的小圖：打飯台圖上那一盤
  box.innerHTML = '<header><b>' + MEAL_UP_ICON + '飯後加成</b><small>' + (mealBuff.active ? '出勤中・回到基地就結束' : '有效到下一次出勤結束') + '</small></header>' +
    '<ul>' + mealBuff.dishes.map(d => '<li>' + thumb(d) + '<b>' + d.name + '</b><em>' + effHtml(d.eff) + '</em></li>').join('') + '</ul>' +
    '<footer><span>合計</span><em>' + effHtml(mealBuffTotal()) + '</em></footer>';
}
function toggleMealBuffPanel() {
  if (document.getElementById('mealBuffPanel')) { closeMealBuffPanel(); return; }
  const btn = document.getElementById('mealBuffBtn'); if (!btn || !mealBuff) return;
  const box = document.createElement('div'); box.id = 'mealBuffPanel'; box.className = 'meal-buff-panel';
  document.body.appendChild(box); fillMealBuffPanel();
  const r = btn.getBoundingClientRect();   // 放在按鈕正上方
  box.style.left = Math.max(8, Math.min(window.innerWidth - box.offsetWidth - 8, r.left + r.width / 2 - box.offsetWidth / 2)) + 'px';
  box.style.top = Math.max(8, r.top - box.offsetHeight - 8) + 'px';
  sfx('menu');
}
function closeMealBuffPanel() { document.getElementById('mealBuffPanel')?.remove(); }
document.addEventListener('click', e => { if (!e.target.closest || !e.target.closest('#mealBuffPanel, #mealBuffBtn')) closeMealBuffPanel(); });   // 點別的地方就關掉
window.addEventListener('keydown', e => { if (e.key === 'Escape' && document.getElementById('mealBuffPanel')) closeMealBuffPanel(); });
renderMealBuffButton();
