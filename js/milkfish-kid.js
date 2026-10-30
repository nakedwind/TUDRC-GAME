/* ===== 虱目魚小子（behavior: "milkfish"）＆小虱目魚小子（behavior: "milkfishSmall"）=====
   虱目魚小子：
   ・攻擊方式是「吃隊友」：看到哨兵或嚮導就鎖定一個受害者，一直追到吃到、他倒下或跑太遠才換人；
     靠近到 MILKFISH.chargeRange 格內就高速衝過去（走路圖），一貼近就張嘴（攻擊圖）一口吞下；張嘴後被打暈也會咬完這一口。
   ・不會吞溫特（玩家），但會咬他：被玩家射擊或沒有隊友目標且玩家進入 4 格時短暫追擊，最多 4 秒。
     拉開 8 格或遮住視線 1.5 秒會脫離；對玩家衝刺 3 秒後喘氣 1.5 秒。嘴裡含著人時只顧著逃。
   ・吞下後逃離現場約 MILKFISH.fleeDist 格（盡量往離溫特遠的方向），到了才慢慢晃。
   ・被吃的隊友卡在頭上的魚嘴裡（只露出兩隻腳在踢），不能動、不能攻擊，每 MILKFISH.digestEvery 秒扣一次血
     （扣多少＝怪物編輯器的「哨兵傷害」）。一次只能含一個人。
   ・要把虱目魚小子打死才能把人救出來；被消化到 HP 歸零的人會被吐出來（倒下）。
   ・平常也會吃掉一格大的物品：玩家蓋的建築（露營燈、探照燈…）、地圖上一格大的可破壞物（油箱、爐具、箱子…）。
     基地、礦石、地雷、鐵門、比一格大的東西不吃。被吃掉的油桶／瓦斯爐不會漏油或爆炸。
   小虱目魚小子：比較弱的小隻版，不吃隊友，只會到處吃一格的物品。
   被吃的隊友：留在 G.towers 裡（隊員列表照常顯示），用 t.eatenBy 標記：
     不會被怪物鎖定（enemy-ai.js 的 enemyNoticesSentry）、不移動（sentry.js 的 updateSentry）、
     不攻擊（game.js 的哨兵攻擊）、不畫本人（render.js 的 drawTower，改由 drawEnemy 在魚嘴畫腳）。
   必須在 enemy-ai.js 之後、game.js 之前載入。數值在下面的 MILKFISH。
*/
const MILKFISH = {
  noticeRange: 12,        // 看到隊友的距離（格）；玩家另用 playerNoticeRange
  loseRange: 16,          // 追多遠就放棄（格）
  eatReach: 42,           // 離隊友幾像素內可以吃
  windup: 0.25,           // 貼近後張嘴到吞下的時間（秒）：這段時間隊友跑掉就吃不到
  chargeRange: 6,         // 鎖定的受害者在幾格內、中間沒擋住，就衝過去（走路圖，跑得很快）
  chargeSpeedMul: 4,      // 衝刺速度是平常走路的幾倍
  chargeDustEvery: 0.07,  // 衝刺時每幾秒揚起一團灰塵
  playerReach: 46,        // 溫特在幾像素內就咬他（只扣血，不會吞；扣多少＝怪物編輯器的「玩家傷害」）
  playerWindup: 0.5,      // 咬溫特的前搖，留時間閃避
  playerHitReach: 64,     // 前搖結束時溫特還在幾像素內才咬得到
  playerCooldown: 1.2,    // 兩次咬溫特之間隔幾秒
  playerNoticeRange: 4, playerLoseRange: 8,
  playerChaseTime: 4, playerLostSightTime: 1.5,
  playerChargeTime: 3, playerChargeRest: 1.5,
  playerMissRest: 1, playerReacquireDelay: 1.5,
  gulpReach: 70,          // 張嘴結束時，隊友還在幾像素內就吃到
  missCooldown: 0.3,      // 撲空（隊友跑掉）後隔幾秒再撲；鎖定的人不變
  digestEvery: 5,         // 被吃的隊友每幾秒扣一次血
  eatCooldown: 1.5,       // 吐出隊友或吃完東西後，隔幾秒才會再吃
  itemSense: 6,           // 幾格內看到一格大的物品就會去吃
  itemReach: 1.25,        // 離物品中心幾格內可以吃
  chewTime: 0.9,          // 吃物品要嚼多久（秒）
  chewFps: 7,             // 嚼的時候笑臉圖換幾次／秒
  biteTime: 0.3,          // 吃物品時先撲咬（攻擊圖）多久，再換笑臉圖嚼
  fullSpeedMul: 0.8,      // 嘴裡含著人、逃到定點之後，慢慢晃的速度
  fleeDist: 10,           // 吞下隊友後逃離現場幾格（盡量往離溫特遠的方向）
  fleeSpeedMul: 1.6,      // 逃跑速度是平常走路的幾倍
  fleeMaxTime: 8,         // 最多逃幾秒（被卡住就不跑了）
  legsFps: 6,             // 嘴裡的腳踢動畫速度（張／秒）
  mouthRow: 21,           // 魚嘴開口在圖片的第幾排（腳的圖片下緣對齊這裡；圖片高 120）
  wanderRadius: 2.5, wanderSpeedMul: 0.55, idleMin: 1.5, idleMax: 3.5,
};
const MILKFISH_ART = 'images/monster/milkfish-kid/milkfish-kid-';
const MILKFISH_SMALL_ART = 'images/monster/milkfish-kid-small/milkfish-kid-small-';
// 嘴裡露出的腳：哨兵、嚮導各三張（踢腳動畫）
const MILKFISH_LEGS = {
  sentry: [1, 2, 3].map(i => MILKFISH_ART + 'legs-sentry-0' + i + '.png'),
  guide: [1, 2, 3].map(i => MILKFISH_ART + 'legs-guide-0' + i + '.png'),
};
const mfRand = (a, b) => a + Math.random() * (b - a);
const mfArt = e => e.behavior === 'milkfishSmall' ? MILKFISH_SMALL_ART : MILKFISH_ART;
// 指定這一幀用哪張動作圖（js/render.js 的 monsterWalkFrame 讀 forceFrame／forceFlip／forceAttack）
// 攻擊圖（attack）：尺寸跟站姿圖不同，用原本的像素比例畫、腳底中央對齊；原圖朝左，目標在右邊就左右翻
function mfPose(e, name, towardX) {
  if (!name) { e.forceFrame = null; e.forceFlip = false; e.forceAttack = false; return; }
  e.forceFrame = mfArt(e) + name + '.png';
  e.forceAttack = name === 'attack';
  e.forceFlip = e.forceAttack && towardX != null && towardX > e.x;
}
const mfIsSmall = e => e.behavior === 'milkfishSmall';

