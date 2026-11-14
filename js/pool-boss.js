/* ===== 池核 BOSS：巨大比基尼小丑魚（比基尼小丑魚放大 2.5 倍，守在深水區的異質核心旁）=====
   ・守護：一開始浮在核心旁邊（露出上半身），不會動
   ・開戰：牠被打到、或核心被叫醒 → 開始在深水區裡游來游去（畫面上方出現 BOSS 血條）
   ・游泳：大部分時間潛在水裡（只看得到淡淡的影子，深水區的能見度越低越淡；這時候打不到），
          偶爾浮上來露出上半身幾秒（打得到），再潛下去。浮上來時溫特坐救生圈不能開槍，只有岸上的遠程隊友打得到
   ・水被抽乾（js/pool-tide.js）：在當下的位置擱淺，偶爾拍動身體；誰都打得到
   ・水又漲起來：又開始游
   ・開戰後，牠附近生出來的怪物有 8 成是小丑魚幼體（js/anomalous-core.js 的 spawnCoreGroup 問 poolBossSpawnSpec）
   ・數值都在下面的 POOL_BOSS；必須在 clownfish.js、anomalous-core.js 之後、game.js 之前載入 */
const POOL_BOSS = {
  name: '巨大比基尼小丑魚',
  maps: ['map_mv1bzur4'],     // 04. 池核
  of: 'clownfish',            // 以哪隻怪物為基準（怪物編輯器的比基尼小丑魚）
  scale: 2.5,                 // 放大幾倍
  hp: 2400,                   // 血量（再乘整體難度）
  rewardMul: 6, crystalMul: 6,
  swimSpeed: 70,              // 潛在水裡游的速度（像素／秒）
  surfacedSpeedMul: .35,      // 浮上來時游的速度倍率（慢慢漂）
  dive: [4, 8],               // 潛水幾秒（隨機）
  surface: [3, 5],            // 浮上來幾秒（隨機）
  wanderCells: 10,            // 每次游到離現在幾格內的另一個地方
  surfaceDepth: .5,           // 浮上來時水面在身體的哪裡（.5＝露出上半身）
  silhouette: .35,            // 潛水時的影子多濃（再乘深水區的能見度）
  defaultSee: .45,            // 深水區沒有水素材時的能見度
  flop: [1.2, 3],             // 擱淺時隔幾秒拍一下
  flopTime: .32,              // 拍一下多久
  flopLift: 14,               // 拍起來多高（像素）
  splash: { upDrops: 26, diveDrops: 34, upUp: 160, diveUp: 330, gravity: 620 },   // 水花：出水／跳水各噴幾滴、往上噴多快、重力
  nearSpawn: 14,              // 開戰後，牠幾格內生出來的怪物
  hatchlingChance: .8,        // 有幾成是小丑魚幼體
  hatchlingId: 'clownfish_small',
};

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
  const want = !deep ? 'stranded' : e.eliteAwake ? 'swim' : 'guard';
  if (pb.phase !== want) {
    pb.phase = want; pb.goal = null; e.forceFrame = null; e.slimeLift = 0;
    if (want === 'stranded') { poolBossShow(pb, true); pb.flopT = poolBossRand(POOL_BOSS.flop) * .5; }   // 水抽乾：就地擱淺（浮出來、打得到）
    else if (want === 'swim') { pb.sub = false; pb.t = poolBossRand(POOL_BOSS.surface) * .5; poolBossShow(pb, true); }
    else poolBossShow(pb, true);
  }
  if (pb.phase === 'stranded') { poolBossFlop(pb, dt); return; }
  if (pb.phase === 'guard') { e.forceFrame = null; return; }
  // ---- 游泳：潛水 ↔ 浮上來 ----
  pb.t -= dt;
  if (pb.t <= 0) {
    pb.sub = !pb.sub;
    pb.t = poolBossRand(pb.sub ? POOL_BOSS.dive : POOL_BOSS.surface);
    poolBossShow(pb, !pb.sub);
    poolBossSplash(e, pb.sub ? 'dive' : 'up');   // 潛下去：跳水的水花；浮上來：周圍濺起水花
  }
  poolBossSwim(pb, dt);
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
function poolBossSwim(pb, dt) {
  const e = pb.e, P = POOL_BOSS;
  if (!pb.goal || Math.hypot(pb.goal.x - e.x, pb.goal.y - e.y) < 8) pb.goal = poolBossPickGoal(e);
  if (!pb.goal) return;
  const dx = pb.goal.x - e.x, dy = pb.goal.y - e.y, d = Math.hypot(dx, dy);
  const step = Math.min(d, P.swimSpeed * (pb.sub ? 1 : P.surfacedSpeedMul) * dt);
  const nx = e.x + dx / d * step, ny = e.y + dy / d * step;
  if (deepWaterAtPoint(nx, ny)) { e.x = nx; e.y = ny; } else pb.goal = null;   // 游到岸邊了：換個方向
  if (Math.abs(dx) > 2) e.forceFlip = dx > 0;   // 原圖朝左：往右游就翻過來
  e.forceFrame = e.frames && e.frames.front || null;
}
// 挑一個游得到的地方：離現在 wanderCells 格內的深水，而且直直游過去一路都是深水
function poolBossPickGoal(e) {
  const list = (MAP && MAP.deepWater) || [], R = POOL_BOSS.wanderCells * CELL;
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
const nearbyImpactSafe = e => { if (typeof nearbyImpact === 'function') nearbyImpact(e.x, e.y, 3, .04); };
// ---- 水花：浮上來（up）＝周圍往外濺開一圈；潛下去（dive）＝跳水，水柱往上噴再落下 ----
// 音效：音效編輯器的 poolBossSplash（魚頭君的噴水攻擊）
function poolBossSplash(e, kind = 'up') {
  const S = POOL_BOSS.splash, w = e.drawWidth || 270, list = G.poolSplash || (G.poolSplash = []);
  const y = e.y + 8;
  G.effects.push({ ring: true, x: e.x, y, r: 10, r2: w * .55, life: .55, life0: .55, color: '#d6f2ff' });
  G.effects.push({ ring: true, x: e.x, y, r: 6, r2: w * .35, life: .4, life0: .4, color: '#ffffff' });
  const n = kind === 'dive' ? S.diveDrops : S.upDrops;
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    if (kind === 'dive') {   // 跳水：往上噴的水柱，範圍窄、噴得高
      const sp = 20 + Math.random() * 50;
      list.push({ x: e.x + (Math.random() - .5) * w * .3, y, z: 0, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * .45, vz: S.diveUp * (.6 + Math.random() * .6), r: 2 + Math.random() * 3, life: 1.1, t: 0 });
    } else {                 // 出水：從身體周圍往外濺開
      const sp = 70 + Math.random() * 110, rr = w * (.25 + Math.random() * .2);
      list.push({ x: e.x + Math.cos(a) * rr, y: y + Math.sin(a) * rr * .45, z: 10 + Math.random() * 30, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * .45, vz: S.upUp * (.5 + Math.random() * .7), r: 2 + Math.random() * 3, life: 1, t: 0 });
    }
  }
  if (list.length > 300) list.splice(0, list.length - 300);
  if (typeof sfxAt === 'function') sfxAt('poolBossSplash', e.x, e.y, 1, 'pool-boss-splash'); else if (typeof sfx === 'function') sfx('poolBossSplash');
}
function updatePoolSplash(dt) {
  const list = G.poolSplash; if (!list || !list.length) return;
  for (const d of list) {
    d.t += dt; d.x += d.vx * dt; d.y += d.vy * dt;
    d.vz -= POOL_BOSS.splash.gravity * dt; d.z += d.vz * dt;
    if (d.z < 0 && d.vz < 0) { d.z = 0; d.t = d.life; }   // 落回水面
  }
  G.poolSplash = list.filter(d => d.t < d.life);
}
// js/render.js 畫完角色後呼叫：水滴
function drawPoolSplash(ctx) {
  const list = typeof G !== 'undefined' && G && G.poolSplash; if (!list || !list.length) return;
  ctx.save();
  for (const d of list) {
    const k = 1 - d.t / d.life;
    ctx.globalAlpha = .85 * Math.min(1, k * 1.6);
    ctx.fillStyle = '#e6f7ff';
    ctx.beginPath(); ctx.arc(d.x, d.y - d.z, d.r, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha *= .5; ctx.fillStyle = '#7fc4ef';
    ctx.beginPath(); ctx.arc(d.x + d.r * .3, d.y - d.z + d.r * .3, d.r * .6, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

// ---- 給其他程式用 ----
// js/enemy-ai.js：牠在 G.enemies 裡的時候，一般的怪物 AI 不要動牠（這裡自己管）
function stepPoolBoss(e, dt) { e.moving = false; }
// js/water.js 的 wadeInfo：游泳、守護時露出上半身，下半身照深水區的能見度半透明；擱淺時照一般的水
function poolBossWade(a) {
  const pb = poolBossState(); if (!pb || pb.e !== a || pb.phase === 'stranded') return undefined;
  return { w: { depth: POOL_BOSS.surfaceDepth, see: poolBossSee(a) }, bottom: a.y + 13, height: a.drawHeight || 330, width: (a.drawWidth || 270) * .6 };
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
