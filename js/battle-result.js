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
  const squad = (G.towers || []).map(t => {
    const spec = TYPES[t.type]; if (!spec) return '';
    const pct = Math.max(0, Math.min(100, (t.hp / (t.maxhp || spec.hp)) * 100));
    return '<div class="br-member' + (t.hp <= 0 ? ' down' : '') + '"><span>' + esc(spec.name) + '</span><i><u style="width:' + pct.toFixed(0) + '%"></u></i><span>' + (t.hp <= 0 ? '重傷' : Math.round(pct) + '%') + '</span></div>';
  }).join('');
  box.insertAdjacentHTML('beforeend', '<div class="battle-result">' +
    '<div class="br-row">' + stat('', '作戰時間', mm + ':' + String(ss).padStart(2, '0')) + stat('', '打倒異質體', totalKills) +
      stat('crystal', '異質碎片', '+' + b.crystals) + stat('money', '剩下經費', '$' + Math.floor(G.money)) + '</div>' +
    '<div class="br-block"><h4>作戰經費</h4><span class="br-chip">出勤時 <em>$' + (b.budget ?? '-') + '</em></span> <span class="br-chip">建築花費 <em>$' + b.spent + '</em></span>' + (b.sold ? ' <span class="br-chip">賣東西 <em>+$' + b.sold + '</em></span>' : '') + '  <span class="br-chip">剩下 <em>$' + Math.floor(G.money) + '</em>（回基地後加進錢包）</span></div>' +
    '<div class="br-block"><h4>打倒的異質體（異質核心 ' + b.cores + ' 個）</h4>' +
      chips(kills.map(([name, n]) => '<span class="br-chip">' + esc(name) + ' <em>×' + n + '</em></span>'), '沒有打倒異質體') + '</div>' +
    '<div class="br-block"><h4>本次取得</h4>' +
      chips(b.got.map(g => '<span class="br-chip">' + (g.image ? '<img src="' + esc(g.image) + '" alt="">' : '') + esc(g.name) + ' <em>×' + g.n + '</em></span>'), '沒有撿到東西') + '</div>' +
    (squad ? '<div class="br-block"><h4>隊員狀態</h4><div class="br-squad">' + squad + '</div></div>' : '') +
  '</div>');
}
