// ============================================================
//  腐蝕特效 V2（阿瓦倫）：參考 pixelfx（MIT，github.com/patch-gg/pixelfx）的 acid-splash、toxic-puddle，
//  用遊戲原本的平滑風格畫。原本的紫黑霧、地上腐蝕池（扣血範圍）、焦痕、黑煙都照舊，V2 再加上：
//  - 命中：液體往上濺起一圈「皇冠」，酸液一團團拋出去（有亮點、會反光），落地變成小灘、滋滋冒泡後淡掉
//  - 腐蝕池：池子裡一直冒泡泡，泡泡長大後「啵」破掉（一圈小漣漪＋彈出兩三滴），偶爾飄起淡紫色的蒸氣
//
//  CORROSION_FX_VERSION：1＝原本畫法（V1 程式完整保留），2＝腐蝕 V2
//  CORROSION_FX_V2.coreBubbles：異質核心腳下的腐蝕痕跡要不要也冒泡（預設不要，只有阿瓦倫的池子冒）
// ============================================================
const CORROSION_FX_VERSION = 2;
const CORROSION_FX_V2 = {
  blobs: 7,           // 命中時拋出幾團酸液（大招會多一點）
  bubbleRate: 1.75,   // 腐蝕池每秒冒幾顆泡泡（大池子會多一點）
  bubbleSlow: 2,      // 泡泡長大、破掉的速度：數字越大越慢（1＝原本）
  vapourRate: 1.6,    // 腐蝕池每秒飄起幾團蒸氣
  coreBubbles: false,
};
const CV2_LIQ = ['#1a0f20', '#110a15', '#221428'], CV2_HI = '#d9b8ff', CV2_GLOW = '155,92,208';   // CV2_LIQ：酸液和地上小灘的顏色（接近黑的深紫）
const CV2_SPLAT_HI = 'rgba(90,64,110,.6)';   // 地上小灘邊緣的反光（暗）
// 泡泡的顏色：fill＝泡泡本體、rim＝邊、shine＝反光點、ripple＝破掉的漣漪、drop＝彈出的小水滴
const CV2_BUBBLE = { fill: '#050307', rim: 'rgba(40,24,54,.9)', shine: 'rgba(64,50,78,.55)', ripple: '#2a1a38', drop: '#0c0710' };
const cv2R = (a, b) => a + Math.random() * (b - a);

