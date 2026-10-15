/* 任務資料（作戰桌的 Y 區地圖）
   ・回到應變中心後，亞許（通訊員）會來報告下一個任務；走到 2F 中間的會議桌（作戰桌）按 Space 選任務出擊。
   ・主線＝依序攻略這 5 區（暫定）；打贏一張地圖＝那一區「已控制」，after 裡的區域都控制了，下一區才會開放。
   ・支線（角色委託）在 data/quests.js。
   ・map＝地圖 id（地圖編輯器裡看得到）；map: null＝還沒做好的地圖，會顯示「尚未開放」。
   ・x / y＝在作戰地圖上的位置（0～100，左上角是 0,0）。
   ・亞許報告任務時說的話：用「對話編輯器」打開亞許，在「報告任務」那一區修改（存在 data/dialogues.js 的 brief_任務id）。
     新增任務時，在對話編輯器的亞許頁面會自動多出一格。 */
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
  briefer: 'ash',                 // 報告任務的通訊員
};

const MISSIONS = [
  {
    id: 'y1', map: 'Y1', name: '地下街入口', x: 14, y: 82, after: [],
    desc: 'Y 區的入口。異質體從四處的黑暗角落湧出，先在這裡站穩腳步。',
  },
  {
    id: 'station', map: 'map_mr4mbd88', name: '台北車站大廳', x: 34, y: 62, after: ['y1'],
    desc: '入口後方的大廳，空間開闊，異質體容易從各個方向包夾。',
  },
  {
    id: 'pool', map: 'map_mv1bzur4', name: '池核', x: 54, y: 44, after: ['station'],
    desc: '大廳更深處的異質反應源，核心的反應特別強烈。',
  },
  {
    id: 'zone4', map: null, name: '？？？', x: 72, y: 28, after: ['pool'],   // 第 4 區：地圖做好後填上 map 和名稱
    desc: '池核更深處的區域。應變中心還在收集情報。',
  },
  {
    id: 'deep', map: null, name: 'Y 區最深處', x: 86, y: 12, after: ['zone4'], boss: true,
    desc: '應變中心預測會出現 BOSS 級異質體的地方。控制整個 Y 區之後才能前往。',
  },
];
