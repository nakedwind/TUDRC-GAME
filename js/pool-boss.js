/* ===== 池核 BOSS：巨大比基尼小丑魚（比基尼小丑魚放大 2.2 倍，守在深水區的異質核心旁）=====
   ・守護：一開始浮在核心旁邊（露出上半身），不會動
   ・開戰：牠被打到、或核心被叫醒 → 開始在深水區裡游來游去（畫面上方出現 BOSS 血條）
   ・游泳：大部分時間潛在水裡（只看得到淡淡的影子，深水區的能見度越低越淡；這時候打不到），
          在水裡快速穿梭：邊游邊左右擺、會轉彎，偶爾突然加速衝一段。
          偶爾從水裡躍出來（大水花），落回水面露出上半身幾秒（打得到），再高高跳起、一頭栽進水裡（大水花）潛下去。浮上來時溫特坐救生圈不能開槍，只有岸上的遠程隊友打得到
   ・水被抽乾（js/pool-tide.js）：在當下的位置擱淺，偶爾拍動身體；誰都打得到
   ・水又漲起來：又開始游
   ・身體會擋路：溫特（坐救生圈也一樣）穿不過去；碰到牠就開戰，被牠撞到會受傷、被彈開（潛在水裡也一樣）
   ・開戰後，牠附近生出來的怪物有 8 成是小丑魚幼體（js/anomalous-core.js 的 spawnCoreGroup 問 poolBossSpawnSpec）
   ・數值都在下面的 POOL_BOSS；必須在 clownfish.js、anomalous-core.js 之後、game.js 之前載入 */
// 數字以 data/monsters.js 的 BOSS_SETTINGS_DEFAULT 為準（怪物編輯器「👑 BOSS 數值」）；這裡的數字只在那邊沒有這一格時才用。
// 新增或刪掉數字欄位、改了註解之後，要跑一次 tools/build-boss-fields.py（編輯器的欄位和說明才會跟著更新）
const POOL_BOSS = applyBossSettings('POOL_BOSS', {
  name: '巨大比基尼小丑魚',
  maps: ['map_mv1bzur4'],     // 04. 池核
  of: 'clownfish',            // 以哪隻怪物為基準（怪物編輯器的比基尼小丑魚）
  scale: 2.2,                 // 放大幾倍
  hp: 4800,                   // 血量（再乘整體難度）
  coreHpMul: 2,               // 牠守的異質核心血量是一般核心的幾倍（一般核心＝js/anomalous-core.js 的 CORE.hp × 難度）
  rewardMul: 6, crystalMul: 6,
  swimSpeed: 190,             // 潛在水裡游的速度（像素／秒）
  surfacedSpeedMul: .4,       // 浮上來時游的速度倍率（慢一點，比較好打）
  leapSpeedMul: .8,           // 跳出水面、跳進水裡的時候往前飛的速度倍率
  dash: { every: [1.5, 3.5], time: .6, mul: 1.8 },   // 潛水時突然加速：每隔幾秒（隨機）衝一次、衝多久、快幾倍
  turnRate: 4,                // 轉彎多快（每秒最多轉幾弧度；越大越靈活）
  weave: { amp: .55, freq: 3.2 },   // 游的時候左右擺（amp＝擺多大，弧度；freq＝擺多快）
  dive: [3, 6],               // 潛水幾秒（隨機）
  surface: [2.5, 4],          // 浮上來幾秒（隨機）
  wanderCells: 14,            // 每次游到離現在幾格內的另一個地方
  leapUp: { time: 1.0, height: .6 },     // 從水裡躍出來：多久（秒）、跳多高（畫出來的高 × 這個）
  leapDive: { time: 1.15, height: .5, sink: .45, splashAt: .62 },   // 跳進水裡：多久、跳多高、最後沉到水面下多深（高 × 這個）、到哪個時間點（0～1）入水噴水花
  surfaceDepth: .5,           // 浮上來時水面在身體的哪裡（.5＝露出上半身）
  silhouette: .35,            // 潛水時的影子多濃（再乘深水區的能見度）
  defaultSee: .45,            // 深水區沒有水素材時的能見度
  flop: [1.2, 3],             // 擱淺時隔幾秒拍一下
  flopTime: .32,              // 拍一下多久
  flopLift: 14,               // 拍起來多高（像素）
  // 水花（份量參考油桶爆炸）：drops＝四周噴的水滴、column＝往上衝的水柱水滴、mist＝水霧團、up＝往上噴多快、
  //   spread＝往外噴多快、shake＝畫面搖多大（離溫特越遠越小）；land＝躍出水面後落回水面的那一下（小一點）
  splash: { gravity: 700,
    up:   { drops: 80, column: 30, mist: 12, up: 380, spread: 260, shake: 8 },
    dive: { drops: 70, column: 55, mist: 14, up: 560, spread: 200, shake: 10 },
    land: { drops: 36, column: 0,  mist: 6,  up: 200, spread: 200, shake: 4 } },
  // 落水時水滿溢出來（js/pool-surge.js）：水波沿著深水區往外擴散，碰到岸邊就溢到地上，把岸上的人、怪物、地上的道具往遠離水池的方向推開
  surge: { speed: 9, pushTime: .35, linger: 1.4, ringPush: .6,   // 水波擴散多快（格／秒）、被推開滑多久（秒）、溢上岸的水多久退掉（秒）、坐救生圈的人被推的距離倍率
    up:   { range: 10, spill: 2, push: 60 },   // 躍出水面：水波沿著水面最遠擴散幾格、最多溢上岸幾格、最靠近水邊的人被推開幾像素（越往岸上越小）
    dive: { range: 14, spill: 3, push: 95 },   // 一頭栽進水裡（最大）：同上
    land: { range: 7,  spill: 1, push: 35 } },   // 落回水面（最小）：同上
  body: { rx: .3, ry: .14 },  // 身體擋路的範圍：以腳底為中心的橢圓，左右半徑＝畫出來的寬 × rx、前後半徑＝寬 × ry
  touchDamage: 18,            // 被牠撞到扣多少血（再經過防護背心減傷）
  nearSpawn: 14,              // 開戰後，牠幾格內生出來的怪物
  hatchlingChance: .8,        // 有幾成是小丑魚幼體
  hatchlingId: 'clownfish_small',
});

