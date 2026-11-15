/* ===== 池核：深水裡的抽水機平台（上岸）=====
   平台＝圖層名稱有「抽水機」的那層裡，Poolcore_block 系列素材拼成、四周有深水區的方塊（例如最右邊 BOSS 區域那台發電機底下的方塊）。
   ・深水時：坐救生圈划到平台旁邊 → 出現「上岸」，按空白鍵（或 Enter）收起救生圈、站到平台上；平台上可以啟動發電機（抽水機）
     要離開：走到平台邊上按空白鍵，照平常一樣坐救生圈下水
   ・水抽掉（不是深水）的時候：平台上不去，從旁邊也碰不到平台上的發電機；平台的側面（圖片下緣那一段）也走不進去
     站在平台上時把水抽乾了：往平台邊上走 → 出現「跳下去」，按空白鍵小跳到地板上，摔在地上頭暈 1 秒（下面的 POOL_PLATFORM.jump）
   ・用走的永遠上不去（只能從救生圈上岸）；只有溫特能上來——隊員（坐救生圈也一樣）、怪物都碰不到整塊平台的圖片範圍
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
// 水抽乾之後：整塊平台的圖片範圍都擋（包括下緣的側面，不然從地板走過去會疊在平台的側面上）
function poolPlatformBlocksPlayer(x, y) {
  const dry = typeof poolDeepIsDeep === 'function' && !poolDeepIsDeep();
  const pl = poolPlatformAt(x, y) || (dry ? poolPlatformRectAt(x, y) : null); if (!pl) return false;
  return !poolPlatformStanding(pl);
}
// 這個點在不在某塊平台的圖片範圍裡
const poolPlatformRectAt = (x, y) => poolPlatforms().find(p => x >= p.x0 && x < p.x1 && y >= p.y0 && y < p.y1) || null;
// 隊員、怪物：整塊平台的圖片範圍都進不去——隊員坐救生圈也不能划到平台底下、自己上岸（js/sentry.js 的 sentryBlocked、js/pathfinding.js 的 nudgedWallAt）
const poolPlatformBlocksPoint = (x, y) => !!poolPlatformRectAt(x, y);

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

// ---- 水抽乾以後：從平台「跳下去」----
//   站在平台上、水已經抽乾（不是深水）時，往平台邊上走、被邊緣擋住 → 那一邊出現「跳下去」，按空白鍵（或 Enter）
//   溫特小跳一下落到平台外的地板上，落地後倒在地上 downTime 秒、頭上冒頭暈的星星（不能動、不能開槍），之後爬起來
//   time＝跳在空中幾秒、height＝跳多高（像素）、out＝落地點離平台邊再多幾像素、hintSecs＝被擋住之後提示留幾秒、
//   reach＝離平台圖片的邊多近才算「在邊上」（平台下緣有一段側面，邊緣碰撞畫在比較裡面）
POOL_PLATFORM.jump = { prompt: '跳下去', time: .55, height: 34, out: 6, hintSecs: 1.2, reach: 90, downTime: 1 };
// 落地點：從溫特現在的位置往 (sx, sy) 那一邊跳到平台外面；沿著平台邊左右挪一挪找站得住的地方，都不行就回傳 null
function poolPlatformJumpTarget(pl, sx, sy) {
  const p = G.player, J = POOL_PLATFORM.jump, r = PLAYER.r;
  const edgeD = sx > 0 ? pl.x1 - p.x : sx < 0 ? p.x - pl.x0 : sy > 0 ? pl.y1 - p.y : p.y - pl.y0;
  if (edgeD > J.reach) return null;   // 離那一邊太遠（例如推到平台中間的電箱）
  const base = sx ? { x: sx > 0 ? pl.x1 + r + J.out : pl.x0 - r - J.out, y: p.y } : { x: p.x, y: sy > 0 ? pl.y1 + r + J.out : pl.y0 - r - J.out };
  const keep = p.poolPlatformOn; p.poolPlatformOn = null;   // 落地後就不在平台上了：照「不在平台上」檢查擋路
  try {
    for (const off of [0, 8, -8, 16, -16, 24, -24, 32, -32]) {
      const x = base.x + (sx ? 0 : off), y = base.y + (sx ? off : 0);
      if (!playerBlocked(x, y) && !(typeof deepWaterAtPoint === 'function' && deepWaterAtPoint(x, y))) return { x, y };
    }
  } finally { p.poolPlatformOn = keep; }
  return null;
}
// 溫特走完一步之後（js/game.js 的 updatePlayer 呼叫）：站在抽乾的平台上、往邊上走卻沒走動 → 記下「跳下去」的提示
function poolPlatformAfterMove(p, dx, dy, ox, oy) {
  if (!p || !(dx || dy) || p.swimRing) return;
  if (typeof poolDeepIsDeep === 'function' && poolDeepIsDeep()) return;   // 深水時照舊用「下水」
  const pl = poolPlatformStandingAny(); if (!pl) return;
  const sx = dx && Math.abs(p.x - ox) < .01 ? dx : 0, sy = dy && Math.abs(p.y - oy) < .01 ? dy : 0;   // 哪個方向被擋住了
  for (const [ax, ay] of [[sx, 0], [0, sy]]) {
    if (!ax && !ay) continue;
    const spot = poolPlatformJumpTarget(pl, ax, ay);
    if (spot) { p.poolJumpHint = { at: performance.now(), x: spot.x, y: spot.y }; return; }
  }
}
// 現在要不要顯示「跳下去」：回傳落地點 { x, y }（js/render.js 畫提示、空白鍵用）
function poolPlatformJumpSpot() {
  const p = typeof G !== 'undefined' && G && G.player, h = p && p.poolJumpHint;
  if (!h || p.poolJump || p.poolDownT > 0 || performance.now() - h.at > POOL_PLATFORM.jump.hintSecs * 1000) return null;
  if ((typeof poolDeepIsDeep === 'function' && poolDeepIsDeep()) || !poolPlatformStandingAny()) return null;
  return h;
}
// 按空白鍵：開始跳（js/game.js 的互動鍵）
function usePoolPlatformJump() {
  const spot = poolPlatformJumpSpot(); if (!spot) return false;
  const p = G.player;
  p.poolJump = { t: 0, x0: p.x, y0: p.y, x1: spot.x, y1: spot.y };
  p.poolJumpHint = null; p.poolPlatformOn = null; p.moving = false; p.anim = 0;
  return true;
}
// 每一幀（js/game.js 的 updatePlayer 最前面呼叫）：跳在空中、倒在地上的時候由這裡管，回傳 true＝溫特這一幀不能自己動
function poolJumpUpdate(p, dt) {
  const J = POOL_PLATFORM.jump;
  if (p.poolJump) {
    const s = p.poolJump, u = Math.min(1, (s.t += dt) / J.time);
    p.x = s.x0 + (s.x1 - s.x0) * u; p.y = s.y0 + (s.y1 - s.y0) * u;
    if (u >= 1) {   // 落地：摔在地上
      p.poolJump = null; p.poolDownT = J.downTime;
      flash('頭暈！', p.x, p.y - 50, '#ffe36e');
      G.effects.push({ ring: true, x: p.x, y: p.y + 14, r: 4, r2: 26, life: .25, life0: .25, color: '#d9d2c0' });   // 揚起一圈灰塵
      if (typeof nearbyImpact === 'function') nearbyImpact(p.x, p.y, 3, 0);
      if (typeof sfxAt === 'function') sfxAt('knock2', p.x, p.y, .6, 'pool-jump-land');
    }
    return true;
  }
  if (p.poolDownT > 0) { p.poolDownT = Math.max(0, p.poolDownT - dt); return true; }
  return false;
}
// 畫溫特之前（js/render.js 的 drawPlayer）：跳在空中往上抬；倒在地上沒有倒地圖時，整個人以腳底為軸倒下去
function applyPoolJumpTransform(ctx, p) {
  const fx = p.x, fy = p.y + 16;
  if (p.poolJump) {
    const u = Math.min(1, p.poolJump.t / POOL_PLATFORM.jump.time), z = 4 * POOL_PLATFORM.jump.height * u * (1 - u);
    ctx.translate(0, -z);
    return;
  }
  if (p.poolDownT > 0 && !(playerSprites.fail && playerSprites.fail.complete && playerSprites.fail.naturalWidth)) {
    ctx.translate(fx, fy); ctx.rotate(Math.PI / 2); ctx.translate(-fx, -fy);
  }
}
// 倒在地上時頭上的星星（跟踩香蕉皮頭暈同一套，js/burrowing-mouse.js 的 drawBurrowDizzyStars；js/render.js 呼叫）
function drawPoolJumpStars(ctx) {
  const p = typeof G !== 'undefined' && G && G.player;
  if (!p || !(p.poolDownT > 0) || typeof drawBurrowDizzyStars !== 'function') return;
  drawBurrowDizzyStars(ctx, p.x, p.y - PLAYER.drawSize + 28 + 14, 1, performance.now() / 1000);   // 躺著比較矮：星星往下一點
}
