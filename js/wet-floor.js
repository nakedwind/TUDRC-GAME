/* ===== 濕地板：泳池旁邊的地面濕濕的，走路有機會滑倒（池核）=====
   ・離泳池（勾了「這是水」的素材、🛟 深水區）越近越濕：地上的水漬越多、越容易滑、滑得越遠
     水被抽乾的泳池（js/pool-tide.js）也算最濕的地板
   ・泡在水裡（看得到水的地方）、坐救生圈的人不會滑
   ・滑多遠：WET_FLOOR.dist 隨機，越濕越遠。不到 bigFrom 格＝「小滑」：往前滑一小段、身體晃一下，不會頭暈；
     bigFrom 格以上＝跟踩到香蕉皮一樣大滑（往後仰、撞到東西會頭暈，js/golden-banana-king.js 那一套）
   ・滑多快：跟踩到香蕉皮一樣快（BANANA_KING 的 slipDist 格 ÷ slipTime 秒），滑得越遠就滑越久，不會一下子噴出去
   ・溫特和隊員都會滑；滑過一次 cooldown 秒內不會再滑
   ・哪張地圖有濕地板、濕幾格：地圖編輯器 →「地圖設定」→「💦 泳池旁的地板是濕的」（存在地圖資料的 wetFloor：true／false、wetRange：格數）
     地圖資料還沒設定過時照 WET_FLOOR.maps（池核預設有）
   ・數值都在下面的 WET_FLOOR；音效在音效編輯器的 wetSlip */
const WET_FLOOR = {
  maps: ['map_mv1bzur4', 'map_89aacb92-4b89-47ec-a76b-0908972d3fdf', 'map_w118_deep_test'],   // 地圖資料沒設定過時，預設有濕地板的地圖（04. 池核、W118區 地下水池、W118區 超深水區（魚頭王測試））
  range: 6,                 // 離泳池幾格內的地板是濕的（越近越濕）：地圖沒填 wetRange 時用這個
  slipRate: .08,            // 最濕的地方，一直走的話每秒滑倒的機率（越乾越小；.08 ≈ 貼著泳池走每分鐘滑 3 次左右）
  slipPow: 1.6,             // 機率跟濕度的關係（越大＝離泳池遠一點就很少滑）
  cooldown: 5,              // 滑過一次，幾秒內不會再滑
  dist: [1, 3.5],           // 滑多遠（格）：最乾時最多 dist[0]＋一點點、最濕時最多 dist[1]（香蕉皮是 2.5 格）
  bigFrom: 2.5,             // 滑 2.5 格以上才是大滑（往後仰、會頭暈）；不到 2.5 格是小滑
  smallWobble: .14,         // 小滑時身體晃多大（弧度）
  puddle: { chance: .85, minR: 6, maxR: 18, alpha: .42, color: '#2c6fa3', shine: '#ffffff' },   // 地上的水漬：每格出現的機會（再乘濕度）、大小、最濃多濃
  sheen: .16,               // 濕地板整片變深一點（最濕的地方；地板是淺色的，變深才看得出濕）
  sheenColor: '#1f5a86',
};

