/* 任務資料（作戰桌的 Y 區地圖）
   ・回到應變中心後，亞許（通訊員）會來報告下一個任務；走到 2F 中間的會議桌（作戰桌）按 Space 選任務出擊。
   ・打贏一張地圖＝那一區「已控制」，after 裡的區域都控制了，下一區才會開放。
   ・map＝地圖 id（地圖編輯器裡看得到）；map: null＝還沒做好的地圖，會顯示「尚未開放」。
   ・x / y＝在作戰地圖上的位置（0～100，左上角是 0,0）。
   ・亞許報告任務時說的話：用「對話編輯器」打開亞許，在「報告任務」那一區修改（存在 data/dialogues.js 的 brief_任務id）。
     新增任務時，在對話編輯器的亞許頁面會自動多出一格。 */
const MISSION_BASE = {
  map: 'map_mu5ad7t2',            // 回來的基地：2F-應變中心
  table: { c: 33, r: 7, radius: 2.6 },   // 作戰桌（會議桌）的位置：第 c 欄、第 r 列，靠近幾格內可以按 Space
  arrive: { c: 33, r: 11 },       // 打完回來時，溫特站在哪一格（作戰桌前）
  briefer: 'ash',                 // 報告任務的通訊員
};

const MISSIONS = [
  {
    id: 'y1', map: 'Y1', name: '地下街入口', x: 22, y: 78, after: [],
    desc: 'Y 區的入口。異質體從四處的黑暗角落湧出，先在這裡站穩腳步。',
  },
  {
    id: 'station', map: 'map_mr4mbd88', name: '台北車站大廳', x: 50, y: 52, after: ['y1'],
    desc: '入口後方的大廳，空間開闊，異質體容易從各個方向包夾。',
  },
  {
    id: 'pool', map: 'map_mv1bzur4', name: '池核', x: 76, y: 34, after: ['station'],
    desc: '大廳更深處的異質反應源，核心的反應特別強烈。',
  },
  {
    id: 'deep', map: null, name: 'Y 區最深處', x: 86, y: 12, after: ['pool'], boss: true,
    desc: '應變中心預測會出現 BOSS 級異質體的地方。控制整個 Y 區之後才能前往。',
  },
];
