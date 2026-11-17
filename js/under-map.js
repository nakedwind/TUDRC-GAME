/* ===== 地圖底下透出另一張地圖（設定在 data/under-maps.js）=====
   例如藍線捷運站：沒鋪地板的黑色地方，看得到底下壓暗、模糊的紅線捷運站。
   做法：進地圖時把底下那張地圖整張先畫成一張圖（只畫一次，存起來），
   每一幀在「塗黑底色之後、畫這張地圖的地板之前」貼上去（js/render.js 的 draw 呼叫 drawUnderMap），
   所以有鋪地板的地方會蓋住它，只有黑色的地方透得出來。 */

const UNDER_MAP_RES = 0.5;   // 底圖用一半解析度畫就好（反正會模糊），比較省記憶體

let underMapCache = { key: null, cv: null, ready: false, tries: 0, nextTry: 0 };

// 這張地圖的設定（沒有就回傳 null）
function underMapConfig() {
  if (typeof UNDER_MAPS === 'undefined' || !MAP || !MAP.id) return null;
  const cfg = UNDER_MAPS[MAP.id];
  if (!cfg || !cfg.map || cfg.map === MAP.id) return null;
  const under = (typeof mapList === 'function' ? mapList() : []).find(m => m && m.id === cfg.map)
    || (typeof BATTLE_MAPS !== 'undefined' ? BATTLE_MAPS.find(m => m && m.id === cfg.map) : null);
  return under ? { cfg, under } : null;
}

// 把底下那張地圖整張畫到一張小畫布上（壓暗、模糊也一起做好）
// 回傳 true＝所有圖片都已經下載好、畫完整了；false＝還有圖片沒下載好，等一下要再畫一次
function buildUnderMap(cfg, under) {
  const k = UNDER_MAP_RES, cols = under.cols || COLS, rows = under.rows || ROWS;
  const raw = document.createElement('canvas');
  raw.width = Math.ceil(cols * CELL * k); raw.height = Math.ceil(rows * CELL * k);
  const g = raw.getContext('2d');
  g.scale(k, k);
  let missing = 0;
  const imgOf = id => {
    const t = mapTileById(id);
    if (!t) return null;
    if (t.color) return t;
    const img = tileImage(t);
    if (!img && t.file) missing++;
    return img;
  };
  const order = Array.isArray(under.layerOrder) && under.layerOrder.length
    ? under.layerOrder : DEFAULT_MAP_LAYER_ORDER.map(id => ({ id }));
  for (const L of order) {
    if (!L || L.secret) continue;   // 隱藏區圖層（還沒炸開的祕密房間）不畫
    const lid = L.id;
    // 格子小圖
    const layer = (under.layers || {})[lid] || {};
    for (const key in layer) {
      const [c, r] = key.split(',').map(Number), img = imgOf(layer[key]);
      if (!img) continue;
      if (img.color) { g.fillStyle = img.color; g.fillRect(c * CELL, r * CELL, CELL, CELL); }
      else g.drawImage(img, c * CELL, r * CELL, CELL, CELL);
    }
    // 大圖（物件）：照擺放時的位置、轉向、翻面、大小、角度
    for (const s of under.stamps || []) {
      if ((s.layer || 'top') !== lid) continue;
      const t = mapTileById(s.id); if (!t) continue;
      const img = imgOf(s.id); if (!img) continue;
      const w = mapTileW(t) * CELL, h = mapTileH(t) * CELL, rot = mapStampTurn(s);
      const x = s.c * CELL + (s.ox || 0), y = s.r * CELL + (s.oy || 0);
      const drawW = rot % 2 ? h : w, drawH = rot % 2 ? w : h;
      g.save();
      if (Number.isFinite(s.alpha) && s.alpha < 100) g.globalAlpha = Math.max(0, s.alpha) / 100;
      if (s.blend) g.globalCompositeOperation = s.blend;
      withStampTransform(g, s, x, y, drawW, drawH, () => {
        if (img.color) { g.fillStyle = img.color; g.fillRect(x, y, drawW, drawH); return; }
        if (s.fx || s.fy || rot) {
          g.translate(x + drawW / 2, y + drawH / 2); if (rot) g.rotate(rot * Math.PI / 2);
          g.scale(s.fx ? -1 : 1, s.fy ? -1 : 1);
          g.drawImage(img, -w / 2, -h / 2, w, h);
        } else g.drawImage(img, x, y, w, h);
      });
      g.restore();
    }
  }
  // 壓暗＋模糊：畫到另一張畫布時一起套濾鏡
  const dark = Math.max(0, Math.min(100, Number(cfg.dark ?? 60))), blur = Math.max(0, Number(cfg.blur ?? 3)) * k;
  const out = document.createElement('canvas');
  out.width = raw.width; out.height = raw.height;
  const o = out.getContext('2d');
  o.filter = `blur(${blur}px) brightness(${(100 - dark) / 100})`;
  o.drawImage(raw, 0, 0);
  underMapCache.cv = out;
  return missing === 0;
}

