/* ===== 🔍 遮擋檢查（地圖編輯器、劇情地圖編輯器）=====
   找出「人物遮擋線」跟「擋路」（紅格＋像素微調、邊緣碰撞、素材碰撞方框）對不起來的圖：
     🔴 站在前面會被蓋住：遮擋線比擋路的底邊低很多 → 溫特、隊員、怪物站在牆前面，還是被牆蓋住（看起來走進牆裡）
     🟠 怪物站在前面會被蓋住：差一點點 → 溫特、隊員沒事，但怪物（碰撞比較小）貼著牆會被蓋住
     🟣 走到後面卻畫在前面：遮擋線比擋路的上緣高很多，而且後面有空地能走 → 人走到它後面，還是畫在它前面（看起來穿過去）
     ⚪ 沒有擋路：高高的圖，範圍裡完全沒有擋路（拱門、光影這類本來就能穿過的可以不管）
   只檢查高度 1.5 格以上、會遮擋人物的圖（跟編輯器畫的「人物遮擋線」用同一套規則）。
   按「🔍 遮擋檢查」打開：有問題的圖會框起來（青線＝遮擋線、紅虛線＝擋路底邊），右下角列出清單，點一下跳過去選取。
   改完按「重新檢查」。這裡只看、不會改地圖。 */
const OCC_CHECK = {
  tall: 1.5,       // 多高（格）的圖才檢查
  hideAll: 30,     // 遮擋線比擋路底邊低超過幾像素＝🔴（溫特身體半徑 14＋腳到排序點 17，約 30）
  hideSmall: 14,   // 低超過幾像素＝🟠（怪物）
  behind: 30,      // 遮擋線比擋路上緣高超過幾像素，而且上面有空地＝🟣
  stepX: 6, stepY: 3,   // 掃描的間距（像素）：越小越準、越慢
};
const OCC_KINDS = {
  hideAll: { label: '🔴 站在前面會被蓋住', color: '#ff4d4d' },
  hideSmall: { label: '🟠 怪物站在前面會被蓋住', color: '#ffa53d' },
  front: { label: '🟣 走到後面卻畫在前面', color: '#c77dff' },
  pass: { label: '⚪ 沒有擋路', color: '#b8c2cc' },
};
let occCheckOn = false, occIssues = [], occShowPass = false;

