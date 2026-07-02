/* ===== 台北地下災害應變中心 — 塔防主邏輯 =====
   遊戲的核心程式：畫面繪製、怪物生成/移動、哨兵攻擊、輸入操作、勝負判定。
   數值請去 data/balance.js 改；格線設定在 js/config.js；尋路在 js/pathfinding.js。
*/
const cv = document.getElementById('cv');
const ctx = cv.getContext('2d');

// ---- 地板貼圖（後室地板）----
const floorImg = new Image();
let floorPattern = null;
floorImg.onload = () => { floorPattern = ctx.createPattern(floorImg, 'repeat'); };
floorImg.src = 'background/Back-room-floor.png';

// ---- 遊戲狀態 ----
let G, editMode = false;
function newGame() {
  G = {
    phase: 'ready', money: START.money, lives: START.lives,
    guide: START.guide, guideMax: START.guideMax, guideRegen: START.guideRegen,
    grid: {}, towers: [], obstacles: [], enemies: [], effects: [],
    selType: null, waveIndex: 0, waves: buildWaves(),
    spawnQueue: [], spawnTimer: 0, curGap: 0.9, betweenWaves: 0,
    running: false, over: false, won: false,
  };
  computeFlow();
  updateHUD();
}
function buildWaves() {
  const w = [], W = WAVE_CFG;
  for (let i = 0; i < W.total; i++) {
    w.push({
      count: W.baseCount + i * W.addCount,
      hp: W.baseHp + i * W.addHp,
      speed: W.baseSpeed + i * W.addSpeed,
      reward: W.reward,
      gap: W.baseGap - i * W.subGap,
    });
  }
  return w;
}
function startWave() {
  const w = G.waves[G.waveIndex];
  G.spawnQueue = [];
  for (let i = 0; i < w.count; i++) G.spawnQueue.push({ hp: w.hp, speed: w.speed, reward: w.reward });
  G.spawnTimer = 0; G.curGap = w.gap;
}
function validSpawnCols() {
  const cols = [];
  for (let c = 0; c < COLS; c++) if (!isWall(c, SPAWN_ROW) && isFinite(flowAt(c, SPAWN_ROW))) cols.push(c);
  return cols;
}

// ---- 佈署物件查詢 ----
const buildAt = (c, r) => G.grid[c + ',' + r];
const barrierAt = (c, r) => { const o = G.grid[c + ',' + r]; return (o && o.kind === 'obstacle') ? o : null; };
function removeBarrier(o) { delete G.grid[o.c + ',' + o.r]; G.obstacles = G.obstacles.filter(x => x !== o); }

// ---- 輸入：選擇要放置的哨兵/障礙物 ----
document.querySelectorAll('.tbtn[data-type]').forEach(btn => {
  btn.addEventListener('click', () => {
    if (editMode) return;
    const t = btn.dataset.type;
    G.selType = (G.selType === t) ? null : t;
    document.querySelectorAll('.tbtn[data-type]').forEach(b => b.classList.toggle('sel', b.dataset.type === G.selType));
  });
});

// ---- 輸入：編輯地圖模式 ----
const editBtn = document.getElementById('editBtn');
editBtn.addEventListener('click', () => {
  editMode = !editMode;
  editBtn.classList.toggle('on', editMode);
  if (editMode) {
    editBtn.innerHTML = '✅ 完成編輯<small>回到遊戲</small>';
    G.selType = null; document.querySelectorAll('.tbtn[data-type]').forEach(b => b.classList.remove('sel'));
    G.running = false; hideOverlay();
  } else {
    editBtn.innerHTML = '🏗️ 編輯地圖<small>放／移除固定牆（打不破）</small>';
    if (G.phase === 'ready') showStart();
    else if (G.phase === 'playing') G.running = true;
    else if (G.phase === 'won') winOverlay();
    else if (G.phase === 'lost') loseOverlay();
  }
});

