/* ===== 水底的網狀光紋（像游泳池底那種一大片慢慢流動的光網）=====
   有畫 🛟 深水區的地圖才有（池核、W118區 地下水池），只鋪在深水區的格子上（包含 🔒 永遠深水）。
   怎麼做的：
     ・用程式算出一張「網子形狀」的光紋圖（很多個網眼，網眼的邊＝亮線），這張圖可以無縫重複鋪滿整片水池
     ・網眼的中心點會各自繞小圈慢慢移動，算出一輪 frames 張圖，輪流播（相鄰兩張交叉淡入淡出），網子就會慢慢扭動、流動
     ・整片光紋再朝 drift 的方向慢慢飄
     ・用「濾色」疊在水池圖上面：只會讓水變亮，不會蓋掉原本的顏色和圖案
   水位：抽水抽成淺水時，一般深水區的光紋跟著水位淡掉（js/pool-tide.js 的 poolTide().deep）；永遠深水的照樣有。
   畫的順序：地面圖層畫完之後、人物和牆之前（js/render.js 的 draw 呼叫 drawPoolCaustics），所以人物、柱子會蓋在光紋上面。
   光紋圖一張要算十幾毫秒：第一次畫的時候只先算第一張，其他的趁瀏覽器有空時在背景一張一張算（poolCausticWarm），
   還沒算好的那張先用已經算好的頂著，所以剛進地圖不到一秒網子就會開始流動，而且不會一頓一頓。 */
const POOL_CAUSTICS = {
  on: true,              // false＝不要光紋
  tile: 120,             // 一張光紋圖多大（點）：會一直重複鋪滿；網眼越多、這張要越大，網眼才不會擠在一起
  cells: 36,             // 一張圖裡有幾個網眼（120 點 36 個 ≈ 一個網眼 20 點，半格；之前試過 36 點）
  wander: .22,           // 網眼中心繞圈的半徑（網眼平均大小的幾倍）：越大網子扭得越厲害
  frames: 36,            // 一輪流動要算幾張圖（越多越順，但第一次要算比較久）
  loopSecs: 12,          // 網子扭完一輪要幾秒（越大流動越慢）
  drift: [5, 2.5],       // 整片光紋每秒往哪個方向飄幾點（左右, 上下）
  line: .2,              // 亮線多粗（網眼平均大小的幾倍）
  sharp: 2.2,            // 亮線邊緣多銳利（越大線越細、越清楚；越小越柔、越糊）
  joint: .35,            // 網線交叉的地方再亮多少（0＝一樣亮）
  curve: .28,            // 網線彎曲的程度（網眼平均大小的幾倍；0＝直線，像裂痕；越大越像水波扭來扭去）
  // 第二層光紋：同一套圖放大、往另一個方向飄、跟第一層錯開時間，兩層交錯起來比較不像整齊的網子
  layer2: { scale: 1.45, drift: [-3.5, 4], alpha: 0, shift: .5 },    // alpha 0＝不要第二層（兩層疊起來太亂，11-25 關掉）；要開回來把 alpha 改成 .55。放大幾倍、每秒往哪飄、亮度是第一層的幾倍、時間錯開幾輪（.5＝半輪）
  alpha: .3,             // 整片光紋多亮（0～1）
  color: [205, 245, 255],   // 光紋的顏色（紅, 綠, 藍）：淡淡的水藍白
  blend: 'screen',       // 疊上去的方式：screen＝濾色（只變亮）、lighter＝相加（更亮更刺眼）
};

