/* ===== 順順宮帽＆夯吉寶 =====
   ・順順宮帽：戰鬥地圖開場時藏在隨機的黑暗角落（不會貼著牆；之後也會慢慢冒出新的）。黑暗中只看得到一點微微的閃光。
     攻擊帽子（溫特開槍打到、照明彈落在帽子上、地雷／油桶／瓦斯爐／自爆史萊姆爆炸波及、希奧妮的火焰、燒起來的油火），
     帽子就會打開，跳出 3～5 隻夯吉寶；
     有時候還會掉出有用的物品（物品表 HANGI_CAP.loot，之後再設定）。只是走近不會打開。
     關著的帽子像障礙物一樣擋路（佔住腳下那一格：玩家、哨兵、怪物都過不去）；打開後就不擋了。
   ・夯吉寶（behavior: "boomerang"）：看到玩家或哨兵就走近，丟出小順順宮帽。帽子像迴力鏢一樣飛出去再飛回自己身上，
     去程、回程都會打到人；帽子還沒回來之前不會再丟。數值在 data/monsters.js 的 boomerang（欄位見 js/monster-data.js 的 BOOMERANG_FIELDS）。
   必須在 enemy-ai.js 之後、game.js 之前載入。
*/
const HANGI_CAP = {
  image: 'images/monster/Hangi-Bao/shunshun-cap.png',          // 地上關著的帽子
  openImage: 'images/monster/Hangi-Bao/shunshun-cap-open.png', // 打開後的帽子
  scale: 1.2,            // 帽子畫在地上的大小（1＝圖片原本的大小；1.2＝放大 1.2 倍）
  wallGap: 1,            // 離牆至少幾格（周圍這幾格內都不能有牆）
  startCount: [2, 3],    // 每張戰鬥地圖開場放幾頂
  max: 4,                // 地圖上最多同時有幾頂還沒打開的帽子
  respawnEvery: [60, 100], // 每隔幾秒冒出一頂新的（隨機）
  minDistFromPlayer: 7,  // 冒出來的位置離玩家至少幾格
  spawnCount: [3, 5],    // 跳出幾隻夯吉寶
  openStay: 6,           // 打開後留在地上幾秒才消失
  lootChance: 0.3,       // 打開時掉出物品的機率（物品表是空的就不會掉）
  // 掉落物品表：之後再設定。格式：{ id: '物品 id（data/items.js 或 data/supplies.js）', n: 數量, weight: 抽中比重 }
  loot: [],
};
const HB_HIT_R = 18;      // 帽子打中人的判定半徑（像素）
const hbImg = file => monsterImage(file);
const hbRand = ([a, b]) => a + Math.random() * (b - a);
const hbCfg = e => e.boomerangCfg || validBoomerangCfg(null);

// ---- 順順宮帽：放置 ----
function hangiCapSpot(minFromPlayer) {
  const p = G.player;
  for (let tries = 0; tries < 120; tries++) {
    const c = Math.floor(Math.random() * COLS), r = Math.floor(Math.random() * ROWS);
    if (!inGrid(c, r) || isWall(c, r) || isEntrance(c, r) || G.grid[c + ',' + r]) continue;
    if (cellNearLight(c, r, CELL)) continue;                        // 要在黑暗裡（離光源至少一格）
    let nearWall = false;                                           // 周圍 wallGap 格內不能有牆（不要貼著牆）
    for (let dc = -HANGI_CAP.wallGap; dc <= HANGI_CAP.wallGap && !nearWall; dc++)
      for (let dr = -HANGI_CAP.wallGap; dr <= HANGI_CAP.wallGap; dr++)
        if (!inGrid(c + dc, r + dr) || isWall(c + dc, r + dr) || G.grid[(c + dc) + ',' + (r + dr)]) { nearWall = true; break; }
    if (nearWall) continue;
    const [x, y] = center(c, r);
    if (enemyBlocked(x, y)) continue;
    if (p && Math.hypot(p.x - x, p.y - y) < minFromPlayer * CELL) continue;
    if (G.hangiCaps.some(cap => Math.hypot(cap.x - x, cap.y - y) < 4 * CELL)) continue;   // 帽子之間不要擠在一起
    if ([...G.enemies, ...G.towers].some(o => Math.hypot(o.x - x, o.y - y) < CELL * 1.2)) continue;   // 不要壓在怪物、隊員身上
    return { x, y, c, r };
  }
  return null;
}
function placeHangiCap(minFromPlayer) {
  const spot = hangiCapSpot(minFromPlayer);
  if (!spot) return;
  const cap = { x: spot.x, y: spot.y, c: spot.c, r: spot.r, state: 'closed', t: 0, glint: Math.random() * 5 };
  G.hangiCaps.push(cap);
  G.grid[cap.c + ',' + cap.r] = { kind: 'hangiCap', cap };   // 擋路：佔住腳下這一格
}
// 這一格是不是關著的順順宮帽（怪物移動、找路用；js/enemy-ai.js）
function hangiCapAt(c, r) { const o = G.grid && G.grid[c + ',' + r]; return !!(o && o.kind === 'hangiCap'); }

