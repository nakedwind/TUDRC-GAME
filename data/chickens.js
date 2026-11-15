/* ===== 森林的雞、鳥巢、雞蛋：數值設定（程式在 js/chickens.js）=====
   ・鳥巢：地圖編輯器照一般物件擺「bg_forest_Nest_egg」（有蛋）或「bg_forest_Nest」（空巢），藍森林版也可以，
     遊戲會自動認出來。擺有蛋的＝一開始就有蛋；擺空巢＝要等 nestRespawn 秒才長出蛋。
   ・每個鳥巢旁邊會生出 chickensPerNest 隻雞，在巢附近 range 格內閒晃。
   ・雞蛋、烤雞蛋本身（吃了恢復多少、buff）在 data/supplies.js 的 egg、roasted-egg。
   ・時間單位都是「秒」，距離單位是「格」（一格 40 像素）。 */
const CHICKEN_CONFIG = {
  // 鳥巢的圖：有蛋的圖 → 蛋被撿走後換成哪張空巢圖（data/tiles.js 的素材 id）
  nests: {
    tile_forest_bg_forest_nest_egg: 'tile_forest_bg_forest_nest',
    tile_forestblue_bg_forest_nest_egg: 'tile_forestblue_bg_forest_nest',
  },
  image: 'images/森林/chicken.png',   // 雞的走路動畫（橫排三格，原圖朝右）
  frames: 3,                // 動畫有幾格
  fps: 6,                   // 走路動畫一秒換幾格
  scale: 1,                 // 雞畫多大（1＝原尺寸）
  chickensPerNest: 1,       // 每個鳥巢生幾隻雞
  range: 30,                // 雞離鳥巢最遠幾格（走太遠就往回走）
  speed: 36,                // 走路速度（像素／秒）
  walkTime: [1, 3.5],       // 每走一段（或停一下）持續幾秒（最短、最長）
  stopChance: .27,          // 換方向時，停下來發呆的機率
  layEvery: 300,            // 雞多久下一次蛋（5 分鐘）；下蛋時播 chickenLay（POP）
  maxGroundEggs: 3,         // 鳥巢附近地上已經有這麼多顆蛋沒撿：雞就先不下（免得放著不管越生越多）
  nestEggs: 2,              // 鳥巢裡撿一次拿到幾顆蛋
  nestRespawn: 900,        // 空巢多久長回一顆蛋（15 分鐘）
  pickRange: 48,            // 離雞、鳥巢多近可以按空白鍵（像素）
  carryLift: .14,           // 抱著時雞的腳在溫特腳底往上幾倍身高（照《苦艾與甘露》：身高 45 時往上 6 像素）
  carryDown: 5,             // 再往下幾像素（試玩後調整）
  carryDx: .044,            // 抱著時雞往右偏幾倍身高（苦艾與甘露：往右 2 像素）
  carrySide: 8,             // 溫特朝右時雞再往右幾像素；朝左時往左（鏡射）
  carrySpeed: .9,          // 抱著雞時走路速度倍率（.9＝慢 10%）
  carrySp: .5,              // 抱著雞時每秒恢復多少 SP（抱著毛茸茸的雞，心情比較平靜）
  bumpCooldown: 1.5,        // 撞到雞會咯咯叫，幾秒內不再叫
  cluckEvery: [15, 40],     // 平常隔幾秒隨機咯咯叫一聲（最短、最長）
  cluckRange: 8,            // 溫特在幾格內才聽得到雞平常的叫聲
};
