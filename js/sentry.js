/* ===== 哨兵系統 =====
   哨兵是會走動的人：開場佈署、巡邏移動 AI、點擊選單（巡邏/指派/疏導）。
   哨兵數值在 data/balance.js 的 TYPES。
*/
// ---- 基地裡每個人平時在哪（data/npc-locations.js，由「基地編輯器」匯出）----
// 從「🏠 基地編輯器」按「▶ 預覽遊戲」開的遊戲（?preview=1）會用編輯器裡還沒匯出的名單
const NPC_LOC_DRAFT_KEY = 'tudrc_npc_locations_v1';
const npcLocationData = (() => {
  if (/[?&]preview=1(&|$)/.test(location.search)) {
    try { const d = JSON.parse(localStorage.getItem(NPC_LOC_DRAFT_KEY) || 'null'); if (d && d.chapters) return d.chapters; } catch (_) {}
  }
  return typeof NPC_LOCATIONS !== 'undefined' ? NPC_LOCATIONS : {};
})();
// 目前章節的名單（≤ 目前章節的最大那一章）
function npcLocationTable() {
  const ch = typeof CHAPTER !== 'undefined' ? CHAPTER : 1;
  const all = Object.keys(npcLocationData).map(Number).sort((a, b) => a - b);
  if (!all.length) return {};
  const usable = all.filter(k => k <= ch);
  return npcLocationData[usable.length ? usable[usable.length - 1] : all[0]] || {};
}
// 這個人平時在哪裡：{ map, rect?:[c0,r0,c1,r1], area? } 或 null（不在基地）
// 受傷住院、負荷高的隊員先問 js/vitals.js（醫院、疏導室）；只換地圖，平常就不在基地的人照樣不出現
let tinoSootheVisit = null;   // 本次遊戲中，堤諾走進疏導室後改在室內活動。
function npcLocation(id) {
  const loc = npcLocationTable()[id] || null;
  const moved = loc && typeof vitalsLocation === 'function' ? vitalsLocation(id) : null;
  if (moved) return moved;
  if (id === 'tino' && loc && loc.map === '2F應變中心' && tinoSootheVisit) return tinoSootheVisit;
  return loc;
}

// 使用實際地圖的連接門與尋路；到門口才換所在地，不切換玩家的地圖。
function tinoSootheTripStep(t, dt) {
  if (!MAP_SAFE || MAP.name !== '2F應變中心' || t.type !== 'tino' || tinoSootheVisit) return false;
  const loc = npcLocation(t.type);
  if (!loc || loc.map !== MAP.name || t.vitalsLeaving || t.berserk) return false;
  const room = mapList().find(m => m.name === '2F疏導室');
  const doors = room && (MAP.portals || []).filter(p => p.to === room.id);
  if (!doors || !doors.length) return false;
  if (menuSentry === t || t.rootT > 0) return true;
  if (!t.sootheDoor || t.navFailed) {
    const candidates = [];
    for (const door of doors) for (const [dc, dr] of [[0, 0], [0, 1], [1, 0], [-1, 0], [0, -1]]) {
      const c = door.c + dc, r = door.r + dr;
      if (!sentryCellWalkable(c, r)) continue;
      const [x, y] = center(c, r), path = buildSentryPath(t, x, y);
      if (path) candidates.push({ x, y, cost: path.length + Math.hypot(dc, dr) * 2 });
    }
    candidates.sort((a, b) => a.cost - b.cost);
    t.sootheDoor = candidates[0] || null;
    t.navPath = null; t.navGoal = null;
  }
  if (!t.sootheDoor) return true;   // 門暫時被擋住時等待，不隔牆傳送。
  t.target = null; t.seatGoal = null; t.waitT = 0;
  if (moveSentryWithPath(t, t.sootheDoor.x, t.sootheDoor.y, TYPES[t.type].walkSpeed || 80, dt)) {
    const entrance = (room.portals || []).find(p => p.to === MAP.id);
    tinoSootheVisit = { map: room.name, ...(entrance ? { spawn: [entrance.c, entrance.r] } : {}) };
    G.towers = G.towers.filter(a => a !== t);
  }
  return true;
}

// ---- 平時活動範圍：rect＝基地編輯器在地圖上框的方框；area＝舊寫法（NPC_AREAS 用素材圍出來的範圍）----
const homeAreaCache = { map: null, areas: {} };
function homeAreaOf(id) {
  if (!MAP_SAFE || !MAP) return null;
  const loc = npcLocation(id);
  if (!loc || loc.map !== MAP.name) return null;
  if (homeAreaCache.map !== MAP) { homeAreaCache.map = MAP; homeAreaCache.areas = {}; }
  let c0 = Infinity, r0 = Infinity, c1 = -Infinity, r1 = -Infinity, key;
  const boxes = (Array.isArray(loc.rects) ? loc.rects : []).filter(rc => Array.isArray(rc) && rc.length === 4).map(rc => rc.map(Number));
  if (boxes.length) {   // 好幾個方框（基地編輯器框的）：合起來就是活動範圍
    key = 'rects:' + JSON.stringify(boxes);
    if (key in homeAreaCache.areas) return homeAreaCache.areas[key];
    const cells = [], seen = new Set();
    for (const [a0, b0, a1, b1] of boxes) for (let c = Math.max(0, a0); c <= Math.min(COLS - 1, a1); c++) for (let r = Math.max(0, b0); r <= Math.min(ROWS - 1, b1); r++) {
      const k = c + ',' + r; if (seen.has(k)) continue; seen.add(k);
      if (isWall(c, r) || isEntrance(c, r) || G.grid[k]) continue;
      const [x, y] = center(c, r);
      if (!sentryBlocked(x, y)) cells.push([c, r]);
    }
    const px = boxes.map(([a0, b0, a1, b1]) => ({ x0: OX + a0 * CELL, y0: OY + b0 * CELL, x1: OX + (a1 + 1) * CELL, y1: OY + (b1 + 1) * CELL }));
    const area = cells.length ? { cells, boxes: px, x0: Math.min(...px.map(b => b.x0)), y0: Math.min(...px.map(b => b.y0)), x1: Math.max(...px.map(b => b.x1)), y1: Math.max(...px.map(b => b.y1)) } : null;
    return homeAreaCache.areas[key] = area;
  }
  if (Array.isArray(loc.rect) && loc.rect.length === 4) {
    [c0, r0, c1, r1] = loc.rect.map(Number);
    key = 'rect:' + loc.rect.join(',');
    if (key in homeAreaCache.areas) return homeAreaCache.areas[key];
  } else if (loc.area && typeof NPC_AREAS !== 'undefined' && NPC_AREAS[loc.area]) {
    key = 'area:' + loc.area;
    if (key in homeAreaCache.areas) return homeAreaCache.areas[key];
    const def = NPC_AREAS[loc.area], prefixes = [].concat(def.stamps), pad = def.pad ?? 1;
    for (const s of MAP.stamps || []) {
      if (!prefixes.some(p => String(s.id).startsWith(p))) continue;
      const t = mapTileById(s.id); if (!t) continue;
      c0 = Math.min(c0, s.c); r0 = Math.min(r0, s.r);
      c1 = Math.max(c1, s.c + mapTileW(t) - 1); r1 = Math.max(r1, s.r + mapTileH(t) - 1);
    }
    if (c0 <= c1) { c0 -= pad; r0 -= pad; c1 += pad; r1 += pad; }
  } else return null;   // 沒框範圍：整張地圖閒逛
  let area = null;
  if (c0 <= c1 && r0 <= r1) {
    c0 = Math.max(0, c0); r0 = Math.max(0, r0); c1 = Math.min(COLS - 1, c1); r1 = Math.min(ROWS - 1, r1);
    const cells = [];   // 範圍內站得住的格子
    for (let c = c0; c <= c1; c++) for (let r = r0; r <= r1; r++) {
      if (isWall(c, r) || isEntrance(c, r) || G.grid[c + ',' + r]) continue;
      const [x, y] = center(c, r);
      if (!sentryBlocked(x, y)) cells.push([c, r]);
    }
    if (cells.length) area = { c0, r0, c1, r1, cells, x0: OX + c0 * CELL, y0: OY + r0 * CELL, x1: OX + (c1 + 1) * CELL, y1: OY + (r1 + 1) * CELL };
  }
  return homeAreaCache.areas[key] = area;
}
function inHomeArea(area, x, y) {   // 好幾個方框：在任何一個裡面就算
  if (area.boxes) return area.boxes.some(b => x >= b.x0 && x <= b.x1 && y >= b.y0 && y <= b.y1);
  return x >= area.x0 && x <= area.x1 && y >= area.y0 && y <= area.y1;
}
// 活動範圍裡隨機挑一個點（偏好離自己不太遠，看起來像在房間裡踱步）
function sampleHomeTarget(area, a) {
  const near = area.cells.filter(([c, r]) => { const [x, y] = center(c, r); return Math.hypot(x - a.x, y - a.y) < 200; });
  const pool = near.length > 3 && inHomeArea(area, a.x, a.y) ? near : area.cells;
  const [c, r] = pool[Math.floor(Math.random() * pool.length)];
  const [x, y] = center(c, r);
  return { x: x + (Math.random() - .5) * 14, y: y + (Math.random() - .5) * 14 };
}
function placeInHomeArea(a, id) {
  const area = homeAreaOf(id); if (!area) return;
  const taken = new Set([...(G.towers || []), ...(G.npcs || [])].filter(o => o !== a).map(o => cellAt(o.x, o.y).join(',')));
  const free = area.cells.filter(cell => !taken.has(cell.join(',')));
  const [c, r] = (free.length ? free : area.cells)[Math.floor(Math.random() * (free.length || area.cells.length))];
  [a.x, a.y] = center(c, r);
}
// 指定出生格優先使用；若格子被牆、物件或其他角色佔住，改找最近的可站格。
function placeAtConfiguredSpawn(a, id) {
  if (!MAP_SAFE || !MAP) return false;
  const loc = npcLocation(id);
  if (!loc || loc.map !== MAP.name || !Array.isArray(loc.spawn) || loc.spawn.length !== 2) return false;
  const c0 = Number(loc.spawn[0]), r0 = Number(loc.spawn[1]);
  if (!Number.isInteger(c0) || !Number.isInteger(r0) || !inGrid(c0, r0)) return false;
  const area = homeAreaOf(id), taken = new Set([...(G.towers || []), ...(G.npcs || [])]
    .filter(o => o !== a).map(o => cellAt(o.x, o.y).join(',')));
  const canStand = ([c, r]) => {
    if (!inGrid(c, r) || isWall(c, r) || isEntrance(c, r) || G.grid[c + ',' + r] || taken.has(c + ',' + r)) return false;
    const [x, y] = center(c, r);
    return !sentryBlocked(x, y);
  };
  const exact = [c0, r0];
  if (canStand(exact)) { [a.x, a.y] = center(c0, r0); return true; }
  let candidates = area ? area.cells.slice() : [];
  if (!area) for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++) candidates.push([c, r]);
  candidates.sort((a, b) => Math.abs(a[0] - c0) + Math.abs(a[1] - r0) - Math.abs(b[0] - c0) - Math.abs(b[1] - r0));
  const nearest = candidates.find(canStand);
  if (!nearest) return false;
  [a.x, a.y] = center(nearest[0], nearest[1]);
  return true;
}