// 咬玩家前的藍色眼光：與鳥頭人一樣畫在黑幕上方，跟隨攻擊圖左右翻轉。
function drawMilkfishEyeFlashes(context) {
  for (const e of G.enemies) {
    if (e.behavior !== 'milkfish' || e.dead || e.hp <= 0 || e.stunT > 0 || !(e.mf?.pwindup > 0)) continue;
    const front = monsterImage(e.frames?.front || e.sprite), attack = monsterImage(MILKFISH_ART + 'attack.png');
    if (!front.naturalWidth || !front.naturalHeight || !attack.naturalWidth || !attack.naturalHeight) continue;
    const squash = (e.hitSquashT || 0) / .16;
    const sx = (e.drawWidth || 110) * (1 + .22 * squash) / front.naturalWidth;
    const sy = (e.drawHeight || 132) * (1 - .2 * squash) / front.naturalHeight;
    const x = e.x + (e.forceFlip ? -1 : 1) * (25 - attack.naturalWidth / 2) * sx;
    const y = e.y + 13 - (e.slimeLift || 0) - (attack.naturalHeight - 34) * sy;
    const t = 1 - e.mf.pwindup / MILKFISH.playerWindup;
    const k = t < EYE_FLASH.rise ? Math.max(0, t) / EYE_FLASH.rise : Math.pow(Math.max(0, 1 - (t - EYE_FLASH.rise) / (1 - EYE_FLASH.rise)), 1.5);
    const [r, g, b] = EYE_FLASH.color, radius = EYE_FLASH.radius * (.55 + .45 * k);
    context.save(); context.globalCompositeOperation = 'lighter';
    const grad = context.createRadialGradient(x, y, 0, x, y, radius);
    grad.addColorStop(0, `rgba(225,245,255,${.95 * k})`);
    grad.addColorStop(.3, `rgba(${r},${g},${b},${.75 * k})`);
    grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
    context.fillStyle = grad; context.beginPath(); context.arc(x, y, radius, 0, Math.PI * 2); context.fill();
    context.fillStyle = `rgba(200,236,255,${.85 * k})`;
    context.fillRect(x - 13 * k, y - .75, 26 * k, 1.5);
    context.fillRect(x - .75, y - 6 * k, 1.5, 12 * k);
    context.restore();
  }
}

