/* ===== 物件編輯器：🧱 素材碰撞 =====
   素材庫（data/tiles.js 的 SHARED_TILES）裡任何一張素材都可以設碰撞方框（像素，不用對齊格子）。
   設好之後地圖、基地上這張素材貼幾個都是一樣的碰撞，人物遮擋線也自動用方框的中間（說明見 js/tile-collisions.js）。
   操作：在圖上拖曳＝畫新方框；拖方框＝移動；拖方框的邊、角＝改大小；
         方向鍵＝移動 1 像素（Shift＝10 像素）；Ctrl＋方向鍵＝改寬高 1 像素（Shift＝10）；Delete＝刪掉選中的方框。
   修改先存在這個瀏覽器（只記改過的素材，js/tile-collisions.js 的 TILE_COLLISION_DRAFT），遊戲、地圖編輯器、基地編輯器馬上讀得到；
   按「💾 存到專案」寫進 data/tile-collisions.js。
   人物遮擋線：每張素材也可以直接手動設（不一定要有碰撞方框）。拖藍色虛線、Shift＋點圖片、或在「人物遮擋線」欄填像素；
   「改回自動」＝用碰撞方框的中間（沒有方框就照原本的遮擋規則）。地圖上個別物件手動設過遮擋線的，照那個物件自己的。 */