// 不規則小滴的外形：n 個點的半徑比例（之後用平滑曲線連起來）
function cv2Blob(n = 7) { const k = 2 + Math.floor(Math.random() * 2), ph = Math.random() * 6.28, out = []; for (let i = 0; i < n; i++) out.push(.72 + .2 * Math.sin(k * i / n * Math.PI * 2 + ph) + cv2R(-.16, .16)); return out; }
function cv2BlobPath(ctx, x, y, r, shape, rot = 0) {   // 用平滑曲線畫出不規則小滴
  const n = shape.length; ctx.beginPath();
  for (let i = 0; i <= n; i++) {
    const i0 = i % n, i1 = (i + 1) % n, t0 = i0 / n * Math.PI * 2 + rot, t1 = i1 / n * Math.PI * 2 + rot;
    const x0 = x + Math.cos(t0) * r * shape[i0], y0 = y + Math.sin(t0) * r * shape[i0], x1 = x + Math.cos(t1) * r * shape[i1], y1 = y + Math.sin(t1) * r * shape[i1];
    if (!i) ctx.moveTo((x0 + x1) / 2, (y0 + y1) / 2); else ctx.quadraticCurveTo(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
  }
  ctx.closePath();
}
// 落地的小灘：不規則外形（大凸起＋細碎起伏）、順著飛來的方向拉長，旁邊濺出幾滴小點
function cv2MakeSplat(b) {
  const r = b.r * cv2R(1.6, 2.4), n = 16, k1 = 2 + Math.floor(Math.random() * 2), p1 = Math.random() * 6.28, k2 = 4 + Math.floor(Math.random() * 3), p2 = Math.random() * 6.28, radii = [];
  for (let i = 0; i < n; i++) { const t = i / n * Math.PI * 2; radii.push(r * (.78 + .22 * Math.sin(k1 * t + p1) + .12 * Math.sin(k2 * t + p2) + cv2R(-.14, .14))); }
  const dots = [];
  for (let i = 0, nd = 2 + Math.floor(Math.random() * 3); i < nd; i++) { const a = cv2R(-.9, .9), d = r * cv2R(1.15, 1.8); dots.push({ a, d, r: r * cv2R(.14, .3), shape: cv2Blob(6), rot: Math.random() * 6.28 }); }   // 往前方噴出去的小點
  return { x: b.x, y: b.y, r, radii, dots, dir: Math.atan2(b.vy * 2, b.vx), stretch: cv2R(1.15, 1.5), t: 0, life: cv2R(1.2, 1.8), fizz: 0, col: b.col };
}
// 命中（spawnCorrosionSplash 會呼叫）：皇冠＋拋出去的酸液
function corrosionV2Splash(x, y, scale = 1) {
  const F = G.corrV2 || (G.corrV2 = { blobs: [], splats: [], crowns: [], pops: [], vapour: [] });
  const crown = [];
  for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + cv2R(-.2, .2); crown.push({ a, h: cv2R(8, 16) * scale, w: cv2R(2, 3.4) * scale }); }
  F.crowns.push({ x, y, s: scale, spikes: crown, t: 0, life: .28 });
  for (let i = 0; i < Math.round(CORROSION_FX_V2.blobs * (scale > 1 ? 1.5 : 1)); i++) {
    const a = Math.random() * Math.PI * 2, hs = cv2R(30, 80) * Math.sqrt(scale);   // 大招：多幾團，但不要噴太遠
    F.blobs.push({ x, y, z: 6, vx: Math.cos(a) * hs, vy: Math.sin(a) * hs * .5, vz: cv2R(90, 200) * scale, r: cv2R(2.2, 4) * Math.min(1.4, scale), col: CV2_LIQ[Math.floor(Math.random() * 3)], s: scale, shape: cv2Blob(7), spin: cv2R(-8, 8), rot: Math.random() * 6.28 });
  }
}

