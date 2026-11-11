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
const LIGHT_FILL_SOLID = 4;                            // 大物件（置物櫃等）裡面最多補亮幾格深，避免中間黑一塊
let lightField = new Float32Array(COLS * ROWS);        // 每格亮度 0～1
let warmField = new Float32Array(COLS * ROWS);         // 探照燈暖色量（沿用同一份遮牆結果）
let lightDist = new Float32Array(COLS * ROWS).fill(Infinity);   // BFS 暫存：平常全是 Infinity，spreadLight 用完只把碰過的格子改回來
let flashField = new Float32Array(COLS * ROWS);        // 攻擊閃光的亮度（只影響畫面，不算進遊戲的「亮處」判定）
let visField = new Float32Array(COLS * ROWS);          // 畫黑幕用的亮度：不含溫特身上的燈（頭燈、手電筒另外用平滑的形狀挖開，見 drawDarkness）
let beamMask = new Float32Array(COLS * ROWS);          // 溫特身上的燈照得到的格子（只看牆有沒有擋住）
const fieldCv = document.createElement('canvas');      // 一格一像素的黑幕小圖
fieldCv.width = COLS; fieldCv.height = ROWS;
const fieldCtx = fieldCv.getContext('2d');
let fieldImg = fieldCtx.createImageData(COLS, ROWS);
const darkCv = document.createElement('canvas'), darkCtx = darkCv.getContext('2d');   // 有手電筒時：黑幕先畫在這裡，挖掉光束再貼上
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
  lightDist = new Float32Array(COLS * ROWS).fill(Infinity);
  flashField = new Float32Array(COLS * ROWS);
  visField = new Float32Array(COLS * ROWS);
  beamMask = new Float32Array(COLS * ROWS);
  fieldCv.width = COLS; fieldCv.height = ROWS; fieldImg = fieldCtx.createImageData(COLS, ROWS);
  warmCv.width = COLS; warmCv.height = ROWS; warmImg = warmCtx.createImageData(COLS, ROWS);
}

