// ============================================================
//  塗鴉筆：在牆上、地板、固定的物品上畫記號（永久留在那張地圖上）
//  ・塗鴉筆有紅、藍、黑三色（data/supplies.js 的 graffiti-red／blue／black），在地上、置物櫃撿到，後室商店也有賣。
//  ・背包按「使用」→ 選圖案 → 滑鼠帶著預覽，點溫特附近的牆／地板／物品畫上去（右鍵或 Esc 取消）。畫一個用掉一支筆。
//  ・不能畫在會動、會壞、會變形的東西上：玩家蓋的建築、油桶、門、可以炸開的牆。
//  ・擦掉：走到塗鴉旁邊按空白鍵「擦掉塗鴉」，站著不動擦一下就消失。
//  ・圖案素材只有紅色一份（images/塗鴉筆/），藍、黑是程式換顏色。
//  ・存檔：localStorage（GRAFFITI_KEY），依地圖分開存。
// ============================================================
const GRAFFITI = {
  dir: 'images/塗鴉筆/',
  symbols: [   // 圖案（順序＝選單排列）
    { id: 'arrow-up', name: '上' }, { id: 'arrow-down', name: '下' }, { id: 'arrow-left', name: '左' }, { id: 'arrow-right', name: '右' },
    { id: 'circle', name: '圈' }, { id: 'cross', name: '叉' }, { id: 'triangle', name: '三角' }, { id: 'exclaim', name: '驚嘆號' },
    { id: 'smile', name: '笑臉' }, { id: 'sad', name: '哭臉' }, { id: 'help', name: 'HELP' },
  ],
  colors: { red: null, blue: '#3f7cff', black: '#1c1e22' },   // null＝用原圖的紅色
  scale: 1.5,          // 畫在地圖上放大幾倍（素材很小）
  reach: 2.5,          // 離溫特幾格內才畫得到
  eraseReach: 1.8,     // 離塗鴉幾格內可以擦
  eraseTime: 1,        // 擦掉要站著幾秒
  lockerChance: .4,    // 打開置物櫃找到塗鴉筆的機率（沒有指定內容的置物櫃）
};
const GRAFFITI_KEY = 'tudrc_graffiti_v1';
const GRAFFITI_PENS = { 'graffiti-red': 'red', 'graffiti-blue': 'blue', 'graffiti-black': 'black' };
let graffitiData = {};
try { const d = JSON.parse(localStorage.getItem(GRAFFITI_KEY) || '{}'); if (d && typeof d === 'object') graffitiData = d; } catch (_) {}
function saveGraffiti() { try { localStorage.setItem(GRAFFITI_KEY, JSON.stringify(graffitiData)); } catch (_) {} graffitiCache = null; }
const graffitiMapId = () => (MAP && (MAP.id || MAP.name)) || 'map';
const graffitiHere = () => graffitiData[graffitiMapId()] || (graffitiData[graffitiMapId()] = []);

