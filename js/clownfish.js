/* ===== 比基尼小丑魚（behavior: "clownfish"）=====
   ・移動方式是「彈跳」：蹲低蓄力 → 騰空 → 落地。只有騰空那段會前進，所以她是一跳一跳靠近的。
   ・每次落地生一顆魚卵（數量在 CLOWNFISH.clutchMin／clutchMax）。魚卵等於是怪物版的地雷：我方靠近會先晃動一下再爆炸；
     怪物踩不會爆，但路過會把魚卵撞開。魚卵 5 分鐘沒處理就乾掉消失。
   ・大約一半的魚卵會孵出小丑魚幼體（幼體不會再產卵，不會無限繁殖）。
   ・魚卵可以用槍打爆（爆炸同樣會炸到旁邊的怪物），所以也能反過來當成陷阱用。
   ・被打中會嚇得往反方向反跳一次，邊跳邊生卵。
   ・跟魚頭君一樣：落地濺出水漬，停在原地腳下會積一灘水（共用 js/fish-head.js 的水灘）。
   ・攻擊也是彈跳：落地瞬間，撞擊範圍內的人會受傷並被撞開。
   必須在 enemy-ai.js 之後、game.js 之前載入。數值都集中在下面的 CLOWNFISH。
*/
const CLOWNFISH = {
  // ---- 彈跳（體型放大成 108×132，所以整套動作放慢約一半）----
  hopUp: .44,          // 蹲低蓄力幾秒
  hopAir: .84,         // 騰空幾秒（只有這段會前進）
  hopLand: .36,        // 落地後定格幾秒
  hopRest: 1,          // 沒在追人時，隔幾秒跳下一次
  chaseRestMul: .4,    // 追人時休息時間的倍率（跳得比較急）
  hopHeight: 38,       // 跳多高（像素）
  hatchlingHopMul: .5, // 幼體身體小：整套動作的時間倍率（比較輕快）
  // ---- 追擊 ----
  noticeRange: 9,      // 看到玩家／哨兵的距離（格）
  loseRange: 14,       // 追多遠就放棄（格）
  hitRadius: 50,       // 落地撞擊的判定半徑（像素；體型 1.2 倍，跟著放大）
  // ---- 受驚反跳 ----
  startleCd: 1.4,      // 被打中反跳一次後，幾秒內不會再被嚇到
  startleHops: 1,      // 嚇到時往反方向跳幾次
  startleMul: 1.35,    // 反跳時移動速度的倍率（慌張）
  // ---- 產卵 ----
  clutchMin: 1,        // 每次落地生幾顆：clutchMin～clutchMax 隨機（0＝這一跳沒生）
  clutchMax: 1,        // 現在固定跳一次生一顆
  clutchSpread: 20,    // 一窩散開的半徑（像素）
  eggMax: 40,          // 場上最多幾顆（滿了就先不生，舊的照樣放滿 5 分鐘）
  eggGap: 0,           // 離上一窩至少幾格才生下一窩（0＝每跳都可以生）
  eggArm: .8,          // 剛生下來幾秒內踩不爆（才不會生出來就炸到旁邊的人）
  eggLife: 300,        // 魚卵最多留 5 分鐘（時間到就乾掉消失）
  eggTrigger: .5,      // 我方離魚卵多近算踩到（格）
  eggFuse: .6,         // 晃動幾秒後爆炸
  eggRadius: 1.4,      // 爆炸半徑（格）
  eggPlayer: 16,       // 爆炸對玩家的傷害（中心；邊緣約 6 成）
  eggSentry: 20,       // 對隊友的傷害
  eggEnemy: 14,        // 對怪物的傷害（打爆魚卵當陷阱用）
  eggSize: 16,         // 魚卵畫多大（像素）
  eggShotR: 11,        // 子彈離魚卵多近算打中（像素）
  // ---- 被怪物撞開 ----
  pushRadius: 22,      // 怪物走到幾像素內會把魚卵撞開
  pushSpeed: 46,       // 撞開的初速（像素／秒）
  pushDrag: 5.5,       // 滾動的阻力（越大停得越快）
  // ---- 地上的水（跟魚頭君共用 js/fish-head.js 的水灘）----
  trailLife: 8,        // 落地時濺出的水漬留幾秒
  poolDelay: .7,       // 停在原地幾秒開始積水
  poolMaxR: 24,        // 腳下那攤水最大半徑（像素，會再乘上魚頭君的 puddleScale）
  poolLife: 12,        // 那攤水離開後留幾秒
  poolGrow: 12,        // 積水每秒長多少半徑
  // ---- 孵化 ----
  hatch: true,         // 魚卵放著沒處理會孵化
  hatchChance: .5,     // 每顆魚卵會孵化的機率（其他的放到 eggLife 秒後乾掉消失）
  hatchT: 15,          // 會孵化的那些，幾秒後孵化
  hatchWarn: 3,        // 孵化前幾秒開始抖動提示
  hatchlingId: 'clownfish_small',
  hatchMax: 8,         // 場上最多幾隻幼體（避免滾雪球到卡頓）
  // ---- 測試用 ----
  testSpawn: true,     // 開戰 1 秒後，在離溫特約 testSpawnDist 格的空地放一隻比基尼小丑魚（測完改成 false）
  testSpawnDist: 10,   // 離溫特幾格
};
const CF_ART = {
  crouch: 'images/monster/clownfish/clownfish-hop-crouch.png',   // 蹲低／落地
  air: 'images/monster/clownfish/clownfish-hop-air.png',         // 騰空
  egg: 'images/monster/clownfish/clownfish-egg.png',
};
const CF_ART_SMALL = {   // 幼體自己的兩張圖（站著、跳起來）
  crouch: 'images/monster/clownfish/clownfish-small-front.png',
  air: 'images/monster/clownfish/clownfish-small-hop.png',
};
const cfIsHatchling = e => e.type === CLOWNFISH.hatchlingId;   // 幼體：不會再產卵
const cfArt = e => cfIsHatchling(e) ? CF_ART_SMALL : CF_ART;   // 幼體用自己的兩張圖
const cfState = e => e.cf || (e.cf = { phase: 'rest', t: Math.random() * CLOWNFISH.hopRest, hops: 0, hp0: e.hp, startleT: 0, fleeHops: 0 });

