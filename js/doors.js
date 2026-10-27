/* ===== 門（data/doors.js 決定哪些素材是門）=====
   - 關著：門板最下面兩排的地板格會擋路（玩家、隊友、怪物都過不去，光也透不過；兩排都擋，門板才會跟牆一樣被照亮）。
   - 打開：門的圖片直接消失，可以通過。
   - 手動門：溫特走到門前按 Spacenter 開關（有人站在門口時不能關）。
   - 自動門：平常關著、玩家打不開；觸發條件達成時自動打開（目前：異質核心醒來）。
   - 只是圖片（picture）：永遠關著（一樣擋路），按 Space 沒反應、不顯示提示、不會播開關門音效。
*/
const DOOR = { radius: 58, minOverlap: 10, hug: 12 };   // hug＝門關著時，擋路的下緣在門圖下緣往上幾像素（所有門的預設；data/doors.js 每種門可以另外寫 hug）   // radius＝離門多近可以按 Space；minOverlap＝門板蓋到一格多少像素才算擋那格
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
    // 擋哪一排：門的下緣只跨進下一排不到 minOverlap 像素（例如編輯器裡往下微調了幾像素），就算上一排（真正的門洞），不然門前會多一排擋路
    const [, lastRow] = cellAt(left, bottom), cells = [];
    const row = bottom - (OY + lastRow * CELL) + 1 < DOOR.minOverlap ? lastRow - 1 : lastRow;
    // 擋兩排：門板最下面那排，加上它上面一排（門板有蓋到才算）。光碰到擋路格會停，
    // 只擋一排的話門的上半部照不到燈、黑一塊；兩排都擋，門板就跟兩格高的牆一樣會被照亮。打開時兩排一起放開。
    const rows = [row]; if (row - 1 >= cellAt(left, y0 + DOOR.minOverlap)[1]) rows.push(row - 1);
    for (let c = cellAt(left, bottom)[0]; c <= cellAt(right - 1, bottom)[0]; c++) {
      const overlap = Math.min(right, OX + (c + 1) * CELL) - Math.max(left, OX + c * CELL);
      if (overlap >= DOOR.minOverlap) for (const r of rows) if (inGrid(c, r)) cells.push(c + ',' + r);
    }
    // 只管理原本不是牆的格子（編輯器裡畫了不可穿透的格子維持擋路）
    const own = cells.filter(k => !mapWalls.has(k));
    // hug：門關著時，最下面那排的擋路往上縮幾像素（地圖像素），角色可以走到貼著門的地方（不然會被角色的碰撞半徑卡在離門一小段）
    const hug = DOOR_TILES[s.id].hug ?? DOOR.hug;   // 沒寫就用預設：之後新增的門也一樣能走到貼著門
    // 擋路的下緣對齊「門圖的下緣往上 hug」（門在編輯器裡往下微調過也對得上）；最多移不到一整格
    const hugDy = Math.max(-(CELL - 1), Math.min(CELL - 1, (y0 + h - hug) - (OY + (row + 1) * CELL)));
    if (hug > 0 && hugDy && typeof addStampSolidOffset === 'function') for (const k of own) if (Number(k.split(',')[1]) === row) addStampSolidOffset(k, [0, hugDy]);
    const mode = typeof DOOR_MODES !== 'undefined' && DOOR_MODES[s.doorMode] ? s.doorMode : (DOOR_TILES[s.id].mode || 'manual');   // 素材可以指定預設的門種類
    const door = { stamp: s, mode, open: false, cells, own, sound: DOOR_TILES[s.id].sound || 'door',
      x: (left + right) / 2, y: bottom, top: y0 + 2, left, right, y0,
      rowTopY: OY + Math.min(...rows) * CELL + CELL / 2, rowBotY: OY + row * CELL + CELL / 2,   // 擋路那幾排的中心高度（算「離門多近」用，上下兩邊都能按）
      randomT: mode === 'random' ? doorRandomWait() : 0 };
    if (typeof findChainArt === 'function') door.chainArt = findChainArt(door);   // 疊在門上的鎖鏈圖（js/memory-doors.js）
    if (mode === 'memory' && typeof setupMemoryDoor === 'function') setupMemoryDoor(door);   // 記憶之門：鑰匙、劇情、解開過沒（解開過的一開始就開著，js/memory-doors.js）
    for (const k of own) { if (!door.open) mapWalls.add(k); doorAddedWalls.add(k); }
    mapDoors.push(door);
  }
}
const doorStampOpen = s => mapDoors.some(d => d.open && d.stamp === s);
// ---- 打開時挖空門洞（data/doors.js 的 cutout）：門可以直接放在任何牆上，不用另外畫「牆＋門框」的素材 ----
//   門打開時：① 立體物（牆、柱子…）在門的範圍裡不畫（挖一個洞）；② 地面那一輪最後補畫：門洞裡露出最底下那層地板，再疊上門框。
//   門洞的地板、門框都畫在地面那一輪（角色下面）：門框永遠不會蓋住角色（走過門口、站在門口都一樣）。
//   門框：有給 frameFile（另外畫的門框圖，跟門一樣大、中間透明）就用那張；不然留門圖最外圈 frame 像素（下緣不留，門洞直通地面）。
const doorCutoutOf = s => (s && typeof DOOR_TILES !== 'undefined' && DOOR_TILES[s.id] && DOOR_TILES[s.id].cutout) || null;
function doorCutoutRects(d) {
  const s = d.stamp, cfg = doorCutoutOf(s), t = mapTileById(s.id); if (!cfg || !t) return null;
  const w = mapTileW(t) * CELL, h = mapTileH(t) * CELL, x0 = OX + s.c * CELL + (s.ox || 0), y0 = OY + s.r * CELL + (s.oy || 0);
  let [p0, p1] = DOOR_TILES[s.id].panel || [0, w]; if (s.fx) [p0, p1] = [w - p1, w - p0];
  const f = cfg.frame ?? 2;
  return { s, t, cfg, x0, y0, w, h, outer: { x: x0 + p0, y: y0, w: p1 - p0, h }, inner: { x: x0 + p0 + f, y: y0 + f, w: p1 - p0 - f * 2, h: h - f } };
}
const openCutoutDoors = () => (typeof mapDoors !== 'undefined' ? mapDoors : []).filter(d => d.open && doorCutoutOf(d.stamp)).map(doorCutoutRects).filter(Boolean);
// 畫立體物之前呼叫（js/maploader.js）：跟打開的門重疊、而且在門後面或跟門同一排的（牆）→ 把門的範圍挖掉（呼叫的人負責 restore）
function doorCutoutClip(ctx, x, y, w, h) {
  const holes = openCutoutDoors().filter(R => { const o = R.outer; return x < o.x + o.w && x + w > o.x && y < o.y + o.h && y + h > o.y && y + h <= o.y + o.h + CELL / 2; });
  if (!holes.length) return false;
  ctx.beginPath(); ctx.rect(x - 1, y - 1, w + 2, h + 2); for (const R of holes) ctx.rect(R.outer.x, R.outer.y, R.outer.w, R.outer.h); ctx.clip('evenodd');
  return true;
}
// 地面那一輪最後呼叫（js/maploader.js 的 drawMapGround）：門洞的地板＋門框
function drawOpenDoorsGround(ctx) {
  for (const R of openCutoutDoors()) {
    const { s, t, cfg } = R, patch = cfg.frameFile ? R.outer : R.inner;   // 另外畫的門框：整個門的範圍都先鋪地板，門框圖透明的地方就是地板
    ctx.save(); ctx.beginPath(); ctx.rect(patch.x, patch.y, patch.w, patch.h); ctx.clip();
    const c0 = Math.floor((patch.x - OX) / CELL), c1 = Math.floor((patch.x + patch.w - 1 - OX) / CELL), r0 = Math.floor((patch.y - OY) / CELL), r1 = Math.floor((patch.y + patch.h - 1 - OY) / CELL);
    const overlaps = st => { const tt = mapTileById(st.id); if (!tt) return false; const sx = OX + st.c * CELL + (st.ox || 0), sy = OY + st.r * CELL + (st.oy || 0); return sx < patch.x + patch.w && sx + mapStampW(st, tt) * CELL > patch.x && sy < patch.y + patch.h && sy + mapStampH(st, tt) * CELL > patch.y; };
    let drawn = false;
    for (const lid of MAP_LAYER_ORDER) {   // 只露出最底下那層有東西的地面類圖層（上面那幾層可能是平貼的牆）
      if (lid === 'top' || isOccLayer(lid)) continue;
      const layer = (MAP.layers && MAP.layers[lid]) || {}, cells = [];
      for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) if (layer[c + ',' + r] && !chairConfig(layer[c + ',' + r])) cells.push([c, r, layer[c + ',' + r]]);
      const stamps = (MAP.stamps || []).filter(st => st !== s && (st.layer || 'top') === lid && overlaps(st));
      if (!cells.length && !stamps.length) continue;
      for (const [c, r, id] of cells) drawMapTileImg(ctx, id, OX + c * CELL, OY + r * CELL, lid);
      for (const st of stamps) drawMapStampImg(ctx, st);
      drawn = true; break;
    }
    if (!drawn) { ctx.fillStyle = '#0b0e12'; ctx.fillRect(patch.x, patch.y, patch.w, patch.h); }   // 底下沒鋪地板：黑色門洞
    ctx.restore();
    drawOpenDoorFrame(ctx, R);
  }
}
// 門框（跟門洞一起畫在角色下面）
function drawOpenDoorFrame(ctx, R) {
  const s = R.s;
  const flip = img => { ctx.save(); if (s.fx) { ctx.translate(R.x0 * 2 + R.w, 0); ctx.scale(-1, 1); } ctx.drawImage(img, R.x0, R.y0, R.w, R.h); ctx.restore(); };
  if (R.cfg.frameFile) { const img = tileImage({ id: '__door-frame:' + R.cfg.frameFile, file: R.cfg.frameFile }); if (img) flip(img); return; }
  const img = tileImage(R.t); if (!img) return;
  ctx.save(); ctx.beginPath(); ctx.rect(R.x0, R.y0, R.w, R.h); ctx.rect(R.inner.x, R.inner.y, R.inner.w, R.inner.h); ctx.clip('evenodd');   // 只留外圈
  flip(img); ctx.restore();
}

