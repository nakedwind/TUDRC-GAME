/* ===== 遊戲畫面 UI 的版面調整（UI編輯器.html 編輯、data/ui-layout.js 存檔）=====
   每個 UI 元素可以：移動（x、y px）、放大縮小（scale）、改透明度（opacity）、隱藏（hidden）。
   做法：照設定產生一段 CSS（<style id="uiLayoutCSS">），用 CSS 的 translate／scale 屬性疊在原本的樣式上，
   所以後來才建立的元素（例如左上隊員欄、彈藥顯示）也一樣會套用。
   要讓新的 UI 也能調整：在下面的 UI_ELEMENTS 多加一行（key 不要改，存檔用它對應）。
*/
// 細節（parts）：UI 裡面的零件，可以分開調 寬 w、高 h、文字大小 font、間距 gap、圓角 radius（px；沒填＝原本的大小）
const P = (key, label, sel, props) => ({ key, label, sel, props });
const UI_ELEMENTS = [
  // group：編輯器裡的分組；sel：CSS 選擇器；origin：放大縮小的中心點；label：顯示名稱；parts：細節
  { key: 'mission',       group: '畫面左上', label: '目前任務文字',     sel: '#missionText',             origin: 'left top', parts: [
      P('text', '主要文字', '#missionText', ['font']), P('sub', '後面的小字（｜破壞異質核心）', '#missionText .mission-secondary', ['font']) ] },
  { key: 'squadButton',   group: '畫面左上', label: 'Y102隊員 按鈕',    sel: '#squadStatusButton',       origin: 'left top', parts: [P('self', '按鈕', '#squadStatusButton', ['w', 'h', 'font', 'radius'])] },
  { key: 'teamButton',    group: '畫面左上', label: '出勤配置 按鈕',    sel: '#teamEditButton',          origin: 'left top', parts: [P('self', '按鈕', '#teamEditButton', ['w', 'h', 'font', 'radius'])] },
  { key: 'achieveButton', group: '畫面左上', label: '成就 按鈕',        sel: '#achievementButton',       origin: 'left top', parts: [P('self', '按鈕', '#achievementButton', ['w', 'h', 'font', 'radius'])] },
  { key: 'fieldSquad',    group: '畫面左上', label: '隊員資訊（戰鬥中）', sel: '#fieldSquadHud',          origin: 'left top', parts: [
      P('avatar', '頭像框', '#fieldSquadHud .field-member-avatar', ['w', 'h', 'radius']),
      P('name', '名字', '#fieldSquadHud .field-member-status > b', ['font']),
      P('status', '名字＋血條那一塊', '#fieldSquadHud .field-member-status', ['w']),
      P('bar', '血條／負荷條', '#fieldSquadHud .field-member-status i', ['h']),
      P('num', '條上的數字', '#fieldSquadHud .field-bar-num', ['font']),
      P('list', '每位隊員之間', '#fieldSquadHud .field-squad-list', ['gap']) ] },
  { key: 'notices',       group: '畫面中間', label: '系統訊息',         sel: '#systemNotices',           origin: 'center top', parts: [P('text', '文字', '#systemNotices > *', ['font'])] },
  { key: 'pickups',       group: '畫面中間', label: '拾取提示',         sel: '#itemPickupNotices',       origin: 'center top', parts: [P('text', '文字', '#itemPickupNotices > *', ['font'])] },
  { key: 'buildBar',      group: '畫面下方', label: '建造列',           sel: '#buildToolbar',            origin: 'left bottom', parts: [
      P('slot', '物件按鈕框', '#buildQuickSlots .build-quick-slot', ['w', 'h', 'radius']),
      P('icon', '物件圖示', '#buildQuickSlots .build-quick-slot img', ['w', 'h']),
      P('name', '物件名稱', '#buildQuickSlots .build-quick-slot span', ['font']),
      P('gap', '物件按鈕之間', '#buildQuickSlots', ['gap']),
      P('tbtn', '建造／拆除按鈕', '#buildToolbar .tbtn', ['w', 'h', 'font', 'radius']) ] },
  { key: 'ammo',          group: '畫面下方', label: '武器與彈藥',       sel: '#ammoHud',                 origin: 'right bottom', parts: [
      P('gun', '槍的圖', '#ammoHud .gun-stack img', ['w', 'h']),
      P('stack', '槍圖的範圍', '#ammoHud .gun-stack', ['w', 'h']),
      P('count', '子彈數字', '#ammoHud .ammo-text', ['font']),
      P('name', '武器名稱', '#ammoHud .ammo-text .weapon-name', ['font']) ] },
  { key: 'hud',           group: '下方資訊條', label: '整條資訊條',     sel: '#hud',                     origin: 'center', parts: [P('self', '資訊條', '#hud', ['h', 'radius'])] },
  { key: 'hudPlayer',     group: '下方資訊條', label: '溫特頭像與 HP／SP', sel: '#hud .hud-player',       origin: 'left center', parts: [
      P('self', '整塊', '#hud .hud-player', ['w']),
      P('avatar', '頭像框', '#hud .hud-player-avatar', ['w', 'h', 'radius']),
      P('name', '名字（溫特・嚮導部隊長）', '#hud .hud-player-status > b', ['font']),
      P('bar', 'HP／SP 條', '#hud .hud-player-bar', ['h']),
      P('num', '條上的數字', '#hud .hud-player-bar .bar-value', ['font']) ] },
  { key: 'quickSlots',    group: '下方資訊條', label: '快捷欄 Q／E／Z／X', sel: '#quickSupplies',         origin: 'center', parts: [
      P('slot', '格子', '#quickSupplies .quick-supply', ['w', 'h', 'radius']),
      P('icon', '道具圖示（高）', '#quickSupplies .quick-supply .qs-icon img', ['h']),
      P('count', '數量', '#quickSupplies .quick-supply .qs-text b', ['font']),
      P('key', '快捷鍵', '#quickSupplies .quick-supply kbd', ['font']),
      P('gap', '格子之間', '#quickSupplies', ['gap']) ] },
  { key: 'backpackBtn',   group: '下方資訊條', label: '背包按鈕',       sel: '#hudBackpackButton',       origin: 'center', parts: [
      P('self', '按鈕框', '#hudBackpackButton', ['w', 'h', 'font', 'radius']),
      P('icon', '背包圖示', '#hudBackpackButton .backpack-button-image', ['w', 'h']),
      P('key', '快捷鍵 B', '#hudBackpackButton kbd', ['font']) ] },
  { key: 'money',         group: '下方資訊條', label: '經費',           sel: '#hud .stat.money',         origin: 'center', parts: [
      P('self', '整塊', '#hud .stat.money', ['w']), P('label', '標題「經費」', '#hud .stat.money small', ['font']), P('num', '數字', '#hud .stat.money b', ['font']) ] },
  { key: 'crystal',       group: '下方資訊條', label: '異質碎片',       sel: '#hud .stat.crystal',       origin: 'center', parts: [
      P('self', '整塊', '#hud .stat.crystal', ['w']), P('icon', '碎片圖示', '#hud .stat.crystal .hud-stat-icon', ['w', 'h']),
      P('label', '標題「異質碎片」', '#hud .stat.crystal small', ['font']), P('num', '數字', '#hud .stat.crystal b', ['font']) ] },
  { key: 'tpadBtn',       group: '下方資訊條', label: 'T-Pad 按鈕',     sel: '#hudTpadButton',           origin: 'center', parts: [
      P('self', '按鈕框', '#hudTpadButton', ['w', 'h', 'font', 'radius']), P('key', '快捷鍵 T', '#hudTpadButton kbd', ['font']) ] },
];
const UI_PROP_NAMES = { w: '寬', h: '高', font: '文字大小', gap: '間距', radius: '圓角' };
// 每種細節數值要寫成哪些 CSS
const UI_PROP_CSS = {
  w: v => 'width:' + v + 'px !important;min-width:' + v + 'px !important;max-width:none !important;flex:none !important',
  h: v => 'height:' + v + 'px !important;min-height:' + v + 'px !important',
  font: v => 'font-size:' + v + 'px !important',
  gap: v => 'gap:' + v + 'px !important',
  radius: v => 'border-radius:' + v + 'px !important',
};
const UI_ITEM_DEFAULT = { x: 0, y: 0, scale: 1, opacity: 1, hidden: false };
function uiLayoutCss(layout) {
  const items = (layout && layout.items) || {}, rules = [];
  for (const el of UI_ELEMENTS) {
    const it = { ...UI_ITEM_DEFAULT, ...(items[el.key] || {}) }, d = [];
    if (it.x || it.y) d.push('translate:' + (+it.x || 0) + 'px ' + (+it.y || 0) + 'px !important');
    if (+it.scale && +it.scale !== 1) d.push('scale:' + (+it.scale) + ' !important', 'transform-origin:' + el.origin);
    if (it.opacity != null && +it.opacity !== 1) d.push('opacity:' + Math.max(0, Math.min(1, +it.opacity)) + ' !important');
    if (it.hidden) d.push('visibility:hidden !important');
    if (d.length) rules.push(el.sel + '{' + d.join(';') + '}');
    for (const part of el.parts || []) {   // 細節
      const v = (it.parts || {})[part.key]; if (!v) continue;
      const pd = part.props.filter(k => typeof v[k] === 'number' && isFinite(v[k])).map(k => UI_PROP_CSS[k](v[k]));
      if (pd.length) rules.push(part.sel + '{' + pd.join(';') + '}');
    }
  }
  return rules.join('\n');
}
// 套用版面（遊戲開啟時套用檔案的設定；UI 編輯器預覽時直接呼叫它）
function applyUiLayout(layout) {
  let st = document.getElementById('uiLayoutCSS');
  if (!st) { st = document.createElement('style'); st.id = 'uiLayoutCSS'; document.head.appendChild(st); }
  st.textContent = uiLayoutCss(layout);
}
applyUiLayout(typeof UI_LAYOUT !== 'undefined' ? UI_LAYOUT : null);

