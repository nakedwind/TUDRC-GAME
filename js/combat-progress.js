/* 暫停中的戰場：保存物件之間的參照（格子、敵人目標、基地與門）。 */
const COMBAT_PROGRESS_KEY = 'tudrc-combat-progress-v1';
function combatGraphEncode(value, stamps) {
  const nodes = [], seen = new Map(), external = new Map(stamps.map((s, i) => [s, i]));
  function encode(v) {
    if (v === undefined || typeof v === 'function') return { u: true };
    if (typeof v === 'number' && !Number.isFinite(v)) return { n: String(v) };
    if (v === null || typeof v !== 'object') return v;
    if (external.has(v)) return { s: external.get(v) };
    if (seen.has(v)) return { r: seen.get(v) };
    const i = nodes.length; seen.set(v, i); nodes.push(null);
    const type = v instanceof Set ? 'set' : v instanceof Map ? 'map' : Array.isArray(v) ? 'array' : 'object';
    nodes[i] = { type, data: type === 'set' || type === 'array' ? [...v].map(encode)
      : type === 'map' ? [...v].map(([k, x]) => [encode(k), encode(x)])
      : Object.entries(v).filter(([, x]) => typeof x !== 'function').map(([k, x]) => [k, encode(x)]) };
    return { r: i };
  }
  const root = encode(value); return { nodes, root };
}
function combatGraphDecode(graph, stamps) {
  const values = graph.nodes.map(n => n.type === 'set' ? new Set() : n.type === 'map' ? new Map() : n.type === 'array' ? [] : {});
  const decode = v => v && typeof v === 'object' ? 'r' in v ? values[v.r] : 's' in v ? stamps[v.s] : 'n' in v ? Number(v.n) : undefined : v;
  graph.nodes.forEach((n, i) => {
    if (n.type === 'set') n.data.forEach(v => values[i].add(decode(v)));
    else if (n.type === 'map') n.data.forEach(([k, v]) => values[i].set(decode(k), decode(v)));
    else if (n.type === 'array') n.data.forEach(v => values[i].push(decode(v)));
    else n.data.forEach(([k, v]) => { if (!['__proto__', 'constructor', 'prototype'].includes(k)) values[i][k] = decode(v); });
  });
  return decode(graph.root);
}
function combatMapSignature() {
  return JSON.stringify([MAP.cols, MAP.rows, MAP.solid, (MAP.stamps || []).map(s => [s.id, s.c, s.r, s.ox, s.oy, s.rot, s.fx, s.fy])]);
}
function readCombatProgress() {
  try { return JSON.parse(localStorage.getItem(COMBAT_PROGRESS_KEY) || '{}'); } catch (_) { return {}; }
}
function clearCombatProgress(mapId) {
  const all = readCombatProgress(); delete all[mapId]; localStorage.setItem(COMBAT_PROGRESS_KEY, JSON.stringify(all));
}
// 不存進作戰進度的快取：讀檔後會自己重算。flickerLightsMap 指著整張地圖資料（js/flicker-light.js），
// secretOwner 是暗區查詢表（js/breakable-walls.js）；存進去每張地圖多好幾百 KB，存檔欄位又各複製一份，瀏覽器空間會爆
const COMBAT_SKIP_CACHES = ['flickerLightsMap', 'secretOwner'];
function suspendCombatProgress() {
  const all = readCombatProgress(), state = { ...G, effects: [] };
  COMBAT_SKIP_CACHES.forEach(k => delete state[k]);
  all[MAP.id] = { signature: combatMapSignature(), graph: combatGraphEncode({
    state, walls: mapWalls, doors: mapDoors, doorWalls: doorAddedWalls,
    offsets: mapSolidOffsets, activeSupply: sortie.active, power: [...mapPowerOn], elevator: openElevatorStamp,
  }, MAP.stamps || []) };
  localStorage.setItem(COMBAT_PROGRESS_KEY, JSON.stringify(all));
}
// 舊的作戰進度瘦身：從存好的資料裡拿掉上面那些快取，再丟掉沒人用到的節點（其他內容原封不動）
function compactCombatGraph(graph) {
  const rootNode = graph && graph.root && graph.nodes[graph.root.r], stateRef = rootNode && (rootNode.data.find(([k]) => k === 'state') || [])[1];
  const stateNode = stateRef && stateRef.r !== undefined && graph.nodes[stateRef.r];
  if (!stateNode || stateNode.type !== 'object') return false;
  const before = stateNode.data.length;
  stateNode.data = stateNode.data.filter(([k]) => !COMBAT_SKIP_CACHES.includes(k));
  if (stateNode.data.length === before) return false;
  const keep = new Map(), order = [], walk = v => {   // 從 root 走得到的節點才留下，照原本順序重新編號
    if (!v || typeof v !== 'object') return;
    if (Array.isArray(v)) return v.forEach(walk);
    if ('r' in v && !keep.has(v.r)) { keep.set(v.r, -1); order.push(v.r); walk(graph.nodes[v.r].data); }
  };
  walk(graph.root);
  order.sort((a, b) => a - b).forEach((old, i) => keep.set(old, i));
  const remap = v => !v || typeof v !== 'object' ? v : Array.isArray(v) ? v.map(remap) : 'r' in v ? { r: keep.get(v.r) } : v;
  graph.nodes = order.map(old => ({ ...graph.nodes[old], data: remap(graph.nodes[old].data) }));
  graph.root = remap(graph.root);
  return true;
}
function compactCombatProgressText(text) {
  let all; try { all = JSON.parse(text || 'null'); } catch (_) { return null; }
  if (!all || typeof all !== 'object') return null;
  let changed = false;
  for (const saved of Object.values(all)) if (saved && saved.graph && compactCombatGraph(saved.graph)) changed = true;
  return changed ? JSON.stringify(all) : null;
}
(() => {   // 開遊戲時整理一次：目前進度、存檔欄位、開新遊戲／測試模式前的備份裡各有一份
  try {
    const now = compactCombatProgressText(localStorage.getItem(COMBAT_PROGRESS_KEY));
    if (now) localStorage.setItem(COMBAT_PROGRESS_KEY, now);
    for (const key of Object.keys(localStorage)) {
      if (!/^tudrc-save-slot-v1-|^tudrc-before-(new-game|test)-v1$/.test(key)) continue;
      const box = JSON.parse(localStorage.getItem(key) || 'null');
      const small = box && box.values && compactCombatProgressText(box.values[COMBAT_PROGRESS_KEY]);
      if (small) { box.values[COMBAT_PROGRESS_KEY] = small; localStorage.setItem(key, JSON.stringify(box)); }
    }
  } catch (_) {}
})();
// 不跑 newGame、直接把 mapWalls 整份換回來的地方（接續「保留進度」、劇情／回憶門看完回原地圖 js/story-scene.js 的 backToGame）都要呼叫：
// 可炸牆、閘門、置物箱各自「加進牆裡的格子」清單是另外記的，不跟著牆一起換；中間換過別張地圖就會變成那張的，
// 照換回來的牆重新認一次，不然打開／炸開時擋路格刪不掉（洞炸開了還是走不過去）
function reclaimAddedWalls() {
  if (typeof restoreBreakableWalls === 'function') restoreBreakableWalls();   // 可炸開的牆（js/breakable-walls.js）
  if (typeof restoreMrtLocks === 'function') restoreMrtLocks();               // 捷運閘門、封鎖的入口（js/mrt-locks.js）
  if (typeof restoreStorageBoxWalls === 'function') restoreStorageBoxWalls();  // 置物箱（js/storage-lockers.js）
}
// 重新部署＝這張地圖一切重來：開過的箱子、撿過的東西也回到原樣（封鎖的捷運入口除外，解封是永久的，js/mrt-locks.js）
function resetMapLoot(mapId) {
  const here = token => { try { return JSON.parse(token)[0] === mapId; } catch (_) { return false; } };
  for (const set of [unlockedStorageLockers, collectedStorageKeys]) for (const token of [...set]) if (here(token)) set.delete(token);
}
function redeployCombat(mapId) {
  clearCombatProgress(mapId); resetMapLoot(mapId);
}
// 同一張地圖直接重新部署（不經過換地圖）：剩下的經費留著，地圖的作戰經費不會再給一次（js/missions.js 的 missionMoneyGiven）
function keepBattleMoney() {
  if (!G || MAP_SAFE || G.moneySettled || window.TEST_MODE || typeof walletSet !== 'function') return;
  G.moneySettled = true; walletSet(Math.max(0, Math.floor(G.money || 0)));
}
// 戰敗撤退：戰場像時間暫停一樣留著。回來時溫特站在營地；營地被打壞的話修回一半，不然一接續又馬上戰敗
const DEFEAT_CAMP_HP = .5;
function suspendDefeatedBattle() {
  G.over = false; G.won = false; G.phase = 'playing'; G.playerDeath = null; G.baseLostT = 0;
  for (const s of [...(G.destroyedBases || [])]) {
    const o = seedBaseObstacle(s); if (o) o.hp = Math.ceil(o.maxhp * DEFEAT_CAMP_HP);
    G.destroyedBases.delete(s);
  }
  const [x, y] = playerSpawnPos(); G.player.x = x; G.player.y = y; G.player.moving = false;
  try { suspendCombatProgress(); } catch (_) { systemNotice('無法儲存作戰進度，請確認儲存空間', true); }
}
// 走出入口離開戰鬥地圖（js/game.js 的 enterPortal）：這張地圖一樣暫停，走回來接著打
function suspendLeavingBattle() {
  if (MAP_SAFE || !MAP || !G || G.over || isNewbieMap() || !missionOfMap(MAP.id)) return;
  try { suspendCombatProgress(); } catch (_) { systemNotice('無法儲存作戰進度，請確認儲存空間', true); }
}
// 接續時從應變中心回來：在基地準備的東西要算數（換了隊員、帶了補給、休息過）。走出入口直接回來的就不用
function resumeSquadFromBase(savedSupply) {
  sortieLastSafe = true; onSortieNewGame();   // 吃掉這次帶的補給、彈匣補滿（js/sortie-supply.js）
  sortie.active = { ...savedSupply, ...sortie.active }; saveSortie();
  const team = getTeam();
  G.towers = G.towers.filter(t => {
    if (!TYPES[t.type] || team.includes(t.type)) return true;
    t.hp = 0; return false;   // 換下來的隊員：怪物還瞄著他的話，當作倒下
  });
  const missing = team.filter(id => !G.towers.some(t => t.type === id));
  if (missing.length) spawnSentries(missing);
  // 球球不在 TYPES（是 G.npcs），上面換人管不到：移出了就帶走，新編入就生在要跟的人旁邊
  if (!team.includes('ball')) G.npcs = G.npcs.filter(n => n.id !== 'ball');
  else if (!G.npcs.some(n => n.id === 'ball')) {
    spawnWanderers(['ball']);
    const dog = G.npcs.find(n => n.id === 'ball'), who = dogFollowAnchor();
    if (dog) { dog.x = who.x; dog.y = who.y; }
  }
  for (const t of G.towers) {
    if (!TYPES[t.type]) continue;
    t.maxhp = TYPES[t.type].hp; t.buff = undefined; applySortieBuff(t);
    if (TYPES[t.type].guide && typeof initGuideSP === 'function') { t.sp = undefined; initGuideSP(t); }   // 在基地休息過的 SP
  }
  if (typeof restoreSanitySP === 'function') restoreSanitySP();
}
function restoreCombatProgress() {
  if (MAP_SAFE || !MAP) return false;
  const saved = readCombatProgress()[MAP.id]; if (!saved) return false;
  const lastSafe = sortieLastSafe;
  if (saved.signature !== combatMapSignature()) { clearCombatProgress(MAP.id); systemNotice('地圖已更新，本次作戰重新部署'); return false; }
  try {
    const data = combatGraphDecode(saved.graph, MAP.stamps || []);
    if (!data.state?.player || !(data.walls instanceof Set)) throw new Error('戰場資料不完整');
    if (typeof rememberVitals === 'function' && G?.vitalsMapId !== MAP.id) rememberVitals();   // 不會跑 newGame：先記住剛離開那張地圖的 HP、負荷，resumeVitals 才不會套到舊數字
    G = data.state; mapWalls = data.walls; mapDoors = data.doors; doorAddedWalls = data.doorWalls; mapSolidOffsets = data.offsets;
    if (lastSafe !== false) sortie.active = data.activeSupply;   // 走出入口回來的：這趟出勤的補給效果還在
    sortieLastSafe = false; saveSortie();
    if (!window.TEST_MODE && typeof walletGet === 'function') { G.money = walletGet(); G.moneySettled = false; }   // 錢包才是現在的錢：離開時帶回去了，基地裡可能花掉了
    poweredMap = MAP; mapPowerOn = new Set(Array.isArray(data.power) ? data.power : data.power ? [0] : []);   // 舊存檔：true＝沒編號的電路開著
    openElevatorStamp = data.elevator || null;   // 電梯開著還是關著（擋路格已經跟著 mapWalls 一起還原）
    reclaimAddedWalls();
    if (lastSafe === true) resumeSquadFromBase(data.activeSupply);
    if (typeof resumeVitals === 'function') resumeVitals();   // 中間回應變中心治療過：換成現在的 HP、負荷（倒下的隊員治好了就站起來，js/vitals.js）
    sanitySP = G.guide; rememberGuideSP(); applyOutfits(); occCache = null; occCacheFor = null;
    computeFlow(); updateCamera(); updateHUD(); updateBuildToggle();
    // 接續後消耗暫存；下次選「保留進度」才會建立新的暫存。
    clearCombatProgress(MAP.id); systemNotice('已接續上次保留的作戰進度'); return true;
  } catch (error) { systemNotice('無法接續作戰，將重新部署', true); return false; }
}
function executeCampPlan(action) {
  if (!['abort', 'preserve', 'restart'].includes(action)) return false;
  if (action !== 'restart' && mapIndexOf(MISSION_BASE.map) < 0) { systemNotice('找不到應變中心地圖', true); return; }
  if (mapTransitioning) return;
  try {
    if (action === 'preserve') suspendCombatProgress(); else redeployCombat(MAP.id);
  } catch (_) { systemNotice('無法儲存作戰進度，請確認儲存空間後重試', true); return; }
  closeGroundMenu(); saveGame();
  if (action === 'restart') { keepBattleMoney(); begin(false); updateCamera(); }
  else returnToBase();
  return true;
}

