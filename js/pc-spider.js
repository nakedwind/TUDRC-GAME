/* ===== 2F應變中心的電腦：🕷️ 連環新接龍（原本叫「蜘蛛紙牌」，英文 Spider）=====
   ・視窗、桌面圖示在 js/pc-desktop.js（這裡只管牌局）；牌的樣子借用新接龍的（css/style.css 的「新接龍」），
     連環新接龍自己的部分在「連環新接龍」
   ・規則：兩副牌（104 張）發成 10 排，前 4 排 6 張、後 6 排 5 張，每排只有最下面那張翻開；剩下 50 張放右下角
   ・任何牌都可以放在大 1 的牌上（花色不限）；但要一起搬好幾張，那幾張必須「同花色、由大到小連著」
   ・同一排湊齊同花色 K→A 就自動收走（左下角）；收滿 8 組＝破關
   ・點右下角的牌堆＝每排各發 1 張（每一排都要有牌才能發）
   ・難度：單色（全部♠）、雙色（♠♥）、四色
   ・每一局都解得開：「新牌局」從 data/pc-spider-deals.js 的清單挑牌局編號（電腦事先試玩過、確定解得開的；tools/spider-deals.js 產生）。
     洗牌方式（pcsRandom、newPcSpider 裡的洗牌）改了的話，要重新跑那個工具
   ・操作：拖曳，或點一下選牌再點目的地；點兩下＝自動搬到最好的位置；「提示」會把可以走的一步亮出來
   ・分數跟 Windows 一樣：開局 500，每走一步 −1，收走一組 +100
   ・收走一組時，13 張牌從 A 開始一張一張飛到左下角（pcsFlyRuns），飛完再放慶祝特效
   ・收走一組、破關時有慶祝特效（js/pc-desktop.js 的 pcCelebrate）和音效（pcCardRun、pcCardWin，在音效編輯器可以換）
   ・🎁 給JJ的禮物（桌面圖示，js/pc-desktop.js）：用這個視窗玩單色版（g.gift＝true，上面多一條禮物說明），
     贏了就出現「觀看朔的生日」按鈕，播 data/story-scenes.js 的 saku_birthday；中途換成雙色／四色就回到一般的連環新接龍
*/
const PCS_LEVELS = { 1: '單色', 2: '雙色', 4: '四色' };
const PCS_SUIT_SETS = { 1: [3, 3, 3, 3, 3, 3, 3, 3], 2: [3, 2, 3, 2, 3, 2, 3, 2], 4: [3, 2, 1, 0, 3, 2, 1, 0] };   // 8 組各 13 張的花色（號碼跟新接龍的 PCF_SUITS 一樣）
const pcsRank = id => id % 13;
const pcsSuit = (g, id) => PCS_SUIT_SETS[g.suits][Math.floor(id / 13)];

