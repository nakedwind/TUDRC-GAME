// ============================================================
//  出勤補給
//  ・在基地打開「出勤配置」，已編入的隊員下面有 3 格補給，點格子放進背包裡的零食飲料。
//  ・從基地出發到戰鬥地圖時吃掉（從背包扣），效果一直維持到回基地。
//  ・每樣東西的效果寫在 data/supplies.js 的 buff；帶到他「最愛」的東西效果 ×1.5（SORTIE_RULES）。
//  ・戰鬥裡用到的地方：攻擊（sentryDamageMul）、攻速、防禦（sentryDefense）、生命上限、負荷累積。
// ============================================================
const SORTIE_STORE = 'tudrc_sortie_v1';
const sortie = { loadout: {}, active: {} };   // loadout：隊員 → 3 格物品 id（還沒吃）；active：隊員 → 這次出勤的效果
try { Object.assign(sortie, JSON.parse(localStorage.getItem(SORTIE_STORE) || '{}')); } catch (_) {}
function saveSortie() { try { localStorage.setItem(SORTIE_STORE, JSON.stringify(sortie)); } catch (_) {} }
let sortieLastSafe = null;    // 上一張地圖是不是基地（從基地 → 戰鬥＝出勤）
let sortieJustFed = false;    // 這張地圖剛發完補給（哨兵出場時說一句）
let sortiePicking = null;     // 出勤配置裡正在選的格子：{ type, slot }

const sortieItems = () => allItems().filter(item => item.buff);
const slotsOf = type => { const s = sortie.loadout[type] || []; return Array.from({ length: SORTIE_RULES.slots }, (_, i) => s[i] || null); };
// 已經被別的格子預訂了幾個
function sortieReserved(itemId, except) {
  let n = 0;
  for (const type of getTeam()) slotsOf(type).forEach((id, i) => { if (id === itemId && !(except && except.type === type && except.slot === i)) n++; });
  return n;
}
const isLove = (type, itemId) => typeof giftReaction === 'function' && giftReaction(type, itemId) === 'love';
const knownLove = (type, itemId) => typeof giftKnown !== 'undefined' && (giftKnown[type] || {})[itemId] === 'love';   // 送過禮才知道

// 一樣東西給某人吃的效果（含最愛加成）
function itemBuff(type, item) {
  const mul = isLove(type, item.id) ? SORTIE_RULES.loveMul : 1, out = {};
  for (const [k, v] of Object.entries(item.buff || {})) out[k] = v * mul;
  return out;
}
const pct = v => Math.round(v * 100) + '%';
function buffText(buff, type) {
  const guide = type && TYPES[type] && TYPES[type].guide;
  return Object.entries(buff).filter(([, v]) => v > 0).map(([k, v]) => {
    const kind = SORTIE_BUFF_KINDS[k]; if (!kind) return '';
    if (k === 'calm' && guide) return kind.icon + ' 疏導量 +' + pct(v);
    return kind.icon + ' ' + kind.name + (kind.minus ? ' −' : ' +') + pct(v);
  }).filter(Boolean).join('　');
}
function sumBuffs(list) {
  const out = {};
  for (const b of list) for (const [k, v] of Object.entries(b)) out[k] = (out[k] || 0) + v;
  return out;
}

// ---- 戰鬥裡讀效果（沒帶補給＝0）----
function sortieBuff(t, key) { return (t && t.buff && t.buff[key]) || 0; }

// ---- 出勤：從基地進戰鬥地圖時吃掉補給；回基地清掉效果（game.js 的 newGame 呼叫，要在 spawnSentries 之前）----
function onSortieNewGame() {
  sortieJustFed = false;
  if (MAP_SAFE) {
    if (Object.keys(sortie.active).length) { sortie.active = {}; saveSortie(); }
  } else if (sortieLastSafe === true) {
    sortie.active = {};
    const missing = [];
    let fed = 0;
    for (const type of getTeam()) {
      const eaten = [];
      for (const id of slotsOf(type)) {
        if (!id) continue;
        const item = itemById(id), n = supplyInventory.get(id) || 0;
        if (!item || n <= 0) { if (item) missing.push(item.name); continue; }
        if (n <= 1) supplyInventory.delete(id); else supplyInventory.set(id, n - 1);
        eaten.push(id); fed++;
      }
      if (eaten.length) sortie.active[type] = { items: eaten, buff: sumBuffs(eaten.map(id => itemBuff(type, itemById(id)))) };
    }
    sortie.loadout = {};   // 吃掉了，格子清空（下次出勤再重新帶）
    saveSortie();
    if (fed) { sortieJustFed = true; systemNotice('🎒 已發放出勤補給 ' + fed + ' 份'); }
    if (missing.length) systemNotice('背包裡的' + [...new Set(missing)].join('、') + '不夠，沒帶上', true);
  }
  sortieLastSafe = MAP_SAFE;
}
// 哨兵出場時套上效果（sentry.js 的 spawnSentries 呼叫）
function applySortieBuff(t) {
  const a = sortie.active[t.type]; if (!a) return;
  t.buff = { ...a.buff };
  if (t.buff.hp) { t.maxhp = Math.round(t.maxhp * (1 + t.buff.hp)); t.hp = t.maxhp; }
  if (sortieJustFed) {
    const love = a.items.find(id => isLove(t.type, id));
    if (love && typeof giftKnown !== 'undefined') (giftKnown[t.type] = giftKnown[t.type] || {})[love] = 'love';   // 他說出來了，之後送禮選單也會顯示 💖
    setTimeout(() => sentryStatus(t, love ? '有帶' + itemById(love).name + '！💖' : '補給收到了！', love ? '#ff9fc8' : '#8fd3ff'), 600 + Math.random() * 900);
  }
}

