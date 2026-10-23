/* ===== 出勤隊伍 =====
   在基地選最多 TEAM_SIZE 位隊員，戰鬥隊員與搜救犬分別由 spawnSentries／spawnWanderers 依 getTeam() 生成。
   名單／人數在 data/balance.js：ROSTER / TEAM_SIZE / DEFAULT_TEAM。
   隊伍存在瀏覽器 localStorage，跨場景與重開都保留。
*/
const TEAM_STORE = 'tudrc_team_v1';
const RESCUE_DOG_REQUIREMENT = '球球需要艾德林或阿瓦倫其中一位領犬員同行';
const teamProfile = id => TYPES[id] || CHARACTERS[id];
const hasDogHandler = team => RESCUE_DOG_HANDLERS.some(id => team.includes(id));

function normalizeTeam(list) {
  const roster = (typeof ROSTER !== 'undefined') ? ROSTER : [];
  const cap = (typeof TEAM_SIZE !== 'undefined') ? TEAM_SIZE : 4;
  const team = [...new Set(list)].filter(id => roster.includes(id) && teamProfile(id)).slice(0, cap);
  return hasDogHandler(team) ? team : team.filter(id => id !== 'ball');
}

function getTeam() {
  let t = null;
  try { t = JSON.parse(localStorage.getItem(TEAM_STORE)); } catch (e) {}
  if (!Array.isArray(t)) t = (typeof DEFAULT_TEAM !== 'undefined') ? DEFAULT_TEAM.slice() : [];
  return normalizeTeam(t);
}
function setTeam(list) {
  if (list.includes('ball') && !hasDogHandler(list)) {
    if (typeof sfx === 'function') sfx('error');
    if (typeof systemNotice === 'function') systemNotice(RESCUE_DOG_REQUIREMENT + '，請先移出球球或保留另一位領犬員', true);
    return false;
  }
  try { localStorage.setItem(TEAM_STORE, JSON.stringify(normalizeTeam(list))); return true; } catch (e) { return false; }
}

