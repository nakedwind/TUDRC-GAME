/* ===== 葫蘆猴（behavior: "gourd"）=====
   像一顆沉重的石頭：平常貼著地面慢慢拖著走（一頓一頓地往前蹭），地上留下拖行的刮痕。
   ・看到玩家或隊友就慢慢拖過去；進到 GOURD.slamRange 格內 → 壓扁蓄力 → 升到空中（地上出現紅色落點圈，
     落點會慢慢跟著目標移動）→ 泰山壓頂砸下來：圈內的溫特、隊友都會受傷，圈內的建築也會被壓壞。
   ・砸完會陷在地上喘一下（GOURD.recover 秒），這是反擊的好時機。
   ・很重：不會硬直、打不退、推不動、不會被停住（怪物資料的 stagger 0、knockMul 0、noStun）。
   ・身體很寬：只有一格寬的通道擠不過去（gourdWide：要有 2×2 的空地才走得過）。被建築擋路就直接壓上去。
   必須在 enemy-ai.js 之後、game.js 之前載入。數值在下面的 GOURD。
*/
const GOURD = {
  noticeRange: 7,       // 看到玩家／隊友的距離（格）
  loseRange: 12,        // 追多遠就放棄（格）
  slamRange: 3.5,       // 目標在幾格內就準備壓下去
  maxLeap: 4.2,         // 一次最多跳多遠（格）
  crouch: 0.45,         // 壓扁蓄力（秒）
  rise: 0.6,            // 升到最高點（秒）
  hang: 0.35,           // 在空中停一下（秒）：落點圈這時最明顯，看到就快閃
  drop: 0.12,           // 砸下來（秒）
  recover: 1.3,         // 砸完陷在地上喘氣（秒）
  cooldown: 3.2,        // 兩次泰山壓頂之間隔幾秒（從砸下去那一刻算）
  height: 105,          // 升到多高（像素）
  track: 55,            // 在空中時落點跟著目標移動的速度（像素／秒；越大越難閃）
  hitRadius: 69,        // 砸下來的傷害範圍（像素）
  knockRadius: 138,     // 落地震波範圍（像素）：範圍內的隊友（和溫特）以葫蘆猴為中心被震飛
  knockMax: 2.2,        // 貼在葫蘆猴身邊時被震飛幾格（越外圈飛越近）
  knockMin: 0.8,        // 震波邊緣被震飛幾格
  knockTime: 0.55,      // 震飛在空中飛幾秒（水平滑出去也是這段時間）
  tossHeight: 44,       // 貼在葫蘆猴身邊時被震到多高（像素；越外圈越低）
  tossMinHeight: 22,    // 震波邊緣被震到多高（像素）
  tossSpin: 0.55,       // 飛在空中時往後仰幾度（弧度）
  bounceTime: 0.2,      // 落地後再小彈一下（秒）
  knockPlayer: true,    // 溫特也會被震飛（false＝只震飛隊友）
  shockBuildingDamage: 15,   // 震波範圍內（沒被壓到）的建築受到的傷害：只晃一下、不會飛
  hopMax: 18,           // 震波範圍內的建築原地彈起來多高（像素）：最靠近葫蘆猴的
  hopMin: 7,            // 震波邊緣的建築彈多高（像素）
  hopTime: 0.38,        // 建築彈起來到落回原位幾秒
  shakeMax: 14,         // 落地畫面震動：就在旁邊時的強度（上限 16）
  shakeMin: 4,          // 落地畫面震動：shakeRange 格外圍的強度
  shakeRange: 12,       // 幾格內看得到就會震
  dragPulse: 2.2,       // 拖行一頓一頓的節奏（每秒幾下）
  dragMin: 0.15,        // 拖行最慢時的速度倍率（一頓之間幾乎停住）
  wanderSteps: 3, idleMin: 2, idleMax: 4.5, wanderSpeedMul: 0.7,
  markEvery: 7,         // 拖幾像素留一道刮痕
  markLife: 7,          // 刮痕留多久（秒）
  soundEvery: 26,       // 拖幾像素響一聲
  laughCooldown: 8,     // 發現目標時笑一聲，之後幾秒內不再笑
  laughDelay: 0.45,     // 壓到人之後隔幾秒笑
  testSpawn: false,     // 測試用：true＝進戰鬥地圖時在營地右邊生一隻（測完改成 false）
  testCampDist: 20,     // 測試用：營地右邊幾格
  bodyW: 0.42,          // 擋人的身體橢圓：橫向半徑＝圖寬 × 這個比例
  bodyFlat: 0.5,        // 身體橢圓的扁度（縱向半徑＝橫向 × 這個比例）
  bodyY: 4,             // 身體橢圓的中心比腳底座標往下幾像素
  bodyAirLift: 24,      // 升空超過幾像素就不擋人
  crackImage: 'images/破損建築/crack06.png',   // 砸下來時地上的裂痕圖
  crackScale: 1,        // 裂痕圖放大倍率（原圖 120×80）
  crackLife: 5,         // 地裂留多久（秒）
  fx: {                 // 落地特效
    rocks: 18,          // 飛起來的石礫顆數
    rockSpeed: [70, 190],    // 石礫往外飛的速度（像素／秒）
    rockUp: [140, 280],      // 石礫往上彈的速度（像素／秒）
    dust: 12,           // 地面往外翻滾的灰塵團數
    dustRise: 5,        // 往上冒的灰塵團數
    flash: 0.14,        // 撞擊白光幾秒
  },
  art: {
    squash: 'images/monster/gourd-monkey/gourd-monkey-squash.png',
    tall: 'images/monster/gourd-monkey/gourd-monkey-tall.png',
  },
};
const gmRand = (a, b) => a + Math.random() * (b - a);

