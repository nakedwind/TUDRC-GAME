/* ===== 🔧 開發工坊編輯器 =====
   左邊：選一件裝備／武器，改名稱、圖片、說明、取得地點；可以「＋ 新增裝備」「🗑 刪除裝備」。
         下面改整個工坊的外觀（字的顏色、大小、欄位大小）。
   右邊：預覽＝遊戲裡的開發工坊（用同一份 css/style.css，所以長得一模一樣）。
   存檔：「💾 存到專案」寫進 data/workshop.js（遊戲由 js/workshop-config.js 套用）。
   還沒存的修改會先放在瀏覽器暫存（重新整理不會不見）；按「從檔案重設」才會丟掉。
   ・新增的裝備：可以開發／撿到、穿上、升級，效果說明是自己寫的文字；遊戲裡實際的效果要另外寫程式。
   ・刪除：裝備、武器都可以刪。對玩家來說就是永久從遊戲消失：工坊、背包、裝備欄都看不到、拿不到，存檔裡已經拿到的也清掉。
     只是不在遊戲裡出現，資料（data/equipment.js、圖片）沒有刪；可以再「復原」，但玩家要重新取得。
   ・新增的裝備：玩家不會直接拿到，開發工坊裡看得到（找諾亞開發／戰鬥區域取得）。
   ・預覽的「裝備狀態」只是預覽畫面怎麼畫，不會動到玩家的進度。
*/
const WS_DRAFT_KEY = 'tudrc_workshop_editor_draft_v1';
const clone = v => JSON.parse(JSON.stringify(v));
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const statusEl = document.getElementById('status');
function setStatus(msg, err = false) { statusEl.textContent = msg; statusEl.classList.toggle('err', !!err); }

// ---- 目前編輯中的設定：{ items: { key: {name,image,desc,where} }, added: [新裝備], removed: [刪掉的 id], style: {...} } ----
const fromFile = () => ({ items: clone(WORKSHOP_CONFIG.items || {}), added: clone(WORKSHOP_CONFIG.added || []), removed: clone(WORKSHOP_CONFIG.removed || []), style: clone(WORKSHOP_CONFIG.style || {}), order: clone(WORKSHOP_CONFIG.order || {}) });
let cfg = (() => {
  try {
    const d = (typeof DraftSync !== 'undefined' ? DraftSync.load(WS_DRAFT_KEY, fromFile(), { label: '開發工坊' }) : JSON.parse(localStorage.getItem(WS_DRAFT_KEY) || 'null'));   // 暫存和專案檔三方合併（js/draft-sync.js）
    if (d && d.items && d.style) return { items: d.items, added: d.added || [], removed: d.removed || [], style: d.style, order: d.order || {} };
  } catch (_) {}
  return fromFile();
})();
// 以前（最高 Lv3）新增的裝備：費用、每一級的說明補到最高級
for (const a of cfg.added) { a.cost = workshopCustomDef(a).cost; a.levels = WORKSHOP_LV_INDEX.map(i => String((a.levels || [])[i] ?? '')); }
// 10/22 說明合併成一段：暫存裡改過「還沒拿到時」說明（desc）的，搬到「說明（已擁有）」（ownedDesc 已經有寫的就不動）
//   子彈、彈匣（b:、m:）不搬：它們的說明本來就存在 desc（背包編輯器同步過來的也在這裡）；之前被搬錯的搬回 desc
for (const [k, o] of Object.entries(cfg.items)) {
  if (!o) continue;
  if (/^[bm]:/.test(k)) { if (typeof o.ownedDesc === 'string') { if (o.ownedDesc && !o.desc) o.desc = o.ownedDesc; delete o.ownedDesc; } continue; }
  if (typeof o.desc === 'string') { if (o.desc && !o.ownedDesc) o.ownedDesc = o.desc; delete o.desc; }
}
for (const a of cfg.added) if (a.desc) { if (!a.ownedDesc) a.ownedDesc = a.desc; a.desc = ''; }
function saveDraft() { try { localStorage.setItem(WS_DRAFT_KEY, JSON.stringify(cfg)); } catch (_) {} }

// ---- 原本就有的裝備／武器（data/equipment.js）----
const isWeapon = key => key.startsWith('w:');
const BUILTIN = {};   // key → 原本的資料（被刪掉的也在，才能「復原」）
for (const key of Object.keys(WORKSHOP_BASE)) {
  BUILTIN[key] = isWeapon(key) ? WEAPON_UPGRADES[key.slice(2)] : (EQUIPMENT.find(d => d.id === key) || WORKSHOP_REMOVED[key]);
}
const BUILTIN_GEAR = Object.keys(BUILTIN).filter(k => !isWeapon(k));
const WEAPON_KEYS = Object.keys(BUILTIN).filter(isWeapon);
// ---- 每一件：原本的、新增的 ----
const customEntry = key => cfg.added.find(a => a.id === key) || null;
const isCustom = key => !!customEntry(key);
const isRemoved = key => cfg.removed.includes(key);
// ---- 子彈、彈匣（key：b:子彈id、m:magazine；原本的資料在 js/workshop-config.js 的 WORKSHOP_AMMO_BASE）----
const isAmmo = key => /^[bm]:/.test(key || '');
const isMag = key => key === 'm:magazine';
const AMMO_KEYS = workshopAmmoKeys();
const AMMO_FIELDS = ['name', 'image', 'desc'];
const ammoBase = key => WORKSHOP_AMMO_BASE[key] || {};
// 編輯中的值：改過的優先，沒改＝原本的（文字、數字、陣列都一樣）
function ammoVal(key, f) {
  const o = cfg.items[key] || {}, b = ammoBase(key);
  if (Array.isArray(b[f])) return b[f].map((n, i) => (Array.isArray(o[f]) && typeof o[f][i] === 'number') ? o[f][i] : n);
  if (typeof b[f] === 'number') return typeof o[f] === 'number' ? o[f] : b[f];
  return typeof o[f] === 'string' && o[f] !== '' ? o[f] : (b[f] ?? '');
}
const ammoChanged = key => { const o = cfg.items[key]; return !!o && Object.keys(o).length > 0; };
// 給預覽、清單用的「裝備資料」（只有用得到的幾項）：彈匣的等級＝裝得下幾種子彈
const ammoDef = key => ({ icon: ammoBase(key).icon || '•', kind: 'ammo', source: 'develop', levels: isMag(key) ? ammoVal(key, 'slots').map(n => ({ n })) : [{}] });
const getDef = key => isAmmo(key) ? ammoDef(key) : isCustom(key) ? workshopCustomDef(customEntry(key)) : BUILTIN[key];
// 排列順序（在預覽裡拖曳調整，存在 cfg.order）：沒列到的照原本的順序接在後面
const sortByOrder = (keys, list) => { const m = new Map((list || []).map((k, i) => [k, i])); return keys.map((k, i) => [k, i]).sort((a, b) => (m.has(a[0]) ? m.get(a[0]) : 1e6) - (m.has(b[0]) ? m.get(b[0]) : 1e6) || a[1] - b[1]).map(x => x[0]); };
const gearKeys = () => sortByOrder(BUILTIN_GEAR.concat(cfg.added.map(a => a.id)), cfg.order.gear);   // 清單：原本的裝備＋新增的裝備
const weaponKeys = () => sortByOrder(WEAPON_KEYS, cfg.order.weapons);
const isField = (key, def) => isWeapon(key) ? !!def.field : def.source !== 'develop';   // 只能在戰鬥區域拿到
// 這件現在要顯示的文字／圖片
function itemView(key) {
  if (isAmmo(key)) return { name: ammoVal(key, 'name'), image: ammoVal(key, 'image'), desc: '', ownedDesc: ammoVal(key, 'desc'), where: '' };
  if (isCustom(key)) { const d = getDef(key); return { name: d.name, image: d.image, desc: d.desc, ownedDesc: d.ownedDesc, where: d.where }; }
  const base = WORKSHOP_BASE[key] || {}, o = cfg.items[key] || {}, out = {};
  for (const f of WORKSHOP_TEXT_FIELDS) out[f] = typeof o[f] === 'string' && o[f] !== '' ? o[f] : (base[f] ?? '');
  return out;
}
// 每一級的效果說明（例如「傷害 5・彈匣 6 發・裝填 2 秒」）：有改就用改的，沒改＝原本跟著數值自動產生的文字
const levelEdits = key => (cfg.items[key] && Array.isArray(cfg.items[key].levels)) ? cfg.items[key].levels : [];
// 每一級的實際數值（傷害、彈匣…）：原本的數值＋編輯中改過的
const valueEdits = key => (cfg.items[key] && Array.isArray(cfg.items[key].values)) ? cfg.items[key].values : [];
const baseLevel = (key, i) => ((WORKSHOP_BASE[key] || {}).levels || [])[i] || null;
const effLevel = (key, i) => { const b = baseLevel(key, i); if (!b) return null; const out = { ...b };   // 實際數值（只算數字）
  for (const [k, n] of Object.entries(valueEdits(key)[i] || {})) if (typeof n === 'number') out[k] = n;
  return out; };
const textEdits = (key, i) => Object.fromEntries(Object.entries(valueEdits(key)[i] || {}).filter(([, n]) => typeof n === 'string' && n !== ''));   // 填文字的數值
const valuesChanged = key => valueEdits(key).some((v, i) => v && Object.keys(v).some(k => v[k] !== (baseLevel(key, i) || {})[k]));
// 跟著數值自動產生的效果說明（用改過的數值算）
function autoText(key, i) { return workshopAutoStat(key, effLevel(key, i), textEdits(key, i)); }   // js/workshop-config.js（跟遊戲同一套）
function statText(key, i) {
  if (isCustom(key)) { const d = getDef(key); return d.stat(d.levels[i]); }
  const t = levelEdits(key)[i];
  return typeof t === 'string' && t !== '' ? t : autoText(key, i);
}
// 開發／升級要花幾個異質碎片：裝備 [開發, 升到 Lv2, …]、武器 [升到 Lv2, …]；編輯中改過的優先，沒改＝原本的
const costEdits = key => (cfg.items[key] && Array.isArray(cfg.items[key].cost)) ? cfg.items[key].cost : [];
const baseCost = key => (WORKSHOP_BASE[key] || {}).cost || [];
const effCost = (key, i) => { if (isCustom(key)) return getDef(key).cost[i]; const n = costEdits(key)[i]; return typeof n === 'number' ? n : baseCost(key)[i]; };
const costChanged = key => costEdits(key).some((n, i) => typeof n === 'number' && n !== baseCost(key)[i]);
const levelsChanged = key => levelEdits(key).some(t => typeof t === 'string' && t !== '');
const itemChanged = key => { if (isAmmo(key)) return ammoChanged(key); const o = cfg.items[key]; return !!o && (!!o.infoParts || o.money != null || WORKSHOP_TEXT_FIELDS.some(f => typeof o[f] === 'string' && o[f] !== '' && o[f] !== (WORKSHOP_BASE[key] || {})[f]) || levelsChanged(key) || valuesChanged(key) || costChanged(key) || typeof o.iconScale === 'number' || ['iconX', 'iconY', 'infoImgX', 'infoImgY', 'infoImgSize'].some(k => typeof o[k] === 'number')); };
// 開發工坊裡圖片的大小（%）：新增的裝備存在 added 裡；原本的存在 items[key].iconScale（沒改＝原本的）
const iconScaleOf = key => { if (isCustom(key)) return customEntry(key).iconScale || 100; const o = cfg.items[key]; return o && typeof o.iconScale === 'number' ? o.iconScale : ((WORKSHOP_BASE[key] || {}).iconScale || 100); };
const iconScaleField = key => { const n = iconScaleOf(key);
  return '<div class="field">圖片大小（開發工坊裡，%）<div class="img-off"><input type="number" data-is min="30" max="200" step="1" value="' + n + '">' +
    '<span class="nudge"><button type="button" class="ed-btn" data-scale="1" title="放大 1%">↑</button><button type="button" class="ed-btn" data-scale="-1" title="縮小 1%">↓</button>' +
    '<button type="button" class="ed-btn" data-scale="0" title="回到原本的大小">100%</button></span></div>' +
    '<span class="hint">30～200；100＝原本的大小。圖示框的大小不變（全部一起改請用下面「外觀」的圖示框大小）。</span></div>'; };
function setIconScale(n) {   // 記下這件的圖片大小（%），更新輸入框
  n = Math.max(30, Math.min(200, Math.round(n)));
  if (isCustom(selKey)) customEntry(selKey).iconScale = n;
  else {
    const o = cfg.items[selKey] || (cfg.items[selKey] = {}), base = (WORKSHOP_BASE[selKey] || {}).iconScale || 100;
    if (n === base) delete o.iconScale; else o.iconScale = n;
    if (!Object.keys(o).length) delete cfg.items[selKey];
    document.getElementById('itemReset').disabled = !itemChanged(selKey);
  }
  const inp = document.querySelector('#itemForm [data-is]'); if (inp && Number(inp.value) !== n) inp.value = n;
}
// 圖片位移（px）：axis＝'x' 左右、'y' 上下（開發工坊格子裡）；'ix'、'iy'＝下方說明欄裡的圖片
// 新增的裝備存在 added 裡，原本的存在 items[key].iconX／iconY（說明欄：infoImgX／infoImgY）
const iconOffKey = axis => ({ x: 'iconX', y: 'iconY', ix: 'infoImgX', iy: 'infoImgY', is: 'infoImgSize' })[axis];   // is＝說明欄的圖片大小（0＝原本的）
const iconOffOf = (key, axis) => { const k = iconOffKey(axis); if (isCustom(key)) return customEntry(key)[k] || 0; const o = cfg.items[key]; return o && typeof o[k] === 'number' ? o[k] : 0; };
// p＝''（開發工坊格子裡的圖）或 'i'（下方說明欄裡的圖）
const iconOffField = (key, p = '', title = '圖片位移（開發工坊裡，1px 為單位）', hint = '正數＝往右／往下，負數＝往左／往上。') => '<div class="field">' + title + '<div class="img-off">' +
  '<label>左右<input type="number" data-io="' + p + 'x" step="1" value="' + iconOffOf(key, p + 'x') + '"></label>' +
  '<label>上下<input type="number" data-io="' + p + 'y" step="1" value="' + iconOffOf(key, p + 'y') + '"></label>' +
  '<span class="nudge"><button type="button" class="ed-btn" data-nudge="' + p + 'x:-1" title="往左 1px">←</button><button type="button" class="ed-btn" data-nudge="' + p + 'y:-1" title="往上 1px">↑</button>' +
  '<button type="button" class="ed-btn" data-nudge="' + p + 'y:1" title="往下 1px">↓</button><button type="button" class="ed-btn" data-nudge="' + p + 'x:1" title="往右 1px">→</button>' +
  '<button type="button" class="ed-btn" data-nudge="' + p + '0" title="回到原本的位置">歸零</button></span></div>' +
  '<span class="hint">' + hint + '</span></div>';
