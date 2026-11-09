/* ===== 2F應變中心的電腦：🎱 彈珠檯「Y102 救援彈珠台」=====
   ・經典電腦彈珠台的風格（深色太空感桌面、鍍鉻軌道、會亮的燈、右邊點陣式計分板、任務），
     桌面配置、名稱、圖案都是我們自己設計的 Y102 救援主題
   ・視窗、桌面圖示在 js/pc-desktop.js；共用小工具（暫停、最高分、畫布）在 js/pc-arcade.js，所以要在它後面載入
   ・樣式在 css/style.css 的「彈珠檯」；音效在 js/sfx.js 的 pb 開頭那幾個（音效編輯器可以換）
   ・操作：
       Z、← 或左 Shift＝左擋板；/、→ 或右 Shift＝右擋板（按住就一直舉著）
       空白鍵或 ↓ 按住＝拉彈簧，放開＝發射（按越久射越遠）
       P 暫停、Enter 遊戲結束後再玩一次；手機畫面下方有「左擋板／發射／右擋板」按鈕
   ・桌面上有什麼（座標都在 PB_ 開頭的常數裡）：
       ・上方三條小通道：經過就亮，三條全亮＝倍數 +1（最多 ×5）
       ・三顆警示燈（圓形彈跳柱）、兩邊的三角彈弓
       ・左邊「救援通道」：從左下往上射進去，算一次通道
       ・通道旁邊的三個補給燈（立靶）：打亮三個＝加分，而且下一顆珠子掉了會救回來一次
       ・右邊三個掉落目標：打到會倒下，三個都倒＝大加分後全部立起來
       ・中央「基地洞」：珠子掉進去會停一下、加分，再吐出來
   ・任務：依序輪流（疏散民眾→搜救行動→物資運送→回報基地→全員集合），右邊計分板會寫要做什麼；
     完成一個任務大加分、階級升一級，下一輪的任務要求變多
   ・一局 3 顆珠子；剛發射的前 8 秒掉下去會救回來（右邊會寫「救援中」）
   ・最高分記在 tudrc_arcade_best_v1 的 pinball；遊戲紀錄：第一次發射算一局，真的在玩的時候每秒記時間
   ・物理：每一格畫面切成很多小步算，珠子才不會快到穿牆；珠子卡住不動 3 秒會被輕輕推一下
*/
const PB_W = 320, PB_H = 600;     // 桌面的「邏輯大小」，畫的時候再依螢幕縮放
const PB_R = 7;                   // 珠子半徑
const PB_GRAVITY = 900;
const PB_FLIP_LEN = 54, PB_FLIP_R = 6;
const PB_MAX_SPEED = 1400;
const PB_LANE_X = 284;            // 發射通道的內牆
// 一般的牆（線段 [x1, y1, x2, y2]）
const PB_WALLS = (() => {
  const w = [[12, 610, 12, 160], [308, 160, 308, 610], [PB_LANE_X, 610, PB_LANE_X, 214], [PB_LANE_X, 590, 308, 590],   // 左牆、右牆、發射通道內牆、通道底
    [12, 450, 80, 520], [PB_LANE_X, 450, 216, 520],           // 擋板上方的斜坡（內側通道）
    [34, 380, 34, 440], [34, 440, 68, 470], [262, 380, 262, 440], [262, 440, 228, 470],   // 彈弓的另外兩邊
    [44, 190, 44, 290],                                        // 救援通道的隔牆
    [91, 62, 91, 100], [129, 62, 129, 100], [167, 62, 167, 100], [205, 62, 205, 100]];   // 上方三條小通道的隔板
  for (let i = 0; i < 32; i++) {   // 上面的圓弧
    const a1 = Math.PI + Math.PI * i / 32, a2 = Math.PI + Math.PI * (i + 1) / 32;
    w.push([160 + 148 * Math.cos(a1), 160 + 148 * Math.sin(a1), 160 + 148 * Math.cos(a2), 160 + 148 * Math.sin(a2)]);
  }
  return w;
})();
// 單向閘門：珠子從下面往上可以穿過去，從上面掉下來會被擋住、滾回桌面中間
const PB_GATES = [
  [308, 196, PB_LANE_X, 214],   // 發射通道出口：射得出去，但繞一圈回來不會掉回通道
  [12, 176, 44, 192],           // 救援通道上方：從下面射上去可以過，從圓弧滾下來會被彈到桌面中間
];
const PB_SLINGS = [[34, 380, 68, 470], [262, 380, 228, 470]];
const PB_BUMPERS = [[100, 168], [190, 162], [146, 222]].map(([x, y]) => ({ x, y, r: 18 }));
const PB_LANES = [110, 148, 186].map(x => ({ x, y: 84 }));
const PB_STANDS = [215, 245, 275].map(y => ({ x: 46, y }));        // 補給燈（貼在救援通道隔牆的右邊）
const PB_DROPS = [250, 280, 310].map(y => ({ x: 262, y }));         // 右邊三個掉落目標（面向左邊）
const PB_SAUCER = { x: 148, y: 305, r: 10 };                        // 中央基地洞
const PB_FLIPPERS = [
  { x: 84, y: 524, rest: 0.5, up: -0.45, key: 'L' },
  { x: 212, y: 524, rest: Math.PI - 0.5, up: Math.PI + 0.45, key: 'R' },
];
const PB_MISSIONS = [
  { name: '疏散民眾', goal: '撞擊警示燈', need: 12, ev: 'bumper' },
  { name: '搜救行動', goal: '打倒右側目標', need: 3, ev: 'drop' },
  { name: '物資運送', goal: '射進左側救援通道', need: 2, ev: 'ramp' },
  { name: '回報基地', goal: '射進中央基地洞', need: 1, ev: 'saucer' },
  { name: '全員集合', goal: '點亮上方三條通道', need: 3, ev: 'lane' },
];
const PB_RANKS = ['見習隊員', '隊員', '資深隊員', '小隊長', '隊長', '副指揮官', '指揮官'];
const PB_SAVE_MS = 8000;   // 剛發射的前幾毫秒掉下去會救回來

