/* ===== 起霧＋霧樹 =====
   地圖設了 fog（'light' 薄霧／'heavy' 濃霧）才會起霧；數值在 data/balance.js 的 FOG、FOG_TREE。
   霧的畫法（兩層，先畫在一張畫面大小的暫存圖上）：
   ① 遠處白茫茫：溫特身邊看得清楚，越往外霧越濃（一個放射漸層蓋滿畫面）。
   ② 一團團的霧：在地圖上慢慢隨風飄（靠近溫特的霧團會變淡，自己腳邊不會整個看不到）。
   然後用「每一格的霧濃度」把不該有霧的地方挖掉：
   - 營地附近不起霧。
   - 霧樹：地圖自動分區，每一格歸給離它最近的那棵霧樹（地圖編輯器「🌲 霧樹」擺的）。樹燒光，那一區的霧就散了。
   - 火海（燃燒彈、油桶）周圍的霧暫時散開，火熄了一陣子才慢慢回來。
   - 探照燈只照亮、不驅霧。
   霧會隨機變濃、變淡（FOG.weather）；站在霧裡的隊友看不清楚：鎖敵距離變短、命中率下降、走路變慢（FOG_SIGHT）。
   霧變濃時，霧裡的一位隊友會冒泡泡說一句（對話編輯器「戰鬥中・霧變濃了」）。
   霧要變濃前先起風（FOG.weather.omen 秒）：風聲、落葉變多往旁邊吹、霧團飄得快、霧慢慢聚過來。
   怪物在霧裡也看不清楚：發現溫特、隊友的距離變短（FOG_SIGHT.monster），可以趁濃霧繞過怪物。
   霧畫在黑幕之前：暗處還是黑的，有燈的地方才看得到霧。
*/

// 目前地圖的霧設定（null＝沒有霧）：每幀直接看 MAP.fog，不用管換地圖、檔案載入順序
function currentFogPreset() {
  if (window.STORY_MODE || window.TEST_MODE || typeof FOG === 'undefined' || typeof MAP === 'undefined' || !MAP) return null;   // TEST_MODE：開始畫面的 🧪 測試模式不起霧（方便測 BOSS）
  return (MAP.fog === 'light' || MAP.fog === 'heavy') ? FOG[MAP.fog] : null;
}

// ================= 霧樹 =================
const fogTreeImg = new Image(), fogTreeBurntImg = new Image();
if (typeof FOG_TREE !== 'undefined') {
  if (FOG_TREE.image) fogTreeImg.src = FOG_TREE.image;
  if (FOG_TREE.burntImage) fogTreeBurntImg.src = FOG_TREE.burntImage;
}
const imgReady = img => img.complete && img.naturalWidth > 0;

// 換地圖、開新局時（js/game.js）：照地圖的 fogTrees 種樹
function seedFogTrees() {
  G.fogTrees = []; G.fogClears = [];
  if (MAP_SAFE || typeof FOG_TREE === 'undefined' || !MAP || !Array.isArray(MAP.fogTrees)) return;
  for (const key of MAP.fogTrees) {
    const [c, r] = key.split(',').map(Number);
    if (!inGrid(c, r)) continue;
    const [x, cy] = center(c, r);
    G.fogTrees.push({ c, r, x, y: cy + CELL / 2 - 4, burn: 0, fireT: 0, burnt: false, clearK: 0, flameT: 0, smokeT: 0, seed: Math.random() * 10 });
  }
}

// 火海有沒有碰到樹根
function fogTreeTouchesFire(tree) {
  if (!G.oilFires) return false;
  for (const f of G.oilFires) if (f.t > 0 && Math.hypot(tree.x - f.x, (tree.y - f.y) / .7) <= f.r + FOG_TREE.hitR) return true;
  return false;
}

