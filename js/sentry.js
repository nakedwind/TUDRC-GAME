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
  const invited = typeof mealInviteLocation === 'function' && mealInviteLocation(id);   // 被邀請一起去吃飯：跟著溫特（js/meal-invite.js）
  if (invited) return invited;
  const loc = npcLocationTable()[id] || null;
  const moved = loc && typeof vitalsLocation === 'function' ? vitalsLocation(id) : null;
  if (moved) return moved;
  const followed = typeof baseFollowLocation === 'function' && baseFollowLocation(id, loc);   // 雷德在基地裡跟著溫特換地圖（js/base-follow.js）
  if (followed) return followed;
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
      if (seen.has(k) || !inGrid(nc, nr) || isWall(nc, nr) || G.grid[k] || edgeBetween(c, r, nc, nr)) continue;
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
// 沒有營地的戰鬥地圖（沒畫營地格、也沒放營地，例如新手區）：溫特和隊員出生在營地箱子（物資箱、補彈藥箱、裝備箱）前面那一區。
// 從所有營地箱子圍起來的範圍正中間（高度對齊箱子底部那一排）往外找走得到、有畫地板的格子，近的排前面；
// 第一格給溫特（js/game.js 的 playerSpawnPos），其他給隊員。例如新手區：左邊物資箱、右邊裝備箱，溫特站兩邊中間
function boxStartCells(n = 16) {
  if (MAP_SAFE || campCells.size || !MAP || typeof mapBoxes !== 'function') return [];
  const ok = (c, r) => inGrid(c, r) && !isWall(c, r) && !G.grid[c + ',' + r] && (typeof groundDrawnAt !== 'function' || groundDrawnAt(c, r));
  const boxes = mapBoxes().filter(b => ['supply', 'refill', 'armor'].includes(b.kind));   // 只看營地的箱子；散落在地圖上、能打開的彈藥箱不算
  if (!boxes.length) return [];
  const cx = (Math.min(...boxes.map(b => b.left)) + Math.max(...boxes.map(b => b.right))) / 2;
  const cy = Math.max(...boxes.map(b => b.bottom)) - CELL * .5;
  const [sc, sr] = cellAt(cx, cy);
  const seen = new Set([sc + ',' + sr]), queue = [[sc, sr]], out = [];
  for (let i = 0; i < queue.length && out.length < n; i++) {
    const [c, r] = queue[i];
    if (ok(c, r)) out.push([c, r]);
    for (const [dc, dr] of [[0, 1], [1, 0], [-1, 0], [0, -1]]) {
      const nc = c + dc, nr = r + dr, k = nc + ',' + nr;
      if (seen.has(k) || !inGrid(nc, nr) || isWall(nc, nr)) continue;
      seen.add(k); queue.push([nc, nr]);
    }
  }
  return out;
}
// 有營地的戰鬥地圖：出生在營地裡。放了營地（帳篷）：用營地周圍走得到的格子（campCells 在這時只有營地正中間一格——
// 那是怪物的目標，不夠大家站）；沒放營地、只畫了營地格：用畫的格子。近營地中心的排前面
// （有放營地時不用畫的營地格：地圖編輯器預設會把最下面兩排畫成營地，常常跟真正的營地不在一起）
// 營地在幾樓：照營地中心那一格（js/pathfinding.js 的 spawnFloorAt）
const campFloor = () => campCells.size ? spawnFloorAt(...[...campCells][0].split(',').map(Number)) : 1;
function campSpawnCells(n = 24) {
  if (MAP_SAFE || !MAP || !campCells.size) return [];
  return onFloorDo(campFloor(), () => campSpawnCellsNow(n));
}
function campSpawnCellsNow(n) {
  // 也要檢查站得下（sentryBlocked）：營地裡的行軍床、物資箱用像素微調擋路時，會擋到隔壁格，生在那裡就走不出來
  const free = (c, r) => inGrid(c, r) && !isWall(c, r) && !isEntrance(c, r) && !G.grid[c + ',' + r] && !sentryBlocked(...center(c, r));
  const [cc, cr] = [...campCells][0].split(',').map(Number);
  const byDist = list => list.sort((a, b) => Math.hypot(a[0] - cc, a[1] - cr) - Math.hypot(b[0] - cc, b[1] - cr));
  const hasBase = typeof mapBases !== 'undefined' && mapBases.length > 0;
  const drawn = hasBase ? [] : [...campCells].map(k => k.split(',').map(Number)).filter(([c, r]) => free(c, r));
  if (drawn.length) return byDist(drawn).slice(0, n);
  const seen = new Set([cc + ',' + cr]), queue = [[cc, cr]], out = [];
  for (let i = 0; i < queue.length && out.length < n && i < 2000; i++) {
    const [c, r] = queue[i];
    if (free(c, r)) out.push([c, r]);
    for (const [dc, dr] of [[0, 1], [1, 0], [-1, 0], [0, -1]]) {
      const nc = c + dc, nr = r + dr, k = nc + ',' + nr;
      if (seen.has(k) || !inGrid(nc, nr) || isWall(nc, nr)) continue;   // 營地本身（G.grid）照樣往外找，才找得到帳篷外面
      seen.add(k); queue.push([nc, nr]);
    }
  }
  return out;
}
// 隊員出生可以站的格子（營地裡；沒營地就營地箱子前面、最下排）：spawnSentries、regroupSquadAtCamp 共用
function squadSpawnCells() {
  const cand = [], start = boxStartCells(), camp = campSpawnCells();
  if (camp.length > 1) cand.push(...camp.slice(1));   // 有營地：營地裡（第一格留給溫特）
  else if (campCells.size) campCells.forEach(k => cand.push(k.split(',').map(Number)));
  else if (start.length > 1) cand.push(...start.slice(1));   // 沒營地、有營地箱子：箱子前面（第一格留給溫特）
  else for (let c = 0; c < COLS; c++) cand.push([c, ROWS - 1]);   // 沒自訂營地＝最下排
  return onFloorDo(campFloor(), () => cand.filter(([c, r]) => inGrid(c, r) && !isWall(c, r) && !isEntrance(c, r) && !G.grid[c + ',' + r] && !sentryBlocked(...center(c, r))));   // 照營地那一層判斷
}
function spawnSentries(only = null) {   // only：只生這幾位（接續戰場時新編入的隊員，js/combat-progress.js）
  const ok = squadSpawnCells();
  // 應變中心是全員集合的安全區；戰鬥地圖仍只生成已編入的出勤隊伍。
  // 基地（安全區）：出勤隊伍不跟著溫特，只出現「平時在這張地圖」的人（data/npc-locations.js）；戰鬥地圖：出勤隊伍
  const team = MAP_SAFE
    ? (typeof ROSTER !== 'undefined' ? ROSTER : Object.keys(TYPES)).filter(npcHomeHere)
    : (typeof practiceOn === 'function' && practiceOn()) ? practice.team.slice()   // 訓練室：在塔納那裡選的隊員（js/practice.js）
    : ((typeof getTeam === 'function') ? getTeam() : Object.keys(TYPES));
  for (const type of only || team) {
    const spec = TYPES[type]; if (!spec || type === PLAYER_CHARACTER) continue;   // 玩家正在操作的人（艾德林帶隊）不會再多一個
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

// 從應變中心再次出擊、接續保留的戰場時（js/combat-progress.js 的 resumeSquadFromBase）：
// 出勤隊員全部回到營地裡重新出現（不然會站在上次倒下、或離開時的位置），跟剛出勤時一樣的擺法
function regroupSquadAtCamp() {
  const ok = squadSpawnCells();
  for (const t of G.towers) {
    if (!TYPES[t.type] || t.type === PLAYER_CHARACTER) continue;
    const cell = ok.length ? ok.splice(Math.floor(Math.random() * ok.length), 1)[0] : null;
    if (cell) [t.x, t.y] = center(cell[0], cell[1]);
    if (!placeAtConfiguredSpawn(t, t.type)) placeInHomeArea(t, t.type);
    Object.assign(t, { target: null, navPath: null, moving: false, meleeSwing: null, gunSwing: null, waitT: 0.4 + Math.random() });
  }
}

// ---- 場景 NPC：從營地附近出生，只在亮處自由走動 ----
function spawnWanderers(only = null) {   // only：只生這幾位（接續戰場時新編入的球球，js/combat-progress.js）
  // 基地（安全區）：只出現平時在這張地圖的人（data/npc-locations.js）；戰鬥地圖：勾了「場景 NPC」才有
  const deployed = typeof getTeam === 'function' ? getTeam() : [];
  const list = only ? WANDERERS.filter(w => only.includes(w.id))
    : MAP_SAFE || (typeof practiceOn === 'function' && practiceOn()) ? WANDERERS.filter(w => npcHomeHere(w.id))
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
  // 碰撞方框半寬 12（少 0.001：剛好貼著牆邊不算撞到。走路的小數誤差會讓位置差 0.0000000001 像素，
  // 例如一格寬的門兩旁的牆往下微調 8 像素，站在門下那格正中間時方框上緣剛好貼著牆底，誤差一點就被當成卡住）
  const r = 11.999;
  if (typeof escalatorSideBlocks === 'function' && escalatorSideBlocks(x, y + ESCALATOR.footDy)) return true;   // 側面手扶梯的扶手、外殼（看腳的位置，js/escalators.js）
  for (const [sx, sy] of [[-r, -r], [r, -r], [-r, r], [r, r]]) {
    const px = x + sx, py = y + sy;
    const [c, rr] = cellAt(px, py);
    if (!inGrid(c, rr) || gridAtPointForWalker(px, py)) return true;   // 建築只擋同一層的人；微調過位置的照微調後的範圍（js/build.js）
    if (solidBlocksPoint(px, py)) return true;      // 不可穿透（含像素微調）
    if (typeof poolPlatformBlocksPoint === 'function' && poolPlatformBlocksPoint(px, py)) return true;   // 抽水機平台：隊員上不去（js/pool-platform.js）
    if (typeof deepWaterBlocksAlly === 'function' && deepWaterBlocksAlly(px, py)) return true;   // 深水區：沒坐救生圈的隊員不會下水，在岸邊等（js/swim-ring.js）
    if (edgeWallBlocksPoint(px, py) || edgeWallBlocksPoint(x + sx, y) || edgeWallBlocksPoint(x, y + sy)) return true;   // 邊緣碰撞（薄牆，js/pathfinding.js）：角和四邊中點
  }
  return false;
}
// 隊員能不能走到這裡：離最近的亮格 PERSONNEL_DARK_CELLS 格以內都算（光圈邊緣暗一點點也會跟過來）。
// 設成 0＝舊的嚴格判定：身體中心和四個角都要在光內，一點點黑就不過去。
const CORE_GLOW_WALK = 4;   // 醒著的異質核心會發光：周圍幾格內隊員也能走進去（才打得到核心）
const PERSONNEL_DARK_CELLS = 1;
function personnelInLight(x, y) {
  if (MAP_SAFE || !LIGHT.enabled) return true;
  if (G && G.cores && G.cores.some(c => c.awake && !c.dead && !c.hidden && Math.hypot(c.x - x, c.y - y) <= CORE_GLOW_WALK * CELL)) return true;
  if (PERSONNEL_DARK_CELLS > 0) { const [c, r] = cellAt(x, y); return cellNearLight(c, r, PERSONNEL_DARK_CELLS * CELL); }
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
  if (actor.leftBehind) return false;   // 部隊長傳送到跟不過去的地方，在原地等他回來：不逃回燈下、不說去不了
  // 跟著溫特走的隊員待在溫特身邊（FOLLOW_PLAYER），或嚮導正在撿溫特丟在地上的東西：不怕黑
  if (actor.groundTrip || nearFollowedPlayer(actor)) return false;
  // 被叫來跟隨護衛、而且找得到路過去：中間暗也照走（不然走進暗處就逃回燈下、再往前又逃回來，看起來像站在原地不動）
  // 每秒重新確認一次「找得到路」（穿過黑暗也算），路被擋住時才照舊躲回燈下
  // 自由走動、平常就跟著別人走的隊員也一樣（跟著溫特的大家、跟著艾德林的阿瓦倫）：溫特走進沒開燈的地方（例如 B56 沒開燈的路橋）時，
  // 不然隊員一踩進暗處就被拉回燈下，整隊停在最後一盞燈旁邊不跟（sentryCompanionRule）
  const followAnchor = actor.mode === 'escort' ? G && G.player
    : (actor.mode === 'free' && G && G.towers && G.towers.includes(actor) ? sentryCompanionRule(actor)?.anchor : null);
  if (followAnchor && G && G.player && !MAP_SAFE) {
    actor.escortRouteT = (actor.escortRouteT || 0) - dt;
    if (actor.escortRouteT <= 0) {
      actor.escortRouteT = 1;
      actor.escortRouteOk = buildSentryPath(actor, followAnchor.x, followAnchor.y, true, hasFloors ? actorFloor(followAnchor) : null) !== null;
    }
    if (actor.escortRouteOk) return false;
    if (actor.mode === 'escort' && typeof watchSentryProgress === 'function' && !personnelInLight(actor.x, actor.y)) watchSentryProgress(actor, dt, leaderLabel(), () => sentryLeaderBlockReason(actor));   // 過不去又待在暗處：一樣說出原因（js/sentry-blocked.js）
  }
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
// 隊友在這一格要站哪裡：一般是格子正中間；沒對齊格子的門洞＝門洞的正中線（doorLanePoint 在 js/pathfinding.js，怪物也用）
const sentryCellPos = (c, r) => doorLanePoint(c, r) || center(c, r);
// ignoreFire：被推出火海時用，只看地形，不把火當成擋路；allowDark：被召喚時，黑暗的格子也能走
function sentryCellWalkable(c, r, ignoreFire = false, allowDark = false) {
  const lane = doorLanePoint(c, r);   // 門洞通道上的格子：紅格有微調過、牆只擋門洞旁邊，改看正中線那個點有沒有被擋
  if (!inGrid(c, r) || (!lane && isWall(c, r)) || isEntrance(c, r) || G.grid[c + ',' + r]) return false;
  const [x, y] = lane || center(c, r);
  if (sentryBlocked(x, y)) return false;
  if (!ignoreFire && typeof oilFireAt === 'function' && oilFireAt(x, y, 6, sentryFireWalker)   // 燒著的火海：找路時繞開（js/oil-barrels.js）；只看同一層的火
      && !(typeof sentryFireTrait === 'function' && sentryFireTrait(sentryFireWalker))) return false;   // 希奧妮、雷德不繞（js/game.js 的 SENTRY_FIRE_TRAITS）
  if (!ignoreFire && typeof acidHazardAt === 'function' && acidHazardAt(sentryFireWalker, x, y, 6)) return false;   // 腐蝕池、吐酸史萊姆的酸液：找路時也繞開（js/game.js）
  if (!allowDark && !personnelInLight(x, y)) return false;
  return true;
}
function nearestSentryGoal(c, r, allowDark = false, skip = null) {   // allowDark：暗處的格子也可以當目的地；skip(c, r)＝這格不能當目的地
  for (let radius = 0; radius <= 4; radius++) {
    let best = null, bestDistance = Infinity;
    for (let dc = -radius; dc <= radius; dc++) for (let dr = -radius; dr <= radius; dr++) {
      if (radius && Math.abs(dc) !== radius && Math.abs(dr) !== radius) continue;
      const nc = c + dc, nr = r + dr;
      if (!sentryCellWalkable(nc, nr, false, allowDark) || (skip && skip(nc, nr))) continue;
      const distance = Math.abs(dc) + Math.abs(dr);
      if (distance < bestDistance) { best = [nc, nr]; bestDistance = distance; }
    }
    if (best) return best;
  }
  return null;
}
// 被擠進道具縫裡：站的那格和上下左右都走不了，尋路永遠找不到路、整個人定住（以前只能拖曳出來）。
// 挪到最近一格走得到的格子中心（跟拖曳放下一樣）
function unwedgeSentry(t) {
  const [c, r] = cellAt(t.x, t.y), open = (nc, nr) => sentryCellWalkable(nc, nr, true, true);   // 只看道具、牆：暗處、火海不算卡住
  if (open(c, r) || [[0, -1], [1, 0], [0, 1], [-1, 0]].some(([dc, dr]) => open(c + dc, r + dr))) return;
  const goal = nearestSentryGoal(c, r, true); if (!goal || Math.abs(goal[0] - c) + Math.abs(goal[1] - r) > 3) return;
  [t.x, t.y] = center(...goal); t.navPath = null; t.navGoal = null; t.navTimer = 0;
}
// 哨兵用格線 BFS 尋路。與怪物的營地流場分開，因為哨兵的目的地會隨指令與敵人改變。
// goalFloor：目的地在幾樓（有陸橋的地圖才用；沒給＝照那一格：只有 2 樓的＝2、只有 1 樓的＝1、陸橋上照隊員自己）
// 找路用的時鐘（毫秒）：照「遊戲裡過了多久」算，不是照真實時間。
// 「找不到路等 2 秒再找」要照遊戲時間等：暫停、選單開著時不算；自動測試一下子跑完 30 秒的遊戲時，也真的會重找
// （以前照真實時間，測試裡隊員在手扶梯頂端找路失敗一次後就一直不重找，「隊員跟著溫特上下樓」測試會失敗）
function sentryNavClock() { return ((typeof G !== 'undefined' && G && G.navClock) || 0) * 1000; }
function buildSentryPath(t, targetX, targetY, allowDark = !!(t.summonDark || t.followDark), goalFloor = null) {   // allowDark：找一條可以穿過黑暗的路（召喚時、跟著溫特走時、去撿地上的東西時）
  if (hasFloors) {
    // 走不到的地方：同一個起點、同一個目的地 2 秒內不再重找（兩層一起找路走不到時會搜到上限 6000 格，一次要好幾百毫秒，
    // 隊員每隔一下就重找一次，遊戲會一頓一頓的）
    const gf = goalFloor || placeFloorAt(targetX, targetY, t), now = sentryNavClock();
    const failKey = cellAt(t.x, t.y).join(',') + ',' + actorFloor(t) + '>' + cellAt(targetX, targetY).join(',') + ',' + gf + (allowDark ? 'd' : '');
    if (t._pathFail && t._pathFail.key === failKey && now < t._pathFail.until && t._pathFail.until - now <= SENTRY_PATH_FAIL_WAIT) return null;   // 後面那個條件：重新開局時鐘歸零，舊的記錄不算
    const path = buildSentryPathFloors(t, targetX, targetY, allowDark, gf);
    t._pathFail = path == null ? { key: failKey, until: now + SENTRY_PATH_FAIL_WAIT } : null;
    return path;
  }
  const [sc, sr] = cellAt(t.x, t.y), [rawGc, rawGr] = cellAt(targetX, targetY);
  // 走不到的地方（例如溫特在深水區裡）：同一個起點、同一個目的地 SENTRY_PATH_FAIL_WAIT 內不再重找（找一次要把整張地圖搜完，大地圖會頓一下）
  const failKey1 = sc + ',' + sr + '>' + rawGc + ',' + rawGr + (allowDark ? 'd' : ''), now1 = sentryNavClock();
  if (t._pathFail && t._pathFail.key === failKey1 && now1 < t._pathFail.until && t._pathFail.until - now1 <= SENTRY_PATH_FAIL_WAIT) return null;
  const fail = () => { t._pathFail = { key: failKey1, until: now1 + SENTRY_PATH_FAIL_WAIT }; return null; };
  const goal = nearestSentryGoal(rawGc, rawGr, allowDark); if (!goal) return fail();
  const [gc, gr] = goal, startKey = sc + ',' + sr, goalKey = gc + ',' + gr;
  if (startKey === goalKey) return [];
  const queue = [[sc, sr]], cameFrom = new Map([[startKey, null]]), blocked = new Set();   // blocked：這次找路已經知道走不了的格子（同一格會被旁邊四格問，只算一次）
  let head = 0;
  while (head < queue.length) {
    const [c, r] = queue[head++];
    if (c === gc && r === gr) break;
    for (const [dc, dr] of [[0,-1],[1,0],[0,1],[-1,0]]) {
      const nc = c + dc, nr = r + dr, key = nc + ',' + nr;
      if (cameFrom.has(key) || blocked.has(key) || edgeBetween(c, r, nc, nr)) continue;   // edgeBetween：兩格中間有薄牆就繞路
      if (!sentryCellWalkable(nc, nr, false, allowDark)) { blocked.add(key); continue; }
      cameFrom.set(key, c + ',' + r); queue.push([nc, nr]);
    }
  }
  if (!cameFrom.has(goalKey)) return fail();
  t._pathFail = null;
  const path = []; let key = goalKey;
  while (key && key !== startKey) {
    const [c, r] = key.split(',').map(Number); path.push({ c, r }); key = cameFrom.get(key);
  }
  return path.reverse();
}
// ---- 有陸橋的地圖：兩層一起找路 ----
// 每一步都記著「在幾樓」，規則跟走路判斷一樣（js/pathfinding.js 的 wallNow）：只有經過樓層出入口才換樓層——
// 從出入口走到 2 樓地面＝2 樓、走到其他格子＝1 樓；一樓的人站在 2 樓地面那格，不能從那一側走進出入口。
// 會動的手扶梯（js/escalators.js 的 escalatorFlowAt）：順著走每格成本比較低，逆著走每格多加 SENTRY_ESC_AGAINST——
// 優先走順向的手扶梯，只有逆向的到得了才走逆向
const SENTRY_ESC_HURRY = 2.2;   // 逆著側面手扶梯走時，隊員的腳步加快幾倍（不然會被階梯帶回去）
const SENTRY_ESC_AGAINST = 400, SENTRY_ESC_WITH = .7;
const SENTRY_PATH_FAIL_WAIT = 2000;   // 找不到路之後，同一段路隔多久（毫秒）才再找一次
const SENTRY_PATH_MAX = 6000;   // 一次找路最多搜幾格（兩層加起來）   // 逆向每格加 400：只要有順向的路（再遠也一樣）就走順向，真的只有逆向到得了才走逆向
// 側面的手扶梯是斜的：斜坡上能站的格子排成一條斜線，上下左右一格一格接不起來。
// 所以每座當成一條「低的那頭 ↔ 高的那頭」的通道：走的時候只管左右走，高度由手扶梯自己跟著斜坡調（js/escalators.js 的 rideSideEscalator）。
// 回傳 [{ a: [欄, 列], b: [欄, 列], cells: 斜坡長幾格, flowAB: 1＝從 a 走到 b 是順向、-1＝逆向、0＝停住不動的 }]
let sentryLinkCache = null;   // 半秒內重複用（找路很常呼叫，每次重算太慢）
function sentryEscalatorLinks(allowDark) {
  if (typeof escalatorSideLanes !== 'function') return [];
  const now = performance.now();
  if (sentryLinkCache && sentryLinkCache.map === MAP && sentryLinkCache.dark === !!allowDark && now - sentryLinkCache.at < 500) return sentryLinkCache.links;
  const links = sentryEscalatorLinksNow(allowDark);
  sentryLinkCache = { map: MAP, dark: !!allowDark, at: now, links };
  return links;
}
function sentryEscalatorLinksNow(allowDark) {
  const out = [], footDy = typeof ESCALATOR !== 'undefined' ? ESCALATOR.footDy : 14;
  for (const L of escalatorSideLanes()) {
    const mid = (L.spec.band[0] + L.spec.band[1]) / 2;
    const standAt = ix => { const x = L.fx ? L.x + (L.spec.size - ix) * L.k : L.x + ix * L.k; return [x, escalatorSideTopY(L, x) + mid * L.k - footDy]; };   // 站在走道中間時角色的位置
    const lowX = standAt(Math.max(0, L.spec.x0 - 6)), highX = standAt(Math.min(L.spec.size - 1, L.spec.x1 + 10));
    const lowC = cellAt(...lowX), highC = cellAt(...highX);
    const hk = highC.join(','), highFloor = rampCells.has(hk) || deckCells.has(hk) ? 2 : 1;
    const ok = ([c, r], f) => onFloorDo(f, () => sentryCellWalkable(c, r, false, allowDark));
    if (!ok(lowC, 1) || !ok(highC, highFloor)) continue;
    const highDir = L.fx ? -1 : 1, flow = L.stamp.still ? 0 : escalatorSideDir(L);   // 往高的那頭是 x 的哪個方向；階梯往哪邊帶
    out.push({ L, a: lowC, b: highC, ax: lowX[0], bx: highX[0], cells: Math.max(1, Math.abs(highX[0] - lowX[0]) / CELL), flowAB: flow ? (flow === highDir ? 1 : -1) : 0 });
  }
  return out;
}
function buildSentryPathFloors(t, targetX, targetY, allowDark, goalFloor) {
  const sf = actorFloor(t), gf = goalFloor === 2 ? 2 : 1;
  const [sc, sr] = cellAt(t.x, t.y), [rawGc, rawGr] = cellAt(targetX, targetY);
  // 目的地不能挑在側面手扶梯的斜坡上（斜坡的格子只能沿著手扶梯進出，一格一格走不到）
  const slopeCell = (c, r) => { const fl = typeof escalatorFlowAt === 'function' ? escalatorFlowAt(c, r) : null; return !!fl && fl[1] === 0; };
  const goal = onFloorDo(gf, () => nearestSentryGoal(rawGc, rawGr, allowDark, slopeCell)); if (!goal) return null;
  const [gc, gr] = goal, startKey = sc + ',' + sr + ',' + sf, goalKey = gc + ',' + gr + ',' + gf;
  if (startKey === goalKey) return [];
  const dist = new Map([[startKey, 0]]), cameFrom = new Map([[startKey, null]]), flows = new Map();
  const flowAt = (c, r) => { const k = c + ',' + r; if (!flows.has(k)) flows.set(k, typeof escalatorFlowAt === 'function' ? escalatorFlowAt(c, r) : null); return flows.get(k); };
  // 小小的二元堆積（每次拿成本最小的出來）
  const heap = [];
  const push = item => { heap.push(item); let i = heap.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (heap[p][0] <= heap[i][0]) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p; } };
  const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let i = 0; for (;;) { const a = 2 * i + 1, b = a + 1; let m = i; if (a < heap.length && heap[a][0] < heap[m][0]) m = a; if (b < heap.length && heap[b][0] < heap[m][0]) m = b; if (m === i) break; [heap[m], heap[i]] = [heap[i], heap[m]]; i = m; } } return top; };
  // A*：排順序用「已經走的成本＋到目的地的大概距離」，往目的地的方向優先找（近的路幾乎不用多搜）
  const h = (c, r) => (Math.abs(c - gc) + Math.abs(r - gr)) * SENTRY_ESC_WITH;   // 每格最少也要 SENTRY_ESC_WITH 的成本
  push([h(sc, sr), sc, sr, sf]);
  const onSlope = !!t.escSide && onMovingEscalator(t);
  const walkCache = new Map();   // 同一次找路裡，同一格同一層只判斷一次走不走得過
  const walkable = (c, r, f) => { const k = c + ',' + r + ',' + f; if (!walkCache.has(k)) walkCache.set(k, onFloorDo(f, () => sentryCellWalkable(c, r, false, allowDark))); return walkCache.get(k); };
  // 兩格中間會不會穿過側面手扶梯的扶手、外殼：格子本身都能站，但直直走過去會撞到（例如從手扶梯正下方往上走進下面那頭，
  // 只能從旁邊的平台上去）。扶手是照像素擋的，格子的牆看不出來，不檢查的話隊員會一直往扶手上頂、走不上去
  const escCross = (c, r, nc, nr) => {
    if (typeof escalatorSideBlocks !== 'function') return false;
    const [x0, y0] = center(c, r), [x1, y1] = center(nc, nr);
    for (const k of [.25, .5, .75]) if (escalatorSideBlocks(x0 + (x1 - x0) * k, y0 + (y1 - y0) * k + ESCALATOR.footDy)) return true;
    return false;
  };
  let pops = 0; const closed = new Set();
  // 側面手扶梯的通道：從一頭的格子可以直接到另一頭（經過的格子當成一步，成本照長度、順逆向算）
  const links = new Map();
  const factor = (ln, d) => ln.flowAB * d > 0 ? SENTRY_ESC_WITH : ln.flowAB * d < 0 ? 1 + SENTRY_ESC_AGAINST : 1;   // d：1＝往高的那頭走、-1＝往低的那頭走
  for (const ln of sentryEscalatorLinks(allowDark)) {
    const add = (from, to, d) => { const k = from.join(','); if (!links.has(k)) links.set(k, []); links.get(k).push({ to, cost: ln.cells * factor(ln, d) }); };
    add(ln.a, ln.b, 1); add(ln.b, ln.a, -1);
    // 已經站在這座手扶梯的斜坡上：可以直接從現在的位置走到上下任一頭（不用先走回某一頭才算上了手扶梯）
    if (t.escSide === ln.L) {
      const k = sc + ',' + sr; if (!links.has(k)) links.set(k, []);
      const toA = Math.abs(t.x - ln.ax) / CELL, toB = Math.abs(t.x - ln.bx) / CELL;
      links.get(k).push({ to: ln.a, cost: toA * factor(ln, -1) }, { to: ln.b, cost: toB * factor(ln, 1) });
    }
  }
  let found = false;
  while (heap.length) {
    const [, c, r, f] = pop(), key = c + ',' + r + ',' + f, d = dist.get(key);
    if (closed.has(key)) continue; closed.add(key);   // 同一格同一層只展開一次
    if (++pops > SENTRY_PATH_MAX) break;   // 搜太多格還沒找到：當成走不到（不然走不到的地方會把整張地圖搜完）
    if (key === goalKey) { found = true; break; }
    const kc = c + ',' + r, onRamp = rampCells.has(kc), onDeck = deckCells.has(kc) && !onRamp;
    const slopeStart = key === startKey && onSlope;   // 起點在手扶梯斜坡上：只能沿著手扶梯走到上下其中一頭（被扶手夾著，不能橫著走出去）
    for (const [dc, dr] of slopeStart ? [] : [[0, -1], [1, 0], [0, 1], [-1, 0]]) {
      const nc = c + dc, nr = r + dr; if (!inGrid(nc, nr)) continue;
      const nk = nc + ',' + nr;
      let wall;   // 跟 wallNow 一樣的規則
      if (rampCells.has(nk)) wall = mapWalls.has(nk) || (f !== 2 && !onRamp && onDeck);
      else if (onRamp) wall = deckCells.has(nk) ? deckBlocked(nk) : mapWalls.has(nk);
      else wall = f === 2 ? (!deckCells.has(nk) || deckBlocked(nk)) : mapWalls.has(nk) && !doorLanePoint(nc, nr);   // 沒對齊格子的門洞通道：交給 walkable 看正中線
      if (wall) continue;
      const nf = onRamp && !rampCells.has(nk) ? (deckCells.has(nk) ? 2 : 1) : f;   // 走出樓層出入口：換樓層
      if (!walkable(nc, nr, nf) || onFloorDo(nf, () => edgeBetween(c, r, nc, nr)) || escCross(c, r, nc, nr)) continue;
      const fl = flowAt(nc, nr) || flowAt(c, r), along = fl ? dc * fl[0] + dr * fl[1] : 0;
      const nd = d + (along > 0 ? SENTRY_ESC_WITH : along < 0 ? 1 + SENTRY_ESC_AGAINST : 1);
      const nKey = nk + ',' + nf;
      if (nd >= (dist.has(nKey) ? dist.get(nKey) : Infinity)) continue;
      dist.set(nKey, nd); cameFrom.set(nKey, key); push([nd + h(nc, nr), nc, nr, nf]);
    }
    for (const lk of links.get(kc) || []) {   // 走側面手扶梯到另一頭（另一頭在 2 樓地面或出入口上＝2 樓那側；不然＝1 樓）
      const [nc, nr] = lk.to, nk = nc + ',' + nr, nf = rampCells.has(nk) ? f : deckCells.has(nk) ? 2 : 1;
      const nd = d + lk.cost, nKey = nk + ',' + nf;
      if (nd >= (dist.has(nKey) ? dist.get(nKey) : Infinity)) continue;
      dist.set(nKey, nd); cameFrom.set(nKey, key + '|esc'); push([nd + h(nc, nr), nc, nr, nf]);
    }
  }
  if (!found) return null;
  const path = []; let key = goalKey;
  while (key && key !== startKey) {
    const prev = cameFrom.get(key), esc = !!prev && prev.endsWith('|esc');
    const [c, r, f] = key.split(',').map(Number); path.push(esc ? { c, r, f, esc: true } : { c, r, f });   // esc：這一步是走側面手扶梯（只管左右走）
    key = esc ? prev.slice(0, -4) : prev;
  }
  return path.reverse();
}
// 嚮導被逼到牆角時要繞去的地方：沿著走得到的格子往外找，離威脅越遠越好（路程越遠、死路都扣分）
function sentryFleeSpot(t, threat, maxSteps = 6) {
  const [sc, sr] = cellAt(t.x, t.y), seen = new Set([sc + ',' + sr]), queue = [[sc, sr, 0]];
  const dirs = [[0, -1], [1, 0], [0, 1], [-1, 0]];
  let best = null, bestScore = -Infinity;
  for (let head = 0; head < queue.length; head++) {
    const [c, r, steps] = queue[head];
    if (steps >= 2) {
      const [x, y] = center(c, r), exits = dirs.filter(([dc, dr]) => sentryCellWalkable(c + dc, r + dr)).length;
      const score = Math.hypot(x - threat.x, y - threat.y) - steps * 2 - (exits <= 1 ? CELL : 0);
      if (score > bestScore) { bestScore = score; best = { x, y }; }
    }
    if (steps >= maxSteps) continue;
    for (const [dc, dr] of dirs) {
      const nc = c + dc, nr = r + dr, key = nc + ',' + nr;
      if (seen.has(key) || edgeBetween(c, r, nc, nr) || !sentryCellWalkable(nc, nr)) continue;
      seen.add(key); queue.push([nc, nr, steps + 1]);
    }
  }
  return best;
}
// goalFloor：目的地在幾樓（跟著溫特時＝溫特在的那層；沒給＝照目的地那一格，js/pathfinding.js 的 placeFloorAt）
function moveSentryWithPath(t, targetX, targetY, speed, dt, goalFloor = null) {
  t.navTimer = (t.navTimer || 0) - dt;
  const next = t.navPath && t.navPath[0];
  const dark = !!(t.summonDark || t.followDark);   // 被召喚、跟著溫特走、去撿地上的東西：可以穿過黑暗
  if (typeof swimRingShoreGoal === 'function') {   // 想走進深水區（沒坐救生圈）：先走到最靠近的岸邊；溫特在水裡時會拿救生圈下水（js/swim-ring.js）
    const shore = swimRingShoreGoal(t, targetX, targetY, dark); if (shore) [targetX, targetY] = shore;
  }
  const [goalC, goalR] = cellAt(targetX, targetY), goalKey = goalC + ',' + goalR + (hasFloors && goalFloor ? ',' + goalFloor : '');
  const nextOk = !next || (next.f ? onFloorDo(next.f, () => sentryCellWalkable(next.c, next.r, false, dark)) : sentryCellWalkable(next.c, next.r, false, dark));   // 路上的下一格照它在的那層判斷
  const midEscalator = next && next.esc && t.escSide && t.navStall <= .8 && nextOk;   // 正在走側面手扶梯那一步：目的地小小移動不用重找（重找會被叫回某一頭）
  // 目的地換了：有陸橋的地圖至少隔 0.3 秒才重找（跟隨時目的地一直小小移動，每一幀都重找太花時間；路走完、卡住、下一格不能走照樣馬上重找）
  // 剛找不到路：先等 0.75 秒再試（不然目的地每動一下就把整區搜一遍）
  const goalMoved = t.navGoal !== goalKey && !midEscalator && (!hasFloors || (t.navReplanT || 0) <= 0 || (!t.navFailed && (!t.navPath || !t.navPath.length)));
  if (hasFloors) t.navReplanT = (t.navReplanT || 0) - dt;
  if (goalMoved || (!t.navPath && t.navTimer <= 0) || t.navStall > .8 || !nextOk) {
    if (hasFloors) t.navReplanT = .3;
    t.navPath = buildSentryPath(t, targetX, targetY, dark, goalFloor); t.navGoal = goalKey; t.navTimer = .75;
    if (!t.navPath && t.navFallback) t.navPath = buildSentryPath(t, t.navFallback.x, t.navFallback.y, dark, goalFloor);   // 找不到：改找去跟隨對象站的地方
    t.navStall = 0;
  }
  if (!t.navPath) { t.navFailed = true; if (hasFloors) t.navReplanT = .75; unwedgeSentry(t); return false; }
  t.navFailed = false;
  // 下一步是走側面手扶梯：只管左右走，高度由手扶梯跟著斜坡調（js/escalators.js 的 rideSideEscalator）；左右到了就算到
  if (t.navPath.length && t.navPath[0].esc) {
    // 逆著階梯走：隊員走路比溫特慢很多，照平常的速度會被階梯抵銷、永遠下不去 → 這一段加快腳步（SENTRY_ESC_HURRY 倍）
    const [wx] = center(t.navPath[0].c, t.navPath[0].r), dx = wx - t.x, L = t.escSide;
    const against = L && !L.stamp.still && Math.sign(dx) === -escalatorSideDir(L);
    const step = speed * dt * (against ? SENTRY_ESC_HURRY : 1);
    if (L) {   // 先靠到走道正中間（貼著扶手走，頭會撞到扶手後面的牆）
      const wantY = escalatorSideTopY(L, t.x) + (L.spec.band[0] + L.spec.band[1]) / 2 * L.k - ESCALATOR.footDy, gap = wantY - t.y;
      if (Math.abs(gap) > .5) { const ny = t.y + Math.sign(gap) * Math.min(Math.abs(gap), speed * dt); if (personnelStepAllowed(t.x, t.y, t.x, ny, dark)) t.y = ny; }
    }
    if (Math.abs(dx) <= Math.max(1, step)) { t.x = wx; t.navPath.shift(); return false; }
    const nx = t.x + Math.sign(dx) * step;
    if (personnelStepAllowed(t.x, t.y, nx, t.y, dark)) { t.x = nx; t.navStall = 0; }
    else { t.navStall = (t.navStall || 0) + dt; if (t.navStall > .8) { t.navTimer = 0; t.navFailed = true; } }
    return false;
  }
  // 必須到達轉彎格中心，不能剛跨入格子就跳過路點，否則會切角卡牆。
  while (t.navPath.length) {
    const [wx, wy] = sentryCellPos(t.navPath[0].c, t.navPath[0].r);   // 沒對齊格子的門洞：走到門洞正中線
    if (Math.hypot(wx - t.x, wy - t.y) > 1) break;
    if (!sentryBlocked(wx, wy)) { t.x = wx; t.y = wy; }   // 到了這一格：站到正中間（不留小數誤差，轉彎時才不會擦到牆角）
    t.navPath.shift();
  }
  const waypoint = t.navPath && t.navPath[0];
  let moveX = targetX, moveY = targetY;
  if (!waypoint && (sentryBlocked(moveX, moveY) || (!dark && !personnelInLight(moveX, moveY)))) {
    const goal = nearestSentryGoal(goalC, goalR, dark);
    if (!goal) { t.navFailed = true; return false; }
    [moveX, moveY] = sentryCellPos(...goal);
  }
  if (waypoint) [moveX, moveY] = sentryCellPos(waypoint.c, waypoint.r);
  const dx = moveX - t.x, dy = moveY - t.y, distance = Math.hypot(dx, dy), step = speed * dt * (typeof slowFactorAt === 'function' ? slowFactorAt(t.x, t.y, 'ally', t) : 1);   // 走在鐵絲網上變慢（給 t：別層的坑洞、黏膠不算）
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
  let moved = Math.hypot(t.x - oldX, t.y - oldY) > .001;
  // 卡在牆角（例如只有一格寬的門：兩旁的牆往下微調過，人站得偏一點就轉不了彎）：先往這一格的正中間靠，再從中間轉彎
  // （路是照格子中心找的，從格子中間一定轉得過去；不然會一直站著、頭上說「被卡住了，走不出去」）
  if (!moved && distance > 2) {
    const [cx, cy] = sentryCellPos(...cellAt(t.x, t.y)), ox = cx - t.x, oy = cy - t.y, od = Math.hypot(ox, oy);
    if (od > .01) {
      const k = Math.min(1, step / od), sx = t.x + ox * k, sy = t.y + oy * k;
      if (personnelStepAllowed(t.x, t.y, sx, t.y, dark)) t.x = sx;
      if (personnelStepAllowed(t.x, t.y, t.x, sy, dark)) t.y = sy;
      moved = Math.hypot(t.x - oldX, t.y - oldY) > .001;
    }
  }
  t.navStall = Math.hypot(dx, dy) > 2 && !moved ? (t.navStall || 0) + dt : 0;
  if (t.navStall > .8) { t.navTimer = 0; t.navFailed = true; }
  return false;
}
// 在 (cx,cy) 周圍找一個「亮的、走得到」的隨機點
// who：在誰身邊閒逛（有 2 樓的地圖才用）：只挑跟這個人同一層的地方，也不挑手扶梯上的格子。
// 不然跟著溫特上了 2 樓的隊員，閒逛時會挑到平台底下的 1 樓、或手扶梯頂端，又走回樓下或被手扶梯帶下去，一直上上下下
function sampleWanderTarget(cx, cy, radius, who = null) {
  const floor = hasFloors && who ? actorFloor(who) : null;
  for (let i = 0; i < 12; i++) {
    const ang = Math.random() * Math.PI * 2, d = 30 + Math.random() * radius;
    const x = cx + Math.cos(ang) * d, y = cy + Math.sin(ang) * d;
    const [c, r] = cellAt(x, y);
    if (!inGrid(c, r) || isWall(c, r) || isEntrance(c, r) || G.grid[c + ',' + r]) continue;
    if (floor != null && ((typeof escalatorFlowAt === 'function' && escalatorFlowAt(c, r)) || placeFloorAt(x, y, who) !== floor)) continue;
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
  // 其他人（含嚮導）：戰鬥地圖上沒下指令時，也慢慢跟著溫特，在溫特附近（頭燈、手電筒照得到的地方）巡邏；
  // 溫特走進黑暗也會跟過去（不然營地外一片黑，大家只會待在營地的燈下）。應變中心等安全區照舊待在自己的活動範圍
  if (!MAP_SAFE && G.player) return { anchor: G.player, radius: FOLLOW_PLAYER.radiusCells * CELL, speed: (TYPES[t.type].walkSpeed || 80) * FOLLOW_PLAYER.speedMul };
  return null;
}
// 自由走動的隊員跟著溫特的範圍：離溫特超過 radiusCells 格就追上去；speedMul＝追的時候比平常走路快幾倍
const FOLLOW_PLAYER = { radiusCells: 6, speedMul: 1.15 };
// 這個隊員是不是正跟著溫特、而且就在溫特身邊（在溫特身邊就算暗也不用逃回燈下：溫特會照著他們）
function nearFollowedPlayer(t) {
  if (!G || !G.player || !G.towers || !G.towers.includes(t)) return false;
  const rule = sentryCompanionRule(t);
  return !!(rule && rule.anchor === G.player && Math.hypot(G.player.x - t.x, G.player.y - t.y) <= rule.radius * 1.3);
}
// 索敵範圍內有沒有看得見的敵人／核心（有的話護衛圈先讓位給接敵，避免在圈邊抖動）
function hasAggroTarget(t) {
  const spec = TYPES[t.type]; if (!spec) return false;
  const cores = (typeof G.cores !== 'undefined') ? G.cores : [];
  if (!G.enemies.length && !cores.some(c => !c.dead && c.awake && !c.hidden)) return false;
  const detectR = (spec.aggroRange || spec.range + 1.5) * CELL;
  for (const e of [...G.enemies, ...cores]) {
    if (e.dead || e.awake === false || e.hidden || e.carried || (typeof poolCoreSubmerged === 'function' && G.cores.includes(e) && poolCoreSubmerged(e))) continue;   // 泡在深水裡的核心也不算（js/pool-tide.js）；沉睡的核心不算目標；躲在順順宮帽裡、抱在珍珠大童身上的也不算（js/elite-cap-king.js、js/pearl-elder.js）
    if (typeof eliteHoldFire === 'function' && eliteHoldFire(e)) continue;   // 還在站崗的鳥頭大隊長與手下：不主動接敵（js/elite-bird-head.js）
    if (LIGHT.enabled && !isLit(e.x, e.y) && !(e.awake && cores.includes(e))) continue;   // 醒著的核心會發光，暗處也算看得到
    if (!cores.includes(e) && !sameFloor(e, t)) continue;   // 陸橋上／下不同樓層的怪物打不到：不算（不然橋上的隊員會一直站在橋下怪物的正上方不走、也不跟溫特）
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
    if (e.dead || e.hp <= 0 || e.attackingObstacle !== base || !sameFloor(e, t)) continue;   // 不同樓層的打不到
    if (LIGHT.enabled && !isLit(e.x, e.y)) continue;
    const distance = Math.hypot(e.x - t.x, e.y - t.y);
    if (distance <= bestDistance) { closest = e; bestDistance = distance; }
  }
  return closest;
}
// 嚮導要先去照顧的隊員：門檻跟光環一樣（js/camp-supply.js 的 minTaint／minHeal、js/game.js 的嚮導隨身疏導），身上沒 SP／急救包的那項不算，免得走過去卻不動手
// 不補溫特、不互補嚮導；前往指定地點途中不去；跟隨護衛時只照顧溫特附近（ESCORT.chaseCells）的人；應變中心裡不跟（受傷的人去醫院休養，js/vitals.js）
const GUIDE_CARE_EVADE = 1.5;   // 正要去照顧人時，怪物貼到幾格內才往後退（平常是角色的 evade）
function guideCareTarget(t, spec) {
  if (MAP_SAFE || t.mode === 'goto' || !spec.aura) return null;
  const canSoothe = typeof guideCanSoothe !== 'function' || guideCanSoothe(t);
  const canHeal = (spec.aura.heal || 0) > 0 && (typeof guideCanHeal !== 'function' || guideCanHeal(t));
  if (!canSoothe && !canHeal) return null;
  const escortR = t.mode === 'escort' && G.player ? ESCORT.chaseCells * CELL : Infinity;
  const needy = G.towers.filter(o =>
    o !== t && o.hp > 0 && !TYPES[o.type].guide &&
    ((canSoothe && (o.berserk || (o.taint || 0) >= CAMP_SUPPLY.minTaint)) || (canHeal && o.maxhp - o.hp >= CAMP_SUPPLY.minHeal)) &&
    (escortR === Infinity || Math.hypot(o.x - G.player.x, o.y - G.player.y) <= escortR)
  );
  if (!needy.length) return null;
  needy.sort((a, b) => {   // 暴走 → 汙染高 → 少血多 → 近
    if (!!b.berserk !== !!a.berserk) return b.berserk ? 1 : -1;
    const loadDiff = (b.taint || 0) - (a.taint || 0);
    if (Math.abs(loadDiff) > 1) return loadDiff;
    const injuryDiff = (b.maxhp - b.hp) - (a.maxhp - a.hp);
    if (Math.abs(injuryDiff) > 1) return injuryDiff;
    return Math.hypot(a.x - t.x, a.y - t.y) - Math.hypot(b.x - t.x, b.y - t.y);
  });
  return needy.find(o => Math.hypot(o.x - t.x, o.y - t.y) <= spec.aura.r * CELL || buildSentryPath(t, o.x, o.y, true) !== null) || null;   // true：走暗路也算走得到（隊員常跟著溫特在暗處）
}
// 坐救生圈的隊員：更新時讓深水不擋、划水變慢；更新完划上岸就收起救生圈（js/swim-ring.js）
function updateSentry(t, dt) {
  if (typeof swimRingWithActor !== 'function') { updateSentryMain(t, dt); return; }
  swimRingAllyTick();
  const x0 = t.x, y0 = t.y;
  swimRingWithActor(t, () => updateSentryMain(t, dt));
  swimRingAllyAfterMove(t);
  if (typeof poolFallAllyCheck === 'function') poolFallAllyCheck(t, dt, x0, y0);   // 走在水邊：有機會失足掉進深水（js/pool-fall.js）
}
function updateSentryMain(t, dt) {
  t.followDark = false;   // 這一幀要不要穿過黑暗：跟著溫特、照顧人、撿地上的東西時才打開（moveSentryWithPath 看這個）
  if (t.hp <= 0) { t.target = null; t.moving = false; if (!(t.say && t.say.hurt)) t.say = null; return; }   // 失去戰鬥能力：頭上的泡泡也收掉（倒下時喊的那句留著，js/mate-hurt-talk.js）
  if (t.eatenBy || t.rkHeld) { t.target = null; t.moving = false; return; }   // rkHeld：被老鼠王的手抓住（js/rat-king.js）   // 卡在虱目魚小子嘴裡（js/milkfish-kid.js）
  if (t.mrtRide) { t.target = null; t.moving = false; return; }   // 搭捷運：跟著列車動（js/mrt-train.js）
  if (typeof mealInviteStep === 'function' && mealInviteStep(t, dt)) return;   // 被邀請一起去吃飯：跟著溫特、吃飯、吃完逛一下（js/meal-invite.js）
  if (typeof baseFollowStep === 'function') baseFollowStep(t);   // 雷德跟著溫特換地圖：剛過來的放到溫特旁邊（js/base-follow.js）
  if (tinoSootheTripStep(t, dt)) return;
  if (MAP_SAFE && typeof npcChatStep === 'function' && npcChatStep(t, dt)) return;   // 基地：正在跟別人閒聊（js/npc-chats.js）
  if (MAP_SAFE && npcSeatStep(t, dt, TYPES[t.type].walkSpeed || 80)) { updateNpcTalk(t, dt); return; }   // 安全區：坐著或正走向椅子
  if (t.poolFall && t.poolFall.phase !== 'struggle') { t.target = null; t.moving = false; return; }   // 失足：正在搖晃、掉進水裡（js/pool-fall.js）；要在脫困之前，不然掉到一半會被推回岸上
  rescueStuck(t, sentryBlocked);                      // 被卡在建築裡→自動脫困
  if (t.rootT > 0) { t.moving = false; t.knockT = 0; return; }   // 被絲瓜藤纏住：不能移動（js/loofah-lady.js）
  if (stepActorKnock(t, dt, sentryBlocked)) { t.moving = false; return; }   // 被鳥頭人撞飛：滑行中（js/bird-head.js）
  updateNpcTalk(t, dt);                                // 哨兵平時也會冒泡泡說話
  if (t.poolFall && poolFallPanicking(t)) { t.target = null; t.moving = false; return; }   // 剛落水原地慌張（js/pool-fall.js）
  if (t.drowning && typeof poolDrownFlee === 'function' && poolDrownFlee(t, dt)) return;   // 溺水：用 3 成的速度往岸上逃，不攻擊（js/pool-tide.js）
  t.guardSpeechCd = Math.max(0, (t.guardSpeechCd || 0) - dt);
  if (t.berserk) { t.target = null; return; }        // 暴走中：站在原地失控
  if (t.mothConfuseT > 0) { t.target = null; return; }   // 人面蝶的混亂鱗粉：走路由 mothConfusedSentry 處理（js/human-face-butterfly.js）
  // 地上有溫特丟的游泳圈：離它最近、還沒有游泳圈的隊員走去撿（js/swim-ring.js）。游泳圈在溫特腳邊，站在暗處的隊員也照樣走過去
  if (typeof swimRingGroundStep === 'function' && swimRingGroundStep(t, dt)) return;
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
  if (marked && sameFloor(marked, t) && personnelInLight(marked.x, marked.y) && (Math.hypot(marked.x - t.x, marked.y - t.y) > ownSpec.range * CELL - 6 || !hasLineOfSight(t.x, t.y, marked.x, marked.y))) {
    t.target = null; t.waitT = 0;
    moveSentryWithPath(t, marked.x, marked.y, (ownSpec.walkSpeed || 80) * 1.2, dt);
    return;
  }
  const care = ownSpec.guide ? guideCareTarget(t, ownSpec) : null;   // 有隊員要補血／疏導：先去處理，不被怪吸走
  // 嚮導保持安全距離：敵人靠近時優先往反方向撤退，仍可在遠處攻擊與治療。
  // 正要去照顧人時只在怪真的貼身（GUIDE_CARE_EVADE 格）才退，不然站不進光環範圍
  if (ownSpec.guide && G.enemies.length) {
    let threat = null, threatD = Infinity;
    for (const e of G.enemies) {
      if (e.dead || e.confuseT > 0 || !sameFloor(e, t)) continue;   // 陸橋上／下不同樓層的怪物碰不到，不用躲
      const d = Math.hypot(e.x - t.x, e.y - t.y);
      if (d < threatD) { threat = e; threatD = d; }
    }
    const safeDistance = (care ? GUIDE_CARE_EVADE : (ownSpec.evade || 3)) * CELL;
    if (threat && threatD < safeDistance) {
      const dx=t.x-threat.x,dy=t.y-threat.y,d=threatD||1,speed=(ownSpec.walkSpeed||80)*1.35,step=speed*dt;
      t.target=null; t.waitT=0;
      t.evadeT=(t.evadeT||0)-dt;
      if (t.evadeCell && t.evadeT>0) { if (moveSentryWithPath(t,t.evadeCell.x,t.evadeCell.y,speed,dt) || t.navFailed) t.evadeCell=null; return; }   // 正在繞出牆角
      const nx=t.x+dx/d*step,ny=t.y+dy/d*step,ox=t.x,oy=t.y;
      if (personnelStepAllowed(t.x,t.y,nx,t.y)) t.x=nx;
      if (personnelStepAllowed(t.x,t.y,t.x,ny)) t.y=ny;
      if (Math.hypot(t.x-ox,t.y-oy)<step*.4) { t.evadeCell=sentryFleeSpot(t,threat); t.evadeT=.8; t.navPath=null; }   // 往後退不動（背後是牆、牆角）：改找走得到的地方繞出去
      return;
    }
  }
  // 嚮導身上的急救包或杏仁水用完了：自己回營地物資箱拿（js/camp-supply.js）
  if (ownSpec.guide && typeof guideSupplyStep === 'function' && guideSupplyStep(t, dt, care)) return;
  // 所有嚮導：有人要補血／疏導就先走到他身邊，跳過下面的護衛圈和主動接敵（攻擊仍由 game.js 對射程內目標自動執行）
  t.supportTarget = care ? care.type : null;
  if (care) {
    t.followDark = true;   // 要照顧的人跟著溫特走到暗處了：照樣過去
    followTarget(t, care, { dist: CELL * 1.35, speed: (ownSpec.walkSpeed || 80) * 1.12 }, dt);
    t.target = null; t.waitT = 0;
    return;
  }
  // 玩家明確下達的前往指令優先於追敵與角色跟隨關係，避免目的地被接敵邏輯清除。
  if (t.mode === 'goto' && t.target) {
    const speed = (ownSpec.walkSpeed || 80) * 1.5;
    if (moveSentryWithPath(t, t.target.x, t.target.y, speed, dt)) {
      t.target = null; t.navPath = null; t.navGoal = null;
      t.mode = 'hold'; t.anchor = { x: t.x, y: t.y };
      if (typeof resetSentryProgress === 'function') resetSentryProgress(t);
      flash('開始巡邏', t.x, t.y - 24, '#7ee0c0', 3);
      systemNotice(TYPES[t.type].name + '已抵達巡邏點，開始巡邏');
    } else if (typeof watchSentryProgress === 'function') {   // 走不過去、站著不動：說出原因（js/sentry-blocked.js）
      const goal = t.target;
      watchSentryProgress(t, dt, '巡邏點', () => sentryBlockReason(t, goal.x, goal.y, { dark: !!(t.summonDark || t.followDark), where: '巡邏點' }));
    }
    return;
  }
  // 護衛圈：圈內可自行巡邏；距離被拉開時，會先追上指定角色再恢復自由行動。
  // 玩家明確下達的 goto / hold 指令仍優先，不會被護衛關係覆蓋。
  const companion = sentryCompanionRule(t);
  if (companion && !hasAggroTarget(t)) {   // 有敵可打時交給接敵邏輯，護衛圈先讓位（避免圈邊抖動）
    const companionDistance = Math.hypot(companion.anchor.x - t.x, companion.anchor.y - t.y);
    const otherFloor = hasFloors && actorFloor(companion.anchor) !== actorFloor(t);   // 跟隨的人在另一層（例如溫特上了 2 樓）：再近也要跟過去
    // 站在打開的門裡（門口只有一格寬）：就算已經在身邊也不要停在門裡，再往跟隨的人靠近一點、走出門口（不然會把後面的人堵住）
    const inDoorway = (typeof mapDoors !== 'undefined' && mapDoors.some(d => d.open && d.cells.includes(cellAt(t.x, t.y).join(','))))
      || (!!doorLanePoint(...cellAt(t.x, t.y)) && sentryBlocked(...center(...cellAt(t.x, t.y))));   // 沒對齊格子的門洞通道（格子正中間是牆、只能走門洞正中線的那幾格）也算門口，不要停在裡面（js/pathfinding.js）
    // 部隊長傳送到隊員跟不過去的地方（例如池核泳池中間的祕密小島）時被留下來的隊員（js/game.js 的 teleportInMap）：
    // 站在原地安靜等（看到怪照樣打），不一直說去不了；每秒看一次，部隊長回到走得到的地方就恢復跟隨
    if (t.leftBehind && t.mode === 'escort') {
      t.leftBehindT = (t.leftBehindT || 0) - dt;
      if (t.leftBehindT <= 0) { t.leftBehindT = 1; if (buildSentryPath(t, companion.anchor.x, companion.anchor.y, true, hasFloors ? actorFloor(companion.anchor) : null) !== null) t.leftBehind = false; }
    } else t.leftBehind = false;
    // 直線上很近、實際卻要繞一大圈（例如隔著停在月台的通道列車、隔著牆）：不算跟上了，要繞過去。
    // 不然隊員站在列車另一邊的月台，直線距離不到跟隨範圍就停下來，永遠不跟過來。每秒用找路算一次實際要走幾格
    let detour = false;
    if (!t.leftBehind && !otherFloor && companionDistance <= companion.radius) {
      t.detourCheckT = (t.detourCheckT || 0) - dt;
      if (t.detourCheckT <= 0) {
        t.detourCheckT = 1;
        const path = buildSentryPath(t, companion.anchor.x, companion.anchor.y, true, hasFloors ? actorFloor(companion.anchor) : null);
        t.followDetour = !!(path && path.length * CELL > companion.radius * 1.5);   // 要走的格數比跟隨範圍多一半以上＝要繞路
      }
      detour = !!t.followDetour;
    } else t.followDetour = false;
    if (!t.leftBehind && (companionDistance > companion.radius || otherFloor || detour || onMovingEscalator(t) || inDoorway)) {   // 還站在手扶梯上：先跟著走下來，不在上面停
      t.target = null; t.waitT = 0;
      t.followDark = true;   // 跟著別人走（溫特、或阿瓦倫跟著艾德林）：中間是暗的也照走（溫特身上有燈）；站在門口：門外暗也要走出來，不然會一直堵在門裡
      // 站在門口、對方就在旁邊：直接走到對方站的地方（對方常常就停在門口外面一格，只靠近到一格內的話會停在門裡）；一走出門口就照平常停下來
      // 要繞路：直接走到對方身邊（直線距離本來就在範圍內，照平常的停止距離會原地不動），走到了找路距離變短就恢復平常
      followTarget(t, companion.anchor, { dist: detour ? CELL * 1.5 : inDoorway && companionDistance <= companion.radius ? 0 : companion.radius * .82, speed: companion.speed }, dt);
      if (t.mode === 'escort' && typeof watchSentryProgress === 'function') watchSentryProgress(t, dt, leaderLabel(), () => sentryLeaderBlockReason(t));   // 叫來護衛卻過不來：說出原因（js/sentry-blocked.js）
      return;
    }
    if (typeof resetSentryProgress === 'function') resetSentryProgress(t);   // 已經在身邊了
    if (t.target && Math.hypot(t.target.x - companion.anchor.x, t.target.y - companion.anchor.y) > companion.radius) {
      t.target = null; t.navPath = null;
    }
  }
  // 主動接敵：看到亮處的怪物就靠近攻擊（開火由 game.js 處理；這裡只負責走過去）
  // 追多遠依模式：自由走動＝追得遠、原地巡邏／指派＝只追崗位附近，怪死或跑遠就回去巡邏。
  const litHere = !LIGHT.enabled || isLit(t.x, t.y);
  const awakeCore = G.cores.some(c => !c.dead && c.awake && !c.hidden);   // 醒著的核心會發光：在暗處也看得到、會走過去打
  if (!TYPES[t.type].noAttack && (litHere || awakeCore) && (G.enemies.length || awakeCore)) {   // 不攻擊的嚮導（塔納）：不去追怪
    const spec = TYPES[t.type];
    const fogK = typeof fogRangeMul === 'function' ? fogRangeMul(t) : 1;   // 站在霧裡：看不遠（js/fog.js）
    const atkR = spec.range * CELL * fogK;                // 射程（像素）
    const anchor = t.mode === 'escort' && G.player ? G.player : (t.mode !== 'free' && t.anchor) ? t.anchor : t;   // 護衛時以部隊長為中心
    const detectR = (t.guardSummoned ? Math.max(220, (spec.aggroRange || spec.range + 1.5) * CELL) : (spec.aggroRange || spec.range + 1.5) * CELL) * fogK;
    const holdR = ((typeof PATROL !== 'undefined' && PATROL.holdChaseCells) || 6) * CELL;
    const leashR = t.guardSummoned ? 220 : t.mode === 'escort' ? ESCORT.chaseCells * CELL : t.mode === 'free' ? Math.max(260, detectR) : t.mode === 'hold' ? holdR : 110;
    let foe = null, fd = Infinity;
    for (const e of (t.guardSummoned ? G.enemies : [...G.enemies, ...G.cores])) {
      if (e.dead || e.awake === false || e.hidden || e.carried || (typeof poolCoreSubmerged === 'function' && G.cores.includes(e) && poolCoreSubmerged(e))) continue;   // 泡在深水裡的核心也不追（js/pool-tide.js）；沉睡的核心不去追；躲在順順宮帽裡、抱在珍珠大童身上的也不追（js/elite-cap-king.js、js/pearl-elder.js）
      if (typeof eliteHoldFire === 'function' && eliteHoldFire(e)) continue;   // 還在站崗的鳥頭大隊長與手下：不去追
      if (LIGHT.enabled && !isLit(e.x, e.y) && !(e.awake && G.cores.includes(e))) continue;    // 只追亮處看得見的怪（醒著的核心例外）
      if (!litHere && !G.cores.includes(e)) continue;      // 自己站在暗處：只會去打醒著的核心
      if (!G.cores.includes(e) && !sameFloor(e, t)) continue;   // 不同樓層（陸橋上／下）的怪物打不到，不去追（以前會走到牠正上方一直站著）
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
    const tgt = home ? sampleHomeTarget(home, t) : sampleWanderTarget(anchor.x, anchor.y, radius, companion ? companion.anchor : t);   // 跟著別人：挑那個人那一層的地方
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
    if (!npc.say.hurt) npc.say.life -= dt;   // 被攻擊的台詞由 js/mate-hurt-talk.js 倒數
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
    const away = !battle && (awayLineKey(key) || (typeof mealMapReady === 'function' && mealMapReady() ? 'idleMeal' : null));   // 負荷高被送到疏導室、受傷住院：改說那裡的台詞（對話編輯器的「在疏導室閒晃」「住院時的頭上泡泡」）；在食堂（有餐盤架、打飯台、回收區的地圖）：說「在食堂閒晃」；沒填就不說
    // 在醫院裡、但不是住院中的隊員（剛出院正要走回去）：不說平常的閒晃台詞（平常就待在醫院的人照樣說）
    const hospitalGuest = !battle && !away && npc.kind === 'tower' && typeof VITALS !== 'undefined' && MAP && MAP.name === VITALS.hospitalMap
      && (typeof npcLocation !== 'function' || (npcLocation(key) || {}).map !== VITALS.hospitalMap);
    if (hospitalGuest) { npc.sayWait = 4; return; }
    const lines = battle ? chapterPick(BATTLE_WANDER_LINES[key]) : away ? dialogueLines(key, away) : ((typeof WANDER_LINES !== 'undefined' && chapterPick(WANDER_LINES[key])) || null);   // 各說各的：出勤泡泡沒填就不說（不借用閒晃台詞）
    if (lines && lines.length) npc.say = { text: lines[Math.floor(Math.random() * lines.length)], life: talkCfg.duration };
    else npc.sayWait = 4;   // 沒台詞：晚點再檢查
  }
}
// 跟隨：朝目標移動，保持 cfg.dist 的距離就停（只改座標，走路動畫由主迴圈處理）
// 站在會動的手扶梯上（側面的、正面的都算）：停下來會被階梯帶走，所以跟隨時不能停在上面
// 側面的只算斜坡那一段（兩頭的平台不會動，可以停）
function onMovingEscalator(a) {
  if (!a) return false;
  const L = a.escSide;
  if (L && L.map === MAP && !L.stamp.still) { const ix = escalatorSideIx(L, a.x); if (ix >= L.spec.x0 && ix <= L.spec.x1) return true; }
  const lane = typeof escalatorLaneAt === 'function' ? escalatorLaneAt(a.x, a.y + (typeof ESCALATOR !== 'undefined' ? ESCALATOR.footDy : 14)) : null;
  return !!(lane && !(lane.stamp && lane.stamp.still));
}
function followTarget(mover, target, cfg, dt) {
  if (!target) return false;
  const dx = target.x - mover.x, dy = target.y - mover.y, d = Math.hypot(dx, dy);
  if (d <= cfg.dist && (!hasFloors || actorFloor(target) === actorFloor(mover)) && !onMovingEscalator(mover)) return true;   // 夠近了就停（不同樓層不算近：溫特在橋上、自己在橋下時要繞去上面；還站在手扶梯上就先走下來）
  const near = d <= cfg.dist || d < 1;   // 平面上已經很近（只是在另一層）：直接走去對方站的位置那一層
  let tx = near ? target.x : target.x - dx / d * cfg.dist, ty = near ? target.y : target.y - dy / d * cfg.dist;
  // 停的點是照直線算的，隔著牆時常常落在牆裡（例如溫特穿過門走到斜上方的走廊）：
  // 這時改成直接朝對方走，走到夠近（上面的 cfg.dist）自然會停。不然會去找「離牆裡那個點最近的空格」，常常就是門洞本身，整隊卡在門裡
  if (!near && !onFloorDo(mover, () => sentryCellWalkable(...cellAt(tx, ty), true, !!(mover.summonDark || mover.followDark)))) { tx = target.x; ty = target.y; }
  mover.navFallback = hasFloors && !near ? target : null;   // 有陸橋的地圖：停在中間的那個點找不到路（例如落在別的區塊）→ 改成直接找去對方站的地方
  moveSentryWithPath(mover, tx, ty, cfg.speed, dt, hasFloors ? actorFloor(target) : null);
  mover.navFallback = null;   // 目的地在跟隨對象那一層（溫特上 2 樓就找上 2 樓的路）
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
    if (onFloorDo(seat.floor || 1, () => sentryBlocked(x, y)) || !personnelInLight(x, y)) continue;   // 照椅子那一層判斷站不站得下
    const d = Math.hypot(x - seat.x, y - seat.y);
    if (d < bestD) { bestD = d; best = { x, y }; }
  }
  return best;
}
const NPC_NO_SEAT = ['ball'];   // 不會去坐椅子、躺床的角色（球球是狗）
function trySeatActor(a) {
  if (NPC_NO_SEAT.includes(a.kind === 'tower' ? a.type : a.id)) return false;
  if (MAP_SAFE && typeof tryStartMeal === 'function' && tryStartMeal(a)) return true;   // 餐廳：有機率先去吃飯（js/meal.js）
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
  if (typeof mealStep === 'function' && mealStep(a, dt, speed)) return true;   // 正在吃飯的流程（js/meal.js）
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
  if (typeof mealInviteStep === 'function' && mealInviteStep(npc, dt)) return;   // 被邀請一起去吃飯：跟著溫特、吃飯、吃完逛一下再回去（js/meal-invite.js）
  if (typeof ashBusy === 'function' && ashBusy(npc)) return;   // 亞許正在疏導室幫隊員疏導（js/vitals.js）
  if (MAP_SAFE && typeof npcChatStep === 'function' && npcChatStep(npc, dt)) return;   // 正在跟別人閒聊（js/npc-chats.js）
  if (npcSeatStep(npc, dt, 65)) { updateNpcTalk(npc, dt); return; }   // 坐著或正走向椅子
  if (npc.id === 'ball' && typeof ballBedStep === 'function' && ballBedStep(npc, dt)) { updateNpcTalk(npc, dt); return; }   // 球球：睡在自己的床上或正走過去（js/ball-poses.js）
  rescueStuck(npc, sentryBlocked);
  updateNpcTalk(npc, dt);   // 對話倒數（即使站著不動也會說話）
  if (escapeDarkness(npc, dt)) return;
  if (npc.id === 'ball' && !MAP_SAFE && getTeam().includes('ball')) {
    const anchor = dogFollowAnchor();   // 預設跟領犬員；可以改跟別的隊員或溫特（js/rescue-dog.js）
    if (typeof updateDogTunnel === 'function' && updateDogTunnel(npc, anchor, dt)) return;   // 🕳️ 聞到隱藏的地道：跑過去坐下汪汪叫（js/rescue-dog.js）
    if (updateRescueDogPickup(npc, anchor, dt)) return;
    followTarget(npc, anchor, { dist: CELL * 1.25, speed: 110 * (typeof dogSpeedMul === 'function' ? dogSpeedMul() : 1) }, dt);   // 💨 技能：跑更快
    npc.target = null; npc.waitT = 0;
    return;
  }
  // 阿瓦倫緊跟著艾德林
  if (npc.id === 'avaren' && typeof FOLLOW !== 'undefined') {
    const eldrin = G.npcs.find(n => n.id === 'eldrin');
    if (eldrin) { followTarget(npc, eldrin, FOLLOW.avaren, dt); npc.target = null; npc.waitT = 0; return; }
  }
  if (menuSentry === npc) return;   // 右鍵選單開著：先站好（openNpcMenu）
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
  const spec = TYPES[t.type], food = (1 + sortieBuff(t, 'atk')) * (typeof bananaDebuffAtk === 'function' ? bananaDebuffAtk(t) : 1);   // 出勤補給＋嚮導技能的攻擊加成；金蕉大王紅色魔法陣的攻擊下降（js/banana-emperor.js）
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
    (typeof canSendToHospital === 'function' && canSendToHospital(t) ? '<button data-act="hospital">🏥 去醫院休息</button>' : '');   // 基地裡、HP 沒滿（js/vitals.js）   // 邀請吃飯改在對話框的選項（js/meal-invite.js）
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
  t.mode = 'escort'; t.guardSummoned = false; t.guardBase = null; t.leftBehind = false;
  t.target = null; t.anchor = null; t.waitT = 0; t.navPath = null; t.navGoal = null;
  t.navFailed = false; t.escortRouteT = 0;   // 重新找路（上次失敗的記號不要留著）
  const reason = typeof sentryLeaderBlockReason === 'function' ? sentryLeaderBlockReason(t) : null;   // 現在就過不去：直接說原因，不要假裝在路上（js/sentry-blocked.js）
  if (reason) { sayBlocked(t, leaderLabel(), reason); return; }   // 一樣維持護衛模式：路通了（例如門打開）就會自己過去
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
  const cost = SOOTHE.cost;
  if (G.guide < cost) { sfx('error'); sentryStatus(t, '嚮導能量不足', '#ff8f8f', true); return; }
  if (typeof startChannel !== 'function') { finishSoothe(t); return; }
  spawnSootheCast(G.player, SOOTHE_COLORS[PLAYER_CHARACTER] || SOOTHE_COLORS.winter, 0);   // 溫特腳下法陣（跟以前一樣約 1 秒）
  SFX.play('soothe', 1, 'winter-soothe');                 // 開始疏導：「疏導」音效
  startChannel({ kind: 'soothe', total: (SOOTHE.time || 3) * careStyle().time, target: t, label: '疏導中', color: '#8fd3ff', needAlive: true, onDone: () => finishSoothe(t),
    onTick: dt => sootheMotes(t, dt),   // 疏導期間：溫特和隊員身邊一直飄出藍色小光點
    onCancel: () => { if (SFX.fadeOut) SFX.fadeOut('winter-soothe', .3); } });   // 中斷：開始的音效淡掉
}
// 疏導期間的鮮豔藍色小光點：從溫特和隊員身邊冒出來，慢慢往上飄、淡掉（數值在 js/attack-fx.js 的 SOOTHE_MOTES）
const winterMoteHolder = {};
function sootheMotes(t, dt) { spawnSootheMotes([G.player, t], SOOTHE_MOTE_COLORS[PLAYER_CHARACTER] || SOOTHE_MOTE_COLORS.winter, dt, winterMoteHolder); }
function finishSoothe(t) {
  const cost = SOOTHE.cost;
  if (G.guide < cost) { sfx('error'); sentryStatus(t, '嚮導能量不足', '#ff8f8f', true); return; }
  G.guide -= cost;
  const amount = Math.round(SOOTHE.heal * careStyle().amount);   // 溫特：降比較多；艾德林：降比較少但身邊的哨兵一起（data/balance.js 的 CARE_STYLE）
  const list = typeof careTargets === 'function' ? careTargets(t, o => !TYPES[o.type].guide && ((o.taint || 0) > 0 || o.berserk), false) : [t];
  for (const o of list) {
    const amt = Math.round(amount * (typeof equipSootheMul === 'function' ? equipSootheMul(PLAYER_CHARACTER, o.type) : 1));   // 共感手環：疏導的人、被疏導的哨兵戴著都降更多（疊加）
    o.taint = Math.max(0, o.taint - amt);
    if (o.berserk && o.taint < 60) o.berserk = false;
    spawnSootheEffect(o.x, o.y - 8, SOOTHE_COLORS[PLAYER_CHARACTER] || SOOTHE_COLORS.winter, o);   // 玩家溫特疏導：藍色（操作艾德林時用艾德林的綠色），光環跟隨哨兵
    sentryStatus(o, '負荷 -' + amt, '#7ee0c0');
  }
  if (list.length > 1) spawnSootheCast(G.player, SOOTHE_COLORS[PLAYER_CHARACTER] || SOOTHE_COLORS.winter, careStyle().area * CELL);   // 範圍疏導：腳下的光圈
  sfx('sootheEnd');   // 疏導成功：「疏導2」音效
  addStat('soothes');   // 成就：親自疏導次數
  updateHUD();
}
