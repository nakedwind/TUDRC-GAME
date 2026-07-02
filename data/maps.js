/* ===== 全部磚塊與地圖資料 =====
   這個檔案可以由「地圖編輯器.html」自動產生 —— 在編輯器按「產生匯出文字」，
   把整段貼回這裡覆蓋即可。

   TILES_CUSTOM：你自己加入的磚塊（圖片放在 background 資料夾）。
     欄位：id / name(名稱) / file(圖片路徑) / w,h(佔幾格寬高，1=一格) / role(沒圖時的佔位色)
     內建的「地板/牆/障礙物」不用寫在這，編輯器會自動提供。

   MAPS_DEFAULT：每張地圖。
     - layers    : 分層的小圖(1×1純外觀)，由下往上疊：floor地板→ground地面裝飾→object物件→overlay物件裝飾→top上層。
                   上層透明處會透出下層。例如 layers.object['3,4']='tile_x'（第3欄第4列的物件層貼某圖）
     - stamps    : 多格大圖，例如 { id:'tile_x', c:3, r:4 }（左上角在第3欄第4列）—— 疊在最上面
     - solid     : 不可穿透的格子 'c,r'（怪物穿不過、會繞路）—— 與圖片分開
     - breakable : 可破壞的格子 'c,r'（怪物停下打破後才過）—— 與圖片分開
     - entrances : 怪物入口 'c,r'（留空 [] = 最上排）
     - camp      : 營地 'c,r'（留空 [] = 最下兩排）
     - rules     : 這張地圖的規則數值
*/
const TILES_CUSTOM = [
  // 例：{ id:'tile_brick', name:'磚牆', role:'wall', file:'background/brick.png' },
];

const MAPS_DEFAULT = [
  {
    id: 'y1',
    name: 'Y 區 · 地下街入口',
    desc: '第一張地圖，難度較低，用來熟悉守營地。',
    layers: { floor: {}, ground: {}, object: {}, overlay: {}, top: {} },  // 5 層小圖（下→上）
    stamps: [],       // 多格大圖： { id, c, r }（左上角座標）
    solid: [],        // 不可穿透的格子（怪繞路）
    breakable: [],    // 可破壞的格子（怪打破）
    entrances: [],    // 怪物入口（留空＝最上排）
    camp: [],         // 營地（留空＝最下兩排）
    rules: {
      money: 150,       // 起始資源
      lives: 12,        // 營地HP
      guide: 100,       // 起始嚮導能量
      guideRegen: 9,    // 嚮導能量每秒回復
      waves: 5,         // 幾波怪
      count: 8, countAdd: 3,    // 每波怪物數量 = count + 波序*countAdd
      hp: 40, hpAdd: 28,        // 每波怪物血量 = hp + 波序*hpAdd
      speed: 44, speedAdd: 5,   // 每波怪物速度 = speed + 波序*speedAdd
      gap: 0.85, gapSub: 0.05,  // 出怪間隔(秒) = gap - 波序*gapSub
      reward: 8,                // 殺一隻怪回多少資源
    },
  },
];
