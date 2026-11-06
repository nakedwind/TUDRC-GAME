/* ===== 2F應變中心的電腦：⚫ 五子棋 =====
   ・視窗、桌面圖示在 js/pc-desktop.js（這裡只管棋局）；樣式在 css/style.css 的「五子棋」
   ・15×15 的棋盤，黑子先下，橫、直、斜任一方向連成 5 顆（或更多）就贏；棋盤下滿沒人連成＝平手
   ・模式：對電腦（可以選「我先」或「電腦先」、難度簡單／普通／困難），或兩人在同一台電腦輪流下
   ・悔棋：對電腦時會連電腦那一步一起退回，退到又輪到你；分出勝負後就不能悔棋
   ・電腦怎麼下：看棋盤上每個空位，算「自己下這裡能連成什麼」和「對手下這裡能連成什麼」，
     挑分數最高的位置（所以會進攻也會擋）；困難會再多想一步：下完之後對手最好的回應有多危險
   ・勝場數只記在這次開著的遊戲裡，重新整理就歸零
*/
const PCG_N = 15;   // 棋盤 15 條線 × 15 條線
const PCG_MODES = { ai: '對電腦', duo: '兩人對下' };
const PCG_LEVELS = { easy: '簡單', normal: '普通', hard: '困難' };
const PCG_STARS = [[3, 3], [11, 3], [7, 7], [3, 11], [11, 11]];   // 棋盤上的 5 個小黑點（只是好看，不影響規則）
const PCG_DIRS = [[1, 0], [0, 1], [1, 1], [1, -1]];   // 橫、直、兩種斜
// 電腦用來打分數的棋形：x＝自己的子、_＝空位、o＝對手的子或棋盤邊（被擋住）。同一個方向只算最高分的那種
const PCG_SHAPES = [
  ['xxxxx', 100000],                                                          // 五連：贏了
  ['_xxxx_', 12000],                                                          // 活四：兩頭都空，對手擋不完
  ['xxxx_', 1100], ['_xxxx', 1100], ['xxx_x', 1100], ['x_xxx', 1100], ['xx_xx', 1100],   // 衝四：再一步就五連，對手一定要擋
  ['_xxx_', 900], ['_xx_x_', 900], ['_x_xx_', 900],                           // 活三：再一步變活四
  ['xxx__', 120], ['__xxx', 120], ['xx_x_', 120], ['_x_xx', 120], ['x_xx_', 120], ['_xx_x', 120], ['x__xx', 120], ['xx__x', 120], ['x_x_x', 120],   // 眠三：一頭被擋住的三
  ['__xx__', 110], ['_xx_', 90], ['_x_x_', 70], ['_x__x_', 40],              // 活二
  ['xx___', 12], ['___xx', 12], ['_x_', 4],                                  // 眠二、單顆
];