// 下方說明欄的圖片大小（px＝圖的寬，高度照比例，1px 一格）：每件分開；圖片框、文字不會動（用縮放畫）
const infoImgBase = key => isWeapon(key) ? 100 : 88;   // 原本的大小（css/style.css 的 .ws-info .bag-detail-image img）
const infoImgSizeOf = key => iconOffOf(key, 'is') || infoImgBase(key);
const infoImgSizeField = key => '<div class="field">下方說明欄的圖片大小（px，長寬等比例，1px 為單位）<div class="img-off"><input type="number" data-iss min="8" max="400" step="1" value="' + infoImgSizeOf(key) + '">' +
  '<span class="nudge"><button type="button" class="ed-btn" data-iss-step="1" title="放大 1px">↑</button><button type="button" class="ed-btn" data-iss-step="-1" title="縮小 1px">↓</button>' +
  '<button type="button" class="ed-btn" data-iss-step="0" title="回到原本的大小">原本</button></span></div>' +
  '<span class="hint">只放大縮小這件在說明欄裡的圖（每件分開），圖片框和文字不會動；原本＝' + infoImgBase(key) + '。</span></div>';
function setInfoImgSize(n) {   // 記下這件說明欄圖片的大小，更新兩邊的輸入框（左邊這件的設定、外觀的滑桿）
  n = Math.max(8, Math.min(400, Math.round(n)));
  setIconOff('is', n === infoImgBase(selKey) ? 0 : n);   // 跟原本一樣＝不用記
  document.querySelectorAll('#itemForm [data-iss], #styleForm [data-sis]').forEach(el => { if (el.type === 'range') { el.min = Math.min(el.min, n); el.max = Math.max(el.max, n); } if (Number(el.value) !== n) el.value = n; });
}
const infoImgOffField = key => iconOffField(key, 'i', '下方說明欄的圖片位移（只動這件的圖，1px 為單位）', '正數＝往右／往下，負數＝往左／往上。每件分開調，看預覽下方的說明欄；下面「外觀 → 下方說明欄」也有同一組滑桿。');
function setIconOff(axis, n) {   // 記下這件的圖片位移，更新輸入框和預覽
  const k = iconOffKey(axis);
  if (isCustom(selKey)) customEntry(selKey)[k] = n;
  else {
    const o = cfg.items[selKey] || (cfg.items[selKey] = {});
    if (n === 0) delete o[k]; else o[k] = n;
    if (!Object.keys(o).length) delete cfg.items[selKey];
    document.getElementById('itemReset').disabled = !itemChanged(selKey);
  }
  const inp = document.querySelector('#itemForm [data-io="' + axis + '"]'); if (inp && Number(inp.value) !== n) inp.value = n;
  document.querySelectorAll('#styleForm [data-sio="' + axis + '"]').forEach(el => { if (el.type === 'range') { el.min = Math.min(el.min, n); el.max = Math.max(el.max, n); } if (Number(el.value) !== n) el.value = n; });   // 外觀裡的同一個值
}
// ---- 經費（開發／升級要花多少錢）：每一格可以自己填，空白＝照異質碎片自動算（js/workshop-config.js 的 workshopMoney）----
// 存在 items[key].money（新增的裝備在 added 裡）：裝備、武器、彈匣＝陣列（跟費用同一格對同一格，null＝自動）；子彈＝一個數字
const moneyHolder = (key, make) => isCustom(key) ? customEntry(key) : (cfg.items[key] || (make ? (cfg.items[key] = {}) : null));
const moneyEdit = (key, i) => { const h = moneyHolder(key), m = h && (Array.isArray(h.money) ? h.money[i] : h.money); return typeof m === 'number' ? m : null; };
function moneyFields(key, labels, shardsOf) {   // labels：每一格的名稱（開發、升到 Lv2…）；shardsOf(i)＝那一格的異質碎片（算自動的經費）
  if (!labels.length) return '';
  return '<div class="field">要花多少經費（$）<span class="hint">空白＝照異質碎片自動算（碎片 × ' + WORKSHOP_MONEY_RATE + '，取到 50 的倍數，就是灰色那個數字）；填 0＝不用花錢。</span></div>' +
    '<div class="cost-row" style="grid-template-columns:repeat(' + labels.length + ', minmax(0, 1fr))">' + labels.map((l, i) => { const m = moneyEdit(key, i);
      return '<label class="field">' + esc(l) + '<input type="text" inputmode="numeric" data-money="' + i + '" value="' + (m == null ? '' : m) + '" placeholder="' + workshopMoneyAuto(shardsOf(i)) + '"' + (m == null ? '' : ' class="is-edited"') + '></label>'; }).join('') + '</div>';
}
function setMoney(i, txt) {   // 記下這件第 i 格的經費（空白＝回到自動）
  const single = isAmmo(selKey) && !isMag(selKey), h = moneyHolder(selKey, true), n = txt === '' ? null : Math.max(0, Math.round(Number(txt)));
  if (single) { if (n == null) delete h.money; else h.money = n; }
  else {
    const arr = Array.isArray(h.money) ? h.money.slice() : [];
    arr[i] = n; for (let j = 0; j < arr.length; j++) if (arr[j] === undefined) arr[j] = null;
    while (arr.length && arr[arr.length - 1] == null) arr.pop();
    if (arr.length) h.money = arr; else delete h.money;
  }
  if (!isCustom(selKey) && cfg.items[selKey] && !Object.keys(cfg.items[selKey]).length) delete cfg.items[selKey];
  const r = document.getElementById('itemReset'); if (r) r.disabled = !itemChanged(selKey);
}

// ---- 左邊的每一段都可以收起來／打開（點標題）：記在這台瀏覽器，換選別件也照樣 ----
// sec(代號, 標題, 內容, 預設打開？)；最上面有「全部收起」「全部打開」
const SEC_KEY = 'tudrc_workshop_editor_sections_v1';
const secOpen = (() => { try { return JSON.parse(localStorage.getItem(SEC_KEY) || '{}'); } catch (_) { return {}; } })();
const isSecOpen = (id, def = true) => typeof secOpen[id] === 'boolean' ? secOpen[id] : def;
const sec = (id, title, html, def = true) => html ? '<details class="form-sec" data-sec="' + id + '"' + (isSecOpen(id, def) ? ' open' : '') + '><summary>' + title + '</summary><div class="form-sec-body">' + html + '</div></details>' : '';
const secTools = () => '<div class="sec-tools"><button type="button" class="ed-btn" data-sec-all="0">⏶ 全部收起</button><button type="button" class="ed-btn" data-sec-all="1">⏷ 全部打開</button></div>';
function rememberSec(d) { secOpen[d.dataset.sec] = d.open; try { localStorage.setItem(SEC_KEY, JSON.stringify(secOpen)); } catch (_) {} }
document.addEventListener('toggle', e => { const d = e.target; if (d && d.dataset && d.dataset.sec) rememberSec(d); }, true);
document.querySelectorAll('details[data-sec]').forEach(d => { d.open = isSecOpen(d.dataset.sec); });   // 頁面上本來就有的（上面的清單）：照上次的
document.addEventListener('click', e => {
  const b = e.target.closest('[data-sec-all]'); if (!b) return;
  const open = b.dataset.secAll === '1';
  document.querySelectorAll('#itemForm details[data-sec]').forEach(d => { d.open = open; });
});

// ---- 下方說明欄的四塊（名稱＋標籤、說明、效果框、按鈕）：這件自己的位置、大小、字級 ----
// 存在 items[key].infoParts（新增的裝備存在 added 裡）；套用見 js/workshop-config.js 的 workshopInfoPartAttr
const INFO_PART_FIELDS = [['x', '左右'], ['y', '上下'], ['w', '寬'], ['h', '高'], ['font', '字級']];
const INFO_PART_WHERE = { stats: '效果框裡的內容＝上面每一級的效果說明／數值（子彈：最多帶幾發）。', btn: '後面的數字＝上面的「異質碎片」費用。', money: '花多少錢在上面「💎 要花幾個異質碎片、多少經費」改；寬、高＝框的大小。已達最高等級、已開發、還沒拿到時不會出現。' };
const infoPartsNow = key => workshopInfoPartsOf(key, cfg);
const infoLabelFn = (key, lv) => (p, f, txt) => esc(workshopInfoLabel(key, p, f, txt, { lv, next: lv + 1 }, cfg));   // 預覽用：這件改過的字
// attr／descAttr：名稱、說明原本那一格的欄位（原本的裝備 data-f、新增的裝備 data-c、子彈彈匣 data-a）——這裡的輸入框跟它連在一起
function infoPartsField(key, attr, descAttr) {
  const parts = infoPartsNow(key), v = itemView(key);
  const content = p => {
    if (p === 'name') return '<label class="field">內文<input type="text" ' + attr + '="name" value="' + esc(v.name) + '"></label>';
    if (p === 'desc') return '<label class="field">內文（跟背包編輯器連通，換行各自保留）<textarea ' + descAttr + ' rows="2">' + esc(v.ownedDesc || v.desc || '') + '</textarea></label>';
    return (WORKSHOP_INFO_LABELS[p] || []).map(([f, when, txt]) => { const now = (parts[p] || {})[f];
      return '<label class="field">內文：' + esc(when) + '<input type="text" data-wt="' + p + ':' + f + '" value="' + esc(typeof now === 'string' ? now : '') + '" placeholder="' + esc(txt) + '"></label>'; }).join('');
  };
  return '<span class="hint" style="display:block;margin-bottom:8px">在右邊預覽的說明欄點一下名稱、標籤、說明、效果框或按鈕，就會打開、跳到那一塊。左右／上下：位移（px，正數＝往右／往下）；寬、高、字級：0 或空白＝原本的。內文空白＝原本的字（灰色那段）；{lv}＝目前等級、{next}＝下一級。</span>' +
    Object.entries(WORKSHOP_INFO_PARTS).map(([p, label]) => { const o = parts[p] || {}, changed = Object.keys(o).length;
      return '<details class="info-part" data-part="' + p + '" data-sec="part:' + p + '"' + (isSecOpen('part:' + p, false) ? ' open' : '') + '><summary class="info-part-head"><b>' + esc(label) + '</b>' + (changed ? '<em>調整過</em>' : '') + '</summary>' +
        '<div class="info-part-tools"><button type="button" class="ed-btn" data-wp-reset="' + p + '" title="這一塊回到原本的位置、大小、字">歸零</button></div>' +
        '<div class="cost-row" style="grid-template-columns:repeat(5, minmax(0, 1fr))">' + INFO_PART_FIELDS.map(([f, n]) =>
          '<label class="field">' + n + '<input type="number" step="1" data-wp="' + p + ':' + f + '" value="' + (Number.isFinite(o[f]) && o[f] ? o[f] : '') + '" placeholder="0"></label>').join('') + '</div>' +
        content(p) + (INFO_PART_WHERE[p] ? '<span class="hint">' + esc(INFO_PART_WHERE[p]) + '</span>' : '') + '</details>'; }).join('');
}
function setInfoPart(part, field, n) {   // 記下這件某一塊的某個值（數字 0、空白的字＝拿掉）
  const holder = isCustom(selKey) ? customEntry(selKey) : (cfg.items[selKey] || (cfg.items[selKey] = {}));
  const all = holder.infoParts || {}, o = { ...(all[part] || {}) };
  if (n) o[field] = n; else delete o[field];
  if (Object.keys(o).length) all[part] = o; else delete all[part];
  if (Object.keys(all).length) holder.infoParts = all; else delete holder.infoParts;
  if (!isCustom(selKey) && !Object.keys(cfg.items[selKey]).length) delete cfg.items[selKey];
  const r = document.getElementById('itemReset'); if (r) r.disabled = !itemChanged(selKey);
}
const iconHtml = (key, view) => view.image ? '<img src="' + esc(view.image) + '" alt="">' : '<i>' + esc(getDef(key).icon || '？') + '</i>';
let selKey = BUILTIN_GEAR[0];