// ---- 基地裡：這個人平時是不是在這張地圖（data/npc-locations.js）----
function npcHomeHere(id) {
  if ((!MAP_SAFE && !(typeof practiceOn === 'function' && practiceOn())) || !MAP) return false;   // 訓練室練習中：塔納他們照樣在
  const loc = npcLocation(id);
  return !!loc && loc.map === MAP.name;
}
// 在整張地圖隨機挑一個站得住、沒人的格子（平時在這張地圖、又沒有指定活動範圍的人用）
// 溫特走得到的格子：從這張地圖的出生點、出入口往外找。房間外面看不見、但不算牆的空白區走不到，就不會把人放到那裡
// （放隊員時溫特還沒移到這張地圖，所以用 playerSpawnPos 跟出入口，不用 G.player 的位置）
function reachableFromPlayer() {
  const seeds = [];
  if (typeof playerSpawnPos === 'function') seeds.push(cellAt(...playerSpawnPos()));
  for (const p of (typeof mapPortals !== 'undefined' && mapPortals) || []) seeds.push([p.c, p.r]);
  if (!seeds.length) return null;
  const seen = new Set(seeds.map(([c, r]) => c + ',' + r)), queue = seeds.slice();
  while (queue.length) {
    const [c, r] = queue.shift();
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nc = c + dc, nr = r + dr, k = nc + ',' + nr;
      if (seen.has(k) || !inGrid(nc, nr) || isWall(nc, nr) || G.grid[k]) continue;
      const [x, y] = center(nc, nr); if (sentryBlocked(x, y)) continue;
      seen.add(k); queue.push([nc, nr]);
    }
  }
  return seen.size > 1 ? seen : null;
}
function placeAnywhere(a) {
  const taken = new Set([...(G.towers || []), ...(G.npcs || [])].filter(o => o !== a).map(o => cellAt(o.x, o.y).join(',')));
  const reach = reachableFromPlayer(), cells = [];   // 只挑溫特走得到的地方（例如被送去疏導室的隊員，不會跑到房間外面）
  for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++) {
    if (isWall(c, r) || isEntrance(c, r) || G.grid[c + ',' + r] || taken.has(c + ',' + r)) continue;
    if (reach && !reach.has(c + ',' + r)) continue;
    const [x, y] = center(c, r);
    if (!sentryBlocked(x, y)) cells.push([c, r]);
  }
  if (!cells.length) return;
  const [c, r] = cells[Math.floor(Math.random() * cells.length)];
  [a.x, a.y] = center(c, r);
}

// ---- 開場佈署：三位哨兵在基地（營地）區隨機位置出現 ----
function spawnSentries() {
  const cand = [];
  if (campCells.size) campCells.forEach(k => cand.push(k.split(',').map(Number)));
  else for (let c = 0; c < COLS; c++) cand.push([c, ROWS - 1]);   // 沒自訂營地＝最下排
  const ok = cand.filter(([c, r]) => inGrid(c, r) && !isWall(c, r) && !isEntrance(c, r) && !G.grid[c + ',' + r]);
  // 應變中心是全員集合的安全區；戰鬥地圖仍只生成已編入的出勤隊伍。
  // 基地（安全區）：出勤隊伍不跟著溫特，只出現「平時在這張地圖」的人（data/npc-locations.js）；戰鬥地圖：出勤隊伍
  const team = MAP_SAFE
    ? (typeof ROSTER !== 'undefined' ? ROSTER : Object.keys(TYPES)).filter(npcHomeHere)
    : (typeof practiceOn === 'function' && practiceOn()) ? practice.team.slice()   // 訓練室：在塔納那裡選的隊員（js/practice.js）
    : ((typeof getTeam === 'function') ? getTeam() : Object.keys(TYPES));
  for (const type of team) {
    const spec = TYPES[type]; if (!spec) continue;
    const cell = ok.length ? ok.splice(Math.floor(Math.random() * ok.length), 1)[0] : [Math.floor(COLS / 2), ROWS - 1];
    const [x, y] = center(cell[0], cell[1]);
    const t = { kind: 'tower', type, x, y, hp: spec.hp, maxhp: spec.hp, cd: 0, taint: 0, berserk: false, mode: 'free', target: null, anchor: null, waitT: 0.4 + Math.random() };
    if (spec.guide && typeof initGuideSP === 'function') initGuideSP(t);
    if (!MAP_SAFE && typeof applySortieBuff === 'function') applySortieBuff(t);   // 出勤補給（js/sortie-supply.js）
    if (typeof applyVitals === 'function') applyVitals(t);   // 用現在的 HP、負荷（不會每張地圖補滿，js/vitals.js）
    G.towers.push(t);
    const configuredSpawn = placeAtConfiguredSpawn(t, type);
    if (!configuredSpawn) placeInHomeArea(t, type);   // 未指定出生格時，沿用活動範圍內的隨機出生
    if (MAP_SAFE && !configuredSpawn && !homeAreaOf(type)) placeAnywhere(t);   // 沒有指定出生格或活動範圍：整張地圖隨機一個位置
  }
}

