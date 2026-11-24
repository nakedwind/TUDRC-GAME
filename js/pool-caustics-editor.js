/* ===== 🌊 水波紋編輯器（水波紋編輯器.html）=====
   調整深水區水底網狀光紋的數值，存到 data/pool-caustics.js（遊戲 js/pool-caustics.js 讀同一份）。
   預覽直接呼叫遊戲的 paintPoolCaustics，所以預覽看到的＝遊戲裡看到的（只差遊戲裡會被黑暗壓暗、只鋪在深水格子上）。
   修改先存在這台瀏覽器（POOL_CAUSTICS_DRAFT_KEY），按「💾 存到專案」才寫進檔案。 */
const POOL_CAUSTICS_DRAFT_KEY = 'tudrc_pool_caustics_draft_v1';
const POOL_CAUSTICS_FILE_PATH = 'data/pool-caustics.js';

// ---- 欄位：key、名稱、說明、輸入方式；redo＝改了要重算扭曲的圖（比較花時間，拖拉時等放開才算）----
const PC_FIELDS = [
  { key: 'on', label: '要不要光紋', type: 'bool', desc: '要不要光紋（false＝不要）' },
  { key: 'image', label: '水紋圖', type: 'text', redo: true, desc: '水紋圖（要能無縫拼接：左邊接右邊、上面接下面看不出接縫）',
    help: '遊戲資料夾裡的路徑。圖裡比底色亮的線會變成光，底色不畫。' },
  { key: 'scale', label: '大小', type: 'num', min: .25, max: 3, step: .05, desc: '水紋圖放大幾倍（1＝原尺寸）', help: '1＝原尺寸；越小網眼越細密。' },
  { key: 'lineFrom', label: '只留多亮的線', type: 'num', min: 0, max: .9, step: .01, redo: true, desc: '比底色亮多少才算水紋線（0～1：0＝比底色亮的都算、越大只留最亮的線）',
    help: '0＝圖裡比底色亮的都算；越大只留最亮的線，線會變細、變少。' },
  { key: 'warp', label: '扭曲幅度', type: 'num', min: 0, max: 8, step: .1, redo: true, desc: '扭曲的幅度：每個點最多往旁邊挪幾點（0＝不扭曲；太大線會糊掉）',
    help: '每個點最多往旁邊挪幾點。0＝不扭曲；太大線會糊掉。' },
  { key: 'frames', label: '扭一輪幾張圖', type: 'num', min: 4, max: 120, step: 1, redo: true, desc: '扭完一輪要算幾張圖（越多越順，剛進地圖要多算一點、多佔一點記憶體）',
    help: '越多扭得越順；剛進地圖要在背景多算一點、多佔一點記憶體（每張約 56 KB）。' },
  { key: 'loopSecs', label: '扭一輪幾秒', type: 'num', min: 1, max: 120, step: 1, desc: '扭完一輪要幾秒（越大晃得越慢）', help: '越大晃得越慢。' },
  { key: 'drift', label: '飄移（左右, 上下）', type: 'pair', min: -20, max: 20, step: .5, desc: '整片光紋每秒往哪個方向飄幾點（左右, 上下；[0, 0]＝不飄）',
    help: '整片光紋每秒往哪個方向飄幾點；正數＝往右／往下，0＝不飄。' },
  { key: 'alpha', label: '亮度', type: 'num', min: 0, max: 1, step: .01, desc: '整片光紋多亮（0～1）', help: '0＝看不到、1＝最亮。' },
  { key: 'color', label: '顏色', type: 'color', redo: true, desc: '光紋的顏色（紅, 綠, 藍）' },
  { key: 'blend', label: '疊上去的方式', type: 'select', options: [['screen', '濾色（只變亮，最自然）'], ['lighter', '相加（更亮更刺眼）'], ['overlay', '疊加（亮的更亮、暗的更暗）'], ['soft-light', '柔光（很淡）']],
    desc: '疊上去的方式：screen＝濾色（只變亮）、lighter＝相加（更亮更刺眼）、overlay＝疊加、soft-light＝柔光' },
];

// ---- 資料 ----
const pcFromFile = () => JSON.parse(JSON.stringify(typeof POOL_CAUSTICS_TUNING !== 'undefined' ? POOL_CAUSTICS_TUNING : {}));
let pcFile = pcFromFile();
let pcData = (typeof DraftSync !== 'undefined' ? DraftSync.load(POOL_CAUSTICS_DRAFT_KEY, pcFile, { label: '水波紋數值' }) : null) || pcFromFile();
for (const f of PC_FIELDS) if (pcData[f.key] === undefined && pcFile[f.key] !== undefined) pcData[f.key] = JSON.parse(JSON.stringify(pcFile[f.key]));   // 暫存裡沒有的欄位（之後新增的）從檔案補

