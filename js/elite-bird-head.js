/* ===== 菁英鳥頭人「鳥頭大隊長」（守在異質核心旁的地圖 BOSS）=====
   - 守衛：站在地圖指定的位置不動，身邊站著 3 隻鳥頭人，全部背對玩家、看著核心。
           溫特踩上警戒線（地圖的 wakeRow）、牠或手下被打、或核心被叫醒 → 大叫；手下跟著轉身大叫，開始照一般鳥頭人行動。
   - 大叫：核心跟著甦醒（全地圖的異質體衝回核心），畫面上方多一條 BOSS 血條。
   - 衝撞：蓄力時地上出現紅色路線（前段會跟著目標轉、後段鎖定，看準就閃得開），
           衝過去時「穿過」路線上的每一個人，各撞一次：傷害高、擊退遠，可以一次撞飛好幾位隊員。
   - 破綻：撞到牆、建築、或被舉盾的雷德正面擋下 → 暈眩好幾秒（輸出時間）。雷德不會被撞飛。
   - 核心護盾：牠活著時，牠守的核心受到的傷害減少。
   - 被引開太遠會走回原位。跑得比一般鳥頭人慢，但每一步都震動畫面；被打不太會硬直，蓄力、衝撞中完全不會被打斷。
   - 後方伏兵：大叫的同時，在地圖的 ambush 格子（玩家背後）冒出鳥頭人，跟著狂暴往核心衝，形成上下夾擊。
   地圖資料：maps.js 的 "elite": { "of": "bird_head", "c": 欄, "r": 列, "wakeRow": 列, "guards": [[欄, 列], …], "ambush": [[欄, 列], …] }
   （沒寫 c、r 就放在核心下方 2 格；wakeRow＝溫特走到這一列（含）以上就警戒，沒寫就用 wakeRange 格距離）。
   數值都在下面的 ELITE_BIRD。必須在 bird-head.js 之後、game.js 之前載入。
*/
const ELITE_BIRD = {
  name: '鳥頭大隊長',
  hpMul: 8.25, dmgMul: 2.2, rewardMul: 5, crystalMul: 5,   // 以原型鳥頭人（data/monsters.js）的數值為基準
  scale: 1.8, hue: -35,          // 體型放大倍率、換色（色相旋轉角度）
  speedMul: .5,                  // 走路速度倍率（以原型鳥頭人為基準；衝撞速度另外看 chargeSpeed）。動畫步伐、腳步聲照移動距離觸發，跟著一起變慢
  knockMul: 0,                   // 被隊員打時的擊退倍率：0＝推不動（雷德盾撞、大招擊退也推不動）
  stagger: 0,                    // 被重擊硬直幾秒：0＝不會硬直
  stunResist: .5,                // 站著、走路時被暈眩（路德大招、安柏雷電…）只暈幾成時間；大叫、蓄力、衝撞中完全不會被暈
  wakeRange: 7,                  // 地圖沒畫警戒線時：溫特走到幾格內（看得到）就會大叫
  guardTurn: [.15, .55],         // 手下聽到大叫後，過多久才轉身（秒，每隻隨機，才不會整齊劃一）
  scream: 1.2,                   // 大叫幾秒
  loseRange: 12,                 // 目標離開幾格就放棄
  chargeRange: 8,                // 幾格內才衝撞
  leash: 24,                     // 離原位超過幾格就走回去（一次衝 20 格，守備範圍要比衝刺長）
  windup: 1,                     // 衝撞前蓄力（秒）：身體發抖、腳下刨地
  aimLock: .55,                  // 蓄力前幾成時間會跟著目標轉向，之後鎖定方向
  chargeSpeed: 110,              // 衝撞最高速度（像素／秒；一般鳥頭人 250）
  chargeStart: .3,               // 起跑時只有最高速度的幾成，慢慢加速（沉重的起步）
  chargeAccel: .6,               // 幾秒加到最高速度
  chargeBrake: 1.4,              // 最後幾格煞車滑行（越來越慢、腳下噴灰）
  dashCells: 20,                 // 每次衝撞一定衝這麼多格，中途只有撞到牆才會停（建築直接撞爛、繼續衝）
  hitWidth: 40,                  // 路線中心往左右各幾像素內會被撞到（大約 2 格寬）
  knockback: 140,                // 溫特被撞飛的距離（像素）；隊員 × sentryKnockMul
  sentryKnockMul: .8,
  knockTime: .36,                // 被撞飛滑行幾秒
  redBlockDmgMul: .5,            // 雷德舉盾頂住：只吃幾成傷害、只被推開幾成距離，衝撞照樣繼續（只會被拖慢一下）
  redBlockKnockMul: .35, redBlockSlow: .45,
  recoverHit: 1, recoverMiss: .8,// 衝完撞到人／沒撞到的停頓（秒）
  dazed: 2.6,                    // 撞牆的暈眩（秒）＝輸出時間
  coreShield: .6,                // 牠活著時，核心少受幾成傷害
  returnSpeedMul: 1.1,           // 走回原位的速度倍率
  stepEvery: 50,                 // 衝撞時每跑幾像素踩一步（一般鳥頭人 40）
  stepShake: 4.5, walkShake: 1.6,// 衝撞、走路時每一步的畫面震動（溫特在 shakeRange 格內才震，越近越大）
  shakeRange: 10,
};