function pcsRandom(seed) {   // 固定種子的亂數：同一個牌局編號每次都發一樣的牌（「重玩這局」用）
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function initPcSpider(body) {
  body.innerHTML = '<div class="pcd-fc pcd-sp"><div class="pcd-fc-bar">' +
      '<button type="button" data-sp="new">新牌局</button><button type="button" data-sp="retry">重玩這局</button><button type="button" data-sp="undo">↶ 復原</button><button type="button" data-sp="hint">💡 提示</button>' +
      '<span class="pcd-sp-levels">' + Object.entries(PCS_LEVELS).map(([k, n]) => '<button type="button" data-suits="' + k + '">' + n + '</button>').join('') + '</span>' +
      '<span class="pcd-fc-info"></span></div>' +
    '<div class="pcd-sp-gift hidden"></div><div class="pcd-fc-table"></div><div class="pcd-fc-msg"></div></div>';
  body.querySelector('.pcd-sp').addEventListener('click', e => {   // 上方按鈕列和「這局輸了」提示裡的按鈕都走這裡
    const g = pcd.sp, lv = e.target.closest('[data-suits]'), b = e.target.closest('[data-sp]');
    if (e.target.closest('[data-gift-play]')) { playJJGiftStory(); return; }
    if (lv) { newPcSpider(+lv.dataset.suits); sfx('button'); return; }
    if (!b) return;
    if (b.dataset.sp === 'new') { newPcSpider(g.suits); sfx('button'); }
    else if (b.dataset.sp === 'retry') { newPcSpider(g.suits, g.no); sfx('button'); }
    else if (b.dataset.sp === 'undo') pcsUndo(g);
    else pcsHint(g);
  });
  body.querySelector('.pcd-fc-table').addEventListener('pointerdown', pcsDown);
  pcd.sp = { body };
  newPcSpider(1);
}
function newPcSpider(suits, no) {
  const g = pcd.sp;
  clearInterval(g.timer); clearTimeout(g.hintTimer);
  if (suits !== 1) g.gift = false;   // 禮物只算單色版：換成雙色／四色就變回一般的連環新接龍
  if (!no) {   // 新牌局：從「確定解得開」的清單裡挑一個（跟現在這局不一樣的）；清單沒載入才完全隨機
    const list = (typeof PCS_SOLVABLE !== 'undefined' && PCS_SOLVABLE[suits]) || [];
    const pick = list.filter(n => n !== g.no);
    no = pick.length ? pick[Math.floor(Math.random() * pick.length)] : 1 + Math.floor(Math.random() * 99999);
  }
  const rnd = pcsRandom(no * 7 + suits), deck = Array.from({ length: 104 }, (_, i) => i);
  for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [deck[i], deck[j]] = [deck[j], deck[i]]; }
  const cols = Array.from({ length: 10 }, (_, k) => deck.splice(0, k < 4 ? 6 : 5));
  Object.assign(g, { suits, no, cols, down: cols.map(c => c.length - 1), stock: deck, done: [], score: 500, moves: 0, hist: [], sel: null, hint: null, note: '',
    time: 0, timer: 0, won: false, lost: false, lastClick: 0, dealt: null });
  g.body.querySelectorAll('[data-suits]').forEach(b => b.classList.toggle('on', +b.dataset.suits === suits));
  fitPcSpider();
  renderPcSpider(true);
}
function fitPcSpider() {   // 依螢幕大小決定牌的尺寸；視窗超出螢幕就往內移
  const g = pcd.sp, w = pcd.wins.spider; if (!g || !g.cols || !w || !pcd.el) return;
  const screen = pcd.el.querySelector('.pcd-screen'), H = screen.clientHeight - 34, W = screen.clientWidth;
  const CHROME = 128 + (g.gift ? 38 : 0), GAP = 6;   // 標題列、按鈕列、訊息列、留白加起來的高度
  const cw = Math.max(32, Math.min(70, Math.floor((W - 30 - GAP * 9) / 10), Math.floor((H - CHROME - 200) / 2 / 1.36)));
  const ch = Math.round(cw * 1.36);
  g.ch = ch; g.cw = cw; g.colH = Math.max(ch + 150, Math.min(460, H - CHROME - ch - 10));
  const sp = g.body.querySelector('.pcd-sp');
  sp.style.setProperty('--fc-w', cw + 'px');
  sp.style.setProperty('--fc-h', ch + 'px');
  sp.style.setProperty('--fc-col', g.colH + 'px');
  sp.style.setProperty('--fc-font', Math.max(10, Math.round(cw * .2)) + 'px');
  const r = w.getBoundingClientRect(), sr = screen.getBoundingClientRect();
  if (r.bottom > sr.top + H) w.style.top = Math.max(0, H - r.height) + 'px';
  if (r.right > sr.right) w.style.left = Math.max(0, W - r.width) + 'px';
}