function updateFogTrees(dt) {
  updateFogWeather(dt);
  if (!G.fogTrees) G.fogTrees = [];
  for (const tree of G.fogTrees) {
    if (tree.burnt) { tree.clearK = Math.min(1, tree.clearK + dt / Math.max(.1, FOG.zoneFade)); continue; }
    if (fogTreeTouchesFire(tree)) {
      if (tree.fireT <= 0) flash('霧樹著火了！', tree.x, tree.y - FOG_TREE.h, '#ffb070', 1.2);
      tree.fireT = FOG_TREE.selfBurn;   // 碰到火：著火（離開火之後還會自己燒一陣子）
    }
    if (tree.fireT > 0) {
      tree.fireT -= dt; tree.burn += dt;
      // 火焰、煙
      tree.flameT -= dt;
      if (tree.flameT <= 0) {
        tree.flameT = .22 + Math.random() * .18;
        const k = tree.burn / FOG_TREE.burnNeed;   // 越燒越旺
        spawnFlameBurst(tree.x + (Math.random() * 2 - 1) * FOG_TREE.w * .28, tree.y - 10 - Math.random() * FOG_TREE.h * (.3 + .4 * k), .8 + k * .7);
      }
      if (tree.burn >= FOG_TREE.burnNeed) burnDownFogTree(tree);
    } else if (tree.burn > 0) tree.burn = Math.max(0, tree.burn - dt * .25);   // 火熄了：慢慢回復一點點（要一口氣燒完比較快）
  }
  updateFogClears(dt);
}

function burnDownFogTree(tree) {
  tree.burnt = true; tree.fireT = 0; tree.burnAt = performance.now() / 1000;
  const left = G.fogTrees.filter(t => !t.burnt).length;
  G.effects.push({ ring: true, x: tree.x, y: tree.y - 40, r: 10, r2: 170, life: .6, life0: .6, color: '#ffb070' });
  G.effects.push({ ring: true, x: tree.x, y: tree.y - 40, r: 6, r2: 110, life: .45, life0: .45, color: '#e6f0ea' });
  for (let i = 0; i < 6; i++) spawnFlameBurst(tree.x + (Math.random() * 2 - 1) * FOG_TREE.w * .35, tree.y - Math.random() * FOG_TREE.h * .6, 1.3);
  addLightFlash('flame', tree.x, tree.y - 50, 2);
  if (typeof nearbyImpact === 'function') nearbyImpact(tree.x, tree.y, 8, .06);
  if (typeof sfxAt === 'function') sfxAt('hitIncendiary', tree.x, tree.y, .9, 'fogtree-down');
  flash('霧樹燒毀了！', tree.x, tree.y - FOG_TREE.h, '#ffd6a0', 1.6);
  systemNotice(left ? '霧樹燒毀了，這一區的霧散了！（還剩 ' + left + ' 棵霧樹）' : '所有霧樹都燒毀了，森林的霧散了！');
}

// 黑暗中淡淡的紫光（著火時變成橘光）：js/lighting.js 的 visualLights 會讀這裡
function fogTreeLights() {
  if (!G || !G.fogTrees || !G.fogTrees.length || typeof FOG_TREE === 'undefined') return [];
  const now = performance.now() / 1000, out = [];
  for (const t of G.fogTrees) {
    if (t.burnt) {
      const ember = Math.max(0, 1 - (now - (t.burnAt || now)) / 8);   // 燒光後餘燼慢慢熄
      if (ember > .02) out.push({ x: t.x, y: t.y - 20, r: 90, life: 1, life0: 1, power: .45 * ember, color: [255, 120, 50] });
    } else if (t.fireT > 0) out.push({ x: t.x, y: t.y - 50, r: 200, life: 1, life0: 1, power: .75 + .1 * Math.sin(now * 9 + t.seed), color: [255, 150, 60] });
    else if (FOG_TREE.glowR > 0) out.push({ x: t.x, y: t.y - 60, r: FOG_TREE.glowR, life: 1, life0: 1, power: .32 + .06 * Math.sin(now * 1.6 + t.seed), color: [170, 120, 220] });
  }
  return out;
}

