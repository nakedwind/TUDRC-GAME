/* 送禮與好感度資料
   ・在基地裡找角色說話（Space／E），對話框會出現「🎁 送禮」，把背包裡的零食、飲料送給他。
   ・每次回到基地，每個人只能收一次禮物。
   ・想改誰喜歡什麼、收到時說什麼，改這個檔案就好。
   ・商品 id 對照（data/supplies.js）：
     零食：little-noodles 小學麵、cadina 卡迪這、corn-snack 可喜果、kuai-kuai 乖乖、oyster-omelet 阿子煎、
           fish-snack 南海鱈魚香絲、cream-puff 美美小泡芙、spicy-snack 真有味、shrimp-snack 蝦未生
     飲料：cola 口客、water 少喝水、papaya-milk 木瓜牛奶、tea 玉茶元、sarsaparilla 白松沙士、
           tea-collection 吃冰室茶集、asparagus-juice 聿聿蘆筍汁、vegetable-juice 波蜜果菜汁、
           pure-tea 純喫茶、milk-tea 麥香奶茶、black-tea 麥香紅茶、green-tea 麥香綠茶、tomato-soda 番茄西打 */

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
    love: ['water', 'green-tea'], like: ['pure-tea', 'vegetable-juice', 'corn-snack'], dislike: ['cola', 'spicy-snack'],
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
    love: ['spicy-snack', 'oyster-omelet'], like: ['shrimp-snack', 'black-tea', 'cola'], dislike: ['cream-puff'],
    lines: {
      love: ['喔！{item}！這個好，夠勁！', '……謝了。這個我真的很喜歡。'],
      like: ['不錯，謝啦。'],
      normal: ['喔，謝了。'],
      dislike: ['{item}……太可愛了吧，這個我不太行……拿給克莉思吧。'],
    },
  },
  eldrin: {
    love: ['vegetable-juice', 'asparagus-juice'], like: ['green-tea', 'water', 'pure-tea'], dislike: ['cola', 'spicy-snack'],
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
    love: ['pure-tea', 'tea'], like: ['black-tea', 'green-tea', 'oyster-omelet'], dislike: ['spicy-snack'],
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
