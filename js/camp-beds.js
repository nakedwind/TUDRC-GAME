/* ===== 作戰基地的行軍床（地圖素材「行軍床」tile_field_camp_bed／tile_field_camp_bed_v）=====
   戰鬥地圖的營地有擺行軍床的話：
   ・隊員（哨兵、嚮導）脫離戰鬥 CAMP_BED.calm 秒、而且 HP 低於 CAMP_BED.below（50%）：自己走回營地，躺上空的行軍床。
     躺 CAMP_BED.rest 秒，每秒回 CAMP_BED.regen HP；時間到自動下床，在床邊「原地巡邏」。
     躺滿起床後 CAMP_BED.cooldown 秒內不會再去躺（就算 HP 還是不到一半）；躺到一半被打斷的不算。
     走過去的路上、躺著的時候被打：馬上起來應戰。
   ・溫特自己躺（靠近行軍床按 Space）：身為主管正大光明睡覺不可取，每 2 秒只回 1 HP（CAMP_BED.winterRegen），一樣躺 10 秒自動起來。
   ・「脫離戰鬥」＝沒被打、沒在攻擊（附近有怪物但沒在打他、他也沒在打怪，一樣算）。
   必須在 js/game.js 之前載入（game.js 的 update 會呼叫這裡）。
*/
const CAMP_BED = {
  ids: ['tile_field_camp_bed', 'tile_field_camp_bed_v'],   // 哪些素材算行軍床
  calm: 5,              // 脫離戰鬥幾秒後才去躺
  below: .5,            // HP 低於最大值的幾成才去躺
  rest: 10,             // 躺幾秒
  regen: 2,             // 隊員：每秒回幾 HP
  winterRegen: .5,      // 溫特：每秒回幾 HP（2 秒 1 HP）
  walkSpeed: 1.2,       // 走回營地的速度（走路速度的幾倍）
  retry: 4,             // 走不過去（被擋住）時，幾秒後才再試
  cooldown: 60,         // 躺滿起床後，幾秒內不會再去躺（躺到一半被打斷不算）
};
// 這張地圖上的行軍床座位（js/game.js 的 mapSeats 裡，位置對得上行軍床素材的那幾個）
let campBedCache = { map: null, list: [] };
function campBedSeats() {
  if (campBedCache.map === MAP && campBedCache.seats === mapSeats()) return campBedCache.list;
  const spots = new Set((MAP.stamps || []).filter(s => CAMP_BED.ids.includes(s.id)).map(s => (s.c * CELL + (s.ox || 0)) + ',' + (s.r * CELL + (s.oy || 0))));
  const list = spots.size ? mapSeats().filter(s => s.bed && spots.has(s.x0 + ',' + s.y0)) : [];
  campBedCache = { map: MAP, seats: mapSeats(), list };
  return list;
}
const isCampBed = seat => !!seat && campBedSeats().includes(seat);
// 隊員正在打仗嗎：被打、在攻擊（暴走也算）
const inCombat = t => t.hitT > 0 || !!t.meleeSwing || !!t.gunSwing || t.berserk;