// ---- 輸入：點畫面（放置 / 疏導 / 編輯牆）----
cv.addEventListener('click', e => {
  const rect = cv.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (cv.width / rect.width);
  const y = (e.clientY - rect.top) * (cv.height / rect.height);
  const [c, r] = cellAt(x, y);
  if (!inGrid(c, r)) return;

  // 編輯模式：切換固定牆
  if (editMode) {
    if (r === SPAWN_ROW) { flash('入口那排不能設牆', ...center(c, r), '#ff8f8f'); return; }
    const key = c + ',' + r;
    if (mapWalls.has(key)) mapWalls.delete(key);
    else { if (buildAt(c, r)) return; mapWalls.add(key); }
    computeFlow();
    return;
  }

  if (!G.running) return;
  // 點哨兵 → 疏導
  const occ = buildAt(c, r);
  if (occ) { if (occ.kind === 'tower') soothe(occ); return; }
  // 放置
  if (!G.selType) return;
  if (r === SPAWN_ROW) { flash('這裡是怪物入口', ...center(c, r), '#ff8f8f'); return; }
  if (isWall(c, r)) { flash('這裡是固定牆', ...center(c, r), '#ff8f8f'); return; }
  if (G.selType === 'barrier') {
    if (G.money < BARRIER.cost) { flash('資源不足', ...center(c, r), '#ff8f8f'); return; }
    G.money -= BARRIER.cost;
    const o = { kind: 'obstacle', c, r, hp: BARRIER.hp, maxhp: BARRIER.hp };
    G.grid[c + ',' + r] = o; G.obstacles.push(o);
  } else {
    const spec = TYPES[G.selType];
    if (G.money < spec.cost) { flash('資源不足', ...center(c, r), '#ff8f8f'); return; }
    G.money -= spec.cost;
    const [tx, ty] = center(c, r);
    const t = { kind: 'tower', type: G.selType, c, r, x: tx, y: ty, cd: 0, taint: 0, berserk: false };
    G.grid[c + ',' + r] = t; G.towers.push(t);
  }
  updateHUD();
});

// ---- 疏導哨兵（花嚮導能量降汙染、解暴走）----
function soothe(t) {
  if (t.taint <= 0 && !t.berserk) { flash('無需疏導', t.x, t.y - 26, '#9aa4b2'); return; }
  if (G.guide < SOOTHE.cost) { flash('嚮導能量不足', t.x, t.y - 26, '#ff8f8f'); return; }
  G.guide -= SOOTHE.cost; t.taint = Math.max(0, t.taint - SOOTHE.heal);
  if (t.berserk && t.taint < 60) t.berserk = false;
  flash('疏導 -' + SOOTHE.heal, t.x, t.y - 26, '#7ee0c0'); updateHUD();
}

// ---- 怪物尋路：走向流場更低的相鄰格 ----
function commitNext(e) {
  const [cc, cr] = cellAt(e.x, e.y);
  if (cr >= ROWS - 1 && !isWall(cc, cr)) { e.exiting = true; e.hasTarget = true; e.tcell = null; return; }
  let best = null, bestd = flowAt(cc, cr);
  for (const [dc, dr] of [[0, 1], [-1, 0], [1, 0], [0, -1]]) {
    const nc = cc + dc, nr = cr + dr, fd = flowAt(nc, nr);
    if (fd < bestd) { bestd = fd; best = [nc, nr]; }
  }
  if (!best) { e.stuck = true; e.hasTarget = true; e.tcell = null; return; }
  e.tcell = best; [e.tx, e.ty] = center(best[0], best[1]);
  e.hasTarget = true; e.stuck = false; e.exiting = false;
}
function stepEnemy(e, dt) {
  if (!e.hasTarget) commitNext(e);
  if (e.stuck) return;
  if (e.exiting) { e.y += e.speed * dt; if (e.y > OY + ROWS * CELL + 18) e.reached = true; return; }
  // 目標格有障礙物 → 停下打牆
  const tc = e.tcell, o = tc ? barrierAt(tc[0], tc[1]) : null;
  if (o) { o.hp -= BARRIER.breakDps * dt; if (o.hp <= 0) { removeBarrier(o); e.hasTarget = false; } return; }
  const dx = e.tx - e.x, dy = e.ty - e.y, d = Math.hypot(dx, dy), step = e.speed * dt;
  if (d <= step) { e.x = e.tx; e.y = e.ty; e.hasTarget = false; }
  else { e.x += dx / d * step; e.y += dy / d * step; }
}

