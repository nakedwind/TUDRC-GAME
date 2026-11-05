// ============================================================
//  近戰特效 V2：參考 pixelfx（MIT，github.com/patch-gg/pixelfx）的 sword-slash、heavy-cleave、hit-spark、blunt-hit、ground-slam，
//  用遊戲原本的平滑風格畫：
//  - 揮砍弧光：真的會「揮過去」（從一端掃到另一端、尾巴再收掉），兩端尖、中間厚，前緣一道白亮線，後面拖殘影
//    柯林＝細長快速的劍光＋速度線＋刀尖閃光；雷德＝中等、兩層殘影；路德＝又短又厚的重劈；其他（阿瓦倫、怪物）＝一般
//  - 命中：一瞬間的白色星芒、火花變成會拉長的亮線往外飛；重擊再加貼地衝擊環和揚起的灰塵
//  - 近戰大招衝擊波：貼地雙圈、往外推的一圈灰塵、地上裂開幾道光紋、火花
//
//  MELEE_FX_VERSION：1＝原本畫法（V1 程式完整保留），2＝近戰 V2
// ============================================================
const MELEE_FX_VERSION = 2;
const MELEE_FX_V2 = {
  //        R＝弧半徑  band＝最厚處  span＝弧長（弧度）  life＝秒  ghosts＝殘影數  lines＝速度線
  colyn:  { R: 52, band: 6,  span: 2.5, life: .16, ghosts: 1, lines: 3, glint: true },   // 柯林：細長快速的劍光
  red:    { R: 46, band: 11, span: 2.0, life: .22, ghosts: 2, lines: 0 },                // 雷德：中等、兩層殘影
  luther: { R: 50, band: 16, span: 1.6, life: .25, ghosts: 1, lines: 0 },                // 路德：又短又厚的重劈
  normal: { R: 42, band: 10, span: 1.9, life: .2,  ghosts: 1, lines: 0 },                // 一般（阿瓦倫、怪物）
  heavy:  { R: 54, band: 13, span: 2.2, life: .26, ghosts: 1, lines: 0 },                // 一般重擊（怪物的重擊）
};
const mv2R = (a, b) => a + Math.random() * (b - a);

// 揮砍：style＝角色種類（colyn／red／luther），沒給就看 heavy；pal＝SLASH_PALETTES 的顏色組
function meleeV2Slash(x, y, angle, heavy, pal, style) {
  const S = MELEE_FX_V2[style] || (heavy ? MELEE_FX_V2.heavy : MELEE_FX_V2.normal);
  (G.meleeV2 = G.meleeV2 || []).push({ slash: true, x, y, angle, S, pal: (typeof SLASH_PALETTES !== 'undefined' && SLASH_PALETTES[pal]) || pal || { after: '#3f8bff', outer: '#4a9cff', glow: '#6ab4ff', core: '#eef8ff', edge: '#ffffff' }, t: 0, life: S.life });
}
// 命中：heavy＝重擊（多火花、貼地環、灰塵）
function meleeV2Impact(x, y, heavy, style) {
  if (style === 'luther') heavy = true;   // 路德的拳頭一律算重擊
  const n = heavy ? 12 : 8, sparks = [];
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, sp = mv2R(150, 330) * (heavy ? 1.15 : 1);
    sparks.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * .75, life: mv2R(.14, .3), max: 0 });
  }
  for (const p of sparks) p.max = p.life;
  const dust = [];
  if (heavy) for (let i = 0; i < 6; i++) {
    const a = i / 6 * Math.PI * 2 + mv2R(-.3, .3), sp = mv2R(50, 90);
    dust.push({ x: x + Math.cos(a) * 6, y: y + 8 + Math.sin(a) * 3, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * .4, r0: mv2R(5, 8), r1: mv2R(14, 20), life: mv2R(.4, .6), max: 0, shade: Math.random() });
  }
  for (const d of dust) d.max = d.life;
  (G.meleeV2 = G.meleeV2 || []).push({ impact: true, x, y, heavy, sparks, dust, rot: Math.random() * Math.PI, spikes: Array.from({ length: 8 }, () => mv2R(.6, 1)), t: 0, life: .5 });
}
// 近戰大招衝擊波
function meleeV2Shockwave(x, y, r, color) {
  const dust = [], sparks = [], cracks = [];
  for (let i = 0; i < 16; i++) {
    const a = i / 16 * Math.PI * 2 + mv2R(-.15, .15), sp = mv2R(r * 1.4, r * 2.2);
    dust.push({ x: x + Math.cos(a) * 10, y: y + Math.sin(a) * 5, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * .45, r0: mv2R(6, 10), r1: mv2R(18, 28), life: mv2R(.5, .8), max: 0, shade: Math.random() });
  }
  for (let i = 0; i < 16; i++) {
    const a = Math.random() * Math.PI * 2, sp = mv2R(160, 320);
    sparks.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * .6, life: mv2R(.2, .4), max: 0 });
  }
  for (let i = 0; i < 6; i++) {   // 地上的裂紋光（從中心往外、折幾折）
    let a = i / 6 * Math.PI * 2 + mv2R(-.3, .3), d = 0; const pts = [[0, 0]];
    for (let k = 0; k < 4; k++) { d += r * mv2R(.12, .2); a += mv2R(-.4, .4); pts.push([Math.cos(a) * d, Math.sin(a) * d * .45]); }
    cracks.push(pts);
  }
  for (const p of [...dust, ...sparks]) p.max = p.life;
  (G.meleeV2 = G.meleeV2 || []).push({ shock: true, x, y, r, color, dust, sparks, cracks, t: 0, life: .9 });
}

