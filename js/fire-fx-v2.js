// ============================================================
//  火焰特效 V2：火舌維持遊戲原本的畫法（水滴形三層火舌），
//  周圍的火光、火星、火屑、煙照 pixelfx（MIT，github.com/patch-gg/pixelfx）「營火」的做法：
//  - 光：會跟著火焰呼吸的暖光、地上一圈光；火海底下有一明一暗的炭火
//  - 爆裂：偶爾「啪」一聲閃一下，噴出幾顆會彈地的火星
//  - 火屑：被熱氣帶上去、左右飄、越飄越冷，快熄時閃爍
//  - 煙：從火舌尖端捲上去，被風吹斜
//  - 燒傷（怪物身上）：身上三個熱點冒小火舌、火屑往上飄、淡煙；每次扣血時火「轟」一下變大
//
//  FIRE_FX_VERSION：1＝原本畫法（V1 程式完整保留），2＝火焰 V2
//  需要先載入 js/blast-fx-v2.js（共用煙的畫法）
// ============================================================
const FIRE_FX_VERSION = 2;
const FIRE_FX_V2 = {
  burst: { k: 2.2, life: .6 },              // 單次火舌（霧樹、燃燒彈、人面蝶、生命體…）；k＝火光、火星、煙的放大倍率
  pool:  { k: 1.55, per: 22, smoke: .7 },   // 油桶／油箱火海：per＝每多少像素半徑放一叢火；smoke＝煙量倍率
  burn:  { k: 2.3, tick: 1 },               // 怪物燒傷：k＝火舌大小；tick＝多久「轟」一次（跟燒傷扣血同步）
};

const FV2_HOT = ['#ffffff', '#fff3a6', '#ffe26b', '#ffc23d', '#ff8a2a', '#f2561d', '#c9281f', '#8a1f17', '#4a1712'];   // 由熱到冷

