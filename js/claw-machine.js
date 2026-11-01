/* ===== 夾娃娃機：花經費下爪夾道具（數值在 data/claw-machine.js）=====
   ・地圖上的夾娃娃機（CLAW_MACHINE.tiles，或名稱有「夾娃娃機」的素材）前按 Space 打開；打開時戰鬥暫停
   ・流程：投幣 → 開始（倒數）→ ←→ 移動爪子 → 空白鍵下爪 → 夾起來 → 回到出口上方放開 → 掉進出口就是你的
   ・爪子移動會晃，晃的時候下爪會歪掉，停一下再下比較準
   ・每台機器各自記得：裡面有什麼、還有幾次、保夾累積（存在瀏覽器 CLAW_STORE）
   必須在 js/costumes.js 之後載入。
*/
let clawOpen = false;
const CLAW_STORE = 'tudrc_claw_machine_v1';
const clawSave = (() => { try { return JSON.parse(localStorage.getItem(CLAW_STORE) || '{}') || {}; } catch (_) { return {}; } })();
const clawPersist = () => { try { localStorage.setItem(CLAW_STORE, JSON.stringify(clawSave)); } catch (_) {} };

// 機台內部的座標：高固定 360，寬在打開時照機台窗口的比例決定（clawFitWindow）
const CW = { W: 400, H: 360, FLOOR: 346, WALL: 396, CHUTE_X: 92, CHUTE_TOP: 232, HOME_X: 46, AIM_MIN: 118, RAIL_Y: 16, ROPE_MIN: 52, GRAVITY: 1100 };
const CW_TIER = {
  common: { name: '常見', tint: 'rgba(255,255,255,.34)', line: '#5d68bd' },
  rare: { name: '稀有', tint: 'rgba(255,150,205,.38)', line: '#c9367f' },
  jackpot: { name: '大獎', tint: 'rgba(255,214,110,.5)', line: '#b97a12' },
};
const cw = { el: null, canvas: null, ctx: null, bg: null, spot: null, m: null, phase: 'idle', raf: 0, last: 0, acc: 0, prizes: [], imgs: {}, x: CW.AIM_MIN, vx: 0, rope: CW.ROPE_MIN, swing: 0, swingV: 0, open: 1, held: null, target: null, timer: 0, keysHeld: {}, btnDir: 0, hover: null, wins: [], pending: [], settle: 0, slipAt: 2, startRope: 0, startX: 0, reveal: null, motorAt: 0, ticked: 0, jitter: 0, flash: 0 };

const clawPrizeDef = id => CLAW_MACHINE.prizes.find(p => p.id === id);
function clawItemInfo(def) {   // 獎品要顯示的名字、圖、說明（服裝和物品的資料放在不同地方）
  if (def.costume) { const it = costumeItem(def.id) || {}; return { name: it.name || def.id, image: it.slot ? costumeIconSrc(it) : '', kind: '頭飾（服裝）', desc: '戴在頭上的小鳥。贏到之後到衣櫃就能換上，也能送給隊員。' }; }
  const it = (typeof itemById === 'function' && itemById(def.id)) || {};
  return { name: it.name || def.id, image: it.image || '', kind: it.effect || '', desc: it.desc || '' };
}

// ---- 地圖上的位置 ----
const clawSpots = () => costumeSpots((id, t) => CLAW_MACHINE.tiles.includes(id) || /夾娃娃機/.test(t.name || ''), false);
const clawNearPlayer = () => costumeSpotNearPlayer(clawSpots());
function useClawNearPlayer() { const s = clawNearPlayer(); if (!s) return false; openClawMachine(s); return true; }

// ---- 每台機器的資料 ----
function clawRollStock(stock) {   // 依 weight 抽一個可以放的（大獎一台最多一個）
  const pool = CLAW_MACHINE.prizes.filter(p => !(p.tier === 'jackpot' && stock.includes(p.id)));
  let roll = Math.random() * pool.reduce((s, p) => s + p.weight, 0);
  for (const p of pool) { roll -= p.weight; if (roll < 0) return p.id; }
  return pool[0].id;
}
function clawMachineState(spot) {
  const key = ((typeof MAP !== 'undefined' && MAP && MAP.id) || 'map') + ':' + Math.round(spot.x0) + ',' + Math.round(spot.y0);
  const box = clawSave.machines || (clawSave.machines = {});
  let m = box[key];
  if (!m) {
    m = box[key] = { stock: CLAW_MACHINE.prizes.map(p => p.id), credits: 0, plays: 0 };   // 新機器：每種先放一個
    while (m.stock.length < CLAW_MACHINE.stockSize) m.stock.push(clawRollStock(m.stock));
    clawPersist();
  }
  m.stock = m.stock.filter(clawPrizeDef);   // 設定拿掉的獎品就不留在機台裡
  if (m.stock.length < CLAW_MACHINE.restockBelow) { while (m.stock.length < CLAW_MACHINE.stockSize) m.stock.push(clawRollStock(m.stock)); clawPersist(); }
  return m;
}
const clawMoney = () => Math.floor((typeof G !== 'undefined' && G && G.money) || 0);
const clawPityOn = () => !!cw.m && cw.m.plays >= CLAW_MACHINE.pityPlays;

