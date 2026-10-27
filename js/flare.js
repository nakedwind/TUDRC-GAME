/* ===== 溫特的手槍＋子彈切換＋照明彈＋彈藥箱 =====
   - 溫特從頭到尾只有一把手槍，差別只在子彈：一般子彈（無限）、照明彈、燃燒彈、麻醉彈、漆彈（data/equipment.js 的 BULLETS）。
   - 滾輪（滑鼠在遊戲畫面上）換子彈，只會換到拿到過、而且出勤前裝進彈匣的子彈（js/magazine.js）；特殊子彈打完會停在空的（扣扳機只會「喀」一聲），要自己滾回別的。
   - 照明彈：朝滑鼠方向打出去（最遠 FLARE.range 格，碰到牆會停在牆前），落地燃燒一段時間。
     是「真的光」：照亮的地方哨兵看得到怪、可以蓋建築、溫特的槍也能瞄準。怪物不會被它吸引。
   - 照明彈打完：走到營地的補彈藥箱按 Space 補到 20 發（AMMO_REFILL）。能打開的彈藥箱（ammo-crate）是另一種，開一次拿裡面的東西。
   - 子彈數量存在 equipState.bullets（js/equipment.js，跟裝備一起存）；燃燒彈、麻醉彈的效果在 js/special-guns.js，漆彈在 js/game.js 的 updatePlayerAttack。
   數值都在下面的表格。
*/
const FLARE = {
  range: 20,           // 最遠打幾格
  speed: 1400,         // 飛行速度（像素／秒），直線像子彈一樣快
  burn: 24,            // 燃燒秒數（最後 fade 秒會閃爍變暗）；實際用 BULLETS.flare.shine
  fade: 3,
  radius: 200,         // 照明半徑（像素）
  reserveMax: 30,      // 最多帶幾發；實際用 BULLETS.flare.max
};
// 滾輪切換的順序
// special＝效果寫在 js/special-guns.js 的子彈（一般子彈、照明彈、螢光漆彈另外處理）
const WEAPONS = ['pistol', 'flare', 'incendiary', 'tranq', 'paint', 'split', 'flash', 'shock', 'heal'].filter(id => BULLETS[id]).map(id => ({ id, ...BULLETS[id], special: !['pistol', 'flare', 'paint'].includes(id) }));
const AMMO_CRATE = { ids: ['tile_field_ammo_crate', 'tile_poolcore_ammo_crate'], emptyId: 'tile_field_ammo_crate_empty',   // 能打開、開出東西的彈藥箱（ammo-crate.png；池核版 Poolcore_ammo-crate.png）
  emptyOf: { tile_field_ammo_crate: 'tile_field_ammo_crate_empty', tile_poolcore_ammo_crate: 'tile_mvot3dds' } };   // 開過之後換成哪張空箱圖（池核版：Poolcore_field-base-03.png）
// 營地的補彈藥箱（ammo-crate-open-02.png；地圖上放的「彈藥箱（打開）」也算）：按 Space 把照明彈、螢光漆彈補到 to 發，已經有 to 發以上就不補，可以一直補
const AMMO_REFILL = { ids: ['tile_field_ammo_crate_open', 'tile_mvotgy7w'], file: /(ammo-crate-open-02|Poolcore_ammo-crate-open)\.png$/, bullets: ['flare', 'paint'], to: 20 };   // 池核版：Poolcore_ammo-crate-open.png
// 空的彈藥箱：素材庫（data/tiles.js）沒有這張時用這份，編輯器存檔蓋掉素材庫也不會變回關著的圖
const AMMO_CRATE_EMPTY_TILE = { id: 'tile_field_ammo_crate_empty', name: '彈藥箱（空）', role: 'floor', file: 'images/field-camp/ammo-crate_empty.png', w: 1, h: 1 };
const AMMO_CRATE_EMPTY_FALLBACK = { tile_mvot3dds: { id: 'tile_mvot3dds', name: '池核｜彈藥箱（空）', role: 'floor', file: 'images/Poolcore/Poolcore_field-base-03.png', w: 2, h: 2 } };   // 池核空箱：素材庫裡的 id 不見了也照樣換圖