// ---- 編隊面板（DOM 由程式建立，不用改 HTML/CSS）----
let teamPanel = null, squadBtn = null, squadPanel = null, impressionPanel = null, fieldSquadHud = null, fieldCommandMenu = null;
// 戰鬥畫面的面板可以收起來（隊員欄、建築欄）；收合狀態記在瀏覽器裡，下次打開遊戲照舊
const HUD_COLLAPSE_KEY = 'tudrc_hud_collapsed';
const hudCollapsed = (() => { try { return JSON.parse(localStorage.getItem(HUD_COLLAPSE_KEY) || '{}') || {}; } catch (_) { return {}; } })();
function setHudCollapsed(name, on) {
  hudCollapsed[name] = !!on;
  try { localStorage.setItem(HUD_COLLAPSE_KEY, JSON.stringify(hudCollapsed)); } catch (_) {}
  if (typeof sfx === 'function') sfx('switch');
}
if (typeof applyBuildCollapse === 'function') applyBuildCollapse();   // build.js 比這裡早載入，收合狀態讀到之後再套用一次
function ensureTeamUI() {
  const wrap = document.getElementById('wrap'); if (!wrap) return;
  if (!squadBtn) {
    squadBtn = document.createElement('button');
    squadBtn.id = 'squadStatusButton';
    squadBtn.textContent = '👥 Y102隊員';
    squadBtn.addEventListener('click', () => isSquadPanelOpen() ? closeSquadPanel() : openSquadPanel());
    wrap.appendChild(squadBtn);
  }
  if (!teamPanel) {
    teamPanel = document.createElement('div');
    teamPanel.id = 'teamEditPanel';
    teamPanel.className = 'hidden';
    teamPanel.style.cssText = 'position:absolute;inset:10px;z-index:40;display:flex;align-items:center;justify-content:center';   // 外觀在 style.css（和商店同一套）
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
      const fold = e.target.closest('.hud-collapse');
      if (fold) { e.preventDefault(); e.stopPropagation(); setHudCollapsed('squad', !hudCollapsed.squad); closeFieldCommandMenu(); applySquadCollapse(); return; }
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
        if (typeof firstAid !== 'undefined' && firstAid.picking) {   // 正在用急救包選隊員（js/equipment.js）：左鍵＝治療這位，右鍵＝取消
          if (e.button === 0) firstAidPickMember(avatar.dataset.type); else cancelFirstAidPick();
          return;
        }
        if (e.button === 2) openFieldCommandMenu(avatar.dataset.type, avatar);   // 只有右鍵開命令選單（左鍵不會）
        else if (e.button === 0) locateFieldMember(avatar.dataset.type || avatar.dataset.char);
      }
    });
    // 急救包選隊員時：滑鼠停在哪位隊員的頭像上，那位就發光＋出現箭頭
    const setAidHover = type => {
      if (typeof firstAid === 'undefined' || !firstAid.picking) type = null;
      if (type && firstAid.hover !== type) sfx('aidHover');   // 每換到一位隊員就響一次
      if (typeof firstAid !== 'undefined') firstAid.hover = type;
      fieldSquadHud.querySelectorAll('.field-member').forEach(a => a.classList.toggle('aid-hover', !!type && a.dataset.type === type));
    };
    fieldSquadHud.addEventListener('pointermove', e => { const av = e.target.closest('.field-member-avatar'); setAidHover(av ? av.dataset.type : null); });
    fieldSquadHud.addEventListener('pointerleave', () => setAidHover(null));
    fieldSquadHud.addEventListener('contextmenu', e => { if (e.target.closest('.field-member-avatar')) e.preventDefault(); });   // 右鍵不要跳出瀏覽器的選單
    wrap.appendChild(fieldSquadHud);
  }
  if (!fieldCommandMenu) {
    fieldCommandMenu = document.createElement('div');
    fieldCommandMenu.id = 'fieldCommandMenu';
    fieldCommandMenu.className = 'hidden';
    wrap.appendChild(fieldCommandMenu);
  }
}
function locateFieldMember(type) {
  if (MAP_SAFE || typeof G === 'undefined' || !G) return;
  const actor = (G.towers || []).find(t => t.type === type) || (G.npcs || []).find(n => n.id === type);
  if (!actor) return;
  G.fieldLocate = { actor, until: performance.now() + 4000 };
  closeFieldCommandMenu();
  if (typeof sfx === 'function') sfx('blip');
}
function openTeamPanel() { ensureTeamUI(); closeSquadPanel(); if (typeof closeAchievementPanel === 'function') closeAchievementPanel(); renderTeamPanel(); teamPanel.classList.remove('hidden'); if (typeof sfx === 'function') sfx('menu'); }
function closeTeamPanel() { if (teamPanel) teamPanel.classList.add('hidden'); if (typeof sortiePicking !== 'undefined') sortiePicking = null; }
function isTeamPanelOpen() { return teamPanel && !teamPanel.classList.contains('hidden'); }

