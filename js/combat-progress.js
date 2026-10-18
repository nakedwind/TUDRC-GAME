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
    poweredMap = MAP; mapPowerOn = new Set(Array.isArray(data.power) ? data.power : data.power ? [0] : []);   // 舊存檔：true＝沒編號的電路開著 openElevatorStamp = data.elevator;
    sanitySP = G.guide; applyOutfits(); occCache = null; occCacheFor = null;
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
