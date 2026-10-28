/* ===== 下方資訊條的快捷欄：幾格可以在「設定 → 快捷鍵」調（QUICK_COUNT，預設 8 格、最多 10 格＝1～9、0）=====
   ・新拿到的道具（之前沒有、現在有）會依拿到的順序自動放進第一個空格；預設 1＝醫療包、2＝杏仁水。
     自己拿掉的不會馬上又放回去：要等用完、之後再拿到才會自動放。
   ・設定方式：打開背包，把道具拖到下方的快捷格；或在背包的說明欄按格子的數字鍵。
     快捷格之間也可以拖來拖去（兩格互換）；對快捷格按右鍵、或把它拖回背包＝拿掉。
   ・同一種道具只會在一格（放到別格＝搬過去）。用完（×0）格子變暗但保留，補貨後可以直接用。
   ・可以放的：補 HP／SP 的道具（醫療包、杏仁水、保溫杯）、急救包、異質急救包（按了選要治療的隊員）、腎上腺素、塗鴉筆。零食飲料是送禮用的。
   ・設定存在 tudrc_quickslots_v1（js/new-game.js 的進度清單：開新遊戲會重設、存檔欄位會一起存）。
     內容：{ slots：每一格放什麼, seen：已經自動放過的道具 }；以前的 Q／E／Z／X 讀進來時搬到 1～4。
   必須在 js/shop.js、js/backpack.js、js/equipment.js、js/graffiti.js 之後載入（這裡的 renderQuickSupplies 取代 shop.js 的同名函式）。
*/
const QUICK_ALL_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];   // 最多 10 格
const QUICK_COUNT = { min: 4, max: QUICK_ALL_KEYS.length, start: 8 };   // 設定裡能調的格數範圍、預設幾格
const QUICK_STORE = 'tudrc_quickslots_v1';
// 現在用的格子（設定裡調格數會換掉）；格數變少時，後面格子放的東西會記著，加回來就回來（道具本身一直在背包）
let QUICK_KEYS = (() => {
  let n = QUICK_COUNT.start;
  try { const s = JSON.parse(localStorage.getItem(QUICK_STORE) || 'null'); if (s && Number.isFinite(s.n)) n = s.n; } catch (_) {}
  return QUICK_ALL_KEYS.slice(0, Math.max(QUICK_COUNT.min, Math.min(QUICK_COUNT.max, n | 0)));
})();
const QUICK_DEFAULT = Object.fromEntries(QUICK_ALL_KEYS.map(k => [k, null]));
QUICK_DEFAULT['1'] = 'medkit'; QUICK_DEFAULT['2'] = 'almond-water';
const quickSeen = new Set();   // 已經自動放過的道具（自己拿掉的不會再自動放回去；用完了才清掉）
let quickSlots = (() => {
  try {
    const s = JSON.parse(localStorage.getItem(QUICK_STORE) || 'null');
    if (s && typeof s === 'object') {
      if ('q' in s || 'e' in s || 'z' in s || 'x' in s) {   // 舊的 Q／E／Z／X 四格：照順序搬到 1～4
        const out = Object.fromEntries(QUICK_ALL_KEYS.map(k => [k, null]));
        ['q', 'e', 'z', 'x'].forEach((k, i) => { out[QUICK_ALL_KEYS[i]] = s[k] || null; });
        return out;
      }
      if (s.slots && typeof s.slots === 'object') {
        (Array.isArray(s.seen) ? s.seen : []).forEach(id => quickSeen.add(id));
        return Object.fromEntries(QUICK_ALL_KEYS.map(k => [k, s.slots[k] || null]));
      }
    }
  } catch (_) {}
  return { ...QUICK_DEFAULT };
})();
function saveQuickSlots() { try { localStorage.setItem(QUICK_STORE, JSON.stringify({ slots: quickSlots, seen: [...quickSeen], n: QUICK_KEYS.length })); } catch (_) {} }   // n＝快捷欄幾格
// 設定 → 快捷鍵：增加／減少快捷欄格數（d＝+1／-1）
function changeQuickCount(d) {
  const n = Math.max(QUICK_COUNT.min, Math.min(QUICK_COUNT.max, QUICK_KEYS.length + d));
  if (n === QUICK_KEYS.length) { sfx('error'); return; }
  QUICK_KEYS = QUICK_ALL_KEYS.slice(0, n);
  saveQuickSlots(); sfx('switch'); quickSupplyKey = ''; renderQuickSupplies(); renderQuickCountSetting();
  if (typeof backpackOpen !== 'undefined' && backpackOpen) renderBackpackDetail();
}
function renderQuickCountSetting() {
  const n = QUICK_KEYS.length, last = QUICK_KEYS[n - 1];
  const val = document.getElementById('quickCountVal'); if (val) val.textContent = n;
  document.querySelectorAll('[data-qs-count]').forEach(b => { b.disabled = +b.dataset.qsCount < 0 ? n <= QUICK_COUNT.min : n >= QUICK_COUNT.max; });
  const range = document.getElementById('quickKeysRange');   // 快捷鍵清單裡那一行：1～8
  if (range) range.innerHTML = '<kbd>1</kbd>～<kbd>' + (last === '0' ? '9' : last) + '</kbd>' + (last === '0' ? ' <kbd>0</kbd>' : '');
}
document.querySelectorAll('[data-qs-count]').forEach(b => b.addEventListener('click', () => changeQuickCount(+b.dataset.qsCount)));
renderQuickCountSetting();
const quickItem = id => (id && typeof itemById === 'function' ? itemById(id) : null) || (typeof supplyById === 'function' ? supplyById(id) : null);
function quickAllowed(item) { return !!item && (item.use === 'hp' || item.use === 'sp' || item.act === 'adrenaline' || item.act === 'graffiti' || item.act === 'firstaid'); }
// 新拿到的道具：依拿到的順序（背包的先後）放進第一個空格。用完的從 seen 拿掉，下次拿到會再自動放
function quickAutoFill() {
  let changed = false;
  for (const [id, n] of supplyInventory) {
    if (!(n > 0) || quickSeen.has(id) || !quickAllowed(quickItem(id))) continue;
    quickSeen.add(id); changed = true;
    if (quickSlotOf(id)) continue;
    const empty = QUICK_KEYS.find(k => !quickSlots[k]);
    if (empty) quickSlots[empty] = id;
  }
  for (const id of [...quickSeen]) if (!(supplyInventory.get(id) > 0)) { quickSeen.delete(id); changed = true; }
  if (changed) saveQuickSlots();
}
const quickSlotOf = id => QUICK_KEYS.find(k => quickSlots[k] === id) || null;
// 放進某一格：原本在別格就搬過去；from＝從另一格拖過來（兩格互換）
function setQuickSlot(slot, id, from = null) {
  if (!QUICK_KEYS.includes(slot)) return;
  if (id && !quickAllowed(quickItem(id))) { sfx('error'); systemNotice('這個道具不能放進快捷欄', true); return; }
  if (from && from !== slot) { const t = quickSlots[slot]; quickSlots[slot] = quickSlots[from]; quickSlots[from] = t; }
  else { const old = quickSlotOf(id); if (old && old !== slot) quickSlots[old] = null; quickSlots[slot] = id || null; }
  saveQuickSlots(); sfx('place'); quickSupplyKey = ''; renderQuickSupplies();
  if (typeof backpackOpen !== 'undefined' && backpackOpen) renderBackpackDetail();
}
function clearQuickSlot(slot) { if (!quickSlots[slot]) return; quickSlots[slot] = null; saveQuickSlots(); sfx('switch'); quickSupplyKey = ''; renderQuickSupplies(); if (typeof backpackOpen !== 'undefined' && backpackOpen) renderBackpackDetail(); }