// ---- 開場：照地圖設定擺上場（game.js 在 seedCores 之後呼叫）----
function seedEliteGuards() {
  const cfg = typeof MAP !== 'undefined' && MAP && MAP.elite;
  if (!cfg || MAP_SAFE || (typeof practiceOn === 'function' && practiceOn())) return;
  const base = ACTIVE_MONSTERS.find(m => m.id === (cfg.of || 'bird_head'));
  if (!base || base.behavior !== 'charger') return;
  const core = G.cores[0] || null;
  let c = Number(cfg.c), r = Number(cfg.r);
  if (!Number.isFinite(c) || !Number.isFinite(r)) {
    if (!core) return;
    [c, r] = cellAt(core.x, core.y); r += 2;
  }
  if (!inGrid(c, r) || isWall(c, r)) return;
  const [x, y] = center(c, r);
  const E = ELITE_BIRD, e = createMonster(base, x, y);
  e.elite = true; e.eliteName = E.name;
  e.hp = e.maxhp = Math.round(e.maxhp * E.hpMul);
  e.playerDamage = Math.round(e.playerDamage * E.dmgMul);
  e.sentryDamage = Math.round(e.sentryDamage * E.dmgMul);
  e.buildingDamage = Math.round(e.buildingDamage * E.dmgMul);
  e.reward = Math.round(e.reward * E.rewardMul); e.crystals = Math.round((e.crystals ?? 3) * E.crystalMul);
  e.drawWidth = Math.round(base.width * E.scale); e.drawHeight = Math.round(base.height * E.scale);
  e.speed = base.speed * E.speedMul;
  e.shockResist = 1;   // 不怕電：雷電照樣吃全額傷害，但不會被麻痺停住（安柏的雷擊、雷電彈）
  e.tint = E.hue; e.knockMul = E.knockMul; e.staggerTime = E.stagger; e.unpushable = true;   // unpushable：隊員的盾撞、大招擊退都推不動（game.js）
  e.home = { x, y }; e.guardCore = core;
  e.faceRight = false; e.faceBack = true;   // 背對玩家、看著核心
  e.eb = { state: 'guard', t: 0, stunSeen: 0 }; e.ch = { state: 'idle', t: 0 };
  e.wakeY = Number.isFinite(Number(cfg.wakeRow)) ? OY + (Number(cfg.wakeRow) + 1) * CELL : null;   // 警戒線的下緣（像素）
  e.guards = [];
  for (const [gc, gr] of Array.isArray(cfg.guards) ? cfg.guards : []) {   // 身邊的手下：一般鳥頭人，先擺著不動
    if (!inGrid(gc, gr) || isWall(gc, gr)) continue;
    const [gx, gy] = center(gc, gr), g = createMonster(base, gx, gy);
    g.guardPose = { boss: e, turnT: null }; g.faceBack = true; g.faceRight = Math.random() < .5;
    e.guards.push(g); G.enemies.push(g);
  }
  e.ambush = (Array.isArray(cfg.ambush) ? cfg.ambush : []).filter(([ac, ar]) => inGrid(ac, ar) && !isWall(ac, ar));   // 大叫時從後方冒出來的鳥頭人
  e.baseSpec = base;
  G.enemies.push(e);
}