// ---- 圖片：原圖＋換色後的版本 ----
const graffitiImgs = {}, graffitiTinted = {};
for (const s of GRAFFITI.symbols) { const img = new Image(); img.src = GRAFFITI.dir + s.id + '.png'; graffitiImgs[s.id] = img; }
function graffitiImage(sym, color) {
  const img = graffitiImgs[sym]; if (!img || !img.complete || !img.naturalWidth) return null;
  const tint = GRAFFITI.colors[color]; if (!tint) return img;
  const key = sym + ':' + color; if (graffitiTinted[key]) return graffitiTinted[key];
  const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight;
  const x = c.getContext('2d'); x.drawImage(img, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = tint; x.fillRect(0, 0, c.width, c.height);
  return (graffitiTinted[key] = c);
}
function drawGraffitiMark(ctx, g, alpha = 1) {
  const img = graffitiImage(g.s, g.c); if (!img) return;
  const w = img.width * GRAFFITI.scale, h = img.height * GRAFFITI.scale;
  ctx.save(); ctx.globalAlpha = alpha * .92; ctx.imageSmoothingEnabled = false;   // 稍微透一點，像漆在表面上
  ctx.drawImage(img, Math.round(g.x - w / 2), Math.round(g.y - h / 2), Math.round(w), Math.round(h));
  ctx.restore();
}

// ---- 畫在什麼東西上：找滑鼠點的位置最上面的立體物（牆、櫃子…），沒有就是地板 ----
const stampToken = s => [s.id, s.c, s.r, s.ox || 0, s.oy || 0].join('|');
const occToken = it => it.kind === 'stamp' ? 's:' + stampToken(it.stamp) : 'c:' + MAP_LAYER_ORDER[it.li] + ':' + it.c + ',' + it.r;
function graffitiSurfaceAt(x, y) {
  // 玩家蓋的建築、地圖上的障礙物（油桶等）：不能畫
  for (const o of G.obstacles || []) {
    if (o.isBase) continue;   // 營地：當地板畫
    const x0 = o.c * CELL, y0 = o.r * CELL, x1 = x0 + (o.w || 1) * CELL, y1 = y0 + (o.h || 1) * CELL;
    if (x >= x0 && x < x1 && y >= y0 && y < y1) return { bad: '這個東西會被破壞，不能畫' };
  }
  let best = null, bestRank = -Infinity;
  for (const it of typeof mapOccluders === 'function' ? mapOccluders() : []) {
    if (x < it.x0 || x >= it.x1 || y < it.y0 || y >= it.y1) continue;
    if (it.kind === 'cell' && G.mapDestroyed.has(MAP_LAYER_ORDER[it.li] + ':' + it.c + ',' + it.r)) continue;
    if (it.kind === 'stamp' && G.mapDestroyed && G.mapDestroyed.has(it.stamp)) continue;
    const rank = it.y * 100 + it.li;   // 最後畫的那個（最前面）
    if (rank > bestRank) { best = it; bestRank = rank; }
  }
  if (best && best.kind === 'stamp') {
    const s = best.stamp, t = mapTileById(s.id) || {};
    if (t.baseHp) return { on: null };   // 營地：當地板畫（營地範圍很大，跟著它排前後會蓋到營地裡的人）
    if (typeof BREAKABLE_WALLS !== 'undefined' && BREAKABLE_WALLS[s.id]) return { bad: '這面牆好像會塌，不能畫' };
    if (typeof mapDoors !== 'undefined' && mapDoors.some(d => d.stamp === s)) return { bad: '門會打開，不能畫' };
    if (typeof isElevatorStamp === 'function' && isElevatorStamp(s)) return { bad: '這裡不能畫' };
  }
  if (best) return { on: occToken(best) };
  const [c, r] = cellAt(x, y);
  if (!inGrid(c, r) || !hasImageAt(c, r)) return { bad: '這裡沒有地方可以畫' };
  if (typeof inHiddenArea === 'function' && inHiddenArea(x, y)) return { bad: '這裡沒有地方可以畫' };
  return { on: null };   // 地板
}

// ---- 每幀：把塗鴉分成「地板」和「跟著物品排前後」兩種 ----
let graffitiCache = null;
function graffitiLists() {
  if (graffitiCache && graffitiCache.map === MAP) return graffitiCache;
  const ground = [], onOcc = new Map(), byToken = new Map();
  for (const it of typeof mapOccluders === 'function' ? mapOccluders() : []) byToken.set(occToken(it), it);
  for (const g of graffitiData[graffitiMapId()] || []) {
    const it = g.on && byToken.get(g.on);
    if (!it) { ground.push(g); continue; }   // 地板（物品被編輯器移走了也當地板畫）
    if (!onOcc.has(it)) onOcc.set(it, []);
    onOcc.get(it).push(g);
  }
  return (graffitiCache = { map: MAP, ground, onOcc });
}
// render.js：地板塗鴉畫在地面層之後、角色之前
function drawGraffitiGround(ctx) { for (const g of graffitiLists().ground) drawGraffitiMark(ctx, g); }
// render.js：畫在物品上的塗鴉，緊接在那個物品之後畫（人走到物品後面時一起被擋住）
function graffitiSortables(out) {
  for (const [it, list] of graffitiLists().onOcc) {
    if (it.kind === 'cell' && G.mapDestroyed.has(MAP_LAYER_ORDER[it.li] + ':' + it.c + ',' + it.r)) continue;
    out.push({ y: it.y + .01, draw: () => { for (const g of list) drawGraffitiMark(ctx, g); } });
  }
}

// ---- 選圖案 ----
let graffitiPalette = null, graffitiPlace = null, graffitiMouse = null;
function openGraffitiPalette(penId) {
  const color = GRAFFITI_PENS[penId]; if (!color) return;
  if (!(supplyInventory.get(penId) > 0)) { sfx('error'); return; }
  if (!G || !G.running || G.over || !G.player) return;
  if (!graffitiPalette) {
    graffitiPalette = document.createElement('div'); graffitiPalette.id = 'graffitiPalette'; graffitiPalette.className = 'hidden';
    graffitiPalette.addEventListener('click', e => {
      if (e.target === graffitiPalette || e.target.closest('.graffiti-cancel')) { closeGraffitiPalette(); sfx('switch'); return; }
      const b = e.target.closest('[data-graffiti-sym]'); if (!b) return;
      startGraffitiPlace(graffitiPalette.dataset.pen, b.dataset.graffitiSym);
    });
    (document.getElementById('wrap') || document.body).appendChild(graffitiPalette);
  }
  const item = itemById(penId);
  graffitiPalette.dataset.pen = penId;
  graffitiPalette.innerHTML = '<section class="graffiti-card" role="dialog" aria-label="選擇塗鴉圖案">' +
    '<header><img src="' + item.image + '" alt=""><div><small>GRAFFITI</small><h3>要畫什麼？</h3><p>' + item.name + '・畫一個會用掉一支</p></div></header>' +
    '<div class="graffiti-grid">' + GRAFFITI.symbols.map(s => {
      return '<button type="button" data-graffiti-sym="' + s.id + '" title="' + s.name + '" aria-label="' + s.name + '"></button>';
    }).join('') + '</div>' +
    '<footer><span>選好之後，點溫特附近的牆、地板或物品畫上去</span><button type="button" class="graffiti-cancel">取消</button></footer></section>';
  // 換色後的圖直接複製到小畫布上顯示（雙擊開啟遊戲時不能用 toDataURL，換色的圖會讀不到）
  graffitiPalette.querySelectorAll('[data-graffiti-sym]').forEach(b => {
    const img = graffitiImage(b.dataset.graffitiSym, color); if (!img) return;
    const c = document.createElement('canvas'); c.width = img.width || img.naturalWidth; c.height = img.height || img.naturalHeight;
    c.getContext('2d').drawImage(img, 0, 0);
    const k = b.dataset.graffitiSym === 'help' ? 1 : 1.6;   // 按鈕裡顯示的大小（HELP 比較寬，不放大）
    c.style.width = Math.round(c.width * k) + 'px'; c.style.height = Math.round(c.height * k) + 'px';
    b.appendChild(c);
  });
  graffitiPalette.classList.remove('hidden'); sfx('menu');
}
function closeGraffitiPalette() { if (graffitiPalette) graffitiPalette.classList.add('hidden'); }
const graffitiPaletteOpen = () => !!(graffitiPalette && !graffitiPalette.classList.contains('hidden'));
function startGraffitiPlace(penId, sym) {
  closeGraffitiPalette();
  graffitiPlace = { pen: penId, color: GRAFFITI_PENS[penId], sym };
  cv.classList.add('graffiti-placing');
  systemNotice('🖍️ 點溫特附近的牆、地板或物品畫上去（右鍵或 Esc 取消）');
}
function cancelGraffitiPlace(silent) {
  if (!graffitiPlace) return;
  graffitiPlace = null; cv.classList.remove('graffiti-placing');
  if (!silent) sfx('switch');
}
function graffitiPointer(e) {
  const rect = cv.getBoundingClientRect();
  return { x: (e.clientX - rect.left) * (cv.width / rect.width) / VIEW_SCALE + cam.x, y: (e.clientY - rect.top) * (cv.height / rect.height) / VIEW_SCALE + cam.y };
}
const graffitiPlayerPoint = () => ({ x: G.player.x, y: G.player.y - 20 });
function graffitiCheck(x, y) {
  const p = graffitiPlayerPoint();
  if (Math.hypot(x - p.x, y - p.y) > GRAFFITI.reach * CELL) return { bad: '太遠了，走近一點' };
  return graffitiSurfaceAt(x, y);
}
function placeGraffiti(x, y) {
  const pl = graffitiPlace; if (!pl || !G.player) return;
  if (!(supplyInventory.get(pl.pen) > 0)) { cancelGraffitiPlace(true); sfx('error'); return; }
  const chk = graffitiCheck(x, y);
  if (chk.bad) { sfx('error'); flash(chk.bad, x, y - 20, '#ff8f8f', 1.4); return; }
  graffitiHere().push({ s: pl.sym, c: pl.color, x: Math.round(x), y: Math.round(y), on: chk.on });
  saveGraffiti();
  const n = supplyInventory.get(pl.pen); if (n <= 1) supplyInventory.delete(pl.pen); else supplyInventory.set(pl.pen, n - 1);
  sfx('place'); cancelGraffitiPlace(true);
  if (typeof updateHUD === 'function') updateHUD();
  if (typeof saveGame === 'function') saveGame();
}
// 滑鼠：放置模式時搶在遊戲之前處理（左鍵畫、右鍵取消），不會開槍或開選單
cv.addEventListener('mousemove', e => { graffitiMouse = graffitiPointer(e); });
cv.addEventListener('mouseleave', () => { graffitiMouse = null; });
cv.addEventListener('mousedown', e => {
  if (!graffitiPlace) return;
  e.preventDefault(); e.stopImmediatePropagation();
  if (e.button === 0) { const pt = graffitiPointer(e); placeGraffiti(pt.x, pt.y); }
}, true);
cv.addEventListener('contextmenu', e => {
  if (!graffitiPlace) return;
  e.preventDefault(); e.stopImmediatePropagation(); cancelGraffitiPlace();
}, true);
window.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (graffitiPaletteOpen()) { e.preventDefault(); e.stopImmediatePropagation(); closeGraffitiPalette(); sfx('switch'); }
  else if (graffitiPlace) { e.preventDefault(); e.stopImmediatePropagation(); cancelGraffitiPlace(); }
}, true);
// 放置預覽（畫在黑幕上面，暗處也看得到要畫在哪）：可以畫＝半透明圖案；不行＝紅色
function drawGraffitiPreview(ctx) {
  if (!graffitiPlace || !graffitiMouse || !G.player) return;
  const { x, y } = graffitiMouse, ok = !graffitiCheck(x, y).bad, p = graffitiPlayerPoint();
  ctx.save();
  ctx.strokeStyle = 'rgba(143,211,255,.9)'; ctx.setLineDash([10, 6]); ctx.lineWidth = 1.3;   // 畫得到的範圍（跟放建築的範圍圈同樣式，render.js 的 drawBuildRange）
  ctx.beginPath(); ctx.arc(p.x, p.y, GRAFFITI.reach * CELL, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
  drawGraffitiMark(ctx, { s: graffitiPlace.sym, c: graffitiPlace.color, x, y }, ok ? .7 : .35);
  if (!ok) { ctx.save(); ctx.strokeStyle = '#ff5a5a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 9, y - 9); ctx.lineTo(x + 9, y + 9); ctx.moveTo(x + 9, y - 9); ctx.lineTo(x - 9, y + 9); ctx.stroke(); ctx.restore(); }
}

// ---- 擦掉 ----
let graffitiErase = null;
function graffitiNearPlayer() {
  const p = G && G.player; if (!p || p.sitting || graffitiPlace) return null;
  const q = graffitiPlayerPoint();
  let best = null, bd = GRAFFITI.eraseReach * CELL;
  for (const g of graffitiData[graffitiMapId()] || []) {
    const d = Math.hypot(g.x - q.x, g.y - q.y);
    if (d < bd) { best = g; bd = d; }
  }
  return best;
}
function startGraffitiErase(g) {
  if (!g || graffitiErase) return;
  graffitiErase = { g, t: 0, x: G.player.x, y: G.player.y };
  sfx('button');
}
function updateGraffiti(dt) {
  if (graffitiPlace && (!G.player || G.player.hp <= 0 || !(supplyInventory.get(graffitiPlace.pen) > 0))) cancelGraffitiPlace(true);
  const er = graffitiErase; if (!er) return;
  if (!G.player || Math.hypot(G.player.x - er.x, G.player.y - er.y) > 4) { graffitiErase = null; return; }   // 走開就取消
  er.t += dt;
  if (er.t >= GRAFFITI.eraseTime) {
    const list = graffitiHere(), i = list.indexOf(er.g);
    if (i >= 0) list.splice(i, 1);
    saveGraffiti(); graffitiErase = null; sfx('switch');
    flash('塗鴉擦掉了', er.g.x, er.g.y - 16, '#dce6ed', 1.2);
  }
}
// 擦的進度：塗鴉上方一條小進度條，圖案慢慢變淡
function drawGraffitiErase(ctx) {
  const er = graffitiErase; if (!er) return;
  const k = Math.min(1, er.t / GRAFFITI.eraseTime), w = 40, x = er.g.x - w / 2, y = er.g.y - 30;
  ctx.save();
  ctx.fillStyle = 'rgba(10,14,20,.85)'; ctx.fillRect(x - 1, y - 1, w + 2, 6);
  ctx.fillStyle = '#dce6ed'; ctx.fillRect(x, y, w * k, 4);
  ctx.restore();
}
const graffitiErasing = () => !!graffitiErase;

// ---- 置物櫃：有機會找到塗鴉筆（js/storage-lockers.js 呼叫）----
function tryGraffitiPenFind(x, y) {
  if (Math.random() >= GRAFFITI.lockerChance) return;
  const ids = Object.keys(GRAFFITI_PENS), id = ids[Math.floor(Math.random() * ids.length)];
  supplyInventory.set(id, (supplyInventory.get(id) || 0) + 1);
  if (typeof showItemPickupNotice === 'function') showItemPickupNotice(id, 1);
  if (typeof updateHUD === 'function') updateHUD();
}
