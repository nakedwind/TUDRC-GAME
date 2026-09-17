/* ===== 遊戲數值設定（你最常調整的地方）=====
   想讓遊戲更難或更簡單、調整哨兵強弱、資源多寡，都在這個檔案改就好。
   這裡「只是資料」，不含程式邏輯，改起來很安全。
*/

// ---- 起始資源與嚮導能量 ----
const START = {
  money: 150,      // 起始資源
  lives: 12,       // 營地HP（被怪物攻進會扣，歸零就失敗）
  guide: 100,      // 嚮導能量（用來疏導哨兵）
  guideMax: 100,   // 嚮導能量上限
  guideRegen: 9,   // 嚮導能量每秒回復
};

// ---- 疏導（點哨兵降汙染）----
const SOOTHE = {
  cost: 30,   // 每次疏導花多少嚮導能量
  heal: 55,   // 每次疏導降多少汙染值
};

// ---- 哨兵數值 ----
// 哨兵是「人」：一個名字只有一位，會在亮處走動巡邏。
// range=射程(格) dmg=傷害 rate=每秒攻擊次數 taint=每次攻擊累積的汙染
// splash=範圍傷害半徑(格,0=單體) accuracy=命中率(1=必中) taintRegen=汙染每秒自動下降
// walkSpeed=走路速度(像素/秒) hp=生命值
// sprite=角色造型資料夾（images/character/ 底下，例如 'red_B'）；沒填就畫成色塊
const TYPES = {
  theonie: { name: '希奧妮', cost: 50, range: 2.8, dmg: 22, rate: 1.0, taint: 7, splash: 0,   color: '#ff7b39', accuracy: 1.0, taintRegen: 0, walkSpeed: 75, hp: 100, sprite: 'theonie_B' },
  amber:   { name: '安柏',   cost: 40, range: 2.2, dmg: 11, rate: 1.2, taint: 5, splash: 1.0, color: '#ffd24a', accuracy: 0.7, taintRegen: 0, walkSpeed: 95, hp: 100, sprite: 'amber_B' },
  red:     { name: '雷德',   cost: 45, range: 1.5, dmg: 16, rate: 1.0, taint: 3, splash: 0,   color: '#ff5b6e', accuracy: 1.0, taintRegen: 6, walkSpeed: 85, hp: 100, sprite: 'red_B' },
};

// ---- 場景 NPC ----
// 只有外觀與自由走動，不參與攻擊、污染、疏導或哨兵指派。
const WANDERERS = [
  { id: 'chris',  sprite: 'chris_B' },
  { id: 'claire', sprite: 'claire_A' },
  { id: 'luther', sprite: 'luther_B' },
  { id: 'mumu',   sprite: 'mumu_A' },
];

// ---- 障礙物（可被打破的牆）----
const BARRIER = {
  cost: 20,           // 放置花多少資源（地圖內建的可破壞格用這組）
  hp: 150,            // 障礙物血量
  breakInterval: 3,   // 怪物每隔幾秒攻擊建築一次
  breakDmg: 60,       // 每次攻擊對建築造成多少傷害
};

// 玩家可放置的障礙物資料已移到 data/objects.js，可用「物件編輯器.html」調整。

// ---- 暴走 ----
const BERSERK = {
  livesPenalty: 2,  // 哨兵暴走瞬間，營地HP扣多少
};

// ---- 黑暗與光源（後室一片漆黑，要靠光源照亮）----
// 規則：黑暗中的怪物「看不到」（哨兵仍打得到）；建築與哨兵「只能放在亮處」。
// 想暫時關掉黑暗系統：把 enabled 改成 false。
const LIGHT = {
  enabled: true,
  darkness: 0.98,    // 黑暗濃度（0～1，越大越黑；留一點點可隱約看到地形輪廓）
  playerR: 140,      // 玩家（嚮導）身上的光圈半徑（像素）
  campR: 120,        // 營地每一格的光圈半徑
  buildings: {       // 會發光的建築：物件id → 光圈半徑（放這裡不會被物件編輯器匯出洗掉）
    searchlight: 280,
  },
  placeMargin: 150,  // 發光建築（探照燈）可以蓋在「光圈邊緣往外再多這麼多像素」的範圍內
};

// ---- 波次設定 ----
// 共 total 波，難度會隨波數遞增（血量、速度變高，間隔變短）
const WAVE_CFG = {
  total: 5,
  baseCount: 8, addCount: 3,     // 第i波怪物數量 = baseCount + i*addCount
  baseHp: 40, addHp: 28,         // 第i波血量   = baseHp + i*addHp
  baseSpeed: 44, addSpeed: 5,    // 第i波速度   = baseSpeed + i*addSpeed
  reward: 8,                     // 殺一隻怪回多少資源
  baseGap: 0.85, subGap: 0.05,   // 出怪間隔（秒）= baseGap - i*subGap
};
