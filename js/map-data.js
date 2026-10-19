/* ===== 把兩個編輯器的地圖合在一起，給遊戲用 =====
   ・data/maps.js      ＝ 🗺️ 地圖編輯器存的「戰鬥地圖」：BATTLE_TILES（素材）、BATTLE_MAPS（地圖）
   ・data/base-maps.js ＝ 🏠 基地編輯器存的「基地地圖」：BASE_TILES（素材）、BASE_MAPS（地圖）
   遊戲裡照舊用 MAPS_DEFAULT（全部地圖：戰鬥地圖在前、基地在後）、TILES_CUSTOM（全部素材）。
   每張地圖畫圖時用「自己那個編輯器」的素材設定（mapTileCatalog，js/maploader.js 會用），
   所以一邊的編輯器改了素材大小，另一邊的地圖不會跟著變。
   必須在 data/maps.js、data/base-maps.js 之後載入。
*/
const MAP_DATA_BATTLE = { tiles: typeof BATTLE_TILES !== 'undefined' ? BATTLE_TILES : [], maps: typeof BATTLE_MAPS !== 'undefined' ? BATTLE_MAPS : [] };
const MAP_DATA_BASE = { tiles: typeof BASE_TILES !== 'undefined' ? BASE_TILES : [], maps: typeof BASE_MAPS !== 'undefined' ? BASE_MAPS : [] };

const MAPS_DEFAULT = [...MAP_DATA_BATTLE.maps, ...MAP_DATA_BASE.maps];
// 全部素材（同一個 id 兩邊都有時用地圖編輯器那一份）：椅子編輯器等只需要「有哪些素材」的地方用
const TILES_CUSTOM = [...MAP_DATA_BATTLE.tiles, ...MAP_DATA_BASE.tiles.filter(t => !MAP_DATA_BATTLE.tiles.some(b => b.id === t.id))];

// 這張地圖用哪一份素材設定
function mapTileCatalog(map) {
  return MAP_DATA_BASE.maps.includes(map) ? MAP_DATA_BASE.tiles : MAP_DATA_BATTLE.tiles;
}

// 兩個編輯器裡有同一張地圖（同 id）時提醒一下：遊戲只會用到第一張（戰鬥地圖那一份）
(() => {
  const seen = new Set();
  for (const m of MAPS_DEFAULT) {
    if (seen.has(m.id)) console.warn('地圖 id 重複：「' + m.name + '」同時在地圖編輯器和基地編輯器裡，遊戲只會用地圖編輯器那一份');
    seen.add(m.id);
  }
})();