// ---- 場景 NPC：從營地附近出生，只在亮處自由走動 ----
function spawnWanderers() {
  // 基地（安全區）：只出現平時在這張地圖的人（data/npc-locations.js）；戰鬥地圖：勾了「場景 NPC」才有
  const deployed = typeof getTeam === 'function' ? getTeam() : [];
  const list = MAP_SAFE || (typeof practiceOn === 'function' && practiceOn()) ? WANDERERS.filter(w => npcHomeHere(w.id))
    : WANDERERS.filter(w => w.id === 'ball' ? deployed.includes('ball') && hasDogHandler(deployed) : MAP_NPCS);
  if (!list.length) return;
  const candidates = [], seen = new Set();
  const occupied = new Set(G.towers.map(t => cellAt(t.x, t.y).join(',')));
  const addCell = (c, r) => {
    const key = c + ',' + r;
    if (seen.has(key) || occupied.has(key) || !inGrid(c, r) || isWall(c, r) || isEntrance(c, r) || G.grid[key]) return;
    seen.add(key); candidates.push([c, r]);
  };

  if (campCells.size) campCells.forEach(key => addCell(...key.split(',').map(Number)));
  else for (let c = 0; c < COLS; c++) addCell(c, ROWS - 1);
  for (let r = ROWS - 1; r >= 0; r--) for (let c = 0; c < COLS; c++) addCell(c, r);

  for (const profile of list) {
    const cell = candidates.shift() || [Math.floor(COLS / 2), ROWS - 1];
    const [x, y] = center(cell[0], cell[1]);
    G.npcs.push({
      kind: 'npc', id: profile.id, x, y, target: null,
      waitT: 0.5 + Math.random() * 1.5, dir: 'front', moving: false, anim: 0,
      blinkWait: 2 + Math.random() * 3, blinkTime: -1,
      say: null, sayWait: 2 + Math.random() * 8,   // 平時對話：倒數到 0 冒一句
    });
    const npc = G.npcs[G.npcs.length - 1];
    const configuredSpawn = placeAtConfiguredSpawn(npc, profile.id);
    if (!configuredSpawn) placeInHomeArea(npc, profile.id);   // 未指定出生格時，沿用活動範圍內的隨機出生
    if (MAP_SAFE && !configuredSpawn && !homeAreaOf(profile.id)) placeAnywhere(npc);   // 沒有指定出生格或活動範圍：整張地圖隨機一個位置
  }
}