function initPcGomoku(body) {
  body.innerHTML = '<div class="pcd-gm"><div class="pcd-fc-bar">' +
      '<button type="button" data-gm="new">新局</button><button type="button" data-gm="undo">↶ 悔棋</button>' +
      '<span class="pcd-gm-opts" data-opt="mode">' + Object.entries(PCG_MODES).map(([k, n]) => '<button type="button" data-v="' + k + '">' + n + '</button>').join('') + '</span>' +
    '</div><div class="pcd-fc-bar pcd-gm-ai">' +
      '<span class="pcd-gm-opts" data-opt="youFirst"><button type="button" data-v="1">我先（黑）</button><button type="button" data-v="0">電腦先</button></span>' +
      '<span class="pcd-gm-opts" data-opt="level">' + Object.entries(PCG_LEVELS).map(([k, n]) => '<button type="button" data-v="' + k + '">' + n + '</button>').join('') + '</span>' +
    '</div>' +
    '<div class="pcd-gm-board"><div class="pcd-gm-lines"></div><div class="pcd-gm-grid"></div></div>' +
    '<div class="pcd-gm-foot"><span class="pcd-gm-msg"></span><span class="pcd-gm-score"></span></div></div>';
  const grid = body.querySelector('.pcd-gm-grid');
  grid.innerHTML = Array.from({ length: PCG_N * PCG_N }, (_, i) => {
    const x = i % PCG_N, y = Math.floor(i / PCG_N), star = PCG_STARS.some(([a, b]) => a === x && b === y);
    return '<button type="button" class="pcd-gm-pt' + (star ? ' star' : '') + '" data-i="' + i + '"></button>';
  }).join('');
  pcd.gm = { body, mode: 'ai', level: 'normal', youFirst: true, score: { you: 0, cpu: 0, b: 0, w: 0, draw: 0 }, thinking: 0 };
  // 上面的按鈕：新局、悔棋、換模式／先後手／難度（換了就重開一盤）
  body.querySelector('.pcd-gm').addEventListener('click', e => {
    const g = pcd.gm, b = e.target.closest('[data-gm]'), opt = e.target.closest('.pcd-gm-opts [data-v]');
    if (b && b.dataset.gm === 'new') { newPcGomoku(); sfx('button'); }
    else if (b && b.dataset.gm === 'undo') pcgUndo(g);
    else if (opt) {
      const key = opt.parentElement.dataset.opt, v = opt.dataset.v;
      g[key] = key === 'youFirst' ? v === '1' : v;
      newPcGomoku(); sfx('button');
    }
  });
  grid.addEventListener('click', e => { const p = e.target.closest('.pcd-gm-pt'); if (p) pcgClick(+p.dataset.i); });
  newPcGomoku();
}

function newPcGomoku() {
  const g = pcd.gm;
  clearTimeout(g.thinking); g.thinking = 0;
  Object.assign(g, { board: new Array(PCG_N * PCG_N).fill(0), turn: 1, hist: [], over: false, winner: 0, line: [] });   // 1＝黑、2＝白
  renderPcGomoku();
  fitPcGomoku();
  if (g.mode === 'ai' && !g.youFirst) pcgThink(g);
}
const pcgHuman = g => g.youFirst ? 1 : 2;   // 對電腦時，玩家是哪一色
const pcgYourTurn = g => !g.over && !g.thinking && (g.mode === 'duo' || g.turn === pcgHuman(g));

function pcgClick(i) {
  const g = pcd.gm;
  if (!pcgYourTurn(g) || g.board[i]) return;
  pcgPlace(g, i);
}
function pcgPlace(g, i) {
  g.board[i] = g.turn; g.hist.push(i);
  const line = pcgFiveAt(g.board, i);
  if (line) {   // 連成五顆：這一色贏了
    g.over = true; g.winner = g.turn; g.line = line;
    if (g.mode === 'ai') { if (g.turn === pcgHuman(g)) { g.score.you++; sfx('achievement'); } else { g.score.cpu++; sfx('error'); } }
    else { g.score[g.turn === 1 ? 'b' : 'w']++; sfx('achievement'); }
  } else if (g.hist.length === PCG_N * PCG_N) {   // 下滿了：平手
    g.over = true; g.score.draw++; sfx('switch');
  } else {
    g.turn = 3 - g.turn; sfx('blip');
  }
  renderPcGomoku();
  if (!g.over && g.mode === 'ai' && g.turn !== pcgHuman(g)) pcgThink(g);
}
function pcgThink(g) {   // 電腦停一下再下，看起來像在想
  g.thinking = setTimeout(() => { g.thinking = 0; pcgPlace(g, pcgPick(g)); }, 380);
  renderPcGomoku();
}
function pcgUndo(g) {
  if (g.over || !g.hist.length) return;
  clearTimeout(g.thinking); g.thinking = 0;
  const popOne = () => { const i = g.hist.pop(); g.turn = g.board[i]; g.board[i] = 0; };
  if (g.mode === 'duo') popOne();
  else do popOne(); while (g.hist.length && g.turn !== pcgHuman(g));   // 對電腦：退到又輪到你為止
  sfx('switch');
  renderPcGomoku();
  if (g.mode === 'ai' && g.turn !== pcgHuman(g)) pcgThink(g);   // 電腦先下而且退到一顆都沒有：讓電腦重下第一步
}

