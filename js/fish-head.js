/* ===== 魚頭君（behavior: "fishhead"）=====
   ・抗火、怕電：火焰傷害變很少，雷電傷害變多（倍率見 FISH_HEAD.fireMul／shockMul）。
   ・正面比較硬、背面是魚肉：露出斜後（魚肉那面）時被打比較痛，正面時比較不痛（倍率見 FISH_HEAD.frontMul／backMul）。
     往畫面上方走時會露出斜後；往下、往左右走，或是噴水的時候是正面。
   ・膽小：只要被攻擊就會轉身逃跑一陣子（FISH_HEAD.fleeTime）。
   ・攻擊：從嘴巴噴水，傷害低，但會把人往後沖開（擊退）。被建築擋路時也是用噴水打建築（不會用手打）。
   ・看到火（燃燒的照明彈、火海、身上著火的怪物）就會先跑去噴水滅火，這時候完全不理玩家。
   ・死掉時會留下一大攤水。
   ・走路時地上會留下水漬，站著不動時腳下會積一攤水；水柱打到的地方也會積水。地上的水會把火弄熄。
   必須在 enemy-ai.js 之後、game.js 之前載入。
*/
const FISH_HEAD = {
  frontMul: 0.6,          // 正面被打：傷害 ×0.6（比較不痛）
  backMul: 1.5,           // 斜後（魚肉那面）被打：傷害 ×1.5（比較痛）
  fireMul: 0.25,          // 抗火：火焰傷害 ×0.25（希奧妮的火、燒傷、火海）
  shockMul: 1.6,          // 怕電：雷電傷害 ×1.6（安柏的雷電）
  fleeTime: 2.5,          // 膽小：被攻擊後逃跑幾秒（逃跑時不攻擊、不滅火）
  fleeSpeedMul: 2.5,        // 逃跑速度 ×
  scareHop: 18,           // 嚇到時彈起來多高（像素）
  scareHopTime: 0.32,     // 彈一下花幾秒
  noticeRange: 7,         // 看到玩家／哨兵的距離（格）
  loseRange: 12,          // 追多遠就放棄（格）
  sprayRange: 3.5,        // 噴水射程（格）
  windup: 0.45,           // 噴水前張嘴準備（秒）
  sprayTime: 0.5,         // 一次噴多久（秒）
  cooldown: 2.4,          // 兩次噴水之間隔幾秒
  dropSpeed: 330,         // 水柱速度（像素／秒）
  knockback: 1.4,         // 打中玩家時往後沖開幾格
  sentryKnockback: 1,     // 打中哨兵時往後沖開幾格
  fireSense: 10,          // 幾格內看到火就會去滅
  fireDouse: 0.6,         // 每一滴水打中火海時，火海少燒幾秒
  trailEvery: 16,         // 走路時每走幾像素滴一個水漬
  trailLife: 6,           // 水漬留幾秒
  poolDelay: 0.8,         // 站著不動幾秒開始積水
  poolMaxR: 34,           // 腳下那攤水最大半徑（像素）
  poolLife: 12,           // 那攤水離開後留幾秒
  puddleDouse: 4,         // 地上的水碰到火海：火海每秒少燒幾秒（照明彈碰到水直接熄滅）
  puddleScale: 1.5,       // 所有水灘（水漬、站著積水、打到的地方、死掉）的大小倍率
  maxPuddles: 70,         // 地上最多幾灘水（太多就把最舊的拿掉）
  testSpawn: false,       // 測試用：開始戰鬥時，在離溫特約 10 格的地方直接放一隻魚頭君（測完改成 false）
  streamWidth: 17,        // 水柱最粗的地方（前端）幾像素；嘴巴那端是尖的
  arcHeight: 16,          // 水柱往上拱多高（像素）
  hitPoolR: 32,           // 水柱打到的地方積水最大半徑（像素）
  splashSize: 1.6,        // 打到的地方水花大小（1＝原本）
  deathPoolR: 44,         // 死掉時留下的那攤水最大半徑（像素）
  deathPoolLife: 20,      // 死掉留下的水留幾秒
  streamColor: '#6aa8ff', // 水柱顏色
  wanderRadius: 2.5, wanderSpeedMul: 0.55, idleMin: 1.5, idleMax: 3.5,
};
const fhRand = (a, b) => a + Math.random() * (b - a);

