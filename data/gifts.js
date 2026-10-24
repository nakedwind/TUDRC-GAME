/* 送禮與好感度資料
   ・在基地裡找角色說話（Space），對話框會出現「🎁 送禮」，把背包裡的零食、飲料送給他。
   ・每次回到基地，每個人最多收 GIFTS_PER_VISIT 次禮物。
   ・想改誰喜歡什麼，改這個檔案；收到禮物、委託時說的話在「對話編輯器」的「送禮與委託」（data/dialogues.js）。
   ・商品 id 對照（data/supplies.js）：
     補給（不能送）：medkit 醫療包、almond-water 杏仁水
     零食：little-noodles 小學麵、cadina 卡迪這、corn-snack 可喜果、kuai-kuai 乖乖、oyster-omelet 阿子煎、
           fish-snack 南海鱈魚香絲、cream-puff 美美小泡芙、spicy-snack 真有味、shrimp-snack 蝦未生、cola 口客
     飲料：water 少喝水、papaya-milk 木瓜牛奶、tea 玉茶元、sarsaparilla 白松沙士、
           tea-collection 吃冰室茶集、asparagus-juice 聿聿蘆筍汁、vegetable-juice 波蜜果菜汁、
           pure-tea 純喫茶、milk-tea MY香奶茶、tomato-soda 番茄西打 */

// 好感度等級：達到 need 點就升到這一級
const FAVOR_LEVELS = [
  { need: 0,   name: '陌生' },
  { need: 20,  name: '熟悉' },
  { need: 50,  name: '信任' },
  { need: 100, name: '羈絆' },
];
// 每種反應加幾點好感
const GIFTS_PER_VISIT = 3;   // 每次回到基地，每個人能收幾次禮物
const GIFT_POINTS = { love: 10, like: 6, normal: 3, dislike: -2 };
const GIFT_REACTION = {
  love:    { label: '最愛',   icon: '💖' },
  like:    { label: '喜歡',   icon: '😊' },
  normal:  { label: '普通',   icon: '🙂' },
  dislike: { label: '不喜歡', icon: '😣' },
};

// ---- 今日想吃委託 ----
// 每次從戰鬥回到基地，隨機 min～max 位角色會說想吃某樣零食飲料（頭上冒出圖示）。
// 照他說的送：好感度 ×favorMul，還會給回憶碎片（REQUEST_SHARDS 裡的人）或異質碎片（其他人，數量 crystals）。
const REQUEST_RULES = { min: 1, max: 3, favorMul: 2, crystals: 15 };
// 誰會給哪種回憶碎片（碎片資料在 data/items.js）；那段回憶的鑰匙已經拼好之後，改給異質碎片
const REQUEST_SHARDS = {
  theonie: 'burning-shard', red: 'pure-shard', noah: 'warm-shard', avaren: 'black-shard', luther: 'power-shard',
  chris: 'sloth-shard', ash: 'quiet-shard', eldrin: 'regret-shard',
  // 溫特（精神的碎片）是玩家自己，不會透過委託拿到，之後再決定取得方式
};
// 想吃的時候說的話、完成委託把碎片交給溫特時說的話：在「對話編輯器」的「送禮與委託」（requestAsk、requestReward）

// 每個角色的喜好。沒列在 love／like／dislike 裡的東西都算「普通」。
// 收到禮物時說的話在「對話編輯器」的「送禮與委託」（giftLove／giftLike／giftNormal／giftDislike／giftCostume）；沒寫就不說。
const GIFT_PREFS = {
  red: {
    love: ['kuai-kuai', 'cola', 'spicy-snack'], like: ['little-noodles', 'corn-snack', 'tomato-soda', 'cadina'], dislike: ['asparagus-juice'],
  },
  theonie: {
    love: ['tea-collection', 'papaya-milk'], like: ['pure-tea', 'cream-puff', 'tea'], dislike: ['little-noodles', 'kuai-kuai'],
  },
  amber: {
    love: ['water'], like: ['pure-tea', 'vegetable-juice', 'corn-snack'], dislike: ['cola', 'spicy-snack'],
  },
  avaren: {
    love: ['cream-puff', 'papaya-milk'], like: ['kuai-kuai', 'milk-tea'], dislike: ['sarsaparilla', 'tomato-soda'],
  },
  luther: {
    love: ['spicy-snack', 'oyster-omelet'], like: ['shrimp-snack', 'cola'], dislike: ['cream-puff'],
  },
  eldrin: {
    love: ['vegetable-juice', 'asparagus-juice'], like: ['water', 'pure-tea'], dislike: ['cola', 'spicy-snack'],
  },
  chris: {
    love: ['milk-tea', 'cadina'], like: ['cola', 'corn-snack', 'shrimp-snack'], dislike: ['water', 'asparagus-juice'],
  },
  tino: {
    love: ['fish-snack'], like: ['milk-tea', 'papaya-milk', 'shrimp-snack'], dislike: ['sarsaparilla', 'tomato-soda'],
  },
  claire: {
    love: ['cream-puff', 'tea-collection'], like: ['milk-tea', 'papaya-milk', 'kuai-kuai'], dislike: ['sarsaparilla'],
  },
  muomn: {
    love: [], like: [], dislike: [],
  },
  noah: {
    love: ['pure-tea', 'tea'], like: ['oyster-omelet'], dislike: ['spicy-snack'],
  },
  ash: {
    // 亞許總是說「都可以」，其實偷偷喜歡木瓜牛奶（連他自己都沒發現）
    love: ['papaya-milk'], like: [], dislike: [],
  },
};