// ---- 光照用的牆格子表 ----
// isWall 每次都要組 'c,r' 字串再查 Set，光照一幀要查好幾萬次，大地圖會很慢。
// 所以每幀開頭把 mapWalls 轉成一格一個數字的表（字串→格子編號記起來重複用），擴散時直接查表。
let lightWalls = new Uint8Array(COLS * ROWS);
let lightWallKeyIdx = new Map(), lightWallKeyCols = COLS, lightWallKeyRows = ROWS;
function refreshLightWalls() {
  if (lightWalls.length !== COLS * ROWS) lightWalls = new Uint8Array(COLS * ROWS);
  if (lightWallKeyCols !== COLS || lightWallKeyRows !== ROWS) { lightWallKeyIdx = new Map(); lightWallKeyCols = COLS; lightWallKeyRows = ROWS; }
  lightWalls.fill(0);
  for (const k of mapWalls) {
    let i = lightWallKeyIdx.get(k);
    if (i === undefined) {
      const [c, r] = k.split(',').map(Number);
      i = inGrid(c, r) ? r * COLS + c : -1;   // 地圖外的格子不用記
      lightWallKeyIdx.set(k, i);
    }
    if (i >= 0) lightWalls[i] = 1;
  }
}
// 陸橋用：lightSurf＝每一格最上面是哪一層（0 一樓、1 二樓地面、2 樓層出入口：兩層都算）；lightWalls2＝二樓的人看到的牆（不是 2 樓地面的格子都算牆）
let beamNoLos = false;
let lightSurf = new Uint8Array(COLS * ROWS), lightWalls2 = new Uint8Array(COLS * ROWS), lightSkipSurf = -1;
function refreshLightFloors() {
  if (lightSurf.length !== COLS * ROWS) { lightSurf = new Uint8Array(COLS * ROWS); lightWalls2 = new Uint8Array(COLS * ROWS); }
  lightSurf.fill(0); lightWalls2.fill(1);
  const idx = k => { let i = lightWallKeyIdx.get(k); if (i === undefined) { const [c, r] = k.split(',').map(Number); i = inGrid(c, r) ? r * COLS + c : -1; lightWallKeyIdx.set(k, i); } return i; };
  if (typeof floor2ArtCells === 'function') for (const k of floor2ArtCells().all) { const i = idx(k); if (i >= 0) lightSurf[i] = 1; }   // 2 樓的圖（牆、柱子上半段…）蓋到的格子：畫面上是 2 樓的東西，吃 2 樓的光（但還是擋路、擋光）
  for (const k of deckCells) { const i = idx(k); if (i >= 0) { lightSurf[i] = 1; lightWalls2[i] = 0; } }
  for (const k of rampCells) { const i = idx(k); if (i >= 0) { lightSurf[i] = 2; lightWalls2[i] = lightWalls[i]; } }
  // 樓梯／手扶梯的上半段（js/maploader.js 的 stairUpperRects）：跟樓層出入口一樣兩層的光都吃、二樓的光也走得過去
  if (typeof stairUpperRects !== 'undefined') { if (MAP) mapOccluders(); for (const b of stairUpperRects) for (let c = Math.floor((b.x0 - OX) / CELL); c * CELL + OX < b.x1; c++) for (let r = Math.floor((b.y0 - OY) / CELL); r * CELL + OY < b.y1; r++) { if (!inGrid(c, r)) continue; const i = r * COLS + c; if (lightSurf[i] !== 1 || lightWalls2[i] !== 0) { lightSurf[i] = 2; lightWalls2[i] = lightWalls[i]; } } }
  return true;
}
// 2 樓的牆面：牆的圖有好幾格高，光只擴散得到牆腳那一格 → 牆面跟著「正下方最近的 2 樓地面」一起亮（往下找最多 4 格），不然整面牆是黑的
const LIGHT_F2_WALL_ROWS = 4;
function lightFloor2WallFaces() {
  for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++) {
    const i = r * COLS + c;
    if (lightSurf[i] !== 1 || lightWalls2[i] === 0) continue;   // 只處理「2 樓的圖蓋著、但不是 2 樓地面」的格子（牆、柱子）
    for (let d = 1; d <= LIGHT_F2_WALL_ROWS && r + d < ROWS; d++) {
      const j = (r + d) * COLS + c;
      if (lightWalls2[j] !== 0) continue;
      if (lightField[j] > lightField[i]) lightField[i] = lightField[j];
      if (visField[j] > visField[i]) visField[i] = visField[j];
      if (warmField[j] > warmField[i]) warmField[i] = warmField[j];
      if (beamMask[j] > beamMask[i]) beamMask[i] = beamMask[j];
      break;
    }
  }
}
const lightWall = (c, r) => c >= 0 && c < COLS && r >= 0 && r < ROWS && lightWalls[r * COLS + c] === 1;   // 跟 isWall 一樣，只是查表