// ---- 火：照明彈、火海、身上著火的怪物 ----
function fishFires(self) {
  const list = [];
  for (const f of G.flares || []) if (f.t > .3) list.push({ x: f.x, y: f.y, kind: 'flare', ref: f });
  for (const f of G.oilFires || []) if (f.t > 0) list.push({ x: f.x, y: f.y, r: f.r, kind: 'oil', ref: f });
  for (const e of G.enemies) if (e !== self && !e.dead && e.hp > 0 && e.burnT > 0) list.push({ x: e.x, y: e.y, kind: 'burn', ref: e });
  return list;
}
function fireAlive(fire) {
  if (fire.kind === 'flare') return fire.ref.t > 0 && (G.flares || []).includes(fire.ref);
  if (fire.kind === 'oil') return fire.ref.t > 0 && (G.oilFires || []).includes(fire.ref);
  return fire.ref.burnT > 0 && !fire.ref.dead && fire.ref.hp > 0;
}
// 冒白煙（水碰到火）
function fishSteam(x, y, big) {
  G.effects.push({ ring: true, x, y: y + 4, r: 4, r2: big ? 30 : 16, life: .35, life0: .35, color: '#e8f4fb' });
  for (let i = 0; i < (big ? 7 : 3); i++)
    G.effects.push({ particle: true, kind: 'spark', x: x + (Math.random() - .5) * 14, y: y - 4, vx: (Math.random() - .5) * 30, vy: -(30 + Math.random() * 40), r: 2 + Math.random() * 2.5, life: .5 + Math.random() * .3, life0: .8, color: '#dfe9ee' });
}
// 用水澆熄火（amount＝火海少燒幾秒）
function douseFire(fire, amount) {
  if (fire.kind === 'flare') { fire.ref.t = 0; fishSteam(fire.x, fire.y, true); }
  else if (fire.kind === 'oil') { fire.ref.t -= amount; if (Math.random() < .35) fishSteam(fire.x + (Math.random() - .5) * fire.r, fire.y + (Math.random() - .5) * fire.r * .6, false); if (fire.ref.t <= 0) fishSteam(fire.x, fire.y, true); }
  else { fire.ref.burnT = 0; fishSteam(fire.x, fire.y - 10, true); }
  if (typeof sfxAt === 'function') sfxAt('fishDouse', fire.x, fire.y, .5, 'fish-douse');
}
// (x,y) 碰到的火（照明彈、火海、著火的怪物）
function firesAt(x, y, pad) {
  return fishFires(null).filter(f => f.kind === 'oil' ? Math.hypot(x - f.x, (y - f.y) / .7) <= f.r + pad : Math.hypot(x - f.x, y - f.y) <= 14 + pad);
}

// ---- 地上的水 ----
function addPuddle(x, y, r, life, grow) {
  const list = G.waterPuddles = G.waterPuddles || [];
  r *= FISH_HEAD.puddleScale;
  // shape：水灘邊緣一圈的凹凸（每個點的半徑倍率），讓每一灘形狀都不一樣
  const n = r > 9 ? 11 : 7, shape = Array.from({ length: n }, () => .7 + Math.random() * .45);
  const p = { x, y, r, t: life, t0: life, seed: Math.random() * 10, grow: !!grow, shape };
  list.push(p);
  if (list.length > FISH_HEAD.maxPuddles) list.splice(0, list.length - FISH_HEAD.maxPuddles);
  return p;
}
function updateFishWater(dt) {
  if (G.fishDrops && G.fishDrops.length) updateFishDrops(dt);
  if (G.fishSplashes && G.fishSplashes.length) { for (const q of G.fishSplashes) { q.t -= dt; q.age += dt; } G.fishSplashes = G.fishSplashes.filter(q => q.t > 0); }
  if (!G.waterPuddles || !G.waterPuddles.length) return;
  for (const p of G.waterPuddles) {
    if (!p.grow) p.t -= dt;
    if (p.growTo && p.r < p.growTo) p.r = Math.min(p.growTo, p.r + 40 * dt);   // 慢慢漫開
    // 地上的水碰到火：照明彈直接熄滅、火海越燒越小、身上著火的怪物走進水裡就滅了
    for (const f of G.flares || []) if (f.t > 0 && Math.hypot(f.x - p.x, f.y - p.y) <= p.r + 8) douseFire({ x: f.x, y: f.y, kind: 'flare', ref: f });
    for (const f of G.oilFires || []) if (f.t > 0 && Math.hypot(p.x - f.x, (p.y - f.y) / .7) <= f.r + p.r * .5) {
      f.t -= FISH_HEAD.puddleDouse * dt;
      if (Math.random() < dt * 3) fishSteam(p.x, p.y, false);
      if (f.t <= 0) fishSteam(f.x, f.y, true);
    }
    for (const e of G.enemies) if (e.burnT > 0 && Math.hypot(e.x - p.x, e.y + 12 - p.y) <= p.r + 6) { e.burnT = 0; fishSteam(e.x, e.y - 10, false); }
  }
  G.waterPuddles = G.waterPuddles.filter(p => p.t > 0);
}

// 死掉：身體裡的水流出來，留下一大攤水（js/combat-feel.js 的 onEnemyDeath 呼叫）
function fishDeathPuddle(e) {
  const p = addPuddle(e.x, e.y + 11, 12, FISH_HEAD.deathPoolLife);
  p.growTo = FISH_HEAD.deathPoolR * FISH_HEAD.puddleScale;
}

