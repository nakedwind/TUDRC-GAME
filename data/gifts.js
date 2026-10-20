/* 送禮與好感度資料
   ・在基地裡找角色說話（Space），對話框會出現「🎁 送禮」，把背包裡的零食、飲料送給他。
   ・每次回到基地，每個人只能收一次禮物。
   ・想改誰喜歡什麼、收到時說什麼，改這個檔案就好。
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
// ask＝想吃的時候說的話（{item} 會換成商品名稱）；reward＝完成委託時，把碎片交給溫特說的話
const REQUEST_LINES = {
  red:     { ask: ['部隊長～我好想吃{item}喔……', '欸欸，今天好想吃{item}！'], reward: '啊對了！這個給你！在地下街撿到的，亮晶晶的，我也不知道能幹嘛。' },
  theonie: { ask: ['……我現在想吃{item}。不是要你去買的意思。'], reward: '……這是在地下街撿到的碎片。我也不知道能幹嘛，給你吧。' },
  avaren:  { ask: ['……{item}。……想吃。'], reward: '……撿到的。……給你。' },
  luther:  { ask: ['今天……有點想吃{item}。'], reward: '這個……在地下街撿到的。我不知道能幹嘛，你拿去吧。' },
  chris:   { ask: ['好想吃{item}喔～部隊長幫我買嘛～'], reward: '欸，這個給你～在地下街撿到的，我懶得研究它是什麼了。' },
  amber:   { ask: ['那、那個……如果方便的話，我想吃{item}……'], reward: '這是我巡邏時撿到的，請部隊長收下！' },
  eldrin:  { ask: ['最近有點想吃{item}呢。'], reward: '這個給您，在地下街撿到的，說不定用得上。' },
  tino:    { ask: ['……{item}。……沒什麼，我只是說說。'], reward: '……撿到的。拿去。' },
  claire:  { ask: ['部隊長！我好想吃{item}！'], reward: '這個送你！是我在地下街撿到的喔！' },
  muomn:   { ask: ['有點想吃{item}。'], reward: '這個給您。' },
  noah:    { ask: ['說到這個，好久沒吃{item}了呢。'], reward: '這是我在地下街撿到的，送給部隊長吧。' },
  ash:     { ask: ['……{item}……好像，還不錯。'], reward: '……撿到的。都可以，給你。' },
};

// 每個角色的喜好與台詞。沒列在 love／like／dislike 裡的東西都算「普通」。
// lines 裡每種反應可以寫好幾句，送禮時會隨機挑一句；{item} 會換成禮物名稱。
const GIFT_PREFS = {
  red: {
    love: ['kuai-kuai', 'cola', 'spicy-snack'], like: ['little-noodles', 'corn-snack', 'tomato-soda', 'cadina'], dislike: ['asparagus-juice'],
    lines: {
      love: ['哇！是{item}！部隊長你怎麼知道我最喜歡這個！我會好好珍惜的……好啦我現在就要吃！', '{item}！！今天是什麼好日子！'],
      like: ['謝啦！{item}我很喜歡喔！'],
      normal: ['給我的嗎？謝謝部隊長！'],
      dislike: ['呃……{item}……沒、沒關係！心意最重要！（吞口水）'],
    },
  },
  theonie: {
    love: ['tea-collection', 'papaya-milk'], like: ['pure-tea', 'cream-puff', 'tea'], dislike: ['little-noodles', 'kuai-kuai'],
    lines: {
      love: ['……哼，{item}。算你有眼光。', '你倒是挺懂我的品味。'],
      like: ['還不錯，我收下了。'],
      normal: ['嗯，放著吧。'],
      dislike: ['{item}？這是給小孩吃的吧。'],
    },
  },
  amber: {
    love: ['water'], like: ['pure-tea', 'vegetable-juice', 'corn-snack'], dislike: ['cola', 'spicy-snack'],
    lines: {
      love: ['謝謝部隊長！{item}是我最喜歡的！我會好好喝的！', '真、真的可以收下嗎？謝謝您！'],
      like: ['謝謝您，我很喜歡！'],
      normal: ['謝謝部隊長的關心！'],
      dislike: ['謝、謝謝……不過我平常盡量不吃這種的……'],
    },
  },
  avaren: {
    love: ['cream-puff', 'papaya-milk'], like: ['kuai-kuai', 'milk-tea'], dislike: ['sarsaparilla', 'tomato-soda'],
    lines: {
      love: ['……{item}。……可以分艾德林一半嗎。', '……喜歡。'],
      like: ['……嗯。'],
      normal: ['……'],
      dislike: ['……（推回來）'],
    },
  },
  luther: {
    love: ['spicy-snack', 'oyster-omelet'], like: ['shrimp-snack', 'cola'], dislike: ['cream-puff'],
    lines: {
      love: ['喔！{item}！這個好，夠勁！', '……謝了。這個我真的很喜歡。'],
      like: ['不錯，謝啦。'],
      normal: ['喔，謝了。'],
      dislike: ['{item}……太可愛了吧，這個我不太行……拿給克莉思吧。'],
    },
  },
  eldrin: {
    love: ['vegetable-juice', 'asparagus-juice'], like: ['water', 'pure-tea'], dislike: ['cola', 'spicy-snack'],
    lines: {
      love: ['{item}！好健康的選擇！部隊長也要記得多喝喔。', '謝謝您，這個我很喜歡。'],
      like: ['謝謝部隊長，您也要好好吃飯喔。'],
      normal: ['謝謝您的心意。'],
      dislike: ['{item}……這個糖分太高了啦！部隊長自己也少吃一點！'],
    },
  },
  chris: {
    love: ['milk-tea', 'cadina'], like: ['cola', 'corn-snack', 'shrimp-snack'], dislike: ['water', 'asparagus-juice'],
    lines: {
      love: ['欸——{item}！部隊長好懂我～今天可以不出任務嗎？', '耶～我最愛這個了！'],
      like: ['謝啦～'],
      normal: ['喔，謝謝～'],
      dislike: ['{item}……沒味道的東西不行啦……'],
    },
  },
  tino: {
    love: ['fish-snack'], like: ['milk-tea', 'papaya-milk', 'shrimp-snack'], dislike: ['sarsaparilla', 'tomato-soda'],
    lines: {
      love: ['……{item}。……不要盯著我看。（偷偷收進口袋）', '……哼。這個，還可以。'],
      like: ['……嗯，收下了。'],
      normal: ['……幹嘛突然給我東西。'],
      dislike: ['{item}……味道好重，拿開。'],
    },
  },
  claire: {
    love: ['cream-puff', 'tea-collection'], like: ['milk-tea', 'papaya-milk', 'kuai-kuai'], dislike: ['sarsaparilla'],
    lines: {
      love: ['哇啊！{item}！部隊長最好了！', '是{item}耶！我可以拍照嗎！'],
      like: ['謝謝部隊長～！'],
      normal: ['謝謝您！'],
      dislike: ['唔……{item}有點……不過謝謝部隊長！'],
    },
  },
  muomn: {
    love: [], like: [], dislike: [],
    lines: {
      love: ['謝謝，我很喜歡。'],
      like: ['謝謝。'],
      normal: ['謝謝您。'],
      dislike: ['……謝謝。'],
    },
  },
  noah: {
    love: ['pure-tea', 'tea'], like: ['oyster-omelet'], dislike: ['spicy-snack'],
    lines: {
      love: ['{item}！謝謝部隊長，正好想泡杯茶跟大家聊聊天呢。', '這個我很喜歡，謝謝您。'],
      like: ['謝謝部隊長，您真貼心。'],
      normal: ['謝謝您的禮物。'],
      dislike: ['啊，{item}……我不太能吃辣，不過謝謝您。'],
    },
  },
  ash: {
    // 亞許總是說「都可以」，其實偷偷喜歡木瓜牛奶（連他自己都沒發現）
    love: ['papaya-milk'], like: [], dislike: [],
    lines: {
      love: ['……謝謝。……（多看了{item}好幾眼）', '……都可以的。……不過，這個好像……還不錯。'],
      like: ['謝謝，都可以。'],
      normal: ['謝謝。都可以的。'],
      dislike: ['謝謝。都可以。'],
    },
  },
};
