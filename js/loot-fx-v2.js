// ============================================================
//  撿東西／挖礦／核心碎掉 V2：參考 pixelfx（MIT，github.com/patch-gg/pixelfx）的 crystal-shard、gem-spin、collect-burst、loot-beam、key-glint，
//  用遊戲原本的平滑風格畫。原本的特效全部照舊，V2 再疊上：
//  - 礦物碎掉：一片片紫色水晶碎片（有亮面、會翻轉）往外噴、落地彈一下就淡掉，加上一閃一閃的小星光、中間一閃
//  - 地上的異質碎片：每隔一下一道白光從結晶上掃過，旁邊偶爾冒出往上飄的小光點
//  - 撿起碎片：在碎片的位置「啪」地炸開一圈小光點，再有幾顆光點飛向撿的人（目前關掉：LOOT_FX_V2.collect）
//  - 核心碎掉：更多水晶碎片、貼地的紫色衝擊環、一道光柱從核心往上衝再收掉
//  - 地上的異質鑰匙／碎片：腳下一道淡淡的光柱（找得到掉在哪），旁邊星光閃
//
//  LOOT_FX_VERSION：1＝原本畫法（只有原本那套），2＝V2（原本那套＋上面這些）
// ============================================================
const LOOT_FX_VERSION = 2;
const LOOT_FX_V2 = {
  oreShards: 10,     // 礦物碎掉時噴出幾片水晶碎片（純裝飾，不能撿）
  coreShards: 16,    // 核心碎掉時噴出幾片
  shardGlint: false, // 地上的碎片：掃過的白光、往上飄的小光點（false＝不要，使用者 2026-11-05 決定拿掉）
  glintEvery: 2.2,   // 地上的碎片每隔幾秒閃一次白光
  collect: false,    // 撿起碎片時的光點效果（false＝不要，照原本只跳 +數字）
};
const LV2_COLS = [['#7a3fc0', '#c79bff'], ['#5b2e8c', '#b07cff'], ['#9a5ae0', '#e2c4ff']];   // [本體, 亮面]
const lv2r = (a, b) => a + Math.random() * (b - a);
const lootV2On = () => typeof LOOT_FX_VERSION !== 'undefined' && LOOT_FX_VERSION === 2;

function lv2List() { return G.lootV2 || (G.lootV2 = { frags: [], stars: [], flashes: [], beams: [], rings: [], homing: [] }); }
// 水晶碎片＋星光＋一閃（礦物、核心共用）
function lootV2Shatter(x, y, n, big = 1) {
  const L = lv2List();
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, hs = lv2r(50, 150) * big, sz = lv2r(3, 6) * Math.sqrt(big), pts = [];
    const k = 3 + Math.floor(Math.random() * 2);   // 三角形或四邊形的尖碎片
    for (let j = 0; j < k; j++) { const t = j / k * Math.PI * 2 + lv2r(-.3, .3); pts.push([Math.cos(t) * sz * lv2r(.5, 1.3), Math.sin(t) * sz * lv2r(.5, 1.3)]); }
    L.frags.push({ x, y: y + 6, z: 6, vx: Math.cos(a) * hs, vy: Math.sin(a) * hs * .5, vz: lv2r(140, 260) * big, rot: Math.random() * 6.28, spin: lv2r(-14, 14), pts, col: LV2_COLS[Math.floor(Math.random() * 3)], t: 0, life: lv2r(.8, 1.3), bounced: false });
  }
  for (let i = 0; i < Math.round(n * .8); i++) L.stars.push({ x: x + lv2r(-20, 20) * big, y: y + lv2r(-24, 8) * big, vy: -lv2r(10, 30), t: -lv2r(0, .25), life: lv2r(.4, .8), r: lv2r(2, 3.5) });
  L.flashes.push({ x, y, r: 26 * big, t: 0, life: .16 });
}
function lootV2OreBreak(x, y) { lootV2Shatter(x, y, LOOT_FX_V2.oreShards); }
function lootV2CoreBreak(x, y, foot) {   // 核心：更多碎片、貼地衝擊環、往上衝的光柱
  lootV2Shatter(x, y, LOOT_FX_V2.coreShards, 1.4);
  const L = lv2List();
  L.rings.push({ x, y: foot, r: 120, t: 0, life: .6 });
  L.beams.push({ x, y: foot, h: 170, w: 34, t: 0, life: .75, col: [200, 140, 255] });
}
// 撿起：原地一圈小光點，再幾顆飛向撿的人
function lootV2Collect(x, y, who) {
  if (!LOOT_FX_V2.collect) return;   // 使用者決定不要撿起的效果
  const L = lv2List();
  for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; L.stars.push({ x, y, vx: Math.cos(a) * 70, vy: Math.sin(a) * 40, t: 0, life: .35, r: 2.2, burst: true }); }
  L.rings.push({ x, y: y + 4, r: 18, t: 0, life: .3 });
  if (who) for (let i = 0; i < 5; i++) L.homing.push({ x: x + lv2r(-6, 6), y: y + lv2r(-6, 6), who, t: -i * .04, life: .45 });
}

