/* ===== 慶功宴（食堂出餐小遊戲）的設定（程式在 js/party.js）=====
   想調時間、菜單、台詞，都改這個檔案。目前是第一個試玩版，數字都是暫定。
   ・ingredients：食材。cook＝要在爐灶煮幾秒（0＝不用煮）；from＝去哪裡拿（fridge 冰箱、cabinet 儲物櫃、rice 打飯台、soup 保溫湯鍋、condiment 調味瓶）
   ・dishes：主菜。ings＝材料；box＝裝在 plate 餐盤或 bowl 碗。每場從這裡完全隨機抽 menuSize 道。
*/
const PARTY = {
  mapName: '1F餐廳',
  start: { winter: [22, 14], eldrin: [22, 12] },   // 轉場後溫特、艾德林站的格子（格子座標）
  door: [23, 21],                                  // 大家從哪裡走進餐廳
  menuSize: 3,          // 每場抽幾道主菜
  guestCount: 8,        // 幾個人會點餐（其他人在旁邊走動聊天）
  mustGuests: ['red', 'chris', 'avaren', 'theonie'],   // 優先請這些人坐下點餐（他們有專屬反應）
  timeLimit: 240,       // 一場最多幾秒，時間到就收尾
  arriveGap: 1.6,       // 大家隔幾秒走進來一個
  thinkTime: [3, 9],    // 坐下後想多久才要點餐（秒）
  orderPatience: 25,    // 等人來點餐可以等幾秒，超過會抱怨
  foodPatience: 75,     // 點完餐可以等幾秒，超過會抱怨
  eatTime: 7,           // 吃幾秒
  burnAfter: 9,         // 煮好後再放幾秒會烤焦
  plates: 6, bowls: 6,  // 餐盤、碗各有幾個（吃完要回收才能再用）
  counterSlots: 3,      // 出菜台可以放幾份
  counterSpots: [[100, 16], [84, 44], [106, 54]],   // 暫放的位置（從出菜台圖左上角算的像素；避開餐盤架、筷筒）
  favorPerGuest: 2,     // 吃到餐的人加多少好感
  tiles: {              // 哪些地圖素材算哪個工作站（之後加了冰箱素材，把它的 id 加進 fridge 就好）
    fridge: ['tile_restaurant_storage_cabinet', 'tile_new_decor_refrigerator'],
    stove: ['tile_restaurant_kitchen_workstation'],
    plate: ['tile_restaurant_tray_stack'],
    bowl: ['tile_restaurant_bowl_stack'],
    rice: ['tile_restaurant_buffet_counter_02'],
    soup: ['tile_restaurant_soup_warmer'],
    condiment: ['tile_restaurant_condiment_bottles'],
    counter: ['tile_restaurant_serving_counter'],
    trash: ['tile_restaurant_trash_bin_small'],
    waste: ['tile_restaurant_waste_sorting_station'],
  },
  ingredients: {
    chicken:    { name: '生雞腿',   cook: 6, from: 'fridge',    img: 'images/餐廳/慶功宴/ing-chicken.png' },
    pork:       { name: '絞肉',     cook: 5, from: 'fridge',    img: 'images/餐廳/慶功宴/ing-pork.png' },
    fish:       { name: '虱目魚肚', cook: 6, from: 'fridge',    img: 'images/道具/虱目魚肚.png' },
    sashimi:    { name: '生魚片',   cook: 4, from: 'fridge',    img: 'images/道具/生魚片.png' },
    loofah:     { name: '絲瓜',     cook: 4, from: 'fridge',    img: 'images/道具/絲瓜.png' },
    clam:       { name: '蛤蜊',     cook: 4, from: 'fridge',    img: 'images/餐廳/慶功宴/ing-clam.png' },
    oyster:     { name: '蚵仔',     cook: 3, from: 'fridge',    img: 'images/餐廳/慶功宴/ing-oyster.png' },
    egg:        { name: '雞蛋',     cook: 3, from: 'fridge',    img: 'images/餐廳/慶功宴/ing-egg.png' },
    vermicelli: { name: '米粉',     cook: 3, from: 'cabinet',   img: 'images/餐廳/慶功宴/ing-vermicelli.png' },
    basil:      { name: '九層塔',   cook: 0, from: 'fridge',    img: 'images/餐廳/慶功宴/ing-basil.png' },
    ginger:     { name: '薑絲',     cook: 0, from: 'cabinet',   img: 'images/餐廳/慶功宴/ing-ginger.png' },
    rice:       { name: '白飯',     cook: 0, from: 'rice',      img: 'images/餐廳/慶功宴/ing-rice.png' },
    chili:      { name: '甜辣醬',   cook: 0, from: 'condiment', img: 'images/餐廳/慶功宴/ing-chili-sauce.png' },
    broth:      { name: '高湯',     cook: 0, from: 'soup',      img: 'images/餐廳/慶功宴/ing-broth.png' },
  },
  dishes: {
    friedChicken: { name: '鹹酥雞',     ings: ['chicken', 'basil'],             box: 'plate', img: 'images/餐廳/慶功宴/dish-fried-chicken.png' },
    lurou:        { name: '滷肉飯',     ings: ['pork', 'rice'],                 box: 'bowl',  img: 'images/餐廳/慶功宴/dish-lurou-rice.png' },
    loofahClam:   { name: '絲瓜蛤蜊',   ings: ['loofah', 'clam', 'ginger'],     box: 'plate', img: 'images/餐廳/慶功宴/dish-loofah-clam.png' },
    omelet:       { name: '蚵仔煎',     ings: ['oyster', 'egg', 'chili'],       box: 'plate', img: 'images/餐廳/慶功宴/dish-oyster-omelet.png' },
    congee:       { name: '虱目魚肚粥', ings: ['fish', 'rice', 'ginger'],       box: 'bowl',  img: 'images/餐廳/慶功宴/dish-milkfish-congee.png' },
    fishNoodle:   { name: '魚片米粉湯', ings: ['sashimi', 'vermicelli', 'broth'], box: 'bowl', img: 'images/餐廳/慶功宴/dish-fish-noodle-soup.png' },
  },
  burntImg: 'images/餐廳/慶功宴/dish-burnt.png',
  stoveImg: 'images/餐廳/慶功宴/icon-stove.png',
  // 幫手的個性：speed＝走路快慢倍率；late＝煮好後晚幾秒才去拿（太晚就烤焦）；slack＝每做完一步有多少機率偷懶；slackTime＝偷懶幾秒
  helperTraits: {
    theonie: { late: 12, say: '火力交給我，天才不需要計時。' },
    chris: { slack: .45, slackTime: 6, say: '我先試吃一下，這也是工作喔。' },
    noah: { slack: .25, slackTime: 3, say: '對了，你有聽說那件事嗎？' },
    red: { speed: 1.2, say: '交給我吧！我超會的！' },
  },
  noahFreeGap: 22,      // 諾亞沒被選當幫手時，大約隔幾秒順手端一盤
  lines: {
    ask: '最近的任務讓大家都很辛苦，要不要來辦一場慶功宴讓大家放鬆一下呢？當然，我也會幫忙的。',
    no: '真可惜……偶爾也要記得犒勞一下大家的努力喔！',
    yes: '那麼就來準備吧！食堂集合！',
    helper: '需要小幫手嗎？',
    end: '大家都吃得很開心呢。辛苦了，溫特。',
    complainOrder: { default: ['還沒有人來點餐嗎？'], red: ['我什麼都吃喔！隨時可以點！'], chris: ['好餓……我自己去拿好了。'], theonie: ['讓我等，你膽子不小。'], avaren: ['艾德林呢？'] },
    complainFood: { default: ['我的餐還沒好嗎？'], red: ['沒關係！慢慢來！我不餓……其實有點餓！'], chris: ['那盤看起來沒人要吧？'], theonie: ['廚房是在做藝術品嗎？'], avaren: ['我等艾德林。'] },
    thanks: { default: ['謝謝！看起來好好吃！'], red: ['好吃！這個超好吃！'], chris: ['終於可以吃了～'], theonie: ['還算可以。'], avaren: ['艾德林拿的，好吃。'], luther: ['……謝謝。'] },
    burntOk: '有點焦焦的，可是好好吃耶！',
    refuse: '我只吃艾德林拿給我的。',
    steal: '這盤沒人要吧？那我吃囉～',
  },
};
