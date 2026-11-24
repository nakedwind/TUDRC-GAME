/* ===== 水底的網狀光紋（像游泳池底那種一大片慢慢流動的光網）=====
   有畫 🛟 深水區的地圖才有（池核、W118區 地下水池），只鋪在深水區的格子上（包含 🔒 永遠深水）。
   怎麼做的：
     ・光紋用一張手畫的水紋圖（POOL_CAUSTICS.image，120×120、四邊接得起來），重複鋪滿整片水池
     ・只取圖裡「比底色亮的水紋線」當光，底色不畫：用「濾色」疊在水池圖上面，只會讓水變亮，不會蓋掉原本的顏色和圖案
     ・水紋輕輕扭曲：每個點照波浪往旁邊挪一點（最多 warp 點），算出一輪 frames 張，輪流播（相鄰兩張交叉淡入淡出），看起來像水在晃
     ・整片光紋再朝 drift 的方向慢慢飄
   換圖：把新的圖放進專案、改 POOL_CAUSTICS.image 就好（圖要能無縫拼接：左邊接右邊、上面接下面看不出接縫）。
   水位：抽水抽成淺水時，一般深水區的光紋跟著水位淡掉（js/pool-tide.js 的 poolTide().deep）；永遠深水的照樣有。
   畫的順序：地面圖層畫完之後、人物和牆之前（js/render.js 的 draw 呼叫 drawPoolCaustics），所以人物、柱子會蓋在光紋上面。
   扭曲的圖一張要算幾毫秒：第一次畫的時候只先算第一張，其他的趁瀏覽器有空時在背景一張一張算（poolCausticWarm），
   還沒算好的那張先用已經算好的頂著，所以不會一頓一頓。 */
const POOL_CAUSTICS = {
  on: true,              // false＝不要光紋
  image: 'images/Poolcore/Poolcore_caustics.png',   // 水紋圖（要能無縫拼接）
  scale: 1,              // 水紋圖放大幾倍（1＝原尺寸，120 點一張）
  lineFrom: .12,         // 比底色亮多少才算水紋線（0～1：0＝圖裡所有比底色亮的都算、越大只留最亮的線）
  warp: 2.2,             // 扭曲的幅度：每個點最多往旁邊挪幾點（0＝不扭曲；太大線會糊掉）
  frames: 36,            // 扭完一輪要算幾張圖（越多越順）
  loopSecs: 10,          // 扭完一輪要幾秒（越大晃得越慢）
  drift: [4, 2],         // 整片光紋每秒往哪個方向飄幾點（左右, 上下；[0, 0]＝不飄）
  alpha: .55,            // 整片光紋多亮（0～1）
  color: [215, 248, 255],   // 光紋的顏色（紅, 綠, 藍）：淡淡的水藍白
  blend: 'screen',       // 疊上去的方式：screen＝濾色（只變亮）、lighter＝相加（更亮更刺眼）
};

// ---- 水紋圖：讀進來、只留水紋線的亮度（0～1）----
let poolCausticSrc = null;   // { size, w, h, m：每個點的亮度 }
let poolCausticImg = null;
function poolCausticSource() {
  if (poolCausticSrc) return poolCausticSrc;
  if (!poolCausticImg) { poolCausticImg = new Image(); poolCausticImg.src = POOL_CAUSTICS.image + '?v=1'; }
  const im = poolCausticImg;
  if (!im.complete || !im.naturalWidth) return null;   // 圖還沒載好：這一幀先不畫
  const w = im.naturalWidth, h = im.naturalHeight;
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const g = cv.getContext('2d'); g.drawImage(im, 0, 0);
  const d = g.getImageData(0, 0, w, h).data, lum = new Float32Array(w * h);
  let lo = Infinity, hi = -Infinity;
  for (let i = 0; i < w * h; i++) { const v = d[i * 4] * .3 + d[i * 4 + 1] * .59 + d[i * 4 + 2] * .11; lum[i] = v; if (v < lo) lo = v; if (v > hi) hi = v; }
  // 最暗的＝底色、最亮的＝水紋線最亮的地方；換成 0～1，再去掉 lineFrom 以下（底色上的雜點）
  const m = new Float32Array(w * h), cut = POOL_CAUSTICS.lineFrom, span = Math.max(1, hi - lo);
  for (let i = 0; i < w * h; i++) m[i] = Math.max(0, ((lum[i] - lo) / span - cut) / (1 - cut));
  return (poolCausticSrc = { w, h, m });
}