function updateLootV2(dt) {
  if (!G.lootV2) return;
  const L = G.lootV2;
  for (const f of L.frags) {
    f.t += dt; f.rot += f.spin * dt;
    if (f.z > 0 || f.vz > 0) { f.vz -= 700 * dt; f.z += f.vz * dt; f.x += f.vx * dt; f.y += f.vy * dt; if (f.z <= 0) { f.z = 0; if (!f.bounced && f.vz < -60) { f.vz *= -.3; f.vx *= .5; f.vy *= .5; f.bounced = true; } else { f.vz = 0; f.spin *= .2; } } }
  }
  L.frags = L.frags.filter(f => f.t < f.life);
  for (const s of L.stars) { s.t += dt; if (s.t > 0) { if (s.vx) { s.x += s.vx * dt; s.vx *= Math.pow(.02, dt); } s.y += s.vy * dt; if (s.burst) s.vy *= Math.pow(.02, dt); } }
  L.stars = L.stars.filter(s => s.t < s.life);
  for (const h of L.homing) { h.t += dt; if (h.t > 0 && h.who) { const k = Math.min(1, dt * 9); h.x += (h.who.x - h.x) * k; h.y += (h.who.y - 30 - h.y) * k; } }
  L.homing = L.homing.filter(h => h.t < h.life);
  for (const q of [L.flashes, L.beams, L.rings]) for (const o of q) o.t += dt;
  L.flashes = L.flashes.filter(o => o.t < o.life); L.beams = L.beams.filter(o => o.t < o.life); L.rings = L.rings.filter(o => o.t < o.life);
}

