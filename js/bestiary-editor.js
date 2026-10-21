/* ===== 📕 怪物圖鑑編輯器 =====
   左邊：選一隻怪物，改名稱、星級、能力（最多 4 條，1 在最下面）、背景介紹、圖片、縮圖（大小／位移）、換色、要不要放進圖鑑、排序。
   右邊：預覽＝遊戲裡的怪物圖鑑（同一份 css/style.css、js/bestiary-config.js，長得一模一樣）。
         拖曳＝移動那一塊、按住 Shift 拖曳＝以中心等比例縮放、拖右下角的小方塊＝自由改寬高、點縮圖＝選那隻怪物；方向鍵＝移動選到的那一塊（Shift＝10px）。
         怪物圖片框是每隻怪物分開的（imageBox）：調的永遠是目前選的那隻；還沒單獨調過的怪物用預設的框（layout.image）。
         下面：選到的那一塊的位置、大小、文字大小；所有的文字；怪物圖素（點一下＝換圖）。
   存檔：「💾 存到專案」寫進 data/bestiary.js。還沒存的修改先放在瀏覽器暫存（重新整理不會不見）；按「從檔案重設」才會丟掉。
   預覽的「消滅狀態」只是預覽畫面怎麼畫，不會動到玩家的紀錄。
*/
const BST_DRAFT_KEY = 'tudrc_bestiary_editor_draft_v1';
const clone = v => JSON.parse(JSON.stringify(v));
const esc = bestiaryEsc;
const statusEl = document.getElementById('status');
function setStatus(msg, err = false) { statusEl.textContent = msg; statusEl.classList.toggle('err', !!err); }

// ---- 目前編輯中的設定：{ layout, texts, style, monsters, order }（只記改過的；沒寫＝預設）----
const fromFile = () => { const c = typeof BESTIARY_CONFIG !== 'undefined' ? BESTIARY_CONFIG : {};
  return { layout: clone(c.layout || {}), texts: clone(c.texts || {}), style: clone(c.style || {}), monsters: clone(c.monsters || {}), order: clone(c.order || []) }; };
let cfg = (() => {
  try {
    const d = typeof DraftSync !== 'undefined' ? DraftSync.load(BST_DRAFT_KEY, fromFile(), { label: '怪物圖鑑' }) : JSON.parse(localStorage.getItem(BST_DRAFT_KEY) || 'null');   // 暫存和專案檔三方合併（js/draft-sync.js）
    if (d && d.layout && d.monsters) return { layout: d.layout, texts: d.texts || {}, style: d.style || {}, monsters: d.monsters, order: d.order || [] };
  } catch (_) {}
  return fromFile();
})();
function saveDraft() { try { localStorage.setItem(BST_DRAFT_KEY, JSON.stringify(cfg)); } catch (_) {} }
// 10/22：圖片大小／位移（imgScale、imgX、imgY）改成每隻自己的圖片框（imageBox）：換算成一樣大、一樣位置的框（看起來不變）
function migrateImgScale(c) {
  const D = bestiaryLayout(c).image;
  for (const [k, o] of Object.entries(c.monsters)) {
    if (!o || !['imgScale', 'imgX', 'imgY'].some(f => f in o)) continue;
    const sc = (Number(o.imgScale) || 100) / 100, x = Number(o.imgX) || 0, y = Number(o.imgY) || 0;
    if (!o.imageBox && (sc !== 1 || x || y)) { const w = Math.round(D.w * sc), h = Math.round(D.h * sc); o.imageBox = { x: Math.round(D.x + D.w / 2 + x - w / 2), y: Math.round(D.y + D.h / 2 + y - h / 2), w, h }; }
    delete o.imgScale; delete o.imgX; delete o.imgY;
    if (!Object.keys(o).length) delete c.monsters[k];
  }
}
migrateImgScale(cfg);

const allEntries = () => bestiaryEntries(cfg, true);   // 連「不放進圖鑑」的也列
const entryOf = key => allEntries().find(e => e.key === key);
let selKey = (allEntries()[0] || {}).key || null;   // 選到的怪物
let selBlock = 'image';                              // 選到的那一塊（版面）
let pvMode = 'all';                                  // 預覽的消滅狀態
let pvPage = 0;

// ---- 怪物：改一個欄位（跟預設一樣就不記）----
function monDefault(e, f) {
  if (f === 'name') return e.baseName; if (f === 'image') return e.baseImage; if (f === 'hue') return e.baseHue;
  if (f === 'about') return ''; if (f === 'hidden') return false;
  return BESTIARY_MONSTER_DEFAULT[f];
}
function setMon(key, f, v) {
  const e = entryOf(key); if (!e) return;
  const o = cfg.monsters[key] || (cfg.monsters[key] = {});
  if (f === 'abilities') {   // 4 條：後面空白的不記；全部空白＝不記
    const list = v.map(t => String(t || '')); while (list.length && !list[list.length - 1].trim()) list.pop();
    if (list.length) o.abilities = list; else delete o.abilities;
  } else if (v === monDefault(e, f) || (f === 'name' && v === '') || (f === 'image' && v === '') || (f === 'hue' && v === 0 && e.baseHue == null)) delete o[f];   // 原本不換色的拉回 0＝不換色
  else o[f] = v;
  if (!Object.keys(o).length) delete cfg.monsters[key];
}
const monChanged = key => !!cfg.monsters[key] && Object.keys(cfg.monsters[key]).some(k => k !== 'hidden');

// ---- 版面、文字、設定：改一個值（跟預設一樣就不記）----
function setLayout(id, vals) {
  const d = BESTIARY_LAYOUT_DEFAULT[id], o = cfg.layout[id] || (cfg.layout[id] = {});
  for (const [k, v] of Object.entries(vals)) { if (!(k in d)) continue; if (v === d[k]) delete o[k]; else o[k] = v; }
  if (!Object.keys(o).length) delete cfg.layout[id];
}
// 每一塊的位置、大小：怪物圖片框是每隻怪物自己的（imageBox；跟預設一樣就不記），其他塊大家共用（layout）
function rectOf(blk) {
  const L = bestiaryLayout(cfg)[blk], e = blk === 'image' && entryOf(selKey);
  return e && e.imageBox ? { ...L, ...e.imageBox } : L;
}
function setRect(blk, vals) {
  if (blk !== 'image' || !entryOf(selKey)) return setLayout(blk, vals);
  const cur = rectOf('image'), D = bestiaryLayout(cfg).image, box = {};
  for (const k of ['x', 'y', 'w', 'h']) box[k] = k in vals ? vals[k] : cur[k];
  const o = cfg.monsters[selKey] || (cfg.monsters[selKey] = {});
  if (['x', 'y', 'w', 'h'].every(k => box[k] === D[k])) delete o.imageBox; else o.imageBox = box;
  if (!Object.keys(o).length) delete cfg.monsters[selKey];
}
const rectChanged = blk => blk === 'image' ? !!(entryOf(selKey) || {}).imageBox : !!cfg.layout[blk];
function setText(k, v) { if (v === BESTIARY_TEXT_DEFAULT[k]) delete cfg.texts[k]; else cfg.texts[k] = v; }
function setStyle(k, v) { if (v === BESTIARY_STYLE_DEFAULT[k]) delete cfg.style[k]; else cfg.style[k] = v; }

