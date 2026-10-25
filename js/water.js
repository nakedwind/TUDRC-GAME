/* ===== 水：角色走進「水」素材的範圍 → 泡在水裡 =====
   哪些素材是水、數字多少：地圖編輯器／基地編輯器選素材後，在「選中素材」那一列勾「這是水」再填 %
   （存在 data/tiles.js 每個素材的 water：{ depth, speed, see }）
     depth：水深＝水面在角色身高的幾 %（50＝到腰）
     speed：水中走路速度＝平常速度的幾 %（100＝不變慢）
     see：水下看得見＝水面下的身體看得多清楚（0＝完全看不到、100＝跟水面上一樣）
   ・水的範圍＝整張素材圖的範圍（佔幾格就是幾格，透明的地方也算）
   ・走路變慢：js/build.js 的 slowFactorAt 會問 waterSlowAt（溫特、隊員、地面怪物都適用）
   ・下半身半透明：js/render.js 畫角色時用 drawWaded 包起來（先畫在旁邊的空白畫布，再把水面上、水面下分開貼回來）
   ・坐著、躺著、浮在空中的怪物不算泡在水裡 */
const WATER = {
  footDy: 14,        // 角色的位置（x, y）往下幾點是腳（用腳踩的地方判斷是不是在水裡）
  enemyFootDy: 10,   // 怪物的腳
  rippleColor: 'rgba(205,238,255,',   // 水面波紋的顏色（後面接透明度）
};
const WATER_DEFAULT = { depth: 50, speed: 70, see: 45 };

// 素材的水設定（沒有＝不是水）；數字超出範圍會被拉回來
function waterSpecOf(t) {
  const w = t && t.water; if (!w) return null;
  const num = (v, d, lo, hi) => Math.max(lo, Math.min(hi, Number.isFinite(+v) ? +v : d));
  return { depth: num(w.depth, WATER_DEFAULT.depth, 5, 95) / 100, speed: num(w.speed, WATER_DEFAULT.speed, 10, 100) / 100, see: num(w.see, WATER_DEFAULT.see, 0, 100) / 100 };
}
// 這張地圖哪裡有水：換地圖、地圖物件數量變了才重新整理一次
let waterCache = { map: null, n: -1, cells: null, rects: null };
function waterIndex() {
  if (typeof MAP === 'undefined' || !MAP) return null;
  const n = (MAP.stamps || []).length;
  if (waterCache.map === MAP && waterCache.n === n) return waterCache;
  const cells = new Map(), rects = [];
  const order = typeof MAP_LAYER_ORDER !== 'undefined' ? MAP_LAYER_ORDER : Object.keys(MAP.layers || {});
  for (const lid of order) {   // 一格一格放的小圖
    const layer = (MAP.layers || {})[lid] || {};
    for (const key in layer) { const spec = waterSpecOf(mapTileById(layer[key])); if (spec) cells.set(key, spec); }
  }
  for (const s of MAP.stamps || []) {   // 大張的物件
    const t = mapTileById(s.id), spec = waterSpecOf(t); if (!spec) continue;
    const x0 = OX + s.c * CELL + (s.ox || 0), y0 = OY + s.r * CELL + (s.oy || 0);
    rects.push({ x0, y0, x1: x0 + mapStampW(s, t) * CELL, y1: y0 + mapStampH(s, t) * CELL, spec });
  }
  waterCache = { map: MAP, n, cells, rects };
  return waterCache;
}
// 這個點（腳踩的地方）有沒有水；有的話回傳水的設定
function waterAt(x, y) {
  const w = waterIndex(); if (!w || (!w.cells.size && !w.rects.length)) return null;
  const [c, r] = cellAt(x, y), cell = w.cells.get(c + ',' + r);
  let best = cell || null;
  for (const q of w.rects) if (x >= q.x0 && x < q.x1 && y >= q.y0 && y < q.y1 && (!best || q.spec.depth > best.depth)) best = q.spec;   // 疊在一起：用比較深的
  return best;
}
// 給 js/build.js 的 slowFactorAt：在水裡走路變慢（x, y＝角色的位置）
function waterSlowAt(x, y) { const w = waterAt(x, y + WATER.footDy); return w ? w.speed : 1; }

