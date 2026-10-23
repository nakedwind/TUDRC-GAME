// ============================================================
//  成就系統：累計各種戰績，達成時在右下角彈出通知
//  進度存在這台瀏覽器（localStorage），重開遊戲也會保留
// ============================================================

// 成就的內容（分類、名稱、條件、文字）都在 data/achievements.js（用「🏆 成就編輯器」編輯）；共用的設定在 js/achievement-config.js
// 自訂條件（stat: custom）還沒實作、遊戲不會算：先不顯示，也不算進「已達成 N / 總數」
const achieveSet = () => { const c = achieveCfg(); c.list = c.list.filter(a => a.stat !== ACHIEVE_CUSTOM); return c; };
const ACHIEVE_KEY = 'tudrc_achievements_v1';
const ACHIEVE_TOAST = { show: 4, gap: .35 };   // 通知停留秒數、連續解鎖時每則間隔

const achieveData = (() => {
  try {
    const d = JSON.parse(localStorage.getItem(ACHIEVE_KEY) || 'null');
    if (d && typeof d === 'object') return { stats: d.stats || {}, unlocked: d.unlocked || {}, sets: d.sets || {} };
  } catch (_) {}
  return { stats: {}, unlocked: {}, sets: {} };
})();
function saveAchievements() {
  try { localStorage.setItem(ACHIEVE_KEY, JSON.stringify(achieveData)); } catch (_) {}
}

// 一項數字目前是多少：kill:怪物 id＝怪物圖鑑的消滅次數（js/bestiary.js），其他＝這裡自己累計的
function achieveStatValue(stat) {
  stat = String(stat);
  if (stat.startsWith('kill:')) return (typeof bst !== 'undefined' && bst.kills && bst.kills[stat.slice(5)]) || 0;
  if (stat.startsWith('allWear:')) return achieveAllWear(stat.slice(8)) ? 1 : 0;
  if (ACHIEVE_ALL[stat]) return ACHIEVE_ALL[stat]() ? 1 : 0;
  return achieveData.stats[stat] || 0;
}
// 檢查有沒有新解鎖的成就（stat＝只看這一項，結尾是「:」＝這一類全部；不傳＝全部都看）
function checkAchievements(stat) {
  let changed = false;
  for (const a of achieveSet().list) {
    if ((stat && (stat.endsWith(':') ? !a.stat.startsWith(stat) : a.stat !== stat)) || achieveData.unlocked[a.id] || achieveStatValue(a.stat) < a.goal) continue;
    achieveData.unlocked[a.id] = Date.now(); changed = true;
    queueAchievementToast(a);
  }
  if (changed) saveAchievements();
}
// 累加一項數字，並檢查有沒有新解鎖的成就
function addStat(stat, n = 1) {
  achieveData.stats[stat] = (achieveData.stats[stat] || 0) + n;
  saveAchievements();
  checkAchievements(stat);
}

// 最大值類的數字（最久、最高分、一場最多）：比以前大才更新
function achieveMax(stat, value) {
  if (!(value > (achieveData.stats[stat] || 0))) return;
  achieveData.stats[stat] = value; saveAchievements(); checkAchievements(stat);
}
// 練習室（B1 訓練室）裡倒下不算
const achieveNotPractice = () => !(typeof practiceOn === 'function' && practiceOn());

