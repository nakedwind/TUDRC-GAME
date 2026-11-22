/* 任務資料（作戰桌的 Y 區地圖）
   ・回到應變中心後，艾德林（通訊員）會來報告下一個任務；走到 2F 中間的會議桌（作戰桌）按 Space 選任務出擊。
   ・主線＝依序攻略這幾區（暫定）；打贏一張地圖＝那一區「已控制」，after 裡的區域「任一個」控制了，下一區就會開放。
     作戰地圖上的連線也是照 after 畫的（after 裡的每一區各連一條線過來）。
   ・locked: true＝路線圖上單獨的點，還沒決定怎麼解鎖，先鎖著（進去過一次就會開放，例如從 R89 搭捷運到 B56）。
   ・metroOnly: true＝只能搭捷運過去：就算開放了、控制了，作戰桌也不能直接出擊（例如 B56、G11、O666 要從 R89 搭捷運）。
   ・metroAfter: [...]＝搭捷運要先控制「全部」這些區域，列車才可能開到這一站（例如 O666 要 R89、B56、G11 都控制）。
     捷運互通的車站名單在 data/mrt-train.js 的 stations；搭車時從「條件達成的其他站」隨機挑一站（js/mrt-train.js 的 mrtPickDestination）。
   ・hidden: true＝鎖著的時候名字顯示成「？？？」，開放後才露出真名。
   ・off: true＝整個先藏起來：作戰地圖、T-Pad、主線進度、對話編輯器都當作沒有這一區（連線也不畫）。要顯示時拿掉 off 就好。
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
//   關著的時候：只有溫特一隊、Z62 也由溫特去、溫特的補血疏導照原本的速度和量
//   打開的時候：下面 SQUADS 的設定、data/balance.js 的 CARE_STYLE 都會生效
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
  { id: 'gourdKing', name: '葫蘆猴王', flag: 'gourdKing', money: 3000 },   // js/gourd-king.js（金額是預設，待確認）
  { id: 'mothBoss', name: '人面蝶后', flag: 'mothBoss', money: 3000 },     // js/moth-boss.js（金額是預設，待確認）
  { id: 'ratKing', name: '花蓮老鼠王', flag: 'ratKing', money: 3000 },     // js/rat-king.js（金額是預設，待確認）
];

const MISSIONS = [
  {
    // 新手區：打贏，或走出入口看完救援劇情（不管留下還是撤退，js/story-triggers.js）都算控制了
    id: 'y25_entry', map: 'map_a46c5e1a-9802-4db5-a3b9-486b4649c206', name: 'Y25區入口', x: 11, y: 83, after: [],
    desc: 'Y 區的入口。異質體從四處的黑暗角落湧出，先在這裡站穩腳步。',
  },
  {
    id: 'y1', map: 'map_mvtnqrs7', name: 'Y25區地下街', x: 26, y: 73, after: ['y25_entry'],   // id 維持 y1（存檔的進度、艾德林的報告台詞 brief_y1 都用這個）
    desc: '入口往下的地下街，雷德小隊就是在這裡遇上虱目魚小子。異質體聚集得比平常多。',
  },
  {
    id: 'k56', map: 'map_mvvdbiyx', name: 'Z62區地下街', x: 27, y: 55, after: ['y1'], squad: 'eldrin',   // 路線圖上 Y25區地下街往上的下一區；分岔：由艾德林隊去
    desc: 'Y25區地下街再過去的另一段地下街。路邊的機車、腳踏車會突然暴衝，深處還有很強的異質反應。',
  },
  {
    // Z62區地下街再分岔出去的兩區：Z62 控制了，這兩區就同時開放（跟 Z62 一樣歸艾德林隊）
    id: 'f307', map: 'map_mw2dn6re', name: 'F307區森林', x: 34, y: 37, after: ['k56'], squad: 'eldrin',
    desc: 'Z62區地下街往外延伸出去的森林區，農田和大草地長滿了異常的植物。',
  },
  {
    id: 'r89', map: 'map_mvxz356e', name: 'R89區捷運站', x: 46, y: 49, after: ['k56'], squad: 'eldrin',
    desc: 'Z62區地下街連過去的捷運站，月台和軌道深處有異質體出沒。',
  },
  {
    id: 'pool', map: 'map_mv1bzur4', name: '池核', x: 44, y: 67, after: ['y1', 'r89'],   // Y25區地下街、R89區捷運站任一個控制了就開放（兩條路都通往池核）
    desc: '大廳更深處的異質反應源，核心的反應特別強烈。',
  },
  {
    id: 'zone4', map: null, name: '？？？', x: 65, y: 60, after: ['pool'], off: true,   // 池核右邊的區域：地圖做好後填上 map 和名稱；先藏起來（off），要顯示時拿掉
    desc: '池核更深處的區域。應變中心還在收集情報。',
  },
  {
    // B56 藍線捷運站：路線圖上單獨一個點（先鎖著；從 R89 搭捷運進去過就會開放）。只能搭捷運去，作戰桌不能直接出擊（metroOnly）
    id: 'b56', map: 'map_mwizzi7s', name: 'B56區捷運站', x: 58, y: 31, after: [], locked: true, metroOnly: true,
    desc: '藍線的捷運站，跟 R89 之間有捷運互通。',
  },
  {
    // G11 綠線捷運站：B56 右下方單獨一個點（先鎖著；從別站搭捷運進去過就會開放，只能搭捷運去）。BOSS 是虱目魚王（js/milkfish-king.js）
    id: 'g11', map: 'map_mwm655e8', name: 'G11區捷運站', x: 76, y: 47, after: [], locked: true, metroOnly: true,
    desc: '綠線的捷運站，核心旁邊守著巨大的虱目魚王。',
  },
  {
    // O666 橘線捷運站：右上角，連到 Y 區最深處（先鎖著；R89、B56、G11 都控制後，捷運才可能開到這站；只能搭捷運去）。BOSS 是花蓮老鼠王（js/rat-king.js）
    //   原本這個位置是「台北車站大廳」（id: station），搬到最右上角的 Y 區最深處（id: deep）了
    id: 'o666', map: 'map_691cf40a-884b-423d-b1df-beef88b16f00', name: 'O666區捷運站', x: 76, y: 27, after: [], locked: true, metroOnly: true, metroAfter: ['r89', 'b56', 'g11'],
    desc: '橘線的捷運站，上方月台的列車被花蓮老鼠王卡住了。',
  },
  {
    // Y 區最深處＝台北車站大廳（O666 控制了就開放；O666 的紅色列車也是開到這裡）
    id: 'deep', map: 'map_mr4mbd88', name: '台北車站大廳', x: 89, y: 12, after: ['o666'], boss: true,
    desc: 'Y 區最深處的大廳，應變中心預測會出現 BOSS 級異質體。空間開闊，異質體容易從各個方向包夾。',
  },
].filter(m => !m.off);   // off: true 的區域先藏起來，遊戲和編輯器都看不到
