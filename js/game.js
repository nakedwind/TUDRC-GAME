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
floorImg.src = 'images/background/Back-room-floor.png';

// ---- 玩家角色（嚮導本人，可用 WASD／方向鍵操縱）----
const PLAYER = { speed: 230, r: 14, drawSize: 64 };   // 移動速度、碰撞半徑、角色圖尺寸
const playerSpriteFiles = {
  front: [
    'eldrin_0000_Front.png', 'eldrin_0001_Front-Walking01.png', 'eldrin_0002_Front-Walking02.png'
  ],
  back: [
    'eldrin_0009_back.png', 'eldrin_0010_back-walking01.png', 'eldrin_0011_back-walking02.png'
  ],
  left: [
    'eldrin_0003_Leftside.png', 'eldrin_0004_Leftside-walking01.png', 'eldrin_0005_Leftside-walking02.png'
  ],
  right: [
    'eldrin_0006_right-side.png', 'eldrin_0007_right-side-walking01.png', 'eldrin_0008_right-side-walking02.png'
  ],
};
const playerSprites = {};
for (const dir of Object.keys(playerSpriteFiles)) {
  playerSprites[dir] = playerSpriteFiles[dir].map(file => {
    const img = new Image(); img.src = 'images/character/eldrin/' + file; return img;
  });
}
// 正面待機眨眼：半閉眼 → 閉眼 → 全閉，再倒放回張眼。
const playerBlinkSprites = [
  'eldrin_0014_closeeyes01.png',
  'eldrin_0013_closeeyes02.png',
  'eldrin_0012_closeeyes03.png',
].map(file => { const img = new Image(); img.src = 'images/character/eldrin/' + file; return img; });
const keys = {};                         // 目前按住的按鍵
window.addEventListener('keydown', e => {
  const k = e.key.toLowerCase(); keys[k] = true;
  if (k.startsWith('arrow')) e.preventDefault();   // 方向鍵不要捲動網頁
});
window.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
window.addEventListener('keydown', e => { if (!e.repeat && e.key.toLowerCase() === 'r') rotateBuild(); });   // R＝建築轉向

// ---- 滑鼠所在格（建築放置預覽用）----
let hoverCell = null;

// ---- 鏡頭（相框位置）：跟著玩家，碰到地圖邊緣就停 ----
let cam = { x: 0, y: 0 };
function updateCamera() {
  const p = G && G.player;
  const mapW = COLS * CELL, mapH = ROWS * CELL;
  cam.x = p ? Math.max(0, Math.min(mapW - VIEW_W, p.x - VIEW_W / 2)) : 0;
  cam.y = p ? Math.max(0, Math.min(mapH - VIEW_H, p.y - VIEW_H / 2)) : 0;
  if (mapW <= VIEW_W) cam.x = (mapW - VIEW_W) / 2;   // 地圖比畫面小 → 置中
  if (mapH <= VIEW_H) cam.y = (mapH - VIEW_H) / 2;
}

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
  seedMapObstacles();   // 把地圖裡預設的「可破壞障礙物」擺上場
  const [px, py] = playerSpawnPos();
  G.player = { x: px, y: py, dir: 'front', moving: false, anim: 0, blinkWait: 2 + Math.random() * 3, blinkTime: -1 };
  updateCamera();
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

