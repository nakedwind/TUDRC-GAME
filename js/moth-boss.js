/* ===== 菁英人面蝶「人面蝶后」（抱著異質核心在 4 個區域之間飛來飛去的地圖 BOSS）=====
   - 沉睡：抱著還沒醒的異質核心，停在地圖的核心候選點上（核心原本的位置），翅膀慢慢拍。
   - 驚醒：溫特走到 wakeRange 格內（看得到）、或打中牠 → 尖叫，核心跟著甦醒（異質體狂暴化），
           畫面上方出現 BOSS 血條，然後牠抱著核心飛走。
   - 換區：照 route 的順序飛往下一個區域（飛得過牆），一路灑下下一區顏色的鱗粉當路標（也是陷阱，吸滿一樣會中招）。
           飛行中很難打（受到的傷害 × flyDefense）。系統訊息只說牠飛走了，不說去哪一區。
   - 築巢：飛到那一區後把核心放在地上（這時候核心打得到），在附近繞著目標飛、撒那一區的鱗粉：
           左下＝睡眠、左上＝毒、右上＝混亂、最後回到右下＝三種輪流撒。
   - 大面積撒粉：築巢時有人在這一區，每隔幾秒翅膀發光、地上出現那一區顏色的圓圈預告，接著把整個區域撒滿鱗粉（MOTH_BOSS.burst）。
   - 每掉 1/4 血 → 尖叫、飛回去撿起核心，抱著飛往下一區（同一區打不死牠，血會停在那一段的底線）。
   - 最後一區被打倒 → 核心掉在牠倒下的地方；核心如果先被打破，牠照樣換區，只是沒有東西可抱。
   - 不會趨光（2026-11-21 拿掉）：一般人面蝶會飛去停在燈上，人面蝶后不會。
   - 鱗粉霧、粉塵爆炸、中毒／混亂／睡眠都沿用一般人面蝶（js/human-face-butterfly.js）。
   出現在哪張地圖：MOTH_BOSS.maps（地圖 id → 起點、各區巢的位置）。起點會抱走離起點最近的那顆地圖核心。
   數值都在下面的 MOTH_BOSS。必須在 human-face-butterfly.js、anomalous-core.js 之後、game.js 之前載入。
*/
const MOTH_BOSS = {
  name: '人面蝶后',
  maps: {
    // B56區-藍線捷運站：起點是右下區的核心候選點；四個角落的大房間（都在 2 樓）
    map_mwizzi7s: {
      start: { c: 75, r: 64 },
      zones: {
        rb: { name: '右下區', c: 75, r: 64, radius: 9 },
        lb: { name: '左下區', c: 15, r: 64, radius: 9 },
        lt: { name: '左上區', c: 17, r: 25, radius: 8 },
        rt: { name: '右上區', c: 71, r: 25, radius: 8 },
      },
      // 飛的順序和每一區撒的鱗粉（poison 毒、confuse 混亂、sleep 睡眠、mix 三種輪流）
      route: [
        { zone: 'lb', kind: 'sleep' },
        { zone: 'lt', kind: 'poison' },
        { zone: 'rt', kind: 'confuse' },
        { zone: 'rb', kind: 'mix' },
      ],
    },
  },
  hp: 2400,                      // 血量（再乘整體難度）；分成 route 那麼多段，每一段打完就換區
  coreHp: 1500,                  // 牠抱著的核心血量（地圖難度 1；難度越高照比例加）
  rewardMul: 8, crystalMul: 8,   // 以一般人面蝶（data/monsters.js）為基準
  scale: 2.16,                   // 體型放大倍率（以一般人面蝶為基準）
  height: 110,                   // 平常飛多高（像素）
  sleepHeight: 46,               // 沉睡時停多高
  speedMul: 2,                   // 在巢附近飛的速度倍率（以一般人面蝶為基準）
  flySpeedMul: 2.4,              // 換區時再乘這個倍率（抱著核心飛走）
  wakeRange: 7,                  // 溫特走到幾格內（看得到）就驚醒
  scream: 1.4,                   // 尖叫幾秒（驚醒、換區前）
  flyDefense: .35,               // 飛行換區時受到的傷害倍率
  flyFloor: .06,                 // 飛行途中血量最少留到「這一段的底線 + 幾成血」（才不會一到巢就馬上又飛走）
  trailEvery: .55,               // 飛行時每幾秒在身後灑一團鱗粉（路標）
  leash: 8,                      // 築巢時離巢最遠飛幾格（目標跑太遠就回巢）
  orbit: { min: 1.6, max: 3.2 }, // 繞著目標飛：離目標最近、最遠幾格
  nestOrbit: 2.2,                // 沒有目標時繞著巢飛的半徑（格）
  // 大面積撒粉（築巢時、這一區有目標才會撒）：every＝每隔幾秒一次（最短～最長）、first＝到巢後第一次等幾秒、
  // telegraph＝預告幾秒（翅膀發光、地上圓圈）、time＝幾秒內撒完、puffs＝撒幾團（大團）、cover＝撒滿這一區半徑的幾成
  burst: { every: [7, 10], first: 2.5, telegraph: 1.6, time: 1.2, puffs: 16, cover: .95 },
  sound: { wake: 1.8, flap: .7 },   // 音量：尖叫、拍翅膀
  music: { near: 8, far: 32 },   // BOSS 音樂（js/boss-music.js）：溫特離牠 near 格以內全音量，越遠越小聲，far 格以外降到最小（BOSS_MUSIC.quiet，跟順順宮主沒在追溫特時一樣）
};
const mbSpot = () => typeof MAP !== 'undefined' && MAP ? MOTH_BOSS.maps[MAP.id] || null : null;
const mothBosses = () => (G && G.enemies ? G.enemies.filter(e => e.mothBoss && !e.dead && e.hp > 0) : []);
const mbDist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

