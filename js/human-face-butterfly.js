/* ===== 人面蝶（behavior: "moth"）=====
   ・在空中慢慢地飛（上下輕輕飄、左右微微晃），飛得過牆、踩不到地雷；近戰的隊員（雷德、路德、阿瓦倫、柯林）有一半打不到牠。
   ・撒鱗粉：每一輪隨機選一種顏色，翅膀先發出那種顏色的光（預告），接著一邊飛一邊撒，地上留下一團一團會擴散、慢慢飄散的鱗粉霧。
       綠＝毒：持續扣血（MOTH.poison）
       紫＝混亂：隊員改打自己人；溫特開槍有八成打偏（MOTH.confuse）
       藍＝睡眠：溫特、隊員睡 20 秒，不能動、不能攻擊；被打到就會醒（MOTH.sleep）
   ・吸滿才發作：站在霧裡頭上會出現那種顏色的量表，吸滿才中招；離開霧量表會慢慢退掉。
   ・粉塵爆炸：鱗粉可燃。火（照明彈、火海、著火的怪物、希奧妮／安柏打中的地方、油桶爆炸、地雷、燃燒彈）碰到鱗粉霧就會炸開，
     相連的霧一團接一團連鎖引爆，範圍內的人、怪物（包括人面蝶自己）、油桶都會被炸到。人面蝶身上著火時撒不出粉。
   ・趨光：附近有露營燈、探照燈就會飛過去停在燈上休息（停著的時候不撒粉），休息完那盞燈一陣子內不會再吸引牠。
   ・死掉時炸出一大團鱗粉。
   必須在 enemy-ai.js 之後、game.js 之前載入。數值都在下面的 MOTH。
*/
const MOTH = {
  height: 90,           // 平常飛多高（像素）
  bob: 6,               // 上下飄動幅度（像素）
  bobSpeed: 2.2,        // 上下飄動的速度
  wobble: .45,          // 飛行路線左右晃的幅度（弧度）
  flapFps: 5,           // 拍翅膀（每秒換幾張圖）
  noticeRange: 8,       // 看到溫特／隊友的距離（格）
  loseRange: 13,        // 追多遠就放棄（格）
  hoverMin: 1.2,        // 繞著目標飛：離目標最近幾格
  hoverMax: 2.6,        // 繞著目標飛：離目標最遠幾格
  wanderRadius: 4, idleMin: 1.5, idleMax: 3.5, wanderSpeedMul: .6,
  flee: { hitTime: 2, afterSpray: 2.5, nearRange: 3.5, speedMul: 2.2, dist: 4, sprayCd: 3 },   // 逃跑：被打到逃幾秒、在目標身邊撒完一輪逃幾秒、離目標幾格內撒完才逃、逃跑速度倍率、往外逃的距離（格）、逃跑時撒完一輪後至少隔幾秒才會再撒
  // ---- 撒鱗粉 ----
  telegraph: .8,        // 撒粉前翅膀發光幾秒（預告顏色）
  sprayTime: 4,         // 一輪撒幾秒
  puffEvery: .22,       // 撒粉時每幾秒落下一團
  cooldown: [.8, 1.6],  // 兩輪之間隔幾秒（隨機）
  cloud: { r0: 53, r1: 149, grow: 2, life: 7, drift: 10, max: 70 },   // 鱗粉霧：一開始半徑、最大半徑（像素）、幾秒長到最大、留幾秒、飄動速度、最多幾團
  // ---- 吸入 ----
  doseTime: 1.4,        // 一直站在濃霧裡幾秒會吸滿
  doseDecay: .45,       // 離開霧之後，量表每秒退多少（滿＝1）
  immune: 2,            // 發作後幾秒內同一種鱗粉不再累積
  poison: { time: 8, tick: 1, dmg: 3 },      // 中毒：持續幾秒、每幾秒扣一次、每次扣多少
  confuse: { time: 6, playerMiss: .8, lineGap: 5 },   // 混亂：持續幾秒、溫特開槍打偏的機率、打到自己人的台詞至少隔幾秒
  sleep: { time: 20 },                       // 睡眠：睡幾秒（被打到就醒）
  meleeMiss: .95,       // 近戰隊員打牠打不到的機率（飛得高，只有 5% 打得到）
  // ---- 粉塵爆炸 ----
  blast: { radius: 1.4, enemy: 45, sentry: 14, player: 12, chainDelay: .07 },   // 半徑（格）、對怪物／隊員／溫特的傷害、連鎖引爆的間隔（秒）
  blastMin: 2,          // 連在一起的霧至少幾團，碰到火才會爆炸（只有一團不會炸）
  bigBlastAt: 3,        // 連在一起的霧有幾團以上算大爆炸
  bigBlastMul: 1.6,     // 大爆炸的傷害倍率
  // ---- 趨光 ----
  lure: { range: 7, perch: 6, cooldown: 14 },   // 幾格內的燈會吸引牠、停在燈上幾秒、休息完那盞燈幾秒內不再吸引牠
  deathPuffs: 7,        // 死掉時炸出幾團鱗粉
  sound: { flap: .35, flapEvery: .8, spray: .6, sprayEvery: 1.2 },   // 音量：拍翅膀、撒鱗粉（0～1，再乘音效編輯器的音量）；拍翅膀、撒鱗粉每幾秒播一次（音檔約 0.8、1.25 秒）
  testSpawn: true,      // 測試用：true＝進戰鬥地圖時在營地右邊生一隻（測完改成 false）
  testCampDist: 20,     // 測試用：營地右邊幾格（跟之前測試的葫蘆猴同一個位置）
};
// 三種鱗粉的顏色
const MOTH_COLORS = {
  poison:  { name: '毒鱗粉', rgb: [110, 220, 90], glow: '#7dff6a' },
  confuse: { name: '混亂鱗粉', rgb: [190, 110, 255], glow: '#c98bff' },
  sleep:   { name: '睡眠鱗粉', rgb: [90, 170, 255], glow: '#7fc4ff' },
};
const MOTH_KINDS = Object.keys(MOTH_COLORS);
const mothRand = (a, b) => a + Math.random() * (b - a);
const mothPick = list => list[Math.floor(Math.random() * list.length)];

