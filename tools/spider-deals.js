/* ===== 連環新接龍：找出「一定解得開」的牌局編號（data/pc-spider-deals.js）=====
   遊戲按「新牌局」時，從 data/pc-spider-deals.js 的清單裡挑一個編號發牌，所以每一局都有解。
   這個工具在背後讓電腦把牌局一局一局玩過一遍，解得開的編號才收進清單（遊戲裡不跑這個，發牌是瞬間的）。

   用法（在專案資料夾執行；會用好幾個 CPU 一起算，四色比較久，大約十幾分鐘）：
     node tools/spider-deals.js            ← 單色、雙色、四色全部重新找
     node tools/spider-deals.js 4          ← 只重新找四色（其他保留檔案裡原本的）

   注意：發牌的洗牌方式（下面的 dealOf）必須跟 js/pc-spider.js 的 newPcSpider 一模一樣，
   改了那邊的洗牌就要重新跑這個工具，不然清單裡的編號就不保證有解了。
   電腦解得開＝一定有解；但電腦解不開的不一定是死局（只是電腦沒找到），所以清單偏向比較順的牌局。
*/
const fs = require('fs'), path = require('path'), { fork } = require('child_process');
const WANT = { 1: 400, 2: 300, 4: 150 };   // 每種難度要收幾局
const SUIT_SETS = { 1: [3, 3, 3, 3, 3, 3, 3, 3], 2: [3, 2, 3, 2, 3, 2, 3, 2], 4: [3, 2, 1, 0, 3, 2, 1, 0] };   // 跟 js/pc-spider.js 的 PCS_SUIT_SETS 一樣
const OUT = path.join(__dirname, '..', 'data', 'pc-spider-deals.js');

// ---- 發牌（跟 js/pc-spider.js 一樣）----
function pcsRandom(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function dealOf(no, suits) {
  const rnd = pcsRandom(no * 7 + suits), deck = Array.from({ length: 104 }, (_, i) => i);
  for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [deck[i], deck[j]] = [deck[j], deck[i]]; }
  const cols = Array.from({ length: 10 }, (_, k) => deck.splice(0, k < 4 ? 6 : 5));
  return { cols, down: cols.map(c => c.length - 1), stock: deck };
}

// ---- 解題：照「每一輪發牌」分段；每一段不發牌、盡量把牌整理到最好（挑分數最高的幾個局面），再各自發下一輪牌往下試 ----
function makeSolver(W) {
  const R = id => id % 13;
  return function solve(cols0, down0, stock0, suitOf, opt) {
    const { phaseLimit = 4000, keep = 2, budget = 400000 } = opt || {};
    let spent = 0;
    const linked = (x, y) => R(y) === R(x) - 1 && suitOf(y) === suitOf(x);
    function settle(n) {
      for (let k = 0; k < 10; k++) {
        const col = n.cols[k], s = col.length - 13;
        if (s >= n.down[k] && s >= 0 && R(col[s]) === 12) {
          let ok = true; for (let j = s + 1; j < col.length; j++) if (!linked(col[j - 1], col[j])) { ok = false; break; }
          if (ok) { n.cols[k] = col.slice(0, s); n.done++; }
        }
        const c = n.cols[k]; if (c.length && n.down[k] >= c.length) n.down[k] = c.length - 1; if (!c.length) n.down[k] = 0;
      }
    }
    function score(n) {
      let s = n.done * 1000, empty = 0;
      for (let k = 0; k < 10; k++) {
        const col = n.cols[k]; if (!col.length) { empty++; continue; }
        s -= n.down[k] * W.down;
        for (let j = n.down[k] + 1; j < col.length; j++) if (R(col[j]) === R(col[j - 1]) - 1) s += suitOf(col[j]) === suitOf(col[j - 1]) ? W.same : W.off;
      }
      return s + empty * W.empty;
    }
    const keyOf = n => n.cols.map((c, k) => n.down[k] + ':' + c.join(',')).join('|');
    function children(n) {
      const out = [];
      for (let a = 0; a < 10; a++) {
        const col = n.cols[a]; if (!col.length) continue;
        let rs = col.length - 1; while (rs > n.down[a] && linked(col[rs - 1], col[rs])) rs--;
        for (let i = rs; i < col.length; i++) {
          const id = col[i], above = i > n.down[a] ? col[i - 1] : null, aboveFits = above !== null && R(above) === R(id) + 1;
          let usedEmpty = false;
          for (let b = 0; b < 10; b++) {
            if (b === a) continue;
            const dst = n.cols[b];
            if (dst.length) {
              if (R(dst[dst.length - 1]) !== R(id) + 1) continue;
              if (aboveFits && suitOf(above) === suitOf(id)) continue;
              if (aboveFits && suitOf(dst[dst.length - 1]) !== suitOf(id)) {
                let free = false;
                for (let c = 0; c < 10 && !free; c++) { const d2 = n.cols[c]; if (c !== a && c !== b && d2.length && R(d2[d2.length - 1]) === R(above) + 1 && suitOf(d2[d2.length - 1]) === suitOf(above)) free = true; }
                if (!free) continue;
              }
            } else { if (usedEmpty || i === 0) continue; usedEmpty = true; }
            const cols = n.cols.slice(); cols[a] = col.slice(0, i); cols[b] = dst.concat(col.slice(i));
            const m = { cols, down: n.down.slice(), stock: n.stock, done: n.done }; settle(m); out.push(m);
          }
        }
      }
      return out;
    }
    // 這一段（不發牌）能整理出來的局面裡，挑最好的 keep 個（沒有空排才能發牌；牌堆發完了就看有沒有解開）
    function phase(start) {
      const heap = [start], seen = new Set([keyOf(start)]), all = [start];
      start.s = score(start);
      const push = x => { heap.push(x); let i = heap.length - 1; while (i) { const p = (i - 1) >> 1; if (heap[p].s >= x.s) break; heap[i] = heap[p]; heap[p] = x; i = p; } };
      const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let i = 0; for (;;) { const l = i * 2 + 1, r = l + 1; let m = i; if (l < heap.length && heap[l].s > heap[m].s) m = l; if (r < heap.length && heap[r].s > heap[m].s) m = r; if (m === i) break; [heap[i], heap[m]] = [heap[m], heap[i]]; i = m; } } return top; };
      let n = 0;
      while (heap.length && n < phaseLimit) {
        const x = pop(); n++; spent++;
        if (x.done === 8) return { win: true };
        for (const c of children(x)) { const k = keyOf(c); if (seen.has(k)) continue; seen.add(k); c.s = score(c); push(c); all.push(c); if (c.done === 8) return { win: true }; }
      }
      // 能發牌的（沒有空排）——空排的局面要先補一張；挑分數最高、而且彼此不一樣的
      const ok = all.filter(x => x.cols.every(c => c.length)).sort((p, q) => q.s - p.s);
      return { win: false, best: ok.slice(0, keep) };
    }
    function go(n) {
      if (spent > budget) return false;
      const r = phase(n); if (r.win) return true;
      if (!n.stock.length) return false;
      for (const b of r.best) {
        const stock = b.stock.slice(), cols = b.cols.map(c => c.concat(stock.pop()));
        const m = { cols, down: b.down.slice(), stock, done: b.done }; settle(m);
        if (go(m)) return true;
        if (spent > budget) return false;
      }
      return false;
    }
    const s0 = { cols: cols0.map(c => c.slice()), down: down0.slice(), stock: stock0.slice(), done: 0 }; settle(s0);
    return go(s0);
  };
}