// 繪圖排序用（js/render.js 收進 sortables，跟人物排前後）
function fogTreeSortables(list) {
  for (const t of G.fogTrees || []) list.push({ y: t.y, draw: () => drawFogTree(t) });
}

function drawFogTree(t) {
  const W = FOG_TREE.w, H = FOG_TREE.h, now = performance.now() / 1000;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,.32)';
  ctx.beginPath(); ctx.ellipse(t.x, t.y - 2, W * .3, 9, 0, 0, Math.PI * 2); ctx.fill();
  const custom = t.burnt ? (imgReady(fogTreeBurntImg) ? fogTreeBurntImg : null) : (imgReady(fogTreeImg) ? fogTreeImg : null);
  if (custom) {
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(custom, Math.round(t.x - W / 2), Math.round(t.y - H), W, H);
  } else if (t.burnt) drawFogTreeBurntPlaceholder(t, W, H);
  else drawFogTreePlaceholder(t, W, H, now);
  // 著火：整棵樹泛橘光、頭上有燒毀進度條
  if (!t.burnt && t.fireT > 0) {
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(t.x, t.y - H * .45, 0, t.x, t.y - H * .45, W * .6);
    const a = .25 + .1 * Math.sin(now * 12 + t.seed);
    g.addColorStop(0, 'rgba(255,140,50,' + a.toFixed(3) + ')'); g.addColorStop(1, 'rgba(255,90,20,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(t.x, t.y - H * .45, W * .6, 0, Math.PI * 2); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }
  if (!t.burnt && t.burn > 0) {
    const bw = 60, by = t.y - H - 10;
    ctx.fillStyle = '#2a1d16'; ctx.fillRect(t.x - bw / 2, by, bw, 6);
    ctx.fillStyle = t.fireT > 0 ? '#ff8a3a' : '#a0663a'; ctx.fillRect(t.x - bw / 2, by, bw * Math.min(1, t.burn / FOG_TREE.burnNeed), 6);
  }
  ctx.restore();
}

// ---- 佔位圖（還沒有專用圖時）：扭曲的樹幹＋暗紫色的樹冠＋會一明一暗的紫色光點 ----
function drawFogTreePlaceholder(t, W, H, now) {
  const x = t.x, base = t.y, sway = Math.sin(now * .7 + t.seed) * 3;
  // 樹幹
  ctx.fillStyle = '#3a2c2a';
  ctx.beginPath();
  ctx.moveTo(x - 16, base); ctx.quadraticCurveTo(x - 6, base - H * .3, x - 12 + sway * .5, base - H * .55);
  ctx.lineTo(x + 10 + sway * .5, base - H * .55); ctx.quadraticCurveTo(x + 4, base - H * .3, x + 16, base);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#2a1f1e'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x - 4, base - 6); ctx.quadraticCurveTo(x + 2, base - H * .25, x - 3, base - H * .45); ctx.stroke();
  // 樹根
  ctx.fillStyle = '#3a2c2a';
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(x + s * 10, base - 10); ctx.quadraticCurveTo(x + s * 24, base - 4, x + s * 30, base); ctx.lineTo(x + s * 12, base); ctx.closePath(); ctx.fill(); }
  // 樹冠：幾個深淺不同的圓
  const cx = x + sway, cy = base - H * .68;
  const blobs = [[-.28, .08, .3, '#2e2540'], [.26, .1, .3, '#2e2540'], [0, -.14, .36, '#3b2f52'], [-.18, -.02, .28, '#45375f'], [.16, -.06, .26, '#4d3d6b'], [0, .12, .3, '#382c4d']];
  for (const [dx, dy, rr, col] of blobs) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(cx + dx * W, cy + dy * H, rr * W * .62, 0, Math.PI * 2); ctx.fill(); }
  // 紫色光點
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 7; i++) {
    const a = i * 2.4 + t.seed, px = cx + Math.cos(a) * W * .28, py = cy + Math.sin(a * 1.3) * H * .14;
    const k = .4 + .6 * (.5 + .5 * Math.sin(now * 2 + i * 1.7 + t.seed));
    ctx.fillStyle = 'rgba(200,150,255,' + (.55 * k).toFixed(3) + ')';
    ctx.beginPath(); ctx.arc(px, py, 2.5 + k * 1.5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalCompositeOperation = 'source-over';
}
function drawFogTreeBurntPlaceholder(t, W, H) {
  const x = t.x, base = t.y;
  ctx.fillStyle = '#1b1514';
  ctx.beginPath();
  ctx.moveTo(x - 16, base); ctx.quadraticCurveTo(x - 8, base - H * .25, x - 10, base - H * .42);
  ctx.lineTo(x - 2, base - H * .36); ctx.lineTo(x + 4, base - H * .46); ctx.lineTo(x + 9, base - H * .38);
  ctx.quadraticCurveTo(x + 6, base - H * .2, x + 16, base); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#1b1514'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x - 6, base - H * .3); ctx.lineTo(x - 24, base - H * .42); ctx.moveTo(x + 6, base - H * .28); ctx.lineTo(x + 22, base - H * .36); ctx.stroke();
  // 地上的灰燼
  ctx.fillStyle = 'rgba(40,34,32,.55)';
  ctx.beginPath(); ctx.ellipse(x, base - 2, W * .34, 10, 0, 0, Math.PI * 2); ctx.fill();
}

// ================= 火海驅霧 =================
// 每片火海對應一個「驅霧圈」：火燒著時慢慢散開，火熄了 linger 秒後霧慢慢回來
function updateFogClears(dt) {
  const list = G.fogClears || (G.fogClears = []);
  if (!currentFogPreset()) { list.length = 0; return; }
  const F = FOG.fireClear;
  for (const f of G.oilFires || []) {
    if (f.t > 0 && !list.some(c => c.ref === f)) list.push({ ref: f, x: f.x, y: f.y, r: f.r + F.extra * CELL, k: 0, hold: F.linger });
  }
  // 正在燒的霧樹：火的熱度把整棵樹周圍的霧逼開（才看得到樹在燒）
  for (const t of G.fogTrees || []) {
    if (t.fireT > 0 && !t.burnt && !list.some(c => c.ref === t)) list.push({ ref: t, tree: true, x: t.x, y: t.y - FOG_TREE.h * .4, r: FOG_TREE.w * .6 + F.extra * CELL, k: 0, hold: F.linger });
  }
  for (const c of list) {
    if (fogClearAlive(c)) { c.k = Math.min(1, c.k + dt / F.fadeIn); c.hold = F.linger; }
    else if (c.hold > 0) c.hold -= dt;
    else c.k -= dt / F.fadeOut;
  }
  G.fogClears = list.filter(c => c.k > 0 || fogClearAlive(c));
}
const fogClearAlive = c => c.tree ? c.ref.fireT > 0 && !c.ref.burnt : c.ref.t > 0 && (G.oilFires || []).includes(c.ref);

// ================= 每一格的霧濃度 =================
// 固定的部分（每格歸哪棵樹、營地附近多淡）換地圖才重算；樹燒掉的淡出每幀重畫
let fogStatic = { key: null, zone: null, camp: null };
function fogStaticData() {
  const trees = G.fogTrees || [];
  const key = MAP && (MAP.id + '|' + COLS + 'x' + ROWS + '|' + trees.map(t => t.c + ',' + t.r).join(';') + '|' + [...campCells].join(';'));
  if (fogStatic.key === key) return fogStatic;
  const n = COLS * ROWS, zone = new Int16Array(n).fill(-1), camp = new Float32Array(n).fill(1);
  const campList = [...campCells].map(k => k.split(',').map(Number));
  const C0 = FOG.campClear, C1 = FOG.campClear + 2;
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const i = r * COLS + c;
    let best = -1, bd = Infinity;
    for (let j = 0; j < trees.length; j++) { const d = (trees[j].c - c) ** 2 + (trees[j].r - r) ** 2; if (d < bd) { bd = d; best = j; } }
    zone[i] = best;
    let cd = Infinity;
    for (const [cc, cr] of campList) { const d = Math.hypot(cc - c, cr - r); if (d < cd) cd = d; }
    camp[i] = cd <= C0 ? 0 : cd >= C1 ? 1 : (cd - C0) / (C1 - C0);
  }
  return (fogStatic = { key, zone, camp });
}
const fogMaskCv = document.createElement('canvas'), fogMaskCtx = fogMaskCv.getContext('2d');
let fogMaskImg = null;
function updateFogMask() {
  if (fogMaskCv.width !== COLS || fogMaskCv.height !== ROWS || !fogMaskImg) {
    fogMaskCv.width = COLS; fogMaskCv.height = ROWS; fogMaskImg = fogMaskCtx.createImageData(COLS, ROWS);
  }
  const S = fogStaticData(), trees = G.fogTrees || [], px = fogMaskImg.data;
  for (let i = 0; i < S.zone.length; i++) {
    const z = S.zone[i];
    const d = S.camp[i] * (z >= 0 && trees[z] ? 1 - trees[z].clearK : 1);
    const o = i * 4;
    px[o] = px[o + 1] = px[o + 2] = 255; px[o + 3] = Math.round(255 * d);
  }
  fogMaskCtx.putImageData(fogMaskImg, 0, 0);
}

