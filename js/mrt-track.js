/* ===== 捷運軌道：跳下、跳上、列車撞人 =====
   軌道格在 🗺️ 地圖編輯器用「🛤️ 軌道」筆刷畫（MAP.track）。
   ・溫特：站在軌道旁邊的月台上，頭上出現【跳下】，按空白鍵小跳一下進到軌道裡；在軌道裡靠近月台邊出現【跳上】，按空白鍵跳回月台。
   ・在軌道裡的人只能在軌道格裡走（月台、停著的列車都是牆）；不在軌道裡的人走不進軌道（停著的列車車廂照樣可以上車）。
     走路、找路的規則在 js/pathfinding.js 的 trackCtx（照每個人的 a.inTrack 設），這裡只管「跳」和「誰要跳」。
   ・隊友：跟著溫特的隊友（自由行動、護衛），溫特跳進軌道就走到最近的月台邊跟著跳進去；溫特跳上去就跟著跳上來。
     隔著軌道（自己和要跟的人都在月台上、但月台走不過去）：從自己這邊跳進軌道、走到對面再跳上去
     （那條軌道的列車 MRT_TRACK.crossWarn 秒內要到、或正在進站／開走時不跳；別條軌道的車不管）。
     「前往」巡邏點、部隊長身邊也一樣：目的地在軌道對面就穿過去；下指令時也把這條路算進去（js/sentry-blocked.js）。
     列車來了不會自己逃（照使用者的設定）：要玩家自己帶出來，或用右鍵把隊友從軌道裡拉出來（js/grab.js 放下時照落點決定在不在軌道裡）。
   ・怪物：附近（MRT_TRACK.chaseRange 格內、看得到）的溫特或隊員在軌道裡，就走到最近的月台邊跳進去追；
     自己在軌道裡、要追的人不在軌道裡（或沒有目標），就走到最近的月台邊跳上來。
     要追的人在軌道對面的月台上（月台走不過去）：從自己這邊跳進軌道、穿過去，在那個人附近跳上來（trackEnemyCross）。
   ・列車進站、開走時，車身經過的地方：軌道裡的溫特、隊員、怪物被撞飛到月台上（離開軌道），
     落地後溫特、隊員失去戰鬥能力、怪物死亡；蓋在軌道上的建築被撞破。
     撞到時有放大版的鳥頭人撞擊特效、畫面震動；溫特、隊員被撞播 trainHit（slime-hit＋小撞擊）。
     BOSS、飛在空中的怪物（人面蝶）不會被撞。
   ・擊退彈：月台上的怪物被推到軌道邊，會掉進軌道裡（不算撞牆、不會撞暈）；在軌道裡被推照樣撞月台邊（trackKnockFall，js/special-guns.js 的 updateKnocks 呼叫）。
     會飛的、自己有特殊走法的 BOSS 不會掉進去（照樣撞牆）。
   ・BOSS：只在列車沒有要來的時候才會跳進軌道；在軌道裡發現列車要來了，就先跳上月台。
     自己有特殊走法的 BOSS（人面蝶后、老鼠王、虱目魚王、池核 BOSS…）不會跳進軌道。
   數值都在下面的 MRT_TRACK。
*/
const MRT_TRACK = {
  jumpTime: .5,       // 跳一次幾秒
  jumpHeight: 32,     // 跳起來多高（像素）
  jumpSound: .6,      // 跳的聲音大小（音效 trackJump，音效編輯器可再調倍率）
  landSound: .9,      // 落地聲大小（音效 place「放置」，跟蓋建築共用，所以在這裡調、不要改音效編輯器的倍率）
  flingTime: .75,     // 被列車撞飛：在空中飛幾秒
  flingHeight: 78,    // 被列車撞飛：飛多高（像素）
  flingFar: 1.5,      // 被列車撞飛：落在月台邊再往月台裡面幾格（前面有牆就近一點）
  impactScale: 2.2,   // 撞擊特效放大幾倍（鳥頭人撞人的特效是 1 倍）
  reach: 30,          // 溫特離月台邊（或軌道邊）多近才出現【跳下】【跳上】（像素，從那一格的中間算）
  jumpAt: 8,          // 隊友、怪物走到離跳點多近就跳（像素）
  chaseRange: 9,      // 怪物追進軌道：目標在幾格內才追
  crossWarn: 3,      // 隊友穿過軌道：那條軌道的列車還有幾秒就到（或正在進站、開走）時，先不跳進去
  bossWarn: 10,       // BOSS：列車還有幾秒就到（或正在進站、開走）時，不跳進軌道、在裡面的先跳出來
  fallHeight: 12,    // 被擊退彈推進軌道：掉下去時先往上彈多高（像素，比一般跳低）
  sentrySpeedMul: 1.25,   // 隊友走去跳點時腳步快一點
  crossCheck: 1,     // 隊友隔著軌道：每幾秒檢查一次「走得過去嗎？要不要穿過軌道」
  crossNear: 2.5,    // 隊友隔著軌道：離要跟的人幾格內就不穿過去
  crossExit: 16,     // 隊友隔著軌道：對面離要跟的人最近的跳點要在幾格內，才穿過去（太遠表示人不在軌道對面，不跳）
  promptDown: '跳下', promptUp: '跳上',
};
const inTrackNow = a => !!(a && a.inTrack && a.inTrackMap === MAP);
function setInTrack(a, on) {
  a.inTrack = !!on; a.inTrackMap = MAP; a._fk = null;
  a.navPath = null; a.navGoal = null; a.navFailed = false; a.navStall = 0;   // 隊員：換了一個世界，原本的路不能用
  a.aiPath = null; a.aiGoal = null; a.seekStep = null; a.trackRoute = null; // 怪物
}