// ---- 後方伏兵：大叫的同時，在玩家背後（地圖的 ambush 格子）冒出鳥頭人 ----
// 核心已經醒了，牠們會狂暴化往核心衝 → 從背後夾擊正在打大隊長的隊伍
function eliteBirdAmbush(e) {
  for (const [ac, ar] of e.ambush || []) {
    const [x, y] = center(ac, ar), m = createMonster(e.baseSpec, x, y);
    m.ch = {}; chargerIdle(m);
    const p = G.player;
    if (p && p.hp > 0) chargerNotice(m, p, chargerCfg(m).noticeTime + .3); else m.alertT = ENEMY_ALERT_TIME;
    G.enemies.push(m);
    G.effects.push({ ring: true, x, y, r: 6, r2: 46, life: .45, life0: .45, color: '#b56bff' });   // 從黑紫霧裡冒出來
    for (let i = 0; i < 4; i++) {
      const a = Math.random() * Math.PI * 2, sp = 10 + Math.random() * 18;
      pushCorrosionMist(x + Math.cos(a) * 10, y + 4 + Math.sin(a) * 8, Math.cos(a) * sp, Math.sin(a) * sp);
    }
  }
  if ((e.ambush || []).length) {
    const [ac, ar] = e.ambush[0], [x, y] = center(ac, ar);
    if (typeof sfxAt === 'function') sfxAt('birdHurt', x, y, .8, 'elite-ambush');
  }
  e.ambush = [];   // 只出現一次
}

// ---- 手下：背對玩家站著，聽到大隊長大叫才轉身（enemy-ai.js 的 stepEnemy 呼叫）----
// 回傳 true＝還在站崗，這幀不跑一般鳥頭人的 AI
function stepEliteGuardPose(e, dt) {
  const gp = e.guardPose, boss = gp.boss;
  if (gp.turnT == null) {
    if (e.hp < e.maxhp && boss && boss.hp > 0 && !boss.eliteAwake) eliteBirdScream(boss);   // 手下被偷打：大隊長也醒
    if (boss && boss.eliteAwake || !boss || boss.hp <= 0 || e.hp < e.maxhp) {
      const [lo, hi] = ELITE_BIRD.guardTurn;
      gp.turnT = lo + Math.random() * (hi - lo);
    }
    return true;
  }
  gp.turnT -= dt;
  if (gp.turnT > 0) return true;
  // 轉身大叫：之後就是一般鳥頭人（看到人就衝撞）
  e.guardPose = null; e.faceBack = false; e.showBack = false;
  e.ch = {}; chargerIdle(e);
  const p = G.player;
  if (p && p.hp > 0) chargerNotice(e, p, chargerCfg(e).noticeTime + .35); else e.alertT = ENEMY_ALERT_TIME;
  flash('嘎！', e.x, e.y - (e.drawHeight || 80) - 4, '#ffe08a');
  G.effects.push({ ring: true, x: e.x, y: e.y - (e.drawHeight || 80) * .6, r: 6, r2: 46, life: .35, life0: .35, color: '#ffe08a' });
  if (typeof sfxAt === 'function') sfxAt('birdHurt', e.x, e.y, .7, 'elite-guard-' + (e.stepKey ||= Math.random().toString(36).slice(2, 7)));
  return false;
}

const eliteBirdAlive = core => G.enemies.some(e => e.elite && e.hp > 0 && !e.dead && e.guardCore === core);
const eliteDist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

// ---- 核心護盾：牠活著時，核心這段時間少掉的血只算一部分 ----
// （game.js 在核心更新前、判定核心破掉前各呼叫一次；所有傷害來源都在這裡統一打折）
function eliteShieldCores() {
  if (!G || !G.cores) return;
  for (const core of G.cores) {
    if (core.dead || !core.awake || !(core.hp < core.lastHp) || !eliteBirdAlive(core)) continue;
    core.hp = core.lastHp - (core.lastHp - core.hp) * (1 - ELITE_BIRD.coreShield);
    core.lastHp = core.hp; core.hitT = .16;
    const now = performance.now();
    if (now > (G.eliteShieldNoteAt || 0)) {   // 偶爾提示一下，不要每一槍都跳字
      G.eliteShieldNoteAt = now + 2500;
      flash('核心護盾：' + ELITE_BIRD.name + '還活著', core.x, core.y - CORE.h - 14, '#ffd27a');
    }
  }
}

