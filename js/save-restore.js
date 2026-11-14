// ============================================================
//  備份／找回進度（設定 →「💾 存檔」→「🛠 備份／找回進度」）
//  ・存檔只存在這台電腦的瀏覽器（localStorage）：清除瀏覽器的網站資料，存檔就會一起不見。
//  ・匯出：把遊戲的所有進度（tudrc…、sentinel… 開頭的資料）存成一個 .json 檔；匯入：從檔案整份還原（會重新整理）。
//  ・找回進度：存檔不見又沒有備份時，把記得的進度直接設回去：已控制的區域、異質碎片、經費、手槍等級、子彈、
//    彈匣／背包擴充、開發過的建築、裝備（每種幾件、幾級）、背包裡的東西。只能在基地（安全區）用，套用後會重新整理。
//  ・只有自己（開發的人）看得到：用 127.0.0.1／localhost 開遊戲、或直接打開檔案（file://）才有按鈕；
//    放到 GitHub Pages 給玩家玩的版本（nakedwind.github.io）不會出現，玩家不能拿來改進度
//  ・都用遊戲本身的存檔函式寫入（saveEquipment、saveMissions、saveTraining、walletSet、saveGame…），格式跟正常玩的存檔一樣。
// ============================================================
const SAVE_BACKUP_PREFIXES = ['tudrc', 'sentinel'];
const SAVE_TOOLS_ON = location.protocol === 'file:' || ['127.0.0.1', 'localhost', '[::1]', '::1'].includes(location.hostname);   // 只在自己的電腦上開放
const saveBackupKeys = () => Object.keys(localStorage).filter(k => SAVE_BACKUP_PREFIXES.some(p => k.startsWith(p)));
// 重新整理前：不要讓「關掉網頁前自動存檔」把剛寫進去的資料蓋掉
function reloadWithoutAutosave() {
  const noop = function () {};
  Storage.prototype.setItem = noop; Storage.prototype.removeItem = noop; Storage.prototype.clear = noop;
  location.reload();
}
function exportSaveFile() {
  const data = {}; for (const k of saveBackupKeys()) data[k] = localStorage.getItem(k);
  const blob = new Blob([JSON.stringify({ game: 'TUDRC', exportedAt: new Date().toISOString(), data }, null, 1)], { type: 'application/json' });
  const a = document.createElement('a'), d = new Date(), pad = n => String(n).padStart(2, '0');
  a.href = URL.createObjectURL(blob); a.download = 'TUDRC存檔-' + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + '-' + pad(d.getHours()) + pad(d.getMinutes()) + '.json';
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  systemNotice('已匯出存檔檔案（' + Object.keys(data).length + ' 項）');
}
function importSaveFile(file) {
  const r = new FileReader();
  r.onload = () => {
    let pack; try { pack = JSON.parse(r.result); } catch (_) { pack = null; }
    const data = pack && pack.game === 'TUDRC' && pack.data;
    if (!data || typeof data !== 'object') { systemNotice('這不是遊戲的存檔檔案', true); return; }
    if (!confirm('用這個檔案取代目前的進度？\n（匯出時間：' + (pack.exportedAt || '不明') + '）\n目前的進度會被蓋掉，遊戲會重新整理。')) return;
    for (const k of saveBackupKeys()) localStorage.removeItem(k);
    for (const [k, v] of Object.entries(data)) if (SAVE_BACKUP_PREFIXES.some(p => k.startsWith(p)) && typeof v === 'string') localStorage.setItem(k, v);
    reloadWithoutAutosave();
  };
  r.readAsText(file);
}

