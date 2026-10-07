// ============================================================
//  油桶／油箱：可以破壞，被「會點火的人」打爆會爆炸並燃燒；
//  被怪物或其他人打壞則只會漏出一灘油汙，油汙之後被點火的人打到也會燒起來。
//  （數值集中在最上面，想調整改這裡就好）
// ============================================================

// 油桶被這些人打爆時會爆炸（其他人打壞只會漏油）；爆炸與火焰本身也會引燃（連鎖）。
// 實際上哨兵不會主動打油桶，只有玩家開槍、或安柏／希奧妮不小心波及（見下方 OIL_ACCIDENT）。
const OIL_IGNITERS = new Set(['player', 'eldrin', 'chris', 'amber', 'theonie', 'explosion', 'fire']);

// blast：爆炸半徑（格）與傷害；fire：爆炸後留下的火海（半徑、秒數、每秒傷害）；slick：沒爆炸時漏出的油汙（半徑、留多久）
const OIL_ITEMS = {
  deco_oil_drum: { name: '油桶', file: 'images/item-decorate/oil-drum.png',
    blast: { radius: 2, enemy: 80, sentry: 35, player: 30 },
    fire: { radius: 1.7, life: 6, dps: 12 },
    slick: { radius: 1.2, life: 40 } },
  deco_oil_tank: { name: '油箱', file: 'images/item-decorate/oil-tank.png',
    blast: { radius: 1.4, enemy: 50, sentry: 22, player: 20 },
    fire: { radius: 1.2, life: 5, dps: 10 },
    slick: { radius: .85, life: 40 } },
};
// 油汙被點燃後的火海：半徑是油汙的幾倍、燒幾秒、每秒傷害
const SLICK_FIRE = { radiusMul: 1.15, life: 6, dps: 10 };
const FIRE_TICK = 1;   // 火海每隔幾秒燙一次（同時站在好幾片火裡也只吃最燙的那片）

const oilItem = o => o && OIL_ITEMS[o.type];
function oilItemByFile(file) {
  const f = String(file || '').replace(/\\/g, '/');
  return Object.entries(OIL_ITEMS).find(([, it]) => it.file === f) || null;
}
// 油桶站立的位置（最下面那一格的中心）
function oilCenter(o) {
  return { x: OX + (o.c + (o.w || 1) / 2) * CELL, y: OY + (o.r + (o.h || 1) - .5) * CELL };
}
// 給玩家瞄準用的「假目標」：跟怪物一樣有 x／y／hp，打中時轉成對油桶的傷害
function oilProxy(o) {
  if (!o.proxy) { const p = oilCenter(o); o.proxy = { x: p.x, y: p.y, hp: 1, maxhp: 1, oilRef: o }; }
  return o.proxy;
}

// ---- 傷害油桶（source：'player'、哨兵種類、'monster'、'explosion'、'fire'…）----
function damageOil(o, amount, source) {
  if (!o || o.hp <= 0 || !G.obstacles.includes(o)) return;
  o.lastHitBy = source;
  o.hp -= amount; o.hitT = HIT_DUR;
  if (o.proxy) o.proxy.hp = 1;   // 假目標的血量不會真的減少
  flashDmg('-' + Math.round(amount), oilCenter(o).x, oilCenter(o).y - 30, '#ffb070');
  if (o.hp <= 0) destroyObstacleNow(o);
}
function destroyObstacleNow(o) {
  removeBarrier(o);   // removeBarrier 會呼叫 onObstacleRemoved → 決定爆炸或漏油
  for (const t of G.towers) { t.navPath = null; t.navGoal = null; t.navTimer = 0; }
  for (const e of G.enemies) { e.aiPath = null; e.aiGoal = null; e.aiRouteTimer = 0; }
  if (typeof computeFlow === 'function') computeFlow();
}
// build.js 的 removeBarrier 拆掉任何障礙物時都會呼叫這裡
function onObstacleRemoved(o) {
  const it = oilItem(o);
  if (!it) return;
  if (o.proxy) { o.proxy.dead = true; o.proxy.hp = 0; }
  if (o.lastHitBy === 'demolish') return;   // 自己拆除：安全移除，什麼都不會發生
  const p = oilCenter(o);
  if (OIL_IGNITERS.has(o.lastHitBy)) oilExplode(p.x, p.y, it);
  else addOilSlick(p.x, p.y, it.slick.radius * CELL, it.slick.life);
}

