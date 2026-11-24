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
  hitWindow: .3,          // 水經過一格之後，多久之內走進來的人也會被推（秒）
  sortDy: 10,             // 水排在每一格上緣往下幾點的位置（要比池畔平台磁磚的上緣低、比人物的腳高；見 poolSurgeSortables）
  // ---- 岸上的水：一整片水浪（每格溢水的地方像一團水，彼此融在一起，外面一圈白色浪花邊、裡面一條淺藍水紋）----
  riseSecs: .18,          // 水湧上岸、漲到最大要多久（秒）
  holdSecs: .25,          // 漲到最大之後停多久才開始退（秒；退掉要多久看 BOSS 數值的 linger）
  sheetAlpha: 1,          // 整片水再整體乘多少不透明度（1＝照下面各部分自己的不透明度）
  blobR: 1.25,            // 每格溢水的那一團有多大（格；越大越容易連成一整片）
  foamAt: .32,            // 水漫到哪裡（越小水的範圍越大）
  foamW: 12,              // 白色浪花邊多粗（點）
  lineGap: 10,            // 淺藍水紋離白邊多遠（點）
  lineW: 3,               // 淺藍水紋多粗（點）
  edgeNoise: .09,         // 邊緣凹凸蠕動的程度（0＝很圓滑）
  bodyColor: '118,207,255', bodyAlpha: .35,  // 水（藍色的部分）的顏色（#76cfff）、不透明度（.35＝35%，看得到底下的地板和水池）
  lineColor: '200,244,251', lineAlpha: .85,  // 水紋的顏色、不透明度
  foamColor: '255,255,255', foamAlpha: .8,   // 浪花邊的顏色、不透明度（.8＝80%）
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
  //    「幾格」用直線距離算（不是一格一格數上下左右），水波才會是一圈圓的往外擴，不會變成 45 度的正方形；
  //    但只會流過連在一起的深水（一格一格找相連的格子，不會穿牆跳到另一個水池）
  const deepCells = [], dist = new Map([[c0 + ',' + r0, 0]]), q = [[c0, r0]];
  for (let h = 0; h < q.length; h++) {
    const [c, r] = q[h], d = dist.get(c + ',' + r);
    deepCells.push({ c, r, t: d / speed, d });
    for (const [dc, dr] of dirs) {
      const nc = c + dc, nr = r + dr, k = nc + ',' + nr;
      if (dist.has(k) || !deep.has(k)) continue;
      const nd = Math.max(d, Math.hypot(nc - c0, nr - r0));   // 直線距離（繞過轉角時不會比前一格還近）
      if (nd > K.range) continue;
      dist.set(k, nd); q.push([nc, nr]);
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

// ---- 岸上的水：一整片水浪 ----
// 做法：每格溢水的地方算成一團「水量」，很多團疊在一起就融成一整片（邊緣是圓滑、不規則的形狀，不會一格一格的）。
//   水量夠多的地方＝水的本體；邊上水量少一點的一圈＝白色浪花邊；本體裡面某個水量的那一圈＝淺藍水紋。
//   水剛湧上來時每團慢慢變大，退的時候慢慢變小，整片水就會縮小、斷成一灘一灘再消失。
// 一團水的水量（0～1）：水波到了才湧上來 → 停一下 → 慢慢退（b.t＝水波到這裡的時間、b.k＝這團多強）
function poolSurgeBlobWeight(s, b) {
  const W = POOL_SURGE_LOOK, linger = POOL_BOSS.surge.linger || 1.4, age = s.t - b.t; if (age < 0) return 0;
  const rise = 1 - Math.pow(1 - Math.min(1, age / W.riseSecs), 2);
  const fade = Math.max(0, 1 - Math.max(0, age - W.holdSecs) / linger);
  return rise * fade * b.k;
}
const POOL_SURGE_RES = .5;   // 水浪的形狀用幾分之一的解析度算（.5＝每 2 點算一次；畫出來的邊是描線，不會糊，只是形狀的細節少一點）
const POOL_SURGE_MAXPX = 260;   // 算形狀用的小圖最長邊最多幾個點（範圍很大時自動降低，才不會卡；邊一樣是銳利的描線）
const POOL_SURGE_REFRESH = 1 / 30;   // 水浪的形狀多久重算一次（秒；1/30＝一秒 30 次，比每一幀都算省一半效能，看起來一樣順）
// 把整片水浪畫到一張小圖上（每一幀算一次），回傳 { cv, x0, y0, w, h, cells }；cells＝這一幀有水的格子
// 水的範圍＝以落水點（BOSS）為中心、水波在水池裡擴散經過的格子，加上溢上岸的格子：一整大片從 BOSS 往外擴散
function poolSurgeSheet(s) {
  if (s.sheet && s.t >= s.sheet.t && s.t - s.sheet.t < POOL_SURGE_REFRESH) return s.sheet;   // 剛算過：直接用
  const W = POOL_SURGE_LOOK;
  if (!s.box) {   // 第一次：決定小圖的範圍（所有有水的格子往外多 2 格）、每一團水的位置和強弱
    const [ox, oy] = center(s.deep[0].c, s.deep[0].r), R = s.K.range + 1, blobs = [];
    for (const e of s.deep) {   // 水池裡：水波經過的格子（離 BOSS 越遠越弱）
      const [x, y] = center(e.c, e.r), dx = x - ox, dy = y - oy, d = Math.hypot(dx, dy) || 1;
      blobs.push({ c: e.c, r: e.r, x, y, t: e.t, k: 1 - .45 * e.d / R, dx: dx / d, dy: dy / d, seed: Math.random() });
    }
    for (const L of s.land) blobs.push({ c: L.c, r: L.r, x: L.x, y: L.y, t: L.t, k: .6 + .4 * L.k, dx: L.dx, dy: L.dy, seed: L.seed });   // 溢上岸的格子
    let c0 = Infinity, c1 = -Infinity, r0 = Infinity, r1 = -Infinity;
    for (const b of blobs) { c0 = Math.min(c0, b.c); c1 = Math.max(c1, b.c); r0 = Math.min(r0, b.r); r1 = Math.max(r1, b.r); }
    if (!isFinite(c0)) return null;
    const worldW = (c1 - c0 + 5) * CELL, worldH = (r1 - r0 + 5) * CELL;
    const sc = Math.min(POOL_SURGE_RES, POOL_SURGE_MAXPX / Math.max(worldW, worldH));
    const x0 = OX + (c0 - 2) * CELL, y0 = OY + (r0 - 2) * CELL, w = Math.ceil(worldW * sc), h = Math.ceil(worldH * sc);
    // 畫水浪用的圖：跟遊戲畫面一樣大小（1 點＝1 點），外框、白邊、水紋都是描線畫上去的，放大也不會糊
    const cv = document.createElement('canvas'); cv.width = Math.ceil(worldW) + 2; cv.height = Math.ceil(worldH) + 2;
    for (const b of blobs) { const a = (b.seed - .5) * 1.6; b.ox = (b.dx * Math.cos(a) - b.dy * Math.sin(a)) * CELL * .55; b.oy = (b.dx * Math.sin(a) + b.dy * Math.cos(a)) * CELL * .55; b.lr = .45 + b.seed * .3; }
    s.box = { x0, y0, w, h, sc, cv, cx: cv.getContext('2d'), field: new Float32Array(w * h), seed: Math.random() * 100, blobs };
  }
  const B = s.box, { w, h, field } = B, SC = B.sc; field.fill(0);
  // 在 (px, py) 疊一團水：半徑 R，水量 k（中間最多、往外慢慢變少）
  const stamp = (px, py, R, k) => {
    const cx = (px - B.x0) * SC, cy = (py - B.y0) * SC, rp = R * SC, rp2 = rp * rp;
    const ix0 = Math.max(0, Math.floor(cx - rp)), ix1 = Math.min(w - 1, Math.ceil(cx + rp));
    const iy0 = Math.max(0, Math.floor(cy - rp)), iy1 = Math.min(h - 1, Math.ceil(cy + rp));
    for (let iy = iy0; iy <= iy1; iy++) {
      const dy2 = (iy - cy) * (iy - cy), row = iy * w;
      for (let ix = ix0; ix <= ix1; ix++) { const u = ((ix - cx) * (ix - cx) + dy2) / rp2; if (u < 1) { const q = 1 - u; field[row + ix] += k * q * q; } }
    }
  };
  let any = false;
  for (const b of B.blobs) {
    const k = poolSurgeBlobWeight(s, b); if (k <= .01) continue; any = true;
    stamp(b.x, b.y, CELL * W.blobR, k);
    stamp(b.x + b.ox, b.y + b.oy, CELL * W.blobR * b.lr, k * .55);   // 往外湧的方向再多一小團：前緣凹凸不平
  }
  const cells = new Set(), hx = B.cx;
  hx.setTransform(1, 0, 0, 1, 0, 0); hx.clearRect(0, 0, B.cv.width, B.cv.height);
  if (any) {
    const T = s.t, sd = B.seed, N = W.edgeNoise;
    const rgba = (c, a) => 'rgba(' + c + ',' + a + ')';
    // 邊緣的凹凸：幾個慢慢移動的波疊在一起（ix、iy＝小圖上的位置）
    // 先把每一欄、每一列、每一條斜線的波算好存起來，每個點只要查表相乘（不用每個點都算三次 sin，快很多）
    const tabs = B.tabs || (B.tabs = { ax: new Float32Array(w), ay: new Float32Array(h), ad: new Float32Array(w + h), bx: new Float32Array(w), by: new Float32Array(h), bd: new Float32Array(w + h) });
    for (let ix = 0; ix < w; ix++) { tabs.ax[ix] = Math.sin(ix * .23 + T * 2.1 + sd); tabs.bx[ix] = Math.sin((ix * .7 + 13) * .23 + T * 2.1 + sd); }
    for (let iy = 0; iy < h; iy++) { tabs.ay[iy] = Math.sin(iy * .29 - T * 1.6 + sd * .7); tabs.by[iy] = Math.sin((iy * .7 - 7) * .29 - T * 1.6 + sd * .7); }
    for (let k = 0; k < w + h; k++) { tabs.ad[k] = .6 * Math.sin(k * .11 - T * 1.3 + sd * 1.3); tabs.bd[k] = .6 * Math.sin((k * .7 + 6) * .11 - T * 1.3 + sd * 1.3); }
    const wave = (ix, iy) => tabs.ax[ix] * tabs.ay[iy] + tabs.ad[ix + iy];    // 邊緣的凹凸
    const wave2 = (ix, iy) => tabs.bx[ix] * tabs.by[iy] + tabs.bd[ix + iy];   // 白邊、水紋粗細的蠕動
    // ① 水的範圍：v ≥ 0 的地方有水（水量夠＋邊緣凹凸），v 是連續的數字，描出來的外框才會圓滑
    const n = w * h, V = B.V || (B.V = new Float32Array(n)), dist = B.dist || (B.dist = new Float32Array(n));
    const gIn = B.gIn || (B.gIn = new Float32Array(n)), gLn = B.gLn || (B.gLn = new Float32Array(n)), BIG = 1e6;
    for (let iy = 0; iy < h; iy++) for (let ix = 0; ix < w; ix++) { const i = iy * w + ix; V[i] = field[i] + N * 2.2 * wave(ix, iy) - W.foamAt; }
    // ② 每個有水的點離水的邊緣多遠：緊貼邊緣的點先用「離 v=0 那條線多遠」（比一格更細），再往裡面一路推算
    for (let iy = 0; iy < h; iy++) for (let ix = 0; ix < w; ix++) {
      const i = iy * w + ix, v = V[i];
      const l = ix > 0 ? V[i - 1] : v, r = ix < w - 1 ? V[i + 1] : v, u = iy > 0 ? V[i - w] : v, dn = iy < h - 1 ? V[i + w] : v;
      const edge = v >= 0 ? (l < 0 || r < 0 || u < 0 || dn < 0) : (l >= 0 || r >= 0 || u >= 0 || dn >= 0);
      if (edge) { const g = Math.hypot((r - l) / 2, (dn - u) / 2) || 1e-6; dist[i] = Math.max(-1.5, Math.min(1.5, v / g)); }
      else dist[i] = v >= 0 ? BIG : -1.5;
    }
    const D = Math.SQRT2;
    for (let iy = 0; iy < h; iy++) for (let ix = 0; ix < w; ix++) {
      const i = iy * w + ix; let v = dist[i]; if (v < BIG) continue;
      if (ix > 0) v = Math.min(v, dist[i - 1] + 1);
      if (iy > 0) { v = Math.min(v, dist[i - w] + 1); if (ix > 0) v = Math.min(v, dist[i - w - 1] + D); if (ix < w - 1) v = Math.min(v, dist[i - w + 1] + D); }
      dist[i] = v;
    }
    for (let iy = h - 1; iy >= 0; iy--) for (let ix = w - 1; ix >= 0; ix--) {
      const i = iy * w + ix; let v = dist[i]; if (v <= 1.5) continue;
      if (ix < w - 1) v = Math.min(v, dist[i + 1] + 1);
      if (iy < h - 1) { v = Math.min(v, dist[i + w] + 1); if (ix < w - 1) v = Math.min(v, dist[i + w + 1] + D); if (ix > 0) v = Math.min(v, dist[i + w - 1] + D); }
      dist[i] = v;
    }
    // 白邊、水紋的位置跟著蠕動一點（把距離加減一點再描線）
    const fw = W.foamW * SC, lg = W.lineGap * SC, lw = W.lineW * SC, lc = fw + lg + lw / 2;
    for (let iy = 0; iy < h; iy++) for (let ix = 0; ix < w; ix++) {
      const i = iy * w + ix, wob = wave2(ix, iy);
      gIn[i] = dist[i] - wob * fw * .35; gLn[i] = dist[i] - wob * lw * .6 - wob * fw * .35;
      if (V[i] >= 0) cells.add(Math.floor((B.x0 + ix / SC - OX) / CELL) + ',' + Math.floor((B.y0 + iy / SC - OY) / CELL));
    }
    // ③ 描線：找出「數值剛好等於 level」的那條線（邊上的點照數值比例算出精確位置），把一小段一小段接成一圈圈封閉的外框，
    //    再用圓滑的曲線畫出來。畫的時候換算回原尺寸（÷SC），所以邊緣是銳利、圓滑的線，不會糊
    const ne = n * 2;
    const ex = B.ex || (B.ex = new Float32Array(ne)), ey = B.ey || (B.ey = new Float32Array(ne));
    const adjA = B.adjA || (B.adjA = new Int32Array(ne)), adjB = B.adjB || (B.adjB = new Int32Array(ne)), seen = B.seen || (B.seen = new Uint8Array(ne));
    const k = 1 / SC;
    const contour = (G, level, path) => {
      adjA.fill(-1); adjB.fill(-1); seen.fill(0);
      // 方格四條邊上那個點的編號（水平邊＝偶數、垂直邊＝奇數），第一次用到時算出位置
      const pt = (id, i0, i1, x0, y0, x1, y1) => {
        if (adjA[id] === -1 && adjB[id] === -1) { const a = G[i0], b = G[i1], t = (level - a) / (b - a); ex[id] = (x0 + (x1 - x0) * t) * k; ey[id] = (y0 + (y1 - y0) * t) * k; }
        return id;
      };
      const link = (a, b) => { if (adjA[a] === -1) adjA[a] = b; else adjB[a] = b; if (adjA[b] === -1) adjA[b] = a; else adjB[b] = a; };
      for (let iy = 0; iy < h - 1; iy++) for (let ix = 0; ix < w - 1; ix++) {
        const i = iy * w + ix;
        const c = (G[i] >= level ? 8 : 0) | (G[i + 1] >= level ? 4 : 0) | (G[i + w + 1] >= level ? 2 : 0) | (G[i + w] >= level ? 1 : 0);
        if (c === 0 || c === 15) continue;
        const T = () => pt(i * 2, i, i + 1, ix, iy, ix + 1, iy);                       // 上邊
        const Bm = () => pt((i + w) * 2, i + w, i + w + 1, ix, iy + 1, ix + 1, iy + 1);  // 下邊
        const L = () => pt(i * 2 + 1, i, i + w, ix, iy, ix, iy + 1);                    // 左邊
        const R = () => pt((i + 1) * 2 + 1, i + 1, i + w + 1, ix + 1, iy, ix + 1, iy + 1);  // 右邊
        switch (c) {
          case 1: case 14: link(L(), Bm()); break;
          case 2: case 13: link(Bm(), R()); break;
          case 3: case 12: link(L(), R()); break;
          case 4: case 11: link(T(), R()); break;
          case 6: case 9: link(T(), Bm()); break;
          case 7: case 8: link(L(), T()); break;
          case 5: case 10: {   // 對角兩個角在裡面：看方格中間在不在裡面決定怎麼接
            const mid = (G[i] + G[i + 1] + G[i + w] + G[i + w + 1]) / 4 >= level;
            if ((c === 5) === mid) { link(L(), T()); link(Bm(), R()); } else { link(L(), Bm()); link(T(), R()); }
            break;
          }
        }
      }
      // 把一段段接起來：從一個點出發，一直走到回到原點，就是一圈外框；用經過每個點中間的圓滑曲線畫
      for (let id0 = 0; id0 < ne; id0++) {
        if (seen[id0] || adjA[id0] === -1) continue;
        const xs = [], ys = []; let prev = -1, cur = id0;
        while (cur !== -1 && !seen[cur]) {
          seen[cur] = 1; xs.push(ex[cur]); ys.push(ey[cur]);
          const nx = adjA[cur] !== prev ? adjA[cur] : adjB[cur]; prev = cur; cur = nx;
        }
        const m = xs.length; if (m < 3) continue;
        path.moveTo((xs[m - 1] + xs[0]) / 2, (ys[m - 1] + ys[0]) / 2);
        for (let q = 0; q < m; q++) { const q2 = (q + 1) % m; path.quadraticCurveTo(xs[q], ys[q], (xs[q] + xs[q2]) / 2, (ys[q] + ys[q2]) / 2); }
        path.closePath();
      }
      return path;
    };
    const outer = contour(V, 0, new Path2D()), inner = contour(gIn, fw, new Path2D());
    // 白色浪花邊＝水的範圍扣掉裡面（evenodd：兩層重疊的地方挖空）
    const ring = new Path2D(); ring.addPath(outer); ring.addPath(inner);
    hx.fillStyle = rgba(W.foamColor, W.foamAlpha); hx.fill(ring, 'evenodd');
    // 水（半透明藍色）
    hx.fillStyle = rgba(W.bodyColor, W.bodyAlpha); hx.fill(inner, 'evenodd');
    // 淺藍水紋：距離在 [lc - lw/2, lc + lw/2] 之間的一條帶子
    const band = new Path2D(); contour(gLn, lc - lw / 2, band); contour(gLn, lc + lw / 2, band);
    hx.fillStyle = rgba(W.lineColor, W.lineAlpha); hx.fill(band, 'evenodd');
  }
  return (s.sheet = { t: s.t, cv: B.cv, x0: B.x0, y0: B.y0, w: B.cv.width, h: B.cv.height, cells });
}
// 每一格水要排在哪裡：預設是這一格上緣往下 sortDy 點；
// 這一格被「標成地板」的地圖圖片蓋到（🧱 牆地板編輯器標 🟫 地板，例如池畔平台的磁磚），而那張圖排得比較後面時，
// 水就排在那張圖之後一點點 → 水蓋在地板圖上面。沒標成地板的（道具、欄杆、牆…）不管，照樣畫在水上面
function poolSurgeCellSortY() {
  if (typeof mapOccluders !== 'function' || typeof surfaceTagOf !== 'function') return new Map();
  const out = new Map();
  for (const it of mapOccluders()) {
    if (it.band !== undefined && it.band !== DRAW_BAND.obj) continue;   // 已經畫在地面層的不用管（水本來就在它上面）
    const id = it.id || (it.stamp && it.stamp.id);
    if (surfaceTagOf(id) !== 'floor') continue;
    const c0 = Math.floor((it.x0 ?? 0) / CELL), c1 = Math.ceil((it.x1 ?? 0) / CELL) - 1, r0 = Math.floor((it.y0 ?? 0) / CELL), r1 = Math.ceil((it.y1 ?? 0) / CELL) - 1;
    for (let c = c0; c <= c1; c++) for (let r = r0; r <= r1; r++) { const k = c + ',' + r, v = it.y + .01; if (!(out.get(k) >= v)) out.set(k, v); }
  }
  return out;
}
// 溢出來的水（js/render.js 呼叫，放進畫面排序清單）
// 層級：每一格切一塊。人物、怪物照腳的位置排，立著的物件照底部排 → 都畫在水的上面；
//   地板、水池畫在最底層 → 水蓋在上面；標成地板、但跟人物一起排前後的圖（池畔平台）→ 見 poolSurgeCellSortY
// 牆的格子不畫（水不會漫到牆上）
function poolSurgeSortables(out) {
  const list = typeof G !== 'undefined' && G && G.poolSurges; if (!list || !list.length) return;
  const W = POOL_SURGE_LOOK, v = typeof mapDrawRect !== 'undefined' && mapDrawRect ? mapDrawRect : null;
  for (const s of list) {
    const sh = poolSurgeSheet(s); if (!sh || !sh.cells.size) continue;
    const floorY = s.floorY || (s.floorY = poolSurgeCellSortY());   // 每次溢水算一次就好（地圖不會變）
    for (const k of sh.cells) {
      const [c, r] = k.split(',').map(Number); if (!inGrid(c, r) || isWall(c, r)) continue;
      const x = OX + c * CELL, y = OY + r * CELL;
      if (v && (x + CELL < v.x0 || x > v.x1 || y + CELL < v.y0 || y > v.y1)) continue;   // 在畫面外
      out.push({ floor: 1, y: Math.max(y + W.sortDy, floorY.get(k) ?? -Infinity), draw: () => {
        ctx.save();
        ctx.beginPath(); ctx.rect(x, y, CELL, CELL); ctx.clip();
        ctx.globalAlpha = W.sheetAlpha; ctx.imageSmoothingEnabled = true;
        ctx.drawImage(sh.cv, sh.x0, sh.y0, sh.w, sh.h);
        ctx.restore();
      } });
    }
  }
}