// ---- 跳點：軌道格旁邊（上下左右）一格走得到的月台格。u＝月台那格的中間、d＝軌道那格的中間 ----
let trackEdgeCache = { map: null, n: -1, walls: -1, list: [] };
function trackEdges() {
  if (!trackCells.size) return [];
  const c0 = trackEdgeCache;
  if (c0.map === MAP && c0.n === trackCells.size && c0.walls === mapWalls.size) return c0.list;
  const list = [], keep = trackCtx;
  trackCtx = false;   // 月台那格照月台上的規則判斷
  try {
    for (const k of trackCells) {
      const [c, r] = k.split(',').map(Number);
      for (const [dc, dr] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
        const nc = c + dc, nr = r + dr, nk = nc + ',' + nr;
        if (!inGrid(nc, nr) || trackCells.has(nk) || wallAt(1, nc, nr)) continue;
        const [ux, uy] = center(nc, nr), [dx, dy] = center(c, r);
        list.push({ ux, uy, dx, dy, dk: k });
      }
    }
  } finally { trackCtx = keep; }
  trackEdgeCache = { map: MAP, n: trackCells.size, walls: mapWalls.size, list };
  return list;
}
// 跳點裡挑一個：cost(跳點) 越小越好
function trackPickEdge(cost) {
  let best = null, bestV = Infinity;
  for (const e of trackEdges()) {
    if (trackStopped(e.dk)) continue;   // 那格軌道上停著列車：不能跳過去
    const v = cost(e); if (v < bestV) { bestV = v; best = e; }
  }
  return best;
}

// ---- 跳：從現在的位置跳到 (x1, y1)，落地後換成在／不在軌道裡 ----
// fling＝被列車撞飛（飛得高、飛得久，落地時呼叫 fling.onLand）
// fall＝被擊退彈推下去（彈得低，不播起跳聲，落地照樣有落地聲）
function startTrackJump(a, x1, y1, toTrack, fling = null, fall = false) {
  a.trackJump = { t: 0, x0: a.x, y0: a.y, x1, y1, toTrack, fling, fall };
  a.moving = false;
  if (!fling && !fall && typeof sfxAt === 'function') sfxAt('trackJump', a.x, a.y, MRT_TRACK.jumpSound, 'track-jump');
}
// 每一幀：跳在空中的時候由這裡管位置，回傳 true＝這一幀不能自己動
function stepTrackJump(a, dt) {
  const s = a && a.trackJump; if (!s) return false;
  const fl = s.fling, T = fl ? MRT_TRACK.flingTime : MRT_TRACK.jumpTime, H = fl ? MRT_TRACK.flingHeight : s.fall ? MRT_TRACK.fallHeight : MRT_TRACK.jumpHeight;
  const u = Math.min(1, (s.t += dt) / T);
  a.x = s.x0 + (s.x1 - s.x0) * u;
  a.y = s.y0 + (s.y1 - s.y0) * u - 4 * H * u * (1 - u);   // 往上拋再落下
  a.knockT = 0; a.moving = false;
  if (fl && G && G.effects && Math.random() < .6) G.effects.push({ particle: true, kind: 'spark', x: a.x, y: a.y, vx: (Math.random() - .5) * 40, vy: 10, r: 2 + Math.random() * 2, life: .3, life0: .3, color: '#d8cfbd' });   // 飛在空中拖出的灰塵
  if (u >= 1) {
    a.x = s.x1; a.y = s.y1; a.trackJump = null;
    setInTrack(a, s.toTrack);
    if (G && G.effects) G.effects.push({ ring: true, x: a.x, y: a.y + 14, r: 4, r2: fl ? 34 : 18, life: fl ? .35 : .22, life0: fl ? .35 : .22, color: '#cfc6b2' });   // 落地揚起灰
    if (!fl && typeof sfxAt === 'function') sfxAt('place', a.x, a.y, MRT_TRACK.landSound, 'track-land');   // 一般跳：落地聲（起跳播 trackJump）
    if (fl) {   // 被撞飛的人重重摔在月台上
      if (typeof addShake === 'function') addShake(5);
      if (typeof sfxAt === 'function') sfxAt('knock2', a.x, a.y, .6, 'train-fling-land');
      if (typeof fl.onLand === 'function') fl.onLand(a);
    }
  }
  return true;
}

