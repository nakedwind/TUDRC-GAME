/* ===== 把三個編輯器的地圖合在一起，給遊戲用 =====
   ・data/tiles.js     ＝ 素材庫：三個編輯器共用的磚塊／素材（SHARED_TILES）
   ・data/maps.js      ＝ 🗺️ 地圖編輯器存的「戰鬥地圖」（BATTLE_MAPS）
   ・data/base-maps.js ＝ 🏠 基地編輯器存的「基地地圖」（BASE_MAPS）
   ・data/story-maps.js＝ 📖 劇情地圖編輯器存的「劇情地圖」（STORY_MAPS）
   遊戲裡照舊用 MAPS_DEFAULT、TILES_CUSTOM（全部素材）。
   必須在 data/tiles.js 與三份地圖資料之後載入。
*/
const MAP_DATA_TILES = typeof SHARED_TILES !== 'undefined' ? SHARED_TILES : [];
const MAP_DATA_BATTLE = typeof BATTLE_MAPS !== 'undefined' ? BATTLE_MAPS : [];
const MAP_DATA_BASE = typeof BASE_MAPS !== 'undefined' ? BASE_MAPS : [];
const MAP_DATA_STORY = typeof STORY_MAPS !== 'undefined' ? STORY_MAPS : [];

const MAPS_DEFAULT = [...MAP_DATA_BATTLE, ...MAP_DATA_BASE, ...MAP_DATA_STORY];
const TILES_CUSTOM = MAP_DATA_TILES;

// 這張地圖用哪一份素材設定（js/maploader.js 用）：現在三個編輯器共用同一份素材庫
function mapTileCatalog(map) { return MAP_DATA_TILES; }

// 不同分類裡有同一張地圖 id 時提醒一下：遊戲只會用清單中較前面的那一張。
(() => {
  const seen = new Set();
  for (const m of MAPS_DEFAULT) {
    if (seen.has(m.id)) console.warn('地圖 id 重複：「' + m.name + '」同時存在不同地圖分類，遊戲只會使用清單中較前面的版本');
    seen.add(m.id);
  }
})();
