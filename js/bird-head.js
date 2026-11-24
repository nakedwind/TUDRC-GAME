/* ===== 鳥頭人（衝撞型異質體）=====
   平時站在原地轉眼睛，偶爾慢慢散步；看到玩家或哨兵（視線沒被牆擋住）就愣一下、
   接著朝目標「直線」衝過去——衝撞路線是鎖定的，看準時機可以閃開。
   撞到人：造成傷害並大力擊退，然後喘口氣；撞到牆會暈一下；撞到建築會撞壞它。
   不會主動去打光源，也不會往營地走。
   死掉：往前倒下、慢慢變黑後消失（不套用史萊姆的爆開黏液）。
   資料裡 behavior: "charger" 的怪物都走這套行為（data/monsters.js）。
   必須在 enemy-ai.js 之後、game.js 之前載入。
*/
// 行為數值放在 data/monsters.js（每隻怪物的 charger 欄位），可在怪物編輯器調整；
// 欄位說明與預設值見 js/monster-data.js 的 CHARGER_FIELDS。資料缺少時用這組預設。
const BIRD_HEAD = validChargerCfg(null);
const chargerCfg = e => e.chargerCfg || BIRD_HEAD;

function chargerTargets(e) {
  const list = [];
  const p = G.player;
  if (p && p.hp > 0 && sameFloor(e, p)) list.push(p);   // 不同樓層的打不到（js/pathfinding.js）
  for (const t of G.towers) if (t.hp > 0 && !t.berserk && enemyNoticesSentry(e, t)) list.push(t);
  return list;
}
// 選目標：玩家（看得到、或記仇中）一律最優先，哨兵的嘲諷也引不走；玩家不在才找哨兵
// （先找打過自己的，再找視線內最近的）。
function chargerPlayerNoticeable(e) {
  const p = G.player;
  if (!p || p.hp <= 0 || !sameFloor(e, p)) return false;   // 不同樓層（陸橋上／下）的看不到、打不到（js/pathfinding.js）
  const d = Math.hypot(p.x - e.x, p.y - e.y);
  if ((e.playerAggroT || 0) > 0 && d <= ENEMY_SENSE_RANGE) return true;   // 被溫特打中：18 格內都記仇
  return d <= chargerCfg(e).noticeRange * CELL && hasLineOfSight(e.x, e.y, p.x, p.y);
}
function chargerPickTarget(e) {
  if (chargerPlayerNoticeable(e)) return G.player;
  const sentries = chargerTargets(e).filter(t => t !== G.player);
  const dist = t => Math.hypot(t.x - e.x, t.y - e.y);
  if (e.sentryAggroT > 0 && sentries.includes(e.sentryAggro) && dist(e.sentryAggro) <= ENEMY_SENSE_RANGE) return e.sentryAggro;
  let best = null, bestD = chargerCfg(e).noticeRange * CELL;
  for (const t of sentries) {
    const d = dist(t);
    if (d <= bestD && hasLineOfSight(e.x, e.y, t.x, t.y)) { best = t; bestD = d; }
  }
  return best;
}
// 看得到的人（溫特、注意到的隊員）裡最近的一個；except＝不算這個（原本追的目標）。要打障礙物之前先找人打
function chargerVisiblePerson(e, except) {
  let best = null, bestD = chargerCfg(e).noticeRange * CELL;
  for (const a of chargerTargets(e)) {
    const d = Math.hypot(a.x - e.x, a.y - e.y);
    if (a !== except && d <= bestD && hasLineOfSight(e.x, e.y, a.x, a.y)) { best = a; bestD = d; }
  }
  return best;
}
// 衝撞路線上有沒有障礙物（建築、牆）：有的話不直接衝，改成繞過去追（不然會一直撞同一個路障）
function chargerLaneClear(e, target) {
  const dx = target.x - e.x, dy = target.y - e.y, d = Math.hypot(dx, dy);
  for (let s = 4; s < d - 14; s += 4) if (enemyBlocked(e.x + dx / d * s, e.y + dy / d * s)) return false;   // 跟衝撞一樣每 4 像素檢查一次（js/bird-head.js 的 chargerChargeMove）
  return true;
}
function chargerSetState(e, state, t = 0) { e.ch.state = state; e.ch.t = t; }
function chargerIdle(e) {
  const { idleMin: lo, idleMax: hi } = chargerCfg(e);
  chargerSetState(e, 'idle', lo + Math.random() * (hi - lo));
}
function chargerFace(e, x) { if (Math.abs(x - e.x) > 2) e.faceRight = x > e.x; }
function chargerNotice(e, target, time = chargerCfg(e).noticeTime) {
  e.ch.target = target; chargerSetState(e, 'notice', time);
  if (target === G.player) e.eyeFlashT = EYE_FLASH.time;   // 鎖定玩家：眼睛閃一下藍光（衝撞前的預警）
  chargerFace(e, target.x);
  e.alertT = ENEMY_ALERT_TIME;   // 頭上「！」
}
function chargerStartCharge(e, target) {
  const dx = target.x - e.x, dy = target.y - e.y, d = Math.hypot(dx, dy) || 1;
  e.ch.dir = { x: dx / d, y: dy / d };
  e.ch.left = d + chargerCfg(e).chargeOvershoot * CELL;
  chargerSetState(e, 'charge');
  chargerFace(e, target.x);
  G.effects.push({ ring: true, x: e.x, y: e.y + 10, r: 4, r2: 22, life: .2, life0: .2, color: '#d9d2c0' });   // 起跑揚塵
}
// ---- 被撞飛：往外滑行一段（越滑越慢），滑行中不能自己移動 ----
// 速度一開始最快、線性減到 0，滑行總距離＝distance。撞到牆就停。
function knockActor(actor, dirX, dirY, distance, dur = .28) {
  if (distance <= 0) return;
  const v0 = 2 * distance / dur;
  actor.knockT = dur; actor.knockT0 = dur; actor.knockVX = dirX * v0; actor.knockVY = dirY * v0;
}
// 每幀由玩家／哨兵的更新呼叫；回傳 true＝這幀正在被撞飛
function stepActorKnock(actor, dt, blocked) {
  if (!(actor.knockT > 0)) return false;
  const k = actor.knockT / actor.knockT0;
  let move = Math.hypot(actor.knockVX, actor.knockVY) * k * dt;
  const ux = actor.knockVX / (Math.hypot(actor.knockVX, actor.knockVY) || 1), uy = actor.knockVY / (Math.hypot(actor.knockVX, actor.knockVY) || 1);
  while (move > 0) {
    const s = Math.min(4, move); move -= s;
    const nx = actor.x + ux * s, ny = actor.y + uy * s;
    if (blocked(nx, ny) && typeof poolFallKnockIn === 'function' && poolFallKnockIn(actor, ux, uy, nx, ny)) return true;   // 滑到深水邊：被推下水（溫特、隊員；js/pool-fall.js）
    if (actor.slipT > 0 && blocked(nx, ny) && typeof bkSlipBump === 'function' && bkSlipBump(actor)) break;   // 踩到香蕉皮滑去撞到東西：頭暈（js/golden-banana-king.js）
    if (!blocked(nx, ny)) { actor.x = nx; actor.y = ny; }
    else if (!blocked(nx, actor.y)) actor.x = nx;
    else if (!blocked(actor.x, ny)) actor.y = ny;
    else { actor.knockT = 0; break; }   // 撞牆停下
  }
  actor.knockT -= dt;
  if (Math.random() < .5) G.effects.push({ particle: true, kind: 'spark', x: actor.x - ux * 8, y: actor.y + 12, vx: -ux * 30, vy: -8, r: 2 + Math.random() * 2, life: .25, life0: .25, color: '#b9b2a2' });   // 腳下拖出的灰塵
  return true;
}
// 衝撞的打擊特效：撞擊圖、雙圈衝擊波、沿衝刺方向噴出的火花與碎屑、頓格、撞擊聲
function spawnChargeImpact(e, target) {
  const dir = e.ch.dir, ang = Math.atan2(dir.y, dir.x);
  const x = (e.x + target.x) / 2 + dir.x * 6, y = (e.y + target.y) / 2 - 18;
  playAttackSprite('charge-impact', x, y, .42, ang);   // 自畫的撞擊特效（images/Attack effects/charge-impact）
  if (typeof mfxOn === 'function' && mfxOn('monster')) birdChargeImpactV2(x, y, ang);   // V2：星芒、往前噴的拉長火花、灰塵（js/misc-fx-v2.js）
  else for (let i = 0; i < 6; i++) {   // 往前方噴幾顆火花，補動態感
    const a = ang + (Math.random() * 2 - 1) * .7, sp = 160 + Math.random() * 160;
    G.effects.push({ particle: true, kind: 'spark', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 30,
      r: 2 + Math.random() * 2, life: .16 + Math.random() * .14, life0: .3, color: i % 2 ? '#fff0c8' : '#ffb066' });
  }
  addHitstop(.07);
  if (typeof sfxAt === 'function') sfxAt('knock2', x, y, .7, 'charger-impact');
}
// 衝撞途中撞到人：玩家或任何活著的哨兵／嚮導
function chargerHitSomeone(e, dt) {
  const p = G.player, dir = e.ch.dir;
  if (p && p.hp > 0 && sameFloor(e, p) && Math.hypot(p.x - e.x, p.y - e.y) <= 30) {   // 不同樓層（陸橋上／下）的撞不到
    spawnChargeImpact(e, p);
    e.playerTouchCd = 0;
    enemyAttackPlayer(e, dt);
    knockActor(p, dir.x, dir.y, chargerCfg(e).knockback);   // 沿衝刺方向被撞飛
    return true;
  }
  for (const t of G.towers) {
    if (t.hp <= 0 || t.berserk || !sameFloor(e, t) || Math.hypot(t.x - e.x, t.y - e.y) > 26) continue;
    spawnChargeImpact(e, t);
    e.atkCd = 0;
    enemyAttackSentry(e, t, dt);
    knockActor(t, dir.x, dir.y, chargerCfg(e).knockback * .8);
    t.navPath = null; t.navGoal = null;
    if (typeof mateHurtSay === 'function') mateHurtSay(t, 'rammed');   // 對話編輯器「被鳥頭人撞飛」
    return true;
  }
  return false;
}
// 腳步聲：走路動畫每 2 張換一次腳（walk01、walk02 落地），所以每移動 2 張的距離響一聲
function chargerFootsteps(e, moved, loud) {
  e.ch.stepDist = (e.ch.stepDist || 0) + moved;
  const every = loud ? 40 : 20;   // 衝刺時一張 20 像素、走路 10 像素（見 render.js monsterWalkFrame）
  if (e.ch.stepDist < every) return;
  e.ch.stepDist %= every;
  e.ch.stepFoot = !e.ch.stepFoot;
  if (typeof sfxAt === 'function') sfxAt(loud ? 'birdRun' : 'birdWalk', e.x, e.y, loud ? 1 : .55, 'bird-step-' + (e.stepKey ||= Math.random().toString(36).slice(2, 7)));
}
function chargerChargeStep(e, dt) {
  const x0 = e.x, y0 = e.y;
  chargerChargeMove(e, dt);
  chargerFootsteps(e, Math.hypot(e.x - x0, e.y - y0), true);
}
function chargerChargeMove(e, dt) {
  let move = Math.min(e.ch.left, chargerCfg(e).chargeSpeed * dt * (typeof glueSlowAt === 'function' ? glueSlowAt(e.x, e.y, e) : 1));   // 衝進黏著彈的黏膠：衝得很慢（距離不變）
  e.ch.left -= move;
  while (move > 0) {
    const s = Math.min(4, move); move -= s;
    const nx = e.x + e.ch.dir.x * s, ny = e.y + e.ch.dir.y * s;
    if (enemyBlocked(nx, ny)) {
      const [c, r] = cellAt(nx, ny), blocker = inGrid(c, r) && enemyBarrierAt(c, r);
      if (blocker) { e.atkCd = 0; enemyAttackObstacle(e, blocker, dt); }   // 撞上建築：撞一下
      G.effects.push({ ring: true, x: e.x, y: e.y + 6, r: 4, r2: 20, life: .22, life0: .22, color: '#c9c2b0' });
      chargerSetState(e, 'recover', chargerCfg(e).recoverWall);
      if (!blocker) e.wallDazedT = chargerCfg(e).recoverWall;   // 撞到牆：暈眩（頭上冒星星、左右斜晃）；撞建築不算
      return;
    }
    e.x = nx; e.y = ny;
    if (chargerHitSomeone(e, dt)) { chargerSetState(e, 'recover', chargerCfg(e).recoverHit); return; }
  }
  if (e.ch.left <= 0) chargerSetState(e, 'recover', chargerCfg(e).recoverMiss);
}
function chargerPickWanderSpot(e) {
  const o = typeof squadAnchor === 'function' ? squadAnchor(e) : e;   // 金蕉王的隊員：繞著隊長散步（js/golden-banana-king.js）
  for (let i = 0; i < 8; i++) {
    const a = Math.random() * Math.PI * 2, d = (.8 + Math.random() * (chargerCfg(e).wanderRadius - .8)) * CELL;
    const x = o.x + Math.cos(a) * d, y = o.y + Math.sin(a) * d;
    if (!enemyBlocked(x, y) && hasLineOfSight(e.x, e.y, x, y)) return { x, y };
  }
  return null;
}

