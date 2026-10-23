// ============================================================
//  成就編輯器：編輯 data/achievements.js（分類、成就、累計戰績、畫面文字）
//  ・左邊選分類（或「全部成就」），右邊編輯那一類的成就；條件從遊戲會累計的數字裡選（js/achievement-config.js）
//  ・遊戲還不會算的條件：選「✏️ 自訂條件」用文字寫，之後請 Claude 讀 data/achievements.js 實作（實作前遊戲裡不顯示）
//  ・修改會自動暫存在這台瀏覽器（和專案檔自動合併，js/draft-sync.js）；按「💾 存到專案」或下載後才會套用到遊戲
//  ・成就的編號（id）是存玩家進度用的，建立後不會變：改名稱、條件、數量都不會讓已達成的成就消失
// ============================================================
const ACHV_DRAFT_KEY = 'tudrc_achievements_draft_v1';
const $a = id => document.getElementById(id);
const aClone = v => JSON.parse(JSON.stringify(v));
const aEsc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const ALL = '__all';

const fromFile = () => aClone(typeof ACHIEVEMENT_DATA !== 'undefined' ? ACHIEVEMENT_DATA : { groups: [], list: [], board: [], texts: {}, counts: {} });
let data = fromFile();
try {
  const saved = typeof DraftSync !== 'undefined' ? DraftSync.load(ACHV_DRAFT_KEY, fromFile(), { label: '成就' }) : JSON.parse(localStorage.getItem(ACHV_DRAFT_KEY) || 'null');   // 暫存和專案檔三方合併
  if (saved && Array.isArray(saved.list)) data = saved;
} catch (_) { /* 暫存壞掉就用檔案 */ }
normalize();
// 舊暫存留下的「自訂條件」副本：同名的成就已經實作成正式條件了 → 拿掉（不然存到專案時又會多出一份）
{ const fileById = new Map(fromFile().list.map(a => [a.id, a])); let fixed = 0;
  for (const a of data.list) { const f = fileById.get(a.id); if (a.stat === ACHIEVE_CUSTOM && f && f.stat && f.stat !== ACHIEVE_CUSTOM) { a.stat = f.stat; a.goal = f.goal; delete a.custom; fixed++; } }   // 已經實作好了：用專案檔的條件
  if (fixed) setTimeout(() => setStatus('已把瀏覽器暫存裡 ' + fixed + ' 個舊的自訂條件換成專案檔裡實作好的條件。'), 0);
  const done = new Set(data.list.filter(a => a.stat !== ACHIEVE_CUSTOM).map(a => a.name)); const before = data.list.length;
  data.list = data.list.filter(a => !(a.stat === ACHIEVE_CUSTOM && done.has(a.name)));
  if (data.list.length < before) setTimeout(() => setStatus('已拿掉瀏覽器暫存裡 ' + (before - data.list.length) + ' 個舊的自訂條件（同名的成就已經實作好了）。'), 0); }
let selected = ALL;

// 欄位補齊（舊資料、手改過的檔案也能開）：normalized() 回傳整理好的新副本（匯出用，不動正在編輯的 data）；normalize() 只在載入、重新載入時用
function normalize() { data = normalized(); }
function normalized(d = data) {
  const c = achieveCfg(d);
  return { groups: c.groups, list: c.list.map(a => { const o = { id: a.id, group: a.group, name: a.name, stat: a.stat, goal: a.goal }; if (a.secret) o.secret = true; if (a.desc) o.desc = a.desc; if (a.note) o.note = a.note; return o; }),
           board: c.board, texts: c.texts, counts: c.counts };
}

