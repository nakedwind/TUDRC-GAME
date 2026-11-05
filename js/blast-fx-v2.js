// ============================================================
//  爆炸特效 V2：遊戲原本的平滑畫法 ＋ pixelfx（MIT，github.com/patch-gg/pixelfx）的煙霧／火星動態
//  - 火球一團團往上浮、邊浮邊冷卻（白→黃→橙→暗紅），燒完直接變成煙 → 煙順著火的方向飄
//  - 煙：三層柔邊圓（本體、偏下的濃芯、剛冒出時頂端的亮帽），由暖灰慢慢變深、左右飄
//  - 火星：照飛行方向拉長的亮線，有高度、落地會彈，越飛越冷
//  - 飄浮火屑：慢慢上飄、左右晃，快熄時閃爍
//  - 燃燒碎塊：拋物線飛出、拖火尾，落地變成小火堆再燒一下
//  碎石、灰塵（rockBurstFx）、焦痕（addScorchMark）、畫面爆閃（addLightFlash）、震動照舊用原本的。
//
//  BLAST_FX_VERSION：1＝原本畫法（V1 程式完整保留），2＝特效 V2
//  BLAST_FX_V2：各種爆炸的強弱（R＝畫面大小，像素；其他是各種粒子的數量倍率，1＝油桶的量）
// ============================================================
const BLAST_FX_VERSION = 2;
const BLAST_FX_V2 = {
  //            R    火球  火柱  黑煙  火星  火屑  碎塊  衝擊環  煙的顏色（null＝油性黑煙）
  theonie:    { R: 26,  fire: .22, column: .15, soot: .1,  sparks: .22, embers: .25, brands: 0,   ring: 0,   smoke: null },   // 希奧妮 一般攻擊：小火團
  stove:      { R: 40,  fire: .35, column: .25, soot: .15, sparks: .4,  embers: .35, brands: .15, ring: .5,  smoke: [92, 88, 96] },  // 瓦斯爐：瓦斯一閃，煙淡
  theonieUlt: { R: 72,  fire: .6,  column: .5,  soot: .35, sparks: .6,  embers: .6,  brands: .3,  ring: .8,  smoke: null },   // 希奧妮 大招「烈焰新星」
  mine:       { R: 64,  fire: .3,  column: .2,  soot: .8,  sparks: 1,   embers: .3,  brands: 0,   ring: 1,   smoke: [74, 64, 52] },  // 地雷：火少、泥土色的煙多、火星多
  tank:       { R: 80,  fire: .7,  column: .65, soot: .65, sparks: .8,  embers: .8,  brands: .6,  ring: 1,   smoke: null },   // 油箱
  drum:       { R: 140, fire: 1,   column: 1,   soot: 1,   sparks: 1,   embers: 1,   brands: 1,   ring: 1,   smoke: null },   // 油桶：最大
};

const BV2_FIRE = [[255, 255, 255], [255, 243, 166], [255, 226, 107], [255, 194, 61], [255, 138, 42], [242, 86, 29], [201, 40, 31], [138, 31, 23], [74, 23, 18]];
const BV2_SMOKE = [[123, 111, 114], [93, 86, 96], [67, 61, 72], [43, 38, 48], [26, 23, 30]];
const BV2_K = 1.8, BV2_FK = 1.3;   // pixelfx 像素 → 遊戲像素；火球和煙再放大一點（平滑圓比像素圓顯小）
const bv2Rnd = (a, b) => a + Math.random() * (b - a);
const bv2Chance = p => Math.random() < p;
const bv2N = (base, mul) => { const v = base * mul; return Math.floor(v) + (Math.random() < v % 1 ? 1 : 0); };
function bv2Ramp(R, t) { t = Math.max(0, Math.min(.999, t)) * (R.length - 1); const i = t | 0, f = t - i, a = R[i], b = R[i + 1]; return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f]; }
function bv2Rgba(c, a) { return `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${Math.max(0, Math.min(1, a)).toFixed(3)})`; }

