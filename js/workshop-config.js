/* ===== 開發工坊的設定（data/workshop.js）套用到遊戲 =====
   ・裝備／武器的名稱、圖片、說明、取得地點：直接改掉 data/equipment.js 讀進來的資料
     （所以背包、裝備欄看到的名稱和圖片也會跟著變）。
   ・外觀（字的顏色、大小、欄位大小）：變成 CSS 變數，開發工坊的樣式（css/style.css）會讀它。
   必須在 data/equipment.js 和 data/workshop.js 之後載入。開發工坊編輯器也用這個檔案。
*/
// 外觀的預設值（＝沒用編輯器改過時的樣子）。編輯器的「恢復預設」就是回到這些數字。
const WORKSHOP_STYLE_DEFAULT = {
  // 最上面的標題列：小標、大標題、說明的文字／大小／顏色，整塊的位移（px；正數＝往右／往下）
  headSmall: '諾亞的開發工坊', headSmallSize: 10, headSmallColor: '#d8ae5d',
  headTitle: '裝備開發・升級', headTitleSize: 22, headTitleColor: '#fff8e7',
  headSub: '', headSubSize: 12, headSubColor: '#929dab',
  headX: 0, headY: 0,
  panelW: 1010,          // 工坊視窗最大寬度（px）
  panelH: 620,           // 工坊視窗最大高度（px）
  // 說明欄右邊的金色按鈕（升級／開發）：寬、高（0＝原本的大小：照欄寬、照文字）、文字大小、位移（正數＝往右／往下）
  actBtnW: 0, actBtnH: 0, actBtnFont: 14, actBtnX: 0, actBtnY: 0,
  infoY: 0,              // 下方說明欄整塊（圖片、說明、按鈕一起）的上下位移：負數＝往上（上面的格子區變矮），正數＝往下（超出視窗底的部分會被切掉）
  // 說明欄裡的文字（名稱、說明、數值）單獨移動（正數＝往右／往下）；左邊的圖片是每件自己調（data/workshop.js 的 items[…].infoImgX／infoImgY）
  infoTextX: 0, infoTextY: 0,
  numColor: '#CF9447',   // 說明裡的數字（Lv2、8 格、1.4 秒…）
  whereColor: '#A958E2', // 說明裡的「戰鬥區域」和戰鬥區域裡的東西（下面 whereWords 列的字）
  whereWords: '戰鬥區域、上鎖的置物櫃、上鎖的置物箱、置物櫃、置物箱、異質核心',   // 用「戰鬥區域」顏色的字（用「、」分開）
  itemColor: '#A958E2',  // 說明裡的道具名稱（電池、杏仁水、急救包…）
};
// 數字型的設定在 CSS 裡要加 px
const WORKSHOP_STYLE_VARS = {
  headSmallSize: ['--ws-head-small-size', 'px'], headSmallColor: ['--ws-head-small-color', ''],
  headTitleSize: ['--ws-head-title-size', 'px'], headTitleColor: ['--ws-head-title-color', ''],
  headSubSize: ['--ws-head-sub-size', 'px'], headSubColor: ['--ws-head-sub-color', ''],
  headX: ['--ws-head-x', 'px'], headY: ['--ws-head-y', 'px'],
  panelW: ['--ws-panel-w', 'px'], panelH: ['--ws-panel-h', 'px'], 
  // 第三格：填 0 時改用這個值（0＝原本的大小）
  actBtnW: ['--ws-act-w', 'px', '100%'], actBtnH: ['--ws-act-h', 'px', 'auto'], actBtnFont: ['--ws-act-font', 'px'], actBtnX: ['--ws-act-x', 'px'], actBtnY: ['--ws-act-y', 'px'],
  infoY: ['--ws-info-y', 'px'],
  infoTextX: ['--ws-info-text-x', 'px'], infoTextY: ['--ws-info-text-y', 'px'],
  numColor: ['--ws-num-color', ''], whereColor: ['--ws-where-color', ''], itemColor: ['--ws-item-color', ''],
};
function workshopStyle(cfg) {   // 預設值＋設定檔裡改過的
  return { ...WORKSHOP_STYLE_DEFAULT, ...((cfg || (typeof WORKSHOP_CONFIG !== 'undefined' ? WORKSHOP_CONFIG : {})).style || {}) };
}
// 標題列的三行字（遊戲的開發工坊、編輯器的預覽共用）：空白＝不顯示那一行
function workshopHeadHtml(cfg) {
  const st = workshopStyle(cfg), e = t => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return '<div class="workshop-title">' + (st.headSmall ? '<small>' + e(st.headSmall) + '</small>' : '') + (st.headTitle ? '<h2>' + e(st.headTitle) + '</h2>' : '') + (st.headSub ? '<p>' + e(st.headSub) + '</p>' : '') + '</div>';
}
function applyWorkshopStyle(el, cfg) {   // 把外觀設定寫成 CSS 變數（el＝#workshop）
  if (!el) return;
  const st = workshopStyle(cfg);
  for (const [k, [name, unit, zero]] of Object.entries(WORKSHOP_STYLE_VARS)) el.style.setProperty(name, zero !== undefined && Number(st[k]) === 0 ? zero : st[k] + unit);
}

