/* ===== 物品文字（由「🎒 背包編輯器」匯出，整段覆蓋即可）=====
   在背包編輯器改過的物品名稱、說明、效果標籤：物品 id → { name, desc, effect }。
   遊戲載入時會蓋過 data/items.js、data/supplies.js 裡的文字（那兩個檔本身不會被改），商店等其他地方也會跟著變。
   套用的程式在 js/backpack-layout.js。 */
const ITEM_TEXTS = {};
