/* 背包物品資料
   ・商店賣的補給、零食、飲料寫在 data/supplies.js，會自動分到「補給」「零食飲料」。
   ・其他物品（撿到的、任務給的…）照下面 ITEMS 的格式加進去就會出現在背包裡。 */

// 背包分類：想加新分類就在這裡加一行（id 給程式用，name 顯示在分頁上）
const ITEM_CATEGORIES = [
  { id: 'consumable', name: '補給',     icon: '🩹' },
  { id: 'gift',       name: '零食飲料', icon: '🎁' },
  { id: 'material',   name: '素材',   icon: '🔩' },
  { id: 'key',        name: '重要物品', icon: '🔑' },
];

// 非商店物品。格式：
//   { id: 'rusty-key', name: '生鏽的鑰匙', category: 'key', file: '生鏽的鑰匙.png', desc: '說明文字' }
//   file 放在 images/道具/ 裡（或用 image 直接寫完整路徑）；desc 會顯示在背包右邊的說明欄
//   重要物品（category: 'key'）不能丟棄；其他物品不想讓玩家丟，可以加 noDrop: true
const SHARD_DIR = 'images/碎片鑰匙/';
const ITEMS = [
  { id: 'battery', name: '電池', category: 'material', image: 'images/items/battery.png', desc: '在地圖上找到的電池。' },
  { id: 'anomaly-key', name: '異質鑰匙', category: 'key', image: SHARD_DIR + '異質鑰匙.png', desc: '打破異質核心時掉出來的鑰匙，摸起來冰冰涼涼的。好像能打開被異質力量封住的地方。' },
  { id: 'youyou-card', name: '好遊卡', category: 'consumable', image: SHARD_DIR + '好遊卡.png', desc: '捷運用的儲值卡，背面還貼著前主人的貼紙。在捷運閘門刷一下就能通過，刷一次用掉一張（裡面的錢只夠一趟）。' },
  { id: 'backroom-door-key', name: '後室門鑰匙', category: 'key', image: SHARD_DIR + '後室門鑰匙.png', desc: '舊舊的黃銅鑰匙。走到上鎖的後室門前按空白鍵或 E 開鎖，每次消耗 1 支。' },
  { id: 'storage-locker-key', name: '置物櫃鑰匙', category: 'key', image: 'images/items/storage-locker-key.png', desc: '靠近鎖住的置物箱，按空白鍵或 E 開啟，每次消耗 1 支鑰匙。' },
  // ---- 回憶碎片（素材）：集滿 MEMORY_KEYS 裡的數量就會拼成那段回憶的鑰匙 ----
  { id: 'burning-shard', name: '熾熱的碎片',   category: 'material', image: SHARD_DIR + 'burning-shard.png', noDrop: true, desc: '摸起來微微發燙。好像映著誰的身影。' },
  { id: 'pure-shard',    name: '無雜質的碎片', category: 'material', image: SHARD_DIR + 'pure-shard.png',    noDrop: true, desc: '清澈透亮，一點雜質都沒有，像某個人單純的心。' },
  { id: 'warm-shard',    name: '溫暖的碎片',   category: 'material', image: SHARD_DIR + 'warm-shard.png',    noDrop: true, desc: '握在手心裡，有種讓人安心的溫度。' },
  { id: 'black-shard',   name: '漆黑的碎片',   category: 'material', image: SHARD_DIR + 'black-shard.png',   noDrop: true, desc: '漆黑得看不見底，邊緣像是被什麼侵蝕過。' },
  { id: 'power-shard',   name: '充滿力量的碎片', category: 'material', image: SHARD_DIR + 'power-shard.png', noDrop: true, desc: '沉甸甸的，裡面好像有股力量在脈動。' },
  { id: 'sloth-shard',   name: '怠惰的碎片',   category: 'material', image: SHARD_DIR + 'sloth-shard.png',   noDrop: true, desc: '軟綿綿的光，看著看著就想打哈欠。' },
  { id: 'quiet-shard',   name: '寂靜的碎片',   category: 'material', image: SHARD_DIR + 'quiet-shard.png',   noDrop: true, desc: '拿在手上，周圍的聲音好像都安靜了下來。' },
  { id: 'spirit-shard',  name: '精神的碎片',   category: 'material', image: SHARD_DIR + 'spirit-shard.png',  noDrop: true, desc: '透著深藍色的光，凝視久了，心情會慢慢沉靜。' },
  { id: 'regret-shard',  name: '遺憾的碎片',   category: 'material', image: SHARD_DIR + 'regret-shard.png',  noDrop: true, desc: '冰冷的淡藍色，像是沒能說出口的話。' },
  // ---- 回憶鑰匙（重要物品）：打開對應的記憶之門 ----
  { id: 'burning-key', name: '熾熱的鑰匙',   category: 'key', image: SHARD_DIR + 'burning-key.png', desc: '用熾熱的碎片拼成的鑰匙。可以打開某扇記憶之門。' },
  { id: 'pure-key',    name: '無雜質的鑰匙', category: 'key', image: SHARD_DIR + 'pure-key.png',    desc: '用無雜質的碎片拼成的鑰匙。可以打開某扇記憶之門。' },
  { id: 'warm-key',    name: '溫暖的鑰匙',   category: 'key', image: SHARD_DIR + 'warm-key.png',    desc: '用溫暖的碎片拼成的鑰匙。可以打開某扇記憶之門。' },
  { id: 'black-key',   name: '漆黑的鑰匙',   category: 'key', image: SHARD_DIR + 'black-key.png',   desc: '用漆黑的碎片拼成的鑰匙。可以打開某扇記憶之門。' },
  { id: 'power-key',   name: '充滿力量的鑰匙', category: 'key', image: SHARD_DIR + 'power-key.png', desc: '用充滿力量的碎片拼成的鑰匙。可以打開某扇記憶之門。' },
  { id: 'sloth-key',   name: '怠惰的鑰匙',   category: 'key', image: SHARD_DIR + 'sloth-key.png',   desc: '用怠惰的碎片拼成的鑰匙。可以打開某扇記憶之門。' },
  { id: 'quiet-key',   name: '寂靜的鑰匙',   category: 'key', image: SHARD_DIR + 'quiet-key.png',   desc: '用寂靜的碎片拼成的鑰匙。可以打開某扇記憶之門。' },
  { id: 'spirit-key',  name: '精神的鑰匙',   category: 'key', image: SHARD_DIR + 'spirit-key.png',  desc: '用精神的碎片拼成的鑰匙。可以打開某扇記憶之門。' },
  { id: 'regret-key',  name: '遺憾的鑰匙',   category: 'key', image: SHARD_DIR + 'regret-key.png',  desc: '用遺憾的碎片拼成的鑰匙。可以打開某扇記憶之門。' },
].map(item => ({ ...item, image: item.image || 'images/道具/' + item.file }));

// 碎片 → 鑰匙：need＝要幾個碎片
const MEMORY_KEYS = [
  { shard: 'burning-shard', key: 'burning-key', need: 3 },   // 希奧妮篇
  { shard: 'pure-shard',    key: 'pure-key',    need: 3 },   // 雷德篇
  { shard: 'warm-shard',    key: 'warm-key',    need: 3 },   // 諾亞篇
  { shard: 'black-shard',   key: 'black-key',   need: 3 },   // 阿瓦倫篇
  { shard: 'power-shard',   key: 'power-key',   need: 3 },   // 路德篇
  { shard: 'sloth-shard',   key: 'sloth-key',   need: 3 },   // 克莉思篇
  { shard: 'quiet-shard',   key: 'quiet-key',   need: 3 },   // 亞許篇
  { shard: 'spirit-shard',  key: 'spirit-key',  need: 3 },   // 溫特篇（溫特是玩家，碎片的取得方式待定）
  { shard: 'regret-shard',  key: 'regret-key',  need: 3 },   // 艾德林篇
];
