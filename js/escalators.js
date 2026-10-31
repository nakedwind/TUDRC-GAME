/* ===== 捷運手扶梯：階梯循環動畫＋站在上面會被帶著走 =====
   哪些素材是手扶梯、階梯在圖片的哪裡：下面 ESCALATOR.tiles（數字是「原始圖片」的像素）
     lanes：每一條階梯　x、w＝左邊界、寬度；dir＝-1 往上、1 往下
     y、h：階梯從圖片第幾個像素開始、多高（要是 period 的倍數，循環才接得起來）
   ・畫：js/maploader.js 的 drawMapStampRaw 先畫整張圖，再把階梯那條照時間往上／往下捲（drawEscalatorAnimation）
   ・帶人：game.js 的 update 每幀呼叫 updateEscalators：溫特、隊員、NPC、地上的怪物，腳踩在階梯上就跟著移動（撞到東西就停）
   ・扶手、中間隔板擋不擋路：物件編輯器（data/prop-collisions.js 的「手扶梯」）設定
   ・左右翻轉的手扶梯：兩條階梯跟著換邊（方向不變）；上下翻轉：方向也跟著反過來；旋轉過的只有動畫、不帶人 */
const ESCALATOR = {
  speed: 36,     // 階梯移動速度（像素／秒；溫特走路大約 120）
  period: 10,    // 一階幾個像素（原始圖片）
  footDy: 14,    // 角色的位置往下幾點是腳
  enemyFootDy: 10,
  tiles: {
    tile_mrt_escalator_front: { y: 27, h: 100, lanes: [{ x: 39, w: 43, dir: 1 }, { x: 118, w: 43, dir: -1 }] },
    tile_mrt_escalator_front_high: { y: 26, h: 270, lanes: [{ x: 39, w: 43, dir: 1 }, { x: 118, w: 43, dir: -1 }] },
    tile_mrt_escalator_front_high02: { y: 26, h: 390, lanes: [{ x: 39, w: 43, dir: 1 }, { x: 118, w: 43, dir: -1 }] },
    tile_mrt_escalator_front_high03: { y: 26, h: 270, lanes: [{ x: 39, w: 43, dir: 1 }, { x: 118, w: 43, dir: -1 }] },
    tile_mrt_escalator_front_high04: { y: 26, h: 390, lanes: [{ x: 39, w: 43, dir: 1 }, { x: 118, w: 43, dir: -1 }] },
  },
};
let escalatorPhase = 0;   // 階梯捲了多遠（世界像素）；遊戲暫停時不動

function escalatorSpec(id) { return ESCALATOR.tiles[id] || null; }

// 畫手扶梯：回傳 true＝已經畫好（整張圖＋捲動的階梯）
function drawEscalatorAnimation(ctx, s, img, x, y, w, h) {
  const spec = escalatorSpec(s.id);
  if (!spec || !img.naturalWidth) return false;
  ctx.drawImage(img, x, y, w, h);
  const kx = w / img.naturalWidth, ky = h / img.naturalHeight, P = ESCALATOR.period;
  const p = Math.floor(escalatorPhase / ky) % P;   // 捲了幾個原始像素（取整數，像素圖才不會糊）
  if (!p) return true;
  for (const lane of spec.lanes) {
    const dx = x + lane.x * kx, dw = lane.w * kx, top = y + spec.y * ky;
    if (lane.dir < 0) {   // 往上：整條往上移 p，最上面那 p 接到最下面
      ctx.drawImage(img, lane.x, spec.y + p, lane.w, spec.h - p, dx, top, dw, (spec.h - p) * ky);
      ctx.drawImage(img, lane.x, spec.y, lane.w, p, dx, top + (spec.h - p) * ky, dw, p * ky);
    } else {              // 往下：整條往下移 p，最下面那 p 接到最上面
      ctx.drawImage(img, lane.x, spec.y, lane.w, spec.h - p, dx, top + p * ky, dw, (spec.h - p) * ky);
      ctx.drawImage(img, lane.x, spec.y + spec.h - p, lane.w, p, dx, top, dw, p * ky);
    }
  }
  return true;
}

