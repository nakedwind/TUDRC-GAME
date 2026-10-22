/* ===== T-Pad 裡的「任務」App（js/tpad.js 會把它畫在平板螢幕裡）=====
   ・左邊：目前任務小卡＋分類（主線／角色委託／回憶）。
   ・右邊：清單；點一項＝推進到那一項的詳細頁（左上「‹ 返回」回清單），像 iPad 的設定 App。
   ・T-Pad 只能「看」：出擊、承接委託、領取獎勵還是要到應變中心的作戰桌（js/missions.js、js/quests.js）。
   必須在 js/missions.js、js/quests.js 之後載入。
*/
let mappTab = 'main', mappSel = null;   // mappSel：正在看的那一項（null＝清單）
const MAPP_SVG = {
  check: '<path d="M4.5 12.5 9.6 17.6 19.5 6.8" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>',
  flag: '<rect x="5" y="2.5" width="2.2" height="19" rx="1"/><path d="M7.2 3.6H19L16.4 8 19 12.4H7.2Z"/>',
  lock: '<path fill-rule="evenodd" d="M7.5 10V7.6A4.5 4.5 0 0 1 16.5 7.6V10H18A1.6 1.6 0 0 1 19.6 11.6V20.2A1.6 1.6 0 0 1 18 21.8H6A1.6 1.6 0 0 1 4.4 20.2V11.6A1.6 1.6 0 0 1 6 10ZM9.6 10H14.4V7.6A2.4 2.4 0 0 0 9.6 7.6Z"/>',
  radar: '<path d="M12 3A9 9 0 1 0 21 12H18.6A6.6 6.6 0 1 1 12 5.4Z"/><path d="M12 7.6A4.4 4.4 0 1 0 16.4 12H14.1A2.1 2.1 0 1 1 12 9.9Z"/><path d="M12 12 19.4 4.6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  warn: '<path fill-rule="evenodd" d="M10.4 3.3A1.85 1.85 0 0 1 13.6 3.3L22 18.6A1.85 1.85 0 0 1 20.4 21.4H3.6A1.85 1.85 0 0 1 2 18.6ZM10.8 9V14.6H13.2V9ZM12 16.2A1.4 1.4 0 1 0 12 19 1.4 1.4 0 1 0 12 16.2Z"/>',
  key: '<circle cx="7.5" cy="12" r="4.6" fill="none" stroke="currentColor" stroke-width="2.6"/><path d="M11.8 10.7H21.5V13.3H19.6V16.4H17.2V13.3H11.8Z"/>',
};
const mappIco = (name, cls) => '<span class="ma-ico ' + cls + '"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' + MAPP_SVG[name] + '</svg></span>';
const mappEsc = t => String(t ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const MAPP_MAIN_ICON = { cleared: ['check', 'green'], available: ['flag', 'orange'], locked: ['lock', 'gray'], soon: ['radar', 'blue'] };
const MAPP_SIDE_CLS = { available: 'blue', active: 'orange', ready: 'green', done: 'gray' };

function renderMissionApp(el) {
  const mems = typeof memoryQuests === 'function' ? memoryQuests() : [];
  const quests = typeof SIDE_QUESTS !== 'undefined' ? SIDE_QUESTS : [];
  const ready = typeof readyCount === 'function' ? readyCount() : 0;
  const cleared = MISSIONS.filter(missionCleared).length;
  const hud = (typeof missionHudText === 'function' && missionHudText()) || (document.getElementById('missionText')?.textContent || '');
  const tabs = [['main', '主線', cleared + '/' + MISSIONS.length, ''], ['side', '角色委託', '', ready ? ready : ''], ['memory', '回憶', mems.length ? String(mems.length) : '', '']];
  const side = '<nav class="aa-side ma-side"><div class="ma-now"><small>目前任務</small><b>' + mappEsc(hud.replace(/^目前任務：/, '') || '—') + '</b></div>' +
    tabs.map(([k, label, count, badge]) => '<button type="button" class="aa-tab' + (k === mappTab ? ' on' : '') + '" data-mapp-tab="' + k + '"><span>' + label + '</span>' +
      (badge ? '<i class="ma-badge">' + badge + '</i>' : '<em>' + count + '</em>') + '</button>').join('') + '</nav>';
  let main;
  if (mappTab === 'main') main = mappSel ? mainDetail(missionById(mappSel)) : mainList(cleared);
  else if (mappTab === 'side') main = mappSel ? sideQuestDetail(questById(mappSel)) : sideQuestList(quests);
  else main = mappSel ? memoryDetail(mems.find(m => m.id === mappSel)) : memoryList(mems);
  el.innerHTML = '<div class="aa ma">' + side + '<main class="aa-main' + (mappSel ? ' ma-push' : '') + '">' + main + '</main></div>';
  el.querySelector('.ma').addEventListener('click', e => {
    const t = e.target.closest('[data-mapp-tab]'), row = e.target.closest('[data-mapp-sel]'), back = e.target.closest('.ma-back');
    if (t) { if (t.dataset.mappTab === mappTab && !mappSel) return; mappTab = t.dataset.mappTab; mappSel = null; }
    else if (row) mappSel = row.dataset.mappSel;
    else if (back) mappSel = null;
    else return;
    renderMissionApp(el);
    if (typeof sfx === 'function') sfx('blip');
  });
}
const mappRow = (id, icon, title, sub, right) => '<button type="button" class="ma-row" data-mapp-sel="' + mappEsc(id) + '">' + icon +
  '<span class="aa-txt"><b>' + title + '</b>' + (sub ? '<small>' + sub + '</small>' : '') + '</span><span class="ma-right">' + (right || '') + '</span><i class="ma-chev">›</i></button>';
const mappBack = label => '<button type="button" class="ma-back">‹ ' + label + '</button>';
const mappNote = text => '<p class="ma-note">' + text + '</p>';

// ---- 主線 ----
function mainList(cleared) {
  const next = nextMission();
  return '<h2 class="aa-title">主線</h2><p class="aa-sub">依序控制 Y 區的每一區</p>' +
    '<div class="ma-progress"><span>主線進度</span><b>' + cleared + ' / ' + MISSIONS.length + '</b><i class="aa-bar"><u style="width:' + (cleared / MISSIONS.length * 100).toFixed(1) + '%"></u></i></div>' +
    '<div class="aa-list">' + MISSIONS.map(m => {
      const s = missionStatus(m), [ic, cls] = m.boss && s !== 'cleared' ? ['warn', 'red'] : MAPP_MAIN_ICON[s];
      return mappRow(m.id, mappIco(ic, cls), mappEsc(m.name) + (next && next.id === m.id ? ' <em class="ma-pill orange">下一個</em>' : ''),
        (m.boss ? 'BOSS 反應・' : '') + STATUS_TEXT[s], '');
    }).join('') + '</div>';
}
function mainDetail(m) {
  if (!m) return mappBack('主線') + mappNote('找不到這個任務。');
  const s = missionStatus(m), [ic, cls] = m.boss && s !== 'cleared' ? ['warn', 'red'] : MAPP_MAIN_ICON[s];
  const before = m.after.map(missionById).filter(Boolean);
  const team = typeof getTeam === 'function' ? getTeam() : [];
  const faces = team.map(id => { const p = teamProfile(id); return '<span class="mission-face" data-char="' + id + '" title="' + mappEsc(p.name) + '"><img src="' + memberPortraitPath(p) + '" alt="' + mappEsc(p.name) + '"></span>'; }).join('');
  return mappBack('主線') +
    '<div class="ma-hero">' + mappIco(ic, cls + ' big') + '<div><em class="ma-pill ' + cls + '">' + (m.boss ? '⚠ BOSS 反應・' : '') + STATUS_TEXT[s] + '</em><h2 class="aa-title">' + mappEsc(m.name) + '</h2></div></div>' +
    '<div class="ma-card"><p>' + mappEsc(s === 'locked' ? '先控制前面的區域，才能前往這裡。' : m.desc) + '</p></div>' +
    (before.length ? '<h3 class="aa-sec">要先控制</h3><div class="aa-list">' + before.map(b => '<div class="ma-row static">' + mappIco(missionCleared(b) ? 'check' : 'lock', missionCleared(b) ? 'green' : 'gray') +
      '<span class="aa-txt"><b>' + mappEsc(b.name) + '</b><small>' + (missionCleared(b) ? '已控制' : '尚未控制') + '</small></span></div>').join('') + '</div>' : '') +
    '<h3 class="aa-sec">出勤人員 ' + team.length + ' 位</h3><div class="ma-card ma-faces">' + (faces || '<small>尚未編入（到基地的「出勤配置」編入）</small>') + '</div>' +
    mappNote(s === 'available' || s === 'cleared' ? '📍 出擊請到應變中心的作戰桌' : s === 'soon' ? '情報收集中，地圖還沒準備好。' : '');
}

// ---- 角色委託 ----
function sideQuestList(quests) {
  const order = { ready: 0, active: 1, available: 2, done: 3 };
  const list = [...quests].sort((a, b) => order[questStatus(a)] - order[questStatus(b)]);
  return '<h2 class="aa-title">角色委託</h2><p class="aa-sub">進行中 ' + activeCount() + ' / ' + SIDE_QUEST_RULES.maxActive + '・承接和領取獎勵要到作戰桌</p>' +
    (list.length ? '<div class="aa-list">' + list.map(q => {
      const s = questStatus(q), p = questState.active[q.id] ?? 0, face = charFace(q.giver);
      return mappRow(q.id, face ? '<span class="ma-face"><img src="' + face + '" alt=""></span>' : mappIco('flag', 'gray'), mappEsc(q.name), mappEsc(charName(q.giver)) + '的委託',
        '<em class="ma-pill ' + MAPP_SIDE_CLS[s] + '">' + (s === 'active' ? p + ' / ' + q.goal.count : STATUS_LABEL[s]) + '</em>');
    }).join('') + '</div>' : mappNote('目前沒有委託。'));
}
function sideQuestDetail(q) {
  if (!q) return mappBack('角色委託') + mappNote('找不到這個委託。');
  const s = questStatus(q), p = Math.min(q.goal.count, questState.active[q.id] ?? (s === 'done' ? q.goal.count : 0)), face = charFace(q.giver);
  const r = q.reward || {}, rewards = [
    r.crystals ? '◆ 異質碎片 ×' + r.crystals : '',
    ...Object.entries(r.items || {}).map(([id, n]) => { const it = itemById(id); return it ? '<img src="' + it.image + '" alt="">' + mappEsc(it.name) + ' ×' + n : ''; }),
    r.favor ? '💗 ' + mappEsc(charName(q.giver)) + '好感度 +' + r.favor : '',
  ].filter(Boolean);
  return mappBack('角色委託') +
    '<div class="ma-hero">' + (face ? '<span class="ma-face big"><img src="' + face + '" alt=""></span>' : '') + '<div><em class="ma-pill ' + MAPP_SIDE_CLS[s] + '">' + mappEsc(charName(q.giver)) + '的委託・' + STATUS_LABEL[s] + '</em><h2 class="aa-title">' + mappEsc(q.name) + '</h2></div></div>' +
    '<div class="ma-card ma-quote">「' + mappEsc(s === 'done' || s === 'ready' ? q.thanks || q.ask : q.ask) + '」</div>' +
    '<h3 class="aa-sec">目標</h3><div class="ma-card ma-goal"><span>' + mappEsc(q.goal.text || '目標') + '</span><b>' + p + ' / ' + q.goal.count + '</b><i class="aa-bar"><u style="width:' + (p / q.goal.count * 100).toFixed(1) + '%"></u></i></div>' +
    (rewards.length ? '<h3 class="aa-sec">獎勵</h3><div class="ma-card ma-rewards">' + rewards.map(x => '<em>' + x + '</em>').join('') + '</div>' : '') +
    mappNote(s === 'available' ? '📍 到作戰桌承接這個委託' : s === 'ready' ? '✔ 完成了！回作戰桌領取獎勵' : s === 'active' ? '出擊時會自動計算進度' : '已經完成這個委託');
}

// ---- 回憶 ----
function memoryList(mems) {
  return '<h2 class="aa-title">回憶</h2><p class="aa-sub">集滿回憶碎片就能拼成鑰匙</p>' +
    (mems.length ? '<div class="aa-list">' + mems.map(m => { const face = charFace(m.owner);
      return mappRow(m.id, face ? '<span class="ma-face"><img src="' + face + '" alt=""></span>' : mappIco('key', 'gray'), mappEsc(m.name), m.hasKey ? '鑰匙已拼好' : '碎片 ' + m.have + ' / ' + m.mk.need,
        m.hasKey ? '<em class="ma-pill green">🔑 鑰匙</em>' : ''); }).join('') + '</div>'
      : mappNote('拿到回憶碎片後，這裡會出現那個人的回憶。'));
}
function memoryDetail(mem) {
  if (!mem) return mappBack('回憶') + mappNote('找不到這段回憶。');
  const it = itemById(mem.mk.shard), key = itemById(mem.mk.key), face = charFace(mem.owner);
  return mappBack('回憶') +
    '<div class="ma-hero">' + (face ? '<span class="ma-face big"><img src="' + face + '" alt=""></span>' : '') + '<div><em class="ma-pill ' + (mem.hasKey ? 'green' : 'orange') + '">回憶</em><h2 class="aa-title">' + mappEsc(mem.name) + '</h2></div></div>' +
    '<div class="ma-card"><div class="side-shards">' + Array.from({ length: mem.mk.need }, (_, i) => '<img src="' + it.image + '" alt="" class="' + (i < mem.have ? 'got' : '') + '">').join('') + '</div>' +
    '<p>' + (mem.hasKey ? '「' + mappEsc(key.name) + '」已經拼好了。找到記憶之門，就能看到這段回憶。<br><small>（記憶之門尚未開放）</small>'
      : '集滿 ' + mem.mk.need + ' 片「' + mappEsc(it.name) + '」就能拼成鑰匙。目前 ' + mem.have + ' / ' + mem.mk.need + '。<br><small>回憶碎片可以從「今日想吃」委託拿到。</small>') + '</p></div>';
}
