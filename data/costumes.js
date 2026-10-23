/* ===== 服裝資料（服裝系統：js/costumes.js）=====
   ・skin（服裝）：一整套 15 張 64×64 動作圖，綁定某一個角色；基地、戰鬥可以各自選穿哪一套。
       每個角色現有的 A（基地）、B（戰鬥）兩套自動算進來，不用寫在這裡。
       新的 skin：把圖放在 images/character/<folder>/（檔名跟其他角色一樣：<folder 去掉底線>_0000_Front.png …），再加一筆到 COSTUME_SKINS。
   ・配件：疊在角色身上的小圖，所有角色共用同一張圖；一個欄位戴一個（頭飾、臉部、背部、手部、下身＝尾巴這類）。
       art.front＝正面圖；art.side＝側面圖（畫朝左，往右時自動左右翻；沒畫就用正面圖）；art.back＝背面圖（沒畫就用正面圖）。
   ・wear：skin 能在哪裡穿：'base'＝只能在應變中心（基地）穿、'battle'＝只能出勤穿；沒寫＝兩邊都能穿。
   ・char：角色專屬的配件（只有那個角色能戴、能收；例如 char: 'winter'＝溫特專用）。
   ・rarity：稀有度 N／R／SR／SSR（扭蛋機的機率看這個）；gacha: false＝不放進扭蛋池；giftable: false＝不能當禮物送（沒寫＝可以送；skin 只能送給那個角色）。
*/
const COSTUME_SLOTS = [
  { id: 'skin', name: '服裝' },
  { id: 'head', name: '頭飾' },
  { id: 'face', name: '臉部' },
  { id: 'back', name: '背部' },
  { id: 'hand', name: '手部' },
  { id: 'lower', name: '下身' },   // 尾巴這類：預設畫在腰後面
];
// 每個欄位的配件預設放在角色圖（64×64）的哪裡：x、y＝配件中心；behind＝畫在角色後面；hidden＝這個方向看不到
// 每個角色、每個配件、每個方向的位置用「服裝編輯器」調，存在 data/costume-placement.js（有調過就優先用那裡的）
const COSTUME_SLOT_ANCHORS = {
  head: { front: { x: 42, y: 9 }, left: { x: 30, y: 7 }, right: { x: 34, y: 7 }, back: { x: 22, y: 9 } },
  face: { front: { x: 32, y: 27 }, left: { x: 22, y: 27 }, right: { x: 42, y: 27 }, back: { hidden: true } },
  back: { front: { x: 32, y: 40, behind: true }, left: { x: 40, y: 40, behind: true }, right: { x: 24, y: 40, behind: true }, back: { x: 32, y: 40 } },
  hand: { front: { x: 46, y: 46 }, left: { x: 22, y: 46 }, right: { x: 42, y: 46 }, back: { x: 18, y: 46, behind: true } },
  lower: { front: { x: 32, y: 50, behind: true }, left: { x: 42, y: 50, behind: true }, right: { x: 22, y: 50, behind: true }, back: { x: 32, y: 50 } },   // 尾巴：正面、側面在身體後面，背面看得到
};
// 內建兩套（每個角色原本的 A、B 圖）的名稱
const COSTUME_DEFAULT_SKINS = { A: '基地便服', B: '出勤制服' };
// 角色專屬的整套服裝
const COSTUME_SKINS = [
  // { id: 'red-swim', char: 'red', name: '夏日泳裝', folder: 'red_swim', rarity: 'R', giftable: true },
  // 原圖在 images/costumes/03.body/，切好的 15 張在 images/character/<folder>/
  // sortie: true＝在基地穿著，出勤時也穿這套（要有持槍圖、倒地圖：資料夾加進 js/game.js 的 GUN_FOLDERS、FAIL_FILES）
  { id: 'winter-maid', char: 'winter', name: '女僕裝', folder: 'winter_M', rarity: 'SSR', sortie: true },
  { id: 'avaren-student-long', char: 'avaren', name: '學生制服（長袖）', folder: 'avaren_L', rarity: 'SR', wear: 'base' },
  { id: 'avaren-student-short', char: 'avaren', name: '學生制服（短袖）', folder: 'avaren_S', rarity: 'SR', wear: 'base' },
  { id: 'eldrin-student-long', char: 'eldrin', name: '學生制服（長袖）', folder: 'eldrin_L', rarity: 'SR', wear: 'base' },
  { id: 'eldrin-student-short', char: 'eldrin', name: '學生制服（短袖）', folder: 'eldrin_S', rarity: 'SR', wear: 'base' },
  { id: 'eldrin-maid', char: 'eldrin', name: '女僕裝', folder: 'eldrin_M', rarity: 'SSR', sortie: true },
];
// 配件
const COSTUME_ACCESSORIES = [
  // 圖放在 images/costumes/<欄位資料夾>/<配件>/：01.head 頭飾、02.face 臉部、03.body 服裝、04.back 背部（尾巴放下身 lower）、05.hand_R 手持。
  { id: 'bow-red', name: '紅色蝴蝶結', slot: 'head', rarity: 'N', art: { front: 'images/costumes/01.head/bows/bow-red.png' } },
  { id: 'bow-blue', name: '藍色蝴蝶結', slot: 'head', rarity: 'N', art: { front: 'images/costumes/01.head/bows/bow-blue.png' } },
  { id: 'bow-white', name: '白色蝴蝶結', slot: 'head', rarity: 'N', art: { front: 'images/costumes/01.head/bows/bow-white.png' } },
  { id: 'bird-green', name: '綠繡眼', slot: 'head', rarity: 'R', art: { front: 'images/costumes/01.head/birds/white-eye-front.png', side: 'images/costumes/01.head/birds/white-eye-side.png', back: 'images/costumes/01.head/birds/white-eye-back.png' } },   // 停在頭頂的小鳥
  { id: 'bear-hood', name: '熊熊頭套', slot: 'head', rarity: 'SR', art: { front: 'images/costumes/01.head/bear-hood/bear-hood-front.png', side: 'images/costumes/01.head/bear-hood/bear-hood-side.png', back: 'images/costumes/01.head/bear-hood/bear-hood-back.png' } },   // 整個套住頭，正面中間露出臉
  { id: 'large-bow-red', name: '紅色大蝴蝶結', slot: 'head', rarity: 'N', art: { front: 'images/costumes/01.head/large-bows/large-bow-red.png', side: 'images/costumes/01.head/large-bows/large-bow-red-side.png' } },
  { id: 'large-bow-blue', name: '藍色大蝴蝶結', slot: 'head', rarity: 'N', art: { front: 'images/costumes/01.head/large-bows/large-bow-blue.png', side: 'images/costumes/01.head/large-bows/large-bow-blue-side.png' } },
  { id: 'large-bow-white', name: '白色大蝴蝶結', slot: 'head', rarity: 'N', art: { front: 'images/costumes/01.head/large-bows/large-bow-white.png', side: 'images/costumes/01.head/large-bows/large-bow-white-side.png' } },
  { id: 'flower-hair-clip', name: '小花髮夾', slot: 'head', rarity: 'N', art: { front: 'images/costumes/01.head/flower-clips/flower-hair-clip.png' } },
  { id: 'round-glasses', name: '圓眼鏡', slot: 'face', rarity: 'N', art: { front: 'images/costumes/02.face/round-glasses/round-glasses-front.png', side: 'images/costumes/02.face/round-glasses/round-glasses-side.png' } },
  { id: 'sunglasses', name: '墨鏡', slot: 'face', rarity: 'N', art: { front: 'images/costumes/02.face/sunglasses/sunglasses-front.png', side: 'images/costumes/02.face/sunglasses/sunglasses-side.png' } },
  { id: 'halo', name: '天使光環', slot: 'head', rarity: 'R', art: { front: 'images/costumes/01.head/Halo/Halo.png' } },
  { id: 'devil-horns', name: '惡魔角', slot: 'head', rarity: 'R', art: { front: 'images/costumes/01.head/devil_horns/Head_devil horns_front.png', side: 'images/costumes/01.head/devil_horns/Head_devil horns_side.png' } },
  { id: 'minnie-ribbon', name: '鼠耳蝴蝶結', slot: 'head', rarity: 'R', art: { front: 'images/costumes/01.head/minnie_ribon/Head_minnie_front.png', side: 'images/costumes/01.head/minnie_ribon/Head_minnie_side.png', back: 'images/costumes/01.head/minnie_ribon/Head_minnie_back.png' } },
  { id: 'wolf-ears', name: '狼耳', slot: 'head', char: 'winter', rarity: 'R', art: { front: 'images/costumes/01.head/furry_ear_winter/Head_winter animal ear_front.png', side: 'images/costumes/01.head/furry_ear_winter/Head_winter animal ear_side.png', back: 'images/costumes/01.head/furry_ear_winter/Head_winter animal ear_back.png' } },
  { id: 'santa-hat', name: '聖誕帽', slot: 'head', rarity: 'N', art: { front: 'images/costumes/01.head/Santahat/Head_Santa hat.png' } },
  { id: 'flower-blue', name: '藍色小花', slot: 'head', rarity: 'N', art: { front: 'images/costumes/01.head/flower_blue/Head_blue flower.png' } },
  { id: 'flower-blue-two', name: '藍色雙花', slot: 'head', rarity: 'N', art: { front: 'images/costumes/01.head/flower_blue/Head_blue flower two.png' } },
  { id: 'flower-white', name: '白色小花', slot: 'head', rarity: 'N', art: { front: 'images/costumes/01.head/flower_white/Head_white flower.png' } },
  { id: 'flower-white-two', name: '白色雙花', slot: 'head', rarity: 'N', art: { front: 'images/costumes/01.head/flower_white/Head_white flower two.png' } },
  { id: 'maid-headdress', name: '女僕頭飾', slot: 'head', rarity: 'R', art: { front: 'images/costumes/01.head/maid_headdress/maid_headdress_01.png', side: 'images/costumes/01.head/maid_headdress/maid_headdress.png' } },
  { id: 'angel-wings', name: '天使小翅膀', slot: 'back', rarity: 'R', art: { front: 'images/costumes/04.back/angel_wings/Back_wing_front.png', side: 'images/costumes/04.back/angel_wings/Back_wing_side.png' } },
  { id: 'white-wings', name: '白色羽翼', slot: 'back', rarity: 'SR', art: { front: 'images/costumes/04.back/wings/wings_back.png', side: 'images/costumes/04.back/wings/wings_side.png', back: 'images/costumes/04.back/wings/wings_back.png' } },   // 沒有正面圖：正面用背面圖（翅膀在身體後面）
  { id: 'devil-wings', name: '惡魔翅膀', slot: 'back', rarity: 'SR', art: { front: 'images/costumes/04.back/devil_wings/Back_devil_front.png', side: 'images/costumes/04.back/devil_wings/Back_devil_side.png', back: 'images/costumes/04.back/devil_wings/Back_devil_back.png' } },
  { id: 'devil-tail', name: '惡魔尾巴', slot: 'lower', rarity: 'R', art: { front: 'images/costumes/04.back/tail_devil/Tail_devil.png' } },
  { id: 'wolf-tail', name: '狼尾巴', slot: 'lower', char: 'winter', rarity: 'R', art: { front: 'images/costumes/04.back/tail_wolf_winter/Tail_winter wolf_front.png', side: 'images/costumes/04.back/tail_wolf_winter/Tail_winter wolf_side.png' } },
  { id: 'star-wand', name: '星星魔杖', slot: 'hand', rarity: 'N', art: { front: 'images/costumes/05.hand_R/satr_wand/Hand_star.png' } },
  { id: 'striped-bag', name: '條紋提袋', slot: 'hand', rarity: 'N', icon: 'images/costumes/05.hand_R/gaji_bag/Hand_gaji bag_side.png', art: { front: 'images/costumes/05.hand_R/gaji_bag/Hand_gaji bag_front.png', side: 'images/costumes/05.hand_R/gaji_bag/Hand_gaji bag_side.png' } },
];
// 一開始就擁有的服裝（新存檔送的；空的＝全部要從扭蛋轉）
const COSTUME_STARTER = [];
// 可以打開服裝介面的地圖素材（衣櫃）
const WARDROBE_TILES = ['tile_dorm_wardrobe_lab_coat'];

