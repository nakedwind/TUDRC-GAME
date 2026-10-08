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
let lightField = new Float32Array(COLS * ROWS);        // 每格亮度 0～1
let warmField = new Float32Array(COLS * ROWS);         // 探照燈暖色量（沿用同一份遮牆結果）
let lightDist = new Float32Array(COLS * ROWS);         // BFS 暫存
let flashField = new Float32Array(COLS * ROWS);        // 攻擊閃光的亮度（只影響畫面，不算進遊戲的「亮處」判定）
const fieldCv = document.createElement('canvas');      // 一格一像素的黑幕小圖
fieldCv.width = COLS; fieldCv.height = ROWS;
const fieldCtx = fieldCv.getContext('2d');
let fieldImg = fieldCtx.createImageData(COLS, ROWS);
const warmCv = document.createElement('canvas');       // 暖色光層，同樣是一格一像素再平滑放大
warmCv.width = COLS; warmCv.height = ROWS;
const warmCtx = warmCv.getContext('2d');
let warmImg = warmCtx.createImageData(COLS, ROWS);

// 切換地圖後尺寸會變，這些暫存要跟著重新配置，否則亮度會算進錯的格子→全黑。
let lightBufCols = COLS, lightBufRows = ROWS;
function ensureLightBuffers() {
  if (COLS === lightBufCols && ROWS === lightBufRows) return;
  lightBufCols = COLS; lightBufRows = ROWS;
  lightField = new Float32Array(COLS * ROWS);
  warmField = new Float32Array(COLS * ROWS);
  lightDist = new Float32Array(COLS * ROWS);
  flashField = new Float32Array(COLS * ROWS);
  fieldCv.width = COLS; fieldCv.height = ROWS; fieldImg = fieldCtx.createImageData(COLS, ROWS);
  warmCv.width = COLS; warmCv.height = ROWS; warmImg = warmCtx.createImageData(COLS, ROWS);
}

// 8 方向擴散（斜向成本 1.4，讓光圈接近圓形）
const LIGHT_DIRS = [[0, 1, 1], [0, -1, 1], [1, 0, 1], [-1, 0, 1], [1, 1, 1.4], [1, -1, 1.4], [-1, 1, 1.4], [-1, -1, 1.4]];
function computeLightField() {
  ensureLightBuffers();   // 地圖尺寸變了就先重建暫存
  lightField.fill(0);
  warmField.fill(0);
  if (!LIGHT.enabled) return;
  for (const l of lightsCache) spreadLight(l, (i, b) => {
    if (b > lightField[i]) lightField[i] = b;
    if (l.warm && b > warmField[i]) warmField[i] = b;
  });
}
// 從一個光源沿格子擴散，對每個被照到的格子呼叫 onCell(格子編號, 亮度 0～1)
function spreadLight(l, onCell) {
  {
    const steps = l.r / CELL;                          // 這盞燈的光能走幾格
    const [sc, sr] = cellAt(l.x, l.y);
    if (!inGrid(sc, sr)) return;
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
    for (let i = 0; i < lightDist.length; i++) {
      if (lightDist[i] < Infinity) onCell(i, 1 - lightDist[i] / steps);
    }
  }
}