// ---- 溫特：【跳下】【跳上】 ----
function trackJumpSpot() {
  const p = typeof G !== 'undefined' && G && G.player;
  if (!p || !trackCells.size || p.hp <= 0 || p.trackJump || p.sitting || p.mrtRide || p.grabbed) return null;
  const inside = inTrackNow(p), R = MRT_TRACK.reach;
  const e = trackPickEdge(e => { const d = inside ? Math.hypot(p.x - e.dx, p.y - e.dy) : Math.hypot(p.x - e.ux, p.y - e.uy); return d <= R ? d : Infinity; });
  if (!e) return null;
  return inside ? { x: e.ux, y: e.uy, toTrack: false, label: MRT_TRACK.promptUp } : { x: e.dx, y: e.dy, toTrack: true, label: MRT_TRACK.promptDown };
}
function useTrackJump() {
  const s = trackJumpSpot(); if (!s) return false;
  startTrackJump(G.player, s.x, s.y, s.toTrack);
  return true;
}
function trackJumpUpdate(p, dt) { return stepTrackJump(p, dt); }

// ---- 隊友：跟著溫特跳進跳出 ----
function trackSentryStep(t, dt) {
  if (stepTrackJump(t, dt)) return true;
  if (!trackCells.size || t.hp <= 0 || t.grabbed || t.grabFall || t.mrtRide || t.eatenBy || t.berserk) { t.trackCross = null; return false; }
  const p = G.player; if (!p || p.hp <= 0) return false;
  const tin = inTrackNow(t);
  if (!tin) t.trackCrossTo = null;
  // 「前往」巡邏點、部隊長身邊：目的地在軌道對面就穿過去（不管溫特在哪）
  if (t.mode === 'goto' && t.target) { t.followDark = true; return tin ? trackSentryExit(t, t.target, dt) : trackCrossStep(t, t.target, dt); }
  if (!(t.mode === 'free' || t.mode === 'escort')) { t.trackCross = t.trackCrossTo = null; return false; }   // 叫他守在某處巡邏的不跟
  const pin = inTrackNow(p);
  if (!pin && !tin) {   // 都在月台上：看是不是隔著軌道、要穿過去
    const rule = typeof sentryCompanionRule === 'function' ? sentryCompanionRule(t) : null;
    return trackCrossStep(t, rule && rule.anchor, dt);
  }
  t.trackCross = null;
  // 為了穿過軌道才跳進來的：要跟的人（不一定是溫特，例如阿瓦倫跟艾德林）還在月台上，就到他附近的月台邊跳上去
  const to = t.trackCrossTo;
  if (tin && to && to !== p && to.hp > 0 && !inTrackNow(to) && (G.towers || []).includes(to)) return trackSentryExit(t, to, dt);
  if (pin === tin || p.trackJump) return false;   // 跟溫特在同一邊：照平常的跟隨
  const sp = ((TYPES[t.type] && TYPES[t.type].walkSpeed) || 80) * MRT_TRACK.sentrySpeedMul;
  if (pin) {   // 溫特在軌道裡：走到離溫特最近的月台邊、跳進去
    const e = trackPickEdge(e => Math.hypot(t.x - e.ux, t.y - e.uy) + Math.hypot(p.x - e.dx, p.y - e.dy));
    if (!e) return false;
    if (Math.hypot(t.x - e.ux, t.y - e.uy) <= MRT_TRACK.jumpAt) startTrackJump(t, e.dx, e.dy, true);
    else trackSentryWalk(t, e.ux, e.uy, sp, dt);
    return true;
  }
  return trackSentryExit(t, p, dt);   // 自己在軌道裡、溫特上去了：走到離溫特最近的軌道邊、跳上去
}
// 隊友走去跳點：跟著人走，暗的地方也照走（跟平常跟著溫特一樣，見 js/sentry.js 的 followDark）
function trackSentryWalk(t, x, y, sp, dt) {
  t.followDark = true;
  return moveSentryWithPath(t, x, y, sp, dt, 1);
}
// 在軌道裡：走到離 a 最近的軌道邊、跳上月台
function trackSentryExit(t, a, dt) {
  const sp = ((TYPES[t.type] && TYPES[t.type].walkSpeed) || 80) * MRT_TRACK.sentrySpeedMul;
  const e = trackPickEdge(e => Math.hypot(t.x - e.dx, t.y - e.dy) + Math.hypot(a.x - e.ux, a.y - e.uy));
  if (!e) return false;
  if (Math.hypot(t.x - e.dx, t.y - e.dy) <= MRT_TRACK.jumpAt) startTrackJump(t, e.ux, e.uy, false);
  else trackSentryWalk(t, e.dx, e.dy, sp, dt);
  return true;
}
// 隔著軌道：自己和要去的地方（a＝要跟的人，或「前往」的目的地 {x, y}）都在月台上，但月台上走不過去（中間隔著軌道）
// → 從自己這邊的月台邊跳進軌道（之後由上面的 trackSentryExit 走到對面跳上去）
function trackCrossStep(t, a, dt) {
  if (!a || a.hp <= 0 || a.trackJump || inTrackNow(a) || Math.hypot(a.x - t.x, a.y - t.y) <= MRT_TRACK.crossNear * CELL) { t.trackCross = null; return false; }   // 已經在旁邊：照平常的跟隨
  // 就算還在跟隨範圍內也要過去：隔著軌道時治療、照顧人都走不到對面（例如艾德林問「有人受傷嗎」卻過不去）
  if ((t.trackCrossT = (t.trackCrossT || 0) - dt) <= 0) {   // 不要每一幀都找路：隔一下才重新判斷
    t.trackCrossT = MRT_TRACK.crossCheck;
    t.trackCross = buildSentryPath(t, a.x, a.y, true) === null ? trackCrossPick(t, a.x, a.y, true) : null;   // true：要經過的那條軌道列車快來了就先不跳
  }
  const e = t.trackCross;
  if (!e || trackStopped(e.dk)) return false;
  if (Math.hypot(t.x - e.ux, t.y - e.uy) <= MRT_TRACK.jumpAt) {
    if (trainComingSoon(e.dx, e.dy, MRT_TRACK.crossWarn)) { t.trackCross = null; t.moving = false; return true; }   // 走到跳點時列車剛好快來了：站在月台邊等
    t.trackCross = null; startTrackJump(t, e.dx, e.dy, true);
    t.trackCrossTo = a;   // 跳進去之後要到誰旁邊跳上來（落地時 setInTrack 不會清掉這個）
  } else {
    const sp = ((TYPES[t.type] && TYPES[t.type].walkSpeed) || 80) * MRT_TRACK.sentrySpeedMul;
    t.navFailed = false;   // 先清掉之前留下的「找不到路」記號，下面才看得出這次是不是真的走不到
    trackSentryWalk(t, e.ux, e.uy, sp, dt);
    if (t.navFailed) t.trackCross = null;   // 走不到那個跳點：下次再重挑
  }
  return true;
}
// 挑穿過軌道的跳點：自己這邊走得到的月台邊，而且對面有跳點離 (gx, gy) 夠近、從那裡走得到 (gx, gy)（不然表示目的地根本不在軌道對面）
// avoidTrain：列車快經過的軌道不挑（下指令時檢查走不走得到不用管這個，等車過去就會走）
function trackCrossPick(t, gx, gy, avoidTrain = false) {
  const ok = e => !trackStopped(e.dk) && !(avoidTrain && trainComingSoon(e.dx, e.dy, MRT_TRACK.crossWarn));
  const outs = trackEdges().filter(e => ok(e) && Math.hypot(gx - e.ux, gy - e.uy) <= MRT_TRACK.crossExit * CELL)
    .sort((x, y) => Math.hypot(gx - x.ux, gy - x.uy) - Math.hypot(gx - y.ux, gy - y.uy));
  const out = outs.slice(0, 3).find(e => trackProbePath(t, e.ux, e.uy, gx, gy));   // 最多試 3 個
  if (!out) return null;
  const list = trackEdges().filter(ok)
    .map(e => ({ e, v: Math.hypot(t.x - e.ux, t.y - e.uy) * 2 + Math.hypot(out.dx - e.dx, out.dy - e.dy) }))   // 自己走到跳點的路程算重一點（優先挑自己這邊的）
    .sort((x, y) => x.v - y.v);
  for (const { e } of list.slice(0, 6)) {   // 最多試 6 個，免得一直找路卡頓
    if (Math.hypot(t.x - e.ux, t.y - e.uy) <= CELL || buildSentryPath(t, e.ux, e.uy, true) !== null) return e;
  }
  return null;
}
// 假裝隊員 t 站在 (x0, y0)，找不找得到路走到 (gx, gy)（不會動到 t 本人）
function trackProbePath(t, x0, y0, gx, gy) {
  if (Math.hypot(gx - x0, gy - y0) <= CELL) return true;
  const probe = Object.assign(Object.create(Object.getPrototypeOf(t)), t, { x: x0, y: y0, _pathFail: null, navPath: null, inTrack: false });
  return buildSentryPath(probe, gx, gy, true) !== null;
}
// 下指令時用（js/sentry-blocked.js 的 sentryBlockReason）：月台上走不到 (x, y)，但穿過軌道走得到嗎
function trackSentryCanCross(t, x, y) {
  if (!trackCells.size || !t || inTrackNow(t)) return false;
  return onFloorDo(t, () => !!trackCrossPick(t, x, y));
}