// ---- 哨兵移動 AI（哨兵是「人」：在亮處走動巡邏）----
// 模式：free=自由走動（亮處隨便逛）/ hold=在錨點附近小範圍巡邏 / goto=走去指派位置後轉 hold
function sentryBlocked(x, y) {
  const r = 12;
  for (const [sx, sy] of [[-r, -r], [r, -r], [-r, r], [r, r]]) {
    const px = x + sx, py = y + sy;
    const [c, rr] = cellAt(px, py);
    if (!inGrid(c, rr) || G.grid[c + ',' + rr]) return true;
    if (solidBlocksPoint(px, py)) return true;      // 不可穿透（含像素微調）
  }
  return false;
}
// 身體邊緣也要留在光內，避免中心仍亮、人物已踏進黑暗。
const CORE_GLOW_WALK = 4;   // 醒著的異質核心會發光：周圍幾格內隊員也能走進去（才打得到核心）
function personnelInLight(x, y) {
  if (MAP_SAFE || !LIGHT.enabled) return true;
  if (G && G.cores && G.cores.some(c => c.awake && !c.dead && Math.hypot(c.x - x, c.y - y) <= CORE_GLOW_WALK * CELL)) return true;
  return [[0,0],[-12,-12],[12,-12],[-12,12],[12,12]]
    .every(([dx,dy]) => isLit(x + dx, y + dy));
}
function personnelStepAllowed(x, y, tx, ty, allowDark = false) {
  const steps = Math.max(1, Math.ceil(Math.hypot(tx-x, ty-y) / 4));
  for (let i = 1; i <= steps; i++) {
    const px = x + (tx-x)*i/steps, py = y + (ty-y)*i/steps;
    if (sentryBlocked(px, py) || (!allowDark && !personnelInLight(px, py))) return false;
  }
  return true;
}
function darkEscapeCell(c, r) {
  if (!inGrid(c, r) || isWall(c, r) || isEntrance(c, r) || G.grid[c + ',' + r]) return false;
  const [x, y] = center(c, r);
  return !sentryBlocked(x, y);
}
function pathToLight(actor) {
  const [sc, sr] = cellAt(actor.x, actor.y), startKey = sc + ',' + sr;
  const queue = [[sc, sr]], cameFrom = new Map([[startKey, null]]);
  let partialGoal = null, goal = null;
  for (let head = 0; head < queue.length; head++) {
    const [c, r] = queue[head], key = c + ',' + r, [x, y] = center(c, r);
    if (personnelInLight(x, y)) { goal = key; break; }
    if (!partialGoal && isLit(x, y)) partialGoal = key;
    for (const [dc, dr] of [[0,-1],[1,0],[0,1],[-1,0]]) {
      const nc = c + dc, nr = r + dr, nextKey = nc + ',' + nr;
      if (cameFrom.has(nextKey) || !darkEscapeCell(nc, nr)) continue;
      cameFrom.set(nextKey, key); queue.push([nc, nr]);
    }
  }
  goal ||= partialGoal;
  if (!goal) return null;
  const path = [];
  for (let key = goal; key && key !== startKey; key = cameFrom.get(key)) {
    const [c, r] = key.split(',').map(Number); path.push({ c, r });
  }
  if (!path.length) path.push({ c: sc, r: sr });
  return path.reverse();
}
function escapeDarkness(actor, dt) {
  // 被召喚（summonDark）：召喚的優先順序比「怕黑」高，途中穿過黑暗也照走；到了、或改成別的命令就恢復怕黑
  if (actor.summonDark && actor.mode !== 'goto') actor.summonDark = false;
  if (actor.summonDark) return false;
  if (MAP_SAFE || !LIGHT.enabled || personnelInLight(actor.x, actor.y)) {
    if (actor.mode === 'goto' && actor.darkResumeTarget) actor.target = actor.darkResumeTarget;
    if (actor.escapePath) {
      actor.navPath = null;
      actor.navGoal = null;
      actor.navTimer = 0;
    }
    actor.darkResumeTarget = null;
    actor.escapePath = null; actor.escapeTimer = 0;
    return false;
  }
  if (actor.mode !== 'goto') actor.darkResumeTarget = null;
  else if (actor.target) actor.darkResumeTarget = actor.target;
  actor.target = null; actor.waitT = 0;
  actor.escapeTimer = (actor.escapeTimer || 0) - dt;
  const goal = actor.escapePath?.at(-1);
  // 找不到光時也等計時器到再重找，不要每幀都整張地圖搜一次
  if (actor.escapeTimer <= 0 || (actor.escapePath?.length && (!goal || !darkEscapeCell(goal.c, goal.r)))) {
    actor.escapePath = pathToLight(actor) || [];
    actor.escapeTimer = .5;
  }
  const next = actor.escapePath?.[0];
  if (!next) return true;
  const [tx, ty] = center(next.c, next.r);
  const dx = tx - actor.x, dy = ty - actor.y, distance = Math.hypot(dx, dy);
  if (distance <= 2) { actor.escapePath.shift(); return true; }
  const step = Math.min(distance, Math.max(100, (TYPES[actor.type]?.walkSpeed || 65) * 1.25) * dt);
  const nx = actor.x + dx / distance * step, ny = actor.y + dy / distance * step;
  const oldX = actor.x, oldY = actor.y;
  if (personnelStepAllowed(actor.x, actor.y, nx, actor.y, true)) actor.x = nx;
  if (personnelStepAllowed(actor.x, actor.y, actor.x, ny, true)) actor.y = ny;
  if (Math.hypot(actor.x - oldX, actor.y - oldY) < .001) actor.escapeTimer = 0;
  return true;
}
// ignoreFire：被推出火海時用，只看地形，不把火當成擋路；allowDark：被召喚時，黑暗的格子也能走
function sentryCellWalkable(c, r, ignoreFire = false, allowDark = false) {
  if (!inGrid(c, r) || isWall(c, r) || isEntrance(c, r) || G.grid[c + ',' + r]) return false;
  const [x, y] = center(c, r);
  if (sentryBlocked(x, y)) return false;
  if (!ignoreFire && typeof oilFireAt === 'function' && oilFireAt(x, y, 6)   // 燒著的火海：找路時繞開（js/oil-barrels.js）
      && !(typeof sentryFireTrait === 'function' && sentryFireTrait(sentryFireWalker))) return false;   // 希奧妮、雷德不繞（js/game.js 的 SENTRY_FIRE_TRAITS）
  if (!allowDark && !personnelInLight(x, y)) return false;
  return true;
}
function nearestSentryGoal(c, r) {
  for (let radius = 0; radius <= 4; radius++) {
    let best = null, bestDistance = Infinity;
    for (let dc = -radius; dc <= radius; dc++) for (let dr = -radius; dr <= radius; dr++) {
      if (radius && Math.abs(dc) !== radius && Math.abs(dr) !== radius) continue;
      const nc = c + dc, nr = r + dr;
      if (!sentryCellWalkable(nc, nr)) continue;
      const distance = Math.abs(dc) + Math.abs(dr);
      if (distance < bestDistance) { best = [nc, nr]; bestDistance = distance; }
    }
    if (best) return best;
  }
  return null;
}
// 哨兵用格線 BFS 尋路。與怪物的營地流場分開，因為哨兵的目的地會隨指令與敵人改變。
function buildSentryPath(t, targetX, targetY, allowDark = !!t.summonDark) {   // allowDark：找一條可以穿過黑暗的路（召喚時）
  const [sc, sr] = cellAt(t.x, t.y), [rawGc, rawGr] = cellAt(targetX, targetY);
  const goal = nearestSentryGoal(rawGc, rawGr); if (!goal) return null;
  const [gc, gr] = goal, startKey = sc + ',' + sr, goalKey = gc + ',' + gr;
  if (startKey === goalKey) return [];
  const queue = [[sc, sr]], cameFrom = new Map([[startKey, null]]);
  let head = 0;
  while (head < queue.length) {
    const [c, r] = queue[head++];
    if (c === gc && r === gr) break;
    for (const [dc, dr] of [[0,-1],[1,0],[0,1],[-1,0]]) {
      const nc = c + dc, nr = r + dr, key = nc + ',' + nr;
      if (cameFrom.has(key) || !sentryCellWalkable(nc, nr, false, allowDark)) continue;
      cameFrom.set(key, c + ',' + r); queue.push([nc, nr]);
    }
  }
  if (!cameFrom.has(goalKey)) return null;
  const path = []; let key = goalKey;
  while (key && key !== startKey) {
    const [c, r] = key.split(',').map(Number); path.push({ c, r }); key = cameFrom.get(key);
  }
  return path.reverse();
}
function moveSentryWithPath(t, targetX, targetY, speed, dt) {
  const [goalC, goalR] = cellAt(targetX, targetY), goalKey = goalC + ',' + goalR;
  t.navTimer = (t.navTimer || 0) - dt;
  const next = t.navPath && t.navPath[0];
  const dark = !!t.summonDark;   // 被召喚：可以穿過黑暗
  if (t.navGoal !== goalKey || (!t.navPath && t.navTimer <= 0) || t.navStall > .8 || (next && !sentryCellWalkable(next.c, next.r, false, dark))) {
    t.navPath = buildSentryPath(t, targetX, targetY); t.navGoal = goalKey; t.navTimer = .75;
    t.navStall = 0;
  }
  if (!t.navPath) { t.navFailed = true; return false; }
  t.navFailed = false;
  // 必須到達轉彎格中心，不能剛跨入格子就跳過路點，否則會切角卡牆。
  while (t.navPath.length) {
    const [wx, wy] = center(t.navPath[0].c, t.navPath[0].r);
    if (Math.hypot(wx - t.x, wy - t.y) > 1) break;
    t.navPath.shift();
  }
  const waypoint = t.navPath && t.navPath[0];
  let moveX = targetX, moveY = targetY;
  if (!waypoint && (sentryBlocked(moveX, moveY) || !personnelInLight(moveX, moveY))) {
    const goal = nearestSentryGoal(goalC, goalR);
    if (!goal) { t.navFailed = true; return false; }
    [moveX, moveY] = center(...goal);
  }
  if (waypoint) [moveX, moveY] = center(waypoint.c, waypoint.r);
  const dx = moveX - t.x, dy = moveY - t.y, distance = Math.hypot(dx, dy), step = speed * dt * (typeof slowFactorAt === 'function' ? slowFactorAt(t.x, t.y, 'ally') : 1);   // 走在鐵絲網上變慢
  if (distance <= step && personnelStepAllowed(t.x, t.y, moveX, moveY, dark)) {
    t.x = moveX; t.y = moveY;
    if (waypoint) t.navPath.shift();
    return !waypoint;
  }
  if (distance <= 0) return true;
  const nx = t.x + dx / distance * step, ny = t.y + dy / distance * step;
  const oldX = t.x, oldY = t.y;
  if (personnelStepAllowed(t.x, t.y, nx, t.y, dark)) t.x = nx;
  if (personnelStepAllowed(t.x, t.y, t.x, ny, dark)) t.y = ny;
  const moved = Math.hypot(t.x - oldX, t.y - oldY) > .001;
  t.navStall = Math.hypot(dx, dy) > 2 && !moved ? (t.navStall || 0) + dt : 0;
  if (t.navStall > .8) { t.navTimer = 0; t.navFailed = true; }
  return false;
}
// 在 (cx,cy) 周圍找一個「亮的、走得到」的隨機點
function sampleWanderTarget(cx, cy, radius) {
  for (let i = 0; i < 12; i++) {
    const ang = Math.random() * Math.PI * 2, d = 30 + Math.random() * radius;
    const x = cx + Math.cos(ang) * d, y = cy + Math.sin(ang) * d;
    const [c, r] = cellAt(x, y);
    if (!inGrid(c, r) || isWall(c, r) || isEntrance(c, r) || G.grid[c + ',' + r]) continue;
    if (sentryBlocked(x, y) || !personnelInLight(x, y)) continue;
    return { x, y };
  }
  return null;
}
function sentryCompanionRule(t) {
  if (t.mode === 'escort' && G.player) {   // 跟隨護衛：貼在部隊長身邊，走得比平常快才跟得上
    const speed = Math.max(110, (TYPES[t.type].walkSpeed || 80) * 1.45);
    return { anchor: G.player, radius: ESCORT.radiusCells * CELL, speed };
  }
  if (t.mode !== 'free' || typeof FOLLOW === 'undefined') return null;
  if (t.type === 'avaren') {
    const anchor = (G.towers || []).find(x => x !== t && x.type === 'eldrin' && x.hp > 0);
    if (anchor) return { anchor, radius: (FOLLOW.avaren.radiusCells || 4) * CELL, speed: FOLLOW.avaren.speed || 96 };
  }
  if (t.type === 'red' && G.player) {
    return { anchor: G.player, radius: (FOLLOW.red.radiusCells || 7) * CELL, speed: FOLLOW.red.speed || 92 };
  }
  return null;
}
// 索敵範圍內有沒有看得見的敵人／核心（有的話護衛圈先讓位給接敵，避免在圈邊抖動）
function hasAggroTarget(t) {
  const spec = TYPES[t.type]; if (!spec) return false;
  const cores = (typeof G.cores !== 'undefined') ? G.cores : [];
  if (!G.enemies.length && !cores.some(c => !c.dead && c.awake)) return false;
  const detectR = (spec.aggroRange || spec.range + 1.5) * CELL;
  for (const e of [...G.enemies, ...cores]) {
    if (e.dead || e.awake === false) continue;   // 沉睡的核心不算目標
    if (typeof eliteHoldFire === 'function' && eliteHoldFire(e)) continue;   // 還在站崗的鳥頭大隊長與手下：不主動接敵（js/elite-bird-head.js）
    if (LIGHT.enabled && !isLit(e.x, e.y) && !(e.awake && cores.includes(e))) continue;   // 醒著的核心會發光，暗處也算看得到
    if (Math.hypot(e.x - t.x, e.y - t.y) <= detectR) return true;
  }
  return false;
}
function redAttacker() {
  const player = G.player, attacker = player && player.lastAttacker;
  return player && player.underAttackT > 0 && attacker && attacker.hp > 0 && !attacker.dead && G.enemies.includes(attacker)
    ? attacker : null;
}
function campAttackerFor(t, maxDistance = Infinity) {
  const base = t.guardBase;
  if (!base || base.hp <= 0 || !G.obstacles.includes(base)) return null;
  let closest = null, bestDistance = maxDistance;
  for (const e of G.enemies) {
    if (e.dead || e.hp <= 0 || e.attackingObstacle !== base) continue;
    if (LIGHT.enabled && !isLit(e.x, e.y)) continue;
    const distance = Math.hypot(e.x - t.x, e.y - t.y);
    if (distance <= bestDistance) { closest = e; bestDistance = distance; }
  }
  return closest;
}
function updateSentry(t, dt) {
  if (t.hp <= 0) { t.target = null; t.moving = false; t.say = null; return; }   // 失去戰鬥能力：頭上的泡泡也收掉
  if (t.eatenBy) { t.target = null; t.moving = false; return; }   // 卡在虱目魚小子嘴裡（js/milkfish-kid.js）
  if (tinoSootheTripStep(t, dt)) return;
  if (MAP_SAFE && typeof npcChatStep === 'function' && npcChatStep(t, dt)) return;   // 基地：正在跟別人閒聊（js/npc-chats.js）
  if (MAP_SAFE && npcSeatStep(t, dt, TYPES[t.type].walkSpeed || 80)) { updateNpcTalk(t, dt); return; }   // 安全區：坐著或正走向椅子
  rescueStuck(t, sentryBlocked);                      // 被卡在建築裡→自動脫困
  if (t.rootT > 0) { t.moving = false; t.knockT = 0; return; }   // 被絲瓜藤纏住：不能移動（js/loofah-lady.js）
  if (stepActorKnock(t, dt, sentryBlocked)) { t.moving = false; return; }   // 被鳥頭人撞飛：滑行中（js/bird-head.js）
  updateNpcTalk(t, dt);                                // 哨兵平時也會冒泡泡說話
  t.guardSpeechCd = Math.max(0, (t.guardSpeechCd || 0) - dt);
  if (t.berserk) { t.target = null; return; }        // 暴走中：站在原地失控
  if (escapeDarkness(t, dt)) return;
  const ownSpec = TYPES[t.type];
  // 召回營地的哨兵抵達後，優先攔截正在破壞營地的怪物。
  if (t.mode !== 'goto' && !ownSpec.guide) {
    const campThreat = campAttackerFor(t);
    if (campThreat) {
      t.target = null; t.waitT = 0;
      if (Math.hypot(campThreat.x - t.x, campThreat.y - t.y) > ownSpec.range * CELL - 6 || !hasLineOfSight(t.x, t.y, campThreat.x, campThreat.y)) {
        moveSentryWithPath(t, campThreat.x, campThreat.y, (ownSpec.walkSpeed || 80) * 1.25, dt);
      }
      return;
    }
  }
  const attacker = t.type === 'red' ? redAttacker() : null;
  if (attacker) {
    if (t.guardSpeechCd <= 0) {
      const guardLine = pickDialogueLine(t.type, 'guard');   // 對話編輯器：衝去保護部隊長時
      if (guardLine) t.say = { text: guardLine, life: 3.4 };
      t.guardSpeechCd = 6;
    }
    t.target = null; t.waitT = 0;
    if (Math.hypot(attacker.x - t.x, attacker.y - t.y) > ownSpec.range * CELL - 6 || !hasLineOfSight(t.x, t.y, attacker.x, attacker.y)) {
      moveSentryWithPath(t, attacker.x, attacker.y, Math.max(170, (ownSpec.walkSpeed || 80) * 2.2), dt);
    }
    return;
  }
  if (menuSentry === t) return;                       // 選單開著時先站好
  // 漆彈標記的怪物（js/special-guns.js）：自由走動、跟隨護衛的哨兵會追過去；原地巡邏、指派位置的不追；不追進黑暗；嚮導不追（有空時在射程內才打）
  const marked = !ownSpec.guide && (t.mode === 'free' || t.mode === 'escort') && typeof paintTarget === 'function' ? paintTarget() : null;
  if (marked && personnelInLight(marked.x, marked.y) && (Math.hypot(marked.x - t.x, marked.y - t.y) > ownSpec.range * CELL - 6 || !hasLineOfSight(t.x, t.y, marked.x, marked.y))) {
    t.target = null; t.waitT = 0;
    moveSentryWithPath(t, marked.x, marked.y, (ownSpec.walkSpeed || 80) * 1.2, dt);
    return;
  }
  // 嚮導保持安全距離：敵人靠近時優先往反方向撤退，仍可在遠處攻擊與治療。
  if (ownSpec.guide && G.enemies.length) {
    let threat = null, threatD = Infinity;
    for (const e of G.enemies) {
      if (e.dead || e.confuseT > 0) continue;
      const d = Math.hypot(e.x - t.x, e.y - t.y);
      if (d < threatD) { threat = e; threatD = d; }
    }
    const safeDistance = (ownSpec.evade || 3) * CELL;
    if (threat && threatD < safeDistance) {
      const dx=t.x-threat.x,dy=t.y-threat.y,d=threatD||1,step=(ownSpec.walkSpeed||80)*1.35*dt;
      const nx=t.x+dx/d*step,ny=t.y+dy/d*step;
      if (personnelStepAllowed(t.x,t.y,nx,t.y)) t.x=nx;
      if (personnelStepAllowed(t.x,t.y,t.x,ny)) t.y=ny;
      t.target=null; t.waitT=0; return;
    }
  }
  // 嚮導身上的急救包或杏仁水用完了：自己回營地物資箱拿（js/camp-supply.js）
  if (ownSpec.guide && typeof guideSupplyStep === 'function' && guideSupplyStep(t, dt)) return;
  // 艾德林完成移動指令後仍主動照顧需要疏導或治療的哨兵；正在前往指定地點時先遵守指令。
  if (!MAP_SAFE && (t.type === 'eldrin' || ownSpec.careFollow) && t.mode !== 'goto' && t.mode !== 'escort') {   // careFollow：塔納也一樣；應變中心裡不跟（受傷的人去醫院休養，js/vitals.js）
    const sentinels = G.towers.filter(o =>
      o !== t && o.hp > 0 && !TYPES[o.type].guide &&
      (o.berserk || (o.taint || 0) >= CAMP_SUPPLY.minTaint || o.maxhp - o.hp >= CAMP_SUPPLY.minHeal)   // 跟疏導／補血的門檻一樣（js/camp-supply.js），免得走過去卻不動手
    );
    if (sentinels.length) {
      sentinels.sort((a, b) => {
        const loadDiff = (b.taint || 0) - (a.taint || 0);
        if (Math.abs(loadDiff) > 1) return loadDiff;
        const injuryDiff = (b.maxhp - b.hp) - (a.maxhp - a.hp);
        if (Math.abs(injuryDiff) > 1) return injuryDiff;
        return Math.hypot(a.x - t.x, a.y - t.y) - Math.hypot(b.x - t.x, b.y - t.y);
      });
      const supportTarget = sentinels.find(o =>
        Math.hypot(o.x - t.x, o.y - t.y) <= ownSpec.aura.r * CELL ||
        buildSentryPath(t, o.x, o.y) !== null
      );
      if (supportTarget) {
        t.supportTarget = supportTarget.type;
        followTarget(t, supportTarget, { dist: CELL * 1.35, speed: (ownSpec.walkSpeed || 80) * 1.12 }, dt);
        t.target = null; t.waitT = 0;
        return; // 支援位置優先；攻擊仍由 game.js 對射程內目標自動執行
      }
    }
  }
  // 玩家明確下達的前往指令優先於追敵與角色跟隨關係，避免目的地被接敵邏輯清除。
  if (t.mode === 'goto' && t.target) {
    const speed = (ownSpec.walkSpeed || 80) * 1.5;
    if (moveSentryWithPath(t, t.target.x, t.target.y, speed, dt)) {
      t.target = null; t.navPath = null; t.navGoal = null;
      t.mode = 'hold'; t.anchor = { x: t.x, y: t.y };
      flash('開始巡邏', t.x, t.y - 24, '#7ee0c0', 3);
      systemNotice(TYPES[t.type].name + '已抵達巡邏點，開始巡邏');
    }
    return;
  }
  // 護衛圈：圈內可自行巡邏；距離被拉開時，會先追上指定角色再恢復自由行動。
  // 玩家明確下達的 goto / hold 指令仍優先，不會被護衛關係覆蓋。
  const companion = sentryCompanionRule(t);
  if (companion && !hasAggroTarget(t)) {   // 有敵可打時交給接敵邏輯，護衛圈先讓位（避免圈邊抖動）
    const companionDistance = Math.hypot(companion.anchor.x - t.x, companion.anchor.y - t.y);
    if (companionDistance > companion.radius) {
      t.target = null; t.waitT = 0;
      followTarget(t, companion.anchor, { dist: companion.radius * .82, speed: companion.speed }, dt);
      return;
    }
    if (t.target && Math.hypot(t.target.x - companion.anchor.x, t.target.y - companion.anchor.y) > companion.radius) {
      t.target = null; t.navPath = null;
    }
  }
  // 主動接敵：看到亮處的怪物就靠近攻擊（開火由 game.js 處理；這裡只負責走過去）
  // 追多遠依模式：自由走動＝追得遠、原地巡邏／指派＝只追崗位附近，怪死或跑遠就回去巡邏。
  const litHere = !LIGHT.enabled || isLit(t.x, t.y);
  const awakeCore = G.cores.some(c => !c.dead && c.awake);   // 醒著的核心會發光：在暗處也看得到、會走過去打
  if (!TYPES[t.type].noAttack && (litHere || awakeCore) && (G.enemies.length || awakeCore)) {   // 不攻擊的嚮導（塔納）：不去追怪
    const spec = TYPES[t.type];
    const atkR = spec.range * CELL;                       // 射程（像素）
    const anchor = t.mode === 'escort' && G.player ? G.player : (t.mode !== 'free' && t.anchor) ? t.anchor : t;   // 護衛時以部隊長為中心
    const detectR = t.guardSummoned ? Math.max(220, (spec.aggroRange || spec.range + 1.5) * CELL) : (spec.aggroRange || spec.range + 1.5) * CELL;
    const holdR = ((typeof PATROL !== 'undefined' && PATROL.holdChaseCells) || 6) * CELL;
    const leashR = t.guardSummoned ? 220 : t.mode === 'escort' ? ESCORT.chaseCells * CELL : t.mode === 'free' ? Math.max(260, detectR) : t.mode === 'hold' ? holdR : 110;
    let foe = null, fd = Infinity;
    for (const e of (t.guardSummoned ? G.enemies : [...G.enemies, ...G.cores])) {
      if (e.dead || e.awake === false) continue;   // 沉睡的核心不去追
      if (typeof eliteHoldFire === 'function' && eliteHoldFire(e)) continue;   // 還在站崗的鳥頭大隊長與手下：不去追
      if (LIGHT.enabled && !isLit(e.x, e.y) && !(e.awake && G.cores.includes(e))) continue;    // 只追亮處看得見的怪（醒著的核心例外）
      if (!litHere && !G.cores.includes(e)) continue;      // 自己站在暗處：只會去打醒著的核心
      if (Math.hypot(e.x - anchor.x, e.y - anchor.y) > leashR) continue;  // 不離崗太遠
      const d = Math.hypot(e.x - t.x, e.y - t.y);
      if (d < fd && d <= detectR) { fd = d; foe = e; }
    }
    if (foe) {
      t.target = null; t.waitT = 0;                       // 取消原本的閒逛
      const stopR = G.cores.includes(foe) ? atkR + (typeof CORE_HIT_PAD !== 'undefined' ? CORE_HIT_PAD : 0) - 10 : atkR - 6;   // 打核心：站在腐蝕池外面就好
      if (fd > stopR || !hasLineOfSight(t.x, t.y, foe.x, foe.y)) {   // 還沒進射程、或隔著牆看不到→繞路靠過去
        moveSentryWithPath(t, foe.x, foe.y, (spec.walkSpeed || 80) * 1.25, dt); // 追敵時也會繞過障礙
      }
      return;                                             // 接敵中：不進入閒逛邏輯
    }
  }
  if (t.waitT > 0) { t.waitT -= dt; return; }
  if (!t.target) {
    if (MAP_SAFE && trySeatActor(t)) return;          // 安全區：路過椅子／床有機率去坐
    const anchor = companion ? companion.anchor : (t.mode === 'hold' && t.anchor ? t.anchor : t);
    const radius = companion ? companion.radius * .92 : (t.mode === 'hold' ? 70 : 200);
    const home = !companion && t.mode === 'free' ? homeAreaOf(t.type) : null;   // 平時待在自己的活動範圍（研究部…）
    const tgt = home ? sampleHomeTarget(home, t) : sampleWanderTarget(anchor.x, anchor.y, radius);
    if (!tgt) { t.waitT = 0.8; return; }
    t.target = tgt; return;
  }
  const sp = (TYPES[t.type].walkSpeed || 80) * (t.mode === 'goto' ? 1.5 * (typeof equipRushMul === 'function' ? equipRushMul() : 1) : 1) * ((t.taint > 85 && !t.berserk) ? 0.5 : 1) * (t.shieldMode ? 1.7 : 1);   // 指派快一點；瀕臨暴走減半；雷德舉盾衝刺加速
  if (moveSentryWithPath(t, t.target.x, t.target.y, sp, dt)) {
    t.target = null; t.navPath = null;
    if (t.mode === 'goto') { t.mode = 'hold'; t.summonDark = false; t.anchor = { x: t.x, y: t.y }; flash('開始巡邏', t.x, t.y - 24, '#7ee0c0', 3); systemNotice(TYPES[t.type].name + '已抵達巡邏點，開始巡邏'); }
    else t.waitT = 0.6 + Math.random() * 1.8;         // 到點後停一下再逛
    return;
  }
  if (t.navFailed) { t.target = null; t.navPath = null; t.waitT = .5; }
}

