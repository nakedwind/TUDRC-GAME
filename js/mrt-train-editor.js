/* ===== 物件編輯器：🚇 捷運列車（js/mrt-train.js 的設定，存在 data/mrt-train.js）=====
   左邊清單下面的「🚇 捷運列車」按鈕打開；點回其他物件就回到原本的畫面。
   ・預覽：車廂四層照遊戲的方式疊起來（對面車門 → 車廂內部 → 外側車門 → 外殼），拉「車門開」看開關的樣子
   ・格子圖：選畫筆在預覽上點或拖曳，設定每一格（車頭、中段各一張）：
     紅＝擋路、藍＝車內地板、綠「門」＝外側門口（車門開著時往下走得出去）、橘「通」＝對面通道（兩側車門都開的班次，門開著時才走得過）
     「依門洞重新產生」照目前的門洞位置自動排一張；「複製到另一節」把這張格子圖套到車頭／中段
   ・門洞位置、秒數都在下面的欄位調；改完自動保存在瀏覽器，按「💾 存到專案」或匯出「捷運列車：mrt-train.js」才會進遊戲
*/
const MrtTrainEditor = (() => {
  const STORE = 'td-mrt-train-editor-v1';
  const clone = x => JSON.parse(JSON.stringify(x));
  const defaults = clone(typeof MRT_TRAIN_SETTINGS !== 'undefined' ? MRT_TRAIN_SETTINGS : {});
  let data;
  try { const saved = typeof DraftSync !== 'undefined' ? DraftSync.load(STORE, defaults, { label: '捷運列車' }) : JSON.parse(localStorage.getItem(STORE) || 'null'); data = saved && typeof saved === 'object' ? saved : clone(defaults); }
  catch (_) { data = clone(defaults); }
  for (const k of Object.keys(defaults)) if (data[k] === undefined) data[k] = clone(defaults[k]);
  const save = () => { localStorage.setItem(STORE, JSON.stringify(data)); say('✓ 已自動保存'); };

  const IMG = { head: 'images/捷運車站/mrt-train-car-head.png', middle: 'images/捷運車站/mrt-train-car-middle.png',
    inside: MRT_TRAIN.inside, outer: MRT_TRAIN.outerDoor.file, far: MRT_TRAIN.farDoor.file };
  const imgs = {};
  for (const [k, src] of Object.entries(IMG)) { const im = new Image(); im.onload = () => draw(); im.src = src; imgs[k] = im; }
  const ok = im => im && im.complete && im.naturalWidth;

  // 欄位：[key, 名稱, 單位/說明, step]
  const DOOR_FIELDS = [['x0', '門洞 1 左緣'], ['x1', '門洞 2 左緣'], ['x2', '門洞 3 左緣'], ['y', '上緣'], ['w', '寬'], ['h', '高']];
  const ART_FIELDS = [['a0', 'x'], ['a1', 'y'], ['a2', '寬'], ['a3', '高']];
  const NUM_FIELDS = [
    ['到站、離站', [['arriveSoundLead', '到站音樂先響幾秒列車才出現', '秒', .5], ['firstWait', '第一班幾秒後來', '秒（要比上一格長，音樂才來得及先響）', .5], ['waitMin', '下一班最少隔', '秒', 1], ['waitMax', '下一班最多隔', '秒', 1], ['arriveDecel', '進站減速度', '越小進站越久', 10], ['departAccel', '離站加速度', '越小開走越慢', 10]]],
    ['車門（照這個順序播音效）', [['doorTime', '開門／關門各', '秒（開門時播開門聲）', .1], ['dwell', '門開好後幾秒播離站警示音', '秒', .5], ['departWarnTime', '離站警示音響多久才播「車門即將關閉」', '秒（離站警示音 5.05 秒）', .05], ['warnTime', '「車門即將關閉」響多久才關門', '秒（這段 3.76 秒；關門時播關門聲）', .05], ['afterClose', '門關好後幾秒開走', '秒（關門聲 5.34 秒；開走時播列車啟動音）', .1], ['doorPassAt', '車門開到幾成才走得過', '0～1', .05]]],
    ['搭車（溫特在車上時關門）', [['rideTime', '開進隧道後黑幾秒才進站', '秒（要比到站音樂先響的秒數長）', .5], ['rideFadeCells', '離隧道口幾格開始變黑', '格（進站時進到軌道幾格才亮回來）', .5], ['rideShake', '搖晃強度', '', .1]]],
    ['其他', [['frontSortDy', '外殼的排序往下', '像素（車內的人被蓋住、月台上的人在前面）', 1], ['doorSortDy', '門口那段外殼的排序往下', '像素，負的＝往上（站在門口還沒上車的人在前面）', 1], ['soundGain', '列車音量', '0～1', .05]]],
  ];

  let panel, canvas, cx, open = .6, carKind = 'middle', farOpen = false, showCells = true, brush = '#', painting = false;
  const BRUSHES = [['#', '擋路', '#ff5a5a'], ['.', '車內地板', '#5aa8ff'], ['D', '外側門口', '#4fe08a'], ['F', '對面通道', '#ffa640']];
  const COLS = 26, ROWS = 4;
  // 照門洞自動排格子圖（跟 js/mrt-train.js 的 mrtAutoLayout 一樣，只是用編輯中的門洞）
  function autoLayout() {
    const inHole = (D, c) => { const ix = (c + .5) * 40; return D.x.some(hx => ix > hx && ix < hx + D.w); };
    return Array.from({ length: ROWS }, (_, r) => Array.from({ length: COLS }, (_, c) => r < ROWS - 1 ? (inHole(data.farDoor, c) ? 'F' : '#') : (inHole(data.outerDoor, c) ? 'D' : '.')).join(''));
  }
  const layout = kind => { if (!data.cells) data.cells = {}; if (!Array.isArray(data.cells[kind]) || !data.cells[kind].length) data.cells[kind] = autoLayout(); return data.cells[kind]; };
  const cellAt = (kind, c, r) => (layout(kind)[r] || '')[c] || '#';
  function setCell(kind, c, r, ch) {
    const L = layout(kind); if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return false;
    const row = (L[r] || '').padEnd(COLS, '#');
    if (row[c] === ch) return false;
    L[r] = row.slice(0, c) + ch + row.slice(c + 1);
    return true;
  }
  const $ = id => document.getElementById(id);
  const say = m => { const s = $('mrtStatus'); if (!s) return; s.textContent = m; clearTimeout(say.t); say.t = setTimeout(() => { s.textContent = ''; }, 1200); };

  function build() {
    const center = document.querySelector('main.layout > section.panel');
    panel = document.createElement('section'); panel.className = 'panel'; panel.id = 'mrtPanel'; panel.hidden = true;
    const doorBox = (key, title) => `<fieldset class="mrt-box"><legend>${title}</legend><div class="mrt-grid">` +
      DOOR_FIELDS.map(([f, n]) => `<label>${n}<input type="number" step="1" data-door="${key}" data-f="${f}"></label>`).join('') +
      `</div><details><summary>門板在門的圖裡的範圍（換門的圖才需要改）</summary><div class="mrt-grid">` +
      ART_FIELDS.map(([f, n]) => `<label>${n}<input type="number" step="1" data-door="${key}" data-f="${f}"></label>`).join('') + `</div></details></fieldset>`;
    panel.innerHTML = `<h2 style="margin-top:0">🚇 捷運列車</h2>
      <div class="row mrt-tools"><label>車廂</label><button class="btn" data-car="middle">中段</button><button class="btn" data-car="head">車頭</button>
        <label style="min-width:0">車門開</label><input id="mrtOpen" type="range" min="0" max="1" step="0.01" style="flex:1">
        <label style="min-width:0"><input type="checkbox" id="mrtFar"> 對面門也開</label><label style="min-width:0"><input type="checkbox" id="mrtCells"> 顯示格子</label></div>
      <div class="row mrt-tools"><label>格子畫筆</label>${BRUSHES.map(([ch, n, col]) => `<button class="btn mrt-brush" data-brush="${ch}"><span class="mrt-swatch" style="background:${col}"></span>${n}</button>`).join('')}</div>
      <div class="mrt-stage"><canvas id="mrtCanvas" width="1040" height="160"></canvas></div>
      <div class="row"><button id="mrtAuto" class="btn">依門洞重新產生</button><button id="mrtCopy" class="btn">複製到另一節</button></div>
      <p class="help">在預覽上點或拖曳，用畫筆設定每一格（目前編輯的是上面選的「中段」或「車頭」）。<b style="color:#ff8a8a">擋路</b>＝車身；<b style="color:#8cc4ff">車內地板</b>＝在車裡走得到；<b style="color:#7ff0aa">外側門口</b>＝也是地板，車門開著時可以往下走到月台；<b style="color:#ffc07a">對面通道</b>＝地圖編輯器勾「兩側車門都開」的班次，車門開著時走得過（往上走到軌道對面），其他時候擋路。車外和地板之間會自動擋住，只有門口、對面通道開著時通。<br>門洞的數字是原圖像素（車廂圖 1040×160，一格＝40），寬高也是門板滑開時的可見範圍。</p>
      ${doorBox('outerDoor', '外側車門（mrt-train-door，靠月台這側）')}
      ${doorBox('farDoor', '對面車門（mrt-train-door-2，車廂內部那層）')}
      ${NUM_FIELDS.map(([title, list]) => `<fieldset class="mrt-box"><legend>${title}</legend><div class="mrt-grid">` +
        list.map(([k, n, unit, step]) => `<label title="${unit}">${n}<span class="mrt-unit">${unit}</span><input type="number" step="${step}" data-num="${k}"></label>`).join('') + `</div></fieldset>`).join('')}
      <div class="row"><button id="mrtReset" class="btn">從正式資料重設</button><span id="mrtStatus" class="status"></span></div>`;
    center.after(panel);
    canvas = $('mrtCanvas'); cx = canvas.getContext('2d');
    panel.querySelectorAll('[data-car]').forEach(b => b.onclick = () => { carKind = b.dataset.car; refresh(); });
    $('mrtOpen').oninput = e => { open = +e.target.value; draw(); };
    $('mrtFar').onchange = e => { farOpen = e.target.checked; draw(); };
    $('mrtCells').onchange = e => { showCells = e.target.checked; draw(); };
    panel.querySelectorAll('[data-brush]').forEach(b => b.onclick = () => { brush = b.dataset.brush; showCells = true; refresh(); });
    const paintAt = e => {
      const rect = canvas.getBoundingClientRect();
      const c = Math.floor((e.clientX - rect.left) * 1040 / rect.width / 40), r = Math.floor((e.clientY - rect.top) * 160 / rect.height / 40);
      if (setCell(carKind, c, r, brush)) draw();
    };
    canvas.addEventListener('pointerdown', e => { if (!showCells) { showCells = true; $('mrtCells').checked = true; } painting = true; try { canvas.setPointerCapture(e.pointerId); } catch (_) {} paintAt(e); });
    canvas.addEventListener('pointermove', e => { if (painting) paintAt(e); });
    const stop = () => { if (!painting) return; painting = false; save(); };
    canvas.addEventListener('pointerup', stop); canvas.addEventListener('pointercancel', stop);
    $('mrtAuto').onclick = () => { if (!confirm('照目前的門洞位置，重新排「' + (carKind === 'head' ? '車頭' : '中段') + '」的格子圖？（會蓋掉這張畫好的）')) return; data.cells[carKind] = autoLayout(); save(); draw(); };
    $('mrtCopy').onclick = () => { const to = carKind === 'head' ? 'middle' : 'head', name = to === 'head' ? '車頭' : '中段'; if (!confirm('把目前這張格子圖複製到「' + name + '」？（會蓋掉' + name + '原本的）')) return; data.cells[to] = layout(carKind).slice(); save(); say('✓ 已複製到' + name); };
    panel.querySelectorAll('[data-door]').forEach(inp => inp.onchange = () => {
      const D = data[inp.dataset.door], f = inp.dataset.f, v = Math.round(+inp.value || 0);
      if (f[0] === 'x') D.x[+f[1]] = v; else if (f[0] === 'a') D.art[+f[1]] = v; else D[f] = v;
      save(); draw();
    });
    panel.querySelectorAll('[data-num]').forEach(inp => inp.onchange = () => { data[inp.dataset.num] = +inp.value || 0; save(); draw(); });
    $('mrtReset').onclick = () => { if (!confirm('確定丟棄瀏覽器裡的捷運列車設定，從正式資料（data/mrt-train.js）重新載入？')) return; data = clone(defaults); localStorage.removeItem(STORE); refresh(); };
    // 左邊清單下面的按鈕
    const btn = document.createElement('button'); btn.id = 'mrtOpenBtn'; btn.className = 'btn'; btn.textContent = '🚇 捷運列車'; btn.style.cssText = 'width:100%;margin:10px 0 0';
    btn.onclick = () => show(true);
    $('list').after(btn);
    const css = document.createElement('style');
    css.textContent = `.mrt-stage{background:repeating-conic-gradient(#18202b 0 25%,#141b24 0 50%) 50%/20px 20px;border-radius:8px;padding:12px;overflow:auto}
      #mrtCanvas{display:block;width:100%;image-rendering:pixelated}
      .mrt-box{border:1px solid #303b4c;border-radius:8px;margin:10px 0;padding:8px 12px}.mrt-box legend{color:#8fd3ff;padding:0 6px}
      .mrt-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px 12px}
      .mrt-grid label{display:flex;flex-direction:column;gap:3px;color:#b9c3d0;font-size:14px}.mrt-grid input{width:100%}
      .mrt-unit{color:#7d8899;font-size:12px;min-height:15px}.mrt-tools button.sel{background:#7257b5;border-color:#a98dea}
      .mrt-box details{margin-top:8px;color:#aeb9c8;font-size:13px}#mrtOpenBtn.sel{border-color:#69d6b0;background:#263f3b}
      .mrt-swatch{display:inline-block;width:12px;height:12px;border-radius:3px;margin-right:6px;vertical-align:-1px}#mrtCanvas{cursor:crosshair;touch-action:none}
      .mrt-tools{flex-wrap:wrap}`;
    document.head.appendChild(css);
  }
  function refresh() {
    panel.querySelectorAll('[data-car]').forEach(b => b.classList.toggle('sel', b.dataset.car === carKind));
    panel.querySelectorAll('[data-brush]').forEach(b => b.classList.toggle('sel', b.dataset.brush === brush));
    $('mrtOpen').value = open; $('mrtFar').checked = farOpen; $('mrtCells').checked = showCells;
    panel.querySelectorAll('[data-door]').forEach(inp => {
      const D = data[inp.dataset.door], f = inp.dataset.f;
      inp.value = f[0] === 'x' ? D.x[+f[1]] : f[0] === 'a' ? D.art[+f[1]] : D[f];
    });
    panel.querySelectorAll('[data-num]').forEach(inp => { inp.value = data[inp.dataset.num]; });
    draw();
  }
  function draw() {
    if (!cx || panel.hidden) return;
    cx.clearRect(0, 0, canvas.width, canvas.height);
    cx.imageSmoothingEnabled = false;
    const k = mrtDoorEase(open);
    if (ok(imgs.far)) drawMrtDoors(cx, imgs.far, data.farDoor, farOpen ? k : 0);
    if (ok(imgs.inside)) cx.drawImage(imgs.inside, 0, 0);
    if (ok(imgs.outer)) drawMrtDoors(cx, imgs.outer, data.outerDoor, k);
    if (ok(imgs[carKind])) cx.drawImage(imgs[carKind], 0, 0);
    if (!showCells) return;
    const FILL = { '#': 'rgba(255,80,80,.22)', '.': 'rgba(80,160,255,.22)', D: 'rgba(80,230,140,.38)', F: 'rgba(255,166,64,.38)' };
    cx.save();
    cx.font = 'bold 14px sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const t = cellAt(carKind, c, r);
      cx.fillStyle = FILL[t] || FILL['#']; cx.fillRect(c * 40, r * 40, 40, 40);
      if (t === 'D' || t === 'F') { cx.fillStyle = '#fff'; cx.fillText(t === 'D' ? '門' : '通', c * 40 + 20, r * 40 + 21); }
    }
    cx.strokeStyle = 'rgba(255,255,255,.18)'; cx.lineWidth = 1;
    for (let c = 0; c <= 26; c++) { cx.beginPath(); cx.moveTo(c * 40 + .5, 0); cx.lineTo(c * 40 + .5, 160); cx.stroke(); }
    for (let r = 0; r <= 4; r++) { cx.beginPath(); cx.moveTo(0, r * 40 + .5); cx.lineTo(1040, r * 40 + .5); cx.stroke(); }
    cx.strokeStyle = '#ffd34d'; cx.setLineDash([4, 3]);   // 門洞框
    for (const D of [data.outerDoor, data.farDoor]) for (const hx of D.x) cx.strokeRect(hx + .5, D.y + .5, D.w - 1, D.h - 1);
    cx.restore();
  }
  function show(on) {
    panel.hidden = !on;
    document.querySelector('main.layout > section.panel:not(#mrtPanel)').hidden = on;
    $('mrtOpenBtn').classList.toggle('sel', on);
    if (on) { document.querySelectorAll('#list button.sel').forEach(b => b.classList.remove('sel')); refresh(); }
  }
  function source() {
    const D = d => `{ "x": ${JSON.stringify(d.x).replace(/,/g, ', ')}, "y": ${d.y}, "w": ${d.w}, "h": ${d.h}, "art": ${JSON.stringify(d.art).replace(/,/g, ', ')} }`;
    const L = rows => '[\n' + rows.map(r => '      ' + JSON.stringify(r)).join(',\n') + '\n    ]';
    const cells = data.cells || {};
    const rest = Object.keys(data).filter(k => k !== 'outerDoor' && k !== 'farDoor').map(k => k === 'cells'
      ? '  "cells": {\n' + Object.keys(cells).map(kind => '    ' + JSON.stringify(kind) + ': ' + L(cells[kind])).join(',\n') + '\n  }'
      : `  ${JSON.stringify(k)}: ${JSON.stringify(data[k])}`);
    return `/* 捷運列車的設定：由物件編輯器「🚇 捷運列車」匯出（js/mrt-train.js 讀）。
   門洞位置是原圖像素（車廂圖 1040×160）：x＝三個門洞的左緣；y、w、h＝門洞的上緣、寬、高；art＝門的圖裡門板的範圍 [x, y, w, h]。
   cells＝車廂的格子圖（一列一串字，由上往下）：# 擋路、. 車內地板、D 外側門口、F 對面通道（兩側車門都開時才走得過）。
   秒數、速度的意思見 js/mrt-train.js 最上面的 MRT_TRAIN。 */
const MRT_TRAIN_SETTINGS = {
  "outerDoor": ${D(data.outerDoor)},
  "farDoor": ${D(data.farDoor)},
${rest.join(',\n')}
};
`;
  }
  build();
  // 點清單裡的其他物件：回到原本的畫面（object-editor.js 的 render 每次都會重畫清單）
  const baseRender = render;
  render = function () { if (panel && !panel.hidden) show(false); baseRender(); };
  return { source, show };
})();