// 子彈的小圖（data/equipment.js 的 image；沒有圖就用 emoji）
const bulletIcon = (b, cls = 'bullet-img') => b && b.image ? '<img class="' + cls + '" src="' + b.image + '" alt="">' : '<i>' + ((b && b.icon) || '') + '</i>';
// ---- 子彈數量（存在 equipState.bullets：owned 拿到過哪幾種、n 剩幾發）----
function bulletState() {
  const e = typeof equipState !== 'undefined' ? equipState : {};
  return e.bullets || (e.bullets = { owned: { flare: true }, n: { flare: BULLETS.flare.max } });
}
function bulletOwned(id) { if (id === 'pistol') return true; const b = BULLETS[id]; return !!b && !b.removed && !!bulletState().owned[id]; }
function bulletCount(id) { return id === 'pistol' ? Infinity : (bulletState().n[id] || 0); }
function bulletSave() { if (typeof saveEquipment === 'function') saveEquipment(); if (typeof updateAmmoHud === 'function' && typeof G !== 'undefined' && G && G.player) updateAmmoHud(); }
// 加子彈（第一次拿到也算拿到這種）：回傳實際加了幾發（滿了就加不進去）
function addBullets(id, n) {
  const s = bulletState(), b = BULLETS[id]; if (!b || id === 'pistol') return 0;
  if (!s.owned[id] && bagUsedSlots(supplyInventory, 'weapon') >= bagCapacity('weapon')) { systemNotice('彈藥包已滿（' + bagCapacity('weapon') + ' 格），到開發工坊擴充', true); return 0; }
  s.owned[id] = true;
  const before = s.n[id] || 0; s.n[id] = Math.min(b.max, before + Math.max(0, n | 0));
  bulletSave(); return s.n[id] - before;
}
function fillBullets(id) { const s = bulletState(), b = BULLETS[id]; if (!b || id === 'pistol' || !s.owned[id]) return 0; const got = b.max - (s.n[id] || 0); s.n[id] = b.max; bulletSave(); return got; }
function useBullet(id) { const s = bulletState(); s.n[id] = Math.max(0, (s.n[id] || 0) - 1); bulletSave(); }

// ---- 目前裝的子彈 ----
const UNARMED = { id: 'none', name: '空手', icon: '✋' };   // 舊的：現在一定拿著手槍
const weaponUsable = i => !!WEAPONS[i] && bulletOwned(WEAPONS[i].id) && (typeof magazineCarries !== 'function' || magazineCarries(WEAPONS[i].id));   // 拿到過、而且這次有裝進彈匣（js/magazine.js）
function playerWeapon(p) {
  if (p && !weaponUsable(p.weaponIndex || 0)) p.weaponIndex = 0;   // 這種子彈沒了（例如被編輯器拿掉）：換回一般子彈
  return WEAPONS[(p && p.weaponIndex) || 0];
}
function ensureFlareAmmo() {}   // 舊的：照明彈數量現在跟其他子彈一起存（bulletState）
let lastWeaponSwitch = 0;
function switchWeapon(step, toIndex) {
  const p = G && G.player;
  if (!p || MAP_SAFE || !G.running || G.over || p.hp <= 0) return;
  const now = performance.now();
  if (toIndex == null && now - lastWeaponSwitch < 200) return;   // 滾一下不要連跳好幾種
  lastWeaponSwitch = now;
  let next = toIndex;
  if (next == null) {   // 滾輪：跳過還沒拿到的子彈（拿到過但打完的照樣換得到）
    next = p.weaponIndex || 0;
    for (let i = 0; i < WEAPONS.length; i++) { next = (next + step + WEAPONS.length) % WEAPONS.length; if (weaponUsable(next)) break; }
  } else if (!weaponUsable(next)) return;
  if (next === (p.weaponIndex || 0)) return;
  p.weaponIndex = next; p.atkCd = Math.max(p.atkCd || 0, .15);
  const w = WEAPONS[next];
  G.effects.push(w.image ? { text: w.name, iconImage: w.image, x: p.x, y: p.y - 70, life: .9, life0: .9, color: w.color, vy: -22 }   // 頭上飄子彈圖＋名稱（跟以前換槍一樣）
    : { text: w.icon + ' ' + w.name, x: p.x, y: p.y - 70, life: .9, life0: .9, color: w.color, vy: -22 });
  sfx('switch'); updateAmmoHud();
}
cv.addEventListener('wheel', e => {
  if (!G || MAP_SAFE || !G.running) return;   // 安全區照常捲動網頁
  e.preventDefault();
  if (e.deltaY) switchWeapon(e.deltaY > 0 ? 1 : -1);
}, { passive: false });
// 特殊子彈打完：扣扳機只會「喀」一聲（舉槍、不出子彈）
function dryFire(p, aim, id) {
  if (aim) { const ang = Math.atan2(aim.y - p.y, aim.x - p.x); p.dir = Math.abs(Math.cos(ang)) >= Math.abs(Math.sin(ang)) ? (Math.cos(ang) < 0 ? 'left' : 'right') : (Math.sin(ang) < 0 ? 'back' : 'front'); }
  p.gunT = .45; p.atkCd = .35;
  sfx('dryFire');
  const now = performance.now();
  if (!(now - (p.dryHintAt || 0) < 1500)) { p.dryHintAt = now; flash('沒有' + BULLETS[id].name + '了', p.x, p.y - 70, '#ff9f7a', .7); }
}