// 稀有度：名稱、顏色（衣櫃、扭蛋共用）
const COSTUME_RARITIES = {
  N: { name: '普通', color: '#b9c6d3' },
  R: { name: '稀有', color: '#6fc3ff' },
  SR: { name: '超稀有', color: '#ffc95c' },
  SSR: { name: '極稀有', color: '#ff7ad9' },
};
// 送禮（js/gifts.js 的禮物選單）：服裝也能送給隊員。送出後用掉你的一件，對方馬上穿上，從此那件是他的（衣櫃裡只有他能穿）。
// 對方喜不喜歡照 data/gifts.js 的 GIFT_PREFS（可以把服裝 id 寫進 love／like／dislike）；沒寫的算 reaction；稀有度越高多加越多好感。
// 台詞：對話編輯器「送禮與委託」的「收到服裝」（沒寫就不說；不喜歡的服裝說「收到不喜歡的禮物」）
const COSTUME_GIFT = { reaction: 'like', rarityBonus: { N: 0, R: 4, SR: 10, SSR: 20 } };
// 扭蛋機（js/gacha.js）：所有 skin、配件都會進扭蛋池，除非寫 gacha: false
const GACHA = {
  cost: 30,                        // 轉 1 次花幾個異質碎片
  tenCost: 270,                    // 轉 10 次（打九折）
  moneyCost: 5000,                 // 也可以花經費：轉 1 次花多少錢
  moneyTenCost: 50000,             //               轉 10 次花多少錢
  rates: { N: 68, R: 25, SR: 5, SSR: 2 },  // 各稀有度的機率（%）；某個稀有度還沒有東西時，機率平均分給其他的
  dismantle: { N: 5, R: 15, SR: 40, SSR: 100 },   // 分解 1 個重複的換回幾個異質碎片（每樣至少留 1 個）
  machineTiles: ['tile_street_capsule_toy_machines'],   // 可以轉的地圖素材（名稱有「扭蛋機」的也算）
};