function fv2Hash(i, s) { let h = (i * 374761393 + s * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function fv2Noise(x, s = 0) {   // 平滑的雜訊，-1～1
  const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f), a = fv2Hash(i, s), b = fv2Hash(i + 1, s);
  return (a + (b - a) * u) * 2 - 1;
}
const fv2R = (a, b) => a + Math.random() * (b - a);

// ---- 原本畫法的火舌（跟 js/attack-fx.js 的 drawFlameShape、spawnFlameBurst 一樣）----
function fv2FlameShape(ctx, cx, baseY, h, w, tipSway, color) {   // 尖端向上的水滴狀火舌
  const tipX = cx + tipSway, tipY = baseY - h;
  ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(cx - w / 2, baseY);
  ctx.quadraticCurveTo(cx - w * .62, baseY - h * .5, tipX, tipY);
  ctx.quadraticCurveTo(cx + w * .62, baseY - h * .5, cx + w / 2, baseY);
  ctx.quadraticCurveTo(cx, baseY + h * .08, cx - w / 2, baseY); ctx.closePath(); ctx.fill();
}
function fv2Flame3(ctx, cx, baseY, h, w, sway) {   // 三層：外層橙紅、中層黃、核心暖黃
  fv2FlameShape(ctx, cx, baseY, h, w, sway, '#ff5a10');
  fv2FlameShape(ctx, cx, baseY, h * .66, w * .58, sway * .8, '#ffab1e');
  fv2FlameShape(ctx, cx, baseY, h * .28, w * .24, sway * .6, '#ffcf66');
}
// 一叢火舌（＝原本一次 spawnFlameBurst 的量）：快速長出、後段收縮、淡出
function fv2MakeGroup(ox, oy, scale, life = .5) {
  const n = scale > 1.5 ? 6 : 4, tongues = [];
  for (let i = 0; i < n; i++) {
    const center = Math.pow(1 - Math.abs(i - (n - 1) / 2) / ((n - 1) / 2), 1.4);   // 中間主導
    tongues.push({ dx: ((i - (n - 1) / 2) * 8 + fv2R(-2.5, 2.5)) * scale, h: (32 + center * 44 + Math.random() * 8) * scale, w: (16 + center * 14 + Math.random() * 4) * scale,
      phase: Math.random() * 6.283, freq: 11 + Math.random() * 6, lean: fv2R(-7, 7) });
  }
  return { ox, oy, scale, tongues, age: 0, life };
}
function fv2GroupShape(g) {   // 這一刻的整體大小、透明度、底部高度
  const t = Math.min(1, g.age / g.life), rise = t < .25 ? t / .25 : 1, shrink = t < .6 ? 1 : Math.max(.2, 1 - (t - .6) / .4 * .85);
  return { t, gs: (.55 + rise * .45) * shrink, alpha: t < .68 ? 1 : Math.max(0, 1 - (t - .68) / .32), lift: t * 12 };
}
function fv2DrawGroup(ctx, x, y, g) {
  if (g.age >= g.life || g.age < 0) return;
  const { gs, alpha, lift } = fv2GroupShape(g), baseY = y + g.oy - lift;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = alpha;
  for (const tg of g.tongues) {
    const fl = Math.sin(g.age * tg.freq + tg.phase), fl2 = Math.sin(g.age * tg.freq * .6 + tg.phase * 1.7);
    const h = tg.h * gs * (.85 + .15 * fl), w = tg.w * gs * (.9 + .12 * fl2);
    fv2Flame3(ctx, x + g.ox + tg.dx, baseY, h, w, fl * w * .35 + tg.lean * gs);
  }
  ctx.restore();
}
function fv2GroupTip(g) {   // 最高那根火舌的尖端（相對叢的原點，像素）
  const { gs, lift } = fv2GroupShape(g);
  let best = null;
  for (const tg of g.tongues) {
    const fl = Math.sin(g.age * tg.freq + tg.phase), h = tg.h * gs * (.85 + .15 * fl);
    if (!best || h > best.h) best = { h, x: g.ox + tg.dx + fl * tg.w * gs * .35 + tg.lean * gs, y: g.oy - lift - h };
  }
  return best;
}

// ---- 火源：一叢或好幾叢火（burst＝單次、pool＝火海）----
// 粒子（火星、火屑、煙）存在「叢的本地座標」：原點在叢底部、放大 k 倍
function fv2MakeCluster(x, y, k, groupScale, cycling) {
  return { x, y, k, groupScale, cycling, flick: Math.random() * 100, groups: cycling ? [] : [fv2MakeGroup(0, 0, groupScale)], idle: Math.random() * .2,
    smokes: [], sparks: [], embers: [], acc: { smoke: 0, tip: 0, pop: 0, ember: 0 } };
}
function fireV2Burst(x, y, scale = 1) {
  const C = FIRE_FX_V2.burst;
  const src = { kind: 'burst', t: 0, life: C.life, rate: 1, clusters: [fv2MakeCluster(x, y, C.k * scale, scale, false)] };
  (G.firesV2 = G.firesV2 || []).push(src);
  return src;
}
function fireV2Pool(x, y, r) {   // 火海：在橢圓範圍內放好幾叢火；src.power 由外面每幀設定（0～1）
  const C = FIRE_FX_V2.pool, n = Math.max(1, Math.round(r / C.per)), clusters = [], size = Math.min(1.2, Math.max(.6, r / 100));
  for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2 + fv2R(-.3, .3), d = i === 0 ? 0 : Math.sqrt(fv2R(.25, 1)) * r * .72;
    clusters.push(fv2MakeCluster(x + Math.cos(a) * d, y + Math.sin(a) * d * .45, C.k * fv2R(.8, 1.1) * size, size * fv2R(.75, 1), true));
  }
  clusters.sort((a, b) => a.y - b.y);   // 後面的先畫
  const src = { kind: 'pool', t: 0, life: Infinity, power: 1, rate: .55, pool: { x, y, r }, clusters };
  (G.firesV2 = G.firesV2 || []).push(src);
  return src;
}
// 火勢：單次火先快速長出、再縮小；火海照 power
function fv2Env(src) {
  if (src.kind === 'pool') return src.power * Math.min(1, src.t / .3);
  const t = src.t, L = src.life;
  return t < .12 ? .35 + .65 * t / .12 : t < L * .55 ? 1 : Math.max(0, 1 - (t - L * .55) / (L * .45));
}
function fv2Fla(c, t) { return .74 + .16 * fv2Noise(t * 7.3, c.flick) + .1 * fv2Noise(t * 19, c.flick + 1); }