// ---- 目標：玩家與看得到的哨兵 ----
function cfPickTarget(e) {
  const C = CLOWNFISH, dist = t => Math.hypot(t.x - e.x, t.y - e.y);
  const list = [];
  if (G.player && G.player.hp > 0) list.push(G.player);
  for (const t of G.towers) if (t.hp > 0 && !t.berserk && enemyNoticesSentry(e, t)) list.push(t);
  if ((e.playerAggroT || 0) > 0 && list.includes(G.player) && dist(G.player) <= ENEMY_SENSE_RANGE) return G.player;
  if (e.sentryAggroT > 0 && list.includes(e.sentryAggro) && dist(e.sentryAggro) <= ENEMY_SENSE_RANGE) return e.sentryAggro;
  let best = null, bestD = C.noticeRange * CELL;
  for (const t of list) { const d = dist(t); if (d <= bestD && hasLineOfSight(e.x, e.y, t.x, t.y)) { best = t; bestD = d; } }
  return best;
}

// ---- 彈跳節奏：回傳「這一幀可以前進多少時間」（只有騰空時才會前進）----
function updateClownfishHop(e, dt) {
  const C = CLOWNFISH, cf = cfState(e), k = cfIsHatchling(e) ? C.hatchlingHopMul : 1;
  if (e.stunT > 0 || e.knockT > 0) {   // 被電暈／被擊退：先停住
    cf.phase = 'rest'; cf.t = C.hopRest * .5 * k; e.forceFrame = null; e.slimeLift = 0; return 0;
  }
  cf.t -= dt;
  if (cf.phase === 'rest') {
    e.forceFrame = null; e.slimeLift = 0;
    if (cf.t <= 0) { cf.phase = 'up'; cf.t = C.hopUp * k; }
    return 0;
  }
  if (cf.phase === 'up') {   // 蹲低蓄力
    e.forceFrame = cfArt(e).crouch; e.slimeLift = 0;
    if (cf.t <= 0) { cf.phase = 'air'; cf.t = C.hopAir * k; }
    return 0;
  }
  if (cf.phase === 'air') {   // 騰空：拋物線高度，這段才會前進
    e.forceFrame = cfArt(e).air;
    const p = 1 - Math.max(0, cf.t) / (C.hopAir * k);
    e.slimeLift = Math.sin(Math.PI * p) * C.hopHeight * (cfIsHatchling(e) ? .7 : 1);
    if (cf.t <= 0) { cf.phase = 'land'; cf.t = C.hopLand * k; e.slimeLift = 0; clownfishLand(e); }
    return dt;
  }
  e.forceFrame = cfArt(e).crouch; e.slimeLift = 0;   // land：落地定格
  if (cf.t <= 0) { cf.phase = 'rest'; cf.t = C.hopRest * k * (cf.chasing ? C.chaseRestMul : 1); }
  return 0;
}

