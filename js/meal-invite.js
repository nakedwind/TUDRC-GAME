// ============================================================
//  邀請隊員、基地的 NPC 一起去餐廳吃飯（基地裡右鍵點人 →「🍽️ 一起去吃飯」）
//  ・同時最多邀 MEAL_INVITE.max 人（隊員、NPC 合起來算）；再點一次＝取消邀請
//  ・跟著溫特：溫特站著不動時，在溫特周圍 radiusCells 格內走來走去；溫特一走，大家照邀請的順序沿著溫特走過的路排成一列跟上（換樓層、換地圖也跟著，到了出現在溫特旁邊）
//  ・剛答應、或溫特站著時在旁邊自由走動過：用自己平常的速度走過去排隊，走到自己排的位置才算加入隊伍，之後才用跟隨溫特的速度
//  ・個人房間（名字有「寢室」「房間」又有角色名字的地圖，宿舍樓走廊、B3-管制寢室這種整層樓不算）：只有房間的主人跟進去，其他人在門外那張地圖等，溫特出來再跟上
//  ・另外指定不能跟進去的地方：MEAL_INVITE.noEnter（地圖名字 → 誰不能進去），一樣在門外等
//  ・冷卻：吃完一盤（被邀請去吃、自己去餐廳吃都算）MEAL_INVITE.cooldownMin 分鐘內不能再邀請；用真實時間算，存在瀏覽器（tudrc_meal_invite_cd_v1），重新整理也不會重來
//  ・答應時頭上說的話：對話編輯器的「接受吃飯邀請」（data/dialogues.js 的 mealInvite），沒填就不說
//  ・到了有餐盤架、打飯台、回收區的地圖（餐廳）：自己去拿餐盤、打飯、坐下吃、回收（js/meal.js 的 NPC 吃飯流程）
//  ・吃完在餐廳逛一下（after 秒），再走回自己平常待的地方（同一張地圖＝走回活動範圍；別張地圖＝走往家的方向的出入口離開，homeExit），邀請結束
//  ・飯後加成只有溫特有：桌上的餐盤是客人的（owner 不是 'player'），吃完不會加（js/meal.js 的 updateMeal）
//  ・只存在這一趟（沒存進存檔）；離開基地去出勤、溫特先離開餐廳（還在吃的人留下）＝邀請結束，大家回到平常的位置
// ============================================================
const MEAL_INVITE = { cooldownMin: 10, noEnter: { '2F溫特辦公室': ['red'] }, max: 4, radiusCells: 5, queueCells: [1.2, 1], wait: [.6, 1.8], after: [8, 14], cancelWander: [4, 8], leaveTimeout: 25, npcSpeed: 65 };   // queueCells：排隊的間隔（第一位離溫特 1.2 格，之後每位再往後 1 格）；npcSpeed＝NPC 平常走路的速度（js/sentry.js 的 updateWanderer）
const mealInvite = { guests: [], mapId: null, mapName: null, trail: [] };   // trail：溫特走過的路（新的在前面，每 4px 記一點），大家沿著這條路排隊   // guests：[{ id, stage: 'follow'|'eat'|'after', t（逛多久） }]
const inviteId = a => a && (a.kind === 'tower' ? a.type : a.id);   // 隊員用 type、NPC 用 id（跟 npcLocation 一樣）
const inviteName = a => a.kind === 'tower' ? TYPES[a.type].name : ((typeof CHARACTERS !== 'undefined' && CHARACTERS[a.id]) || {}).name || a.id;
const mealGuestOf = id => mealInvite.guests.find(g => g.id === id) || null;
const mealGuest = a => !!(a && (a.kind === 'tower' || a.kind === 'npc') && mealGuestOf(inviteId(a)));
// 個人房間：名字有「寢室」「房間」、而且有某個角色的名字（例如 4F雷德哨兵寢室、B3阿瓦倫房間）；宿舍樓的走廊、B3-管制寢室這種整層樓不算
// 主人＝地圖名字裡有他的名字，或基地編輯器設定他平常待在這裡
const privateRoom = name => /寢室|房間/.test(name || '') && !/宿舍樓/.test(name) && typeof CHARACTERS !== 'undefined' && Object.values(CHARACTERS).some(c => c.name && name.includes(c.name));
function roomOwner(id, name) {
  const c = typeof CHARACTERS !== 'undefined' && CHARACTERS[id], home = npcLocationTable()[id];   // 不問 npcLocation：那裡會先問被邀請的人在哪
  return !!((c && c.name && name.includes(c.name)) || (home && home.map === name));
}
// 能不能跟著溫特走進這張地圖：別人的個人房間、指定不能進去的地方（例如雷德不能進溫特辦公室）不行（js/base-follow.js 也用）
const inviteCanEnter = (id, name) => !(MEAL_INVITE.noEnter[name] || []).includes(id) && (!privateRoom(name) || roomOwner(id, name));
// 換地圖（js/sentry.js 的 npcLocation 在生人的時候就會問，所以在這裡檢查）：出勤＝全部結束；還沒到餐廳的跟過來，在餐廳吃到一半的留在原地（＝邀請結束）
// 走進別人的個人房間：不是主人的在門外那張地圖等（waitMap），溫特走到不是個人房間的地方再跟上
function mealInviteMapCheck() {
  if (!MAP || mealInvite.mapId === MAP.id) return;
  const from = mealInvite.mapName;
  mealInvite.mapId = MAP.id; mealInvite.mapName = MAP.name; mealInvite.trail = [];   // 換了地圖：走過的路重新記
  mealInvite.guests = MAP_SAFE && !(typeof practiceOn === 'function' && practiceOn()) ? mealInvite.guests.filter(g => g.stage === 'follow') : [];
  const waiting = [];
  for (const g of mealInvite.guests) {
    if (inviteCanEnter(g.id, MAP.name)) { g.waitMap = null; continue; }
    if (!g.waitMap) g.waitMap = from;   // 從哪張地圖進來的，就在那裡等（從別人房間再走進另一間房間：照樣在原本那裡等）
    waiting.push(g.id);
  }
  if (waiting.length) setTimeout(() => systemNotice(waiting.map(id => ((typeof CHARACTERS !== 'undefined' && CHARACTERS[id]) || {}).name || id).join('、') + '在門外等你'), 600);
}
// 被邀請的人在哪（npcLocation 先問這裡）：跟著溫特＝溫特現在這張地圖；在門外等＝等的那張地圖
function mealInviteLocation(id) {
  mealInviteMapCheck();
  const g = mealGuestOf(id);
  return g && MAP ? { map: g.waitMap || MAP.name } : null;
}
const canMealInvite = a => !!(a && MAP_SAFE && !NPC_NO_SEAT.includes(inviteId(a)) && !a.inviteLeave && !(typeof practiceOn === 'function' && practiceOn())
  && (a.kind === 'tower' ? TYPES[a.type] && a.hp > 0 && !a.berserk && !a.vitalsLeaving && !(typeof isHospitalized === 'function' && isHospitalized(a.type))
    : a.kind === 'npc' && !(typeof ashBusy === 'function' && ashBusy(a))));   // NPC：球球（狗）不去、亞許正在幫人疏導時不去