function lv2Star(ctx, x, y, r, a, col = '255,240,255') {   // 小星光（十字＋柔光）
  if (a <= .01) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r * 2.4); g.addColorStop(0, `rgba(210,160,255,${(.5 * a).toFixed(3)})`); g.addColorStop(1, 'rgba(210,160,255,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 2.4, 0, 6.283); ctx.fill();
  ctx.fillStyle = `rgba(${col},${a.toFixed(3)})`; ctx.beginPath();
  for (let i = 0; i < 8; i++) { const an = i * Math.PI / 4 - Math.PI / 2, rr = i % 2 ? r * .25 : r; i ? ctx.lineTo(x + Math.cos(an) * rr, y + Math.sin(an) * rr) : ctx.moveTo(x + Math.cos(an) * rr, y + Math.sin(an) * rr); }
  ctx.closePath(); ctx.fill();
}
function drawLootV2(ctx) {   // 世界層
  if (!G.lootV2 || !lootV2On()) return;
  const L = G.lootV2;
  ctx.save();
  for (const r of L.rings) {   // 貼地的紫色衝擊環
    const q = r.t / r.life, rr = 6 + (r.r - 6) * (1 - (1 - q) * (1 - q));
    ctx.save(); ctx.translate(r.x, r.y); ctx.scale(1, .42);
    ctx.globalAlpha = (1 - q) * .35; ctx.strokeStyle = '#1a0828'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 0, rr, 0, 6.283); ctx.stroke();
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = (1 - q) * .85; ctx.strokeStyle = '#d69bff'; ctx.lineWidth = 2.5 * (1 - q * .6); ctx.beginPath(); ctx.arc(0, 0, rr, 0, 6.283); ctx.stroke();
    ctx.restore();
  }
  for (const f of L.frags) {   // 水晶碎片：影子＋本體＋亮面
    const a = Math.min(1, (f.life - f.t) / .3);
    ctx.globalAlpha = .25 * a; ctx.fillStyle = '#120a16'; ctx.beginPath(); ctx.ellipse(f.x, f.y + 1, 3, 1.2, 0, 0, 6.283); ctx.fill();
    ctx.save(); ctx.translate(f.x, f.y - f.z); ctx.rotate(f.rot); ctx.globalAlpha = a;
    ctx.beginPath(); f.pts.forEach(([px, py], i) => i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)); ctx.closePath();
    ctx.fillStyle = f.col[0]; ctx.fill(); ctx.strokeStyle = '#1a0828'; ctx.lineWidth = .8; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(f.pts[0][0], f.pts[0][1]); ctx.lineTo(f.pts[1][0], f.pts[1][1]); ctx.lineTo(0, 0); ctx.closePath(); ctx.fillStyle = f.col[1]; ctx.fill();   // 亮面
    ctx.restore();
  }
  ctx.globalCompositeOperation = 'lighter';
  for (const b of L.beams) {   // 往上衝的光柱：先長高，再變細收掉
    const q = b.t / b.life, grow = Math.min(1, q / .25), thin = q < .4 ? 1 : 1 - (q - .4) / .6, h = b.h * grow, w = b.w * thin;
    const g = ctx.createLinearGradient(b.x, b.y, b.x, b.y - h); g.addColorStop(0, `rgba(${b.col},${(.55 * thin).toFixed(3)})`); g.addColorStop(1, `rgba(${b.col},0)`);
    ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(b.x - w / 2, b.y); ctx.lineTo(b.x - w * .2, b.y - h); ctx.lineTo(b.x + w * .2, b.y - h); ctx.lineTo(b.x + w / 2, b.y); ctx.closePath(); ctx.fill();
    const c = ctx.createLinearGradient(b.x, b.y, b.x, b.y - h); c.addColorStop(0, `rgba(255,245,255,${(.7 * thin).toFixed(3)})`); c.addColorStop(1, 'rgba(255,245,255,0)');
    ctx.fillStyle = c; ctx.fillRect(b.x - w * .08, b.y - h, w * .16, h);
  }
  for (const fl of L.flashes) { const q = 1 - fl.t / fl.life, g = ctx.createRadialGradient(fl.x, fl.y, 0, fl.x, fl.y, fl.r); g.addColorStop(0, `rgba(255,240,255,${q.toFixed(3)})`); g.addColorStop(1, 'rgba(210,150,255,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(fl.x, fl.y, fl.r, 0, 6.283); ctx.fill(); }
  for (const s of L.stars) { if (s.t < 0) continue; const q = s.t / s.life; lv2Star(ctx, s.x, s.y, s.r * (s.burst ? 1 - q * .5 : 1), Math.sin(q * Math.PI)); }
  for (const h of L.homing) { if (h.t < 0) continue; lv2Star(ctx, h.x, h.y, 2, 1 - h.t / h.life); }
  ctx.restore();
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
}
// 地上的異質碎片（drawOreShards 每顆會呼叫）：定時掃過的白光、偶爾往上飄的小光點
function lootV2ShardGlint(ctx, s, x, y) {
  if (!lootV2On() || s.z > 0 || !LOOT_FX_V2.shardGlint) return;
  const now = performance.now() / 1000, per = LOOT_FX_V2.glintEvery, k = ((now + s.spin * 3) % per) / per;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  if (k < .22) {   // 白光從上往下掃過結晶
    const q = k / .22, gy = y - 7 + q * 13;
    ctx.save(); ctx.beginPath(); ctx.moveTo(x, y - 7); ctx.lineTo(x + 4, y - 1); ctx.lineTo(x, y + 6); ctx.lineTo(x - 4, y - 1); ctx.closePath(); ctx.clip();
    const g = ctx.createLinearGradient(x - 5, gy - 3, x + 5, gy + 3); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, `rgba(255,255,255,${(.9 * Math.sin(q * Math.PI)).toFixed(3)})`); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(x - 6, y - 8, 12, 16); ctx.restore();
    if (q > .4 && q < .7) lv2Star(ctx, x + 2, y - 5, 3.2 * Math.sin((q - .4) / .3 * Math.PI), 1);   // 掃到頂端時閃一下
  }
  const mk = ((now * .8 + s.spin) % 1.6) / 1.6;   // 往上飄的小光點
  if (mk < .6) { const q = mk / .6; ctx.globalAlpha = Math.sin(q * Math.PI) * .8; ctx.fillStyle = '#e8d2ff'; ctx.beginPath(); ctx.arc(x + Math.sin(s.spin * 5) * 6, y - 4 - q * 16, 1, 0, 6.283); ctx.fill(); }
  ctx.restore();
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
}
// 地上的異質鑰匙／精神碎片（drawCoreKeyDrops 之前呼叫，畫在黑幕上面）：腳下淡淡的光柱＋星光
function drawLootV2KeyBeams(ctx) {
  if (!lootV2On()) return;
  const list = G && G.coreKeyDrops; if (!list || !list.length) return;
  const now = performance.now() / 1000;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (const d of list) {
    const pulse = .75 + .25 * Math.sin(now * 3 + (d.spin || 0)), h = 60, w = 18, x = d.x, y = d.y;
    const g = ctx.createLinearGradient(x, y, x, y - h); g.addColorStop(0, `rgba(214,155,255,${(.35 * pulse).toFixed(3)})`); g.addColorStop(1, 'rgba(214,155,255,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - w / 2, y); ctx.lineTo(x - w * .25, y - h); ctx.lineTo(x + w * .25, y - h); ctx.lineTo(x + w / 2, y); ctx.closePath(); ctx.fill();
    for (let i = 0; i < 3; i++) { const q = ((now * .6 + i / 3 + (d.spin || 0)) % 1); lv2Star(ctx, x + Math.sin(i * 2.1 + now) * 8, y - 6 - q * 40, 2.2, Math.sin(q * Math.PI)); }
  }
  ctx.restore();
  ctx.globalCompositeOperation = 'source-over';
}
