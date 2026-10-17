/* ===== 溫特的特殊槍：燃燒彈槍、麻醉槍 =====
   - 兩把都只能在後室撿到（上鎖的置物箱），撿到之後才會出現在武器切換裡（滾輪／數字鍵 3、4），找諾亞可以升級。
   - 燃燒彈槍：燃燒彈拋過去（會飛過怪物頭上），落地燒出一片火海（js/oil-barrels.js 的火海，敵我都會燙）。
     火海會點燃油汙、油桶，也會把生命體碎掉的那堆燒成灰。
   - 麻醉槍：麻醉針直線飛出去，打中的怪物睡著（不動、沒有傷害）；打中暴走的隊員：睡一下，醒來恢復正常。
     沒暴走的隊員不會被打到（麻醉針直接穿過去）。生命體沒有效果，大型怪物睡一半的時間。
   - 彈藥存在 equipState.gunAmmo（跟裝備一起存）；以後由後室的商店、轉蛋機補充，現在置物箱裡偶爾找得到。
   每一級的數值在 data/equipment.js 的 WEAPON_UPGRADES；下面是不分等級的數值。
*/
const SPECIAL_GUN = {
  incendiary: { range: 8, flight: [.32, .7], arc: [24, 70], fireDps: 10, burnDmg: 4 },   // 最遠幾格、飛行秒數（近～遠）、拋物線高度、火海每秒傷害、著火每秒傷害
  tranq: { range: 9, speed: 1100, gap: .35, hitR: 16, bigHp: 150 },   // 最遠幾格、飛行速度、兩發間隔、命中判定半徑、血量多少以上算大型怪物
};
const gunLevel = id => { const lv = (typeof equipState !== 'undefined' && equipState.weapons[id]) || 0; return lv ? WEAPON_UPGRADES[id].levels[lv - 1] : null; };
const gunMag = (id, lv) => (id === 'tranq' ? lv.mag : 1);
function gunAmmo(id) { return equipState.gunAmmo[id] || (equipState.gunAmmo[id] = { mag: 0, reserve: 0 }); }
// 武器有沒有拿到（手槍、照明彈槍一開始就有）
function weaponOwned(id) { const w = WEAPON_UPGRADES[id]; return !w || !w.field || (typeof equipState !== 'undefined' && (equipState.weapons[id] || 0) > 0); }

// ---- 取得：上鎖的置物箱打開時（js/storage-lockers.js 呼叫）----
function tryGunFind(x, y) {
  if (MAP_SAFE) return;
  const missing = ['incendiary', 'tranq'].filter(id => !weaponOwned(id));
  if (missing.length && Math.random() < GUN_FINDS.gun) {
    const id = missing[Math.floor(Math.random() * missing.length)], w = WEAPON_UPGRADES[id], st = GUN_FINDS.start[id];
    equipState.weapons[id] = 1; equipState.gunAmmo[id] = { mag: st.mag, reserve: st.reserve }; saveEquipment();
    if (typeof itemIntroForWeapon === 'function') itemIntroForWeapon(id);   // 第一次拿到：跳說明（js/item-intro.js）
    if (typeof battleGot === 'function') battleGot(w.name, w.image, 1);
    if (!equipState.loadout.sub) { equipState.loadout.sub = id; saveEquipment(); }   // 副武器格空著就直接裝上
    systemNotice('🎁 在置物箱裡找到「' + w.name + '」！' + (weaponInLoadout(id) ? '已裝在副武器，按 2 或滾輪切換' : '打開背包（B）可以換成主武器或副武器'));
    flash(w.icon + ' ' + w.name, x, y - 40, '#ffd479', 2.5);
    SFX.play('favorUp', .8, 'gun-get'); updateAmmoHud();
    return;
  }
  const owned = ['incendiary', 'tranq'].filter(weaponOwned);
  if (owned.length && Math.random() < GUN_FINDS.ammo) {
    const id = owned[Math.floor(Math.random() * owned.length)], a = gunAmmo(id), max = gunLevel(id).reserve;
    const n = Math.min(GUN_FINDS.ammoFind[id], max - a.reserve); if (n <= 0) return;
    a.reserve += n; saveEquipment();
    systemNotice('在置物箱裡找到' + (id === 'tranq' ? '麻醉針' : '燃燒彈') + ' +' + n);
    updateAmmoHud();
  }
}