// ---- 選目標：溫特優先（看得到、夠近）；不在就找看得到的最近隊員 ----
function eliteBirdTarget(e) {
  const E = ELITE_BIRD, p = G.player;
  if (p && p.hp > 0 && eliteDist(p, e) <= E.loseRange * CELL && hasLineOfSight(e.x, e.y, p.x, p.y)) return p;
  let best = null, bestD = E.loseRange * CELL;
  for (const t of G.towers) {
    if (t.hp <= 0 || t.berserk || !enemyNoticesSentry(e, t)) continue;
    const d = eliteDist(t, e);
    if (d <= bestD && hasLineOfSight(e.x, e.y, t.x, t.y)) { best = t; bestD = d; }
  }
  return best;
}
// e.ch 是原型鳥頭人的狀態：畫面（發呆動畫、衝刺步伐、眼睛閃光）和腳步聲都看它，這裡跟著同步
function eliteBirdSet(e, state, t = 0) {
  e.eb.state = state; e.eb.t = t;
  e.ch.state = state === 'guard' ? 'idle' : state === 'charge' ? 'charge' : 'notice';
}

// ---- 大叫：核心跟著醒來 ----
function eliteBirdScream(e) {
  e.eliteAwake = true; e.faceBack = false; e.showBack = false;   // 轉過身來
  eliteBirdSet(e, 'scream', ELITE_BIRD.scream);
  e.alertT = ENEMY_ALERT_TIME; e.eyeFlashT = EYE_FLASH.time;
  const core = e.guardCore;
  if (core && !core.awake && !core.dead) { wakeCore(core); core.lastHp = core.hp; }
  eliteBirdAmbush(e);
  if (typeof coreBanner === 'function') coreBanner(ELITE_BIRD.name + '甦醒了', '核心跟著醒來，異質體正衝回核心身邊！');
  systemNotice(ELITE_BIRD.name + '發出尖叫！核心甦醒了', true);
  flash('嘎——！！', e.x, e.y - e.drawHeight - 10, '#ffd27a');
  for (let i = 0; i < 3; i++) G.effects.push({ ring: true, x: e.x, y: e.y - e.drawHeight * .6, r: 8 + i * 6, r2: 110 + i * 40, life: .45 + i * .15, life0: .45 + i * .15, color: i ? '#ffd27a' : '#ffffff' });
  nearbyImpact(e.x, e.y, 9, .06);
  if (typeof sfxAt === 'function') sfxAt('birdDeath', e.x, e.y, 1, 'elite-bird-scream');   // 暫用：之後有專屬叫聲再換
}

// ---- 蓄力：地上的紅色路線 ----
function eliteBirdAim(e, target) {
  e.eb.target = target;
  eliteBirdSet(e, 'aim', ELITE_BIRD.windup);
  eliteBirdAimAt(e, target);
  if (target === G.player) e.eyeFlashT = EYE_FLASH.time;
}
function eliteBirdAimAt(e, target) {
  const E = ELITE_BIRD, dx = target.x - e.x, dy = target.y - e.y, d = Math.hypot(dx, dy) || 1;
  e.eb.dir = e.ch.dir = { x: dx / d, y: dy / d };   // 撞擊特效（spawnChargeImpact）讀 e.ch.dir
  e.eb.len = E.dashCells * CELL;
  e.eb.showLen = eliteBirdWallDistance(e, e.eb.dir, e.eb.len);   // 紅線畫到第一道牆為止
  chargerFace(e, target.x);
}
// 沿著方向往前找第一道牆（建築不算，會被撞爛）；回傳距離（像素），最多 maxLen
function eliteBirdWallDistance(e, dir, maxLen) {
  for (let d = 8; d < maxLen; d += 8) {
    const [c, r] = cellAt(e.x + dir.x * d, e.y + dir.y * d);
    if (!inGrid(c, r) || isWall(c, r)) return d;
  }
  return maxLen;
}
// 撞上建築：不管是什麼、血量多少，直接撞爛，衝撞不停
function eliteBirdSmash(e, o) {
  const ox = OX + (o.c + (o.w || 1) / 2) * CELL, oy = OY + (o.r + (o.h || 1) / 2) * CELL;
  o.lastHitBy = 'monster'; o.hp = 0; o.hitT = HIT_DUR;   // lastHitBy：油桶被怪物撞壞只漏油、不爆炸（js/oil-barrels.js）
  removeBarrier(o);
  if (o.isBase) { flash('基地被摧毀！', OX + (o.c + o.w / 2) * CELL, OY + o.r * CELL - 18, '#ff5b5b'); if (!G.over) baseLost(); }
  G.effects.push({ ring: true, x: ox, y: oy, r: 6, r2: 44, life: .3, life0: .3, color: '#d9d2c0' });
  for (let i = 0; i < 8; i++) {   // 碎片往衝刺方向噴
    const a = Math.atan2(e.eb.dir.y, e.eb.dir.x) + (Math.random() * 2 - 1) * .9, sp = 120 + Math.random() * 140;
    G.effects.push({ particle: true, kind: 'spark', x: ox, y: oy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 30, r: 2 + Math.random() * 3, life: .4, life0: .4, color: '#9a9283' });
  }
  eliteBirdShake(e, 6); addHitstop(.05);
  if (typeof sfxAt === 'function') sfxAt('knock2', ox, oy, 1, 'elite-bird-smash');
}

