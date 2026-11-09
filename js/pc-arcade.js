/* ===== 2F應變中心的電腦：🐍 貪食蛇、🧱 俄羅斯方塊 =====
   ・視窗、桌面圖示在 js/pc-desktop.js（這裡只管遊戲本身）；樣式在 css/style.css 的「貪食蛇／俄羅斯方塊」
   ・鍵盤：電腦桌面會把按鍵交給「最上面那個視窗」的遊戲（pc-desktop.js 的 keydown 呼叫 pcArcadeKey）
   ・手機：畫面下方有方向按鈕可以點
   ・視窗縮小、被別的視窗蓋住、電腦關機時：遊戲自動暫停
   ・最高分記在 tudrc_arcade_best_v1（已加進 js/new-game.js 的進度清單，跟著存檔）
   ・遊戲紀錄（js/pc-stats.js）：開始動之後算一局，玩的時候每秒記時間（暫停、結束就不算）

   🐍 貪食蛇
     方向鍵／WASD 轉彎、空白鍵或 P 暫停；吃到紅點變長、加分；撞牆或撞到自己就結束
     速度：慢／普通／快，越快每顆分數越高
   🧱 俄羅斯方塊
     ←→ 移動（按住會快速連續移動）、↓ 加速往下（按住一直往下滑）、↑ 或 X 順時針轉、Z 逆時針轉、空白鍵直接落到底、C 或 Shift 保留、P 暫停
     消掉一排 100、兩排 300、三排 500、四排 800（再乘上等級）；每消 10 排升一級，掉得更快
     方塊用「7 個一輪」發：每 7 個裡面 7 種形狀各出現一次，不會一直等不到長條
*/
const PCA_BEST_KEY = 'tudrc_arcade_best_v1';
const pcaBest = (() => { try { return JSON.parse(localStorage.getItem(PCA_BEST_KEY) || '{}') || {}; } catch (_) { return {}; } })();
function pcaSaveBest(id, score) {   // 破紀錄才存，回傳 true＝破紀錄了
  if (score <= (pcaBest[id] || 0)) return false;
  pcaBest[id] = score;
  try { localStorage.setItem(PCA_BEST_KEY, JSON.stringify(pcaBest)); } catch (_) {}
  return true;
}
// 這個遊戲現在能不能動：電腦開著、視窗在、沒縮小、而且是最上面那個視窗
function pcaActive(id) {
  const w = pcd.wins[id];
  return pcDesktopOpen && !!w && !w.classList.contains('min') && topPcWin() === w;
}
// 共用的小工具：畫面上的按鈕按完就把焦點拿掉，不然按空白鍵會變成「再按一次那個按鈕」
function pcaBar(body, handler) {
  body.addEventListener('click', e => {
    const b = e.target.closest('button[data-a], button[data-v]'); if (!b) return;
    b.blur(); handler(b); sfx('button');
  });
}
// 畫布照螢幕的像素密度放大，畫出來才不會糊
function pcaSizeCanvas(cv, w, h) {
  const r = window.devicePixelRatio || 1;
  cv.style.width = w + 'px'; cv.style.height = h + 'px';
  if (cv.width !== Math.round(w * r) || cv.height !== Math.round(h * r)) { cv.width = Math.round(w * r); cv.height = Math.round(h * r); }
  const ctx = cv.getContext('2d'); ctx.setTransform(r, 0, 0, r, 0, 0);
  return ctx;
}
// 畫布正中間的大字（開始提示、暫停、結束）
function pcaOverlay(ctx, W, H, big, small) {
  ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff'; ctx.font = 'bold ' + Math.max(16, Math.round(W / 12)) + 'px "Microsoft JhengHei", sans-serif';
  ctx.fillText(big, W / 2, H / 2 - 12);
  if (small) { ctx.font = Math.max(11, Math.round(W / 24)) + 'px "Microsoft JhengHei", sans-serif'; ctx.fillStyle = '#d8e4ff'; ctx.fillText(small, W / 2, H / 2 + 16); }
}
// 把視窗挪回螢幕裡面（螢幕小的時候）
function pcaKeepInside(id) {
  const w = pcd.wins[id]; if (!w) return;
  const screen = pcd.el.querySelector('.pcd-screen'), H = screen.clientHeight - 34, W = screen.clientWidth;
  const r = w.getBoundingClientRect(), sr = screen.getBoundingClientRect();
  if (r.bottom > sr.top + H) w.style.top = Math.max(0, H - r.height) + 'px';
  if (r.right > sr.right) w.style.left = Math.max(0, W - r.width) + 'px';
}
// 手機用的方向按鈕
const pcaPad = keys => '<div class="pcd-arc-pad">' + keys.map(([k, t]) => '<button type="button" data-pad="' + k + '">' + t + '</button>').join('') + '</div>';
function pcaBindPad(body, id) {
  body.querySelector('.pcd-arc-pad').addEventListener('pointerdown', e => {
    const b = e.target.closest('[data-pad]'); if (!b) return;
    e.preventDefault(); focusPcWin(id);
    pcArcadeKey(id, { key: b.dataset.pad, repeat: false });
  });
  const up = e => { const b = e.target.closest('[data-pad]'); if (b) pcArcadeKeyUp(id, b.dataset.pad); };
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(t => body.querySelector('.pcd-arc-pad').addEventListener(t, up));
}