// ---- 爆炸 ----
// 被爆風震退（隊友、玩家）：閃紅、往外滑、跳傷害數字（滑行由 berserk-fx.js 的 updateKnockSlide 處理）
function blastPush(o, x, y, hurt, numY) {
  const dx = o.x - x, dy = o.y - y, d = Math.hypot(dx, dy) || 1, dist = CELL * .9, T = .18;
  o.knockT = T; o.knockVX = dx / d * dist / T; o.knockVY = dy / d * dist / T;
  o.hitT = Math.max(o.hitT || 0, .32); o.hitColor = '#ff8a3a';
  flashDmg('-' + Math.round(hurt), o.x, o.y - numY, '#ff9a3c');
}
function oilExplode(x, y, it) {
  const B = it.blast, R = B.radius * CELL;
  for (const e of G.enemies) {
    if (e.dead || e.hp <= 0) continue;
    const d = Math.hypot(e.x - x, e.y - y);
    if (d > R || !hasLineOfSight(x, y, e.x, e.y)) continue;
    const k = 1 - .4 * d / R;   // 越靠近中心越痛
    e.hp -= B.enemy * k; e.hitT = .2; e.hitColor = '#ff9a3c';
    flashDmg('-' + Math.round(B.enemy * k), e.x, e.y - 26, '#ff9a3c');
    enemyHitReact(e, x, y, true);
  }
  for (const t of G.towers) {
    if (t.hp <= 0) continue;
    const d = Math.hypot(t.x - x, t.y - y);
    if (d > R || !hasLineOfSight(x, y, t.x, t.y)) continue;
    const def = Math.max(0, Math.min(.75, TYPES[t.type]?.defense || 0));
    const hurt = B.sentry * (1 - .4 * d / R) * (1 - def);
    t.hp = Math.max(0, t.hp - hurt);
    blastPush(t, x, y, hurt, 30);
    if (t.hp <= 0) { t.target = null; sentryStatus(t, '失去戰鬥能力', '#ff5b6e', true); }
  }
  const p = G.player;
  if (p && p.hp > 0) {
    const d = Math.hypot(p.x - x, p.y - y);
    if (d <= R && hasLineOfSight(x, y, p.x, p.y)) {
      const hurt = B.player * (1 - .4 * d / R);
      p.hp = Math.max(0, p.hp - hurt); G.damageVignetteT = .5;
      blastPush(p, x, y, hurt, 46);
      if (p.hp <= 0 && !G.over) { flash('部隊長失去戰鬥能力', p.x, p.y - 58, '#ff5b6e'); lose('player'); }
    }
  }
  // 連鎖：範圍內的其他油桶也被炸爆、油汙被點燃
  for (const o of [...G.obstacles]) {
    if (!oilItem(o) || o.hp <= 0) continue;
    const c = oilCenter(o);
    if (Math.hypot(c.x - x, c.y - y) <= R) damageOil(o, 9999, 'explosion');
  }
  for (const o of G.obstacles) {   // 地雷也會被引爆
    if (!o.trap || o.hp <= 0 || o.fuseT > 0) continue;
    if (Math.hypot(OX + (o.c + .5) * CELL - x, OY + (o.r + .5) * CELL - y) <= R) o.fuseT = .15 + Math.random() * .1;
  }
  igniteSlicksNear(x, y, R);
  addOilFire(x, y, it.fire.radius * CELL, it.fire.life, it.fire.dps);
  // 畫面：爆閃、雙層衝擊環、火星、碎片、黑煙、焦痕
  if (typeof addLightFlash === 'function') addLightFlash('explosion', x, y);
  G.effects.push({ fglow: true, x, y: y - 8, r0: 20, r1: R * 1.15, life: .45, life0: .45 });
  G.effects.push({ ring: true, x, y, r: 12, r2: R, life: .45, life0: .45, color: '#ff8a3a' });
  G.effects.push({ ring: true, x, y, r: 6, r2: R * .6, life: .3, life0: .3, color: '#fff0c0' });
  for (let i = 0; i < 22; i++) {
    const a = Math.random() * Math.PI * 2, sp = 100 + Math.random() * 170;
    G.effects.push({ ember: true, spark: true, x, y: y - 8, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * .6 - 40,
      r: 1.5 + Math.random() * 3, life: .4 + Math.random() * .4, life0: .8 });
  }
  for (let i = 0; i < 6; i++) pushBlackSmoke(x + (Math.random() * 2 - 1) * R * .4, y - 10 - Math.random() * 10, true);
  for (let i = 0; i < 4; i++) spawnFlameBurst(x + (Math.random() * 2 - 1) * R * .35, y + (Math.random() * 2 - 1) * R * .2, 1.3);
  addScorchMark(x, y + 6, R * .75, null, 'flame');
  nearbyImpact(x, y, 13, .08);
  if (typeof sfxAt === 'function') sfxAt(Math.random() < .5 ? 'midBoom' : 'bigBoom', x, y, .9, 'oil-boom');   // 隨機：中爆炸／爆炸
}