function initPcPinball(body) {
  body.innerHTML = '<div class="pcd-arc pcd-pinball"><div class="pcd-fc-bar">' +
      '<button type="button" data-a="new">新局</button><button type="button" data-a="pause">暫停</button>' +
    '</div><div class="pb-wrap"><div class="pb-table"><canvas class="pcd-arc-cv pb-cv"></canvas></div>' +
      '<div class="pb-side">' +
        '<div class="pb-logo"><b>Y102</b><span>救援彈珠台</span></div>' +
        '<div class="pb-lcd pb-ballrow"><span>BALL</span><b class="pb-ball">1</b></div>' +
        '<div class="pb-lcd pb-score">0</div>' +
        '<div class="pb-lcd pb-rank"></div>' +
        '<div class="pb-lcd pb-mission"></div>' +
        '<div class="pb-lcd pb-msg"></div>' +
        '<div class="pb-best">最高分 <b class="pb-bestv">0</b></div>' +
      '</div></div>' +
    '<div class="pcd-arc-pad pcp-pad"><button type="button" data-hold="L">左擋板</button><button type="button" data-hold="S">發射</button><button type="button" data-hold="R">右擋板</button></div>' +
    '<div class="pcd-arc-msg">Z／← 左擋板　／／→ 右擋板　空白鍵按住拉彈簧、放開發射　P 暫停</div></div>';
  const g = pcd.pinball = { body, cv: body.querySelector('.pb-cv'), scale: 1, playMs: 0, hold: { L: false, R: false, S: false } };
  g.render = () => renderPcPinball();
  pcaBar(body, b => { if (b.dataset.a === 'new') newPcPinball(); else if (b.dataset.a === 'pause') pcPinballPause(); });
  const pad = body.querySelector('.pcp-pad');
  pad.addEventListener('pointerdown', e => { const b = e.target.closest('[data-hold]'); if (!b) return; e.preventDefault(); focusPcWin('pinball'); pcPinballHold(b.dataset.hold, true); });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(t => pad.addEventListener(t, e => { const b = e.target.closest('[data-hold]'); if (b) pcPinballHold(b.dataset.hold, false); }));
  newPcPinball();
  pcaLoop('pinball', g, dt => {
    const steps = Math.ceil(dt / 4);
    for (let i = 0; i < steps && g.state === 'run'; i++) stepPcPinball(dt / 1000 / steps);
    g.t += dt;
    for (const k in g.flash) if ((g.flash[k] -= dt) <= 0) delete g.flash[k];
    if (g.msgT > 0) g.msgT -= dt;
    renderPcPinball();
  });
}
function newPcPinball() {
  const g = pcd.pinball;
  Object.assign(g, { score: 0, ball: 1, balls: 3, mult: 1, rank: 0, loop: 0, mission: 0, prog: 0,
    lanes: [false, false, false], stands: [false, false, false], drops: [false, false, false], extraSave: false,
    state: 'ready', autoPaused: false, newBest: false, t: 0, flips: PB_FLIPPERS.map(f => ({ a: f.rest, w: 0 })),
    charge: 0, flash: {}, msg: '', msgT: 0, saucer: null, saucerCool: 0, saveUntil: 0, stillMs: 0, inside: {} });
  g.hold.L = g.hold.R = g.hold.S = false;
  resetPcPinballBall();
  fitPcPinball(); renderPcPinball();
}
function resetPcPinballBall() {
  const g = pcd.pinball;
  g.b = { x: 296, y: 590 - PB_R - 1, vx: 0, vy: 0 };
  g.saucer = null; g.saveUntil = 0; g.stillMs = 0;
}
function pcPinballPause() {
  const g = pcd.pinball;
  if (g.state === 'run') g.state = 'pause';
  else if (g.state === 'pause') { g.state = 'run'; g.autoPaused = false; }
  renderPcPinball();
}
function pbSay(text, ms) { const g = pcd.pinball; g.msg = text; g.msgT = ms || 1800; }
function pbAdd(pts) { const g = pcd.pinball; g.score += pts * g.mult; }
const pbMissionNeed = g => Math.ceil(PB_MISSIONS[g.mission].need * (1 + g.loop * 0.5));   // 每繞一輪，要求多一半
// 發生了某件事（撞到警示燈、射進通道…）：如果剛好是現在任務要的，就算進度
function pbEvent(ev) {
  const g = pcd.pinball, m = PB_MISSIONS[g.mission];
  if (m.ev !== ev) return;
  g.prog++;
  if (g.prog < pbMissionNeed(g)) return;
  pbAdd(20000 * (g.rank + 1));
  g.rank = Math.min(PB_RANKS.length - 1, g.rank + 1);
  pbSay('任務完成！升為' + PB_RANKS[g.rank], 2600);
  g.flash.mission = 1600;
  sfx('pbMission');
  g.prog = 0; g.mission++;
  if (g.mission >= PB_MISSIONS.length) { g.mission = 0; g.loop++; }
}

