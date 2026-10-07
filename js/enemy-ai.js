/* ===== 怪物 AI =====
   從 game.js 拆出來的「異質體怎麼動、怎麼打」：
   - 尋路：沿流場往營地走、繞過牆、必要時打破建築
   - 感知：18 格內發現哨兵／玩家就追擊，否則在黑暗中遊蕩
   - 攻擊：打建築、打哨兵、撞玩家
   - 史萊姆的跳躍與撲擊
   - stepEnemy：每一幀每隻怪物的行動總入口（由 game.js 的 update() 呼叫）
   想調怪物的種類與數值請改 data/monsters.js；這裡是行為規則。
   必須在 game.js 之前載入。
*/
// ---- 怪物尋路：走向流場更低的相鄰格 ----
function commitNext(e) {
  const [cc, cr] = cellAt(e.x, e.y);
  if (isCamp(cc, cr) && !isWall(cc, cr)) {
    // 有可破壞基地時，走進開放入口的怪物會停下攻擊基地，而不是略過基地 HP。
    const base = G.obstacles.find(o => o.isBase && o.hp > 0);
    if (base) { e.baseTarget = base; }
    else { e.exiting = true; }
    e.hasTarget = true; e.tcell = null; return;
  }
  let best = null, bestd = flowAt(cc, cr);
  for (const [dc, dr] of [[0, 1], [-1, 0], [1, 0], [0, -1]]) {
    const nc = cc + dc, nr = cr + dr, fd = flowAt(nc, nr);
    if (fd < bestd) { bestd = fd; best = [nc, nr]; }
  }
  if (!best) { e.stuck = true; e.hasTarget = true; e.tcell = null; return; }
  e.tcell = best; [e.tx, e.ty] = center(best[0], best[1]);
  e.hasTarget = true; e.stuck = false; e.exiting = false;
}
function enemyAttackObstacle(e, o, dt) {
  e.attackingObstacle = o;
  e.atkCd = (e.atkCd || 0) - dt;
  if (e.atkCd > 0) return;
  e.atkCd = BARRIER.breakInterval;
  o.lastHitBy = 'monster';   // 油桶被怪物打壞只會漏油、不會爆炸
  o.hp -= e.buildingDamage ?? BARRIER.breakDmg;
  o.hitT = HIT_DUR;
  if (o.isBase) warnCampAttack();
  if (e.type === 'slime' && typeof sfxAt === 'function') sfxAt('knock2', e.x, e.y, 0.52, 'slime-building');
  if (o.hp > 0) return;
  removeBarrier(o); e.hasTarget = false; e.baseTarget = null;
  if (o.isBase) {
    flash('基地被摧毀！', OX + (o.c + o.w / 2) * CELL, OY + o.r * CELL - 18, '#ff5b5b');
    if (!G.over) lose('base');
  }
}
function enemyAttackSentry(e, target, dt) {
  e.atkCd = (e.atkCd || 0) - dt;
  if (e.atkCd > 0 || !target || target.hp <= 0) return;
  e.atkCd = 1;
  const spec = TYPES[target.type], defense = Math.max(0, Math.min(.75, spec.defense || 0));
  const damage = (e.sentryDamage ?? 14) * (1 - defense);
  target.hp = Math.max(0, target.hp - damage);
  target.hitT = Math.max(target.hitT || 0, .2);   // 受擊閃紅
  // 擊退：被怪物往外推約 0.6 格（撞牆就不推）
  const dx = target.x - e.x, dy = target.y - e.y, d = Math.hypot(dx, dy) || 1;
  const nx = target.x + dx / d * CELL * 0.6, ny = target.y + dy / d * CELL * 0.6;
  const [cc, cr] = cellAt(nx, ny);
  if (typeof sentryCellWalkable === 'function' && sentryCellWalkable(cc, cr)) { target.x = nx; target.y = ny; target.navPath = null; target.navGoal = null; }
  flash('-' + Math.round(damage), target.x, target.y - 30, '#ff8f8f');
  if (target.hp <= 0) { target.target = null; sentryStatus(target, '失去戰鬥能力', '#ff5b6e', true); }
}
function enemyAttackPlayer(e, dt) {
  const p = G.player;
  if (!p || p.hp <= 0) return;
  if ((e.playerTouchCd || 0) > 0) return;
  e.playerTouchCd = 1;
  const damage = e.playerDamage ?? 12;
  p.hp = Math.max(0, p.hp - damage);
  p.hitT = .45; p.underAttackT = 5; p.lastAttacker = e;
  for (const sentry of G.towers) if (sentry.type === 'red' && sentry.hp > 0 && !sentry.berserk) {
    sentry.cd = Math.min(sentry.cd, .1);
    sentry.navPath = null; sentry.navGoal = null; sentry.navTimer = 0;
  }
  G.damageVignetteT = .45; G.cameraShakeT = .2;
  // 沿史萊姆撞擊方向將玩家推開；若後方是牆或建築，就逐步縮短擊退距離。
  const dx = p.x - e.x, dy = p.y - e.y, distance = Math.hypot(dx, dy) || 1;
  for (let push = 18; push >= 2; push -= 2) {
    const nx = p.x + dx / distance * push, ny = p.y + dy / distance * push;
    if (!playerBlocked(nx, ny)) { p.x = nx; p.y = ny; break; }
    if (!playerBlocked(nx, p.y)) { p.x = nx; break; }
    if (!playerBlocked(p.x, ny)) { p.y = ny; break; }
  }
  flashDmg('-' + damage, p.x, p.y - 46, '#ff6b6b'); addShake(4);   // 玩家被打：彈出傷害＋震動
  playSlimeAudio('hit');
  if (p.hp <= 0 && !G.over) {
    flash('部隊長失去戰鬥能力', p.x, p.y - 58, '#ff5b6e');
    lose('player');
  }
}
// 史萊姆撲擊：目標（玩家、哨兵或嚮導）在 3 格內就蓄力，朝「蓄力開始當下」目標的位置飛撲。
// 地上會出現落點警示，看到就能閃開；落地時落點附近的玩家、哨兵、嚮導都會受傷。
function trySlimePounce(e, target, distance) {
  if (e.type !== 'slime' || e.variant === 'spitter' || !target || distance > SLIME_POUNCE.range || distance <= 40) return false;   // 吐酸型改用遠程吐酸，不撲擊
  if ((e.playerPounceCd || 0) > 0 || (e.playerPounceT || 0) > 0 || e.slimeClock / SLIME_JUMP.total < SLIME_JUMP.airRatio) return false;
  if (!hasLineOfSight(e.x, e.y, target.x, target.y)) return false;   // 隔著牆不會撲
  const dx = target.x - e.x, dy = target.y - e.y, d = Math.hypot(dx, dy) || 1;
  const reach = Math.max(0, Math.min(d, SLIME_POUNCE.maxLeap) - 14);   // 落在目標面前一點，擊退才有方向
  e.playerWindupT = SLIME_POUNCE.windup;
  e.playerPounceCd = SLIME_POUNCE.cooldown;
  e.playerPounceGoal = { x: e.x + dx / d * reach, y: e.y + dy / d * reach };
  e.slimeLift = 0; e.slimeScaleX = 1.18; e.slimeScaleY = .76;
  return true;
}
function enemyPursuePlayer(e, playerDistance, moveDt, dt) {
  if (!G.player || G.player.hp <= 0 || playerDistance > ENEMY_SENSE_RANGE) return false;
  if (playerDistance <= 30) { enemyAttackPlayer(e, dt); return true; }
  if (trySlimePounce(e, G.player, playerDistance)) return true;
  const [gc, gr] = cellAt(G.player.x, G.player.y);
  const nav = enemyNavigate(e, gc, gr, moveDt, 'player:' + gc + ',' + gr, true);
  if (nav.blocker) enemyAttackObstacle(e, nav.blocker, dt);
  return true;
}
// ---- 被哨兵打中會拉仇恨 ----
// 被哨兵／嚮導攻擊後，SENTRY_AGGRO_TIME 秒內會優先追打那位攻擊者（連探照燈都先不管）。
// 優先順序：嘲諷中的哨兵 ＞ 溫特開槍的仇恨 ＞ 打自己的哨兵 ＞ 探照燈 ＞ 最近的哨兵…
const SENTRY_AGGRO_TIME = 5;
// 「不主動吸引仇恨」的哨兵（阿瓦倫，資料裡的 noAggro）：怪物平常當作沒看到他，
// 只有被他打中、正在記仇（sentryAggro）的那一隻才會攻擊他。
function enemyNoticesSentry(e, t) {
  if (!TYPES[t.type] || !TYPES[t.type].noAggro) return true;
  return e.sentryAggro === t && e.sentryAggroT > 0;
}
function aggroOnSentry(e, t) {
  if (!e || !t || e.dead || !G.enemies.includes(e) || !G.towers.includes(t)) return;
  e.sentryAggro = t; e.sentryAggroT = SENTRY_AGGRO_TIME;
}
// 追擊並攻擊指定的哨兵：貼身就打、3 格內撲擊，否則尋路靠近（路上被建築擋住就先拆）
function enemyChaseSentry(e, target, distance, moveDt, dt) {
  if (distance <= 22) { enemyAttackSentry(e, target, dt); return; }
  if (trySlimePounce(e, target, distance)) return;   // 3 格內：蓄力撲向哨兵／嚮導
  const [gc, gr] = cellAt(target.x, target.y);
  const nav = enemyNavigate(e, gc, gr, moveDt, 'sentry:' + target.type + ':' + gc + ',' + gr, true);
  if (nav.blocker) enemyAttackObstacle(e, nav.blocker, dt);
}
function enemyBlocked(x, y) {
  const [c, r] = cellAt(x, y);
  return !inGrid(c, r) || isWall(c, r) || !!barrierAt(c, r);
}
function resetEnemyNavigation(e) {
  e.hasTarget = false; e.baseTarget = null;
  e.aiPath = null; e.aiGoal = null; e.aiRouteKey = null; e.aiRouteTimer = 0;
  e.wanderCell = null;
}
// 擊退與衝撞要逐小步檢查，避免一次跨進基地、牆壁或建築的阻擋格。
function displaceEnemy(e, dx, dy, distance, resetRoute = true) {
  const length = Math.hypot(dx, dy);
  if (!length || distance <= 0) return false;
  const steps = Math.max(1, Math.ceil(distance / 4));
  const sx = dx / length * distance / steps, sy = dy / length * distance / steps;
  let moved = false;
  for (let i = 0; i < steps; i++) {
    const nx = e.x + sx, ny = e.y + sy;
    if (!enemyBlocked(nx, ny)) { e.x = nx; e.y = ny; moved = true; continue; }
    if (!enemyBlocked(nx, e.y)) { e.x = nx; moved = true; continue; }
    if (!enemyBlocked(e.x, ny)) { e.y = ny; moved = true; continue; }
    break;
  }
  if (moved) {
    if (resetRoute) resetEnemyNavigation(e);
    else { e.hasTarget = false; e.baseTarget = null; }
  }
  return moved;
}
function moveEnemyToward(e, target, dt) {
  const dx = target.x - e.x, dy = target.y - e.y, d = Math.hypot(dx, dy) || 1;
  const step = e.speed * dt;
  return displaceEnemy(e, dx, dy, Math.min(step, d), false);
}

