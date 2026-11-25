/* ===== 捷運軌道：跳下、跳上、列車撞人 =====
   軌道格在 🗺️ 地圖編輯器用「🛤️ 軌道」筆刷畫（MAP.track）。
   ・溫特：站在軌道旁邊的月台上，頭上出現【跳下】，按空白鍵小跳一下進到軌道裡；在軌道裡靠近月台邊出現【跳上】，按空白鍵跳回月台。
   ・在軌道裡的人只能在軌道格裡走（月台、停著的列車都是牆）；不在軌道裡的人走不進軌道（停著的列車車廂照樣可以上車）。
     走路、找路的規則在 js/pathfinding.js 的 trackCtx（照每個人的 a.inTrack 設），這裡只管「跳」和「誰要跳」。
   ・隊友：跟著溫特的隊友（自由行動、護衛），溫特跳進軌道就走到最近的月台邊跟著跳進去；溫特跳上去就跟著跳上來。
     列車來了不會自己逃（照使用者的設定）：要玩家自己帶出來，或用右鍵把隊友從軌道裡拉出來（js/grab.js 放下時照落點決定在不在軌道裡）。
   ・怪物：附近（MRT_TRACK.chaseRange 格內、看得到）的溫特或隊員在軌道裡，就走到最近的月台邊跳進去追；
     自己在軌道裡、要追的人不在軌道裡（或沒有目標），就走到最近的月台邊跳上來。
   ・列車進站、開走時，車身經過的地方：軌道裡的溫特、隊員失去戰鬥能力，怪物直接死亡，蓋在軌道上的建築被撞破。
     BOSS、飛在空中的怪物（人面蝶）不會被撞。
   ・BOSS：只在列車沒有要來的時候才會跳進軌道；在軌道裡發現列車要來了，就先跳上月台。
     自己有特殊走法的 BOSS（人面蝶后、老鼠王、虱目魚王、池核 BOSS…）不會跳進軌道。
   數值都在下面的 MRT_TRACK。
*/
const MRT_TRACK = {
  jumpTime: .42,      // 跳一次幾秒
  jumpHeight: 18,     // 跳起來多高（像素）
  reach: 30,          // 溫特離月台邊（或軌道邊）多近才出現【跳下】【跳上】（像素，從那一格的中間算）
  jumpAt: 8,          // 隊友、怪物走到離跳點多近就跳（像素）
  chaseRange: 9,      // 怪物追進軌道：目標在幾格內才追
  bossWarn: 10,       // BOSS：列車還有幾秒就到（或正在進站、開走）時，不跳進軌道、在裡面的先跳出來
  sentrySpeedMul: 1.25,   // 隊友走去跳點時腳步快一點
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
function startTrackJump(a, x1, y1, toTrack) {
  a.trackJump = { t: 0, x0: a.x, y0: a.y, x1, y1, toTrack };
  a.moving = false;
  if (typeof sfxAt === 'function') sfxAt('place', a.x, a.y, .35, 'track-jump');
}
// 每一幀：跳在空中的時候由這裡管位置，回傳 true＝這一幀不能自己動
function stepTrackJump(a, dt) {
  const s = a && a.trackJump; if (!s) return false;
  const u = Math.min(1, (s.t += dt) / MRT_TRACK.jumpTime);
  a.x = s.x0 + (s.x1 - s.x0) * u;
  a.y = s.y0 + (s.y1 - s.y0) * u - 4 * MRT_TRACK.jumpHeight * u * (1 - u);   // 往上拋一點再落下
  if (u >= 1) {
    a.x = s.x1; a.y = s.y1; a.trackJump = null;
    setInTrack(a, s.toTrack);
    if (G && G.effects) G.effects.push({ ring: true, x: a.x, y: a.y + 14, r: 4, r2: 18, life: .22, life0: .22, color: '#cfc6b2' });   // 落地揚起一點灰
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
  if (!trackCells.size || t.hp <= 0 || t.grabbed || t.grabFall || t.mrtRide || t.eatenBy || t.berserk) return false;
  const p = G.player; if (!p || p.hp <= 0) return false;
  if (!(t.mode === 'free' || t.mode === 'escort')) return false;   // 叫他守在某處（巡邏、前往）的不跟
  const pin = inTrackNow(p), tin = inTrackNow(t);
  if (pin === tin || p.trackJump) return false;   // 跟溫特在同一邊：照平常的跟隨
  const sp = ((TYPES[t.type] && TYPES[t.type].walkSpeed) || 80) * MRT_TRACK.sentrySpeedMul;
  if (pin) {   // 溫特在軌道裡：走到離溫特最近的月台邊、跳進去
    const e = trackPickEdge(e => Math.hypot(t.x - e.ux, t.y - e.uy) + Math.hypot(p.x - e.dx, p.y - e.dy));
    if (!e) return false;
    if (Math.hypot(t.x - e.ux, t.y - e.uy) <= MRT_TRACK.jumpAt) startTrackJump(t, e.dx, e.dy, true);
    else moveSentryWithPath(t, e.ux, e.uy, sp, dt, 1);
  } else {     // 自己在軌道裡、溫特上去了：走到離溫特最近的軌道邊、跳上去
    const e = trackPickEdge(e => Math.hypot(t.x - e.dx, t.y - e.dy) + Math.hypot(p.x - e.ux, p.y - e.uy));
    if (!e) return false;
    if (Math.hypot(t.x - e.dx, t.y - e.dy) <= MRT_TRACK.jumpAt) startTrackJump(t, e.ux, e.uy, false);
    else moveSentryWithPath(t, e.dx, e.dy, sp, dt, 1);
  }
  return true;
}

// ---- 怪物：追進軌道、跳出軌道 ----
const trackIsBoss = e => !!(e && (e.eliteName || e.milkfishKing || e.ratKing || e.poolBoss || e.gourdKing || e.bananaEmperor || e.pearlBoss || e.loofahQueen || e.mothBoss || e.elite));
// 自己有特殊走法的 BOSS：不跳進軌道（只是被列車撞不倒）
const trackBossCustom = e => !!(e && (e.milkfishKing || e.ratKing || e.poolBoss || e.gourdKing || e.bananaEmperor || e.pearlBoss || e.loofahQueen || e.mothBoss || e.elite || e.behavior === 'burrow' || e.behavior === 'milkfishKing'));
const trackFlying = e => !!(e && (e.behavior === 'moth' || e.flying || (e.slimeLift || 0) > 4));
// 列車快來了嗎（BOSS 用）：有車在 bossWarn 秒內到站、或正在進站／開走／載著溫特在隧道裡
function trainComingSoon() {
  for (const tr of (G && G.mrtTrains) || []) {
    if (tr.state === 'arrive' || tr.state === 'depart' || tr.state === 'tunnel') return true;
    if (tr.state === 'away' && tr.t <= MRT_TRACK.bossWarn) return true;
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
  const tin = target && inTrackNow(target), coming = boss && trainComingSoon();
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
  const hitFx = (a, text) => {
    if (typeof flash === 'function') flash(text, a.x, a.y - 52, '#ff6b5b', 1);
    if (G.effects) G.effects.push({ ring: true, x: a.x, y: a.y, r: 6, r2: 34, life: .3, life0: .3, color: '#ffd2a0' });
    if (typeof addShake === 'function') addShake(4);
  };
  const p = G.player;
  if (p && p.hp > 0 && !p.mrtRide && !p.trackJump && onTrack(p) && sameF(p) && inBody(p)) {
    p.hp = 0; G.damageVignetteT = Math.max(G.damageVignetteT || 0, .6);
    hitFx(p, '被列車撞到了！');
    if (!G.over) { if (typeof flash === 'function') flash('部隊長失去戰鬥能力', p.x, p.y - 74, '#ff5b6e', 1.4); if (typeof lose === 'function') lose('player', '被捷運列車撞到'); }   // 跟其他死法一樣：這場戰鬥失敗
  }
  for (const t of G.towers || []) {
    if (t.hp <= 0 || t.mrtRide || t.trackJump || !onTrack(t) || !sameF(t) || !inBody(t)) continue;
    t.hp = 0; t.target = null; t.meleeSwing = null;
    hitFx(t, '被列車撞到了！');
    if (typeof sentryStatus === 'function') sentryStatus(t, '失去戰鬥能力', '#ff5b6e', true);
  }
  for (const e of G.enemies || []) {
    if (e.dead || e.hp <= 0 || e.mrtRide || e.trackJump || trackIsBoss(e) || trackFlying(e) || !onTrack(e) || !sameF(e) || !inBody(e)) continue;
    e.hp = 0; e.hitT = .2; e.hitColor = '#ff9a3c';
    hitFx(e, '撞飛！');
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
