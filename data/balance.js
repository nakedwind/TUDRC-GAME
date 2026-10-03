/* ===== 全域遊戲數值 =====
   起始資源、編隊人數、疏導與光照等共通規則放在這裡。
   個別人物的能力、圖片、介紹和台詞請改 data/characters.js。
*/

// ---- 起始資源與嚮導能量 ----
const START = {
  money: 150,      // 起始資源
  guide: 100,      // 嚮導能量（用來疏導哨兵）
  guideMax: 100,   // 嚮導能量上限
  guideRegen: 9,   // 嚮導能量每秒回復
};

// ---- 疏導（點哨兵降汙染）----
const SOOTHE = {
  cost: 30,   // 每次疏導花多少嚮導能量
  heal: 55,   // 每次疏導降多少汙染值
};

// ---- 角色資料相容入口 ----
// 哨兵與嚮導的原始數值集中在 data/characters.js；這裡建立遊戲既有的 TYPES 介面。
// range=射程(格) dmg=傷害 rate=每秒攻擊次數 taint=每次攻擊累積的汙染
// splash=範圍傷害半徑(格,0=單體) accuracy=命中率(1=必中) taintRegen=汙染每秒自動下降
// walkSpeed=走路速度(像素/秒) hp=生命值
// sprite=角色造型資料夾（images/character/ 底下，例如 'red_B'）；沒填就畫成色塊
const TYPES = Object.fromEntries(Object.values(CHARACTERS)
  .filter(character => character.combat)
  .map(character => [character.id, { ...character.combat, name: character.name, sprite: character.sprite }]));

// ---- 出勤隊伍 ----
// 每次任務可帶 TEAM_SIZE 位；ROSTER＝可選名單（對應 TYPES 的 key）；DEFAULT_TEAM＝預設隊伍。
const TEAM_SIZE = 4;
const ROSTER = ['theonie', 'amber', 'red', 'avaren', 'luther', 'eldrin', 'chris', 'tino'];
const DEFAULT_TEAM = ['theonie', 'amber', 'red', 'luther'];

// ---- 場景 NPC ----
// 只有外觀與自由走動，不參與攻擊、污染、疏導或哨兵指派。
const WANDERERS = Object.values(CHARACTERS)
  .filter(character => character.kind === 'support')
  .map(({ id, name, sprite }) => ({ id, name, sprite }));

// ===== 章節 =====
// 目前進行到第幾章。下面三張對話表（泡泡／NPC 對話／哨兵對話）都可依章節不同。
// 想切章節：改這個數字，或在遊戲中呼叫 setChapter(n)（日後可由劇情自動推進）。
let CHAPTER = 1;
function setChapter(n) { CHAPTER = Math.max(1, n | 0); }
// 從一個「台詞項目」取出目前章節該用的台詞：
//   陣列          → 直接用（不分章節，現有寫法照舊）
//   { 章節: 陣列 } → 取「≤ 目前章節」的最大章節（中間沒寫的章節自動沿用前一次）
function chapterPick(entry) {
  if (Array.isArray(entry)) return entry;
  if (!entry || typeof entry !== 'object') return null;
  let best = null, bestCh = -Infinity;
  for (const k in entry) { const ch = +k; if (!isNaN(ch) && ch <= CHAPTER && ch > bestCh) { bestCh = ch; best = entry[k]; } }
  if (best) return best;
  bestCh = Infinity;   // 目前章節比所有定義都早 → 退而用最小章節那組
  for (const k in entry) { const ch = +k; if (!isNaN(ch) && ch < bestCh) { bestCh = ch; best = entry[k]; } }
  return best;
}

// ---- 場景 NPC 平時會冒出的對話（頭上泡泡框）----
// 想改台詞就編輯這裡：每個角色一組句子，系統會隨機挑一句、每隔幾秒說一次。
// 沒列在這裡的角色就不會說話。
const WANDER_LINES = Object.fromEntries(Object.values(CHARACTERS)
  .filter(character => character.dialogues.idle.length)
  .map(character => [character.id, character.dialogues.idle]));
