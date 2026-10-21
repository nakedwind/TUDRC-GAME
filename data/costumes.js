/* ===== 服裝資料（服裝系統：js/costumes.js）=====
   ・skin（服裝）：一整套 15 張 64×64 動作圖，綁定某一個角色；基地、戰鬥可以各自選穿哪一套。
       每個角色現有的 A（基地）、B（戰鬥）兩套自動算進來，不用寫在這裡。
       新的 skin：把圖放在 images/character/<folder>/（檔名跟其他角色一樣：<folder 去掉底線>_0000_Front.png …），再加一筆到 COSTUME_SKINS。
   ・配件：疊在角色身上的小圖，所有角色共用同一張圖；一個欄位戴一個（頭飾、臉部、背部、手持）。
       art.front＝正面圖；art.side＝側面圖（畫朝左，往右時自動左右翻；沒畫就用正面圖）；art.back＝背面圖（沒畫就用正面圖）。
   ・rarity：稀有度（之後扭蛋用）；giftable：可以當禮物送給那位隊員（之後送禮用）。
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
  { id: 'bow-red', name: '紅色蝴蝶結', slot: 'head', rarity: 'N', art: { front: 'images/costume/bow-red.png' } },   // 測試用
  { id: 'glasses-round', name: '圓框眼鏡', slot: 'face', rarity: 'N', art: { front: 'images/costume/glasses-round.png', side: 'images/costume/glasses-round-side.png' } },   // 測試用
];
// 一開始就擁有的服裝（扭蛋做好之前先用這個測試）
const COSTUME_STARTER = ['bow-red', 'glasses-round'];
// 可以打開服裝介面的地圖素材（衣櫃）
const WARDROBE_TILES = ['tile_dorm_wardrobe_lab_coat'];
