/* ===== 新版裝備（data/equipment.js 的 GEAR_SYSTEM＝2）=====
   溫特和 Y102 隊員共用同一份裝備清單（data/equipment.js 的 EQUIPMENT）。
   ・每一件裝備都是獨立的：買（製作）幾件就有幾件，不會疊在一起，各有各的等級，升級只升那一件。
     每一件有自己的代號「裝備id#流水號」（例如 helmet#3）；等級存在 equipState.inst（js/equipment.js）：{ 'helmet#3': 2, … }。
   ・開發：在諾亞的開發工坊「開發」＝學會做這種裝備（送 1 件 Lv1）。學會了沒有記在 equipState.owned（只看有沒有，數字不代表等級）。
   ・製作：開發工坊「製作裝備」頁按「製作一件」再做一件，新做的一律 Lv1，放進背包。
   ・升級：開發工坊「升級裝備」頁，手上的每一件各列一格（寫著在誰身上／在背包），按哪一格就只升那一件。
   ・背包：supplyInventory 裡一件一筆（物品 id＝那一件的代號，數量一定是 1；分類是「防具」，沒有格數上限）。
     一件只能給一個人穿：穿上＝從背包拿走，卸下＝放回背包。
   ・溫特：背包左邊的部隊長裝備（頭部、上身、下身 ×2、隨身物品 ×2），在裝備箱旁邊換。同一種裝備身上只能穿一件。
   ・隊員：頭部、上身、隨身物品各 1 格（鞋子這類下身裝備穿在「隨身物品」格；T-Pad「Y102隊員」→ 更換裝備，或裝備箱的防具視窗選隊員）。
     隊員身上的裝備存在 localStorage 的 tudrc_squad_gear_v2：{ equip: { 隊員: [頭部, 上身, 隨身物品] } }（裡面放的是每一件的代號）
     （11/09 第一版是 4 格 [頭部, 上身, 下身, 隨身物品]，讀到舊的會自動改成 3 格，放不下的放回背包）
   ・誰能穿：每件的 who（'winter' 部隊長專用、'all' 全隊可穿、'squad' 隊員專用）。
   ・每種開發好的裝備至少會有 1 件（最後一件不能分解），所以不會「學會了卻沒東西穿」。
   ・舊存檔（11/12 以前是「同一種裝備共用一個等級、背包裡疊數量」）：讀到沒有 # 的舊代號會自動拆成一件一件，
     每一件都保留原本那個等級（gearNormalize）。更早的舊版裝備存檔：第一次用新版時轉換一次（gearV2Migrate）。
   這個檔案只在新版才有作用：舊版（GEAR_SYSTEM＝1）時什麼都不做，舊版的程式（js/equipment.js、js/squad-gear.js）照舊。
   必須在 js/equipment.js、js/squad-gear.js、js/backpack.js、js/save.js 之後載入。 */
const GEAR_V2 = typeof GEAR_SYSTEM !== 'undefined' && GEAR_SYSTEM === 2;
const GEAR_V2_SQUAD_STORE = 'tudrc_squad_gear_v2';
const GEAR_V2_MIGRATED = 'tudrc_gear_v2_migrated';   // 舊存檔轉換過了沒（單獨一格：切回舊版再切回來，也不會再轉一次、東西不會變兩倍）
// 隊員的 3 格：name 格子名稱、kinds 這一格能放哪些部位的裝備（data/equipment.js 的 kind）。鞋子（legs）也放隨身物品格
const GEAR_V2_SQUAD_SLOTS = [{ name: '頭部', kinds: ['head'] }, { name: '上身', kinds: ['body'] }, { name: '隨身物品', kinds: ['acc', 'legs'] }];
const gearSquadSlotOfKind = kind => GEAR_V2_SQUAD_SLOTS.findIndex(s => s.kinds.includes(kind));   // 這個部位放隊員的第幾格（-1＝沒有）