// ---- 能吃的東西 ----
// 一格大的物品：玩家蓋的建築，或地圖上的可破壞物（基地、礦石、地雷、減速網、鐵門、多格的都不吃）
function mfEdible(o) {
  if (!o || o.kind !== 'obstacle' || o.isBase || o.ore || o.trap || o.slow || o.type === 'irongate' || o.hp <= 0) return false;
  if ((o.w || 1) !== 1 || (o.h || 1) !== 1) return false;
  return obstacleSolidCells(o).length <= 1 && G.obstacles.includes(o);
}
const mfItemCenter = o => ({ x: OX + (o.c + .5) * CELL, y: OY + (o.r + .5) * CELL });
// 可以吃的隊友：活著、沒暴走、沒被吃、看得到
const mfEdibleMate = (e, t) => t.hp > 0 && !t.berserk && !t.eatenBy && enemyNoticesSentry(e, t);
function mfPickMate(e) {
  if (mfIsSmall(e)) return null;
  let best = null, bestD = MILKFISH.noticeRange * CELL;
  if (e.sentryAggroT > 0 && e.sentryAggro && mfEdibleMate(e, e.sentryAggro)) return e.sentryAggro;   // 打牠的隊友先吃
  for (const t of G.towers) {
    if (!mfEdibleMate(e, t)) continue;
    const d = Math.hypot(t.x - e.x, t.y - e.y);
    if (d <= bestD && hasLineOfSight(e.x, e.y, t.x, t.y)) { best = t; bestD = d; }
  }
  return best;
}
function mfPickItem(e) {
  let best = null, bestD = MILKFISH.itemSense * CELL;
  for (const o of G.obstacles) {
    if (!mfEdible(o)) continue;
    const c = mfItemCenter(o), d = Math.hypot(c.x - e.x, c.y - e.y);
    if (d < bestD) { best = o; bestD = d; }
  }
  return best;
}

