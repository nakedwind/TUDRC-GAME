/* ===== 出勤隊伍 =====
   在基地選最多 TEAM_SIZE 位隊員，任務時只登場這些人（spawnSentries 讀 getTeam()）。
   名單／人數在 data/balance.js：ROSTER / TEAM_SIZE / DEFAULT_TEAM。
   隊伍存在瀏覽器 localStorage，跨場景與重開都保留。
*/
const TEAM_STORE = 'tudrc_team_v1';

function getTeam() {
  let t = null;
  try { t = JSON.parse(localStorage.getItem(TEAM_STORE)); } catch (e) {}
  if (!Array.isArray(t)) t = (typeof DEFAULT_TEAM !== 'undefined') ? DEFAULT_TEAM.slice() : [];
  const roster = (typeof ROSTER !== 'undefined') ? ROSTER : [];
  t = t.filter(id => roster.includes(id) && (typeof TYPES !== 'undefined') && TYPES[id]);   // 過濾不存在的
  const cap = (typeof TEAM_SIZE !== 'undefined') ? TEAM_SIZE : 4;
  return t.slice(0, cap);
}
function setTeam(list) { try { localStorage.setItem(TEAM_STORE, JSON.stringify(list)); } catch (e) {} }

// ---- 編隊面板（DOM 由程式建立，不用改 HTML/CSS）----
let teamBtn = null, teamPanel = null, squadBtn = null, squadPanel = null;
function ensureTeamUI() {
  const wrap = document.getElementById('wrap'); if (!wrap) return;
  if (!squadBtn) {
    squadBtn = document.createElement('button');
    squadBtn.id = 'squadStatusButton';
    squadBtn.textContent = '👥 隊員資料';
    squadBtn.addEventListener('click', () => isSquadPanelOpen() ? closeSquadPanel() : openSquadPanel());
    wrap.appendChild(squadBtn);
  }
  if (!teamBtn) {
    teamBtn = document.createElement('button');
    teamBtn.textContent = '🧑‍🤝‍🧑 出勤編隊';
    teamBtn.id = 'teamEditButton';
    teamBtn.className = 'hidden';
    teamBtn.addEventListener('click', openTeamPanel);
    wrap.appendChild(teamBtn);
  }
  if (!teamPanel) {
    teamPanel = document.createElement('div');
    teamPanel.id = 'teamEditPanel';
    teamPanel.className = 'hidden';
    teamPanel.style.cssText = 'position:absolute;inset:0;z-index:40;display:flex;align-items:center;justify-content:center;background:rgba(6,10,16,.72)';
    teamPanel.addEventListener('click', e => { if (e.target === teamPanel) closeTeamPanel(); });   // 點外面關閉
    wrap.appendChild(teamPanel);
  }
  if (!squadPanel) {
    squadPanel = document.createElement('aside');
    squadPanel.id = 'squadStatusPanel';
    squadPanel.className = 'hidden';
    squadPanel.setAttribute('aria-label', '小隊隊員資料');
    wrap.appendChild(squadPanel);
  }
}
function openTeamPanel() { ensureTeamUI(); closeSquadPanel(); renderTeamPanel(); teamPanel.classList.remove('hidden'); if (typeof sfx === 'function') sfx('menu'); }
function closeTeamPanel() { if (teamPanel) teamPanel.classList.add('hidden'); }
function isTeamPanelOpen() { return teamPanel && !teamPanel.classList.contains('hidden'); }