// ================= 畫霧 =================
// 一團霧的圖：幾個柔邊圓疊成不規則的雲（只做一次，之後縮放重複用）
const fogPuffImgs = [];
function fogPuffImg(i) {
  if (fogPuffImgs[i]) return fogPuffImgs[i];
  const S = 256, cv = document.createElement('canvas');
  cv.width = cv.height = S;
  const c = cv.getContext('2d');
  let seed = 9173 + i * 7919;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let k = 0; k < 9; k++) {
    const a = rnd() * Math.PI * 2, d = rnd() * S * .2;
    const x = S / 2 + Math.cos(a) * d, y = S / 2 + Math.sin(a) * d * .7, r = S * (.18 + rnd() * .16);
    const g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(255,255,255,.55)');
    g.addColorStop(.55, 'rgba(255,255,255,.25)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
  }
  // 染成霧的顏色
  c.globalCompositeOperation = 'source-in';
  c.fillStyle = 'rgb(' + FOG.color.join(',') + ')';
  c.fillRect(0, 0, S, S);
  return (fogPuffImgs[i] = cv);
}

// 霧團的固定排列：在一塊 TILE×TILE 的區域裡隨機擺，整張地圖用這塊重複鋪滿（看不出接縫）
const FOG_TILE = 1400;
const fogPuffs = (() => {
  let seed = 4242;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const list = [];
  for (let i = 0; i < 24; i++) list.push({ x: rnd() * FOG_TILE, y: rnd() * FOG_TILE, s: .7 + rnd() * .6, a: .6 + rnd() * .4, img: i % 4, sp: .7 + rnd() * .6, ph: rnd() * 6.28 });
  return list;
})();