// ---- 物理：膠囊是一顆顆的圓，會滾、會堆 ----
function clawSpawnPrize(id, x, y) {
  const def = clawPrizeDef(id), r = def.r || CLAW_MACHINE.ballR;
  return { id, def, r, x, y, vx: 0, vy: 0, a: (Math.random() - .5) * 1.2, va: 0, chute: false };
}
function clawFitWindow() {   // 機台內部的寬度配合窗口比例，不留黑邊
  const box = cw.el.querySelector('.cw-window'), ratio = box.clientWidth / Math.max(1, box.clientHeight);
  const W = Math.round(Math.max(420, Math.min(760, CW.H * ratio)));
  if (W === CW.W && cw.bg) return;
  CW.W = W; CW.WALL = W - 4;
  cw.canvas.width = W * 2; cw.canvas.height = CW.H * 2;
  cw.bg = clawBuildBg();
}
function clawFillMachine() {   // 打開機器時擺好：先從上面排著落下，模擬一下讓它們堆好
  const stock = [...cw.m.stock].sort(() => Math.random() - .5).sort((a, b) => (clawPrizeDef(a).tier === 'jackpot') - (clawPrizeDef(b).tier === 'jackpot'));   // 大獎擺在最上面，看得到也夾得到
  const gap = CLAW_MACHINE.ballR * 2 + 6, cols = Math.max(5, Math.floor((CW.WALL - CW.CHUTE_X - 40) / gap));
  cw.prizes = stock.map((id, i) => clawSpawnPrize(id, CW.CHUTE_X + 40 + (i % cols) * gap + Math.random() * 6, CW.FLOOR - 30 - Math.floor(i / cols) * (gap + 4)));
  for (let i = 0; i < 420; i++) clawPhysics(1 / 120, true);
  for (const p of cw.prizes) { p.vx = p.vy = p.va = 0; }
}
function clawPhysics(dt, quiet) {
  const list = cw.prizes;
  for (const p of list) {
    if (p === cw.held) continue;
    p.vy += CW.GRAVITY * dt;
    p.x += p.vx * dt; p.y += p.vy * dt; p.a += p.va * dt;
    p.vx *= Math.pow(.42, dt); p.va *= Math.pow(.2, dt);
  }
  for (let it = 0; it < 3; it++) {
    for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
      const a = list[i], b = list[j], dx = b.x - a.x, dy = b.y - a.y, min = a.r + b.r, d2 = dx * dx + dy * dy;
      if (d2 >= min * min || d2 === 0) continue;
      const d = Math.sqrt(d2), nx = dx / d, ny = dy / d, push = min - d;
      const wa = a === cw.held ? 0 : b === cw.held ? 1 : .5, wb = b === cw.held ? 0 : a === cw.held ? 1 : .5;
      a.x -= nx * push * wa; a.y -= ny * push * wa; b.x += nx * push * wb; b.y += ny * push * wb;
      const rel = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
      if (rel < 0) {
        const imp = -rel * 1.08;   // 幾乎不反彈
        a.vx -= nx * imp * wa; a.vy -= ny * imp * wa; b.vx += nx * imp * wb; b.vy += ny * imp * wb;
        a.va += (b.vx - a.vx) * .004; b.va -= (b.vx - a.vx) * .004;
      }
    }
    for (const p of list) if (p !== cw.held) clawWalls(p, quiet, dt);
  }
  cw.prizes = cw.prizes.filter(p => !p.gone);
}
function clawWalls(p, quiet, dt) {
  if (p.gone) return;
  const belowTop = p.y + p.r > CW.CHUTE_TOP;
  if (p.x < CW.CHUTE_X) {   // 出口這一側
    p.chute = true;
    if (p.x - p.r < 4) { p.x = 4 + p.r; p.vx = Math.abs(p.vx) * .3; }
    if (belowTop && p.x + p.r > CW.CHUTE_X - 3) { p.x = CW.CHUTE_X - 3 - p.r; p.vx = -Math.abs(p.vx) * .3; }
    if (!quiet && p.y > CW.FLOOR - 6) { p.gone = true; clawCollect(p); }
    else if (quiet && p.y + p.r > CW.FLOOR) { p.y = CW.FLOOR - p.r; p.vy = 0; }
    return;
  }
  p.chute = false;
  if (belowTop && p.x - p.r < CW.CHUTE_X + 4) { p.x = CW.CHUTE_X + 4 + p.r; p.vx = Math.abs(p.vx) * .3; }
  if (p.x + p.r > CW.WALL) { p.x = CW.WALL - p.r; p.vx = -Math.abs(p.vx) * .3; }
  if (p.y + p.r > CW.FLOOR) {
    p.y = CW.FLOOR - p.r;
    if (p.vy > 0) { if (!quiet && p.vy > 240) clawSound('clawBump', Math.min(1, p.vy / 700) * .5); p.vy = p.vy > 200 ? -p.vy * .22 : 0; }
    p.vx *= Math.pow(.02, dt); p.va = p.vx * .02;
  }
}