// ---- 劇情地圖（地圖屬性 story，js/maploader.js 的 MAP_STORY）：時間暫停 ----
// 從戰鬥地圖走出入口進劇情地圖時，把戰場（G：怪物、核心、隊友、計時…）跟牆、門、電源、電梯整份留在記憶體裡；
// 劇情地圖裡的時間是另一份 G，原本的戰場完全不會動。從劇情地圖走回原地圖時把留著的放回去，接著打。
// 從劇情地圖走去別張地圖：這場作戰就算結束了（剩下的經費帶回錢包）。重新整理網頁不會留（跟回憶劇情一樣只放記憶體）。
let pausedBattle = null;
function pauseBattleForStory() {
  pausedBattle = { mapId: MAP.id, G, walls: mapWalls, doors: mapDoors, doorWalls: doorAddedWalls, offsets: mapSolidOffsets,
    power: new Set(mapPowerOn), elevator: openElevatorStamp,
    mrtWalls: typeof mrtAddedWalls !== 'undefined' ? mrtAddedWalls : null,
    breakCells: typeof breakableWallCells !== 'undefined' ? breakableWallCells : null,
    breakSolid: typeof breakableWallSolid !== 'undefined' ? breakableWallSolid : null,
    storageWalls: typeof storageAddedWalls !== 'undefined' ? storageAddedWalls : null };
}
function dropPausedBattle() {   // 不回原地圖了：暫停的戰場作廢，剩下的作戰經費帶回錢包（同 js/progression.js 的 settleSortieMoney）
  const g = pausedBattle && pausedBattle.G; pausedBattle = null;
  if (!g || g.moneySettled || window.TEST_MODE || typeof walletSet !== 'function') return;
  g.moneySettled = true; walletSet(Math.max(0, Math.floor(g.money || 0)));
}
// 從劇情地圖走出入口時呼叫（js/game.js 的 enterPortal）：要去的正是暫停中的那張地圖，就換過去並把戰場放回去；回傳有沒有接續
function resumePausedBattle(toId) {
  if (!pausedBattle) return false;
  if (!MAP_STORY || toId !== pausedBattle.mapId || mapIndexById(toId) < 0) { dropPausedBattle(); return false; }
  const b = pausedBattle; pausedBattle = null;
  b.G.money = G.money;   // 在劇情地圖蓋燈花掉的經費，算在這場作戰裡
  switchMap(mapIndexById(toId));
  closeElevatorMenu(); closeSupplyShop(true); closeBackpack(true); closeDialogue(true); closeSentryMenu(); closeGroundMenu(); assigning = null; setPaused(false);
  G = b.G; mapWalls = b.walls; mapDoors = b.doors; doorAddedWalls = b.doorWalls; mapSolidOffsets = b.offsets;
  if (b.mrtWalls) mrtAddedWalls = b.mrtWalls;
  if (b.breakCells) { breakableWallCells = b.breakCells; breakableWallSolid = b.breakSolid; }
  if (b.storageWalls) storageAddedWalls = b.storageWalls;
  poweredMap = MAP; mapPowerOn = b.power; openElevatorStamp = b.elevator;
  sanitySP = G.guide; rememberGuideSP(); applyOutfits(); occCache = null; occCacheFor = null;
  computeFlow(); updateCamera(); updateHUD(); updateBuildToggle();
  return true;
}

