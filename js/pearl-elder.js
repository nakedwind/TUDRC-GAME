/* ===== 菁英珍珠小童「珍珠大童」（抱著異質核心閒晃的地圖 BOSS）=====
   - 閒晃：抱著異質核心（核心圖疊在牠身上）在核心原本的位置附近慢慢飄。
   - 觸發：溫特走到 wakeRange 格內（看得到）、或打中牠 → BOSS 戰開始（畫面上方 BOSS 血條＋中BOSS 音樂）。
   - 張殼：飄在空中、保持距離，蓄力後扇形散射珍珠。這時候是弱點。
   - 閉殼：張殼時被打中 → 蓋起來掉到地上，受到的傷害 × shell.defense（很硬），從天上降下大小珍珠：
           地上先出現陰影圈，砸下來有傷害。小珍珠砸完就碎；大珍珠留在場上當掩體。只有被爆炸炸到（pearlBossBlast）或被大珍珠撞到才會提早打開，不然要等 shell.time 秒；閉殼期間一直降珍珠。張開後 grace 秒內被打不會再閉殼（輸出時間）。
   - 閉殼滾動：閉殼中每隔 roll.every 秒，蓄力（地上畫出路線）後整顆殼朝目標滾過去：撞飛溫特和隊員、建築直接撞爛、大珍珠撞碎；
           撞到牆會反彈 roll.bounces 次，反彈完再撞到牆才停下來，殼被撞開、頭暈 roll.wallStun 秒。
   - 身體碰撞：PEARL_ELDER.body 的橢圓碰到牆就停、被推也會被擠出來，不會看起來穿牆。
   - 小滾珠：小珍珠砸下來會散出更小的滾珠，踩到會滑倒、滑行中撞到東西會頭暈（金蕉王香蕉皮那一套）。
   - 大珍珠：擋住雙方的子彈和射線（視線）、擋路。溫特走過去頂著就能推；用手槍打會推得更快。
           滾得夠快（big.ramSpeed 以上）撞到大童 → 大傷害、強制打開貝殼、暈眩（暈眩中受到的傷害變多），大珍珠碎掉；
           滾得慢只會把大童推開，沒有傷害。落地時畫面震動、地上砸出裂痕、噴石礫和煙霧（跟葫蘆猴落地同一套特效）。
           被珍珠（大童的散射）打太多下也會碎；場上最多 big.max 顆，超過就碎掉最舊的那顆。
   - 核心：牠活著時核心打不到；打在牠身上的傷害，核心跟著吃 coreShare（1 成），但核心不會在牠身上破掉（最少留 1 滴血）。
           核心血量改成 coreHp（再乘地圖難度）。BOSS 戰一開始核心就跟著甦醒（異質體狂暴化），但一樣打不到、炸不到。
           牠死掉後核心掉在原地，這時候才能把核心打爆（第一槍照樣會叫醒核心）。
   出現在哪張地圖、生在哪一格：PEARL_ELDER.maps（地圖 id → 欄、列）；牠自己帶一顆核心，地圖上原本的核心照樣留著（全部打破才過關）。
   數值都在下面的 PEARL_ELDER。必須在 pearl-kid.js、anomalous-core.js 之後、game.js 之前載入。
*/
const PEARL_ELDER = {
  name: '珍珠大童',
  maps: { map_mvvdbiyx: { c: 91, r: 32 } },   // 出現在哪幾張地圖、生在哪一格（K56區-地下街：右邊有斑馬線、電梯的大房間，斑馬線上方的中間；地圖改成 106×96 之後的座標）
  hp: 3500, dmgMul: .75, rewardMul: 6, crystalMul: 6,   // 以珍珠小童（data/monsters.js）的數值為基準；hp：血量（再乘整體難度）
  scale: 2.6,                    // 體型放大倍率
  speedMul: 1.2,                 // 飄的速度倍率（以珍珠小童為基準）
  hover: 26,                     // 張殼時飄多高（像素）
  wakeRange: 6,                  // 溫特走到幾格內（看得到）就觸發 BOSS 戰
  loseRange: 20, loseTime: 8,    // 目標離開幾格、超過幾秒沒有目標 → 放棄，回去閒晃
  leash: 14,                     // 追人最遠追到離原位幾格：到了就停在那裡（射得到照樣射），不再往外追
  returnAt: 18, returnTo: 10, returnMax: 6,   // 被推（或撞）到離原位幾格以外 → 飄回去；回到幾格內、或飄了幾秒就恢復戰鬥（不用回到原位，免得被大珍珠擋住卡住）
  wanderRadius: 4, wanderSpeedMul: .6, idle: [1.5, 3.5],   // 閒晃：繞著原位幾格內、速度倍率、每次發呆幾秒
  keepDistance: 4,               // 目標太近（格）：往後飄
  body: { x: .4, y: .16 },       // 身體在地上佔的橢圓（左右、上下半徑，是圖寬的幾倍）：碰到牆就停、被推也不會擠進牆裡
  coreShare: .1,                 // 打在大童身上的傷害，核心跟著吃幾成
  coreHp: 1000,                  // 牠抱著的核心血量（地圖難度 1；難度越高照比例加）
  coreArt: { x: .40, y: .70, len: .5, angle: -73 },   // 核心圖疊在牠身上的位置：中心（圖寬、圖高的比例）、長度（圖寬的比例）、旋轉角度（度）
  scatter: { count: 7, spread: 70, speed: 220, range: 18, windup: .8, cooldown: 2.4 },   // 散射：顆數、扇形角度、速度、射程（格）、蓄力、冷卻（秒）
  shell: { time: 30, defense: .1, grace: 4 },          // 閉殼幾秒（只有被爆炸炸到、被大珍珠撞到才會提早打開）、閉殼時受到的傷害倍率、張開後幾秒內被打不會再閉殼
  stun: { time: 2.5, dmgMul: 1.3 },                   // 被大珍珠撞到：暈幾秒、暈眩中受到的傷害倍率
  rain: {                        // 閉殼時從天上降下的珍珠
    smallEvery: .35, bigEvery: 2.2,   // 每隔幾秒降一顆小的、一顆大的
    warn: 2.2, fall: .7,         // 陰影圈出現幾秒後砸下來；最後幾秒看得到珍珠掉下來
    smallR: 24, bigR: 38,        // 砸中的範圍（像素）
    smallDmg: 12, bigDmg: 25,    // 砸中溫特的傷害（隊員一樣，再扣防禦）
    smallMin: 1, smallMax: 15,   // 小珍珠隨機落在大童身邊幾格～幾格（不瞄準我方，整個房間到處掉）
    bigMin: 3, bigMax: 10,        // 大珍珠落在大童身邊幾格～幾格（太近一落地就貼著大童）
  },
  big: {                         // 留在場上的大珍珠
    r: 34, max: 10, hp: 8,        // 半徑（像素）、最多幾顆、被珍珠打幾下會碎
    pushSpeed: 110,              // 溫特頂著推的速度（像素／秒）
    shotPush: 150, maxSpeed: 380,// 手槍打一下加多少速度、最快多快
    friction: 1.4, bounce: .45,  // 滾動減速（越大停越快）、撞牆反彈保留幾成速度
    hitSpeed: 40,                // 滾多快以上撞到其他怪物才有傷害
    ramSpeed: 140,               // 滾多快以上撞到大童才有傷害、撞開貝殼（溫特走路推是 pushSpeed，撞不痛；要開槍打）
    nudge: .8,                   // 滾得慢碰到大童：把牠推開（珍珠每走 1 像素，大童被推幾像素）
    bossDmg: .08,                // 撞到大童：最快速度時扣牠最大血量的幾成（最慢一半）
    monsterDmg: 60,              // 撞到其他怪物的傷害（最快速度時）
  },
  roll: {                        // 閉殼時整顆殼滾過去撞人（撞到建築直接撞爛、撞到大珍珠撞碎）
    first: 2, every: 5,          // 閉殼後幾秒第一次滾、之後每隔幾秒滾一次
    range: 18,                   // 目標在幾格內才滾（整個大房間）
    windup: .9,                  // 蓄力幾秒（地上畫出滾動路線）
    speed: 300, len: 18,          // 滾多快（像素／秒）、最遠滾幾格
    hitR: 46,                    // 離殼中心幾像素算撞到
    dmg: 22,                     // 撞到溫特的傷害（隊員一樣，再扣防禦）
    knock: 1.6, knockTime: .3,   // 撞飛幾格、幾秒
    bounces: [2, 3],             // 撞到牆反彈幾次（隨機挑一個），反彈完再撞到牆才停
    bounceLen: 1,                // 每次反彈後再滾多遠（len 的幾倍）
    wallStun: 1.5,               // 反彈完撞到牆：殼被撞開、暈幾秒（0＝不暈，停下來繼續閉著）
  },
  beads: {                       // 小珍珠砸下來散在地上的小滾珠：踩到會滑倒，滑行中撞到東西會頭暈（跟金蕉王的香蕉皮同一套，js/golden-banana-king.js）
    chance: .6, per: 2,          // 小珍珠砸下來有幾成機率散出滾珠、一次幾顆
    spread: 18, r: 4,            // 散多開（像素）、滾珠大小（半徑，比落下的小珍珠還小）
    life: 14, max: 24,           // 留幾秒、場上最多幾顆
    trigger: 14,                 // 離滾珠幾像素算踩到
    safe: 2,                     // 滑倒（含頭暈）結束後幾秒內不會再被滾珠滑倒（避免被卡在牆邊連續滑倒）
  },
  land: { shakeMax: 10, shakeMin: 3, shakeRange: 12 },   // 大珍珠落地的畫面震動：就在旁邊、shakeRange 格外圍的強度（上限 16）
};

