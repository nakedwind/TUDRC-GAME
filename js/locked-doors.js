// ============================================================
//  鎖住的門（應變中心的房門）：沒有接到任何地圖的門＝打不開
//  ・哪些素材算房門：data/doors.js 的 LOCKED_DOOR_TILES。門前面有出入口（通往別的地圖）的就照常進去，不算鎖住。
//  ・走到門前按空白鍵／E：下方跳出跟 NPC 一樣的對話框，溫特說一句（預設 LOCKED_DOOR_TEXT；
//    地圖編輯器選那扇門可以另外寫台詞，存在擺放物件的 lockText，\n＝換下一句）。
// ============================================================
let lockedDoorCache = null;
function lockedDoorSpots() {
  if (!MAP || typeof LOCKED_DOOR_TILES === 'undefined') return [];
  if (lockedDoorCache && lockedDoorCache.map === MAP && lockedDoorCache.portals === mapPortals) return lockedDoorCache.list;
  const list = [];
  for (const s of MAP.stamps || []) {
    if (!LOCKED_DOOR_TILES.includes(s.id)) continue;
    const t = mapTileById(s.id); if (!t) continue;
    const w = mapTileW(t), h = mapTileH(t);
    // 門板範圍（含門前一排）裡有出入口：這扇門通往別的地圖，不是鎖住的
    const hasPortal = (mapPortals || []).some(p => p.c >= s.c && p.c < s.c + w && p.r >= s.r && p.r <= s.r + h);
    if (hasPortal) continue;
    const x0 = OX + s.c * CELL + (s.ox || 0), y0 = OY + s.r * CELL + (s.oy || 0);
    list.push({ stamp: s, x: x0 + w * CELL / 2, top: y0, bottom: y0 + h * CELL });
  }
  lockedDoorCache = { map: MAP, portals: mapPortals, list };
  return list;
}
function lockedDoorNearPlayer() {
  const p = G && G.player; if (!p || p.sitting || p.hp <= 0) return null;
  let best = null, bd = CELL * 1.3;
  for (const d of lockedDoorSpots()) {
    if (p.y < d.bottom - 10) continue;   // 要站在門前面
    const dist = Math.hypot(d.x - p.x, d.bottom - p.y);
    if (dist < bd) { bd = dist; best = d; }
  }
  return best;
}
function tryLockedDoorNearPlayer() {
  const d = lockedDoorNearPlayer(); if (!d || typeof openTextDialogue !== 'function') return false;
  if (typeof sfxAt === 'function') sfxAt('lockedDoor', d.x, d.bottom, .35, 'locked-door');   // 轉一下門把（小聲；音效編輯器可以換）
  const text = d.stamp.lockText || (typeof LOCKED_DOOR_TEXT !== 'undefined' ? LOCKED_DOOR_TEXT : '……好像被鎖住了。');
  const face = typeof playerSprites !== 'undefined' && playerSprites.front && playerSprites.front[0];
  openTextDialogue({ name: (typeof CHARACTERS !== 'undefined' && CHARACTERS.winter && CHARACTERS.winter.name) || '溫特',
    image: face ? face.src : '', lines: String(text).split('\n').filter(Boolean), kind: 'winter' });
  return true;
}