// ---- 異質體行為：18 格感知、尋路與黑暗遊蕩 ----
const ENEMY_SENSE_RANGE = 18 * CELL;
const ENEMY_NEIGHBORS = [[0, -1], [-1, 0], [1, 0], [0, 1]];
function enemyObstacleDistance(e, o) {
  let best = Infinity;
  for (const [dc, dr] of obstacleSolidCells(o)) {
    const [x, y] = center(o.c + dc, o.r + dr);
    best = Math.min(best, Math.hypot(x - e.x, y - e.y));
  }
  return best;
}
function closestObstacleCell(e, o) {
  let best = [o.c, o.r], bestD = Infinity;
  for (const [dc, dr] of obstacleSolidCells(o)) {
    const c = o.c + dc, r = o.r + dr, [x, y] = center(c, r);
    const d = Math.hypot(x - e.x, y - e.y);
    if (d < bestD) { best = [c, r]; bestD = d; }
  }
  return best;
}
function buildEnemyRoute(e, goalC, goalR, canBreakBuildings) {
  const [startC, startR] = cellAt(e.x, e.y);
  if (!inGrid(goalC, goalR) || isWall(goalC, goalR)) return null;
  const startKey = startC + ',' + startR, goalKey = goalC + ',' + goalR;
  const queue = [[startC, startR]], cameFrom = new Map([[startKey, null]]);
  for (let qi = 0; qi < queue.length; qi++) {
    const [c, r] = queue[qi];
    if (c === goalC && r === goalR) break;
    for (const [dc, dr] of ENEMY_NEIGHBORS) {
      const nc = c + dc, nr = r + dr, key = nc + ',' + nr;
      if (!inGrid(nc, nr) || isWall(nc, nr) || cameFrom.has(key)) continue;
      if (barrierAt(nc, nr) && !canBreakBuildings) continue;
      cameFrom.set(key, [c, r]); queue.push([nc, nr]);
    }
  }
  if (!cameFrom.has(goalKey)) return null;
  const path = [];
  for (let cur = [goalC, goalR]; cur && (cur[0] !== startC || cur[1] !== startR); ) {
    path.push(cur); cur = cameFrom.get(cur[0] + ',' + cur[1]);
  }
  path.reverse();
  return path;
}
function enemyNavigate(e, goalC, goalR, moveDt, routeKey, canBreakBuildings) {
  e.aiRouteTimer = (e.aiRouteTimer || 0) - moveDt;
  const goal = goalC + ',' + goalR;
  if (e.aiRouteKey !== routeKey || e.aiGoal !== goal || e.aiRouteTimer <= 0 || !e.aiPath || !e.aiPath.length) {
    e.aiPath = buildEnemyRoute(e, goalC, goalR, canBreakBuildings);
    e.aiRouteKey = routeKey; e.aiGoal = goal; e.aiRouteTimer = .65 + Math.random() * .35;
  }
  if (!e.aiPath || !e.aiPath.length) return { reached: true };
  const [nc, nr] = e.aiPath[0], blocker = barrierAt(nc, nr);
  if (blocker) return { blocker };
  const [tx, ty] = center(nc, nr), d = Math.hypot(tx - e.x, ty - e.y);
  if (d <= Math.max(2, e.speed * moveDt)) {
    e.x = tx; e.y = ty; e.aiPath.shift();
    return { reached: !e.aiPath.length };
  }
  moveEnemyToward(e, { x: tx, y: ty }, moveDt);
  return {};
}
function chooseDarkWanderCell(e) {
  const [ec, er] = cellAt(e.x, e.y), choices = [];
  for (let r = Math.max(0, er - 7); r <= Math.min(ROWS - 1, er + 7); r++) {
    for (let c = Math.max(0, ec - 7); c <= Math.min(COLS - 1, ec + 7); c++) {
      const distance = Math.abs(c - ec) + Math.abs(r - er);
      if (distance < 2 || distance > 9 || isWall(c, r) || barrierAt(c, r) || cellLit(c, r)) continue;
      choices.push([c, r]);
    }
  }
  if (!choices.length) return null;
  return choices[Math.floor(Math.random() * choices.length)];
}
function updateEnemyEffects(e, dt) {
  if (e.hitT > 0) e.hitT -= dt;
  if (e.playerAggroT > 0) e.playerAggroT -= dt;   // 玩家射擊造成的仇恨計時
  if (e.alertT > 0) e.alertT -= dt;                 // 頭上「！」的顯示計時
  if (e.sentryAggroT > 0) e.sentryAggroT -= dt;     // 被哨兵打中造成的仇恨計時
  e.playerTouchCd = Math.max(0, (e.playerTouchCd || 0) - dt);
  e.playerPounceCd = Math.max(0, (e.playerPounceCd || 0) - dt);
  e.playerPounceT = Math.max(0, (e.playerPounceT || 0) - dt);
  if (e.burnT > 0) {
    e.burnT -= dt; e.burnTick = (e.burnTick || 0) - dt;
    if (e.burnTick <= 0) { e.burnTick += 1; e.hp -= e.burnDmg || 5; flashDmg('-' + (e.burnDmg || 5), e.x + 12, e.y - 18, '#ff8a42', { small: true }); }   // 燒傷：小字、不搶眼
  }
  if (e.stunT > 0) e.stunT -= dt;
  if (e.confuseT > 0) e.confuseT -= dt;
}

