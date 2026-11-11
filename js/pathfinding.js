/* ===== 固定牆與怪物尋路 =====
   固定牆 = 編輯地圖時放的、打不破的牆；怪物會自動繞過它。
   流場(flow) = 每一格「距離營地最短要走幾步」的地圖，怪物照著往數字小的方向走。
*/

// ---- 固定牆（地圖設計，跨局保留）----
let mapWalls = new Set();               // 存 'c,r' 字串
// ---- 樓層（陸橋）：地圖編輯器「🌉 2樓地面」「🛗 樓層出入口」畫的格子（MAP.deck、MAP.ramps）----
// 一樓＝平常的樣子（牆照 mapWalls 擋）。二樓＝只有「2樓地面」和「樓層出入口」的格子走得到，其他全是空的（掉下去的地方，走不進去）；
//   2 樓地面底下的牆（一樓的柱子、牆）不擋二樓的人；樓層出入口（手扶梯）不管幾樓都照 mapWalls 擋（扶手、隔板）。
// 換樓層：從「樓層出入口」走出去的那一步決定——走到 2 樓地面＝2 樓，走到其他格子＝1 樓。沒畫 2 樓地面的地圖完全不受影響。
// floorCtx＝現在在處理哪一層的人：game.js 的 update 處理每個角色前先設好（isWall、flowAt、邊緣碰撞都看它）。
let deckCells = new Set(), rampCells = new Set(), hasFloors = false, floorCtx = 1;
// 樓層出入口（樓梯、手扶梯）靠 2 樓那一半的格子：站在上面的人雖然還算一樓，畫面上先畫到 2 樓那一批（不會被 2 樓地板的圖蓋住）
let rampUpperCells = new Set();
function computeRampUpper() {
  rampUpperCells = new Set();
  const N = [[0, 1], [0, -1], [1, 0], [-1, 0]], dist = test => {   // 在樓層出入口的格子之間，離「符合 test 的鄰格」幾步
    const d = new Map(), q = [];
    for (const k of rampCells) { const [c, r] = k.split(',').map(Number); if (N.some(([dc, dr]) => { const n = (c + dc) + ',' + (r + dr); return !rampCells.has(n) && test(n); })) { d.set(k, 0); q.push(k); } }
    for (let h = 0; h < q.length; h++) { const [c, r] = q[h].split(',').map(Number); for (const [dc, dr] of N) { const n = (c + dc) + ',' + (r + dr); if (rampCells.has(n) && !d.has(n)) { d.set(n, d.get(q[h]) + 1); q.push(n); } } }
    return d;
  };
  const up = dist(n => deckCells.has(n)), down = dist(n => !deckCells.has(n) && !mapWalls.has(n));
  for (const k of rampCells) if ((up.get(k) ?? Infinity) <= (down.get(k) ?? Infinity)) rampUpperCells.add(k);
}
function setMapFloors(deck, ramps) {
  deckCells = new Set(deck || []); rampCells = new Set(ramps || []); computeRampUpper(); hasFloors = deckCells.size > 0 && rampCells.size > 0; floorCtx = 1; floorOnRamp = false; floorOnDeck = false;
}
function wallOnFloor(f, c, r) {
  const k = c + ',' + r;
  if (rampCells.has(k)) return mapWalls.has(k);
  if (f !== 2) return mapWalls.has(k);
  return !deckCells.has(k);
}
// 站在樓層出入口上的人，走出去的格子照「走出去之後在哪一層」判斷：走到 2 樓地面不管一樓有沒有牆都走得過去，走到一般格子照一樓的牆
let floorOnRamp = false, floorOnDeck = false;
function wallNow(c, r) {
  const k = c + ',' + r;
  if (rampCells.has(k)) return mapWalls.has(k) || (floorCtx !== 2 && !floorOnRamp && floorOnDeck);   // 一樓的人站在 2 樓地面的格子上：不能從這邊走進手扶梯（只能從一樓那頭上去）
  if (floorOnRamp) return deckCells.has(k) ? false : mapWalls.has(k);
  return floorCtx === 2 ? !deckCells.has(k) : mapWalls.has(k);
}
const isWall = (c, r) => hasFloors ? wallNow(c, r) : mapWalls.has(c + ',' + r);
// 處理某個角色之前先呼叫：設好「他在幾樓、是不是站在樓層出入口上」（算完用 clearFloorCtx 還原）
function setFloorCtx(a) {
  floorCtx = actorFloor(a);
  const k = hasFloors && a ? cellAt(a.x, a.y).join(',') : '';
  floorOnRamp = !!(k && rampCells.has(k));
  floorOnDeck = !!(k && deckCells.has(k) && !floorOnRamp);
}
function clearFloorCtx() { floorCtx = 1; floorOnRamp = false; floorOnDeck = false; }
// 角色走出「樓層出入口」時換樓層（每幀、每個角色呼叫一次；a._fk＝上一幀站的格子）
function updateActorFloor(a) {
  if (!hasFloors || !a) return;
  const k = cellAt(a.x, a.y).join(',');
  if (a.floor == null) a.floor = (mapWalls.has(k) && deckCells.has(k) && !rampCells.has(k)) ? 2 : 1;   // 剛生出來就站在陸橋上（一樓是牆）：算 2 樓
  if (a._fk !== k) {
    if (a._fk && rampCells.has(a._fk) && !rampCells.has(k)) a.floor = deckCells.has(k) ? 2 : 1;
    a._fk = k;
  }
}
const actorFloor = a => (hasFloors && a && a.floor) || 1;
// 畫面前後：二樓的人、二樓的圖都加上這個大數字，排在所有一樓的東西後面畫（蓋在一樓的人上面）
const FLOOR2_SORT = 100000, floorSortY = a => hasFloors && a && (a.floor === 2 || rampUpperCells.has(cellAt(a.x, a.y).join(',')) || (typeof inStairUpper === 'function' && inStairUpper(a.x, a.y))) ? FLOOR2_SORT : 0;
const sameFloor = (a, b) => actorFloor(a) === actorFloor(b);

