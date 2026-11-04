// ---- 基地裡跟著溫特換地圖（雷德平常就跟著溫特：js/sentry.js 的 sentryCompanionRule、data/characters.js 的 follow）----
// 溫特走到 2F 以外的地圖時，剛剛跟溫特在同一張地圖、又是「自由走動」（照平常跟著溫特）的話，就一起過去（走樓梯／門：晚一兩秒從那裡走出來；搭電梯：一起搭）
// 2F 照原本的樣子：在平常的位置（data/npc-locations.js），不跟著溫特在 2F 的地圖之間換來換去；只有辦公室、哨兵休息室、疏導室（溫特辦公室除外）會跟進去，再一起走回來
// 溫特辦公室、別人的寢室不進去（js/meal-invite.js 的 inviteCanEnter）：留在原本那張地圖等，溫特回到那張地圖時站在溫特旁邊（門口），再一起走
// 出勤、練習＝回到平常的位置（data/npc-locations.js）
const BASE_FOLLOW = { ids: ['red'], homeFloor: /^2F/, office: /辦公室|哨兵休息室|疏導室/, delay: [1, 2] };   // homeFloor：這些地圖照原本的樣子（雷德在平常的位置，不跨地圖跟）；office：2F 裡面照樣跟進去的地方（辦公室、哨兵休息室、疏導室；溫特辦公室由 js/meal-invite.js 的 MEAL_INVITE.noEnter 擋掉）；其他地圖晚 delay 秒才從溫特走進來的樓梯／門口走出來
const baseFollow = { mapId: null, mapName: null, at: {}, came: {}, off: {}, waiting: {}, pending: [] };   // at[id]＝現在在哪張地圖（沒有＝平常的位置）；came[id]＝剛過來（'follow' 跟過來、'wait' 在門外等到溫特出來）；pending＝還沒從樓梯走出來的人；off[id]＝溫特叫他原地巡邏、去別的地方（不跟）
function baseFollowMapCheck() {
  if (!MAP || baseFollow.mapId === MAP.id) return;
  const from = baseFollow.mapName;
  baseFollow.mapId = MAP.id; baseFollow.mapName = MAP.name; baseFollow.came = {}; baseFollow.pending = [];
  if (!MAP_SAFE || (typeof practiceOn === 'function' && practiceOn())) { baseFollow.at = {}; baseFollow.waiting = {}; return; }
  for (const id of BASE_FOLLOW.ids) {
    const was = baseFollow.at[id] || (npcLocationTable()[id] || {}).map;   // 他剛剛在哪張地圖
    if (BASE_FOLLOW.homeFloor.test(MAP.name) && !(BASE_FOLLOW.office.test(MAP.name) && inviteCanEnter(id, MAP.name))) {   // 2F（辦公室以外）：照原本的設定（在平常的位置、只在同一張地圖裡跟著溫特）
      const back = from && was === from && BASE_FOLLOW.office.test(from) && !baseFollow.off[id] && MAP.name === (npcLocationTable()[id] || {}).map;   // 跟著溫特從辦公室（休息室、疏導室）走回自己平常待的地圖：一樣晚一兩秒從門口走出來
      baseFollow.at[id] = null; baseFollow.waiting[id] = false; if (back) baseFollow.came[id] = 'follow';
      continue;
    }
    if (baseFollow.waiting[id] && was === MAP.name) { baseFollow.waiting[id] = false; baseFollow.came[id] = 'wait'; continue; }   // 溫特從房間出來、回到他等的這張地圖：站在溫特旁邊（門口），不是跑回平常的位置
    if (!from || was !== from || baseFollow.off[id]) continue;   // 剛剛不在溫特身邊那張地圖：不跟
    if (typeof inviteCanEnter === 'function' && !inviteCanEnter(id, MAP.name)) { baseFollow.at[id] = from; baseFollow.waiting[id] = true; continue; }   // 不能進去：在門外（剛剛那張地圖）等（他自己要跟的，不跳提示）
    baseFollow.at[id] = MAP.name; baseFollow.came[id] = 'follow'; baseFollow.waiting[id] = false;
  }
}
// 這個人現在在哪（js/sentry.js 的 npcLocation 問）：null＝照平常的位置
function baseFollowLocation(id, home) {
  if (!BASE_FOLLOW.ids.includes(id)) return null;
  baseFollowMapCheck();
  const m = baseFollow.at[id];
  return m && m !== (home && home.map) ? { map: m } : null;   // 跟到自己平常待的地圖：照平常的設定（活動範圍、出生點）
}
// 每幀（js/sentry.js 的 updateSentry）：剛跟過來的放到溫特旁邊；記下現在是不是自由走動
function baseFollowStep(t) {
  if (!BASE_FOLLOW.ids.includes(t.type) || !MAP_SAFE) return;
  baseFollowMapCheck();
  baseFollow.off[t.type] = t.mode !== 'free';
  if (baseFollow.came[t.type] && G.player) { baseFollow.came[t.type] = false; placeGuestNearPlayer(t, 0); t.inviteJoined = false; }   // 溫特已經站到這張地圖的門口了
}
// 換地圖時溫特一站到門口就呼叫（js/game.js 的 enterPortal，畫第一幀之前）：跟過來的雷德、被邀請吃飯的人馬上放到溫特旁邊
// 不然過場淡入時會先在平常出生的地方出現，等遊戲開始動才瞬移到溫特身邊
function placeArrivedFollowers(byElevator) {   // byElevator：溫特搭電梯來的＝雷德一起搭，電梯門一開就跟溫特一起站在電梯前（不會等電梯關了才突然冒出來）
  if (!G.player || !MAP) return;
  baseFollowMapCheck();
  let i = 0;
  for (const a of [...G.towers, ...G.npcs]) {
    const g = typeof mealGuestOf === 'function' && mealGuest(a) ? mealGuestOf(inviteId(a)) : null;
    if (g && g.stage === 'follow' && !g.waitMap && a.inviteMapId !== MAP.id) { placeGuestNearPlayer(a, mealInvite.guests.indexOf(g)); a.inviteMapId = MAP.id; i = Math.max(i, mealInvite.guests.indexOf(g) + 1); }
  }
  for (const t of G.towers.slice()) {
    const how = baseFollow.came[t.type]; if (!how) continue;
    baseFollow.came[t.type] = false;
    if (how === 'follow' && !byElevator) {   // 晚一點才從溫特走進來的地方走出來：先從地圖上拿掉
      G.towers = G.towers.filter(o => o !== t);
      baseFollow.pending.push({ t, left: BASE_FOLLOW.delay[0] + Math.random() * (BASE_FOLLOW.delay[1] - BASE_FOLLOW.delay[0]), extra: 2, x: G.player.x, y: G.player.y });
      continue;
    }
    placeGuestNearPlayer(t, i++); t.inviteJoined = false;
  }
}
// 每幀（js/game.js 的 update）：看溫特換地圖沒；時間到就讓還沒出來的人從樓梯／門口走出來
// 出來的地方＝溫特剛走進這張地圖時站的位置；溫特還站在那裡就多等一下（最多 extra 秒），不然出來就疊在溫特身上
function baseFollowTick(dt) {
  baseFollowMapCheck();
  for (const w of baseFollow.pending.slice()) {
    if ((w.left -= dt) > 0) continue;
    const p = G.player, close = p && Math.hypot(p.x - w.x, p.y - w.y) < CELL * 1.2;
    if (close && (w.extra -= dt) > 0) continue;
    baseFollow.pending = baseFollow.pending.filter(o => o !== w);
    const t = w.t; t.x = w.x; t.y = w.y;
    if (close) {   // 溫特一直站在門口：站到門口旁邊的空格
      const [c0, r0] = cellAt(w.x, w.y), spot = [[0, 1], [1, 0], [-1, 0], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]].map(([dc, dr]) => [c0 + dc, r0 + dr]).find(([c, r]) => sentryCellWalkable(c, r, true) && Math.hypot((center(c, r)[0] - p.x) / (CELL * .9), (center(c, r)[1] - p.y) / (CELL * 1.4)) >= 1);   // 左右 0.9、上下 1.4 格以內太近（正下方 1 格＝溫特踩在頭上）
      if (spot) [t.x, t.y] = center(...spot);
    }
    t.navPath = null; t.navGoal = null; t.waitT = 0; t.moving = false;
    if (p) { const d = Math.hypot(p.x - t.x, p.y - t.y) || 1, step = Math.min(CELL * 1.5, d - CELL * 1.2); if (step > 4) t.target = { x: t.x + (p.x - t.x) / d * step, y: t.y + (p.y - t.y) / d * step }; }   // 走出來：先往溫特那邊走一兩步（停在溫特前面 1 格多，不會走到溫特身上）
    G.towers.push(t);
  }
}
