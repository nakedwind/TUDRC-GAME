/* 花蓮版權老鼠：鑽地瞬移、5×5 格伸手、離開後原地洞保留五秒。素材沿用 110×90 原稿。
   怪物編輯器也載入本檔，使用同一份素材與動作選圖預覽。所有計時用遊戲 dt，可暫停／保留戰場。 */
const BURROW_MOUSE_ART = {
  normal: 'images/monster/burrowing-mouse/mouse-hole-open.png',
  half: 'images/monster/burrowing-mouse/mouse-hole-half.png',
  closed: 'images/monster/burrowing-mouse/mouse-hole-closed.png',
  emerge: 'images/monster/burrowing-mouse/mouse-emerge.png',
  hole: 'images/monster/burrowing-mouse/hole.png',
  crack: 'images/monster/burrowing-mouse/hole-appear.png',
  leftHole: 'images/monster/burrowing-mouse/left-hole.png',
  rightHole: 'images/monster/burrowing-mouse/right-hole.png',
  leftRise: 'images/monster/burrowing-mouse/left-hand-rise.png',
  rightRise: 'images/monster/burrowing-mouse/right-hand-rise.png',
  leftHand: 'images/monster/burrowing-mouse/left-hand-hole.png',
  rightHand: 'images/monster/burrowing-mouse/right-hand-hole.png',
};
function burrowingMouseDefinition(id = 'burrowing_mouse') {
  return { id, name: '花蓮版權老鼠', sprite: BURROW_MOUSE_ART.normal,
    hp: 180, speed: 65, playerDamage: 14, sentryDamage: 18, buildingDamage: 35,
    reward: 45, crystals: 5, width: 110, height: 90,
    behavior: 'burrow', burrow: validBurrowCfg(), art: { ...BURROW_MOUSE_ART },
    frames: { front: BURROW_MOUSE_ART.normal, walkFront: [BURROW_MOUSE_ART.normal] },
    noHitSquash: true, knockMul: 0 };
}
function burrowMouseArt(e) { return { ...BURROW_MOUSE_ART, ...(e.art || {}) }; }
function burrowMouseBodyFrame(art, phase, age, duration) {
  if (phase === 'travel') return art.hole;
  if (phase === 'emerge' || phase === 'sink') {
    let k = Math.max(0, Math.min(1, age / Math.max(.01, duration)));
    if (phase === 'sink') k = 1 - k;
    return k < .25 ? (phase === 'emerge' ? art.crack : art.hole) : k < .68 ? art.emerge : art.normal;
  }
  const blink = age % 3.7;
  return blink < .1 || (blink >= .22 && blink < .32) ? art.half : blink < .22 ? art.closed : art.normal;
}
function burrowMouseHandFrame(art, side, age, cfg) {
  const key = side === 'left' ? 'left' : 'right', t = age - cfg.windup;
  return t < 0 ? art[key + 'Hole'] : t < cfg.handRise ? art[key + 'Rise']
    : t < cfg.handRise + cfg.handHold ? art[key + 'Hand'] : art[key + 'Rise'];
}
function burrowMouseTargets(e, range) {
  const candidates = e.confuseT > 0
    ? G.enemies.filter(o => o !== e && !o.dead && o.hp > 0)
    : [G.player, ...G.towers.filter(t => !t.berserk && !t.eatenBy && enemyNoticesSentry(e, t))];
  return candidates.filter(t => t && t.hp > 0 && Math.hypot(t.x - e.x, t.y - e.y) <= range * CELL
    && hasLineOfSight(e.x, e.y, t.x, t.y)).sort((a, b) => {
      const taunt = t => !e.confuseT && G.towers.includes(t) && (TYPES[t.type]?.taunt || 0) * CELL >= Math.hypot(t.x - e.x, t.y - e.y) ? 1 : 0;
      return taunt(b) - taunt(a) || Math.hypot(a.x - e.x, a.y - e.y) - Math.hypot(b.x - e.x, b.y - e.y);
    });
}
// 5×5 格以本體所在格為中心，向四方各延伸兩格，含斜角。
function burrowMouseInReach(e, p) {
  const [ec, er] = cellAt(e.x, e.y), [pc, pr] = cellAt(p.x, p.y);
  return Math.abs(pc - ec) <= 2 && Math.abs(pr - er) <= 2;
}
function burrowMouseLeaveHole(e, delay = 0) {
  (G.burrowHoles || (G.burrowHoles = [])).push({
    x: e.x, y: e.y, w: e.drawWidth || 110, h: e.drawHeight || 90,
    image: burrowMouseArt(e).hole, age: 0, lifetime: 5 + delay,
  });
}
function burrowMouseTeleport(e, target) {
  if (!target) return false;
  const [tc, tr] = cellAt(target.x, target.y), [ec, er] = cellAt(e.x, e.y);
  const floor = typeof mapFloorCells === 'function' ? mapFloorCells() : null, spots = [];
  for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
    const c = tc + dc, r = tr + dr, x = OX + (c + .5) * CELL, y = OY + (r + .5) * CELL;
    if ((!dc && !dr) || (c === ec && r === er) || (floor && !floor.has(c + ',' + r))) continue;
    if (enemyBlocked(x, y) || !hasLineOfSight(x, y, target.x, target.y)) continue;
    if (G.towers.some(t => t.hp > 0 && cellAt(t.x, t.y)[0] === c && cellAt(t.x, t.y)[1] === r)
      || G.enemies.some(o => o !== e && !o.dead && o.hp > 0 && cellAt(o.x, o.y)[0] === c && cellAt(o.x, o.y)[1] === r)) continue;
    spots.push({ x, y });
  }
  spots.sort((a, b) => Math.hypot(a.x - e.x, a.y - e.y) - Math.hypot(b.x - e.x, b.y - e.y));
  if (!spots.length) return false;
  e.x = spots[0].x; e.y = spots[0].y;
  e.lastSafeX = e.x; e.lastSafeY = e.y;
  resetEnemyNavigation(e);
  return true;
}
function stepBurrowingMouse(e, dt) {
  const c = validBurrowCfg(e.burrowCfg), art = burrowMouseArt(e);
  const b = e.bm || (e.bm = { phase: 'emerge', age: 0, cd: c.cooldown, attacked: false, hands: [] });
  b.hands = b.hands || [];
  // 不做地下逐格移動；入土完成時一次換位置，出土與入土期間仍可受傷。
  e.slimeLift = 0; e.slimeScaleX = 1; e.slimeScaleY = 1;
  if (e.stunT > 0 || e.sleepT > 0) { b.hands = []; return; }
  b.age += dt; b.cd = Math.max(0, b.cd - dt);
  for (const h of b.hands) {
    h.age += dt;
    if (!h.hit && h.age >= c.windup + c.handRise) { h.hit = true; burrowMouseStrike(e, h, c); }
  }
  b.hands = b.hands.filter(h => h.age < c.windup + c.handRise + c.handHold + .22);
  const guard = typeof frenzyCoreGoal === 'function' ? frenzyCoreGoal(e) : null;
  const target = burrowMouseTargets(e, c.noticeRange)[0] || guard;
  if (b.phase === 'emerge' && b.age >= c.emergeTime) { b.phase = 'idle'; b.age = 0; }
  else if ((b.phase === 'sink' && b.age >= c.emergeTime) || b.phase === 'travel') {
    // travel 僅供舊戰場存檔相容。洞記錄舊座標，絕不跟著本體移動。
    burrowMouseLeaveHole(e);
    burrowMouseTeleport(e, target);
    b.phase = 'emerge'; b.age = 0; b.attacked = false;
  } else if (b.phase === 'idle') {
    if (!b.hands.length && (b.attacked || (target && !burrowMouseInReach(e, target)))) { b.phase = 'sink'; b.age = 0; }
    else if (b.cd <= 0 && !b.hands.length) {
      const aim = target && target !== guard && burrowMouseInReach(e, target) ? target : null;
      if (aim) {
        const p = aim;
        const [cc, rr] = cellAt(p.x, p.y);
        const floor = typeof mapFloorCells !== 'function' || mapFloorCells().has(cc + ',' + rr);
        if (floor && !isWall(cc, rr) && hasLineOfSight(e.x, e.y, p.x, p.y)) {
          b.hands.push({ x: p.x, y: p.y, side: p.x < e.x ? 'left' : 'right', age: 0, hit: false, confused: e.confuseT > 0 });
          b.attacked = true; b.cd = c.cooldown;
        }
      }
    }
  }
  e.forceFrame = burrowMouseBodyFrame(art, b.phase, b.age, c.emergeTime); e.forceFlip = false;
}
function burrowMouseStrike(e, hand, c) {
  if (e.dead || e.hp <= 0 || !burrowMouseInReach(e, hand) || (!hand.obstacle && !hasLineOfSight(e.x, e.y, hand.x, hand.y))) return;
  const within = t => t && t.hp > 0 && burrowMouseInReach(e, t) && Math.hypot(t.x - hand.x, t.y - hand.y) <= c.hitRadius * CELL
    && hasLineOfSight(hand.x, hand.y, t.x, t.y);
  if (hand.confused) {
    for (const other of G.enemies) if (other !== e && !other.dead && within(other)) {
      other.hp -= e.sentryDamage; enemyHitReact(other, hand.x, hand.y, false);
    }
  } else {
    if (within(G.player)) { e.playerTouchCd = 0; enemyAttackPlayer(e, 0); }
    for (const t of G.towers) if (!t.eatenBy && enemyNoticesSentry(e, t) && within(t)) { e.atkCd = 0; enemyAttackSentry(e, t, 0); }
    if (hand.obstacle && hand.obstacle.hp > 0 && G.obstacles.includes(hand.obstacle)) { e.atkCd = 0; enemyAttackObstacle(e, hand.obstacle, 0); }
  }
  if (typeof sfxAt === 'function') sfxAt('knock2', hand.x, hand.y, .4, 'burrow-hand');
}
function drawBurrowFrame(context, image, x, y, width = 110, height = 90, alpha = 1) {
  if (!image?.complete || !image.naturalWidth) return;
  context.save(); context.globalAlpha *= alpha; context.imageSmoothingEnabled = false;
  context.drawImage(image, Math.round(x - width / 2), Math.round(y + 13 - height), width, height); context.restore();
}
function drawBurrowWarning(context, h, c) {
  if (h.age >= c.windup + c.handRise) return;
  const k = Math.min(1, h.age / Math.max(.01, c.windup)), r = c.hitRadius * (typeof CELL === 'number' ? CELL : 40);
  context.save(); context.strokeStyle = '#ff986c'; context.fillStyle = '#e96b4a'; context.lineWidth = 2;
  context.globalAlpha *= .18 + .12 * k; context.beginPath(); context.ellipse(h.x, h.y + 3, r, r * .48, 0, 0, Math.PI * 2); context.fill();
  context.globalAlpha = .8; context.beginPath(); context.ellipse(h.x, h.y + 3, r * (1.5 - k * .5), r * .48 * (1.5 - k * .5), 0, 0, Math.PI * 2); context.stroke(); context.restore();
}
function drawBurrowingMouseGround(context) {
  for (const h of G.burrowHoles || []) if (isLit(h.x, h.y)) drawBurrowFrame(context, monsterImage(h.image), h.x, h.y, h.w, h.h);
  for (const e of G.enemies) if (e.behavior === 'burrow' && !e.dead) {
    const c = validBurrowCfg(e.burrowCfg);
    for (const h of e.bm?.hands || []) if (isLit(h.x, h.y)) drawBurrowWarning(context, h, c);
  }
}
function burrowingMouseSortables(list) {
  for (const e of G.enemies) if (e.behavior === 'burrow' && !e.dead) {
    const c = validBurrowCfg(e.burrowCfg), art = burrowMouseArt(e);
    for (const h of e.bm?.hands || []) if (isLit(h.x, h.y)) list.push({ y: h.y + 13, draw: () => {
      drawBurrowFrame(ctx, monsterImage(burrowMouseHandFrame(art, h.side, h.age, c)), h.x, h.y);
    } });
  }
  for (const d of G.burrowDeaths || []) if (isLit(d.x, d.y)) list.push({ y: d.y + 13, draw: () => {
    drawBurrowFrame(ctx, monsterImage(burrowMouseBodyFrame(d.art, 'sink', d.age, .8)), d.x, d.y, d.w, d.h, Math.min(1, (1.1 - d.age) / .3));
  } });
}
function burrowingMouseDeath(e) {
  if (e.bm) e.bm.hands = [];
  // 死亡收回動畫結束後，洞口仍完整保留五秒。
  burrowMouseLeaveHole(e, 1.1);
  (G.burrowDeaths || (G.burrowDeaths = [])).push({ x: e.x, y: e.y, w: e.drawWidth || 110, h: e.drawHeight || 90, art: burrowMouseArt(e), age: 0 });
}
function updateBurrowingMouseFx(dt) {
  if (G.burrowHoles) G.burrowHoles = G.burrowHoles.filter(h => (h.age += dt) < h.lifetime);
  if (G.burrowDeaths) G.burrowDeaths = G.burrowDeaths.filter(d => (d.age += dt) < 1.1);
}