// ---- 開場（game.js 在 seedCores 之後呼叫）：生在起點，抱起離起點最近的核心 ----
function seedMothBoss() {
  G.mothBossPathCache = null;
  const spot = mbSpot();
  if (!spot || MAP_SAFE || (typeof practiceOn === 'function' && practiceOn())) return;
  const base = ACTIVE_MONSTERS.find(m => m.id === 'human_face_butterfly');
  if (!base || !inGrid(spot.start.c, spot.start.r)) return;
  let [x, y] = center(spot.start.c, spot.start.r);
  // 抱走地圖上的核心（核心候選點那顆）；沒有就自己帶一顆
  let core = null, best = Infinity;
  for (const c of G.cores) { if (c.dead || c.carried || c.hidden) continue; const d = Math.hypot(c.x - x, c.y - y); if (d < best) { best = d; core = c; } }
  if (core && best <= CELL * 3) { x = core.x; y = core.y; }
  else {
    const difficulty = Math.max(1, Math.min(5, Number(MAP.difficulty) || 1)), hp = CORE.hp * difficulty;
    core = { x, y, floor: spawnFloorAt(spot.start.c, spot.start.r), hp, maxhp: hp, lastHp: hp, dead: false, awake: false, phase: 0, awakeT: 0,
      timer: 2 + Math.random() * 2.4, reward: CORE.reward * difficulty, moteT: 0, hitT: 0, seed: Math.random() * 10 };
    G.cores.push(core);
  }
  const P = MOTH_BOSS, e = createMonster(base, x, y);
  e.mothBoss = true; e.eliteName = P.name;
  e.hp = e.maxhp = Math.round(e.maxhp / base.hp * P.hp);   // createMonster 給的是一般人面蝶血量 × 整體難度：換成 BOSS 的血量，難度照樣乘
  e.reward = Math.round(e.reward * P.rewardMul); e.crystals = Math.round((e.crystals ?? 5) * P.crystalMul);
  e.drawWidth = Math.round(base.width * P.scale); e.drawHeight = Math.round(base.height * P.scale);
  e.speed = base.speed * P.speedMul;
  e.knockMul = 0; e.staggerTime = 0; e.unpushable = true; e.noHitSquash = true;   // 推不動、不硬直
  e.floor = spawnFloorAt(...cellAt(x, y));
  e.carryCore = core; core.carried = true; core.x = x; core.y = y;
  core.hp = core.maxhp = core.lastHp = Math.round(P.coreHp * core.maxhp / CORE.hp);   // 照地圖難度的比例（seedCores 給的是 CORE.hp × 難度）；carried：打不到、阿瓦倫靠近也不會醒
  e.mo = { phase: Math.random() * 6, cd: 1, wait: 0, lift: P.sleepHeight, orbit: 0 };
  e.flying = true;
  e.mb = { state: 'sleep', t: 0, stage: 0, nest: null, path: null, trail: 0, mixIdx: 0 };
  e.mbHp = e.hp;
  G.enemies.push(e);
}

