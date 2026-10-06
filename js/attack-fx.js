/* ===== 攻擊特效 =====
   從 game.js 拆出來的「看得到、聽得到」的攻擊表演：
   - 打擊感：畫面震動、命中頓格、彈出傷害數字
   - 疏導光環、大招蓄力與衝擊波
   - 各能力的命中特效：火焰、雷電、近戰揮砍、腐蝕（含地上焦痕與黑霧）、槍擊
   - 攻擊閃光：槍口火光、火焰、雷擊、腐蝕、核心摧毀會短暫照亮黑暗（LIGHT_FLASH）
   - spawnAttackVisual：依哨兵能力挑選要播哪一種特效＋音效
   只負責「產生特效」；特效每幀的移動在 game.js 的 update()，畫出來在 draw()。
   必須在 game.js 之前載入。
*/
// ---- 打擊感：畫面震動、命中頓格、彈出傷害數字 ----
let shakeAmt = 0, hitstop = 0;
// ---- 攻擊閃光：在黑暗中短暫照亮周圍（只影響畫面，不影響遊戲的「亮處」判定）----
// r：光圈半徑（像素）；life：持續秒數；power：最亮時的亮度 0～1；color：附帶的色光 [紅,綠,藍]
const LIGHT_FLASH = {
  muzzle:    { r: 110, life: .09, power: .75, color: [255, 214, 140] },   // 槍口火光
  flame:     { r: 170, life: .40, power: .85, color: [255, 140, 60] },    // 希奧妮 火焰
  lightning: { r: 300, life: .22, power: 1,   color: [190, 225, 255] },   // 安柏 雷擊（最大、最亮）
  corrosion: { r: 60,  life: .45, power: .23, color: [170, 90, 230] },    // 阿瓦倫 腐蝕（暗紫、微光）
  core:      { r: 420, life: 1.1, power: 1,   color: [220, 160, 255] },   // 異質核心被摧毀
  soothe:    { r: 150, life: .70, power: .55, color: [140, 220, 160] },   // 疏導（顏色跟著施術者）
};
const LIGHT_FLASH_MAX = 14;   // 同時最多幾個閃光（太多會拖慢畫面；超過就擠掉最快熄的）
function addLightFlash(kind, x, y, scale = 1, color) {
  if (!G || typeof LIGHT === 'undefined' || !LIGHT.enabled) return;
  const spec = LIGHT_FLASH[kind];
  if (!spec) return;
  const list = G.lightFlashes || (G.lightFlashes = []);
  if (list.length >= LIGHT_FLASH_MAX) {
    let weakest = 0;
    for (let i = 1; i < list.length; i++) if (list[i].life < list[weakest].life) weakest = i;
    list.splice(weakest, 1);
  }
  list.push({ x, y, r: spec.r * scale, life: spec.life, life0: spec.life, power: spec.power, color: color || spec.color });
}
function updateLightFlashes(dt) {
  if (!G.lightFlashes || !G.lightFlashes.length) return;
  for (const f of G.lightFlashes) f.life -= dt;
  G.lightFlashes = G.lightFlashes.filter(f => f.life > 0);
}

function addShake(a) { shakeAmt = Math.min(16, Math.max(shakeAmt, a)); }
function addHitstop(t) { hitstop = Math.min(0.09, Math.max(hitstop, t)); }
// 傷害數字：短時間內打在同一處（同一隻怪）、同顏色的數字會合併成總和，畫面才不會滿天飛。
// time＝多少秒內的命中算同一串；dist＝距離多近算同一處（像素）
const DMG_MERGE = { time: .35, dist: 26 };
function flashDmg(text, x, y, color, opts) {
  color = color || '#fff';
  const small = !!(opts && opts.small);   // small：燒傷這類持續傷害，用小字、比較淡
  const m = /^-(\d+)$/.exec(text);
  if (m) {
    const n = +m[1];
    for (const f of G.effects) {
      if (!f.dmg || f.crit || f.sum == null || f.small !== small || f.color !== color) continue;
      if (f.life0 - f.life > DMG_MERGE.time) continue;
      if (Math.abs(f.x - x) > DMG_MERGE.dist || Math.abs(f.y0 - y) > DMG_MERGE.dist) continue;
      f.sum += n; f.text = '-' + f.sum;   // 累加，並重新彈一下
      f.x = x; f.y = f.y0 = y; f.life = f.life0;
      return;
    }
    G.effects.push({ dmg: true, text, sum: n, x, y, y0: y, vy: -34, life: .7, life0: .7, color, small });
    return;
  }
  G.effects.push({ dmg: true, text, x, y, vy: -34, life: .7, life0: .7, color, small });
}

