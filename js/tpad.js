/* ===== 📱 T-Pad：像平板一樣的整合介面 =====
   ・下方資訊條（背包旁邊）的「T-Pad」按鈕或按 T 打開；Esc／T／點外面／點下方橫條 關掉。
   ・主畫面：狀態列（時間、電量）、App 圖示、「目前任務」小卡片。
   ・點 App＝打開原本的介面（隊員、出勤配置、任務、成就、怪物圖鑑、設定…）；那個介面關掉後自動回到 T-Pad 主畫面。
   ・要加新的 App：在下面的 TPAD_APPS 多加一項（open＝打開的函式、isOpen＝現在是不是開著；baseOnly＝只有基地能用；soon＝即將推出）。
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
  { id: 'squad',    name: 'Y102隊員', color: '#3f7fd8', icon: TPAD_ICON.squad,    open: () => openSquadPanel(),       isOpen: () => typeof isSquadPanelOpen === 'function' && isSquadPanelOpen() },
  { id: 'team',     name: '出勤配置', color: '#2f9e8f', icon: TPAD_ICON.team,     open: () => openTeamPanel(),        isOpen: () => typeof isTeamPanelOpen === 'function' && isTeamPanelOpen(), baseOnly: true },
  { id: 'mission',  name: '任務',     color: '#d9893b', icon: TPAD_ICON.mission,  open: () => openMissionBoard(),     isOpen: () => typeof missionBoardOpen !== 'undefined' && missionBoardOpen },
  { id: 'achieve',  name: '成就',     color: '#c9a227', icon: TPAD_ICON.achieve,  open: () => openAchievementPanel(), isOpen: () => typeof isAchievementPanelOpen === 'function' && isAchievementPanelOpen() },
  { id: 'bestiary', name: '怪物圖鑑', color: '#8a4fd1', icon: TPAD_ICON.bestiary, open: () => openBestiary(),         isOpen: () => typeof bestiaryOpen !== 'undefined' && bestiaryOpen },
  { id: 'settings', name: '設定',     color: '#6b7a8c', icon: TPAD_ICON.settings, open: () => openSettings(),         isOpen: () => typeof settingsOpen !== 'undefined' && settingsOpen },
  { id: 'map',      name: '地圖',     color: '#3e8c4f', icon: TPAD_ICON.map,      soon: true },
];
let tpadOpen = false, tpadEl = null, tpadLaunched = null, tpadClock = null;
function ensureTPad() {
  if (tpadEl) return;
  tpadEl = document.createElement('div'); tpadEl.id = 'tpad'; tpadEl.className = 'hidden';
  tpadEl.innerHTML = '<div class="tpad-device" role="dialog" aria-modal="true" aria-label="T-Pad"><div class="tpad-cam"></div><div class="tpad-screen">' +
    '<div class="tpad-status"><b>Y102 T-Pad</b><span class="tpad-time"></span><span class="tpad-batt"><i></i>應變中心網路</span></div>' +
    '<div class="tpad-home"><div class="tpad-widget"></div><div class="tpad-apps"></div></div>' +
    '<div class="tpad-toast" hidden></div><button type="button" class="tpad-home-btn" aria-label="關閉 T-Pad（Esc）"></button></div></div>';
  tpadEl.addEventListener('click', e => {
    if (e.target === tpadEl || e.target.closest('.tpad-home-btn')) { closeTPad(); return; }
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
}
function openTPad() {
  if (typeof G === 'undefined' || !G || !G.player || G.over) return;
  ensureTPad(); tpadOpen = true; tpadLaunched = null;
  if (typeof keys !== 'undefined') Object.keys(keys).forEach(k => { keys[k] = false; });
  renderTPad(); tpadEl.classList.remove('hidden'); tpadEl.classList.remove('leaving');
  clearInterval(tpadClock); tpadClock = setInterval(updateTPadClock, 10000);
  if (typeof sfx === 'function') sfx('menu');
  document.getElementById('hudTpadButton')?.classList.add('active');
}
function closeTPad(silent = false) {
  if (!tpadOpen) return;
  tpadOpen = false; tpadEl.classList.add('hidden'); clearInterval(tpadClock);
  if (!silent && typeof sfx === 'function') sfx('switch');
  document.getElementById('hudTpadButton')?.classList.remove('active');
}
function tpadToast(msg) {
  const t = tpadEl.querySelector('.tpad-toast'); t.textContent = msg; t.hidden = false;
  clearTimeout(t._h); t._h = setTimeout(() => { t.hidden = true; }, 1600);
  if (typeof sfx === 'function') sfx('error');
}
function launchTPadApp(id) {
  const a = TPAD_APPS.find(x => x.id === id); if (!a) return;
  if (a.soon) { tpadToast('「' + a.name + '」即將推出'); return; }
  if (a.baseOnly && !(typeof MAP_SAFE !== 'undefined' && MAP_SAFE)) { tpadToast('「' + a.name + '」回到基地才能使用'); return; }
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
// 按鍵：T 開關；開著的時候 Esc 關掉，其他按鍵不要傳給遊戲（不然溫特會走動、開槍）
window.addEventListener('keydown', e => {
  const k = (e.key || '').toLowerCase();
  if (e.target instanceof Element && e.target.closest('input, textarea, select, [contenteditable]')) return;
  if (tpadOpen) {
    if (k === 'escape' || (k === 't' && !e.repeat)) closeTPad();
    e.preventDefault(); e.stopImmediatePropagation(); return;
  }
  if (k !== 't' || e.repeat || e.ctrlKey || e.altKey || e.metaKey) return;
  if (typeof dialogueState !== 'undefined' && dialogueState) return;
  if (typeof backpackOpen !== 'undefined' && backpackOpen) return;
  if (TPAD_APPS.some(a => { try { return a.isOpen && a.isOpen(); } catch (_) { return false; } })) return;   // 其他介面開著：不要蓋上去
  e.preventDefault(); e.stopImmediatePropagation(); tpadLaunched = null; openTPad();
}, true);
document.getElementById('hudTpadButton')?.addEventListener('click', () => tpadOpen ? closeTPad() : openTPad());
