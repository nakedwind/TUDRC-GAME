/* ===== Y102隊員裝備（資料在 data/squad-gear.js）=====
   ・溫特在便利商店「隊員裝備」分頁用經費買 → 放進背包（背包多一個「隊員裝備」分頁）
   ・T-Pad「Y102隊員」→ 裝備頁：每位隊員 3 格（不分種類）；穿上＝從背包拿走一件，卸下＝放回背包（一件只能給一個人穿）
   ・穿著的裝備數值在 js/skills.js 的 applySkills() 一起套到 TYPES
   存檔：localStorage（SQUAD_GEAR_STORE）＝ { equip: { 隊員: [裝備 id 或 null ×3] } }
*/
const SQUAD_GEAR_STORE = 'tudrc_squad_gear_v1';
const SQUAD_GEAR_SLOTS = 3;
const SQUAD_GEAR_CATEGORY = { id: 'squadgear', name: '隊員裝備', icon: '🎽' };
// 數值名稱（技能、裝備的 mods 共用；編輯器的下拉選單也用這份）。pct：加的時候用百分比顯示；unit：單位
const STAT_MOD_NAMES = {
  dmg: { name: '攻擊力' }, rate: { name: '攻擊速度', unit: '/秒' }, hp: { name: '最大 HP' }, range: { name: '射程', unit: ' 格' },
  defense: { name: '防禦（減傷）', pct: true }, accuracy: { name: '命中率', pct: true }, walkSpeed: { name: '移動速度' },
  hpRegen: { name: '每秒回復 HP' }, taint: { name: '每次攻擊增加的負荷' }, splash: { name: '攻擊範圍', unit: ' 格' },
  stun: { name: '麻痺時間', unit: ' 秒' }, confuse: { name: '混亂時間', unit: ' 秒' }, taunt: { name: '嘲諷範圍', unit: ' 格' },
  sense: { name: '感知範圍', unit: ' 格' }, 'burn.duration': { name: '燃燒時間', unit: ' 秒' }, 'burn.damage': { name: '燃燒每秒傷害' },
  'aura.rate': { name: '疏導量', unit: '/秒' }, 'aura.r': { name: '疏導光環範圍', unit: ' 格' }, 'aura.heal': { name: '每次疏導回復' },
  ultDmgBonus: { name: '大招傷害', pct: true }, ultCdCut: { name: '大招冷卻減少', pct: true },
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
  for (const g of squadGearList()) ITEMS.push({ id: g.id, name: g.name, category: SQUAD_GEAR_CATEGORY.id, image: squadGearImage(g), desc: g.desc || '', effect: squadGearEffect(g), note: '在 T-Pad「Y102隊員」→ 裝備頁給隊員穿', squadGear: true });
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
function squadGearMods(type) { return squadGearOf(type).flatMap(id => (id && squadGearById(id).mods) || []); }
// 穿上：背包裡要有一件；那一格原本有穿的放回背包
function equipSquadGear(type, slot, id) {
  if (!squadGearById(id) || typeof supplyInventory === 'undefined' || !(supplyInventory.get(id) > 0)) return false;
  const list = squadGearOf(type), old = list[slot];
  const n = supplyInventory.get(id); if (n <= 1) supplyInventory.delete(id); else supplyInventory.set(id, n - 1);
  if (old) supplyInventory.set(old, (supplyInventory.get(old) || 0) + 1);
  list[slot] = id; squadGearState.equip[type] = list;
  afterSquadGearChange(type); return true;
}
function unequipSquadGear(type, slot) {
  const list = squadGearOf(type), old = list[slot]; if (!old) return false;
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