// ---- 油汙 ----
function addOilSlick(x, y, r, life) {
  (G.oilSlicks = G.oilSlicks || []).push({ x, y: y + 6, r, t: life, t0: life, shape: scorchShape(r, 20), ph: Math.random() * 6.28 });
  if (typeof sfxAt === 'function') sfxAt('knock2', x, y, .5, 'oil-leak');
  flash('漏油了', x, y - 30, '#d9c48a');
}
function slickContains(s, x, y) { const dx = x - s.x, dy = (y - s.y) / .6; return dx * dx + dy * dy <= s.r * s.r; }
// 在 (x, y) 半徑 r 內碰到的油汙全部點燃
function igniteSlicksNear(x, y, r = 0) {
  if (!G.oilSlicks) return;
  for (const s of G.oilSlicks) {
    if (s.lit || s.t <= 0) continue;
    if (Math.hypot(s.x - x, s.y - y) <= s.r + r) igniteSlick(s);
  }
}
function igniteSlick(s) {
  if (!s || s.lit) return;
  s.lit = true; s.t = 0;
  if (s.proxy) { s.proxy.dead = true; s.proxy.hp = 0; }
  addOilFire(s.x, s.y, s.r * SLICK_FIRE.radiusMul, SLICK_FIRE.life, SLICK_FIRE.dps);
  for (let i = 0; i < 3; i++) spawnFlameBurst(s.x + (Math.random() * 2 - 1) * s.r * .5, s.y + (Math.random() * 2 - 1) * s.r * .3, 1.1);
  if (typeof addLightFlash === 'function') addLightFlash('flame', s.x, s.y);
  if (typeof sfxAt === 'function') sfxAt('fireImpact', s.x, s.y, .7, 'oil-ignite');
  flash('起火了！', s.x, s.y - 30, '#ff9a3c');
}
// 玩家開槍：子彈飛行的線段穿過油汙就點燃
function igniteSlicksOnLine(x0, y0, x1, y1) {
  if (!G.oilSlicks) return;
  for (const s of G.oilSlicks) {
    if (s.lit || s.t <= 0) continue;
    const dx = x1 - x0, dy = y1 - y0, L2 = dx * dx + dy * dy || 1;
    const k = Math.max(0, Math.min(1, ((s.x - x0) * dx + (s.y - y0) * dy) / L2));
    if (Math.hypot(x0 + dx * k - s.x, y0 + dy * k - s.y) <= s.r * .9) igniteSlick(s);
  }
}

