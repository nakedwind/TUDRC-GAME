// ============================================================
//  雷電特效 V2（安柏）：參考 pixelfx（MIT，github.com/patch-gg/pixelfx）的 lightning-strike、zap-hit、chain-lightning，
//  用遊戲原本的平滑風格畫：
//  - 劈下前一瞬間：落點地面先亮起一圈、天上垂下一道淡淡的引導電光
//  - 主閃電：粗的藍色電光＋白色電芯，劈下後會「再劈」兩次（形狀換掉、亮度跳動），比較像真的閃電
//  - 命中：白光一閃、貼地的衝擊環、地面一片藍白光慢慢退掉
//  - 殘留電弧：命中後地上還有幾條小電弧劈啪亂竄一下
//  - 電火花：藍白火星噴出去、落地會彈
//  - 連鎖：同一擊波及到的其他怪物，從主目標牽一道電弧過去（看得出打到誰）
//
//  LIGHTNING_FX_VERSION：1＝原本畫法（V1 程式完整保留），2＝雷電 V2
// ============================================================
const LIGHTNING_FX_VERSION = 2;
const LIGHTNING_FX_V2 = {
  pre: .06,       // 劈下前，地面先亮、引導電光的時間（秒）
  life: .3,       // 主閃電持續多久（秒），期間會再劈兩次
  arcs: 3,        // 殘留電弧條數（大招會多一點）
  arcLife: .6,    // 殘留電弧持續多久（秒）
  sparks: 10,     // 電火花顆數
  chainLife: .24, // 連鎖電弧持續多久（秒）
};