// 每幀由 stepEnemy（js/enemy-ai.js）呼叫
function stepChargerEnemy(e, dt) {
  if (!e.ch) { e.ch = {}; chargerIdle(e); e.ch.t *= Math.random(); }
  const ch = e.ch;
  if (e.eyeFlashT > 0) e.eyeFlashT = Math.max(0, e.eyeFlashT - dt);
  if (e.wallDazedT > 0) e.wallDazedT = Math.max(0, e.wallDazedT - dt);
  if (e.stunT > 0 || e.confuseT > 0) { if (ch.state === 'charge') chargerSetState(e, 'recover', .3); return; }
  ch.t -= dt;
  switch (ch.state) {
    case 'idle':
    case 'wander': {
      const target = chargerPickTarget(e);
      if (target) { chargerNotice(e, target); return; }
      if (ch.state === 'idle') {
        if (ch.t > 0) return;
        const spot = Math.random() < chargerCfg(e).wanderChance && chargerPickWanderSpot(e);
        if (spot) { ch.spot = spot; chargerSetState(e, 'wander', 8); } else chargerIdle(e);
        return;
      }
      const moved = moveEnemyToward(e, ch.spot, dt * chargerCfg(e).wanderSpeedMul);
      if (!moved || ch.t <= 0 || Math.hypot(ch.spot.x - e.x, ch.spot.y - e.y) <= 3) chargerIdle(e);
      return;
    }
    case 'notice': {
      if (ch.target !== G.player && chargerPlayerNoticeable(e)) { chargerNotice(e, G.player, chargerCfg(e).noticeTime * .6); return; }   // 優先玩家
      const target = ch.target;
      if (!target || target.hp <= 0) { chargerIdle(e); return; }
      chargerFace(e, target.x);
      if (ch.t > 0) return;
      const d = Math.hypot(target.x - e.x, target.y - e.y);
      if (d <= chargerCfg(e).chargeRange * CELL && hasLineOfSight(e.x, e.y, target.x, target.y) && chargerLaneClear(e, target)) chargerStartCharge(e, target);
      else chargerSetState(e, 'hunt', 0);
      return;
    }
    case 'charge': chargerChargeStep(e, dt); return;
    case 'recover': {
      if (ch.t > 0) return;
      const target = chargerPickTarget(e) || (ch.target && ch.target.hp > 0 && Math.hypot(ch.target.x - e.x, ch.target.y - e.y) <= chargerCfg(e).loseRange * CELL ? ch.target : null);
      if (target) chargerNotice(e, target, chargerCfg(e).noticeTime * .6); else chargerIdle(e);
      return;
    }
    case 'hunt': {   // 目標被牆擋住或太遠：快步繞過去，看得到又夠近就再衝
      if (ch.target !== G.player && chargerPlayerNoticeable(e)) { chargerNotice(e, G.player, chargerCfg(e).noticeTime * .6); return; }   // 優先玩家
      const target = ch.target;
      const d = target ? Math.hypot(target.x - e.x, target.y - e.y) : Infinity;
      if (!target || target.hp <= 0 || d > chargerCfg(e).loseRange * CELL) { chargerIdle(e); return; }
      if (d <= chargerCfg(e).chargeRange * CELL && hasLineOfSight(e.x, e.y, target.x, target.y) && chargerLaneClear(e, target)) { chargerNotice(e, target, chargerCfg(e).noticeTime * .6); return; }
      const [gc, gr] = cellAt(target.x, target.y);
      const hx = e.x, hy = e.y;
      const nav = enemyNavigate(e, gc, gr, dt * chargerCfg(e).huntSpeedMul, 'hunt:' + gc + ',' + gr, 'detour');   // 繞得過去就繞，不先打障礙物
      chargerFootsteps(e, Math.hypot(e.x - hx, e.y - hy), false);
      if (nav.blocker) {   // 真的過不去：附近看得到別人就改去撞人，沒有才打障礙物
        const other = chargerVisiblePerson(e, target);
        if (other) { chargerNotice(e, other, chargerCfg(e).noticeTime * .6); return; }
        enemyAttackObstacle(e, nav.blocker, dt);
      }
      return;
    }
    default: chargerIdle(e);
  }
}