function doorOccupied(door) {
  const inDoor = a => a && door.cells.includes(cellAt(a.x, a.y).join(','));
  return inDoor(G.player) || G.towers.some(t => t.hp > 0 && inDoor(t)) || G.npcs.some(inDoor) || G.enemies.some(e => !e.dead && inDoor(e));
}
function setDoorOpen(door, open, silent = false) {
  if (door.open === open) return true;
  if (!open && doorOccupied(door)) return false;   // 有人站在門口，關不起來
  door.open = open;
  if (open && typeof hideChainArt === 'function') hideChainArt(door);   // 門的圖片消失，疊在上面的鎖鏈圖也一起消失
  else if (!open && typeof showChainArt === 'function') showChainArt(door);
  for (const k of door.own) { if (open) mapWalls.delete(k); else mapWalls.add(k); }
  computeFlow();
  for (const a of [...G.towers, ...G.npcs]) { a.navPath = null; a.navGoal = null; a.navFailed = false; }
  for (const e of G.enemies) resetEnemyNavigation(e);
  if (!silent && typeof sfxAt === 'function') sfxAt(door.sound, door.x, door.y, .7, 'door');
  return true;
}
// 溫特附近、可以按 Space 的門（手動門，還有上鎖的門：按了會開鎖或說要什麼鑰匙）
const doorLocked = d => d.mode === 'key' || d.mode === 'chain' || (d.mode === 'memory' && !d.unlocked);
const doorKeyItem = d => d.mode === 'memory' ? d.memoryKey : (typeof DOOR_LOCKS !== 'undefined' && DOOR_LOCKS[d.mode]) || null;
function doorNearPlayer() {
  const p = G.player; if (!p || p.sitting) return null;
  let best = null, bd = DOOR.radius;
  for (const d of mapDoors) {
    if (d.mode !== 'manual' && d.mode !== 'memory' && !doorLocked(d)) continue;
    const dd = Math.hypot(d.x - p.x, Math.max(d.rowTopY, Math.min(d.rowBotY, p.y)) - p.y);   // 量到擋路那幾排最近的地方（門擋兩排時，從上方也搆得到）
    if (dd < bd) { bd = dd; best = d; }
  }
  return best;
}
// 提示文字（js/render.js）
function doorPrompt(d) {
  if (d.mode === 'memory' && d.unlocked) return '進入回憶';
  if (!doorLocked(d)) return d.open ? '關門' : '開門';
  const key = itemById(doorKeyItem(d)), have = (supplyInventory.get(doorKeyItem(d)) || 0) > 0;
  if (!key) return '被鎖鏈鎖住了';   // 記憶之門還沒設定鑰匙
  if (d.mode === 'chain' || d.mode === 'memory') return have ? '用' + key.name + '解開鎖鏈' : '被鎖鏈鎖住了（需要' + key.name + '）';
  return have ? '用' + key.name + '開鎖' : '門鎖住了（需要' + key.name + '）';
}
// 沒有鑰匙打不開：轉一下門把，溫特在對話框說話（data/doors.js 的 LOCKED_NEED_KEY_TEXT）；對話框不能開時退回飄字
function lockedNeedKey(x, y, fallback, top) {
  if (typeof sfxAt === 'function') sfxAt('lockedDoor', x, y, .35, 'locked-door');
  if (typeof winterSay === 'function' && winterSay(lockedNeedKeyText())) return;
  sfx('error'); flash(fallback, x, top, '#ffcf89', 1.6);
}
// 上鎖的門：有鑰匙就用掉一把開鎖（之後變成一般的手動門），沒有就說要什麼
function unlockDoor(door) {
  const id = doorKeyItem(door), key = itemById(id), n = supplyInventory.get(id) || 0;
  if (n <= 0) { lockedNeedKey(door.x, door.y, door.mode === 'chain' ? '被鎖鏈鎖住了，需要' + key.name : '門鎖住了，需要' + key.name, door.top); return; }
  if (n <= 1) supplyInventory.delete(id); else supplyInventory.set(id, n - 1);
  const chain = door.mode === 'chain';
  door.mode = 'manual';
  if (chain) dropDoorChains(door);
  if (typeof sfxAt === 'function') sfxAt(chain ? 'chainUnlock' : 'doorUnlock', door.x, door.y, .6, 'door-unlock');   // 音效編輯器可以換
  systemNotice((chain ? '解開了鎖鏈' : '打開了門鎖') + '，消耗 1 支' + key.name);
  setDoorOpen(door, true);
  if (typeof updateHUD === 'function') updateHUD();
  if (typeof saveGame === 'function') saveGame();
}
function toggleDoorNearPlayer() {
  const door = doorNearPlayer(); if (!door) return false;
  if (door.mode === 'memory') { memoryDoorInteract(door); return true; }   // 記憶之門（js/memory-doors.js）
  if (doorLocked(door)) { unlockDoor(door); return true; }
  if (!setDoorOpen(door, !door.open)) { sfx('error'); flash('門口有人', door.x, door.top, '#ff8f8f'); }
  return true;
}
// 自動門：觸發條件達成時打開（trigger 目前只有 'core-awake'＝異質核心醒來）
function openAutoDoors(trigger) {
  let opened = 0;
  for (const d of mapDoors) if (d.mode === 'auto' && !d.open && setDoorOpen(d, true, opened > 0)) opened++;
  if (opened) systemNotice(trigger === 'core-awake' ? '異質核心甦醒，周圍的門自動打開了！' : '門自動打開了', true);
}

