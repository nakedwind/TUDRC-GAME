/* ===== 格線與座標設定 =====
   這裡定義地圖的格子大小、行列數，以及「格子 <-> 畫面座標」的換算工具。
   一般不太需要改；除非你想調整地圖格數或格子大小。
*/
const CELL = 40, COLS = 32, ROWS = 18;
const OX = (1280 - COLS * CELL) / 2, OY = 0;   // 40px 格子 → 32×18 剛好鋪滿 1280×720
const SPAWN_ROW = 0, CAMP_ROW = ROWS - 2;

// 格子中心的畫面座標
const center = (c, r) => [OX + c * CELL + CELL / 2, OY + r * CELL + CELL / 2];
// 畫面座標對應到哪一格
const cellAt = (x, y) => [Math.floor((x - OX) / CELL), Math.floor((y - OY) / CELL)];
// 這一格在地圖範圍內嗎
const inGrid = (c, r) => c >= 0 && c < COLS && r >= 0 && r < ROWS;