// ---- 能飛到哪裡：地圖上有鋪東西的格子（地板、牆都算，所以飛得過牆）；沒鋪東西的黑色空白區（地圖外）、還沒炸開的隱藏區不行 ----
function mothCanFly(x, y) {
  const [c, r] = cellAt(x, y);
  if (!inGrid(c, r) || (typeof inHiddenArea === 'function' && inHiddenArea(x, y))) return false;
  const floor = typeof mapFloorCells === 'function' ? mapFloorCells() : null;
  return !floor || !floor.size || floor.has(c + ',' + r);
}
// 最近一格能飛的格子（中心座標）
function mothNearestFloor(e) {
  const [ec, er] = cellAt(e.x, e.y);
  for (let R = 1; R <= 12; R++) {
    let best = null, bestD = Infinity;
    for (let r = er - R; r <= er + R; r++) for (let c = ec - R; c <= ec + R; c++) {
      if (Math.max(Math.abs(c - ec), Math.abs(r - er)) !== R) continue;
      const [x, y] = center(c, r);
      if (!mothCanFly(x, y)) continue;
      const d = Math.hypot(x - e.x, y - e.y);
      if (d < bestD) { bestD = d; best = [x, y]; }
    }
    if (best) return best;
  }
  return null;
}
// 逃跑方向：繞一圈試 16 個方向，挑「飛得過去的距離」最長、終點離威脅最遠的（不會往地圖外的空白區逃）
function mothFleeAngle(e, from, D) {
  let best = null, bestScore = -Infinity;
  const base = Math.atan2(e.y - from.y, e.x - from.x);
  for (let i = 0; i < 16; i++) {
    const ang = base + i * Math.PI / 8;
    let reach = 0;
    for (let t = 10; t <= D; t += 10) { if (!mothCanFly(e.x + Math.cos(ang) * t, e.y + Math.sin(ang) * t)) break; reach = t; }
    const ex = e.x + Math.cos(ang) * reach, ey = e.y + Math.sin(ang) * reach;
    const score = reach * 1.5 + Math.hypot(ex - from.x, ey - from.y);
    if (score > bestScore) { bestScore = score; best = ang; }
  }
  return best ?? base;
}
// 往 (x, y) 飛（直線、不尋路；路線左右微微晃）。到了回傳 true
function mothFlyToward(e, x, y, dt, mul = 1) {
  const dx = x - e.x, dy = y - e.y, d = Math.hypot(dx, dy);
  if (d < 1) return true;
  const step = Math.min(d, e.speed * mul * dt);
  const ang = Math.atan2(dy, dx) + (d > 30 ? Math.sin(e.mo.phase * 1.7) * MOTH.wobble : 0);
  const nx = e.x + Math.cos(ang) * step, ny = e.y + Math.sin(ang) * step;
  if (mothCanFly(nx, ny) || !mothCanFly(e.x, e.y)) { e.x = nx; e.y = ny; }   // 已經在地圖外（例如被打飛出去）：先讓牠飛回來
  else if (mothCanFly(nx, e.y)) e.x = nx;
  else if (mothCanFly(e.x, ny)) e.y = ny;
  if (Math.abs(dx) > 4) e.faceRight = dx > 0;
  return d <= step + .5;
}

// ---- 目標：溫特、隊友（不用看得到，飛得過牆）----
function mothTargets(e) {
  const list = [], p = G.player;
  if (p && p.hp > 0) list.push(p);
  for (const t of G.towers) if (t.hp > 0 && !t.berserk && enemyNoticesSentry(e, t)) list.push(t);
  return list;
}
function mothPickTarget(e) {
  const C = MOTH, m = e.mo, dist = t => Math.hypot(t.x - e.x, t.y - e.y), targets = mothTargets(e);
  if ((e.playerAggroT || 0) > 0 && targets.includes(G.player) && dist(G.player) <= ENEMY_SENSE_RANGE) return G.player;
  if (e.sentryAggroT > 0 && targets.includes(e.sentryAggro) && dist(e.sentryAggro) <= ENEMY_SENSE_RANGE) return e.sentryAggro;
  if (m.target && targets.includes(m.target) && dist(m.target) <= C.loseRange * CELL) return m.target;
  let best = null, bestD = C.noticeRange * CELL;
  for (const t of targets) { const d = dist(t); if (d <= bestD) { best = t; bestD = d; } }
  return best;
}
// 會吸引牠的燈：露營燈、探照燈（data/balance.js 的 LIGHT.buildings）
function mothLamps() {
  const B = typeof LIGHT !== 'undefined' && LIGHT.buildings;
  return B ? G.obstacles.filter(o => o.hp > 0 && B[o.type]) : [];
}
function mothLampSpot(o) {   // 停在燈頭上：腳底座標放在燈的最下排，飛高一點對準燈頭
  return { x: OX + (o.c + (o.w || 1) / 2) * CELL, y: OY + (o.r + (o.h || 1)) * CELL - 2, lift: (o.h || 1) * CELL * .5 + 10 };
}