function updateFiresV2(dt) {
  if (!G.firesV2 || !G.firesV2.length) return;
  for (const src of G.firesV2) {
    src.t += dt;
    const env = src.t < src.life ? fv2Env(src) : 0;
    src.env = env;
    for (const c of src.clusters) fv2UpdateCluster(c, src, env, dt);
  }
  G.firesV2 = G.firesV2.filter(src => src.t < src.life || src.clusters.some(c => c.groups.length || c.smokes.length || c.sparks.length || c.embers.length));
}
function fv2UpdateCluster(c, src, env, dt) {
  const t = src.t, A = c.acc, rate = src.rate * env;
  const emit = (key, perSec, fn) => { for (A[key] += perSec * dt; A[key] >= 1; A[key]--) fn(); };
  // 火舌：單次就一叢；火海的每一處火一叢燒完、隔一下再冒一叢（跟原本火海一直冒火舌的感覺一樣）
  for (const g of c.groups) g.age += dt;
  c.groups = c.groups.filter(g => g.age < g.life);
  if (c.cycling && !c.groups.length && env > .05) {
    c.idle -= dt;
    if (c.idle <= 0) { c.idle = fv2R(0, .15); c.groups.push(fv2MakeGroup(fv2R(-12, 12) * c.k, fv2R(-4, 4) * c.k * .5, c.groupScale * (.55 + .45 * env), fv2R(.45, .6))); }
  }
  if (env > .05) {
    const g = c.groups[0];
    if (g) emit('tip', 10 * rate, () => {   // 從火舌尖端捲上去的煙（尖端會晃，煙就跟著扭）
      const tip = fv2GroupTip(g), life = fv2R(.9, 1.6);
      c.smokes.push({ x: tip.x / c.k + fv2R(-1.5, 1.5), y: tip.y / c.k + fv2R(0, 3), vx: fv2R(-4, 4), vy: -fv2R(14, 24), life, max: life, size: fv2R(1.4, 2.4), seed: Math.random() * 100, big: false, col: null, delay: 0 });
    });
    emit('smoke', 5 * rate * (src.kind === 'pool' ? FIRE_FX_V2.pool.smoke : 1), () => {   // 火上方慢慢升起的大團煙
      const life = fv2R(2, 2.9);
      c.smokes.push({ x: fv2R(-5, 5), y: -22 * env - fv2R(0, 8), vx: fv2R(-2, 2), vy: -fv2R(10, 17), life, max: life, size: fv2R(2.4, 3.8), seed: Math.random() * 100, big: false, col: [91, 85, 102], delay: 0 });
    });
    emit('pop', 1.3 * (src.kind === 'pool' ? .7 : 1.6) * env, () => {   // 「啪」：一閃＋幾顆會彈地的火星
      const px = fv2R(-9, 9), py = -fv2R(4, 9);
      c.sparks.push({ flash: true, x: px, y: py, life: .08, max: .08 });
      for (let j = 0, n = 3 + Math.floor(Math.random() * 3); j < n; j++) {
        const a = -Math.PI / 2 + fv2R(-.8, .8), sp = fv2R(110, 220), life = fv2R(.25, .6);
        c.sparks.push({ x: px, y: py, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life, max: life });
      }
    });
    emit('ember', 9 * rate, () => {   // 被熱氣帶上去的火屑
      const life = fv2R(1.1, 2.5);
      c.embers.push({ x: fv2R(-7, 7), y: -fv2R(8, 18), vx: fv2R(-15, 15), vy: -fv2R(25, 60), life, max: life, s: Math.random() < .15 ? 1.2 : fv2R(.6, .9), a: fv2R(0, 6.3), b: fv2R(0, 6.3), age: 0 });
    });
  }
  for (let i = c.smokes.length - 1; i >= 0; i--) {
    const p = c.smokes[i];
    if ((p.life -= dt) <= 0) { c.smokes.splice(i, 1); continue; }
    p.vy -= 16 * dt; p.vx += (Math.sin(t * 1.3 + p.seed) * 6 + 4) * dt; p.vx -= p.vx * 1.6 * dt; p.vy -= p.vy * 1.2 * dt;
    p.x += p.vx * dt; p.y += p.vy * dt;
  }
  for (let i = c.sparks.length - 1; i >= 0; i--) {
    const p = c.sparks[i];
    if ((p.life -= dt) <= 0) { c.sparks.splice(i, 1); continue; }
    if (p.flash) continue;
    p.vy += 430 * dt; p.vx -= p.vx * 2.2 * dt; p.vy -= p.vy * 2.2 * dt;
    p.x += p.vx * dt; p.y += p.vy * dt;
    if (p.y > 0 && p.vy > 0) { p.y = 0; p.vy *= -.45; p.vx *= .7; }   // 落地彈一下
  }
  for (let i = c.embers.length - 1; i >= 0; i--) {
    const p = c.embers[i];
    if ((p.life -= dt) <= 0) { c.embers.splice(i, 1); continue; }
    p.age += dt; p.vy -= 30 * dt; p.vx -= p.vx * 1.6 * dt; p.vy -= p.vy * 1.6 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
  }
}

