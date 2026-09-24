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
  theonie: { name: '希奧妮', rank: 'S', role: '遠程火力', ability: '火焰', cost: 50, range: 5, aggroRange: 12, dmg: 30, rate: 1, taint: 5, splash: 0, color: '#ff7b39', accuracy: 1, taintRegen: 0, walkSpeed: 75, hp: 80, defense: .05, sprite: 'theonie_B', ratings: { combat:5, defense:1, hp:1, load:2 }, burn: { duration:5, damage:5 }, trait: '單體攻擊；使目標燒傷 5 秒，每秒受到一次傷害。' },
  amber:   { name: '安柏', rank: 'C', role: '範圍雷擊', ability: '雷電', cost: 40, range: 5, aggroRange: 12, dmg: 12, rate: .5, taint: 5, splash: 1.3, color: '#ffd24a', accuracy: .6, taintRegen: 0, walkSpeed: 95, hp: 150, defense: .15, sprite: 'amber_B', ratings: { combat:2, defense:2, hp:3, load:2 }, stun: 2, trait: '範圍攻擊；在小片區域降下雷電，使異質體顫抖並停止 2 秒。' },
  red:     { name: '雷德', rank: 'A', role: '前衛防禦', ability: '自癒', cost: 45, range: 1, aggroRange: 18, dmg: 12, rate: 1, taint: 2, splash: 1, color: '#ff5b6e', accuracy: .9, taintRegen: 6, walkSpeed: 85, hp: 240, defense: .45, sprite: 'red_B', ratings: { combat:2, defense:5, hp:5, load:1 }, taunt: 3.2, hpRegen: 4, trait: '範圍攻擊；吸引異質體仇恨，並持續恢復生命與精神負荷。' },
  avaren:  { name: '阿瓦倫', rank: 'S', role: '腐蝕特攻', ability: '腐蝕', cost: 70, range: 2, aggroRange: 12, dmg: 30, rate: .5, taint: 8, splash: 1.1, color: '#5e9bff', accuracy: .9, taintRegen: 0, walkSpeed: 75, hp: 160, defense: .25, sprite: 'avaren_B', ratings: { combat:5, defense:3, hp:3, load:3 }, noAggro: true, confuse: 3, trait: '範圍攻擊；不主動吸引仇恨。腐蝕使異質體混亂 3 秒並攻擊同類。' },
  luther:  { name: '路德', rank: 'A', role: '近戰重擊', ability: '怪力', cost: 55, range: 1, aggroRange: 16, dmg: 24, rate: .5, taint: 8, splash: 1, color: '#6fae55', accuracy: .9, taintRegen: 0, walkSpeed: 80, hp: 160, defense: .25, sprite: 'luther_B', ratings: { combat:4, defense:3, hp:3, load:3 }, taunt: 2.6, knockback: 1, stun: 1, trait: '範圍攻擊；吸引異質體仇恨，擊退 1 格並使其停止 1 秒。' },
  // 嚮導也可編入任務：戰鬥力弱、HP／防禦低，但有「隨身疏導光環」aura（持續降低附近哨兵的負荷）
  eldrin:  { name: '艾德林', rank: 'B', role: '醫療支援', ability: '疏導', cost: 35, range: 5, aggroRange: 8, dmg: 12, rate: 1/3, taint: 0, splash: 0, color: '#2f8a68', accuracy: .9, taintRegen: 0, walkSpeed: 80, hp: 150, defense: .25, sprite: 'eldrin_B', guide: true, aura: { r: 2.8, rate: 6, heal: 6 }, ratings: { guide:3, combat:2, defense:3, hp:3, heal:3 }, evade: 3, trait: '無精神負荷；恢復附近哨兵的生命與精神負荷，遇敵時保持距離。' },
  chris:   { name: '克莉思', rank: 'A', role: '戰鬥嚮導', ability: '疏導', cost: 35, range: 6, aggroRange: 8, dmg: 18, rate: 2/3, taint: 0, splash: 0, color: '#8a97a8', accuracy: 1, taintRegen: 0, walkSpeed: 85, hp: 150, defense: .35, sprite: 'chris_B', guide: true, aura: { r: 2.5, rate: 3, heal: 4 }, ratings: { guide:1, combat:3, defense:4, hp:3, heal:2 }, evade: 3.5, trait: '無精神負荷；恢復附近哨兵的生命與精神負荷，遇敵時保持距離。' },
};