// 戰鬥區專用泡泡台詞。安全區仍使用上面的日常內容。
const BATTLE_WANDER_LINES = Object.fromEntries(Object.values(CHARACTERS)
  .filter(character => character.dialogues.battle.length)
  .map(character => [character.id, character.dialogues.battle]));
const WANDER_TALK = { minGap: 5, maxGap: 13, duration: 3.4 };   // 每隔 5~13 秒說一次、泡泡顯示 3.4 秒
const BATTLE_WANDER_TALK = { minGap: 11, maxGap: 22, duration: 3.2 };

// ---- 玩家主動與 NPC 對話 ----
// 玩家走近角色後按 Space／E 開始對話；陣列中的每一項就是一句台詞。
// 之後要改劇情，只需修改這裡，不必動遊戲主程式。
const NPC_TALK = {
  radius: 66,
  typeSpeed: 24,   // 打字機每個字出現的毫秒數；數字越小越快
};
const NPC_DIALOGUES = Object.fromEntries(Object.values(CHARACTERS)
  .filter(character => character.dialogues.npc.length)
  .map(character => [character.id, character.dialogues.npc]));

// 三位哨兵的主動對話。哨兵暴走時無法交談，要先使用「疏導」。
const SENTRY_DIALOGUES = Object.fromEntries(Object.values(CHARACTERS)
  .filter(character => character.dialogues.sentry.length)
  .map(character => [character.id, character.dialogues.sentry]));

// ---- 跟隨行為 ----
// radiusCells＝可自由活動的護衛圈半徑（格）；超出後才會追上對方。
const FOLLOW = Object.fromEntries(Object.values(CHARACTERS)
  .filter(character => character.follow)
  .map(character => [character.id, character.follow]));

// ---- 原地巡邏 ----
// 哨兵設成「在原地巡邏」時，只追崗位周圍 holdChaseCells 格內的怪物；怪物跑遠就回崗位。
const PATROL = {
  holdChaseCells: 6,
};

// ---- 跟隨護衛（點左上角隊員頭像 →「跟隨護衛部隊長」）----
// radiusCells＝離部隊長多遠以內算「在身邊」（格），超過就追上來；
// chaseCells＝看到怪物時，最多離開部隊長幾格去追打，怪跑遠就回到身邊。
const ESCORT = {
  radiusCells: 2.5,
  chaseCells: 5,
};

// ---- 坐下互動的共通操作 ----
// 每張椅子的深度、碰撞與坐下位置改在 data/chairs.js 設定。
const SIT = {
  key: 'e',        // 互動鍵
  radius: 62,      // 離座位多近才會出現提示（像素）
};

// ---- 障礙物（可被打破的牆）----
const BARRIER = {
  cost: 20,           // 放置花多少資源（地圖內建的可破壞格用這組）
  hp: 150,            // 障礙物血量
  breakInterval: 3,   // 怪物每隔幾秒攻擊建築一次
  breakDmg: 60,       // 每次攻擊對建築造成多少傷害
};

// 玩家可放置的障礙物資料已移到 data/objects.js，可用「物件編輯器.html」調整。


// ---- 黑暗與光源（後室一片漆黑，要靠光源照亮）----
// 規則：黑暗中的怪物「看不到」（哨兵仍打得到）；建築與哨兵「只能放在亮處」。
// 想暫時關掉黑暗系統：把 enabled 改成 false。
const LIGHT = {
  enabled: true,
  darkness: 0.98,    // 黑暗濃度（0～1，越大越黑；留一點點可隱約看到地形輪廓）
  playerR: 140,      // 玩家（嚮導）身上的光圈半徑（像素）
  campR: 120,        // 營地每一格的光圈半徑
  baseR: 300,        // 基地本體的常亮範圍
  baseLampR: 190,    // 基地四角燈的獨立光圈半徑
  buildings: {       // 會發光的建築：物件id → 光圈半徑（放這裡不會被物件編輯器匯出洗掉）
    searchlight: 300,
    camping_lights: 120,
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
