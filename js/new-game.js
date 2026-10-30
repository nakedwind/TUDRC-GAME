/* 在其他遊戲程式讀檔前重設進度，避開離頁自動存檔把舊資料寫回。 */
(() => {
  const REQUEST = 'tudrc-new-game-request-v1';
  const START_MAP = 'tudrc-new-game-map-v1';
  const BACKUP = 'tudrc-before-new-game-v1';
  const progressKeys = [
    'tudrc-save-v1', 'tudrc_equipment_v1', 'sentinel-crystals-v1',
    'tudrc_team_v1', 'tudrc_achievements_v1', 'tudrc_quests_v1',
    'tudrc_wallet_v1', 'tudrc_talk_seen_v1',
    'tudrc_missions_v1', 'tudrc_sortie_v1', 'tudrc_sp_v1', 'tudrc-combat-progress-v1',
    'tudrc_guide_sp_v1',
    'tudrc_graffiti_v1',   // 牆上、地上的塗鴉（js/graffiti.js）
    'tudrc_camp_supply_v1',
    'tudrc_camp_ammo_v1',   // 營地彈藥箱（js/camp-supply.js）
    'tudrc_vending_stock_v1',   // 2F應變中心販賣機的庫存（js/shop.js 的 EOC_VENDING）   // 各地圖營地物資箱的數量（js/camp-supply.js）
    'tudrc_mrt_unlocked_v1',   // 已經解封的捷運入口（js/mrt-locks.js）
    'tudrc_memory_doors_v1',   // 已經解開鎖鏈的記憶之門（js/memory-doors.js）
    'tudrc_costumes_v1',   // 擁有的服裝、每個人穿什麼（js/costumes.js）
    'tudrc_bestiary_v1',   // 怪物圖鑑：每種怪物消滅過幾次（js/bestiary.js）
    'tudrc_quickslots_v1',   // 下方快捷欄 1～0 放了什麼（js/quick-slots.js）
    'tudrc_vitals_v1',   // 溫特和隊員的 HP、負荷、住院（js/vitals.js）
    'tudrc_explored_v1',   // 慣性導航記錄器記下的戰鬥地圖（js/tpad-map.js）
    'tudrc_story_builds_v1',   // 劇情地圖裡蓋的建築（js/combat-progress.js）
    'tudrc_tutorial_v1',   // 新手區教學：要不要看、看過哪些提示（js/tutorial.js）
    'tudrc_story_triggers_v1',   // 走進地圖時播過的劇情（js/story-triggers.js）
  ];
  window.GAME_PROGRESS_KEYS = Object.freeze([...progressKeys]);
  let startedFresh = false;
  let resumeScene = null;
  window.TEST_MODE = false;
  if (window.STORY_PREVIEW) return;   // 回憶預覽不處理待執行的新遊戲／讀檔／測試要求。
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
        const mapId = sessionStorage.getItem(START_MAP);
        sessionStorage.removeItem(START_MAP);
        if (mapId) resumeScene = { mapId };
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
      if (action === 'new' && typeof MAP !== 'undefined' && MAP?.id) sessionStorage.setItem(START_MAP, MAP.id);
      else sessionStorage.removeItem(START_MAP);
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
        // 測試模式直接設定每種物品 20 個，略過一般背包容量，確保全品項都能測試。
        for (const item of [...SUPPLIES, ...ITEMS]) Map.prototype.set.call(supplyInventory, item.id, 20);
        for (const def of EQUIPMENT) equipState.owned[def.id] = def.levels.length;
        for (const [id, def] of Object.entries(WEAPON_UPGRADES)) {
          if (def.removed) continue;   // 開發工坊編輯器刪掉的武器不給
          equipState.weapons[id] = def.levels.length;
        }
        for (const id of Object.keys(BULLETS)) if (id !== 'pistol' && !BULLETS[id].removed) { equipState.bullets.owned[id] = true; equipState.bullets.n[id] = BULLETS[id].max; }   // 所有子彈補滿
        equipState.bag = { items: BAG_UPGRADES.items.slots.length, ammo: BAG_UPGRADES.ammo.slots.length };   // 背包、彈藥包擴充到最大
        equipState.magazine = { lv: MAGAZINE.slots.length, load: magCandidates().slice(0, MAGAZINE.slots[MAGAZINE.slots.length - 1]) };   // 彈匣升到最大、先裝滿（測試模式滾輪本來就換得到全部子彈，js/magazine.js）
        for (const o of buildAll()) equipState.builds[o.id] = true;   // 所有建築都開發好（js/build.js）
        equipState.battery = 100; training.crystals = Math.max(training.crystals, 99999);
        saveEquipment(); saveTraining();
      }
      if (resumeScene && typeof MAPS_DEFAULT !== 'undefined' && !PREVIEW) {
        const index = MAPS_DEFAULT.findIndex(m => m.id === resumeScene.mapId);
        if (index >= 0) { switchMap(index); const pick = document.getElementById('mapPick'); if (pick) pick.value = index; }
      }
      if (typeof begin === 'function') begin(false);
      if (window.TEST_MODE) {
        G.money = Math.max(G.money, 99999);
        G.guide = G.guideMax; if (typeof rememberSanitySP === 'function') rememberSanitySP();   // SP 補滿（不沿用正式存檔裡剩下的 SP，js/sanity.js）
        updateHUD();
        const note = document.querySelector('.header-note'); if (note) note.textContent = '🧪 測試模式 · 全物品解鎖';
        systemNotice('測試模式：全部物品 ×20、最高等級的裝備與武器已解鎖');
      }
      if (resumeScene && G?.player && Number.isFinite(resumeScene.x) && Number.isFinite(resumeScene.y) && !playerBlocked(resumeScene.x, resumeScene.y)) {
        G.player.x = resumeScene.x; G.player.y = resumeScene.y;
      }
    }, 0);
  });
})();
