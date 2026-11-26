/* ===== 素材碰撞方框（物件編輯器「🧱 素材碰撞」設定）=====
   每一張素材可以設好幾個擋路的方框（像素，不用對齊格子）。設好之後，地圖、基地上這張素材不管貼幾個，都是一樣的碰撞：
     ・擋溫特、隊員、怪物走路（js/maploader.js 的 solidBlocksPoint、js/pathfinding.js 的 nudgedWallAt），建築也不能蓋在方框上（js/build.js）
     ・人物遮擋線：地圖上那個物件沒有手動設「人物遮擋線」的話，自動用方框的中間（js/maploader.js 的 mapOccluders）
       ——人的腳在中線以上就被物件蓋住，以下就畫在物件前面（人走不進方框裡，所以不會穿幫）
     ・地圖編輯器、基地編輯器顯示紅格時，也會畫出這些方框（橘色）
   資料：data/tile-collisions.js 的 TILE_COLLISIONS＝{ 素材 id: [[x, y, 寬, 高], …] }
     x, y, 寬, 高＝像素，以「沒翻轉、沒轉向、沒放大」的素材左上角為原點（素材寬 w 格＝w × 40 像素）。
   每張地圖也可以有自己的方框（地圖編輯器的 🟧 橘框工具，存在地圖資料 m.tileBoxes）：那張地圖上就照地圖自己的，不用共用的。
   物件編輯器裡還沒存到專案的修改，會先存在這個瀏覽器（TILE_COLLISION_DRAFT，只記改過的素材），遊戲和編輯器都會疊上去，方便邊調邊試。 */
const TILE_COLLISION_DRAFT = 'tudrc_tile_collisions_draft_v1';