// 剛下的那顆有沒有連成五顆：有的話回傳那一排的位置（拿來亮起來），沒有就回傳 null
function pcgFiveAt(board, i) {
  const x0 = i % PCG_N, y0 = Math.floor(i / PCG_N), c = board[i];
  for (const [dx, dy] of PCG_DIRS) {
    const line = [i];
    for (const s of [1, -1]) {
      let x = x0 + dx * s, y = y0 + dy * s;
      while (x >= 0 && y >= 0 && x < PCG_N && y < PCG_N && board[y * PCG_N + x] === c) { line.push(y * PCG_N + x); x += dx * s; y += dy * s; }
    }
    if (line.length >= 5) return line;
  }
  return null;
}

// ---- 電腦的想法 ----
// 假設 c 色下在 i，這個位置四個方向能連成的棋形分數加起來
function pcgCellScore(board, i, c) {
  const x0 = i % PCG_N, y0 = Math.floor(i / PCG_N);
  let total = 0;
  for (const [dx, dy] of PCG_DIRS) {
    let s = '';   // 以 i 為中心、前後各 4 格排成一串字
    for (let k = -4; k <= 4; k++) {
      const x = x0 + dx * k, y = y0 + dy * k;
      if (!k) s += 'x';
      else if (x < 0 || y < 0 || x >= PCG_N || y >= PCG_N) s += 'o';
      else { const v = board[y * PCG_N + x]; s += v === c ? 'x' : v ? 'o' : '_'; }
    }
    let best = 0;
    for (const [shape, pts] of PCG_SHAPES) {
      if (pts <= best) continue;
      for (let at = s.indexOf(shape); at >= 0; at = s.indexOf(shape, at + 1)) {
        if (at <= 4 && at + shape.length > 4) { best = pts; break; }   // 這個棋形要包含中間那格才算
      }
    }
    total += best;
  }
  return total;
}
// 可以考慮的空位：附近 2 格內有棋子的（離太遠的不用想）
function pcgCandidates(board) {
  const out = [];
  for (let i = 0; i < board.length; i++) {
    if (board[i]) continue;
    const x = i % PCG_N, y = Math.floor(i / PCG_N);
    let near = false;
    for (let dy = -2; dy <= 2 && !near; dy++) for (let dx = -2; dx <= 2; dx++) {
      const nx = x + dx, ny = y + dy;
      if (nx >= 0 && ny >= 0 && nx < PCG_N && ny < PCG_N && board[ny * PCG_N + nx]) { near = true; break; }
    }
    if (near) out.push(i);
  }
  return out;
}
function pcgPick(g) {
  const me = g.turn, opp = 3 - me, board = g.board, mid = Math.floor(PCG_N / 2);
  const cands = pcgCandidates(board);
  if (!cands.length) {   // 第一步：下在中間附近
    const c = mid * PCG_N + mid;
    return g.level === 'easy' ? c + (Math.floor(Math.random() * 3) - 1) + (Math.floor(Math.random() * 3) - 1) * PCG_N : c;
  }
  const list = cands.map(i => {
    const atk = pcgCellScore(board, i, me), def = pcgCellScore(board, i, opp);
    let v;
    if (g.level === 'easy') v = atk + def * 0.6 + Math.random() * 700;   // 簡單：比較不會防守、常常亂下
    else v = atk * 1.1 + def + Math.random() * 3;                       // 普通、困難：進攻稍微優先，一樣分數就隨機挑
    if (atk >= 100000) v = 1e9;                                          // 能贏就一定下
    else if (def >= 100000 && g.level !== 'easy') v = 1e8;              // 對手下一步就贏：一定擋（簡單偶爾會漏）
    return { i, v };
  }).sort((a, b) => b.v - a.v);
  if (g.level !== 'hard' || list[0].v >= 1e8) return list[0].i;
  // 困難：前幾個好位置，各自試下看看，扣掉「對手接著最好的一步」有多危險
  let best = list[0].i, bestV = -Infinity;
  for (const { i, v } of list.slice(0, 8)) {
    board[i] = me;
    let reply = 0;
    for (const j of pcgCandidates(board)) reply = Math.max(reply, pcgCellScore(board, j, opp));
    board[i] = 0;
    const val = v - reply * 0.7;
    if (val > bestV) { bestV = val; best = i; }
  }
  return best;
}

