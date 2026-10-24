/* ===== 手槍的特殊子彈：燃燒彈、麻醉彈、分裂彈、閃光彈、雷電彈、治療彈（data/equipment.js 的 BULLETS）=====
   - 在後室的置物箱找得到（第一次找到＝拿到這種子彈），之後用滾輪換到它（js/flare.js）。效果固定，不會升級。
   - 燃燒彈：拋過去（會飛過怪物頭上），落地燒出一片火海（js/oil-barrels.js 的火海，敵我都會燙）。
     火海會點燃油汙、油桶，也會把生命體碎掉的那堆燒成灰。
   - 麻醉彈：直線飛出去，打中的怪物睡著（不動、沒有傷害）；打中暴走的隊員：睡一下，醒來恢復正常。
     打中沒暴走的隊員：一樣睡著（不動、不攻擊），負荷不變。生命體沒有效果，大型怪物睡一半的時間。
   - 分裂彈：一次扇形噴出好幾顆小子彈（每顆各自算打到誰）。
   - 閃光彈：拋過去落地爆出強光，範圍內的怪物暈眩；隊員也會被閃到（站著不動、不攻擊）。生命體沒有效果。
   - 雷電彈：直線打中的怪物觸電受傷、麻痺，電流再跳到附近幾隻；打到的地方旁邊有隊員也會被電到。
   - 治療彈：直線打中誰就補誰的 HP（隊員、怪物都會補；暴走的隊員也補）。
   - 數量存在 equipState.bullets（js/flare.js 的 bulletCount／addBullets）；每種的數值在 data/equipment.js 的 BULLETS。
*/
const SPECIAL_GUN = {
  incendiary: { range: 8, flight: [.32, .7], arc: [24, 70], fireDps: 10, burnDmg: 4 },   // 最遠幾格、飛行秒數（近～遠）、拋物線高度、火海每秒傷害、著火每秒傷害
  tranq: { range: 9, speed: 1100, hitR: 16, bigHp: 150 },   // 最遠幾格、飛行速度、命中判定半徑、血量多少以上算大型怪物
};
// 舊的：武器有沒有拿到（開發工坊、背包現在只有手槍）
function weaponOwned(id) { const w = WEAPON_UPGRADES[id]; if (w && w.removed) return false;
  return !w || !w.field || (typeof equipState !== 'undefined' && (equipState.weapons[id] || 0) > 0); }

// ---- 取得：上鎖的置物箱打開時（js/storage-lockers.js 呼叫）----
function tryGunFind(x, y) {
  if (MAP_SAFE || Math.random() >= GUN_FINDS.ammo) return;
  const kinds = GUN_FINDS.kinds.filter(id => BULLETS[id] && !BULLETS[id].removed && bulletCount(id) < BULLETS[id].max);   // 滿了的不會再找到
  if (!kinds.length) return;
  const id = kinds[Math.floor(Math.random() * kinds.length)];
  grantBullets(id, GUN_FINDS.ammoFind[id] || 1, '在置物箱裡找到', x, y);
}
// 拿到子彈：第一次拿到跳說明；回傳加了幾發
function grantBullets(id, n, how, x, y) {
  const b = BULLETS[id]; if (!b) return 0;
  const first = !bulletOwned(id), got = addBullets(id, n);
  if (first && typeof itemIntroForBullet === 'function') itemIntroForBullet(id, got);
  if (typeof battleGot === 'function') battleGot(b.icon + ' ' + b.name, null, got);
  systemNotice((how || '找到') + b.icon + ' ' + b.name + ' +' + got + (first ? '！滾輪可以換成這種子彈' : '（現在 ' + bulletCount(id) + ' / ' + b.max + '）'));
  if (x != null) flash(b.icon + ' ' + b.name + ' +' + got, x, y - 40, b.color, 1.2);
  if (first) SFX.play('favorUp', .8, 'gun-get');
  return got;
}