// ---- 找回進度的面板 ----
let saveRestoreEl = null;
const srEsc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function srRows() {   // 面板上要列的東西（照遊戲目前的資料）
  const missions = (typeof MISSIONS !== 'undefined' ? MISSIONS : []).filter(m => m.map);
  const bullets = Object.entries(typeof BULLETS !== 'undefined' ? BULLETS : {}).filter(([id, b]) => id !== 'pistol' && !b.removed);
  const gear = (typeof EQUIPMENT !== 'undefined' ? EQUIPMENT : []).filter(d => !d.removed);
  const builds = typeof buildAll === 'function' ? buildAll().filter(o => !(typeof buildStarter === 'function' && buildStarter(o.id))) : [];
  const items = (typeof allItems === 'function' ? allItems() : []).filter(it => !it.gearV2 && !String(it.id).includes('#') && it.category !== 'equip');
  return { missions, bullets, gear, builds, items };
}
function srGearCount(id) { return typeof gearInstKeys === 'function' && GEAR_V2 ? gearInstKeys(id).length : (equipState.owned[id] ? 1 : 0); }
function srGearLv(id) { const k = typeof gearInstKeys === 'function' && GEAR_V2 ? gearInstKeys(id)[0] : id; return (k && gearKeyLv(k)) || 1; }
function renderSaveRestore() {
  const { missions, bullets, gear, builds, items } = srRows();
  const num = (name, val, min, maxv, w = 70) => '<input type="number" data-sr="' + name + '" value="' + val + '" min="' + min + '"' + (maxv != null ? ' max="' + maxv + '"' : '') + ' style="width:' + w + 'px">';
  const lvSel = (name, val, n) => '<select data-sr="' + name + '">' + Array.from({ length: n }, (_, i) => '<option value="' + (i + 1) + '"' + (i + 1 === val ? ' selected' : '') + '>Lv' + (i + 1) + '</option>').join('') + '</select>';
  const chk = (name, on, label) => '<label class="sr-chk"><input type="checkbox" data-sr="' + name + '"' + (on ? ' checked' : '') + '>' + srEsc(label) + '</label>';
  const cleared = m => typeof missionCleared === 'function' && missionCleared(m);
  const bs = typeof bulletState === 'function' ? bulletState() : equipState.bullets;
  const pistol = WEAPON_UPGRADES.pistol;
  saveRestoreEl.querySelector('.sr-body').innerHTML =
    '<section><h3>💾 備份</h3><p class="sr-hint">存檔只存在這台電腦的瀏覽器裡，清除瀏覽器的網站資料時會一起不見。清除之前先匯出一份，之後可以用匯入還原。</p>' +
    '<div class="sr-btns"><button type="button" class="set-btn primary" data-sr-act="export">⬇ 匯出存檔檔案</button><button type="button" class="set-btn" data-sr-act="import">⬆ 匯入存檔檔案</button><input type="file" accept=".json,application/json" data-sr-file hidden></div></section>' +
    '<section><h3>🛠 找回進度</h3><p class="sr-hint">存檔不見又沒有備份時，把記得的進度填回去，按最下面的「套用」。面板上沒有的東西（服裝、成就、好感度…）不會變；套用後遊戲會重新整理。</p>' +
    '<h4>已控制的區域</h4><div class="sr-grid">' + missions.map(m => chk('m:' + m.id, cleared(m), m.name)).join('') + '</div>' +
    chk('storySeen', !!(missions[0] && cleared(missions[0])), '新手教學、新手區的救援劇情都當作看過了（勾了就不會再播）') +
    '<h4>資源</h4><div class="sr-grid"><label>異質碎片 ' + num('crystals', training.crystals | 0, 0, null, 90) + '</label><label>經費 $' + num('money', walletGet(), 0, null, 90) + '</label></div>' +
    '<h4>武器、彈匣、背包</h4><div class="sr-grid"><label>手槍 ' + lvSel('pistol', equipState.weapons.pistol || 1, pistol.levels.length) + '</label>' +
    '<label>彈匣 ' + lvSel('mag', (equipState.magazine && equipState.magazine.lv) || 1, MAGAZINE.slots.length) + '</label>' +
    Object.entries(BAG_UPGRADES).map(([k, u]) => '<label>' + srEsc(u.name) + ' ' + lvSel('bag:' + k, bagLevel(k), u.slots.length) + '</label>').join('') + '</div>' +
    '<h4>子彈（照明彈以外要開發或撿到）</h4><div class="sr-grid">' + bullets.map(([id, b]) => '<label class="sr-chk"><input type="checkbox" data-sr="b:' + id + '"' + (bs.owned[id] ? ' checked' : '') + '>' + srEsc(b.name) + ' ' + num('bn:' + id, bs.n[id] | 0, 0, null, 60) + ' 發</label>').join('') + '</div>' +
    (builds.length ? '<h4>開發過的建築</h4><div class="sr-grid">' + builds.map(o => chk('bd:' + o.id, !!equipState.builds[o.id], o.name)).join('') + '</div>' : '') +
    '<h4>裝備（每種有幾件、幾級；0 件＝沒有）</h4><div class="sr-grid">' + gear.map(d => '<label>' + srEsc(d.name) + ' ' + num('gc:' + d.id, srGearCount(d.id), 0, 9, 46) + ' 件 ' + lvSel('gl:' + d.id, srGearLv(d.id), d.levels.length) + '</label>').join('') + '</div>' +
    '<h4>背包裡的東西</h4><div class="sr-grid">' + items.map(it => '<label>' + srEsc(it.name) + ' ' + num('i:' + it.id, supplyInventory.get(it.id) || 0, 0, null, 56) + '</label>').join('') + '</div>' +
    '<div class="sr-btns sr-apply"><button type="button" class="set-btn primary" data-sr-act="apply">套用並重新整理</button><button type="button" class="set-btn" data-sr-act="close">取消</button></div></section>';
}
function applySaveRestore() {
  if (!MAP_SAFE || (typeof MAP_STORY !== 'undefined' && MAP_STORY) || window.TEST_MODE) { systemNotice('請在基地（應變中心）裡、非測試模式時使用', true); return; }
  const val = name => saveRestoreEl.querySelector('[data-sr="' + CSS.escape(name) + '"]');
  const on = name => { const el = val(name); return !!(el && el.checked); };
  const n = (name, lo = 0) => { const el = val(name); return Math.max(lo, Math.floor(Number(el && el.value) || 0)); };
  const { missions, bullets, gear, builds, items } = srRows();
  // 區域
  for (const m of missions) {
    const want = on('m:' + m.id), has = missionState.cleared.includes(m.id);
    if (want && !has) { missionState.cleared.push(m.id); for (const k of ['reached', 'briefed']) if (!missionState[k].includes(m.id)) missionState[k].push(m.id); }
    if (!want && has) missionState.cleared = missionState.cleared.filter(id => id !== m.id);
  }
  saveMissions();
  if (on('storySeen')) {
    if (typeof tutorialState !== 'undefined') { tutorialState.decided = true; tutorialState.skip = true; tutorialSave(); }
    if (typeof STORY_TRIGGERS !== 'undefined') for (const t of STORY_TRIGGERS) markStoryTrigger(t.id);
  }
  // 資源
  training.crystals = n('crystals'); saveTraining();
  walletSet(n('money')); G.money = walletGet();
  // 武器、彈匣、背包、子彈、建築
  equipState.weapons.pistol = n('pistol', 1);
  equipState.magazine = equipState.magazine || { lv: 1, load: [] }; equipState.magazine.lv = n('mag', 1);
  equipState.bag = equipState.bag || { items: 1, ammo: 1 }; for (const k of Object.keys(BAG_UPGRADES)) equipState.bag[k] = n('bag:' + k, 1);
  for (const [id] of bullets) { if (on('b:' + id)) { equipState.bullets.owned[id] = true; equipState.bullets.n[id] = n('bn:' + id); } else if (id !== 'flare') { delete equipState.bullets.owned[id]; equipState.bullets.n[id] = 0; } else equipState.bullets.n[id] = n('bn:' + id); }
  for (const o of builds) { if (on('bd:' + o.id)) equipState.builds[o.id] = true; else delete equipState.builds[o.id]; }
  // 裝備：件數多了就做新的放背包、少了就從背包拿掉（穿在身上的不動）；等級套到這種的每一件
  for (const d of gear) {
    const want = Math.min(9, n('gc:' + d.id)), lv = n('gl:' + d.id, 1);
    if (GEAR_V2 && typeof gearInstKeys === 'function') {
      let keys = gearInstKeys(d.id);
      for (let i = keys.length; i < want; i++) { const key = gearNewInst(d.id, lv); if (key) gearBagPut(key); }
      for (const key of gearBagKeys(d.id).slice(0, Math.max(0, gearInstKeys(d.id).length - want))) gearDropInst(key);
      keys = gearInstKeys(d.id);
      for (const key of keys) equipState.inst[key] = Math.min(d.levels.length, lv);
      if (keys.length) equipState.owned[d.id] = equipState.owned[d.id] || 1; else delete equipState.owned[d.id];
    } else { if (want > 0) equipState.owned[d.id] = Math.min(d.levels.length, lv); else delete equipState.owned[d.id]; }
  }
  if (typeof gearDirty !== 'undefined') gearDirty = true;
  saveEquipment();
  // 背包
  for (const it of items) { const c = n('i:' + it.id); if (c > 0) Map.prototype.set.call(supplyInventory, it.id, c); else supplyInventory.delete(it.id); }
  saveGame(true);
  systemNotice('進度已套用，重新整理中…');
  setTimeout(reloadWithoutAutosave, 600);
}
function openSaveRestore() {
  if (!SAVE_TOOLS_ON) return;
  if (!saveRestoreEl) {
    saveRestoreEl = document.createElement('div'); saveRestoreEl.id = 'saveRestore'; saveRestoreEl.className = 'hidden';
    saveRestoreEl.innerHTML = '<section class="sr-card" role="dialog" aria-modal="true" aria-label="備份／找回進度"><header><h2>🛠 備份／找回進度</h2><button type="button" data-sr-act="close" aria-label="關閉">×</button></header><div class="sr-body"></div></section>';
    document.body.appendChild(saveRestoreEl);
    saveRestoreEl.addEventListener('click', e => {
      if (e.target === saveRestoreEl) { closeSaveRestore(); return; }
      const act = e.target.closest('[data-sr-act]'); if (!act) return;
      const a = act.dataset.srAct;
      if (a === 'close') closeSaveRestore();
      else if (a === 'export') exportSaveFile();
      else if (a === 'import') saveRestoreEl.querySelector('[data-sr-file]').click();
      else if (a === 'apply' && confirm('把面板上的進度套用到存檔？遊戲會重新整理。')) applySaveRestore();
    });
    saveRestoreEl.addEventListener('change', e => { if (e.target.matches('[data-sr-file]') && e.target.files[0]) { importSaveFile(e.target.files[0]); e.target.value = ''; } });
    window.addEventListener('keydown', e => { if (e.key === 'Escape' && saveRestoreEl && !saveRestoreEl.classList.contains('hidden')) { e.preventDefault(); e.stopImmediatePropagation(); closeSaveRestore(); } }, true);
  }
  renderSaveRestore(); saveRestoreEl.classList.remove('hidden'); sfx('menu');
}
function closeSaveRestore() { if (saveRestoreEl) saveRestoreEl.classList.add('hidden'); }
// 設定 →「💾 存檔」頁的按鈕
(() => {
  const row = document.querySelector('#settings-save .save-actions'); if (!row || !SAVE_TOOLS_ON) return;   // 玩家的網址：連按鈕都不放
  const b = document.createElement('button'); b.type = 'button'; b.className = 'set-btn'; b.id = 'openSaveRestore'; b.textContent = '🛠 備份／找回進度';
  b.addEventListener('click', openSaveRestore); row.appendChild(b);
})();