// ---- 預覽的消滅狀態（假的消滅次數，只是預覽用）----
const PV_MODES = [['all', '全部已消滅'], ['half', '消滅一半'], ['none', '全部未發現'], ['mine', '我的遊戲紀錄']];
function pvKills(entries) {
  if (pvMode === 'none') return {};
  if (pvMode === 'mine') { try { return (JSON.parse(localStorage.getItem('tudrc_bestiary_v1') || 'null') || {}).kills || {}; } catch (_) { return {}; } }
  const out = {}, n = pvMode === 'half' ? Math.ceil(entries.length / 2) : entries.length;
  entries.slice(0, n).forEach((e, i) => { out[e.key] = 3 + (i * 17) % 40; });
  return out;
}
function renderPvModes() {
  document.getElementById('pvModes').innerHTML = PV_MODES.map(([id, label]) => '<button type="button" class="pv-mode' + (pvMode === id ? ' sel' : '') + '" data-pv="' + id + '">' + label + '</button>').join('');
}
document.getElementById('pvModes').addEventListener('click', e => {
  const b = e.target.closest('[data-pv]'); if (!b) return;
  pvMode = b.dataset.pv; renderPvModes(); renderPreview();
});

// ---- 預覽 ----
const stage = document.getElementById('previewStage');
let pvScale = 1;
function pageOf(key) { const per = Math.max(1, bestiaryLayout(cfg).grid.cols * bestiaryLayout(cfg).grid.rows), i = bestiaryEntries(cfg).findIndex(e => e.key === key); return i < 0 ? null : Math.floor(i / per); }
function renderPreview() {
  const entries = bestiaryEntries(cfg), kills = pvKills(entries);
  const avail = Math.max(300, stage.parentElement.clientWidth - 24);
  pvScale = Math.min(1, avail / BESTIARY_W);
  pvPage = Math.max(0, Math.min(bestiaryPageCount(cfg, entries.length) - 1, pvPage));
  stage.style.width = BESTIARY_W * pvScale + 'px'; stage.style.height = BESTIARY_H * pvScale + 'px';
  stage.innerHTML = '<div id="bestiary"><div class="bst-scale" style="width:' + BESTIARY_W * pvScale + 'px;height:' + BESTIARY_H * pvScale + 'px">' + bestiaryHtml(cfg, { entries, kills, sel: selKey, page: pvPage }) + '</div></div>';
  const card = stage.querySelector('.bst-card'); card.style.transform = 'scale(' + pvScale + ')';
  stage.classList.toggle('show-blocks', document.getElementById('showBlocks').checked);
  const L = rectOf(selBlock), A = centerArea(selBlock), name = selBlock === 'image' && entryOf(selKey) ? '怪物圖片框（' + entryOf(selKey).name + '）' : blockName(selBlock);
  if (A) card.insertAdjacentHTML('beforeend', '<div class="ed-area" style="' + bestiaryPos(A) + '"><b>置中範圍</b></div>');   // 置中按鈕用的區域
  if (L) card.insertAdjacentHTML('beforeend', '<div class="ed-box" style="' + bestiaryPos({ x: L.x, y: L.y, w: L.w, h: L.h }) + '"><b>' + esc(name) + '</b><i class="ed-handle" title="拖曳改大小"></i></div>');
}
document.getElementById('showBlocks').addEventListener('change', renderPreview);
window.addEventListener('resize', renderPreview);
// 等比例縮放（以這一塊的中心為準，不變形）：寬、高、文字大小、能力條高度、間距一起乘 k
const SCALE_KEYS = ['w', 'h', 'font', 'rowH', 'gap'];
function scaledLayout(s, k) {
  const out = {};
  for (const key of SCALE_KEYS) if (key in s) out[key] = Math.max(key === 'gap' ? 0 : key === 'font' ? 6 : 8, Math.round(s[key] * k));
  out.x = Math.round(s.x + s.w / 2 - out.w / 2); out.y = Math.round(s.y + s.h / 2 - out.h / 2);   // 中心不動
  return out;
}
// 預覽裡的位置（以 1060×620 的視窗為準）
const cardPoint = e => { const r = stage.querySelector('.bst-card').getBoundingClientRect(); return [(e.clientX - r.left) / pvScale, (e.clientY - r.top) / pvScale]; };
// 拖曳：移動那一塊；按住 Shift 拖曳＝以中心等比例縮放（往外＝放大、往中心＝縮小）；拖右下角的小方塊＝自由改寬高
// 怪物圖片框：改的是目前選的那隻自己的框（rectOf／setRect）
// 沒拖動＝點一下（選縮圖、翻頁、選那一塊）
let drag = null;
stage.addEventListener('pointerdown', e => {
  if (e.button !== 0) return;
  const handle = e.target.closest('.ed-handle'), blockEl = e.target.closest('[data-block]');
  const blk = handle ? selBlock : blockEl && blockEl.dataset.block; if (!blk) return;
  e.preventDefault();
  const start = { ...rectOf(blk) }, [px, py] = cardPoint(e);
  drag = { blk, mode: e.shiftKey ? 'scale' : handle ? 'size' : 'move', sx: e.clientX, sy: e.clientY, start, moved: false, target: e.target,
    d0: Math.max(20, Math.hypot(px - (start.x + start.w / 2), py - (start.y + start.h / 2))) };   // 縮放：按下時離中心多遠（太靠近中心時當 20px，才不會一動就變很大）
  stage.setPointerCapture(e.pointerId);
});
stage.addEventListener('pointermove', e => {
  if (!drag) return;
  if (!drag.moved && Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) < 4) return;
  drag.moved = true;
  const dx = Math.round((e.clientX - drag.sx) / pvScale), dy = Math.round((e.clientY - drag.sy) / pvScale), s = drag.start;
  if (selBlock !== drag.blk) { selBlock = drag.blk; renderBlockForm(); }
  if (drag.mode === 'scale') {
    const [px, py] = cardPoint(e), k = Math.max(.05, Math.hypot(px - (s.x + s.w / 2), py - (s.y + s.h / 2)) / drag.d0);
    setRect(drag.blk, scaledLayout(s, k));
    rectStatus(drag.blk, '等比例縮放中 ' + Math.round(k * 100) + '%');
  } else setRect(drag.blk, drag.mode === 'move' ? { x: s.x + dx, y: s.y + dy } : { w: Math.max(8, s.w + dx), h: Math.max(8, s.h + dy) });
  renderPreview(); syncBlockNumbers();
});
stage.addEventListener('pointerup', e => {
  if (!drag) return;
  const d = drag; drag = null;
  if (d.moved) { saveDraft(); if (d.blk === 'image') afterBox(); rectStatus(d.blk, d.mode === 'move' ? '移動' : d.mode === 'scale' ? '等比例縮放' : '改大小', true); return; }
  const cell = d.target.closest('.bst-cell[data-key]');
  if (cell) { selectMonster(cell.dataset.key, false); return; }   // 點縮圖＝選那隻怪物
  const nav = d.target.closest('.bst-prev, .bst-next');
  if (nav && !nav.disabled) pvPage += nav.classList.contains('bst-next') ? 1 : -1;
  selBlock = d.blk; renderBlockForm(); renderPreview(); showSelInfo();
});
stage.addEventListener('pointercancel', () => { drag = null; });
// 方向鍵：移動選到的那一塊（打字的時候不算）
document.addEventListener('keydown', e => {
  if (!e.key.startsWith('Arrow') || e.target.closest('input, textarea, select')) return;
  e.preventDefault();
  const n = e.shiftKey ? 10 : 1, L = rectOf(selBlock);
  setRect(selBlock, { x: L.x + (e.key === 'ArrowLeft' ? -n : e.key === 'ArrowRight' ? n : 0), y: L.y + (e.key === 'ArrowUp' ? -n : e.key === 'ArrowDown' ? n : 0) });
  saveDraft(); renderPreview(); syncBlockNumbers(); if (selBlock === 'image') afterBox(); rectStatus(selBlock, '移動', true);
});