// ---- 每一段的血量底線：第 stage 段（0 開始）打到這裡就換區；最後一段是 0 ----
function mbStageFloor(e, stage) {
  const n = mbSpot().route.length;
  return stage >= n - 1 ? 0 : e.maxhp * (1 - (stage + 1) / n);
}
const mbZone = (e, stage) => { const s = mbSpot(), step = s.route[Math.min(stage, s.route.length - 1)]; return { ...s.zones[step.zone], kind: step.kind }; };
function mbSet(e, state, t = 0) { e.mb.state = state; e.mb.t = t; }

// ---- 受傷（game.js 在結算死亡前呼叫）：飛行中難打、停在燈上好打、同一區打不死 ----
function mothBossArmor() {
  for (const e of mothBosses()) {
    const mb = e.mb;
    if (e.mbHp == null || e.hp > e.mbHp) { e.mbHp = e.hp; continue; }
    let lost = e.mbHp - e.hp;
    if (lost <= 0) continue;
    if (mb.state === 'fly' || mb.state === 'grab') lost *= MOTH_BOSS.flyDefense;
    e.hp = e.mbHp - lost;
    if (mb.state === 'sleep') mothBossWake(e);
    const floor = mbStageFloor(e, mb.stage);
    if (mb.state === 'nest') {
      if (floor > 0 && e.hp <= floor) { e.hp = floor; mothBossLeave(e); }   // 這一段打完：換區（最後一區的底線是 0，照常打死）
    } else e.hp = Math.max(e.hp, floor + e.maxhp * MOTH_BOSS.flyFloor);   // 尖叫、換區途中打不死
    e.mbHp = e.hp;
  }
}

// ---- 驚醒：尖叫、核心甦醒，然後飛往第一區 ----
function mothBossWake(e) {
  const mb = e.mb;
  if (e.eliteAwake) return;
  e.eliteAwake = true;
  const core = e.carryCore;
  if (core && !core.dead && !core.awake) { wakeCore(core); core.lastHp = core.hp; mbCorePool(core, false); }
  mbScream(e, MOTH_BOSS.name + '驚醒了');
  mb.next = 'fly';
  systemNotice(MOTH_BOSS.name + '抱著異質核心飛走了！', true);   // 不說飛去哪一區（讓玩家自己找）
}
// 這一段打完：尖叫、回去撿核心、往下一區飛
function mothBossLeave(e) {
  const mb = e.mb;
  mb.stage++;
  mbScream(e, null);
  mb.next = e.carryCore && !e.carryCore.dead && !e.carryCore.carried ? 'grab' : 'fly';
  e.mo.spray = null; mb.burst = null;
  systemNotice(MOTH_BOSS.name + (mb.next === 'grab' ? '撿起核心' : '') + '飛走了！', true);   // 不說飛去哪一區（讓玩家自己找）
  if (typeof coreBanner === 'function') coreBanner(MOTH_BOSS.name + '飛走了', '', '#f4d9ff');
}
function mbScream(e, banner) {
  mbSet(e, 'scream', MOTH_BOSS.scream);
  e.alertT = ENEMY_ALERT_TIME;
  if (banner && typeof coreBanner === 'function') coreBanner(banner, '', '#f4d9ff');
  const top = e.y - (e.slimeLift || 0) - e.drawHeight * .5;
  for (let i = 0; i < 3; i++) G.effects.push({ ring: true, x: e.x, y: top, r: 8 + i * 6, r2: 110 + i * 40, life: .45 + i * .15, life0: .45 + i * .15, color: i ? '#e7c8ff' : '#ffffff' });
  nearbyImpact(e.x, e.y, 7, .05);
  if (typeof sfxAt === 'function') sfxAt('mothHurt', e.x, e.y, MOTH_BOSS.sound.wake, 'moth-boss-scream');
}