function lv2Hash(i, s) { let h = (i * 374761393 + s * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
const lv2R = (a, b) => a + Math.random() * (b - a);
function lv2Jag(x0, y0, x1, y1, segs, jit, rnd) {   // 鋸齒線：rnd() 決定每一折的偏移（給固定的 rnd 就會是同一個形狀）
  const pts = [[x0, y0]], dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len;
  for (let i = 1; i < segs; i++) {
    const t = i / segs, j = (rnd() * 2 - 1) * jit * (1 - t * .5);
    pts.push([x0 + dx * t + nx * j, y0 + dy * t + ny * j]);
  }
  pts.push([x1, y1]);
  return pts;
}
function lv2Bolt(x, y, top, s) {   // 一個完整的閃電形狀：主幹＋分岔
  const main = lv2Jag(x + lv2R(-10, 10) * s, top, x, y, 9, 16 * s, Math.random), branches = [];
  for (let b = 0; b < 2 + (s > 1.5 ? 2 : 0); b++) {
    const i = 2 + Math.floor(Math.random() * (main.length - 4)), [bx, by] = main[i];
    branches.push(lv2Jag(bx, by, bx + lv2R(-36, 36) * s, by + lv2R(12, 34) * s, 4, 10 * s, Math.random));
  }
  return { main, branches };
}

function lightningV2(x, y, scale = 1) {
  const C = LIGHTNING_FX_V2, s = scale, top = y - (95 + Math.random() * 30) * s;
  const z = { x, y, s, t: 0, top, seed: Math.floor(Math.random() * 9999),
    shapes: [lv2Bolt(x, y, top, s), lv2Bolt(x, y, top, s), lv2Bolt(x, y, top, s)],
    arcs: Array.from({ length: Math.round(C.arcs * (s > 1.3 ? 1.7 : 1)) }, (_, i) => ({ a: i / C.arcs * Math.PI * 2 + lv2R(-.5, .5), len: lv2R(16, 32) * s, start: lv2R(0, .15), seed: Math.floor(Math.random() * 9999) })),
    sparks: [] };
  for (let i = 0; i < Math.round(C.sparks * Math.min(2, s)); i++) {
    const a = Math.random() * Math.PI * 2, hs = lv2R(60, 200) * s;
    z.sparks.push({ x, y, h: 6 * s, vx: Math.cos(a) * hs, vy: Math.sin(a) * hs * .5, vh: lv2R(60, 220) * s, life: lv2R(.2, .5), max: 0, delay: C.pre });
  }
  for (const p of z.sparks) p.max = p.life;
  (G.lightningV2 = G.lightningV2 || []).push(z);
  return z;
}
// 連鎖：從 from 牽電弧到每個 to（被同一擊波及的其他怪物）
function lightningV2Chain(from, tos) {
  for (const to of tos) (G.lightningV2 = G.lightningV2 || []).push({ chain: true, x0: from.x, y0: from.y - 6, x1: to.x, y1: to.y - 10, t: -LIGHTNING_FX_V2.pre, seed: Math.floor(Math.random() * 9999) });
}

function updateLightningV2(dt) {
  if (!G.lightningV2 || !G.lightningV2.length) return;
  const C = LIGHTNING_FX_V2;
  for (const z of G.lightningV2) {
    z.t += dt;
    if (z.chain) continue;
    for (let i = z.sparks.length - 1; i >= 0; i--) {
      const p = z.sparks[i];
      if (p.delay > 0) { p.delay -= dt; continue; }
      if ((p.life -= dt) <= 0) { z.sparks.splice(i, 1); continue; }
      p.vh -= 600 * dt; p.vx -= p.vx * 2 * dt; p.vy -= p.vy * 2 * dt;
      p.x += p.vx * dt; p.y += p.vy * dt; p.h += p.vh * dt;
      if (p.h <= 0 && p.vh < 0) { p.h = 0; p.vh *= -.45; p.vx *= .7; p.vy *= .7; }   // 落地彈一下
    }
  }
  G.lightningV2 = G.lightningV2.filter(z => z.chain ? z.t < C.chainLife : (z.t < C.pre + Math.max(C.life, C.arcLife + .15) || z.sparks.length));
}

function lv2Stroke(ctx, pts, a, wGlow, wMid, wCore) {   // 三層：外圈淡藍光、藍色電光、白色電芯
  const trace = () => { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.stroke(); };
  ctx.globalCompositeOperation = 'source-over';   // 深藍外框：亮的地板上也看得清楚（加色在亮處會被沖淡）
  ctx.globalAlpha = a * .45; ctx.strokeStyle = '#173a6e'; ctx.lineWidth = wMid + 2.2; trace();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = a * .22; ctx.strokeStyle = '#3ad6ff'; ctx.lineWidth = wGlow; trace();
  ctx.globalAlpha = a * .75; ctx.strokeStyle = '#7fdcff'; ctx.lineWidth = wMid; trace();
  ctx.globalAlpha = a; ctx.strokeStyle = '#f4fdff'; ctx.lineWidth = wCore; trace();
}
function lv2Glow(ctx, x, y, r, rgb, a, squash = 1) {
  if (a <= .005) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(1, squash);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
  g.addColorStop(0, `rgba(${rgb},${Math.min(1, a).toFixed(3)})`); g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.283); ctx.fill(); ctx.restore();
}

function drawLightningV2(ctx) {
  if (!G.lightningV2 || !G.lightningV2.length) return;
  const C = LIGHTNING_FX_V2;
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.globalCompositeOperation = 'lighter';
  for (const z of G.lightningV2) {
    if (z.chain) {   // 連鎖電弧：每秒換 25 次形狀
      if (z.t < 0) continue;
      const k = 1 - z.t / C.chainLife, step = Math.floor(z.t * 25);
      let n = 0; const rnd = () => lv2Hash(step * 13 + n++, z.seed);
      const d = Math.hypot(z.x1 - z.x0, z.y1 - z.y0);
      lv2Stroke(ctx, lv2Jag(z.x0, z.y0, z.x1, z.y1, Math.max(3, Math.round(d / 12)), 9, rnd), k * (step % 3 ? 1 : .55), 7, 2.6, 1.1);
      lv2Glow(ctx, z.x1, z.y1, 14, '190,240,255', .6 * k);
      continue;
    }
    const { x, y, s } = z, t = z.t;
    if (t < C.pre) {   // 劈下前：地面先亮、天上垂下淡淡的引導電光
      const q = t / C.pre;
      lv2Glow(ctx, x, y, (10 + 22 * q) * s, '150,220,255', .5 * q, .45);
      const lead = z.shapes[0].main, n = Math.max(2, Math.round(lead.length * q));
      lv2Stroke(ctx, lead.slice(0, n), .35, 4 * s, 1.6 * s, .8 * s);
      continue;
    }
    const tt = t - C.pre;
    if (tt < C.life) {   // 主閃電：分三段換形狀（再劈兩次），亮度跳動
      const seg = Math.min(2, Math.floor(tt / (C.life / 3))), local = tt - seg * C.life / 3;
      const flick = local < .03 ? 1 : (Math.sin(tt * 95) > -.2 ? .85 : .3), a = Math.min(1, (1 - tt / C.life) * 1.8) * flick * (seg ? .8 : 1);
      const sh = z.shapes[seg];
      lv2Stroke(ctx, sh.main, a, 11 * s, 4.2 * s, 1.8 * s);
      for (const br of sh.branches) lv2Stroke(ctx, br, a * .85, 6 * s, 2.4 * s, 1 * s);
      lv2Glow(ctx, sh.main[0][0], sh.main[0][1], 26 * s, '170,230,255', .35 * a);   // 雲端那頭也亮一下
    }
    // 命中：白光一閃、貼地衝擊環、地面一片藍白光慢慢退掉
    if (tt < .14) lv2Glow(ctx, x, y - 4 * s, 30 * s * (1 + tt * 3), '255,255,255', 1 - tt / .14);
    if (tt < .3) {
      const q = tt / .3, rr = (6 + 34 * (1 - (1 - q) * (1 - q))) * s;
      ctx.save(); ctx.translate(x, y); ctx.scale(1, .45); ctx.globalAlpha = (1 - q) * .8; ctx.strokeStyle = '#bfefff'; ctx.lineWidth = (1 + 3 * (1 - q)) * s;
      ctx.beginPath(); ctx.arc(0, 0, rr, 0, 6.283); ctx.stroke(); ctx.restore();
    }
    lv2Glow(ctx, x, y, 46 * s, '120,200,255', .4 * Math.max(0, 1 - tt / .45), .45);
    // 殘留電弧：從命中點沿地面往外亂竄，每秒換 20 次形狀
    for (const arc of z.arcs) {
      const at = tt - arc.start;
      if (at < 0 || at > C.arcLife) continue;
      const k = 1 - at / C.arcLife, step = Math.floor(at * 20);
      if (lv2Hash(step, arc.seed) < .2) continue;   // 偶爾斷一下，比較像在劈啪
      let n = 0; const rnd = () => lv2Hash(step * 17 + n++, arc.seed);
      const a2 = arc.a + (rnd() - .5) * .8, L = arc.len * (.6 + .4 * rnd());
      const pts = lv2Jag(x, y, x + Math.cos(a2) * L, y + Math.sin(a2) * L * .45, 4, 6 * s, rnd);
      lv2Stroke(ctx, pts, k, 5 * s, 2 * s, .9 * s);
    }
    // 電火花：藍白亮線，落地會彈
    for (const p of z.sparks) {
      if (p.delay > 0) continue;
      const k = p.life / p.max, sx = p.x, sy = p.y - p.h, vx = p.vx, vy = p.vy - p.vh, sp = Math.hypot(vx, vy) || 1, len = Math.min(10, 2 + sp * .03) * Math.max(.6, s);
      ctx.globalAlpha = Math.min(1, k * 2); ctx.strokeStyle = k > .5 ? '#f4fdff' : '#7fdcff'; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(sx - vx / sp * len, sy - vy / sp * len); ctx.lineTo(sx, sy); ctx.stroke();
    }
  }
  ctx.restore();
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
}
