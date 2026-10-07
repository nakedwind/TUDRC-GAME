/* 可開關的門：素材 id → 門板在圖片裡的左右範圍（像素）、開關門音效（js/sfx.js 的音效名稱，沒寫就用「關門」）。
   門關著時，門板正下方那一格（圖片最底下一排）會擋路；打開時門的圖片消失、可以通過。
   每扇門在地圖編輯器選取後可設定：manual＝手動門（玩家按 E 開關）／auto＝自動門（觸發條件達成時自動打開）。 */
const DOOR_TILES = {
  tile_bg_backroom_door_wood: { panel: [19, 61], sound: 'backroomDoor' },   // 後室木門（黃色），80×80，門板在 x 19～60；開關門音效「後室開門」
};
const DOOR_MODES = {
  manual: '手動門（玩家按 E 開關）',
  auto: '自動門（異質核心醒來時打開）',
};