// ---- 魚頭君的行為（enemy-ai.js 的 stepEnemy 呼叫）----
function fishTargets(e) {
  const list = [], p = G.player;
  if (p && p.hp > 0) list.push(p);
  for (const t of G.towers) if (t.hp > 0 && !t.berserk && enemyNoticesSentry(e, t)) list.push(t);
  return list;
}
function fishPickTarget(e) {
  const dist = t => Math.hypot(t.x - e.x, t.y - e.y), targets = fishTargets(e);
  if ((e.playerAggroT || 0) > 0 && targets.includes(G.player) && dist(G.player) <= ENEMY_SENSE_RANGE) return G.player;
  if (e.sentryAggroT > 0 && targets.includes(e.sentryAggro) && dist(e.sentryAggro) <= ENEMY_SENSE_RANGE) return e.sentryAggro;
  let best = null, bestD = FISH_HEAD.noticeRange * CELL;
  for (const t of targets) { const d = dist(t); if (d <= bestD && hasLineOfSight(e.x, e.y, t.x, t.y)) { best = t; bestD = d; } }
  return best;
}
function fishPickFire(e) {
  let best = null, bestD = FISH_HEAD.fireSense * CELL;
  for (const f of fishFires(e)) { const d = Math.hypot(f.x - e.x, f.y - e.y); if (d <= bestD && hasLineOfSight(e.x, e.y, f.x, f.y)) { best = f; bestD = d; } }
  return best;
}
function fishGo(e, x, y, dt, key) {
  const [gc, gr] = cellAt(x, y);
  const nav = enemyNavigate(e, gc, gr, dt, key + ':' + gc + ',' + gr, true);
  if (nav && nav.blocker) {   // 被建築擋住：對建築噴水
    const o = nav.blocker, ox = OX + (o.c + (o.w || 1) / 2) * CELL, oy = OY + (o.r + (o.h || 1) / 2) * CELL;
    e.attackingObstacle = o;
    if (e.fh.cd <= 0) { e.fh.aim = { x: ox, y: oy, building: o }; e.fh.windup = FISH_HEAD.windup; e.faceRight = ox > e.x; }
  }
}
function stepFishHeadEnemy(e, dt) {
  const C = FISH_HEAD;
  if (!e.fh) e.fh = { cd: .8 + Math.random(), wait: Math.random() * 2, still: 0, trail: 0, lx: e.x, ly: e.y };
  const fh = e.fh;
  fh.cd -= dt;
  if (fh.hop != null) {   // 嚇到：原地彈一下（拋物線）
    fh.hop += dt;
    const k = Math.min(1, fh.hop / C.scareHopTime);
    e.slimeLift = C.scareHop * 4 * k * (1 - k);
    if (k >= 1) { fh.hop = null; e.slimeLift = 0; }
  }
  if (e.stunT > 0) { fh.windup = 0; fh.spray = null; fishTrack(e, dt); return; }
  if (fh.flee > 0) { fh.flee -= dt; fh.windup = 0; fh.spray = null; fishFlee(e, dt); fishTrack(e, dt); return; }   // 被打：逃跑中
  // 張嘴準備 → 噴水
  if (fh.windup > 0) {
    fh.windup -= dt;
    if (fh.windup <= 0) startFishSpray(e);
    fishTrack(e, dt, true); return;
  }
  if (fh.spray) { fishTrack(e, dt, true); return; }   // 噴水中：站著不動（updateFishSprays 會處理）
  // 1. 有火：先去滅火，不理玩家
  if (fh.fire && !fireAlive(fh.fire)) fh.fire = null;
  if (!fh.fire) fh.fire = fishPickFire(e);
  if (fh.fire) {
    const f = fh.fire, d = Math.hypot(f.x - e.x, f.y - e.y), reach = C.sprayRange * CELL * .85 + (f.r || 0) * .5;
    if (d <= reach && hasLineOfSight(e.x, e.y, f.x, f.y)) {
      if (fh.cd <= 0) { fh.aim = { x: f.x, y: f.y, fire: f }; fh.windup = C.windup * .6; e.faceRight = f.x > e.x; }
    } else fishGo(e, f.x, f.y, dt, 'fishfire');
    fishTrack(e, dt); return;
  }
  // 2. 玩家或哨兵
  let target = fishPickTarget(e);
  if (!target && fh.target && fh.target.hp > 0 && Math.hypot(fh.target.x - e.x, fh.target.y - e.y) <= C.loseRange * CELL) target = fh.target;
  fh.target = target;
  if (target) {
    const d = Math.hypot(target.x - e.x, target.y - e.y);
    if (d <= C.sprayRange * CELL && hasLineOfSight(e.x, e.y, target.x, target.y)) {
      if (fh.cd <= 0) { fh.aim = { x: target.x, y: target.y, who: target }; fh.windup = C.windup; e.faceRight = target.x > e.x; }
    } else fishGo(e, target.x, target.y, dt, 'fish');
    fishTrack(e, dt); return;
  }
  // 3. 沒事做：發呆、在附近走走
  if (fh.spot) {
    const moved = moveEnemyToward(e, fh.spot, dt * C.wanderSpeedMul);
    if (!moved || Math.hypot(fh.spot.x - e.x, fh.spot.y - e.y) <= 3) { fh.spot = null; fh.wait = fhRand(C.idleMin, C.idleMax); }
  } else {
    fh.wait -= dt;
    if (fh.wait <= 0) {
      const o = typeof squadAnchor === 'function' ? squadAnchor(e) : e;   // 金蕉王的隊員：繞著隊長散步（js/golden-banana-king.js）
      for (let i = 0; i < 8; i++) {
        const a = Math.random() * Math.PI * 2, r = (.6 + Math.random() * (C.wanderRadius - .6)) * CELL, x = o.x + Math.cos(a) * r, y = o.y + Math.sin(a) * r;
        if (!enemyBlocked(x, y) && hasLineOfSight(e.x, e.y, x, y)) { fh.spot = { x, y }; break; }
      }
      fh.wait = fhRand(C.idleMin, C.idleMax);
    }
  }
  fishTrack(e, dt);
}
// 逃跑：附近所有威脅（玩家、哨兵）都會把牠往外推，越近推越大力 → 往合起來的方向跑；被擋住就試著斜著跑
// 逃跑方向在開始逃的時候決定一次，每 0.6 秒重算，才不會被兩邊的人夾著原地來回抖
function fishFlee(e, dt) {
  const fh = e.fh;
  fh.fleeRe = (fh.fleeRe || 0) - dt;
  if (fh.fleeDir == null || fh.fleeRe <= 0) {
    let vx = 0, vy = 0;
    for (const t of [G.player, ...G.towers]) {
      if (!t || t.hp <= 0 || t.berserk) continue;
      const dx = e.x - t.x, dy = e.y - t.y, d = Math.hypot(dx, dy) || 1;
      if (d > 9 * CELL) continue;
      const w = (t === G.player ? 1.3 : 1) / (d * d);   // 越近越怕；最怕溫特
      vx += dx / d * w; vy += dy / d * w;
    }
    if (!vx && !vy && G.player) { vx = e.x - G.player.x; vy = e.y - G.player.y; }
    fh.fleeDir = Math.atan2(vy, vx); fh.fleeRe = .6;
  }
  const base = fh.fleeDir;
  for (const off of [0, .5, -.5, 1, -1, 1.6, -1.6]) {
    const a = base + off, goal = { x: e.x + Math.cos(a) * CELL * 2, y: e.y + Math.sin(a) * CELL * 2 };
    if (moveEnemyToward(e, goal, dt * FISH_HEAD.fleeSpeedMul)) return;
  }
}
// 每幀：決定露出正面還是斜後、腳步聲、水漬、站著積水
function fishTrack(e, dt, facing) {
  const C = FISH_HEAD, fh = e.fh, dx = e.x - fh.lx, dy = e.y - fh.ly, moved = Math.hypot(dx, dy);
  fh.lx = e.x; fh.ly = e.y;
  if (facing) e.showBack = false;   // 噴水時面向目標（正面）
  else if (moved > .2) {
    e.showBack = dy < -Math.abs(dx) * .3;   // 往畫面上方走：露出斜後的魚肉
    if (Math.abs(dx) > .1) e.faceRight = dx > 0;
  }
  if (moved > .2 && moved < 20) {
    fh.still = 0;
    if (fh.pool) { fh.pool.grow = false; fh.pool = null; }   // 走開了：那攤水開始慢慢乾
    fh.trail += moved;
    if (fh.trail >= C.trailEvery) {
      fh.trail = 0;
      addPuddle(e.x + (Math.random() - .5) * 10, e.y + 11 + Math.random() * 3, 5 + Math.random() * 3.5, C.trailLife);   // 走路的水漬
      fh.step = !fh.step;
      if (fh.step && typeof sfxAt === 'function') sfxAt('fishStep', e.x, e.y, .35, 'fish-step');   // 黑暗中也聽得到（越遠越小聲）
    }
  } else {
    fh.still += dt;
    if (fh.still >= C.poolDelay) {
      if (!fh.pool) fh.pool = addPuddle(e.x, e.y + 11, 8, C.poolLife, true);
      fh.pool.r = Math.min(C.poolMaxR * C.puddleScale, fh.pool.r + 14 * C.puddleScale * dt);
      fh.pool.t = C.poolLife;
    }
  }
}