// 放一個 V2 爆炸。kind：BLAST_FX_V2 的名稱；o.scale：再額外放大縮小
function blastFxV2(x0, y0, kind, o = {}) {
  const P = BLAST_FX_V2[kind] || BLAST_FX_V2.drum;
  const R = P.R * (o.scale || 1), s = Math.min(1.3, Math.pow(R / 140, .75)), K = BV2_K * s;
  const b = { x0, y0, cy: y0 - 10 * s, s, R, t: 0, fires: [], smokes: [], sparks: [], embers: [], brands: [], blazes: [],
    glow: { r0: 20 * s, r1: R * 1.15, life: .45, max: .45 }, core: { r: 26 * s, life: .12, max: .12 },
    ring: P.ring ? { r: 12 * s, r2: R, life: .4, max: .4, a: P.ring } : null };
  const cy = b.cy, soot = P.smoke || [31, 26, 36];
  for (let i = 0; i < Math.max(1, bv2N(5, Math.sqrt(P.fire))); i++) bv2Fire(b, x0 + bv2Rnd(-5, 5) * s, cy + bv2Rnd(-5, 5) * s, bv2Rnd(-20, 20) * K, bv2Rnd(-40, -10) * K, bv2Rnd(.18, .28), bv2Rnd(9, 12) * K);
  for (let i = 0; i < bv2N(30, P.fire); i++) {   // 往四周（偏上方）爆出去的火球，一半燒完變煙
    const a = bv2Rnd(-Math.PI - .15, .15), d = bv2Rnd(0, 8) * K, sp = bv2Rnd(50, 190) * K;
    bv2Fire(b, x0 + Math.cos(a) * d, cy + Math.sin(a) * d * .7, Math.cos(a) * sp, Math.sin(a) * sp * .6 - 40 * K, bv2Rnd(.55, 1.05), bv2Rnd(5, 10) * K, 0, bv2Chance(.5), true, false, P.smoke);
  }
  for (let i = 0; i < bv2N(12, P.column); i++)   // 往上衝的火柱
    bv2Fire(b, x0 + bv2Rnd(-6, 6) * K, cy - bv2Rnd(0, 10) * K, bv2Rnd(-14, 14) * K, -bv2Rnd(170, 300) * K, bv2Rnd(.7, 1.15), bv2Rnd(6, 10) * K, bv2Rnd(0, .12), bv2Chance(.7), true, false, P.smoke);
  for (let i = 0; i < bv2N(12, P.soot); i++) {   // 直接冒出來的濃煙
    const a = bv2Rnd(-Math.PI, 0), d = bv2Rnd(4, 16) * K;
    bv2Smoke(b, x0 + Math.cos(a) * d, cy + Math.sin(a) * d * .7, Math.cos(a) * 30 * K, -bv2Rnd(30, 90) * K, bv2Rnd(1.6, 2.6), bv2Rnd(8, 13) * K, bv2Rnd(.1, .4), true, soot);
  }
  for (let i = 0; i < bv2N(90, P.sparks); i++) {   // 火星：有高度（z），落地會彈
    const a = bv2Rnd(0, Math.PI * 2), hs = bv2Rnd(120, 420) * s, life = bv2Rnd(.25, .7);
    b.sparks.push({ x: x0, y: y0, z: 12 * s, vx: Math.cos(a) * hs, vy: Math.sin(a) * hs * .55, vz: bv2Rnd(40, 240) * s, life, max: life });
  }
  for (let i = 0; i < bv2N(40, P.embers); i++) {   // 飄浮火屑
    const a = bv2Rnd(0, Math.PI * 2), sp = bv2Rnd(30, 140) * K * .6, life = bv2Rnd(1.2, 2.6);
    b.embers.push({ x: x0 + Math.cos(a) * 8 * K, y: cy + Math.sin(a) * 8 * s, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * .6 - 70 * s, life, max: life, seed: Math.random() * 100 });
  }
  for (let i = 0; i < bv2N(14, P.brands); i++) {   // 燃燒碎塊
    const a = bv2Rnd(0, Math.PI * 2), hs = bv2Rnd(60, 230) * s;
    b.brands.push({ x: x0 + bv2Rnd(-6, 6) * s, y: y0, z: 14 * s, vx: Math.cos(a) * hs, vy: Math.sin(a) * hs * .5, vz: bv2Rnd(220, 480) * s });
  }
  (G.blastsV2 = G.blastsV2 || []).push(b);
  return b;
}
function bv2Fire(b, x, y, vx, vy, life, size, delay = 0, smokes = false, big = false, back = false, smokeCol = null) {
  b.fires.push({ x, y, vx, vy, life, max: life, size: size * BV2_FK, seed: Math.random() * 100, delay, smokes, big, back, smokeCol });
}
function bv2Smoke(b, x, y, vx, vy, life, size, delay = 0, big = false, col = null) {
  b.smokes.push({ x, y, vx, vy, life, max: life, size: size * BV2_FK, seed: Math.random() * 100, delay, big, col });
}