// ---- 行為（enemy-ai.js 的 stepEnemy 呼叫）----
function stepMothEnemy(e, dt) {
  const C = MOTH;
  if (!e.mo) {
    e.mo = { phase: Math.random() * 6, cd: 1 + Math.random() * 2, wait: Math.random() * 2, lift: C.height, orbit: Math.random() * Math.PI * 2 };
    e.flying = true;
  }
  const m = e.mo, f = e.frames || {};
  m.phase += dt;
  // 拍翅膀：停在燈上時拍得比較慢
  const wings = f.walkFront && f.walkFront.length ? f.walkFront : [f.front || e.sprite];
  m.flapT = (m.flapT || 0) + dt * C.flapFps * (m.perch ? .4 : 1);
  e.forceFrame = wings[Math.floor(m.flapT) % wings.length];
  const flapRound = Math.floor(m.flapT / Math.max(wings.length, Math.round(C.flapFps * C.sound.flapEvery)));   // 大約每 flapEvery 秒播一次拍翅膀聲，跟翅膀的圖對齊（停在燈上拍得慢、比較小聲）
  if (flapRound !== m.flapRound) { m.flapRound = flapRound; if (typeof sfxAt === 'function') sfxAt('mothFlap', e.x, e.y, C.sound.flap * (m.perch ? .5 : 1), 'moth-flap-' + (e.mothKey ||= Math.random().toString(36).slice(2, 7))); }
  e.forceFlip = !!e.faceRight;   // 原圖朝左
  const goalLift = m.perch ? mothLampSpot(m.perch).lift : C.height;
  m.lift += (goalLift - m.lift) * Math.min(1, dt * 3);
  e.slimeLift = Math.max(4, m.lift + Math.sin(m.phase * C.bobSpeed) * (m.perch ? 1.5 : C.bob));
  if (m.lastHp != null && e.hp < m.lastHp - .01) mothStartFlee(e, C.flee.hitTime);   // 被打到：逃跑
  m.lastHp = e.hp;
  if (e.stunT > 0) { m.spray = null; return; }   // 被麻醉、麻痺：停在空中
  if (!mothCanFly(e.x, e.y)) { const back = mothNearestFloor(e); if (back) { mothFlyToward(e, back[0], back[1], dt, MOTH.flee.speedMul); return; } }   // 跑到地圖外：先飛回最近的地板
  mothThink(e, dt);
}
function mothThink(e, dt) {
  const C = MOTH, m = e.mo, now = G.mothClock || 0;
  // 停在燈上休息：時間到、燈被拆了，就飛走（那盞燈一陣子內不再吸引牠）
  if (m.perch) {
    const o = m.perch;
    m.perchT -= dt;
    if (m.perchT <= 0 || o.hp <= 0 || !G.obstacles.includes(o)) { o.mothCdUntil = now + C.lure.cooldown; m.perch = null; }
    else { const s = mothLampSpot(o); mothFlyToward(e, s.x, s.y, dt, .5); return; }
  }
  // 逃跑：往遠離目標（沒有目標就是溫特）的方向飛，邊逃邊撒粉（不用預告；上一輪撒完要隔 flee.sprayCd 秒），在身後留下一串霧
  if (m.fleeT > 0) {
    m.fleeT -= dt;
    if (!m.spray && !(e.burnT > 0) && (G.mothClock || 0) - (m.sprayEndAt ?? -99) >= C.flee.sprayCd) m.spray = { kind: mothPick(MOTH_KINDS), phase: 'spray', t: 0, puff: 0 };   // 上一輪撒完至少隔 sprayCd 秒
    mothSpray(e, dt, false);
    const from = m.target && m.target.hp > 0 ? m.target : G.player;
    if (from) {
      const D = C.flee.dist * CELL;
      m.fleeReT = (m.fleeReT || 0) - dt;
      if (m.fleeAng == null || m.fleeReT <= 0) { m.fleeAng = mothFleeAngle(e, from, D); m.fleeReT = .4; }   // 每 0.4 秒重挑一次方向
      mothFlyToward(e, e.x + Math.cos(m.fleeAng) * D, e.y + Math.sin(m.fleeAng) * D, dt, C.flee.speedMul);
    }
    return;
  }
  // 趨光：附近有燈就先飛過去（就算正在追人也一樣，可以擺燈當誘餌）
  let lamp = null, lampD = C.lure.range * CELL;
  for (const o of mothLamps()) {
    if ((o.mothCdUntil || 0) > now) continue;
    const s = mothLampSpot(o), d = Math.hypot(s.x - e.x, s.y - e.y);
    if (d < lampD) { lamp = o; lampD = d; }
  }
  if (lamp) {
    m.spray = null;
    const s = mothLampSpot(lamp);
    if (mothFlyToward(e, s.x, s.y, dt)) { m.perch = lamp; m.perchT = C.lure.perch; }
    return;
  }
  const target = mothPickTarget(e);
  m.target = target;
  mothSpray(e, dt, !!target || !!e.frenzy);
  // 核心醒著：回去守核心（js/core-frenzy.js）；溫特貼得很近時照樣先繞著溫特飛
  const core = typeof frenzyCoreGoal === 'function' ? frenzyCoreGoal(e) : null;
  if (core && !(target && Math.hypot(target.x - e.x, target.y - e.y) <= CELL * 3)) { mothFlyToward(e, core.x, core.y, dt); return; }
  if (target) {   // 繞著目標慢慢飛，一邊撒粉
    m.orbit += dt * .6;
    const R = (C.hoverMin + (C.hoverMax - C.hoverMin) * (.5 + .5 * Math.sin(m.phase * .7))) * CELL;
    mothFlyToward(e, target.x + Math.cos(m.orbit) * R, target.y + Math.sin(m.orbit) * R * .6, dt);
    return;
  }
  // 沒事做：在附近慢慢飄
  if (m.spot) {
    if (mothFlyToward(e, m.spot[0], m.spot[1], dt, C.wanderSpeedMul)) { m.spot = null; m.wait = mothRand(C.idleMin, C.idleMax); }
    return;
  }
  m.wait -= dt;
  if (m.wait <= 0) {
    const [ec, er] = cellAt(e.x, e.y), floor = typeof mapFloorCells === 'function' ? mapFloorCells() : null;
    for (let i = 0; i < 10 && !m.spot; i++) {
      const c = ec + Math.round(mothRand(-C.wanderRadius, C.wanderRadius)), r = er + Math.round(mothRand(-C.wanderRadius, C.wanderRadius));
      if (inGrid(c, r) && !isWall(c, r) && (!floor || !floor.size || floor.has(c + ',' + r))) m.spot = center(c, r);
    }
    m.wait = mothRand(C.idleMin, C.idleMax);
  }
}
// 開始逃跑（停在燈上也會飛走）
function mothStartFlee(e, time) {
  const m = e.mo;
  if (!(m.fleeT > 0)) m.fleeAng = null;
  m.fleeT = Math.max(m.fleeT || 0, time);
  if (m.perch) { m.perch.mothCdUntil = (G.mothClock || 0) + MOTH.lure.cooldown; m.perch = null; }
  m.spot = null;
}
// 撒粉：冷卻好了就隨機選一種顏色 → 翅膀發光預告 → 一邊飛一邊撒
function mothSpray(e, dt, active) {
  const C = MOTH, m = e.mo;
  if (e.burnT > 0) { m.spray = null; return; }   // 身上著火：鱗粉都燒掉了，撒不出來
  if (m.spray) {
    const s = m.spray;
    s.t += dt;
    if (s.phase === 'tele') {
      if (s.t >= C.telegraph) { s.phase = 'spray'; s.t = 0; s.puff = 0; s.snd = 0; }
    } else {
      s.snd -= dt;   // 撒粉的沙沙聲：撒的時候一直接著播
      if (s.snd <= 0 && s.t < C.sprayTime - .4) { s.snd = C.sound.sprayEvery; if (typeof sfxAt === 'function') sfxAt('mothSpray', e.x, e.y, C.sound.spray, 'moth-spray-' + (e.mothKey ||= Math.random().toString(36).slice(2, 7))); }
      s.puff -= dt;
      if (s.puff <= 0) { s.puff = C.puffEvery; mothPuff(e.x + mothRand(-62, 62), e.y + mothRand(-24, 34), s.kind); }
      if (s.t >= C.sprayTime) {
        m.spray = null; m.cd = mothRand(C.cooldown[0], C.cooldown[1]); m.sprayEndAt = G.mothClock || 0;
        if (!(m.fleeT > 0) && m.target && Math.hypot(m.target.x - e.x, m.target.y - e.y) <= C.flee.nearRange * CELL) mothStartFlee(e, C.flee.afterSpray);   // 在目標身邊撒完：先逃開，等一下再回來
      }
    }
    return;
  }
  m.cd -= dt;
  if (active && m.cd <= 0) {
    m.spray = { kind: mothPick(MOTH_KINDS), phase: 'tele', t: 0 };
  }
}
// 落下一團鱗粉霧
function mothPuff(x, y, kind, big) {
  const C = MOTH.cloud, list = G.mothClouds = G.mothClouds || [];
  if (list.length >= C.max) list.shift();
  const a = Math.random() * Math.PI * 2, sp = C.drift * mothRand(.3, 1);
  list.push({ x, y, kind, r: C.r0 * (big ? 1.5 : 1), rMax: C.r1 * (big ? 1.35 : 1), age: 0, life: C.life * (big ? 1.3 : 1), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * .5, seed: Math.random() * 100 });
}
const mothCloudDensity = c => Math.min(1, c.age / .35) * Math.min(1, (c.life - c.age) / 1.5);