// ---- 畫面 ----
function renderPcGomoku() {
  const g = pcd.gm, body = g.body, last = g.hist[g.hist.length - 1], win = new Set(g.line);
  body.querySelectorAll('.pcd-gm-opts').forEach(o => {
    const cur = o.dataset.opt === 'youFirst' ? (g.youFirst ? '1' : '0') : g[o.dataset.opt];
    o.querySelectorAll('[data-v]').forEach(b => b.classList.toggle('on', b.dataset.v === cur));
  });
  body.querySelector('.pcd-gm-ai').classList.toggle('hidden', g.mode !== 'ai');
  body.querySelector('[data-gm="undo"]').disabled = g.over || !g.hist.length;
  const brd = body.querySelector('.pcd-gm-board'), yours = pcgYourTurn(g);
  brd.classList.toggle('turn-b', yours && g.turn === 1);   // 滑鼠移上去時顯示淡淡的預覽棋子
  brd.classList.toggle('turn-w', yours && g.turn === 2);
  body.querySelectorAll('.pcd-gm-pt').forEach((p, i) => {
    const v = g.board[i];
    let cls = 'pcd-gm-pt' + (p.classList.contains('star') ? ' star' : '');
    if (v) cls += v === 1 ? ' b' : ' w';
    if (i === last) cls += ' last';
    if (win.has(i)) cls += ' win';
    if (p.className !== cls) p.className = cls;
  });
  const color = c => c === 1 ? '黑子' : '白子', sc = g.score;
  let msg;
  if (g.mode === 'ai') {
    const you = pcgHuman(g);
    if (g.over) msg = !g.winner ? '平手！棋盤下滿了' : g.winner === you ? '🎉 你贏了！按「新局」再來一盤' : '電腦贏了…按「新局」再挑戰';
    else msg = g.turn === you ? '輪到你（' + color(you) + '）' : '電腦思考中…';
  } else msg = g.over ? (g.winner ? color(g.winner) + '贏了！🎉' : '平手！棋盤下滿了') : '輪到' + color(g.turn);
  body.querySelector('.pcd-gm-msg').textContent = msg + '　第 ' + g.hist.length + ' 手';
  body.querySelector('.pcd-gm-score').textContent = g.mode === 'ai' ? '你 ' + sc.you + ' 勝・電腦 ' + sc.cpu + ' 勝' : '黑 ' + sc.b + ' 勝・白 ' + sc.w + ' 勝';
}
function fitPcGomoku() {   // 螢幕太小：格子縮小，視窗往上／往左移到整個看得到
  const g = pcd.gm, w = pcd.wins.gomoku; if (!g || !g.board || !w || !pcd.el) return;
  const screen = pcd.el.querySelector('.pcd-screen'), H = screen.clientHeight - 34, W = screen.clientWidth;
  const size = Math.max(16, Math.min(30, Math.floor((H - 160) / PCG_N), Math.floor((W - 50) / PCG_N)));
  g.body.querySelector('.pcd-gm').style.setProperty('--gm-cell', size + 'px');
  const r = w.getBoundingClientRect(), sr = screen.getBoundingClientRect();
  if (r.bottom > sr.top + H) w.style.top = Math.max(0, H - r.height) + 'px';
  if (r.right > sr.right) w.style.left = Math.max(0, W - r.width) + 'px';
}