// ---- 版面：選到的那一塊 ----
const blockName = id => (BESTIARY_BLOCKS.find(b => b[0] === id) || [])[1] || id;
const rectLabel = id => id === 'image' && entryOf(selKey) ? entryOf(selKey).name + '的怪物圖片框（只有這隻）' : blockName(id);
// 跟預設比放大／縮小幾 %：怪物圖片框跟「預設的框」比，其他塊跟原本的大小比（寬、高比例不一樣時分開說）
function scaleNote(blk) {
  const L = rectOf(blk), D = blk === 'image' ? bestiaryLayout(cfg).image : BESTIARY_LAYOUT_DEFAULT[blk];
  const pw = Math.round(L.w / D.w * 100), ph = Math.round(L.h / D.h * 100);
  const say = p => p === 100 ? '一樣' : p < 100 ? '縮小 ' + (100 - p) + '%' : '放大 ' + (p - 100) + '%';
  return pw === ph ? (pw === 100 ? '跟預設一樣大' : '比預設' + say(pw)) : '比預設：寬' + say(pw) + '、高' + say(ph);
}
// 上面那排：選到的那一塊現在的位置、大小、比預設大或小幾 %（what＝剛剛做了什麼；edited＝改過還沒存）
function rectStatus(blk, what = '', edited = false) {
  const L = rectOf(blk), useDefault = blk === 'image' && entryOf(selKey) && !entryOf(selKey).imageBox;
  setStatus(rectLabel(blk) + '：' + (what ? what + '，' : '') + '位置 ' + L.x + ', ' + L.y + '，大小 ' + L.w + '×' + L.h + '（' + scaleNote(blk) + '）' +
    (useDefault ? '，目前用預設的框' : '') + (edited ? '（還沒存到專案）' : ''));
}
const showSelInfo = () => rectStatus(selBlock);   // 一選到（怪物、那一塊）就顯示，不用等改了才更新
function afterBox() {   // 怪物圖片框改了：左邊清單的「已修改」、這隻的框的說明跟著更新
  renderList(); const t = document.getElementById('monBoxText'); if (t) t.textContent = monBoxText(entryOf(selKey));
  const r = document.getElementById('monReset'); if (r) r.disabled = !cfg.monsters[selKey];
}
// 置中的範圍：怪物圖片框＝左側大框裡、怪物能力（整塊）上面的區域；其他塊沒有
function centerArea(id) {
  if (id !== 'image') return null;
  const L = bestiaryLayout(cfg), p = L.leftPanel, a = L.abilities;
  const bottom = a.y > p.y && a.y < p.y + p.h ? a.y : p.y + p.h;   // 能力不在大框裡：用大框的底
  return { x: p.x, y: p.y, w: p.w, h: bottom - p.y };
}
// 每一塊裡面的文字（在版面這邊也能改；跟「文字與設定」是同一份）
const BLOCK_TEXT = { title: [['title', '文字']], name: [['noName', '還沒選怪物時顯示']], infoTitle: [['infoTitle', '文字']], kills: [['kills', '文字（{n}＝消滅次數）']],
  prev: [['prev', '按鈕上的字']], next: [['next', '按鈕上的字']], close: [['close', '按鈕上的字']], stars: [['star', '星星的字']], grid: [['unknown', '還沒消滅過的怪物：黑底上的字']], image: [['empty', '一隻都還沒消滅時，圖片框裡的字']] };