// ---- 噴水 ----
function fishMouth(e) {
  // 嘴唇在圖上的位置：正面圖在左邊緣、斜後圖在右邊緣，大約在圖的一半高度（圖 80×80，腳底在 e.y + 13）
  const side = e.faceRight ? 1 : -1, w = e.drawWidth || 80, h = e.drawHeight || 80;
  return { x: e.x + side * w * .46, y: e.y, z: h * .5 - 13 };
}
function startFishSpray(e) {
  const fh = e.fh, aim = fh.aim;
  if (!aim) return;
  if (aim.who && aim.who.hp > 0) { aim.x = aim.who.x; aim.y = aim.who.y; }   // 噴的那一刻再對準一次
  e.faceRight = aim.x > e.x;
  fh.spray = { t: FISH_HEAD.sprayTime, emit: 0, hit: new Set(), aim };
  fh.cd = FISH_HEAD.cooldown;
  if (typeof sfxAt === 'function') sfxAt('fishSpray', e.x, e.y, .6, 'fish-spray');
}
function updateFishSprays(dt) {
  for (const e of G.enemies) {
    const s = e.fh && e.fh.spray; if (!s) continue;
    if (e.dead || e.hp <= 0 || e.stunT > 0) { e.fh.spray = null; continue; }
    s.t -= dt; s.emit -= dt;
    while (s.emit <= 0 && s.t > 0) {
      s.emit += .028;
      const m = fishMouth(e), a = Math.atan2(s.aim.y - m.y, s.aim.x - m.x) + (Math.random() - .5) * .07;   // 角度只微微晃動，連起來才像一條水柱
      const len = Math.min(FISH_HEAD.sprayRange * CELL + 12, Math.hypot(s.aim.x - m.x, s.aim.y - m.y) + 14);
      (G.fishDrops = G.fishDrops || []).push({ owner: e, spray: s, x: m.x, y: m.y, z0: m.z, z: m.z, ux: Math.cos(a), uy: Math.sin(a), left: len, len, r: 2 + Math.random() * 1.8 });
    }
    if (s.t <= 0) e.fh.spray = null;
  }
}
function fishHitPlayer(e, d) {
  const p = G.player, dmg = Math.round(typeof equipPlayerDamage === 'function' ? equipPlayerDamage(e.playerDamage ?? 5) : e.playerDamage ?? 5);
  p.hp = Math.max(0, p.hp - dmg);
  p.hitT = .35; p.underAttackT = 5; p.lastAttacker = e;
  G.damageVignetteT = Math.max(G.damageVignetteT || 0, .3);
  flashDmg('-' + dmg, p.x, p.y - 46, '#ff6b6b'); addShake(1.5);
  playPlayerHit(1, true);   // 溫特被水柱打中
  knockActor(p, d.ux, d.uy, FISH_HEAD.knockback * CELL);   // 被水沖開
  if (p.burnT > 0) p.burnT = 0;
  if (p.hp <= 0 && !G.over) { flash('部隊長失去戰鬥能力', p.x, p.y - 58, '#ff5b6e'); lose('player', '被' + monsterNameOf(e) + '噴水沖倒'); }
}
// 水柱打到東西：那裡濺起水花、積一攤水（同一次噴水打在附近就讓那攤水越積越大）
function fishImpact(d, back = 0) {
  const s = d.spray, x = d.x - d.ux * back, y = d.y - d.uy * back;
  const sp = (G.fishSplashes = G.fishSplashes || []).find(q => q.spray === s);
  if (sp) { sp.x = x; sp.y = y; sp.z = d.z; sp.t = .3; sp.ux = d.ux; } else G.fishSplashes.push({ spray: s, x, y, z: d.z, t: .3, age: 0, ux: d.ux, seed: Math.random() * 9 });
  if (!s.pool || !G.waterPuddles || !G.waterPuddles.includes(s.pool) || Math.hypot(s.pool.x - x, s.pool.y - (y + 4)) > 34 * FISH_HEAD.puddleScale) s.pool = addPuddle(x, y + 4, 10, FISH_HEAD.poolLife);
  else { s.pool.r = Math.min(FISH_HEAD.hitPoolR * FISH_HEAD.puddleScale, s.pool.r + 1.3 * FISH_HEAD.puddleScale); s.pool.t = FISH_HEAD.poolLife; }
}
function updateFishDrops(dt) {
  const p = G.player;
  for (const d of G.fishDrops) {
    const e = d.owner, step = FISH_HEAD.dropSpeed * dt;
    d.left -= step; d.x += d.ux * step; d.y += d.uy * step;
    const k = 1 - Math.max(0, d.left / d.len);   // 0＝剛離開嘴巴、1＝飛到底
    d.z = d.z0 * (1 - k) + 8 * k + FISH_HEAD.arcHeight * 4 * k * (1 - k);   // 先往上拱、再落下（拋物線）
    const [c, r] = cellAt(d.x, d.y);
    const building = inGrid(c, r) && enemyBarrierAt(c, r);
    if (building) {   // 打到建築：一次噴水對同一個建築只算一次傷害
      d.done = true;
      if (e && !e.dead && G.obstacles.includes(building) && !d.spray.hit.has(building)) { d.spray.hit.add(building); e.atkCd = 0; enemyAttackObstacle(e, building, 0); }
      fishImpact(d, 10); continue;
    }
    if (!inGrid(c, r) || isWall(c, r)) { d.done = true; fishImpact(d, 8); continue; }
    // 打到火：澆熄
    for (const f of firesAt(d.x, d.y, 4)) { douseFire(f, FISH_HEAD.fireDouse); d.done = true; }
    if (d.done) { fishImpact(d); continue; }
    // 打到人（一次噴水每個人只算一次傷害）
    if (e && !e.dead && !(d.spray.aim.fire)) {
      if (p && p.hp > 0 && Math.hypot(p.x - d.x, p.y - d.y) <= 16) {
        d.done = true; fishImpact(d);
        if (!d.spray.hit.has(p)) { d.spray.hit.add(p); fishHitPlayer(e, d); }
        continue;
      }
      for (const t of G.towers) {
        if (t.hp <= 0 || t.berserk || Math.hypot(t.x - d.x, t.y - d.y) > 16) continue;
        d.done = true; fishImpact(d);
        if (!d.spray.hit.has(t)) {
          d.spray.hit.add(t); e.atkCd = 0; enemyAttackSentry(e, t, 0);
          knockActor(t, d.ux, d.uy, FISH_HEAD.sentryKnockback * CELL); t.navPath = null; t.navGoal = null;
          if (t.burnT > 0) t.burnT = 0;
        }
        break;
      }
      if (d.done) continue;
    }
    if (d.left <= 0) { d.done = true; fishImpact(d); }
  }
  G.fishDrops = G.fishDrops.filter(d => !d.done);
}