// ---- 條件（數字）清單 ----
const STATS = achieveStatList();
function statOptions(cur, withCustom = false) {
  const groups = [...new Set(STATS.map(s => s.group))];
  let html = (withCustom ? '<option value="' + ACHIEVE_CUSTOM + '"' + (cur === ACHIEVE_CUSTOM ? ' selected' : '') + '>✏️ 自訂條件（自己用文字寫，請 Claude 實作）</option>' : '') + groups.map(g => '<optgroup label="' + aEsc(g) + '">' + STATS.filter(s => s.group === g).map(s =>
    '<option value="' + aEsc(s.id) + '"' + (s.id === cur ? ' selected' : '') + '>' + aEsc(s.name) + '</option>').join('') + '</optgroup>').join('');
  if (cur && !STATS.some(s => s.id === cur) && !(withCustom && cur === ACHIEVE_CUSTOM)) html = '<option value="' + aEsc(cur) + '" selected>⚠ 遊戲沒有這個數字：' + aEsc(cur) + '</option>' + html;
  return html;
}
const groupOptions = cur => data.groups.map(g => '<option' + (g === cur ? ' selected' : '') + '>' + aEsc(g) + '</option>').join('');

// ---- 新的成就編號：條件＋數量，重複就加 _2、_3… ----
// 還沒存進專案檔的新成就（遊戲裡不會有它的進度）：改條件、數量時編號跟著改；檔案裡已經有的成就編號不會變
const FILE_IDS = new Set(fromFile().list.map(a => a.id));
function newId(stat, goal, self) {
  const base = String(stat || 'achv').replace(/^kill:/, 'kill_').replace(/[^\w-]+/g, '_') + '_' + goal;
  let id = base, n = 2;
  while (data.list.some(a => a !== self && a.id === id)) id = base + '_' + n++;
  return id;
}
function renewId(a) { if (!FILE_IDS.has(a.id)) a.id = newId(a.stat, a.goal, a); }

// ---- 左邊：分類 ----
function renderGroups() {
  const box = $a('groupList'); box.innerHTML = '';
  const item = (key, label, n, cls = '') => {
    const b = document.createElement('button'); b.type = 'button';
    b.className = 'group-item' + (key === selected ? ' selected' : '') + cls;
    b.innerHTML = '<span>' + aEsc(label) + '</span><em class="count">' + n + '</em>';
    b.addEventListener('click', () => { selected = key; renderAll(); });
    box.appendChild(b);
  };
  const q = query();   // 搜尋中：數字＝找到幾個，沒找到的分類變暗
  const count = list => q ? list.filter(matches).length : list.length;
  item(ALL, '全部成就', count(data.list), ' all');
  for (const g of data.groups) { const n = count(data.list.filter(a => a.group === g)); item(g, g, n, q && !n ? ' dim' : ''); }
  $a('total').textContent = '共 ' + data.list.length + ' 個';
}
$a('addGroup').addEventListener('click', () => {
  let name = '新分類', n = 2; while (data.groups.includes(name)) name = '新分類 ' + n++;
  data.groups.push(name); selected = name; changed(); renderAll();
  setTimeout(() => { const i = $a('groupName'); if (i) { i.focus(); i.select(); } });
});

// ---- 搜尋：名稱、分類、條件、自訂條件的文字、編號都找得到 ----
const query = () => $a('achvSearch').value.trim().toLowerCase();
const matches = a => { const q = query(); return !q || [a.name, a.group, a.id, a.desc || '', a.note || '', achieveStatName(a.stat)].some(t => String(t).toLowerCase().includes(q)); };
$a('achvSearch').addEventListener('input', () => { renderGroups(); renderMain(); });
$a('achvSearch').addEventListener('keydown', e => { if (e.key === 'Escape' && e.target.value) { e.preventDefault(); e.target.value = ''; renderGroups(); renderMain(); } });
function renderSearch() {
  const head = $a('groupHead'), box = $a('achvList'), q = $a('achvSearch').value.trim();
  const hits = data.list.filter(matches), groups = data.groups.filter(g => hits.some(a => a.group === g));
  head.innerHTML = '<h2>搜尋「' + aEsc(q) + '」：找到 ' + hits.length + ' 個</h2>' +
    '<p>' + (hits.length ? '分在 ' + groups.map(g => '「' + aEsc(g) + '」').join('、') + '。點分類名稱可以跳到那個分類。' : '沒有符合的成就。可以搜名稱、分類、條件、自訂條件的文字或編號。') + '</p>' +
    '<div class="head-actions"><button type="button" class="small" id="clearSearch">清除搜尋</button></div>';
  $a('clearSearch').addEventListener('click', () => { $a('achvSearch').value = ''; renderAll(); });
  box.innerHTML = '';
  for (const g of groups) {
    const all = data.list.filter(a => a.group === g);
    const t = document.createElement('button'); t.type = 'button'; t.className = 'group-title jump'; t.textContent = g + '（找到 ' + all.filter(matches).length + ' / ' + all.length + '）→';
    t.title = '跳到「' + g + '」這個分類'; t.addEventListener('click', () => { selected = g; $a('achvSearch').value = ''; renderAll(); });
    box.appendChild(t);
    all.forEach((a, i) => { if (matches(a)) box.appendChild(achvCard(a, all[i - 1], all[i + 1])); });
  }
}