// ---- 共用的計時：每一格畫面呼叫，玩的時候累積滿 1 秒就記進遊戲紀錄 ----
function pcaTick(g, id, dt) {
  g.playMs += dt;
  while (g.playMs >= 1000) { g.playMs -= 1000; minigameSecond(id); }
}
// 每個遊戲各自一個 requestAnimationFrame 迴圈；視窗關掉就停
function pcaLoop(id, g, step) {
  let last = performance.now();
  const frame = now => {
    if (!pcd.wins[id] || g.dead) return;
    const dt = Math.min(100, now - last); last = now;
    if (g.state === 'run' && !pcaActive(id)) { g.state = 'pause'; g.autoPaused = true; g.render(); }   // 被蓋住、縮小、關機：自動暫停
    if (g.state === 'run') { pcaTick(g, id, dt); step(dt); }
    g.raf = requestAnimationFrame(frame);
  };
  g.raf = requestAnimationFrame(frame);
}
function stopPcArcade(id) {   // 視窗關掉時（pc-desktop.js 的 closePcWin）
  const g = { snake: pcd.snake, tetris: pcd.tetris, pinball: pcd.pinball }[id];
  if (g) { g.dead = true; cancelAnimationFrame(g.raf); }
}

// ================= 🐍 貪食蛇 =================
const PCS_W = 20, PCS_H = 16;   // 場地 20 格寬 × 16 格高
const PCS_SPEEDS = { slow: { name: '慢', ms: 170, pts: 5 }, normal: { name: '普通', ms: 115, pts: 10 }, fast: { name: '快', ms: 75, pts: 20 } };
const PCS_DIRS = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0], w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0] };

