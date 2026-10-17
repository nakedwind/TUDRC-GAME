// ============================================================
//  部隊長（溫特）的裝備
//  ・背包左邊「部隊長裝備」：換裝（頭部、身體、隨身物品 ×2），看武器等級、手電筒電量。
//  ・照明：照明頭盔（頭部，身邊一小圈光）、高亮度手電筒（隨身物品，朝滑鼠方向的扇形光，要電池）。
//  ・主動裝備：急救包（H）、腎上腺素注射器（J），下方資訊條也有按鈕。
//  ・找諾亞對話 →「🔧 開發工坊」：用異質碎片開發新裝備、升級裝備和武器。
//  ・特殊裝備（順順宮平安符、異質探測器、杏仁水保溫瓶、腎上腺素注射器）只能在戰鬥區域拿到。
//  ・資料、數值在 data/equipment.js；進度存在瀏覽器（localStorage）。
// ============================================================
const EQUIP_STORE = 'tudrc_equipment_v1';
const equipState = { owned: {}, equipped: { head: null, body: null, acc1: null, acc2: null }, weapons: { pistol: 1, flare: 1, incendiary: 0, tranq: 0 }, loadout: { main: 'pistol', sub: 'flare' }, gunAmmo: {}, battery: 100 };
try {
  const s = JSON.parse(localStorage.getItem(EQUIP_STORE) || '{}');
  if (s.owned) for (const [id, lv] of Object.entries(s.owned)) if (EQUIPMENT.some(e => e.id === id)) equipState.owned[id] = Math.max(1, Math.min(3, lv | 0));
  if (s.equipped) for (const k of Object.keys(equipState.equipped)) if (s.equipped[k] && equipState.owned[s.equipped[k]]) equipState.equipped[k] = s.equipped[k];
  // 舊存檔：頭燈／手持格的手電筒改放到空著的隨身物品格；穿在不對的格子的裝備卸下
  const oldLamp = (s.equipped && s.equipped.hand === 'headlamp') || equipState.equipped.head === 'headlamp';
  if (equipState.equipped.head === 'headlamp') equipState.equipped.head = null;
  if (oldLamp && equipState.owned.headlamp && !Object.values(equipState.equipped).includes('headlamp')) {
    const free = ['acc1', 'acc2'].find(k => !equipState.equipped[k]); if (free) equipState.equipped[free] = 'headlamp';
  }
  for (const slot of EQUIP_SLOTS) { const id = equipState.equipped[slot.id], d = id && EQUIPMENT.find(e => e.id === id); if (d && !slot.kinds.includes(d.kind)) equipState.equipped[slot.id] = null; }
  if (s.weapons) for (const k of Object.keys(equipState.weapons)) if (Number.isFinite(s.weapons[k])) equipState.weapons[k] = Math.max(WEAPON_UPGRADES[k].field ? 0 : 1, Math.min(3, s.weapons[k] | 0));   // 後室撿的槍：0＝還沒拿到
  if (s.gunAmmo) for (const [k, a] of Object.entries(s.gunAmmo)) if (WEAPON_UPGRADES[k] && a) equipState.gunAmmo[k] = { mag: Math.max(0, a.mag | 0), reserve: Math.max(0, a.reserve | 0) };
  if (Number.isFinite(s.battery)) equipState.battery = Math.max(0, Math.min(100, s.battery));
  if (s.loadout) for (const k of ['main', 'sub']) if (s.loadout[k] === null || WEAPON_UPGRADES[s.loadout[k]]) equipState.loadout[k] = s.loadout[k];
} catch (_) {}
// 測試用：解鎖所有槍、彈藥補滿（data/equipment.js 的 TEST_UNLOCK_ALL_GUNS）
if (typeof TEST_UNLOCK_ALL_GUNS !== 'undefined' && TEST_UNLOCK_ALL_GUNS) {
  for (const [id, w] of Object.entries(WEAPON_UPGRADES)) {
    if (!(equipState.weapons[id] > 0)) equipState.weapons[id] = 1;
    if (w.field) { const lv = w.levels[equipState.weapons[id] - 1]; equipState.gunAmmo[id] = { mag: id === 'tranq' ? lv.mag : 1, reserve: lv.reserve }; }
  }
}
// ---- 主武器／副武器：出勤時只能在這兩把之間切換（滾輪、數字鍵 1／2）----
const WEAPON_SLOTS = [{ id: 'main', name: '主武器' }, { id: 'sub', name: '副武器' }];
const weaponHave = id => !!WEAPON_UPGRADES[id] && (equipState.weapons[id] || 0) > 0;
function fixLoadout() {   // 沒拿到的槍不能裝；兩格不能放同一把；兩格都空＝空手
  const L = equipState.loadout;
  if (L.main && !weaponHave(L.main)) L.main = null;
  if (L.sub && (!weaponHave(L.sub) || L.sub === L.main)) L.sub = null;
}
fixLoadout();
const weaponInLoadout = id => equipState.loadout.main === id || equipState.loadout.sub === id;
function saveEquipment() { try { localStorage.setItem(EQUIP_STORE, JSON.stringify(equipState)); } catch (_) {} }