// ---- 每幀（game.js 的 update 呼叫）：鱗粉霧、吸入、中毒／混亂／睡眠、粉塵爆炸、測試生成 ----
function updateMoths(dt) {
  G.mothClock = (G.mothClock || 0) + dt;
  G.mothBoomCd = Math.max(0, (G.mothBoomCd || 0) - dt);
  const clouds = G.mothClouds || [];
  if (clouds.length) {
    const C = MOTH.cloud;
    for (const c of clouds) {
      c.age += dt;
      c.r = Math.min(c.rMax, c.r + (c.rMax - C.r0) / C.grow * dt);
      const nx = c.x + c.vx * dt, ny = c.y + c.vy * dt;
      if (mothCanFly(nx, ny)) { c.x = nx; c.y = ny; }
      c.vx *= Math.pow(.6, dt); c.vy *= Math.pow(.6, dt);
      if (c.fuse != null && (c.fuse -= dt) <= 0) mothBlast(c);
    }
    mothFireCheck(clouds);
    G.mothClouds = clouds.filter(c => !c.boom && c.age < c.life);
  }
  mothExposure(dt);
  mothStatuses(dt);
  mothTestSpawn();
}
// 火碰到鱗粉霧：點燃（照明彈、火海、著火的怪物；js/fish-head.js 的 fishFires）
function mothFireCheck(clouds) {
  if (typeof fishFires !== 'function') return;
  const fires = fishFires(null);
  if (!fires.length) return;
  for (const c of clouds) {
    if (c.fuse != null || c.boom) continue;
    if (fires.some(f => Math.hypot(c.x - f.x, (c.y - f.y) / .7) <= c.r + (f.r || 14))) mothIgnite(c);
  }
}
const mothCloudsTouch = (a, b) => Math.hypot(a.x - b.x, a.y - b.y) <= a.r + b.r + 6;
// 點燃：找出跟這團連在一起的霧，至少 blastMin 團才會炸；從點燃的那團開始一團接一團引爆，blastMul＝這一串的傷害倍率
function mothIgnite(c) {
  if (c.fuse != null || c.boom) return;
  const C = MOTH, pool = (G.mothClouds || []).filter(o => o.fuse == null && !o.boom), group = [c], depth = new Map([[c, 0]]);
  for (let i = 0; i < group.length; i++)
    for (const o of pool) if (!depth.has(o) && mothCloudsTouch(group[i], o)) { depth.set(o, depth.get(group[i]) + 1); group.push(o); }
  if (group.length < C.blastMin) return;   // 只有一團：太稀薄，燒不起來
  const mul = group.length >= C.bigBlastAt ? C.bigBlastMul : 1;
  for (const o of group) { o.fuse = depth.get(o) * C.blast.chainDelay; o.blastMul = mul; }
}
// 爆炸、火焰打到 (x, y) 半徑 r 內：碰到的鱗粉霧點燃（js/oil-barrels.js 的 igniteSlicksNear 呼叫，地雷、燃燒彈、希奧妮／安柏的攻擊也會經過那裡）
function mothIgniteNear(x, y, r = 0) {
  for (const c of G.mothClouds || []) if (Math.hypot(c.x - x, c.y - y) <= c.r + r) mothIgnite(c);
}
// 粉塵爆炸：一團霧炸開（連在一起的霧在 mothIgnite 已經排好引爆順序）
function mothBlast(c) {
  const B = MOTH.blast, x = c.x, y = c.y, R = Math.max(B.radius * CELL, c.r * .8), k = (mothCloudDensity(c) * .5 + .5) * (c.blastMul || 1);
  c.boom = true;
  if (G.mothBoomCd <= 0 && typeof sfxAt === 'function') { G.mothBoomCd = .12; G.mothBoomSerial = (G.mothBoomSerial || 0) + 1; sfxAt(c.blastMul > 1 ? 'midBoom' : 'smallBoom', x, y, .7, 'moth-boom-' + G.mothBoomSerial); }   // 大爆炸：比較大聲
  for (const e of G.enemies) {
    if (e.dead || e.hp <= 0) continue;
    const d = Math.hypot(e.x - x, e.y - y);
    if (d > R) continue;
    const hurt = B.enemy * k * (1 - .4 * d / R);
    e.hp -= hurt; e.hitT = .2; e.hitColor = '#ff9a3c';
    e.fireHitAt = performance.now() / 1000;   // 爆焰可以燒死生命體（js/lifeform.js）
    flashDmg('-' + Math.round(hurt), e.x, e.y - 26 - (e.slimeLift || 0), '#ff9a3c');
    if (typeof enemyHitReact === 'function') enemyHitReact(e, x, y, true);
  }
  for (const t of G.towers) {
    if (t.hp <= 0 || t.eatenBy) continue;
    const d = Math.hypot(t.x - x, t.y - y);
    if (d > R) continue;
    const hurt = B.sentry * k * (1 - .4 * d / R) * (1 - sentryDefense(t));
    t.hp = Math.max(0, t.hp - hurt);
    if (typeof blastPush === 'function') blastPush(t, x, y, hurt, 30);
    if (t.hp <= 0) { t.target = null; sentryStatus(t, '失去戰鬥能力', '#ff5b6e', true); }
  }
  const p = G.player;
  if (p && p.hp > 0 && Math.hypot(p.x - x, p.y - y) <= R) {
    const d = Math.hypot(p.x - x, p.y - y), raw = B.player * k * (1 - .4 * d / R);
    const hurt = typeof equipPlayerDamage === 'function' ? equipPlayerDamage(raw) : raw;
    p.hp = Math.max(0, p.hp - hurt); G.damageVignetteT = .5;
    if (typeof playPlayerHit === 'function') playPlayerHit();
    if (typeof blastPush === 'function') blastPush(p, x, y, hurt, 46);
    if (p.hp <= 0 && !G.over) { flash('部隊長失去戰鬥能力', p.x, p.y - 58, '#ff5b6e'); lose('player', '被粉塵爆炸波及'); }
  }
  // 連鎖：油桶被炸爆、油汙被點燃、生命體的碎塊被燒掉、順順宮帽被炸開
  if (typeof oilItem === 'function') for (const o of [...G.obstacles]) {
    if (!oilItem(o) || o.hp <= 0) continue;
    const oc = oilCenter(o);
    if (Math.hypot(oc.x - x, oc.y - y) <= R) damageOil(o, 9999, 'explosion');
  }
  if (typeof igniteSlicksNear === 'function') igniteSlicksNear(x, y, R);
  if (typeof burnLifePilesNear === 'function') burnLifePilesNear(x, y, R);
  if (typeof hitHangiCapsAt === 'function') hitHangiCapsAt(x, y, R);
  // 畫面：帶著鱗粉顏色的爆閃、衝擊環、火星
  const col = MOTH_COLORS[c.kind] || MOTH_COLORS.poison;
  if (typeof addLightFlash === 'function') addLightFlash('explosion', x, y, .6);
  G.effects.push({ fglow: true, x, y: y - 8, r0: 14, r1: R * 1.1, life: .35, life0: .35 });
  G.effects.push({ ring: true, x, y, r: 8, r2: R, life: .35, life0: .35, color: '#ff9a3c' });
  G.effects.push({ ring: true, x, y, r: 4, r2: R * .7, life: .3, life0: .3, color: col.glow });
  for (let i = 0; i < 12; i++) {
    const a = Math.random() * Math.PI * 2, sp = 70 + Math.random() * 120;
    G.effects.push({ ember: true, spark: true, x, y: y - 6, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * .6 - 30,
      r: 1.2 + Math.random() * 2.2, life: .3 + Math.random() * .3, life0: .6, color: Math.random() < .4 ? col.glow : undefined });
  }
  if (typeof spawnFlameBurst === 'function') spawnFlameBurst(x, y, .9);
  if (typeof pushBlackSmoke === 'function') for (let i = 0; i < 2; i++) pushBlackSmoke(x + mothRand(-R, R) * .3, y - 8, false);
  if (typeof nearbyImpact === 'function') nearbyImpact(x, y, 6, .03);
}