// ---- 流程 ----
function clawSound(name, gain = 1, key = name) { if (typeof SFX !== 'undefined') SFX.play(name, gain, 'claw-' + key); }
function clawStopMotor() { if (typeof SFX !== 'undefined') SFX.fadeOut('claw-motor', .06); cw.motorAt = 0; }
function clawMotor() {   // 馬達聲：音檔長 4 秒，快播完就接上一段
  const now = performance.now();
  if (now < cw.motorAt) return;
  cw.motorAt = now + 3800; clawSound('clawMotor', .55, 'motor');
}
function clawBuy(pack) {
  const c = CLAW_MACHINE, cost = pack ? c.packCost : c.playCost, plays = pack ? c.packPlays : 1;
  if (!clawOpen || cw.reveal) return;
  if (clawMoney() < cost) { sfx('error'); clawSay('經費不夠（還差 $' + (cost - clawMoney()).toLocaleString() + '）', 'warn'); return; }
  G.money -= cost; if (typeof updateHUD === 'function') updateHUD();
  cw.m.credits += plays; clawPersist();
  clawSound('clawCoin');
  renderClaw();
  if (cw.phase === 'idle') clawStart();
}
function clawStart() {
  if (cw.phase !== 'idle' || cw.m.credits <= 0 || cw.reveal) return;
  cw.m.credits -= 1; clawPersist();
  cw.phase = 'aim'; cw.timer = CLAW_MACHINE.aimTime; cw.ticked = 0;
  clawSay(clawPityOn() ? '保夾中！這一爪碰到就夾得起來' : '←→ 移動爪子，空白鍵下爪', clawPityOn() ? 'pity' : '');
  sfx('switch');
  renderClaw();
}
function clawDrop() {
  if (cw.phase !== 'aim') return;
  cw.phase = 'descend'; cw.vx = 0; cw.btnDir = 0; clawStopMotor(); clawStickPose();
  clawSound('clawDrop', .8, 'motor');
  clawSay('下爪……');
  renderClaw();
}
function clawContact() {   // 爪尖碰到哪一顆：回傳 true 就停止往下
  const tx = cw.x + Math.sin(cw.swing) * cw.rope, ty = CW.RAIL_Y + Math.cos(cw.swing) * cw.rope;
  if (ty >= CW.FLOOR - 4) return true;
  return cw.prizes.some(p => !p.chute && Math.hypot(tx - p.x, ty - p.y) < p.r * .82);
}
function clawTryGrab() {
  const tx = cw.x + Math.sin(cw.swing) * cw.rope, ty = CW.RAIL_Y + Math.cos(cw.swing) * cw.rope;
  let best = null, bestD = Infinity;
  for (const p of cw.prizes) {
    if (p.chute) continue;
    const dx = Math.abs(tx - p.x);
    if (dx < p.r + 10 && p.y - p.r < ty + 12 && dx < bestD) { best = p; bestD = dx; }
    if (Math.hypot(tx - p.x, ty - p.y) < p.r + 26) { p.vx += Math.sign(p.x - tx || 1) * 70; p.vy -= 40; }   // 爪子戳進去，旁邊的會被推開
  }
  clawSound('clawGrab');
  if (!best) { clawSay('什麼都沒夾到'); cw.held = null; return; }
  const aim = Math.max(0, 1 - bestD / (best.r + 10)), chance = clawPityOn() ? 1 : best.def.grip * (CLAW_MACHINE.minAim + (1 - CLAW_MACHINE.minAim) * aim), roll = Math.random();
  cw.held = best; best.vx = best.vy = 0;
  cw.startRope = cw.rope; cw.startX = cw.x;
  // 沒夾穩：差越多掉得越早；這裡先決定好，途中爪子才能抖給玩家看
  cw.slipAt = roll < chance ? 2 : Math.max(.08, Math.min(.97, .9 - (roll - chance) * 1.1 + (Math.random() - .5) * .22));
  clawSay(clawPityOn() ? '保夾！夾得死緊' : aim > .75 ? '對得很準！' : aim > .35 ? '夾到了……' : '只夾到一點邊');
}
function clawLetGo(soundName) {
  const p = cw.held; if (!p) return;
  cw.held = null;
  p.vx = cw.vx * .6 + cw.swingV * 18; p.vy = 30; p.va = (Math.random() - .5) * 5;
  if (soundName) clawSound(soundName);
}
function clawCollect(p) {   // 掉進出口：真的拿到了
  const m = cw.m, idx = m.stock.indexOf(p.id);
  if (idx >= 0) m.stock.splice(idx, 1);
  m.plays = 0;
  const info = clawItemInfo(p.def);
  let isNew = false, note = '';
  if (p.def.costume) { isNew = costumeGrant(p.id); note = '收進衣櫃了，到衣櫃就能換上'; cw.pending.push({ costume: true, name: info.name, image: info.image }); }
  else {
    isNew = !(typeof itemIntroSeen !== 'undefined' && itemIntroSeen.has('item:' + p.id));
    if (supplyGain(p.id, 1, true)) note = '已經放進背包';
    else { const pl = G.player; (G.groundItems = G.groundItems || []).push({ id: p.id, qty: 1, x: pl.x, y: pl.y + 6 }); note = '背包滿了，放在你腳邊'; }
    cw.pending.push({ id: p.id });
  }
  clawSave.won = clawSave.won || {}; clawSave.won[p.id] = (clawSave.won[p.id] || 0) + 1;
  clawPersist();
  if (typeof updateHUD === 'function') updateHUD();
  if (typeof saveGame === 'function') saveGame();
  cw.wins.push({ def: p.def, info, isNew, note });
  cw.flash = 1;
  clawSound('clawChute');
  renderClaw();
}
function clawEndRound() {
  cw.phase = 'idle'; cw.held = null; cw.open = 1; cw.vx = 0; clawStopMotor();
  if (cw.wins.length) clawShowReveal();
  else {
    cw.m.plays = Math.min(CLAW_MACHINE.pityPlays, cw.m.plays + 1); clawPersist();
    const on = clawPityOn();
    clawSound(on ? 'clawPity' : 'clawMiss', on ? 1 : .8);
    clawSay(on ? '保夾開啟！下一爪碰到就夾得起來' : cw.m.credits > 0 ? '可惜！按空白鍵再來一次' : '可惜！投幣再試一次', on ? 'pity' : '');
  }
  clawRestock();
  renderClaw();
}
function clawRestock() {
  const m = cw.m;
  if (m.stock.length >= CLAW_MACHINE.restockBelow) return;
  while (m.stock.length < CLAW_MACHINE.stockSize) {
    const id = clawRollStock(m.stock); m.stock.push(id);
    cw.prizes.push(clawSpawnPrize(id, CW.CHUTE_X + 40 + Math.random() * (CW.WALL - CW.CHUTE_X - 80), -40 - Math.random() * 300));   // 從上面掉下來
  }
  clawPersist();
  if (!cw.wins.length) clawSay('機台補貨了');
}