// ---- 每格多濕（0～1）：從泳池格往外一格一格算，穿不過牆。換地圖、地圖物件數量變了才重算 ----
let wetCache = { map: null, n: -1, wet: null, puddles: null };
// 這張地圖有沒有濕地板、濕幾格（地圖編輯器也用這兩個顯示目前的設定）
function wetFloorOn(m) { return !!m && (typeof m.wetFloor === 'boolean' ? m.wetFloor : WET_FLOOR.maps.includes(m.id)); }
function wetFloorRange(m) { const v = Number(m && m.wetRange); return Number.isFinite(v) && v >= 1 ? Math.min(20, Math.round(v)) : WET_FLOOR.range; }
function wetFloorActive() { return typeof MAP !== 'undefined' && MAP && wetFloorOn(MAP); }
function wetField() {
  if (!wetFloorActive()) return null;
  const n = (MAP.stamps || []).length;
  const range = wetFloorRange(MAP);
  if (wetCache.map === MAP && wetCache.n === n && wetCache.range === range) return wetCache;
  const pool = new Set();
  const w = typeof waterIndex === 'function' ? waterIndex() : null;
  if (w) {
    for (const k of w.cells.keys()) pool.add(k);
    for (const q of w.rects) {
      const [c0, r0] = cellAt(q.x0 + 1, q.y0 + 1), [c1, r1] = cellAt(q.x1 - 1, q.y1 - 1);
      for (let c = c0; c <= c1; c++) for (let r = r0; r <= r1; r++) pool.add(c + ',' + r);
    }
  }
  for (const k of [...(MAP.deepWater || []), ...(MAP.deepWaterKeep || [])]) pool.add(k);   // 深水區（含永遠深水）
  const dist = new Map(), q = [];
  for (const k of pool) { dist.set(k, 0); q.push(k); }
  for (let h = 0; h < q.length; h++) {
    const k = q[h], d = dist.get(k); if (d >= range) continue;
    const [c, r] = k.split(',').map(Number);
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nc = c + dc, nr = r + dr, nk = nc + ',' + nr;
      if (dist.has(nk) || !inGrid(nc, nr) || mapWalls.has(nk)) continue;
      dist.set(nk, d + 1); q.push(nk);
    }
  }
  const wet = new Map();
  for (const [k, d] of dist) wet.set(k, Math.max(0, 1 - d / (range + 1)));
  // 地上的水漬：每格固定亂數（每次看起來一樣），越濕越多越大
  const puddles = [], P = WET_FLOOR.puddle;
  let seed = 12345; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (const [k, v] of wet) {
    if (pool.has(k)) continue;   // 泳池本身不畫（有水的地方本來就是水）
    const [c, r] = k.split(',').map(Number);
    const count = rnd() < v * P.chance ? (rnd() < v * .6 ? 2 : 1) : 0;
    for (let i = 0; i < count; i++) {
      const rr = P.minR + (P.maxR - P.minR) * v * (.5 + rnd() * .5);
      puddles.push({ x: OX + c * CELL + 6 + rnd() * (CELL - 12), y: OY + r * CELL + 6 + rnd() * (CELL - 12), rx: rr, ry: rr * (.45 + rnd() * .2), a: P.alpha * (.5 + v * .5) * (.6 + rnd() * .4), rot: (rnd() - .5) * .6 });
    }
  }
  wetCache = { map: MAP, n, range, wet, pool, puddles };
  return wetCache;
}
// 這個點多濕（0～1）；有水（泡在水裡）的地方＝0（不會滑）
function wetAt(x, y) {
  const f = wetField(); if (!f) return 0;
  if (typeof waterAt === 'function' && waterAt(x, y)) return 0;
  if (typeof deepWaterAtPoint === 'function' && deepWaterAtPoint(x, y)) return 0;
  return f.wet.get(cellAt(x, y).join(',')) || 0;
}

// ---- 每一幀（js/game.js 的 update 呼叫）：走在濕地板上有機會滑倒 ----
function updateWetFloor(dt) {
  if (!wetFloorActive() || !G || !G.running || G.over) return;
  const W = WET_FLOOR, list = [G.player, ...(G.towers || [])];
  for (const a of list) {
    if (!a || a.hp <= 0) continue;
    const px = a.wfPrevX ?? a.x, py = a.wfPrevY ?? a.y; a.wfPrevX = a.x; a.wfPrevY = a.y;
    if (a.wetSlipT > 0) a.wetSlipT -= dt;
    if (a.wfCd > 0) { a.wfCd -= dt; continue; }
    if (!a.moving || a.swimRing || a.sitting || a.knockT > 0 || a.slipDizzyT > 0 || a.eatenBy || a.mrtRide) continue;
    const vx = a.x - px, vy = a.y - py; if (Math.hypot(vx, vy) < .3) continue;   // 這一幀沒真的走動
    const wet = wetAt(a.x, a.y + 14); if (wet <= 0) continue;   // 看腳下
    if (Math.random() >= W.slipRate * Math.pow(wet, W.slipPow) * dt) continue;
    wetSlip(a, vx, vy, wet);
  }
}
function wetSlip(a, vx, vy, wet) {
  const W = WET_FLOOR, d = Math.hypot(vx, vy) || 1;
  const cells = W.dist[0] + Math.random() * (W.dist[0] * .5 + (W.dist[1] - W.dist[0]) * wet);
  a.wfCd = W.cooldown;
  // 滑行時間：跟香蕉皮一樣的速度（香蕉皮 slipTime 秒滑 slipDist 格），滑越遠越久；速度一開始最快、慢慢停下（距離＝v × T ÷ 2）
  const B = typeof BANANA_KING !== 'undefined' ? BANANA_KING : { slipTime: .9, slipDist: 2.5 }, T = cells * B.slipTime / B.slipDist, v = cells * CELL * 2 / T;
  if (cells >= W.bigFrom && typeof BANANA_KING !== 'undefined') {   // 大滑：跟香蕉皮一樣（往後仰、撞到東西頭暈）
    a.knockT = a.knockT0 = T; a.knockVX = vx / d * v; a.knockVY = vy / d * v;
    a.slipT = a.slipT0 = T;
    a.slipPose = { dir: ['front', 'back', 'left', 'right'][Math.floor(Math.random() * 4)], frame: 1 + Math.floor(Math.random() * 2) };
    flash('滑倒！', a.x, a.y - 50, '#9fdcff');
  } else {   // 小滑：往前滑一小段、身體晃一下（不定格、撞到東西也不會頭暈）
    a.knockT = a.knockT0 = T; a.knockVX = vx / d * v; a.knockVY = vy / d * v;
    a.wetSlipT = a.wetSlipT0 = T; a.wetSlipSide = (vx >= 0 ? 1 : -1);
    flash('滑了一下', a.x, a.y - 50, '#bfe8ff');
  }
  a.navPath = null;
  G.effects.push({ ring: true, x: a.x, y: a.y + 14, r: 3, r2: 20, life: .3, life0: .3, color: '#bfe8ff' });
  if (typeof sfxAt === 'function') sfxAt('wetSlip', a.x, a.y, .8, 'wet-slip');
}
// 小滑：身體往旁邊晃一下再站穩（js/render.js 畫溫特、隊員時呼叫）
function applyWetWobble(ctx, a) {
  if (!(a && a.wetSlipT > 0 && a.wetSlipT0 > 0)) return;
  const k = a.wetSlipT / a.wetSlipT0, ang = Math.sin((1 - k) * Math.PI * 2) * WET_FLOOR.smallWobble * k * -(a.wetSlipSide || 1);
  const fx = a.x, fy = a.y + 16;
  ctx.translate(fx, fy); ctx.rotate(ang); ctx.translate(-fx, -fy);
}

