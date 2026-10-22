/* 在其他遊戲程式讀檔前重設進度，避開離頁自動存檔把舊資料寫回。 */
(() => {
  const REQUEST = 'tudrc-new-game-request-v1';
  const BACKUP = 'tudrc-before-new-game-v1';
  const progressKeys = [
    'tudrc-save-v1', 'tudrc_equipment_v1', 'sentinel-crystals-v1',
    'tudrc_team_v1', 'tudrc_achievements_v1', 'tudrc_quests_v1',
    'tudrc_missions_v1', 'tudrc_sortie_v1', 'tudrc_sp_v1', 'tudrc-combat-progress-v1',
    'tudrc_guide_sp_v1',
    'tudrc_graffiti_v1',   // 牆上、地上的塗鴉（js/graffiti.js）
    'tudrc_camp_supply_v1',   // 各地圖營地物資箱的數量（js/camp-supply.js）
    'tudrc_mrt_unlocked_v1',   // 已經解封的捷運入口（js/mrt-locks.js）
    'tudrc_costumes_v1',   // 擁有的服裝、每個人穿什麼（js/costumes.js）
    'tudrc_bestiary_v1',   // 怪物圖鑑：每種怪物消滅過幾次（js/bestiary.js）
    'tudrc_quickslots_v1',   // 下方快捷欄 1～0 放了什麼（js/quick-slots.js）
  ];
  window.GAME_PROGRESS_KEYS = Object.freeze([...progressKeys]);
  let startedFresh = false;
  let resumeScene = null;
  window.TEST_MODE = false;
  try {
    const request = sessionStorage.getItem(REQUEST);
    const testActive = sessionStorage.getItem('tudrc-test-mode-v1') === '1';
    if ((testActive && request !== 'test') || (!testActive && localStorage.getItem('tudrc-test-active-v1'))) {
      const normal = JSON.parse(localStorage.getItem('tudrc-before-test-v1') || 'null');
      if (!normal?.values) throw new Error('找不到測試前的進度備份');
      progressKeys.forEach(key => {
        const value = normal.values[key];
        if (typeof value === 'string') localStorage.setItem(key, value); else localStorage.removeItem(key);
      });
      sessionStorage.removeItem('tudrc-test-mode-v1');
      localStorage.removeItem('tudrc-test-active-v1');
    }
    if (request === 'test') {
      if (!testActive) {
        const values = Object.fromEntries(progressKeys.map(key => [key, localStorage.getItem(key)]));
        localStorage.setItem('tudrc-before-test-v1', JSON.stringify({ at: Date.now(), values }));
      }
      sessionStorage.setItem('tudrc-test-mode-v1', '1');
      localStorage.setItem('tudrc-test-active-v1', '1');
      sessionStorage.removeItem(REQUEST); startedFresh = true;
    } else if (request === 'test-exit') {
      sessionStorage.removeItem(REQUEST);
    }
    window.TEST_MODE = sessionStorage.getItem('tudrc-test-mode-v1') === '1';
    if (request === 'new' || request === 'restore' || /^slot:[1-6]$/.test(request || '')) {
      sessionStorage.removeItem(REQUEST);
      if (request === 'new') {
        const values = Object.fromEntries(progressKeys.map(key => [key, localStorage.getItem(key)]));
        localStorage.setItem(BACKUP, JSON.stringify({ at: Date.now(), values }));
        progressKeys.forEach(key => localStorage.removeItem(key));
        startedFresh = true;
      } else {
        const isSlot = request.startsWith('slot:');
        const backup = JSON.parse(localStorage.getItem(isSlot ? 'tudrc-save-slot-v1-' + request.split(':')[1] : BACKUP) || 'null');
        if (!backup?.values) throw new Error('沒有可還原的存檔');
        progressKeys.forEach(key => {
          const value = backup.values[key];
          if (typeof value === 'string') localStorage.setItem(key, value);
          else localStorage.removeItem(key);
        });
        if (isSlot) { resumeScene = backup.scene; startedFresh = true; }
      }
    }
  } catch (error) {
    alert('無法重設或還原遊戲進度：' + error.message);
  }
  function requestRestart(action) {
    const text = action === 'new'
      ? '開始新遊戲？背包、裝備、養成、任務、成就與開櫃紀錄將重設。舊進度會先備份。'
      : '還原上次開始新遊戲前的備份？目前進度將被取代。';
    if (!confirm(text)) return;
    try {
      sessionStorage.setItem(REQUEST, action);
      location.reload();
    } catch (error) { alert('無法重新開始：' + error.message); }
  }
  window.addEventListener('DOMContentLoaded', () => {
    if (!startedFresh && !(typeof PREVIEW !== 'undefined' && PREVIEW)) {
      const continueButton = document.getElementById('ov-btn');
      if (continueButton) continueButton.textContent = localStorage.getItem('tudrc-save-v1') ? '繼續遊戲' : '開始遊戲';
    }
    document.querySelectorAll('[data-new-game]').forEach(button => button.addEventListener('click', () => requestRestart('new')));
    document.querySelectorAll('[data-test-mode]').forEach(button => button.addEventListener('click', () => {
      try { sessionStorage.setItem(REQUEST, 'test'); location.reload(); }
      catch (error) { alert('無法開啟測試模式：' + error.message); }
    }));
    const exitTest = document.getElementById('exitTestMode');
    if (exitTest) {
      exitTest.hidden = !window.TEST_MODE;
      exitTest.addEventListener('click', () => {
        try { sessionStorage.setItem(REQUEST, 'test-exit'); location.reload(); }
        catch (error) { alert('無法離開測試模式：' + error.message); }
      });
    }
    const restore = document.getElementById('restoreBeforeNewGame');
    if (restore) {
      try { restore.hidden = !localStorage.getItem(BACKUP); } catch (_) { restore.hidden = true; }
      restore.addEventListener('click', () => requestRestart('restore'));
    }
    // 等所有載入存檔的 DOMContentLoaded 處理完成後才進場。
    if (startedFresh) setTimeout(() => {
      if (window.TEST_MODE) {
        for (const item of [...SUPPLIES, ...ITEMS]) supplyInventory.set(item.id, Math.max(99, supplyInventory.get(item.id) || 0));
        for (const def of EQUIPMENT) equipState.owned[def.id] = def.levels.length;
        for (const [id, def] of Object.entries(WEAPON_UPGRADES)) {
          if (def.removed) continue;   // 開發工坊編輯器刪掉的武器不給
          equipState.weapons[id] = def.levels.length;
        }
        for (const id of Object.keys(BULLETS)) if (id !== 'pistol' && !BULLETS[id].removed) { equipState.bullets.owned[id] = true; equipState.bullets.n[id] = BULLETS[id].max; }   // 所有子彈補滿
        equipState.battery = 100; training.crystals = Math.max(training.crystals, 99999);
        saveEquipment(); saveTraining();
      }
      if (resumeScene && typeof MAPS_DEFAULT !== 'undefined' && !PREVIEW) {
        const index = MAPS_DEFAULT.findIndex(m => m.id === resumeScene.mapId);
        if (index >= 0) { switchMap(index); const pick = document.getElementById('mapPick'); if (pick) pick.value = index; }
      }
      if (typeof begin === 'function') begin(false);
      if (window.TEST_MODE) {
        G.money = Math.max(G.money, 99999); updateHUD();
        const note = document.querySelector('.header-note'); if (note) note.textContent = '🧪 測試模式 · 全物品解鎖';
        systemNotice('測試模式：全部物品 ×99、最高等級的裝備與武器已解鎖');
      }
      if (resumeScene && G?.player && Number.isFinite(resumeScene.x) && Number.isFinite(resumeScene.y) && !playerBlocked(resumeScene.x, resumeScene.y)) {
        G.player.x = resumeScene.x; G.player.y = resumeScene.y;
      }
    }, 0);
  });
})();
