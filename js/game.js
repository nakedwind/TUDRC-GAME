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

// ---- 黑暗與光源（格子擴散光）----
// 原理：光從光源所在的格子出發，沿格子一格一格往外「流」，每走一格亮度衰減，
// 碰到固定牆就停（牆本身會被照亮、但光不會穿到牆後）。
// 渲染：把每格亮度畫成「一格一像素」的小圖，再放大貼到畫面上，
// 瀏覽器的平滑縮放會自動把格子感柔化成漸層。
let lightsCache = [];   // 這一幀的所有光源（世界座標），每幀在 draw() 開頭更新

const LIT_MIN = 0.1;                                   // 亮度低於這個值視為「黑暗」
const lightField = new Float32Array(COLS * ROWS);      // 每格亮度 0～1
const lightDist = new Float32Array(COLS * ROWS);       // BFS 暫存
const fieldCv = document.createElement('canvas');      // 一格一像素的黑幕小圖
fieldCv.width = COLS; fieldCv.height = ROWS;
const fieldCtx = fieldCv.getContext('2d');
const fieldImg = fieldCtx.createImageData(COLS, ROWS);

// 8 方向擴散（斜向成本 1.4，讓光圈接近圓形）
const LIGHT_DIRS = [[0, 1, 1], [0, -1, 1], [1, 0, 1], [-1, 0, 1], [1, 1, 1.4], [1, -1, 1.4], [-1, 1, 1.4], [-1, -1, 1.4]];
function computeLightField() {
  lightField.fill(0);
  if (!LIGHT.enabled) return;
  for (const l of lightsCache) {
    const steps = l.r / CELL;                          // 這盞燈的光能走幾格
    const [sc, sr] = cellAt(l.x, l.y);
    if (!inGrid(sc, sr)) continue;
    lightDist.fill(Infinity);
    // 平滑補間：用光源「實際座標」到附近格子中心的真實距離當起始距離，
    // 角色在格子內移動時亮度會連續滑動，光就不會一格一格跳。
    const q = [];
    for (let dc = -1; dc <= 1; dc++) for (let dr = -1; dr <= 1; dr++) {
      const c0 = sc + dc, r0 = sr + dr;
      if (!inGrid(c0, r0)) continue;
      if (dc && dr && isWall(sc + dc, sr) && isWall(sc, sr + dr)) continue;   // 斜角不穿牆縫
      const [cx, cy] = center(c0, r0);
      const d0 = Math.hypot(cx - l.x, cy - l.y) / CELL;
      const i0 = r0 * COLS + c0;
      if (d0 < lightDist[i0]) { lightDist[i0] = d0; q.push(i0); }
    }
    let head = 0;
    while (head < q.length) {
      const idx = q[head++], c = idx % COLS, r = (idx - c) / COLS, d = lightDist[idx];
      if (d >= steps) continue;
      if (isWall(c, r) && idx !== sr * COLS + sc) continue;   // 牆會被照亮，但光到此為止
      for (const [dc, dr, w] of LIGHT_DIRS) {
        const nc = c + dc, nr = r + dr;
        if (!inGrid(nc, nr)) continue;
        if (dc && dr && isWall(c + dc, r) && isWall(c, r + dr)) continue;   // 斜向不能穿牆角
        const nd = d + w, ni = nr * COLS + nc;
        if (nd < lightDist[ni]) { lightDist[ni] = nd; q.push(ni); }
      }
    }
    for (let i = 0; i < lightField.length; i++) {
      if (lightDist[i] < Infinity) {
        const b = 1 - lightDist[i] / steps;
        if (b > lightField[i]) lightField[i] = b;
      }
    }
  }
}

