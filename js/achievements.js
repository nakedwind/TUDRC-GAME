// ============================================================
//  成就系統：累計各種戰績，達成時在右下角彈出通知
//  進度存在這台瀏覽器（localStorage），重開遊戲也會保留
// ============================================================

// group：成就頁面上的分類；stat：累計哪一項數字；goal：達到多少就解鎖；name：顯示的文字
const ACHIEVEMENTS = [
  { id: 'slime_10',   group: '討伐', stat: 'slimeKills',  goal: 10,  name: '討伐 10 隻史萊姆' },
  { id: 'slime_50',   group: '討伐', stat: 'slimeKills',  goal: 50,  name: '討伐 50 隻史萊姆' },
  { id: 'slime_100',  group: '討伐', stat: 'slimeKills',  goal: 100, name: '討伐 100 隻史萊姆' },
  { id: 'slime_300',  group: '討伐', stat: 'slimeKills',  goal: 300, name: '討伐 300 隻史萊姆' },
  { id: 'giant_1',    group: '特殊異質體', stat: 'giantKills',  goal: 1,   name: '擊倒巨型史萊姆' },
  { id: 'giant_5',    group: '特殊異質體', stat: 'giantKills',  goal: 5,   name: '擊倒 5 隻巨型史萊姆' },
  { id: 'bomber_10',  group: '特殊異質體', stat: 'bomberKills', goal: 10,  name: '擊倒 10 隻自爆史萊姆' },
  { id: 'split_20',   group: '特殊異質體', stat: 'splitterKills', goal: 20, name: '擊倒 20 隻分裂史萊姆' },
  { id: 'spit_20',    group: '特殊異質體', stat: 'spitterKills', goal: 20, name: '擊倒 20 隻吐酸史萊姆' },
  { id: 'crit_10',    group: '戰鬥', stat: 'crits',       goal: 10,  name: '打出 10 次爆擊' },
  { id: 'crit_100',   group: '戰鬥', stat: 'crits',       goal: 100, name: '打出 100 次爆擊' },
  { id: 'soothe_10',  group: '嚮導', stat: 'soothes',     goal: 10,  name: '親自疏導哨兵 10 次' },
  { id: 'soothe_50',  group: '嚮導', stat: 'soothes',     goal: 50,  name: '親自疏導哨兵 50 次' },
  { id: 'calm_1',     group: '嚮導', stat: 'berserkCalmed', goal: 1, name: '把暴走的隊友拉回來' },
  { id: 'calm_10',    group: '嚮導', stat: 'berserkCalmed', goal: 10, name: '把暴走的隊友拉回來 10 次' },
  { id: 'win_1',      group: '任務', stat: 'wins',        goal: 1,   name: '第一次守住營地' },
  { id: 'win_10',     group: '任務', stat: 'wins',        goal: 10,  name: '守住營地 10 次' },
  { id: 'control_1',  group: '任務', stat: 'fullControls', goal: 1,  name: '第一次徹底控制一個區域' },
  { id: 'control_5',  group: '任務', stat: 'fullControls', goal: 5,  name: '徹底控制區域 5 次' },
];
// 成就頁面上方「累計戰績」顯示哪些數字
const ACHIEVE_STAT_LABELS = [
  ['slimeKills', '討伐史萊姆'], ['giantKills', '擊倒巨型'], ['crits', '爆擊'],
  ['soothes', '親自疏導'], ['berserkCalmed', '平息暴走'], ['wins', '守住營地'], ['fullControls', '徹底控制'],
];
const ACHIEVE_KEY = 'tudrc_achievements_v1';
const ACHIEVE_TOAST = { show: 4, gap: .35 };   // 通知停留秒數、連續解鎖時每則間隔

const achieveData = (() => {
  try {
    const d = JSON.parse(localStorage.getItem(ACHIEVE_KEY) || 'null');
    if (d && typeof d === 'object') return { stats: d.stats || {}, unlocked: d.unlocked || {} };
  } catch (_) {}
  return { stats: {}, unlocked: {} };
})();
function saveAchievements() {
  try { localStorage.setItem(ACHIEVE_KEY, JSON.stringify(achieveData)); } catch (_) {}
}

