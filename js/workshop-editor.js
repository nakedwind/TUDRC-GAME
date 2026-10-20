/* ===== 🔧 開發工坊編輯器 =====
   左邊：選一件裝備／武器，改名稱、圖片、說明、取得地點；下面改整個工坊的外觀（字的顏色、大小、欄位大小）。
   右邊：預覽＝遊戲裡的開發工坊（用同一份 css/style.css，所以長得一模一樣）。
   存檔：「💾 存到專案」寫進 data/workshop.js（遊戲由 js/workshop-config.js 套用）。
   還沒存的修改會先放在瀏覽器暫存（重新整理不會不見）；按「從檔案重設」才會丟掉。
*/
const WS_DRAFT_KEY = 'tudrc_workshop_editor_draft_v1';
const clone = v => JSON.parse(JSON.stringify(v));
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const statusEl = document.getElementById('status');
function setStatus(msg, err = false) { statusEl.textContent = msg; statusEl.classList.toggle('err', !!err); }

// ---- 目前編輯中的設定：{ items: { key: { name, image, desc, where } }, style: {...} } ----
const fromFile = () => ({ items: clone(WORKSHOP_CONFIG.items || {}), style: clone(WORKSHOP_CONFIG.style || {}) });
let cfg = (() => {
  try { const d = JSON.parse(localStorage.getItem(WS_DRAFT_KEY) || 'null'); if (d && d.items && d.style) return d; } catch (_) {}
  return fromFile();
})();
function saveDraft() { try { localStorage.setItem(WS_DRAFT_KEY, JSON.stringify(cfg)); } catch (_) {} }

// ---- 每件裝備／武器 ----
const DEFS = workshopItemDefs();   // key → 原始資料（數值、費用、stat 說明…）
const ITEM_KEYS = Object.keys(DEFS);
const isWeapon = key => key.startsWith('w:');
const isField = (key, def) => isWeapon(key) ? !!def.field : def.source !== 'develop';   // 只能在戰鬥區域拿到
// 這件現在要顯示的文字／圖片：原本的資料＋編輯中改過的
function itemView(key) {
  const base = WORKSHOP_BASE[key] || {}, o = cfg.items[key] || {}, out = {};
  for (const f of WORKSHOP_TEXT_FIELDS) out[f] = typeof o[f] === 'string' && o[f] !== '' ? o[f] : (base[f] ?? '');
  return out;
}
const itemChanged = key => { const o = cfg.items[key]; return !!o && WORKSHOP_TEXT_FIELDS.some(f => typeof o[f] === 'string' && o[f] !== '' && o[f] !== (WORKSHOP_BASE[key] || {})[f]); };
const iconHtml = (key, view) => view.image ? '<img src="' + esc(view.image) + '" alt="">' : '<i>' + esc(DEFS[key].icon || '？') + '</i>';
let selKey = ITEM_KEYS[0];

function renderList() {
  const box = document.getElementById('itemList');
  box.innerHTML = ITEM_KEYS.map(key => {
    const v = itemView(key);
    return '<button type="button" data-key="' + key + '" class="' + (key === selKey ? 'sel ' : '') + (itemChanged(key) ? 'changed' : '') + '">' +
      iconHtml(key, v) + '<span>' + esc(v.name) + '<small>' + (isWeapon(key) ? '武器' : '裝備') + '</small></span></button>';
  }).join('');
}
document.getElementById('itemList').addEventListener('click', e => {
  const b = e.target.closest('[data-key]'); if (!b) return;
  selKey = b.dataset.key; renderList(); renderItemForm();
});