// ---- 扭曲過的光紋圖（每一張只算一次，存起來重複用）----
const poolCausticFrames = [];
function poolCausticFrame(k) {
  if (poolCausticFrames[k]) return poolCausticFrames[k];
  const src = poolCausticSource(); if (!src) return null;
  const C = POOL_CAUSTICS, { w, h, m } = src, [cr, cg, cb] = C.color;
  const t = k / C.frames * Math.PI * 2, TAU = Math.PI * 2, A = C.warp;
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const g = cv.getContext('2d'), img = g.createImageData(w, h), d = img.data;
  // 讀某個位置的亮度：超出圖的範圍就從另一邊接回來（圖是無縫拼接的），位置不是整數就用旁邊四個點混合，線才不會鋸齒
  const at = (x, y) => {
    x = ((x % w) + w) % w; y = ((y % h) + h) % h;
    const x0 = Math.floor(x), y0 = Math.floor(y), x1 = (x0 + 1) % w, y1 = (y0 + 1) % h, fx = x - x0, fy = y - y0;
    return (m[y0 * w + x0] * (1 - fx) + m[y0 * w + x1] * fx) * (1 - fy) + (m[y1 * w + x0] * (1 - fx) + m[y1 * w + x1] * fx) * fy;
  };
  // 波浪：用整數倍的波長（扭過之後圖的四邊還是接得起來）；跟著 t 轉一圈（最後一張接回第一張）
  const wave = (a, size, n, ph) => Math.sin(TAU * n * a / size + ph);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const sx = x + A * (wave(y, h, 1, t) + .6 * wave(y + x, w, 2, -t + 1.3));
    const sy = y + A * (wave(x, w, 1, -t + .7) + .6 * wave(x - y, h, 2, t + 2.1));
    const v = Math.min(1, at(sx, sy)), i = (y * w + x) * 4;
    d[i] = cr; d[i + 1] = cg; d[i + 2] = cb; d[i + 3] = v * 255;
  }
  g.putImageData(img, 0, 0);
  return (poolCausticFrames[k] = { cv });
}

// 還沒算的光紋圖：趁瀏覽器有空時一張一張算（一次一張，不會卡住畫面）
let poolCausticWarming = false;
function poolCausticWarm() {
  if (poolCausticWarming || !poolCausticSource()) return;
  poolCausticWarming = true;
  const idle = window.requestIdleCallback || (fn => setTimeout(fn, 30));
  const step = () => {
    let k = 0; while (k < POOL_CAUSTICS.frames && poolCausticFrames[k]) k++;
    if (k >= POOL_CAUSTICS.frames) { poolCausticWarming = false; return; }
    poolCausticFrame(k); idle(step);
  };
  idle(step);
}
// 第 k 張可以用的光紋圖：算好了就用它，還沒算好就往前找最近一張算好的；一張都沒有就先算第一張（圖還沒載好＝null，這一幀不畫）
function poolCausticReady(k) {
  for (let i = 0; i < POOL_CAUSTICS.frames; i++) { const fr = poolCausticFrames[(k - i + POOL_CAUSTICS.frames) % POOL_CAUSTICS.frames]; if (fr) return fr; }
  const first = poolCausticFrame(0);
  if (first) poolCausticWarm();
  return first;
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
  const sc = C.scale || 1;
  const ph = (now / C.loopSecs % 1) * C.frames, f0 = Math.floor(ph) % C.frames, f1 = (f0 + 1) % C.frames, mix = ph - Math.floor(ph);
  const fr0 = poolCausticReady(f0); if (!fr0) return;   // 水紋圖還沒載好
  const span = fr0.cv.width * sc, ox = (C.drift[0] * now) % span, oy = (C.drift[1] * now) % span;
  // 要鋪的範圍：畫面看得到的地方（沒有就整張地圖）
  const v = typeof mapDrawRect !== 'undefined' && mapDrawRect ? mapDrawRect : { x0: OX, y0: OY, x1: OX + COLS * CELL, y1: OY + ROWS * CELL };
  const layer = (path, a) => {
    if (!path || a <= 0) return;
    ctx.save();
    ctx.clip(path);
    ctx.globalCompositeOperation = C.blend;
    for (const [k, w] of [[f0, 1 - mix], [f1, mix]]) {   // 相鄰兩張交叉淡入淡出，水紋才是慢慢扭動，不是一格一格跳
      if (w <= 0) continue;
      const fr = poolCausticReady(k); if (!fr) continue;
      if (!poolCausticFrames[k]) poolCausticWarm();
      const pat = ctx.createPattern(fr.cv, 'repeat');
      pat.setTransform(new DOMMatrix().translate(OX + ox, OY + oy).scale(sc));
      ctx.globalAlpha = C.alpha * a * w;
      ctx.fillStyle = pat;
      ctx.fillRect(v.x0, v.y0, v.x1 - v.x0, v.y1 - v.y0);
    }
    ctx.restore();
  };
  layer(paths.normal, deepLevel);
  layer(paths.keep, 1);
}
