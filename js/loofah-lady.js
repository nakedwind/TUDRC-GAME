/* ===== 絲瓜小姐（behavior: "vine"）=====
   ・看到玩家或哨兵就走近；進到射程後抬腳（stomp 圖）→ 重踏地面，畫面震一下。
   ・絲瓜藤鑽進地底，朝目標「踏下去那一刻的位置」往前鑽：地上一路冒出煙塵、留下裂痕，提示藤蔓往哪裡去。
   ・鑽到底就從地面冒出來：範圍內的玩家和隊友都會被纏住，LOOFAH.rootTime 秒不能移動（還是可以開槍、攻擊），之後放開。
   ・看到煙塵就快點閃開！被纏住時連按方向鍵可以掙扎，縮短被纏的時間（隊友會自己扭動，但時間照舊）。
   必須在 enemy-ai.js 之後、game.js 之前載入。數值在下面的 LOOFAH。
*/
const LOOFAH = {
  noticeRange: 8,       // 看到玩家／哨兵的距離（格）
  loseRange: 13,        // 追多遠就放棄（格）
  stompRange: 5.5,      // 幾格內會踏地放藤蔓
  keepDistance: 2.5,    // 太近會稍微退開（格）
  windup: 0.55,         // 抬腳多久才踏下去（秒）
  recover: 0.45,        // 踏完腳收回的時間（秒）
  cooldown: 5.5,        // 兩次踏地之間隔幾秒
  vineSpeed: 170,       // 藤蔓在地底鑽的速度（像素／秒）
  vineOvershoot: 0.4,   // 藤蔓會比目標位置多鑽幾格
  eruptRadius: 34,      // 冒出來時抓人的範圍（像素）
  rootTime: 5,
  struggleCut: 0.25,    // 被纏住時每「按一下」方向鍵，少纏幾秒（拚命連按約 2 秒就能掙脫）
  struggleMin: 1,       // 至少被纏幾秒才可能掙脫          // 被纏住幾秒
  testSpawn: true,      // 測試用：開始戰鬥時在離溫特約 20 格的地方直接放一隻（測完改成 false）
  testSpawnDist: 20,    // 測試用：離溫特幾格
  eruptDamage: true,    // 冒出來時造成一次傷害（怪物編輯器的「玩家傷害／哨兵傷害」）
  wanderRadius: 2.5, wanderSpeedMul: 0.55, idleMin: 1.5, idleMax: 3.5,
  stompFrame: 'images/monster/loofah-lady/loofah-lady-stomp.png',
  stepEvery: 20,        // 走幾像素響一次腳步聲
};
const llRand = (a, b) => a + Math.random() * (b - a);

// ---- 目標 ----
function llTargets(e) {
  const list = [], p = G.player;
  if (p && p.hp > 0) list.push(p);
  for (const t of G.towers) if (t.hp > 0 && !t.berserk && enemyNoticesSentry(e, t)) list.push(t);
  return list;
}
function llPickTarget(e) {
  const dist = t => Math.hypot(t.x - e.x, t.y - e.y), targets = llTargets(e);
  if ((e.playerAggroT || 0) > 0 && targets.includes(G.player) && dist(G.player) <= ENEMY_SENSE_RANGE) return G.player;
  if (e.sentryAggroT > 0 && targets.includes(e.sentryAggro) && dist(e.sentryAggro) <= ENEMY_SENSE_RANGE) return e.sentryAggro;
  let best = null, bestD = LOOFAH.noticeRange * CELL;
  for (const t of targets) { const d = dist(t); if (d <= bestD && hasLineOfSight(e.x, e.y, t.x, t.y)) { best = t; bestD = d; } }
  return best;
}