function renderItemForm() {
  const key = selKey, def = DEFS[key], v = itemView(key), base = WORKSHOP_BASE[key] || {};
  const field = isField(key, def);
  document.getElementById('itemForm').innerHTML =
    '<div class="field">名稱<input type="text" data-f="name" value="' + esc(v.name) + '"></div>' +
    '<div class="field">圖片<div class="img-row"><span class="thumb">' + iconHtml(key, v) + '</span>' +
      '<div><input type="text" data-f="image" value="' + esc(v.image) + '" placeholder="例如 images/裝備/xxx.png（空白＝用表情符號 ' + esc(def.icon || '') + '）">' +
      '<div class="img-btns"><button type="button" class="ed-btn" id="pickImage">從遊戲資料夾選圖片…</button></div></div></div>' +
      '<span class="hint">圖片要先放進遊戲資料夾（例如 images/裝備/），再用上面的按鈕選。</span></div>' +
    '<div class="field">說明' + (isWeapon(key) && !def.desc ? '（這把武器原本沒有說明；還沒拿到時才會顯示）' : '（還沒拿到時顯示）') +
      '<textarea data-f="desc">' + esc(v.desc) + '</textarea></div>' +
    (field ? '<div class="field">在哪裡拿到（顯示成「只能在戰鬥區域取得：…」）<textarea data-f="where">' + esc(v.where) + '</textarea></div>' : '') +
    '<div class="field"><span class="hint">效果說明（例如「偵測範圍 6 格」）會跟著數值自動產生，要改數值請改 data/equipment.js。</span></div>' +
    '<button type="button" class="ed-btn" id="itemReset"' + (itemChanged(key) ? '' : ' disabled') + '>這件恢復原本的設定</button>' +
    (base.name !== v.name ? '<span class="hint" style="margin-left:8px">原本叫「' + esc(base.name) + '」</span>' : '');
}
document.getElementById('itemForm').addEventListener('input', e => {
  const f = e.target.dataset.f; if (!f) return;
  const o = cfg.items[selKey] || (cfg.items[selKey] = {});
  const val = e.target.value, base = (WORKSHOP_BASE[selKey] || {})[f] ?? '';
  if (val === base) delete o[f]; else o[f] = val;
  if (!Object.keys(o).length) delete cfg.items[selKey];
  if (f === 'image') { const t = document.querySelector('#itemForm .thumb'); if (t) t.innerHTML = iconHtml(selKey, itemView(selKey)); }
  document.getElementById('itemReset').disabled = !itemChanged(selKey);
  saveDraft(); renderList(); renderPreview();
});
document.getElementById('itemForm').addEventListener('click', async e => {
  if (e.target.id === 'itemReset') {
    delete cfg.items[selKey]; saveDraft(); renderList(); renderItemForm(); renderPreview();
    setStatus('「' + itemView(selKey).name + '」已恢復原本的設定'); return;
  }
  if (e.target.id === 'pickImage') pickImage();
});
// 從遊戲資料夾挑一張圖片：記下它在遊戲資料夾裡的路徑（例如 images/裝備/xxx.png）
async function pickImage() {
  if (!window.showOpenFilePicker) { setStatus('這個瀏覽器不能挑檔案，請用 Chrome 或 Edge，或直接在欄位裡打圖片路徑', true); return; }
  try {
    const root = await ProjectSave.projectDir(false, m => setStatus(m));
    let start = root; try { start = await root.getDirectoryHandle('images'); } catch (_) {}
    const [fh] = await window.showOpenFilePicker({ startIn: start, types: [{ description: '圖片', accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] } }] });
    const parts = await root.resolve(fh);
    if (!parts) { setStatus('這張圖片不在遊戲資料夾裡：請先把圖片放進遊戲資料夾（例如 images/裝備/），再選一次', true); return; }
    const path = parts.join('/');
    const input = document.querySelector('#itemForm [data-f="image"]');
    input.value = path; input.dispatchEvent(new Event('input', { bubbles: true }));
    setStatus('圖片改成 ' + path);
  } catch (err) {
    if (err && err.name === 'AbortError') return;
    setStatus('選圖片失敗：' + (err && err.message || err), true);
  }
}