// ---- 衝撞：穿過路線上的每一個人 ----
function eliteBirdStartCharge(e) {
  e.eb.left = e.eb.len; e.eb.hit = new Set(); e.eb.hitAny = false; e.eb.speedK = ELITE_BIRD.chargeStart;
  eliteBirdSet(e, 'charge');
  G.effects.push({ ring: true, x: e.x, y: e.y + 10, r: 6, r2: 34, life: .25, life0: .25, color: '#d9d2c0' });   // 起跑揚塵
  addShake(3);
}
function eliteBirdDaze(e) {   // 不跳字：頭上冒星星（drawEliteTelegraphs 畫）
  eliteBirdSet(e, 'dazed', ELITE_BIRD.dazed);
  G.effects.push({ ring: true, x: e.x, y: e.y + 6, r: 6, r2: 40, life: .3, life0: .3, color: '#c9c2b0' });
  nearbyImpact(e.x, e.y, 7, .08);
}
function eliteBirdHitPlayer(e, p) {
  const E = ELITE_BIRD, dir = e.eb.dir;
  spawnChargeImpact(e, p);
  e.playerTouchCd = 0;
  enemyAttackPlayer(e, 0);
  knockActor(p, dir.x, dir.y, E.knockback, E.knockTime);
}
function eliteBirdHitSentry(e, t, mul) {
  if (parryMiss(t, false)) { flashDmg('MISS', t.x, t.y - 30, '#c6d1dd'); return; }   // 柯林的劍舞架勢：打空
  const damage = e.sentryDamage * mul * (1 - sentryDefense(t));
  t.hp = Math.max(0, t.hp - damage);
  t.hitT = Math.max(t.hitT || 0, .2);
  flash('-' + Math.round(damage), t.x, t.y - 30, '#ff8f8f');
  if (t.hp <= 0) { t.target = null; sentryStatus(t, '失去戰鬥能力', '#ff5b6e', true); }
}
function eliteBirdCheckHits(e) {
  const E = ELITE_BIRD, dir = e.eb.dir, hit = e.eb.hit;
  const reach = E.hitWidth + 12;
  const p = G.player;
  if (p && p.hp > 0 && !hit.has(p) && eliteDist(p, e) <= reach) { hit.add(p); e.eb.hitAny = true; eliteBirdHitPlayer(e, p); }
  for (const t of G.towers) {
    if (t.hp <= 0 || t.berserk || hit.has(t) || eliteDist(t, e) > reach) continue;
    hit.add(t); e.eb.hitAny = true;
    spawnChargeImpact(e, t);
    const braced = t.type === 'red' && t.shieldMode && !t.eatenBy && !(t.sleepT > 0);   // 雷德舉盾頂住：傷害減半、只被推開一點，大隊長被拖慢一下但不會停
    eliteBirdHitSentry(e, t, braced ? E.redBlockDmgMul : 1);
    knockActor(t, dir.x, dir.y, E.knockback * E.sentryKnockMul * (braced ? E.redBlockKnockMul : 1), E.knockTime);
    t.navPath = null; t.navGoal = null;
    if (braced) { sentryStatus(t, '頂住衝撞！', '#dbe7ff'); e.eb.speedK = Math.min(e.eb.speedK, E.redBlockSlow); }
  }
}
// 速度：起跑慢慢加速 → 最高速 → 最後一段煞車滑行；撞到人（雷德）會被拖慢，再慢慢加回來
function eliteBirdChargeSpeed(e, dt) {
  const E = ELITE_BIRD, eb = e.eb;
  eb.speedK = Math.min(1, eb.speedK + (1 - E.chargeStart) * dt / E.chargeAccel);
  const brake = E.chargeBrake * CELL, k = eb.left < brake ? Math.max(.25, eb.left / brake) : 1;
  if (eb.left < brake && Math.random() < .6) G.effects.push({ particle: true, kind: 'spark', x: e.x + (Math.random() * 2 - 1) * 14, y: e.y + 12,
    vx: -eb.dir.x * 60 + (Math.random() * 2 - 1) * 30, vy: -eb.dir.y * 60 - 10, r: 2 + Math.random() * 2.5, life: .3, life0: .3, color: '#b9b2a2' });   // 煞車噴灰
  return E.chargeSpeed * eb.speedK * k;
}
function eliteBirdChargeStep(e, dt) {
  const E = ELITE_BIRD, x0 = e.x, y0 = e.y;
  let move = Math.min(e.eb.left, eliteBirdChargeSpeed(e, dt) * dt);
  e.eb.left -= move;
  while (move > 0) {
    const s = Math.min(4, move); move -= s;
    const nx = e.x + e.eb.dir.x * s, ny = e.y + e.eb.dir.y * s;
    const [c, r] = cellAt(nx, ny);
    if (!inGrid(c, r) || isWall(c, r)) {   // 只有牆擋得住：停下來暈眩
      eliteBirdDaze(e);
      eliteBirdFootsteps(e, Math.hypot(e.x - x0, e.y - y0), true);
      return;
    }
    const blocker = barrierAt(c, r);
    if (blocker) eliteBirdSmash(e, blocker);   // 建築：直接撞爛，繼續衝
    e.x = nx; e.y = ny;
    eliteBirdCheckHits(e);
  }
  eliteBirdFootsteps(e, Math.hypot(e.x - x0, e.y - y0), true);
  if (e.eb.left <= 0) eliteBirdSet(e, 'recover', e.eb.hitAny ? E.recoverHit : E.recoverMiss);
}