// ---- 開槍手感：彈殼、準星命中標記、怪物被吸引的「！」（開槍不震畫面，避免頭暈）----
// hitMarkTime＝命中標記顯示秒數
const GUN_FEEL = { hitMarkTime: .15 };
const ENEMY_ALERT_TIME = .9;   // 怪物頭上「！」顯示秒數
function spawnShellCasing(x, y, angle) {   // 往槍身側後方拋出一顆彈殼
  const side = Math.cos(angle) >= 0 ? -1 : 1;
  const a = angle + Math.PI + side * (.9 + Math.random() * .5), sp = 35 + Math.random() * 30;
  G.effects.push({ shell: true, x, y, z: 8, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * .5, vz: 70 + Math.random() * 40,
    rot: Math.random() * Math.PI, spin: (Math.random() * 2 - 1) * 20, life: 1.3, life0: 1.3 });
}
function markHit(crit) { G.hitMarker = { at: performance.now(), crit: !!crit }; }
function drawHitMarker() {
  const m = G.hitMarker;
  if (!m || !aimClient) return;
  const age = (performance.now() - m.at) / 1000;
  if (age > GUN_FEEL.hitMarkTime) return;
  const { x, y } = clientToWorld(aimClient.x, aimClient.y);
  const p = 1 - age / GUN_FEEL.hitMarkTime, gap = 4 + (1 - p) * 3, len = m.crit ? 8 : 6;
  ctx.save(); ctx.lineCap = 'round'; ctx.globalAlpha = p;
  for (const [w, color] of [[m.crit ? 4.5 : 4, 'rgba(0,0,0,.7)'], [m.crit ? 2.5 : 2, m.crit ? '#ffd84a' : '#ffffff']]) {
    ctx.lineWidth = w; ctx.strokeStyle = color; ctx.beginPath();
    for (const [sx, sy] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
      ctx.moveTo(x + sx * gap, y + sy * gap); ctx.lineTo(x + sx * (gap + len), y + sy * (gap + len));
    }
    ctx.stroke();
  }
  ctx.restore();
}
// 疏導特效：柔和光環＋上升的療癒光點，顏色依施術者（溫特藍／艾德林草綠／克莉思白）
const SOOTHE_COLORS = { winter: [96, 170, 255], eldrin: [128, 222, 112], chris: [238, 246, 255] };

const ULT_CHARGE_COLOR = { theonie: '#ff8a3a', amber: '#aee9ff', avaren: '#b060ff', red: '#bfe0ff', luther: '#ffd0d5' };
function spawnChargeFx(x, y, color) {   // 大招蓄力telegraph：收束的光圈＋漸亮的核心
  G.effects.push({ charge: true, x, y, color, life: ULT_SWING.impact, life0: ULT_SWING.impact });
}
function spawnUltShockwave(x, y, r, color) {   // 近戰大招：大範圍衝擊波（雙圈擴張＋四濺）
  G.effects.push({ ring: true, x, y, r: 10, r2: r, life: .38, life0: .38, color });
  G.effects.push({ ring: true, x, y, r: 5, r2: r * 0.65, life: .26, life0: .26, color });
  for (let i = 0; i < 16; i++) {
    const a = Math.random() * Math.PI * 2, sp = 70 + Math.random() * 130;
    G.effects.push({ particle: true, kind: 'spark', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
      r: 2 + Math.random() * 2.6, life: .2 + Math.random() * .22, life0: .42, color });
  }
}
function spawnSootheEffect(x, y, color, follow) {
  const col = color || SOOTHE_COLORS.winter;
  if (follow) { follow.lastSootheColor = col; follow.lastSootheAt = performance.now(); }   // 記下誰疏導的（暴走恢復時用同色吹散黑霧）
  G.effects.push({ sootheGlow: true, x, y, r0: 10, r1: 52, life: 1.5, life0: 1.5, col, follow, foy: y - (follow ? follow.y : y) });   // 大、久、明顯；可跟隨哨兵
  for (let i = 0; i < 14; i++) {
    const a = -Math.PI / 2 + (Math.random() * 2 - 1) * 1.0, sp = 16 + Math.random() * 30, L = 1.0 + Math.random() * .8;
    G.effects.push({ mote: true, x: x + (Math.random() * 2 - 1) * 18, y: y + (Math.random() * 2 - 1) * 11,
      vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: 2.2 + Math.random() * 2.8, seed: Math.random() * 99, wob: 5 + Math.random() * 7, life: L, life0: L, col });
  }
}
// ---- 疏導表演（嚮導施放疏導＝大招等級的演出）----
// 施術者腳下展開法陣 → 光波擴散到疏導範圍 → 隊友身上的光環與療癒光點（spawnSootheEffect）。
// radius＝光波擴到多遠（像素，0＝不放光波）
function spawnSootheCast(caster, col, radius) {
  if (!caster) return;
  G.effects.push({ sootheSigil: true, follow: caster, col, life: 1.1, life0: 1.1, spin: Math.random() * Math.PI });
  if (radius > 0) G.effects.push({ sootheWave: true, x: caster.x, y: caster.y, r: radius, col, life: .7, life0: .7 });
  addLightFlash('soothe', caster.x, caster.y - 10, 1, col);
}

