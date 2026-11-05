// ============================================================
//  疏導特效 V2（艾德林、溫特、亞許…）：參考 pixelfx（MIT，github.com/patch-gg/pixelfx）的 heal、heal-aoe、blessing、halo，
//  用遊戲原本的平滑風格畫。原本的法陣、光波、光環、光點都照舊，V2 再疊上：
//  - 法陣：全部改成圓圈設計（原本的直線刻紋、三角形拿掉），只有三圈光環
//  - 施放時：法陣外圈立起幾道柔和的光柱，一明一暗地呼吸；光波往外擴散時，波前帶著一圈閃爍的小光點
//  - 疏導成功（每個被疏導的人身上）：腳下往上升起一道柔光柱、兩條光帶繞著身體螺旋往上、
//    幾顆很小的光點一閃一閃往上飄，最後頭上一圈淡淡的光暈
//
//  SOOTHE_FX_VERSION：1＝原本畫法（只有原本那套），2＝疏導 V2（原本那套＋上面這些）
// ============================================================
const SOOTHE_FX_VERSION = 2;
const SOOTHE_FX_V2 = {
  shafts: 6,        // 法陣外圈的光柱數
  ribbons: 2,       // 螺旋光帶條數
  stars: 7,         // 往上飄的星光顆數
  blessLife: 1.3,   // 疏導成功的整段表演秒數
  dot: 1.1,         // 光點大小（像素半徑，越小越細）
};
const sv2r = (a, b) => a + Math.random() * (b - a);
const sv2rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${Math.max(0, Math.min(1, a)).toFixed(3)})`;
const sv2Lite = c => c.map(v => Math.round(v + (255 - v) * .55));   // 比原色亮一點（星光、光帶的芯）

// 施放：光柱＋波前星光。caster 會跟著移動
function sootheV2Cast(caster, col, radius, dur = 1.1) {
  if (!caster) return;
  const C = SOOTHE_FX_V2, shafts = [];
  for (let i = 0; i < C.shafts; i++) shafts.push({ a: i / C.shafts * Math.PI * 2 + sv2r(-.2, .2), h: sv2r(30, 48), ph: Math.random() * 6.28, w: sv2r(5, 8) });
  const sparks = [];
  if (radius > 0) for (let i = 0; i < 18; i++) sparks.push({ a: Math.random() * Math.PI * 2, k: sv2r(.85, 1.05), ph: Math.random() * 6.28 });
  (G.sootheV2 = G.sootheV2 || []).push({ cast: true, follow: caster, x0: caster.x, y0: caster.y, col, radius, shafts, sparks, t: 0, life: Math.max(dur, radius > 0 ? .8 : 0) });
}
// 疏導成功：光柱、螺旋光帶、星光、光暈。follow＝跟著誰移動（沒有就停在原地）
function sootheV2Bless(x, y, col, follow) {
  const C = SOOTHE_FX_V2, ribbons = [], stars = [];
  for (let i = 0; i < C.ribbons; i++) ribbons.push({ a0: i / C.ribbons * Math.PI * 2 + Math.random(), spin: sv2r(5, 7) * (i % 2 ? -1 : 1) });
  for (let i = 0; i < C.stars; i++) stars.push({ dx: sv2r(-16, 16), y0: sv2r(-4, 14), vy: sv2r(22, 40), delay: sv2r(0, .5), life: sv2r(.6, 1), r: sv2r(2.2, 3.8), ph: Math.random() * 6.28 });
  (G.sootheV2 = G.sootheV2 || []).push({ bless: true, follow, dx: follow ? x - follow.x : 0, dy: follow ? y - follow.y : 0, x, y, col, ribbons, stars, t: 0, life: C.blessLife });
}

function updateSootheV2(dt) {
  if (!G.sootheV2 || !G.sootheV2.length) return;
  for (const f of G.sootheV2) f.t += dt;
  G.sootheV2 = G.sootheV2.filter(f => f.t < f.life);
}

function sv2Twinkle(ctx, x, y, r, col, a) {   // 很小的圓光點（亮芯＋一點柔光）；r 只用來決定大小比例
  if (a <= .01 || r <= .2) return;
  const d = SOOTHE_FX_V2.dot * (.75 + .25 * r / 3);
  const g = ctx.createRadialGradient(x, y, 0, x, y, d * 3);
  g.addColorStop(0, sv2rgba(col, .45 * a)); g.addColorStop(1, sv2rgba(col, 0));
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, d * 3, 0, 6.283); ctx.fill();
  ctx.fillStyle = sv2rgba(sv2Lite(col), a); ctx.beginPath(); ctx.arc(x, y, d, 0, 6.283); ctx.fill();
}

// 地面層（render.js 在畫人物之前呼叫）：法陣、法陣光柱都畫在這裡，才會在人物後面
function drawSootheGroundV2(ctx) {
  if (typeof SOOTHE_FX_VERSION === 'undefined' || SOOTHE_FX_VERSION !== 2) return;
  for (const f of G.effects || []) if (f.sootheSigil && f.life > 0) { drawSootheSigilV2(ctx, f); f.groundDrawn = true; }
  if (!G.sootheV2 || !G.sootheV2.length) return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (const f of G.sootheV2) if (f.cast) { sv2DrawShafts(ctx, f); f.groundDrawn = true; }
  ctx.restore(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
}
// 法陣（render.js 的 sootheSigil 會呼叫）：全部圓圈設計——柔光底、外圈＋細圈＋內圈（不放小光點）
function drawSootheSigilV2(ctx, f) {
  const age = f.life0 - f.life, open = Math.min(1, age / .25), a = Math.min(1, f.life / Math.min(.5, f.life0 * .45));
  const R = 30 * (.55 + .45 * open), [cr, cg, cb] = f.col, rgb = `rgb(${cr},${cg},${cb})`;
  ctx.save(); ctx.translate(f.follow.x, f.follow.y + 14); ctx.scale(1, .45); ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, R * 1.25);
  g.addColorStop(0, `rgba(${cr},${cg},${cb},${(.3 * a).toFixed(3)})`); g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, R * 1.25, 0, 6.283); ctx.fill();
  ctx.strokeStyle = rgb;
  ctx.globalAlpha = a * .9; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(0, 0, R, 0, 6.283); ctx.stroke();          // 外圈
  ctx.globalAlpha = a * .5; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(0, 0, R * .9, 0, 6.283); ctx.stroke();     // 外圈內側細圈
  ctx.globalAlpha = a * .55; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(0, 0, R * .5, 0, 6.283); ctx.stroke();    // 內圈
  ctx.restore(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
}

function drawSootheV2(ctx) {
  if (!G.sootheV2 || !G.sootheV2.length) return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
  for (const f of G.sootheV2) {
    if (f.cast) sv2DrawCast(ctx, f); else sv2DrawBless(ctx, f);
  }
  ctx.restore();
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
}
function sv2DrawShafts(ctx, f) {   // 法陣外圈的光柱：一明一暗呼吸，根部在圈上（壓扁的橢圓）
  const t = f.t, col = f.col, x = f.follow ? f.follow.x : f.x0, y = (f.follow ? f.follow.y : f.y0) + 14;
  const open = Math.min(1, t / .25), fade = Math.min(1, (f.life - t) / .4), R = 30 * (.55 + .45 * open);
  for (const s of f.shafts) {
    const bx = x + Math.cos(s.a) * R, by = y + Math.sin(s.a) * R * .45, breathe = .55 + .45 * Math.sin(t * 5 + s.ph);
    const h = s.h * open * (.8 + .2 * breathe), a = .35 * breathe * fade * open;
    const g = ctx.createLinearGradient(bx, by, bx, by - h);
    g.addColorStop(0, sv2rgba(col, a)); g.addColorStop(1, sv2rgba(col, 0));
    ctx.fillStyle = g; ctx.beginPath();
    ctx.moveTo(bx - s.w / 2, by); ctx.lineTo(bx - s.w * .2, by - h); ctx.lineTo(bx + s.w * .2, by - h); ctx.lineTo(bx + s.w / 2, by); ctx.closePath(); ctx.fill();
  }
}
function sv2DrawCast(ctx, f) {
  const t = f.t, col = f.col;
  if (f.groundDrawn) f.groundDrawn = false; else sv2DrawShafts(ctx, f);   // 光柱已經在地面層畫過就跳過（劇情播放器沒有地面層，就在這裡畫）
  // 光波的波前：跟原本光波一樣的速度往外擴，帶著閃爍的小星光
  if (f.radius > 0 && t < .7) {
    const q = t / .7, rr = f.radius * (1 - Math.pow(1 - q, 3)), a = 1 - q;
    for (const s of f.sparks) {
      const sx = f.x0 + Math.cos(s.a) * rr * s.k, sy = f.y0 + 8 + Math.sin(s.a) * rr * s.k * .55 - 4;
      sv2Twinkle(ctx, sx, sy, 2.4 * (.6 + .4 * Math.sin(t * 20 + s.ph)), col, a);
    }
  }
}
function sv2DrawBless(ctx, f) {
  const t = f.t, col = f.col, lite = sv2Lite(col), L = f.life, q = t / L;
  const x = f.follow ? f.follow.x + f.dx : f.x, y = f.follow ? f.follow.y + f.dy : f.y, foot = y + 20;
  const env = Math.min(1, t / .2) * Math.min(1, (L - t) / .45);
  // 腳下往上升的柔光柱
  const colH = 60 * Math.min(1, t / .35), g = ctx.createLinearGradient(x, foot, x, foot - colH);
  g.addColorStop(0, sv2rgba(col, .32 * env)); g.addColorStop(.6, sv2rgba(col, .12 * env)); g.addColorStop(1, sv2rgba(col, 0));
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, foot - colH / 2, 13, colH / 2, 0, 0, 6.283); ctx.fill();
  // 腳下一圈貼地的光
  ctx.save(); ctx.translate(x, foot); ctx.scale(1, .35);
  const fg = ctx.createRadialGradient(0, 0, 0, 0, 0, 24); fg.addColorStop(0, sv2rgba(col, .4 * env)); fg.addColorStop(1, sv2rgba(col, 0));
  ctx.fillStyle = fg; ctx.beginPath(); ctx.arc(0, 0, 24, 0, 6.283); ctx.fill(); ctx.restore();
  // 螺旋光帶：繞著身體往上，轉到背後時變暗
  for (const rb of f.ribbons) {
    const N = 14, head = Math.min(1, t / (L * .7)), tail = Math.max(0, head - .45);
    for (let i = 0; i < N; i++) {
      const u0 = tail + (head - tail) * i / N, u1 = tail + (head - tail) * (i + 1) / N;
      const p = u => { const an = rb.a0 + rb.spin * u * 2.2; return [x + Math.cos(an) * 13, foot - 4 - u * 52 + Math.sin(an) * 4, Math.sin(an)]; };
      const [x0, y0, d0] = p(u0), [x1, y1] = p(u1), depth = .45 + .55 * (d0 + 1) / 2;
      ctx.strokeStyle = sv2rgba(i > N * .6 ? lite : col, (i / N) * .85 * env * depth); ctx.lineWidth = 1.2 + 2 * (i / N);
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    }
  }
  // 往上飄、一閃一閃的星光
  for (const s of f.stars) {
    const st = t - s.delay;
    if (st < 0 || st > s.life) continue;
    const k = st / s.life, a = Math.sin(k * Math.PI) * (.75 + .25 * Math.sin(st * 18 + s.ph));
    sv2Twinkle(ctx, x + s.dx + Math.sin(st * 3 + s.ph) * 3, foot - 10 - s.y0 - s.vy * st, s.r, col, a);
  }
  // 頭上一圈淡淡的光暈（後半段出現）
  if (q > .35) {
    const a = Math.min(1, (q - .35) / .2) * Math.min(1, (L - t) / .45) * .7, hy = y - 30;
    ctx.save(); ctx.translate(x, hy); ctx.scale(1, .32);
    ctx.strokeStyle = sv2rgba(lite, a); ctx.lineWidth = 2.2; ctx.beginPath(); ctx.arc(0, 0, 10, 0, 6.283); ctx.stroke();
    ctx.strokeStyle = sv2rgba(col, a * .5); ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 0, 10, 0, 6.283); ctx.stroke();
    ctx.restore();
  }
}
