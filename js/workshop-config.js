/* ===== 開發工坊的設定（data/workshop.js）套用到遊戲 =====
   ・裝備／武器的名稱、圖片、說明、取得地點：直接改掉 data/equipment.js 讀進來的資料
     （所以背包、裝備欄看到的名稱和圖片也會跟著變）。
   ・外觀（字的顏色、大小、欄位大小）：變成 CSS 變數，開發工坊的樣式（css/style.css）會讀它。
   必須在 data/equipment.js 和 data/workshop.js 之後載入。開發工坊編輯器也用這個檔案。
*/
// 外觀的預設值（＝沒用編輯器改過時的樣子）。編輯器的「恢復預設」就是回到這些數字。
const WORKSHOP_STYLE_DEFAULT = {
  panelW: 1010,          // 工坊視窗最大寬度（px）
  panelH: 620,           // 工坊視窗最大高度（px）
  cardH: 0,              // 每個裝備欄位的最小高度（px；0＝依內容自動）
  gap: 7,                // 裝備欄位之間的間距（px）
  iconSize: 66,          // 左邊圖示框的大小（px）
  btnW: 0,               // 「開發／升級」按鈕的最小寬度（px；0＝依文字自動）
  nameSize: 14, nameColor: '#fff8e7',   // 裝備名稱
  descSize: 12, descColor: '#aab5c1',   // 說明／目前效果
  nextSize: 11, nextColor: '#a9d8c9',   // 下一級效果、取得地點
  numColor: '#CF9447',   // 說明裡的數字（Lv2、8 格、1.4 秒…）
  whereColor: '#A958E2', // 說明裡的「戰鬥區域」
};
// 數字型的設定在 CSS 裡要加 px
const WORKSHOP_STYLE_VARS = {
  panelW: ['--ws-panel-w', 'px'], panelH: ['--ws-panel-h', 'px'], cardH: ['--ws-card-h', 'px'], gap: ['--ws-gap', 'px'],
  iconSize: ['--ws-icon', 'px'], btnW: ['--ws-btn-w', 'px'],
  nameSize: ['--ws-name-size', 'px'], nameColor: ['--ws-name-color', ''],
  descSize: ['--ws-desc-size', 'px'], descColor: ['--ws-desc-color', ''],
  nextSize: ['--ws-next-size', 'px'], nextColor: ['--ws-next-color', ''],
  numColor: ['--ws-num-color', ''], whereColor: ['--ws-where-color', ''],
};
function workshopStyle(cfg) {   // 預設值＋設定檔裡改過的
  return { ...WORKSHOP_STYLE_DEFAULT, ...((cfg || (typeof WORKSHOP_CONFIG !== 'undefined' ? WORKSHOP_CONFIG : {})).style || {}) };
}
function applyWorkshopStyle(el, cfg) {   // 把外觀設定寫成 CSS 變數（el＝#workshop）
  if (!el) return;
  const st = workshopStyle(cfg);
  for (const [k, [name, unit]] of Object.entries(WORKSHOP_STYLE_VARS)) el.style.setProperty(name, st[k] + unit);
}

// ---- 裝備／武器的文字和圖片 ----
const WORKSHOP_TEXT_FIELDS = ['name', 'image', 'desc', 'where'];
const WORKSHOP_BASE = {};   // 還沒套用設定檔前的原始資料（編輯器的「恢復原本」用）
function workshopItemDefs() {   // key → 那件裝備／武器的資料
  const out = {};
  if (typeof EQUIPMENT !== 'undefined') for (const d of EQUIPMENT) out[d.id] = d;
  if (typeof WEAPON_UPGRADES !== 'undefined') for (const [k, w] of Object.entries(WEAPON_UPGRADES)) out['w:' + k] = w;
  return out;
}
(function applyWorkshopItems() {
  const defs = workshopItemDefs(), items = (typeof WORKSHOP_CONFIG !== 'undefined' && WORKSHOP_CONFIG.items) || {};
  for (const [key, def] of Object.entries(defs)) {
    WORKSHOP_BASE[key] = Object.fromEntries(WORKSHOP_TEXT_FIELDS.map(f => [f, def[f]]));
    const o = items[key]; if (!o) continue;
    for (const f of WORKSHOP_TEXT_FIELDS) if (typeof o[f] === 'string' && o[f] !== '') def[f] = o[f];
  }
})();
