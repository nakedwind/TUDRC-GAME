/* ===== 🎒 背包編輯器（背包編輯器.html）=====
   中間嵌一個真的遊戲畫面（iframe：塔防原型.html?bagedit=1，背包一直開著、每種物品都放幾個），
   在上面點東西選取、拖曳移動、拖右下角改大小；右邊調位置、大小、字級、對齊、文字，每一項都有「置中」「恢復預設」。
   設定格式見 data/backpack-layout.js、data/item-texts.js；套用方式見 js/backpack-layout.js（遊戲跟這裡用同一套）。
   Ctrl+Z／Ctrl+Y：上一步／下一步（記在這個頁面裡，重新整理就清掉）。
   暫存：瀏覽器（js/draft-sync.js 三方合併）；存檔：js/project-save.js。
*/
const BAG_DRAFT_KEY = 'tudrc_backpack_layout_draft_v1';
const $b = id => document.getElementById(id);
const clone = v => JSON.parse(JSON.stringify(v));
let state = (() => {   // { layout: { elements, texts }, itemTexts }
  const file = { layout: typeof BACKPACK_LAYOUT !== 'undefined' ? BACKPACK_LAYOUT : {}, itemTexts: typeof ITEM_TEXTS !== 'undefined' ? ITEM_TEXTS : {} };
  const d = typeof DraftSync !== 'undefined' ? DraftSync.load(BAG_DRAFT_KEY, file, { label: '背包版面' }) : null;
  const out = clone(d && d.layout ? d : file);
  out.layout = out.layout || {}; out.layout.elements = out.layout.elements || {}; out.layout.texts = out.layout.texts || {}; out.itemTexts = out.itemTexts || {};
  return out;
})();
let selKey = null, play = false, dynParts = [];
const info = {};   // 遊戲畫面量到的：info[key] = { visible, count, values: { w, h, font, align }, text, item }
const ALIGN_NAMES = { left: '靠左', center: '置中', right: '靠右' };
function setStatus(msg, err = false) { $b('status').textContent = msg; $b('status').classList.toggle('err', !!err); }
function saveDraft() { try { localStorage.setItem(BAG_DRAFT_KEY, JSON.stringify(state)); } catch (_) {} }
const partOf = key => backpackPart(key) || {};
const labelOf = key => { const d = dynParts.find(p => p.key === key); return d ? d.label : partOf(key).label || key; };
const elOf = key => state.layout.elements[key] || {};
const isImg = key => partOf(key).kind === 'img';
const isText = key => { const p = partOf(key); return !isImg(key) && (!!p.text || /^(text|btn|tab|slotText)/.test(key)); };
const isChanged = key => !!state.layout.elements[key] || !!state.layout.texts[key];