// 火焰命中特效：程式即時繪製（取代 PNG 序列圖）。畫成一叢會扭動竄升的火舌。
function drawFlameShape(ctx, cx, baseY, h, w, tipSway, color) {   // 尖端向上的水滴狀火舌
  const tipX = cx + tipSway, tipY = baseY - h;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx - w / 2, baseY);
  ctx.quadraticCurveTo(cx - w * 0.62, baseY - h * 0.5, tipX, tipY);   // 左側鼓出→尖端
  ctx.quadraticCurveTo(cx + w * 0.62, baseY - h * 0.5, cx + w / 2, baseY);   // 尖端→右側落下
  ctx.quadraticCurveTo(cx, baseY + h * 0.08, cx - w / 2, baseY);      // 圓底
  ctx.closePath();
  ctx.fill();
}
// 雷電命中特效：從上方劈下的鋸齒閃電（帶分岔）＋青白爆閃＋電火花。
function makeBolt(x0, y0, x1, y1, segs, jit) {
  const pts = [[x0, y0]];
  for (let i = 1; i < segs; i++) {
    const t = i / segs, bx = x0 + (x1 - x0) * t, by = y0 + (y1 - y0) * t, j = jit * (1 - t * 0.6);
    pts.push([bx + (Math.random() * 2 - 1) * j, by + (Math.random() * 2 - 1) * j * 0.4]);
  }
  pts.push([x1, y1]);
  return pts;
}
function spawnLightningBolt(x, y, scale = 1) {
  addLightFlash('lightning', x, y, scale);
  const top = y - (95 + Math.random() * 30) * scale;
  const main = makeBolt(x + (Math.random() * 2 - 1) * 10 * scale, top, x, y, 8, 16 * scale);
  const branches = [];
  for (let b = 0; b < 2 + (scale > 1.5 ? 2 : 0); b++) {   // 大招多幾條分岔
    const i = 2 + Math.floor(Math.random() * (main.length - 4));
    const [bx, by] = main[i];
    branches.push(makeBolt(bx, by, bx + (Math.random() * 2 - 1) * 34 * scale, by + (10 + Math.random() * 22) * scale, 4, 12 * scale));
  }
  G.effects.push({ bolt: true, x, y, main, branches, lw: scale, life: .26, life0: .26 });
  G.effects.push({ ring: true, x, y, r: 5, r2: 30 * scale, life: .2, life0: .2, color: '#bfefff' });   // 命中閃光環
  for (let i = 0; i < Math.round(7 * scale); i++) {                                            // 電火花四濺
    const a = Math.random() * Math.PI * 2, sp = (40 + Math.random() * 80) * scale;
    G.effects.push({ particle: true, kind: 'lightning', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 10,
      r: (2 + Math.random() * 3) * scale, life: .2 + Math.random() * .18, life0: .38, color: '#cbf2ff' });
  }
}
// 近戰命中特效：揮砍弧光（月牙斬）＋迸擊火花。
const SLASH_PALETTES = {
  blue:   { after: '#3f8bff', outer: '#4a9cff', glow: '#6ab4ff', core: '#eef8ff', edge: '#ffffff' },
  purple: { after: '#8a3fff', outer: '#a860ff', glow: '#c77bff', core: '#f1e2ff', edge: '#ffffff' },
};
function spawnMeleeSlash(x, y, angle, heavy, pal) {
  G.effects.push({ slash: true, x, y, angle, heavy, pal: SLASH_PALETTES[pal] || SLASH_PALETTES.blue, life: heavy ? .26 : .2, life0: heavy ? .26 : .2 });
}
function spawnMeleeImpact(x, y, heavy) {
  G.effects.push({ ring: true, x, y, r: 5, r2: heavy ? 34 : 26, life: .2, life0: .2, color: '#dceaff' });
  for (let i = 0; i < (heavy ? 12 : 8); i++) {
    const a = Math.random() * Math.PI * 2, sp = 90 + Math.random() * 110;
    G.effects.push({ particle: true, kind: 'spark', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
      r: 2 + Math.random() * 2.6, life: .18 + Math.random() * .14, life0: .32, color: '#eaf4ff' });
  }
}
// 一團扭曲、濃稠的紫黑霧：由多個不規則裂片組成，會很緩慢地churn扭動；大片、停留久。
function pushCorrosionMist(x, y, vx, vy) {
  const nl = 4 + Math.floor(Math.random() * 4), lobes = [];   // 4~7 片，更不規則
  for (let j = 0; j < nl; j++) lobes.push({
    ox: (Math.random() * 2 - 1) * 16, oy: (Math.random() * 2 - 1) * 16,
    rr: 8 + Math.random() * 9, ph: Math.random() * 6.28, wob: 2 + Math.random() * 4,
    ang: Math.random() * 6.28, sx: 1.1 + Math.random() * 1.2, sy: 0.5 + Math.random() * 0.4   // 拉長的捲鬚
  });
  const L = 1.6 + Math.random() * 1.1;   // 停留更久
  G.effects.push({ cmist: true, x, y, vx, vy, r0: 0.8, rMax: 1.7, lobes, spin: (Math.random() * 2 - 1) * 0.3, life: L, life0: L });
}
// 地上焦痕：腐蝕（阿瓦倫）、火焰（希奧妮）、雷電（安柏）三種樣式，只是畫面效果。
// 腐蝕焦痕在扣血期間透出紫光；火焰／雷電焦痕剛落下時有一小段餘熱發光，之後只剩焦黑，時間到慢慢淡掉。
// life：留在地上幾秒；fade：最後幾秒淡出；size：外觀大小倍率（不影響扣血範圍）
// cracks：主裂紋條數；rays：雷擊放射狀焦紋條數；heat：剛落下時餘熱發光的秒數
// halo／c0～c2／crack／fleck：外圈、主體（中心→邊緣）、裂紋、碎屑顏色；glow：發光顏色
const SCORCH = {
  max: 80,   // 地上同時最多幾個焦痕（超過就先移除最舊的）
  styles: {
    corrosion: { life: 14, fade: 3, size: .8, cracks: 7, halo: '#2b1236',
                 c0: [10, 4, 14], c1: [24, 10, 32], c2: [58, 26, 74], crack: '#07020a', fleck: '#1a0b22', glow: [155, 79, 208] },
    flame:     { life: 5, fade: 1.5, size: 1, cracks: 3, heat: 1.2, halo: '#3a2619',
                 c0: [8, 6, 5], c1: [24, 15, 10], c2: [62, 38, 22], crack: '#050302', fleck: '#18100b', glow: [255, 122, 42] },
    lightning: { life: 5, fade: 1.5, size: 1, cracks: 0, rays: 8, heat: .45, halo: '#26262c',
                 c0: [6, 6, 8], c1: [18, 18, 22], c2: [50, 48, 54], crack: '#030304', fleck: '#121214', glow: [170, 225, 255] },
  },
};
function addScorchMark(x, y, R0, pool, styleId = 'corrosion') {
  const st = SCORCH.styles[styleId] || SCORCH.styles.corrosion;
  const R = R0 * st.size;
  const flecks = [], cracks = [];
  // 雷擊焦痕中心比較小、放射紋比較長；其他是一整片不規則焦黑
  const body = st.rays ? .55 : 1;
  const radii = scorchShape(R * body), haloRadii = radii.map(r => r * (1.08 + Math.random() * .28));
  // 主體旁邊噴濺出去的小焦斑
  const splats = [];
  for (let i = 0, ns = 2 + Math.floor(Math.random() * 3); i < ns; i++) {
    const a = Math.random() * Math.PI * 2, d = R * body * (1.05 + Math.random() * .45);
    splats.push({ x: Math.cos(a) * d, y: Math.sin(a) * d, radii: scorchShape(R * body * (.16 + Math.random() * .16), 10) });
  }
  for (let i = 0; i < 8; i++) {
    const a = Math.random() * Math.PI * 2, d = R * (.95 + Math.random() * .5);
    flecks.push({ x: Math.cos(a) * d, y: Math.sin(a) * d, r: .7 + Math.random() * 1.5 });
  }
  // 由中心往外的主裂紋（每條 3～4 折，平均分散在各方向），部分會在中段再岔出細裂紋
  const a0 = Math.random() * Math.PI * 2;
  for (let i = 0; i < st.cracks; i++) {
    const pts = [[0, 0]];
    let a = a0 + i / st.cracks * Math.PI * 2 + (Math.random() * 2 - 1) * .35, d = 0;
    const segs = 3 + Math.floor(Math.random() * 2);
    for (let k = 0; k < segs; k++) { d += R * (.16 + Math.random() * .14); a += (Math.random() * 2 - 1) * .5; pts.push([Math.cos(a) * d, Math.sin(a) * d]); }
    cracks.push({ pts, w: 1.3 });
    if (Math.random() < .6) {   // 細岔裂
      const [bx, by] = pts[1 + Math.floor(Math.random() * (pts.length - 2))];
      let ba = a + (Math.random() < .5 ? -1 : 1) * (.6 + Math.random() * .5), bd = 0;
      const branch = [[bx, by]];
      for (let k = 0; k < 2; k++) { bd += R * (.1 + Math.random() * .1); ba += (Math.random() * 2 - 1) * .4; branch.push([bx + Math.cos(ba) * bd, by + Math.sin(ba) * bd]); }
      cracks.push({ pts: branch, w: .8 });
    }
  }
  // 雷擊：從中心向外炸開的鋸齒狀放射焦紋，長短不一
  for (let i = 0; i < (st.rays || 0); i++) {
    const pts = [[0, 0]];
    const a = a0 + i / st.rays * Math.PI * 2 + (Math.random() * 2 - 1) * .3;
    const len = R * (.8 + Math.random() * .6);
    for (let k = 1; k <= 4; k++) {
      const d = len * k / 4, zig = (k < 4 ? (Math.random() * 2 - 1) * R * .12 : 0);
      pts.push([Math.cos(a) * d - Math.sin(a) * zig, Math.sin(a) * d + Math.cos(a) * zig]);
    }
    cracks.push({ pts, w: 1.6 - Math.random() * .6 });
  }
  G.scorchMarks = G.scorchMarks || [];
  G.scorchMarks.push({ x, y, R, radii, haloRadii, splats, flecks, cracks, st, t: st.life, pool, ph: Math.random() * 6.28,
    rot: Math.random() * Math.PI, stretch: 1 + Math.random() * .45 });   // 隨機轉向、拉長，不會每個都一樣圓
  if (G.scorchMarks.length > SCORCH.max) G.scorchMarks.shift();
}
// 不規則外形：大塊凸起＋細碎鋸齒＋隨機噴濺尖角與缺口（n＝外形點數）
function scorchShape(R, n = 24) {
  const k1 = 2 + Math.floor(Math.random() * 2), p1 = Math.random() * 6.28;   // 2～3 個大塊凸起
  const k2 = 5 + Math.floor(Math.random() * 3), p2 = Math.random() * 6.28;   // 5～7 個中等起伏
  const radii = [];
  for (let i = 0; i < n; i++) {
    const t = i / n * Math.PI * 2;
    radii.push(R * (.8 + .2 * Math.sin(k1 * t + p1) + .1 * Math.sin(k2 * t + p2) + (Math.random() - .5) * .3));
  }
  for (let s = 0, ns = 2 + Math.floor(Math.random() * 2); s < ns; s++) radii[Math.floor(Math.random() * n)] *= 1.3 + Math.random() * .35;   // 往外噴的尖角
  for (let s = 0, ns = 1 + Math.floor(Math.random() * 2); s < ns; s++) radii[Math.floor(Math.random() * n)] *= .55 + Math.random() * .15;   // 往內缺的缺口
  return radii.map(r => Math.max(R * .35, r));
}
function scorchPath(ctx, radii, k = 1) {   // 用各點中點做二次曲線，畫出圓滑但不規則的外形
  const n = radii.length, pt = i => {
    const a = (i % n) / n * Math.PI * 2, r = radii[i % n] * k;
    return [Math.cos(a) * r, Math.sin(a) * r];
  };
  ctx.beginPath();
  let [px, py] = pt(0), [qx, qy] = pt(1);
  ctx.moveTo((px + qx) / 2, (py + qy) / 2);
  for (let i = 1; i <= n; i++) {
    [px, py] = pt(i); [qx, qy] = pt(i + 1);
    ctx.quadraticCurveTo(px, py, (px + qx) / 2, (py + qy) / 2);
  }
  ctx.closePath();
}
// 焦痕目前的發光強度（0～1）：腐蝕看扣血區域是否還在；火焰／雷電看剛落下的餘熱
function scorchGlow(m) {
  if (m.pool) return m.pool.t > 0 ? Math.min(1, m.pool.t) * (.65 + .35 * Math.sin(performance.now() / 260 + m.ph)) : 0;
  const age = m.st.life - m.t;
  return m.st.heat ? Math.max(0, 1 - age / m.st.heat) : 0;
}
function drawScorchMarks(ctx) {
  if (!G.scorchMarks) return;
  const rgba = (c, al) => `rgba(${c[0]},${c[1]},${c[2]},${al.toFixed(3)})`;
  for (const m of G.scorchMarks) {
    const st = m.st;
    const a = Math.min(1, (st.life - m.t) / .25, m.t / st.fade);   // 0.25 秒浮現、最後幾秒淡出
    if (a <= 0) continue;
    ctx.save(); ctx.translate(m.x, m.y); ctx.scale(1, .6);   // 壓扁貼地
    ctx.rotate(m.rot || 0); ctx.scale(m.stretch || 1, 1 / Math.sqrt(m.stretch || 1));   // 隨機轉向＋拉長
    // 外圈燒灼暈（有自己的不規則外形）＋旁邊噴濺的小焦斑
    ctx.globalAlpha = .34 * a; ctx.fillStyle = st.halo;
    scorchPath(ctx, m.haloRadii || m.radii.map(r => r * 1.18)); ctx.fill();
    if (m.splats) {
      ctx.globalAlpha = .7 * a; ctx.fillStyle = rgba(st.c1, 1);
      for (const s of m.splats) { ctx.save(); ctx.translate(s.x, s.y); scorchPath(ctx, s.radii); ctx.fill(); ctx.restore(); }
    }
    // 主體：中心最深 → 邊緣較淡
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, m.R * 1.1);
    g.addColorStop(0, rgba(st.c0, .9 * a));
    g.addColorStop(.62, rgba(st.c1, .8 * a));
    g.addColorStop(1, rgba(st.c2, .55 * a));
    ctx.globalAlpha = 1; ctx.fillStyle = g;
    scorchPath(ctx, m.radii); ctx.fill();
    // 發光：腐蝕中透紫光（提醒別踩）、火焰餘燼橘光、雷擊殘電青白光
    const glow = scorchGlow(m);
    if (glow > 0) {
      const pg = ctx.createRadialGradient(0, 0, 0, 0, 0, m.R * .85);
      pg.addColorStop(0, rgba(st.glow, (m.pool ? .3 : .55) * glow));
      pg.addColorStop(1, rgba(st.glow, 0));
      ctx.fillStyle = pg; scorchPath(ctx, m.radii, .85); ctx.fill();
    }
    // 裂紋：發光期間裂縫透出光，之後只剩深色裂痕
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const pass of glow > 0 ? ['glow', 'line'] : ['line']) {
      ctx.globalAlpha = (pass === 'glow' ? .55 * glow : .75) * a;
      ctx.strokeStyle = pass === 'glow' ? rgba(st.glow, 1) : st.crack;
      for (const c of m.cracks) {
        ctx.lineWidth = pass === 'glow' ? c.w + 2 : c.w;
        ctx.beginPath(); ctx.moveTo(c.pts[0][0], c.pts[0][1]);
        for (let i = 1; i < c.pts.length; i++) ctx.lineTo(c.pts[i][0], c.pts[i][1]);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = .75 * a; ctx.fillStyle = st.fleck;
    for (const f of m.flecks) { ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  }
}
// 黑霧：從焦痕緩緩往上飄、邊飄邊左右搖擺並擴散變淡（像燒焦冒出的黑煙）
function pushBlackSmoke(x, y, big = false) {
  const L = 1.7 + Math.random() * 1;
  G.effects.push({ smoke: true, x, y, vx: (Math.random() * 2 - 1) * 6, vy: -(24 + Math.random() * 18),
    r0: 3 + Math.random() * 3, r1: (13 + Math.random() * 9) * (big ? 1.4 : 1),
    ph: Math.random() * 6.28, shade: Math.random(), life: L, life0: L });
}
// 腐蝕命中特效：濃稠扭曲的紫黑霧＋暗紫液滴，並在地上留下 6 秒的腐蝕焦痕（碰到會扣血），焦痕上持續冒黑霧。
function spawnCorrosionSplash(x, y, splash, dmg, scale = 1) {
  addLightFlash('corrosion', x, y, scale);
  const R = (splash > 0 ? Math.min(46 * scale, splash * CELL * 0.9) : 22) * (scale > 1 ? 1.1 : 1);
  // 地上腐蝕痕跡（存活 5 秒，範圍內怪物持續扣血）
  const blobs = [];
  for (let i = 0; i < 4; i++) blobs.push({ dx: (Math.random() * 2 - 1) * R * 0.5, dy: (Math.random() * 2 - 1) * R * 0.35, rr: R * (0.55 + Math.random() * 0.5) });
  const pool = { x, y, r: R, t: 6, t0: 6, dps: Math.max(2, dmg * 0.5), blobs, fizz: 0 };
  (G.acidPools = G.acidPools || []).push(pool);
  addScorchMark(x, y, R, pool);   // 地上焦黑燒痕
  for (let i = 0; i < Math.round(4 * scale); i++) pushBlackSmoke(x + (Math.random() * 2 - 1) * R * .5, y + (Math.random() * 2 - 1) * R * .25, true);
  // 命中瞬間噴出的紫黑霧（很慢、黏稠、大片）
  for (let i = 0; i < Math.round(9 * scale); i++) {
    const a = -Math.PI / 2 + (Math.random() * 2 - 1) * 1.6, sp = 6 + Math.random() * 14;
    pushCorrosionMist(x + (Math.random() * 2 - 1) * 8, y + (Math.random() * 2 - 1) * 5, Math.cos(a) * sp, Math.sin(a) * sp);
  }
  // 幾滴暗紫液滴
  for (let i = 0; i < 6; i++) {
    const a = -Math.PI / 2 + (Math.random() * 2 - 1) * 1.2, sp = 40 + Math.random() * 70, L = .35 + Math.random() * .3;
    G.effects.push({ cdrop: true, x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
      r: 1.6 + Math.random() * 2.4, life: L, life0: L, col: Math.random() < .5 ? '#55384f' : '#2e1f33' });
  }
}
function spawnFlameBurst(x, y, scale = 1) {
  addLightFlash('flame', x, y, scale);
  const L = 0.5, n = scale > 1.5 ? 6 : 4, tongues = [];   // 大招火舌更多
  for (let i = 0; i < n; i++) {
    const center = Math.pow(1 - Math.abs(i - (n - 1) / 2) / ((n - 1) / 2), 1.4);   // 中間主導
    tongues.push({
      dx: ((i - (n - 1) / 2) * 8 + (Math.random() * 2 - 1) * 2.5) * scale,
      h: (32 + center * 44 + Math.random() * 8) * scale,   // 中間明顯高、兩側矮
      w: (16 + center * 14 + Math.random() * 4) * scale,
      phase: Math.random() * Math.PI * 2,
      freq: 11 + Math.random() * 6,
      lean: (Math.random() * 2 - 1) * 7,
    });
  }
  G.effects.push({ flame: true, x, y, tongues, life: L, life0: L });
  G.effects.push({ fglow: true, x, y: y - 14 * scale, r0: 12 * scale, r1: 46 * scale, life: .3, life0: .3 });   // 底層爆閃光暈
  for (let i = 0; i < Math.round(8 * scale); i++) {                                     // 飛散火星
    const a = -Math.PI / 2 + (Math.random() * 2 - 1) * 1.0, sp = (60 + Math.random() * 85) * scale;
    const sl = .3 + Math.random() * .3;
    G.effects.push({ ember: true, spark: true, x, y: y - 6, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
      r: (1.3 + Math.random() * 1.5) * scale, wob: 4 + Math.random() * 6, seed: Math.random() * 99, life: sl, life0: sl });
  }
}

function spawnSentryShotVisual(t, sw, spec) {
  const muzzle = gunMuzzleAt(t, sw.angle);
  addLightFlash('muzzle', muzzle.x, muzzle.y);
  const foe = sw.target;
  const endX = foe && !foe.dead ? foe.x : t.x + Math.cos(sw.angle) * spec.range * CELL;
  const endY = foe && !foe.dead ? foe.y : t.y + Math.sin(sw.angle) * spec.range * CELL;
  G.effects.push({ muzzle: true, x: muzzle.x, y: muzzle.y, ang: sw.angle, life: .09, life0: .09 });
  G.effects.push({ bullet: true, x1: muzzle.x, y1: muzzle.y, x2: endX, y2: endY,
    life: .11, life0: .11, color: spec.color || '#ffe79a' });
}

function spawnAttackVisual(attacker, target, spec, affected, impactPoint = target, scale = 1) {
  const kind = spec.ability === '火焰' ? 'flame'
    : spec.ability === '雷電' ? 'lightning'
    : spec.ability === '怪力' || spec.ability === '自癒' ? 'melee'
    : spec.ability === '腐蝕' ? 'corrosion' : 'shot';
  if (attacker) {   // 攻擊時面向目標，並短暫切換成持槍圖（有持槍圖的角色才會顯示）
    const dx = target.x - attacker.x, dy = target.y - attacker.y;
    attacker.dir = Math.abs(dx) >= Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'back' : 'front');
    attacker.gunT = 0.3;
  }
  // 火焰、雷電、近戰改用程式即時繪製；其餘維持原本序列圖／光束
  const proc = kind === 'flame' || kind === 'lightning' || kind === 'melee' || kind === 'corrosion';
  if (kind === 'flame') {
    spawnFlameBurst(impactPoint.x, impactPoint.y + 8, scale);
    addScorchMark(impactPoint.x, impactPoint.y + 10, 15 * scale, null, 'flame');   // 希奧妮：地上留焦痕
  } else if (kind === 'lightning') {
    spawnLightningBolt(impactPoint.x, impactPoint.y, scale);
    addScorchMark(impactPoint.x, impactPoint.y + 10, (spec.splash > 0 ? Math.min(26, spec.splash * CELL * .3) : 16) * scale, null, 'lightning');   // 安柏：雷擊焦紋
  }
  else if (kind === 'melee') spawnMeleeImpact(impactPoint.x, impactPoint.y, spec.splash > 0);
  else if (kind === 'corrosion') spawnCorrosionSplash(impactPoint.x, impactPoint.y, spec.splash, spec.dmg, scale);
  else if (attacker && GUIDE_GUN_TYPES.has(attacker.type)) G.effects.push({ ring: true, x: target.x, y: target.y, r: 2, r2: 9, life: .14, life0: .14, color: '#ffe79a' });
  else G.effects.push({ attack: true, kind, x1: attacker.x, y1: attacker.y - 9, x2: target.x, y2: target.y, life: .28, life0: .28, color: spec.color, seed: Math.random() * 1000 });
  const hitTargets = affected && affected.length ? affected : [target];
  const heavyHit = kind === 'melee' || kind === 'lightning' || scale > 1.3;   // 近戰、雷電、大招算重擊
  for (const enemy of hitTargets) {
    if (attacker && G.towers.includes(attacker)) aggroOnSentry(enemy, attacker);   // 被打中的怪物改追這位哨兵
    enemy.hitT = Math.max(enemy.hitT || 0, .16);
    enemy.hitColor = spec.color;
    const from = enemy === target && attacker ? attacker : impactPoint;
    enemyHitReact(enemy, from.x, from.y, heavyHit);
  }
  const particleCount = proc ? 0 : 7;
  for (let i = 0; i < particleCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = (kind === 'corrosion' ? 20 : 35) + Math.random() * 55;
    G.effects.push({
      particle: true, kind, x: target.x, y: target.y,
      vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - (kind === 'flame' ? 22 : 0),
      r: 1.5 + Math.random() * 2.2, life: .24 + Math.random() * .2, life0: .44,
      color: kind === 'lightning' ? '#fff3a3' : (kind === 'flame' ? '#ffb347' : spec.color)
    });
  }
  // 依屬性給不同的打擊感：震動強度、命中頓格、衝擊環顏色
  const feel = ({
    flame:     { shake: 3.5, stop: 0,    ring: '#ff8a3a' },   // 希奧妮 火焰：中震、灼燒環
    lightning: { shake: 8,   stop: 0.05, ring: '#fff3a3' },   // 安柏 雷電：強震＋頓格＋亮環
    melee:     { shake: 6.5, stop: 0.05, ring: '#ffd0d5' },   // 雷德／路德 近戰：重擊震＋頓格
    corrosion: { shake: 2.5, stop: 0,    ring: '#b98cff' },   // 阿瓦倫 腐蝕：輕震、紫環
    shot:      { shake: 2.5, stop: 0,    ring: spec.color },
  })[kind] || { shake: 2.5, stop: 0, ring: spec.color };
  // 命中頓格只在玩家附近發生（遠處的戰鬥不凍結畫面，避免怪多時一直卡頓）
  if (feel.stop && G.player && Math.hypot(G.player.x - impactPoint.x, G.player.y - impactPoint.y) <= SHAKE_FEEL.range * CELL) addHitstop(feel.stop);
  if (!proc) G.effects.push({ ring: true, x: impactPoint.x, y: impactPoint.y, r: 5, r2: (spec.splash > 0 ? spec.splash * CELL + 6 : CELL * 0.85), life: 0.22, life0: 0.22, color: feel.ring });
  for (const enemy of hitTargets) {
    const text = '-' + Math.round(spec.dmg * (enemy === target ? 1 : 0.6));
    if (spec.crit && enemy === target) flashCrit(text, enemy.x, enemy.y - 30);   // 爆擊：金色大字
    else if (spec.rage > 1.25) flashDmg(text, enemy.x, enemy.y - 26, spec.rage >= 1.6 ? '#ff5a3a' : '#ff9a4a');   // 怪力加成：橘紅色數字
    else flashDmg(text, enemy.x, enemy.y - 26, feel.ring);
  }
  if (G.enemies.includes(target) && typeof sfxAt === 'function') {
    const impactSound = { flame: 'fireImpact', lightning: 'lightningImpact', corrosion: 'corrosionImpact' }[kind];
    if (impactSound) sfxAt(impactSound, impactPoint.x, impactPoint.y, kind === 'corrosion' ? 0.62 : 0.5, attacker?.type || 'sentry');
    sfxAt('monsterHit', target.x, target.y, 0.48, attacker?.type || 'sentry');
  }
}
const SENTRY_ATTACK_SOUNDS = { theonie: 'rangedShot', amber: 'rangedShot', avaren: 'cleaver', luther: 'meleeAttack', red: 'swordSwing' };
function playSentryAttackSound(t) {
  const name = SENTRY_ATTACK_SOUNDS[t.type];
  if (name && typeof sfxAt === 'function') sfxAt(name, t.x, t.y, 0.55, t.type);
}
