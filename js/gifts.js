// ============================================================
//  送禮與好感度
//  ・在基地裡和角色對話時，按「🎁 送禮」（或 G）打開禮物選單，選背包裡的零食飲料送出。
//  ・每個人每次回到基地最多收 GIFTS_PER_VISIT（data/gifts.js）次禮物（出勤一次之後才能再送）。
//  ・今日想吃委託：回到基地時有幾個人想吃某樣東西（頭上冒圖示），照著送好感度加倍，還會給回憶碎片或異質碎片。
//  ・回憶碎片集滿 3 個會自動拼成鑰匙（data/items.js 的 MEMORY_KEYS）。
//  ・喜好、點數、等級在 data/gifts.js；收禮、委託時說的話在「對話編輯器」的「送禮與委託」（data/dialogues.js），沒寫就不說。好感度會存檔（js/save.js）。
//  ・服裝（扭蛋轉到的配件、skin）也能送：送出後對方馬上穿上（js/costumes.js 的 costumeGive；規則在 data/costumes.js 的 COSTUME_GIFT）。
// ============================================================
const favorPoints = {};        // 角色 id → 好感點數
const giftKnown = {};          // 角色 id → { 物品 id: 反應 }（送過才知道對方喜不喜歡）
const giftedThisVisit = new Map();   // 這次回基地收過幾次禮：角色 id → 次數
const giftsGiven = id => giftedThisVisit.get(id) || 0;
const giftLimitReached = id => giftsGiven(id) >= GIFTS_PER_VISIT;
const giftPicker = document.getElementById('giftPicker');
let giftPickerOpen = false, giftTarget = null;
const giftRequests = {};       // 今日想吃：角色 id → 想吃的物品 id
let requestsStale = true;      // 出勤過後回到基地要重新抽委託

const giftableId = actor => actor && (actor.kind === 'tower' ? actor.type : actor.id);
// 收禮、委託的台詞（對話編輯器「送禮與委託」）：隨機一句，{item} 換成東西的名稱；沒寫就回傳 null（不說話）
const GIFT_LINE_KEY = { love: 'giftLove', like: 'giftLike', normal: 'giftNormal', dislike: 'giftDislike' };
function giftLine(id, key, itemName) { const line = pickDialogueLine(id, key); return line ? line.replaceAll('{item}', itemName || '') : null; }
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
const giftableItems = () => allItems().filter(item => (item.kind === 'snack' || item.kind === 'drink' || item.giftable) && (supplyInventory.get(item.id) || 0) > 0);

// ---- 對話框上方的好感度、送禮按鈕 ----
function renderDialogueFavor() {
  const box = document.getElementById('dialogueFavor'), btn = document.getElementById('dialogueGift');
  const actor = dialogueState && dialogueState.actor, id = giftableId(actor);
  if (!actor || !canReceiveGifts(id)) { box.classList.add('hidden'); btn.classList.add('hidden'); return; }
  const f = favorInfo(id);
  box.classList.remove('hidden');
  box.innerHTML = `<b>♥ ${f.name}</b><i><u style="width:${Math.round(f.pct * 100)}%"></u></i>`;
  box.title = f.next ? `好感度 ${f.points}／${f.next.need}` : `好感度 ${f.points}（最高等級）`;
  btn.classList.toggle('hidden', !MAP_SAFE || !!dialogueState.giftReply);   // 送禮只在基地；送完這句就先藏起來
  // ↑ 一定要是 true／false：還沒送過禮時 giftReply 是 undefined，toggle 收到 undefined 會變成「切換」，按鈕就會一次有、一次沒有
  const done = giftLimitReached(id);
  btn.disabled = done;
  btn.innerHTML = done ? '這次已送完' : '🎁 送禮 <span>G</span>';
}
function onDialogueOpened(actor) {
  const id = giftableId(actor), want = MAP_SAFE && giftRequests[id] && !giftLimitReached(id) ? itemById(giftRequests[id]) : null;
  const ask = want && dialogueState ? giftLine(id, 'requestAsk', want.name) : null;   // 有委託：先說想吃什麼（沒寫就不說，想吃的東西在禮物選單裡會標「想吃！」）
  if (ask) {
    dialogueState.lines = [ask, ...dialogueState.lines];
    dialogueState.index = 0; renderDialogueLine();
  }
  renderDialogueFavor();
}
function onDialogueClosed() { closeGiftPicker(true); }