// ---- 上一步／下一步（Ctrl+Z／Ctrl+Y）：每次修改之前記下整份設定 ----
// 連續的同一種修改（在同一格打字、連按方向鍵）只記一次，按一次 Ctrl+Z 就整段回去
const undoStack = [], redoStack = [];
let lastTag = '', lastTagAt = 0;
function remember(tag = '') {
  const now = Date.now();
  if (tag && tag === lastTag && now - lastTagAt < 1500) { lastTagAt = now; return; }
  lastTag = tag; lastTagAt = now;
  const snap = JSON.stringify(state);
  if (undoStack[undoStack.length - 1] !== snap) { undoStack.push(snap); if (undoStack.length > 300) undoStack.shift(); }
  redoStack.length = 0; renderUndo();
}
function stepHistory(from, to, msg) {
  if (!from.length) { setStatus(msg === 'undo' ? '沒有上一步了' : '沒有下一步了'); return; }
  to.push(JSON.stringify(state)); state = JSON.parse(from.pop()); lastTag = '';
  saveDraft(); sendState(); renderList(); renderProps(); renderUndo();
  setStatus(msg === 'undo' ? '↶ 回到上一步（還沒存到專案）' : '↷ 重做下一步（還沒存到專案）');
}
const undo = () => stepHistory(undoStack, redoStack, 'undo'), redo = () => stepHistory(redoStack, undoStack, 'redo');
function renderUndo() { $b('undoBtn').disabled = !undoStack.length; $b('redoBtn').disabled = !redoStack.length; }
$b('undoBtn').addEventListener('click', undo); $b('redoBtn').addEventListener('click', redo);
document.addEventListener('keydown', e => {
  if (!(e.ctrlKey || e.metaKey)) return;
  const k = e.key.toLowerCase();
  if (k === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
  else if (k === 'y' || (k === 'z' && e.shiftKey)) { e.preventDefault(); redo(); }
}, true);

// 改了某個東西的位置／大小：空白、0 的欄位拿掉（檔案比較乾淨），存暫存、更新預覽
function setEl(key, patch, send = true) {
  const o = { ...elOf(key), ...patch }, clean = {};
  for (const k of ['x', 'y']) if (Math.round(+o[k] || 0)) clean[k] = Math.round(+o[k]);
  for (const k of ['w', 'h', 'size', 'font']) if (+o[k] > 0) clean[k] = Math.round(+o[k]);
  if (o.align) clean.align = o.align;
  if (Object.keys(clean).length) state.layout.elements[key] = clean; else delete state.layout.elements[key];
  saveDraft(); if (send) sendState(); renderList(); renderProps(false);
}
// 改字：存到它該在的地方（介面文字→layout.texts；物品文字→itemTexts）；空白或跟原本一樣＝恢復原本的字
function setText(t, value) {
  const v = value === t.original ? '' : value;
  if (t.store === 'texts') { if (v) state.layout.texts[t.k] = v; else delete state.layout.texts[t.k]; }
  else if (t.store === 'items') {
    const o = state.itemTexts[t.id] || {};
    if (v) o[t.field] = v; else delete o[t.field];
    if (Object.keys(o).length) state.itemTexts[t.id] = o; else delete state.itemTexts[t.id];
  }
  t.value = v; saveDraft(); sendState(); renderList();
}

// ---- 左邊：清單 ----
function listGroups() {
  const groups = new Map();
  const add = (g, key) => { if (!groups.has(g)) groups.set(g, []); groups.get(g).push(key); };
  for (const [key, p] of Object.entries(BACKPACK_PARTS)) add(p.group, key);
  for (const p of dynParts) add(p.group, p.key);
  return groups;
}
const openGroups = new Set(['面板區域', '圖片', '文字與按鈕']);
function renderList() {
  let html = '';
  for (const [group, keys] of listGroups()) {
    const changed = keys.filter(isChanged).length;
    html += '<details data-group="' + group + '"' + (openGroups.has(group) || keys.includes(selKey) ? ' open' : '') + '><summary>' + group + (changed ? '（調整過 ' + changed + '）' : '') + '</summary><div class="list">' +
      keys.map(key => '<button type="button" data-key="' + key + '" class="' + (key === selKey ? 'on' : '') + '">' + labelOf(key) + (isChanged(key) ? '<em>已調整</em>' : '') + '</button>').join('') + '</div></details>';
  }
  const box = $b('list'), scroll = box.scrollTop;
  box.innerHTML = html; box.scrollTop = scroll;
}
$b('list').addEventListener('click', e => { const b = e.target.closest('[data-key]'); if (b) select(b.dataset.key); });
$b('list').addEventListener('toggle', e => { const d = e.target; if (d.dataset && d.dataset.group) { if (d.open) openGroups.add(d.dataset.group); else openGroups.delete(d.dataset.group); } }, true);

// ---- 右邊：調整 ----
const num = (f, label) => '<label>' + label + '<input type="number" step="1" data-f="' + f + '"></label>';
function renderProps(rebuild = true) {
  const box = $b('props');
  if (!selKey) { box.innerHTML = '<p class="empty">先在左邊清單或背包畫面上選一個東西</p>'; return; }
  const inf = info[selKey] || {}, t = inf.text;
  const sig = selKey + '|' + (t ? (t.note || t.store + ':' + (t.k || t.id + '.' + t.field)) : '-');   // 換了東西、或文字存的地方變了（換了物品）才重建
  if (rebuild || box.dataset.sig !== sig) {
    box.dataset.sig = sig;
    let html = '<div class="sel-name">' + labelOf(selKey) + '</div><div class="sel-sub" id="selSub"></div>' +
      '<div class="sec"><div class="sec-head">位置（往右／往下為正，px）<span class="sp"></span><button type="button" class="small" data-reset="pos">↺ 恢復預設</button></div>' +
      '<div class="two">' + num('x', 'X') + num('y', 'Y') + '</div>' +
      '<div class="btns"><button type="button" class="small" data-center="both">⊕ 置中</button><button type="button" class="small" data-center="x">↔ 水平置中</button><button type="button" class="small" data-center="y">↕ 垂直置中</button></div>' +
      '<div class="orig">置中＝放到外面那一層框的正中間</div></div>' +
      (isImg(selKey)
        ? '<div class="sec"><div class="sec-head">大小（px，長寬等比例）<span class="sp"></span><button type="button" class="small" data-reset="size">↺ 恢復預設</button></div>' +
          '<div class="one">' + num('size', '寬（高度照圖片比例，1px 一格）') + '</div></div>'
        : '<div class="sec"><div class="sec-head">大小（px，空白＝原本）<span class="sp"></span><button type="button" class="small" data-reset="size">↺ 恢復預設</button></div>' +
          '<div class="two">' + num('w', '寬') + num('h', '高') + '</div></div>');
    if (isText(selKey)) html +=
      '<div class="sec"><div class="sec-head">文字大小與對齊<span class="sp"></span><button type="button" class="small" data-reset="font">↺ 恢復預設</button></div>' +
      '<div class="two">' + num('font', '字級（px，空白＝原本）') + '<label>對齊<span class="btns" style="margin:0">' +
      ['left', 'center', 'right'].map(a => '<button type="button" class="small" data-align="' + a + '">' + ALIGN_NAMES[a] + '</button>').join('') + '</span></label></div></div>';
    if (t) html += '<div class="sec"><div class="sec-head">文字內容<span class="sp"></span>' + (t.note ? '' : '<button type="button" class="small" data-reset="text">↺ 恢復預設</button>') + '</div>' +
      (t.note ? '<div class="note">' + t.note + '</div>' :
        (t.multiline ? '<textarea data-text rows="5"></textarea>' : '<input type="text" data-text>') +
        '<div class="orig" id="textScope"></div><div class="orig" id="textOrig"></div>') + '</div>';
    html += '<div class="actions" style="margin-top:12px"><button type="button" class="danger" id="resetOne">這一個全部恢復預設</button></div>';
    box.innerHTML = html;
  }
  const o = elOf(selKey), v = inf.values || {};
  const set = (f, val, ph) => { const el = box.querySelector('[data-f="' + f + '"]'); if (!el) return; if (document.activeElement !== el) el.value = val; if (ph != null) el.placeholder = ph; };
  set('x', o.x || 0); set('y', o.y || 0);
  // 沒調整過的欄位直接填目前的大小（例如鑰匙原本 80），按上下箭頭才會從 80 開始加減，不會從 0 開始
  set('w', o.w || v.w || '', v.w != null ? '原本 ' + v.w : '原本'); set('h', o.h || v.h || '', v.h != null ? '原本 ' + v.h : '原本');
  set('size', o.size || v.size || '', v.size != null ? '原本 ' + v.size : '原本');
  set('font', o.font || v.font || '', v.font != null ? '原本 ' + v.font : '原本');
  box.querySelectorAll('[data-align]').forEach(b => b.classList.toggle('on', (o.align || '') === b.dataset.align));
  const sub = $b('selSub');
  if (sub) sub.textContent = [inf.visible === false ? '（現在畫面上看不到，換個分頁或物品）' : '', inf.count > 1 ? '同一組有 ' + inf.count + ' 個，一起調整' : '', inf.item && t && !t.note && t.store === 'items' ? '目前物品：' + inf.item : ''].filter(Boolean).join('　');
  const ta = box.querySelector('[data-text]');
  if (ta && t && !t.note) {
    if (document.activeElement !== ta) ta.value = t.value || t.original || '';   // 沒改過的：直接填目前的預設文字，改幾個字就好，不用整句重打
    ta.placeholder = t.original || '';
    $b('textScope').textContent = t.scope || '';
    $b('textOrig').textContent = '預設：' + (t.original || '（空白）');
  }
}
// 數字欄是空白（＝原本的大小）時按上下小箭頭：先填入原本的數字，再從它開始加減（不是從 0 開始）
function prefillDefault(e) {
  const el = e.target;
  if (!el.matches || !el.matches('input[type=number][data-f]') || el.value !== '') return;
  const m = /(-?\d+(?:\.\d+)?)/.exec(el.placeholder || ''); if (m) el.value = m[1];
}
$b('props').addEventListener('pointerdown', prefillDefault, true);
$b('props').addEventListener('keydown', e => { if (e.key === 'ArrowUp' || e.key === 'ArrowDown') prefillDefault(e); }, true);
$b('props').addEventListener('input', e => {
  if (!selKey) return;
  if (e.target.matches('[data-text]')) { const t = (info[selKey] || {}).text; if (t && !t.note) { remember('text:' + selKey); setText(t, e.target.value === (t.original || '') ? '' : e.target.value); } return; }   // 改回跟預設一樣＝不另外存
  const f = e.target.dataset.f; if (!f) return;
  remember('field:' + selKey + ':' + f);
  const val = e.target.value === '' ? 0 : +e.target.value;
  setEl(selKey, { [f]: f === 'x' || f === 'y' ? val : Math.max(0, val) });
});
$b('props').addEventListener('click', e => {
  if (!selKey) return;
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.center || b.dataset.align || b.dataset.reset || b.id === 'resetOne') remember();
  if (b.dataset.center) { toGame({ type: 'center', key: selKey, axis: b.dataset.center }); return; }
  if (b.dataset.align) { const o = elOf(selKey); setEl(selKey, { align: o.align === b.dataset.align ? '' : b.dataset.align }); return; }
  const r = b.dataset.reset;
  if (r === 'pos') setEl(selKey, { x: 0, y: 0 });
  else if (r === 'size') setEl(selKey, { w: 0, h: 0, size: 0 });
  else if (r === 'font') setEl(selKey, { font: 0, align: '' });
  else if (r === 'text') { const t = (info[selKey] || {}).text; if (t && !t.note) { setText(t, ''); renderProps(false); } }
  else if (b.id === 'resetOne') {
    delete state.layout.elements[selKey];
    const t = (info[selKey] || {}).text; if (t && !t.note) setText(t, '');
    saveDraft(); sendState(); renderList(); renderProps();
    setStatus('「' + labelOf(selKey) + '」恢復預設（還沒存到專案）');
  }
});
$b('resetAll').addEventListener('click', () => {
  if (!confirm('確定把背包所有的位置、大小、文字（包含物品名稱、說明）都恢復預設？（存到專案後才會套用到遊戲；可以按 Ctrl+Z 回來）')) return;
  remember();
  state = { layout: { elements: {}, texts: {} }, itemTexts: {} };
  saveDraft(); sendState(); renderList(); renderProps(); setStatus('全部恢復預設（還沒存到專案）');
});
function select(key) { selKey = key; renderList(); renderProps(); toGame({ type: 'select', key }); }