// ---- 每幀更新（updateWorldEffects 會呼叫，劇情播放器也會跑到）----
function updateBlastsV2(dt) {
  if (!G.blastsV2 || !G.blastsV2.length) return;
  for (const b of G.blastsV2) bv2Update(b, dt);
  G.blastsV2 = G.blastsV2.filter(b => b.fires.length || b.smokes.length || b.sparks.length || b.embers.length || b.brands.length || b.blazes.length || b.glow.life > 0);
}
function bv2Update(b, dt) {
  b.t += dt;
  const t = b.t, s = b.s, K = BV2_K * s;
  for (let i = b.fires.length - 1; i >= 0; i--) {   // 火球：浮力往上、左右扭、阻力；燒完可能變成煙
    const p = b.fires[i];
    if (p.delay > 0) { p.delay -= dt; continue; }
    if ((p.life -= dt) <= 0) {
      if (p.smokes) bv2Smoke(b, p.x, p.y, p.vx * .6, p.vy * .6 - 6 * K, p.big ? bv2Rnd(1.3, 2.3) : bv2Rnd(.8, 1.4), p.size / BV2_FK * (p.big ? .85 : .7), 0, p.big, p.smokeCol);
      b.fires.splice(i, 1); continue;
    }
    p.vy -= 95 * K * dt; p.vx += Math.sin(t * 17 + p.seed) * 30 * K * dt;
    p.vx -= p.vx * 5 * dt; p.vy -= p.vy * 3.2 * dt;
    p.x += p.vx * dt; p.y += p.vy * dt;
  }
  for (let i = b.smokes.length - 1; i >= 0; i--) {
    const p = b.smokes[i];
    if (p.delay > 0) { p.delay -= dt; continue; }
    if ((p.life -= dt) <= 0) { b.smokes.splice(i, 1); continue; }
    p.vy -= (p.big ? 23 : 16) * K * dt; p.vx += (Math.sin(t * 1.3 + p.seed) * 8 + 3) * K * dt;
    p.vx -= p.vx * 1.6 * dt; p.vy -= p.vy * 1.2 * dt;
    p.x += p.vx * dt; p.y += p.vy * dt;
  }
  for (let i = b.sparks.length - 1; i >= 0; i--) {
    const p = b.sparks[i];
    if ((p.life -= dt) <= 0) { b.sparks.splice(i, 1); continue; }
    p.vz -= 520 * s * dt; p.vx -= p.vx * 2.2 * dt; p.vy -= p.vy * 2.2 * dt; p.vz -= p.vz * 1.2 * dt;
    p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
    if (p.z <= 0 && p.vz < 0) { p.z = 0; p.vz = -p.vz * .45; p.vx *= .7; p.vy *= .7; }
  }
  for (let i = b.embers.length - 1; i >= 0; i--) {
    const p = b.embers[i];
    if ((p.life -= dt) <= 0) { b.embers.splice(i, 1); continue; }
    p.vy += (-30 + Math.sin(t * 3 + p.seed) * 20) * s * dt; p.vx += Math.cos(t * 2.3 + p.seed) * 45 * s * dt;
    p.vx -= p.vx * 1.6 * dt; p.vy -= p.vy * 1.6 * dt;
    p.x += p.vx * dt; p.y += p.vy * dt;
  }
  for (let i = b.brands.length - 1; i >= 0; i--) {
    const p = b.brands[i];
    p.vz -= 760 * s * dt; p.vx -= p.vx * .9 * dt; p.vy -= p.vy * .9 * dt;
    p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
    if (bv2Chance(.9 * Math.min(1, dt * 60))) bv2Fire(b, p.x, p.y - p.z, bv2Rnd(-7, 7) * K, -10 * K, bv2Rnd(.16, .32), bv2Rnd(.9, 1.7) * K, 0, bv2Chance(.4));
    if (p.z <= 0) { const life = bv2Rnd(1.2, 2.2); b.blazes.push({ x: p.x, y: p.y, life, max: life, power: bv2Rnd(.6, 1), acc: Math.random() }); b.brands.splice(i, 1); }
  }
  for (let i = b.blazes.length - 1; i >= 0; i--) {   // 落地小火：一直冒小火球，偶爾噴火屑
    const z = b.blazes[i];
    if ((z.life -= dt) <= 0) { b.blazes.splice(i, 1); continue; }
    const k = z.life / z.max, it = z.power * (k > .7 ? 1 : .35 + k / .7 * .65);
    for (z.acc += dt * (6 + 16 * it); z.acc > 1; z.acc--) {
      const sz = bv2Rnd(1.2, 2.8) * it * K;
      bv2Fire(b, z.x + bv2Rnd(-3, 3) * s, z.y - sz * .6, bv2Rnd(-6, 6) * K, bv2Rnd(-30, -12) * K, bv2Rnd(.28, .6), sz, 0, bv2Chance(.3), false, true);
      if (bv2Chance(.06)) b.embers.push({ x: z.x, y: z.y - 3, vx: bv2Rnd(-15, 15) * s, vy: bv2Rnd(-45, -15) * s, life: bv2Rnd(.6, 1.4), max: 1.4, seed: Math.random() * 100 });
    }
  }
  b.glow.life -= dt; b.core.life -= dt;
  if (b.ring) b.ring.life -= dt;
}

