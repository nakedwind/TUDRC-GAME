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
let teamBtn = null, teamPanel = null, squadBtn = null, squadPanel = null, impressionPanel = null, fieldSquadHud = null, fieldCommandMenu = null;
function ensureTeamUI() {
  const wrap = document.getElementById('wrap'); if (!wrap) return;
  if (!squadBtn) {
    squadBtn = document.createElement('button');
    squadBtn.id = 'squadStatusButton';
    squadBtn.textContent = '👥 Y102隊員';
    squadBtn.addEventListener('click', () => isSquadPanelOpen() ? closeSquadPanel() : openSquadPanel());
    wrap.appendChild(squadBtn);
  }
  if (!teamBtn) {
    teamBtn = document.createElement('button');
    teamBtn.textContent = '🧑‍🤝‍🧑 出勤配置';
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
    squadPanel.setAttribute('aria-label', 'Y102隊員資料');
    wrap.appendChild(squadPanel);
  }
  if (!impressionPanel) {
    impressionPanel = document.createElement('div');
    impressionPanel.id = 'captainImpressionPanel';
    impressionPanel.className = 'hidden';
    impressionPanel.addEventListener('click', e => { if (e.target === impressionPanel) closeCaptainImpression(); });
    wrap.appendChild(impressionPanel);
  }
  if (!fieldSquadHud) {
    fieldSquadHud = document.createElement('section');
    fieldSquadHud.id = 'fieldSquadHud';
    fieldSquadHud.className = 'hidden';
    fieldSquadHud.setAttribute('aria-label', '現有隊員狀態');
    fieldSquadHud.addEventListener('pointerdown', e => {
      const sootheButton = e.target.closest('.field-soothe-button');
      if (sootheButton) {
        e.preventDefault(); e.stopPropagation();
        const member = G && G.towers && G.towers.find(t => t.type === sootheButton.dataset.soothe);
        if (member && typeof soothe === 'function') soothe(member);
        closeFieldCommandMenu();
        renderFieldSquadHud();
        return;
      }
      const avatar = e.target.closest('.field-member-avatar');
      if (avatar) {
        e.preventDefault(); e.stopPropagation();
        openFieldCommandMenu(avatar.dataset.type, avatar);
      }
    });
    wrap.appendChild(fieldSquadHud);
  }
  if (!fieldCommandMenu) {
    fieldCommandMenu = document.createElement('div');
    fieldCommandMenu.id = 'fieldCommandMenu';
    fieldCommandMenu.className = 'hidden';
    wrap.appendChild(fieldCommandMenu);
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
  if (actor.noncombat) return { text: '非戰鬥人員', cls: 'support' };
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
  if (safe) {
    const combat = ((typeof ROSTER !== 'undefined') ? ROSTER : Object.keys(TYPES)).map(type => ({ type, live: null }));
    const support = (typeof WANDERERS !== 'undefined' ? WANDERERS : []).map(profile => ({ type: profile.id, profile, live: null, noncombat: true }));
    return [...combat, ...support];
  }
  if (typeof G === 'undefined' || !G || !Array.isArray(G.towers)) return [];
  return G.towers.map(live => ({ type: live.type, live }));
}
const CAPTAIN_IMPRESSIONS = {
  theonie: '希奧妮很清楚自己的火力有多強，也有足以支撐那份自信的實力。只要有人替她守住前線，她會是隊上最可靠的遠程火力。需要注意的是，她有時會因為太想迅速解決目標，而忽略自己的精神負荷。',
  red: '雷德是那種會自然站到所有人前面的人。他耐打、恢復力強，也很擅長把危險集中到自己身上。把前線交給他，我很放心；但也得提醒他，可靠不代表什麼都要一個人扛。',
  amber: '安柏做事認真，也願意遵守每一項規定。她的雷擊命中還不夠穩定，但控制異質體的能力非常有價值。只要再多一點實戰經驗，她會成為能替全隊創造機會的哨兵。',
  luther: '路德的力量足以正面阻止異質體，近距離作戰能力很強。話不多，卻會默默確認身邊每個人的位置。他不擅長應付過度的關心，但真正危險時，反而是最不會後退的那一個。',
  avaren: '阿瓦倫仍對周遭保持高度戒備，不會輕易相信任何人。他的腐蝕能力很危險，運用得當也能讓異質體彼此攻擊。我不會要求他立刻融入所有人；能讓他願意留在隊伍裡，本身就是信任的開始。',
  eldrin: '艾德林很溫和，卻不是軟弱。他總能及時察覺哨兵的異常，並把快要失控的人拉回來。比起自己的安全，他常常更在意別人的狀況，所以出勤時必須有人留意他的位置。',
  chris: '克莉思看起來懶散，真正進入任務後卻很少漏掉關鍵變化。她的疏導不算強，但戰鬥判斷與射擊能力足以補足這點。她習慣用輕鬆的態度掩飾關心，尤其是在路德附近。',
  tino: '堤諾的感官比任何儀器都準，黑暗中有什麼、有幾隻，他都先知道。代價是那份敏銳同樣會反噬他——氣味、聲音、太近的距離，都會讓他炸毛。不要試圖安撫他，也不要越過他的界線；把他的警告當真，並且讓亞許留在他看得到的地方就好。'
};
function openCaptainImpression(type) {
  ensureTeamUI();
  const spec = TYPES[type]; if (!spec || !impressionPanel) return;
  impressionPanel.innerHTML = '<section class="captain-impression-card" role="dialog" aria-modal="true" aria-label="溫特部隊長對' + spec.name + '的印象">' +
    '<header><div><small>CAPTAIN WINTER’S NOTES</small><h3>溫特部隊長的印象</h3><p>關於 ' + spec.name + '</p></div><button class="captain-impression-close" type="button" aria-label="關閉">×</button></header>' +
    '<div class="captain-impression-body"><img src="' + memberPortraitPath(spec) + '" alt="' + spec.name + '"><blockquote>「' + (CAPTAIN_IMPRESSIONS[type] || '這名隊員的觀察紀錄尚未完成。') + '」</blockquote></div>' +
    '<footer>— Y102應變編組・部隊長 溫特</footer></section>';
  impressionPanel.querySelector('.captain-impression-close').addEventListener('click', closeCaptainImpression);
  impressionPanel.classList.remove('hidden');
  if (typeof sfx === 'function') sfx('menu');
}
function closeCaptainImpression() { if (impressionPanel) impressionPanel.classList.add('hidden'); }
function squadCard(actor, safe) {
  if (actor.noncombat) return supportCard(actor);
  const spec = TYPES[actor.type]; if (!spec) return '';
  const live = actor.live;
  const hp = live ? Math.max(0, Math.round(live.hp)) : spec.hp;
  const taint = live ? Math.max(0, Math.min(100, Math.round(live.taint || 0))) : 0;
  const condition = memberCondition(actor, safe);
  const support = spec.guide ? '疏導 ' + spec.aura.rate + '/秒' : (spec.splash > 0 ? '範圍 ' + spec.splash.toFixed(1) + ' 格' : '單體攻擊');
  const level = typeof sentryLevel === 'function' ? sentryLevel(actor.type) : 1;
  const cost = typeof sentryUpgradeCost === 'function' ? sentryUpgradeCost(actor.type) : 0;
  const maxed = level >= 30;
  const affordable = typeof training !== 'undefined' && training.crystals >= cost;
  const trainingAction = safe
      ? '<button class="squad-upgrade" data-type="' + actor.type + '"' + ((!affordable || maxed) ? ' disabled' : '') + '>' +
          (maxed ? '已達最高等級' : '提升至 Lv.' + (level + 1) + '<small>消耗 ◆ ' + cost + '</small>') + '</button>'
      : '<span class="squad-training-note locked">返回安全區域後可升級</span>';
  const loadBar = spec.guide
    ? '<div class="no-load"><span>精神負荷 <b>無</b></span><i><u style="width:0"></u></i></div>'
    : '<div><span>負荷 <b>' + taint + ' / 100</b></span><i class="taint-bar"><u style="width:' + taint + '%"></u></i></div>';
  return '<article class="squad-card squad-card-combat" style="--member-color:' + spec.color + '">' +
    '<img class="squad-portrait" src="' + memberPortraitPath(spec) + '" alt="' + spec.name + '">' +
    '<div class="squad-member-main">' +
      '<div class="squad-member-head"><div><strong>' + spec.name + '<mark>Lv.' + level + '</mark></strong><span>' + spec.rank + ' 級 ' + (spec.guide ? '嚮導' : '哨兵') + '・' + spec.role + '・' + (spec.guide ? '疏導能力' : '異能力') + '：' + spec.ability + '</span></div><em class="member-condition ' + condition.cls + '">' + condition.text + '</em></div>' +
      '<div class="squad-bars"><div><span>生命 <b>' + hp + ' / ' + spec.hp + '</b></span><i class="hp-bar"><u style="width:' + Math.max(0, Math.min(100, hp / spec.hp * 100)) + '%"></u></i></div>' +
      loadBar + '</div>' +
      '<dl class="squad-stats"><div><dt>攻擊</dt><dd>' + spec.dmg + '</dd></div><div><dt>防禦</dt><dd>' + Math.round((spec.defense || 0) * 100) + '%</dd></div><div><dt>射程</dt><dd>' + spec.range.toFixed(1) + ' 格</dd></div><div><dt>攻速</dt><dd>' + spec.rate.toFixed(1) + '/秒</dd></div><div><dt>命中</dt><dd>' + Math.round(spec.accuracy * 100) + '%</dd></div><div class="wide"><dt>特性</dt><dd>' + (spec.trait || support) + '</dd></div></dl>' +
      '<div class="squad-card-actions"><button class="captain-impression-button" type="button" data-impression="' + actor.type + '">深入了解</button><div class="squad-training">' + trainingAction + '</div></div>' +
    '</div></article>';
}
function supportCard(actor) {
  const profile = actor.profile || (typeof WANDERERS !== 'undefined' ? WANDERERS.find(x => x.id === actor.type) : null);
  if (!profile) return '';
  const display = { name: profile.name, sprite: profile.sprite };
  return '<article class="squad-card squad-card-support" style="--member-color:#8292a3">' +
    '<img class="squad-portrait" src="' + memberPortraitPath(display) + '" alt="' + profile.name + '">' +
    '<div class="squad-member-main">' +
      '<div class="squad-member-head"><div><strong>' + profile.name + '</strong><span>Y102編組・非戰鬥人員</span></div><em class="member-condition support">非戰鬥人員</em></div>' +
      '<div class="support-assignment"><b>支援編制</b><span>不參與戰鬥，無法使用異質結晶升級。</span></div>' +
      '<div class="squad-training"><span class="squad-training-note locked">非戰鬥人員無法升級</span></div>' +
    '</div></article>';
}
function renderSquadPanel() {
  if (!squadPanel) return;
  const safe = (typeof MAP_SAFE !== 'undefined') && MAP_SAFE;
  squadPanel.classList.toggle('squad-safe', safe);
  const members = squadMembers();
  const crystalCount = typeof training !== 'undefined' ? training.crystals : 0;
  const oldScroll = squadPanel.querySelector('.squad-list');
  const scrollTop = oldScroll ? oldScroll.scrollTop : 0;
  squadPanel.innerHTML =
    '<div class="squad-panel-head"><div><small>' + (safe ? 'Y102 RESPONSE UNIT' : 'ACTIVE FIELD PERSONNEL') + '</small><h2>Y102隊員</h2><p>' + (safe ? '安全區域・管理戰鬥與支援編制人員' : '戰鬥區域・僅顯示本次出勤人員') + '</p></div><div class="squad-head-actions"><span class="crystal-wallet"><i>◆</i><small>異質結晶</small><b>' + crystalCount + '</b></span><button class="squad-close" type="button" aria-label="關閉隊員資料">×</button></div></div>' +
    '<div class="squad-list">' + (members.length ? members.map(actor => squadCard(actor, safe)).join('') : '<div class="squad-empty">本次任務沒有攜帶隊員。</div>') + '</div>';
  squadPanel.querySelector('.squad-close').addEventListener('click', closeSquadPanel);
  squadPanel.querySelectorAll('.squad-upgrade').forEach(button => button.addEventListener('click', () => {
    if (typeof upgradeSentry !== 'function' || !upgradeSentry(button.dataset.type)) {
      if (typeof sfx === 'function') sfx('error');
      return;
    }
    if (typeof sfx === 'function') sfx('button');
    renderSquadPanel();
  }));
  squadPanel.querySelectorAll('.captain-impression-button').forEach(button => button.addEventListener('click', () => openCaptainImpression(button.dataset.impression)));
  const list = squadPanel.querySelector('.squad-list'); if (list) list.scrollTop = scrollTop;
}
function openSquadPanel() { ensureTeamUI(); closeTeamPanel(); renderSquadPanel(); squadPanel.classList.remove('hidden'); squadBtn.classList.add('active'); if (typeof sfx === 'function') sfx('menu'); }
function closeSquadPanel() { if (squadPanel) squadPanel.classList.add('hidden'); if (squadBtn) squadBtn.classList.remove('active'); }
function isSquadPanelOpen() { return squadPanel && !squadPanel.classList.contains('hidden'); }

function closeFieldCommandMenu() { if (fieldCommandMenu) fieldCommandMenu.classList.add('hidden'); }
function nearestPatrolPoint(x, y, predicate) {
  let best = null, bestDistance = Infinity;
  for (let radius = 0; radius <= 4; radius++) {
    for (let dc = -radius; dc <= radius; dc++) for (let dr = -radius; dr <= radius; dr++) {
      if (radius && Math.abs(dc) !== radius && Math.abs(dr) !== radius) continue;
      const [baseC, baseR] = cellAt(x, y), c = baseC + dc, r = baseR + dr;
      if (!inGrid(c, r) || isWall(c, r) || isEntrance(c, r) || G.grid[c + ',' + r]) continue;
      if (predicate && !predicate(c, r)) continue;
      const [px, py] = center(c, r);
      if (typeof isLit === 'function' && !isLit(px, py)) continue;
      const distance = Math.hypot(px - x, py - y);
      if (distance < bestDistance) { best = { x: px, y: py }; bestDistance = distance; }
    }
    if (best) break;
  }
  return best;
}
function basePatrolPoint(member) {
  let best = null, bestDistance = Infinity;
  if (typeof campCells !== 'undefined') for (const key of campCells) {
    const [c, r] = key.split(',').map(Number);
    if (!inGrid(c, r) || isWall(c, r) || isEntrance(c, r) || G.grid[c + ',' + r]) continue;
    const [x, y] = center(c, r), distance = Math.hypot(x - member.x, y - member.y);
    if (distance < bestDistance) { best = { x, y }; bestDistance = distance; }
  }
  return best || nearestPatrolPoint(member.x, member.y);
}
function commandFieldMember(type, destination) {
  const member = G && G.towers && G.towers.find(t => t.type === type);
  if (!member || member.hp <= 0 || member.berserk) {
    if (typeof sfx === 'function') sfx('error');
    closeFieldCommandMenu(); return;
  }
  const point = destination === 'player' && G.player
    ? nearestPatrolPoint(G.player.x, G.player.y)
    : basePatrolPoint(member);
  if (!point) { if (typeof sfx === 'function') sfx('error'); closeFieldCommandMenu(); return; }
  member.mode = 'goto'; member.target = point; member.anchor = null; member.waitT = 0; member.navPath = null; member.navGoal = null;
  if (typeof sfx === 'function') sfx('button');
  if (typeof flash === 'function') flash(destination === 'player' ? '前往部隊長身邊巡邏' : '返回基地巡邏', member.x, member.y - 24, '#8fd3ff');
  closeFieldCommandMenu();
}
function openFieldCommandMenu(type, avatar) {
  const member = G && G.towers && G.towers.find(t => t.type === type), spec = TYPES[type];
  if (!member || !spec || !fieldCommandMenu) return;
  const unavailable = member.hp <= 0 || member.berserk;
  fieldCommandMenu.innerHTML = '<strong>' + spec.name + '．' + (spec.guide ? '嚮導' : '哨兵') + '</strong>' +
    (unavailable ? '<p>' + (member.hp <= 0 ? '目前無法行動' : '暴走中，無法接受指令') + '</p>' :
    '<button type="button" data-destination="base">返回基地巡邏</button><button type="button" data-destination="player">到玩家身邊巡邏</button>');
  fieldCommandMenu.querySelectorAll('button').forEach(button => button.addEventListener('click', () => commandFieldMember(type, button.dataset.destination)));
  const wrapRect = document.getElementById('wrap').getBoundingClientRect(), avatarRect = avatar.getBoundingClientRect();
  fieldCommandMenu.style.left = Math.round(avatarRect.right - wrapRect.left + 7) + 'px';
  fieldCommandMenu.style.top = Math.round(avatarRect.top - wrapRect.top) + 'px';
  fieldCommandMenu.classList.remove('hidden');
  if (typeof sfx === 'function') sfx('menu');
}

function renderFieldSquadHud() {
  if (!fieldSquadHud) return;
  const safe = (typeof MAP_SAFE !== 'undefined') && MAP_SAFE;
  if (safe) { fieldSquadHud.classList.add('hidden'); return; }
  const members = (typeof G !== 'undefined' && G && Array.isArray(G.towers)) ? G.towers : [];
  fieldSquadHud.innerHTML = '<div class="field-squad-list">' +
    (members.length ? members.map(member => {
      const spec = TYPES[member.type]; if (!spec) return '';
      const hp = Math.max(0, Math.round(member.hp || 0));
      const hpPercent = Math.max(0, Math.min(100, hp / spec.hp * 100));
      const taint = Math.max(0, Math.min(100, Math.round(member.taint || 0)));
      const loadWidth = spec.guide ? 0 : taint;
      const sootheAction = hp > 0 && !spec.guide && taint > 50
        ? '<button class="field-soothe-button" type="button" data-soothe="' + member.type + '">疏導</button>'
        : '';
      return '<article class="field-member' + (hp <= 0 ? ' down' : '') + '">' +
        '<button class="field-member-avatar" type="button" data-type="' + member.type + '" aria-label="命令' + spec.name + '"><img src="' + memberPortraitPath(spec) + '" alt="' + spec.name + '"></button><div class="field-member-status"><b>' + spec.name + '．' + (spec.guide ? '嚮導' : '哨兵') + '</b>' +
        '<div><i class="field-hp" aria-label="生命值"><u style="width:' + hpPercent + '%"></u></i></div>' +
        '<div><i class="field-load" aria-label="精神負荷"><u style="width:' + loadWidth + '%"></u></i></div>' +
        '</div>' + sootheAction + '</article>';
    }).join('') : '<p class="field-squad-empty">尚無出勤隊員</p>') + '</div>';
  fieldSquadHud.classList.remove('hidden');
}

const TEAM_PROFILES = {
  theonie: { intro: '自信的火焰天才。擅長遠程火力，需留意負荷累積。' },
  amber: { intro: '認真守規矩的實習哨兵。雷擊能波及多個目標，但命中較不穩定。' },
  red: { intro: '熱情可靠的小隊長。近距離迎敵，負荷會自行恢復。' },
  avaren: { intro: '沉默而戒備的特殊個體。攻擊力強，格外依賴艾德林。' },
  luther: { intro: '擁有怪力的哨兵。擅長近戰重擊，不善應付過度親近。' },
  eldrin: { intro: '溫柔又愛操心的嚮導。持續疏導附近隊友，適合隨隊支援。' },
  chris: { intro: '懶散又親近人的戰鬥嚮導。能隨隊疏導，總會留意路德。' },
  tino: { intro: '感官敏銳的年輕哨兵。能察覺黑暗中的怪物，但防禦與生命偏低。' },
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
    '<h2 style="margin:0 0 4px;font-size:18px;color:#e6ebf2">🧑‍🤝‍🧑 出勤配置</h2>' +
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
  if (squadBtn) {
    squadBtn.classList.toggle('hidden', !safe);
    squadBtn.title = '查看全體隊員資料';
  }
  if (!safe) closeSquadPanel();
  if (safe) closeFieldCommandMenu();
  renderFieldSquadHud();
}

// Esc 關閉面板
window.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (isTeamPanelOpen()) closeTeamPanel();
  if (fieldCommandMenu && !fieldCommandMenu.classList.contains('hidden')) { closeFieldCommandMenu(); return; }
  if (impressionPanel && !impressionPanel.classList.contains('hidden')) { closeCaptainImpression(); return; }
  if (isSquadPanelOpen()) closeSquadPanel();
});

// 戰鬥中持續更新目前生命、負荷與狀態，不會因此暫停遊戲。
window.setInterval(() => {
  const safe = (typeof MAP_SAFE !== 'undefined') && MAP_SAFE;
  if (!safe) renderFieldSquadHud();
}, 300);
