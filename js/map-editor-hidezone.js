/* ===== 地圖編輯器：🙈 完全遮住區 =====
   角色（溫特、隊員、NPC、怪物）的腳踩進這些方框，整個人就不畫（走到柱子、牆後面時，牆的圖不夠高、頭露出來的地方用）。
   ・不影響走路、碰撞、尋路，只是看不到；走出方框就再出現。靠近邊緣的 12 像素慢慢淡出／淡入，不會一下子消失（js/hide-zones.js）
   ・方框用像素（不用對齊格子）：存在地圖的 m.hideZones＝[[x, y, 寬, 高], …]（從地圖左上角算）
   操作（工具列「⋯ 更多」→ 🙈 完全遮住區）：
     在空白處拖曳＝畫新方框；按住方框拖＝移動；拖邊、角＝改大小
     方向鍵＝移動 1 像素（Shift＝10）；Ctrl＋方向鍵＝改寬高；Delete＝刪掉選中的方框；Esc＝取消選取
   這個工具以外的時候，打開「顯示紅格」也看得到這些方框（紫色）。 */
(() => {
  if (typeof cv === 'undefined' || typeof curMap !== 'function') return;
  const MODE = 'hidezone', HANDLE = 6;
  let sel = -1, drag = null;
  const zones = (m = curMap()) => Array.isArray(m.hideZones) ? m.hideZones : (m.hideZones = []);
  const clean = m => { if (Array.isArray(m.hideZones) && !m.hideZones.length) delete m.hideZones; };
  const active = () => typeof brush !== 'undefined' && brush.mode === MODE;

  // ---- 工具按鈕：放在「⋯ 更多」裡的深水區後面（找不到就放在工具列最後）----
  const btn = document.createElement('button');
  btn.className = 'tool'; btn.dataset.mode = MODE; btn.textContent = '🙈 完全遮住區';
  btn.title = '畫「完全遮住區」：角色的腳踩進紫色方框就整個人不畫（牆、柱子的圖不夠高、頭會露出來的地方用）。不影響走路。' +
    '拖曳畫方框；拖方框移動、拖邊角改大小；方向鍵微調 1 像素（Shift＝10），Ctrl＋方向鍵改寬高，Delete 刪掉';
  const anchor = document.querySelector('.tool[data-mode="deepkeep"]') || document.querySelector('.tool[data-mode="deepwater"]');
  if (anchor) anchor.insertAdjacentElement('afterend', btn); else (document.querySelector('.tool-more-menu') || document.querySelector('#mapbar') || document.body).appendChild(btn);
  btn.addEventListener('click', () => {
    brush = { mode: MODE, tile: brush.tile }; sel = -1;
    if (typeof clearSelection === 'function') clearSelection();
    updateToolUI(); renderPalette(); draw();
    setStatus('🙈 完全遮住區：拖曳畫方框，角色的腳踩進去就整個人不畫（目前 ' + (curMap().hideZones || []).length + ' 個）', '#c9a6ff');
  });

  // ---- 畫 ----
  const rectHandles = ([x, y, w, h]) => [[x, y], [x + w / 2, y], [x + w, y], [x + w, y + h / 2], [x + w, y + h], [x + w / 2, y + h], [x, y + h], [x, y + h / 2]];
  function overlay() {
    const m = curMap(), list = Array.isArray(m.hideZones) ? m.hideZones : [];
    if (!list.length || !(active() || (typeof showSolid !== 'undefined' && showSolid))) return;
    ctx.save();
    ctx.setTransform(EDITOR_RES, 0, 0, EDITOR_RES, 0, 0);
    list.forEach(([x, y, w, h], i) => {
      const on = active() && i === sel;
      ctx.fillStyle = on ? 'rgba(200,140,255,.38)' : 'rgba(170,110,255,.24)'; ctx.fillRect(OX + x, OY + y, w, h);
      ctx.strokeStyle = on ? '#e2c8ff' : '#b07cff'; ctx.lineWidth = 2; ctx.setLineDash(on ? [] : [6, 4]); ctx.strokeRect(OX + x + 1, OY + y + 1, w - 2, h - 2); ctx.setLineDash([]);
      ctx.fillStyle = '#f0e2ff'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.fillText('🙈', OX + x + 3, OY + y + 3);
      if (on) { ctx.fillStyle = '#e2c8ff'; for (const [hx, hy] of rectHandles([x, y, w, h])) ctx.fillRect(OX + hx - 4, OY + hy - 4, 8, 8); }
    });
    ctx.restore();
  }
  const baseDraw = draw;
  draw = function () { const out = baseDraw.apply(this, arguments); try { overlay(); } catch (e) { console.warn(e); } return out; };

  // ---- 滑鼠（只在這個工具時接手，地圖編輯器原本的畫圖就不會動）----
  const at = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * (COLS * CELL / r.width) - OX, (e.clientY - r.top) * (ROWS * CELL / r.height) - OY]; };
  const clampZone = z => { z[2] = Math.max(4, Math.round(z[2])); z[3] = Math.max(4, Math.round(z[3])); z[0] = Math.round(z[0]); z[1] = Math.round(z[1]); return z; };
  cv.addEventListener('pointerdown', e => {
    if (!active() || e.button !== 0) return;
    e.stopImmediatePropagation(); e.preventDefault(); cv.setPointerCapture(e.pointerId);
    const [px, py] = at(e), list = zones();
    pushUndo();
    if (sel >= 0 && list[sel]) {   // 選中的方框：先看有沒有抓到邊角（改大小）
      const k = rectHandles(list[sel]).findIndex(([hx, hy]) => Math.abs(hx - px) <= HANDLE && Math.abs(hy - py) <= HANDLE);
      if (k >= 0) { drag = { mode: 'resize', k, start: [px, py], orig: list[sel].slice() }; return; }
    }
    const hit = list.map((z, i) => i).reverse().find(i => { const [x, y, w, h] = list[i]; return px >= x && px < x + w && py >= y && py < y + h; });
    if (hit != null) { sel = hit; drag = { mode: 'move', start: [px, py], orig: list[sel].slice() }; draw(); return; }
    list.push([Math.round(px), Math.round(py), 4, 4]); sel = list.length - 1;
    drag = { mode: 'new', start: [Math.round(px), Math.round(py)] }; draw();
  }, true);
  cv.addEventListener('pointermove', e => {
    if (!active() || !drag) return;
    e.stopImmediatePropagation();
    const [px, py] = at(e), z = zones()[sel]; if (!z) return;
    if (drag.mode === 'move') { z[0] = drag.orig[0] + (px - drag.start[0]); z[1] = drag.orig[1] + (py - drag.start[1]); }
    else if (drag.mode === 'new') { const [sx, sy] = drag.start; z[0] = Math.min(sx, px); z[1] = Math.min(sy, py); z[2] = Math.abs(px - sx); z[3] = Math.abs(py - sy); }
    else {   // 0 左上、1 上、2 右上、3 右、4 右下、5 下、6 左下、7 左
      const o = drag.orig, k = drag.k, dx = px - drag.start[0], dy = py - drag.start[1];
      let x0 = o[0], y0 = o[1], x1 = o[0] + o[2], y1 = o[1] + o[3];
      if ([0, 6, 7].includes(k)) x0 = Math.min(x1 - 4, x0 + dx); if ([2, 3, 4].includes(k)) x1 = Math.max(x0 + 4, x1 + dx);
      if ([0, 1, 2].includes(k)) y0 = Math.min(y1 - 4, y0 + dy); if ([4, 5, 6].includes(k)) y1 = Math.max(y0 + 4, y1 + dy);
      z[0] = x0; z[1] = y0; z[2] = x1 - x0; z[3] = y1 - y0;
    }
    clampZone(z); draw();
  }, true);
  cv.addEventListener('pointerup', e => {
    if (!active() || !drag) return;
    e.stopImmediatePropagation();
    const m = curMap(), list = zones(m), z = list[sel];
    if (drag.mode === 'new' && z && z[2] < 8 && z[3] < 8) { list.splice(sel, 1); sel = -1; }   // 只是點一下：不畫
    drag = null; clean(m); saveMaps(); draw();
    if (typeof painting !== 'undefined') painting = false;
    setStatus(sel >= 0 && list[sel] ? '🙈 方框 ' + list[sel].join(', ') + '（x, y, 寬, 高）：方向鍵微調，Delete 刪掉' : '🙈 完全遮住區：' + list.length + ' 個方框', '#c9a6ff');
  }, true);

  // ---- 鍵盤微調 ----
  document.addEventListener('keydown', e => {
    if (!active() || sel < 0) return;
    if (e.target && e.target.closest && e.target.closest('input, textarea, select, [contenteditable="true"]')) return;
    const m = curMap(), list = zones(m), z = list[sel]; if (!z) return;
    if (e.key === 'Escape') { sel = -1; draw(); e.stopImmediatePropagation(); return; }
    if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); e.stopImmediatePropagation(); pushUndo(); list.splice(sel, 1); sel = -1; clean(m); saveMaps(); draw(); setStatus('已刪掉這個完全遮住區', '#c9a6ff'); return; }
    const dir = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key]; if (!dir) return;
    e.preventDefault(); e.stopImmediatePropagation(); pushUndo();
    const n = e.shiftKey ? 10 : 1;
    if (e.ctrlKey || e.metaKey) { z[2] += dir[0] * n; z[3] += dir[1] * n; } else { z[0] += dir[0] * n; z[1] += dir[1] * n; }
    clampZone(z); saveMaps(); draw();
    setStatus('🙈 方框 ' + z.join(', ') + '（x, y, 寬, 高）', '#c9a6ff');
  }, true);
  // 換地圖：取消選取
  const baseSwitch = typeof switchTo === 'function' ? switchTo : null;
  if (baseSwitch) switchTo = function () { sel = -1; drag = null; return baseSwitch.apply(this, arguments); };
})();
