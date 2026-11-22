/* ===== 地圖底下透出另一張地圖 =====
   例如藍線捷運站：沒鋪地板的黑色地方，看得到底下壓暗、模糊的紅線捷運站。
   設定存在地圖本身的 underMap 欄位（data/maps.js），在 🗺️ 地圖編輯器「📋 地圖規則」的「🚇 底下透出的地圖」改：
     map  ＝底下要透出來的地圖 id
     dark ＝底下那張壓暗幾 %（60＝只剩 40% 亮度）
     blur ＝模糊多少（像素，越大越糊）
     scale＝底下那張畫多大（%，80＝縮成 8 成大；沒寫＝100）
     dx、dy＝底下那張往右、往下移幾格（沒寫＝兩張地圖中心對齊）
     aboveDark＝false 的話戰場的黑幕也會蓋住它（沒寫＝不管燈亮不亮都看得到，只畫在完全沒鋪東西的格子）
   這個檔案前半段是遊戲和地圖編輯器共用的畫法（編輯器看到的就是遊戲裡的樣子），後半段是遊戲專用。 */

const UNDER_MAP_RES = 0.5;   // 底圖用一半解析度畫就好（反正會模糊），比較省記憶體
const UNDER_MAP_DEFAULT = { dark: 60, blur: 3 };

// 這張地圖的設定整理好（沒設定、設成自己就回傳 null）
function underMapSettings(m) {
  const u = m && m.underMap;
  if (!u || !u.map || u.map === m.id) return null;
  const num = (v, d) => v !== '' && v != null && Number.isFinite(Number(v)) ? Number(v) : d;
  return {
    map: u.map,
    dark: Math.max(0, Math.min(100, num(u.dark, UNDER_MAP_DEFAULT.dark))),
    scale: Math.max(10, Math.min(300, num(u.scale, 100))) / 100,
    blur: Math.max(0, num(u.blur, UNDER_MAP_DEFAULT.blur)),
    dx: Number.isFinite(u.dx) ? u.dx : null, dy: Number.isFinite(u.dy) ? u.dy : null,
    aboveDark: u.aboveDark !== false,
  };
}
// 底下那張要畫在哪、畫多大：ucols、urows＝縮放後佔幾格寬高；dx、dy＝左上角往右、往下移幾格（沒設定＝兩張中心對齊）
function underMapOffset(cfg, under, cols, rows) {
  const k = cfg.scale || 1, ucols = (under.cols || cols) * k, urows = (under.rows || rows) * k;
  return { ucols, urows,
    dx: cfg.dx != null ? cfg.dx : (cols - ucols) / 2,
    dy: cfg.dy != null ? cfg.dy : (rows - urows) / 2 };
}
// 把底下那張地圖整張畫成一張小圖（壓暗、模糊也一起做好）
//   tileOf(id) → 素材資料（w、h、color）；imgOf(素材) → 已經下載好的圖（還沒好＝null）
//   回傳 { cv: 畫好的圖, complete: 圖片是不是都下載好了（沒好要等一下再畫一次） }
function buildUnderMapCanvas(cfg, under, tileOf, imgOf, cell) {
  const k = UNDER_MAP_RES, cols = under.cols || 32, rows = under.rows || 18;
  const raw = document.createElement('canvas');
  raw.width = Math.ceil(cols * cell * k); raw.height = Math.ceil(rows * cell * k);
  const g = raw.getContext('2d');
  g.scale(k, k);
  let missing = 0;
  const get = id => {
    const t = tileOf(id); if (!t) return null;
    if (t.color) return { t };
    const img = imgOf(t);
    if (!img) { if (t.file) missing++; return null; }
    return { t, img };
  };
  const order = Array.isArray(under.layerOrder) && under.layerOrder.length
    ? under.layerOrder : Object.keys(under.layers || {}).map(id => ({ id }));
  for (const L of order) {
    if (!L || L.secret) continue;   // 隱藏區圖層（還沒炸開的祕密房間）不畫
    const lid = L.id;
    // 格子小圖
    const layer = (under.layers || {})[lid] || {};
    for (const key in layer) {
      const [c, r] = key.split(',').map(Number), it = get(layer[key]);
      if (!it) continue;
      if (it.t.color) { g.fillStyle = it.t.color; g.fillRect(c * cell, r * cell, cell, cell); }
      else g.drawImage(it.img, c * cell, r * cell, cell, cell);
    }
    // 大圖（物件）：照擺放時的位置、轉向、翻面、大小、角度
    for (const s of under.stamps || []) {
      if ((s.layer || 'top') !== lid) continue;
      const it = get(s.id); if (!it) continue;
      const w = (it.t.w || 1) * cell, h = (it.t.h || 1) * cell, rot = ((Number(s.rot) || 0) % 4 + 4) % 4;
      const x = s.c * cell + (s.ox || 0), y = s.r * cell + (s.oy || 0);
      const drawW = rot % 2 ? h : w, drawH = rot % 2 ? w : h;
      g.save();
      if (Number.isFinite(s.alpha) && s.alpha < 100) g.globalAlpha = Math.max(0, s.alpha) / 100;
      if (s.blend) g.globalCompositeOperation = s.blend;
      withStampTransform(g, s, x, y, drawW, drawH, () => {
        if (it.t.color) { g.fillStyle = it.t.color; g.fillRect(x, y, drawW, drawH); return; }
        if (s.fx || s.fy || rot) {
          g.translate(x + drawW / 2, y + drawH / 2); if (rot) g.rotate(rot * Math.PI / 2);
          g.scale(s.fx ? -1 : 1, s.fy ? -1 : 1);
          g.drawImage(it.img, -w / 2, -h / 2, w, h);
        } else g.drawImage(it.img, x, y, w, h);
      });
      g.restore();
    }
  }
  // 壓暗＋模糊：畫到另一張畫布時一起套濾鏡
  const out = document.createElement('canvas');
  out.width = raw.width; out.height = raw.height;
  const o = out.getContext('2d');
  o.filter = `blur(${cfg.blur * k}px) brightness(${(100 - cfg.dark) / 100})`;
  o.drawImage(raw, 0, 0);
  return { cv: out, complete: missing === 0 };
}
// 底圖的快取：同一個設定只畫一次；圖片沒下載完就每 0.5 秒重畫，最多 30 次
function underMapCached(cache, key, build) {
  const now = performance.now();
  if (cache.key !== key) { cache.key = key; cache.cv = null; cache.ready = false; cache.tries = 0; cache.nextTry = 0; }
  if (!cache.ready && now >= cache.nextTry && cache.tries < 30) {
    const res = build();
    cache.cv = res.cv; cache.ready = res.complete; cache.tries++; cache.nextTry = now + 500;
  }
  return cache.cv;
}