// ---- 吸入：站在霧裡量表慢慢漲，滿了就發作 ----
function mothExposure(dt) {
  const C = MOTH, clouds = G.mothClouds || [];
  const actors = [G.player, ...G.towers].filter(a => a && a.hp > 0 && !a.eatenBy);
  for (const a of actors) {
    if (!a.mothDose && !clouds.length) continue;
    const dose = a.mothDose = a.mothDose || { poison: 0, confuse: 0, sleep: 0 };
    const immune = a.mothImmune = a.mothImmune || { poison: 0, confuse: 0, sleep: 0 };
    const inside = { poison: 0, confuse: 0, sleep: 0 };
    for (const c of clouds) {
      if (c.boom) continue;
      const d = Math.hypot(a.x - c.x, (a.y - c.y) / .7);
      if (d < c.r) inside[c.kind] = Math.max(inside[c.kind], mothCloudDensity(c) * (1 - .5 * d / c.r));
    }
    for (const k of MOTH_KINDS) {
      if (immune[k] > 0 || (k === 'sleep' && a.mothSleep && a.sleepT > 0)) { immune[k] = Math.max(0, immune[k] - dt); dose[k] = 0; continue; }   // 睡著的人不會再吸到睡眠鱗粉
      if (inside[k] > 0) dose[k] += dt * inside[k] / C.doseTime;
      else dose[k] = Math.max(0, dose[k] - C.doseDecay * dt);
      if (dose[k] >= 1) { dose[k] = 0; immune[k] = C.immune; mothAfflict(a, k); }
    }
  }
}
// 發作：不跳說明文字，讓玩家自己從身上的記號、角色的反應發現效果
function mothAfflict(a, kind) {
  const C = MOTH, isPlayer = a === G.player;
  if (kind === 'poison') {
    a.mothPoisonT = C.poison.time; a.mothPoisonTick = C.poison.tick;
  } else if (kind === 'confuse') {
    a.mothConfuseT = C.confuse.time;
    if (!isPlayer) { a.target = null; a.meleeSwing = null; a.gunSwing = null; a.navPath = null; a.navGoal = null; }
  } else {
    const already = a.mothSleep && a.sleepT > 0;   // 已經睡著：只延長時間，不要重播倒下動畫
    a.sleepT = Math.max(a.sleepT || 0, C.sleep.time); a.mothSleep = true; a.mothSleepHp = a.hp;
    if (already) return;
    a.mothSleepAge = 0; a.mothWakeT = 0; a.mothFallSide = Math.random() < .5 ? -1 : 1;
    a.moving = false;
    if (!isPlayer) { a.target = null; a.meleeSwing = null; a.gunSwing = null; a.navPath = null; a.navGoal = null; a.say = null; }   // 睡著：頭上的對話泡泡收掉
    else { a.anim = 0; a.dashT = 0; a.gunT = 0; mothDropBuildSelection(); }
  }
}
// 溫特睡著：手上拿著的建築、拆除模式放掉（js/build.js）
function mothDropBuildSelection() {
  if (G.selType && (G.selType.startsWith('build:') || G.selType === 'demolish') && typeof closeBuildMenu === 'function') closeBuildMenu();
}
// 中毒扣血、混亂倒數、睡眠（被打到就醒）
function mothStatuses(dt) {
  const C = MOTH, p = G.player;
  for (const a of [p, ...G.towers]) {
    if (!a) continue;
    const isPlayer = a === p;
    if (a.mothWakeT > 0) a.mothWakeT -= dt;
    if (a.mothConfuseT > 0) a.mothConfuseT = a.hp > 0 ? a.mothConfuseT - dt : 0;
    if (a.mothPoisonT > 0) {
      if (a.hp <= 0) { a.mothPoisonT = 0; continue; }
      a.mothPoisonT -= dt; a.mothPoisonTick -= dt;
      if (a.mothPoisonTick <= 0) {
        a.mothPoisonTick += C.poison.tick;
        const dmg = C.poison.dmg;
        a.hp = Math.max(0, a.hp - dmg);
        if (a.mothSleepHp != null) a.mothSleepHp = a.hp;   // 毒不會把睡著的人弄醒
        flashDmg('-' + dmg, a.x + 12, a.y - 40, MOTH_COLORS.poison.glow, { small: true });
        if (a.hp <= 0) {
          if (isPlayer && !G.over) { flash('部隊長失去戰鬥能力', a.x, a.y - 58, '#ff5b6e'); lose('player', '中了人面蝶的毒'); }
          else if (!isPlayer) { a.target = null; sentryStatus(a, '失去戰鬥能力', '#ff5b6e', true); }
        }
      }
    }
    // 睡眠：被打到（血變少）就醒；隊員的 sleepT 由 game.js 倒數，溫特的在這裡倒數
    if (a.mothSleep) {
      if (a.hp <= 0) { a.mothSleep = false; a.mothSleepHp = null; if (isPlayer) a.sleepT = 0; continue; }
      a.mothSleepAge = (a.mothSleepAge || 0) + dt;
      if (a.sleepT > 0 && a.hp < a.mothSleepHp - .01) a.sleepT = 0;   // 被打醒
      else {
        a.mothSleepHp = a.hp;
        if (isPlayer) a.sleepT = Math.max(0, a.sleepT - dt);
      }
      if (!(a.sleepT > 0)) mothWake(a);
    }
  }
  if (document.body) document.body.classList.toggle('moth-asleep', !!(p && p.mothSleep && p.sleepT > 0));   // 溫特睡著：建築欄、快捷欄不能點
}
// ---- 開槍把睡著的隊友打醒（js/game.js 的 updatePlayerAttack 呼叫）：不扣血，子彈打在身上就醒 ----
// 游標點在哪位睡著的隊友身上：站著時是一個人高的範圍；倒在地上時身體橫躺在腳底往旁邊那一側
function mothSleepMateAt(x, y) {
  return G.towers.find(t => {
    if (!(t.mothSleep && t.sleepT > 0) || t.hp <= 0 || t.eatenBy || t.grabbed) return false;
    const pose = mothSleepPose(t);
    if (pose && pose.lying) { const side = t.mothFallSide || 1, x0 = Math.min(t.x, t.x + side * 58), x1 = Math.max(t.x, t.x + side * 58); return x >= x0 - 6 && x <= x1 + 6 && Math.abs(y - (t.y + 6)) <= 22; }
    return Math.abs(x - t.x) <= 20 && y >= t.y - 44 && y <= t.y + 18;
  }) || null;
}
// 打得到：手槍射程內、看得到（跟射斷絲瓜藤同一套，js/loofah-lady.js 的 canHelpFree）
function mothSleepShotTarget(aim) {
  const t = mothSleepMateAt(aim.x, aim.y);
  return t && (typeof canHelpFree !== 'function' || canHelpFree(t)) ? t : null;
}
function shootWakeMate(p, t, aim, aimAng) {   // 彈匣已經在 game.js 扣過了
  const { x: mx, y: my } = gunMuzzleAt(p, aimAng);
  G.effects.push({ muzzle: true, x: mx, y: my, ang: aimAng, life: .07, life0: .07 });   // 槍口閃光
  addLightFlash('muzzle', mx, my);
  spawnShellCasing(mx, my, aimAng);
  G.effects.push({ bullet: true, x1: mx, y1: my, x2: aim.x, y2: aim.y, life: .07, life0: .07, color: '#ffe79a' });   // 子彈曳光
  G.effects.push({ ring: true, x: aim.x, y: aim.y, r: 2, r2: 12, life: .18, life0: .18, color: MOTH_COLORS.sleep.glow });
  sfx('shotPistol');
  t.hitT = Math.max(t.hitT || 0, .2);   // 閃一下
  mothWake(t);
  if (p.ammo <= 0) startReload(p);   // 打完最後一發→自動裝填
  else if (PLAYER_ATK.double && Math.random() < PLAYER_ATK.double) p.atkCd = .07;   // 快速射擊（手槍 Lv3 起）
}
// 醒來：先張大眼睛驚醒，再半閉著眼慢慢爬起來（還沒倒下的：驚一下、半閉眼回神）；這段時間不能動、不能攻擊
function mothWake(a) {
  const A = MOTH_SLEEP_ANIM, fallen = (a.mothSleepAge || 0) > A.sway + A.close;
  a.mothSleep = false; a.mothSleepHp = null; a.sleepT = 0;
  a.mothWakeFell = fallen;
  a.mothWakeLen = a.mothWakeT = fallen ? A.startle + A.rise + A.settle : A.standStartle + A.standDaze;
}