const TILE_COLLISION_CELL = 40;
// ---- 同一張圖片的素材共用一份 ----
// 素材庫裡有時同一張圖片登記了兩次以上（id 不一樣、圖片檔一樣），看起來是同一張，碰撞和人物遮擋線就該一樣。
// 讀的時候：其中一個有設、其他沒設，其他的就照著用；改的時候（物件編輯器、地圖編輯器）：同一張圖的素材全部一起改。
let tileSiblingCache = { n: -1, byId: new Map(), groups: [] };
function tileSiblingInfo() {
  const list = typeof SHARED_TILES !== 'undefined' && Array.isArray(SHARED_TILES) ? SHARED_TILES : [];
  if (tileSiblingCache.n === list.length) return tileSiblingCache;
  const byFile = new Map();
  for (const t of list) if (t && t.id && t.file) { if (!byFile.has(t.file)) byFile.set(t.file, []); byFile.get(t.file).push(t.id); }
  const groups = [...byFile.values()].filter(ids => ids.length > 1), byId = new Map();
  for (const ids of groups) for (const id of ids) byId.set(id, ids);
  tileSiblingCache = { n: list.length, byId, groups };
  return tileSiblingCache;
}
const tileSameImageIds = id => tileSiblingInfo().byId.get(id) || [id];   // 跟這張素材同一張圖的所有素材 id（含自己）
const tileShareSiblings = data => {   // 同一張圖的素材：有一個設了、其他沒設的，照著用
  for (const ids of tileSiblingInfo().groups) {
    const has = ids.find(id => data[id] != null); if (has == null) continue;
    for (const id of ids) if (data[id] == null) data[id] = data[has];
  }
  return data;
};
let tileCollisionCache = { raw: undefined, n: -1, data: {} };
function tileCollisionData() {
  let raw = null; try { raw = localStorage.getItem(TILE_COLLISION_DRAFT); } catch (_) {}
  const n = tileSiblingInfo().n;
  if (raw === tileCollisionCache.raw && n === tileCollisionCache.n) return tileCollisionCache.data;
  const base = typeof TILE_COLLISIONS !== 'undefined' ? TILE_COLLISIONS : {};
  let draft = null; try { draft = raw ? JSON.parse(raw) : null; } catch (_) {}
  const data = { ...base };   // 草稿只記改過的素材（null＝拿掉碰撞），蓋在正式資料上：別人更新了專案檔，沒改過的素材照樣跟著新的
  if (draft && typeof draft === 'object') for (const [id, boxes] of Object.entries(draft)) { if (Array.isArray(boxes) && boxes.length) data[id] = boxes; else delete data[id]; }
  tileShareSiblings(data);
  tileCollisionCache = { raw, n, data };
  return data;
}
// 改某張素材的碰撞方框（物件編輯器、地圖編輯器都用這個）：同一張圖的素材一起改，先存在這個瀏覽器的草稿
// boxes＝[[x, y, 寬, 高], …]（像素；空陣列＝拿掉碰撞）。回傳還沒存到專案的素材有幾張。
function tileCollisionSaveBoxes(id, boxes) {
  let draft = {}; try { draft = JSON.parse(localStorage.getItem(TILE_COLLISION_DRAFT) || '{}') || {}; } catch (_) { draft = {}; }
  const now = (boxes || []).map(b => b.map(v => Math.round(v))).filter(b => b[2] > 0 && b[3] > 0);
  for (const sid of tileSameImageIds(id)) {
    const base = typeof TILE_COLLISIONS !== 'undefined' ? TILE_COLLISIONS[sid] : null;
    if (JSON.stringify(now) === JSON.stringify(base || [])) delete draft[sid]; else draft[sid] = now.length ? now : null;
  }
  try { if (Object.keys(draft).length) localStorage.setItem(TILE_COLLISION_DRAFT, JSON.stringify(draft)); else localStorage.removeItem(TILE_COLLISION_DRAFT); } catch (_) {}
  return Object.keys(draft).length;
}
// 匯出 data/tile-collisions.js 的內容（物件編輯器、地圖編輯器的「💾 存到專案」都用這個）
function tileCollisionSource() {
  const data = tileCollisionData(), ids = Object.keys(data).sort();
  const body = ids.map(id => '  ' + JSON.stringify(id) + ': ' + JSON.stringify(data[id])).join(',\n');
  const depths = tileDepthData(), dIds = Object.keys(depths).filter(id => Number.isFinite(depths[id])).sort();
  const dBody = dIds.map(id => '  ' + JSON.stringify(id) + ': ' + Math.round(depths[id])).join(',\n');
  return '/* 素材碰撞方框：由物件編輯器「🧱 素材碰撞」匯出（說明見 js/tile-collisions.js）。\n   { 素材 id: [[x, y, 寬, 高], …] }，像素，以沒翻轉、沒轉向的素材左上角為原點（素材寬 w 格＝w × 40 像素）。 */\nconst TILE_COLLISIONS = {' + (body ? '\n' + body + '\n' : '') + '};\n'
    + '/* 人物遮擋線（同一頁的「人物遮擋線」）：{ 素材 id: 離圖片頂端幾像素 }。有設的素材優先用這個，沒設才用碰撞方框的中間。 */\nconst TILE_DEPTHS = {' + (dBody ? '\n' + dBody + '\n' : '') + '};\n';
}
// ---- 每張地圖自己的橘框 ----
// 地圖編輯器的 🟧 橘框工具改的是「這張地圖自己的」設定，存在地圖資料 m.tileBoxes＝{ 素材 id: [[x, y, 寬, 高], …] }（[]＝這張地圖上這張素材不擋路）。
// 這張地圖有設的素材照地圖自己的；沒設的照物件編輯器「🧱 素材碰撞」的共用預設。
// 現在是哪張地圖：地圖編輯器＝正在編輯的那張（curMap），遊戲＝正在玩的那張（MAP）；物件編輯器沒有地圖＝只看共用預設。
const tileBoxMapNow = () => (typeof curMap === 'function' ? curMap() : (typeof MAP !== 'undefined' ? MAP : null)) || null;
const tileMapBoxesOf = (m, id) => m && m.tileBoxes && Object.prototype.hasOwnProperty.call(m.tileBoxes, id) && Array.isArray(m.tileBoxes[id]) ? m.tileBoxes[id] : undefined;   // undefined＝這張地圖沒有自己設
const tileCollisionSharedBoxes = id => { const b = tileCollisionData()[id]; return Array.isArray(b) && b.length ? b : null; };   // 共用預設（物件編輯器）
const tileCollisionBoxes = (id, m = tileBoxMapNow()) => { const own = tileMapBoxesOf(m, id); if (own !== undefined) return own.length ? own : null; return tileCollisionSharedBoxes(id); };
// 地圖上某一個物件的方框：這個物件自己設了 boxes（地圖資料裡那個物件的 boxes 欄位，[]＝這一個不擋路）就照它自己的，
// 沒設才照上面（這張地圖的 → 共用預設）。用在同一張素材大部分都正常、只有某一個擺的位置剛好擋住路的時候（例如池核 31,66 的柱子）
const tileStampBoxes = s => s && Array.isArray(s.boxes) ? (s.boxes.length ? s.boxes : null) : tileCollisionBoxes(s && s.id);
// 地圖編輯器用：把這張地圖上某張素材的橘框改成 boxes（同一張圖片的素材一起改）；boxes＝null＝改回共用預設
function tileMapBoxesSet(m, id, boxes) {
  if (!m) return;
  const now = boxes == null ? null : boxes.map(b => b.map(v => Math.round(v))).filter(b => b[2] > 0 && b[3] > 0);
  for (const sid of tileSameImageIds(id)) {
    if (now == null) { if (m.tileBoxes) delete m.tileBoxes[sid]; }
    else (m.tileBoxes || (m.tileBoxes = {}))[sid] = now.map(b => b.slice());
  }
  if (m.tileBoxes && !Object.keys(m.tileBoxes).length) delete m.tileBoxes;
}

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
let tileDepthCache = { raw: undefined, n: -1, data: {} };
function tileDepthData() {
  let raw = null; try { raw = localStorage.getItem(TILE_DEPTH_DRAFT); } catch (_) {}
  const n = tileSiblingInfo().n;
  if (raw === tileDepthCache.raw && n === tileDepthCache.n) return tileDepthCache.data;
  const data = { ...(typeof TILE_DEPTHS !== 'undefined' ? TILE_DEPTHS : {}) };
  let draft = null; try { draft = raw ? JSON.parse(raw) : null; } catch (_) {}
  if (draft && typeof draft === 'object') for (const [id, v] of Object.entries(draft)) { if (Number.isFinite(v)) data[id] = v; else delete data[id]; }
  tileShareSiblings(data);   // 同一張圖的素材共用
  tileDepthCache = { raw, n, data };
  return data;
}
// 改某張素材手動的人物遮擋線（null＝改回自動）：同一張圖的素材一起改，先存在這個瀏覽器的草稿
function tileDepthSave(id, v) {
  let draft = {}; try { draft = JSON.parse(localStorage.getItem(TILE_DEPTH_DRAFT) || '{}') || {}; } catch (_) { draft = {}; }
  const val = Number.isFinite(v) ? v : null;
  for (const sid of tileSameImageIds(id)) {
    const base = typeof TILE_DEPTHS !== 'undefined' && Number.isFinite(TILE_DEPTHS[sid]) ? TILE_DEPTHS[sid] : null;
    if (val === base) delete draft[sid]; else draft[sid] = val;   // null＝拿掉專案檔裡的手動遮擋線
  }
  try { if (Object.keys(draft).length) localStorage.setItem(TILE_DEPTH_DRAFT, JSON.stringify(draft)); else localStorage.removeItem(TILE_DEPTH_DRAFT); } catch (_) {}
  return Object.keys(draft).length;
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
  const boxes = tileStampBoxes(s); if (!boxes) return null;
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
let tileBoxCheckedAt = 0;   // 上次確認「素材碰撞有沒有改過」的時間（毫秒）
function tileBoxGrid() {
  if (typeof MAP === 'undefined' || !MAP) return null;
  const stamps = MAP.stamps || [];
  // 加速（只在遊戲進行中）：同一張地圖、0.25 秒內已經確認過沒改，就直接用整理好的（走路、找路一幀要問上千次，每次都去讀瀏覽器草稿太浪費）
  // 編輯器裡照舊每次都確認，改了碰撞馬上看得到
  const now = performance.now();
  const inGame = typeof G !== 'undefined' && G && G.running;
  if (inGame && tileBoxIndex.map === MAP && tileBoxIndex.n === stamps.length && now - tileBoxCheckedAt < 250) return tileBoxIndex.grid;
  tileBoxCheckedAt = now;
  tileCollisionData();
  if (tileBoxIndex.map === MAP && tileBoxIndex.n === stamps.length && tileBoxIndex.raw === tileCollisionCache.raw) return tileBoxIndex.grid;
  const grid = new Map(), C = typeof CELL !== 'undefined' ? CELL : TILE_COLLISION_CELL;
  const doors = tileDoorRects(stamps, s => { const t = typeof mapTileById === 'function' ? mapTileById(s.id) : null; return t ? [mapStampW(s, t) * C, mapStampH(s, t) * C] : null; });
  for (const s of stamps) {
    const boxes = tileStampBoxes(s); if (!boxes) continue;
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
// ---- 看得穿的素材（data/tiles.js 標了 "seeThrough": true，例如玻璃的月台門）----
// 這種素材的方框蓋到的格子：照樣擋走路（方框、或地圖上手畫的 🧱 都一樣），但不擋視線、子彈
// （js/maploader.js 的 lineOfSightRaw 呼叫；怪物才看得到軌道裡的人、跳下去追，隊友也能隔著月台門開槍）
let tileSeeCache = { map: null, n: -1, raw: null, set: new Set() };
function tileSeeThroughCell(c, r) {
  if (typeof MAP === 'undefined' || !MAP) return false;
  const stamps = MAP.stamps || [];
  tileCollisionData();
  if (tileSeeCache.map !== MAP || tileSeeCache.n !== stamps.length || tileSeeCache.raw !== tileCollisionCache.raw) {
    const set = new Set(), C = typeof CELL !== 'undefined' ? CELL : TILE_COLLISION_CELL;
    for (const s of stamps) {
      const t = typeof mapTileById === 'function' ? mapTileById(s.id) : null;
      if (!t || !t.seeThrough) continue;
      const boxes = tileStampBoxes(s); if (!boxes) continue;
      for (const [x0, y0, x1, y1] of tileCollisionPlace(boxes, s, mapTileW(t) * C, mapTileH(t) * C, OX + s.c * C + (s.ox || 0), OY + s.r * C + (s.oy || 0)))
        for (let cc = Math.floor((x0 - OX) / C); cc * C + OX < x1; cc++) for (let rr = Math.floor((y0 - OY) / C); rr * C + OY < y1; rr++) set.add(cc + ',' + rr);
    }
    tileSeeCache = { map: MAP, n: stamps.length, raw: tileCollisionCache.raw, set };
  }
  return tileSeeCache.set.has(c + ',' + r);
}
// 這一格能不能蓋建築：格子中心在方框裡就不行
function tileBoxCoversCell(c, r) { return tileBoxBlocksPoint(OX + c * CELL + CELL / 2, OY + r * CELL + CELL / 2); }
// 找路用（js/pathfinding.js 的 isWall）：這一格的正中間有沒有被素材方框蓋住
// 找路一次會問上萬格，所以這張地圖已經整理過方框的話直接用整理好的，不再每次重新檢查有沒有改過（改了素材碰撞要重新整理頁面）
function tileBoxCoversCellFast(c, r) {
  const grid = tileBoxIndex.map === MAP ? tileBoxIndex.grid : tileBoxGrid();
  const list = grid && grid.get(c + ',' + r); if (!list) return false;
  const x = OX + c * CELL + CELL / 2, y = OY + r * CELL + CELL / 2;
  for (const b of list) if (x >= b.x0 && x < b.x1 && y >= b.y0 && y < b.y1 && !tileBoxInHole(b, x, y) && tileBoxActive(b)) return true;
  return false;
}

// ---- 編輯器：顯示紅格時畫出素材方框（橘色）----
// tileOf(id)＝編輯器自己的找素材函式；tilePx(t)＝[寬, 高] 像素
function drawTileCollisionOverlay(ctx, stamps, tileOf, tilePx, ox = 0, oy = 0, isHidden = null) {
  ctx.save();
  ctx.lineWidth = 2; ctx.strokeStyle = '#ffa63a'; ctx.fillStyle = 'rgba(255,150,40,.28)';
  for (const s of stamps || []) {
    if (isHidden && isHidden(s)) continue;
    const boxes = tileStampBoxes(s); if (!boxes) continue;
    const t = tileOf(s.id); if (!t) continue;
    const [tw, th] = tilePx(t);
    for (const [x0, y0, x1, y1] of tileCollisionPlace(boxes, s, tw, th, ox + s.c * TILE_COLLISION_CELL + (s.ox || 0), oy + s.r * TILE_COLLISION_CELL + (s.oy || 0))) {
      ctx.fillRect(x0, y0, x1 - x0, y1 - y0); ctx.strokeRect(x0 + 1, y0 + 1, x1 - x0 - 2, y1 - y0 - 2);
    }
  }
  ctx.restore();
}