const pearlElderSpot = () => typeof MAP !== 'undefined' && MAP ? PEARL_ELDER.maps[MAP.id] || null : null;
const pearlBosses = () => (G && G.enemies ? G.enemies.filter(e => e.pearlBoss && !e.dead && e.hp > 0) : []);
const peDist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

// ---- 開場：生在地圖指定的格子，抱著地圖上的核心（game.js 在 seedCores 之後呼叫）----
function seedPearlElder() {
  G.bigPearls = []; G.pearlFalls = []; G.pearlBeads = [];
  const spot = pearlElderSpot();
  if (!spot || MAP_SAFE || (typeof practiceOn === 'function' && practiceOn())) return;
  const base = ACTIVE_MONSTERS.find(m => m.id === 'pearl_kid');
  if (!base || !inGrid(spot.c, spot.r) || isWall(spot.c, spot.r)) return;
  const [x, y] = center(spot.c, spot.r);
  // 核心：大童自己帶一顆（地圖上原本的核心照樣留在原位，要另外打破）
  const difficulty = Math.max(1, Math.min(5, Number(MAP.difficulty) || 1)), hp = CORE.hp * difficulty;
  const core = { x, y, hp, maxhp: hp, lastHp: hp, dead: false, awake: false, phase: 0, awakeT: 0,
    timer: 2 + Math.random() * 2.4, reward: CORE.reward * difficulty, moteT: 0, hitT: 0, seed: Math.random() * 10 };
  G.cores.push(core);
  const P = PEARL_ELDER, S = P.scatter, e = createMonster(base, x, y);
  e.pearlBoss = true; e.eliteName = P.name;
  e.hp = e.maxhp = Math.round(e.maxhp / base.hp * P.hp);   // createMonster 給的是珍珠小童血量 × 整體難度：換成大童的血量，難度照樣乘
  e.playerDamage = Math.round(e.playerDamage * P.dmgMul);
  e.sentryDamage = Math.round(e.sentryDamage * P.dmgMul);
  e.buildingDamage = Math.round(e.buildingDamage * P.dmgMul);
  e.reward = Math.round(e.reward * P.rewardMul); e.crystals = Math.round((e.crystals ?? 4) * P.crystalMul);
  e.drawWidth = Math.round(base.width * P.scale); e.drawHeight = Math.round(base.height * P.scale);
  e.speed = base.speed * P.speedMul;
  e.knockMul = 0; e.staggerTime = 0; e.unpushable = true; e.noHitSquash = true;   // 推不動、不硬直
  // 散射走珍珠小童的噴珍珠（js/pearl-kid.js 的 firePearls）：顆數、角度、速度、射程換成大童的
  e.shooterCfg = { ...validShooterCfg(base.shooter), pearlCount: S.count, pearlSpread: S.spread, pearlSpeed: S.speed, shootRange: S.range, windup: S.windup, cooldown: S.cooldown, hover: P.hover };
  e.home = { x, y };
  e.carryCore = core; core.carried = true; core.x = x; core.y = y;
  core.hp = core.maxhp = core.lastHp = Math.round(P.coreHp * core.maxhp / CORE.hp);   // 照地圖難度的比例（seedCores 給的是 CORE.hp × 難度）   // carried：核心打不到、阿瓦倫靠近也不會醒（js/game.js、js/anomalous-core.js）
  e.deathSound = 'pearlElderDeath';   // 珍珠小童的死亡聲，放大、加回音（js/sfx.js 的 SOUND_ECHO）
  e.pk = { state: 'idle', t: 0, cd: 1, windup: 0, shellT: 0, bob: 0, wait: 1, grace: 0, lostT: 0, vz: 0 };
  e.slimeLift = P.hover;
  if (typeof GOURD !== 'undefined') monsterImage(GOURD.crackImage);   // 先載好地裂圖，第一顆大珍珠落地才不會沒有裂痕
  G.enemies.push(e);
}

function pearlBossSet(e, state, t = 0) {
  const pk = e.pk;
  pk.state = state; pk.t = t; pk.windup = 0; pk.roll = null;
  pk.shellT = state === 'shell' ? 999 : 0;   // shellT > 0：畫閉起來的貝殼（js/pearl-kid.js 的 shooterFrame）
  if (state === 'shell' || state === 'stunned') { pk.vz = 0; pk.landed = false; }
  resetEnemyNavigation(e);
}

// ---- 觸發 BOSS 戰 ----
function pearlBossWake(e) {
  e.eliteAwake = true;
  pearlBossSet(e, 'wake', 1);
  e.alertT = ENEMY_ALERT_TIME; e.pk.cd = 1.2;
  const core = e.carryCore;   // 牠抱著的核心跟著甦醒：異質體狂暴化、核心音樂（還是打不到：carried 的核心不會被選成目標、扣的血會補回來，見 js/anomalous-core.js）
  if (core && !core.dead && !core.awake) { wakeCore(core); core.lastHp = core.hp; pearlBossCorePool(core, false); }
  if (typeof coreBanner === 'function') coreBanner(PEARL_ELDER.name + '發現你了', '', '#f4d9ff');   // 不寫提示：怎麼打讓玩家自己探索
  systemNotice(PEARL_ELDER.name + '發現你了！', true);
  const top = e.y - e.slimeLift - e.drawHeight * .6;
  for (let i = 0; i < 3; i++) G.effects.push({ ring: true, x: e.x, y: top, r: 8 + i * 6, r2: 100 + i * 36, life: .45 + i * .15, life0: .45 + i * .15, color: i ? '#f1dcff' : '#ffffff' });
  nearbyImpact(e.x, e.y, 7, .05);
  if (typeof sfxAt === 'function') sfxAt('pearlHurt', e.x, e.y, 1.8, 'pearl-elder-wake');
}
// ---- 閉殼：掉到地上、開始降珍珠 ----
function pearlBossClose(e) {
  pearlBossSet(e, 'shell', PEARL_ELDER.shell.time);
  e.pk.rainSmall = .3; e.pk.rainBig = .7; e.pk.rollCd = PEARL_ELDER.roll.first;
  G.effects.push({ ring: true, x: e.x, y: e.y - e.slimeLift - e.drawHeight * .4, r: 6, r2: 60, life: .25, life0: .25, color: '#f4eef8' });
  flash('閉殼！', e.x, e.y - e.slimeLift - e.drawHeight - 6, '#f4e6ff');
  if (typeof sfxAt === 'function') sfxAt('knock2', e.x, e.y, .9, 'pearl-elder-close');
}
// ---- 被滾動的大珍珠撞到：大傷害、強制張開、暈眩（ramSpeed 以上才會呼叫）----
function pearlBossRammed(e, bp, speed) {
  const P = PEARL_ELDER, B = P.big, k = Math.max(0, Math.min(1, (speed - B.ramSpeed) / (B.maxSpeed - B.ramSpeed)));
  const dmg = Math.round(e.maxhp * P.big.bossDmg * (.5 + .5 * k));
  if (!e.eliteAwake) pearlBossWake(e);
  pearlBossSet(e, 'stunned', P.stun.time);
  e.hp -= dmg; pearlBossCoreShare(e, dmg); e.peHp = e.hp;   // 已經算好了：不再套閉殼減傷
  e.hitT = .2; e.hitColor = '#ffffff';
  flashCrit('-' + dmg, e.x, e.y - e.drawHeight * .6, true);
  flash('撞開貝殼！', e.x, e.y - e.drawHeight - 10, '#fff2b0');
  nearbyImpact(e.x, e.y, 10, .08);
  if (typeof sfxAt === 'function') { sfxAt('knock2', e.x, e.y, 1.3, 'pearl-elder-ram'); sfxAt('pearlHurt', e.x, e.y, 1.4, 'pearl-elder-ram2'); }
  shatterBigPearl(bp);
}
// ---- 被爆炸炸到：閉著的貝殼被炸開（油桶、地雷、自爆史萊姆、希奧妮大招…呼叫 blastWalls 的地方一起呼叫）----
// 爆炸的傷害在這之前已經扣了；這一幀結算時貝殼已經打開，所以不套閉殼減傷
function pearlBossBlast(x, y, R) {
  for (const e of pearlBosses()) {
    if (!e.pk || e.pk.state !== 'shell' || Math.hypot(e.x - x, e.y - y) > R + e.drawWidth * .3) continue;
    pearlBossSet(e, 'open'); e.pk.grace = PEARL_ELDER.shell.grace; e.pk.cd = Math.min(e.pk.cd, .6);
    flash('炸開貝殼！', e.x, e.y - e.drawHeight - 10, '#fff2b0');
    if (typeof sfxAt === 'function') sfxAt('pearlHurt', e.x, e.y, 1.4, 'pearl-elder-blast');
  }
}
// 核心腳下的腐蝕痕跡：抱在身上時收掉（不然會留在甦醒的地方），掉到地上時在落點重新鋪上（js/anomalous-core.js 的 wakeCore 做的那一攤）
function pearlBossCorePool(core, on) {
  if (!core.pool) return;
  G.acidPools = (G.acidPools || []).filter(p => p !== core.pool);
  if (core.scorch) { G.scorchMarks = (G.scorchMarks || []).filter(s => s !== core.scorch); core.scorch = null; }
  if (!on) return;
  core.pool.x = core.x; core.pool.y = core.y + 8; core.pool.t = 999;
  G.acidPools.push(core.pool);
  keepCoreScorch(core);
}
// 打在大童身上的傷害，核心跟著吃 coreShare；核心在牠身上時不會破掉（最少 1 滴血）
function pearlBossCoreShare(e, lost) {
  const core = e.carryCore;
  if (!core || core.dead || !core.carried || lost <= 0) return;
  core.hp = Math.max(1, core.hp - lost * PEARL_ELDER.coreShare);
  core.lastHp = core.hp; core.hitT = .16;   // lastHp 一起改：沉睡的核心不會把血補回去（js/anomalous-core.js 的 updateCores）
}

