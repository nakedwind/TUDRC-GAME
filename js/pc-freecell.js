/* ===== 2F應變中心的電腦：🃏 新接龍（FreeCell）=====
   ・視窗、桌面圖示在 js/pc-desktop.js（這裡只管牌局）；樣式在 css/style.css 的「新接龍」
   ・規則：8 排牌全部翻開；左上 4 格暫存格各放 1 張；右上 4 個回收區從 A 收到 K；排上要紅黑相間、由大到小
   ・一次能搬幾張＝(空暫存格＋1) × 2^空排數（搬到空排時，那一排不算）
   ・操作：拖曳，或點一下選牌再點目的地；點兩下＝收進回收區，收不了就放暫存格
   ・已經用不到的牌會自動收走（A、2 一定收；其他要等兩種相反顏色都收到前一張）；全部排好後自動收完
   ・牌局編號跟 Windows 的新接龍同一套發牌方式（1～32000，只有 11982 無解，所以不會抽到）
*/
const PCF_RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const PCF_SUITS = ['♣', '♦', '♥', '♠'];   // 順序跟發牌公式對應，不能改
const PCF_HOME_ORDER = [3, 2, 1, 0];      // 畫面上回收區的排列：♠♥♦♣
const pcfRank = c => c >> 2, pcfSuit = c => c & 3;
const pcfRed = c => pcfSuit(c) === 1 || pcfSuit(c) === 2;
const pcfFits = (c, onto) => pcfRank(onto) === pcfRank(c) + 1 && pcfRed(onto) !== pcfRed(c);

function pcfDeal(no) {   // Windows 新接龍的發牌公式
  let seed = no;
  const deck = Array.from({ length: 52 }, (_, i) => i), cols = Array.from({ length: 8 }, () => []);
  for (let i = 51; i >= 0; i--) {
    seed = (seed * 214013 + 2531011) & 0x7fffffff;
    const j = (seed >> 16) % (i + 1);
    [deck[i], deck[j]] = [deck[j], deck[i]];
    cols[(51 - i) % 8].push(deck[i]);
  }
  return cols;
}

function initPcFreecell(body) {
  body.innerHTML = '<div class="pcd-fc"><div class="pcd-fc-bar">' +
      '<button type="button" data-fc="new">新牌局</button><button type="button" data-fc="retry">重玩這局</button><button type="button" data-fc="undo">↶ 復原</button>' +
      '<span class="pcd-fc-info"></span></div>' +
    '<div class="pcd-fc-table"></div><div class="pcd-fc-msg"></div></div>';
  body.querySelector('.pcd-fc-bar').addEventListener('click', e => {
    const b = e.target.closest('[data-fc]'); if (!b) return;
    const g = pcd.fc;
    if (b.dataset.fc === 'new') { newPcFreecell(); sfx('button'); }
    else if (b.dataset.fc === 'retry') { newPcFreecell(g.no); sfx('button'); }
    else pcfUndo(g);
  });
  body.querySelector('.pcd-fc-table').addEventListener('pointerdown', pcfDown);
  pcd.fc = { body };
  newPcFreecell();
}
function newPcFreecell(no) {
  const g = pcd.fc;
  clearInterval(g.timer);
  if (!no) do { no = 1 + Math.floor(Math.random() * 32000); } while (no === 11982);
  Object.assign(g, { no, cols: pcfDeal(no), free: [null, null, null, null], home: [0, 0, 0, 0], hist: [], sel: null, time: 0, timer: 0, won: false, lastClick: 0 });
  fitPcFreecell();
  renderPcFreecell(true);
}
function fitPcFreecell() {   // 依螢幕大小決定牌的尺寸；視窗超出螢幕就往內移
  const g = pcd.fc, w = pcd.wins.freecell; if (!g || !g.cols || !w || !pcd.el) return;
  const screen = pcd.el.querySelector('.pcd-screen'), H = screen.clientHeight - 34, W = screen.clientWidth;
  const CHROME = 122, GAP = 8;   // 標題列、按鈕列、訊息列、留白加起來的高度
  const cw = Math.max(34, Math.min(76, Math.floor((W - 30 - GAP * 7) / 8), Math.floor((H - CHROME - 170) / 2 / 1.36)));
  const ch = Math.round(cw * 1.36);
  g.ch = ch; g.colH = Math.max(ch + 120, Math.min(400, H - CHROME - ch));
  const fc = g.body.querySelector('.pcd-fc');
  fc.style.setProperty('--fc-w', cw + 'px');
  fc.style.setProperty('--fc-h', ch + 'px');
  fc.style.setProperty('--fc-col', g.colH + 'px');
  fc.style.setProperty('--fc-font', Math.max(11, Math.round(cw * .2)) + 'px');
  const r = w.getBoundingClientRect(), sr = screen.getBoundingClientRect();
  if (r.bottom > sr.top + H) w.style.top = Math.max(0, H - r.height) + 'px';
  if (r.right > sr.right) w.style.left = Math.max(0, W - r.width) + 'px';
}