// ---- 每一格的狀態更新 ----
function clawTick(dt) {
  const c = CLAW_MACHINE;
  if (cw.phase === 'aim') {
    const dir = cw.btnDir || ((cw.keysHeld.right ? 1 : 0) - (cw.keysHeld.left ? 1 : 0)), want = dir * c.moveSpeed;
    cw.vx += Math.sign(want - cw.vx) * Math.min(Math.abs(want - cw.vx), 900 * dt);
    cw.x += cw.vx * dt;
    if (cw.x < CW.AIM_MIN) { cw.x = CW.AIM_MIN; cw.vx = 0; }   // 不能移到出口上方
    if (cw.x > CW.WALL - 18) { cw.x = CW.WALL - 18; cw.vx = 0; }
    if (dir) clawMotor(); else if (cw.motorAt) clawStopMotor();
    const before = Math.ceil(cw.timer); cw.timer -= dt;
    if (Math.ceil(cw.timer) !== before) { if (cw.timer <= 5 && cw.timer > 0) clawSound('clawTick', .7); clawRenderLed(); }
    if (cw.timer <= 0) { cw.timer = 0; clawSay('時間到！'); clawDrop(); }
  } else if (cw.phase === 'descend') {
    cw.rope += 175 * dt;
    if (clawContact()) { cw.phase = 'grab'; cw.settle = 0; if (typeof SFX !== 'undefined') SFX.fadeOut('claw-motor', .05); }
  } else if (cw.phase === 'grab') {
    cw.settle += dt; cw.open = Math.max(0, 1 - cw.settle / .32);
    if (cw.settle >= .32 && cw.target !== 'done') { cw.target = 'done'; clawTryGrab(); }
    if (cw.settle >= .62) { cw.target = null; cw.phase = 'lift'; clawSound('clawLift', .7, 'motor'); }
  } else if (cw.phase === 'lift') {
    cw.rope = Math.max(CW.ROPE_MIN, cw.rope - 120 * dt);
    const span = Math.max(1, cw.startRope - CW.ROPE_MIN), prog = (1 - (cw.rope - CW.ROPE_MIN) / span) * .55;
    if (cw.held && prog >= cw.slipAt) { clawLetGo('clawSlip'); clawSay('啊！掉了！'); }
    if (cw.rope <= CW.ROPE_MIN) { cw.phase = 'carry'; cw.startX = cw.x; clawSound('clawMotor', .5, 'motor'); cw.motorAt = performance.now() + 3800; }
  } else if (cw.phase === 'carry') {
    const dist = cw.x - CW.HOME_X, sp = Math.min(c.moveSpeed, 40 + dist * 3.2);
    cw.vx = -sp; cw.x = Math.max(CW.HOME_X, cw.x - sp * dt);
    const span = Math.max(1, cw.startX - CW.HOME_X), prog = .55 + .45 * (1 - (cw.x - CW.HOME_X) / span);
    if (cw.held && prog >= cw.slipAt) { clawLetGo('clawSlip'); clawSay(cw.x < CW.CHUTE_X ? '掉進去了？！' : '差一點！'); }
    if (cw.x <= CW.HOME_X + .5) { cw.vx = 0; cw.phase = 'release'; cw.settle = 0; clawStopMotor(); }
  } else if (cw.phase === 'release') {
    cw.settle += dt; cw.open = Math.min(1, cw.settle / .28);
    if (cw.held && cw.settle > .12) clawLetGo();
    if (cw.settle >= .3) { cw.phase = 'settle'; cw.settle = 0; }
  } else if (cw.phase === 'settle') {
    cw.settle += dt;
    cw.vx = cw.x < CW.AIM_MIN ? 110 : 0; cw.x = Math.min(CW.AIM_MIN, cw.x + cw.vx * dt);   // 放完東西回到待命的位置
    const flying = cw.prizes.some(p => p.chute);
    if (!flying && cw.settle > .25 && cw.x >= CW.AIM_MIN) clawEndRound();
  }
  // 鐘擺：爪子跟不上吊架的加速度就會晃；放越長晃得越大
  const L = Math.max(70, cw.rope), prevV = cw._pv || 0, acc = (cw.vx - prevV) / dt; cw._pv = cw.vx;
  cw.swingV += (-(900 / L) * Math.sin(cw.swing) - 1.15 * cw.swingV - acc / L * .32) * dt;
  cw.swing = Math.max(-.2, Math.min(.2, cw.swing + cw.swingV * dt));
  if (Math.abs(cw.swing) >= .2) cw.swingV *= .5;
  cw.jitter = cw.held && cw.slipAt <= 1 ? Math.max(0, Math.min(1, 1.25 - (cw.slipAt - clawJourney()) * 3.2)) : 0;
  if (cw.held) {
    const tx = cw.x + Math.sin(cw.swing) * cw.rope, ty = CW.RAIL_Y + Math.cos(cw.swing) * cw.rope, sh = cw.jitter * 2.4;
    const p = cw.held; p.x = tx + (Math.random() - .5) * sh; p.y = ty - p.r + 6 + (Math.random() - .5) * sh * .5; p.vx = p.vy = 0;
  }
  if (cw.flash > 0) cw.flash = Math.max(0, cw.flash - dt * 2);
}
function clawJourney() {   // 夾起來之後走到哪了：0～.55 往上、.55～1 往出口
  if (cw.phase === 'lift') return (1 - (cw.rope - CW.ROPE_MIN) / Math.max(1, cw.startRope - CW.ROPE_MIN)) * .55;
  if (cw.phase === 'carry') return .55 + .45 * (1 - (cw.x - CW.HOME_X) / Math.max(1, cw.startX - CW.HOME_X));
  return 0;
}
function clawLoop(ts) {
  if (!clawOpen) return;
  const dt = Math.min(.05, (ts - cw.last) / 1000 || 0); cw.last = ts;
  cw.acc += dt;
  while (cw.acc >= 1 / 120) { cw.acc -= 1 / 120; clawTick(1 / 120); clawPhysics(1 / 120); }
  clawDraw(ts / 1000);
  cw.raf = requestAnimationFrame(clawLoop);
}