// ---- 玩家出生點：優先站營地，找不到就從下往上找空地 ----
function playerSpawnPos() {
  const cand = [];
  campCells.forEach(k => cand.push(k.split(',').map(Number)));
  for (let r = ROWS - 1; r >= 0; r--) for (let c = 0; c < COLS; c++) cand.push([c, r]);
  for (const [c, r] of cand) if (inGrid(c, r) && !isWall(c, r) && !isEntrance(c, r)) return center(c, r);
  return center(Math.floor(COLS / 2), ROWS - 1);
}
// ---- 玩家移動與碰撞（牆、哨兵、障礙物都擋路；水平垂直分開判斷可貼牆滑行）----
function playerBlocked(x, y) {
  const r = PLAYER.r;
  for (const [sx, sy] of [[-r, -r], [r, -r], [-r, r], [r, r]]) {
    const [c, rr] = cellAt(x + sx, y + sy);
    if (!inGrid(c, rr) || isWall(c, rr) || G.grid[c + ',' + rr]) return true;
  }
  return false;
}
function updatePlayer(dt) {
  const p = G.player; if (!p) return;
  const dx = ((keys['d'] || keys['arrowright']) ? 1 : 0) - ((keys['a'] || keys['arrowleft']) ? 1 : 0);
  const dy = ((keys['s'] || keys['arrowdown']) ? 1 : 0) - ((keys['w'] || keys['arrowup']) ? 1 : 0);
  p.moving = !!(dx || dy);
  if (!p.moving) {
    p.anim = 0;
    if (p.dir === 'front') {
      if (p.blinkTime >= 0) {
        p.blinkTime += dt;
        if (p.blinkTime >= 0.42) { p.blinkTime = -1; p.blinkWait = 2 + Math.random() * 4; }
      } else {
        p.blinkWait -= dt;
        if (p.blinkWait <= 0) p.blinkTime = 0;
      }
    } else p.blinkTime = -1;
    return;
  }
  p.blinkTime = -1;
  if (Math.abs(dx) >= Math.abs(dy) && dx) p.dir = dx < 0 ? 'left' : 'right';
  else if (dy) p.dir = dy < 0 ? 'back' : 'front';
  p.anim += dt;
  const len = Math.hypot(dx, dy), step = PLAYER.speed * dt;
  const nx = p.x + dx / len * step, ny = p.y + dy / len * step;
  if (!playerBlocked(nx, p.y)) p.x = nx;
  if (!playerBlocked(p.x, ny)) p.y = ny;
}

// ---- 佈署物件查詢 ----
const buildAt = (c, r) => G.grid[c + ',' + r];
const barrierAt = (c, r) => { const o = G.grid[c + ',' + r]; return (o && o.kind === 'obstacle') ? o : null; };
// 放置時仍保留整張圖片的空間，避免兩張物件互相疊住；移動與尋路則只看 solid。
function placementOccupiedAt(c, r) {
  if (G.grid[c + ',' + r]) return true;
  return G.obstacles.some(o => c >= o.c && c < o.c + (o.w || 1) && r >= o.r && r < o.r + (o.h || 1));
}
function removeBarrier(o) {
  obstacleSolidCells(o).forEach(([dc, dr]) => delete G.grid[(o.c + dc) + ',' + (o.r + dr)]);
  G.obstacles = G.obstacles.filter(x => x !== o);
}

// 沒有 solid 的舊資料仍以整張圖片範圍擋路。
function variantSolidCells(v) {
  if (Array.isArray(v.solid)) return v.solid;
  const cells = [];
  for (let dc = 0; dc < (v.w || 1); dc++) for (let dr = 0; dr < (v.h || 1); dr++) cells.push([dc, dr]);
  return cells;
}
function obstacleSolidCells(o) {
  if (Array.isArray(o.solid)) return o.solid;
  return variantSolidCells({ w: o.w || 1, h: o.h || 1 });
}

// ---- 建築放置：圖片須在地圖內，只有 solid 格會擋路／不可重疊 ----
function canPlaceObstacle(v, c, r) {
  if (c < 0 || r < 0 || c + v.w > COLS || r + v.h > ROWS) return false;
  for (let dc = 0; dc < v.w; dc++) for (let dr = 0; dr < v.h; dr++) {
    const cc = c + dc, rr = r + dr;
    if (!inGrid(cc, rr) || isWall(cc, rr) || isEntrance(cc, rr) || placementOccupiedAt(cc, rr)) return false;
  }
  return true;
}
function placeObstacle(ob, c, r) {
  const v = ob[buildOrient];
  if (!canPlaceObstacle(v, c, r)) { flash('這裡放不下', ...center(c, r), '#ff8f8f'); return; }
  if (G.money < ob.cost) { flash('資源不足', ...center(c, r), '#ff8f8f'); return; }
  G.money -= ob.cost;
  const solid = variantSolidCells(v).map(cell => cell.slice());
  const o = { kind: 'obstacle', type: ob.id, orient: buildOrient, c, r, w: v.w, h: v.h, solid, hp: ob.hp, maxhp: ob.hp };
  solid.forEach(([dc, dr]) => { G.grid[(c + dc) + ',' + (r + dr)] = o; });
  G.obstacles.push(o);
}