// ---- 光紋圖（每一張只算一次，存起來重複用）----
const poolCausticFrames = [];
let poolCausticSeeds = null;
function poolCausticSeed() {
  if (poolCausticSeeds) return poolCausticSeeds;
  // 固定的亂數（每次開遊戲網子長得一樣，不會每次重新整理都變）
  let s = 20261125; const rand = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const C = POOL_CAUSTICS, n = C.cells, size = C.tile;
  // 網眼中心先排成大致平均的格狀再隨機挪一點，網眼大小才不會差太多
  const side = Math.ceil(Math.sqrt(n)), gap = size / side, list = [];
  for (let i = 0; i < n; i++) {
    const gx = i % side, gy = Math.floor(i / side);
    list.push({
      x: (gx + .5 + (rand() - .5) * .8) * gap, y: (gy + .5 + (rand() - .5) * .8) * gap,
      rad: gap * C.wander * (.6 + rand() * .8),          // 繞圈半徑
      ph: rand() * Math.PI * 2,                          // 起點
      spin: (rand() < .5 ? -1 : 1) * (1 + Math.floor(rand() * 2)),   // 一輪繞幾圈（整數＝最後一張接回第一張，動畫無縫循環）
    });
  }
  return (poolCausticSeeds = { list, gap });
}
function poolCausticFrame(k) {
  if (poolCausticFrames[k]) return poolCausticFrames[k];
  const C = POOL_CAUSTICS, size = C.tile, { list, gap } = poolCausticSeed();
  const t = k / C.frames * Math.PI * 2;
  const pts = list.map(p => [p.x + Math.cos(p.ph + t * p.spin) * p.rad, p.y + Math.sin(p.ph + t * p.spin) * p.rad]);
  const cv = document.createElement('canvas'); cv.width = cv.height = size;
  const g = cv.getContext('2d'), img = g.createImageData(size, size), d = img.data;
  const lineW = C.line * gap, [cr, cg, cb] = C.color;
  // 把座標用波浪扭一下，網線就會變成彎彎的（用整數倍的波長，圖的左右、上下才接得起來；跟著 t 轉，網線會扭動）
  const W = C.curve * gap, TAU = Math.PI * 2, wave = (a, n, ph) => Math.sin(TAU * n * a / size + ph);
  for (let y0 = 0; y0 < size; y0++) for (let x0 = 0; x0 < size; x0++) {
    const x = x0 + W * (wave(y0, 2, t) + .5 * wave(y0 + x0, 3, -t * 2 + 1.3));
    const y = y0 + W * (wave(x0, 2, -t + .7) + .5 * wave(x0 - y0, 3, t * 2 + 2.1));
    // 離最近、第二近的網眼中心多遠（圖的左右、上下是接起來的，算距離時繞過邊界也算，才能無縫鋪）
    let f1 = Infinity, f2 = Infinity;
    for (const [px, py] of pts) {
      let dx = Math.abs(x - px) % size, dy = Math.abs(y - py) % size;
      if (dx > size / 2) dx = size - dx; if (dy > size / 2) dy = size - dy;
      const dd = dx * dx + dy * dy;
      if (dd < f1) { f2 = f1; f1 = dd; } else if (dd < f2) f2 = dd;
    }
    // 兩個距離差不多＝在兩個網眼的交界上＝亮線
    const edge = Math.sqrt(f2) - Math.sqrt(f1);
    let v = Math.max(0, 1 - edge / lineW); v = Math.pow(v, C.sharp);
    v *= 1 + C.joint * Math.max(0, 1 - Math.sqrt(f1) / gap);   // 離網眼中心遠的地方（網線交叉處）再亮一點
    const i = (y0 * size + x0) * 4;
    d[i] = cr; d[i + 1] = cg; d[i + 2] = cb; d[i + 3] = Math.min(255, v * 255);
  }
  g.putImageData(img, 0, 0);
  return (poolCausticFrames[k] = { cv });
}

// 還沒算的光紋圖：趁瀏覽器有空時一張一張算（一次一張，不會卡住畫面）
let poolCausticWarming = false;
function poolCausticWarm() {
  if (poolCausticWarming) return;
  poolCausticWarming = true;
  const idle = window.requestIdleCallback || (fn => setTimeout(fn, 30));
  const step = () => {
    let k = 0; while (k < POOL_CAUSTICS.frames && poolCausticFrames[k]) k++;
    if (k >= POOL_CAUSTICS.frames) { poolCausticWarming = false; return; }
    poolCausticFrame(k); idle(step);
  };
  idle(step);
}
// 第 k 張可以用的光紋圖：算好了就用它，還沒算好就往前找最近一張算好的（第一張一定有）
function poolCausticReady(k) {
  for (let i = 0; i < POOL_CAUSTICS.frames; i++) { const fr = poolCausticFrames[(k - i + POOL_CAUSTICS.frames) % POOL_CAUSTICS.frames]; if (fr) return fr; }
  poolCausticWarm();
  return poolCausticFrame(0);
}