// 這張地圖「完全沒鋪東西」的格子（所有圖層都沒有小圖、也沒有大圖蓋到）：底圖只在這些格子裡露出來
// 地圖的物件數量變了（門、炸牆換圖不算）才重算
let underVoidCache = { map: null, n: -1, path: null };
function underVoidPath() {
  const n = (MAP.stamps || []).length;
  if (underVoidCache.map === MAP && underVoidCache.n === n) return underVoidCache.path;
  const path = new Path2D();
  for (let r = 0; r < ROWS; r++) {
    let start = -1;   // 同一列連在一起的空格合成一長條，比較省
    for (let c = 0; c <= COLS; c++) {
      const empty = c < COLS && !hasImageAt(c, r);
      if (empty && start < 0) start = c;
      if (!empty && start >= 0) { path.rect(OX + start * CELL, OY + r * CELL, (c - start) * CELL, CELL); start = -1; }
    }
  }
  underVoidCache = { map: MAP, n, path };
  return path;
}

// 每一幀呼叫兩次：
//   pass＝'below'：塗黑底色之後、畫地板之前（沒有黑幕的地圖用這個，有鋪地板的地方自然會蓋住它）
//   pass＝'above'：蓋上黑幕之後（有黑幕的地圖用這個，不然黑色的地方會被黑幕整片蓋掉；只畫在完全沒鋪東西的格子裡）
// 圖片沒下載完會先畫已經有的，過一下再重畫
function drawUnderMap(ctx, pass = 'below') {
  const info = underMapConfig();
  if (!info) return;
  const aboveDark = LIGHT.enabled && info.cfg.aboveDark !== false;   // aboveDark: false＝照樣被黑幕蓋住
  if ((pass === 'above') !== aboveDark) return;
  const { cfg, under } = info;
  const key = MAP.id + '>' + under.id;
  const now = performance.now();
  if (underMapCache.key !== key) underMapCache = { key, cv: null, ready: false, tries: 0, nextTry: 0 };
  if (!underMapCache.ready && now >= underMapCache.nextTry && underMapCache.tries < 30) {
    underMapCache.ready = buildUnderMap(cfg, under);
    underMapCache.tries++;
    underMapCache.nextTry = now + 500;
  }
  const cv = underMapCache.cv; if (!cv) return;
  const ucols = under.cols || COLS, urows = under.rows || ROWS;
  const dx = Number.isFinite(cfg.dx) ? cfg.dx : Math.floor((COLS - ucols) / 2);
  const dy = Number.isFinite(cfg.dy) ? cfg.dy : Math.floor((ROWS - urows) / 2);
  ctx.save();
  if (aboveDark) ctx.clip(underVoidPath());   // 黑幕上面：只畫在沒鋪東西的格子
  else { ctx.beginPath(); ctx.rect(OX, OY, COLS * CELL, ROWS * CELL); ctx.clip(); }   // 只在這張地圖的範圍裡顯示
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(cv, OX + dx * CELL, OY + dy * CELL, ucols * CELL, urows * CELL);
  ctx.restore();
}
