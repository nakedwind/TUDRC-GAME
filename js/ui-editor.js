/* ===== 🖥️ UI編輯器（UI編輯器.html）=====
   中間嵌一個真的遊戲畫面（iframe：塔防原型.html），在上面點 UI 選取、拖曳移動；右邊調大小、透明度、隱藏。
   設定格式見 data/ui-layout.js；套用方式見 js/ui-layout.js（遊戲跟這裡用同一套）。
   暫存：瀏覽器（js/draft-sync.js 三方合併，朋友更新的設定不會被舊暫存蓋掉）；存檔：js/project-save.js。
*/
const UI_DRAFT_KEY = 'tudrc_ui_layout_draft_v1';
const $u = id => document.getElementById(id);
const clone = v => JSON.parse(JSON.stringify(v));
let layout = (() => {
  const file = typeof UI_LAYOUT !== 'undefined' ? UI_LAYOUT : { items: {} };
  const d = typeof DraftSync !== 'undefined' ? DraftSync.load(UI_DRAFT_KEY, file, { label: 'UI 版面' }) : null;
  const out = clone(d && d.items ? d : file); if (!out.items) out.items = {}; return out;
})();
let selKey = null, mode = 'combat';
const elDef = key => UI_ELEMENTS.find(e => e.key === key);
const itemOf = key => ({ ...UI_ITEM_DEFAULT, ...(layout.items[key] || {}) });
const isChanged = key => { const it = itemOf(key); return it.x || it.y || it.scale !== 1 || it.opacity !== 1 || it.hidden || (it.parts && Object.keys(it.parts).length > 0); };
const measured = {};   // 遊戲畫面量到的「原本」大小：measured[元素][細節][寬／高／…]
function setStatus(msg, err = false) { $u('status').textContent = msg; $u('status').classList.toggle('err', !!err); }
function saveDraft() { try { localStorage.setItem(UI_DRAFT_KEY, JSON.stringify(layout)); } catch (_) {} }
// 改了某個元素：把跟預設一樣的欄位拿掉（檔案比較乾淨），存暫存、更新預覽
function setItem(key, patch) {
  const it = { ...itemOf(key), ...patch };
  for (const k of ['x', 'y']) it[k] = Math.round(+it[k] || 0);
  it.scale = Math.round((+it.scale || 1) * 100) / 100; it.opacity = Math.round((+it.opacity ?? 1) * 100) / 100;
  if (it.parts) {   // 細節：沒填的拿掉，整個細節都沒填就不寫
    const parts = {};
    for (const [pk, pv] of Object.entries(it.parts)) { const c = {}; for (const [k, v] of Object.entries(pv || {})) if (typeof v === 'number' && isFinite(v)) c[k] = Math.round(v); if (Object.keys(c).length) parts[pk] = c; }
    if (Object.keys(parts).length) it.parts = parts; else delete it.parts;
  }
  const clean = {}; for (const [k, v] of Object.entries(it)) if (k === 'parts' || v !== UI_ITEM_DEFAULT[k]) clean[k] = v;
  if (Object.keys(clean).length) layout.items[key] = clean; else delete layout.items[key];
  saveDraft(); applyPreview(); renderList(); renderProps(false);
}

// ---- 左邊：元素清單 ----
function renderList() {
  let html = '', group = '';
  for (const e of UI_ELEMENTS) {
    if (e.group !== group) { group = e.group; html += '<h3>' + group + '</h3>'; }
    const it = itemOf(e.key);
    html += '<button type="button" data-key="' + e.key + '" class="' + (e.key === selKey ? 'on ' : '') + (it.hidden ? 'hid' : '') + '">' + e.label + (isChanged(e.key) ? '<em>已調整</em>' : '') + '</button>';
  }
  $u('list').innerHTML = html;
}
$u('list').addEventListener('click', e => { const b = e.target.closest('[data-key]'); if (b) select(b.dataset.key); });

