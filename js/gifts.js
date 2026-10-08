// ============================================================
//  送禮與好感度
//  ・在基地裡和角色對話時，按「🎁 送禮」（或 G）打開禮物選單，選背包裡的零食飲料送出。
//  ・每個人每次回到基地只能收一次禮物（出勤一次之後才能再送）。
//  ・喜好、台詞、點數、等級都在 data/gifts.js。好感度會存檔（js/save.js）。
// ============================================================
const favorPoints = {};        // 角色 id → 好感點數
const giftKnown = {};          // 角色 id → { 物品 id: 反應 }（送過才知道對方喜不喜歡）
const giftedThisVisit = new Set();   // 這次回基地已經收過禮的人
const giftPicker = document.getElementById('giftPicker');
let giftPickerOpen = false, giftTarget = null;

const giftableId = actor => actor && (actor.kind === 'tower' ? actor.type : actor.id);
const canReceiveGifts = id => !!GIFT_PREFS[id];
function favorLevel(points) {
  let lv = 0;
  FAVOR_LEVELS.forEach((level, i) => { if (points >= level.need) lv = i; });
  return lv;
}
function favorInfo(id) {
  const points = favorPoints[id] || 0, lv = favorLevel(points), next = FAVOR_LEVELS[lv + 1];
  return { points, lv, name: FAVOR_LEVELS[lv].name, next, pct: next ? (points - FAVOR_LEVELS[lv].need) / (next.need - FAVOR_LEVELS[lv].need) : 1 };
}
function giftReaction(id, itemId) {
  const prefs = GIFT_PREFS[id] || {};
  if ((prefs.love || []).includes(itemId)) return 'love';
  if ((prefs.like || []).includes(itemId)) return 'like';
  if ((prefs.dislike || []).includes(itemId)) return 'dislike';
  return 'normal';
}
// 能送的東西：背包裡的零食飲料（之後 data/items.js 的物品加上 giftable: true 也能送）
const giftableItems = () => allItems().filter(item => (item.kind || item.giftable) && (supplyInventory.get(item.id) || 0) > 0);

// ---- 對話框上方的好感度、送禮按鈕 ----
function renderDialogueFavor() {
  const box = document.getElementById('dialogueFavor'), btn = document.getElementById('dialogueGift');
  const actor = dialogueState && dialogueState.actor, id = giftableId(actor);
  if (!actor || !canReceiveGifts(id)) { box.classList.add('hidden'); btn.classList.add('hidden'); return; }
  const f = favorInfo(id);
  box.classList.remove('hidden');
  box.innerHTML = `<b>♥ ${f.name}</b><i><u style="width:${Math.round(f.pct * 100)}%"></u></i>`;
  box.title = f.next ? `好感度 ${f.points}／${f.next.need}` : `好感度 ${f.points}（最高等級）`;
  btn.classList.toggle('hidden', !MAP_SAFE || dialogueState.giftReply);   // 送禮只在基地；送完這句就先藏起來
  const done = giftedThisVisit.has(id);
  btn.disabled = done;
  btn.innerHTML = done ? '已送過禮' : '🎁 送禮 <span>G</span>';
}
function onDialogueOpened() { renderDialogueFavor(); }
function onDialogueClosed() { closeGiftPicker(true); }