// ---- 劇情地圖裡蓋的建築會留著（例如在時間混亂的房間放的燈）----
// 劇情地圖每次走進來都是新的一份 G，蓋過的建築本來會不見。這裡把溫特蓋的建築（playerBuilt）依地圖記在存檔裡：
// 蓋好、拆掉、離開這張地圖時記下來；下次走進來（js/game.js 的 newGame）照原樣擺回去，不用再花錢。
// 「開始新遊戲」會清掉（js/new-game.js 的 progressKeys）。
const STORY_BUILDS_KEY = 'tudrc_story_builds_v1';
function readStoryBuilds() { try { return JSON.parse(localStorage.getItem(STORY_BUILDS_KEY) || '{}') || {}; } catch (_) { return {}; } }
function rememberStoryBuilds() {
  if (!MAP_STORY || !MAP || !G || !Array.isArray(G.obstacles) || window.STORY_MODE) return;
  const all = readStoryBuilds();
  all[MAP.id] = G.obstacles.filter(o => o.playerBuilt && !(o.hp <= 0)).map(o => ({
    type: o.type, orient: o.orient, c: o.c, r: o.r, w: o.w, h: o.h, solid: o.solid || [], hp: o.hp, maxhp: o.maxhp, trap: !!o.trap, slow: o.slow || null }));
  if (!all[MAP.id].length) delete all[MAP.id];
  try { localStorage.setItem(STORY_BUILDS_KEY, JSON.stringify(all)); } catch (_) {}
}
function restoreStoryBuilds() {
  if (!MAP_STORY || !MAP || window.STORY_MODE) return;
  for (const b of readStoryBuilds()[MAP.id] || []) {
    const cells = (b.solid || []).map(([dc, dr]) => (b.c + dc) + ',' + (b.r + dr));
    if (cells.some(k => G.grid[k] || mapWalls.has(k))) continue;   // 地圖改過、那裡被擋住了：這個就不放
    const o = { kind: 'obstacle', playerBuilt: true, type: b.type, orient: b.orient, c: b.c, r: b.r, w: b.w, h: b.h,
      solid: (b.solid || []).map(x => x.slice()), hp: b.hp, maxhp: b.maxhp, trap: !!b.trap, slow: b.slow || null };
    for (const k of cells) G.grid[k] = o;
    G.obstacles.push(o);
  }
}
addEventListener('pagehide', rememberStoryBuilds);   // 關掉、重新整理網頁前也記一次
