/* ===== 溫特的武器切換＋照明彈槍＋彈藥箱 =====
   - 滾輪（滑鼠在遊戲畫面上）或數字鍵 1／2 切換：手槍（6/∞）↔ 照明彈槍（彈匣 3／備用最多 30）。
   - 照明彈：朝滑鼠方向打出去（最遠 FLARE.range 格，碰到牆會停在牆前），落地燃燒一段時間。
     是「真的光」：照亮的地方哨兵看得到怪、可以蓋建築、溫特的槍也能瞄準。怪物不會被它吸引。
   - 彈匣打完按 R（或再開火）從備用彈裝填；備用彈也用完，就要走到地圖上的彈藥箱按 Space／E 補滿。
   數值都在下面的表格。
*/
const FLARE = {
  mag: 3,              // 彈匣幾發
  reserveMax: 30,      // 備用彈最多幾發
  reloadTime: 1.5,     // 裝填秒數
  fireGap: .8,         // 兩發之間至少隔幾秒
  range: 10,           // 最遠打幾格
  speed: 1400,         // 飛行速度（像素／秒），直線像子彈一樣快
  burn: 12,            // 燃燒秒數（最後 fade 秒會閃爍變暗）
  fade: 3,
  radius: 200,         // 照明半徑（像素）
};
const WEAPONS = [
  { id: 'pistol', name: '手槍', icon: '🔫', img: 'images/weapon/winter-handgun-design.png' },
  { id: 'flare', name: '照明彈槍', icon: '🔥', img: 'images/weapon/winter-flare-gun-design.png' },
];
const AMMO_CRATE = { ids: ['tile_field_ammo_crate', 'tile_field_ammo_crate_open'], openId: 'tile_field_ammo_crate_open', radius: 72, openFor: 1.6 };

// ---- 武器狀態 ----
function playerWeapon(p) { return WEAPONS[(p && p.weaponIndex) || 0]; }
function ensureFlareAmmo(p) {
  if (p.flareMag == null) p.flareMag = FLARE.mag;
  if (p.flareReserve == null) p.flareReserve = FLARE.reserveMax;
}
let lastWeaponSwitch = 0;
function switchWeapon(step, toIndex) {
  const p = G && G.player;
  if (!p || MAP_SAFE || !G.running || G.over || p.hp <= 0) return;
  const now = performance.now();
  if (toIndex == null && now - lastWeaponSwitch < 200) return;   // 滾一下不要連跳好幾把
  lastWeaponSwitch = now;
  const next = toIndex != null ? toIndex : ((p.weaponIndex || 0) + step + WEAPONS.length) % WEAPONS.length;
  if (next === (p.weaponIndex || 0)) return;
  p.weaponIndex = next; p.atkCd = Math.max(p.atkCd || 0, .15);
  const w = WEAPONS[next];
  flash(w.icon + ' ' + w.name, p.x, p.y - 70, '#ffe79a', .9);
  sfx('switch'); updateAmmoHud();
}
cv.addEventListener('wheel', e => {
  if (!G || MAP_SAFE || !G.running) return;   // 安全區照常捲動網頁
  e.preventDefault();
  if (e.deltaY) switchWeapon(e.deltaY > 0 ? 1 : -1);
}, { passive: false });
window.addEventListener('keydown', e => {
  if (e.repeat || dialogueState) return;
  const n = Number(e.key);
  if (n >= 1 && n <= WEAPONS.length) switchWeapon(0, n - 1);
});

