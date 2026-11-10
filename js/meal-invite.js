// ============================================================
//  邀請隊員、基地的 NPC 一起去餐廳吃飯（基地裡靠近對方按空白鍵打開對話框 → 右邊選項「🍽️ 一起去吃飯」）
//  ・同時最多邀 MEAL_INVITE.max 人（隊員、NPC 合起來算）；再點一次＝取消邀請
//  ・跟著溫特：不排隊，一直在溫特周圍 radiusCells 格以內自由走來走去；溫特走開、離超過 radiusCells 格，就挑溫特附近一個點，用自己平常的速度慢慢追過去（不會加速）
//    換樓層、換地圖也跟著，到了出現在溫特旁邊
//  ・個人房間（名字有「寢室」「房間」又有角色名字的地圖，宿舍樓走廊、B3-管制寢室這種整層樓不算）：只有房間的主人跟進去，其他人在門外那張地圖等，溫特出來再跟上
//  ・另外指定不能跟進去的地方：MEAL_INVITE.noEnter（地圖名字 → 誰不能進去），一樣在門外等
//  ・冷卻：吃完一盤（被邀請去吃、自己去餐廳吃都算）MEAL_INVITE.cooldownMin 分鐘內不能再邀請；用真實時間算，存在瀏覽器（tudrc_meal_invite_cd_v1），重新整理也不會重來
//  ・答應時頭上說的話：對話編輯器的「接受吃飯邀請」（data/dialogues.js 的 mealInvite），沒填就不說
//  ・到了有餐盤架、打飯台、回收區的地圖（餐廳）：自己去拿餐盤、打飯、坐下吃、回收（js/meal.js 的 NPC 吃飯流程）
//  ・吃完在餐廳逛一下（after 秒），再走回自己平常待的地方（同一張地圖＝走回活動範圍；別張地圖＝走往家的方向的出入口離開，homeExit），邀請結束
//  ・飯後加成只有溫特有：桌上的餐盤是客人的（owner 不是 'player'），吃完不會加（js/meal.js 的 updateMeal）
//  ・只存在這一趟（沒存進存檔）；離開基地去出勤、溫特先離開餐廳（還在吃的人留下）＝邀請結束，大家回到平常的位置
// ============================================================
const MEAL_INVITE = { cooldownMin: 10, noEnter: { '2F溫特辦公室': ['red'] }, max: 4, radiusCells: 2, wait: [.6, 1.8], after: [8, 14], cancelWander: [4, 8], leaveTimeout: 25, npcSpeed: 65 };   // radiusCells＝跟著溫特時，離溫特幾格以內自由走動；npcSpeed＝NPC 平常走路的速度（js/sentry.js 的 updateWanderer）
const mealInvite = { guests: [], mapId: null, mapName: null };   // guests：[{ id, stage: 'follow'|'eat'|'after', t（逛多久） }]
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
  mealInvite.mapId = MAP.id; mealInvite.mapName = MAP.name;
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
// 對話框右邊要不要出現「一起去吃飯」這個選項：在基地裡、可以邀請（或已經邀請了，可以取消）的人才有
// （js/game.js 的 canTalk 也問這裡：沒有台詞、但可以邀請吃飯的人，靠近一樣能按空白鍵打開對話框）
const mealInviteOffered = a => !!(a && MAP_SAFE && (mealGuest(a) || canMealInvite(a)));
// 打開對話框時（js/game.js 的 openDialogue 呼叫）：設定「一起去吃飯」按鈕的字、要不要顯示
function onDialogueOpenedMealInvite(a) {
  const b = document.getElementById('dialogueMealInvite'); if (!b) return;
  const show = mealInviteOffered(a);
  b.classList.toggle('hidden', !show); b.style.opacity = '';
  if (!show) return;
  const left = mealGuest(a) ? 0 : inviteCdLeft(inviteId(a));
  if (mealGuest(a)) b.textContent = '🍽️ 不吃了（取消邀請）';
  else if (left) { b.textContent = '🍽️ 剛吃飽（' + Math.ceil(left / 60000) + ' 分鐘後）'; b.style.opacity = '.55'; }   // 冷卻中：按了只會跳提示
  else b.textContent = '🍽️ 一起去吃飯（' + mealInvite.guests.length + '/' + MEAL_INVITE.max + '）';
}
// 按下對話框的「一起去吃飯」：關掉對話框，邀請（或取消邀請）這個人
document.getElementById('dialogueMealInvite')?.addEventListener('click', () => {
  const a = dialogueState && dialogueState.actor; closeDialogue(true);
  if (a) toggleMealInvite(a);
});
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
  a.inviteMapId = MAP.id; if (a.kind === 'tower') a.mode = 'free';
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
  const doors = (mapPortals || []).filter(pt => !pt.hidden && !pt.elevator && pt.to !== MAP.id).map(pt => ({ to: pt.to, x: center(pt.c, pt.r)[0], y: center(pt.c, pt.r)[1] }));
  if (goal) {
    const first = new Map(doors.map(d => [d.to, d.to])), queue = [...first.keys()];   // 每張地圖：從這裡出去要先走哪個出口
    for (let i = 0; i < queue.length && !first.has(goal.id); i++) {
      const m = maps.find(x => x.id === queue[i]);
      for (const pt of (m && m.portals) || []) if (!pt.hidden && !pt.elevator && !first.has(pt.to) && pt.to !== MAP.id) { first.set(pt.to, first.get(queue[i])); queue.push(pt.to); }
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
  a.navPath = null; a.navGoal = null; a.target = null;
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
// 追上溫特時走去挑好的點：中間沒東西擋就直線平順地走、剛好停在位置上（照格子走的話，每到一格中心那一幀會頓一下、重找路時還會往回退一步，走快的時候看起來抖抖的）；被牆、道具擋住才照格子繞路
// 不管別人：跟原本地圖的人一樣可以直接穿過去（不會被推開、也不會繞路）
function inviteFollow(a, spot, speed, dt) {
  const dx = spot.x - a.x, dy = spot.y - a.y, d = Math.hypot(dx, dy);
  if (d < 1) { a.navPath = null; return; }
  const step = Math.min(d, speed * dt);
  if (personnelStepAllowed(a.x, a.y, spot.x, spot.y, true)) { a.x += dx / d * step; a.y += dy / d * step; a.navPath = null; a.navGoal = null; a.navFailed = false; return; }
  moveSentryWithPath(a, spot.x, spot.y, speed, dt);
}
// 追上溫特要走去哪：在溫特 2 格內挑幾個點，選離自己最近、又不會跟別人擠在一起的（走最短的路追上，不會繞到溫特另一邊）；都挑不到就走向溫特
function inviteCatchSpot(a, p, R) {
  let best = null, bd = Infinity;
  for (let k = 0; k < 6; k++) {
    const t = sampleWanderTarget(p.x, p.y, Math.max(10, R * .8 - 30)); if (!t || inviteCrowded(a, t.x, t.y)) continue;
    const d = Math.hypot(t.x - a.x, t.y - a.y); if (d < bd) { best = t; bd = d; }
  }
  return best || { x: p.x, y: p.y };
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
    if (a.target && Math.hypot(a.target.x - p.x, a.target.y - p.y) > R) { a.target = null; a.navPath = null; }   // 溫特走開了：原本要去的點離溫特太遠，換一個
    if (far > R) {   // 離溫特超過 2 格：挑溫特附近一個點追過去（不排隊，每個人各自挑）
      a.waitT = 0;
      if (!a.target) a.target = inviteCatchSpot(a, p, R);
      inviteFollow(a, a.target, speed, dt);   // 用自己平常走路的速度慢慢追（不會加速）：溫特走得快就會落後，溫特停下來後才慢慢走回 2 格以內
      if (Math.hypot(a.target.x - a.x, a.target.y - a.y) < 2) { a.target = null; a.navPath = null; a.waitT = inviteRand(MEAL_INVITE.wait); }
      if (a.navFailed && a.target) { a.target = null; a.navPath = null; }   // 走不到挑好的點：下一幀換一個點
      a.inviteStuck = a.navFailed ? (a.inviteStuck || 0) + dt : 0;   // 一直找不到路走到溫特那裡（卡在被隔開的角落）
      if (a.inviteStuck > 2) { placeGuestNearPlayer(a, mealInvite.guests.indexOf(g)); a.inviteStuck = 0; }   // 卡超過 2 秒：直接到溫特身邊，不會一直丟在原地
      return true;
    }
    inviteWander(a, p.x, p.y, Math.max(10, R - 30), speed, dt);   // 在溫特 2 格以內：用平常的速度自由走來走去
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