// ---- 「全部都做過」類：記在 achieveData.sets，跟遊戲裡現有的清單比（之後新增房間、椅子、角色、商品，要全部做過才算）----
function achieveRemember(set, key, stat) {
  const list = achieveData.sets[set] || (achieveData.sets[set] = []);
  if (list.includes(key)) return;
  list.push(key); saveAchievements(); checkAchievements(stat);
}
const achieveHas = (set, keys) => { const got = new Set(achieveData.sets[set] || []); return keys.length > 0 && keys.every(k => got.has(k)); };
const achieveBaseMaps = () => (typeof BASE_MAPS !== 'undefined' ? BASE_MAPS : []);
// 「說到坐到」要坐過哪幾張地圖的椅子（地圖名稱）
const ACHIEVE_CHAIR_MAPS = ['2F應變中心', '1F餐廳', 'B1訓練室', 'B2射擊訓練室'];
// 座位編號：地圖 id:素材 id@格子（跟 js/game.js 的 mapSeats 一樣；床不算椅子）
function achieveAllChairKeys() {
  const out = new Set();
  for (const m of achieveBaseMaps().filter(m => ACHIEVE_CHAIR_MAPS.includes(String(m.name || '').trim()))) {
    const add = (id, c, r) => { if (typeof chairConfig === 'function' && chairConfig(id) && !/bed|床/i.test(id)) out.add(m.id + ':' + id + '@' + c + ',' + r); };
    for (const st of m.stamps || []) add(st.id, st.c, st.r);
    for (const layer of Object.values(m.layers || {})) for (const [k, id] of Object.entries(layer)) { const [c, r] = k.split(',').map(Number); add(id, c, r); }
  }
  return [...out];
}
// 可以說話的角色：data/characters.js 裡（溫特、搜救犬除外）有「找他說話」類台詞的人
function achieveTalkableIds() {
  if (typeof CHARACTERS === 'undefined' || typeof dialogueLines !== 'function') return [];
  return Object.keys(CHARACTERS).filter(id => CHARACTERS[id].kind !== 'player' && id !== 'ball' &&
    ['npc', 'firstTalk', 'talk', 'chat'].some(k => (dialogueLines(id, k) || []).length));
}
const ACHIEVE_ALL = {
  allRooms: () => achieveHas('rooms', achieveBaseMaps().map(m => m.id)),
  allChairs: () => achieveHas('chairs', achieveAllChairKeys()),
  allSnacks: () => achieveHas('snacks', (typeof SUPPLIES !== 'undefined' ? SUPPLIES : []).filter(i => i.kind === 'snack' || i.kind === 'drink').map(i => i.id)),
  talkedAll: () => achieveHas('talked', achieveTalkableIds()),
};
// 全員（衣櫃裡的每一個人）都戴著這件配件
function achieveAllWear(accId) {
  if (typeof wardrobePeople !== 'function' || typeof costumeState === 'undefined' || typeof ACC_BY_ID === 'undefined') return false;
  const acc = ACC_BY_ID[accId]; if (!acc) return false;
  const people = wardrobePeople();
  return people.length > 0 && people.every(p => (costumeState.equip[p] || {})[acc.slot] === accId);
}

// ---- 遊戲各處呼叫的地方（計算都寫在這裡，其他檔案只多一行呼叫）----
// 坐下、躺下（js/game.js 的 toggleSit）
function achieveOnSit(seat) {
  if (!seat || typeof MAP_SAFE === 'undefined' || !MAP_SAFE || !MAP) return;
  if (seat.bed) {
    if (/溫特寢室/.test(MAP.name || '')) addStat('ownBed');
    else if (/寢室|房間|住這裡/.test(MAP.name || '')) addStat('othersBeds');   // 別人的寢室（雷德哨兵寢室、阿瓦倫房間、塔住這裡、B3 管制寢室…）
    return;
  }
  if (seat.key) achieveRemember('chairs', MAP.id + ':' + seat.key, 'allChairs');
}
// 換地圖（js/game.js 的 enterPortal）：kind＝'stair' 樓梯、'elevator' 電梯
function achieveOnTravel(kind) {
  if (kind === 'stair') { addStat('stairFloors'); achieveData.stats.elevatorRun = 0; saveAchievements(); }
  else if (kind === 'elevator') { achieveData.stats.elevatorRun = (achieveData.stats.elevatorRun || 0) + 1; saveAchievements(); achieveMax('elevatorStreak', achieveData.stats.elevatorRun); }
}
// 花錢（商店結帳、蓋建築）：where＝'vending' 販賣機、'shop' 商店、'build' 建築
function achieveOnSpend(where, total, count = 0, itemIds = []) {
  if (!(total > 0)) return;
  addStat('moneySpent', total);
  if (where === 'vending') { addStat('vendItems', count); addStat('vendBuys'); addStat('vendSpent', total); }
  else if (where === 'shop') { addStat('shopItems', count); addStat('shopBuys'); addStat('shopSpent', total); }
  for (const id of itemIds) { const it = typeof supplyById === 'function' ? supplyById(id) : null; if (it && (it.kind === 'snack' || it.kind === 'drink')) achieveRemember('snacks', id, 'allSnacks'); }
  if (typeof MAP_SAFE !== 'undefined' && !MAP_SAFE && G && G.money <= 0) achieveMax('brokeInBattle', 1);
}
// 用補給（js/shop.js 的 applySupplyNow）：戰鬥中記這一場用了幾個
const achieveBattleRec = () => G.battle.achv || (G.battle.achv = { medkits: 0, almond: 0, baseHurt: false });
function achieveOnSupply(item) {
  if (!item || typeof MAP_SAFE === 'undefined' || MAP_SAFE || !G || !G.battle) return;
  const b = achieveBattleRec();
  if (item.use === 'hp') b.medkits++;
  else if (item.use === 'sp') { b.almond++; achieveMax('almondInBattle', b.almond); }
}
// 打贏（js/game.js 的 win）、徹底控制（js/core-clear.js 的 markFullControl）
function achieveOnBattleEnd(kind) {
  if (!G || !G.battle) return;
  const b = achieveBattleRec();
  if ((G.battle.time || 0) <= 600) achieveMax('fastWins', 1);
  if (kind === 'win' && !b.baseHurt) achieveMax('flawlessWins', 1);
  if (kind === 'control' && !b.medkits) achieveMax('controlNoMedkit', 1);
}