// ---- 落地：撞擊傷害＋（每幾跳）生一窩魚卵 ----
function clownfishLand(e) {
  const C = CLOWNFISH, cf = cfState(e);
  cf.hopSfx = !cf.hopSfx;   // 兩種跳躍聲輪流播
  if (typeof sfxAt === 'function') sfxAt(cf.hopSfx ? 'clownfishHop1' : 'clownfishHop2', e.x, e.y, .5, 'cf-land');
  G.effects.push({ ring: true, x: e.x, y: e.y + 10, r: 4, r2: 26, life: .22, life0: .22, color: '#9fd4ff' });
  if (typeof addPuddle === 'function') addPuddle(e.x + (Math.random() - .5) * 12, e.y + 11 + Math.random() * 3, 5 + Math.random() * 3.5, C.trailLife);   // 落地濺出水漬
  const p = G.player;
  if (p && p.hp > 0 && Math.hypot(p.x - e.x, p.y - e.y) <= C.hitRadius) enemyAttackPlayer(e, 0);
  for (const t of G.towers) {   // 落地範圍內的隊友各算一次
    if (t.hp <= 0 || Math.hypot(t.x - e.x, t.y - e.y) > C.hitRadius) continue;
    e.atkCd = 0; enemyAttackSentry(e, t, 0);
  }
  if (cf.fleeHops > 0) cf.fleeHops--;
  cf.hops = (cf.hops || 0) + 1;
  if (!cfIsHatchling(e)) layFishClutch(e);   // 每次落地都有機會生（0～3 顆）
}

// ---- 生一窩魚卵 ----
function layFishClutch(e) {
  const C = CLOWNFISH, cf = cfState(e), eggs = (G.fishEggs = G.fishEggs || []);
  const last = cf.lastClutch;
  if (C.eggGap && last && Math.hypot(last.x - e.x, last.y - e.y) < C.eggGap * CELL) return;   // 原地跳不會疊一堆
  const size = Math.min(C.eggMax - eggs.length, C.clutchMin + Math.floor(Math.random() * (C.clutchMax - C.clutchMin + 1)));   // 場上滿了：這一跳就不生（不刪舊的）
  if (size <= 0) return;   // 這一跳沒生
  cf.lastClutch = { x: e.x, y: e.y };
  let laid = 0;
  const base = Math.random() * Math.PI * 2;
  for (let i = 0; i < size; i++) {
    const a = base + i / size * Math.PI * 2, r = C.clutchSpread * (.45 + Math.random() * .55);
    const x = e.x + Math.cos(a) * r, y = e.y + 6 + Math.sin(a) * r * .55;
    if (typeof enemyBlocked === 'function' && enemyBlocked(x, y)) continue;
    eggs.push({ x, y, vx: 0, vy: 0, arm: C.eggArm, life: C.eggLife, age: 0, fuse: 0, seed: Math.random() * 9, hatch: C.hatch && Math.random() < C.hatchChance });   // hatch：這顆會不會孵化
    laid++;
  }
  if (laid && typeof sfxAt === 'function') sfxAt('pop', e.x, e.y, .55, 'egg-pop');
}
function removeFishEgg(egg) {
  const eggs = G.fishEggs; if (!eggs) return;
  const i = eggs.indexOf(egg); if (i >= 0) eggs.splice(i, 1);
}
function fishEggVictim(egg) {
  const r = CLOWNFISH.eggTrigger * CELL, p = G.player;
  if (p && p.hp > 0 && Math.hypot(p.x - egg.x, p.y - egg.y) <= r) return p;
  for (const t of G.towers) if (t.hp > 0 && Math.hypot(t.x - egg.x, t.y - egg.y) <= r) return t;
  return null;   // 怪物自己踩不會爆
}