const BLOCK_EXTRA = { grid: [['cols', '一排幾格', 1, 12], ['rows', '幾排', 1, 8], ['gap', '格子間距', 0, 40]], abilities: [['rowH', '每一條的高度', 14, 80], ['gap', '條和條的間距', 0, 30]] };
function numField(attr, label, v, min, max, step = 1) {
  return '<div class="field">' + label + '<div class="num"><input type="range" ' + attr + ' min="' + min + '" max="' + max + '" step="' + step + '" value="' + v + '"><input type="number" ' + attr + ' step="' + step + '" value="' + v + '"></div></div>';
}
function renderBlockForm() {
  const L = rectOf(selBlock), def = BESTIARY_LAYOUT_DEFAULT[selBlock], T = bestiaryTexts(cfg), isImg = selBlock === 'image' && entryOf(selKey);
  const changed = rectChanged(selBlock);
  document.getElementById('blockForm').innerHTML =
    '<div class="field">哪一塊<select id="blockPick">' + BESTIARY_BLOCKS.map(([id, n]) => '<option value="' + id + '"' + (id === selBlock ? ' selected' : '') + '>' + esc(n) + (rectChanged(id) ? '（改過）' : '') + '</option>').join('') + '</select>' +
      '<span class="hint">也可以直接在預覽裡點那一塊。</span></div>' +
    (isImg ? '<p class="hint" style="margin:0 0 10px;color:#ffe3a1">現在調的是「' + esc(isImg.name) + '」自己的怪物圖片框（其他怪物不受影響）' + (isImg.imageBox ? '。' : '；目前用的是預設的框，一調就變成這隻自己的。') + '</p>' : '') +
    '<div class="field">位置、大小（px，以 ' + BESTIARY_W + '×' + BESTIARY_H + ' 的視窗為準）<div class="xywh">' +
      [['x', '左右（X）'], ['y', '上下（Y）'], ['w', '寬'], ['h', '高']].map(([k, n]) => '<label>' + n + '<input type="number" data-l="' + k + '" step="1" value="' + L[k] + '"></label>').join('') + '</div></div>' +
    '<div class="field">微調<div class="nudge">' +
      '<button type="button" class="ed-btn" data-bn="x:-1" title="往左 1px（Shift＝10px）">←</button><button type="button" class="ed-btn" data-bn="y:-1" title="往上">↑</button>' +
      '<button type="button" class="ed-btn" data-bn="y:1" title="往下">↓</button><button type="button" class="ed-btn" data-bn="x:1" title="往右">→</button>' +
      '<button type="button" class="ed-btn" data-bn="w:-1" title="窄一點">寬－</button><button type="button" class="ed-btn" data-bn="w:1" title="寬一點">寬＋</button>' +
      '<button type="button" class="ed-btn" data-bn="h:-1" title="矮一點">高－</button><button type="button" class="ed-btn" data-bn="h:1" title="高一點">高＋</button></div>' +
      '<span class="hint">按住 Shift 點＝一次 10px。</span></div>' +
    '<div class="field">等比例縮放（以這一塊的中心為準，不變形）<div class="nudge">' +
      '<button type="button" class="ed-btn" data-bs="-1" title="縮小 1%（Shift＝10%）">縮小 1%</button><button type="button" class="ed-btn" data-bs="1" title="放大 1%（Shift＝10%）">放大 1%</button></div>' +
      '<span class="hint">寬、高' + ('font' in def ? '、文字大小' : '') + ('rowH' in def ? '、每一條的高度、間距' : 'gap' in def ? '、格子間距' : '') + '一起放大縮小。按住 Shift 點＝一次 10%；在預覽裡按住 Shift 拖曳也可以（往外拉＝放大、往中心＝縮小）。</span></div>' +
    (centerArea(selBlock) ? '<div class="field">置中（以左側大框裡、怪物能力上面的區域為準）<div class="nudge">' +
      '<button type="button" class="ed-btn" data-center="x">左右置中</button><button type="button" class="ed-btn" data-center="y">上下置中</button><button type="button" class="ed-btn" data-center="xy">兩個都置中</button></div>' +
      '<span class="hint">預覽裡橘色虛線框起來的就是這個區域；調整左側大框、怪物能力的位置，區域也會跟著變。</span></div>' : '') +
    ('font' in def ? numField('data-l="font"', '文字大小（px）', L.font, 8, 60) : '') +
    (BLOCK_EXTRA[selBlock] || []).map(([k, n, mn, mx]) => numField('data-l="' + k + '"', n, L[k], mn, mx)).join('') +
    (BLOCK_TEXT[selBlock] || []).map(([k, n]) => textField(k, n, T[k])).join('') +
    (isImg ? '<div class="field">預設的框（還沒單獨調過的怪物用這個）<div class="img-btns" style="margin:0">' +
      '<button type="button" class="ed-btn" id="boxAsDefault" title="把這隻的框設成預設；還沒單獨調過的怪物都會用這個">把這個框設成預設</button></div>' +
      '<span class="hint">怪物圖片會整張放進框裡（等比例），以框的中心為準：框拉小＝這隻的圖變小。</span></div>' : '') +
    (selBlock === 'abilities' ? '<p class="hint" style="margin:0 0 10px">能力的內容是每隻怪物自己的：在左邊選怪物後寫（1 在最下面，往上排）。</p>' : '') +
    (selBlock === 'about' ? '<p class="hint" style="margin:0 0 10px">背景介紹是每隻怪物自己的：在左邊選怪物後寫。</p>' : '') +
    '<button type="button" class="ed-btn" id="blockReset"' + (changed ? '' : ' disabled') + '>' + (isImg ? '這隻用回預設的框' : '這一塊恢復預設') + '</button>';
}
function syncBlockNumbers() {   // 拖曳、方向鍵：只更新數字（不重畫整個表單）
  const L = rectOf(selBlock);
  document.querySelectorAll('#blockForm [data-l]').forEach(el => { if (document.activeElement !== el) el.value = L[el.dataset.l]; });
  const r = document.getElementById('blockReset'); if (r) r.disabled = !rectChanged(selBlock);
}
const blockFormEl = document.getElementById('blockForm');
blockFormEl.addEventListener('change', e => { if (e.target.id === 'blockPick') { selBlock = e.target.value; renderBlockForm(); renderPreview(); showSelInfo(); } });
blockFormEl.addEventListener('input', e => {
  const k = e.target.dataset.l; if (!k) return;
  const n = Math.round(Number(e.target.value)); if (e.target.value === '' || !Number.isFinite(n)) return;
  setRect(selBlock, { [k]: n }); saveDraft(); renderPreview(); syncBlockNumbers(); if (selBlock === 'image') afterBox(); rectStatus(selBlock, '', true);
});
blockFormEl.addEventListener('click', e => {
  const b = e.target.closest('[data-bn]');
  if (b) { const [k, d] = b.dataset.bn.split(':'), L = rectOf(selBlock), n = Number(d) * (e.shiftKey ? 10 : 1);
    setRect(selBlock, { [k]: k === 'w' || k === 'h' ? Math.max(8, L[k] + n) : L[k] + n }); saveDraft(); renderPreview(); syncBlockNumbers(); if (selBlock === 'image') afterBox(); rectStatus(selBlock, '', true); return; }
  const cb = e.target.closest('[data-center]');
  if (cb) {   // 置中：照上面的區域算
    const A = centerArea(selBlock), L = rectOf(selBlock), v = {};
    if (cb.dataset.center.includes('x')) v.x = Math.round(A.x + (A.w - L.w) / 2);
    if (cb.dataset.center.includes('y')) v.y = Math.round(A.y + (A.h - L.h) / 2);
    setRect(selBlock, v); saveDraft(); renderPreview(); syncBlockNumbers(); if (selBlock === 'image') afterBox();
    rectStatus(selBlock, cb.textContent, true); return;
  }
  const sb = e.target.closest('[data-bs]');
  if (sb) {   // 等比例縮放 1%（Shift＝10%）：至少變 1px，小的那幾塊也動得了
    const L = rectOf(selBlock), dir = Number(sb.dataset.bs), w = Math.max(8, L.w + dir * Math.max(1, Math.round(L.w * (e.shiftKey ? .1 : .01))));
    setRect(selBlock, scaledLayout(L, w / L.w)); saveDraft(); renderPreview(); syncBlockNumbers(); if (selBlock === 'image') afterBox();
    rectStatus(selBlock, '等比例縮放', true); return;
  }
  if (e.target.id === 'boxAsDefault') {   // 這隻的框設成預設：這隻改用預設（看起來一樣），還沒單獨調過的怪物也都用這個
    const L = rectOf('image'); setLayout('image', { x: L.x, y: L.y, w: L.w, h: L.h });
    const o = cfg.monsters[selKey]; if (o) { delete o.imageBox; if (!Object.keys(o).length) delete cfg.monsters[selKey]; }
    saveDraft(); renderBlockForm(); renderPreview(); afterBox(); setStatus('預設的怪物圖片框改成 ' + L.w + '×' + L.h + '（還沒單獨調過的怪物都用這個；還沒存到專案）'); return;
  }
  if (e.target.id === 'blockReset') {
    if (selBlock === 'image' && entryOf(selKey)) { const o = cfg.monsters[selKey]; if (o) { delete o.imageBox; if (!Object.keys(o).length) delete cfg.monsters[selKey]; } afterBox(); }
    else delete cfg.layout[selBlock];
    saveDraft(); renderBlockForm(); renderPreview(); rectStatus(selBlock, '恢復預設', true);
  }
});

