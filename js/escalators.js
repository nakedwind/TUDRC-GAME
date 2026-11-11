/* ===== 捷運手扶梯：階梯循環動畫＋站在上面會被帶著走 =====
   哪些素材是手扶梯、階梯在圖片的哪裡：下面 ESCALATOR.tiles（數字是「原始圖片」的像素）
     lanes：每一條階梯　x、w＝左邊界、寬度；dir＝-1 往上、1 往下
     y、h：階梯從圖片第幾個像素開始、多高（要是 period 的倍數，循環才接得起來）
   ・畫：js/maploader.js 的 drawMapStampRaw 先畫整張圖，再把階梯那條照時間往上／往下捲（drawEscalatorAnimation）
   ・帶人：game.js 的 update 每幀呼叫 updateEscalators：溫特、隊員、NPC、地上的怪物，腳踩在階梯上就跟著移動（撞到東西就停）
   ・逆向：逆著階梯方向走會變慢（againstSlow）；順向維持原本速度
   ・音效：溫特踩上會動的手扶梯時播廣播，冷卻 rideSoundCd 秒
   ・扶手、中間隔板擋不擋路：物件編輯器（data/prop-collisions.js 的「手扶梯」）設定
   ・不會動的手扶梯：地圖編輯器選手扶梯、取消「手扶梯會動」（stamp.still）：階梯不捲、不帶人
   ・左右翻轉的手扶梯：兩條階梯跟著換邊（方向不變）；上下翻轉：方向也跟著反過來；旋轉過的只有動畫、不帶人
   ===== 側面的手扶梯（斜的那種，tile_mrt_escalator_side）=====
   設定在下面 ESCALATOR.side（數字一樣是「原始圖片」的像素）。圖片分三層：-bottom（後面的扶手和牆）、-middle（階梯）、-cover（前面的扶手和外殼）
   ・畫：整張圖先畫（排在人後面），階梯那一段照時間斜斜地捲；前面的扶手外殼（-cover）另外再畫一次、蓋在站在上面的人身上（escalatorSortables）
   ・走道：人的腳只能踩在前後扶手中間那一條斜斜的範圍（band），只能從兩頭上下；其他地方（扶手、外殼、底下的三角形）整個擋住（escalatorSideBlocks）
   ・在上面左右走會自動跟著斜坡上下；會動的手扶梯在斜坡那一段把人往上（或往下）帶，兩頭的平台不帶
   ・會不會動（stamp.still）、往上還是往下（stamp.escDown）：地圖編輯器選手扶梯之後勾選
   ・底下實心的格子（擋子彈、怪物繞路用）：物件編輯器（data/prop-collisions.js 的「手扶梯（側面）」）
   ・上下翻轉、旋轉、調過大小角度的側面手扶梯：只是一張圖（不動、不擋、不帶人） */
const ESCALATOR = {
  speed: 36,     // 階梯移動速度（像素／秒；溫特走路 230、隊員 90 上下）
  againstSlow: .5,   // 逆著階梯走：自己的走路速度少幾成（.5＝只剩一半，再扣掉階梯本身的速度）
  againstMinKeep: .2,   // 逆著走最少還保留走路速度的幾成：走得慢的隊員、怪物才不會永遠爬不上去
  rideSound: 'escalatorRide', rideSoundCd: 10,   // 溫特踩上手扶梯的廣播（音效編輯器可以換）、幾秒內不重播
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
  // 側面的手扶梯（斜的）
  side: {
    xSpeed: .78,   // 斜著走時，左右方向的速度是 speed 的幾成（階梯每往旁邊 10 像素就升高 8 像素）
    edge: 4,       // 站在上面的人離走道上下邊緣至少幾像素（太貼邊左右走會卡住）
    tiles: {
      tile_mrt_escalator_side: {
        size: 240,                                   // 原始圖片的寬高
        bottom: 'images/捷運車站/mrt-escalator-side-bottom.png',   // 後面的扶手和牆
        middle: 'images/捷運車站/mrt-escalator-side-middle.png',   // 階梯
        cover: 'images/捷運車站/mrt-escalator-side-cover.png',     // 前面的扶手和外殼
        mx: 23, my: 51,                              // 階梯那張圖貼在整張圖的哪裡
        stepX: 10, stepY: 8,                         // 一階寬 10、高 8 像素
        x0: 45, x1: 194,                             // 斜坡（會動的階梯）從第幾個像素到第幾個像素；左邊、右邊是不會動的平台
        yLow: 172, yHigh: 52,                        // 階梯面最上緣：下面平台的高度、上面平台的高度
        band: [18, 54],                              // 腳可以踩的範圍：從階梯面上緣往下第幾～第幾像素（前後扶手中間）
        back: 24,                                    // 後面的扶手：階梯面上緣往上幾像素以內也擋住
      },
    },
  },
};
let escalatorPhase = 0;   // 階梯捲了多遠（世界像素）；遊戲暫停時不動