// ---- 每幀更新（game.js 的 update 呼叫）----
function updateHangi(dt) {
  if (MAP_SAFE || !LIGHT.enabled) return;
  if (!G.hangiCaps) {   // 開場：等亮光算好（約半秒）再把帽子藏進黑暗
    G.hangiSeedT = (G.hangiSeedT || 0) + dt;
    if (G.hangiSeedT < 0.5) return;
    G.hangiCaps = []; G.hangiRespawnT = hbRand(HANGI_CAP.respawnEvery);
    const n = Math.round(hbRand(HANGI_CAP.startCount));
    for (let i = 0; i < n; i++) placeHangiCap(HANGI_CAP.minDistFromPlayer);
  }
  for (const cap of G.hangiCaps) {
    cap.t += dt; cap.glint += dt;
    // 燒起來的油火蔓延到帽子：打開帽子
    if (cap.state === 'closed' && G.oilFires && G.oilFires.some(f => f.t > 0 && Math.hypot(cap.x - f.x, (cap.y - f.y) / .7) <= f.r + 10)) openHangiCap(cap);
  }
  G.hangiCaps = G.hangiCaps.filter(cap => cap.state === 'closed' || cap.t < HANGI_CAP.openStay);
  G.hangiRespawnT -= dt;
  if (G.hangiRespawnT <= 0) {
    G.hangiRespawnT = hbRand(HANGI_CAP.respawnEvery);
    if (G.hangiCaps.filter(cap => cap.state === 'closed').length < HANGI_CAP.max) placeHangiCap(HANGI_CAP.minDistFromPlayer);
  }
  updateCapShots(dt);
}
// ---- 攻擊帽子 ----
// 帽子在畫面上的中心與大小（以關著的帽子圖計）
function hangiCapBody(cap) {
  const img = hbImg(HANGI_CAP.image), s = HANGI_CAP.scale;
  const w = (img.naturalWidth || 69) * s, h = (img.naturalHeight || 59) * s;
  return { x: cap.x, y: cap.y + 13 - h / 2, r: Math.max(w, h) * .45 };
}
// 子彈從 (x1,y1) 射向 (x2,y2)：打到最近的那頂關著的帽子就打開，回傳命中點（game.js 開槍時呼叫；黑暗中也打得到）
function shootHangiCapOnLine(x1, y1, x2, y2) {
  if (!G.hangiCaps) return null;
  const dx = x2 - x1, dy = y2 - y1, len2 = dx * dx + dy * dy || 1;
  let best = null, bestT = Infinity;
  for (const cap of G.hangiCaps) {
    if (cap.state !== 'closed') continue;
    const b = hangiCapBody(cap), t = Math.max(0, Math.min(1, ((b.x - x1) * dx + (b.y - y1) * dy) / len2));
    if (Math.hypot(x1 + dx * t - b.x, y1 + dy * t - b.y) > b.r || t >= bestT) continue;
    if (!hasLineOfSight(x1, y1, cap.x, cap.y)) continue;
    best = cap; bestT = t;
  }
  if (!best) return null;
  const b = hangiCapBody(best);
  openHangiCap(best);
  return { x: b.x, y: b.y };
}
// 爆炸或照明彈落在 (x,y)、半徑 R 內的帽子都會打開（地雷、油桶、照明彈呼叫）
function hitHangiCapsAt(x, y, R) {
  if (!G.hangiCaps) return;
  for (const cap of G.hangiCaps) {
    if (cap.state !== 'closed') continue;
    const b = hangiCapBody(cap);
    if (Math.hypot(b.x - x, b.y - y) <= R + b.r || Math.hypot(cap.x - x, cap.y - y) <= R + b.r) openHangiCap(cap);
  }
}
// 帽子打開：跳出夯吉寶，有機會掉物品
function openHangiCap(cap) {
  cap.state = 'open'; cap.t = 0;
  if (typeof questEvent === 'function') questEvent('openCap');   // 支線進度（js/quests.js）
  if (typeof tryEquipDrop === 'function') tryEquipDrop('charm', cap.x, cap.y);   // 偶爾掉出順順宮平安符（js/equipment.js）
  const key = cap.c + ',' + cap.r;
  if (G.grid[key] && G.grid[key].cap === cap) delete G.grid[key];   // 打開後就不擋路了（夯吉寶才跑得出來）
  if (typeof sfxAt === 'function') sfxAt('hangiPopOut', cap.x, cap.y, .9, 'hangi-cap');   // 夯吉寶衝出來的聲音
  G.effects.push({ ring: true, x: cap.x, y: cap.y, r: 6, r2: 40, life: .35, life0: .35, color: '#ffd479' });
  if (typeof addLightFlash === 'function') addLightFlash('muzzle', cap.x, cap.y - 20);   // 打開的瞬間閃一下光
  flash('！', cap.x, cap.y - 40, '#ffd479', 1.2);
  const spec = ACTIVE_MONSTERS.find(m => m.id === 'hangi_bao');
  if (spec) {
    const n = Math.round(hbRand(HANGI_CAP.spawnCount));
    for (let i = 0; i < n; i++) {
      const e = createMonster(spec, cap.x, cap.y);
      const a = (i / n) * Math.PI * 2 + Math.random() * .6, sp = 90 + Math.random() * 60;
      e.hb = { pop: .45, pvx: Math.cos(a) * sp, pvy: Math.sin(a) * sp * .7, vz: 170 + Math.random() * 60, cd: .6 + Math.random() * .8, wait: 0, target: G.player };
      G.enemies.push(e);
    }
  }
  // 掉落物品（物品表之後再設定）
  const loot = HANGI_CAP.loot.filter(it => it && it.id && typeof itemById === 'function' && itemById(it.id));
  if (loot.length && Math.random() < HANGI_CAP.lootChance) {
    let roll = Math.random() * loot.reduce((sum, it) => sum + (it.weight || 1), 0), pick = loot[0];
    for (const it of loot) { roll -= it.weight || 1; if (roll <= 0) { pick = it; break; } }
    const n = Math.max(1, pick.n || 1);
    const got = supplyGain(pick.id, n);   // 持有上限
    if (got && typeof showItemPickupNotice === 'function') showItemPickupNotice(pick.id, got);
    if (typeof sfx === 'function') sfx('itemPickup');
    if (typeof updateHUD === 'function') updateHUD();
  }
}