// ---- 火海 ----
function addOilFire(x, y, r, life, dps) {
  (G.oilFires = G.oilFires || []).push({ x, y, r, t: life, t0: life, dps, flameT: 0, smokeT: 0 });
}

// ---- 哨兵不會主動打油桶或油汙（要不要射爆由玩家決定）----
// 但安柏、希奧妮攻擊怪物時，攻擊落點附近的油桶會被波及而立刻爆炸、油汙會被點燃（不小心的）。
// accidentRadius：落點周圍多少格內的油桶算被波及（有範圍攻擊時取範圍和這個值較大的那個）
const OIL_ACCIDENT = { types: new Set(['amber', 'theonie']), accidentRadius: 1.5 };
function onSentryHitOil(t, target, dmg, impact, splashR) {
  if (!OIL_ACCIDENT.types.has(t.type) || !impact) return;
  const R = Math.max(splashR || 0, OIL_ACCIDENT.accidentRadius * CELL);
  for (const o of [...G.obstacles]) {
    if (!oilItem(o) || o.hp <= 0) continue;
    const c = oilCenter(o);
    if (Math.hypot(c.x - impact.x, c.y - impact.y) <= R) damageOil(o, 9999, t.type);   // 火焰、雷電濺到油桶：一下就點著引爆
  }
  igniteSlicksNear(impact.x, impact.y, R);
}

// ---- 每幀更新（在 update 裡呼叫）----
function updateOil(dt) {
  if (G.oilSlicks) {
    for (const s of G.oilSlicks) if (!s.lit) s.t -= dt;
    G.oilSlicks = G.oilSlicks.filter(s => !s.lit && s.t > 0);
  }
  if (!G.oilFires || !G.oilFires.length) return;
  const fireDps = o => {   // 站在哪幾片火裡 → 取最燙的那片
    let best = 0;
    for (const f of G.oilFires) if (f.t > 0 && Math.hypot(o.x - f.x, (o.y - f.y) / .7) <= f.r) best = Math.max(best, f.dps);
    return best;
  };
  const fireTick = o => {
    const dps = fireDps(o);
    if (!dps) { o.fireT = FIRE_TICK * .5; return 0; }   // 踩進火裡 0.5 秒就開始燙
    o.fireT = (o.fireT ?? FIRE_TICK * .5) - dt;
    if (o.fireT > 0) return 0;
    o.fireT += FIRE_TICK;
    return dps * FIRE_TICK;
  };
  for (const e of G.enemies) {
    if (e.dead) continue;
    const d = fireTick(e); if (!d) continue;
    e.hp -= d; e.hitT = Math.max(e.hitT || 0, .16); e.hitColor = '#ff8a3a';
    flashDmg('-' + Math.round(d), e.x, e.y - 26, '#ff9a3c');
  }
  for (const t of G.towers) {
    if (t.hp <= 0) continue;
    const d = fireTick(t); if (!d) continue;
    const def = Math.max(0, Math.min(.75, TYPES[t.type]?.defense || 0)), hurt = d * (1 - def);
    t.hp = Math.max(0, t.hp - hurt); t.hitT = Math.max(t.hitT || 0, .2); t.hitColor = '#ff8a3a';
    flashDmg('-' + Math.round(hurt), t.x, t.y - 30, '#ff9a3c');
    if (t.hp <= 0) { t.target = null; sentryStatus(t, '失去戰鬥能力', '#ff5b6e', true); }
  }
  const p = G.player;
  if (p && p.hp > 0) {
    const d = fireTick(p);
    if (d) {
      p.hp = Math.max(0, p.hp - d); p.hitT = Math.max(p.hitT || 0, .3); G.damageVignetteT = Math.max(G.damageVignetteT || 0, .35);
      flashDmg('-' + Math.round(d), p.x, p.y - 46, '#ff9a3c');
      if (p.hp <= 0 && !G.over) { flash('部隊長失去戰鬥能力', p.x, p.y - 58, '#ff5b6e'); lose('player'); }
    }
  }
  for (const f of G.oilFires) {
    f.t -= dt;
    // 火會延燒：碰到的油汙被點燃、碰到的油桶被燒爆
    igniteSlicksNear(f.x, f.y, f.r * .6);
    for (const o of [...G.obstacles]) {
      if (!oilItem(o) || o.hp <= 0) continue;
      const c = oilCenter(o);
      if (Math.hypot(c.x - f.x, c.y - f.y) <= f.r) damageOil(o, 30 * dt, 'fire');
    }
    // 火焰、黑煙
    const k = Math.min(1, f.t / 1.5);   // 最後 1.5 秒火勢變小
    f.flameT -= dt;
    if (f.flameT <= 0 && f.t > .3) {
      f.flameT = (.1 + Math.random() * .12) / Math.max(.4, k);
      const a = Math.random() * Math.PI * 2, rr = Math.sqrt(Math.random()) * f.r * .85;
      spawnFlameBurst(f.x + Math.cos(a) * rr, f.y + Math.sin(a) * rr * .6, .55 + .45 * k);
    }
    f.smokeT -= dt;
    if (f.smokeT <= 0 && f.t > .3) {
      f.smokeT = .25 + Math.random() * .25;
      pushBlackSmoke(f.x + (Math.random() * 2 - 1) * f.r * .6, f.y - 8, false);
    }
    if (f.t <= 0 && !f.scorched) { f.scorched = true; addScorchMark(f.x, f.y, f.r * .9, null, 'flame'); }
  }
  G.oilFires = G.oilFires.filter(f => f.t > 0);
}