function drawFiresV2(ctx) {
  if (!G.firesV2 || !G.firesV2.length) return;
  ctx.save();
  for (const src of G.firesV2) {
    if (src.kind === 'pool' && src.env > 0) fv2DrawCoals(ctx, src);
    for (const c of src.clusters) fv2DrawCluster(ctx, c, src);
  }
  ctx.restore();
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
}
function fv2DrawCoals(ctx, src) {   // 火海底下發紅的炭床
  const { x, y, r } = src.pool, e = src.env, t = src.t;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(255,120,40,${(.28 * e).toFixed(3)})`); g.addColorStop(.7, `rgba(200,50,20,${(.14 * e).toFixed(3)})`); g.addColorStop(1, 'rgba(120,20,0,0)');
  ctx.translate(x, y); ctx.scale(1, .45); ctx.translate(-x, -y);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill();
  for (let i = 0; i < 14; i++) {   // 一明一暗呼吸的炭火
    const a = fv2Hash(i, 3) * 6.283, d = Math.sqrt(fv2Hash(i, 5)) * r * .8, px = x + Math.cos(a) * d, py = y + Math.sin(a) * d;
    const b = (.5 + .5 * Math.sin(t * 2.4 + i * 1.7)) * e, rr = 5 + fv2Hash(i, 7) * 6;
    fxGlow(ctx, px, py, rr, [255, 190, 80], .5 * b);
  }
  ctx.restore();
}
function fv2DrawCluster(ctx, c, src) {
  const t = src.t, env = src.t < src.life ? src.env : 0, fl = fv2Fla(c, t);
  // 煙（最後面，本地座標）
  ctx.save(); ctx.translate(c.x, c.y); ctx.scale(c.k, c.k);
  for (const p of c.smokes) bv2DrawSmoke(ctx, p);
  // 光：跟著火呼吸的暖光、地上一圈光
  const g0 = c.groups[0], gEnv = g0 ? fv2GroupShape(g0).alpha * env : 0;
  if (gEnv > 0) {
    ctx.globalCompositeOperation = 'lighter';
    const br = .92 + .08 * fv2Noise(t * .67, c.flick + 3), lx = fv2Noise(t * .67, c.flick + 90) * 1.4;
    fxGlow(ctx, lx, -10, 40 * br + 4, [255, 190, 110], .28 * fl * gEnv);
    ctx.save(); ctx.scale(1, .2); fxGlow(ctx, 0, 0, 34, [255, 170, 80], .35 * fl * gEnv); ctx.restore();
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.restore();
  // 火舌：原本畫法（世界座標）
  for (const g of c.groups) fv2DrawGroup(ctx, c.x, c.y, g);
  // 火星、火屑（加色，本地座標）
  ctx.save(); ctx.translate(c.x, c.y); ctx.scale(c.k, c.k);
  ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
  for (const p of c.sparks) {
    const k = p.life / p.max;
    if (p.flash) { fxGlow(ctx, p.x, p.y, 7, [255, 255, 230], .8 * k); continue; }
    const sp = Math.hypot(p.vx, p.vy) || 1, len = Math.min(5, .6 + sp * .012), ux = p.vx / sp, uy = p.vy / sp;
    ctx.strokeStyle = k > .6 ? FV2_HOT[1] : k > .3 ? FV2_HOT[2] : FV2_HOT[4]; ctx.globalAlpha = Math.min(1, k * 2); ctx.lineWidth = .8;
    ctx.beginPath(); ctx.moveTo(p.x - ux * len, p.y - uy * len); ctx.lineTo(p.x, p.y); ctx.stroke();
  }
  ctx.globalAlpha = 1;
  for (const p of c.embers) {
    const k = p.life / p.max;
    if (k < .25 && Math.sin(p.age * 40 + p.a) < 0) continue;   // 快熄時閃爍
    const x = p.x + 7 * (Math.sin(p.age * 2.3 + p.a) - Math.sin(p.a)), y = p.y + 2 * (Math.sin(p.age * 3 + p.b) - Math.sin(p.b));
    const col = k > .6 ? [255, 243, 166] : k > .3 ? [255, 226, 107] : [255, 138, 42];
    ctx.fillStyle = bv2Rgba(col, 1); ctx.beginPath(); ctx.arc(x, y, p.s * .55, 0, 6.283); ctx.fill();
    fxGlow(ctx, x, y, 3, col, .35 * k);
  }
  ctx.restore();
}

// ---- 怪物燒傷（render.js 畫怪物時呼叫；全部由時間算出來，不用存粒子）----
// e：怪物；size：怪物大小倍率。e.burnTick 每秒倒數一次（js/enemy-ai.js），倒數歸零那一下火「轟」一聲變大、噴火星
function drawBurnV2(ctx, e, size = 1) {
  const C = FIRE_FX_V2.burn, k = C.k * Math.max(.8, Math.min(1.6, size)), H = (e.drawHeight || 33) * Math.max(1, size);
  const seed = e.burnSeed || (e.burnSeed = 1 + Math.floor(Math.random() * 9999));
  const t = performance.now() / 1000, since = Math.max(0, Math.min(1, 1 - (e.burnTick ?? 1))), fl = Math.exp(-since / .12);
  const fade = Math.min(1, (e.burnT || 0) / .6);   // 燒傷快結束時火慢慢變小
  const W = 9 * Math.max(1, size);
  const spots = [[-W * .45, -H * .78, 3, 5], [W * .55, -H * .52, 2, 4.2], [-W * .6, -H * .4, 2, 3.6]];   // [x, y, 火舌數, 高度]（相對腳底）
  const by = e.y + 13;   // 怪物腳底
  ctx.save();
  // 地上一圈閃動的暖光
  ctx.globalCompositeOperation = 'lighter';
  const flick = .8 + .2 * fv2Noise(t * 7.5, seed);
  ctx.save(); ctx.translate(e.x, by); ctx.scale(1, .22);
  fxGlow(ctx, 0, 0, 30 * k, [255, 150, 60], (.16 + .22 * fl) * flick * fade); ctx.restore();
  ctx.globalCompositeOperation = 'source-over';
  // 淡淡的煙，往上、被風吹斜
  for (let i = 0; i < 6; i++) {
    const life = .8 + fv2Hash(i, seed) * .4, age = ((t + fv2Hash(i, seed + 1) * life) % life), q = age / life, sp = spots[i % 3];
    const x = e.x + sp[0] - 7 * q * k + Math.sin(age * 4 + i) * 1.2, y = by + sp[1] - 3 - 20 * q * k, r = (1.4 + 2.6 * q) * k;
    ctx.fillStyle = `rgba(91,85,102,${(.32 * (1 - q) * Math.min(1, q * 6) * fade).toFixed(3)})`; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill();
  }
  // 熱點：原本畫法的小火舌往上舔，「轟」的時候變大
  for (let s = 0; s < spots.length; s++) {
    const [sx, sy, n, h0] = spots[s];
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let j = 0; j < n; j++) {
      const tn = seed + s * 17 + j * 5, f1 = Math.sin(t * (11 + (tn % 6)) + tn), f2 = Math.sin(t * (7 + (tn % 4)) + tn * 1.7);
      const h = h0 * k * 1.5 * (.85 + .15 * f1) * (1 + 1.2 * fl) * fade, w = (3.2 + 1.2 * fl) * k * (.9 + .12 * f2);
      fv2Flame3(ctx, e.x + sx + (j - (n - 1) / 2) * 1.6 * k, by + sy, h, w, f1 * w * .35 - 2 * k);
    }
    ctx.restore();
    ctx.globalCompositeOperation = 'lighter';
    const gr = (9 + 6 * fl) * k * .8;
    fxGlow(ctx, e.x + sx, by + sy - 2 * k, gr, [255, 138, 42], (.22 + .35 * fl) * fade);
    ctx.globalCompositeOperation = 'source-over';
  }
  // 往上飄走的火屑
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 10; i++) {
    const life = .5 + fv2Hash(i, seed + 3) * .4, age = ((t + fv2Hash(i, seed + 4) * life) % life), q = age / life, sp = spots[i % 3];
    const x = e.x + sp[0] + (fv2Hash(i, seed + 5) - .5) * 3 * k - 14 * age * k + Math.sin(age * 9 + i) * 1.2 * age * k, y = by + sp[1] - 2 * k - (25 + fv2Hash(i, seed + 6) * 30) * age * k;
    ctx.globalAlpha = (1 - q) * fade; ctx.fillStyle = q < .4 ? '#fff3a6' : q < .7 ? '#ffc23d' : '#f2561d'; ctx.beginPath(); ctx.arc(x, y, .9 * k, 0, 6.283); ctx.fill();
  }
  // 「轟」的瞬間往外噴的火星
  if (since < .3) for (let s = 0; s < spots.length; s++) for (let j = 0; j < 4; j++) {
    const an = -Math.PI / 2 + (fv2Hash(s * 4 + j, seed + Math.floor(t)) - .5) * 2.2, v = (50 + 50 * fv2Hash(s, j + seed)) * k, d = v * since * (1 - since * 1.5);
    const x = e.x + spots[s][0] + Math.cos(an) * d, y = by + spots[s][1] - 2 * k + Math.sin(an) * d + 60 * since * since * k;
    ctx.globalAlpha = 1 - since / .3; ctx.fillStyle = since < .12 ? '#fff3a6' : '#ffc23d'; ctx.beginPath(); ctx.arc(x, y, .9 * k, 0, 6.283); ctx.fill();
  }
  ctx.restore();
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
}