// ---- 夯吉寶的行為（enemy-ai.js 的 stepEnemy 呼叫）----
function hbTargets(e) {
  const list = [], p = G.player;
  if (p && p.hp > 0) list.push(p);
  for (const t of G.towers) if (t.hp > 0 && !t.berserk && enemyNoticesSentry(e, t)) list.push(t);
  return list;
}
function hbPickTarget(e) {
  const cfg = hbCfg(e), dist = t => Math.hypot(t.x - e.x, t.y - e.y);
  const targets = hbTargets(e);
  if ((e.playerAggroT || 0) > 0 && targets.includes(G.player) && dist(G.player) <= ENEMY_SENSE_RANGE) return G.player;
  if (e.sentryAggroT > 0 && targets.includes(e.sentryAggro) && dist(e.sentryAggro) <= ENEMY_SENSE_RANGE) return e.sentryAggro;
  let best = null, bestD = cfg.noticeRange * CELL;
  for (const t of targets) { const d = dist(t); if (d <= bestD && hasLineOfSight(e.x, e.y, t.x, t.y)) { best = t; bestD = d; } }
  return best;
}
function hbWanderSpot(e) {
  const r = hbCfg(e).wanderRadius;
  for (let i = 0; i < 8; i++) {
    const a = Math.random() * Math.PI * 2, d = (.6 + Math.random() * Math.max(0, r - .6)) * CELL;
    const x = e.x + Math.cos(a) * d, y = e.y + Math.sin(a) * d;
    if (!enemyBlocked(x, y) && hasLineOfSight(e.x, e.y, x, y)) return { x, y };
  }
  return null;
}
function stepBoomerangEnemy(e, dt) {
  const cfg = hbCfg(e);
  if (!e.hb) e.hb = { cd: .8 + Math.random(), wait: Math.random() * 2 };
  const hb = e.hb;
  // 從帽子裡跳出來：往外彈開、跳一下
  if (hb.pop > 0) {
    hb.pop -= dt;
    const nx = e.x + hb.pvx * dt, ny = e.y + hb.pvy * dt;
    if (!enemyBlocked(nx, ny)) { e.x = nx; e.y = ny; }
    hb.vz -= 700 * dt; e.slimeLift = Math.max(0, (e.slimeLift || 0) + hb.vz * dt);
    if (hb.pop <= 0) e.slimeLift = 0;
    return;
  }
  if (e.stunT > 0) { hb.windup = 0; return; }
  hb.cd -= dt;
  // 準備丟：站定，時間到就丟
  if (hb.windup > 0) {
    hb.windup -= dt;
    if (hb.windup <= 0) {
      const t = hb.target;
      if (t && t.hp > 0 && hasLineOfSight(e.x, e.y, t.x, t.y)) throwCap(e, t);
    }
    return;
  }
  let target = hbPickTarget(e);
  if (!target && hb.target && hb.target.hp > 0 && Math.hypot(hb.target.x - e.x, hb.target.y - e.y) <= cfg.loseRange * CELL) target = hb.target;   // 還在追的目標先不放
  hb.target = target;
  if (target) {
    const d = Math.hypot(target.x - e.x, target.y - e.y), see = hasLineOfSight(e.x, e.y, target.x, target.y);
    if (see && d <= cfg.throwRange * CELL) {
      if (d < cfg.keepDistance * CELL) enemyBackOff(e, target, dt, cfg.retreatSpeedMul);   // 太近：往後退（背後是牆就繞出去，js/enemy-ai.js）
      if (!hb.capOut && hb.cd <= 0) { hb.windup = cfg.windup; e.faceRight = target.x > e.x; }
      return;
    }
    const [gc, gr] = cellAt(target.x, target.y);
    const nav = enemyNavigate(e, gc, gr, dt, 'hangi:' + gc + ',' + gr, true);
    if (nav && nav.blocker) enemyAttackObstacle(e, nav.blocker, dt);
    return;
  }
  // 沒有目標：發呆一下、走到附近
  if (hb.spot) {
    const moved = moveEnemyToward(e, hb.spot, dt * cfg.wanderSpeedMul);
    if (!moved || Math.hypot(hb.spot.x - e.x, hb.spot.y - e.y) <= 3) { hb.spot = null; hb.wait = hbRand([cfg.idleMin, cfg.idleMax]); }
    return;
  }
  hb.wait -= dt;
  if (hb.wait <= 0) { hb.spot = hbWanderSpot(e); hb.wait = hbRand([cfg.idleMin, cfg.idleMax]); }
}

