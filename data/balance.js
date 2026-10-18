/* ===== 全域遊戲數值 =====
   起始資源、編隊人數、疏導與光照等共通規則放在這裡。
   個別人物的能力、圖片、介紹和台詞請改 data/characters.js。
*/

// ---- 起始資源與嚮導能量 ----
const START = {
  money: 3000,     // 作戰經費（每張戰鬥地圖可以在地圖編輯器的規則裡改）
  guide: 100,      // 嚮導能量（用來疏導哨兵）
  guideMax: 100,   // 嚮導能量上限
  guideRegen: 9,   // 嚮導能量每秒回復（目前停用：SP 只能靠杏仁水恢復，見 js/sanity.js 的 SANITY.autoRegen）
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
// ---- 基地裡每個人平時在哪張地圖、哪一區（可依章節不同）：在 data/npc-locations.js ----
// ---- 放建築的範圍：只能蓋在溫特幾格以內（量到建築最近的那一格）----
const BUILD_RANGE = 6;
// ---- 減速建築（不擋路，走在上面會變慢）----
// 建築 id → 速度倍率：enemy＝怪物、ally＝溫特和隊員（0.1＝剩 10%，也就是 −90%）
// wear＝怪物踩在上面時，每 every 秒磨掉 dmg HP（每隻怪各算一次；磨到 0 就壞掉）
// 放這裡不會被物件編輯器匯出洗掉
const SLOW_BUILDINGS = {
  wirecloth: { enemy: .1, ally: .5, wear: { every: 2, dmg: 10 } },   // 鐵絲網：怪物 −90%、我軍 −50%；一隻怪每 2 秒磨掉 10，500 HP 約 100 秒壞掉
};
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
// 台詞都在 data/dialogues.js（用「對話編輯器.html」編輯）；舊的角色檔若還有 dialogues 也能讀
const dialogueEntry = (character, key) =>
  (typeof DIALOGUES !== 'undefined' && DIALOGUES.characters?.[character.id]?.[key]) || character.dialogues?.[key] || [];
const hasDialogue = v => Array.isArray(v) ? v.length > 0 : !!(v && typeof v === 'object');
const dialogueTable = key => Object.fromEntries(Object.values(CHARACTERS)
  .map(character => [character.id, dialogueEntry(character, key)]).filter(([, v]) => hasDialogue(v)));
const WANDER_LINES = dialogueTable('idle');
// 戰鬥區專用泡泡台詞。安全區仍使用上面的日常內容。
const BATTLE_WANDER_LINES = dialogueTable('battle');
const WANDER_TALK = { minGap: 5, maxGap: 13, duration: 3.4 };   // 每隔 5~13 秒說一次、泡泡顯示 3.4 秒
const BATTLE_WANDER_TALK = { minGap: 11, maxGap: 22, duration: 3.2 };

// ---- 玩家主動與 NPC 對話 ----
// 玩家走近角色後按 Space／E 開始對話；陣列中的每一項就是一句台詞。
// 之後要改劇情，只需修改這裡，不必動遊戲主程式。
const NPC_TALK = {
  radius: 66,
  typeSpeed: 24,   // 打字機每個字出現的毫秒數；數字越小越快
};
const NPC_DIALOGUES = dialogueTable('npc');

// 三位哨兵的主動對話。哨兵暴走時無法交談，要先使用「疏導」。
const SENTRY_DIALOGUES = dialogueTable('sentry');

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
  darkness: 1,       // 黑暗濃度（1＝全黑；光照區仍會正常顯示）
  playerLightOn: false,   // 玩家身上的光暈：先關閉（之後要啟用改成 true）
  playerR: 140,      // 玩家（嚮導）身上的光圈半徑（像素；playerLightOn 為 true 時生效）
  poweredLampR: 250, // 電源控制日光燈：比探照燈 300 像素小
  poweredLampIntensity: .85, // 相對亮度
  campR: 120,        // 營地每一格的光圈半徑
  baseR: 300,        // 基地本體的常亮範圍
  baseLampR: 190,    // 基地四角燈的獨立光圈半徑
  buildings: {       // 會發光的建築：物件id → 光圈半徑（放這裡不會被物件編輯器匯出洗掉）
    searchlight: 300,
    camping_lights: 120,
  },
  placeMargin: 150,  // 發光建築（探照燈）可以蓋在「光圈邊緣往外再多這麼多像素」的範圍內
  buildMargin: 40,   // 一般建築可以蓋在光圈外多遠（像素；40＝1 格）。0＝每個擋路格都要亮
};

// ===== 整體難度（2026-10-11 依玩家回饋：難度降低一半）=====
// 1＝原本的難度。調小＝變簡單，調大＝變難。
const DIFFICULTY = {
  spawnRate: 0.5,      // 怪物出現的量：0.5＝核心召喚間隔變兩倍、場上怪物上限減半、巨型史萊姆登場間隔變兩倍
  monsterHp: 1,        // 怪物血量倍率（所有怪物，包含史萊姆各種類、鳥頭人）
  monsterDamage: 1,    // 怪物攻擊力倍率（打玩家、哨兵、建築）
};
const difficultyOf = key => (typeof DIFFICULTY !== 'undefined' && Number(DIFFICULTY[key]) > 0) ? Number(DIFFICULTY[key]) : 1;