// 與《苦艾與甘露》一致：完整週期約 1.83 秒，前 62% 騰空移動，落地後壓扁並停住。
const SLIME_JUMP = { total: 1.83, airRatio: .62, height: 14 };
// 撲擊：蓄力（地上出現落點警示）→ 高高拋物線飛撲 → 重重落地（震動＋衝擊波，落點附近的玩家受傷）
// windup 蓄力秒數、lunge 飛行秒數、range 觸發距離、maxLeap 最遠撲擊距離、height 飛撲高度、hitRadius 落地傷害半徑
const SLIME_POUNCE = { windup: .95, lunge: .7, range: CELL * 3, maxLeap: CELL * 3.2, height: 46, hitRadius: 38, cooldown: 3.2 };
function updateSlimePounce(e, dt) {
  e.playerPounceT = Math.max(0, e.playerPounceT - dt);
  const p = 1 - e.playerPounceT / SLIME_POUNCE.lunge;
  const goal = e.playerPounceGoal, start = e.playerPounceStart;
  // 沿直線逐小步移動（撞牆或建築就停在牆前），高度用拋物線
  const tx = start.x + (goal.x - start.x) * p, ty = start.y + (goal.y - start.y) * p;
  displaceEnemy(e, tx - e.x, ty - e.y, Math.hypot(tx - e.x, ty - e.y), true);
  e.slimeLift = 4 * SLIME_POUNCE.height * p * (1 - p);
  e.slimeScaleX = .8; e.slimeScaleY = 1.28;   // 空中拉長
  if (e.playerPounceT > 0) return;
  // 落地：大幅壓扁、震動、衝擊波；之後停在原地喘一下（玩家的反擊時機）
  e.slimeLift = 0; e.slimeScaleX = 1.4; e.slimeScaleY = .6;
  e.slimeClock = SLIME_JUMP.total * SLIME_JUMP.airRatio;
  e.playerPounceGoal = null;
  G.effects.push({ ring: true, x: e.x, y: e.y + 10, r: 8, r2: SLIME_POUNCE.hitRadius + 14, life: .32, life0: .32, color: '#ff8665' });
  G.effects.push({ ring: true, x: e.x, y: e.y + 10, r: 4, r2: SLIME_POUNCE.hitRadius, life: .22, life0: .22, color: '#ffe0c8' });
  for (let i = 0; i < 10; i++) {
    const a = Math.PI * 2 * i / 10 + Math.random() * .4, sp = 60 + Math.random() * 70;
    G.effects.push({ particle: true, kind: 'spark', x: e.x, y: e.y + 10, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * .45,
      r: 2 + Math.random() * 2, life: .35, life0: .35, color: '#9fe7ef' });
  }
  playSlimeAudio('land', e);
  const playerD = G.player ? Math.hypot(G.player.x - e.x, G.player.y - e.y) : Infinity;
  const hitRadius = SLIME_POUNCE.hitRadius * (e.sizeMul || 1);
  if (playerD <= hitRadius) addShake(9);          // 被撲中：重震
  else nearbyImpact(e.x, e.y, 3, 0);              // 沒撲中：附近才輕震
  if (G.player && G.player.hp > 0 && playerD <= hitRadius) {
    e.playerTouchCd = 0;
    enemyAttackPlayer(e, dt);
    addHitstop(.06);
  }
  for (const t of G.towers) {   // 落點附近的哨兵、嚮導也會被撲中
    if (t.hp <= 0 || Math.hypot(t.x - e.x, t.y - e.y) > hitRadius + 6 || !enemyNoticesSentry(e, t)) continue;   // 撲擊落地也不會順便打到沒惹牠的阿瓦倫
    e.atkCd = 0;   // 撲擊落地不受普通攻擊冷卻限制（每位被撲中的人各算一次）
    enemyAttackSentry(e, t, dt);
  }
}
function slimeLerp(a, b, p) { return a + (b - a) * Math.max(0, Math.min(1, p)); }
function updateSlimeJump(e, dt) {
  if (e.slimeClock == null) e.slimeClock = Math.random() * SLIME_JUMP.total;
  const previous = e.slimeClock / SLIME_JUMP.total;
  e.slimeClock = (e.slimeClock + dt) % SLIME_JUMP.total;
  const phase = e.slimeClock / SLIME_JUMP.total;
  if (previous < SLIME_JUMP.airRatio && phase >= SLIME_JUMP.airRatio) {
    playSlimeAudio('land', e);
    if (e.variant === 'giant') onGiantLand(e);
  }
  if (phase < .35) {
    const p = phase / .35;
    e.slimeLift = slimeLerp(0, 14, p); e.slimeScaleX = slimeLerp(1, .96, p); e.slimeScaleY = slimeLerp(1, 1.07, p);
  } else if (phase < .62) {
    const p = (phase - .35) / .27;
    e.slimeLift = slimeLerp(14, 0, p); e.slimeScaleX = slimeLerp(.96, 1.08, p); e.slimeScaleY = slimeLerp(1.07, .88, p);
  } else if (phase < .78) {
    const p = (phase - .62) / .16;
    e.slimeLift = slimeLerp(0, 1, p); e.slimeScaleX = slimeLerp(1.08, .98, p); e.slimeScaleY = slimeLerp(.88, 1.02, p);
  } else {
    const p = (phase - .78) / .22;
    e.slimeLift = slimeLerp(1, 0, p); e.slimeScaleX = slimeLerp(.98, 1, p); e.slimeScaleY = slimeLerp(1.02, 1, p);
  }
  return phase < SLIME_JUMP.airRatio ? dt / SLIME_JUMP.airRatio : 0;
}