// 累加一項數字，並檢查有沒有新解鎖的成就
function addStat(stat, n = 1) {
  achieveData.stats[stat] = (achieveData.stats[stat] || 0) + n;
  const value = achieveData.stats[stat];
  for (const a of ACHIEVEMENTS) {
    if (a.stat !== stat || achieveData.unlocked[a.id] || value < a.goal) continue;
    achieveData.unlocked[a.id] = Date.now();
    queueAchievementToast(a);
  }
  saveAchievements();
}

// 怪物死亡時呼叫（js/combat-feel.js 的 onEnemyDeath）
function trackKillAchievements(e) {
  if (e.exploded || e.type !== 'slime') return;   // 自爆史萊姆自己炸掉不算
  addStat('slimeKills');
  if (e.variant === 'giant') addStat('giantKills');
  else if (e.variant === 'bomber') addStat('bomberKills');
  else if (e.variant === 'splitter') addStat('splitterKills');
  else if (e.variant === 'spitter') addStat('spitterKills');
}

// ---- 右下角通知：一則一則排隊彈出 ----
const achieveQueue = [];
let achieveBusy = false, achieveBox = null;
function queueAchievementToast(a) {
  achieveQueue.push(a);
  if (!achieveBusy) showNextAchievement();
}
function showNextAchievement() {
  const a = achieveQueue.shift();
  if (!a) { achieveBusy = false; return; }
  achieveBusy = true;
  if (!achieveBox) {
    achieveBox = document.createElement('div');
    achieveBox.id = 'achievementToasts';
    (document.getElementById('wrap') || document.body).appendChild(achieveBox);
  }
  const item = document.createElement('div');
  item.className = 'achievement-toast';
  item.innerHTML = '<span class="achievement-icon">🏆</span><div><small>達成成就</small><b></b></div>';
  item.querySelector('b').textContent = a.name;
  achieveBox.appendChild(item);
  if (typeof sfx === 'function') sfx('achievement');
  setTimeout(() => {
    item.classList.add('leaving');
    setTimeout(() => item.remove(), 400);
  }, ACHIEVE_TOAST.show * 1000);
  setTimeout(showNextAchievement, ACHIEVE_TOAST.gap * 1000 + 600);
}

