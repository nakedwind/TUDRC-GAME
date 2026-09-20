/* ===== 格線與座標設定 =====
   這裡定義地圖的格子大小、行列數，以及「格子 <-> 畫面座標」的換算工具。

   地圖大小（COLS×ROWS）可以比畫面大：
   - 每張地圖可在「地圖編輯器 → 地圖規則」自訂寬高，載入時會覆蓋這裡的預設值。
   - 遊戲畫面固定 VIEW_W×VIEW_H（相框），鏡頭會跟著玩家移動，露出地圖其他部分。
*/
const CELL = 40;                      // 一格 40 像素
let COLS = 32, ROWS = 18;             // 地圖格數（預設剛好一個畫面；地圖檔可覆蓋）
const VIEW_W = 1280, VIEW_H = 720;    // 遊戲畫面（相框）大小
// 畫面縮放：地圖比相框小時自動放大填滿（等比例、不裁切），由 maploader 依地圖大小計算。
// viewW()/viewH()＝相框換算成「世界座標」的大小，鏡頭與黑幕都用它。
let VIEW_SCALE = 1;
const viewW = () => VIEW_W / VIEW_SCALE;
const viewH = () => VIEW_H / VIEW_SCALE;
const OX = 0, OY = 0;                 // 地圖世界座標的原點
const SPAWN_ROW = 0;                  // 預設怪物入口＝最上排

// 格子中心的世界座標
const center = (c, r) => [OX + c * CELL + CELL / 2, OY + r * CELL + CELL / 2];
// 世界座標對應到哪一格
const cellAt = (x, y) => [Math.floor((x - OX) / CELL), Math.floor((y - OY) / CELL)];
// 這一格在地圖範圍內嗎
const inGrid = (c, r) => c >= 0 && c < COLS && r >= 0 && r < ROWS;
