/* ===== 池核：深水裡的抽水機平台（上岸）=====
   平台＝圖層名稱有「抽水機」的那層裡，Poolcore_block 系列素材拼成、四周有深水區的方塊（例如最右邊 BOSS 區域那台發電機底下的方塊）。
   ・深水時：坐救生圈划到平台旁邊 → 出現「上岸」，按空白鍵（或 Enter）收起救生圈、站到平台上；平台上可以啟動發電機（抽水機）
     要離開：走到平台邊上按空白鍵，照平常一樣坐救生圈下水
   ・水抽掉（不是深水）的時候：平台上不去，從旁邊也碰不到平台上的發電機
   ・用走的永遠上不去（只能從救生圈上岸）；隊員、怪物都上不去
   平台上可以站的格子＝方塊範圍裡、不是深水區、也不是牆的格子（照地圖編輯器畫的深水區和紅格）。 */
const POOL_PLATFORM = { layerMark: '抽水機', tile: /^Poolcore_block_/, reach: 22, prompt: '上岸', leavePrompt: '下水', leaveReach: 12, propPad: CELL };
// leavePrompt：站在平台上靠近深水時的提示；leaveReach：站在平台上時，離深水多幾點也算「在岸邊」（平台四周有邊緣碰撞，人走不到最邊邊）
let poolPlatformCache = { map: null, n: -1, list: [] };
// 這張地圖上的平台：[{ cells: Set('c,r'), x0, y0, x1, y1 }]（x、y＝方塊圖片範圍，世界座標）
function poolPlatforms() {
  if (typeof MAP === 'undefined' || !MAP) return [];
  const n = (MAP.stamps || []).length;
  if (poolPlatformCache.map === MAP && poolPlatformCache.n === n) return poolPlatformCache.list;
  const layers = new Set((MAP.layerOrder || []).filter(l => String(l.name || '').includes(POOL_PLATFORM.layerMark)).map(l => l.id));
  const rects = [];
  for (const s of MAP.stamps || []) {
    if (!layers.has(s.layer || 'top')) continue;
    const t = mapTileById(s.id); if (!t || !POOL_PLATFORM.tile.test(String(t.name || ''))) continue;
    const x0 = OX + s.c * CELL + (s.ox || 0), y0 = OY + s.r * CELL + (s.oy || 0);
    rects.push({ x0, y0, x1: x0 + mapStampW(s, t) * CELL, y1: y0 + mapStampH(s, t) * CELL });
  }
  // 碰在一起的方塊合成一塊
  const groups = [];
  for (const r of rects) {
    const hit = groups.filter(g => r.x0 <= g.x1 + 1 && r.x1 >= g.x0 - 1 && r.y0 <= g.y1 + 1 && r.y1 >= g.y0 - 1);
    const g = { x0: r.x0, y0: r.y0, x1: r.x1, y1: r.y1 };
    for (const h of hit) { g.x0 = Math.min(g.x0, h.x0); g.y0 = Math.min(g.y0, h.y0); g.x1 = Math.max(g.x1, h.x1); g.y1 = Math.max(g.y1, h.y1); groups.splice(groups.indexOf(h), 1); }
    groups.push(g);
  }
  const deep = new Set([...(MAP.deepWater || []), ...(MAP.deepWaterKeep || [])]), list = [];
  for (const g of groups) {
    const cells = new Set(); let wet = false;
    for (let c = Math.floor((g.x0 - OX) / CELL); c * CELL + OX < g.x1; c++) for (let r = Math.floor((g.y0 - OY) / CELL); r * CELL + OY < g.y1; r++) {
      const [x, y] = center(c, r); if (x < g.x0 || x >= g.x1 || y < g.y0 || y >= g.y1 || !inGrid(c, r)) continue;
      const k = c + ',' + r;
      if (deep.has(k)) { wet = true; continue; }
      if (!mapWalls.has(k)) cells.add(k);
      for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (deep.has((c + dc) + ',' + (r + dr))) wet = true;
    }
    if (wet && cells.size) list.push({ ...g, cells, key: Math.round(g.x0) + ',' + Math.round(g.y0) });   // 四周有深水的才算（泳池外面的方塊不算）；key＝認平台用（地圖重新整理後還認得出是同一塊）
  }
  return (poolPlatformCache = { map: MAP, n, list }).list;
}
const poolPlatformAt = (x, y) => { const k = cellAt(x, y).join(','); return poolPlatforms().find(p => p.cells.has(k)) || null; };
// 溫特現在是不是站在這塊平台上：從救生圈上岸時記下是哪一塊（p.poolPlatformOn），之後只要人還在平台的圖片範圍裡、沒坐救生圈就算。
// （以前是看溫特中心點那一格是不是平台格：電箱那種「算牆、但人走得進去」的格子一踩進去就不算站在平台上，整塊平台都變成擋路 → 卡死不能動）
function poolPlatformStanding(pl) {
  const p = typeof G !== 'undefined' && G && G.player;
  return !!(p && pl && !p.swimRing && p.poolPlatformOn === pl.key && p.x >= pl.x0 && p.x < pl.x1 && p.y >= pl.y0 && p.y < pl.y1);
}
// 這個點在平台上、而且溫特現在不在平台上：擋住（用走的上不去，只能從救生圈上岸；js/game.js 的 playerBlocked）
function poolPlatformBlocksPlayer(x, y) {
  const pl = poolPlatformAt(x, y); if (!pl) return false;
  return !poolPlatformStanding(pl);
}
// 隊員、怪物：平台永遠上不去（js/sentry.js 的 sentryBlocked、js/pathfinding.js 的 nudgedWallAt）
const poolPlatformBlocksPoint = (x, y) => !!poolPlatformAt(x, y);