const equipDef = id => EQUIPMENT.find(e => e.id === id) || null;
const isEquipped = id => Object.values(equipState.equipped).includes(id);
// 有裝備的話回傳這一級的數值，沒裝備就回傳 null
function equipLv(id) {
  if (!isEquipped(id)) return null;
  const def = equipDef(id); return def ? def.levels[(equipState.owned[id] || 1) - 1] : null;
}

// ---- 效果（其他程式呼叫）----
const equipPlayerDamage = d => { const v = equipLv('vest'), h = equipLv('helmet'); return d * (v ? 1 - v.guard : 1) * (h ? 1 - h.guard : 1) * (adrenalineActive() ? 1 - ADRENALINE.guard : 1); };   // 防護背心、防護頭盔、腎上腺素：溫特受到的傷害
const equipFireMul = () => { const v = equipLv('fireboots'); return v ? 1 - v.fire : 1; };   // 防火鞋：火海燙傷（js/oil-barrels.js）
const equipAcidMul = () => { const v = equipLv('mask'); return v ? 1 - v.filter : 1; };   // 防毒面具：腐蝕池、酸液的傷害
const equipSootheCost = c => { const v = equipLv('bracelet'); return v ? Math.round(c * (1 - v.save)) : c; };   // 共感手環：疏導花的 SP
const equipAlmondMul = () => { const v = equipLv('thermos'); return v ? 1 + v.bonus : 1; };   // 杏仁水保溫瓶
const equipSpeedMul = () => { const v = equipLv('sneakers'); return (v ? 1 + v.speed : 1) * adrenalineSpeedMul(); };   // 輕量跑鞋、腎上腺素
const equipSmilerMul = () => { const v = equipLv('charm'); return v ? 1 - v.ward : 1; };      // 順順宮平安符：被 Smiler 咬的機率
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
// 武器等級套到實際數值（手槍：傷害、彈匣、裝填；照明彈槍：燃燒秒數、備用彈上限）
function applyWeaponLevels() {
  const p = WEAPON_UPGRADES.pistol.levels[equipState.weapons.pistol - 1], f = WEAPON_UPGRADES.flare.levels[equipState.weapons.flare - 1];
  if (typeof PLAYER_ATK !== 'undefined') { PLAYER_ATK.dmg = p.dmg; PLAYER_ATK.mag = p.mag; PLAYER_ATK.reloadTime = p.reload; }
  if (typeof FLARE !== 'undefined') { FLARE.burn = f.burn; FLARE.reserveMax = f.reserve; }
}

