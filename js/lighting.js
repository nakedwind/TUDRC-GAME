/* ===== 黑暗與光源系統 =====
   格子擴散光：光沿格子流動、碰固定牆就停（牆後全黑）。
   亮度設定在 data/balance.js 的 LIGHT；這裡是計算與繪製。
*/
// ---- 黑暗與光源（格子擴散光）----
// 原理：光從光源所在的格子出發，沿格子一格一格往外「流」，每走一格亮度衰減，
// 碰到固定牆就停（牆本身會被照亮、但光不會穿到牆後）。
// 渲染：把每格亮度畫成「一格一像素」的小圖，再放大貼到畫面上，
// 瀏覽器的平滑縮放會自動把格子感柔化成漸層。
let lightsCache = [];   // 這一幀的所有光源（世界座標），每幀在 draw() 開頭更新

const LIT_MIN = 0.1;                                   // 亮度低於這個值視為「黑暗」
const lightField = new Float32Array(COLS * ROWS);      // 每格亮度 0～1
const lightDist = new Float32Array(COLS * ROWS);       // BFS 暫存
const fieldCv = document.createElement('canvas');      // 一格一像素的黑幕小圖
fieldCv.width = COLS; fieldCv.height = ROWS;
const fieldCtx = fieldCv.getContext('2d');
const fieldImg = fieldCtx.createImageData(COLS, ROWS);

// 8 方向擴散（斜向成本 1.4，讓光圈接近圓形）
const LIGHT_DIRS = [[0, 1, 1], [0, -1, 1], [1, 0, 1], [-1, 0, 1], [1, 1, 1.4], [1, -1, 1.4], [-1, 1, 1.4], [-1, -1, 1.4]];
function computeLightField() {
  lightField.fill(0);
  if (!LIGHT.enabled) return;
  for (const l of lightsCache) {
    const steps = l.r / CELL;                          // 這盞燈的光能走幾格
    const [sc, sr] = cellAt(l.x, l.y);
    if (!inGrid(sc, sr)) continue;
    lightDist.fill(Infinity);
    // 平滑補間：用光源「實際座標」到附近格子中心的真實距離當起始距離，
    // 角色在格子內移動時亮度會連續滑動，光就不會一格一格跳。
    const q = [];
    for (let dc = -1; dc <= 1; dc++) for (let dr = -1; dr <= 1; dr++) {
      const c0 = sc + dc, r0 = sr + dr;
      if (!inGrid(c0, r0)) continue;
      if (dc && dr && isWall(sc + dc, sr) && isWall(sc, sr + dr)) continue;   // 斜角不穿牆縫
      const [cx, cy] = center(c0, r0);
      const d0 = Math.hypot(cx - l.x, cy - l.y) / CELL;
      const i0 = r0 * COLS + c0;
      if (d0 < lightDist[i0]) { lightDist[i0] = d0; q.push(i0); }
    }
    let head = 0;
    while (head < q.length) {
      const idx = q[head++], c = idx % COLS, r = (idx - c) / COLS, d = lightDist[idx];
      if (d >= steps) continue;
      if (isWall(c, r) && idx !== sr * COLS + sc) continue;   // 牆會被照亮，但光到此為止
      for (const [dc, dr, w] of LIGHT_DIRS) {
        const nc = c + dc, nr = r + dr;
        if (!inGrid(nc, nr)) continue;
        if (dc && dr && isWall(c + dc, r) && isWall(c, r + dr)) continue;   // 斜向不能穿牆角
        const nd = d + w, ni = nr * COLS + nc;
        if (nd < lightDist[ni]) { lightDist[ni] = nd; q.push(ni); }
      }
    }
    for (let i = 0; i < lightField.length; i++) {
      if (lightDist[i] < Infinity) {
        const b = 1 - lightDist[i] / steps;
        if (b > lightField[i]) lightField[i] = b;
      }
    }
  }
}