// ---- 怪物：追進軌道、跳出軌道 ----
const trackIsBoss = e => !!(e && (e.eliteName || e.milkfishKing || e.ratKing || e.poolBoss || e.gourdKing || e.bananaEmperor || e.pearlBoss || e.loofahQueen || e.mothBoss || e.elite));
// 自己有特殊走法的 BOSS：不跳進軌道（只是被列車撞不倒）
const trackBossCustom = e => !!(e && (e.milkfishKing || e.ratKing || e.poolBoss || e.gourdKing || e.bananaEmperor || e.pearlBoss || e.loofahQueen || e.mothBoss || e.elite || e.behavior === 'burrow' || e.behavior === 'milkfishKing'));
const trackFlying = e => !!(e && (e.behavior === 'moth' || e.flying || (e.slimeLift || 0) > 4));
// 列車快來了嗎：有車在 bossWarn 秒內到站、或正在進站／開走／載著溫特在隧道裡
// 給 (x, y)＝只看會經過那個點的列車（那一條軌道上的車）。不給＝整張地圖任何一班（BOSS 用）
// （G11 這種好幾條軌道的站，幾乎隨時都有某一班快到，只看整張地圖的話隊員永遠不敢穿過軌道）
// warn＝幾秒內到站算「快來了」（不給＝BOSS 用的 bossWarn）
function trainComingSoon(x, y, warn = MRT_TRACK.bossWarn) {
  for (const tr of (G && G.mrtTrains) || []) {
    if (x != null && !(y >= tr.top && y <= tr.bottom && x >= tr.clipL - CELL && x <= tr.clipR + CELL)) continue;
    if (tr.state === 'arrive' || tr.state === 'depart' || tr.state === 'tunnel') return true;
    if (tr.state === 'away' && tr.t <= warn) return true;
  }
  return false;
}
// 走去某一點：直直走得過去就直接走，被擋住就找一條路（每 0.6 秒重找一次）
function trackEnemyGo(e, x, y, dt) {
  const [gc, gr] = cellAt(x, y), now = G.navClock || 0;
  if (!e.trackRoute || e.trackRoute.goal !== gc + ',' + gr || now - e.trackRoute.at > .6) {
    const path = typeof buildEnemyRoute === 'function' ? buildEnemyRoute(e, gc, gr, false) : null;
    e.trackRoute = { goal: gc + ',' + gr, at: now, path: path || [] };
  }
  const path = e.trackRoute.path;
  while (path.length && Math.hypot(center(...path[0])[0] - e.x, center(...path[0])[1] - e.y) < 6) path.shift();
  const [sx, sy] = path.length ? center(...path[0]) : [x, y];
  moveEnemyToward(e, { x: path.length > 1 ? sx : x, y: path.length > 1 ? sy : y }, dt);
}
function trackEnemyStep(e, dt) {
  if (stepTrackJump(e, dt)) return true;
  if (!trackCells.size || e.dead || e.hp <= 0 || e.dummy || e.mrtRide || e.mrtExit || e.carried || e.stunT > 0 || trackFlying(e)) return false;
  const boss = trackIsBoss(e);
  if (boss && trackBossCustom(e)) return false;
  const ein = inTrackNow(e), R = MRT_TRACK.chaseRange * CELL;
  // 要追的人：附近看得到、還站著的溫特或隊員（最近的那個）
  let target = null, bd = Infinity;
  for (const a of [G.player, ...(G.towers || [])]) {
    if (!a || a.hp <= 0 || a.grabbed || a.mrtRide || a.trackJump) continue;
    const d = Math.hypot(a.x - e.x, a.y - e.y);
    if (d < bd && d <= R && hasLineOfSight(e.x, e.y, a.x, a.y)) { bd = d; target = a; }
  }
  const tin = target && inTrackNow(target), coming = boss && (ein ? trainComingSoon(e.x, e.y) : tin ? trainComingSoon(target.x, target.y) : false);   // 只看自己（或目標）那條軌道的車
  if (!ein) e.trackCrossTo = null;
  if (!ein && target && !tin) return trackEnemyCross(e, target, dt, coming);   // 都在月台上：看是不是隔著軌道、要穿過去
  e.trackCross = null;
  const to = e.trackCrossTo;   // 為了穿過軌道才跳進來的：還沒走到對面就先不要跳回原本那邊
  if (ein && to && !coming && to.hp > 0 && !inTrackNow(to) && (to === G.player || (G.towers || []).includes(to)) && Math.hypot(to.x - e.x, to.y - e.y) <= R * 1.5) {
    const ed = trackPickEdge(ed => Math.hypot(e.x - ed.dx, e.y - ed.dy) + Math.hypot(to.x - ed.ux, to.y - ed.uy));
    if (ed) {
      if (Math.hypot(e.x - ed.dx, e.y - ed.dy) <= MRT_TRACK.jumpAt) startTrackJump(e, ed.ux, ed.uy, false);
      else trackEnemyGo(e, ed.dx, ed.dy, dt);
      return true;
    }
  }
  if (!ein && tin && !coming) {   // 目標在軌道裡：走到離目標最近的月台邊、跳進去
    const ed = trackPickEdge(ed => Math.hypot(e.x - ed.ux, e.y - ed.uy) + Math.hypot(target.x - ed.dx, target.y - ed.dy));
    if (!ed) return false;
    if (Math.hypot(e.x - ed.ux, e.y - ed.uy) <= MRT_TRACK.jumpAt) startTrackJump(e, ed.dx, ed.dy, true);
    else trackEnemyGo(e, ed.ux, ed.uy, dt);
    return true;
  }
  if (ein && (!tin || coming)) {  // 自己在軌道裡、目標不在（或 BOSS 發現列車要來）：走到最近的月台邊、跳上去
    const ed = trackPickEdge(ed => Math.hypot(e.x - ed.dx, e.y - ed.dy) + (target && !coming ? Math.hypot(target.x - ed.ux, target.y - ed.uy) * .5 : 0));
    if (!ed) return false;
    if (Math.hypot(e.x - ed.dx, e.y - ed.dy) <= MRT_TRACK.jumpAt) startTrackJump(e, ed.ux, ed.uy, false);
    else trackEnemyGo(e, ed.dx, ed.dy, dt);
    return true;
  }
  return false;   // 跟目標在同一邊：照平常的追法（在軌道裡就照軌道的規則走）
}
// 被擊退彈推到軌道邊：(x, y)＝下一步要被推到的點。那裡是軌道格就掉進去，回傳 true（js/special-guns.js 的 updateKnocks 呼叫）
function trackKnockFall(e, k, x, y) {
  if (!trackCells.size || k.air || inTrackNow(e) || e.trackJump || trackFlying(e) || trackBossCustom(e)) return false;
  const [c, r] = cellAt(x, y), key = c + ',' + r;
  if (!trackCells.has(key) || trackStopped(key)) return false;   // 停著列車的地方：撞到車廂，照樣算撞牆
  // 落點：那格軌道的中間，再順著推的方向往裡面一格（裡面還是軌道才往裡）
  let [fx, fy] = center(c, r);
  const c2 = Math.floor((fx + k.dx * CELL) / CELL), r2 = Math.floor((fy + k.dy * CELL) / CELL), k2 = c2 + ',' + r2;
  if (trackCells.has(k2) && !trackStopped(k2) && (c2 !== c || r2 !== r)) [fx, fy] = center(c2, r2);
  e.knock = null;
  startTrackJump(e, fx, fy, true, null, true);
  flash('掉進軌道！', e.x, e.y - 44, '#fff2a0', 1);
  return true;
}