// ---- 畫機台內部 ----
function clawBuildBg() {   // 不會動的背景先畫好一張（窗景是遊戲裡機台圖的淡藍色）
  const b = document.createElement('canvas'); b.width = CW.W * 2; b.height = CW.H * 2;
  const g = b.getContext('2d'); g.scale(2, 2);
  const sky = g.createLinearGradient(0, 0, 0, CW.H); sky.addColorStop(0, '#c6dcf7'); sky.addColorStop(1, '#94b6e6');
  g.fillStyle = sky; g.fillRect(0, 0, CW.W, CW.H);
  g.fillStyle = 'rgba(255,255,255,.16)';   // 背板的格子
  for (let y = 44; y < CW.FLOOR; y += 44) for (let x = (y / 44) % 2 ? 0 : 44; x < CW.W; x += 88) g.fillRect(x, y, 44, 44);
  g.fillStyle = '#6f75cf'; g.fillRect(0, CW.FLOOR, CW.W, CW.H - CW.FLOOR);   // 地板
  g.fillStyle = '#8c90e0'; g.fillRect(0, CW.FLOOR, CW.W, 4);
  // 出口（左邊的洞＋壓克力擋板）
  g.fillStyle = '#34386b'; g.fillRect(0, CW.CHUTE_TOP, CW.CHUTE_X, CW.H - CW.CHUTE_TOP);
  g.fillStyle = '#1b1f46'; g.fillRect(6, CW.CHUTE_TOP + 8, CW.CHUTE_X - 12, CW.H - CW.CHUTE_TOP - 8);
  g.fillStyle = '#ffd86e'; g.font = '700 15px "Microsoft JhengHei", sans-serif'; g.textAlign = 'center'; g.fillText('出口', CW.CHUTE_X / 2, CW.CHUTE_TOP - 28);
  g.beginPath(); g.moveTo(CW.CHUTE_X / 2 - 9, CW.CHUTE_TOP - 20); g.lineTo(CW.CHUTE_X / 2 + 9, CW.CHUTE_TOP - 20); g.lineTo(CW.CHUTE_X / 2, CW.CHUTE_TOP - 8); g.closePath(); g.fill();
  g.fillStyle = '#e7ecff'; g.fillRect(CW.CHUTE_X - 3, CW.CHUTE_TOP, 7, CW.FLOOR - CW.CHUTE_TOP);
  g.fillStyle = '#7f86c9'; g.fillRect(CW.CHUTE_X + 2, CW.CHUTE_TOP, 2, CW.FLOOR - CW.CHUTE_TOP);
  // 軌道
  g.fillStyle = '#23274f'; g.fillRect(0, 0, CW.W, CW.RAIL_Y - 4);
  g.fillStyle = '#8e93a8'; g.fillRect(0, CW.RAIL_Y - 4, CW.W, 5);
  g.fillStyle = '#c9cdda'; g.fillRect(0, CW.RAIL_Y - 4, CW.W, 2);
  return b;
}
function clawDrawPrize(g, p, t) {
  const tier = CW_TIER[p.def.tier] || CW_TIER.common, img = cw.imgs[p.id];
  g.save(); g.translate(p.x, p.y);
  if (cw.hover === p.id) { g.strokeStyle = '#fff'; g.lineWidth = 3; g.globalAlpha = .65 + Math.sin(t * 7) * .35; g.beginPath(); g.arc(0, 0, p.r + 4, 0, 7); g.stroke(); g.globalAlpha = 1; }
  if (p.def.tier === 'jackpot') { g.fillStyle = 'rgba(255,226,130,' + (.25 + Math.sin(t * 3) * .12) + ')'; g.beginPath(); g.arc(0, 0, p.r + 7, 0, 7); g.fill(); }
  g.fillStyle = tier.tint; g.beginPath(); g.arc(0, 0, p.r, 0, 7); g.fill();
  if (img && img.complete && img.naturalWidth) {
    const box = p.r * 1.42, s = box / Math.max(img.naturalWidth, img.naturalHeight), w = img.naturalWidth * s, h = img.naturalHeight * s;
    g.save(); g.rotate(p.a * .45);
    g.imageSmoothingEnabled = s * 2 < 1;   // 小圖放大時保持像素感；大圖縮小才平滑
    g.drawImage(img, -w / 2, -h / 2, w, h);
    g.restore();
  }
  // 膠囊外殼：接縫、亮面、外框
  g.rotate(p.a);
  g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(-p.r, 0); g.lineTo(p.r, 0); g.stroke();
  g.rotate(-p.a);
  g.strokeStyle = tier.line; g.lineWidth = 2.5; g.beginPath(); g.arc(0, 0, p.r - 1, 0, 7); g.stroke();
  g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 3; g.beginPath(); g.arc(0, 0, p.r - 6, Math.PI * 1.08, Math.PI * 1.42); g.stroke();
  g.restore();
}
function clawDrawClaw(g, t) {
  const pity = clawPityOn(), metal = pity ? '#f5c14e' : '#9aa0b5', shade = pity ? '#b97a12' : '#5e6480', ink = '#191d3f';
  const tx = cw.x + Math.sin(cw.swing) * cw.rope, ty = CW.RAIL_Y + Math.cos(cw.swing) * cw.rope, hubY = ty - 44;
  // 吊繩、吊架
  g.strokeStyle = ink; g.lineWidth = 3; g.beginPath(); g.moveTo(cw.x, CW.RAIL_Y); g.lineTo(tx, hubY); g.stroke();
  g.fillStyle = ink; g.fillRect(cw.x - 21, CW.RAIL_Y - 6, 42, 16);
  g.fillStyle = '#6a6fa8'; g.fillRect(cw.x - 18, CW.RAIL_Y - 3, 36, 10);
  // 爪子：張開程度 open；夾著東西時貼著膠囊
  const r = cw.held ? cw.held.r : 0, spreadTip = cw.held ? r * .62 : 7 + cw.open * 25, spreadMid = cw.held ? r + 5 : 16 + cw.open * 22, shake = cw.jitter * 2 * Math.sin(t * 60);
  const prong = dir => {
    g.beginPath(); g.moveTo(tx + dir * 7, hubY + 6);
    g.quadraticCurveTo(tx + dir * (spreadMid + 4) + shake, hubY + 14, tx + dir * spreadMid + shake, ty - 16);
    g.quadraticCurveTo(tx + dir * (spreadMid - 2) + shake, ty - 4, tx + dir * spreadTip + shake, ty);
    g.strokeStyle = ink; g.lineWidth = 9; g.lineCap = 'round'; g.stroke();
    g.strokeStyle = metal; g.lineWidth = 5; g.stroke();
  };
  prong(-1); prong(1);
  g.lineCap = 'butt';
  g.fillStyle = ink; g.fillRect(tx - 15, hubY - 6, 30, 16);
  g.fillStyle = metal; g.fillRect(tx - 12, hubY - 3, 24, 10);
  g.fillStyle = shade; g.fillRect(tx - 12, hubY + 3, 24, 4);
}
function clawDraw(t) {
  const g = cw.ctx;
  g.setTransform(2, 0, 0, 2, 0, 0);
  g.drawImage(cw.bg, 0, 0, CW.W, CW.H);
  if (cw.phase === 'aim') {   // 瞄準線：現在下爪大概落在哪
    const tx = cw.x + Math.sin(cw.swing) * (CW.FLOOR - CW.RAIL_Y);
    g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 2; g.setLineDash([3, 8]); g.beginPath(); g.moveTo(cw.x, 70); g.lineTo(tx, CW.FLOOR); g.stroke(); g.setLineDash([]);
    g.fillStyle = 'rgba(20,24,70,.28)'; g.beginPath(); g.ellipse(tx, CW.FLOOR, 16, 4, 0, 0, 7); g.fill();
  }
  for (const p of cw.prizes) if (p !== cw.held) clawDrawPrize(g, p, t);
  if (cw.held) clawDrawPrize(g, cw.held, t);
  clawDrawClaw(g, t);
  // 出口前面的矮牆蓋住掉進去的膠囊下半部；最上面再蓋一層玻璃反光
  g.fillStyle = '#34386b'; g.fillRect(0, CW.FLOOR - 4, CW.CHUTE_X - 3, CW.H - CW.FLOOR + 4);
  if (cw.flash > 0) { g.fillStyle = 'rgba(255,226,130,' + cw.flash * .85 + ')'; g.fillRect(0, CW.CHUTE_TOP, CW.CHUTE_X, CW.H - CW.CHUTE_TOP); }
  g.fillStyle = 'rgba(255,255,255,.12)';
  const k = CW.W / 400;   // 玻璃反光跟著機台寬度
  g.beginPath(); g.moveTo(236 * k, 0); g.lineTo(318 * k, 0); g.lineTo(90 * k, CW.H); g.lineTo(8 * k, CW.H); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(336 * k, 0); g.lineTo(352 * k, 0); g.lineTo(124 * k, CW.H); g.lineTo(108 * k, CW.H); g.closePath(); g.fill();
}