// 核心腳下的腐蝕痕跡：抱在身上時收掉，放到地上時在巢那裡重新鋪上（跟 js/pearl-elder.js 同一套）
function mbCorePool(core, on) {
  if (!core.pool) return;
  G.acidPools = (G.acidPools || []).filter(p => p !== core.pool);
  if (core.scorch) { G.scorchMarks = (G.scorchMarks || []).filter(s => s !== core.scorch); core.scorch = null; }
  if (!on) return;
  core.pool.x = core.x; core.pool.y = core.y + 8; core.pool.t = 999; core.pool.floor = core.floor || 0;
  G.acidPools.push(core.pool);
  keepCoreScorch(core);
}

// ---- 換區的飛行路線：在「飛得到的格子」上找路（8 方向），再把看得到的點連成直線，減少轉彎 ----
function mbFlyCells() {
  const cache = G.mothBossPathCache;
  if (cache && cache.map === MAP) return cache.ok;
  const ok = new Set();
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) { const [x, y] = center(c, r); if (mothCanFly(x, y)) ok.add(c + ',' + r); }
  G.mothBossPathCache = { map: MAP, ok };
  return ok;
}
function mbStraightOk(x0, y0, x1, y1) {
  const d = Math.hypot(x1 - x0, y1 - y0), n = Math.ceil(d / (CELL * .4));
  for (let i = 1; i < n; i++) if (!mothCanFly(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n)) return false;
  return true;
}
function mbFindPath(x0, y0, x1, y1) {
  const ok = mbFlyCells(), [sc, sr] = cellAt(x0, y0), [gc, gr] = cellAt(x1, y1), goal = gc + ',' + gr;
  const prev = new Map([[sc + ',' + sr, null]]), q = [[sc, sr]];
  for (let i = 0; i < q.length && !prev.has(goal); i++) {
    const [c, r] = q[i];
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
      const k = (c + dc) + ',' + (r + dr);
      if (prev.has(k) || !ok.has(k)) continue;
      if (dc && dr && (!ok.has((c + dc) + ',' + r) || !ok.has(c + ',' + (r + dr)))) continue;   // 斜著走不切牆角
      prev.set(k, c + ',' + r); q.push([c + dc, r + dr]);
    }
  }
  if (!prev.has(goal)) return [{ x: x1, y: y1 }];   // 找不到路：直接飛過去（mothFlyToward 會自己貼著邊滑）
  const cells = [];
  for (let k = goal; k; k = prev.get(k)) { const [c, r] = k.split(',').map(Number), [x, y] = center(c, r); cells.unshift({ x, y }); }
  cells[cells.length - 1] = { x: x1, y: y1 };
  const out = [];   // 拉直：從目前的點往後找最遠一個直線飛得到的點
  let from = { x: x0, y: y0 }, i = 0;
  while (i < cells.length) {
    let j = cells.length - 1;
    while (j > i && !mbStraightOk(from.x, from.y, cells[j].x, cells[j].y)) j--;
    out.push(cells[j]); from = cells[j]; i = j + 1;
  }
  return out;
}
// 照路線飛；到了回傳 true
function mbFollowPath(e, dt, mul) {
  const mb = e.mb;
  if (!mb.path || !mb.path.length) return true;
  const pt = mb.path[0];
  if (mothFlyToward(e, pt.x, pt.y, dt, mul) || mbDist(e, pt) < 6) mb.path.shift();
  return !mb.path.length;
}

