/* ===== Y102隊員裝備（資料在 data/squad-gear.js）=====
   ・溫特在便利商店「隊員裝備」分頁用經費買 → 放進背包（背包多一個「隊員裝備」分頁）
   ・T-Pad「Y102隊員」→ 裝備頁：每位隊員 3 格（不分種類）；穿上＝從背包拿走一件，卸下＝放回背包（一件只能給一個人穿）
   ・同一種裝備，一位隊員只能穿一格（買了兩件也不能疊在同一人身上）
   ・穿著的裝備數值在 js/skills.js 的 applySkills() 一起套到 TYPES
   存檔：localStorage（SQUAD_GEAR_STORE）＝ { equip: { 隊員: [裝備 id 或 null ×3] } }
*/
const SQUAD_GEAR_STORE = 'tudrc_squad_gear_v1';
const SQUAD_GEAR_SLOTS = 3;
const SQUAD_GEAR_CATEGORY = { id: 'squadgear', name: '隊員物資', icon: '🎽' };
// 數值名稱（技能、裝備的 mods 共用；編輯器的下拉選單也用這份）。pct：加的時候用百分比顯示；unit：單位
const STAT_MOD_NAMES = {
  dmg: { name: '攻擊力' }, rate: { name: '攻擊速度', unit: '/秒' }, hp: { name: '最大 HP' }, range: { name: '射程', unit: ' 格' },
  defense: { name: '防禦（減傷）', pct: true }, accuracy: { name: '命中率', pct: true }, walkSpeed: { name: '移動速度' },
  hpRegen: { name: '每秒回復 HP' }, taint: { name: '每次攻擊增加的負荷' }, splash: { name: '攻擊範圍', unit: ' 格' },
  stun: { name: '麻痺時間', unit: ' 秒' }, confuse: { name: '混亂時間', unit: ' 秒' }, taunt: { name: '嘲諷範圍', unit: ' 格' },
  sense: { name: '感知範圍', unit: ' 格' }, 'burn.duration': { name: '燃燒時間', unit: ' 秒' }, 'burn.damage': { name: '燃燒每秒傷害' },
  'aura.rate': { name: '疏導量', unit: '/秒' }, 'aura.r': { name: '疏導光環範圍', unit: ' 格' }, 'aura.heal': { name: '每次疏導回復' },
  ultDmgBonus: { name: '大招傷害', pct: true }, ultCdCut: { name: '大招冷卻減少', pct: true },
  spMax: { name: '嚮導 SP 上限' }, spCostCut: { name: '疏導少花的 SP', pct: true },   // 嚮導專用（js/guide-sp.js）
};
// mods → 顯示用的文字（例：攻擊力 +10%、射程 +0.5 格）
function modsText(mods) {
  return (mods || []).filter(m => m && m.path).map(m => {
    const info = STAT_MOD_NAMES[m.path] || { name: m.path };
    if (m.mul != null) { const p = Math.round((Number(m.mul) - 1) * 100); return info.name + ' ' + (p >= 0 ? '+' : '') + p + '%'; }
    const v = Number(m.add) || 0;
    if (info.pct) { const p = Math.round(v * 100); return info.name + ' ' + (p >= 0 ? '+' : '') + p + '%'; }
    return info.name + ' ' + (v >= 0 ? '+' : '') + (Math.round(v * 100) / 100) + (info.unit || '');
  }).join('、');
}
// 嚮導會自己發動的技能（技能內容的 active，js/guide-skills.js 執行）→ 顯示用的文字
//   effect：技能效果那一行（例：全隊 HP +15）　note：補充說明（什麼時候發動、詠唱、SP、冷卻）
//   技能編輯器的「技能效果」「補充說明」空白時，就顯示這裡產生的字（改數字，文字跟著變）
const GUIDE_BUFF_LABEL = { atk: '攻擊力', def: '防禦率', spd: '攻擊速度' };
function guideActiveTexts(a) {
  if (!a) return { effect: '', note: '' };
  const who = a.one ? (a.soothe ? '負荷最高的隊員' : 'HP 最低的隊員') : '全隊', fx = [];
  if (a.heal) fx.push(who + ' HP +' + a.heal);
  if (a.soothe) fx.push((a.heal ? '' : who) + '負荷 −' + a.soothe);
  if (a.wake) fx.push('暴走的隊員立刻清醒');
  const buffs = Object.entries(a.buff || {}).filter(([, v]) => v > 0);
  if (buffs.length) fx.push(who + buffs.map(([k, v]) => (GUIDE_BUFF_LABEL[k] || k) + ' +' + Math.round(v * 100) + '%').join('、') + (a.time ? '，持續 ' + a.time + ' 秒' : ''));
  const when = a.when === 'hpBelow' ? '有隊友 HP 低於 ' + Math.round((a.at || 0) * 100) + '% 時自動發動'
    : a.when === 'taintAbove' ? '有隊友負荷 ' + (a.at || 0) + ' 以上' + (a.orBerserk ? '或暴走' : '') + '時自動發動'
    : a.when === 'combat' ? '戰鬥中每 ' + (a.cd || 0) + ' 秒自動發動一次' : '自動發動';
  const parts = [when, a.cast > 0 ? '詠唱 ' + a.cast + ' 秒' : '不用詠唱', a.sp > 0 ? '花 ' + a.sp + ' SP' : '不花 SP'];
  if (a.when !== 'combat' && a.cd) parts.push('冷卻 ' + a.cd + ' 秒');
  return { effect: fx.join('，'), note: parts.join('；') + '。' };
}
// 沒有圖片的裝備：用 emoji 畫成小圖（商店、背包都要 <img>）
function squadGearImage(g) {
  if (g && g.image) return g.image;
  const icon = (g && g.icon) || '🎽';
  return 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><text x="32" y="44" font-size="40" text-anchor="middle">' + icon + '</text></svg>');
}
const squadGearList = () => (typeof SQUAD_GEAR !== 'undefined' && Array.isArray(SQUAD_GEAR) ? SQUAD_GEAR : []);
const squadGearById = id => squadGearList().find(g => g.id === id) || null;
const squadGearEffect = g => (g && (g.effect || modsText(g.mods))) || '';