function getLights() {
  const L = [];
  // 玩家（嚮導提燈）
  if (G && G.player) L.push({ x: G.player.x, y: G.player.y, r: LIGHT.playerR });
  // 營地常亮（沒自訂營地就用預設最下排）
  if (campCells.size) campCells.forEach(k => { const [c, r] = k.split(',').map(Number); const [x, y] = center(c, r); L.push({ x, y, r: LIGHT.campR }); });
  else for (let c = 0; c < COLS; c++) { const [x, y] = center(c, ROWS - 1); L.push({ x, y, r: LIGHT.campR }); }
  // 會發光的建築（探照燈等，半徑設定在 balance.js 的 LIGHT.buildings）
  // 光照範圍固定；warm/phase 是給「暖色呼吸光暈」裝飾用的（每盞燈相位錯開）
  if (G) for (const o of G.obstacles) {
    const lr = o.type && LIGHT.buildings[o.type];
    if (lr) L.push({ x: OX + (o.c + (o.w || 1) / 2) * CELL, y: OY + (o.r + (o.h || 1) / 2) * CELL, r: lr, warm: true, phase: o.c * 7 + o.r * 13 });
  }
  return L;
}
function isLit(x, y) {
  if (!LIGHT.enabled) return true;
  const [c, r] = cellAt(x, y);
  return inGrid(c, r) && lightField[r * COLS + c] > LIT_MIN;
}
const cellLit = (c, r) => inGrid(c, r) && (!LIGHT.enabled || lightField[r * COLS + c] > LIT_MIN);
// 「靠近光」判定：自己亮、或距離亮格在 extra 像素（換算格數）以內（探照燈蓋在光圈邊緣用）
function cellNearLight(c, r, extra) {
  if (!LIGHT.enabled) return true;
  const k = Math.ceil(extra / CELL);
  for (let dc = -k; dc <= k; dc++) for (let dr = -k; dr <= k; dr++) {
    if (cellLit(c + dc, r + dr)) return true;
  }
  return false;
}

function drawDarkness() {
  if (!LIGHT.enabled) return;
  // 探照燈的暖色呼吸光暈：畫在黑幕「之前」，牆後陰影會自然把它蓋掉
  const now = performance.now() / 1000;
  for (const l of lightsCache) {
    if (!l.warm) continue;
    const sx = l.x - cam.x, sy = l.y - cam.y;
    if (sx < -l.r || sy < -l.r || sx > VIEW_W + l.r || sy > VIEW_H + l.r) continue;
    const a = 0.12 + 0.05 * Math.sin(now * 1.8 + l.phase);   // 暖光強度（基礎 + 呼吸幅度）
    const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, l.r * 0.85);
    g.addColorStop(0, 'rgba(255,185,105,' + a.toFixed(3) + ')');
    g.addColorStop(1, 'rgba(255,185,105,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(sx, sy, l.r * 0.85, 0, Math.PI * 2); ctx.fill();
  }
  // 亮度場 → 黑幕小圖（一格一像素），放大貼上時自動平滑成漸層
  const px = fieldImg.data, maxA = Math.round(LIGHT.darkness * 255);
  for (let i = 0; i < lightField.length; i++) {
    const b = Math.min(1, lightField[i]);
    const o = i * 4;
    px[o] = 0; px[o + 1] = 0; px[o + 2] = 0;
    px[o + 3] = Math.round(maxA * (1 - b));
  }
  fieldCtx.putImageData(fieldImg, 0, 0);
  const mx = OX - cam.x, my = OY - cam.y, mw = COLS * CELL, mh = ROWS * CELL;
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(fieldCv, mx, my, mw, mh);
  // 地圖範圍以外的畫面也保持黑暗
  ctx.fillStyle = 'rgba(0,0,0,' + LIGHT.darkness + ')';
  if (my > 0) ctx.fillRect(0, 0, VIEW_W, my);
  if (my + mh < VIEW_H) ctx.fillRect(0, my + mh, VIEW_W, VIEW_H - my - mh);
  if (mx > 0) ctx.fillRect(0, Math.max(0, my), mx, Math.min(VIEW_H, mh));
  if (mx + mw < VIEW_W) ctx.fillRect(mx + mw, Math.max(0, my), VIEW_W - mx - mw, Math.min(VIEW_H, mh));
}

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
let G;
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
  spawnSentries();      // 三位哨兵開場就在基地（隨機位置）
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

