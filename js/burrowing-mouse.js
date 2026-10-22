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
  body: 'images/monster/burrowing-mouse/mouse-open.png',
  bodyHalf: 'images/monster/burrowing-mouse/mouse-half.png',
  bodyClosed: 'images/monster/burrowing-mouse/mouse-closed.png',
  leftLimb: 'images/monster/burrowing-mouse/left-hand.png',
  rightLimb: 'images/monster/burrowing-mouse/right-hand.png',
};
// 暫時的地圖實測開關，與小丑魚測試生怪同樣獨立於核心隨機生成。
// 測完改 enabled:false；只對 monsterMix 包含老鼠的戰鬥地圖生效。
const BURROW_MOUSE_TEST = { enabled: true, delay: 1, minDistance: 120, maxDistance: 480 };
// 世界座標落點：地圖仍提供碰撞／地板資訊，但位置不吸附格線。
function burrowMouseCanStand(x, y, actor = null) {
  const floor = typeof mapFloorCells === 'function' ? mapFloorCells() : null;
  for (const [dx, dy] of [[0, 0], [-28, -8], [28, -8], [-28, 8], [28, 8]]) {
    const px = x + dx, py = y + dy, [c, r] = cellAt(px, py);
    if ((typeof inGrid === 'function' && !inGrid(c, r)) || (floor && !floor.has(c + ',' + r))) return false;
    if (enemyBlocked(px, py, actor) || (typeof solidBlocksPoint === 'function' && solidBlocksPoint(px, py))) return false;
  }
  const occupied = o => o !== actor && !o.dead && o.hp > 0 && Math.abs(o.x - x) < 44 && Math.abs(o.y - y) < 20;
  return !(G.towers || []).some(occupied) && !(G.enemies || []).some(occupied)
    && !(G.player && G.player !== actor && Math.abs(G.player.x - x) < 28 && Math.abs(G.player.y - y) < 20);
}
function burrowMousePolarSpots(anchor, radii, actor = null) {
  const spots = [];
  for (const radius of radii) for (let i = 0; i < 40; i++) {
    const angle = (i + .37) / 40 * Math.PI * 2;
    const x = anchor.x + Math.cos(angle) * radius, y = anchor.y + Math.sin(angle) * radius;
    if (burrowMouseCanStand(x, y, actor)) spots.push({ x, y });
    if (!radius) break;
  }
  return spots;
}
function burrowMouseSpawnPosition(x, y) {
  return burrowMousePolarSpots({ x, y }, [13, 23, 7, 0])[0] || null;
}
function updateBurrowMouseTestSpawn(dt, entering = false) {
  if (dt <= 0 || !BURROW_MOUSE_TEST.enabled || !G || !G.running || G.over || MAP_SAFE || !G.player || G.player.hp <= 0
    || (typeof MONSTER_PREVIEW_ID !== 'undefined' && MONSTER_PREVIEW_ID)) return;
  if (!MAP?.monsterMix?.some(m => m.id === 'burrowing_mouse' && Number(m.weight) > 0)) return;
  const spec = ACTIVE_MONSTERS.find(m => m.id === 'burrowing_mouse');
  if (!spec) return;
  if (entering && !G.enemies.some(e => e.type === spec.id && !e.dead && e.hp > 0)) {
    G.burrowMouseTestSpawnDone = false; G.burrowMouseTestSpawnT = 0;
  }
  if (G.burrowMouseTestSpawnDone) return;
  G.burrowMouseTestSpawnT = (G.burrowMouseTestSpawnT || 0) + dt;
  if (G.burrowMouseTestSpawnT < BURROW_MOUSE_TEST.delay) return;
  G.burrowMouseTestSpawnT = BURROW_MOUSE_TEST.delay - .5; // 沒找到空地時繼續重試，不先標記完成。
  const p = G.player, visible = (x, y) => isLit(x, y) && (typeof cam === 'undefined' || typeof viewW !== 'function'
    || (x >= cam.x + CELL * 2 && x <= cam.x + viewW() - CELL * 2 && y >= cam.y + CELL * 3 && y <= cam.y + viewH() - CELL));
  if (G.enemies.some(e => e.type === spec.id && !e.dead && e.hp > 0 && visible(e.x, e.y))) {
    G.burrowMouseTestSpawnDone = true;
    if (typeof systemNotice === 'function') systemNotice('版權老鼠已在附近，可直接開始測試。');
    return;
  }
  const radii = [];
  for (let radius = BURROW_MOUSE_TEST.minDistance; radius <= BURROW_MOUSE_TEST.maxDistance; radius += 18) radii.push(radius);
  const spots = burrowMousePolarSpots(p, radii).filter(({x, y}) => visible(x, y)
    && !(typeof insideWarningLine === 'function' && insideWarningLine(x, y)));
  for (const spot of spots) {
      const { x, y } = spot, distance = Math.hypot(x - p.x, y - p.y);
      if (G.towers.some(t => t.hp > 0 && Math.hypot(t.x - x, t.y - y) < CELL * 1.5)
        || G.enemies.some(e => !e.dead && e.hp > 0 && Math.hypot(e.x - x, e.y - y) < CELL * 1.5)) { spot.score = Infinity; continue; }
      // 優先營地前方的空地，避免生在營地後方被營地圖／基地血條遮住。
      spot.score = distance + (y < p.y + 40 ? BURROW_MOUSE_TEST.maxDistance * 2 : 0);
  }
  spots.sort((a, b) => a.score - b.score);
  if (!spots.length || !Number.isFinite(spots[0].score)) {
    if (!G.burrowMouseTestSpawnHint && typeof systemNotice === 'function') {
      systemNotice('老鼠測試：請走出營地到附近亮處，老鼠會在空地出現。'); G.burrowMouseTestSpawnHint = true;
    }
    return;
  }
  G.enemies.push(createMonster(spec, spots[0].x, spots[0].y));
  G.burrowMouseTestSpawnDone = true;
  if (typeof systemNotice === 'function') systemNotice('版權老鼠已在你附近出現，可直接開始測試。');
}
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
// 保留 5×5 的大小（200×200 像素），但改成以實際座標為中心，不因跨格而跳動。
function burrowMouseInReach(e, p) {
  return Math.abs(p.x - e.x) <= CELL * 2.5 && Math.abs(p.y - e.y) <= CELL * 2.5;
}
// 洞口以世界座標橢圓阻擋；格子查詢只供建造與其他怪物的格網尋路使用。
function* burrowMouseHoleShapes(actor = null) {
  if (typeof G === 'undefined' || !G) return;
  for (const h of G.burrowHoles || []) if ((h.age || 0) < (h.lifetime ?? 5)) {
    const shape = { x: h.x, y: h.y - 3 * (h.h || 90) / 90, rx: 40 * (h.w || 110) / 110, ry: 7 * (h.h || 90) / 90 };
    if (actor?.behavior === 'burrow' && Math.abs(actor.x - h.x) < 1 && Math.abs(actor.y - h.y) < 1) continue;
    yield shape;
  }
  for (const e of G.enemies || []) if (e.behavior === 'burrow' && !e.dead && e.hp > 0) {
    if (e !== actor) yield { x: e.x, y: e.y - 3 * (e.drawHeight || 90) / 90, rx: 40 * (e.drawWidth || 110) / 110, ry: 7 * (e.drawHeight || 90) / 90 };
    for (const h of e.bm?.hands || []) if (e !== actor) yield { x: h.x + (h.side === 'left' ? 7 : -7), y: h.y, rx: 17, ry: 5 };
  }
}
function burrowMouseBlocksRect(x, y, w, h, actor = null) {
  for (const s of burrowMouseHoleShapes(actor)) {
    const dx = (s.x - Math.max(x, Math.min(s.x, x + w))) / s.rx;
    const dy = (s.y - Math.max(y, Math.min(s.y, y + h))) / s.ry;
    if (dx * dx + dy * dy <= 1) return true;
  }
  return false;
}
function burrowMouseBlocksPoint(x, y, actor = null) { return burrowMouseBlocksRect(x, y, 0, 0, actor); }
function burrowMouseBlocksActor(x, y, radius) { return burrowMouseBlocksRect(x - radius, y - radius, radius * 2, radius * 2); }
function burrowMouseHoleAt(c, r, actor = null) { return burrowMouseBlocksRect(OX + c * CELL, OY + r * CELL, CELL, CELL, actor); }
function burrowMouseBlocksBuild(v, c, r) { return burrowMouseBlocksRect(OX + c * CELL, OY + r * CELL, (v.w || 1) * CELL, (v.h || 1) * CELL); }
function burrowMouseLeaveHole(e, delay = 0) {
  (G.burrowHoles || (G.burrowHoles = [])).push({
    x: e.x, y: e.y, w: e.drawWidth || 110, h: e.drawHeight || 90,
    image: burrowMouseArt(e).hole, age: 0, lifetime: 5 + delay,
  });
}
function burrowMouseTeleport(e, target) {
  if (!target) return false;
  const spots = burrowMousePolarSpots(target, [64, 84, 44, 112, 32], e).filter(p =>
    Math.hypot(p.x - e.x, p.y - e.y) >= 24 && burrowMouseInReach(p, target) && hasLineOfSight(p.x, p.y, target.x, target.y));
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
const burrowClamp = n => Math.max(0, Math.min(1, n));
const burrowEase = n => { const t = burrowClamp(n); return t * t * (3 - 2 * t); };
function burrowMouseBodyPose(phase, age, duration) {
  if (phase === 'emerge') {
    const t = age / Math.max(.01, duration);
    return { reveal: burrowEase((t - .12) / .88), open: burrowEase(t * 4), crack: 1 - burrowEase(t * 4), stretch: 1 };
  }
  if (phase === 'sink' || phase === 'travel') return { reveal: phase === 'travel' ? 0 : 1 - burrowEase(age / Math.max(.01, duration)), open: 1, crack: 0, stretch: 1 };
  return { reveal: 1, open: 1, crack: 0, stretch: 1 };
}
function burrowMouseHandPose(age, cfg) {
  const t = age - cfg.windup;
  const reveal = t < 0 ? 0 : t < cfg.handRise ? burrowEase(t / cfg.handRise)
    : t < cfg.handRise + cfg.handHold ? 1 : 1 - burrowEase((t - cfg.handRise - cfg.handHold) / .22);
  return { reveal, open: t < 0 ? burrowEase(age / cfg.windup) : 1, crack: 0,
    stretch: t >= cfg.handRise && t < cfg.handRise + .15 ? 1 + .07 * Math.sin((t - cfg.handRise) / .15 * Math.PI) : 1 };
}
// 同一套 Canvas 遮罩供遊戲與編輯器使用。圖檔原封不動，不以逐幀圖硬切出土。
function drawBurrowMasked(context, getImage, art, x, y, width, height, kind, rawFile, pose, alpha = 1) {
  const sx = width / 110, sy = height / 90, top = y + 13 - height;
  const hand = kind !== 'body', left = kind === 'left', sourcePlane = hand ? 77 : 74;
  const plane = top + sourcePlane * sy, mouthX = x + (hand ? left ? 7 : -7 : 0) * sx;
  const hole = getImage(hand ? art[left ? 'leftHole' : 'rightHole'] : art.hole), raw = getImage(rawFile);
  const open = .15 + .85 * pose.open;
  context.save(); context.globalAlpha *= alpha; context.imageSmoothingEnabled = false;
  // 後緣／洞內保持原地，洞口先打開；裂地圖沿用「地洞剛出現」。
  context.save(); context.translate(mouthX, plane); context.scale(open, open); context.translate(-mouthX, -plane);
  drawBurrowFrame(context, hole, x, y, width, height, pose.open);
  context.restore();
  if (pose.crack > 0) drawBurrowFrame(context, getImage(art.crack), x, y, width, height, pose.crack);
  if (pose.reveal > 0 && raw?.complete && raw.naturalWidth) {
    context.save(); context.beginPath();
    // 地面上方 + 洞口橢圓的聯集；底下的身體永遠不露到地板上。
    context.rect(x - width, top - height, width * 2, plane - top + height);
    context.ellipse(mouthX, plane, (hand ? 16 : 39) * sx * open, (hand ? 4 : 6) * sy * open, 0, 0, Math.PI * 2);
    context.clip();
    context.translate(mouthX, plane); context.scale(1, pose.stretch); context.translate(-mouthX, -plane);
    const offset = (1 - pose.reveal) * height;
    context.drawImage(raw, x - width / 2, top + offset, width, height);
    context.restore();
  }
  // 前緣最後覆蓋，讓角色確實從洞裡出來，不是浮在洞口上。
  if (hole?.complete && hole.naturalWidth && pose.open > 0) {
    context.save(); context.globalAlpha *= pose.open;
    context.drawImage(hole, 0, sourcePlane, 110, 90 - sourcePlane,
      x - width / 2, plane, width, (90 - sourcePlane) * sy);
    context.restore();
  }
  context.restore();
}
function drawBurrowingMouseBody(context, e, getImage = monsterImage) {
  const art = burrowMouseArt(e), cfg = validBurrowCfg(e.burrowCfg || e.burrow), b = e.bm || { phase: 'emerge', age: 0 };
  const blink = b.age % 3.7;
  const raw = blink < .1 || (blink >= .22 && blink < .32) ? art.bodyHalf : blink < .22 ? art.bodyClosed : art.body;
  drawBurrowMasked(context, getImage, art, e.x, e.y, e.drawWidth || e.width || 110, e.drawHeight || e.height || 90,
    'body', raw, burrowMouseBodyPose(b.phase, b.age, cfg.emergeTime), e.burrowAlpha ?? 1);
}
function drawBurrowingMouseHand(context, h, art, cfg, getImage = monsterImage) {
  drawBurrowMasked(context, getImage, art, h.x, h.y, 110, 90, h.side, art[h.side === 'left' ? 'leftLimb' : 'rightLimb'], burrowMouseHandPose(h.age, cfg));
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
      drawBurrowingMouseHand(ctx, h, art, c);
    } });
  }
  for (const d of G.burrowDeaths || []) if (isLit(d.x, d.y)) list.push({ y: d.y + 13, draw: () => {
    drawBurrowingMouseBody(ctx, { ...d, drawWidth: d.w, drawHeight: d.h, burrowCfg: { emergeTime: .8 }, bm: { phase: 'sink', age: d.age }, burrowAlpha: Math.min(1, (1.1 - d.age) / .3) });
  } });
}
function burrowingMouseDeath(e) {
  if (e.bm) e.bm.hands = [];
  // 死亡收回動畫結束後，洞口仍完整保留五秒。
  burrowMouseLeaveHole(e, 1.1);
  (G.burrowDeaths || (G.burrowDeaths = [])).push({ x: e.x, y: e.y, w: e.drawWidth || 110, h: e.drawHeight || 90, art: burrowMouseArt(e), age: 0 });
}
function updateBurrowingMouseFx(dt) {
  updateBurrowMouseTestSpawn(dt);
  if (G.burrowHoles) G.burrowHoles = G.burrowHoles.filter(h => (h.age += dt) < h.lifetime);
  if (G.burrowDeaths) G.burrowDeaths = G.burrowDeaths.filter(d => (d.age += dt) < 1.1);
}