function initPcSnake(body) {
  body.innerHTML = '<div class="pcd-arc pcd-snake"><div class="pcd-fc-bar">' +
      '<button type="button" data-a="new">新局</button><button type="button" data-a="pause">暫停</button>' +
      '<span class="pcd-gm-opts">' + Object.entries(PCS_SPEEDS).map(([k, s]) => '<button type="button" data-v="' + k + '">' + s.name + '</button>').join('') + '</span>' +
    '</div><div class="pcd-arc-info"><span>分數 <b class="pcs-score">0</b></span><span>長度 <b class="pcs-len">3</b></span><span>最高 <b class="pcs-best">0</b></span></div>' +
    '<canvas class="pcd-arc-cv"></canvas>' +
    pcaPad([['ArrowUp', '▲'], ['ArrowLeft', '◀'], ['ArrowDown', '▼'], ['ArrowRight', '▶'], ['p', '❚❚']]) +
    '<div class="pcd-arc-msg">方向鍵／WASD 轉彎，空白鍵暫停</div></div>';
  const g = pcd.snake = { body, cv: body.querySelector('canvas'), speed: 'normal', cell: 18, playMs: 0 };
  g.render = () => renderPcSnake();
  pcaBar(body, b => {
    if (b.dataset.a === 'new') newPcSnake();
    else if (b.dataset.a === 'pause') pcSnakePause();
    else if (b.dataset.v) { g.speed = b.dataset.v; newPcSnake(); }
  });
  pcaBindPad(body, 'snake');
  newPcSnake();
  pcaLoop('snake', g, dt => {
    g.acc += dt;
    const ms = PCS_SPEEDS[g.speed].ms;
    while (g.acc >= ms && g.state === 'run') { g.acc -= ms; stepPcSnake(); }
  });
}
function newPcSnake() {
  const g = pcd.snake, y = Math.floor(PCS_H / 2);
  Object.assign(g, { snake: [{ x: 5, y }, { x: 4, y }, { x: 3, y }], dir: [1, 0], queue: [], score: 0, state: 'ready', acc: 0, autoPaused: false, newBest: false });
  placePcSnakeFood();
  g.body.querySelectorAll('[data-v]').forEach(b => b.classList.toggle('on', b.dataset.v === g.speed));
  fitPcSnake(); renderPcSnake();
}
function placePcSnakeFood() {
  const g = pcd.snake, used = new Set(g.snake.map(p => p.y * PCS_W + p.x));
  const free = []; for (let i = 0; i < PCS_W * PCS_H; i++) if (!used.has(i)) free.push(i);
  if (!free.length) { g.food = null; return; }
  const i = free[Math.floor(Math.random() * free.length)];
  g.food = { x: i % PCS_W, y: Math.floor(i / PCS_W) };
}
function pcSnakePause() {
  const g = pcd.snake;
  if (g.state === 'run') g.state = 'pause';
  else if (g.state === 'pause') { g.state = 'run'; g.autoPaused = false; }
  renderPcSnake();
}
function stepPcSnake() {
  const g = pcd.snake;
  while (g.queue.length) {   // 排隊的轉彎：不能直接掉頭
    const d = g.queue.shift();
    if (d[0] !== -g.dir[0] || d[1] !== -g.dir[1]) { g.dir = d; break; }
  }
  const h = g.snake[0], nx = h.x + g.dir[0], ny = h.y + g.dir[1];
  const eat = g.food && nx === g.food.x && ny === g.food.y;
  const body = eat ? g.snake : g.snake.slice(0, -1);   // 沒吃到時尾巴會讓開，可以剛好追著尾巴走
  if (nx < 0 || ny < 0 || nx >= PCS_W || ny >= PCS_H || body.some(p => p.x === nx && p.y === ny)) {
    g.state = 'over'; g.newBest = pcaSaveBest('snake', g.score); sfx('error'); renderPcSnake(); return;
  }
  g.snake.unshift({ x: nx, y: ny });
  if (eat) {
    g.score += PCS_SPEEDS[g.speed].pts; sfx('blip'); placePcSnakeFood();
    if (!g.food) { g.state = 'over'; g.won = true; g.newBest = pcaSaveBest('snake', g.score); sfx('achievement'); }
  } else g.snake.pop();
  renderPcSnake();
}
function fitPcSnake() {
  const g = pcd.snake; if (!g || !pcd.wins.snake) return;
  const screen = pcd.el.querySelector('.pcd-screen'), H = screen.clientHeight - 34, W = screen.clientWidth;
  g.cell = Math.max(10, Math.min(22, Math.floor((H - 230) / PCS_H), Math.floor((W - 50) / PCS_W)));
  renderPcSnake(); pcaKeepInside('snake');
}
function renderPcSnake() {
  const g = pcd.snake, c = g.cell, W = PCS_W * c, H = PCS_H * c;
  const ctx = pcaSizeCanvas(g.cv, W, H);
  // 草地棋盤格
  for (let y = 0; y < PCS_H; y++) for (let x = 0; x < PCS_W; x++) { ctx.fillStyle = (x + y) % 2 ? '#a7d65a' : '#b3df66'; ctx.fillRect(x * c, y * c, c, c); }
  if (g.food) {   // 紅點（蘋果）
    ctx.fillStyle = '#e0362c'; ctx.beginPath(); ctx.arc(g.food.x * c + c / 2, g.food.y * c + c / 2 + 1, c * 0.38, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3d7a1e'; ctx.fillRect(g.food.x * c + c / 2 - 1, g.food.y * c + 2, 3, c * 0.25);
  }
  g.snake.forEach((p, i) => {   // 蛇：頭深一點，身體越後面越淡
    const t = i / Math.max(1, g.snake.length - 1);
    ctx.fillStyle = i === 0 ? '#2752c9' : 'rgb(' + Math.round(62 + t * 50) + ',' + Math.round(110 + t * 50) + ',' + Math.round(230 - t * 30) + ')';
    const m = i === 0 ? 1 : 2;
    ctx.beginPath(); ctx.roundRect(p.x * c + m, p.y * c + m, c - m * 2, c - m * 2, c * 0.3); ctx.fill();
  });
  const h = g.snake[0], [dx, dy] = g.dir;   // 眼睛看著前進方向
  ctx.fillStyle = '#fff';
  [-1, 1].forEach(s => { ctx.beginPath(); ctx.arc(h.x * c + c / 2 + dx * c * 0.15 - dy * s * c * 0.2, h.y * c + c / 2 + dy * c * 0.15 + dx * s * c * 0.2, c * 0.13, 0, Math.PI * 2); ctx.fill(); });
  if (g.state === 'ready') pcaOverlay(ctx, W, H, '按方向鍵開始', '吃紅點變長，別撞牆、別咬到自己');
  else if (g.state === 'pause') pcaOverlay(ctx, W, H, '暫停中', g.autoPaused ? '點一下視窗、再按空白鍵繼續' : '按空白鍵繼續');
  else if (g.state === 'over') pcaOverlay(ctx, W, H, g.won ? '整片都是蛇了！' : '遊戲結束', (g.newBest ? '🏆 新紀錄！' : '') + '按 Enter 或「新局」再玩一次');
  const q = s => g.body.querySelector(s);
  q('.pcs-score').textContent = g.score; q('.pcs-len').textContent = g.snake.length; q('.pcs-best').textContent = pcaBest.snake || 0;
  q('[data-a="pause"]').textContent = g.state === 'pause' ? '▶ 繼續' : '暫停';
  q('[data-a="pause"]').disabled = g.state === 'ready' || g.state === 'over';
}
function pcSnakeKey(e) {
  const g = pcd.snake, k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  if (k === ' ' || k === 'p') { if (!e.repeat) pcSnakePause(); return true; }
  if (k === 'Enter') { if (g.state === 'over') newPcSnake(); return true; }
  const d = PCS_DIRS[k]; if (!d) return false;
  if (g.state === 'over') return true;
  if (g.state === 'ready') {   // 第一次按方向＝開始（不能一開始就往回走）
    if (d[0] === -1) return true;
    g.state = 'run'; g.dir = d; g.acc = 0; minigameRound('snake'); renderPcSnake(); return true;
  }
  if (g.state === 'pause') { g.state = 'run'; g.autoPaused = false; }
  const last = g.queue.length ? g.queue[g.queue.length - 1] : g.dir;
  if ((d[0] !== last[0] || d[1] !== last[1]) && g.queue.length < 3) g.queue.push(d);
  return true;
}

// ================= 🧱 俄羅斯方塊 =================
const PCT_W = 10, PCT_H = 20;
// 7 種方塊：用 4×4 的格子表示，1＝有方塊
const PCT_PIECES = {
  I: { color: '#38c6e8', m: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]] },
  O: { color: '#f2cf3a', m: [[1, 1], [1, 1]] },
  T: { color: '#a65ad6', m: [[0, 1, 0], [1, 1, 1], [0, 0, 0]] },
  S: { color: '#5ac65a', m: [[0, 1, 1], [1, 1, 0], [0, 0, 0]] },
  Z: { color: '#e04848', m: [[1, 1, 0], [0, 1, 1], [0, 0, 0]] },
  J: { color: '#3d6ee0', m: [[1, 0, 0], [1, 1, 1], [0, 0, 0]] },
  L: { color: '#f08a2c', m: [[0, 0, 1], [1, 1, 1], [0, 0, 0]] },
};
const PCT_LINE_PTS = [0, 100, 300, 500, 800];
const pctRotate = (m, dir) => m[0].map((_, i) => dir > 0 ? m.map(r => r[i]).reverse() : m.map(r => r[r.length - 1 - i]));   // 1＝順時針、-1＝逆時針