const fogCv = document.createElement('canvas'), fogCtx = fogCv.getContext('2d');
function drawFog(ctx) {
  const P = fogWeatherPreset(currentFogPreset());
  if (!P) return;
  const t = performance.now() / 1000;
  const vx = cam.x, vy = cam.y, vw = viewW(), vh = viewH();
  const W = Math.ceil(vw) + 4, H = Math.ceil(vh) + 4;
  if (fogCv.width !== W || fogCv.height !== H) { fogCv.width = W; fogCv.height = H; }
  const fc = fogCtx;
  fc.setTransform(1, 0, 0, 1, 0, 0); fc.globalCompositeOperation = 'source-over'; fc.globalAlpha = 1;
  fc.clearRect(0, 0, W, H);
  fc.translate(-(vx - 2), -(vy - 2));   // 之後都用世界座標畫
  const pl = G.player;
  const px = pl ? pl.x : vx + vw / 2, py = pl ? pl.y : vy + vh / 2;
  const [cr, cg, cb] = FOG.color;

  // ② 飄動的霧團
  const n = Math.min(P.puffs, fogPuffs.length);
  for (let i = 0; i < n; i++) {
    const f = fogPuffs[i];
    const size = P.size * f.s;
    const wind = G.fogWx ? G.fogWx.wind : t;   // 累積的飄動距離（起風時飄得快）
    const bx = f.x + wind * P.wind * f.sp, by = f.y + Math.sin(t * .12 + f.ph) * 30;   // 往右飄，上下微微起伏
    // 找出這團霧在畫面附近的所有重複位置
    const x0 = Math.floor((vx - size - bx) / FOG_TILE), x1 = Math.floor((vx + vw + size - bx) / FOG_TILE);
    const y0 = Math.floor((vy - size - by) / FOG_TILE), y1 = Math.floor((vy + vh + size - by) / FOG_TILE);
    for (let ix = x0; ix <= x1; ix++) for (let iy = y0; iy <= y1; iy++) {
      const x = bx + ix * FOG_TILE, y = by + iy * FOG_TILE;
      const near = Math.min(1, Math.hypot(x - px, y - py) / (P.clear + size * .5));   // 靠近溫特的霧團變淡
      const a = P.puffAlpha * f.a * (.35 + .65 * near) * (.85 + .15 * Math.sin(t * .3 + f.ph));
      if (a < .01) continue;
      fc.globalAlpha = a;
      fc.drawImage(fogPuffImg(f.img), x - size / 2, y - size * .35, size, size * .7);
    }
  }
  fc.globalAlpha = 1;
  if (typeof FOG_FX_VERSION !== 'undefined' && FOG_FX_VERSION === 2) fogV2Wisps(fc, t, P, vx, vy, vw, vh, px, py);   // 起霧 V2：貼地薄霧帶（js/fog-fx-v2.js）

  // ① 遠處白茫茫：溫特身邊透明，往外越來越濃
  const breathe = 1 + Math.sin(t * .4) * .04;   // 霧的邊界輕輕呼吸
  const g = fc.createRadialGradient(px, py, P.clear * breathe, px, py, P.far * breathe);
  g.addColorStop(0, 'rgba(' + cr + ',' + cg + ',' + cb + ',0)');
  g.addColorStop(.5, 'rgba(' + cr + ',' + cg + ',' + cb + ',' + (P.haze * .55).toFixed(3) + ')');
  g.addColorStop(1, 'rgba(' + cr + ',' + cg + ',' + cb + ',' + P.haze + ')');
  fc.fillStyle = g;
  fc.fillRect(vx - 2, vy - 2, W, H);

  // 每格的霧濃度：營地、燒掉的霧樹那一區挖掉（一格一像素的小圖平滑放大，邊界會自然變柔）
  updateFogMask();
  fc.globalCompositeOperation = 'destination-in';
  fc.imageSmoothingEnabled = true;
  fc.drawImage(fogMaskCv, OX, OY, COLS * CELL, ROWS * CELL);

  // 火海周圍暫時散開
  fc.globalCompositeOperation = 'destination-out';
  for (const c of G.fogClears || []) {
    if (c.k <= 0) continue;
    const e = c.k * c.k * (3 - 2 * c.k);   // 平滑淡入淡出
    const rg = fc.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.r);
    rg.addColorStop(0, 'rgba(0,0,0,' + e.toFixed(3) + ')');
    rg.addColorStop(.55, 'rgba(0,0,0,' + (e * .85).toFixed(3) + ')');
    rg.addColorStop(1, 'rgba(0,0,0,0)');
    fc.fillStyle = rg; fc.beginPath(); fc.arc(c.x, c.y, c.r, 0, Math.PI * 2); fc.fill();
  }
  fc.globalCompositeOperation = 'source-over';

  ctx.drawImage(fogCv, vx - 2, vy - 2, W, H);
}