// ---- 隊員資料：安全區看完整名冊，戰鬥區只看實際出勤成員 ----
// 隊員數值的小圖示：跟 NPC 頭上的圖示（images/ui/ash-clipboard.svg 等）同一種風格——白色實心剪影＋深色描邊（css 的 .stat-ico）
// 攻擊＝劍、防禦＝盾、射程＝兩端箭頭、攻速＝>>>、命中＝靶心
const STAT_ICON = (() => {
  const svg = (cls, body) => '<svg class="stat-ico ' + cls + '" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">' + body + '</svg>';
  return {
    atk: svg('atk', '<g transform="rotate(45 12 12) translate(12 12) scale(1.18) translate(-12 -12)"><path d="M12 1.2 14.6 4V15H9.4V4Z"/><rect x="7.4" y="14.6" width="9.2" height="2.8" rx="1.4"/><rect x="10.7" y="17" width="2.6" height="3.4" rx="1.1"/><circle cx="12" cy="21.1" r="1.6"/></g>'),
    def: svg('def', '<path fill-rule="evenodd" d="M12 1.8 20.5 5V11.2C20.5 16.6 16.9 20.3 12 22.3 7.1 20.3 3.5 16.6 3.5 11.2V5ZM12 5.6 7.2 7.5V11.4C7.2 14.4 9 16.8 12 18.3Z"/>'),
    range: svg('range', '<path d="M1.6 12 7.6 6.4V9.8H16.4V6.4L22.4 12 16.4 17.6V14.2H7.6V17.6Z"/>'),
    rate: svg('rate', '<path d="M1.5 6.2 3.9 4.4 10.3 12 3.9 19.6 1.5 17.8 6.4 12Z"/><path d="M8.1 6.2 10.5 4.4 16.9 12 10.5 19.6 8.1 17.8 13 12Z"/><path d="M14.7 6.2 17.1 4.4 23.5 12 17.1 19.6 14.7 17.8 19.6 12Z"/>'),
    acc: svg('acc', '<path fill-rule="evenodd" d="M12 2A10 10 0 1 1 12 22 10 10 0 1 1 12 2ZM12 5.4A6.6 6.6 0 1 0 12 18.6 6.6 6.6 0 1 0 12 5.4Z"/><circle cx="12" cy="12" r="3.4"/>'),
  };
})();
function memberPortraitPath(spec) {
  if (!spec || !spec.sprite) return '';
  const prefix = spec.sprite.replace('_', '') + '_';
  return 'images/character/' + spec.sprite + '/' + prefix + '0000_Front.png';
}
function memberCondition(actor, safe) {
  if (actor.noncombat) return { text: '非戰鬥人員', cls: 'support' };
  if (safe) return { text: getTeam().includes(actor.type) ? '已編入' : '待命', cls: getTeam().includes(actor.type) ? 'ready' : 'standby' };
  if (!actor.live) return { text: '未部署', cls: 'standby' };
  if (TYPES[actor.type]?.guide && guideSP(actor.live) < SANITY.swayBelow) return { text: 'SP 偏低', cls: 'warning' };
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
    const combat = ((typeof ROSTER !== 'undefined') ? ROSTER : Object.keys(TYPES)).filter(type => TYPES[type]).map(type => ({ type, live: null }));
    const support = (typeof WANDERERS !== 'undefined' ? WANDERERS : []).map(profile => ({ type: profile.id, profile, live: null, noncombat: true }));
    return [...combat, ...support];
  }
  if (typeof G === 'undefined' || !G || !Array.isArray(G.towers)) return [];
  return [...G.towers.map(live => ({ type: live.type, live })),
    ...(G.npcs || []).filter(npc => npc.id === 'ball' && getTeam().includes('ball')).map(live => ({ type: live.id, live, noncombat: true }))];
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
  const live = actor.live || (typeof vitalsOf === 'function' ? vitalsOf(actor.type) : null);   // 應變中心：看記住的 HP、負荷（不在這張地圖的人也看得到，js/vitals.js）
  const hp = live ? Math.max(0, Math.round(live.hp)) : spec.hp, maxhp = live ? live.maxhp : spec.hp;
  const taint = live ? Math.max(0, Math.min(100, Math.round(live.taint || 0))) : 0;
  const condition = memberCondition(actor, safe);
  const support = spec.guide ? '疏導 ' + Math.round(spec.aura.rate * 10) / 10 + '/秒' : (spec.splash > 0 ? '範圍 ' + spec.splash.toFixed(1) + ' 格' : '單體攻擊');
  const learned = typeof training !== 'undefined' && training.skills ? (training.skills[actor.type] || []).length : 0;
  const trainingAction = typeof SKILL_TREES !== 'undefined' && !SKILL_TREES[actor.type]
    ? '<button class="squad-upgrade squad-skill-btn" disabled>技能樹<small>還沒有技能樹（data/skills.js）</small></button>'   // 新加入的隊員還沒設計技能樹
    : '<button class="squad-upgrade squad-skill-btn" data-skill-tree="' + actor.type + '">技能樹<small>已學 ' + learned + ' / ' + (typeof SKILL_TOTAL !== 'undefined' ? SKILL_TOTAL : 10) + (safe ? '' : '・回基地才能學') + '</small></button>';
  const loadBar = spec.guide
    ? '<div><span>SP <b>' + Math.floor(guideSPFor(actor.type)) + ' / ' + guideSPMax() + '</b></span><i class="sp-bar"><u style="width:' + (guideSPFor(actor.type) / guideSPMax() * 100) + '%"></u></i></div>'
    : '<div><span>負荷 <b>' + taint + ' / 100</b></span><i class="taint-bar"><u style="width:' + taint + '%"></u></i></div>';
  return '<article class="squad-card squad-card-combat" style="--member-color:' + spec.color + '">' +
    '<span class="squad-portrait"><img src="' + memberPortraitPath(spec) + '" alt="' + spec.name + '"></span>' +   // 頭像框：放大顯示上半身（半身像）
    '<div class="squad-member-main">' +
      '<div class="squad-member-head"><div><strong>' + spec.name + roleIconHtml(spec) + '</strong><span>' + spec.role + '・' + (spec.guide ? '疏導能力' : '異能力') + '：' + spec.ability + '</span></div><em class="member-condition ' + condition.cls + '">' + condition.text + '</em></div>' +
      '<div class="squad-bars"><div><span>HP <b>' + hp + ' / ' + maxhp + '</b></span><i class="hp-bar"><u style="width:' + Math.max(0, Math.min(100, hp / maxhp * 100)) + '%"></u></i></div>' +
      loadBar + '</div>' + (typeof sortieActiveHtml === 'function' ? sortieActiveHtml(actor.type) : '') +
      '<dl class="squad-stats"><div><dt>' + STAT_ICON.atk + '攻擊</dt><dd>' + (spec.noAttack ? '—' : spec.dmg) + '</dd></div><div><dt>' + STAT_ICON.def + '防禦</dt><dd>' + Math.round((spec.defense || 0) * 100) + '%</dd></div><div><dt>' + STAT_ICON.range + '射程</dt><dd>' + spec.range.toFixed(1) + ' 格</dd></div><div><dt>' + STAT_ICON.rate + '攻速</dt><dd>' + spec.rate.toFixed(1) + '/秒</dd></div><div><dt>' + STAT_ICON.acc + '命中</dt><dd>' + Math.round(spec.accuracy * 100) + '%</dd></div><div class="wide"><dt>特性</dt><dd>' + (spec.trait || support) + '</dd></div></dl>' +
      '<div class="squad-card-actions"><button class="captain-impression-button" type="button" data-impression="' + actor.type + '">深入了解</button><div class="squad-training">' + trainingAction + '</div></div>' +
    '</div></article>';
}
function supportCard(actor) {
  const profile = actor.profile || (typeof WANDERERS !== 'undefined' ? WANDERERS.find(x => x.id === actor.type) : null);
  if (!profile) return '';
  const display = { name: profile.name, sprite: profile.sprite };
  return '<article class="squad-card squad-card-support" style="--member-color:#8292a3">' +
    '<span class="squad-portrait" data-char="' + actor.type + '"><img src="' + memberPortraitPath(display) + '" alt="' + profile.name + '"></span>' +   // data-char：個別角色的頭像裁切（css/style.css，例如球球）
    '<div class="squad-member-main">' +
      '<div class="squad-member-head"><div><strong>' + profile.name + '</strong><span>Y102編組・' + (actor.type === 'ball' ? '搜救犬' : '非戰鬥人員') + '</span></div><em class="member-condition support">' + (actor.type === 'ball' ? (getTeam().includes('ball') ? '已編入' : '待命') : '非戰鬥人員') + '</em></div>' +
      '<div class="support-assignment"><b>支援編制</b><span>' + (actor.type === 'ball' ? RESCUE_DOG_REQUIREMENT : '不參與戰鬥，沒有技能樹。') + '</span></div>' +
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
  squadPanel.querySelectorAll('[data-skill-tree]').forEach(button => button.addEventListener('click', () => { if (typeof openSkillTree === 'function') openSkillTree(button.dataset.skillTree); }));
  squadPanel.querySelectorAll('.captain-impression-button').forEach(button => button.addEventListener('click', () => openCaptainImpression(button.dataset.impression)));
  const list = squadPanel.querySelector('.squad-list'); if (list) list.scrollTop = scrollTop;
}
function openSquadPanel() { ensureTeamUI(); closeTeamPanel(); if (typeof closeAchievementPanel === 'function') closeAchievementPanel(); renderSquadPanel(); squadPanel.classList.remove('hidden'); squadBtn.classList.add('active'); if (typeof sfx === 'function') sfx('menu'); }
function closeSquadPanel() { if (squadPanel) squadPanel.classList.add('hidden'); if (squadBtn) squadBtn.classList.remove('active'); }
function isSquadPanelOpen() { return squadPanel && !squadPanel.classList.contains('hidden'); }

