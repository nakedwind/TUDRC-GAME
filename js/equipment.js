// ============================================================
//  部隊長（溫特）的裝備
//  ・背包左邊「部隊長裝備」：換裝（頭部、上身、下身 ×2、隨身物品 ×2），看武器等級、手電筒電量。
//  ・照明：照明頭盔（頭部，身邊一小圈光）、高亮度手電筒（隨身物品，朝滑鼠方向的扇形光，要電池）。
//  ・道具：急救包（H）、腎上腺素是背包裡的消耗品（data/supplies.js），下方資訊條也有按鈕（腎上腺素沒有快捷鍵，用快捷欄 1～0 或背包）。
//  ・找諾亞對話 →「🔧 開發工坊」：用異質碎片開發新裝備、升級裝備和武器。
//  ・特殊裝備（異質探測器）只能在戰鬥區域拿到。
//  ・資料、數值在 data/equipment.js；進度存在瀏覽器（localStorage）。
// ============================================================
const EQUIP_STORE = 'tudrc_equipment_v1';
const WS_KEEP_WEAPON = 'pistol';   // 溫特一開始就持有的手槍：不能分解，也不能用任何方式丟掉
const equipState = { owned: {}, equipped: { head: null, body: null, legs1: null, legs2: null, acc1: null, acc2: null }, weapons: { pistol: 1, flare: 1, incendiary: 0, tranq: 0 }, loadout: { main: 'pistol', sub: null }, gunAmmo: {}, bullets: null, battery: 100, scrapped: {} };   // scrapped：開發工坊分解掉的武器（一開始就有的也不會再補回來）
const EQUIP_TO_ITEM = ['thermos', 'firstaid', 'adrenaline', 'charm'];   // 以前是裝備、現在改成道具：舊存檔有的話換成 1 個道具
let equipLegacyItems = [];
// 開發工坊編輯器刪掉的裝備／武器：對玩家來說就是永久從遊戲消失——存檔裡拿到的也清掉（之後就算在編輯器復原，也要重新取得）。
// 資料本身（data/equipment.js）沒有刪，只是遊戲裡不出現。
let equipPurged = false;
try {
  const s = JSON.parse(localStorage.getItem(EQUIP_STORE) || '{}');
  if (s.owned) equipLegacyItems = EQUIP_TO_ITEM.filter(id => s.owned[id]);
  if (s.owned) for (const [id, lv] of Object.entries(s.owned)) {
    const d = EQUIPMENT.find(e => e.id === id);
    if (d) equipState.owned[id] = Math.max(1, Math.min(d.levels.length, lv | 0));   // 最高＝這件有幾級（EQUIP_MAX_LV）
    else equipPurged = true;   // 清單裡沒有了（被刪掉的）：不留
  }
  if (s.equipped) for (const k of Object.keys(equipState.equipped)) if (s.equipped[k] && equipState.owned[s.equipped[k]]) equipState.equipped[k] = s.equipped[k];
  // 舊存檔：頭燈／手持格的手電筒改放到空著的隨身物品格；穿在不對的格子的裝備卸下
  const oldLamp = (s.equipped && s.equipped.hand === 'headlamp') || equipState.equipped.head === 'headlamp';
  if (equipState.equipped.head === 'headlamp') equipState.equipped.head = null;
  if (oldLamp && equipState.owned.headlamp && !Object.values(equipState.equipped).includes('headlamp')) {
    const free = ['acc1', 'acc2'].find(k => !equipState.equipped[k]); if (free) equipState.equipped[free] = 'headlamp';
  }
  // 舊存檔：鞋子以前穿在隨身物品（10/22 測試版是單一「下身」格 legs），現在有自己的「下身1／下身2」格 → 搬到空著的下身格（都滿了就卸下）
  if (s.equipped && s.equipped.legs && equipState.owned[s.equipped.legs] && !Object.values(equipState.equipped).includes(s.equipped.legs)) equipState.equipped.legs1 = equipState.equipped.legs1 || s.equipped.legs;
  for (const k of ['acc1', 'acc2']) { const d = EQUIPMENT.find(e => e.id === equipState.equipped[k]); if (d && d.kind === 'legs') { const free = ['legs1', 'legs2'].find(x => !equipState.equipped[x]); if (free) equipState.equipped[free] = d.id; equipState.equipped[k] = null; } }
  for (const slot of EQUIP_SLOTS) { const id = equipState.equipped[slot.id], d = id && EQUIPMENT.find(e => e.id === id); if (d && !slot.kinds.includes(d.kind)) equipState.equipped[slot.id] = null; }
  if (s.scrapped && typeof s.scrapped === 'object') for (const k of Object.keys(s.scrapped)) if (WEAPON_UPGRADES[k] && k !== WS_KEEP_WEAPON) equipState.scrapped[k] = true;
  if (s.weapons) for (const k of Object.keys(equipState.weapons)) if (Number.isFinite(s.weapons[k])) equipState.weapons[k] = Math.max(WEAPON_UPGRADES[k].field || equipState.scrapped[k] ? 0 : 1, Math.min(WEAPON_UPGRADES[k].levels.length, s.weapons[k] | 0));   // 後室撿的槍：0＝還沒拿到
  if (s.gunAmmo) for (const [k, a] of Object.entries(s.gunAmmo)) if (WEAPON_UPGRADES[k] && a) equipState.gunAmmo[k] = { mag: Math.max(0, a.mag | 0), reserve: Math.max(0, a.reserve | 0) };
  if (Number.isFinite(s.battery)) equipState.battery = Math.max(0, Math.min(100, s.battery));
  if (s.magazine && typeof s.magazine === 'object') equipState.magazine = { lv: s.magazine.lv | 0 || 1, load: Array.isArray(s.magazine.load) ? s.magazine.load.filter(id => id === null || BULLETS[id]) : [] };   // 彈匣（js/magazine.js）
  if (s.loadout) for (const k of ['main', 'sub']) if (s.loadout[k] === null || WEAPON_UPGRADES[s.loadout[k]]) equipState.loadout[k] = s.loadout[k];
  // 手槍的子彈（js/flare.js 的 bulletState）：owned 拿到過哪幾種、n 剩幾發
  if (s.bullets && s.bullets.owned && s.bullets.n) {
    equipState.bullets = { owned: { flare: true }, n: {} };
    for (const id of Object.keys(BULLETS)) if (id !== 'pistol') {
      if (s.bullets.owned[id]) equipState.bullets.owned[id] = true;
      if (Number.isFinite(s.bullets.n[id])) equipState.bullets.n[id] = Math.max(0, Math.min(BULLETS[id].max, s.bullets.n[id] | 0));
    }
  } else {   // 舊存檔：以前撿到的燃燒彈槍、麻醉槍＝拿到這種子彈，槍裡和備用的彈藥加起來；照明彈補滿
    equipState.bullets = { owned: { flare: true }, n: { flare: BULLETS.flare.max } };
    for (const id of ['incendiary', 'tranq']) if ((s.weapons && s.weapons[id] > 0) || (s.gunAmmo && s.gunAmmo[id])) {
      const a = (s.gunAmmo && s.gunAmmo[id]) || {};
      equipState.bullets.owned[id] = true; equipState.bullets.n[id] = Math.min(BULLETS[id].max, (a.mag | 0) + (a.reserve | 0));
    }
  }
} catch (_) {}
if (!equipState.bullets) equipState.bullets = { owned: { flare: true }, n: { flare: BULLETS.flare.max } };
for (const [k, w] of Object.entries(WEAPON_UPGRADES)) if (w.removed && (equipState.weapons[k] > 0 || equipState.gunAmmo[k])) {   // 刪掉的武器：等級、彈藥都清掉
  equipState.weapons[k] = 0; delete equipState.gunAmmo[k]; equipPurged = true;
}
// 測試用：解鎖所有槍、彈藥補滿（data/equipment.js 的 TEST_UNLOCK_ALL_GUNS）
if (typeof TEST_UNLOCK_ALL_GUNS !== 'undefined' && TEST_UNLOCK_ALL_GUNS) {
  for (const [id, w] of Object.entries(WEAPON_UPGRADES)) {
    if (w.removed || (w.field && !(equipState.weapons[id] > 0))) continue;   // 燃燒彈槍、麻醉槍：只能在置物櫃拿到，測試模式也不直接給；刪掉的武器不給
    if (!(equipState.weapons[id] > 0)) equipState.weapons[id] = 1;
    if (w.field) { const lv = w.levels[equipState.weapons[id] - 1]; equipState.gunAmmo[id] = { mag: id === 'tranq' ? lv.mag : 1, reserve: lv.reserve }; }
  }
  for (const id of Object.keys(BULLETS)) if (id !== 'pistol' && !BULLETS[id].removed) { equipState.bullets.owned[id] = true; equipState.bullets.n[id] = BULLETS[id].max; }
}
// ---- 武器：溫特只有一把手槍（換的是子彈，js/flare.js），背包、工坊的紙娃娃不放武器格 ----
const WEAPON_SLOTS = [];
const weaponHave = id => !!WEAPON_UPGRADES[id] && !WEAPON_UPGRADES[id].removed && (equipState.weapons[id] || 0) > 0;   // removed＝開發工坊編輯器刪掉的武器
function fixLoadout() {   // 一定拿著手槍
  equipState.loadout.main = 'pistol'; equipState.loadout.sub = null;
}
fixLoadout();
if (equipPurged) saveEquipment();   // 刪掉的東西馬上從存檔清掉
const weaponInLoadout = id => equipState.loadout.main === id || equipState.loadout.sub === id;
function saveEquipment() { try { localStorage.setItem(EQUIP_STORE, JSON.stringify(equipState)); } catch (_) {} }
// 舊存檔的裝備換成道具：等背包讀完檔（js/save.js 的 loadGame）再放進去，只做一次
if (equipLegacyItems.length) window.addEventListener('DOMContentLoaded', () => setTimeout(() => {
  for (const id of equipLegacyItems) supplyInventory.set(id, (supplyInventory.get(id) || 0) + 1);
  saveEquipment(); if (typeof saveGame === 'function') saveGame();
  const names = equipLegacyItems.map(id => (itemById(id) || {}).name).filter(Boolean).join('、');
  setTimeout(() => { if (typeof systemNotice === 'function') systemNotice('「' + names + '」改成道具了，已經放進背包'); }, 1800);
}, 0));