// ---- 成就頁面（基地裡左側的「🏆 成就」按鈕）----
let achieveBtn = null, achievePanel = null;
function ensureAchievementUI() {
  const wrap = document.getElementById('wrap'); if (!wrap) return;
  if (!achieveBtn) {
    achieveBtn = document.createElement('button');
    achieveBtn.id = 'achievementButton'; achieveBtn.type = 'button'; achieveBtn.className = 'hidden';
    achieveBtn.textContent = '🏆 成就';
    achieveBtn.addEventListener('click', () => isAchievementPanelOpen() ? closeAchievementPanel() : openAchievementPanel());
    wrap.appendChild(achieveBtn);
  }
  if (!achievePanel) {
    achievePanel = document.createElement('div');
    achievePanel.id = 'achievementPanel'; achievePanel.className = 'hidden';
    achievePanel.addEventListener('click', e => {
      if (e.target === achievePanel || e.target.closest('.achv-close')) closeAchievementPanel();   // 點外面或 × 關閉
    });
    wrap.appendChild(achievePanel);
  }
}
// 只在安全場景（基地）顯示按鈕；由 team.js 的 updateTeamButton 呼叫
function updateAchievementButton(safe) {
  ensureAchievementUI();
  if (achieveBtn) achieveBtn.classList.toggle('hidden', !safe);
  if (!safe) closeAchievementPanel();
}
function isAchievementPanelOpen() { return achievePanel && !achievePanel.classList.contains('hidden'); }
function closeAchievementPanel() { if (achievePanel) achievePanel.classList.add('hidden'); if (achieveBtn) achieveBtn.classList.remove('active'); }
function openAchievementPanel() {
  ensureAchievementUI();
  if (typeof closeTeamPanel === 'function') closeTeamPanel();
  if (typeof closeSquadPanel === 'function') closeSquadPanel();
  renderAchievementPanel();
  achievePanel.classList.remove('hidden'); achieveBtn.classList.add('active');
  if (typeof sfx === 'function') sfx('menu');
}
function renderAchievementPanel() {
  const st = achieveData.stats, un = achieveData.unlocked;
  const done = ACHIEVEMENTS.filter(a => un[a.id]).length, total = ACHIEVEMENTS.length;
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const fmtDate = ts => { const d = new Date(ts); return d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate(); };
  const groups = [...new Set(ACHIEVEMENTS.map(a => a.group || '其他'))];
  const card = a => {
    const value = st[a.stat] || 0, got = !!un[a.id], k = Math.min(1, value / a.goal);
    return '<div class="achv-card' + (got ? ' got' : '') + '">' +
      '<span class="achv-icon">' + (got ? '🏆' : '🔒') + '</span>' +
      '<div class="achv-body"><b>' + esc(a.name) + '</b>' +
      (got ? '<small>' + fmtDate(un[a.id]) + ' 達成</small>'
           : '<i class="achv-bar"><u style="width:' + (k * 100).toFixed(1) + '%"></u></i><small>' + Math.min(value, a.goal) + ' / ' + a.goal + '</small>') +
      '</div></div>';
  };
  achievePanel.innerHTML =
    '<div class="achv-dialog" role="dialog" aria-modal="true" aria-label="成就">' +
      '<header class="achv-head"><div><h2>🏆 成就</h2><p>Y102 應變編組的戰績紀錄</p></div>' +
        '<div class="achv-total"><span>已達成 <b>' + done + ' / ' + total + '</b></span><i class="achv-bar"><u style="width:' + (done / total * 100).toFixed(1) + '%"></u></i></div>' +
        '<button class="achv-close" type="button" aria-label="關閉">×</button></header>' +
      '<div class="achv-stats">' + ACHIEVE_STAT_LABELS.map(([k, label]) =>
        '<span><small>' + label + '</small><b>' + (st[k] || 0) + '</b></span>').join('') + '</div>' +
      '<div class="achv-list">' + groups.map(g =>
        '<section><h3>' + esc(g) + '</h3><div class="achv-grid">' +
        ACHIEVEMENTS.filter(a => (a.group || '其他') === g).map(card).join('') + '</div></section>').join('') +
      '</div>' +
    '</div>';
}
window.addEventListener('keydown', e => { if (e.key === 'Escape' && isAchievementPanelOpen()) closeAchievementPanel(); });