// ---- 正面比較硬、斜後比較痛；抗火、怕電：每幀把這幀受到的傷害乘上倍率（game.js 在結算死亡前呼叫）----
// 火焰、雷電的傷害量由造成傷害的地方記在 e.fireDmg／e.shockDmg（game.js 隊員攻擊、enemy-ai.js 燒傷、oil-barrels.js 火海）
// 也在這裡發現「被打了」→ 膽小的魚頭君開始逃跑
function fishHeadArmor() {
  const now = performance.now() / 1000, C = FISH_HEAD;
  for (const e of G.enemies) {
    const fire = e.fireDmg || 0, shock = e.shockDmg || 0;
    e.fireDmg = 0; e.shockDmg = 0;
    if (shock > 0 && e.shockResist != null && !e.dead) e.hp += shock * (1 - e.shockResist);   // 不怕電的怪物（小丑魚）：雷電傷害只吃 shockResist 倍
    if (e.behavior !== 'fishhead' || e.dead) continue;
    if (e.fhHp == null || e.hp > e.fhHp) { e.fhHp = e.hp; continue; }
    const lost = e.fhHp - e.hp;
    if (lost > 0) {
      if (e.fh) { if (!(e.fh.flee > 0) && now - (e.fhScaredAt || 0) > 1.5) { e.fhScaredAt = now; flash('！', e.x, e.y - (e.drawHeight || 80) - 22, '#bfe6ff', .6); } if (!(e.fh.flee > 0)) { e.fh.fleeDir = null; e.fh.hop = 0; } e.fh.flee = C.fleeTime; }   // 剛嚇到：彈一下   // 膽小：被打就逃
      const back = !!e.showBack, f = Math.min(lost, fire), sh = Math.min(lost - f, shock), other = lost - f - sh;
      e.hp = e.fhHp - (f * C.fireMul + sh * C.shockMul + other) * (back ? C.backMul : C.frontMul);
    }
    e.fhHp = e.hp;
  }
}