function updateMeleeV2(dt) {
  if (!G.meleeV2 || !G.meleeV2.length) return;
  for (const f of G.meleeV2) {
    f.t += dt;
    for (const p of f.sparks || []) { p.life -= dt; p.vx -= p.vx * 6 * dt; p.vy -= p.vy * 6 * dt; p.x += p.vx * dt; p.y += p.vy * dt; }
    for (const d of f.dust || []) { d.life -= dt; d.vx *= Math.pow(.04, dt); d.vy *= Math.pow(.04, dt); d.x += d.vx * dt; d.y += d.vy * dt - 6 * dt; }
  }
  G.meleeV2 = G.meleeV2.filter(f => f.t < f.life);
}

// 一條兩端尖、中間厚的弧（u0～u1：只畫弧的這一段；band＝最厚處）
function mv2Crescent(ctx, R, band, a0, span, u0, u1) {
  if (u1 - u0 < .02) return;
  const N = 18, outer = [], inner = [];
  for (let i = 0; i <= N; i++) {
    const u = u0 + (u1 - u0) * i / N, a = a0 + span * u, th = band * Math.pow(Math.sin(Math.PI * u), .7);
    outer.push([Math.cos(a) * R, Math.sin(a) * R]); inner.push([Math.cos(a) * (R - th), Math.sin(a) * (R - th)]);
  }
  ctx.beginPath(); ctx.moveTo(outer[0][0], outer[0][1]);
  for (const [px, py] of outer) ctx.lineTo(px, py);
  for (let i = inner.length - 1; i >= 0; i--) ctx.lineTo(inner[i][0], inner[i][1]);
  ctx.closePath(); ctx.fill();
}
function mv2Glow(ctx, x, y, r, col, a) {
  if (a <= .005) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, col.replace('A', Math.min(1, a).toFixed(3))); g.addColorStop(1, col.replace('A', '0'));
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill();
}