// 這張地圖上每條階梯的範圍（世界座標）和方向；換地圖、物件數量變了才重算
let escalatorCache = { map: null, n: -1, lanes: [] };
function escalatorLanes() {
  if (typeof MAP === 'undefined' || !MAP) return [];
  const n = (MAP.stamps || []).length;
  if (escalatorCache.map === MAP && escalatorCache.n === n) return escalatorCache.lanes;
  const lanes = [];
  for (const s of MAP.stamps || []) {
    const spec = escalatorSpec(s.id); if (!spec || mapStampTurn(s)) continue;
    const t = mapTileById(s.id), img = t && tileImage(t);
    const w = mapTileW(t) * CELL, h = mapTileH(t) * CELL;
    const iw = (img && img.naturalWidth) || w, ih = (img && img.naturalHeight) || h, kx = w / iw, ky = h / ih;
    const x = OX + s.c * CELL + (s.ox || 0), y = OY + s.r * CELL + (s.oy || 0);
    for (const lane of spec.lanes) {
      const lx = s.fx ? x + w - (lane.x + lane.w) * kx : x + lane.x * kx;
      const ly = s.fy ? y + h - (spec.y + spec.h) * ky : y + spec.y * ky;
      lanes.push({ x0: lx, x1: lx + lane.w * kx, y0: ly, y1: ly + spec.h * ky, dir: s.fy ? -lane.dir : lane.dir, stamp: s });
    }
  }
  // 圖片還沒載好就先不記（尺寸可能不對），下一幀再算
  if (lanes.every(l => l.x1 > l.x0)) escalatorCache = { map: MAP, n, lanes };
  return lanes;
}
// 這格在不在手扶梯上（整張手扶梯圖的範圍，含扶手）：不能蓋建築（js/build.js 的 canPlaceObstacle）
function escalatorCoversCell(c, r) {
  if (typeof MAP === 'undefined' || !MAP) return false;
  for (const s of MAP.stamps || []) {
    if (!escalatorSpec(s.id)) continue;
    const t = mapTileById(s.id); if (!t) continue;
    const o = stampSolidOrigin(s), side = mapStampTurn(s) % 2;
    const w = side ? mapTileH(t) : mapTileW(t), h = side ? mapTileW(t) : mapTileH(t);
    if (c >= o.c && c < o.c + w && r >= o.r && r < o.r + h) return true;
  }
  return false;
}
function escalatorLaneAt(x, y) {
  for (const l of escalatorLanes()) if (x >= l.x0 && x < l.x1 && y >= l.y0 && y < l.y1) return l;
  return null;
}
// 把一個角色沿著階梯移 dist 像素（逐小步檢查，撞到東西就停）
function carryOnEscalator(a, footDy, dt, blocked) {
  const lane = escalatorLaneAt(a.x, a.y + footDy); if (!lane) return;
  let move = ESCALATOR.speed * dt;
  while (move > 0) {
    const s = Math.min(4, move); move -= s;
    const ny = a.y + lane.dir * s;
    if (blocked(a.x, ny)) break;
    a.y = ny;
    if (!escalatorLaneAt(a.x, a.y + footDy)) break;   // 已經下了手扶梯
  }
}
// ---- 每幀（game.js 的 update 呼叫）----
function updateEscalators(dt) {
  escalatorPhase = (escalatorPhase + ESCALATOR.speed * dt) % 100000;
  if (!escalatorLanes().length || !G) return;
  const still = a => a.sitting || a.grabbed || a.grabFall || a.eatenBy;
  if (G.player && !still(G.player)) carryOnEscalator(G.player, ESCALATOR.footDy, dt, playerBlocked);
  for (const t of [...(G.towers || []), ...(G.npcs || [])]) if (!still(t)) carryOnEscalator(t, ESCALATOR.footDy, dt, sentryBlocked);
  for (const e of G.enemies || []) {
    if (e.dead || e.hp <= 0 || e.behavior === 'moth' || still(e)) continue;   // 人面蝶飛在空中
    carryOnEscalator(e, ESCALATOR.enemyFootDy, dt, (x, y) => enemyBlocked(x, y, e));
  }
}
