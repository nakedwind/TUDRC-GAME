/* ===== 夾娃娃機設定（程式、畫面在 js/claw-machine.js）=====
   ・花經費買次數（playCost／packCost），每次有 aimTime 秒可以移動爪子，時間到會自己下爪。
   ・夾不夾得起來：獎品的 grip × 對準程度（正中＝1 倍、擦邊＝minAim 倍）。沒夾穩的會在半路掉下來，掉進出口一樣算你的。
   ・保夾：連續 pityPlays 次沒拿到東西，下一爪只要碰到獎品就一定夾得起來；拿到任何東西就重新計算（每台機器各算各的）。
   ・機台裡的獎品是實際擺在裡面的：一開始每種一個，其他照 weight 抽；夾走就少一個，剩不到 restockBelow 個時補回 stockSize 個。
   ・prizes 欄位：id＝data/supplies.js、data/items.js 的物品 id（costume: true＝data/costumes.js 的服裝）；
     grip＝夾力 0～1（越大越好夾）；weight＝補貨時多常出現；tier＝膠囊顏色 common／rare／jackpot；r＝膠囊半徑（畫面單位，沒寫＝ballR）
*/
const CLAW_MACHINE = {
  tiles: ['tile_street_claw_machine'],   // 可以玩的地圖素材（名稱有「夾娃娃機」的也算）
  playCost: 30,          // 投 1 次多少錢
  packPlays: 5,          // 優惠包幾次
  packCost: 120,         //         多少錢
  aimTime: 15,           // 每次可以移動爪子幾秒
  pityPlays: 10,         // 保夾：連續幾次沒拿到東西後，下一爪必中
  minAim: .4,            // 對得最歪（剛好擦到）時夾力剩幾成
  moveSpeed: 135,        // 爪子左右移動的速度（畫面單位／秒；機台內部寬 400）
  stockSize: 12,         // 機台裝滿是幾個
  restockBelow: 6,       // 剩不到幾個就補貨
  ballR: 26,             // 膠囊半徑
  prizes: [
    { id: 'battery',          grip: .68, weight: 16, tier: 'common' },
    { id: 'medkit',           grip: .60, weight: 16, tier: 'common' },
    { id: 'youyou-card',      grip: .52, weight: 12, tier: 'common' },
    { id: 'firstaid',         grip: .46, weight: 12, tier: 'common' },
    { id: 'thermos',          grip: .42, weight: 10, tier: 'common' },
    { id: 'adrenaline',       grip: .36, weight: 10, tier: 'rare' },
    { id: 'eye-drops',        grip: .32, weight: 8,  tier: 'rare' },
    { id: 'charm',            grip: .28, weight: 8,  tier: 'rare' },
    { id: 'anomaly-firstaid', grip: .17, weight: 5,  tier: 'rare' },
    { id: 'bird-green',       grip: .10, weight: 3,  tier: 'jackpot', costume: true, r: 33 },   // 小鳥頭飾（綠繡眼）：大獎，一台最多放一個
  ],
};