// ---- 隊員資料：安全區看完整名冊，戰鬥區只看實際出勤成員 ----
function memberPortraitPath(spec) {
  if (!spec || !spec.sprite) return '';
  const prefix = spec.sprite.replace('_', '') + '_';
  return 'images/character/' + spec.sprite + '/' + prefix + '0000_Front.png';
}
function memberCondition(actor, safe) {
  if (safe) return { text: getTeam().includes(actor.type) ? '已編入' : '待命', cls: getTeam().includes(actor.type) ? 'ready' : 'standby' };
  if (!actor.live) return { text: '未部署', cls: 'standby' };
  if (actor.live.berserk) return { text: '暴走', cls: 'danger' };
  const taint = actor.live.taint || 0;
  if (taint >= 70) return { text: '危險', cls: 'danger' };
  if (taint >= 40) return { text: '負荷上升', cls: 'warning' };
  return { text: '正常', cls: 'ready' };
}
function squadMembers() {
  const safe = (typeof MAP_SAFE !== 'undefined') && MAP_SAFE;
  if (safe) return ((typeof ROSTER !== 'undefined') ? ROSTER : Object.keys(TYPES)).map(type => ({ type, live: null }));
  if (typeof G === 'undefined' || !G || !Array.isArray(G.towers)) return [];
  return G.towers.map(live => ({ type: live.type, live }));
}
function squadCard(actor, safe) {
  const spec = TYPES[actor.type]; if (!spec) return '';
  const live = actor.live;
  const hp = live ? Math.max(0, Math.round(live.hp)) : spec.hp;
  const taint = live ? Math.max(0, Math.min(100, Math.round(live.taint || 0))) : 0;
  const condition = memberCondition(actor, safe);
  const support = spec.guide ? '疏導 ' + spec.aura.rate + '/秒' : (spec.splash > 0 ? '範圍 ' + spec.splash.toFixed(1) + ' 格' : '單體攻擊');
  return '<article class="squad-card" style="--member-color:' + spec.color + '">' +
    '<img class="squad-portrait" src="' + memberPortraitPath(spec) + '" alt="' + spec.name + '">' +
    '<div class="squad-member-main">' +
      '<div class="squad-member-head"><div><strong>' + spec.name + '</strong><span>' + spec.rank + ' 級 ' + (spec.guide ? '嚮導' : '哨兵') + '・' + spec.role + '</span></div><em class="member-condition ' + condition.cls + '">' + condition.text + '</em></div>' +
      '<div class="squad-bars"><div><span>生命 <b>' + hp + ' / ' + spec.hp + '</b></span><i class="hp-bar"><u style="width:' + Math.max(0, Math.min(100, hp / spec.hp * 100)) + '%"></u></i></div>' +
      '<div><span>負荷 <b>' + taint + ' / 100</b></span><i class="taint-bar"><u style="width:' + taint + '%"></u></i></div></div>' +
      '<dl class="squad-stats"><div><dt>攻擊</dt><dd>' + spec.dmg + '</dd></div><div><dt>射程</dt><dd>' + spec.range.toFixed(1) + ' 格</dd></div><div><dt>攻速</dt><dd>' + spec.rate.toFixed(1) + '/秒</dd></div><div><dt>命中</dt><dd>' + Math.round(spec.accuracy * 100) + '%</dd></div><div class="wide"><dt>特性</dt><dd>' + support + '</dd></div></dl>' +
    '</div></article>';
}
function renderSquadPanel() {
  if (!squadPanel) return;
  const safe = (typeof MAP_SAFE !== 'undefined') && MAP_SAFE;
  squadPanel.classList.toggle('squad-safe', safe);
  const members = squadMembers();
  const oldScroll = squadPanel.querySelector('.squad-list');
  const scrollTop = oldScroll ? oldScroll.scrollTop : 0;
  squadPanel.innerHTML =
    '<div class="squad-panel-head"><div><small>' + (safe ? 'RESPONSE CENTER ROSTER' : 'ACTIVE FIELD TEAM') + '</small><h2>小隊隊員</h2><p>' + (safe ? '安全區域・可查看完整名冊與出勤狀態' : '戰鬥區域・僅顯示本次任務出勤成員') + '</p></div><button class="squad-close" type="button" aria-label="關閉隊員資料">×</button></div>' +
    '<div class="squad-list">' + (members.length ? members.map(actor => squadCard(actor, safe)).join('') : '<div class="squad-empty">本次任務沒有攜帶隊員。</div>') + '</div>';
  squadPanel.querySelector('.squad-close').addEventListener('click', closeSquadPanel);
  const list = squadPanel.querySelector('.squad-list'); if (list) list.scrollTop = scrollTop;
}
function openSquadPanel() { ensureTeamUI(); closeTeamPanel(); renderSquadPanel(); squadPanel.classList.remove('hidden'); squadBtn.classList.add('active'); if (typeof sfx === 'function') sfx('menu'); }
function closeSquadPanel() { if (squadPanel) squadPanel.classList.add('hidden'); if (squadBtn) squadBtn.classList.remove('active'); }
function isSquadPanelOpen() { return squadPanel && !squadPanel.classList.contains('hidden'); }

