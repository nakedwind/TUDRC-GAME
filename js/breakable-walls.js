/* ===== 可以炸開的牆 =====
   地圖編輯器放「後室牆面（可炸開）」：平時看起來是完整的牆，中間那格擋路。
   被爆炸波及（地雷、瓦斯爐、油桶、油箱、自爆史萊姆、希奧妮大招）：
     第 1 次 → 出現裂痕（stages[0] 的圖）
     第 2 次 → 炸出破洞（stages[1] 的圖），open 那幾格變成可以走過去
   只在這一局有效，重新開始就恢復完整的牆。
   「後室牆面（可炸開・隱藏區）」：一樣可以炸開，而且牆另一邊（上方）跟它連通的整片區域平常全黑，
   炸開之後才慢慢顯現（隱藏的通道／房間）。
   「後室牆面（裂縫・可炸開）」「後室牆面（裂縫・可炸開・隱藏區）」（Back-room-wall02-damage-03 的圖）：已經裂開，炸一次就開。
   另一種做法：地圖編輯器把圖層設成「🧱 隱藏區」，那些圖層上的東西在炸開最近的可炸開牆之前塗黑（secretLayerAreas）。
   「後室牆面（裂縫）」本身只是裝飾（也是可炸開的牆被炸第一下時換上的圖），不能炸。
*/
// 素材 id → stages：依序換成哪些圖；open：炸開後可以通過的格子（[第幾欄, 第幾列]，從大圖左上角算）
// solid：一直擋路的格子（不管地圖編輯器有沒有畫擋路格，牆最下排的左右兩格都擋住）
// pad：爆炸範圍外再多幾格也算炸到（牆本身有一格厚）
const BREAKABLE_WALLS = {
  tile_bg_backroom_wall02_breakable: {
    stages: ['tile_bg_backroom_wall02_dmg_crack', 'tile_bg_backroom_wall02_hole2'],
    open: [[1, 2]], solid: [[0, 2], [2, 2]],
    pad: 1,
  },
  tile_bg_backroom_wall02_secret: {   // 隱藏區版本：hide＝從 hideFrom 那格（牆上方）往外連通的區域，炸開前塗黑
    stages: ['tile_bg_backroom_wall02_dmg_crack', 'tile_bg_backroom_wall02_hole2'],
    open: [[1, 2]], solid: [[0, 2], [2, 2]],
    pad: 1,
    hide: true, hideFrom: [1, 1], hideMax: 1500,   // hideMax：隱藏區最多幾格（太大代表其實跟外面連通，就不隱藏）
  },
  // 已經裂開的牆（圖是 Back-room-wall02-damage-03）：本來就是裂痕的樣子，所以炸一次就開洞
  tile_bg_backroom_wall02_crack_breakable: {   // 純障礙物：上方區域照常看得到
    stages: ['tile_bg_backroom_wall02_hole2'],
    open: [[1, 2]], solid: [[0, 2], [2, 2]],
    pad: 1,
  },
  tile_bg_backroom_wall02_crack_secret: {      // 隱藏區版本：炸開前牆上方被圍起來的區域塗黑
    stages: ['tile_bg_backroom_wall02_hole2'],
    open: [[1, 2]], solid: [[0, 2], [2, 2]],
    pad: 1,
    hide: true, hideFrom: [1, 1], hideMax: 1500,
  },
};
const HIDDEN_REVEAL_SEC = .9;   // 炸開後黑幕淡出幾秒
let breakableWallCells = new Set();   // 這局因為「還沒炸開」而加進固定牆的格子（換地圖／重開時先還原）
let breakableWallSolid = new Set();   // 牆本身一直擋路的格子（同樣換地圖／重開時先還原）