// ---- 畫快捷欄（取代 js/shop.js 的 renderQuickSupplies）----
function renderQuickSupplies() {
  const box = document.getElementById('quickSupplies'); if (!box) return;
  quickAutoFill();
  const state = QUICK_KEYS.map(k => { const it = quickItem(quickSlots[k]); return [k, it ? it.id : '', it ? (supplyInventory.get(it.id) || 0) : 0]; });
  const key = JSON.stringify(state); if (key === quickSupplyKey) return; quickSupplyKey = key;
  box.innerHTML = state.map(([k, id, count]) => {
    const it = quickItem(id), K = k.toUpperCase();
    if (!it) return `<button class="quick-supply quick-empty" type="button" data-qs-slot="${k}" data-tip="把背包的道具拖到這裡" data-tip-key="qs-${k}" aria-label="${K} 空格">
      <span class="qs-icon">＋</span><span class="qs-text"><small>空格</small><b>　</b></span><kbd>${K}</kbd></button>`;
    const kind = it.use === 'hp' || it.use === 'sp' ? it.use : 'item', off = !count;   // 只有用完了才變暗（HP／SP 滿了不暗，按下去才提示已滿）
    const tip = !count ? `${K}｜沒有${it.name}了` : `${K}｜${it.name}` + (SUPPLY_KIND[it.use] ? ' ' + supplyEffect(it) : '');
    // 懸停提示（js/hover-tip.js）：上方框＝效果（SP+30；HP／SP 滿了也照樣顯示，按下去才提示已滿、播不能用的音效；用完了才顯示「用完了」），下方＝名稱
    const effect = !count ? '用完了' : SUPPLY_KIND[it.use] ? `${SUPPLY_KIND[it.use].stat}+${it.restore}` : (it.effect || '');
    return `<button class="quick-supply ${kind}${off ? ' off' : ''}" type="button" draggable="true" data-qs-slot="${k}" aria-disabled="${off}" data-tip="${effect}" data-tip-name="${it.name}" data-tip-key="qs-${k}" aria-label="${tip}">
      <span class="qs-icon"><img src="${it.image}" alt=""></span><span class="qs-text"><small>${it.name}</small><b>×${count}</b></span><kbd>${K}</kbd></button>`;
  }).join('');
  if (typeof refreshHoverTip === 'function') refreshHoverTip();   // 游標還停在某一格：提示跟著更新
}
// ---- 使用 ----
function useQuickSlot(slot) {
  const it = quickItem(quickSlots[slot]), p = G && G.player; if (!p) return;
  if (!it) { sfx('error'); flash(slot.toUpperCase() + ' 是空的', p.x, p.y - 54, '#c9d3dc'); return; }
  if (!(supplyInventory.get(it.id) > 0)) { sfx('error'); flash(`沒有${it.name}了`, p.x, p.y - 54, '#c9d3dc'); return; }
  if (it.act === 'graffiti') { if (typeof openGraffitiPalette === 'function') openGraffitiPalette(it.id); return; }   // 塗鴉筆：選圖案再畫（js/graffiti.js；基地也可以畫）
  if (MAP_SAFE) { sfx('error'); flash('戰鬥中才能用', p.x, p.y - 54, '#c9d3dc'); return; }
  if (it.act === 'adrenaline') { if (typeof useAdrenaline === 'function') useAdrenaline(); return; }   // js/equipment.js
  if (it.act === 'firstaid') { if (typeof useFirstAid === 'function') useFirstAid(); return; }   // 急救包、異質急救包：選要治療的隊員（js/equipment.js；再按一次＝取消）
  useSupply(it.id);   // 醫療包、杏仁水…（js/shop.js）
}
window.addEventListener('keydown', e => {
  const k = e.key;   // 1～9、0 裡現在有用到的格子（數字鍵盤的也算）
  if (e.repeat || !QUICK_KEYS.includes(k) || e.ctrlKey || e.altKey || e.metaKey) return;
  if (e.target instanceof Element && e.target.closest('input, textarea, select, [contenteditable]')) return;
  if (!G?.player || G.over || dialogueState || elevatorMenuOpen || mapTransitioning || G.player.hp <= 0 || G.player.sleepT > 0) return;   // 睡著（人面蝶的睡眠鱗粉）不能用道具
  if (typeof supplyShopOpen !== 'undefined' && supplyShopOpen) return;
  if (typeof backpackOpen !== 'undefined' && backpackOpen) return;
  e.preventDefault(); useQuickSlot(k);
});
const quickBox = document.getElementById('quickSupplies');
quickBox.addEventListener('click', e => { const b = e.target.closest('[data-qs-slot]'); if (!b || !G?.player) return; if (!quickSlots[b.dataset.qsSlot]) { if (typeof openBackpack === 'function') openBackpack(); return; } useQuickSlot(b.dataset.qsSlot); });
quickBox.addEventListener('contextmenu', e => { const b = e.target.closest('[data-qs-slot]'); if (!b) return; e.preventDefault(); clearQuickSlot(b.dataset.qsSlot); });