// ================= 霧隨機變濃、變淡 =================
// G.fogWx：{ level, m（現在的濃度倍率）, from, to, t（換濃度進行了幾秒）, hold（這種濃度還要維持幾秒） }
function fogPickLevel(not) {
  const L = FOG.weather.levels, keys = Object.keys(L).filter(k => k !== not);
  let r = Math.random() * keys.reduce((s, k) => s + L[k].weight, 0);
  for (const k of keys) { if ((r -= L[k].weight) <= 0) return k; }
  return keys[keys.length - 1];
}
function updateFogWeather(dt) {
  if (!currentFogPreset() || !FOG.weather) { G.fogWx = null; return; }
  const W = FOG.weather, rnd = (a, b) => a + Math.random() * (b - a);
  const wx = G.fogWx || (G.fogWx = { level: 'normal', m: 1, from: 1, to: 1, t: W.change, hold: rnd(W.hold[0], W.hold[1]), omen: 0, gust: 0, wind: 0 });
  // 起風（預兆）：gust 0～1；風吹得越大，霧團飄越快（wind＝累積的飄動距離，換速度時霧團不會跳）
  const gustWant = wx.omen > 0 ? 1 : 0;
  wx.gust += (gustWant - wx.gust) * Math.min(1, dt * (gustWant ? 1.2 : .5));
  wx.wind = (wx.wind || 0) + dt * (1 + ((W.omenWind || 1) - 1) * wx.gust);
  if (wx.omen > 0) {   // 預兆中：時間到才真的開始變濃
    wx.omen -= dt;
    if (wx.omen <= 0) { wx.omen = 0; wx.from = wx.m; wx.to = W.levels.thick.mul; wx.t = 0; wx.level = 'thick'; fogThickTalk(); fogWindSound(false); }
    return;
  }
  if (wx.t < W.change) {
    wx.t = Math.min(W.change, wx.t + dt);
    const k = wx.t / W.change, e = k * k * (3 - 2 * k);
    wx.m = wx.from + (wx.to - wx.from) * e;
    return;
  }
  if ((wx.hold -= dt) > 0) return;
  const prev = wx.level, next = fogPickLevel(prev);
  wx.hold = rnd(W.hold[0], W.hold[1]);
  if (next === 'thick' && W.omen > 0) { wx.omen = W.omen; fogWindSound(true); return; }   // 要變濃：先起風
  wx.level = next; wx.from = wx.m; wx.to = W.levels[next].mul; wx.t = 0;
}
// 現在風多大（0～1）：霧要變濃之前起風（js/fog-fx-v2.js 的落葉也會看）
function fogGust() { return G && G.fogWx ? G.fogWx.gust || 0 : 0; }
// 起風的聲音：風聲＋樹葉沙沙聲一起播（音效編輯器「森林起風」那兩格），霧開始變濃時一起淡掉
function fogWindSound(on) {
  if (typeof SFX === 'undefined' || !SFX.enabled) return;
  if (on) { SFX.play('fogWind', .9, 'fog-wind'); SFX.play('fogLeaves', .9, 'fog-leaves'); }
  else { SFX.fadeOut('fog-wind', 2.5); SFX.fadeOut('fog-leaves', 2.5); }
}
// 依現在的濃度調整霧的樣子：看得清楚的範圍變小、白茫茫和霧團變濃
function fogWeatherPreset(P) {
  const wx = G && G.fogWx, m = P && wx ? wx.m + (wx.omen > 0 ? (FOG.weather.omenGather || 0) * Math.min(1, 1 - wx.omen / FOG.weather.omen) : 0) : 1;   // 起風時霧慢慢聚過來
  if (!P || m === 1) return P;
  return { ...P, clear: P.clear / Math.pow(m, .8), far: P.far / Math.pow(m, .6), haze: Math.min(.95, P.haze * m), puffAlpha: Math.min(.75, P.puffAlpha * m) };
}
// 霧變濃：霧裡的一位隊友冒泡泡說一句（對話編輯器「霧變濃了」；沒填就不說）
function fogThickTalk() {
  if (!G || MAP_SAFE || typeof pickDialogueLine !== 'function') return;
  const list = (G.towers || []).filter(t => t.hp > 0 && !t.berserk && !t.vineCap && !t.eatenBy && !(t.say && t.say.text && t.say.hurt) && fogSightAt(t.x, t.y) > .2);
  for (let tries = 0; tries < 4 && list.length; tries++) {
    const t = list.splice(Math.floor(Math.random() * list.length), 1)[0], text = pickDialogueLine(t.type, 'fogThick');
    if (!text) continue;
    t.say = { text, life: 3 };
    t.sayWait = Math.max(t.sayWait || 0, 4);
    return;
  }
}

