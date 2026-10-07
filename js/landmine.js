// ============================================================
//  地雷：埋在地上、不擋路。怪物踩到 → 閃紅燈「嗶」一聲 → 爆炸。
//  哨兵、嚮導、玩家踩到不會爆，但爆炸時站在旁邊一樣會被炸傷；怪物也不知道地雷在哪，不會特地去拆。
//  （數值集中在最上面，想調整改這裡就好；建造費用在 data/objects.js）
// ============================================================
// trigger：怪物離地雷中心多近算踩到（格）；fuse：踩到後幾秒爆炸
// radius：爆炸半徑（格）；damage：爆炸中心對怪物的傷害；sentry／player：爆炸中心對隊友、玩家的傷害（邊緣都約 6 成）
const LANDMINE = { trigger: .45, fuse: 1, radius: 1.6, damage: 150, sentry: 60, player: 40 };

const isLandmine = o => !!(o && o.trap);
function mineCenter(o) { return { x: OX + (o.c + .5) * CELL, y: OY + (o.r + .5) * CELL }; }
function landmineAt(c, r) { return G.obstacles.find(o => isLandmine(o) && o.c === c && o.r === r) || null; }

// ---- 每幀更新（在 update 裡呼叫）----
function updateLandmines(dt) {
  for (const o of [...G.obstacles]) {
    if (!isLandmine(o) || o.hp <= 0) continue;
    const p = mineCenter(o);
    if (o.fuseT > 0) {   // 已經被踩到：倒數爆炸
      o.fuseT -= dt;
      if (o.fuseT <= 0) detonateMine(o);
      continue;
    }
    const stepped = G.enemies.some(e => !e.dead && e.hp > 0 && Math.hypot(e.x - p.x, e.y - p.y) <= LANDMINE.trigger * CELL);
    if (stepped) {
      o.fuseT = LANDMINE.fuse;
      if (typeof sfxAt === 'function') sfxAt('mineBeep', p.x, p.y, .8, 'mine-beep');   // 先「嗶嗶」，引信 1 秒後才爆
      flash('喀！', p.x, p.y - 26, '#ff6b5b', .6);
    }
  }
}

