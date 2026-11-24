/* ===== 大型怪物落水：水滿溢出來，溢出的水把岸上的人和東西推開 =====
   什麼時候：池核 BOSS（巨大比基尼小丑魚）躍出水面、落回水面、一頭栽進水裡的那一刻
            （js/pool-boss.js 的 poolBossSplash 呼叫 poolSurgeStart；虱目魚王從水池竄出來也借用同一個水花，所以也會溢水）
   怎麼溢：
     ① 水波從落水點沿著深水區一格一格往外擴散（照水池的形狀走，不會穿牆），最遠 range 格，越遠越弱
     ② 水波碰到岸邊：水溢上岸，最多往岸上漫 spill 格（離落水點越遠，漫得越少）
     ③ 溢上岸的水經過誰，就把誰往遠離水池的方向推開（越靠近水邊推越遠）：
        溫特、隊員、地面怪物（BOSS 自己、推不動的怪物、會飛的人面蝶不算）、地上的道具
        坐救生圈的人在水上被水波經過時，也會被往外推一點（ringPush 倍）
     ④ 岸上的水 linger 秒後慢慢退掉
   數值：怪物編輯器「👑 BOSS 數值」→ 巨大比基尼小丑魚 → surge（存在 data/monsters.js；程式裡的預設在 js/pool-boss.js 的 POOL_BOSS.surge）
   畫法：js/render.js 畫完地板之後呼叫 drawPoolSurge（在人物下面）；每一幀由 js/pool-tide.js 的 updatePoolTide 呼叫 poolSurgeTick */

const POOL_SURGE_LOOK = {
  crestSecs: .3,          // 水面上的白色浪頭經過一格要多久淡掉（秒）
  crestAlpha: .32,        // 浪頭多亮
  riseSecs: .12,          // 岸上的水湧上來要多久（秒）
  sheetAlpha: .62,        // 岸上的水最濃多濃
  sheetColor: '34,108,176', // 岸上的水的顏色（比岸邊的淺藍磁磚深，才看得出來）
  shine: .35,             // 水面反光多亮
  foamSecs: .28,          // 水的最前緣白色泡沫留多久（秒）
  hitWindow: .3,          // 水經過一格之後，多久之內走進來的人也會被推（秒）
};