// 沉重的腳步：每一步都有腳步聲、揚塵、畫面輕微震動（溫特離越近震越大）
function eliteBirdFootsteps(e, moved, loud) {
  const E = ELITE_BIRD;
  e.ch.stepDist = (e.ch.stepDist || 0) + moved;
  const every = loud ? E.stepEvery : E.stepEvery * .6;
  if (e.ch.stepDist < every) return;
  e.ch.stepDist %= every;
  eliteBirdShake(e, loud ? E.stepShake : E.walkShake);
  e.hitSquashT = loud ? .1 : .06;   // 落腳時身體被壓扁一下再彈回（跟受擊同一套壓扁回彈）
  G.effects.push({ ring: true, x: e.x, y: e.y + 12, r: 6, r2: loud ? 38 : 22, life: .28, life0: .28, color: '#b9b2a2' });
  for (let i = 0; i < (loud ? 4 : 2); i++) G.effects.push({ particle: true, kind: 'spark', x: e.x + (Math.random() * 2 - 1) * 16, y: e.y + 12,
    vx: (Math.random() * 2 - 1) * 70, vy: -20 - Math.random() * 30, r: 2 + Math.random() * 2.5, life: .35, life0: .35, color: '#a9a292' });   // 腳邊揚起的灰塵
  if (typeof sfxAt === 'function') {
    sfxAt(loud ? 'birdRun' : 'birdWalk', e.x, e.y, loud ? 1.3 : .9, 'elite-bird-step');
    sfxAt('knock2', e.x, e.y, loud ? .35 : .2, 'elite-bird-thud');   // 疊一聲悶響，腳步比較重
  }
}
// 畫面震動：溫特在 shakeRange 格內才震，越近越大（比一般衝擊的 6 格範圍遠，走廊另一頭也感覺得到）
function eliteBirdShake(e, amount) {
  const p = G.player; if (!p) return;
  const d = Math.hypot(p.x - e.x, p.y - e.y) / CELL, R = ELITE_BIRD.shakeRange;
  if (d < R) addShake(amount * (.3 + .7 * (1 - d / R)));
}

// 有目標：夠近就蓄力衝撞，不夠近就走過去。回傳 true＝找到目標了
function eliteBirdEngage(e) {
  const target = eliteBirdTarget(e);
  if (!target) return false;
  if (eliteDist(target, e) <= ELITE_BIRD.chargeRange * CELL) eliteBirdAim(e, target);
  else eliteBirdSet(e, 'approach');
  return true;
}