// ---- 文字與設定 ----
const TEXT_FIELDS = [['title', '「怪物圖鑑」標題'], ['infoTitle', '「基礎訊息」標題'], ['kills', '消滅次數（{n}＝次數）'], ['noName', '還沒選怪物時，名稱欄的字'],
  ['empty', '一隻都還沒消滅時，圖片框裡的字'], ['unknown', '還沒消滅過的怪物：黑底上的字'], ['star', '星星的字'], ['prev', '上一頁按鈕'], ['next', '下一頁按鈕'], ['close', '關閉按鈕']];
const textField = (k, label, v) => '<div class="field">' + label + (k === 'empty'
  ? '<textarea data-t="' + k + '" rows="2">' + esc(v) + '</textarea>' : '<input type="text" data-t="' + k + '" value="' + esc(v) + '">') + '</div>';
function renderTextForm() {
  const T = bestiaryTexts(cfg), S = bestiaryStyle(cfg);
  document.getElementById('textForm').innerHTML = TEXT_FIELDS.map(([k, n]) => textField(k, n, T[k])).join('') +
    '<div class="sub"><b>設定</b>' + numField('data-st="maxStars"', '星星最多幾顆', S.maxStars, 1, 10) +
    '<div class="field"><label class="check"><input type="checkbox" data-st="imageFrame"' + (S.imageFrame ? ' checked' : '') + '> 怪物圖片框要畫框線和底色</label></div>' +
    '<div class="field"><label class="check"><input type="checkbox" data-st="countPractice"' + (S.countPractice ? ' checked' : '') + '> B1 訓練室（練習模式）打死的也算進圖鑑</label>' +
      '<span class="hint">不勾＝只有在戰鬥區域消滅的才算。</span></div></div>';
}
document.addEventListener('input', e => {   // 文字：版面那邊、文字那邊都是同一份
  const k = e.target.dataset.t; if (!k || !e.target.closest('#blockForm, #textForm')) return;
  setText(k, e.target.value);
  document.querySelectorAll('[data-t="' + k + '"]').forEach(el => { if (el !== e.target) el.value = e.target.value; });
  saveDraft(); renderPreview();
});
document.getElementById('textForm').addEventListener('input', e => {
  const k = e.target.dataset.st; if (!k) return;
  if (e.target.type === 'checkbox') setStyle(k, e.target.checked);
  else { const n = Math.round(Number(e.target.value)); if (e.target.value === '' || !Number.isFinite(n) || n < 1) return; setStyle(k, Math.min(10, n));
    document.querySelectorAll('[data-st="' + k + '"]').forEach(el => { if (el !== e.target) el.value = n; }); }
  saveDraft(); renderPreview(); renderList(); if (k === 'maxStars') renderMonForm();
});
document.getElementById('layoutReset').addEventListener('click', () => {
  if (!confirm('確定把版面（每一塊的位置、大小）和所有文字、設定都恢復預設？（怪物的內容不會動）')) return;
  cfg.layout = {}; cfg.texts = {}; cfg.style = {}; saveDraft(); renderAll(); setStatus('版面、文字已恢復預設（還沒存到專案）');
});

// ---- 怪物清單 ----
const artImg = (e, cls = '') => '<img class="' + cls + '" src="' + esc(e.image) + '" alt=""' + (e.hue != null ? ' style="filter:hue-rotate(' + e.hue + 'deg) saturate(1.35)"' : '') + '>';
function renderList() {
  const max = bestiaryStyle(cfg).maxStars;
  document.getElementById('monList').innerHTML = allEntries().map(e => '<button type="button" class="' + (e.key === selKey ? 'sel' : '') + (e.hidden ? ' hid' : '') + '" data-mon="' + esc(e.key) + '">' +
    artImg(e, 'ml-img') + '<span>' + esc(e.name) + '<br><span class="ml-stars">' + '★'.repeat(Math.max(0, Math.min(max, e.stars))) + '</span></span>' +
    (e.hidden ? '<span class="ml-flag hid">不放進圖鑑</span>' : monChanged(e.key) ? '<span class="ml-flag">已修改</span>' : '') + '</button>').join('');
  document.getElementById('orderReset').hidden = !cfg.order.length;
}
document.getElementById('monList').addEventListener('click', e => { const b = e.target.closest('[data-mon]'); if (b) selectMonster(b.dataset.mon, true); });
function selectMonster(key, flip) {
  selKey = key;
  if (flip) { const p = pageOf(key); if (p != null) pvPage = p; }   // 從清單選：預覽翻到那一頁
  renderList(); renderMonForm(); renderBlockForm(); renderPreview(); renderAssets(); showSelInfo();
  if (flip) document.querySelector('#monList .sel')?.scrollIntoView({ block: 'nearest' });
}
document.getElementById('orderReset').addEventListener('click', () => { cfg.order = []; saveDraft(); renderList(); renderPreview(); setStatus('已恢復原本的順序（還沒存到專案）'); });