// ---- 小工具（舊版也定義，但只有新版會用到）----
const gearWho = d => (d && ['winter', 'all', 'squad'].includes(d.who) ? d.who : 'winter');   // 沒寫＝部隊長專用
const gearWinterCan = d => !!d && gearWho(d) !== 'squad';   // 溫特能不能穿
const gearSquadCan = d => !!d && gearWho(d) !== 'winter';   // 隊員能不能穿
// ---- 每一件裝備（代號＝裝備id#流水號；gearTypeOf／gearKeyLv 在 js/equipment.js）----
const gearLvOf = key => gearKeyLv(key) || 1;   // 這一件幾級
const gearInstKeys = type => (typeof equipState === 'undefined' ? [] : Object.keys(equipState.inst).filter(k => gearTypeOf(k) === type)).sort((a, b) => gearKeyLv(b) - gearKeyLv(a) || a.split('#')[1] - b.split('#')[1]);   // 這一種裝備的每一件（等級高的排前面）
const gearInBag = key => typeof supplyInventory !== 'undefined' && supplyInventory.has(key);
const gearBagKeys = type => gearInstKeys(type).filter(gearInBag);   // 背包裡這一種的每一件
const gearBagCount = type => gearBagKeys(type).length;               // 背包裡這一種有幾件
const gearTotal = type => gearInstKeys(gearTypeOf(type)).length;     // 這一種全部有幾件（背包＋大家身上）
// 這一件穿在誰身上：'winter'／隊員的代號／null（在背包）
function gearWearer(key) {
  if (typeof equipState !== 'undefined' && Object.values(equipState.equipped).includes(key)) return 'winter';
  for (const [type, list] of Object.entries((typeof squadGearState !== 'undefined' && squadGearState.equip) || {})) if ((list || []).includes(key)) return type;
  return null;
}
const gearWearerName = who => who === 'winter' ? '部隊長' : ((typeof TYPES !== 'undefined' && TYPES[who] && TYPES[who].name) || who);
// 把「某一件」包成跟裝備資料一樣的東西（名稱、圖片、數值都跟那種裝備一樣），只有 id 換成這一件的代號；typeId＝它是哪一種
// （背包、T-Pad 隊員頁原本就是用 id 來穿／卸，這樣它們不用知道「一件一件」的事）
function gearInstDef(key) {
  const d = typeof equipDef === 'function' ? equipDef(key) : null; if (!d || key === d.id) return d;
  const o = Object.create(d); o.id = key; o.typeId = d.id; return o;
}
// 製作一件要花多少：gearMakeCost（js/workshop-config.js，開發工坊編輯器也用同一個）
// 隊員穿的這件裝備要顯示幾級（防具視窗、T-Pad 隊員頁的格子右上角）：新版才有等級；舊版＝0（不顯示）
const squadGearLv = key => (GEAR_V2 && key && typeof equipDef === 'function' && equipDef(key)) ? gearKeyLv(key) : 0;
// 這一件現在的效果說明（d 可以是「某一件」，也可以是裝備資料）
const gearEffectText = d => (d && d.stat ? d.stat(d.levels[gearLvOf(d.id) - 1] || d.levels[0]) : '');
// 背包的物品清單裡，這一件長什麼樣子（讓背包、存檔認得它）
const gearItemEntry = (d, id) => ({ id, name: d.name, category: 'equip', image: squadGearImage(d), desc: d.ownedDesc || d.desc || '', effect: '', note: '在裝備箱旁邊（或 T-Pad「Y102隊員」）穿上', noDrop: true, gearV2: true });
let gearDirty = false;    // 有東西變了，等一下要存檔
let gearReady = false;    // 存檔讀完了沒（還沒讀完不能整理，不然會把還沒讀進來的背包當成空的）
// 多一件新的（還沒放進背包、也還沒穿上；呼叫的人要接著放）
function gearNewInst(type, lv) {
  const d = equipDef(type); if (!d) return null;
  const key = d.id + '#' + (++equipState.instSeq);
  equipState.inst[key] = Math.max(1, Math.min(d.levels.length, lv | 0 || 1));
  if (typeof ITEMS !== 'undefined') ITEMS.push(gearItemEntry(d, key));
  gearDirty = true; return key;
}
// 這一件沒有了（分解）
function gearDropInst(key) {
  delete equipState.inst[key]; supplyInventory.delete(key);
  const i = ITEMS.findIndex(x => x.gearV2 && x.id === key); if (i >= 0) ITEMS.splice(i, 1);
  gearDirty = true;
}
function gearBagPut(key) { Map.prototype.set.call(supplyInventory, key, 1); gearDirty = true; }
function gearBagTake(key) { supplyInventory.delete(key); gearDirty = true; }
// 放進背包：給「某一件」的代號＝把那一件放回去；給裝備 id＝多 n 件新的（等級照舊存檔那種裝備的等級，沒有就 Lv1）
function gearBagAdd(id, n = 1) {
  if (gearIsInst(id)) { if (equipState.inst[id]) gearBagPut(id); return; }
  for (let i = 0; i < n; i++) { const key = gearNewInst(id, gearKeyLv(id)); if (key) gearBagPut(key); }
}
// 整理：把舊存檔「同一種疊在一起、共用等級」的裝備拆成一件一件（等級照原本的），順便把對不起來的地方修好
// （每一件一定剛好在一個地方：溫特身上、某位隊員身上，或背包裡）
function gearNormalize() {
  const E = equipState.equipped, seen = new Set();
  const fix = key => {   // 身上的這一件 → 它正式的代號（不認得的、重複的＝null）
    const d = equipDef(key); if (!d) return null;
    if (!gearIsInst(key)) key = gearNewInst(d.id, gearKeyLv(d.id));            // 舊代號：變成獨立的一件，等級照原本的
    else if (!equipState.inst[key]) { equipState.inst[key] = 1; ITEMS.push(gearItemEntry(d, key)); gearDirty = true; }
    if (seen.has(key)) return null;
    seen.add(key);
    if (supplyInventory.has(key)) gearBagTake(key);                             // 穿在身上的不會同時在背包
    return key;
  };
  for (const slot of Object.keys(E)) if (E[slot]) { const k = fix(E[slot]); if (k !== E[slot]) { E[slot] = k; gearDirty = true; } }
  for (const list of Object.values(squadGearState.equip)) if (Array.isArray(list)) list.forEach((key, i) => {
    if (!key) return;
    const k = gearSquadCan(equipDef(key)) ? fix(key) : null;                    // 隊員不能穿的：拿下來（下面會放回背包）
    if (k !== key) { list[i] = k; gearDirty = true; }
  });
  for (const [id, n] of [...supplyInventory]) {
    const it = ITEMS.find(x => x.id === id); if (!it || !it.gearV2) continue;   // 不是裝備
    if (!gearIsInst(id)) { supplyInventory.delete(id); gearBagAdd(id, n); }     // 舊的「一種疊 n 件」→ n 件獨立的
    else if (!equipState.inst[id]) { equipState.inst[id] = 1; gearDirty = true; }
    else if (n !== 1) gearBagPut(id);
  }
  for (const key of Object.keys(equipState.inst)) if (!seen.has(key) && !supplyInventory.has(key)) gearBagPut(key);   // 哪裡都找不到的：放回背包
}
// 每種開發好的裝備至少要有 1 件（例如新手教學直接給的頭盔、測試模式）。背包、開發工坊每次重畫前都會先整理一次
function gearEnsureCopies() {
  if (!GEAR_V2 || !gearReady) return;
  gearNormalize();
  for (const d of EQUIPMENT) if (equipState.owned[d.id] && gearTotal(d.id) < 1) gearBagAdd(d.id, 1);
  if (window.TEST_MODE) for (const d of EQUIPMENT) if (equipState.owned[d.id] && gearTotal(d.id) < 3) gearBagAdd(d.id, 3 - gearTotal(d.id));   // 測試模式：每種 3 件，隊員也有得穿
  gearSaveIfDirty();
}
function gearSaveIfDirty() {
  if (!gearDirty) return;
  gearDirty = false;
  saveEquipment(); if (typeof saveSquadGear === 'function') saveSquadGear(); if (typeof saveGame === 'function') saveGame();   // 等級（裝備存檔）和背包（遊戲存檔）要一起存，才不會對不起來
}
// 編輯器的預覽用：每一種隊員能穿的裝備，背包裡至少放 n 件（js/squad-page.js）
function gearStockAll(n) {
  gearReady = true; gearNormalize();
  for (const d of EQUIPMENT) if (gearSquadCan(d) && gearBagCount(d.id) < n) gearBagAdd(d.id, n - gearBagCount(d.id));
}

