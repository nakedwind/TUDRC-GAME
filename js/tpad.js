/* ===== 📱 T-Pad：像平板一樣的整合介面 =====
   ・下方資訊條（背包旁邊）的「T-Pad」按鈕或按 Tab 打開；Esc／Tab／點外面／點下方橫條 關掉。
     Tab 只用來開關 T-Pad，沒有其他功能（瀏覽器的「切換焦點」在 js/tab-key.js 擋掉）。
   ・主畫面：狀態列（時間、電量）、App 圖示、「目前任務」小卡片。
   ・點 App＝打開原本的介面（隊員、任務、成就、怪物圖鑑、設定…）；出勤配置只能在作戰桌開啟。
   ・要加新的 App：在下面的 TPAD_APPS 多加一項（open＝打開原本的介面、isOpen＝那個介面是不是開著；或 view＝直接畫在 T-Pad 螢幕裡；baseOnly＝只有基地能用；soon＝即將推出）。
   必須在 team.js、achievements.js、missions.js、bestiary.js、save.js 之後載入。
*/
const TPAD_ICON = (() => {
  const svg = body => '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' + body + '</svg>';
  return {
    squad: svg('<circle cx="8.5" cy="7.5" r="3.6"/><path d="M1.8 19.4C1.8 15.2 4.8 12.6 8.5 12.6 12.2 12.6 15.2 15.2 15.2 19.4Z"/><circle cx="16.6" cy="8.4" r="3"/><path d="M14.6 13.2C15.3 13 16 12.9 16.6 12.9 19.8 12.9 22.2 15.1 22.2 18.8H16.8C16.8 16.6 16 14.6 14.6 13.2Z"/>'),
    team: svg('<path fill-rule="evenodd" d="M6 3.8H18A2 2 0 0 1 20 5.8V20A2 2 0 0 1 18 22H6A2 2 0 0 1 4 20V5.8A2 2 0 0 1 6 3.8ZM7.4 9.4V11.2H9.2V9.4ZM10.8 9.6V11H16.6V9.6ZM7.4 13.6V15.4H9.2V13.6ZM10.8 13.8V15.2H16.6V13.8ZM7.4 17.8V19.6H9.2V17.8ZM10.8 18V19.4H14.6V18Z"/><path d="M9 1.8H15A1.2 1.2 0 0 1 16.2 3V6.6H7.8V3A1.2 1.2 0 0 1 9 1.8Z"/>'),
    mission: svg('<rect x="4" y="2" width="2.4" height="20.4" rx="1.1"/><path d="M6.4 3.2H19.4L16.6 8 19.4 12.8H6.4Z"/>'),
    achieve: svg('<path d="M6.6 2.8H17.4V9.4A5.4 5.4 0 0 1 6.6 9.4Z"/><path d="M6.6 4.4H3.4V6.8A4 4 0 0 0 7.2 10.8L7.4 9A2.2 2.2 0 0 1 5.4 6.8V6.4H6.6ZM17.4 4.4H20.6V6.8A4 4 0 0 1 16.8 10.8L16.6 9A2.2 2.2 0 0 0 18.6 6.8V6.4H17.4Z"/><rect x="10.6" y="14.2" width="2.8" height="4"/><rect x="7" y="18" width="10" height="3.4" rx="1"/>'),
    bestiary: svg('<path fill-rule="evenodd" d="M4.6 2.6H17.4A2 2 0 0 1 19.4 4.6V21.4H6.4A2.4 2.4 0 0 1 4 19V3.2A.6.6 0 0 1 4.6 2.6ZM12 6.6C9.2 6.6 7.4 9 7.4 10.4 7.4 11.8 9.2 14.2 12 14.2 14.8 14.2 16.6 11.8 16.6 10.4 16.6 9 14.8 6.6 12 6.6ZM12 8.6A1.8 1.8 0 1 0 12 12.2 1.8 1.8 0 1 0 12 8.6ZM6.4 17.6V19.4H17.4V17.6Z"/>'),
    settings: svg('<path fill-rule="evenodd" d="M10.3 1.8H13.7L14.2 4.6 16 5.4 18.4 3.8 20.8 6.2 19.2 8.6 20 10.4 22.8 10.9V14.3L20 14.8 19.2 16.6 20.8 19 18.4 21.4 16 19.8 14.2 20.6 13.7 23.4H10.3L9.8 20.6 8 19.8 5.6 21.4 3.2 19 4.8 16.6 4 14.8 1.2 14.3V10.9L4 10.4 4.8 8.6 3.2 6.2 5.6 3.8 8 5.4 9.8 4.6ZM12 8.6A4 4 0 1 0 12 16.6 4 4 0 1 0 12 8.6Z"/>'),
    map: svg('<path d="M2.4 5.4 8.2 3.2V18.8L2.4 21Z"/><path d="M9.6 3.2 14.4 5.2V20.8L9.6 18.8Z"/><path d="M15.8 5.2 21.6 3V18.6L15.8 20.8Z"/>'),
  };
})();
const tpadNeed = name => typeof window[name] === 'function' || (() => { try { return typeof eval(name) === 'function'; } catch (_) { return false; } })();
const TPAD_APPS = [
  { id: 'squad',    name: 'Y102隊員', color: '#3f7fd8', icon: TPAD_ICON.squad,    view: el => renderTPadSquadApp(el) },
  { id: 'mission',  name: '任務',     color: '#d9893b', icon: TPAD_ICON.mission,  view: el => renderMissionApp(el) },   // js/tpad-missions.js（出擊、承接委託還是在作戰桌）
  { id: 'achieve',  name: '成就',     color: '#c9a227', icon: TPAD_ICON.achieve,  view: el => renderAchievementApp(el) },   // view＝直接在 T-Pad 螢幕裡打開
  { id: 'bestiary', name: '怪物圖鑑', color: '#8a4fd1', icon: TPAD_ICON.bestiary, view: el => renderBestiaryApp(el) },
  { id: 'settings', name: '設定',     color: '#6b7a8c', icon: TPAD_ICON.settings, view: el => renderTPadSettingsApp(el) },
  { id: 'map',      name: '地圖',     color: '#3e8c4f', icon: TPAD_ICON.map,      soon: true },
];
let tpadEscDirect = false;   // 按 Esc 直接打開設定：在設定裡再按 Esc＝整個關掉
let tpadOpen = false, tpadEl = null, tpadLaunched = null, tpadClock = null, tpadView = null;   // tpadView：螢幕裡正在開的 App
// 共用原本的設定控制項，讓音量、存檔與頁籤的事件在 T-Pad 中照常運作。
function renderTPadSettingsApp(el) {
  const body = settingsMenu.querySelector('.settings-body');
  renderSettings();
  el.classList.add('tpad-settings-app');
  el.appendChild(body);
}
function restoreTPadSettingsApp() {
  const body = tpadEl?.querySelector('.tpad-settings-app > .settings-body');
  if (body) settingsMenu.querySelector('.settings-card').appendChild(body);
  tpadEl?.querySelector('.tpad-appbody')?.classList.remove('tpad-settings-app');
}
let tpadSquadSelected = null;
function tpadSquadSkills(type) {
  const spec = TYPES[type], safe = typeof MAP_SAFE !== 'undefined' && MAP_SAFE;
  if (!spec || !SKILL_TREES[type]) return '<p class="tpad-roster-empty">這名隊員的技能樹尚未開放。</p>';
  const owned = (training.skills[type] || []).length;
  const fragmentIcon = '<img class="tpad-fragment-icon" src="images/碎片鑰匙/anomalous-shard-ground-glow.png" alt="異質碎片">';
  const board = skillTreeHtml(type, { coin: fragmentIcon });   // 技能圖＋說明＋培養按鈕（js/skills.js）
  return '<section class="tpad-roster-skills"><div class="tpad-roster-skills-head"><span class="tpad-roster-skills-progress">已學 ' + owned + ' / ' + SKILL_TOTAL + '</span><h3>技能樹</h3>' +
    '<div class="tpad-roster-skills-actions">' +
    (owned ? '<button type="button" class="skill-reset" data-squad-reset>重置技能</button>' : '') + '</div></div>' +
    '<div class="tpad-skill-tree">' + board + '</div></section>';
}
function renderTPadSquadView(el, keepScroll = false) {
  const leftScroll = keepScroll ? el.querySelector('.tpad-roster-list')?.scrollTop || 0 : 0;
  const rightScroll = keepScroll ? el.querySelector('.tpad-roster-detail')?.scrollTop || 0 : 0;
  const safe = typeof MAP_SAFE !== 'undefined' && MAP_SAFE;
  const rosterPriority = ['red', 'avaren', 'theonie', 'amber'];
  const members = squadMembers().sort((a, b) => {
    const aRank = rosterPriority.indexOf(a.type), bRank = rosterPriority.indexOf(b.type);
    return (aRank < 0 ? rosterPriority.length : aRank) - (bRank < 0 ? rosterPriority.length : bRank);
  });
  if (!members.some(actor => actor.type === tpadSquadSelected)) tpadSquadSelected = members[0]?.type || null;
  const selected = members.find(actor => actor.type === tpadSquadSelected);
  el.classList.toggle('squad-safe', safe);
  const list = members.map(actor => {
    const spec = TYPES[actor.type] || actor.profile, name = spec?.name || actor.type;
    const status = memberCondition(actor, safe);
    const role = actor.noncombat ? (actor.type === 'ball' ? '搜救犬' : '支援') : (spec.guide ? '嚮導' : '哨兵');
    const roleIcon = actor.noncombat ? '' : roleIconHtml(spec);
    return '<button type="button" class="tpad-roster-member' + (actor.type === tpadSquadSelected ? ' selected' : '') + '" data-squad-member="' + actor.type + '" aria-pressed="' + (actor.type === tpadSquadSelected) + '">' +
      '<span class="tpad-roster-avatar" data-char="' + actor.type + '"><img src="' + memberPortraitPath(spec) + '" alt=""></span>' +
      '<span class="tpad-roster-info"><span class="tpad-roster-name-line"><b>' + name + '</b>' + roleIcon + '<span class="tpad-roster-role-label">' + role + '</span></span>' +
      '<small>' + status.text + '</small></span></button>';
  }).join('');
  const detail = selected ? (selected.noncombat ? supportCard(selected) + '<p class="tpad-roster-empty">支援人員沒有戰鬥數值或技能樹。</p>' : squadCard(selected, safe) + tpadSquadSkills(selected.type)) : '<p class="tpad-roster-empty">本次任務沒有攜帶隊員。</p>';
  el.innerHTML = '<div class="tpad-roster"><aside class="tpad-roster-side"><div class="tpad-roster-side-head"><small>Y102 RESPONSE UNIT</small><b>隊員名單</b><span>' + members.length + ' 人</span></div>' +
    '<div class="tpad-roster-list">' + list + '</div></aside><main class="tpad-roster-detail">' + detail + '</main></div>';
  // 能力留在姓名旁，特性則作為數值列最右側的欄位。
  const card = el.querySelector('.tpad-roster-detail .squad-card-combat');
  if (card) {
    const head = card.querySelector('.squad-member-head');
    const status = head?.querySelector('.member-condition');
    const impression = card.querySelector('.captain-impression-button');
    if (head && status && impression) {
      const summary = head.firstElementChild;
      const ability = summary?.querySelector('span');
      const traitRow = card.querySelector('.squad-stats .wide');
      if (summary && ability && traitRow) {
        summary.classList.add('tpad-member-summary');
        ability.classList.add('tpad-member-ability');
        const meta = document.createElement('span');
        meta.className = 'tpad-member-meta';
        meta.appendChild(ability);
        summary.appendChild(meta);
        const bars = card.querySelector('.squad-bars');
        if (bars) {
          const barsWrap = document.createElement('div');
          barsWrap.className = 'tpad-member-bars';
          barsWrap.appendChild(bars);
          summary.appendChild(barsWrap);
        }
        traitRow.classList.add('tpad-member-trait-stat');
      }
      const actions = document.createElement('div');
      actions.className = 'tpad-member-head-actions';
      actions.append(status, impression);
      head.appendChild(actions);
      card.querySelector('.squad-card-actions')?.remove();
    }
  }
  el.querySelector('.tpad-roster-list').scrollTop = leftScroll;
  el.querySelector('.tpad-roster-detail').scrollTop = rightScroll;
}
function renderTPadSquadApp(el) {
  ensureTeamUI();
  el.classList.add('tpad-squad-app');
  if (!el._squadBound) {
    el._squadBound = true;
    el.addEventListener('click', e => {
      if (tpadView !== 'squad') return;
      const member = e.target.closest('[data-squad-member]');
      if (member) {
        const listScroll = el.querySelector('.tpad-roster-list')?.scrollTop || 0;
        tpadSquadSelected = member.dataset.squadMember;
        renderTPadSquadView(el);
        el.querySelector('.tpad-roster-list').scrollTop = listScroll;
        if (typeof sfx === 'function') sfx('switch');
        return;
      }
      const skillHit = typeof handleSkillTreeClick === 'function' ? handleSkillTreeClick(tpadSquadSelected, e.target) : null;   // 點技能圖示＝看說明、按培養＝學（js/skills.js）
      if (skillHit) { if (skillHit !== 'fail') renderTPadSquadView(el, true); return; }
      if (e.target.closest('[data-squad-reset]')) {
        if (!confirm('重置 ' + TYPES[tpadSquadSelected].name + ' 的技能？學技能花掉的碎片會全部退回。')) return;
        const refund = resetSkills(tpadSquadSelected);
        if (typeof systemNotice === 'function') systemNotice('已重置技能，退回 ◆ ' + refund);
        if (typeof sfx === 'function') sfx('switch');
        renderTPadSquadView(el, true);
        return;
      }
      const impression = e.target.closest('[data-impression]');
      if (impression) openCaptainImpression(impression.dataset.impression);
    });
  }
  renderTPadSquadView(el);
}
function restoreTPadSquadApp() {
  if (typeof closeSkillTree === 'function') closeSkillTree();
  if (typeof closeCaptainImpression === 'function') closeCaptainImpression();
  const body = tpadEl?.querySelector('.tpad-appbody');
  body?.classList.remove('tpad-squad-app', 'squad-safe');
}
function ensureTPad() {
  if (tpadEl) return;
  tpadEl = document.createElement('div'); tpadEl.id = 'tpad'; tpadEl.className = 'hidden';
  tpadEl.innerHTML = '<div class="tpad-device" role="dialog" aria-modal="true" aria-label="T-Pad"><div class="tpad-cam"></div><div class="tpad-screen">' +
    '<div class="tpad-status"><b>Y102 T-Pad</b><span class="tpad-time"></span><span class="tpad-batt"><i></i><svg class="tpad-signal" viewBox="0 0 22 16" role="img" aria-label="網路訊號"><path d="M2 14h2v-3H2zM7 14h2V8H7zM12 14h2V5h-2zM17 14h2V2h-2z" fill="currentColor"/><line x1="1" y1="2" x2="21" y2="15"/></svg><span class="tpad-network-label">應變中心網路</span></span></div>' +
    '<div class="tpad-home"><div class="tpad-widget"></div><div class="tpad-apps"></div></div>' +
    '<div class="tpad-appview" hidden><header class="tpad-apphead"><button type="button" class="tpad-back">‹ 主畫面</button><b class="tpad-apptitle"></b><span></span></header><div class="tpad-appbody"></div></div>' +
    '<div class="tpad-toast" hidden></div><button type="button" class="tpad-home-btn" aria-label="關閉 T-Pad（Esc）"></button></div></div>';
  tpadEl.addEventListener('click', e => {
    if (e.target === tpadEl) { closeTPad(); return; }
    if (e.target.closest('.tpad-home-btn, .tpad-back')) { tpadView ? showTPadHome() : closeTPad(); return; }   // 在 App 裡＝回主畫面
    const b = e.target.closest('[data-app]'); if (b) launchTPadApp(b.dataset.app);
  });
  document.getElementById('wrap').appendChild(tpadEl);
}
function renderTPad() {
  const safe = typeof MAP_SAFE !== 'undefined' && MAP_SAFE;
  tpadEl.querySelector('.tpad-apps').innerHTML = TPAD_APPS.map(a => {
    const off = a.soon || (a.baseOnly && !safe);
    return '<button type="button" class="tpad-app' + (off ? ' off' : '') + '" data-app="' + a.id + '"><span class="tpad-ico" style="--app:' + a.color + '">' + a.icon + '</span><b>' + a.name + '</b>' +
      (a.soon ? '<em>即將推出</em>' : a.baseOnly && !safe ? '<em>基地限定</em>' : '') + '</button>';
  }).join('');
  // 小卡片：目前任務（跟畫面左上的任務文字一樣）＋所在地
  const mission = (document.getElementById('missionText')?.textContent || '').replace(/^目前任務：/, '').trim();
  const where = typeof MAP !== 'undefined' && MAP ? MAP.name : '';
  tpadEl.querySelector('.tpad-widget').innerHTML = '<small>目前任務</small><b>' + (mission || '—') + '</b>' + (where ? '<span>📍 ' + where + (safe ? '（基地）' : '（戰鬥區域）') + '</span>' : '');
  updateTPadClock();
}
function updateTPadClock() {
  if (!tpadEl) return;
  const d = new Date(), z = n => String(n).padStart(2, '0');
  tpadEl.querySelector('.tpad-time').textContent = z(d.getHours()) + ':' + z(d.getMinutes());
  const safe = typeof MAP_SAFE !== 'undefined' && MAP_SAFE;
  const connection = tpadEl.querySelector('.tpad-batt');
  connection.classList.toggle('offline', !safe);
  connection.querySelector('.tpad-network-label').textContent = safe ? '應變中心網路' : '無訊號';
  connection.querySelector('.tpad-signal').setAttribute('aria-label', safe ? '網路訊號' : '無網路訊號');
}
function openTPad() {
  if (typeof G === 'undefined' || !G || !G.player || G.over) return;
  const ov = document.getElementById('overlay'); if (ov && getComputedStyle(ov).display !== 'none' && !ov.classList.contains('hidden')) return;   // 開始畫面：還不能用
  ensureTPad(); tpadOpen = true; tpadLaunched = null;
  if (typeof keys !== 'undefined') Object.keys(keys).forEach(k => { keys[k] = false; });
  showTPadHome(true); renderTPad(); tpadEl.classList.remove('hidden'); tpadEl.classList.remove('leaving');
  clearInterval(tpadClock); tpadClock = setInterval(updateTPadClock, 10000);
  if (typeof sfx === 'function') sfx('menu');
  document.getElementById('hudTpadButton')?.classList.add('active');
}
// Esc：打開 T-Pad 並直接進設定；打不開（開始畫面）回傳 false
function openTPadSettings() {
  if (!tpadOpen) openTPad(); if (!tpadOpen) return false;
  if (tpadView !== 'settings') launchTPadApp('settings');
  tpadEscDirect = true; return true;
}
function closeTPad(silent = false) {
  if (!tpadOpen) return;
  flushTPadClosing();
  if (tpadView === 'settings') restoreTPadSettingsApp();
  if (tpadView === 'squad') restoreTPadSquadApp();
  tpadEl.querySelector('.tpad-appbody').replaceChildren();
  tpadView = null;
  tpadOpen = false; tpadEl.classList.add('hidden'); clearInterval(tpadClock);
  if (!silent && typeof sfx === 'function') sfx('switch');
  document.getElementById('hudTpadButton')?.classList.remove('active');
}
// 螢幕裡的 App：打開（從圖示放大出來）／回主畫面
function showTPadApp(a) {
  flushTPadClosing();
  const view = tpadEl.querySelector('.tpad-appview'), home = tpadEl.querySelector('.tpad-home');
  if (tpadView === 'settings') restoreTPadSettingsApp();
  if (tpadView === 'squad') restoreTPadSquadApp();
  const body = view.querySelector('.tpad-appbody');
  body.replaceChildren();
  tpadView = a.id;
  view.querySelector('.tpad-apptitle').textContent = a.name;
  view.style.setProperty('--app', a.color);
  const ico = tpadEl.querySelector('[data-app="' + a.id + '"] .tpad-ico'), scr = tpadEl.querySelector('.tpad-screen');
  if (ico) { const r = ico.getBoundingClientRect(), b = scr.getBoundingClientRect(); view.style.transformOrigin = (r.left + r.width / 2 - b.left) + 'px ' + (r.top + r.height / 2 - b.top) + 'px'; }
  a.view(body);
  home.hidden = true; view.hidden = false; view.classList.remove('opening'); view.classList.add('pre-open'); void view.offsetWidth;   // 先排版（第一次打開比較花時間）
  requestAnimationFrame(() => { view.classList.remove('pre-open'); view.classList.add('opening'); });   // 下一格才開始動畫，動畫才不會一開始就卡一下
  if (typeof sfx === 'function') sfx('blip');
}
// 回主畫面：App 縮回它的圖示、主畫面從後面浮出來（像 iPad）；silent＝不播音效也不播動畫（關掉／重開 T-Pad 時）
function showTPadHome(silent = false) {
  if (!tpadEl) return;
  flushTPadClosing();
  const was = tpadView; tpadView = null; tpadEscDirect = false;
  const view = tpadEl.querySelector('.tpad-appview'), home = tpadEl.querySelector('.tpad-home');
  const finish = () => {
    view._finish = null; clearTimeout(view._t);
    if (was === 'settings') restoreTPadSettingsApp();
    if (was === 'squad') restoreTPadSquadApp();
    view.querySelector('.tpad-appbody').replaceChildren();
    view.hidden = true; view.classList.remove('opening', 'closing');
  };
  home.hidden = false;
  if (!was || silent) { finish(); return; }
  view.classList.remove('opening'); void view.offsetWidth; view.classList.add('closing');
  home.classList.remove('returning'); void home.offsetWidth; home.classList.add('returning');
  view._finish = finish; view._t = setTimeout(finish, 260);
  if (typeof sfx === 'function') sfx('blip');
}
// 縮回去的動畫還沒播完就又打開別的 App／關掉 T-Pad：直接收尾
function flushTPadClosing() { const view = tpadEl && tpadEl.querySelector('.tpad-appview'); if (view && view._finish) view._finish(); }
function tpadToast(msg) {
  const t = tpadEl.querySelector('.tpad-toast'); t.textContent = msg; t.hidden = false;
  clearTimeout(t._h); t._h = setTimeout(() => { t.hidden = true; }, 1600);
  if (typeof sfx === 'function') sfx('error');
}
function launchTPadApp(id) {
  const a = TPAD_APPS.find(x => x.id === id); if (!a) return;
  if (a.soon) { tpadToast('「' + a.name + '」即將推出'); return; }
  if (a.baseOnly && !(typeof MAP_SAFE !== 'undefined' && MAP_SAFE)) { tpadToast('「' + a.name + '」回到基地才能使用'); return; }
  if (a.view) { showTPadApp(a); return; }
  closeTPad(true);
  try { a.open(); } catch (e) { console.warn('T-Pad：打不開', id, e); openTPad(); return; }
  tpadLaunched = a;   // 這個 App 關掉之後回到 T-Pad 主畫面
}
// 從 T-Pad 打開的介面關掉了：回到主畫面
setInterval(() => {
  if (!tpadLaunched || tpadOpen) return;
  let open = true; try { open = tpadLaunched.isOpen(); } catch (_) { open = false; }
  if (!open) { tpadLaunched = null; openTPad(); }
}, 150);
// 按鍵：Tab 開關；開著的時候 Esc 關掉，其他按鍵不要傳給遊戲（不然溫特會走動、開槍）
// 在打字的地方（文字輸入框）按 Tab：什麼都不做；拉桿、勾選框不算打字，Tab 照樣開關
const TPAD_TYPING = 'textarea, [contenteditable], input:not([type="range"]):not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="color"])';
window.addEventListener('keydown', e => {
  const k = (e.key || '').toLowerCase();
  if (k === 'tab') {   // Tab：只用來開關 T-Pad，不再傳給其他按鍵處理
    e.preventDefault(); e.stopImmediatePropagation();
    if (e.repeat || e.ctrlKey || e.altKey || e.metaKey) return;
    if (e.target instanceof Element && e.target.closest(TPAD_TYPING)) return;
    if (tpadOpen) { closeTPad(); return; }
    if (typeof dialogueState !== 'undefined' && dialogueState) return;
    if (typeof backpackOpen !== 'undefined' && backpackOpen) return;
    if (TPAD_APPS.some(a => { if (!a.isOpen) return false; try { return a.isOpen && a.isOpen(); } catch (_) { return false; } })) return;   // 其他介面開著：不要蓋上去
    tpadLaunched = null; openTPad(); return;
  }
  if (e.target instanceof Element && e.target.closest('input, textarea, select, [contenteditable]')) return;
  if (tpadOpen) {
    if (k === 'escape' && tpadView === 'squad') {
      const impression = document.getElementById('captainImpressionPanel');
      const skills = document.getElementById('skillTreePanel');
      if (impression && !impression.classList.contains('hidden')) { closeCaptainImpression(); e.preventDefault(); e.stopImmediatePropagation(); return; }
      if (skills && !skills.classList.contains('hidden')) { closeSkillTree(); e.preventDefault(); e.stopImmediatePropagation(); return; }
    }
    if (tpadView === 'bestiary' && (k === 'arrowleft' || k === 'arrowright')) bestiaryAppStep(tpadEl.querySelector('.tpad-appbody'), k === 'arrowright' ? 1 : -1);   // 怪物圖鑑：←→ 換一隻
    else if (k === 'escape' && tpadView === 'settings' && tpadEscDirect) closeTPad();   // Esc 打開的設定：再按 Esc 直接關掉
    else if (k === 'escape' && tpadView) showTPadHome();   // App 裡按 Esc＝回主畫面
    else if (k === 'escape') closeTPad();
    e.preventDefault(); e.stopImmediatePropagation();
  }
}, true);
document.getElementById('hudTpadButton')?.addEventListener('click', () => tpadOpen ? closeTPad() : openTPad());