// ---- 右邊：選到的分類的成就 ----
function renderMain() {
  if (query()) { renderSearch(); return; }
  const head = $a('groupHead'); head.innerHTML = '';
  if (selected === ALL) {
    head.innerHTML = '<h2>全部成就</h2><p>照分類排列；要改分類名稱、順序，請在左邊點那個分類。</p>';
  } else {
    const gi = data.groups.indexOf(selected);
    head.innerHTML = '<label class="field grow"><span>分類名稱</span><input id="groupName" type="text"></label>' +
      '<div class="head-actions"><button type="button" class="small" id="groupUp" title="這個分類往前排">↑ 往前</button>' +
      '<button type="button" class="small" id="groupDown" title="這個分類往後排">↓ 往後</button>' +
      '<button type="button" class="small danger" id="groupDel">刪除分類</button></div>';
    const input = $a('groupName'); input.value = selected;
    input.addEventListener('change', () => {
      const to = input.value.trim();
      if (!to || to === selected) { input.value = selected; return; }
      if (data.groups.includes(to)) { setStatus('已經有「' + to + '」這個分類了。', true); input.value = selected; return; }
      data.groups[gi] = to; for (const a of data.list) if (a.group === selected) a.group = to;
      selected = to; changed(); renderAll();
    });
    $a('groupUp').disabled = gi <= 0; $a('groupDown').disabled = gi >= data.groups.length - 1;
    $a('groupUp').addEventListener('click', () => { [data.groups[gi - 1], data.groups[gi]] = [data.groups[gi], data.groups[gi - 1]]; changed(); renderAll(); });
    $a('groupDown').addEventListener('click', () => { [data.groups[gi + 1], data.groups[gi]] = [data.groups[gi], data.groups[gi + 1]]; changed(); renderAll(); });
    $a('groupDel').addEventListener('click', () => {
      const n = data.list.filter(a => a.group === selected).length;
      // 防呆：一定要確認；分類裡有成就的話，說明會一起刪掉
      if (!confirm('確定刪除此分類？\n\n「' + selected + '」' + (n ? '裡面的 ' + n + ' 個成就會一起刪除（玩家已經達成的紀錄會留著，但遊戲不會再顯示這些成就）。' : '裡面沒有成就。'))) return;
      data.list = data.list.filter(a => a.group !== selected); data.groups.splice(gi, 1);
      selected = ALL; changed(); renderAll();
    });
  }
  const box = $a('achvList'); box.innerHTML = '';
  const groups = selected === ALL ? data.groups : [selected];
  for (const g of groups) {
    const list = data.list.filter(a => a.group === g);
    if (selected === ALL) { const t = document.createElement('div'); t.className = 'group-title'; t.textContent = g + '（' + list.length + '）'; box.appendChild(t); }
    if (!list.length) { const e = document.createElement('p'); e.className = 'empty'; e.textContent = '這個分類還沒有成就。'; box.appendChild(e); }
    list.forEach((a, i) => box.appendChild(achvCard(a, list[i - 1], list[i + 1])));
    const add = document.createElement('button'); add.type = 'button'; add.className = 'small add'; add.textContent = '＋ 新增成就到「' + g + '」';
    add.addEventListener('click', () => addAchievement(g));
    box.appendChild(add);
  }
}
function addAchievement(group, from) {
  const stat = from ? from.stat : (STATS[0] && STATS[0].id) || 'slimeKills', goal = from ? from.goal : 10;
  const a = { id: newId(stat, goal), group, name: from ? from.name + '（複製）' : '', stat, goal };
  if (from && from.secret) a.secret = true;
  const at = from ? data.list.indexOf(from) + 1 : (() => { let k = -1; data.list.forEach((x, i) => { if (x.group === group) k = i; }); return k < 0 ? data.list.length : k + 1; })();
  data.list.splice(at, 0, a); changed(); renderAll();
  setTimeout(() => document.querySelector('[data-id="' + CSS.escape(a.id) + '"] .name-input')?.focus());
}
function achvCard(a, prev, next) {
  const card = document.createElement('div'); card.className = 'achv' + (a.secret ? ' secret' : '') + (a.stat === ACHIEVE_CUSTOM ? ' custom' : ''); card.dataset.id = a.id;
  card.innerHTML =
    '<div class="achv-row">' +
      '<span class="trophy">' + (a.secret ? '❔' : '🏆') + '</span>' +
      '<input class="name-input" type="text" placeholder="成就名稱（例如：討伐 10 隻史萊姆）" aria-label="成就名稱">' +
      '<button type="button" class="icon" data-act="up" title="往上移"' + (prev ? '' : ' disabled') + '>↑</button>' +
      '<button type="button" class="icon" data-act="down" title="往下移"' + (next ? '' : ' disabled') + '>↓</button>' +
      '<button type="button" class="icon" data-act="copy" title="複製一個">⧉</button>' +
      '<button type="button" class="icon del" data-act="del" title="刪除這個成就">✕</button>' +
    '</div>' +
    '<div class="achv-row desc-row"><label class="field grow"><span>成就說明（玩家在成就畫面看得到，達成條件寫在這裡）</span>' +
      '<input class="desc-input" type="text" placeholder="例如：溫特第一次躺自己的床"></label></div>' +
    '<div class="achv-row sub">' +
      '<label class="field grow"><span>遊戲怎麼算（只有編輯器看得到）</span><select class="stat-input">' + statOptions(a.stat, true) + '</select></label>' +
      '<label class="field goal"><span>達到多少</span><input class="goal-input" type="number" min="1" step="1"></label>' +
      '<label class="field group"><span>分類</span><select class="group-input">' + groupOptions(a.group) + '</select></label>' +
      '<label class="check" title="達成前，名稱顯示成「' + aEsc(data.texts.secret) + '」、也不顯示進度"><input class="secret-input" type="checkbox"' + (a.secret ? ' checked' : '') + '> 隱藏成就</label>' +
    '</div>' +
    '<div class="achv-row note-row"><label class="field grow"><span>算法補充（只有編輯器看得到，可以不填）：玩家不需要知道的細節寫這裡</span>' +
      '<textarea class="note-input" rows="2" placeholder="例如：只算在戰鬥地圖；練習室不算；同一隻怪物重複算"></textarea></label></div>' +
    (a.stat === ACHIEVE_CUSTOM ? '<p class="custom-box">⏳ 自訂條件：Claude 會照上面的「成就說明」和「算法補充」寫程式（請寫清楚誰、做了什麼、怎樣才算一次）。存到專案後，跟 Claude 說「幫我實作成就的自訂條件」；實作前遊戲裡不會顯示這個成就。</p>' : '') +
    '<small class="id">編號 ' + aEsc(a.id) + (FILE_IDS.has(a.id) ? '（存玩家進度用，不會變）' : '（新成就：存到專案後就固定下來）') + '</small>';
  const q = s => card.querySelector(s);
  q('.name-input').value = a.name;
  q('.goal-input').value = a.goal;
  if (!a.name.trim()) q('.name-input').classList.add('warn');
  q('.name-input').addEventListener('input', e => { a.name = e.target.value; e.target.classList.toggle('warn', !a.name.trim()); changed(false); });
  const idLabel = () => { const el = q('.id'); el.textContent = '編號 ' + a.id + (FILE_IDS.has(a.id) ? '（存玩家進度用，不會變）' : '（新成就：存到專案後就固定下來）'); card.dataset.id = a.id; };
  q('.stat-input').addEventListener('change', e => {
    const wasCustom = a.stat === ACHIEVE_CUSTOM; a.stat = e.target.value; renewId(a);
    if (wasCustom !== (a.stat === ACHIEVE_CUSTOM)) { changed(); renderAll(); return; }   // 自訂條件的提示要出現／消失
    idLabel(); changed();
  });
  const ni = q('.note-input'); ni.value = a.note || '';
  ni.addEventListener('input', () => { if (ni.value) a.note = ni.value; else delete a.note; changed(false); });
  const di = q('.desc-input'), descWarn = () => di.classList.toggle('warn', a.stat === ACHIEVE_CUSTOM && !String(a.desc || '').trim());
  di.value = a.desc || ''; descWarn();
  di.addEventListener('input', () => { if (di.value) a.desc = di.value; else delete a.desc; descWarn(); changed(false); });
  q('.goal-input').addEventListener('change', e => { const v = Math.floor(Number(e.target.value)); if (!(v >= 1)) { e.target.value = a.goal; setStatus('數量要是 1 以上的整數。', true); return; } a.goal = v; renewId(a); idLabel(); changed(); });
  q('.group-input').addEventListener('change', e => { a.group = e.target.value; changed(); renderAll(); });
  q('.secret-input').addEventListener('change', e => { if (e.target.checked) a.secret = true; else delete a.secret; changed(); renderAll(); });
  card.addEventListener('click', e => {
    const act = e.target.closest('[data-act]')?.dataset.act; if (!act) return;
    const i = data.list.indexOf(a);
    const swap = other => { const j = data.list.indexOf(other); [data.list[i], data.list[j]] = [data.list[j], data.list[i]]; changed(); renderAll(); };
    if (act === 'up' && prev) swap(prev);
    else if (act === 'down' && next) swap(next);
    else if (act === 'copy') addAchievement(a.group, a);
    else if (act === 'del' && confirm('刪除「' + (a.name || '（沒有名稱）') + '」？\n（玩家已經達成的紀錄會留著，但遊戲不會再顯示這個成就）')) { data.list.splice(i, 1); changed(); renderAll(); }
  });
  return card;
}