// ---- 行為（enemy-ai.js 的 stepEnemy 呼叫）----
function stepVineEnemy(e, dt) {
  const C = LOOFAH;
  if (!e.ll) e.ll = { cd: 1 + Math.random() * 1.5, wait: Math.random() * 2 };
  const ll = e.ll;
  ll.cd -= dt;
  // 腳步聲：走路動畫每 10 像素換一張（js/render.js），4 張一輪踏兩步 → 每走 20 像素響一聲
  const moved = ll.lx == null ? 0 : Math.hypot(e.x - ll.lx, e.y - ll.ly);
  ll.lx = e.x; ll.ly = e.y;
  if (moved > .2 && moved < 20) {
    ll.stepDist = (ll.stepDist || 0) + moved;
    if (ll.stepDist >= C.stepEvery) { ll.stepDist = 0; if (typeof sfxAt === 'function') sfxAt('loofahStep', e.x, e.y, .4, 'loofah-step'); }   // 黑暗中也聽得到（越遠越小聲）
  }
  if (e.stunT > 0) { ll.windup = 0; ll.recover = 0; e.forceFrame = null; return; }
  // 抬腳 → 重踏
  if (ll.windup > 0) {
    ll.windup -= dt; e.forceFrame = C.stompFrame;
    if (ll.windup <= 0) loofahStomp(e);
    return;
  }
  if (ll.recover > 0) { ll.recover -= dt; return; }   // 踏完：站一下
  e.forceFrame = null;
  let target = llPickTarget(e);
  if (!target && ll.target && ll.target.hp > 0 && Math.hypot(ll.target.x - e.x, ll.target.y - e.y) <= C.loseRange * CELL) target = ll.target;
  ll.target = target;
  if (target) {
    const d = Math.hypot(target.x - e.x, target.y - e.y);
    if (d <= C.stompRange * CELL && hasLineOfSight(e.x, e.y, target.x, target.y)) {
      if (d < C.keepDistance * CELL) moveEnemyToward(e, { x: e.x - (target.x - e.x), y: e.y - (target.y - e.y) }, dt * .6);
      if (ll.cd <= 0) { ll.windup = C.windup; ll.aim = target; e.faceRight = target.x > e.x; }
      return;
    }
    const [gc, gr] = cellAt(target.x, target.y);
    const nav = enemyNavigate(e, gc, gr, dt, 'loofah:' + gc + ',' + gr, true);
    if (nav && nav.blocker) enemyAttackObstacle(e, nav.blocker, dt);
    return;
  }
  // 沒事做：發呆、走走
  if (ll.spot) {
    const moved = moveEnemyToward(e, ll.spot, dt * C.wanderSpeedMul);
    if (!moved || Math.hypot(ll.spot.x - e.x, ll.spot.y - e.y) <= 3) { ll.spot = null; ll.wait = llRand(C.idleMin, C.idleMax); }
    return;
  }
  ll.wait -= dt;
  if (ll.wait <= 0) {
    for (let i = 0; i < 8; i++) {
      const a = Math.random() * Math.PI * 2, r = (.6 + Math.random() * (C.wanderRadius - .6)) * CELL, x = e.x + Math.cos(a) * r, y = e.y + Math.sin(a) * r;
      if (!enemyBlocked(x, y) && hasLineOfSight(e.x, e.y, x, y)) { ll.spot = { x, y }; break; }
    }
    ll.wait = llRand(C.idleMin, C.idleMax);
  }
}

