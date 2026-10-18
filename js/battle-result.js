/* ===== 結算畫面：打贏一張地圖後，在勝利視窗下面列出這一局的統計 =====
   統計存在 G.battle（js/game.js 的 newGame 建立）：
     kills：打倒的怪物（名字 → 數量）、crystals：得到的異質碎片、cores：摧毀的異質核心、
     got：撿到的東西、spent：蓋建築花掉的經費、time：作戰時間（秒）
*/
// 撿到東西時呼叫（js/storage-lockers.js 的 showItemPickupNotice、裝備、武器）
function battleGot(name, image, n = 1) {
  if (typeof G === 'undefined' || !G || !G.battle || MAP_SAFE || G.over) return;
  const row = G.battle.got.find(x => x.name === name);
  if (row) row.n += n; else G.battle.got.push({ name, image, n });
}
// 作戰時間：每幀累加（戰鬥中、沒暫停時）
function battleTick(dt) { if (G && G.battle && G.running && !G.over && !MAP_SAFE) G.battle.time += dt; }

function appendBattleResult() {
  const box = document.getElementById('ov-text'); if (!box || !G || !G.battle) return;
  const b = G.battle, esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
  const kills = Object.entries(b.kills).sort((x, y) => y[1] - x[1]);
  const totalKills = kills.reduce((s, [, n]) => s + n, 0);
  const mm = Math.floor(b.time / 60), ss = Math.floor(b.time % 60);
  const stat = (cls, label, val) => '<div class="br-stat ' + cls + '"><small>' + label + '</small><b>' + val + '</b></div>';
  const chips = (list, empty) => list.length ? '<div class="br-list">' + list.join('') + '</div>' : '<span class="br-empty">' + empty + '</span>';
  // 精簡版：上面一排數字，下面左右兩欄（打倒的異質體／本次取得）
  box.insertAdjacentHTML('beforeend', '<div class="battle-result">' +
    '<div class="br-row">' + stat('', '作戰時間', mm + ':' + String(ss).padStart(2, '0')) + stat('', '打倒異質體', totalKills) +
      stat('', '異質核心', b.cores) + stat('crystal', '異質碎片', '+' + b.crystals) + stat('money', '剩下經費', '$' + Math.floor(G.money)) + '</div>' +
    '<div class="br-cols">' +
      '<div class="br-block"><h4>打倒的異質體</h4>' + chips(kills.map(([name, n]) => '<span class="br-chip">' + esc(name) + ' <em>×' + n + '</em></span>'), '沒有打倒異質體') + '</div>' +
      '<div class="br-block"><h4>本次取得</h4>' + chips(b.got.map(g => '<span class="br-chip">' + (g.image ? '<img src="' + esc(g.image) + '" alt="">' : '') + esc(g.name) + ' <em>×' + g.n + '</em></span>'), '沒有撿到東西') + '</div>' +
    '</div>' +
  '</div>');
}
