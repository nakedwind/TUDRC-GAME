/* 可開關的門：素材 id → 門板在圖片裡的左右範圍（像素）、開關門音效（js/sfx.js 的音效名稱，沒寫就用「關門」）。
   門關著時，門板正下方那一格（圖片最底下一排）會擋路；打開時門的圖片消失、可以通過。
   每扇門在地圖編輯器選取後可設定：manual＝手動門（玩家按 E 開關）／auto＝自動門（觸發條件達成時自動打開）。 */
const DOOR_TILES = {
  tile_bg_backroom_door_wood: { panel: [19, 61], sound: 'backroomDoor' },   // 後室木門（黃色），80×80，門板在 x 19～60；開關門音效「後室開門」
};
const DOOR_MODES = {
  manual: '自由開關（玩家按 E 開關）',
  random: '隨機開關（不定時自己開、自己關）',
  key: '要後室門鑰匙（用掉一把，開鎖後變成自由開關）',
  chain: '鎖鏈神秘門（要異質鑰匙）',
  auto: '自動門（異質核心醒來時打開）',
};
// 上鎖的門要什麼鑰匙（物品 id，data/items.js）；random：隨機開關的門每隔幾秒（最短～最長）動一次
const DOOR_LOCKS = { key: 'backroom-door-key', chain: 'anomaly-key' };
const DOOR_RANDOM = { every: [10, 30] };
// 應變中心的房門（只是圖，不會開關）：門前沒有出入口的＝鎖住，按空白鍵時溫特會說一句話（js/locked-doors.js）
// 每扇門的台詞可以在地圖編輯器另外寫；沒寫就用 LOCKED_DOOR_TEXT（\n＝換下一句）
const LOCKED_DOOR_TILES = ['tile_eoc_door', 'tile_eoc_security_door', 'tile_containment_glass_door'];
const LOCKED_DOOR_TEXT = '……好像被鎖住了。';