// ---- 主迴圈（幀率校正）----
let last = 0;
function loop(ts) {
  const dt = Math.min(0.05, (ts - last) / 1000 || 0); last = ts;
  if (G.running && !G.over && !editMode) update(dt);
  draw();
  requestAnimationFrame(loop);
}
function update(dt) {
  G.guide = Math.min(G.guideMax, G.guide + G.guideRegen * dt);
  // 生怪
  if (G.spawnQueue.length > 0) {
    G.spawnTimer -= dt;
    if (G.spawnTimer <= 0) {
      const cols = validSpawnCols();
      if (cols.length) {
        const s = G.spawnQueue.shift();
        const col = cols[Math.floor(Math.random() * cols.length)];
        const [sx, sy] = center(col, SPAWN_ROW);
        G.enemies.push({ x: sx, y: sy, hp: s.hp, maxhp: s.hp, speed: s.speed, reward: s.reward, hasTarget: false });
      }
      G.spawnTimer = G.curGap;
    }
  }
  // 怪物移動
  for (const e of G.enemies) stepEnemy(e, dt);
  for (const e of G.enemies) { if (e.reached) { G.lives--; e.dead = true; } }
  // 哨兵攻擊
  for (const t of G.towers) {
    const spec = TYPES[t.type];
    if (spec.taintRegen && !t.berserk) t.taint = Math.max(0, t.taint - spec.taintRegen * dt);
    t.cd -= dt;
    if (t.berserk || t.cd > 0) continue;
    const R = spec.range * CELL;
    let target = null, bestY = -1;
    for (const e of G.enemies) {
      if (e.dead) continue;
      if (Math.hypot(e.x - t.x, e.y - t.y) <= R && e.y > bestY) { target = e; bestY = e.y; }
    }
    if (target) {
      t.cd = 1 / spec.rate;
      if (Math.random() < spec.accuracy) {
        target.hp -= spec.dmg;
        if (spec.splash > 0) for (const e of G.enemies) { if (e !== target && !e.dead && Math.hypot(e.x - target.x, e.y - target.y) <= spec.splash * CELL) e.hp -= spec.dmg * 0.6; }
        G.effects.push({ x1: t.x, y1: t.y, x2: target.x, y2: target.y, life: 0.12, color: spec.color });
      } else flash('MISS', t.x, t.y - 26, '#9aa4b2');
      t.taint = Math.min(100, t.taint + spec.taint);
      if (t.taint >= 100 && !t.berserk) { t.berserk = true; G.lives -= BERSERK.livesPenalty; flash('暴走!', t.x, t.y - 30, '#ff4d4d'); }
    }
  }
  for (const e of G.enemies) { if (e.hp <= 0 && !e.dead) { e.dead = true; G.money += e.reward; } }
  G.enemies = G.enemies.filter(e => !e.dead);
  for (const f of G.effects) f.life -= dt;
  G.effects = G.effects.filter(f => f.life > 0);
  // 波次
  if (G.spawnQueue.length === 0 && G.enemies.length === 0) {
    if (G.betweenWaves <= 0) {
      G.waveIndex++;
      if (G.waveIndex >= G.waves.length) win();
      else G.betweenWaves = 2.5;
    } else { G.betweenWaves -= dt; if (G.betweenWaves <= 0) startWave(); }
  }
  if (G.lives <= 0) { G.lives = 0; lose(); }
  updateHUD();
}
function flash(text, x, y, color) { G.effects.push({ text, x, y, life: 0.8, color, vy: -22 }); }

