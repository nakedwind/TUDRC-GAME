/* ===== 服裝資料（服裝系統：js/costumes.js）=====
   ・skin（服裝）：一整套 15 張 64×64 動作圖，綁定某一個角色；基地、戰鬥可以各自選穿哪一套。
       每個角色現有的 A（基地）、B（戰鬥）兩套自動算進來，不用寫在這裡。
       新的 skin：把圖放在 images/character/<folder>/（檔名跟其他角色一樣：<folder 去掉底線>_0000_Front.png …），再加一筆到 COSTUME_SKINS。
   ・配件：疊在角色身上的小圖，所有角色共用同一張圖；一個欄位戴一個（頭飾、臉部、背部、手持）。
       art.front＝正面圖；art.side＝側面圖（畫朝左，往右時自動左右翻；沒畫就用正面圖）；art.back＝背面圖（沒畫就用正面圖）。
   ・rarity：稀有度 N／R／SR（扭蛋機的機率看這個）；gacha: false＝不放進扭蛋池；giftable: false＝不能當禮物送（沒寫＝可以送；skin 只能送給那個角色）。
*/
const COSTUME_SLOTS = [
  { id: 'skin', name: '服裝' },
  { id: 'head', name: '頭飾' },
  { id: 'face', name: '臉部' },
  { id: 'back', name: '背部' },
  { id: 'hand', name: '手持' },
];
// 每個欄位的配件預設放在角色圖（64×64）的哪裡：x、y＝配件中心；behind＝畫在角色後面；hidden＝這個方向看不到
// 每個角色、每個配件、每個方向的位置用「服裝編輯器」調，存在 data/costume-placement.js（有調過就優先用那裡的）
const COSTUME_SLOT_ANCHORS = {
  head: { front: { x: 42, y: 9 }, left: { x: 30, y: 7 }, right: { x: 34, y: 7 }, back: { x: 22, y: 9 } },
  face: { front: { x: 32, y: 27 }, left: { x: 22, y: 27 }, right: { x: 42, y: 27 }, back: { hidden: true } },
  back: { front: { x: 32, y: 40, behind: true }, left: { x: 40, y: 40, behind: true }, right: { x: 24, y: 40, behind: true }, back: { x: 32, y: 40 } },
  hand: { front: { x: 46, y: 46 }, left: { x: 22, y: 46 }, right: { x: 42, y: 46 }, back: { x: 18, y: 46, behind: true } },
};
// 內建兩套（每個角色原本的 A、B 圖）的名稱
const COSTUME_DEFAULT_SKINS = { A: '基地便服', B: '出勤制服' };
// 角色專屬的整套服裝
const COSTUME_SKINS = [
  // { id: 'red-swim', char: 'red', name: '夏日泳裝', folder: 'red_swim', rarity: 'R', giftable: true },
];
// 配件
const COSTUME_ACCESSORIES = [
  // 圖放在 images/costumes/，檔名依配件、顏色與方向命名。
  { id: 'bow-red', name: '紅色蝴蝶結', slot: 'head', rarity: 'N', art: { front: 'images/costumes/bows/bow-red.png' } },
  { id: 'bow-blue', name: '藍色蝴蝶結', slot: 'head', rarity: 'N', art: { front: 'images/costumes/bows/bow-blue.png' } },
  { id: 'bow-white', name: '白色蝴蝶結', slot: 'head', rarity: 'N', art: { front: 'images/costumes/bows/bow-white.png' } },
  { id: 'bird-green', name: '綠繡眼', slot: 'head', rarity: 'R', art: { front: 'images/costumes/birds/white-eye-front.png', side: 'images/costumes/birds/white-eye-side.png', back: 'images/costumes/birds/white-eye-back.png' } },   // 停在頭頂的小鳥
  { id: 'bear-hood', name: '熊熊頭套', slot: 'head', rarity: 'SR', art: { front: 'images/costumes/bear-hood/bear-hood-front.png', side: 'images/costumes/bear-hood/bear-hood-side.png', back: 'images/costumes/bear-hood/bear-hood-back.png' } },   // 整個套住頭，正面中間露出臉
  { id: 'large-bow-red', name: '紅色大蝴蝶結', slot: 'head', rarity: 'N', art: { front: 'images/costumes/large-bows/large-bow-red.png', side: 'images/costumes/large-bows/large-bow-red-side.png' } },
  { id: 'large-bow-blue', name: '藍色大蝴蝶結', slot: 'head', rarity: 'N', art: { front: 'images/costumes/large-bows/large-bow-blue.png', side: 'images/costumes/large-bows/large-bow-blue-side.png' } },
  { id: 'large-bow-white', name: '白色大蝴蝶結', slot: 'head', rarity: 'N', art: { front: 'images/costumes/large-bows/large-bow-white.png', side: 'images/costumes/large-bows/large-bow-white-side.png' } },
  { id: 'flower-hair-clip', name: '小花髮夾', slot: 'head', rarity: 'N', art: { front: 'images/costumes/flower-clips/flower-hair-clip.png' } },
  { id: 'round-glasses', name: '圓眼鏡', slot: 'face', rarity: 'N', art: { front: 'images/costumes/round-glasses/round-glasses-front.png', side: 'images/costumes/round-glasses/round-glasses-side.png' } },
  { id: 'sunglasses', name: '墨鏡', slot: 'face', rarity: 'N', art: { front: 'images/costumes/sunglasses/sunglasses-front.png', side: 'images/costumes/sunglasses/sunglasses-side.png' } },
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
};
// 送禮（js/gifts.js 的禮物選單）：服裝也能送給隊員。送出後用掉你的一件，對方馬上穿上，從此那件是他的（衣櫃裡只有他能穿）。
// 對方喜不喜歡照 data/gifts.js 的 GIFT_PREFS（可以把服裝 id 寫進 love／like／dislike）；沒寫的算 reaction；稀有度越高多加越多好感。
// 台詞：GIFT_PREFS 裡的 lines.costume（沒寫就用一般收禮的台詞）
const COSTUME_GIFT = { reaction: 'like', rarityBonus: { N: 0, R: 4, SR: 10 } };
// 扭蛋機（js/gacha.js）：所有 skin、配件都會進扭蛋池，除非寫 gacha: false
const GACHA = {
  cost: 30,                        // 轉 1 次花幾個異質碎片
  tenCost: 270,                    // 轉 10 次（打九折）
  rates: { N: 70, R: 25, SR: 5 },  // 各稀有度的機率（%）；某個稀有度還沒有東西時，機率平均分給其他的
  dismantle: { N: 5, R: 15, SR: 40 },   // 分解 1 個重複的換回幾個異質碎片（每樣至少留 1 個）
  machineTiles: ['tile_street_capsule_toy_machines'],   // 可以轉的地圖素材（名稱有「扭蛋機」的也算）
};