// ---- 受傷：每幀檢查這幀少了多少血（js/pearl-kid.js 的 pearlShellArmor 呼叫，在結算死亡前）----
function pearlBossArmor(e) {
  if (e.peHp == null || e.hp > e.peHp) { e.peHp = e.hp; return; }
  let lost = e.peHp - e.hp;
  if (lost <= 0) return;
  const P = PEARL_ELDER, pk = e.pk;
  if (pk.state === 'shell') {
    lost *= P.shell.defense;
  } else if (pk.state === 'stunned') lost *= P.stun.dmgMul;
  e.hp = e.peHp - lost;
  pearlBossCoreShare(e, lost);
  if (!e.eliteAwake) pearlBossWake(e);
  else if ((pk.state === 'open' || pk.state === 'return') && pk.grace <= 0) pearlBossClose(e);
  e.peHp = e.hp;
}

// ---- 選目標：溫特優先（夠近、看得到）；不在就找看得到的最近隊員 ----
function pearlBossTarget(e) {
  const P = PEARL_ELDER, p = G.player, R = P.loseRange * CELL;
  if (p && p.hp > 0 && peDist(p, e) <= R && hasLineOfSight(e.x, e.y, p.x, p.y)) return p;
  let best = null, bestD = R;
  for (const t of G.towers) {
    if (t.hp <= 0 || t.berserk || !enemyNoticesSentry(e, t)) continue;
    const d = peDist(t, e);
    if (d <= bestD && hasLineOfSight(e.x, e.y, t.x, t.y)) { best = t; bestD = d; }
  }
  return best;
}
function pearlBossWander(e, dt) {
  const P = PEARL_ELDER, pk = e.pk;
  if (pk.spot) {
    const moved = moveEnemyToward(e, pk.spot, dt * P.wanderSpeedMul);
    if (!moved || peDist(pk.spot, e) <= 3) { pk.spot = null; pk.wait = P.idle[0] + Math.random() * (P.idle[1] - P.idle[0]); }
    return;
  }
  pk.wait -= dt;
  if (pk.wait > 0) return;
  pk.wait = P.idle[0] + Math.random() * (P.idle[1] - P.idle[0]);
  for (let i = 0; i < 8; i++) {
    const a = Math.random() * Math.PI * 2, d = (.5 + Math.random() * (P.wanderRadius - .5)) * CELL;
    const x = e.home.x + Math.cos(a) * d, y = e.home.y + Math.sin(a) * d;
    if (!enemyBlocked(x, y) && !pearlBossBodyHits(e, x, y) && hasLineOfSight(e.x, e.y, x, y)) { pk.spot = { x, y }; return; }
  }
}
function pearlBossGoHome(e, dt) {
  const [hc, hr] = cellAt(e.home.x, e.home.y);
  const nav = enemyNavigate(e, hc, hr, dt, 'pearl-elder-home', 'detour');
  if (nav.blocker) enemyAttackObstacle(e, nav.blocker, dt);
  return peDist(e, e.home) <= CELL;
}

// ---- 每幀（enemy-ai.js 的 stepEnemy 呼叫）----
// ---- 身體碰撞：大童很寬，只看腳底一點會看起來穿牆；用地上的橢圓檢查牆 ----
// 回傳碰到牆的那些方向加總（指向牆），沒碰到回傳 null
function pearlBossBodyHits(e, x, y) {
  const B = PEARL_ELDER.body, rx = e.drawWidth * B.x, ry = e.drawWidth * B.y;
  let hx = 0, hy = 0, n = 0;
  for (let i = 0; i < 16; i++) {
    const a = i * Math.PI / 8, px = x + Math.cos(a) * rx, py = y + Math.sin(a) * ry, [c, r] = cellAt(px, py);
    if (!inGrid(c, r) || isWall(c, r) || solidBlocksPoint(px, py)) { hx += Math.cos(a); hy += Math.sin(a); n++; }
  }
  return n ? { x: hx, y: hy, n } : null;
}
// 身體擠進牆裡（被推、被撞、飄過去）：往牆的反方向推出來
function pearlBossKeepOut(e) {
  for (let k = 0; k < 24; k++) {
    const h = pearlBossBodyHits(e, e.x, e.y);
    if (!h) return;
    const d = Math.hypot(h.x, h.y);
    if (d < .01) return;   // 兩邊都碰到（太窄）：不硬推
    const nx = e.x - h.x / d * 3, ny = e.y - h.y / d * 3, [c, r] = cellAt(nx, ny);
    if (!inGrid(c, r) || isWall(c, r)) return;
    e.x = nx; e.y = ny;
  }
}
function stepPearlBoss(e, dt) {
  stepPearlBossState(e, dt);
  if (!e.dead) pearlBossKeepOut(e);
}
function stepPearlBossState(e, dt) {
  const P = PEARL_ELDER, pk = e.pk;
  pk.bob += dt; pk.t -= dt;
  if (pk.grace > 0) pk.grace -= dt;
  const core = e.carryCore;
  if (core && core.carried && !core.dead) { core.x = e.x; core.y = e.y; }   // 核心抱在身上，跟著走
  // 高度：閉殼、暈眩時掉到地上；其他時候飄在空中上下輕晃
  if (pk.state === 'shell' || pk.state === 'stunned') {
    pk.vz -= 520 * dt;
    e.slimeLift = Math.max(0, (e.slimeLift || 0) + pk.vz * dt);
    if (e.slimeLift <= 0 && !pk.landed) {   // 落地：揚起一圈灰塵、震一下
      pk.landed = true; pk.vz = 0;
      G.effects.push({ ring: true, x: e.x, y: e.y + 12, r: 10, r2: 70, life: .3, life0: .3, color: '#d8d0c0' });
      nearbyImpact(e.x, e.y, 5, 0);
      if (typeof sfxAt === 'function') sfxAt('pearlHit', e.x, e.y, 1, 'pearl-elder-land');
    }
  } else {
    const want = e.stunT > 0 ? 6 : P.hover + Math.sin(pk.bob * 2.1) * 4;
    e.slimeLift = (e.slimeLift || 0) + (want - (e.slimeLift || 0)) * Math.min(1, dt * 3);
  }
  switch (pk.state) {
    case 'idle': {
      const p = G.player;
      if (p && p.hp > 0 && peDist(p, e) <= P.wakeRange * CELL && hasLineOfSight(e.x, e.y, p.x, p.y)) { pearlBossWake(e); return; }
      if (peDist(e, e.home) > P.wanderRadius * CELL + CELL) { pk.spot = null; pearlBossGoHome(e, dt * P.wanderSpeedMul); return; }   // 被推遠了：先飄回原位附近
      pearlBossWander(e, dt);
      return;
    }
    case 'wake': if (pk.t <= 0) pearlBossSet(e, 'open'); return;
    case 'shell': pearlBossRain(e, dt); pearlBossRoll(e, dt); if (pk.state !== 'shell') return; if (pk.t <= 0) { pearlBossSet(e, 'open'); pk.grace = P.shell.grace; pk.cd = Math.min(pk.cd, .6); } return;
    case 'stunned': if (pk.t <= 0) { pearlBossSet(e, 'open'); pk.grace = P.shell.grace * .5; } return;
    case 'return':
      pearlBossGoHome(e, dt * 1.3);
      if (pk.t <= 0 || peDist(e, e.home) <= P.returnTo * CELL) pearlBossSet(e, 'open');
      return;
    case 'open': pearlBossOpen(e, dt); return;
    default: pearlBossSet(e, 'open');
  }
}
function pearlBossOpen(e, dt) {
  const P = PEARL_ELDER, S = P.scatter, pk = e.pk;
  if (e.stunT > 0) { pk.windup = 0; return; }   // 被暈住（路德大招、安柏雷電…）：不攻擊
  if (pk.windup > 0) {   // 蓄力中：站定，時間到就散射（手上的閃光由 js/pearl-kid.js 的 drawPearls 畫）
    pk.windup -= dt;
    if (pk.windup <= 0) {
      const t = pk.target;
      if (t && t.hp > 0 && hasLineOfSight(e.x, e.y, t.x, t.y)) firePearls(e, t);
      pk.cd = S.cooldown;
    }
    return;
  }
  pk.cd -= dt;
  const target = pearlBossTarget(e);
  pk.target = target;
  if (!target) {   // 沒有目標：太久就放棄，回去閒晃
    pk.lostT += dt;
    if (pk.lostT > P.loseTime) { e.eliteAwake = false; pearlBossSet(e, 'idle'); pk.lostT = 0; return; }
    pearlBossGoHome(e, dt * P.wanderSpeedMul);
    return;
  }
  pk.lostT = 0;
  const fromHome = peDist(e, e.home);
  if (fromHome > P.returnAt * CELL) { pearlBossSet(e, 'return', P.returnMax); return; }
  const d = peDist(target, e);
  if (d <= S.range * CELL) {
    if (d < P.keepDistance * CELL) enemyBackOff(e, target, dt, .8);   // 太近：往後飄
    if (pk.cd <= 0) pk.windup = S.windup;
    return;
  }
  if (fromHome >= P.leash * CELL && peDist(target, e.home) > fromHome) return;   // 追到範圍邊緣：停在這裡等，不再往外追
  const [gc, gr] = cellAt(target.x, target.y);
  const nav = enemyNavigate(e, gc, gr, dt, 'pearl-elder:' + gc + ',' + gr, 'detour');
  if (nav.blocker) enemyAttackObstacle(e, nav.blocker, dt);
}