function drawMeleeV2(ctx) {
  if (!G.meleeV2 || !G.meleeV2.length) return;
  ctx.save(); ctx.lineCap = 'round';
  for (const f of G.meleeV2) {
    if (f.slash) mv2DrawSlash(ctx, f);
    else if (f.impact) mv2DrawImpact(ctx, f);
    else if (f.shock) mv2DrawShock(ctx, f);
  }
  ctx.restore();
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
}
function mv2DrawSlash(ctx, f) {
  const S = f.S, pal = f.pal, prog = Math.min(1, f.t / f.life);
  const head = Math.min(1, prog / .35), tail = Math.max(0, (prog - .3) / .7);   // 前端先掃過去，尾巴再收掉
  const R = S.R * (.94 + prog * .12), a0 = -S.span / 2, alpha = prog < .7 ? 1 : 1 - (prog - .7) / .3;
  ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.angle);
  // 深色外框（亮的地板上也看得到輪廓）
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = alpha * .35; ctx.fillStyle = '#0d1a33';
  mv2Crescent(ctx, R + 1.5, S.band + 3, a0, S.span, tail, head);
  ctx.globalCompositeOperation = 'lighter';
  for (let g = S.ghosts; g >= 1; g--) {   // 殘影：往回錯開一點、越後面越淡
    ctx.save(); ctx.rotate(-.22 * g); ctx.globalAlpha = alpha * .22 / g; ctx.fillStyle = pal.after;
    mv2Crescent(ctx, R * (1 - .03 * g), S.band * .9, a0, S.span, Math.max(0, tail - .1), head); ctx.restore();
  }
  ctx.globalAlpha = alpha * .65; ctx.fillStyle = pal.outer; mv2Crescent(ctx, R + 2, S.band * 1.35, a0, S.span, tail, head);   // 外光
  ctx.globalAlpha = alpha; ctx.fillStyle = pal.core; mv2Crescent(ctx, R, S.band * .7, a0, S.span, tail, head);              // 白核
  // 前緣白亮線（只畫在前半段，越靠近刀鋒越亮）
  const e0 = Math.max(tail, head - .45), N = 12;
  ctx.strokeStyle = pal.edge; ctx.lineWidth = S.band > 12 ? 2.6 : 1.8;
  ctx.beginPath();
  for (let i = 0; i <= N; i++) { const u = e0 + (head - e0) * i / N, a = a0 + S.span * u; i ? ctx.lineTo(Math.cos(a) * R, Math.sin(a) * R) : ctx.moveTo(Math.cos(a) * R, Math.sin(a) * R); }
  ctx.globalAlpha = alpha; ctx.stroke();
  // 速度線（柯林）：沿著弧外側幾條細線
  for (let i = 0; i < (S.lines || 0); i++) {
    const rr = R + 5 + i * 5, s0 = Math.max(tail, head - .5 + i * .08), s1 = head - .05 * i;
    if (s1 <= s0) continue;
    ctx.globalAlpha = alpha * (.45 - i * .1); ctx.strokeStyle = pal.glow; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(0, 0, rr, a0 + S.span * s0, a0 + S.span * s1); ctx.stroke();
  }
  // 刀尖閃光（柯林）
  if (S.glint && prog > .2 && prog < .6) {
    const a = a0 + S.span * head, gx = Math.cos(a) * R, gy = Math.sin(a) * R, k = 1 - Math.abs(prog - .4) / .2, r = 7 * k;
    ctx.globalAlpha = k; ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.moveTo(gx, gy - r); ctx.lineTo(gx + r * .25, gy); ctx.lineTo(gx, gy + r); ctx.lineTo(gx - r * .25, gy); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(gx - r, gy); ctx.lineTo(gx, gy + r * .25); ctx.lineTo(gx + r, gy); ctx.lineTo(gx, gy - r * .25); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}