function initPcTetris(body) {
  body.innerHTML = '<div class="pcd-arc pcd-tetris"><div class="pcd-fc-bar">' +
      '<button type="button" data-a="new">新局</button><button type="button" data-a="pause">暫停</button>' +
    '</div><div class="pcd-arc-main"><canvas class="pcd-arc-cv"></canvas>' +
      '<div class="pcd-arc-side">' +
        '<div class="pct-box"><span>下一個</span><canvas class="pct-next"></canvas></div>' +
        '<div class="pct-box"><span>保留（C）</span><canvas class="pct-hold"></canvas></div>' +
        '<div class="pct-stat">分數<b class="pct-score">0</b></div><div class="pct-stat">消掉<b class="pct-lines">0</b></div>' +
        '<div class="pct-stat">等級<b class="pct-level">1</b></div><div class="pct-stat">最高<b class="pct-best">0</b></div>' +
      '</div></div>' +
    pcaPad([['ArrowLeft', '◀'], ['ArrowUp', '⟳'], ['ArrowRight', '▶'], ['ArrowDown', '▼'], [' ', '⤓'], ['c', '保留'], ['p', '❚❚']]) +
    '<div class="pcd-arc-msg">←→ 移動　↑ 轉　↓ 加速　空白鍵 落到底　C 保留　P 暫停</div></div>';
  const g = pcd.tetris = { body, cv: body.querySelector('.pcd-arc-cv'), next: body.querySelector('.pct-next'), holdCv: body.querySelector('.pct-hold'), cell: 22, playMs: 0 };
  g.render = () => renderPcTetris();
  pcaBar(body, b => { if (b.dataset.a === 'new') newPcTetris(); else if (b.dataset.a === 'pause') pcTetrisPause(); });
  pcaBindPad(body, 'tetris');
  newPcTetris();
  pcaLoop('tetris', g, dt => {
    stepPcTetrisFx(dt);
    if (g.clearing) {   // 消排的閃一下動畫
      g.clearing.t -= dt;
      if (g.clearing.t <= 0) { finishPcTetrisClear(); }
      renderPcTetris(); return;
    }
    stepPcTetrisHold(dt);
    if (!g.cur) { renderPcTetris(); return; }
    g.acc += dt;
    const ms = Math.max(70, 800 - (g.level - 1) * 75);   // 等級越高掉越快
    if (g.acc >= ms) { g.acc = 0; if (!movePcTetris(0, 1)) lockPcTetris(); }
    renderPcTetris();   // 特效每一格都要重畫
  });
}
function newPcTetris() {
  const g = pcd.tetris;
  Object.assign(g, { board: Array.from({ length: PCT_H }, () => Array(PCT_W).fill(null)), bag: [], queue: [], hold: null, holdUsed: false,
    score: 0, lines: 0, level: 1, state: 'ready', held: { L: false, R: false, D: false, dir: 0, t: 0, acc: 0, dacc: 0 }, acc: 0, clearing: null, autoPaused: false, newBest: false, cur: null,
    fx: { parts: [], shake: 0, flash: 0, glow: 0 } });
  fillPcTetrisQueue(); spawnPcTetris();
  fitPcTetris(); renderPcTetris();
}
function fillPcTetrisQueue() {   // 7 個一輪：洗牌後依序發
  const g = pcd.tetris;
  while (g.queue.length < 3) {
    if (!g.bag.length) { g.bag = Object.keys(PCT_PIECES); for (let i = g.bag.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [g.bag[i], g.bag[j]] = [g.bag[j], g.bag[i]]; } }
    g.queue.push(g.bag.pop());
  }
}
function makePcPiece(type) {
  const m = PCT_PIECES[type].m.map(r => r.slice());
  return { type, m, x: Math.floor((PCT_W - m[0].length) / 2), y: type === 'I' ? -1 : 0 };
}
function spawnPcTetris(type) {
  const g = pcd.tetris;
  if (!type) { type = g.queue.shift(); fillPcTetrisQueue(); }
  g.cur = makePcPiece(type); g.acc = 0;
  if (pcTetrisHits(g.cur.m, g.cur.x, g.cur.y)) {   // 出生的地方就被擋住＝堆到頂了
    g.state = 'over'; g.newBest = pcaSaveBest('tetris', g.score); sfx('error');
  }
}
function pcTetrisHits(m, px, py) {
  const b = pcd.tetris.board;
  for (let y = 0; y < m.length; y++) for (let x = 0; x < m[y].length; x++) {
    if (!m[y][x]) continue;
    const bx = px + x, by = py + y;
    if (bx < 0 || bx >= PCT_W || by >= PCT_H) return true;
    if (by >= 0 && b[by][bx]) return true;
  }
  return false;
}
function movePcTetris(dx, dy) {
  const c = pcd.tetris.cur;
  if (pcTetrisHits(c.m, c.x + dx, c.y + dy)) return false;
  c.x += dx; c.y += dy; return true;
}
function rotatePcTetris(dir) {
  const c = pcd.tetris.cur; if (c.type === 'O') return;
  const m = pctRotate(c.m, dir);
  for (const [dx, dy] of [[0, 0], [-1, 0], [1, 0], [-2, 0], [2, 0], [0, -1]]) {   // 轉了卡牆：左右推一推看能不能塞進去
    if (!pcTetrisHits(m, c.x + dx, c.y + dy)) { c.m = m; c.x += dx; c.y += dy; sfx('switch'); return; }
  }
}
function pcTetrisGhostY() {   // 直接落到底會停在哪一排（畫半透明的影子用）
  const c = pcd.tetris.cur; let y = c.y;
  while (!pcTetrisHits(c.m, c.x, y + 1)) y++;
  return y;
}
function lockPcTetris(hard) {
  const g = pcd.tetris, c = g.cur;
  sfx(hard ? 'pcHardDrop' : 'pcDrop');   // 放下去的聲音（消排時會再疊上消排的叮聲）
  c.m.forEach((r, y) => r.forEach((v, x) => { if (v && c.y + y >= 0) g.board[c.y + y][c.x + x] = PCT_PIECES[c.type].color; }));
  if (c.m.some((r, y) => r.some(v => v) && c.y + y < 0)) {   // 有一部分卡在畫面外面＝堆到頂了
    g.state = 'over'; g.newBest = pcaSaveBest('tetris', g.score); sfx('error'); return;
  }
  g.holdUsed = false; g.cur = null;
  const full = g.board.map((r, i) => r.every(v => v) ? i : -1).filter(i => i >= 0);
  if (full.length) {
    g.clearing = { rows: full, t: full.length === 4 ? 380 : 260 };
    sfx(full.length === 4 ? 'pcTetris' : 'pcLine' + full.length);
    burstPcTetris(full);
  } else spawnPcTetris();
}
function finishPcTetrisClear() {
  const g = pcd.tetris, rows = g.clearing.rows; g.clearing = null;
  g.board = g.board.filter((_, i) => !rows.includes(i));
  while (g.board.length < PCT_H) g.board.unshift(Array(PCT_W).fill(null));
  const oldLevel = g.level;
  g.score += PCT_LINE_PTS[rows.length] * g.level;
  g.lines += rows.length;
  g.level = Math.floor(g.lines / 10) + 1;
  if (g.level > oldLevel) {   // 升級：板子邊框發一陣藍光＋音效（不跳字）
    g.fx.glow = 1;
    setTimeout(() => sfx('pcLevelUp'), 350);
  }
  spawnPcTetris();
}
// ---- 消排特效：碎片往外噴、板子閃白光、消 3 排以上畫面晃一下（不跳任何文字、分數）----
function burstPcTetris(rows) {
  const g = pcd.tetris, fx = g.fx, n = rows.length;
  rows.forEach(y => g.board[y].forEach((col, x) => {   // 每一格方塊噴出幾顆小碎片，顏色跟方塊一樣
    for (let k = 0; k < 2 + n; k++) {
      const a = Math.random() * Math.PI * 2, sp = 2 + Math.random() * (3 + n * 1.5);
      fx.parts.push({ x: x + .5, y: y + .5, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 3, color: col || '#fff', t: 0, life: 500 + Math.random() * 500, size: .18 + Math.random() * .22 });
    }
  }));
  fx.flash = n === 4 ? 1 : .35 + n * .1;   // 整個板子閃一下白光
  if (n === 4) fx.shake = 380;
  else if (n === 3) fx.shake = 160;
}
function stepPcTetrisFx(dt) {
  const fx = pcd.tetris.fx, s = dt / 1000;
  fx.parts = fx.parts.filter(p => (p.t += dt) < p.life);
  fx.parts.forEach(p => { p.vy += 18 * s; p.x += p.vx * s; p.y += p.vy * s; });   // 單位是「格」，往下掉
  fx.glow = Math.max(0, fx.glow - dt / 1200);
  fx.shake = Math.max(0, fx.shake - dt);
  fx.flash = Math.max(0, fx.flash - dt / 300);
}
function drawPcTetrisFx(ctx, W, H, c) {
  const fx = pcd.tetris.fx;
  if (fx.flash > 0) { ctx.fillStyle = 'rgba(255,255,255,' + (fx.flash * .35) + ')'; ctx.fillRect(0, 0, W, H); }
  fx.parts.forEach(p => {
    ctx.globalAlpha = 1 - p.t / p.life;
    ctx.fillStyle = p.color; ctx.fillRect(p.x * c - p.size * c / 2, p.y * c - p.size * c / 2, p.size * c, p.size * c);
  });
  ctx.globalAlpha = 1;
  if (fx.glow > 0) {   // 升級：邊框一圈藍光慢慢淡掉
    ctx.save(); ctx.globalAlpha = fx.glow; ctx.strokeStyle = '#7fe0ff'; ctx.shadowColor = '#7fe0ff'; ctx.shadowBlur = c;
    ctx.lineWidth = Math.max(3, c * .3); ctx.strokeRect(1, 1, W - 2, H - 2); ctx.restore();
  }
}
function holdPcTetris() {
  const g = pcd.tetris; if (g.holdUsed || !g.cur) return;
  const t = g.cur.type; g.holdUsed = true;
  if (g.hold) { const h = g.hold; g.hold = t; spawnPcTetris(h); } else { g.hold = t; spawnPcTetris(); }
  sfx('switch');
}
function pcTetrisPause() {
  const g = pcd.tetris;
  if (g.state === 'run') g.state = 'pause';
  else if (g.state === 'pause') { g.state = 'run'; g.autoPaused = false; }
  renderPcTetris();
}
function fitPcTetris() {
  const g = pcd.tetris; if (!g || !pcd.wins.tetris) return;
  const screen = pcd.el.querySelector('.pcd-screen'), H = screen.clientHeight - 34, W = screen.clientWidth;
  g.cell = Math.max(10, Math.min(24, Math.floor((H - 190) / PCT_H), Math.floor((W - 170) / PCT_W)));
  renderPcTetris(); pcaKeepInside('tetris');
}
function pctBlock(ctx, x, y, c, color, alpha) {   // 一個小方塊：有亮邊和暗邊，看起來有立體感
  ctx.globalAlpha = alpha ?? 1;
  ctx.fillStyle = color; ctx.fillRect(x, y, c, c);
  ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(x, y, c, 3); ctx.fillRect(x, y, 3, c);
  ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.fillRect(x, y + c - 3, c, 3); ctx.fillRect(x + c - 3, y, 3, c);
  ctx.globalAlpha = 1;
}
function renderPcTetrisMini(cv, type, dim) {   // 「下一個」「保留」的小格子
  const s = 14, ctx = pcaSizeCanvas(cv, s * 4 + 8, s * 3);
  ctx.clearRect(0, 0, s * 4 + 8, s * 3);
  if (!type) return;
  const m = PCT_PIECES[type].m.filter(r => r.some(v => v)), w = m[0].length;
  const ox = (s * 4 + 8 - w * s) / 2, oy = (s * 3 - m.length * s) / 2;
  m.forEach((r, y) => r.forEach((v, x) => { if (v) pctBlock(ctx, ox + x * s, oy + y * s, s, PCT_PIECES[type].color, dim ? 0.35 : 1); }));
}
function renderPcTetris() {
  const g = pcd.tetris, c = g.cell, W = PCT_W * c, H = PCT_H * c;
  const ctx = pcaSizeCanvas(g.cv, W, H);
  ctx.fillStyle = '#141a2a'; ctx.fillRect(0, 0, W, H);
  ctx.save();
  if (g.fx.shake > 0) { const m = c * .25 * (g.fx.shake / 380); ctx.translate((Math.random() - .5) * 2 * m, (Math.random() - .5) * 2 * m); }   // 畫面晃動
  ctx.strokeStyle = 'rgba(255,255,255,.05)'; ctx.lineWidth = 1;   // 淡淡的格線
  for (let x = 1; x < PCT_W; x++) { ctx.beginPath(); ctx.moveTo(x * c + .5, 0); ctx.lineTo(x * c + .5, H); ctx.stroke(); }
  for (let y = 1; y < PCT_H; y++) { ctx.beginPath(); ctx.moveTo(0, y * c + .5); ctx.lineTo(W, y * c + .5); ctx.stroke(); }
  const flash = g.clearing && Math.floor(g.clearing.t / 55) % 2 === 0;
  g.board.forEach((r, y) => r.forEach((v, x) => {
    if (!v) return;
    if (g.clearing && g.clearing.rows.includes(y)) {   // 要消掉的那排：從中間往兩邊變白、一閃一閃
      const total = g.clearing.rows.length === 4 ? 380 : 260, k = 1 - g.clearing.t / total;
      if (Math.abs(x - 4.5) < k * 6) { ctx.fillStyle = flash ? '#ffffff' : '#fff6c0'; ctx.fillRect(x * c, y * c, c, c); } else pctBlock(ctx, x * c, y * c, c, v);
    }
    else pctBlock(ctx, x * c, y * c, c, v);
  }));
  if (g.cur && g.state !== 'over') {
    const p = g.cur, col = PCT_PIECES[p.type].color, gy = pcTetrisGhostY();
    p.m.forEach((r, y) => r.forEach((v, x) => { if (v && gy + y >= 0) pctBlock(ctx, (p.x + x) * c, (gy + y) * c, c, col, 0.22); }));   // 影子
    p.m.forEach((r, y) => r.forEach((v, x) => { if (v && p.y + y >= 0) pctBlock(ctx, (p.x + x) * c, (p.y + y) * c, c, col); }));
  }
  drawPcTetrisFx(ctx, W, H, c);
  ctx.restore();
  if (g.state === 'ready') pcaOverlay(ctx, W, H, '按任意方向鍵開始', '排滿一整排就會消掉');
  else if (g.state === 'pause') pcaOverlay(ctx, W, H, '暫停中', g.autoPaused ? '點一下視窗、再按 P 繼續' : '按 P 繼續');
  else if (g.state === 'over') pcaOverlay(ctx, W, H, '遊戲結束', (g.newBest ? '🏆 新紀錄！' : '') + '按 Enter 再玩一次');
  renderPcTetrisMini(g.next, g.queue[0]);
  renderPcTetrisMini(g.holdCv, g.hold, g.holdUsed);
  const q = s => g.body.querySelector(s);
  q('.pct-score').textContent = g.score; q('.pct-lines').textContent = g.lines; q('.pct-level').textContent = g.level; q('.pct-best').textContent = pcaBest.tetris || 0;
  q('[data-a="pause"]').textContent = g.state === 'pause' ? '▶ 繼續' : '暫停';
  q('[data-a="pause"]').disabled = g.state === 'ready' || g.state === 'over';
}
function pcTetrisKey(e) {
  const g = pcd.tetris, k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  const known = ['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', ' ', 'x', 'z', 'c', 'Shift', 'p', 'Enter', 'a', 'd', 's', 'w'];
  if (!known.includes(k)) return false;
  if (k === 'Enter') { if (g.state === 'over') newPcTetris(); return true; }
  if (k === 'p') { if (!e.repeat) pcTetrisPause(); return true; }
  if (g.state === 'over') return true;
  if (g.state === 'ready') { g.state = 'run'; minigameRound('tetris'); renderPcTetris(); return true; }   // 第一下只是開始
  if (g.state === 'pause') { if (!e.repeat) { g.state = 'run'; g.autoPaused = false; renderPcTetris(); } return true; }
  if (g.clearing || !g.cur) return true;
  if (k === 'ArrowLeft' || k === 'a' || k === 'ArrowRight' || k === 'd') {
    if (e.repeat) return true;   // 瀏覽器自己的連發太慢，不用；按住改由 stepPcTetrisHold 處理
    const dir = k === 'ArrowLeft' || k === 'a' ? -1 : 1, h = g.held;
    h[dir < 0 ? 'L' : 'R'] = true; h.dir = dir; h.t = 0; h.acc = 0;
    movePcTetris(dir, 0);
  }
  else if (k === 'ArrowDown' || k === 's') {
    if (e.repeat) return true;
    g.held.D = true; g.held.dacc = 0;
    if (movePcTetris(0, 1)) { g.score += 1; g.acc = 0; } else lockPcTetris();
  }
  else if ((k === 'ArrowUp' || k === 'x' || k === 'w') && !e.repeat) rotatePcTetris(1);
  else if (k === 'z' && !e.repeat) rotatePcTetris(-1);
  else if (k === ' ' && !e.repeat) { const gy = pcTetrisGhostY(); g.score += (gy - g.cur.y) * 2; g.cur.y = gy; g.fx.shake = Math.max(g.fx.shake, 70); lockPcTetris(true); }
  else if ((k === 'c' || k === 'Shift') && !e.repeat) holdPcTetris();
  renderPcTetris();
  return true;
}

