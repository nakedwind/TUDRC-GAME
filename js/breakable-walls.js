/* ===== 可以炸開的牆 =====
   地圖編輯器放「後室牆面（可炸開）」：平時看起來是完整的牆，中間那格擋路。
   被爆炸波及（地雷、瓦斯爐、油桶、油箱、自爆史萊姆、希奧妮大招）：
     第 1 次 → 出現裂痕（stages[0] 的圖）
     第 2 次 → 炸出破洞（stages[1] 的圖），open 那幾格變成可以走過去
   只在這一局有效，重新開始就恢復完整的牆。
   「後室牆面（可炸開・隱藏區）」：一樣可以炸開，而且牆另一邊（上方）跟它連通的整片區域平常全黑，
   炸開之後才慢慢顯現（隱藏的通道／房間）。
   「後室牆面（裂縫・可炸開）」「後室牆面（裂縫・可炸開・隱藏區）」（Back-room-wall02-damage-03 的圖）：已經裂開，炸一次就開。
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
// 每局開始（js/game.js 的 newGame 呼叫）：完整的牆把要炸開的那幾格先擋起來
function setupBreakableWalls() {
  for (const k of breakableWallCells) mapWalls.delete(k);
  for (const k of breakableWallSolid) mapWalls.delete(k);
  breakableWallCells = new Set(); breakableWallSolid = new Set();
  if (!G) return;
  G.wallStage = new Map();
  G.hiddenAreas = [];
  for (const s of (MAP && MAP.stamps) || []) {
    const spec = breakableWallSpec(s); if (!spec) continue;
    const c0 = s.c + Math.round((s.ox || 0) / CELL), r0 = s.r + Math.round((s.oy || 0) / CELL);
    for (const [dc, dr] of spec.solid || []) {   // 牆最下排左右兩格：一直擋路
      const c = c0 + dc, r = r0 + dr, k = c + ',' + r;
      if (!inGrid(c, r) || mapWalls.has(k)) continue;
      mapWalls.add(k); breakableWallSolid.add(k);
    }
    for (const [c, r] of breakableWallOpenCells(s)) {
      const k = c + ',' + r;
      if (!inGrid(c, r) || mapWalls.has(k)) continue;
      mapWalls.add(k); breakableWallCells.add(k);
    }
  }
  for (const s of (MAP && MAP.stamps) || []) {   // 牆都擋好之後，再算隱藏區（才不會從洞漏出去）
    const spec = breakableWallSpec(s);
    if (spec && spec.hide) { const area = hiddenAreaOf(s, spec); if (area) G.hiddenAreas.push(area); }
  }
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
    for (const [c, r] of breakableWallOpenCells(s)) { const k = added(c, r); if (k) breakableWallCells.add(k); }
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
      for (const [c, r] of cells) { const k = c + ',' + r; if (breakableWallCells.has(k)) { mapWalls.delete(k); breakableWallCells.delete(k); } }
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