function mv2DrawImpact(ctx, f) {
  const t = f.t, x = f.x, y = f.y, H = f.heavy ? 1.3 : 1;
  // 灰塵（重擊）
  for (const d of f.dust) {
    if (d.life <= 0) continue;
    const q = 1 - d.life / d.max, r = d.r0 + (d.r1 - d.r0) * (1 - (1 - q) * (1 - q)), a = (q < .15 ? q / .15 : (1 - q) / .85) * .4;
    const c = [Math.round(170 + d.shade * 30), Math.round(155 + d.shade * 25), Math.round(125 + d.shade * 20)];
    const g = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, r);
    g.addColorStop(0, `rgba(${c},${a.toFixed(3)})`); g.addColorStop(1, `rgba(${c},0)`);
    ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(d.x, d.y, r, 0, 6.283); ctx.fill();
  }
  // 貼地衝擊環（重擊）
  if (f.heavy && t < .25) {
    const q = t / .25; ctx.save(); ctx.translate(x, y + 8); ctx.scale(1, .45);
    ctx.globalAlpha = (1 - q) * .7; ctx.strokeStyle = '#dceaff'; ctx.lineWidth = 1 + 3 * (1 - q);
    ctx.beginPath(); ctx.arc(0, 0, 8 + 30 * (1 - (1 - q) * (1 - q)), 0, 6.283); ctx.stroke(); ctx.restore();
  }
  ctx.globalCompositeOperation = 'lighter';
  // 一瞬間的星芒
  const flashT = f.heavy ? .13 : .1;
  if (t < flashT) {
    const k = 1 - t / flashT, R = (f.heavy ? 26 : 19) * (1 + t * 2);
    mv2Glow(ctx, x, y, R * 1.3, 'rgba(160,200,255,A)', .7 * k);
    ctx.save(); ctx.translate(x, y); ctx.rotate(f.rot); ctx.globalAlpha = k;
    ctx.fillStyle = '#ffffff'; ctx.beginPath();
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, rr = i % 2 ? R * .28 : R * f.spikes[i >> 1]; i ? ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    ctx.closePath(); ctx.fill(); ctx.restore();
  }
  // 火花：拉長的亮線，越飛越短
  for (const p of f.sparks) {
    if (p.life <= 0) continue;
    const k = p.life / p.max, sp = Math.hypot(p.vx, p.vy) || 1, len = Math.min(14, 2 + sp * .045) * H;
    ctx.globalAlpha = Math.min(1, k * 2); ctx.strokeStyle = k > .5 ? '#ffffff' : '#9cc8ff'; ctx.lineWidth = f.heavy ? 2 : 1.6;
    ctx.beginPath(); ctx.moveTo(p.x - p.vx / sp * len, p.y - p.vy / sp * len); ctx.lineTo(p.x, p.y); ctx.stroke();
  }
  ctx.globalAlpha = 1;
}
function mv2DrawShock(ctx, f) {
  const t = f.t, x = f.x, y = f.y, r = f.r, col = f.color || '#dceaff';
  for (const d of f.dust) {   // 往外推的一圈灰塵
    if (d.life <= 0) continue;
    const q = 1 - d.life / d.max, rr = d.r0 + (d.r1 - d.r0) * (1 - (1 - q) * (1 - q)), a = (q < .12 ? q / .12 : (1 - q) / .88) * .42;
    const c = [Math.round(170 + d.shade * 30), Math.round(155 + d.shade * 25), Math.round(125 + d.shade * 20)];
    const g = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, rr);
    g.addColorStop(0, `rgba(${c},${a.toFixed(3)})`); g.addColorStop(1, `rgba(${c},0)`);
    ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(d.x, d.y, rr, 0, 6.283); ctx.fill();
  }
  // 貼地雙圈
  for (const [dur, k0, w] of [[.38, 1, 4], [.26, .65, 2.5]]) {
    if (t > dur) continue;
    const q = t / dur; ctx.save(); ctx.translate(x, y); ctx.scale(1, .5);
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = (1 - q) * .3; ctx.strokeStyle = '#0d1a33'; ctx.lineWidth = w + 3;
    const rr = (10 + (r * k0 - 10) * (1 - (1 - q) * (1 - q)));
    ctx.beginPath(); ctx.arc(0, 0, rr, 0, 6.283); ctx.stroke();
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = (1 - q) * .9; ctx.strokeStyle = col; ctx.lineWidth = w * (1 - q * .6);
    ctx.beginPath(); ctx.arc(0, 0, rr, 0, 6.283); ctx.stroke(); ctx.restore();
  }
  // 地上的裂紋光
  if (t < .55) {
    const k = 1 - t / .55, grow = Math.min(1, t / .12);
    ctx.save(); ctx.translate(x, y); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = col; ctx.lineJoin = 'round';
    for (const pts of f.cracks) {
      const n = Math.max(2, Math.round(pts.length * grow));
      ctx.globalAlpha = k * .9; ctx.lineWidth = 2.2;
      ctx.beginPath(); for (let i = 0; i < n; i++) i ? ctx.lineTo(pts[i][0], pts[i][1]) : ctx.moveTo(pts[i][0], pts[i][1]); ctx.stroke();
    }
    ctx.restore();
  }
  ctx.globalCompositeOperation = 'lighter';
  if (t < .15) mv2Glow(ctx, x, y - 4, 40 * (1 + t * 3), 'rgba(255,255,255,A)', .8 * (1 - t / .15));   // 中心一閃
  for (const p of f.sparks) {
    if (p.life <= 0) continue;
    const k = p.life / p.max, sp = Math.hypot(p.vx, p.vy) || 1, len = Math.min(16, 2 + sp * .05);
    ctx.globalAlpha = Math.min(1, k * 2); ctx.strokeStyle = k > .5 ? '#ffffff' : col; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(p.x - p.vx / sp * len, p.y - p.vy / sp * len); ctx.lineTo(p.x, p.y); ctx.stroke();
  }
  ctx.globalAlpha = 1;
}