// ---- 測試用：開戰 1 秒後，在離溫特約 testSpawnDist 格、離隊友至少 4 格的空地放一隻 ----
function cfTestSpawn(dt) {
  if (G.clownfishTestDone || MAP_SAFE || !G.running || G.over || !G.player) return;
  G.clownfishTestT = (G.clownfishTestT || 0) + dt;
  if (G.clownfishTestT < 1) return;
  G.clownfishTestDone = true;
  const spec = ACTIVE_MONSTERS.find(m => m.id === 'clownfish'); if (!spec) return;
  const p = G.player, D = CLOWNFISH.testSpawnDist;
  for (let k = 0; k <= D; k++) for (const d of k ? [D + k, D - k] : [D]) {
    if (d < 3) continue;
    for (let i = 0; i < 32; i++) {
      const a = i / 32 * Math.PI * 2, x = p.x + Math.cos(a) * d * CELL, y = p.y + Math.sin(a) * d * CELL, [c, r] = cellAt(x, y);
      if (!inGrid(c, r) || enemyBlocked(x, y)) continue;
      if (G.towers.some(t => t.hp > 0 && Math.hypot(t.x - x, t.y - y) < 4 * CELL)) continue;
      G.enemies.push(createMonster(spec, x, y));
      return;
    }
  }
}

// ---- 每幀更新（game.js 的 update 呼叫）----
function updateFishEggs(dt) {
  const C = CLOWNFISH, eggs = G.fishEggs;
  if (C.testSpawn) cfTestSpawn(dt);
  if (!eggs || !eggs.length) return;
  for (const egg of [...eggs]) {
    pushFishEggAside(egg, dt);   // 怪物路過會把魚卵撞開
    if (egg.fuse > 0) {   // 已經被踩到：晃動倒數
      egg.fuse -= dt;
      if (egg.fuse <= 0) blowFishEgg(egg);
      continue;
    }
    egg.age += dt; egg.life -= dt;
    if (egg.arm > 0) egg.arm -= dt;
    if (egg.hatch && egg.age >= C.hatchT) { hatchFishEgg(egg); continue; }
    if (egg.life <= 0) { removeFishEgg(egg); continue; }
    if (egg.arm > 0) continue;
    if (fishEggVictim(egg)) {
      egg.fuse = C.eggFuse;
      if (typeof sfxAt === 'function') sfxAt('eggSquish', egg.x, egg.y, .7, 'egg-squish');   // 踩到魚卵：軟軟的「噗啾」（js/sfx.js 合成）
    }
  }
}

// ---- 被怪物撞開：同類路過會把魚卵頂到旁邊（滾一小段後停下）----
function pushFishEggAside(egg, dt) {
  const C = CLOWNFISH;
  for (const e of G.enemies) {
    if (e.dead || e.hp <= 0 || e.flying) continue;
    const dx = egg.x - e.x, dy = egg.y - e.y, d = Math.hypot(dx, dy);
    if (d > C.pushRadius) continue;
    const nx = d > .01 ? dx / d : Math.cos(egg.seed), ny = d > .01 ? dy / d : Math.sin(egg.seed);
    const push = C.pushSpeed * (1 - d / C.pushRadius);
    egg.vx += nx * push * dt * 8; egg.vy += ny * push * dt * 8;
  }
  if (!egg.vx && !egg.vy) return;
  const drag = Math.max(0, 1 - C.pushDrag * dt);
  egg.vx *= drag; egg.vy *= drag;
  if (Math.hypot(egg.vx, egg.vy) < 2) { egg.vx = 0; egg.vy = 0; return; }
  const nx = egg.x + egg.vx * dt, ny = egg.y + egg.vy * dt;
  if (typeof enemyBlocked === 'function' && enemyBlocked(nx, ny)) { egg.vx = 0; egg.vy = 0; return; }   // 撞到牆就停住
  egg.x = nx; egg.y = ny;
}