// ---- 拖曳：背包的道具 → 快捷格；快捷格 → 另一格（互換）；快捷格 → 背包（拿掉）；快捷格 → 地圖（放一個在地上）----
const QS_MIME = 'application/x-tudrc-quick';
const QUICK_DRAG_IMG = 40;   // 從快捷格拖出去時，跟著游標的道具圖多大（px）
let quickDrag = null;   // { id, from }：拖的是哪個道具、從哪一格拖出來（從背包拖＝null）
document.addEventListener('dragstart', e => {
  const cell = e.target.closest && e.target.closest('.bag-cell[data-bag-item]');
  const slot = !cell && e.target.closest && e.target.closest('#quickSupplies [data-qs-slot]');
  const id = cell ? cell.dataset.bagItem : slot ? quickSlots[slot.dataset.qsSlot] : null;
  if (!id || !quickAllowed(quickItem(id))) return;
  quickDrag = { id, from: slot ? slot.dataset.qsSlot : null };
  e.dataTransfer.setData(QS_MIME, id); e.dataTransfer.effectAllowed = 'move';
  const it = slot && quickItem(id);   // 從快捷格拖：拖著的只有道具圖（沒有格子底色、數字），中心對準游標（丟到地上才會落在看到的位置）
  if (it && it.image) {
    const ghost = document.createElement('div'), S = QUICK_DRAG_IMG;
    ghost.style.cssText = `position:fixed;left:-200px;top:-200px;width:${S}px;height:${S}px;background:transparent;pointer-events:none`;   // 要在畫面上（畫面外也行）瀏覽器才畫得出來
    ghost.innerHTML = `<img src="${it.image}" alt="" style="width:100%;height:100%;object-fit:contain;image-rendering:pixelated">`;
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, S / 2, S / 2);
    setTimeout(() => ghost.remove());   // 瀏覽器拍好拖曳圖就可以拿掉
  }
  quickBox.classList.add('dropping');
});
// 拖曳結束的收尾。放開時也要做：放開後快捷欄會重畫，被拖的那格已經不在畫面上，瀏覽器的 dragend 傳不到這裡
function endQuickDrag() {
  if (quickDrag && quickDrag.blocked) {   // 在地圖的障礙物上放開（瀏覽器不會送 drop 進來）：提示不能放
    sfx('error'); systemNotice('這裡有障礙物，不能放東西', true);
  }
  if (typeof releaseMoveKeys === 'function') releaseMoveKeys();   // 拖曳中瀏覽器收不到放開按鍵：全部放開，不然溫特會一直走
  quickDrag = null; quickBox.classList.remove('dropping'); quickBox.querySelectorAll('.drop-over').forEach(el => el.classList.remove('drop-over'));
}
document.addEventListener('dragend', endQuickDrag);
document.addEventListener('drop', () => setTimeout(endQuickDrag));   // 等各處的 drop 處理完再收尾
quickBox.addEventListener('dragover', e => {
  const b = e.target.closest('[data-qs-slot]'); if (!b || !quickDrag) return;
  e.preventDefault(); e.dataTransfer.dropEffect = 'move';
  quickBox.querySelectorAll('.drop-over').forEach(el => el !== b && el.classList.remove('drop-over')); b.classList.add('drop-over');
});
quickBox.addEventListener('dragleave', e => { const b = e.target.closest('[data-qs-slot]'); if (b && !b.contains(e.relatedTarget)) b.classList.remove('drop-over'); });
quickBox.addEventListener('drop', e => {
  const b = e.target.closest('[data-qs-slot]'); if (!b || !quickDrag) return;
  e.preventDefault(); setQuickSlot(b.dataset.qsSlot, quickDrag.id, quickDrag.from);
});
// 快捷格拖回背包：拿掉
document.addEventListener('dragover', e => { if (quickDrag && quickDrag.from && e.target.closest && e.target.closest('#backpack')) e.preventDefault(); });
document.addEventListener('drop', e => { if (quickDrag && quickDrag.from && e.target.closest && e.target.closest('#backpack')) { e.preventDefault(); clearQuickSlot(quickDrag.from); } });