// ---- 總覽上方的「累計戰績」 ----
function renderBoard() {
  const box = $a('boardList'); box.innerHTML = '';
  if (!data.board.length) box.innerHTML = '<p class="empty">還沒有要顯示的數字。</p>';
  data.board.forEach((b, i) => {
    const row = document.createElement('div'); row.className = 'board-row';
    row.innerHTML = '<span class="num">' + (i + 1) + '.</span>' +
      '<label class="field grow"><span>數字</span><select>' + statOptions(b.stat) + '</select></label>' +
      '<label class="field grow"><span>顯示的名稱</span><input type="text"></label>' +
      '<button type="button" class="icon" data-act="up" title="往前"' + (i ? '' : ' disabled') + '>↑</button>' +
      '<button type="button" class="icon" data-act="down" title="往後"' + (i < data.board.length - 1 ? '' : ' disabled') + '>↓</button>' +
      '<button type="button" class="icon del" data-act="del" title="不顯示這個數字">✕</button>';
    const input = row.querySelector('input'); input.value = b.label;
    row.querySelector('select').addEventListener('change', e => { b.stat = e.target.value; changed(); });
    input.addEventListener('input', () => { b.label = input.value; changed(false); });
    row.addEventListener('click', e => {
      const act = e.target.closest('[data-act]')?.dataset.act; if (!act) return;
      if (act === 'up') [data.board[i - 1], data.board[i]] = [data.board[i], data.board[i - 1]];
      else if (act === 'down') [data.board[i + 1], data.board[i]] = [data.board[i], data.board[i + 1]];
      else if (act === 'del') data.board.splice(i, 1);
      changed(); renderBoard();
    });
    box.appendChild(row);
  });
}
$a('addBoard').addEventListener('click', () => {
  const used = new Set(data.board.map(b => b.stat)), s = STATS.find(x => !used.has(x.id)) || STATS[0];
  data.board.push({ stat: s.id, label: s.name.replace(/（.*）/, '') }); changed(); renderBoard();
});