// ---- 怪物：表單 ----
function offField(label, kx, ky, e, hint) {
  return '<div class="field">' + label + '<div class="img-off">' +
    '<label>左右<input type="number" data-m="' + kx + '" step="1" value="' + e[kx] + '"></label>' +
    '<label>上下<input type="number" data-m="' + ky + '" step="1" value="' + e[ky] + '"></label>' +
    '<span class="nudge"><button type="button" class="ed-btn" data-mn="' + kx + ':-1" title="往左 1px（Shift＝10px）">←</button><button type="button" class="ed-btn" data-mn="' + ky + ':-1" title="往上">↑</button>' +
    '<button type="button" class="ed-btn" data-mn="' + ky + ':1" title="往下">↓</button><button type="button" class="ed-btn" data-mn="' + kx + ':1" title="往右">→</button>' +
    '<button type="button" class="ed-btn" data-mz="' + kx + ',' + ky + '" title="回到原本的位置">歸零</button></span></div>' +
    '<span class="hint">' + hint + '</span></div>';
}
function renderMonForm() {
  const form = document.getElementById('monForm'), e = entryOf(selKey);
  if (!e) { form.innerHTML = '<p class="hint">沒有怪物。</p>'; return; }
  const max = bestiaryStyle(cfg).maxStars, list = allEntries(), i = list.findIndex(x => x.key === e.key);
  form.innerHTML =
    '<div class="img-btns" style="margin:0 0 10px"><button type="button" class="ed-btn" data-move="-1"' + (i <= 0 ? ' disabled' : '') + ' title="在圖鑑裡往前排">↑ 往前</button>' +
      '<button type="button" class="ed-btn" data-move="1"' + (i >= list.length - 1 ? ' disabled' : '') + ' title="在圖鑑裡往後排">↓ 往後</button>' +
      '<label class="field" style="margin:0 0 0 auto;display:flex;align-items:center;gap:6px;color:#dbe6f1;font-size:13px"><input type="checkbox" data-m="hidden"' + (e.hidden ? ' checked' : '') + '> 不放進圖鑑</label></div>' +
    '<div class="field">名稱<input type="text" data-m="name" value="' + esc(cfg.monsters[e.key]?.name || '') + '" placeholder="' + esc(e.baseName) + '"><span class="hint">空白＝用怪物編輯器裡的名稱（' + esc(e.baseName) + '）。</span></div>' +
    '<div class="field">星級（怪物等級）<div class="stars-pick">' + '<button type="button" class="zero' + (e.stars <= 0 ? ' on' : '') + '" data-star="0">0</button>' +
      Array.from({ length: max }, (_, k) => '<button type="button" class="' + (k < e.stars ? 'on' : '') + '" data-star="' + (k + 1) + '" title="' + (k + 1) + ' 星">★</button>').join('') + '</div></div>' +
    '<div class="field">怪物能力（最多 4 條）<span class="hint">從第 1 條開始寫：1 在最下面，往上排；沒寫的那幾條不顯示。寫成「名稱：說明」，名稱會是金色。</span></div>' +
    [3, 2, 1, 0].map(k => '<div class="ab-row"><span>能力 ' + (k + 1) + (k === 3 ? '（最上）' : k === 0 ? '（最下）' : '') + '</span><input type="text" data-ab="' + k + '" value="' + esc(e.abilities[k]) + '" placeholder="例如：分裂：被打倒時分成兩隻小史萊姆"></div>').join('') +
    '<div class="field" style="margin-top:8px">背景介紹（基礎訊息裡的文字）<textarea data-m="about" rows="5">' + esc(e.about) + '</textarea></div>' +
    '<div class="sub"><b>圖片（左邊的怪物圖片框，以框的中心為準）</b>' +
      '<div class="field"><div class="img-row"><span class="thumb">' + artImg(e) + '</span><input type="text" data-m="image" value="' + esc(cfg.monsters[e.key]?.image || '') + '" placeholder="' + esc(e.baseImage) + '"></div>' +
        '<div class="img-btns"><button type="button" class="ed-btn" id="pickImage">從資料夾選…</button>' + (cfg.monsters[e.key]?.image ? '<button type="button" class="ed-btn" id="imageReset">用原本的圖</button>' : '') + '</div>' +
        '<span class="hint">也可以點最下面「怪物圖素」裡的圖。空白＝怪物編輯器裡的圖。</span></div>' +
      '<div class="field">這隻的怪物圖片框（只有這隻）：<b id="monBoxText" style="color:#dbe6f1">' + esc(monBoxText(e)) + '</b>' +
        '<div class="img-btns"><button type="button" class="ed-btn" id="editBox">調這隻的圖片框</button></div>' +
        '<span class="hint">圖片會整張放進框裡、以框的中心為準：框拉小＝圖變小。在預覽裡拖曳框＝移動、Shift＋拖曳＝以中心等比例縮放、右下角小方塊＝改寬高；也可以在「版面」打數字、置中。</span></div></div>' +
    '<div class="sub"><b>縮圖（右邊的格子：只露出怪物的一部分）</b>' +
      numField('data-m="thumbScale"', '縮圖大小（%，100＝整隻剛好放進格子）', e.thumbScale, 50, 600) +
      offField('縮圖位移（px）', 'thumbX', 'thumbY', e, '正數＝往右／往下（例如往下移＝多露出頭）。') + '</div>' +
    '<div class="sub"><b>換色</b>' + numField('data-m="hue"', '色相（度；史萊姆變體跟遊戲一樣換色）', e.hue ?? 0, -180, 180) +
      '<div class="img-btns" style="margin-top:-4px"><button type="button" class="ed-btn" id="hueReset"' + (cfg.monsters[e.key] && 'hue' in cfg.monsters[e.key] ? '' : ' disabled') + '>原本的顏色' + (e.baseHue != null ? '（' + e.baseHue + '°）' : '') + '</button>' +
      (e.hue != null ? '<button type="button" class="ed-btn" id="hueOff">不換色</button>' : '') + '</div></div>' +
    '<div class="img-btns" style="margin-top:12px"><button type="button" class="ed-btn" id="monReset"' + (cfg.monsters[e.key] ? '' : ' disabled') + '>這隻恢復預設</button></div>';
}
const monBoxText = e => !e ? '' : e.imageBox ? 'X ' + e.imageBox.x + '、Y ' + e.imageBox.y + '、' + e.imageBox.w + '×' + e.imageBox.h : '用預設的框（' + bestiaryLayout(cfg).image.w + '×' + bestiaryLayout(cfg).image.h + '）';
function syncMonNumbers() {
  const e = entryOf(selKey); if (!e) return;
  document.querySelectorAll('#monForm input[type=number][data-m], #monForm input[type=range][data-m]').forEach(el => { const k = el.dataset.m; if (document.activeElement !== el && k in e) el.value = k === 'hue' ? (e.hue ?? 0) : e[k]; });
}
const monFormEl = document.getElementById('monForm');
monFormEl.addEventListener('input', ev => {
  const t = ev.target, f = t.dataset.m, e = entryOf(selKey); if (!e) return;
  if (t.dataset.ab !== undefined) {   // 能力
    const list = e.abilities.slice(); list[+t.dataset.ab] = t.value; setMon(selKey, 'abilities', list);
  } else if (!f) return;
  else if (f === 'hidden') { setMon(selKey, 'hidden', t.checked); renderList(); }
  else if (f === 'name' || f === 'about' || f === 'image') {
    setMon(selKey, f, f === 'about' ? t.value : t.value.trim());
    if (f !== 'about') renderList();
    if (f === 'image') { const th = monFormEl.querySelector('.img-row .thumb'); if (th) th.innerHTML = artImg(entryOf(selKey)); renderAssets(); }
  } else {
    const n = Math.round(Number(t.value)); if (t.value === '' || !Number.isFinite(n)) return;
    setMon(selKey, f, n);
    monFormEl.querySelectorAll('[data-m="' + f + '"]').forEach(el => { if (el !== t) el.value = n; });
    if (f === 'hue') { const r = document.getElementById('hueReset'); if (r) r.disabled = false; }
  }
  saveDraft(); renderPreview();
  const r = document.getElementById('monReset'); if (r) r.disabled = !cfg.monsters[selKey];
});
monFormEl.addEventListener('click', ev => {
  const t = ev.target, e = entryOf(selKey); if (!e) return;
  const star = t.closest('[data-star]');
  if (star) { setMon(selKey, 'stars', Number(star.dataset.star)); return afterMon(e.name + '：' + star.dataset.star + ' 星'); }
  const mv = t.closest('[data-move]');
  if (mv) {
    const keys = allEntries().map(x => x.key), i = keys.indexOf(selKey), j = i + Number(mv.dataset.move);
    if (j < 0 || j >= keys.length) return;
    [keys[i], keys[j]] = [keys[j], keys[i]]; cfg.order = keys;
    const p = pageOf(selKey); if (p != null) pvPage = p;
    return afterMon(e.name + '：' + (Number(mv.dataset.move) < 0 ? '往前' : '往後') + '排');
  }
  const nb = t.closest('[data-mn]');
  if (nb) { const [k, d] = nb.dataset.mn.split(':'); setMon(selKey, k, e[k] + Number(d) * (ev.shiftKey ? 10 : 1)); saveDraft(); renderPreview(); syncMonNumbers(); return; }
  const z = t.closest('[data-mz]');
  if (z) { z.dataset.mz.split(',').forEach(k => setMon(selKey, k, BESTIARY_MONSTER_DEFAULT[k])); saveDraft(); renderPreview(); syncMonNumbers(); return; }
  if (t.id === 'pickImage') { pickImage(); return; }
  if (t.id === 'editBox') { selBlock = 'image'; renderBlockForm(); renderPreview(); document.getElementById('blockForm').scrollIntoView({ block: 'nearest', behavior: 'smooth' }); setStatus('已選「' + e.name + '」的怪物圖片框：在預覽裡拖曳／Shift＋拖曳，或在「版面」調'); return; }
  if (t.id === 'imageReset') { setMon(selKey, 'image', ''); return afterMon(e.name + '：改回原本的圖'); }
  if (t.id === 'hueReset') { delete (cfg.monsters[selKey] || {}).hue; if (cfg.monsters[selKey] && !Object.keys(cfg.monsters[selKey]).length) delete cfg.monsters[selKey]; return afterMon(e.name + '：原本的顏色'); }
  if (t.id === 'hueOff') { setMon(selKey, 'hue', null); return afterMon(e.name + '：不換色'); }
  if (t.id === 'monReset') { if (!confirm('確定把「' + e.name + '」恢復預設？（名稱、星級、能力、介紹、圖片、圖片框都會清掉）')) return; delete cfg.monsters[selKey]; renderBlockForm(); return afterMon(e.baseName + '已恢復預設'); }
});
function afterMon(msg) { saveDraft(); renderList(); renderMonForm(); renderPreview(); renderAssets(); if (msg) setStatus(msg + '（還沒存到專案）'); }
// 從遊戲資料夾挑一張圖片：記下它在遊戲資料夾裡的路徑（例如 images/monster/xxx.png）
async function pickImage() {
  if (!window.showOpenFilePicker) { setStatus('這個瀏覽器不能挑檔案，請用 Chrome 或 Edge，或直接在欄位裡打圖片路徑', true); return; }
  try {
    const root = await ProjectSave.projectDir(false, m => setStatus(m));
    let start = root; try { start = await (await root.getDirectoryHandle('images')).getDirectoryHandle('monster'); } catch (_) {}
    const [fh] = await window.showOpenFilePicker({ startIn: start, types: [{ description: '圖片', accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] } }] });
    const parts = await root.resolve(fh);
    if (!parts) { setStatus('這張圖片不在遊戲資料夾裡：請先把圖片放進遊戲資料夾（例如 images/monster/），再選一次', true); return; }
    useImage(parts.join('/'));
  } catch (err) {
    if (err && err.name === 'AbortError') return;
    setStatus('選圖片失敗：' + (err && err.message || err), true);
  }
}
function useImage(path) { const e = entryOf(selKey); if (!e) return; setMon(selKey, 'image', path); afterMon(e.name + '的圖片改成 ' + path); }

