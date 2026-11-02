/* ===== 固定牆與怪物尋路 =====
   固定牆 = 編輯地圖時放的、打不破的牆；怪物會自動繞過它。
   流場(flow) = 每一格「距離營地最短要走幾步」的地圖，怪物照著往數字小的方向走。
*/

// ---- 固定牆（地圖設計，跨局保留）----
let mapWalls = new Set();               // 存 'c,r' 字串
const isWall = (c, r) => mapWalls.has(c + ',' + r);

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
  const E = mapEdgeSet(); if (!E.size) return false;
  if (nr === r && nc === c + 1) return E.has(c + ',' + r + ',R');
  if (nr === r && nc === c - 1) return E.has(nc + ',' + r + ',R');
  if (nc === c && nr === r + 1) return E.has(c + ',' + r + ',B');
  if (nc === c && nr === r - 1) return E.has(c + ',' + nr + ',B');
  return false;
}
// 這個點有沒有碰到薄牆（線的兩側各 EDGE_WALL.half 像素；兩端也多延伸一點，轉角接得起來）
// 一張地圖的薄牆通常只有幾十條，直接每條檢查
function edgeWallBlocksPoint(x, y) {
  const E = mapEdgeSet(); if (!E.size) return false;
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
  const E = mapEdgeSet(); if (!E.size) return false;
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
let flow = [];
function computeFlow() {
  flow = new Array(COLS * ROWS).fill(Infinity);
  const q = [];
  const seed = (c, r) => { if (inGrid(c, r) && !isWall(c, r) && flow[r * COLS + c] > 1) { flow[r * COLS + c] = 1; q.push([c, r]); } };
  if (campCells.size) campCells.forEach(k => { const [c, r] = k.split(',').map(Number); seed(c, r); });
  else for (let c = 0; c < COLS; c++) seed(c, ROWS - 1);
  let head = 0;
  while (head < q.length) {
    const [c, r] = q[head++]; const d = flow[r * COLS + c];
    for (const [dc, dr] of [[0, 1], [0, -1], [-1, 0], [1, 0]]) {
      const nc = c + dc, nr = r + dr;
      if (!inGrid(nc, nr) || isWall(nc, nr) || edgeBetween(c, r, nc, nr)) continue;
      if (flow[nr * COLS + nc] > d + 1) { flow[nr * COLS + nc] = d + 1; q.push([nc, nr]); }
    }
  }
}
const flowAt = (c, r) => inGrid(c, r) ? flow[r * COLS + c] : Infinity;