// 隔著軌道：自己和要追的人都在月台上，但月台上走不過去 → 從自己這邊的月台邊跳進軌道（之後由上面那段走到對面跳上去）
// coming＝BOSS 而且列車快來了：不跳
function trackEnemyCross(e, target, dt, coming) {
  if (coming || Math.hypot(target.x - e.x, target.y - e.y) <= MRT_TRACK.crossNear * CELL) { e.trackCross = null; return false; }
  const boss = trackIsBoss(e);
  if ((e.trackCrossT = (e.trackCrossT == null ? Math.random() * MRT_TRACK.crossCheck : e.trackCrossT) - dt) <= 0) {   // 不要每一幀都找路；一開始錯開，免得一群怪同一幀一起找
    e.trackCrossT = MRT_TRACK.crossCheck;
    const [gc, gr] = cellAt(target.x, target.y);
    e.trackCross = buildEnemyRoute(e, gc, gr, true) === null ? trackEnemyCrossPick(e, target, boss) : null;   // BOSS：列車快經過的軌道不挑   // true：建築打得穿，不算擋路
  }
  const ed = e.trackCross;
  if (!ed || trackStopped(ed.dk)) return false;
  if (Math.hypot(e.x - ed.ux, e.y - ed.uy) <= MRT_TRACK.jumpAt) {
    e.trackCross = null; startTrackJump(e, ed.dx, ed.dy, true);
    e.trackCrossTo = target;   // 跳進去之後要到誰附近跳上來
  } else trackEnemyGo(e, ed.ux, ed.uy, dt);
  return true;
}
// 挑穿過軌道的跳點（跟隊友的 trackCrossPick 一樣，只是用怪物的找路）
function trackEnemyCrossPick(e, target, avoidTrain = false) {
  const out = trackPickEdge(ed => Math.hypot(target.x - ed.ux, target.y - ed.uy));
  if (!out || Math.hypot(target.x - out.ux, target.y - out.uy) > MRT_TRACK.crossExit * CELL) return null;
  const list = trackEdges().filter(ed => !trackStopped(ed.dk) && !(avoidTrain && trainComingSoon(ed.dx, ed.dy)))
    .map(ed => ({ ed, v: Math.hypot(e.x - ed.ux, e.y - ed.uy) * 2 + Math.hypot(out.dx - ed.dx, out.dy - ed.dy) }))
    .sort((a, b) => a.v - b.v);
  for (const { ed } of list.slice(0, 6)) {
    if (Math.hypot(e.x - ed.ux, e.y - ed.uy) <= CELL || buildEnemyRoute(e, ...cellAt(ed.ux, ed.uy), true) !== null) return ed;
  }
  return null;
}