// ---- UI 編輯器裡的預覽（?uiedit=1）：在遊戲畫面這邊處理選取、拖曳，用訊息跟編輯器溝通 ----
// （直接雙擊 HTML 打開時，瀏覽器不准編輯器直接碰 iframe 裡的畫面，所以一律用 postMessage）
if (/[?&]uiedit=1(&|$)/.test(location.search)) (() => {
  let layout = { items: {} }, selKey = null, drag = null, outline = null;
  const post = m => parent.postMessage(Object.assign({ src: 'uiedit-game' }, m), '*');
  const itemOf = key => Object.assign({}, UI_ITEM_DEFAULT, (layout.items || {})[key] || {});
  const elDef = key => UI_ELEMENTS.find(e => e.key === key);
  function hit(target) {   // 點到的東西屬於哪個 UI（越裡面的優先：資訊條裡的小區塊比整條資訊條優先）
    if (!target || !target.closest) return null;
    for (let i = UI_ELEMENTS.length - 1; i >= 0; i--) { const e = UI_ELEMENTS[i]; if (e.key !== 'hud' && target.closest(e.sel)) return e.key; }
    return target.closest('#hud') ? 'hud' : null;
  }
  function setup(mode) {   // 停在看得到所有 UI 的畫面：戰鬥區（暫停）或基地
    try {
      const list = mapList(), combat = mode !== 'base';
      const idx = combat ? list.findIndex(m => !m.safe) : list.findIndex(m => /應變中心/.test(m.name));
      switchMap(Math.max(0, idx)); newGame();
      const ov = document.getElementById('overlay'); if (ov) ov.style.display = 'none';
      G.running = true;
      if (combat && typeof setPaused === 'function') setPaused(true);
      document.querySelectorAll('#itemIntro, #pauseBadge').forEach(el => el.classList.add('hidden'));
      const editors = document.getElementById('editors'); if (editors) editors.style.display = 'none';
    } catch (e) { console.warn('UI編輯器預覽：準備畫面失敗', e); }
  }
  window.addEventListener('message', e => {
    const m = e.data; if (!m || m.src !== 'uiedit-editor') return;
    if (m.type === 'layout') { layout = m.layout || { items: {} }; applyUiLayout(layout); }
    else if (m.type === 'select') { selKey = m.key; measure(m.key); }
    else if (m.type === 'setup') setup(m.mode);
    else if (m.type === 'ping' && document.readyState !== 'loading') post({ type: 'ready' });   // 編輯器在問「好了沒」：程式都載完就回答（不用等圖片下載完）
  });
  function measure(key) {   // 選到的 UI：量每個細節現在的大小，給編輯器當「原本」的參考
    const d = elDef(key); if (!d) return;
    const values = {};
    for (const part of d.parts || []) {
      const el = document.querySelector(part.sel); if (!el) continue;
      const cs = getComputedStyle(el), r = el.getBoundingClientRect(), v = {};
      for (const k of part.props) v[k] = Math.round(k === 'w' ? el.offsetWidth || r.width : k === 'h' ? el.offsetHeight || r.height : k === 'font' ? parseFloat(cs.fontSize) : k === 'gap' ? parseFloat(cs.columnGap || cs.gap) || 0 : parseFloat(cs.borderTopLeftRadius) || 0);
      values[part.key] = v;
    }
    post({ type: 'measure', key, values });
  }
  const block = ev => { if (hit(ev.target)) { ev.preventDefault(); ev.stopPropagation(); } };
  document.addEventListener('pointerdown', ev => {
    const key = hit(ev.target); if (!key) return;
    ev.preventDefault(); ev.stopPropagation();
    selKey = key; post({ type: 'pick', key }); measure(key);
    const it = itemOf(key); drag = { key, sx: ev.clientX, sy: ev.clientY, x: it.x, y: it.y };
  }, true);
  document.addEventListener('pointermove', ev => {
    if (!drag) return; ev.preventDefault();
    const x = Math.round(drag.x + ev.clientX - drag.sx), y = Math.round(drag.y + ev.clientY - drag.sy);
    layout.items = layout.items || {}; layout.items[drag.key] = Object.assign({}, layout.items[drag.key] || {}, { x, y }); applyUiLayout(layout);   // 先在這邊動，拖起來比較順
    post({ type: 'move', key: drag.key, x, y });
  }, true);
  document.addEventListener('pointerup', () => { if (drag) { post({ type: 'moved', key: drag.key }); drag = null; } }, true);
  for (const t of ['click', 'mousedown', 'mouseup', 'contextmenu', 'dblclick']) document.addEventListener(t, block, true);
  document.addEventListener('keydown', ev => {   // 方向鍵交給編輯器微調
    if (!selKey || !ev.key.startsWith('Arrow')) return;
    ev.preventDefault(); ev.stopPropagation(); post({ type: 'arrow', key: ev.key, shift: ev.shiftKey });
  }, true);
  function loop() {   // 選到的 UI 外面畫一圈虛線
    if (!outline && document.body) { outline = document.createElement('div'); outline.style.cssText = 'position:fixed;z-index:99999;pointer-events:none;border:2px dashed #7fd7da;border-radius:6px;box-shadow:0 0 0 9999px rgba(0,0,0,.18);display:none'; document.body.appendChild(outline); }
    if (outline) {
      const d = elDef(selKey), el = d && document.querySelector(d.sel);
      if (el && el.getClientRects().length) { const r = el.getBoundingClientRect(); Object.assign(outline.style, { display: 'block', left: (r.left - 3) + 'px', top: (r.top - 3) + 'px', width: (r.width + 6) + 'px', height: (r.height + 6) + 'px' }); }
      else outline.style.display = 'none';
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

})();
