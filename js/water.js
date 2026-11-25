/* ===== 水：角色走進「水」素材的範圍 → 泡在水裡 =====
   哪些素材是水、數字多少：地圖編輯器／基地編輯器選素材後，在「選中素材」那一列勾「這是水」再填 %
   （存在 data/tiles.js 每個素材的 water：{ depth, speed, see }）
     depth：水深＝水面在角色身高的幾 %（角色是大頭比例：25≈到腰、50≈到臉）
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
  rippleFlat: .55,   // 波紋的扁度＝高÷寬（1＝正圓、越小越扁；原本 .22 太扁，俯視角看起來怪）
  // 在水裡游的怪物（深水裡的魚、在水裡的小丑魚）：身體跟著水慢慢上下浮、微微前後晃，水面位置不動
  bob: {
    amp: .045,       // 上下浮多少＝身高的幾倍
    ampMin: 1.5,     // 最少浮幾像素（太小的怪物也看得出來）
    speed: 2.1,      // 停著時浮沉多快（越大越快）
    moveSpeed: 2.8,  // 游動時浮沉多快
    tilt: .05,       // 前後晃多少（弧度）
  },
};
// 在水裡游的怪物：每張圖的眼睛在圖裡的高度（像素，從圖片最上面往下數）。
// 有些動作圖（例如小丑魚跳起來那張）整隻畫得比較高，直接換圖的話泡在水裡會忽高忽低；
// 這裡記下眼睛的位置，泡在水裡時每張圖都把眼睛對齊到「站姿圖（front）」的眼睛高度，水面就永遠在眼睛下面同一個地方。
// 新增會在水裡游、而且動作圖高低不一樣的怪物時，把牠每張圖的眼睛高度加進來（沒列的圖不調整）。
const WATER_EYE_Y = {
  'images/monster/clownfish/clownfish-front.png': 52,
  'images/monster/clownfish/clownfish-front-02.png': 54,
  'images/monster/clownfish/clownfish-blink.png': 54,
  'images/monster/clownfish/clownfish-hop-crouch.png': 57,
  'images/monster/clownfish/clownfish-hop-air.png': 26,
  'images/monster/clownfish/clownfish-small-front.png': 32,
  'images/monster/clownfish/clownfish-small-hop.png': 13,
};
// js/render.js 的 drawEnemy 呼叫：這張圖要往下（正數）或往上挪幾像素，眼睛才會跟站姿圖對齊（只有在水裡游的時候）
function waterEyeShift(e, file, drawH, naturalH) {
  if (!e || !(e.aqua || e.waterSwim) || (e.slimeLift || 0) > 4 || !file || !naturalH || !e.frames) return 0;
  const ref = WATER_EYE_Y[e.frames.front], cur = WATER_EYE_Y[file];
  if (ref == null || cur == null) return 0;
  return (ref - cur) * drawH / naturalH;
}
// 怪物泡水時，水面跟身體交界改成橢圓（跟水面波紋的前半圈一樣），不是一條直線
const WATER_OVAL_ENEMY = true;
const WATER_DEFAULT = { depth: 25, speed: 70, see: 45 };   // 沒填的數字用這個

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
    for (const key in layer) { const spec = waterSpecOf(mapTileById(layer[key])); if (spec) cells.set(key, { ...spec, lid }); }
  }
  for (const s of MAP.stamps || []) {   // 大張的物件
    const t = mapTileById(s.id), spec = waterSpecOf(t); if (!spec) continue;
    const x0 = OX + s.c * CELL + (s.ox || 0), y0 = OY + s.r * CELL + (s.oy || 0);
    rects.push({ x0, y0, x1: x0 + mapStampW(s, t) * CELL, y1: y0 + mapStampH(s, t) * CELL, spec: { ...spec, lid: s.layer || 'top' } });
  }
  waterCache = { map: MAP, n, cells, rects };
  return waterCache;
}
// 這個點（腳踩的地方）有沒有水；有的話回傳水的設定
function waterAt(x, y) {
  const w = waterIndex(); if (!w || (!w.cells.size && !w.rects.length)) return null;
  const shown = sp => !sp || typeof poolLayerAlpha !== 'function' || poolLayerAlpha(sp.lid) >= .5;   // 池核抽水後看不到的圖層：裡面的水不算（js/pool-tide.js）
  const [c, r] = cellAt(x, y), cell = w.cells.get(c + ',' + r);
  let best = cell && shown(cell) ? cell : null;
  for (const q of w.rects) if (x >= q.x0 && x < q.x1 && y >= q.y0 && y < q.y1 && shown(q.spec) && (!best || q.spec.depth > best.depth)) best = q.spec;   // 疊在一起：用比較深的
  return best;
}
// 給 js/build.js 的 slowFactorAt：在水裡走路變慢（x, y＝角色的位置）
function waterSlowAt(x, y) { if (onPoolPlatform(x, y)) return 1; const w = waterAt(x, y + WATER.footDy); return w ? w.speed : 1; }
// 站在池核深水裡的平台（救生台）上：平台下緣有水的素材蓋過來，但人是站在平台上、沒有泡在水裡（js/pool-platform.js）
const onPoolPlatform = (x, y) => typeof poolPlatformAt === 'function' && !!poolPlatformAt(x, y);

// 角色現在泡在哪種水裡、身體多高、腳在哪（沒泡在水裡＝null）
function wadeInfo(a, kind) {
  if (!a || a.sitting || a.eatenBy || a.grabbed || a.grabFall) return null;
  if (kind === 'core') return typeof poolCoreWade === 'function' ? poolCoreWade(a) : null;   // 異質核心：只有泡在深水區裡才算（js/pool-tide.js）
  if (kind === 'enemy') {
    if (a.poolBoss && typeof poolBossWade === 'function') { const r = poolBossWade(a); if (r !== undefined) return r; }
    if (a.fishKing && typeof fishKingWade === 'function') { const r = fishKingWade(a); if (r !== undefined) return r; }   // 魚頭王在水裡：露出上半身（js/fish-king.js）
    if (a.aqua && typeof aquaWade === 'function') { const r = aquaWade(a); if (r !== undefined) return r; }   // 生在深水裡的怪物：泡在水裡游（js/water-monsters.js）   // 池核 BOSS 在深水區：露出上半身（js/pool-boss.js）
    if ((a.slimeLift || 0) > 4 || a.dead) return null;   // 浮在空中、跳起來的時候不算
    const w = waterAt(a.x, a.y + WATER.enemyFootDy); if (!w) return null;
    return { w, bottom: a.y + 13, height: (a.drawHeight || 33) * (a.sizeMul || 1), width: (a.drawWidth || 42) * (a.sizeMul || 1) };
  }
  if (onPoolPlatform(a.x, a.y)) return null;   // 站在救生台上：不算泡在水裡（不然下半身會被藏起來，看起來像被平台蓋住）
  const w = waterAt(a.x, a.y + WATER.footDy); if (!w) return null;
  const size = (typeof PLAYER !== 'undefined' && PLAYER.drawSize) || 64;
  return { w, bottom: a.y + 18, height: size, width: size * .62 };
}

// 畫一個角色：在水裡的話，水面上照常畫、水面下半透明，再加一圈波紋
let waterLayer = null;   // 旁邊的空白畫布（跟遊戲畫面一樣大）
function drawWaded(a, kind, drawFn) {
  // 失足搖晃、掉進水裡、溺水掙扎（js/pool-fall.js）：整個人轉一點、上下浮沉，掙扎時泡到脖子
  const fall = kind === 'char' && typeof poolFallPose === 'function' ? poolFallPose(a)
    : kind === 'enemy' && a && a.poolMFall && typeof poolMonsterFallPose === 'function' ? poolMonsterFallPose(a)   // 怪物被推下深水（js/pool-monster-fall.js）
    : kind === 'float' ? a.floatPose || null : null;   // 漂在水上的東西（丟進深水的道具，js/ground-items.js；姿勢由 js/pool-fall.js 的 poolFloatPose 算）
  if (fall) {
    const inner = drawFn, py = a.y + fall.pivot;
    drawFn = () => { ctx.save(); ctx.translate(a.x, py); ctx.rotate(fall.rot); ctx.translate(-a.x, -py + fall.dy); try { inner(); } finally { ctx.restore(); } };
  }
  const info = a && a.swimRing ? null : (fall && fall.wade) || wadeInfo(a, kind);   // 坐在救生圈上：整個人照常畫，不會被水遮住
  if (a && a.swimRing && typeof drawSwimRinged === 'function') {   // 坐進救生圈：腳藏起來（js/swim-ring.js），救生圈外面一圈水波紋
    const ri = typeof swimRingRippleInfo === 'function' ? swimRingRippleInfo(a) : null;
    if (ri) drawWaterRipple(a, ri, 'back');
    drawSwimRinged(a, drawFn);
    if (ri) drawWaterRipple(a, ri, 'front');
    return;
  }   // 坐進救生圈：腳藏起來（js/swim-ring.js）
  if (!info) { drawFn(); return; }
  // 在水裡游的怪物：身體載浮載沉（只有身體動，水面那條線和波紋留在原地，看起來就像在水裡一浮一沉）
  if (kind === 'enemy' && !fall && (a.aqua || a.waterSwim)) {
    const B = WATER.bob, t = performance.now() / 1000, seed = a.bobSeed || (a.bobSeed = Math.random() * 20);
    a.bobPhase = (a.bobPhase == null ? seed : a.bobPhase) + (a.moving ? B.moveSpeed : B.speed) * (t - (a.bobT || t));   // 用累加的相位：游／停切換時不會突然跳一下
    a.bobT = t;
    const ph = a.bobPhase, amp = Math.max(B.ampMin, info.height * B.amp);
    const dy = Math.sin(ph) * amp, rot = Math.sin(ph * .5 + seed) * B.tilt * (a.faceRight ? -1 : 1);
    const inner = drawFn, py = info.bottom - info.height * info.w.depth;
    drawFn = () => { ctx.save(); ctx.translate(a.x, py + dy); ctx.rotate(rot); ctx.translate(-a.x, -py); try { inner(); } finally { ctx.restore(); } };
  }
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
  drawWaterRipple(a, info, 'back');   // 波紋後半圈（離鏡頭遠的上半弧）：先畫，角色會蓋在它上面，才不會壓到頭
  main.save(); main.setTransform(1, 0, 0, 1, 0, 0); main.globalAlpha = 1; main.filter = 'none';
  if (kind === 'enemy' && WATER_OVAL_ENEMY) {
    // 怪物：水面跟身體的交界照波紋前半圈的橢圓弧走（中間往下彎），不是一條直線
    const rx = Math.abs(m.a) * info.width * .5, ry = Math.abs(m.d) * Math.max(2.5, info.width * .5 * (info.flat || WATER.rippleFlat)), cx = toX(a.x);
    const oval = c => c.ellipse(cx, cut, rx, ry, 0, 0, Math.PI);   // 下半個橢圓（靠鏡頭那一半）
    main.save();   // 水面上：直線以上＋下半個橢圓裡面 → 照常畫
    main.beginPath(); main.rect(sx, sy, ex - sx, cut - sy); main.moveTo(cx + rx, cut); oval(main); main.closePath(); main.clip();
    main.drawImage(waterLayer, sx, sy, ex - sx, ey - sy, sx, sy, ex - sx, ey - sy);
    main.restore();
    if (ey > cut && info.w.see > 0) {   // 水面下：直線以下、扣掉那半個橢圓 → 半透明
      main.save(); main.globalAlpha = info.w.see;
      main.beginPath(); main.rect(sx, cut, ex - sx, ey - cut); main.moveTo(cx + rx, cut); oval(main); main.closePath(); main.clip('evenodd');
      main.drawImage(waterLayer, sx, cut, ex - sx, ey - cut, sx, cut, ex - sx, ey - cut);
      main.restore();
    }
  } else {
    if (cut > sy) main.drawImage(waterLayer, sx, sy, ex - sx, cut - sy, sx, sy, ex - sx, cut - sy);
    if (ey > cut && info.w.see > 0) { main.globalAlpha = info.w.see; main.drawImage(waterLayer, sx, cut, ex - sx, ey - cut, sx, cut, ex - sx, ey - cut); }
  }
  main.restore();
  drawWaterRipple(a, info, 'front');   // 波紋前半圈（靠鏡頭的下半弧）：最後畫，在角色前面
}
// 水面那一圈波紋：站著時淡淡一圈，走動時再往外擴散
// part：'back'＝只畫上半弧（在角色後面）、'front'＝只畫下半弧（在角色前面）、沒給＝整圈
function drawWaterRipple(a, info, part) {
  const a0 = part === 'front' ? 0 : Math.PI, a1 = part === 'back' ? Math.PI * 2 : part === 'front' ? Math.PI : Math.PI * 3;   // canvas 角度：0～π＝下半、π～2π＝上半
  const y = info.bottom - info.height * info.w.depth, rx = info.width * .5, ry = Math.max(2.5, rx * (info.flat || WATER.rippleFlat));   // info.flat：這隻自己的扁度（魚頭王，js/fish-king.js 的 FISH_KING.oval）
  const t = performance.now() / 1000;
  ctx.save();
  ctx.lineWidth = 1.2;
  if (!(info.ripple && info.ripple.noBase)) {   // 貼著身體、一直在的那一圈（info.ripple.noBase＝不要這圈，只有往外擴散的）
    ctx.strokeStyle = WATER.rippleColor + '.55)';
    ctx.beginPath(); ctx.ellipse(a.x, y, rx, ry, 0, a0, a1); ctx.stroke();
  }
  // 一圈一圈往外擴散、慢慢變淡：走動中照下面的預設；info.ripple 有給的話（例如陣亡漂在水上，js/pool-fall.js）就一直擴散、照它的速度和大小
  const R = info.ripple || ((a.moving || (a.walkUntil && a.walkUntil > t)) ? { speed: 1.6, rings: 2, grow: .9, alpha: .45 } : null);
  if (R) {
    for (let i = 0; i < R.rings; i++) {
      const k = ((t * R.speed) + i / R.rings + (R.phase || 0)) % 1;
      ctx.strokeStyle = WATER.rippleColor + (R.alpha * (1 - k)).toFixed(3) + ')';
      ctx.beginPath(); ctx.ellipse(a.x, y, rx * (1 + k * R.grow), ry * (1 + k * R.grow), 0, a0, a1); ctx.stroke();
    }
  }
  ctx.restore();
}
