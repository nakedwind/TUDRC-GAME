/* 背包物品資料
   ・商店賣的零食、飲料寫在 data/supplies.js，會自動歸在「消耗品」。
   ・其他物品（撿到的、任務給的…）照下面 ITEMS 的格式加進去就會出現在背包裡。 */

// 背包分類：想加新分類就在這裡加一行（id 給程式用，name 顯示在分頁上）
const ITEM_CATEGORIES = [
  { id: 'consumable', name: '消耗品', icon: '🍙' },
  { id: 'material',   name: '素材',   icon: '🔩' },
  { id: 'key',        name: '重要物品', icon: '🔑' },
];

// 非商店物品。格式：
//   { id: 'rusty-key', name: '生鏽的鑰匙', category: 'key', file: '生鏽的鑰匙.png', desc: '說明文字' }
//   file 放在 images/道具/ 裡；desc 會顯示在背包右邊的說明欄
//   重要物品（category: 'key'）不能丟棄；其他物品不想讓玩家丟，可以加 noDrop: true
const ITEMS = [
].map(item => ({ ...item, image: 'images/道具/' + item.file }));