// ---- 睡著的動畫：左右搖晃、眼睛半閉 → 眼睛閉上 → 側身倒在地上（轉 90 度）→ 頭上飄 Zzz；醒來時爬起來 ----
const MOTH_SLEEP_ANIM = { sway: 1.2, close: .45, fall: .35,   // 睡著：搖晃、閉眼、倒下各幾秒
  startle: .35, rise: .9, settle: .3,                           // 倒在地上被叫醒：張眼驚醒、半閉眼慢慢爬起來、站好晃一下
  hop: 12, hopTime: .22,                                        // 驚醒時往上彈多高（像素）、彈一下花幾秒
  standStartle: .3, standDaze: .4 };                            // 還沒倒下就被叫醒：驚一下、半閉眼回神
function mothSleepPose(a) {
  const A = MOTH_SLEEP_ANIM, side = a.mothFallSide || 1;
  if (a.mothSleep && a.sleepT > 0) {
    const t = a.mothSleepAge || 0;
    if (t < A.sway) return { angle: Math.sin(t * 7) * .13 * Math.min(1, t / .25), eyes: 1 };   // 搖搖晃晃、眼睛半閉
    if (t < A.sway + A.close) { const u = (t - A.sway) / A.close; return { angle: Math.sin(t * 7) * .13 * (1 - u), eyes: 2 }; }   // 眼睛閉上、慢慢站穩
    const u = Math.min(1, (t - A.sway - A.close) / A.fall);
    return { angle: side * Math.PI / 2 * u * u, eyes: 2, lying: u >= 1, lift: u };   // 往旁邊倒下
  }
  if (a.mothWakeT > 0) {
    const w = (a.mothWakeLen || 0) - a.mothWakeT;
    if (!a.mothWakeFell) {
      if (w < A.standStartle) { const k = Math.sin(w / A.standStartle * Math.PI); return { angle: 0, eyes: 0, lift: k * .6 }; }   // 驚一下：眼睛張開、身體一跳
      return { angle: Math.sin(w * 6) * .04, eyes: 1 };   // 半閉眼回神
    }
    if (w < A.startle) {   // 還躺著，眼睛突然張開、整個人往上（畫面的上方）彈一下再落回地上；身體不轉，不然躺著時會像往旁邊彈
      const k = w < A.hopTime ? Math.sin(w / A.hopTime * Math.PI) : 0;
      return { angle: side * Math.PI / 2, eyes: 0, lift: 1, hop: k * A.hop, lying: true };
    }
    if (w < A.startle + A.rise) {   // 半閉著眼，慢慢撐起來
      const u = (w - A.startle) / A.rise, e = u * u * (3 - 2 * u);
      return { angle: side * Math.PI / 2 * (1 - e), eyes: 1, lift: 1 - e };
    }
    const v = Math.min(1, (w - A.startle - A.rise) / A.settle);   // 站起來後還有點迷糊，輕輕晃一下
    return { angle: Math.sin(v * Math.PI * 2) * .06 * (1 - v), eyes: 1 };
  }
  return null;
}
// game.js 的 pickCharacterFrame 呼叫：睡著時用正面的半閉眼／閉眼圖
function mothSleepFrame(set, who) {
  const pose = (who.mothSleep || who.mothWakeT > 0) && mothSleepPose(who), img = pose && set.blink && set.blink[pose.eyes];
  return img && img.complete && img.naturalWidth ? img : null;
}
// render.js 畫溫特、隊員之前呼叫：以腳底為軸搖晃、倒下
function applyMothSleepTransform(ctx, a) {
  const pose = (a.mothSleep || a.mothWakeT > 0) && mothSleepPose(a);
  if (!pose) return;
  const fx = a.x, fy = a.y + 18;   // 腳底（溫特、隊員的圖都畫在 y - size + 18 ～ y + 18）
  ctx.translate(fx, fy - (pose.lift || 0) * 8 - (pose.hop || 0)); ctx.rotate(pose.angle); ctx.translate(-fx, -fy);   // 先往畫面上方移、再轉：彈起來永遠是往上
}
// 溫特睡著時：建築欄、建築清單、下方快捷欄變暗、不能點
(() => {
  const st = document.createElement('style');
  st.textContent = 'body.moth-asleep #buildToolbar, body.moth-asleep #buildbar, body.moth-asleep #quickSupplies { pointer-events: none; opacity: .45; filter: grayscale(.8); }';
  document.head.appendChild(st);
})();