// 平時對話：倒數到 0 隨機冒一句話，顯示幾秒後消失、再排下一次
// 這個人是不是被送來這裡的（js/vitals.js：負荷高＝疏導室、受傷＝醫院）：回傳要用的台詞格子 key；平常就待在這裡的人＝null
function awayLineKey(id) {
  const moved = typeof vitalsLocation === 'function' && typeof VITALS !== 'undefined' ? vitalsLocation(id) : null;
  if (!moved || !MAP || moved.map !== MAP.name) return null;
  return moved.map === VITALS.hospitalMap ? 'idleHospital' : moved.map === VITALS.sootheRoomMap ? 'idleSoothe' : null;
}
function updateNpcTalk(npc, dt) {
  if (typeof WANDER_TALK === 'undefined') return;
  if (npc.berserk) { npc.say = null; return; }   // 暴走的哨兵不說話
  const battle = !MAP_SAFE && npc.kind === 'tower' && typeof BATTLE_WANDER_LINES !== 'undefined';
  const talkCfg = battle && typeof BATTLE_WANDER_TALK !== 'undefined' ? BATTLE_WANDER_TALK : WANDER_TALK;
  const nextGap = () => talkCfg.minGap + Math.random() * (talkCfg.maxGap - talkCfg.minGap);
  if (npc.sayWait == null) npc.sayWait = nextGap();
  if (npc.say) {
    npc.say.life -= dt;
    if (npc.say.life <= 0) { npc.say = null; npc.sayWait = nextGap(); }
    return;
  }
  npc.sayWait -= dt;
  const rage = battle && typeof ragePersona === 'function' && npc.type && G.towers.includes(npc) ? ragePersona(npc) : null;   // 狂戰士人格（js/berserk-fx.js）
  if (rage) npc.sayWait = Math.min(npc.sayWait, talkCfg.maxGap * rage.talkGap);   // 狂戰士比較多話：等待時間縮短
  if (rage && rage.battle && rage.battle.length && npc.sayWait <= 0) {
    npc.say = { text: pickLine(rage.battle, 'x', npc), life: talkCfg.duration, col: rage.bubble };
    npc.sayWait = nextGap() * rage.talkGap;
    return;
  }
  if (npc.sayWait <= 0) {
    const key = npc.id || npc.type;   // NPC 用 id、哨兵用 type
    const away = !battle && awayLineKey(key);   // 負荷高被送到疏導室、受傷住院：改說那裡的台詞（對話編輯器的「在疏導室閒晃」「住院時的頭上泡泡」），沒填就不說
    const lines = battle ? chapterPick(BATTLE_WANDER_LINES[key]) : away ? dialogueLines(key, away) : ((typeof WANDER_LINES !== 'undefined' && chapterPick(WANDER_LINES[key])) || null);   // 各說各的：出勤泡泡沒填就不說（不借用閒晃台詞）
    if (lines && lines.length) npc.say = { text: lines[Math.floor(Math.random() * lines.length)], life: talkCfg.duration };
    else npc.sayWait = 4;   // 沒台詞：晚點再檢查
  }
}
// 跟隨：朝目標移動，保持 cfg.dist 的距離就停（只改座標，走路動畫由主迴圈處理）
function followTarget(mover, target, cfg, dt) {
  if (!target) return false;
  const dx = target.x - mover.x, dy = target.y - mover.y, d = Math.hypot(dx, dy);
  if (d <= cfg.dist) return true;          // 夠近了就停
  const tx = target.x - dx / d * cfg.dist, ty = target.y - dy / d * cfg.dist;
  moveSentryWithPath(mover, tx, ty, cfg.speed, dt);
  return true;
}
// ---- 安全區：NPC 閒逛時，路過椅子或床會有機率坐下／躺下 ----
// chance＝每次挑新閒逛目標時去坐的機率；radius＝多近的椅子算「路過」（格）
// sit／lie＝坐、躺的秒數範圍；cooldown＝起身後多久內不會再坐
// 坐下的位置與方向沿用溫特的設定（data/chairs.js，可用椅子編輯器調整）
const NPC_SEAT = { chance: .35, radius: 4.5, sit: [8, 18], lie: [15, 30], cooldown: 10 };
const seatActors = () => [...G.npcs, ...G.towers];
function seatTaken(seat, except) {
  if (G.player && G.player.sitting === seat) return true;
  return seatActors().some(o => o !== except && (o.sitting === seat || (o.seatGoal && o.seatGoal.seat === seat)));
}
// 椅子旁邊可以站的格子（走過去的位置，起身後也回到這裡）
function seatApproachPoint(seat) {
  let best = null, bestD = Infinity;
  const c0 = Math.floor(seat.x0 / CELL) - 1, r0 = Math.floor(seat.y0 / CELL) - 1;
  const c1 = Math.ceil((seat.x0 + seat.w) / CELL), r1 = Math.ceil((seat.y0 + seat.h) / CELL);
  for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) {
    if (!inGrid(c, r)) continue;
    const [x, y] = center(c, r);
    if (sentryBlocked(x, y) || !personnelInLight(x, y)) continue;
    const d = Math.hypot(x - seat.x, y - seat.y);
    if (d < bestD) { bestD = d; best = { x, y }; }
  }
  return best;
}
const NPC_NO_SEAT = ['ball'];   // 不會去坐椅子、躺床的角色（球球是狗）
function trySeatActor(a) {
  if (NPC_NO_SEAT.includes(a.kind === 'tower' ? a.type : a.id)) return false;
  if (!MAP_SAFE || a.seatCd > 0 || Math.random() >= NPC_SEAT.chance || typeof mapSeats !== 'function') return false;
  let best = null, bestD = NPC_SEAT.radius * CELL;
  const home = (a.kind === 'tower' ? a.mode === 'free' : true) ? homeAreaOf(a.kind === 'tower' ? a.type : a.id) : null;
  for (const seat of mapSeats()) {
    const d = Math.hypot(seat.x - a.x, seat.y - a.y);
    if (d >= bestD || seatTaken(seat, a)) continue;
    if (home && !inHomeArea(home, seat.x, seat.y)) continue;   // 有活動範圍的人只坐範圍裡的椅子
    const approach = seatApproachPoint(seat);
    if (approach) { best = { seat, approach }; bestD = d; }
  }
  if (!best) { a.seatCd = 3; return false; }   // 附近沒有空位，過一下再看
  a.seatGoal = best; a.target = null; a.navPath = null; a.waitT = 0;
  return true;
}
function npcStandUp(a) {
  if (!a.sitting) return;
  const back = a.sitFrom || seatApproachPoint(a.sitting) || { x: a.x, y: a.y + CELL };
  a.x = back.x; a.y = back.y; a.dir = 'front';
  a.sitting = null; a.sitFrom = null; a.seatCd = NPC_SEAT.cooldown; a.waitT = .6 + Math.random();
}
// 每幀先跑這裡：坐著／正走向椅子時回傳 true（這幀不跑一般閒逛）
function npcSeatStep(a, dt, speed) {
  if (a.seatCd > 0) a.seatCd -= dt;
  if (a.sitting) {
    if (!MAP_SAFE) { npcStandUp(a); return false; }
    a.x = a.sitting.x; a.y = a.sitting.y; a.dir = a.sitting.dir; a.moving = false;
    a.sitT -= dt;
    if (a.sitT <= 0) npcStandUp(a);
    return true;
  }
  const goal = a.seatGoal;
  if (!goal) return false;
  if (!MAP_SAFE || seatTaken(goal.seat, a)) { a.seatGoal = null; return false; }   // 被別人先坐走了
  if (moveSentryWithPath(a, goal.approach.x, goal.approach.y, speed, dt)) {
    const [lo, hi] = goal.seat.bed ? NPC_SEAT.lie : NPC_SEAT.sit;
    a.sitFrom = { x: a.x, y: a.y }; a.sitting = goal.seat; a.seatGoal = null;
    a.x = goal.seat.x; a.y = goal.seat.y; a.dir = goal.seat.dir;
    a.sitT = lo + Math.random() * (hi - lo); a.navPath = null; a.target = null;
  } else if (a.navFailed) { a.seatGoal = null; a.navPath = null; a.seatCd = NPC_SEAT.cooldown; }
  return true;
}