// ---- 被列車撞飛：往列車開的方向、飛到最近的月台上（落在月台邊再往裡面 flingFar 格，有牆就近一點）----
function trainFlingSpot(a, tr) {
  const dir = tr.dir || 1, aheadX = a.x + dir * CELL * 1.5;
  // 優先挑軌道上下兩邊的月台（往旁邊飛）；沒有才挑軌道頭尾的
  let best = null, bestV = Infinity;
  for (const e of trackEdges()) {
    const v = Math.hypot(e.ux - aheadX, e.uy - a.y) + (e.ux === e.dx ? 0 : CELL * 3);
    if (v < bestV) { bestV = v; best = e; }
  }
  if (!best) return null;
  const ox = Math.sign(best.ux - best.dx), oy = Math.sign(best.uy - best.dy), keep = trackCtx;
  trackCtx = false;   // 月台上的規則
  try {
    for (let k = MRT_TRACK.flingFar; k > 0; k -= .5) {
      const x = best.ux + ox * k * CELL + (oy ? dir * k * CELL * .5 : 0), y = best.uy + oy * k * CELL;
      const [c, r] = cellAt(x, y);
      if (inGrid(c, r) && !trackCells.has(c + ',' + r) && !wallAt(1, c, r)) return [x, y];
    }
  } finally { trackCtx = keep; }
  return [best.ux, best.uy];
}
function trainFling(a, tr, onLand) {
  const spot = trainFlingSpot(a, tr) || [a.x, a.y];
  a.navPath = null; a.navGoal = null; a.aiPath = null; a.trackRoute = null;
  startTrackJump(a, spot[0], spot[1], false, { onLand });
}
// 撞擊特效：放大版的鳥頭人撞擊圖＋星芒火花、衝擊波、頓格、畫面震動；loud＝溫特、隊員（播 slime-hit＋小撞擊）
function trainImpactFx(a, tr, text, loud) {
  const dir = tr.dir || 1, ang = dir > 0 ? 0 : Math.PI, x = a.x - dir * 6, y = a.y - 18, S = MRT_TRACK.impactScale;
  if (typeof flash === 'function') flash(text, a.x, a.y - 52, '#ff6b5b', 1);
  if (typeof playAttackSprite === 'function') playAttackSprite('charge-impact', x, y, .5, ang, loud ? S : S * .75);
  if (typeof mfxOn === 'function' && mfxOn('monster') && typeof birdChargeImpactV2 === 'function') {
    birdChargeImpactV2(x, y, ang);
    if (typeof mfxSparks === 'function') mfxSparks(x, y, 14, ang, .8, 260, 480, ['#fff4dc', '#ffb066', '#ff7a3c']);
    if (typeof meleeV2Shockwave === 'function') meleeV2Shockwave(x, a.y + 10, loud ? 56 : 40, '#ffd2a0');
  } else if (G.effects) {
    for (let i = 0; i < 12; i++) {   // 往列車開的方向噴火花
      const an = ang + (Math.random() * 2 - 1) * .8, sp = 200 + Math.random() * 240;
      G.effects.push({ particle: true, kind: 'spark', x, y, vx: Math.cos(an) * sp, vy: Math.sin(an) * sp - 40, r: 2 + Math.random() * 3, life: .2 + Math.random() * .2, life0: .4, color: i % 2 ? '#fff0c8' : '#ffb066' });
    }
  }
  if (G.effects) G.effects.push({ ring: true, x: a.x, y: a.y, r: 8, r2: loud ? 60 : 44, life: .35, life0: .35, color: '#ffd2a0' });
  if (typeof addHitstop === 'function') addHitstop(.09);
  if (typeof addShake === 'function') addShake(loud ? 10 : 6);
  if (typeof sfxAt === 'function') {
    if (loud) sfxAt('trainHit', a.x, a.y, 1, 'train-hit');
    else sfxAt('knock2', a.x, a.y, .8, 'train-hit-monster');
  }
}