// ---- 規則 ----
function pcsRun(g, k, i) {   // 從第 i 張開始往下的牌；不是同花色連著（不能一起拿）就回傳 null
  const col = g.cols[k];
  if (i < g.down[k] || i >= col.length) return null;
  for (let j = i + 1; j < col.length; j++) if (pcsRank(col[j]) !== pcsRank(col[j - 1]) - 1 || pcsSuit(g, col[j]) !== pcsSuit(g, col[j - 1])) return null;
  return col.slice(i);
}
function pcsRunStart(g, k) {   // 這排最下面能一起拿的那疊從第幾張開始
  const col = g.cols[k]; let i = col.length - 1;
  while (i > g.down[k] && pcsRun(g, k, i - 1)) i--;
  return i;
}
const pcsFits = (g, id, k) => { const col = g.cols[k]; return !col.length || pcsRank(col[col.length - 1]) === pcsRank(id) + 1; };
function pcsSave(g) { g.hist.push(JSON.stringify({ cols: g.cols, down: g.down, stock: g.stock, done: g.done, score: g.score, moves: g.moves })); }
function pcsMove(g, from, i, to) {
  if (from === to || !pcsRun(g, from, i) || !pcsFits(g, g.cols[from][i], to)) return false;
  pcsSave(g);
  g.cols[to].push(...g.cols[from].splice(i));
  g.score--; g.moves++;
  pcsAfter(g);
  return true;
}
function pcsDeal(g) {
  if (!g.stock.length) { sfx('error'); return; }
  if (g.cols.some(c => !c.length)) { g.note = '每一排都要有牌才能發牌：先把空的那排放一張牌'; sfx('error'); renderPcSpider(); return; }
  pcsSave(g);
  g.dealt = g.stock.slice(-10).reverse();
  g.cols.forEach(col => col.push(g.stock.pop()));
  g.score--; g.moves++;
  pcsAfter(g);
  renderPcSpider();
}
function pcsAfter(g) {   // 走完一步：湊齊 K→A 的收走、最下面蓋著的牌翻開、計時、破關
  g.sel = null; g.hint = null; g.note = '';
  let got = 0;
  g.cols.forEach((col, k) => {
    const s = col.length - 13;
    if (s >= g.down[k] && pcsRank(col[s]) === 12 && pcsRun(g, k, s)) {
      (g.flying = g.flying || []).push(col.slice(s));   // 這 13 張等一下要一張一張飛到左下角（renderPcSpider 的 pcsFlyRuns）
      g.done.push(col[s]); col.splice(s); g.score += 100; got++; g.party = { kind: 'run' };
    }
    if (col.length && g.down[k] >= col.length) g.down[k] = col.length - 1;
  });
  if (!g.timer && !g.won) { minigameRound('spider'); g.timer = setInterval(() => pcsTick(g), 1000); }   // 第一步：算一局、開始計時
  if (g.done.length === 8) { g.won = true; clearInterval(g.timer); g.timer = 0; sfx('pcCardFly'); setTimeout(() => sfx('pcCardWin'), 1050); g.party = { kind: 'win' }; }   // 勝利曲等最後一組牌飛完再播
  else if (pcsStuck(g)) { g.lost = true; clearInterval(g.timer); g.timer = 0; sfx('error'); g.party = null; }   // 真的一步都不能走：這局輸了（跟新接龍一樣跳出提示）
  else sfx(got ? 'pcCardFly' : 'blip');
}
function pcsTick(g) {
  const w = pcd.wins.spider;
  if (pcDesktopOpen && w && !w.classList.contains('min')) { g.time++; minigameSecond('spider'); renderPcsInfo(g); }
}
// 第 a 排從第 i 張開始的牌搬到第 b 排之後，上面露出來的那疊（同花色連著的）能不能接到別排去
// 那疊本身也是放在大 1 的別花色牌上的話，要換到同花色的牌上才算（不然只是換個地方，沒有進展）
function pcsFreesAbove(g, a, i, b) {
  const col = g.cols[a];
  let s = i - 1;
  while (s > g.down[a] && pcsRank(col[s - 1]) === pcsRank(col[s]) + 1 && pcsSuit(g, col[s - 1]) === pcsSuit(g, col[s])) s--;
  const top = col[s], onBigger = s > g.down[a] && pcsRank(col[s - 1]) === pcsRank(top) + 1;
  return g.cols.some((dst, c) => c !== a && c !== b && dst.length && pcsFits(g, top, c)
    && (!onBigger || pcsSuit(g, dst[dst.length - 1]) === pcsSuit(g, top)));
}
function pcsMoves(g) {   // 列出所有有意義的一步（提示、卡死判斷用），好的排前面
  const out = [];
  g.cols.forEach((col, a) => {
    if (!col.length) return;
    for (let i = pcsRunStart(g, a); i < col.length; i++) {
      const id = col[i], above = i > g.down[a] ? col[i - 1] : null;
      g.cols.forEach((dst, b) => {
        if (a === b || !dst.length || !pcsFits(g, id, b)) return;
        const same = pcsSuit(g, dst[dst.length - 1]) === pcsSuit(g, id);
        // 本來就放在大 1 的牌上：換到同花色的牌上才有意義；
        // 換到別的花色上，只有「搬開後，露出來的那張能接到別排」才算（例：♠7 從 ♥8 搬到另一張 8，♥8 才能去接 ♠9）
        let freeing = false;
        if (above !== null && pcsRank(above) === pcsRank(id) + 1) {
          if (pcsSuit(g, above) === pcsSuit(g, id)) return;   // 同花色連著的一疊：拆開沒有意義
          if (!same) { if (!pcsFreesAbove(g, a, i, b)) return; freeing = true; }
        }
        out.push({ a, i, b, score: freeing ? 0 : (same ? 3 : 1) + (i === g.down[a] ? 2 : 0) });   // 這種兩步的走法排最後
      });
    }
  });
  return out.sort((x, y) => y.score - x.score);
}
// 判輸用：右下角的牌堆發完了，而且不管怎麼搬，都再也「翻不開蓋著的牌、也湊不齊一組 K→A」才算輸。
// 做法：從現在的牌面開始，把所有走得到的排法一個一個試（同一種排法只試一次），
// 只要有一條路能翻牌或收牌就不算輸。只是把牌搬來搬去、沒有進展的，不算還有路。
// 排法太多試不完（超過 PCS_STUCK_LIMIT 種）就當作還有路，寧可不判，也不要判錯。
const PCS_STUCK_LIMIT = 6000;
function pcsStuck(g) {
  if (g.stock.length) return false;
  const down = g.down, R = pcsRank, S = id => pcsSuit(g, id);
  const linked = (x, y) => R(y) === R(x) - 1 && S(y) === S(x);   // y 能跟在 x 下面一起搬（同花色、小 1）
  const keyOf = cols => cols.map(c => c.join(',')).join('|');
  const start = g.cols.map(c => c.slice()), seen = new Set([keyOf(start)]), queue = [start];
  for (let q = 0; q < queue.length; q++) {
    if (seen.size > PCS_STUCK_LIMIT) return false;
    const cols = queue[q];
    for (let a = 0; a < cols.length; a++) {
      const col = cols[a]; if (!col.length) continue;
      let rs = col.length - 1;   // 這排最下面能一起拿的那疊從第幾張開始
      while (rs > down[a] && linked(col[rs - 1], col[rs])) rs--;
      for (let i = rs; i < col.length; i++) {
        let usedEmpty = false;
        for (let b = 0; b < cols.length; b++) {
          if (b === a) continue;
          const dst = cols[b];
          if (dst.length) { if (R(dst[dst.length - 1]) !== R(col[i]) + 1) continue; }
          else { if (usedEmpty || i === 0) continue; usedEmpty = true; }   // 空排都一樣，試一個就好；整排搬進空排沒有意義
          if (i > 0 && i === down[a]) return false;   // 搬走後會翻開蓋著的牌：還有路
          const moved = dst.concat(col.slice(i)), s = moved.length - 13;
          if (s >= down[b] && R(moved[s]) === 12 && moved.slice(s).every((id, j) => !j || linked(moved[s + j - 1], id))) return false;   // 湊齊一組 K→A：還有路
          const next = cols.slice(); next[a] = col.slice(0, i); next[b] = moved;
          const k = keyOf(next);
          if (!seen.has(k)) { seen.add(k); queue.push(next); }
        }
      }
    }
  }
  return true;
}
function pcsHint(g) {
  if (g.won || g.lost) return;
  clearTimeout(g.hintTimer);
  const m = pcsMoves(g)[0];
  if (m) { g.hint = m; g.note = ''; sfx('switch'); }
  else {
    g.hint = null;
    g.note = g.cols.some(c => !c.length) ? '💡 可以把一疊牌搬到空的那排' : g.stock.length ? '💡 沒有可以搬的了，點右下角的牌堆發牌' : '沒有牌可以走了…按「復原」或「重玩這局」';
    sfx('error');
  }
  renderPcSpider(true);
  g.hintTimer = setTimeout(() => { if (g.hint) { g.hint = null; renderPcSpider(true); } }, 1500);
}
function pcsUndo(g) {
  if (!g.hist.length || g.won) { sfx('error'); return; }
  const wasLost = g.lost;
  Object.assign(g, JSON.parse(g.hist.pop()), { sel: null, hint: null, note: '', lost: false });
  if (wasLost) g.timer = setInterval(() => pcsTick(g), 1000);   // 從輸掉的地方退回來：同一局繼續，時間接著算
  sfx('switch');
  renderPcSpider();
}