// ---- 照明彈：發射 ----
// 每幀由 updatePlayerAttack 呼叫；回傳 true＝這幀已處理
function updateFlareGun(p, dt, aim, canFire) {
  if (!canFire) return true;
  if (bulletCount('flare') <= 0) { dryFire(p, aim, 'flare'); return true; }
  useBullet('flare'); p.atkCd = BULLETS.flare.gap;
  fireFlare(p, aim);
  return true;
}
function fireFlare(p, aim) {
  const ang = Math.atan2(aim.y - p.y, aim.x - p.x), want = Math.min(Math.hypot(aim.x - p.x, aim.y - p.y), FLARE.range * CELL);
  p.dir = Math.abs(Math.cos(ang)) >= Math.abs(Math.sin(ang)) ? (Math.cos(ang) < 0 ? 'left' : 'right') : (Math.sin(ang) < 0 ? 'back' : 'front');
  p.gunT = .45; p.recoilT = .14; p.recoilAng = ang;
  // 沿路線一步步檢查，碰到牆就停在牆前
  let dist = 0;
  for (let d = 8; d <= want; d += 8) {
    const [c, r] = cellAt(p.x + Math.cos(ang) * d, p.y + Math.sin(ang) * d);
    if (!inGrid(c, r) || isWall(c, r)) break;
    dist = d;
  }
  const { x: mx, y: my } = gunMuzzleAt(p, ang);
  const tx = p.x + Math.cos(ang) * dist, ty = p.y + Math.sin(ang) * dist;
  (G.flareShots = G.flareShots || []).push({ x0: mx, y0: my, x1: tx, y1: ty, t: 0, T: Math.max(.04, dist / FLARE.speed) });
  G.effects.push({ muzzle: true, x: mx, y: my, ang, life: .1, life0: .1 });
  addLightFlash('muzzle', mx, my, 1.3);
  sfx('shotFlare');
}

