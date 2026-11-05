// ============================================================
//  照明彈特效 V2：參考 pixelfx（MIT，github.com/patch-gg/pixelfx）的 projectiles/flare（信號彈），用遊戲原本的平滑風格畫。
//  照明範圍、燃燒秒數、哨兵看得到怪這些玩法都不變，只換外觀：
//  - 飛行中：彈頭更亮，後面拖一條淡淡的煙（煙會慢慢散開、往上飄）
//  - 落地：「啪」一閃，火花往四周濺開
//  - 燃燒中：照明棒的頭一直往外噴火花（火花有重力、落地會彈）、粉紅白色的火焰跳動、
//            一直冒帶點粉紅的濃煙往上飄、光會一下強一下弱地呼吸；快燒完時噴得斷斷續續
//
//  FLARE_FX_VERSION：1＝原本畫法（V1 程式完整保留），2＝照明彈 V2
// ============================================================
const FLARE_FX_VERSION = 2;
const FLARE_FX_V2 = {
  sparks: 38,      // 燃燒時每秒噴幾顆火花
  smoke: 4,        // 燃燒時每秒冒幾團煙
  trail: 60,       // 飛行時每秒留下幾團煙
};
const fxv2R = (a, b) => a + Math.random() * (b - a);
const FXV2_TIP = [5, -3];   // 照明棒燒的那一頭（相對落點）

function flareV2Trail(x, y) {   // 飛行中留下一團煙
  (G.flareV2Puffs = G.flareV2Puffs || []).push({ x, y, vx: fxv2R(-6, 6), vy: fxv2R(-10, -2), r0: fxv2R(2, 3.5), r1: fxv2R(9, 14), t: 0, life: fxv2R(.6, 1.1), col: [210, 170, 175], a: .28 });
}
function flareV2Land(f) {   // 落地：一閃＋火花濺開
  const v = f.v2 || (f.v2 = { sparks: [], acc: 0, sacc: 0, land: 0 });
  v.land = .18;
  for (let i = 0; i < 14; i++) {
    const a = Math.random() * Math.PI * 2, sp = fxv2R(80, 200);
    v.sparks.push({ x: FXV2_TIP[0], y: FXV2_TIP[1], vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * .6 - 60, life: fxv2R(.25, .5), max: 0 });
  }
  for (const p of v.sparks) p.max = p.life;
}
// 每幀更新（updateFlares 會呼叫）：level＝這支照明彈現在的亮度（0～1，快燒完會閃）
function flareV2Update(f, dt, level) {
  const v = f.v2 || (f.v2 = { sparks: [], acc: 0, sacc: 0, land: 0 }), C = FLARE_FX_V2;
  v.land = Math.max(0, v.land - dt);
  const sputter = level < .6 ? (Math.random() < level ? 1 : 0) : 1;   // 快燒完：斷斷續續
  for (v.acc += C.sparks * level * sputter * dt; v.acc >= 1; v.acc--) {   // 往外噴的火花：大多往上、往兩側
    const a = -Math.PI / 2 + fxv2R(-1.25, 1.25), sp = fxv2R(60, 170);
    v.sparks.push({ x: FXV2_TIP[0], y: FXV2_TIP[1], vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: fxv2R(.3, .7), max: 0 });
    v.sparks[v.sparks.length - 1].max = v.sparks[v.sparks.length - 1].life;
  }
  for (v.sacc += C.smoke * Math.max(.3, level) * dt; v.sacc >= 1; v.sacc--)   // 帶點粉紅的濃煙
    (G.flareV2Puffs = G.flareV2Puffs || []).push({ x: f.x + FXV2_TIP[0] + fxv2R(-2, 2), y: f.y + FXV2_TIP[1] - 4, vx: fxv2R(-4, 8), vy: -fxv2R(14, 26), r0: fxv2R(3, 5), r1: fxv2R(16, 26), t: 0, life: fxv2R(2.4, 3.4), col: [205, 160, 168], a: .3 });
  for (let i = v.sparks.length - 1; i >= 0; i--) {
    const p = v.sparks[i];
    if ((p.life -= dt) <= 0) { v.sparks.splice(i, 1); continue; }
    p.vy += 300 * dt; p.vx -= p.vx * 1.4 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
    if (p.y > 3 && p.vy > 0) { p.y = 3; p.vy *= -.4; p.vx *= .7; }   // 落地彈一下
  }
}
function updateFlareV2Puffs(dt) {
  if (!G.flareV2Puffs || !G.flareV2Puffs.length) return;
  for (const p of G.flareV2Puffs) { p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy *= (1 - .4 * dt); p.vx += 3 * dt; }
  G.flareV2Puffs = G.flareV2Puffs.filter(p => p.t < p.life);
}