// ---- 繪製 ----
function draw() {
  ctx.clearRect(0, 0, cv.width, cv.height);
  // 地板貼圖鋪滿整個地圖（未載入時用深色底）
  if (floorPattern) { ctx.fillStyle = floorPattern; ctx.fillRect(OX, OY, COLS * CELL, ROWS * CELL); }
  else { ctx.fillStyle = '#161b22'; ctx.fillRect(OX, OY, COLS * CELL, ROWS * CELL); }
  // 區域色（半透明疊上，貼圖仍可見）＋ 格線 ＋ 固定牆
  for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++) {
    const [cx, cy] = [OX + c * CELL, OY + r * CELL];
    if (r === SPAWN_ROW) { ctx.fillStyle = 'rgba(150,40,70,.32)'; ctx.fillRect(cx, cy, CELL, CELL); }
    else if (r >= CAMP_ROW) { ctx.fillStyle = 'rgba(40,160,115,.22)'; ctx.fillRect(cx, cy, CELL, CELL); }
    if (isWall(c, r)) {
      ctx.fillStyle = '#3f434b'; ctx.fillRect(cx + 2, cy + 2, CELL - 4, CELL - 4);
      ctx.strokeStyle = '#565b64'; ctx.lineWidth = 2; ctx.strokeRect(cx + 5, cy + 5, CELL - 10, CELL - 10);
    }
  }
  ctx.fillStyle = '#8a5a6a'; ctx.font = '13px sans-serif'; ctx.textAlign = 'left';
  ctx.fillText('▼ 怪物入口', OX + 6, OY + 16);
  ctx.fillStyle = '#5aa88f'; ctx.textAlign = 'right';
  ctx.fillText('營地（守住這裡）', OX + COLS * CELL - 6, OY + ROWS * CELL - 8);

  // 障礙物
  for (const o of G.obstacles) {
    const [x, y] = center(o.c, o.r);
    ctx.fillStyle = '#7a5a3a'; roundRect(x - 17, y - 17, 34, 34, 5); ctx.fill();
    ctx.strokeStyle = '#5a4128'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#000'; ctx.fillRect(x - 16, y + 12, 32, 4);
    ctx.fillStyle = '#c9a26a'; ctx.fillRect(x - 16, y + 12, 32 * Math.max(0, o.hp) / o.maxhp, 4);
  }
  // 哨兵
  for (const t of G.towers) {
    const spec = TYPES[t.type];
    ctx.fillStyle = t.berserk ? '#5a1f27' : spec.color; roundRect(t.x - 17, t.y - 17, 34, 34, 6); ctx.fill();
    ctx.fillStyle = '#0e1116'; ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(spec.name, t.x, t.y + 3);
    const w = 34, tx = t.x - 17, ty = t.y + 12;
    ctx.fillStyle = '#000'; ctx.fillRect(tx, ty, w, 4);
    ctx.fillStyle = t.taint > 75 ? '#ff4d4d' : (t.taint > 45 ? '#ffb84d' : '#7ee0c0'); ctx.fillRect(tx, ty, w * t.taint / 100, 4);
    if (t.berserk) { ctx.fillStyle = '#ff4d4d'; ctx.font = 'bold 10px sans-serif'; ctx.fillText('暴走', t.x, t.y - 20); }
  }
  // 怪物
  for (const e of G.enemies) {
    ctx.fillStyle = '#c25bce'; ctx.beginPath(); ctx.arc(e.x, e.y, 13, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(e.x - 4, e.y - 2, 2.4, 0, Math.PI * 2); ctx.arc(e.x + 4, e.y - 2, 2.4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(e.x - 4, e.y - 2, 1.1, 0, Math.PI * 2); ctx.arc(e.x + 4, e.y - 2, 1.1, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#000'; ctx.fillRect(e.x - 14, e.y - 20, 28, 3);
    ctx.fillStyle = '#7CFC7C'; ctx.fillRect(e.x - 14, e.y - 20, 28 * Math.max(0, e.hp) / e.maxhp, 3);
  }
  // 特效
  for (const f of G.effects) {
    if (f.text) {
      ctx.globalAlpha = Math.max(0, f.life / 0.8); ctx.fillStyle = f.color; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(f.text, f.x, f.y + (f.vy || 0) * (0.8 - f.life)); ctx.globalAlpha = 1;
    } else {
      ctx.globalAlpha = Math.max(0, f.life / 0.12); ctx.strokeStyle = f.color; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(f.x1, f.y1); ctx.lineTo(f.x2, f.y2); ctx.stroke(); ctx.globalAlpha = 1;
    }
  }
  // 編輯模式提示
  if (editMode) {
    ctx.fillStyle = 'rgba(90,70,160,.25)'; ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.fillStyle = '#d7c9ff'; ctx.font = 'bold 22px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('🏗️ 編輯地圖中：點格子放／移除固定牆，完成後按「✅ 完成編輯」', cv.width / 2, 40);
  }
}
function roundRect(x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

// ---- HUD / 狀態畫面 ----
function updateHUD() {
  document.getElementById('money').textContent = Math.floor(G.money);
  document.getElementById('lives').textContent = Math.max(0, G.lives);
  document.getElementById('guide').textContent = Math.floor(G.guide);
  document.getElementById('wave').textContent = Math.min(G.waveIndex + 1, G.waves.length);
  document.getElementById('wavemax').textContent = G.waves.length;
}
const overlay = document.getElementById('overlay');
const ovTitle = document.getElementById('ov-title'), ovText = document.getElementById('ov-text'), ovBtn = document.getElementById('ov-btn');
function showOverlay(title, text, btn) { ovTitle.textContent = title; ovText.innerHTML = text; ovBtn.textContent = btn; overlay.classList.remove('hidden'); }
function hideOverlay() { overlay.classList.add('hidden'); }
function showStart() {
  showOverlay('台北地下災害應變中心 · 塔防原型',
    '怪物<b>由上往下</b>攻進<b>營地</b>，碰到固定牆會繞路。<br>用<b>哨兵</b>火力清怪、<b>障礙物</b>卡位，並在哨兵<b>暴走</b>前<b>疏導</b>。<br>可先按下方 🏗️<b>編輯地圖</b> 佈置固定牆。守住 5 波即可控制 Y 區。',
    '開始防禦');
}
function winOverlay() { showOverlay('✅ Y 區已控制', '你守住了營地、擋下所有波次！', '再玩一次'); }
function loseOverlay() { showOverlay('💀 營地失守', '怪物攻進了營地。<br>試試多築牆卡位、提早疏導快暴走的哨兵。', '再挑戰'); }

function begin() { newGame(); G.phase = 'playing'; hideOverlay(); G.running = true; G.betweenWaves = 0.01; }
function win() { G.over = true; G.won = true; G.running = false; G.phase = 'won'; winOverlay(); }
function lose() { G.over = true; G.running = false; G.phase = 'lost'; loseOverlay(); }
ovBtn.addEventListener('click', begin);

// ---- 啟動遊戲 ----
newGame(); showStart();
requestAnimationFrame(loop);
