/* ===== 素材碰撞方框（物件編輯器「🧱 素材碰撞」設定）=====
   每一張素材可以設好幾個擋路的方框（像素，不用對齊格子）。設好之後，地圖、基地上這張素材不管貼幾個，都是一樣的碰撞：
     ・擋溫特、隊員、怪物走路（js/maploader.js 的 solidBlocksPoint、js/pathfinding.js 的 nudgedWallAt），建築也不能蓋在方框上（js/build.js）
     ・人物遮擋線：地圖上那個物件沒有手動設「人物遮擋線」的話，自動用方框的中間（js/maploader.js 的 mapOccluders）
       ——人的腳在中線以上就被物件蓋住，以下就畫在物件前面（人走不進方框裡，所以不會穿幫）
     ・地圖編輯器、基地編輯器顯示紅格時，也會畫出這些方框（橘色）
   資料：data/tile-collisions.js 的 TILE_COLLISIONS＝{ 素材 id: [[x, y, 寬, 高], …] }
     x, y, 寬, 高＝像素，以「沒翻轉、沒轉向、沒放大」的素材左上角為原點（素材寬 w 格＝w × 40 像素）。
   物件編輯器裡還沒存到專案的修改，會先存在這個瀏覽器（TILE_COLLISION_DRAFT，只記改過的素材），遊戲和編輯器都會疊上去，方便邊調邊試。 */
const TILE_COLLISION_DRAFT = 'tudrc_tile_collisions_draft_v1';
const TILE_COLLISION_CELL = 40;
let tileCollisionCache = { raw: undefined, data: {} };
function tileCollisionData() {
  let raw = null; try { raw = localStorage.getItem(TILE_COLLISION_DRAFT); } catch (_) {}
  if (raw === tileCollisionCache.raw) return tileCollisionCache.data;
  const base = typeof TILE_COLLISIONS !== 'undefined' ? TILE_COLLISIONS : {};
  let draft = null; try { draft = raw ? JSON.parse(raw) : null; } catch (_) {}
  const data = { ...base };   // 草稿只記改過的素材（null＝拿掉碰撞），蓋在正式資料上：別人更新了專案檔，沒改過的素材照樣跟著新的
  if (draft && typeof draft === 'object') for (const [id, boxes] of Object.entries(draft)) { if (Array.isArray(boxes) && boxes.length) data[id] = boxes; else delete data[id]; }
  tileCollisionCache = { raw, data };
  return data;
}
const tileCollisionBoxes = id => { const b = tileCollisionData()[id]; return Array.isArray(b) && b.length ? b : null; };