const breakableWallSpec = s => (s && BREAKABLE_WALLS[s.id]) || null;
function breakableWallStage(s) { return (G && G.wallStage && G.wallStage.get(s)) || 0; }
// 牆上要通過的那幾格（地圖格座標）
function breakableWallOpenCells(s) {
  const spec = breakableWallSpec(s); if (!spec) return [];
  const c0 = s.c + Math.round((s.ox || 0) / CELL), r0 = s.r + Math.round((s.oy || 0) / CELL);
  return spec.open.map(([dc, dr]) => [c0 + dc, r0 + dr]);
}
// 炸開後要打通的格子：洞口那幾格，加上同一欄往上到牆頂（牆面那幾排）。
// 地圖編輯器在牆上畫了擋路格也一樣：沒炸開前擋著，炸開就拿掉（不然洞開了還是走不過去）
function breakableWallPassCells(s) {
  const r0 = s.r + Math.round((s.oy || 0) / CELL);
  return breakableWallOpenCells(s).flatMap(([c, r]) => Array.from({ length: r - r0 + 1 }, (_, i) => [c, r0 + i]));
}
// 每局開始（js/game.js 的 newGame 呼叫）：完整的牆把要炸開的那幾格先擋起來
function setupBreakableWalls() {
  for (const k of breakableWallCells) mapWalls.delete(k);
  for (const k of breakableWallSolid) mapWalls.delete(k);
  breakableWallCells = new Set(); breakableWallSolid = new Set();
  if (!G) return;
  G.wallStage = new Map();
  G.hiddenAreas = [];
  const drawn = new Set((MAP && MAP.solid) || []);   // 重開時，上一局炸開拿掉的編輯器擋路格要補回來
  for (const s of (MAP && MAP.stamps) || []) {
    const spec = breakableWallSpec(s); if (!spec) continue;
    const c0 = s.c + Math.round((s.ox || 0) / CELL), r0 = s.r + Math.round((s.oy || 0) / CELL);
    for (const [dc, dr] of spec.solid || []) {   // 牆最下排左右兩格：一直擋路
      const c = c0 + dc, r = r0 + dr, k = c + ',' + r;
      if (!inGrid(c, r) || mapWalls.has(k)) continue;
      mapWalls.add(k); breakableWallSolid.add(k);
    }
    breakableWallOpenCells(s).forEach(([c, r]) => { if (inGrid(c, r)) mapWalls.add(c + ',' + r); });   // 洞口一定擋住
    for (const [c, r] of breakableWallPassCells(s)) {   // 擋著的（含地圖編輯器畫的）都記下來，炸開時一起拿掉
      const k = c + ',' + r;
      if (inGrid(c, r) && (mapWalls.has(k) || drawn.has(k))) { mapWalls.add(k); breakableWallCells.add(k); }
    }
  }
  G.hiddenAreas.push(...secretLayerAreas());   // 地圖編輯器設成「🧱 隱藏區」的圖層：已經綁好牆的，就不用再自己找範圍
  const linked = new Set(G.hiddenAreas.map(a => a.stamp));
  for (const s of (MAP && MAP.stamps) || []) {   // 牆都擋好之後，再算隱藏區（才不會從洞漏出去）
    const spec = breakableWallSpec(s);
    if (spec && spec.hide && !linked.has(s)) { const area = hiddenAreaOf(s, spec); if (area) G.hiddenAreas.push(area); }
  }
}
// 隱藏區圖層（地圖編輯器的圖層按「🧱 隱藏區」，存在 MAP.layerOrder 那一層的 secret: true）：
// 這些圖層上有東西的格子，在炸開「最近的那面可炸開牆」之前全部塗黑（跟 hiddenAreaOf 一樣當成地圖外的空白區）。
// 連在一起的一塊算一區，各自綁離它最近的牆；牆本身的圖片範圍不塗黑（牆要看得到）
function secretLayerAreas() {
  const ids = new Set(((MAP && MAP.layerOrder) || []).filter(l => l && l.secret).map(l => l.id));
  if (!ids.size) return [];
  const cells = new Set(), add = (c, r) => { if (inGrid(c, r)) cells.add(c + ',' + r); };
  for (const lid of ids) for (const key in (MAP.layers && MAP.layers[lid]) || {}) add(...key.split(',').map(Number));
  for (const s of MAP.stamps || []) {
    if (!ids.has(s.layer || 'top')) continue;
    const t = mapTileById(s.id); if (!t) continue;
    const x0 = s.c * CELL + (s.ox || 0), y0 = s.r * CELL + (s.oy || 0), x1 = x0 + mapStampW(s, t) * CELL, y1 = y0 + mapStampH(s, t) * CELL;
    for (let c = Math.floor(x0 / CELL); c < Math.ceil(x1 / CELL); c++) for (let r = Math.floor(y0 / CELL); r < Math.ceil(y1 / CELL); r++) add(c, r);
  }
  const walls = [];
  for (const s of MAP.stamps || []) {
    if (!breakableWallSpec(s)) continue;
    const t = mapTileById(s.id); if (!t) continue;
    const c0 = s.c + Math.round((s.ox || 0) / CELL), r0 = s.r + Math.round((s.oy || 0) / CELL), w = mapStampW(s, t), h = mapStampH(s, t);
    for (let c = c0; c < c0 + w; c++) for (let r = r0; r < r0 + h; r++) cells.delete(c + ',' + r);
    walls.push({ s, cells: breakableWallOpenCells(s) });
  }
  const areas = [], seen = new Set();
  for (const k0 of cells) {
    if (seen.has(k0)) continue;
    const part = new Set([k0]), q = [k0]; seen.add(k0);
    for (let i = 0; i < q.length; i++) {
      const [c, r] = q[i].split(',').map(Number);
      for (let dc = -1; dc <= 1; dc++) for (let dr = -1; dr <= 1; dr++) {
        const k = (c + dc) + ',' + (r + dr);
        if (cells.has(k) && !seen.has(k)) { seen.add(k); part.add(k); q.push(k); }
      }
    }
    let best = null, bestD = Infinity;
    for (const w of walls) for (const [wc, wr] of w.cells) for (const k of part) {
      const [c, r] = k.split(',').map(Number), d = Math.hypot(c - wc, r - wr);
      if (d < bestD) { bestD = d; best = w.s; }
    }
    if (!best) { console.warn('隱藏區圖層附近沒有可炸開的牆，照常顯示', [...part][0]); continue; }
    areas.push({ stamp: best, cells: part, revealAt: 0 });
  }
  return areas;
}
// 接續「保留進度」的戰場（js/combat-progress.js 的 restoreCombatProgress，這時不會跑 newGame）：
// 牆格整組換成存起來的那份，但「哪些格是可炸牆加的」沒存，炸開時就刪不掉（洞炸開了還是走不過去）。
// 照地圖資料重新認一次：還沒炸開的牆上、地圖本來沒畫擋路格、現在卻是牆的格子，就是可炸牆加的
function restoreBreakableWalls() {
  breakableWallCells = new Set(); breakableWallSolid = new Set();
  if (!G || !MAP) return;
  if (!(G.wallStage instanceof Map)) G.wallStage = new Map();
  if (!G.hiddenAreas) G.hiddenAreas = [];
  const drawn = new Set(MAP.solid || []);
  const added = (c, r) => { const k = c + ',' + r; return inGrid(c, r) && mapWalls.has(k) && !drawn.has(k) ? k : null; };
  for (const s of MAP.stamps || []) {
    const spec = breakableWallSpec(s); if (!spec) continue;
    const c0 = s.c + Math.round((s.ox || 0) / CELL), r0 = s.r + Math.round((s.oy || 0) / CELL);
    for (const [dc, dr] of spec.solid || []) { const k = added(c0 + dc, r0 + dr); if (k) breakableWallSolid.add(k); }
    if (breakableWallStage(s) >= spec.stages.length) continue;   // 已經炸開了
    for (const [c, r] of breakableWallPassCells(s)) { const k = c + ',' + r; if (inGrid(c, r) && mapWalls.has(k)) breakableWallCells.add(k); }
  }
}
// 隱藏區：從牆上方那格往外，沿著沒有牆的格子連過去的整片區域（不含牆本身的圖片範圍，牆要看得到）
function hiddenAreaOf(s, spec) {
  const t = mapTileById(s.id); if (!t) return null;
  const c0 = s.c + Math.round((s.ox || 0) / CELL), r0 = s.r + Math.round((s.oy || 0) / CELL);
  const w = mapStampW(s, t), h = mapStampH(s, t);
  const inWall = (c, r) => c >= c0 && c < c0 + w && r >= r0 && r < r0 + h;
  // 門（js/doors.js）當成通的：房間有門可以進去就不是隱藏區，不然玩家開門會看到一片黑
  const doorCells = new Set(typeof mapDoors !== 'undefined' ? mapDoors.flatMap(d => d.cells || []) : []);
  const blocked = (c, r) => isWall(c, r) && !doorCells.has(c + ',' + r);
  const start = [c0 + spec.hideFrom[0], r0 + spec.hideFrom[1]];
  const cells = new Set(), q = [start];
  const startKey = start.join(',');
  if (!inGrid(...start) || isWall(...start)) return null;
  cells.add(startKey);
  for (let i = 0; i < q.length; i++) {
    const [c, r] = q[i];
    if (isCamp(c, r)) { console.warn('隱藏區跟營地連通，不隱藏', s); return null; }
    if (cells.size > (spec.hideMax || 1500)) { console.warn('隱藏區太大（可能跟外面連通），不隱藏', s); return null; }
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nc = c + dc, nr = r + dr, k = nc + ',' + nr;
      if (!inGrid(nc, nr) || cells.has(k) || blocked(nc, nr) || (inWall(nc, nr) && nr >= r0 + spec.hideFrom[1])) continue;
      cells.add(k); q.push([nc, nr]);
    }
  }
  // 只塗黑牆「上緣以上」的格子：牆本身、旁邊接著的牆面都要看得到
  for (const k of [...cells]) { const [c, r] = k.split(',').map(Number); if (r >= r0) cells.delete(k); }
  // 隱藏區旁邊一圈的牆也塗黑，邊界才不會露出裡面的牆面
  const edge = new Set();
  for (const k of cells) { const [c, r] = k.split(',').map(Number); for (let dc = -1; dc <= 1; dc++) for (let dr = -1; dr <= 1; dr++) { const nk = (c + dc) + ',' + (r + dr); if (!cells.has(nk) && r + dr < r0 && inGrid(c + dc, r + dr) && isWall(c + dc, r + dr)) edge.add(nk); } }
  for (const k of edge) cells.add(k);
  return { stamp: s, cells, revealAt: 0 };
}
// 隱藏區：畫面上當成「地圖不存在的地方」——地圖、物件、角色畫完之後、蓋黑幕之前，直接塗成純黑
// （跟地圖外圍的空白區一樣），黑幕和光暈照常疊在上面，所以看不出邊框，也不會露出裡面的東西。
// js/render.js 在 drawDarkness 之前呼叫；炸開後慢慢淡出
function drawHiddenAreas(ctx) {
  if (!G || !G.hiddenAreas || !G.hiddenAreas.length) return;
  const now = performance.now() / 1000;
  for (const a of G.hiddenAreas) {
    let alpha = 1;
    if (a.revealAt) { alpha = 1 - (now - a.revealAt) / HIDDEN_REVEAL_SEC; if (alpha <= 0) continue; }
    ctx.save(); ctx.fillStyle = 'rgba(0,0,0,' + alpha + ')'; ctx.beginPath();
    for (const k of a.cells) { const [c, r] = k.split(',').map(Number); ctx.rect(OX + c * CELL - .5, OY + r * CELL - .5, CELL + 1, CELL + 1); }
    ctx.fill(); ctx.restore();
  }
}
// 某一點是不是在還沒打開的隱藏區裡（畫面上的提示、怪物顯示可以參考）
function inHiddenArea(x, y) {
  if (!G || !G.hiddenAreas) return false;
  const [c, r] = cellAt(x, y), k = c + ',' + r;
  return G.hiddenAreas.some(a => !a.revealAt && a.cells.has(k));
}
// 畫圖時：依照目前被炸到第幾階段換圖（js/maploader.js 的 drawMapStampImg 呼叫）
function breakableWallDisplayTile(s, t) {
  const spec = breakableWallSpec(s), stage = spec ? breakableWallStage(s) : 0;
  if (!stage) return t;
  return mapTileById(spec.stages[Math.min(stage, spec.stages.length) - 1]) || t;
}
// 爆炸（x, y, 半徑 R 像素）：範圍內的可炸開牆往下一個階段
function blastWalls(x, y, R) {
  if (!G || !MAP) return;
  for (const s of MAP.stamps || []) {
    const spec = breakableWallSpec(s); if (!spec) continue;
    const stage = breakableWallStage(s); if (stage >= spec.stages.length) continue;   // 已經炸開了
    const cells = breakableWallOpenCells(s);
    if (!cells.some(([c, r]) => { const [cx, cy] = center(c, r); return Math.hypot(cx - x, cy - y) <= R + (spec.pad ?? 1) * CELL; })) continue;
    const next = stage + 1;
    G.wallStage.set(s, next);
    const [hx, hy] = center(...cells[0]);
    if (next >= spec.stages.length) {   // 炸開：那幾格變成可以通過
      for (const [c, r] of breakableWallPassCells(s)) { const k = c + ',' + r; if (breakableWallCells.has(k)) { mapWalls.delete(k); breakableWallCells.delete(k); } }
      if (typeof computeFlow === 'function') computeFlow();
      for (const a of [...(G.towers || []), ...(G.npcs || [])]) { a.navPath = null; a.navGoal = null; a.navFailed = false; }
      for (const e of G.enemies || []) if (typeof resetEnemyNavigation === 'function') resetEnemyNavigation(e);
      wallRubble(hx, hy, 18);
      for (const a of G.hiddenAreas || []) if (a.stamp === s && !a.revealAt) a.revealAt = performance.now() / 1000;   // 隱藏區：黑幕開始淡出
    } else wallRubble(hx, hy, 7);   // 裂開：少量碎屑
  }
}
// 碎石＋煙塵
function wallRubble(x, y, n) {
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (Math.random() - .5) * 2.6, sp = 40 + Math.random() * 90, life = .5 + Math.random() * .4;
    G.effects.push({ dust: true, x: x + (Math.random() - .5) * 30, y: y - Math.random() * 30, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * .6, r: 2.5 + Math.random() * 3.5, life, life0: life });
  }
}

