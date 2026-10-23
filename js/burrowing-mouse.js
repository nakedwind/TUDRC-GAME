/* 花蓮版權老鼠：鑽地瞬移、5×5 格伸手、離開後原地洞保留五秒。素材沿用 110×90 原稿。
   怪物編輯器也載入本檔，使用同一份素材與動作選圖預覽。所有計時用遊戲 dt，可暫停／保留戰場。 */
// 身體只用不含土堆的三張眨眼圖，土堆（hole）另外疊在身體前方；右手＝左手鏡像。
const BURROW_MOUSE_ART = {
  body: 'images/monster/burrowing-mouse/mouse-open.png',
  bodyHalf: 'images/monster/burrowing-mouse/mouse-half.png',
  bodyClosed: 'images/monster/burrowing-mouse/mouse-closed.png',
  hole: 'images/monster/burrowing-mouse/hole.png',
  crack: 'images/monster/burrowing-mouse/hole-appear.png',
  deathHole: 'images/monster/burrowing-mouse/hole02.png',
  dizzy1: 'images/monster/burrowing-mouse/mouse-dizzy01.png',   // 暈眩：四張隨機換
  dizzy2: 'images/monster/burrowing-mouse/mouse-dizzy02.png',
  dizzy3: 'images/monster/burrowing-mouse/mouse-dizzy03.png',
  dizzy4: 'images/monster/burrowing-mouse/mouse-dizzy04.png',
  hand: 'images/monster/burrowing-mouse/left-hand.png',
  handHole: 'images/monster/burrowing-mouse/left-hole.png',
};
// 死後留下的大洞：不擋路，存在 60 秒，踩在上面移動速度 ×0.2。
const BURROW_DEATH_HOLE = { lifetime: 60, slow: .2, fade: 2 };
// 暫時的地圖實測開關，與小丑魚測試生怪同樣獨立於核心隨機生成。
// 測完改 enabled:false；只對 monsterMix 包含老鼠的戰鬥地圖生效。
const BURROW_MOUSE_TEST = { enabled: true, delay: 1, campDistance: 20 };
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
  const mice = [...G.enemies, ...(G.burrowLurkers || [])];
  if (entering && !mice.some(e => e.type === spec.id && !e.dead && e.hp > 0)) {
    G.burrowMouseTestSpawnDone = false; G.burrowMouseTestSpawnT = 0;
  }
  if (G.burrowMouseTestSpawnDone) return;
  G.burrowMouseTestSpawnT = (G.burrowMouseTestSpawnT || 0) + dt;
  if (G.burrowMouseTestSpawnT < BURROW_MOUSE_TEST.delay) return;
  G.burrowMouseTestSpawnT = BURROW_MOUSE_TEST.delay - .5; // 沒找到空地時繼續重試，不先標記完成。
  const p = G.player;
  // 從營地外緣算距離；沒有基地物件時沿用地圖的營地格。
  const zones = (typeof mapBases !== 'undefined' ? mapBases : []).map(stamp => {
    const tile = mapTileById(stamp.id);
    const x = OX + stamp.c * CELL + (stamp.ox || 0), y = OY + stamp.r * CELL + (stamp.oy || 0);
    return { x, y, w: mapStampW(stamp, tile) * CELL, h: mapStampH(stamp, tile) * CELL };
  });
  if (!zones.length) for (const key of campCells) {
    const [c, r] = key.split(',').map(Number);
    zones.push({ x: OX + c * CELL, y: OY + r * CELL, w: CELL, h: CELL });
  }
  if (!zones.length) zones.push({ x: OX, y: OY + (ROWS - 1) * CELL, w: COLS * CELL, h: CELL });
  const farFromCamp = (x, y) => zones.every(z => Math.hypot(Math.max(z.x - x, 0, x - z.x - z.w), Math.max(z.y - y, 0, y - z.y - z.h)) >= BURROW_MOUSE_TEST.campDistance * CELL);
  if (mice.some(e => e.type === spec.id && !e.dead && e.hp > 0 && farFromCamp(e.x, e.y))) {
    G.burrowMouseTestSpawnDone = true;
    return;
  }
  const spots = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const [x, y] = center(c, r);
    if (!farFromCamp(x, y) || !burrowMouseCanStand(x, y)
      || (typeof insideWarningLine === 'function' && insideWarningLine(x, y))) continue;
    if (G.towers.some(t => t.hp > 0 && Math.hypot(t.x - x, t.y - y) < CELL * 1.5)
      || G.enemies.some(e => !e.dead && e.hp > 0 && Math.hypot(e.x - x, e.y - y) < CELL * 1.5)) continue;
    spots.push({ x, y, score: Math.hypot(x - p.x, y - p.y) });
  }
  spots.sort((a, b) => a.score - b.score);
  if (!spots.length) {
    if (!G.burrowMouseTestSpawnHint && typeof systemNotice === 'function') {
      systemNotice('老鼠測試：營地 20 格外沒有可生成的空地，暫緩生成。'); G.burrowMouseTestSpawnHint = true;
    }
    return;
  }
  G.enemies.push(createMonster(spec, spots[0].x, spots[0].y));
  G.burrowMouseTestSpawnDone = true;
  if (typeof systemNotice === 'function') systemNotice('版權老鼠已在營地 20 格外出現，可前往測試。');
}
function burrowingMouseDefinition(id = 'burrowing_mouse') {
  return { id, name: '花蓮版權老鼠', sprite: BURROW_MOUSE_ART.body,
    hp: 180, speed: 65, playerDamage: 14, sentryDamage: 18, buildingDamage: 35,
    reward: 45, crystals: 5, width: 110, height: 90,
    behavior: 'burrow', burrow: validBurrowCfg(), art: { ...BURROW_MOUSE_ART },
    frames: { front: BURROW_MOUSE_ART.body, walkFront: [BURROW_MOUSE_ART.body] },
    noHitSquash: true, knockMul: 0 };
}
// 只取現行的素材鍵；舊存檔／草稿裡已刪除的圖（mouse-hole-*、right-hand…）不會再被載入。
function burrowMouseArt(e) {
  return Object.fromEntries(Object.keys(BURROW_MOUSE_ART).map(k => [k, e?.art?.[k] || BURROW_MOUSE_ART[k]]));
}
function burrowMouseBlinkFrame(art, age) {
  const blink = age % 3.7;
  return blink < .1 || (blink >= .22 && blink < .32) ? art.bodyHalf : blink < .22 ? art.bodyClosed : art.body;
}
// throughWalls：在地底靠震動感應，隔著牆也找得到目標（之後從牆底下鑽過去）。
function burrowMouseTargets(e, range, throughWalls = false) {
  const candidates = e.confuseT > 0
    ? G.enemies.filter(o => o !== e && !o.dead && o.hp > 0)
    : [G.player, ...G.towers.filter(t => !t.berserk && !t.eatenBy && enemyNoticesSentry(e, t))];
  return candidates.filter(t => t && t.hp > 0 && Math.hypot(t.x - e.x, t.y - e.y) <= range * CELL
    && (throughWalls || hasLineOfSight(e.x, e.y, t.x, t.y))).sort((a, b) => {
      const taunt = t => !e.confuseT && G.towers.includes(t) && (TYPES[t.type]?.taunt || 0) * CELL >= Math.hypot(t.x - e.x, t.y - e.y) ? 1 : 0;
      return taunt(b) - taunt(a) || Math.hypot(a.x - e.x, a.y - e.y) - Math.hypot(b.x - e.x, b.y - e.y);
    });
}
// 保留 5×5 的大小（200×200 像素），但改成以實際座標為中心，不因跨格而跳動。
function burrowMouseInReach(e, p) {
  return Math.abs(p.x - e.x) <= CELL * 2.5 && Math.abs(p.y - e.y) <= CELL * 2.5;
}
// 老鼠的土堆（入土留下的洞、出土中的本體、手洞、躲在地底的土堆）：不擋路也不擋建造，踩上去移動速度 −80%。
const BURROW_MOUND_SLOW = .2;
function* burrowMouseMoundShapes() {
  if (typeof G === 'undefined' || !G) return;
  const mound = (x, y, w = 110, h = 90) => ({ x, y: y - 3 * h / 90, rx: 42 * w / 110, ry: 14 * h / 90 });
  for (const h of G.burrowHoles || []) if (!h.slow && (h.age || 0) < (h.lifetime ?? 5)) yield mound(h.x, h.y, h.w, h.h);
  for (const e of [...(G.enemies || []), ...(G.burrowLurkers || [])]) if (e.behavior === 'burrow' && !e.dead && e.hp > 0) {
    yield mound(e.x, e.y, e.drawWidth || 110, e.drawHeight || 90);
    for (const h of e.bm?.hands || []) yield { x: h.x + (h.side === 'left' ? 4 : -4), y: h.y, rx: 24, ry: 9 };
  }
}
function burrowMouseLeaveHole(e, delay = 0) {
  (G.burrowHoles || (G.burrowHoles = [])).push({
    x: e.x, y: e.y, w: e.drawWidth || 110, h: e.drawHeight || 90,
    image: burrowMouseArt(e).hole, age: 0, lifetime: 5 + delay,
  });
}
// 死亡洞：等收回動畫（1.1 秒）快結束才浮現；橢圓取 hole02 洞口範圍。
function burrowMouseDeathHole(e) {
  (G.burrowHoles || (G.burrowHoles = [])).push({
    x: e.x, y: e.y, w: e.drawWidth || 110, h: e.drawHeight || 90,
    image: burrowMouseArt(e).deathHole, age: 0, show: .8, lifetime: 1.1 + BURROW_DEATH_HOLE.lifetime, slow: BURROW_DEATH_HOLE.slow,
  });
}
// 給 js/build.js 的 slowFactorAt：溫特、隊員、地面怪物踩到土堆或死亡洞都會變慢。
function burrowMouseSlowAt(x, y) {
  let k = 1;
  if (typeof G === 'undefined' || !G) return k;
  for (const m of burrowMouseMoundShapes()) {
    const dx = (x - m.x) / m.rx, dy = (y - m.y) / m.ry;
    if (dx * dx + dy * dy <= 1) { k = BURROW_MOUND_SLOW; break; }
  }
  for (const h of G.burrowHoles || []) if (h.slow && h.age >= (h.show || 0) && h.age < h.lifetime) {
    const sx = (h.w || 110) / 110, sy = (h.h || 90) / 90;
    const dx = (x - h.x) / (42 * sx), dy = (y - (h.y - 10 * sy)) / (16 * sy);
    if (dx * dx + dy * dy <= 1) k = Math.min(k, h.slow);
  }
  return k;
}
// ---- 地底：潛伏（lurk）→ 鑽地移動（tunnel）→ 出土 ----
// 地底的老鼠移出 G.enemies、改放 G.burrowLurkers：子彈、近戰、隊員索敵都碰不到，也不擋路；
// 只有爆炸（油桶、油箱、爐具、地雷）能用 burrowMouseBlast 把牠炸出地面。
const BURROW_UNDER = { lurkPause: .6, retarget: .4, digSound: 1.8, trailEvery: 10, trailLife: 1.6, blastStun: 6, shockMul: 2, shockExtra: 3 };
const burrowUnderground = e => e?.bm && (e.bm.phase === 'lurk' || e.bm.phase === 'tunnel');
function burrowLurkerCount() { return (typeof G !== 'undefined' && G?.burrowLurkers || []).filter(e => !e.dead && e.hp > 0).length; }
function burrowMouseDigSpot(e, target) {
  // 剛鑽回去（b.avoid＝上一個洞）：一定換位置，至少離開 1.5 格。
  const avoid = e.bm?.avoid, far = p => !avoid || Math.hypot(p.x - avoid.x, p.y - avoid.y) >= CELL * 1.5;
  // 已經在伸手範圍內、腳下也能站：原地出土，不必繞。
  if (far(e) && burrowMouseInReach(e, target) && burrowMouseCanStand(e.x, e.y, e) && hasLineOfSight(e.x, e.y, target.x, target.y)) return { x: e.x, y: e.y };
  const spots = burrowMousePolarSpots(target, [64, 84, 44, 112, 32], e).filter(p =>
    far(p) && burrowMouseInReach(p, target) && hasLineOfSight(p.x, p.y, target.x, target.y));
  spots.sort((a, b) => Math.hypot(a.x - e.x, a.y - e.y) - Math.hypot(b.x - e.x, b.y - e.y));
  return spots[0] || null;
}
function burrowMouseSurface(e, stun = 0) {
  const b = e.bm;
  b.phase = stun ? 'idle' : 'emerge'; b.age = 0; b.attacked = false; b.dest = null; b.avoid = null; b.hands = [];
  if (stun) e.stunT = Math.max(e.stunT || 0, stun);
  e.lastSafeX = e.x; e.lastSafeY = e.y;
  if (typeof resetEnemyNavigation === 'function') resetEnemyNavigation(e);
  G.burrowLurkers = (G.burrowLurkers || []).filter(o => o !== e);
  if (!G.enemies.includes(e)) G.enemies.push(e);
  if (typeof sfxAt === 'function') sfxAt('mouseOut', e.x, e.y, .8, 'mouse-out');
}
function burrowMouseTrail(e, b) {
  const [c, r] = cellAt(e.x, e.y), floor = typeof mapFloorCells !== 'function' || mapFloorCells().has(c + ',' + r);
  if (!floor || isWall(c, r)) return;   // 穿過牆底下不留痕
  (G.burrowTrails || (G.burrowTrails = [])).push({ x: e.x, y: e.y, a: Math.atan2(b.dy || 0, b.dx || 1) + (Math.random() - .5) * .9, life: BURROW_UNDER.trailLife });
  const n = Math.random() < .4 ? 2 : 1;
  for (let i = 0; i < n; i++) G.effects.push({ particle: true, kind: 'spark', x: e.x + (Math.random() - .5) * 14, y: e.y - 2,
    vx: (Math.random() - .5) * 34, vy: -(18 + Math.random() * 32), r: 2 + Math.random() * 2.5, life: .45 + Math.random() * .3, life0: .75,
    color: Math.random() < .5 ? '#a8936c' : '#cdbb91' });
}
function stepBurrowLurker(e, dt) {
  const c = validBurrowCfg(e.burrowCfg), b = e.bm;
  b.age += dt; b.cd = Math.max(0, b.cd - dt);
  const guard = typeof frenzyCoreGoal === 'function' ? frenzyCoreGoal(e) : null;
  const target = burrowMouseTargets(e, c.noticeRange, true)[0] || guard;
  if (b.phase === 'lurk') {
    if (!target || b.age < BURROW_UNDER.lurkPause) return;
    b.dest = burrowMouseDigSpot(e, target);
    if (!b.dest) { b.age = 0; return; }   // 附近沒空地：稍後再找
    b.phase = 'tunnel'; b.age = 0; b.retarget = BURROW_UNDER.retarget; b.puff = 0; b.digSnd = 0;
  }
  // 目標走掉了：重新挑出土點（落點已經不在伸手範圍內才換，免得一直抖動）。
  if ((b.retarget -= dt) <= 0) {
    b.retarget = BURROW_UNDER.retarget;
    if (target && !(b.dest && burrowMouseInReach(b.dest, target))) b.dest = burrowMouseDigSpot(e, target) || b.dest;
  }
  if (!b.dest) { b.phase = 'lurk'; b.age = 0; return; }
  if ((b.digSnd -= dt) <= 0) { b.digSnd = BURROW_UNDER.digSound; if (typeof sfxAt === 'function') sfxAt('mouseDig', e.x, e.y, .7, 'mouse-dig'); }
  const dx = b.dest.x - e.x, dy = b.dest.y - e.y, d = Math.hypot(dx, dy);
  let move = c.tunnelSpeed * CELL * dt;
  if (d > .5) { b.dx = dx / d; b.dy = dy / d; }
  while (move > 0 && Math.hypot(b.dest.x - e.x, b.dest.y - e.y) > .5) {
    const left = Math.hypot(b.dest.x - e.x, b.dest.y - e.y), s = Math.min(4, move, left);
    e.x += b.dx * s; e.y += b.dy * s; move -= s;
    if ((b.puff -= s) <= 0) { b.puff = BURROW_UNDER.trailEvery; burrowMouseTrail(e, b); }
  }
  if (Math.hypot(b.dest.x - e.x, b.dest.y - e.y) > .5) return;
  e.x = b.dest.x; e.y = b.dest.y;
  if (!burrowMouseCanStand(e.x, e.y, e)) { b.dest = target ? burrowMouseDigSpot(e, target) : null; return; }   // 落點剛好被佔：換一個
  burrowMouseSurface(e);
}
// 給 js/oil-barrels.js（油桶、油箱、爐具）與 js/landmine.js 呼叫：範圍內地底的老鼠被炸出地面、受傷、暈眩。
// 震暈範圍比爆炸寬：爆炸半徑 ×2、至少再多 3 格。只有在爆炸半徑內才受傷，外圈只是被爆炸聲震暈鑽出來。
function burrowMouseBlast(x, y, R, damage) {
  const shock = Math.max(R * BURROW_UNDER.shockMul, R + BURROW_UNDER.shockExtra * CELL);
  for (const e of [...(G.burrowLurkers || [])]) {
    if (e.dead || e.hp <= 0) continue;
    const d = Math.hypot(e.x - x, e.y - y);
    if (d > shock) continue;
    // 正在鑽的位置不能站（牆邊、別人腳下）：就近找一塊出土。
    if (!burrowMouseCanStand(e.x, e.y, e)) {
      const spot = burrowMousePolarSpots({ x: e.x, y: e.y }, [0, 16, 32, 48, 64], e)[0];
      if (!spot) continue;   // 四周都沒空地：這次炸不出來
      e.x = spot.x; e.y = spot.y;
    }
    const dmg = d <= R ? damage * (1 - .4 * d / R) : 0;
    if (dmg > 0) { e.hp -= dmg; e.hitT = .2; e.hitColor = '#ff9a3c'; }
    burrowMouseSurface(e, BURROW_UNDER.blastStun);
    if (dmg > 0) flashDmg('-' + Math.round(dmg), e.x, e.y - 26, '#ff9a3c');
    if (typeof flash === 'function') flash(dmg > 0 ? '被炸出地面！' : '暈眩！', e.x, e.y - 70, '#ffb35c');
    G.effects.push({ ring: true, x: e.x, y: e.y + 4, r: 8, r2: 52, life: .35, life0: .35, color: '#b9a27a' });
    for (let i = 0; i < 10; i++) burrowMouseTrail(e, e.bm);
  }
}
function stepBurrowingMouse(e, dt) {
  const c = validBurrowCfg(e.burrowCfg), art = burrowMouseArt(e);
  // 新生成的老鼠先躲在地底；本幀結束時由 updateBurrowingMouseFx 移進 G.burrowLurkers。
  const b = e.bm || (e.bm = { phase: 'lurk', age: 0, cd: c.cooldown, attacked: false, hands: [] });
  b.hands = b.hands || [];
  e.slimeLift = 0; e.slimeScaleX = 1; e.slimeScaleY = 1;
  if (burrowUnderground(e)) return;
  if (e.stunT > 0 || e.sleepT > 0) { b.hands = []; return; }
  b.age += dt; b.cd = Math.max(0, b.cd - dt);
  for (const h of b.hands) {
    const before = h.age; h.age += dt;
    if (before < c.windup && h.age >= c.windup && typeof sfxAt === 'function') sfxAt('mouseAttack', h.x, h.y, .8, 'mouse-attack');   // 手鑽出地面
    if (!h.hit && h.age >= c.windup + c.handRise) { h.hit = true; burrowMouseStrike(e, h, c); }
  }
  b.hands = b.hands.filter(h => h.age < c.windup + c.handRise + c.handHold + .22);
  const guard = typeof frenzyCoreGoal === 'function' ? frenzyCoreGoal(e) : null;
  const target = burrowMouseTargets(e, c.noticeRange)[0] || guard;
  if (b.phase === 'emerge' && b.age >= c.emergeTime) { b.phase = 'idle'; b.age = 0; }
  else if ((b.phase === 'sink' && b.age >= c.emergeTime) || b.phase === 'travel') {
    // travel 僅供舊戰場存檔相容。洞記錄舊座標，本體回到地底再鑽向下一個目標。
    burrowMouseLeaveHole(e);
    b.phase = 'lurk'; b.age = 0; b.attacked = false; b.dest = null; b.avoid = { x: e.x, y: e.y };
  } else if (b.phase === 'idle') {
    // 打完一輪、目標跑出範圍，或附近沒人待太久：鑽回地底。
    const hidden = !target && burrowMouseTargets(e, c.noticeRange, true)[0];   // 牆後面有人：鑽回地底從牆下過去
    if (!b.hands.length && (b.attacked || hidden || (target && !burrowMouseInReach(e, target)) || (!target && b.age > 4))) {
      b.phase = 'sink'; b.age = 0;
      if (typeof sfxAt === 'function') sfxAt('mouseDig', e.x, e.y, .7, 'mouse-dig');
    }
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
  e.forceFrame = burrowMouseBlinkFrame(art, b.age); e.forceFlip = false;
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
  if (phase === 'lurk' || phase === 'tunnel') return { reveal: 0, open: 0, crack: 0, stretch: 1 };
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
  const hand = kind !== 'body', sourcePlane = hand ? 77 : 74;
  const plane = top + sourcePlane * sy, mouthX = x + (hand ? 7 : 0) * sx;
  const hole = getImage(hand ? art.handHole : art.hole), raw = getImage(rawFile);
  const open = .15 + .85 * pose.open;
  context.save(); context.globalAlpha *= alpha; context.imageSmoothingEnabled = false;
  // 右手：整組（手＋手洞）以落點為軸左右翻，素材只留左手一套。
  if (kind === 'right') { context.translate(x, 0); context.scale(-1, 1); context.translate(-x, 0); }
  // 土堆整張蓋在本體／手前方；往下挪一點（原圖座標：本體 4、手 2 像素）蓋住洞口橢圓下緣，出土時不會從土堆底下露出。
  const holeDrop = (hand ? 2 : 4) * sy;
  const drawHole = () => {   // 洞口先小後大；裂地圖沿用「地洞剛出現」。
    context.save(); context.translate(mouthX, plane); context.scale(open, open); context.translate(-mouthX, -plane);
    drawBurrowFrame(context, hole, x, y + holeDrop, width, height, pose.open);
    context.restore();
  };
  if (pose.crack > 0) drawBurrowFrame(context, getImage(art.crack), x, y, width, height, pose.crack);
  if (pose.reveal > 0 && raw?.complete && raw.naturalWidth) {
    context.save(); context.beginPath();
    // 地面上方 + 洞口橢圓的聯集；底下的身體永遠不露到地板上。
    context.rect(x - width, top - height, width * 2, plane - top + height);
    context.ellipse(mouthX, plane, (hand ? 16 : 39) * sx * open, (hand ? 4 : 6) * sy * open, 0, 0, Math.PI * 2);
    context.clip();
    // tilt：以洞口為軸左右搖（暈眩），底部不動，所以不會露出土堆外。
    context.translate(mouthX, plane); context.rotate(pose.tilt || 0); context.scale(1, pose.stretch); context.translate(-mouthX, -plane);
    const offset = (1 - pose.reveal) * height;
    context.drawImage(raw, x - width / 2, top + offset, width, height);
    context.restore();
  }
  drawHole();   // 土堆最後畫：常駐在老鼠本體／手的前方
  context.restore();
}
function drawBurrowingMouseBody(context, e, getImage = monsterImage) {
  const art = burrowMouseArt(e), cfg = validBurrowCfg(e.burrowCfg || e.burrow), b = e.bm || { phase: 'emerge', age: 0 };
  const w = e.drawWidth || e.width || 110, h = e.drawHeight || e.height || 90, pose = burrowMouseBodyPose(b.phase, b.age, cfg.emergeTime);
  const dizzy = e.stunT > 0 && !e.dead, t = performance.now() / 1000;
  let raw = burrowMouseBlinkFrame(art, b.age);
  if (dizzy) {
    // 每 0.22 秒隨機換一張暈眩圖（同一時段固定，不會每幀亂跳）；整隻以洞口為軸微微左右搖。
    const slot = Math.floor(t / .22), pick = Math.floor(Math.abs(Math.sin(slot * 12.9898 + e.x * .37) * 43758.5453) % 1 * 4) + 1;
    raw = art['dizzy' + pick];
    pose.tilt = Math.sin(t * 7) * .045;
  }
  drawBurrowMasked(context, getImage, art, e.x, e.y, w, h, 'body', raw, pose, e.burrowAlpha ?? 1);
  if (dizzy) drawBurrowDizzyStars(context, e.x, e.y + 13 - h + 4 * h / 90, w / 110, t);
}
// 頭頂轉圈的星星：後半圈畫淡、前半圈畫亮，看起來像繞著頭轉。
function drawBurrowDizzyStars(context, x, y, scale, t) {
  context.save();
  for (let i = 0; i < 3; i++) {
    const a = t * 3.2 + i * Math.PI * 2 / 3, front = Math.sin(a) > 0;
    const sx = x + Math.cos(a) * 28 * scale, sy = y + Math.sin(a) * 7 * scale, r = (front ? 6 : 4.6) * scale;
    context.globalAlpha = front ? 1 : .55;
    context.fillStyle = '#ffe36e'; context.strokeStyle = '#6b4a08'; context.lineWidth = 1.4;
    context.beginPath();
    for (let k = 0; k < 10; k++) {
      const rr = k % 2 ? r * .45 : r, aa = -Math.PI / 2 + k * Math.PI / 5 + t * 2;
      context.lineTo(sx + Math.cos(aa) * rr, sy + Math.sin(aa) * rr);
    }
    context.closePath(); context.fill(); context.stroke();
  }
  context.restore();
}
function drawBurrowingMouseHand(context, h, art, cfg, getImage = monsterImage) {
  drawBurrowMasked(context, getImage, art, h.x, h.y, 110, 90, h.side, art.hand, burrowMouseHandPose(h.age, cfg));
}
function drawBurrowWarning(context, h, c) {
  if (h.age >= c.windup + c.handRise) return;
  const k = Math.min(1, h.age / Math.max(.01, c.windup)), r = c.hitRadius * (typeof CELL === 'number' ? CELL : 40);
  context.save(); context.strokeStyle = '#ff986c'; context.fillStyle = '#e96b4a'; context.lineWidth = 2;
  context.globalAlpha *= .18 + .12 * k; context.beginPath(); context.ellipse(h.x, h.y + 3, r, r * .48, 0, 0, Math.PI * 2); context.fill();
  context.globalAlpha = .8; context.beginPath(); context.ellipse(h.x, h.y + 3, r * (1.5 - k * .5), r * .48 * (1.5 - k * .5), 0, 0, Math.PI * 2); context.stroke(); context.restore();
}
function drawBurrowingMouseGround(context) {
  // 地底鑽過的痕跡：跟絲瓜藤一樣的短裂痕，慢慢淡掉。
  if (G.burrowTrails?.length) {
    context.save(); context.strokeStyle = '#4a3b26'; context.lineCap = 'round'; context.lineWidth = 2;
    for (const k of G.burrowTrails) {
      if (!isLit(k.x, k.y)) continue;
      context.globalAlpha = Math.min(1, k.life / .6) * .7;
      const L = 9;
      context.beginPath(); context.moveTo(k.x - Math.cos(k.a) * L, k.y - Math.sin(k.a) * L * .5);
      context.lineTo(k.x + Math.cos(k.a + .5) * 3, k.y + Math.sin(k.a + .5) * 2);
      context.lineTo(k.x + Math.cos(k.a) * L, k.y + Math.sin(k.a) * L * .5); context.stroke();
    }
    context.restore();
  }
  // 地底的老鼠：只看得到 hole 土堆；鑽地時微微起伏。
  for (const e of G.burrowLurkers || []) if (!e.dead && isLit(e.x, e.y)) {
    // 鑽過牆底下或沒有地板的空洞時看不到土堆，回到地板上再出現。
    const [c, r] = cellAt(e.x, e.y);
    if (isWall(c, r) || (typeof mapFloorCells === 'function' && !mapFloorCells().has(c + ',' + r))) continue;
    const moving = e.bm?.phase === 'tunnel', t = performance.now() / 1000;
    const bob = moving ? Math.round(Math.sin(t * 18 + e.x * .1)) : 0;
    drawBurrowFrame(context, monsterImage(burrowMouseArt(e).hole), e.x, e.y + bob, e.drawWidth || 110, e.drawHeight || 90);
  }
  for (const h of G.burrowHoles || []) if (h.age >= (h.show || 0) && isLit(h.x, h.y)) {
    // 死亡洞：在收回動畫尾段淡入，消失前淡出。
    const alpha = h.slow ? Math.min(1, (h.age - h.show) / .3, (h.lifetime - h.age) / BURROW_DEATH_HOLE.fade) : 1;
    drawBurrowFrame(context, monsterImage(h.image), h.x, h.y, h.w, h.h, alpha);
  }
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
  // 死亡收回動畫結束後留下大洞（hole02），不擋路但會減速，保留 60 秒。
  burrowMouseDeathHole(e);
  (G.burrowDeaths || (G.burrowDeaths = [])).push({ x: e.x, y: e.y, w: e.drawWidth || 110, h: e.drawHeight || 90, art: burrowMouseArt(e), age: 0 });
}
function updateBurrowingMouseFx(dt) {
  updateBurrowMouseTestSpawn(dt);
  // 鑽回地底的老鼠移出 G.enemies（打不到、不擋路），在地底另外行動。
  const lurkers = G.burrowLurkers || (G.burrowLurkers = []);
  for (let i = G.enemies.length - 1; i >= 0; i--) {
    const e = G.enemies[i];
    if (e.behavior === 'burrow' && !e.dead && e.hp > 0 && burrowUnderground(e)) { G.enemies.splice(i, 1); e.bm.hands = []; lurkers.push(e); }
  }
  if (dt > 0) for (const e of [...lurkers]) stepBurrowLurker(e, dt);
  if (G.burrowTrails) G.burrowTrails = G.burrowTrails.filter(k => (k.life -= dt) > 0);
  if (G.burrowHoles) G.burrowHoles = G.burrowHoles.filter(h => (h.age += dt) < h.lifetime);
  if (G.burrowDeaths) G.burrowDeaths = G.burrowDeaths.filter(d => (d.age += dt) < 1.1);
}
