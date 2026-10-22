/* ===== 物品文字（由「🎒 背包編輯器」匯出，整段覆蓋即可）=====
   在背包編輯器改過的物品名稱、說明、效果標籤：物品 id → { name, desc, effect }。
   遊戲載入時會蓋過 data/items.js、data/supplies.js 裡的文字（那兩個檔本身不會被改），商店等其他地方也會跟著變。
   套用的程式在 js/backpack-layout.js。 */
const ITEM_TEXTS = {
  "oyster-omelet": {
    "desc": "沒有什麼蚵仔味但很好吃的阿子煎。"
  },
  "almond-water": {
    "desc": "只能在後室裡得到的飲料，喝了可以讓精神穩定下來。"
  },
  "tomato-soda": {
    "desc": "番茄口味？到底誰會喜歡喝這種東西？"
  },
  "sarsaparilla": {
    "desc": "令人懷念的老味道。"
  },
  "youyou-card": {
    "desc": "捷運用的儲值卡，裡面只剩下一點點的錢，看來只能夠刷一次。"
  },
  "kuai-kuai": {
    "desc": "大家都太迷信了，辦公室裡都是這個傢伙的臉。"
  }
};
