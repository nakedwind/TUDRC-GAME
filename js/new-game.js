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
    'tudrc_cabinets_v1',   // 收納櫃裡放的東西（js/storage-cabinet.js）
    'tudrc_meal_buff_v1',   // 餐廳的飯後加成（js/meal.js）
    'tudrc_camp_ammo_v1',   // 營地彈藥箱（js/camp-supply.js）
    'tudrc_vending_stock_v1',   // 2F應變中心販賣機的庫存（js/shop.js 的 EOC_VENDING）   // 各地圖營地物資箱的數量（js/camp-supply.js）
    'tudrc_mrt_unlocked_v1',   // 已經解封的捷運入口（js/mrt-locks.js）
    'tudrc_dynamos_v1',   // 捷運站打開過的發電機，永遠開著（js/storage-lockers.js）
    'tudrc_mrt_gates_v1',   // 刷卡打開過的捷運閘門，重新部署前一直開著（js/mrt-locks.js）
    'tudrc_memory_doors_v1',   // 已經解開鎖鏈的記憶之門（js/memory-doors.js）
    'tudrc_costumes_v1',   // 擁有的服裝、每個人穿什麼（js/costumes.js）
    'tudrc_claw_machine_v2',   // 夾娃娃機裡還剩什麼、剩幾次、保夾累積（js/claw-machine.js）
    'tudrc_bestiary_v1',   // 怪物圖鑑：每種怪物消滅過幾次（js/bestiary.js）
    'tudrc_quickslots_v1',   // 下方快捷欄 1～0 放了什麼（js/quick-slots.js）
    'tudrc_vitals_v1',   // 溫特和隊員的 HP、負荷、住院（js/vitals.js）
    'tudrc_explored_v1',   // 慣性導航記錄器記下的戰鬥地圖（js/tpad-map.js）
    'tudrc_story_builds_v1',   // 劇情地圖裡蓋的建築（js/combat-progress.js）
    'tudrc_tutorial_v1',   // 新手區教學：要不要看、看過哪些提示（js/tutorial.js）
    'tudrc_first_hints_v1',   // 基地裡首次提示（諾亞、置物櫃、衣櫃、防具箱）點開過哪些（js/first-hints.js）
    'tudrc_story_triggers_v1',   // 走進地圖時播過的劇情（js/story-triggers.js）
    'tudrc_squad_gear_v1',   // 隊員身上穿的裝備（js/squad-gear.js）：要跟背包一起重設／還原，不然測試模式穿上的裝備會留在正式存檔
    'tudrc_squad_gear_v2',   // 新版裝備：隊員身上穿的（js/gear-v2.js）
    'tudrc_squad_battery_v1',   // 戴照明頭盔的隊友身上的電池（js/squad-battery.js）
    'tudrc_gear_v2_migrated',   // 新版裝備：舊存檔轉換過了沒（js/gear-v2.js）
    'tudrc_tunnels_found_v1',   // 球球找到的隱藏地道（js/rescue-dog.js）
    'tudrc_seen_items_v1',   // 看過說明的物品（js/item-intro.js）
    'tudrc_target_best_v1',   // 射擊練習最佳紀錄（js/target-practice.js）
    'tudrc_minigame_stats_v1',   // 每款小遊戲玩了幾局、花了多少時間（js/pc-stats.js）
    'tudrc_arcade_best_v1',   // 電腦裡貪食蛇、俄羅斯方塊、彈珠檯的最高分（js/pc-arcade.js）
  ];
  window.GAME_PROGRESS_KEYS = Object.freeze([...progressKeys]);
  let startedFresh = false;
  let resumeScene = null;
  let pendingSlot = 0;   // 要讀的存檔欄位：進度已經在按「讀取」時寫回去了，這裡只剩把當下的現場放回去（從 IndexedDB 讀）
  window.TEST_MODE = false;
  // 把備份（測試前、開新遊戲前、存檔欄位）寫回去；備份裡沒有記錄的鍵（清單後來才加的）不動，免得舊備份把現在的資料刪掉
  // 先把要換掉的鍵全部清掉再寫：空出位置，寫的時候比較不會撞到瀏覽器空間上限
  function restoreProgress(values) {
    progressKeys.forEach(key => { if (key in values) localStorage.removeItem(key); });
    progressKeys.forEach(key => {
      if (!(key in values)) return;
      const value = values[key];
      if (typeof value === 'string') localStorage.setItem(key, value);
    });
  }
  window.restoreGameProgress = restoreProgress;
  // 讀存檔欄位時：進度寫回去之後到重新整理之前，不准再寫進度（關網頁前的自動存檔會把剛寫回去的進度蓋掉）
  window.freezeProgressWrites = () => {
    const keys = new Set(progressKeys), real = Storage.prototype, { setItem, removeItem } = real;
    const mine = (store, key) => store === window.localStorage && keys.has(String(key));
    real.setItem = function (key, value) { if (mine(this, key)) return; return setItem.call(this, key, value); };
    real.removeItem = function (key) { if (mine(this, key)) return; return removeItem.call(this, key); };
  };

  // ---- 存檔欄位放在 IndexedDB ----
  // 以前放在 localStorage：每個網站只有約 5MB（GitHub Pages 同一個帳號底下的網站還共用這 5MB），
  // 每個欄位都是整份進度＋戰場現場的複本，存幾個就滿了，會跳「存檔失敗：儲存空間不足」。IndexedDB 的空間大很多。
  const SLOT_DB = 'tudrc-save-slots', SLOT_STORE = 'slots', OLD_SLOT_KEY = n => 'tudrc-save-slot-v1-' + n;
  let slotDbOpen = null;
  const slotDb = () => slotDbOpen || (slotDbOpen = new Promise((ok, fail) => {
    if (!window.indexedDB) { fail(new Error('這個瀏覽器不能用 IndexedDB')); return; }
    const req = indexedDB.open(SLOT_DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(SLOT_STORE);
    req.onsuccess = () => ok(req.result);
    req.onerror = () => { slotDbOpen = null; fail(req.error); };
  }));
  const slotTx = (mode, fn) => slotDb().then(db => new Promise((ok, fail) => {
    const tx = db.transaction(SLOT_STORE, mode), req = fn(tx.objectStore(SLOT_STORE));
    tx.oncomplete = () => ok(req && req.result); tx.onerror = () => fail(tx.error); tx.onabort = () => fail(tx.error);
  }));
  window.SlotDB = {
    get: n => slotTx('readonly', s => s.get(n)).then(v => v || null),
    put: (n, data) => slotTx('readwrite', s => s.put(data, n)),
    // 舊的 localStorage 存檔欄位搬進 IndexedDB，搬好才刪掉舊的（空出 localStorage 的空間）
    migrate: async () => {
      for (let n = 1; n <= 6; n++) {
        const raw = localStorage.getItem(OLD_SLOT_KEY(n)); if (!raw) continue;
        let data = null; try { data = JSON.parse(raw); } catch (_) {}
        if (data && data.values && !(await window.SlotDB.get(n))) await window.SlotDB.put(n, data);
        localStorage.removeItem(OLD_SLOT_KEY(n));
      }
    },
  };
  window.slotMigration = window.SlotDB.migrate().catch(error => console.warn('存檔欄位搬到 IndexedDB 失敗，先留在原處', error));
  if (window.STORY_PREVIEW) return;   // 回憶預覽不處理待執行的新遊戲／讀檔／測試要求。
  // ---- 地圖編輯器的「▶ 預覽遊戲」（網址帶 ?preview=1）：物品全解鎖 ----
  // 預覽分頁跟正式遊戲共用同一份瀏覽器存檔，所以預覽時「進度」那些存檔只寫在這個分頁的記憶體裡，
  // 讀的時候先看記憶體、沒有才讀正式存檔：全解鎖的物品、預覽裡花的錢都不會帶回正式遊戲
  window.PREVIEW_UNLOCK = /[?&]preview=1(&|$)/.test(location.search);
  if (window.PREVIEW_UNLOCK) {
    const shadow = new Map(), keys = new Set(progressKeys), real = Storage.prototype;
    const { getItem, setItem, removeItem } = real;
    const mine = (store, key) => store === window.localStorage && keys.has(String(key));
    real.getItem = function (key) { if (mine(this, key) && shadow.has(String(key))) return shadow.get(String(key)); return getItem.call(this, key); };
    real.setItem = function (key, value) { if (mine(this, key)) { shadow.set(String(key), String(value)); return; } return setItem.call(this, key, value); };
    real.removeItem = function (key) { if (mine(this, key)) { shadow.set(String(key), null); return; } return removeItem.call(this, key); };
  }
  try {
    const request = sessionStorage.getItem(REQUEST);
    const testActive = sessionStorage.getItem('tudrc-test-mode-v1') === '1';
    if ((testActive && request !== 'test') || (!testActive && localStorage.getItem('tudrc-test-active-v1'))) {
      const normal = JSON.parse(localStorage.getItem('tudrc-before-test-v1') || 'null');
      if (!normal?.values) throw new Error('找不到測試前的進度備份');
      restoreProgress(normal.values);
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
      const mapId = sessionStorage.getItem(START_MAP);   // 開始畫面選好的地圖：測試模式直接從那張開始
      sessionStorage.removeItem(START_MAP);
      if (mapId) resumeScene = { mapId };
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
        window.NEW_GAME_START_MAP = mapId || null;   // 開新遊戲要從哪張地圖開始（頁面載入完才換過去；js/tutorial.js 的開場黑幕要先知道）
        const values = Object.fromEntries(progressKeys.map(key => [key, localStorage.getItem(key)]));
        localStorage.setItem(BACKUP, JSON.stringify({ at: Date.now(), values }));
        progressKeys.forEach(key => localStorage.removeItem(key));
        startedFresh = true;
      } else if (request.startsWith('slot:')) {
        pendingSlot = Number(request.split(':')[1]); startedFresh = true;   // 進度在按「讀取」時就寫回去了（js/save.js），現場等一下從 IndexedDB 讀
      } else {
        const backup = JSON.parse(localStorage.getItem(BACKUP) || 'null');
        if (!backup?.values) throw new Error('沒有可還原的存檔');
        restoreProgress(backup.values);
      }
    }
  } catch (error) {
    alert('無法重設或還原遊戲進度：' + error.message);
  }
  // fromStart：從頭開始新遊戲＝進度重設，而且一定從新手區開始（開場劇情 → 新手區 → Y25區地下街的救援劇情都會重新播）
  function requestRestart(action, fromStart) {
    const text = action === 'new'
      ? (fromStart ? '從頭開始新遊戲？會從開場劇情和新手區重新開始。' : '開始新遊戲？') + '背包、裝備、養成、任務、成就與開櫃紀錄將重設。舊進度會先備份。'
      : '還原上次開始新遊戲前的備份？目前進度將被取代。';
    if (!confirm(text)) return;
    try {
      if (action === 'new' && fromStart && typeof NEWBIE_START !== 'undefined') sessionStorage.setItem(START_MAP, NEWBIE_START.mapId);
      else if (action === 'new' && typeof MAP !== 'undefined' && MAP?.id) sessionStorage.setItem(START_MAP, MAP.id);
      else sessionStorage.removeItem(START_MAP);
      sessionStorage.setItem(REQUEST, action);
      location.reload();
    } catch (error) { alert('無法重新開始：' + error.message); }
  }
  // 全部物品解鎖：每種物品 20 個（略過一般背包容量）、裝備與武器最高等級、子彈補滿、背包／彈匣擴充到最大、建築都開發好
  // 開始畫面的 🧪 測試模式、地圖編輯器的 ▶ 預覽遊戲都用這個
  function grantEverything() {
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
    equipState.battery = 100; equipState.helmetBattery = 100; training.crystals = Math.max(training.crystals, 99999);
    saveEquipment(); saveTraining();
  }
  // 預覽遊戲：等存檔都讀完（所有 DOMContentLoaded 跑完）再全解鎖，不然背包會被讀檔蓋回去
  if (window.PREVIEW_UNLOCK) window.addEventListener('DOMContentLoaded', () => setTimeout(() => {
    try {
      grantEverything();
      if (typeof G !== 'undefined' && G) G.money = Math.max(G.money || 0, 99999);
      if (typeof renderBuildBar === 'function') renderBuildBar();
      if (typeof updateHUD === 'function') updateHUD();
      const note = document.querySelector('.header-note'); if (note && !note.textContent.includes('全物品')) note.textContent += ' · 全物品解鎖';
      if (typeof systemNotice === 'function') systemNotice('預覽模式：全部物品 ×20、最高等級的裝備與武器已解鎖（不會存進正式存檔）');
    } catch (error) { console.warn('預覽全解鎖失敗', error); }
  }, 0));
  window.addEventListener('DOMContentLoaded', () => {
    if (!startedFresh && !(typeof PREVIEW !== 'undefined' && PREVIEW)) {
      const continueButton = document.getElementById('ov-btn');
      if (continueButton) continueButton.textContent = localStorage.getItem('tudrc-save-v1') ? '繼續遊戲' : '開始遊戲';
    }
    document.querySelectorAll('[data-new-game]').forEach(button => button.addEventListener('click', () => requestRestart('new')));
    document.querySelectorAll('[data-new-game-from-start]').forEach(button => button.addEventListener('click', () => requestRestart('new', true)));
    document.querySelectorAll('[data-test-mode]').forEach(button => button.addEventListener('click', () => {
      try {
        if (typeof MAP !== 'undefined' && MAP?.id) sessionStorage.setItem(START_MAP, MAP.id); else sessionStorage.removeItem(START_MAP);   // 記住現在選的地圖（開始畫面的地圖選單）
        sessionStorage.setItem(REQUEST, 'test'); location.reload();
      }
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
    if (startedFresh) setTimeout(async () => {
      if (pendingSlot) {   // 讀存檔欄位：存的時候在哪張地圖、站哪裡、戰場現場
        try { const slot = await window.SlotDB.get(pendingSlot); resumeScene = slot && slot.scene || null; }
        catch (error) { console.warn('讀不到存檔欄位的現場', error); }
      }
      if (window.TEST_MODE) grantEverything();
      if (resumeScene && typeof MAPS_DEFAULT !== 'undefined' && !PREVIEW) {
        const index = MAPS_DEFAULT.findIndex(m => m.id === resumeScene.mapId);
        if (index >= 0) { switchMap(index); const pick = document.getElementById('mapPick'); if (pick) pick.value = index; }
      }
      if (resumeScene?.battle && typeof queueSlotScene === 'function') queueSlotScene(resumeScene.battle);   // 存檔欄位記了當下的現場：進場時整份放回去
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