// ---- 暈眩：頭上冒星星、身體左右斜晃（一般鳥頭人撞牆；鳥頭大隊長撞牆或被暈，js/elite-bird-head.js）----
function chargerDizzy(e) {
  if (!e || e.behavior !== 'charger' || e.hp <= 0) return false;
  if (e.elite) return !!(e.eb && e.eb.state === 'dazed' && e.eb.t > 0) || e.stunT > 0;
  return e.wallDazedT > 0;
}
// 斜晃角度（弧度）：以腳底為軸左右搖，大約 ±5 度（render.js 的 drawEnemy 呼叫）
const DIZZY_SWAY = { angle: .09, speed: 6 };
function chargerSwayAngle(e) {
  if (!chargerDizzy(e)) return 0;
  return Math.sin(performance.now() / 1000 * DIZZY_SWAY.speed + (e.swayPhase ??= Math.random() * 6)) * DIZZY_SWAY.angle;
}
// 頭上轉圈的星星，跟版權老鼠同一套（js/burrowing-mouse.js）；畫在黑幕上面（render.js 呼叫）
function drawChargerDizzyStars(ctx) {
  if (!G || !G.enemies || typeof drawBurrowDizzyStars !== 'function') return;
  const t = performance.now() / 1000;
  for (const e of G.enemies) {
    if (!chargerDizzy(e)) continue;
    const w = e.drawWidth || 60, h = e.drawHeight || 80;
    drawBurrowDizzyStars(ctx, e.x, e.y + 13 - h + 6, w / (e.elite ? 100 : 70), t);
  }
}