// ---- 每 0.5 秒看一次：坐多久、站多久、走多久、去過哪些房間、營地有沒有受傷 ----
const ACHIEVE_MOVE_GAP = 20;   // 「不間斷移動」：停下腳步不超過幾秒都還算連續
const achvRun = { at: performance.now(), sitKey: null, sitT: 0, idleT: 0, moveT: 0, gapT: 0, x: null, y: null };
setInterval(() => {
  const now = performance.now(), dt = Math.min(1, (now - achvRun.at) / 1000); achvRun.at = now;
  if (typeof G === 'undefined' || !G || !G.player || !G.running || G.over || document.hidden) return;
  if ((typeof paused !== 'undefined' && paused) || (typeof mapTransitioning !== 'undefined' && mapTransitioning)) return;
  const p = G.player, safe = typeof MAP_SAFE !== 'undefined' && MAP_SAFE;
  if (safe && MAP && MAP.id) achieveRemember('rooms', MAP.id, 'allRooms');
  if (!safe && G.battle && G.obstacles.some(o => o.isBase && o.maxhp && o.hp < o.maxhp)) achieveBattleRec().baseHurt = true;
  const seat = safe && p.sitting && !p.sitting.bed && p.sitting.key ? MAP.id + ':' + p.sitting.key : null;
  if (seat && seat === achvRun.sitKey) achvRun.sitT += dt; else { achvRun.sitKey = seat; achvRun.sitT = 0; }
  if (seat) achieveMax('longestSit', Math.floor(achvRun.sitT / 60));
  const moved = achvRun.x !== null && Math.hypot(p.x - achvRun.x, p.y - achvRun.y) > .5; achvRun.x = p.x; achvRun.y = p.y;
  if (moved) { achvRun.idleT = 0; achvRun.gapT = 0; achvRun.moveT += dt; }
  else { achvRun.idleT += dt; achvRun.gapT += dt; if (achvRun.gapT > ACHIEVE_MOVE_GAP) achvRun.moveT = 0; }
  achieveMax('longestIdle', Math.floor(achvRun.idleT / 60));
  achieveMax('longestMove', Math.floor(achvRun.moveT / 60));
}, 500);