// ---- 重踏：震動、揚塵，放出一條鑽地的藤蔓 ----
function loofahStomp(e) {
  const C = LOOFAH, ll = e.ll, t = ll.aim;
  ll.cd = C.cooldown; ll.recover = C.recover; e.forceFrame = null;
  G.effects.push({ ring: true, x: e.x, y: e.y + 12, r: 8, r2: 46, life: .35, life0: .35, color: '#b9a27a' });
  G.effects.push({ ring: true, x: e.x, y: e.y + 12, r: 4, r2: 28, life: .25, life0: .25, color: '#e3d3a8' });
  for (let i = 0; i < 8; i++) llDust(e.x + (Math.random() - .5) * 30, e.y + 12, 1);
  if (typeof nearbyImpact === 'function') nearbyImpact(e.x, e.y, 5, .1); else addShake(2);
  if (typeof sfxAt === 'function') sfxAt('loofahStomp', e.x, e.y, .8, 'loofah-stomp');
  if (!t || t.hp <= 0) return;
  const dx = t.x - e.x, dy = t.y - e.y, d = Math.hypot(dx, dy) || 1;
  const len = d + C.vineOvershoot * CELL;
  (G.loofahVines = G.loofahVines || []).push({ owner: e, x: e.x, y: e.y + 10, ux: dx / d, uy: dy / d, left: len, state: 'dig', t: 0, puff: 0, cracks: [], seed: Math.random() * 9 });
}
function llDust(x, y, big) {
  const n = big ? 2 : 1;
  for (let i = 0; i < n; i++)
    G.effects.push({ particle: true, kind: 'spark', x: x + (Math.random() - .5) * 8, y: y - 2, vx: (Math.random() - .5) * 30, vy: -(18 + Math.random() * 30),
      r: 2 + Math.random() * 2.5, life: .45 + Math.random() * .3, life0: .75, color: Math.random() < .5 ? '#a8936c' : '#cdbb91' });
}

