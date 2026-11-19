/* ===== 🗺️ 地圖編輯器：🟧 橘框（直接在地圖上改素材碰撞，只改這張地圖）=====
   橘框＝素材碰撞方框。物件編輯器「🧱 素材碰撞」設的是所有地圖共用的「預設」；
   這裡改的是「這張地圖自己的」設定（存在地圖資料 m.tileBoxes，跟著這張地圖一起存到專案），別張地圖不受影響。
   這張地圖上同一張素材貼幾個都一起變；同一張圖片登記了好幾次的素材也一起變（js/tile-collisions.js）。
   「↺ 改回共用設定」＝拿掉這張地圖自己的設定，回到物件編輯器的預設。
   操作（工具列的 🧱🎯「橘框」）：
     ・點物件上的橘框＝選起來，按住拖＝移動
     ・拖選中橘框的藍色小方塊＝改大小
     ・在物件上沒有橘框的地方拖曳＝畫一個新的橘框
     ・方向鍵＝移動 1 像素（Shift＝10）；Ctrl＋方向鍵＝改寬高；Delete＝刪掉選中的橘框；Esc＝取消選取
   可以用「復原」（Ctrl+Z）；按「💾 存到專案」跟地圖一起存。
   鎖住、隱藏的圖層：隱藏的點不到；鎖住的可以改（改的是碰撞設定，不是搬動地圖上的物件）。
   必須在 js/map-editor.js、js/tile-collisions.js 之後載入。 */