// ---- 溫特混亂時開槍：八成打偏（game.js 的手槍、js/special-guns.js 的特殊子彈呼叫）----
function mothPlayerMisses(p) { return !!(p && p === G.player && p.mothConfuseT > 0 && Math.random() < MOTH.confuse.playerMiss); }
// 手槍打偏：子彈往旁邊亂飛，回傳落點
function mothWildShot(p, aimAng) {
  if (!mothPlayerMisses(p)) return null;
  const ang = aimAng + (Math.random() < .5 ? -1 : 1) * mothRand(.35, .9), R = PLAYER_ATK.range * CELL * mothRand(.4, 1);
  flashDmg('MISS', p.x + Math.cos(aimAng) * 60, p.y + Math.sin(aimAng) * 60 - 20, '#c98bff');
  return { x: p.x + Math.cos(ang) * R, y: p.y + Math.sin(ang) * R };
}
// 混亂的隊員：改打身邊的隊友和溫特（走過去打；跟暴走一樣用 applyChaosDamage，但不打怪物、基地、核心）
function mothConfusedSentry(t, spec, dt) {
  let best = null, bestD = Infinity;
  const consider = o => { const d = Math.hypot(o.x - t.x, o.y - t.y); if (d < bestD) { bestD = d; best = { o, x: o.x, y: o.y }; } };
  for (const o of G.towers) if (o !== t && o.hp > 0 && !o.eatenBy && !o.grabbed) consider(o);
  if (G.player && G.player.hp > 0) consider(G.player);
  if (!best) { animateSentry(t, 0, 0, dt); return; }
  const range = spec.range * CELL;
  if (bestD > range * .9 || !hasLineOfSight(t.x, t.y, best.x, best.y)) {
    const sp = (spec.walkSpeed || 80) * dt, dx = best.x - t.x, dy = best.y - t.y, d = bestD || 1;
    const nx = t.x + dx / d * sp, ny = t.y + dy / d * sp, [cc, cr] = cellAt(nx, ny), ox = t.x, oy = t.y;
    if (sentryCellWalkable(cc, cr)) { t.x = nx; t.y = ny; }
    else if (sentryCellWalkable(cellAt(nx, t.y)[0], cellAt(t.x, t.y)[1])) t.x = nx;
    else if (sentryCellWalkable(cellAt(t.x, t.y)[0], cellAt(t.x, ny)[1])) t.y = ny;
    t.anim = t.mothWalkAnim || 0;   // game.js 前面的 animateSentry 每幀會把 anim 歸零（那時還沒走），所以自己記著
    animateSentry(t, t.x - ox, t.y - oy, dt);   // 走路動畫（跟平常走路一樣用實際移動的距離）
    t.mothWalkAnim = t.moving ? t.anim : 0;
    if (!t.moving) t.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'back' : 'front');   // 卡住時還是面向目標
  } else {
    animateSentry(t, 0, 0, dt); t.mothWalkAnim = 0;
    t.dir = Math.abs(best.x - t.x) > Math.abs(best.y - t.y) ? (best.x < t.x ? 'left' : 'right') : (best.y < t.y ? 'back' : 'front');
    if (t.cd <= 0) {
      t.cd = 1 / (spec.rate * (1 + sortieBuff(t, 'spd')));
      applyChaosDamage(t, best, spec);
      mothConfusedSay(t, best.o);
    }
  }
  if (t.mothLineCd > 0) t.mothLineCd -= dt;
}
// 混亂時打到自己人：喊一句（對話編輯器「混亂時打到自己人」，{name}＝被打的人）；正在說被吞、倒下這種更重要的話就不蓋掉
function mothConfusedSay(t, victim) {
  if (t.mothLineCd > 0 || t.hp <= 0 || (t.say && t.say.text && (t.say.hurt || 0) >= 3)) return;
  const line = pickLine(dialogueLines(t.type, 'confusedAttack') || [], 'x', t);
  if (!line) return;
  const name = victim === G.player ? '部隊長' : (TYPES[victim.type] && TYPES[victim.type].name) || '';
  t.say = { text: line.replace(/\{name\}/g, name), life: 2.6, hurt: 2 };
  t.sayWait = Math.max(t.sayWait || 0, 4);
  t.mothLineCd = MOTH.confuse.lineGap;
}
// 近戰隊員打飛在空中的人面蝶：有 meleeMiss 的機率打不到
const MOTH_MELEE_TYPES = new Set(['red', 'luther', 'avaren', 'colyn']);
function mothDodgesMelee(t, target) {
  return !!(target && target.behavior === 'moth' && MOTH_MELEE_TYPES.has(t.type) && Math.random() < MOTH.meleeMiss);
}

// ---- 死掉：炸出一大團鱗粉，屍體從空中掉下來、化成灰（沿用珍珠小童的 drop 屍體，js/pearl-kid.js）----
function mothDeathBurst(e) {
  const kind = (e.mo && e.mo.spray && e.mo.spray.kind) || mothPick(MOTH_KINDS);
  mothPuff(e.x, e.y + 4, kind, true);
  for (let i = 0; i < MOTH.deathPuffs - 1; i++) {
    const a = i / (MOTH.deathPuffs - 1) * Math.PI * 2;
    mothPuff(e.x + Math.cos(a) * 96, e.y + 4 + Math.sin(a) * 53, kind, true);
  }
  const f = e.frames || {};
  (G.fxCorpses = G.fxCorpses || []).push({ drop: true, noBits: true, img: monsterImage(f.front || e.sprite), x: e.x, y: e.y, z: e.slimeLift || 0, vz: 0,
    w: e.drawWidth || 163, h: e.drawHeight || 125, t: 0, life: DISSOLVE.start + DISSOLVE.spread + DISSOLVE.life + .05 });
}

// ---- 測試用：進戰鬥地圖時在營地右邊 testCampDist 格放一隻 ----
function mothTestSpawn() {
  const C = MOTH;
  if (!C.testSpawn || G.mothTestDone || MAP_SAFE || !G.running || G.over || !G.player
    || (typeof MONSTER_PREVIEW_ID !== 'undefined' && MONSTER_PREVIEW_ID) || (typeof practiceOn === 'function' && practiceOn())) return;
  G.mothTestDone = true;
  const spec = ACTIVE_MONSTERS.find(m => m.id === 'human_face_butterfly'); if (!spec) return;
  if (G.enemies.some(o => o.type === spec.id && o.hp > 0)) return;   // 讀回戰場進度時已經有了
  let gx = G.player.x + C.testCampDist * CELL, gy = G.player.y;
  if (campCells.size) {
    const cells = [...campCells].map(k => k.split(',').map(Number));
    gx = OX + (Math.max(...cells.map(([c]) => c)) + 1 + C.testCampDist) * CELL;
    gy = OY + (cells.reduce((s, [, r]) => s + r, 0) / cells.length + .5) * CELL;
  }
  const floor = typeof mapFloorCells === 'function' ? mapFloorCells() : null, [gc, gr] = cellAt(gx, gy);
  let best = null, bestD = Infinity;
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {   // 找最近一格能站的地板
    if (isWall(c, r) || enemyBarrierAt(c, r) || (floor && floor.size && !floor.has(c + ',' + r))) continue;
    const d = Math.hypot(c - gc, r - gr);
    if (d < bestD) { bestD = d; best = center(c, r); }
  }
  if (!best) return;
  G.enemies.push(createMonster(spec, best[0], best[1]));
  if (typeof systemNotice === 'function') systemNotice('🦋 人面蝶出現在營地右邊約 ' + C.testCampDist + ' 格的地方。');
}