// ---- 藤蔓：鑽地 → 冒出來纏人 → 放開（game.js 的 update 呼叫）----
function updateLoofahVines(dt) {
  if (LOOFAH.testSpawn) loofahTestSpawn(dt);
  if (G.loofahVines && G.loofahVines.length) {
    const C = LOOFAH;
    for (const v of G.loofahVines) {
      v.t += dt;
      if (v.state === 'dig') {
        let move = C.vineSpeed * dt;
        while (move > 0 && v.state === 'dig') {
          const s = Math.min(4, move); move -= s; v.left -= s;
          const nx = v.x + v.ux * s, ny = v.y + v.uy * s, [c, r] = cellAt(nx, ny);
          if (!inGrid(c, r) || isWall(c, r)) { v.left = 0; }   // 撞到牆：就在牆前冒出來
          else { v.x = nx; v.y = ny; }
          v.puff -= s;
          if (v.puff <= 0) { v.puff = 10; llDust(v.x, v.y, Math.random() < .4); v.cracks.push({ x: v.x, y: v.y, a: Math.atan2(v.uy, v.ux) + (Math.random() - .5) * .9, life: 1.4 }); }
          if (v.left <= 0) loofahErupt(v);
        }
      } else if (v.state === 'grab') {
        v.hold -= dt;
        for (const a of v.caught) if (a.hp <= 0) a.rootT = 0;
        if (v.hold <= 0 || !v.caught.some(a => a.rootT > 0 && a.hp > 0)) { v.state = 'retract'; v.rt = 0; for (const a of v.caught) a.rootT = 0; }
      } else if (v.state === 'retract') {
        v.rt += dt; if (v.rt > .35) v.done = true;
      }
      for (const k of v.cracks) k.life -= dt;
      v.cracks = v.cracks.filter(k => k.life > 0);
    }
    G.loofahVines = G.loofahVines.filter(v => !v.done || v.cracks.length);
  }
  // 被纏住的人：倒數
  const tick = a => {
    if (!a) return;
    if (a.struggleT > 0) a.struggleT = Math.max(0, a.struggleT - dt);
    if (!(a.rootT > 0)) return;
    a.rootT = Math.max(0, a.rootT - dt);
    if (a.rootT <= 0 && a === G.player && (a.struggleCount || 0) >= 2) loofahBreakFree(a);   // 掙脫
  };
  tick(G.player);
  for (const t of G.towers) {
    tick(t);
    if (t.rootT > 0 && !(t.struggleT > 0) && Math.random() < dt * 1.6) { t.struggleT = .18; t.struggleDir = [Math.random() < .5 ? -1 : 1, 0]; }   // 隊友自己扭動
  }
}
function loofahErupt(v) {
  const C = LOOFAH, e = v.owner;
  v.state = 'grab'; v.et = 0; v.eruptAt = performance.now() / 1000; v.hold = C.rootTime; v.caught = [];
  G.effects.push({ ring: true, x: v.x, y: v.y + 4, r: 6, r2: C.eruptRadius + 10, life: .3, life0: .3, color: '#7fbf5a' });
  for (let i = 0; i < 6; i++) llDust(v.x + (Math.random() - .5) * 26, v.y + 4, true);
  if (typeof sfxAt === 'function') sfxAt('loofahVine', v.x, v.y, .8, 'loofah-vine');
  const p = G.player, inR = a => Math.hypot(a.x - v.x, a.y - v.y) <= C.eruptRadius;
  if (p && p.hp > 0 && inR(p)) {
    v.caught.push(p); p.rootT = C.rootTime; p.rootT0 = C.rootTime; p.struggleCount = 0; p.knockT = 0; p.moving = false;
    if (C.eruptDamage && e) {
      const dmg = Math.round(typeof equipPlayerDamage === 'function' ? equipPlayerDamage(e.playerDamage ?? 6) : e.playerDamage ?? 6);
      p.hp = Math.max(0, p.hp - dmg); p.hitT = .35; p.underAttackT = 5; p.lastAttacker = e;
      G.damageVignetteT = Math.max(G.damageVignetteT || 0, .3);
      flashDmg('-' + dmg, p.x, p.y - 46, '#ff6b6b'); addShake(2);
      playPlayerHit(1, true);
      if (p.hp <= 0 && !G.over) { flash('部隊長失去戰鬥能力', p.x, p.y - 58, '#ff5b6e'); lose('player', '被' + monsterNameOf(e) + '的絲瓜藤纏住'); }
    }
  }
  for (const t of G.towers) {
    if (t.hp <= 0 || t.berserk || !inR(t)) continue;
    v.caught.push(t); t.rootT = C.rootTime; t.knockT = 0; t.navPath = null; t.navGoal = null;
    if (C.eruptDamage && e && !e.dead) { e.atkCd = 0; enemyAttackSentry(e, t, 0); t.knockT = 0; }
  }
  if (!v.caught.length) v.hold = .7;   // 沒抓到人：冒出來晃一下就縮回去
}
// 測試用：開戰 1 秒後，在離溫特約 testSpawnDist 格、離哨兵至少 6 格的空地放一隻（太遠放不下就慢慢往近處找）
function loofahTestSpawn(dt) {
  if (G.loofahTestDone || MAP_SAFE || !G.running || G.over || !G.player) return;
  G.loofahTestT = (G.loofahTestT || 0) + dt;
  if (G.loofahTestT < 1) return;
  G.loofahTestDone = true;
  const spec = ACTIVE_MONSTERS.find(m => m.id === 'loofah_lady'), p = G.player;
  if (!spec) return;
  const D = LOOFAH.testSpawnDist, dists = [];
  for (let k = 0; k <= D; k++) { dists.push(D + k); if (k) dists.push(D - k); }   // 20、21、19、22、18…
  for (const d of dists) if (d > 2) for (let k = 0; k < 32; k++) {
    const a = k / 32 * Math.PI * 2, x = p.x + Math.cos(a) * d * CELL, y = p.y + Math.sin(a) * d * CELL, [c, r] = cellAt(x, y);
    if (!inGrid(c, r) || enemyBlocked(x, y)) continue;
    if (G.towers.some(t => t.hp > 0 && Math.hypot(t.x - x, t.y - y) < 6 * CELL)) continue;
    G.enemies.push(createMonster(spec, x, y));
    return;
  }
}
// ---- 掙扎：被纏住時按方向鍵（WASD／方向鍵），每按一下少纏一點時間，身體朝那個方向扭 ----
const STRUGGLE_KEYS = { w: [0, -1], arrowup: [0, -1], s: [0, 1], arrowdown: [0, 1], a: [-1, 0], arrowleft: [-1, 0], d: [1, 0], arrowright: [1, 0] };
window.addEventListener('keydown', e => {
  if (e.repeat || typeof G === 'undefined' || !G) return;   // 按住不放不算，要一下一下按
  const dir = STRUGGLE_KEYS[String(e.key).toLowerCase()], p = G.player;
  if (!dir || !p || !(p.rootT > 0) || G.over || (typeof paused !== 'undefined' && paused)) return;
  loofahStruggle(p, dir);
});
function loofahStruggle(p, dir) {
  const C = LOOFAH, held = (p.rootT0 || C.rootTime) - p.rootT;
  p.struggleCount = (p.struggleCount || 0) + 1;
  p.struggleT = .18; p.struggleDir = dir;
  p.rootT = Math.max(p.rootT - C.struggleCut, C.struggleMin - held, 0);   // 至少要被纏 struggleMin 秒
  if (Math.random() < .5) G.effects.push({ particle: true, kind: 'spark', x: p.x + (Math.random() - .5) * 16, y: p.y + 4, vx: (Math.random() - .5) * 60, vy: -(20 + Math.random() * 30), r: 1.5 + Math.random(), life: .3, life0: .3, color: '#8fcf5e' });
  if (p.rootT <= 0) loofahBreakFree(p);
}
// 掙脫：藤蔓斷開、碎葉彈出來
function loofahBreakFree(p) {
  p.rootT = 0;
  flash('掙脫！', p.x, p.y - 64, '#c8f59a', .9);
  for (let i = 0; i < 10; i++) {
    const a = Math.random() * Math.PI * 2, sp = 60 + Math.random() * 90;
    G.effects.push({ particle: true, kind: 'spark', x: p.x, y: p.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * .6 - 30, r: 2 + Math.random() * 1.5, life: .4 + Math.random() * .25, life0: .65, color: i % 2 ? '#6fae4a' : '#a7dd7a' });
  }
  if (typeof sfxAt === 'function') sfxAt('swordSwing', p.x, p.y, .4, 'loofah-break');
}
// 畫人物時呼叫（render.js 的 drawPlayer／drawTower）：被纏住時以腳底為支點扭動
function applyStruggleTransform(ctx, a) {
  if (!(a && a.rootT > 0)) return;
  const now = performance.now() / 1000, k = (a.struggleT || 0) / .18, dir = a.struggleDir || [0, 0];
  const ang = Math.sin(now * 4.3 + (a.x % 7)) * .035 + dir[0] * .2 * k;   // 平常小小扭動；按下去那一刻用力歪
  const fx = a.x, fy = a.y + 16;
  ctx.translate(fx + dir[0] * 3 * k, fy + dir[1] * 2 * k); ctx.rotate(ang); ctx.translate(-fx, -fy);
}