// ---- 規則 ----
const pcfFreeCount = g => g.free.filter(c => c === null).length;
const pcfEmptyCols = g => g.cols.filter(c => !c.length).length;
const pcfMaxMove = (g, toEmpty) => (pcfFreeCount(g) + 1) * 2 ** Math.max(0, pcfEmptyCols(g) - (toEmpty ? 1 : 0));
function pcfRun(g, slot, i) {   // 從這張開始往下的牌；沒有排好（不能一起拿）就回傳 null
  if (slot[0] === 'f') return g.free[+slot[1]] === null ? null : [g.free[+slot[1]]];
  if (slot[0] !== 'c') return null;
  const col = g.cols[+slot[1]], run = col.slice(i);
  if (!run.length) return null;
  for (let k = 1; k < run.length; k++) if (!pcfFits(run[k], run[k - 1])) return null;
  return run;
}
const pcfCanHome = (g, c) => g.home[pcfSuit(c)] === pcfRank(c);
function pcfTake(g, slot, n) {   // 從來源拿走 n 張
  if (slot[0] === 'f') { const c = g.free[+slot[1]]; g.free[+slot[1]] = null; return [c]; }
  return g.cols[+slot[1]].splice(-n);
}
// 把牌搬過去。exact（拖曳）：整疊要剛好搬得過去；不是 exact（點選）：搬得過去的部分就搬
function pcfMove(g, slot, i, to, exact) {
  const run = pcfRun(g, slot, i);
  if (!run || slot === to) return false;
  let n = 0;
  if (to[0] === 'h') {
    if ((!exact || run.length === 1) && pcfCanHome(g, run[run.length - 1])) n = 1;
  } else if (to[0] === 'f') {
    if ((!exact || run.length === 1) && g.free[+to[1]] === null) n = 1;
  } else {
    const col = g.cols[+to[1]];
    const max = Math.min(run.length, pcfMaxMove(g, !col.length));
    if (!col.length) n = max;
    else for (let k = max; k >= 1 && !n; k--) if (pcfFits(run[run.length - k], col[col.length - 1])) n = k;
    if (exact && n !== run.length) n = 0;
  }
  if (!n) return false;
  g.hist.push(JSON.stringify({ cols: g.cols, free: g.free, home: g.home }));
  const cards = pcfTake(g, slot, n);
  if (to[0] === 'h') g.home[pcfSuit(cards[0])]++;
  else if (to[0] === 'f') g.free[+to[1]] = cards[0];
  else g.cols[+to[1]].push(...cards);
  g.sel = null;
  if (!g.timer && !g.won) g.timer = setInterval(() => pcfTick(g), 1000);
  pcfAutoHome(g);
  if (g.home.every(n => n === 13)) { g.won = true; clearInterval(g.timer); g.timer = 0; sfx('achievement'); }
  else sfx('blip');
  return true;
}
function pcfTick(g) {
  const w = pcd.wins.freecell;
  if (pcDesktopOpen && w && !w.classList.contains('min')) { g.time++; renderPcfInfo(g); }
}
function pcfAutoHome(g) {   // 把用不到的牌自動收走；每一排都由大到小排好時，全部收完
  const done = g.cols.every(col => col.every((c, k) => !k || pcfRank(c) <= pcfRank(col[k - 1])));
  const safe = c => done || pcfRank(c) <= 1 || [0, 1, 2, 3].every(s => (s === 1 || s === 2) === pcfRed(c) || g.home[s] >= pcfRank(c));
  for (let moved = true; moved;) {
    moved = false;
    g.cols.forEach(col => { const c = col[col.length - 1]; if (col.length && pcfCanHome(g, c) && safe(c)) { col.pop(); g.home[pcfSuit(c)]++; moved = true; } });
    g.free.forEach((c, k) => { if (c !== null && pcfCanHome(g, c) && safe(c)) { g.free[k] = null; g.home[pcfSuit(c)]++; moved = true; } });
  }
}
function pcfHasMove(g) {   // 卡死判斷：還有沒有任何一步可以走
  if (pcfFreeCount(g) || pcfEmptyCols(g)) return true;
  const tops = [...g.free, ...g.cols.map(c => c[c.length - 1])];
  return tops.some(c => pcfCanHome(g, c) || g.cols.some(col => pcfFits(c, col[col.length - 1])));
}
function pcfUndo(g) {
  if (!g.hist.length || g.won) { sfx('error'); return; }
  Object.assign(g, JSON.parse(g.hist.pop()), { sel: null });
  sfx('switch');
  renderPcFreecell();
}

