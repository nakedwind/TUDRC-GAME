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
function suspendCombatProgress() {
  const all = readCombatProgress();
  all[MAP.id] = { signature: combatMapSignature(), graph: combatGraphEncode({
    state: { ...G, effects: [] }, walls: mapWalls, doors: mapDoors, doorWalls: doorAddedWalls,
    offsets: mapSolidOffsets, activeSupply: sortie.active, power: [...mapPowerOn], elevator: openElevatorStamp,
  }, MAP.stamps || []) };
  localStorage.setItem(COMBAT_PROGRESS_KEY, JSON.stringify(all));
}
function restoreCombatProgress() {
  if (MAP_SAFE || !MAP) return false;
  const saved = readCombatProgress()[MAP.id]; if (!saved) return false;
  if (saved.signature !== combatMapSignature()) { clearCombatProgress(MAP.id); systemNotice('地圖已更新，本次作戰重新部署'); return false; }
  try {
    const data = combatGraphDecode(saved.graph, MAP.stamps || []);
    if (!data.state?.player || !(data.walls instanceof Set)) throw new Error('戰場資料不完整');
    G = data.state; mapWalls = data.walls; mapDoors = data.doors; doorAddedWalls = data.doorWalls; mapSolidOffsets = data.offsets;
    sortie.active = data.activeSupply; sortieLastSafe = false; saveSortie();
    poweredMap = MAP; mapPowerOn = new Set(Array.isArray(data.power) ? data.power : data.power ? [0] : []);   // 舊存檔：true＝沒編號的電路開著
    openElevatorStamp = data.elevator || null;   // 電梯開著還是關著（擋路格已經跟著 mapWalls 一起還原）
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
    if (action === 'preserve') suspendCombatProgress(); else clearCombatProgress(MAP.id);
  } catch (_) { systemNotice('無法儲存作戰進度，請確認儲存空間後重試', true); return; }
  closeGroundMenu(); saveGame();
  if (action === 'restart') { begin(false); updateCamera(); }
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