function updateWanderer(npc, dt) {
  if (typeof ashBusy === 'function' && ashBusy(npc)) return;   // 亞許正在疏導室幫隊員疏導（js/vitals.js）
  if (MAP_SAFE && typeof npcChatStep === 'function' && npcChatStep(npc, dt)) return;   // 正在跟別人閒聊（js/npc-chats.js）
  if (npcSeatStep(npc, dt, 65)) { updateNpcTalk(npc, dt); return; }   // 坐著或正走向椅子
  if (npc.id === 'ball' && typeof ballBedStep === 'function' && ballBedStep(npc, dt)) { updateNpcTalk(npc, dt); return; }   // 球球：睡在自己的床上或正走過去（js/ball-poses.js）
  rescueStuck(npc, sentryBlocked);
  updateNpcTalk(npc, dt);   // 對話倒數（即使站著不動也會說話）
  if (escapeDarkness(npc, dt)) return;
  if (npc.id === 'ball' && !MAP_SAFE && getTeam().includes('ball')) {
    const anchor = dogFollowAnchor();   // 預設跟領犬員；可以改跟別的隊員或溫特（js/rescue-dog.js）
    if (updateRescueDogPickup(npc, anchor, dt)) return;
    followTarget(npc, anchor, { dist: CELL * 1.25, speed: 110 }, dt);
    npc.target = null; npc.waitT = 0;
    return;
  }
  // 阿瓦倫緊跟著艾德林
  if (npc.id === 'avaren' && typeof FOLLOW !== 'undefined') {
    const eldrin = G.npcs.find(n => n.id === 'eldrin');
    if (eldrin) { followTarget(npc, eldrin, FOLLOW.avaren, dt); npc.target = null; npc.waitT = 0; return; }
  }
  if (npc.waitT > 0) { npc.waitT -= dt; return; }
  if (!npc.target) {
    if (trySeatActor(npc)) return;   // 路過椅子／床：有機率去坐
    if (npc.id === 'ball' && typeof tryBallBed === 'function' && tryBallBed(npc)) return;   // 球球：有機率回自己的床睡覺
    const home = homeAreaOf(npc.id);   // 平時待在自己的活動範圍（研究部…）
    npc.target = home ? sampleHomeTarget(home, npc) : sampleWanderTarget(npc.x, npc.y, 180);
    if (!npc.target) npc.waitT = 0.8;
    return;
  }

  if (moveSentryWithPath(npc, npc.target.x, npc.target.y, 65, dt)) {
    npc.target = null; npc.navPath = null;
    npc.waitT = 0.8 + Math.random() * 2;
    return;
  }

  if (npc.navFailed) { npc.target = null; npc.navPath = null; npc.waitT = .5; }
}