const poolBossState = () => (typeof G !== 'undefined' && G && G.poolBoss) || null;
const poolBossAlive = pb => !!(pb && pb.e && pb.e.hp > 0 && !pb.e.dead);
const poolBossRand = ([a, b]) => a + Math.random() * (b - a);

// ---- 開場（game.js 的 newGame 在 seedCores 之後呼叫）----
function seedPoolBoss() {
  if (typeof G !== 'undefined' && G) G.poolBoss = null;
  if (typeof MAP === 'undefined' || !MAP || MAP_SAFE || !POOL_BOSS.maps.includes(MAP.id) || (typeof practiceOn === 'function' && practiceOn())) return;
  const base = ACTIVE_MONSTERS.find(m => m.id === POOL_BOSS.of); if (!base) return;
  // 守的核心：在深水區裡的那顆（沒有就第一顆）
  const inDeep = k => typeof poolPointInDeepZone === 'function' && poolPointInDeepZone(k.x, k.y);
  const core = (G.cores || []).find(inDeep) || (G.cores || [])[0]; if (!core) return;
  core.hp = core.maxhp = core.lastHp = Math.round(core.maxhp * POOL_BOSS.coreHpMul);   // 池核的核心比較硬（POOL_BOSS.coreHpMul）
  const P = POOL_BOSS, e = createMonster(base, core.x, core.y + CELL * .5);
  e.poolBoss = true; e.eliteName = P.name;
  e.hp = e.maxhp = Math.round(e.maxhp / base.hp * P.hp);   // createMonster 給的是小丑魚血量 × 難度：換成 BOSS 的血量，難度照樣乘
  e.reward = Math.round(e.reward * P.rewardMul); e.crystals = Math.round((e.crystals ?? 3) * P.crystalMul);
  e.drawWidth = Math.round(base.width * P.scale); e.drawHeight = Math.round(base.height * P.scale);
  e.knockMul = 0; e.staggerTime = 0; e.unpushable = true; e.noHitSquash = true; e.noStun = true; e.shockResist = 1;   // 推不動、不硬直、不會被電暈
  e.home = { x: e.x, y: e.y }; e.guardCore = core;
  G.poolBoss = { e, core, phase: 'guard', sub: false, t: 0, flopT: poolBossRand(P.flop), goal: null };
  G.enemies.push(e);
}