// ---- 左邊清單 ----
function renderList() {
  const box = document.getElementById('itemList');
  const btn = key => {
    const v = itemView(key);
    const tag = isRemoved(key) ? 'removed' : isCustom(key) ? 'added' : itemChanged(key) ? 'changed' : '';
    return '<button type="button" data-key="' + esc(key) + '" class="' + (key === selKey ? 'sel ' : '') + tag + '">' +
      iconHtml(key, v) + '<span>' + esc(v.name) + '<small>' + (isWeapon(key) ? '武器' : isMag(key) ? '彈匣' : isAmmo(key) ? '子彈' : WORKSHOP_KINDS[getDef(key).kind] || '裝備') + '</small></span></button>';
  };
  box.innerHTML = '<div class="list-head">裝備</div>' + gearKeys().map(btn).join('') + '<div class="list-head">武器</div>' + weaponKeys().map(btn).join('') +
    '<div class="list-head">子彈・彈匣</div>' + AMMO_KEYS.map(btn).join('');
}
document.getElementById('itemList').addEventListener('click', e => {
  const b = e.target.closest('[data-key]'); if (!b) return;
  selKey = b.dataset.key; renderList(); renderItemForm(); renderPreview();
});
document.getElementById('addItem').addEventListener('click', () => {
  const id = 'custom_' + Date.now().toString(36);
  cfg.added.push({ id, name: '新裝備', kind: 'acc', icon: '🧰', image: '', source: 'develop', where: '', desc: '在這裡寫裝備的說明。', cost: [50, 100, 160, 240, 340], levels: WORKSHOP_LV_INDEX.map(i => 'Lv' + (i + 1) + ' 的效果'), iconScale: 100 });
  selKey = id; saveDraft(); renderList(); renderItemForm(); renderPreview();
  document.querySelector('#itemList .sel')?.scrollIntoView({ block: 'nearest' });
  setStatus('已新增一件裝備（右邊預覽的最後面）；改好名稱和說明後記得存到專案');
});

// ---- 選到的這件：表單 ----
const imageField = (key, v, attr) => '<div class="field">圖片<div class="img-row"><span class="thumb">' + iconHtml(key, v) + '</span>' +
  '<div><input type="text" ' + attr + '="image" value="' + esc(v.image) + '" placeholder="例如 images/裝備/xxx.png（空白＝用表情符號 ' + esc(getDef(key).icon || '') + '）">' +
  '<div class="img-btns"><button type="button" class="ed-btn" id="pickImage">從資料夾開啟…</button></div></div></div>' +
  '<span class="hint">圖片要先放進遊戲資料夾（例如 images/裝備/），再用上面的按鈕選。</span></div>';