function updateCorrosionV2(dt) {
  const F = G.corrV2 || (G.corrV2 = { blobs: [], splats: [], crowns: [], pops: [], vapour: [] });
  for (const c of F.crowns) c.t += dt;
  F.crowns = F.crowns.filter(c => c.t < c.life);
  for (let i = F.blobs.length - 1; i >= 0; i--) {   // 酸液：拋物線飛、落地變小灘
    const b = F.blobs[i];
    b.vz -= 520 * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.z += b.vz * dt; b.rot += b.spin * dt;   // 飛的時候翻轉
    if (b.z <= 0) { F.splats.push(cv2MakeSplat(b)); F.blobs.splice(i, 1); }
  }
  for (const s of F.splats) {   // 小灘：滋滋冒小泡
    s.t += dt; s.fizz -= dt;
    if (s.fizz <= 0 && s.t < s.life * .7) { s.fizz = cv2R(.6, 1.2); /* 小灘冒泡的間隔 */ F.pops.push({ x: s.x + cv2R(-s.r, s.r) * .6, y: s.y + cv2R(-s.r, s.r) * .3, r: cv2R(1, 1.8), t: 0, grow: cv2R(.12, .22) * CORROSION_FX_V2.bubbleSlow, drops: [] }); }
  }
  F.splats = F.splats.filter(s => s.t < s.life);
  // 腐蝕池：冒泡、飄蒸氣
  for (const p of G.acidPools || []) {
    if (!(p.t > .3) || (p.fromCore && !CORROSION_FX_V2.coreBubbles)) continue;
    const big = Math.max(.6, p.r / 40);
    p.v2Bub = (p.v2Bub || 0) + CORROSION_FX_V2.bubbleRate * big * dt;
    for (; p.v2Bub >= 1; p.v2Bub--) {
      const a = Math.random() * Math.PI * 2, rr = Math.sqrt(Math.random()) * p.r * .8;
      F.pops.push({ x: p.x + Math.cos(a) * rr, y: p.y + Math.sin(a) * rr * (typeof ACID_SQUASH !== 'undefined' ? ACID_SQUASH : .5), r: cv2R(2, 4.2), t: 0, grow: cv2R(.25, .6) * CORROSION_FX_V2.bubbleSlow, drops: [] });
    }
    p.v2Vap = (p.v2Vap || 0) + CORROSION_FX_V2.vapourRate * big * dt;
    for (; p.v2Vap >= 1; p.v2Vap--) {
      const a = Math.random() * Math.PI * 2, rr = Math.sqrt(Math.random()) * p.r * .7, life = cv2R(1.2, 2);
      F.vapour.push({ x: p.x + Math.cos(a) * rr, y: p.y + Math.sin(a) * rr * .5, vx: cv2R(-5, 5), vy: -cv2R(10, 20), r0: cv2R(3, 5), r1: cv2R(10, 16), t: 0, life, ph: Math.random() * 6.28 });
    }
  }
  for (const b of F.pops) {   // 泡泡：長大 → 啵（漣漪＋彈出小水滴）
    b.t += dt;
    if (b.t >= b.grow && !b.popped) {
      b.popped = true;
      for (let j = 0, n = 2 + Math.floor(Math.random() * 2); j < n; j++) { const a = -Math.PI / 2 + cv2R(-1, 1); b.drops.push({ x: 0, y: 0, vx: Math.cos(a) * cv2R(15, 35), vy: Math.sin(a) * cv2R(25, 50) }); }
    }
    if (b.popped) for (const d of b.drops) { d.vy += 160 * dt; d.x += d.vx * dt; d.y += d.vy * dt; }
  }
  F.pops = F.pops.filter(b => b.t < b.grow + .22 * CORROSION_FX_V2.bubbleSlow);
  for (const v of F.vapour) { v.t += dt; v.x += (v.vx + Math.sin(v.t * 2 + v.ph) * 6) * dt; v.y += v.vy * dt; }
  F.vapour = F.vapour.filter(v => v.t < v.life);
}