const TileCollisionEditor = (() => {
  const CELLPX = TILE_COLLISION_CELL, tiles = typeof SHARED_TILES !== 'undefined' ? SHARED_TILES.filter(t => t && t.id && t.file) : [];
  const $ = id => document.getElementById(id);
  let draft = {}; try { draft = JSON.parse(localStorage.getItem(TILE_COLLISION_DRAFT) || '{}') || {}; } catch (_) { draft = {}; }
  for (const id of Object.keys(draft)) if (JSON.stringify(draft[id] || []) === JSON.stringify((typeof TILE_COLLISIONS !== 'undefined' && TILE_COLLISIONS[id]) || [])) delete draft[id];   // 已經存到專案的：草稿拿掉
  try { if (Object.keys(draft).length) localStorage.setItem(TILE_COLLISION_DRAFT, JSON.stringify(draft)); else localStorage.removeItem(TILE_COLLISION_DRAFT); } catch (_) {}
  let depthDraft = {}; try { depthDraft = JSON.parse(localStorage.getItem(TILE_DEPTH_DRAFT) || '{}') || {}; } catch (_) { depthDraft = {}; }
  for (const id of Object.keys(depthDraft)) if ((depthDraft[id] ?? null) === ((typeof TILE_DEPTHS !== 'undefined' && TILE_DEPTHS[id]) ?? null)) delete depthDraft[id];   // 已經存到專案的：草稿拿掉
  const saveDepthDraft = () => { try { if (Object.keys(depthDraft).length) localStorage.setItem(TILE_DEPTH_DRAFT, JSON.stringify(depthDraft)); else localStorage.removeItem(TILE_DEPTH_DRAFT); } catch (_) {} };
  saveDepthDraft();
  let cur = null, boxes = [], sel = -1, zoom = 4, drag = null, clip = null, manual = null;   // manual＝這張素材手動設的人物遮擋線（像素；null＝自動）
  const tilePx = t => [Math.round((Number(t.w) || 1) * CELLPX), Math.round((Number(t.h) || 1) * CELLPX)];
  const hasBoxes = id => !!tileCollisionBoxes(id);
  const hasDepth = id => tileManualDepth(id) != null;

  // ---- 版面 ----
  const sec = document.createElement('section'); sec.id = 'tcEditor'; sec.className = 'tc panel';
  sec.innerHTML = `
    <h2>🧱 素材碰撞・人物遮擋線 <small>每張素材設一次，地圖、基地上貼幾個都一樣；人物遮擋線可以手動設，沒設就用方框的中間</small></h2>
    <div class="tc-wrap">
      <div class="tc-side">
        <input id="tcSearch" placeholder="搜尋素材名稱、id、檔名…">
        <label class="tc-only"><input type="checkbox" id="tcOnlySet"> 只看設過碰撞或遮擋線的</label>
        <div id="tcList" class="tc-list"></div>
      </div>
      <div class="tc-main">
        <div class="row tc-tools">
          <b id="tcName">（先從左邊選一張素材）</b>
          <label>放大 <select id="tcZoom">${[1, 2, 3, 4, 6, 8].map(z => `<option value="${z}">${z}×</option>`).join('')}</select></label>
          <button id="tcAdd" class="btn">＋ 新增方框</button>
          <button id="tcDel" class="btn">🗑 刪除方框</button>
          <button id="tcClear" class="btn">清除這張的碰撞</button>
          <button id="tcCopy" class="btn">複製碰撞</button>
          <button id="tcPaste" class="btn">貼上碰撞</button>
        </div>
        <div class="row tc-nums">選中的方框：
          <label>X <input id="tcX" type="number"></label><label>Y <input id="tcY" type="number"></label>
          <label>寬 <input id="tcW" type="number" min="1"></label><label>高 <input id="tcH" type="number" min="1"></label>
        </div>
        <div class="row tc-nums">📏 人物遮擋線：
          <label><input id="tcDepthIn" type="number" min="0" placeholder="自動" style="width:80px"> 像素（離圖片頂端）</label>
          <button id="tcDepthTop" class="btn" title="人物遮擋線放在圖片最上面：人一律畫在這個物件前面（例如地上的樓梯、平台）">設成 0</button>
          <button id="tcDepthAuto" class="btn" title="拿掉手動的設定：有碰撞方框就用方框的中間，沒有就照原本的遮擋規則">改回自動</button>
          <span id="tcDepth" class="tc-depth"></span>
        </div>
        <div class="tc-stage" tabindex="0"><canvas id="tcCanvas"></canvas></div>
        <p class="help">在圖上拖曳＝畫新方框；拖方框＝移動；拖邊、角＝改大小。方向鍵＝移動 1 像素（Shift＝10）；Ctrl＋方向鍵＝改寬高；Delete＝刪掉。
          橘色＝擋路的方框；藍色虛線＝人物遮擋線（人的腳在線上方就被這個物件蓋住）：拖藍線、或 Shift＋點圖片＝手動設在那裡。地圖上個別物件手動設過遮擋線的，照那個物件自己的。
          這裡設的是所有地圖共用的預設；在地圖編輯器用 🟧 橘框改過的地圖，那張地圖上的這張素材照地圖自己的設定，不會跟著這裡變。
          改了會馬上存在這個瀏覽器（遊戲、地圖編輯器、基地編輯器重新整理就套用）；按 <button id="tcSave" class="btn primary">💾 存到專案</button> 寫進 data/tile-collisions.js。
          <button id="tcReset" class="btn">丟掉還沒存的修改</button></p>
        <div id="tcStatus" class="status"></div>
      </div>
    </div>`;
  const main = document.querySelector('main.layout'); (main ? main.parentNode.insertBefore(sec, main.nextSibling) : document.body.appendChild(sec));
  const cv = $('tcCanvas'), g = cv.getContext('2d'), stage = sec.querySelector('.tc-stage');
  $('tcZoom').value = String(zoom);
  const say = (m, err) => { $('tcStatus').textContent = m; $('tcStatus').style.color = err ? '#ff8f8f' : ''; };

  // ---- 清單 ----
  function renderList() {
    const q = $('tcSearch').value.trim().toLowerCase(), only = $('tcOnlySet').checked;
    const hits = tiles.filter(t => (!only || hasBoxes(t.id) || hasDepth(t.id)) && (!q || [t.name, t.id, t.file].some(v => String(v || '').toLowerCase().includes(q))));
    const box = $('tcList'); box.innerHTML = '';
    for (const t of hits.slice(0, 300)) {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'tc-item' + (cur && cur.id === t.id ? ' sel' : '');
      b.innerHTML = '<img loading="lazy" alt=""><span></span>';
      b.querySelector('img').src = t.file; b.querySelector('span').textContent = (hasBoxes(t.id) ? '🧱 ' : '') + (hasDepth(t.id) ? '📏 ' : '') + (t.name || t.id);
      b.title = t.id + '\n' + t.file;
      b.onclick = () => pick(t);
      box.appendChild(b);
    }
    if (hits.length > 300) { const p = document.createElement('p'); p.className = 'help'; p.textContent = '還有 ' + (hits.length - 300) + ' 張，請用搜尋縮小範圍'; box.appendChild(p); }
    if (!hits.length) { const p = document.createElement('p'); p.className = 'help'; p.textContent = '找不到符合的素材'; box.appendChild(p); }
  }
  // ---- 選素材 ----
  const imgCache = new Map();
  const imgOf = t => { if (!imgCache.has(t.file)) { const im = new Image(); im.onload = draw; im.src = t.file; imgCache.set(t.file, im); } return imgCache.get(t.file); };
  function pick(t) {
    cur = t; boxes = (tileCollisionBoxes(t.id) || []).map(b => b.slice()); sel = boxes.length ? 0 : -1; manual = tileManualDepth(t.id);
    const [tw, th] = tilePx(t); zoom = Math.max(1, Math.min(8, Math.floor(520 / Math.max(tw, th)) || 1));
    $('tcZoom').value = String([1, 2, 3, 4, 6, 8].reduce((a, z) => z <= zoom ? z : a, 1)); zoom = Number($('tcZoom').value);
    const same = tileSameImageIds(t.id).length;   // 同一張圖片登記了好幾次：碰撞一起共用
    $('tcName').textContent = (t.name || t.id) + '（' + tw + '×' + th + ' 像素，' + (t.w || 1) + '×' + (t.h || 1) + ' 格）' + (same > 1 ? '　※ 同一張圖片登記了 ' + same + ' 次，碰撞一起共用' : '');
    renderList(); refresh(); stage.focus();
  }
  // ---- 存檔（只記改過的素材）----
  const norm = bs => bs.map(b => b.map(v => Math.round(v))).filter(b => b[2] > 0 && b[3] > 0);
  // 存草稿：用 js/tile-collisions.js 的共用寫法（同一張圖的素材一起改；地圖編輯器的「🧱 橘框」也是這樣存）
  const readDrafts = () => {
    try { draft = JSON.parse(localStorage.getItem(TILE_COLLISION_DRAFT) || '{}') || {}; } catch (_) { draft = {}; }
    try { depthDraft = JSON.parse(localStorage.getItem(TILE_DEPTH_DRAFT) || '{}') || {}; } catch (_) { depthDraft = {}; }
  };
  function commit() {
    if (!cur) return;
    tileCollisionSaveBoxes(cur.id, norm(boxes));
    tileDepthSave(cur.id, manual);
    readDrafts();
    const same = tileSameImageIds(cur.id).length;
    const n = new Set([...Object.keys(draft), ...Object.keys(depthDraft)]).size;
    say((n ? '✓ 已存在這個瀏覽器（' + n + ' 張素材還沒存到專案）' : '✓ 跟專案檔一樣') + (same > 1 ? '；同一張圖片的 ' + same + ' 個素材一起改了' : ''));
  }
  // 地圖編輯器（別的分頁）改了橘框：這邊跟著更新（正在拖曳時不打斷）
  window.addEventListener('storage', e => {
    if (e.key !== TILE_COLLISION_DRAFT && e.key !== TILE_DEPTH_DRAFT && e.key !== null) return;
    readDrafts(); renderListSoon();
    if (cur && !drag) { boxes = (tileCollisionBoxes(cur.id) || []).map(b => b.slice()); sel = Math.min(sel, boxes.length - 1); manual = tileManualDepth(cur.id); refresh(); }
  });
  const source = () => tileCollisionSource();   // 匯出內容（js/tile-collisions.js，地圖編輯器存到專案也用同一份）

  // ---- 畫 ----
  const autoDepth = () => { if (manual != null) return manual; if (!boxes.length) return null; const y0 = Math.min(...boxes.map(b => b[1])), y1 = Math.max(...boxes.map(b => b[1] + b[3])); return (y0 + y1) / 2; };   // 手動優先
  function draw() {
    if (!cur) { cv.width = 400; cv.height = 200; g.fillStyle = '#0c1016'; g.fillRect(0, 0, 400, 200); g.fillStyle = '#8a97a8'; g.font = '16px sans-serif'; g.fillText('從左邊選一張素材', 130, 105); return; }
    const [tw, th] = tilePx(cur), pad = 20, W = tw * zoom + pad * 2, H = th * zoom + pad * 2;
    if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
    for (let y = 0; y < H; y += 16) for (let x = 0; x < W; x += 16) { g.fillStyle = ((x + y) / 16) % 2 ? '#18202b' : '#141b24'; g.fillRect(x, y, 16, 16); }
    g.translate(pad, pad);
    const im = imgOf(cur); g.imageSmoothingEnabled = false;
    if (im.complete && im.naturalWidth) g.drawImage(im, 0, 0, tw * zoom, th * zoom);
    g.strokeStyle = 'rgba(190,210,235,.35)'; g.lineWidth = 1;   // 格線（一格 40 像素）
    for (let x = 0; x <= tw; x += CELLPX) { g.beginPath(); g.moveTo(x * zoom + .5, 0); g.lineTo(x * zoom + .5, th * zoom); g.stroke(); }
    for (let y = 0; y <= th; y += CELLPX) { g.beginPath(); g.moveTo(0, y * zoom + .5); g.lineTo(tw * zoom, y * zoom + .5); g.stroke(); }
    boxes.forEach(([x, y, w, h], i) => {
      g.fillStyle = i === sel ? 'rgba(80,200,255,.30)' : 'rgba(255,150,40,.32)'; g.fillRect(x * zoom, y * zoom, w * zoom, h * zoom);
      g.strokeStyle = i === sel ? '#5fd0ff' : '#ffa63a'; g.lineWidth = 2; g.strokeRect(x * zoom + 1, y * zoom + 1, w * zoom - 2, h * zoom - 2);
      if (i === sel) { g.fillStyle = '#5fd0ff'; for (const [hx, hy] of handles([x, y, w, h])) g.fillRect(hx - 4, hy - 4, 8, 8); }
    });
    const d = autoDepth();
    if (d != null) {
      g.strokeStyle = '#55d9ff'; g.lineWidth = 2; g.setLineDash([8, 5]); g.beginPath(); g.moveTo(-pad / 2, d * zoom); g.lineTo(tw * zoom + pad / 2, d * zoom); g.stroke(); g.setLineDash([]);
      g.fillStyle = '#55d9ff'; g.font = 'bold 12px sans-serif'; g.fillText('人物遮擋線' + (manual != null ? '（手動）' : '（自動）'), 4, Math.max(12, d * zoom - 5));
    }
  }
  const handles = ([x, y, w, h]) => { const X0 = x * zoom, Y0 = y * zoom, X1 = (x + w) * zoom, Y1 = (y + h) * zoom, mx = (X0 + X1) / 2, my = (Y0 + Y1) / 2; return [[X0, Y0], [mx, Y0], [X1, Y0], [X1, my], [X1, Y1], [mx, Y1], [X0, Y1], [X0, my]]; };
  function refresh() {
    const b = boxes[sel];
    ['tcX', 'tcY', 'tcW', 'tcH'].forEach((id, k) => { $(id).disabled = !b; $(id).value = b ? b[k] : ''; });
    const d = autoDepth(); $('tcDepth').textContent = d == null ? '目前：自動（沒有方框，照原本的遮擋規則）' : (manual != null ? '目前：手動，' : '目前：自動（方框中間），') + '頂端往下 ' + Math.round(d) + ' 像素（' + (Math.round(d / CELLPX * 100) / 100) + ' 格）';
    $('tcDepthIn').disabled = !cur; $('tcDepthIn').value = manual != null ? Math.round(manual) : '';
    draw();
  }
  const changed = () => { commit(); refresh(); renderListSoon(); };
  let listTimer = null; const renderListSoon = () => { clearTimeout(listTimer); listTimer = setTimeout(renderList, 300); };
  const clampBox = b => { const [tw, th] = tilePx(cur); b[2] = Math.max(1, Math.min(tw, Math.round(b[2]))); b[3] = Math.max(1, Math.min(th, Math.round(b[3]))); b[0] = Math.max(0, Math.min(tw - b[2], Math.round(b[0]))); b[1] = Math.max(0, Math.min(th - b[3], Math.round(b[1]))); return b; };

  // ---- 滑鼠 ----
  const at = e => { const r = cv.getBoundingClientRect(), k = cv.width / r.width; return [((e.clientX - r.left) * k - 20) / zoom, ((e.clientY - r.top) * k - 20) / zoom]; };
  cv.addEventListener('mousedown', e => {
    if (!cur) return; stage.focus(); const [px, py] = at(e);
    const [, th0] = tilePx(cur), dNow = autoDepth();
    if (e.shiftKey || (dNow != null && Math.abs(dNow - py) * zoom <= 6)) {   // Shift＋點、或按住藍線：手動設人物遮擋線
      manual = Math.max(0, Math.min(th0, Math.round(py))); drag = { mode: 'depth' }; refresh(); return;
    }
    // 先看是不是抓到選中方框的把手（改大小）
    if (sel >= 0) {
      const hs = handles(boxes[sel]), k = hs.findIndex(([hx, hy]) => Math.abs(hx / zoom - px) * zoom <= 7 && Math.abs(hy / zoom - py) * zoom <= 7);
      if (k >= 0) { drag = { mode: 'resize', k, start: [px, py], orig: boxes[sel].slice() }; return; }
    }
    const hit = boxes.map((b, i) => i).reverse().find(i => { const [x, y, w, h] = boxes[i]; return px >= x && px < x + w && py >= y && py < y + h; });
    if (hit != null) { sel = hit; drag = { mode: 'move', start: [px, py], orig: boxes[sel].slice() }; refresh(); return; }
    boxes.push(clampBox([Math.floor(px), Math.floor(py), 1, 1])); sel = boxes.length - 1;
    drag = { mode: 'new', start: [Math.floor(px), Math.floor(py)] }; refresh();
  });
  window.addEventListener('mousemove', e => {
    if (!drag || !cur) return; const [px, py] = at(e);
    if (drag.mode === 'depth') { manual = Math.max(0, Math.min(tilePx(cur)[1], Math.round(py))); refresh(); return; }
    const b = boxes[sel]; if (!b) return;
    if (drag.mode === 'move') { const o = drag.orig; b[0] = o[0] + (px - drag.start[0]); b[1] = o[1] + (py - drag.start[1]); b[2] = o[2]; b[3] = o[3]; }
    else if (drag.mode === 'new') { const [sx, sy] = drag.start; b[0] = Math.min(sx, px); b[1] = Math.min(sy, py); b[2] = Math.abs(px - sx) || 1; b[3] = Math.abs(py - sy) || 1; }
    else {   // 改大小：0 左上、1 上、2 右上、3 右、4 右下、5 下、6 左下、7 左
      const o = drag.orig, k = drag.k, dx = px - drag.start[0], dy = py - drag.start[1];
      let x0 = o[0], y0 = o[1], x1 = o[0] + o[2], y1 = o[1] + o[3];
      if ([0, 6, 7].includes(k)) x0 = Math.min(x1 - 1, x0 + dx); if ([2, 3, 4].includes(k)) x1 = Math.max(x0 + 1, x1 + dx);
      if ([0, 1, 2].includes(k)) y0 = Math.min(y1 - 1, y0 + dy); if ([4, 5, 6].includes(k)) y1 = Math.max(y0 + 1, y1 + dy);
      b[0] = x0; b[1] = y0; b[2] = x1 - x0; b[3] = y1 - y0;
    }
    clampBox(b); refresh();
  });
  window.addEventListener('mouseup', () => { if (!drag) return; if (drag.mode === 'depth') { drag = null; changed(); return; } const b = boxes[sel]; if (drag.mode === 'new' && b && b[2] < 3 && b[3] < 3) { boxes.splice(sel, 1); sel = boxes.length - 1; } drag = null; changed(); });

  // ---- 鍵盤 ----
  stage.addEventListener('keydown', e => {
    if (!cur) return;
    if ((e.key === 'Delete' || e.key === 'Backspace') && sel >= 0) { boxes.splice(sel, 1); sel = Math.min(sel, boxes.length - 1); changed(); e.preventDefault(); return; }
    const dir = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key]; if (!dir || sel < 0) return;
    e.preventDefault(); const n = e.shiftKey ? 10 : 1, b = boxes[sel];
    if (e.ctrlKey || e.metaKey) { b[2] += dir[0] * n; b[3] += dir[1] * n; } else { b[0] += dir[0] * n; b[1] += dir[1] * n; }
    clampBox(b); changed();
  });
  // ---- 按鈕、數字 ----
  ['tcX', 'tcY', 'tcW', 'tcH'].forEach((id, k) => $(id).addEventListener('change', () => { const b = boxes[sel]; if (!b) return; b[k] = Number($(id).value) || 0; clampBox(b); changed(); }));
  $('tcZoom').onchange = () => { zoom = Number($('tcZoom').value) || 1; draw(); };
  $('tcDepthIn').addEventListener('change', () => { if (!cur) return; const v = $('tcDepthIn').value.trim(); manual = v === '' ? null : Math.max(0, Math.min(tilePx(cur)[1], Math.round(Number(v) || 0))); changed(); });
  $('tcDepthTop').onclick = () => { if (!cur) return; manual = 0; changed(); };
  $('tcDepthAuto').onclick = () => { if (!cur) return; manual = null; changed(); };
  $('tcSearch').oninput = renderListSoon; $('tcOnlySet').onchange = renderList;
  $('tcAdd').onclick = () => { if (!cur) return; const [tw, th] = tilePx(cur); boxes.push(clampBox([0, th - Math.min(20, th), tw, Math.min(20, th)])); sel = boxes.length - 1; changed(); stage.focus(); };   // 預設：最下面一條（牆腳、家具的底）
  $('tcDel').onclick = () => { if (sel < 0) return; boxes.splice(sel, 1); sel = Math.min(sel, boxes.length - 1); changed(); };
  $('tcClear').onclick = () => { if (!cur || !boxes.length || !confirm('清除「' + (cur.name || cur.id) + '」的所有碰撞方框？')) return; boxes = []; sel = -1; changed(); };
  $('tcCopy').onclick = () => { if (!cur) return; clip = { boxes: boxes.map(b => b.slice()), size: tilePx(cur) }; say('已複製 ' + boxes.length + ' 個方框，選另一張素材再按「貼上碰撞」'); };
  $('tcPaste').onclick = () => {
    if (!cur || !clip) return; const [tw, th] = tilePx(cur), [sw, sh] = clip.size;   // 大小不一樣：照比例縮放
    boxes = clip.boxes.map(([x, y, w, h]) => clampBox([x * tw / sw, y * th / sh, w * tw / sw, h * th / sh])); sel = boxes.length ? 0 : -1; changed();
  };
  $('tcReset').onclick = () => { if ((!Object.keys(draft).length && !Object.keys(depthDraft).length) || !confirm('丟掉這個瀏覽器裡還沒存到專案的素材碰撞、人物遮擋線修改？')) return; draft = {}; depthDraft = {}; try { localStorage.removeItem(TILE_COLLISION_DRAFT); localStorage.removeItem(TILE_DEPTH_DRAFT); } catch (_) {} if (cur) pick(cur); renderList(); say('已回到專案檔的設定'); };
  $('tcSave').onclick = e => { const b = document.querySelector('.project-save-btn'); if (b) b.click(); else say('找不到「💾 存到專案」按鈕', true); };

  renderList(); draw();
  return { source, clearDraft: () => { draft = {}; depthDraft = {}; try { localStorage.removeItem(TILE_COLLISION_DRAFT); localStorage.removeItem(TILE_DEPTH_DRAFT); } catch (_) {} renderList(); } };
})();