// 可炸開的牆：最下排整排都擋住（中間那格也擋），燈光照不到牆面上半部，會黑一塊。
// 這裡讓牆面上半部的亮度跟著同一欄最下排的牆一起（燈照得到牆腳，整面牆就是亮的）；js/lighting.js 算完光之後呼叫
function lightBreakableWallFaces(fields) {
  if (!MAP || !MAP.stamps) return;
  for (const s of MAP.stamps) {
    if (!breakableWallSpec(s)) continue;
    const t = mapTileById(s.id); if (!t) continue;
    const c0 = s.c + Math.round((s.ox || 0) / CELL), r0 = s.r + Math.round((s.oy || 0) / CELL), w = mapStampW(s, t), h = mapStampH(s, t);
    for (let dc = 0; dc < w; dc++) {
      const c = c0 + dc, rb = r0 + h - 1; if (!inGrid(c, rb)) continue;
      const bi = rb * COLS + c;
      for (const f of fields) {
        let v = f[bi];
        if (dc > 0 && inGrid(c - 1, rb)) v = Math.max(v, f[bi - 1] * .9);   // 中間那格：旁邊的牆腳亮就跟著亮
        if (dc < w - 1 && inGrid(c + 1, rb)) v = Math.max(v, f[bi + 1] * .9);
        f[bi] = Math.max(f[bi], v);
        for (let r = r0; r < rb; r++) if (inGrid(c, r)) { const i = r * COLS + c; f[i] = Math.max(f[i], v); }
      }
    }
  }
}