// 快捷格拖到地圖上：放一個在那裡（js/ground-items.js 的 dropItemOnGround；同一個位置再放會疊在一起）
const gameCanvas = document.getElementById('cv');
const quickCanThrow = () => quickDrag && quickDrag.from && G?.running && !G.over && G.player && G.player.hp > 0 && !dialogueState && !mapTransitioning;
gameCanvas.addEventListener('dragover', e => {   // 只有能放的地方才接受（障礙物上游標會變成「不能放」）
  if (!quickCanThrow()) return;
  const at = npcPointerPosition(e); at.y += GROUND_ITEMS.size / 2;
  quickDrag.blocked = !groundDropSpot(at);   // 記下來：在這裡放開就提示不能放（endQuickDrag）
  if (!quickDrag.blocked) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }
});
document.addEventListener('dragover', e => { if (quickDrag && e.target !== gameCanvas) quickDrag.blocked = false; });   // 游標移到地圖以外（快捷欄、介面）：不算。不用 dragleave：在障礙物上放開時瀏覽器會先送 dragleave 才送 dragend
gameCanvas.addEventListener('drop', e => {
  if (!quickCanThrow()) return;
  e.preventDefault();
  const item = itemById(quickDrag.id), n = Math.min(1, supplyInventory.get(quickDrag.id) || 0);   // 一次只放一個
  if (!canDrop(item) || n <= 0) { sfx('error'); return; }
  const at = npcPointerPosition(e); at.y += GROUND_ITEMS.size / 2;   // 游標對準道具中間（地上的道具畫在落點上方）
  if (!dropItemOnGround(item.id, n, at)) { quickDrag.blocked = true; return; }   // 有障礙物：endQuickDrag 會提示
  sfx('place'); systemNotice(`已把 ${item.name} 放在地上`); updateHUD();
});

