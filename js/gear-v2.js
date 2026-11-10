/* ===== 新版裝備（data/equipment.js 的 GEAR_SYSTEM＝2）=====
   溫特和 Y102 隊員共用同一份裝備清單（data/equipment.js 的 EQUIPMENT）。
   ・研發等級：在諾亞的開發工坊「開發」＝學會做這種裝備（Lv1，送 1 件）；「升級」＝這一種裝備變強，所有同種的一起變強。
     等級存在 equipState.owned（js/equipment.js，跟舊版同一個欄位）。
   ・實體物品：開發工坊按「製作一件」再做，放進背包（supplyInventory，物品 id＝裝備 id，分類是「防具」，沒有格數上限）。
     一件只能給一個人穿：穿上＝從背包拿走一件，卸下＝放回背包。
   ・溫特：背包左邊的部隊長裝備（頭部、上身、下身 ×2、隨身物品 ×2），在裝備箱旁邊換。
   ・隊員：頭部、上身、隨身物品各 1 格（鞋子這類下身裝備穿在「隨身物品」格；T-Pad「Y102隊員」→ 更換裝備，或裝備箱的防具視窗選隊員）。
     隊員身上的裝備存在 localStorage 的 tudrc_squad_gear_v2：{ equip: { 隊員: [頭部, 上身, 隨身物品] } }
     （11/09 第一版是 4 格 [頭部, 上身, 下身, 隨身物品]，讀到舊的會自動改成 3 格，放不下的放回背包）
   ・誰能穿：每件的 who（'winter' 部隊長專用、'all' 全隊可穿、'squad' 隊員專用）。
   ・每種研發好的裝備至少會有 1 件（全部分解掉也會留 1 件），所以不會「有等級卻沒東西穿」。
   ・舊版存檔：第一次用新版時自動轉換一次（溫特已經開發的裝備＝研發等級，背包裡放 1 件；舊的隊員裝備換成新版的同一件）。
     轉換過了記在 localStorage 的 tudrc_gear_v2_migrated（開新遊戲會一起清掉）。
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
const gearLvOf = id => Math.max(1, (typeof equipState !== 'undefined' && equipState.owned[id]) || 1);   // 研發等級（沒研發過的當 Lv1 顯示）
const gearBagCount = id => (typeof supplyInventory !== 'undefined' && supplyInventory.get(id)) || 0;   // 背包裡有幾件
const gearSquadWorn = id => Object.values((typeof squadGearState !== 'undefined' && squadGearState.equip) || {}).reduce((n, list) => n + (list || []).filter(x => x === id).length, 0);   // 隊員身上穿了幾件
const gearTotal = id => gearBagCount(id) + (typeof isEquipped === 'function' && isEquipped(id) ? 1 : 0) + gearSquadWorn(id);   // 全部加起來幾件
// 製作一件要花多少：gearMakeCost（js/workshop-config.js，開發工坊編輯器也用同一個）
// 隊員穿的這件裝備要顯示幾級（防具視窗、T-Pad 隊員頁的格子右上角）：新版才有等級；舊版、沒研發過的＝0（不顯示）
const squadGearLv = id => (GEAR_V2 && id && typeof equipState !== 'undefined' && equipState.owned[id]) ? gearLvOf(id) : 0;
// 這一件現在（照研發等級）的效果說明
const gearEffectText = d => (d && d.stat ? d.stat(d.levels[gearLvOf(d.id) - 1] || d.levels[0]) : '');
// 背包裡放進／拿出一件（防具分類沒有格數上限）
function gearBagAdd(id, n) {
  const next = Math.max(0, gearBagCount(id) + n);
  if (next) Map.prototype.set.call(supplyInventory, id, next); else supplyInventory.delete(id);
}
// 每種研發好的裝備至少要有 1 件（例如新手教學直接給的頭盔、測試模式）
function gearEnsureCopies() {
  if (!GEAR_V2) return;
  for (const d of EQUIPMENT) if (equipState.owned[d.id] && gearTotal(d.id) < 1) gearBagAdd(d.id, 1);
  if (window.TEST_MODE) for (const d of EQUIPMENT) if (equipState.owned[d.id] && gearTotal(d.id) < 3) gearBagAdd(d.id, 3 - gearTotal(d.id));   // 測試模式：每種 3 件，隊員也有得穿
}

if (GEAR_V2) {
  // ---- 背包的物品清單：讓背包、存檔認得這些裝備（分類＝防具，沒有格數上限、不能放在地上）----
  if (typeof ITEM_CATEGORIES !== 'undefined' && typeof SQUAD_GEAR_CATEGORY !== 'undefined' && !ITEM_CATEGORIES.some(c => c.id === SQUAD_GEAR_CATEGORY.id)) ITEM_CATEGORIES.push({ ...SQUAD_GEAR_CATEGORY });   // 「隊員物資」分頁（零食飲料也放這裡）
  syncSquadGearItems = function () {
    for (let i = ITEMS.length - 1; i >= 0; i--) if (ITEMS[i].gearV2) ITEMS.splice(i, 1);
    for (const d of EQUIPMENT) ITEMS.push({ id: d.id, name: d.name, category: 'equip', image: squadGearImage(d), desc: d.ownedDesc || d.desc || '', effect: '', note: '在裝備箱旁邊（或 T-Pad「Y102隊員」）穿上', noDrop: true, gearV2: true });
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
  squadGearList = () => EQUIPMENT.filter(gearSquadCan);
  squadGearById = id => { const d = typeof equipDef === 'function' ? equipDef(id) : null; return gearSquadCan(d) ? d : null; };
  squadGearEffect = g => gearEffectText(g);
  squadGearHave = id => gearTotal(id);
  squadGearSlotName = i => (GEAR_V2_SQUAD_SLOTS[i] || {}).name || '裝備 ' + (i + 1);
  squadGearFits = (id, slot) => { const d = squadGearById(id); return !!d && !!GEAR_V2_SQUAD_SLOTS[slot] && GEAR_V2_SQUAD_SLOTS[slot].kinds.includes(d.kind); };
  squadGearSlotFor = (type, id, slot) => { const d = squadGearById(id); return d ? gearSquadSlotOfKind(d.kind) : -1; };   // 新版：照部位，一定放那一格
  squadGearOf = function (type) {
    const list = squadGearState.equip[type] || [];
    return GEAR_V2_SQUAD_SLOTS.map((s, i) => { const d = list[i] && squadGearById(list[i]); return d && s.kinds.includes(d.kind) ? list[i] : null; });
  };
  // 隊員穿著的裝備 → 隊員數值的加成（照研發等級；換算表在 data/equipment.js 的 GEAR_SQUAD_MODS）
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
  // 穿上：背包裡要有一件；放在這件的部位那一格，原本穿的放回背包
  equipSquadGear = function (type, slot, id) {
    if (!bagCanManageEquipment()) { systemNotice('請到營地帳篷調整隊員物資', true); return false; }
    const d = squadGearById(id);
    if (!d) { systemNotice('這件裝備只有部隊長能穿', true); return false; }
    if (gearBagCount(id) < 1) return false;
    slot = gearSquadSlotOfKind(d.kind); if (slot < 0) return false;
    const list = squadGearOf(type), old = list[slot];
    gearBagAdd(id, -1); if (old) gearBagAdd(old, 1);
    list[slot] = id; squadGearState.equip[type] = list;
    afterSquadGearChange(type); return true;
  };
  unequipSquadGear = function (type, slot) {
    if (!bagCanManageEquipment()) { systemNotice('請到營地帳篷調整隊員物資', true); return false; }
    const list = squadGearOf(type), old = list[slot]; if (!old) return false;
    gearBagAdd(old, 1); list[slot] = null; squadGearState.equip[type] = list;
    afterSquadGearChange(type); return true;
  };
  // 開發工坊：舊版的「隊員裝備」區不用了（那幾件已經併進一般的裝備）
  squadGearWorkshopEntries = () => [];
  squadGearWorkshopBuy = () => false;

  // ---- 溫特：取得（開發、戰鬥區域撿到）＝研發 Lv1＋1 件；有空格就直接穿上 ----
  grantEquipment = function (id, how, quiet = false) {
    const def = equipDef(id); if (!def || equipState.owned[id]) return false;
    equipState.owned[id] = 1;
    const free = gearWinterCan(def) && EQUIP_SLOTS.find(s => s.kinds.includes(def.kind) && !equipState.equipped[s.id]);
    if (free) equipState.equipped[free.id] = id; else gearBagAdd(id, 1);
    saveEquipment(); if (typeof saveGame === 'function') saveGame();
    systemNotice('🎁 ' + how + '「' + def.name + '」' + (free ? '，已經裝備上了' : gearWinterCan(def) ? '，到裝備箱換裝' : '，放進背包了（隊員專用）'));
    if (typeof itemIntroForEquipment === 'function') itemIntroForEquipment(id);
    if (typeof battleGot === 'function' && !MAP_SAFE) battleGot(def.name, def.image, 1);
    if (!quiet) SFX.play('favorUp', .8, 'equip-get');
    if (typeof backpackOpen !== 'undefined' && backpackOpen) renderBackpack();
    if (typeof applySkills === 'function') applySkills();
    return true;
  };
  // ---- 溫特：穿上／卸下（從背包拿一件、放回背包；武器照舊）----
  const v1EquipToSlot = equipToSlot, v1UnequipSlot = unequipSlot, v1SlotsForGear = slotsForGear;
  equipToSlot = function (slotId, id) {
    if (slotId.startsWith('w:')) return v1EquipToSlot(slotId, id);
    if (!bagCanChangeArmor()) { systemNotice(armorWhereHint(), true); return; }
    const d = equipDef(id); if (!d || !equipState.owned[id]) return;
    if (!gearWinterCan(d)) { systemNotice('「' + d.name + '」是隊員專用的裝備', true); return; }
    const E = equipState.equipped, from = Object.keys(E).find(k => E[k] === id);
    if (from === slotId) return;
    if (!from && gearBagCount(id) < 1) { systemNotice('背包裡沒有「' + d.name + '」了，可以找諾亞製作', true); return; }
    const old = E[slotId];
    if (from) { E[from] = null; } else gearBagAdd(id, -1);   // 已經穿在別格：搬過來；不然從背包拿一件
    if (old) gearBagAdd(old, 1);   // 那一格原本的放回背包
    E[slotId] = id;
    sfx('wearGear'); afterLoadoutChange(); if (typeof saveGame === 'function') saveGame();
  };
  unequipSlot = function (slotId) {
    if (slotId.startsWith('w:')) return v1UnequipSlot(slotId);
    if (!bagCanChangeArmor()) { systemNotice(armorWhereHint(), true); return; }
    const id = equipState.equipped[slotId]; if (!id) return;
    equipState.equipped[slotId] = null; gearBagAdd(id, 1);
    sfx('switch'); afterLoadoutChange(); if (typeof saveGame === 'function') saveGame();
  };
  slotsForGear = function (kind, id) {
    if (kind !== 'weapon' && !gearWinterCan(equipDef(id))) return [];   // 隊員專用：溫特沒有格子可以放
    return v1SlotsForGear(kind, id);
  };

  // ---- 背包的「防具」分頁（溫特）：背包裡有的＋溫特身上穿的（隊員專用的不列，選隊員時才看得到）----
  const v1OwnedGear = ownedGear;
  ownedGear = function (withWeapons) {
    if (typeof EQUIPMENT === 'undefined' || typeof equipState === 'undefined') return [];
    gearEnsureCopies();
    const weapons = withWeapons ? v1OwnedGear(true).filter(g => g.weapon) : [];
    const armor = EQUIPMENT.filter(d => gearWinterCan(d) && equipState.owned[d.id] && (gearBagCount(d.id) > 0 || isEquipped(d.id))).map(d => {
      const n = gearBagCount(d.id);
      return { id: 'gear:' + d.id, name: d.name, image: d.image, icon: d.icon, gear: d, lv: equipState.owned[d.id], worn: isEquipped(d.id), count: n,
        extraTags: '<span class="bag-tag">' + GEAR_WHO_NAME[gearWho(d)] + '</span><span class="bag-tag">背包裡 ' + n + ' 件</span>' };
    });
    return weapons.concat(armor);
  };

  // ---- 諾亞的開發工坊 ----
  const v1WorkshopEntries = workshopEntries;
  workshopEntries = function () {
    gearEnsureCopies();
    const all = v1WorkshopEntries();
    for (const e of all.gear) {
      const d = e.def, tot = gearTotal(d.id), cash = Math.floor((typeof G !== 'undefined' && G && G.money) || 0);
      e.worn = tot - gearBagCount(d.id) > 0;   // 有人穿著
      e.about = [e.about, gearSquadNote(d)].filter(Boolean).join('');
      e.extraTags = '<span class="bag-tag">' + GEAR_WHO_NAME[gearWho(d)] + '</span>' + (e.lv ? '<span class="bag-tag">持有 ' + tot + ' 件</span>' : '');
      if (e.lv) {   // 研發過了：多一顆「製作一件」
        const c = gearMakeCost(d);
        const mkBtn = '<button type="button" class="ws-btn" data-ws="mk:' + d.id + '">製作一件 <b>' + WS_SHARD_IMG + c.shards + '</b></button>';
        e.extraBtn = workshopPriceBtn(typeof workshopInfoBtnStyle === 'function' ? workshopInfoBtnStyle(d.id, mkBtn) : mkBtn, c.money, c.money > cash);   // 寬高字級跟「開發」按鈕一樣套開發工坊編輯器的設定（要在加價錢之前套）
      }
    }
    return all;
  };
  window.gearV2WorkshopBuy = function (kind, id) {   // js/equipment.js 的 workshopBuy 先問這裡
    if (kind !== 'mk') return false;
    const d = equipDef(id); if (!d || !equipState.owned[id]) return true;
    const c = gearMakeCost(d);
    if (!spendWorkshop(c.shards, c.money)) return true;
    gearBagAdd(id, 1);
    if (typeof saveGame === 'function') saveGame();
    workshopLevelFx('craft', d.name);
    showWorkshopToast('🎽 諾亞做好了「' + d.name + '」，放進背包了（共 ' + gearTotal(id) + ' 件）');
    return true;
  };
  // 開發工坊右邊「背包裡的裝備」：背包裡有幾件就列幾種（數量寫在右下）
  window.gearV2SpareList = () => EQUIPMENT.filter(d => equipState.owned[d.id] && gearBagCount(d.id) > 0);
  // 分解：分解的是背包裡的一件（返還製作費一半的碎片）；最後一件不能分解（研發等級一直都在）
  const v1ScrapInfo = wsScrapInfo, v1ScrapBox = wsScrapBox, v1ScrapGo = wsScrapGo;
  wsScrapInfo = function (key) {
    if (!key || key.startsWith('w:')) return v1ScrapInfo(key);
    const d = equipDef(key), lv = equipState.owned[key] || 0; if (!d || !lv) return null;
    const bag = gearBagCount(key), tot = gearTotal(key);
    const why = bag < 1 ? '背包裡沒有多的「' + d.name + '」（穿在身上的要先卸下）' : tot < 2 ? '「' + d.name + '」只剩最後一件，不能分解（研發等級會一直保留）' : '';
    return { name: d.name, lv, keep: !!why, keepWhy: why, refund: Math.floor(gearMakeCost(d).shards / 2), gear: true };
  };
  wsScrapBox = function () {
    const info = wsScrapInfo(wsScrapSel);
    if (!info || !info.gear) return v1ScrapBox();
    if (info.keep) return '<div class="wss-scrap"><button type="button" class="wss-scrap-btn" disabled>無法分解</button><small>' + info.keepWhy + '</small></div>';
    return '<div class="wss-scrap"><button type="button" class="wss-scrap-btn' + (wsScrapArmed ? ' armed' : '') + '" data-scrap-go>' + (wsScrapArmed ? '確定分解一件「' + info.name + '」？' : '分解一件') + '</button>' +
      '<small>返還製作費一半的異質碎片（' + WS_SHARD_IMG + info.refund + '）</small></div>';
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
    clearTimeout(wsScrapArmTimer); wsScrapArmed = false;
    gearBagAdd(key, -1);
    if (gearBagCount(key) < 1) wsScrapSel = null;
    training.crystals += info.refund; saveTraining(); if (typeof updateHUD === 'function') updateHUD();
    if (typeof saveGame === 'function') saveGame();
    afterLoadoutChange(); SFX.play('achievement', .5, 'equip-up');
    showWorkshopToast('分解了一件「' + info.name + '」，返還 <b>' + info.refund + '</b> 個異質碎片', true);
    renderWorkshop();
  };

  // ---- 讀檔之後：舊存檔轉換一次、補齊每種至少 1 件、重新算隊員數值 ----
  window.addEventListener('DOMContentLoaded', () => {   // js/save.js 的 loadGame 比這裡早登記，會先跑
    if (gearV2Returns.length) { for (const id of gearV2Returns) gearBagAdd(id, 1); saveSquadGear(); if (typeof saveGame === 'function') saveGame(); }   // 4 格改 3 格放不下的
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
  // 3. 溫特已經開發的裝備：沒穿著的放 1 件進背包（gearEnsureCopies 會做）
  gearEnsureCopies();
  try { localStorage.setItem(GEAR_V2_MIGRATED, '1'); } catch (_) {}
  saveEquipment(); saveSquadGear(); if (typeof saveGame === 'function') saveGame();
}