// ---- 邊緣碰撞（地圖編輯器「📏 邊緣碰撞」畫的薄牆）----
// 只擋「跨過格線」，兩邊的格子都照常可以走（例如高台邊緣、階梯兩側）。
// 資料：MAP.edges = ['c,r,R'（第 c 欄 r 列那格的右邊）, 'c,r,B'（那格的下邊）…]
// 不擋子彈、視線、光，只擋走路：溫特、隊員、怪物的碰撞和尋路都認得。
// 微調：MAP.edgeOffsets = { 'c,r,R': [dx, dy] }＝這條線整段平移幾像素（地圖編輯器「🎯 碰撞微調」，最多半格）
const EDGE_WALL = { half: 5 };   // 薄牆的厚度一半（像素）：角色身體離線這麼近就算撞到
let edgeSetMap = null, edgeSet = new Set(), edgeSegs = [];
// 程式動態加的薄牆（停靠的捷運列車，js/mrt-train.js）：不存進地圖資料，換了就重建
let edgeExtra = new Set(), edgeExtraVer = 0, edgeBuiltVer = -1;
function setExtraEdges(set) { edgeExtra = set; edgeExtraVer++; }
function mapEdgeSet() {   // 跟著目前的地圖重建（換地圖、從劇情地圖回到暫停的戰場都會自動對上）
  const m = typeof MAP !== 'undefined' ? MAP : null;
  if (edgeSetMap !== m || edgeBuiltVer !== edgeExtraVer) {
    edgeSetMap = m; edgeBuiltVer = edgeExtraVer; edgeSet = new Set([...((m && m.edges) || []), ...edgeExtra]);
    const offs = (m && m.edgeOffsets) || {};
    // 每條線換算成地圖上的線段（相對 OX、OY）：直線 x 固定、從 y0 到 y1；橫線 y 固定、從 x0 到 x1
    edgeSegs = [...edgeSet].map(k => {
      const [c, r, axis] = k.split(','), [dx, dy] = offs[k] || [0, 0];
      return axis === 'R' ? { v: true, x: (+c + 1) * CELL + dx, a: +r * CELL + dy, b: (+r + 1) * CELL + dy }
        : { v: false, y: (+r + 1) * CELL + dy, a: +c * CELL + dx, b: (+c + 1) * CELL + dx };
    });
  }
  return edgeSet;
}
// 相鄰兩格之間有沒有薄牆（尋路用；斜走不算）
function edgeBetween(c, r, nc, nr) {
  const E = mapEdgeSet(); if (!E.size || floorCtx === 2) return false;   // 薄牆只擋一樓
  if (nr === r && nc === c + 1) return E.has(c + ',' + r + ',R');
  if (nr === r && nc === c - 1) return E.has(nc + ',' + r + ',R');
  if (nc === c && nr === r + 1) return E.has(c + ',' + r + ',B');
  if (nc === c && nr === r - 1) return E.has(c + ',' + nr + ',B');
  return false;
}
// 這個點有沒有碰到薄牆（線的兩側各 EDGE_WALL.half 像素；兩端也多延伸一點，轉角接得起來）
// 一張地圖的薄牆通常只有幾十條，直接每條檢查
function edgeWallBlocksPoint(x, y) {
  const E = mapEdgeSet(); if (!E.size || floorCtx === 2) return false;
  const lx = x - OX, ly = y - OY, H = EDGE_WALL.half;
  for (const s of edgeSegs) {
    if (s.v ? (Math.abs(lx - s.x) <= H && ly >= s.a - H && ly <= s.b + H)
            : (Math.abs(ly - s.y) <= H && lx >= s.a - H && lx <= s.b + H)) return true;
  }
  return false;
}
// 身體（半徑 r 的方塊）從 (x0,y0) 直直移到 (x1,y1) 會不會穿過薄牆：一次走很遠（衝刺、卡頓）也不會直接跳過去
// 只處理水平或垂直的移動（溫特的移動是 x、y 分開判斷）
function edgeWallCrossed(x0, y0, x1, y1, r) {
  const E = mapEdgeSet(); if (!E.size || floorCtx === 2) return false;
  const passes = (line, a, b) => a < b ? line > a && line <= b : line < a && line >= b;   // 身體前緣從 a 移到 b，有沒有越過 line
  const lx0 = x0 - OX, ly0 = y0 - OY, lx1 = x1 - OX, ly1 = y1 - OY;
  for (const s of edgeSegs) {
    if (s.v && lx1 !== lx0) {
      const k = Math.sign(lx1 - lx0);
      if (ly0 + r > s.a && ly0 - r < s.b && passes(s.x, lx0 + k * r, lx1 + k * r)) return true;
    } else if (!s.v && ly1 !== ly0) {
      const k = Math.sign(ly1 - ly0);
      if (lx0 + r > s.a && lx0 - r < s.b && passes(s.y, ly0 + k * r, ly1 + k * r)) return true;
    }
  }
  return false;
}