// 坐救生圈、深水時，離平台夠近：回傳 { pl, x, y }（提示畫在哪裡）
function poolPlatformNearPlayer() {
  const p = typeof G !== 'undefined' && G && G.player; if (!p || !p.swimRing || p.hp <= 0) return null;
  if (typeof poolDeepIsDeep === 'function' && !poolDeepIsDeep()) return null;   // 水抽掉了：上不去
  // 離平台夠不夠近：量到平台「圖片」的範圍（不是站得住的格子）。
  // 平台四周在地圖編輯器畫了邊緣碰撞（薄牆），救生圈會被擋在牆外；如果量到站得住的格子，從左邊靠過去會差一點點，「上岸」就不會出現
  const rectD = (pl, x0, y0, x1, y1) => Math.hypot(Math.max(x0 - p.x, 0, p.x - x1), Math.max(y0 - p.y, 0, p.y - y1));
  let best = null, bd = Infinity;
  for (const pl of poolPlatforms()) {
    if (rectD(pl, pl.x0, pl.y0, pl.x1, pl.y1) > PLAYER.r + POOL_PLATFORM.reach) continue;
    for (const k of pl.cells) {   // 提示畫在最近那格站得住的地方上面
      const [c, r] = k.split(',').map(Number), x0 = OX + c * CELL, y0 = OY + r * CELL;
      const d = rectD(pl, x0, y0, x0 + CELL, y0 + CELL);
      if (d < bd) { bd = d; best = { pl, c, r, x: x0 + CELL / 2, y: y0 }; }
    }
  }
  return best;
}
// 按空白鍵：收起救生圈，站到平台上最近、站得住的地方（js/game.js 的互動鍵）
function usePoolPlatformNearPlayer() {
  const near = poolPlatformNearPlayer(); if (!near) return false;
  const p = G.player, keep = [p.x, p.y];
  const spots = [...near.pl.cells].map(k => k.split(',').map(Number)).sort((a, b) => Math.hypot(...center(...a).map((v, i) => v - keep[i])) - Math.hypot(...center(...b).map((v, i) => v - keep[i])));
  p.swimRing = false;
  for (const [c, r] of spots) for (const [dx, dy] of [[0, 0], [0, -8], [0, 8], [-8, 0], [8, 0]]) {
    const [cx, cy] = center(c, r), x = cx + dx, y = cy + dy;
    p.x = x; p.y = y; p.poolPlatformOn = near.pl.key;   // 先站上去再檢查（平台的擋路看「溫特是不是已經在平台上」）
    if (playerBlocked(x, y)) continue;
    p.moving = false;
    // 收起救生圈不播音效（原本借用的「水把火澆熄」被換成火熄滅的聲音，聽起來不對）
    if (typeof flash === 'function') flash('上岸了', p.x, p.y - 50, '#bfe8ff');
    return true;
  }
  p.swimRing = true; p.x = keep[0]; p.y = keep[1]; p.poolPlatformOn = null;   // 平台上沒有站得住的地方：上不去
  if (typeof sfx === 'function') sfx('error');
  return true;
}
// 平台上的東西（發電機）：溫特不在平台上就碰不到（js/storage-lockers.js 的 storagePropNearPlayer）
function poolPlatformPropBlocked(prop) {
  if (!prop || prop.kind !== 'dynamo') return false;
  const pad = POOL_PLATFORM.propPad, pl = poolPlatforms().find(g => prop.x >= g.x0 - pad && prop.x < g.x1 + pad && prop.y >= g.y0 - pad && prop.y < g.y1 + pad);
  if (!pl) return false;
  return !poolPlatformStanding(pl);
}
// 溫特現在站在哪一塊平台上（沒有＝null）
const poolPlatformStandingAny = () => poolPlatforms().find(poolPlatformStanding) || null;
// 站在平台上、旁邊就是深水：回傳下水的位置 { x, y }（js/render.js 畫「下水」提示；按空白鍵走 js/swim-ring.js 的 useSwimRingNearPlayer）
function poolPlatformLeaveSpot() {
  if (!poolPlatformStandingAny() || typeof deepWaterNearPlayer !== 'function') return null;
  return deepWaterNearPlayer();
}