// ---- 畫面：地上的水漬、濕地板變深（js/render.js 呼叫，加進前後排序）----
// 池邊的地板很多是放在物件圖層的素材（例如人物遮擋線 0 的樓梯、池畔平台），比一般地面晚畫，會把水漬蓋住；
// 所以每一塊都照它所在的位置加進排序：排在同一格的地板素材後面、站在上面的人前面
function wetFloorSortables(out) {
  const f = wetField(); if (!f) return;
  const v = typeof mapDrawRect !== 'undefined' && mapDrawRect ? mapDrawRect : null;
  const inView = (x, y, r) => !v || (x + r > v.x0 && x - r < v.x1 && y + r > v.y0 && y - r < v.y1);
  const drained = typeof poolTide === 'function' && poolTideActive() && poolTide().shallow < .5;
  // 每一格的位置第一次就算好記在 f.wetList（以前每一幀都把所有濕地板格子拆開重算，濕的格子很多，W118 每幀要好幾毫秒）
  if (!f.wetList) f.wetList = [...f.wet].map(([k, w]) => { const i = k.indexOf(','); return { x: OX + +k.slice(0, i) * CELL, y: OY + +k.slice(i + 1) * CELL, w, pool: f.pool.has(k) }; });
  if (WET_FLOOR.sheen > 0) for (const { x, y, w, pool } of f.wetList) {   // 整片變深：越靠近泳池越深
    if (pool && !drained) continue;   // 還有水的泳池不畫（抽乾後的池底算濕地板）
    if (!inView(x + CELL / 2, y + CELL / 2, CELL)) continue;
    out.push({ y: y + 1, draw: () => { ctx.save(); ctx.globalAlpha = WET_FLOOR.sheen * w; ctx.fillStyle = WET_FLOOR.sheenColor; ctx.fillRect(x, y, CELL, CELL); ctx.restore(); } });
  }
  for (const p of f.puddles) {
    if (!inView(p.x, p.y, p.rx)) continue;
    out.push({ y: p.y - CELL * .5, draw: () => {
      ctx.save();
      ctx.globalAlpha = p.a; ctx.fillStyle = WET_FLOOR.puddle.color;
      ctx.beginPath(); ctx.ellipse(p.x, p.y, p.rx, p.ry, p.rot, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = p.a * .8; ctx.fillStyle = WET_FLOOR.puddle.shine;   // 反光的小亮點
      ctx.beginPath(); ctx.ellipse(p.x - p.rx * .3, p.y - p.ry * .3, p.rx * .3, p.ry * .22, p.rot, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    } });
  }
}