// ---- 每幀（enemy-ai.js 的 stepEnemy 呼叫）----
function stepEliteBird(e, dt) {
  const E = ELITE_BIRD, eb = e.eb;
  if (e.eyeFlashT > 0) e.eyeFlashT = Math.max(0, e.eyeFlashT - dt);
  e.superArmor = eb.state === 'aim' || eb.state === 'charge' || eb.state === 'scream';   // 霸體：重擊打不斷（js/combat-feel.js）
  if (e.superArmor) { e.stunT = 0; e.confuseT = 0; }   // 大叫、蓄力、衝撞中：暈眩、混亂都無效
  else if ((e.stunT || 0) > eb.stunSeen) e.stunT = eb.stunSeen + (e.stunT - eb.stunSeen) * E.stunResist;   // 其他時候：新的暈眩只算一部分時間
  eb.stunSeen = e.stunT || 0;
  e.tremble = eb.state === 'aim';   // 蓄力時身體發抖（render.js）
  if (e.stunT > 0 || e.confuseT > 0) { if (eb.state === 'charge' || eb.state === 'aim') eliteBirdSet(e, 'recover', .3); return; }
  eb.t -= dt;
  const awayHome = eliteDist(e, e.home);
  switch (eb.state) {
    case 'guard': {
      if (!e.eliteAwake) {
        const p = G.player, core = e.guardCore, alive = p && p.hp > 0;
        const near = alive && (e.wakeY != null ? p.y < e.wakeY && eliteDist(p, e) <= E.loseRange * CELL   // 踩上警戒線
          : eliteDist(p, e) <= E.wakeRange * CELL && hasLineOfSight(e.x, e.y, p.x, p.y));
        if (near || e.hp < e.maxhp || (core && core.awake)) eliteBirdScream(e);
        return;
      }
      eliteBirdEngage(e);
      return;
    }
    case 'approach': {   // 目標在衝撞範圍外：往前走近（遠程隊員不能站在範圍外白打）
      if (awayHome > E.leash * CELL) { eliteBirdSet(e, 'return'); return; }
      const target = eliteBirdTarget(e);
      if (!target) { eliteBirdSet(e, 'return'); return; }
      if (eliteDist(target, e) <= E.chargeRange * CELL) { eliteBirdAim(e, target); return; }
      chargerFace(e, target.x);
      if (awayHome > E.leash * CELL * .7) return;   // 走到守備範圍邊緣就停下來等，不再往外追
      const [tc, tr] = cellAt(target.x, target.y), hx = e.x, hy = e.y;
      const nav = enemyNavigate(e, tc, tr, dt, 'elite-approach:' + tc + ',' + tr, true);
      eliteBirdFootsteps(e, Math.hypot(e.x - hx, e.y - hy), false);
      if (nav.blocker) enemyAttackObstacle(e, nav.blocker, dt);
      return;
    }
    case 'scream': if (eb.t <= 0) eliteBirdSet(e, 'recover', 0); return;
    case 'aim': {
      const target = eb.target;
      if (!target || target.hp <= 0) { eliteBirdSet(e, 'recover', .2); return; }
      if (eb.t > E.windup * (1 - E.aimLock)) eliteBirdAimAt(e, target);   // 前段跟著轉，後段鎖定
      eb.pawT = (eb.pawT || 0) - dt;
      if (eb.pawT <= 0) {   // 腳下刨地：往後踢灰、輕輕震一下
        eb.pawT = .3;
        eliteBirdShake(e, 1.2);
        for (let i = 0; i < 3; i++) G.effects.push({ particle: true, kind: 'spark', x: e.x - eb.dir.x * 10, y: e.y + 12,
          vx: -eb.dir.x * 90 + (Math.random() * 2 - 1) * 40, vy: -eb.dir.y * 90 - 25, r: 2 + Math.random() * 2, life: .3, life0: .3, color: '#a9a292' });
        if (typeof sfxAt === 'function') sfxAt('birdWalk', e.x, e.y, .7, 'elite-bird-paw');
      }
      if (eb.t <= 0) eliteBirdStartCharge(e);
      return;
    }
    case 'charge': eliteBirdChargeStep(e, dt); return;
    case 'dazed':
    case 'recover': {
      if (eb.t > 0) return;
      if (awayHome > E.leash * CELL) { eliteBirdSet(e, 'return'); return; }
      if (!eliteBirdEngage(e)) eliteBirdSet(e, awayHome > CELL * .5 ? 'return' : 'guard');
      return;
    }
    case 'return': {
      if (awayHome <= E.leash * CELL * .6) {   // 走回來一段路後，有人在衝撞範圍內就再衝（不再往外追，免得來回踱步）
        const target = eliteBirdTarget(e);
        if (target && eliteDist(target, e) <= E.chargeRange * CELL) { eliteBirdAim(e, target); return; }
      }
      if (awayHome <= 3) { e.x = e.home.x; e.y = e.home.y; eliteBirdSet(e, 'guard'); return; }
      const [hc, hr] = cellAt(e.home.x, e.home.y), hx = e.x, hy = e.y;
      const nav = enemyNavigate(e, hc, hr, dt * E.returnSpeedMul, 'elite-home', true);
      eliteBirdFootsteps(e, Math.hypot(e.x - hx, e.y - hy), false);
      if (nav.blocker) enemyAttackObstacle(e, nav.blocker, dt);
      else if (nav.reached && awayHome <= CELL) eliteBirdSet(e, 'guard');
      return;
    }
    default: eliteBirdSet(e, 'guard');
  }
}