// ---- 畫面 ----
// 鱗粉霧（render.js 在角色上層呼叫）：幾團柔和的彩色霧，裡面有閃閃的鱗粉
function drawMothClouds(ctx) {
  const clouds = G.mothClouds;
  if (!clouds || !clouds.length) return;
  const now = performance.now() / 1000;
  ctx.save();
  for (const c of clouds) {
    if (c.boom || !isVisible(c.x, c.y)) continue;
    const k = mothCloudDensity(c), [r, g, b] = MOTH_COLORS[c.kind].rgb, burning = c.fuse != null;
    for (let i = 0; i < 3; i++) {   // 三團錯開的霧疊在一起，比較不像一個圓
      const a = c.seed + i * 2.1 + now * .3, ox = Math.cos(a) * c.r * .28, oy = Math.sin(a) * c.r * .14, R = c.r * (.75 + .12 * i);
      const gr = ctx.createRadialGradient(c.x + ox, c.y + oy - 6, 0, c.x + ox, c.y + oy - 6, R);
      gr.addColorStop(0, `rgba(${r},${g},${b},${(.3 * k).toFixed(3)})`); gr.addColorStop(.6, `rgba(${r},${g},${b},${(.16 * k).toFixed(3)})`); gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = gr; ctx.beginPath(); ctx.ellipse(c.x + ox, c.y + oy - 6, R, R * .72, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = burning ? '#ffcf7a' : `rgb(${Math.min(255, r + 70)},${Math.min(255, g + 70)},${Math.min(255, b + 70)})`;   // 飄浮的鱗粉亮點
    for (let i = 0; i < 6; i++) {
      const t = (now * .35 + i / 6 + c.seed) % 1, a = c.seed * 7 + i * 1.9;
      ctx.globalAlpha = k * Math.sin(t * Math.PI) * .9;
      ctx.fillRect(Math.round(c.x + Math.cos(a) * c.r * .6), Math.round(c.y - 4 + Math.sin(a) * c.r * .35 - t * 14), 2, 2);
    }
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}
// 黑幕上面（render.js 呼叫）：暗處的霧微微發光、翅膀預告光、吸入量表、中毒／混亂記號、溫特睡著的 Zzz
function drawMothOverlay(ctx) {
  const now = performance.now() / 1000;
  ctx.save();
  for (const c of G.mothClouds || []) {   // 暗處也看得到淡淡的鱗粉光
    if (c.boom || isVisible(c.x, c.y)) continue;
    const k = mothCloudDensity(c), [r, g, b] = MOTH_COLORS[c.kind].rgb;
    const gr = ctx.createRadialGradient(c.x, c.y - 6, 0, c.x, c.y - 6, c.r);
    gr.addColorStop(0, `rgba(${r},${g},${b},${(.16 * k).toFixed(3)})`); gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = gr; ctx.beginPath(); ctx.ellipse(c.x, c.y - 6, c.r, c.r * .72, 0, 0, Math.PI * 2); ctx.fill();
  }
  for (const e of G.enemies) {   // 翅膀發光：預告時越來越亮，撒粉時一閃一閃
    const s = e.mo && e.mo.spray;
    if (!s || e.dead || e.hp <= 0) continue;
    const col = MOTH_COLORS[s.kind].rgb, k = s.phase === 'tele' ? Math.min(1, s.t / MOTH.telegraph) : .55 + .25 * Math.sin(now * 12);
    const cx = e.x, cy = e.y + 13 - (e.slimeLift || 0) - (e.drawHeight || 125) * .5, R = (e.drawWidth || 163) * .62;
    ctx.globalCompositeOperation = 'lighter';
    const gr = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
    gr.addColorStop(0, `rgba(${col},${(.55 * k).toFixed(3)})`); gr.addColorStop(1, `rgba(${col},0)`);
    ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }
  const p = G.player;
  for (const a of [p, ...G.towers]) {
    if (!a || a.hp <= 0) continue;
    const top = a.y - (a === p ? 66 : 56);
    // 吸入量表：每種顏色一條
    let row = 0;
    for (const k of MOTH_KINDS) {
      const v = a.mothDose && a.mothDose[k];
      if (!(v > .02)) continue;
      const y = top - row * 5, [r, g, b] = MOTH_COLORS[k].rgb;
      ctx.globalAlpha = .85; ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(a.x - 14, y, 28, 4);
      ctx.fillStyle = `rgb(${r},${g},${b})`; ctx.fillRect(a.x - 13, y + 1, 26 * Math.min(1, v), 2);
      row++;
    }
    ctx.globalAlpha = 1;
    if (a.mothPoisonT > 0) {   // 中毒：身上冒綠色泡泡
      ctx.fillStyle = MOTH_COLORS.poison.glow;
      for (let i = 0; i < 3; i++) {
        const t = (now * .9 + i / 3) % 1;
        ctx.globalAlpha = Math.sin(t * Math.PI) * .8;
        ctx.beginPath(); ctx.arc(a.x - 8 + i * 8, a.y - 20 - t * 22, 2 + i * .6, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    if (a.mothConfuseT > 0) {   // 混亂：頭上轉圈的紫色「？」
      ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(12,20,40,.85)'; ctx.fillStyle = MOTH_COLORS.confuse.glow;
      for (let i = 0; i < 3; i++) {   // 深色外框：跟 Zzz 一樣，淺色地板上也看得清楚
        const ang = now * 4 + i * Math.PI * 2 / 3, qx = a.x + Math.cos(ang) * 13, qy = top - 3 + Math.sin(ang) * 4;
        ctx.strokeText('?', qx, qy); ctx.fillText('?', qx, qy);
      }
    }
  }
  for (const a of [p, ...G.towers]) {   // 睡著倒在地上：頭那一側飄 Zzz（隊員的 Zzz 交給 js/special-guns.js 的 drawSleepMarks，倒下後才改畫這裡）
    const pose = a && a.hp > 0 && a.mothSleep && a.sleepT > 0 && mothSleepPose(a);
    if (!pose || !pose.lying) continue;
    const hx = a.x + (a.mothFallSide || 1) * 40, hy = a.y - 2;
    ctx.textAlign = 'center';
    for (let i = 0; i < 3; i++) {
      const k = (now * .8 + i / 3) % 1;
      const zx = hx + k * 10 + i * 4, zy = hy - 10 - k * 18 - i * 3;
      ctx.globalAlpha = Math.sin(k * Math.PI) * .95; ctx.font = 'bold ' + (12 + i * 3) + 'px sans-serif'; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(12,20,40,.85)';
      ctx.strokeText('z', zx, zy); ctx.fillStyle = MOTH_COLORS.sleep.glow; ctx.fillText('z', zx, zy);   // 深色外框：淺色地板上也看得清楚
    }
    ctx.globalAlpha = 1;
  }
  if (p && p.mothSleep && p.sleepT > 0 && p.hp > 0) {   // 溫特睡著：畫面四周變暗
    const R = 520, gr = ctx.createRadialGradient(p.x, p.y, 120, p.x, p.y, R);
    gr.addColorStop(0, 'rgba(10,16,40,0)'); gr.addColorStop(1, 'rgba(10,16,40,.6)');
    ctx.fillStyle = gr; ctx.fillRect(p.x - R * 2, p.y - R * 2, R * 4, R * 4);
  }
  ctx.restore();
}