// ---- 介面 ----
function clawGripPips(grip) {   // 夾力：幾格綠燈（指著膠囊時的說明）
  const n = Math.max(1, Math.round(grip * 5));
  return '<span class="cw-pips" aria-label="夾力 ' + n + '／5">' + [1, 2, 3, 4, 5].map(i => '<i class="' + (i <= n ? 'on' : '') + '"></i>').join('') + '</span>';
}
function buildClaw() {
  const el = cw.el = document.createElement('div');
  const c = CLAW_MACHINE;
  el.id = 'clawMachine'; el.className = 'hidden';
  el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', '夾娃娃機');
  el.innerHTML = '<section class="cw-card"><header class="cw-head"><div class="cw-icon-box" aria-hidden="true"><img src="images/street/street-claw-machine.png" alt=""></div>'
    + '<div class="cw-title"><h2>夾娃娃機</h2><p>花經費下爪，夾到的東西直接放進背包。指著膠囊可以看裡面是什麼。</p></div>'
    + '<span class="cw-money"><i>經費</i><b></b></span><button type="button" class="cw-close" aria-label="關閉（Esc）">×</button></header>'
    + '<div class="cw-body"><div class="cw-cabinet"><div class="cw-marquee"><span>NATURALWIND</span></div>'
    + '<div class="cw-window"><canvas></canvas><div class="cw-tip hidden" role="tooltip"></div></div>'
    + '<div class="cw-deck"><div class="cw-led"><span class="cw-led-msg" role="status"></span>'
    + '<span class="cw-pity" title="連續 ' + c.pityPlays + ' 次沒拿到東西，下一爪碰到就夾得起來；拿到任何東西都會重新累積"><span class="cw-pity-top"><i>保夾</i><b class="cw-pity-count"></b></span><span class="cw-pity-bar">' + Array.from({ length: c.pityPlays }, () => '<i></i>').join('') + '</span></span>'
    + '<span class="cw-led-num"><i>次數</i><b class="cw-credits"></b></span><span class="cw-led-num"><i>時間</i><b class="cw-time"></b></span></div>'
    + '<div class="cw-controls"><div class="cw-move"><button type="button" class="cw-arrow" data-move="-1" aria-label="往左">◀</button><span class="cw-stick" aria-hidden="true"><i></i></span><button type="button" class="cw-arrow" data-move="1" aria-label="往右">▶</button></div>'
    + '<div class="cw-coins"><button type="button" data-buy="1"><span>投 1 次</span><b>$' + c.playCost + '</b></button>'
    + '<button type="button" data-buy="pack"><span>投 ' + c.packPlays + ' 次</span><b>$' + c.packCost + '</b><em>省 $' + (c.playCost * c.packPlays - c.packCost) + '</em></button></div>'
    + '<button type="button" class="cw-go"></button></div></div></div>'
    + '<p class="cw-keys"><kbd>←</kbd><kbd>→</kbd> 移動　<kbd>空白鍵</kbd> 開始／下爪　<kbd>Enter</kbd> 投 1 次　<kbd>Esc</kbd> 離開　爪子移動時會晃，停一下再下爪比較準</p></div>'
    + '<div class="cw-reveal hidden" role="status"><i class="cw-rays"></i><div class="cw-reveal-box"><small class="cw-reveal-tag"></small><span class="cw-reveal-img"><img alt=""></span><h3></h3><p class="cw-reveal-effect"></p><p class="cw-reveal-note"></p><button type="button" class="cw-reveal-ok">收下 <kbd>空白鍵</kbd></button></div></div>'
    + '</section>';
  document.getElementById('wrap').appendChild(el);
  cw.canvas = el.querySelector('canvas'); cw.ctx = cw.canvas.getContext('2d');
  for (const def of c.prizes) { const img = new Image(); img.src = clawItemInfo(def).image; cw.imgs[def.id] = img; }
  el.querySelector('.cw-close').addEventListener('click', closeClawMachine);
  el.querySelector('.cw-go').addEventListener('click', clawPressGo);
  el.querySelector('.cw-reveal-ok').addEventListener('click', clawDismissReveal);
  el.querySelectorAll('[data-buy]').forEach(b => b.addEventListener('click', () => clawBuy(b.dataset.buy === 'pack')));
  el.querySelectorAll('[data-move]').forEach(b => {   // 按住箭頭才會動
    const dir = Number(b.dataset.move), stop = () => { if (cw.btnDir === dir) cw.btnDir = 0; clawStickPose(); };
    b.addEventListener('pointerdown', e => { e.preventDefault(); cw.btnDir = dir; clawStickPose(); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(n => b.addEventListener(n, stop));
  });
  cw.canvas.addEventListener('pointermove', clawHoverAt);
  cw.canvas.addEventListener('pointerleave', () => clawShowTip(null));
}
function clawHoverAt(e) {   // 指到膠囊：那顆發光，旁邊顯示裡面是什麼
  const rect = cw.canvas.getBoundingClientRect(), scale = Math.min(rect.width / CW.W, rect.height / CW.H);
  const x = (e.clientX - rect.left - (rect.width - CW.W * scale) / 2) / scale, y = (e.clientY - rect.top - (rect.height - CW.H * scale) / 2) / scale;
  const hit = cw.prizes.find(p => Math.hypot(p.x - x, p.y - y) <= p.r);
  clawShowTip(hit, e.clientX - rect.left, e.clientY - rect.top);
}
function clawShowTip(prize, x, y) {
  const tip = cw.el.querySelector('.cw-tip');
  cw.hover = prize ? prize.id : null;
  if (!prize) { tip.classList.add('hidden'); cw.tipId = null; return; }
  if (cw.tipId !== prize.id) {
    cw.tipId = prize.id;
    const info = clawItemInfo(prize.def), tier = CW_TIER[prize.def.tier] || CW_TIER.common;
    tip.innerHTML = '<b></b><small></small><span class="cw-tip-grip">夾力 ' + clawGripPips(prize.def.grip) + '</span><p></p>';
    tip.querySelector('b').textContent = info.name;
    tip.querySelector('small').textContent = tier.name + (info.kind ? '・' + info.kind : '');
    tip.querySelector('p').textContent = info.desc;
    tip.classList.remove('hidden');
  }
  const box = cw.canvas.getBoundingClientRect(), w = tip.offsetWidth, h = tip.offsetHeight;
  tip.style.left = Math.max(6, Math.min(box.width - w - 6, x - w / 2)) + 'px';
  tip.style.top = Math.max(6, y - h - 16) + 'px';
}
function clawSay(text, tone = '') { cw.msg = text; cw.msgTone = tone; clawRenderLed(); }
function clawRenderLed() {
  if (!cw.el) return;
  const msg = cw.el.querySelector('.cw-led-msg');
  msg.textContent = cw.msg || ''; msg.className = 'cw-led-msg ' + (cw.msgTone || '');
  cw.el.querySelector('.cw-credits').textContent = cw.m ? cw.m.credits : 0;
  const time = cw.el.querySelector('.cw-time'), aiming = cw.phase === 'aim', sec = Math.ceil(cw.timer);
  time.textContent = aiming ? sec : '--'; time.classList.toggle('low', aiming && sec <= 5);
}
function renderClaw() {
  if (!cw.el || !cw.m) return;
  const el = cw.el, c = CLAW_MACHINE, m = cw.m, busy = !['idle', 'aim'].includes(cw.phase), pity = clawPityOn();
  el.querySelector('.cw-money b').textContent = '$' + clawMoney().toLocaleString();
  el.querySelector('.cw-card').classList.toggle('pity', pity);
  el.querySelectorAll('[data-buy]').forEach(b => { const cost = b.dataset.buy === 'pack' ? c.packCost : c.playCost; b.classList.toggle('poor', clawMoney() < cost); });
  const go = el.querySelector('.cw-go'), aim = cw.phase === 'aim';
  go.textContent = aim ? '下爪' : busy ? '夾取中' : '開始';
  go.disabled = busy || (cw.phase === 'idle' && m.credits <= 0);
  go.classList.toggle('ready', aim || (cw.phase === 'idle' && m.credits > 0));
  el.querySelectorAll('[data-move]').forEach(b => { b.disabled = !aim; });
  el.querySelector('.cw-close').disabled = busy || aim;
  el.querySelector('.cw-pity-count').textContent = pity ? '開啟！' : Math.min(m.plays, c.pityPlays) + '/' + c.pityPlays;
  el.querySelectorAll('.cw-pity-bar i').forEach((seg, i) => seg.classList.toggle('on', i < m.plays));
  el.querySelector('.cw-pity').classList.toggle('on', pity);
  clawRenderLed();
}
function clawStickPose() {
  const stick = cw.el && cw.el.querySelector('.cw-stick'); if (!stick) return;
  const dir = cw.phase === 'aim' ? (cw.btnDir || ((cw.keysHeld.right ? 1 : 0) - (cw.keysHeld.left ? 1 : 0))) : 0;
  stick.dataset.dir = dir;
}
function clawPressGo() { if (cw.reveal) return; if (cw.phase === 'aim') clawDrop(); else if (cw.phase === 'idle') { if (cw.m.credits > 0) clawStart(); else { sfx('error'); clawSay('先投幣才能開始', 'warn'); } } }

// ---- 夾到了 ----
function clawShowReveal() {
  const win = cw.wins.shift(); if (!win) return;
  cw.reveal = win;
  const box = cw.el.querySelector('.cw-reveal');
  box.className = 'cw-reveal t-' + win.def.tier;
  box.querySelector('.cw-reveal-tag').textContent = (win.def.tier === 'jackpot' ? '大獎！！' : '夾到了！') + (win.isNew ? '　NEW' : '');
  const img = box.querySelector('.cw-reveal-img img'); img.src = win.info.image;
  img.classList.toggle('tiny', Math.max(cw.imgs[win.def.id].naturalWidth, cw.imgs[win.def.id].naturalHeight) <= 40);
  box.querySelector('h3').textContent = win.info.name;
  box.querySelector('.cw-reveal-effect').textContent = win.info.kind;
  box.querySelector('.cw-reveal-note').textContent = win.note;
  if (win.def.tier === 'jackpot') clawSound('gachaSSR', .9, 'win');
  else if (win.def.tier === 'rare') clawSound('gachaSR', .9, 'win');
  else clawSound('clawWin', 1, 'win');
  clawSay(cw.m.credits > 0 ? '按空白鍵繼續夾' : '投幣再來一次');
}
function clawDismissReveal() {
  if (!cw.reveal) return;
  cw.reveal = null; cw.el.querySelector('.cw-reveal').classList.add('hidden');
  sfx('button');
  if (cw.wins.length) clawShowReveal();
  renderClaw();
}

// ---- 開關 ----
function openClawMachine(spot) {
  if (clawOpen) return;
  if (!cw.el) buildClaw();
  clawOpen = true;
  if (typeof keys !== 'undefined') Object.keys(keys).forEach(k => { keys[k] = false; });
  cw.spot = spot; cw.m = clawMachineState(spot);
  Object.assign(cw, { phase: 'idle', x: CW.AIM_MIN, vx: 0, _pv: 0, rope: CW.ROPE_MIN, swing: 0, swingV: 0, open: 1, held: null, target: null, timer: 0, keysHeld: {}, btnDir: 0, hover: null, tipId: null, wins: [], pending: [], reveal: null, flash: 0, acc: 0, last: performance.now() });
  cw.el.classList.remove('hidden'); cw.el.querySelector('.cw-reveal').classList.add('hidden'); cw.el.querySelector('.cw-tip').classList.add('hidden');
  clawSay(cw.m.credits > 0 ? '還有 ' + cw.m.credits + ' 次，按空白鍵開始' : '投幣開始');
  renderClaw();
  clawFitWindow();   // 要等視窗顯示、文字都填好才量得準大小
  clawFillMachine();
  SFX.play('vendingOpen', .8, 'claw-open');
  cw.raf = requestAnimationFrame(clawLoop);
}
function closeClawMachine() {
  if (!clawOpen || cw.reveal || cw.phase !== 'idle') return;
  clawOpen = false; cancelAnimationFrame(cw.raf); clawStopMotor();
  cw.el.classList.add('hidden');
  sfx('switch');
  // 拿到的東西關掉才跳提示（第一次拿到的說明視窗也在這時候才跳，不會蓋住機台）
  for (const p of cw.pending) { if (typeof showItemPickupNotice !== 'function') break; if (p.costume) showItemPickupNotice({ name: p.name, image: p.image }, 1); else showItemPickupNotice(p.id, 1); }
  cw.pending = [];
}
// 開著的時候：鍵盤都給機台，不要傳給遊戲
window.addEventListener('keydown', e => {
  if (!clawOpen) return;
  const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  if (k === ' ' || k === 'Enter' || k.startsWith('Arrow')) e.preventDefault();
  e.stopImmediatePropagation();
  if (k === 'ArrowLeft' || k === 'a') { cw.keysHeld.left = true; clawStickPose(); }
  if (k === 'ArrowRight' || k === 'd') { cw.keysHeld.right = true; clawStickPose(); }
  if (e.repeat) return;   // 打開機台那一下空白鍵按著不放，不要直接開始
  if (cw.reveal) { if (k === ' ' || k === 'Enter' || k === 'Escape') clawDismissReveal(); return; }
  if (k === ' ') clawPressGo();
  else if (k === 'Enter' && cw.phase === 'idle') clawBuy(false);
  else if (k === 'Escape') { if (cw.phase === 'idle') closeClawMachine(); else clawSay('夾完這一次才能離開', 'warn'); }
}, { capture: true });
window.addEventListener('keyup', e => {
  if (!clawOpen) return;
  const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  if (k === 'ArrowLeft' || k === 'a') cw.keysHeld.left = false;
  if (k === 'ArrowRight' || k === 'd') cw.keysHeld.right = false;
  clawStickPose();
  e.stopImmediatePropagation();
}, { capture: true });
