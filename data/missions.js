/* 任務資料（作戰桌的 Y 區地圖）
   ・回到應變中心後，艾德林（通訊員）會來報告下一個任務；走到 2F 中間的會議桌（作戰桌）按 Space 選任務出擊。
   ・主線＝依序攻略這 5 區（暫定）；打贏一張地圖＝那一區「已控制」，after 裡的區域都控制了，下一區才會開放。
   ・支線（角色委託）在 data/quests.js。
   ・map＝地圖 id（地圖編輯器裡看得到）；map: null＝還沒做好的地圖，會顯示「尚未開放」。
   ・x / y＝在作戰地圖上的位置（0～100，左上角是 0,0）。
   ・艾德林報告任務時說的話：用「對話編輯器」打開艾德林，在「報告任務」那一區修改（存在 data/dialogues.js 的 brief_任務id）。
     新增任務時，在對話編輯器的艾德林頁面會自動多出一格。（亞許改成常駐 2F疏導室，見 js/vitals.js） */
const MISSION_BASE = {
  map: 'map_mu5ad7t2',            // 回來的基地：2F-應變中心
  // 作戰終端：基地地圖上擺了這些素材，靠近（離邊緣 reach 格內）按 Space 就能打開作戰地圖。
  // 第一個是主要的作戰桌（頭上的「作戰」記號、打完回來站在它前面）。label＝靠近時的提示文字。
  terminals: [
    { id: 'tile_hq_command_table', label: '作戰桌' },     // 指揮部的作戰指揮桌
    { id: 'tile_hq_monitor_wall', label: '作戰螢幕' },    // 指揮部牆上的監控大螢幕
  ],
  reach: 1.2,
  table: { c: 33, r: 7, radius: 2.6 },   // 地圖上沒有作戰終端時才用：舊的作戰桌位置（第 c 欄、第 r 列）
  arrive: { c: 33, r: 11 },       // 打完回來時站哪一格；地圖上有作戰終端時，改成站在作戰桌正前方
  briefer: 'eldrin',              // 報告任務的通訊員（隊員或場景 NPC 都可以）
};

// ★ 兵分兩路（艾德林當隊長）的總開關：false＝先不實裝（功能都做好了，只是關著）；改成 true 就打開
//   關著的時候：只有溫特一隊、Z62 也由溫特去、池核只要台北車站大廳控制就開放、溫特的補血疏導照原本的速度和量
//   打開的時候：下面 SQUADS 的設定、池核要兩邊都控制、data/balance.js 的 CARE_STYLE 都會生效
const TWO_SQUADS_ENABLED = false;
// 兵分兩路：溫特和艾德林各帶一隊（js/team.js）
//   任務寫 squad: 'eldrin'＝那一區固定由艾德林隊去（出擊時玩家改操作艾德林，溫特不在場）；沒寫＝溫特隊。
//   有艾德林隊的任務開放之後，出勤配置才會分成兩隊（同一個人只能在一隊）。
//   briefer＝這一隊帶隊回到應變中心時，改由誰來報告任務（艾德林帶隊回來 → 溫特報告，台詞在對話編輯器的溫特「報告任務」）。
const SQUADS = {
  winter: { name: '溫特隊', leader: 'winter' },
  eldrin: { name: '艾德林隊', leader: 'eldrin', briefer: 'winter' },
};

// BOSS 特別獎金：在任務地圖討伐後，回應變中心由通訊員報告並入帳（每次討伐都給，重新出擊再打倒可以再領；js/missions.js）
// flag＝怪物身上用來認出這隻 BOSS 的標記；台詞在對話編輯器的「報告任務」那一區（data/dialogues.js 的 bounty_id，{money}＝金額）
const BOSS_BOUNTIES = [
  { id: 'bird', name: '鳥頭大隊長', flag: 'elite', money: 2000 },         // js/elite-bird-head.js
  { id: 'capKing', name: '順順宮主', flag: 'capKingLord', money: 3000 },   // js/elite-cap-king.js（只算跟核心躲在一起的宮主本人，大夯吉寶不算）
  { id: 'pearl', name: '珍珠大童', flag: 'pearlBoss', money: 3000 },       // js/pearl-elder.js
];

const MISSIONS = [
  {
    // 新手區：打贏，或走出入口看完救援劇情（不管留下還是撤退，js/story-triggers.js）都算控制了
    id: 'y25_entry', map: 'map_a46c5e1a-9802-4db5-a3b9-486b4649c206', name: 'Y25區入口', x: 11, y: 82, after: [],
    desc: 'Y 區的入口。異質體從四處的黑暗角落湧出，先在這裡站穩腳步。',
  },
  {
    id: 'y1', map: 'map_mvtnqrs7', name: 'Y25區地下街', x: 26, y: 69, after: ['y25_entry'],   // id 維持 y1（存檔的進度、艾德林的報告台詞 brief_y1 都用這個）
    desc: '入口往下的地下街，雷德小隊就是在這裡遇上虱目魚小子。異質體聚集得比平常多。',
  },
  {
    id: 'k56', map: 'map_mvvdbiyx', name: 'Z62區地下街', x: 27, y: 44, after: ['y1'], squad: 'eldrin',   // 路線圖上 Y25區地下街往上的下一區；分岔：由艾德林隊去
    desc: 'Y25區地下街再過去的另一段地下街。路邊的機車、腳踏車會突然暴衝，深處還有很強的異質反應。',
  },
  {
    id: 'station', map: 'map_mr4mbd88', name: '台北車站大廳', x: 42, y: 58, after: ['y1'], squad: 'winter',   // 分岔的另一邊：溫特隊
    desc: '地下街後方的大廳，空間開闊，異質體容易從各個方向包夾。',
  },
  {
    id: 'pool', map: 'map_mv1bzur4', name: '池核', x: 58, y: 44, after: TWO_SQUADS_ENABLED ? ['station', 'k56'] : ['station'],   // 兵分兩路打開時：分岔兩邊（台北車站大廳、Z62區地下街）都控制了才開放
    desc: '大廳更深處的異質反應源，核心的反應特別強烈。',
  },
  {
    id: 'zone4', map: null, name: '？？？', x: 74, y: 28, after: ['pool'],   // 第 4 區：地圖做好後填上 map 和名稱
    desc: '池核更深處的區域。應變中心還在收集情報。',
  },
  {
    id: 'deep', map: null, name: 'Y 區最深處', x: 88, y: 12, after: ['zone4'], boss: true,
    desc: '應變中心預測會出現 BOSS 級異質體的地方。控制整個 Y 區之後才能前往。',
  },
];