// ---- 孵化：放著沒處理的魚卵會變成小丑魚幼體 ----
function hatchFishEgg(egg) {
  const C = CLOWNFISH;
  const spec = (typeof ACTIVE_MONSTERS !== 'undefined' ? ACTIVE_MONSTERS : []).find(m => m.id === C.hatchlingId);
  const grown = G.enemies.filter(e => !e.dead && e.hp > 0 && cfIsHatchling(e)).length;
  if (!spec || grown >= C.hatchMax) { egg.age -= 2; return; }   // 場上幼體已經夠多：這顆先不孵，過一下再試（撐不到就自己乾掉）
  removeFishEgg(egg);
  const baby = createMonster(spec, egg.x, egg.y);
  baby.cf = { phase: 'up', t: C.hopUp, hops: 0, hp0: baby.hp, startleT: 0, fleeHops: 0 };   // 一孵出來就先跳一下
  G.enemies.push(baby);
  G.effects.push({ ring: true, x: egg.x, y: egg.y, r: 2, r2: 18, life: .3, life0: .3, color: '#ffd2a8' });
  if (typeof flash === 'function') flash('孵化！', egg.x, egg.y - 28, '#ffb060');
  if (typeof sfxAt === 'function') sfxAt('pop', egg.x, egg.y, .7, 'egg-hatch');
}

// ---- 被子彈打中：直接引爆（js/game.js 的開槍流程呼叫）----
function shootFishEggOnLine(x1, y1, x2, y2) {
  const eggs = G.fishEggs;
  if (!eggs || !eggs.length) return null;
  const dx = x2 - x1, dy = y2 - y1, len2 = dx * dx + dy * dy || 1;
  let best = null, bestT = Infinity;
  for (const egg of eggs) {
    const t = Math.max(0, Math.min(1, ((egg.x - x1) * dx + (egg.y - y1) * dy) / len2));
    if (Math.hypot(x1 + dx * t - egg.x, y1 + dy * t - (egg.y - 6)) > CLOWNFISH.eggShotR || t >= bestT) continue;
    if (!hasLineOfSight(x1, y1, egg.x, egg.y)) continue;
    best = egg; bestT = t;
  }
  if (!best) return null;
  const x = best.x, y = best.y;
  blowFishEgg(best);
  return { x, y };
}

// ---- 爆炸：炸我方，也炸怪物（打爆魚卵可以當陷阱用）----
function blowFishEgg(egg) {
  const C = CLOWNFISH, x = egg.x, y = egg.y, R = C.eggRadius * CELL;
  removeFishEgg(egg);
  const pl = G.player;
  if (pl && pl.hp > 0) {
    const d = Math.hypot(pl.x - x, pl.y - y);
    if (d <= R && hasLineOfSight(x, y, pl.x, pl.y)) {
      const raw = C.eggPlayer * (1 - .4 * d / R);
      const hurt = typeof equipPlayerDamage === 'function' ? equipPlayerDamage(raw) : raw;
      pl.hp = Math.max(0, pl.hp - hurt); pl.hitT = .45; G.damageVignetteT = .45;
      if (typeof playPlayerHit === 'function') playPlayerHit();
      if (typeof blastPush === 'function') blastPush(pl, x, y, hurt, 34);
      if (pl.hp <= 0 && !G.over) { flash('部隊長失去戰鬥能力', pl.x, pl.y - 58, '#ff5b6e'); lose('player', '被魚卵炸到'); }
    }
  }
  for (const t of G.towers) {
    if (t.hp <= 0) continue;
    const d = Math.hypot(t.x - x, t.y - y);
    if (d > R || !hasLineOfSight(x, y, t.x, t.y)) continue;
    const def = Math.max(0, Math.min(.75, (TYPES[t.type] && TYPES[t.type].defense) || 0));
    const hurt = C.eggSentry * (1 - .4 * d / R) * (1 - def);
    t.hp = Math.max(0, t.hp - hurt); t.hitT = Math.max(t.hitT || 0, .2);
    if (typeof blastPush === 'function') blastPush(t, x, y, hurt, 26);
    else flashDmg('-' + Math.round(hurt), t.x, t.y - 26, '#ff9a3c');
    if (t.hp <= 0) { t.target = null; sentryStatus(t, '失去戰鬥能力', '#ff5b6e', true); }
  }
  for (const e of G.enemies) {   // 怪物也會被自家的卵炸到：溫特可以開槍引爆當陷阱
    if (e.dead || e.hp <= 0) continue;
    const d = Math.hypot(e.x - x, e.y - y);
    if (d > R || !hasLineOfSight(x, y, e.x, e.y)) continue;
    const hurt = C.eggEnemy * (1 - .4 * d / R);
    e.hp -= hurt; e.hitT = .2; e.hitColor = '#ff9a3c';
    flashDmg('-' + Math.round(hurt), e.x, e.y - 26, '#ff9a3c');
    if (typeof enemyHitReact === 'function') enemyHitReact(e, x, y, true);
  }
  if (typeof damageCoresInBlast === 'function') damageCoresInBlast(x, y, R, C.eggEnemy);
  for (const other of [...(G.fishEggs || [])]) {   // 連鎖引爆旁邊的魚卵
    if (other.fuse > 0) continue;
    if (Math.hypot(other.x - x, other.y - y) <= R) other.fuse = .12 + Math.random() * .1;
  }
  // 畫面與音效：橘色小爆炸
  if (typeof addLightFlash === 'function') addLightFlash('explosion', x, y);
  G.effects.push({ fglow: true, x, y: y - 6, r0: 12, r1: R, life: .3, life0: .3 });
  G.effects.push({ ring: true, x, y, r: 6, r2: R, life: .32, life0: .32, color: '#ffb060' });
  G.effects.push({ ring: true, x, y, r: 3, r2: R * .5, life: .22, life0: .22, color: '#fff0c8' });
  for (let i = 0; i < 12; i++) {
    const a = Math.random() * Math.PI * 2, sp = 70 + Math.random() * 120;
    G.effects.push({ ember: true, spark: true, x, y: y - 4, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * .6 - 40,
      r: 1.2 + Math.random() * 2, life: .3 + Math.random() * .25, life0: .55 });
  }
  if (typeof nearbyImpact === 'function') nearbyImpact(x, y, 8, .06);
  if (typeof sfxAt === 'function') sfxAt('smallBoom', x, y, .7, 'egg-boom');
}