// ================= 霧擋住隊友的視線 =================
// 這個位置的霧有多濃：0＝沒有霧（營地、燒掉霧樹那一區、火海旁邊）～1＝最濃
function fogSightAt(x, y) {
  const P = fogWeatherPreset(currentFogPreset());
  if (!P || !G) return 0;
  const c = Math.floor((x - OX) / CELL), r = Math.floor((y - OY) / CELL);
  if (c < 0 || r < 0 || c >= COLS || r >= ROWS) return 0;
  const S = fogStaticData(), i = r * COLS + c, z = S.zone[i], tree = z >= 0 && G.fogTrees ? G.fogTrees[z] : null;
  let local = S.camp[i] * (tree ? 1 - tree.clearK : 1);
  for (const f of G.fogClears || []) {   // 火海周圍暫時散開
    const d = Math.hypot(x - f.x, y - f.y);
    if (d < f.r) local *= 1 - f.k * Math.min(1, (1 - d / f.r) * 1.6);
  }
  return Math.max(0, Math.min(1, local * Math.min(1, P.haze)));
}
const fogMateOn = t => t && t.kind === 'tower' && !MAP_SAFE && typeof FOG_SIGHT !== 'undefined';
// 隊友在霧裡：鎖敵距離倍率、命中率倍率、走路速度倍率（js/sentry.js、js/game.js 呼叫）
function fogRangeMul(t) { return fogMateOn(t) ? 1 - FOG_SIGHT.range * fogSightAt(t.x, t.y) : 1; }
function fogHitMul(t) { return fogMateOn(t) ? 1 - FOG_SIGHT.miss * fogSightAt(t.x, t.y) : 1; }
function fogSpeedMul(t) { return fogMateOn(t) ? 1 - FOG_SIGHT.slow * fogSightAt(t.x, t.y) : 1; }
// 怪物也看不清楚：怪物發現 target（溫特或隊友）的距離倍率；怪物或被看的人站在霧裡都算（js/enemy-ai.js 呼叫）
function fogSenseMul(e, target) {
  if (!e || !target || MAP_SAFE || typeof FOG_SIGHT === 'undefined' || !FOG_SIGHT.monster || !currentFogPreset()) return 1;
  return 1 - FOG_SIGHT.monster * Math.max(fogSightAt(e.x, e.y), fogSightAt(target.x, target.y));
}
// 走路變慢：包住 js/sentry.js 的 moveSentryWithPath（隊友各種走路都經過這裡）
if (typeof moveSentryWithPath === 'function') {
  const fogBaseMoveSentry = moveSentryWithPath;
  moveSentryWithPath = (t, x, y, speed, dt) => fogBaseMoveSentry(t, x, y, speed * fogSpeedMul(t), dt);
}