// ---- 中間：遊戲畫面（iframe）----
const frame = $b('game'), stageWrap = $b('stageWrap');
const GAME_W = 1300, GAME_H = 900;   // iframe 用固定大小（遊戲畫面原本的樣子），再縮放到放得下
function fitFrame() {
  const s = Math.min(1, stageWrap.clientWidth / GAME_W);
  frame.style.width = GAME_W + 'px'; frame.style.height = GAME_H + 'px'; frame.style.transform = 'scale(' + s + ')';
  stageWrap.style.height = Math.round(GAME_H * s) + 'px';
}
window.addEventListener('resize', fitFrame); fitFrame();
// 跟遊戲畫面溝通一律用訊息（postMessage）：直接雙擊 HTML 打開時，瀏覽器不准這邊直接碰 iframe 裡面
// 遊戲那邊的接收程式在 js/backpack-layout.js 的最下面（?bagedit=1 才會啟動）
const toGame = m => { try { frame.contentWindow.postMessage(Object.assign({ src: 'bagedit-editor' }, m), '*'); } catch (_) {} };
function sendState() { toGame({ type: 'state', layout: state.layout, itemTexts: state.itemTexts }); }
let gameReady = false;
setInterval(() => { if (!gameReady) toGame({ type: 'ping' }); }, 700);
frame.addEventListener('load', () => { gameReady = false; toGame({ type: 'ping' }); });
window.addEventListener('message', e => {
  const m = e.data; if (!m || m.src !== 'bagedit-game' || e.source !== frame.contentWindow) return;
  if (m.type === 'ready') { if (!gameReady) { gameReady = true; toGame({ type: 'setup' }); } }   // 遊戲畫面的程式載好了：打開背包
  else if (m.type === 'opened') { sendState(); toGame({ type: 'mode', play }); if (selKey) toGame({ type: 'select', key: selKey }); }
  else if (m.type === 'parts') { dynParts = m.list || []; renderList(); }
  else if (m.type === 'pick') { if (m.key !== selKey) { selKey = m.key; renderList(); renderProps(); } }   // 在背包畫面上點到某個東西
  else if (m.type === 'info') { info[m.key] = m; if (m.key === selKey) renderProps(false); }
  else if (m.type === 'move') setEl(m.key, { x: m.x, y: m.y }, false);   // 拖曳中（遊戲那邊已經先動了）
  else if (m.type === 'resize') setEl(m.key, m.size ? { size: m.size } : { w: m.w, h: m.h }, false);
  else if (m.type === 'dragstart') remember();   // 開始拖：記下拖之前的樣子
  else if (m.type === 'undo') undo();
  else if (m.type === 'redo') redo();
  else if (m.type === 'save') bagSave.save(false);
  else if (m.type === 'moved') setStatus('調整了「' + labelOf(m.key) + '」（還沒存到專案）');
  else if (m.type === 'arrow') nudge(m.key, m.shift);   // 在背包畫面上按方向鍵
});
document.querySelector('.modes').addEventListener('click', e => {
  const b = e.target.closest('[data-mode]'); if (!b) return;
  play = b.dataset.mode === 'play';
  document.querySelectorAll('[data-mode]').forEach(x => x.classList.toggle('on', x === b));
  $b('modeHint').textContent = play ? '可以照遊戲裡的方式點分頁、選物品、穿脫裝備（不會存檔）；要調整請切回編輯模式' : '點一下選取、拖曳移動；點道具格會順便換下面的說明';
  toGame({ type: 'mode', play });
});
function nudge(key, shift) {   // 方向鍵微調（Shift＝10px）
  if (!selKey) return;
  const n = shift ? 10 : 1, o = elOf(selKey);
  remember('nudge:' + selKey);
  setEl(selKey, { x: (o.x || 0) + (key === 'ArrowLeft' ? -n : key === 'ArrowRight' ? n : 0), y: (o.y || 0) + (key === 'ArrowUp' ? -n : key === 'ArrowDown' ? n : 0) });
}
document.addEventListener('keydown', e => {
  if (!selKey || play || !e.key.startsWith('Arrow') || (e.target && e.target.closest && e.target.closest('input, textarea'))) return;
  e.preventDefault(); nudge(e.key, e.shiftKey);
});