// ---- 繪製（地面層，在角色腳下）----
function drawFishEggs(ctx) {
  const eggs = G.fishEggs;
  if (!eggs || !eggs.length) return;
  const C = CLOWNFISH, now = performance.now() / 1000;
  const img = typeof monsterImage === 'function' ? monsterImage(CF_ART.egg) : null;
  for (const egg of eggs) {
    const armed = egg.fuse > 0;
    const soon = egg.hatch && egg.age > C.hatchT - C.hatchWarn;   // 快孵化了：微微抖動
    const shake = armed ? (Math.random() * 2 - 1) * 2.2 : soon ? Math.sin(now * 26 + egg.seed) * 1.1 : 0;
    const fade = !egg.hatch && egg.life < 3 ? Math.max(.25, egg.life / 3) : 1;   // 不會孵化的：最後 3 秒慢慢乾掉
    const s = C.eggSize * (armed ? 1 + .12 * Math.sin(now * 38) : soon ? 1 + .06 * Math.sin(now * 9 + egg.seed) : 1);
    ctx.save();
    ctx.globalAlpha = .25 * fade; ctx.fillStyle = '#071015';
    ctx.beginPath(); ctx.ellipse(egg.x, egg.y + 3, s * .42, s * .2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = fade;
    if (img && img.complete && img.naturalWidth) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, Math.round(egg.x - s / 2 + shake), Math.round(egg.y - s + 2), Math.round(s), Math.round(s));
    } else {
      ctx.fillStyle = '#ff8c3a'; ctx.beginPath(); ctx.arc(egg.x + shake, egg.y - s / 2, s * .4, 0, Math.PI * 2); ctx.fill();
    }
    if (armed) {   // 引信中：橘紅光暈，提醒快閃開
      const g = ctx.createRadialGradient(egg.x, egg.y - 3, 0, egg.x, egg.y - 3, 15);
      g.addColorStop(0, 'rgba(255,120,60,.75)'); g.addColorStop(1, 'rgba(255,90,40,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(egg.x, egg.y - 3, 15, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
}

// ---- 地上的水：停著會積一攤，跳起來就不再長（跟魚頭君共用 js/fish-head.js 的水灘）----
function clownfishWater(e, dt) {
  const C = CLOWNFISH, cf = cfState(e);
  if (typeof addPuddle !== 'function') return;
  if (cf.phase === 'air') {   // 騰空移動中：腳下那攤開始乾
    cf.still = 0;
    if (cf.pool) { cf.pool.grow = false; cf.pool = null; }
    return;
  }
  cf.still = (cf.still || 0) + dt;
  if (cf.still < C.poolDelay) return;
  const scale = typeof FISH_HEAD !== 'undefined' ? FISH_HEAD.puddleScale : 1;
  if (!cf.pool || !G.waterPuddles || !G.waterPuddles.includes(cf.pool)) cf.pool = addPuddle(e.x, e.y + 11, 7, C.poolLife, true);
  cf.pool.x = e.x; cf.pool.y = e.y + 11;
  cf.pool.r = Math.min(C.poolMaxR * scale, cf.pool.r + C.poolGrow * scale * dt);
  cf.pool.t = C.poolLife;
}

// ---- 被打中：嚇得往反方向反跳 ----
function clownfishStartle(e, dt) {
  const C = CLOWNFISH, cf = cfState(e);
  if (cf.startleT > 0) cf.startleT -= dt;
  if (cf.hp0 == null) cf.hp0 = e.hp;
  const hurt = e.hp < cf.hp0;
  cf.hp0 = e.hp;
  if (!hurt || cf.startleT > 0 || e.hp <= 0) return;
  // 來源：剛開過槍的溫特優先，其次是最近的哨兵
  let from = (e.playerAggroT || 0) > 0 && G.player ? G.player : null;
  if (!from) {
    let bestD = Infinity;
    for (const t of G.towers) { if (t.hp <= 0) continue; const d = Math.hypot(t.x - e.x, t.y - e.y); if (d < bestD) { bestD = d; from = t; } }
  }
  if (!from) from = G.player;
  if (!from) return;
  const dx = e.x - from.x, dy = e.y - from.y, d = Math.hypot(dx, dy) || 1;
  cf.flee = { x: dx / d, y: dy / d };
  cf.fleeHops = C.startleHops;
  cf.startleT = C.startleCd;
  if (cf.phase === 'rest' || cf.phase === 'land') { cf.phase = 'up'; cf.t = C.hopUp * .6; }   // 立刻起跳
}

// ---- 行為（enemy-ai.js 的 stepEnemy 呼叫）----
function stepClownfishEnemy(e, dt) {
  const C = CLOWNFISH;
  clownfishStartle(e, dt);
  clownfishWater(e, dt);
  const moveDt = updateClownfishHop(e, dt);   // 只有騰空那段會前進
  const cf = cfState(e);
  let target = cfPickTarget(e);
  if (!target && cf.target && cf.target.hp > 0 && Math.hypot(cf.target.x - e.x, cf.target.y - e.y) <= C.loseRange * CELL) target = cf.target;
  cf.target = target;
  cf.chasing = !!target;
  if (!moveDt) return;              // 還在地上：這一幀不移動
  if (cf.fleeHops > 0 && cf.flee) {   // 受驚反跳：往反方向彈開
    e.faceRight = cf.flee.x > 0;
    moveEnemyToward(e, { x: e.x + cf.flee.x * CELL * 3, y: e.y + cf.flee.y * CELL * 3 }, moveDt * C.startleMul);
    return;
  }
  if (target) {
    e.faceRight = target.x > e.x;
    const [gc, gr] = cellAt(target.x, target.y);
    const nav = enemyNavigate(e, gc, gr, moveDt, 'cf:' + gc + ',' + gr, true);
    if (nav && nav.blocker) enemyAttackObstacle(e, nav.blocker, dt);
    return;
  }
  clownfishWander(e, moveDt);   // 沒看到人：在附近走走停停（跟一般異質體一樣）
}

// ---- 沒有目標時的閒晃（跟 stepEnemy 結尾的邏輯一致）----
function clownfishWander(e, moveDt) {
  e.wanderWait = Math.max(0, (e.wanderWait || 0) - moveDt);
  if (!e.wanderCell && e.wanderWait <= 0) e.wanderCell = chooseDarkWanderCell(e);
  if (e.wanderCell) {
    const [wc, wr] = e.wanderCell;
    const nav = enemyNavigate(e, wc, wr, moveDt, 'cfw:' + wc + ',' + wr, false);
    if (nav && nav.reached) { e.wanderCell = null; e.aiPath = null; e.wanderWait = .35 + Math.random() * 1.35; }
  } else if (e.wanderWait <= 0) {
    e.wanderWait = .5 + Math.random();
  }
}