// ---- 操作：拖曳、點選 ----
function pcsDown(e) {
  const g = pcd.sp;
  if (e.button !== 0 || g.won || g.lost) return;
  const el = e.target.closest('[data-slot]');
  if (!el) { if (g.sel) { g.sel = null; renderPcSpider(true); } return; }
  const slot = el.dataset.slot, k = +slot.slice(1), i = el.dataset.i === undefined ? -1 : +el.dataset.i;
  if (slot === 's') { const up = ev => { window.removeEventListener('pointerup', up); if (ev.target.closest('[data-slot="s"]')) pcsDeal(g); }; window.addEventListener('pointerup', up); e.preventDefault(); return; }
  const canDrag = i >= 0 && !!pcsRun(g, k, i);
  const sx = e.clientX, sy = e.clientY;
  let ghost = null;
  const move = ev => {
    if (!ghost && canDrag && Math.hypot(ev.clientX - sx, ev.clientY - sy) > 5) ghost = pcsStartDrag(g, slot, i);
    if (ghost) { ghost.style.left = ghost.baseX + ev.clientX - sx + 'px'; ghost.style.top = ghost.baseY + ev.clientY - sy + 'px'; }
  };
  const finish = ev => {
    window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', finish); window.removeEventListener('pointercancel', finish);
    if (ghost) pcsDrop(g, k, i, ghost, ev.type === 'pointerup');
    else if (ev.type === 'pointerup') pcsClick(g, k, i);
  };
  window.addEventListener('pointermove', move); window.addEventListener('pointerup', finish); window.addEventListener('pointercancel', finish);
  e.preventDefault();
}
function pcsStartDrag(g, slot, i) {
  const table = g.body.querySelector('.pcd-fc-table'), tr = table.getBoundingClientRect();
  g.sel = null; g.hint = null; renderPcSpider(true);
  const cards = [...table.querySelectorAll('.pcd-fc-card[data-slot="' + slot + '"][data-i]')].filter(c => +c.dataset.i >= i);
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
function pcsDrop(g, k, i, ghost, real) {   // 放開：跟哪一排重疊最多就先試哪一排（看整排的範圍，牌疊很長也放得到）
  const table = g.body.querySelector('.pcd-fc-table');
  if (real) {
    const a = ghost.firstChild.getBoundingClientRect();
    const spots = [...table.querySelectorAll('.pcd-fc-col')].map(el => {
      const b = el.getBoundingClientRect(), last = el.lastElementChild, bottom = last ? last.getBoundingClientRect().bottom : b.top + g.ch;
      return { to: +el.dataset.slot.slice(1), area: Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, bottom) - Math.max(a.top, b.top)) };
    }).filter(s => s.area > 0 && s.to !== k).sort((x, y) => y.area - x.area);
    if (spots.length && !spots.some(s => pcsMove(g, k, i, s.to))) sfx('error');
  }
  renderPcSpider();   // 牌會從鬼影的位置滑過去；沒放成就滑回原位
}
function pcsClick(g, k, i) {
  const now = performance.now(), sel = g.sel;
  if (sel) {
    if (sel.k === k) {
      if (now - g.lastClick < 350) pcsAuto(g, sel);   // 點兩下
      else { g.sel = null; sfx('switch'); }
      renderPcSpider();
      return;
    }
    // 搬過去：目的地是空排就整疊搬；不然從選的那疊裡找剛好接得上的那張開始搬
    const col = g.cols[sel.k], dst = g.cols[k];
    let from = -1;
    for (let j = sel.i; j < col.length && from < 0; j++) if (pcsFits(g, col[j], k)) from = j;
    if (!dst.length) from = sel.i;
    if (from >= 0 && pcsMove(g, sel.k, from, k)) { renderPcSpider(); return; }
    g.sel = null; sfx('error');
    if (i < 0) { renderPcSpider(true); return; }
  }
  if (i < 0) return;
  g.sel = { k, i: pcsRun(g, k, i) ? i : pcsRunStart(g, k) };   // 點到不能一起拿的牌：改選最下面能拿的那疊
  g.hint = null; g.note = '';
  g.lastClick = now;
  sfx('switch');
  renderPcSpider(true);
}
function pcsAuto(g, sel) {   // 點兩下：同花色接得上的排 → 其他接得上的排 → 空排
  const id = g.cols[sel.k][sel.i];
  const order = g.cols.map((col, b) => ({ b, rank: b === sel.k || !pcsFits(g, id, b) ? -1 : !col.length ? 1 : pcsSuit(g, col[col.length - 1]) === pcsSuit(g, id) ? 3 : 2 }))
    .filter(x => x.rank > 0).sort((x, y) => y.rank - x.rank);
  if (!order.length || !pcsMove(g, sel.k, sel.i, order[0].b)) { g.sel = null; sfx('error'); }
}