// ---- 繪製（地面層：油汙、火海底下的橘光）----
function drawOilGround(ctx) {
  if (G.oilSlicks) for (const s of G.oilSlicks) {
    const a = Math.min(1, s.t / 5) * Math.min(1, (s.t0 - s.t) / .4 + .2);   // 漏出時擴散、最後 5 秒淡掉
    const grow = Math.min(1, (s.t0 - s.t) / .6 + .3);
    ctx.save(); ctx.translate(s.x, s.y); ctx.scale(1, .6);
    const g = ctx.createRadialGradient(-s.r * .2, -s.r * .2, 0, 0, 0, s.r);
    g.addColorStop(0, `rgba(48,40,30,${(.85 * a).toFixed(3)})`);
    g.addColorStop(.7, `rgba(30,24,18,${(.8 * a).toFixed(3)})`);
    g.addColorStop(1, `rgba(18,14,10,${(.6 * a).toFixed(3)})`);
    ctx.fillStyle = g; scorchPath(ctx, s.shape, grow); ctx.fill();
    // 油膜的彩虹反光（緩慢流動），提醒玩家這灘油可以點燃
    const sh = performance.now() / 1400 + s.ph;
    const sg = ctx.createLinearGradient(-s.r, -s.r * .5, s.r, s.r * .5);
    sg.addColorStop(0, 'rgba(120,60,200,0)');
    sg.addColorStop(.5 + .3 * Math.sin(sh), `rgba(80,200,210,${(.22 * a).toFixed(3)})`);
    sg.addColorStop(1, 'rgba(230,150,60,0)');
    ctx.fillStyle = sg; scorchPath(ctx, s.shape, grow * .75); ctx.fill();
    ctx.restore();
  }
  if (G.oilFires) for (const f of G.oilFires) {
    const k = Math.min(1, f.t / 1.5, (f.t0 - f.t) / .2);
    const flick = .85 + .15 * Math.sin(performance.now() / 70 + f.x);
    ctx.save(); ctx.translate(f.x, f.y); ctx.scale(1, .7);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, f.r);
    g.addColorStop(0, `rgba(255,180,70,${(.45 * k * flick).toFixed(3)})`);
    g.addColorStop(.6, `rgba(230,90,30,${(.3 * k * flick).toFixed(3)})`);
    g.addColorStop(1, 'rgba(120,30,10,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, f.r, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
}