function drawFlareV2Smoke(ctx) {   // 煙（世界層：飛行拖煙、燃燒冒煙）
  for (const p of G.flareV2Puffs || []) {
    const q = p.t / p.life, r = p.r0 + (p.r1 - p.r0) * (1 - (1 - q) * (1 - q)), a = (q < .12 ? q / .12 : (1 - q) / .88) * p.a;
    if (a <= .005) continue;
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
    g.addColorStop(0, `rgba(${p.col},${a.toFixed(3)})`); g.addColorStop(.65, `rgba(${p.col},${(a * .6).toFixed(3)})`); g.addColorStop(1, `rgba(${p.col},0)`);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 6.283); ctx.fill();
  }
}
function fxv2Flame(ctx, cx, baseY, h, w, sway, color) {
  ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(cx - w / 2, baseY);
  ctx.quadraticCurveTo(cx - w * .62, baseY - h * .5, cx + sway, baseY - h);
  ctx.quadraticCurveTo(cx + w * .62, baseY - h * .5, cx + w / 2, baseY);
  ctx.quadraticCurveTo(cx, baseY + h * .1, cx - w / 2, baseY); ctx.closePath(); ctx.fill();
}
// 燃燒中的照明彈（畫在黑幕上面，drawFlareGlow 會呼叫）：呼吸的光、跳動的火焰、噴出的火花
function drawFlareV2Glow(ctx, f, k) {
  const now = performance.now() / 1000, v = f.v2 || { sparks: [], land: 0 }, tx = f.x + FXV2_TIP[0], ty = f.y + FXV2_TIP[1];
  const breathe = .85 + .15 * Math.sin(now * 9 + f.seed) + .08 * Math.sin(now * 23 + f.seed * 2);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const R = 74 * (.9 + .1 * breathe), g = ctx.createRadialGradient(tx, ty, 0, tx, ty, R);
  g.addColorStop(0, `rgba(255,180,150,${(.5 * k * breathe).toFixed(3)})`); g.addColorStop(.3, `rgba(255,90,70,${(.2 * k).toFixed(3)})`); g.addColorStop(1, 'rgba(255,60,40,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(tx, ty, R, 0, 6.283); ctx.fill();
  if (v.land > 0) {   // 落地那一下「啪」
    const q = v.land / .18, lg = ctx.createRadialGradient(tx, ty, 0, tx, ty, 26);
    lg.addColorStop(0, `rgba(255,250,240,${q.toFixed(3)})`); lg.addColorStop(1, 'rgba(255,200,180,0)');
    ctx.fillStyle = lg; ctx.beginPath(); ctx.arc(tx, ty, 26, 0, 6.283); ctx.fill();
  }
  // 跳動的火焰：外層紅、內層粉白
  const h = (12 + 5 * Math.sin(now * 17 + f.seed) + 3 * Math.sin(now * 31 + f.seed)) * Math.max(.4, k), sway = Math.sin(now * 11 + f.seed) * 2.5;
  fxv2Flame(ctx, tx, ty + 1, h, 7, sway, `rgba(255,90,70,${(.85 * k).toFixed(3)})`);
  fxv2Flame(ctx, tx, ty + 1, h * .62, 4, sway * .7, `rgba(255,236,226,${(.95 * k).toFixed(3)})`);
  // 火花：拉長的亮線，由白熱轉紅
  ctx.lineCap = 'round';
  for (const p of v.sparks) {
    const q = p.life / p.max, sp = Math.hypot(p.vx, p.vy) || 1, len = Math.min(8, 1.5 + sp * .03);
    ctx.globalAlpha = Math.min(1, q * 2); ctx.strokeStyle = q > .6 ? '#fff4ee' : q > .3 ? '#ffb39a' : '#ff5a44'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(f.x + p.x - p.vx / sp * len, f.y + p.y - p.vy / sp * len); ctx.lineTo(f.x + p.x, f.y + p.y); ctx.stroke();
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}
// 飛行中的彈頭（drawFlareShots 會呼叫）：更亮的頭＋短亮尾（煙另外畫）
function drawFlareV2Shot(ctx, s) {
  const k = Math.min(1, s.t / s.T), x = s.x0 + (s.x1 - s.x0) * k, y = s.y0 + (s.y1 - s.y0) * k;
  const len = Math.hypot(s.x1 - s.x0, s.y1 - s.y0) || 1, tail = Math.min(46, len * k), tx = x - (s.x1 - s.x0) / len * tail, ty = y - (s.y1 - s.y0) / len * tail;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const lg = ctx.createLinearGradient(tx, ty, x, y);
  lg.addColorStop(0, 'rgba(255,80,50,0)'); lg.addColorStop(1, 'rgba(255,215,190,.95)');
  ctx.strokeStyle = lg; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(x, y); ctx.stroke();
  const g = ctx.createRadialGradient(x, y, 0, x, y, 16);
  g.addColorStop(0, 'rgba(255,250,240,1)'); g.addColorStop(.3, 'rgba(255,120,80,.7)'); g.addColorStop(1, 'rgba(255,60,40,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 16, 0, 6.283); ctx.fill();
  ctx.restore();
}