// 這張地圖的「擋路」：給一個點，回答有沒有被擋（跟遊戲一樣：紅格照像素微調、邊緣碰撞線、素材碰撞方框）
function occBlockedFn(m) {
  const solid = new Set(m.solid || []), offs = m.solidOffsets || {};
  const H = 5;   // 邊緣碰撞的厚度一半（跟遊戲 js/pathfinding.js 的 EDGE_WALL.half 一樣）
  const edges = (m.edges || []).map(k => {
    const [c, r, side] = k.split(','), o = edgeOffsetOf(m, k), C = +c, R = +r;
    return side === 'R' ? { v: true, x: OX + (C + 1) * CELL + o[0], a: OY + R * CELL + o[1], b: OY + (R + 1) * CELL + o[1] }
      : { v: false, y: OY + (R + 1) * CELL + o[1], a: OX + C * CELL + o[0], b: OX + (C + 1) * CELL + o[0] };
  });
  const boxGrid = new Map();   // 素材碰撞方框（物件編輯器設的），照格子分好查得快
  if (typeof tileCollisionBoxes === 'function') for (const s of m.stamps || []) {
    const boxes = tileCollisionBoxes(s.id), t = boxes && tileById(s.id); if (!t) continue;
    for (const [x0, y0, x1, y1] of tileCollisionPlace(boxes, s, tileW(t) * CELL, tileH(t) * CELL, OX + s.c * CELL + (s.ox || 0), OY + s.r * CELL + (s.oy || 0))) {
      for (let c = Math.floor((x0 - OX) / CELL); c * CELL + OX < x1; c++) for (let r = Math.floor((y0 - OY) / CELL); r * CELL + OY < y1; r++) {
        const key = c + ',' + r; if (!boxGrid.has(key)) boxGrid.set(key, []); boxGrid.get(key).push([x0, y0, x1, y1]);
      }
    }
  }
  return (x, y) => {
    const c = Math.floor((x - OX) / CELL), r = Math.floor((y - OY) / CELL);
    for (let dc = -1; dc <= 1; dc++) for (let dr = -1; dr <= 1; dr++) {
      const key = (c + dc) + ',' + (r + dr); if (!solid.has(key)) continue;
      const o = offs[key] || [0, 0], x0 = OX + (c + dc) * CELL + o[0], y0 = OY + (r + dr) * CELL + o[1];
      if (x >= x0 && x < x0 + CELL && y >= y0 && y < y0 + CELL) return true;
    }
    for (const s of edges) if (s.v ? Math.abs(x - s.x) <= H && y >= s.a - H && y <= s.b + H : Math.abs(y - s.y) <= H && x >= s.a - H && x <= s.b + H) return true;
    for (const b of boxGrid.get(c + ',' + r) || []) if (x >= b[0] && x < b[2] && y >= b[1] && y < b[3]) return true;
    return false;
  };
}
// 這張圖自己的人物遮擋線（跟 draw() 裡畫「人物遮擋線」的規則一樣）；不會遮擋人物的圖＝null
// fixed＝自己有設（手動或照素材碰撞）；沒設的照圖片底邊，遊戲裡還可能「借」下層圖的線（見 occGameLines）
function occLineOf(s, t) {
  if (!t || t.flat) return null;
  const layer = s.layer || 'top';
  if (!(Number.isFinite(s.sortDepth) || (layer !== 'top' && (stampH(s, t) > 1 || /^object\d*$/.test(layer) || layer === 'overlay')))) return null;
  const autoPx = !Number.isFinite(s.sortDepth) && typeof tileCollisionDepthPx === 'function' ? tileCollisionDepthPx(s, tileW(t) * CELL, tileH(t) * CELL) : null;
  const depth = Number.isFinite(s.sortDepth) ? s.sortDepth : autoPx != null ? autoPx / CELL : stampH(s, t);
  return { y: stampDepthY(s, OY + s.r * CELL + (s.oy || 0), stampH(s, t) * CELL, depth * CELL), fixed: Number.isFinite(s.sortDepth) || autoPx != null };
}
// 遊戲裡真正用的遮擋線（照 js/maploader.js 的 mapOccluders）：
// 沒有自己設遮擋線的圖，如果跟「下層」一張比較低的圖重疊，會借用那張的線 → 編輯器畫的線跟遊戲不一樣，最容易出事
// 回傳 Map：圖 → { y, from：借了哪一張（沒借＝null） }
function occGameLines(m) {
  const order = layersOf(m).map(l => l.id), li = id => order.indexOf(id), items = [];
  for (const s of m.stamps || []) {
    const t = tileById(s.id), own = occLineOf(s, t); if (!own) continue;
    const x0 = OX + s.c * CELL + (s.ox || 0), y0 = OY + s.r * CELL + (s.oy || 0);
    items.push({ s, t, li: li(s.layer || 'top'), x0, y0, x1: x0 + stampW(s, t) * CELL, y1: y0 + stampH(s, t) * CELL, y: own.y, fixed: own.fixed, from: null,
      ownBox: typeof tileCollisionBoxes === 'function' && !!tileCollisionBoxes(s.id) });   // 有自己碰撞的物件：遊戲裡只看自己的底部，不借
  }
  for (const lid of order) {   // 一格一格放的小圖（物件圖層）也會被借
    if (!/^object\d*$/.test(lid) && lid !== 'overlay') continue;
    for (const key in (m.layers || {})[lid] || {}) { const [c, r] = key.split(',').map(Number); items.push({ li: li(lid), x0: OX + c * CELL, y0: OY + r * CELL, x1: OX + (c + 1) * CELL, y1: OY + (r + 1) * CELL, y: OY + (r + 1) * CELL, fixed: true }); }
  }
  items.sort((a, b) => a.li - b.li);
  for (const it of items) {
    if (it.fixed || it.ownBox || !it.s) continue;
    for (const other of items) {
      if (other.li >= it.li || other.y <= it.y) continue;
      const overlapX = Math.min(it.x1, other.x1) - Math.max(it.x0, other.x0), overlapY = Math.min(it.y1, other.y1) - Math.max(it.y0, other.y0);
      if (overlapX > 0 && (it.y1 - it.y0 <= CELL ? overlapY > 0 : overlapY >= CELL / 4)) { it.y = other.y; it.from = other.s || null; }
    }
  }
  const out = new Map(); for (const it of items) if (it.s) out.set(it.s, { y: it.y, from: it.from }); return out;
}
// 整張地圖檢查一次
function runOcclusionCheck() {
  const m = curMap(), blocked = occBlockedFn(m), lines = occGameLines(m), list = [];
  const free = (x, y) => !blocked(x, y) && !blocked(x - 8, y) && !blocked(x + 8, y);   // 站得下一個人（左右各留一點）
  for (const s of m.stamps || []) {
    const t = tileById(s.id); if (!t || stampH(s, t) < OCC_CHECK.tall) continue;
    if (hiddenLayers.has(s.layer || 'top')) continue;   // 隱藏中的圖層不檢查
    const g = lines.get(s); if (!g) continue;
    const line = g.y, from = g.from ? (tileById(g.from.id) || {}).name || g.from.id : null;   // from：遊戲裡借了下層哪張圖的線
    const x0 = OX + s.c * CELL + (s.ox || 0), y0 = OY + s.r * CELL + (s.oy || 0), w = stampW(s, t) * CELL, h = stampH(s, t) * CELL;
    let top = Infinity, bottom = -Infinity;
    for (let x = x0 + 4; x < x0 + w - 3; x += OCC_CHECK.stepX) for (let y = y0; y < y0 + h; y += OCC_CHECK.stepY) if (blocked(x, y)) { top = Math.min(top, y); bottom = Math.max(bottom, y); }
    const base = { s, name: t.name || s.id, layer: s.layer || 'top', line, from, x0, y0, w, h, top, bottom };
    if (!Number.isFinite(bottom)) { list.push({ ...base, kind: 'pass', gap: 0 }); continue; }
    const d = line - bottom;
    if (d > OCC_CHECK.hideAll) { list.push({ ...base, kind: 'hideAll', gap: Math.round(d) }); continue; }
    if (d > OCC_CHECK.hideSmall) { list.push({ ...base, kind: 'hideSmall', gap: Math.round(d) }); continue; }
    if (top - line > OCC_CHECK.behind) {   // 遮擋線比擋路上緣高很多：看看上面（後面）有沒有空地能走
      let n = 0;
      for (let x = x0 + 8; x < x0 + w - 8 && n < 3; x += OCC_CHECK.stepX * 2) for (let y = Math.max(y0, line) + 4; y < top - 6 && n < 3; y += OCC_CHECK.stepY * 2) if (free(x, y)) n++;
      if (n >= 3) list.push({ ...base, kind: 'front', gap: Math.round(top - line) });
    }
  }
  const order = { hideAll: 0, front: 1, hideSmall: 2, pass: 3 };
  list.sort((a, b) => order[a.kind] - order[b.kind] || b.gap - a.gap);
  occIssues = list;
  renderOcclusionPanel();
}
// 地圖上框出有問題的圖（draw() 最後呼叫）
function drawOcclusionCheck() {
  if (!occCheckOn) return;
  for (const it of occIssues) {
    if (it.kind === 'pass' && !occShowPass) continue;
    const col = OCC_KINDS[it.kind].color;
    ctx.save();
    ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.setLineDash(it.kind === 'pass' ? [6, 4] : []);
    ctx.strokeRect(it.x0 + 1.5, it.y0 + 1.5, it.w - 3, it.h - 3); ctx.setLineDash([]);
    ctx.strokeStyle = '#3ff0ff'; ctx.lineWidth = 2;   // 遮擋線
    ctx.beginPath(); ctx.moveTo(it.x0, it.line); ctx.lineTo(it.x0 + it.w, it.line); ctx.stroke();
    if (Number.isFinite(it.bottom)) {   // 擋路的底邊
      ctx.strokeStyle = '#ff5b5b'; ctx.setLineDash([5, 4]);
      ctx.beginPath(); ctx.moveTo(it.x0, it.bottom); ctx.lineTo(it.x0 + it.w, it.bottom); ctx.stroke(); ctx.setLineDash([]);
    }
    ctx.restore();
  }
}
// 右下角的清單
function renderOcclusionPanel() {
  let box = document.getElementById('occCheckPanel');
  if (!occCheckOn) { if (box) box.remove(); return; }
  if (!box) {
    box = document.createElement('div'); box.id = 'occCheckPanel';
    box.style.cssText = 'position:fixed;right:12px;bottom:12px;z-index:50;width:360px;max-height:46vh;display:flex;flex-direction:column;border:1px solid #4a5868;border-radius:8px;background:rgba(18,23,30,.97);color:#dfe7ef;font-size:12px;box-shadow:0 8px 24px rgba(0,0,0,.5)';
    document.body.appendChild(box);
    box.addEventListener('click', e => {
      if (e.target.closest('[data-occ-recheck]')) { runOcclusionCheck(); draw(); return; }
      if (e.target.closest('[data-occ-close]')) { setOcclusionCheck(false); return; }
      const row = e.target.closest('[data-occ-i]'); if (!row) return;
      const it = occIssues[+row.dataset.occI], i = curMap().stamps.indexOf(it && it.s);
      if (i < 0) { setStatus('這張圖已經不在了，按「重新檢查」', '#ffd24a'); return; }
      const sel = { type: 'stamp', index: i };
      selections = [sel]; selection = sel; refreshSelPanel(); scrollToItem(sel); flashLocate(sel); draw();
      setStatus(OCC_KINDS[it.kind].label + '：' + it.name + '（' + layerName(it.layer) + '）' + occAdvice(it), '#ffd479');
    });
    box.addEventListener('change', e => { if (e.target.matches('[data-occ-pass]')) { occShowPass = e.target.checked; renderOcclusionPanel(); draw(); } });
  }
  const shown = occIssues.map((it, i) => ({ it, i })).filter(x => occShowPass || x.it.kind !== 'pass');
  const count = k => occIssues.filter(it => it.kind === k).length;
  box.innerHTML = '<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-bottom:1px solid #33404d"><b style="flex:1">🔍 遮擋檢查</b>' +
    '<button type="button" class="btn" data-occ-recheck style="padding:2px 8px">重新檢查</button><button type="button" class="btn" data-occ-close style="padding:2px 8px">✕</button></div>' +
    '<div style="padding:6px 10px;line-height:1.7;border-bottom:1px solid #33404d">' +
    ['hideAll', 'front', 'hideSmall'].map(k => '<span style="color:' + OCC_KINDS[k].color + '">' + OCC_KINDS[k].label + ' ' + count(k) + '</span>').join('　') +
    '<br><label style="cursor:pointer"><input type="checkbox" data-occ-pass' + (occShowPass ? ' checked' : '') + '> 也列出' + OCC_KINDS.pass.label + '（' + count('pass') + '，拱門、光影可以不管）</label>' +
    '<br><span style="color:#8a99a8">青線＝人物遮擋線、紅虛線＝擋路底邊。點一列跳過去選取</span></div>' +
    '<div style="overflow:auto">' + (shown.length ? shown.map(({ it, i }) =>
      '<div data-occ-i="' + i + '" style="padding:5px 10px;border-bottom:1px solid #26303a;cursor:pointer"><span style="color:' + OCC_KINDS[it.kind].color + '">●</span> ' +
      escOcc(it.name) + ' <span style="color:#8a99a8">（' + escOcc(layerName(it.layer)) + '　' + it.s.c + ',' + it.s.r + '）</span>' + (it.gap ? ' <b>' + it.gap + 'px</b>' : '') + (it.from ? ' <span style="color:#ffd479">借下層的線</span>' : '') + '</div>').join('')
      : '<div style="padding:10px;color:#8fe08f">沒有找到對不起來的地方 👍</div>') + '</div>';
}
const escOcc = v => String(v).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
// 狀態列的修法提示
function occAdvice(it) {
  if (it.from && (it.kind === 'hideAll' || it.kind === 'hideSmall')) return '：這張圖沒有自己的遮擋線，遊戲裡借了下層「' + it.from + '」的線，比擋路底邊低 ' + it.gap + 'px。幫它設「人物遮擋線」（設到紅虛線附近），就不會再借。';
  if (it.kind === 'hideAll' || it.kind === 'hideSmall') return '：遮擋線比擋路底邊低 ' + it.gap + 'px。把「人物遮擋線」往上調到紅虛線附近，或把擋路往下補到青線。';
  if (it.kind === 'front') return '：遮擋線比擋路上緣高 ' + it.gap + 'px，後面有空地。把「人物遮擋線」往下調到擋路底邊附近，或把後面的空地補上擋路。';
  return '：這張圖完全沒有擋路，人可以穿過去。如果不是拱門、光影，補上紅格或在物件編輯器設碰撞。';
}
function setOcclusionCheck(on) {
  occCheckOn = on;
  const b = document.getElementById('occCheckToggle'); if (b) { b.textContent = on ? '🔍 遮擋檢查：開' : '🔍 遮擋檢查'; b.classList.toggle('off', !on); }
  if (on) runOcclusionCheck(); else renderOcclusionPanel();
  draw();
}
{ const b = document.getElementById('occCheckToggle'); if (b) b.addEventListener('click', () => setOcclusionCheck(!occCheckOn)); }