// 素材本身的方框 → 放在地圖上那個物件的方框（翻轉、轉向 90 度、放大都算進去；斜轉的角度不算）
// tw, th＝素材沒轉向時的像素寬高；x, y＝物件左上角（含微調）；回傳 [[x0, y0, x1, y1], …]
function tileCollisionPlace(boxes, s, tw, th, x, y) {
  const rot = ((Number(s && s.rot) || 0) % 4 + 4) % 4, dw = rot % 2 ? th : tw, dh = rot % 2 ? tw : th;
  const k = typeof stampScaleOf === 'function' ? stampScaleOf(s) : 1, cx = x + dw / 2;
  const turn = (u, v) => rot === 1 ? [-v, u] : rot === 2 ? [-u, -v] : rot === 3 ? [v, -u] : [u, v];   // 畫圖時是先翻轉、再轉（canvas 的 rotate 是順時針）
  return boxes.map(([bx, by, bw, bh]) => {
    let u0 = bx - tw / 2, v0 = by - th / 2, u1 = u0 + bw, v1 = v0 + bh;
    if (s && s.fx) [u0, u1] = [-u1, -u0];
    if (s && s.fy) [v0, v1] = [-v1, -v0];
    const a = turn(u0, v0), b = turn(u1, v1);
    let X0 = x + dw / 2 + Math.min(a[0], b[0]), X1 = x + dw / 2 + Math.max(a[0], b[0]);
    let Y0 = y + dh / 2 + Math.min(a[1], b[1]), Y1 = y + dh / 2 + Math.max(a[1], b[1]);
    if (k !== 1) {   // 放大：以圖片底部中央為基準（跟 js/stamp-transform.js 一樣）
      X0 = cx + (X0 - cx) * k; X1 = cx + (X1 - cx) * k;
      Y0 = y + dh - (y + dh - Y0) * k; Y1 = y + dh - (y + dh - Y1) * k;
    }
    return [X0, Y0, X1, Y1];
  });
}
// ---- 手動的人物遮擋線（物件編輯器「🧱 素材碰撞」頁的「人物遮擋線」）----
// 每張素材可以直接指定：離圖片頂端幾像素（沒翻轉、沒放大的素材），不一定要有碰撞方框；有設就優先用，沒設才用方框的中間
// 資料：data/tile-collisions.js 的 TILE_DEPTHS＝{ 素材 id: 像素 }；還沒存到專案的修改先存在這個瀏覽器（TILE_DEPTH_DRAFT，null＝拿掉）
const TILE_DEPTH_DRAFT = 'tudrc_tile_depths_draft_v1';
let tileDepthCache = { raw: undefined, data: {} };
function tileDepthData() {
  let raw = null; try { raw = localStorage.getItem(TILE_DEPTH_DRAFT); } catch (_) {}
  if (raw === tileDepthCache.raw) return tileDepthCache.data;
  const data = { ...(typeof TILE_DEPTHS !== 'undefined' ? TILE_DEPTHS : {}) };
  let draft = null; try { draft = raw ? JSON.parse(raw) : null; } catch (_) {}
  if (draft && typeof draft === 'object') for (const [id, v] of Object.entries(draft)) { if (Number.isFinite(v)) data[id] = v; else delete data[id]; }
  tileDepthCache = { raw, data };
  return data;
}
const tileManualDepth = id => { const v = tileDepthData()[id]; return Number.isFinite(v) ? v : null; };
// 人物遮擋線離物件頂端幾像素（沒放大前；給 stampDepthY 用）：手動設的優先，沒有就用碰撞方框（全部合起來）上下的中間；都沒有＝null
function tileCollisionDepthPx(s, tw, th) {
  const manual = tileManualDepth(s.id);
  if (manual != null) {   // 手動：上下翻轉、轉 180 度時從另一頭量
    const rot = ((Number(s && s.rot) || 0) % 4 + 4) % 4, flip = !!(s && s.fy) !== (rot === 2);
    const d = Math.max(0, Math.min(th, manual));
    if (rot % 2) return d / (th || 1) * tw;   // 轉 90 度的物件（高度變成原本的寬）：照比例放（0＝頂端、設滿＝底部，跟沒轉的一樣）
    return flip ? th - d : d;
  }
  const boxes = tileCollisionBoxes(s.id); if (!boxes) return null;
  const k = typeof stampScaleOf === 'function' ? stampScaleOf(s) : 1;
  if (k !== 1) { const t = { ...s, scale: 100 }; return tileCollisionDepthPx(t, tw, th); }   // 先用沒放大的算，stampDepthY 會再照比例放
  const placed = tileCollisionPlace(boxes, s, tw, th, 0, 0);
  const y0 = Math.min(...placed.map(b => b[1])), y1 = Math.max(...placed.map(b => b[3]));
  return (y0 + y1) / 2;
}

// ---- 門口：牆的方框在門的地方留一條通道 ----
// 池核的門是直接貼在整排牆上的（打開時挖空門洞，data/doors.js 的 cutout），牆本身是連著的。
// 所以跟門重疊的牆方框，在門的左右範圍裡（直的門；橫的門＝上下範圍）整條都不擋，門口照原本的紅格和門自己的開關擋路（js/doors.js）。
// stamps＝地圖上的物件；sizeOf(s)＝那個物件畫出來的 [寬, 高]（像素）；回傳每扇門的 [x0, y0, x1, y1]
function tileDoorRects(stamps, sizeOf) {
  const C = typeof CELL !== 'undefined' ? CELL : TILE_COLLISION_CELL, out = [];
  for (const s of stamps || []) {
    const isDoor = (typeof DOOR_TILES !== 'undefined' && DOOR_TILES[s.id]) || (typeof MRT_EXIT_TILES !== 'undefined' && MRT_EXIT_TILES.includes(s.id));
    if (!isDoor) continue;
    const size = sizeOf(s); if (!size) continue;
    const x = OX + s.c * C + (s.ox || 0), y = OY + s.r * C + (s.oy || 0);
    out.push([x, y, x + size[0], y + size[1]]);
  }
  return out;
}
// 這個方框 [x0, y0, x1, y1] 要在哪些地方留通道（給 tileBoxInHole 用）；沒碰到門＝null
function tileBoxHoles(x0, y0, x1, y1, doors) {
  const holes = [];
  for (const [a, b, c, d] of doors) {
    if (a >= x1 || c <= x0 || b >= y1 || d <= y0) continue;   // 沒碰到這扇門
    holes.push(d - b >= c - a ? [a, -Infinity, c, Infinity] : [-Infinity, b, Infinity, d]);
  }
  return holes.length ? holes : null;
}
const tileBoxInHole = (b, x, y) => !!b.holes && b.holes.some(h => x >= h[0] && x < h[2] && y >= h[1] && y < h[3]);

