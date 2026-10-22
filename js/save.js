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
const saveSnapshot = () => JSON.stringify({ inventory: [...supplyInventory], unlockedStorageLockers: [...unlockedStorageLockers], collectedStorageKeys: [...collectedStorageKeys], cart: [...shopCart], favor: favorPoints, giftKnown, gifted: [...giftedThisVisit], requests: giftRequests, requestsStale });
function saveGame(manual = false) {
  try {
    if (typeof rememberGuideSP === 'function') rememberGuideSP();
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
  unlockedStorageLockers.clear(); collectedStorageKeys.clear();
  (Array.isArray(data.unlockedStorageLockers)?data.unlockedStorageLockers:[]).filter(x=>typeof x==='string').forEach(x=>unlockedStorageLockers.add(x));
  (Array.isArray(data.collectedStorageKeys)?data.collectedStorageKeys:[]).filter(x=>typeof x==='string').forEach(x=>collectedStorageKeys.add(x));
  shopCart.clear(); (data.cart || []).filter(valid).forEach(([id, n]) => shopCart.set(id, n));
  Object.assign(favorPoints, data.favor || {}); Object.assign(giftKnown, data.giftKnown || {});   // 好感度（js/gifts.js）
  (data.gifted || []).forEach(id => giftedThisVisit.add(id));
  for (const [id, item] of Object.entries(data.requests || {})) if (itemById(item)) giftRequests[id] = item;   // 今日想吃
  if (typeof data.requestsStale === 'boolean') requestsStale = data.requestsStale;
  lastSavedAt = data.savedAt || 0; lastSavedSnapshot = saveSnapshot();
  if (typeof G !== 'undefined' && G) { setupStorageBoxWalls();computeFlow();updateHUD(); }
}
// 遊戲程式（js/game.js）都載入完才讀檔
window.addEventListener('DOMContentLoaded', loadGame);
setInterval(() => { if (saveSnapshot() !== lastSavedSnapshot) saveGame(); }, 5000);   // 自動存檔
window.addEventListener('beforeunload', () => saveGame());

// ---------- 設定選單 ----------
const settingsMenu = document.getElementById('settingsMenu');
let settingsOpen = false;
const SAVE_SLOT_COUNT = 6;
const saveSlotKey = n => 'tudrc-save-slot-v1-' + n;
function readSaveSlot(n) {
  try {
    const slot = JSON.parse(localStorage.getItem(saveSlotKey(n)) || 'null');
    return slot && slot.values && typeof slot.values === 'object' ? slot : null;
  } catch (_) { return null; }
}
function renderSaveSlots() {
  const box = document.getElementById('saveSlots'); if (!box) return;
  box.replaceChildren();
  for (let n = 1; n <= SAVE_SLOT_COUNT; n++) {
    const slot = readSaveSlot(n), row = document.createElement('article'); row.className = 'save-slot';
    if (slot) {
      const portrait = document.createElement('span'); portrait.className = 'save-slot-portrait'; portrait.setAttribute('aria-hidden', 'true');
      const avatar = document.createElement('img'); avatar.src = EQUIP_PORTRAIT.fallback; avatar.alt = ''; portrait.append(avatar); row.append(portrait);
    }
    const info = document.createElement('div'), title = document.createElement('strong'), detail = document.createElement('small');
    title.textContent = '存檔 ' + n;
    detail.textContent = slot ? new Date(slot.at).toLocaleString('zh-TW', { hour12: false }) + (slot.scene?.mapName ? ' · ' + slot.scene.mapName : '') : '空白存檔';
    info.append(title, detail); row.append(info);
    for (const [action, label] of [['save', slot ? '覆寫' : '存入'], ['load', '讀取']]) {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'set-btn' + (action === 'save' ? ' primary' : ''); button.textContent = label;
      button.dataset.slotAction = action; button.dataset.slot = n; button.disabled = action === 'load' && !slot; row.append(button);
    }
    box.append(row);
  }
}
function storeSaveSlot(n) {
  if (!Number.isInteger(n) || n < 1 || n > SAVE_SLOT_COUNT) return;
  if (readSaveSlot(n) && !confirm('覆寫存檔 ' + n + '？')) return;
  try {
    saveGame();
    for (const fn of [saveEquipment, saveQuests, saveMissions, saveSortie]) fn();
    const values = Object.fromEntries(window.GAME_PROGRESS_KEYS.map(key => [key, localStorage.getItem(key)]));
    const scene = { mapId: MAP?.id, mapName: MAP?.name, x: G.player?.x, y: G.player?.y };
    localStorage.setItem(saveSlotKey(n), JSON.stringify({ v: 1, at: Date.now(), values, scene }));
    systemNotice('已存入存檔 ' + n); sfx('button'); renderSaveSlots();
  } catch (_) { systemNotice('存檔失敗：儲存空間不足或無法使用', true); }
}
document.getElementById('saveSlots').addEventListener('click', e => {
  const button = e.target.closest('[data-slot-action]'); if (!button) return;
  const n = Number(button.dataset.slot);
  if (button.dataset.slotAction === 'save') { storeSaveSlot(n); return; }
  if (!readSaveSlot(n) || !confirm('讀取存檔 ' + n + '？目前未存入的進度將被取代。')) return;
  try { sessionStorage.setItem('tudrc-new-game-request-v1', 'slot:' + n); location.reload(); }
  catch (_) { systemNotice('無法讀取存檔', true); }
});
const settingsTabs = [...document.querySelectorAll('[data-settings-page]')];
function selectSettingsPage(id) {
  settingsTabs.forEach(tab => { const on = tab.dataset.settingsPage === id; tab.setAttribute('aria-selected', String(on)); tab.tabIndex = on ? 0 : -1; });
  document.querySelectorAll('.settings-page').forEach(page => { page.hidden = page.id !== 'settings-' + id; });
}
settingsTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => { selectSettingsPage(tab.dataset.settingsPage); sfx('switch'); });
  tab.addEventListener('keydown', e => {
    let next = index;
    if (e.key === 'ArrowDown') next = (index + 1) % settingsTabs.length;
    else if (e.key === 'ArrowUp') next = (index + settingsTabs.length - 1) % settingsTabs.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = settingsTabs.length - 1;
    else return;
    e.preventDefault(); selectSettingsPage(settingsTabs[next].dataset.settingsPage); settingsTabs[next].focus();
  });
});
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
  renderSaveInfo();
  renderSaveSlots();
}
function openSettings() {
  if ((typeof campPlanOpen !== 'undefined' && campPlanOpen) || settingsOpen || typeof G === 'undefined' || !G) return;
  if (typeof closeSupplyShop === 'function') closeSupplyShop(true);
  if (typeof closeBackpack === 'function') closeBackpack(true);
  settingsOpen = true; aimHeld = false; Object.keys(keys).forEach(key => { keys[key] = false; });
  renderSettings(); settingsMenu.classList.remove('hidden'); sfx('menu');
  document.getElementById('settingsClose').focus();
}
function closeSettings(silent = false) { if (!settingsOpen) return; settingsOpen = false; settingsMenu.classList.add('hidden'); if (!silent) sfx('switch'); }

