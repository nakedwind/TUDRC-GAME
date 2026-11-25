/* ===== 隊員去不了：說出原因 =====
   叫隊員過去（跟隨護衛部隊長、指派巡邏點、返回基地巡邏）卻走不到時，不要讓他站著不動、提示還寫「正前往」。
   ・下指令的當下：先試著找路，找不到就直接說原因（js/game.js、js/team.js、js/sentry.js 的 setSentryEscort 呼叫）。
   ・走到一半卡住（例如路被新蓋的路障擋住）：連續 SENTRY_BLOCKED.stuckSec 秒沒前進，就在隊員頭上和左下的通知說原因。
   原因是用「拿掉某樣東西再找一次路」查出來的：拿掉建築就找得到路＝被建築擋住，依此類推。 */
const SENTRY_BLOCKED = {
  stuckSec: 2.5,     // 連續幾秒沒前進才算卡住
  checkSec: 3,       // 卡住時隔幾秒重新查一次原因（查路比較花時間）
  repeatSec: 12,     // 同一個原因隔多久再提醒一次
};

// 自己身上的狀態讓他動不了（這些恢復了就會自己過去）
function sentryStatusBlock(t) {
  if (t.hp <= 0) return '失去戰鬥能力，無法行動';
  if (t.berserk) return '暴走中，不聽指令';
  if (t.eatenBy) return '被吞進嘴裡，動不了';
  if (t.grabbed || t.grabFall) return '被抓住了，動不了';
  if (t.rootT > 0 || t.vineCap) return '被藤蔓纏住了，掙脫後才會過去';
  if (t.mothConfuseT > 0) return '陷入混亂，恢復後才會過去';
  if (t.frozenT > 0) return '被凍住了，解凍後才會過去';
  if (t.sleepT > 0) return '睡著了，醒來後才會過去';
  if (t.dazeT > 0) return '頭暈中，恢復後才會過去';
  if (t.drowning) return '正在溺水，先逃上岸';
  if (t.mrtRide) return '正在搭捷運';
  return null;
}

// 暫時拿掉某樣東西做事，做完一定還原
function withoutBuildings(fn) { const keep = G.grid; G.grid = {}; try { return fn(); } finally { G.grid = keep; } }
function withoutHazards(fn) {   // 火海、酸液
  const fire = window.oilFireAt, acid = window.acidHazardAt;
  if (typeof fire === 'function') window.oilFireAt = () => false;
  if (typeof acid === 'function') window.acidHazardAt = () => false;
  try { return fn(); } finally { if (typeof fire === 'function') window.oilFireAt = fire; if (typeof acid === 'function') window.acidHazardAt = acid; }
}
function withDoorsOpen(fn) {   // 關著的門（js/doors.js）
  const closed = typeof doorAddedWalls !== 'undefined' ? [...doorAddedWalls].filter(k => mapWalls.has(k)) : [];
  closed.forEach(k => mapWalls.delete(k));
  try { return fn(); } finally { closed.forEach(k => mapWalls.add(k)); }
}

// 隊員 t 走不走得到 (x, y)；走不到就回傳原因（一句話），走得到回傳 null
// dark：可以穿過黑暗（召喚、跟著部隊長走）；floor：目的地在幾樓（跟著部隊長時＝部隊長那層）；where：目的地叫什麼（寫進原因裡）
function sentryBlockReason(t, x, y, { dark = true, floor = null, where = '那裡' } = {}) {
  if (!t || !G) return null;
  const own = sentryStatusBlock(t); if (own) return own;
  if (!t.swimRing && typeof deepWaterAtPoint === 'function' && deepWaterAtPoint(x, y)) return where + '在深水區，沒有救生圈不能下水';
  const find = () => buildSentryPath(t, x, y, dark, floor);
  if (find() !== null) return null;   // 找得到路
  if (typeof trackSentryCanCross === 'function' && trackSentryCanCross(t, x, y)) return null;   // 隔著捷運軌道：可以跳進軌道穿過去（js/mrt-track.js）
  if (!dark && typeof personnelInLight === 'function' && !personnelInLight(x, y)) return where + '太暗了，隊員不敢過去';
  if (withoutBuildings(find) !== null) return '路被建築（路障、防禦設施等）擋住了';
  if (withoutHazards(find) !== null) return '路上有火海或酸液，等它消失才過得去';
  if (withDoorsOpen(find) !== null) return '中間的門關著，打開門才過得去';
  if (typeof hasFloors !== 'undefined' && hasFloors && floor && typeof actorFloor === 'function' && actorFloor(t) !== floor) return where + '在 ' + floor + ' 樓，找不到上下樓的路';
  return '中間被牆或封住的入口隔開，沒有路能過去';
}

// 部隊長（或艾德林帶隊時的隊長）怎麼稱呼
const leaderLabel = () => (typeof PLAYER_CHARACTER !== 'undefined' && PLAYER_CHARACTER !== 'winter' ? '隊長' : '部隊長') + '身邊';
// 跟著部隊長走時查原因
function sentryLeaderBlockReason(t) {
  if (!G || !G.player) return null;
  return sentryBlockReason(t, G.player.x, G.player.y, { dark: true, floor: typeof hasFloors !== 'undefined' && hasFloors ? actorFloor(G.player) : null, where: '部隊長' });
}

// 說出原因：隊員頭上＋左下通知（警告色）
function sayBlocked(t, goal, reason) {
  t.blockReason = reason; t.blockSaidAt = performance.now();
  if (typeof sentryStatus === 'function') sentryStatus(t, '去不了' + goal + '：' + reason, '#ffb26b', true);
}

// 每幀在「正要走去某處」時呼叫（js/sentry.js）：連續一段時間沒前進就查原因並說出來
// goal：說給玩家聽的目的地（例如「巡邏點」）；reasonFn：查原因的函式
function watchSentryProgress(t, dt, goal, reasonFn) {
  const moved = t.blockLastX === undefined || Math.hypot(t.x - t.blockLastX, t.y - t.blockLastY) > .3;
  t.blockLastX = t.x; t.blockLastY = t.y;
  if (moved && !t.navFailed) { t.blockT = 0; t.blockReason = null; return; }
  t.blockT = (t.blockT || 0) + dt;
  if (t.blockT < SENTRY_BLOCKED.stuckSec) return;
  t.blockCheckT = (t.blockCheckT || 0) - dt;
  if (t.blockCheckT > 0) return;
  t.blockCheckT = SENTRY_BLOCKED.checkSec;
  const reason = reasonFn() || '被卡住了，走不出去';
  const since = (performance.now() - (t.blockSaidAt || 0)) / 1000;
  if (reason !== t.blockReason || since >= SENTRY_BLOCKED.repeatSec) sayBlocked(t, goal, reason);
}
// 不是在走路（到了、換指令）：把卡住的計時歸零
function resetSentryProgress(t) { t.blockT = 0; t.blockLastX = undefined; }