// ---- 右邊：調整 ----
function renderProps(rebuild = true) {
  const box = $u('props');
  if (!selKey) { box.innerHTML = '<p class="empty">先在左邊清單或遊戲畫面上選一個 UI</p>'; return; }
  const it = itemOf(selKey), d = elDef(selKey);
  if (rebuild || !box.querySelector('[data-f="x"]')) {
    box.innerHTML = '<div class="sel-name">' + d.label + '</div>' +
      '<div class="field">位置（往右／往下為正，px）<div class="two"><input type="number" data-f="x" step="1"><input type="number" data-f="y" step="1"></div></div>' +
      '<div class="field">大小（%）<div class="rangebox"><input type="range" data-f="scale" min="30" max="250" step="1"><input type="number" data-f="scaleN" min="30" max="250"></div></div>' +
      '<div class="field">透明度（%）<div class="rangebox"><input type="range" data-f="opacity" min="10" max="100" step="1"><input type="number" data-f="opacityN" min="10" max="100"></div></div>' +
      '<label class="field" style="display:flex;gap:6px;align-items:center"><input type="checkbox" data-f="hidden"> 隱藏</label>' +
      partsHtml(d) +
      '<div class="actions" style="margin-top:10px"><button type="button" id="resetOne">恢復這個的原本樣子</button></div>';
  }
  for (const part of d.parts || []) for (const k of part.props) {   // 細節的數字（沒調過＝空白，灰字顯示原本的大小）
    const el = box.querySelector('[data-part="' + part.key + '"][data-prop="' + k + '"]'); if (!el) continue;
    const v = ((it.parts || {})[part.key] || {})[k], m = ((measured[selKey] || {})[part.key] || {})[k];
    if (document.activeElement !== el) el.value = typeof v === 'number' ? v : '';
    el.placeholder = m != null ? '原本 ' + m : '原本';
  }
  const set = (f, v) => { const el = box.querySelector('[data-f="' + f + '"]'); if (el && document.activeElement !== el) { if (el.type === 'checkbox') el.checked = v; else el.value = v; } };
  set('x', it.x); set('y', it.y); set('scale', Math.round(it.scale * 100)); set('scaleN', Math.round(it.scale * 100));
  set('opacity', Math.round(it.opacity * 100)); set('opacityN', Math.round(it.opacity * 100)); set('hidden', !!it.hidden);
}
$u('props').addEventListener('input', e => {
  if (e.target.dataset.part && selKey) {   // 細節：空白＝恢復原本
    const it = itemOf(selKey), parts = JSON.parse(JSON.stringify(it.parts || {})), pk = e.target.dataset.part, k = e.target.dataset.prop;
    parts[pk] = parts[pk] || {};
    if (e.target.value === '') delete parts[pk][k]; else parts[pk][k] = Math.max(0, +e.target.value);
    setItem(selKey, { parts }); return;
  }
  const f = e.target.dataset.f; if (!f || !selKey) return;
  const v = e.target.type === 'checkbox' ? e.target.checked : +e.target.value;
  if (f === 'x' || f === 'y') setItem(selKey, { [f]: v });
  else if (f === 'scale' || f === 'scaleN') setItem(selKey, { scale: Math.max(30, Math.min(250, v || 100)) / 100 });
  else if (f === 'opacity' || f === 'opacityN') setItem(selKey, { opacity: Math.max(10, Math.min(100, v || 100)) / 100 });
  else if (f === 'hidden') setItem(selKey, { hidden: v });
});
$u('props').addEventListener('click', e => { if (e.target.id === 'resetOne' && selKey) { delete layout.items[selKey]; saveDraft(); applyPreview(); renderList(); renderProps(); setStatus('「' + elDef(selKey).label + '」恢復原本的樣子（還沒存到專案）'); } });
$u('resetAll').addEventListener('click', () => {
  if (!confirm('確定把所有 UI 恢復成原本的樣子？（存到專案後才會套用到遊戲）')) return;
  layout = { items: {} }; saveDraft(); applyPreview(); renderList(); renderProps(); setStatus('全部恢復原本的樣子（還沒存到專案）');
});
function partsHtml(d) {   // 細節：每個零件一列，各自的 寬／高／文字大小／間距／圓角
  if (!d.parts || !d.parts.length) return '';
  return '<h3>細節（px，空白＝原本的大小）</h3>' + d.parts.map(part => '<div class="part"><b>' + part.label + '</b><div class="part-props">' +
    part.props.map(k => '<label>' + UI_PROP_NAMES[k] + '<input type="number" min="0" step="1" data-part="' + part.key + '" data-prop="' + k + '"></label>').join('') + '</div></div>').join('');
}
function select(key) { selKey = key; renderList(); renderProps(); toGame({ type: 'select', key }); }