// 8 方向擴散（斜向成本 1.4，讓光圈接近圓形）
const LIGHT_DIRS = [[0, 1, 1], [0, -1, 1], [1, 0, 1], [-1, 0, 1], [1, 1, 1.4], [1, -1, 1.4], [-1, 1, 1.4], [-1, -1, 1.4]];
function computeLightField() {
  ensureLightBuffers();   // 地圖尺寸變了就先重建暫存
  lightField.fill(0);
  warmField.fill(0);
  visField.fill(0);
  beamMask.fill(0);
  if (!LIGHT.enabled) return;
  refreshLightWalls();   // 這一幀的牆（門開關、炸牆都會改 mapWalls）；緊接著的 computeFlashField 也沿用
  // 陸橋：一樓的燈照一樓的牆擴散、只照亮「不是 2 樓地面」的格子；二樓的燈只在 2 樓地面（和樓層出入口）上擴散、只照亮那些格子。
  // 畫面上每一格看到的是最上面那一層：2 樓地面的格子顯示二樓的亮度，其他格子顯示一樓的亮度。
  const walls1 = lightWalls, twoFloors = hasFloors && refreshLightFloors();
  const keepCtx = floorCtx, keepRamp = floorOnRamp, keepDeck = floorOnDeck;
  losNoFloors = true;
  // floor 0 的燈（溫特站在樓梯上時手上的燈）兩層各照一次
  const passes = []; for (const l of lightsCache) { if (twoFloors && l.floor === 0) passes.push([l, 1], [l, 2]); else passes.push([l, l.floor === 2 ? 2 : 1]); }
  for (const [l, lf] of passes) {
    const f2 = twoFloors && lf === 2;
    beamNoLos = f2 && l.floor === 0;   // 從樓梯往 2 樓照：樓梯在二樓的規則裡算牆，視線判定會全擋掉，這時只靠格子擴散
    if (twoFloors) { lightWalls = f2 ? lightWalls2 : walls1; lightSkipSurf = f2 ? 0 : 1; floorCtx = f2 ? 2 : 1; floorOnRamp = false; floorOnDeck = false; }
    spreadLight(l, (i, b) => {
      if (twoFloors && lightSurf[i] === lightSkipSurf) return;   // 這一格屬於另一層
      b *= l.intensity ?? 1;
      if (b > lightField[i]) lightField[i] = b;          // 遊戲判定（亮處）：手電筒照常用格子扇形
      if (!l.smooth && b > visField[i]) visField[i] = b;   // 畫面：頭燈、手電筒另外畫
      if (l.warm && b > warmField[i]) warmField[i] = b;
    });
    if (l.smooth) markBeamMask(l);   // 頭燈、手電筒畫面上照得到的格子（牆後面不會亮）
  }
  beamNoLos = false;
  if (twoFloors) lightFloor2WallFaces();
  lightWalls = walls1; lightSkipSurf = -1; losNoFloors = false; floorCtx = keepCtx; floorOnRamp = keepRamp; floorOnDeck = keepDeck;
  if (typeof lightBreakableWallFaces === 'function') lightBreakableWallFaces([lightField, visField, warmField]);   // 可炸開的牆：牆面跟著牆腳一起亮（js/breakable-walls.js）
}
// 頭燈、手電筒畫面上照得到的格子：格子擴散（不限扇形，讓柔邊也有地方亮；範圍多一點給柔邊）＋從燈到格子要「直線看得到」。
// 只靠格子擴散的話，光會從門口繞過牆角、或穿過比一格薄的牆，跑到牆的另一邊。
function markBeamMask(l) {
  const cone = l.cone, ca = cone ? Math.cos(cone.ang) : 0, sa = cone ? Math.sin(cone.ang) : 0, wide = cone ? Math.cos(Math.min(Math.PI, cone.half + .45)) : -2;
  spreadLight({ ...l, cone: null, r: l.r * 1.25 }, (i, b) => {
    if (b <= 0) return;
    const c = i % COLS, r = (i - c) / COLS;
    let [x, y] = center(c, r);
    const dx = x - l.x, dy = y - l.y, d = Math.hypot(dx, dy);
    if (d > CELL * 1.2 && (dx * ca + dy * sa) / d < wide) return;   // 離扇形太遠的不用管（省時間）
    if (lightWall(c, r)) { const k = Math.max(0, (d - CELL * .5) / (d || 1)); x = l.x + dx * k; y = l.y + dy * k; }   // 牆本身：看朝向手電筒那一面
    if (lightSkipSurf >= 0 && lightSurf[i] === lightSkipSurf) return;   // 陸橋：另一層的格子不照
    if (beamNoLos || d <= CELL * .75 || hasLineOfSight(l.x, l.y, x, y)) beamMask[i] = 1;
  });
}
// 從一個光源沿格子擴散，對每個被照到的格子呼叫 onCell(格子編號, 亮度 0～1)
// 只處理光走得到的格子（記在 q 裡），不掃整張地圖：大地圖、燈又多的時候每幀省很多時間。
function spreadLight(l, onCell) {
  {
    const steps = l.r / CELL;                          // 這盞燈的光能走幾格
    const [sc, sr] = cellAt(l.x, l.y);
    if (!inGrid(sc, sr)) return;
    const coneK = l.cone ? coneFactor(l) : null;       // 扇形光（手電筒）：格子在扇形裡多少（0～1）
    // 平滑補間：用光源「實際座標」到附近格子中心的真實距離當起始距離，
    // 角色在格子內移動時亮度會連續滑動，光就不會一格一格跳。
    const q = [];
    for (let dc = -1; dc <= 1; dc++) for (let dr = -1; dr <= 1; dr++) {
      const c0 = sc + dc, r0 = sr + dr;
      if (!inGrid(c0, r0)) continue;
      if (dc && dr && lightWall(sc + dc, sr) && lightWall(sc, sr + dr)) continue;   // 斜角不穿牆縫
      const [cx, cy] = center(c0, r0);
      const d0 = Math.hypot(cx - l.x, cy - l.y) / CELL;
      const i0 = r0 * COLS + c0;
      if (d0 < lightDist[i0]) { lightDist[i0] = d0; q.push(i0); }
    }
    let head = 0;
    while (head < q.length) {
      const idx = q[head++], c = idx % COLS, r = (idx - c) / COLS, d = lightDist[idx];
      if (d >= steps) continue;
      if (lightWall(c, r) && idx !== sr * COLS + sc) continue;   // 牆會被照亮，但光到此為止
      for (const [dc, dr, w] of LIGHT_DIRS) {
        const nc = c + dc, nr = r + dr;
        if (!inGrid(nc, nr)) continue;
        if (dc && dr && lightWall(c + dc, r) && lightWall(c, r + dr)) continue;   // 斜向不能穿牆角
        const nd = d + w, ni = nr * COLS + nc;
        if (coneK && coneK(nc, nr) <= 0) continue;    // 扇形外面：光不往那裡走
        if (nd < lightDist[ni]) { lightDist[ni] = nd; q.push(ni); }
      }
    }
    // 會擋路的大物件（置物櫃、櫃子…）佔好幾格：光只照得到外圈，中間會黑一塊。
    // 這裡把「被照到的格子旁邊的擋路格」也補亮（只補擋路格，光不會穿過去照到另一邊的地板）。
    const span = Math.ceil(steps) + 1, cMin = Math.max(0, sc - span), cMax = Math.min(COLS - 1, sc + span), rMin = Math.max(0, sr - span), rMax = Math.min(ROWS - 1, sr + span);
    for (let pass = 0; pass < LIGHT_FILL_SOLID; pass++) {
      const fill = [];
      for (let r = rMin; r <= rMax; r++) for (let c = cMin; c <= cMax; c++) {
        const i = r * COLS + c;
        if (!lightWall(c, r)) continue;
        let best = Infinity;
        if (c > 0) best = Math.min(best, lightDist[i - 1]);
        if (c < COLS - 1) best = Math.min(best, lightDist[i + 1]);
        if (r > 0) best = Math.min(best, lightDist[i - COLS]);
        if (r < ROWS - 1) best = Math.min(best, lightDist[i + COLS]);
        if (best + 1 < steps && best + 1 < lightDist[i] - 1e-6) fill.push(i, best + 1);
      }
      if (!fill.length) break;
      for (let k = 0; k < fill.length; k += 2) { lightDist[fill[k]] = fill[k + 1]; q.push(fill[k]); }
    }
    // q 裡有重複的格子：處理過就改回 Infinity，第二次遇到會跳過；跑完 lightDist 也剛好全部還原
    for (const i of q) {
      if (lightDist[i] === Infinity) continue;
      const k = coneK ? coneK(i % COLS, (i - i % COLS) / COLS) : 1;
      if (k > 0) onCell(i, (1 - lightDist[i] / steps) * k);
      lightDist[i] = Infinity;
    }
  }
}