// ---- 禮物選單 ----
function openGiftPicker() {
  const actor = dialogueState && dialogueState.actor, id = giftableId(actor);
  if (!actor || !MAP_SAFE || !canReceiveGifts(id) || giftPickerOpen) return;
  if (giftedThisVisit.has(id)) { sfx('error'); return; }
  finishDialogueTyping();
  giftTarget = actor; giftPickerOpen = true;
  renderGiftPicker(); giftPicker.classList.remove('hidden'); sfx('menu');
  (giftPicker.querySelector('.gift-cell') || document.getElementById('giftPickerClose')).focus();
}
function closeGiftPicker(silent = false) {
  if (!giftPickerOpen) return;
  giftPickerOpen = false; giftTarget = null; giftPicker.classList.add('hidden');
  if (!silent) { sfx('switch'); document.getElementById('dialogueGift')?.focus(); }
}
function renderGiftPicker() {
  const id = giftableId(giftTarget), profile = dialogueProfile(giftTarget) || { name: '？？？' };
  document.getElementById('giftPickerTitle').textContent = `送給 ${profile.name}`;
  const items = giftableItems(), known = giftKnown[id] || {};
  document.getElementById('giftPickerList').innerHTML = items.length ? items.map(item => {
    const r = known[item.id], tag = r ? GIFT_REACTION[r] : null;
    return `<button type="button" class="gift-cell${r ? ' ' + r : ''}" data-gift="${item.id}" title="${item.name}${tag ? '｜' + tag.label : '｜還不知道喜不喜歡'}">
      <img src="${item.image}" alt=""><b>${supplyInventory.get(item.id)}</b><em>${tag ? tag.icon : '❔'}</em><span>${item.name}</span></button>`;
  }).join('') : `<div class="gift-empty">背包裡沒有能送的東西<button type="button" id="giftGoShop">🏪 去商店</button></div>`;
}
function giveGift(itemId) {
  const actor = giftTarget, id = giftableId(actor), item = itemById(itemId), count = supplyInventory.get(itemId) || 0;
  if (!actor || !item || count <= 0 || giftedThisVisit.has(id)) { sfx('error'); return; }
  // 東西從背包拿走
  if (count <= 1) supplyInventory.delete(itemId); else supplyInventory.set(itemId, count - 1);
  // 反應與好感
  const reaction = giftReaction(id, itemId), before = favorInfo(id);
  favorPoints[id] = Math.max(0, (favorPoints[id] || 0) + GIFT_POINTS[reaction]);
  (giftKnown[id] = giftKnown[id] || {})[itemId] = reaction;
  giftedThisVisit.add(id);
  const after = favorInfo(id), profile = dialogueProfile(actor) || { name: '' };
  closeGiftPicker(true);
  // 對話框換成收到禮物的反應
  const pool = (GIFT_PREFS[id].lines || {})[reaction] || ['謝謝。'];
  const lines = [pool[Math.floor(Math.random() * pool.length)].replaceAll('{item}', item.name)];
  if (after.lv > before.lv) lines.push({ speaker: '系統', text: `和${profile.name}的好感度提升到「${after.name}」了！` });
  dialogueState.lines = lines; dialogueState.index = 0; dialogueState.giftReply = true;
  renderDialogueLine(); renderDialogueFavor();
  // 頭上冒出反應
  const tag = GIFT_REACTION[reaction], pts = GIFT_POINTS[reaction];
  flash(`${tag.icon} ${pts >= 0 ? '+' : ''}${pts}`, actor.x, actor.y - 46, reaction === 'dislike' ? '#c9d3dc' : '#ff9ccf', 1.6);
  sfx(reaction === 'dislike' ? 'error' : 'soothe');
  if (after.lv > before.lv) { SFX.play('favorUp', .8, 'favor-up'); systemNotice(`💗 ${profile.name}：好感度「${after.name}」`); }
  const box = document.getElementById('dialogueFavor'); box.classList.remove('pulse'); void box.offsetWidth; box.classList.add('pulse');
  updateHUD(); if (typeof backpackOpen !== 'undefined' && backpackOpen) renderBackpack();
  document.getElementById('dialogueNext').focus();
}
// 每次出勤（載入戰鬥地圖）後，大家都可以再收禮
function onGiftNewGame() { if (!MAP_SAFE) giftedThisVisit.clear(); }

document.getElementById('dialogueGift').addEventListener('click', openGiftPicker);
document.getElementById('giftPickerClose').addEventListener('click', () => closeGiftPicker());
giftPicker.addEventListener('click', e => {
  const cell = e.target.closest('[data-gift]'); if (cell) { giveGift(cell.dataset.gift); return; }
  if (e.target.closest('#giftGoShop')) { closeGiftPicker(true); closeDialogue(true); openSupplyShop(); }
});
document.getElementById('dialogueFavor').addEventListener('animationend', e => e.currentTarget.classList.remove('pulse'));
// 鍵盤：對話中按 G 送禮；禮物選單打開時，方向鍵選、Enter 送出、Esc 關閉（不會關掉對話框）
window.addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if (giftPickerOpen) {
    e.stopImmediatePropagation();   // 不要讓對話框把這個按鍵當成「下一句」
    if (k === 'escape') { e.preventDefault(); closeGiftPicker(); return; }
    const cells = [...giftPicker.querySelectorAll('.gift-cell, #giftGoShop, #giftPickerClose')];
    const i = cells.indexOf(document.activeElement);
    const step = { arrowleft: -1, arrowright: 1 }[k];   // 一排橫向：左右鍵選
    if (step) { e.preventDefault(); cells[Math.max(0, Math.min(cells.length - 1, (i < 0 ? 0 : i) + step))]?.focus(); }
    else if ((k === 'enter' || k === ' ') && document.activeElement?.closest('#giftPicker')) { e.preventDefault(); document.activeElement.click(); }
    return;
  }
  if (k === 'g' && !e.repeat && dialogueState && !document.getElementById('dialogueGift').classList.contains('hidden')) { e.preventDefault(); e.stopImmediatePropagation(); openGiftPicker(); }
});