// ---- 出勤隊伍 ----
// 每次任務可帶 TEAM_SIZE 位；ROSTER＝可選名單（對應 TYPES 的 key）；DEFAULT_TEAM＝預設隊伍。
const TEAM_SIZE = 4;
const ROSTER = ['theonie', 'amber', 'red', 'avaren', 'luther', 'eldrin', 'chris'];
const DEFAULT_TEAM = ['theonie', 'amber', 'red', 'luther'];

// ---- 場景 NPC ----
// 只有外觀與自由走動，不參與攻擊、污染、疏導或哨兵指派。
const WANDERERS = [
  { id: 'claire', name: '克萊兒', sprite: 'claire_A' },
  { id: 'mumu',   name: '穆穆',   sprite: 'mumu_A' },
  { id: 'noah',   name: '諾亞',   sprite: 'noah_B' },
];

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
const WANDER_LINES = {
  chris:  ['好累……津貼要是不夠，我可不幹。', '路德呢？剛才明明還在這裡。', '報告晚點再寫啦。', '別走那麼快，等等我。'],
  claire: ['流程我有好好背熟喔！', '第一次實戰……沒問題的！', '安柏今天也在值勤嗎？', '大家要平安回來喔！'],
  luther: ['克莉思又跑去哪了……', '我、我自己檢查裝備就好。', '先離我遠一點，拜託。', '需要搬開什麼就叫我。'],
  mumu:   ['嗚…工作做不完。', '戰鬥辛苦了～', '不想加班...'],
  eldrin: ['平時要記得測量負荷值哦', '今天有按時吃飯嗎？', '累了就休息，不准硬撐。', '藥品用完要記得登記。'],
  noah:   ['要不要聊聊？我很會保密的。', '希奧妮今天心情不錯——大概吧。', '艾德林你別把他寵壞了。', '休息時間也需要一點消息嘛。'],
  avaren: ['……艾德林呢？', '別靠太近。', '我沒有不穩定。', '……離我遠一點'],
  theonie:['這種程度，也值得警報？', '退後，別妨礙我。', '火力沒有失控，是地形太脆弱。', '看清楚了，這才叫效率。'],
  amber:  ['射界確認，開始執行任務。', '非常抱歉！我會重新校正。', '請各位不要進入攻擊範圍。', '克萊兒……她在安全區嗎？'],
  red:    ['嗨！今天也一起加油吧！', '我會擋在前面，放心！', '我的負荷會自己恢復，先照顧別人。', '少一個人受傷都是好事！'],
};
// 戰鬥區專用泡泡台詞。安全區仍使用上面的日常內容。
const BATTLE_WANDER_LINES = {
  theonie: ['保持射界，別站到我前面。', '左側交給我處理。', '異質體正在接近，準備迎擊。', '火焰壓制開始。'],
  red:     ['不要脫離隊形！', '我來擋住牠們！', '後方交給你們了。', '發現異質體，準備接敵！'],
  amber:   ['偵測到異質體反應。', '雷擊座標正在校正。', '請離開落雷範圍。', '確認射界，開始攻擊。'],
  luther:  ['退後，這裡我來擋。', '前方障礙由我清除。', '別讓牠們突破防線。', '目標接近，準備擊退。'],
  avaren:  ['……目標確認。', '別讓牠們靠近艾德林。', '腐蝕已經擴散。', '下一個。'],
  eldrin:  ['負荷升高的人立刻回報。', '有人受傷嗎？不要硬撐。', '維持隊形，我會負責疏導。', '阿瓦倫，不准追得太遠。'],
  chris:   ['需要疏導就快點說。', '別倒下，我可搬不動你們。', '我會顧著後方，專心打。', '嘖，又有異質體過來了。'],
};
const WANDER_TALK = { minGap: 5, maxGap: 13, duration: 3.4 };   // 每隔 5~13 秒說一次、泡泡顯示 3.4 秒
const BATTLE_WANDER_TALK = { minGap: 11, maxGap: 22, duration: 3.2 };