// ---- 畫面 ----
const pcsBack = (attrs, style) => '<div class="pcd-fc-card back"' + attrs + ' style="' + style + '"></div>';
function pcsCardHtml(g, id, attrs, style, extra) {
  const s = pcsSuit(g, id), r = PCF_RANKS[pcsRank(id)], t = PCF_SUITS[s] + '︎';
  return '<div class="pcd-fc-card' + (s === 1 || s === 2 ? ' red' : '') + (extra || '') + '" data-card="' + id + '"' + attrs + ' style="' + style + '">' +
    '<span class="pcd-fc-corner">' + r + t + '</span><span class="pcd-fc-suit">' + t + '</span><span class="pcd-fc-corner flip">' + r + t + '</span></div>';
}
function renderPcSpider(noAnim) {
  const g = pcd.sp, table = g.body.querySelector('.pcd-fc-table');
  const old = {};
  if (!noAnim) table.querySelectorAll('.pcd-fc-card[data-card]').forEach(el => { old[el.dataset.card] = el.getBoundingClientRect(); });
  const stockEl = table.querySelector('.pcd-sp-stock'), stockRect = stockEl && stockEl.getBoundingClientRect();
  const hl = (k, i) => (g.sel && g.sel.k === k && i >= g.sel.i ? ' sel' : '') + (g.hint && ((g.hint.a === k && i >= g.hint.i) || (g.hint.b === k && i === g.cols[k].length - 1)) ? ' hint' : '');
  // 蓋著的牌疊得比較密；整排太長就一起壓扁，塞進固定的高度
  const upOff = Math.round(g.ch * .27), downOff = Math.round(g.ch * .12);
  const cols = g.cols.map((col, k) => {
    const nd = Math.min(g.down[k], col.length), nu = col.length - nd;
    const want = nd * downOff + Math.max(0, nu - 1) * upOff, room = g.colH - g.ch;
    const f = want > room ? room / want : 1;
    let y = 0;
    return '<div class="pcd-fc-spot pcd-fc-col" data-slot="c' + k + '">' + col.map((id, i) => {
      const top = 'top:' + Math.round(y) + 'px';
      y += (i < nd ? downOff : upOff) * f;
      return i < nd ? pcsBack(' data-slot="c' + k + '"', top) : pcsCardHtml(g, id, ' data-slot="c' + k + '" data-i="' + i + '"', top, hl(k, i));
    }).join('') + '</div>';
  }).join('');
  const off = Math.round(g.cw * .22);
  const done = g.done.map((id, n) => pcsCardHtml(g, id, '', 'left:' + n * off + 'px')).join('');
  const piles = Math.ceil(g.stock.length / 10);
  const stock = Array.from({ length: piles }, (_, n) => pcsBack(' data-slot="s"', 'left:' + n * off + 'px')).join('');
  table.innerHTML = '<div class="pcd-fc-cols">' + cols + '</div><div class="pcd-sp-foot">' +
    '<div class="pcd-sp-done" style="width:calc(var(--fc-w) + ' + 7 * off + 'px)">' + (done || '<span class="pcd-sp-empty">收齊 K→A 會放這裡</span>') + '</div>' +
    '<div class="pcd-sp-stock" data-slot="s" title="點一下：每排各發 1 張" style="width:calc(var(--fc-w) + ' + 4 * off + 'px)">' + (stock || '<span class="pcd-sp-empty">發完了</span>') + '</div></div>' +
    (g.lost ? '<div class="pcd-fc-over"><div class="pcd-fc-overbox"><b>這局輸了</b><p>不管怎麼搬，都翻不開蓋著的牌、也湊不齊 K→A 了。</p><button type="button" data-sp="undo">↶ 復原</button><button type="button" data-sp="retry">重玩這局</button><button type="button" data-sp="new">新牌局</button></div></div>' : '');   // 「這局輸了」提示：跟新接龍用同一個樣子
  const flyK = new Set((g.flying || []).map(run => String(run[0])));
  table.querySelectorAll('.pcd-fc-card[data-card]').forEach(el => {   // 牌從舊位置滑到新位置；剛發的牌從右下角的牌堆飛出來
    if (flyK.has(el.dataset.card)) return;
    const dealt = g.dealt ? g.dealt.indexOf(+el.dataset.card) : -1;
    const o = old[el.dataset.card] || (dealt >= 0 && stockRect); if (!o) return;
    const n = el.getBoundingClientRect(), dx = o.left - n.left, dy = o.top - n.top;
    if (!dx && !dy) return;
    el.style.zIndex = 60;
    el.animate([{ transform: 'translate(' + dx + 'px,' + dy + 'px)' }, { transform: 'none' }], { duration: dealt >= 0 ? 220 : 150, delay: Math.max(0, dealt) * 30, easing: 'ease-out', fill: 'backwards' }).onfinish = () => { el.style.zIndex = ''; };
  });
  g.dealt = null;
  let flyMs = 0;
  if (g.flying) { flyMs = pcsFlyRuns(g, table, old, g.flying); g.flying = null; }
  if (g.party) {   // 集成一組／破關：牌飛完之後放慶祝特效（js/pc-desktop.js 的 pcCelebrate）
    const p = g.party; g.party = null;
    setTimeout(() => {
      if (p.kind === 'win') pcCelebrate('spider', { kind: 'win' });
      else { const last = g.body.querySelectorAll('.pcd-sp-done .pcd-fc-card'); pcCelebrate('spider', { kind: 'run', at: last[last.length - 1] }); }
    }, flyMs);
  }
  renderPcsInfo(g);
  g.body.querySelector('.pcd-fc-msg').textContent = g.won ? '🎉 破關了！分數 ' + g.score + '、花了 ' + pcfTime(g.time) + '。按「新牌局」再玩一次'
    : g.lost ? '這局輸了：怎麼搬都沒有進展了。分數 ' + g.score + '、花了 ' + pcfTime(g.time) + '、' + g.moves + ' 步'
    : g.note || ('同花色、由大到小連著的牌才能一起搬；湊齊 K→A 自動收走。點右下角的牌堆發牌（還有 ' + piles + ' 次）');
  g.body.querySelector('[data-sp="undo"]').disabled = !g.hist.length || g.won;
  renderJJGift(g);
}
// 收起一組：13 張牌從 A 開始、一張接一張快速飛到左下角收好的那疊（K 最後到，到了才露出收好的那張）
// old＝重畫之前每張牌在畫面上的位置；回傳整段動畫要多久（毫秒），慶祝特效等它飛完再放
const PCS_FLY_GAP = 55, PCS_FLY_MS = 260;
function pcsFlyRuns(g, table, old, runs) {
  const tr = table.getBoundingClientRect();
  let n = 0;
  runs.forEach(run => {
    const real = table.querySelector('.pcd-sp-done [data-card="' + run[0] + '"]'); if (!real) return;
    const to = real.getBoundingClientRect();
    real.style.visibility = 'hidden';
    run.slice().reverse().forEach((id, i) => {   // 反過來：A 先飛、K 最後
      const from = old[id] || to;
      const el = document.createElement('div');
      el.innerHTML = pcsCardHtml(g, id, '', 'left:' + (to.left - tr.left - table.clientLeft) + 'px;top:' + (to.top - tr.top - table.clientTop) + 'px;z-index:' + (70 + n) + ';pointer-events:none');
      const card = el.firstChild; table.appendChild(card);
      const last = i === run.length - 1;
      card.animate([
        { transform: 'translate(' + (from.left - to.left) + 'px,' + (from.top - to.top) + 'px)' },
        { transform: 'translate(' + (from.left - to.left) * .5 + 'px,' + ((from.top - to.top) * .5 - 18) + 'px) rotate(' + (i % 2 ? 8 : -8) + 'deg)', offset: .5 },   // 中途微微往上拋、轉一下
        { transform: 'none' }
      ], { duration: PCS_FLY_MS, delay: n * PCS_FLY_GAP, easing: 'ease-in', fill: 'both' }).onfinish = () => {
        card.remove();
        if (last && real.isConnected) real.style.visibility = '';
      };
      n++;
    });
  });
  return n ? (n - 1) * PCS_FLY_GAP + PCS_FLY_MS : 0;
}
function renderPcsInfo(g) {
  g.body.querySelector('.pcd-fc-info').textContent = '分數 ' + g.score + '　步數 ' + g.moves + '　時間 ' + pcfTime(g.time);
}