// ---- 畫面文字、數量 ----
function renderTexts() {
  const box = $a('textList'); box.innerHTML = '';
  for (const key of Object.keys(ACHIEVE_TEXT_DEFAULT)) {
    const l = document.createElement('label'); l.className = 'field';
    l.innerHTML = '<span>' + aEsc(ACHIEVE_TEXT_LABELS[key] || key) + '</span><input type="text">';
    const i = l.querySelector('input'); i.value = data.texts[key] ?? ''; i.placeholder = ACHIEVE_TEXT_DEFAULT[key];
    i.addEventListener('input', () => { data.texts[key] = i.value; changed(false); });
    box.appendChild(l);
  }
  for (const [key, label] of [['recent', '總覽：「最近達成」列幾個'], ['pending', '總覽：「尚未完成」列幾個']]) {
    const l = document.createElement('label'); l.className = 'field';
    l.innerHTML = '<span>' + label + '</span><input type="number" min="0" step="1">';
    const i = l.querySelector('input'); i.value = data.counts[key];
    i.addEventListener('change', () => { const v = Math.floor(Number(i.value)); if (!(v >= 0)) { i.value = data.counts[key]; return; } data.counts[key] = v; changed(false); });
    box.appendChild(l);
  }
}

// ---- 還沒存到專案的項目：跟專案檔（按「💾 存到專案」之後＝剛存的那一版）比，每個成就、分類清單、累計戰績、畫面文字各算一項 ----
let savedData = normalized(fromFile());
function markSaved() { savedData = normalized(); renderChecks(); }   // 成就編輯器.html 的 ProjectSave 存好後呼叫
function unsavedCount() {
  const cur = normalized(), key = o => JSON.stringify(o);
  const before = new Map(savedData.list.map(a => [a.id, key(a)])), now = new Map(cur.list.map(a => [a.id, key(a)]));
  let n = 0;
  for (const [id, s] of now) if (before.get(id) !== s) n++;   // 新增、修改
  for (const id of before.keys()) if (!now.has(id)) n++;      // 刪除
  const sameIds = cur.list.length === savedData.list.length && cur.list.every(a => before.has(a.id));
  if (sameIds && key(cur.list.map(a => a.id)) !== key(savedData.list.map(a => a.id))) n++;   // 只有順序變了
  for (const k of ['groups', 'board', 'texts', 'counts']) if (key(cur[k]) !== key(savedData[k])) n++;
  return n;
}
// ---- 檢查：還沒存、還沒實作、沒有名稱、條件不存在 ----
function renderChecks() {
  const issues = [];
  const unsaved = unsavedCount(), custom = data.list.filter(a => a.stat === ACHIEVE_CUSTOM);
  if (unsaved || custom.length) issues.push('目前有 ' + [unsaved ? unsaved + ' 個項目尚未儲存到專案' : '', custom.length ? custom.length + ' 個項目尚未實作（自訂條件；遊戲裡先不顯示，存到專案後跟 Claude 說「幫我實作成就的自訂條件」）' : ''].filter(Boolean).join('、'));
  const noName = data.list.filter(a => !a.name.trim()).length;
  if (noName) issues.push(noName + ' 個成就沒有名稱');
  const noText = custom.filter(a => !String(a.desc || '').trim() && !String(a.note || '').trim()).length;
  if (noText) issues.push(noText + ' 個自訂條件還沒寫成就說明（Claude 要照說明實作）');
  const noDesc = data.list.filter(a => a.stat !== ACHIEVE_CUSTOM && !String(a.desc || '').trim()).length;
  if (noDesc) issues.push(noDesc + ' 個成就沒有成就說明（玩家只看得到名稱）');
  const bad = data.list.filter(a => a.stat !== ACHIEVE_CUSTOM && !STATS.some(s => s.id === a.stat));
  if (bad.length) issues.push(bad.length + ' 個成就的條件遊戲不會累計（' + bad.map(a => a.name || a.id).join('、') + '）');
  $a('checks').innerHTML = issues.length ? '⚠ ' + issues.map(aEsc).join('；') : '';
}