// 珠子撞到一條有粗細的線段（牆粗細 0、擋板 6、彈跳柱＝起點終點同一點的圓）；surf＝那一點本身的速度；kick＝額外彈開
function pbCollide(b, ax, ay, bx, by, rs, bounce, surf, kick) {
  const dx = bx - ax, dy = by - ay, len2 = dx * dx + dy * dy;
  const t = len2 ? Math.max(0, Math.min(1, ((b.x - ax) * dx + (b.y - ay) * dy) / len2)) : 0;
  const cx = ax + dx * t, cy = ay + dy * t;
  let nx = b.x - cx, ny = b.y - cy;
  const d = Math.hypot(nx, ny), min = PB_R + rs;
  if (d >= min || d === 0) return false;
  nx /= d; ny /= d;
  b.x = cx + nx * min; b.y = cy + ny * min;
  const [sx, sy] = surf ? surf(cx, cy) : [0, 0];
  let rx = b.vx - sx, ry = b.vy - sy;
  const vn = rx * nx + ry * ny;
  if (vn < 0) { rx -= (1 + bounce) * vn * nx; ry -= (1 + bounce) * vn * ny; }
  b.vx = rx + sx + nx * (kick || 0); b.vy = ry + sy + ny * (kick || 0);
  return true;
}
function pbInside(key, now) {   // 感應區：只在「剛進去」那一下算一次
  const g = pcd.pinball, was = g.inside[key];
  g.inside[key] = now;
  return now && !was;
}
function stepPcPinball(dt) {
  const g = pcd.pinball, b = g.b;
  // 擋板
  PB_FLIPPERS.forEach((f, i) => {
    const s = g.flips[i], target = g.hold[f.key] ? f.up : f.rest, speed = g.hold[f.key] ? 26 : 14;
    const old = s.a, diff = target - s.a;
    s.a += Math.sign(diff) * Math.min(Math.abs(diff), speed * dt); s.w = (s.a - old) / dt;
  });
  const inLane = b.x > PB_LANE_X && b.y > 214;
  if (inLane && g.hold.S) g.charge = Math.min(1, g.charge + dt);
  // 基地洞：珠子停在洞裡，時間到再吐出來
  if (g.saucer) {
    g.saucer.t -= dt * 1000;
    if (g.saucer.t <= 0) { g.saucer = null; g.saucerCool = 700; b.vx = (Math.random() - .5) * 240; b.vy = 260; sfx('pbKick'); }
    return;
  }
  g.saucerCool = Math.max(0, g.saucerCool - dt * 1000);
  b.vy += PB_GRAVITY * dt;
  const sp = Math.hypot(b.vx, b.vy);
  if (sp > PB_MAX_SPEED) { b.vx *= PB_MAX_SPEED / sp; b.vy *= PB_MAX_SPEED / sp; }
  b.x += b.vx * dt; b.y += b.vy * dt;
  // 牆
  PB_WALLS.forEach(w => pbCollide(b, w[0], w[1], w[2], w[3], 0, 0.4));
  // 單向閘門：只有珠子在閘門「上面」時才擋（從下面往上穿過去不會被擋）
  PB_GATES.forEach(([ax, ay, bx2, by2]) => {
    const t = (b.x - ax) / (bx2 - ax);
    if (t > -0.3 && t < 1.3 && b.y < ay + (by2 - ay) * Math.max(0, Math.min(1, t))) pbCollide(b, ax, ay, bx2, by2, 0, 0.3);
  });
  // 彈弓
  PB_SLINGS.forEach((w, i) => {
    if (pbCollide(b, w[0], w[1], w[2], w[3], 0, 0.5, null, 280)) { if (!g.flash['s' + i]) { pbAdd(100); sfx('pbSling'); } g.flash['s' + i] = 120; }
  });
  // 警示燈（彈跳柱）
  PB_BUMPERS.forEach((p, i) => {
    if (pbCollide(b, p.x, p.y, p.x, p.y, p.r, 0.6, null, 360)) { if (!g.flash['b' + i]) { pbAdd(1000); sfx('pbBumper'); pbEvent('bumper'); } g.flash['b' + i] = 150; }
  });
  // 補給燈（立靶）
  PB_STANDS.forEach((s, i) => {
    if (pbCollide(b, s.x, s.y - 9, s.x, s.y + 9, 2, 0.5, null, 60) && !g.flash['t' + i]) {
      g.flash['t' + i] = 200; pbAdd(750); sfx('pbTarget');
      if (!g.stands[i]) {
        g.stands[i] = true;
        if (g.stands.every(v => v)) { g.stands = [false, false, false]; g.extraSave = true; pbAdd(5000); pbSay('補給到齊！掉球救援一次', 2200); g.flash.stands = 900; sfx('pbBonus'); }
      }
    }
  });
  // 掉落目標：從左邊打到才會倒
  PB_DROPS.forEach((d, i) => {
    if (g.drops[i]) return;
    if (pbCollide(b, d.x, d.y - 11, d.x, d.y + 11, 3, 0.4) && b.x < d.x) {
      g.drops[i] = true; pbAdd(1500); sfx('pbDrop'); pbEvent('drop');
      if (g.drops.every(v => v)) { pbAdd(10000); pbSay('目標全倒！', 1800); g.flash.drops = 900; setTimeout(() => { if (pcd.pinball === g) g.drops = [false, false, false]; }, 900); sfx('pbBonus'); }
    }
  });
  // 擋板
  PB_FLIPPERS.forEach((f, i) => {
    const s = g.flips[i], tx = f.x + Math.cos(s.a) * PB_FLIP_LEN, ty = f.y + Math.sin(s.a) * PB_FLIP_LEN;
    pbCollide(b, f.x, f.y, tx, ty, PB_FLIP_R, 0.3, (cx, cy) => [-s.w * (cy - f.y), s.w * (cx - f.x)]);
  });
  // 上方三條小通道
  PB_LANES.forEach((l, i) => {
    if (pbInside('l' + i, Math.abs(b.x - l.x) < 12 && Math.abs(b.y - l.y) < 14) && !g.lanes[i]) {
      g.lanes[i] = true; pbAdd(500); sfx('pbLane'); pbEvent('lane');
      if (g.lanes.every(v => v)) {
        g.lanes = [false, false, false]; g.mult = Math.min(5, g.mult + 1); pbAdd(2000);
        pbSay('倍數 ×' + g.mult, 1800); g.flash.lanes = 900; sfx('pbBonus');
      }
    }
  });
  // 救援通道：從下往上穿過通道中間那條線
  if (pbInside('ramp', b.x > 12 && b.x < 44 && b.y > 195 && b.y < 210) && b.vy < 0) {
    pbAdd(5000); sfx('pbRamp'); pbSay('救援通道！', 1400); g.flash.ramp = 700; pbEvent('ramp');
  }
  // 基地洞
  if (!g.saucerCool && Math.hypot(b.x - PB_SAUCER.x, b.y - PB_SAUCER.y) < PB_SAUCER.r && Math.hypot(b.vx, b.vy) < 650) {
    b.x = PB_SAUCER.x; b.y = PB_SAUCER.y; b.vx = b.vy = 0; g.saucer = { t: 1100 };
    pbAdd(7500); sfx('pbSaucer'); pbSay('回到基地！', 1400); g.flash.saucer = 1100; pbEvent('saucer');
  }
  // 卡住不動：輕輕推一下
  if (!inLane && Math.hypot(b.vx, b.vy) < 15) { g.stillMs += dt * 1000; if (g.stillMs > 3000) { g.stillMs = 0; b.vx = (Math.random() - .5) * 300; b.vy = -250; } }
  else g.stillMs = 0;
  // 掉下去了
  if (b.y > PB_H + 20 && b.x < PB_LANE_X) {
    g.charge = 0;
    if (g.t < g.saveUntil || g.extraSave) {   // 救援：放回發射通道，不扣珠子
      if (!(g.t < g.saveUntil)) g.extraSave = false;
      pbSay('救援成功！珠子送回來了', 2000); sfx('pbSave'); resetPcPinballBall(); return;
    }
    g.balls--; sfx('pbDrain');
    if (g.balls <= 0) { g.state = 'over'; g.newBest = pcaSaveBest('pinball', g.score); pbSay('遊戲結束', 99999); }
    else { g.ball++; pbSay('第 ' + g.ball + ' 顆珠子', 2000); resetPcPinballBall(); }
  }
}
function pcPinballHold(k, on) {
  const g = pcd.pinball; if (!g) return;
  if (on && g.state === 'over') return;
  if (on && g.state === 'ready') { g.state = 'run'; minigameRound('pinball'); }
  if (on && g.state === 'pause') { g.state = 'run'; g.autoPaused = false; }
  if (k === 'S' && !on && g.hold.S && g.state === 'run') {   // 放開彈簧＝發射
    const b = g.b;
    if (b.x > PB_LANE_X && b.y > 520) { b.vy = -(650 + 650 * g.charge); sfx('pbLaunch'); g.saveUntil = g.t + PB_SAVE_MS; }
    g.charge = 0;
  }
  if ((k === 'L' || k === 'R') && on && !g.hold[k]) sfx('pbFlipper');
  g.hold[k] = on;
}
const PCP_KEYS = { z: 'L', ArrowLeft: 'L', ShiftLeft: 'L', '/': 'R', ArrowRight: 'R', ShiftRight: 'R', ' ': 'S', ArrowDown: 'S' };
const pbKeyOf = e => PCP_KEYS[e.code === 'ShiftLeft' || e.code === 'ShiftRight' ? e.code : e.key.length === 1 ? e.key.toLowerCase() : e.key];
function pcPinballKey(e) {
  const g = pcd.pinball, k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  if (k === 'Enter') { if (g.state === 'over') newPcPinball(); return true; }
  if (k === 'p') { if (!e.repeat) pcPinballPause(); return true; }
  const h = pbKeyOf(e); if (!h) return false;
  if (!e.repeat) pcPinballHold(h, true);
  return true;
}
window.addEventListener('keyup', e => {   // 放開按鍵：電腦桌面只轉交「按下」，放開要自己聽
  const g = pcd.pinball; if (!g || !pcd.wins.pinball) return;
  const h = pbKeyOf(e);
  if (h && g.hold[h]) pcPinballHold(h, false);
}, { capture: true });