// ---- 迴力鏢帽子 ----
function throwCap(e, target) {
  const cfg = hbCfg(e), z = (e.drawHeight || 52) * .55;
  const a = Math.atan2(target.y - e.y, target.x - e.x);
  (G.capShots = G.capShots || []).push({ owner: e, x: e.x, y: e.y, z, ux: Math.cos(a), uy: Math.sin(a), speed: cfg.capSpeed,
    phase: 'out', left: (cfg.throwRange + .8) * CELL, spin: 0, age: 0, hit: new Set(), trail: [] });
  e.hb.capOut = true;
  if (typeof sfxAt === 'function') sfxAt('swordSwing', e.x, e.y, .45, 'hangi-throw');
}
function capHitPlayer(s) {
  const p = G.player, e = s.owner, dmg = Math.round((typeof equipPlayerDamage === 'function' ? equipPlayerDamage(e.playerDamage ?? 8) : e.playerDamage ?? 8));
  p.hp = Math.max(0, p.hp - dmg);
  p.hitT = .35; p.underAttackT = 5; p.lastAttacker = e;
  G.damageVignetteT = Math.max(G.damageVignetteT || 0, .35);
  flashDmg('-' + dmg, p.x, p.y - 46, '#ff6b6b'); addShake(2);
  playPlayerHit(1, true);   // 溫特被帽子打中
  if (p.hp <= 0 && !G.over) { flash('部隊長失去戰鬥能力', p.x, p.y - 58, '#ff5b6e'); lose('player', '被' + monsterNameOf(e) + '丟的帽子打中'); }
}
// 帽子打到人：去程、回程各打一次
function capCheckHits(s) {
  const p = G.player, key = o => s.phase + ':' + (o === p ? 'p' : G.towers.indexOf(o));
  if (p && p.hp > 0 && !s.hit.has(key(p)) && Math.hypot(p.x - s.x, p.y - s.y) <= HB_HIT_R) { s.hit.add(key(p)); capHitPlayer(s); }
  for (const t of G.towers) {
    if (t.hp <= 0 || t.berserk || s.hit.has(key(t)) || Math.hypot(t.x - s.x, t.y - s.y) > HB_HIT_R) continue;
    s.hit.add(key(t));
    s.owner.atkCd = 0; enemyAttackSentry(s.owner, t, 0);
    if (typeof sfxAt === 'function') sfxAt('knock2', t.x, t.y, .6, 'hangi-hit');
  }
}
function updateCapShots(dt) {
  if (!G.capShots || !G.capShots.length) return;
  for (const s of G.capShots) {
    s.age += dt; s.spin += dt * 18;
    s.trail.push({ x: s.x, y: s.y - s.z }); if (s.trail.length > 6) s.trail.shift();
    const e = s.owner, ownerAlive = e && e.hp > 0 && G.enemies.includes(e);
    if (s.phase === 'drop' || !ownerAlive) {   // 丟帽子的夯吉寶死了：帽子掉到地上淡掉
      if (s.phase !== 'drop') { s.phase = 'drop'; s.dropT = 0; }
      s.dropT += dt; s.z = Math.max(0, s.z - 120 * dt);
      if (s.dropT > .6) s.done = true;
      continue;
    }
    if (s.phase === 'out') {
      let move = s.speed * dt;
      while (move > 0 && s.phase === 'out') {
        const step = Math.min(5, move); move -= step; s.left -= step;
        const nx = s.x + s.ux * step, ny = s.y + s.uy * step, [c, r] = cellAt(nx, ny);
        if (!inGrid(c, r) || isWall(c, r)) { s.phase = 'back'; break; }   // 撞牆就折回來
        const blocker = enemyBarrierAt(c, r);
        if (blocker) { e.atkCd = 0; enemyAttackObstacle(e, blocker, 0); s.phase = 'back'; break; }   // 打到建築：損壞建築，再折回來
        s.x = nx; s.y = ny;
        capCheckHits(s);
        if (s.left <= 0) s.phase = 'back';
      }
    } else {   // 回程：朝夯吉寶飛回去（越過牆）
      const dx = e.x - s.x, dy = e.y - s.y, d = Math.hypot(dx, dy), step = s.speed * hbCfg(e).returnSpeedMul * dt;
      if (d <= Math.max(14, step)) {   // 接住
        s.done = true; e.hb.capOut = false; e.hb.cd = hbCfg(e).cooldown;
        continue;
      }
      s.x += dx / d * step; s.y += dy / d * step;
      capCheckHits(s);
    }
    if (s.age > 8) { s.done = true; if (e.hb) e.hb.capOut = false; }   // 保險：卡住太久就收回
  }
  G.capShots = G.capShots.filter(s => !s.done);
}