function renderAll() {
  if (selected !== ALL && !data.groups.includes(selected)) selected = ALL;   // 分類被改名、刪掉了
  renderGroups(); renderMain(); renderBoard(); renderTexts(); renderChecks();
}

// ---- 存檔、匯出 ----
let saveTimer = 0;
function changed(rerender = true) {
  clearTimeout(saveTimer); saveTimer = setTimeout(saveDraft, 300);
  if (rerender) { renderGroups(); renderChecks(); } else { clearTimeout(changed.t); changed.t = setTimeout(() => { renderGroups(); renderChecks(); }, 400); }
}
function saveDraft() {
  try { localStorage.setItem(ACHV_DRAFT_KEY, JSON.stringify(data)); setStatus('已自動儲存在這台瀏覽器。按「💾 存到專案」或下載 achievements.js 取代檔案後，遊戲才會套用。'); }
  catch (_) { setStatus('瀏覽器暫存失敗；請先下載檔案。', true); }
  if ($a('exportOut').classList.contains('visible')) $a('exportOut').value = exportSource();
}
function setStatus(msg, error = false) { const s = $a('status'); s.textContent = msg; s.style.color = error ? '#ffb2ad' : '#8ce0be'; }
// 匯出：一個成就一行，檔案比較好看、好比對
function exportSource() {
  const data = normalized();   // 畫面上的卡片連著正在編輯的 data，不能換掉
  const one = o => '{ ' + Object.entries(o).map(([k, v]) => JSON.stringify(k) + ': ' + JSON.stringify(v)).join(', ') + ' }';
  const block = obj => JSON.stringify(obj, null, 2).replace(/\n/g, '\n  ');
  return '/* ===== 成就（由「🏆 成就編輯器」匯出，整段覆蓋即可）=====\n' +
    '   ・groups：分類（照這個順序顯示）\n' +
    '   ・list：每一個成就（照這個順序顯示）：\n' +
    '     id 編號（存進度用，不要改）、group 分類、name 名稱、desc 成就說明（玩家看得到的達成條件）、note 算法補充（只有編輯器看得到）、stat 累計哪一項數字、goal 達到多少解鎖、secret 隱藏成就（達成前顯示 texts.secret）\n' +
    '     stat 可以用的數字：js/achievement-config.js 的 ACHIEVE_STATS；kill:怪物 id＝擊倒那種怪物的次數（跟怪物圖鑑的消滅次數同一份）\n' +
    '     stat 是 "custom"＝自訂條件：等 Claude 照 desc 寫成程式、換成正式的 stat（還沒實作前，遊戲裡不顯示這個成就）\n' +
    '   ・board：總覽上方「累計戰績」顯示哪些數字（stat）、叫什麼（label）\n' +
    '   ・texts：成就畫面上的文字；counts：總覽的「最近達成」「尚未完成」各列幾個 */\n' +
    'const ACHIEVEMENT_DATA = {\n' +
    '  "groups": ' + block(data.groups) + ',\n' +
    '  "list": [\n' + data.list.map(a => '    ' + one(a)).join(',\n') + '\n  ],\n' +
    '  "board": [\n' + data.board.map(b => '    ' + one(b)).join(',\n') + '\n  ],\n' +
    '  "texts": ' + block(data.texts) + ',\n' +
    '  "counts": ' + block(data.counts) + '\n' +
    '};\n';
}
$a('download').addEventListener('click', () => {
  const blob = new Blob([exportSource()], { type: 'text/javascript;charset=utf-8' });
  const url = URL.createObjectURL(blob), link = document.createElement('a');
  link.href = url; link.download = 'achievements.js'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  setStatus('已下載 achievements.js。請取代遊戲的 data/achievements.js，再重新整理遊戲。');
});
$a('showExport').addEventListener('click', () => {
  const area = $a('exportOut'); area.classList.toggle('visible');
  if (area.classList.contains('visible')) area.value = exportSource();
});
$a('reset').addEventListener('click', () => {
  if (!confirm('確定丟棄這台瀏覽器裡的成就暫存，從目前的 data/achievements.js 重新載入嗎？')) return;
  data = fromFile(); normalize(); localStorage.removeItem(ACHV_DRAFT_KEY);
  if (typeof DraftSync !== 'undefined') DraftSync.forget(ACHV_DRAFT_KEY);
  selected = ALL; renderAll(); setStatus('已從目前的成就檔重新載入。');
});

renderAll();