// ---- 閉殼時降珍珠 ----
function pearlBossRain(e, dt) {
  const R = PEARL_ELDER.rain, pk = e.pk;
  pk.rainSmall -= dt; pk.rainBig -= dt;
  if (pk.rainSmall <= 0) {
    pk.rainSmall += R.smallEvery;
    const spot = pearlFallSpot(e, R.smallMin, R.smallMax, false);   // 隨機落點：不瞄準溫特和隊員
    if (spot) pushPearlFall(spot.x, spot.y, false);
  }
  if (pk.rainBig <= 0) {
    pk.rainBig += R.bigEvery;
    const spot = pearlFallSpot(e, R.bigMin, R.bigMax, true);
    if (spot) pushPearlFall(spot.x, spot.y, true);
  }
}
// ---- 閉殼滾動：蓄力 → 沿直線滾過去，撞飛溫特和隊員、撞爛建築、撞碎大珍珠；撞到牆停下來 ----
function pearlBossRoll(e, dt) {
  const R = PEARL_ELDER.roll, pk = e.pk;
  if (!pk.landed) return;   // 還在往下掉
  const rl = pk.roll;
  if (!rl) {
    pk.rollCd -= dt;
    if (pk.rollCd > 0) return;
    const t = pearlBossTarget(e);
    if (!t || peDist(t, e) > R.range * CELL) { pk.rollCd = .5; return; }
    const dx = t.x - e.x, dy = t.y - e.y, d = Math.hypot(dx, dy) || 1, dir = { x: dx / d, y: dy / d };
    pk.roll = { phase: 'aim', t: R.windup, dir, left: R.len * CELL, hit: new Set(), bounces: R.bounces[0] + Math.floor(Math.random() * (R.bounces[1] - R.bounces[0] + 1)) };
    pk.roll.show = pearlRollWallDistance(e, dir, pk.roll.left);
    if (typeof sfxAt === 'function') sfxAt('gourdDrag', e.x, e.y, .9, 'pearl-elder-roll-aim');
    return;
  }
  if (rl.phase === 'aim') {
    rl.t -= dt;
    if (rl.t > 0) return;
    rl.phase = 'roll';
    G.effects.push({ ring: true, x: e.x, y: e.y + 10, r: 6, r2: 40, life: .25, life0: .25, color: '#d9d2c0' });
    addShake(3);
    return;
  }
  let move = Math.min(rl.left, R.speed * dt);
  rl.left -= move;
  while (move > 0) {
    const s = Math.min(4, move); move -= s;
    const nx = e.x + rl.dir.x * s, ny = e.y + rl.dir.y * s, [c, r] = cellAt(nx, ny);
    const wall = pearlRollWallAhead(e, nx, ny, rl.dir);
    if (wall) {
      if (rl.bounces <= 0) { pearlBossRollBump(e); return; }
      pearlBossRollBounce(e, rl, wall); move = 0; break;   // 反彈：換方向，下一幀繼續滾
    }
    const blocker = enemyBarrierAt(c, r);
    if (blocker) pearlBossSmash(e, blocker, rl.dir);   // 建築：直接撞爛，繼續滾
    e.x = nx; e.y = ny;
    for (const bp of [...(G.bigPearls || [])]) if (Math.hypot(bp.x - e.x, bp.y - e.y) < bp.r + e.drawWidth * .3) shatterBigPearl(bp);
    pearlBossRollHits(e, rl);
  }
  if (Math.random() < .5) G.effects.push({ particle: true, kind: 'spark', x: e.x + (Math.random() * 2 - 1) * 20, y: e.y + 12,
    vx: -rl.dir.x * 60 + (Math.random() * 2 - 1) * 30, vy: -rl.dir.y * 60 - 10, r: 2 + Math.random() * 2.5, life: .3, life0: .3, color: '#b9b2a2' });   // 滾過地面揚起的灰
  if (rl.left <= 0) { pk.roll = null; pk.rollCd = R.every; }
}
// 滾到 (x, y) 會不會撞牆：腳底那格是牆，或身體往前那一側碰到牆（往後、旁邊碰到不算，才離得開牆）；回傳牆的方向（指向牆）或 null
function pearlRollWallAhead(e, x, y, dir) {
  const [c, r] = cellAt(x, y);
  if (!inGrid(c, r) || isWall(c, r) || solidBlocksPoint(x, y)) return { x: dir.x, y: dir.y };
  const h = pearlBossBodyHits(e, x, y);
  return h && h.x * dir.x + h.y * dir.y > 0 ? h : null;
}
// 撞牆反彈：方向對著牆面鏡射，再滾 bounceLen 倍的距離；這段滾動可以再撞到同一個人
function pearlBossRollBounce(e, rl, wall) {
  const R = PEARL_ELDER.roll, d = Math.hypot(wall.x, wall.y) || 1, nx = wall.x / d, ny = wall.y / d;
  const dot = rl.dir.x * nx + rl.dir.y * ny;
  let vx = rl.dir.x - 2 * dot * nx, vy = rl.dir.y - 2 * dot * ny;
  const len = Math.hypot(vx, vy) || 1;
  rl.dir = { x: vx / len, y: vy / len };
  rl.bounces--; rl.left = R.len * CELL * R.bounceLen; rl.hit.clear();
  G.effects.push({ ring: true, x: e.x + nx * 40, y: e.y + ny * 20, r: 6, r2: 46, life: .25, life0: .25, color: '#c9c2b0' });
  nearbyImpact(e.x, e.y, 6, .04);
  if (typeof sfxAt === 'function') sfxAt('gourdSlam', e.x, e.y, .7, 'pearl-elder-roll-bounce');
}
// 蓄力時畫的路線：沿著方向往前找第一道牆（建築不算，會被撞爛）；回傳距離（像素），最多 maxLen
function pearlRollWallDistance(e, dir, maxLen) {
  for (let d = 8; d < maxLen; d += 8) if (pearlRollWallAhead(e, e.x + dir.x * d, e.y + dir.y * d, dir)) return d;
  return maxLen;
}
function pearlBossRollHits(e, rl) {
  const R = PEARL_ELDER.roll, p = G.player, dir = rl.dir;
  if (p && p.hp > 0 && !rl.hit.has(p) && peDist(p, e) <= R.hitR) {
    rl.hit.add(p);
    pearlFallHitPlayer(p, R.dmg);
    knockActor(p, dir.x, dir.y, R.knock * CELL, R.knockTime);
    if (typeof sfxAt === 'function') sfxAt('knock2', p.x, p.y, 1, 'pearl-elder-roll-hit');
  }
  for (const t of G.towers) {
    if (t.hp <= 0 || t.berserk || rl.hit.has(t) || peDist(t, e) > R.hitR) continue;
    rl.hit.add(t);
    pearlFallHitSentry(t, R.dmg);
    knockActor(t, dir.x, dir.y, R.knock * CELL, R.knockTime);
    t.navPath = null; t.navGoal = null;
  }
}
// 滾到牆：停下來；wallStun > 0 時殼被撞開、頭暈（輸出時間）
function pearlBossRollBump(e) {
  const R = PEARL_ELDER.roll, pk = e.pk;
  pk.roll = null; pk.rollCd = R.every;
  G.effects.push({ ring: true, x: e.x, y: e.y + 6, r: 6, r2: 50, life: .3, life0: .3, color: '#c9c2b0' });
  nearbyImpact(e.x, e.y, 7, .06);
  if (typeof sfxAt === 'function') sfxAt('gourdSlam', e.x, e.y, .9, 'pearl-elder-roll-bump');
  if (R.wallStun > 0) pearlBossSet(e, 'stunned', R.wallStun);
}
// 撞上建築：不管是什麼、血量多少，直接撞爛（跟鳥頭大隊長的衝撞一樣，js/elite-bird-head.js 的 eliteBirdSmash）
function pearlBossSmash(e, o, dir) {
  const ox = OX + (o.c + (o.w || 1) / 2) * CELL, oy = OY + (o.r + (o.h || 1) / 2) * CELL;
  o.lastHitBy = 'monster'; o.hp = 0; o.hitT = HIT_DUR;   // lastHitBy：油桶被怪物撞壞只漏油、不爆炸（js/oil-barrels.js）
  removeBarrier(o);
  if (o.isBase) { flash('基地被摧毀！', ox, OY + o.r * CELL - 18, '#ff5b5b'); if (!G.over) baseLost(); }
  G.effects.push({ ring: true, x: ox, y: oy, r: 6, r2: 44, life: .3, life0: .3, color: '#d9d2c0' });
  for (let i = 0; i < 8; i++) {   // 碎片往滾動方向噴
    const a = Math.atan2(dir.y, dir.x) + (Math.random() * 2 - 1) * .9, sp = 120 + Math.random() * 140;
    G.effects.push({ particle: true, kind: 'spark', x: ox, y: oy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 30, r: 2 + Math.random() * 3, life: .4, life0: .4, color: '#9a9283' });
  }
  addShake(4); addHitstop(.05);
  if (typeof sfxAt === 'function') sfxAt('knock2', ox, oy, 1, 'pearl-elder-smash');
}

