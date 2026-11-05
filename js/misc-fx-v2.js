// ============================================================
//  其他特效 V2：參考 pixelfx（MIT，github.com/patch-gg/pixelfx）的 muzzle-pistol、bullet-tracer、bullet-impact、spell-charge、
//  thrust、heavy-landing、acid-splash，用遊戲原本的平滑風格畫。
//  - 吐酸史萊姆：飛行中的酸液球會晃動變形、有反光；落地濺起黃綠色的液體皇冠、酸液往外拋
//  - 鳥頭人衝撞：原本的撞擊圖照舊，另外加星芒一閃、往前噴的拉長火花、揚起的灰塵
//  - 葫蘆猴落地、珍珠大童的大珍珠落地：原本的撞擊圖、碎石照舊，另外加貼地雙圈、往外推的灰塵、拉長的火花
//  - 槍口火光：每一槍形狀都不一樣的星芒＋柔光，開完槍冒一縷小煙
//  - 子彈：更亮的頭、漸淡的尾巴；打到的地方迸出小火花
//  - 柯林突擊連刺：每一刺是一道細長的劍光往前刺出、刀尖閃一下、火花往前噴；最後一刺更大
//  - 大招集氣：光點從四周螺旋吸進來、兩段弧光邊轉邊縮小、中心越來越亮，最後一閃
//
//  MISC_FX_VERSION：1＝原本畫法（全部照舊），2＝V2；MISC_FX_V2 可以個別關掉某一種
// ============================================================
const MISC_FX_VERSION = 2;
const MISC_FX_V2 = { acid: true, monster: true, gun: true, stab: true, charge: true };
const mfxOn = k => typeof MISC_FX_VERSION !== 'undefined' && MISC_FX_VERSION === 2 && MISC_FX_V2[k];
const mfxR = (a, b) => a + Math.random() * (b - a);
function mfxHash(i, s) { let h = (i * 374761393 + s * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function mfxList() { return G.miscV2 || (G.miscV2 = { sparks: [], smokes: [], stabs: [], flashes: [] }); }
function mfxGlow(ctx, x, y, r, c, a) {   // 柔光（有 fxGlow 就用事先畫好的小圖，比較省）
  if (typeof fxGlow === 'function') return fxGlow(ctx, x, y, r, c, a);
  const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${c},${a})`); g.addColorStop(1, `rgba(${c},0)`);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill();
}
const mfxHex = h => { const n = parseInt(String(h || '#ffffff').slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
// 往某方向噴的拉長火花（共用）
function mfxSparks(x, y, n, ang, spread, sp0, sp1, cols) {
  const L = mfxList();
  for (let i = 0; i < n; i++) { const a = ang + mfxR(-spread, spread), sp = mfxR(sp0, sp1), life = mfxR(.12, .28); L.sparks.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life, max: life, col: cols[i % cols.length] }); }
}

// ---------- 吐酸史萊姆 ----------
// 飛行中的酸液球（combat-feel.js 的 drawAcidTop 呼叫）：晃動變形的液團＋反光＋柔光
function drawAcidShotV2(ctx, s, x, by) {
  const t = s.t, wob = Math.sin(t * 22) * .18, ang = Math.atan2((s.y1 - s.y0), (s.x1 - s.x0));
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; mfxGlow(ctx, x, by, 15, [200, 230, 70], .45); ctx.restore();
  ctx.save(); ctx.translate(x, by); ctx.rotate(ang); ctx.scale(1 + wob, 1 - wob);
  ctx.fillStyle = '#9fb82a'; ctx.beginPath(); ctx.ellipse(0, 0, 8, 7, 0, 0, 6.283); ctx.fill();
  ctx.fillStyle = '#d4e04a'; ctx.beginPath(); ctx.ellipse(-1, -1, 6, 5, 0, 0, 6.283); ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#f8ffd0'; ctx.beginPath(); ctx.arc(x - 3, by - 3, 1.8, 0, 6.283); ctx.fill();   // 反光
}
// 落地（combat-feel.js 的 addSpitPool 呼叫）：黃綠色液體皇冠＋往外拋的酸液（借用腐蝕 V2 的畫法、換顏色）
function acidSpitLandV2(x, y) {
  if (typeof corrosionV2Splash === 'function') corrosionV2Splash(x, y, 1, { liq: ['#a8bc2a', '#7f9620', '#c4d63a'], hi: '#f4ffb0', glow: '200,230,70', crown: '#6f8a1e', bead: '#e6f06a', splat: 'rgba(230,240,140,.6)' });
}

// ---------- 怪物攻擊：撞擊、落地 ----------
function birdChargeImpactV2(x, y, ang) {   // 鳥頭人衝撞：星芒、往前噴的拉長火花、灰塵
  if (typeof meleeV2Impact === 'function') meleeV2Impact(x, y, true, 'warm');   // 暖色的星芒（跟原本撞擊圖的顏色搭）
  mfxSparks(x, y, 10, ang, .55, 220, 380, ['#fff4dc', '#ffb066']);
}
function heavyLandingV2(x, y, r = 70, color = '#ffe2b0') {   // 葫蘆猴落地、大珍珠落地：貼地雙圈、灰塵、拉長火花
  if (typeof meleeV2Shockwave === 'function') meleeV2Shockwave(x, y, r, color);
}

// ---------- 槍口火光、子彈 ----------
function drawMuzzleV2(ctx, f) {   // render.js 的 f.muzzle 呼叫
  const p = Math.max(0, f.life / f.life0), seed = f.seed || (f.seed = 1 + Math.floor(Math.random() * 999));
  if (!f.smoked) { f.smoked = true; const L = mfxList(); for (let i = 0; i < 2; i++) L.smokes.push({ x: f.x + Math.cos(f.ang || 0) * 6, y: f.y + Math.sin(f.ang || 0) * 6, vx: Math.cos(f.ang || 0) * 14 + mfxR(-4, 4), vy: -mfxR(10, 22), t: 0, life: mfxR(.4, .7), r0: 2, r1: mfxR(6, 9) }); }
  ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.ang || 0); ctx.globalCompositeOperation = 'lighter';
  mfxGlow(ctx, 4, 0, 16, [255, 200, 120], .55 * p);
  ctx.globalAlpha = p;
  ctx.fillStyle = '#ffd27a'; ctx.beginPath();   // 外層星芒（每一槍形狀不同）
  const N = 7;
  for (let i = 0; i <= N * 2; i++) {
    const a = (i / (N * 2)) * Math.PI * 2, long = Math.cos(a) > .3 ? 1 : .45, rr = i % 2 ? 2.5 : (5 + 9 * mfxHash(i, seed) * long) * (.7 + .3 * p);
    const px = Math.cos(a) * rr + 3, py = Math.sin(a) * rr * .8; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#fffbe8'; ctx.beginPath(); ctx.moveTo(0, -2.2); ctx.lineTo(13 * (.6 + .4 * p), 0); ctx.lineTo(0, 2.2); ctx.closePath(); ctx.fill();   // 往前的白熱芯
  ctx.beginPath(); ctx.arc(1, 0, 3, 0, 6.283); ctx.fill();
  ctx.restore(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
}
function drawBulletV2(ctx, f) {   // render.js 的 f.bullet 呼叫
  const prog = 1 - Math.max(0, f.life) / f.life0, cx = f.x1 + (f.x2 - f.x1) * prog, cy = f.y1 + (f.y2 - f.y1) * prog;
  const ang = Math.atan2(f.y2 - f.y1, f.x2 - f.x1), len = Math.min(26, Math.hypot(f.x2 - f.x1, f.y2 - f.y1) * prog), tx = cx - Math.cos(ang) * len, ty = cy - Math.sin(ang) * len;
  const c = mfxHex(f.color);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
  const g = ctx.createLinearGradient(tx, ty, cx, cy); g.addColorStop(0, `rgba(${c},0)`); g.addColorStop(1, `rgba(${c},.95)`);
  ctx.strokeStyle = g; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(cx, cy); ctx.stroke();
  mfxGlow(ctx, cx, cy, 7, c, .6);
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(cx, cy, 1.9, 0, 6.283); ctx.fill();
  ctx.restore(); ctx.globalCompositeOperation = 'source-over';
}

// ---------- 柯林突擊連刺 ----------
function colynStabV2(x1, y1, x2, y2, color, last) {   // game.js 的 colynStabStep 呼叫
  const L = mfxList(), c = mfxHex(color), ang = Math.atan2(y2 - y1, x2 - x1);
  L.stabs.push({ x1, y1, x2: x2 + Math.cos(ang) * (last ? 18 : 10), y2: y2 + Math.sin(ang) * (last ? 18 : 10), c, t: 0, life: last ? .22 : .15, w: last ? 7 : 4.5 });
  L.flashes.push({ x: x2, y: y2, r: last ? 22 : 13, c, t: 0, life: last ? .16 : .1 });
  mfxSparks(x2, y2, last ? 10 : 5, ang, .5, 160, last ? 320 : 240, ['#ffffff', color]);
}

// ---------- 大招集氣 ----------
function drawChargeV2(ctx, f) {   // render.js 的 f.charge 呼叫
  const prog = 1 - Math.max(0, f.life) / f.life0, c = mfxHex(f.color), seed = f.seed || (f.seed = 1 + Math.floor(Math.random() * 999));
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
  // 光點從四周螺旋吸進來
  for (let i = 0; i < 14; i++) {
    const ph = (prog * 1.6 + mfxHash(i, seed)) % 1, r = 46 * (1 - ph), a = mfxHash(i, seed + 1) * 6.283 + ph * 3.2;
    const px = f.x + Math.cos(a) * r, py = f.y + Math.sin(a) * r * .6, al = Math.sin(ph * Math.PI) * (.4 + .6 * prog);
    ctx.globalAlpha = al; ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(px, py, 1.3, 0, 6.283); ctx.fill();
    ctx.globalAlpha = 1; mfxGlow(ctx, px, py, 5, c, .5 * al);
  }
  // 兩段弧光邊轉邊縮小
  const rr = Math.max(6, 40 - 30 * prog), rot = prog * 8 + seed;
  ctx.strokeStyle = `rgba(${c},${(.35 + .5 * prog).toFixed(3)})`; ctx.lineWidth = 1.5 + 2 * prog;
  for (let k = 0; k < 2; k++) { ctx.beginPath(); ctx.ellipse(f.x, f.y, rr, rr * .6, 0, rot + k * Math.PI, rot + k * Math.PI + 1.6); ctx.stroke(); }
  // 中心越來越亮
  mfxGlow(ctx, f.x, f.y, 10 + 22 * prog, c, .35 + .5 * prog);
  ctx.globalAlpha = .4 + .6 * prog; ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(f.x, f.y, 1.5 + 3.5 * prog, 0, 6.283); ctx.fill();
  if (prog > .88) { const q = (prog - .88) / .12; ctx.globalAlpha = 1; mfxGlow(ctx, f.x, f.y, 30 + 20 * q, [255, 255, 255], .7 * Math.sin(q * Math.PI)); }   // 最後一閃
  ctx.restore(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
}

// ---------- 每幀更新、畫（updateWorldEffects、drawWorldEffects 會呼叫）----------
function updateMiscV2(dt) {
  if (typeof MISC_FX_VERSION === 'undefined' || MISC_FX_VERSION !== 2) return;
  const L = mfxList();
  if (MISC_FX_V2.gun) for (const f of G.effects || []) {   // 子彈飛到底：打到的地方迸出小火花
    if (f.bullet && !f.v2hit && f.life - dt <= 0 && !f.stab) { f.v2hit = true; const ang = Math.atan2(f.y2 - f.y1, f.x2 - f.x1) + Math.PI; mfxSparks(f.x2, f.y2, 4, ang, .9, 60, 160, ['#fff6d8', f.color || '#ffe79a']); }
  }
  for (const p of L.sparks) { p.life -= dt; p.vx -= p.vx * 6 * dt; p.vy -= p.vy * 6 * dt - 120 * dt; p.x += p.vx * dt; p.y += p.vy * dt; }
  L.sparks = L.sparks.filter(p => p.life > 0);
  for (const s of L.smokes) { s.t += dt; s.x += s.vx * dt; s.y += s.vy * dt; s.vx *= (1 - 2 * dt); }
  L.smokes = L.smokes.filter(s => s.t < s.life);
  for (const q of [L.stabs, L.flashes]) for (const o of q) o.t += dt;
  L.stabs = L.stabs.filter(o => o.t < o.life); L.flashes = L.flashes.filter(o => o.t < o.life);
}
function drawMiscV2(ctx) {
  if (!G.miscV2 || typeof MISC_FX_VERSION === 'undefined' || MISC_FX_VERSION !== 2) return;
  const L = G.miscV2;
  ctx.save();
  for (const s of L.smokes) {   // 槍口的小煙
    const q = s.t / s.life, r = s.r0 + (s.r1 - s.r0) * q;
    if (typeof fxGlow === 'function') fxGlow(ctx, s.x, s.y, r, [190, 190, 196], (1 - q) * .3, 'disc');
  }
  ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
  for (const s of L.stabs) {   // 劍光：先刺出去（變長）、再變細消失
    const q = s.t / s.life, ext = Math.min(1, q / .35), thin = q < .35 ? 1 : 1 - (q - .35) / .65;
    const ex = s.x1 + (s.x2 - s.x1) * ext, ey = s.y1 + (s.y2 - s.y1) * ext;
    ctx.strokeStyle = `rgba(${s.c},${(.5 * thin).toFixed(3)})`; ctx.lineWidth = s.w * 2 * thin; ctx.beginPath(); ctx.moveTo(s.x1, s.y1); ctx.lineTo(ex, ey); ctx.stroke();
    ctx.strokeStyle = `rgba(255,255,255,${(.95 * thin).toFixed(3)})`; ctx.lineWidth = s.w * .55 * thin; ctx.beginPath(); ctx.moveTo(s.x1 + (ex - s.x1) * .3, s.y1 + (ey - s.y1) * .3); ctx.lineTo(ex, ey); ctx.stroke();
  }
  for (const fl of L.flashes) {   // 刀尖閃光：十字星芒
    const q = 1 - fl.t / fl.life, r = fl.r * (1 + (1 - q) * .5);
    mfxGlow(ctx, fl.x, fl.y, r, fl.c, .7 * q);
    ctx.fillStyle = `rgba(255,255,255,${q.toFixed(3)})`;
    ctx.beginPath(); ctx.moveTo(fl.x - r, fl.y); ctx.lineTo(fl.x, fl.y - r * .12); ctx.lineTo(fl.x + r, fl.y); ctx.lineTo(fl.x, fl.y + r * .12); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(fl.x, fl.y - r * .7); ctx.lineTo(fl.x + r * .1, fl.y); ctx.lineTo(fl.x, fl.y + r * .7); ctx.lineTo(fl.x - r * .1, fl.y); ctx.closePath(); ctx.fill();
  }
  for (const p of L.sparks) {   // 拉長的火花
    const k = p.life / p.max, sp = Math.hypot(p.vx, p.vy) || 1, len = Math.min(12, 2 + sp * .035);
    ctx.globalAlpha = Math.min(1, k * 2); ctx.strokeStyle = p.col; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(p.x - p.vx / sp * len, p.y - p.vy / sp * len); ctx.lineTo(p.x, p.y); ctx.stroke();
  }
  ctx.restore();
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
}