function escalatorSpec(id) { return ESCALATOR.tiles[id] || null; }

// 畫手扶梯：回傳 true＝已經畫好（整張圖＋捲動的階梯）
function drawEscalatorAnimation(ctx, s, img, x, y, w, h) {
  if (escalatorSideSpec(s.id)) return drawSideEscalator(ctx, s, img, x, y, w, h);
  const spec = escalatorSpec(s.id);
  if (!spec || s.still || !img.naturalWidth) return false;   // still：地圖編輯器關掉的手扶梯，當一般圖片畫
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
    const spec = escalatorSpec(s.id); if (!spec || s.still || mapStampTurn(s)) continue;
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
    if (!escalatorSpec(s.id) && !escalatorSideSpec(s.id)) continue;
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
// 這一幀自己往階梯反方向走了多遠，要多退回去多少（a.escY＝上一幀帶完之後的位置；被撞飛、瞬移不算走路）
function escalatorAgainstPush(a, lane, carry) {
  const moved = a.escY == null || a.knockT > 0 ? 0 : a.y - a.escY, against = moved * lane.dir < 0 ? Math.abs(moved) : 0;
  if (!against || against > CELL) return 0;
  return Math.max(0, Math.min(against * ESCALATOR.againstSlow, against * (1 - ESCALATOR.againstMinKeep) - carry));
}
// 把一個角色沿著階梯帶著走（逐小步檢查，撞到東西就停）；回傳這一幀有沒有站在階梯上
function carryOnEscalator(a, footDy, dt, blocked) {
  const lane = escalatorLaneAt(a.x, a.y + footDy);
  if (!lane) { a.escY = null; return false; }
  const carry = ESCALATOR.speed * dt;
  let move = carry + escalatorAgainstPush(a, lane, carry);
  while (move > 0) {
    const s = Math.min(4, move); move -= s;
    const ny = a.y + lane.dir * s;
    if (blocked(a.x, ny)) break;
    a.y = ny;
    if (!escalatorLaneAt(a.x, a.y + footDy)) break;   // 已經下了手扶梯
  }
  a.escY = a.y;
  return true;
}
let escalatorRideCd = 0;   // 踩上手扶梯音效的冷卻（秒）
// 溫特這一幀才剛踩上階梯：播廣播（冷卻中就不播）
function escalatorRideSound(p, on) {
  if (on && !p.onEscalator && escalatorRideCd <= 0 && typeof sfxAt === 'function') {
    sfxAt(ESCALATOR.rideSound, p.x, p.y, 1, 'escalator-ride');
    escalatorRideCd = ESCALATOR.rideSoundCd;
  }
  p.onEscalator = on;
}
// ---- 每幀（game.js 的 update 呼叫）----
function updateEscalators(dt) {
  escalatorPhase = (escalatorPhase + ESCALATOR.speed * dt) % 100000;
  escalatorRideCd = Math.max(0, escalatorRideCd - dt);
  if (!G || (!escalatorLanes().length && !escalatorSideLanes().length)) return;
  const still = a => a.sitting || a.grabbed || a.grabFall || a.eatenBy;
  // 正面的（直的）和側面的（斜的）都試：回傳有沒有被會動的階梯帶著
  const ride = (a, footDy, blocked) => { const front = carryOnEscalator(a, footDy, dt, blocked), side = rideSideEscalator(a, footDy, dt, blocked); return front || side; };
  if (G.player && !still(G.player)) escalatorRideSound(G.player, ride(G.player, ESCALATOR.footDy, playerBlocked));
  for (const t of [...(G.towers || []), ...(G.npcs || [])]) if (!still(t)) ride(t, ESCALATOR.footDy, sentryBlocked);
  for (const e of G.enemies || []) {
    if (e.dead || e.hp <= 0 || e.behavior === 'moth' || still(e)) continue;   // 人面蝶飛在空中
    ride(e, ESCALATOR.enemyFootDy, (x, y) => enemyBlocked(x, y, e));
  }
}

/* ===================== 側面的手扶梯（斜的） ===================== */
function escalatorSideSpec(id) { return ESCALATOR.side.tiles[id] || null; }
// 這個手扶梯能不能當「真的手扶梯」用：上下翻轉、旋轉、調過大小角度的只當一張圖
function escalatorSideUsable(s) {
  return !!escalatorSideSpec(s.id) && !s.fy && !mapStampTurn(s) && !(typeof stampHasTransform === 'function' && stampHasTransform(s));
}
// 三層圖片（第一次用到才下載）
const escalatorSideImgs = {};
function escalatorSideImg(file) {
  let rec = escalatorSideImgs[file];
  if (!rec) { rec = escalatorSideImgs[file] = { img: new Image(), ok: false }; rec.img.onload = () => { rec.ok = true; }; rec.img.src = file; }
  return rec.ok ? rec.img : null;
}
// 階梯面上緣在圖片的第幾個像素高（ix＝圖片的 x）：左邊平台 → 斜坡 → 右邊平台
function escalatorSideTopPx(spec, ix) {
  const t = Math.max(0, Math.min(1, (ix - spec.x0) / (spec.x1 + 1 - spec.x0)));
  return spec.yLow + (spec.yHigh - spec.yLow) * t;
}
// 這張地圖上每座側面手扶梯的位置（世界座標）；換地圖、物件數量變了才重算
let escalatorSideCache = { map: null, n: -1, lanes: [] };
function escalatorSideLanes() {
  if (typeof MAP === 'undefined' || !MAP) return [];
  const n = (MAP.stamps || []).length;
  if (escalatorSideCache.map === MAP && escalatorSideCache.n === n) return escalatorSideCache.lanes;
  const lanes = [];
  for (const s of MAP.stamps || []) {
    if (!escalatorSideUsable(s)) continue;
    const spec = escalatorSideSpec(s.id), t = mapTileById(s.id); if (!t) continue;
    const w = mapTileW(t) * CELL, h = mapTileH(t) * CELL, x = OX + s.c * CELL + (s.ox || 0), y = OY + s.r * CELL + (s.oy || 0);
    // k＝圖片 1 像素在地圖上多大；sortY＝站在上面的人排前後用的值（整張圖之後、前面外殼之前）
    lanes.push({ map: MAP, stamp: s, spec, x, y, w, h, k: w / spec.size, fx: !!s.fx, sortY: s.r * CELL + (s.oy || 0) + h - 1.5 });
  }
  escalatorSideCache = { map: MAP, n, lanes };
  return lanes;
}
const escalatorSideIx = (L, x) => { const ix = (x - L.x) / L.k; return L.fx ? L.spec.size - ix : ix; };   // 世界 x → 圖片 x（左右翻轉的反過來算）
const escalatorSideTopY = (L, x) => L.y + escalatorSideTopPx(L.spec, escalatorSideIx(L, x)) * L.k;        // 這個 x 的階梯面上緣（世界 y）
// 這個點（腳）踩在哪一座側面手扶梯的走道上
function escalatorSideAt(x, y) {
  for (const L of escalatorSideLanes()) {
    if (x < L.x || x >= L.x + L.w) continue;
    const rel = (y - escalatorSideTopY(L, x)) / L.k;
    if (rel >= L.spec.band[0] && rel <= L.spec.band[1]) return L;
  }
  return null;
}
// 這個點（腳）是不是踩進側面手扶梯不能走的地方：後面的扶手以下、整張圖的底部以上，扣掉中間那條走道
function escalatorSideBlocks(x, y) {
  for (const L of escalatorSideLanes()) {
    if (x < L.x || x >= L.x + L.w || y >= L.y + L.h) continue;
    const rel = (y - escalatorSideTopY(L, x)) / L.k;
    if (rel >= -L.spec.back && (rel < L.spec.band[0] || rel > L.spec.band[1])) return true;
  }
  return false;
}
// 階梯往哪邊帶（世界 x 的方向）：沒翻轉的圖右邊高，往上＝往右；左右翻轉、勾了「往下」各反一次
const escalatorSideDir = L => (L.fx ? -1 : 1) * (L.stamp.escDown ? -1 : 1);
// 站在側面手扶梯上的角色：左右走跟著斜坡上下、被階梯帶著走、不能超出扶手。回傳這一幀有沒有被會動的階梯帶著
function rideSideEscalator(a, footDy, dt, blocked) {
  const L = escalatorSideAt(a.x, a.y + footDy);
  if (!L) { a.escSide = null; return false; }
  const top = x => escalatorSideTopY(L, x), S = ESCALATOR.side;
  // 1. 這一幀自己左右走了多遠：高度跟著斜坡變（被撞飛、瞬移不算）
  const walked = a.escSide === L && a.escSX != null && !(a.knockT > 0) && Math.abs(a.x - a.escSX) < CELL ? a.x - a.escSX : 0;
  if (walked) a.y += top(a.x) - top(a.escSX);
  // 2. 會動的手扶梯：在斜坡那一段把人帶著走（逐小步檢查，撞到東西就停）；逆著走會變慢
  let carried = false;
  const onSlope = () => { const ix = escalatorSideIx(L, a.x); return ix >= L.spec.x0 && ix <= L.spec.x1; };
  if (!L.stamp.still && onSlope()) {
    const dir = escalatorSideDir(L), carry = ESCALATOR.speed * S.xSpeed * dt, against = walked * dir < 0 ? Math.abs(walked) : 0;
    let move = carry + (against ? Math.max(0, Math.min(against * ESCALATOR.againstSlow, against * (1 - ESCALATOR.againstMinKeep) - carry)) : 0);
    carried = true;
    while (move > 0) {
      const s = Math.min(4, move); move -= s;
      const nx = a.x + dir * s, ny = a.y + top(nx) - top(a.x);
      if (blocked(nx, ny)) break;
      a.x = nx; a.y = ny;
      if (!onSlope()) break;   // 到平台了
    }
  }
  // 3. 不能貼到扶手：腳離走道上下邊緣至少 edge 像素
  const rel = (a.y + footDy - top(a.x)) / L.k, keep = Math.max(L.spec.band[0] + S.edge, Math.min(L.spec.band[1] - S.edge, rel));
  if (keep !== rel) a.y += (keep - rel) * L.k;
  a.escSide = L; a.escSX = a.x;
  return carried;
}
// 站在側面手扶梯上的人排前後用的值（js/render.js）：排在整張手扶梯之後、前面的扶手外殼之前；不在上面就用原本的 y
function escalatorRiderSortY(a, y) {
  const L = a && a.escSide;
  return L && L.map === MAP ? L.sortY + a.y * 1e-4 : y;
}
// 整張側面手扶梯排前後用的值（js/maploader.js 的 mapOccluders）：比站在上面的人早一點；不是側面手扶梯回傳 null
function escalatorSideSortY(s, bottomY) { return escalatorSideUsable(s) ? bottomY - 2 : null; }
// 畫整張側面手扶梯（已經在翻轉好的座標裡）：回傳 true＝已經畫好
function drawSideEscalator(ctx, s, img, x, y, w, h) {
  const spec = escalatorSideSpec(s.id);
  if (s.still || !escalatorSideUsable(s) || !img.naturalWidth) return false;   // 不會動的：當一般圖片畫
  const bottom = escalatorSideImg(spec.bottom), middle = escalatorSideImg(spec.middle), cover = escalatorSideImg(spec.cover);
  if (!bottom || !middle || !cover) return false;
  ctx.drawImage(img, x, y, w, h);
  const k = w / spec.size, P = spec.stepX;
  let p = Math.floor(escalatorPhase * ESCALATOR.side.xSpeed / k) % P;   // 階梯往旁邊捲了幾個原始像素（取整數，像素圖才不會糊）
  if (s.escDown) p = (P - p) % P;
  if (!p) return true;
  // 只拿階梯圖裡「階梯」那一段來捲（sx 起、寬 sw），兩頭平台的部分不要跟著跑
  const up = Math.round(p * spec.stepY / P), sx = spec.x0 - spec.mx, sw = spec.x1 - spec.x0, sh = middle.naturalHeight;
  const steps = (dx, dy) => ctx.drawImage(middle, sx, 0, sw, sh, x + (spec.x0 + dx) * k, y + (spec.my + dy) * k, sw * k, sh * k);
  ctx.save();
  ctx.beginPath(); ctx.rect(x + spec.x0 * k, y, (spec.x1 - spec.x0) * k, h); ctx.clip();   // 只重畫斜坡那一段，兩頭的平台不動
  ctx.drawImage(bottom, x, y, w, h);   // 先用後面的牆把原本的階梯蓋掉
  steps(p, -up);                       // 整排階梯斜斜地往上移
  steps(p - P, -up + spec.stepY);      // 後面再接一排，補上最下面空出來的那一階
  ctx.restore();
  ctx.drawImage(cover, x, y, w, h);
  return true;
}
// 前面的扶手和外殼：跟角色一起排前後，蓋在站在手扶梯上的人身上（js/render.js）
function escalatorSortables(out) {
  for (const L of escalatorSideLanes()) {
    const cover = escalatorSideImg(L.spec.cover); if (!cover) continue;
    if (typeof stampInDrawRect === 'function' && !stampInDrawRect(L.stamp)) continue;   // 不在畫面上
    out.push({ y: L.sortY + 1, draw: () => {
      if (L.fx) { ctx.save(); ctx.translate(L.x + L.w, L.y); ctx.scale(-1, 1); ctx.drawImage(cover, 0, 0, L.w, L.h); ctx.restore(); }
      else ctx.drawImage(cover, L.x, L.y, L.w, L.h);
    } });
  }
}