// ---- 營地（怪物的目標格）；空的話預設為最下面一排 ----
let campCells = new Set();
const isCamp = (c, r) => campCells.size ? campCells.has(c + ',' + r) : (r === ROWS - 1);

// ---- 流場（每格到營地的最短步數，會繞過固定牆）----
let flow = [], flow2 = [];   // flow2＝二樓的人用的（有陸橋的地圖才有）
function computeFlow() {
  const keepCtx = floorCtx, keepRamp = floorOnRamp, keepDeck = floorOnDeck; floorCtx = 1; floorOnRamp = false; floorOnDeck = false;   // 算一樓的薄牆要用一樓的規則
  flow = new Array(COLS * ROWS).fill(Infinity);
  flow2 = hasFloors ? new Array(COLS * ROWS).fill(Infinity) : [];
  const q = [];   // [樓層, c, r]：營地在一樓；二樓的人要先走到樓層出入口、下到一樓才到得了
  const arr = f => f === 2 ? flow2 : flow;
  const seed = (c, r) => { if (inGrid(c, r) && !wallOnFloor(1, c, r) && flow[r * COLS + c] > 1) { flow[r * COLS + c] = 1; q.push([1, c, r]); } };
  if (campCells.size) campCells.forEach(k => { const [c, r] = k.split(',').map(Number); seed(c, r); });
  else for (let c = 0; c < COLS; c++) seed(c, ROWS - 1);
  // 從 (f, c, r) 走一步到 (nc, nr) 會落在哪一層（出樓層出入口那一步才換層）
  const landing = (f, c, r, nc, nr) => rampCells.has(c + ',' + r) && !rampCells.has(nc + ',' + nr) ? (deckCells.has(nc + ',' + nr) ? 2 : 1) : f;
  let head = 0;
  while (head < q.length) {
    const [f, c, r] = q[head++]; const d = arr(f)[r * COLS + c];
    // 倒著找：哪些 (pf, pc, pr) 走一步會到這裡
    for (const [dc, dr] of [[0, 1], [0, -1], [-1, 0], [1, 0]]) {
      const pc = c + dc, pr = r + dr;
      if (!inGrid(pc, pr)) continue;
      for (const pf of hasFloors ? [1, 2] : [1]) {
        if (wallOnFloor(pf, pc, pr) || landing(pf, pc, pr, c, r) !== f) continue;
        if (pf !== 2 && edgeBetween(pc, pr, c, r)) continue;   // 薄牆只擋一樓
        if (pf !== 2 && deckCells.has(pc + ',' + pr) && rampCells.has(c + ',' + r) && !rampCells.has(pc + ',' + pr)) continue;   // 一樓的人不能從 2 樓地面那側走進手扶梯
        const A = arr(pf);
        if (A[pr * COLS + pc] > d + 1) { A[pr * COLS + pc] = d + 1; q.push([pf, pc, pr]); }
      }
    }
  }
  floorCtx = keepCtx; floorOnRamp = keepRamp; floorOnDeck = keepDeck;
}
const flowAt = (c, r) => inGrid(c, r) ? (floorCtx === 2 ? flow2 : flow)[r * COLS + c] : Infinity;