// 被纏住的人不能移動（game.js 玩家移動、sentry.js 哨兵移動呼叫）
function isRooted(a) { return !!(a && a.rootT > 0); }

// ---- 繪圖 ----
// 地面：鑽地時的裂痕（畫在角色下面）
function drawLoofahGround(ctx) {
  for (const v of G.loofahVines || []) {
    ctx.save(); ctx.strokeStyle = '#4a3b26'; ctx.lineCap = 'round';
    for (const k of v.cracks) {
      if (!isVisible(k.x, k.y)) continue;
      ctx.globalAlpha = Math.min(1, k.life / .6) * .7; ctx.lineWidth = 2;
      const L = 7;
      ctx.beginPath(); ctx.moveTo(k.x - Math.cos(k.a) * L, k.y - Math.sin(k.a) * L * .5);
      ctx.lineTo(k.x + Math.cos(k.a + .5) * 3, k.y + Math.sin(k.a + .5) * 2);
      ctx.lineTo(k.x + Math.cos(k.a) * L, k.y + Math.sin(k.a) * L * .5); ctx.stroke();
    }
    if (v.state === 'dig' && isVisible(v.x, v.y)) {   // 鑽地的前端：隆起的小土堆
      ctx.globalAlpha = .85; ctx.fillStyle = '#7a6545';
      ctx.beginPath(); ctx.ellipse(v.x, v.y, 7, 3.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#9c8660'; ctx.beginPath(); ctx.ellipse(v.x - 1, v.y - 1, 4, 2, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
}
// 冒出地面的藤蔓、纏在人身上的藤蔓（畫在角色上面）
function drawLoofahVines(ctx) {
  const now = performance.now() / 1000;
  for (const v of G.loofahVines || []) {
    if (v.state === 'dig' || v.done || !isVisible(v.x, v.y)) continue;
    const grow = v.state === 'retract' ? Math.max(0, 1 - v.rt / .35) : Math.min(1, (now - v.eruptAt) / .22);
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    // 地上破開的洞
    ctx.globalAlpha = .55; ctx.fillStyle = '#3a2d1c';
    ctx.beginPath(); ctx.ellipse(v.x, v.y + 6, 16 * grow + 4, 6 * grow + 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
    if (v.caught.length) for (const a of v.caught) drawWrap(ctx, a, grow, now, v.seed);
    const p = G.player;
    if (p && p.rootT > 0 && v.caught.includes(p)) {   // 溫特頭上的掙扎進度條
      const T0 = p.rootT0 || LOOFAH.rootTime, prog = 1 - p.rootT / T0, bx = p.x - 22, by = p.y - 74;
      ctx.globalAlpha = .9; ctx.fillStyle = '#0d1218'; ctx.fillRect(bx - 1, by - 1, 46, 7);
      ctx.fillStyle = '#5f9c3e'; ctx.fillRect(bx, by, 44 * prog, 5);
      ctx.strokeStyle = '#c8f59a'; ctx.lineWidth = 1; ctx.strokeRect(bx - .5, by - .5, 45, 6);
      if ((p.struggleCount || 0) < 4) {
        ctx.font = 'bold 11px "Microsoft JhengHei", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
        const blink = .65 + .35 * Math.sin(now * 8);
        ctx.globalAlpha = blink; ctx.fillStyle = '#0d1218'; ctx.fillText('連按方向鍵掙扎！', p.x + 1, by - 2);
        ctx.fillStyle = '#e8ffd2'; ctx.fillText('連按方向鍵掙扎！', p.x, by - 3);
      }
      ctx.globalAlpha = 1;
    }
    else for (let k = 0; k < 4; k++) {   // 沒抓到人：幾根藤蔓從洞裡竄出來扭動
      const bx = v.x + (k - 1.5) * 8, h = (26 + k * 6) * grow, sw = Math.sin(now * 6 + k + v.seed) * 6;
      vineStroke(ctx, [[bx, v.y + 6], [bx + sw * .5, v.y + 6 - h * .5], [bx + sw, v.y + 6 - h]], 3, v.seed + k);
    }
    ctx.restore();
  }
}
// 一根絲瓜藤：根部較粗、越往上越細，尖端是尖的（不是圓頭）；中段旁邊長一片尖葉和一條捲鬚
function vineStroke(ctx, pts, w, seed = 0) {
  const at = t => {   // 二次曲線上的點和方向
    const u = 1 - t, [a, b, c] = pts;
    return { x: u * u * a[0] + 2 * u * t * b[0] + t * t * c[0], y: u * u * a[1] + 2 * u * t * b[1] + t * t * c[1],
      dx: 2 * u * (b[0] - a[0]) + 2 * t * (c[0] - b[0]), dy: 2 * u * (b[1] - a[1]) + 2 * t * (c[1] - b[1]) };
  };
  const N = 14, L = [], R = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N, q = at(t), len = Math.hypot(q.dx, q.dy) || 1, nx = -q.dy / len, ny = q.dx / len;
    const half = (w * Math.pow(1 - t, .85)) / 2;   // 尖端寬度 0
    L.push([q.x + nx * half, q.y + ny * half]); R.push([q.x - nx * half, q.y - ny * half]);
  }
  const shape = grow => { ctx.beginPath(); L.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); for (let i = R.length - 1; i >= 0; i--) ctx.lineTo(R[i][0], R[i][1]); ctx.closePath(); };
  ctx.strokeStyle = '#2b4f1e'; ctx.lineWidth = 1.2; ctx.fillStyle = '#5f9c3e';
  shape(); ctx.fill(); ctx.stroke();
  // 亮線（中段）
  ctx.strokeStyle = '#9fd36f'; ctx.lineWidth = .8; ctx.beginPath();
  for (let i = 2; i <= N * .7; i++) { const q = at(i / N); i === 2 ? ctx.moveTo(q.x, q.y) : ctx.lineTo(q.x, q.y); }
  ctx.stroke();
  // 中段旁邊的尖葉
  const m = at(.45), side = Math.sin(seed * 7) > 0 ? 1 : -1, ang = Math.atan2(m.dy, m.dx) + side * 1.0;
  ctx.save(); ctx.translate(m.x, m.y); ctx.rotate(ang);
  ctx.fillStyle = '#76b84c'; ctx.strokeStyle = '#2b4f1e'; ctx.lineWidth = .8;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(4, -3, 8, 0); ctx.quadraticCurveTo(4, 3, 0, 0); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = '#3f7a2a'; ctx.beginPath(); ctx.moveTo(.5, 0); ctx.lineTo(7, 0); ctx.stroke();   // 葉脈
  ctx.restore();
  // 捲鬚：另一側細細捲一圈
  const k = at(.65), a0 = Math.atan2(k.dy, k.dx) - side * 1.2;
  ctx.strokeStyle = '#6fae4a'; ctx.lineWidth = .9; ctx.beginPath();
  for (let i = 0; i <= 16; i++) { const t = i / 16, r = 5 * (1 - t * .7), a = a0 + side * t * Math.PI * 2.2, x = k.x + Math.cos(a0) * 3 * t + Math.cos(a) * r - Math.cos(a0) * 5, y = k.y + Math.sin(a0) * 3 * t + Math.sin(a) * r - Math.sin(a0) * 5; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
  ctx.stroke();
}
// 纏在人身上：從腳邊長出幾圈藤蔓繞住腿和身體，再加幾片葉子；越接近放開越淡
function drawWrap(ctx, a, grow, now, seed) {
  const fade = a.rootT > 0 ? Math.min(1, a.rootT / .4 + .3) : grow;
  ctx.globalAlpha = fade;
  const shake = (a.struggleT || 0) > 0 ? (Math.random() - .5) * 2.4 : 0;   // 掙扎時藤蔓被扯得抖一下
  const x = a.x + shake, foot = a.y + 14, H = 30 * grow;
  for (let k = 0; k < 3; k++) {   // 往上繞的藤蔓
    const side = k % 2 ? 1 : -1, wob = Math.sin(now * 3 + k + seed) * 1.5;
    vineStroke(ctx, [[x + side * 12, foot + 2], [x - side * 14 + wob, foot - H * .45], [x + side * 6, foot - H * (.7 + k * .12)]], 2.6, seed + k);
  }
  ctx.strokeStyle = '#4f8a35'; ctx.lineWidth = 1.6;   // 繞腿的圈（細藤）
  for (let k = 0; k < 3; k++) {
    const yy = foot - 4 - k * 8 * grow;
    ctx.beginPath(); ctx.ellipse(x, yy, 11 - k, 3.5, 0, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.globalAlpha = 1;
}