// ---- 鎖定玩家時眼睛閃藍光（鳥頭大隊長閃紅光）----
// 畫在黑幕上面（render.js 在照明彈光暈之後呼叫），所以鳥頭人站在暗處時，也看得到兩點藍光亮起。
const EYE_FLASH = { time: .6, rise: .1, radius: 15, color: [90, 185, 255] };
function drawChargerEyeFlashes(ctx) {
  for (const e of G.enemies) {
    if (!(e.eyeFlashT > 0) || !e.frames || e.hp <= 0 || e.showBack) continue;   // 背對畫面時看不到眼睛
    const f = e.frames, lazy = !e.ch || e.ch.state === 'idle' || e.ch.state === 'wander';
    const eyes = (lazy && f.idleEyes) || f.eyes;
    if (!eyes) continue;
    const t = 1 - e.eyeFlashT / EYE_FLASH.time;                       // 0 → 1
    const k = t < EYE_FLASH.rise ? t / EYE_FLASH.rise : Math.pow(1 - (t - EYE_FLASH.rise) / (1 - EYE_FLASH.rise), 1.5);   // 一下子亮起、再慢慢退
    const dw = e.drawWidth || 60, dh = e.drawHeight || 80, sx = dw / 60, sy = dh / 80;
    const left = e.x - dw / 2, top = e.y + 13 - (e.slimeLift || 0) - dh;
    const flip = lazy && f.idleEyes ? !!e.faceRight === (f.idleFacing === 'left') : false;   // 側面發呆圖朝右時左右翻
    const [r, g, b] = e.eyeFlashColor || EYE_FLASH.color;   // 鳥頭大隊長閃紅光（js/elite-bird-head.js 的 eyeFlash）
    const lt = c => Math.round(c + (255 - c) * .75);         // 光芯：顏色混 75% 白
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (const [ex, ey] of eyes) {
      const x = flip ? e.x + (e.x - (left + ex * sx)) : left + ex * sx, y = top + ey * sy;
      const R = EYE_FLASH.radius * (.55 + .45 * k);
      const grad = ctx.createRadialGradient(x, y, 0, x, y, R);
      grad.addColorStop(0, `rgba(${lt(r)},${lt(g)},${lt(b)},${(.95 * k).toFixed(3)})`);
      grad.addColorStop(.3, `rgba(${r},${g},${b},${(.75 * k).toFixed(3)})`);
      grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.fill();
      // 十字閃光（橫長直短）
      ctx.fillStyle = `rgba(${lt(r)},${lt(g)},${lt(b)},${(.85 * k).toFixed(3)})`;
      ctx.fillRect(x - 13 * k, y - .75, 26 * k, 1.5);
      ctx.fillRect(x - .75, y - 6 * k, 1.5, 12 * k);
    }
    ctx.restore();
  }
}

