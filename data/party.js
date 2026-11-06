/* ===== 慶功宴（食堂出餐小遊戲）的設定（程式在 js/party.js）=====
   想調時間、機率、台詞，都改這個檔案。目前是試玩版，數字都是暫定。
   ・主餐＝四格餐盤：每個人要 3～4 樣菜，打飯台的菜（名稱在 js/meal.js 的 MEAL_DISHES）加上偶爾要煮的菜。
   ・吃完可能追加：第二盤、香蕉、草莓蛋糕（不用裝盤）、一碗湯（要拿碗）。
*/
const PARTY = {
  mapName: '1F餐廳',
  start: { winter: [22, 14], eldrin: [22, 12] },   // 轉場後溫特、艾德林站的格子（格子座標）
  door: [23, 21],                                  // 大家從哪裡走進餐廳
  guestCount: 8,        // 幾個人會點餐（其他人在旁邊走動聊天）
  mustGuests: ['red', 'chris', 'avaren', 'theonie'],   // 優先請這些人坐下點餐（他們有專屬反應）
  timeLimit: 300,       // 一場最多幾秒，時間到就收尾
  arriveGap: 1.6,       // 大家隔幾秒走進來一個
  thinkTime: [3, 9],    // 坐下後想多久才要點餐（秒）
  againThink: [2, 6],   // 吃完之後想多久才追加（秒）
  orderPatience: 30,    // 等人來點餐可以等幾秒，超過會抱怨
  foodPatience: 90,     // 點完餐可以等幾秒，超過會抱怨
  snackTime: 4,         // 吃香蕉、蛋糕、喝湯要幾秒（餐盤的時間在 js/meal.js 的 MEAL.eatTime）
  burnAfter: 9,         // 煮好後再放幾秒會烤焦
  handLimit: 2,         // 手上最多拿幾樣食材
  plates: 8, bowls: 6,  // 餐盤、碗各有幾個（要回收才能再用）
  favorPerGuest: 2,     // 吃到餐的人加多少好感
  // 點餐內容
  trayDishes: [3, 4],   // 一盤要幾樣菜（最少、最多）
  cookedChance: .45,    // 一盤裡有多少機率要一樣打飯台沒有、要現煮的菜
  againChance: .6,      // 吃完後有多少機率追加
  againMax: 2,          // 一個人最多追加幾次
  againKinds: { tray: 3, banana: 3, cake: 3, soup: 2 },   // 追加時選到每一種的比重（tray＝第二盤）
  soupPan: 'tile_restaurant_buffet_counter_02#2',        // 打飯台上哪一盤是湯（不能裝進餐盤，要用碗）
  // 工作站：哪些地圖素材算哪一種
  tiles: {
    fridge: ['tile_restaurant_storage_cabinet', 'tile_new_decor_refrigerator'],
    stove: ['tile_mw5jkg1u', 'tile_restaurant_kitchen_workstation'],
    plate: ['tile_restaurant_tray_stack'],
    bowl: ['tile_restaurant_bowl_stack'],
    soup: ['tile_restaurant_soup_warmer'],
    trash: ['tile_restaurant_trash_bin_small'],
    waste: ['tile_restaurant_waste_sorting_station'],
  },
  // 可以暫放餐盤、碗的空位（地圖上的像素位置；餐廳的桌子搬位置時要跟著改）
  slots: [[468, 516], [500, 516], [530, 516], [561, 516], [706, 612]],
  // 食物：raw＝冰箱拿的生食（cookTo 煮好變什麼，cook 要煮幾秒）；snack＝可以直接拿給人吃
  foods: {
    sashimi: { name: '生魚片', img: 'images/道具/生魚片.png', fridge: true, cookTo: 'grilledFish', cook: 4 },
    loofah: { name: '絲瓜', img: 'images/道具/絲瓜.png', fridge: true, cookTo: 'grilledLoofah', cook: 4 },
    banana: { name: '香蕉', img: 'images/道具/banana.png', fridge: true, snack: true },
    cake: { name: '草莓蛋糕', img: 'images/餐廳/91_strawberrycake_dish.png', fridge: true, snack: true },
    grilledFish: { name: '烤魚片', img: 'images/道具/烤魚片-金黃版.png', from: 'sashimi' },
    grilledLoofah: { name: '烤絲瓜', img: 'images/道具/烤絲瓜.png', from: 'loofah' },
    burnt: { name: '烤焦的菜', img: 'images/餐廳/慶功宴/dish-burnt.png' },
  },
  stoveImg: 'images/餐廳/慶功宴/icon-stove.png',
  noahGap: 22,          // 諾亞大約隔幾秒順手端一盤
  noahSay: '對了，你有聽說那件事嗎？',
  lines: {
    ask: '最近的任務讓大家都很辛苦，要不要來辦一場慶功宴讓大家放鬆一下呢？當然，我也會幫忙的。',
    no: '真可惜……偶爾也要記得犒勞一下大家的努力喔！',
    yes: '那麼就來準備吧！食堂集合！',
    ready: '大家想吃的都不一樣，要照他們說的打菜喔。我來收髒盤，阿瓦倫那份也交給我，其他就拜託你了！',
    end: '大家都吃得很開心呢。辛苦了，溫特。',
    complainOrder: { default: ['還沒有人來點餐嗎？'], red: ['我什麼都吃喔！隨時可以點！'], chris: ['好餓……我自己去拿好了。'], theonie: ['讓我等，你膽子不小。'], avaren: ['艾德林呢？'] },
    complainFood: { default: ['我的餐還沒好嗎？'], red: ['沒關係！慢慢來！我不餓……其實有點餓！'], chris: ['那盤看起來沒人要吧？'], theonie: ['廚房是在做藝術品嗎？'], avaren: ['我等艾德林。'] },
    thanks: { default: ['謝謝！看起來好好吃！'], red: ['好吃！這個超好吃！'], chris: ['終於可以吃了～'], theonie: ['還算可以。'], avaren: ['艾德林拿的，好吃。'], luther: ['……謝謝。'] },
    again: { tray: '我還想再吃一盤！', banana: '還想吃根香蕉。', cake: '有甜點嗎？想吃草莓蛋糕。', soup: '想喝碗湯。' },
    burntOk: '有點焦焦的，可是好好吃耶！',
    refuse: '艾德林呢？',
    steal: '這盤沒人要吧？那我吃囉～',
  },
};