// ---- 隨機開關的門：每隔一段時間自己開或關（有人站在門口就晚一點再關）----
function doorRandomWait() { const [a, b] = (typeof DOOR_RANDOM !== 'undefined' ? DOOR_RANDOM.every : [10, 30]); return a + Math.random() * (b - a); }
function updateRandomDoors(dt) {
  for (const d of mapDoors) {
    if (d.mode !== 'random') continue;
    d.randomT -= dt; if (d.randomT > 0) continue;
    if (setDoorOpen(d, !d.open)) d.randomT = doorRandomWait(); else d.randomT = 1.5;
  }
}
// ---- 鎖鏈神秘門、上鎖的門：畫在門上（關著時）；鎖鏈解開時往下掉 ----
function drawDoorLock(ctx, d) {   // 一扇門的鎖鏈＋大鎖（跟門一起排前後）
  if (d.open) return;
  if (d.mode === 'memory') {   // 記憶之門：門上有疊鎖鏈圖就用那張圖，沒有才畫程式的鎖鏈
    if (!d.unlocked && !(d.chainArt || []).length) { drawChainX(ctx, d.left + 2, d.y0 + (d.y - d.y0) * .2, d.right - 2, d.y - 6, 0); drawPadlock(ctx, d.x, d.y0 + (d.y - d.y0) * .55, 1.25, '#b58cff', 0); }
    return;
  }
  const h = d.y - d.y0;
  if (d.mode === 'chain') drawChainX(ctx, d.left + 2, d.y0 + h * .2, d.right - 2, d.y - 6, 0);
  if (d.mode === 'chain' || d.mode === 'key') drawPadlock(ctx, d.x, d.y0 + h * .55, d.mode === 'chain' ? 1.25 : .8, d.mode === 'chain' ? '#b58cff' : '#e9bd62', 0);
}
function drawDoorLocks(ctx) {   // 解開時掉下來的鎖鏈
  if (typeof drawMemoryShards === 'function') drawMemoryShards(ctx);   // 記憶之門碎掉的鎖鏈（js/memory-doors.js）
  for (const f of G.doorChainFx || []) {   // 掉下來的鎖鏈
    const k = f.t / f.life;
    ctx.save(); ctx.globalAlpha = 1 - k; drawChainX(ctx, f.left, f.top + f.drop, f.right, f.bottom + f.drop, f.spin); ctx.restore();
  }
}
function drawChainX(ctx, x0, y0, x1, y1, spin) {
  const link = (ax, ay, bx, by) => {
    const n = Math.max(4, Math.round(Math.hypot(bx - ax, by - ay) / 7));
    for (let i = 0; i <= n; i++) {
      const x = ax + (bx - ax) * i / n, y = ay + (by - ay) * i / n;
      ctx.save(); ctx.translate(x, y); ctx.rotate(Math.atan2(by - ay, bx - ax) + (i % 2 ? Math.PI / 2 : 0) + spin);
      ctx.strokeStyle = '#2a2d33'; ctx.lineWidth = 3.4; ctx.beginPath(); ctx.ellipse(0, 0, 4.2, 2.4, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = '#a8aeb8'; ctx.lineWidth = 1.6; ctx.stroke();
      ctx.restore();
    }
  };
  link(x0, y0, x1, y1); link(x1, y0, x0, y1);
}
function drawPadlock(ctx, x, y, s, color, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.strokeStyle = '#2a2d33'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, -5, 5, Math.PI, 0); ctx.stroke();
  ctx.strokeStyle = '#c7ccd4'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = color; ctx.strokeStyle = '#2a2d33'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.roundRect ? ctx.roundRect(-7, -5, 14, 12, 2) : ctx.rect(-7, -5, 14, 12); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#2a2d33'; ctx.fillRect(-1, -1, 2, 4);
  ctx.restore();
}
function dropDoorChains(d) {
  (G.doorChainFx = G.doorChainFx || []).push({ left: d.left + 2, right: d.right - 2, top: d.y0 + (d.y - d.y0) * .2, bottom: d.y - 6, drop: 0, vy: 0, spin: 0, t: 0, life: .9 });
}
function updateDoorFx(dt) {
  if (typeof updateMemoryShards === 'function') updateMemoryShards(dt);
  if (!G.doorChainFx || !G.doorChainFx.length) return;
  for (const f of G.doorChainFx) { f.t += dt; f.vy += 600 * dt; f.drop += f.vy * dt; f.spin += dt * 1.5; }
  G.doorChainFx = G.doorChainFx.filter(f => f.t < f.life);
}
