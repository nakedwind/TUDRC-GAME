/* ===== 水底的網狀光紋（像游泳池底那種一大片慢慢流動的光網）=====
   有畫 🛟 深水區的地圖才有（池核、W118區 地下水池），只鋪在深水區的格子上（包含 🔒 永遠深水）。
   怎麼做的：
     ・光紋用一張手畫的水紋圖（POOL_CAUSTICS.image，120×120、四邊接得起來），重複鋪滿整片水池
     ・只取圖裡「比底色亮的水紋線」當光，底色不畫：用「濾色」疊在水池圖上面，只會讓水變亮，不會蓋掉原本的顏色和圖案
     ・水紋輕輕扭曲：每個點照波浪往旁邊挪一點（最多 warp 點），算出一輪 frames 張，輪流播（相鄰兩張交叉淡入淡出），看起來像水在晃
     ・整片光紋再朝 drift 的方向慢慢飄
   數值：在「🌊 水波紋編輯器」調，存在 data/pool-caustics.js（遊戲和編輯器讀同一份；編輯器的預覽也是用這支程式畫的）。
   換圖：把新的圖放進專案、在編輯器改「水紋圖」就好（圖要能無縫拼接：左邊接右邊、上面接下面看不出接縫）。
   水位：抽水抽成淺水時，一般深水區的光紋跟著水位淡掉（js/pool-tide.js 的 poolTide().deep）；永遠深水的照樣有。
   畫的順序：地面圖層畫完之後、人物和牆之前（js/render.js 的 draw 呼叫 drawPoolCaustics），所以人物、柱子會蓋在光紋上面。
   扭曲的圖一張要算幾毫秒：第一次畫的時候只先算第一張，其他的趁瀏覽器有空時在背景一張一張算（poolCausticWarm），
   還沒算好的那張先用已經算好的頂著，所以不會一頓一頓。 */
// 數值都在 data/pool-caustics.js（水波紋編輯器存的那一份），這裡不另外寫一份；那個檔沒載入就不畫光紋
const POOL_CAUSTICS = Object.assign({ on: false }, typeof POOL_CAUSTICS_TUNING !== 'undefined' ? JSON.parse(JSON.stringify(POOL_CAUSTICS_TUNING)) : {});

// ---- 水紋圖：讀進來、只留水紋線的亮度（0～1）----
let poolCausticSrc = null;   // { size, w, h, m：每個點的亮度 }
let poolCausticImg = null, poolCausticImgFor = null;   // 讀進來的圖、它是哪個檔
function poolCausticSource() {
  if (poolCausticSrc) return poolCausticSrc;
  if (!poolCausticImg) { poolCausticImg = new Image(); poolCausticImg.src = POOL_CAUSTICS.image + '?v=1'; poolCausticImgFor = POOL_CAUSTICS.image; }
  const im = poolCausticImg;
  if (!im.complete || !im.naturalWidth) return null;   // 圖還沒載好：這一幀先不畫
  const w = im.naturalWidth, h = im.naturalHeight;
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const g = cv.getContext('2d'); g.drawImage(im, 0, 0);
  const d = g.getImageData(0, 0, w, h).data, lum = new Float32Array(w * h);
  let lo = Infinity, hi = -Infinity;
  for (let i = 0; i < w * h; i++) { const v = d[i * 4] * .3 + d[i * 4 + 1] * .59 + d[i * 4 + 2] * .11; lum[i] = v; if (v < lo) lo = v; if (v > hi) hi = v; }
  // 最暗的＝底色、最亮的＝水紋線最亮的地方；換成 0～1，再去掉 lineFrom 以下（底色上的雜點）
  const m = new Float32Array(w * h), cut = Math.max(0, Math.min(.95, POOL_CAUSTICS.lineFrom || 0)), span = Math.max(1, hi - lo);
  for (let i = 0; i < w * h; i++) m[i] = Math.max(0, ((lum[i] - lo) / span - cut) / (1 - cut));
  return (poolCausticSrc = { w, h, m });
}

// 數值改了要重算（水波紋編輯器用）：圖、取線、扭曲、張數、顏色改了，之前算好的圖都不能用
function poolCausticReset() {
  if (poolCausticImgFor !== POOL_CAUSTICS.image) poolCausticImg = null;   // 換了圖：重新讀
  poolCausticSrc = null; poolCausticFrames.length = 0;
}

