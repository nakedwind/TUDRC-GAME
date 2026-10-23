/* ===== 開發工坊設定檔（data/workshop.js）的存檔文字 =====
   開發工坊編輯器、背包編輯器都會存 data/workshop.js，兩邊用這裡的同一段開頭說明（一字不差，內容沒變就不會重寫檔案）。
   子彈的名稱、說明以開發工坊為準：背包編輯器改了子彈的說明，也會寫進這個檔（只有換行留在背包那邊，見 js/backpack-layout.js）。
   不用載入其他檔案就能用。
*/
function workshopConfigText(obj) {
  return '/* ===== 諾亞的開發工坊：裝備文字、圖片與外觀（由「🔧 開發工坊編輯器」匯出，整段覆蓋即可）=====\n' +
    '   items：要改哪件裝備／武器（沒寫的就用 data/equipment.js 原本的設定）\n' +
    '     key：裝備用 id（例如 headlamp）；武器前面加 w:（例如 w:pistol）\n' +
    '     name 名稱、image 圖片路徑、iconScale 圖片大小（%，100＝原本）、iconX／iconY 圖片位移（px，正數＝往右／往下）、infoImgX／infoImgY 下方說明欄裡的圖片位移（px）、infoImgSize 下方說明欄裡的圖片大小（px＝圖的寬，高度照比例；沒寫＝原本的 88，武器 100）、ownedDesc 說明（desc 舊的「還沒拿到時」說明，已經不用）、where 取得方式的說明（整段照寫的顯示，「戰鬥區域」等字會是紫色；只能在戰鬥區域取得的才會用到）\n' +
    '     infoParts：下方說明欄各塊的位置、大小、字級 { name 名稱, tag 標籤, desc 說明, stats 效果框, btn 按鈕, money 經費框：{ x, y, w, h, font }（px），也可以寫改過的字 }（子彈、彈匣也可以寫）\n' +
    '     money：開發／升級要花的經費（跟 cost 同一格對同一格，null＝照異質碎片自動算；子彈是一個數字）\n' +
    '     levels：Lv1～Lv5 的效果說明文字（空白＝照數值自動產生）\n' +
    '     values：Lv1～Lv5 改過的實際數值（例如 {"dmg": 7}；沒寫的＝data/equipment.js 原本的；填文字的話只顯示在效果說明）\n' +
    '     cost：要花幾個異質碎片（裝備：[開發, 升到 Lv2, …, 升到 Lv5]；武器：[升到 Lv2, …, 升到 Lv5]；null／沒寫的＝原本的）\n' +
    '     子彈 b:子彈id（例如 b:tranq）：name、image、desc 說明、cost 開發費用、max 最多帶幾發；彈匣 m:magazine：name、desc、slots 每一級裝得下幾種、cost 升級費用\n' +
    '   added：新增的裝備（id、名稱、部位 kind、圖片、取得方式 source、費用 cost、每一級的效果說明 levels）\n' +
    '   removed：刪除的原本裝備 id（武器前面加 w:）\n' +
    '   order：開發工坊裡的排列順序（gear 裝備 id、weapons 武器 w:id；沒列到的接在後面）\n' +
    '   style：開發工坊的外觀（沒寫的就用預設值，見 js/workshop-config.js 的 WORKSHOP_STYLE_DEFAULT） */\n' +
    'const WORKSHOP_CONFIG = ' + JSON.stringify(obj, null, 2) + ';\n';
}
// 拿掉換行（兩邊的說明比對、同步時用：換行只算背包那邊的排版）
const workshopNoBreaks = t => String(t ?? '').replace(/[ \t]*\r?\n[ \t]*/g, '');

// 換行各自保留：用 text 的文字內容，配上 layout 原本的換行位置。
//   例如背包改了說明的字 → 工坊的說明換成新的字，但工坊自己的換行還在原本的地方；反過來工坊改字，背包的換行也留著。
//   作法：比對新舊兩段字（拿掉換行後）前面、後面一樣的部分，換行在一樣的部分就留著（後面的跟著位移），在改掉的那一段裡就拿掉。
function workshopMergeBreaks(text, layout) {
  const flat = workshopNoBreaks(text), old = String(layout ?? ''), oldFlat = workshopNoBreaks(old);
  if (!/\n/.test(old)) return flat;
  const breaks = []; let n = 0;   // [在第幾個字前面換行, 換行本身]
  for (const part of old.split(/([ \t]*\r?\n[ \t]*)/)) { if (/\n/.test(part)) breaks.push([n, part]); else n += part.length; }
  let p = 0; while (p < flat.length && p < oldFlat.length && flat[p] === oldFlat[p]) p++;
  let s = 0; while (s < flat.length - p && s < oldFlat.length - p && flat[flat.length - 1 - s] === oldFlat[oldFlat.length - 1 - s]) s++;
  let out = flat;
  for (const [at, br] of breaks.reverse()) {   // 從後面插回去，前面的位置才不會跑掉
    const pos = at <= p ? at : at >= oldFlat.length - s ? at + flat.length - oldFlat.length : -1;
    if (pos > 0 && pos < out.length + 1) out = out.slice(0, pos) + br + out.slice(pos);
  }
  return out;
}

// ---- 背包和開發工坊連通的名稱、說明：讀／寫設定檔（data/workshop.js 的 WORKSHOP_CONFIG）裡的哪一格 ----
// key：開發工坊的 key（裝備 id、武器 w:id、子彈 b:id、彈匣 m:magazine）
// 說明存在哪個欄位：子彈、彈匣＝desc；裝備、武器＝ownedDesc（工坊裡顯示的那段說明）
const workshopDescField = key => /^[bm]:/.test(key) ? 'desc' : 'ownedDesc';
// 用編輯器「新增」的裝備存在 added 清單裡，其他的存在 items[key]
const workshopAddedOf = (cfg, key) => (Array.isArray(cfg && cfg.added) ? cfg.added : []).find(a => a && a.id === key) || null;
function workshopTextGet(cfg, key, field) {   // 設定檔裡寫的字（沒寫＝''）
  const src = workshopAddedOf(cfg, key) || ((cfg && cfg.items) || {})[key] || {};
  return typeof src[field] === 'string' ? src[field] : '';
}
function workshopTextSet(cfg, key, field, value) {   // 寫進設定檔；空白＝拿掉（照原本的）
  const added = workshopAddedOf(cfg, key);
  if (added) { if (value) added[field] = value; else delete added[field]; return; }
  const items = cfg.items || (cfg.items = {}), o = { ...(items[key] || {}) };
  if (value) o[field] = value; else delete o[field];
  if (Object.keys(o).length) items[key] = o; else delete items[key];
}