// ---- 每幀更新（game.js 的 update 呼叫）----
function updateFishHead(dt) {
  if (FISH_HEAD.testSpawn) fishTestSpawn(dt);
  if (G.enemies.some(e => e.fh && e.fh.spray)) updateFishSprays(dt);
  updateFishWater(dt);
}
// 測試用：開戰 1 秒後，在離溫特約 10 格、離哨兵至少 7 格的空地放一隻魚頭君（不會一出來就被打死）
function fishTestSpawn(dt) {
  if (G.fishTestDone || MAP_SAFE || !G.running || G.over || !G.player) return;
  G.fishTestT = (G.fishTestT || 0) + dt;
  if (G.fishTestT < 1) return;
  G.fishTestDone = true;
  const spec = ACTIVE_MONSTERS.find(m => m.id === 'fish_head'), p = G.player;
  if (!spec) return;
  for (const d of [10, 9, 11, 8, 12, 7]) for (let k = 0; k < 24; k++) {
    const a = k / 24 * Math.PI * 2, x = p.x + Math.cos(a) * d * CELL, y = p.y + Math.sin(a) * d * CELL, [c, r] = cellAt(x, y);
    if (!inGrid(c, r) || enemyBlocked(x, y)) continue;
    if (G.towers.some(t => t.hp > 0 && Math.hypot(t.x - x, t.y - y) < 7 * CELL)) continue;
    G.enemies.push(createMonster(spec, x, y));
    return;
  }
}