function drawCorrosionV2(ctx) {
  const F = G.corrV2;
  if (!F) return;
  ctx.save();
  for (const s of F.splats) {   // 小灘：深紫色、邊緣一點亮紫反光，慢慢淡掉
    const a = Math.min(1, s.t / .08) * Math.max(0, 1 - Math.max(0, s.t - s.life * .5) / (s.life * .5));
    ctx.save(); ctx.translate(s.x, s.y); ctx.scale(1, .45); ctx.rotate(s.dir); ctx.scale(s.stretch, 1);   // 貼地、順著飛來的方向拉長
    ctx.globalAlpha = a * .85; ctx.fillStyle = s.col; ctx.beginPath();
    const n = s.radii.length;
    for (let i = 0; i <= n; i++) {   // 不規則外形：用平滑曲線把各點連起來
      const i0 = i % n, i1 = (i + 1) % n, t0 = i0 / n * Math.PI * 2, t1 = i1 / n * Math.PI * 2;
      const x0 = Math.cos(t0) * s.radii[i0], y0 = Math.sin(t0) * s.radii[i0], x1 = Math.cos(t1) * s.radii[i1], y1 = Math.sin(t1) * s.radii[i1];
      if (!i) ctx.moveTo((x0 + x1) / 2, (y0 + y1) / 2); else ctx.quadraticCurveTo(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
    }
    ctx.closePath(); ctx.fill();
    for (const d of s.dots) { cv2BlobPath(ctx, Math.cos(d.a) * d.d, Math.sin(d.a) * d.d, d.r * 1.15, d.shape, d.rot); ctx.fill(); }   // 濺出去的小點（不規則）
    ctx.globalAlpha = a * .5; ctx.strokeStyle = CV2_SPLAT_HI; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, 0, s.r * .7, Math.PI * 1.1, Math.PI * 1.6); ctx.stroke();
    ctx.restore();
  }
  for (const v of F.vapour) {   // 蒸氣：淡紫、慢慢變大變淡
    const q = v.t / v.life, r = v.r0 + (v.r1 - v.r0) * q, a = (q < .2 ? q / .2 : (1 - q) / .8) * .22;
    const g = ctx.createRadialGradient(v.x, v.y, 0, v.x, v.y, r);
    g.addColorStop(0, `rgba(170,120,210,${a.toFixed(3)})`); g.addColorStop(1, 'rgba(170,120,210,0)');
    ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(v.x, v.y, r, 0, 6.283); ctx.fill();
  }
  for (const b of F.pops) {
    if (!b.popped) {   // 泡泡：近黑的深紫、暗紫邊、左上一點小反光（BUBBLE 可調顏色）
      const k = Math.min(1, b.t / b.grow), r = b.r * (.4 + .6 * k);
      ctx.globalAlpha = 1; ctx.fillStyle = CV2_BUBBLE.fill; ctx.beginPath(); ctx.arc(b.x, b.y - r * .5, r, 0, 6.283); ctx.fill();
      ctx.strokeStyle = CV2_BUBBLE.rim; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = CV2_BUBBLE.shine; ctx.beginPath(); ctx.arc(b.x - r * .35, b.y - r * .85, Math.max(.5, r * .2), 0, 6.283); ctx.fill();
    } else {   // 啵：一圈小漣漪＋彈出的小水滴
      const q = (b.t - b.grow) / (.22 * CORROSION_FX_V2.bubbleSlow);
      ctx.save(); ctx.translate(b.x, b.y); ctx.scale(1, .45);
      ctx.globalAlpha = (1 - q) * .8; ctx.strokeStyle = CV2_BUBBLE.ripple; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(0, 0, b.r * (1 + q * 1.6), 0, 6.283); ctx.stroke(); ctx.restore();
      ctx.globalAlpha = 1 - q; ctx.fillStyle = CV2_BUBBLE.drop;
      for (const d of b.drops) { ctx.beginPath(); ctx.arc(b.x + d.x, b.y - b.r * .5 + d.y, 1, 0, 6.283); ctx.fill(); }
    }
  }
  for (const c of F.crowns) {   // 皇冠：一圈往上濺起又落下的液柱
    const q = c.t / c.life, up = Math.sin(q * Math.PI), a = 1 - q * q;
    ctx.globalAlpha = a;
    for (const sp of c.spikes) {
      const bx = c.x + Math.cos(sp.a) * (6 + 10 * q) * c.s, by = c.y + Math.sin(sp.a) * (3 + 5 * q) * c.s, h = sp.h * up;
      ctx.fillStyle = '#4a2c5c'; ctx.beginPath(); ctx.moveTo(bx - sp.w, by); ctx.quadraticCurveTo(bx, by - h * 1.2, bx + sp.w, by); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#b98cff'; ctx.beginPath(); ctx.arc(bx, by - h, sp.w * .55, 0, 6.283); ctx.fill();   // 液柱頂端的亮珠
    }
  }
  for (const b of F.blobs) {   // 飛行中的酸液：地上的影子＋本體＋亮點＋淡紫光
    ctx.globalAlpha = .25; ctx.fillStyle = '#120a16'; ctx.beginPath(); ctx.ellipse(b.x, b.y + 1, b.r, b.r * .4, 0, 0, 6.283); ctx.fill();
    const sy = b.y - b.z;
    ctx.globalAlpha = 1;
    const g = ctx.createRadialGradient(b.x, sy, 0, b.x, sy, b.r * 2.6);
    g.addColorStop(0, `rgba(${CV2_GLOW},.35)`); g.addColorStop(1, `rgba(${CV2_GLOW},0)`);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(b.x, sy, b.r * 2.6, 0, 6.283); ctx.fill();
    ctx.fillStyle = b.col; cv2BlobPath(ctx, b.x, sy, b.r * 1.15, b.shape, b.rot); ctx.fill();   // 不規則的酸液團
    ctx.fillStyle = CV2_HI; ctx.beginPath(); ctx.arc(b.x - b.r * .35, sy - b.r * .4, Math.max(.7, b.r * .3), 0, 6.283); ctx.fill();
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}