// 把目前的數值套到遊戲的光紋程式（預覽就是用它畫的）；redo＝要重算扭曲的圖
function pcApply(redo) {
  Object.assign(POOL_CAUSTICS, JSON.parse(JSON.stringify(pcData)));
  if (redo) { poolCausticReset(); pcMeasure(); }
}

// ---- 存檔文字（格式跟 data/pool-caustics.js 一樣，沒改的話存出來一模一樣）----
function pcExport() {
  const keys = [...PC_FIELDS.map(f => f.key), ...Object.keys(pcData).filter(k => !PC_FIELDS.some(f => f.key === k))];
  const val = v => Array.isArray(v) ? '[' + v.map(x => JSON.stringify(x)).join(', ') + ']' : JSON.stringify(v);
  const lines = keys.filter(k => pcData[k] !== undefined).map((k, i, all) => {
    const f = PC_FIELDS.find(x => x.key === k);
    return '  ' + JSON.stringify(k) + ': ' + val(pcData[k]) + (i < all.length - 1 ? ',' : '') + (f ? '   // ' + f.desc : '');
  });
  return '/* ===== 水底網狀光紋的數值（由「🌊 水波紋編輯器」存出來）=====\n' +
    '   遊戲（js/pool-caustics.js）和水波紋編輯器都讀這一份。\n' +
    '   整段貼回 data/pool-caustics.js 覆蓋即可。 */\n' +
    'const POOL_CAUSTICS_TUNING = {\n' + lines.join('\n') + '\n};\n';
}