// 扭一輪幾張（整數、至少 1）
const poolCausticCount = () => Math.max(1, Math.round(POOL_CAUSTICS.frames) || 1);

// ---- 扭曲過的光紋圖（每一張只算一次，存起來重複用）----
const poolCausticFrames = [];
function poolCausticFrame(k) {
  if (poolCausticFrames[k]) return poolCausticFrames[k];
  const src = poolCausticSource(); if (!src) return null;
  const C = POOL_CAUSTICS, { w, h, m } = src, [cr, cg, cb] = C.color || [255, 255, 255];
  const t = k / poolCausticCount() * Math.PI * 2, TAU = Math.PI * 2, A = C.warp || 0;
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
    const n = poolCausticCount(); let k = 0; while (k < n && poolCausticFrames[k]) k++;
    if (k >= n) { poolCausticWarming = false; return; }
    poolCausticFrame(k); idle(step);
  };
  idle(step);
}
// 第 k 張可以用的光紋圖：算好了就用它，還沒算好就往前找最近一張算好的；一張都沒有就先算第一張（圖還沒載好＝null，這一幀不畫）
function poolCausticReady(k) {
  const n = poolCausticCount();
  for (let i = 0; i < n; i++) { const fr = poolCausticFrames[(k - i + n) % n]; if (fr) return fr; }
  const first = poolCausticFrame(0);
  if (first) poolCausticWarm();
  return first;
}

// ---- 深水區的形狀（換地圖、改深水區才重算）----
// 每一幀都要先把畫面裁成深水區的形狀：同一排相連的格子先合成一長條，上下幾排長條一樣的再合成一大塊，
// 方塊越少裁得越快（W118 五百多格 → 幾十塊）；另外記下整片的範圍，不在畫面裡就整個跳過
let poolCausticArea = { map: null, deep: null, keep: null, paths: null };
function poolCausticShape(keys) {
  const rows = new Map();   // 第幾排 → 這排有哪幾格
  for (const k of keys) {
    const [c, r] = String(k).split(',').map(Number);
    if (!Number.isFinite(c) || !Number.isFinite(r)) continue;
    if (!rows.has(r)) rows.set(r, []);
    rows.get(r).push(c);
  }
  if (!rows.size) return null;
  // 每排的長條：[從第幾格, 到第幾格]
  const runsOf = new Map();
  for (const [r, cs] of rows) {
    cs.sort((a, b) => a - b);
    const runs = []; let a = cs[0], b = cs[0];
    for (let i = 1; i < cs.length; i++) { if (cs[i] === b + 1) b = cs[i]; else if (cs[i] > b) { runs.push([a, b]); a = b = cs[i]; } }
    runs.push([a, b]); runsOf.set(r, runs);
  }
  // 往下接：下一排有一模一樣的長條就併成同一塊
  const path = new Path2D(), open = new Map();   // 'a,b' → { r0, r1 }
  let blocks = 0, x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const close = (key, blk) => {
    const [a, b] = key.split(',').map(Number);
    const x = OX + a * CELL, y = OY + blk.r0 * CELL, w = (b - a + 1) * CELL, h = (blk.r1 - blk.r0 + 1) * CELL;
    path.rect(x, y, w, h); blocks++;
    x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x + w); y1 = Math.max(y1, y + h);
  };
  for (const r of [...runsOf.keys()].sort((a, b) => a - b)) {
    const here = new Set(runsOf.get(r).map(([a, b]) => a + ',' + b));
    for (const [key, blk] of [...open]) if (!here.has(key) || blk.r1 !== r - 1) { close(key, blk); open.delete(key); }
    for (const key of here) { const blk = open.get(key); if (blk) blk.r1 = r; else open.set(key, { r0: r, r1: r }); }
  }
  for (const [key, blk] of open) close(key, blk);
  return { path, blocks, x0, y0, x1, y1 };
}
function poolCausticPaths() {
  if (typeof MAP === 'undefined' || !MAP) return null;
  const A = poolCausticArea;
  if (A.map === MAP && A.deep === MAP.deepWater && A.keep === MAP.deepWaterKeep) return A.paths;
  const keepSet = new Set(Array.isArray(MAP.deepWaterKeep) ? MAP.deepWaterKeep : []);
  const normal = poolCausticShape((Array.isArray(MAP.deepWater) ? MAP.deepWater : []).filter(k => !keepSet.has(k)));
  const keep = poolCausticShape([...keepSet]);
  poolCausticArea = { map: MAP, deep: MAP.deepWater, keep: MAP.deepWaterKeep, paths: normal || keep ? { normal, keep } : null };
  return poolCausticArea.paths;
}