// ---- 行為（enemy-ai.js 的 stepEnemy 呼叫）----
function stepMilkfishEnemy(e, dt) {
  const C = MILKFISH;
  if (!e.mf) e.mf = { cd: 1 + Math.random(), wait: Math.random() * 2 };
  const mf = e.mf;
  mf.cd -= dt; mf.patk = (mf.patk || 0) - dt;
  mf.playerRest = Math.max(0, (mf.playerRest || 0) - dt);
  mf.playerIgnore = Math.max(0, (mf.playerIgnore || 0) - dt);
  if (mf.playerChasing) mf.playerChaseAge = (mf.playerChaseAge || 0) + dt;
  // 張嘴要吞隊友（攻擊圖，朝隊友那邊）：已經張嘴就一定咬完這一口，被打暈也不會中斷
  if (mf.windup > 0) {
    mf.windup -= dt; mfPose(e, 'attack', mf.aim ? mf.aim.x : null);
    if (mf.windup <= 0) mfGulp(e);
    return;
  }
  if (e.stunT > 0) { mf.chew = 0; mf.pwindup = 0; mfPose(e, null); return; }   // 睡著、麻痺：嘴裡的人還是出不來
  // 咬溫特的前搖
  if (mf.pwindup > 0) {
    mf.pwindup -= dt; mfPose(e, 'attack', G.player ? G.player.x : null);
    if (mf.pwindup <= 0) mfBitePlayer(e);
    return;
  }
  // 吃物品：先撲咬一下（攻擊圖），再換笑臉圖嚼
  if (mf.chew > 0) {
    mf.chew -= dt;
    const bitten = C.chewTime - mf.chew;
    if (bitten < C.biteTime) mfPose(e, 'attack', mf.chewing ? mfItemCenter(mf.chewing).x : null);
    else mfPose(e, Math.floor(mf.chew * C.chewFps) % 2 ? 'smile-01' : 'smile-02');
    if (mf.chew <= 0) mfSwallowItem(e);
    return;
  }
  mfPose(e, null);
  if (mf.prey) {   // 嘴裡含著人：先逃離現場約 fleeDist 格，到了之後慢慢晃；不吃別的
    if (mf.flee && mfFleeStep(e, dt)) return;
    mfWander(e, dt * C.fullSpeedMul); return;
  }
  // 找隊友吃：鎖定一個受害者，一直追到吃到、他倒下（被別人吃掉）或跑太遠才換人
  let mate = mf.mate && mfEdibleMate(e, mf.mate) && Math.hypot(mf.mate.x - e.x, mf.mate.y - e.y) <= C.loseRange * CELL ? mf.mate : null;
  if (!mate && mf.cd <= 0) mate = mfPickMate(e);
  mf.mate = mate;
  const p = G.player, pd = p && p.hp > 0 && !mfIsSmall(e) ? Math.hypot(p.x - e.x, p.y - e.y) : Infinity;
  const mateD = mate ? Math.hypot(mate.x - e.x, mate.y - e.y) : Infinity;
  const seesPlayer = Number.isFinite(pd) && hasLineOfSight(e.x, e.y, p.x, p.y);
  if (mf.playerChasing) {
    mf.playerLostSight = seesPlayer ? 0 : (mf.playerLostSight || 0) + dt;
    if (pd >= C.playerLoseRange * CELL || mf.playerChaseAge >= C.playerChaseTime || mf.playerLostSight >= C.playerLostSightTime) {
      mf.playerChasing = false; mf.playerBurst = 0; e.playerAggroT = 0;
      mf.playerIgnore = C.playerReacquireDelay;
    }
  }
  // 已鎖定隊友就不因玩家比較近而換人；玩家射擊仍可短暫引走牠。
  if (!mf.playerChasing && !mf.playerIgnore && seesPlayer && pd < C.playerLoseRange * CELL
    && ((e.playerAggroT || 0) > 0 || (!mate && pd <= C.playerNoticeRange * CELL))) {
    mf.playerChasing = true; mf.playerChaseAge = 0; mf.playerLostSight = 0;
  }
  if (mf.playerRest > 0) return;   // 短衝後喘氣／咬空後停頓，不立刻改追隊友
  if (mf.playerChasing) {
    if (pd <= C.playerReach) { if (mf.patk <= 0) { mf.pwindup = C.playerWindup; e.faceRight = p.x > e.x; } return; }
    if (pd <= C.chargeRange * CELL && seesPlayer) {
      mf.playerBurst = (mf.playerBurst || 0) + dt;
      const chargeDt = Math.min(dt, Math.max(0, C.playerChargeTime - (mf.playerBurst - dt)));
      if (chargeDt > 0) mfChase(e, p, chargeDt, 'mfp');
      if (mf.playerBurst >= C.playerChargeTime) { mf.playerBurst = 0; mf.playerRest = C.playerChargeRest; }
    } else {
      if (mf.playerBurst > 0) { mf.playerBurst = 0; mf.playerRest = C.playerChargeRest; return; }
      mfChase(e, p, dt, 'mfp', false);
    }
    return;
  }
  // 溫特靠太近：咬他一口（隊友已經在嘴邊就先吃隊友）
  if (pd <= C.playerReach && mf.patk <= 0 && !(mf.cd <= 0 && mateD <= C.eatReach)) { mf.pwindup = C.playerWindup; e.faceRight = p.x > e.x; return; }
  if (mate) {
    if (mf.cd <= 0 && mateD <= C.eatReach) { mf.windup = C.windup; mf.aim = mate; e.faceRight = mate.x > e.x; return; }
    mfChase(e, mate, dt, 'mf', mf.cd <= 0);
    return;
  }
  // 找一格的物品吃
  const item = mf.cd <= 0 ? (mf.item && mfEdible(mf.item) ? mf.item : mfPickItem(e)) : null;
  mf.item = item;
  if (item) {
    const c = mfItemCenter(item);
    if (Math.hypot(c.x - e.x, c.y - e.y) <= C.itemReach * CELL) { mfStartChew(e, item); return; }
    const nav = enemyNavigate(e, item.c, item.r, dt, 'mfi:' + item.c + ',' + item.r, true);
    if (nav.blocker) mfBlocked(e, nav.blocker, dt);
    return;
  }
  mfWander(e, dt * C.wanderSpeedMul);
}
// 追人：夠近、中間沒擋住就高速衝過去（走路圖，貼近了才張嘴）；太遠或撞到東西衝不過去就尋路走過去
function mfChase(e, t, dt, key, canCharge = true) {
  const C = MILKFISH, mf = e.mf, d = Math.hypot(t.x - e.x, t.y - e.y);
  if (canCharge && d <= C.chargeRange * CELL && hasLineOfSight(e.x, e.y, t.x, t.y) && moveEnemyToward(e, t, dt * C.chargeSpeedMul)) {
    mf.dustT = (mf.dustT || 0) - dt;
    if (mf.dustT <= 0) {
      mf.dustT = C.chargeDustEvery;
      G.effects.push({ particle: true, kind: 'spark', x: e.x + (Math.random() - .5) * 20, y: e.y + 10, vx: (Math.random() - .5) * 40, vy: -(10 + Math.random() * 25), r: 2 + Math.random() * 2, life: .35, life0: .35, color: Math.random() < .5 ? '#a8936c' : '#cdbb91' });
    }
    return;
  }
  const [gc, gr] = cellAt(t.x, t.y);
  const nav = enemyNavigate(e, gc, gr, dt, key + ':' + gc + ',' + gr, true);
  if (nav.blocker) mfBlocked(e, nav.blocker, dt);
  else if (nav.reached && d > C.eatReach) moveEnemyToward(e, t, dt);   // 同一格裡：直接走過去
}
// 路被擋住：擋路的是一格的物品就吃掉，不然照一般怪物打建築
function mfBlocked(e, o, dt) {
  if (mfEdible(o) && e.mf.cd <= 0) mfStartChew(e, o);
  else enemyAttackObstacle(e, o, dt);
}
function mfWander(e, moveDt) {
  const C = MILKFISH, mf = e.mf;
  if (mf.spot) {
    const moved = moveEnemyToward(e, mf.spot, moveDt);
    if (!moved || Math.hypot(mf.spot.x - e.x, mf.spot.y - e.y) <= 3) { mf.spot = null; mf.wait = mfRand(C.idleMin, C.idleMax); }
    return;
  }
  mf.wait -= moveDt;
  if (mf.wait <= 0) {
    for (let i = 0; i < 8; i++) {
      const a = Math.random() * Math.PI * 2, r = (.6 + Math.random() * (C.wanderRadius - .6)) * CELL, x = e.x + Math.cos(a) * r, y = e.y + Math.sin(a) * r;
      if (!enemyBlocked(x, y) && hasLineOfSight(e.x, e.y, x, y)) { mf.spot = { x, y }; break; }
    }
    mf.wait = mfRand(C.idleMin, C.idleMax);
  }
}

