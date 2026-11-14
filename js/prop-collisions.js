/* ===== 地圖物件自帶的行走碰撞（販賣機、營地的箱子、扭蛋機、夾娃娃機）=====
   擋哪幾格在物件編輯器設定（data/prop-collisions.js 的 PROP_COLLISIONS，跟置物箱一樣的做法，js/storage-lockers.js）。
   每局開始（js/game.js 的 newGame）把地圖上這些物件設定的擋路格加進固定牆；換地圖／重開時先拿掉上一次加的。
   物件編輯器裡還沒存到專案的修改也會先套用（讀它存在瀏覽器裡的暫存），方便邊調邊進遊戲試。
   放在 2 樓的物件（圖層名稱有「2樓」，js/maploader.js 的 stampOn2F）：落在「2樓地面」上的擋路格改加進「2 樓碰撞」
   （js/pathfinding.js 的 floor2Solid），只擋 2 樓的人、不擋底下一樓的人；沒落在 2 樓地面上的格子照舊算一樓的牆。
   手扶梯連接 1、2 樓，落在 2 樓地面上的格子兩層都擋。
   （一樓的固定牆 2 樓的人本來就不理，以前 2 樓的物件加進一樓的牆，所以在 2 樓完全不擋路）
*/
// 物件在地圖編輯器用方向鍵微調過位置（ox、oy 像素）：擋路格也照像素對齊圖片，
// 用「不可穿透格的像素微調」（js/maploader.js 的 mapSolidOffsets）記下每格偏了多少，不會只能整格整格跳
let propWallMap = null, propAddedWalls = new Set(), propAddedOffsets = new Set(), propAddedWalls2F = new Set();
function propCollisionList() {
  let edited = []; try { edited = JSON.parse(localStorage.getItem('td-object-editor-v1') || '[]'); } catch (_) {}
  const base = typeof PROP_COLLISIONS !== 'undefined' ? PROP_COLLISIONS : [];
  return base.map(o => (Array.isArray(edited) && edited.find(e => e.id === o.id)) || o);
}
// 地圖上每個物件設定的每一個擋路格都叫一次 fn(格子, 像素微調, 是不是 2 樓地面上的格子, 是不是兩層都要擋)
function eachPropSolidCell(fn) {
  const byTile = new Map(propCollisionList().map(o => [o.tile, o]));
  for (const s of MAP.stamps || []) {
    const cfg = byTile.get(s.id), v = cfg && cfg.h; if (!v) continue;
    const ox = s.ox || 0, oy = s.oy || 0;
    const on2F = typeof hasFloors !== 'undefined' && hasFloors && typeof stampOn2F === 'function' && stampOn2F(s);   // 放在 2 樓圖層的物件
    const both = typeof escalatorSpec === 'function' && !!(escalatorSpec(s.id) || escalatorSideSpec(s.id));   // 手扶梯連接 1、2 樓：扶手、外殼兩層的人都擋
    // 四捨五入到最近的格子，剩下的 ±半格用像素微調補上（往下取整的話，往上微調幾像素就會整塊跑到上一列，可能剛好疊在牆上被略過）
    const c0 = s.c + Math.round(ox / CELL), r0 = s.r + Math.round(oy / CELL);
    const off = [ox - Math.round(ox / CELL) * CELL, oy - Math.round(oy / CELL) * CELL];
    for (const [dc, dr] of v.solid || []) {
      if (dc < 0 || dr < 0 || dc >= v.w || dr >= v.h) continue;
      const c = c0 + (s.fx ? v.w - 1 - dc : dc), r = r0 + (s.fy ? v.h - 1 - dr : dr), key = c + ',' + r;
      if (inGrid(c, r)) fn(key, off, on2F && deckCells.has(key), both);
    }
  }
}
function setupPropCollisions() {
  if (!MAP) return;
  if (propWallMap === MAP) {
    for (const key of propAddedWalls) mapWalls.delete(key);
    if (typeof floor2Solid !== 'undefined') for (const key of propAddedWalls2F) floor2Solid.delete(key);
    if (typeof mapSolidOffsets !== 'undefined') for (const key of propAddedOffsets) delete mapSolidOffsets[key];
  }
  propWallMap = MAP; propAddedWalls = new Set(); propAddedOffsets = new Set(); propAddedWalls2F = new Set();
  if (typeof mapSolidOffsets !== 'undefined' && MAP.solidOffsets && mapSolidOffsets === MAP.solidOffsets) mapSolidOffsets = { ...mapSolidOffsets };   // 別改到地圖資料本身
  eachPropSolidCell((key, off, deck2F, both) => {
    let added = false;
    if (deck2F && !floor2Solid.has(key)) { floor2Solid.add(key); propAddedWalls2F.add(key); added = true; }   // 2 樓地面上的格子：擋 2 樓
    if ((!deck2F || both) && !mapWalls.has(key)) { mapWalls.add(key); propAddedWalls.add(key); added = true; }   // 其他的（和手扶梯）：擋 1 樓
    if (!added) return;
    if ((off[0] || off[1]) && typeof mapSolidOffsets !== 'undefined' && !mapSolidOffsets[key]) { mapSolidOffsets[key] = off.slice(); propAddedOffsets.add(key); }
  });
}
// 接回保存的戰場（js/combat-progress.js 的 reclaimAddedWalls，不會跑 newGame）：一樓的牆跟著存檔還原了，2 樓碰撞沒有跟著存，這裡補回去
function restorePropCollisions2F() {
  if (!MAP || typeof floor2Solid === 'undefined') return;
  propWallMap = MAP; propAddedWalls2F = new Set();
  eachPropSolidCell((key, off, deck2F) => { if (deck2F && !floor2Solid.has(key)) { floor2Solid.add(key); propAddedWalls2F.add(key); } });
}