// ---- 身體很寬：一格的通道走不過 ----
// 能走的格子＝空地，而且旁邊湊得出一塊 2×2 的空地。建築算空地（擋到就壓壞它），牆、順順宮帽不算。
function gourdOpen(c, r) { return inGrid(c, r) && !isWall(c, r) && !(typeof hangiCapAt === 'function' && hangiCapAt(c, r)); }
function gourdWide(c, r) {
  if (!gourdOpen(c, r)) return false;
  for (const [dc, dr] of [[-1, -1], [0, -1], [-1, 0], [0, 0]])
    if (gourdOpen(c + dc, r + dr) && gourdOpen(c + dc + 1, r + dr) && gourdOpen(c + dc, r + dr + 1) && gourdOpen(c + dc + 1, r + dr + 1)) return true;
  return false;
}
// 從現在的格子往外找：走得到目標就走過去，走不到（目標躲在窄道裡）就走到離目標最近、走得到的那一格。
// 剛好卡在窄格裡（例如生在窄道）時，可以先走窄格出去，進到寬的地方之後就不再走窄格。
function gourdRoute(e, goalC, goalR, maxSteps = Infinity) {
  const [sc, sr] = cellAt(e.x, e.y), startKey = sc + ',' + sr;
  const came = new Map([[startKey, null]]), queue = [[sc, sr, 0, !gourdWide(sc, sr)]];
  let best = [sc, sr], bestD = Math.hypot(goalC - sc, goalR - sr);
  for (let qi = 0; qi < queue.length; qi++) {
    const [c, r, steps, narrow] = queue[qi];
    if (c === goalC && r === goalR) { best = [c, r]; break; }
    if (steps >= maxSteps) continue;
    for (const [dc, dr] of ENEMY_NEIGHBORS) {
      const nc = c + dc, nr = r + dr, key = nc + ',' + nr;
      if (came.has(key)) continue;
      const wide = gourdWide(nc, nr);
      if (!wide && !(narrow && gourdOpen(nc, nr))) continue;
      came.set(key, [c, r]); queue.push([nc, nr, steps + 1, narrow && !wide]);
      const d = Math.hypot(goalC - nc, goalR - nr);
      if (d < bestD - .01) { bestD = d; best = [nc, nr]; }
    }
  }
  const path = [];
  for (let cur = best; cur && (cur[0] !== sc || cur[1] !== sr); cur = came.get(cur[0] + ',' + cur[1])) path.push(cur);
  return path.reverse();
}
function gourdNavigate(e, goalC, goalR, moveDt, key) {
  const g = e.gm;
  g.routeT = (g.routeT || 0) - moveDt;
  if (g.routeKey !== key || g.routeT <= 0 || !g.path) { g.path = gourdRoute(e, goalC, goalR); g.routeKey = key; g.routeT = .7 + Math.random() * .3; }
  if (!g.path.length) return { reached: true };
  const [nc, nr] = g.path[0], blocker = enemyBarrierAt(nc, nr);
  if (blocker) return { blocker };
  const [tx, ty] = center(nc, nr);
  if (Math.hypot(tx - e.x, ty - e.y) <= Math.max(2, e.speed * moveDt)) { e.x = tx; e.y = ty; g.path.shift(); return { reached: !g.path.length }; }
  moveEnemyToward(e, { x: tx, y: ty }, moveDt);
  return {};
}

// ---- 目標 ----
function gmTargets(e) {
  const list = [], p = G.player;
  if (p && p.hp > 0) list.push(p);
  for (const t of G.towers) if (t.hp > 0 && !t.berserk && enemyNoticesSentry(e, t)) list.push(t);
  return list;
}
function gmPickTarget(e) {
  const dist = t => Math.hypot(t.x - e.x, t.y - e.y), targets = gmTargets(e);
  if ((e.playerAggroT || 0) > 0 && targets.includes(G.player) && dist(G.player) <= ENEMY_SENSE_RANGE) return G.player;
  if (e.sentryAggroT > 0 && targets.includes(e.sentryAggro) && dist(e.sentryAggro) <= ENEMY_SENSE_RANGE) return e.sentryAggro;
  let best = null, bestD = GOURD.noticeRange * CELL;
  for (const t of targets) { const d = dist(t); if (d <= bestD && hasLineOfSight(e.x, e.y, t.x, t.y)) { best = t; bestD = d; } }
  return best;
}

// ---- 行為（enemy-ai.js 的 stepEnemy 呼叫）----
function stepGourdEnemy(e, dt) {
  const C = GOURD;
  if (!e.gm) {
    e.gm = { cd: 1 + Math.random(), wait: Math.random() * 2, pulse: Math.random() * 6 }; e.unpushable = true;
    [C.art.squash, C.art.tall, C.crackImage].forEach(monsterImage);   // 先載好壓扁／拉長圖和裂痕圖，第一次壓頂才不會閃空白
  }   // unpushable：隊員的盾撞、大招擊退都推不動（game.js）
  const g = e.gm;
  g.cd -= dt; g.laughCd = (g.laughCd || 0) - dt;
  if (g.slam) { stepGourdSlam(e, dt); return; }
  if (g.recover > 0) {   // 砸完陷在地上：先扁著，後半段慢慢回正
    g.recover -= dt; e.forceFrame = g.recover > C.recover * .45 ? C.art.squash : null;
    if (g.laughAt > 0 && (g.laughAt -= dt) <= 0) gourdLaugh(e, true);
    return;
  }
  e.forceFrame = null;
  // 拖行：速度一頓一頓的（用力往前蹭一下、停一下），像在拖一顆大石頭
  g.pulse += dt * C.dragPulse * Math.PI * 2;
  const moveDt = dt * (C.dragMin + (1 - C.dragMin) * Math.max(0, Math.sin(g.pulse)) ** 1.5);
  const x0 = e.x, y0 = e.y;
  gourdThink(e, dt, moveDt);
  gourdDragTrail(e, Math.hypot(e.x - x0, e.y - y0));
}
function gourdThink(e, dt, moveDt) {
  const C = GOURD, g = e.gm;
  let target = gmPickTarget(e);
  if (!target && g.target && g.target.hp > 0 && Math.hypot(g.target.x - e.x, g.target.y - e.y) <= C.loseRange * CELL) target = g.target;
  if (target && !g.target) gourdLaugh(e);   // 發現目標：笑一聲
  g.target = target;
  if (target) {
    const d = Math.hypot(target.x - e.x, target.y - e.y);
    if (d <= C.slamRange * CELL && hasLineOfSight(e.x, e.y, target.x, target.y)) {
      if (g.cd <= 0) gourdStartSlam(e, target, target);
      return;   // 冷卻中：就地等著
    }
    const [gc, gr] = cellAt(target.x, target.y);
    const nav = gourdNavigate(e, gc, gr, moveDt, 'hunt:' + gc + ',' + gr);
    if (nav.blocker) gourdSmashBlocker(e, nav.blocker);
    return;
  }
  // 核心醒著：回去守核心（js/core-frenzy.js）
  const core = typeof frenzyCoreGoal === 'function' ? frenzyCoreGoal(e) : null;
  if (core) {
    const [gc, gr] = cellAt(core.x, core.y);
    const nav = gourdNavigate(e, gc, gr, moveDt, 'core:' + gc + ',' + gr);
    if (nav.blocker) gourdSmashBlocker(e, nav.blocker);
    else if (nav.reached && Math.hypot(core.x - e.x, core.y - e.y) > CELL * 2) { e.coreReturning = false; e.coreGiveUpT = 4; }   // 走不到（窄道進不去）：先放棄，過一下再試
    return;
  }
  // 沒事做：發呆、拖到附近走得到的地方
  if (g.spot) {
    const nav = gourdNavigate(e, g.spot[0], g.spot[1], moveDt * C.wanderSpeedMul, 'wander:' + g.spot);
    if (nav.reached || nav.blocker) { g.spot = null; g.wait = gmRand(C.idleMin, C.idleMax); }
    return;
  }
  g.wait -= dt;
  if (g.wait <= 0) {
    const [ec, er] = cellAt(e.x, e.y), choices = [];
    for (let i = 0; i < 10; i++) {
      const c = ec + Math.round(gmRand(-C.wanderSteps, C.wanderSteps)), r = er + Math.round(gmRand(-C.wanderSteps, C.wanderSteps));
      if ((c !== ec || r !== er) && gourdWide(c, r) && !enemyBarrierAt(c, r)) choices.push([c, r]);
    }
    g.spot = choices.length ? choices[Math.floor(Math.random() * choices.length)] : null;
    g.wait = gmRand(C.idleMin, C.idleMax);
  }
}
// 笑聲：有冷卻，不會一直笑（force＝壓到人，不管冷卻）
function gourdLaugh(e, force) {
  const g = e.gm;
  if (!force && g.laughCd > 0) return;
  g.laughCd = GOURD.laughCooldown;
  if (typeof sfxAt === 'function') sfxAt('gourdLaugh', e.x, e.y, .8, 'gourd-laugh');
}
// 被建築擋路：冷卻好了就直接朝建築壓下去
function gourdSmashBlocker(e, o) {
  if (e.gm.cd > 0) return;
  const [c, r] = closestObstacleCell(e, o), [x, y] = center(c, r);
  gourdStartSlam(e, { x, y }, null);
}