// ---- 繪製（drawWorldEffects 會呼叫，劇情播放器也會跑到）----
function drawBlastsV2(ctx) {
  if (!G.blastsV2 || !G.blastsV2.length) return;
  ctx.save();
  for (const b of G.blastsV2) bv2Draw(ctx, b);
  ctx.restore();
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
}
function bv2SoftDisc(ctx, x, y, r, c, a) {
  if (a <= .005 || r <= .5) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, bv2Rgba(c, a)); g.addColorStop(.7, bv2Rgba(c, a * .9)); g.addColorStop(1, bv2Rgba(c, 0));
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill();
}
function bv2DrawFire(ctx, p) {
  const k = p.life / p.max, age = 1 - k, heat = Math.min(.999, Math.pow(age, .62) + (p.seed % 1) * .1);
  const r = p.size * (.55 + .45 * Math.min(1, age * 7)) * (1 - age * .55);
  if (r < .4) return;
  const c = bv2Ramp(BV2_FIRE, heat), rim = bv2Ramp(BV2_FIRE, Math.min(.999, heat + .22)), fade = Math.min(1, k * 3);
  if (heat > .82) { ctx.fillStyle = bv2Rgba(c, fade * .85); ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 6.283); ctx.fill(); return; }   // 快燒完：暗紅、半透明
  ctx.fillStyle = bv2Rgba(rim, fade); ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 6.283); ctx.fill();
  ctx.fillStyle = bv2Rgba(c, fade); ctx.beginPath(); ctx.arc(p.x - r * .16, p.y - r * .22, r * .78, 0, 6.283); ctx.fill();
  if (r > 3) { ctx.beginPath(); ctx.arc(p.x, p.y - r * .9, r * .42, 0, 6.283); ctx.fill(); }   // 頂上的小火舌
  if (heat < .4 && r > 3) { ctx.fillStyle = bv2Rgba(bv2Ramp(BV2_FIRE, Math.max(0, heat - .12)), fade); ctx.beginPath(); ctx.arc(p.x - r * .28, p.y - r * .34, r * .36, 0, 6.283); ctx.fill(); }
}
function bv2DrawSmoke(ctx, p) {   // 三層：本體、偏下的濃芯、剛冒出時頂端的亮帽
  const k = p.life / p.max, age = 1 - k;
  const r = p.size * (.65 + Math.min(1, age * 2.5) * .45 + age * (p.big ? .5 : .4));
  const a = Math.min(1, age * 12) * Math.min(1, k * 2.4) * (p.big ? .7 : .58) * 1.7;   // 柔邊會吃掉濃度，補回來
  const base = bv2Ramp(BV2_SMOKE, age * 1.05), c = p.col ? [p.col[0] + (base[0] - p.col[0]) * age, p.col[1] + (base[1] - p.col[1]) * age, p.col[2] + (base[2] - p.col[2]) * age] : base;
  bv2SoftDisc(ctx, p.x, p.y, r, c, a * .45);
  bv2SoftDisc(ctx, p.x + r * .05, p.y + r * .06, r * .74, c, a * .62);
  if (age < .5) bv2SoftDisc(ctx, p.x - r * .22, p.y - r * .3, r * .5, [c[0] + (255 - c[0]) * .12, c[1] + (255 - c[1]) * .12, c[2] + (255 - c[2]) * .12], a * .4 * (1 - age * 2));
}
function bv2Draw(ctx, b) {
  const { x0, y0, cy, s } = b;
  ctx.globalCompositeOperation = 'lighter';
  for (const z of b.blazes) {   // 落地小火的地面光
    const k = z.life / z.max, r = (12 + 10 * k * z.power) * s, g = ctx.createRadialGradient(z.x, z.y, 0, z.x, z.y, r);
    g.addColorStop(0, `rgba(255,138,42,${(.35 * k * z.power).toFixed(3)})`); g.addColorStop(1, 'rgba(255,138,42,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(z.x, z.y, r, 0, 6.283); ctx.fill();
  }
  if (b.glow.life > 0) {   // 底層爆閃光暈
    const p = b.glow.life / b.glow.max, r = b.glow.r0 + (b.glow.r1 - b.glow.r0) * (1 - p), g = ctx.createRadialGradient(x0, y0 - 8, 0, x0, y0 - 8, r);
    g.addColorStop(0, `rgba(255,240,190,${(.9 * p).toFixed(3)})`); g.addColorStop(.4, `rgba(255,150,40,${(.6 * p).toFixed(3)})`); g.addColorStop(1, 'rgba(120,20,0,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x0, y0 - 8, r, 0, 6.283); ctx.fill();
  }
  ctx.globalCompositeOperation = 'source-over';
  if (b.ring && b.ring.life > 0) {   // 一道淡淡的衝擊環（貼地壓扁）
    const p = b.ring.life / b.ring.max, rr = b.ring.r + (b.ring.r2 - b.ring.r) * (1 - p * p);
    ctx.save(); ctx.translate(x0, y0); ctx.scale(1, .5); ctx.globalAlpha = p * .55 * b.ring.a; ctx.strokeStyle = '#fff0c0'; ctx.lineWidth = 1 + p * 3;
    ctx.beginPath(); ctx.arc(0, 0, rr, 0, 6.283); ctx.stroke(); ctx.restore();
  }
  for (const p of b.fires) if (p.back && p.delay <= 0) bv2DrawFire(ctx, p);
  for (const p of b.smokes) if (p.delay <= 0) bv2DrawSmoke(ctx, p);   // 煙在火的後面
  for (const p of b.fires) if (!p.back && p.delay <= 0) bv2DrawFire(ctx, p);
  for (const p of b.brands) {   // 燃燒碎塊
    ctx.fillStyle = '#f2561d'; ctx.beginPath(); ctx.arc(p.x, p.y - p.z, 2.6 * Math.max(.7, s), 0, 6.283); ctx.fill();
    ctx.fillStyle = Math.sin(b.t * 40 + p.x) > 0 ? '#fff3a6' : '#ffe26b'; ctx.beginPath(); ctx.arc(p.x, p.y - p.z, 1.4, 0, 6.283); ctx.fill();
  }
  ctx.globalCompositeOperation = 'lighter';
  for (const p of b.fires) {   // 熱的火球外圍光暈
    if (p.delay > 0) continue;
    const k = p.life / p.max, age = 1 - k, heat = Math.pow(age, .62);
    if (heat > .7) continue;
    const r = p.size * (1 - age * .55) * 2.4 + 4, c = bv2Ramp(BV2_FIRE, heat), g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
    g.addColorStop(0, bv2Rgba(c, .22 * k)); g.addColorStop(1, bv2Rgba(c, 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 6.283); ctx.fill();
  }
  ctx.lineCap = 'round';
  for (const p of b.sparks) {   // 火星：沿速度方向拉長，越久越冷
    const k = p.life / p.max, sx = p.x, sy = p.y - p.z, vx = p.vx, vy = p.vy - p.vz, sp = Math.hypot(vx, vy) || 1;
    const len = Math.min(16, 2 + sp * .04) * Math.max(.6, s), ux = vx / sp, uy = vy / sp;
    const head = k > .6 ? [255, 243, 166] : k > .3 ? [255, 226, 107] : [255, 138, 42], tail = k > .5 ? [255, 194, 61] : [242, 86, 29];
    ctx.strokeStyle = bv2Rgba(tail, .7 * Math.min(1, k * 2)); ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(sx - ux * len, sy - uy * len); ctx.lineTo(sx - ux * len * .4, sy - uy * len * .4); ctx.stroke();
    ctx.strokeStyle = bv2Rgba(head, Math.min(1, k * 2)); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(sx - ux * len * .45, sy - uy * len * .45); ctx.lineTo(sx, sy); ctx.stroke();
    const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, 6); g.addColorStop(0, bv2Rgba(head, .45 * k)); g.addColorStop(1, bv2Rgba(head, 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sx, sy, 6, 0, 6.283); ctx.fill();
  }
  for (const p of b.embers) {   // 飄浮火屑：快熄時閃爍
    const k = p.life / p.max;
    if (k < .25 && Math.sin(b.t * 40 + p.seed) < 0) continue;
    const c = k > .6 ? [255, 243, 166] : k > .3 ? [255, 226, 107] : [255, 138, 42];
    ctx.fillStyle = bv2Rgba(c, 1); ctx.beginPath(); ctx.arc(p.x, p.y, 1.4, 0, 6.283); ctx.fill();
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 6); g.addColorStop(0, bv2Rgba(c, .35 * k)); g.addColorStop(1, bv2Rgba(c, 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, 6, 0, 6.283); ctx.fill();
  }
  if (b.core.life > 0) {   // 爆開瞬間的白熱核心
    const p = b.core.life / b.core.max, g = ctx.createRadialGradient(x0, cy, 0, x0, cy, b.core.r * (1.6 - p * .6));
    g.addColorStop(0, `rgba(255,255,255,${p.toFixed(3)})`); g.addColorStop(1, 'rgba(255,240,200,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x0, cy, b.core.r * 1.6, 0, 6.283); ctx.fill();
  }
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
}