// ---- 畫面 ----
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const hex = c => '#' + (c || [255, 255, 255]).map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const unhex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const show = v => Array.isArray(v) ? v.join(', ') : typeof v === 'boolean' ? (v ? '要' : '不要') : String(v);
function setStatus(msg, err) { const el = $('status'); el.textContent = msg; el.style.color = err ? '#ff9c8f' : '#8ce0be'; }
let pcDraftTimer = 0;
function pcSaveDraft() {
  clearTimeout(pcDraftTimer);
  pcDraftTimer = setTimeout(() => {
    try { localStorage.setItem(POOL_CAUSTICS_DRAFT_KEY, JSON.stringify(pcData)); setStatus('已自動儲存在這台瀏覽器。按「💾 存到專案」後，遊戲重新整理才會套用。'); }
    catch (e) { setStatus('瀏覽器暫存失敗：' + e.message, true); }
  }, 250);
}
const pcChanged = () => PC_FIELDS.filter(f => !same(pcData[f.key], pcFile[f.key])).length;
function pcUpdateDirty() {
  const n = pcChanged(), el = $('dirty');
  el.textContent = n ? '有 ' + n + ' 個數值跟專案檔不一樣（還沒存到專案）' : '跟專案檔一樣';
  el.className = n ? 'warn' : '';
  for (const f of PC_FIELDS) {
    const box = document.querySelector('.field[data-key="' + f.key + '"]'); if (!box) continue;
    const diff = !same(pcData[f.key], pcFile[f.key]);
    box.classList.toggle('changed', diff);
    box.querySelector('.was').textContent = diff ? '專案檔：' + show(pcFile[f.key]) : '';
    box.querySelector('.revert').hidden = !diff;
  }
  if (!$('exportOut').hidden) $('exportOut').value = pcExport();
}
// 改了一個欄位：commit＝放開滑桿／打完字（要重算的欄位這時才重算，拖拉時不卡）
function pcSet(f, v, commit) {
  pcData[f.key] = v;
  if (!f.redo || commit) pcApply(f.redo && commit);
  if (f.key === 'image') pcThumb();
  pcSaveDraft(); pcUpdateDirty();
}
function pcRenderFields() {
  const html = PC_FIELDS.map(f => {
    let row = '';
    if (f.type === 'num') row = '<input type="range" min="' + f.min + '" max="' + f.max + '" step="' + f.step + '" data-r><input type="number" step="' + f.step + '" data-n>';
    else if (f.type === 'pair') row = '左右 <input type="number" step="' + f.step + '" data-p="0"> 上下 <input type="number" step="' + f.step + '" data-p="1">';
    else if (f.type === 'bool') row = '<label><input type="checkbox" data-b> 開啟</label>';
    else if (f.type === 'text') row = '<input type="text" data-t spellcheck="false"><img class="thumb" id="pcThumb" alt="水紋圖">';
    else if (f.type === 'color') row = '<input type="color" data-c><code data-cv></code>';
    else if (f.type === 'select') row = '<select data-s>' + f.options.map(([v, l]) => '<option value="' + esc(v) + '">' + esc(l) + '</option>').join('') + '</select>';
    return '<div class="field" data-key="' + f.key + '"><div class="f-top"><span class="f-label">' + esc(f.label) + '<code>' + f.key + '</code></span><span class="was"></span>' +
      '<button class="small revert" hidden>改回專案檔</button></div><div class="f-row">' + row + '</div>' + (f.help ? '<small>' + esc(f.help) + '</small>' : '') + '</div>';
  }).join('');
  $('fields').innerHTML = html;
  for (const f of PC_FIELDS) {
    const box = document.querySelector('.field[data-key="' + f.key + '"]'), q = s => box.querySelector(s);
    const fill = () => {
      const v = pcData[f.key];
      if (f.type === 'num') { q('[data-r]').value = v; q('[data-n]').value = v; }
      else if (f.type === 'pair') { q('[data-p="0"]').value = (v || [0, 0])[0]; q('[data-p="1"]').value = (v || [0, 0])[1]; }
      else if (f.type === 'bool') q('[data-b]').checked = !!v;
      else if (f.type === 'text') q('[data-t]').value = v || '';
      else if (f.type === 'color') { q('[data-c]').value = hex(v); q('[data-cv]').textContent = (v || []).join(', '); }
      else if (f.type === 'select') q('[data-s]').value = v;
    };
    box.fill = fill; fill();
    const num = (el, commit) => { const n = parseFloat(el.value); if (!Number.isFinite(n)) return; pcSet(f, n, commit); fill(); };
    if (f.type === 'num') {
      q('[data-r]').addEventListener('input', e => { num(e.target, false); });
      q('[data-r]').addEventListener('change', e => { num(e.target, true); });
      q('[data-n]').addEventListener('change', e => { num(e.target, true); });
    } else if (f.type === 'pair') {
      for (const el of box.querySelectorAll('[data-p]')) el.addEventListener('input', () => {
        const a = parseFloat(q('[data-p="0"]').value), b = parseFloat(q('[data-p="1"]').value);
        if (Number.isFinite(a) && Number.isFinite(b)) pcSet(f, [a, b], true);
      });
    } else if (f.type === 'bool') q('[data-b]').addEventListener('change', e => pcSet(f, e.target.checked, true));
    else if (f.type === 'text') q('[data-t]').addEventListener('change', e => pcSet(f, e.target.value.trim(), true));
    else if (f.type === 'color') {
      q('[data-c]').addEventListener('input', e => { pcSet(f, unhex(e.target.value), false); q('[data-cv]').textContent = pcData[f.key].join(', '); });
      q('[data-c]').addEventListener('change', e => { pcSet(f, unhex(e.target.value), true); fill(); });
    } else if (f.type === 'select') q('[data-s]').addEventListener('change', e => pcSet(f, e.target.value, true));
    q('.revert').addEventListener('click', () => { pcSet(f, JSON.parse(JSON.stringify(pcFile[f.key])), true); fill(); });
  }
  pcThumb();
}
function pcThumb() {
  const img = $('pcThumb'); if (!img) return;
  img.onerror = () => { img.style.opacity = .25; setStatus('找不到水紋圖：' + pcData.image + '（路徑要從遊戲資料夾算起，例如 images/Poolcore/Poolcore_caustics.png）', true); };
  img.onload = () => { img.style.opacity = 1; if (POOL_CAUSTICS.image === pcData.image) { poolCausticReset(); pcMeasure(); } };
  img.src = pcData.image;
}