// ---- 玩家主動與 NPC 對話 ----
// 玩家走近角色後按 Space／E 開始對話；陣列中的每一項就是一句台詞。
// 之後要改劇情，只需修改這裡，不必動遊戲主程式。
const NPC_TALK = {
  radius: 66,
  typeSpeed: 24,   // 打字機每個字出現的毫秒數；數字越小越快
};
const NPC_DIALOGUES = {
  chris:  ['你要下地下街？那我也去。先說好，我可不是突然變勤快了。', '作戰津貼那麼高，總不能讓路德一個人把危險的工作全搶走吧。', '走啦，別離我太遠。萬一負荷上升，我還能順手幫你處理。'],
  claire: ['前、前輩好！疏導流程和緊急撤離程序，我都有好好背熟！', '雖然是第一次實戰有一點緊張……但只要照程序來，一定沒問題的。', '那個，您有看到安柏嗎？我只是想確認她有沒有又勉強自己，沒有別的意思喔！'],
  luther: ['有事的話站在那裡說就好，不、不用再靠近了。', '……克莉思也在前線？那傢伙總是亂來。算了，我會看著她。', '前面有東西要清開就叫我。你們別硬撐，我來比較快。'],
  mumu:   ['你終於來找穆穆了！', '剛才那邊傳來好大的聲音……不是穆穆弄的喔。', '等事情結束以後，我們一起去找東西吃吧！'],
  eldrin: ['先站好，讓我看看。你說沒受傷不算，我確認過才算。', '地下街粉塵多，口罩要戴緊；水也要喝。別每次都等到不舒服才說。', '還有，看到阿瓦倫的話請告訴我。他說自己沒事的時候，通常最需要有人陪著。'],
  noah:   ['辛苦了。要不要坐一下？我正好知道幾件能讓你暫時忘記工作的趣事。', '放心，我只聊無傷大雅的部分。至於希奧妮剛才說了什麼……那就得看你想不想聽了。', '不過認真說，如果遇到難溝通的人就來找我吧。先聽懂對方在意什麼，事情通常就好辦多了。'],
  avaren: ['……你不是艾德林。找我做什麼？', '我會待在他看得到的地方。這樣他就不會一直擔心。', '如果我看起來不對勁，別去叫其他人。叫艾德林來……只要他就好。'],
};

// 三位哨兵的主動對話。哨兵暴走時無法交談，要先使用「疏導」。
const SENTRY_DIALOGUES = {
  theonie: ['你特地過來，就是為了確認我的狀態？真是多此一舉。', '我的火力和距離都算得很清楚。只要其他人別擅自闖進射線，就不會有問題。', '需要疏導時我自然會說。現在，把最棘手的目標交給我——別浪費天才的時間。'],
  amber:   ['報告，我已完成裝備與射界檢查，隨時可以接受部署。', '命中誤差仍在容許範圍……我會再校正一次。不能讓隊友因為我的疏忽受傷。', '另外，克萊兒是實習嚮導，請不要把她安排得太靠近前線。這只是安全規定上的建議。'],
  red:     ['你來啦！別擔心，這裡有我守著，大家都很安全。', '我的傷和負荷都會慢慢恢復。疏導名額先留給更需要的人吧，我還撐得住！', '我是小隊長嘛。站在最前面、把大家平安帶回去，本來就是我該做的事。'],
  avaren:  ['……你不是艾德林。找我做什麼？', '我會待在他看得到的地方。這樣他就不會一直擔心。', '如果我看起來不對勁，別去叫其他人。叫艾德林來……只要他就好。'],
  luther:  ['有事的話站在那裡說就好，不、不用再靠近了。', '……克莉思也在前線？那傢伙總是亂來。算了，我會看著她。', '前面有東西要清開就叫我。你們別硬撐，我來比較快。'],
};

// ---- 跟隨行為 ----
// radiusCells＝可自由活動的護衛圈半徑（格）；超出後才會追上對方。
const FOLLOW = {
  avaren: { radiusCells: 4, speed: 96 },  // 阿瓦倫：艾德林周圍 4 格
  red:    { radiusCells: 7, speed: 92 },  // 雷德：溫特周圍 7 格
};

// ---- 可以坐的東西（椅子）----
// 玩家靠近時會冒出「坐」的提示，按 key 坐上去；坐著時會畫在椅子上面，按移動鍵起身。
// tiles：磚塊 id → seatDy＝從圖片頂端往下幾像素當作屁股的位置（愈大愈低）；
//        seatDx＝左右微調（正的往右）；dir＝坐著時角色的朝向。
//        椅子若在編輯器左右翻轉過，seatDx 和 dir 都會自動鏡射，坐的相對位置不變。
const SIT = {
  key: 'e',        // 互動鍵
  radius: 62,      // 離座位多近才會出現提示（像素）
  tiles: {
    tile_new_decor_chair_front:  { seatDy: 25, seatDx: -10, dir: 'front' },
    tile_new_decor_chair_side:   { seatDy: 25, seatDx: -10, dir: 'left' },
    tile_decor_foldingchair:     { seatDy: 24, dir: 'front' },
  },
};

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