function closeFieldCommandMenu() { if (fieldCommandMenu) { fieldCommandMenu.classList.add('hidden'); fieldCommandMenu.dataset.type = ''; } }
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
  if (destination === 'escort') {   // 跟隨護衛（js/sentry.js 的 setSentryEscort）
    if (typeof sfx === 'function') sfx('button');
    setSentryEscort(member);
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
  if (!fieldCommandMenu.classList.contains('hidden') && fieldCommandMenu.dataset.type === type) { closeFieldCommandMenu(); return; }   // 再點同一個頭像＝關閉
  const escorting = member.mode === 'escort';
  fieldCommandMenu.innerHTML = '<div class="field-command-head"><strong>' + spec.name + roleIconHtml(spec) + '</strong>' +
    '<button type="button" class="field-command-close" aria-label="關閉選單">×</button></div>' +
    (unavailable ? '<p>' + (member.hp <= 0 ? '目前無法行動' : '暴走中，無法接受指令') + '</p>' :
    '<button type="button" class="field-command-option" data-destination="base">返回基地巡邏</button>' +
    '<button type="button" class="field-command-option' + (escorting ? ' active' : '') + '" data-destination="escort">跟隨護衛部隊長' + (escorting ? '<small>護衛中</small>' : '') + '</button>' +
    (spec.guide && !guideSPPractice() ? '<button type="button" class="field-command-option" data-guide-drink' + ((supplyInventory.get('almond-water') || 0) <= 0 || guideSP(member) >= guideSPMax() || member.soothingT > 0 || member.sleepT > 0 || member.frozenT > 0 || member.eatenBy ? ' disabled' : '') + '>喝杏仁水<small>背包 ' + (supplyInventory.get('almond-water') || 0) + ' 瓶・恢復 ' + supplyById('almond-water').restore + ' SP</small></button>' : ''));
  fieldCommandMenu.querySelector('.field-command-close').addEventListener('click', () => { if (typeof sfx === 'function') sfx('switch'); closeFieldCommandMenu(); });
  fieldCommandMenu.querySelectorAll('[data-destination]').forEach(button => button.addEventListener('click', () => commandFieldMember(type, button.dataset.destination)));
  fieldCommandMenu.querySelector('[data-guide-drink]')?.addEventListener('click', () => { drinkGuideAlmond(member, true); closeFieldCommandMenu(); });
  fieldCommandMenu.dataset.type = type;
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
  // 收合鈕和名單外框只建一次（每 0.3 秒只更新名單內容），收起／展開的動畫才不會被重畫打斷
  let list = fieldSquadHud.querySelector('.field-squad-list');
  if (!list) {
    fieldSquadHud.innerHTML = '<button class="hud-collapse" type="button"></button><div class="field-squad-fold"><div class="field-squad-list"></div></div>';
    list = fieldSquadHud.querySelector('.field-squad-list');
    applySquadCollapse();
  }
  list.innerHTML = ''.concat(
    (members.length ? members.map(member => {
      const spec = TYPES[member.type]; if (!spec) return '';
      const hp = Math.max(0, Math.round(member.hp || 0));
      const maxhp = Math.round(member.maxhp || spec.hp);
      const hpPercent = Math.max(0, Math.min(100, hp / maxhp * 100));
      const taint = Math.max(0, Math.min(100, Math.round(member.taint || 0)));
      const sp = spec.guide ? Math.floor(guideSP(member)) : 0;
      const lowSP = spec.guide && sp < SANITY.swayBelow;
      const loadWidth = spec.guide ? sp / guideSPMax() * 100 : taint;
      const sootheAction = '';   // 正式遊戲停用隊友欄的手動疏導按鈕（靠近哨兵仍可疏導）
      const stateLabel = hp <= 0 ? ''   // 倒下時不顯示汙染標籤，改由下方的「重傷」橫條說明
        : member.berserk
        ? '<em class="taint-tag berserk">暴走</em>'
        : (lowSP ? '<em class="taint-tag">頭暈</em>' : !spec.guide && taint > 85 ? '<em class="taint-tag danger">瀕臨暴走</em>' : '');
      const hasUlt = ((typeof ULTIMATES !== 'undefined') && ULTIMATES[member.type]) || spec.aura;   // 有大招（嚮導＝疏導）才顯示冷卻條
      const cdRemain = hasUlt ? ultCooldownRemain(member) : 0;
      const sc = spec.aura && typeof SOOTHE_COLORS !== 'undefined' && SOOTHE_COLORS[member.type];   // 嚮導的冷卻條用疏導的顏色
      const barStyle = sc ? 'background:rgb(' + sc.join(',') + ');box-shadow:0 0 4px rgb(' + sc.join(',') + ');' : '';
      const cdRing = hasUlt
        ? '<span class="field-cd-bar" data-type="' + member.type + '"' + (cdRemain > .001 ? '' : ' hidden') + '><i style="' + barStyle + 'width:' + (cdRemain * 100).toFixed(1) + '%"></i></span>'
        : '';
      const taintCls = hp <= 0 ? '' : member.berserk ? ' berserk' : (!spec.guide && taint > 85 ? ' danger' : '');   // 整個隊員框閃紅／紅色濾鏡
      // 這個面板每 0.3 秒重畫一次；用負的 animation-delay 對齊時鐘，閃爍才不會每次重畫就從頭開始
      const nowS = performance.now() / 1000;
      const syncStyle = taintCls ? ' style="--blink-sync:-' + (nowS % 1.1).toFixed(2) + 's;--blink-sync-fast:-' + (nowS % .38).toFixed(2) + 's"' : '';
      // 急救包選隊員（js/equipment.js）：發光（大小兩張圖交替淡入淡出）＋箭頭；滑鼠停在頭像上才看得到
      const aid = typeof firstAid !== 'undefined' ? firstAid : null;
      const aidPick = !!(aid && aid.picking);
      const aidCls = aidPick && aid.hover === member.type ? ' aid-hover' : '';
      const aidFx = aidPick ? '<span class="aid-glow" style="--aid-sync:-' + (nowS % 3.2).toFixed(2) + 's"><i class="s"></i><i class="m"></i></span><span class="aid-arrow"></span>' : '';
      return '<article class="field-member' + (hp <= 0 ? ' down' : '') + (lowSP ? ' sp-low' : '') + taintCls + aidCls + '" data-type="' + member.type + '"' + syncStyle + '>' + aidFx +
        '<button class="field-member-avatar" type="button" data-type="' + member.type + '" aria-label="命令' + spec.name + '" style="position:relative"><img src="' + memberPortraitPath(spec) + '" alt="' + spec.name + '">' + cdRing + '</button><div class="field-member-status"><b>' + spec.name + roleIconHtml(spec) + stateLabel + '</b>' +
        // 嚮導顯示 SP；哨兵顯示精神負荷。
        '<div><i class="field-hp" aria-label="HP"><u style="width:' + hpPercent + '%"></u></i><span class="field-bar-num">' + hp + '/' + maxhp + '</span></div>' +
        '<div><i class="' + (spec.guide ? 'field-sp' : 'field-load') + '" aria-label="' + (spec.guide ? 'SP' : '精神負荷') + '"><u style="width:' + loadWidth + '%"></u></i><span class="field-bar-num">' + (spec.guide ? sp + '/' + guideSPMax() : taint + '/100') + '</span></div>' +
        '</div>' + sootheAction +
        (hp <= 0 ? '<div class="field-down-banner">重傷｜失去戰鬥能力</div>' : '') +   // 倒下：資訊條上壓一條橫幅
        '</article>';
    }).join('') : '<p class="field-squad-empty">尚無出勤隊員</p>') +
    ((G.npcs || []).some(npc => npc.id === 'ball') && getTeam().includes('ball')
      ? '<article class="field-member field-member-support" data-type="ball"><span class="field-member-avatar" data-char="ball"><img src="' + memberPortraitPath(CHARACTERS.ball) + '" alt="球球"></span><div class="field-member-status"><b>球球</b><span>搜救犬・隨領犬員出勤</span></div></article>' : ''));
  fieldSquadHud.classList.remove('hidden');
}
// 隊員欄收起／展開：只切 class，CSS 負責滑順的動畫
function applySquadCollapse() {
  if (!fieldSquadHud) return;
  const picking = typeof firstAid !== 'undefined' && firstAid.picking;   // 用急救包選隊員時：先展開（選完恢復原狀）
  const folded = !!hudCollapsed.squad && !picking, btn = fieldSquadHud.querySelector('.hud-collapse');
  fieldSquadHud.classList.toggle('collapsed', folded);
  fieldSquadHud.classList.toggle('aid-picking', picking);
  if (btn) { btn.textContent = ''; btn.title = folded ? '展開隊員欄' : '收起隊員欄'; btn.setAttribute('aria-expanded', !folded); }
}
// 每幀更新隊員頭像的大招冷卻環（內緣藍線，隨充能繞一圈）
// 大招還要冷卻多久（1＝剛放完 → 0＝可以再放）。嚮導的「大招」就是疏導。
function ultCooldownRemain(member) {
  if (!member) return 0;
  const ult = typeof ULTIMATES !== 'undefined' && ULTIMATES[member.type];
  if (ult) return Math.max(0, Math.min(1, (member.ultCd || 0) / ult.cd));
  const spec = TYPES[member.type];
  if (spec && spec.aura && typeof SOOTHE_AURA_CD !== 'undefined') return Math.max(0, Math.min(1, (member.auraCd || 0) / SOOTHE_AURA_CD));
  return 0;
}
// 頭像框內上方的藍色冷卻條：剛放完大招是滿的，隨冷卻縮短，冷卻好就消失（每幀由 game.js 呼叫）
function updateFieldCdRings() {
  if (!fieldSquadHud || typeof G === 'undefined' || !G || !Array.isArray(G.towers)) return;
  for (const bar of fieldSquadHud.querySelectorAll('.field-cd-bar')) {
    const remain = ultCooldownRemain(G.towers.find(t => t.type === bar.dataset.type));
    bar.hidden = remain <= .001;
    bar.firstChild.style.width = (remain * 100).toFixed(1) + '%';
  }
}

