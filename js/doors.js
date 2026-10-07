/* ===== 門（data/doors.js 決定哪些素材是門）=====
   - 關著：門板正下方的地板格會擋路（玩家、隊友、怪物都過不去，光也透不過）。
   - 打開：門的圖片直接消失，可以通過。
   - 手動門：溫特走到門前按 Space／E 開關（有人站在門口時不能關）。
   - 自動門：平常關著、玩家打不開；觸發條件達成時自動打開（目前：異質核心醒來）。
*/
const DOOR = { radius: 58, minOverlap: 10 };   // radius＝離門多近可以按 E；minOverlap＝門板蓋到一格多少像素才算擋那格
let mapDoors = [];
let doorAddedWalls = new Set();   // 門加進固定牆的格子（換地圖／重開時先還原）
const isDoorStamp = s => !!(s && typeof DOOR_TILES !== 'undefined' && DOOR_TILES[s.id]);

function setupDoors() {
  for (const k of doorAddedWalls) mapWalls.delete(k);
  doorAddedWalls = new Set();
  mapDoors = [];
  for (const s of (MAP && MAP.stamps) || []) {
    if (!isDoorStamp(s)) continue;
    const t = mapTileById(s.id); if (!t) continue;
    const w = mapTileW(t) * CELL, h = mapTileH(t) * CELL;
    const x0 = OX + s.c * CELL + (s.ox || 0), y0 = OY + s.r * CELL + (s.oy || 0);
    let [p0, p1] = DOOR_TILES[s.id].panel;
    if (s.fx) [p0, p1] = [w - p1, w - p0];
    const left = x0 + p0, right = x0 + p1, bottom = y0 + h - 1;
    const [, row] = cellAt(left, bottom), cells = [];
    for (let c = cellAt(left, bottom)[0]; c <= cellAt(right - 1, bottom)[0]; c++) {
      const overlap = Math.min(right, OX + (c + 1) * CELL) - Math.max(left, OX + c * CELL);
      if (overlap >= DOOR.minOverlap && inGrid(c, row)) cells.push(c + ',' + row);
    }
    // 只管理原本不是牆的格子（編輯器裡畫了不可穿透的格子維持擋路）
    const own = cells.filter(k => !mapWalls.has(k));
    const door = { stamp: s, mode: s.doorMode === 'auto' ? 'auto' : 'manual', open: false, cells, own, sound: DOOR_TILES[s.id].sound || 'door',
      x: (left + right) / 2, y: bottom, top: y0 + 2 };
    for (const k of own) { mapWalls.add(k); doorAddedWalls.add(k); }
    mapDoors.push(door);
  }
}
const doorStampOpen = s => mapDoors.some(d => d.open && d.stamp === s);

function doorOccupied(door) {
  const inDoor = a => a && door.cells.includes(cellAt(a.x, a.y).join(','));
  return inDoor(G.player) || G.towers.some(t => t.hp > 0 && inDoor(t)) || G.npcs.some(inDoor) || G.enemies.some(e => !e.dead && inDoor(e));
}
function setDoorOpen(door, open, silent = false) {
  if (door.open === open) return true;
  if (!open && doorOccupied(door)) return false;   // 有人站在門口，關不起來
  door.open = open;
  for (const k of door.own) { if (open) mapWalls.delete(k); else mapWalls.add(k); }
  computeFlow();
  for (const a of [...G.towers, ...G.npcs]) { a.navPath = null; a.navGoal = null; a.navFailed = false; }
  for (const e of G.enemies) resetEnemyNavigation(e);
  if (!silent && typeof sfxAt === 'function') sfxAt(door.sound, door.x, door.y, .7, 'door');
  return true;
}
// 溫特附近、可以手動開關的門
function doorNearPlayer() {
  const p = G.player; if (!p || p.sitting) return null;
  let best = null, bd = DOOR.radius;
  for (const d of mapDoors) {
    if (d.mode !== 'manual') continue;
    const dd = Math.hypot(d.x - p.x, d.y - CELL / 2 - p.y);
    if (dd < bd) { bd = dd; best = d; }
  }
  return best;
}
function toggleDoorNearPlayer() {
  const door = doorNearPlayer(); if (!door) return false;
  if (!setDoorOpen(door, !door.open)) { sfx('error'); flash('門口有人，關不起來', door.x, door.top, '#ff8f8f'); }
  return true;
}
// 自動門：觸發條件達成時打開（trigger 目前只有 'core-awake'＝異質核心醒來）
function openAutoDoors(trigger) {
  let opened = 0;
  for (const d of mapDoors) if (d.mode === 'auto' && !d.open && setDoorOpen(d, true, opened > 0)) opened++;
  if (opened) systemNotice(trigger === 'core-awake' ? '異質核心甦醒，周圍的門自動打開了！' : '門自動打開了', true);
}