// ---- 輸入：選擇要放置的哨兵 ----
document.querySelectorAll('.tbtn[data-type]').forEach(btn => {
  btn.addEventListener('click', () => {
    if (editMode) return;
    const t = btn.dataset.type;
    G.selType = (G.selType === t) ? null : t;
    document.querySelectorAll('.tbtn[data-type]').forEach(b => b.classList.toggle('sel', b.dataset.type === G.selType));
    renderBuildBar();   // 選了哨兵就取消建築選單的高亮
  });
});

// ---- 建築選單（依 data/balance.js 的 OBSTACLES 產生）----
const buildBar = document.getElementById('buildbar');
const buildToggle = document.getElementById('buildToggle');
let buildOrient = 'h';        // 目前方向：h 橫版 / v 直版（按 R 切換）
const obstacleImgs = {};      // 預先載入每種障礙物的兩張圖
OBSTACLES.forEach(o => {
  obstacleImgs[o.id] = {};
  ['h', 'v'].forEach(k => { const im = new Image(); im.src = o[k].file; obstacleImgs[o.id][k] = im; });
});
function renderBuildBar() {
  buildBar.innerHTML = '';
  OBSTACLES.forEach(o => {
    const v = o[buildOrient];
    const b = document.createElement('button');
    b.className = 'tbtn build' + (G && G.selType === 'build:' + o.id ? ' sel' : '');
    b.innerHTML = '<img src="' + v.file + '" alt=""><span>' + o.name + ' (' + o.cost + ')<small>圖片 ' + v.w + '×' + v.h + '格・擋路 ' + variantSolidCells(v).length + '格・HP ' + o.hp + '</small></span>';
    b.addEventListener('click', () => {
      if (editMode) return;
      G.selType = (G.selType === 'build:' + o.id) ? null : 'build:' + o.id;
      document.querySelectorAll('.tbtn[data-type]').forEach(x => x.classList.remove('sel'));
      renderBuildBar();
    });
    buildBar.appendChild(b);
  });
  const rot = document.createElement('button');
  rot.className = 'tbtn rotate';
  rot.innerHTML = '↻ 轉向 (R)<small>目前：' + (buildOrient === 'h' ? '橫版' : '直版') + '</small>';
  rot.addEventListener('click', rotateBuild);
  buildBar.appendChild(rot);
}
function rotateBuild() { buildOrient = buildOrient === 'h' ? 'v' : 'h'; renderBuildBar(); }
buildToggle.addEventListener('click', () => {
  const opening = buildBar.classList.contains('hidden');
  buildBar.classList.toggle('hidden', !opening);
  buildToggle.classList.toggle('sel', opening);
  if (!opening && G.selType && G.selType.startsWith('build:')) { G.selType = null; renderBuildBar(); }
});