const TEAM_PROFILES = Object.fromEntries(Object.values(CHARACTERS)
  .filter(character => character.intro)
  .map(character => [character.id, { intro: character.intro }]));
// 職業圖示：哨兵＝交叉雙劍、嚮導＝盾牌＋十字（白色剪影，CSS 加黑邊）；滑鼠停在上面會顯示「哨兵／嚮導」
const ROLE_ICON = { sentinel: 'images/ui/sentinel-swords.svg', guide: 'images/ui/guide-shield-plus.svg' };
function roleIconHtml(spec) {
  const label = spec.guide ? '嚮導' : '哨兵';
  return '<img class="role-icon" src="' + (spec.guide ? ROLE_ICON.guide : ROLE_ICON.sentinel) + '" alt="' + label + '" title="' + label + '">';
}
function renderTeamPanel() {
  const roster = (typeof ROSTER !== 'undefined') ? ROSTER : [];
  const cap = (typeof TEAM_SIZE !== 'undefined') ? TEAM_SIZE : 4;
  const team = getTeam();
  const memberCard = (id, selected) => {
    const spec = teamProfile(id) || {};
    const locked = id === 'ball' && !selected && !hasDogHandler(team);
    const role = id === 'ball' ? '搜救犬' : (spec.guide ? '嚮導・弱戰鬥＋隨身疏導' : '哨兵') + (RESCUE_DOG_HANDLERS.includes(id) ? '・領犬員' : '');
    const profile = TEAM_PROFILES[id] || {};
    return '<button class="team-pick' + (selected ? ' team-pick-selected' : '') + '" type="button" data-id="' + id + '"' + (locked ? ' disabled title="' + RESCUE_DOG_REQUIREMENT + '"' : '') + ' aria-label="' + (selected ? '移出' : '編入') + spec.name + '">' +
      '<span class="team-avatar-frame" data-char="' + id + '"><img class="team-avatar" src="' + memberPortraitPath(spec) + '" alt="' + spec.name + '正面圖"></span>' +
      '<span class="team-summary"><span class="team-name-line"><b>' + (spec.name || id) + '</b>' +
      '<span class="team-role">' + role + '</span></span>' +   // 評級（S／A 級）先不顯示
      '<span class="team-intro">' + (locked ? RESCUE_DOG_REQUIREMENT : profile.intro || spec.role || '') + '</span></span>' +
      '<span class="team-choice">' + (selected ? '移出 −' : locked ? '需領犬員' : '編入 ＋') + '</span></button>';
  };
  const available = roster.filter(id => !team.includes(id));
  const oldAvailable = teamPanel.querySelector('#teamAvailable'), availableScroll = oldAvailable ? oldAvailable.scrollTop : 0;
  const oldSelected = teamPanel.querySelector('#teamSelected'), selectedScroll = oldSelected ? oldSelected.scrollTop : 0;
  // Keep the animated dialog and backdrop mounted while the roster changes.
  if (!teamPanel.querySelector('.team-dialog')) {
    teamPanel.innerHTML =
    '<div class="team-dialog" role="dialog" aria-modal="true" aria-label="出勤配置">' +
    '<header class="team-dialog-head"><div class="team-title"><small>應變編組</small><div class="team-title-line"><h2>出勤配置</h2><p>選擇這次任務的出勤人員</p></div></div><span class="team-count"><small>已編入</small><b id="teamTotalCount"></b></span></header>' +
    '<div class="team-columns">' +
      '<section class="team-column"><h3>可選人員 <small id="teamAvailableCount"></small></h3><div class="team-list" id="teamAvailable">' +
      '</div></section>' +
      '<section class="team-column team-column-selected"><h3>已編入人員 <small id="teamSelectedCount"></small></h3><div class="team-list" id="teamSelected">' +
      '</div></section>' +
    '</div><footer class="team-dialog-footer"><span>點選左側編入，點選右側移出；補給格放零食飲料，出勤時吃掉</span><button id="teamDone" type="button">完成</button></footer>' +
    '</div>';
    teamPanel.querySelector('#teamAvailable').addEventListener('click', e => {
      const button = e.target.closest('.team-pick'); if (!button) return;
      const current = getTeam();
      if (button.dataset.id === 'ball' && !hasDogHandler(current)) return;
      if (current.length >= cap) {
        if (typeof sfx === 'function') sfx('error');
        if (typeof systemNotice === 'function') systemNotice('已滿編', true);
        return;
      }
      setTeam([...current, button.dataset.id]); renderTeamPanel();
    });
    teamPanel.querySelector('#teamSelected').addEventListener('click', e => {
      if (typeof handleSortieClick === 'function' && handleSortieClick(e)) return;   // 補給格（js/sortie-supply.js）
      const button = e.target.closest('.team-pick'); if (!button) return;
      if (!setTeam(getTeam().filter(id => id !== button.dataset.id))) return;
      if (typeof dropSortieLoadout === 'function') dropSortieLoadout(button.dataset.id);
      renderTeamPanel();
    });
    teamPanel.querySelector('#teamDone').addEventListener('click', () => { if (typeof sfx === 'function') sfx('button'); closeTeamPanel(); });
  }
  teamPanel.querySelector('#teamTotalCount').textContent = team.length + ' / ' + cap;
  teamPanel.querySelector('#teamAvailableCount').textContent = available.length;
  teamPanel.querySelector('#teamSelectedCount').textContent = team.length + ' / ' + cap;
  teamPanel.querySelector('#teamAvailable').innerHTML = available.length
    ? available.map(id => memberCard(id, false)).join('') : '<p class="team-empty">所有人員都已編入。</p>';
  teamPanel.querySelector('#teamSelected').innerHTML = team.length
    ? team.map(id => '<div class="team-member-wrap">' + memberCard(id, true) + (TYPES[id] && typeof sortieSlotsHtml === 'function' ? sortieSlotsHtml(id) : '') + '</div>').join('')
    : '<p class="team-empty">尚未編入人員，請從左側選擇。</p>';
  teamPanel.querySelector('#teamAvailable').scrollTop = availableScroll;
  teamPanel.querySelector('#teamSelected').scrollTop = selectedScroll;
}