// ---- 開始溢水（kind：up＝躍出水面、dive＝一頭栽進水裡、land＝落回水面）----
function poolSurgeStart(x, y, kind) {
  if (typeof G === 'undefined' || !G || typeof POOL_BOSS === 'undefined' || !POOL_BOSS.surge) return;
  const S = POOL_BOSS.surge, K = S[kind]; if (!K || !(K.range > 0)) return;
  const deep = typeof deepWaterCells === 'function' ? deepWaterCells() : null; if (!deep || !deep.size) return;
  // 起點：落水點那一格（不是深水就找附近最近的深水格）
  let [c0, r0] = cellAt(x, y);
  if (!deep.has(c0 + ',' + r0)) {
    let best = null, bd = Infinity;
    for (let dc = -3; dc <= 3; dc++) for (let dr = -3; dr <= 3; dr++) if (deep.has((c0 + dc) + ',' + (r0 + dr)) && dc * dc + dr * dr < bd) { bd = dc * dc + dr * dr; best = [c0 + dc, r0 + dr]; }
    if (!best) return;
    [c0, r0] = best;
  }
  const speed = Math.max(1, S.speed || 9), dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  // ① 沿著深水區擴散：每格記下水波到達的時間、離落水點幾格
  const deepCells = [], dist = new Map([[c0 + ',' + r0, 0]]), q = [[c0, r0]];
  for (let h = 0; h < q.length; h++) {
    const [c, r] = q[h], d = dist.get(c + ',' + r);
    deepCells.push({ c, r, t: d / speed, d });
    if (d >= K.range) continue;
    for (const [dc, dr] of dirs) {
      const k = (c + dc) + ',' + (r + dr);
      if (!dist.has(k) && deep.has(k)) { dist.set(k, d + 1); q.push([c + dc, r + dr]); }
    }
  }
  // ② 溢上岸：從碰到岸邊的深水格往陸地漫，每格記下「還能再漫幾格」（budget），離落水點越遠能漫的越少
  const land = new Map(), lq = [];
  const walkable = (c, r) => inGrid(c, r) && !isWall(c, r) && !deep.has(c + ',' + r);
  for (const e of deepCells) {
    const budget = Math.ceil((K.spill || 0) * (1 - e.d / (K.range + 1)));
    if (budget <= 0) continue;
    for (const [dc, dr] of dirs) {
      const c = e.c + dc, r = e.r + dr; if (!walkable(c, r)) continue;
      const k = c + ',' + r, old = land.get(k);
      if (old && old.budget >= budget) continue;
      const cell = { c, r, t: (e.d + 1) / speed, budget, step: 1, sx: e.c, sy: e.r };
      land.set(k, cell); lq.push(cell);
    }
  }
  for (let h = 0; h < lq.length; h++) {
    const L = lq[h]; if (L.budget <= 1) continue;
    for (const [dc, dr] of dirs) {
      const c = L.c + dc, r = L.r + dr; if (!walkable(c, r)) continue;
      const k = c + ',' + r, old = land.get(k), budget = L.budget - 1;
      if (old && old.budget >= budget) continue;
      const cell = { c, r, t: L.t + 1 / speed, budget, step: L.step + 1, sx: L.sx, sy: L.sy };
      land.set(k, cell); lq.push(cell);
    }
  }
  // 每格岸上的水：推的方向＝從溢出來的那格深水往外（再混一點從落水點往外的方向），推的力量越往岸上越小
  const [ox, oy] = center(c0, r0), landCells = [];
  for (const L of land.values()) {
    const [cx, cy] = center(L.c, L.r), [sx, sy] = center(L.sx, L.sy);
    let dx = (cx - sx) + (cx - ox) * .25, dy = (cy - sy) + (cy - oy) * .25; const len = Math.hypot(dx, dy) || 1;
    L.dx = dx / len; L.dy = dy / len;
    L.k = Math.max(.3, 1 - (L.step - 1) / Math.max(1, K.spill)) * (1 - .4 * Math.min(1, dist.get(L.sx + ',' + L.sy) / (K.range + 1)));
    L.x = cx; L.y = cy; L.seed = Math.random();
    landCells.push(L);
  }
  const end = Math.max(0, ...deepCells.map(e => e.t), ...landCells.map(e => e.t));
  const list = G.poolSurges || (G.poolSurges = []);
  list.push({ t: 0, end, kind, K, deep: deepCells, land: landCells, landAt: land, hit: new Set(), sprayed: new Set() });
  if (list.length > 6) list.splice(0, list.length - 6);
}