// ---- 地上的小滾珠：踩到滑倒（滑倒、撞到頭暈都用金蕉王香蕉皮那一套：js/golden-banana-king.js 的 bkSlip）----
function pearlBeadsDrop(x, y) {
  const B = PEARL_ELDER.beads;
  if (typeof bkSlip !== 'function' || Math.random() >= B.chance) return;
  const list = G.pearlBeads = G.pearlBeads || [];
  for (let i = 0; i < B.per; i++) {
    const a = Math.random() * Math.PI * 2, d = Math.random() * B.spread, bx = x + Math.cos(a) * d, by = y + Math.sin(a) * d * .6, [c, r] = cellAt(bx, by);
    if (!inGrid(c, r) || isWall(c, r)) continue;
    list.push({ x: bx, y: by, life: B.life, seed: Math.random() * 9 });
  }
  while (list.length > B.max) list.shift();   // 太多了：最舊的先消失
}
function updatePearlBeads(dt) {
  const B = PEARL_ELDER.beads, list = G.pearlBeads;
  if (!list || !list.length) return;
  const actors = typeof bkPeelVictims === 'function' ? bkPeelVictims() : [];
  for (const a of actors) if (a.beadSafeT > 0) a.beadSafeT -= dt;
  for (const b of [...list]) {
    b.life -= dt;
    if (b.life <= 0) { list.splice(list.indexOf(b), 1); continue; }
    const a = actors.find(o => !(o.knockT > 0) && !(o.slipDizzyT > 0) && !(o.beadSafeT > 0) && Math.hypot(o.x - b.x, o.y - b.y) <= B.trigger);
    if (!a) continue;
    list.splice(list.indexOf(b), 1);   // 踩過就滾走了
    bkSlip(a, b);
    a.beadSafeT = BANANA_KING.slipTime + BANANA_KING.slipDizzy + B.safe;   // 滑完、暈完再過 safe 秒才會再滑倒
  }
}

// 在 o 身邊 min～max 格內找一個能落下的地方；big＝大珍珠，要找空曠一點、不壓到其他大珍珠
function pearlFallSpot(o, min, max, big) {
  const r = PEARL_ELDER.big.r;
  for (let i = 0; i < 14; i++) {
    const a = Math.random() * Math.PI * 2, d = (min + Math.random() * (max - min)) * CELL;
    const x = o.x + Math.cos(a) * d, y = o.y + Math.sin(a) * d;
    if (enemyBlocked(x, y) || !hasLineOfSight(o.x, o.y, x, y)) continue;
    if (big && (bigPearlWallHit(x, y, r) || pearlBosses().some(e => Math.hypot(e.x - x, e.y - y) < r + e.drawWidth * .3 + 10) || (G.bigPearls || []).some(b => Math.hypot(b.x - x, b.y - y) < b.r + r + 6)
      || (G.pearlFalls || []).some(f => f.big && Math.hypot(f.x - x, f.y - y) < r * 2 + 6))) continue;
    return { x, y };
  }
  return null;
}
function pushPearlFall(x, y, big) {
  const R = PEARL_ELDER.rain;
  (G.pearlFalls = G.pearlFalls || []).push({ x, y, big, t: R.warn, t0: R.warn, spin: Math.random() * 6 });
}
function pearlFallImpact(f) {
  const R = PEARL_ELDER.rain, rad = f.big ? R.bigR : R.smallR, dmg = f.big ? R.bigDmg : R.smallDmg;
  const p = G.player;
  if (p && p.hp > 0 && Math.hypot(p.x - f.x, p.y - f.y) <= rad + PLAYER.r * .5) pearlFallHitPlayer(p, dmg);
  for (const t of G.towers) if (t.hp > 0 && !t.berserk && Math.hypot(t.x - f.x, t.y - f.y) <= rad + 8) pearlFallHitSentry(t, dmg);
  G.effects.push({ ring: true, x: f.x, y: f.y, r: 4, r2: rad + 10, life: .25, life0: .25, color: '#f4eef8' });
  if (f.big) {
    const bp = { x: f.x, y: f.y, r: PEARL_ELDER.big.r, vx: 0, vy: 0, hp: PEARL_ELDER.big.hp, spin: 0, hitT: 0, hits: new Set(), seed: Math.random() * 100 };
    G.bigPearls = G.bigPearls || [];
    if (G.bigPearls.length >= PEARL_ELDER.big.max) shatterBigPearl(G.bigPearls[0]);   // 太多了：最舊的那顆碎掉
    G.bigPearls.push(bp);
    bigPearlLandFx(f.x, f.y);
  } else {
    pearlBurst(f.x, f.y, 4);
    pearlBeadsDrop(f.x, f.y);
    if (typeof sfxAt === 'function') sfxAt('pearlHit', f.x, f.y, .7, 'pearl-small-land');
  }
}
// 大珍珠落地：畫面震動（越近越大）、砸出地裂、撞擊白光、石礫和煙霧（js/gourd-monkey.js 的葫蘆猴落地特效）
function bigPearlLandFx(x, y) {
  const L = PEARL_ELDER.land, gy = y + PEARL_ELDER.big.r * .3;
  if (typeof gourdImpactFx === 'function') gourdImpactFx(x, gy);
  if (typeof GOURD !== 'undefined') (G.gourdCracks = G.gourdCracks || []).push({ x, y: gy, life: GOURD.crackLife, life0: GOURD.crackLife, seed: Math.random() * 9, flip: Math.random() < .5 });
  G.effects.push({ ring: true, x, y: gy, r: 10, r2: PEARL_ELDER.rain.bigR + 26, life: .38, life0: .38, color: '#b49a6c' });
  const p = G.player, pd = p ? Math.hypot(p.x - x, p.y - y) : Infinity, near = Math.max(0, 1 - pd / (L.shakeRange * CELL));
  if (near > 0) addShake(L.shakeMin + (L.shakeMax - L.shakeMin) * near);
  if (pd <= PEARL_ELDER.rain.bigR + PLAYER.r) addHitstop(.05);
  if (typeof sfxAt === 'function') { sfxAt('gourdSlam', x, y, .9, 'pearl-big-land'); sfxAt('pearlHit', x, y, .8, 'pearl-big-land2'); }
}
function pearlFallHitPlayer(p, dmg) {
  if (typeof hurtGraceBlocked === 'function' && hurtGraceBlocked(p)) return;   // 剛被打過：短暫無敵（js/combat-feel.js）
  const d = Math.round(typeof equipPlayerDamage === 'function' ? equipPlayerDamage(dmg) : dmg);
  p.hp = Math.max(0, p.hp - d);
  p.hitT = .35; p.underAttackT = 5;
  G.damageVignetteT = .35;
  flashDmg('-' + d, p.x, p.y - 46, '#ff6b6b'); addShake(3);
  playPlayerHit(1, true);
  if (p.hp <= 0 && !G.over) { flash('部隊長失去戰鬥能力', p.x, p.y - 58, '#ff5b6e'); lose('player', '被' + PEARL_ELDER.name + '的珍珠砸中'); }
}
function pearlFallHitSentry(t, dmg) {
  if (parryMiss(t, false)) return;   // 柯林的劍舞架勢：打空
  if (typeof hurtGraceBlocked === 'function' && hurtGraceBlocked(t)) return;   // 剛被打過：短暫無敵（js/combat-feel.js）
  const d = dmg * (1 - sentryDefense(t));
  t.hp = Math.max(0, t.hp - d);
  t.hitT = Math.max(t.hitT || 0, .2);
  flash('-' + Math.round(d), t.x, t.y - 30, '#ff8f8f');
  if (t.hp <= 0) { t.target = null; sentryStatus(t, '失去戰鬥能力', '#ff5b6e', true); }
}