// ===== 以下是遊戲專用 =====
const underMapCache = {};

function underMapConfig() {
  if (typeof MAP === 'undefined' || !MAP) return null;
  const cfg = underMapSettings(MAP); if (!cfg) return null;
  const under = (typeof mapList === 'function' ? mapList() : []).find(m => m && m.id === cfg.map)
    || (typeof BATTLE_MAPS !== 'undefined' ? BATTLE_MAPS.find(m => m && m.id === cfg.map) : null);
  return under ? { cfg, under } : null;
}

// 這張地圖「完全沒鋪東西」的格子（所有圖層都沒有小圖、也沒有大圖蓋到）：有黑幕時底圖只在這些格子裡露出來
let underVoidCache = { map: null, n: -1, path: null, mask: null };
function underVoidData() {
  const n = (MAP.stamps || []).length;
  if (underVoidCache.map === MAP && underVoidCache.n === n) return underVoidCache;
  const path = new Path2D(), mask = new Uint8Array(COLS * ROWS);   // mask：每一格是不是空格（1＝空）
  for (let r = 0; r < ROWS; r++) {
    let start = -1;   // 同一列連在一起的空格合成一長條，比較省
    for (let c = 0; c <= COLS; c++) {
      const empty = c < COLS && !hasImageAt(c, r);
      if (empty) mask[r * COLS + c] = 1;
      if (empty && start < 0) start = c;
      if (!empty && start >= 0) { path.rect(OX + start * CELL, OY + r * CELL, (c - start) * CELL, CELL); start = -1; }
    }
  }
  underVoidCache = { map: MAP, n, path, mask };
  return underVoidCache;
}
function underVoidPath() { return underVoidData().path; }

