/* ===== 🧑‍🚀 Y102隊員裝備／技能編輯器（隊員裝備技能編輯器.html）=====
   中間嵌一個真的遊戲畫面（iframe：塔防原型.html?squadedit=1，T-Pad 一直開在「Y102隊員」），
   在上面點東西選取、拖曳移動、拖右下角改大小；右邊調位置、大小、字級、對齊、介面文字，每一項都有「置中」「恢復預設」。
   左邊三個分頁：版面（所有可以調的東西）、技能內容（每位隊員每一格技能）、裝備清單（隊員裝備：新增、修改、刪除）。
   存檔：data/squad-layout.js（版面）、data/squad-skills.js（技能內容）、data/squad-gear.js（隊員裝備）。遊戲那邊的程式在 js/squad-page.js 最下面。
   Ctrl+Z／Ctrl+Y：上一步／下一步（記在這個頁面裡，重新整理就清掉）。
*/
const SQ_DRAFT_KEY = 'tudrc_squad_editor_draft_v1';
const $q = id => document.getElementById(id);
const clone = v => JSON.parse(JSON.stringify(v));
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
let state = (() => {   // { layout: { elements, texts }, skills: { members }, gear: [...] }
  const file = {
    layout: typeof SQUAD_LAYOUT !== 'undefined' ? SQUAD_LAYOUT : {},
    skills: typeof SQUAD_SKILLS !== 'undefined' ? SQUAD_SKILLS : {},
    gear: typeof SQUAD_GEAR !== 'undefined' ? SQUAD_GEAR : [],
  };
  const d = typeof DraftSync !== 'undefined' ? DraftSync.load(SQ_DRAFT_KEY, file, { label: 'Y102隊員頁' }) : null;
  const out = clone(d && d.layout ? d : file);
  out.layout = out.layout || {}; out.layout.elements = out.layout.elements || {}; out.layout.texts = out.layout.texts || {};
  out.skills = out.skills || {}; out.skills.members = out.skills.members || {}; out.gear = Array.isArray(out.gear) ? out.gear : [];
  return out;
})();
let selKey = null, play = false, page = 'skills', leftTab = 'parts', parts = [], members = [], nodes = [], skillMember = null, skillNode = null, gearSel = null;
const info = {};   // 遊戲畫面量到的：info[key] = { visible, count, values, text, skill }
const ALIGN_NAMES = { left: '靠左', center: '置中', right: '靠右' };
// 「複製當前數值」記下來的（下面的 copyLayout／pasteLayout）；記在瀏覽器裡，重新整理也還在
const CLIP_STORE = 'tudrc_squad_editor_layout_clip';
let layoutClip = null;   // { from：從哪裡複製的（名稱）, v：{ x, y, w, h, size, font, align } }
try { layoutClip = JSON.parse(localStorage.getItem(CLIP_STORE) || 'null'); } catch (_) {}
function setStatus(msg, err = false) { $q('status').textContent = msg; $q('status').classList.toggle('err', !!err); }
function saveDraft() { try { localStorage.setItem(SQ_DRAFT_KEY, JSON.stringify(state)); } catch (_) {} }
const partOf = key => parts.find(p => p.key === key) || { key, label: key, group: '', kind: /^img\.|Img:|Icon:/.test(key) ? 'img' : /^(roster|g?node|gearSlot|lookSlot|avail):|^box\.(job|skillIcon|lockIcon)$|^btn\.switchG?$/.test(key) ? 'box' : '' };
const labelOf = key => partOf(key).label;
// @隊員/技能格＝只套用在那一格（例如技能效果的字）：還沒調過就照大家共用的那一份
const baseKeyOf = key => {   // 每格各自的（@隊員/格子）沒調時照哪一份：補充說明先看分組的（@trait／@other，有調過的話），再看大家共用的
  if (!key.includes('@')) return null;
  const [b, who] = key.split('@'), id = who.split('/')[1], g = b === 'text.skillNote' && id ? b + '@' + (id === 'trait-1' ? 'trait' : 'other') : null;
  return g && state.layout.elements[g] ? g : b;
};
const elOf = key => state.layout.elements[key] || (baseKeyOf(key) ? state.layout.elements[baseKeyOf(key)] || {} : {});
const isImg = key => partOf(key).kind === 'img';
const isBox = key => partOf(key).kind === 'box';   // 方形的框：大小＝寬＝高
const isText = key => !isImg(key) && !isBox(key) && /^(text|btn|stat(Label|Value)|gearSlotName|lookSlotName)/.test(key);
const isChanged = key => !!state.layout.elements[key] || !!state.layout.texts[key];

