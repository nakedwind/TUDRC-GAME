/* ===== 夾娃娃機設定（程式、畫面在 js/claw-machine.js）=====
   ・花經費買次數（playCost／packCost），每次有 aimTime 秒可以移動爪子，時間到會自己下爪。
   ・夾不夾得起來：獎品的 grip × 對準程度（正中＝1 倍、擦邊＝minAim 倍）。沒夾穩的會在半路掉下來，掉進出口一樣算你的。
   ・保夾：連續 pityPlays 次沒拿到東西，下一爪只要碰到獎品就一定夾得起來；拿到任何東西就重新計算（每台機器各算各的）。
   ・機台裡的獎品是實際擺在裡面的，夾走就沒了、不會補貨；全部夾完後，機台裡沒用完的次數會退錢（照優惠包的單價）。
   ・machines：地圖上第幾台放什麼（照地圖編輯器擺放的順序；台數比這裡多就從頭輪）。stock＝{ 物品 id: 幾個 }；costumes＝再放幾件隨機的 N 服裝（不會和別台重複）。
   ・prizes 欄位：id＝data/supplies.js、data/items.js 的物品 id（costume: true＝data/costumes.js 的服裝）；
     crystals: 5＝這顆膠囊是幾個異質碎片（id 自己取）；grip＝夾力 0～1（越大越好夾）；tier＝膠囊顏色 common／rare／jackpot；r＝膠囊半徑（畫面單位，沒寫＝ballR）
   ・N 服裝：data/costumes.js 裡 rarity 'N'、會進扭蛋池、不是角色專屬的配件，夾力都是 costumeGrip。
*/
const CLAW_MACHINE = {
  tiles: ['tile_street_claw_machine'],   // 可以玩的地圖素材（名稱有「夾娃娃機」的也算）
  playCost: 30,          // 投 1 次多少錢
  packPlays: 5,          // 優惠包幾次
  packCost: 120,         //         多少錢
  aimTime: 15,           // 每次可以移動爪子幾秒
  pityPlays: 10,         // 保夾：連續幾次沒拿到東西後，下一爪必中
  minAim: .4,            // 對得最歪（剛好擦到）時夾力剩幾成
  moveSpeed: 135,        // 爪子左右移動的速度（畫面單位／秒；機台內部高 360）
  musicNearCells: 5,     // 音樂：離機台幾格內開始小聲播
  musicNearVolume: .35,  //       貼著機台時是打開機台時音量的幾倍（越遠越小，到範圍邊緣剛好沒聲音）
  ballR: 43,             // 膠囊半徑
  costumeGrip: .4,       // N 服裝的夾力
  machines: [
    { stock: { medkit: 2, 'almond-water': 2, firstaid: 2, thermos: 1, 'anomaly-firstaid': 1, 'shards-5': 1 }, costumes: 1 },   // 第 1 台：補給
    { stock: { battery: 2, 'youyou-card': 2, 'graffiti-red': 1, 'graffiti-blue': 1, toolbox: 1, 'eye-drops': 1, 'shards-5': 1 }, costumes: 1 },   // 第 2 台：探索
    { stock: { 'almond-water': 1, battery: 1, 'graffiti-black': 1, adrenaline: 2, charm: 1, 'bird-green': 1, 'shards-10': 1 }, costumes: 2 },   // 第 3 台：稀有，大獎在這台
  ],
  prizes: [
    { id: 'battery',          grip: .68, tier: 'common' },
    { id: 'graffiti-red',     grip: .68, tier: 'common' },
    { id: 'graffiti-blue',    grip: .68, tier: 'common' },
    { id: 'graffiti-black',   grip: .68, tier: 'common' },
    { id: 'almond-water',     grip: .64, tier: 'common' },
    { id: 'medkit',           grip: .60, tier: 'common' },
    { id: 'youyou-card',      grip: .52, tier: 'common' },
    { id: 'firstaid',         grip: .46, tier: 'common' },
    { id: 'toolbox',          grip: .46, tier: 'common' },
    { id: 'thermos',          grip: .42, tier: 'common' },
    { id: 'shards-5',         grip: .45, tier: 'common', crystals: 5 },
    { id: 'adrenaline',       grip: .36, tier: 'rare' },
    { id: 'eye-drops',        grip: .32, tier: 'rare' },
    { id: 'charm',            grip: .28, tier: 'rare' },
    { id: 'shards-10',        grip: .25, tier: 'rare', crystals: 10 },
    { id: 'anomaly-firstaid', grip: .17, tier: 'rare' },
    { id: 'bird-green',       grip: .10, tier: 'jackpot', costume: true, r: 50 },   // 小鳥頭飾（綠繡眼）：大獎
  ],
};