// ---- 外觀 ----
const STYLE_FIELDS = [
  ['欄位大小', [
    ['panelW', '工坊視窗最大寬度', 'num', 700, 1400, 10],
    ['panelH', '工坊視窗最大高度', 'num', 400, 900, 10],
    ['cardH', '裝備欄位最小高度（0＝自動）', 'num', 0, 200, 1],
    ['gap', '欄位之間的間距', 'num', 0, 30, 1],
    ['iconSize', '圖示框大小', 'num', 36, 120, 1],
    ['btnW', '按鈕最小寬度（0＝自動）', 'num', 0, 200, 1],
  ]],
  ['裝備名稱', [['nameSize', '文字大小', 'num', 9, 30, 1], ['nameColor', '文字顏色', 'color']]],
  ['說明／目前效果', [['descSize', '文字大小', 'num', 8, 24, 1], ['descColor', '文字顏色', 'color']]],
  ['下一級效果／取得地點', [['nextSize', '文字大小', 'num', 8, 24, 1], ['nextColor', '文字顏色', 'color']]],
  ['特別標色', [['numColor', '數字的顏色（Lv2、8 格、1.4 秒…）', 'color'], ['whereColor', '「戰鬥區域」的顏色', 'color']]],
];
const styleNow = () => workshopStyle(cfg);
function renderStyleForm() {
  const st = styleNow();
  document.getElementById('styleForm').innerHTML = STYLE_FIELDS.map(([group, list]) => '<div class="style-group"><b>' + group + '</b>' + list.map(([k, label, type, min, max, step]) =>
    type === 'num'
      ? '<div class="field">' + label + '（px）<div class="num"><input type="range" data-s="' + k + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + st[k] + '"><input type="number" data-s="' + k + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + st[k] + '"></div></div>'
      : '<div class="field">' + label + '<div class="color"><input type="color" data-s="' + k + '" value="' + esc(String(st[k]).toLowerCase()) + '"><input type="text" data-s="' + k + '" value="' + esc(st[k]) + '"></div></div>'
  ).join('') + '</div>').join('');
}
document.getElementById('styleForm').addEventListener('input', e => {
  const k = e.target.dataset.s; if (!k) return;
  const isNum = typeof WORKSHOP_STYLE_DEFAULT[k] === 'number';
  let val = e.target.value;
  if (isNum) { val = Number(val); if (!Number.isFinite(val)) return; }
  else if (!/^#[0-9a-f]{6}$/i.test(val)) return;   // 顏色打到一半：先不套用
  if (val === WORKSHOP_STYLE_DEFAULT[k] || (!isNum && String(val).toLowerCase() === String(WORKSHOP_STYLE_DEFAULT[k]).toLowerCase())) delete cfg.style[k]; else cfg.style[k] = val;
  document.querySelectorAll('#styleForm [data-s="' + k + '"]').forEach(el => { if (el !== e.target) el.value = isNum ? val : String(val).toLowerCase(); });   // 滑桿和數字框、色盤和色碼同步
  saveDraft(); renderPreview();
});
document.getElementById('styleReset').addEventListener('click', () => {
  cfg.style = {}; saveDraft(); renderStyleForm(); renderPreview(); setStatus('外觀已恢復預設（還沒存到專案）');
});

// ---- 預覽：照遊戲的 renderWorkshop（js/equipment.js）排出一樣的畫面 ----
const wsColor = text => String(text)
  .replace(/(?:Lv)?[+\-−]?\d+(?:\.\d+)?[%°]?/g, m => '<i class="ws-num">' + m + '</i>')
  .replace(/戰鬥區域/g, '<i class="ws-where">戰鬥區域</i>');
function previewRow(key) {
  const def = DEFS[key], v = itemView(key), mode = document.getElementById('previewMode').value;
  const icon = v.image ? '<img src="' + esc(v.image) + '" alt="">' : '<i>' + esc(def.icon || '') + '</i>';
  const row = (lvText, stat, next, btn) => '<div class="ws-row"><span class="ws-icon">' + icon + '</span><div class="ws-text"><b>' + esc(v.name) + lvText + '</b><span>' + wsColor(esc(stat)) + '</span>' + (next ? '<small>' + wsColor(esc(next)) + '</small>' : '') + '</div>' + btn + '</div>';
  const cost = n => '<b>◆ ' + n + '</b>', w = isWeapon(key);
  const upCost = lv => w ? def.cost[lv - 1] : def.cost[lv];
  if (mode === 'none' && (isField(key, def) || !w)) {
    if (isField(key, def)) return row('', v.desc, '只能在戰鬥區域取得：' + v.where, '<button type="button" class="ws-btn" disabled>尚未取得</button>');
    return row('', v.desc, 'Lv1：' + def.stat(def.levels[0]), '<button type="button" class="ws-btn">開發 ' + cost(def.cost[0]) + '</button>');
  }
  if (mode === 'max') return row(' <em>Lv3</em>', def.stat(def.levels[2]), '', '<button type="button" class="ws-btn" disabled>已達最高等級</button>');
  return row(' <em>Lv1</em>', def.stat(def.levels[0]), '升到 Lv2：' + def.stat(def.levels[1]), '<button type="button" class="ws-btn">升級 ' + cost(upCost(1)) + '</button>');
}
// 左右兩欄：一樣高的兩兩一排（跟遊戲的 arrangeWorkshopRows 一樣）
function arrangeRows(root) {
  root.querySelectorAll('.ws-grid').forEach(grid => {
    const cards = [...grid.children];
    cards.forEach(el => { el.style.alignSelf = 'start'; el.style.gridColumnStart = ''; });
    const h = new Map(cards.map(el => [el, el.offsetHeight]));
    const left = cards.slice(), pairs = [], alone = [];
    while (left.length) {
      const a = left.shift(), i = left.findIndex(b => Math.abs(h.get(b) - h.get(a)) <= 10);
      if (i >= 0) pairs.push([a, left.splice(i, 1)[0]]); else alone.push(a);
    }
    pairs.flat().concat(alone).forEach(el => grid.appendChild(el));
    pairs.forEach(([a]) => { a.style.gridColumnStart = '1'; });
    alone.forEach(el => { el.style.gridColumnStart = '1'; });
    cards.forEach(el => { el.style.alignSelf = ''; });
  });
}
function renderPreview() {
  const st = styleNow(), stage = document.getElementById('previewStage');
  stage.style.width = (st.panelW + 32) + 'px'; stage.style.height = (st.panelH + 32) + 'px';   // 跟遊戲一樣：視窗外面留 16px
  const gear = ITEM_KEYS.filter(k => !isWeapon(k)).map(previewRow).join('');
  const weapons = ITEM_KEYS.filter(isWeapon).map(previewRow).join('');
  const side = '<aside class="workshop-side"><h3>目前裝備</h3>' +
    ['主武器', '副武器', '頭部', '身體', '隨身物品1', '隨身物品2'].map(n => '<div class="wss-slot"><span class="wss-icon"><i>＋</i></span><div><small>' + n + '</small><b>（預覽）</b></div></div>').join('') + '</aside>';
  stage.innerHTML = '<div id="workshop"><section class="workshop-card" role="dialog" aria-label="開發工坊預覽">' +
    '<header class="workshop-head"><div class="workshop-title"><small>諾亞的開發工坊</small><h2>裝備開發・升級</h2><p>用異質碎片開發新裝備，或把裝備、武器升級</p></div>' +
    '<span class="workshop-wallet"><small>異質碎片</small><b>◆ 87</b></span><button type="button" class="workshop-close" aria-label="關閉">×</button></header>' +
    '<div class="workshop-main"><div class="workshop-body"><h3>裝備</h3><div class="ws-grid">' + gear + '</div><h3>武器</h3><div class="ws-grid">' + weapons + '</div></div>' + side + '</div></section></div>';
  const ws = stage.querySelector('#workshop');
  ws.style.padding = '16px';
  applyWorkshopStyle(ws, cfg);
  arrangeRows(ws);
}
document.getElementById('previewMode').addEventListener('change', renderPreview);

// ---- 存檔 ----
// 開頭說明要跟 data/workshop.js 一字不差（存到專案時，內容沒變就不會重寫檔案）
function exportText() {
  const items = {};
  for (const key of ITEM_KEYS) {
    const o = cfg.items[key]; if (!o) continue;
    const keep = {};
    for (const f of WORKSHOP_TEXT_FIELDS) if (typeof o[f] === 'string' && o[f] !== '' && o[f] !== (WORKSHOP_BASE[key] || {})[f]) keep[f] = o[f];
    if (Object.keys(keep).length) items[key] = keep;
  }
  const style = {};
  for (const k of Object.keys(WORKSHOP_STYLE_DEFAULT)) if (k in cfg.style && cfg.style[k] !== WORKSHOP_STYLE_DEFAULT[k]) style[k] = cfg.style[k];
  return '/* ===== 諾亞的開發工坊：裝備文字、圖片與外觀（由「🔧 開發工坊編輯器」匯出，整段覆蓋即可）=====\n' +
    '   items：要改哪件裝備／武器（沒寫的就用 data/equipment.js 原本的設定）\n' +
    '     key：裝備用 id（例如 headlamp）；武器前面加 w:（例如 w:pistol）\n' +
    '     name 名稱、image 圖片路徑、desc 說明、where 在哪裡拿到（只能在戰鬥區域取得的才會用到）\n' +
    '   style：開發工坊的外觀（沒寫的就用預設值，見 js/workshop-config.js 的 WORKSHOP_STYLE_DEFAULT） */\n' +
    'const WORKSHOP_CONFIG = ' + JSON.stringify({ items, style }, null, 2) + ';\n';
}
document.getElementById('downloadFile').addEventListener('click', () => {
  const blob = new Blob([exportText()], { type: 'text/javascript' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'workshop.js'; a.click(); URL.revokeObjectURL(a.href);
  setStatus('已下載 workshop.js，請把它覆蓋到 data/workshop.js');
});
document.getElementById('resetFile').addEventListener('click', () => {
  if (!confirm('確定丟掉還沒存到專案的修改，改回 data/workshop.js 檔案裡的內容？')) return;
  try { localStorage.removeItem(WS_DRAFT_KEY); } catch (_) {}
  cfg = fromFile(); renderAll(); setStatus('已改回檔案裡的內容');
});
ProjectSave.attach({
  after: ['downloadFile'],
  files: [{ path: 'data/workshop.js', label: '開發工坊', text: exportText }],
  status: (m, err) => setStatus(m, err),
});

function renderAll() { renderList(); renderItemForm(); renderStyleForm(); renderPreview(); }
renderAll();
// 暫存跟檔案不一樣＝上次有改了還沒存（存過的就不提醒）
const fileText = (() => { const keep = cfg; cfg = fromFile(); const t = exportText(); cfg = keep; return t; })();
if (exportText() !== fileText) setStatus('已讀取上次還沒存到專案的修改（要丟掉請按「從檔案重設」）');