// 扇形光：回傳 (c, r) → 0～1（1＝在扇形中間，邊緣一小段淡出，0＝在外面）；腳邊一格內一定亮
function coneFactor(l) {
  const ca = Math.cos(l.cone.ang), sa = Math.sin(l.cone.ang), edge = Math.cos(l.cone.half), soft = Math.cos(Math.max(0, l.cone.half - .14));
  return (c, r) => {
    const [cx, cy] = center(c, r), dx = cx - l.x, dy = cy - l.y, d = Math.hypot(dx, dy);
    if (d < CELL * .9) return 1;
    const dot = (dx * ca + dy * sa) / d;
    if (dot <= edge) return 0;
    return dot >= soft ? 1 : (dot - edge) / (soft - edge);
  };
}

// ---- 攻擊閃光（槍口火光、火焰、雷擊…）----
// 種類與數值在 js/attack-fx.js 的 LIGHT_FLASH。閃光同樣會被牆擋住，
// 但只是「畫面變亮、看得到怪物」，不會讓哨兵索敵、蓋建築等判定把那裡當成亮處。
function flashStrength(f) { return Math.pow(Math.max(0, f.life / f.life0), 1.6) * f.power; }
// 只影響畫面的光：攻擊閃光＋甦醒的異質核心
function visualLights() {
  if (!G) return [];
  return [...(G.lightFlashes || []), ...(typeof coreGlowLights === 'function' ? coreGlowLights() : []),
          ...(typeof oreGlowLights === 'function' ? oreGlowLights() : []),   // 礦物的紫光（js/ore.js）
          ...(typeof coreKeyLights === 'function' ? coreKeyLights() : []),   // 地上異質鑰匙的紫光（js/core-clear.js）
          ...(typeof fogTreeLights === 'function' ? fogTreeLights() : []), ...(typeof leafPileLights === 'function' ? leafPileLights() : [])];   // 霧樹的紫光、著火的橘光（js/fog.js）
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

// 畫面上某一點有多亮（0～1）：格子亮度做雙線性插值（跟黑幕放大後的漸層一樣）＋頭燈、手電筒的平滑光
function visualLightAt(x, y) {
  if (!LIGHT.enabled) return 1;
  const fx = (x - OX) / CELL - .5, fy = (y - OY) / CELL - .5, c0 = Math.floor(fx), r0 = Math.floor(fy), tx = fx - c0, ty = fy - r0;
  const v = (c, r) => inGrid(c, r) ? Math.max(visField[r * COLS + c], flashField[r * COLS + c]) : 0;
  const b = (v(c0, r0) * (1 - tx) + v(c0 + 1, r0) * tx) * (1 - ty) + (v(c0, r0 + 1) * (1 - tx) + v(c0 + 1, r0 + 1) * tx) * ty;
  return Math.max(b, typeof equipLightAt === 'function' ? equipLightAt(x, y) : 0);
}
// 怪物（或任何目標）看不看得到：身上任何一個地方在畫面上夠亮就看得到（腳底、身體中間、頭、左右兩側）
const SEE_MIN = .08;   // 畫面亮度超過這個就算看得到（0～1；越小越容易看到）
function bodyVisible(box, x, y) {
  if (!LIGHT.enabled) return true;
  const pts = [[x, y], [box.cx, box.cy], [box.cx, box.y0 + 4], [box.x0 + 4, box.cy], [box.x1 - 4, box.cy]];
  return pts.some(([px, py]) => isVisible(px, py) || visualLightAt(px, py) > SEE_MIN);
}
const enemyVisible = e => !(typeof inHiddenArea === 'function' && inHiddenArea(e.x, e.y)) && bodyVisible(targetBodyBox(e), e.x, e.y);
const BASE_ART_LAMPS = [
  { file: /Poolcore_field-base\.png$/i, lamps: [[.094, .2], [.904, .2], [.094, .767], [.904, .767]] },   // 池核基地：四角的燈頭
];
// 會亮的燈具素材：放在地圖上就發出溫暖的燈光（不用另外設定「發光」）。lamps＝燈泡在圖上的位置（寬、高的比例），r＝照亮半徑 px
// 吊燈這種不畫往上的光束（lantern），只有燈旁邊的暖色光暈和亮芯
const MAP_LAMP_TILES = [
  { file: /\/森林(藍)?\/bg_forest_light(_blue)?\.png$/i, lamps: [[.24, .68]], r: 170, lantern: true },   // 森林的木柱吊燈（藍色版也會亮）
];
// 這盞燈的位置有沒有落在「2樓」物件圖層的圖上（電燈、日光燈沒有自己的圖層資料，用位置判斷是 2 樓的燈還是 1 樓的燈）
function lightOn2FObject(x, y) {
  if (!MAP) return false;
  for (const s of MAP.stamps || []) {
    const lid = s.layer || 'top';
    if (!MAP_FLOOR2_LAYERS.has(lid) || !isOccLayer(lid)) continue;
    const t = mapTileById(s.id); if (!t) continue;
    const x0 = OX + s.c * CELL + (s.ox || 0), y0 = OY + s.r * CELL + (s.oy || 0);
    if (x >= x0 - 4 && x <= x0 + mapStampW(s, t) * CELL + 4 && y >= y0 - 4 && y <= y0 + mapStampH(s, t) * CELL + 4) return true;
  }
  return false;
}
function getLights() {
  const L = [];
  // 玩家（嚮導提燈）：目前關閉（data/balance.js 的 LIGHT.playerLightOn）
  const pf = actorFloor(G && G.player);   // 溫特在幾樓：他身上的燈（頭燈、手電筒）就照那一層
  if (G && G.player && LIGHT.playerLightOn) L.push({ x: G.player.x, y: G.player.y, r: LIGHT.playerR, floor: pf });
  // 站在樓梯／手扶梯上（樓層出入口的格子、或畫面上已經算 2 樓但人還沒踏上去）：手上的燈兩層都照（floor 0）
  const onStairs = hasFloors && G && G.player && (rampCells.has(cellAt(G.player.x, G.player.y).join(',')) || visualFloor(G.player) !== pf);
  if (typeof equipLight === 'function') for (const l of equipLight()) { l.floor = onStairs ? 0 : pf; L.push(l); }   // 照明頭盔、手電筒（js/equipment.js）
  // 營地常亮（沒自訂營地就用預設最下排）
  if (campCells.size) campCells.forEach(k => { const [c, r] = k.split(',').map(Number); const [x, y] = center(c, r); L.push({ x, y, r: LIGHT.campR, floor: 1 }); });   // 營地在 1 樓
  else for (let c = 0; c < COLS; c++) { const [x, y] = center(c, ROWS - 1); L.push({ x, y, r: LIGHT.campR, floor: 1 }); }
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
      const bt = typeof mapTileById === 'function' && mapTileById(o.mapTileId), art = bt && BASE_ART_LAMPS.find(b => b.file.test(String(bt.file || '')));
      const flip = o.baseStamp && o.baseStamp.fx;
      const lamps = art ? art.lamps.map(([fx, fy]) => [x0 + w * (flip ? 1 - fx : fx), y0 + h * fy])   // 池核基地這種圖不一樣大的：照圖片比例放燈
        : [
        [x0 + 17, y0 + 46],
        [x0 + w - 18, y0 + 46],
        [x0 + 17, y0 + h - 63],
        [x0 + w - 18, y0 + h - 63],
      ];
      lamps.forEach(([x, y], i) => L.push({ x, y, visualX: x, visualY: y, r: lampR, warm: true, single: true, phase: i * 1.7 }));
    }
    const nObs = L.length;   // 這個建築加的燈
    const lr = o.type && LIGHT.buildings[o.type];
    if (lr && !o.mrtHidden) {   // mrtHidden：跟著捷運開進隧道了（js/mrt-train.js）
      const x = OX + (o.c + (o.w || 1) / 2) * CELL + (o.mrtShift || 0);   // mrtShift：蓋在捷運車廂裡、跟著列車移動
      const y = OY + (o.r + (o.h || 1) / 2) * CELL;
      // 燈頭在 1×2 圖片的上方；visualY 只影響光暈位置，不改遊戲照明判定。
      const visualY = OY + (o.r + Math.min(0.38, (o.h || 1) * 0.3)) * CELL + 10;
      L.push({ x, y, visualX: x, visualY, r: lr, warm: true,
        single: o.type === 'camping_lights', phase: o.c * 7 + o.r * 13 });
    }
    for (let k = nObs; k < L.length; k++) if (L[k].floor == null) L[k].floor = o.floor === 2 ? 2 : 1;   // 建築的燈：蓋在哪一層就照哪一層（js/build.js 的 o.floor）
  }
  // 長得像臨時基地、但只是圖片的基地（沒有 baseHp、不會被打壞的）：一樣有中央的光和四角的燈。
  // 四盞燈的位置用圖片寬高的比例（池核那張圖比較大）：x 左右、y 上下
  if (typeof MAP !== 'undefined' && MAP) for (const s of MAP.stamps || []) {
    const t = mapTileById(s.id), spec = t && !t.baseHp && BASE_ART_LAMPS.find(b => b.file.test(String(t.file || '')));
    if (!spec || (G && G.mapDestroyed && G.mapDestroyed.has(s))) continue;
    const x0 = OX + s.c * CELL + (s.ox || 0), y0 = OY + s.r * CELL + (s.oy || 0), w = mapStampW(s, t) * CELL, h = mapStampH(s, t) * CELL;
    const f2 = stampOn2F(s) ? 2 : 1;   // 陸橋：2 樓的燈只照 2 樓
    L.push({ x: x0 + w / 2, y: y0 + h / 2, r: LIGHT.baseR || 300, floor: f2 });
    const lampR = LIGHT.baseLampR || 190;
    spec.lamps.forEach(([fx, fy], i) => { const x = x0 + w * (s.fx ? 1 - fx : fx), y = y0 + h * fy; L.push({ x, y, visualX: x, visualY: y, r: lampR, warm: true, single: true, phase: i * 1.7, floor: f2 }); });
  }
  if (typeof MAP !== 'undefined' && MAP) for (const s of MAP.stamps || []) {   // 會亮的燈具素材（MAP_LAMP_TILES）
    const t = mapTileById(s.id), spec = t && MAP_LAMP_TILES.find(b => b.file.test(String(t.file || '')));
    if (!spec || (G && G.mapDestroyed && G.mapDestroyed.has(s))) continue;
    const x0 = OX + s.c * CELL + (s.ox || 0), y0 = OY + s.r * CELL + (s.oy || 0), w = mapStampW(s, t) * CELL, h = mapStampH(s, t) * CELL;
    const f2 = stampOn2F(s) ? 2 : 1;
    spec.lamps.forEach(([fx, fy], i) => { const x = x0 + w * (s.fx ? 1 - fx : fx), y = y0 + h * (s.fy ? 1 - fy : fy); L.push({ floor: f2, x, y, visualX: x, visualY: y, r: spec.r, warm: true, single: true, lantern: !!spec.lantern, phase: s.c * 7 + s.r * 13 + i }); });
  }
  if (typeof flareLightSources === 'function') L.push(...flareLightSources());   // 燃燒中的照明彈（js/flare.js）
  const nFix = L.length;
  if (typeof poweredLightSources === 'function') L.push(...poweredLightSources());
  if (typeof flickerLightSources === 'function') L.push(...flickerLightSources());
  if (hasFloors) for (let k = nFix; k < L.length; k++) if (L[k].floor == null) L[k].floor = lightOn2FObject(L[k].visualX ?? L[k].x, L[k].visualY ?? L[k].y) ? 2 : 1;   // 電燈、日光燈：看它是不是掛在 2 樓的物件圖層上   // 不穩定的日光燈：亮著時才算光（js/flicker-light.js）
  if (typeof mapGlowLights === 'function') L.push(...mapGlowLights());   // 地圖上設成「發光」的物件（地圖編輯器／基地編輯器；js/maploader.js）
  // 陸橋：每盞燈都有樓層（floor）。還沒標的（照明彈…）看位置：落在 2 樓地面上，而且底下一樓是牆、或溫特人在 2 樓 → 算 2 樓的
  if (hasFloors) for (const l of L) if (l.floor == null) { const k = cellAt(l.x, l.y).join(','); l.floor = deckCells.has(k) && (mapWalls.has(k) || pf === 2) ? 2 : 1; }
  if (typeof inHiddenArea === 'function') return L.filter(l => !inHiddenArea(l.x, l.y));   // 還沒炸開的隱藏區裡的燈不亮（js/breakable-walls.js）
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
    if (!l.warm || l.lantern) continue;   // 吊燈：不畫往上的光束
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
  let darkness = typeof currentDarkness === 'function' ? currentDarkness() : LIGHT.darkness;   // 點了眼藥水會變淡（js/equipment.js）
  // 劇情（js/story-scene.js）設的黑幕顏色、濃度：LIGHT.storyDark＝{ rgb: [r, g, b], amount: 0～1 }；不是劇情就照舊全黑
  const sd = window.STORY_MODE && LIGHT.storyDark, [dr, dg, db] = sd?.rgb || [0, 0, 0];
  if (sd && Number.isFinite(sd.amount)) darkness = sd.amount;
  const px = fieldImg.data, maxA = Math.round(darkness * 255);
  for (let i = 0; i < lightField.length; i++) {
    // 只改視覺曲線：中段亮度更柔順，實際的 isLit 判定仍使用原始 lightField。
    const b = Math.pow(Math.min(1, Math.max(visField[i], flashField[i])), 0.78);   // 攻擊閃光也會暫時掀開黑幕
    const o = i * 4;
    px[o] = dr; px[o + 1] = dg; px[o + 2] = db;
    px[o + 3] = Math.round(maxA * (1 - b));
  }
  fieldCtx.putImageData(fieldImg, 0, 0);
  const mx = OX, my = OY, mw = COLS * CELL, mh = ROWS * CELL;
  ctx.imageSmoothingEnabled = true;
  // 頭燈、手電筒：平滑的形狀（js/equipment.js）從黑幕挖開；都沒有就直接貼黑幕
  const beam = typeof flashlightBeamLayer === 'function' ? flashlightBeamLayer(beamMask) : null;
  if (beam) {
    if (darkCv.width !== beam.cv.width || darkCv.height !== beam.cv.height) { darkCv.width = beam.cv.width; darkCv.height = beam.cv.height; }
    darkCtx.setTransform(1, 0, 0, 1, 0, 0); darkCtx.globalCompositeOperation = 'source-over'; darkCtx.globalAlpha = 1;
    darkCtx.clearRect(0, 0, darkCv.width, darkCv.height);
    darkCtx.translate(-beam.x, -beam.y); darkCtx.imageSmoothingEnabled = true;
    darkCtx.drawImage(fieldCv, mx, my, mw, mh);
    darkCtx.setTransform(1, 0, 0, 1, 0, 0);
    darkCtx.globalCompositeOperation = 'destination-out'; darkCtx.globalAlpha = FLASH_BEAM.reveal;
    darkCtx.drawImage(beam.cv, 0, 0);
    ctx.save(); if (sd?.mode) ctx.globalCompositeOperation = sd.mode; ctx.drawImage(darkCv, beam.x, beam.y); ctx.restore();
    drawFlashlightBeam(ctx, beam);   // 再疊一層淡淡的暖黃光
  } else { ctx.save(); if (sd?.mode) ctx.globalCompositeOperation = sd.mode; ctx.drawImage(fieldCv, mx, my, mw, mh); ctx.restore(); }   // 劇情的「色彩增值」：暗處用乘的，底下的畫面染上壓黑的顏色

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
    if (l.lantern) {   // 吊燈：周圍再染一圈淡淡的橘黃色，讓照到的地方看起來是暖色的燈光
      const warmR = l.r * .85 * pulse, wg = ctx.createRadialGradient(sx, sy, 0, sx, sy, warmR);
      wg.addColorStop(0, 'rgba(255,170,70,.22)'); wg.addColorStop(.45, 'rgba(255,150,55,.10)'); wg.addColorStop(1, 'rgba(255,130,40,0)');
      ctx.fillStyle = wg; ctx.beginPath(); ctx.arc(sx, sy, warmR, 0, Math.PI * 2); ctx.fill();
    }

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
  ctx.fillStyle = 'rgba(0,0,0,' + darkness + ')';
  if (my > vy) ctx.fillRect(vx, vy, vw, my - vy);
  if (my + mh < vy + vh) ctx.fillRect(vx, my + mh, vw, vy + vh - my - mh);
  if (mx > vx) ctx.fillRect(vx, Math.max(vy, my), mx - vx, Math.min(vh, mh));
  if (mx + mw < vx + vw) ctx.fillRect(mx + mw, Math.max(vy, my), vx + vw - mx - mw, Math.min(vh, mh));
}