// ---- 巢的位置：那一區的中心 ----
function mbNestFor(e, z) {
  const [x, y] = center(z.c, z.r);
  return { x, y };
}

// ---- 每幀（enemy-ai.js 的 stepEnemy 呼叫）----
function stepMothBoss(e, dt) {
  const P = MOTH_BOSS, m = e.mo, mb = e.mb, f = e.frames || {};
  m.phase += dt; mb.t -= dt;
  // 拍翅膀（沉睡時拍得慢）
  const slow = mb.state === 'sleep';
  const wings = f.walkFront && f.walkFront.length ? f.walkFront : [f.front || e.sprite];
  m.flapT = (m.flapT || 0) + dt * MOTH.flapFps * (slow ? .35 : mb.state === 'fly' ? 1.4 : 1);
  e.forceFrame = wings[Math.floor(m.flapT) % wings.length];
  const flapRound = Math.floor(m.flapT / Math.max(wings.length, Math.round(MOTH.flapFps * MOTH.sound.flapEvery)));
  if (flapRound !== m.flapRound) { m.flapRound = flapRound; if (typeof sfxAt === 'function') sfxAt('mothFlap', e.x, e.y, P.sound.flap * (slow ? .5 : 1), 'moth-boss-flap'); }
  e.forceFlip = !!e.faceRight;   // 原圖朝左
  const goalLift = mb.state === 'sleep' ? P.sleepHeight : P.height;
  m.lift += (goalLift - m.lift) * Math.min(1, dt * 3);
  e.slimeLift = Math.max(4, m.lift + Math.sin(m.phase * MOTH.bobSpeed) * (slow ? 2 : MOTH.bob));
  m.fleeT = 0;   // 一般人面蝶「撒完就逃」不適用：BOSS 自己決定去哪
  const core = e.carryCore;
  if (core && core.dead) e.carryCore = null;
  else if (core && core.carried) { core.x = e.x; core.y = e.y; }   // 核心抱在身上，跟著飛
  if (e.stunT > 0) { m.spray = null; mb.burst = null; return; }   // 被麻醉、麻痺：停在空中（大面積撒粉也被打斷）
  switch (mb.state) {
    case 'sleep': {
      const p = G.player;
      if (p && p.hp > 0 && sameFloor(e, p) && mbDist(p, e) <= P.wakeRange * CELL && hasLineOfSight(e.x, e.y, p.x, p.y)) mothBossWake(e);
      return;
    }
    case 'scream':
      e.tremble = true;
      if (mb.t <= 0) { e.tremble = false; mbStartMove(e, mb.next || 'fly'); }
      return;
    case 'grab': {   // 飛回巢把核心撿起來
      const c = e.carryCore;
      if (!c) { mbStartMove(e, 'fly'); return; }
      if (mothFlyToward(e, c.x, c.y, dt, P.flySpeedMul) || mbDist(e, c) < 8) {
        c.carried = true; mbCorePool(c, false);
        G.effects.push({ ring: true, x: c.x, y: c.y, r: 6, r2: 70, life: .35, life0: .35, color: '#b56bff' });
        mbStartMove(e, 'fly');
      }
      return;
    }
    case 'fly': mbFly(e, dt); return;
    case 'land': {   // 降到巢上，把核心放下來
      if (mothFlyToward(e, mb.nest.x, mb.nest.y, dt, P.flySpeedMul * .6) || mbDist(e, mb.nest) < 6) mbDropCore(e);
      return;
    }
    case 'nest': mbNest(e, dt); return;
    default: mbSet(e, 'nest');
  }
}
function mbStartMove(e, state) {
  const mb = e.mb;
  if (state === 'grab') { mbSet(e, 'grab'); return; }
  const z = mbZone(e, mb.stage);
  mb.nest = mbNestFor(e, z);
  mb.path = mbFindPath(e.x, e.y, mb.nest.x, mb.nest.y);
  mb.trail = 0;
  mbSet(e, 'fly');
}
// 飛往下一區：一路灑下一區顏色的鱗粉
function mbFly(e, dt) {
  const P = MOTH_BOSS, mb = e.mb, z = mbZone(e, mb.stage);
  mb.trail -= dt;
  if (mb.trail <= 0 && !(e.burnT > 0)) { mb.trail = P.trailEvery; mothPuff(e.x + mothRand(-20, 20), e.y + mothRand(-10, 16), mbKind(e, z), false, actorFloor(e)); }
  if (mbFollowPath(e, dt, P.flySpeedMul)) {
    mbSet(e, e.carryCore && e.carryCore.carried ? 'land' : 'nest');
    if (!e.carryCore || !e.carryCore.carried) mbArrive(e);
  }
}
// 到巢了
function mbArrive(e) {
  const z = mbZone(e, e.mb.stage);
  e.mb.burstCd = MOTH_BOSS.burst.first; e.mb.burst = null;   // 到巢後等一下才第一次大面積撒粉
  flash(MOTH_BOSS.name + '在' + z.name + '築巢', e.x, e.y - e.slimeLift - e.drawHeight - 6, '#f4d9ff');
}
function mbDropCore(e) {
  const mb = e.mb, c = e.carryCore;
  if (c && c.carried) {
    c.carried = false;
    c.x = mb.nest.x; c.y = mb.nest.y;
    const [cc, cr] = cellAt(c.x, c.y);
    c.floor = spawnFloorAt(cc, cr); c.lastHp = c.hp;
    if (c.awake) mbCorePool(c, true);
    G.effects.push({ ring: true, x: c.x, y: c.y, r: 8, r2: 80, life: .45, life0: .45, color: '#b56bff' });
    for (let i = 0; i < 6; i++) {
      const a = Math.random() * Math.PI * 2, sp = 8 + Math.random() * 16;
      pushCorrosionMist(c.x + Math.cos(a) * 12, c.y + 4 + Math.sin(a) * 8, Math.cos(a) * sp, Math.sin(a) * sp);
    }
    nearbyImpact(c.x, c.y, 5, .03);
  }
  mbSet(e, 'nest');
  mbArrive(e);
}
// 這一區撒哪一種（最後一區三種輪流）
function mbKind(e, z) {
  if (z.kind !== 'mix') return z.kind;
  return MOTH_KINDS[e.mb.mixIdx % MOTH_KINDS.length];
}
// 築巢：在巢附近繞著目標飛、撒這一區的鱗粉；目標跑出巢的範圍就回巢上空繞
function mbNest(e, dt) {
  const P = MOTH_BOSS, m = e.mo, mb = e.mb, z = mbZone(e, mb.stage), home = mb.nest;
  let target = mothPickTarget(e);
  if (target && mbDist(target, home) > (P.leash + 3) * CELL) target = null;   // 跑出巢的範圍：不追
  m.target = target;
  if (!mbBurst(e, dt, z, !!target)) {   // 沒在大面積撒粉：照一般人面蝶一輪一輪撒
    const had = m.spray;
    mothSpray(e, dt, true);
    if (m.spray && m.spray !== had) { m.spray.kind = mbKind(e, z); mb.mixIdx++; }   // 新的一輪：換成這一區的顏色
  }
  m.orbit += dt * .6;
  if (target) {
    const R = (P.orbit.min + (P.orbit.max - P.orbit.min) * (.5 + .5 * Math.sin(m.phase * .7))) * CELL;
    let gx = target.x + Math.cos(m.orbit) * R, gy = target.y + Math.sin(m.orbit) * R * .6;
    const dd = Math.hypot(gx - home.x, gy - home.y), max = P.leash * CELL;
    if (dd > max) { gx = home.x + (gx - home.x) * max / dd; gy = home.y + (gy - home.y) * max / dd; }
    mothFlyToward(e, gx, gy, dt);
  } else {
    const R = P.nestOrbit * CELL;
    mothFlyToward(e, home.x + Math.cos(m.orbit) * R, home.y + Math.sin(m.orbit) * R * .6, dt, .7);
  }
}
// 大面積撒粉：冷卻好了（而且這一區有人）→ 翅膀發光、地上圓圈預告 → 在 time 秒內把整區撒滿大團鱗粉。
// 正在預告或撒的時候回傳 true（這時候不做一般的一輪一輪撒粉）
function mbBurst(e, dt, z, hasTarget) {
  const B = MOTH_BOSS.burst, m = e.mo, mb = e.mb, home = mb.nest;
  if (!mb.burst) {
    mb.burstCd = (mb.burstCd ?? B.first) - dt;
    if (mb.burstCd > 0 || !hasTarget || e.burnT > 0) return false;
    // 開始預告：用一般人面蝶的翅膀發光（m.spray 的 tele），顏色＝這一區的鱗粉
    const kind = mbKind(e, z), [r, g, b] = MOTH_COLORS[kind].rgb, R = z.radius * CELL * B.cover;
    mb.mixIdx++;
    mb.burst = { kind, t: 0, done: 0, R, spots: mbBurstSpots(home, R, B.puffs) };
    m.spray = { kind, phase: 'tele', t: 0, burst: true };
    const col = `rgb(${r},${g},${b})`;
    for (let i = 0; i < 3; i++) G.effects.push({ ring: true, x: home.x, y: home.y, r: R * (.15 + i * .25), r2: R, life: B.telegraph - i * .3, life0: B.telegraph - i * .3, color: col });
    flash(MOTH_BOSS.name + '張開翅膀…', e.x, e.y - e.slimeLift - e.drawHeight - 6, MOTH_COLORS[kind].glow);
    if (typeof sfxAt === 'function') sfxAt('mothHurt', e.x, e.y, MOTH_BOSS.sound.wake * .6, 'moth-boss-scream');
    return true;
  }
  const s = mb.burst;
  if (e.burnT > 0) { mb.burst = null; m.spray = null; mb.burstCd = B.every[0]; return false; }   // 身上著火：鱗粉燒掉了，撒不出來
  s.t += dt;
  if (m.spray && m.spray.burst) m.spray.t = Math.min(s.t, B.telegraph) / B.telegraph * MOTH.telegraph;   // 翅膀照預告進度越來越亮
  if (s.t < B.telegraph) return true;
  if (m.spray && m.spray.phase === 'tele') {   // 預告結束：開始撒（翅膀一閃一閃）
    m.spray.phase = 'spray';
    G.effects.push({ ring: true, x: home.x, y: home.y, r: 20, r2: s.R, life: .5, life0: .5, color: MOTH_COLORS[s.kind].glow });
    if (typeof sfxAt === 'function') sfxAt('mothSpray', e.x, e.y, 1, 'moth-boss-burst');
  }
  const want = Math.min(s.spots.length, Math.ceil((s.t - B.telegraph) / B.time * s.spots.length));
  for (; s.done < want; s.done++) { const p = s.spots[s.done]; mothPuff(p.x, p.y, s.kind, true, actorFloor(e)); }
  if (s.done >= s.spots.length) {
    mb.burst = null; m.spray = null;
    mb.burstCd = mothRand(B.every[0], B.every[1]);
    return false;
  }
  return true;
}
// 大面積撒粉的落點：從巢中心往外螺旋排開（平均鋪滿整個圓，再加一點亂數），飛不到的地方（地圖外）跳過
function mbBurstSpots(home, R, n) {
  const out = [], turn = Math.PI * (3 - Math.sqrt(5));   // 黃金角：點會平均散開
  const a0 = Math.random() * Math.PI * 2;
  for (let i = 0; i < n; i++) {
    const d = R * Math.sqrt((i + .5) / n), a = a0 + i * turn;
    const x = home.x + Math.cos(a) * d + mothRand(-14, 14), y = home.y + Math.sin(a) * d * .75 + mothRand(-10, 10);
    if (mothCanFly(x, y)) out.push({ x, y });
  }
  return out;
}