// ---- 腎上腺素注射器（J）----
const adrenaline = { until: 0, sideUntil: 0, readyAt: 0 };
const nowSec = () => performance.now() / 1000;
const adrenalineActive = () => nowSec() < adrenaline.until;
function adrenalineSpeedMul() {
  const t = nowSec();
  if (t < adrenaline.until) return 1 + ADRENALINE.speed;
  if (t < adrenaline.sideUntil) return 1 - ADRENALINE.slow;   // 藥效退了：副作用變慢
  return 1;
}
function useAdrenaline() {
  const v = equipLv('adrenaline'); if (!v || MAP_SAFE || !G?.player || G.player.hp <= 0) return;
  const t = nowSec();
  if (t < adrenaline.readyAt) { sfx('error'); flash('腎上腺素還要 ' + Math.ceil(adrenaline.readyAt - t) + ' 秒', G.player.x, G.player.y - 54, '#c9d3dc'); return; }
  adrenaline.until = t + v.dur; adrenaline.sideUntil = adrenaline.until + v.side; adrenaline.readyAt = t + ADRENALINE.cooldown;
  flash('💉 腎上腺素！', G.player.x, G.player.y - 54, '#ff8a8a', 1.4); sfx('soothe');
  G.effects.push({ ring: true, x: G.player.x, y: G.player.y, r: 6, r2: 40, life: .35, life0: .35, color: '#ff8a8a' });
}
// ---- 急救包（H）：治療身邊受傷的隊員（倒地的也行），沒有就治療自己 ----
const firstAid = { uses: 0, forG: null, channel: null };
function firstAidTarget() {
  const p = G.player, near = [];
  for (const t of G.towers || []) if (t.hp < t.maxhp && Math.hypot(t.x - p.x, t.y - p.y) <= 1.8 * CELL) near.push(t);
  near.sort((a, b) => (a.hp / a.maxhp) - (b.hp / b.maxhp));   // 傷最重的先救（倒地的排最前面）
  if (near.length) return near[0];
  return p.hp < p.maxhp ? p : null;
}
function useFirstAid() {
  const v = equipLv('firstaid'); if (!v || MAP_SAFE || !G?.player || G.player.hp <= 0 || firstAid.channel) return;
  if (firstAid.forG !== G) { firstAid.forG = G; firstAid.uses = v.uses; }
  if (firstAid.uses <= 0) { sfx('error'); flash('急救包用完了', G.player.x, G.player.y - 54, '#c9d3dc'); return; }
  const target = firstAidTarget();
  if (!target) { sfx('error'); flash('大家都沒有受傷', G.player.x, G.player.y - 54, '#c9d3dc'); return; }
  firstAid.channel = { t: 0, total: v.time, target, heal: v.heal };
  Object.assign(G.player, { soothingT: v.time, gunT: 0, moving: false });   // 站著不動處理傷口
  flash('⛑️ 急救中…', target.x, target.y - 46, '#9ff0c0', v.time);
}
function finishFirstAid() {
  const c = firstAid.channel; firstAid.channel = null; if (!c || !G) return;
  const t = c.target, isPlayer = t === G.player, wasDown = !isPlayer && t.hp <= 0;
  firstAid.uses--;
  t.hp = Math.min(t.maxhp, Math.max(0, t.hp) + c.heal);
  flash('+' + c.heal + (wasDown ? ' 重新站起來了！' : ''), t.x, t.y - 50, '#79dbad', 1.6);
  if (!isPlayer && wasDown && typeof sentryStatus === 'function') sentryStatus(t, '被溫特救起來了', '#79dbad');
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
let gearQuickKey = '';
function renderGearQuick() {
  let box = document.getElementById('quickGear');
  if (!box) { const host = document.getElementById('quickSupplies'); if (!host) return; box = document.createElement('div'); box.id = 'quickGear'; host.after(box); }
  const aid = equipLv('firstaid'), adr = equipLv('adrenaline'), t = nowSec();
  if (aid && firstAid.forG !== G) { firstAid.forG = G; firstAid.uses = aid.uses; }
  const cd = Math.max(0, Math.ceil(adrenaline.readyAt - t)), active = adrenalineActive();
  const key = JSON.stringify([!!aid, aid ? firstAid.uses : 0, !!firstAid.channel, !!adr, cd, active]);
  if (key === gearQuickKey) return; gearQuickKey = key;
  const btn = (id, icon, name, sub, k, off, cls = '') => '<button type="button" class="quick-supply gear ' + cls + '" data-gear-use="' + id + '" ' + (off ? 'disabled' : '') + ' title="' + k + '｜' + name + '">' +
    '<span class="qs-icon">' + icon + '</span><span class="qs-text"><small>' + name + '</small><b>' + sub + '</b></span><kbd>' + k + '</kbd></button>';
  box.innerHTML = (aid ? btn('firstaid', '⛑️', '急救包', '×' + firstAid.uses, 'H', firstAid.uses <= 0 || firstAid.channel) : '') +
    (adr ? btn('adrenaline', '💉', '腎上腺素', active ? '生效中' : cd ? cd + ' 秒' : '可使用', 'J', cd > 0 && !active, active ? 'on' : '') : '');
}
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-gear-use]'); if (!b) return; if (b.dataset.gearUse === 'firstaid') useFirstAid(); else useAdrenaline(); });
window.addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if (e.repeat || (k !== 'h' && k !== 'j') || e.ctrlKey || e.altKey || e.metaKey) return;
  if (e.target instanceof Element && e.target.closest('input, textarea, select, [contenteditable]')) return;
  if (!G?.player || G.over || MAP_SAFE || dialogueState || elevatorMenuOpen || mapTransitioning) return;
  if (typeof supplyShopOpen !== 'undefined' && supplyShopOpen) return;
  if (typeof backpackOpen !== 'undefined' && backpackOpen) return;
  e.preventDefault(); if (k === 'h') useFirstAid(); else useAdrenaline();
});