// ---- 背包：可以放進快捷欄的道具格可以拖；說明欄顯示拖曳提示 ----
const quickOrigRenderBackpack = renderBackpack;
renderBackpack = function () {
  quickOrigRenderBackpack();
  backpackGrid.querySelectorAll('.bag-cell[data-bag-item]').forEach(c => { if (quickAllowed(quickItem(c.dataset.bagItem))) c.draggable = true; });
};
const quickOrigRenderDetail = renderBackpackDetail;
renderBackpackDetail = function () {
  quickOrigRenderDetail();
  const it = quickItem(backpackSel); if (!quickAllowed(it)) return;
  const acts = backpackDetail.querySelector('.bag-actions'); if (!acts) return;
  const cur = quickSlotOf(it.id);
  const row = document.createElement('div'); row.className = 'bag-quick';
  row.innerHTML = '<small>可直接拖曳到下方快捷鍵</small>';
  acts.prepend(row);
  const use = acts.querySelector('.bag-use kbd'); if (use) { if (cur) use.textContent = cur.toUpperCase(); else use.remove(); }   // 「使用」按鈕上的按鍵＝它在快捷欄的那一格
};
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('[data-quick-set]'); if (!b) return;
  const it = quickItem(backpackSel); if (!it) return;
  if (quickSlots[b.dataset.quickSet] === it.id) clearQuickSlot(b.dataset.quickSet); else setQuickSlot(b.dataset.quickSet, it.id);
});
quickSupplyKey = ''; renderQuickSupplies();