// ---- 操作：拖曳、點選 ----
function pcfDown(e) {
  const g = pcd.fc;
  if (e.button !== 0 || g.won) return;
  const el = e.target.closest('[data-slot]');
  if (!el) { if (g.sel) { g.sel = null; renderPcFreecell(); } return; }
  const slot = el.dataset.slot, i = el.dataset.i === undefined ? -1 : +el.dataset.i;
  const canDrag = i >= 0 && !!pcfRun(g, slot, i);
  const sx = e.clientX, sy = e.clientY;
  let ghost = null;
  const move = ev => {
    if (!ghost && canDrag && Math.hypot(ev.clientX - sx, ev.clientY - sy) > 5) ghost = pcfStartDrag(g, slot, i, sx, sy);
    if (ghost) { ghost.style.left = ghost.baseX + ev.clientX - sx + 'px'; ghost.style.top = ghost.baseY + ev.clientY - sy + 'px'; }
  };
  const finish = ev => {
    window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', finish); window.removeEventListener('pointercancel', finish);
    if (ghost) pcfDrop(g, slot, i, ghost, ev.type === 'pointerup');
    else if (ev.type === 'pointerup') pcfClick(g, slot, i);
  };
  window.addEventListener('pointermove', move); window.addEventListener('pointerup', finish); window.addEventListener('pointercancel', finish);
  e.preventDefault();
}
function pcfStartDrag(g, slot, i) {
  const table = g.body.querySelector('.pcd-fc-table'), tr = table.getBoundingClientRect();
  g.sel = null; renderPcFreecell(true);
  const cards = [...table.querySelectorAll('.pcd-fc-card[data-slot="' + slot + '"]')].filter(c => +c.dataset.i >= i);
  const first = cards[0].getBoundingClientRect();
  const ghost = document.createElement('div');
  ghost.className = 'pcd-fc-ghost';
  ghost.baseX = first.left - tr.left; ghost.baseY = first.top - tr.top;
  ghost.style.left = ghost.baseX + 'px'; ghost.style.top = ghost.baseY + 'px';
  cards.forEach(c => {
    const r = c.getBoundingClientRect(), copy = c.cloneNode(true);
    copy.style.left = '0'; copy.style.top = r.top - first.top + 'px';
    ghost.appendChild(copy);
    c.style.visibility = 'hidden';
  });
  table.appendChild(ghost);
  return ghost;
}
function pcfDrop(g, slot, i, ghost, real) {   // 放開：跟哪個位置重疊最多就先試哪個
  const table = g.body.querySelector('.pcd-fc-table');
  if (real) {
    const a = ghost.firstChild.getBoundingClientRect();
    const spots = [...table.querySelectorAll('.pcd-fc-spot')].map(el => {
      const b = el.getBoundingClientRect();
      return { to: el.dataset.slot, area: Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)) };
    }).filter(s => s.area > 0 && s.to !== slot).sort((x, y) => y.area - x.area);
    if (spots.length && !spots.some(s => pcfMove(g, slot, i, s.to, true))) sfx('error');
  }
  renderPcFreecell();   // 牌會從鬼影的位置滑過去；沒放成就滑回原位
}
function pcfClick(g, slot, i) {
  const now = performance.now(), sel = g.sel;
  if (sel) {
    if (sel.slot === slot) {
      if (now - g.lastClick < 350) pcfSend(g, sel);   // 點兩下
      else { g.sel = null; sfx('switch'); }
      renderPcFreecell();
      return;
    }
    if (pcfMove(g, sel.slot, sel.i, slot, false)) { renderPcFreecell(); return; }
    if (i < 0) { g.sel = null; sfx('error'); renderPcFreecell(); return; }
  }
  if (i < 0) return;
  // 點到沒排好的牌：只選最下面那張
  g.sel = { slot, i: pcfRun(g, slot, i) ? i : g.cols[+slot[1]].length - 1 };
  g.lastClick = now;
  sfx('switch');
  renderPcFreecell();
}
function pcfSend(g, sel) {   // 點兩下：最下面那張收進回收區，不行就放暫存格
  const run = pcfRun(g, sel.slot, sel.i);
  const bottom = sel.slot[0] === 'c' ? g.cols[+sel.slot[1]].length - 1 : 0;
  if (!run) { g.sel = null; return; }
  if (pcfCanHome(g, run[run.length - 1])) { pcfMove(g, sel.slot, bottom, 'h0', false); return; }
  const empty = g.free.indexOf(null);
  if (sel.slot[0] === 'c' && empty >= 0) { pcfMove(g, sel.slot, bottom, 'f' + empty, false); return; }
  g.sel = null; sfx('error');
}