// ---- 遊戲：這張地圖上所有素材方框（照格子分好，查得快）----
let tileBoxIndex = { map: null, n: -1, raw: undefined, grid: new Map() };
function tileBoxGrid() {
  if (typeof MAP === 'undefined' || !MAP) return null;
  const stamps = MAP.stamps || [];
  tileCollisionData();
  if (tileBoxIndex.map === MAP && tileBoxIndex.n === stamps.length && tileBoxIndex.raw === tileCollisionCache.raw) return tileBoxIndex.grid;
  const grid = new Map(), C = typeof CELL !== 'undefined' ? CELL : TILE_COLLISION_CELL;
  const doors = tileDoorRects(stamps, s => { const t = typeof mapTileById === 'function' ? mapTileById(s.id) : null; return t ? [mapStampW(s, t) * C, mapStampH(s, t) * C] : null; });
  for (const s of stamps) {
    const boxes = tileCollisionBoxes(s.id); if (!boxes) continue;
    const t = typeof mapTileById === 'function' ? mapTileById(s.id) : null; if (!t) continue;
    const f2 = typeof stampOn2F === 'function' && typeof hasFloors !== 'undefined' && hasFloors && stampOn2F(s);
    for (const [x0, y0, x1, y1] of tileCollisionPlace(boxes, s, mapTileW(t) * C, mapTileH(t) * C, OX + s.c * C + (s.ox || 0), OY + s.r * C + (s.oy || 0))) {
      const box = { x0, y0, x1, y1, s, f2, holes: tileBoxHoles(x0, y0, x1, y1, doors) };
      for (let c = Math.floor((x0 - OX) / C); c * C + OX < x1; c++) for (let r = Math.floor((y0 - OY) / C); r * C + OY < y1; r++) {
        const key = c + ',' + r; if (!grid.has(key)) grid.set(key, []); grid.get(key).push(box);
      }
    }
  }
  tileBoxIndex = { map: MAP, n: stamps.length, raw: tileCollisionCache.raw, grid };
  return grid;
}
const tileBoxActive = b => !(typeof G !== 'undefined' && G && G.mapDestroyed && G.mapDestroyed.has(b.s))   // 被打壞的、打開的門：不擋
  && !(typeof doorStampOpen === 'function' && doorStampOpen(b.s))
  && (b.f2 ? typeof floorCtx !== 'undefined' && floorCtx === 2 : !(typeof floorCtx !== 'undefined' && floorCtx === 2));   // 2 樓的物件只擋 2 樓的人
// 這個點有沒有撞到素材方框
function tileBoxBlocksPoint(x, y) {
  const grid = tileBoxGrid(); if (!grid || !grid.size) return false;
  const C = CELL, list = grid.get(Math.floor((x - OX) / C) + ',' + Math.floor((y - OY) / C)); if (!list) return false;
  for (const b of list) if (x >= b.x0 && x < b.x1 && y >= b.y0 && y < b.y1 && !tileBoxInHole(b, x, y) && tileBoxActive(b)) return true;
  return false;
}
// 這一格能不能蓋建築：格子中心在方框裡就不行
function tileBoxCoversCell(c, r) { return tileBoxBlocksPoint(OX + c * CELL + CELL / 2, OY + r * CELL + CELL / 2); }

// ---- 編輯器：顯示紅格時畫出素材方框（橘色）----
// tileOf(id)＝編輯器自己的找素材函式；tilePx(t)＝[寬, 高] 像素
function drawTileCollisionOverlay(ctx, stamps, tileOf, tilePx, ox = 0, oy = 0, isHidden = null) {
  ctx.save();
  ctx.lineWidth = 2; ctx.strokeStyle = '#ffa63a'; ctx.fillStyle = 'rgba(255,150,40,.28)';
  for (const s of stamps || []) {
    if (isHidden && isHidden(s)) continue;
    const boxes = tileCollisionBoxes(s.id); if (!boxes) continue;
    const t = tileOf(s.id); if (!t) continue;
    const [tw, th] = tilePx(t);
    for (const [x0, y0, x1, y1] of tileCollisionPlace(boxes, s, tw, th, ox + s.c * TILE_COLLISION_CELL + (s.ox || 0), oy + s.r * TILE_COLLISION_CELL + (s.oy || 0))) {
      ctx.fillRect(x0, y0, x1 - x0, y1 - y0); ctx.strokeRect(x0 + 1, y0 + 1, x1 - x0 - 2, y1 - y0 - 2);
    }
  }
  ctx.restore();
}