// ---- 預覽：底圖鋪滿，上面用遊戲的 paintPoolCaustics 鋪光紋 ----
const PC_BGS = [
  ['images/Poolcore/Poolcore_water_dark.png', 'W118 深水（Poolcore_water_dark）'],
  ['images/Poolcore/Poolcore_water.png', '淺色水（Poolcore_water）'],
  ['images/Poolcore/Poolcore_water_deep.png', '深水（Poolcore_water_deep）'],
  ['images/Poolcore/Poolcore_water_deep_dark.png', '深水・暗（Poolcore_water_deep_dark）'],
  ['images/Poolcore/poolcore-deep-water.png', '池核深水（poolcore-deep-water）'],
  ['', '純色（深藍）'],
];
$('pvBg').innerHTML = PC_BGS.map(([v, l]) => '<option value="' + esc(v) + '">' + esc(l) + '</option>').join('');
const pvBgImgs = {};
function pvBg() { const v = $('pvBg').value; if (!v) return null; if (!pvBgImgs[v]) { pvBgImgs[v] = new Image(); pvBgImgs[v].src = v; } return pvBgImgs[v]; }
function pvFrame() {
  const cv = $('cv'), stage = cv.parentElement, zoom = parseFloat($('pvZoom').value) || 1.5;
  const w = Math.max(40, Math.round(stage.clientWidth / zoom)), h = Math.max(30, Math.round(stage.clientHeight / zoom));
  if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
  const ctx = cv.getContext('2d'); ctx.imageSmoothingEnabled = false;
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  const bg = pvBg();
  if (bg && bg.complete && bg.naturalWidth) { ctx.fillStyle = ctx.createPattern(bg, 'repeat'); ctx.fillRect(0, 0, w, h); }
  else { ctx.fillStyle = '#16364c'; ctx.fillRect(0, 0, w, h); }
  const rect = { x0: 0, y0: 0, x1: w, y1: h };
  paintPoolCaustics(ctx, [{ sh: rect, a: 1 }], rect, 0, 0, performance.now() / 1000);
  const dark = parseFloat($('pvDark').value) || 0;
  if (dark > 0) { ctx.globalAlpha = dark; ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h); ctx.globalAlpha = 1; }
  pvPerf();
  requestAnimationFrame(pvFrame);
}
// 效能資訊：一張扭曲圖要算多久、算好幾張、佔多少記憶體
let pcGenMs = null;
function pcMeasure() {
  pcGenMs = null;
  setTimeout(() => {
    const src = poolCausticSource(); if (!src) { setTimeout(pcMeasure, 200); return; }
    const t0 = performance.now(); poolCausticFrame(0); pcGenMs = performance.now() - t0;
  }, 0);
}
function pvPerf() {
  const n = poolCausticCount(), ready = poolCausticFrames.filter(Boolean).length, src = poolCausticSource();
  const kb = src ? src.w * src.h * 4 / 1024 : 0;
  $('perf').innerHTML = !src ? '水紋圖讀取中……（一直停在這裡的話，檢查「水紋圖」的路徑）'
    : '水紋圖 ' + src.w + '×' + src.h + '・扭曲圖已算好 ' + ready + ' / ' + n + ' 張' +
      (pcGenMs != null ? '・一張約 ' + pcGenMs.toFixed(1) + ' 毫秒（全部約 ' + Math.round(pcGenMs * n) + ' 毫秒，剛進地圖時在背景算，不會卡）' : '') +
      '<br>記憶體約 ' + (kb * n / 1024).toFixed(1) + ' MB。遊戲裡每一幀鋪光紋的時間跟這些數值幾乎無關（約 0.5 毫秒）。';
}

// ---- 按鈕 ----
$('download').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([pcExport()], { type: 'text/javascript' }));
  a.download = 'pool-caustics.js'; a.click(); URL.revokeObjectURL(a.href);
  setStatus('已下載 pool-caustics.js：放進遊戲資料夾的 data/（取代原本的檔案），再重新整理遊戲。');
});
$('showExport').addEventListener('click', () => { const o = $('exportOut'); o.hidden = !o.hidden; if (!o.hidden) o.value = pcExport(); });
$('reset').addEventListener('click', () => {
  if (pcChanged() && !confirm('丟掉這台瀏覽器裡還沒存到專案的修改，改回專案檔的數值？')) return;
  pcData = pcFromFile();
  try { localStorage.removeItem(POOL_CAUSTICS_DRAFT_KEY); } catch (_) {}
  if (typeof DraftSync !== 'undefined') DraftSync.forget(POOL_CAUSTICS_DRAFT_KEY);
  pcApply(true); pcRenderFields(); pcUpdateDirty(); setStatus('已改回專案檔的數值');
});

pcApply(true);
pcRenderFields();
pcUpdateDirty();
requestAnimationFrame(pvFrame);
if (typeof ProjectSave !== 'undefined')
  ProjectSave.attach({ after: ['download'], files: [{ path: POOL_CAUSTICS_FILE_PATH, label: '水波紋數值', text: () => pcExport() }],
    status: (m, e) => { setStatus(m, e); if (!e && /^已存到專案/.test(m)) { pcFile = JSON.parse(JSON.stringify(pcData)); pcUpdateDirty(); } } });   // 存好了：專案檔＝目前的數值，「不一樣」的標示歸零
