// ============================================================
//  怪物狀態特效 V2：參考 pixelfx（MIT，github.com/patch-gg/pixelfx）的 status 特效，用遊戲原本的平滑風格畫
//  原本只在頭上寫字（顫抖／麻痺／睡著／混亂），V2 改成直接畫在怪物身上：
//  - 顫抖（被停住）：頭上三顆星星繞圈，轉到後面時變小變暗
//  - 麻痺（安柏雷擊）：身上一直竄出劈啪的小電弧、偶爾噴電火花
//  - 混亂：頭上一圈慢慢轉的紫色螺旋＋兩個問號繞著飄
//  - 睡著：頭上本來就有飄 z（js/special-guns.js 的 drawSleepMarks），V2 只是不再另外寫「睡著」
//
//  STATUS_FX_VERSION：1＝原本只寫字，2＝狀態特效 V2
//  STATUS_FX_V2.showText：V2 要不要也照舊寫字（false＝只畫特效）
// ============================================================
const STATUS_FX_VERSION = 2;
const STATUS_FX_V2 = { showText: false };

function sv2Hash(i, s) { let h = (i * 374761393 + s * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function sv2Seed(e) { return e.statusSeed || (e.statusSeed = 1 + Math.floor(Math.random() * 9999)); }

// 四角星（星芒）
function sv2Star(ctx, x, y, r, fill, outline) {
  ctx.fillStyle = fill; ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4 - Math.PI / 2, rr = i % 2 ? r * .38 : r;
    i ? ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : ctx.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath();
  if (outline) { ctx.strokeStyle = outline; ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.stroke(); }   // 深色描邊：亮的地板上也看得清楚
  ctx.fill();
}

// 顫抖：頭上星星繞圈。topY＝頭頂（血條）高度
function sv2Stunned(ctx, e, topY, size) {
  const t = performance.now() / 1000, rx = 13 * size, ry = 4 * size, cy = topY - 5;
  const stars = [0, 1, 2].map(i => { const a = t * 4.2 + i * Math.PI * 2 / 3; return { a, x: e.x + Math.cos(a) * rx, y: cy + Math.sin(a) * ry, front: Math.sin(a) }; });
  stars.sort((a, b) => a.front - b.front);   // 後面的先畫
  for (const s of stars) {
    const d = .65 + .35 * (s.front + 1) / 2, r = 4.2 * size * d, tw = .85 + .15 * Math.sin(t * 13 + s.a * 3);
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, r * 2.4);
    g.addColorStop(0, `rgba(255,230,110,${(.45 * d).toFixed(3)})`); g.addColorStop(1, 'rgba(255,210,80,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(s.x, s.y, r * 2.4, 0, 6.283); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = d; sv2Star(ctx, s.x, s.y, r * tw, '#ffe36e', 'rgba(70,45,0,.85)'); sv2Star(ctx, s.x, s.y, r * .45 * tw, '#fffbe8'); ctx.globalAlpha = 1;
  }
}

// 麻痺：身上竄出的小電弧（每秒換 15 次形狀，像劈啪閃）
function sv2Shocked(ctx, e, size) {
  const t = performance.now() / 1000, seed = sv2Seed(e), step = Math.floor(t * 15), H = (e.drawHeight || 33) * Math.max(1, size), W = 11 * Math.max(1, size);
  const by = e.y + 13;
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (let i = 0; i < 3; i++) {
    const r = (k) => sv2Hash(step * 7 + i * 31 + k, seed);
    if (r(0) < .25) continue;   // 偶爾少一條，比較像在閃
    let x = e.x + (r(1) - .5) * W * 2, y = by - r(2) * H * .9;
    const ang = r(3) * Math.PI * 2, len = (8 + r(4) * 8) * size, pts = [[x, y]];
    for (let k = 1; k <= 4; k++) {
      const d = len * k / 4, zig = (k < 4 ? (r(5 + k) - .5) * 7 * size : 0);
      pts.push([x + Math.cos(ang) * d - Math.sin(ang) * zig, y + Math.sin(ang) * d + Math.cos(ang) * zig]);
    }
    const path = () => { ctx.beginPath(); pts.forEach(([px, py], j) => j ? ctx.lineTo(px, py) : ctx.moveTo(px, py)); };
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = 'rgba(20,40,90,.55)'; ctx.lineWidth = 4.5 * size; path(); ctx.stroke();    // 深藍外框：亮的地板上也看得清楚
    ctx.strokeStyle = 'rgba(90,190,255,.9)'; ctx.lineWidth = 2.6 * size; path(); ctx.stroke();   // 藍色電光
    ctx.strokeStyle = '#fffbe0'; ctx.lineWidth = 1.1 * size; path(); ctx.stroke();               // 白黃電芯
    ctx.globalCompositeOperation = 'lighter';
    const [ex, ey] = pts[pts.length - 1], g = ctx.createRadialGradient(ex, ey, 0, ex, ey, 6 * size);
    g.addColorStop(0, 'rgba(255,250,200,.7)'); g.addColorStop(1, 'rgba(120,200,255,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(ex, ey, 6 * size, 0, 6.283); ctx.fill();
  }
  // 身上一層淡淡的藍色電光
  const g = ctx.createRadialGradient(e.x, by - H * .5, 0, e.x, by - H * .5, H * .8);
  g.addColorStop(0, `rgba(140,210,255,${(.14 + .08 * Math.sin(t * 30)).toFixed(3)})`); g.addColorStop(1, 'rgba(140,210,255,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(e.x, by - H * .5, H * .8, 0, 6.283); ctx.fill();
  ctx.restore();
  ctx.globalCompositeOperation = 'source-over';
}

// 混亂：頭上慢慢轉的紫色螺旋＋兩個問號繞著飄
function sv2Confused(ctx, e, topY, size) {
  const t = performance.now() / 1000, cx = e.x, cy = topY - 8 * size;
  ctx.save();
  ctx.translate(cx, cy); ctx.scale(1, .45); ctx.rotate(t * 3);
  ctx.lineCap = 'round'; ctx.beginPath();
  for (let i = 0; i <= 40; i++) { const a = i / 40 * Math.PI * 4, r = (2 + i / 40 * 10) * size; i ? ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r) : ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
  ctx.strokeStyle = 'rgba(40,10,60,.7)'; ctx.lineWidth = 3.6 * size; ctx.stroke();   // 深紫外框
  ctx.strokeStyle = '#d6a0ff'; ctx.lineWidth = 1.8 * size; ctx.stroke();
  ctx.restore();
  ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (let i = 0; i < 2; i++) {
    const a = t * 2.2 + i * Math.PI, x = cx + Math.cos(a) * 14 * size, y = cy - 4 * size + Math.sin(a) * 4 * size + Math.sin(t * 5 + i) * 1.5;
    const d = .65 + .35 * (Math.sin(a) + 1) / 2;
    ctx.font = `900 ${Math.round(11 * size * d)}px sans-serif`;
    ctx.globalAlpha = d; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(30,10,50,.8)'; ctx.strokeText('?', x, y);
    ctx.fillStyle = '#e2b8ff'; ctx.fillText('?', x, y);
  }
  ctx.restore();
}

// render.js 畫怪物時呼叫：回傳 true＝已經畫好（不用再寫字）
function drawStatusV2(ctx, e, barY, size = 1) {
  const s = Math.max(.8, Math.min(1.6, size));
  if (e.stunT > 0 && e.behavior !== 'burrow') {
    if (e.shockT > 0) sv2Shocked(ctx, e, size);
    else if (!(e.sleepT > 0) && !(e.dazeT > 0)) sv2Stunned(ctx, e, barY, s);   // 睡著、閃光彈暈眩本來就有自己的 z／星星
  }
  if (e.confuseT > 0) sv2Confused(ctx, e, barY - (e.stunT > 0 && !(e.shockT > 0) ? 10 : 0), s);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  return !STATUS_FX_V2.showText;
}
