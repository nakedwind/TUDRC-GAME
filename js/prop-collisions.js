/* ===== 地圖物件自帶的行走碰撞（販賣機、營地的箱子）=====
   擋哪幾格在物件編輯器設定（data/prop-collisions.js 的 PROP_COLLISIONS，跟置物箱一樣的做法，js/storage-lockers.js）。
   每局開始（js/game.js 的 newGame）把地圖上這些物件設定的擋路格加進固定牆；換地圖／重開時先拿掉上一次加的。
   物件編輯器裡還沒存到專案的修改也會先套用（讀它存在瀏覽器裡的暫存），方便邊調邊進遊戲試。
*/
// 物件在地圖編輯器用方向鍵微調過位置（ox、oy 像素）：擋路格也照像素對齊圖片，
// 用「不可穿透格的像素微調」（js/maploader.js 的 mapSolidOffsets）記下每格偏了多少，不會只能整格整格跳
let propWallMap = null, propAddedWalls = new Set(), propAddedOffsets = new Set();
function propCollisionList() {
  let edited = []; try { edited = JSON.parse(localStorage.getItem('td-object-editor-v1') || '[]'); } catch (_) {}
  const base = typeof PROP_COLLISIONS !== 'undefined' ? PROP_COLLISIONS : [];
  return base.map(o => (Array.isArray(edited) && edited.find(e => e.id === o.id)) || o);
}
function setupPropCollisions() {
  if (!MAP) return;
  if (propWallMap === MAP) {
    for (const key of propAddedWalls) mapWalls.delete(key);
    if (typeof mapSolidOffsets !== 'undefined') for (const key of propAddedOffsets) delete mapSolidOffsets[key];
  }
  propWallMap = MAP; propAddedWalls = new Set(); propAddedOffsets = new Set();
  if (typeof mapSolidOffsets !== 'undefined' && MAP.solidOffsets && mapSolidOffsets === MAP.solidOffsets) mapSolidOffsets = { ...mapSolidOffsets };   // 別改到地圖資料本身
  const byTile = new Map(propCollisionList().map(o => [o.tile, o]));
  for (const s of MAP.stamps || []) {
    const cfg = byTile.get(s.id), v = cfg && cfg.h; if (!v) continue;
    const ox = s.ox || 0, oy = s.oy || 0;
    const c0 = s.c + Math.floor(ox / CELL), r0 = s.r + Math.floor(oy / CELL);   // 往下取整：剩下的 0～39 像素用像素微調補上
    const off = [ox - Math.floor(ox / CELL) * CELL, oy - Math.floor(oy / CELL) * CELL];
    for (const [dc, dr] of v.solid || []) {
      if (dc < 0 || dr < 0 || dc >= v.w || dr >= v.h) continue;
      const c = c0 + (s.fx ? v.w - 1 - dc : dc), r = r0 + (s.fy ? v.h - 1 - dr : dr), key = c + ',' + r;
      if (!inGrid(c, r) || mapWalls.has(key)) continue;
      mapWalls.add(key); propAddedWalls.add(key);
      if ((off[0] || off[1]) && typeof mapSolidOffsets !== 'undefined' && !mapSolidOffsets[key]) { mapSolidOffsets[key] = off.slice(); propAddedOffsets.add(key); }
    }
  }
}
