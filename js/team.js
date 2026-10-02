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
function openTeamPanel() { ensureTeamUI(); closeSquadPanel(); if (typeof closeAchievementPanel === 'function') closeAchievementPanel(); renderTeamPanel(); teamPanel.classList.remove('hidden'); if (typeof sfx === 'function') sfx('menu'); }
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
  if (taint > 85) return { text: '瀕臨暴走', cls: 'danger' };
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
const CAPTAIN_IMPRESSIONS = Object.fromEntries(Object.values(CHARACTERS)
  .filter(character => character.captainImpression)
  .map(character => [character.id, character.captainImpression]));
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
function openSquadPanel() { ensureTeamUI(); closeTeamPanel(); if (typeof closeAchievementPanel === 'function') closeAchievementPanel(); renderSquadPanel(); squadPanel.classList.remove('hidden'); squadBtn.classList.add('active'); if (typeof sfx === 'function') sfx('menu'); }
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
  if (typeof sentryStatus === 'function') sentryStatus(member, destination === 'player' ? '前往部隊長身邊巡邏' : '返回基地巡邏');
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
      const sootheAction = '';   // 正式遊戲停用隊友欄的手動疏導按鈕（靠近哨兵仍可疏導）
      const stateLabel = hp <= 0 ? ''   // 倒下時不顯示汙染標籤，改由下方的「重傷」橫條說明
        : member.berserk
        ? '<em class="taint-tag berserk">暴走</em>'
        : (!spec.guide && taint > 85 ? '<em class="taint-tag danger">瀕臨暴走</em>' : '');
      const hasUlt = (typeof ULTIMATES !== 'undefined') && ULTIMATES[member.type];   // 有大招才顯示冷卻環
      const cdRing = hasUlt
        ? '<svg class="field-cd-ring" data-type="' + member.type + '" viewBox="0 0 40 40" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible"><rect x="2.5" y="2.5" width="35" height="35" rx="2" fill="none" stroke="#4db5ff" stroke-width="2" stroke-linecap="round" style="stroke-dasharray:140;stroke-dashoffset:140;filter:drop-shadow(0 0 2px #4db5ff)"></rect></svg>'
        : '';
      const taintCls = hp <= 0 ? '' : member.berserk ? ' berserk' : (!spec.guide && taint > 85 ? ' danger' : '');   // 整個隊員框閃紅／紅色濾鏡
      // 這個面板每 0.3 秒重畫一次；用負的 animation-delay 對齊時鐘，閃爍才不會每次重畫就從頭開始
      const nowS = performance.now() / 1000;
      const syncStyle = taintCls ? ' style="--blink-sync:-' + (nowS % 1.1).toFixed(2) + 's;--blink-sync-fast:-' + (nowS % .38).toFixed(2) + 's"' : '';
      return '<article class="field-member' + (hp <= 0 ? ' down' : '') + taintCls + '"' + syncStyle + '>' +
        '<button class="field-member-avatar" type="button" data-type="' + member.type + '" aria-label="命令' + spec.name + '" style="position:relative"><img src="' + memberPortraitPath(spec) + '" alt="' + spec.name + '">' + cdRing + '</button><div class="field-member-status"><b>' + spec.name + '．' + (spec.guide ? '嚮導' : '哨兵') + stateLabel + '</b>' +
        '<div><i class="field-hp" aria-label="生命值"><u style="width:' + hpPercent + '%"></u></i></div>' +
        '<div><i class="field-load" aria-label="精神負荷"><u style="width:' + loadWidth + '%"></u></i></div>' +
        '</div>' + sootheAction +
        (hp <= 0 ? '<div class="field-down-banner">重傷｜失去戰鬥能力</div>' : '') +   // 倒下：資訊條上壓一條橫幅
        '</article>';
    }).join('') : '<p class="field-squad-empty">尚無出勤隊員</p>') + '</div>';
  fieldSquadHud.classList.remove('hidden');
}
// 每幀更新隊員頭像的大招冷卻環（內緣藍線，隨充能繞一圈）
function updateFieldCdRings() {
  if (!fieldSquadHud || typeof G === 'undefined' || !G || !Array.isArray(G.towers)) return;
  const ults = (typeof ULTIMATES !== 'undefined') ? ULTIMATES : null; if (!ults) return;
  for (const svg of fieldSquadHud.querySelectorAll('.field-cd-ring')) {
    const member = G.towers.find(t => t.type === svg.dataset.type), ult = ults[svg.dataset.type];
    const rect = svg.querySelector('rect'); if (!rect) continue;
    const remain = (member && ult) ? Math.max(0, Math.min(1, (member.ultCd || 0) / ult.cd)) : 0;   // 1 剛發招 → 0 可用
    if (remain <= 0.001) { rect.style.display = 'none'; continue; }   // 可用（或沒大招）時不顯示藍圈
    rect.style.display = '';
    const P = rect.getTotalLength ? rect.getTotalLength() : 140;
    rect.style.strokeDasharray = P;
    rect.style.strokeDashoffset = P * (1 - remain);   // 滿→空，隨冷卻減少
  }
}