document.getElementById('settingsButton')?.addEventListener('click', () => settingsOpen ? closeSettings() : openSettings());   // 設定按鈕已拿掉（改在 T-Pad 裡開）
document.getElementById('settingsClose').addEventListener('click', () => closeSettings());
settingsMenu.addEventListener('click', e => { if (e.target === settingsMenu) closeSettings(); });
document.getElementById('saveNow').addEventListener('click', () => saveGame(true));
for (const key of ['music', 'sfx']) {
  const input = document.getElementById(key + 'Vol');
  input.addEventListener('input', () => { SETTINGS[key] = Number(input.value); applySettings(); renderSettings(); });
  input.addEventListener('change', () => { saveSettings(); if (key === 'sfx') sfx('button'); });   // 放開滑桿時播一聲，聽聽看大小
}
document.getElementById('muteAll').addEventListener('change', e => { SFX.enabled = !e.target.checked; MUSIC.refresh(); renderSettings(); });
window.addEventListener('keydown', e => {   // M 鍵（js/sfx.js）切換靜音後，音樂跟著靜音
  if (!e.repeat && e.key.toLowerCase() === 'm' && !(e.target instanceof Element && e.target.closest('input, textarea, select'))) setTimeout(() => { MUSIC.refresh(); if (settingsOpen) renderSettings(); });
});
// Esc 的層級：最上面開著的那個視窗先處理（只關掉它），都沒有視窗處理時，才打開 T-Pad 裡的設定（開始畫面還不能開 T-Pad：打開原本的設定視窗）
// ・設定本身開著：這裡先關（capture，最先處理）
// ・其他視窗：各自的 Esc 處理關掉自己，並呼叫 e.preventDefault()（或 stopImmediatePropagation）＝「這次 Esc 用掉了」
// ・打開設定：等所有程式載入完才註冊、而且在 bubble 階段＝所有視窗都處理過、沒人用掉這次 Esc 才打開
//   → 新的視窗要支援 Esc：在自己的 keydown 裡關掉視窗、呼叫 e.preventDefault() 就好，不用改這裡
window.addEventListener('keydown', e => {
  if (e.key !== 'Escape' || e.repeat || !settingsOpen) return;
  e.preventDefault(); e.stopImmediatePropagation(); closeSettings();
}, true);
function openSettingsOnEsc(e) {
  if (e.key !== 'Escape' || e.repeat || e.defaultPrevented || settingsOpen) return;   // 別的視窗已經用掉這次 Esc
  const visible = id => { const el = document.getElementById(id); return el && !el.classList.contains('hidden'); };
  // 保險：這些狀態下也不打開設定（地圖切換中、放置建築、指派哨兵…）
  const busy = (typeof campPlanOpen !== 'undefined' && campPlanOpen) || (typeof campSupplyOpen !== 'undefined' && campSupplyOpen) || (typeof npcArrangeMode !== 'undefined' && npcArrangeMode) || dialogueState || elevatorMenuOpen || supplyShopOpen || backpackOpen || mapTransitioning
    || visible('sentryMenu') || visible('groundMenu') || visible('buildbar') || visible('teamEditPanel') || visible('squadStatusPanel')
    || (typeof tpadOpen !== 'undefined' && tpadOpen) || (typeof bestiaryOpen !== 'undefined' && bestiaryOpen) || (G && G.selType) || assigning;   // 怪物圖鑑
  if (busy) return;
  e.preventDefault(); if (!(typeof openTPadSettings === 'function' && openTPadSettings())) openSettings();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => window.addEventListener('keydown', openSettingsOnEsc));
else window.addEventListener('keydown', openSettingsOnEsc);