// ---- 放進物品清單：背包、存檔都認得這些 id ----
function syncSquadGearItems() {
  if (typeof ITEMS === 'undefined') return;
  if (typeof ITEM_CATEGORIES !== 'undefined' && !ITEM_CATEGORIES.some(c => c.id === SQUAD_GEAR_CATEGORY.id)) ITEM_CATEGORIES.push({ ...SQUAD_GEAR_CATEGORY });
  for (let i = ITEMS.length - 1; i >= 0; i--) if (ITEMS[i].squadGear) ITEMS.splice(i, 1);
  for (const g of squadGearList()) ITEMS.push({ id: g.id, name: g.name, category: SQUAD_GEAR_CATEGORY.id, image: squadGearImage(g), desc: g.desc || '', effect: squadGearEffect(g), note: '在 T-Pad「Y102隊員」→ 裝備頁，或裝備箱的防具視窗給隊員穿', squadGear: true });
}
syncSquadGearItems();
// 便利商店賣的（js/shop.js 的 shopItems 會加進來）
function squadGearShopItems() {
  return squadGearList().filter(g => g.price > 0).map(g => ({ id: g.id, name: g.name, image: squadGearImage(g), price: g.price, kind: SQUAD_GEAR_CATEGORY.id, effect: squadGearEffect(g), squadGear: true }));
}

// ---- 誰穿了什麼 ----
let squadGearState = { equip: {} };
try { const s = JSON.parse(localStorage.getItem(SQUAD_GEAR_STORE) || 'null'); if (s && s.equip) squadGearState = s; } catch (_) {}
const saveSquadGear = () => { try { localStorage.setItem(SQUAD_GEAR_STORE, JSON.stringify(squadGearState)); } catch (_) {} };
function squadGearOf(type) {
  const list = squadGearState.equip[type] || [];
  return Array.from({ length: SQUAD_GEAR_SLOTS }, (_, i) => (list[i] && squadGearById(list[i]) ? list[i] : null));
}
function squadGearMods(type) { return [...new Set(squadGearOf(type).filter(Boolean))].flatMap(id => squadGearById(id).mods || []); }   // 同一種只算一次（舊存檔可能疊過）
// 這位隊員的另一格已經穿著同一種裝備嗎？回傳那一格（0 起算），沒有＝-1
const squadGearWornAt = (type, id, slot) => squadGearOf(type).findIndex((g, i) => g === id && i !== slot);
// 穿上：背包裡要有一件；那一格原本有穿的放回背包
function equipSquadGear(type, slot, id) {
  if (!bagCanManageEquipment()) { systemNotice('請到營地帳篷調整隊員物資', true); return false; }
  if (!squadGearById(id) || typeof supplyInventory === 'undefined' || !(supplyInventory.get(id) > 0)) return false;
  if (squadGearWornAt(type, id, slot) >= 0) { systemNotice('同一件裝備只能穿一格', true); return false; }
  const list = squadGearOf(type), old = list[slot];
  if (!bagCanApply([[id, -1], ...(old ? [[old, 1]] : [])])) { systemNotice('背包空間不足，無法換下原本的裝備', true); return false; }
  const n = supplyInventory.get(id); if (n <= 1) supplyInventory.delete(id); else supplyInventory.set(id, n - 1);
  if (old) supplyInventory.set(old, (supplyInventory.get(old) || 0) + 1);
  list[slot] = id; squadGearState.equip[type] = list;
  afterSquadGearChange(type); return true;
}
function unequipSquadGear(type, slot) {
  if (!bagCanManageEquipment()) { systemNotice('請到營地帳篷調整隊員物資', true); return false; }
  const list = squadGearOf(type), old = list[slot]; if (!old) return false;
  if (carryRoom(old) < 1) { systemNotice('背包空間不足，無法卸下裝備', true); return false; }
  if (typeof supplyInventory !== 'undefined') supplyInventory.set(old, (supplyInventory.get(old) || 0) + 1);
  list[slot] = null; squadGearState.equip[type] = list;
  afterSquadGearChange(type); return true;
}
function afterSquadGearChange(type) {
  saveSquadGear();
  if (typeof applySkills === 'function') applySkills();
  if (typeof refreshLiveSentries === 'function') refreshLiveSentries(type);
  if (typeof saveGame === 'function') saveGame();   // 背包數量也存起來
}
if (typeof applySkills === 'function') applySkills();