// ---- 每一幀（js/pool-tide.js 的 updatePoolTide 呼叫）：潛水的時候牠不在 G.enemies 裡，所以由這裡自己動 ----
function updatePoolBoss(dt) {
  updatePoolSplash(dt);   // 水花（BOSS 死掉後還沒落下的也照樣落完）
  const pb = poolBossState(); if (!pb || pb.done) return;
  const e = pb.e;
  if (!poolBossAlive(pb)) { pb.done = true; return; }
  const deep = typeof poolDeepIsDeep === 'function' ? poolDeepIsDeep() : true;
  // 開戰：被打到、或核心醒了
  if (!e.eliteAwake && (e.hp < e.maxhp || (pb.core && pb.core.awake))) {
    e.eliteAwake = true;
    if (typeof coreBanner === 'function') coreBanner(POOL_BOSS.name + '動起來了', '', '#ffd9b8');
    systemNotice(POOL_BOSS.name + '開始在水裡游動！', true);
  }
  poolBossTouchPlayer(pb, dt);   // 碰到溫特：開戰、撞傷、把人推出身體外
  const want = !deep ? 'stranded' : e.eliteAwake ? 'swim' : 'guard';
  if (pb.phase !== want) {
    pb.phase = want; pb.goal = null; pb.leap = null; e.forceFrame = null; e.slimeLift = 0;
    if (want === 'stranded') { poolBossShow(pb, true); pb.flopT = poolBossRand(POOL_BOSS.flop) * .5; }   // 水抽乾：就地擱淺（浮出來、打得到）
    else if (want === 'swim') { pb.sub = false; pb.t = poolBossRand(POOL_BOSS.surface) * .5; poolBossShow(pb, true); }
    else poolBossShow(pb, true);
  }
  if (pb.phase === 'stranded') { poolBossFlop(pb, dt); return; }
  if (pb.phase === 'guard') { e.forceFrame = null; return; }
  // ---- 游泳：潛水 ↔ 浮上來（中間是跳出水面／跳進水裡的動畫）----
  if (pb.leap) poolBossLeap(pb, dt);
  else {
    pb.t -= dt;
    if (pb.t <= 0) {
      if (pb.sub) {   // 潛水時間到：從水裡躍出來（一出水就打得到）
        pb.sub = false; poolBossShow(pb, true);
        pb.leap = { kind: 'up', t: 0 }; poolBossSplash(e, 'up');
      } else pb.leap = { kind: 'dive', t: 0, splashed: false };   // 浮上來的時間到：高高跳起、栽進水裡
    }
  }
  poolBossSwim(pb, dt);
}
// 跳出水面／跳進水裡：slimeLift＝身體離水面多高（js/water.js 的 wadeInfo 照這個把水面以下畫成半透明）
function poolBossLeap(pb, dt) {
  const e = pb.e, P = POOL_BOSS, L = pb.leap, h = e.drawHeight || 290, art = typeof cfArt === 'function' ? cfArt(e) : {};
  if (L.kind === 'up') {
    const p = (L.t += dt) / P.leapUp.time;
    if (p >= 1) { pb.leap = null; e.slimeLift = 0; e.forceFrame = null; pb.t = poolBossRand(P.surface); poolBossSplash(e, 'land'); return; }   // 落回水面，露出上半身
    e.slimeLift = Math.sin(Math.PI * p) * h * P.leapUp.height;
    e.forceFrame = art.air || null;
    return;
  }
  const D = P.leapDive, p = (L.t += dt) / D.time;
  // 前面一段往上跳，跳到最高再一頭栽下去，最後沉到水面下
  e.slimeLift = p < D.splashAt ? Math.sin(Math.PI * p / D.splashAt) * h * D.height : -Math.min(1, (p - D.splashAt) / (1 - D.splashAt)) * h * D.sink;
  e.forceFrame = art.air || null;
  if (!L.splashed && p >= D.splashAt) { L.splashed = true; poolBossSplash(e, 'dive'); if (typeof sfxAt === 'function') sfxAt('poolBossDive', e.x, e.y, 1, 'pool-boss-dive'); }   // 入水聲：音效編輯器的 poolBossDive   // 入水的那一刻：大水花
  if (p >= 1) {   // 整隻沉下去了：變成水裡的影子（打不到）
    pb.leap = null; e.slimeLift = 0; e.forceFrame = null;
    pb.sub = true; pb.t = poolBossRand(P.dive); poolBossShow(pb, false);
  }
}
// 浮上來＝放回 G.enemies（打得到）；潛下去＝拿出來（打不到、隊員也不會一直瞄著）
function poolBossShow(pb, show) {
  const e = pb.e, i = G.enemies.indexOf(e);
  if (show && i < 0) G.enemies.push(e);
  if (!show && i >= 0) {
    G.enemies.splice(i, 1);
    for (const t of G.towers || []) if (t.target === e) t.target = null;
  }
}
// 游泳：朝目標轉過去（不是直直走），邊游邊左右擺；潛水時偶爾突然加速衝一段 → 看起來在水裡穿梭
function poolBossSwim(pb, dt) {
  const e = pb.e, P = POOL_BOSS;
  if (!pb.goal || Math.hypot(pb.goal.x - e.x, pb.goal.y - e.y) < 30) pb.goal = poolBossPickGoal(e);
  if (!pb.goal) return;
  pb.age = (pb.age || 0) + dt;
  const want = Math.atan2(pb.goal.y - e.y, pb.goal.x - e.x);
  if (pb.ang == null) pb.ang = want;
  let turn = Math.atan2(Math.sin(want - pb.ang), Math.cos(want - pb.ang));   // 要轉多少（-π～π）
  turn = Math.max(-P.turnRate * dt, Math.min(P.turnRate * dt, turn));
  pb.ang += turn;
  // 突然加速（只有潛在水裡時）
  if (pb.dashT > 0) pb.dashT -= dt;
  else if ((pb.dashWait = (pb.dashWait ?? poolBossRand(P.dash.every)) - dt) <= 0) { pb.dashWait = poolBossRand(P.dash.every); if (pb.sub) pb.dashT = P.dash.time; }
  const mul = pb.leap ? P.leapSpeedMul : pb.sub ? (pb.dashT > 0 ? P.dash.mul : 1) : P.surfacedSpeedMul;
  const a = pb.ang + Math.sin(pb.age * P.weave.freq) * P.weave.amp * (pb.leap ? 0 : 1);   // 跳在空中時不擺
  const step = P.swimSpeed * mul * dt, nx = e.x + Math.cos(a) * step, ny = e.y + Math.sin(a) * step;
  if (deepWaterAtPoint(nx, ny)) { e.x = nx; e.y = ny; }
  else { pb.goal = poolBossPickGoal(e); if (pb.goal) pb.ang = Math.atan2(pb.goal.y - e.y, pb.goal.x - e.x); }   // 游到岸邊了：馬上換個方向
  const vx = Math.cos(a);
  if (Math.abs(vx) > .15) e.forceFlip = vx > 0;   // 原圖朝左：往右游就翻過來
  if (!pb.leap) e.forceFrame = e.frames && e.frames.front || null;
}
// 挑一個游得到的地方：離現在 wanderCells 格內的深水，而且直直游過去一路都是深水
function poolBossPickGoal(e) {
  const list = typeof deepWaterAllList === 'function' ? deepWaterAllList() : ((MAP && MAP.deepWater) || []), R = POOL_BOSS.wanderCells * CELL;   // 一般深水區＋永遠深水
  for (let n = 0; n < 12; n++) {
    const k = list[Math.floor(Math.random() * list.length)]; if (!k) return null;
    const [c, r] = k.split(',').map(Number), [x, y] = center(c, r);
    if (Math.hypot(x - e.x, y - e.y) > R) continue;
    let ok = true;
    for (let s = 1; s <= 10 && ok; s++) ok = deepWaterAtPoint(e.x + (x - e.x) * s / 10, e.y + (y - e.y) * s / 10);
    if (ok) return { x, y };
  }
  return null;
}
// 擱淺：躺在地上，偶爾拍一下（跳起來一點點再摔回去）
function poolBossFlop(pb, dt) {
  const e = pb.e, P = POOL_BOSS, art = typeof cfArt === 'function' ? cfArt(e) : {};
  pb.flopT -= dt;
  if (pb.flopT > 0) { e.forceFrame = art.crouch || null; e.slimeLift = 0; return; }
  const p = -pb.flopT / P.flopTime;
  if (p >= 1) { pb.flopT = poolBossRand(P.flop); e.slimeLift = 0; e.forceFrame = art.crouch || null; e.forceFlip = !e.forceFlip; nearbyImpactSafe(e); return; }   // 摔回地上，換個方向躺
  e.forceFrame = art.air || null; e.slimeLift = Math.sin(Math.PI * p) * P.flopLift;
}
const nearbyImpactSafe = e => { if (typeof bossImpact === 'function') bossImpact(e.x, e.y, 3, .04); };
// ---- 水花（份量參考油桶爆炸）----
//   up＝從水裡躍出來：水往四周炸開＋往上噴；dive＝跳進水裡：高高的水柱＋往外噴；land＝落回水面：小一點
//   每次都有：中間一片白色水沫、往外擴散的好幾圈水波、大大小小的水滴、水霧團、畫面搖晃
// 音效：音效編輯器的 poolBossSplash（魚頭君的噴水攻擊）
function poolBossSplash(e, kind = 'up') {
  const S = POOL_BOSS.splash, K = S[kind] || S.up, w = e.drawWidth || 240, list = G.poolSplash || (G.poolSplash = []);
  const x = e.x, y = e.y + 8, big = kind !== 'land';
  // 水波：一圈一圈往外擴散（後面幾圈晚一點才出現）；[晚幾秒、持續幾秒、擴到身體寬的幾倍]
  const rings = big ? [[0, .9, 1.2], [.12, .75, 1.6], [.3, .6, 2.0]] : [[0, .6, .9]];
  for (const [delay, life, rr] of rings) list.push({ ring: true, x, y, r0: w * .15, r1: w * rr, t: -delay, life });
  list.push({ foam: true, x, y, r: w * (big ? .5 : .35), t: 0, life: big ? .7 : .45 });   // 中間一大片白色水沫
  // 四周噴出去的水滴（大大小小）
  for (let i = 0; i < K.drops; i++) {
    const a = Math.random() * Math.PI * 2, sp = K.spread * (.35 + Math.random() * .75), rr = w * (.1 + Math.random() * .3);
    list.push({ x: x + Math.cos(a) * rr, y: y + Math.sin(a) * rr * .45, z: 5 + Math.random() * 25, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * .45,
      vz: K.up * (.35 + Math.random() * .7), r: 2.5 + Math.random() * 4.5, t: 0, life: 1.6 });
  }
  // 往上衝的水柱（窄、高）
  for (let i = 0; i < K.column; i++) {
    const a = Math.random() * Math.PI * 2, sp = 15 + Math.random() * 45;
    list.push({ x: x + (Math.random() - .5) * w * .28, y, z: Math.random() * 30, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * .45,
      vz: K.up * (.9 + Math.random() * .7), r: 3 + Math.random() * 5, t: 0, life: 2 });
  }
  // 水霧：白白的一團團，慢慢變大、往上飄、淡掉
  for (let i = 0; i < K.mist; i++) {
    const a = Math.random() * Math.PI * 2, rr = w * Math.random() * .35;
    list.push({ mist: true, x: x + Math.cos(a) * rr, y: y + Math.sin(a) * rr * .45, z: 10 + Math.random() * 50, vx: Math.cos(a) * 30, vy: Math.sin(a) * 12,
      vz: 25 + Math.random() * 40, r: 18 + Math.random() * 22, grow: 40 + Math.random() * 40, t: 0, life: 1 + Math.random() * .6 });
  }
  if (list.length > 900) list.splice(0, list.length - 900);   // 太多了就丟掉最舊的，不然會卡
  if (typeof bossImpact === 'function') bossImpact(x, y, K.shake, big ? .04 : 0);   // 畫面搖一下（離溫特越近越大，6 格外不搖）
  if (typeof sfxAt === 'function') sfxAt('poolBossSplash', x, y, big ? 1 : .6, 'pool-boss-splash-' + kind); else if (typeof sfx === 'function') sfx('poolBossSplash');
  if (typeof poolSurgeStart === 'function') poolSurgeStart(x, y, kind);   // 水滿溢出來、推開岸上的人和東西（js/pool-surge.js）
}
function updatePoolSplash(dt) {
  const list = G.poolSplash; if (!list || !list.length) return;
  for (const d of list) {
    d.t += dt;
    if (d.ring || d.foam) continue;   // 水波、水沫不會動，只會變大變淡
    d.x += d.vx * dt; d.y += d.vy * dt;
    if (d.mist) { d.z += d.vz * dt; d.r += d.grow * dt; d.vx *= .96; d.vy *= .96; continue; }   // 水霧：往上飄、變大
    d.vz -= POOL_BOSS.splash.gravity * dt; d.z += d.vz * dt;
    if (d.z < 0 && d.vz < 0) { d.z = 0; d.t = d.life; }   // 水滴落回水面
  }
  G.poolSplash = list.filter(d => d.t < d.life);
}
// ---- 不規則的水花形狀（虱目魚王登場也用，js/milkfish-king.js）----
// 每個水花第一次畫的時候，隨機決定「每個方向要凸出去多少」（n 個方向、jag＝最多差幾成），之後一直用同一組，形狀才不會每一幀亂跳
function splashShape(n, jag) { const a = []; for (let i = 0; i < n; i++) a.push(1 - jag + Math.random() * jag * 2); return a; }
// 照 shape 畫一個邊緣圓滑、但凹凹凸凸的團塊路徑（rx、ry＝左右、上下的大小；rot＝轉幾度，讓同一組形狀看起來不一樣）
function splashBlobPath(ctx, x, y, rx, ry, shape, rot = 0) {
  const n = shape.length, pts = [];
  for (let i = 0; i < n; i++) { const a = rot + i / n * Math.PI * 2; pts.push([x + Math.cos(a) * rx * shape[i], y + Math.sin(a) * ry * shape[i]]); }
  const mid = i => { const a = pts[i % n], b = pts[(i + 1) % n]; return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; };
  const m0 = mid(n - 1);
  ctx.beginPath(); ctx.moveTo(m0[0], m0[1]);
  for (let i = 0; i < n; i++) { const m = mid(i); ctx.quadraticCurveTo(pts[i][0], pts[i][1], m[0], m[1]); }
  ctx.closePath();
}
// js/render.js 畫完角色後呼叫：水波、水沫、水霧、水滴（形狀都不規則：水滴順著飛的方向拉長、水波斷斷續續又歪歪的、水沫是好幾團疊在一起）
function drawPoolSplash(ctx) {
  const list = typeof G !== 'undefined' && G && G.poolSplash; if (!list || !list.length) return;
  ctx.save();
  for (const d of list) {
    if (d.t < 0) continue;   // 還沒輪到的水波
    const p = d.t / d.life, k = 1 - p;
    if (d.ring) {   // 水波：歪歪的扁圈、斷成好幾段，越擴越淡
      const r = d.r0 + (d.r1 - d.r0) * (1 - Math.pow(1 - p, 2));
      if (!d.shape) { d.shape = splashShape(14, .16); d.rot = Math.random() * Math.PI * 2; d.dash = [.9 + Math.random() * .8, .15 + Math.random() * .3, .3 + Math.random() * .6, .1 + Math.random() * .25]; d.dashOff = Math.random() * 3; }
      ctx.globalAlpha = .7 * k; ctx.strokeStyle = '#e8f8ff'; ctx.lineWidth = 2 + 5 * k; ctx.lineCap = 'round';
      ctx.setLineDash(d.dash.map(v => v * r)); ctx.lineDashOffset = d.dashOff * r;
      splashBlobPath(ctx, d.x, d.y, r, r * .42, d.shape, d.rot); ctx.stroke();
      ctx.setLineDash([]);
      continue;
    }
    if (d.foam) {   // 水沫：好幾團大小不一的白沫疊在一起，冒出來再散開
      const r = d.r * (.6 + .6 * p);
      if (!d.lobes) { d.lobes = []; const n = 5 + Math.floor(Math.random() * 3); for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, rr = Math.random() * .55; d.lobes.push({ dx: Math.cos(a) * rr, dy: Math.sin(a) * rr, s: .35 + Math.random() * .4, shape: splashShape(8, .3), rot: Math.random() * 6 }); } }
      for (const L of d.lobes) {
        const lx = d.x + L.dx * r * (1 + p * .5), ly = d.y + L.dy * r * .45 * (1 + p * .5), lr = r * L.s;   // 散開：每團往外飄一點
        ctx.globalAlpha = .55 * k; ctx.fillStyle = 'rgb(220,244,255)';
        splashBlobPath(ctx, lx, ly, lr, lr * .45, L.shape, L.rot); ctx.fill();
        ctx.globalAlpha = .75 * k; ctx.fillStyle = '#ffffff';
        splashBlobPath(ctx, lx - lr * .1, ly - lr * .06, lr * .55, lr * .25, L.shape, L.rot + 1); ctx.fill();
      }
      continue;
    }
    if (d.mist) {   // 水霧：兩三團柔柔的白霧疊成一朵
      const cy = d.y - d.z;
      if (!d.puffs) { d.puffs = []; const n = 2 + Math.floor(Math.random() * 2); for (let i = 0; i < n; i++) d.puffs.push({ dx: (Math.random() - .5) * .9, dy: (Math.random() - .5) * .5, s: .5 + Math.random() * .5 }); }
      ctx.globalAlpha = k * Math.min(1, p * 6);
      for (const P of d.puffs) {
        const px = d.x + P.dx * d.r, py = cy + P.dy * d.r, pr = d.r * P.s, g = ctx.createRadialGradient(px, py, 0, px, py, pr);
        g.addColorStop(0, 'rgba(240,250,255,.45)'); g.addColorStop(1, 'rgba(240,250,255,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI * 2); ctx.fill();
      }
      continue;
    }
    // 水滴：順著飛的方向拉長（飛越快拉越長）、邊緣歪歪的，像甩出去的水
    if (!d.shape) { d.shape = splashShape(6, .28); d.rot = Math.random() * 6; }
    const sx = d.vx || 0, sy = (d.vy || 0) - (d.vz || 0), sp = Math.hypot(sx, sy), stretch = 1 + Math.min(1.8, sp / 260);
    ctx.save(); ctx.translate(d.x, d.y - d.z); ctx.rotate(Math.atan2(sy, sx));
    ctx.globalAlpha = .9 * Math.min(1, k * 1.6); ctx.fillStyle = '#eefaff';
    splashBlobPath(ctx, -d.r * (stretch - 1) * .5, 0, d.r * stretch, d.r / Math.sqrt(stretch), d.shape, d.rot); ctx.fill();   // 尾巴拖在後面
    ctx.globalAlpha *= .5; ctx.fillStyle = '#7fc4ef';
    splashBlobPath(ctx, d.r * .15, d.r * .25, d.r * .6 * stretch, d.r * .5 / Math.sqrt(stretch), d.shape, d.rot + 2); ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

// ---- 身體碰撞 ----
// 這個點離 BOSS 身體多近：<1＝在身體裡面（橢圓，pad＝外面再多幾點也算）
function poolBossBodyK(e, x, y, pad = 0) {
  const w = e.drawWidth || 240, rx = w * POOL_BOSS.body.rx + PLAYER.r + pad, ry = w * POOL_BOSS.body.ry + PLAYER.r + pad;
  return Math.hypot((x - e.x) / rx, (y - e.y) / ry);
}
// 溫特的碰撞（js/game.js 的 playerBlocked 呼叫）：走進 BOSS 身體裡＝擋住。
// 已經被牠擠到身體裡面時，往外走（離牠越來越遠）不擋，不然會卡死
function poolBossBlocksPlayer(x, y) {
  if (poolBossIgnore) return false;
  const pb = poolBossState(); if (!pb || pb.done || !poolBossAlive(pb)) return false;
  const e = pb.e, k = poolBossBodyK(e, x, y); if (k >= 1) return false;
  const p = G.player; if (!p) return true;
  return k <= poolBossBodyK(e, p.x, p.y) + 1e-6;
}
// 每一幀：溫特碰到牠（貼在身體旁邊也算）→ 開戰；被撞到扣血（js/enemy-ai.js 的 enemyAttackPlayer：有冷卻、會彈開）；被牠游過來擠進身體裡 → 推出去
function poolBossTouchPlayer(pb, dt) {
  const e = pb.e, p = G.player; if (!p || p.hp <= 0) return;
  if (G.enemies.indexOf(e) < 0) e.playerTouchCd = Math.max(0, (e.playerTouchCd || 0) - dt);   // 潛在水裡時牠不在怪物清單裡，冷卻由這裡倒數
  if (poolBossBodyK(e, p.x, p.y, 3) >= 1) return;
  if (!e.eliteAwake) e.hp = Math.min(e.hp, e.maxhp - 1e-3);   // 碰到牠＝開戰（updatePoolBoss 看「被打到」就開戰，這裡記成被碰了一下，不會真的扣到血）
  if (typeof enemyAttackPlayer === 'function') { e.playerDamage = POOL_BOSS.touchDamage; enemyAttackPlayer(e, dt); }
  // 還在身體裡：往外推到身體邊上（推不動的方向就不推）
  const k = poolBossBodyK(e, p.x, p.y); if (k >= 1) return;
  const dx = p.x - e.x, dy = p.y - e.y, d = Math.hypot(dx, dy) || 1, ux = dx / d || 1, uy = dy / d;
  for (let s = 0; s < 24 && poolBossBodyK(e, p.x, p.y) < 1; s++) {
    const nx = p.x + ux * 4, ny = p.y + uy * 4;
    if (!playerBlockedExceptBoss(nx, ny)) { p.x = nx; p.y = ny; } else break;
  }
}
// 檢查擋路時先不算 BOSS 自己（推人出去用）
function playerBlockedExceptBoss(x, y) { poolBossIgnore = true; try { return playerBlocked(x, y); } finally { poolBossIgnore = false; } }
let poolBossIgnore = false;

// ---- 給其他程式用 ----
// js/enemy-ai.js：牠在 G.enemies 裡的時候，一般的怪物 AI 不要動牠（這裡自己管）
function stepPoolBoss(e, dt) { e.moving = false; }
// js/water.js 的 wadeInfo：游泳、守護時露出上半身，下半身照深水區的能見度半透明；擱淺時照一般的水
function poolBossWade(a) {
  const pb = poolBossState(); if (!pb || pb.e !== a || pb.phase === 'stranded') return undefined;
  // 跳出水面時身體往上抬（slimeLift）：處理範圍跟著加高，水面高度不變（還是在身體一半的地方）
  const h = a.drawHeight || 330, lift = Math.max(0, a.slimeLift || 0), H = h + lift;
  return { w: { depth: h * POOL_BOSS.surfaceDepth / H, see: poolBossSee(a) }, bottom: a.y + 13, height: H, width: (a.drawWidth || 270) * .6 };
}
function poolBossSee(a) {
  const w = typeof waterAt === 'function' ? waterAt(a.x, a.y + 10) : null;
  return w && Number.isFinite(w.see) ? w.see : POOL_BOSS.defaultSee;
}
// js/render.js 畫地面時呼叫：潛在水裡時畫一個淡淡的影子（打不到）
function drawPoolBossUnderwater(ctx) {
  const pb = poolBossState(); if (!pb || pb.done || !pb.sub || pb.phase !== 'swim' || !poolBossAlive(pb)) return;
  const e = pb.e, img = monsterImage((e.frames && e.frames.front) || e.sprite); if (!img.complete || !img.naturalWidth) return;
  const w = e.drawWidth, h = e.drawHeight, a = POOL_BOSS.silhouette * poolBossSee(e) * (.85 + .15 * Math.sin(performance.now() / 600));
  ctx.save(); ctx.globalAlpha = a; ctx.imageSmoothingEnabled = false;
  ctx.translate(e.x, e.y + 13 + h * .12); if (e.forceFlip) ctx.scale(-1, 1);
  ctx.filter = 'brightness(.55) saturate(.6)';   // 水裡看起來暗暗的
  ctx.drawImage(img, -w / 2, -h, w, h);
  ctx.restore();
}
// js/anomalous-core.js 的 spawnCoreGroup：開戰後，牠附近生出來的怪物 8 成換成小丑魚幼體
function poolBossSpawnSpec(spec, x, y) {
  const pb = poolBossState(); if (!poolBossAlive(pb) || !pb.e.eliteAwake) return spec;
  if (Math.hypot(x - pb.e.x, y - pb.e.y) > POOL_BOSS.nearSpawn * CELL || Math.random() >= POOL_BOSS.hatchlingChance) return spec;
  return ACTIVE_MONSTERS.find(m => m.id === POOL_BOSS.hatchlingId) || spec;
}
// 畫面上方的 BOSS 血條（js/core-frenzy.js）、BOSS 音樂（js/boss-music.js）
function poolBossBars() {
  const pb = poolBossState(); if (!poolBossAlive(pb) || !pb.e.eliteAwake) return [];
  return [{ label: POOL_BOSS.name, ratio: pb.e.hp / pb.e.maxhp, hit: pb.e.hitT > 0, colors: ['#d8602a', '#ffc98a'], frame: '#ff9a4d', text: '#ffe2c4' }];
}
const poolBossHunting = () => { const pb = poolBossState(); return poolBossAlive(pb) && !!pb.e.eliteAwake; };