// ---- 哨兵選單（點哨兵彈出：自由走動／原地巡邏／指派位置／跟隨護衛）----
const sentryMenu = document.getElementById('sentryMenu');
// 怪力加成：汙染值越高攻擊力越高。rageDmg＝汙染 100 時「額外」增加的倍率（1 → 2 倍、0.5 → 1.5 倍）
function sentryDamageMul(t) {
  const spec = TYPES[t.type], food = 1 + sortieBuff(t, 'atk');   // 出勤補給＋嚮導技能的攻擊加成
  if (!spec || !spec.rageDmg) return food;
  return food * (1 + spec.rageDmg * Math.max(0, Math.min(100, t.taint || 0)) / 100);
}
// 防禦（受到傷害打幾折）：角色本身＋出勤補給，最多 75%
function sentryDefense(t) {
  if (t.grabbed || t.grabFall) return 1;   // 被抓起來（js/grab.js）：打不到
  const spec = TYPES[t.type];
  return Math.max(0, Math.min(.75, ((spec && spec.defense) || 0) + sortieBuff(t, 'def')));   // 出勤補給＋嚮導技能的防禦加成
}
let menuSentry = null;    // 目前開著選單的哨兵
let assigning = null;     // 「指派位置巡邏」等待點地圖的哨兵
function openSentryMenu(t, silent) {
  if (!silent) sfx('menu');
  menuSentry = t; assigning = null;
  const spec = TYPES[t.type];
  sentryMenu.innerHTML =
    '<div class="sm-title">' + spec.name + '　汙染 ' + Math.round(t.taint) +
      (spec.rageDmg ? '<small style="display:block;color:#ff9a5a;font-size:11px;margin-top:2px">怪力加成：攻擊力 +' + Math.round((sentryDamageMul(t) - 1) * 100) + '%</small>' : '') + '</div>' +
    '<button data-act="free">🚶 自由走動</button>' +
    '<button data-act="hold">📍 在原地巡邏</button>' +
    '<button data-act="goto">🎯 指派位置巡邏</button>' +
    (MAP_SAFE ? '' : '<button data-act="escort">🛡️ 跟隨護衛部隊長' + (t.mode === 'escort' ? '（護衛中）' : '') + '</button>') +
    (MAP_SAFE && typeof canTalk === 'function' && canTalk(t) ? '<button data-act="talk">💬 對話</button>' : '') +   // 基地裡、有「找他說話（基地）」的台詞才有
    (typeof canSendToHospital === 'function' && canSendToHospital(t) ? '<button data-act="hospital">🏥 去醫院休息</button>' : '');   // 基地裡、HP 沒滿（js/vitals.js）
  sentryMenu.querySelectorAll('button').forEach(b => b.addEventListener('click', () => sentryMenuAct(b.dataset.act)));
  // 選單位置：跟著哨兵在畫面上的位置（換算成 CSS 座標）
  const rect = cv.getBoundingClientRect();
  const sx = (t.x - cam.x) * VIEW_SCALE * (rect.width / VIEW_W), sy = (t.y - cam.y) * VIEW_SCALE * (rect.height / VIEW_H);
  sentryMenu.style.left = Math.round(Math.min(sx + 22, rect.width - 170)) + 'px';
  sentryMenu.style.top = Math.round(Math.max(6, sy - 30)) + 'px';
  sentryMenu.classList.remove('hidden');
}
function closeSentryMenu() { menuSentry = null; sentryMenu.classList.add('hidden'); }
// 跟隨護衛：持續跟在部隊長身邊，看到附近的怪會出手（哨兵選單與左上角頭像選單共用）
function setSentryEscort(t) {
  t.mode = 'escort'; t.guardSummoned = false; t.guardBase = null;
  t.target = null; t.anchor = null; t.waitT = 0; t.navPath = null; t.navGoal = null;
  sentryStatus(t, '跟隨護衛');
}
function sentryMenuAct(act) {
  const t = menuSentry; if (!t) return;
  if (act === 'free') { sfx('button'); t.mode = 'free'; t.guardSummoned = false; t.guardBase = null; t.anchor = null; t.target = null; sentryStatus(t, '自由走動'); }
  else if (act === 'hold') { sfx('button'); t.mode = 'hold'; t.guardSummoned = false; t.guardBase = null; t.anchor = { x: t.x, y: t.y }; t.target = null; sentryStatus(t, '在原地巡邏'); }
  else if (act === 'goto') { sfx('button'); assigning = t; closeSentryMenu(); sentryStatus(t, '點地圖指定位置', '#ffd479'); return; }
  else if (act === 'talk') { openDialogue(t); return; }
  else if (act === 'hospital') { sfx('button'); sendToHospital(t); }
  else if (act === 'escort') { sfx('button'); setSentryEscort(t); }
  closeSentryMenu();
}
window.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  const open = assigning || ['sentryMenu', 'groundMenu'].some(id => { const el = document.getElementById(id); return el && !el.classList.contains('hidden'); });
  assigning = null; closeSentryMenu(); closeGroundMenu(); closeBuildMenu();
  if (open) e.preventDefault();   // 有選單被關掉：這次 Esc 用掉了（js/save.js 的 Esc 層級）
});
// ---- 疏導哨兵（花嚮導能量降汙染、解暴走）----
// 溫特疏導：先站定跑進度條（SOOTHE.time 秒，期間溫特和這位隊員都不能動），跑完才扣 SP、降污染（js/channel-actions.js）
function soothe(t) {
  if (typeof playerChannel !== 'undefined' && playerChannel) return;   // 正在做別的事（疏導、急救、包紮）
  if (t.taint <= 0 && !t.berserk) { sfx('error'); sentryStatus(t, '無需疏導', '#9aa4b2'); return; }
  const cost = typeof equipSootheCost === 'function' ? equipSootheCost(SOOTHE.cost) : SOOTHE.cost;   // 共感手環：花的 SP 變少（js/equipment.js）
  if (G.guide < cost) { sfx('error'); sentryStatus(t, '嚮導能量不足', '#ff8f8f', true); return; }
  if (typeof startChannel !== 'function') { finishSoothe(t); return; }
  spawnSootheCast(G.player, SOOTHE_COLORS.winter, 0);   // 溫特腳下法陣（跟以前一樣約 1 秒）
  SFX.play('soothe', 1, 'winter-soothe');                 // 開始疏導：「疏導」音效
  startChannel({ kind: 'soothe', total: SOOTHE.time || 3, target: t, label: '疏導中', color: '#8fd3ff', needAlive: true, onDone: () => finishSoothe(t),
    onTick: dt => sootheMotes(t, dt),   // 疏導期間：溫特和隊員身邊一直飄出藍色小光點
    onCancel: () => { if (SFX.fadeOut) SFX.fadeOut('winter-soothe', .3); } });   // 中斷：開始的音效淡掉
}
// 疏導期間的鮮豔藍色小光點：從溫特和隊員身邊冒出來，慢慢往上飄、淡掉（數值在 js/attack-fx.js 的 SOOTHE_MOTES）
const winterMoteHolder = {};
function sootheMotes(t, dt) { spawnSootheMotes([G.player, t], SOOTHE_MOTE_COLORS.winter, dt, winterMoteHolder); }
function finishSoothe(t) {
  const cost = typeof equipSootheCost === 'function' ? equipSootheCost(SOOTHE.cost) : SOOTHE.cost;
  if (G.guide < cost) { sfx('error'); sentryStatus(t, '嚮導能量不足', '#ff8f8f', true); return; }
  G.guide -= cost; t.taint = Math.max(0, t.taint - SOOTHE.heal);
  if (t.berserk && t.taint < 60) t.berserk = false;
  sfx('sootheEnd');   // 疏導成功：「疏導2」音效
  addStat('soothes');   // 成就：親自疏導次數
  spawnSootheEffect(t.x, t.y - 8, SOOTHE_COLORS.winter, t);   // 玩家溫特疏導：藍色，光環跟隨哨兵
  sentryStatus(t, '疏導 -' + SOOTHE.heal, '#7ee0c0'); updateHUD();
}