// ---- 泰山壓頂：壓扁蓄力 → 升空（落點跟著目標）→ 砸下 → 陷在地上 ----
function gourdStartSlam(e, aim, target) {
  const C = GOURD, g = e.gm;
  const dx = aim.x - e.x, dy = aim.y - e.y, d = Math.hypot(dx, dy), k = d > C.maxLeap * CELL ? C.maxLeap * CELL / d : 1;
  g.slam = { phase: 'crouch', t: 0, target, from: { x: e.x, y: e.y }, spot: { x: e.x + dx * k, y: e.y + dy * k } };
  g.path = null;
  e.faceRight = aim.x > e.x;
}
function stepGourdSlam(e, dt) {
  const C = GOURD, g = e.gm, s = g.slam;
  s.t += dt;
  if (s.phase === 'crouch') {
    e.forceFrame = C.art.squash; e.slimeLift = 0; e.tremble = true;   // 壓扁、全身發抖（js/render.js）
    gourdTrackSpot(e, s, dt * .5);
    if (s.t >= C.crouch) {
      s.phase = 'rise'; s.t = 0; s.liftFrom = { x: e.x, y: e.y }; e.tremble = false;
      G.effects.push({ ring: true, x: e.x, y: e.y + 12, r: 6, r2: 34, life: .25, life0: .25, color: '#c8b590' });
      for (let i = 0; i < 6; i++) gmDust(e.x + gmRand(-20, 20), e.y + 12, true);
    }
    return;
  }
  if (s.phase === 'rise' || s.phase === 'hang') {
    e.forceFrame = C.art.tall;
    gourdTrackSpot(e, s, dt);
    const air = C.rise + C.hang, k = Math.min(1, ((s.phase === 'hang' ? C.rise : 0) + s.t) / air);
    // 在空中慢慢飄到落點上方（撞到牆就停在牆前）；高度用緩出曲線，到頂再輕輕晃
    const tx = s.liftFrom.x + (s.spot.x - s.liftFrom.x) * k, ty = s.liftFrom.y + (s.spot.y - s.liftFrom.y) * k;
    displaceEnemy(e, tx - e.x, ty - e.y, Math.hypot(tx - e.x, ty - e.y), true);
    if (s.phase === 'rise') {
      const u = Math.min(1, s.t / C.rise);
      e.slimeLift = C.height * (1 - (1 - u) * (1 - u));
      if (s.t >= C.rise) { s.phase = 'hang'; s.t = 0; }
    } else {
      e.slimeLift = C.height + Math.sin(s.t * 18) * 1.5;
      if (s.t >= C.hang) { s.phase = 'drop'; s.t = 0; }
    }
    return;
  }
  if (s.phase === 'drop') {
    e.forceFrame = C.art.tall;
    const u = Math.min(1, s.t / C.drop);
    e.slimeLift = C.height * (1 - u * u);
    displaceEnemy(e, s.spot.x - e.x, s.spot.y - e.y, Math.hypot(s.spot.x - e.x, s.spot.y - e.y), true);
    if (s.t >= C.drop) gourdImpact(e);
  }
}
// 落點慢慢跟著目標走（有速度上限，跑得快還是閃得掉），也不會離起跳點太遠
function gourdTrackSpot(e, s, dt) {
  const C = GOURD, t = s.target;
  if (!t || t.hp <= 0) return;
  const dx = t.x - s.spot.x, dy = t.y - s.spot.y, d = Math.hypot(dx, dy);
  if (d > .5) { const m = Math.min(d, C.track * dt); s.spot.x += dx / d * m; s.spot.y += dy / d * m; }
  const fx = s.spot.x - s.from.x, fy = s.spot.y - s.from.y, fd = Math.hypot(fx, fy), max = C.maxLeap * CELL;
  if (fd > max) { s.spot.x = s.from.x + fx / fd * max; s.spot.y = s.from.y + fy / fd * max; }
}
function gourdImpact(e) {
  const C = GOURD, g = e.gm, R = C.hitRadius, x = e.x, y = e.y;
  g.slam = null; g.recover = C.recover; g.cd = C.cooldown; e.slimeLift = 0; e.forceFrame = C.art.squash;
  resetEnemyNavigation(e);
  // 震動、衝擊波、揚塵、地裂
  G.effects.push({ ring: true, x, y: y + 12, r: 10, r2: R + 22, life: .38, life0: .38, color: '#b49a6c' });
  G.effects.push({ ring: true, x, y: y + 12, r: 6, r2: R, life: .26, life0: .26, color: '#efe0b8' });
  for (let i = 0; i < 14; i++) {
    const a = Math.PI * 2 * i / 14 + Math.random() * .3, sp = 70 + Math.random() * 80;
    G.effects.push({ particle: true, kind: 'spark', x, y: y + 10, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * .45 - 20,
      r: 2 + Math.random() * 2.5, life: .4 + Math.random() * .25, life0: .65, color: Math.random() < .5 ? '#a8936c' : '#d6c49a' });
  }
  gourdImpactFx(x, y + 12);   // 撞擊閃光、飛起來的石礫、往外翻滾的灰塵
  (G.gourdCracks = G.gourdCracks || []).push({ x, y: y + 12, life: C.crackLife, life0: C.crackLife, seed: Math.random() * 9, flip: Math.random() < .5 });
  if (typeof sfxAt === 'function') { sfxAt('gourdSlam', x, y, 1, 'gourd-slam'); sfxAt('gourdLandCry', x, y, .9, 'gourd-cry'); }
  // 畫面震動：越近震越大，被壓到再加一點頓格
  const p = G.player, pd = p ? Math.hypot(p.x - x, p.y - y) : Infinity, near = Math.max(0, 1 - pd / (C.shakeRange * CELL));
  if (near > 0) addShake(C.shakeMin + (C.shakeMax - C.shakeMin) * near);
  if (pd <= R) addHitstop(.07); else if (pd <= C.knockRadius) addHitstop(.04);
  // 壓到人：溫特、隊友（沒惹牠的阿瓦倫不算，跟史萊姆撲擊一樣）
  let crushed = false;
  if (p && p.hp > 0 && pd <= R && !parryMiss(p, true)) { gourdHitPlayer(e, p); crushed = true; }
  for (const t of G.towers) {
    if (t.hp <= 0 || Math.hypot(t.x - x, t.y - y) > R + 6 || !enemyNoticesSentry(e, t) || parryMiss(t, false)) continue;
    gourdHitSentry(e, t); crushed = true;
  }
  if (crushed) g.laughAt = C.laughDelay;   // 壓到人：喘氣時得意地笑
  // 震波：範圍內的隊友（和溫特）以葫蘆猴為中心往外震飛（沒受傷的也會飛；撞到牆就停）
  const shove = a => {
    const dx = a.x - x, dy = a.y - y, d = Math.hypot(dx, dy);
    if (d > C.knockRadius || a.rootT > 0) return;   // 被絲瓜藤纏住的飛不動
    const ang = d > 1 ? Math.atan2(dy, dx) : Math.random() * Math.PI * 2, k = d / C.knockRadius;
    knockActor(a, Math.cos(ang), Math.sin(ang), (C.knockMax + (C.knockMin - C.knockMax) * k) * CELL, C.knockTime);
    a.gourdToss = { t: 0, h: C.tossHeight + (C.tossMinHeight - C.tossHeight) * k, side: Math.cos(ang) >= 0 ? 1 : -1, bounced: false };   // 飛起來（畫的時候往上抬，影子留在地上）
  };
  if (C.knockPlayer && p && p.hp > 0) shove(p);
  for (const t of G.towers) if (t.hp > 0) { shove(t); t.navPath = null; t.navGoal = null; }
  G.effects.push({ ring: true, x, y: y + 12, r: R, r2: C.knockRadius, life: .45, life0: .45, color: '#8f7b56' });   // 外圈震波
  // 建築：壓到的扣「建築傷害」；壓不到、但在震波範圍內的晃一下、受一點傷（不會被震飛）
  const blds = new Map(), span = Math.ceil(C.knockRadius / CELL) + 1, [ec, er] = cellAt(x, y);
  for (let r = er - span; r <= er + span; r++) for (let c = ec - span; c <= ec + span; c++) {
    const o = inGrid(c, r) && enemyBarrierAt(c, r);
    if (!o) continue;
    const [cx, cy] = center(c, r), d = Math.hypot(cx - x, cy - y);   // 大建築：用離得最近的那一格算
    if (!blds.has(o) || d < blds.get(o)) blds.set(o, d);
  }
  for (const [o, d] of blds) {
    if (d <= R + CELL / 2) gourdCrushObstacle(e, o, e.buildingDamage ?? BARRIER.breakDmg);
    else if (d <= C.knockRadius + CELL / 2) {
      gourdCrushObstacle(e, o, C.shockBuildingDamage);
      const k = Math.max(0, Math.min(1, (d - R) / (C.knockRadius + CELL / 2 - R)));   // 越靠近葫蘆猴彈越高
      if (o.hp > 0 && !o.isBase) o.gourdHop = { t: -k * .08, h: C.hopMax + (C.hopMin - C.hopMax) * k, landed: false };   // 外圈晚一點點才彈，像震波往外傳
    }
  }
}
function gourdHitPlayer(e, p) {
  const dmg = Math.round(typeof equipPlayerDamage === 'function' ? equipPlayerDamage(e.playerDamage ?? 22) : e.playerDamage ?? 22);
  p.hp = Math.max(0, p.hp - dmg);
  p.hitT = .45; p.underAttackT = 5; p.lastAttacker = e;
  G.damageVignetteT = .5;
  flashDmg('-' + dmg, p.x, p.y - 46, '#ff6b6b');
  playPlayerHit(1, true);
  if (p.hp <= 0 && !G.over) { flash('部隊長失去戰鬥能力', p.x, p.y - 58, '#ff5b6e'); lose('player', '被' + monsterNameOf(e) + '壓扁'); }
}
function gourdHitSentry(e, t) {
  const dmg = (e.sentryDamage ?? 28) * (1 - sentryDefense(t));
  t.hp = Math.max(0, t.hp - dmg);
  t.hitT = Math.max(t.hitT || 0, .25);
  t.navPath = null; t.navGoal = null;
  flash('-' + Math.round(dmg), t.x, t.y - 30, '#ff8f8f');
  if (typeof mateHurtSay === 'function') mateHurtSay(t, 'slammed');   // 對話編輯器「被葫蘆猴壓到」
  if (t.hp <= 0) { t.target = null; sentryStatus(t, '失去戰鬥能力', '#ff5b6e', true); }
}
function gourdCrushObstacle(e, o, dmg) {   // 跟 enemyAttackObstacle 一樣扣血，只是不揮手、一次壓一下；hitT 會讓建築閃紅、晃一下（js/render.js）
  if (o.type === 'camping_lights') return;
  o.lastHitBy = 'monster';   // 油桶被怪物打壞只會漏油、不會爆炸
  o.hp -= dmg;
  o.hitT = HIT_DUR;
  if (o.isBase) warnCampAttack();
  if (o.hp > 0) return;
  removeBarrier(o);
  if (o.isBase) {
    flash('基地被摧毀！', OX + (o.c + o.w / 2) * CELL, OY + o.r * CELL - 18, '#ff5b5b');
    if (!G.over) baseLost();
  }
}

