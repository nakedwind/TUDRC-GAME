/* ===== 背包版面：套用「🎒 背包編輯器」存的位置、大小、字級、文字 =====
   ・資料：data/backpack-layout.js（BACKPACK_LAYOUT）、data/item-texts.js（ITEM_TEXTS，物品名稱／說明／效果標籤）
   ・每個可以調整的東西有一個名字（key），下面的 BACKPACK_PARTS 寫它在背包裡是哪個元素。
     另外有幾種「一個人一個」的：tab:分頁 id、slot:裝備格 id（圖）、slotText:裝備格 id（字）、item:物品 id（道具格的圖）。
   ・位置用位移（translate），不會打亂原本的排版；寬高、字級蓋過原本的設定。
   ・背包每次重畫（換分頁、選物品…）之後，改過的文字會自動再套一次（MutationObserver）。
   ・背包編輯器（背包編輯器.html）也用這個檔：它直接改 BACKPACK_LAYOUT／ITEM_TEXTS，再呼叫 applyBackpackLayout()。
   必須在 data/items.js、data/supplies.js、data/backpack-layout.js、data/item-texts.js 之後載入。
*/
// group：編輯器清單裡的分類；kind：'img'＝圖片（大小只有一個數字＝寬，高度照圖片比例，不會變形）；text：這個東西的文字能不能改、改了存在哪裡
//   'fixed'＝介面文字（存在 BACKPACK_LAYOUT.texts）；'item.name'／'item.desc'／'item.effect'＝目前選的物品的文字（存在 ITEM_TEXTS）
//   'category'＝分類標籤（每個分類各一份）；'use'＝「使用」按鈕（可以用的時候才換字）
const BACKPACK_PARTS = {
  'panel.card':   { group: '面板區域', label: '整個背包視窗', sel: '#backpack .backpack-card' },
  'panel.head':   { group: '面板區域', label: '標題列', sel: '#backpack .backpack-head' },
  'panel.equip':  { group: '面板區域', label: '部隊長裝備欄', sel: '#equipPanel' },
  'panel.main':   { group: '面板區域', label: '道具一覽', sel: '#backpack .backpack-main' },
  'panel.tabs':   { group: '面板區域', label: '分類分頁列', sel: '#backpackTabs' },
  'panel.grid':   { group: '面板區域', label: '道具格子區', sel: '#backpackGrid' },
  'panel.detail': { group: '面板區域', label: '物品說明欄', sel: '#backpackDetail' },
  'panel.battery': { group: '面板區域', label: '手電筒電量（裝備高亮度手電筒時出現）', sel: '#equipPanel .equip-battery' },
  'panel.gearStats': { group: '面板區域', label: '裝備的效果框（「目前效果」那一格）', sel: '#backpackDetail .bag-gear-stats' },
  // 手電筒電量區塊裡的文字（js/equipment.js 畫的）：各自調位置、字級
  'text.batteryLabel': { group: '手電筒電量的文字', label: '「🔋 手電筒電量」', sel: '#equipPanel .equip-battery > span', text: 'fixed' },
  'text.batteryPct':   { group: '手電筒電量的文字', label: '電量百分比（100%）', sel: '#equipPanel .equip-battery > b' },
  'text.batteryCount': { group: '手電筒電量的文字', label: '「背包裡的電池：N 顆」', sel: '#equipPanel .equip-battery > small' },
  'box.bagIcon':  { group: '圖片的框', label: '背包圖示的框', sel: '#backpack .backpack-head .backpack-icon' },
  'box.detailImage': { group: '圖片的框', label: '說明欄的圖片框', sel: '#backpackDetail .bag-detail-image' },
  'img.bagIcon':  { group: '圖片', label: '背包圖示', sel: '#backpack .backpack-head .backpack-button-image', kind: 'img' },
  'img.doll':     { group: '圖片', label: '溫特立繪', sel: '#equipPanel .doll-art', kind: 'img' },
  'text.title':   { group: '文字與按鈕', label: '標題「背包」', sel: '#backpackTitle', text: 'fixed' },
  'text.count':   { group: '文字與按鈕', label: '件數', sel: '#backpack .backpack-title p' },
  'text.equipTitle': { group: '文字與按鈕', label: '「部隊長裝備」標題', sel: '#equipPanel > h3', text: 'fixed' },
  'text.cellName':  { group: '道具一覽的文字', label: '道具格名稱（全部一起）', sel: '#backpackGrid .bag-cell-name' },
  'text.cellCount': { group: '道具一覽的文字', label: '道具格數量（全部一起）', sel: '#backpackGrid .bag-cell > b' },
  'text.name':      { group: '文字與按鈕', label: '物品名稱', sel: '#backpackDetail .bag-item-heading h3', text: 'item.name' },
  'text.catTag':    { group: '文字與按鈕', label: '分類標籤', sel: '#backpackDetail .bag-tags > .bag-tag:first-child', text: 'category' },
  'text.effectTag': { group: '文字與按鈕', label: '效果標籤', sel: '#backpackDetail .bag-tags > .bag-tag.effect', text: 'item.effect' },
  'text.desc':      { group: '文字與按鈕', label: '物品說明', sel: '#backpackDetail .bag-desc', text: 'item.desc' },
  'text.useNote':  { group: '文字與按鈕', label: '「無法使用」「可以送禮」說明', sel: '#backpackDetail .bag-actions > .bag-note:not(:last-child):not(.drag-hint, .free-hint, .gear-hint)' },
  'text.dropNote': { group: '文字與按鈕', label: '「無法丟棄」說明', sel: '#backpackDetail .bag-actions > .bag-note:last-child:not(.drag-hint, .free-hint, .gear-hint)' },   // 子彈、裝備的提示有自己的項目（下面）
  'text.hint':      { group: '文字與按鈕', label: '「可直接拖曳到下方快捷鍵」提示', sel: '#backpackDetail .bag-quick small', text: 'fixed' },
  'btn.use':        { group: '文字與按鈕', label: '使用按鈕', sel: '#backpackDetail .bag-use:not([data-mag-load], [data-gear-equip])', text: 'use' },   // 子彈、裝備的按鈕有自己的項目（下面）
  'btn.magLoad':    { group: '文字與按鈕', label: '子彈「裝進彈匣」按鈕', sel: '#backpackDetail [data-mag-load]', text: 'fixed' },
  'btn.magUnload':  { group: '文字與按鈕', label: '子彈「從彈匣拿下」按鈕', sel: '#backpackDetail [data-mag-unload]', text: 'fixed' },
  'btn.gearEquip':  { group: '文字與按鈕', label: '裝備「裝備／裝到…」按鈕（字跟著格子變，只能調位置大小）', sel: '#backpackDetail [data-gear-equip]' },
  'btn.gearOff':    { group: '文字與按鈕', label: '裝備「卸下」按鈕（字跟著格子變，只能調位置大小）', sel: '#backpackDetail [data-gear-off]' },
  'btn.drop':       { group: '文字與按鈕', label: '丟棄按鈕', sel: '#backpackDetail .bag-drop', text: 'fixed' },
  'btn.close':      { group: '文字與按鈕', label: '關閉按鈕 ×', sel: '#backpackClose' },
  'text.dragNote':  { group: '文字與按鈕', label: '子彈「也可以直接拖曳到武器分頁的彈匣格」提示', sel: '#backpackDetail .bag-actions > .bag-note.drag-hint', text: 'fixed' },
  'text.freeNote':  { group: '文字與按鈕', label: '一般子彈「不佔彈匣格子」提示', sel: '#backpackDetail .bag-actions > .bag-note.free-hint', text: 'fixed' },
  'text.gearNote':  { group: '文字與按鈕', label: '裝備「升級找諾亞」提示', sel: '#backpackDetail .bag-actions > .bag-note.gear-hint', text: 'fixed' },
  'text.gearStatLabel': { group: '文字與按鈕', label: '裝備效果框的標題「目前效果」', sel: '#backpackDetail .bag-gear-stat small' },
  'text.gearStatValue': { group: '文字與按鈕', label: '裝備效果框的內容（例如「偵測範圍 8 格」）', sel: '#backpackDetail .bag-gear-stat b' },
};
const bagAttr = v => String(v).replace(/["\\]/g, '\\$&');
// 某個名字（key）的資料：{ key, group, label, sel, text }；找不到回傳 null
function backpackPart(key) {
  if (BACKPACK_PARTS[key]) return { key, ...BACKPACK_PARTS[key] };
  const [kind, ...rest] = String(key).split(':'), id = rest.join(':');
  if (!id) return null;
  if (kind === 'tab') return { key, group: '分類分頁', label: '分頁：' + id, sel: '#backpackTabs [data-bag-tab="' + bagAttr(id) + '"]', text: 'fixed' };
  if (kind === 'slot') return { key, group: '裝備格', label: '裝備格的框：' + id, sel: '#equipPanel [data-equip-slot="' + bagAttr(id) + '"] > span' };
  if (kind === 'slotImg') return { key, group: '裝備格', label: '裝備格的圖：' + id, sel: '#equipPanel [data-equip-slot="' + bagAttr(id) + '"] > span > *', kind: 'img' };
  if (kind === 'slotText') return { key, group: '裝備格', label: '裝備格文字：' + id, sel: '#equipPanel [data-equip-slot="' + bagAttr(id) + '"] > small' };
  if (kind === 'item') return { key, group: '道具格圖片（每個物品各自）', label: '道具圖：' + id, sel: '#backpackGrid .bag-cell[data-bag-item="' + bagAttr(id) + '"] img', kind: 'img' };
  // 說明欄的物品圖：每個物品各自一份（說明欄身上的 data-bag-item＝現在顯示哪個物品，下面 applyBackpackTexts 會寫上去）
  if (kind === 'detailImg') return { key, group: '說明欄的物品圖（每個物品各自）', label: '說明欄的圖：' + id, sel: '#backpackDetail[data-bag-item="' + bagAttr(id) + '"] .bag-detail-image img', kind: 'img' };
  return null;
}

// ---- 物品文字（名稱、說明）：直接蓋到物品資料上，商店等其他地方也跟著變 ----
const itemTextOriginal = new Map();   // 物品 id → 原本的 { name, desc }（恢復預設用）
function applyItemTexts() {
  if (typeof ITEM_TEXTS === 'undefined') return;
  const lists = [typeof SUPPLIES !== 'undefined' ? SUPPLIES : [], typeof ITEMS !== 'undefined' ? ITEMS : []];
  for (const list of lists) for (const item of list) {
    if (!itemTextOriginal.has(item.id)) itemTextOriginal.set(item.id, { name: item.name, desc: item.desc });
    const orig = itemTextOriginal.get(item.id), o = ITEM_TEXTS[item.id] || {};
    item.name = o.name != null && o.name !== '' ? o.name : orig.name;
    if (o.desc != null && o.desc !== '') item.desc = o.desc; else if (orig.desc === undefined) delete item.desc; else item.desc = orig.desc;
    applyEffectNumbers(item, o.effect);
  }
  // 子彈（data/equipment.js 的 BULLETS）：ITEM_TEXTS['bullet:子彈 id'] 的名稱、說明蓋上去
  if (typeof BULLETS !== 'undefined') for (const [bid, def] of Object.entries(BULLETS)) {
    const key = 'bullet:' + bid;
    if (!itemTextOriginal.has(key)) itemTextOriginal.set(key, { name: def.name, desc: def.desc });
    const orig = itemTextOriginal.get(key), o = ITEM_TEXTS[key] || {};
    if (isWorkshopBullet(def)) continue;   // 開發工坊裡的子彈：下面的 applyWorkshopTexts 處理
    def.name = o.name ? o.name : orig.name;
    if (o.desc) def.desc = o.desc; else if (orig.desc === undefined) delete def.desc; else def.desc = orig.desc;
  }
  applyWorkshopTexts();
}
// ---- 開發工坊裡也有的東西（子彈、裝備、武器）：名稱、說明以開發工坊編輯器為準 ----
// ・存在 data/workshop.js（開發工坊編輯器、背包編輯器改字都寫到這裡，兩邊連通）。
// ・換行只留在背包：背包編輯器的說明（ITEM_TEXTS）跟工坊的說明拿掉換行後一樣＝背包照背包的換行顯示（bagDesc）；
//   不一樣（工坊後來改了字）＝背包也照工坊的。
// ・要等 js/workshop-config.js 載入之後才算（遊戲裡這個檔比較早載入，那邊載完會再呼叫一次 applyItemTexts）。
function bagWorkshopEntries() {   // [背包的物品 id, 開發工坊的 key, 資料]
  const out = [];
  if (typeof BULLETS !== 'undefined') for (const [id, d] of Object.entries(BULLETS)) if (isWorkshopBullet(d)) out.push(['bullet:' + id, 'b:' + id, d]);
  if (typeof WEAPON_UPGRADES !== 'undefined') for (const [id, w] of Object.entries(WEAPON_UPGRADES)) out.push(['gear:w:' + id, 'w:' + id, w]);
  if (typeof EQUIPMENT !== 'undefined') for (const d of EQUIPMENT) out.push(['gear:' + d.id, d.id, d]);
  return out;
}
const bagWorkshopKey = itemId => { const e = bagWorkshopEntries().find(x => x[0] === itemId); return e ? e[1] : null; };
// 工坊沒改過時原本的名稱、說明
function bagWorkshopBase(itemId, key) {
  if (key.startsWith('b:')) return itemTextOriginal.get(itemId) || {};
  const b = WORKSHOP_BASE[key];   // 用編輯器新增的裝備沒有原本的（名稱、說明都在設定檔的 added 裡）
  return b ? { name: b.name, desc: b.ownedDesc || b.desc || '' } : { name: '新裝備', desc: '' };
}
// 工坊現在的名稱、說明（設定檔寫的，沒寫＝原本的）
function bagWorkshopNow(itemId, key) {
  const cfg = WORKSHOP_CONFIG, base = bagWorkshopBase(itemId, key), field = workshopDescField(key);
  return {
    name: workshopTextGet(cfg, key, 'name') || base.name,
    desc: workshopTextGet(cfg, key, field) || (field === 'ownedDesc' ? workshopTextGet(cfg, key, 'desc') : '') || base.desc || '',   // 裝備：舊的設定檔寫在 desc
  };
}
function applyWorkshopTexts() {
  if (typeof WORKSHOP_CONFIG === 'undefined' || typeof WORKSHOP_BASE === 'undefined' || typeof workshopTextGet !== 'function') return;
  for (const [itemId, key, def] of bagWorkshopEntries()) {
    const now = bagWorkshopNow(itemId, key), o = ITEM_TEXTS[itemId] || {};
    if (now.name) def.name = now.name;
    if (workshopDescField(key) === 'desc') { if (now.desc) def.desc = now.desc; else delete def.desc; }
    else def.ownedDesc = now.desc;
    // 背包顯示：工坊的字＋背包自己的換行（背包沒排過＝不換行，工坊的換行不會跑到背包來）
    if (now.desc) def.bagDesc = o.desc ? workshopMergeBreaks(now.desc, o.desc) : workshopNoBreaks(now.desc); else delete def.bagDesc;
  }
}
// ---- 效果標籤裡的數字＝實際效果：在背包編輯器改「出勤 ❤️ 生命上限 +10%」的 10、「✦ SP +30」的 30，遊戲就照新的數字算 ----
// ・出勤補給（buff）：找「攻擊／攻速／防禦／生命上限／負荷累積／疏導量」後面的 N%（疏導量＝負荷累積那一項）。
//   效果完全照文字：寫了哪幾種就有哪幾種（可以換種類、多加、拿掉）；文字裡一種都找不到＝照原本的效果
// ・補給（restore）：找「HP／SP」後面的 +N
// ・標籤恢復預設＝用原本的效果
const itemEffectOriginal = new Map();   // 物品 id → 原本的 { buff, restore }
const EFFECT_BUFF_NAMES = { '攻擊': 'atk', '攻速': 'spd', '防禦': 'def', '生命上限': 'hp', '負荷累積': 'calm', '疏導量': 'calm' };
function applyEffectNumbers(item, text) {
  if (!itemEffectOriginal.has(item.id)) itemEffectOriginal.set(item.id, { buff: item.buff ? { ...item.buff } : null, restore: item.restore });
  const orig = itemEffectOriginal.get(item.id);
  if (orig.buff) item.buff = { ...orig.buff };
  if (orig.restore != null) item.restore = orig.restore;
  if (!text) return;
  if (orig.buff) {
    const re = /(攻擊|攻速|防禦|生命上限|負荷累積|疏導量)\s*[+＋−\-]?\s*(\d+(?:\.\d+)?)\s*[%％]/g, found = {}; let m;
    while ((m = re.exec(text))) found[EFFECT_BUFF_NAMES[m[1]]] = Number(m[2]) / 100;
    if (Object.keys(found).length) item.buff = found;   // 照文字：寫什麼效果就有什麼效果
  }
  if (orig.restore != null && item.use) {
    const m = /(HP|SP)\s*[+＋]\s*(\d+)/i.exec(text);
    if (m && m[1].toLowerCase() === item.use) item.restore = Number(m[2]);
  }
}
applyItemTexts();

// ---- 位置、大小、字級：產生一份 CSS 蓋在原本的樣式上 ----
const BACKPACK_BASE_CSS =
  // 物品說明：從框的左上角開始往下寫（不置中）
  '#backpackDetail .bag-desc{text-align:left;align-self:start;justify-self:stretch;margin:0;overflow-wrap:anywhere;}' +
  // 說明欄每個物品的說明文字都從同一個高度開始：
  //   原本左邊的圖比較高，多出來的高度會平均分給每一列，說明只有一行的物品會被往下擠、兩行的不會，同樣填 Y −30 卻高高低低。
  //   改成多出來的高度全部給最下面那一列；說明往下留 25px，跟原本一行說明的位置一樣（背包編輯器裡填的 Y 才不用重調）。
  '@media (min-width:861px){#backpack .backpack-body > #backpackDetail:not(.gear-detail){grid-template-rows:auto auto auto 1fr;}' +
  '#backpack .backpack-body > #backpackDetail > .bag-desc{margin-top:25px;}' +   // 裝備、武器的說明也一樣（同一個 Y 才會在名稱正下方）
  // 說明欄左邊的圖片框：永遠 100×112，不管裡面的圖調多大都不會跟著變（框的大小要改請在背包編輯器調「說明欄的圖片框」）
  //   圖放大超過框的時候，從框的正中間往四周長出去，不會把框撐大
  '#backpack .backpack-body > #backpackDetail > .bag-detail-image{box-sizing:border-box;height:112px;grid-template:minmax(0,1fr) / minmax(0,1fr);place-items:center;overflow:visible;}' +
  '#backpack .backpack-body > #backpackDetail > .bag-detail-image > img{min-width:0;min-height:0;}}' +
  // 說明欄不顯示捲軸（滾輪照樣能捲）：說明比較長的物品（例如異質急救包）會多出捲軸，把右邊的按鈕往左擠 10px，
  // 跟其他物品對不齊；藏起來之後每個物品的「使用」「丟棄」按鈕位置、大小都一樣
  '#backpackDetail{scrollbar-width:none;}#backpackDetail::-webkit-scrollbar{display:none;}' +
  // 裝備、武器的說明（跟開發工坊連通的那段）：放在名稱下面，「目前效果」往下移一列，不會疊在一起
  //   說明往上移了 30（背包編輯器「物品說明」Y −30），效果框也往上 30，跟說明保持原本的間距
  '#backpackDetail.gear-detail > .bag-desc ~ .bag-gear-stats{grid-row:3 / 5;margin-top:-30px;}';
function backpackLayoutCss() {
  let css = BACKPACK_BASE_CSS;
  const els = (typeof BACKPACK_LAYOUT !== 'undefined' && BACKPACK_LAYOUT.elements) || {};
  for (const [key, o] of Object.entries(els)) {
    const part = backpackPart(key); if (!part || !o) continue;
    const r = [];
    if (o.x || o.y) r.push('translate:' + (o.x || 0) + 'px ' + (o.y || 0) + 'px !important');
    if (part.kind === 'img' && o.size > 0) r.push('width:' + o.size + 'px !important', 'height:auto !important', 'max-width:none !important', 'max-height:none !important', 'min-width:0 !important', 'min-height:0 !important', 'flex:none !important', 'aspect-ratio:auto !important');
    if (part.kind !== 'img' && o.w > 0) r.push('width:' + o.w + 'px !important', 'max-width:none !important', 'min-width:0 !important', 'flex:none !important');
    if (part.kind !== 'img' && o.h > 0) r.push('height:' + o.h + 'px !important', 'max-height:none !important', 'min-height:0 !important', 'overflow:auto');
    if (o.font > 0) r.push('font-size:' + o.font + 'px !important');
    if (o.align) {
      r.push('text-align:' + o.align + ' !important');
      r.push('justify-content:' + ({ left: 'flex-start', center: 'center', right: 'flex-end' }[o.align] || 'center') + ' !important');
    }
    if (r.length) css += part.sel + '{' + r.join(';') + '}';
  }
  // 裝備欄的寬、說明欄的高：連外面的格線一起改，旁邊的區域才會跟著讓位（視窗窄、改成上下排的時候不套用）
  const eq = els['panel.equip'] || {}, dt = els['panel.detail'] || {}, body = [];
  if (eq.w > 0) body.push('grid-template-columns:' + eq.w + 'px minmax(0,1fr) !important');
  if (dt.h > 0) body.push('grid-template-rows:minmax(0,1fr) minmax(0,' + dt.h + 'px) !important');
  if (body.length) css += '@media (min-width:861px){#backpack .backpack-body{' + body.join(';') + '}}';
  return css;
}

// ---- 文字：只換元素自己的文字，旁邊的小圖示（svg）、按鍵提示（kbd）保留 ----
function bagOwnText(el) {
  return [...el.childNodes].filter(n => n.nodeType === 3 && n.nodeValue.trim()).map(n => n.nodeValue).join('').trim();
}
function bagSetOwnText(el, text) {
  const nodes = [...el.childNodes].filter(n => n.nodeType === 3 && n.nodeValue.trim());
  if (!nodes.length) { el.appendChild(document.createTextNode(text)); return; }
  if (nodes[0].nodeValue !== text) nodes[0].nodeValue = text;
  nodes.slice(1).forEach(n => n.remove());
}
// 開發工坊裡的子彈（諾亞開發得出來的）：名稱、說明跟開發工坊連通
// （用 function 寫：上面的 applyItemTexts() 在這行之前就會用到它）
function isWorkshopBullet(def) { return !!def && def.source === 'develop' && !def.removed; }
// 目前背包說明欄顯示的物品
function backpackCurrentItem() {
  if (typeof backpackSel === 'undefined') return null;
  if (String(backpackSel).startsWith('bullet:') && typeof BULLETS !== 'undefined') {   // 子彈：當成一個物品（名稱、說明可以改）
    const def = BULLETS[String(backpackSel).slice(7)];
    return def ? { id: backpackSel, name: def.name, desc: def.bagDesc || def.desc, bullet: true, ws: isWorkshopBullet(def) ? 'b:' + String(backpackSel).slice(7) : null } : null;
  }
  if (String(backpackSel).startsWith('gear:') && typeof gearById === 'function') {   // 裝備、武器：說明跟開發工坊連通
    const g = gearById(backpackSel);
    return g ? { id: backpackSel, name: g.name, desc: g.gear.bagDesc || g.gear.ownedDesc || g.gear.desc || '', gear: true, ws: bagWorkshopKey(backpackSel) } : null;
  }
  return typeof itemById === 'function' ? itemById(backpackSel) : null;
}
// 某個東西目前「改過的文字」存在哪裡：回傳 { get(), set(v) }；不能改字的回傳 null
function backpackTextSlot(key) {
  const part = backpackPart(key); if (!part || !part.text) return null;
  const L = BACKPACK_LAYOUT, texts = L.texts || (L.texts = {});
  const store = k => ({ get: () => texts[k] || '', set: v => { if (v) texts[k] = v; else delete texts[k]; } });
  if (part.text === 'fixed' || part.text === 'use') return store(key);
  if (part.text === 'category') { const it = backpackCurrentItem(); return it ? store('catTag:' + it.category) : null; }
  if (part.text.startsWith('item.')) {
    const it = backpackCurrentItem(); if (!it) return null;
    const field = part.text.slice(5);
    return {
      get: () => (ITEM_TEXTS[it.id] && ITEM_TEXTS[it.id][field]) || '',
      set: v => { const o = ITEM_TEXTS[it.id] || (ITEM_TEXTS[it.id] = {}); if (v) o[field] = v; else delete o[field]; if (!Object.keys(o).length) delete ITEM_TEXTS[it.id]; },
    };
  }
  return null;
}
const bagTextOrig = new Map();   // 改字之前原本的字（背包編輯器顯示「預設」用）：文字的 key → 原本的字
function bagReplaceText(el, text, origKey) {
  const now = bagOwnText(el);
  if (now !== text && !bagTextOrig.has(origKey)) bagTextOrig.set(origKey, now);
  bagSetOwnText(el, text);
}
function applyBackpackTexts() {
  const root = document.getElementById('backpack'); if (!root || typeof BACKPACK_LAYOUT === 'undefined') return;
  const texts = BACKPACK_LAYOUT.texts || {};
  const detail = document.getElementById('backpackDetail');
  if (detail && typeof backpackSel !== 'undefined' && detail.dataset.bagItem !== (backpackSel || '')) detail.dataset.bagItem = backpackSel || '';   // 說明欄的圖每個物品各自調整用
  for (const [key, text] of Object.entries(texts)) {
    if (!text || key.startsWith('catTag:')) continue;
    const part = backpackPart(key); if (!part) continue;
    root.querySelectorAll(part.sel).forEach(el => {
      if (part.text === 'use' && el.disabled) return;   // 「HP 已滿」這種不能用的時候照原本的字
      bagReplaceText(el, text, key);
    });
  }
  const it = backpackCurrentItem();
  if (it) {
    const cat = texts['catTag:' + it.category], tag = root.querySelector(BACKPACK_PARTS['text.catTag'].sel);
    if (cat && tag) bagReplaceText(tag, cat, 'catTag:' + it.category);
    const eff = ITEM_TEXTS[it.id] && ITEM_TEXTS[it.id].effect, effTag = root.querySelector(BACKPACK_PARTS['text.effectTag'].sel);
    if (eff && effTag) bagReplaceText(effTag, eff, 'effect:' + it.id);
  }
}
let backpackLayoutStyle = null;
function applyBackpackLayout() {
  if (!backpackLayoutStyle) { backpackLayoutStyle = document.createElement('style'); backpackLayoutStyle.id = 'backpackLayoutStyle'; document.head.appendChild(backpackLayoutStyle); }
  const css = backpackLayoutCss();
  if (backpackLayoutStyle.textContent !== css) backpackLayoutStyle.textContent = css;
  applyBackpackTexts();
}
// 背包重畫之後（換分頁、選物品、穿脫裝備…）把文字再套一次；在畫面更新之前做，不會閃一下原本的字
(() => {
  const root = document.getElementById('backpack'); if (!root) return;
  new MutationObserver(() => applyBackpackTexts()).observe(root, { childList: true, subtree: true });
  applyBackpackLayout();
})();

// ---- 背包編輯器裡的預覽（?bagedit=1）：在遊戲畫面這邊處理選取、拖曳、縮放，用訊息跟編輯器溝通（跟 UI 編輯器同一種做法） ----
// 編輯器 → 遊戲：ping、setup、state（整份版面＋物品文字）、select、center、mode（play＝試玩，可以直接點背包）
// 遊戲 → 編輯器：ready、parts（分頁、裝備格、物品清單）、opened、pick、info（量到的大小、文字）、move、resize、moved、arrow
if (/[?&]bagedit=1(&|$)/.test(location.search)) (() => {
  let selKey = null, hoverKey = null, drag = null, play = false, keepOpen = false, lastTexts = '';
  const post = m => parent.postMessage(Object.assign({ src: 'bagedit-game' }, m), '*');
  const root = () => document.getElementById('backpack');
  const els = key => { const p = backpackPart(key), r = root(); return p && r ? [...r.querySelectorAll(p.sel)].filter(el => el.getClientRects().length) : []; };
  const over = key => ((BACKPACK_LAYOUT.elements = BACKPACK_LAYOUT.elements || {})[key] = BACKPACK_LAYOUT.elements[key] || {});
  const scaleOf = el => { const r = el.getBoundingClientRect(); return el.offsetWidth ? r.width / el.offsetWidth || 1 : 1; };
  // 點到的東西是哪一個（越裡面的優先；道具格的圖、分頁、裝備格先算「個別」那一個）
  function keyOf(el) {
    if (el.matches('#backpackTabs [data-bag-tab]')) return 'tab:' + el.dataset.bagTab;
    if (el.matches('#equipPanel [data-equip-slot] > span > *')) return 'slotImg:' + el.closest('[data-equip-slot]').dataset.equipSlot;
    if (el.matches('#backpackDetail .bag-detail-image img')) return 'detailImg:' + (backpackSel || '');
    if (el.matches('#equipPanel [data-equip-slot] > span')) return 'slot:' + el.parentElement.dataset.equipSlot;
    if (el.matches('#equipPanel [data-equip-slot] > small')) return 'slotText:' + el.parentElement.dataset.equipSlot;
    if (el.matches('#backpackGrid .bag-cell[data-bag-item] img')) return 'item:' + el.closest('[data-bag-item]').dataset.bagItem;
    const keys = Object.keys(BACKPACK_PARTS);
    for (let i = keys.length - 1; i >= 0; i--) if (el.matches(BACKPACK_PARTS[keys[i]].sel)) return keys[i];
    return null;
  }
  function hit(target) {
    const r = root(); if (!r || !target || !target.closest || !r.contains(target)) return null;
    for (let el = target; el && el !== r; el = el.parentElement) { const k = keyOf(el); if (k) return k; }
    return null;
  }
  // 編輯器左邊清單要用的：分頁、裝備格、每個物品
  function sendParts() {
    const list = [];
    for (const t of [{ id: 'all', name: '全部' }, ...ITEM_CATEGORIES, WEAPON_TAB, GEAR_TAB]) list.push({ key: 'tab:' + t.id, group: '分類分頁', label: '分頁：' + t.name });
    for (const s of [...WEAPON_SLOTS.map(s => ({ id: 'w:' + s.id, name: s.name })), ...EQUIP_SLOTS]) {
      list.push({ key: 'slot:' + s.id, group: '裝備格', label: s.name + '（框）' });
      list.push({ key: 'slotImg:' + s.id, group: '裝備格', label: s.name + '（圖）' });
      list.push({ key: 'slotText:' + s.id, group: '裝備格', label: s.name + '（文字）' });
    }
    for (const it of allItems()) list.push({ key: 'item:' + it.id, group: '道具格圖片（每個物品各自）', label: it.name });
    for (const it of allItems()) list.push({ key: 'detailImg:' + it.id, group: '說明欄的物品圖（每個物品各自）', label: it.name });
    post({ type: 'parts', list });
  }
  // 選到的東西能不能改字、改了存在哪裡、原本是什麼字
  function textInfo(key) {
    const part = backpackPart(key); if (!part || !part.text) return null;
    const el = els(key)[0], it = backpackCurrentItem(), L = BACKPACK_LAYOUT;
    const orig = k => bagTextOrig.has(k) ? bagTextOrig.get(k) : el ? bagOwnText(el) : '';
    if (part.text === 'fixed' || part.text === 'use') {
      if (part.text === 'use' && el && el.disabled) return { note: '這個物品現在不能用（例如 HP 已滿），按鈕照原本的字；換一個能用的物品再改。' };
      return { store: 'texts', k: key, value: (L.texts || {})[key] || '', original: orig(key), scope: '所有物品共用這個字' };
    }
    if (!it) return { note: '先在道具一覽點一個物品，再改它的文字。' };
    if (part.text === 'category' && (it.bullet || it.gear)) return { note: '子彈、裝備的分類標籤不能改。' };
    if (part.text === 'category') {
      const k = 'catTag:' + it.category;
      return { store: 'texts', k, value: (L.texts || {})[k] || '', original: orig(k), scope: '分類「' + categoryOf(it.category).name + '」的標籤都會改' };
    }
    const field = part.text.slice(5), wsKey = it.ws || null;
    if (it.gear && field !== 'desc') return { note: '裝備、武器的名稱請到開發工坊編輯器改；這裡可以改說明。' };
    const o = wsKey ? bagWorkshopNow(it.id, wsKey) : itemTextOriginal.get(it.id) || { name: it.name, desc: it.desc };   // 開發工坊裡也有的：「原本的字」＝工坊現在的
    if (field === 'effect' && !el) return { note: '這個物品沒有效果標籤。' };
    // 開發工坊裡也有的：「原本的字」＝工坊的說明拿掉換行（換行各自排）；wsDesc＝工坊原本的（含工坊的換行，同步時保留）
    const original = field === 'name' ? o.name : field === 'desc' ? (wsKey ? workshopNoBreaks(o.desc) : itemDesc(Object.assign({}, it, { desc: o.desc }))) : orig('effect:' + it.id);
    return { store: 'items', id: it.id, field, value: (ITEM_TEXTS[it.id] || {})[field] || '', original, multiline: field === 'desc', ws: wsKey, wsDesc: wsKey ? o.desc : undefined,
      scope: wsKey ? '「' + o.name + '」跟開發工坊連通：改的字也會改到開發工坊編輯器（換行只留在背包）' : '只改「' + o.name + '」這個物品（商店等其他地方也會跟著變）' };
  }
  function sendInfo(key) {
    if (!key) return;
    const list = els(key), el = list[0], values = {};
    if (el) {
      const cs = getComputedStyle(el), r = el.getBoundingClientRect();
      values.w = Math.round(el.offsetWidth || r.width); values.h = Math.round(el.offsetHeight || r.height);
      if (backpackPart(key).kind === 'img') {   // 圖片：實際畫出來的寬（框比圖寬的時候，圖會照比例縮在框裡）
        const nw = el.naturalWidth, nh = el.naturalHeight;
        values.size = Math.round(nw && nh && cs.objectFit === 'contain' ? Math.min(el.offsetWidth, el.offsetHeight * nw / nh) : el.offsetWidth);
      }
      values.font = Math.round(parseFloat(cs.fontSize)); values.align = cs.textAlign === 'start' ? 'left' : cs.textAlign === 'end' ? 'right' : cs.textAlign;
    }
    const it = backpackCurrentItem();
    post({ type: 'info', key, visible: !!el, count: list.length, values, text: textInfo(key), item: it ? it.name : '' });
  }
  // 從清單選到看不到的東西時，把它叫出來（例如別的分頁的物品）
  function reveal(key) {
    if (els(key).length) return;
    const id = key.startsWith('item:') ? key.slice(5) : key.startsWith('detailImg:') ? key.slice(10) : null; if (!id) return;
    if (!ownedItems().some(i => i.id === id)) backpackTab = 'all';
    backpackSel = id; renderBackpack();
  }
  function setup() {
    try {
      const list = mapList(), idx = list.findIndex(m => /應變中心/.test(m.name));
      switchMap(Math.max(0, idx)); newGame();
      const ov = document.getElementById('overlay'); if (ov) ov.style.display = 'none';
      G.running = true;
      document.querySelectorAll('#itemIntro, #pauseBadge').forEach(el => el.classList.add('hidden'));
      const editors = document.getElementById('editors'); if (editors) editors.style.display = 'none';
      for (const it of allItems()) supplyInventory.set(it.id, 3);   // 每一種都放 3 個，看得到所有物品（存檔被擋住了，不會留下來）
      const used = new Set();
      for (const s of EQUIP_SLOTS) {   // 每個裝備格都穿一件，看得到裝備的圖
        const def = EQUIPMENT.find(e => s.kinds.includes(e.kind) && !used.has(e.id)); if (!def) continue;
        used.add(def.id); equipState.owned[def.id] = equipState.owned[def.id] || 1; equipState.equipped[s.id] = def.id;
      }
      const realClose = closeBackpack;
      closeBackpack = silent => { if (!keepOpen) realClose(silent); };   // 預覽裡背包一直開著
      openBackpack(); keepOpen = true;
      sendParts(); post({ type: 'opened' });
    } catch (e) { console.warn('背包編輯器預覽：準備畫面失敗', e); }
  }
  function applyState(m) {
    const replace = (obj, data) => { for (const k of Object.keys(obj)) delete obj[k]; Object.assign(obj, JSON.parse(JSON.stringify(data || {}))); };
    replace(BACKPACK_LAYOUT, m.layout || { elements: {}, texts: {} });
    replace(ITEM_TEXTS, m.itemTexts || {});
    if (m.ws && typeof WORKSHOP_CONFIG !== 'undefined') {   // 背包編輯器改的名稱、說明（開發工坊的設定：子彈、裝備、武器）
      for (const [key, w] of Object.entries(m.ws)) {
        workshopTextSet(WORKSHOP_CONFIG, key, 'name', w.name || '');
        workshopTextSet(WORKSHOP_CONFIG, key, workshopDescField(key), w.desc || '');
      }
      lastTexts = null;   // 一定重算
    }
    const texts = JSON.stringify([BACKPACK_LAYOUT.texts, ITEM_TEXTS]);
    if (texts !== lastTexts) { lastTexts = texts; applyItemTexts(); if (backpackOpen) renderBackpack(); }   // 改了字：重畫背包，拿掉的字才會變回原本的
    applyBackpackLayout();
    if (selKey) sendInfo(selKey);
  }
  function center(key, axis) {   // 對齊外面那一層（它所在的框）的正中間
    const el = els(key)[0], parentEl = el && el.parentElement; if (!parentEl) return;
    const r = el.getBoundingClientRect(), pr = parentEl.getBoundingClientRect(), s = scaleOf(parentEl) || 1, o = over(key);
    if (axis !== 'y') o.x = Math.round((o.x || 0) + (pr.left + pr.width / 2 - (r.left + r.width / 2)) / s);
    if (axis !== 'x') o.y = Math.round((o.y || 0) + (pr.top + pr.height / 2 - (r.top + r.height / 2)) / s);
    applyBackpackLayout(); post({ type: 'move', key, x: o.x || 0, y: o.y || 0 }); post({ type: 'moved', key }); sendInfo(key);
  }
  window.addEventListener('message', e => {
    const m = e.data; if (!m || m.src !== 'bagedit-editor') return;
    if (m.type === 'state') applyState(m);
    else if (m.type === 'select') { selKey = m.key; if (m.key) reveal(m.key); sendInfo(m.key); }
    else if (m.type === 'center') center(m.key, m.axis);
    else if (m.type === 'mode') { play = !!m.play; hoverKey = null; }
    else if (m.type === 'setup') setup();
    else if (m.type === 'ping' && document.readyState !== 'loading') post({ type: 'ready' });   // 程式都載完就回答（不用等圖片下載完）
  });

  // ---- 滑鼠：點一下選、拖曳移動、拖右下角的小方塊改大小；試玩模式下照遊戲原本的方式點 ----
  let outline = null, handle = null, hoverBox = null;
  const extra = [];
  window.addEventListener('pointerdown', ev => {
    if (handle && ev.target === handle && selKey) {   // 改大小
      ev.preventDefault(); ev.stopImmediatePropagation();
      const el = els(selKey)[0]; if (!el) return;
      const o = over(selKey);
      const img = backpackPart(selKey).kind === 'img', frame = /^(box\.|slot:|panel\.battery$)/.test(selKey);   // 圖片的框、手電筒電量：也鎖長寬比例
      drag = { key: selKey, resize: true, img, frame, sx: ev.clientX, sy: ev.clientY, size: o.size || el.offsetWidth, w: o.w || el.offsetWidth, h: o.h || el.offsetHeight, s: scaleOf(el), moved: false };
      return;
    }
    if (play) return;
    ev.preventDefault(); ev.stopImmediatePropagation();
    const key = hit(ev.target); if (!key) return;
    const cell = ev.target.closest('#backpackGrid [data-bag-item]');   // 點到物品：順便選這個物品，下面的說明欄跟著換
    if (cell && cell.dataset.bagItem !== backpackSel) selectBackpackItem(cell.dataset.bagItem);
    const tab = ev.target.closest('#backpackTabs [data-bag-tab]');   // 點到分頁：順便切過去
    if (tab && tab.dataset.bagTab !== backpackTab) { backpackTab = tab.dataset.bagTab; backpackSel = null; renderBackpack(); }
    selKey = key; post({ type: 'pick', key }); sendInfo(key);
    const el = els(key)[0], o = over(key);
    drag = { key, sx: ev.clientX, sy: ev.clientY, x: o.x || 0, y: o.y || 0, s: el && el.parentElement ? scaleOf(el.parentElement) : 1, moved: false };
  }, true);
  window.addEventListener('pointermove', ev => {
    if (!drag) { hoverKey = play ? null : hit(ev.target); return; }
    ev.preventDefault();
    if (!drag.moved && Math.abs(ev.clientX - drag.sx) + Math.abs(ev.clientY - drag.sy) < 3) return;   // 只是點一下，不算拖
    if (!drag.moved) post({ type: 'dragstart', key: drag.key });   // 編輯器記下拖之前的樣子（Ctrl+Z 用）
    drag.moved = true;
    const dx = (ev.clientX - drag.sx) / drag.s, dy = (ev.clientY - drag.sy) / drag.s, o = over(drag.key);
    if (drag.resize && drag.img) { o.size = Math.max(4, Math.round(drag.size + dx)); post({ type: 'resize', key: drag.key, size: o.size }); }   // 圖片：長寬一起、1px 一格
    else if (drag.resize && drag.frame) { o.w = Math.max(4, Math.round(drag.w + dx)); o.h = Math.max(4, Math.round(o.w * drag.h / drag.w)); post({ type: 'resize', key: drag.key, w: o.w, h: o.h }); }   // 圖片的框：寬變多少、高照比例
    else if (drag.resize) { o.w = Math.max(4, Math.round(drag.w + dx)); o.h = Math.max(4, Math.round(drag.h + dy)); post({ type: 'resize', key: drag.key, w: o.w, h: o.h }); }
    else { o.x = Math.round(drag.x + dx); o.y = Math.round(drag.y + dy); post({ type: 'move', key: drag.key, x: o.x, y: o.y }); }
    applyBackpackLayout();   // 先在這邊動，拖起來比較順
  }, true);
  window.addEventListener('pointerup', () => { if (drag) { if (drag.moved) { post({ type: 'moved', key: drag.key }); sendInfo(drag.key); } drag = null; } }, true);
  for (const t of ['click', 'mousedown', 'mouseup', 'contextmenu', 'dblclick'])
    window.addEventListener(t, ev => { if (!play || ev.target === handle) { ev.preventDefault(); ev.stopImmediatePropagation(); } }, true);
  window.addEventListener('keydown', ev => {   // 方向鍵交給編輯器微調；其他鍵不給遊戲（不會走路、不會開別的視窗）
    if (ev.key.startsWith('Arrow') && selKey && !play) post({ type: 'arrow', key: ev.key, shift: ev.shiftKey });
    const k = ev.key.toLowerCase();
    if ((ev.ctrlKey || ev.metaKey) && (k === 'z' || k === 'y')) post({ type: k === 'y' || ev.shiftKey ? 'redo' : 'undo' });   // Ctrl+Z／Ctrl+Y 交給編輯器
    if ((ev.ctrlKey || ev.metaKey) && k === 's') post({ type: 'save' });
    ev.preventDefault(); ev.stopImmediatePropagation();
  }, true);
  // 背包換分頁、選物品之後，選著的東西的大小、文字可能變了：告訴編輯器
  let infoTimer = 0;
  const bp = document.getElementById('backpack');
  if (bp) new MutationObserver(() => { clearTimeout(infoTimer); infoTimer = setTimeout(() => { if (selKey && !drag) sendInfo(selKey); }, 60); }).observe(bp, { childList: true, subtree: true });

  // ---- 選到的東西外面畫虛線（同一組的其他幾個畫細虛線）；滑鼠停著的畫黃色細線 ----
  const box = css => { const d = document.createElement('div'); d.style.cssText = 'position:fixed;z-index:99999;pointer-events:none;display:none;' + css; document.body.appendChild(d); return d; };
  const place = (d, r, pad) => Object.assign(d.style, { display: 'block', left: (r.left - pad) + 'px', top: (r.top - pad) + 'px', width: (r.width + pad * 2) + 'px', height: (r.height + pad * 2) + 'px' });
  function loop() {
    if (!outline && document.body) {
      outline = box('border:2px dashed #7fd7da;border-radius:4px');
      hoverBox = box('border:1px solid rgba(255,214,102,.9);border-radius:4px');
      handle = box('width:12px;height:12px;box-sizing:border-box;background:#7fd7da;border:2px solid #10232a;border-radius:2px;cursor:nwse-resize;pointer-events:auto;z-index:100000');
      handle.title = '拖曳改大小';
    }
    if (outline) {
      const list = selKey ? els(selKey) : [];
      if (list.length) {
        const r = list[0].getBoundingClientRect();
        place(outline, r, 2);
        Object.assign(handle.style, { display: 'block', left: (r.right - 5) + 'px', top: (r.bottom - 5) + 'px' });
      } else { outline.style.display = 'none'; handle.style.display = 'none'; }
      while (extra.length < Math.min(list.length - 1, 60)) extra.push(box('border:1px dashed rgba(127,215,218,.7);border-radius:4px'));
      extra.forEach((d, i) => { const el = list[i + 1]; if (el) place(d, el.getBoundingClientRect(), 1); else d.style.display = 'none'; });
      const hl = hoverKey && hoverKey !== selKey && !drag ? els(hoverKey)[0] : null;
      if (hl) place(hoverBox, hl.getBoundingClientRect(), 1); else hoverBox.style.display = 'none';
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