// ---- 繪圖 ----
// 地上的水漬、積水（畫在角色下面）
// 不規則的水灘外形：沿著一圈凹凸的點畫平滑曲線（k＝整體縮放，給漣漪用）
function puddlePath(ctx, p, rx, ry, k, now) {
  const sh = p.shape || [1, 1, 1, 1, 1, 1], n = sh.length, pts = [];
  for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2 + p.seed, f = sh[i] * (1 + Math.sin(now * 1.3 + p.seed + i * 1.7) * .025) * k;
    pts.push({ x: p.x + Math.cos(a) * rx * f, y: p.y + Math.sin(a) * ry * f });
  }
  const mid = i => { const a = pts[i % n], b = pts[(i + 1) % n]; return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; };
  ctx.beginPath(); const m0 = mid(n - 1); ctx.moveTo(m0.x, m0.y);
  for (let i = 0; i < n; i++) { const m = mid(i); ctx.quadraticCurveTo(pts[i].x, pts[i].y, m.x, m.y); }
  ctx.closePath();
}
// 跟史萊姆死掉的黏液區分：清水的樣子 → 不規則外形、透明淡藍、亮白色水邊、水面反光條、會一圈一圈擴散的漣漪、偶爾閃一下的亮點
function drawFishWater(ctx) {
  if (!G.waterPuddles || !G.waterPuddles.length) return;
  const now = performance.now() / 1000;
  ctx.save();
  for (const p of G.waterPuddles) {
    if (!isVisible(p.x, p.y)) continue;
    const fade = Math.min(1, p.t / Math.min(2, p.t0)), rx = p.r, ry = p.r * .5;
    // 水面：中間淡、邊緣稍深的透明藍
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rx);
    g.addColorStop(0, 'rgba(70,150,240,.42)'); g.addColorStop(.75, 'rgba(45,120,225,.55)'); g.addColorStop(1, 'rgba(110,180,250,.7)');
    ctx.globalAlpha = fade; ctx.fillStyle = g;
    puddlePath(ctx, p, rx, ry, 1, now); ctx.fill();
    // 亮白色水邊
    ctx.globalAlpha = .75 * fade; ctx.strokeStyle = '#e6f6ff'; ctx.lineWidth = p.r > 9 ? 1.5 : 1;
    puddlePath(ctx, p, rx, ry, 1, now); ctx.stroke();
    // 水面反光：左上兩條白色短弧
    ctx.globalAlpha = .85 * fade; ctx.lineWidth = Math.max(1, p.r * .08); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.ellipse(p.x, p.y, rx * .7, ry * .6, 0, Math.PI * 1.08, Math.PI * 1.42); ctx.stroke();
    if (p.r > 9) { ctx.beginPath(); ctx.ellipse(p.x, p.y, rx * .45, ry * .35, 0, Math.PI * 1.12, Math.PI * 1.3); ctx.stroke(); }
    if (p.r <= 9) continue;
    // 漣漪：每 1.8 秒從中間擴散出一圈
    const k = ((now + p.seed) % 1.8) / 1.8;
    ctx.globalAlpha = .5 * (1 - k) * fade; ctx.lineWidth = 1;
    puddlePath(ctx, p, rx, ry, .85 * k, now); ctx.stroke();
    // 偶爾閃一下的亮點
    const tw = Math.max(0, Math.sin(now * 2.2 + p.seed * 3));
    if (tw > .85) {
      const a = (tw - .85) / .15, sx = p.x + rx * .35, sy = p.y - ry * .25, L = 2 + p.r * .08;
      ctx.globalAlpha = a * fade; ctx.fillStyle = '#ffffff';
      ctx.fillRect(sx - L, sy - .5, L * 2, 1); ctx.fillRect(sx - .5, sy - L, 1, L * 2);
    }
  }
  ctx.restore();
}
// 飛行中的水柱、張嘴準備時嘴邊的水珠、打到的地方的水花（照參考圖：嘴巴端尖細、越往前越粗的拋物線水柱，白色反光線，白邊水花）
function drawFishSprays(ctx) {
  ctx.save();
  const now = performance.now() / 1000, C = FISH_HEAD, W = C.streamWidth;
  for (const e of G.enemies) {   // 張嘴準備：嘴邊的水珠
    if (!(e.fh && e.fh.windup > 0) || e.dead || !isVisible(e.x, e.y)) continue;
    const m = fishMouth(e), k = Math.sin(now * 16) * .5 + .5;
    ctx.globalAlpha = .7 + .3 * k; ctx.fillStyle = C.streamColor;
    ctx.beginPath(); ctx.arc(m.x, m.y - m.z, 2.5 + k * 1.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(m.x - .8, m.y - m.z - .8, 1, 0, Math.PI * 2); ctx.fill();
  }
  // 水柱：同一次噴水的水滴依噴出順序連起來（前端 → 嘴巴），兩側往外推出寬度，填成一條「嘴巴尖、前端粗」的水流
  const groups = new Map();
  for (const d of G.fishDrops || []) { if (!groups.has(d.spray)) groups.set(d.spray, []); groups.get(d.spray).push(d); }
  for (const [s, list] of groups) {
    const e = list[0].owner;
    if (!list.some(d => isVisible(d.x, d.y))) continue;
    const pts = list.map(d => ({ x: d.x, y: d.y - d.z, gx: d.x, gy: d.y + 6 }));
    if (e && e.fh && e.fh.spray === s && !e.dead) { const m = fishMouth(e); pts.push({ x: m.x, y: m.y - m.z, gx: m.x, gy: m.y + 6 }); }   // 還在噴：接到嘴巴
    if (pts.length < 2) continue;
    const n = pts.length, attached = e && e.fh && e.fh.spray === s;
    // 每個點的寬度：前端（第 0 點）最粗，往嘴巴越來越細；已經離開嘴巴的水柱尾端也收細
    const width = i => { const k = i / (n - 1); return Math.max(1, W * Math.pow(1 - k, .8) * (attached ? 1 : Math.min(1, (n - 1 - i) / 3 + .3))); };
    const L = [], R = [];
    for (let i = 0; i < n; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
      let nx = -(b.y - a.y), ny = b.x - a.x; const len = Math.hypot(nx, ny) || 1; nx /= len; ny /= len;
      if (ny > 0) { nx = -nx; ny = -ny; }   // L 永遠是上緣
      const w = width(i) / 2;
      L.push({ x: pts[i].x + nx * w, y: pts[i].y + ny * w }); R.push({ x: pts[i].x - nx * w, y: pts[i].y - ny * w });
    }
    const smooth = (arr, first) => {   // 用中點做二次曲線，邊緣才會圓滑
      if (first) ctx.moveTo(arr[0].x, arr[0].y); else ctx.lineTo(arr[0].x, arr[0].y);
      for (let i = 1; i < arr.length - 1; i++) ctx.quadraticCurveTo(arr[i].x, arr[i].y, (arr[i].x + arr[i + 1].x) / 2, (arr[i].y + arr[i + 1].y) / 2);
      ctx.lineTo(arr[arr.length - 1].x, arr[arr.length - 1].y);
    };
    // 地上的影子
    ctx.globalAlpha = .13; ctx.strokeStyle = '#071015'; ctx.lineCap = 'round'; ctx.lineWidth = W * .7;
    ctx.beginPath(); ctx.moveTo(pts[0].gx, pts[0].gy); for (const q of pts) ctx.lineTo(q.gx, q.gy); ctx.stroke();
    // 水柱本體
    ctx.globalAlpha = .95; ctx.fillStyle = C.streamColor;
    ctx.beginPath(); smooth(L, true); smooth(R.slice().reverse(), false); ctx.closePath(); ctx.fill();
    // 前端圓頭
    ctx.beginPath(); ctx.arc(pts[0].x, pts[0].y, width(0) / 2, 0, Math.PI * 2); ctx.fill();
    // 白色反光：沿著上緣內側兩條（一長一短）
    const inner = (f, from, to) => { const arr = []; for (let i = Math.floor(n * from); i <= Math.min(n - 1, Math.ceil(n * to)); i++) arr.push({ x: pts[i].x + (L[i].x - pts[i].x) * f, y: pts[i].y + (L[i].y - pts[i].y) * f }); return arr; };
    ctx.strokeStyle = '#ffffff'; ctx.lineCap = 'round';
    const h1 = inner(.5, .08, .7), h2 = inner(.15, .05, .3);
    if (h1.length > 1) { ctx.globalAlpha = .95; ctx.lineWidth = Math.max(1.2, W * .14); ctx.beginPath(); smooth(h1, true); ctx.stroke(); }
    if (h2.length > 1) { ctx.globalAlpha = .8; ctx.lineWidth = Math.max(1, W * .1); ctx.beginPath(); smooth(h2, true); ctx.stroke(); }
  }
  // 打到的地方：白邊水花＋往外噴的白色小水珠
  for (const q of G.fishSplashes || []) {
    if (!isVisible(q.x, q.y)) continue;
    const a = Math.min(1, q.t / .15), base = q.y - Math.max(4, q.z * .5), wob = t => Math.sin(now * 14 + q.seed + t) * 1.2;
    const S = C.splashSize, blobs = [[0, 0, 7], [-7 * q.ux, -3, 5], [6, -4, 4.5], [-5, 2, 4], [4, 3, 4.2], [0, -7, 3.5]].map(([x, y, r]) => [x * S, y * S, r * S]);
    ctx.globalAlpha = a;
    ctx.fillStyle = '#ffffff';   // 白邊
    for (const [dx, dy, r] of blobs) { ctx.beginPath(); ctx.arc(q.x + dx + wob(dx), base + dy, r + 2, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = C.streamColor;
    for (const [dx, dy, r] of blobs) { ctx.beginPath(); ctx.arc(q.x + dx + wob(dx), base + dy, r, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#ffffff';
    for (let k = 0; k < 5; k++) {   // 噴出去的小水珠
      const ang = q.seed + k * 1.3, r = (10 + ((q.age * 40 + k * 5) % 10)) * S;
      ctx.beginPath(); ctx.arc(q.x + Math.cos(ang) * r, base + Math.sin(ang) * r * .6 - 2, (k % 2 ? 1.6 : 2.4) * Math.sqrt(S), 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
}