// ---- 按住不放：左右在 0.14 秒後開始快速連續移動（每 0.04 秒一格）；按住 ↓ 每 0.035 秒往下一格 ----
const PCT_DAS = 140, PCT_ARR = 40, PCT_SOFT = 35;
function stepPcTetrisHold(dt) {
  const g = pcd.tetris, h = g.held; if (!g.cur) return;
  if (h.dir) {
    h.t += dt;
    if (h.t >= PCT_DAS) { h.acc += dt; while (h.acc >= PCT_ARR) { h.acc -= PCT_ARR; if (!movePcTetris(h.dir, 0)) { h.acc = 0; break; } } }
  }
  if (h.D) {   // 按住往下：只往下滑，到底不會馬上鎖住（留一點時間左右調整，跟平常一樣等它自己落定）
    h.dacc += dt;
    while (h.dacc >= PCT_SOFT) { h.dacc -= PCT_SOFT; if (movePcTetris(0, 1)) { g.score += 1; g.acc = 0; } else { h.dacc = 0; break; } }
  }
}
function pcTetrisKeyUp(key) {
  const h = pcd.tetris && pcd.tetris.held; if (!h) return;
  const k = key.length === 1 ? key.toLowerCase() : key;
  if (k === 'ArrowLeft' || k === 'a') h.L = false;
  else if (k === 'ArrowRight' || k === 'd') h.R = false;
  else if (k === 'ArrowDown' || k === 's') { h.D = false; return; }
  else return;
  const want = h.R && !h.L ? 1 : h.L && !h.R ? -1 : h.L && h.R ? h.dir : 0;   // 另一邊還按著就換那邊繼續
  if (want !== h.dir) { h.dir = want; h.t = 0; h.acc = 0; }
}
function pcArcadeKeyUp(id, key) { if (id === 'tetris') pcTetrisKeyUp(key); }
// 放開按鍵：電腦桌面只轉交「按下」，放開要自己聽
window.addEventListener('keyup', e => { if (pcd.wins && pcd.wins.tetris) pcTetrisKeyUp(e.key); }, { capture: true });
window.addEventListener('blur', () => { const h = pcd.tetris && pcd.tetris.held; if (h) Object.assign(h, { L: false, R: false, D: false, dir: 0 }); });   // 切到別的視窗：全部當作放開

// 電腦桌面把按鍵交過來：回傳 true＝這個遊戲用掉了這個按鍵
function pcArcadeKey(id, e) {
  if (id === 'snake' && pcd.snake) return pcSnakeKey(e);
  if (id === 'tetris' && pcd.tetris) return pcTetrisKey(e);
  if (id === 'pinball' && pcd.pinball) return pcPinballKey(e);   // 彈珠檯在 js/pc-pinball.js
  return false;
}
window.addEventListener('resize', () => { if (pcDesktopOpen) { if (pcd.wins.snake) fitPcSnake(); if (pcd.wins.tetris) fitPcTetris(); } });