// ---- 倒下（combat-feel.js 的 onEnemyDeath 呼叫）：抱著的核心掉在原地 ----
function mothBossDown(e) {
  const c = e.carryCore;
  if (c && !c.dead && c.carried) {
    e.mb.nest = { x: e.x, y: e.y }; mbDropCore(e);
  }
  systemNotice(e.eliteName + '倒下了！', true);
  if (typeof coreBanner === 'function') coreBanner(e.eliteName + '倒下了', '', '#f4d9ff');
  nearbyImpact(e.x, e.y, 10, .08);
}

// ---- 畫面上方的 BOSS 血條（core-frenzy.js 的 drawCoreBossUI 呼叫）：人面蝶后＋抱著的核心 ----
function mothBossBars() {
  const out = [];
  for (const e of mothBosses()) {
    if (!e.eliteAwake) continue;
    out.push({ label: e.eliteName, ratio: e.hp / e.maxhp, hit: e.hitT > 0, colors: ['#8a5cc4', '#f3e2ff'], frame: '#e1c4ff', text: '#f6e9ff' });
    const core = e.carryCore;
    if (core && !core.dead && core.carried) out.push({ label: '異質核心（在' + e.eliteName + '懷裡）', ratio: core.hp / core.maxhp, hit: core.hitT > 0, colors: ['#7b3cff', '#c78bff'], frame: '#a970ff', text: '#e3b8ff' });
  }
  return out;
}
// 中BOSS 音樂（js/boss-music.js）：醒著的人面蝶后離溫特多近（1＝near 格以內，0＝far 格以外）；沒有醒著的就是 null（不播）
function mothBossMusicK() {
  const list = mothBosses().filter(e => e.eliteAwake), p = G && G.player;
  if (!list.length) return null;
  if (!p) return 0;
  const M = MOTH_BOSS.music, d = Math.min(...list.map(e => mbDist(e, p))) / CELL;
  return Math.max(0, Math.min(1, (M.far - d) / (M.far - M.near)));
}