function fitPcPinball() {
  const g = pcd.pinball; if (!g || !pcd.wins.pinball) return;
  const screen = pcd.el.querySelector('.pcd-screen'), H = screen.clientHeight - 34, W = screen.clientWidth;
  const s = Math.max(0.42, Math.min(1.05, (H - 120) / PB_H, (W - 250) / PB_W));
  if (s !== g.scale) { g.scale = s; g.bg = null; }   // 大小變了：底圖重畫
  renderPcPinball(); pcaKeepInside('pinball');
}

// ---- 畫面 ----
// 不會動的東西（桌面底色、星星、圖案、鍍鉻軌道）先畫在一張底圖上，每一格只要貼上去
function pbBackground(s) {
  const c = document.createElement('canvas'), r = window.devicePixelRatio || 1;
  c.width = Math.round(PB_W * s * r); c.height = Math.round(PB_H * s * r);
  const ctx = c.getContext('2d'); ctx.scale(s * r, s * r);
  const bg = ctx.createLinearGradient(0, 0, 0, PB_H);
  bg.addColorStop(0, '#0b1240'); bg.addColorStop(.55, '#1a0f3d'); bg.addColorStop(1, '#0a0820');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, PB_W, PB_H);
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;   // 固定的亂數：星星每次都在同樣的位置
  for (let i = 0; i < 140; i++) { ctx.fillStyle = 'rgba(255,255,255,' + (0.15 + rnd() * 0.6) + ')'; const z = rnd() < .1 ? 1.6 : .9; ctx.fillRect(rnd() * PB_W, rnd() * PB_H, z, z); }
  // 星雲
  [[80, 420, '#ff3fa4'], [240, 150, '#3fb8ff'], [150, 300, '#8a4dff']].forEach(([x, y, col]) => {
    const n = ctx.createRadialGradient(x, y, 0, x, y, 110); n.addColorStop(0, col + '33'); n.addColorStop(1, col + '00');
    ctx.fillStyle = n; ctx.fillRect(0, 0, PB_W, PB_H);
  });
  // 中央徽章：同心圓＋放射線（基地洞周圍）
  ctx.save(); ctx.translate(PB_SAUCER.x, PB_SAUCER.y);
  for (let i = 0; i < 24; i++) { ctx.rotate(Math.PI / 12); ctx.strokeStyle = 'rgba(120,200,255,.12)'; ctx.beginPath(); ctx.moveTo(26, 0); ctx.lineTo(70, 0); ctx.stroke(); }
  [26, 46, 70].forEach((rr, i) => { ctx.strokeStyle = 'rgba(120,200,255,' + (.35 - i * .1) + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, rr, 0, Math.PI * 2); ctx.stroke(); });
  ctx.fillStyle = 'rgba(160,220,255,.22)'; ctx.font = 'bold 15px Consolas, monospace'; ctx.textAlign = 'center'; ctx.fillText('Y102', 0, 46 + 18);
  ctx.restore();
  // 發射通道底色
  ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(PB_LANE_X, 214, 308 - PB_LANE_X, PB_H);
  // 救援通道底色
  ctx.fillStyle = 'rgba(255,140,40,.1)'; ctx.fillRect(12, 190, 32, 100);
  // 鍍鉻軌道：深色粗線＋亮色細線＋高光
  const chrome = segs => {
    ctx.lineCap = 'round';
    [[7, '#1b1f33'], [4, '#7d8aa8'], [1.4, '#e8f0ff']].forEach(([lw, col]) => {
      ctx.lineWidth = lw; ctx.strokeStyle = col; ctx.beginPath();
      segs.forEach(w => { ctx.moveTo(w[0], w[1]); ctx.lineTo(w[2], w[3]); }); ctx.stroke();
    });
  };
  chrome(PB_WALLS);
  ctx.save(); ctx.globalAlpha = .75; chrome(PB_GATES); ctx.restore();
  return c;
}
function pbGlow(ctx, x, y, r, col, on) {   // 圓形燈：亮的時候會發光
  ctx.save();
  if (on) { ctx.shadowColor = col; ctx.shadowBlur = 14; }
  ctx.fillStyle = on ? col : 'rgba(255,255,255,.08)'; ctx.strokeStyle = col; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.restore();
}
function pbArrow(ctx, x, y, ang, col, on) {   // 箭頭燈（指向任務要打的地方）
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
  if (on) { ctx.shadowColor = col; ctx.shadowBlur = 12; }
  ctx.fillStyle = on ? col : 'rgba(255,255,255,.07)'; ctx.strokeStyle = col; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, -11); ctx.lineTo(8, 6); ctx.lineTo(0, 2); ctx.lineTo(-8, 6); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore();
}
function renderPcPinball() {
  const g = pcd.pinball, s = g.scale, W = Math.round(PB_W * s), H = Math.round(PB_H * s);
  const ctx = pcaSizeCanvas(g.cv, W, H);
  if (!g.bg) g.bg = pbBackground(s);
  ctx.drawImage(g.bg, 0, 0, W, H);
  ctx.save(); ctx.scale(s, s);
  const blink = Math.floor(g.t / 250) % 2 === 0, m = PB_MISSIONS[g.mission], want = ev => m.ev === ev && blink;   // 任務要打的地方會閃
  const party = g.flash.mission && Math.floor(g.t / 90) % 2 === 0;   // 任務完成：全部的燈一起閃
  // 箭頭燈
  pbArrow(ctx, 28, 320, 0, '#ff9a2e', want('ramp') || g.flash.ramp || party);
  pbArrow(ctx, PB_SAUCER.x, PB_SAUCER.y + 40, 0, '#4fd8ff', want('saucer') || g.flash.saucer || party);
  pbArrow(ctx, 230, 280, Math.PI / 2, '#ff4f8a', want('drop') || party);
  pbArrow(ctx, 148, 130, 0, '#ffe14a', want('lane') || party);
  pbArrow(ctx, 146, 262, 0, '#b07bff', want('bumper') || party);
  // 倍數燈（×2～×5）
  for (let i = 2; i <= 5; i++) {
    const x = 104 + (i - 2) * 30, y = 420, on = g.mult >= i || party;
    pbGlow(ctx, x, y, 9, '#ffe14a', on);
    ctx.fillStyle = on ? '#3a2600' : 'rgba(255,225,74,.5)'; ctx.font = 'bold 9px Consolas, monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('×' + i, x, y + .5);
  }
  // 救援燈（剛發射、或補給到齊）
  pbGlow(ctx, 148, 560, 7, '#5be37a', (g.t < g.saveUntil && blink) || g.extraSave || party);
  // 上方通道燈
  PB_LANES.forEach((l, i) => pbGlow(ctx, l.x, l.y, 7, '#ffe14a', g.lanes[i] || g.flash.lanes || party));
  // 補給燈
  PB_STANDS.forEach((t, i) => {
    const on = g.stands[i] || g.flash['t' + i] || g.flash.stands || party;
    ctx.save(); if (on) { ctx.shadowColor = '#5be37a'; ctx.shadowBlur = 12; }
    ctx.fillStyle = on ? '#5be37a' : '#1d4a2a'; ctx.fillRect(t.x - 1, t.y - 9, 7, 18);
    ctx.strokeStyle = '#a8ffbf'; ctx.lineWidth = 1; ctx.strokeRect(t.x - 1, t.y - 9, 7, 18); ctx.restore();
  });
  // 掉落目標
  PB_DROPS.forEach((d, i) => {
    if (g.drops[i]) { ctx.fillStyle = 'rgba(255,79,138,.2)'; ctx.fillRect(d.x - 2, d.y - 11, 6, 22); return; }
    ctx.save(); if (g.flash.drops || party) { ctx.shadowColor = '#ff4f8a'; ctx.shadowBlur = 12; }
    const gr = ctx.createLinearGradient(d.x - 5, 0, d.x + 4, 0); gr.addColorStop(0, '#ff9ac0'); gr.addColorStop(1, '#c0245c');
    ctx.fillStyle = gr; ctx.fillRect(d.x - 5, d.y - 11, 9, 22); ctx.restore();
  });
  // 彈弓
  [[34, 380, 34, 440, 68, 470], [262, 380, 262, 440, 228, 470]].forEach((t, i) => {
    const lit = g.flash['s' + i] || party;
    ctx.save(); if (lit) { ctx.shadowColor = '#ff5ad0'; ctx.shadowBlur = 16; }
    ctx.beginPath(); ctx.moveTo(t[0], t[1]); ctx.lineTo(t[2], t[3]); ctx.lineTo(t[4], t[5]); ctx.closePath();
    const gr = ctx.createLinearGradient(t[0], t[1], t[4], t[5]); gr.addColorStop(0, lit ? '#fff' : '#ff5ad0'); gr.addColorStop(1, lit ? '#ffd0f0' : '#7a1d6a');
    ctx.fillStyle = gr; ctx.fill(); ctx.strokeStyle = '#ffd0f0'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
  });
  // 基地洞
  ctx.save();
  if (g.flash.saucer || want('saucer')) { ctx.shadowColor = '#4fd8ff'; ctx.shadowBlur = 16; }
  ctx.fillStyle = '#05060f'; ctx.beginPath(); ctx.arc(PB_SAUCER.x, PB_SAUCER.y, PB_SAUCER.r + 2, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#4fd8ff'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
  // 警示燈（彈跳柱）：圓蓋＋外圈＋中間的燈
  PB_BUMPERS.forEach((p, i) => {
    const lit = g.flash['b' + i] || party;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.beginPath(); ctx.arc(p.x + 3, p.y + 4, p.r + 1, 0, Math.PI * 2); ctx.fill();   // 影子
    if (lit) { ctx.shadowColor = '#ff8a3d'; ctx.shadowBlur = 22; }
    const ring = ctx.createRadialGradient(p.x - 5, p.y - 6, 2, p.x, p.y, p.r + 2);
    ring.addColorStop(0, '#ffffff'); ring.addColorStop(.35, lit ? '#ffe2b0' : '#c9d2ea'); ring.addColorStop(1, lit ? '#ff8a3d' : '#5a6488');
    ctx.fillStyle = ring; ctx.beginPath(); ctx.arc(p.x, p.y, p.r + (lit ? 2 : 0), 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = lit ? '#fff3a0' : '#e0362c'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * .5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.beginPath(); ctx.arc(p.x - 3, p.y - 3, p.r * .16, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  });
  // 擋板：白色、紅邊，有一點立體感
  PB_FLIPPERS.forEach((f, i) => {
    const a = g.flips[i].a, tx = f.x + Math.cos(a) * PB_FLIP_LEN, ty = f.y + Math.sin(a) * PB_FLIP_LEN;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(0,0,0,.45)'; ctx.lineWidth = PB_FLIP_R * 2 + 2; ctx.beginPath(); ctx.moveTo(f.x + 3, f.y + 4); ctx.lineTo(tx + 3, ty + 4); ctx.stroke();
    ctx.strokeStyle = '#c0245c'; ctx.lineWidth = PB_FLIP_R * 2 + 2; ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.lineTo(tx, ty); ctx.stroke();
    ctx.strokeStyle = '#f4f6ff'; ctx.lineWidth = PB_FLIP_R * 2 - 2; ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.lineTo(tx, ty); ctx.stroke();
    ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.arc(f.x, f.y, 3.5, 0, Math.PI * 2); ctx.fill();
  });
  // 彈簧
  const py = 590 + g.charge * 8;
  ctx.fillStyle = '#9aa6c4'; ctx.fillRect(289, py, 14, PB_H - py);
  if (g.charge > 0) { ctx.fillStyle = '#ff5a4a'; ctx.fillRect(PB_LANE_X + 2, 586 - 100 * g.charge, 3, 100 * g.charge); }
  // 珠子：鍍鉻球＋影子
  if (g.state !== 'over') {
    const b = g.b;
    ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.beginPath(); ctx.arc(b.x + 3, b.y + 4, PB_R, 0, Math.PI * 2); ctx.fill();
    const gr = ctx.createRadialGradient(b.x - 2.5, b.y - 3, .5, b.x, b.y, PB_R);
    gr.addColorStop(0, '#ffffff'); gr.addColorStop(.35, '#d8dee8'); gr.addColorStop(.75, '#6c7486'); gr.addColorStop(1, '#2a2f3a');
    ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(b.x, b.y, PB_R, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  if (g.state === 'ready') pcaOverlay(ctx, W, H, '按住空白鍵發射', '放開彈簧，珠子就會射出去');
  else if (g.state === 'pause') pcaOverlay(ctx, W, H, '暫停中', g.autoPaused ? '點一下視窗、再按 P 繼續' : '按 P 繼續');
  else if (g.state === 'over') pcaOverlay(ctx, W, H, '遊戲結束', (g.newBest ? '🏆 新紀錄！' : '') + '按 Enter 再玩一次');
  renderPcPinballSide();
}
// 右邊的點陣計分板（只在內容變了時才改，免得每一格都重排版）
function renderPcPinballSide() {
  const g = pcd.pinball, q = sel => g.body.querySelector(sel);
  const set = (sel, html) => { const el = q(sel); if (el.innerHTML !== html) el.innerHTML = html; };
  const m = PB_MISSIONS[g.mission];
  set('.pb-ball', String(Math.min(g.ball, 3)));
  set('.pb-score', g.score.toLocaleString('en-US'));
  set('.pb-rank', PB_RANKS[g.rank] + '<i>×' + g.mult + '</i>');
  set('.pb-mission', '<b>任務：' + m.name + '</b>' + m.goal + '<br><span>' + g.prog + ' ／ ' + pbMissionNeed(g) + '</span>');
  const msg = g.msgT > 0 ? g.msg : g.state === 'ready' ? '按住空白鍵發射' : g.t < g.saveUntil ? '救援中…' : '';
  set('.pb-msg', pcdEsc(msg));
  set('.pb-bestv', String(pcaBest.pinball || 0));
  const pb = q('[data-a="pause"]'), txt = g.state === 'pause' ? '▶ 繼續' : '暫停';
  if (pb.textContent !== txt) pb.textContent = txt;
  pb.disabled = g.state === 'ready' || g.state === 'over';
}
window.addEventListener('resize', () => { if (pcDesktopOpen && pcd.wins.pinball) fitPcPinball(); });
