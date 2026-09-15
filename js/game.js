/* ===== 台北地下災害應變中心 — 塔防主邏輯 =====
   遊戲核心：遊戲狀態、波次、怪物、玩家操作、主迴圈、畫面繪製、HUD、勝負判定。
   其他系統拆在獨立檔案：
   - js/lighting.js  黑暗與光源（格子擴散光）
   - js/build.js     建築系統（放置判定/選單/動畫）
   - js/sentry.js    哨兵系統（巡邏AI/點擊選單/疏導）
   數值在 data/balance.js；格線在 js/config.js；尋路在 js/pathfinding.js。
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
const PLAYER_CHARACTER = 'winter';
const PLAYER_OUTFIT = 'B';
// ---- 角色精靈圖（玩家與哨兵共用）----
// 資料夾 images/character/<角色>_<服裝>/，檔名 <角色><服裝>_0000_Front.png …
const CHARACTER_SPRITE_FILES = {
  front: ['0000_Front.png', '0001_Front-Walking01.png', '0002_Front-Walking02.png'],
  back:  ['0009_back.png', '0010_back-walking01.png', '0011_back-walking02.png'],
  left:  ['0003_Leftside.png', '0004_Leftside-walking01.png', '0005_Leftside-walking02.png'],
  right: ['0006_right-side.png', '0007_right-side-walking01.png', '0008_right-side-walking02.png'],
  // 正面待機眨眼：半閉眼 → 閉眼 → 全閉，再倒放回張眼。
  blink: ['0014_closeeyes01.png', '0013_closeeyes02.png', '0012_closeeyes03.png'],
};
function loadCharacterSprites(folder) {   // folder 例如 'winter_B'
  const prefix = folder.replace('_', '') + '_';
  const set = {};
  for (const k of Object.keys(CHARACTER_SPRITE_FILES)) {
    set[k] = CHARACTER_SPRITE_FILES[k].map(file => {
      const img = new Image(); img.src = `images/character/${folder}/${prefix}${file}`; return img;
    });
  }
  return set;
}
const playerSprites = loadCharacterSprites(`${PLAYER_CHARACTER}_${PLAYER_OUTFIT}`);
const sentrySprites = {};   // 哨兵類型 → 精靈圖（data/balance.js 的 TYPES 有填 sprite 才有）
for (const type of Object.keys(TYPES)) if (TYPES[type].sprite) sentrySprites[type] = loadCharacterSprites(TYPES[type].sprite);

// 站著不動時的眨眼計時（玩家與哨兵共用）
function updateBlink(who, dt) {
  if (who.dir !== 'front') { who.blinkTime = -1; return; }
  if (who.blinkTime >= 0) {
    who.blinkTime += dt;
    if (who.blinkTime >= 0.42) { who.blinkTime = -1; who.blinkWait = 2 + Math.random() * 4; }
  } else {
    who.blinkWait = (who.blinkWait ?? 2 + Math.random() * 3) - dt;
    if (who.blinkWait <= 0) who.blinkTime = 0;
  }
}
// 依朝向／走路／眨眼狀態挑出這一幀要畫的圖
function pickCharacterFrame(set, who) {
  if (!who.moving && who.dir === 'front' && who.blinkTime >= 0) {
    const blinkOrder = [0, 1, 2, 2, 1, 0];
    return set.blink[blinkOrder[Math.min(blinkOrder.length - 1, Math.floor(who.blinkTime / 0.07))]];
  }
  const frames = set[who.dir || 'front'];
  const walkOrder = [1, 0, 2, 0];
  return frames && frames[who.moving ? walkOrder[Math.floor(who.anim * 8) % walkOrder.length] : 0];
}
// 哨兵走路動畫：用這一幀實際移動的距離決定朝向與是否在走
function animateSentry(t, mx, my, dt) {
  t.moving = Math.hypot(mx, my) > 0.01;
  if (!t.moving) { t.anim = 0; t.dir = t.dir || 'front'; updateBlink(t, dt); return; }
  t.blinkTime = -1;
  t.dir = Math.abs(mx) >= Math.abs(my) ? (mx < 0 ? 'left' : 'right') : (my < 0 ? 'back' : 'front');
  t.anim = (t.anim || 0) + dt;
}
const keys = {};                         // 目前按住的按鍵
window.addEventListener('keydown', e => {
  const k = e.key.toLowerCase(); keys[k] = true;
  if (k.startsWith('arrow')) e.preventDefault();   // 方向鍵不要捲動網頁
});
window.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });

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
  sfx('wave');   // 新一波開始
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
    updateBlink(p, dt);
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
    if (!isLit(x, y)) { sfx('error'); flash('要指派在亮處', x, y, '#ffd24a'); return; }
    if (!inGrid(c, r) || isWall(c, r) || isEntrance(c, r) || G.grid[c + ',' + r]) { sfx('error'); flash('這裡不能巡邏', x, y, '#ff8f8f'); return; }
    t.mode = 'goto'; t.target = { x, y }; t.anchor = null; t.waitT = 0; assigning = null;
    sfx('button');
    flash(TYPES[t.type].name + '：前往巡邏點', t.x, t.y - 24, '#8fd3ff');
    return;
  }
  // 點到哨兵 → 開選單
  // 有精靈圖的哨兵比色塊高，判定圈往上移到身體中間、放大一點
  const hit = G.towers.find(t => sentrySprites[t.type] ? Math.hypot(t.x - x, t.y - 14 - y) <= 28 : Math.hypot(t.x - x, t.y - y) <= 22);
  if (hit) { openSentryMenu(hit); return; }
  closeSentryMenu();
  // 點到障礙物：不動作
  if (buildAt(c, r)) return;
  // 放置（合不合法由 placeObstacle 檢查「擋路格」決定，跟預覽框一致）
  if (!G.selType) return;
  if (G.selType.startsWith('build:')) {
    const ob = buildableById(G.selType.slice(6));   // 去掉 'build:' 前綴，跨障礙物/裝飾查找
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
  // 目標格有障礙物 → 停下打牆（每隔 breakInterval 秒攻擊一次）
  const tc = e.tcell, o = tc ? barrierAt(tc[0], tc[1]) : null;
  if (o) {
    e.atkCd = (e.atkCd || 0) - dt;
    if (e.atkCd <= 0) {
      e.atkCd = BARRIER.breakInterval;
      o.hp -= BARRIER.breakDmg;
      o.hitT = HIT_DUR;                        // 觸發閃紅＋震動
      sfx('hit');                              // 敲擊聲
      if (o.hp <= 0) { removeBarrier(o); e.hasTarget = false; }
    }
    return;
  }
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
  for (const t of G.towers) {
    const ox = t.x, oy = t.y;
    updateSentry(t, dt);
    animateSentry(t, t.x - ox, t.y - oy, dt);
  }
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
      if (t.taint >= 100 && !t.berserk) { t.berserk = true; G.lives -= BERSERK.livesPenalty; sfx('berserk'); flash('暴走!', t.x, t.y - 30, '#ff4d4d'); }
    }
  }
  for (const e of G.enemies) { if (e.hp <= 0 && !e.dead) { e.dead = true; G.money += e.reward; sfx('kill'); } }
  G.enemies = G.enemies.filter(e => !e.dead);
  // 建築放置動畫計時（落地瞬間揚塵）＋受擊閃紅計時
  for (const o of G.obstacles) {
    if (o.spawnT !== undefined && o.spawnT < DROP_TOTAL) {
      const before = o.spawnT; o.spawnT += dt;
      if (before < DROP.fall && o.spawnT >= DROP.fall) spawnDust(o);
    }
    if (o.hitT > 0) o.hitT -= dt;
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
const FLASH_LIFE = 1.5;   // 提示字停留時間（秒）；想更久／更短改這裡
function flash(text, x, y, color) { G.effects.push({ text, x, y, life: FLASH_LIFE, life0: FLASH_LIFE, color, vy: -22 }); }

// ---- 各種角色/物件的畫法（拆成函式，方便深度排序時逐一呼叫）----
const HIT_DUR = 0.3;   // 建築被攻擊時「閃紅＋震動」持續秒數
function drawObstacle(o) {
  const w = (o.w || 1) * CELL, h = (o.h || 1) * CELL;
  // 受擊震動：依剩餘 hitT 隨機抖動，越接近結束越小
  const hit = o.hitT > 0 ? o.hitT / HIT_DUR : 0;
  const shX = hit ? (Math.random() * 2 - 1) * 4 * hit : 0;
  const shY = hit ? (Math.random() * 2 - 1) * 4 * hit : 0;
  const x = OX + o.c * CELL + shX, y = OY + o.r * CELL + shY;
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
  if (hit) {   // 閃紅：半透明紅疊在圖上
    ctx.globalAlpha = 0.55 * hit; ctx.fillStyle = '#ff3030';
    ctx.fillRect(x, y, w, h); ctx.globalAlpha = 1;
  }
  if (a) ctx.restore();
  if (o.hp < o.maxhp) {   // 受損才顯示血條
    ctx.fillStyle = '#000'; ctx.fillRect(x + 2, y + h - 6, w - 4, 4);
    ctx.fillStyle = '#c9a26a'; ctx.fillRect(x + 2, y + h - 6, (w - 4) * Math.max(0, o.hp) / o.maxhp, 4);
  }
}
function drawTower(t) {
  const spec = TYPES[t.type];
  const set = sentrySprites[t.type];
  const img = set && pickCharacterFrame(set, t);
  let ty = t.y + 12, labelY = t.y - 20;   // 汙染條／「暴走」字的位置（色塊版）
  if (img && img.complete && img.naturalWidth) {
    const size = PLAYER.drawSize;
    const shX = t.berserk ? (Math.random() * 2 - 1) * 1.5 : 0;   // 暴走：微微發抖
    if (t.berserk) {   // 暴走：腳下紅光
      ctx.fillStyle = 'rgba(255,60,60,0.45)';
      ctx.beginPath(); ctx.ellipse(t.x, t.y + 14, 20, 7, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, t.x - size / 2 + shX, t.y - size + 18, size, size);
    ctx.imageSmoothingEnabled = true;
    ty = t.y + 20; labelY = t.y - size + 14;
  } else {
    ctx.fillStyle = t.berserk ? '#5a1f27' : spec.color; roundRect(t.x - 17, t.y - 17, 34, 34, 6); ctx.fill();
    ctx.fillStyle = '#0e1116'; ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(spec.name, t.x, t.y + 3);
  }
  const w = 34, tx = t.x - 17;
  ctx.fillStyle = '#000'; ctx.fillRect(tx, ty, w, 4);
  ctx.fillStyle = t.taint > 75 ? '#ff4d4d' : (t.taint > 45 ? '#ffb84d' : '#7ee0c0'); ctx.fillRect(tx, ty, w * t.taint / 100, 4);
  if (t.berserk) { ctx.fillStyle = '#ff4d4d'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('暴走', t.x, labelY); }
}
function drawEnemy(e) {
  ctx.fillStyle = '#c25bce'; ctx.beginPath(); ctx.arc(e.x, e.y, 13, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(e.x - 4, e.y - 2, 2.4, 0, Math.PI * 2); ctx.arc(e.x + 4, e.y - 2, 2.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(e.x - 4, e.y - 2, 1.1, 0, Math.PI * 2); ctx.arc(e.x + 4, e.y - 2, 1.1, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#000'; ctx.fillRect(e.x - 14, e.y - 20, 28, 3);
  ctx.fillStyle = '#7CFC7C'; ctx.fillRect(e.x - 14, e.y - 20, 28 * Math.max(0, e.hp) / e.maxhp, 3);
}
function drawPlayer(p) {
  const img = pickCharacterFrame(playerSprites, p);
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
      const life0 = f.life0 || 0.8;
      const alpha = Math.min(1, f.life / 0.6);                 // 最後 0.6 秒才淡出，其餘維持清晰
      const ty = f.y + (f.vy || 0) * Math.min(0.8, life0 - f.life);   // 只在前段緩緩上飄
      ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center';
      // 黑底標籤：讓提示字在任何背景上都看得清楚
      const tw = ctx.measureText(f.text).width;
      ctx.globalAlpha = alpha * 0.72; ctx.fillStyle = '#000';
      roundRect(f.x - tw / 2 - 8, ty - 15, tw + 16, 21, 6); ctx.fill();
      ctx.globalAlpha = alpha; ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, ty);
      ctx.globalAlpha = 1;
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
    const ob = buildableById(G.selType.slice(6));   // 去掉 'build:' 前綴，跨障礙物/裝飾查找
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

function begin() { sfx('button'); closeSentryMenu(); assigning = null; newGame(); G.phase = 'playing'; hideOverlay(); G.running = true; G.betweenWaves = 0.01; }
function win() { G.over = true; G.won = true; G.running = false; G.phase = 'won'; sfx('win'); winOverlay(); }
function lose() { G.over = true; G.running = false; G.phase = 'lost'; sfx('lose'); loseOverlay(); }
ovBtn.addEventListener('click', begin);

// ---- 啟動遊戲 ----
newGame(); renderBuildBar(); showStart();
requestAnimationFrame(loop);