// ---- 輸入：編輯地圖模式 ----
const editBtn = document.getElementById('editBtn');
editBtn.addEventListener('click', () => {
  editMode = !editMode;
  editBtn.classList.toggle('on', editMode);
  if (editMode) {
    editBtn.innerHTML = '✅ 完成編輯<small>回到遊戲</small>';
    G.selType = null; document.querySelectorAll('.tbtn[data-type]').forEach(b => b.classList.remove('sel'));
    renderBuildBar();
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
  const x = (e.clientX - rect.left) * (cv.width / rect.width) + cam.x;   // 加上鏡頭位置＝世界座標
  const y = (e.clientY - rect.top) * (cv.height / rect.height) + cam.y;
  const [c, r] = cellAt(x, y);
  if (!inGrid(c, r)) return;

  // 編輯模式：切換固定牆
  if (editMode) {
    if (isEntrance(c, r)) { flash('怪物入口不能設牆', ...center(c, r), '#ff8f8f'); return; }
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
  if (isEntrance(c, r)) { flash('這裡是怪物入口', ...center(c, r), '#ff8f8f'); return; }
  if (isWall(c, r)) { flash('這裡是固定牆', ...center(c, r), '#ff8f8f'); return; }
  if (G.selType.startsWith('build:')) {
    const ob = OBSTACLES.find(o => 'build:' + o.id === G.selType);
    if (ob) placeObstacle(ob, c, r);
  } else {
    const spec = TYPES[G.selType];
    if (placementOccupiedAt(c, r)) { flash('這裡已有物件', ...center(c, r), '#ff8f8f'); return; }
    if (G.money < spec.cost) { flash('資源不足', ...center(c, r), '#ff8f8f'); return; }
    G.money -= spec.cost;
    const [tx, ty] = center(c, r);
    const t = { kind: 'tower', type: G.selType, c, r, x: tx, y: ty, cd: 0, taint: 0, berserk: false };
    G.grid[c + ',' + r] = t; G.towers.push(t);
  }
  updateHUD();
});

// ---- 滑鼠移動：記住目前指到哪一格（世界座標）----
cv.addEventListener('mousemove', e => {
  const rect = cv.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (cv.width / rect.width) + cam.x;
  const y = (e.clientY - rect.top) * (cv.height / rect.height) + cam.y;
  const [c, r] = cellAt(x, y);
  hoverCell = inGrid(c, r) ? [c, r] : null;
});
cv.addEventListener('mouseleave', () => { hoverCell = null; });

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
  if (isCamp(cc, cr) && !isWall(cc, cr)) {
    // 到達營地：預設營地（最下排）走出畫面；自訂營地直接算攻入
    if (campCells.size) { e.reached = true; }
    else { e.exiting = true; }
    e.hasTarget = true; e.tcell = null; return;
  }
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
  if (!editMode && !G.over) updatePlayer(dt);   // 玩家隨時可走動（編輯地圖時除外）
  updateCamera();
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
      const cells = spawnCells();   // 地圖的「入口」格（沒設定就用最上排）
      if (cells.length) {
        const s = G.spawnQueue.shift();
        const [sc, sr] = cells[Math.floor(Math.random() * cells.length)];
        const [sx, sy] = center(sc, sr);
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
  // 之後畫的都是「世界座標」：整體平移鏡頭位置，畫面就會跟著玩家捲動
  ctx.save();
  ctx.translate(-Math.round(cam.x), -Math.round(cam.y));
  // 地板貼圖鋪滿整個地圖（未載入時用深色底）
  if (floorPattern) { ctx.fillStyle = floorPattern; ctx.fillRect(OX, OY, COLS * CELL, ROWS * CELL); }
  else { ctx.fillStyle = '#161b22'; ctx.fillRect(OX, OY, COLS * CELL, ROWS * CELL); }
  // 地圖編輯器做的圖層與大型圖片
  drawMapImages(ctx);
  // 區域色（半透明疊上，貼圖仍可見）＋ 格線 ＋ 固定牆
  for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++) {
    const [cx, cy] = [OX + c * CELL, OY + r * CELL];
    if (isEntrance(c, r)) { ctx.fillStyle = 'rgba(150,40,70,.32)'; ctx.fillRect(cx, cy, CELL, CELL); }
    else if (isCamp(c, r)) { ctx.fillStyle = 'rgba(40,160,115,.22)'; ctx.fillRect(cx, cy, CELL, CELL); }
    if (isWall(c, r) && !hasImageAt(c, r)) {
      ctx.fillStyle = '#3f434b'; ctx.fillRect(cx + 2, cy + 2, CELL - 4, CELL - 4);
      ctx.strokeStyle = '#565b64'; ctx.lineWidth = 2; ctx.strokeRect(cx + 5, cy + 5, CELL - 10, CELL - 10);
    }
  }
  ctx.fillStyle = '#8a5a6a'; ctx.font = '13px sans-serif'; ctx.textAlign = 'left';
  ctx.fillText('▼ 怪物入口', OX + 6, OY + 16);
  ctx.fillStyle = '#5aa88f'; ctx.textAlign = 'right';
  ctx.fillText('營地（守住這裡）', OX + COLS * CELL - 6, OY + ROWS * CELL - 8);

  // 障礙物（建築用圖片；地圖內建的舊格式用棕色方塊）
  for (const o of G.obstacles) {
    const w = (o.w || 1) * CELL, h = (o.h || 1) * CELL;
    const x = OX + o.c * CELL, y = OY + o.r * CELL;
    const img = o.type && obstacleImgs[o.type] && obstacleImgs[o.type][o.orient || 'h'];
    if (img && img.complete && img.naturalWidth) ctx.drawImage(img, x, y, w, h);
    else {
      ctx.fillStyle = '#7a5a3a'; roundRect(x + 3, y + 3, w - 6, h - 6, 5); ctx.fill();
      ctx.strokeStyle = '#5a4128'; ctx.lineWidth = 2; ctx.stroke();
    }
    if (o.hp < o.maxhp) {   // 受損才顯示血條
      ctx.fillStyle = '#000'; ctx.fillRect(x + 2, y + h - 6, w - 4, 4);
      ctx.fillStyle = '#c9a26a'; ctx.fillRect(x + 2, y + h - 6, (w - 4) * Math.max(0, o.hp) / o.maxhp, 4);
    }
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
  // 玩家（艾德林）：依移動方向切換站立／走路圖
  const p = G.player;
  if (p) {
    const frames = playerSprites[p.dir || 'front'];
    const walkOrder = [1, 0, 2, 0];
    const frame = p.moving ? walkOrder[Math.floor(p.anim * 8) % walkOrder.length] : 0;
    let img = frames && frames[frame];
    if (!p.moving && p.dir === 'front' && p.blinkTime >= 0) {
      const blinkOrder = [0, 1, 2, 2, 1, 0];
      img = playerBlinkSprites[blinkOrder[Math.min(blinkOrder.length - 1, Math.floor(p.blinkTime / 0.07))]];
    }
    const size = PLAYER.drawSize;
    if (img && img.complete && img.naturalWidth) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, p.x - size / 2, p.y - size + 18, size, size);
      ctx.imageSmoothingEnabled = true;
    } else {
      ctx.fillStyle = '#5ec8ff'; roundRect(p.x - 14, p.y - 16, 28, 32, 8); ctx.fill();
    }
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
  // 建築放置預覽（40% 半透明，放不下時紅框）
  if (hoverCell && G.running && !editMode && G.selType && G.selType.startsWith('build:')) {
    const ob = OBSTACLES.find(o => 'build:' + o.id === G.selType);
    if (ob) {
      const v = ob[buildOrient], [c, r] = hoverCell;
      const x = OX + c * CELL, y = OY + r * CELL, w = v.w * CELL, h = v.h * CELL;
      const ok = canPlaceObstacle(v, c, r);
      const img = obstacleImgs[ob.id][buildOrient];
      ctx.globalAlpha = 0.4;
      if (img && img.complete && img.naturalWidth) ctx.drawImage(img, x, y, w, h);
      else { ctx.fillStyle = '#7a5a3a'; ctx.fillRect(x + 3, y + 3, w - 6, h - 6); }
      ctx.globalAlpha = 1;
      ctx.strokeStyle = ok ? '#8fd3ff' : '#ff5b5b'; ctx.lineWidth = 2; ctx.setLineDash([6, 4]);
      ctx.strokeRect(x + 1, y + 1, w - 2, h - 2); ctx.setLineDash([]);
      ctx.fillStyle = ok ? 'rgba(80,210,150,.28)' : 'rgba(255,80,80,.3)';
      for (const [dc, dr] of variantSolidCells(v)) ctx.fillRect(x + dc * CELL, y + dr * CELL, CELL, CELL);
    }
  }
  ctx.restore();   // 世界座標畫完，回到螢幕座標（下面的提示固定在畫面上）
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
    '用 <b>WASD／方向鍵</b>移動嚮導，鏡頭會跟著你探索地圖。<br>怪物<b>由上往下</b>攻進<b>營地</b>，碰到固定牆會繞路。<br>用<b>哨兵</b>火力清怪、<b>障礙物</b>卡位，並在哨兵<b>暴走</b>前<b>疏導</b>。<br>可先按下方 🏗️<b>編輯地圖</b> 佈置固定牆。守住 5 波即可控制 Y 區。',
    '開始防禦');
}
function winOverlay() { showOverlay('✅ Y 區已控制', '你守住了營地、擋下所有波次！', '再玩一次'); }
function loseOverlay() { showOverlay('💀 營地失守', '怪物攻進了營地。<br>試試多築牆卡位、提早疏導快暴走的哨兵。', '再挑戰'); }

function begin() { newGame(); G.phase = 'playing'; hideOverlay(); G.running = true; G.betweenWaves = 0.01; }
function win() { G.over = true; G.won = true; G.running = false; G.phase = 'won'; winOverlay(); }
function lose() { G.over = true; G.running = false; G.phase = 'lost'; loseOverlay(); }
ovBtn.addEventListener('click', begin);

// ---- 啟動遊戲 ----
newGame(); renderBuildBar(); showStart();
requestAnimationFrame(loop);