// ---- 大珍珠 ----
// 圓的邊上有沒有碰到牆或建築（地上的圓，半徑 r）
function bigPearlWallHit(x, y, r) {
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4, px = x + Math.cos(a) * r * .8, py = y + Math.sin(a) * r * .8;
    const [c, rr] = cellAt(px, py);
    if (!inGrid(c, rr) || solidBlocksPoint(px, py) || barrierAt(c, rr)) return true;
  }
  return false;
}
// 這個位置會不會撞到東西：牆、建築、溫特、隊員、其他大珍珠（回傳撞到的大珍珠，或 true／null）
function bigPearlBlockedAt(bp, x, y) {
  if (bigPearlWallHit(x, y, bp.r)) return true;
  const p = G.player;
  if (p && Math.hypot(p.x - x, p.y - y) < bp.r + PLAYER.r) return true;
  for (const t of G.towers) if (t.hp > 0 && Math.hypot(t.x - x, t.y - y) < bp.r + 12) return true;
  for (const o of G.bigPearls) if (o !== bp && Math.hypot(o.x - x, o.y - y) < o.r + bp.r) return o;
  return null;
}
function shatterBigPearl(bp) {
  if (!bp || bp.gone) return;
  bp.gone = true;
  G.bigPearls = (G.bigPearls || []).filter(b => b !== bp);
  G.effects.push({ ring: true, x: bp.x, y: bp.y - bp.r * .6, r: 6, r2: bp.r * 2.2, life: .3, life0: .3, color: '#ffffff' });
  for (let i = 0; i < 3; i++) pearlBurst(bp.x + (Math.random() * 2 - 1) * bp.r * .5, bp.y, bp.r * (.3 + Math.random() * .6), i % 2 ? '#f4e6ff' : '#ffffff');
  if (typeof sfxAt === 'function') sfxAt('pearlHit', bp.x, bp.y, 1.1, 'pearl-big-break');
}
function bigPearlSpeed(bp) { return Math.hypot(bp.vx, bp.vy); }
function capBigPearl(bp) {
  const s = bigPearlSpeed(bp), m = PEARL_ELDER.big.maxSpeed;
  if (s > m) { bp.vx *= m / s; bp.vy *= m / s; }
}
function stepBigPearl(bp, dt) {
  const B = PEARL_ELDER.big;
  if (bp.hitT > 0) bp.hitT -= dt;
  let speed = bigPearlSpeed(bp);
  if (speed <= 0) return;
  bp.vx *= Math.exp(-B.friction * dt); bp.vy *= Math.exp(-B.friction * dt);
  speed = bigPearlSpeed(bp);
  if (speed < 8) { bp.vx = bp.vy = 0; bp.hits.clear(); return; }
  bp.spin += speed * dt / bp.r * (bp.vx < 0 ? -1 : 1);
  let move = speed * dt;
  while (move > 0 && !bp.gone) {
    const s = Math.min(4, move); move -= s;
    const sp = bigPearlSpeed(bp); if (sp <= 0) break;
    const ux = bp.vx / sp, uy = bp.vy / sp;
    bp.step = s;
    const hx = bigPearlBlockedAt(bp, bp.x + ux * s, bp.y);
    if (!hx) bp.x += ux * s;
    else { if (hx !== true) bigPearlBump(bp, hx); bp.vx = -bp.vx * B.bounce; }
    const hy = bigPearlBlockedAt(bp, bp.x, bp.y + uy * s);
    if (!hy) bp.y += uy * s;
    else { if (hy !== true) bigPearlBump(bp, hy); bp.vy = -bp.vy * B.bounce; }
    if (hx || hy) { if (bigPearlSpeed(bp) > 60 && typeof sfxAt === 'function') sfxAt('pearlHit', bp.x, bp.y, .5, 'pearl-big-bump'); break; }
    bigPearlRamCheck(bp);
  }
}
// 大珍珠撞大珍珠：把速度傳過去（撞球）
function bigPearlBump(bp, other) {
  other.vx += bp.vx * .8; other.vy += bp.vy * .8; capBigPearl(other);
  bp.vx *= .2; bp.vy *= .2;
}
// 滾動中撞到怪物：大童 → 撞開貝殼；其他怪物 → 扣血、撞開（每次滾動每隻只撞一次）
function bigPearlRamCheck(bp) {
  const B = PEARL_ELDER.big, speed = bigPearlSpeed(bp);
  if (speed <= 0) return;
  for (const e of G.enemies) {
    if (e.dead || e.hp <= 0 || bp.hits.has(e)) continue;
    if (e.pearlBoss) {
      if (Math.hypot(e.x - bp.x, e.y - bp.y) >= bp.r + e.drawWidth * .3) continue;
      if (speed >= B.ramSpeed) { pearlBossRammed(e, bp, speed); return; }
      displaceEnemy(e, bp.vx, bp.vy, (bp.step || 4) * B.nudge, false);   // 滾得慢：只把大童推開，沒有傷害
      continue;
    }
    if (speed < B.hitSpeed || e.flying || Math.hypot(e.x - bp.x, e.y - bp.y) > bp.r + 16) continue;
    bp.hits.add(e);
    const dmg = Math.round(B.monsterDmg * Math.min(1, speed / B.maxSpeed));
    e.hp -= dmg; e.hitT = Math.max(e.hitT || 0, .14); e.hitColor = '#ffffff';
    enemyHitReact(e, bp.x, bp.y, true);
    flashDmg('-' + dmg, e.x, e.y - 26, '#f4e6ff');
    if (!e.unpushable) displaceEnemy(e, e.x - bp.x, e.y - bp.y, CELL * .6);
    bp.vx *= .6; bp.vy *= .6;
    if (typeof sfxAt === 'function') sfxAt('knock2', bp.x, bp.y, .7, 'pearl-big-ram');
  }
}
// 地上的怪物、隊員不能站進大珍珠裡：往外擠（飄在空中的怪物不管）
function bigPearlSeparate(bp) {
  for (const e of G.enemies) {
    if (e.dead || e.flying) continue;
    const d = Math.hypot(e.x - bp.x, e.y - bp.y), need = bp.r + 14;
    if (d < need) displaceEnemy(e, (e.x - bp.x) || 1, e.y - bp.y, need - d, false);
  }
  for (const t of G.towers) {
    if (t.hp <= 0 && !t.berserk) continue;
    const d = Math.hypot(t.x - bp.x, t.y - bp.y) || 1, need = bp.r + 12;
    if (d >= need) continue;
    const nx = t.x + (t.x - bp.x) / d * (need - d), ny = t.y + (t.y - bp.y) / d * (need - d), [c, r] = cellAt(nx, ny);
    if (inGrid(c, r) && !isWall(c, r)) { t.x = nx; t.y = ny; }
  }
}