// 角色現在泡在哪種水裡、身體多高、腳在哪（沒泡在水裡＝null）
function wadeInfo(a, kind) {
  if (!a || a.sitting || a.eatenBy || a.grabbed || a.grabFall) return null;
  if (kind === 'enemy') {
    if ((a.slimeLift || 0) > 4 || a.dead) return null;   // 浮在空中、跳起來的時候不算
    const w = waterAt(a.x, a.y + WATER.enemyFootDy); if (!w) return null;
    return { w, bottom: a.y + 13, height: (a.drawHeight || 33) * (a.sizeMul || 1), width: (a.drawWidth || 42) * (a.sizeMul || 1) };
  }
  const w = waterAt(a.x, a.y + WATER.footDy); if (!w) return null;
  const size = (typeof PLAYER !== 'undefined' && PLAYER.drawSize) || 64;
  return { w, bottom: a.y + 18, height: size, width: size * .62 };
}

// 畫一個角色：在水裡的話，水面上照常畫、水面下半透明，再加一圈波紋
let waterLayer = null;   // 旁邊的空白畫布（跟遊戲畫面一樣大）
function drawWaded(a, kind, drawFn) {
  const info = wadeInfo(a, kind);
  if (!info) { drawFn(); return; }
  const main = ctx, cvs = main.canvas, m = main.getTransform();
  if (!waterLayer) waterLayer = document.createElement('canvas');
  if (waterLayer.width !== cvs.width || waterLayer.height !== cvs.height) { waterLayer.width = cvs.width; waterLayer.height = cvs.height; }
  const wctx = waterLayer.getContext('2d');
  // 要處理的範圍（畫面像素）：角色左右、頭上的名字和血條、腳下一點點
  const toX = x => m.a * x + m.e, toY = y => m.d * y + m.f;
  const pad = Math.max(info.width, 48) + 24;
  const sx = Math.max(0, Math.floor(toX(a.x - pad))), ex = Math.min(cvs.width, Math.ceil(toX(a.x + pad)));
  const sy = Math.max(0, Math.floor(toY(info.bottom - info.height - 60))), ey = Math.min(cvs.height, Math.ceil(toY(info.bottom + 16)));
  if (ex <= sx || ey <= sy) { drawFn(); return; }
  wctx.setTransform(1, 0, 0, 1, 0, 0); wctx.clearRect(sx, sy, ex - sx, ey - sy);
  wctx.setTransform(m); wctx.imageSmoothingEnabled = main.imageSmoothingEnabled; wctx.globalAlpha = main.globalAlpha; wctx.filter = main.filter;
  ctx = wctx;   // 角色先畫在空白畫布上（js/game.js 的 ctx 是 let，畫完一定換回來）
  try { drawFn(); } finally { ctx = main; }
  // 貼回遊戲畫面：水面以上照常、水面以下半透明
  const line = Math.round(toY(info.bottom - info.height * info.w.depth)), cut = Math.max(sy, Math.min(ey, line));
  main.save(); main.setTransform(1, 0, 0, 1, 0, 0); main.globalAlpha = 1; main.filter = 'none';
  if (cut > sy) main.drawImage(waterLayer, sx, sy, ex - sx, cut - sy, sx, sy, ex - sx, cut - sy);
  if (ey > cut && info.w.see > 0) { main.globalAlpha = info.w.see; main.drawImage(waterLayer, sx, cut, ex - sx, ey - cut, sx, cut, ex - sx, ey - cut); }
  main.restore();
  drawWaterRipple(a, info);
}
// 水面那一圈波紋：站著時淡淡一圈，走動時再往外擴散
function drawWaterRipple(a, info) {
  const y = info.bottom - info.height * info.w.depth, rx = info.width * .5, ry = Math.max(2.5, rx * .22);
  const t = performance.now() / 1000;
  ctx.save();
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = WATER.rippleColor + '.55)';
  ctx.beginPath(); ctx.ellipse(a.x, y, rx, ry, 0, 0, Math.PI * 2); ctx.stroke();
  if (a.moving || (a.walkUntil && a.walkUntil > t)) {   // 走動中：一圈一圈往外擴散、慢慢變淡
    for (let i = 0; i < 2; i++) {
      const k = ((t * 1.6) + i * .5) % 1;
      ctx.strokeStyle = WATER.rippleColor + (.45 * (1 - k)).toFixed(3) + ')';
      ctx.beginPath(); ctx.ellipse(a.x, y, rx * (1 + k * .9), ry * (1 + k * .9), 0, 0, Math.PI * 2); ctx.stroke();
    }
  }
  ctx.restore();
}