// ---- 每幀（game.js 的 update 呼叫）：計算脫離戰鬥多久、要不要去躺；溫特躺床 ----
function updateCampBeds(dt) {
  if (MAP_SAFE || !G.player) return;
  const beds = campBedSeats();
  for (const t of G.towers) {
    if (t.hp <= 0 || inCombat(t)) t.calmT = 0; else t.calmT = (t.calmT || 0) + dt;
    if (t.bedRetryT > 0) t.bedRetryT -= dt;
    if (!beds.length || t.cot || t.hp <= 0 || t.hp >= t.maxhp * CAMP_BED.below || t.calmT < CAMP_BED.calm || t.bedRetryT > 0) continue;
    if (t.eatenBy || t.rootT > 0 || t.sleepT > 0 || t.dazeT > 0 || t.grabbed || t.grabFall || t.frozenT > 0 || t.berserk || t.mode === 'goto') continue;   // 玩家剛下的「前往」指令先照做
    const seat = beds.find(s => !seatTaken(s, t)), approach = seat && seatApproachPoint(seat);
    if (!approach) continue;
    t.cot = { seat, approach, phase: 'walk', t: 0 }; t.seatGoal = { seat, approach };   // seatGoal：先佔住這張床，別人不會搶
    t.target = null; t.navPath = null; t.navGoal = null;
    sentryStatus(t, '回營地行軍床休息', '#9fd3ff');
  }
  // 溫特：躺在行軍床上每 2 秒回 1 HP，躺滿 10 秒自己起來
  const p = G.player;
  if (p.sitting && isCampBed(p.sitting)) {
    p.cotT = (p.cotT || 0) + dt;
    if (p.hp > 0) p.hp = Math.min(p.maxhp, p.hp + CAMP_BED.winterRegen * dt);
    if (p.cotT >= CAMP_BED.rest) { standUp(); p.cotT = 0; }
  } else p.cotT = 0;
}
// ---- 隊員走去床邊／躺著（game.js 的哨兵走動那一段呼叫；回傳 true＝這幀由這裡控制，不跑一般的巡邏 AI）----
function campBedStep(t, dt) {
  const c = t.cot; if (!c) return false;
  const stop = (msg, retry = 0) => {   // 中斷：放開床位
    if (t.sitting === c.seat) { t.sitting = null; if (c.approach) { t.x = c.approach.x; t.y = c.approach.y; } }
    t.seatGoal = null; t.cot = null; t.bedRetryT = retry;
    if (msg) sentryStatus(t, msg, '#ffd479');
    return false;
  };
  if (MAP_SAFE || t.hp <= 0 || t.berserk || t.eatenBy || t.grabbed || t.grabFall || t.sleepT > 0 || t.rootT > 0) return stop();
  if (c.phase === 'walk') {
    if (t.hitT > 0) return stop('被攻擊了，先應戰');
    c.t += dt;
    const arrived = moveSentryWithPath(t, c.approach.x, c.approach.y, (TYPES[t.type].walkSpeed || 80) * CAMP_BED.walkSpeed, dt);
    if (t.navFailed || c.t > 25) return stop('', CAMP_BED.retry);   // 走不到：過一下再試
    if (!arrived) return true;
    c.phase = 'rest'; c.t = 0; t.seatGoal = null;
    t.sitFrom = { x: t.x, y: t.y }; t.sitting = c.seat; t.x = c.seat.x; t.y = c.seat.y; t.dir = c.seat.dir; t.navPath = null;
    return true;
  }
  // 躺著：不動、不攻擊（game.js 的攻擊那段會跳過），每秒回血
  if (t.hitT > 0) return stop('被攻擊了，起來應戰');
  c.t += dt;
  t.x = c.seat.x; t.y = c.seat.y; t.moving = false;
  t.hp = Math.min(t.maxhp, t.hp + CAMP_BED.regen * dt);
  if (c.t < CAMP_BED.rest) return true;
  // 躺滿：下床，在床邊原地巡邏
  t.sitting = null; t.x = c.approach.x; t.y = c.approach.y; t.cot = null; t.calmT = 0; t.bedRetryT = CAMP_BED.cooldown;   // 冷卻：一段時間內不再去躺
  t.mode = 'hold'; t.anchor = { x: t.x, y: t.y }; t.guardSummoned = false; t.guardBase = null; t.target = null; t.waitT = .5;
  sentryStatus(t, '休息完畢，在基地附近巡邏', '#7ee0c0');
  return true;
}
// 被玩家召喚：放開床位、躺著的先下床（game.js 的召喚至此呼叫）；冷卻一段時間，免得一到目的地又跑回去躺
function leaveCampBed(t) {
  const c = t.cot; if (!c) return;
  if (t.sitting === c.seat) { t.sitting = null; if (c.approach) { t.x = c.approach.x; t.y = c.approach.y; } }
  t.seatGoal = null; t.cot = null; t.calmT = 0; t.bedRetryT = CAMP_BED.cooldown;
}
const campBedResting = t => !!(t && t.cot && t.cot.phase === 'rest');