// ---- 拖行的痕跡、揚塵、聲音 ----
function gourdDragTrail(e, moved) {
  const C = GOURD, g = e.gm;
  if (moved < .01 || moved > 20) return;
  // 拖行是一頓一頓的：慢的那一下幾乎沒動，render.js 會當成停下來換回「正」。只要還在拖就算走路，右晃／左晃不中斷
  e.walkUntil = performance.now() / 1000 + .35;
  g.markDist = (g.markDist || 0) + moved; g.soundDist = (g.soundDist || 0) + moved;
  if (g.markDist >= C.markEvery) {
    g.markDist = 0;
    const a = Math.atan2(e.y - (g.lastMarkY ?? e.y), e.x - (g.lastMarkX ?? e.x));
    (G.gourdMarks = G.gourdMarks || []).push({ x: e.x, y: e.y + 11, a, life: C.markLife });
    g.lastMarkX = e.x; g.lastMarkY = e.y;
    if (Math.random() < .5) gmDust(e.x + gmRand(-14, 14), e.y + 12, false);
  }
  if (g.soundDist >= C.soundEvery) { g.soundDist = 0; if (typeof sfxAt === 'function') sfxAt('gourdDrag', e.x, e.y, .3, 'gourd-drag'); }
}
function gmDust(x, y, big) {
  G.effects.push({ particle: true, kind: 'spark', x: x + gmRand(-4, 4), y: y - 2, vx: gmRand(-20, 20), vy: -gmRand(10, big ? 40 : 22),
    r: (big ? 2.5 : 1.6) + Math.random() * 2, life: .4 + Math.random() * .3, life0: .7, color: Math.random() < .5 ? '#a8936c' : '#cdbb91' });
}
// game.js 的 update 呼叫：刮痕、地裂慢慢淡掉
function updateGourd(dt) {
  if (G.gourdMarks && G.gourdMarks.length) { for (const m of G.gourdMarks) m.life -= dt; G.gourdMarks = G.gourdMarks.filter(m => m.life > 0); }
  if (G.gourdCracks && G.gourdCracks.length) { for (const k of G.gourdCracks) k.life -= dt; G.gourdCracks = G.gourdCracks.filter(k => k.life > 0); }
  updateGourdTosses(dt);
  updateGourdBodies();
  updateGourdDebris(dt);
  updateGourdHops(dt);
  gourdTestSpawn();
}
// ---- 身體擋人：溫特、隊友走不進葫蘆猴的身體（腳下的橢圓），貼上去會沿著邊緣滑開；牠拖過來也會把人推開 ----
// 不改尋路（隊友照原本的路線走，碰到身體就被擠開繞過去）；升到空中時不擋（落地的震波會把人震開）
function updateGourdBodies() {
  const C = GOURD, bodies = G.enemies.filter(e => e.behavior === 'gourd' && e.hp > 0 && !e.dead && (e.slimeLift || 0) < C.bodyAirLift);
  if (!bodies.length) return;
  const actors = [];
  if (G.player && G.player.hp > 0 && !G.player.sitting && !G.playerDeath) actors.push([G.player, typeof PLAYER !== 'undefined' && PLAYER.r || 12, playerBlocked]);
  for (const t of G.towers) if (t.hp > 0 && !t.sitting) actors.push([t, 12, typeof sentryBlocked === 'function' ? sentryBlocked : () => false]);
  for (const e of bodies) {
    const w = e.drawWidth || 70, cx = e.x, cy = e.y + C.bodyY;
    for (const [a, ar, blocked] of actors) {
      if (a.rootT > 0) continue;   // 被絲瓜藤纏住的拉不動
      const RX = w * C.bodyW + ar, RY = w * C.bodyW * C.bodyFlat + ar * .6;
      let dx = a.x - cx, dy = a.y - cy;
      const q = Math.hypot(dx / RX, dy / RY);
      if (q >= 1) continue;
      if (q < .05) { const ang = Math.random() * Math.PI * 2; dx = Math.cos(ang) * RX * .05; dy = Math.sin(ang) * RY * .05; }   // 剛好疊在正中間：隨便挑個方向推
      const k = 1 / Math.max(q, .05), tx = cx + dx * k, ty = cy + dy * k;
      // 往外一小步一小步推，前面是牆就停（不要把人推進牆裡）
      const dist = Math.hypot(tx - a.x, ty - a.y), steps = Math.max(1, Math.ceil(dist / 3));
      for (let i = 0; i < steps; i++) {
        const nx = a.x + (tx - a.x) / (steps - i), ny = a.y + (ty - a.y) / (steps - i);
        if (!blocked(nx, ny)) { a.x = nx; a.y = ny; }
        else if (!blocked(nx, a.y)) a.x = nx;
        else if (!blocked(a.x, ny)) a.y = ny;
        else break;
      }
    }
  }
}
// ---- 被震飛：拋物線飛起來 → 落地揚塵 → 再小彈一下（只影響畫面位置；水平移動是 knockActor 的滑行）----
function updateGourdTosses(dt) {
  const C = GOURD, list = [G.player, ...G.towers];
  for (const a of list) {
    const s = a && a.gourdToss;
    if (!s) continue;
    s.t += dt;
    if (!s.bounced && s.t >= C.knockTime) {   // 落地
      s.bounced = true;
      G.effects.push({ ring: true, x: a.x, y: a.y + 14, r: 4, r2: 22, life: .22, life0: .22, color: '#c8b590' });
      for (let i = 0; i < 4; i++) gmDust(a.x + gmRand(-10, 10), a.y + 14, false);
      if (typeof sfxAt === 'function') sfxAt('gourdTossLand', a.x, a.y, .35, 'gourd-toss-land');
    }
    if (s.t >= C.knockTime + C.bounceTime) a.gourdToss = null;
  }
}
// 由 js/render.js 在畫溫特、隊友之前呼叫：往上抬、身體往後仰；落地那一下壓扁
function applyGourdTossTransform(ctx, a) {
  const C = GOURD, s = a && a.gourdToss;
  if (!s) return;
  let z, lean, squash = 0;
  if (s.t < C.knockTime) {
    const u = s.t / C.knockTime;
    z = 4 * s.h * u * (1 - u); lean = Math.sin(u * Math.PI) * C.tossSpin;
  } else {
    const u = Math.min(1, (s.t - C.knockTime) / C.bounceTime);
    z = 4 * s.h * .18 * u * (1 - u); lean = 0; squash = u < .35 ? (1 - u / .35) * .18 : 0;
  }
  const fx = a.x, fy = a.y + 16;   // 以腳底為中心
  ctx.translate(fx, fy - z); ctx.rotate(s.side * lean); ctx.scale(1 + squash, 1 - squash); ctx.translate(-fx, -fy);
}
// ---- 測試用：進戰鬥地圖時在營地右邊 testCampDist 格放一隻（跟金蕉王的測試生成一樣，但只挑寬的格子）----
function gourdTestSpawn() {
  const C = GOURD;
  if (!C.testSpawn || G.gourdTestDone || MAP_SAFE || !G.running || G.over || !G.player
    || (typeof MONSTER_PREVIEW_ID !== 'undefined' && MONSTER_PREVIEW_ID) || (typeof practiceOn === 'function' && practiceOn())) return;
  G.gourdTestDone = true;
  const spec = ACTIVE_MONSTERS.find(m => m.id === 'gourd_monkey'); if (!spec) return;
  if (G.enemies.some(o => o.type === spec.id && o.hp > 0)) return;   // 讀回戰場進度時已經有了
  const zones = (typeof mapBases !== 'undefined' ? mapBases : []).map(stamp => {
    const tile = mapTileById(stamp.id);
    return { x: OX + stamp.c * CELL + (stamp.ox || 0), y: OY + stamp.r * CELL + (stamp.oy || 0), w: mapStampW(stamp, tile) * CELL, h: mapStampH(stamp, tile) * CELL };
  });
  if (!zones.length) for (const key of campCells) { const [c, r] = key.split(',').map(Number); zones.push({ x: OX + c * CELL, y: OY + r * CELL, w: CELL, h: CELL }); }
  let gx, gy;
  if (zones.length) {
    const right = Math.max(...zones.map(z => z.x + z.w)), top = Math.min(...zones.map(z => z.y)), bottom = Math.max(...zones.map(z => z.y + z.h));
    gx = right + C.testCampDist * CELL; gy = (top + bottom) / 2;
  } else { gx = G.player.x + C.testCampDist * CELL; gy = G.player.y; }
  const floor = typeof mapFloorCells === 'function' ? mapFloorCells() : null;
  const [gc, gr] = cellAt(gx, gy);
  let best = null, bestD = Infinity;
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {   // 目標格站不了：找最近一格寬的、能站的
    if (!gourdWide(c, r) || enemyBarrierAt(c, r) || (floor && !floor.has(c + ',' + r))) continue;
    const [x, y] = center(c, r);
    if (enemyBlocked(x, y)) continue;
    const d = Math.hypot(c - gc, r - gr);
    if (d < bestD) { bestD = d; best = [x, y]; }
  }
  if (!best) return;
  G.enemies.push(createMonster(spec, best[0], best[1]));
  if (typeof systemNotice === 'function') systemNotice('🐒 葫蘆猴出現在營地右邊約 ' + C.testCampDist + ' 格的地方。');
}

