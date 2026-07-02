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

// ---- 哨兵（砲塔）數值 ----
// range=射程(格) dmg=傷害 rate=每秒攻擊次數 taint=每次攻擊累積的汙染
// splash=範圍傷害半徑(格,0=單體) accuracy=命中率(1=必中) taintRegen=汙染每秒自動下降
const TYPES = {
  theonie: { name: '希奧妮', cost: 50, range: 2.8, dmg: 22, rate: 1.0, taint: 7, splash: 0,   color: '#ff7b39', accuracy: 1.0, taintRegen: 0 },
  amber:   { name: '安柏',   cost: 40, range: 2.2, dmg: 11, rate: 1.2, taint: 5, splash: 1.0, color: '#ffd24a', accuracy: 0.7, taintRegen: 0 },
  red:     { name: '雷德',   cost: 45, range: 1.5, dmg: 16, rate: 1.0, taint: 3, splash: 0,   color: '#ff5b6e', accuracy: 1.0, taintRegen: 6 },
};

// ---- 障礙物（可被打破的牆）----
const BARRIER = {
  cost: 20,      // 放置花多少資源
  hp: 150,       // 障礙物血量
  breakDps: 20,  // 怪物每秒對障礙物造成多少傷害
};

// ---- 暴走 ----
const BERSERK = {
  livesPenalty: 2,  // 哨兵暴走瞬間，營地HP扣多少
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