// ---- 怪物圖素（預覽下面）：怪物編輯器裡用到的圖＋images/monster 資料夾裡的圖 ----
const assets = new Map();   // 路徑 → 資料夾
let assetTab = 'all', assetQuery = '';
function addAsset(p) {
  if (!p || typeof p !== 'string' || !/\.(png|gif|webp|jpe?g)$/i.test(p)) return;
  const m = p.match(/^images\/monster\/([^/]+)\//); assets.set(p, m ? m[1] : '（其他）');
}
const folderNames = {};   // 資料夾 → 怪物名稱（分頁上顯示）
for (const m of (typeof monsterCatalog === 'function' ? monsterCatalog() : [])) {
  [m.sprite, ...(typeof monsterFrameFiles === 'function' ? monsterFrameFiles(m) : []), ...Object.values(m.art || {})].forEach(addAsset);
  const f = (String(m.sprite).match(/^images\/monster\/([^/]+)\//) || [])[1]; if (f && !folderNames[f]) folderNames[f] = m.name;
}
async function crawlListing(dir, depth) {   // 本機伺服器有「資料夾列表」時：把 images/monster 裡的圖全部列出來
  try {
    const res = await fetch(dir, { cache: 'no-store' }); if (!res.ok) return;
    const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
    for (const a of doc.querySelectorAll('a[href]')) {
      const href = a.getAttribute('href');
      if (!href || /^([a-z]+:|\/|\?|#|\.\.)/i.test(href)) continue;
      const p = dir + decodeURIComponent(href);
      if (href.endsWith('/')) { if (depth < 3) await crawlListing(p, depth + 1); } else addAsset(p);
    }
  } catch (_) {}
}
async function scanFolder() {   // 從遊戲資料夾讀（Chrome／Edge）：images/monster 裡的圖全部列出來
  try {
    const root = await ProjectSave.projectDir(false, m => setStatus(m));
    const walk = async (dir, path, depth) => { for await (const [name, h] of dir.entries()) { if (h.kind === 'directory') { if (depth < 3) await walk(h, path + name + '/', depth + 1); } else addAsset(path + name); } };
    await walk(await (await root.getDirectoryHandle('images')).getDirectoryHandle('monster'), 'images/monster/', 0);
    renderAssets(); setStatus('已讀取 images/monster 裡的圖（共 ' + assets.size + ' 張）');
  } catch (err) { if (!err || err.name !== 'AbortError') setStatus('讀取資料夾失敗：' + (err && err.message || err), true); }
}
document.getElementById('scanFolder').addEventListener('click', scanFolder);
function renderAssets() {
  const e = entryOf(selKey), folders = [...new Set(assets.values())].sort((a, b) => a === '（其他）' ? 1 : b === '（其他）' ? -1 : a.localeCompare(b));
  const count = f => [...assets.values()].filter(v => f === 'all' || v === f).length;
  document.getElementById('assetTabs').innerHTML = '<input type="search" id="assetSearch" placeholder="搜尋圖素" value="' + esc(assetQuery) + '">' +
    [['all', '全部'], ...folders.map(f => [f, f + (folderNames[f] ? '（' + folderNames[f] + '）' : '')])].map(([f, n]) =>
      '<button type="button" class="asset-tab' + (assetTab === f ? ' sel' : '') + '" data-at="' + esc(f) + '">' + esc(n) + '<span class="count">' + count(f) + '</span></button>').join('');
  const q = assetQuery.trim().toLowerCase();
  const list = [...assets.entries()].filter(([p, f]) => (assetTab === 'all' || f === assetTab) && (!q || p.toLowerCase().includes(q) || (folderNames[f] || '').includes(q))).map(([p]) => p).sort();
  document.getElementById('assetGrid').innerHTML = list.length ? list.map(p => '<button type="button" class="asset' + (e && e.image === p ? ' sel' : '') + '" data-asset="' + esc(p) + '" title="' + esc(p) + '">' +
    '<span class="asset-thumb"><img src="' + esc(p) + '" alt="" loading="lazy"></span><b>' + esc(p.split('/').pop().replace(/\.[a-z]+$/i, '')) + '</b></button>').join('') : '<p class="asset-empty">沒有符合的圖素</p>';
  const s = document.getElementById('assetSearch');
  s.oninput = () => { assetQuery = s.value; const pos = s.selectionStart; renderAssets(); const n = document.getElementById('assetSearch'); n.focus(); n.setSelectionRange(pos, pos); };
}
document.getElementById('assetTabs').addEventListener('click', e => { const b = e.target.closest('[data-at]'); if (b) { assetTab = b.dataset.at; renderAssets(); } });
document.getElementById('assetGrid').addEventListener('click', e => { const b = e.target.closest('[data-asset]'); if (b) useImage(b.dataset.asset); });

// ---- 存檔 ----
// 開頭說明要跟 data/bestiary.js 一字不差（存到專案時，內容沒變就不會重寫檔案）
const FILE_HEAD = '/* ===== 怪物圖鑑（由「📕 怪物圖鑑編輯器」匯出，整段覆蓋即可）=====\n' +
  '   在 2F應變中心的電腦（電腦辦公桌）前按 Space 打開。消滅過的怪物才會出現縮圖，還沒消滅過的是黑底問號。\n' +
  '   ・layout：每一塊的位置、大小（px，以 1060×620 的視窗為準），沒寫的用預設值（js/bestiary-config.js 的 BESTIARY_LAYOUT_DEFAULT）\n' +
  '   ・texts：標題、按鈕的文字；style：maxStars 星星最多幾顆、imageFrame 圖片框要不要框線、countPractice 練習室打死的算不算\n' +
  '   ・monsters：每一隻怪物（key＝怪物 id；史萊姆變體是 slime:splitter 這樣）：\n' +
  '     name 名稱、stars 星級、abilities 能力（最多 4 條，第 1 條在最下面）、about 背景介紹、image 圖片、\n' +
  '     imageBox 這隻自己的怪物圖片框（x、y、w 寬、h 高；沒寫＝用 layout.image）、thumbScale／thumbX／thumbY 縮圖大小（%）與位移（px）、hue 換色（史萊姆變體）、hidden 不放進圖鑑\n' +
  '   ・order：怪物的排列順序（沒列到的接在後面） */\n';
function exportText() {
  const keys = allEntries().map(e => e.key);   // 怪物照圖鑑的順序寫
  const monsters = {}; for (const k of keys) if (cfg.monsters[k]) monsters[k] = cfg.monsters[k];
  for (const [k, v] of Object.entries(cfg.monsters)) if (!(k in monsters)) monsters[k] = v;   // 怪物編輯器裡暫時沒有的：照樣留著
  const layout = {}; for (const [id] of BESTIARY_BLOCKS) if (cfg.layout[id]) layout[id] = cfg.layout[id];
  return FILE_HEAD + 'const BESTIARY_CONFIG = ' + JSON.stringify({ layout, texts: cfg.texts, style: cfg.style, monsters, order: cfg.order }, null, 2) + ';\n';
}
document.getElementById('downloadFile').addEventListener('click', () => {
  const blob = new Blob([exportText()], { type: 'text/javascript' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'bestiary.js'; a.click(); URL.revokeObjectURL(a.href);
  setStatus('已下載 bestiary.js，請把它覆蓋到 data/bestiary.js');
});
document.getElementById('resetFile').addEventListener('click', () => {
  if (!confirm('確定丟掉還沒存到專案的修改，改回 data/bestiary.js 檔案裡的內容？')) return;
  try { localStorage.removeItem(BST_DRAFT_KEY); } catch (_) {}
  cfg = fromFile(); renderAll(); setStatus('已改回檔案裡的內容');
});
ProjectSave.attach({
  after: ['downloadFile'],
  files: [{ path: 'data/bestiary.js', label: '怪物圖鑑', text: exportText }],
  status: (m, err) => setStatus(m, err),
});

function renderAll() { renderPvModes(); renderList(); renderMonForm(); renderBlockForm(); renderTextForm(); renderPreview(); renderAssets(); }
renderAll();
crawlListing('images/monster/', 0).then(renderAssets);
// 暫存跟檔案不一樣＝上次有改了還沒存（存過的就不提醒）
const fileText = (() => { const keep = cfg; cfg = fromFile(); const t = exportText(); cfg = keep; return t; })();
if (exportText() !== fileText) setStatus('已讀取上次還沒存到專案的修改（要丟掉請按「從檔案重設」）');