// ---- 照明彈：飛行、燃燒（每幀由 game.js 的 update 呼叫）----
function updateFlares(dt) {
  if (G.flareShots && G.flareShots.length) {
    for (const s of G.flareShots) {
      s.t += dt;
      if (s.t >= s.T) {   // 落地：開始燃燒
        (G.flares = G.flares || []).push({ x: s.x1, y: s.y1, t: FLARE.burn, emberT: 0, seed: Math.random() * 10 });
        if (typeof hitHangiCapsAt === 'function') hitHangiCapsAt(s.x1, s.y1, 6);   // 照明彈落在順順宮帽上：打開帽子
        if (typeof sfxAt === 'function') sfxAt('hitFlare', s.x1, s.y1, .35, 'flare-land');
      } else if (Math.random() < .6) {   // 飛行中拖出火星
        const k = s.t / s.T, x = s.x0 + (s.x1 - s.x0) * k, y = s.y0 + (s.y1 - s.y0) * k;
        G.effects.push({ ember: true, spark: true, x, y, vx: (Math.random() - .5) * 30, vy: (Math.random() - .5) * 30, r: 1.2 + Math.random(), life: .3, life0: .3, color: '#ffb38a' });
      }
    }
    G.flareShots = G.flareShots.filter(s => s.t < s.T);
  }
  if (G.flares && G.flares.length) {
    for (const f of G.flares) {
      f.t -= dt; f.emberT -= dt;
      if (f.emberT <= 0 && f.t > .3) {   // 往上飄的紅色火星＋淡淡白煙
        f.emberT = .05 + Math.random() * .06;
        G.effects.push({ ember: true, x: f.x + (Math.random() - .5) * 4, y: f.y - 6, vx: (Math.random() - .5) * 18, vy: -(20 + Math.random() * 30),
          r: 1 + Math.random() * 1.4, wob: 3 + Math.random() * 4, seed: Math.random() * 99, life: .5 + Math.random() * .4, life0: .9 });
        if (Math.random() < .12) pushBlackSmoke(f.x, f.y - 8);
      }
    }
    G.flares = G.flares.filter(f => f.t > 0);
  }
}
// 燃燒亮度：最後 fade 秒開始閃爍變暗
function flareLevel(f) {
  const flick = .9 + .1 * Math.sin(performance.now() / 1000 * 23 + f.seed);
  if (f.t > FLARE.fade) return flick;
  const k = f.t / FLARE.fade;
  return k * (Math.random() < .15 * (1 - k) ? .3 : 1) * flick;
}
// 給 js/lighting.js：燃燒中的照明彈是真的光源
function flareLightSources() {
  return (G && G.flares || []).map(f => ({ x: f.x, y: f.y, r: FLARE.radius * Math.max(.25, flareLevel(f)) }));
}