const TEAM_PROFILES = {
  theonie: { intro: '自信的火焰天才。擅長遠程火力，需留意負荷累積。' },
  amber: { intro: '認真守規矩的實習哨兵。雷擊能波及多個目標，但命中較不穩定。' },
  red: { intro: '熱情可靠的小隊長。近距離迎敵，負荷會自行恢復。' },
  avaren: { intro: '沉默而戒備的特殊個體。攻擊力強，格外依賴艾德林。' },
  luther: { intro: '擁有怪力的哨兵。擅長近戰重擊，不善應付過度親近。' },
  eldrin: { intro: '溫柔又愛操心的嚮導。持續疏導附近隊友，適合隨隊支援。' },
  chris: { intro: '懶散又親近人的戰鬥嚮導。能隨隊疏導，總會留意路德。' },
};
function renderTeamPanel() {
  const roster = (typeof ROSTER !== 'undefined') ? ROSTER : [];
  const cap = (typeof TEAM_SIZE !== 'undefined') ? TEAM_SIZE : 4;
  const team = getTeam();
  const rows = roster.map(id => {
    const spec = (typeof TYPES !== 'undefined' && TYPES[id]) || {};
    const inTeam = team.includes(id);
    const role = spec.guide ? '嚮導・弱戰鬥＋隨身疏導' : '哨兵';
    const profile = TEAM_PROFILES[id] || {};
    return '<button class="team-pick" data-id="' + id + '" style="display:flex;align-items:center;gap:10px;width:100%;text-align:left;margin:5px 0;padding:9px 11px;border-radius:8px;border:2px solid ' + (inTeam ? '#5ec8ff' : '#34404f') + ';background:' + (inTeam ? '#22384a' : '#1b222c') + ';color:#e6ebf2;cursor:pointer;font-size:14px">' +
      '<span class="team-avatar-frame"><img class="team-avatar" src="' + memberPortraitPath(spec) + '" alt="' + spec.name + '正面圖"></span>' +
      '<span class="team-summary"><b>' + (spec.name || id) + '</b>' +
      '<span class="team-role">' + (spec.rank ? spec.rank + ' 級・' : '') + role + '</span>' +
      '<span class="team-intro">' + (profile.intro || spec.role || '') + '</span></span>' +
      '<span class="team-choice" style="color:' + (inTeam ? '#8fd3ff' : '#9aa4b2') + '">' + (inTeam ? '✔ 已編入' : '＋ 編入') + '</span></button>';
  }).join('');
  teamPanel.innerHTML =
    '<div style="background:#141a22;border:1px solid #2a3442;border-radius:12px;padding:18px;width:min(680px,92%);max-height:88%;overflow:auto">' +
    '<h2 style="margin:0 0 4px;font-size:18px;color:#e6ebf2">🧑‍🤝‍🧑 出勤編隊</h2>' +
    '<div style="color:#9aa4b2;font-size:13px;margin-bottom:10px">每次任務可帶 ' + cap + ' 位。已選 <b style="color:#8fd3ff">' + team.length + ' / ' + cap + '</b> 位。</div>' +
    '<div>' + rows + '</div>' +
    '<div style="display:flex;justify-content:flex-end;margin-top:14px"><button id="teamDone" style="padding:8px 18px;border-radius:8px;background:#2b5a45;border:1px solid #4fbf8f;color:#fff;cursor:pointer;font-size:14px">完成</button></div>' +
    '</div>';
  teamPanel.querySelectorAll('.team-pick').forEach(b => b.addEventListener('click', () => {
    const id = b.dataset.id; let t = getTeam();
    if (t.includes(id)) t = t.filter(x => x !== id);
    else { if (t.length >= cap) { if (typeof sfx === 'function') sfx('error'); return; } t.push(id); }
    setTeam(t); renderTeamPanel();
  }));
  teamPanel.querySelector('#teamDone').addEventListener('click', () => { if (typeof sfx === 'function') sfx('button'); closeTeamPanel(); });
}

// 只有在安全場景（基地）才顯示編隊按鈕
function updateTeamButton() {
  ensureTeamUI();
  const safe = (typeof MAP_SAFE !== 'undefined') && MAP_SAFE;
  if (teamBtn) teamBtn.classList.toggle('hidden', !safe);
  if (!safe) closeTeamPanel();
  if (squadBtn) squadBtn.title = safe ? '查看全體隊員資料' : '查看本次出勤隊員狀態';
}

// Esc 關閉面板
window.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (isTeamPanelOpen()) closeTeamPanel();
  if (isSquadPanelOpen()) closeSquadPanel();
});

// 戰鬥中持續更新目前生命、負荷與狀態，不會因此暫停遊戲。
window.setInterval(() => { if (isSquadPanelOpen() && !(typeof MAP_SAFE !== 'undefined' && MAP_SAFE)) renderSquadPanel(); }, 400);