if (GEAR_V2) {
  // ---- 背包的物品清單：讓背包、存檔認得這些裝備（分類＝防具，沒有格數上限、不能放在地上）----
  if (typeof ITEM_CATEGORIES !== 'undefined' && typeof SQUAD_GEAR_CATEGORY !== 'undefined' && !ITEM_CATEGORIES.some(c => c.id === SQUAD_GEAR_CATEGORY.id)) ITEM_CATEGORIES.push({ ...SQUAD_GEAR_CATEGORY });   // 「隊員物資」分頁（零食飲料也放這裡）
  syncSquadGearItems = function () {
    for (let i = ITEMS.length - 1; i >= 0; i--) if (ITEMS[i].gearV2) ITEMS.splice(i, 1);
    for (const d of EQUIPMENT) ITEMS.push(gearItemEntry(d, d.id));   // 舊存檔的代號（＝裝備 id）：讀檔時要認得，讀完會拆成一件一件（gearNormalize）
    for (const key of Object.keys(equipState.inst)) { const d = equipDef(key); if (d) ITEMS.push(gearItemEntry(d, key)); }   // 每一件
  };
  syncSquadGearItems();

  // ---- 隊員身上的裝備（新版：3 格分部位）----
  squadGearState = { equip: {} };
  try { const s = JSON.parse(localStorage.getItem(GEAR_V2_SQUAD_STORE) || 'null'); if (s && s.equip) squadGearState = s; } catch (_) {}
  // 第一版的 4 格存檔 [頭部, 上身, 下身, 隨身物品] → 3 格：隨身物品格優先留原本的隨身物品，沒有才放鞋子；放不下的等讀完背包再放回去
  const gearV2Returns = [];
  for (const [type, list] of Object.entries(squadGearState.equip)) {
    if (!Array.isArray(list) || list.length !== 4) continue;
    const [h, b, l, a] = list;
    squadGearState.equip[type] = [h || null, b || null, a || l || null];
    if (a && l) gearV2Returns.push(l);
  }
  saveSquadGear = function () { try { localStorage.setItem(GEAR_V2_SQUAD_STORE, JSON.stringify(squadGearState)); } catch (_) {} };
  squadGearList = () => EQUIPMENT.filter(gearSquadCan).flatMap(d => gearInstKeys(d.id).map(gearInstDef));   // 隊員能穿的每一件（一件一筆）
  squadGearById = id => { const d = typeof equipDef === 'function' ? equipDef(id) : null; return gearSquadCan(d) ? gearInstDef(id) : null; };
  squadGearEffect = g => gearEffectText(g);
  squadGearHave = id => gearTotal(id);
  squadGearSlotName = i => (GEAR_V2_SQUAD_SLOTS[i] || {}).name || '裝備 ' + (i + 1);
  squadGearFits = (id, slot) => { const d = squadGearById(id); return !!d && !!GEAR_V2_SQUAD_SLOTS[slot] && GEAR_V2_SQUAD_SLOTS[slot].kinds.includes(d.kind); };
  squadGearSlotFor = (type, id, slot) => { const d = squadGearById(id); return d ? gearSquadSlotOfKind(d.kind) : -1; };   // 新版：照部位，一定放那一格
  squadGearOf = function (type) {
    const list = squadGearState.equip[type] || [];
    return GEAR_V2_SQUAD_SLOTS.map((s, i) => { const d = list[i] && squadGearById(list[i]); return d && s.kinds.includes(d.kind) ? list[i] : null; });
  };
  // 隊員穿著的裝備 → 隊員數值的加成（照身上「那一件」的等級；換算表在 data/equipment.js 的 GEAR_SQUAD_MODS）
  squadGearMods = function (type) {
    const out = [];
    for (const id of squadGearOf(type)) {
      const d = id && squadGearById(id); if (!d) continue;
      const lv = d.levels[gearLvOf(id) - 1] || d.levels[0] || {};
      for (const [k, v] of Object.entries(lv)) {
        const m = GEAR_SQUAD_MODS[k]; if (!m || typeof v !== 'number') continue;
        out.push(m.mul ? { path: m.path, mul: 1 + v } : { path: m.path, add: v });
      }
    }
    return out;
  };
  // 穿上：這一件要在背包裡；放在它的部位那一格，原本穿的放回背包
  equipSquadGear = function (type, slot, id) {
    if (!bagCanManageEquipment()) { systemNotice('請到營地帳篷調整隊員物資', true); return false; }
    const d = squadGearById(id);
    if (!d) { systemNotice('這件裝備只有部隊長能穿', true); return false; }
    if (!gearIsInst(id)) id = gearBagKeys(id)[0];   // 只說了哪一種：拿背包裡等級最高的那件
    if (!id || !gearInBag(id)) return false;
    slot = gearSquadSlotOfKind(d.kind); if (slot < 0) return false;
    const list = squadGearOf(type), old = list[slot];
    gearBagTake(id); if (old) gearBagPut(old);
    list[slot] = id; squadGearState.equip[type] = list;
    afterSquadGearChange(type); gearSaveIfDirty(); return true;
  };
  unequipSquadGear = function (type, slot) {
    if (!bagCanManageEquipment()) { systemNotice('請到營地帳篷調整隊員物資', true); return false; }
    const list = squadGearOf(type), old = list[slot]; if (!old) return false;
    gearBagPut(old); list[slot] = null; squadGearState.equip[type] = list;
    afterSquadGearChange(type); gearSaveIfDirty(); return true;
  };
  // 開發工坊：舊版的「隊員裝備」區不用了（那幾件已經併進一般的裝備）
  squadGearWorkshopEntries = () => [];
  squadGearWorkshopBuy = () => false;

  // ---- 溫特：取得（開發、戰鬥區域撿到）＝學會做這種裝備＋送 1 件 Lv1；有空格就直接穿上 ----
  grantEquipment = function (id, how, quiet = false) {
    const def = equipDef(id); if (!def || equipState.owned[def.id]) return false;
    equipState.owned[def.id] = 1;
    const key = gearNewInst(def.id, 1);
    const free = gearWinterCan(def) && !isEquipped(def.id) && EQUIP_SLOTS.find(s => s.kinds.includes(def.kind) && !equipState.equipped[s.id]);
    if (free) equipState.equipped[free.id] = key; else gearBagPut(key);
    gearSaveIfDirty();
    systemNotice('🎁 ' + how + '「' + def.name + '」' + (free ? '，已經裝備上了' : gearWinterCan(def) ? '，到裝備箱換裝' : '，放進背包了（隊員專用）'));
    if (typeof itemIntroForEquipment === 'function') itemIntroForEquipment(def.id);
    if (typeof battleGot === 'function' && !MAP_SAFE) battleGot(def.name, def.image, 1);
    if (!quiet) SFX.play('favorUp', .8, 'equip-get');
    if (typeof backpackOpen !== 'undefined' && backpackOpen) renderBackpack();
    if (typeof applySkills === 'function') applySkills();
    return true;
  };
  // ---- 溫特：穿上／卸下（從背包拿那一件、放回背包；武器照舊）----
  const v1EquipToSlot = equipToSlot, v1UnequipSlot = unequipSlot, v1SlotsForGear = slotsForGear;
  equipToSlot = function (slotId, id) {
    if (slotId.startsWith('w:')) return v1EquipToSlot(slotId, id);
    if (!bagCanChangeArmor()) { systemNotice(armorWhereHint(), true); return; }
    const d = equipDef(id); if (!d || !equipState.owned[d.id]) return;
    if (!gearWinterCan(d)) { systemNotice('「' + d.name + '」是隊員專用的裝備', true); return; }
    if (!gearIsInst(id)) id = wornKeyOf(d.id) || gearBagKeys(d.id)[0];   // 只說了哪一種：身上那件，不然背包裡等級最高的那件
    const E = equipState.equipped, from = id && Object.keys(E).find(k => E[k] === id);
    if (from === slotId) return;
    if (!from && !(id && gearInBag(id))) { systemNotice('背包裡沒有「' + d.name + '」了，可以找諾亞製作', true); return; }
    const old = E[slotId];
    if (from) E[from] = null; else gearBagTake(id);   // 已經穿在別格：搬過來；不然從背包拿這一件
    if (old) gearBagPut(old);   // 那一格原本的放回背包
    E[slotId] = id;
    for (const k of Object.keys(E)) if (k !== slotId && E[k] && gearTypeOf(E[k]) === d.id) { gearBagPut(E[k]); E[k] = null; }   // 同一種裝備身上只能穿一件：另一格的同種放回背包
    sfx('wearGear'); afterLoadoutChange(); gearSaveIfDirty();
  };
  unequipSlot = function (slotId) {
    if (slotId.startsWith('w:')) return v1UnequipSlot(slotId);
    if (!bagCanChangeArmor()) { systemNotice(armorWhereHint(), true); return; }
    const id = equipState.equipped[slotId]; if (!id) return;
    equipState.equipped[slotId] = null; gearBagPut(id);
    sfx('switch'); afterLoadoutChange(); gearSaveIfDirty();
  };
  slotsForGear = function (kind, id) {
    if (kind !== 'weapon' && !gearWinterCan(equipDef(id))) return [];   // 隊員專用：溫特沒有格子可以放
    return v1SlotsForGear(kind, id);
  };

  // ---- 背包的「防具」分頁（溫特）：背包裡的每一件＋溫特身上穿的（一件一格；隊員專用的不列，選隊員時才看得到）----
  const v1OwnedGear = ownedGear;
  ownedGear = function (withWeapons) {
    if (typeof EQUIPMENT === 'undefined' || typeof equipState === 'undefined') return [];
    gearEnsureCopies();
    const weapons = withWeapons ? v1OwnedGear(true).filter(g => g.weapon) : [];
    const worn = new Set(Object.values(equipState.equipped).filter(Boolean));
    const armor = EQUIPMENT.filter(d => gearWinterCan(d) && equipState.owned[d.id]).flatMap(d =>
      gearInstKeys(d.id).filter(key => worn.has(key) || gearInBag(key)).sort((a, b) => worn.has(b) - worn.has(a))   // 身上那件排前面，其他照等級
        .map(key => ({ id: 'gear:' + key, name: d.name, image: d.image, icon: d.icon, gear: gearInstDef(key), lv: gearKeyLv(key), worn: worn.has(key),
          extraTags: '<span class="bag-tag">' + GEAR_WHO_NAME[gearWho(d)] + '</span>' })));
    return weapons.concat(armor);
  };

  // ---- 諾亞的開發工坊 ----
  // 製作裝備頁：一種裝備一格（開發／製作一件，新做的都是 Lv1）。
  // 升級裝備頁：手上的每一件各一格（inst），寫著在誰身上／在背包，按哪一格就只升那一件。
  const v1WorkshopEntries = workshopEntries;
  workshopEntries = function () {
    gearEnsureCopies();
    const all = v1WorkshopEntries(), out = [], cash = Math.floor((typeof G !== 'undefined' && G && G.money) || 0);
    for (const e of all.gear) {
      const d = e.def, has = !!equipState.owned[d.id], keys = gearInstKeys(d.id), whoTag = '<span class="bag-tag">' + GEAR_WHO_NAME[gearWho(d)] + '</span>';
      e.about = [e.about, gearSquadNote(d)].filter(Boolean).join('');
      e.typeOnly = true; e.worn = false; e.lv = has ? 1 : 0;   // 「這一種」的格子：只放製作裝備頁；開發過的顯示新做出來的樣子（Lv1）
      e.extraTags = whoTag + (has ? '<span class="bag-tag">持有 ' + keys.length + ' 件</span>' : '');
      if (has) {   // 開發過了：「製作一件」
        const c = gearMakeCost(d);
        const mkBtn = '<button type="button" class="ws-btn" data-ws="mk:' + d.id + '">製作一件 <b>' + WS_SHARD_IMG + c.shards + '</b></button>';
        e.extraBtn = workshopPriceBtn(typeof workshopInfoBtnStyle === 'function' ? workshopInfoBtnStyle(d.id, mkBtn) : mkBtn, c.money, c.money > cash);   // 寬高字級跟「開發」按鈕一樣套開發工坊編輯器的設定（要在加價錢之前套）
      }
      out.push(e);
      if (!has) continue;
      const order = key => { const w = gearWearer(key); return w === 'winter' ? 0 : w ? 1 : 2; };   // 部隊長身上的 → 隊員身上的 → 背包裡的
      for (const key of keys.sort((a, b) => order(a) - order(b))) {
        const lv = gearKeyLv(key), who = gearWearer(key), up = lv < d.levels.length;
        out.push({ ...e, key: 'g:' + key, wk: d.id, inst: key, typeOnly: false, lv, extraBtn: null,
          tileNote: who ? gearWearerName(who) : '',
          upCost: up ? d.cost[lv] : 0, upMoney: up ? wsMoney(d.id, lv, d.cost[lv]) : 0, buy: 'up:' + key,
          extraTags: whoTag + (who ? '<span class="bag-tag worn">' + gearWearerName(who) + '穿著</span>' : '<span class="bag-tag">背包裡</span>') });
      }
    }
    all.gear = out;
    return all;
  };
  window.gearV2WorkshopBuy = function (kind, id) {   // js/equipment.js 的 workshopBuy 先問這裡
    if (kind !== 'mk') return false;
    const d = equipDef(id); if (!d || !equipState.owned[d.id]) return true;
    const c = gearMakeCost(d);
    if (!spendWorkshop(c.shards, c.money)) return true;
    gearBagPut(gearNewInst(d.id, 1));   // 新做的一律 Lv1
    gearSaveIfDirty();
    workshopLevelFx('craft', d.name);
    showWorkshopToast('🎽 諾亞做好了「' + d.name + '」Lv1，放進背包了（共 ' + gearTotal(d.id) + ' 件）');
    return true;
  };
  // 開發工坊右邊「背包裡的裝備」：背包裡的每一件各列一格
  window.gearV2SpareList = () => EQUIPMENT.flatMap(d => gearBagKeys(d.id));
  // 分解：分解的是選到的那一件（要在背包裡）。返還一半的碎片：製作費的一半；Lv2 以上再加升到這一級花的一半。
  // 每種的最後一件不能分解（學會了就一直會做）
  const v1ScrapInfo = wsScrapInfo, v1ScrapBox = wsScrapBox, v1ScrapGo = wsScrapGo;
  wsScrapInfo = function (key) {
    if (!key || key.startsWith('w:')) return v1ScrapInfo(key);
    const d = equipDef(key); if (!d || !equipState.inst[key]) return null;
    const lv = gearKeyLv(key), who = gearWearer(key);
    const why = who ? '這件「' + d.name + '」' + gearWearerName(who) + '穿著，要先卸下' : gearTotal(d.id) < 2 ? '「' + d.name + '」只剩最後一件，不能分解' : '';
    return { name: d.name, lv, keep: !!why, keepWhy: why, refund: Math.floor((gearMakeCost(d).shards + (lv >= 2 ? d.cost[lv - 1] || 0 : 0)) / 2), gear: true };
  };
  wsScrapBox = function () {
    const info = wsScrapInfo(wsScrapSel);
    if (!info || !info.gear) return v1ScrapBox();
    if (info.keep) return '<div class="wss-scrap"><button type="button" class="wss-scrap-btn" disabled>無法分解</button><small>' + info.keepWhy + '</small></div>';
    return '<div class="wss-scrap"><button type="button" class="wss-scrap-btn' + (wsScrapArmed ? ' armed' : '') + '" data-scrap-go>' + (wsScrapArmed ? '確定分解這件「' + info.name + ' Lv' + info.lv + '」？' : '分解這一件') + '</button>' +
      '<small>返還一半的異質碎片（' + WS_SHARD_IMG + info.refund + '）</small></div>';
  };
  wsScrapGo = function () {
    const key = wsScrapSel, info = wsScrapInfo(key);
    if (!info || !info.gear) return v1ScrapGo();
    if (info.keep) return;
    if (!wsScrapArmed) {   // 第一次按：變成「確定分解？」，3 秒內再按一次才分解
      wsScrapArmed = true; sfx('menu'); renderWorkshop();
      clearTimeout(wsScrapArmTimer); wsScrapArmTimer = setTimeout(() => { if (wsScrapArmed) { wsScrapArmed = false; if (workshopOpen) renderWorkshop(); } }, 3000);
      return;
    }
    clearTimeout(wsScrapArmTimer); wsScrapArmed = false; wsScrapSel = null;
    gearDropInst(key);
    training.crystals += info.refund; saveTraining(); if (typeof updateHUD === 'function') updateHUD();
    gearSaveIfDirty();
    afterLoadoutChange(); SFX.play('achievement', .5, 'equip-up');
    showWorkshopToast('分解了一件「' + info.name + ' Lv' + info.lv + '」，返還 <b>' + info.refund + '</b> 個異質碎片', true);
    renderWorkshop();
  };

  // ---- 讀檔之後：舊存檔轉換一次、補齊每種至少 1 件、重新算隊員數值 ----
  window.addEventListener('DOMContentLoaded', () => {   // js/save.js 的 loadGame 比這裡早登記，會先跑
    gearReady = true;   // 存檔讀完了，可以開始整理
    if (gearV2Returns.length) for (const id of gearV2Returns) gearBagAdd(id, 1);   // 4 格改 3 格放不下的
    gearV2Migrate();
    gearEnsureCopies();
    if (typeof applySkills === 'function') applySkills();
  });
  applySkills();
}