// ---- 溫特：大珍珠擋路（game.js 的 playerBlocked 呼叫）----
function bigPearlBlocksPlayer(x, y) {
  for (const bp of G.bigPearls || []) if (Math.hypot(bp.x - x, bp.y - y) < bp.r + PLAYER.r - 1) return true;
  return false;
}
// 溫特走路頂到大珍珠：往前推（game.js 的 updatePlayer 在判斷碰撞前呼叫；ux、uy＝走路方向）。回傳 true＝正在推
function bigPearlPlayerPush(p, nx, ny, ux, uy) {
  const B = PEARL_ELDER.big;
  let pushing = false;
  for (const bp of G.bigPearls || []) {
    const dx = bp.x - nx, dy = bp.y - ny, d = Math.hypot(dx, dy) || 1;
    if (d >= bp.r + PLAYER.r + 1) continue;
    const n = { x: dx / d, y: dy / d }, dot = ux * n.x + uy * n.y;
    if (dot < .35) continue;   // 從旁邊擦過：不推
    pushing = true;
    const along = bp.vx * n.x + bp.vy * n.y;
    if (along < B.pushSpeed * dot) { bp.vx += (B.pushSpeed * dot - along) * n.x; bp.vy += (B.pushSpeed * dot - along) * n.y; }
  }
  return pushing;
}
// ---- 溫特開槍：大珍珠也能瞄準，打中就往子彈的方向推（game.js 的 updatePlayerAttack 呼叫）----
// 回傳 { x, y, bigPearlRef, d, onBody } 或 null；bestD、bestOnBody＝目前選到的怪物
const bigPearlBody = bp => ({ x: bp.x, y: bp.y - bp.r * .6 });   // 畫面上球心的位置（地上的圓往上抬）
function bigPearlShotTarget(p, aim, aimAng, bestD, bestOnBody) {
  let pick = null;
  for (const bp of G.bigPearls || []) {
    const d = Math.hypot(bp.x - p.x, bp.y - p.y) || 1;
    if (d > PLAYER_ATK.range * CELL) continue;
    const body = bigPearlBody(bp);
    if (!isLit(bp.x, bp.y) && !isLit(body.x, body.y) && d > CELL * 3) continue;
    const ex = bp.x - (bp.x - p.x) / d * (bp.r + 4), ey = bp.y - (bp.y - p.y) / d * (bp.r + 4);   // 看靠溫特這一側的邊（不然線會被這顆自己擋住）
    if (!hasLineOfSight(p.x, p.y, ex, ey)) continue;
    const onBody = Math.hypot(aim.x - body.x, aim.y - body.y) <= bp.r + 6;
    let da = Math.abs(Math.atan2(bp.y - p.y, bp.x - p.x) - aimAng); if (da > Math.PI) da = 2 * Math.PI - da;
    const better = onBody ? (!bestOnBody || d < bestD) : (!bestOnBody && da <= PLAYER_ATK.cone && d < bestD);
    if (!better) continue;
    pick = { x: body.x, y: body.y, bigPearlRef: bp, d, onBody };
    bestD = d; bestOnBody = onBody;
  }
  return pick;
}
function shootBigPearl(bp, fromX, fromY) {
  const dx = bp.x - fromX, dy = bp.y - fromY, d = Math.hypot(dx, dy) || 1;
  bp.vx += dx / d * PEARL_ELDER.big.shotPush; bp.vy += dy / d * PEARL_ELDER.big.shotPush;
  capBigPearl(bp);
  bp.hitT = .1; bp.hits.clear();
  if (typeof sfxAt === 'function') sfxAt('pearlHit', bp.x, bp.y, .6, 'pearl-big-shot');
}
// ---- 視線：大珍珠擋住兩邊的子彈和射線（js/maploader.js 的 hasLineOfSight 呼叫）----
// 起點或終點本身貼在這顆珍珠上（例如大童飄在珍珠上面）就不算這顆
function bigPearlBlocksLine(x0, y0, x1, y1) {
  const list = G && G.bigPearls;
  if (!list || !list.length) return false;
  const dx = x1 - x0, dy = y1 - y0, len2 = dx * dx + dy * dy || 1;
  for (const bp of list) {
    if (Math.hypot(x0 - bp.x, y0 - bp.y) < bp.r + 4 || Math.hypot(x1 - bp.x, y1 - bp.y) < bp.r + 4) continue;
    const k = Math.max(0, Math.min(1, ((bp.x - x0) * dx + (bp.y - y0) * dy) / len2));
    if (Math.hypot(x0 + dx * k - bp.x, y0 + dy * k - bp.y) < bp.r * .8) return true;
  }
  return false;
}
// 珍珠（大童的散射、珍珠小童）打到大珍珠：碎掉，大珍珠裂一點（js/pearl-kid.js 的 updatePearls 呼叫）
function bigPearlCatch(pl) {
  for (const bp of G.bigPearls || []) {
    if (Math.hypot(pl.x - bp.x, pl.y - bp.y) >= bp.r) continue;
    bp.hp -= 1; bp.hitT = .12;
    if (bp.hp <= 0) shatterBigPearl(bp);
    return true;
  }
  return false;
}

// ---- 每幀（game.js 的 update 呼叫）：落下的珍珠、大珍珠滾動 ----
function updatePearlElder(dt) {
  if (!G.pearlFalls) G.pearlFalls = [];
  if (!G.bigPearls) G.bigPearls = [];
  for (const f of G.pearlFalls) { f.t -= dt; f.spin += dt * 6; if (f.t <= 0) pearlFallImpact(f); }
  G.pearlFalls = G.pearlFalls.filter(f => f.t > 0);
  for (const bp of [...G.bigPearls]) { stepBigPearl(bp, dt); if (!bp.gone) bigPearlSeparate(bp); }
  updatePearlBeads(dt);
  for (const e of pearlBosses()) pearlBossKeepOut(e);   // 被大珍珠推開之後：身體不擠進牆裡
}

// ---- 倒下（combat-feel.js 的 onEnemyDeath 呼叫）：核心掉在原地、大珍珠全部碎掉 ----
function pearlBossDown(e) {
  const core = e.carryCore;
  if (core && !core.dead) {
    core.carried = false; core.x = e.x; core.y = e.y; core.lastHp = core.hp;
    if (core.awake) pearlBossCorePool(core, true);   // 腐蝕痕跡鋪在掉下來的地方
    G.effects.push({ ring: true, x: core.x, y: core.y, r: 8, r2: 80, life: .45, life0: .45, color: '#b56bff' });
    for (let i = 0; i < 6; i++) {
      const a = Math.random() * Math.PI * 2, sp = 8 + Math.random() * 16;
      pushCorrosionMist(core.x + Math.cos(a) * 12, core.y + 4 + Math.sin(a) * 8, Math.cos(a) * sp, Math.sin(a) * sp);
    }
  }
  for (const bp of [...(G.bigPearls || [])]) shatterBigPearl(bp);
  G.pearlFalls = [];
  if (typeof sfxAt === 'function') sfxAt('pearlElderDeath', e.x, e.y, 2.2, 'monster-death');   // 先大聲播；game.js 接著用同一個來源播的那聲會被 70ms 去重吃掉
  systemNotice(e.eliteName + '倒下了！', true);
  if (typeof coreBanner === 'function') coreBanner(e.eliteName + '倒下了', '', '#f4d9ff');   // 不提示核心可以打了
  nearbyImpact(e.x, e.y, 10, .08);
}