// 怪物死亡時呼叫（js/combat-feel.js 的 onEnemyDeath，在怪物圖鑑記完消滅次數之後）
function trackKillAchievements(e) {
  if (!e || e.exploded || e.dummy) return;   // 自爆史萊姆自己炸掉、沙包不算
  if (e.type === 'slime') {
    addStat('slimeKills');
    if (e.variant === 'giant') addStat('giantKills');
    else if (e.variant === 'bomber') addStat('bomberKills');
    else if (e.variant === 'splitter') addStat('splitterKills');
    else if (e.variant === 'spitter') addStat('spitterKills');
  }
  if (e.type) checkAchievements('kill:' + (e.type === 'slime' ? (!e.variant || e.variant === 'normal' ? 'slime' : 'slime:' + e.variant) : e.type));   // 擊倒某一種怪物（怪物圖鑑的消滅次數）
}
// 成就編輯器裡新加的成就，條件已經達到的：遊戲開好後直接解鎖
window.addEventListener('load', () => setTimeout(() => checkAchievements(), 1500));

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
  item.innerHTML = '<span class="achievement-icon">🏆</span><div><small></small><b></b></div>';
  item.querySelector('small').textContent = achieveSet().texts.toast;
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
const achieveEsc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const achieveDate = ts => { const d = new Date(ts); return d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate(); };
// 隱藏成就（secret）達成前：名稱顯示 texts.secret、不顯示進度
const achieveShownName = (a, got, T) => (a.secret && !got ? T.secret : a.name);
const achieveShownDesc = (a, got) => (a.secret && !got) || !a.desc ? '' : a.desc;   // 成就說明：隱藏成就達成前不顯示
function renderAchievementPanel() {
  const { list, groups, board, texts: T } = achieveSet(), un = achieveData.unlocked, esc = achieveEsc;
  const done = list.filter(a => un[a.id]).length, total = list.length;
  const card = a => {
    const value = achieveStatValue(a.stat), got = !!un[a.id], k = Math.min(1, value / a.goal), hide = a.secret && !got;
    return '<div class="achv-card' + (got ? ' got' : '') + (hide ? ' secret' : '') + '">' +
      '<span class="achv-icon">' + (got ? '🏆' : '🔒') + '</span>' +
      '<div class="achv-body"><b>' + esc(achieveShownName(a, got, T)) + '</b>' + (achieveShownDesc(a, got) ? '<em class="achv-desc">' + esc(achieveShownDesc(a, got)) + '</em>' : '') +
      (got ? '<small>' + achieveDate(un[a.id]) + ' ' + esc(T.doneDate) + '</small>'
           : hide ? '' : '<i class="achv-bar"><u style="width:' + (k * 100).toFixed(1) + '%"></u></i><small>' + Math.min(value, a.goal) + ' / ' + a.goal + '</small>') +
      '</div></div>';
  };
  achievePanel.innerHTML =
    '<div class="achv-dialog" role="dialog" aria-modal="true" aria-label="' + esc(T.title) + '">' +
      '<header class="achv-head"><div><h2>🏆 ' + esc(T.title) + '</h2><p>' + esc(T.subtitle) + '</p></div>' +
        '<div class="achv-total"><span>' + esc(T.total) + ' <b>' + done + ' / ' + total + '</b></span><i class="achv-bar"><u style="width:' + (total ? done / total * 100 : 0).toFixed(1) + '%"></u></i></div>' +
        '<button class="achv-close" type="button" aria-label="關閉">×</button></header>' +
      '<div class="achv-stats">' + board.map(b =>
        '<span><small>' + esc(b.label) + '</small><b>' + achieveStatValue(b.stat) + '</b></span>').join('') + '</div>' +
      '<div class="achv-list">' + groups.filter(g => list.some(a => a.group === g)).map(g =>
        '<section><h3>' + esc(g) + '</h3><div class="achv-grid">' +
        list.filter(a => a.group === g).map(card).join('') + '</div></section>').join('') +
      '</div>' +
    '</div>';
}
window.addEventListener('keydown', e => { if (e.key === 'Escape' && isAchievementPanelOpen()) { e.preventDefault(); closeAchievementPanel(); } });   // preventDefault：這次 Esc 用掉了，不會再打開設定（js/save.js）