// ---- 畫面：蓄力時地上的衝撞路線（render.js 在黑幕之後呼叫，暗處也看得到）----
function drawEliteTelegraphs(ctx) {
  if (!G || !G.enemies) return;
  const t = performance.now() / 1000;
  for (const e of G.enemies) {
    if (!e.elite || e.hp <= 0) continue;
    drawEliteTelegraph(ctx, e);
    // 暈眩（撞牆、被路德／安柏暈）：頭上轉圈的星星，跟版權老鼠同一套（js/burrowing-mouse.js）
    if ((e.eb && e.eb.state === 'dazed' && e.eb.t > 0 || e.stunT > 0) && typeof drawBurrowDizzyStars === 'function')
      drawBurrowDizzyStars(ctx, e.x, e.y + 13 - e.drawHeight + 6, e.drawWidth / 100, t);
  }
}
function drawEliteTelegraph(ctx, e) {
  if (!e.eb || e.eb.state !== 'aim' || !e.eb.dir) return;
  const E = ELITE_BIRD, k = 1 - Math.max(0, e.eb.t) / E.windup, locked = e.eb.t <= E.windup * (1 - E.aimLock);
  const ang = Math.atan2(e.eb.dir.y, e.eb.dir.x), len = e.eb.showLen || e.eb.len, w = E.hitWidth;
  ctx.save();
  ctx.translate(e.x, e.y + 8); ctx.rotate(ang);
  // 沿著路線的漸層：腳下淡入、中段最濃、尾端慢慢淡出（不畫硬邊的方框）
  const fade = (rgb, a) => {
    const g = ctx.createLinearGradient(0, 0, len, 0);
    g.addColorStop(0, `rgba(${rgb},0)`); g.addColorStop(.08, `rgba(${rgb},${a})`);
    g.addColorStop(.55, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`);
    return g;
  };
  ctx.fillStyle = fade('255,75,58', .14 + .22 * k);
  ctx.fillRect(0, -w, len * k, w * 2);                  // 由近往遠慢慢填滿
  ctx.strokeStyle = locked ? fade('255,106,77', .9) : fade('255,176,138', .55); ctx.lineWidth = 2; ctx.lineCap = 'round';
  ctx.setLineDash(locked ? [] : [8, 6]);                // 鎖定前是虛線、鎖定後變實線
  ctx.beginPath(); ctx.moveTo(0, -w); ctx.lineTo(len, -w); ctx.moveTo(0, w); ctx.lineTo(len, w); ctx.stroke();   // 只畫左右兩條邊，尾端跟著漸層消失
  ctx.restore();
}

// ---- 畫面上方的 BOSS 血條（core-frenzy.js 的 drawCoreBossUI 呼叫）----
function eliteBossBars() {
  if (!G || !G.enemies) return [];
  return G.enemies.filter(e => e.elite && e.eliteAwake && e.hp > 0 && !e.dead)
    .map(e => ({ label: e.eliteName, ratio: e.hp / e.maxhp, hit: e.hitT > 0, colors: ['#c9781f', '#ffd27a'], frame: '#ffb347', text: '#ffe2a8' }));
}

// ---- 倒下（combat-feel.js 的 onEnemyDeath 呼叫）----
function eliteBirdDown(e) {
  systemNotice(e.eliteName + '倒下了！核心護盾消失', true);
  if (typeof coreBanner === 'function') coreBanner(e.eliteName + '倒下了', '核心護盾消失，趁現在打破核心！', '#ffd27a');
  nearbyImpact(e.x, e.y, 10, .08);
}