function stepEnemy(e, dt) {
  e.attackingObstacle = null;
  updateEnemyEffects(e, dt);
  if (e.hp <= 0) return;
  if (updateEnemyFeel(e, dt)) return;   // 擊退滑行、重擊硬直、自爆引信
  if (enemyBlocked(e.x, e.y)) {
    const safeX = e.lastSafeX, safeY = e.lastSafeY;
    if (Number.isFinite(safeX) && Number.isFinite(safeY) && !enemyBlocked(safeX, safeY)) {
      e.x = safeX; e.y = safeY;
    } else if (!rescueStuck(e, enemyBlocked)) return;
    resetEnemyNavigation(e);
  }
  e.lastSafeX = e.x; e.lastSafeY = e.y;
  // 飛撲途中已經騰空，不受接觸判定或暈眩打斷，落地時才結算傷害。
  if (e.playerPounceT > 0 && e.playerPounceGoal) { updateSlimePounce(e, dt); return; }
  // 玩家碰到史萊姆本體就會受傷，與史萊姆目前鎖定誰或正在做什麼無關。
  // 每隻史萊姆各自有 1 秒碰撞冷卻；哨兵仍沿用原本的主動攻擊規則。
  if (G.player && G.player.hp > 0 && Math.hypot(G.player.x - e.x, G.player.y - e.y) <= 30) {
    enemyAttackPlayer(e, dt);
    return;
  }
  if (e.stunT > 0) { e.playerWindupT = 0; e.playerPounceT = 0; e.slimeLift = 0; e.slimeScaleX = 1.08; e.slimeScaleY = .92; return; }
  if (e.playerWindupT > 0) {
    e.playerWindupT = Math.max(0, e.playerWindupT - dt);
    const charge = 1 - e.playerWindupT / SLIME_POUNCE.windup;
    e.slimeLift = 0;
    e.slimeScaleX = 1.1 + .25 * charge;   // 越壓越扁
    e.slimeScaleY = .86 - .26 * charge;
    if (e.playerWindupT === 0) {
      e.playerPounceT = SLIME_POUNCE.lunge;
      e.playerPounceStart = { x: e.x, y: e.y };
    }
    return;
  }
  const moveDt = updateSlimeJump(e, dt);
  if (e.confuseT > 0) {
    const allies = G.enemies.filter(o => o !== e && !o.dead && o.hp > 0).sort((a,b) => Math.hypot(a.x-e.x,a.y-e.y)-Math.hypot(b.x-e.x,b.y-e.y));
    const foe = allies[0];
    if (foe) {
      const d = Math.hypot(foe.x-e.x,foe.y-e.y);
      if (d > 22) moveEnemyToward(e, foe, moveDt);
      else { e.confuseCd=(e.confuseCd||0)-dt; if(e.confuseCd<=0){e.confuseCd=.8;foe.hp-=10;flash('混亂攻擊',foe.x,foe.y-24,'#c791ff');} }
    }
    return;
  }
  const playerDistance = G.player && G.player.hp > 0 ? Math.hypot(G.player.x - e.x, G.player.y - e.y) : Infinity;
  // 玩家進入撲擊距離（3 格內）時，比探照燈更優先——否則燈附近的史萊姆永遠不會撲向玩家。
  if (playerDistance <= SLIME_POUNCE.range && enemyPursuePlayer(e, playerDistance, moveDt, dt)) return;
  const living = G.towers.filter(t => t.hp > 0 && !t.berserk && enemyNoticesSentry(e, t));   // 沒打過牠的阿瓦倫不算目標
  const sensedSentries = living
    .map(t => ({ t, d: Math.hypot(t.x - e.x, t.y - e.y) }))
    .filter(item => item.d <= ENEMY_SENSE_RANGE)
    .sort((a, b) => a.d - b.d);
  // 具有嘲諷能力的哨兵若在嘲諷範圍內，會把怪物的注意力拉到自己身上。
  const taunter = sensedSentries.find(item => {
    const taunt = TYPES[item.t.type].taunt || 0;
    return taunt && item.d <= taunt * CELL;
  });
  // 被溫特開槍打中（仇恨中）：優先追溫特，連探照燈都先不管（嘲諷中的哨兵仍可搶走注意力）。
  const playerAggro = !taunter && (e.playerAggroT || 0) > 0 && playerDistance <= ENEMY_SENSE_RANGE;
  if (playerAggro && enemyPursuePlayer(e, playerDistance, moveDt, dt)) return;
  // 被哨兵打中（仇恨中）：改追那位攻擊者，探照燈先不管。
  const attacker = !taunter && e.sentryAggroT > 0 ? e.sentryAggro : null;
  if (attacker && attacker.hp > 0 && !attacker.berserk && G.towers.includes(attacker)) {
    const d = Math.hypot(attacker.x - e.x, attacker.y - e.y);
    if (d <= ENEMY_SENSE_RANGE) { enemyChaseSentry(e, attacker, d, moveDt, dt); return; }
  }
  // 發光建築是異質體的最高優先目標：先破壞探照燈，讓周圍重新陷入黑暗。
  const lightChoice = G.obstacles
    .filter(o => o.hp > 0 && o.type && LIGHT.buildings && LIGHT.buildings[o.type])
    .map(o => ({ o, d: enemyObstacleDistance(e, o) }))
    .filter(item => item.d <= ENEMY_SENSE_RANGE)
    .sort((a, b) => a.d - b.d)[0];
  if (lightChoice) {
    const [gc, gr] = closestObstacleCell(e, lightChoice.o);
    const nav = enemyNavigate(e, gc, gr, moveDt, 'light:' + gc + ',' + gr, true);
    if (nav.blocker) enemyAttackObstacle(e, nav.blocker, dt);
    return;
  }
  // 哨兵是第一優先；具有嘲諷能力者若在嘲諷範圍內，會覆蓋最近目標。
  let sentryChoice = sensedSentries[0] || null;
  if (taunter) sentryChoice = taunter;
  // 玩家貼近怪物時一定會引起攻擊；距離明顯比哨兵近時也會成為目標。
  // 嘲諷中的哨兵仍能把遠處怪物的注意力拉回自己身上。
  const playerIsImmediate = playerDistance <= CELL * 2.25;
  const playerIsMuchCloser = !taunter && playerDistance <= ENEMY_SENSE_RANGE &&
    (!sentryChoice || playerDistance + CELL * 1.5 < sentryChoice.d);
  if ((playerIsImmediate || playerIsMuchCloser) && enemyPursuePlayer(e, playerDistance, moveDt, dt)) return;
  if (sentryChoice) {
    enemyChaseSentry(e, sentryChoice.t, sentryChoice.d, moveDt, dt);
    return;
  }

  // 沒有哨兵攔截時，異質體會主動追擊 18 格內的玩家。
  if (enemyPursuePlayer(e, playerDistance, moveDt, dt)) return;

  // 沒有哨兵時，才搜尋 18 格內由玩家建造的設施。
  const buildingChoice = G.obstacles
    .filter(o => o.playerBuilt && o.hp > 0 && !o.trap)   // 地雷埋在地上，怪物不知道
    .map(o => ({ o, d: enemyObstacleDistance(e, o) }))
    .filter(item => item.d <= ENEMY_SENSE_RANGE)
    .sort((a, b) => a.d - b.d)[0];
  if (buildingChoice) {
    const [gc, gr] = closestObstacleCell(e, buildingChoice.o);
    const nav = enemyNavigate(e, gc, gr, moveDt, 'building:' + gc + ',' + gr, true);
    if (nav.blocker) enemyAttackObstacle(e, nav.blocker, dt);
    return;
  }

  // 沒有感知到目標時不再直衝營地，而是在附近黑暗處走走停停。
  e.wanderWait = Math.max(0, (e.wanderWait || 0) - dt);
  if (!e.wanderCell && e.wanderWait <= 0) e.wanderCell = chooseDarkWanderCell(e);
  if (e.wanderCell) {
    const [wc, wr] = e.wanderCell;
    const nav = enemyNavigate(e, wc, wr, moveDt, 'wander:' + wc + ',' + wr, false);
    if (nav.reached) {
      e.wanderCell = null; e.aiPath = null;
      e.wanderWait = .35 + Math.random() * 1.35;
    }
  } else if (e.wanderWait <= 0) {
    e.wanderWait = .5 + Math.random();
  }
}