// ---- 裝填、開火（game.js 的 updatePlayerAttack 呼叫）----
function startSpecialReload(id, p) {
  const lv = gunLevel(id); if (!lv) return;
  const a = gunAmmo(id);
  if (p.sgReload || a.mag >= gunMag(id, lv)) return;
  if (a.reserve <= 0) { flash((id === 'tranq' ? '麻醉針' : '燃燒彈') + '用完了', p.x, p.y - 70, '#ff9f7a', 1.4); sfx('error'); return; }
  p.sgReload = { id, t: lv.reload }; sfx('reload');
}
function updateSpecialGun(id, p, dt, aim, canFire) {
  const lv = gunLevel(id); if (!lv) return;
  const a = gunAmmo(id);
  if (p.sgReload && p.sgReload.id !== id) p.sgReload = null;   // 換槍：另一把的裝填作廢
  if (p.sgReload) {
    p.sgReload.t -= dt;
    if (p.sgReload.t <= 0) { const n = Math.min(gunMag(id, lv) - a.mag, a.reserve); a.mag += n; a.reserve -= n; p.sgReload = null; saveEquipment(); }
    return;
  }
  if (!canFire) return;
  if (a.mag <= 0) { startSpecialReload(id, p); p.atkCd = .4; return; }
  a.mag--;
  if (id === 'incendiary') fireIncendiary(p, aim, lv); else fireTranq(p, aim, lv);
  saveEquipment();
  if (a.mag <= 0 && a.reserve > 0) startSpecialReload(id, p);
}
// 右下角彈藥數（game.js 的 updateAmmoHud 呼叫）
function specialGunHud(id, p) {
  const a = gunAmmo(id);
  if (p.sgReload && p.sgReload.id === id) return 'Reload';
  return a.mag + ' / ' + a.reserve + (a.mag + a.reserve <= 0 ? '<small>沒有彈藥了</small>' : '');
}
function aimPose(p, ang) {
  p.dir = Math.abs(Math.cos(ang)) >= Math.abs(Math.sin(ang)) ? (Math.cos(ang) < 0 ? 'left' : 'right') : (Math.sin(ang) < 0 ? 'back' : 'front');
  p.gunT = .45; p.recoilT = .14; p.recoilAng = ang;
}
// 沿著瞄準線走，碰到牆就停在牆前；回傳能走多遠
function clearDistance(p, ang, want) {
  let dist = 0;
  for (let d = 8; d <= want; d += 8) {
    const [c, r] = cellAt(p.x + Math.cos(ang) * d, p.y + Math.sin(ang) * d);
    if (!inGrid(c, r) || isWall(c, r)) break;
    dist = d;
  }
  return dist;
}

// ---- 燃燒彈 ----
function fireIncendiary(p, aim, lv) {
  const S = SPECIAL_GUN.incendiary, ang = Math.atan2(aim.y - p.y, aim.x - p.x);
  const dist = clearDistance(p, ang, Math.min(Math.hypot(aim.x - p.x, aim.y - p.y), S.range * CELL)), k = dist / (S.range * CELL);
  aimPose(p, ang); p.atkCd = .5;
  const { x: mx, y: my } = gunMuzzleAt(p, ang);
  (G.incShots = G.incShots || []).push({ x0: mx, y0: my, x1: p.x + Math.cos(ang) * dist, y1: p.y + Math.sin(ang) * dist, t: 0,
    T: S.flight[0] + (S.flight[1] - S.flight[0]) * k, h: S.arc[0] + (S.arc[1] - S.arc[0]) * k, lv });
  G.effects.push({ muzzle: true, x: mx, y: my, ang, life: .12, life0: .12 });
  addLightFlash('muzzle', mx, my, 1.4);
  sfx('flare');
}
function incendiaryLand(s) {
  const x = s.x1, y = s.y1, R = s.lv.r * CELL, S = SPECIAL_GUN.incendiary;
  addOilFire(x, y, R, s.lv.burn, S.fireDps);
  igniteSlicksNear(x, y, R);
  if (typeof burnLifePilesNear === 'function') burnLifePilesNear(x, y, R);   // 生命體碎掉的那堆：燒成灰（js/lifeform.js）
  if (typeof hitHangiCapsAt === 'function') hitHangiCapsAt(x, y, 6);
  if (s.lv.ignite) for (const e of G.enemies) {   // Lv3：被炸到的怪物身上著火
    if (e.dead || Math.hypot(e.x - x, (e.y - y) / .7) > R) continue;
    e.burnT = Math.max(e.burnT || 0, s.lv.ignite); e.burnDmg = S.burnDmg; e.burnTick = 1;
  }
  for (let i = 0; i < 7; i++) { const a = Math.random() * Math.PI * 2, rr = Math.random() * R * .7; spawnFlameBurst(x + Math.cos(a) * rr, y + Math.sin(a) * rr * .6, 1); }
  G.effects.push({ ring: true, x, y, r: 6, r2: R, life: .3, life0: .3, color: '#ff9a3c' });
  addLightFlash('flame', x, y, 1.3);
  if (typeof nearbyImpact === 'function') nearbyImpact(x, y, 4, .08);
  if (typeof sfxAt === 'function') sfxAt('fireImpact', x, y, .6, 'incendiary-land');
}