// ---- 攻擊閃光（槍口火光、火焰、雷擊…）----
// 種類與數值在 js/attack-fx.js 的 LIGHT_FLASH。閃光同樣會被牆擋住，
// 但只是「畫面變亮、看得到怪物」，不會讓哨兵索敵、蓋建築等判定把那裡當成亮處。
function flashStrength(f) { return Math.pow(Math.max(0, f.life / f.life0), 1.6) * f.power; }
// 只影響畫面的光：攻擊閃光＋甦醒的異質核心
function visualLights() {
  if (!G) return [];
  return [...(G.lightFlashes || []), ...(typeof coreGlowLights === 'function' ? coreGlowLights() : []),
          ...(typeof oreGlowLights === 'function' ? oreGlowLights() : [])];   // 礦物的紫光（js/ore.js）
}
function computeFlashField() {
  flashField.fill(0);
  const list = visualLights();
  if (!LIGHT.enabled || !list.length) return;
  for (const f of list) {
    const k = flashStrength(f);
    if (k > .02) spreadLight(f, (i, b) => { const v = b * k; if (v > flashField[i]) flashField[i] = v; });
  }
}
// 畫面上看不看得到（亮處，或正被攻擊閃光照到）。只給繪圖用。
function isVisible(x, y) {
  if (isLit(x, y)) return true;
  const [c, r] = cellAt(x, y);
  return inGrid(c, r) && flashField[r * COLS + c] > LIT_MIN;
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
    if (o.isBase) {
      // 光源跟著圖片的像素微調走；o.c/o.r 是碰撞用的整格座標。
      const x0 = o.artX ?? OX + o.c * CELL, y0 = o.artY ?? OY + o.r * CELL;
      const w = (o.w || 11) * CELL, h = (o.h || 8) * CELL;
      // 基地中央提供穩定環境光；四角燈各自提供暖色光與光暈。
      L.push({ x: x0 + w / 2, y: y0 + h / 2, r: LIGHT.baseR || 300 });
      const lampR = LIGHT.baseLampR || 190;
      const lamps = [
        [x0 + 17, y0 + 46],
        [x0 + w - 18, y0 + 46],
        [x0 + 17, y0 + h - 63],
        [x0 + w - 18, y0 + h - 63],
      ];
      lamps.forEach(([x, y], i) => L.push({ x, y, visualX: x, visualY: y, r: lampR, warm: true, single: true, phase: i * 1.7 }));
    }
    const lr = o.type && LIGHT.buildings[o.type];
    if (lr) {
      const x = OX + (o.c + (o.w || 1) / 2) * CELL;
      const y = OY + (o.r + (o.h || 1) / 2) * CELL;
      // 燈頭在 1×2 圖片的上方；visualY 只影響光暈位置，不改遊戲照明判定。
      const visualY = OY + (o.r + Math.min(0.38, (o.h || 1) * 0.3)) * CELL + 10;
      L.push({ x, y, visualX: x, visualY, r: lr, warm: true,
        single: o.type === 'camping_lights', phase: o.c * 7 + o.r * 13 });
    }
  }
  if (typeof flickerLightSources === 'function') L.push(...flickerLightSources());   // 不穩定的日光燈：亮著時才算光（js/flicker-light.js）
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
  const now = performance.now() / 1000;

  // 雙燈向上投射的柔和光束。先畫光束、再蓋黑幕，牆後區域會被照明遮罩自然壓暗。
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  function drawBeam(x0, y0, x1, y1, nearHalf, farHalf, alpha) {
    const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy) || 1;
    const px = -dy / len, py = dx / len;
    const beam = ctx.createLinearGradient(x0, y0, x1, y1);
    beam.addColorStop(0, 'rgba(255,239,184,' + alpha + ')');
    beam.addColorStop(0.35, 'rgba(255,216,132,' + (alpha * 0.7).toFixed(3) + ')');
    beam.addColorStop(1, 'rgba(255,190,92,0)');
    ctx.fillStyle = beam;
    ctx.beginPath();
    ctx.moveTo(x0 + px * nearHalf, y0 + py * nearHalf);
    ctx.lineTo(x1 + px * farHalf, y1 + py * farHalf);
    ctx.lineTo(x1 - px * farHalf, y1 - py * farHalf);
    ctx.lineTo(x0 - px * nearHalf, y0 - py * nearHalf);
    ctx.closePath(); ctx.fill();
  }
  for (const l of lightsCache) {
    if (!l.warm) continue;
    const sx = (l.visualX ?? l.x), sy = (l.visualY ?? l.y);   // 世界座標（黑幕跟著畫面縮放一起畫）
    const beamLen = Math.min(l.r * 0.78, 220);
    const pulse = 0.95 + 0.05 * Math.sin(now * 1.8 + l.phase);
    // 外層低透明度負責柔邊，內層窄光束提供方向感。
    if (l.single) {
      drawBeam(sx, sy - 2, sx, sy - beamLen, 5, 52, 0.08 * pulse);
      drawBeam(sx, sy - 2, sx, sy - beamLen * 0.9, 3, 29, 0.11 * pulse);
    } else {
      drawBeam(sx - 9, sy - 2, sx - 38, sy - beamLen, 5, 55, 0.075 * pulse);
      drawBeam(sx + 9, sy - 2, sx + 38, sy - beamLen, 5, 55, 0.075 * pulse);
      drawBeam(sx - 9, sy - 2, sx - 25, sy - beamLen * 0.9, 3, 31, 0.105 * pulse);
      drawBeam(sx + 9, sy - 2, sx + 25, sy - beamLen * 0.9, 3, 31, 0.105 * pulse);
    }
  }
  ctx.restore();

  // 亮度場 → 黑幕小圖（一格一像素），放大貼上時自動平滑成漸層
  const px = fieldImg.data, maxA = Math.round(LIGHT.darkness * 255);
  for (let i = 0; i < lightField.length; i++) {
    // 只改視覺曲線：中段亮度更柔順，實際的 isLit 判定仍使用原始 lightField。
    const b = Math.pow(Math.min(1, Math.max(lightField[i], flashField[i])), 0.78);   // 攻擊閃光也會暫時掀開黑幕
    const o = i * 4;
    px[o] = 0; px[o + 1] = 0; px[o + 2] = 0;
    px[o + 3] = Math.round(maxA * (1 - b));
  }
  fieldCtx.putImageData(fieldImg, 0, 0);
  const mx = OX, my = OY, mw = COLS * CELL, mh = ROWS * CELL;
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(fieldCv, mx, my, mw, mh);

  // 探照燈的環境暖光也使用格子擴散遮罩，因此不會穿過牆壁。
  const wp = warmImg.data;
  for (let i = 0; i < warmField.length; i++) {
    const w = Math.pow(Math.min(1, warmField[i]), 0.72), o = i * 4;
    wp[o] = 255; wp[o + 1] = 174; wp[o + 2] = 82;
    wp[o + 3] = Math.round(58 * w);
  }
  warmCtx.putImageData(warmImg, 0, 0);
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = 0.92 + Math.sin(now * 1.45) * 0.04;
  ctx.drawImage(warmCv, mx, my, mw, mh);
  ctx.restore();

  // 燈頭附近的柔光與左右兩顆亮芯；控制半徑，避免白光蓋住燈具圖片。
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const l of lightsCache) {
    if (!l.warm) continue;
    const sx = (l.visualX ?? l.x), sy = (l.visualY ?? l.y);
    if (sx < cam.x - 80 || sy < cam.y - 80 || sx > cam.x + viewW() + 80 || sy > cam.y + viewH() + 80) continue;
    const pulse = 1 + 0.045 * Math.sin(now * 1.8 + l.phase);
    const haloR = 42 * pulse;
    const halo = ctx.createRadialGradient(sx, sy, 0, sx, sy, haloR);
    halo.addColorStop(0, 'rgba(255,239,185,.25)');
    halo.addColorStop(0.2, 'rgba(255,211,118,.19)');
    halo.addColorStop(0.58, 'rgba(255,177,72,.08)');
    halo.addColorStop(1, 'rgba(255,154,45,0)');
    ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(sx, sy, haloR, 0, Math.PI * 2); ctx.fill();

    for (const lampX of (l.single ? [sx] : [sx - 9, sx + 9])) {
      const coreR = 5.5 * pulse;
      const core = ctx.createRadialGradient(lampX, sy, 0, lampX, sy, coreR);
      core.addColorStop(0, 'rgba(255,255,238,.82)');
      core.addColorStop(0.32, 'rgba(255,235,160,.58)');
      core.addColorStop(1, 'rgba(255,187,78,0)');
      ctx.fillStyle = core; ctx.beginPath(); ctx.arc(lampX, sy, coreR, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();

  // 攻擊閃光的色光（火焰偏橘、雷擊偏藍白…），疊在黑幕上面
  if (visualLights().length) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (const f of visualLights()) {
      const k = flashStrength(f);
      if (k <= .02) continue;
      const R = f.r * .75, [cr, cg, cb] = f.color;
      const glow = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, R);
      glow.addColorStop(0, 'rgba(' + cr + ',' + cg + ',' + cb + ',' + (.38 * k).toFixed(3) + ')');
      glow.addColorStop(.45, 'rgba(' + cr + ',' + cg + ',' + cb + ',' + (.14 * k).toFixed(3) + ')');
      glow.addColorStop(1, 'rgba(' + cr + ',' + cg + ',' + cb + ',0)');
      ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(f.x, f.y, R, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  // 地圖範圍以外的畫面也保持黑暗（vx/vy/vw/vh＝目前看得到的世界範圍）
  const vx = cam.x, vy = cam.y, vw = viewW(), vh = viewH();
  ctx.fillStyle = 'rgba(0,0,0,' + LIGHT.darkness + ')';
  if (my > vy) ctx.fillRect(vx, vy, vw, my - vy);
  if (my + mh < vy + vh) ctx.fillRect(vx, my + mh, vw, vy + vh - my - mh);
  if (mx > vx) ctx.fillRect(vx, Math.max(vy, my), mx - vx, Math.min(vh, mh));
  if (mx + mw < vx + vw) ctx.fillRect(mx + mw, Math.max(vy, my), vx + vw - mx - mw, Math.min(vh, mh));
}