// ---- 照明彈：裝填、發射 ----
function startFlareReload(p) {
  ensureFlareAmmo(p);
  if (p.flareReloadT > 0 || p.flareMag >= FLARE.mag) return;
  if (p.flareReserve <= 0) { flash('照明彈用完了，去彈藥箱補給', p.x, p.y - 70, '#ff9f7a', 1.4); sfx('error'); return; }
  p.flareReloadT = FLARE.reloadTime; sfx('reload');
}
// 每幀由 updatePlayerAttack 呼叫；回傳 true＝這幀已處理（裝填中或打出照明彈）
function updateFlareGun(p, dt, aim, canFire) {
  ensureFlareAmmo(p);
  if (p.flareReloadT > 0) {
    p.flareReloadT -= dt;
    if (p.flareReloadT <= 0) { const n = Math.min(FLARE.mag - p.flareMag, p.flareReserve); p.flareMag += n; p.flareReserve -= n; }
    return true;
  }
  if (!canFire) return true;
  if (p.flareMag <= 0) { startFlareReload(p); p.atkCd = .4; return true; }
  p.flareMag--; p.atkCd = FLARE.fireGap;
  fireFlare(p, aim);
  if (p.flareMag <= 0 && p.flareReserve > 0) startFlareReload(p);
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
  sfx('flare');
}

// ---- 照明彈：飛行、燃燒（每幀由 game.js 的 update 呼叫）----
function updateFlares(dt) {
  if (G.flareShots && G.flareShots.length) {
    for (const s of G.flareShots) {
      s.t += dt;
      if (s.t >= s.T) {   // 落地：開始燃燒
        (G.flares = G.flares || []).push({ x: s.x1, y: s.y1, t: FLARE.burn, emberT: 0, seed: Math.random() * 10 });
        if (typeof hitHangiCapsAt === 'function') hitHangiCapsAt(s.x1, s.y1, 6);   // 照明彈落在順順宮帽上：打開帽子
        if (typeof sfxAt === 'function') sfxAt('fireImpact', s.x1, s.y1, .35, 'flare-land');
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

// ---- 彈藥箱：靠近按 Space／E 補滿照明彈 ----
function ammoCrates() {
  const list = [];
  for (const s of (MAP && MAP.stamps) || []) {
    if (!AMMO_CRATE.ids.includes(s.id)) continue;
    const t = mapTileById(s.id); if (!t) continue;
    const x0 = OX + s.c * CELL + (s.ox || 0), y0 = OY + s.r * CELL + (s.oy || 0), w = mapTileW(t) * CELL, h = mapTileH(t) * CELL;
    list.push({ stamp: s, x: x0 + w / 2, y: y0 + h - CELL / 2, top: y0 });
  }
  return list;
}
function ammoCrateNearPlayer() {
  const p = G.player; if (!p || p.sitting || MAP_SAFE) return null;
  let best = null, bd = AMMO_CRATE.radius;
  for (const c of ammoCrates()) { const d = Math.hypot(c.x - p.x, c.y - p.y); if (d < bd) { bd = d; best = c; } }
  return best;
}
function useAmmoCrateNearPlayer() {
  const crate = ammoCrateNearPlayer(); if (!crate) return false;
  const p = G.player; ensureFlareAmmo(p);
  if (p.flareMag >= FLARE.mag && p.flareReserve >= FLARE.reserveMax) { flash('照明彈已經是滿的', p.x, p.y - 70, '#9aa4b2', 1.2); sfx('error'); return true; }
  const got = (FLARE.mag - p.flareMag) + (FLARE.reserveMax - p.flareReserve);
  p.flareMag = FLARE.mag; p.flareReserve = FLARE.reserveMax; p.flareReloadT = 0;
  crate.stamp.openUntil = performance.now() + AMMO_CRATE.openFor * 1000;   // 箱子打開一下
  flash('🔥 照明彈補滿 +' + got, p.x, p.y - 70, '#ffb38a', 1.4);
  sfx('reload'); updateAmmoHud();
  return true;
}
// 剛補給過的關著的彈藥箱，暫時畫成打開的樣子（js/maploader.js 會問這裡）
function ammoCrateOpenTile(s) {
  if (s.id !== 'tile_field_ammo_crate' || !(s.openUntil > performance.now())) return null;
  return mapTileById(AMMO_CRATE.openId) || null;
}