// ---- 主程式：分給好幾個子程序一起算 ----
const OPT = { 1: { phaseLimit: 3000, keep: 2, budget: 300000 }, 2: { phaseLimit: 3000, keep: 2, budget: 300000 }, 4: { phaseLimit: 3000, keep: 2, budget: 300000 } };
if (process.argv[2] === '--worker') {   // 子程序：收到「哪種難度、從哪個編號到哪個」，回報解得開的編號
  const solve = makeSolver({ down: 25, same: 12, off: 4, empty: 30 });
  process.on('message', ({ suits, from, to }) => {
    const suitOf = id => SUIT_SETS[suits][Math.floor(id / 13)];
    for (let no = from; no < to; no++) {
      const d = dealOf(no, suits);
      process.send({ no, ok: solve(d.cols, d.down, d.stock, suitOf, OPT[suits]) });
    }
    process.send({ done: true });
  });
} else {
  const only = process.argv[2] ? [+process.argv[2]] : [1, 2, 4];
  let old = {};
  try { const m = {}; new Function('m', fs.readFileSync(OUT, 'utf8').replace('const PCS_SOLVABLE', 'm.v') )(m); old = m.v || {}; } catch (_) {}
  const cpus = Math.max(1, Math.min(12, require('os').cpus().length - 1));
  (async () => {
    const result = { ...old };
    for (const suits of only) {
      const found = [], t0 = Date.now(); let next = 1 + suits * 10000;   // 每種難度從不同的編號開始找（遊戲裡的編號 1～99999）
      await new Promise(done => {
        let running = 0;
        const start = () => {
          if (found.length >= WANT[suits]) { if (!running) done(); return; }
          const w = fork(__filename, ['--worker']); running++;
          const from = next; next += 20;
          w.on('message', m => {
            if (m.done) { w.kill(); running--; start(); return; }
            if (m.ok && found.length < WANT[suits]) { found.push(m.no); process.stdout.write('\r' + suits + ' 色：找到 ' + found.length + ' / ' + WANT[suits] + '（' + Math.round((Date.now() - t0) / 1000) + ' 秒）   '); }
          });
          w.send({ suits, from, to: from + 20 });
        };
        for (let i = 0; i < cpus; i++) start();
      });
      result[suits] = found.sort((a, b) => a - b);
      console.log();
    }
    fs.writeFileSync(OUT, '/* 連環新接龍「一定解得開」的牌局編號（tools/spider-deals.js 產生，不要手動改）。\n   遊戲按「新牌局」時從這裡挑一個（js/pc-spider.js 的 newPcSpider）。key：1＝單色、2＝雙色、4＝四色 */\n' +
      'const PCS_SOLVABLE = {\n' + Object.keys(result).sort().map(k => '  ' + k + ': [' + result[k].join(',') + ']').join(',\n') + '\n};\n');
    console.log('已寫入 ' + OUT);
  })();
}