// ---- 開場佈署：三位哨兵在基地（營地）區隨機位置出現 ----
function spawnSentries() {
  const cand = [];
  if (campCells.size) campCells.forEach(k => cand.push(k.split(',').map(Number)));
  else for (let c = 0; c < COLS; c++) cand.push([c, ROWS - 1]);   // 沒自訂營地＝最下排
  const ok = cand.filter(([c, r]) => inGrid(c, r) && !isWall(c, r) && !isEntrance(c, r) && !G.grid[c + ',' + r]);
  for (const type of Object.keys(TYPES)) {
    const cell = ok.length ? ok.splice(Math.floor(Math.random() * ok.length), 1)[0] : [Math.floor(COLS / 2), ROWS - 1];
    const [x, y] = center(cell[0], cell[1]);
    G.towers.push({ kind: 'tower', type, x, y, cd: 0, taint: 0, berserk: false, mode: 'free', target: null, anchor: null, waitT: 0.4 + Math.random() });
  }
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
// 救援機制：角色若被卡在牆／建築裡（例如放置時的邊角誤差），
// 由近到遠繞圈找最近的空位，把角色推出去。
function rescueStuck(p, blockedFn) {
  if (!blockedFn(p.x, p.y)) return false;
  for (let d = 6; d <= CELL * 5; d += 6) {
    for (let a = 0; a < 16; a++) {
      const ang = (a / 16) * Math.PI * 2;
      const x = p.x + Math.cos(ang) * d, y = p.y + Math.sin(ang) * d;
      if (!blockedFn(x, y)) { p.x = x; p.y = y; return true; }
    }
  }
  return false;
}

function updatePlayer(dt) {
  const p = G.player; if (!p) return;
  if (rescueStuck(p, playerBlocked)) flash('!', p.x, p.y - 30, '#ffd479');   // 被卡住→自動脫困
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

// ---- 哨兵移動 AI（哨兵是「人」：在亮處走動巡邏）----
// 模式：free=自由走動（亮處隨便逛）/ hold=在錨點附近小範圍巡邏 / goto=走去指派位置後轉 hold
function sentryBlocked(x, y) {
  const r = 12;
  for (const [sx, sy] of [[-r, -r], [r, -r], [-r, r], [r, r]]) {
    const [c, rr] = cellAt(x + sx, y + sy);
    if (!inGrid(c, rr) || isWall(c, rr) || G.grid[c + ',' + rr]) return true;
  }
  return false;
}
// 在 (cx,cy) 周圍找一個「亮的、走得到」的隨機點
function sampleWanderTarget(cx, cy, radius) {
  for (let i = 0; i < 12; i++) {
    const ang = Math.random() * Math.PI * 2, d = 30 + Math.random() * radius;
    const x = cx + Math.cos(ang) * d, y = cy + Math.sin(ang) * d;
    const [c, r] = cellAt(x, y);
    if (!inGrid(c, r) || isWall(c, r) || isEntrance(c, r) || G.grid[c + ',' + r]) continue;
    if (!isLit(x, y)) continue;
    return { x, y };
  }
  return null;
}
function updateSentry(t, dt) {
  rescueStuck(t, sentryBlocked);                      // 被卡在建築裡→自動脫困
  if (t.berserk) { t.target = null; return; }        // 暴走中：站在原地失控
  if (menuSentry === t) return;                       // 選單開著時先站好
  // 光沒了（探照燈被拆等）→ 走向最近的光
  if (LIGHT.enabled && !isLit(t.x, t.y)) {
    let best = null, bd = Infinity;
    for (const l of lightsCache) { const d = Math.hypot(l.x - t.x, l.y - t.y) - l.r; if (d < bd) { bd = d; best = l; } }
    if (best) t.target = { x: best.x, y: best.y };
  }
  if (t.waitT > 0) { t.waitT -= dt; return; }
  if (!t.target) {
    const anchor = t.mode === 'hold' && t.anchor ? t.anchor : t;
    const radius = t.mode === 'hold' ? 70 : 200;      // 原地巡邏＝小圈；自由走動＝大範圍
    const tgt = sampleWanderTarget(anchor.x, anchor.y, radius);
    if (!tgt) { t.waitT = 0.8; return; }
    t.target = tgt; return;
  }
  const dx = t.target.x - t.x, dy = t.target.y - t.y, d = Math.hypot(dx, dy);
  const sp = (TYPES[t.type].walkSpeed || 80) * (t.mode === 'goto' ? 1.5 : 1);   // 指派時走快一點
  const step = sp * dt;
  if (d <= step) {
    t.x = t.target.x; t.y = t.target.y; t.target = null;
    if (t.mode === 'goto') { t.mode = 'hold'; t.anchor = { x: t.x, y: t.y }; flash('開始巡邏', t.x, t.y - 24, '#7ee0c0'); }
    else t.waitT = 0.6 + Math.random() * 1.8;         // 到點後停一下再逛
    return;
  }
  const nx = t.x + dx / d * step, ny = t.y + dy / d * step;
  let blockedX = sentryBlocked(nx, t.y), blockedY = sentryBlocked(t.x, ny);
  if (!blockedX) t.x = nx;
  if (!blockedY) t.y = ny;
  if (blockedX && blockedY) {                          // 路被完全擋住
    t.target = null;
    if (t.mode === 'goto') { t.mode = 'hold'; t.anchor = { x: t.x, y: t.y }; flash('路被擋住了，就地巡邏', t.x, t.y - 24, '#ffd24a'); }
  }
}

// ---- 佈署物件查詢 ----
const buildAt = (c, r) => G.grid[c + ',' + r];
const barrierAt = (c, r) => { const o = G.grid[c + ',' + r]; return (o && o.kind === 'obstacle') ? o : null; };
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
// 黑暗規則：一般建築只能放亮處；「會發光的建築」（探照燈等）可蓋在光圈邊緣附近
// （光圈外再多 LIGHT.placeMargin 像素的容許範圍），用來一步步推光。
const emitsLight = ob => !!(LIGHT.buildings && LIGHT.buildings[ob.id]);
const placeExtra = ob => emitsLight(ob) ? LIGHT.placeMargin : 0;   // 0＝必須全亮
function canPlaceObstacle(v, c, r, lightExtra = 0) {
  if (c < 0 || r < 0 || c + v.w > COLS || r + v.h > ROWS) return false;
  // 只有「擋路格(solid)」才要求空地／不壓牆／不疊其他建築的擋路格／夠亮；
  // 其餘格子只是圖片，可以疊在牆或其他建築的圖片前面。
  for (const [dc, dr] of variantSolidCells(v)) {
    const cc = c + dc, rr = r + dr;
    if (!inGrid(cc, rr)) return false;
    if (isWall(cc, rr) || isEntrance(cc, rr)) return false;
    if (G.grid[cc + ',' + rr]) return false;         // 既有建築的擋路格
    if (!cellNearLight(cc, rr, lightExtra)) return false;
    // （蓋在玩家／哨兵身上是允許的：放下去的瞬間，救援機制會自動把人推到旁邊空位）
  }
  return true;
}
function footprintNearLight(v, c, r, extra) {
  for (let dc = 0; dc < v.w; dc++) for (let dr = 0; dr < v.h; dr++) if (!cellNearLight(c + dc, r + dr, extra)) return false;
  return true;
}
function placeObstacle(ob, c, r) {
  const v = ob[buildOrient], extra = placeExtra(ob);
  if (!footprintNearLight(v, c, r, extra)) {
    flash(emitsLight(ob) ? '離光太遠了，要蓋在光圈邊緣附近' : '太暗了，要先照亮這裡', ...center(c, r), '#ffd24a');
    return;
  }
  if (!canPlaceObstacle(v, c, r, extra)) { flash('這裡放不下', ...center(c, r), '#ff8f8f'); return; }
  if (G.money < ob.cost) { flash('資源不足', ...center(c, r), '#ff8f8f'); return; }
  G.money -= ob.cost;
  const solid = variantSolidCells(v).map(cell => cell.slice());
  const o = { kind: 'obstacle', type: ob.id, orient: buildOrient, c, r, w: v.w, h: v.h, solid, hp: ob.hp, maxhp: ob.hp, spawnT: 0 };
  solid.forEach(([dc, dr]) => { G.grid[(c + dc) + ',' + (r + dr)] = o; });
  G.obstacles.push(o);
}

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
    b.innerHTML = '<img src="' + v.file + '" alt=""><span>' + o.name + '　$' + o.cost + '　HP ' + o.hp + '</span>';
    b.addEventListener('click', () => {
      G.selType = (G.selType === 'build:' + o.id) ? null : 'build:' + o.id;
      renderBuildBar();
      if (G.selType) { buildBar.classList.add('hidden'); }   // 選好就收起選單，開始放置（可連放）
      updateBuildToggle();
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
// 「🧱 建築」按鈕高亮＝選單開著或已選好建築
function updateBuildToggle() {
  const active = !buildBar.classList.contains('hidden') || (G && G.selType && G.selType.startsWith('build:'));
  buildToggle.classList.toggle('sel', !!active);
}
buildToggle.addEventListener('click', () => {
  const opening = buildBar.classList.contains('hidden');
  buildBar.classList.toggle('hidden', !opening);
  if (!opening && G.selType && G.selType.startsWith('build:')) { G.selType = null; renderBuildBar(); }   // 手動收起＝取消選取
  updateBuildToggle();
});
// 關閉建築選單並取消選取（Esc 或程式呼叫）
function closeBuildMenu() {
  buildBar.classList.add('hidden');
  if (G.selType && G.selType.startsWith('build:')) { G.selType = null; renderBuildBar(); }
  updateBuildToggle();
}

// ---- 輸入：點畫面（放置 / 哨兵選單）----
cv.addEventListener('click', e => {
  const rect = cv.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (cv.width / rect.width) + cam.x;   // 加上鏡頭位置＝世界座標
  const y = (e.clientY - rect.top) * (cv.height / rect.height) + cam.y;
  const [c, r] = cellAt(x, y);
  if (!inGrid(c, r)) return;

  if (!G.running) return;
  // 「指派位置巡邏」模式：這一下點擊＝指定目的地
  if (assigning) {
    const t = assigning;
    if (!isLit(x, y)) { flash('要指派在亮處', x, y, '#ffd24a'); return; }
    if (!inGrid(c, r) || isWall(c, r) || isEntrance(c, r) || G.grid[c + ',' + r]) { flash('這裡不能巡邏', x, y, '#ff8f8f'); return; }
    t.mode = 'goto'; t.target = { x, y }; t.anchor = null; t.waitT = 0; assigning = null;
    flash(TYPES[t.type].name + '：前往巡邏點', t.x, t.y - 24, '#8fd3ff');
    return;
  }
  // 點到哨兵 → 開選單
  const hit = G.towers.find(t => Math.hypot(t.x - x, t.y - y) <= 22);
  if (hit) { openSentryMenu(hit); return; }
  closeSentryMenu();
  // 點到障礙物：不動作
  if (buildAt(c, r)) return;
  // 放置
  if (!G.selType) return;
  if (isEntrance(c, r)) { flash('這裡是怪物入口', ...center(c, r), '#ff8f8f'); return; }
  if (isWall(c, r)) { flash('這裡是固定牆', ...center(c, r), '#ff8f8f'); return; }
  if (G.selType.startsWith('build:')) {
    const ob = OBSTACLES.find(o => 'build:' + o.id === G.selType);
    if (ob) placeObstacle(ob, c, r);
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

// ---- 哨兵選單（點哨兵彈出：自由走動／原地巡邏／指派位置／疏導）----
const sentryMenu = document.getElementById('sentryMenu');
let menuSentry = null;    // 目前開著選單的哨兵
let assigning = null;     // 「指派位置巡邏」等待點地圖的哨兵
function openSentryMenu(t) {
  menuSentry = t; assigning = null;
  const spec = TYPES[t.type];
  sentryMenu.innerHTML =
    '<div class="sm-title">' + spec.name + '　汙染 ' + Math.round(t.taint) + '</div>' +
    '<button data-act="free">🚶 自由走動</button>' +
    '<button data-act="hold">📍 在原地巡邏</button>' +
    '<button data-act="goto">🎯 指派位置巡邏</button>' +
    '<button data-act="soothe">💗 疏導（-' + SOOTHE.cost + ' 能量）</button>';
  sentryMenu.querySelectorAll('button').forEach(b => b.addEventListener('click', () => sentryMenuAct(b.dataset.act)));
  // 選單位置：跟著哨兵在畫面上的位置（換算成 CSS 座標）
  const rect = cv.getBoundingClientRect();
  const sx = (t.x - cam.x) * (rect.width / VIEW_W), sy = (t.y - cam.y) * (rect.height / VIEW_H);
  sentryMenu.style.left = Math.round(Math.min(sx + 22, rect.width - 170)) + 'px';
  sentryMenu.style.top = Math.round(Math.max(6, sy - 30)) + 'px';
  sentryMenu.classList.remove('hidden');
}
function closeSentryMenu() { menuSentry = null; sentryMenu.classList.add('hidden'); }
function sentryMenuAct(act) {
  const t = menuSentry; if (!t) return;
  if (act === 'free') { t.mode = 'free'; t.anchor = null; t.target = null; flash('自由走動', t.x, t.y - 24, '#8fd3ff'); }
  else if (act === 'hold') { t.mode = 'hold'; t.anchor = { x: t.x, y: t.y }; t.target = null; flash('在原地巡邏', t.x, t.y - 24, '#8fd3ff'); }
  else if (act === 'goto') { assigning = t; closeSentryMenu(); flash('點地圖指定巡邏位置（Esc 取消）', t.x, t.y - 24, '#ffd479'); return; }
  else if (act === 'soothe') { soothe(t); openSentryMenu(t); return; }   // 疏導後選單留著、更新汙染數字
  closeSentryMenu();
}
window.addEventListener('keydown', e => {
  if (e.key === 'Escape') { assigning = null; closeSentryMenu(); closeBuildMenu(); }
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
  if (!G.over) updatePlayer(dt);   // 玩家隨時可走動
  updateCamera();
  if (G.running && !G.over) update(dt);
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
  // 哨兵走動（巡邏）
  for (const t of G.towers) updateSentry(t, dt);
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
  // 建築放置動畫計時（落地瞬間揚塵）
  for (const o of G.obstacles) {
    if (o.spawnT !== undefined && o.spawnT < DROP_TOTAL) {
      const before = o.spawnT; o.spawnT += dt;
      if (before < DROP.fall && o.spawnT >= DROP.fall) spawnDust(o);
    }
  }
  for (const f of G.effects) {
    f.life -= dt;
    if (f.dust) {   // 塵埃：往外飄、逐漸減速
      f.x += f.vx * dt; f.y += f.vy * dt;
      f.vx *= (1 - 2.5 * dt); f.vy *= (1 - 2.5 * dt);
    }
  }
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

// ---- 建築放置動畫：從上方掉下 → 落地壓扁 → 回彈，落地瞬間揚起塵埃 ----
const DROP = {
  fall: 0.16,      // 掉落時間（秒）
  squash: 0.10,    // 壓扁時間
  rebound: 0.18,   // 回彈時間
  height: 70,      // 從多高掉下來（像素）
};
const DROP_TOTAL = DROP.fall + DROP.squash + DROP.rebound;
// 依動畫進行到第 t 秒，回傳目前的位移與縮放（null＝動畫結束，正常畫）
function dropAnim(t) {
  if (t === undefined || t >= DROP_TOTAL) return null;
  if (t < DROP.fall) {                       // 掉落：加速往下
    const p = t / DROP.fall;
    return { dy: -DROP.height * (1 - p * p), sx: 1, sy: 1 };
  }
  if (t < DROP.fall + DROP.squash) {         // 壓扁：變矮變寬
    const p = (t - DROP.fall) / DROP.squash;
    return { dy: 0, sx: 1 + 0.18 * Math.sin(p * Math.PI), sy: 1 - 0.22 * Math.sin(p * Math.PI) };
  }
  const p = (t - DROP.fall - DROP.squash) / DROP.rebound;   // 回彈：微微拉高再回正
  const k = 0.06 * Math.sin(p * Math.PI);
  return { dy: 0, sx: 1 - k, sy: 1 + k };
}
// 落地瞬間在建築底部揚起塵埃
function spawnDust(o) {
  const w = (o.w || 1) * CELL, x0 = OX + o.c * CELL, yb = OY + (o.r + (o.h || 1)) * CELL;
  for (let i = 0; i < 10; i++) {
    const px = x0 + Math.random() * w;
    const side = px < x0 + w / 2 ? -1 : 1;   // 往左右兩側飄
    const life = 0.45 + Math.random() * 0.3;
    G.effects.push({
      dust: true, x: px, y: yb - 2 - Math.random() * 5,
      vx: side * (20 + Math.random() * 55), vy: -(12 + Math.random() * 28),
      r: 2.5 + Math.random() * 3.5, life, life0: life,
    });
  }
}

// ---- 各種角色/物件的畫法（拆成函式，方便深度排序時逐一呼叫）----
function drawObstacle(o) {
  const w = (o.w || 1) * CELL, h = (o.h || 1) * CELL;
  const x = OX + o.c * CELL, y = OY + o.r * CELL;
  // 放置動畫：位移＋以「底部中央」為錨點的壓扁/回彈縮放
  const a = dropAnim(o.spawnT);
  if (a) {
    ctx.save();
    ctx.translate(0, a.dy);                       // 掉落中的高度位移
    ctx.translate(x + w / 2, y + h);              // 錨點移到底部中央
    ctx.scale(a.sx, a.sy);
    ctx.translate(-(x + w / 2), -(y + h));
  }
  const img = o.type && obstacleImgs[o.type] && obstacleImgs[o.type][o.orient || 'h'];
  if (img && img.complete && img.naturalWidth) ctx.drawImage(img, x, y, w, h);
  else { ctx.fillStyle = '#7a5a3a'; roundRect(x + 3, y + 3, w - 6, h - 6, 5); ctx.fill(); ctx.strokeStyle = '#5a4128'; ctx.lineWidth = 2; ctx.stroke(); }
  if (a) ctx.restore();
  if (o.hp < o.maxhp) {   // 受損才顯示血條
    ctx.fillStyle = '#000'; ctx.fillRect(x + 2, y + h - 6, w - 4, 4);
    ctx.fillStyle = '#c9a26a'; ctx.fillRect(x + 2, y + h - 6, (w - 4) * Math.max(0, o.hp) / o.maxhp, 4);
  }
}
function drawTower(t) {
  const spec = TYPES[t.type];
  ctx.fillStyle = t.berserk ? '#5a1f27' : spec.color; roundRect(t.x - 17, t.y - 17, 34, 34, 6); ctx.fill();
  ctx.fillStyle = '#0e1116'; ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(spec.name, t.x, t.y + 3);
  const w = 34, tx = t.x - 17, ty = t.y + 12;
  ctx.fillStyle = '#000'; ctx.fillRect(tx, ty, w, 4);
  ctx.fillStyle = t.taint > 75 ? '#ff4d4d' : (t.taint > 45 ? '#ffb84d' : '#7ee0c0'); ctx.fillRect(tx, ty, w * t.taint / 100, 4);
  if (t.berserk) { ctx.fillStyle = '#ff4d4d'; ctx.font = 'bold 10px sans-serif'; ctx.fillText('暴走', t.x, t.y - 20); }
}
function drawEnemy(e) {
  ctx.fillStyle = '#c25bce'; ctx.beginPath(); ctx.arc(e.x, e.y, 13, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(e.x - 4, e.y - 2, 2.4, 0, Math.PI * 2); ctx.arc(e.x + 4, e.y - 2, 2.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(e.x - 4, e.y - 2, 1.1, 0, Math.PI * 2); ctx.arc(e.x + 4, e.y - 2, 1.1, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#000'; ctx.fillRect(e.x - 14, e.y - 20, 28, 3);
  ctx.fillStyle = '#7CFC7C'; ctx.fillRect(e.x - 14, e.y - 20, 28 * Math.max(0, e.hp) / e.maxhp, 3);
}
function drawPlayer(p) {
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

// ---- 繪製 ----
function draw() {
  lightsCache = LIGHT.enabled ? getLights() : [];   // 更新這一幀的光源
  computeLightField();                              // 光沿格子擴散、碰牆停（牆後全黑）
  ctx.clearRect(0, 0, cv.width, cv.height);
  // 之後畫的都是「世界座標」：整體平移鏡頭位置，畫面就會跟著玩家捲動
  ctx.save();
  ctx.translate(-Math.round(cam.x), -Math.round(cam.y));
  // 地板貼圖鋪滿整個地圖（未載入時用深色底）
  if (floorPattern) { ctx.fillStyle = floorPattern; ctx.fillRect(OX, OY, COLS * CELL, ROWS * CELL); }
  else { ctx.fillStyle = '#161b22'; ctx.fillRect(OX, OY, COLS * CELL, ROWS * CELL); }
  // 地面層（地板、地面裝飾）：永遠畫在角色下方
  drawMapGround(ctx);
  // 區域色（半透明疊上，貼圖仍可見）＋ 格線 ＋ 沒有美術的固定牆
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

  // ---- 深度排序：會遮擋的地圖圖片（牆/物件）＋障礙物＋哨兵＋怪物＋玩家，一起依「底部Y」由上往下畫 ----
  //      底部Y 較小（畫面上方）的先畫、會被後畫的蓋住 → 走到牆後面就會被牆遮住。
  const sortables = [];
  collectMapOccluders(ctx, sortables);
  for (const o of G.obstacles) sortables.push({ y: (o.r + (o.h || 1)) * CELL, draw: () => drawObstacle(o) });
  for (const t of G.towers) sortables.push({ y: t.y + 17, draw: () => drawTower(t) });
  for (const e of G.enemies) if (isLit(e.x, e.y)) sortables.push({ y: e.y + 13, draw: () => drawEnemy(e) });   // 黑暗中的怪物看不到
  if (G.player) sortables.push({ y: G.player.y + 16, draw: () => drawPlayer(G.player) });
  sortables.sort((a, b) => a.y - b.y);
  for (const it of sortables) it.draw();

  // 上層（樹冠、屋簷等，永遠蓋在最上面）
  drawMapTop(ctx);
  // 特效
  for (const f of G.effects) {
    if (f.text) {
      ctx.globalAlpha = Math.max(0, f.life / 0.8); ctx.fillStyle = f.color; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(f.text, f.x, f.y + (f.vy || 0) * (0.8 - f.life)); ctx.globalAlpha = 1;
    } else if (f.dust) {   // 塵埃：淡土色小圓點，隨時間變淡、略微放大
      const p = Math.max(0, f.life / f.life0);
      ctx.globalAlpha = 0.45 * p;
      ctx.fillStyle = '#cfc4ae';
      ctx.beginPath(); ctx.arc(f.x, f.y, f.r * (1.6 - 0.6 * p), 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    } else {
      ctx.globalAlpha = Math.max(0, f.life / 0.12); ctx.strokeStyle = f.color; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(f.x1, f.y1); ctx.lineTo(f.x2, f.y2); ctx.stroke(); ctx.globalAlpha = 1;
    }
  }
  // 建築放置預覽（40% 半透明，放不下時紅框）
  if (hoverCell && G.running && G.selType && G.selType.startsWith('build:')) {
    const ob = OBSTACLES.find(o => 'build:' + o.id === G.selType);
    if (ob) {
      const v = ob[buildOrient], [c, r] = hoverCell;
      const x = OX + c * CELL, y = OY + r * CELL, w = v.w * CELL, h = v.h * CELL;
      const ok = canPlaceObstacle(v, c, r, placeExtra(ob));   // 探照燈可蓋在光圈邊緣附近
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
  drawDarkness();  // 蓋上黑幕、在光源處挖洞
  // 指派巡邏位置中：畫面上方顯示提示
  if (assigning) {
    ctx.fillStyle = 'rgba(20,25,35,.75)'; ctx.fillRect(0, 0, cv.width, 44);
    ctx.fillStyle = '#ffd479'; ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('🎯 點擊地圖，指定「' + TYPES[assigning.type].name + '」的巡邏位置（Esc 取消）', cv.width / 2, 29);
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
    '後室<b>一片漆黑</b>——只有營地和你身上的燈是亮的。<br><b>三位哨兵已在基地待命</b>：點擊哨兵可下指令（巡邏／指派位置／疏導）。<br>放置<b>探照燈</b>照亮區域：<b>亮處才能放建築</b>，黑暗中的怪物<b>看不見</b>。<br>用 <b>WASD／方向鍵</b>移動嚮導，怪物<b>由上往下</b>攻進<b>營地</b>；在哨兵<b>暴走</b>前記得<b>疏導</b>。守住 5 波即可控制 Y 區。',
    '開始防禦');
}
function winOverlay() { showOverlay('✅ Y 區已控制', '你守住了營地、擋下所有波次！', '再玩一次'); }
function loseOverlay() { showOverlay('💀 營地失守', '怪物攻進了營地。<br>試試多築牆卡位、提早疏導快暴走的哨兵。', '再挑戰'); }

function begin() { closeSentryMenu(); assigning = null; newGame(); G.phase = 'playing'; hideOverlay(); G.running = true; G.betweenWaves = 0.01; }
function win() { G.over = true; G.won = true; G.running = false; G.phase = 'won'; winOverlay(); }
function lose() { G.over = true; G.running = false; G.phase = 'lost'; loseOverlay(); }
ovBtn.addEventListener('click', begin);

// ---- 啟動遊戲 ----
newGame(); renderBuildBar(); showStart();
requestAnimationFrame(loop);