// ---- 每一幀（js/pool-tide.js 的 updatePoolTide 呼叫）：推開、讓地上的道具滑走、水退掉 ----
function poolSurgeTick(dt) {
  if (typeof G === 'undefined' || !G) return;
  poolSurgeItemsStep(dt);
  const list = G.poolSurges; if (!list || !list.length) return;
  const S = POOL_BOSS.surge, W = POOL_SURGE_LOOK;
  for (const s of list) {
    s.t += dt;
    // 水剛溢上岸邊的格子：噴幾顆水花（只在第一格岸邊，數量有限）
    for (const L of s.land) {
      if (L.step !== 1 || s.sprayed.has(L) || s.t < L.t || L.seed > .55 || typeof poolFallSplash !== 'function') continue;
      s.sprayed.add(L); poolFallSplash(L.x - L.dx * CELL * .4, L.y - L.dy * CELL * .4, false);
    }
    const pushAt = (a, isPlayerLike) => {
      if (!a || s.hit.has(a)) return;
      const [c, r] = cellAt(a.x, a.y), L = s.landAt.get(c + ',' + r);
      if (L && s.t >= L.t && s.t <= L.t + W.hitWindow) { s.hit.add(a); poolSurgePush(a, L.dx, L.dy, s.K.push * L.k, isPlayerLike); return; }
      // 坐救生圈、在水上：浪頭經過時往外推一點
      if (isPlayerLike && a.swimRing) {
        const e = s.deep.find(o => o.c === c && o.r === r);
        if (e && e.d > 0 && s.t >= e.t && s.t <= e.t + W.hitWindow) {
          const [ox, oy] = center(s.deep[0].c, s.deep[0].r), dx = a.x - ox, dy = a.y - oy, d = Math.hypot(dx, dy) || 1;
          s.hit.add(a); poolSurgePush(a, dx / d, dy / d, s.K.push * (S.ringPush ?? .6) * (1 - e.d / (s.K.range + 1)), true);
        }
      }
    };
    pushAt(G.player, true);
    for (const t of G.towers || []) if (t.hp > 0 && !t.eatenBy && !t.mrtRide) pushAt(t, true);
    for (const e of G.enemies || []) if (!e.poolBoss && !e.unpushable && !e.dead && e.hp > 0 && e.behavior !== 'moth' && !e.airborne) pushAt(e, false);
    for (const g of G.groundItems || []) {   // 地上的道具：被水沖著滑一段
      if (s.hit.has(g)) continue;
      const [c, r] = cellAt(g.x, g.y), L = s.landAt.get(c + ',' + r);
      if (L && s.t >= L.t && s.t <= L.t + W.hitWindow) { s.hit.add(g); const v = 2 * s.K.push * L.k / S.pushTime; g.surge = { vx: L.dx * v, vy: L.dy * v, t: S.pushTime, t0: S.pushTime }; }
    }
  }
  G.poolSurges = list.filter(s => s.t < s.end + (S.linger || 1.4) + .2);
}
// 推開一個人／怪物：跟被鳥頭人撞飛同一套滑行（js/bird-head.js 的 knockActor；撞牆會停）
function poolSurgePush(a, dx, dy, dist, isPlayerLike) {
  if (!(dist > 1)) return;
  const time = POOL_BOSS.surge.pushTime || .35;
  if (isPlayerLike) {
    if (a.sitting || a.vineCap || a.grabbed || a.poolFall || a.drowning) return;   // 坐著、被抓走、正在掉水／溺水：不推
    if (typeof knockActor === 'function') knockActor(a, dx, dy, dist, time);
    a.navPath = null;
  } else {
    const v = 2 * dist / time;   // 怪物的滑行是等速（js/combat-feel.js 的 updateEnemyFeel）：用一半的時間滑完同樣的距離
    a.knockT = time / 2; a.knockVX = dx * v; a.knockVY = dy * v;
  }
}
// 地上的道具被沖著滑：越滑越慢，碰到牆或深水就停
function poolSurgeItemsStep(dt) {
  for (const g of G.groundItems || []) {
    const m = g.surge; if (!m) continue;
    const k = Math.max(0, m.t / m.t0), nx = g.x + m.vx * k * dt, ny = g.y + m.vy * k * dt, [c, r] = cellAt(nx, ny);
    if (!inGrid(c, r) || isWall(c, r) || (typeof deepWaterAtPoint === 'function' && deepWaterAtPoint(nx, ny))) m.t = 0;
    else { g.x = nx; g.y = ny; }
    m.t -= dt; if (m.t <= 0) g.surge = null;
  }
}