// ---- 禮物選單 ----
function openGiftPicker() {
  const actor = dialogueState && dialogueState.actor, id = giftableId(actor);
  if (!actor || !MAP_SAFE || !canReceiveGifts(id) || giftPickerOpen) return;
  if (giftLimitReached(id)) { sfx('error'); return; }
  finishDialogueTyping();
  giftTarget = actor; giftPickerOpen = true;
  // 一打開先看哪一類：有委託就看想吃的那一類，不然看第一個有東西的
  const want = giftRequests[id] && itemById(giftRequests[id]);
  giftTab = want ? giftTabOf(want) : (GIFT_TABS.find(t => giftTabCells(id, t.id).length) || GIFT_TABS[0]).id;
  renderGiftPicker(); giftPicker.classList.remove('hidden'); sfx('menu');
  (giftPicker.querySelector('.gift-cell') || document.getElementById('giftPickerClose')).focus();
}
// ---- 分類：零食、飲料、服飾 ----
const GIFT_TABS = [{ id: 'snack', name: '零食' }, { id: 'drink', name: '飲料' }, { id: 'costume', name: '服飾' }];
let giftTab = 'snack';
const giftTabOf = item => item.kind === 'drink' ? 'drink' : 'snack';   // 飲料以外能送的東西（giftable）都放零食
function giftTabCells(id, tab) {
  if (tab === 'costume') return typeof costumeGiftable === 'function' ? costumeGiftable(id) : [];
  return giftableItems().filter(item => giftTabOf(item) === tab);
}
function switchGiftTab(tab) {
  if (tab === giftTab) return;
  giftTab = tab; sfx('button'); renderGiftPicker();
  (giftPicker.querySelector('.gift-cell') || giftPicker.querySelector('.gift-tab.on')).focus();
}
function closeGiftPicker(silent = false) {
  if (!giftPickerOpen) return;
  giftPickerOpen = false; giftTarget = null; giftPicker.classList.add('hidden');
  if (!silent) { sfx('switch'); document.getElementById('dialogueGift')?.focus(); }
}
function renderGiftPicker() {
  const id = giftableId(giftTarget), profile = dialogueProfile(giftTarget) || { name: '？？？' };
  document.getElementById('giftPickerTitle').textContent = `送給 ${profile.name}`;
  document.getElementById('giftPickerLeft').textContent = `這次回基地還能送 ${GIFTS_PER_VISIT - giftsGiven(id)} 次`;
  const want = giftRequests[id], known = giftKnown[id] || {}, wantItem = want && itemById(want);
  document.getElementById('giftTabs').innerHTML = GIFT_TABS.map(t => {
    const n = giftTabCells(id, t.id).length, wants = wantItem && giftTabOf(wantItem) === t.id;
    return `<button type="button" class="gift-tab${t.id === giftTab ? ' on' : ''}" data-tab="${t.id}" aria-pressed="${t.id === giftTab}">${t.name}${n ? `<small>${n}</small>` : ''}${wants ? '<i title="想吃的東西在這裡">♥</i>' : ''}</button>`;
  }).join('');
  const list = document.getElementById('giftPickerList');
  if (giftTab === 'costume') {   // 服飾：扭蛋轉到的配件、skin
    const costumes = giftTabCells(id, 'costume');
    list.innerHTML = costumes.length ? costumes.map(item => {
      const r = known[item.id], tag = r ? GIFT_REACTION[r] : null;
      return `<button type="button" class="gift-cell costume r-${item.rarity || 'N'}${r ? ' ' + r : ''}" data-costume="${item.id}" title="${item.name}（服裝，送出後${profile.name}會馬上穿上）${tag ? '｜' + tag.label : ''}">
        <img src="${costumeIconSrc(item)}" alt=""><b>${costumeState.owned[item.id]}</b><em>${tag ? tag.icon : '👗'}</em><span>${item.name}</span></button>`;
    }).join('') : `<div class="gift-empty">還沒有能送的服飾<small>到扭蛋機轉轉看</small></div>`;
    return;
  }
  const items = giftTabCells(id, giftTab).sort((a, b) => (b.id === want) - (a.id === want));   // 想吃的東西排第一
  const tabName = GIFT_TABS.find(t => t.id === giftTab).name;
  list.innerHTML = items.length ? items.map(item => {
    const r = known[item.id], tag = r ? GIFT_REACTION[r] : null;
    const wanted = item.id === want;
    return `<button type="button" class="gift-cell${r ? ' ' + r : ''}${wanted ? ' wanted' : ''}" data-gift="${item.id}" title="${item.name}${wanted ? '｜想吃這個！' : tag ? '｜' + tag.label : '｜還不知道喜不喜歡'}">
      ${wanted ? '<i class="gift-want">想吃！</i>' : ''}<img src="${item.image}" alt=""><b>${supplyInventory.get(item.id)}</b><em>${tag ? tag.icon : '❔'}</em><span>${item.name}</span></button>`;
  }).join('') : `<div class="gift-empty">背包裡沒有${tabName}<small>到 1 樓 HOME Mart 或販賣機買</small></div>`;
  if (wantItem && giftTabOf(wantItem) === giftTab && !items.some(item => item.id === want)) {   // 想吃的東西背包裡沒有：提示去買
    list.querySelector('.gift-empty')?.remove();
    list.insertAdjacentHTML('afterbegin', `<div class="gift-want-missing"><img src="${wantItem.image}" alt=""><span>想吃：${wantItem.name}<small>背包裡沒有，可以去商店買</small></span></div>`);
  }
}
function giveGift(itemId) {
  const actor = giftTarget, id = giftableId(actor), item = itemById(itemId), count = supplyInventory.get(itemId) || 0;
  if (!actor || !item || count <= 0 || giftLimitReached(id)) { sfx('error'); return; }
  // 東西從背包拿走
  if (count <= 1) supplyInventory.delete(itemId); else supplyInventory.set(itemId, count - 1);
  // 反應與好感
  const reaction = giftReaction(id, itemId), before = favorInfo(id);
  const wanted = giftRequests[id] === itemId;   // 送的正是今日想吃的東西
  const gain = GIFT_POINTS[reaction] * (wanted ? REQUEST_RULES.favorMul : 1);
  favorPoints[id] = Math.max(0, (favorPoints[id] || 0) + gain);
  (giftKnown[id] = giftKnown[id] || {})[itemId] = reaction;
  giftedThisVisit.set(id, giftsGiven(id) + 1);
  if (typeof addStat === 'function') { addStat('gifts'); addStat('giftsTo:' + id); }   // 成就：送禮次數（全部、送給這個人）
  const after = favorInfo(id), profile = dialogueProfile(actor) || { name: '' };
  closeGiftPicker(true);
  // 對話框換成收到禮物的反應
  const said = giftLine(id, GIFT_LINE_KEY[reaction], item.name);   // 沒寫台詞：只顯示系統訊息
  const lines = [said || { speaker: '系統', text: `${profile.name}收下了「${item.name}」。` }];
  const reward = wanted ? fulfillRequest(id) : null;   // 委託完成：回憶碎片或異質碎片
  if (reward) { if (reward.line) lines.push(reward.line); lines.push({ speaker: '系統', text: reward.text }); }
  if (after.lv > before.lv) lines.push({ speaker: '系統', text: `和${profile.name}的好感度提升到「${after.name}」了！` });
  dialogueState.lines = lines; dialogueState.index = 0; dialogueState.giftReply = true;
  renderDialogueLine(); renderDialogueFavor();
  // 頭上冒出反應
  const tag = GIFT_REACTION[reaction], pts = gain;
  flash(`${wanted ? '想吃的！' : tag.icon} ${pts >= 0 ? '+' : ''}${pts}`, actor.x, actor.y - 46, reaction === 'dislike' ? '#c9d3dc' : '#ff9ccf', 1.6);
  sfx(reaction === 'dislike' ? 'error' : 'soothe');
  if (after.lv > before.lv) { SFX.play('favorUp', .8, 'favor-up'); systemNotice(`💗 ${profile.name}：好感度「${after.name}」`); }
  const box = document.getElementById('dialogueFavor'); box.classList.remove('pulse'); void box.offsetWidth; box.classList.add('pulse');
  updateHUD(); if (typeof backpackOpen !== 'undefined' && backpackOpen) renderBackpack();
  document.getElementById('dialogueNext').focus();
}
// 送服裝：對方馬上穿上，好感照喜好＋稀有度
function giveCostumeGift(costumeId) {
  const actor = giftTarget, id = giftableId(actor), item = typeof costumeItem === 'function' && costumeItem(costumeId);
  if (!actor || !item || giftLimitReached(id) || !costumeGive(id, costumeId)) { sfx('error'); return; }
  let reaction = giftReaction(id, costumeId);
  if (reaction === 'normal') reaction = COSTUME_GIFT.reaction;   // 沒特別寫的服裝：預設「喜歡」
  const before = favorInfo(id), gain = GIFT_POINTS[reaction] + (reaction === 'dislike' ? 0 : COSTUME_GIFT.rarityBonus[item.rarity || 'N'] || 0);
  favorPoints[id] = Math.max(0, (favorPoints[id] || 0) + gain);
  (giftKnown[id] = giftKnown[id] || {})[costumeId] = reaction;
  giftedThisVisit.set(id, giftsGiven(id) + 1);
  if (typeof addStat === 'function') { addStat('gifts'); addStat('giftsTo:' + id); }   // 成就：送禮次數（全部、送給這個人）
  const after = favorInfo(id), profile = dialogueProfile(actor) || { name: '' };
  closeGiftPicker(true);
  const said = giftLine(id, reaction === 'dislike' ? 'giftDislike' : 'giftCostume', item.name);   // 「收到服裝」；不喜歡的服裝說「收到不喜歡的禮物」
  const lines = [...(said ? [said] : []), { speaker: '系統', text: `${profile.name}換上了「${item.name}」！` }];
  if (after.lv > before.lv) lines.push({ speaker: '系統', text: `和${profile.name}的好感度提升到「${after.name}」了！` });
  dialogueState.lines = lines; dialogueState.index = 0; dialogueState.giftReply = true;
  renderDialogueLine(); renderDialogueFavor();
  flash(`${GIFT_REACTION[reaction].icon} ${gain >= 0 ? '+' : ''}${gain}`, actor.x, actor.y - 46, reaction === 'dislike' ? '#c9d3dc' : '#ff9ccf', 1.6);
  sfx(reaction === 'dislike' ? 'error' : 'soothe');
  if (after.lv > before.lv) { SFX.play('favorUp', .8, 'favor-up'); systemNotice(`💗 ${profile.name}：好感度「${after.name}」`); }
  const box = document.getElementById('dialogueFavor'); box.classList.remove('pulse'); void box.offsetWidth; box.classList.add('pulse');
  document.getElementById('dialogueNext').focus();
}
// ---- 今日想吃委託 ----
const giftItemList = () => allItems().filter(item => item.kind === 'snack' || item.kind === 'drink');
function generateRequests() {
  for (const k of Object.keys(giftRequests)) delete giftRequests[k];
  const present = [...new Set([...(G.npcs || []), ...(G.towers || [])].map(giftableId))].filter(canReceiveGifts);   // 在基地裡的人
  const n = Math.min(present.length, REQUEST_RULES.min + Math.floor(Math.random() * (REQUEST_RULES.max - REQUEST_RULES.min + 1)));
  const pool = [...present].sort(() => Math.random() - .5).slice(0, n);
  for (const id of pool) {
    const prefs = GIFT_PREFS[id] || {}, all = giftItemList().map(item => item.id).filter(x => !(prefs.dislike || []).includes(x));
    const fav = [...(prefs.love || []), ...(prefs.like || [])].filter(x => all.includes(x));
    const list = fav.length && Math.random() < .7 ? fav : all;   // 大多想吃自己喜歡的（也是在偷偷告訴玩家他的口味）
    giftRequests[id] = list[Math.floor(Math.random() * list.length)];
  }
}
function fulfillRequest(id) {
  delete giftRequests[id];
  const lineFor = pickDialogueLine(id, 'requestReward');   // 對話編輯器「委託：完成時交給你東西」；沒寫就不說
  const shard = REQUEST_SHARDS[id], mk = shard && MEMORY_KEYS.find(m => m.shard === shard);
  if (mk && !(supplyInventory.get(mk.key) > 0)) {   // 給回憶碎片（鑰匙還沒拼好的話）
    supplyInventory.set(shard, (supplyInventory.get(shard) || 0) + 1);
    const it = itemById(shard), have = supplyInventory.get(shard);
    systemNotice(`獲得「${it.name}」（${Math.min(have, mk.need)}／${mk.need}）`);
    SFX.play('crystalGet', .7, 'request-shard');
    setTimeout(checkMemoryKeys, 600);
    return { line: lineFor, text: `獲得了「${it.name}」！（${Math.min(have, mk.need)}／${mk.need}）` };
  }
  earnCrystals(REQUEST_RULES.crystals);   // 其他人：給異質碎片
  if (typeof showPickupToast === 'function') showPickupToast(REQUEST_RULES.crystals);
  return { line: lineFor, text: `獲得了 ${REQUEST_RULES.crystals} 個異質碎片！` };
}
// 回憶碎片集滿就拼成鑰匙
function checkMemoryKeys() {
  for (const mk of MEMORY_KEYS) {
    const have = supplyInventory.get(mk.shard) || 0;
    if (have < mk.need || supplyInventory.get(mk.key) > 0) continue;
    if (have - mk.need <= 0) supplyInventory.delete(mk.shard); else supplyInventory.set(mk.shard, have - mk.need);
    supplyInventory.set(mk.key, 1);
    const shard = itemById(mk.shard), key = itemById(mk.key);
    systemNotice(`🔑 ${shard.name}集滿了，拼成了「${key.name}」！`);
    SFX.play('favorUp', .8, 'key-made');
    if (typeof showKeyToast === 'function') showKeyToast(key);
  }
  if (typeof backpackOpen !== 'undefined' && backpackOpen) renderBackpack();
}
// 拼成鑰匙時，畫面中間跳出大大的鑰匙
function showKeyToast(key) {
  const box = document.getElementById('pickupToasts'); if (!box) return;
  const el = document.createElement('div');
  el.className = 'pickup-toast key-toast';
  el.innerHTML = `<img src="${key.image}" alt=""><span>拼成了 <b>${key.name}</b></span><small>可以打開記憶之門</small>`;
  box.appendChild(el);
  setTimeout(() => { el.classList.add('leaving'); setTimeout(() => el.remove(), 400); }, 3200);
}
// 頭上的「想吃」泡泡（在基地裡才顯示）
const requestImgCache = {};
function drawRequestBubbles(ctx) {
  if (!MAP_SAFE || !G) return;
  const now = performance.now() / 1000;
  for (const actor of [...(G.npcs || []), ...(G.towers || [])]) {
    const id = giftableId(actor), want = giftRequests[id];
    if (!want || giftLimitReached(id)) continue;
    const item = itemById(want); if (!item) continue;
    const img = requestImgCache[item.image] || (requestImgCache[item.image] = Object.assign(new Image(), { src: item.image }));
    // 放在頭的右上方（不要擋到名字和平常的對話泡泡）
    const x = actor.x + 30, y = actor.y - 44 + Math.sin(now * 2.4 + actor.x * .01) * 2, w = 28, h = 26;
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,.95)'; ctx.strokeStyle = 'rgba(40,30,50,.85)'; ctx.lineWidth = 1.5;
    roundRect(x - w / 2, y - h, w, h, 8); ctx.fill(); ctx.stroke();
    // 往左下的小圓點（像想法泡泡，指向角色）
    for (const [ox, oy, r] of [[-12, 4, 3], [-17, 9, 2]]) { ctx.beginPath(); ctx.arc(x + ox, y + oy, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
    if (img.complete && img.naturalWidth) { ctx.imageSmoothingEnabled = false; const k = Math.min(22 / img.naturalWidth, 22 / img.naturalHeight); ctx.drawImage(img, x - img.naturalWidth * k / 2, y - h / 2 - img.naturalHeight * k / 2, img.naturalWidth * k, img.naturalHeight * k); }
    ctx.restore();
  }
}
// 每次出勤（載入戰鬥地圖）後，大家都可以再收禮；回到基地時重新抽「今日想吃」
function onGiftNewGame() {
  if (!MAP_SAFE) { giftedThisVisit.clear(); requestsStale = true; return; }
  // 等這張地圖的角色都出現之後再抽（newGame 一開始就會呼叫這裡，那時角色還沒生出來）
  if (requestsStale) setTimeout(() => { if (MAP_SAFE && G && requestsStale) { generateRequests(); requestsStale = false; } }, 0);
}

document.getElementById('dialogueGift').addEventListener('click', openGiftPicker);
document.getElementById('giftPickerClose').addEventListener('click', () => closeGiftPicker());
giftPicker.addEventListener('click', e => {
  const tab = e.target.closest('[data-tab]'); if (tab) { switchGiftTab(tab.dataset.tab); return; }
  const cell = e.target.closest('[data-gift]'); if (cell) { giveGift(cell.dataset.gift); return; }
  const outfit = e.target.closest('[data-costume]'); if (outfit) { giveCostumeGift(outfit.dataset.costume); return; }
});
document.getElementById('dialogueFavor').addEventListener('animationend', e => e.currentTarget.classList.remove('pulse'));
// 鍵盤：對話中按 G 送禮；禮物選單打開時，左右鍵選、上下鍵換分類、Enter 送出、Esc 關閉（不會關掉對話框）
window.addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if (giftPickerOpen) {
    e.stopImmediatePropagation();   // 不要讓對話框把這個按鍵當成「下一句」
    if (k === 'escape') { e.preventDefault(); closeGiftPicker(); return; }
    const cells = [...giftPicker.querySelectorAll('.gift-cell, #giftGoShop, #giftPickerClose')];
    const i = cells.indexOf(document.activeElement);
    const step = { arrowleft: -1, arrowright: 1 }[k];   // 一排橫向：左右鍵選
    const tabStep = { arrowup: -1, arrowdown: 1 }[k];   // 上下鍵：換分類
    if (tabStep) { e.preventDefault(); const t = GIFT_TABS.findIndex(x => x.id === giftTab); switchGiftTab(GIFT_TABS[(t + tabStep + GIFT_TABS.length) % GIFT_TABS.length].id); }
    else if (step) { e.preventDefault(); cells[Math.max(0, Math.min(cells.length - 1, (i < 0 ? 0 : i) + step))]?.focus(); }
    else if ((k === 'enter' || k === ' ') && document.activeElement?.closest('#giftPicker')) { e.preventDefault(); document.activeElement.click(); }
    return;
  }
  if (k === 'g' && !e.repeat && dialogueState && !document.getElementById('dialogueGift').classList.contains('hidden')) { e.preventDefault(); e.stopImmediatePropagation(); openGiftPicker(); }
});
