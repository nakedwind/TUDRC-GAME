/* ===== 固定牆與怪物尋路 =====
   固定牆 = 編輯地圖時放的、打不破的牆；怪物會自動繞過它。
   流場(flow) = 每一格「距離營地最短要走幾步」的地圖，怪物照著往數字小的方向走。
*/

// ---- 固定牆（地圖設計，跨局保留）----
let mapWalls = new Set();               // 存 'c,r' 字串
const isWall = (c, r) => mapWalls.has(c + ',' + r);

// ---- 流場（每格到營地的最短步數，會繞過固定牆）----
let flow = [];
function computeFlow() {
  flow = new Array(COLS * ROWS).fill(Infinity);
  const q = [];
  for (let c = 0; c < COLS; c++) { const r = ROWS - 1; if (!isWall(c, r)) { flow[r * COLS + c] = 1; q.push([c, r]); } }
  let head = 0;
  while (head < q.length) {
    const [c, r] = q[head++]; const d = flow[r * COLS + c];
    for (const [dc, dr] of [[0, 1], [0, -1], [-1, 0], [1, 0]]) {
      const nc = c + dc, nr = r + dr;
      if (!inGrid(nc, nr) || isWall(nc, nr)) continue;
      if (flow[nr * COLS + nc] > d + 1) { flow[nr * COLS + nc] = d + 1; q.push([nc, nr]); }
    }
  }
}
const flowAt = (c, r) => inGrid(c, r) ? flow[r * COLS + c] : Infinity;
