// ============================================================
//  部隊長（溫特）的裝備
//  ・背包左邊「部隊長裝備」：換裝（頭部、身體、飾品 ×2），看武器等級、頭燈電量。
//  ・找諾亞對話 →「🔧 開發工坊」：用異質碎片開發新裝備、升級裝備和武器。
//  ・特殊裝備（順順宮御守、異質探測器）只能在戰鬥區域拿到。
//  ・資料、數值在 data/equipment.js；進度存在瀏覽器（localStorage）。
// ============================================================
const EQUIP_STORE = 'tudrc_equipment_v1';
const equipState = { owned: {}, equipped: { head: null, body: null, acc1: null, acc2: null }, weapons: { pistol: 1, flare: 1 }, battery: 100 };
try {
  const s = JSON.parse(localStorage.getItem(EQUIP_STORE) || '{}');
  if (s.owned) for (const [id, lv] of Object.entries(s.owned)) if (EQUIPMENT.some(e => e.id === id)) equipState.owned[id] = Math.max(1, Math.min(3, lv | 0));
  if (s.equipped) for (const k of Object.keys(equipState.equipped)) if (s.equipped[k] && equipState.owned[s.equipped[k]]) equipState.equipped[k] = s.equipped[k];
  if (s.weapons) for (const k of Object.keys(equipState.weapons)) if (Number.isFinite(s.weapons[k])) equipState.weapons[k] = Math.max(1, Math.min(3, s.weapons[k] | 0));
  if (Number.isFinite(s.battery)) equipState.battery = Math.max(0, Math.min(100, s.battery));
} catch (_) {}
function saveEquipment() { try { localStorage.setItem(EQUIP_STORE, JSON.stringify(equipState)); } catch (_) {} }

const equipDef = id => EQUIPMENT.find(e => e.id === id) || null;
const isEquipped = id => Object.values(equipState.equipped).includes(id);
// 有裝備的話回傳這一級的數值，沒裝備就回傳 null
function equipLv(id) {
  if (!isEquipped(id)) return null;
  const def = equipDef(id); return def ? def.levels[(equipState.owned[id] || 1) - 1] : null;
}

// ---- 效果（其他程式呼叫）----
const equipPlayerDamage = d => { const v = equipLv('vest'); return v ? d * (1 - v.guard) : d; };   // 防護背心：溫特受到的傷害
const equipSootheCost = c => { const v = equipLv('bracelet'); return v ? Math.round(c * (1 - v.save)) : c; };   // 共感手環：疏導花的 SP
const equipAlmondMul = () => { const v = equipLv('thermos'); return v ? 1 + v.bonus : 1; };   // 杏仁水保溫瓶
const equipSpeedMul = () => { const v = equipLv('sneakers'); return v ? 1 + v.speed : 1; };   // 輕量跑鞋
const equipSmilerMul = () => { const v = equipLv('charm'); return v ? 1 - v.ward : 1; };      // 順順宮御守：被 Smiler 咬的機率
const equipCalm = () => { const v = equipLv('earmuffs'); return v ? v.calm : 0; };            // 降噪耳機：理智下降的影響減少多少
// 頭燈：戰鬥區域、有電的時候，溫特身上一圈光（js/lighting.js 的 getLights 呼叫）
function equipLight() {
  const v = equipLv('headlamp');
  if (!v || MAP_SAFE || !G || !G.player || equipState.battery <= 0) return null;
  return { x: G.player.x, y: G.player.y - 10, r: v.light };
}
// 武器等級套到實際數值（手槍：傷害、彈匣、裝填；照明彈槍：燃燒秒數、備用彈上限）
function applyWeaponLevels() {
  const p = WEAPON_UPGRADES.pistol.levels[equipState.weapons.pistol - 1], f = WEAPON_UPGRADES.flare.levels[equipState.weapons.flare - 1];
  if (typeof PLAYER_ATK !== 'undefined') { PLAYER_ATK.dmg = p.dmg; PLAYER_ATK.mag = p.mag; PLAYER_ATK.reloadTime = p.reload; }
  if (typeof FLARE !== 'undefined') { FLARE.burn = f.burn; FLARE.reserveMax = f.reserve; }
}

// ---- 每幀（game.js 的 update 呼叫）：頭燈耗電 ----
let batteryWarned = false;
function updateEquipment(dt) {
  const v = equipLv('headlamp');
  if (!v || MAP_SAFE) return;
  if (equipState.battery > 0) {
    equipState.battery = Math.max(0, equipState.battery - dt * 100 / v.battery);
    if (equipState.battery > 0) return;
  }
  if ((supplyInventory.get('battery') || 0) > 0) {   // 沒電：自動換上背包裡的電池
    const n = supplyInventory.get('battery'); if (n <= 1) supplyInventory.delete('battery'); else supplyInventory.set('battery', n - 1);
    equipState.battery = 100; batteryWarned = false; saveEquipment();
    systemNotice('🔋 頭燈換上新電池（剩 ' + (n - 1) + ' 顆）');
  } else if (!batteryWarned) {
    batteryWarned = true; saveEquipment();
    systemNotice('頭燈沒電了，在地圖上找找電池吧', true);
  }
}
setInterval(() => { if (equipLv('headlamp') && !MAP_SAFE) saveEquipment(); }, 3000);   // 電量每 3 秒存一次