// ---- 存檔 ----
function layoutText() {
  return '/* ===== 背包版面（由「🎒 背包編輯器」匯出，整段覆蓋即可）=====\n' +
    '   elements：每個可以調整的區域／圖片／文字 → { x, y：位移（像素）, w, h：寬高（像素）, font：字級, align：文字對齊 }\n' +
    '   texts：改過的介面文字（分頁、標題、按鈕…）\n' +
    '   沒寫在這裡的就照原本的樣子。套用的程式在 js/backpack-layout.js。 */\n' +
    'const BACKPACK_LAYOUT = ' + JSON.stringify({ elements: state.layout.elements, texts: state.layout.texts }, null, 2) + ';\n';
}
function itemTextsText() {
  return '/* ===== 物品文字（由「🎒 背包編輯器」匯出，整段覆蓋即可）=====\n' +
    '   在背包編輯器改過的物品名稱、說明、效果標籤：物品 id → { name, desc, effect }。\n' +
    '   遊戲載入時會蓋過 data/items.js、data/supplies.js 裡的文字（那兩個檔本身不會被改），商店等其他地方也會跟著變。\n' +
    '   套用的程式在 js/backpack-layout.js。 */\n' +
    'const ITEM_TEXTS = ' + JSON.stringify(state.itemTexts, null, 2) + ';\n';
}
const bagSave = ProjectSave.attach({ after: [], files: [
  { path: 'data/backpack-layout.js', label: '背包版面', text: layoutText },
  { path: 'data/item-texts.js', label: '物品文字', text: itemTextsText },
], status: (m, err) => setStatus(m, err) });
$b('saveBtn').addEventListener('click', e => bagSave.save(e.shiftKey));
$b('downloadBtn').addEventListener('click', () => {
  for (const [name, text] of [['backpack-layout.js', layoutText()], ['item-texts.js', itemTextsText()]]) {
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'text/javascript' })); a.download = name; a.click();
  }
  setStatus('已下載 backpack-layout.js、item-texts.js，請覆蓋到 data/ 資料夾');
});

renderList(); renderProps(); renderUndo();