// ---- 🎁 給JJ的禮物：贏一局單色連環新接龍，就能看朔的生日劇情 ----
const JJ_GIFT_SCENE = 'saku_birthday';   // 劇情 id（data/story-scenes.js，🎬 劇情編輯器可以改內容）
function openJJGift() {   // 桌面點「給JJ的禮物」：打開連環新接龍視窗，換成禮物模式、單色、發一局新的
  openPcApp('spider');
  const g = pcd.sp;
  g.gift = true;
  newPcSpider(1);
}
function renderJJGift(g) {
  const bar = g.body.querySelector('.pcd-sp-gift'), w = pcd.wins.spider;
  bar.classList.toggle('hidden', !g.gift);
  if (w) w.querySelector('.pcd-ttext').textContent = g.gift ? '給JJ的禮物－連環新接龍（單色）' : '連環新接龍';
  if (!g.gift) return;
  const html = g.won
    ? '<span>🎉 禮物打開了！</span><button type="button" data-gift-play="1">🎂 觀看朔的生日</button>'
    : '<span>🎁 給JJ的禮物：贏一局單色連環新接龍，就能打開禮物！</span>';
  if (bar.innerHTML !== html) bar.innerHTML = html;
}
function playJJGiftStory() {   // 關掉電腦、先存檔（劇情播放中不存檔），再播生日劇情；看完回到應變中心
  if (window.STORY_MODE) return;
  sfx('button');
  closePcDesktop();
  if (typeof saveGame === 'function') saveGame();
  if (!StoryScene.playFromGame(JJ_GIFT_SCENE, () => systemNotice('🎂 生日快樂！'))) systemNotice('禮物打不開…找不到朔的生日劇情', true);
}