// ---- 開火（game.js 的 updatePlayerAttack 呼叫）----
function updateSpecialGun(id, p, dt, aim, canFire) {
  if (!canFire) return;
  if (bulletCount(id) <= 0) { dryFire(p, aim, id); return; }
  useBullet(id);
  const b = BULLETS[id];
  const fire = { incendiary: fireIncendiary, tranq: fireTranq, split: fireSplit, flash: fireFlashBang, shock: fireShock, heal: fireHeal }[id];
  if (fire) fire(p, aim, b);
  p.atkCd = b.gap;
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
  aimPose(p, ang);
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
  if (s.lv.ignite) for (const e of G.enemies) {   // ignite：被炸到的怪物身上著火
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
  aimPose(p, ang);
  const dist = clearDistance(p, ang, want);
  // 沿路線找第一個打到的：怪物、或隊員（暴走的、沒暴走的都會被打到）
  const cands = [];
  for (const e of G.enemies) if (!e.dead && e.hp > 0) cands.push(e);
  for (const t of G.towers) if (t.hp > 0 && !t.eatenBy) cands.push(t);
  const { target, d: hitD } = lineHit(p, ang, dist, cands, S.hitR);
  const { x: mx, y: my } = gunMuzzleAt(p, ang);
  let x1 = p.x + Math.cos(ang) * hitD, y1 = p.y + Math.sin(ang) * hitD;
  if (!target) { const cap = shotOpensHangiCap(p, ang, hitD); if (cap) { x1 = cap.x; y1 = cap.y; } }   // 麻醉針打到順順宮帽：打開
  (G.tranqDarts = G.tranqDarts || []).push({ x0: mx, y0: my, x1, y1, ang, t: 0, T: Math.max(.04, hitD / S.speed), target, lv });
  G.effects.push({ muzzle: true, x: mx, y: my, ang, life: .05, life0: .05 });
  if (typeof sfxAt === 'function') sfxAt('gunshot', mx, my, .18, 'tranq'); else sfx('switch');
}
function tranqHit(o, lv) {
  if (G.towers.includes(o)) {   // 隊員：睡著（暴走的醒來恢復正常；沒暴走的就只是睡一下，負荷不變）
    if (o.hp <= 0 || o.eatenBy) return false;
    const wasBerserk = o.berserk;
    if (wasBerserk) { o.berserk = false; o.taint = Math.min(o.taint, 55); }
    o.sleepT = Math.max(o.sleepT || 0, lv.sleep);
    o.meleeSwing = null; o.gunSwing = null; o.target = null; o.moving = false;
    flash('💤', o.x, o.y - 44, '#b9a7ff', 1);   // 不設 hitT：隊員的 hitT＝被怪物打（行軍床、反擊都看它）
    sentryStatus(o, wasBerserk ? '睡著了…' : '被麻醉針打中，睡著了…', '#b9a7ff');
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
  const R = s.lv.mist * CELL;   // mist：麻醉霧，附近的也一起睡
  for (const o of [...G.enemies, ...G.towers]) if (!hits.has(o) && Math.hypot(o.x - s.x1, o.y - s.y1) <= R) tranqHit(o, s.lv);
  G.effects.push({ ring: true, x: s.x1, y: s.y1, r: 8, r2: R, life: .5, life0: .5, color: '#b9a7ff' });
  for (let i = 0; i < 10; i++) { const a = Math.random() * Math.PI * 2, rr = Math.random() * R * .8;
    G.effects.push({ ember: true, x: s.x1 + Math.cos(a) * rr, y: s.y1 + Math.sin(a) * rr * .6, vx: (Math.random() - .5) * 20, vy: -10 - Math.random() * 15, r: 4 + Math.random() * 4, life: .9, life0: .9, color: 'rgba(190,170,255,.55)' }); }
}

// ---- 共用：沿瞄準線找第一個打到的（腳底或身體中心離線夠近就算）----
function lineHit(p, ang, maxD, cands, hitR) {
  let target = null, d = maxD;
  for (const o of cands) {
    const b = typeof targetBodyBox === 'function' && G.enemies.includes(o) ? targetBodyBox(o) : { cx: o.x, cy: o.y - 20 };
    for (const [px, py] of [[o.x, o.y], [b.cx, b.cy]]) {
      const along = (px - p.x) * Math.cos(ang) + (py - p.y) * Math.sin(ang);
      if (along < 0 || along > d) continue;
      const off = Math.abs(-(px - p.x) * Math.sin(ang) + (py - p.y) * Math.cos(ang));
      if (off <= hitR) { target = o; d = along; break; }
    }
  }
  return { target, d };
}
const liveEnemies = () => G.enemies.filter(e => !e.dead && e.hp > 0);
const bodyPoint = o => G.enemies.includes(o) && typeof targetBodyBox === 'function' ? (b => ({ x: b.cx, y: b.cy }))(targetBodyBox(o)) : { x: o.x, y: o.y - 20 };
// 子彈打中怪物：扣血、吸仇恨、閃色、跳數字（跟一般子彈一樣）
function bulletHurtEnemy(e, dmg, col, p) {
  e.hp -= dmg;
  if (!(e.playerAggroT > 0)) e.alertT = ENEMY_ALERT_TIME;
  e.playerAggroT = PLAYER_ATK.aggro;
  e.hitT = Math.max(e.hitT || 0, .14); e.hitColor = col;
  enemyHitReact(e, p.x, p.y, false);
  flashDmg('-' + Math.round(dmg), e.x, e.y - 26, col);
  if (typeof sfxMonsterHit === 'function') sfxMonsterHit(e, .4, 'player');
}
// 子彈波及隊員（雷電彈）：照防禦打折
function bulletHurtTower(t, dmg, col) {
  if (t.hp <= 0) return;
  const def = Math.max(0, Math.min(.75, TYPES[t.type]?.defense || 0)), hurt = dmg * (1 - def);
  t.hp = Math.max(0, t.hp - hurt); t.hitT = Math.max(t.hitT || 0, .2); t.hitColor = col;
  flashDmg('-' + Math.round(hurt), t.x, t.y - 30, col);
  if (t.hp <= 0) { t.target = null; sentryStatus(t, '失去戰鬥能力', '#ff5b6e', true); }
}

// ---- 分裂彈：扇形噴出好幾顆小子彈 ----
// 沒打到怪物時：沿著子彈的路線打到順順宮帽就把它打開（跟一般手槍一樣，js/hangi-bao.js），回傳命中點；沒打到回傳 null
function shotOpensHangiCap(p, ang, d) {
  if (typeof shootHangiCapOnLine !== 'function') return null;
  return shootHangiCapOnLine(p.x, p.y, p.x + Math.cos(ang) * d, p.y + Math.sin(ang) * d);
}
function fireSplit(p, aim, b) {
  const ang = Math.atan2(aim.y - p.y, aim.x - p.x), range = b.range * CELL, hits = new Map();
  aimPose(p, ang);
  const { x: mx, y: my } = gunMuzzleAt(p, ang), cands = liveEnemies();
  for (let i = 0; i < b.pellets; i++) {
    const a = ang + (b.pellets > 1 ? (i / (b.pellets - 1) - .5) * b.spread : 0) + (Math.random() - .5) * .05;
    const dist = clearDistance(p, a, range), r = lineHit(p, a, dist, cands, 14);
    let ex = p.x + Math.cos(a) * r.d, ey = p.y + Math.sin(a) * r.d;
    if (!r.target) { const cap = shotOpensHangiCap(p, a, r.d); if (cap) { ex = cap.x; ey = cap.y; } }   // 彈丸打到順順宮帽：打開
    G.effects.push({ bullet: true, x1: mx, y1: my, x2: ex, y2: ey, life: .08, life0: .08, color: b.color });
    if (r.target) { hits.set(r.target, (hits.get(r.target) || 0) + b.dmg); G.effects.push({ ring: true, x: ex, y: ey, r: 2, r2: 7, life: .12, life0: .12, color: b.color }); }
  }
  for (const [e, dmg] of hits) bulletHurtEnemy(e, dmg, b.color, p);
  G.effects.push({ muzzle: true, x: mx, y: my, ang, life: .09, life0: .09 });
  addLightFlash('muzzle', mx, my, 1.2);
  if (typeof spawnShellCasing === 'function') spawnShellCasing(mx, my, ang);
  sfx('gunshot');
}

// ---- 閃光彈：拋過去，落地爆出強光（敵我都暈）----
function fireFlashBang(p, aim, b) {
  const S = SPECIAL_GUN.incendiary, ang = Math.atan2(aim.y - p.y, aim.x - p.x), range = b.range * CELL;
  const dist = clearDistance(p, ang, Math.min(Math.hypot(aim.x - p.x, aim.y - p.y), range)), k = dist / range;
  aimPose(p, ang);
  const { x: mx, y: my } = gunMuzzleAt(p, ang);
  (G.flashShots = G.flashShots || []).push({ x0: mx, y0: my, x1: p.x + Math.cos(ang) * dist, y1: p.y + Math.sin(ang) * dist, t: 0,
    T: S.flight[0] + (S.flight[1] - S.flight[0]) * k, h: S.arc[0] + (S.arc[1] - S.arc[0]) * k, lv: b });
  G.effects.push({ muzzle: true, x: mx, y: my, ang, life: .1, life0: .1 });
  sfx('switch');
}
function flashBangLand(s) {
  const x = s.x1, y = s.y1, R = s.lv.r * CELL, stun = s.lv.stun;
  for (const e of liveEnemies()) {
    if (Math.hypot(e.x - x, (e.y - y) / .8) > R) continue;
    if (e.noStun) { flash('沒有效果', e.x, e.y - 40, '#9aa4b2'); continue; }   // 生命體
    const dur = stun * ((e.maxhp || 0) >= SPECIAL_GUN.tranq.bigHp ? .5 : 1);
    e.stunT = Math.max(e.stunT || 0, dur); e.dazeT = Math.max(e.dazeT || 0, dur);
    e.hitT = Math.max(e.hitT || 0, .2); e.hitColor = '#ffffff';
  }
  for (const t of G.towers) {   // 隊員也被閃到
    if (t.hp <= 0 || Math.hypot(t.x - x, (t.y - y) / .8) > R) continue;
    t.dazeT = Math.max(t.dazeT || 0, stun); t.target = null; t.moving = false;
    sentryStatus(t, '被閃到了！', '#fff6a8');
  }
  G.effects.push({ ring: true, x, y, r: 10, r2: R, life: .35, life0: .35, color: '#fffbe0' });
  G.effects.push({ ring: true, x, y, r: 4, r2: R * .6, life: .22, life0: .22, color: '#ffffff' });
  for (let i = 0; i < 14; i++) { const a = Math.random() * Math.PI * 2, sp = 90 + Math.random() * 120;
    G.effects.push({ ember: true, spark: true, x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * .7, r: 1.6, life: .3, life0: .3, color: '#fff6c8' }); }
  addLightFlash('lightning', x, y, 3);
  G.flashBangs = G.flashBangs || []; G.flashBangs.push({ x, y, t: .45, T: .45, R });   // 畫面上的白光（drawFlashBangs）
  if (typeof nearbyImpact === 'function') nearbyImpact(x, y, 3, .06);
  if (typeof sfxAt === 'function') { sfxAt('smallBoom', x, y, .6, 'flashbang'); sfxAt('glassBreak3', x, y, .25, 'flashbang-ring'); }
}

// ---- 雷電彈：直線打中，電流跳到附近的怪物；旁邊的隊員也會被電到 ----
function fireShock(p, aim, b) {
  const ang = Math.atan2(aim.y - p.y, aim.x - p.x);
  aimPose(p, ang);
  const dist = clearDistance(p, ang, 9 * CELL), r = lineHit(p, ang, dist, liveEnemies(), 16);
  const { x: mx, y: my } = gunMuzzleAt(p, ang);
  const capHit = r.target ? null : shotOpensHangiCap(p, ang, r.d);   // 電擊打到順順宮帽：打開
  const end = r.target ? bodyPoint(r.target) : capHit || { x: p.x + Math.cos(ang) * r.d, y: p.y + Math.sin(ang) * r.d };
  G.effects.push({ bullet: true, x1: mx, y1: my, x2: end.x, y2: end.y, life: .12, life0: .12, color: b.color });
  G.effects.push({ muzzle: true, x: mx, y: my, ang, life: .08, life0: .08 });
  const struck = [];   // 被電到的地方（隊員在旁邊就會被波及）
  if (r.target) {
    const hits = [r.target];
    for (let k = 0; k < b.chain; k++) {   // 跳到離上一隻最近、還沒被電到的怪物
      const cur = hits[hits.length - 1]; let next = null, nd = b.chainR * CELL;
      for (const e of liveEnemies()) { if (hits.includes(e)) continue; const d = Math.hypot(e.x - cur.x, e.y - cur.y); if (d < nd) { nd = d; next = e; } }
      if (!next) break;
      const a = bodyPoint(cur), c = bodyPoint(next);
      G.effects.push({ bullet: true, x1: a.x, y1: a.y, x2: c.x, y2: c.y, life: .18, life0: .18, color: '#d8f4ff' });
      hits.push(next);
    }
    hits.forEach((e, i) => {
      const dmg = Math.round(b.dmg * (i ? .7 : 1) * (e.shockResist ?? 1));   // 跳出去的弱一點；不怕電的（小丑魚）只吃 shockResist 倍
      bulletHurtEnemy(e, dmg, b.color, p);
      if (!e.noStun && e.shockResist == null) { e.stunT = Math.max(e.stunT || 0, b.stun); e.shockT = Math.max(e.shockT || 0, b.stun); }   // 不怕電的不會麻痺
      const bp = bodyPoint(e); spawnLightningBolt(bp.x, bp.y + 10, .6); struck.push(e);
    });
  } else struck.push({ x: end.x, y: end.y });
  for (const t of G.towers) {   // 波及隊員：離被電到的地方一格內
    if (t.hp <= 0 || !struck.some(o => Math.hypot(t.x - o.x, t.y - o.y) <= CELL * 1.1)) continue;
    bulletHurtTower(t, b.dmg * .6, b.color); t.dazeT = Math.max(t.dazeT || 0, .6);
    sentryStatus(t, '被電到了！', b.color);
  }
  addLightFlash('lightning', end.x, end.y, 1);
  if (typeof sfxAt === 'function') sfxAt('lightningImpact', end.x, end.y, .55, 'shock-bullet');
}

// ---- 治療彈：打中誰就補誰 ----
function fireHeal(p, aim, b) {
  const ang = Math.atan2(aim.y - p.y, aim.x - p.x);
  aimPose(p, ang);
  const cands = [...liveEnemies(), ...G.towers.filter(t => t.hp > 0)];
  const dist = clearDistance(p, ang, 10 * CELL), r = lineHit(p, ang, dist, cands, 18);
  const { x: mx, y: my } = gunMuzzleAt(p, ang);
  const end = r.target ? bodyPoint(r.target) : { x: p.x + Math.cos(ang) * r.d, y: p.y + Math.sin(ang) * r.d };
  G.effects.push({ bullet: true, x1: mx, y1: my, x2: end.x, y2: end.y, life: .14, life0: .14, color: b.color });
  G.effects.push({ muzzle: true, x: mx, y: my, ang, life: .06, life0: .06 });
  G.effects.push({ ring: true, x: end.x, y: end.y, r: 3, r2: r.target ? 22 : 10, life: .3, life0: .3, color: b.color });
  if (r.target) {
    const o = r.target, before = o.hp;
    o.hp = Math.min(o.maxhp || o.hp + b.heal, o.hp + b.heal);
    const got = Math.round(o.hp - before), enemy = G.enemies.includes(o);
    flash('+' + got, o.x, o.y - (enemy ? 30 : 40), enemy ? '#ff9a9a' : b.color, 1);
    if (enemy) flash('幫怪物補血了…', o.x, o.y - 56, '#ff9a9a', 1.2);
    for (let i = 0; i < 8; i++) G.effects.push({ ember: true, x: end.x + (Math.random() - .5) * 18, y: end.y + (Math.random() - .5) * 10, vx: (Math.random() - .5) * 12, vy: -20 - Math.random() * 25, r: 2 + Math.random() * 2, life: .7, life0: .7, color: b.color });
    sfx('soothe');
  } else sfx('switch');
}

// ---- 每幀（game.js 的 update 呼叫）----
function updateSpecialGuns(dt) {
  if (G.flashShots && G.flashShots.length) {
    for (const s of G.flashShots) { s.t += dt; if (s.t >= s.T) flashBangLand(s); }
    G.flashShots = G.flashShots.filter(s => s.t < s.T);
  }
  if (G.flashBangs && G.flashBangs.length) { for (const f of G.flashBangs) f.t -= dt; G.flashBangs = G.flashBangs.filter(f => f.t > 0); }
  for (const e of G.enemies) if (e.dazeT > 0) { e.dazeT -= dt; if (!(e.stunT > 0)) e.dazeT = 0; }
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
function drawSpecialShots(ctx) {   // 飛行中的燃燒彈、麻醉彈、閃光彈（render.js 畫在角色上面）
  for (const s of (G.flashShots || [])) {
    const { x, y, gx, gy } = incShotPos(s);
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(gx, gy + 6, 5, 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.translate(x, y); ctx.rotate(s.t * 12);
    ctx.fillStyle = '#4d5560'; ctx.fillRect(-3, -5, 6, 10); ctx.fillStyle = '#c9d3dc'; ctx.fillRect(-3, -5, 6, 2); ctx.fillStyle = '#ffe36a'; ctx.fillRect(-3, 1, 6, 1.5);
    ctx.restore();
  }
  for (const f of (G.flashBangs || [])) {   // 閃光：一大片白光（畫在角色上面）
    const k = f.t / f.T;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(f.x, f.y - 10, 0, f.x, f.y - 10, f.R * 1.3);
    g.addColorStop(0, `rgba(255,255,240,${(.95 * k).toFixed(3)})`); g.addColorStop(.4, `rgba(255,250,210,${(.45 * k).toFixed(3)})`); g.addColorStop(1, 'rgba(255,250,210,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(f.x, f.y - 10, f.R * 1.3, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
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
// ---- 漆彈：打中的怪物沾上螢光漆，隊員優先集火（js/game.js 的 pickSentryTarget、js/sentry.js 的追擊）----
function paintTarget() {   // 現在被標記的怪物（死掉、不見了＝沒有）
  const e = G.paintTarget;
  if (e && (e.dead || e.hp <= 0 || !G.enemies.includes(e))) G.paintTarget = null;
  return G.paintTarget || null;
}
function paintMark(e) {
  const old = paintTarget();
  G.paintTarget = e; e.paintAt = performance.now();
  if (old !== e) { flash('🎯 集火！', e.x, e.y - 56, BULLETS.paint.color, .9); systemNotice('隊員優先攻擊被漆彈標記的怪物'); }
  for (let i = 0; i < 8; i++) { const a = Math.random() * Math.PI * 2, b = targetBodyBox(e);
    G.effects.push({ ember: true, spark: true, x: b.cx, y: b.cy, vx: Math.cos(a) * 70, vy: Math.sin(a) * 70, r: 1.6, life: .3, life0: .3, color: BULLETS.paint.color }); }
}
// 螢光漆：畫在黑幕上面（躲進黑暗也看得到），身上幾塊漆＋腳下轉動的準心
function drawPaintMarks(ctx) {
  const e = paintTarget(); if (!e) return;
  const now = performance.now() / 1000, b = targetBodyBox(e), col = BULLETS.paint.color, pop = Math.min(1, (performance.now() - (e.paintAt || 0)) / 180);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(b.cx, b.cy, 0, b.cx, b.cy, 30);
  g.addColorStop(0, 'rgba(255,95,214,.35)'); g.addColorStop(1, 'rgba(255,95,214,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(b.cx, b.cy, 30, 0, Math.PI * 2); ctx.fill();
  ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = col;
  for (const [dx, dy, r] of [[-5, -3, 5], [4, 2, 4], [-1, 6, 3], [6, -6, 2.5]]) { ctx.beginPath(); ctx.arc(b.cx + dx, b.cy + dy, r * pop, 0, Math.PI * 2); ctx.fill(); }
  ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.globalAlpha = .85;
  ctx.translate(e.x, e.y + 4); ctx.scale(1, .45); ctx.rotate(now * 1.6);
  const R = 22 + 2 * Math.sin(now * 5);
  for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(0, 0, R, i * Math.PI / 2 + .25, i * Math.PI / 2 + Math.PI / 2 - .25); ctx.stroke(); }
  ctx.restore();
}
function drawSleepMarks(ctx) {   // 睡著的怪物、隊員頭上飄 Zzz；暈眩的頭上轉星星（render.js 在黑幕上面畫）
  const now = performance.now() / 1000;
  ctx.save(); ctx.textAlign = 'center'; ctx.font = 'bold 12px sans-serif';
  for (const o of [...(G.enemies || []), ...(G.towers || [])]) {
    if (!(o.dazeT > 0) || o.dead || o.hp <= 0) continue;
    if (G.enemies.includes(o) && !isVisible(o.x, o.y)) continue;
    const top = o.y - (o.drawHeight || 50) - 4;
    for (let i = 0; i < 3; i++) {
      const a = now * 5 + i * Math.PI * 2 / 3;
      ctx.globalAlpha = .9; ctx.fillStyle = '#fff2a0'; ctx.font = 'bold 11px sans-serif';
      ctx.fillText('✦', o.x + Math.cos(a) * 12, top + Math.sin(a) * 4);
    }
  }
  ctx.globalAlpha = 1;
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