// ---- 繪製 ----
function drawFlares(ctx) {   // 地上的照明棒（畫在角色下面）
  for (const f of (G.flares || [])) {
    ctx.save(); ctx.translate(f.x, f.y);
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(0, 3, 7, 2.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.rotate(-.5); ctx.fillStyle = '#7a1f1f'; ctx.fillRect(-6, -2, 12, 4); ctx.fillStyle = '#c94a3a'; ctx.fillRect(-6, -2, 12, 1.5);
    ctx.restore();
  }
}
function drawFlareShots(ctx) {   // 飛行中的照明彈（畫在角色上面）
  for (const s of (G.flareShots || [])) {
    const k = Math.min(1, s.t / s.T), x = s.x0 + (s.x1 - s.x0) * k, y = s.y0 + (s.y1 - s.y0) * k;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    // 拖尾：往回拉一小段亮線，看起來是高速直射
    const len = Math.hypot(s.x1 - s.x0, s.y1 - s.y0) || 1, tail = Math.min(70, len * k);
    const tx = x - (s.x1 - s.x0) / len * tail, ty = y - (s.y1 - s.y0) / len * tail;
    const lg = ctx.createLinearGradient(tx, ty, x, y);
    lg.addColorStop(0, 'rgba(255,80,50,0)'); lg.addColorStop(1, 'rgba(255,200,160,.9)');
    ctx.strokeStyle = lg; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(x, y); ctx.stroke();
    const g = ctx.createRadialGradient(x, y, 0, x, y, 12);
    g.addColorStop(0, 'rgba(255,240,220,.95)'); g.addColorStop(.35, 'rgba(255,110,70,.6)'); g.addColorStop(1, 'rgba(255,60,40,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
}
function drawFlareGlow(ctx) {   // 紅橘色光暈與火焰（畫在黑幕上面，才看得出在發光）
  for (const f of (G.flares || [])) {
    const k = flareLevel(f); if (k <= .02) continue;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(f.x, f.y - 4, 0, f.x, f.y - 4, 70);
    g.addColorStop(0, `rgba(255,170,130,${(.45 * k).toFixed(3)})`); g.addColorStop(.3, `rgba(255,90,60,${(.18 * k).toFixed(3)})`); g.addColorStop(1, 'rgba(255,60,40,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(f.x, f.y - 4, 70, 0, Math.PI * 2); ctx.fill();
    const h = 7 + 3 * Math.sin(performance.now() / 70 + f.seed);   // 小火焰
    ctx.fillStyle = `rgba(255,235,200,${(.9 * k).toFixed(3)})`; ctx.beginPath(); ctx.ellipse(f.x + 4, f.y - 6, 2.2, h / 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
}

// ---- 彈藥箱：地圖上放的彈藥箱物件，跟置物櫃一樣能開出東西，但不用鑰匙、每個箱子只能開一次 ----
// 內容物在地圖編輯器指定（lockerLoot，格式跟置物櫃一樣）；沒指定＝空箱。開過的換成空箱的圖
const ammoCrateNearPlayer = () => mapBoxNearPlayer('ammo');   // 判定範圍：js/camp-interactions.js 的 MAP_BOX
const ammoCrateToken = s => storagePropToken(s.id, s.c, s.r, s.layer || 'top', s.ox || 0, s.oy || 0);
const ammoCrateLooted = s => !!s && unlockedStorageLockers.has(ammoCrateToken(s));   // 開過的跟置物櫃一起存檔（js/save.js）
function useAmmoCrateNearPlayer() {
  const crate = ammoCrateNearPlayer(); if (!crate) return false;
  const s = crate.stamp; if (ammoCrateLooted(s)) return false;
  unlockedStorageLockers.add(ammoCrateToken(s)); sfx('door');
  // 開出來的東西跳視窗（js/item-intro.js）；什麼都沒有就飄字
  const before = typeof itemIntroCount !== 'undefined' ? itemIntroCount : 0;
  if (typeof itemIntroFromLocker !== 'undefined') itemIntroFromLocker = true;
  try { if (s.lockerLoot) grantLockerLoot(s.lockerLoot, '彈藥箱'); }
  finally { if (typeof itemIntroFromLocker !== 'undefined') itemIntroFromLocker = false; }
  if (typeof itemIntroCount !== 'undefined' && itemIntroCount === before) flash('空的', crate.x, crate.top - 8, '#dce6ed', 1.6);
  updateHUD(); saveGame();
  return true;
}
// ---- 營地的補彈藥箱：照明彈、螢光漆彈補到 AMMO_REFILL.to 發（拿到過的才補）----
const ammoRefillNearPlayer = () => mapBoxNearPlayer('refill');   // 判定範圍：js/camp-interactions.js 的 MAP_BOX
function useAmmoRefillNearPlayer() {
  const crate = ammoRefillNearPlayer(); if (!crate) return false;
  const s = bulletState(), got = [];
  for (const id of AMMO_REFILL.bullets) {
    if (!BULLETS[id] || !s.owned[id]) continue;
    const n = AMMO_REFILL.to - (s.n[id] || 0); if (n <= 0) continue;   // 已經有 to 發以上：不補（也不會變少）
    s.n[id] = AMMO_REFILL.to; got.push(BULLETS[id].name + ' +' + n);
  }
  if (got.length) { bulletSave(); sfx('ammoRefill'); flash('補充彈藥：' + got.join('、'), crate.x, crate.top - 8, '#ffd27a', 1.8); }
  else { sfx('error'); flash('彈藥已經補滿了', crate.x, crate.top - 8, '#dce6ed', 1.4); }
  return true;
}
// 開過的關著的彈藥箱畫成空箱（js/maploader.js 會問這裡）；本來就是打開圖的彈藥箱不換圖
function ammoCrateOpenTile(s) {
  const emptyId = AMMO_CRATE.emptyOf[s.id];
  if (!emptyId || !ammoCrateLooted(s)) return null;
  return mapTileById(emptyId) || AMMO_CRATE_EMPTY_FALLBACK[emptyId] || AMMO_CRATE_EMPTY_TILE;
}