// ---- 爆炸 ----
function detonateMine(o) {
  if (!G.obstacles.includes(o)) return;
  const { x, y } = mineCenter(o);
  o.lastHitBy = 'demolish';   // 從清單移除時不要觸發其他效果
  removeBarrier(o);
  const R = LANDMINE.radius * CELL;
  for (const e of G.enemies) {   // 怪物
    if (e.dead || e.hp <= 0) continue;
    const d = Math.hypot(e.x - x, e.y - y);
    if (d > R || !hasLineOfSight(x, y, e.x, e.y)) continue;
    const dmg = LANDMINE.damage * (1 - .4 * d / R);
    e.hp -= dmg; e.hitT = .2; e.hitColor = '#ff9a3c';
    flashDmg('-' + Math.round(dmg), e.x, e.y - 26, '#ff9a3c');
    enemyHitReact(e, x, y, true);
  }
  for (const t of G.towers) {   // 隊友也會被炸傷（依防禦減免）
    if (t.hp <= 0) continue;
    const d = Math.hypot(t.x - x, t.y - y);
    if (d > R || !hasLineOfSight(x, y, t.x, t.y)) continue;
    const def = Math.max(0, Math.min(.75, TYPES[t.type]?.defense || 0));
    const hurt = LANDMINE.sentry * (1 - .4 * d / R) * (1 - def);
    t.hp = Math.max(0, t.hp - hurt);
    blastPush(t, x, y, hurt, 30);
    if (t.hp <= 0) { t.target = null; sentryStatus(t, '失去戰鬥能力', '#ff5b6e', true); }
  }
  const pl = G.player;   // 玩家
  if (pl && pl.hp > 0) {
    const d = Math.hypot(pl.x - x, pl.y - y);
    if (d <= R && hasLineOfSight(x, y, pl.x, pl.y)) {
      const hurt = LANDMINE.player * (1 - .4 * d / R);
      pl.hp = Math.max(0, pl.hp - hurt); G.damageVignetteT = .5;
      blastPush(pl, x, y, hurt, 46);
      if (pl.hp <= 0 && !G.over) { flash('部隊長失去戰鬥能力', pl.x, pl.y - 58, '#ff5b6e'); lose('player'); }
    }
  }
  // 連鎖：引爆附近的油桶、點燃油汙、引爆附近的其他地雷
  for (const other of [...G.obstacles]) {
    if (other === o || other.hp <= 0) continue;
    if (typeof oilItem === 'function' && oilItem(other)) {
      const c = oilCenter(other);
      if (Math.hypot(c.x - x, c.y - y) <= R) damageOil(other, 9999, 'explosion');
    } else if (isLandmine(other) && !(other.fuseT > 0)) {
      const c = mineCenter(other);
      if (Math.hypot(c.x - x, c.y - y) <= R) other.fuseT = .15 + Math.random() * .1;
    }
  }
  if (typeof igniteSlicksNear === 'function') igniteSlicksNear(x, y, R);
  // 畫面：爆閃、衝擊環、火星、碎石、黑煙、焦痕
  if (typeof addLightFlash === 'function') addLightFlash('explosion', x, y);
  G.effects.push({ fglow: true, x, y: y - 6, r0: 16, r1: R, life: .35, life0: .35 });
  G.effects.push({ ring: true, x, y, r: 8, r2: R, life: .4, life0: .4, color: '#ffb060' });
  G.effects.push({ ring: true, x, y, r: 4, r2: R * .55, life: .26, life0: .26, color: '#fff0c8' });
  for (let i = 0; i < 18; i++) {
    const a = Math.random() * Math.PI * 2, sp = 90 + Math.random() * 150;
    G.effects.push({ ember: true, spark: true, x, y: y - 6, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * .6 - 50,
      r: 1.5 + Math.random() * 2.5, life: .35 + Math.random() * .3, life0: .65 });
  }
  if (typeof spawnGoo === 'function') spawnGoo(x, y - 4, '#6d6458', 10, 1.3);   // 炸飛的泥土碎石
  for (let i = 0; i < 4; i++) pushBlackSmoke(x + (Math.random() * 2 - 1) * 12, y - 8, true);
  addScorchMark(x, y + 4, R * .55, null, 'flame');
  nearbyImpact(x, y, 11, .07);
  if (typeof sfxAt === 'function') sfxAt('smallBoom', x, y, .9, 'mine-boom');
}

// ---- 繪製（地面層，在角色腳下）----
function drawLandmines(ctx) {
  const now = performance.now() / 1000;
  for (const o of G.obstacles) {
    if (!isLandmine(o)) continue;
    const img = obstacleImgs[o.type] && obstacleImgs[o.type].h;
    const x = OX + o.c * CELL, y = OY + o.r * CELL;
    if (img && img.complete && img.naturalWidth) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, x, y, CELL, CELL);
    } else {
      ctx.fillStyle = '#5a5e3a'; ctx.beginPath(); ctx.arc(x + CELL / 2, y + CELL / 2, CELL * .32, 0, Math.PI * 2); ctx.fill();
    }
    // 中間的小指示燈：平常慢慢閃綠光；被踩到後快速閃紅光
    const armed = o.fuseT > 0;
    const on = armed ? Math.sin(now * 40) > 0 : (now * 1.2 + o.c * .37) % 1 < .12;
    if (on) {
      const cx = x + CELL / 2, cy = y + CELL / 2;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, armed ? 14 : 6);
      g.addColorStop(0, armed ? 'rgba(255,70,50,.95)' : 'rgba(120,255,120,.8)');
      g.addColorStop(1, armed ? 'rgba(255,40,30,0)' : 'rgba(80,220,80,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, armed ? 14 : 6, 0, Math.PI * 2); ctx.fill();
    }
  }
}