const TEAM_PROFILES = Object.fromEntries(Object.values(CHARACTERS)
  .filter(character => character.intro)
  .map(character => [character.id, { intro: character.intro }]));
function renderTeamPanel() {
  const roster = (typeof ROSTER !== 'undefined') ? ROSTER : [];
  const cap = (typeof TEAM_SIZE !== 'undefined') ? TEAM_SIZE : 4;
  const team = getTeam();
  const memberCard = (id, selected) => {
    const spec = (typeof TYPES !== 'undefined' && TYPES[id]) || {};
    const role = spec.guide ? '嚮導・弱戰鬥＋隨身疏導' : '哨兵';
    const profile = TEAM_PROFILES[id] || {};
    return '<button class="team-pick' + (selected ? ' team-pick-selected' : '') + '" type="button" data-id="' + id + '" aria-label="' + (selected ? '移出' : '編入') + spec.name + '">' +
      '<span class="team-avatar-frame"><img class="team-avatar" src="' + memberPortraitPath(spec) + '" alt="' + spec.name + '正面圖"></span>' +
      '<span class="team-summary"><b>' + (spec.name || id) + '</b>' +
      '<span class="team-role">' + (spec.rank ? spec.rank + ' 級・' : '') + role + '</span>' +
      '<span class="team-intro">' + (profile.intro || spec.role || '') + '</span></span>' +
      '<span class="team-choice">' + (selected ? '移出 −' : '編入 ＋') + '</span></button>';
  };
  const available = roster.filter(id => !team.includes(id));
  teamPanel.innerHTML =
    '<div class="team-dialog" role="dialog" aria-modal="true" aria-label="出勤配置">' +
    '<header class="team-dialog-head"><div><h2>🧑‍🤝‍🧑 出勤配置</h2><p>選擇這次任務的出勤人員</p></div><span class="team-count">已編入 <b>' + team.length + ' / ' + cap + '</b></span></header>' +
    '<div class="team-columns">' +
      '<section class="team-column"><h3>可選人員 <small>' + available.length + ' 位</small></h3><div class="team-list" id="teamAvailable">' +
        (available.length ? available.map(id => memberCard(id, false)).join('') : '<p class="team-empty">所有人員都已編入。</p>') +
      '</div></section>' +
      '<section class="team-column team-column-selected"><h3>已編入人員 <small>' + team.length + ' / ' + cap + '</small></h3><div class="team-list" id="teamSelected">' +
        (team.length ? team.map(id => memberCard(id, true)).join('') : '<p class="team-empty">尚未編入人員，請從左側選擇。</p>') +
      '</div></section>' +
    '</div><footer class="team-dialog-footer"><span>點選左側編入，點選右側移出</span><button id="teamDone" type="button">完成</button></footer>' +
    '</div>';
  teamPanel.querySelector('#teamAvailable').addEventListener('click', e => {
    const button = e.target.closest('.team-pick'); if (!button) return;
    const current = getTeam();
    if (current.length >= cap) {
      if (typeof sfx === 'function') sfx('error');
      if (typeof systemNotice === 'function') systemNotice('已滿編', true);
      return;
    }
    setTeam([...current, button.dataset.id]); renderTeamPanel();
  });
  teamPanel.querySelector('#teamSelected').addEventListener('click', e => {
    const button = e.target.closest('.team-pick'); if (!button) return;
    setTeam(getTeam().filter(id => id !== button.dataset.id)); renderTeamPanel();
  });
  teamPanel.querySelector('#teamDone').addEventListener('click', () => { if (typeof sfx === 'function') sfx('button'); closeTeamPanel(); });
}

// 只有在安全場景（基地）才顯示編隊按鈕
function updateTeamButton() {
  ensureTeamUI();
  const safe = (typeof MAP_SAFE !== 'undefined') && MAP_SAFE;
  if (teamBtn) teamBtn.classList.toggle('hidden', !safe);
  if (!safe) closeTeamPanel();
  if (typeof updateAchievementButton === 'function') updateAchievementButton(safe);   // 🏆 成就按鈕（js/achievements.js）
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