// ---- 死亡：往前倒下、變黑、淡出 ----
// 倒下會橫躺約 2 格長：面向的那一邊有牆或建築、另一邊是空的，就改往另一邊倒，免得身體插進牆裡
function fallDirection(e) {
  const dir = e.faceRight ? 1 : -1, len = (e.drawHeight || 80) * .9;
  const blocked = d => { for (let k = 10; k <= len; k += 10) if (enemyBlocked(e.x + d * k, e.y)) return true; return false; };
  return onFloorDo(e, () => blocked(dir) && !blocked(-dir) ? -dir : dir);   // 照倒下的那一層判斷牆
}
// giant：BOSS（鳥頭大隊長、虱目魚王）用「巨物倒下」：先站著左右搖晃、慢慢變黑，再重重倒下（地面大震動、煙塵）
// extra：倒下時身上還要畫的東西（例如虱目魚王的王冠），用 (ctx, c, dark) 呼叫，dark＝變黑的程度 0～1
// 這些 BOSS 倒下時都用巨物倒下：鳥頭大隊長、虱目魚王、大夯吉寶／順順宮主、金蕉大王、絲瓜女王、池核巨大比基尼小丑魚、葫蘆猴王
const isGiantFallBoss = e => !!(e.elite || e.mk || e.capKing || e.bananaEmperor || e.loofahQueen || e.poolBoss || e.gourdKing);
function pushFallCorpse(e, opt = {}) {
  const img = monsterImage(e.lastFrameFile || e.sprite), giant = opt.giant ?? isGiantFallBoss(e), G2 = GIANT_FALL;
  (G.fxCorpses = G.fxCorpses || []).push({
    floor: actorFloor(e),   // 死在幾樓（陸橋上的屍體才不會被橋面蓋住）
    fall: true, img, x: e.x, y: e.y, z: 0, w: e.drawWidth || 60, h: e.drawHeight || 80,
    t: 0, life: giant ? G2.sway + G2.fall + G2.lie + G2.fade : 2.6, dir: fallDirection(e), flip: !!e.lastFrameFlip,
    giant, extra: opt.extra || null, stumbles: 0,
  });
  if (giant) {   // 斷氣的瞬間：一聲悶響、輕輕震一下
    if (typeof nearbyImpact === 'function') nearbyImpact(e.x, e.y, 4, .04);
    if (typeof sfxAt === 'function') sfxAt('eliteStep', e.x, e.y, 1, 'giant-fall-start');
  }
}
// 巨物倒下的時間軸（秒）與力道
const GIANT_FALL = {
  sway: 1.2,        // 站著左右搖晃多久（搖 3 下）
  swayAmp: .1,      // 搖晃角度（弧度，越後面晃越大）
  swayTimes: 3,
  fall: .8,         // 倒下花多久（越倒越快）
  lie: 3,           // 倒在地上躺多久
  fade: 1,          // 最後淡出多久
  shake: 16,        // 倒地時畫面震動
  shakeRange: 22,   // （不再使用：震動距離改成所有 BOSS 共用 js/combat-feel.js 的 BOSS_SHAKE.range）
  dust: { rocks: 14, speed: [60, 170], up: [120, 240], dust: 10, dustRise: 3, size: 1 },   // 倒地揚起的煙塵、碎石（js/gourd-monkey.js 的 rockBurstFx）
};
const giantFallLand = () => GIANT_FALL.sway + GIANT_FALL.fall;   // 幾秒時碰到地面
// 由 combat-feel.js 的屍體更新呼叫：倒地瞬間揚起一圈灰塵
function updateFallCorpse(c) {
  if (c.giant) { updateGiantFall(c); return; }
  if (!c.landed && c.t >= .45) {
    c.landed = true;
    G.effects.push({ ring: true, x: c.x + c.dir * c.h * .45, y: c.y + 10, r: 6, r2: 30, life: .3, life0: .3, color: '#b9b2a2' });
  }
}
function updateGiantFall(c) {
  const F = GIANT_FALL, land = giantFallLand();
  // 搖晃時每晃到一邊，腳下踉蹌一下（小震動、揚灰）
  const step = Math.floor(c.t / (F.sway / (F.swayTimes * 2)));
  if (c.t < F.sway && step > c.stumbles) {
    c.stumbles = step;
    if (typeof nearbyImpact === 'function') nearbyImpact(c.x, c.y, 2 + step, 0);
    for (let i = 0; i < 3; i++) G.effects.push({ particle: true, kind: 'spark', x: c.x + (Math.random() * 2 - 1) * c.w * .25, y: c.y + 12, vx: (Math.random() * 2 - 1) * 60, vy: -15 - Math.random() * 25, r: 2 + Math.random() * 2, life: .35, life0: .35, color: '#a9a292' });
  }
  if (!c.landed && c.t >= land) {   // 重重倒在地上：大震動、頓一下、一長條煙塵和碎石、兩圈衝擊波
    c.landed = true;
    const p = G.player;
    if (p) { const d = Math.hypot(p.x - c.x, p.y - c.y) / CELL, R = bossShakeRange(), k = 1 - d / R; if (d < R) addShake(F.shake * (.25 + .75 * k * k)); }
    if (typeof addHitstop === 'function') addHitstop(.08);
    const len = c.h * .9;
    for (let i = 0; i < 4; i++) {   // 沿著倒下的身體揚起煙塵
      const x = c.x + c.dir * len * (.15 + .25 * i), y = c.y + 12;
      if (typeof rockBurstFx === 'function') rockBurstFx(x, y, { ...F.dust, rocks: Math.round(F.dust.rocks / 2) });
      G.effects.push({ ring: true, x, y, r: 8, r2: c.w * .35, life: .45, life0: .45, color: '#b9b2a2' });
    }
    G.effects.push({ ring: true, x: c.x + c.dir * len * .5, y: c.y + 12, r: 10, r2: len * 1.1, life: .6, life0: .6, color: '#d9d2c0' });
    for (let i = 0; i < 2; i++) (G.eliteCracks = G.eliteCracks || []).push({ size: .9, power: 1, life: 6, x: c.x + c.dir * len * (.3 + .45 * i), y: c.y + 12 + (Math.random() * 2 - 1) * 6, at: performance.now() / 1000 });   // 倒下的身體壓出一長條大裂痕（素材圖，js/combat-feel.js 的 CRACK_ART）
    (G.eliteCracks = G.eliteCracks || []).push({ x: c.x + c.dir * len * .55, y: c.y + 12, at: performance.now() / 1000, rot: (Math.random() * 2 - 1) * .3, flip: c.dir < 0 });   // 地上撞出裂痕（js/elite-bird-head.js 的 drawEliteGround）
    if (typeof sfxAt === 'function') { sfxAt('eliteStep', c.x, c.y, 1.6, 'giant-fall-land'); sfxAt('knock2', c.x, c.y, 1.3, 'giant-fall-land2'); }
  }
}
// 由 combat-feel.js 的屍體繪製呼叫
function drawFallCorpse(ctx, c) {
  if (c.giant) { drawGiantFall(ctx, c); return; }
  const p = Math.min(1, c.t / .45), ease = p * p;   // 像真的倒下：一開始慢、越倒越快
  const bounce = p >= 1 ? Math.max(0, .06 * Math.sin((c.t - .45) * 22) * Math.exp(-(c.t - .45) * 9)) : 0;   // 落地輕彈
  const ang = c.dir * (Math.PI / 2) * (ease - bounce);
  ctx.translate(c.x, c.y + 13); ctx.rotate(ang);
  if (c.flip) ctx.scale(-1, 1);
  ctx.globalAlpha = Math.min(1, c.life / .8);   // 最後 0.8 秒淡出
  if (c.img.width) {
    ctx.drawImage(c.img, -c.w / 2, -c.h, c.w, c.h);
    const black = flashSprite(c.img, '#07090c');
    if (black) { ctx.globalAlpha *= Math.min(.92, c.t / .9); ctx.drawImage(black, -c.w / 2, -c.h, c.w, c.h); }   // 慢慢變黑
  }
}
// 巨物倒下：搖晃（越晃越大、全身發抖）→ 越倒越快 → 落地彈兩下躺平；從搖晃開始慢慢變黑
function drawGiantFall(ctx, c) {
  const F = GIANT_FALL, land = giantFallLand();
  let ang;
  if (c.t < F.sway) {
    const k = c.t / F.sway;
    ang = Math.sin(k * Math.PI * 2 * F.swayTimes) * F.swayAmp * (.35 + .65 * k);
    ctx.translate((Math.random() * 2 - 1) * 1.5, 0);   // 全身發抖
  } else if (c.t < land) {
    const p = (c.t - F.sway) / F.fall;
    ang = c.dir * (Math.PI / 2) * Math.pow(p, 2.3);
  } else {
    const u = c.t - land, bounce = Math.max(0, .09 * Math.sin(u * 16) * Math.exp(-u * 6));   // 落地彈兩下
    ang = c.dir * (Math.PI / 2) * (1 - bounce);
  }
  ctx.translate(c.x, c.y + 13); ctx.rotate(ang);
  if (c.flip) ctx.scale(-1, 1);
  ctx.globalAlpha = Math.min(1, c.life / F.fade);   // 最後淡出
  const dark = Math.min(.92, c.t / land);   // 倒地那一刻剛好全黑
  if (c.img.width) {
    ctx.drawImage(c.img, -c.w / 2, -c.h, c.w, c.h);
    const black = flashSprite(c.img, '#07090c');
    if (black) { const a = ctx.globalAlpha; ctx.globalAlpha = a * dark; ctx.drawImage(black, -c.w / 2, -c.h, c.w, c.h); ctx.globalAlpha = a; }
  }
  if (c.extra) c.extra(ctx, c, dark);
}