// ---- 吃隊友 ----
function mfGulp(e) {
  const C = MILKFISH, mf = e.mf, t = mf.aim;
  mfPose(e, null); mf.aim = null;
  if (!t || !mfEdibleMate(e, t) || e.dead || Math.hypot(t.x - e.x, t.y - e.y) > C.gulpReach) { mf.cd = C.missCooldown; return; }   // 跑掉了：沒吃到（還是鎖定他）
  mf.prey = t; mf.digestT = C.digestEvery; mf.cd = C.eatCooldown;
  mf.flee = mfPickFleeSpots(e); mf.fleeT = C.fleeMaxTime;   // 吞下後逃離現場（候選地點由好到差，跑不到就換下一個）
  t.eatenBy = e; t.moving = false; t.target = null; t.navPath = null; t.navGoal = null; t.knockT = 0;
  t.meleeSwing = null; t.gunSwing = null; t.rootT = 0;
  t.x = e.x; t.y = e.y;
  G.effects.push({ ring: true, x: e.x, y: e.y - 40, r: 6, r2: 34, life: .3, life0: .3, color: '#f3e7c9' });
  if (typeof sfxAt === 'function') sfxAt('milkfishGulp', e.x, e.y, .9, 'milkfish-gulp');
  if (typeof sentryStatus === 'function') sentryStatus(t, '被吃掉了！', '#ffb36b', true);
  if (typeof mateHurtSay === 'function') mateHurtSay(t, 'swallowed');   // 對話編輯器「被虱目魚小子吞掉」
  addShake(2);
}
// ---- 吞下隊友後逃跑 ----
// 從現在的位置沿著走得到的格子往外找（繞過牆和建築），挑「實際路程」約 fleeDist 格、離溫特越遠越好的地點，
// 排好順序（前 6 個）；小房間裡沒那麼遠的地方，就挑走得到的最遠處
function mfPickFleeSpots(e) {
  const C = MILKFISH, p = G.player, [c0, r0] = cellAt(e.x, e.y);
  const maxSteps = C.fleeDist + 3, seen = new Map([[c0 + ',' + r0, 0]]), queue = [[c0, r0]], cells = [];
  while (queue.length) {
    const [c, r] = queue.shift(), d = seen.get(c + ',' + r);
    cells.push({ c, r, d });
    if (d >= maxSteps) continue;
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nc = c + dc, nr = r + dr, key = nc + ',' + nr;
      if (seen.has(key) || !inGrid(nc, nr) || isWall(nc, nr) || enemyBarrierAt(nc, nr) || (typeof hangiCapAt === 'function' && hangiCapAt(nc, nr))) continue;
      seen.set(key, d + 1); queue.push([nc, nr]);
    }
  }
  const far = Math.max(...cells.map(x => x.d));
  const want = Math.min(C.fleeDist, far);   // 走得到的最遠處不到 fleeDist：就跑到最遠處
  const spots = cells.filter(x => x.d >= want - 2).map(x => {
    const cx = OX + (x.c + .5) * CELL, cy = OY + (x.r + .5) * CELL;
    return { c: x.c, r: x.r, x: cx, y: cy, score: (p ? Math.hypot(cx - p.x, cy - p.y) : 0) - Math.abs(x.d - want) * CELL * .5 };
  });
  spots.sort((a, b) => b.score - a.score);
  return spots.length && far > 1 ? spots.slice(0, 6) : null;
}
// 往逃跑點跑（尋路繞過建築）；到了、跑不到或跑太久就回傳 false（改成慢慢晃）
function mfFleeStep(e, dt) {
  const C = MILKFISH, mf = e.mf, s = mf.flee && mf.flee[0];
  mf.fleeT -= dt;
  if (!s || mf.fleeT <= 0 || Math.hypot(s.x - e.x, s.y - e.y) <= CELL * .5) { mf.flee = null; return false; }
  const nav = enemyNavigate(e, s.c, s.r, dt * C.fleeSpeedMul, 'mff:' + s.c + ',' + s.r, false);   // 逃跑：繞過建築，不停下來拆（不然會卡在營地前面一直打）
  if (nav.blocker || (nav.reached && Math.hypot(s.x - e.x, s.y - e.y) > CELL)) {   // 這個地點跑不到：換下一個，都不行就不跑了
    mf.flee.shift(); e.aiPath = null;
    if (!mf.flee.length) { mf.flee = null; return false; }
  }
  return true;
}
// 咬溫特：只扣血，不會吞（傷害、擊退、受傷音效沿用一般怪物打溫特，js/enemy-ai.js 的 enemyAttackPlayer）
function mfBitePlayer(e) {
  const p = G.player, mf = e.mf;
  mfPose(e, null); mf.patk = MILKFISH.playerCooldown;
  const wasCharging = mf.playerBurst > 0;
  mf.playerBurst = 0;
  if (!p || p.hp <= 0 || Math.hypot(p.x - e.x, p.y - e.y) > MILKFISH.playerHitReach) {
    mf.playerRest = Math.max(mf.playerRest || 0, wasCharging ? MILKFISH.playerChargeRest : MILKFISH.playerMissRest);
    return;
  }
  if (wasCharging) mf.playerRest = MILKFISH.playerChargeRest;
  e.playerTouchCd = 0;
  enemyAttackPlayer(e, 0);
}
// 吐出來：虱目魚小子死掉（獲救），或被消化到倒下
function mfRelease(t, rescued) {
  const e = t.eatenBy; if (!e) return;
  t.eatenBy = null;
  if (e.mf && e.mf.prey === t) { e.mf.prey = null; e.mf.cd = MILKFISH.eatCooldown; }
  // 放在虱目魚小子腳邊找得到的空地
  const ok = (x, y) => typeof sentryBlocked !== 'function' || !sentryBlocked(x, y);
  let px = e.x, py = e.y + 14;
  if (!ok(px, py)) for (let k = 1; k <= 24 && !ok(px, py); k++) { const a = k * 2.4, r = 8 + k * 2.5; px = e.x + Math.cos(a) * r; py = e.y + Math.sin(a) * r; }
  if (ok(px, py)) { t.x = px; t.y = py; }
  t.navPath = null; t.navGoal = null; t.hitT = .3;
  for (let i = 0; i < 8; i++) G.effects.push({ particle: true, kind: 'spark', x: t.x, y: t.y - 20, vx: (Math.random() - .5) * 90, vy: -(30 + Math.random() * 60), r: 2 + Math.random() * 1.5, life: .45, life0: .45, color: i % 2 ? '#f3e7c9' : '#9fd6ff' });
  if (typeof sfxAt === 'function') sfxAt('milkfishSpit', t.x, t.y, .8, 'milkfish-spit');
  if (rescued && t.hp > 0 && typeof sentryStatus === 'function') sentryStatus(t, '獲救了！', '#9ff0c0', true);
}
// 每幀（game.js 的 update 呼叫）：被吃的人跟著魚嘴走、消化扣血；虱目魚小子死了就把人放出來
function updateMilkfish(dt) {
  for (const t of G.towers) {
    const e = t.eatenBy; if (!e) continue;
    if (e.dead || e.hp <= 0 || !G.enemies.includes(e)) { mfRelease(t, true); continue; }   // 打死了：救出來
    t.x = e.x; t.y = e.y; t.moving = false;
    if (t.hp <= 0) { mfRelease(t, false); continue; }
    const mf = e.mf;
    mf.digestT -= dt;
    if (mf.digestT <= 0) {   // 消化：扣一次血
      mf.digestT += MILKFISH.digestEvery;
      const defense = typeof sentryDefense === 'function' ? sentryDefense(t) : 0;
      const dmg = Math.max(1, Math.round((e.sentryDamage ?? 10) * (1 - defense)));
      t.hp = Math.max(0, t.hp - dmg); t.hitT = .35;
      flash('-' + dmg, e.x, e.y - (e.drawHeight || 120) - 14, '#ff8f8f');
      if (t.hp <= 0) {
        if (typeof sentryStatus === 'function') sentryStatus(t, '失去戰鬥能力', '#ff5b6e', true);
        mfRelease(t, false);
      }
    }
  }
}
// 名單上被吃掉的人：怪物找目標時當作看不到（enemy-ai.js）、自己不動也不攻擊（sentry.js、game.js）
const isEatenByMilkfish = t => !!(t && t.eatenBy);