// ---- 列車撞人：進站、開走時，車身經過的地方（js/mrt-train.js 呼叫）----
function trackTrainHits(tr) {
  if (!trackCells.size || !tr.cars || !tr.cars.length) return;
  const shift = tr.off * tr.dir, pad = 6;
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const car of tr.cars) { x0 = Math.min(x0, car.x + shift); x1 = Math.max(x1, car.x + shift + car.w); y0 = Math.min(y0, car.y); y1 = Math.max(y1, car.y + car.h); }
  x0 = Math.max(x0, tr.clipL); x1 = Math.min(x1, tr.clipR);
  if (x1 <= x0) return;   // 還在隧道裡
  const floor = typeof mrtTrainFloor === 'function' ? (mrtTrainFloor(tr) === 2 ? 2 : 1) : 1;
  const inBody = a => a.x >= x0 - pad && a.x <= x1 + pad && a.y >= y0 - pad && a.y <= y1 + pad;
  const onTrack = a => inTrackNow(a) || trackCells.has(cellAt(a.x, a.y).join(','));
  const sameF = a => !hasFloors || actorFloor(a) === floor;
  const flyingNow = e => !!(e && (e.behavior === 'moth' || e.flying));   // 真的飛在空中的（史萊姆跳一下不算，照樣撞飛）
  const p = G.player;
  if (p && p.hp > 0 && !p.mrtRide && !p.trackJump && onTrack(p) && sameF(p) && inBody(p)) {
    G.damageVignetteT = Math.max(G.damageVignetteT || 0, .8);
    trainImpactFx(p, tr, '被列車撞到了！', true);
    trainFling(p, tr, a => {   // 落地才倒下、輸掉這場戰鬥（跟其他死法一樣）
      a.hp = 0;
      if (!G.over) { if (typeof flash === 'function') flash('部隊長失去戰鬥能力', a.x, a.y - 74, '#ff5b6e', 1.4); if (typeof lose === 'function') lose('player', '被捷運列車撞到'); }
    });
  }
  for (const t of G.towers || []) {
    if (t.hp <= 0 || t.mrtRide || t.trackJump || !onTrack(t) || !sameF(t) || !inBody(t)) continue;
    t.hp = 0; t.target = null; t.meleeSwing = null; t.gunSwing = null;   // 倒下的隊員照樣會被 updateSentry 帶著飛（js/game.js）
    trainImpactFx(t, tr, '被列車撞到了！', true);
    trainFling(t, tr, a => { if (typeof sentryStatus === 'function') sentryStatus(a, '失去戰鬥能力', '#ff5b6e', true); });
  }
  for (const e of G.enemies || []) {
    if (e.dead || e.hp <= 0 || e.mrtRide || e.trackJump || trackIsBoss(e) || flyingNow(e) || !onTrack(e) || !sameF(e) || !inBody(e)) continue;
    e.stunT = 0; e.knockT = 0; e.slimeLift = 0; e.target = null;
    trainImpactFx(e, tr, '撞飛！', false);
    trainFling(e, tr, a => { if (a.hp > 0) { a.hp = 0; a.hitT = .2; a.hitColor = '#ff9a3c'; } });   // 落地才死
  }
  // 蓋在軌道上的建築：撞破（車廂裡跟著列車走的不算）
  for (const o of [...(G.obstacles || [])]) {
    if (o.isBase || o.mapSource || o.mrtCargo || o.hp <= 0) continue;
    const w = o.w || 1, h = o.h || 1;
    let hit = false;
    for (let dc = 0; dc < w && !hit; dc++) for (let dr = 0; dr < h && !hit; dr++) {
      const c = o.c + dc, r = o.r + dr;
      if (!trackCells.has(c + ',' + r)) continue;
      const cx = OX + (c + .5) * CELL, cy = OY + (r + .5) * CELL;
      if (cx >= x0 && cx <= x1 && cy >= y0 && cy <= y1) hit = true;
    }
    if (!hit || (hasFloors && (o.floor === 2 ? 2 : 1) !== floor)) continue;
    o.hp = 0; o.lastHitBy = 'demolish';
    if (typeof flash === 'function') flash('被列車撞壞了', OX + (o.c + w / 2) * CELL, OY + o.r * CELL - 12, '#ffb36b', .9);
    if (typeof destroyObstacleNow === 'function') destroyObstacleNow(o); else removeBarrier(o);
  }
}
