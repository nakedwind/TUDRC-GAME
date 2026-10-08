// ============================================================
//  存檔與設定
//  ・存檔：背包、購物車、好感度存在這台電腦的瀏覽器（localStorage），重新整理也不會不見。
//          異質碎片／哨兵等級、出勤隊伍、成就本來就各自存好，按「立即存檔」會一起存一次。
//          自動存檔：東西有變動就會自動存（每 5 秒檢查一次），關掉網頁前也會存。
//  ・設定：音樂、音效音量，右上角齒輪打開（或按 Esc）。
// ============================================================
const SAVE_KEY = 'tudrc-save-v1';
const SETTINGS_KEY = 'tudrc-settings-v1';
const SFX_MAX = 0.5;   // 音效 100% 時的實際音量

// ---------- 設定（音量） ----------
const SETTINGS = { music: 50, sfx: 70 };   // 0～100
try { Object.assign(SETTINGS, JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}')); } catch (_) {}
function applySettings() {
  MUSIC.volume = SETTINGS.music / 100;
  SFX.volume = SETTINGS.sfx / 100 * SFX_MAX;
}
function saveSettings() { try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(SETTINGS)); } catch (_) {} }
applySettings();

// ---------- 存檔 ----------
let lastSavedAt = 0, lastSavedSnapshot = '';
const saveSnapshot = () => JSON.stringify({ inventory: [...supplyInventory], cart: [...shopCart], favor: favorPoints, giftKnown, gifted: [...giftedThisVisit] });
function saveGame(manual = false) {
  try {
    const snap = saveSnapshot();
    localStorage.setItem(SAVE_KEY, JSON.stringify({ v: 1, savedAt: Date.now(), ...JSON.parse(snap) }));
    lastSavedSnapshot = snap; lastSavedAt = Date.now();
    if (typeof saveTraining === 'function') saveTraining();
    if (typeof saveAchievements === 'function') saveAchievements();
    if (manual) { systemNotice('💾 已存檔'); sfx('button'); }
  } catch (_) {
    if (manual) { systemNotice('存檔失敗：瀏覽器不允許儲存', true); sfx('error'); }
  }
  renderSaveInfo();
}
function loadGame() {
  let data = null;
  try { data = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); } catch (_) {}
  if (!data) return;
  const valid = ([id, n]) => itemById(id) && Number.isInteger(n) && n > 0;   // 已經刪掉的物品就不讀
  supplyInventory.clear(); (data.inventory || []).filter(valid).forEach(([id, n]) => supplyInventory.set(id, n));
  shopCart.clear(); (data.cart || []).filter(valid).forEach(([id, n]) => shopCart.set(id, n));
  Object.assign(favorPoints, data.favor || {}); Object.assign(giftKnown, data.giftKnown || {});   // 好感度（js/gifts.js）
  (data.gifted || []).forEach(id => giftedThisVisit.add(id));
  lastSavedAt = data.savedAt || 0; lastSavedSnapshot = saveSnapshot();
  if (typeof G !== 'undefined' && G) updateHUD();
}
// 遊戲程式（js/game.js）都載入完才讀檔
window.addEventListener('DOMContentLoaded', loadGame);
setInterval(() => { if (saveSnapshot() !== lastSavedSnapshot) saveGame(); }, 5000);   // 自動存檔
window.addEventListener('beforeunload', () => saveGame());

// ---------- 設定選單 ----------
const settingsMenu = document.getElementById('settingsMenu');
let settingsOpen = false;
function renderSaveInfo() {
  const el = document.getElementById('saveInfo'); if (!el) return;
  if (!lastSavedAt) { el.textContent = '尚未存檔'; return; }
  const d = new Date(lastSavedAt), pad = n => String(n).padStart(2, '0');
  el.textContent = `上次存檔 ${d.getMonth() + 1}/${d.getDate()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function renderSettings() {
  for (const key of ['music', 'sfx']) {
    document.getElementById(key + 'Vol').value = SETTINGS[key];
    document.getElementById(key + 'VolVal').textContent = SETTINGS[key];
    document.getElementById(key + 'Vol').style.setProperty('--fill', SETTINGS[key] + '%');
  }
  document.getElementById('muteAll').checked = !SFX.enabled;
  document.getElementById('musicOffHint').classList.toggle('hidden', MUSIC.enabled);
  const pauseBtn = document.getElementById('pauseToggle');
  const canPause = typeof G !== 'undefined' && G && G.running && !G.over && !MAP_SAFE;
  pauseBtn.disabled = !canPause;
  pauseBtn.textContent = !canPause ? '戰鬥中才能暫停' : paused ? '▶ 繼續' : '⏸ 暫停';
  renderSaveInfo();
}
function openSettings() {
  if (settingsOpen || typeof G === 'undefined' || !G) return;
  if (typeof closeSupplyShop === 'function') closeSupplyShop(true);
  if (typeof closeBackpack === 'function') closeBackpack(true);
  settingsOpen = true; aimHeld = false; Object.keys(keys).forEach(key => { keys[key] = false; });
  renderSettings(); settingsMenu.classList.remove('hidden'); sfx('menu');
  document.getElementById('settingsClose').focus();
}
function closeSettings(silent = false) { if (!settingsOpen) return; settingsOpen = false; settingsMenu.classList.add('hidden'); if (!silent) sfx('switch'); }

document.getElementById('settingsButton').addEventListener('click', () => settingsOpen ? closeSettings() : openSettings());
document.getElementById('settingsClose').addEventListener('click', () => closeSettings());
settingsMenu.addEventListener('click', e => { if (e.target === settingsMenu) closeSettings(); });
document.getElementById('saveNow').addEventListener('click', () => saveGame(true));
for (const key of ['music', 'sfx']) {
  const input = document.getElementById(key + 'Vol');
  input.addEventListener('input', () => { SETTINGS[key] = Number(input.value); applySettings(); renderSettings(); });
  input.addEventListener('change', () => { saveSettings(); if (key === 'sfx') sfx('button'); });   // 放開滑桿時播一聲，聽聽看大小
}
document.getElementById('muteAll').addEventListener('change', e => { SFX.enabled = !e.target.checked; MUSIC.refresh(); renderSettings(); });
document.getElementById('pauseToggle').addEventListener('click', () => { setPaused(!paused); sfx('switch'); closeSettings(true); });
window.addEventListener('keydown', e => {   // M 鍵（js/sfx.js）切換靜音後，音樂跟著靜音
  if (!e.repeat && e.key.toLowerCase() === 'm' && !(e.target instanceof Element && e.target.closest('input, textarea, select'))) setTimeout(() => { MUSIC.refresh(); if (settingsOpen) renderSettings(); });
});
// Esc：設定打開時關閉；其他視窗都沒開時打開設定
// （用 capture 先檢查：別的視窗會在同一次按鍵裡被關掉，那次就不打開設定）
window.addEventListener('keydown', e => {
  if (e.key !== 'Escape' || e.repeat) return;
  if (settingsOpen) { e.preventDefault(); e.stopImmediatePropagation(); closeSettings(); return; }
  const visible = id => { const el = document.getElementById(id); return el && !el.classList.contains('hidden'); };
  const busy = dialogueState || elevatorMenuOpen || supplyShopOpen || backpackOpen || mapTransitioning
    || visible('sentryMenu') || visible('groundMenu') || visible('buildbar') || visible('teamEditPanel') || visible('squadStatusPanel')
    || (G && G.selType) || assigning;   // 開始畫面（簡報）也可以打開設定
  if (!busy) { e.preventDefault(); openSettings(); }
}, true);