// ---- T-Pad 裡的「成就」App（js/tpad.js 會把它畫在平板螢幕裡）----
// 左邊：達成進度圈＋分類；右邊：總覽（戰績、最近達成、快完成了）或該分類的成就列表
let achvAppTab = 'all';
const ACHV_SVG = {
  trophy: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.6 2.8H17.4V9.4A5.4 5.4 0 0 1 6.6 9.4Z"/><path d="M6.6 4.4H3.4V6.8A4 4 0 0 0 7.2 10.8L7.4 9A2.2 2.2 0 0 1 5.4 6.8V6.4H6.6ZM17.4 4.4H20.6V6.8A4 4 0 0 1 16.8 10.8L16.6 9A2.2 2.2 0 0 0 18.6 6.8V6.4H17.4Z"/><rect x="10.6" y="14.2" width="2.8" height="4"/><rect x="7" y="18" width="10" height="3.4" rx="1"/></svg>',
  lock: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M7.5 10V7.6A4.5 4.5 0 0 1 16.5 7.6V10H18A1.6 1.6 0 0 1 19.6 11.6V20.2A1.6 1.6 0 0 1 18 21.8H6A1.6 1.6 0 0 1 4.4 20.2V11.6A1.6 1.6 0 0 1 6 10ZM9.6 10H14.4V7.6A2.4 2.4 0 0 0 9.6 7.6ZM12 13.6A1.7 1.7 0 0 0 11.1 16.7V18.6H12.9V16.7A1.7 1.7 0 0 0 12 13.6Z"/></svg>',
};
function renderAchievementApp(el) {
  const st = achieveData.stats, un = achieveData.unlocked;
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const fmtDate = ts => { const d = new Date(ts); return d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate(); };
  const groups = [...new Set(ACHIEVEMENTS.map(a => a.group || '其他'))];
  const inGroup = g => ACHIEVEMENTS.filter(a => (a.group || '其他') === g);
  const gotN = list => list.filter(a => un[a.id]).length;
  const done = gotN(ACHIEVEMENTS), total = ACHIEVEMENTS.length;
  if (achvAppTab !== 'all' && !groups.includes(achvAppTab)) achvAppTab = 'all';
  const row = a => {
    const value = st[a.stat] || 0, got = !!un[a.id], k = Math.min(1, value / a.goal);
    return '<div class="aa-row' + (got ? ' got' : '') + '"><span class="aa-ico">' + (got ? ACHV_SVG.trophy : ACHV_SVG.lock) + '</span>' +
      '<div class="aa-txt"><b>' + esc(a.name) + '</b>' +
      (got ? '<small>' + fmtDate(un[a.id]) + ' 達成</small>' : '<i class="aa-bar"><u style="width:' + (k * 100).toFixed(1) + '%"></u></i>') + '</div>' +
      '<span class="aa-val">' + (got ? '✓' : Math.min(value, a.goal) + ' / ' + a.goal) + '</span></div>';
  };
  const side = '<nav class="aa-side"><div class="aa-ring" style="--p:' + (done / total).toFixed(3) + '"><div><b>' + done + '</b><small>/ ' + total + '</small></div></div><p class="aa-ring-cap">已達成</p>' +
    [['all', '總覽', ACHIEVEMENTS], ...groups.map(g => [g, g, inGroup(g)])].map(([key, label, list]) =>
      '<button type="button" class="aa-tab' + (key === achvAppTab ? ' on' : '') + '" data-achv-tab="' + esc(key) + '"><span>' + esc(label) + '</span><em>' + gotN(list) + '/' + list.length + '</em></button>').join('') + '</nav>';
  let main;
  if (achvAppTab === 'all') {
    const recent = ACHIEVEMENTS.filter(a => un[a.id]).sort((a, b) => un[b.id] - un[a.id]).slice(0, 3);
    const near = ACHIEVEMENTS.filter(a => !un[a.id]).sort((a, b) => (st[b.stat] || 0) / b.goal - (st[a.stat] || 0) / a.goal).slice(0, 3);
    main = '<h2 class="aa-title">總覽</h2><p class="aa-sub">Y102 應變編組的戰績紀錄</p>' +
      '<div class="aa-stats">' + ACHIEVE_STAT_LABELS.map(([k, label]) => '<span><b>' + (st[k] || 0) + '</b><small>' + label + '</small></span>').join('') + '</div>' +
      '<h3 class="aa-sec">最近達成</h3><div class="aa-list">' + (recent.length ? recent.map(row).join('') : '<p class="aa-empty">還沒有達成的成就，出去打一場吧！</p>') + '</div>' +
      (near.length ? '<h3 class="aa-sec">快完成了</h3><div class="aa-list">' + near.map(row).join('') + '</div>' : '');
  } else {
    const list = inGroup(achvAppTab);
    main = '<h2 class="aa-title">' + esc(achvAppTab) + '</h2><p class="aa-sub">已達成 ' + gotN(list) + ' / ' + list.length + '</p><div class="aa-list">' + list.map(row).join('') + '</div>';
  }
  el.innerHTML = '<div class="aa">' + side + '<main class="aa-main">' + main + '</main></div>';
  el.querySelector('.aa-side').addEventListener('click', e => {
    const b = e.target.closest('[data-achv-tab]'); if (!b || b.dataset.achvTab === achvAppTab) return;
    achvAppTab = b.dataset.achvTab; renderAchievementApp(el);
    if (typeof sfx === 'function') sfx('blip');
  });
}
