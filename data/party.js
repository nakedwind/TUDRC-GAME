/* ===== 慶功宴（食堂出餐小遊戲）的設定（程式在 js/party.js）=====
   想調時間、機率、台詞，都改這個檔案。目前是試玩版，數字都是暫定。
   ・主餐＝四格餐盤：每個人要 3～4 樣菜，打飯台的菜（名稱在 js/meal.js 的 MEAL_DISHES）加上偶爾要煮的菜。
   ・吃完可能追加：第二盤、四種甜點（冰箱拿，不用裝盤）、一碗湯（要拿碗）。
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
  snackTime: 4,         // 吃甜點、喝湯要幾秒（餐盤的時間在 js/meal.js 的 MEAL.eatTime）
  burnAfter: 9,         // 煮好後再放幾秒會烤焦
  handLimit: 2,         // 手上最多拿幾樣食材
  plates: 8, bowls: 6,  // 餐盤、碗各有幾個（要回收才能再用）
  favorPerGuest: 2,     // 吃到餐的人加多少好感
  // 克莉思偷吃：隔一段時間自己去開冰箱，要走到她旁邊按互動鍵才能阻止
  sneaker: 'chris',     // 誰會偷吃
  sneakGap: [30, 50],   // 坐回座位後，隔幾秒會再去一次（最短、最長，每次隨機）
  sneakEat: 6,          // 站在冰箱前吃幾秒（來不及阻止就算「被偷吃」）
  // 滿意程度（0～100）：每一餐從 100 分開始扣，最後取平均；結算畫面的粉紅色條就是這個數字
  mood: {
    orderGrace: 10, orderPenalty: 25,   // 等人來點餐：超過 10 秒開始扣，再等滿 orderPatience 秒時扣滿 25 分
    foodGrace: 35, foodPenalty: 40,     // 等上菜：超過 35 秒開始扣，再等滿 foodPatience 秒時扣滿 40 分
    wrongPenalty: 30,   // 送錯餐扣幾分
    unserved: 15,       // 時間到了還沒吃到的那一餐算幾分
    noMeal: 30,         // 整場一餐都沒吃到（例如提早結束，還沒輪到）算幾分
    min: 5,             // 一餐最低幾分
    high: 75, mid: 45,  // 評語：75 分以上用 high、45 分以上用 mid、其他用 low
  },
  // 點餐內容
  trayDishes: [3, 4],   // 一盤要幾樣菜（最少、最多）
  cookedChance: .45,    // 一盤裡有多少機率要一樣打飯台沒有、要現煮的菜
  againChance: .6,      // 吃完後有多少機率追加
  againMax: 2,          // 一個人最多追加幾次
  againKinds: { tray: 3, applePie: 2, cheesecake: 2, chocolateCake: 2, cake: 2, soup: 2 },   // 追加時選到每一種的比重（tray＝第二盤）
  soupPan: 'tile_mw628w22#2',        // 打飯台上哪一盤是湯，全場只有這裡裝得到湯（不能裝進餐盤，要用碗）
  // 工作站：哪些地圖素材算哪一種
  tiles: {
    fridge: ['tile_restaurant_storage_cabinet', 'tile_new_decor_refrigerator'],
    stove: ['tile_mw5jkg1u', 'tile_restaurant_kitchen_workstation'],
    plate: ['tile_restaurant_tray_stack'],
    bowl: ['tile_restaurant_bowl_stack'],
    trash: ['tile_restaurant_trash_bin_small'],
    waste: ['tile_restaurant_waste_sorting_station'],
  },
  // 可以暫放餐盤、碗的空位（地圖上的像素位置；餐廳的桌子搬位置時要跟著改）
  slots: [[468, 516], [500, 516], [530, 516], [561, 516], [706, 612]],
  // 食物：raw＝冰箱拿的生食（cookTo 煮好變什麼，cook 要煮幾秒）；snack＝可以直接拿給人吃
  foods: {
    sashimi: { name: '生魚片', img: 'images/道具/生魚片.png', fridge: true, cookTo: 'grilledFish', cook: 4 },
    loofah: { name: '絲瓜', img: 'images/道具/絲瓜.png', fridge: true, cookTo: 'grilledLoofah', cook: 4 },
    applePie: { name: '蘋果派', img: 'images/餐廳/06_apple_pie_dish.png', fridge: true, snack: true },
    cheesecake: { name: '起司蛋糕', img: 'images/餐廳/23_cheesecake_dish.png', fridge: true, snack: true },
    chocolateCake: { name: '巧克力蛋糕', img: 'images/餐廳/31_chocolatecake_dish.png', fridge: true, snack: true },
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
    ready: '大家想吃的都不一樣，要照他們說的打菜喔。我來收髒盤，做好的餐放在空檯子上，我有空也會幫忙端過去。其他就拜託你了！',
    end: '大家都吃得很開心呢。辛苦了，溫特、以及各位隊員們。',
    complainOrder: { default: ['還沒有人來點餐嗎？'], red: ['我什麼都吃喔！隨時可以點！'], chris: ['好餓……我自己去拿好了。'], theonie: ['讓我等，你膽子不小。'], avaren: ['艾德林呢？'] },
    complainFood: { default: ['我的餐還沒好嗎？'], red: ['沒關係！慢慢來！我不餓……其實有點餓！'], chris: ['冰箱好像還有東西耶……'], theonie: ['廚房是在做藝術品嗎？'], avaren: ['我等艾德林。'] },
    thanks: { default: ['謝謝！看起來好好吃！'], red: ['好吃！這個超好吃！'], chris: ['終於可以吃了～'], theonie: ['還算可以。'], avaren: ['艾德林拿的，好吃。'], luther: ['……謝謝。'] },
    again: { tray: '我還想再吃一盤！', applePie: '有甜點嗎？想吃蘋果派。', cheesecake: '有甜點嗎？想吃起司蛋糕。', chocolateCake: '有甜點嗎？想吃巧克力蛋糕。', cake: '有甜點嗎？想吃草莓蛋糕。', soup: '想喝碗湯。' },
    burntOk: '有點焦焦的，可是好好吃耶！',
    wrongFlash: '裝錯了',   // 送錯餐時，被送餐的人頭上跳的提示
    refuse: '艾德林呢？',
    refuseNotice: '阿瓦倫拒絕你送的餐點',
    sneakNotice: '克莉思跑去開冰箱了！',
    sneakGo: ['走一下、走一下～', '冰箱應該還有東西吧？'],
    sneakEat: ['先吃一口，沒人會發現的～', '這個看起來沒人要吧？'],
    sneakDone: ['嘿嘿，好吃～', '呼，活過來了～'],
    stop: '禁止偷吃！',
    stopReply: '好啦……',
  },
  // 結算的「看評語」：每個人依這次的滿意程度說一段話（high＝很滿意、mid＝普通、low＝不太滿意；門檻在上面的 mood）
  comments: {
    default: { high: '今天吃得很開心，謝謝招待！', mid: '還不錯，大家都辛苦了。', low: '等得有點久……不過心意收到了。' },
    theonie: { high: '嗯，這次還算有點水準。下次烤魚的火候交給我，一定更完美。', mid: '還行吧。餐要是再快一點，我會更滿意。', low: '等這麼久才上菜，廚房是在做藝術品嗎？下次我親自掌火好了。' },
    amber: { high: '每道菜都照點單送到，流程非常確實！我要把這次的出餐順序記下來學習。', mid: '很好吃！不過出餐順序好像還可以再調整……啊，我不是在批評部隊長！', low: '我的餐晚了一點……不過部隊長一定盡力了！下次請讓我幫忙，我會遵守流程的。' },
    red: { high: '超好吃！大家都吃得好開心，部隊長也辛苦啦！下次我來幫忙端盤子！', mid: '好吃！雖然等了一下下，但我什麼都吃，完全沒問題！', low: '肚子還有點餓……不過大家聚在一起就很開心啦！下次再辦一次吧！' },
    avaren: { high: '……艾德林拿來的，好吃。', mid: '……還可以。艾德林比較重要。', low: '……艾德林呢？' },
    luther: { high: '……好吃。謝了。你也記得吃。', mid: '……還行。人有點多。', low: '……沒事。我不急，你先顧其他人。' },
    eldrin: { high: '看到大家吃得這麼開心，真是太好了。溫特也別忘了吃點東西喔，我幫你留了一份。', mid: '大家都很開心呢。雖然有點手忙腳亂，不過溫特已經很努力了，下次我再多幫一點。', low: '好像有點太忙了呢……你沒有累壞吧？下次我們早點開始準備，我會多幫忙的。' },
    chris: { high: '吃飽了就想睡～路德今天也有好好吃完，我有在看喔。下次也要辦。', mid: '還不錯嘛～雖然有點餓，只好自己多走幾趟冰箱了。', low: '等到我都想自己開伙了……算了，冰箱裡的蛋糕我就不客氣囉～' },
    tino: { high: '……味道很乾淨，沒有亂七八糟的氣味。這次還可以。', mid: '人太多，味道也太雜了。不過……菜本身還行。', low: '這裡的味道吵死了，菜又等那麼久。我要回去了。' },
    claire: { high: '哇啊，好好吃！我拍了好多照片！部隊長最好了，安柏也有吃到喔！', mid: '很好吃！雖然等的時候有點緊張，不過流程我都有記下來了！', low: '唔……肚子有點餓……不過沒關係！下次我也可以來幫忙，我會好好背流程的！' },
    muomn: { high: '不用加班還有東西吃，這就是天堂吧～穆恩很滿足！', mid: '吃飯是很開心啦……吃完還得回去工作就是了，嗚。', low: '等餐等到比加班還累……工作做不完的時候也是這種心情。' },
    noah: { high: '菜很好吃，桌邊聽到的消息也很好吃。想知道誰吃了第二盤嗎？我很會保密的。', mid: '有點忙亂，不過這種時候最容易聽到趣事了。辛苦了，部隊長。', low: '大家私下都在聊上菜的事呢……放心，我只聽，不會亂說的。' },
    ash: { high: '……都可以的。不過，今天這個好像……還不錯。', mid: '嗯，都可以吧。吃得到就好。', low: '……我沒看清楚是什麼菜。沒關係，都可以的。' },
    eden: { high: '好吃是好吃……但薩冷全程都在觀察別人吃飯！他實在太可疑了！', mid: '這次沒有螢光咖喱，還算安全。我會繼續盯著薩冷的。', low: '上菜這麼慢，一定有人在背後搞鬼！我看八成是薩冷！' },
    salem: { high: '有人先吃喜歡的，有人留到最後。吃飯習慣可以稍微了解一個人，今天很有收穫。', mid: '嗯，我不怎麼挑食。倒是伊德一直躲在桌子後面看我。', low: '等餐的時候，人的本性特別明顯。……奇怪的人倒是看了不少。' },
    ball: { high: '汪汪！（尾巴搖個不停，好像在桌子底下撿到好吃的）', mid: '汪！（聞了聞大家的盤子，乖乖趴在艾德林腳邊）', low: '嗚……汪？（盯著你的手，好像在問還有沒有吃的）' },
    taana: { high: '不用顧訓練室還有飯吃，難得覺得今天值得了。可以直接下班了嗎？', mid: '還行。吃完就可以下班了吧？……不行啊。', low: '等這麼久，我都可以下班兩次了。' },
    colyn: { high: '好好吃！我吃了好多！可以把雞腿偷偷放在口袋裡帶走嗎？', mid: '好吃！可是我還沒飽！我想變得更強，所以還要再吃！', low: '肚子……空空的……下次可以先把咖哩端上來嗎？' },
    rowan: { high: '這裡的東西都好好吃……！凱爾也幫忙收拾了喔，請隊長也誇誇他！', mid: '很好吃！出餐跟打靶一樣，每個步驟都很重要呢。隊長加油！', low: '站好、握穩、瞄準……上菜好像也需要多練習呢。沒關係，隊長下次一定可以的！' },
    cael: { high: '羅恩吃得很開心。……菜也很好吃。', mid: '還不錯。我比較在意羅恩有沒有吃飽。', low: '一定都要這麼趕嗎？啊……沒事。羅恩那份慢了點，我分他吃了。' },
    saku: { high: '……好吃。給你糖果，焦糖布丁口味。', mid: '不討厭，也不喜歡。……那個很吵的布丁頭可以小聲點嗎？', low: '……等很久。我這樣說，很冷漠嗎？' },
    kakuma: { high: '好吃！但我做的更好吃！學長有吃到嗎！？幾點吃的！？跟誰！？', mid: '還可以！下次請讓我支援廚房，輸贏就在出餐速度！', low: '這個速度不行！！請讓我上！學長要是餓到了怎麼辦！！' },
  },
};