// ---- 異質探測器：附近黑暗中的礦物、核心微微發光（render.js 在黑幕上面畫）----
function drawDetector(ctx) {
  const v = equipLv('detector'); if (!v || MAP_SAFE || !G || !G.player) return;
  const p = G.player, R = v.range * CELL, t = performance.now() / 1000;
  const spots = [];
  for (const o of G.obstacles) if (o.ore && o.hp > 0) { const c = typeof oreCenter === 'function' ? oreCenter(o) : { x: OX + (o.c + .5) * CELL, y: OY + (o.r + .5) * CELL }; spots.push(c); }
  for (const c of G.cores || []) if (!c.dead) spots.push({ x: c.x, y: c.y - 20 });
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (const s of spots) {
    const d = Math.hypot(s.x - p.x, s.y - p.y); if (d > R || isVisible(s.x, s.y)) continue;
    const k = (1 - d / R) * (.55 + .45 * Math.sin(t * 3 + s.x * .01));
    const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 26);
    g.addColorStop(0, `rgba(200,140,255,${(.55 * k).toFixed(3)})`); g.addColorStop(1, 'rgba(200,140,255,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(s.x, s.y, 26, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

// ---- 取得裝備（諾亞開發、戰鬥區域掉落）----
function grantEquipment(id, how) {
  const def = equipDef(id); if (!def || equipState.owned[id]) return false;
  equipState.owned[id] = 1;
  const free = EQUIP_SLOTS.find(s => s.kinds.includes(def.kind) && !equipState.equipped[s.id]);   // 有空格就直接穿上
  if (free) equipState.equipped[free.id] = id;
  saveEquipment();
  systemNotice('🎁 ' + how + '「' + def.name + '」' + (free ? '，已經裝備上了' : '，到背包換裝'));
  SFX.play('favorUp', .8, 'equip-get');
  if (typeof backpackOpen !== 'undefined' && backpackOpen) renderBackpack();
  return true;
}
// 戰鬥區域掉落（順順宮帽打開、異質核心碎掉時呼叫）
function tryEquipDrop(id, x, y) {
  if (MAP_SAFE || equipState.owned[id] || Math.random() >= (EQUIP_DROPS[id] || 0)) return;
  if (grantEquipment(id, '撿到了特殊裝備') && typeof flash === 'function') flash(equipDef(id).icon + ' ' + equipDef(id).name, x, y - 40, '#ffd479', 2.5);
}

// ---- 背包左邊的「部隊長裝備」----
let equipPick = null;   // 正在換哪一格
function equipIcon(def, cls = '') { return def.image ? '<img class="' + cls + '" src="' + def.image + '" alt="">' : '<i class="' + cls + '">' + def.icon + '</i>'; }
function renderEquipPanel() {
  const box = document.getElementById('equipPanel'); if (!box) return;
  // 紙娃娃：左邊溫特立繪（置中），4 個裝備格直排在右邊（頭部、身體、飾品、飾品）
  const pos = { head: 'tl', body: 'bl', acc1: 'tr', acc2: 'br' };
  const slots = EQUIP_SLOTS.map(s => {
    const id = equipState.equipped[s.id], def = id && equipDef(id);
    return '<button type="button" class="doll-slot doll-' + pos[s.id] + (def ? ' filled' : '') + (equipPick === s.id ? ' picking' : '') + '" data-equip-slot="' + s.id + '" title="' + s.name + (def ? '：' + def.name : '：未裝備') + '">' +
      '<span>' + (def ? equipIcon(def) : '＋') + '</span><small>' + (def ? def.name : s.name) + '</small>' + (def ? '<em>Lv' + equipState.owned[id] + '</em>' : '') + '</button>';
  }).join('');
  const art = '<img class="doll-art" src="' + EQUIP_PORTRAIT.image + '" alt="溫特" onerror="this.onerror=null;this.src=\'' + EQUIP_PORTRAIT.fallback + '\';this.classList.add(\'sprite\')">';
  const pickSlot = equipPick && EQUIP_SLOTS.find(s => s.id === equipPick);
  const worn = EQUIP_SLOTS.map(s => equipState.equipped[s.id]).filter(Boolean).map(id => { const d = equipDef(id); return '<li>' + equipIcon(d) + '<b>' + d.name + ' <em>Lv' + equipState.owned[id] + '</em></b><span>' + d.stat(d.levels[equipState.owned[id] - 1]) + '</span></li>'; }).join('');
  const weapons = Object.entries(WEAPON_UPGRADES).map(([k, w]) => '<div class="equip-weapon">' + equipIcon(w) + '<b>' + w.name + ' <em>Lv' + equipState.weapons[k] + '</em></b><span>' + w.stat(w.levels[equipState.weapons[k] - 1]) + '</span></div>').join('');
  const lamp = equipLv('headlamp') ? '<div class="equip-battery"><span>🔋 頭燈電量</span><b>' + Math.round(equipState.battery) + '%</b><i><u style="width:' + equipState.battery + '%"></u></i><small>背包裡的電池：' + (supplyInventory.get('battery') || 0) + ' 顆</small></div>' : '';
  box.innerHTML = '<h3>部隊長裝備</h3><div class="equip-doll">' + art + '<div class="doll-slots">' + slots + '</div></div>' +
    (pickSlot ? '<div class="equip-pick-title">換「' + pickSlot.name + '」</div>' + equipPicker(pickSlot) : '') +
    (worn ? '<h3>目前效果</h3><ul class="equip-worn">' + worn + '</ul>' : '') + lamp + '<h3>武器</h3>' + weapons + '<p class="equip-tip">升級裝備和武器：回基地找諾亞</p>';
}
function equipPicker(slot) {
  const def = EQUIPMENT.filter(e => slot.kinds.includes(e.kind) && equipState.owned[e.id]);
  const cur = equipState.equipped[slot.id];
  const rows = def.map(e => {
    const where = Object.entries(equipState.equipped).find(([k, v]) => v === e.id && k !== slot.id);
    return '<button type="button" class="equip-option' + (e.id === cur ? ' sel' : '') + '" data-equip-item="' + e.id + '">' + equipIcon(e) +
      '<b>' + e.name + ' <em>Lv' + equipState.owned[e.id] + '</em></b><span>' + e.stat(e.levels[equipState.owned[e.id] - 1]) + (where ? '（從另一格換過來）' : '') + '</span></button>';
  }).join('');
  return '<div class="equip-picker">' + (rows || '<p>還沒有這一格能用的裝備。回基地找諾亞開發看看。</p>') +
    (cur ? '<button type="button" class="equip-unequip">卸下</button>' : '') + '</div>';
}
document.addEventListener('click', e => {
  if (!e.target.closest || !e.target.closest('#equipPanel')) return;
  const slot = e.target.closest('[data-equip-slot]');
  if (slot) { equipPick = equipPick === slot.dataset.equipSlot ? null : slot.dataset.equipSlot; sfx('menu'); renderEquipPanel(); return; }
  const opt = e.target.closest('[data-equip-item]');
  if (opt && equipPick) {
    const id = opt.dataset.equipItem;
    for (const k of Object.keys(equipState.equipped)) if (equipState.equipped[k] === id) equipState.equipped[k] = null;   // 同一件只能穿一格
    equipState.equipped[equipPick] = id; equipPick = null; saveEquipment(); sfx('button'); renderEquipPanel(); return;
  }
  if (e.target.closest('.equip-unequip') && equipPick) { equipState.equipped[equipPick] = null; equipPick = null; saveEquipment(); sfx('switch'); renderEquipPanel(); }
});

// ---- 諾亞的開發工坊 ----
let workshopEl = null, workshopOpen = false;
function ensureWorkshop() {
  if (workshopEl) return;
  workshopEl = document.createElement('div'); workshopEl.id = 'workshop'; workshopEl.className = 'hidden';
  workshopEl.addEventListener('click', e => {
    if (e.target === workshopEl || e.target.closest('.workshop-close')) { closeWorkshop(); return; }
    const b = e.target.closest('[data-ws]'); if (!b) return;
    const [kind, id] = b.dataset.ws.split(':');
    workshopBuy(kind, id);
  });
  document.getElementById('wrap').appendChild(workshopEl);
}
function spendCrystals(n) {
  if (training.crystals < n) { sfx('error'); systemNotice('異質碎片不夠（還差 ' + (n - training.crystals) + ' 個）', true); return false; }
  training.crystals -= n; saveTraining(); if (typeof updateHUD === 'function') updateHUD(); return true;
}
function workshopBuy(kind, id) {
  if (kind === 'dev') {
    const def = equipDef(id); if (!def || equipState.owned[id] || def.source !== 'develop') return;
    if (!spendCrystals(def.cost[0])) return;
    grantEquipment(id, '諾亞開發好了');
  } else if (kind === 'up') {
    const def = equipDef(id), lv = equipState.owned[id]; if (!def || !lv || lv >= 3) return;
    if (!spendCrystals(def.cost[lv])) return;
    equipState.owned[id] = lv + 1; saveEquipment(); SFX.play('achievement', .7, 'equip-up');
    systemNotice('🔧 「' + def.name + '」升到 Lv' + (lv + 1));
  } else if (kind === 'wp') {
    const w = WEAPON_UPGRADES[id], lv = equipState.weapons[id]; if (!w || lv >= 3) return;
    if (!spendCrystals(w.cost[lv - 1])) return;
    equipState.weapons[id] = lv + 1; saveEquipment(); applyWeaponLevels(); SFX.play('achievement', .7, 'equip-up');
    systemNotice('🔧 「' + w.name + '」升到 Lv' + (lv + 1));
  }
  renderWorkshop();
}
function renderWorkshop() {
  const row = (icon, name, lvText, stat, next, btn) => '<div class="ws-row"><span class="ws-icon">' + icon + '</span><div class="ws-text"><b>' + name + lvText + '</b><span>' + stat + '</span>' + (next ? '<small>' + next + '</small>' : '') + '</div>' + btn + '</div>';
  const cost = n => '<b>◆ ' + n + '</b>';
  const gear = EQUIPMENT.map(def => {
    const lv = equipState.owned[def.id], icon = equipIcon(def);
    if (!lv) {
      if (def.source !== 'develop') return row(icon, def.name, '', def.desc, '只能在戰鬥區域取得：' + def.where, '<button type="button" class="ws-btn" disabled>尚未取得</button>');
      return row(icon, def.name, '', def.desc, 'Lv1：' + def.stat(def.levels[0]), '<button type="button" class="ws-btn" data-ws="dev:' + def.id + '">開發 ' + cost(def.cost[0]) + '</button>');
    }
    if (lv >= 3) return row(icon, def.name, ' <em>Lv3</em>', def.stat(def.levels[2]), '', '<button type="button" class="ws-btn" disabled>已達最高等級</button>');
    return row(icon, def.name, ' <em>Lv' + lv + '</em>', def.stat(def.levels[lv - 1]), '升到 Lv' + (lv + 1) + '：' + def.stat(def.levels[lv]), '<button type="button" class="ws-btn" data-ws="up:' + def.id + '">升級 ' + cost(def.cost[lv]) + '</button>');
  }).join('');
  const weapons = Object.entries(WEAPON_UPGRADES).map(([k, w]) => {
    const lv = equipState.weapons[k];
    return row(equipIcon(w), w.name, ' <em>Lv' + lv + '</em>', w.stat(w.levels[lv - 1]), lv < 3 ? '升到 Lv' + (lv + 1) + '：' + w.stat(w.levels[lv]) : '',
      lv < 3 ? '<button type="button" class="ws-btn" data-ws="wp:' + k + '">升級 ' + cost(w.cost[lv - 1]) + '</button>' : '<button type="button" class="ws-btn" disabled>已達最高等級</button>');
  }).join('');
  workshopEl.innerHTML = '<section class="workshop-card" role="dialog" aria-modal="true" aria-label="諾亞的開發工坊">' +
    '<header class="workshop-head"><div class="workshop-title"><small>諾亞的開發工坊</small><h2>裝備開發・升級</h2><p>用異質碎片開發新裝備，或把裝備、武器升級</p></div>' +
    '<span class="workshop-wallet"><small>異質碎片</small><b>◆ ' + training.crystals + '</b></span><button type="button" class="workshop-close" aria-label="關閉（Esc）">×</button></header>' +
    '<div class="workshop-body"><h3>裝備</h3>' + gear + '<h3>武器</h3>' + weapons + '</div></section>';
}
function openWorkshop() {
  ensureWorkshop(); if (typeof closeDialogue === 'function') closeDialogue(true);
  workshopOpen = true; Object.keys(keys).forEach(k => { keys[k] = false; });
  renderWorkshop(); workshopEl.classList.remove('hidden'); sfx('menu');
}
function closeWorkshop(silent = false) { if (!workshopOpen) return; workshopOpen = false; workshopEl.classList.add('hidden'); if (!silent) sfx('switch'); }
window.addEventListener('keydown', e => { if (workshopOpen && e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); closeWorkshop(); } }, true);
// 和諾亞對話時，對話框多一個「🔧 開發工坊」按鈕（game.js 的 openDialogue／closeDialogue 呼叫）
function onDialogueOpenedWorkshop(actor) {
  const btn = document.getElementById('dialogueWorkshop'); if (!btn) return;
  btn.classList.toggle('hidden', !(actor && actor.id === 'noah' && MAP_SAFE));
}
document.getElementById('dialogueWorkshop')?.addEventListener('click', openWorkshop);

applyWeaponLevels();