// ---- 麻醉針 ----
function fireTranq(p, aim, lv) {
  const S = SPECIAL_GUN.tranq, ang = Math.atan2(aim.y - p.y, aim.x - p.x), want = S.range * CELL;
  aimPose(p, ang); p.atkCd = S.gap;
  const dist = clearDistance(p, ang, want);
  // 沿路線找第一個打到的：怪物、或暴走的隊員（沒暴走的隊員直接穿過去）
  const cands = [];
  for (const e of G.enemies) if (!e.dead && e.hp > 0) cands.push(e);
  for (const t of G.towers) if (t.berserk && t.hp > 0) cands.push(t);
  let target = null, hitD = dist;
  for (const o of cands) {
    const b = typeof targetBodyBox === 'function' && o.maxhp != null && G.enemies.includes(o) ? targetBodyBox(o) : { cx: o.x, cy: o.y - 20 };
    for (const [px, py] of [[o.x, o.y], [b.cx, b.cy]]) {
      const along = (px - p.x) * Math.cos(ang) + (py - p.y) * Math.sin(ang);
      if (along < 0 || along > hitD) continue;
      const off = Math.abs(-(px - p.x) * Math.sin(ang) + (py - p.y) * Math.cos(ang));
      if (off <= S.hitR) { target = o; hitD = along; break; }
    }
  }
  const { x: mx, y: my } = gunMuzzleAt(p, ang);
  const x1 = p.x + Math.cos(ang) * hitD, y1 = p.y + Math.sin(ang) * hitD;
  (G.tranqDarts = G.tranqDarts || []).push({ x0: mx, y0: my, x1, y1, ang, t: 0, T: Math.max(.04, hitD / S.speed), target, lv });
  G.effects.push({ muzzle: true, x: mx, y: my, ang, life: .05, life0: .05 });
  if (typeof sfxAt === 'function') sfxAt('gunshot', mx, my, .18, 'tranq'); else sfx('switch');
}
function tranqHit(o, lv) {
  if (G.towers.includes(o)) {   // 暴走的隊員：睡著，醒來恢復正常
    if (!o.berserk || o.hp <= 0) return false;
    o.berserk = false; o.taint = Math.min(o.taint, 55); o.sleepT = lv.sleep;
    o.meleeSwing = null; o.gunSwing = null; o.target = null; o.moving = false;
    sentryStatus(o, '睡著了…醒來就會恢復正常', '#b9a7ff');
    return true;
  }
  if (o.dead || o.hp <= 0) return false;
  if (o.noStun) { flash('沒有效果', o.x, o.y - 40, '#9aa4b2'); return false; }   // 生命體
  const dur = lv.sleep * ((o.maxhp || 0) >= SPECIAL_GUN.tranq.bigHp ? .5 : 1);
  o.stunT = Math.max(o.stunT || 0, dur); o.sleepT = Math.max(o.sleepT || 0, dur); o.shockT = 0;
  o.hitT = Math.max(o.hitT || 0, .12); o.hitColor = '#b9a7ff';
  flash('💤', o.x, o.y - 44, '#b9a7ff', 1);
  return true;
}
function tranqLand(s) {
  const hits = new Set();
  if (s.target && tranqHit(s.target, s.lv)) hits.add(s.target);
  G.effects.push({ ring: true, x: s.x1, y: s.y1, r: 2, r2: 8, life: .14, life0: .14, color: '#c9b8ff' });
  if (!s.lv.mist || !s.target) return;
  const R = s.lv.mist * CELL;   // Lv3：麻醉霧，附近的也一起睡
  for (const o of [...G.enemies, ...G.towers]) if (!hits.has(o) && Math.hypot(o.x - s.x1, o.y - s.y1) <= R) tranqHit(o, s.lv);
  G.effects.push({ ring: true, x: s.x1, y: s.y1, r: 8, r2: R, life: .5, life0: .5, color: '#b9a7ff' });
  for (let i = 0; i < 10; i++) { const a = Math.random() * Math.PI * 2, rr = Math.random() * R * .8;
    G.effects.push({ ember: true, x: s.x1 + Math.cos(a) * rr, y: s.y1 + Math.sin(a) * rr * .6, vx: (Math.random() - .5) * 20, vy: -10 - Math.random() * 15, r: 4 + Math.random() * 4, life: .9, life0: .9, color: 'rgba(190,170,255,.55)' }); }
}