(() => {
  if (typeof tileCollisionBoxes !== 'function' || typeof cv === 'undefined') return;
  const MODE = 'tilebox';
  let target = null;   // { index: 地圖上那個物件的編號, id: 素材 id }
  let sel = -1;        // 選中第幾個橘框
  let drag = null;

  const tileOf = s => tileById(s.id) || null;
  const sizeOf = t => [tileW(t) * CELL, tileH(t) * CELL];   // 素材沒轉向時的像素寬高（跟畫橘框的一樣）
  const originOf = s => [OX + s.c * CELL + (s.ox || 0), OY + s.r * CELL + (s.oy || 0)];
  const boxesOf = id => (tileCollisionBoxes(id) || []).map(b => b.slice());
  const placed = (s, boxes) => { const t = tileOf(s); if (!t) return []; const [tw, th] = sizeOf(t), [x, y] = originOf(s); return tileCollisionPlace(boxes, s, tw, th, x, y); };
  const visible = s => !hiddenLayers.has(s.layer || 'top');
  const layerRank = s => { const i = LAYERS.findIndex(l => l.id === (s.layer || 'top')); return i < 0 ? 99 : i; };

  // 地圖上的一點 → 素材自己的像素座標（把翻轉、轉向、放大倒回去；跟 tileCollisionPlace 相反）
  function toLocal(s, X, Y) {
    const t = tileOf(s), [tw, th] = sizeOf(t), [x, y] = originOf(s);
    const rot = ((Number(s.rot) || 0) % 4 + 4) % 4, dw = rot % 2 ? th : tw, dh = rot % 2 ? tw : th;
    const k = typeof stampScaleOf === 'function' ? stampScaleOf(s) : 1, cx = x + dw / 2;
    if (k !== 1) { X = cx + (X - cx) / k; Y = y + dh - (y + dh - Y) / k; }
    const a = X - (x + dw / 2), b = Y - (y + dh / 2);
    let u = a, v = b;
    if (rot === 1) { u = b; v = -a; } else if (rot === 2) { u = -a; v = -b; } else if (rot === 3) { u = -b; v = a; }
    if (s.fx) u = -u; if (s.fy) v = -v;
    return [u + tw / 2, v + th / 2];
  }
  const clampBox = (s, b) => {
    const [tw, th] = sizeOf(tileOf(s));
    b[2] = Math.max(1, Math.min(tw, Math.round(b[2]))); b[3] = Math.max(1, Math.min(th, Math.round(b[3])));
    b[0] = Math.max(0, Math.min(tw - b[2], Math.round(b[0]))); b[1] = Math.max(0, Math.min(th - b[3], Math.round(b[1])));
    return b;
  };
  const handlesOf = ([x0, y0, x1, y1]) => { const mx = (x0 + x1) / 2, my = (y0 + y1) / 2; return [[x0, y0], [mx, y0], [x1, y0], [x1, my], [x1, y1], [mx, y1], [x0, y1], [x0, my]]; };
  const pxTol = () => { const r = cv.getBoundingClientRect(); return 7 * (COLS * CELL / (r.width || 1)); };   // 7 個螢幕像素有多寬（畫面有放大縮小）

  function stampCount(id) { const ids = new Set(tileSameImageIds(id)); return (curMap().stamps || []).filter(s => ids.has(s.id)).length; }
  const ownHere = id => tileMapBoxesOf(curMap(), id) !== undefined;   // 這張地圖有沒有自己設
  function say() {
    refreshResetBtn();
    if (!target) { setStatus('🟧 橘框（只改這張地圖）：點地圖上的物件——點橘框＝選取／拖曳移動，在物件上拖曳＝畫新的橘框', '#ffb36b'); return; }
    const t = tileById(target.id) || {}, n = boxesOf(target.id).length;
    setStatus('🟧 橘框：「' + (t.name || target.id) + '」有 ' + n + ' 個橘框，' + (ownHere(target.id) ? '用的是這張地圖自己的設定' : '目前跟著物件編輯器的共用設定（一改就變成這張地圖自己的）')
      + '。這張地圖上 ' + stampCount(target.id) + ' 個一起變，別張地圖不受影響（拖藍色小方塊＝改大小、方向鍵＝移動、Ctrl＋方向鍵＝改寬高、Delete＝刪掉）', '#ffb36b');
  }
  let undoPushed = false;   // 一次拖曳只記一次「復原」
  function save(boxes) {
    if (!undoPushed) { pushUndo(); undoPushed = true; }
    tileMapBoxesSet(curMap(), target.id, boxes); draw();
  }
  const finish = () => { if (undoPushed) { saveMaps(); undoPushed = false; } };   // 放開滑鼠、按完鍵：存起來

  // 「↺ 改回共用設定」按鈕：選到的素材在這張地圖有自己的設定時才出現
  const toolBtn = document.querySelector('.tool[data-mode="' + MODE + '"]');
  const resetBtn = document.createElement('button');
  resetBtn.type = 'button'; resetBtn.className = 'btn hidden'; resetBtn.textContent = '↺ 改回共用設定';
  resetBtn.title = '拿掉這張地圖自己的橘框，回到物件編輯器「🧱 素材碰撞」的共用設定（只影響這張地圖上的這張素材）';
  if (toolBtn) toolBtn.after(resetBtn);
  function refreshResetBtn() { resetBtn.classList.toggle('hidden', !(brush.mode === MODE && target && ownHere(target.id))); }
  resetBtn.addEventListener('click', () => {
    if (!target) return;
    pushUndo(); tileMapBoxesSet(curMap(), target.id, null); saveMaps(); sel = boxesOf(target.id).length ? 0 : -1; say(); draw();
  });

  // 找滑鼠底下的東西：先找橘框（最上面的圖層優先），再找物件本身
  function hitAt(X, Y) {
    const stamps = (curMap().stamps || []).map((s, i) => ({ s, i })).filter(o => visible(o.s) && tileOf(o.s));
    stamps.sort((a, b) => layerRank(b.s) - layerRank(a.s) || b.i - a.i);
    for (const { s, i } of stamps) {
      const bs = placed(s, boxesOf(s.id)), k = bs.map((b, j) => j).reverse().find(j => X >= bs[j][0] && X <= bs[j][2] && Y >= bs[j][1] && Y <= bs[j][3]);
      if (k != null) return { index: i, box: k };
    }
    for (const { s, i } of stamps) {
      const t = tileOf(s), [x, y] = originOf(s), w = stampW(s, t) * CELL, h = stampH(s, t) * CELL;
      if (X >= x && X <= x + w && Y >= y && Y <= y + h) return { index: i, box: -1 };
    }
    return null;
  }

  cv.addEventListener('pointerdown', e => {
    if (brush.mode !== MODE || e.button !== 0) return;
    e.stopImmediatePropagation(); e.preventDefault();
    cellFromEvent(e); if (!pointerPx) return;
    const X = pointerPx.x, Y = pointerPx.y, m = curMap();
    if (target && (!m.stamps[target.index] || target.map !== m.id)) { target = null; sel = -1; }
    // 選中橘框的藍色小方塊：改大小
    if (target && sel >= 0) {
      const s = m.stamps[target.index], boxes = boxesOf(target.id), wb = placed(s, boxes)[sel];
      if (wb) {
        const tol = pxTol(), hs = handlesOf(wb);   // 抓最近的那個小方塊（畫面縮小時好幾個會擠在一起）
        let k = -1, best = Infinity;
        hs.forEach(([hx, hy], j) => { const d = Math.max(Math.abs(hx - X), Math.abs(hy - Y)); if (d <= tol && d < best) { best = d; k = j; } });
        if (k >= 0) {
          const [hx, hy] = handlesOf(wb)[k], [lx, ly] = toLocal(s, hx, hy), b = boxes[sel];
          const near = (v, a) => Math.abs(v - a) < 1.5;   // 這個小方塊在素材上是哪一邊
          drag = { mode: 'resize', orig: b.slice(), ex: near(lx, b[0]) ? 0 : near(lx, b[0] + b[2]) ? 1 : -1, ey: near(ly, b[1]) ? 0 : near(ly, b[1] + b[3]) ? 1 : -1 };
          cv.setPointerCapture(e.pointerId); return;
        }
      }
    }
    const hit = hitAt(X, Y);
    if (!hit) { target = null; sel = -1; say(); draw(); return; }
    const s = m.stamps[hit.index];
    target = { index: hit.index, id: s.id, map: m.id };
    const [lx, ly] = toLocal(s, X, Y);
    if (hit.box >= 0) { sel = hit.box; drag = { mode: 'move', start: [lx, ly], orig: boxesOf(s.id)[sel].slice() }; }
    else {   // 物件上空白的地方：畫新的橘框
      const boxes = boxesOf(s.id); boxes.push(clampBox(s, [Math.floor(lx), Math.floor(ly), 1, 1])); sel = boxes.length - 1;
      drag = { mode: 'new', start: [lx, ly] }; save(boxes);
    }
    cv.setPointerCapture(e.pointerId); say(); draw();
  }, true);

  cv.addEventListener('pointermove', e => {
    if (brush.mode !== MODE || !drag || !target) return;
    e.stopImmediatePropagation();
    cellFromEvent(e); if (!pointerPx) return;
    const s = curMap().stamps[target.index]; if (!s) return;
    const [lx, ly] = toLocal(s, pointerPx.x, pointerPx.y), boxes = boxesOf(target.id), b = boxes[sel]; if (!b) return;
    if (drag.mode === 'move') { const o = drag.orig; b[0] = o[0] + lx - drag.start[0]; b[1] = o[1] + ly - drag.start[1]; b[2] = o[2]; b[3] = o[3]; }
    else if (drag.mode === 'new') { const [sx, sy] = drag.start; b[0] = Math.min(sx, lx); b[1] = Math.min(sy, ly); b[2] = Math.abs(lx - sx) || 1; b[3] = Math.abs(ly - sy) || 1; }
    else {   // 改大小：只動抓住的那一邊（或兩邊）
      const o = drag.orig; let x0 = o[0], y0 = o[1], x1 = o[0] + o[2], y1 = o[1] + o[3];
      if (drag.ex === 0) x0 = Math.min(x1 - 1, lx); else if (drag.ex === 1) x1 = Math.max(x0 + 1, lx);
      if (drag.ey === 0) y0 = Math.min(y1 - 1, ly); else if (drag.ey === 1) y1 = Math.max(y0 + 1, ly);
      b[0] = x0; b[1] = y0; b[2] = x1 - x0; b[3] = y1 - y0;
    }
    clampBox(s, b); drag.moved = true; save(boxes);
  }, true);

  cv.addEventListener('pointerup', e => {
    if (brush.mode !== MODE || !drag) return;
    e.stopImmediatePropagation();
    if (drag.mode === 'new' && target) {   // 只點一下沒拖：不留 1 像素的小框
      const boxes = boxesOf(target.id), b = boxes[sel];
      if (b && b[2] < 3 && b[3] < 3) { boxes.splice(sel, 1); sel = -1; save(boxes); }
    }
    drag = null; finish(); say(); draw();
  }, true);

  // 鍵盤：方向鍵照「畫面上」的方向走（物件翻轉、轉向過也一樣）
  window.addEventListener('keydown', e => {
    if (brush.mode !== MODE || !target || sel < 0) { if (brush.mode === MODE && e.key === 'Escape' && target) { target = null; sel = -1; say(); draw(); } return; }
    if (e.target && e.target.closest && e.target.closest('input, textarea, select, [contenteditable="true"]')) return;
    const s = curMap().stamps[target.index]; if (!s || target.map !== curMap().id) { target = null; sel = -1; return; }
    const boxes = boxesOf(target.id), b = boxes[sel]; if (!b) return;
    if (e.key === 'Escape') { target = null; sel = -1; }
    else if (e.key === 'Delete' || e.key === 'Backspace') { boxes.splice(sel, 1); sel = Math.min(sel, boxes.length - 1); save(boxes); }
    else {
      const dir = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key]; if (!dir) return;
      const n = e.shiftKey ? 10 : 1, k = typeof stampScaleOf === 'function' ? stampScaleOf(s) : 1;
      const [ax, ay] = toLocal(s, 0, 0), [bx, by] = toLocal(s, dir[0] * n * k, dir[1] * n * k), dx = Math.round(bx - ax), dy = Math.round(by - ay);
      if (e.ctrlKey || e.metaKey) {   // 改寬高：→↓＝變大、←↑＝變小；物件轉了 90 度時，左右鍵改的是素材的高
        const turned = ((Number(s.rot) || 0) % 2 + 2) % 2 === 1, amount = n * (dir[0] + dir[1]);
        if ((dir[0] !== 0) !== turned) b[2] += amount; else b[3] += amount;
      } else { b[0] += dx; b[1] += dy; }
      clampBox(s, b); save(boxes);
    }
    finish(); e.preventDefault(); e.stopImmediatePropagation(); say(); draw();
  }, true);

  // 物件編輯器（別的分頁）改了：重畫
  window.addEventListener('storage', e => { if (e.key === TILE_COLLISION_DRAFT || e.key === null) draw(); });

  // 換工具、換地圖：取消選取
  document.querySelectorAll('.tool').forEach(b => b.addEventListener('click', () => { target = null; sel = -1; drag = null; refreshResetBtn(); if (b.dataset.mode === MODE) { say(); draw(); } }));
  // 畫選中的物件（藍色虛線）和選中的橘框（藍色＋小方塊）；js/map-editor.js 的 draw() 會呼叫
  window.drawTileBoxEditor = function (g) {
    if (brush.mode !== MODE || !target) return;
    const s = curMap().stamps[target.index];
    if (!s || s.id !== target.id || target.map !== curMap().id) { target = null; sel = -1; refreshResetBtn(); return; }   // 換了地圖、物件被刪掉：取消選取
    const t = tileOf(s), [x, y] = originOf(s);
    g.save();
    g.strokeStyle = '#5fd0ff'; g.lineWidth = 1.5; g.setLineDash([5, 4]); g.strokeRect(x + .5, y + .5, stampW(s, t) * CELL - 1, stampH(s, t) * CELL - 1); g.setLineDash([]);
    const wb = placed(s, boxesOf(target.id))[sel];
    if (wb) {
      g.fillStyle = 'rgba(80,200,255,.30)'; g.fillRect(wb[0], wb[1], wb[2] - wb[0], wb[3] - wb[1]);
      g.strokeStyle = '#5fd0ff'; g.lineWidth = 2; g.strokeRect(wb[0] + 1, wb[1] + 1, wb[2] - wb[0] - 2, wb[3] - wb[1] - 2);
      g.fillStyle = '#5fd0ff'; for (const [hx, hy] of handlesOf(wb)) g.fillRect(hx - 4, hy - 4, 8, 8);
    }
    g.restore();
  };
})();