// ---- 畫面 ----
// 水面上的浪頭（js/render.js 畫完地板之後呼叫，在人物下面）
function drawPoolSurge(ctx) {
  const list = typeof G !== 'undefined' && G && G.poolSurges; if (!list || !list.length) return;
  const W = POOL_SURGE_LOOK, linger = POOL_BOSS.surge.linger || 1.4;
  ctx.save();
  for (const s of list) {
    // 水面上的浪頭：水波經過的那一格亮一下（照水池的形狀一圈圈往外走）
    ctx.fillStyle = '#eaf8ff';
    for (const e of s.deep) {
      const age = s.t - e.t; if (age < 0 || age > W.crestSecs || e.d === 0) continue;
      const k = 1 - age / W.crestSecs, fade = 1 - .6 * e.d / (s.K.range + 1);
      ctx.globalAlpha = W.crestAlpha * k * fade;
      const [x, y] = center(e.c, e.r);
      ctx.beginPath(); ctx.ellipse(x, y, CELL * .55, CELL * .4, 0, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
}

// 岸上的水（js/render.js 跟地板物件一起排前後：岸邊步道的磁磚是物件圖層，直接畫在地板上會被蓋住）
// 每一格自己畫一次、只畫在自己那格裡面（把附近溢水格的那團水一起畫進來），格子之間才不會重疊變深
function poolSurgeLandAlpha(s, L) {
  const W = POOL_SURGE_LOOK, linger = POOL_BOSS.surge.linger || 1.4, age = s.t - L.t; if (age < 0) return 0;
  const rise = Math.min(1, age / W.riseSecs), fade = Math.max(0, 1 - Math.max(0, age - .25) / linger);
  return W.sheetAlpha * rise * fade * (.55 + .45 * L.k);
}
function poolSurgeSortables(out) {
  const list = typeof G !== 'undefined' && G && G.poolSurges; if (!list || !list.length) return;
  const W = POOL_SURGE_LOOK, v = typeof mapDrawRect !== 'undefined' && mapDrawRect ? mapDrawRect : null;
  for (const s of list) {
    const cells = new Map();   // 要畫的格子：溢水格＋旁邊一格（水團會漫出一點點）
    for (const L of s.land) {
      if (poolSurgeLandAlpha(s, L) <= .01) continue;
      for (let dc = -1; dc <= 1; dc++) for (let dr = -1; dr <= 1; dr++) { const k = (L.c + dc) + ',' + (L.r + dr); if (!cells.has(k)) cells.set(k, [L.c + dc, L.r + dr]); }
    }
    for (const [k, [c, r]] of cells) {
      const x = OX + c * CELL, y = OY + r * CELL;
      if (v && (x + CELL < v.x0 || x > v.x1 || y + CELL < v.y0 || y > v.y1)) continue;
      out.push({ y: y + 1, draw: () => {
        const near = [];
        for (let dc = -1; dc <= 1; dc++) for (let dr = -1; dr <= 1; dr++) { const L = s.landAt.get((c + dc) + ',' + (r + dr)); if (L) near.push(L); }
        let a = 0; for (const L of near) a = Math.max(a, poolSurgeLandAlpha(s, L)); if (a <= .01) return;
        ctx.save();
        ctx.beginPath(); ctx.rect(x, y, CELL, CELL); ctx.clip();
        ctx.globalAlpha = a; ctx.fillStyle = 'rgb(' + W.sheetColor + ')'; ctx.beginPath();
        for (const L of near) {   // 每格一團歪歪的圓，連起來像一灘水
          if (poolSurgeLandAlpha(s, L) <= .01) continue;
          const j = L.seed * 6.28, rr = CELL * (.74 + .08 * Math.sin(j * 3)), bx = L.x + Math.cos(j) * 3, by = L.y + Math.sin(j) * 3;
          ctx.moveTo(bx + rr, by); ctx.ellipse(bx, by, rr, rr * .86, j * .3, 0, Math.PI * 2);
        }
        ctx.fill();
        ctx.globalAlpha = a * W.shine; ctx.fillStyle = '#cfefff';   // 水面反光：每格一小道斜斜的亮光
        for (const L of near) {
          if (poolSurgeLandAlpha(s, L) <= .01) continue;
          const j = L.seed * 6.28;
          ctx.beginPath(); ctx.ellipse(L.x - CELL * .12 + Math.cos(j) * 5, L.y - CELL * .1, CELL * .22, CELL * .06, -.5, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = '#f2fbff';   // 水的最前緣：白色泡沫
        for (const L of near) {
          const age = s.t - L.t; if (age < 0 || age > W.foamSecs) continue;
          ctx.globalAlpha = .6 * (1 - age / W.foamSecs) * L.k;
          const fx = L.x + L.dx * CELL * .35, fy = L.y + L.dy * CELL * .35;
          ctx.beginPath(); ctx.ellipse(fx, fy, CELL * .42, CELL * .2, Math.atan2(L.dy, L.dx) + Math.PI / 2, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
      } });
    }
  }
}
