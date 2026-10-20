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
const WORKSHOP_KINDS = { head: '頭部', body: '身體', acc: '隨身物品' };
function workshopCustomDef(a) {   // 設定檔裡一件新增的裝備 → 遊戲用的裝備資料（跟 data/equipment.js 的格式一樣）
  const texts = Array.isArray(a.levels) ? a.levels : [];
  const cost = Array.isArray(a.cost) ? a.cost.map(n => Math.max(0, Math.round(Number(n) || 0))) : [];
  return {
    id: a.id, name: a.name || '新裝備', kind: WORKSHOP_KINDS[a.kind] ? a.kind : 'acc', icon: a.icon || '🧰', image: a.image || '',
    source: a.source === 'field' ? 'field' : 'develop', where: a.where || '', desc: a.desc || '', ownedDesc: a.ownedDesc || '',
    cost: [cost[0] ?? 50, cost[1] ?? 100, cost[2] ?? 160],
    stat: lv => lv.text, levels: [0, 1, 2].map(i => ({ text: String(texts[i] ?? '') })),
    custom: true,
  };
}
// ---- 武器的數值：每一把都用同一張表（所有武器用到的數值合起來）----
function workshopWeaponValueKeys() {   // 所有武器用到的數值，照武器的順序（手槍→照明彈槍→…）排
  const keys = [];
  for (const [key, b] of Object.entries(WORKSHOP_BASE)) if (key.startsWith('w:')) for (const lv of b.levels || []) for (const k of Object.keys(lv)) if (typeof lv[k] === 'number' && !keys.includes(k)) keys.push(k);
  return keys;
}
// 武器多填的數值（這把原本沒有的）→「・燃燒 5 秒」這樣的說明；只是顯示，這把槍的程式沒有用到這個數值
function workshopExtraText(key, lv) {
  if (!key.startsWith('w:') || !lv) return '';
  const own = new Set(); for (const b of (WORKSHOP_BASE[key] || {}).levels || []) for (const k of Object.keys(b)) own.add(k);
  return workshopWeaponValueKeys().filter(k => !own.has(k) && typeof lv[k] === 'number' && lv[k] !== 0).map(k => {   // 0＝不顯示
    const info = WORKSHOP_VALUE_INFO[k] || { label: k, unit: '' }, n = Math.round(lv[k] * (info.scale || 1) * 100) / 100;
    return '・' + info.label + ' ' + n + (info.unit === '%' ? '%' : info.unit ? ' ' + info.unit : '');
  }).join('');
}
// 數值填 0 的那一項，從效果說明裡拿掉（例如燃燒填 0 → 不顯示「燃燒 0 秒」）。
// 作法：把這個數值換成兩個不同的數字各算一次說明，有變的那一段（用「・」分開）就是它，拿掉。
function workshopHideZeros(fn, lv) {
  const text = fn(lv), segs = text.split('・'), drop = new Set();
  for (const k of Object.keys(lv)) {
    if (lv[k] !== 0) continue;
    const a = fn({ ...lv, [k]: 1234567 }).split('・'), b = fn({ ...lv, [k]: 7654321 }).split('・');
    if (a.length !== segs.length || b.length !== segs.length) continue;   // 這一項是 0 時本來就不會出現
    a.forEach((sg, i) => { if (sg !== b[i]) drop.add(i); });
  }
  return drop.size ? segs.filter((_, i) => !drop.has(i)).join('・') : text;
}
// 跟著數值自動產生的效果說明（原本的寫法＋武器多填的數值；填 0 的不顯示）
function workshopAutoStat(key, lv) { const fn = (WORKSHOP_BASE[key] || {}).statFn; return lv && fn ? workshopHideZeros(fn, lv) + workshopExtraText(key, lv) : ''; }
const WORKSHOP_REMOVED = {};   // 被刪掉的原本裝備／武器（key → 資料；編輯器可以「復原」）
(function applyWorkshopItems() {
  const cfg = typeof WORKSHOP_CONFIG !== 'undefined' ? WORKSHOP_CONFIG : {};
  const defs = workshopItemDefs(), items = cfg.items || {};
  for (const [key, def] of Object.entries(defs)) {   // 原本的裝備／武器：改名稱、圖片、說明
    WORKSHOP_BASE[key] = Object.fromEntries(WORKSHOP_TEXT_FIELDS.map(f => [f, def[f]]));
    WORKSHOP_BASE[key].stats = [0, 1, 2].map(i => def.levels && def.levels[i] && def.stat ? def.stat(def.levels[i]) : '');   // 原本每一級的效果說明（跟著數值自動產生的）
    WORKSHOP_BASE[key].levels = (def.levels || []).map(lv => ({ ...lv }));   // 原本每一級的數值（編輯器比對、恢復用）
    WORKSHOP_BASE[key].statFn = def.stat;   // 原本的效果說明產生方式（還沒被設定檔改過）
    const o = items[key]; if (!o) continue;
    for (const f of WORKSHOP_TEXT_FIELDS) if (typeof o[f] === 'string' && o[f] !== '') def[f] = o[f];
    // 每一級的實際數值（傷害、彈匣、裝填秒數…）：直接改進原本的等級資料，遊戲各處讀到的就是新數值，效果說明也會跟著算
    if (Array.isArray(o.values) && def.levels) o.values.forEach((v, i) => {
      if (!v || !def.levels[i]) return;
      for (const [k, n] of Object.entries(v)) if (typeof n === 'number' && Number.isFinite(n)) def.levels[i][k] = n;
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
})();