// ---- T-Pad 裡的「成就」App（js/tpad.js 會把它畫在平板螢幕裡）----
// 左邊：達成進度圈＋分類；右邊：總覽（戰績、最近達成、尚未完成）或該分類的成就列表（文字都在 data/achievements.js 的 texts）
let achvAppTab = 'all';
const ACHV_SVG = {
  trophy: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.6 2.8H17.4V9.4A5.4 5.4 0 0 1 6.6 9.4Z"/><path d="M6.6 4.4H3.4V6.8A4 4 0 0 0 7.2 10.8L7.4 9A2.2 2.2 0 0 1 5.4 6.8V6.4H6.6ZM17.4 4.4H20.6V6.8A4 4 0 0 1 16.8 10.8L16.6 9A2.2 2.2 0 0 0 18.6 6.8V6.4H17.4Z"/><rect x="10.6" y="14.2" width="2.8" height="4"/><rect x="7" y="18" width="10" height="3.4" rx="1"/></svg>',
  lock: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M7.5 10V7.6A4.5 4.5 0 0 1 16.5 7.6V10H18A1.6 1.6 0 0 1 19.6 11.6V20.2A1.6 1.6 0 0 1 18 21.8H6A1.6 1.6 0 0 1 4.4 20.2V11.6A1.6 1.6 0 0 1 6 10ZM9.6 10H14.4V7.6A2.4 2.4 0 0 0 9.6 7.6ZM12 13.6A1.7 1.7 0 0 0 11.1 16.7V18.6H12.9V16.7A1.7 1.7 0 0 0 12 13.6Z"/></svg>',
};
function renderAchievementApp(el) {
  const { list: ALL, groups: allGroups, board, texts: T, counts } = achieveSet(), un = achieveData.unlocked, esc = achieveEsc;
  const groups = allGroups.filter(g => ALL.some(a => a.group === g));   // 沒有成就的分類不顯示
  const inGroup = g => ALL.filter(a => a.group === g);
  const gotN = list => list.filter(a => un[a.id]).length;
  const done = gotN(ALL), total = ALL.length;
  if (achvAppTab !== 'all' && !groups.includes(achvAppTab)) achvAppTab = 'all';
  const row = a => {
    const value = achieveStatValue(a.stat), got = !!un[a.id], k = Math.min(1, value / a.goal), hide = a.secret && !got;
    return '<div class="aa-row' + (got ? ' got' : '') + (hide ? ' secret' : '') + '"><span class="aa-ico">' + (got ? ACHV_SVG.trophy : ACHV_SVG.lock) + '</span>' +
      '<div class="aa-txt"><b>' + esc(achieveShownName(a, got, T)) + '</b>' + (achieveShownDesc(a, got) ? '<em class="aa-desc">' + esc(achieveShownDesc(a, got)) + '</em>' : '') +
      (got ? '<small>' + achieveDate(un[a.id]) + ' ' + esc(T.doneDate) + '</small>' : hide ? '' : '<i class="aa-bar"><u style="width:' + (k * 100).toFixed(1) + '%"></u></i>') + '</div>' +
      '<span class="aa-val">' + (got ? '✓' : hide ? '' : Math.min(value, a.goal) + ' / ' + a.goal) + '</span></div>';
  };
  const side = '<nav class="aa-side"><div class="aa-ring" style="--p:' + (total ? done / total : 0).toFixed(3) + '"><div><b>' + done + '</b><small>/ ' + total + '</small></div></div><p class="aa-ring-cap">' + esc(T.total) + '</p>' +
    [['all', T.overview, ALL], ...groups.map(g => [g, g, inGroup(g)])].map(([key, label, list]) =>
      '<button type="button" class="aa-tab' + (key === achvAppTab ? ' on' : '') + '" data-achv-tab="' + esc(key) + '"><span>' + esc(label) + '</span><em>' + gotN(list) + '/' + list.length + '</em></button>').join('') + '</nav>';
  let main;
  if (achvAppTab === 'all') {
    const recent = ALL.filter(a => un[a.id]).sort((a, b) => un[b.id] - un[a.id]).slice(0, counts.recent);
    const near = ALL.filter(a => !un[a.id] && !a.secret).sort((a, b) => achieveStatValue(b.stat) / b.goal - achieveStatValue(a.stat) / a.goal).slice(0, counts.pending);   // 隱藏成就不列出來
    main = '<h2 class="aa-title">' + esc(T.overview) + '</h2><p class="aa-sub">' + esc(T.subtitle) + '</p>' +
      '<div class="aa-stats">' + board.map(b => '<span><b>' + achieveStatValue(b.stat) + '</b><small>' + esc(b.label) + '</small></span>').join('') + '</div>' +
      (counts.recent ? '<h3 class="aa-sec">' + esc(T.recent) + '</h3><div class="aa-list">' + (recent.length ? recent.map(row).join('') : '<p class="aa-empty">' + esc(T.empty) + '</p>') + '</div>' : '') +
      (near.length ? '<h3 class="aa-sec">' + esc(T.pending) + '</h3><div class="aa-list">' + near.map(row).join('') + '</div>' : '');
  } else {
    const list = inGroup(achvAppTab);
    main = '<h2 class="aa-title">' + esc(achvAppTab) + '</h2><p class="aa-sub">' + esc(T.total) + ' ' + gotN(list) + ' / ' + list.length + '</p><div class="aa-list">' + list.map(row).join('') + '</div>';
  }
  el.innerHTML = '<div class="aa">' + side + '<main class="aa-main">' + main + '</main></div>';
  el.querySelector('.aa-side').addEventListener('click', e => {
    const b = e.target.closest('[data-achv-tab]'); if (!b || b.dataset.achvTab === achvAppTab) return;
    achvAppTab = b.dataset.achvTab; renderAchievementApp(el);
    if (typeof sfx === 'function') sfx('blip');
  });
}