// 最高幾級（data/equipment.js 的 EQUIP_MAX_LV）；LV_INDEX＝[0, 1, …, 最高-1]
const WORKSHOP_MAX_LV = typeof EQUIP_MAX_LV !== 'undefined' ? EQUIP_MAX_LV : 5;
const WORKSHOP_LV_INDEX = Array.from({ length: WORKSHOP_MAX_LV }, (_, i) => i);
// ---- 說明文字上色（遊戲的開發工坊、編輯器的預覽共用）----
// 數字（Lv2、8 格、1.4 秒、−10%…）＝橘色；「戰鬥區域」和戰鬥區域裡的東西（外觀設定 whereWords，例如「上鎖的置物櫃」）＝紫色；
// 道具名稱（電池、杏仁水…）＝道具顏色（css/style.css 的 .ws-num／.ws-where／.ws-item）
function workshopItemNames() {   // 道具名稱：背包的補給、零食飲料（data/supplies.js）＋其他物品（data/items.js）＋異質碎片
  const names = new Set(['異質碎片']);
  if (typeof SUPPLIES !== 'undefined') for (const it of SUPPLIES) if (it.name) names.add(it.name);
  if (typeof ITEMS !== 'undefined') for (const it of ITEMS) if (it.name) names.add(it.name);
  return [...names].filter(n => n.length >= 2).sort((a, b) => b.length - a.length);   // 長的先比（「杏仁水保溫杯」比「杏仁水」先）
}
// 戰鬥區域的字＋道具名稱合成一個比對：長的先比（「置物櫃鑰匙」是道具、「置物櫃」是戰鬥區域的東西，不會互相切斷）
let workshopWordCache = { key: null, re: null, cls: null };
const workshopWhereWords = st => String((st || workshopStyle()).whereWords || '').split(/[、,，;；\s]+/).map(w => w.trim()).filter(Boolean);
function workshopWords(st) {
  const where = workshopWhereWords(st), key = where.join('|');
  if (workshopWordCache.key !== key) {
    const cls = new Map();
    for (const n of workshopItemNames()) cls.set(n, 'ws-item');
    for (const w of where) cls.set(w, 'ws-where');   // 同一個字兩邊都有：當成戰鬥區域的字
    const words = [...cls.keys()].sort((a, b) => b.length - a.length);
    workshopWordCache = { key, cls, re: words.length ? new RegExp(words.map(x => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g') : null };
  }
  return workshopWordCache;
}
function workshopColorize(text, st) {   // st：外觀設定（編輯器傳編輯中的；遊戲裡用 data/workshop.js 的）
  const w = workshopWords(st);
  let out = String(text).replace(/(?:Lv)?[+\-−]?\d+(?:\.\d+)?[%°]?/g, m => '<i class="ws-num">' + m + '</i>');
  if (w.re) out = out.replace(w.re, m => '<i class="' + w.cls.get(m) + '">' + m + '</i>');
  return out
    .replace(/\u2063([^\u2063]*)\u2063/g, '<i class="ws-num">$1</i>');   // 數值欄填的文字（例如 ∞）：跟數字一樣橘色
}

// ---- 開發工坊裡的圖片大小（iconScale，%）：圖示框不變，只放大縮小裡面的圖（css/style.css 的 --ws-img-scale）----
// 圖片位移（iconX／iconY，px）：正數＝往右／往下（--ws-img-x／--ws-img-y）
const workshopIconVars = (scale, x, y) => [scale && scale !== 100 ? '--ws-img-scale:' + scale / 100 : '', x ? '--ws-img-x:' + x + 'px' : '', y ? '--ws-img-y:' + y + 'px' : ''].filter(Boolean).join(';');
const workshopIconStyle = d => { const v = d ? workshopIconVars(d.iconScale, d.iconX, d.iconY) : ''; return v ? ' style="' + v + '"' : ''; };
// 下方說明欄裡的圖片位移（infoImgX／infoImgY，px，每件分開）：正數＝往右／往下（--ws-info-img-x／--ws-info-img-y）
const workshopInfoImgVars = (x, y) => [x ? '--ws-info-img-x:' + x + 'px' : '', y ? '--ws-info-img-y:' + y + 'px' : ''].filter(Boolean).join(';');
const workshopInfoImgStyle = d => { const v = d ? workshopInfoImgVars(d.infoImgX, d.infoImgY) : ''; return v ? ' style="' + v + '"' : ''; };

// 「可升級」分頁前面的圖示：兩個疊在一起的綠色箭頭（照參考圖描的，取代原本的 ⬆️ emoji；遊戲的開發工坊、編輯器的預覽共用）
const WS_UP_ICON = '<svg class="ws-up-icon" viewBox="0 0 286 337" aria-hidden="true">' +
  '<polygon points="0,96 143,0 286,96 286,205 143,111 0,205" fill="#7be495"/>' +
  '<polygon points="7,232 143,146 278,232 278,334 143,245 7,334" fill="#3fbf6a"/></svg>';

// ---- 裝備／武器的文字和圖片 ----
const WORKSHOP_TEXT_FIELDS = ['name', 'image', 'desc', 'ownedDesc', 'where'];   // ownedDesc＝說明（已擁有）：拿到之後顯示在名稱下面、詳細數值上面
// 每一級數值的中文名稱（編輯器用）：label 名稱、unit 單位、scale 顯示時乘多少（例如 0.15 → 15 %；照明 220 像素 → 5.5 格）
const WORKSHOP_VALUE_INFO = {
  dmg: { label: '傷害', unit: '' }, mag: { label: '彈匣', unit: '發' }, reload: { label: '裝填', unit: '秒' }, reserve: { label: '持有上限', unit: '發' },
  shine: { label: '照明', unit: '秒' },   // 照明彈槍：照明彈亮幾秒
  burn: { label: '燃燒', unit: '秒' }, r: { label: '火海半徑', unit: '格' }, ignite: { label: '怪物著火', unit: '秒' },
  sleep: { label: '睡眠', unit: '秒' }, mist: { label: '麻醉霧半徑', unit: '格' },
  light: { label: '照明距離', unit: '格', scale: 1 / 40 }, spread: { label: '光束角度（一半）', unit: '°' }, battery: { label: '一顆電池撐', unit: '秒' },
  fear: { label: '黑暗恐懼減少', unit: '%', scale: 100 }, filter: { label: '腐蝕、酸液減傷', unit: '%', scale: 100 },
  guard: { label: '受到的傷害減少', unit: '%', scale: 100 }, calm: { label: '理智影響減少', unit: '%', scale: 100 },
  save: { label: '疏導省 SP', unit: '%', scale: 100 }, speed: { label: '移動速度加成', unit: '%', scale: 100 },
  fire: { label: '火海燙傷減少', unit: '%', scale: 100 }, corrode: { label: '腐蝕池、酸液減傷', unit: '%', scale: 100 },
  reach: { label: '疏導距離加成', unit: '%', scale: 100 }, rush: { label: '指派時隊員移動加成', unit: '%', scale: 100 },
  mark: { label: '標記黑暗中怪物的範圍', unit: '格' }, range: { label: '偵測範圍', unit: '格' },
};
const WORKSHOP_BASE = {};   // 還沒套用設定檔前的原始資料（編輯器的「恢復原本」用）
function workshopItemDefs() {   // key → 那件裝備／武器的資料
  const out = {};
  if (typeof EQUIPMENT !== 'undefined') for (const d of EQUIPMENT) out[d.id] = d;
  if (typeof WEAPON_UPGRADES !== 'undefined') for (const [k, w] of Object.entries(WEAPON_UPGRADES)) out['w:' + k] = w;
  return out;
}
// ---- 用編輯器「新增」的裝備（added）、「刪除」的裝備（removed）----
// 新增的裝備：可以開發／撿到、穿上、升級，效果說明是編輯器裡自己寫的文字；
// 但遊戲裡實際的效果（例如照明、減傷）要另外寫程式（js/equipment.js 用 equipLv('裝備id') 讀等級），所以一開始只是「有名字、有圖」的裝備。
const WORKSHOP_KINDS = { head: '頭部', body: '上身', legs: '下身', acc: '隨身物品' };
// 開發工坊裡裝備的分組（照這個順序排）：頭部裝備（頭盔、帽子類）、上身裝備（背心、衣服類）、下身裝備（鞋子類）、隨身物品
const WORKSHOP_GEAR_GROUPS = [['head', '頭部裝備'], ['body', '上身裝備'], ['legs', '下身裝備'], ['acc', '隨身物品']];
const workshopGearGroup = kind => WORKSHOP_GEAR_GROUPS.some(g => g[0] === kind) ? kind : 'acc';   // 不認得的部位：放隨身物品
function workshopCustomDef(a) {   // 設定檔裡一件新增的裝備 → 遊戲用的裝備資料（跟 data/equipment.js 的格式一樣）
  const texts = Array.isArray(a.levels) ? a.levels : [];
  const cost = Array.isArray(a.cost) ? a.cost.map(n => Math.max(0, Math.round(Number(n) || 0))) : [];
  return {
    id: a.id, name: a.name || '新裝備', kind: WORKSHOP_KINDS[a.kind] ? a.kind : 'acc', icon: a.icon || '🧰', image: a.image || '',
    source: a.source === 'field' ? 'field' : 'develop', where: a.where || '', desc: '', ownedDesc: a.ownedDesc || a.desc || '',   // 說明只有一段
    iconScale: typeof a.iconScale === 'number' && a.iconScale > 0 ? a.iconScale : 100,
    iconX: Number.isFinite(a.iconX) ? a.iconX : 0, iconY: Number.isFinite(a.iconY) ? a.iconY : 0,
    infoImgX: Number.isFinite(a.infoImgX) ? a.infoImgX : 0, infoImgY: Number.isFinite(a.infoImgY) ? a.infoImgY : 0,   // 下方說明欄裡的圖片位移
    cost: WORKSHOP_LV_INDEX.map(i => cost[i] ?? [50, 100, 160, 240, 340][i] ?? 340),   // [開發, 升到 Lv2, …, 升到最高級]
    stat: lv => lv.text, levels: WORKSHOP_LV_INDEX.map(i => ({ text: String(texts[i] ?? '') })),
    custom: true,
  };
}
// ---- 武器的數值：每一把都用同一張表（所有武器用到的數值合起來）----
function workshopWeaponValueKeys() {   // 所有武器用到的數值，照效果說明的順序排（data/equipment.js 的 WEAPON_STAT_TERMS；持有上限在最後）
  const keys = [];
  for (const [key, b] of Object.entries(WORKSHOP_BASE)) if (key.startsWith('w:')) for (const lv of b.levels || []) for (const k of Object.keys(lv)) if (typeof lv[k] === 'number' && !keys.includes(k)) keys.push(k);
  const order = typeof WEAPON_STAT_TERMS !== 'undefined' ? WEAPON_STAT_TERMS.map(t => t[0]) : [];
  const rank = k => { const i = order.indexOf(k); return i < 0 ? order.length - 1.5 : i; };   // 不在順序表裡的：放在持有上限前面
  return keys.sort((a, b) => rank(a) - rank(b));
}
// 武器多填的數值（這把原本沒有的）→「・燃燒 5 秒」這樣的說明；只是顯示，這把槍的程式沒有用到這個數值
function workshopExtraText(key, lv, texts) {   // texts：這一級填了文字的數值（{ 數值名: '文字' }）
  if (!key.startsWith('w:') || !lv) return '';
  const own = new Set(); for (const b of (WORKSHOP_BASE[key] || {}).levels || []) for (const k of Object.keys(b)) own.add(k);
  const txt = k => texts && typeof texts[k] === 'string' && texts[k] !== '' ? texts[k] : null;
  return workshopWeaponValueKeys().filter(k => !own.has(k) && (txt(k) !== null || (typeof lv[k] === 'number' && lv[k] !== 0))).map(k => {   // 0＝不顯示
    const info = WORKSHOP_VALUE_INFO[k] || { label: k, unit: '' }, n = txt(k) !== null ? WS_TEXT_MARK + txt(k) + WS_TEXT_MARK : Math.round(lv[k] * (info.scale || 1) * 100) / 100;
    return '・' + info.label + ' ' + n + (info.unit === '%' ? '%' : info.unit ? ' ' + info.unit : '');
  }).join('');
}
// 數值欄填了數字以外的文字（例如「5～6」「？？」）：遊戲的實際數值維持原本的，只有效果說明顯示這段文字。
// 作法：把這個數值換成兩個不同的數字各算一次說明，前後一樣的部分不動，中間變動的那一段（＝這個數值）換成文字。
const WS_TEXT_MARK = '\u2063';   // 數值欄填的文字，前後各一個（看不見）
const workshopPlain = t => String(t).split(WS_TEXT_MARK).join('');   // 拿掉記號（放進輸入框、比對文字時用）
const WORKSHOP_TEXTVALS = {};   // key → [Lv1, Lv2, …] 各自 { 數值名: '文字' }
function workshopTextify(fn, lv, texts) {
  const keys = Object.keys(texts || {}).filter(k => typeof texts[k] === 'string' && texts[k] !== '');
  if (!keys.length) return fn(lv);
  const A = { ...lv }; for (const k of keys) A[k] = 1234567.89;
  const a = fn(A), spans = [];
  for (const k of keys) {
    const b = fn({ ...A, [k]: 7654321.23 }); if (b === a) continue;   // 說明裡沒有這個數值
    let p = 0; while (p < a.length && p < b.length && a[p] === b[p]) p++;
    let q = 0; while (q < a.length - p && q < b.length - p && a[a.length - 1 - q] === b[b.length - 1 - q]) q++;
    spans.push([p, a.length - q, texts[k]]);
  }
  // 文字前後加看不見的記號（U+2063）：上色時（workshopColorize）跟數字一樣是橘色；其他地方顯示時看不到
  let out = a; for (const [p, e, t] of spans.sort((x, y) => y[0] - x[0])) out = out.slice(0, p) + WS_TEXT_MARK + t + WS_TEXT_MARK + out.slice(e);   // 從後面換回來，位置才不會跑掉
  return out;
}
// 數值填 0 的那一項，從效果說明裡拿掉（例如燃燒填 0 → 不顯示「燃燒 0 秒」）。
// 作法：把這個數值換成兩個不同的數字各算一次說明，有變的那一段（用「・」分開）就是它，拿掉。
function workshopHideZeros(fn, lv, skip) {   // skip：填了文字的數值（不算 0）
  const text = fn(lv), segs = text.split('・'), drop = new Set();
  for (const k of Object.keys(lv)) {
    if (lv[k] !== 0 || (skip && skip.has(k))) continue;
    const a = fn({ ...lv, [k]: 1234567 }).split('・'), b = fn({ ...lv, [k]: 7654321 }).split('・');
    if (a.length !== segs.length || b.length !== segs.length) continue;   // 這一項是 0 時本來就不會出現
    a.forEach((sg, i) => { if (sg !== b[i]) drop.add(i); });
  }
  return drop.size ? segs.filter((_, i) => !drop.has(i)).join('・') : text;
}
// 跟著數值自動產生的效果說明（原本的寫法＋武器多填的數值；填 0 的不顯示）
// texts：這一級填了文字的數值；沒給的話（遊戲裡）照 lv 是第幾級去查設定檔
function workshopAutoStat(key, lv, texts) {
  const b = WORKSHOP_BASE[key] || {}, fn = b.statFn; if (!lv || !fn) return '';
  if (texts === undefined && b.def && b.def.levels) { const i = b.def.levels.indexOf(lv); texts = i >= 0 ? (WORKSHOP_TEXTVALS[key] || [])[i] : null; }
  const skip = new Set(Object.keys(texts || {}).filter(k => typeof texts[k] === 'string' && texts[k] !== ''));
  // 武器的說明（weaponStat）本來就會照順序列出所有數值，不用另外接；其他寫法的才把多填的數值接在後面
  const extra = typeof weaponStat !== 'undefined' && fn === weaponStat ? '' : workshopExtraText(key, lv, texts);
  return workshopHideZeros(l => workshopTextify(fn, l, texts), lv, skip) + extra;
}
const WORKSHOP_REMOVED = {};   // 被刪掉的原本裝備／武器（key → 資料；編輯器可以「復原」）
(function applyWorkshopItems() {
  const cfg = typeof WORKSHOP_CONFIG !== 'undefined' ? WORKSHOP_CONFIG : {};
  const defs = workshopItemDefs(), items = cfg.items || {};
  for (const [key, def] of Object.entries(defs)) {   // 原本的裝備／武器：改名稱、圖片、說明
    WORKSHOP_BASE[key] = Object.fromEntries(WORKSHOP_TEXT_FIELDS.map(f => [f, def[f]]));
    WORKSHOP_BASE[key].stats = WORKSHOP_LV_INDEX.map(i => def.levels && def.levels[i] && def.stat ? def.stat(def.levels[i]) : '');   // 原本每一級的效果說明（跟著數值自動產生的）
    WORKSHOP_BASE[key].levels = (def.levels || []).map(lv => ({ ...lv }));   // 原本每一級的數值（編輯器比對、恢復用）
    WORKSHOP_BASE[key].statFn = def.stat;   // 原本的效果說明產生方式（還沒被設定檔改過）
    WORKSHOP_BASE[key].def = def;
    WORKSHOP_BASE[key].cost = Array.isArray(def.cost) ? def.cost.slice() : [];   // 原本的費用（編輯器比對、恢復用）
    const o = items[key]; if (!o) continue;
    if (typeof o.iconScale === 'number' && o.iconScale > 0) def.iconScale = o.iconScale;   // 開發工坊裡圖片的大小（%）
    for (const k of ['iconX', 'iconY', 'infoImgX', 'infoImgY']) if (Number.isFinite(o[k])) def[k] = o[k];   // 圖片位移（px）：開發工坊格子裡、下方說明欄裡
    // 舊的設定檔只有「還沒拿到時」的說明（desc）：現在說明只有一段，就當成這件的說明（ownedDesc）
    if (typeof o.desc === 'string' && o.desc !== '' && !(typeof o.ownedDesc === 'string' && o.ownedDesc !== '')) def.ownedDesc = o.desc;
    for (const f of WORKSHOP_TEXT_FIELDS) if (typeof o[f] === 'string' && o[f] !== '') def[f] = o[f];
    // 每一級的實際數值（傷害、彈匣、裝填秒數…）：直接改進原本的等級資料，遊戲各處讀到的就是新數值，效果說明也會跟著算
    // 開發／升級要花幾個異質碎片：有寫數字的那一格換掉（null＝原本的）
    if (Array.isArray(o.cost) && Array.isArray(def.cost)) o.cost.forEach((n, i) => { if (typeof n === 'number' && Number.isFinite(n) && n >= 0 && i < def.cost.length) def.cost[i] = Math.round(n); });
    if (Array.isArray(o.values) && def.levels) o.values.forEach((v, i) => {
      if (!v || !def.levels[i]) return;
      for (const [k, n] of Object.entries(v)) {
        if (typeof n === 'number' && Number.isFinite(n)) def.levels[i][k] = n;
        else if (typeof n === 'string' && n !== '') ((WORKSHOP_TEXTVALS[key] || (WORKSHOP_TEXTVALS[key] = []))[i] || (WORKSHOP_TEXTVALS[key][i] = {}))[k] = n;   // 文字：只顯示在效果說明
      }
    });
    // 改過數值的、還有武器：效果說明照新數值重新產生——填 0 的那一項不顯示；武器多填的數值（這把原本沒有的）接在後面
    if ((Array.isArray(o.values) || key.startsWith('w:')) && def.stat) def.stat = lv => workshopAutoStat(key, lv);
    // 每一級的效果說明（例如「傷害 5・彈匣 6 發・裝填 2 秒」）：有寫就換成寫的文字；空白＝照原本的自動產生。
    // 只換「顯示的文字」，實際的數值（傷害、彈匣…）還是 data/equipment.js 的 levels。
    if (Array.isArray(o.levels) && o.levels.some(t => typeof t === 'string' && t !== '') && def.stat && def.levels) {
      const autoStat = def.stat, texts = o.levels;
      def.stat = lv => { const i = def.levels.indexOf(lv); return i >= 0 && typeof texts[i] === 'string' && texts[i] !== '' ? texts[i] : autoStat(lv); };
    }
  }
  if (typeof EQUIPMENT === 'undefined') return;
  for (const a of Array.isArray(cfg.added) ? cfg.added : []) {   // 新增的裝備：接在最後面
    if (a && a.id && !EQUIPMENT.some(d => d.id === a.id)) EQUIPMENT.push(workshopCustomDef(a));
  }
  const removed = new Set(Array.isArray(cfg.removed) ? cfg.removed : []);   // 刪除的原本裝備：從清單拿掉
  for (let i = EQUIPMENT.length - 1; i >= 0; i--) if (removed.has(EQUIPMENT[i].id)) WORKSHOP_REMOVED[EQUIPMENT[i].id] = EQUIPMENT.splice(i, 1)[0];
  // 刪除的武器（key 是 w:武器id）：資料留著（有些程式直接讀手槍、照明彈槍的數值），只標記 removed，
  // 遊戲裡就當作沒有這把槍：工坊、背包、裝備欄都看不到，置物箱也撿不到（js/equipment.js 的 weaponHave、js/special-guns.js 的 weaponOwned）
  if (typeof WEAPON_UPGRADES !== 'undefined') for (const key of removed) {
    const w = key.startsWith('w:') && WEAPON_UPGRADES[key.slice(2)];
    if (w) { w.removed = true; WORKSHOP_REMOVED[key] = w; }
  }
  // 排列順序（開發工坊編輯器在預覽裡拖曳調整的）：開發工坊、背包都照這個順序；沒列到的照原本的順序接在後面
  const order = cfg.order || {};
  const rankOf = list => { const m = new Map((Array.isArray(list) ? list : []).map((k, i) => [k, i])); return k => m.has(k) ? m.get(k) : 1e6; };
  if (Array.isArray(order.gear)) {
    const rank = rankOf(order.gear), sorted = EQUIPMENT.map((d, i) => [d, i]).sort((a, b) => rank(a[0].id) - rank(b[0].id) || a[1] - b[1]).map(x => x[0]);
    EQUIPMENT.splice(0, EQUIPMENT.length, ...sorted);
  }
  if (Array.isArray(order.weapons) && typeof WEAPON_UPGRADES !== 'undefined') {   // 物件的 key 順序：全部拿出來、照順序放回去
    const rank = rankOf(order.weapons), entries = Object.entries(WEAPON_UPGRADES).map((e, i) => [e, i]).sort((a, b) => rank('w:' + a[0][0]) - rank('w:' + b[0][0]) || a[1] - b[1]).map(x => x[0]);
    for (const [k] of entries) delete WEAPON_UPGRADES[k];
    for (const [k, w] of entries) WEAPON_UPGRADES[k] = w;
  }
})();