// ---- 冷卻：誰什麼時候吃完的（真實時間，毫秒）----
const MEAL_INVITE_CD_KEY = 'tudrc_meal_invite_cd_v1';
let mealAteAt = {};
try { mealAteAt = JSON.parse(localStorage.getItem(MEAL_INVITE_CD_KEY) || '{}') || {}; } catch (_) { mealAteAt = {}; }
const inviteCdLeft = id => Math.max(0, (mealAteAt[id] || 0) + MEAL_INVITE.cooldownMin * 60000 - Date.now());   // 還要等多久（毫秒）
function mealInviteAte(a) {   // 吃完一盤（js/meal.js 的 updateMeal 呼叫）：開始算冷卻
  const id = inviteId(a); if (!id) return;
  mealAteAt[id] = Date.now();
  for (const k in mealAteAt) if (!inviteCdLeft(k)) delete mealAteAt[k];   // 過了冷卻的拿掉，存的東西不會越來越多
  try { localStorage.setItem(MEAL_INVITE_CD_KEY, JSON.stringify(mealAteAt)); } catch (_) {}
}
// 選單上的按鈕（js/sentry.js 的 openSentryMenu、openNpcMenu）
function mealInviteButton(a) {
  if (mealGuest(a)) return '<button data-act="mealInvite">🍽️ 不吃了（取消邀請）</button>';
  if (!canMealInvite(a)) return '';
  const left = inviteCdLeft(inviteId(a));
  if (left) return '<button data-act="mealInvite" style="opacity:.55">🍽️ 剛吃飽（' + Math.ceil(left / 60000) + ' 分鐘後才能再邀）</button>';   // 冷卻中：按了只會跳提示
  return '<button data-act="mealInvite">🍽️ 一起去吃飯（' + mealInvite.guests.length + '/' + MEAL_INVITE.max + '）</button>';
}
function toggleMealInvite(a) {
  mealInviteMapCheck();
  const say = (text, col, warn) => { flash(text, a.x, a.y - 30, col, 3, true); systemNotice(inviteName(a) + '：' + text, warn); };
  if (mealGuest(a)) {   // 不吃了：在他平常待的地圖＝照平常的樣子；在別張地圖＝在這裡徘徊一下（cancelWander 秒）再走回去
    endMealInvite(a, false); sfx('button'); say('取消邀請', '#9aa4b2');
    const home = npcLocation(inviteId(a)); if (!home || home.map !== MAP.name) a.inviteLinger = inviteRand(MEAL_INVITE.cancelWander);
    return;
  }
  if (!canMealInvite(a)) { sfx('error'); return; }
  const left = inviteCdLeft(inviteId(a));
  if (left) { sfx('error'); systemNotice(inviteName(a) + '剛吃飽，' + Math.ceil(left / 60000) + ' 分鐘後才能再邀他吃飯', true); return; }
  if (mealInvite.guests.length >= MEAL_INVITE.max) { sfx('error'); systemNotice('一次最多邀 ' + MEAL_INVITE.max + ' 個人一起吃飯', true); return; }
  sfx('button');
  if (a.sitting) npcStandUp(a);
  if (a.meal && !a.meal.tray && a.meal.stage === 'tray') a.meal = null;   // 正要自己去拿餐盤：改成跟溫特一起（端著菜的照樣吃完再說）
  mealInvite.guests.push({ id: inviteId(a), stage: 'follow' }); a.inviteLinger = 0;   // 取消後還在徘徊的人又被邀：照樣跟
  a.inviteMapId = MAP.id; a.inviteJoined = false; if (a.kind === 'tower') a.mode = 'free';   // 還沒加入隊伍：先用自己平常的速度走過來
  a.target = null; a.navPath = null; a.seatGoal = null; a.waitT = 0;
  const line = pickDialogueLine(inviteId(a), 'mealInvite'); if (line) a.say = { text: line, life: 3 };   // 對話編輯器的「接受吃飯邀請」
  systemNotice(inviteName(a) + '跟著你去餐廳吃飯（' + mealInvite.guests.length + '/' + MEAL_INVITE.max + '）');
}
// 邀請結束：goHome＝吃完了，走回平常待的地方（同一張地圖走回活動範圍；別張地圖就走到最近的出入口離開這張地圖）
function endMealInvite(a, goHome) {
  const id = inviteId(a);
  mealInvite.guests = mealInvite.guests.filter(g => g.id !== id);
  a.target = null; a.navPath = null; a.waitT = 0; if (a.kind === 'tower') a.mode = 'free';
  if (goHome) inviteGoHome(a);
}
// 走回平常待的地方：同一張地圖走回活動範圍；別張地圖就走往家那個方向的出入口、離開這張地圖
function inviteGoHome(a) {
  const id = inviteId(a), home = npcLocation(id);   // 已經不是客人了：問到的是平常的位置
  if (!home || home.map !== MAP.name) { a.inviteLeave = { to: homeExit(a, home && home.map), t: 0 }; a.say = null; return; }
  const area = homeAreaOf(id); if (area) a.target = sampleHomeTarget(area, a);   // 先往活動範圍走，之後照平常閒逛
}
// 回家要走哪個出口：沿著地圖之間的出入口找路（js/maploader.js 的 portals），走往家那個方向的第一個出入口
// 出入口連不到（要搭電梯的樓層）：走去電梯；都沒有：最近的出入口
function homeExit(a, homeName) {
  const maps = mapList(), goal = maps.find(m => m.name === homeName), near = list => list.reduce((b, q) => !b || Math.hypot(q.x - a.x, q.y - a.y) < Math.hypot(b.x - a.x, b.y - a.y) ? q : b, null);
  const doors = (mapPortals || []).filter(pt => !pt.hidden && !pt.locked && !pt.elevator && pt.to !== MAP.id).map(pt => ({ to: pt.to, x: center(pt.c, pt.r)[0], y: center(pt.c, pt.r)[1] }));
  if (goal) {
    const first = new Map(doors.map(d => [d.to, d.to])), queue = [...first.keys()];   // 每張地圖：從這裡出去要先走哪個出口
    for (let i = 0; i < queue.length && !first.has(goal.id); i++) {
      const m = maps.find(x => x.id === queue[i]);
      for (const pt of (m && m.portals) || []) if (!pt.hidden && !pt.locked && !pt.elevator && !first.has(pt.to) && pt.to !== MAP.id) { first.set(pt.to, first.get(queue[i])); queue.push(pt.to); }
    }
    if (first.has(goal.id)) return near(doors.filter(d => d.to === first.get(goal.id)));
    const lift = (MAP.stamps || []).find(s => typeof isElevatorStamp === 'function' && isElevatorStamp(s));   // 要搭電梯：走到電梯門口（跟 js/game.js 的 enterPortal 出電梯的位置一樣）
    if (lift) return { x: OX + (lift.c + 1.5) * CELL + (lift.ox || 0), y: OY + (lift.r + 3.5) * CELL + (lift.oy || 0) };
  }
  return near(doors);
}
// 到新地圖：出現在溫特旁邊（從溫特的格子往外找沒人站的空格，第 i 位用第 i 格）
function placeGuestNearPlayer(a, i) {
  const p = G.player, [sc, sr] = cellAt(p.x, p.y), seen = new Set([sc + ',' + sr]), queue = [[sc, sr]], spots = [], roomy = [];
  const taken = new Set([...G.towers, ...G.npcs].filter(o => o !== a && !mealGuest(o)).map(o => cellAt(o.x, o.y).join(',')));
  // roomy＝不會跟溫特、前面挑好的人疊在一起的格子（正上下方只差 1 格＝溫特的腳踩在頭上）：左右 0.9、上下 1.4 格以內算太近
  const apart = (u, v) => Math.hypot((u[0] - v[0]) / .9, (u[1] - v[1]) / 1.4) >= 1;
  for (let h = 0; h < queue.length && roomy.length <= i && h < 400; h++) {
    const [c, r] = queue[h];
    if (h && !taken.has(c + ',' + r)) { spots.push([c, r]); if (apart([c, r], [sc, sr]) && roomy.every(o => apart([c, r], o))) roomy.push([c, r]); }
    for (const [dc, dr] of [[0, 1], [1, 0], [-1, 0], [0, -1]]) {
      const nc = c + dc, nr = r + dr, k = nc + ',' + nr;
      if (seen.has(k) || edgeBetween(c, r, nc, nr) || !sentryCellWalkable(nc, nr, true)) continue;
      seen.add(k); queue.push([nc, nr]);
    }
  }
  const cell = roomy[i] || spots[Math.min(i, spots.length - 1)]; if (cell) [a.x, a.y] = center(...cell);   // 都沒有空的：照原本最近的格子
  a.navPath = null; a.navGoal = null; a.target = null; a.inviteJoined = true;   // 跟著換地圖過來的：已經在隊伍裡
}
const inviteRand = ([a, b]) => a + Math.random() * (b - a);
// 這個點會不會跟別人（溫特、其他被邀請的人，和他們正要走去的地方）站得太近：上下 1.4 格、左右 0.9 格以內算太近（頭會蓋住別人的臉）
function inviteCrowded(a, x, y) {
  return [G.player, ...G.towers, ...G.npcs].some(o => o && o !== a && (o === G.player || mealGuest(o))
    && [o, o.target].some(q => q && Math.hypot((q.x - x) / (CELL * .9), (q.y - y) / (CELL * 1.4)) < 1));
}
// 站的位置跟站著的溫特、其他被邀請的人疊在一起（走路時可以穿過去，停下來就不要疊著：頭會蓋住臉）
const inviteOverlap = a => [G.player, ...G.towers, ...G.npcs].some(o => o && o !== a && (o === G.player || mealGuest(o)) && !o.moving && Math.hypot((o.x - a.x) / (CELL * .8), (o.y - a.y) / (CELL * 1.25)) < 1);
// 在 (cx,cy) 附近走來走去：到了停一下再挑下一個點（挑不會跟別人擠在一起的點，試幾次都沒有就晚點再挑）；停下來時跟別人疊在一起就不等了，馬上走去空的地方
function inviteWander(a, cx, cy, radius, speed, dt) {
  if (a.waitT > 0) { if (!a.target && inviteOverlap(a)) a.waitT = 0; else { a.waitT -= dt; return; } }
  if (!a.target) {
    for (let k = 0; k < 6 && !a.target; k++) { const t = sampleWanderTarget(cx, cy, radius); if (t && !inviteCrowded(a, t.x, t.y)) a.target = t; }
    if (!a.target) a.waitT = .5;
    return;
  }
  if (moveSentryWithPath(a, a.target.x, a.target.y, speed, dt) || a.navFailed) { a.target = null; a.navPath = null; a.waitT = inviteRand(MEAL_INVITE.wait); }
}
// 排隊把上下的距離算短一點（INVITE_Y）：Q 版角色頭很大，上下只差 1 格的話前面那個人的頭會蓋住後面的臉，看起來像圖層錯了
// 所以上下排隊時間隔約 1 / INVITE_Y 格，左右走照樣 1 格
const INVITE_Y = .7;
const inviteLen = (dx, dy) => Math.hypot(dx, dy * INVITE_Y);
// 溫特走過的路：離上一點 4px 以上就記一點（瞬間移動、搭電梯這種一下跳很遠的，路重新記）；只留排隊用得到的長度
function inviteTrail() {
  const p = G.player, T = mealInvite.trail, last = T[0], d = last ? Math.hypot(p.x - last.x, p.y - last.y) : Infinity;
  if (d > CELL * 3) { T.length = 0; T.push({ x: p.x, y: p.y }); return; }
  if (d < 4) return;
  T.unshift({ x: p.x, y: p.y });
  const need = (MEAL_INVITE.queueCells[0] + MEAL_INVITE.max * MEAL_INVITE.queueCells[1]) * CELL / INVITE_Y / 4 + 20 | 0; if (T.length > need) T.length = need;
}
// 第 i 位排隊的位置：從溫特沿著走過的路往回量 back（上下的距離照 inviteLen 算）
// 路還不夠長（剛邀請完、剛開始走）：順著最後一段路的方向往後延伸（連一段都沒有＝溫特背後），大家才不會擠在同一點
const INVITE_BEHIND = { left: [1, 0], right: [-1, 0], front: [0, -1], back: [0, 1] };   // 溫特面向哪邊 → 背後是哪個方向
function queueSpot(i) {
  const p = G.player, T = mealInvite.trail, back = (MEAL_INVITE.queueCells[0] + i * MEAL_INVITE.queueCells[1]) * CELL;
  let x = p.x, y = p.y, left = back, ux = 0, uy = 0;
  for (const q of T) {
    const d = inviteLen(q.x - x, q.y - y);
    if (d >= left) return { x: x + (q.x - x) * left / d, y: y + (q.y - y) * left / d };
    if (d > 0) { ux = (q.x - x) / d; uy = (q.y - y) / d; }
    left -= d; x = q.x; y = q.y;
  }
  if (!ux && !uy) { const [bx, by] = INVITE_BEHIND[p.dir] || [0, 1]; ux = bx; uy = by / INVITE_Y; }
  return { x: x + ux * left, y: y + uy * left };
}
// 走去排隊的位置：中間沒東西擋就直線平順地走、剛好停在位置上（照格子走的話，每到一格中心那一幀會頓一下、重找路時還會往回退一步，走快的時候看起來抖抖的）；被牆、道具擋住才照格子繞路
// 不管別人：跟原本地圖的人一樣可以直接穿過去（不會被推開、也不會繞路）
function inviteFollow(a, spot, speed, dt) {
  const dx = spot.x - a.x, dy = spot.y - a.y, d = Math.hypot(dx, dy);
  if (d < 1) { a.navPath = null; return; }
  const step = Math.min(d, speed * dt);
  if (personnelStepAllowed(a.x, a.y, spot.x, spot.y, true)) { a.x += dx / d * step; a.y += dy / d * step; a.navPath = null; a.navGoal = null; a.navFailed = false; return; }
  moveSentryWithPath(a, spot.x, spot.y, speed, dt);
}
// 每幀（js/sentry.js 的 updateSentry、updateWanderer 最前面問這裡）：回傳 true＝這幀由這裡控制
function mealInviteStep(a, dt) {
  const speed = a.kind === 'tower' ? TYPES[a.type].walkSpeed || 80 : MEAL_INVITE.npcSpeed;
  if (a.inviteLeave) {   // 吃完了、家在別張地圖：走到出入口就離開這張地圖
    const L = a.inviteLeave; L.t += dt;
    if (!L.to || Math.hypot(L.to.x - a.x, L.to.y - a.y) < CELL * 1.2 || L.t > MEAL_INVITE.leaveTimeout || (a.navFailed && L.t > 1)) {
      G.towers = G.towers.filter(o => o !== a); G.npcs = G.npcs.filter(o => o !== a);
    } else moveSentryWithPath(a, L.to.x, L.to.y, speed, dt);
    return true;
  }
  if (a.inviteLinger > 0 && !mealGuest(a)) {   // 取消邀請、這裡不是他平常待的地圖：徘徊一下再回去
    if (menuSentry === a) { a.target = null; return true; }   // 選單開著：先站好（還可以再邀一次）
    updateNpcTalk(a, dt);
    if ((a.inviteLinger -= dt) <= 0) { a.target = null; a.navPath = null; inviteGoHome(a); return true; }
    inviteWander(a, a.x, a.y, 120, speed, dt);
    return true;
  }
  const g = mealGuestOf(inviteId(a)), p = G.player; if (!g || !p) return false;
  mealInviteMapCheck(); if (!mealGuestOf(g.id)) return false;
  if (g.waitMap) return false;   // 在門外等溫特（這張地圖是他平常待的地方，溫特剛走進別人的房間）：照平常的樣子
  updateNpcTalk(a, dt);
  if (g.stage === 'follow') {
    if (a.inviteMapId !== MAP.id) { placeGuestNearPlayer(a, mealInvite.guests.indexOf(g)); a.inviteMapId = MAP.id; }   // 剛跟著換到這張地圖
    if (mealMapReady() && Math.hypot(p.x - a.x, p.y - a.y) < CELL * 8) {   // 到餐廳了：去拿餐盤（js/meal.js 的 NPC 吃飯流程）
      a.mealCd = 0; a.meal = null;
      if (tryStartMeal(a, true)) { g.stage = 'eat'; return true; }
    }
    if (menuSentry === a) { a.target = null; return true; }   // 選單開著：先站好
    const far = Math.hypot(p.x - a.x, p.y - a.y), R = MEAL_INVITE.radiusCells * CELL;
    inviteTrail();
    const seen = a.inviteSeenP; a.invitePWalk = seen && seen.x === p.x && seen.y === p.y ? (a.invitePWalk || 0) - dt : .25; a.inviteSeenP = { x: p.x, y: p.y };   // 溫特真的有在移動（0.25 秒內位置有變）：按著方向鍵頂著牆不算在走，不然大家會一直排隊、疊在一起站著
    if ((p.moving && a.invitePWalk > 0) || far > R) {   // 溫特在走（或離太遠）：照邀請順序排隊跟上
      const spot = queueSpot(mealInvite.guests.indexOf(g)), behind = Math.hypot(spot.x - a.x, spot.y - a.y);
      a.target = null; a.waitT = .3 + Math.random() * .6;   // 溫特停下來後，先站一下才開始走動
      if (behind < CELL * .8) a.inviteJoined = true;   // 走到自己排的位置＝加入隊伍
      const ps = PLAYER.speed * (typeof equipSpeedMul === 'function' ? equipSpeedMul() : 1);   // 溫特走很快（平常走路的 3 倍左右）：跟的時候用溫特的速度，落後太多再快一點追上
      inviteFollow(a, spot, a.inviteJoined ? Math.max(speed, ps * Math.min(2, 1.02 + behind / CELL * .3)) : speed, dt);   // 加入隊伍後：落後越多走越快（最多 2 倍）；還沒加入：自己平常的速度
      a.inviteStuck = a.navFailed && behind > CELL * 2 ? (a.inviteStuck || 0) + dt : 0;   // 找不到路走到溫特那裡（卡在被隔開的角落）
      if (a.inviteStuck > 2) { placeGuestNearPlayer(a, mealInvite.guests.indexOf(g)); a.inviteStuck = 0; }   // 卡超過 2 秒：直接到溫特身邊，不會一直丟在原地
      return true;
    }
    a.inviteJoined = false;   // 溫特站著、在旁邊自由走動＝暫時離開隊伍：溫特再走時，用自己平常的速度走回排隊的位置
    if (a.target && Math.hypot(a.target.x - p.x, a.target.y - p.y) > R) { a.target = null; a.navPath = null; }   // 溫特站著：在溫特周圍 R 以內走來走去
    inviteWander(a, p.x, p.y, R - 30, speed, dt);
    return true;
  }
  if (g.stage === 'eat') {   // 吃飯：拿餐盤 → 打飯 → 坐下吃 → 回收（mealStep 回傳 false＝收完了）
    if (a.meal && mealStep(a, dt, speed)) return true;
    g.stage = 'after'; g.t = inviteRand(MEAL_INVITE.after); a.target = null; a.waitT = .6;
    return true;
  }
  if (g.stage === 'after') {   // 吃飽了：在餐廳逛一下
    if ((g.t -= dt) <= 0) { endMealInvite(a, true); return true; }
    inviteWander(a, a.x, a.y, 120, speed, dt);
    return true;
  }
  return false;
}