function getLights() {
  const L = [];
  // 玩家（嚮導提燈）
  if (G && G.player) L.push({ x: G.player.x, y: G.player.y, r: LIGHT.playerR });
  // 營地常亮（沒自訂營地就用預設最下排）
  if (campCells.size) campCells.forEach(k => { const [c, r] = k.split(',').map(Number); const [x, y] = center(c, r); L.push({ x, y, r: LIGHT.campR }); });
  else for (let c = 0; c < COLS; c++) { const [x, y] = center(c, ROWS - 1); L.push({ x, y, r: LIGHT.campR }); }
  // 會發光的建築（探照燈等，半徑設定在 balance.js 的 LIGHT.buildings）
  // 光照範圍固定；warm/phase 是給「暖色呼吸光暈」裝飾用的（每盞燈相位錯開）
  if (G) for (const o of G.obstacles) {
    const lr = o.type && LIGHT.buildings[o.type];
    if (lr) L.push({ x: OX + (o.c + (o.w || 1) / 2) * CELL, y: OY + (o.r + (o.h || 1) / 2) * CELL, r: lr, warm: true, phase: o.c * 7 + o.r * 13 });
  }
  return L;
}
function isLit(x, y) {
  if (!LIGHT.enabled) return true;
  const [c, r] = cellAt(x, y);
  return inGrid(c, r) && lightField[r * COLS + c] > LIT_MIN;
}
const cellLit = (c, r) => inGrid(c, r) && (!LIGHT.enabled || lightField[r * COLS + c] > LIT_MIN);
// 「靠近光」判定：自己亮、或距離亮格在 extra 像素（換算格數）以內（探照燈蓋在光圈邊緣用）
function cellNearLight(c, r, extra) {
  if (!LIGHT.enabled) return true;
  const k = Math.ceil(extra / CELL);
  for (let dc = -k; dc <= k; dc++) for (let dr = -k; dr <= k; dr++) {
    if (cellLit(c + dc, r + dr)) return true;
  }
  return false;
}

function drawDarkness() {
  if (!LIGHT.enabled) return;
  // 探照燈的暖色呼吸光暈：畫在黑幕「之前」，牆後陰影會自然把它蓋掉
  const now = performance.now() / 1000;
  for (const l of lightsCache) {
    if (!l.warm) continue;
    const sx = l.x - cam.x, sy = l.y - cam.y;
    if (sx < -l.r || sy < -l.r || sx > VIEW_W + l.r || sy > VIEW_H + l.r) continue;
    const a = 0.12 + 0.05 * Math.sin(now * 1.8 + l.phase);   // 暖光強度（基礎 + 呼吸幅度）
    const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, l.r * 0.85);
    g.addColorStop(0, 'rgba(255,185,105,' + a.toFixed(3) + ')');
    g.addColorStop(1, 'rgba(255,185,105,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(sx, sy, l.r * 0.85, 0, Math.PI * 2); ctx.fill();
  }
  // 亮度場 → 黑幕小圖（一格一像素），放大貼上時自動平滑成漸層
  const px = fieldImg.data, maxA = Math.round(LIGHT.darkness * 255);
  for (let i = 0; i < lightField.length; i++) {
    const b = Math.min(1, lightField[i]);
    const o = i * 4;
    px[o] = 0; px[o + 1] = 0; px[o + 2] = 0;
    px[o + 3] = Math.round(maxA * (1 - b));
  }
  fieldCtx.putImageData(fieldImg, 0, 0);
  const mx = OX - cam.x, my = OY - cam.y, mw = COLS * CELL, mh = ROWS * CELL;
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(fieldCv, mx, my, mw, mh);
  // 地圖範圍以外的畫面也保持黑暗
  ctx.fillStyle = 'rgba(0,0,0,' + LIGHT.darkness + ')';
  if (my > 0) ctx.fillRect(0, 0, VIEW_W, my);
  if (my + mh < VIEW_H) ctx.fillRect(0, my + mh, VIEW_W, VIEW_H - my - mh);
  if (mx > 0) ctx.fillRect(0, Math.max(0, my), mx, Math.min(VIEW_H, mh));
  if (mx + mw < VIEW_W) ctx.fillRect(mx + mw, Math.max(0, my), VIEW_W - mx - mw, Math.min(VIEW_H, mh));
}