// ---- 吃物品 ----
function mfStartChew(e, o) {
  const mf = e.mf;
  mf.chew = MILKFISH.chewTime; mf.chewing = o; mf.item = null;
  const c = mfItemCenter(o); e.faceRight = c.x > e.x;
}
function mfSwallowItem(e) {
  const mf = e.mf, o = mf.chewing;
  mf.chewing = null; mfPose(e, null); mf.cd = MILKFISH.eatCooldown;
  if (!mfEdible(o)) return;   // 嚼到一半被拆掉了
  const c = mfItemCenter(o);
  o.lastHitBy = 'eaten';   // 被吃掉的油桶／瓦斯爐：不漏油、不爆炸（js/oil-barrels.js）
  removeBarrier(o);
  e.hasTarget = false; e.attackingObstacle = null;
  for (let i = 0; i < 7; i++) G.effects.push({ particle: true, kind: 'spark', x: c.x + (Math.random() - .5) * 18, y: c.y - 6, vx: (Math.random() - .5) * 70, vy: -(20 + Math.random() * 50), r: 1.6 + Math.random() * 1.6, life: .4, life0: .4, color: i % 2 ? '#8a7a66' : '#cbbca4' });
  flash('吃掉了！', c.x, c.y - 26, '#ffd27a', .8);
  if (typeof sfxAt === 'function') sfxAt('milkfishChew', e.x, e.y, .8, 'milkfish-chew');
}