// ---- 先把隊員畫面要用的圖片載好（第一次打開隊員畫面就不會卡一下）----
// 遊戲開好後趁瀏覽器有空時慢慢載：所有角色的正面頭像、異質碎片圖示、哨兵／嚮導圖示；decode()＝順便先解碼，顯示時不用再算
const tpadPreloaded = [];   // 留著參考，圖片才不會被瀏覽器丟掉
function preloadTPadImages() {
  const srcs = new Set(['images/碎片鑰匙/anomalous-shard-ground-glow.png', 'images/ui/sentinel-swords.svg', 'images/ui/guide-shield-plus.svg']);
  for (const c of Object.values(typeof CHARACTERS !== 'undefined' ? CHARACTERS : {})) if (c && c.sprite && typeof memberPortraitPath === 'function') srcs.add(memberPortraitPath(c));
  const list = [...srcs];
  const next = () => {
    const src = list.shift(); if (!src) { idle(prewarmTPadSquad); return; }   // 圖片都載完：再把隊員畫面先預排一次
    const img = new Image(); img.src = src; tpadPreloaded.push(img);
    (img.decode ? img.decode() : Promise.resolve()).catch(() => {}).finally(() => idle(next));
  };
  const idle = fn => (window.requestIdleCallback ? requestIdleCallback(fn, { timeout: 1500 }) : setTimeout(fn, 30));
  idle(next);
}
if (document.readyState === 'complete') setTimeout(preloadTPadImages, 1500); else window.addEventListener('load', () => setTimeout(preloadTPadImages, 1500));