// 隊員穿上時有什麼效果（開發工坊的說明後面接一句）
function gearSquadNote(d) {
  const w = gearWho(d);
  if (w === 'winter') return '（部隊長專用）';
  const keys = Object.keys(d.levels[0] || {}).filter(k => GEAR_SQUAD_MODS[k]);
  return keys.length ? (w === 'squad' ? '（隊員專用）' : '（隊員也能穿，效果相同）') : '（隊員穿了沒有效果）';
}

// 舊版存檔 → 新版（只做一次，做完記在 tudrc_gear_v2_migrated）
function gearV2Migrate() {
  let done = false; try { done = localStorage.getItem(GEAR_V2_MIGRATED) === '1'; } catch (_) {}
  if (!GEAR_V2 || done) return;
  const research = id => { equipState.owned[id] = Math.max(equipState.owned[id] || 0, 1); };
  // 1. 舊的隊員裝備：背包裡的（讀檔時已經被當成不認得的東西拿掉了，所以直接看存檔）
  let raw = null; try { raw = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); } catch (_) {}
  for (const e of (raw && Array.isArray(raw.inventory) ? raw.inventory : [])) {
    const id = Array.isArray(e) && GEAR_V1_SQUAD_MAP[e[0]], n = Array.isArray(e) ? e[1] | 0 : 0;
    if (!id || !equipDef(id) || n <= 0) continue;
    research(id); gearBagAdd(id, n);
  }
  // 2. 舊的隊員裝備：隊員身上穿的 → 放到新版那件的部位；那一格已經有了就放回背包
  let v1 = {}; try { v1 = (JSON.parse(localStorage.getItem(SQUAD_GEAR_STORE) || '{}') || {}).equip || {}; } catch (_) {}
  for (const [type, list] of Object.entries(v1)) for (const old of Array.isArray(list) ? list : []) {
    const id = GEAR_V1_SQUAD_MAP[old], d = id && equipDef(id); if (!d) continue;
    research(id);
    const slot = gearSquadSlotOfKind(d.kind), cur = squadGearOf(type);
    if (slot >= 0 && !cur[slot]) { cur[slot] = id; squadGearState.equip[type] = cur; } else gearBagAdd(id, 1);
  }
  // 3. 溫特已經開發的裝備：沒穿著的放 1 件進背包；上面放的都是舊代號，這裡一起拆成一件一件（gearEnsureCopies 會做）
  gearEnsureCopies();
  try { localStorage.setItem(GEAR_V2_MIGRATED, '1'); } catch (_) {}
  saveEquipment(); saveSquadGear(); if (typeof saveGame === 'function') saveGame();
}