// 每一級的實際數值表格：橫的是 Lv1～Lv5，直的是每一種數值（顯示成好懂的單位，例如 15 %、5.5 格）
const valueInfo = k => (typeof WORKSHOP_VALUE_INFO !== 'undefined' && WORKSHOP_VALUE_INFO[k]) || { label: k, unit: '' };
const shownNum = (raw, scale) => raw == null ? '' : String(Math.round(raw * (scale || 1) * 10000) / 10000);
function valueKeys(key) {   // 這件有哪些數值：武器＝所有武器的數值（每一把同一張表、對齊）；裝備＝自己的（三個等級合起來）
  if (isWeapon(key)) return workshopWeaponValueKeys();
  const keys = [];
  for (const lv of (WORKSHOP_BASE[key] || {}).levels || []) for (const k of Object.keys(lv)) if (typeof lv[k] === 'number' && !keys.includes(k)) keys.push(k);
  return keys;
}
const LV_COLS = WORKSHOP_LV_INDEX.map(() => '<col>').join('');
// 開發／升級的費用（異質碎片）：調整開發難度用
function costFields(key, def) {
  const w = isWeapon(key), n = baseCost(key).length; if (!n) return '';
  const labels = Array.from({ length: n }, (_, i) => w ? '升到 Lv' + (i + 2) : i ? '升到 Lv' + (i + 1) : '開發');
  const fieldOnly = !w && isField(key, def);   // 只能在戰鬥區域拿到的裝備：不用開發（第一格用不到）
  const hint = w ? (isField(key, def) ? '這把只能在戰鬥區域撿到，不用開發；這裡是升級的費用。' : '這把一開始就有，不用開發；這裡是升級的費用。')
    : fieldOnly ? '這件只能在戰鬥區域拿到，不用開發（「開發」那格用不到）；其他是升級的費用。' : '空白＝原本的費用。';
  return '<div class="field">要花幾個異質碎片（開發／升級）<span class="hint">' + hint + '</span></div>' +
    '<div class="cost-row" style="grid-template-columns:repeat(' + n + ', minmax(0, 1fr))">' + labels.map((l, i) => {
      const edited = typeof costEdits(key)[i] === 'number';
      return '<label class="field">' + l + '<input type="text" inputmode="numeric" data-cost="' + i + '" value="' + esc(effCost(key, i)) + '" placeholder="' + esc(baseCost(key)[i]) + '"' +
        (edited ? ' class="is-edited"' : '') + (fieldOnly && i === 0 ? ' disabled title="不用開發"' : '') + '></label>';
    }).join('') + '</div>';
}
function valueTable(key) {
  const keys = valueKeys(key); if (!keys.length) return '';
  const hint = isWeapon(key)
    ? '所有武器用同一張表。空白＝這把沒有這個數值（效果說明不會顯示）；這把原本沒有的數值填了，只會顯示在效果說明後面，槍本身的程式沒有用到。填數字以外的文字（例如 5～6、？？）：只顯示在效果說明，遊戲實際的數值維持原本的。'
    : '空白＝這一級沒有這個效果；改回原本的數字＝不算修改。填數字以外的文字（例如 5～6、？？）：只顯示在效果說明，遊戲實際的數值維持原本的。';
  return '<div class="field">每一級的實際數值（改了遊戲裡就照這個數值）<span class="hint">' + hint + '</span></div>' +
    '<table class="val-table"><colgroup><col class="vt-name">' + LV_COLS + '</colgroup><thead><tr><th></th>' + WORKSHOP_LV_INDEX.map(i => '<th>Lv' + (i + 1) + '</th>').join('') + '</tr></thead><tbody>' +
    keys.map(k => { const info = valueInfo(k);
      return '<tr><th title="' + esc(k) + '">' + esc(info.label) + (info.unit ? '<small>（' + esc(info.unit) + '）</small>' : '') + '</th>' +
        WORKSHOP_LV_INDEX.map(i => { const lv = effLevel(key, i), t = textEdits(key, i)[k]; return '<td><input type="text" data-vk="' + esc(k) + '" data-vi="' + i + '" value="' + esc(t ?? shownNum(lv && lv[k], info.scale)) + '"' + (t ? ' class="is-text" title="文字：只顯示在效果說明"' : '') + (lv ? '' : ' disabled') + '></td>'; }).join('') + '</tr>'; }).join('') +
    '</tbody></table>';
}
function renderItemForm() {
  renderStyleInfoImg();   // 外觀 → 下方說明欄的圖片位移：跟著換成這件
  if (isAmmo(selKey)) { renderAmmoForm(); return; }
  const key = selKey, def = getDef(key), v = itemView(key), form = document.getElementById('itemForm');
  if (isRemoved(key)) {
    form.innerHTML = '<p class="removed-note">「' + esc(v.name) + '」已經刪除：對玩家來說永久從遊戲消失（開發工坊、背包、裝備欄都沒有' + (isWeapon(key) ? '，置物箱也撿不到' : '') + '，已經拿到的也清掉）。資料和圖片還在專案裡；復原後玩家要重新取得。</p>' +
      '<button type="button" class="ed-btn primary" id="itemRestore">↩ 復原這' + (isWeapon(key) ? '把武器' : '件裝備') + '</button>';
    return;
  }
  if (isCustom(key)) {   // 新增的裝備：每一項都可以改
    const a = customEntry(key);
    form.innerHTML = '<p class="hint" style="margin:0 0 8px">✨ 這是新增的裝備。效果說明是自己寫的文字；遊戲裡實際的效果（例如照明、減傷）要另外寫程式。</p>' + secTools() +
      sec('text', '📝 名稱與說明', '<div class="field">名稱<input type="text" data-c="name" value="' + esc(a.name) + '"></div>' +
        '<div class="row2"><div class="field">穿在哪裡<select data-c="kind">' + Object.entries(WORKSHOP_KINDS).map(([k, n]) => '<option value="' + k + '"' + (a.kind === k ? ' selected' : '') + '>' + n + '</option>').join('') + '</select></div>' +
        '<div class="field">怎麼拿到<select data-c="source"><option value="develop"' + (a.source !== 'field' ? ' selected' : '') + '>找諾亞開發</option><option value="field"' + (a.source === 'field' ? ' selected' : '') + '>只能在戰鬥區域拿到</option></select></div></div>' +
        (a.source === 'field' ? '<div class="field">取得方式的說明<textarea data-c="where">' + esc(a.where) + '</textarea><span class="hint">還沒拿到時顯示在說明下面，整段照寫的顯示；寫到「戰鬥區域」或外觀設定裡列的字（例如上鎖的置物櫃）會是紫色。要真的放進置物箱等地方，還需要另外設定。</span></div>' : '') +
        '<div class="field">說明（已擁有）<textarea data-c="ownedDesc" placeholder="空白＝不顯示">' + esc(a.ownedDesc || '') + '</textarea><span class="hint">顯示在開發工坊下方說明欄的名稱下面（沒拿到的裝備也一樣用這段）。</span></div>') +
      sec('image', '🖼️ 圖片', imageField(key, v, 'data-c') + iconScaleField(key) + iconOffField(key) + infoImgOffField(key) + infoImgSizeField(key)) +
      sec('layout', '📐 下方說明欄的版面（只調這件）', infoPartsField(key, 'data-c', 'data-c="ownedDesc"')) +
      sec('cost', '💎 要花幾個異質碎片、多少經費', '<div class="row2" style="grid-template-columns:repeat(' + WORKSHOP_MAX_LV + ', 1fr)">' +
        WORKSHOP_LV_INDEX.map(i => i ? '升到 Lv' + (i + 1) : '開發').map((n, i) => '<div class="field">' + n + '<input type="text" inputmode="numeric" data-c="cost' + i + '" value="' + esc(a.cost[i]) + '"></div>').join('') + '</div>' +
        moneyFields(key, WORKSHOP_LV_INDEX.map(i => i ? '升到 Lv' + (i + 1) : '開發'), i => a.cost[i])) +
      sec('levels', '📈 每一級的效果說明', WORKSHOP_LV_INDEX.map(i => '<div class="field">Lv' + (i + 1) + ' 的效果說明<input type="text" data-c="lv' + i + '" value="' + esc(a.levels[i]) + '"></div>').join('')) +
      '<button type="button" class="ed-btn danger" id="itemDelete">🗑 刪除這件裝備</button>';
    return;
  }
  const base = WORKSHOP_BASE[key] || {}, field = isField(key, def);
  form.innerHTML = secTools() +
    sec('text', '📝 名稱與說明', '<div class="field">名稱<input type="text" data-f="name" value="' + esc(v.name) + '"></div>' +
      '<div class="field">說明（已擁有）<textarea data-f="ownedDesc" placeholder="空白＝不顯示">' + esc(v.ownedDesc || '') + '</textarea>' +
        '<span class="hint">顯示在開發工坊下方說明欄的名稱下面，下面接著這件的詳細數值；第一次拿到時的介紹也用這段。跟背包編輯器連通（換行各自保留）。</span></div>' +
      (field ? '<div class="field">取得方式的說明<textarea data-f="where">' + esc(v.where) + '</textarea><span class="hint">還沒拿到時顯示在說明下面，整段照寫的顯示（前面不會再自動加字）；寫到「戰鬥區域」或外觀設定裡列的字（例如上鎖的置物櫃）會是紫色。</span></div>' : '')) +
    sec('image', '🖼️ 圖片', imageField(key, v, 'data-f') + iconScaleField(key) + iconOffField(key) + infoImgOffField(key) + infoImgSizeField(key)) +
    sec('layout', '📐 下方說明欄的版面（只調這件）', infoPartsField(key, 'data-f', 'data-f="ownedDesc"')) +
    sec('values', '🔢 每一級的實際數值', valueTable(key)) +
    sec('cost', '💎 要花幾個異質碎片、多少經費', costFields(key, def) +
      moneyFields(key, baseCost(key).map((_, i) => isWeapon(key) ? '升到 Lv' + (i + 2) : i ? '升到 Lv' + (i + 1) : '開發'), i => effCost(key, i))) +
    sec('levels', '📈 每一級的效果說明', '<div class="field">開發工坊、背包、裝備欄都會顯示<span class="hint">會跟著上面的數值自動更新；也可以自己改成別的文字，清空＝回到自動產生。</span></div>' +
      WORKSHOP_LV_INDEX.map(i => '<div class="field">Lv' + (i + 1) + '<input type="text" data-lv="' + i + '" value="' + esc(workshopPlain(statText(key, i))) + '" placeholder="' + esc(workshopPlain(autoText(key, i))) + '"></div>').join('')) +
    '<div class="img-btns"><button type="button" class="ed-btn" id="itemReset"' + (itemChanged(key) ? '' : ' disabled') + '>恢復為初始設定</button>' +
    '<button type="button" class="ed-btn danger" id="itemDelete">🗑 刪除這' + (isWeapon(key) ? '把武器' : '件裝備') + '</button></div>' +
    (base.name !== v.name ? '<span class="hint">原本叫「' + esc(base.name) + '」</span>' : '');
}
// 子彈、彈匣的表單：名稱、圖片（子彈）、說明、費用、數量
function renderAmmoForm() {
  const key = selKey, v = itemView(key), b = ammoBase(key), form = document.getElementById('itemForm');
  const numIn = (attr, val, base) => '<input type="text" inputmode="numeric" ' + attr + ' value="' + esc(val) + '" placeholder="' + esc(base) + '"' + (val !== base ? ' class="is-edited"' : '') + '>';
  let h = '<p class="hint" style="margin:0 0 8px">' + (isMag(key) ? '🧰 彈匣：在開發工坊升級，等級越高裝得下越多種子彈（一般子彈不佔格子）。' : '🔫 子彈：找諾亞開發一次就有，每次出勤自動補滿。子彈的效果固定、不會升級。') + '</p>' + secTools() +
    sec('text', '📝 名稱與說明', '<div class="field">名稱<input type="text" data-a="name" value="' + esc(v.name) + '"></div>' +
      '<div class="field">說明<textarea data-a="desc" placeholder="空白＝原本的說明">' + esc(v.ownedDesc) + '</textarea><span class="hint">顯示在開發工坊下方說明欄的名稱下面。跟背包編輯器連通（換行各自保留）。</span></div>') +
    sec('image', '🖼️ 圖片', (isMag(key) ? '' : imageField(key, v, 'data-a')) + iconScaleField(key) + iconOffField(key) + infoImgOffField(key) + infoImgSizeField(key)) +
    sec('layout', '📐 下方說明欄的版面（只調這件）', infoPartsField(key, 'data-a', 'data-a="desc"'));
  if (isMag(key)) {
    const slots = ammoVal(key, 'slots'), cost = ammoVal(key, 'cost');
    h += sec('cost', '💎 格數與費用', '<div class="field">每一級裝得下幾種子彈<span class="hint">一般子彈不算在內。</span></div><div class="cost-row" style="grid-template-columns:repeat(' + slots.length + ', minmax(0, 1fr))">' +
      slots.map((n, i) => '<label class="field">Lv' + (i + 1) + numIn('data-a="slots" data-ai="' + i + '"', n, b.slots[i]) + '</label>').join('') + '</div>' +
      '<div class="field">升級要花幾個異質碎片</div><div class="cost-row" style="grid-template-columns:repeat(' + cost.length + ', minmax(0, 1fr))">' +
      cost.map((n, i) => '<label class="field">升到 Lv' + (i + 2) + numIn('data-a="cost" data-ai="' + i + '"', n, b.cost[i]) + '</label>').join('') + '</div>' +
      moneyFields(key, cost.map((_, i) => '升到 Lv' + (i + 2)), i => ammoVal(key, 'cost')[i]));
  } else {
    h += sec('cost', '💎 費用與數量', '<div class="row2"><label class="field">開發要幾個異質碎片' + numIn('data-a="cost"', ammoVal(key, 'cost'), b.cost) + '</label>' +
      '<label class="field">最多帶幾發' + numIn('data-a="max"', ammoVal(key, 'max'), b.max) + '</label></div>' +
      moneyFields(key, ['開發'], () => ammoVal(key, 'cost')));
  }
  h += '<div class="img-btns"><button type="button" class="ed-btn" id="itemReset"' + (ammoChanged(key) ? '' : ' disabled') + '>恢復為初始設定</button></div>' +
    (b.name !== v.name ? '<span class="hint">原本叫「' + esc(b.name) + '」</span>' : '');
  form.innerHTML = h;
}
function onAmmoInput(e) {   // 子彈、彈匣：只記改過的（跟原本一樣＝不用記）
  const f = e.target.dataset.a; if (!f) return;
  const b = ammoBase(selKey), o = cfg.items[selKey] || (cfg.items[selKey] = {}), txt = e.target.value;
  if (AMMO_FIELDS.includes(f)) { if (txt === '' || txt === b[f]) delete o[f]; else o[f] = txt; }
  else {
    const t = txt.trim(); if (t !== '' && !/^\d+$/.test(t)) return;   // 只收整數（打到一半先不套用）
    const n = t === '' ? null : Number(t);
    if (Array.isArray(b[f])) {
      const i = +e.target.dataset.ai, arr = Array.isArray(o[f]) ? o[f] : b[f].map(() => null);
      arr[i] = n === null || n === b[f][i] ? null : n;
      if (arr.some(x => x !== null)) o[f] = arr; else delete o[f];
      e.target.classList.toggle('is-edited', arr[i] !== null);
    } else { if (n === null || n === b[f]) delete o[f]; else o[f] = n; e.target.classList.toggle('is-edited', f in o); }
  }
  if (!Object.keys(o).length) delete cfg.items[selKey];
  document.getElementById('itemReset').disabled = !ammoChanged(selKey);
  if (f === 'image') { const th = document.querySelector('#itemForm .thumb'); if (th) th.innerHTML = iconHtml(selKey, itemView(selKey)); }
  saveDraft(); renderList(); renderPreview();
}
document.getElementById('itemForm').addEventListener('input', e => {
  // 名稱、說明在表單裡有兩格（上面原本的、下面「下方說明欄的版面」裡的）：打一格，另一格跟著變
  for (const a of ['f', 'c', 'a']) { const k = e.target.dataset[a]; if (k) document.querySelectorAll('#itemForm [data-' + a + '="' + k + '"]').forEach(el => { if (el !== e.target && el.value !== e.target.value) el.value = e.target.value; }); }
  if (e.target.dataset.money !== undefined) {   // 經費（空白＝自動；只收整數，打到一半先不套用）
    const t = e.target.value.trim(); if (t !== '' && !/^\d+$/.test(t)) return;
    setMoney(+e.target.dataset.money, t); e.target.classList.toggle('is-edited', t !== '');
    saveDraft(); renderList(); renderPreview(); return;
  }
  if (e.target.dataset.wt) {   // 下方說明欄某一塊改過的字（空白＝原本的字）
    const [p, f] = e.target.dataset.wt.split(':');
    setInfoPart(p, f, e.target.value); saveDraft(); renderList(); renderPreview(); return;
  }
  if (e.target.dataset.wp) {   // 下方說明欄的版面（每件各自；裝備、武器、子彈、彈匣都一樣）
    const [p, f] = e.target.dataset.wp.split(':'), txt = e.target.value.trim(), n = Math.round(Number(txt));
    if (txt !== '' && (!Number.isFinite(n) || (f !== 'x' && f !== 'y' && n < 0))) return;   // 打到一半、負的寬高先不套用
    setInfoPart(p, f, txt === '' ? 0 : n); saveDraft(); renderList(); renderPreview(); return;
  }
  if (isAmmo(selKey) && !e.target.matches('[data-io], [data-is], [data-iss]')) { onAmmoInput(e); return; }   // 圖片大小、位移：子彈、彈匣也用下面同一套
  const f = e.target.dataset.f, cf = e.target.dataset.c, lvi = e.target.dataset.lv, vk = e.target.dataset.vk, ci = e.target.dataset.cost;
  if (e.target.dataset.io) {   // 圖片位移（px）
    const n = Math.round(Number(e.target.value)); if (e.target.value.trim() === '' || !Number.isFinite(n)) return;
    setIconOff(e.target.dataset.io, n);
  } else if (e.target.hasAttribute('data-iss')) {   // 說明欄的圖片大小（px）：直接打數字（打到一半先不套用）
    const n = Math.round(Number(e.target.value)); if (e.target.value.trim() === '' || !Number.isFinite(n) || n < 8) return;
    setInfoImgSize(n);
  } else if (e.target.hasAttribute('data-is')) {   // 圖片大小（%）：直接打數字（打到一半、超出範圍先不套用）
    const n = Math.round(Number(e.target.value)); if (!Number.isFinite(n) || n < 30 || n > 200) return;
    setIconScale(n);
  } else if (ci !== undefined) {   // 原本的裝備／武器：開發／升級的費用
    const i = +ci, txt = e.target.value.trim(), base = baseCost(selKey)[i];
    if (txt !== '' && !/^\d+$/.test(txt)) return;   // 只收整數（打到一半先不套用）
    const o = cfg.items[selKey] || (cfg.items[selKey] = {});
    const arr = Array.isArray(o.cost) ? o.cost : baseCost(selKey).map(() => null);
    const n = txt === '' ? null : Number(txt);
    arr[i] = n === null || n === base ? null : n;   // 空白或跟原本一樣＝不用記
    e.target.classList.toggle('is-edited', arr[i] !== null);
    if (arr.some(x => x !== null)) o.cost = arr; else delete o.cost;
    if (!Object.keys(o).length) delete cfg.items[selKey];
    document.getElementById('itemReset').disabled = !itemChanged(selKey);
  } else if (vk !== undefined) {   // 原本的裝備／武器：某一級的實際數值
    const i = +e.target.dataset.vi, info = valueInfo(vk), txt = e.target.value.trim(), base = (baseLevel(selKey, i) || {})[vk];
    const o = cfg.items[selKey] || (cfg.items[selKey] = {});
    const vals = Array.isArray(o.values) ? o.values : WORKSHOP_LV_INDEX.map(() => ({}));
    vals[i] = vals[i] || {};
    if (txt === '') delete vals[i][vk];   // 空白＝用原本的
    else {
      const n = Number(txt);
      if (!Number.isFinite(n)) vals[i][vk] = txt;   // 不是數字（文字、符號）：照打的字記下來，只顯示在效果說明
      else { const raw = Math.round(n / (info.scale || 1) * 1e6) / 1e6; if (raw === base) delete vals[i][vk]; else vals[i][vk] = raw; }
      e.target.classList.toggle('is-text', !Number.isFinite(n));
    }
    if (txt === '') e.target.classList.remove('is-text');
    if (vals.some(v => v && Object.keys(v).length)) o.values = vals; else delete o.values;
    if (!Object.keys(o).length) delete cfg.items[selKey];
    // 沒自己改過文字的那幾級：效果說明跟著新數值更新
    document.querySelectorAll('#itemForm [data-lv]').forEach(inp => {
      const j = +inp.dataset.lv, t = levelEdits(selKey)[j];
      inp.placeholder = workshopPlain(autoText(selKey, j));
      if (!(typeof t === 'string' && t !== '')) inp.value = workshopPlain(autoText(selKey, j));
    });
    document.getElementById('itemReset').disabled = !itemChanged(selKey);
  } else if (lvi !== undefined) {   // 原本的裝備／武器：某一級的效果說明
    const o = cfg.items[selKey] || (cfg.items[selKey] = {});
    const i = +lvi, base = workshopPlain(autoText(selKey, i)), val = e.target.value;
    const arr = Array.isArray(o.levels) ? o.levels : WORKSHOP_LV_INDEX.map(() => '');
    arr[i] = val === base ? '' : val;   // 跟原本一樣＝不用記
    if (arr.some(t => t)) o.levels = arr; else delete o.levels;
    if (!Object.keys(o).length) delete cfg.items[selKey];
    document.getElementById('itemReset').disabled = !itemChanged(selKey);
  } else if (f) {   // 原本的裝備／武器：只記改過的
    const o = cfg.items[selKey] || (cfg.items[selKey] = {});
    const val = e.target.value, base = (WORKSHOP_BASE[selKey] || {})[f] ?? '';
    if (val === base) delete o[f]; else o[f] = val;
    if (!Object.keys(o).length) delete cfg.items[selKey];
    document.getElementById('itemReset').disabled = !itemChanged(selKey);
  } else if (cf) {   // 新增的裝備
    const a = customEntry(selKey); if (!a) return;
    const val = e.target.value;
    if (cf.startsWith('cost')) a.cost[+cf.slice(4)] = Math.max(0, Math.round(Number(val) || 0));
    else if (cf.startsWith('lv')) a.levels[+cf.slice(2)] = val;
    else a[cf] = val;
    if (cf === 'source' && val === 'field' && !a.where) a.where = '只能在戰鬥區域取得：';   // 換成戰鬥區域取得：先幫忙填好開頭，可以整段改掉
    if (cf === 'source') { saveDraft(); renderList(); renderItemForm(); renderPreview(); return; }   // 換取得方式：表單要多／少「在哪裡拿到」
  } else return;
  if ((f || cf) === 'image') { const t = document.querySelector('#itemForm .thumb'); if (t) t.innerHTML = iconHtml(selKey, itemView(selKey)); }
  saveDraft(); renderList(); renderPreview();
});
document.getElementById('itemForm').addEventListener('change', e => {   // 下拉選單（部位）
  if (e.target.dataset.c === 'kind') { const a = customEntry(selKey); if (a) { a.kind = e.target.value; saveDraft(); renderList(); renderPreview(); } }
});
document.getElementById('itemForm').addEventListener('click', async e => {
  const id = e.target.id;
  const wr = e.target.closest('[data-wp-reset]');
  if (wr) {   // 下方說明欄的某一塊歸零
    const p = wr.dataset.wpReset;
    for (const [f] of INFO_PART_FIELDS) setInfoPart(p, f, 0);
    for (const [f] of WORKSHOP_INFO_LABELS[p] || []) setInfoPart(p, f, '');   // 改過的字也拿掉（名稱、說明不動）
    wr.closest('.info-part').querySelectorAll('[data-wp], [data-wt]').forEach(inp => { inp.value = ''; });
    wr.closest('.info-part').querySelector('summary em')?.remove();
    saveDraft(); renderList(); renderPreview(); return;
  }
  const ssb = e.target.closest('[data-iss-step]');
  if (ssb) {   // 說明欄的圖片大小：↑↓ 一次 1px、回到原本
    const d = Number(ssb.dataset.issStep); setInfoImgSize(d ? infoImgSizeOf(selKey) + d : infoImgBase(selKey));
    saveDraft(); renderList(); renderPreview(); return;
  }
  const sb = e.target.closest('[data-scale]');
  if (sb) {   // 圖片大小：↑↓ 一次 1%、回到 100%
    const d = Number(sb.dataset.scale); setIconScale(d ? iconScaleOf(selKey) + d : 100);
    saveDraft(); renderList(); renderPreview(); return;
  }
  const nb = e.target.closest('[data-nudge]');
  if (nb) {   // 圖片位移：↑↓←→ 一次 1px、歸零
    if (nb.dataset.nudge === '0') { setIconOff('x', 0); setIconOff('y', 0); }
    else if (nb.dataset.nudge === 'i0') { setIconOff('ix', 0); setIconOff('iy', 0); }   // 說明欄的圖片位移歸零
    else { const [axis, d] = nb.dataset.nudge.split(':'); setIconOff(axis, iconOffOf(selKey, axis) + Number(d)); }
    saveDraft(); renderList(); renderPreview(); return;
  }
  if (id === 'itemReset') {
    delete cfg.items[selKey]; saveDraft(); renderList(); renderItemForm(); renderPreview();
    setStatus('「' + itemView(selKey).name + '」已恢復原本的設定'); return;
  }
  if (id === 'itemDelete') {
    const name = itemView(selKey).name;
    if (isCustom(selKey)) {
      if (!confirm('確定刪除新增的裝備「' + name + '」？')) return;
      cfg.added = cfg.added.filter(a => a.id !== selKey);
      selKey = BUILTIN_GEAR[0];
    } else {
      const warn = isWeapon(selKey)
        ? '刪除後這把武器對玩家來說就永久從遊戲消失：開發工坊、背包、裝備欄都看不到，置物箱也撿不到；玩家已經拿到的也會清掉（溫特如果正拿著它，會換成另一把，都沒有就空手）。'
        : '刪除後這件裝備對玩家來說就永久從遊戲消失：開發工坊、背包、裝備欄都看不到、拿不到；玩家已經拿到的也會清掉。';
      if (!confirm('確定刪除「' + name + '」？\n\n' + warn + '\n\n資料和圖片不會從專案刪掉，只是遊戲裡不出現。之後可以在清單裡點它按「復原」，但玩家要重新取得' + (isWeapon(selKey) && !isField(selKey, getDef(selKey)) ? '（一開始就有的武器會重新給 Lv1）' : '') + '。')) return;
      if (!cfg.removed.includes(selKey)) cfg.removed.push(selKey);
    }
    saveDraft(); renderList(); renderItemForm(); renderPreview();
    setStatus('已刪除「' + name + '」（還沒存到專案）'); return;
  }
  if (id === 'itemRestore') {
    cfg.removed = cfg.removed.filter(k => k !== selKey);
    saveDraft(); renderList(); renderItemForm(); renderPreview();
    setStatus('已復原「' + itemView(selKey).name + '」'); return;
  }
  if (id === 'pickImage') pickImage();
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
    const input = document.querySelector('#itemForm [data-f="image"], #itemForm [data-c="image"], #itemForm [data-a="image"]');
    input.value = path; input.dispatchEvent(new Event('input', { bubbles: true }));
    setStatus('圖片改成 ' + path);
  } catch (err) {
    if (err && err.name === 'AbortError') return;
    setStatus('選圖片失敗：' + (err && err.message || err), true);
  }
}

