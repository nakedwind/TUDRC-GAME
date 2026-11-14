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
// 2 樓碰撞（地圖編輯器的「🚧 2樓碰撞」筆刷，存在 MAP.solid2）：只擋 2 樓的人，1 樓照常走。
// 1 樓的紅格（MAP.solid）跟它分開，只擋 1 樓
let floor2Solid = new Set();
// 2 樓的人還會被「2 樓的物件加的牆」擋住（置物箱、候車椅、門…這些程式都是把擋路格加進一樓的牆 mapWalls）：js/maploader.js 的 objectWallOn2F
const deckBlocked = k => floor2Solid.has(k) || (mapWalls.has(k) && typeof objectWallOn2F === 'function' && objectWallOn2F(k));
function setMapFloors(deck, ramps, solid2) {
  deckCells = new Set(deck || []); floor2Solid = new Set(solid2 || []); rampCells = new Set(ramps || []); computeRampUpper(); hasFloors = deckCells.size > 0 && rampCells.size > 0; floorCtx = 1; floorOnRamp = false; floorOnDeck = false;
}
function wallOnFloor(f, c, r) {
  const k = c + ',' + r;
  if (rampCells.has(k)) return mapWalls.has(k);
  if (f !== 2) return mapWalls.has(k);
  return !deckCells.has(k) || deckBlocked(k);
}
// 站在樓層出入口上的人，走出去的格子照「走出去之後在哪一層」判斷：走到 2 樓地面不管一樓有沒有牆都走得過去，走到一般格子照一樓的牆
let floorOnRamp = false, floorOnDeck = false;
function wallNow(c, r) {
  const k = c + ',' + r;
  if (rampCells.has(k)) return mapWalls.has(k) || (floorCtx !== 2 && !floorOnRamp && floorOnDeck);   // 一樓的人站在 2 樓地面的格子上：不能從這邊走進手扶梯（只能從一樓那頭上去）
  if (floorOnRamp) return deckCells.has(k) ? deckBlocked(k) : mapWalls.has(k);
  return floorCtx === 2 ? !deckCells.has(k) || deckBlocked(k) : mapWalls.has(k);
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
  // 人面蝶在空中飛、不走手扶梯：牠正下方是 2 樓地面就算 2 樓，不是就算 1 樓（飛過樓層出入口時維持原本那層）。
  // 不然牠飛到 2 樓上空還是被當成一樓的怪，2 樓的人看得到卻打不到
  // 在 2 樓邊緣一格以內飛來飛去時維持原本那層：在 2 樓邊上打得到牠，不會一飛出邊緣就變成一樓的怪（從一樓飛進 2 樓邊緣也一樣）
  if (a.behavior === 'moth') {
    if (!rampCells.has(k)) {
      const [c, r] = cellAt(a.x, a.y), on = deckCells.has(k);
      let edge = false;   // 旁邊一格內有「另一種」格子（在 2 樓地面上：旁邊有不是 2 樓的；不在：旁邊有 2 樓地面）＝在邊緣
      for (let dc = -1; dc <= 1 && !edge; dc++) for (let dr = -1; dr <= 1; dr++) if (deckCells.has((c + dc) + ',' + (r + dr)) !== on) { edge = true; break; }
      if (!edge || a.floor == null) a.floor = on ? 2 : 1;   // 在邊緣：維持原本那層
    }
    a._fk = k; return;
  }
  if (a.floor == null) a.floor = spawnFloorAt(...cellAt(a.x, a.y));   // 剛生出來就站在陸橋上（一樓是牆、或只有 2 樓的地方）：算 2 樓
  // 站在「只有 2 樓、沒有 1 樓」的格子上（js/maploader.js 的 floor2OnlyCells）：一定是 2 樓的人。
  // 從別張地圖的出入口走進來、一開局就站在 2 樓的人沒有經過樓層出入口，以前會被當成一樓：2 樓的物件、2 樓碰撞都擋不到他，放的燈也算一樓
  if (a.floor !== 2 && typeof floor2OnlyCells === 'function' && MAP && floor2OnlyCells().has(k)) a.floor = 2;
  if (a._fk !== k) {
    if (a._fk && rampCells.has(a._fk) && !rampCells.has(k)) a.floor = deckCells.has(k) ? 2 : 1;
    a._fk = k;
  }
}
const actorFloor = a => (hasFloors && a && a.floor) || 1;
// 剛出現在這一格的東西算幾樓：2 樓地面底下是一樓的牆，或是「只有 2 樓、沒有 1 樓」的地方（js/maploader.js 的 floor2OnlyCells）＝2 樓；
// 其他（陸橋底下、一般地面）＝1 樓
function spawnFloorAt(c, r) {
  if (!hasFloors) return 1;
  const k = c + ',' + r;
  if (!deckCells.has(k) || rampCells.has(k)) return 1;
  return mapWalls.has(k) || (typeof floor2OnlyCells === 'function' && MAP && floor2OnlyCells().has(k)) ? 2 : 1;
}
// 怪物出生、核心擺放用：照那一格「出現後會在幾樓」判斷是不是牆（2 樓的地方看 2 樓碰撞，不是一律看一樓的牆）
const spawnWallAt = (c, r) => hasFloors ? wallOnFloor(spawnFloorAt(c, r), c, r) : mapWalls.has(c + ',' + r);
// 飛行中的東西（照明彈、特殊彈、珍珠、帽子、水柱…）不屬於任何角色：處理它之前用這個設成「它發射時在幾樓」，
// 牆、建築都照那一層判斷（算完一樣用 clearFloorCtx 還原）
function setFloorCtxTo(f) { floorCtx = hasFloors && f === 2 ? 2 : 1; floorOnRamp = false; floorOnDeck = false; }
// 飛行物、爆炸碰不碰得到這個人：不同樓層互相碰不到（沒有陸橋的地圖一律碰得到）
const onFloor = (f, a) => !hasFloors || (f === 2 ? 2 : 1) === actorFloor(a);
// 爆炸、火海、地雷、鱗粉霧：這次發生在幾樓（0＝不知道，照舊不分樓層）。引爆的地方用 withBlastFloor 包起來，
// 裡面的傷害、連鎖引爆、新起的火海都只算同一層（橋上的爆炸炸不到橋下的人，反過來也一樣）
let blastFloor = 0;
function withBlastFloor(f, fn) {
  const keep = blastFloor; blastFloor = hasFloors && f ? (f === 2 ? 2 : 1) : 0;
  try { return fn(); } finally { blastFloor = keep; }
}
// 這個人／東西（怪物、隊員、溫特、建築、核心…有 floor 的都可以）會不會被這次爆炸波及
const blastHits = a => !blastFloor || actorFloor(a) === blastFloor;
// 火海、油汙、霧這類留在地上的東西：記下的 floor 跟這個人同一層才碰得到（沒記＝不分樓層）
const fieldHits = (f, a) => !hasFloors || !f || f === actorFloor(a);
// 地上特效（礦物碎片、焦痕、照明棒、地雷、油汙、火海）分樓層畫：js/render.js 在陸橋上補畫時設成 2，
// 這時候記著是 1 樓的東西就跳過（不然橋下的碎片、焦痕會跑到橋面上）；沒記樓層的照舊畫
let groundFxPass = 0;
const fxSkip = f => !!(groundFxPass && f && f !== groundFxPass);
// 畫面前後：二樓的人、二樓的圖都加上這個大數字，排在所有一樓的東西後面畫（蓋在一樓的人上面）
const FLOOR2_SORT = 100000, floorSortY = a => hasFloors && a && (a.floor === 2 || rampUpperCells.has(cellAt(a.x, a.y).join(',')) || (typeof inStairUpper === 'function' && inStairUpper(a.x, a.y))) ? FLOOR2_SORT : 0;
// 畫面上看起來在幾樓：真的在 2 樓，或站在樓梯／手扶梯靠 2 樓的那一半 → 2。蓋建築、身上的燈用這個
// 地上的東西（掉落物、屍體、核心、帽子…）：產生時記下的 floor＝2 就排到 2 樓那一批畫（陸橋上的不會被橋面蓋住）
const looseSortY = o => hasFloors && o && o.floor === 2 ? FLOOR2_SORT : 0;
const visualFloor = a => floorSortY(a) ? 2 : 1;
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