// ---- 繪圖：魚嘴裡露出的腳（js/render.js 的 drawEnemy 畫完虱目魚小子之後馬上呼叫）----
// dx、dy、dw、dh＝這一幀虱目魚小子實際畫在哪裡、多大（含被打時的壓扁回彈、晃動），腳跟著一起壓扁、晃動，才不會浮在半空
function drawMilkfishPrey(ctx, e, dx, dy, dw, dh, frameImg) {
  const t = e.mf && e.mf.prey; if (!t) return;
  const set = TYPES[t.type] && TYPES[t.type].guide ? MILKFISH_LEGS.guide : MILKFISH_LEGS.sentry;
  const img = monsterImage(set[t.still ? 0 : Math.floor(performance.now() / 1000 * MILKFISH.legsFps) % set.length]);   // still：不踢了（劇情裡被雷劈之後，js/story-scene.js）
  if (!img.complete || !img.naturalWidth) return;
  const fw = (frameImg && frameImg.naturalWidth) || e.drawWidth || 100, fh = (frameImg && frameImg.naturalHeight) || e.drawHeight || 120;
  const kx = dw / fw, ky = dh / fh;                                     // 圖片 1 像素在畫面上多寬、多高（壓扁時 ky 變小、kx 變大）
  const smile = e.forceFrame && /smile/.test(e.forceFrame) ? 1 : 0;   // 笑臉圖頂端低 1 像素
  const w = img.naturalWidth * kx, h = img.naturalHeight * ky;
  const x = dx + dw / 2 - w / 2, y = dy + (MILKFISH.mouthRow + smile) * ky - h;   // 腳的下緣對齊魚嘴開口
  ctx.save(); ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  if (t.storyPrey) { ctx.restore(); return; }   // 劇情裡被吞（js/story-scene.js）：只畫腳
  // 被吃的是誰：腳上面寫名字＋HP 條
  const name = (TYPES[t.type] && TYPES[t.type].name) || '', cx = dx + dw / 2;
  const by = Math.round(y) - 4, bw = 30;
  ctx.fillStyle = '#000'; ctx.fillRect(cx - bw / 2, by, bw, 3);
  ctx.fillStyle = '#ffb36b'; ctx.fillRect(cx - bw / 2, by, bw * Math.max(0, t.hp) / (t.maxhp || 1), 3);
  if (name) {
    ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.strokeStyle = 'rgba(0,0,0,.9)'; ctx.strokeText(name, cx, by - 3);
    ctx.fillStyle = '#fff'; ctx.fillText(name, cx, by - 3);
  }
  ctx.restore();
}