// ---- 鋪光紋（遊戲和水波紋編輯器的預覽共用這一段）----
// list：要鋪的幾片 [{ sh：形狀（path、x0、y0、x1、y1）, a：這片多亮（0～1） }]；v：畫面看得到的範圍；ox0、oy0：圖樣從哪裡開始鋪
const poolCausticMatrix = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };   // 圖樣的位置、大小（重複用同一個，不用每幀新建）
function paintPoolCaustics(ctx, list, v, ox0, oy0, now) {
  const C = POOL_CAUSTICS;
  if (!C.on || !(C.alpha > 0) || !list.length) return;
  const sc = C.scale || 1, frames = poolCausticCount();
  const ph = (now / (C.loopSecs || 1) % 1) * frames, f0 = Math.floor(ph) % frames, f1 = (f0 + 1) % frames, mix = ph - Math.floor(ph);
  const fr0 = poolCausticReady(f0); if (!fr0) return;   // 水紋圖還沒載好
  const span = fr0.cv.width * sc, drift = C.drift || [0, 0];
  const M = poolCausticMatrix; M.a = M.d = sc; M.e = ox0 + (drift[0] * now) % span; M.f = oy0 + (drift[1] * now) % span;
  // 這一幀要用的兩張圖（相鄰兩張交叉淡入淡出，水紋才是慢慢扭動，不是一格一格跳）
  const pair = [];
  for (const [k, w] of [[f0, 1 - mix], [f1, mix]]) {
    if (w <= .002) continue;
    const fr = poolCausticReady(k); if (!fr) continue;
    if (!poolCausticFrames[k]) poolCausticWarm();
    if (!fr.pattern) fr.pattern = ctx.createPattern(fr.cv, 'repeat');   // 每張圖的圖樣只建一次
    fr.pattern.setTransform(M);
    pair.push([fr.pattern, w]);
  }
  for (const { sh, a } of list) {
    // 只鋪「畫面」和「這片深水」重疊的地方
    const x0 = Math.max(v.x0, sh.x0), y0 = Math.max(v.y0, sh.y0), x1 = Math.min(v.x1, sh.x1), y1 = Math.min(v.y1, sh.y1);
    if (x1 <= x0 || y1 <= y0 || a <= 0) continue;
    ctx.save();
    if (sh.path) ctx.clip(sh.path);
    ctx.globalCompositeOperation = C.blend || 'screen';
    for (const [pat, w] of pair) {
      ctx.globalAlpha = C.alpha * a * w;
      ctx.fillStyle = pat;
      ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    }
    ctx.restore();
  }
}

// ---- 畫（js/render.js 的 draw：地面圖層之後、人物之前）----
function drawPoolCaustics(ctx) {
  const C = POOL_CAUSTICS;
  if (!C.on || !(C.alpha > 0)) return;
  const paths = poolCausticPaths(); if (!paths) return;
  const s = typeof poolTideActive === 'function' && poolTideActive() && typeof poolTide === 'function' ? poolTide() : null;
  const deepLevel = s ? Math.max(0, Math.min(1, s.deep)) : 1;   // 抽水抽成淺水：一般深水區的光紋跟著淡掉
  // 要鋪的範圍：畫面看得到的地方（沒有就整張地圖）
  const v = typeof mapDrawRect !== 'undefined' && mapDrawRect ? mapDrawRect : { x0: OX, y0: OY, x1: OX + COLS * CELL, y1: OY + ROWS * CELL };
  const inView = sh => sh && sh.x1 > v.x0 && sh.x0 < v.x1 && sh.y1 > v.y0 && sh.y0 < v.y1;
  const list = [];
  if (deepLevel > 0 && inView(paths.normal)) list.push({ sh: paths.normal, a: deepLevel });
  if (inView(paths.keep)) list.push({ sh: paths.keep, a: 1 });
  if (!list.length) return;   // 畫面裡沒有深水：什麼都不用做
  paintPoolCaustics(ctx, list, v, OX, OY, performance.now() / 1000);
}
