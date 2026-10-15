/* 支線任務（作戰桌的「支線」分頁）
   ・角色委託：在作戰桌承接 → 出擊時自動計算進度 → 完成後回作戰桌領取獎勵（委託人的好感度也會增加）。
   ・同時進行中的委託最多 SIDE_QUEST_RULES.maxActive 個。
   ・回憶任務不用寫在這裡：拿到某人的第一片回憶碎片時，作戰桌會自動多出「○○的回憶」（碎片在 data/items.js 的 MEMORY_KEYS）。

   每個委託的欄位：
   ・id：英文代號（不要重複，改了之後舊進度會不見）
   ・giver：委託人（角色 id，例如 red、theonie、amber、luther、avaren、eldrin、chris、tino、noah、ash）
   ・name：任務名稱；ask：委託時說的話；thanks：領獎勵時說的話（台詞都是暫定稿，請自由改寫）
   ・goal：目標
       { type: 'kill', monster: 'slime', count: 10 }      打倒怪物（monster 是怪物 id：slime 史萊姆、bird_head 鳥頭人、pearl_kid 珍珠小童、lifeform 生命體、hangi_bao 夯吉寶；不寫＝任何怪物）
       { type: 'openCap', count: 3 }                       打開順順宮帽
       { type: 'breakOre', count: 2 }                      破壞異質礦
       { type: 'breakCore', count: 2 }                     打碎異質核心
       { type: 'winWith', member: 'theonie', count: 1 }    帶某位隊員出擊並打贏（不寫 member＝打贏任何一張戰鬥地圖）
       text：任務板上顯示的目標文字
   ・reward：獎勵 { crystals: 異質碎片數量, items: { 物品id: 數量 }, favor: 委託人好感度 }
     （經費每張地圖都會重設，所以不能當獎勵）
*/
const SIDE_QUEST_RULES = { maxActive: 3 };

const SIDE_QUESTS = [
  {
    id: 'slime-sweep', giver: 'red', name: '史萊姆大掃除',
    ask: '部隊長！地下街的史萊姆越來越多了，黏得我鞋子都是……幫我清掉一些好不好？',
    goal: { type: 'kill', monster: 'slime', count: 10, text: '打倒史萊姆' },
    reward: { crystals: 20, items: { 'kuai-kuai': 1 }, favor: 5 },
    thanks: '哇，清乾淨了！部隊長果然最可靠了！這個給你！',
  },
  {
    id: 'cap-hunt', giver: 'amber', name: '黑暗裡的帽子',
    ask: '報、報告部隊長！巡邏的時候，黑暗裡好像有會發光的帽子……我有點在意，可以幫我查查看嗎？',
    goal: { type: 'openCap', count: 3, text: '打開順順宮帽' },
    reward: { crystals: 25, items: { 'water': 1 }, favor: 5 },
    thanks: '原來帽子裡藏著那種東西……謝謝部隊長！這是我的一點心意！',
  },
  {
    id: 'ore-sample', giver: 'luther', name: '異質礦的樣本',
    ask: '……研究組想要異質礦的碎片。幫我弄碎兩顆就好。',
    goal: { type: 'breakOre', count: 2, text: '破壞異質礦' },
    reward: { crystals: 30, favor: 5 },
    thanks: '……謝了。這些你拿去。',
  },
  {
    id: 'prove-it', giver: 'theonie', name: '證明給我看',
    ask: '聽說你很會指揮？那就帶我出一次任務，然後贏下來。',
    goal: { type: 'winWith', member: 'theonie', count: 1, text: '帶希奧妮出擊並獲勝' },
    reward: { crystals: 20, items: { 'tea-collection': 1 }, favor: 8 },
    thanks: '……哼，還算可以。這個賞你。',
  },
];