// ---- 上一步／下一步（Ctrl+Z／Ctrl+Y）：每次修改之前記下整份設定；連續的同一種修改只記一次 ----
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
  saveDraft(); sendState(); renderLeft(); renderProps(); renderUndo();
  setStatus(msg === 'undo' ? '↶ 回到上一步（還沒存到專案）' : '↷ 重做下一步（還沒存到專案）');
}
const undo = () => stepHistory(undoStack, redoStack, 'undo'), redo = () => stepHistory(redoStack, undoStack, 'redo');
function renderUndo() { $q('undoBtn').disabled = !undoStack.length; $q('redoBtn').disabled = !redoStack.length; }
$q('undoBtn').addEventListener('click', undo); $q('redoBtn').addEventListener('click', redo);
document.addEventListener('keydown', e => {
  if (!(e.ctrlKey || e.metaKey)) return;
  const k = e.key.toLowerCase();
  if (k === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
  else if (k === 'y' || (k === 'z' && e.shiftKey)) { e.preventDefault(); redo(); }
}, true);

// ---- 版面：改位置／大小（空白、0 的欄位拿掉，檔案比較乾淨）----
function setEl(key, patch, send = true) {
  const o = { ...elOf(key), ...patch }, clean = {};
  for (const k of ['x', 'y']) if (Math.round(+o[k] || 0)) clean[k] = Math.round(+o[k]);
  for (const k of ['w', 'h', 'size', 'font']) if (+o[k] > 0) clean[k] = Math.round(+o[k]);
  if (o.align) clean.align = o.align;
  const bk = baseKeyOf(key);
  if (bk) {   // 每格各自的：位置 0 也要記（才蓋得過共用的位移）；跟共用的一模一樣＝不用另外記
    clean.x = Math.round(+o.x || 0); clean.y = Math.round(+o.y || 0);
    const b = state.layout.elements[bk] || {}, same = ['x', 'y', 'w', 'h', 'size', 'font', 'align'].every(k => (clean[k] || 0) === (b[k] || 0));
    if (same) delete state.layout.elements[key]; else state.layout.elements[key] = clean;
  } else if (Object.keys(clean).length) state.layout.elements[key] = clean; else delete state.layout.elements[key];
  saveDraft(); if (send) sendState(); if (leftTab === 'parts') renderLeft(); renderProps(false);
}
function setText(t, value) {
  const v = value === t.original ? '' : value;
  if (v) state.layout.texts[t.k] = v; else delete state.layout.texts[t.k];
  t.value = v; saveDraft(); sendState(); if (leftTab === 'parts') renderLeft();
}

// ---- 左邊：版面清單／技能內容／裝備清單 ----
const openGroups = new Set(['面板區域']);
document.querySelector('.tabs').addEventListener('click', e => {
  const b = e.target.closest('[data-tab]'); if (!b) return;
  leftTab = b.dataset.tab; document.querySelectorAll('[data-tab]').forEach(x => x.classList.toggle('on', x === b)); renderLeft();
});
function renderLeft() {
  const box = $q('leftBody'), scroll = box.scrollTop;
  if (leftTab === 'parts') box.innerHTML = partsHtml();
  else if (leftTab === 'skills') box.innerHTML = skillsHtml();
  else box.innerHTML = gearHtml();
  box.scrollTop = scroll;
  if (leftTab === 'skills' || leftTab === 'gear') fillContentFields();
}
function partsHtml() {
  if (!parts.length) return '<p class="empty">等遊戲畫面載入…</p>';
  const groups = new Map();
  for (const p of parts) { if (!groups.has(p.group)) groups.set(p.group, []); groups.get(p.group).push(p.key); }
  let html = '';
  for (const [group, keys] of groups) {
    const changed = keys.filter(isChanged).length;
    html += '<details data-group="' + esc(group) + '"' + (openGroups.has(group) || keys.includes(selKey) ? ' open' : '') + '><summary>' + esc(group) + (changed ? '（調整過 ' + changed + '）' : '') + '</summary><div class="list">' +
      keys.map(key => '<button type="button" data-key="' + esc(key) + '" class="' + (key === selKey ? 'on' : '') + '">' + esc(labelOf(key)) + (isChanged(key) ? '<em>已調整</em>' : '') + '</button>').join('') + '</div></details>';
  }
  return html;
}
$q('leftBody').addEventListener('toggle', e => { const d = e.target; if (d.dataset && d.dataset.group) { if (d.open) openGroups.add(d.dataset.group); else openGroups.delete(d.dataset.group); } }, true);

// 技能內容：選隊員、選格子，下面改名稱、說明、效果、圖示、價格、數值
const MOD_PATHS = () => Object.entries(typeof STAT_MOD_NAMES !== 'undefined' ? STAT_MOD_NAMES : {});
function modsHtml(mods, prefix) {
  return '<div class="mods">' + (mods || []).map((m, i) => {
    const known = MOD_PATHS().some(([p]) => p === m.path);
    return '<div class="mod" data-mod="' + i + '"><select data-' + prefix + '-mod="path">' + MOD_PATHS().map(([p, v]) => '<option value="' + p + '"' + (p === m.path ? ' selected' : '') + '>' + esc(v.name) + '</option>').join('') +
      (known ? '' : '<option value="' + esc(m.path) + '" selected>' + esc(m.path) + '</option>') + '</select>' +
      '<select data-' + prefix + '-mod="op"><option value="mul"' + (m.mul != null ? ' selected' : '') + '>乘</option><option value="add"' + (m.mul == null ? ' selected' : '') + '>加</option></select>' +
      '<input type="number" step="0.01" data-' + prefix + '-mod="val" value="' + (m.mul != null ? m.mul : m.add != null ? m.add : 0) + '"><button type="button" class="danger" data-' + prefix + '-mod-del title="拿掉">×</button></div>';
  }).join('') + '<button type="button" class="small" data-' + prefix + '-mod-add>＋ 加一個數值效果</button></div>' +
  '<div class="orig">「乘」1.1＝+10%、0.8＝−20%；「加」直接加上去（防禦、命中、大招這幾個用小數：0.05＝+5%）</div>';
}
function readMods(container, prefix) {
  return [...container.querySelectorAll('.mod')].map(row => {
    const path = row.querySelector('[data-' + prefix + '-mod="path"]').value, op = row.querySelector('[data-' + prefix + '-mod="op"]').value, val = Number(row.querySelector('[data-' + prefix + '-mod="val"]').value) || 0;
    return op === 'mul' ? { path, mul: val } : { path, add: val };
  });
}
const savedNode = (m, id) => (state.skills.members[m] || {})[id] || null;
function currentNode() {   // 編輯中的那一格：存過的優先，沒有就用遊戲那邊算出來的（舊版換算）
  if (!skillMember || !skillNode) return null;
  const s = savedNode(skillMember, skillNode); if (s) return s;
  const inf = Object.values(info).find(i => i.skill && i.skill.member === skillMember && i.skill.id === skillNode);
  return inf ? inf.skill.node : null;
}
const memberOf = id => members.find(m => m.id === id) || {};
const memberNodes = id => memberOf(id).nodes || nodes;   // 這位隊員的技能樹有哪幾格（嚮導只有 8 格）
const nodeKey = id => (memberOf(skillMember).guide ? 'gnode:' : 'node:') + id;   // 嚮導的技能格在畫面上是 gnode:
function skillsHtml() {
  if (!members.length) return '<p class="empty">等遊戲畫面載入…</p>';
  if (!skillMember) skillMember = members[0].id;
  if (skillNode && !memberNodes(skillMember).some(n => n.id === skillNode)) skillNode = null;   // 換到嚮導：拿掉的格子不能選
  let h = '<label class="field">隊員<select id="skMember">' + members.map(m => '<option value="' + m.id + '"' + (m.id === skillMember ? ' selected' : '') + '>' + esc(m.name) + (state.skills.members[m.id] ? '（改過）' : '') + '</option>').join('') + '</select></label>' +
    '<div class="nodes">' + memberNodes(skillMember).map(n => '<button type="button" data-node="' + n.id + '" class="' + (n.id === skillNode ? 'on ' : '') + (savedNode(skillMember, n.id) ? 'saved' : '') + '">' + esc(n.tag) + '<br><small>' + n.id + '</small></button>').join('') + '</div>';
  const node = currentNode();
  if (!skillNode) return h + '<p class="note" style="margin-top:10px">選一格技能來改內容（中間的畫面會跟著顯示）。綠字＝改過。</p>';
  if (!node) return h + '<p class="note" style="margin-top:10px">讀取中…</p>';
  h += '<div class="sec"><div class="sec-head">' + esc((memberNodes(skillMember).find(n => n.id === skillNode) || {}).tag || skillNode) + '<span class="sp"></span>' + (savedNode(skillMember, skillNode) ? '<button type="button" class="small" id="skReset">↺ 恢復預設</button>' : '') + '</div>' +
    '<label class="field">名稱<input type="text" data-sk="name"></label>' +
    '<label class="field">技能描述（滑鼠停在技能圖示上時顯示）<textarea data-sk="desc" rows="3"></textarea></label>' +
    '<label class="field">技能效果（顯示的數值文字；空白＝依下面的數值自動產生）<input type="text" data-sk="effect"></label>' +
    '<label class="field">技能效果 2（第二段亮綠色字；空白＝不顯示）<textarea data-sk="effect2" rows="2"></textarea></label>' +
    '<label class="field">補充說明（技能本身的詳細說明，顯示在下方技能說明欄；空白＝不顯示）<textarea data-sk="note" rows="2"></textarea></label>' +
    '<div class="two"><label class="field">圖示（emoji 或圖片路徑）<input type="text" data-sk="icon" placeholder="空白＝預設圖示"></label>' +
    '<label class="field">價格（異質碎片）<input type="number" min="0" step="1" data-sk="cost"' + (skillNode === 'trait-1' ? ' disabled title="Lv1 一開始就會"' : '') + '></label></div>' +
    '<div class="field">實際改的數值' + modsHtml(node.mods, 'sk') + '</div>' +
    (node.active ? activeHtml(node.active) : '') + '</div>';
  return h;
}
// ---- 嚮導會自己發動的技能（群體補血、增益、大招…）：技能內容的 active，js/guide-skills.js 照這裡的數字執行 ----
// 畫面上用好懂的單位：HP 條件、增益都用 %（50＝50%），存檔時換回小數（0.5）
const ACT_WHEN = { hpBelow: '有隊友 HP 低於幾 %', taintAbove: '有隊友負荷幾以上', combat: '戰鬥中（8 格內有怪物）定時發動' };
function activeHtml(a) {
  const num = (k, label, v, step = 1) => '<label class="field">' + label + '<input type="number" min="0" step="' + step + '" data-act="' + k + '" value="' + (v != null ? v : 0) + '"></label>';
  const chk = (k, label, v) => '<label class="field chk" style="display:flex;align-items:center;gap:6px"><input type="checkbox" style="width:auto;margin:0" data-act="' + k + '"' + (v ? ' checked' : '') + '> ' + label + '</label>';
  const pct = v => Math.round((v || 0) * 100), b = a.buff || {};
  return '<div class="field" style="margin-top:10px"><b>自動發動的技能（實際功能）</b><div class="orig">改這裡的數字，遊戲裡的效果就跟著變；上面「技能效果」「補充說明」空白的話，文字也會自動跟著變</div></div>' +
    '<label class="field">什麼時候發動<select data-act="when">' + Object.entries(ACT_WHEN).map(([k, v]) => '<option value="' + k + '"' + (a.when === k ? ' selected' : '') + '>' + v + '</option>').join('') + '</select></label>' +
    '<div class="two">' + (a.when === 'combat' ? '' : num('at', a.when === 'hpBelow' ? '條件：HP 低於幾 %' : '條件：負荷幾以上（滿 100）', a.when === 'hpBelow' ? pct(a.at) : a.at)) +
      (a.when === 'taintAbove' ? chk('orBerserk', '有人暴走也發動', a.orBerserk) : '') + '</div>' +
    '<div class="two">' + num('heal', '回復 HP', a.heal) + num('soothe', '降低負荷', a.soothe) + '</div>' +
    '<div class="two">' + chk('one', '只幫最需要的一個人（不勾＝全隊）', a.one) + chk('wake', '暴走的隊員立刻清醒', a.wake) + '</div>' +
    '<div class="two">' + num('buff.atk', '增益：攻擊力 +%', pct(b.atk)) + num('buff.def', '增益：防禦率 +%', pct(b.def)) + '</div>' +
    '<div class="two">' + num('buff.spd', '增益：攻擊速度 +%', pct(b.spd)) + num('time', '增益持續幾秒', a.time, .5) + '</div>' +
    '<div class="two">' + num('cast', '詠唱幾秒（0＝馬上放）', a.cast, .5) + num('sp', '花多少 SP', a.sp) + '</div>' +
    num('cd', a.when === 'combat' ? '每幾秒發動一次' : '冷卻幾秒', a.cd, .5);
}
function readActive(box) {
  const v = k => { const el = box.querySelector('[data-act="' + k + '"]'); return !el ? 0 : el.type === 'checkbox' ? el.checked : el.tagName === 'SELECT' ? el.value : Math.max(0, +el.value || 0); };
  const a = { when: v('when') }, put = (k, x) => { if (x) a[k] = x; };
  if (a.when !== 'combat') put('at', a.when === 'hpBelow' ? v('at') / 100 : v('at'));
  if (a.when === 'taintAbove') put('orBerserk', v('orBerserk'));
  put('heal', v('heal')); put('soothe', v('soothe')); put('one', v('one')); put('wake', v('wake'));
  const buff = {}; for (const k of ['atk', 'def', 'spd']) if (v('buff.' + k)) buff[k] = v('buff.' + k) / 100;
  if (Object.keys(buff).length) { a.buff = buff; put('time', v('time')); }
  put('cast', v('cast')); put('sp', v('sp')); put('cd', v('cd'));
  return a;
}
function gearHtml() {
  let h = '<div class="btns" style="margin-top:0"><button type="button" class="primary" id="gearAdd">＋ 新增裝備</button></div><div class="list" style="margin-top:8px">' +
    state.gear.map(g => '<button type="button" data-gear="' + esc(g.id) + '" class="' + (g.id === gearSel ? 'on' : '') + '"><img src="' + esc(squadGearImage(g)) + '" alt="">' + esc(g.name || g.id) + '<em>$' + (g.price || 0) + '</em></button>').join('') + '</div>';
  const g = state.gear.find(x => x.id === gearSel);
  if (!g) return h + '<p class="note" style="margin-top:10px">選一件裝備來改。溫特在便利商店「隊員裝備」分頁用經費買；價格 0＝商店不賣。</p>';
  h += '<div class="sec"><div class="sec-head">' + esc(g.name || g.id) + '<span class="sp"></span><button type="button" class="small danger" id="gearDel">刪除這件</button></div>' +
    '<label class="field">名稱<input type="text" data-gf="name"></label>' +
    '<div class="two"><label class="field">圖示 emoji（沒有圖片時用）<input type="text" data-gf="icon"></label><label class="field">價格（經費 $）<input type="number" min="0" step="1" data-gf="price"></label></div>' +
    '<label class="field">圖片路徑（可不填，例：images/items/xxx.png）<input type="text" data-gf="image"></label>' +
    '<label class="field">裝備說明<textarea data-gf="desc" rows="3"></textarea></label>' +
    '<label class="field">裝備數值（顯示的文字；空白＝依下面的數值自動產生）<input type="text" data-gf="effect"></label>' +
    '<div class="field">實際改的數值' + modsHtml(g.mods, 'gf') + '</div>' +
    '<div class="orig">代號：' + esc(g.id) + '（存檔、背包用，建立後不要改）</div></div>';
  return h;
}
function fillContentFields() {
  const box = $q('leftBody');
  if (leftTab === 'skills') {
    const node = currentNode(); if (!node) return;
    for (const f of ['name', 'desc', 'effect', 'effect2', 'note', 'icon', 'cost']) { const el = box.querySelector('[data-sk="' + f + '"]'); if (el && document.activeElement !== el) el.value = node[f] != null ? node[f] : ''; }
    const auto = node.active ? guideActiveTexts(node.active) : null;   // 嚮導會自己發動的技能：空白時自動產生的字
    const eff = box.querySelector('[data-sk="effect"]'); if (eff) eff.placeholder = (auto ? auto.effect : modsText(node.mods)) || '（沒有數值效果）';
    const note = box.querySelector('[data-sk="note"]'); if (note) note.placeholder = auto ? auto.note : '';
  } else if (leftTab === 'gear') {
    const g = state.gear.find(x => x.id === gearSel); if (!g) return;
    for (const f of ['name', 'icon', 'price', 'image', 'desc', 'effect']) { const el = box.querySelector('[data-gf="' + f + '"]'); if (el && document.activeElement !== el) el.value = g[f] != null ? g[f] : ''; }
    const eff = box.querySelector('[data-gf="effect"]'); if (eff) eff.placeholder = modsText(g.mods) || '（沒有數值效果）';
  }
}
// 技能內容改了：整格存成一份（第一次改時，從遊戲算出來的內容複製一份）
function updateSkill(mutate, tag) {
  const base = currentNode(); if (!base) return;
  remember(tag);
  const m = state.skills.members[skillMember] || (state.skills.members[skillMember] = {});
  const node = clone(m[skillNode] || base); mutate(node);
  if (skillNode === 'trait-1') node.cost = 0;
  m[skillNode] = node;
  saveDraft(); sendState();
}
function updateGear(mutate, tag) {
  const g = state.gear.find(x => x.id === gearSel); if (!g) return;
  remember(tag); mutate(g); saveDraft(); sendState();
}
$q('leftBody').addEventListener('click', e => {
  const t = e.target;
  const k = t.closest('[data-key]'); if (k) { select(k.dataset.key); return; }
  const n = t.closest('[data-node]');
  if (n) { skillNode = n.dataset.node; toGame({ type: 'member', member: skillMember, node: skillNode }); select(nodeKey(skillNode)); renderLeft(); return; }
  if (t.id === 'skReset') { remember(); const m = state.skills.members[skillMember]; if (m) { delete m[skillNode]; if (!Object.keys(m).length) delete state.skills.members[skillMember]; } saveDraft(); sendState(); renderLeft(); setStatus('這格技能恢復預設（還沒存到專案）'); return; }
  if (t.matches('[data-sk-mod-add]')) { updateSkill(nd => { nd.mods = (nd.mods || []).concat([{ path: 'dmg', mul: 1.1 }]); }); renderLeft(); return; }
  if (t.matches('[data-sk-mod-del]')) { const i = Number(t.closest('.mod').dataset.mod); updateSkill(nd => { nd.mods.splice(i, 1); }); renderLeft(); return; }
  const g = t.closest('[data-gear]'); if (g) { gearSel = g.dataset.gear; renderLeft(); return; }
  if (t.id === 'gearAdd') {
    remember(); let i = 1; while (state.gear.some(x => x.id === 'sg-new' + i)) i++;
    const ng = { id: 'sg-new' + i, name: '新裝備 ' + i, icon: '🎽', image: '', price: 100, desc: '', effect: '', mods: [{ path: 'dmg', mul: 1.05 }] };
    state.gear.push(ng); gearSel = ng.id; saveDraft(); sendState(); renderLeft(); setStatus('新增了一件裝備（還沒存到專案）'); return;
  }
  if (t.id === 'gearDel') {
    const g2 = state.gear.find(x => x.id === gearSel); if (!g2 || !confirm('刪除「' + (g2.name || g2.id) + '」？已經買了、穿著的玩家會失去這件裝備。（可以按 Ctrl+Z 回來）')) return;
    remember(); state.gear = state.gear.filter(x => x.id !== gearSel); gearSel = null; saveDraft(); sendState(); renderLeft(); return;
  }
  if (t.matches('[data-gf-mod-add]')) { updateGear(g2 => { g2.mods = (g2.mods || []).concat([{ path: 'dmg', mul: 1.05 }]); }); renderLeft(); return; }
  if (t.matches('[data-gf-mod-del]')) { const i = Number(t.closest('.mod').dataset.mod); updateGear(g2 => { g2.mods.splice(i, 1); }); renderLeft(); return; }
});
$q('leftBody').addEventListener('input', e => {
  const t = e.target;
  if (t.dataset.sk) { const f = t.dataset.sk; updateSkill(nd => { nd[f] = f === 'cost' ? Math.max(0, Math.round(+t.value || 0)) : t.value; }, 'sk:' + skillMember + skillNode + f); syncRightSkill(); return; }
  if (t.matches('[data-sk-mod]')) { const box = t.closest('.mods'); updateSkill(nd => { nd.mods = readMods(box, 'sk'); }, 'skmod:' + skillMember + skillNode); fillContentFields(); return; }
  if (t.dataset.act) {   // 嚮導自動發動的技能：改數字
    const box = t.closest('.sec'); updateSkill(nd => { nd.active = readActive(box); }, 'skact:' + skillMember + skillNode + t.dataset.act);
    if (t.dataset.act === 'when') renderLeft(); else fillContentFields();   // 換發動條件：欄位不一樣，整個重畫
    return;
  }
  if (t.dataset.gf) { const f = t.dataset.gf; updateGear(g => { g[f] = f === 'price' ? Math.max(0, Math.round(+t.value || 0)) : t.value; }, 'gf:' + gearSel + f); return; }
  if (t.matches('[data-gf-mod]')) { const box = t.closest('.mods'); updateGear(g => { g.mods = readMods(box, 'gf'); }, 'gfmod:' + gearSel); fillContentFields(); return; }
});
$q('leftBody').addEventListener('change', e => {
  if (e.target.id === 'skMember') { skillMember = e.target.value; toGame({ type: 'member', member: skillMember, node: skillNode || undefined }); renderLeft(); return; }
  if (e.target.matches('[data-sk-mod], [data-gf-mod]')) { /* 下拉選單用 input 事件已經處理 */ }
  if (leftTab === 'gear' && e.target.dataset.gf) renderLeft();   // 名稱、圖示、價格改完：更新清單
});

// ---- 右邊：版面調整 ----
const num = (f, label) => '<label>' + label + '<input type="number" step="1" data-f="' + f + '"></label>';
function renderProps(rebuild = true) {
  const box = $q('props');
  if (!selKey) { box.innerHTML = '<p class="empty">先在左邊清單或中間的畫面上選一個東西</p>'; return; }
  const inf = info[selKey] || {}, t = inf.text, sk = SKILL_TEXT_KEY.test(selKey) && inf.skill;
  const sig = selKey + '|' + (t ? t.k : '-') + '|' + (sk ? sk.member + sk.id : '-') + '|' + (inf.gearText ? inf.gearText.kind + ':' + inf.gearText.id : '-');   // 換了技能、換了顯示的裝備：右邊重畫
  if (rebuild || box.dataset.sig !== sig) {
    box.dataset.sig = sig;
    let html = '<div class="sel-name">' + esc(labelOf(selKey)) + '</div><div class="sel-sub" id="selSub"></div>' +
      '<div class="sec"><div class="sec-head">位置（往右／往下為正，px）<span class="sp"></span><button type="button" class="small" data-reset="pos">↺ 恢復預設</button></div>' +
      '<div class="two">' + num('x', 'X') + num('y', 'Y') + '</div>' +
      '<div class="btns"><button type="button" class="small" data-move="ArrowLeft" title="往左 1px（Shift＝10px）">←</button><button type="button" class="small" data-move="ArrowUp" title="往上 1px（Shift＝10px）">↑</button>' +
      '<button type="button" class="small" data-move="ArrowDown" title="往下 1px（Shift＝10px）">↓</button><button type="button" class="small" data-move="ArrowRight" title="往右 1px（Shift＝10px）">→</button><span class="orig" style="margin:0">微調 1px（按住 Shift＝10px）</span></div>' +
      '<div class="btns"><button type="button" class="small" data-center="both">⊕ 置中</button><button type="button" class="small" data-center="x">↔ 水平置中</button><button type="button" class="small" data-center="y">↕ 垂直置中</button></div>' +
      '<div class="btns"><button type="button" class="small" id="copyLayout">📋 複製當前數值</button><button type="button" class="small" id="pasteLayout"' + (layoutClip ? '' : ' disabled') + '>📥 貼上複製數值</button></div>' +
      '<div class="orig" id="clipInfo"></div>' +
      '<div class="orig">置中＝放到外面那一層框的正中間</div></div>' +
      (isImg(selKey) || isBox(selKey)
        ? '<div class="sec"><div class="sec-head">大小（px，長寬等比例）<span class="sp"></span><button type="button" class="small" data-reset="size">↺ 恢復預設</button></div>' +
          '<div class="one">' + num('size', isBox(selKey) ? '寬＝高（長寬一起，1px 一格）' : '寬（高度照圖片比例，1px 一格）') + '</div></div>'
        : '<div class="sec"><div class="sec-head">大小（px，空白＝原本）<span class="sp"></span><button type="button" class="small" data-reset="size">↺ 恢復預設</button></div>' +
          '<div class="two">' + num('w', '寬') + num('h', '高') + '</div></div>');
    if (isText(selKey)) html +=
      '<div class="sec"><div class="sec-head">文字大小與對齊<span class="sp"></span><button type="button" class="small" data-reset="font">↺ 恢復預設</button></div>' +
      '<div class="two">' + num('font', '字級（px，空白＝原本）') + '<label>對齊<span class="btns" style="margin:0">' +
      ['left', 'center', 'right'].map(a => '<button type="button" class="small" data-align="' + a + '">' + ALIGN_NAMES[a] + '</button>').join('') + '</span></label></div></div>';
    if (t) html += '<div class="sec"><div class="sec-head">文字內容<span class="sp"></span><button type="button" class="small" data-reset="text">↺ 恢復預設</button></div>' +
      '<textarea data-text rows="2"></textarea><div class="orig">' + esc(t.scope || '') + '（按 Enter 換行，畫面上也會跟著換行）</div><div class="orig" id="textOrig"></div></div>';
    else if (sk) html += '<div class="sec"><div class="sec-head">文字內容（' + esc(sk.memberName) + '・' + esc(sk.tag) + '）<span class="sp"></span><button type="button" class="small" data-reset="skill">↺ 恢復預設</button></div>' +
      '<label class="field">名稱<input type="text" data-psk="name"></label>' +
      '<label class="field">技能描述（滑鼠停在技能圖示上時顯示）<textarea data-psk="desc" rows="3"></textarea></label>' +
      '<label class="field">技能效果（空白＝依數值自動產生）<input type="text" data-psk="effect"></label>' +
      '<label class="field">技能效果 2（第二段亮綠色字；空白＝不顯示）<textarea data-psk="effect2" rows="2"></textarea></label>' +
      '<label class="field">補充說明（技能本身的詳細說明，顯示在下方技能說明欄；空白＝不顯示）<textarea data-psk="note" rows="2"></textarea></label>' +
      '<div class="orig">只改這位隊員的這一格；跟左邊「技能內容」改的是同一份</div></div>';
    else if (/^text\.(name|intro|role|ability|status)$|^text\.skill|^text\.(desc|stat)$/.test(selKey)) html += '<div class="sec"><div class="note">這段文字每個隊員／每格技能都不一樣：' +
      (/skill/.test(selKey) ? '到左邊「技能內容」改。' : /^text\.(desc|stat)$/.test(selKey) ? '到左邊「裝備清單」改。' : '名字、簡介在「角色資料頁」改。') + '</div></div>';
    if (inf.skill && !sk) html += '<div class="sec"><div class="note">這是「' + esc(inf.skill.memberName) + '」的「' + esc(inf.skill.node.name) + '」。<br><button type="button" class="small" id="goSkill">到「技能內容」改這格技能</button></div></div>';
    if (inf.gearText) html += gearTextHtml(inf.gearText);   // 裝備說明／裝備數值：改現在顯示的那一件
    html += '<div class="actions" style="margin-top:12px"><button type="button" class="danger" id="resetOne">這一個全部恢復預設</button></div>';
    box.innerHTML = html;
  }
  const o = elOf(selKey), v = inf.values || {};
  const set = (f, val, ph) => { const el = box.querySelector('[data-f="' + f + '"]'); if (!el) return; if (document.activeElement !== el) el.value = val; if (ph != null) el.placeholder = ph; };
  set('x', o.x || 0); set('y', o.y || 0);
  set('w', o.w || '', v.w != null ? '原本 ' + v.w : '原本'); set('h', o.h || '', v.h != null ? '原本 ' + v.h : '原本');
  set('size', o.size || '', v.size != null ? '原本 ' + v.size : '原本');
  set('font', o.font || '', v.font != null ? '原本 ' + v.font : '原本');
  box.querySelectorAll('[data-align]').forEach(b => b.classList.toggle('on', (o.align || '') === b.dataset.align));
  const clip = $q('clipInfo'); if (clip) clip.textContent = layoutClip ? '已複製「' + layoutClip.from + '」：' + clipText(layoutClip.v) : '複製後，換到別頁選同一個區塊，按「貼上」就套用一樣的位置、大小、字級';
  const sub = $q('selSub');
  if (sub) sub.textContent = [inf.visible === false ? '（現在畫面上看不到）' : '', inf.count > 1 ? '同名的有 ' + inf.count + ' 個，一起調整' : ''].filter(Boolean).join('　');
  const ta = box.querySelector('[data-text]');
  if (ta && t) { if (document.activeElement !== ta) ta.value = t.value || t.original || ''; /* 沒改過＝先填原本的字，直接在上面改 */ ta.placeholder = t.original || ''; $q('textOrig').textContent = '預設：' + (t.original || '（空白）'); }
  if (inf.gearText) fillGearText(box, inf.gearText);
  if (sk) {
    const node = savedNode(sk.member, sk.id) || sk.node;
    box.querySelectorAll('[data-psk]').forEach(el => { if (document.activeElement !== el) el.value = node[el.dataset.psk] != null ? node[el.dataset.psk] : ''; });
    const auto = node.active && typeof guideActiveTexts === 'function' ? guideActiveTexts(node.active) : null;   // 跟左邊「技能內容」同一套：空白時自動產生的字
    const eff = box.querySelector('[data-psk="effect"]'); if (eff) eff.placeholder = (auto ? auto.effect : modsText(node.mods)) || '（沒有數值效果）';
    const nt = box.querySelector('[data-psk="note"]'); if (nt) nt.placeholder = auto ? auto.note : '';
  }
}
// 左邊「技能內容」改了字：右邊選著的如果是同一格技能，欄位也跟著更新（反過來右邊改，左邊也會更新）
function syncRightSkill() { const s = (info[selKey] || {}).skill; if (s && s.member === skillMember && s.id === skillNode) renderProps(false); }
// ---- 裝備頁下方的「裝備說明」「裝備數值」：選到那兩塊時，右邊直接改現在顯示的那一件 ----
// 隊員裝備：說明＝裝備清單裡的說明；數值＝實際改的數值（mods），顯示的文字照數值自動產生 → 背包、商店、戰鬥的數值都一起變
// 外觀裝備：說明、數值都是文字（不影響戰鬥），存在 data/squad-layout.js 的 texts（lookDesc:／lookStat:）
function gearTextHtml(g) {
  if (g.kind === 'gear') {
    const item = state.gear.find(x => x.id === g.id); if (!item) return '';
    return '<div class="sec"><div class="sec-head">裝備內容（' + esc(item.name || item.id) + '）</div>' +
      '<label class="field">裝備說明<textarea data-gt="desc" rows="3"></textarea></label>' +
      '<div class="field">裝備數值（實際改的數值；顯示的文字照這裡自動產生）' + modsHtml(item.mods, 'gt') + '</div>' +
      '<div class="orig" id="gtPreview"></div><div class="orig">跟左邊「裝備清單」改的是同一份；背包、商店的說明和戰鬥中的數值都會一起變。</div></div>';
  }
  return '<div class="sec"><div class="sec-head">外觀內容（' + esc(g.name || g.id) + '）<span class="sp"></span><button type="button" class="small" data-gt-reset>↺ 恢復預設</button></div>' +
    '<label class="field">裝備說明<textarea data-gt="lookDesc" rows="2"></textarea></label>' +
    '<label class="field">裝備數值（文字；外觀裝備不影響戰鬥）<textarea data-gt="lookStat" rows="2"></textarea></label>' +
    '<div class="orig">只改這一件外觀（每件分開）</div></div>';
}
function fillGearText(box, g) {
  if (g.kind === 'gear') {
    const item = state.gear.find(x => x.id === g.id); if (!item) return;
    const d = box.querySelector('[data-gt="desc"]'); if (d && document.activeElement !== d) d.value = item.desc || '';
    const pv = $q('gtPreview'); if (pv) pv.textContent = '顯示成：' + ((item.effect || modsText(item.mods)) || '（沒有數值效果）');
    return;
  }
  for (const [f, k] of [['lookDesc', 'desc'], ['lookStat', 'stat']]) { const el = box.querySelector('[data-gt="' + f + '"]'); if (el && document.activeElement !== el) el.value = state.layout.texts[f + ':' + g.id] || g[k] || ''; }
}
// ---- 複製／貼上數值：把一個區塊的位置、大小、字級、對齊記下來，貼到另一個區塊（例如別格技能的同一段字）----
// 記在瀏覽器裡（重新整理也還在）；貼上可以按 Ctrl+Z 回來
const CLIP_KEYS = ['x', 'y', 'w', 'h', 'size', 'font', 'align'];
const clipText = v => ['X ' + (v.x || 0), 'Y ' + (v.y || 0), v.w ? '寬 ' + v.w : '', v.h ? '高 ' + v.h : '', v.size ? '大小 ' + v.size : '', v.font ? '字級 ' + v.font : '', v.align ? ALIGN_NAMES[v.align] : ''].filter(Boolean).join('、');
function copyLayout() {
  const o = elOf(selKey), v = {}; for (const k of CLIP_KEYS) if (o[k]) v[k] = o[k];
  layoutClip = { from: labelOf(selKey), v };
  try { localStorage.setItem(CLIP_STORE, JSON.stringify(layoutClip)); } catch (_) {}
  renderProps(false); const p = $q('pasteLayout'); if (p) p.disabled = false;
  setStatus('已複製「' + layoutClip.from + '」的數值');
}
function pasteLayout() {
  if (!layoutClip) return;
  remember(); const v = layoutClip.v;
  setEl(selKey, { x: v.x || 0, y: v.y || 0, w: v.w || 0, h: v.h || 0, size: v.size || 0, font: v.font || 0, align: v.align || '' });
  setStatus('已把「' + layoutClip.from + '」的數值貼到「' + labelOf(selKey) + '」（還沒存到專案）');
}
// 右邊直接改技能說明的字（名稱、描述、效果）：改的是畫面上那一格，左邊「技能內容」也一起換到那一格
const SKILL_TEXT_KEY = /^text\.(skillName|skillDesc|skillEffect2?|skillNote|lockDesc)(@|$)/;   // @隊員/技能格＝只套用在那一格的位置、大小
// 數字欄是空白（＝原本的大小）時按上下小箭頭：先填入原本的數字，再從它開始加減（不是從 0 開始）
function prefillDefault(e) {
  const el = e.target;
  if (!el.matches || !el.matches('input[type=number][data-f]') || el.value !== '') return;
  const m = /(-?\d+(?:\.\d+)?)/.exec(el.placeholder || ''); if (m) el.value = m[1];
}
$q('props').addEventListener('pointerdown', prefillDefault, true);
$q('props').addEventListener('keydown', e => { if (e.key === 'ArrowUp' || e.key === 'ArrowDown') prefillDefault(e); }, true);
$q('props').addEventListener('input', e => {
  if (!selKey) return;
  const gt = (info[selKey] || {}).gearText;
  if (gt && (e.target.dataset.gt || e.target.matches('[data-gt-mod]'))) {   // 裝備說明／裝備數值
    if (gt.kind === 'gear') {
      const item = state.gear.find(x => x.id === gt.id); if (!item) return;
      remember('gt:' + gt.id + (e.target.dataset.gt || 'mod'));
      if (e.target.dataset.gt === 'desc') item.desc = e.target.value;
      else { item.mods = readMods(e.target.closest('.mods'), 'gt'); item.effect = ''; }   // 改了數值：顯示的文字一律照數值自動產生，才不會跟實際對不上
    } else {
      const k = e.target.dataset.gt + ':' + gt.id, def = gt[e.target.dataset.gt === 'lookDesc' ? 'desc' : 'stat']; remember('gt:' + k);
      if (e.target.value && e.target.value !== def) state.layout.texts[k] = e.target.value; else delete state.layout.texts[k];
    }
    saveDraft(); sendState(); if (leftTab === 'gear') renderLeft(); fillGearText($q('props'), gt); return;
  }
  if (e.target.matches('[data-text]')) { const t = (info[selKey] || {}).text; if (t) { remember('text:' + selKey); setText(t, e.target.value); } return; }
  if (e.target.dataset.psk) {
    const s = (info[selKey] || {}).skill, f = e.target.dataset.psk; if (!s) return;
    const moved = skillMember !== s.member || skillNode !== s.id;
    skillMember = s.member; skillNode = s.id;
    updateSkill(nd => { nd[f] = e.target.value; }, 'sk:' + skillMember + skillNode + f);
    if (leftTab === 'skills') { if (moved) renderLeft(); else fillContentFields(); }
    return;
  }
  const f = e.target.dataset.f; if (!f) return;
  remember('field:' + selKey + ':' + f);
  const val = e.target.value === '' ? 0 : +e.target.value;
  setEl(selKey, { [f]: f === 'x' || f === 'y' ? val : Math.max(0, val) });
});
$q('props').addEventListener('click', e => {
  if (!selKey) return;
  const b = e.target.closest('button'); if (!b) return;
  if (b.id === 'goSkill') { const s = info[selKey].skill; skillMember = s.member; skillNode = s.id; leftTab = 'skills'; document.querySelectorAll('[data-tab]').forEach(x => x.classList.toggle('on', x.dataset.tab === 'skills')); renderLeft(); return; }
  if (b.id === 'copyLayout') { copyLayout(); return; }
  if (b.id === 'pasteLayout') { pasteLayout(); return; }
  if (b.dataset.move) { nudge(b.dataset.move, e.shiftKey); return; }
  const gt = (info[selKey] || {}).gearText;
  if (gt && (b.matches('[data-gt-mod-add], [data-gt-mod-del]') || b.hasAttribute('data-gt-reset'))) {
    remember();
    if (b.hasAttribute('data-gt-reset')) { delete state.layout.texts['lookDesc:' + gt.id]; delete state.layout.texts['lookStat:' + gt.id]; }
    else {
      const item = state.gear.find(x => x.id === gt.id); if (!item) return;
      if (b.matches('[data-gt-mod-add]')) item.mods = (item.mods || []).concat([{ path: 'dmg', mul: 1.05 }]); else item.mods.splice(Number(b.closest('.mod').dataset.mod), 1);
      item.effect = '';
    }
    saveDraft(); sendState(); if (leftTab === 'gear') renderLeft(); renderProps(); return;
  }   // ←↑↓→ 微調位置（跟方向鍵一樣）
  if (b.dataset.center || b.dataset.align || b.dataset.reset || b.id === 'resetOne') remember();
  if (b.dataset.center) { toGame({ type: 'center', key: selKey, axis: b.dataset.center }); return; }
  if (b.dataset.align) { const o = elOf(selKey); setEl(selKey, { align: o.align === b.dataset.align ? '' : b.dataset.align }); return; }
  const r = b.dataset.reset, bs = baseKeyOf(selKey) ? state.layout.elements[baseKeyOf(selKey)] || {} : {};   // 每格各自的：恢復成大家共用的那一份
  if (r === 'pos') setEl(selKey, { x: bs.x || 0, y: bs.y || 0 });
  else if (r === 'size') setEl(selKey, { w: bs.w || 0, h: bs.h || 0, size: bs.size || 0 });
  else if (r === 'font') setEl(selKey, { font: bs.font || 0, align: bs.align || '' });
  else if (r === 'text') { const t = (info[selKey] || {}).text; if (t) { setText(t, ''); renderProps(false); } }
  else if (r === 'skill') {   // 這格技能整格恢復預設（跟左邊「技能內容」的恢復預設一樣）
    const s = (info[selKey] || {}).skill, m = s && state.skills.members[s.member]; if (!m || !m[s.id]) return;
    delete m[s.id]; if (!Object.keys(m).length) delete state.skills.members[s.member];
    saveDraft(); sendState(); if (leftTab === 'skills') renderLeft(); setStatus('這格技能恢復預設（還沒存到專案）');
  }
  else if (b.id === 'resetOne') {
    delete state.layout.elements[selKey];
    const t = (info[selKey] || {}).text; if (t) setText(t, '');
    saveDraft(); sendState(); renderLeft(); renderProps();
    setStatus('「' + labelOf(selKey) + '」恢復預設（還沒存到專案）');
  }
});
$q('resetAll').addEventListener('click', () => {
  if (!confirm('確定把版面（位置、大小、介面文字）全部恢復預設？技能內容、裝備清單不會動。（可以按 Ctrl+Z 回來）')) return;
  remember(); state.layout = { elements: {}, texts: {} };
  saveDraft(); sendState(); renderLeft(); renderProps(); setStatus('版面全部恢復預設（還沒存到專案）');
});
function select(key) { selKey = key; if (leftTab === 'parts') renderLeft(); renderProps(); toGame({ type: 'select', key }); }

// ---- 中間：遊戲畫面（iframe）----
const frame = $q('game'), stageWrap = $q('stageWrap');
const GAME_W = 960, GAME_H = 700;   // iframe 用固定大小（T-Pad 剛好是最大的 888 寬），再縮放到剛好貼合框框寬度
function fitFrame() {
  const s = stageWrap.clientWidth / GAME_W;   // 框框比較寬時也會放大，T-Pad 看得比較清楚
  frame.style.width = GAME_W + 'px'; frame.style.height = GAME_H + 'px'; frame.style.transform = 'scale(' + s + ')';
  stageWrap.style.height = Math.round(GAME_H * s) + 'px';
}
window.addEventListener('resize', fitFrame); fitFrame();
if (window.ResizeObserver) new ResizeObserver(fitFrame).observe(stageWrap);   // 框框寬度一變（例如右邊出現捲軸）就重算，才不會被切到
// 跟遊戲畫面溝通一律用訊息（postMessage）：直接雙擊 HTML 打開時，瀏覽器不准這邊直接碰 iframe 裡面
const toGame = m => { try { frame.contentWindow.postMessage(Object.assign({ src: 'squadedit-editor' }, m), '*'); } catch (_) {} };
function sendState() { toGame({ type: 'state', layout: state.layout, skills: state.skills, gear: state.gear }); }
let gameReady = false;
setInterval(() => { if (!gameReady) toGame({ type: 'ping' }); }, 700);
frame.addEventListener('load', () => { gameReady = false; toGame({ type: 'ping' }); });
window.addEventListener('message', e => {
  const m = e.data; if (!m || m.src !== 'squadedit-game' || e.source !== frame.contentWindow) return;
  if (m.type === 'ready') { if (!gameReady) { gameReady = true; toGame({ type: 'setup' }); } }
  else if (m.type === 'opened') { sendState(); toGame({ type: 'page', page }); toGame({ type: 'mode', play }); if (selKey) toGame({ type: 'select', key: selKey }); }
  else if (m.type === 'parts') { parts = m.list || []; members = m.members || members; nodes = m.nodes || nodes; renderLeft(); }
  else if (m.type === 'pick') { if (m.key !== selKey) { selKey = m.key; if (leftTab === 'parts') renderLeft(); renderProps(); } }
  else if (m.type === 'info') {
    info[m.key] = m;
    if (m.skill && m.key === selKey && (m.skill.member !== skillMember || m.skill.id !== skillNode)) {   // 預覽點到技能：左邊「技能內容」也換到同一位隊員、同一格（兩邊改的是同一份）
      skillMember = m.skill.member; skillNode = m.skill.id; if (leftTab === 'skills') renderLeft();
    }
    if (m.part && !parts.some(p => p.key === m.key)) parts.push(m.part);   // 每格技能各自的（@）不在清單裡：記下名字，右邊才顯示得出來
    if (m.page && m.page !== page) { page = m.page; document.querySelectorAll('[data-page]').forEach(x => x.classList.toggle('on', x.dataset.page === page)); }
    if (m.skill && leftTab === 'skills' && m.skill.member === skillMember && m.skill.id === skillNode && !savedNode(skillMember, skillNode)) renderLeft();
    if (m.key === selKey) renderProps(false);
  }
  else if (m.type === 'move') setEl(m.key, { x: m.x, y: m.y }, false);   // 拖曳中（遊戲那邊已經先動了）
  else if (m.type === 'resize') setEl(m.key, m.size ? { size: m.size } : { w: m.w, h: m.h }, false);
  else if (m.type === 'dragstart') remember();
  else if (m.type === 'moved') setStatus('調整了「' + labelOf(m.key) + '」（還沒存到專案）');
  else if (m.type === 'arrow') nudge(m.key, m.shift);
  else if (m.type === 'undo') undo();
  else if (m.type === 'redo') redo();
  else if (m.type === 'save') sqSave.save(false);
});
document.querySelector('.modes').addEventListener('click', e => {
  const p = e.target.closest('[data-page]');
  if (p) { page = p.dataset.page; document.querySelectorAll('[data-page]').forEach(x => x.classList.toggle('on', x === p)); toGame({ type: 'page', page }); return; }
  const b = e.target.closest('[data-mode]'); if (!b) return;
  play = b.dataset.mode === 'play';
  document.querySelectorAll('[data-mode]').forEach(x => x.classList.toggle('on', x === b));
  $q('modeHint').textContent = play ? '照遊戲裡的方式點：學技能、換裝備都可以試（不會存檔）；要調整請切回編輯模式' : '點一下選取、拖曳移動；點隊員、技能、裝備格會順便換畫面';
  toGame({ type: 'mode', play });
});
function nudge(key, shift) {   // 方向鍵微調（Shift＝10px）
  if (!selKey) return;
  const n = shift ? 10 : 1, o = elOf(selKey);
  remember('nudge:' + selKey);
  setEl(selKey, { x: (o.x || 0) + (key === 'ArrowLeft' ? -n : key === 'ArrowRight' ? n : 0), y: (o.y || 0) + (key === 'ArrowUp' ? -n : key === 'ArrowDown' ? n : 0) });
}
document.addEventListener('keydown', e => {
  if (!selKey || play || !e.key.startsWith('Arrow') || (e.target && e.target.closest && e.target.closest('input, textarea, select'))) return;
  e.preventDefault(); nudge(e.key, e.shiftKey);
});

// ---- 存檔 ----
function layoutText() {
  return '/* ===== T-Pad「Y102隊員」頁的版面（由「🧑‍🚀 Y102隊員裝備／技能編輯器」匯出，整段覆蓋即可）=====\n' +
    '   elements：每個可以調整的區域／圖片／文字 → { x, y：位移（像素）, w, h：寬高（像素）, size：圖片大小（寬，高度照比例）, font：字級, align：文字對齊 }\n' +
    '   texts：改過的介面文字（標題、按鈕…）\n' +
    '   沒寫在這裡的就照原本的樣子。套用的程式在 js/squad-page.js。 */\n' +
    'const SQUAD_LAYOUT = ' + JSON.stringify({ elements: state.layout.elements, texts: state.layout.texts }, null, 2) + ';\n';
}
function skillsText() {
  return '/* ===== Y102隊員技能樹的內容（由「🧑‍🚀 Y102隊員裝備／技能編輯器」匯出，整段覆蓋即可）=====\n' +
    '   members：隊員 id → 技能格 id → { name：名稱, desc：技能描述, effect：技能效果（顯示的數值文字）, effect2：技能效果 2（第二段亮綠色字）, note：補充說明（顯示在效果下面）, icon：圖示（emoji 或圖片路徑）, cost：要花幾個異質碎片, mods：實際改的數值, active：嚮導會自己發動的技能（數字說明見 data/guide-skills.js） }\n' +
    '   技能格 id：trait-1（普通技能 Lv1＝原本的特性）、trait-2（Lv2）、a-1／a-2（A 系列－生存）、core-1～3（核心技能）、ult（終極核心大招）、b-1／b-2（B 系列－攻擊）、aux-1／aux-2（輔助技能）\n' +
    '   mods：{ path: 數值名稱, mul: 乘多少 } 或 { path, add: 加多少 }（數值名稱見 js/skills.js 開頭）\n' +
    '   這裡沒寫的隊員／格子，會從 data/skills.js（舊版技能資料）自動換算。 */\n' +
    'const SQUAD_SKILLS = ' + JSON.stringify({ members: state.skills.members }, null, 2) + ';\n';
}
function gearText() {
  return '/* ===== Y102隊員裝備（由「🧑‍🚀 Y102隊員裝備／技能編輯器」匯出，整段覆蓋即可）=====\n' +
    '   溫特在便利商店（「隊員裝備」分頁）用經費買，買了放進背包；在 T-Pad「Y102隊員」→ 裝備頁給隊員穿（每人 3 格、不分種類，一件只能給一個人穿）。\n' +
    '   每件：{ id, name：名稱, icon：沒有圖片時用的 emoji, image：圖片路徑（可不填）, price：價錢, desc：裝備說明, effect：裝備數值（顯示用；空白＝依 mods 自動產生）, mods：實際改的數值 }\n' +
    '   mods 的寫法跟技能一樣：{ path: 數值名稱, mul: 乘多少 } 或 { path, add: 加多少 }。 */\n' +
    'const SQUAD_GEAR = ' + JSON.stringify(state.gear, null, 2) + ';\n';
}
const sqSave = ProjectSave.attach({ after: [], files: [
  { path: 'data/squad-layout.js', label: 'Y102隊員頁版面', text: layoutText },
  { path: 'data/squad-skills.js', label: '技能內容', text: skillsText },
  { path: 'data/squad-gear.js', label: '隊員裝備', text: gearText },
], status: (m, err) => setStatus(m, err) });
$q('saveBtn').addEventListener('click', e => sqSave.save(e.shiftKey));
$q('downloadBtn').addEventListener('click', () => {
  for (const [name, text] of [['squad-layout.js', layoutText()], ['squad-skills.js', skillsText()], ['squad-gear.js', gearText()]]) {
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'text/javascript' })); a.download = name; a.click();
  }
  setStatus('已下載三個檔案，請覆蓋到 data/ 資料夾');
});

renderLeft(); renderProps(); renderUndo();