// ---- 中間：遊戲畫面（iframe）----
const frame = $u('game'), stageWrap = $u('stageWrap');
const GAME_W = 1300, GAME_H = 900;   // iframe 用固定大小（遊戲畫面原本的樣子），再縮放到放得下
function fitFrame() {
  const s = Math.min(1, stageWrap.clientWidth / GAME_W);
  frame.style.width = GAME_W + 'px'; frame.style.height = GAME_H + 'px'; frame.style.transform = 'scale(' + s + ')';
  stageWrap.style.height = Math.round(GAME_H * s) + 'px';
}
window.addEventListener('resize', fitFrame); fitFrame();
// 跟遊戲畫面溝通一律用訊息（postMessage）：直接雙擊 HTML 打開時，瀏覽器不准這邊直接碰 iframe 裡面
// 遊戲那邊的接收程式在 js/ui-layout.js 的最下面（?uiedit=1 才會啟動）
const toGame = m => { try { frame.contentWindow.postMessage(Object.assign({ src: 'uiedit-editor' }, m), '*'); } catch (_) {} };
function applyPreview() { toGame({ type: 'layout', layout }); }
function setupGame() { toGame({ type: 'setup', mode }); applyPreview(); toGame({ type: 'select', key: selKey }); }
// 每秒問遊戲畫面一次「好了沒」，回答之後才切到戰鬥區（遊戲重新載入時也會再問）
let gameReady = false;
setInterval(() => { if (!gameReady) toGame({ type: 'ping' }); }, 700);
frame.addEventListener('load', () => { if (!gameReady) toGame({ type: 'ping' }); });
window.addEventListener('message', e => {
  const m = e.data; if (!m || m.src !== 'uiedit-game' || e.source !== frame.contentWindow) return;
  if (m.type === 'ready') { if (!gameReady) { gameReady = true; setupGame(); } }   // 遊戲畫面的程式載好了
  else if (m.type === 'pick') { if (m.key !== selKey) select(m.key); }   // 在遊戲畫面上點到某個 UI
  else if (m.type === 'move') setItem(m.key, { x: m.x, y: m.y });         // 拖曳中
  else if (m.type === 'moved') setStatus('移動了「' + elDef(m.key).label + '」（還沒存到專案）');
  else if (m.type === 'arrow') nudge(m.key, m.shift);                    // 在遊戲畫面上按方向鍵
  else if (m.type === 'measure') { measured[m.key] = m.values; if (m.key === selKey) renderProps(false); }   // 細節原本的大小
});
document.querySelector('.modes').addEventListener('click', e => {
  const b = e.target.closest('[data-mode]'); if (!b) return;
  mode = b.dataset.mode; document.querySelectorAll('[data-mode]').forEach(x => x.classList.toggle('on', x === b));
  setupGame();
});
function nudge(key, shift) {   // 方向鍵微調（Shift＝10px）
  if (!selKey) return;
  const n = shift ? 10 : 1, it = itemOf(selKey);
  setItem(selKey, { x: it.x + (key === 'ArrowLeft' ? -n : key === 'ArrowRight' ? n : 0), y: it.y + (key === 'ArrowUp' ? -n : key === 'ArrowDown' ? n : 0) });
}
document.addEventListener('keydown', e => {
  if (!selKey || !e.key.startsWith('Arrow') || (e.target && e.target.closest && e.target.closest('input'))) return;
  e.preventDefault(); nudge(e.key, e.shiftKey);
});

// ---- 存檔 ----
function exportText() {
  const items = {}; for (const e of UI_ELEMENTS) if (layout.items[e.key]) items[e.key] = layout.items[e.key];
  return '/* 遊戲畫面 UI 的版面調整：由「UI編輯器.html」匯出，整份覆蓋即可。\n' +
    '   items：UI 元素代號（js/ui-layout.js 的 UI_ELEMENTS）→ { x, y：位移（px）, scale：大小（1＝原本）, opacity：透明度（1＝不透明）, hidden：是否隱藏 }\n' +
    '   沒寫到的元素＝維持原本的樣子。 */\n' +
    'const UI_LAYOUT = ' + JSON.stringify({ items }, null, 2) + ';\n';
}
const uiSave = ProjectSave.attach({ after: [], files: [{ path: 'data/ui-layout.js', label: 'UI 版面', text: exportText }], status: (m, err) => setStatus(m, err) });
$u('saveBtn').addEventListener('click', e => uiSave.save(e.shiftKey));
$u('downloadBtn').addEventListener('click', () => {
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([exportText()], { type: 'text/javascript' })); a.download = 'ui-layout.js'; a.click();
  setStatus('已下載 ui-layout.js，請覆蓋到 data/ui-layout.js');
});

renderList(); renderProps();