// ---- 畫面：抱在懷裡的核心＋蓋在核心上的前方手（render.js 畫完身體後呼叫，dx～dh＝身體實際畫的位置）----
const MOTH_BOSS_CORE_ART = { x: .10, y: .42, angle: -8 };   // 核心捧在兩隻手中間：中心位置（圖寬、圖高的比例）、旋轉角度（度）；大小＝核心原本的大小（CORE.w × CORE.h），不跟著牠的體型縮放
function drawMothBossCore(ctx, e, dx, dy, dw, dh) {
  const core = e.carryCore;
  if (!core || core.dead || !core.carried || !coreImg.complete || !coreImg.naturalWidth) return;
  const A = MOTH_BOSS_CORE_ART, len = CORE.h, w = CORE.w, now = performance.now() / 1000;
  ctx.save();
  ctx.translate(dx + dw * A.x, dy + dh * A.y); ctx.rotate(A.angle * Math.PI / 180);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(coreImg, -w / 2, -len / 2, w, len);
  const glow = flashSprite(coreImg, '#c99bff');   // 核心微微發紫光，一明一暗
  if (glow) {
    ctx.globalAlpha = .12 + .14 * (.5 + .5 * Math.sin(now * 3 + core.seed));
    ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(glow, -w / 2, -len / 2, w, len);
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  }
  if (core.hitT > 0) drawHitFlash(coreImg, Math.min(1, core.hitT / .16), '#d69bff', -w / 2, -len / 2, w, len);
  ctx.restore();
  // 前方那隻手蓋在核心上面：每張動作圖都有一張同名加「-前方手」的圖（跟本體一樣大、只畫前面那隻手），疊在同一個位置
  const file = e.forceFrame || e.sprite;
  const hand = file && monsterImage(file.replace(/\.png$/i, '-前方手.png'));
  if (hand && hand.complete && hand.naturalWidth) {
    const smooth = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(hand, dx, dy, dw, dh);
    if (e.hitT > 0) drawHitFlash(hand, Math.min(1, e.hitT / .16), e.hitColor, dx, dy, dw, dh);   // 被打時手也跟身體一起閃
    ctx.imageSmoothingEnabled = smooth;
  }
}
