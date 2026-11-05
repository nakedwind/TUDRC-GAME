// ============================================================
//  水柱特效 V2（魚頭君）：參考 pixelfx（MIT，github.com/patch-gg/pixelfx）的 water-jet、splash、rain-splash、ripples，
//  用遊戲原本的平滑風格畫。原本的水柱（嘴巴尖、前端粗、白色反光）、白邊水花、地上的水灘都照舊，V2 再疊上：
//  - 水柱：表面有白色細線順著水流往前跑（看得出在流動）、兩側一直甩出小水珠（有重力、落地變小漣漪）
//  - 打到的地方：水珠往四周拋出去再落下，落地的地方冒一圈圈小漣漪；積水的地方也一圈圈擴散
//
//  WATER_FX_VERSION：1＝原本畫法（只有原本那套），2＝水柱 V2（原本那套＋上面這些）
// ============================================================
const WATER_FX_VERSION = 2;
const WATER_FX_V2 = {
  sideDrops: 26,    // 水柱噴的時候，每秒從兩側甩出幾顆小水珠
  splashDrops: 34,  // 打到東西的時候，每秒往四周拋出幾顆水珠
  flowSpeed: 140,   // 水柱表面白線往前跑的速度（像素／秒）
};
const wv2R = (a, b) => a + Math.random() * (b - a);

function updateWaterV2(dt) {
  if (typeof WATER_FX_VERSION === 'undefined' || WATER_FX_VERSION !== 2) return;
  const W = G.waterV2 || (G.waterV2 = { drops: [], ripples: [], acc: 0, sacc: 0 }), C = WATER_FX_V2;
  const drops = G.fishDrops || [];
  if (drops.length) for (W.acc += C.sideDrops * dt; W.acc >= 1; W.acc--) {   // 水柱兩側甩出小水珠
    const d = drops[Math.floor(Math.random() * drops.length)], side = Math.random() < .5 ? 1 : -1, sp = wv2R(20, 60);
    W.drops.push({ x: d.x, y: d.y, z: d.z, vx: d.ux * wv2R(60, 140) - d.uy * side * sp, vy: d.uy * wv2R(60, 140) * .6 + d.ux * side * sp * .5, vz: wv2R(20, 90), r: wv2R(1, 1.9) });
  }
  const live = (G.fishSplashes || []).filter(q => q.t > 0);
  if (live.length) for (W.sacc += C.splashDrops * live.length * dt; W.sacc >= 1; W.sacc--) {   // 打到的地方：水珠拋出去
    const q = live[Math.floor(Math.random() * live.length)], a = Math.random() * Math.PI * 2, hs = wv2R(30, 110);
    W.drops.push({ x: q.x, y: q.y, z: Math.max(4, q.z * .5), vx: Math.cos(a) * hs - (q.ux || 0) * 30, vy: Math.sin(a) * hs * .5, vz: wv2R(80, 170), r: wv2R(1.3, 2.4) });
    if (Math.random() < .12) W.ripples.push({ x: q.x, y: q.y + 4, r0: 4, r1: wv2R(14, 22), t: 0, life: .7 });   // 積水的地方一圈圈擴散
  }
  for (let i = W.drops.length - 1; i >= 0; i--) {
    const p = W.drops[i];
    p.vz -= 520 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
    if (p.z <= 0) { W.ripples.push({ x: p.x, y: p.y, r0: 1, r1: wv2R(5, 9), t: 0, life: .45 }); W.drops.splice(i, 1); }   // 落地：一圈小漣漪
  }
  for (const r of W.ripples) r.t += dt;
  W.ripples = W.ripples.filter(r => r.t < r.life);
  if (W.ripples.length > 220) W.ripples.splice(0, W.ripples.length - 220);
}

function drawWaterV2(ctx) {
  if (typeof WATER_FX_VERSION === 'undefined' || WATER_FX_VERSION !== 2) return;
  const W = G.waterV2, C = WATER_FX_V2, now = performance.now() / 1000;
  ctx.save(); ctx.lineCap = 'round';
  // 水柱表面：白色細線順著水流往前跑
  const groups = new Map();
  for (const d of G.fishDrops || []) { if (!groups.has(d.spray)) groups.set(d.spray, []); groups.get(d.spray).push(d); }
  for (const [s, list] of groups) {
    const e = list[0].owner, pts = list.map(d => ({ x: d.x, y: d.y - d.z }));
    if (e && e.fh && e.fh.spray === s && !e.dead && typeof fishMouth === 'function') { const m = fishMouth(e); pts.push({ x: m.x, y: m.y - m.z }); }
    if (pts.length < 3) continue;
    pts.reverse();   // 嘴巴 → 前端，虛線才會往前跑
    ctx.setLineDash([3, 9]); ctx.lineDashOffset = -now * C.flowSpeed;
    ctx.globalAlpha = .75; ctx.strokeStyle = '#eaf6ff'; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y - 1); for (const q of pts) ctx.lineTo(q.x, q.y - 1); ctx.stroke();
    ctx.setLineDash([2, 13]); ctx.lineDashOffset = -now * C.flowSpeed * 1.3 + 5;
    ctx.globalAlpha = .45; ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y + 2); for (const q of pts) ctx.lineTo(q.x, q.y + 2); ctx.stroke();
  }
  ctx.setLineDash([]);
  if (W) {
    // 漣漪：貼地、一圈圈擴散變淡
    for (const r of W.ripples) {
      const q = r.t / r.life, rr = r.r0 + (r.r1 - r.r0) * (1 - (1 - q) * (1 - q));
      ctx.globalAlpha = (1 - q) * .7; ctx.strokeStyle = '#e6f6ff'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(r.x, r.y, rr, rr * .45, 0, 0, 6.283); ctx.stroke();
    }
    // 飛行中的水珠：地上一點影子、藍色水珠、白色亮點
    for (const p of W.drops) {
      ctx.globalAlpha = .18; ctx.fillStyle = '#071015'; ctx.beginPath(); ctx.ellipse(p.x, p.y + 1, p.r, p.r * .4, 0, 0, 6.283); ctx.fill();
      ctx.globalAlpha = .95; ctx.fillStyle = (typeof FISH_HEAD !== 'undefined' && FISH_HEAD.streamColor) || '#6aa8ff';
      ctx.beginPath(); ctx.arc(p.x, p.y - p.z, p.r, 0, 6.283); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(p.x - p.r * .35, p.y - p.z - p.r * .35, Math.max(.5, p.r * .35), 0, 6.283); ctx.fill();
    }
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}