// 預排隊員畫面：瀏覽器第一次替這個畫面排版、套樣式比較慢（約 20～40 毫秒），趁空閒在看不見的地方先做一次，之後真的打開就順了
let tpadPrewarmed = false;
function prewarmTPadSquad() {
  if (tpadPrewarmed || tpadOpen || typeof G === 'undefined' || !G || !G.player) { if (!tpadPrewarmed) setTimeout(prewarmTPadSquad, 3000); return; }
  const a = TPAD_APPS.find(x => x.id === 'squad'); if (!a || !a.view) return;
  tpadPrewarmed = true;
  try {
    ensureTPad();
    const view = tpadEl.querySelector('.tpad-appview'), home = tpadEl.querySelector('.tpad-home'), body = view.querySelector('.tpad-appbody');
    tpadEl.style.visibility = 'hidden'; tpadEl.classList.remove('hidden'); home.hidden = true; view.hidden = false;
    a.view(body); void body.offsetHeight;   // 排版一次（看不見）
    body.replaceChildren(); restoreTPadSquadApp();
    view.hidden = true; home.hidden = false; tpadEl.classList.add('hidden'); tpadEl.style.visibility = '';
  } catch (e) { if (tpadEl) { tpadEl.classList.add('hidden'); tpadEl.style.visibility = ''; } }
}