// ---- 畫面 ----
function pcfCardHtml(c, slot, i, top, extra) {
  const r = PCF_RANKS[pcfRank(c)], s = PCF_SUITS[pcfSuit(c)] + '︎';
  return '<div class="pcd-fc-card' + (pcfRed(c) ? ' red' : '') + (extra || '') + '" data-card="' + c + '" data-slot="' + slot + '"' + (i === null ? '' : ' data-i="' + i + '"') +
    ' style="top:' + top + 'px"><span class="pcd-fc-corner">' + r + s + '</span><span class="pcd-fc-suit">' + s + '</span><span class="pcd-fc-corner flip">' + r + s + '</span></div>';
}
function renderPcFreecell(noAnim) {
  const g = pcd.fc, table = g.body.querySelector('.pcd-fc-table');
  const old = {};
  if (!noAnim) table.querySelectorAll('.pcd-fc-card').forEach(el => { old[el.dataset.card] = el.getBoundingClientRect(); });   // 鬼影排在後面，會蓋掉原位
  const isSel = (slot, i) => g.sel && g.sel.slot === slot && i >= g.sel.i;
  const free = g.free.map((c, k) => '<div class="pcd-fc-spot pcd-fc-cell" data-slot="f' + k + '">' +
    (c === null ? '' : pcfCardHtml(c, 'f' + k, 0, 0, isSel('f' + k, 0) ? ' sel' : '')) + '</div>').join('');
  const home = PCF_HOME_ORDER.map(s => '<div class="pcd-fc-spot pcd-fc-cell home" data-slot="h' + s + '"><span class="pcd-fc-ghostsuit' + (s === 1 || s === 2 ? ' red' : '') + '">' + PCF_SUITS[s] + '︎</span>' +
    (g.home[s] ? pcfCardHtml(s + (g.home[s] - 1) * 4, 'h' + s, null, 0) : '') + '</div>').join('');
  const maxOff = Math.round(g.ch * .27);
  const cols = g.cols.map((col, k) => {
    const off = col.length > 1 ? Math.min(maxOff, (g.colH - g.ch) / (col.length - 1)) : 0;
    return '<div class="pcd-fc-spot pcd-fc-col" data-slot="c' + k + '">' + col.map((c, i) => pcfCardHtml(c, 'c' + k, i, Math.round(i * off), isSel('c' + k, i) ? ' sel' : '')).join('') + '</div>';
  }).join('');
  table.innerHTML = '<div class="pcd-fc-top">' + free + home + '</div><div class="pcd-fc-cols">' + cols + '</div>';
  table.querySelectorAll('.pcd-fc-card').forEach(el => {   // 牌從舊位置滑到新位置
    const o = old[el.dataset.card]; if (!o) return;
    const n = el.getBoundingClientRect(), dx = o.left - n.left, dy = o.top - n.top;
    if (!dx && !dy) return;
    el.style.zIndex = 60;
    el.animate([{ transform: 'translate(' + dx + 'px,' + dy + 'px)' }, { transform: 'none' }], { duration: 150, easing: 'ease-out' }).onfinish = () => { el.style.zIndex = ''; };
  });
  renderPcfInfo(g);
  g.body.querySelector('.pcd-fc-msg').textContent = g.won ? '🎉 破關了！花了 ' + pcfTime(g.time) + '、' + g.hist.length + ' 步。按「新牌局」再玩一次'
    : !pcfHasMove(g) ? '沒有牌可以走了…按「復原」或「重玩這局」'
    : '拖曳或點選移牌；點兩下收進回收區或放暫存格。現在最多一次搬 ' + pcfMaxMove(g, false) + ' 張';
  g.body.querySelector('[data-fc="undo"]').disabled = !g.hist.length || g.won;
}
const pcfTime = t => Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0');
function renderPcfInfo(g) {
  g.body.querySelector('.pcd-fc-info').textContent = '牌局 #' + g.no + '　步數 ' + g.hist.length + '　時間 ' + pcfTime(g.time);
}