// ---- 地面層（render.js 呼叫）：拖痕、地裂、落點警示圈 ----
function drawGourdGround(ctx) {
  const C = GOURD;
  ctx.save();
  for (const m of G.gourdMarks || []) {   // 兩道平行的刮痕
    if (!isVisible(m.x, m.y)) continue;
    ctx.globalAlpha = .22 * Math.min(1, m.life / 2); ctx.strokeStyle = '#2a2116'; ctx.lineWidth = 2;
    const ca = Math.cos(m.a), sa = Math.sin(m.a), nx = -sa, ny = ca;
    for (const off of [-9, 9]) {
      ctx.beginPath(); ctx.moveTo(m.x + nx * off * .5 - ca * 4, m.y + ny * off * .25 - sa * 2); ctx.lineTo(m.x + nx * off * .5 + ca * 4, m.y + ny * off * .25 + sa * 2); ctx.stroke();
    }
  }
  for (const k of G.gourdCracks || []) {   // 砸出來的地裂
    if (!isVisible(k.x, k.y)) continue;
    const img = monsterImage(C.crackImage);   // 地面裂痕圖（images/破損建築/crack06.png），隨機左右翻
    if (img.complete && img.naturalWidth) {
      const w = img.naturalWidth * C.crackScale, h = img.naturalHeight * C.crackScale, prev = ctx.imageSmoothingEnabled;
      ctx.globalAlpha = Math.min(1, k.life / 1.5); ctx.imageSmoothingEnabled = false;
      ctx.save(); ctx.translate(k.x, k.y); if (k.flip) ctx.scale(-1, 1);
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
      ctx.restore(); ctx.imageSmoothingEnabled = prev;
    }
    ctx.globalAlpha = .5 * Math.min(1, k.life / 1.5); ctx.strokeStyle = '#1d1710'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.ellipse(k.x, k.y, 26, 9, 0, 0, Math.PI * 2); ctx.stroke();
    for (let i = 0; i < 7; i++) {
      const a = k.seed + i * 0.9, len = 18 + ((i * 37 + k.seed * 13) % 16);
      ctx.beginPath(); ctx.moveTo(k.x + Math.cos(a) * 12, k.y + Math.sin(a) * 4);
      ctx.lineTo(k.x + Math.cos(a + .2) * (12 + len * .5), k.y + Math.sin(a + .2) * (4 + len * .2));
      ctx.lineTo(k.x + Math.cos(a - .1) * (12 + len), k.y + Math.sin(a - .1) * (4 + len * .38)); ctx.stroke();
    }
  }
  for (const e of G.enemies) {   // 落點警示：蓄力時淡淡出現，升空後越來越紅、由外往內填滿
    const s = e.gm && e.gm.slam;
    if (!s || e.hp <= 0) continue;
    const total = C.crouch + C.rise + C.hang + C.drop;
    const done = s.phase === 'crouch' ? s.t : s.phase === 'rise' ? C.crouch + s.t : s.phase === 'hang' ? C.crouch + C.rise + s.t : total;
    const k = Math.min(1, done / (total - C.drop)), R = C.hitRadius, gx = s.spot.x, gy = s.spot.y + 12;
    ctx.globalAlpha = .12 + .25 * k; ctx.fillStyle = '#ff4b3a';
    ctx.beginPath(); ctx.ellipse(gx, gy, R * k, R * .45 * k, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = .4 + .5 * k; ctx.strokeStyle = s.phase === 'hang' && Math.sin(s.t * 40) > 0 ? '#ffd2c4' : '#ff8665'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(gx, gy, R, R * .45, 0, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
}

// ---- 落地特效：撞擊白光＋衝擊圖、石礫拋物線飛起來（落地彈一下、在地上滾停）、灰塵團往外翻滾再往上飄散 ----
const GM_ROCK_COLORS = [['#8a7f70', '#4e463c'], ['#a19580', '#5c5245'], ['#6f675c', '#3b352e'], ['#b5a88f', '#6b604f']];
function gourdImpactFx(x, y) {
  const F = GOURD.fx;
  // 撞擊圖跟鳥頭人衝撞同一組（images/Attack effects/charge-impact，原圖朝右）：轉成朝下，像從天上砸下來；再往四周噴暖色火花
  if (typeof playAttackSprite === 'function') playAttackSprite('charge-impact', x, y - 12, .42, Math.PI / 2);
  for (let i = 0; i < 10; i++) {
    const a = Math.PI * 2 * i / 10 + gmRand(-.25, .25), sp = gmRand(140, 260);
    G.effects.push({ particle: true, kind: 'spark', x, y: y - 8, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * .5 - 30,
      r: 2 + Math.random() * 2, life: .16 + Math.random() * .14, life0: .3, color: i % 2 ? '#fff0c8' : '#ffb066' });
  }
  (G.gourdFlashes = G.gourdFlashes || []).push({ x, y, life: F.flash, life0: F.flash });
  rockBurstFx(x, y, { rocks: F.rocks, speed: F.rockSpeed, up: F.rockUp, dust: F.dust, dustRise: F.dustRise });
}
// ---- 共用：石礫＋灰塵噴飛（葫蘆猴落地、自爆史萊姆、希奧妮／安柏大招、油桶油箱、地雷、花蓮老鼠出土和伸手都用這個）----
// 石礫、灰塵跟葫蘆猴共用同一組陣列，所以更新、繪製都不用另外接。
// o：rocks＝石礫顆數、speed／up＝往外飛／往上彈的速度範圍、dust＝貼地翻滾的灰塵團數、dustRise＝往上冒的灰塵團數、
//    size＝石塊與灰塵大小倍率、spread＝從中心多遠的地方噴出來（像素）
const ROCK_BURST = {
  bomber:  { rocks: 10, speed: [60, 160], up: [110, 220], dust: 6, dustRise: 2, size: .75 },   // 自爆史萊姆
  ult:     { rocks: 12, speed: [70, 170], up: [120, 240], dust: 7, dustRise: 3, size: .85 },   // 希奧妮、安柏大招打中的地方
  mine:    { rocks: 14, speed: [70, 190], up: [140, 280], dust: 8, dustRise: 3, size: .9 },    // 地雷
  oil:     { rocks: 20, speed: [80, 220], up: [150, 300], dust: 12, dustRise: 5, size: 1 },    // 油桶、油箱（瓦斯爐用一半）
  mouseOut:  { rocks: 9, speed: [40, 110], up: [110, 200], dust: 5, dustRise: 2, size: .7, spread: 20 },   // 花蓮老鼠鑽出地面
  mouseHand: { rocks: 5, speed: [30, 90], up: [90, 170], dust: 2, dustRise: 1, size: .55, spread: 8 },     // 花蓮老鼠的手戳出地面
};
function rockBurstFx(x, y, o) {
  if (typeof o === 'string') o = ROCK_BURST[o];
  if (!o || typeof G === 'undefined') return;
  const S = o.size || 1, sp0 = o.spread == null ? 14 : o.spread, speed = o.speed || [70, 190], up = o.up || [140, 280];
  const rocks = G.gourdRocks = G.gourdRocks || [];
  for (let i = 0; i < (o.rocks || 0); i++) {
    const a = Math.random() * Math.PI * 2, sp = gmRand(speed[0], speed[1]), big = Math.random() < .3;
    const pts = [];   // 不規則的小石塊（5～6 個角）
    const n = 5 + (Math.random() < .5 ? 1 : 0), sz = (big ? gmRand(4, 6.5) : gmRand(2, 4)) * S;
    for (let k = 0; k < n; k++) { const t = k / n * Math.PI * 2; pts.push([Math.cos(t) * sz * gmRand(.65, 1.1), Math.sin(t) * sz * gmRand(.55, 1)]); }
    rocks.push({ x: x + Math.cos(a) * sp0, y: y + Math.sin(a) * sp0 * .43, z: gmRand(4, 14), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * .5, vz: gmRand(up[0], up[1]) * (big ? .75 : 1),
      spin: gmRand(-12, 12), rot: Math.random() * 6, pts, col: GM_ROCK_COLORS[Math.floor(Math.random() * GM_ROCK_COLORS.length)], life: gmRand(1.6, 2.6), bounces: 0 });
  }
  const dust = [], nd = o.dust || 0;
  for (let i = 0; i < nd; i++) {   // 貼著地面往外翻滾的一圈灰塵
    const a = i / nd * Math.PI * 2 + gmRand(-.2, .2), sp = gmRand(70, 130) * S;
    dust.push({ x: x + Math.cos(a) * sp0 * 1.3, y: y + Math.sin(a) * sp0 * .57, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * .45 - 6, r0: gmRand(8, 12) * S, r1: gmRand(26, 38) * S, life: 0, life0: gmRand(.9, 1.4), shade: Math.random() });
  }
  for (let i = 0; i < (o.dustRise || 0); i++)   // 從正中間往上冒的灰塵
    dust.push({ x: x + gmRand(-16, 16) * S, y: y - gmRand(0, 10), vx: gmRand(-15, 15), vy: -gmRand(25, 50), r0: gmRand(10, 14) * S, r1: gmRand(30, 44) * S, life: 0, life0: gmRand(1.1, 1.6), shade: Math.random() });
  for (const d of dust) d.life = d.life0;
  (G.gourdDust = G.gourdDust || []).push(...dust);
}
function updateGourdDebris(dt) {
  if (G.gourdFlashes && G.gourdFlashes.length) { for (const f of G.gourdFlashes) f.life -= dt; G.gourdFlashes = G.gourdFlashes.filter(f => f.life > 0); }
  if (G.gourdRocks && G.gourdRocks.length) {
    for (const r of G.gourdRocks) {
      r.life -= dt;
      if (r.z > 0 || r.vz > 0) {
        r.vz -= 720 * dt; r.z += r.vz * dt; r.rot += r.spin * dt;
        if (r.z <= 0) {   // 落地：彈一下，然後在地上滾停
          r.z = 0; r.bounces++;
          if (r.bounces < 2 && r.vz < -60) { r.vz = -r.vz * .3; r.vx *= .55; r.vy *= .55; r.spin *= .5; }
          else { r.vz = 0; }
        }
      } else { r.vx *= Math.pow(.02, dt); r.vy *= Math.pow(.02, dt); r.rot += r.spin * dt * .2; r.spin *= Math.pow(.05, dt); }
      const nx = r.x + r.vx * dt, ny = r.y + r.vy * dt, [c, rr] = cellAt(nx, ny);
      if (inGrid(c, rr) && !isWall(c, rr)) { r.x = nx; r.y = ny; } else { r.vx *= -.35; r.vy *= -.35; }   // 撞牆彈回來
    }
    G.gourdRocks = G.gourdRocks.filter(r => r.life > 0);
  }
  if (G.gourdDust && G.gourdDust.length) {
    for (const d of G.gourdDust) { d.life -= dt; d.x += d.vx * dt; d.y += d.vy * dt; d.vx *= Math.pow(.08, dt); d.vy = d.vy * Math.pow(.08, dt) - 10 * dt; }   // 很快慢下來，最後微微往上飄
    G.gourdDust = G.gourdDust.filter(d => d.life > 0);
  }
}
// 角色上層（render.js 呼叫）：石礫、灰塵團、撞擊白光
function drawGourdTop(ctx) {
  if (!(G.gourdRocks && G.gourdRocks.length) && !(G.gourdDust && G.gourdDust.length) && !(G.gourdFlashes && G.gourdFlashes.length)) return;
  ctx.save();
  for (const f of G.gourdFlashes || []) {   // 撞擊白光：一瞬間亮起的扁橢圓
    if (!isVisible(f.x, f.y)) continue;
    const k = f.life / f.life0, R = GOURD.hitRadius * (1.25 - .35 * k);
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, R);
    g.addColorStop(0, `rgba(255,248,225,${(.85 * k).toFixed(3)})`); g.addColorStop(.5, `rgba(255,220,160,${(.35 * k).toFixed(3)})`); g.addColorStop(1, 'rgba(255,200,140,0)');
    ctx.fillStyle = g; ctx.save(); ctx.translate(f.x, f.y); ctx.scale(1, .5); ctx.translate(-f.x, -f.y);
    ctx.beginPath(); ctx.arc(f.x, f.y, R, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    ctx.globalCompositeOperation = 'source-over';
  }
  for (const d of G.gourdDust || []) {   // 灰塵團：由小變大、先濃後淡
    if (!isVisible(d.x, d.y)) continue;
    const prog = 1 - d.life / d.life0, r = d.r0 + (d.r1 - d.r0) * (1 - (1 - prog) * (1 - prog));
    const alpha = (prog < .12 ? prog / .12 : (1 - prog) / .88) * .5;
    if (alpha <= .01) continue;
    const c = [Math.round(168 + d.shade * 30), Math.round(150 + d.shade * 26), Math.round(115 + d.shade * 22)];
    const g = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, r);
    g.addColorStop(0, `rgba(${c},${alpha.toFixed(3)})`); g.addColorStop(.6, `rgba(${c},${(alpha * .5).toFixed(3)})`); g.addColorStop(1, `rgba(${c},0)`);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(d.x, d.y, r, 0, Math.PI * 2); ctx.fill();
  }
  for (const r of G.gourdRocks || []) {   // 石礫：地上有影子，越高影子越小
    if (!isVisible(r.x, r.y)) continue;
    const a = Math.min(1, r.life / .5);
    ctx.globalAlpha = .3 * a * Math.max(.3, 1 - r.z / 90); ctx.fillStyle = '#120e0a';
    ctx.beginPath(); ctx.ellipse(r.x, r.y + 2, 3.5, 1.4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = a; ctx.save(); ctx.translate(Math.round(r.x), Math.round(r.y - r.z)); ctx.rotate(r.rot);
    ctx.beginPath(); r.pts.forEach(([px, py], i) => i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)); ctx.closePath();
    ctx.fillStyle = r.col[0]; ctx.fill(); ctx.strokeStyle = r.col[1]; ctx.lineWidth = 1; ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

// ---- 震波範圍內的建築：原地彈一下（只動畫面，格子位置不變；擋路、尋路都不受影響）----
function updateGourdHops(dt) {
  const C = GOURD;
  for (const o of G.obstacles) {
    const h = o.gourdHop;
    if (!h) continue;
    h.t += dt;
    if (!h.landed && h.t >= C.hopTime) {   // 落回原位：腳下揚一點灰塵
      h.landed = true;
      const w = (o.w || 1) * CELL, bx = OX + o.c * CELL + w / 2, by = OY + (o.r + (o.h || 1)) * CELL;
      for (let i = 0; i < 3 + (o.w || 1) * 2; i++) gmDust(bx + gmRand(-w / 2, w / 2), by - 2, false);
    }
    if (h.t >= C.hopTime + .14) o.gourdHop = null;
  }
}
// 由 js/render.js 的 drawObstacle 呼叫：回傳這一幀要往上抬多少、落地壓扁多少；沒在彈就回傳 null
function gourdHopOffset(o) {
  const C = GOURD, h = o.gourdHop;
  if (!h || h.t < 0) return null;
  if (h.t < C.hopTime) { const u = h.t / C.hopTime; return { z: 4 * h.h * u * (1 - u), sx: 1 - .04 * Math.sin(u * Math.PI), sy: 1 + .05 * Math.sin(u * Math.PI) }; }   // 空中微微拉長
  const u = (h.t - C.hopTime) / .14, q = Math.sin(u * Math.PI) * .07;   // 落地：壓扁一下再回正
  return { z: 0, sx: 1 + q, sy: 1 - q };
}

// ---- 死掉：不倒下，原地閉上眼睛、變黑，再從頭頂碎成灰燼往上飄散（沿用珍珠小童的 drop 屍體，js/pearl-kid.js）----
// 在空中被打死會先掉回地上再消散；站在地上死掉就不壓扁、直接開始變黑
function gourdDeathCorpse(e) {
  const f = e.frames || {}, file = (f.blink && f.blink[f.blink.length - 1]) || f.front || e.sprite;   // 眨眼最後一張＝閉眼
  const z = e.slimeLift || 0, onGround = z <= .5;
  (G.fxCorpses = G.fxCorpses || []).push({ drop: true, noBits: true, img: monsterImage(file), x: e.x, y: e.y, z: onGround ? 0 : z, vz: 0,
    w: e.drawWidth || 70, h: e.drawHeight || 110, t: 0, life: DISSOLVE.start + DISSOLVE.spread + DISSOLVE.life + .05,
    landed: onGround, landT: onGround ? -1 : 0 });
  e.tremble = false;
}