// ---- 繪圖 ----
// 地上的帽子：跟角色、障礙物一起依前後排序（站在帽子後面的人會被帽子擋住；被照亮才看得到）
function hangiCapSortables(sortables) {
  if (!G.hangiCaps) return;
  for (const cap of G.hangiCaps) if (isVisible(cap.x, cap.y)) sortables.push({ y: cap.y + 13, draw: () => drawHangiCap(ctx, cap) });
}
function drawHangiCap(ctx, cap) {
  const img = hbImg(cap.state === 'open' ? HANGI_CAP.openImage : HANGI_CAP.image);
  if (!img.complete || !img.naturalWidth) return;
  const w = img.naturalWidth * HANGI_CAP.scale, h = img.naturalHeight * HANGI_CAP.scale;
  const fade = cap.state === 'open' ? Math.max(0, Math.min(1, (HANGI_CAP.openStay - cap.t) / 1)) : 1;
  const pop = cap.state === 'open' && cap.t < .25 ? Math.sin(cap.t / .25 * Math.PI) * 8 : 0;   // 打開的瞬間彈一下
  ctx.save(); ctx.imageSmoothingEnabled = false; ctx.globalAlpha = fade;
  ctx.fillStyle = 'rgba(7,16,21,.3)'; ctx.beginPath(); ctx.ellipse(cap.x, cap.y + 12, w * .45, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.drawImage(img, Math.round(cap.x - w / 2), Math.round(cap.y + 13 - h - pop), Math.round(w), Math.round(h));
  ctx.restore();
}
// 黑暗中：關著的帽子偶爾閃一下金光（畫在黑幕上面，引人靠近）
function drawHangiCapGlints(ctx) {
  if (!G.hangiCaps) return;
  for (const cap of G.hangiCaps) {
    if (cap.state !== 'closed' || isVisible(cap.x, cap.y)) continue;
    const t = cap.glint % 3.2; if (t > .6) continue;               // 每 3.2 秒閃一次
    const k = Math.sin(t / .6 * Math.PI), x = cap.x + 6, y = cap.y - 4;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .75 * k;
    ctx.fillStyle = '#ffd479';
    ctx.fillRect(x - 6 * k, y - .75, 12 * k, 1.5); ctx.fillRect(x - .75, y - 6 * k, 1.5, 12 * k);
    ctx.globalAlpha = .35 * k; ctx.beginPath(); ctx.arc(x, y, 3 * k, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
}
// 飛行中的帽子、準備丟時舉在手上的帽子（render.js 在角色之後畫）
function drawCapShots(ctx) {
  for (const e of G.enemies) {
    if (!(e.hb && e.hb.windup > 0) || e.hp <= 0 || !isVisible(e.x, e.y)) continue;
    const img = hbImg((e.art && e.art.cap) || 'images/monster/Hangi-Bao/shunshun-cap-small.png');
    if (!img.complete || !img.naturalWidth) continue;
    const k = 1 - e.hb.windup / hbCfg(e).windup, side = e.faceRight ? 1 : -1;
    ctx.save(); ctx.imageSmoothingEnabled = false;
    ctx.translate(e.x + side * 16, e.y - (e.drawHeight || 52) * .7 - k * 6); ctx.rotate(side * k * .8);
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
    ctx.restore();
  }
  for (const s of G.capShots || []) {
    if (!isVisible(s.x, s.y)) continue;
    const img = hbImg((s.owner && s.owner.art && s.owner.art.cap) || 'images/monster/Hangi-Bao/shunshun-cap-small.png');
    const alpha = s.phase === 'drop' ? Math.max(0, 1 - s.dropT / .6) : 1;
    ctx.save();
    ctx.globalAlpha = .28 * alpha; ctx.fillStyle = '#071015';   // 地上的影子
    ctx.beginPath(); ctx.ellipse(s.x, s.y + 8, 8, 2.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = .25 * alpha; ctx.strokeStyle = '#bfd6ff'; ctx.lineWidth = 2;   // 旋轉的殘影
    if (s.trail.length > 1) { ctx.beginPath(); s.trail.forEach((q, i) => i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)); ctx.stroke(); }
    ctx.globalAlpha = alpha;
    if (img.complete && img.naturalWidth) {
      ctx.imageSmoothingEnabled = false;
      ctx.translate(s.x, s.y - s.z); ctx.rotate(s.spin);
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
    }
    ctx.restore();
  }
}