// 只有在安全場景（基地）才顯示編隊按鈕
function updateTeamButton() {
  ensureTeamUI();
  const safe = (typeof MAP_SAFE !== 'undefined') && MAP_SAFE;
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

// 點選單以外的地方（頭像除外，頭像有自己的開關）就關閉隊員指令選單
document.addEventListener('pointerdown', e => {
  if (!fieldCommandMenu || fieldCommandMenu.classList.contains('hidden')) return;
  if (fieldCommandMenu.contains(e.target) || e.target.closest('.field-member-avatar')) return;
  closeFieldCommandMenu();
}, true);

// Esc 關閉面板
window.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;   // 關掉面板時 preventDefault：這次 Esc 用掉了（js/save.js 的 Esc 層級）
  if (isTeamPanelOpen()) { e.preventDefault(); closeTeamPanel(); }
  if (fieldCommandMenu && !fieldCommandMenu.classList.contains('hidden')) { e.preventDefault(); closeFieldCommandMenu(); return; }
  if (impressionPanel && !impressionPanel.classList.contains('hidden')) { e.preventDefault(); closeCaptainImpression(); return; }
  if (isSquadPanelOpen()) { e.preventDefault(); closeSquadPanel(); }
});

// 戰鬥中持續更新目前生命、負荷與狀態，不會因此暫停遊戲。
window.setInterval(() => {
  const safe = (typeof MAP_SAFE !== 'undefined') && MAP_SAFE;
  if (!safe) renderFieldSquadHud();
}, 300);