// ---- 外觀 ----
const STYLE_FIELDS = [
  ['標題列（工坊最上面，文字都靠左）', [
    ['headSmall', '小標的文字（空白＝不顯示）', 'text'], ['headSmallSize', '小標的文字大小', 'num', 8, 24, 1], ['headSmallColor', '小標的顏色', 'color'],
    ['headTitle', '大標題的文字（空白＝不顯示）', 'text'], ['headTitleSize', '大標題的文字大小', 'num', 12, 40, 1], ['headTitleColor', '大標題的顏色', 'color'],
    ['headSub', '說明的文字（空白＝不顯示）', 'text'], ['headSubSize', '說明的文字大小', 'num', 8, 24, 1], ['headSubColor', '說明的顏色', 'color'],
    ['headX', '整塊的左右位移（正數＝往右）', 'num', -100, 400, 1], ['headY', '整塊的上下位移（正數＝往下）', 'num', -30, 30, 1],
  ]],
  ['下方說明欄', [
    ['infoY', '整塊的上下位移（圖片、文字、按鈕一起動；負數＝往上，往下超出視窗底的部分會被切掉）', 'num', -200, 100, 1],
    ['infoImg', '', 'infoImg'],   // 圖片的位移：每件分開，這裡調的是目前選的那件（renderStyleInfoImg）
    ['infoTextX', '文字的左右位移（名稱、說明、數值一起；正數＝往右）', 'num', -150, 300, 1],
    ['infoTextY', '文字的上下位移（名稱、說明、數值一起；正數＝往下）', 'num', -80, 80, 1],
  ]],
  ['升級／開發按鈕（下方說明欄右邊的金色按鈕）', [
    ['actBtnW', '寬度（0＝照欄寬）', 'num', 0, 300, 1],
    ['actBtnH', '高度（0＝照文字）', 'num', 0, 80, 1],
    ['actBtnFont', '文字大小', 'num', 9, 28, 1],
    ['actBtnX', '左右位移（正數＝往右）', 'num', -150, 150, 1],
    ['actBtnY', '上下位移（正數＝往下）', 'num', -60, 60, 1],
  ]],
  ['工坊視窗大小', [
    ['panelW', '工坊視窗最大寬度', 'num', 700, 1400, 10],
    ['panelH', '工坊視窗最大高度', 'num', 400, 900, 10],
  ]],
  ['特別標色', [['numColor', '數字的顏色（Lv2、8 格、1.4 秒…）', 'color'], ['whereColor', '「戰鬥區域」和戰鬥區域裡的東西的顏色', 'color'], ['whereWords', '用這個顏色的字（用「、」分開，例如：戰鬥區域、上鎖的置物櫃）', 'text'], ['itemColor', '道具名稱的顏色（電池、杏仁水、急救包…）', 'color']]],
];
const styleNow = () => workshopStyle(cfg);
function renderStyleForm() {
  const st = styleNow();
  document.getElementById('styleForm').innerHTML = STYLE_FIELDS.map(([group, list]) => '<div class="style-group"><b>' + group + '</b>' + list.map(([k, label, type, min, max, step]) =>
    type === 'infoImg' ? '<div id="styleInfoImg"></div>'
    : type === 'num'
      ? '<div class="field">' + label + '（px）<div class="num"><input type="range" data-s="' + k + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + st[k] + '"><input type="number" data-s="' + k + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + st[k] + '"></div></div>'
      : type === 'text' ? '<div class="field">' + label + '<textarea data-s="' + k + '" rows="2">' + esc(st[k]) + '</textarea></div>'
      : '<div class="field">' + label + '<div class="color"><input type="color" data-s="' + k + '" value="' + esc(String(st[k]).toLowerCase()) + '"><input type="text" data-s="' + k + '" value="' + esc(st[k]) + '"></div></div>'
  ).join('') + '</div>').join('');
  renderStyleInfoImg();
}
// 外觀 → 下方說明欄裡的「圖片位移」：每件分開，調的是目前選的那件（跟上面那件的「下方說明欄的圖片位移」是同一個值）
const STYLE_INFO_IMG = [['ix', '左右', '正數＝往右', -150, 300], ['iy', '上下', '正數＝往下', -80, 80]];
function renderStyleInfoImg() {
  const box = document.getElementById('styleInfoImg'); if (!box) return;
  if (isRemoved(selKey)) { box.innerHTML = '<div class="field">圖片的位移<span class="hint">目前選的「' + esc(itemView(selKey).name) + '」已經刪除。</span></div>'; return; }
  const name = esc(itemView(selKey).name);
  box.innerHTML = STYLE_INFO_IMG.map(([axis, dir, tip, min, max]) => { const n = iconOffOf(selKey, axis);
    return '<div class="field">圖片的' + dir + '位移（只動目前選的「' + name + '」，每件分開；' + tip + '）（px）<div class="num">' +
      '<input type="range" data-sio="' + axis + '" min="' + Math.min(min, n) + '" max="' + Math.max(max, n) + '" step="1" value="' + n + '"><input type="number" data-sio="' + axis + '" step="1" value="' + n + '"></div></div>'; }).join('') +
    (() => { const n = infoImgSizeOf(selKey), b = infoImgBase(selKey);   // 圖片大小（px，長寬等比例）
      return '<div class="field">圖片的大小（只動目前選的「' + name + '」，每件分開；長寬等比例，原本＝' + b + '）（px）<div class="num">' +
        '<input type="range" data-sis min="' + Math.min(20, n) + '" max="' + Math.max(240, n) + '" step="1" value="' + n + '"><input type="number" data-sis step="1" value="' + n + '"></div></div>'; })() +
    '<span class="hint">要調別件的圖：在預覽或左邊清單點那一件。</span>';
}
document.getElementById('styleForm').addEventListener('input', e => {
  if (e.target.hasAttribute('data-sis')) {   // 目前選的那件：下方說明欄的圖片大小
    const n = Math.round(Number(e.target.value)); if (e.target.value.trim() === '' || !Number.isFinite(n) || n < 8) return;
    setInfoImgSize(n); saveDraft(); renderList(); renderPreview(); return;
  }
  if (e.target.dataset.sio) {   // 目前選的那件：下方說明欄的圖片位移
    const n = Math.round(Number(e.target.value)); if (e.target.value.trim() === '' || !Number.isFinite(n)) return;
    setIconOff(e.target.dataset.sio, n); saveDraft(); renderList(); renderPreview(); return;
  }
  const k = e.target.dataset.s; if (!k) return;
  const isNum = typeof WORKSHOP_STYLE_DEFAULT[k] === 'number';
  let val = e.target.value;
  const isText = e.target.tagName === 'TEXTAREA';   // 文字（例如「用這個顏色的字」）：照打的存
  if (isNum) { val = Number(val); if (!Number.isFinite(val)) return; }
  else if (!isText && !/^#[0-9a-f]{6}$/i.test(val)) return;   // 顏色打到一半：先不套用
  if (val === WORKSHOP_STYLE_DEFAULT[k] || (!isNum && !isText && String(val).toLowerCase() === String(WORKSHOP_STYLE_DEFAULT[k]).toLowerCase())) delete cfg.style[k]; else cfg.style[k] = val;
  document.querySelectorAll('#styleForm [data-s="' + k + '"]').forEach(el => { if (el !== e.target) el.value = isNum ? val : String(val).toLowerCase(); });   // 滑桿和數字框、色盤和色碼同步
  saveDraft(); renderPreview();
});
document.getElementById('styleReset').addEventListener('click', () => {
  cfg.style = {}; saveDraft(); renderStyleForm(); renderPreview(); setStatus('外觀已恢復預設（還沒存到專案）');
});

// ---- 預覽：照遊戲的 renderWorkshop（js/equipment.js）排出一樣的畫面 ----
// 遊戲 v3 的樣子：上面分頁（開發／升級）＋一排 6 格的正方形格子（武器在上、裝備在下）＋下面固定的說明欄＋右邊紙娃娃
const wsColor = text => workshopColorize(text, styleNow());   // js/workshop-config.js（跟遊戲同一套：數字、戰鬥區域、道具名稱）
let pvTab = 'dev';   // 預覽的分頁：'dev' 開發／'up' 升級
let pvLastSel = null;   // 上次畫預覽時選的是哪一件（換選了才跟著切分頁；自己點分頁就停在那一頁）
const pvTabOf = key => pvOwned(key) ? 'up' : isField(key, getDef(key)) ? null : 'dev';   // 跟遊戲一樣：只能在後室撿到的（武器、異質探測器…）不放開發分頁
const pvTier = lv => ' tier-' + Math.max(1, Math.min(5, lv || 1));
function pvIcon(key) {   // 格子裡的圖（套用編輯中的圖片大小、位移；跟遊戲一樣，js/workshop-config.js）
  const def = getDef(key), v = itemView(key);
  const iv = workshopIconVars(iconScaleOf(key), iconOffOf(key, 'x'), iconOffOf(key, 'y')), st = iv ? ' style="' + iv + '"' : '';
  return v.image ? '<img' + st + ' src="' + esc(v.image) + '" alt="">' : '<i' + st + '>' + esc(def.icon || '') + '</i>';
}
function previewTile(key) {
  const def = getDef(key), v = itemView(key), owned = pvOwned(key), lv = owned ? pvLv(key) : 0;
  return '<button type="button" class="ws-tile' + (lv ? pvTier(lv) + ' owned' : isField(key, def) ? ' locked' : ' unowned') + (key === selKey ? ' sel ed-sel' : '') + '" draggable="true" data-key="' + esc(key) + '">' +
    '<span class="ws-tile-icon">' + pvIcon(key) + '</span><b>' + esc(v.name) + '</b>' + (lv ? '<em>Lv' + lv + '</em>' : '') + '</button>';
}
// 下方說明欄（跟遊戲、背包一樣：大圖｜名稱、說明、數值｜按鈕）
function previewInfo(key) {
  const def = getDef(key), v = itemView(key), w = isWeapon(key), owned = pvOwned(key), lv = owned ? pvLv(key) : 0, maxLv = def.levels.length;
  const cost = n => '<b><i class="ws-shard" role="img" aria-label="異質碎片"></i>' + n + '</b>';
  const img = v.image ? '<img src="' + esc(v.image) + '" alt=""' + (w ? ' class="weapon"' : '') + '>' : '<i class="bag-gear-emoji">' + esc(def.icon || '') + '</i>';
  const worn = Object.values(pv.equipped).includes(key);
  const L = infoLabelFn(key, lv);   // 五塊改過的字（編輯中的值）
  const tags = (lv ? '<span class="bag-tag effect">' + L('tag', 'lv', 'Lv' + lv) + '</span>' : isField(key, def) ? '<span class="bag-tag">' + L('tag', 'field', '戰鬥區域取得') + '</span>' : '<span class="bag-tag">' + L('tag', 'dev', '未開發') + '</span>') + (worn ? '<span class="bag-tag worn">穿戴中</span>' : '');
  let stats, btn;
  if (lv) {
    stats = '<div class="bag-gear-stat"><small>' + L('stats', 'now', '目前效果（Lv' + lv + '）') + '</small><b>' + wsColor(esc(statText(key, lv - 1))) + '</b></div>' +
      (lv < maxLv ? '<div class="bag-gear-stat next"><small>' + L('stats', 'next', '升級後（Lv' + (lv + 1) + '）') + '</small><b>' + wsColor(esc(statText(key, lv))) + '</b></div>' : '');
    btn = lv < maxLv ? '<button type="button" class="ws-btn">' + L('btn', 'up', '升級') + ' ' + cost(effCost(key, w ? lv - 1 : lv)) + '</button>' : '<button type="button" class="ws-btn" disabled>已達最高等級</button>';
  } else if (!isField(key, def)) {
    stats = '<div class="bag-gear-stat next"><small>' + L('stats', 'dev', '開發後（Lv1）') + '</small><b>' + wsColor(esc(statText(key, 0))) + '</b></div>';
    btn = '<button type="button" class="ws-btn">' + L('btn', 'dev', '開發') + ' ' + cost(effCost(key, 0)) + '</button>';
  } else {
    stats = '<div class="bag-gear-stat where"><small>' + L('stats', 'where', '取得方式') + '</small><b>' + wsColor(esc(v.where || '只能在戰鬥區域取得')) + '</b></div>';
    btn = '<button type="button" class="ws-btn" disabled>尚未取得</button>';
  }
  // 經費（跟遊戲一樣：能開發／升級的時候才有，寫在按鈕裡碎片的上面，js/workshop-config.js 的 workshopPriceBtn）
  const mi = lv ? (lv < maxLv ? (w ? lv - 1 : lv) : -1) : isField(key, def) ? -1 : 0;
  const cash = mi < 0 ? 0 : workshopMoney(key, mi, effCost(key, mi), cfg);
  const about = v.ownedDesc || v.desc || '';   // 說明只有一段（跟遊戲一樣）
  const io = workshopInfoImgVars(iconOffOf(key, 'ix'), iconOffOf(key, 'iy'), iconOffOf(key, 'is'));   // 這件自己的圖片位移、大小（編輯中的值）
  const part = p => workshopInfoPartAttr(key, p, cfg);   // 五塊每件各自的位置、大小、字級（編輯中的值）
  return '<div class="bag-detail-image"' + (io ? ' style="' + io + '"' : '') + '>' + img + '</div><div class="ws-info-text"><div class="bag-gear-heading"><h3' + part('name') + '>' + esc(v.name) + '</h3><div class="bag-tags"' + part('tag') + '>' + tags + '</div></div>' +
    (about ? '<p class="bag-desc"' + part('desc') + '>' + wsColor(esc(about)) + '</p>' : '') + '<div class="ws-info-stats"' + part('stats') + '>' + stats + '</div></div><div class="bag-actions"' + part('btn') + '>' + workshopPriceBtn(workshopInfoBtnStyle(key, btn, cfg), cash, false) + '</div>';   // 按鈕本身的寬高字級；按鈕下面接經費框
}
// 子彈、彈匣的說明欄（跟遊戲一樣：js/equipment.js 的 renderWorkshop＋js/magazine.js）
function ammoPreviewInfo(key) {
  const v = itemView(key), owned = pvOwned(key), lv = owned ? pvLv(key) : 0;
  const cost = n => '<b><i class="ws-shard" role="img" aria-label="異質碎片"></i>' + n + '</b>';
  const img = v.image ? '<img src="' + esc(v.image) + '" alt="">' : '<i class="bag-gear-emoji">' + esc(getDef(key).icon) + '</i>';
  let stats, btn, tag;
  const L = infoLabelFn(key, isMag(key) ? lv : owned ? 1 : 0);   // 五塊改過的字（編輯中的值）
  if (isMag(key)) {
    const slots = ammoVal(key, 'slots'), costs = ammoVal(key, 'cost');
    tag = '<span class="bag-tag effect">' + L('tag', 'lv', 'Lv' + lv) + '</span>';
    stats = '<div class="bag-gear-stat"><small>' + L('stats', 'now', '目前效果（Lv' + lv + '）') + '</small><b>' + wsColor('彈匣 ' + slots[lv - 1] + ' 格') + '</b></div>' +
      (lv < slots.length ? '<div class="bag-gear-stat next"><small>' + L('stats', 'next', '升級後（Lv' + (lv + 1) + '）') + '</small><b>' + wsColor('彈匣 ' + slots[lv] + ' 格') + '</b></div>' : '');
    btn = lv < slots.length ? '<button type="button" class="ws-btn">' + L('btn', 'up', '升級') + ' ' + cost(costs[lv - 1]) + '</button>' : '<button type="button" class="ws-btn" disabled>已達最高等級</button>';
  } else {
    const line = wsColor('最多帶 ' + ammoVal(key, 'max') + ' 發・出勤時自動補滿' + (owned ? '・到背包的「武器」分頁裝進彈匣' : ''));
    tag = owned ? '<span class="bag-tag effect">' + L('tag', 'lv', 'Lv1') + '</span>' : '<span class="bag-tag">' + L('tag', 'dev', '未開發') + '</span>';
    stats = '<div class="bag-gear-stat' + (owned ? '' : ' next') + '"><small>' + (owned ? L('stats', 'now', '目前效果（Lv1）') : L('stats', 'dev', '開發後（Lv1）')) + '</small><b>' + line + '</b></div>';
    btn = owned ? '<button type="button" class="ws-btn" disabled>已開發</button>' : '<button type="button" class="ws-btn">' + L('btn', 'dev', '開發') + ' ' + cost(ammoVal(key, 'cost')) + '</button>';
  }
  const about = v.ownedDesc || '';
  // 經費：彈匣還能升級／子彈還沒開發的時候才有（寫在按鈕裡碎片的上面）
  const cash = isMag(key) ? (lv < ammoVal(key, 'slots').length ? workshopMoney(key, lv - 1, ammoVal(key, 'cost')[lv - 1], cfg) : 0)
    : owned ? 0 : workshopMoney(key, 0, ammoVal(key, 'cost'), cfg);
  const part = p => workshopInfoPartAttr(key, p, cfg);   // 五塊每件各自的位置、大小、字級（編輯中的值）
  const io = workshopInfoImgVars(iconOffOf(key, 'ix'), iconOffOf(key, 'iy'), iconOffOf(key, 'is'));   // 這件自己的說明欄圖片位移、大小
  return '<div class="bag-detail-image"' + (io ? ' style="' + io + '"' : '') + '>' + img + '</div><div class="ws-info-text"><div class="bag-gear-heading"><h3' + part('name') + '>' + esc(v.name) + '</h3><div class="bag-tags"' + part('tag') + '>' + tag + '</div></div>' +
    (about ? '<p class="bag-desc"' + part('desc') + '>' + wsColor(esc(about)) + '</p>' : '') + '<div class="ws-info-stats"' + part('stats') + '>' + stats + '</div></div><div class="bag-actions"' + part('btn') + '>' + workshopPriceBtn(workshopInfoBtnStyle(key, btn, cfg), cash, false) + '</div>';   // 按鈕本身的寬高字級；按鈕下面接經費框
}
// 拖曳調整過順序（cfg.order 有這一區）才顯示「恢復原本順序」
const orderCustom = kind => Array.isArray(cfg.order[kind]);
function renderPreview() {
  const st = styleNow(), stage = document.getElementById('previewStage');
  const keepScroll = stage.querySelector('.ws-scroll')?.scrollTop || 0, keepSide = stage.querySelector('.workshop-side')?.scrollTop || 0;
  stage.style.width = (st.panelW + 32) + 'px'; stage.style.height = (st.panelH + 32) + 'px';   // 跟遊戲一樣：視窗外面留 16px
  if (selKey !== pvLastSel && selKey && !isRemoved(selKey) && getDef(selKey) && pvTabOf(selKey)) pvTab = pvTabOf(selKey);   // 左邊換選了別件：預覽切到它在的分頁
  pvLastSel = selKey;
  const shown = k => !isRemoved(k) && pvTabOf(k) === pvTab;   // 刪掉的不顯示；新增的接在最後面
  const gearKind = k => workshopGearGroup(getDef(k).kind);   // 頭部／上身／下身／隨身物品（跟遊戲一樣分組）
  const weapons = weaponKeys().filter(shown), gear = WORKSHOP_GEAR_GROUPS.flatMap(([g]) => gearKeys().filter(k => shown(k) && gearKind(k) === g));
  const mags = AMMO_KEYS.filter(k => isMag(k) && shown(k)), bullets = AMMO_KEYS.filter(k => !isMag(k) && shown(k)), list = weapons.concat(mags, bullets, gear);
  // 說明欄顯示選的那件；還沒拿到、工坊格子裡沒有的（只能在戰鬥區域拿到的武器、異質探測器…）也照樣顯示，才能調圖片位置、說明
  const noTab = selKey && !isRemoved(selKey) && getDef(selKey) && !pvTabOf(selKey);
  const pick = list.includes(selKey) || noTab ? selKey : list[0];
  const section = (title, keys) => keys.length ? '<h3>' + title + '</h3><div class="ws-tiles" data-kind="' + (title === '武器' ? 'weapons' : 'gear') + '">' + keys.map(previewTile).join('') + '</div>' : '';
  const count = tab => allKeys().concat(AMMO_KEYS).filter(k => !isRemoved(k) && pvTabOf(k) === tab).length;
  const tabs = '<div class="backpack-tabs ws-tabs" role="tablist">' + [['dev', '⚙️ 可開發'], ['up', WS_UP_ICON + ' 可升級']].map(([id, label]) =>
    '<button type="button" role="tab" data-pv-tab="' + id + '" class="' + (pvTab === id ? 'active' : '') + '">' + label + ' <em>' + count(id) + '</em></button>').join('') + '</div>';
  const empty = pvTab === 'up' ? '還沒有可以升級的裝備（換上面的「裝備狀態」看看）' : '所有裝備都已經拿到了';
  const side = pvSideHtml();   // 右側：目前裝備、背包裡的裝備、分解（預覽用，不會影響遊戲）
  stage.innerHTML = '<div id="workshop"><section class="workshop-card" role="dialog" aria-label="開發工坊預覽">' +
    '<header class="workshop-head">' + workshopHeadHtml(cfg) +
    '<button type="button" class="workshop-close" aria-label="關閉">×</button></header>' +
    '<div class="workshop-main"><div class="workshop-body">' + tabs +
    '<div class="ws-scroll">' + (list.length ? section('武器', weapons) + section('彈匣', mags) + section('子彈', bullets) + WORKSHOP_GEAR_GROUPS.map(([g, title]) => section(title, gear.filter(k => gearKind(k) === g))).join('') : '<p class="ws-empty">' + empty + '</p>') + '</div>' +
    '<div class="ws-info' + (pick ? '' : ' empty') + '">' + (pick ? (isAmmo(pick) ? ammoPreviewInfo(pick) : previewInfo(pick)) : '<div class="bag-detail-empty"><span>🔧</span><p>' + empty + '</p></div>') + '</div></div>' +
    side + '</div></section></div>';
  const ws = stage.querySelector('#workshop');
  ws.style.padding = '16px';
  applyWorkshopStyle(ws, cfg);
  const body = stage.querySelector('.ws-scroll'); if (body) body.scrollTop = keepScroll;
  const sideEl = stage.querySelector('.workshop-side'); if (sideEl) sideEl.scrollTop = keepSide;
  if (document.getElementById('assetGrid')) renderAssets();
  document.getElementById('autoArrange').hidden = !orderCustom('gear') && !orderCustom('weapons');   // 拖曳過才出現
}
// 預覽的裝備狀態（按鈕）：start＝全體未開發、未撿到；lv1～lv5＝全部那一級（最高級＝已達最高等級）
let previewMode = 'start';
// ---- 預覽右側：可以穿上／卸下、選了可以分解（只是預覽、測試用，不會動到遊戲的存檔）----
// 擁有的東西照「裝備狀態」：全體未開發＝只有一開始就有的武器（Lv1）；全部 LvN＝每一件都是 LvN。
const PV_SLOTS = [
  { id: 'main', name: '主武器', weapon: true }, { id: 'sub', name: '副武器', weapon: true },
  ...EQUIP_SLOTS.map(sl => ({ id: sl.id, name: sl.name, kinds: sl.kinds })),
];
const pv = { equipped: {}, scrapped: new Set(), sel: null, armed: false, menu: null };
let pvArmTimer = null;
function pvOwned(key) {
  if (isMag(key)) return true;   // 彈匣一開始就有（Lv1）
  if (isRemoved(key) || pv.scrapped.has(key) || !getDef(key)) return false;
  return previewMode === 'start' ? isWeapon(key) && !isField(key, getDef(key)) : true;
}
const pvLv = key => previewMode === 'start' ? 1 : Math.min(getDef(key).levels.length, +previewMode.slice(2) || 1);
function pvReset() {   // 換裝備狀態：回到遊戲一開始的穿法（主武器手槍、副武器照明彈槍）
  pv.equipped = { main: pvOwned('w:pistol') ? 'w:pistol' : null, sub: pvOwned('w:flare') ? 'w:flare' : null };
  pv.scrapped = new Set(); pv.sel = null; pv.armed = false; pv.menu = null;
}
pvReset();
const pvFits = (slot, key) => slot.weapon ? isWeapon(key) : !isWeapon(key) && slot.kinds.includes(getDef(key).kind);
function pvRefund(key) {   // 跟遊戲一樣：Lv1＝開發費用的一半；Lv2 以上＝升到目前這級的費用的一半；戰鬥區域撿到的 Lv1＝0
  const lv = pvLv(key), w = isWeapon(key), def = getDef(key);
  const paid = lv >= 2 ? effCost(key, w ? lv - 2 : lv - 1) : (!w && !isField(key, def) ? effCost(key, 0) : 0);
  return Math.floor((paid || 0) / 2);
}
function pvSideHtml() {   // 跟遊戲一樣的紙娃娃：溫特＋主／副武器、頭部、上身、下身 ×2、隨身物品 ×2；點格子＝穿上／卸下、選了可以分解
  for (const k of Object.keys(pv.equipped)) if (pv.equipped[k] && !pvOwned(pv.equipped[k])) pv.equipped[k] = null;   // 刪掉的、分解掉的：卸下
  const icon = key => { const v = itemView(key), d = getDef(key); return v.image ? '<img src="' + esc(v.image) + '" alt="">' : '<i>' + esc(d.icon || '') + '</i>'; };
  const slots = PV_SLOTS.map(sl => {
    const key = pv.equipped[sl.id], lv = key && pvLv(key), name = key ? itemView(key).name : sl.name;
    return '<div class="doll-slot' + (sl.weapon ? ' weapon' : '') + (key ? ' filled' + pvTier(lv) : '') + (key && pv.sel === key ? ' sel' : '') + (pv.menu === sl.id ? ' picking' : '') + '" data-pv-slot="' + sl.id + '" title="' + esc(sl.name + '：' + (key ? name + ' Lv' + lv : '未裝備')) + '">' +
      '<span>' + (key ? icon(key) + '<em>Lv' + lv + '</em>' : '＋') + '</span><small>' + esc(name) + '</small></div>';
  }).join('');
  const sl = pv.menu && PV_SLOTS.find(s => s.id === pv.menu), cur = sl && pv.equipped[sl.id];
  const menu = sl ? '<div class="pv-slot-menu"><b>' + esc(sl.name) + '</b>' +
    allKeys().filter(k => pvOwned(k) && pvFits(sl, k)).map(k => '<button type="button" data-pv-equip="' + sl.id + ':' + esc(k) + '"' + (k === cur ? ' class="on"' : '') + '>' + esc(itemView(k).name) + ' <em>Lv' + pvLv(k) + '</em></button>').join('') +
    (cur ? '<button type="button" data-pv-equip="' + sl.id + ':" class="off">卸下</button>' : '') +
    (allKeys().some(k => pvOwned(k) && pvFits(sl, k)) || cur ? '' : '<p>沒有能穿在這格的（換上面的「裝備狀態」）</p>') + '</div>' : '';
  const art = '<img class="doll-art" src="' + EQUIP_PORTRAIT.image + '" alt="溫特" onerror="this.onerror=null;this.src=\'' + EQUIP_PORTRAIT.fallback + '\';this.classList.add(\'sprite\')">';
  const worn = new Set(Object.values(pv.equipped).filter(Boolean));
  const spare = gearKeys().filter(k => pvOwned(k) && !worn.has(k)).map(k => { const v = itemView(k);
    return '<span class="wss-item' + pvTier(pvLv(k)) + (pv.sel === k ? ' sel' : '') + '" data-pv-item="' + esc(k) + '" title="' + esc(v.name) + ' Lv' + pvLv(k) + '">' + icon(k) + '<em>Lv' + pvLv(k) + '</em></span>'; }).join('');
  let bottom = '<p class="wss-tip">點格子＝穿上／卸下（預覽用）</p>';
  if (pv.sel && pvOwned(pv.sel)) {
    const name = itemView(pv.sel).name;
    bottom = pv.sel === 'w:pistol'
      ? '<div class="wss-scrap"><button type="button" class="wss-scrap-btn" disabled>無法分解</button><small>「' + esc(name) + '」是溫特一開始就持有的武器，不能分解或丟棄</small></div>'
      : '<div class="wss-scrap"><button type="button" class="wss-scrap-btn' + (pv.armed ? ' armed' : '') + '" data-pv-scrap>' + (pv.armed ? '確定分解「' + esc(name) + '」？' : '分解裝備') + '</button>' +
        '<small>返還一半的異質碎片（<i class="ws-shard" role="img" aria-label="異質碎片"></i>' + pvRefund(pv.sel) + '）</small></div>';
  }
  return '<aside class="workshop-side"><h3>目前裝備</h3><div class="equip-doll">' + art + '<div class="doll-slots">' + slots + '</div></div>' + menu +
    '<h3>背包裡的裝備</h3>' + (spare ? '<div class="wss-grid">' + spare + '</div>' : '<p class="wss-empty">無</p>') + bottom + '</aside>';
}
const allKeys = () => gearKeys().concat(weaponKeys());
function pvEquip(slotId, key) {
  if (key) for (const [k, v] of Object.entries(pv.equipped)) if (v === key && k !== slotId) pv.equipped[k] = pv.equipped[slotId] || null;   // 已經穿在別格：兩格交換
  pv.equipped[slotId] = key || null; pv.menu = null;
}
// 右側的點擊（在 previewStage 的點擊裡最先處理）：回傳 true＝處理掉了
function pvSideClick(e) {
  if (!e.target.closest('.workshop-side')) return false;
  const eq = e.target.closest('[data-pv-equip]');
  if (eq) { const [slot, key] = eq.dataset.pvEquip.split(/:(.*)/s); pvEquip(slot, key); renderPreview(); return true; }
  if (e.target.closest('[data-pv-scrap]')) {   // 分解：按兩次才算（跟遊戲一樣）；預覽裡只是拿掉，不會影響遊戲
    const key = pv.sel; if (!key) return true;
    if (!pv.armed) { pv.armed = true; clearTimeout(pvArmTimer); pvArmTimer = setTimeout(() => { if (pv.armed) { pv.armed = false; renderPreview(); } }, 3000); renderPreview(); return true; }
    clearTimeout(pvArmTimer); pv.armed = false; pv.scrapped.add(key); pv.sel = null;
    setStatus('（預覽）分解了「' + itemView(key).name + '」，返還 ' + pvRefund(key) + ' 個異質碎片——只是預覽，換「裝備狀態」就會回來，不會影響遊戲');
    renderPreview(); return true;
  }
  const slot = e.target.closest('[data-pv-slot]');
  if (slot) {
    const id = slot.dataset.pvSlot, key = pv.equipped[id];
    pv.menu = pv.menu === id ? null : id;   // 打開／關掉這格的選單
    if (key) { pv.sel = pv.sel === key && !pv.menu ? null : key; pv.armed = false; }
    renderPreview(); return true;
  }
  const item = e.target.closest('[data-pv-item]');
  if (item) { const k = item.dataset.pvItem; pv.sel = pv.sel === k ? null : k; pv.armed = false; pv.menu = null; renderPreview(); return true; }
  if (pv.menu) { pv.menu = null; renderPreview(); }
  return true;
}
function renderPreviewModes() {
  const modes = [['start', '全體未開發、未撿到']].concat(WORKSHOP_LV_INDEX.map(i => ['lv' + (i + 1), '全部 Lv' + (i + 1) + (i + 1 < WORKSHOP_MAX_LV ? '（可升級）' : '（已達最高等級）')]));
  document.getElementById('previewModes').innerHTML = modes.map(([id, n]) => '<button type="button" class="pv-mode' + (previewMode === id ? ' sel' : '') + '" data-mode="' + id + '">' + n + '</button>').join('');
}
document.getElementById('previewModes').addEventListener('click', e => {
  const b = e.target.closest('[data-mode]'); if (!b) return;
  previewMode = b.dataset.mode; pvReset(); renderPreviewModes(); renderPreview();
});
renderPreviewModes();

// ---- 素材圖：預覽下面列出所有裝備、武器的圖（跟地圖編輯器下方的素材列一樣）----
// 點一下＝在左邊選它；右鍵＝「以檔案總管開啟」那張圖所在的資料夾
let assetTab = 'all', assetQuery = '';
const ASSET_KINDS = WORKSHOP_KINDS;   // 頭部、上身、下身、隨身物品（js/workshop-config.js）
function assetEntries() {
  return gearKeys().concat(weaponKeys(), AMMO_KEYS).map(key => {
    const d = getDef(key), v = itemView(key);
    const kind = isWeapon(key) ? '武器' : isMag(key) ? '彈匣' : isAmmo(key) ? '子彈' : (ASSET_KINDS[d.kind] || '裝備');
    return { key, name: v.name, image: v.image, icon: d.icon || '', tab: isWeapon(key) ? 'weapon' : isAmmo(key) ? 'ammo' : 'gear', kind, removed: isRemoved(key), custom: isCustom(key) };
  });
}
function renderAssets() {
  const all = assetEntries(), q = assetQuery.trim().toLowerCase();
  const tabs = [['all', '全部'], ['gear', '裝備'], ['weapon', '武器'], ['ammo', '子彈・彈匣']];
  document.getElementById('assetTabs').innerHTML =
    '<input type="search" id="assetSearch" placeholder="🔍 搜尋素材" value="' + esc(assetQuery) + '">' +
    tabs.map(([id, n]) => '<button type="button" class="asset-tab' + (assetTab === id ? ' sel' : '') + '" data-asset-tab="' + id + '">' + n + '<span class="count">' + all.filter(a => id === 'all' || a.tab === id).length + '</span></button>').join('');
  const list = all.filter(a => (assetTab === 'all' || a.tab === assetTab) && (!q || (a.name + ' ' + a.image + ' ' + a.kind).toLowerCase().includes(q)));
  document.getElementById('assetGrid').innerHTML = list.length ? list.map(a =>
    '<button type="button" class="asset' + (a.key === selKey ? ' sel' : '') + (a.removed ? ' removed' : '') + '" data-asset="' + esc(a.key) + '" title="' + esc(a.name + (a.image ? '\n' + a.image : '（沒有圖片）')) + '">' +
      '<span class="asset-thumb">' + (a.image ? '<img src="' + esc(a.image) + '" alt="" loading="lazy">' : '<i>' + esc(a.icon || '？') + '</i>') + '</span>' +
      '<b>' + esc(a.name) + '</b><small>' + esc(a.kind) + (a.custom ? '・新增' : '') + (a.removed ? '・已刪除' : '') + '</small></button>').join('')
    : '<p class="asset-empty">找不到符合的素材</p>';
}
document.getElementById('assetTabs').addEventListener('click', e => {
  const t = e.target.closest('[data-asset-tab]'); if (!t) return;
  assetTab = t.dataset.assetTab; renderAssets();
});
document.getElementById('assetTabs').addEventListener('input', e => {
  if (e.target.id !== 'assetSearch') return;
  assetQuery = e.target.value; const pos = e.target.selectionStart;
  renderAssets();
  const inp = document.getElementById('assetSearch'); inp.focus(); inp.setSelectionRange(pos, pos);   // 重畫後游標留在原位
});
document.getElementById('assetGrid').addEventListener('click', e => {
  const a = e.target.closest('[data-asset]'); if (!a) return;
  selKey = a.dataset.asset; renderList(); renderItemForm(); renderPreview(); renderAssets(); scrollPreviewTo(selKey);
  document.querySelector('#itemList .sel')?.scrollIntoView({ block: 'nearest' });
});
// 右鍵選單：以檔案總管開啟（用「開啟編輯器.bat」打開時由小幫手 tools/editor-server.py 打開；不然就複製資料夾路徑）
const assetMenu = document.createElement('div');
assetMenu.className = 'asset-ctxmenu'; assetMenu.hidden = true;
assetMenu.innerHTML = '<button type="button" data-asset-act="folder">📂 以檔案總管開啟</button>';
document.body.appendChild(assetMenu);
let assetMenuKey = null;
const hideAssetMenu = () => { assetMenu.hidden = true; assetMenuKey = null; };
document.getElementById('assetGrid').addEventListener('contextmenu', e => {
  const a = e.target.closest('[data-asset]'); if (!a) return;
  e.preventDefault(); assetMenuKey = a.dataset.asset; assetMenu.hidden = false;
  assetMenu.style.left = Math.min(e.clientX, innerWidth - assetMenu.offsetWidth - 4) + 'px';
  assetMenu.style.top = Math.min(e.clientY, innerHeight - assetMenu.offsetHeight - 4) + 'px';
});
document.addEventListener('pointerdown', e => { if (!assetMenu.contains(e.target)) hideAssetMenu(); }, true);
document.addEventListener('keydown', e => { if (e.key === 'Escape') hideAssetMenu(); });
window.addEventListener('blur', hideAssetMenu);
assetMenu.addEventListener('click', e => {
  if (!e.target.closest('[data-asset-act="folder"]')) return;
  const key = assetMenuKey; hideAssetMenu(); if (key) openAssetFolder(key);
});
function copyText(text) {
  const ta = document.createElement('textarea'); ta.value = text; ta.style.cssText = 'position:fixed;left:-9999px;top:0';
  document.body.appendChild(ta); ta.select();
  let ok = false; try { ok = document.execCommand('copy'); } catch (_) {}
  ta.remove(); return ok;
}
async function openAssetFolder(key) {
  const v = itemView(key), file = String(v.image || '').split('?')[0];
  if (!file) { setStatus('「' + v.name + '」沒有圖片檔（用的是符號）', true); return; }
  try {
    const r = await fetch('/__open-folder?path=' + encodeURIComponent(file), { cache: 'no-store' });
    if (r.ok) { setStatus('📂 已用檔案總管打開：' + file); return; }
  } catch (_) {}
  const local = location.protocol === 'file:' ? decodeURIComponent(location.pathname).replace(/^\/(?=[A-Za-z]:)/, '').replace(/[^/]*$/, '') : '';
  const folder = (local + file).replace(/\/[^/]*$/, '').replace(/\//g, '\\');
  const copied = copyText(folder);
  setStatus((copied ? '已複製資料夾路徑：' : '資料夾路徑：') + folder + (local ? '' : '（在遊戲資料夾裡）') +
    '　網頁不能自己打開檔案總管；把路徑貼到檔案總管上方的網址列就好。想一鍵打開，請用遊戲資料夾裡的「開啟編輯器.bat」打開編輯器。');
}
// 點預覽裡的欄位＝在左邊選它
document.getElementById('previewStage').addEventListener('click', e => {
  if (pvSideClick(e)) return;   // 右側：穿上／卸下、分解
  const tb = e.target.closest('[data-pv-tab]');   // 上面的分頁：開發／升級（選那一頁的第一件）
  if (tb) {
    const first = weaponKeys().concat(gearKeys()).find(k => !isRemoved(k) && pvTabOf(k) === tb.dataset.pvTab);
    pvTab = tb.dataset.pvTab;
    if (first) { selKey = first; pvLastSel = first; renderList(); renderItemForm(); }
    renderPreview(); return;
  }
  const r = e.target.closest('.ws-tile[data-key]'); if (!r) return;
  selKey = r.dataset.key; renderList(); renderItemForm(); renderPreview();
  document.querySelector('#itemList .sel')?.scrollIntoView({ block: 'nearest' });
});
// ---- 拖曳預覽裡的欄位：調整排列順序（同一組裡面：武器、頭部裝備、上身裝備、下身裝備、隨身物品；左右欄、上下排都可以）----
// 拖到哪一格上面放開＝兩格互換位置（存成 data/workshop.js 的 order，遊戲照這個順序排）。
let dragKey = null;
const clearDropMarks = () => document.querySelectorAll('#previewStage .drop-swap').forEach(el => el.classList.remove('drop-swap'));
const previewStageEl = document.getElementById('previewStage');
// 預覽的說明欄點一下名稱、標籤、說明、效果框、按鈕：左邊跳到那一塊的設定，框一下讓你知道是哪一塊
previewStageEl.addEventListener('click', e => {
  if (e.target.closest('.ws-tile-icon')) {   // 點格子裡的圖：選這件之後，左邊跳到「🖼️ 圖片」的格子圖片大小、位移（每件分開，格子框不動）
    setTimeout(() => {
      const fields = ['[data-is]', '[data-io="x"]'].map(s => document.querySelector('#itemForm ' + s)?.closest('.field')).filter(Boolean); if (!fields.length) return;
      const sec = fields[0].closest('details.form-sec'); if (sec) sec.open = true;
      fields[0].scrollIntoView({ block: 'center', behavior: 'smooth' });
      fields.forEach(f => { f.classList.remove('flash'); void f.offsetWidth; f.classList.add('flash'); });
    }, 80);
  }
  if (e.target.closest('.ws-info .bag-detail-image')) {   // 點說明欄的圖：左邊跳到「🖼️ 圖片」的說明欄圖片位移、大小（每件分開，圖片框不動）
    const fields = ['[data-io="ix"]', '[data-iss]'].map(s => document.querySelector('#itemForm ' + s)?.closest('.field')).filter(Boolean); if (!fields.length) return;
    const sec = fields[0].closest('details.form-sec'); if (sec) sec.open = true;   // 收起來的話先打開
    fields[0].scrollIntoView({ block: 'center', behavior: 'smooth' });
    fields.forEach(f => { f.classList.remove('flash'); void f.offsetWidth; f.classList.add('flash'); });
    return;
  }
  const el = e.target.closest('.ws-info [data-wsp]'); if (!el) return;
  const box = document.querySelector('#itemForm .info-part[data-part="' + el.dataset.wsp + '"]'); if (!box) return;
  const layout = box.closest('details.form-sec'); if (layout) layout.open = true;   // 收起來的話先打開
  box.open = true;
  box.scrollIntoView({ block: 'center', behavior: 'smooth' });
  box.classList.remove('flash'); void box.offsetWidth; box.classList.add('flash');
});
const dragOk = r => dragKey && r && r.dataset.key !== dragKey && r.parentElement === previewStageEl.querySelector('.ws-tile[data-key="' + dragKey + '"]')?.parentElement;   // 只能跟同一組的換
previewStageEl.addEventListener('dragstart', e => {
  const r = e.target.closest && e.target.closest('.ws-tile[data-key]'); if (!r) return;
  if (isAmmo(r.dataset.key)) { e.preventDefault(); return; }   // 子彈、彈匣的順序是遊戲固定的，不能拖
  dragKey = r.dataset.key; r.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', dragKey);
});
previewStageEl.addEventListener('dragover', e => {
  const r = e.target.closest('.ws-tile[data-key]'); if (!dragOk(r)) return;
  e.preventDefault(); e.dataTransfer.dropEffect = 'move';
  clearDropMarks(); r.classList.add('drop-swap');
});
previewStageEl.addEventListener('dragleave', e => { if (!previewStageEl.contains(e.relatedTarget)) clearDropMarks(); });
previewStageEl.addEventListener('drop', e => {
  const r = e.target.closest('.ws-tile[data-key]'); clearDropMarks();
  if (!dragOk(r)) return;
  e.preventDefault();
  // 以「畫面上現在看到的順序」為準再互換；這一組沒顯示的（其他組、另一個分頁的、刪掉的）接在後面
  const w = isWeapon(dragKey), shown = [...r.parentElement.children].map(el => el.dataset.key);
  const list = shown.concat((w ? weaponKeys() : gearKeys()).filter(k => !shown.includes(k))), a = list.indexOf(dragKey), b = list.indexOf(r.dataset.key);
  [list[a], list[b]] = [list[b], list[a]];   // 互換
  cfg.order[w ? 'weapons' : 'gear'] = list;
  selKey = dragKey; saveDraft(); renderList(); renderItemForm(); renderPreview();
  setStatus('「' + itemView(dragKey).name + '」和「' + itemView(r.dataset.key).name + '」互換位置（還沒存到專案）');
});
document.getElementById('autoArrange').addEventListener('click', () => {   // 丟掉拖曳的順序：回到原本的順序
  cfg.order = {}; saveDraft(); renderList(); renderPreview(); setStatus('已恢復原本的順序（還沒存到專案）');
});
previewStageEl.addEventListener('dragend', () => { dragKey = null; clearDropMarks(); document.querySelectorAll('#previewStage .dragging').forEach(el => el.classList.remove('dragging')); });
function scrollPreviewTo(key) {   // 新增後：預覽捲到新的那一格
  const el = document.querySelector('#previewStage .ws-tile[data-key="' + key + '"]');
  if (el) el.scrollIntoView({ block: 'nearest' });
}
document.getElementById('addItem').addEventListener('click', () => scrollPreviewTo(selKey));

// ---- 存檔 ----
// 開頭說明要跟 data/workshop.js 一字不差（存到專案時，內容沒變就不會重寫檔案）
function exportText() {
  const items = {};
  for (const key of Object.keys(BUILTIN)) {
    const o = cfg.items[key]; if (!o) continue;
    const keep = {};
    for (const f of WORKSHOP_TEXT_FIELDS) if (typeof o[f] === 'string' && o[f] !== '' && o[f] !== (WORKSHOP_BASE[key] || {})[f]) keep[f] = o[f];
    if (levelsChanged(key)) keep.levels = WORKSHOP_LV_INDEX.map(i => { const t = levelEdits(key)[i]; return typeof t === 'string' ? t : ''; });   // 空白＝照數值自動產生
    if (valuesChanged(key)) keep.values = WORKSHOP_LV_INDEX.map(i => { const v = valueEdits(key)[i] || {}, b = baseLevel(key, i) || {}, out = {};
      for (const k of Object.keys(v)) if ((typeof v[k] === 'number' && v[k] !== b[k]) || (typeof v[k] === 'string' && v[k] !== '')) out[k] = v[k];   // 文字也存
      return out; });   // 每一級改過的數值（沒寫的＝原本的）
    if (typeof o.iconScale === 'number' && o.iconScale !== ((WORKSHOP_BASE[key] || {}).iconScale || 100)) keep.iconScale = o.iconScale;   // 圖片大小（%）
    for (const k of ['iconX', 'iconY', 'infoImgX', 'infoImgY', 'infoImgSize']) if (typeof o[k] === 'number' && o[k] !== 0) keep[k] = o[k];   // 圖片位移（px）：格子裡、說明欄裡；說明欄的圖片大小（px）
    if (costChanged(key)) keep.cost = baseCost(key).map((b, i) => { const n = costEdits(key)[i]; return typeof n === 'number' && n !== b ? n : null; });   // 改過的費用（null＝原本的）
    if (o.infoParts && Object.keys(o.infoParts).length) keep.infoParts = o.infoParts;   // 下方說明欄四塊的位置、大小、字級
    if (o.money != null) keep.money = o.money;   // 自己填的經費（null＝自動）
    if (Object.keys(keep).length) items[key] = keep;
  }
  for (const key of AMMO_KEYS) {   // 子彈、彈匣：只寫改過的（陣列裡 null＝原本的）
    const o = cfg.items[key]; if (!o) continue;
    const b = ammoBase(key), keep = {};
    for (const f of AMMO_FIELDS) if (typeof o[f] === 'string' && o[f] !== '' && o[f] !== b[f]) keep[f] = o[f];
    for (const f of ['cost', 'max', 'slots']) {
      if (Array.isArray(b[f]) && Array.isArray(o[f]) && o[f].some((n, i) => typeof n === 'number' && n !== b[f][i])) keep[f] = b[f].map((x, i) => typeof o[f][i] === 'number' && o[f][i] !== x ? o[f][i] : null);
      else if (typeof b[f] === 'number' && typeof o[f] === 'number' && o[f] !== b[f]) keep[f] = o[f];
    }
    if (o.infoParts && Object.keys(o.infoParts).length) keep.infoParts = o.infoParts;   // 下方說明欄四塊的位置、大小、字級
    if (o.money != null) keep.money = o.money;   // 自己填的經費
    if (typeof o.iconScale === 'number' && o.iconScale !== 100) keep.iconScale = o.iconScale;   // 開發工坊格子裡的圖片大小（%）
    for (const k of ['iconX', 'iconY', 'infoImgX', 'infoImgY', 'infoImgSize']) if (typeof o[k] === 'number' && o[k] !== 0) keep[k] = o[k];   // 圖片位移、說明欄的圖片大小（px）
    if (Object.keys(keep).length) items[key] = keep;
  }
  const added = cfg.added.map(a => ({ id: a.id, name: a.name, kind: a.kind, icon: a.icon || '🧰', image: a.image || '', source: a.source === 'field' ? 'field' : 'develop',
    where: a.source === 'field' ? (a.where || '') : '', desc: a.desc || '', ownedDesc: a.ownedDesc || '', ...(a.iconScale && a.iconScale !== 100 ? { iconScale: a.iconScale } : {}), ...(a.iconX ? { iconX: a.iconX } : {}), ...(a.iconY ? { iconY: a.iconY } : {}), ...(a.infoImgX ? { infoImgX: a.infoImgX } : {}), ...(a.infoImgSize ? { infoImgSize: a.infoImgSize } : {}), ...(a.infoImgY ? { infoImgY: a.infoImgY } : {}), ...(a.infoParts && Object.keys(a.infoParts).length ? { infoParts: a.infoParts } : {}), ...(a.money != null ? { money: a.money } : {}), cost: WORKSHOP_LV_INDEX.map(i => Math.max(0, Math.round(Number(a.cost[i]) || 0))), levels: WORKSHOP_LV_INDEX.map(i => String(a.levels[i] ?? '')) }));
  const removed = cfg.removed.filter(k => k in BUILTIN);   // 刪掉的原本裝備、武器
  const order = {};   // 排列順序：沒拖曳過就不寫（遊戲照一樣高的自動配對）
  if (orderCustom('gear')) order.gear = gearKeys();       // 拖曳過才寫（遊戲裡也照順序排）
  if (orderCustom('weapons')) order.weapons = weaponKeys();
  const style = {};
  for (const k of Object.keys(WORKSHOP_STYLE_DEFAULT)) if (k in cfg.style && cfg.style[k] !== WORKSHOP_STYLE_DEFAULT[k]) style[k] = cfg.style[k];
  return workshopConfigText({ items, added, removed, style, ...(Object.keys(order).length ? { order } : {}) });   // js/workshop-file.js（背包編輯器也用同一段開頭說明）
}
document.getElementById('downloadFile').addEventListener('click', () => {
  const blob = new Blob([exportText()], { type: 'text/javascript' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'workshop.js'; a.click(); URL.revokeObjectURL(a.href);
  setStatus('已下載 workshop.js，請把它覆蓋到 data/workshop.js');
});
document.getElementById('resetFile').addEventListener('click', () => {
  if (!confirm('確定丟掉還沒存到專案的修改，改回 data/workshop.js 檔案裡的內容？')) return;
  try { localStorage.removeItem(WS_DRAFT_KEY); } catch (_) {}
  cfg = fromFile();
  if (!gearKeys().includes(selKey) && !WEAPON_KEYS.includes(selKey) && !AMMO_KEYS.includes(selKey)) selKey = BUILTIN_GEAR[0];
  renderAll(); setStatus('已改回檔案裡的內容');
});
ProjectSave.attach({
  after: ['downloadFile'],
  files: [{ path: 'data/workshop.js', label: '開發工坊', text: exportText }],
  status: (m, err) => setStatus(m, err),
});

function renderAll() { renderList(); renderItemForm(); renderStyleForm(); renderPreview(); }
if (!gearKeys().includes(selKey)) selKey = gearKeys()[0];
renderAll();
// 暫存跟檔案不一樣＝上次有改了還沒存（存過的就不提醒）
const fileText = (() => { const keep = cfg; cfg = fromFile(); const t = exportText(); cfg = keep; return t; })();
if (exportText() !== fileText) setStatus('已讀取上次還沒存到專案的修改（要丟掉請按「從檔案重設」）');