const equipDef = id => EQUIPMENT.find(e => e.id === id) || null;
const isEquipped = id => Object.values(equipState.equipped).includes(id);
// 有裝備的話回傳這一級的數值，沒裝備就回傳 null
function equipLv(id) {
  if (!isEquipped(id)) return null;
  const def = equipDef(id); return def ? def.levels[(equipState.owned[id] || 1) - 1] : null;
}

// ---- 效果（其他程式呼叫）----
const equipPlayerDamage = d => { const v = equipLv('vest'), h = equipLv('helmet'); return d * (v ? 1 - v.guard : 1) * (h ? 1 - h.guard : 1); };   // 防護背心、防護頭盔：溫特受到的傷害
const equipFireMul = () => { const v = equipLv('fireboots'); return v ? 1 - v.fire : 1; };   // 防火鞋：火海燙傷（js/oil-barrels.js）
const equipAcidMul = () => { const v = equipLv('mask'), b = equipLv('acidboots'); return (v ? 1 - v.filter : 1) * (b ? 1 - b.corrode : 1); };   // 防腐鞋：一起減（可疊加）   // 防毒面具：腐蝕池、酸液的傷害
const equipSootheCost = c => { const v = equipLv('bracelet'); return v ? Math.round(c * (1 - v.save)) : c; };   // 共感手環：疏導花的 SP
const equipSpeedMul = () => { const v = equipLv('sneakers'); return (v ? 1 + v.speed : 1) * adrenalineSpeedMul(); };   // 輕量跑鞋、腎上腺素（道具）
// 降噪耳機＋手電筒亮著（黑暗恐懼）：理智下降的影響減少多少（最多減 90%）
const equipCalm = () => { const v = equipLv('earmuffs'), f = flashlightOn() ? equipLv('headlamp').fear : 0, h = equipLv('lamphelmet'); return Math.min(.9, (v ? v.calm : 0) + f + (h && !MAP_SAFE ? h.fear : 0)); };   // 照明頭盔也算
const flashlightOn = () => !!(equipLv('headlamp') && !MAP_SAFE && equipState.battery > 0);
// 無線電：疏導距離（js/game.js）、指派時隊員跑更快（js/sentry.js）
const equipTalkReach = () => { const v = equipLv('radio'); return v && !MAP_SAFE ? 1 + v.reach : 1; };
const equipRushMul = () => { const v = equipLv('radio'); return v && v.rush ? 1 + v.rush : 1; };
// 照明（js/lighting.js 的 getLights 呼叫，只有戰鬥區域）：
//   照明頭盔＝溫特身邊一小圈光；高亮度手電筒（有電時）＝朝滑鼠方向的扇形光，照得遠
function equipLight() {
  if (MAP_SAFE || !G || !G.player) return [];
  const p = G.player, L = [], h = equipLv('lamphelmet'), v = equipLv('headlamp');
  // smooth：畫面上用平滑的形狀挖開黑幕（js/lighting.js），遊戲判定照樣用格子
  if (h) L.push({ x: p.x, y: p.y - 10, r: h.light, smooth: true, helmet: true });
  if (v && equipState.battery > 0) L.push({ x: p.x, y: p.y + FLASH_BEAM.dy, r: v.light, smooth: true, cone: { ang: flashlightAngle(), half: v.spread * Math.PI / 180 } });
  return L;
}
// 手電筒光束的外觀：dy＝起點在溫特腳底往上／下幾像素（手的高度）；r0＝起點離手多遠（圓弧，不是尖角）；
// body＝溫特身體的範圍（橢圓：中心往上 cy、半寬 rx、半高 ry；soft＝柔邊往外延伸幾倍），暖黃色那層在這裡慢慢淡掉，不會壓在溫特身上
// color＝光的顏色（偏暖黃）、alpha＝暖黃色那層多濃、reveal＝把黑幕掀開多少（1＝全亮）
// edge＝兩側淡出的寬度（弧度，越大邊緣越柔）、fadeIn＝起點從暗到亮的距離、falloff＝越遠越淡的速度（越大越快暗）
// halo＝溫特身邊的小光暈半徑（像素；要比照明頭盔的光圈小）、haloTall＝光暈上下拉長幾倍（1＝正圓）
// 照明頭盔的圓形光（畫面）：size＝畫出來的半徑是照明半徑的幾倍（外圈柔邊會比較暗，所以畫大一點看起來才一樣大）、core＝中間全亮的部分佔多少
const HELMET_LIGHT = { size: 1.4, core: .2 };
const FLASH_BEAM = { dy: 2, r0: 16, body: { cy: -16, rx: 17, ry: 30, soft: 3 }, color: [255, 228, 160], alpha: .3, reveal: .95, edge: .22, fadeIn: 30, falloff: 1.1, halo: 34, haloTall: 1.2 };
// 手電筒照的方向：滑鼠在遊戲畫面上就朝滑鼠，不然朝溫特面向的方向
function flashlightAngle() {
  const p = G.player;
  if (aimClient && typeof clientToWorld === 'function') { const a = clientToWorld(aimClient.x, aimClient.y); if (Math.hypot(a.x - p.x, a.y - p.y) > 8) return Math.atan2(a.y - (p.y + FLASH_BEAM.dy), a.x - p.x); }
  return { left: Math.PI, right: 0, back: -Math.PI / 2, front: Math.PI / 2 }[p.dir] ?? Math.PI / 2;
}
// 光束圖（朝右，亮度 0～1）：每個像素用平滑曲線算，兩側、起點、遠處都自然淡出；只在大小或角度變了才重算
let flashBeamTex = null;
function flashBeamTexture(R, half, r0) {
  const key = [R, half, r0, FLASH_BEAM.edge, FLASH_BEAM.fadeIn, FLASH_BEAM.falloff, FLASH_BEAM.color].join();
  if (flashBeamTex && flashBeamTex.key === key) return flashBeamTex.canvas;
  const outer = half + FLASH_BEAM.edge, W = Math.ceil(R), H = Math.ceil(2 * R * Math.sin(Math.min(outer, Math.PI / 2))) + 2;
  const cv2 = document.createElement('canvas'); cv2.width = W; cv2.height = H;
  const c2 = cv2.getContext('2d'), img = c2.createImageData(W, H), d = img.data;
  const [cr, cg, cb] = FLASH_BEAM.color, smooth = t => t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const dx = x + .5, dy = y + .5 - H / 2, dist = Math.hypot(dx, dy); if (dist > R) continue;
    const a = Math.abs(Math.atan2(dy, dx));
    const side = smooth((outer - a) / (FLASH_BEAM.edge * 2));                 // 兩側：從邊緣往裡慢慢變亮
    const start = smooth((dist - r0) / FLASH_BEAM.fadeIn);                     // 起點：圓弧狀，從暗慢慢變亮
    const fall = Math.pow(1 - dist / R, FLASH_BEAM.falloff);                   // 越遠越淡
    const k = side * start * fall; if (k <= 0) continue;
    const i = (y * W + x) * 4; d[i] = cr; d[i + 1] = cg; d[i + 2] = cb; d[i + 3] = Math.round(Math.min(1, k) * 255);
  }
  c2.putImageData(img, 0, 0);
  flashBeamTex = { key, canvas: cv2 };
  return cv2;
}
// 這一幀溫特身上的燈（畫面範圍大小的一張圖）：頭燈的圓形光、手電筒的光束＋身邊小光暈，再用 mask（照得到的格子）把牆後面去掉。
// js/lighting.js 的 drawDarkness 拿它把黑幕挖開；回傳 null＝頭燈、手電筒都沒有
const beamLayer = { cv: document.createElement('canvas'), mask: document.createElement('canvas') };
function flashlightBeamLayer(mask) {
  const lights = equipLight(), l = lights.find(x => x.cone), helmet = lights.find(x => x.helmet);
  if (!l && !helmet) return null;
  const p = G.player;
  const x0 = Math.floor(cam.x) - 2, y0 = Math.floor(cam.y) - 2, W = Math.ceil(viewW()) + 4, H = Math.ceil(viewH()) + 4;
  const cv2 = beamLayer.cv; if (cv2.width !== W || cv2.height !== H) { cv2.width = W; cv2.height = H; }
  const c2 = cv2.getContext('2d');
  c2.setTransform(1, 0, 0, 1, 0, 0); c2.globalCompositeOperation = 'source-over'; c2.clearRect(0, 0, W, H);
  c2.translate(-x0, -y0);
  const [cr, cg, cb] = FLASH_BEAM.color, col = a => 'rgba(' + cr + ',' + cg + ',' + cb + ',' + a + ')';
  // 頭燈：平滑的圓形光（中間全亮，外圈慢慢淡掉）
  if (helmet) {
    const hr = helmet.r * HELMET_LIGHT.size, g = c2.createRadialGradient(helmet.x, helmet.y, 0, helmet.x, helmet.y, hr);
    g.addColorStop(0, col(1)); g.addColorStop(HELMET_LIGHT.core, col(.92)); g.addColorStop(.75, col(.35)); g.addColorStop(1, col(0));
    c2.fillStyle = g; c2.beginPath(); c2.arc(helmet.x, helmet.y, hr, 0, Math.PI * 2); c2.fill();
  }
  if (l) drawFlashlightShape(c2, l, p, col);
  // 牆後面不亮：照得到的格子（一格一像素）平滑放大後，只留重疊的部分
  const m = beamLayer.mask; if (m.width !== COLS || m.height !== ROWS) { m.width = COLS; m.height = ROWS; }
  const mc = m.getContext('2d'), mi = mc.createImageData(COLS, ROWS);
  for (let i = 0; i < mask.length; i++) mi.data[i * 4 + 3] = mask[i] > 0 ? 255 : 0;
  mc.putImageData(mi, 0, 0);
  c2.globalCompositeOperation = 'destination-in'; c2.imageSmoothingEnabled = true;
  c2.drawImage(m, OX, OY, COLS * CELL, ROWS * CELL);
  return { cv: cv2, x: x0, y: y0 };
}
// 手電筒：身邊的直橢圓小光暈＋光束
function drawFlashlightShape(c2, l, p, col) {
  const { ang, half } = l.cone, R = l.r * .95;
  const hx = p.x, hy = p.y + FLASH_BEAM.body.cy, hr = FLASH_BEAM.halo;
  const g = c2.createRadialGradient(hx, hy, 0, hx, hy, hr);
  g.addColorStop(0, col(.85)); g.addColorStop(.55, col(.45)); g.addColorStop(1, col(0));
  c2.save(); c2.translate(hx, hy); c2.scale(1, FLASH_BEAM.haloTall); c2.translate(-hx, -hy);   // 拉長成直的橢圓（包住整個人）
  c2.fillStyle = g; c2.beginPath(); c2.arc(hx, hy, hr, 0, Math.PI * 2); c2.fill(); c2.restore();
  // 光束
  const tex = flashBeamTexture(R, half, FLASH_BEAM.r0);
  c2.save(); c2.translate(l.x, l.y); c2.rotate(ang); c2.drawImage(tex, 0, -tex.height / 2); c2.restore();
}
// 頭燈、手電筒在 (x, y) 的畫面亮度（0～1），跟 flashlightBeamLayer 畫出來的形狀一樣；牆後面（beamMask 沒標到的格子）是 0
function equipLightAt(x, y) {
  const lights = equipLight(); if (!lights.length || typeof beamMask === 'undefined') return 0;
  const [c, r] = cellAt(x, y); if (!inGrid(c, r) || !beamMask[r * COLS + c]) return 0;
  let k = 0;
  const smooth = t => t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t);
  for (const l of lights) {
    if (l.helmet) {
      const t = Math.hypot(x - l.x, y - l.y) / (l.r * HELMET_LIGHT.size);
      k = Math.max(k, t >= 1 ? 0 : t <= HELMET_LIGHT.core ? 1 : 1 - (t - HELMET_LIGHT.core) / (1 - HELMET_LIGHT.core));
    } else if (l.cone) {
      const p = G.player, hx = p.x, hy = p.y + FLASH_BEAM.body.cy;
      const ht = Math.hypot((x - hx) / FLASH_BEAM.halo, (y - hy) / (FLASH_BEAM.halo * FLASH_BEAM.haloTall));
      if (ht < 1) k = Math.max(k, .85 * (1 - ht));
      const R = l.r * .95, dx = x - l.x, dy = y - l.y, dist = Math.hypot(dx, dy); if (dist > R) continue;
      let a = Math.abs(Math.atan2(dy, dx) - l.cone.ang); if (a > Math.PI) a = 2 * Math.PI - a;
      const outer = l.cone.half + FLASH_BEAM.edge;
      k = Math.max(k, smooth((outer - a) / (FLASH_BEAM.edge * 2)) * smooth((dist - FLASH_BEAM.r0) / FLASH_BEAM.fadeIn) * Math.pow(1 - dist / R, FLASH_BEAM.falloff));
    }
  }
  return k * FLASH_BEAM.reveal;
}
// 暖黃色那層：疊在黑幕上面。溫特身體那塊用「漸層」慢慢淡掉（不是一刀剪掉），才不會看到一圈硬邊
const beamTint = document.createElement('canvas');
function drawFlashlightBeam(ctx, beam) {
  if (!beam) return;
  const p = G.player, b = FLASH_BEAM.body, W = beam.cv.width, H = beam.cv.height;
  if (beamTint.width !== W || beamTint.height !== H) { beamTint.width = W; beamTint.height = H; }
  const t = beamTint.getContext('2d');
  t.setTransform(1, 0, 0, 1, 0, 0); t.globalCompositeOperation = 'source-over'; t.clearRect(0, 0, W, H);
  t.drawImage(beam.cv, 0, 0);
  // 身體：橢圓形的柔邊遮罩（中間全挖、往外慢慢恢復），用圓形漸層再壓扁成橢圓
  t.globalCompositeOperation = 'destination-out';
  t.translate(p.x - beam.x, p.y + b.cy - beam.y); t.scale(1, b.ry / b.rx);
  const R = b.rx * b.soft, g = t.createRadialGradient(0, 0, 0, 0, 0, R);
  g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(.45, 'rgba(0,0,0,.9)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  t.fillStyle = g; t.beginPath(); t.arc(0, 0, R, 0, Math.PI * 2); t.fill();
  ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = FLASH_BEAM.alpha;
  ctx.drawImage(beamTint, beam.x, beam.y);
  ctx.restore();
}
// 武器等級套到實際數值（手槍：傷害、彈匣、裝填；照明彈槍：照明秒數、持有上限）
function applyWeaponLevels() {
  // 開發工坊編輯器刪掉的槍是 0 級（沒有）：數值先用 Lv1 的，反正拿不到、用不到
  const lvOf = id => WEAPON_UPGRADES[id].levels[Math.max(1, equipState.weapons[id] || 0) - 1];
  const p = lvOf('pistol');
  if (typeof PLAYER_ATK !== 'undefined') { PLAYER_ATK.dmg = p.dmg; PLAYER_ATK.mag = p.mag; PLAYER_ATK.reloadTime = p.reload; PLAYER_ATK.double = (Number(p.double) || 0) / 100; }   // double：快速射擊的連發機率
  if (typeof FLARE !== 'undefined') { FLARE.burn = BULLETS.flare.shine; FLARE.reserveMax = BULLETS.flare.max; }   // 照明彈：固定，不會升級（data/equipment.js 的 BULLETS）
}

// ---- 道具：背包裡有幾個、用掉一個 ----
const itemCount = id => supplyInventory.get(id) || 0;
function consumeItem(id) { const n = itemCount(id); if (n <= 1) supplyInventory.delete(id); else supplyInventory.set(id, n - 1); if (typeof backpackOpen !== 'undefined' && backpackOpen) renderBackpack(); }
// ---- 腎上腺素（道具，J）----
const adrenaline = { until: 0, sideUntil: 0 };
const nowSec = () => performance.now() / 1000;
const adrenalineActive = () => nowSec() < adrenaline.until;
function adrenalineSpeedMul() {
  const t = nowSec();
  if (t < adrenaline.until) return 1 + ADRENALINE.speed;
  if (t < adrenaline.sideUntil) return 1 - ADRENALINE.slow;   // 藥效退了：副作用變慢
  return 1;
}
function useAdrenaline() {
  if (!G?.player || G.player.hp <= 0) return;
  if (itemCount('adrenaline') <= 0) { sfx('error'); flash('沒有腎上腺素了', G.player.x, G.player.y - 54, '#c9d3dc'); return; }
  if (MAP_SAFE) { sfx('error'); flash('在戰鬥區域才能用', G.player.x, G.player.y - 54, '#c9d3dc'); return; }
  const t = nowSec();
  if (adrenalineActive()) { sfx('error'); flash('腎上腺素還在生效', G.player.x, G.player.y - 54, '#c9d3dc'); return; }
  consumeItem('adrenaline');
  adrenaline.until = t + ADRENALINE.dur; adrenaline.sideUntil = adrenaline.until + ADRENALINE.side;
  flash('💉 腎上腺素！', G.player.x, G.player.y - 54, '#ff8a8a', 1.4); sfx('soothe');
  G.effects.push({ ring: true, x: G.player.x, y: G.player.y, r: 6, r2: 40, life: .35, life0: .35, color: '#ff8a8a' });
}
// ---- 急救包（道具，H）：先點左上角的隊員頭像，選要治療誰（倒地的也行） ----
// ・不能用在溫特自己身上：溫特補血請用醫療包。
// ・按 H 或點下方的「急救包」按鈕 → 進入「選隊員」：滑鼠停在哪位隊員的頭像上，那位就會發光＋出現箭頭（樣式在 css/style.css）。
//   急救包按鈕上方也會出現一排隊員小頭像，點那裡也可以選。
// ・大家都沒有受傷：提示「沒有人受傷」，不能用。
// ・點頭像＝治療那位隊員（要站在他旁邊 FIRST_AID.reach 格內）；滿血、太遠時，溫特頭上會浮出「沒有受傷」「距離太遠了」。
// ・再按一次 H／急救包按鈕、按 Esc、按右鍵或點地圖＝取消。
const firstAid = { channel: null, picking: false, hover: null };
// 急救包（firstaid）只能幫還站著的隊員補血；異質急救包（anomaly-firstaid）才能救回倒下的隊員（HP 變 FIRST_AID.reviveHp）
const aidKits = () => itemCount('firstaid') + itemCount('anomaly-firstaid');
const aidKitFor = t => (t.hp <= 0 ? 'anomaly-firstaid' : 'firstaid');   // 這位隊員要用哪一種急救包
const aidUsableOn = t => !!t && (t.hp <= 0 ? itemCount('anomaly-firstaid') > 0 : t.hp < t.maxhp && itemCount('firstaid') > 0);
function useFirstAid() {
  if (!G?.player || G.player.hp <= 0 || firstAid.channel) return;
  if (firstAid.picking) { cancelFirstAidPick(); return; }   // 再按一次＝取消
  if (aidKits() <= 0) { sfx('error'); flash('沒有急救包了', G.player.x, G.player.y - 54, '#c9d3dc'); return; }
  if (MAP_SAFE) { sfx('error'); flash('在戰鬥區域才能用', G.player.x, G.player.y - 54, '#c9d3dc'); return; }
  if (!(G.towers || []).length) { sfx('error'); flash('沒有可以治療的隊員', G.player.x, G.player.y - 54, '#c9d3dc'); return; }
  if (!G.towers.some(aidUsableOn)) {
    const downedOnly = G.towers.some(t => t.hp <= 0) && !G.towers.some(t => t.hp > 0 && t.hp < t.maxhp);
    sfx('aidCannot'); flash(downedOnly ? '要用異質急救包才能救回倒下的隊員' : itemCount('firstaid') <= 0 && G.towers.some(t => t.hp > 0 && t.hp < t.maxhp) ? '沒有急救包了' : '沒有人受傷', G.player.x, G.player.y - 54, '#c9d3dc'); return;
  }
  firstAid.picking = true; firstAid.hover = null;
  sfx('menu');
  flash('⛑️ 選擇要治療的隊員', G.player.x, G.player.y - 54, '#9ff0c0', 1.8);
  refreshFirstAidPick();
}
function cancelFirstAidPick() {
  if (!firstAid.picking) return;
  firstAid.picking = false; firstAid.hover = null;
  refreshFirstAidPick();
}
function refreshFirstAidPick() {   // 下方按鈕、左上角隊員欄跟著更新
  gearQuickKey = ''; renderGearQuick();
  if (typeof applySquadCollapse === 'function') applySquadCollapse();   // 隊員欄收起來時：選隊員的期間先展開
  if (typeof renderFieldSquadHud === 'function') renderFieldSquadHud();
}
function showFirstAidTip(text) {   // 溫特頭上浮出的提示（往上飄、慢慢淡掉；跟「選擇要治療的隊員」同樣的樣子）
  sfx('error');
  flash('⛑️ ' + text, G.player.x, G.player.y - 54, '#9ff0c0', 1.4);
}
// 在「選隊員」時點了某位隊員的頭像
function firstAidPickMember(type) {
  const t = (G.towers || []).find(m => m.type === type);
  if (t) firstAidOn(t);
}
// 對這位隊員用急救包（選隊員頭像、或靠近按 F 都會走這裡）
function firstAidOn(t) {
  const p = G && G.player;
  if (!p || !t || p.hp <= 0 || firstAid.channel) return;
  if (MAP_SAFE) { sfx('error'); flash('在戰鬥區域才能用', p.x, p.y - 54, '#c9d3dc'); return; }
  if (t.hp <= 0 && itemCount('anomaly-firstaid') <= 0) { showFirstAidTip('要用異質急救包才能救回來'); return; }   // 倒下的隊員：一般急救包救不回來
  if (t.hp > 0 && t.hp >= t.maxhp) { showFirstAidTip('沒有受傷'); return; }   // 滿血不能用
  if (t.hp > 0 && itemCount('firstaid') <= 0) { cancelFirstAidPick(); sfx('error'); flash('沒有急救包了', p.x, p.y - 54, '#c9d3dc'); return; }
  if (Math.hypot(t.x - p.x, t.y - p.y) > FIRST_AID.reach * CELL) { showFirstAidTip('距離太遠了'); return; }   // 要走到隊員旁邊
  cancelFirstAidPick();
  const v = FIRST_AID;
  if (typeof playerChannel !== 'undefined' && playerChannel) return;   // 正在做別的事
  // 站著不動處理傷口：進度條跑完才治好（js/channel-actions.js；溫特和隊員都不能動）
  firstAid.channel = startChannel({ kind: 'firstaid', total: v.time, target: t, heal: v.heal, kit: aidKitFor(t), label: t.hp <= 0 ? '救援中' : '急救中', color: '#79dbad',
    onDone: finishFirstAid, onCancel: () => { firstAid.channel = null; if (SFX.fadeOut) SFX.fadeOut('first-aid-start', .3); } });
  if (firstAid.channel) SFX.play('aidStart', 1, 'first-aid-start');   // 開始急救：「補血」音效；急救完成時播「疏導」
}
// 選隊員時：按 Esc 取消（先攔下來，才不會同時打開別的選單）
window.addEventListener('keydown', e => {
  if (firstAid.picking && e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); cancelFirstAidPick(); }
}, true);
// 選隊員時：點地圖（或在地圖上按右鍵）＝取消
cv.addEventListener('pointerdown', () => { if (firstAid.picking) cancelFirstAidPick(); });
function finishFirstAid() {
  const c = firstAid.channel; firstAid.channel = null; if (!c || !G) return;
  const t = c.target, isPlayer = t === G.player, wasDown = !isPlayer && t.hp <= 0, kit = wasDown ? 'anomaly-firstaid' : 'firstaid';
  if (c.kit && c.kit !== kit) { showFirstAidTip('隊員倒下了，急救包救不回來'); return; }   // 急救到一半隊員倒下：一般急救包不能用
  if (itemCount(kit) <= 0) return;
  consumeItem(kit);
  if (wasDown) { t.hp = Math.max(1, Math.round(t.maxhp * FIRST_AID.reviveHp)); flash('✚ 救回來了！HP ' + t.hp, t.x, t.y - 50, '#79dbad', 1.8); }   // 異質急救包：HP 變 30%
  else { t.hp = Math.min(t.maxhp, t.hp + c.heal); flash('+' + c.heal, t.x, t.y - 50, '#79dbad', 1.6); }
  if (!isPlayer && wasDown && typeof sentryStatus === 'function') sentryStatus(t, '被溫特救起來了', '#79dbad');
  if (!isPlayer && wasDown && typeof addStat === 'function') addStat('revives');   // 成就：把倒下的隊員救回來
  for (let i = 0; i < 8; i++) G.effects.push({ ember: true, x: t.x + (Math.random() - .5) * 26, y: t.y - 10, vx: 0, vy: -40 - Math.random() * 30, r: 2, life: .7, life0: .7, color: '#9ff0c0' });
  sfx('soothe'); if (typeof updateHUD === 'function') updateHUD();
}
// ---- 無線電 Lv3：標記溫特附近黑暗中的怪物（render.js 在黑幕上面畫）----
function drawRadioMarks(ctx) {
  const v = equipLv('radio'); if (!v || !v.mark || MAP_SAFE || !G || !G.player) return;
  const p = G.player, R = v.mark * CELL, pulse = .55 + .3 * Math.sin(performance.now() / 220);
  ctx.save();
  for (const e of G.enemies) {
    if (e.dead || e.hp <= 0 || enemyVisible(e) || Math.hypot(e.x - p.x, e.y - p.y) > R) continue;
    ctx.globalAlpha = pulse; ctx.strokeStyle = '#ff5a5a'; ctx.lineWidth = 1.5;
    const s = 11; ctx.beginPath();   // 紅色準星框
    for (const [dx, dy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { ctx.moveTo(e.x + dx * s, e.y + dy * s - dy * 5); ctx.lineTo(e.x + dx * s, e.y + dy * s); ctx.lineTo(e.x + dx * s - dx * 5, e.y + dy * s); }
    ctx.stroke();
  }
  ctx.restore();
}
// ---- 下方資訊條：主動裝備的按鈕（急救包 H、腎上腺素 J）----
const GEAR_QUICK_ENABLED = false;   // 暫時停用這兩顆快捷按鈕與 H／J，背包使用仍保留
let gearQuickKey = '';
function renderGearQuick() {
  if (!GEAR_QUICK_ENABLED) { document.getElementById('quickGear')?.remove(); return; }
  let box = document.getElementById('quickGear');
  if (!box) { const host = document.getElementById('quickSupplies'); if (!host) return; box = document.createElement('div'); box.id = 'quickGear'; host.after(box); }
  const aid = itemCount('firstaid'), rev = itemCount('anomaly-firstaid'), adr = itemCount('adrenaline'), active = adrenalineActive();
  const show = !MAP_SAFE;   // 只在戰鬥區域顯示
  const faces = firstAid.picking ? (G.towers || []).map(t => [t.type, t.hp <= 0]) : [];   // 選隊員時：急救包按鈕上方的隊員小頭像（倒下＝黑白＋重傷）
  const key = JSON.stringify([show, aid, rev, !!firstAid.channel, firstAid.picking, adr, active, faces]);
  if (key === gearQuickKey) return; gearQuickKey = key;
  const btn = (id, icon, name, sub, k, off, cls = '') => '<button type="button" class="quick-supply gear ' + cls + '" data-gear-use="' + id + '" ' + (off ? 'disabled' : '') + ' title="' + (k ? k + '｜' : '') + name + '">' +
    '<span class="qs-icon">' + icon + '</span><span class="qs-text"><small>' + name + '</small><b>' + sub + '</b></span>' + (k ? '<kbd>' + k + '</kbd>' : '') + '</button>';
  const faceRow = !faces.length ? '' : '<div class="aid-pick-row">' + faces.map(([type, down]) => {
    const spec = TYPES[type]; if (!spec) return '';
    return '<span class="aid-face-slot"><button type="button" class="aid-pick-face' + (down ? ' down' : '') + '" data-aid-face="' + type + '" title="' + spec.name + '">' +
      '<img src="' + memberPortraitPath(spec) + '" alt="' + spec.name + '">' + (down ? '<span class="aid-face-down">重傷</span>' : '') + '</button></span>';
  }).join('') + '</div>';
  box.innerHTML = !show ? '' : (aid || rev ? '<span class="aid-gear-wrap">' + btn('firstaid', '⛑️', '急救包', firstAid.picking ? '選隊員' : '×' + aid + (rev ? '・異質×' + rev : ''), 'H', !!firstAid.channel, firstAid.picking ? 'on' : '') + faceRow + '</span>' : '') +
    (adr ? btn('adrenaline', '💉', '腎上腺素', active ? '生效中' : '×' + adr, '', active, active ? 'on' : '') : '');
}
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-gear-use]'); if (!b) return; if (b.dataset.gearUse === 'firstaid') useFirstAid(); else useAdrenaline(); });
// 急救包按鈕上方的隊員小頭像：點＝治療那位；滑鼠每換到一位隊員就響一次
let aidFaceHover = null;
document.addEventListener('click', e => { const f = e.target.closest && e.target.closest('[data-aid-face]'); if (f && firstAid.picking) firstAidPickMember(f.dataset.aidFace); });
document.addEventListener('pointerover', e => {
  const f = e.target.closest && e.target.closest('[data-aid-face]'), type = f && firstAid.picking ? f.dataset.aidFace : null;
  if (type && type !== aidFaceHover) sfx('aidHover');
  aidFaceHover = type;
});
window.addEventListener('keydown', e => {
  if (!GEAR_QUICK_ENABLED) return;
  const k = e.key.toLowerCase();
  if (e.repeat || k !== 'h' || e.ctrlKey || e.altKey || e.metaKey) return;   // J（腎上腺素）拿掉了：改放進快捷欄（js/quick-slots.js）
  if (e.target instanceof Element && e.target.closest('input, textarea, select, [contenteditable]')) return;
  if (!G?.player || G.over || MAP_SAFE || dialogueState || elevatorMenuOpen || mapTransitioning) return;
  if (typeof supplyShopOpen !== 'undefined' && supplyShopOpen) return;
  if (typeof backpackOpen !== 'undefined' && backpackOpen) return;
  e.preventDefault(); useFirstAid();
});

// ---- 每幀（game.js 的 update 呼叫）：手電筒耗電、急救進度、資訊條按鈕 ----
let batteryWarned = false;
function updateEquipment(dt) {
  if (firstAid.picking && (MAP_SAFE || G.over || G.player.hp <= 0 || aidKits() <= 0)) cancelFirstAidPick();   // 換到基地、倒下、急救包用完：不用選了
  renderGearQuick();
  const v = equipLv('headlamp');
  if (!v || MAP_SAFE) return;
  if (equipState.battery > 0) {
    equipState.battery = Math.max(0, equipState.battery - dt * 100 / v.battery);
    if (equipState.battery > 0) return;
  }
  if ((supplyInventory.get('battery') || 0) > 0) {   // 沒電：自動換上背包裡的電池
    const n = supplyInventory.get('battery'); if (n <= 1) supplyInventory.delete('battery'); else supplyInventory.set('battery', n - 1);
    equipState.battery = 100; batteryWarned = false; saveEquipment();
    systemNotice('🔋 手電筒換上新電池（剩 ' + (n - 1) + ' 顆）');
  } else if (!batteryWarned) {
    batteryWarned = true; saveEquipment();
    systemNotice('手電筒沒電了，在地圖上找找電池吧', true);
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
  if (typeof itemIntroForEquipment === 'function') itemIntroForEquipment(id);   // 第一次拿到：跳說明（js/item-intro.js）
  if (typeof battleGot === 'function' && !MAP_SAFE) battleGot(def.name, def.image, 1);
  SFX.play('favorUp', .8, 'equip-get');
  if (typeof backpackOpen !== 'undefined' && backpackOpen) renderBackpack();
  return true;
}
// 戰鬥區域掉落（順順宮帽打開、異質核心碎掉時呼叫）
function tryEquipDrop(id, x, y) {
  if (ITEM_DROPS[id] != null) return tryItemDrop(id, x, y);   // 後室道具
  if (MAP_SAFE || equipState.owned[id] || Math.random() >= (EQUIP_DROPS[id] || 0)) return;
  if (grantEquipment(id, '撿到了特殊裝備') && typeof flash === 'function') flash(equipDef(id).icon + ' ' + equipDef(id).name, x, y - 40, '#ffd479', 2.5);
}
// 後室道具掉落（平安符：掉在地上走過去撿；其他：直接放進背包）
function tryItemDrop(id, x, y) {
  if (MAP_SAFE || Math.random() >= (ITEM_DROPS[id] || 0)) return;
  const item = itemById(id); if (!item) return;
  if (id === 'charm') {
    (G.equipmentDrops = G.equipmentDrops || []).push({ item: id, x, y });
    flash(item.name + '掉落了', x, y - 40, '#ffd479', 2.5);
    return;
  }
  supplyInventory.set(id, (supplyInventory.get(id) || 0) + 1);
  if (typeof showItemPickupNotice === 'function') showItemPickupNotice(id, 1);
  flash('🎁 ' + item.name, x, y - 40, '#ffd479', 2.5);
  SFX.play('favorUp', .8, 'item-get'); if (typeof updateHUD === 'function') updateHUD();
}
function drawEquipmentGroundDrops(ctx) {
  for (const drop of G.equipmentDrops || []) {
    if (!isLit(drop.x, drop.y)) continue;
    const def = drop.item ? itemById(drop.item) : equipDef(drop.id); if (!def) continue;
    const img = tileImage({ id: '__ground-equipment-' + (drop.item || drop.id), file: def.image });
    ctx.save(); ctx.imageSmoothingEnabled = false;
    ctx.shadowColor = '#ffd479'; ctx.shadowBlur = 8;
    if (img) ctx.drawImage(img, drop.x - 15, drop.y - 28, 30, 30);
    else { ctx.fillStyle = '#ffd479'; ctx.font = '22px sans-serif'; ctx.fillText(def.icon, drop.x - 11, drop.y); }
    ctx.restore();
  }
}

// ---- 背包左邊的「部隊長裝備」----
// 點有東西的格子：跳出「卸下裝備／取消」小視窗；點空格：背包切到「裝備」分頁，挑一件能放這格的。
// 要換成別的：在「裝備」分頁點那件，右邊說明下面按「裝備」（會直接換掉，不用先卸下）。
let equipMenu = null;   // 跳出小視窗的那一格
function equipIcon(def, cls = '') { return def.image ? '<img class="' + cls + '" src="' + def.image + '" alt="">' : '<i class="' + cls + '">' + def.icon + '</i>'; }
function renderEquipPanel() {
  const box = document.getElementById('equipPanel'); if (!box) return;
  // 紙娃娃：溫特在上面，下面 2 欄：主武器、副武器／頭部、上身／下身1、下身2／隨身物品1、隨身物品2
  const weaponSlots = WEAPON_SLOTS.map(s => {
    const id = equipState.loadout[s.id], w = id && WEAPON_UPGRADES[id];
    return '<button type="button" class="doll-slot weapon' + (w ? ' filled' : '') + '" data-equip-slot="w:' + s.id + '" title="' + s.name + (w ? '：' + w.name : '：未裝備') + '">' +
      '<span>' + (w ? equipIcon(w) : '＋') + '</span><small>' + (w ? w.name : s.name) + '</small></button>';   // 裝上後只顯示名稱；空格顯示「主武器／副武器」
  }).join('');
  const slots = weaponSlots + EQUIP_SLOTS.map(s => {
    const id = equipState.equipped[s.id], def = id && equipDef(id);
    return '<button type="button" class="doll-slot' + (def ? ' filled' : '') + '" data-equip-slot="' + s.id + '" title="' + s.name + (def ? '：' + def.name : '：未裝備') + '">' +
      '<span>' + (def ? equipIcon(def) : '＋') + '</span><small>' + (def ? def.name : s.name) + '</small></button>';   // 等級看下面的「目前效果」
  }).join('');
  const art = '<img class="doll-art" src="' + EQUIP_PORTRAIT.image + '" alt="溫特" onerror="this.onerror=null;this.src=\'' + EQUIP_PORTRAIT.fallback + '\';this.classList.add(\'sprite\')">';
  const lamp = equipLv('headlamp') ? '<div class="equip-battery"><span>🔋 手電筒電量</span><b>' + Math.round(equipState.battery) + '%</b><i><u style="width:' + equipState.battery + '%"></u></i><small>背包裡的電池：' + (supplyInventory.get('battery') || 0) + ' 顆</small></div>' : '';
  const oldArt = box.querySelector('.doll-art'), scroll = box.scrollTop;
  box.classList.add('no-anim');   // 重畫的這一瞬間不要播格子的浮起／變色動畫
  box.innerHTML = '<h3>部隊長裝備</h3><div class="equip-doll">' + art + '<div class="doll-slots">' + slots + '</div></div>' +
    lamp;
  if (oldArt && oldArt.complete) box.querySelector('.doll-art').replaceWith(oldArt);   // 沿用已經載好的立繪，不要重新載入（會閃）
  box.scrollTop = scroll;
  requestAnimationFrame(() => requestAnimationFrame(() => box.classList.remove('no-anim')));
  renderEquipSlotMenu(box);
}
// 格子的小視窗：跟在被點的格子下面
function renderEquipSlotMenu(box) {
  const btn = equipMenu && box.querySelector('[data-equip-slot="' + equipMenu + '"]');
  if (!btn) { equipMenu = null; return; }
  const name = btn.querySelector('small').textContent;
  const menu = document.createElement('div');
  menu.className = 'equip-slot-menu'; menu.setAttribute('role', 'dialog'); menu.setAttribute('aria-label', name);
  menu.innerHTML = '<b>' + name + '</b>' +
    '<button type="button" data-slot-act="off">卸下裝備</button>' +
    '<button type="button" class="cancel" data-slot-act="cancel">取消</button>';
  box.appendChild(menu);
  const b = btn.getBoundingClientRect(), p = box.getBoundingClientRect(), mw = menu.offsetWidth;
  const left = Math.max(4, Math.min(box.clientWidth - mw - 4, b.left - p.left + b.width / 2 - mw / 2));
  menu.style.left = left + 'px';
  menu.style.top = (b.bottom - p.top + box.scrollTop + 4) + 'px';
  menu.querySelector('button').focus();
}
function equipSlotFilled(slotId) {
  return slotId.startsWith('w:') ? !!equipState.loadout[slotId.slice(2)] : !!equipState.equipped[slotId];
}
function afterLoadoutChange() {
  saveEquipment();
  if (typeof updateAmmoHud === 'function' && typeof G !== 'undefined' && G && G.player) updateAmmoHud();
  if (typeof backpackOpen !== 'undefined' && backpackOpen && typeof renderBackpack === 'function') renderBackpack(); else renderEquipPanel();
}
function unequipSlot(slotId) {
  if (slotId.startsWith('w:')) equipState.loadout[slotId.slice(2)] = null; else equipState.equipped[slotId] = null;
  sfx('switch'); afterLoadoutChange();
}
// 直接裝到某一格（原本那格的東西換下來；同一件已經在別格就跟那格交換／移過來）
function equipToSlot(slotId, id) {
  if (slotId.startsWith('w:')) {
    const slot = slotId.slice(2), other = slot === 'main' ? 'sub' : 'main', L = equipState.loadout;
    if (!weaponHave(id)) return;
    if (L[other] === id) L[other] = L[slot];   // 另一格已經是這把：兩格交換
    L[slot] = id;
  } else {
    if (!equipState.owned[id]) return;
    for (const k of Object.keys(equipState.equipped)) if (equipState.equipped[k] === id) equipState.equipped[k] = null;   // 同一件只能穿一格
    equipState.equipped[slotId] = id;
  }
  sfx('button'); afterLoadoutChange();
}
// 這件可以放哪幾格（背包「裝備」分頁的按鈕用）
function slotsForGear(kind, id) {
  if (kind === 'weapon') return [];   // 手槍一直拿在手上，沒有要裝哪一格
  const d = equipDef(id); if (!d) return [];
  return EQUIP_SLOTS.filter(s => s.kinds.includes(d.kind)).map(s => ({ id: s.id, name: s.name, cur: equipState.equipped[s.id] === id }));
}
document.addEventListener('click', e => {
  if (!e.target.closest || !e.target.closest('#equipPanel')) return;
  const act = e.target.closest('[data-slot-act]');
  if (act && equipMenu) {
    const id = equipMenu; equipMenu = null;
    if (act.dataset.slotAct === 'off') unequipSlot(id); else { sfx('switch'); renderEquipPanel(); }
    document.querySelector('#equipPanel [data-equip-slot="' + id + '"]')?.focus(); return;
  }
  const slot = e.target.closest('[data-equip-slot]');
  if (slot) {
    const id = slot.dataset.equipSlot;
    if (equipSlotFilled(id)) { equipMenu = equipMenu === id ? null : id; sfx('menu'); renderEquipPanel(); return; }   // 有東西：跳小視窗
    equipMenu = null;   // 空格：背包切到「裝備」分頁，選第一件能放這格的
    if (typeof showGearForSlot === 'function') showGearForSlot(id); else renderEquipPanel();
    return;
  }
  if (equipMenu && !e.target.closest('.equip-slot-menu')) { equipMenu = null; renderEquipPanel(); }   // 點旁邊：關掉小視窗
});

// ---- 諾亞的開發工坊 ----
let workshopEl = null, workshopOpen = false;
function ensureWorkshop() {
  if (workshopEl) return;
  workshopEl = document.createElement('div'); workshopEl.id = 'workshop'; workshopEl.className = 'hidden';
  if (typeof applyWorkshopStyle === 'function') applyWorkshopStyle(workshopEl);   // 開發工坊編輯器改過的外觀（data/workshop.js、js/workshop-config.js）
  workshopEl.addEventListener('click', e => {
    if (e.target === workshopEl || e.target.closest('.workshop-close')) { closeWorkshop(); return; }
    if (e.target.closest('[data-scrap-go]')) { wsScrapGo(); return; }   // 分解裝備
    const sc = e.target.closest('[data-scrap]'); if (sc) { wsScrapSelect(sc.dataset.scrap); return; }   // 右側：選要分解的
    const pk = e.target.closest('[data-ws-pick]');   // 左邊：點格子＝在下面的說明欄顯示它
    if (pk) { if (wsPick !== pk.dataset.wsPick) { wsPick = pk.dataset.wsPick; sfx('menu'); renderWorkshop(); } return; }
    const tb = e.target.closest('[data-ws-tab]');   // 上面的分頁：開發／升級
    if (tb) { if (wsTab !== tb.dataset.wsTab) { wsTab = tb.dataset.wsTab; wsPick = null; sfx('switch'); renderWorkshop(false); } return; }
    const b = e.target.closest('[data-ws]'); if (!b) return;
    const [kind, id] = b.dataset.ws.split(':');
    workshopBuy(kind, id);
  });
  document.getElementById('wrap').appendChild(workshopEl);
}
// ---- 分解：右側「目前裝備」「背包裡的裝備」點一下選它，最下面按「分解裝備」 ----
// 返還一半的異質碎片：Lv1＝開發時花的一半；Lv2 以上＝升到目前這一級花的一半（只能在戰鬥區域撿到、沒花過碎片的 Lv1＝0）。
// 手槍（溫特一開始就持有）不能分解。分解掉的裝備、武器就沒有了（之後可以再開發／撿到）。
let wsScrapSel = null, wsScrapArmed = false, wsScrapArmTimer = null;   // 選到的 key（裝備 id／武器 w:id）；armed＝按過一次，再按一次才真的分解
function wsScrapInfo(key) {
  if (!key) return null;
  if (key.startsWith('w:')) {
    const k = key.slice(2), w = WEAPON_UPGRADES[k], lv = equipState.weapons[k] || 0; if (!w || !lv) return null;
    return { name: w.name, lv, keep: k === WS_KEEP_WEAPON, refund: lv >= 2 ? Math.floor((w.cost[lv - 2] || 0) / 2) : 0 };
  }
  const d = equipDef(key), lv = equipState.owned[key] || 0; if (!d || !lv) return null;
  const paid = lv >= 2 ? d.cost[lv - 1] : (d.source === 'develop' ? d.cost[0] : 0);
  return { name: d.name, lv, keep: false, refund: Math.floor((paid || 0) / 2) };
}
function wsScrapBox() {
  const info = wsScrapInfo(wsScrapSel);
  if (!info) return '<p class="wss-tip">換裝備：打開背包</p>';
  if (info.keep) return '<div class="wss-scrap"><button type="button" class="wss-scrap-btn" disabled>無法分解</button><small>「' + info.name + '」是溫特一開始就持有的武器，不能分解或丟棄</small></div>';
  return '<div class="wss-scrap"><button type="button" class="wss-scrap-btn' + (wsScrapArmed ? ' armed' : '') + '" data-scrap-go>' + (wsScrapArmed ? '確定分解「' + info.name + '」？' : '分解裝備') + '</button>' +
    '<small>返還一半的異質碎片（' + WS_SHARD_IMG + info.refund + '）</small></div>';
}
function wsScrapSelect(key) {
  wsScrapSel = wsScrapSel === key ? null : key; wsScrapArmed = false; clearTimeout(wsScrapArmTimer);
  sfx('menu'); renderWorkshop();
}
function wsScrapGo() {
  const key = wsScrapSel, info = wsScrapInfo(key); if (!info || info.keep) return;
  if (!wsScrapArmed) {   // 第一次按：變成「確定分解？」，3 秒內再按一次才分解（不小心按到不會直接沒了）
    wsScrapArmed = true; sfx('menu'); renderWorkshop();
    clearTimeout(wsScrapArmTimer); wsScrapArmTimer = setTimeout(() => { if (wsScrapArmed) { wsScrapArmed = false; if (workshopOpen) renderWorkshop(); } }, 3000);
    return;
  }
  clearTimeout(wsScrapArmTimer); wsScrapArmed = false; wsScrapSel = null;
  if (key.startsWith('w:')) {
    const k = key.slice(2);
    equipState.weapons[k] = 0; delete equipState.gunAmmo[k]; equipState.scrapped[k] = true;
    fixLoadout(); applyWeaponLevels();
  } else {
    delete equipState.owned[key];
    for (const slot of Object.keys(equipState.equipped)) if (equipState.equipped[slot] === key) equipState.equipped[slot] = null;
  }
  training.crystals += info.refund; saveTraining(); if (typeof updateHUD === 'function') updateHUD();
  afterLoadoutChange(); SFX.play('achievement', .5, 'equip-up');
  showWorkshopToast('分解了「' + info.name + '」，返還 <b>' + info.refund + '</b> 個異質碎片', true);
  renderWorkshop();
}
// 工坊打開時的提示（碎片不夠、升級完成…）：顯示在工坊標題列的正中間、最上層，約 2.2 秒後淡出
let workshopToastEl = null, workshopToastUntil = 0, workshopToastTimer = null;
const WS_SHARD_IMG = '<i class="ws-shard" role="img" aria-label="異質碎片"></i>';   // 結晶碎片圖（css/style.css 的 .ws-shard：用背景圖畫，捲動時跟文字一起動）
function showWorkshopToast(text, html = false) {   // html＝true：text 是自己組的 HTML（例如數字加粗）
  if (!workshopToastEl) { workshopToastEl = document.createElement('div'); workshopToastEl.className = 'workshop-toast'; }
  if (html) workshopToastEl.innerHTML = text; else workshopToastEl.textContent = text;
  workshopToastEl.classList.remove('leaving'); void workshopToastEl.offsetWidth;   // 重新播放出現的動畫
  workshopToastUntil = performance.now() + 2200;
  attachWorkshopToast();
  clearTimeout(workshopToastTimer);
  workshopToastTimer = setTimeout(() => { workshopToastEl.classList.add('leaving'); setTimeout(() => { if (performance.now() >= workshopToastUntil) workshopToastEl.remove(); }, 300); }, 2200);
}
function attachWorkshopToast() {   // 工坊每次重畫都會換掉標題列，提示要再放回去
  const head = workshopEl && workshopEl.querySelector('.workshop-head');
  if (head && workshopToastEl && performance.now() < workshopToastUntil + 300) head.appendChild(workshopToastEl);
}
function spendCrystals(n) {
  if (training.crystals < n) {
    sfx('error');
    const short = n - training.crystals, msg = '異質碎片不夠（還差 ' + short + ' 個）';
    if (workshopOpen) showWorkshopToast('異質碎片不夠（還差 <b>' + short + '</b> 個）', true); else systemNotice(msg, true);
    return false;
  }
  training.crystals -= n; saveTraining(); if (typeof updateHUD === 'function') updateHUD();
  if (typeof addStat === 'function') addStat('crystalsSpent', n);   // 成就：花掉的異質碎片
  return true;
}
function workshopBuy(kind, id) {
  if (typeof magazineWorkshopBuy === 'function' && magazineWorkshopBuy(kind, id)) { renderWorkshop(); return; }   // 子彈開發、彈匣升級（js/magazine.js）
  if (kind === 'dev') {
    const def = equipDef(id); if (!def || equipState.owned[id] || def.source !== 'develop') return;
    if (!spendCrystals(def.cost[0])) return;
    grantEquipment(id, '諾亞開發好了');
    showWorkshopToast('🎁 諾亞開發好了「' + def.name + '」');
  } else if (kind === 'up') {
    const def = equipDef(id), lv = equipState.owned[id]; if (!def || !lv || lv >= def.levels.length) return;
    if (!spendCrystals(def.cost[lv])) return;
    equipState.owned[id] = lv + 1; saveEquipment(); SFX.play('achievement', .7, 'equip-up');
    showWorkshopToast('🔧 「' + def.name + '」升到 Lv' + (lv + 1));
  } else if (kind === 'wp') {
    const w = WEAPON_UPGRADES[id], lv = equipState.weapons[id]; if (!w || !lv || lv >= w.levels.length) return;
    if (!spendCrystals(w.cost[lv - 1])) return;
    equipState.weapons[id] = lv + 1; saveEquipment(); applyWeaponLevels(); SFX.play('achievement', .7, 'equip-up');
    showWorkshopToast('🔧 「' + w.name + '」升到 Lv' + (lv + 1));
  }
  renderWorkshop();
}
// 說明文字上色：數字＝橘色、「戰鬥區域」和戰鬥區域裡的東西＝紫色、道具名稱＝道具顏色（js/workshop-config.js 的 workshopColorize，編輯器的預覽也用它）
const wsColor = text => workshopColorize(text);
// 工坊欄位左邊的圖：照開發工坊編輯器設的「圖片大小」縮放（js/workshop-config.js 的 workshopIconStyle）
const wsIcon = d => { const st = workshopIconStyle(d), h = equipIcon(d); return st ? h.replace(/^<(img|i) /, '<$1' + st + ' ') : h; };
// ---- 開發工坊 v3：跟背包一樣的排法 ----
// ・上面兩個分頁：「開發」（還沒有的裝備、武器）／「升級」（已經有的）
// ・格子一排 6 格（正方形，圖示＋名稱），格子底色照等級發光：Lv1 原本的、Lv2 綠、Lv3 藍、Lv4 紫、Lv5 金（.tier-N）
// ・最下面固定一條說明欄（跟背包一樣）：左邊大圖、中間名稱／說明／數值、右邊開發／升級按鈕；打開時自動選第一格
// ・右邊：跟背包一樣的紙娃娃（溫特＋身上的裝備），點格子＝選它來分解
let wsPick = null;      // 目前選的格子：'g:裝備id' 或 'w:武器key'
let wsTab = 'dev';      // 'dev' 開發／'up' 升級
const wsPerRow = () => window.innerWidth <= 760 ? 3 : 6;   // 一排幾格（要跟 css 的 .ws-tiles 一樣）
function workshopEntries() {   // 所有裝備、武器整理成同一種格式
  const gear = EQUIPMENT.map(def => {
    const lv = equipState.owned[def.id] || 0;
    return { key: 'g:' + def.id, kind: 'gear', def, name: def.name, lv, max: def.levels.length, icon: wsIcon(def), image: def.image, emoji: def.icon,
      tag: (typeof GEAR_KIND_NAME !== 'undefined' && GEAR_KIND_NAME[def.kind]) || '裝備', worn: Object.values(equipState.equipped).includes(def.id),
      about: def.ownedDesc || def.desc || '', stat: n => def.stat(def.levels[n - 1]),
      canDev: !lv && def.source === 'develop', where: def.where, devCost: def.cost[0], upCost: lv ? def.cost[lv] : 0, buy: lv ? 'up:' + def.id : 'dev:' + def.id };
  });
  const weapons = Object.entries(WEAPON_UPGRADES).filter(([k, w]) => !w.removed && k === 'pistol').map(([k, w]) => {   // 只有手槍能升級（其他槍改成子彈了）
    const lv = equipState.weapons[k] || 0;
    return { key: 'w:' + k, kind: 'weapon', def: w, name: w.name, lv, max: w.levels.length, icon: wsIcon(w), image: w.image, emoji: w.icon,
      tag: '武器', worn: Object.values(equipState.loadout).includes(k),
      about: w.ownedDesc || w.desc || '', stat: n => w.stat(w.levels[n - 1]),
      canDev: false, where: w.where || '', upCost: lv ? w.cost[lv - 1] : 0, buy: 'wp:' + k };
  });
  const extra = typeof magazineWorkshopEntries === 'function' ? magazineWorkshopEntries() : { bullets: [], mag: null };   // 子彈、彈匣（js/magazine.js）
  return { gear, weapons, bullets: extra.bullets, mags: extra.mag ? [extra.mag] : [] };
}
function renderWorkshop(keepScroll = true) {   // keepScroll：升級、開發後重畫時，捲軸停在原本的位置（剛打開工坊時才從最上面開始）
  const cost = n => '<b>' + WS_SHARD_IMG + n + '</b>';   // 按鈕上的價錢：結晶碎片圖＋數字
  const tier = lv => ' tier-' + Math.max(1, Math.min(5, lv || 1));
  const all = workshopEntries();
  // 開發分頁只放諾亞做得出來的：只能在後室撿到的（燃燒彈槍、麻醉槍、異質探測器…）不放，撿到之後出現在升級分頁
  const tabOf = (x, tab) => tab === 'up' ? x.lv > 0 : !x.lv && x.canDev, inTab = x => tabOf(x, wsTab);
  const gearAll = all.gear.filter(inTab), weaponList = all.weapons.filter(inTab), bulletList = all.bullets.filter(inTab), magList = all.mags.filter(inTab);
  const gearList = WORKSHOP_GEAR_GROUPS.flatMap(([k]) => gearAll.filter(e => workshopGearGroup(e.def.kind) === k));   // 照部位排（跟畫面上的分組一樣）
  const list = [...weaponList, ...magList, ...bulletList, ...gearList];   // 武器、彈匣、子彈排在裝備上面
  if (!list.some(e => e.key === wsPick)) wsPick = list[0] ? list[0].key : null;   // 跟背包一樣：自動選第一格
  const tile = e => '<button type="button" class="ws-tile' + (e.lv ? tier(e.lv) + ' owned' : e.canDev ? ' unowned' : ' locked') + (wsPick === e.key ? ' sel' : '') + '" data-ws-pick="' + e.key + '" aria-pressed="' + (wsPick === e.key) + '">' +
    '<span class="ws-tile-icon">' + e.icon + '</span><b>' + e.name + '</b>' + (e.lv ? '<em>Lv' + e.lv + '</em>' : '') + '</button>';
  const section = (title, items) => items.length ? '<h3>' + title + '</h3><div class="ws-tiles">' + items.map(tile).join('') + '</div>' : '';
  const empty = wsTab === 'up' ? '還沒有可以升級的裝備。先到「可開發」分頁開發吧！' : '所有裝備都已經拿到了！';
  // 下方說明欄（跟背包的說明欄一樣：大圖｜名稱、說明、數值｜按鈕）
  const e = list.find(x => x.key === wsPick);
  let info;
  if (!e) info = '<div class="bag-detail-empty"><span>🔧</span><p>' + empty + '</p></div>';
  else {
    const img = e.image ? '<img src="' + e.image + '" alt=""' + (e.kind === 'weapon' ? ' class="weapon"' : '') + '>' : '<i class="bag-gear-emoji">' + e.emoji + '</i>';
    const tags = (e.lv ? '<span class="bag-tag effect">Lv' + e.lv + '</span>' : e.canDev ? '<span class="bag-tag">未開發</span>' : '<span class="bag-tag">戰鬥區域取得</span>') + (e.worn ? '<span class="bag-tag worn">穿戴中</span>' : '');
    let stats, btn;
    if (e.lv) {
      stats = '<div class="bag-gear-stat"><small>目前效果（Lv' + e.lv + '）</small><b>' + wsColor(e.stat(e.lv)) + '</b></div>' +
        (e.lv < e.max ? '<div class="bag-gear-stat next"><small>升級後（Lv' + (e.lv + 1) + '）</small><b>' + wsColor(e.stat(e.lv + 1)) + '</b></div>' : '');
      btn = e.kind === 'bullet' ? '<button type="button" class="ws-btn" disabled>已開發・到背包的武器分頁裝進彈匣</button>'
        : e.lv < e.max ? '<button type="button" class="ws-btn" data-ws="' + e.buy + '">升級 ' + cost(e.upCost) + '</button>' : '<button type="button" class="ws-btn" disabled>已達最高等級</button>';
    } else if (e.canDev) {
      stats = '<div class="bag-gear-stat next"><small>開發後（Lv1）</small><b>' + wsColor(e.stat(1)) + '</b></div>';
      btn = '<button type="button" class="ws-btn" data-ws="' + e.buy + '">開發 ' + cost(e.devCost) + '</button>';
    } else {
      stats = '<div class="bag-gear-stat where"><small>取得方式</small><b>' + wsColor(e.where || '只能在戰鬥區域取得') + '</b></div>';
      btn = '<button type="button" class="ws-btn" disabled>尚未取得</button>';
    }
    info = '<div class="bag-detail-image"' + workshopInfoImgStyle(e.def) + '>' + img + '</div><div class="ws-info-text"><div class="bag-gear-heading"><h3>' + e.name + '</h3><div class="bag-tags">' + tags + '</div></div>' +
      (e.about ? '<p class="bag-desc">' + wsColor(e.about) + '</p>' : '') + '<div class="ws-info-stats">' + stats + '</div></div><div class="bag-actions">' + btn + '</div>';
  }
  const count = tab => [...all.gear, ...all.weapons, ...all.bullets, ...all.mags].filter(x => tabOf(x, tab)).length;
  const tabs = '<div class="backpack-tabs ws-tabs" role="tablist">' + [['dev', '⚙️ 可開發'], ['up', WS_UP_ICON + ' 可升級']].map(([id, label]) =>
    '<button type="button" role="tab" data-ws-tab="' + id + '" class="' + (wsTab === id ? 'active' : '') + '" aria-selected="' + (wsTab === id) + '">' + label + ' <em>' + count(id) + '</em></button>').join('') + '</div>';
  // 右側：跟背包一樣的紙娃娃（溫特＋主／副武器、頭部、上身、下身 ×2、隨身物品 ×2），點格子＝選它來分解
  const dollSlot = (key, slotName, icon, name, lv, weapon) => '<div class="doll-slot' + (weapon ? ' weapon' : '') + (key ? ' filled' + tier(lv) : '') + (key && wsScrapSel === key ? ' sel' : '') + '"' + (key ? ' data-scrap="' + key + '"' : '') + ' title="' + slotName + '：' + (key ? name + ' Lv' + lv : '未裝備') + '">' +
    '<span>' + (key ? icon : '＋') + (key ? '<em>Lv' + lv + '</em>' : '') + '</span><small>' + (key ? name : slotName) + '</small></div>';
  const dollSlots = WEAPON_SLOTS.map(s => {
    const k = equipState.loadout[s.id], w = k && WEAPON_UPGRADES[k];
    return dollSlot(w ? 'w:' + k : null, s.name, w && equipIcon(w), w && w.name, w && equipState.weapons[k], true);
  }).join('') + EQUIP_SLOTS.map(s => {
    const id = equipState.equipped[s.id], d = id && equipDef(id);
    return dollSlot(d ? id : null, s.name, d && equipIcon(d), d && d.name, d && equipState.owned[id], false);
  }).join('');
  const art = '<img class="doll-art" src="' + EQUIP_PORTRAIT.image + '" alt="溫特" onerror="this.onerror=null;this.src=\'' + EQUIP_PORTRAIT.fallback + '\';this.classList.add(\'sprite\')">';
  const wornIds = new Set(Object.values(equipState.equipped).filter(Boolean));
  const spare = EQUIPMENT.filter(d => equipState.owned[d.id] && !wornIds.has(d.id))
    .map(d => '<span class="wss-item' + tier(equipState.owned[d.id]) + (wsScrapSel === d.id ? ' sel' : '') + '" data-scrap="' + d.id + '" title="' + d.name + ' Lv' + equipState.owned[d.id] + '">' + equipIcon(d) + '<em>Lv' + equipState.owned[d.id] + '</em></span>').join('');
  const side = '<aside class="workshop-side"><h3>目前裝備</h3><div class="equip-doll">' + art + '<div class="doll-slots">' + dollSlots + '</div></div>' +
    '<h3>背包裡的裝備</h3>' + (spare ? '<div class="wss-grid">' + spare + '</div>' : '<p class="wss-empty">無</p>') +
    wsScrapBox() + '</aside>';   // 最下面：選到東西＝「分解裝備」，沒選＝換裝備的提示
  const SCROLLERS = ['.ws-scroll', '.workshop-side', '.workshop-main'];   // 會捲動的區塊（窄畫面時是 .workshop-main）
  const scroll = keepScroll ? SCROLLERS.map(q => workshopEl.querySelector(q)?.scrollTop || 0) : null;
  workshopEl.innerHTML = '<section class="workshop-card" role="dialog" aria-modal="true" aria-label="諾亞的開發工坊">' +
    '<header class="workshop-head">' + workshopHeadHtml() +   // 標題列的文字（開發工坊編輯器可以改：js/workshop-config.js）
    '<button type="button" class="workshop-close" aria-label="關閉（Esc）">×</button></header>' +   // 擁有的碎片數：畫面右下方本來就有，這裡不重複顯示
    '<div class="workshop-main"><div class="workshop-body">' + tabs +
    '<div class="ws-scroll">' + (list.length ? section('武器', weaponList) + section('彈匣', magList) + section('子彈', bulletList) + WORKSHOP_GEAR_GROUPS.map(([k, title]) => section(title, gearList.filter(e => workshopGearGroup(e.def.kind) === k))).join('') : '<p class="ws-empty">' + empty + '</p>') + '</div>' +
    '<div class="ws-info' + (e ? '' : ' empty') + '">' + info + '</div></div>' + side + '</div></section>';
  if (scroll) SCROLLERS.forEach((q, i) => { const el = workshopEl.querySelector(q); if (el) el.scrollTop = scroll[i]; });
  attachWorkshopToast();
}
function openWorkshopResetScrap() { wsScrapSel = null; wsScrapArmed = false; wsPick = null; }
function openWorkshop() {
  ensureWorkshop(); if (typeof closeDialogue === 'function') closeDialogue(true);
  workshopOpen = true; openWorkshopResetScrap(); Object.keys(keys).forEach(k => { keys[k] = false; });
  workshopEl.classList.remove('hidden'); renderWorkshop(false); sfx('menu');   // 先顯示再畫，才量得到欄位高度
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

// Esc：先關格子的小視窗（不要直接把背包關掉）
window.addEventListener('keydown', e => {
  if (e.key !== 'Escape' || !equipMenu) return;
  e.preventDefault(); e.stopImmediatePropagation();
  const id = equipMenu; equipMenu = null; sfx('switch'); renderEquipPanel();
  document.querySelector('#equipPanel [data-equip-slot="' + id + '"]')?.focus();
}, true);

// ---- 靠近隊員時的快捷鍵（js/render.js 畫頭上的「F 急救」「C 疏導」）----
// 附近倒下的隊員（站在 FIRST_AID.reach 格內）：頭上只出現「急救」；身上沒有異質急救包就不出現（救不回來）
function downedTeammateNear() {
  const p = G && G.player; if (!p || MAP_SAFE || p.hp <= 0 || itemCount('anomaly-firstaid') <= 0) return null;
  let best = null, bd = FIRST_AID.reach * CELL;
  for (const t of G.towers || []) { if (t.hp > 0) continue; const d = Math.hypot(t.x - p.x, t.y - p.y); if (d < bd) { bd = d; best = t; } }
  return best;
}
// 現在頭上有選項的那位隊員（暴走的優先，再來倒下的，最後是旁邊的隊員）
function promptTeammate() {
  if (!G || !G.player || MAP_SAFE || G.player.sitting) return null;
  const urgent = typeof urgentSootheTarget === 'function' && urgentSootheTarget(); if (urgent) return urgent;
  const down = downedTeammateNear(); if (down) return down;
  const a = typeof interactionNearPlayer === 'function' && interactionNearPlayer();
  return a && a.kind === 'tower' && a.hp > 0 ? a : null;
}
// 按 F：旁邊的隊員能急救（受傷＋有急救包，或倒下＋有異質急救包）就急救，不然沒有作用（js/shop.js；杏仁水改成 E）
// 互動的第一優先：旁邊的隊員現在需要治療（有對應的急救包）或疏導（有污染、暴走）（js/game.js、js/render.js）
function teammateActionTarget() {
  const t = promptTeammate(); if (!t) return null;
  return aidUsableOn(t) || (t.hp > 0 && (t.taint > 0 || t.berserk)) ? t : null;
}
function aidKeyTarget() { const t = promptTeammate(); return t && aidUsableOn(t) && !firstAid.channel ? t : null; }
// 按 C：疏導頭上有「C 疏導」的那位隊員（暴走、負荷很高的優先，見 promptTeammate）；疏導中再按一次 C＝取消
function sootheKeyTarget() { const t = promptTeammate(); return t && t.hp > 0 && (t.taint > 0 || t.berserk) ? t : null; }
window.addEventListener('keydown', e => {
  if (e.key.toLowerCase() !== 'c' || e.repeat || e.ctrlKey || e.altKey || e.metaKey) return;
  if (e.target instanceof Element && e.target.closest('input, textarea, select, [contenteditable]')) return;
  if (!G?.player || G.over || dialogueState || elevatorMenuOpen || mapTransitioning || G.player.hp <= 0) return;
  if (typeof playerChannel !== 'undefined' && playerChannel && playerChannel.kind === 'soothe') { e.preventDefault(); cancelChannel(); sfx('switch'); return; }
  const t = sootheKeyTarget(); if (!t) return;
  e.preventDefault(); soothe(t);
});