// ---- 每幀（game.js 的 update 呼叫）：手電筒耗電、急救進度、資訊條按鈕 ----
let batteryWarned = false;
function updateEquipment(dt) {
  if (firstAid.channel) { firstAid.channel.t += dt; if (firstAid.channel.t >= firstAid.channel.total || G.player.hp <= 0) finishFirstAid(); }
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
  if (MAP_SAFE || equipState.owned[id] || Math.random() >= (EQUIP_DROPS[id] || 0)) return;
  if (id === 'charm') {
    if (!G.equipmentDrops) G.equipmentDrops = [];
    if (G.equipmentDrops.some(drop => drop.id === id)) return;
    G.equipmentDrops.push({ id, x, y });
    flash('順順宮平安符掉落了', x, y - 40, '#ffd479', 2.5);
    return;
  }
  if (grantEquipment(id, '撿到了特殊裝備') && typeof flash === 'function') flash(equipDef(id).icon + ' ' + equipDef(id).name, x, y - 40, '#ffd479', 2.5);
}
function drawEquipmentGroundDrops(ctx) {
  for (const drop of G.equipmentDrops || []) {
    if (!isLit(drop.x, drop.y)) continue;
    const def = equipDef(drop.id); if (!def) continue;
    const img = tileImage({ id: '__ground-equipment-' + drop.id, file: def.image });
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
  // 紙娃娃：溫特在上面，下面 2 欄：主武器、副武器／頭部、身體／隨身物品 ×2
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
  if (kind === 'weapon') return WEAPON_SLOTS.map(s => ({ id: 'w:' + s.id, name: s.name, cur: equipState.loadout[s.id] === id }));
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
    const w = WEAPON_UPGRADES[id], lv = equipState.weapons[id]; if (!w || !lv || lv >= 3) return;
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
    if (!lv) return row(equipIcon(w), w.name, '', w.desc, '只能在戰鬥區域取得：' + w.where, '<button type="button" class="ws-btn" disabled>尚未取得</button>');
    return row(equipIcon(w), w.name, ' <em>Lv' + lv + '</em>', w.stat(w.levels[lv - 1]), lv < 3 ? '升到 Lv' + (lv + 1) + '：' + w.stat(w.levels[lv]) : '',
      lv < 3 ? '<button type="button" class="ws-btn" data-ws="wp:' + k + '">升級 ' + cost(w.cost[lv - 1]) + '</button>' : '<button type="button" class="ws-btn" disabled>已達最高等級</button>');
  }).join('');
  // 右側：目前穿戴的 4 格＋背包裡其他已擁有的裝備（升級後等級即時更新）
  const wornWeaponSlots = WEAPON_SLOTS.map(s => {
    const k = equipState.loadout[s.id], w = k && WEAPON_UPGRADES[k], lv = k && equipState.weapons[k];
    return '<div class="wss-slot weapon' + (w ? ' filled' : '') + '"><span class="wss-icon">' + (w ? equipIcon(w) : '<i>＋</i>') + '</span><div><small>' + s.name + '</small><b>' + (w ? w.name + ' <em>Lv' + lv + '</em>' : '未裝備') + '</b>' +
      (w ? '<span>' + w.stat(w.levels[lv - 1]) + '</span>' : '') + '</div></div>';
  }).join('');
  const wornSlots = wornWeaponSlots + EQUIP_SLOTS.map(s => {
    const id = equipState.equipped[s.id], d = id && equipDef(id);
    return '<div class="wss-slot' + (d ? ' filled' : '') + '"><span class="wss-icon">' + (d ? equipIcon(d) : '<i>＋</i>') + '</span><div><small>' + s.name + '</small><b>' + (d ? d.name + ' <em>Lv' + equipState.owned[id] + '</em>' : '未裝備') + '</b>' +
      (d ? '<span>' + d.stat(d.levels[equipState.owned[id] - 1]) + '</span>' : '') + '</div></div>';
  }).join('');
  const wornIds = new Set(Object.values(equipState.equipped).filter(Boolean));
  const spare = EQUIPMENT.filter(d => equipState.owned[d.id] && !wornIds.has(d.id))
    .map(d => '<span class="wss-item" title="' + d.name + ' Lv' + equipState.owned[d.id] + '：' + d.stat(d.levels[equipState.owned[d.id] - 1]) + '">' + equipIcon(d) + '<em>Lv' + equipState.owned[d.id] + '</em></span>').join('');
  const side = '<aside class="workshop-side"><h3>目前裝備</h3>' + wornSlots +
    '<h3>背包裡的裝備</h3>' + (spare ? '<div class="wss-grid">' + spare + '</div>' : '<p class="wss-empty">沒有其他裝備</p>') +
    '<p class="wss-tip">換裝備：打開背包</p></aside>';
  workshopEl.innerHTML = '<section class="workshop-card" role="dialog" aria-modal="true" aria-label="諾亞的開發工坊">' +
    '<header class="workshop-head"><div class="workshop-title"><small>諾亞的開發工坊</small><h2>裝備開發・升級</h2><p>用異質碎片開發新裝備，或把裝備、武器升級</p></div>' +
    '<span class="workshop-wallet"><small>異質碎片</small><b>◆ ' + training.crystals + '</b></span><button type="button" class="workshop-close" aria-label="關閉（Esc）">×</button></header>' +
    '<div class="workshop-main"><div class="workshop-body"><h3>裝備</h3>' + gear + '<h3>武器</h3>' + weapons + '</div>' + side + '</div></section>';
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

// Esc：先關格子的小視窗（不要直接把背包關掉）
window.addEventListener('keydown', e => {
  if (e.key !== 'Escape' || !equipMenu) return;
  e.preventDefault(); e.stopImmediatePropagation();
  const id = equipMenu; equipMenu = null; sfx('switch'); renderEquipPanel();
  document.querySelector('#equipPanel [data-equip-slot="' + id + '"]')?.focus();
}, true);