// ---- 深水區的形狀（換地圖、改深水區才重算）----
let poolCausticArea = { map: null, deep: null, keep: null, paths: null };
function poolCausticPaths() {
  if (typeof MAP === 'undefined' || !MAP) return null;
  const A = poolCausticArea;
  if (A.map === MAP && A.deep === MAP.deepWater && A.keep === MAP.deepWaterKeep) return A.paths;
  const keepSet = new Set(Array.isArray(MAP.deepWaterKeep) ? MAP.deepWaterKeep : []);
  const make = keys => {
    const path = new Path2D(); let any = false;
    for (const k of keys) { const [c, r] = String(k).split(',').map(Number); if (!Number.isFinite(c) || !Number.isFinite(r)) continue; path.rect(OX + c * CELL, OY + r * CELL, CELL, CELL); any = true; }
    return any ? path : null;
  };
  const normal = make((Array.isArray(MAP.deepWater) ? MAP.deepWater : []).filter(k => !keepSet.has(k)));
  const keep = make([...keepSet]);
  poolCausticArea = { map: MAP, deep: MAP.deepWater, keep: MAP.deepWaterKeep, paths: normal || keep ? { normal, keep } : null };
  return poolCausticArea.paths;
}

// ---- 畫（js/render.js 的 draw：地面圖層之後、人物之前）----
function drawPoolCaustics(ctx) {
  const C = POOL_CAUSTICS;
  if (!C.on || C.alpha <= 0) return;
  const paths = poolCausticPaths(); if (!paths) return;
  const s = typeof poolTideActive === 'function' && poolTideActive() && typeof poolTide === 'function' ? poolTide() : null;
  const deepLevel = s ? Math.max(0, Math.min(1, s.deep)) : 1;   // 抽水抽成淺水：一般深水區的光紋跟著淡掉
  const now = performance.now() / 1000;
  // 一層光紋的設定：第幾輪（決定用哪兩張圖）、飄到哪、放大幾倍、多亮
  const sheets = [{ shift: 0, drift: C.drift, scale: 1, alpha: 1 }];
  if (C.layer2 && C.layer2.alpha > 0) sheets.push(C.layer2);
  // 要鋪的範圍：畫面看得到的地方（沒有就整張地圖）
  const v = typeof mapDrawRect !== 'undefined' && mapDrawRect ? mapDrawRect : { x0: OX, y0: OY, x1: OX + COLS * CELL, y1: OY + ROWS * CELL };
  const layer = (path, a) => {
    if (!path || a <= 0) return;
    ctx.save();
    ctx.clip(path);
    ctx.globalCompositeOperation = C.blend;
    for (const sh of sheets) {
      const ph = ((now / C.loopSecs + (sh.shift || 0)) % 1) * C.frames, f0 = Math.floor(ph) % C.frames, f1 = (f0 + 1) % C.frames, mix = ph - Math.floor(ph);
      const span = C.tile * (sh.scale || 1);
      const ox = (sh.drift[0] * now) % span, oy = (sh.drift[1] * now) % span;
      for (const [k, w] of [[f0, 1 - mix], [f1, mix]]) {   // 相鄰兩張交叉淡入淡出，網子才是慢慢扭動，不是一格一格跳
        if (w <= 0) continue;
        const fr = poolCausticReady(k);
        if (!poolCausticFrames[k]) poolCausticWarm();
        const pat = ctx.createPattern(fr.cv, 'repeat');   // 每次新建：兩層的位置、大小不一樣，共用同一個會互相蓋掉
        pat.setTransform(new DOMMatrix().translate(OX + ox, OY + oy).scale(sh.scale || 1));
        ctx.globalAlpha = C.alpha * a * w * (sh.alpha ?? 1);
        ctx.fillStyle = pat;
        ctx.fillRect(v.x0, v.y0, v.x1 - v.x0, v.y1 - v.y0);
      }
    }
    ctx.restore();
  };
  layer(paths.normal, deepLevel);
  layer(paths.keep, 1);
}