// ---- 每幀（game.js 的 update 呼叫）----
function updateSpecialGuns(dt) {
  if (G.incShots && G.incShots.length) {
    for (const s of G.incShots) {
      s.t += dt;
      if (s.t >= s.T) incendiaryLand(s);
      else if (Math.random() < .5) { const { x, y } = incShotPos(s);
        G.effects.push({ ember: true, spark: true, x, y, vx: (Math.random() - .5) * 30, vy: (Math.random() - .5) * 30, r: 1.4, life: .3, life0: .3, color: '#ffb36a' }); }
    }
    G.incShots = G.incShots.filter(s => s.t < s.T);
  }
  if (G.tranqDarts && G.tranqDarts.length) {
    for (const s of G.tranqDarts) { s.t += dt; if (s.t >= s.T) tranqLand(s); }
    G.tranqDarts = G.tranqDarts.filter(s => s.t < s.T);
  }
  for (const e of G.enemies) if (e.sleepT > 0) { e.sleepT -= dt; if (!(e.stunT > 0)) e.sleepT = 0; }   // 被別的方式解除停住：也醒了
}
function incShotPos(s) {
  const k = Math.min(1, s.t / s.T);
  return { x: s.x0 + (s.x1 - s.x0) * k, y: s.y0 + (s.y1 - s.y0) * k - Math.sin(k * Math.PI) * s.h, gx: s.x0 + (s.x1 - s.x0) * k, gy: s.y0 + (s.y1 - s.y0) * k };
}

// ---- 繪製 ----
function drawSpecialShots(ctx) {   // 飛行中的燃燒彈、麻醉針（render.js 畫在角色上面）
  for (const s of (G.incShots || [])) {
    const { x, y, gx, gy } = incShotPos(s);
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(gx, gy + 6, 5, 2, 0, 0, Math.PI * 2); ctx.fill();   // 地上的影子
    ctx.translate(x, y); ctx.rotate(s.t * 14);
    ctx.fillStyle = '#5a3a22'; ctx.fillRect(-4, -3, 8, 6); ctx.fillStyle = '#e0612e'; ctx.fillRect(-4, -3, 3, 6);
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 10); g.addColorStop(0, 'rgba(255,190,110,.7)'); g.addColorStop(1, 'rgba(255,90,30,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  for (const s of (G.tranqDarts || [])) {
    const k = Math.min(1, s.t / s.T), x = s.x0 + (s.x1 - s.x0) * k, y = s.y0 + (s.y1 - s.y0) * k;
    ctx.save(); ctx.translate(x, y); ctx.rotate(s.ang);
    ctx.strokeStyle = '#d8dee6'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(4, 0); ctx.stroke();   // 針身
    ctx.fillStyle = '#c9b8ff'; ctx.beginPath(); ctx.arc(-8, 0, 2.6, 0, Math.PI * 2); ctx.fill();   // 尾端的毛球
    ctx.restore();
  }
}
function drawSleepMarks(ctx) {   // 睡著的怪物、隊員頭上飄 Zzz（render.js 在黑幕上面畫）
  const now = performance.now() / 1000;
  ctx.save(); ctx.textAlign = 'center'; ctx.font = 'bold 12px sans-serif';
  for (const o of [...(G.enemies || []), ...(G.towers || [])]) {
    if (!(o.sleepT > 0) || o.dead || (o.hp <= 0 && G.towers.includes(o))) continue;
    if (G.enemies.includes(o) && !isVisible(o.x, o.y)) continue;
    const top = o.y - (o.drawHeight || 50) - 6;
    for (let i = 0; i < 3; i++) {
      const k = (now * .8 + i / 3) % 1;
      ctx.globalAlpha = Math.sin(k * Math.PI) * .9; ctx.fillStyle = '#c9b8ff';
      ctx.font = 'bold ' + (9 + i * 2) + 'px sans-serif';
      ctx.fillText('z', o.x + 6 + k * 10 + i * 3, top - k * 16);
    }
  }
  ctx.restore();
}
