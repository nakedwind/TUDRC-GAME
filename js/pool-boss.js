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
  maps: ['map_mv1bzur4', 'map_89aacb92-4b89-47ec-a76b-0908972d3fdf'],     // 04. 池核、W118區 地下水池（W118 是池核往下移 5 列再擴大，BOSS 一樣守中間深水區那顆核心）
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
  // 擱淺時拍起來摔回地上的重量感（巨物；跟魚頭王、虱目魚王落地同一套）：畫面震 shake 像素（離溫特越遠越小）、
  //   很近時頓一下 stop 秒、地上裂開（crack＝中間那片裂痕多大，0＝不裂）、落地聲音量 vol
  impact: { shake: 10, stop: .05, crack: 1.1, vol: 1.6 },
  // 大顆魚卵（只有 BOSS 會生）：不會孵出魚，只是爆炸比較痛
  //   count＝每次落地生幾顆（最少～最多，隨機）、onLand＝擱淺拍地時生（1＝會、0＝不會）、onWater＝躍出水面落回水面時生（浮在水上）、
  //   size＝畫多大（一般魚卵的幾倍）、damage＝爆炸傷害（一般魚卵的幾倍）、radius＝爆炸範圍（一般魚卵的幾倍）、max＝場上最多幾顆大顆魚卵
  //   timer＝生下來幾秒後自己爆炸（0＝不會自己爆）、warn＝爆炸前幾秒開始抖動提醒
  bigEgg: { count: [1, 2], onLand: 1, onWater: 1, size: 2.2, damage: 2.5, radius: 1.6, max: 12, timer: 15, warn: 3 },
  // BOSS 每跳一次，附近的大顆魚卵被震開：range＝幾格內的會被震到、land／water＝在地上／浮在水上被推開的速度（像素／秒，離 BOSS 越近越快）、
  //   landDrag／waterDrag＝滑動的阻力（越大停得越快；水上的小一點，會慢慢飄散開來）
  //   地上：擱淺時每次拍地摔回去；水裡：躍出水面、落回水面、一頭栽進水裡時都會
  eggScatter: { range: 7, land: 300, landDrag: 4, water: 120, waterDrag: .8 },
  // 水花（份量參考油桶爆炸）：drops＝四周噴的水滴、column＝往上衝的水柱水滴、mist＝水霧團、up＝往上噴多快、
  //   spread＝往外噴多快、shake＝畫面搖多大（離溫特越遠越小）；land＝躍出水面後落回水面的那一下（小一點）
  splash: { gravity: 700,
    up:   { drops: 80, column: 30, mist: 12, up: 380, spread: 260, shake: 8 },
    dive: { drops: 70, column: 55, mist: 14, up: 560, spread: 200, shake: 10 },
    land: { drops: 36, column: 0,  mist: 6,  up: 200, spread: 200, shake: 4 } },
  // 落水時水滿溢出來（js/pool-surge.js）：水波沿著深水區往外擴散，碰到岸邊就溢到地上，把岸上的人、怪物、地上的道具往遠離水池的方向推開
  surge: { speed: 9, pushTime: .35, linger: 1.4, ringPush: .6,   // 水波擴散多快（格／秒）、被推開滑多久（秒）、溢上岸的水多久退掉（秒）、坐救生圈的人被推的距離倍率
    up:   { range: 11, spill: 2.2, push: 90, pull: 90 },   // 躍出水面：水波沿著水面最遠擴散幾格、最多溢上岸幾格、最靠近水邊的人被推開幾像素（越往岸上越小）、水退回去時把還站在濕地上的人往水池拉回幾像素（0＝不拉）
    dive: { range: 15.4, spill: 3.3, push: 140, pull: 140 },   // 一頭栽進水裡（最大）：同上
    land: { range: 7.7, spill: 1.1, push: 55, pull: 55 } },   // 落回水面（最小）：同上
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
        pb.leap = { kind: 'up', t: 0 }; poolBossSplash(e, 'up'); poolBossScatterEggs(e, true);   // 躍出水面：浮在水上的大顆魚卵被浪推開
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
    if (p >= 1) { pb.leap = null; e.slimeLift = 0; e.forceFrame = null; pb.t = poolBossRand(P.surface); poolBossSplash(e, 'land'); poolBossScatterEggs(e, true); if (P.bigEgg.onWater) poolBossLayBigEggs(e, true); return; }   // 落回水面，露出上半身（順便生大顆魚卵，浮在水上）
    e.slimeLift = Math.sin(Math.PI * p) * h * P.leapUp.height;
    e.forceFrame = art.air || null;
    return;
  }
  const D = P.leapDive, p = (L.t += dt) / D.time;
  // 前面一段往上跳，跳到最高再一頭栽下去，最後沉到水面下
  e.slimeLift = p < D.splashAt ? Math.sin(Math.PI * p / D.splashAt) * h * D.height : -Math.min(1, (p - D.splashAt) / (1 - D.splashAt)) * h * D.sink;
  e.forceFrame = art.air || null;
  if (!L.splashed && p >= D.splashAt) { L.splashed = true; poolBossSplash(e, 'dive'); poolBossScatterEggs(e, true); if (typeof sfxAt === 'function') sfxAt('poolBossDive', e.x, e.y, 1, 'pool-boss-dive'); }   // 入水聲：音效編輯器的 poolBossDive   // 入水的那一刻：大水花
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
  if (p >= 1) {   // 摔回地上，換個方向躺：震動、裂痕、生大顆魚卵
    pb.flopT = poolBossRand(P.flop); e.slimeLift = 0; e.forceFrame = art.crouch || null; e.forceFlip = !e.forceFlip;
    poolBossLandImpact(e);
    poolBossScatterEggs(e, false);   // 先把旁邊的大顆魚卵震開，再生新的
    if (P.bigEgg.onLand) poolBossLayBigEggs(e, false);
    return;
  }
  e.forceFrame = art.air || null; e.slimeLift = Math.sin(Math.PI * p) * P.flopLift;
}
// 巨物重重摔在地上：畫面震、地上裂開、塵土、白色衝擊圈、落地聲（數值在 POOL_BOSS.impact）
function poolBossLandImpact(e) {
  const I = POOL_BOSS.impact, w = e.drawWidth || 200, x = e.x, y = e.y + 14, now = performance.now() / 1000;
  if (typeof bossImpact === 'function') bossImpact(e.x, e.y, I.shake, 0);   // 離溫特越遠震越小（js/combat-feel.js）
  if (I.stop > 0 && typeof addHitstop === 'function' && G.player && Math.hypot(G.player.x - e.x, G.player.y - e.y) < CELL * 6) addHitstop(I.stop);   // 很近才頓一下
  for (let i = 0; i < 2; i++) G.effects.push({ ring: true, x, y, r: 10 + i * 8, r2: w * (.4 + i * .2), life: .4 + i * .12, life0: .4 + i * .12, color: i ? '#b9b2a2' : '#ffffff' });
  if (typeof rockBurstFx === 'function' && typeof ELITE_BIRD !== 'undefined') rockBurstFx(x, y, ELITE_BIRD.runDust);   // 揚起塵土（js/gourd-monkey.js）
  if (I.crack > 0) {   // 地上裂開（跟魚頭王、虱目魚王共用的裂痕，js/elite-bird-head.js 的 drawEliteGround 畫）
    const cracks = G.eliteCracks = G.eliteCracks || [];
    cracks.push({ size: I.crack, power: 1, life: 6, x, y, at: now });
    for (let i = 0; i < 3; i++) cracks.push({ size: I.crack * .5, life: 6, x: x + (Math.random() * 2 - 1) * w * .22, y: y - 2 + (Math.random() * 2 - 1) * 10, at: now, rot: (Math.random() * 2 - 1) * .8, flip: Math.random() < .5 });
    if (cracks.length > 40) cracks.splice(0, cracks.length - 40);
  }
  if (I.vol > 0 && typeof sfxAt === 'function') sfxAt('milkfishKingStep', e.x, e.y, I.vol, 'pool-boss-land');   // 落地聲（跟虱目魚王落地同一個）
}
// BOSS 跳一下：附近的大顆魚卵往外震開（water＝在水裡跳：只推浮在水上的；在地上跳：只推地上的）
// 推開之後怎麼滑、撞牆停下：js/clownfish.js 的 pushFishEggAside（看 egg.drag 決定滑多遠；浮在水上的只能在深水裡漂）
function poolBossScatterEggs(e, water) {
  const S = POOL_BOSS.eggScatter, R = S.range * CELL, sp = water ? S.water : S.land;
  if (!(R > 0) || !(sp > 0)) return;
  for (const egg of G.fishEggs || []) {
    if (!egg.big || !!egg.water !== !!water || egg.fuse > 0) continue;
    const dx = egg.x - e.x, dy = egg.y - e.y, d = Math.hypot(dx, dy);
    if (d > R) continue;
    const a = d > 1 ? Math.atan2(dy, dx) : Math.random() * Math.PI * 2, v = sp * (1 - .6 * d / R) * (.85 + Math.random() * .3);
    egg.vx = (egg.vx || 0) + Math.cos(a) * v; egg.vy = (egg.vy || 0) + Math.sin(a) * v;
    egg.drag = water ? S.waterDrag : S.landDrag;
  }
}
// 生大顆魚卵：繞著身體邊緣放（不然會被身體擋住踩不到）；water＝在水面上生（浮在水上，跟水裡小丑魚的魚卵一樣）
// 大顆魚卵不會孵化；爆炸傷害、範圍、畫多大照 POOL_BOSS.bigEgg（js/clownfish.js 的 blowFishEgg、drawFishEgg 看 egg.big）
function poolBossLayBigEggs(e, water) {
  const B = POOL_BOSS.bigEgg, C = typeof CLOWNFISH !== 'undefined' ? CLOWNFISH : null; if (!C) return;
  const eggs = (G.fishEggs = G.fishEggs || []);
  const n = Math.min(B.max - eggs.filter(g => g.big).length, Math.round(poolBossRand(B.count)));
  if (n <= 0) return;
  const w = e.drawWidth || 200, base = Math.random() * Math.PI * 2;
  let laid = 0;
  for (let i = 0; laid < n && i < n * 6; i++) {   // 放不下的位置（牆、岸上／水裡）就換個方向再試
    const a = base + i / n * Math.PI * 2 + (Math.random() - .5) * .6, r = w * POOL_BOSS.body.rx * (1.05 + Math.random() * .35);
    const x = e.x + Math.cos(a) * r, y = e.y + 6 + Math.sin(a) * r * .55;
    if (water ? !deepWaterAtPoint(x, y) : (deepWaterAtPoint(x, y) || (typeof enemyBlocked === 'function' && enemyBlocked(x, y)))) continue;
    eggs.push({ x, y, floor: typeof actorFloor === 'function' ? actorFloor(e) : 1, vx: 0, vy: 0, arm: C.eggArm, life: C.eggLife, age: 0, fuse: 0, seed: Math.random() * 9,
      hatch: false, water: !!water, big: { size: B.size, damage: B.damage, radius: B.radius, timer: B.timer, warn: B.warn } });
    laid++;
  }
  if (laid && typeof sfxAt === 'function') sfxAt('pop', e.x, e.y, .8, 'pool-boss-egg');
}
// ---- 水花（份量參考油桶爆炸）----
//   up＝從水裡躍出來：水往四周炸開＋往上噴；dive＝跳進水裡：高高的水柱＋往外噴；land＝落回水面：小一點
//   每次都有：中間一片白色水沫、往外擴散的好幾圈水波、大大小小的水滴、水霧團、畫面搖晃
// 音效：音效編輯器的 poolBossSplash（魚頭君的噴水攻擊）
// BOSS 跳水的水花用哪一種：crown＝新的皇冠水花（跟人落水同一套，js/pool-fall.js 的 poolCrownSplash，放大 scale 倍）；
// false＝原本的水花（一圈圈水波、白沫、水滴、水柱、水霧）。scale：躍出水面、一頭栽進水裡、落回水面各放大幾倍
const POOL_BOSS_CROWN = { on: true, scale: { up: 3.4, dive: 3.9, land: 2.6 } };
function poolBossSplash(e, kind = 'up') {
  const S = POOL_BOSS.splash, K = S[kind] || S.up, w = e.drawWidth || 240, list = G.poolSplash || (G.poolSplash = []);
  const x = e.x, y = e.y + 8, big = kind !== 'land';
  if (POOL_BOSS_CROWN.on && typeof poolCrownSplash === 'function') {   // 新的皇冠水花（放大版）
    poolCrownSplash(list, x, y, POOL_BOSS_CROWN.scale[kind] || POOL_BOSS_CROWN.scale.up);
  } else {   // 原本的水花
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
  }
  if (typeof bossImpact === 'function') bossImpact(x, y, K.shake, big ? .04 : 0);   // 畫面搖一下（離溫特越近越大，6 格外不搖）
  if (typeof sfxAt === 'function') sfxAt('poolBossSplash', x, y, big ? 1 : .6, 'pool-boss-splash-' + kind); else if (typeof sfx === 'function') sfx('poolBossSplash');
  if (typeof poolSurgeStart === 'function') poolSurgeStart(x, y, kind);   // 水滿溢出來、推開岸上的人和東西（js/pool-surge.js）
}
function updatePoolSplash(dt) {
  const list = G.poolSplash; if (!list || !list.length) return;
  for (const d of list) {
    if (d.wait > 0) { d.wait -= dt; continue; }   // 還沒輪到它出現（例如皇冠水花破掉時才甩出來的水滴）
    d.t += dt;
    if (d.ring || d.foam || d.crown || d.ripple || d.band) continue;   // 水波、水沫、皇冠水花不會移動，只會變大變淡
    d.x += d.vx * dt; d.y += d.vy * dt;
    if (d.mist) { d.z += d.vz * dt; d.r += d.grow * dt; d.vx *= .96; d.vy *= .96; continue; }   // 水霧：往上飄、變大
    d.vz -= POOL_BOSS.splash.gravity * (d.gMul || 1) * dt; d.z += d.vz * dt;   // gMul＝這顆水滴的重力是平常的幾倍（落水第 4 版用）
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
// ---- 皇冠水花：卡通風格的「一整圈」水花（像杯子一樣從水面冒出來，杯口一圈白色浪花尖往外翻）----
// d.x、d.y＝水面上的中心；d.w＝杯口最寬時的寬度；d.h＝最高時的高度；p＝播到哪裡（0～1）
// 過程：小小冒出來 → 長高、杯口張開、浪花尖翹起來 → 塌下去、攤開、淡掉
// 顏色寫在 POOL_CROWN_COLORS（想換水的顏色改這裡）
const POOL_CROWN_COLORS = {
  top: '#8fe0ee',      // 杯子上半部（比較亮）
  bottom: '#3a9cc0',   // 杯子下半部、碰到水面的地方（比較深）
  inside: '#2a7898',   // 杯口裡面看進去（最深）
  streak: '#c4f1f8',   // 杯子上直直的亮線
  foam: '#ffffff',     // 白色浪花
  shade: '#bfe9f5',    // 白色浪花底下淡淡的藍色陰影
  // 第 3 版用的（比較淺、比較透的水色，像 12 格示意圖）
  top3: '#b4eef6',     // 水牆上半部
  bottom3: '#62bfd6',  // 水牆下半部
  inside3: '#86d6e6',  // 杯口裡面
};

// ---- 皇冠水花第 3 版（照 12 格示意圖）----
// 過程（p＝播到哪裡，0～1）：
//   ① 0～.12   水面先蹦出一小撮細細尖尖的白色碎片
//   ② .03～.22 杯子很快長出來，杯口是一圈厚厚往外捲的白色浪頭，左右兩邊高、中間低
//   ③ .22～.5  幾乎停住，只輕輕晃
//   ④ .5～.66  杯口破開，幾條水絲往上捲，杯子變矮
//   ⑤ .6～.74  整個塌下去，變成水面上一條白色水沫帶
//   ⑥ .68～1   水沫帶變成細細的白色水圈往外擴散、淡掉
function drawPoolCrown3(ctx, d, p) {
  const C = POOL_CROWN_COLORS, PI2 = Math.PI * 2;
  const clamp = v => Math.max(0, Math.min(1, v)), easeOut = v => 1 - Math.pow(1 - v, 3);
  const R = Math.random;
  // 第一次畫時決定這朵水花的細節（之後一直用同一組，形狀才不會每一幀亂跳）
  if (!d.k3) {
    const lip = [], n = 30;
    for (let i = 0; i < n; i++) lip.push({ a: (i + R() * .5) / n * PI2, s: .75 + R() * .5, breaks: R() < .55 });
    const tend = [], nt = d.nTend ?? 5;
    for (let i = 0; i < nt; i++) {   // 水絲多半長在左右兩邊（杯口最高的地方）
      const side = i % 2 ? 0 : Math.PI, a = side + (R() - .5) * 1.4 + (R() < .3 ? -Math.PI / 2 : 0);
      tend.push({ a, L: .6 + R() * .6, dir: Math.cos(a) >= 0 ? 1 : -1, bend: .5 + R() * .6 });
    }
    const shards = []; for (let i = 0; i < 7; i++) shards.push({ ang: (i / 6 - .5) * 1.5 + (R() - .5) * .25, L: .5 + R() * .6, off: (R() - .5) * 8 });
    const foam = []; for (let i = 0; i < 26; i++) foam.push({ a: i / 26 * PI2 + R() * .2, s: .6 + R() * .8, up: R() < .35 ? .8 + R() * 1.4 : 0 });
    const dash = []; for (let i = 0; i < 6; i++) dash.push(.3 + R() * 1.2, .08 + R() * .35);
    d.k3 = { lip, tend, shards, foam, dash, streaks: [-.55, -.2, .2, .5].map(v => v + (R() - .5) * .1), seed: R() * 10 };
  }
  const K = d.k3, x = d.x, y = d.y, T = d.t;
  const sp = 1 + (d.spread ?? .5) * easeOut(clamp(p));          // 整朵一路往外散開
  const grow = easeOut(clamp((p - .03) / .19));
  const brk = clamp((p - .5) / .16), coll = clamp((p - .6) / .14);
  const hold = p > .2 && p < .62 ? 1 : 0;
  const wob = hold * Math.sin(T * 13 + K.seed) * .03;             // 停住時輕輕晃
  const H = d.h * grow * (1 - .35 * brk) * (1 - coll);
  const rxT = d.w * .5 * (.5 + .5 * grow) * sp * (1 + wob), ryT = rxT * .3;
  const rxB = d.w * .3 * sp * (.85 + .15 * grow), ryB = rxB * .3;
  const sad = d.saddle ?? .4;
  // 杯口上 θ 方向那一點的位置（左右 θ＝0、π 最高；前後最矮）；out＝再往外推、up＝再往上推
  const rim = (a, out = 0, up = 0) => {
    const s = Math.sin(a), hk = 1 - sad * s * s + hold * .05 * Math.sin(a * 3 + T * 9 + K.seed);
    return [x + Math.cos(a) * (rxT + out), y - H * hk + s * ryT - up];
  };
  ctx.save();
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';

  // ⑥ 細細的白色水圈（畫在最底下，貼著水面）
  for (let k = 0; k < 2; k++) {
    const rp = clamp((p - .66 - k * .09) / (.34 - k * .05)); if (rp <= 0 || rp >= 1) continue;
    const r = d.w * .55 * sp * (1 + .9 * rp) * (1 - .2 * k);
    ctx.globalAlpha = .85 * (1 - rp); ctx.strokeStyle = C.foam; ctx.lineWidth = Math.max(.8, 1.6 * (1 - rp * .5));
    ctx.setLineDash(K.dash.map(v => v * r * .5)); ctx.lineDashOffset = k * r;
    ctx.beginPath(); ctx.ellipse(x, y, r, r * .26, 0, 0, PI2); ctx.stroke();
  }
  ctx.setLineDash([]);
  // ⑤ 水面上的白色水沫帶（一團一團、有的往上凸一點）
  const fb = clamp((p - .58) / .08) * (1 - clamp((p - .78) / .14));
  if (fb > 0) {
    const rfx = d.w * .55 * sp * (1 + .25 * clamp((p - .6) / .3)), rfy = rfx * .26;
    ctx.globalAlpha = .3 * fb; ctx.fillStyle = C.top3;
    ctx.beginPath(); ctx.ellipse(x, y, rfx * .42, rfy * .42, 0, 0, PI2); ctx.fill();
    ctx.globalAlpha = fb; ctx.fillStyle = C.foam;
    for (const f of K.foam) {
      const fx = x + Math.cos(f.a) * rfx, fy = y + Math.sin(f.a) * rfy, r = d.w * .045 * f.s;
      ctx.beginPath(); ctx.ellipse(fx, fy, r * 1.6, r, 0, 0, PI2); ctx.fill();
      if (f.up) { ctx.beginPath(); ctx.ellipse(fx, fy - r * f.up, r * .6, r * (f.up + .6), 0, 0, PI2); ctx.fill(); }   // 往上凸的小水柱
    }
    ctx.strokeStyle = C.foam; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.ellipse(x, y, rfx, rfy, 0, 0, PI2); ctx.stroke();
  }

  // ④ 杯口破開時往上捲的水絲（which：'back'＝杯子後半圈長出來的、'front'＝前半圈、'all'＝全部）
  const tendrils = which => {
    if (!(brk > 0 && coll < 1)) return;
    ctx.globalAlpha = 1 - coll; ctx.strokeStyle = C.foam; ctx.fillStyle = C.foam;
    const lw = Math.max(1.4, d.w * .065);
    for (const t of K.tend) {
      const isBack = Math.sin(t.a) < 0;
      if ((which === 'back' && !isBack) || (which === 'front' && isBack)) continue;
      const L = d.h * .6 * t.L * easeOut(brk);
      const [bx, by] = rim(t.a); const dx = t.dir * L;
      const ex = bx + dx * .35, ey = by - L * .8;
      ctx.lineWidth = lw * (1 - .4 * coll);
      ctx.beginPath(); ctx.moveTo(bx, by);
      ctx.bezierCurveTo(bx + dx * .1, by - L * .55, bx + dx * t.bend, by - L * 1.05, ex, ey);   // 往上、再往回勾
      ctx.stroke();
      ctx.beginPath(); ctx.arc(ex, ey, lw * .75, 0, PI2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  };

  // ②～④ 杯子
  if (H > .6) {
    ctx.globalAlpha = 1;
    const N = 36;
    // 杯口裡面
    ctx.fillStyle = C.inside3; ctx.beginPath();
    for (let i = 0; i <= N; i++) { const [px, py] = rim(i / N * PI2); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
    ctx.fill();
    // 杯口的白色浪頭：一團團白沫沿著杯口排一圈，左右兩邊比較大、往外捲得比較多
    const lip = wantFront => {
      ctx.lineWidth = Math.max(1.5, rxT * .22 * (1 - brk)); ctx.strokeStyle = C.foam; ctx.beginPath();
      const a0 = wantFront ? 0 : Math.PI;
      for (let i = 0; i <= 18; i++) { const [px, py] = rim(a0 + i / 18 * Math.PI); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
      if (brk < 1) ctx.stroke();
      for (const u of K.lip) {
        if ((Math.sin(u.a) >= 0) !== wantFront) continue;
        const flare = Math.pow(Math.cos(u.a), 2);
        const r = rxT * .15 * u.s * (.65 + .6 * flare) * grow * (u.breaks ? 1 - brk : 1 - brk * .5);
        if (r < .4) continue;
        const [px, py] = rim(u.a, r * (.2 + .8 * flare), r * (.25 + .4 * flare));
        ctx.fillStyle = C.shade; ctx.beginPath(); ctx.arc(px, py + r * .35, r, 0, PI2); ctx.fill();
        ctx.fillStyle = C.foam; ctx.beginPath(); ctx.arc(px, py, r, 0, PI2); ctx.fill();
        if (flare > .5) {   // 左右兩邊：浪頭再往外、往上捲出一團（像示意圖杯口兩端捲起來的浪）
          const [qx, qy] = rim(u.a, r * 2.2, r * .5);
          ctx.fillStyle = C.shade; ctx.beginPath(); ctx.arc(qx, qy + r * .3, r * .7, 0, PI2); ctx.fill();
          ctx.fillStyle = C.foam; ctx.beginPath(); ctx.arc(qx, qy, r * .7, 0, PI2); ctx.fill();
        }
      }
    };
    lip(false);
    tendrils('back');
    // 前面那片水牆：上寬下窄，杯口那條邊跟著浪頭高高低低
    const wall = () => {
      const [lx, ly] = rim(Math.PI), [rx, ry] = rim(0);
      ctx.beginPath(); ctx.moveTo(lx, ly);
      ctx.quadraticCurveTo(x - rxB * .95, y - H * .4, x - rxB, y);
      ctx.ellipse(x, y, rxB, ryB, 0, Math.PI, 0, true);
      ctx.quadraticCurveTo(x + rxB * .95, y - H * .4, rx, ry);
      for (let i = 1; i <= 18; i++) { const [px, py] = rim(i / 18 * Math.PI); ctx.lineTo(px, py); }
      ctx.closePath();
    };
    const g = ctx.createLinearGradient(0, y - H, 0, y + ryB);
    g.addColorStop(0, C.top3); g.addColorStop(1, C.bottom3);
    ctx.fillStyle = g; wall(); ctx.fill();
    // 水牆上淡淡的直線（像示意圖杯子上的亮紋）
    ctx.save(); wall(); ctx.clip();
    ctx.globalAlpha = .5; ctx.strokeStyle = C.foam; ctx.lineWidth = Math.max(.8, d.w * .03);
    for (const s of K.streaks) { ctx.beginPath(); ctx.moveTo(x + s * rxT * .9, y - H * .85); ctx.quadraticCurveTo(x + s * rxB * 1.1, y - H * .4, x + s * rxB, y); ctx.stroke(); }
    ctx.restore();
    lip(true);
  }
  tendrils(H > .6 ? 'front' : 'all');   // 杯子還在：只畫前面那幾條（後面的已經在水牆後面畫過了）
  // ① 一開始蹦出來的白色碎片
  if (p < .14) {
    const shK = easeOut(clamp(p / .05)), shA = 1 - clamp((p - .05) / .09);
    ctx.globalAlpha = shA;
    for (const s of K.shards) {
      const L = d.h * .45 * s.L * shK, bx = x + s.off, w2 = 2.2;
      const tx = bx + Math.sin(s.ang) * L, ty = y - Math.cos(s.ang) * L;
      ctx.fillStyle = C.shade; ctx.beginPath(); ctx.moveTo(bx - w2, y + 1); ctx.lineTo(bx + w2, y + 1); ctx.lineTo(tx, ty + 1.5); ctx.closePath(); ctx.fill();
      ctx.fillStyle = C.foam; ctx.beginPath(); ctx.moveTo(bx - w2, y); ctx.lineTo(bx + w2, y); ctx.lineTo(tx, ty); ctx.closePath(); ctx.fill();
    }
  }
  ctx.restore();
}
function drawPoolCrown(ctx, d, p) {
  const C = POOL_CROWN_COLORS;
  const easeOut = v => 1 - Math.pow(1 - v, 3);
  const clamp = v => Math.max(0, Math.min(1, v));
  const easeQ = v => 1 - (1 - v) * (1 - v);                 // 慢慢減速（比 easeOut 收得柔，不會「啪」一下停住）
  const easeIn = v => v * v;                                  // 慢慢加速
  let grow, fall, sp, foamOut, tipK, lean, alpha;
  if (d.keepTips) {
    // 第 4 版：長高、散開、塌下去「重疊」在一起，是一個連續的動作，中間不會有停住的空檔
    //   長高 0～.34（越長越慢）；塌下去從 .2 就慢慢開始（一開始很慢、越來越快），兩段疊在一起，最高點一過就自然往下
    //   往外散開、白沫往外漂、浪花往外飛，也都是從頭到尾一直在動，沒有突然加速
    grow = easeQ(clamp(p / .34));
    fall = clamp((p - .2) / .8);
    sp = (d.spread ?? .9) * easeQ(clamp(p));
    foamOut = 1 + (d.foamOut ?? .8) * easeIn(fall);
    tipK = easeQ(clamp((p - .04) / .32));
    lean = easeIn(fall) * 1.2 > 1 ? 1 : easeIn(fall) * 1.2;
    alpha = fall > .6 ? 1 - (fall - .6) / .4 : 1;
  } else {
    // 第 2 版（保留原樣，給比較頁對照）
    grow = easeOut(clamp(p / .3));                 // 前 3 成時間：長出來
    fall = clamp((p - .5) / .5);                   // 後 5 成時間：塌下去
    sp = (d.spread ?? .9) * (.6 * easeOut(clamp(p)) + .4 * clamp(p));   // 一路往外散開到消失為止（d.spread＝最後多寬出幾成）
    foamOut = 1 + (d.foamOut ?? .8) * easeOut(fall);   // 杯子塌下去時，杯口那圈白沫再額外往外漂多遠（d.foamOut＝多漂出幾成）
    tipK = clamp((p - .06) / .28) * (1 - fall);    // 浪花尖翹多高；塌下去時跟著縮短
    lean = 0;
    alpha = fall > .55 ? 1 - (fall - .55) / .45 : 1;
  }
  const H = d.h * grow * (1 - (d.keepTips ? easeIn(fall) : fall * fall));   // 現在多高
  const open = .45 + .55 * grow + sp;              // 杯口張多開
  if (alpha <= 0) return;
  // 第一次畫時決定這朵水花的浪花尖（位置、長短、粗細）和亮線，之後都用同一組，形狀才不會亂跳
  if (!d.tips) {
    const n = d.n || 11; d.tips = [];
    for (let i = 0; i < n; i++) d.tips.push({ a: (i + Math.random() * .6) / n * Math.PI * 2, L: .5 + Math.random() * .7, w: .75 + Math.random() * .5, curl: (Math.random() - .5) * .5 });
    d.streaks = [-.5, -.15, .25, .55].map(v => v + (Math.random() - .5) * .12);
    d.lumps = []; for (let i = 0; i < 18; i++) d.lumps.push({ a: (i + Math.random() * .5) / 18 * Math.PI * 2, s: .75 + Math.random() * .55 });   // 杯口一圈一團一團的白沫
  }
  const x = d.x, y = d.y, top = y - H;
  const rxT = d.w * .5 * open, ryT = rxT * .34;   // 杯口（扁圓）
  const rxB = d.w * .3 * (.8 + sp * .9), ryB = rxB * .34;   // 杯底（碰到水面）：跟著往外散
  // 杯口的形狀：第 2 版是正正的扁圓；第 4 版是波浪狀、凹凸不平的不規則形（幾個大小不同的波疊在一起，還會慢慢蠕動）
  if (d.keepTips && !d.wave) {
    d.wave = [3, 4, 5].map(k => ({ k, amp: (.06 + Math.random() * .07) * (d.waveK ?? 1), ph: Math.random() * Math.PI * 2, drift: (Math.random() - .5) * 3 }));
  }
  const rimR = a => {   // 杯口在 a 這個方向，要比扁圓大（>1）還是小（<1）
    if (!d.wave) return 1;
    let r = 1; for (const w of d.wave) r += w.amp * Math.sin(w.k * a + w.ph + w.drift * p); return r;
  };
  const rimX = (a, k = 1) => x + Math.cos(a) * rxT * rimR(a) * k;
  const rimY = (a, k = 1) => top + Math.sin(a) * ryT * rimR(a) * k;
  // 沿著杯口從 a0 畫到 a1（first＝true 時先移到起點）
  const rimPath = (a0, a1, first) => {
    const n = 36;
    for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; (first && !i) ? ctx.moveTo(rimX(a), rimY(a)) : ctx.lineTo(rimX(a), rimY(a)); }
  };
  ctx.save(); ctx.globalAlpha = alpha;
  // 一片浪花：從杯口邊上往外、往上翹的胖胖一片，尾端圓圓的往外捲（像卡通水花的白色浪頭）
  const tip = (t, fill, dy) => {
    // 第 4 版塌下去時（lean 從 0 到 1）：浪花整片往外飛出去（底部離開杯口）、變細、淡掉，不會往回縮
    const fly = 1 + .45 * lean;
    const bx = rimX(t.a, fly), by = rimY(t.a, fly) + dy;   // 浪花長在杯口邊上（第 4 版的杯口是波浪狀，浪花跟著站在波浪上）
    const L = d.h * .62 * t.L * tipK * (1 - .45 * lean); if (L < 1) return;   // 飛出去時變短一點、不要拉成細長條
    const hw = rxT * .24 * t.w * (1 - .25 * lean), out = Math.cos(t.a) * (.9 + sp) + t.curl;   // 越散開，浪花越往外甩
    const up = 1 - .3 * lean, side = 1 + .4 * lean;   // 往上的少一點、往外的多一點
    if (lean > 0) ctx.globalAlpha = alpha * (1 - lean);
    const tx = bx + out * L * .7 * side, ty = by - L * (.75 + .25 * Math.abs(Math.sin(t.a))) * up;
    const tr = hw * .38;   // 尾端那顆圓頭的大小
    ctx.fillStyle = fill; ctx.beginPath();
    ctx.moveTo(bx - hw, by + hw * .25);
    ctx.quadraticCurveTo(bx - hw * .5 + out * L * .05 * side, by - L * .75 * up, tx - tr * .6, ty);
    ctx.quadraticCurveTo(bx + hw * .8 + out * L * .5 * side, by - L * .2 * up, bx + hw, by + hw * .25);
    ctx.closePath(); ctx.fill();
    if (d.keepTips) {   // 第 4 版：尾端不是正圓，是歪歪的一小團（飛出去時越來越小、拉長）；d.headK＝這團放大幾倍
      if (!t.head) { t.head = splashShape(7, .35); t.headRot = Math.random() * 6; }
      const hr = tr * (d.headK ?? 1) * (1 - .3 * lean);
      splashBlobPath(ctx, tx, ty + tr * .2, hr * (1 + .15 * lean), hr * (1 - .05 * lean), t.head, t.headRot); ctx.fill();
    } else { ctx.beginPath(); ctx.arc(tx, ty + tr * .2, tr, 0, Math.PI * 2); ctx.fill(); }
    ctx.globalAlpha = alpha;
  };
  // 杯口邊上一團一團的白沫（front＝畫前面那半圈，不然畫後面那半圈）
  const lumps = (fill, dy, wantFront) => {
    ctx.fillStyle = fill;
    for (const u of d.lumps) {
      if ((Math.sin(u.a) >= 0) !== wantFront) continue;
      const r = Math.max(1, rxT * .1 * u.s * (.4 + .6 * grow));
      const lx = rimX(u.a, foamOut), ly = rimY(u.a, foamOut) + dy;
      if (!d.keepTips) { ctx.beginPath(); ctx.arc(lx, ly, r, 0, Math.PI * 2); ctx.fill(); continue; }
      // 第 4 版：白沫不是一顆顆圓點，而是歪歪扭扭、大小不一的碎水花：
      //   每團形狀不規則、順著往外漂的方向拉長（漂越遠拉越長），旁邊還黏著一兩小塊
      if (!u.shape) {
        u.shape = splashShape(7, .4); u.rot = Math.random() * 6; u.k = .45 + Math.random() * 1.1;
        u.bits = []; const nb = Math.floor(Math.random() * 3);
        for (let i = 0; i < nb; i++) u.bits.push({ dx: (Math.random() - .5) * 2.4, dy: (Math.random() - .5) * 1.2, s: .3 + Math.random() * .35, shape: splashShape(6, .35), rot: Math.random() * 6 });
      }
      const rr = r * u.k, drift = foamOut - 1;
      const ang = Math.atan2(Math.sin(u.a) * .34, Math.cos(u.a));   // 往外漂的方向（畫面上）
      ctx.save(); ctx.translate(lx, ly); ctx.rotate(ang);
      splashBlobPath(ctx, 0, 0, rr * (1.15 + .35 * drift), rr * (.85 - .05 * drift), u.shape, u.rot); ctx.fill();   // 漂出去時只稍微拉長一點，不要變細長條
      for (const b of u.bits) splashBlobPath(ctx, b.dx * rr * (1 + .5 * drift), b.dy * rr, rr * b.s * 1.15, rr * b.s, b.shape, b.rot), ctx.fill();
      ctx.restore();
    }
  };
  const back = d.tips.filter(t => Math.sin(t.a) < 0), front = d.tips.filter(t => Math.sin(t.a) >= 0);
  // ① 後面那排浪花尖
  for (const t of back) { tip(t, C.shade, 1.5); tip(t, C.foam, 0); }
  // ② 杯口裡面
  ctx.fillStyle = C.inside; ctx.beginPath(); rimPath(0, Math.PI * 2, true); ctx.closePath(); ctx.fill();
  // ③ 後面那半圈白色浪花邊
  // （杯子塌下去時，白色浪花邊跟著淡掉，只剩一團團白沫繼續往外漂）
  ctx.strokeStyle = C.foam; ctx.lineWidth = Math.max(1.2, rxT * .1); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.globalAlpha = alpha * (1 - fall);
  ctx.beginPath(); rimPath(Math.PI, Math.PI * 2, true); ctx.stroke();
  ctx.globalAlpha = alpha;
  lumps(C.foam, 0, false);
  // ④ 杯子前面那片水牆：上寬下窄、兩邊往內彎
  const wall = () => {
    ctx.beginPath(); ctx.moveTo(rimX(Math.PI), rimY(Math.PI));
    ctx.quadraticCurveTo(x - rxB * .9, top + H * .55, x - rxB, y);
    ctx.ellipse(x, y, rxB, ryB, 0, Math.PI, 0, true);
    ctx.quadraticCurveTo(x + rxB * .9, top + H * .55, rimX(0), rimY(0));
    rimPath(0, Math.PI, false);   // 水牆的上緣＝杯口前面那半圈（第 4 版是波浪狀）
    ctx.closePath();
  };
  const g = ctx.createLinearGradient(0, top, 0, y + ryB);
  g.addColorStop(0, C.top); g.addColorStop(1, C.bottom);
  ctx.fillStyle = g; wall(); ctx.fill();
  // ⑤ 水牆上直直的亮線
  ctx.save(); wall(); ctx.clip();
  ctx.strokeStyle = C.streak; ctx.globalAlpha = alpha * .55; ctx.lineWidth = Math.max(1, d.w * .035);
  for (const s of d.streaks) {
    const sxT = x + s * rxT, sxB = x + s * rxB;
    ctx.beginPath(); ctx.moveTo(sxT, top + ryT * .6); ctx.lineTo(sxB, y - H * .15); ctx.stroke();
  }
  ctx.restore();
  // ⑥ 前面那半圈白色浪花邊、前面那排浪花尖
  ctx.strokeStyle = C.foam; ctx.lineWidth = Math.max(1.2, rxT * .13);
  ctx.globalAlpha = alpha * (1 - fall);
  ctx.beginPath(); rimPath(0, Math.PI, true); ctx.stroke();
  ctx.globalAlpha = alpha;
  lumps(C.shade, 1.5, true); lumps(C.foam, 0, true);
  for (const t of front) { tip(t, C.shade, 1.5); tip(t, C.foam, 0); }
  ctx.restore();
}
// js/render.js 畫完角色後呼叫：水波、水沫、水霧、水滴（形狀都不規則：水滴順著飛的方向拉長、水波斷斷續續又歪歪的、水沫是好幾團疊在一起）
function drawPoolSplash(ctx) {
  const list = typeof G !== 'undefined' && G && G.poolSplash; if (!list || !list.length) return;
  ctx.save();
  for (const d of list) {
    if (d.t < 0 || d.wait > 0) continue;   // 還沒輪到的水波、水滴
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
    if (d.ripple) {   // 細細的白色水圈（第 4 版落水用，跟皇冠水花第 3 版收尾的水圈同一種）：斷斷續續的細線，往外擴散、淡掉
      const r = d.r0 + (d.r1 - d.r0) * (1 - Math.pow(1 - p, 3));
      if (!d.dash) { d.dash = []; for (let i = 0; i < 6; i++) d.dash.push(.3 + Math.random() * 1.2, .08 + Math.random() * .35); d.dashOff = Math.random() * 3; }
      ctx.globalAlpha = .85 * k; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = Math.max(.8, 1.6 * (1 - p * .5));
      ctx.setLineDash(d.dash.map(v => v * r * .5)); ctx.lineDashOffset = d.dashOff * r;
      ctx.beginPath(); ctx.ellipse(d.x, d.y, r, r * .26, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      continue;
    }
    if (d.band) {   // 水面上的白色水沫帶（第 4 版落水用，跟皇冠水花第 3 版塌下去時那一圈同一種）：一團團白沫排成一圈，有幾團往上凸成小水柱
      const R = Math.random, PI2 = Math.PI * 2;
      if (!d.foamBits) { d.foamBits = []; for (let i = 0; i < 26; i++) d.foamBits.push({ a: i / 26 * PI2 + R() * .2, s: .6 + R() * .8, up: R() < .35 ? .8 + R() * 1.4 : 0 }); }
      // 淡入淡出：syncCrown＝跟皇冠水花第 4 版完全同步（一開始就冒出來；杯子在 .68 之後淡掉，它也在同一段時間淡掉）
      const fb = d.syncCrown
        ? Math.min(1, p / .08) * (p > .68 ? 1 - (p - .68) / .32 : 1)
        : Math.min(1, p / .15) * (1 - Math.max(0, (p - .6) / .4));
      const rfx = d.r0 + (d.r1 - d.r0) * (1 - Math.pow(1 - p, 2)), rfy = rfx * .26;   // 一邊淡掉一邊往外擴
      ctx.globalAlpha = .3 * fb; ctx.fillStyle = POOL_CROWN_COLORS.top3;   // 中間淡淡的一片水色
      ctx.beginPath(); ctx.ellipse(d.x, d.y, rfx * .42, rfy * .42, 0, 0, PI2); ctx.fill();
      ctx.globalAlpha = fb; ctx.fillStyle = '#ffffff';
      for (const f of d.foamBits) {
        const fx = d.x + Math.cos(f.a) * rfx, fy = d.y + Math.sin(f.a) * rfy, r = d.w * .045 * f.s;
        ctx.beginPath(); ctx.ellipse(fx, fy, r * 1.6, r, 0, 0, PI2); ctx.fill();
        if (f.up) { ctx.beginPath(); ctx.ellipse(fx, fy - r * f.up, r * .6, r * (f.up + .6), 0, 0, PI2); ctx.fill(); }   // 往上凸的小水柱
      }
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.ellipse(d.x, d.y, rfx, rfy, 0, 0, PI2); ctx.stroke();
      continue;
    }
    if (d.crown) { if (d.style === 3) drawPoolCrown3(ctx, d, p); else drawPoolCrown(ctx, d, p); continue; }   // 皇冠水花（落水那一下，js/pool-fall.js）
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
  if (typeof drawDiveTinted === 'function') drawDiveTinted(ctx, img, -w / 2, -h, w, h);   // 潛在水裡：壓藍黑色（js/water.js 的 WATER.dive）
  else { ctx.filter = 'brightness(.55) saturate(.6)'; ctx.drawImage(img, -w / 2, -h, w, h); }
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