// ---- 畫面上方的 BOSS 血條（core-frenzy.js 的 drawCoreBossUI 呼叫）：大童＋牠身上的核心 ----
function pearlBossBars() {
  const out = [];
  for (const e of pearlBosses()) {
    if (!e.eliteAwake) continue;
    out.push({ label: e.eliteName, ratio: e.hp / e.maxhp, hit: e.hitT > 0, colors: ['#9a74c4', '#f3e2ff'], frame: '#e1c4ff', text: '#f6e9ff' });
    const core = e.carryCore;
    if (core && !core.dead && core.carried) out.push({ label: '異質核心（在' + e.eliteName + '身上）', ratio: core.hp / core.maxhp, hit: core.hitT > 0, colors: ['#7b3cff', '#c78bff'], frame: '#a970ff', text: '#e3b8ff' });
  }
  return out;
}
// 中BOSS 音樂：BOSS 戰中（js/boss-music.js）
const pearlBossHunting = () => pearlBosses().some(e => e.eliteAwake && e.pk && e.pk.state !== 'idle' && e.pk.state !== 'return');

// ---- 畫面 ----
// 核心疊在牠身上（render.js 畫完身體後呼叫，dx～dh＝身體實際畫的位置）；閉殼時藏在殼裡不畫
function drawPearlBossCore(ctx, e, dx, dy, dw, dh) {
  const core = e.carryCore;
  if (!core || core.dead || !core.carried || (e.pk && e.pk.shellT > 0)) return;
  if (!coreImg.complete || !coreImg.naturalWidth) return;
  const A = PEARL_ELDER.coreArt, len = dw * A.len, w = CORE.w * len / CORE.h;
  const now = performance.now() / 1000;
  ctx.save();
  ctx.translate(dx + dw * A.x, dy + dh * A.y); ctx.rotate(A.angle * Math.PI / 180);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(coreImg, -w / 2, -len / 2, w, len);
  const glow = flashSprite(coreImg, '#c99bff');   // 核心微微發紫光，一明一暗
  if (glow) {
    ctx.globalAlpha = .1 + .12 * (.5 + .5 * Math.sin(now * 3 + core.seed));
    ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(glow, -w / 2, -len / 2, w, len);
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  }
  if (core.hitT > 0) drawHitFlash(coreImg, Math.min(1, core.hitT / .16), '#d69bff', -w / 2, -len / 2, w, len);
  ctx.restore();
}
// 大珍珠：跟角色一起排前後（render.js 呼叫）
function pearlElderSortables(list) {
  for (const b of G.pearlBeads || []) if (isVisible(b.x, b.y)) list.push({ y: b.y - 14, draw: () => drawPearlBead(ctx, b) });   // 地上的小滾珠：排在同一列的角色後面
  for (const bp of G.bigPearls || []) list.push({ y: bp.y + bp.r * .3, draw: () => drawBigPearl(ctx, bp) });
}
function drawPearlBead(ctx, b) {
  const r = PEARL_ELDER.beads.r;
  ctx.save();
  ctx.globalAlpha = Math.min(1, b.life / .6);   // 快消失時淡出
  ctx.fillStyle = 'rgba(7,16,21,.35)'; ctx.beginPath(); ctx.ellipse(b.x, b.y + 1, r * 1.1, r * .45, 0, 0, Math.PI * 2); ctx.fill();
  drawPearlBall(ctx, b.x, b.y - r * .7, r);
  ctx.restore();
}
// 畫一顆珍珠球：x, y＝球心；裂痕照剩下的耐久畫
function drawPearlBall(ctx, x, y, r, crack = 0, seed = 0, flashK = 0) {
  const g = ctx.createRadialGradient(x - r * .35, y - r * .4, r * .1, x, y, r);
  g.addColorStop(0, '#ffffff'); g.addColorStop(.35, '#f3edf7'); g.addColorStop(.8, '#d4c8de'); g.addColorStop(1, '#a99bb8');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = .35; ctx.fillStyle = '#ffd6ec';   // 珍珠的粉色光澤
  ctx.beginPath(); ctx.ellipse(x + r * .25, y + r * .3, r * .55, r * .3, -.5, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = .9; ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.ellipse(x - r * .38, y - r * .42, r * .2, r * .12, -.7, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1; ctx.strokeStyle = '#2b2233'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
  if (crack > 0) {   // 裂痕：從邊緣往中間裂進來
    ctx.strokeStyle = 'rgba(70,55,85,.85)'; ctx.lineWidth = 1.5;
    const n = Math.ceil(crack * 4);
    for (let i = 0; i < n; i++) {
      const a = seed + i * 2.4, len = r * (.45 + .4 * crack);
      let px = x + Math.cos(a) * r * .95, py = y + Math.sin(a) * r * .95;
      ctx.beginPath(); ctx.moveTo(px, py);
      for (let j = 1; j <= 3; j++) {
        const b = a + Math.PI + Math.sin(seed * 3 + i * 7 + j) * .6;
        px += Math.cos(b) * len / 3; py += Math.sin(b) * len / 3; ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
  }
  if (flashK > 0) { ctx.globalAlpha = flashK * .7; ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; }
}
function drawBigPearl(ctx, bp) {
  if (!isVisible(bp.x, bp.y)) return;
  ctx.save();
  ctx.globalAlpha = .32; ctx.fillStyle = '#071015';   // 地上的影子
  ctx.beginPath(); ctx.ellipse(bp.x, bp.y + bp.r * .3, bp.r * 1.05, bp.r * .38, 0, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;
  const body = bigPearlBody(bp);
  drawPearlBall(ctx, body.x, body.y, bp.r, 1 - bp.hp / PEARL_ELDER.big.hp, bp.seed + bp.spin * .2, Math.max(0, bp.hitT / .12));
  ctx.restore();
}
// 落下中的珍珠（render.js 在角色上層呼叫）
function drawPearlElderFx(ctx) {
  const R = PEARL_ELDER.rain;
  for (const f of G.pearlFalls || []) {
    if (f.t > R.fall || !isVisible(f.x, f.y)) continue;
    const z = f.t / R.fall * 420, r = f.big ? PEARL_ELDER.big.r : 8;
    ctx.save();
    if (f.big) drawPearlBall(ctx, f.x, f.y - r * .6 - z, r);
    else {
      const img = pearlImg();
      if (img.complete && img.naturalWidth) { ctx.imageSmoothingEnabled = false; ctx.translate(f.x, f.y - 6 - z); ctx.rotate(f.spin); ctx.scale(1.6, 1.6); ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2); }
      else drawPearlBall(ctx, f.x, f.y - 6 - z, r);
    }
    ctx.restore();
  }
}
// 落點的陰影圈：畫在黑幕上面，暗處也躲得開（render.js 呼叫）
function drawPearlElderTelegraphs(ctx) {
  const R = PEARL_ELDER.rain;
  for (const f of G.pearlFalls || []) {
    if (!isVisible(f.x, f.y)) continue;
    const k = 1 - f.t / f.t0, rad = f.big ? R.bigR : R.smallR;
    ctx.save();
    ctx.globalAlpha = .15 + .35 * k; ctx.fillStyle = f.big ? '#3a1f4d' : '#1d1424';
    ctx.beginPath(); ctx.ellipse(f.x, f.y, rad * k, rad * .45 * k, 0, 0, Math.PI * 2); ctx.fill();   // 由小變大、越來越深的影子
    ctx.globalAlpha = .5 + .4 * k; ctx.strokeStyle = f.big ? '#ffb4e6' : '#f4e6ff'; ctx.lineWidth = f.big ? 2.5 : 1.5;
    ctx.beginPath(); ctx.ellipse(f.x, f.y, rad, rad * .45, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
  // 閉殼滾動的蓄力：地上畫出要滾過去的路線（畫到第一道牆）
  for (const e of pearlBosses()) {
    const rl = e.pk && e.pk.roll;
    if (!rl || rl.phase !== 'aim' || !isVisible(e.x, e.y)) continue;
    const k = 1 - rl.t / PEARL_ELDER.roll.windup, w = PEARL_ELDER.roll.hitR * 1.4;
    ctx.save();
    ctx.globalAlpha = .18 + .3 * k; ctx.strokeStyle = '#f4b8ff'; ctx.lineWidth = w; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(e.x, e.y + 8); ctx.lineTo(e.x + rl.dir.x * rl.show, e.y + 8 + rl.dir.y * rl.show); ctx.stroke();
    ctx.globalAlpha = .5 + .4 * k; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(e.x, e.y + 8); ctx.lineTo(e.x + rl.dir.x * rl.show * k, e.y + 8 + rl.dir.y * rl.show * k); ctx.stroke();
    ctx.restore();
  }
  // 大童被撞暈：頭上冒星星
  if (typeof drawBurrowDizzyStars !== 'function') return;
  const t = performance.now() / 1000;
  for (const e of pearlBosses()) if (e.pk && e.pk.state === 'stunned' && isVisible(e.x, e.y))
    drawBurrowDizzyStars(ctx, e.x, e.y + 13 - e.slimeLift - e.drawHeight + 10, e.drawWidth / 90, t);
}