// ---- 出勤配置面板裡的補給格（team.js 的 renderTeamPanel 呼叫）----
function sortieSlotsHtml(type) {
  const slots = slotsOf(type);
  const cells = slots.map((id, i) => {
    const item = id && itemById(id), on = sortiePicking && sortiePicking.type === type && sortiePicking.slot === i;
    return '<button type="button" class="sortie-slot' + (item ? ' filled' : '') + (on ? ' picking' : '') + '" data-sortie-type="' + type + '" data-sortie-slot="' + i + '" aria-label="' + (item ? item.name + '（點選更換）' : '補給格 ' + (i + 1)) + '">' +
      (item ? '<img src="' + item.image + '" alt="">' + (knownLove(type, id) ? '<i>💖</i>' : '') : '＋') + '</button>';
  }).join('');
  const total = sumBuffs(slots.filter(Boolean).map(id => itemById(id)).filter(Boolean).map(item => itemBuff(type, item)));
  const text = buffText(total, type);
  return '<div class="sortie-slots"><span class="sortie-label">補給</span>' + cells + '<span class="sortie-sum">' + (text || '點格子帶零食飲料') + '</span></div>' +
    (sortiePicking && sortiePicking.type === type ? sortiePickerHtml(type, sortiePicking.slot) : '');
}
function sortiePickerHtml(type, slot) {
  const current = slotsOf(type)[slot];
  const list = sortieItems().map(item => ({ item, left: (supplyInventory.get(item.id) || 0) - sortieReserved(item.id, { type, slot }) })).filter(x => x.left > 0);
  const cells = list.map(({ item, left }) =>
    '<button type="button" class="sortie-option' + (item.id === current ? ' sel' : '') + '" data-sortie-item="' + item.id + '">' +
      '<img src="' + item.image + '" alt=""><b>' + item.name + (knownLove(type, item.id) ? ' 💖' : '') + '</b><small>' + buffText(itemBuff(type, item), type) + '</small><em>×' + left + '</em></button>').join('');
  return '<div class="sortie-picker" role="listbox" aria-label="選擇補給">' +
    (cells || '<p class="sortie-empty">背包裡沒有零食飲料，可以去便利商店買。</p>') +
    '<div class="sortie-picker-foot">' + (current ? '<button type="button" class="sortie-clear">拿掉</button>' : '') + '<button type="button" class="sortie-cancel">取消</button></div></div>';
}
function setSortieSlot(type, slot, itemId) {
  const s = slotsOf(type); s[slot] = itemId;
  if (s.some(Boolean)) sortie.loadout[type] = s; else delete sortie.loadout[type];
  saveSortie();
}
// 隊員被移出隊伍：他的補給格也清掉
function dropSortieLoadout(type) { if (sortie.loadout[type]) { delete sortie.loadout[type]; saveSortie(); } if (sortiePicking && sortiePicking.type === type) sortiePicking = null; }
// 點補給格／選項（綁在出勤配置面板上，事件委派）
function handleSortieClick(e) {
  const slotBtn = e.target.closest('.sortie-slot');
  if (slotBtn) {
    const type = slotBtn.dataset.sortieType, slot = Number(slotBtn.dataset.sortieSlot);
    sortiePicking = sortiePicking && sortiePicking.type === type && sortiePicking.slot === slot ? null : { type, slot };
    sfx('menu'); renderTeamPanel();
    const picker = document.querySelector('.sortie-picker'), list = picker && picker.closest('.team-list');   // 選單在下面看不到時，只捲隊員清單
    if (list) { const over = picker.getBoundingClientRect().bottom - list.getBoundingClientRect().bottom; if (over > 0) list.scrollTop += over + 6; }
    return true;
  }
  if (!sortiePicking) return false;
  const opt = e.target.closest('.sortie-option');
  if (opt) { setSortieSlot(sortiePicking.type, sortiePicking.slot, opt.dataset.sortieItem); sortiePicking = null; sfx('button'); renderTeamPanel(); return true; }
  if (e.target.closest('.sortie-clear')) { setSortieSlot(sortiePicking.type, sortiePicking.slot, null); sortiePicking = null; sfx('switch'); renderTeamPanel(); return true; }
  if (e.target.closest('.sortie-cancel')) { sortiePicking = null; sfx('switch'); renderTeamPanel(); return true; }
  return !!e.target.closest('.sortie-picker');
}
// 隊員資料（戰鬥中）顯示這次吃了什麼
function sortieActiveHtml(type) {
  const a = sortie.active[type]; if (!a || MAP_SAFE) return '';
  return '<div class="sortie-active">' + a.items.map(id => { const item = itemById(id); return item ? '<img src="' + item.image + '" alt="' + item.name + '" title="' + item.name + '">' : ''; }).join('') +
    '<span>' + buffText(a.buff, type) + '</span></div>';
}