// 每一幀呼叫兩次（js/render.js 的 draw）：
//   pass＝'below'：塗黑底色之後、畫地板之前（沒有黑幕的地圖用這個，有鋪地板的地方自然會蓋住它）
//   pass＝'above'：蓋上黑幕之後（有黑幕的地圖用這個，不然黑色的地方會被黑幕整片蓋掉；只畫在完全沒鋪東西的格子裡）
function drawUnderMap(ctx, pass = 'below') {
  const info = underMapConfig();
  if (!info) return;
  const { cfg, under } = info;
  const aboveDark = LIGHT.enabled && cfg.aboveDark;
  if ((pass === 'above') !== aboveDark) return;
  const key = MAP.id + '>' + under.id + '|' + cfg.dark + '|' + cfg.blur;
  const cv = underMapCached(underMapCache, key, () => buildUnderMapCanvas(cfg, under, mapTileById, tileImage, CELL));
  if (!cv) return;
  const { dx, dy, ucols, urows } = underMapOffset(cfg, under, COLS, ROWS);
  ctx.save();
  if (aboveDark) ctx.clip(underVoidPath());   // 黑幕上面：只畫在沒鋪東西的格子
  else { ctx.beginPath(); ctx.rect(OX, OY, COLS * CELL, ROWS * CELL); ctx.clip(); }   // 只在這張地圖的範圍裡顯示
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(cv, OX + dx * CELL, OY + dy * CELL, ucols * CELL, urows * CELL);
  ctx.restore();
}
// 有黑幕的地圖：底圖是蓋在黑幕「上面」的（不然暗處整片黑、看不到底圖），所以會把剛好站在空格旁邊、身體伸進空格的怪物、人、建築也蓋掉。
// 底圖應該在最下面 → 底圖畫完後，把「站在亮處、身體碰到空格」的東西在空格範圍裡再畫一次（只畫空格那一塊，其他地方不動）。
// 站在暗處的不用補畫：本來就被黑幕蓋住看不到。items＝js/render.js 排好的要畫的東西（有 who 的才是會動的東西或建築）
function redrawOverUnderMap(ctx, items) {
  const info = underMapConfig();
  if (!info || !(LIGHT.enabled && info.cfg.aboveDark)) return;   // 底圖畫在黑幕下面的地圖：本來就在最下面，不用補
  const { path, mask } = underVoidData();
  const voidAt = (c, r) => c >= 0 && r >= 0 && c < COLS && r < ROWS && mask[r * COLS + c] === 1;
  const touchesVoid = (x0, y0, x1, y1) => {   // 這個範圍（像素）有沒有碰到空格
    const c0 = Math.floor((x0 - OX) / CELL), c1 = Math.floor((x1 - OX) / CELL), r0 = Math.floor((y0 - OY) / CELL), r1 = Math.floor((y1 - OY) / CELL);
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) if (voidAt(c, r)) return true;
    return false;
  };
  let clipped = false;
  const clip = () => { if (!clipped) { ctx.save(); ctx.clip(path); clipped = true; } };
  // 補畫的順序跟原本一樣：先地上的怪物、人、建築 → 人面蝶的鱗粉霧 → 人面蝶（飛在最上面）
  const isMoth = it => it.who && it.who.behavior === 'moth';
  redrawItems(items.filter(it => !isMoth(it)));
  // 鱗粉霧（js/human-face-butterfly.js 的 drawMothClouds；它本來就只畫亮處的霧，暗處的霧另外畫在黑幕上面，不用補）
  const clouds = (G.mothClouds || []).filter(c => !c.boom && isVisible(c.x, c.y));
  if (typeof drawMothClouds === 'function' && clouds.some(c => touchesVoid(c.x - c.r, c.y - 6 - c.r, c.x + c.r, c.y - 6 + c.r))) { clip(); drawMothClouds(ctx); }
  redrawItems(items.filter(isMoth));
  if (clipped) ctx.restore();

  function redrawItems(list) {
  for (const it of list) {
    const w = it.who; if (!w) continue;
    let box, lit;
    if (w.kind === 'obstacle' || w.c != null && w.w != null && w.x == null) {   // 建築：照佔的格子，往上多算 2 格（圖通常比擋路格高）
      const x0 = OX + w.c * CELL + (w.mrtShift || 0), y0 = OY + w.r * CELL;
      box = [x0, y0 - 2 * CELL, x0 + (w.w || 1) * CELL - 1, y0 + (w.h || 1) * CELL - 1];
      lit = isLit(x0 + (w.w || 1) * CELL / 2, y0 + (w.h || 1) * CELL / 2);
    } else {   // 怪物、隊員、溫特、NPC、核心：腳在 (x, y) 附近，身體往上大約 2.5 格
      if (w.mrtHidden) continue;
      // 飛在空中的怪物（人面蝶等）：身體在腳下的影子上方 lift 像素，範圍要跟著往上、照圖的寬高放大
      const lift = w.slimeLift || 0, size = w.sizeMul || 1;
      const halfW = Math.max(CELL, (w.drawWidth || 40) * size / 2), up = Math.max(2.5 * CELL, lift + (w.drawHeight || 33) * size + 13);
      box = [w.x - halfW, w.y - up, w.x + halfW, w.y + .6 * CELL];
      lit = isLit(w.x, w.y) || (lift > 0 && isLit(w.x, w.y - lift));
    }
    if (!lit || !touchesVoid(...box)) continue;
    clip();
    it.draw();
  }
  }
}
