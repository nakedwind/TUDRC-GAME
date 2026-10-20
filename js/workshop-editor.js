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
const fromFile = () => ({ items: clone(WORKSHOP_CONFIG.items || {}), added: clone(WORKSHOP_CONFIG.added || []), removed: clone(WORKSHOP_CONFIG.removed || []), style: clone(WORKSHOP_CONFIG.style || {}) });
let cfg = (() => {
  try {
    const d = JSON.parse(localStorage.getItem(WS_DRAFT_KEY) || 'null');
    if (d && d.items && d.style) return { items: d.items, added: d.added || [], removed: d.removed || [], style: d.style };
  } catch (_) {}
  return fromFile();
})();
// 以前（最高 Lv3）新增的裝備：費用、每一級的說明補到最高級
for (const a of cfg.added) { a.cost = workshopCustomDef(a).cost; a.levels = WORKSHOP_LV_INDEX.map(i => String((a.levels || [])[i] ?? '')); }
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
const getDef = key => isCustom(key) ? workshopCustomDef(customEntry(key)) : BUILTIN[key];
const gearKeys = () => BUILTIN_GEAR.concat(cfg.added.map(a => a.id));   // 清單：原本的裝備＋新增的裝備
const isField = (key, def) => isWeapon(key) ? !!def.field : def.source !== 'develop';   // 只能在戰鬥區域拿到
// 這件現在要顯示的文字／圖片
function itemView(key) {
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
const levelsChanged = key => levelEdits(key).some(t => typeof t === 'string' && t !== '');
const itemChanged = key => { const o = cfg.items[key]; return !!o && (WORKSHOP_TEXT_FIELDS.some(f => typeof o[f] === 'string' && o[f] !== '' && o[f] !== (WORKSHOP_BASE[key] || {})[f]) || levelsChanged(key) || valuesChanged(key)); };
const iconHtml = (key, view) => view.image ? '<img src="' + esc(view.image) + '" alt="">' : '<i>' + esc(getDef(key).icon || '？') + '</i>';
let selKey = BUILTIN_GEAR[0];

// ---- 左邊清單 ----
function renderList() {
  const box = document.getElementById('itemList');
  const btn = key => {
    const v = itemView(key);
    const tag = isRemoved(key) ? 'removed' : isCustom(key) ? 'added' : itemChanged(key) ? 'changed' : '';
    return '<button type="button" data-key="' + esc(key) + '" class="' + (key === selKey ? 'sel ' : '') + tag + '">' +
      iconHtml(key, v) + '<span>' + esc(v.name) + '<small>' + (isWeapon(key) ? '武器' : WORKSHOP_KINDS[getDef(key).kind] || '裝備') + '</small></span></button>';
  };
  box.innerHTML = '<div class="list-head">裝備</div>' + gearKeys().map(btn).join('') + '<div class="list-head">武器</div>' + WEAPON_KEYS.map(btn).join('');
}
document.getElementById('itemList').addEventListener('click', e => {
  const b = e.target.closest('[data-key]'); if (!b) return;
  selKey = b.dataset.key; renderList(); renderItemForm(); renderPreview();
});
document.getElementById('addItem').addEventListener('click', () => {
  const id = 'custom_' + Date.now().toString(36);
  cfg.added.push({ id, name: '新裝備', kind: 'acc', icon: '🧰', image: '', source: 'develop', where: '', desc: '在這裡寫裝備的說明。', cost: [50, 100, 160, 240, 340], levels: ['Lv1 的效果', 'Lv2 的效果', 'Lv3 的效果'] });
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
  const key = selKey, def = getDef(key), v = itemView(key), form = document.getElementById('itemForm');
  if (isRemoved(key)) {
    form.innerHTML = '<p class="removed-note">「' + esc(v.name) + '」已經刪除：對玩家來說永久從遊戲消失（開發工坊、背包、裝備欄都沒有' + (isWeapon(key) ? '，置物箱也撿不到' : '') + '，已經拿到的也清掉）。資料和圖片還在專案裡；復原後玩家要重新取得。</p>' +
      '<button type="button" class="ed-btn primary" id="itemRestore">↩ 復原這' + (isWeapon(key) ? '把武器' : '件裝備') + '</button>';
    return;
  }
  if (isCustom(key)) {   // 新增的裝備：每一項都可以改
    const a = customEntry(key);
    form.innerHTML = '<p class="hint" style="margin:0 0 8px">✨ 這是新增的裝備。效果說明是自己寫的文字；遊戲裡實際的效果（例如照明、減傷）要另外寫程式。</p>' +
      '<div class="field">名稱<input type="text" data-c="name" value="' + esc(a.name) + '"></div>' +
      imageField(key, v, 'data-c') +
      '<div class="row2"><div class="field">穿在哪裡<select data-c="kind">' + Object.entries(WORKSHOP_KINDS).map(([k, n]) => '<option value="' + k + '"' + (a.kind === k ? ' selected' : '') + '>' + n + '</option>').join('') + '</select></div>' +
      '<div class="field">怎麼拿到<select data-c="source"><option value="develop"' + (a.source !== 'field' ? ' selected' : '') + '>找諾亞開發</option><option value="field"' + (a.source === 'field' ? ' selected' : '') + '>只能在戰鬥區域拿到</option></select></div></div>' +
      (a.source === 'field' ? '<div class="field">取得方式的說明<textarea data-c="where">' + esc(a.where) + '</textarea><span class="hint">還沒拿到時顯示在說明下面，整段照寫的顯示；寫到「戰鬥區域」會是紫色。要真的放進置物箱等地方，還需要另外設定。</span></div>' : '') +
      '<div class="field">說明（還沒拿到時顯示）<textarea data-c="desc">' + esc(a.desc) + '</textarea></div>' +
      '<div class="field">說明（已擁有）<textarea data-c="ownedDesc" placeholder="空白＝不顯示">' + esc(a.ownedDesc || '') + '</textarea><span class="hint">拿到之後顯示在名稱下面、詳細數值的上面。</span></div>' +
      '<div class="field">要花幾個異質碎片</div><div class="row2" style="grid-template-columns:repeat(' + WORKSHOP_MAX_LV + ', 1fr)">' +
        WORKSHOP_LV_INDEX.map(i => i ? '升到 Lv' + (i + 1) : '開發').map((n, i) => '<div class="field">' + n + '<input type="text" inputmode="numeric" data-c="cost' + i + '" value="' + esc(a.cost[i]) + '"></div>').join('') + '</div>' +
      WORKSHOP_LV_INDEX.map(i => '<div class="field">Lv' + (i + 1) + ' 的效果說明<input type="text" data-c="lv' + i + '" value="' + esc(a.levels[i]) + '"></div>').join('') +
      '<button type="button" class="ed-btn danger" id="itemDelete">🗑 刪除這件裝備</button>';
    return;
  }
  const base = WORKSHOP_BASE[key] || {}, field = isField(key, def);
  form.innerHTML =
    '<div class="field">名稱<input type="text" data-f="name" value="' + esc(v.name) + '"></div>' +
    imageField(key, v, 'data-f') +
    '<div class="field">說明（還沒拿到時顯示）<textarea data-f="desc">' + esc(v.desc) + '</textarea>' +
      '<span class="hint">還沒拿到時顯示；下面會接著' + (field ? '「取得方式的說明」' : '「Lv1：…」的彩色說明') + '。' + (isWeapon(key) && !field ? '這把武器一開始就有，遊戲裡不會出現「還沒拿到」的樣子。' : '') + '</span></div>' +
    '<div class="field">說明（已擁有）<textarea data-f="ownedDesc" placeholder="空白＝不顯示">' + esc(v.ownedDesc || '') + '</textarea>' +
      '<span class="hint">拿到之後顯示在名稱下面；下面接著這件的詳細數值（目前效果、下一級）。</span></div>' +
    (field ? '<div class="field">取得方式的說明<textarea data-f="where">' + esc(v.where) + '</textarea><span class="hint">還沒拿到時顯示在說明下面，整段照寫的顯示（前面不會再自動加字）；寫到「戰鬥區域」會是紫色。</span></div>' : '') +
    valueTable(key) +
    '<div class="field">每一級的效果說明（開發工坊、背包、裝備欄都會顯示）<span class="hint">會跟著上面的數值自動更新；也可以自己改成別的文字，清空＝回到自動產生。</span></div>' +
    WORKSHOP_LV_INDEX.map(i => '<div class="field">Lv' + (i + 1) + '<input type="text" data-lv="' + i + '" value="' + esc(statText(key, i)) + '" placeholder="' + esc(autoText(key, i)) + '"></div>').join('') +
    '<div class="img-btns"><button type="button" class="ed-btn" id="itemReset"' + (itemChanged(key) ? '' : ' disabled') + '>恢復為初始設定</button>' +
    '<button type="button" class="ed-btn danger" id="itemDelete">🗑 刪除這' + (isWeapon(key) ? '把武器' : '件裝備') + '</button></div>' +
    (base.name !== v.name ? '<span class="hint">原本叫「' + esc(base.name) + '」</span>' : '');
}
document.getElementById('itemForm').addEventListener('input', e => {
  const f = e.target.dataset.f, cf = e.target.dataset.c, lvi = e.target.dataset.lv, vk = e.target.dataset.vk;
  if (vk !== undefined) {   // 原本的裝備／武器：某一級的實際數值
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
      inp.placeholder = autoText(selKey, j);
      if (!(typeof t === 'string' && t !== '')) inp.value = autoText(selKey, j);
    });
    document.getElementById('itemReset').disabled = !itemChanged(selKey);
  } else if (lvi !== undefined) {   // 原本的裝備／武器：某一級的效果說明
    const o = cfg.items[selKey] || (cfg.items[selKey] = {});
    const i = +lvi, base = autoText(selKey, i), val = e.target.value;
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
    const input = document.querySelector('#itemForm [data-f="image"], #itemForm [data-c="image"]');
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
  ['裝備名稱', [['nameSize', '文字大小', 'num', 9, 30, 1], ['nameColor', '文字顏色：每一格最上面的裝備、武器名稱（例如「手槍」）', 'color']]],
  ['說明／目前效果', [['descSize', '文字大小', 'num', 8, 24, 1], ['descColor', '文字顏色：名稱下面的說明、目前的效果（例如「傷害 5・彈匣 6 發」）', 'color']]],
  ['下一級效果／取得方式', [['nextSize', '文字大小', 'num', 8, 24, 1], ['nextColor', '文字顏色：最下面一行的「升到 Lv2：…」「Lv1：…」、取得方式的說明', 'color']]],
  ['特別標色', [['numColor', '數字的顏色（Lv2、8 格、1.4 秒…）', 'color'], ['whereColor', '「戰鬥區域」的顏色', 'color'], ['itemColor', '道具名稱的顏色（電池、杏仁水、急救包…）', 'color']]],
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
const wsColor = text => workshopColorize(text);   // js/workshop-config.js（跟遊戲同一套：數字、戰鬥區域、道具名稱）
function previewRow(key) {
  const def = getDef(key), v = itemView(key), mode = previewMode, maxLv = def.levels.length;
  const icon = v.image ? '<img src="' + esc(v.image) + '" alt="">' : '<i>' + esc(def.icon || '') + '</i>';
  const row = (lvText, stat, next, btn, about) => '<div class="ws-row' + (key === selKey ? ' ed-sel' : '') + '" data-key="' + esc(key) + '"><span class="ws-icon">' + icon + '</span><div class="ws-text"><b>' + esc(v.name) + lvText + '</b>' + (about ? '<span class="ws-about">' + wsColor(esc(about)) + '</span>' : '') + '<span>' + wsColor(esc(stat)) + '</span>' + (next ? '<small>' + wsColor(esc(next)) + '</small>' : '') + '</div>' + btn + '</div>';
  const cost = n => '<b><i class="ws-shard" role="img" aria-label="異質碎片"></i>' + n + '</b>', w = isWeapon(key);
  const upCost = lv => w ? def.cost[lv - 1] : def.cost[lv];
  const owned = mode === 'start' ? !isField(key, def) && w : true;   // 這個預覽狀態下有沒有拿到（遊戲一開始：只有手槍這類一開始就有的武器；其他狀態＝全部拿到）
  if (!owned) {
    if (isField(key, def)) return row('', v.desc, v.where, '<button type="button" class="ws-btn" disabled>尚未取得</button>');
    return row('', v.desc, 'Lv1：' + statText(key, 0), '<button type="button" class="ws-btn">開發 ' + cost(def.cost[0]) + '</button>');
  }
  const lv = mode === 'start' ? 1 : Math.min(maxLv, +mode.slice(2) || 1);   // 全部 LvN（遊戲一開始＝一開始就有的武器是 Lv1）
  if (lv >= maxLv) return row(' <em>Lv' + lv + '</em>', statText(key, lv - 1), '', '<button type="button" class="ws-btn" disabled>已達最高等級</button>', v.ownedDesc);
  return row(' <em>Lv' + lv + '</em>', statText(key, lv - 1), '升到 Lv' + (lv + 1) + '：' + statText(key, lv), '<button type="button" class="ws-btn">升級 ' + cost(upCost(lv)) + '</button>', v.ownedDesc);
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
  const keepScroll = stage.querySelector('.workshop-body')?.scrollTop || 0;
  stage.style.width = (st.panelW + 32) + 'px'; stage.style.height = (st.panelH + 32) + 'px';   // 跟遊戲一樣：視窗外面留 16px
  const gear = gearKeys().filter(k => !isRemoved(k)).map(previewRow).join('');   // 刪掉的不顯示；新增的接在最後面
  const weapons = WEAPON_KEYS.filter(k => !isRemoved(k)).map(previewRow).join('');   // 刪掉的武器不顯示
  const side = '<aside class="workshop-side"><h3>目前裝備</h3>' +
    ['主武器', '副武器', '頭部', '身體', '隨身物品1', '隨身物品2'].map(n => '<div class="wss-slot"><span class="wss-icon"><i>＋</i></span><div><small>' + n + '</small><b>（預覽）</b></div></div>').join('') + '</aside>';
  stage.innerHTML = '<div id="workshop"><section class="workshop-card" role="dialog" aria-label="開發工坊預覽">' +
    '<header class="workshop-head"><div class="workshop-title"><small>諾亞的開發工坊</small><h2>裝備開發・升級</h2><p>用異質碎片開發新裝備，或把裝備、武器升級</p></div>' +
    '<button type="button" class="workshop-close" aria-label="關閉">×</button></header>' +
    '<div class="workshop-main"><div class="workshop-body"><h3>裝備</h3><div class="ws-grid">' + gear + '</div><h3>武器</h3><div class="ws-grid">' + weapons + '</div></div>' + side + '</div></section></div>';
  const ws = stage.querySelector('#workshop');
  ws.style.padding = '16px';
  applyWorkshopStyle(ws, cfg);
  arrangeRows(ws);
  const body = stage.querySelector('.workshop-body'); if (body) body.scrollTop = keepScroll;
  if (document.getElementById('assetGrid')) renderAssets();
}
// 預覽的裝備狀態（按鈕）：start＝全體未開發、未撿到；lv1～lv5＝全部那一級（最高級＝已達最高等級）
let previewMode = 'start';
function renderPreviewModes() {
  const modes = [['start', '全體未開發、未撿到']].concat(WORKSHOP_LV_INDEX.map(i => ['lv' + (i + 1), '全部 Lv' + (i + 1) + (i + 1 < WORKSHOP_MAX_LV ? '（可升級）' : '（已達最高等級）')]));
  document.getElementById('previewModes').innerHTML = modes.map(([id, n]) => '<button type="button" class="pv-mode' + (previewMode === id ? ' sel' : '') + '" data-mode="' + id + '">' + n + '</button>').join('');
}
document.getElementById('previewModes').addEventListener('click', e => {
  const b = e.target.closest('[data-mode]'); if (!b) return;
  previewMode = b.dataset.mode; renderPreviewModes(); renderPreview();
});
renderPreviewModes();

// ---- 素材圖：預覽下面列出所有裝備、武器的圖（跟地圖編輯器下方的素材列一樣）----
// 點一下＝在左邊選它；右鍵＝「以檔案總管開啟」那張圖所在的資料夾
let assetTab = 'all', assetQuery = '';
const ASSET_KINDS = { head: '頭部', body: '身體', acc: '隨身物品' };
function assetEntries() {
  return gearKeys().concat(WEAPON_KEYS).map(key => {
    const d = getDef(key), v = itemView(key);
    const kind = isWeapon(key) ? '武器' : (ASSET_KINDS[d.kind] || '裝備');
    return { key, name: v.name, image: v.image, icon: d.icon || '', tab: isWeapon(key) ? 'weapon' : 'gear', kind, removed: isRemoved(key), custom: isCustom(key) };
  });
}
function renderAssets() {
  const all = assetEntries(), q = assetQuery.trim().toLowerCase();
  const tabs = [['all', '全部'], ['gear', '裝備'], ['weapon', '武器']];
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
  const r = e.target.closest('.ws-row[data-key]'); if (!r) return;
  selKey = r.dataset.key; renderList(); renderItemForm(); renderPreview();
  document.querySelector('#itemList .sel')?.scrollIntoView({ block: 'nearest' });
});
function scrollPreviewTo(key) {   // 新增後：預覽捲到新的那一格
  const el = document.querySelector('#previewStage .ws-row[data-key="' + key + '"]');
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
    if (Object.keys(keep).length) items[key] = keep;
  }
  const added = cfg.added.map(a => ({ id: a.id, name: a.name, kind: a.kind, icon: a.icon || '🧰', image: a.image || '', source: a.source === 'field' ? 'field' : 'develop',
    where: a.source === 'field' ? (a.where || '') : '', desc: a.desc || '', ownedDesc: a.ownedDesc || '', cost: WORKSHOP_LV_INDEX.map(i => Math.max(0, Math.round(Number(a.cost[i]) || 0))), levels: WORKSHOP_LV_INDEX.map(i => String(a.levels[i] ?? '')) }));
  const removed = cfg.removed.filter(k => k in BUILTIN);   // 刪掉的原本裝備、武器
  const style = {};
  for (const k of Object.keys(WORKSHOP_STYLE_DEFAULT)) if (k in cfg.style && cfg.style[k] !== WORKSHOP_STYLE_DEFAULT[k]) style[k] = cfg.style[k];
  return '/* ===== 諾亞的開發工坊：裝備文字、圖片與外觀（由「🔧 開發工坊編輯器」匯出，整段覆蓋即可）=====\n' +
    '   items：要改哪件裝備／武器（沒寫的就用 data/equipment.js 原本的設定）\n' +
    '     key：裝備用 id（例如 headlamp）；武器前面加 w:（例如 w:pistol）\n' +
    '     name 名稱、image 圖片路徑、desc 說明（還沒拿到時）、ownedDesc 說明（已擁有）、where 取得方式的說明（整段照寫的顯示，「戰鬥區域」會是紫色；只能在戰鬥區域取得的才會用到）\n' +
    '     levels：Lv1～Lv5 的效果說明文字（空白＝照數值自動產生）\n' +
    '     values：Lv1～Lv5 改過的實際數值（例如 {"dmg": 7}；沒寫的＝data/equipment.js 原本的；填文字的話只顯示在效果說明）\n' +
    '   added：新增的裝備（id、名稱、部位 kind、圖片、取得方式 source、費用 cost、每一級的效果說明 levels）\n' +
    '   removed：刪除的原本裝備 id（武器前面加 w:）\n' +
    '   style：開發工坊的外觀（沒寫的就用預設值，見 js/workshop-config.js 的 WORKSHOP_STYLE_DEFAULT） */\n' +
    'const WORKSHOP_CONFIG = ' + JSON.stringify({ items, added, removed, style }, null, 2) + ';\n';
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
  if (!gearKeys().includes(selKey) && !WEAPON_KEYS.includes(selKey)) selKey = BUILTIN_GEAR[0];
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
