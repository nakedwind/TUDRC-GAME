/* ===== 2F應變中心的電腦：📊 遊戲紀錄（每款小遊戲玩了幾局、花了多少時間）=====
   ・視窗、桌面圖示在 js/pc-desktop.js；樣式在 css/style.css 的「遊戲紀錄」
   ・紀錄存在 tudrc_minigame_stats_v1，格式：{ 小遊戲 id: { rounds: 局數, sec: 秒數 } }
     已經加進 js/new-game.js 的進度清單：會跟著存檔、開新遊戲會重設，測試模式玩的也不會留到正式進度
   ・怎樣算一局：
       踩地雷、新接龍、蜘蛛紙牌：開始動第一步才算（只是打開視窗、發好牌不算）
       射擊練習：打完一個彈匣、或完成一次限時挑戰（中途離開不算）
       夾娃娃機：每下一爪
   ・時間怎麼算：
       踩地雷、新接龍、蜘蛛紙牌：跟牌局上的計時器一起走（第一步之後才開始，破關、踩到地雷就停）
       射擊練習、夾娃娃機：畫面開著的時間
*/
const MINIGAME_STORE = 'tudrc_minigame_stats_v1';
const MINIGAMES = [
  { id: 'mines', name: '踩地雷', icon: '💣' },
  { id: 'freecell', name: '新接龍', icon: '🃏' },
  { id: 'spider', name: '蜘蛛紙牌', icon: '🕷️' },
  { id: 'target', name: '射擊練習', icon: '🎯' },
  { id: 'claw', name: '夾娃娃機', icon: '🧸' },
];
const minigameStats = (() => { try { return JSON.parse(localStorage.getItem(MINIGAME_STORE) || '{}') || {}; } catch (_) { return {}; } })();
const minigameStat = id => minigameStats[id] || (minigameStats[id] = { rounds: 0, sec: 0 });
function saveMinigameStats() {
  try { localStorage.setItem(MINIGAME_STORE, JSON.stringify(minigameStats)); } catch (_) {}
  if (typeof pcd !== 'undefined' && pcd.wins.stats && pcDesktopOpen) renderPcStats();   // 紀錄視窗開著就馬上更新
}
function minigameRound(id) { minigameStat(id).rounds++; saveMinigameStats(); }    // 多玩了一局
function minigameSecond(id) { minigameStat(id).sec++; saveMinigameStats(); }      // 多玩了一秒
// 射擊練習、夾娃娃機沒有每秒走的計時器：打開時開始算、關掉時停（切到別的分頁不算）
const minigameTimers = {};
function minigameTimer(id, on) {
  clearInterval(minigameTimers[id]);
  if (on) minigameTimers[id] = setInterval(() => { if (!document.hidden) minigameSecond(id); }, 1000);
}

function pcStatTime(sec) {   // 45 秒、3 分 20 秒、1 小時 5 分
  const h = Math.floor(sec / 3600), m = Math.floor(sec / 60) % 60, s = sec % 60;
  return h ? h + ' 小時 ' + m + ' 分' : m ? m + ' 分 ' + s + ' 秒' : s + ' 秒';
}
function initPcStats(body) {
  body.innerHTML = '<div class="pcd-stats"><table><thead><tr><th>小遊戲</th><th>局數</th><th>遊玩時間</th></tr></thead><tbody></tbody><tfoot></tfoot></table></div>';
  renderPcStats();
}
function renderPcStats() {
  const w = pcd.wins.stats; if (!w) return;
  const rows = MINIGAMES.map(g => ({ ...g, ...minigameStat(g.id) }));
  const sum = key => rows.reduce((n, r) => n + r[key], 0);
  w.querySelector('tbody').innerHTML = rows.map(r => '<tr><td><span class="pcd-stats-ico">' + r.icon + '</span>' + r.name + '</td><td>' + r.rounds + ' 局</td><td>' + pcStatTime(r.sec) + '</td></tr>').join('');
  w.querySelector('tfoot').innerHTML = '<tr><td>合計</td><td>' + sum('rounds') + ' 局</td><td>' + pcStatTime(sum('sec')) + '</td></tr>';
}
