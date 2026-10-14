/* ===== 珍珠小童（飄浮射擊型異質體）=====
   半浮在空中、上下輕輕晃，移動很慢。看到玩家或哨兵（視線沒被牆擋住）就慢慢飄到射程內，
   手上的珍珠閃一下（蓄力），然後朝目標噴出珍珠；目標太近時會往後飄、保持距離。
   珍珠直線飛行：打到人造成傷害、打到建築會損壞建築、碰到牆就碎掉。
   地圖上有異質核心醒著時是「生氣」狀態（紅眼圖），噴得比較快。平時慢慢飄來飄去、偶爾眨眼。
   死掉：掉到地上、珍珠滾出來，變暗後消失（不套用史萊姆的黏液）。
   資料裡 behavior: "shooter" 的怪物都走這套（data/monsters.js），數值在怪物編輯器調整
   （欄位見 js/monster-data.js 的 SHOOTER_FIELDS）。必須在 enemy-ai.js 之後、game.js 之前載入。
*/
const PEARL_DEFAULT = validShooterCfg(null);
const shooterCfg = e => e.shooterCfg || PEARL_DEFAULT;
const PEARL_ART_W = 80, PEARL_ART_H = 74;      // 原圖大小（珍珠位置用這個比例換算）
const PEARL_HAND = { x: 33, y: 54 };           // 小童手上那顆珍珠在原圖上的位置：珍珠從這裡噴出去
const PEARL_HIT_R = 16;                        // 珍珠打中人的判定半徑（像素）

// 地圖上有醒著的異質核心 → 生氣
const pearlAngry = () => !!(G.cores && G.cores.some(c => c.awake && !c.dead));
// 手上珍珠在世界中的位置：x、地面 y、離地高度 z（畫的時候 y - z）
function pearlHandPos(e) {
  const dw = e.drawWidth || PEARL_ART_W, dh = e.drawHeight || PEARL_ART_H;
  const fromBottom = (PEARL_ART_H - PEARL_HAND.y) / PEARL_ART_H * dh;
  return { x: e.x - dw / 2 + PEARL_HAND.x / PEARL_ART_W * dw, y: e.y, z: (e.slimeLift || 0) + fromBottom - 13 };
}

function shooterTargets(e) {
  const list = [];
  const p = G.player;
  if (p && p.hp > 0) list.push(p);
  for (const t of G.towers) if (t.hp > 0 && !t.berserk && enemyNoticesSentry(e, t)) list.push(t);
  return list;
}
// 選目標：打過自己的（記仇）＞ 注意範圍內、看得到的最近目標
function shooterPickTarget(e) {
  const cfg = shooterCfg(e), dist = t => Math.hypot(t.x - e.x, t.y - e.y);
  const targets = shooterTargets(e);
  if ((e.playerAggroT || 0) > 0 && targets.includes(G.player) && dist(G.player) <= ENEMY_SENSE_RANGE) return G.player;
  if (e.sentryAggroT > 0 && targets.includes(e.sentryAggro) && dist(e.sentryAggro) <= ENEMY_SENSE_RANGE) return e.sentryAggro;
  let best = null, bestD = cfg.noticeRange * CELL;
  for (const t of targets) {
    const d = dist(t);
    if (d <= bestD && hasLineOfSight(e.x, e.y, t.x, t.y)) { best = t; bestD = d; }
  }
  return best;
}
function shooterWanderSpot(e) {
  const r = shooterCfg(e).wanderRadius;
  for (let i = 0; i < 8; i++) {
    const a = Math.random() * Math.PI * 2, d = (.6 + Math.random() * (r - .6)) * CELL;
    const x = e.x + Math.cos(a) * d, y = e.y + Math.sin(a) * d;
    if (!enemyBlocked(x, y) && hasLineOfSight(e.x, e.y, x, y)) return { x, y };
  }
  return null;
}

// 每幀由 stepEnemy（js/enemy-ai.js）呼叫
function stepShooterEnemy(e, dt) {
  const cfg = shooterCfg(e);
  if (!e.pk) e.pk = { cd: .8 + Math.random() * 1.2, wait: Math.random() * 2, bob: Math.random() * 10 };
  const pk = e.pk;
  // 飄浮：慢慢升到浮空高度，上下輕晃（被暈住會掉到接近地面）
  pk.bob += dt;
  const want = e.stunT > 0 ? 4 : cfg.hover + Math.sin(pk.bob * 2.1) * 3;
  e.slimeLift = (e.slimeLift || 0) + (want - (e.slimeLift || 0)) * Math.min(1, dt * 3);
  if (e.stunT > 0) { pk.windup = 0; return; }
  pk.cd -= dt * (pearlAngry() ? 1 / cfg.angryCooldownMul : 1);

  // 蓄力中：站定，時間到就噴
  if (pk.windup > 0) {
    pk.windup -= dt;
    if (pk.windup <= 0) {
      const t = pk.target;
      if (t && t.hp > 0 && hasLineOfSight(e.x, e.y, t.x, t.y)) firePearls(e, t);
      pk.cd = cfg.cooldown;
    }
    return;
  }

  let target = shooterPickTarget(e);
  if (!target && pk.target && pk.target.hp > 0 && Math.hypot(pk.target.x - e.x, pk.target.y - e.y) <= cfg.loseRange * CELL) target = pk.target;   // 還在追的目標先不放
  pk.target = target;
  if (target) {
    const d = Math.hypot(target.x - e.x, target.y - e.y), see = hasLineOfSight(e.x, e.y, target.x, target.y);
    if (see && d <= cfg.shootRange * CELL) {
      if (d < cfg.keepDistance * CELL) {   // 太近：往後飄
        const away = { x: e.x - (target.x - e.x), y: e.y - (target.y - e.y) };
        moveEnemyToward(e, away, dt * cfg.retreatSpeedMul);
      }
      if (pk.cd <= 0) { pk.windup = cfg.windup; pk.shotTarget = { x: target.x, y: target.y }; }   // 開始蓄力（手上的珍珠會閃光）
      return;
    }
    // 看不到或太遠：慢慢飄過去
    const [gc, gr] = cellAt(target.x, target.y);
    const nav = enemyNavigate(e, gc, gr, dt, 'pearl:' + gc + ',' + gr, true);
    if (nav.blocker) enemyAttackObstacle(e, nav.blocker, dt);
    return;
  }
  // 沒有目標：發呆一下、慢慢飄到附近
  if (pk.spot) {
    const moved = moveEnemyToward(e, pk.spot, dt * cfg.wanderSpeedMul);
    if (!moved || Math.hypot(pk.spot.x - e.x, pk.spot.y - e.y) <= 3) { pk.spot = null; pk.wait = cfg.idleMin + Math.random() * (cfg.idleMax - cfg.idleMin); }
    return;
  }
  pk.wait -= dt;
  if (pk.wait <= 0) { pk.spot = shooterWanderSpot(e); pk.wait = cfg.idleMin + Math.random() * (cfg.idleMax - cfg.idleMin); }
}

// ---- 噴珍珠：直線飛，打到人／建築／牆就停 ----
function firePearls(e, target) {
  const cfg = shooterCfg(e), hand = pearlHandPos(e);
  const base = Math.atan2(target.y - hand.y, target.x - hand.x);
  const n = Math.max(1, Math.round(cfg.pearlCount));
  for (let i = 0; i < n; i++) {
    const a = base + (n > 1 ? (i / (n - 1) - .5) * cfg.pearlSpread * Math.PI / 180 : 0);
    (G.pearls = G.pearls || []).push({ x: hand.x, y: hand.y, z: hand.z, vx: Math.cos(a) * cfg.pearlSpeed, vy: Math.sin(a) * cfg.pearlSpeed,
      left: (cfg.shootRange + 2) * CELL, owner: e, spin: Math.random() * 6, trail: [] });
  }
  G.effects.push({ ring: true, x: hand.x, y: hand.y - hand.z, r: 3, r2: 14, life: .16, life0: .16, color: '#ffffff' });   // 噴出的白光
  if (typeof sfxAt === 'function') sfxAt('pearlShot', e.x, e.y, .8, 'pearl-shot');
}
function pearlBurst(x, y, z, color = '#f4f1ff') {   // 珍珠碎掉：小白圈＋幾顆亮點
  G.effects.push({ ring: true, x, y: y - z, r: 2, r2: 16, life: .2, life0: .2, color });
  for (let i = 0; i < 6; i++) {
    const a = Math.random() * Math.PI * 2, sp = 50 + Math.random() * 80;
    G.effects.push({ particle: true, kind: 'spark', x, y: y - z, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: 1.5 + Math.random() * 1.6, life: .18 + Math.random() * .12, life0: .3, color: i % 2 ? '#ffffff' : '#e6dcff' });
  }
}
function pearlHitPlayer(pearl) {
  const p = G.player, e = pearl.owner, dmg = e.playerDamage ?? 8;
  p.hp = Math.max(0, p.hp - dmg);
  p.hitT = .35; p.underAttackT = 5; p.lastAttacker = e;
  G.damageVignetteT = .35;
  flashDmg('-' + dmg, p.x, p.y - 46, '#ff6b6b'); addShake(2);
  if (p.hp <= 0 && !G.over) { flash('部隊長失去戰鬥能力', p.x, p.y - 58, '#ff5b6e'); lose('player', '被' + monsterNameOf(e) + '的珍珠打中'); }
}
function updatePearls(dt) {
  if (!G.pearls || !G.pearls.length) { if (G.pearlBits) updatePearlBits(dt); return; }
  for (const pl of G.pearls) {
    pl.spin += dt * 9;
    pl.trail.push({ x: pl.x, y: pl.y - pl.z }); if (pl.trail.length > 5) pl.trail.shift();
    let move = Math.hypot(pl.vx, pl.vy) * dt;
    const ux = pl.vx / Math.hypot(pl.vx, pl.vy), uy = pl.vy / Math.hypot(pl.vx, pl.vy);
    while (move > 0 && !pl.done) {
      const s = Math.min(5, move); move -= s; pl.left -= s;
      pl.x += ux * s; pl.y += uy * s;
      const [c, r] = cellAt(pl.x, pl.y);
      if (!inGrid(c, r) || isWall(c, r)) { pl.done = true; pearlBurst(pl.x, pl.y, pl.z); break; }
      const blocker = barrierAt(c, r);
      if (blocker) {
        pl.done = true; pearlBurst(pl.x, pl.y, pl.z);
        if (G.enemies.includes(pl.owner)) { pl.owner.atkCd = 0; enemyAttackObstacle(pl.owner, blocker, 0); }
        break;
      }
      const p = G.player;
      if (p && p.hp > 0 && Math.hypot(p.x - pl.x, p.y - pl.y) <= PEARL_HIT_R) {
        pl.done = true; pearlBurst(pl.x, pl.y, pl.z); pearlHitPlayer(pl);
        playPlayerHit(1, true);   // 溫特被珍珠打中
        break;
      }
      for (const t of G.towers) {
        if (t.hp <= 0 || t.berserk || Math.hypot(t.x - pl.x, t.y - pl.y) > PEARL_HIT_R) continue;
        pl.done = true; pearlBurst(pl.x, pl.y, pl.z);
        pl.owner.atkCd = 0; enemyAttackSentry(pl.owner, t, 0);
        if (typeof sfxAt === 'function') sfxAt('pearlHit', pl.x, pl.y, .9, 'pearl-hit');
        break;
      }
      if (!pl.done && pl.left <= 0) { pl.done = true; pearlBurst(pl.x, pl.y, pl.z); }   // 飛到盡頭碎掉
    }
  }
  G.pearls = G.pearls.filter(pl => !pl.done);
  if (G.pearlBits) updatePearlBits(dt);
}

// ---- 繪圖 ----
// 選圖：生氣用紅眼圖；每隔幾秒眨一次眼（半閉→閉→半閉）
function shooterFrame(e) {
  const art = e.art || {}, angry = pearlAngry();
  const now = performance.now() / 1000;
  if (e.blinkAt == null) e.blinkAt = now + 1 + Math.random() * 3;
  let t = now - e.blinkAt;
  if (t > .3) { e.blinkAt = now + 2 + Math.random() * 3.5; t = -1; }
  const open = angry ? art.angry || art.normal : art.normal;
  const half = angry ? art.angryHalf || art.half : art.half;
  if (t < 0) return open || e.sprite;
  if (t < .07 || t > .23) return half || open || e.sprite;
  return art.closed || half || open || e.sprite;
}
const pearlImg = file => monsterImage(file || 'images/monster/pearl-kid/pearl.png');
// 角色上層：飛行中的珍珠＋蓄力時手上珍珠的閃光
function drawPearls(ctx) {
  for (const e of G.enemies) {   // 蓄力：手上的珍珠亮起十字閃光
    if (!(e.pk && e.pk.windup > 0) || e.hp <= 0 || !isVisible(e.x, e.y)) continue;
    const hand = pearlHandPos(e), cfg = shooterCfg(e);
    const k = 1 - e.pk.windup / cfg.windup, x = hand.x, y = hand.y - hand.z;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const R = 6 + 10 * k, g = ctx.createRadialGradient(x, y, 0, x, y, R);
    g.addColorStop(0, `rgba(255,255,255,${(.5 + .5 * k).toFixed(2)})`); g.addColorStop(1, 'rgba(220,210,255,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = `rgba(255,255,255,${(.6 + .4 * k).toFixed(2)})`;
    ctx.fillRect(x - 10 * k, y - .75, 20 * k, 1.5); ctx.fillRect(x - .75, y - 10 * k, 1.5, 20 * k);
    ctx.restore();
  }
  for (const pl of G.pearls || []) {
    if (!isVisible(pl.x, pl.y)) continue;
    const img = pearlImg(pl.owner && pl.owner.art && pl.owner.art.pearl);
    ctx.save();
    ctx.globalAlpha = .28; ctx.fillStyle = '#071015';   // 地上的影子
    ctx.beginPath(); ctx.ellipse(pl.x, pl.y + 8, 6, 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalCompositeOperation = 'lighter';           // 白色拖尾
    pl.trail.forEach((q, i) => { ctx.globalAlpha = (i + 1) / pl.trail.length * .35; ctx.fillStyle = '#e8e2ff'; ctx.beginPath(); ctx.arc(q.x, q.y, 2 + i * .6, 0, Math.PI * 2); ctx.fill(); });
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    if (img.complete && img.naturalWidth) {
      ctx.imageSmoothingEnabled = false;
      ctx.translate(pl.x, pl.y - pl.z); ctx.rotate(pl.spin);
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
    }
    ctx.restore();
  }
  for (const b of G.pearlBits || []) {   // 死掉時滾出來的珍珠
    if (!isVisible(b.x, b.y)) continue;
    const img = pearlImg(b.file);
    ctx.save(); ctx.globalAlpha = Math.min(1, b.life / .6);
    if (img.complete && img.naturalWidth) { ctx.imageSmoothingEnabled = false; ctx.translate(b.x, b.y - b.z); ctx.rotate(b.spin); ctx.scale(.8, .8); ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2); }
    ctx.restore();
  }
}

// ---- 死亡：掉到地上、珍珠滾出來、變暗淡出 ----
function pushDropCorpse(e) {
  const img = monsterImage((e.art && e.art.closed) || shooterFrame(e));   // 死掉時閉上眼睛
  (G.fxCorpses = G.fxCorpses || []).push({ drop: true, img, x: e.x, y: e.y, z: e.slimeLift || 0, vz: 0,
    w: e.drawWidth || PEARL_ART_W, h: e.drawHeight || PEARL_ART_H, t: 0, life: DISSOLVE.start + DISSOLVE.spread + DISSOLVE.life + .05, pearl: e.art && e.art.pearl });
}
function updateDropCorpse(c, dt) {   // 由 combat-feel.js 的屍體更新呼叫
  if (c.z > 0) { c.vz -= 600 * dt; c.z = Math.max(0, c.z + c.vz * dt); }
  if (!c.landed && c.z <= 0) {
    c.landed = true; c.landT = c.t;
    G.effects.push({ ring: true, x: c.x, y: c.y + 10, r: 6, r2: 32, life: .3, life0: .3, color: '#c9c2b0' });
    G.pearlBits = G.pearlBits || [];
    for (let i = 0; i < 3; i++) {
      const a = Math.random() * Math.PI * 2, sp = 50 + Math.random() * 60;
      G.pearlBits.push({ x: c.x, y: c.y + 4, z: 10, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * .5, vz: 70 + Math.random() * 60, spin: 0, life: 2.2, file: c.pearl });
    }
    if (typeof sfxAt === 'function') sfxAt('pearlHit', c.x, c.y, .7, 'pearl-drop');
  }
}
function updatePearlBits(dt) {
  for (const b of G.pearlBits) {
    b.life -= dt; b.spin += (Math.hypot(b.vx, b.vy) / 6) * dt;
    if (b.z > 0 || b.vz > 0) { b.vz -= 420 * dt; b.z = Math.max(0, b.z + b.vz * dt); if (b.z === 0 && b.vz < 0) b.vz = Math.abs(b.vz) > 60 ? -b.vz * .35 : 0; }
    const nx = b.x + b.vx * dt, ny = b.y + b.vy * dt;
    if (!enemyBlocked(nx, ny)) { b.x = nx; b.y = ny; } else { b.vx *= -.4; b.vy *= -.4; }
    b.vx *= Math.pow(.25, dt); b.vy *= Math.pow(.25, dt);   // 在地上滾慢下來
  }
  G.pearlBits = G.pearlBits.filter(b => b.life > 0);
}
// ---- 瓦解：變黑之後，從頭頂開始碎成小方塊，像灰燼一樣往上飄散 ----
// start：死後幾秒開始瓦解；spread：從頭頂碎到底部要幾秒；life：每一塊飄散多久；block：碎塊大小（原圖像素）
const DISSOLVE = { start: 1.15, spread: .8, life: .75, block: 3, dark: .9 };
const dissolveCache = new Map();
function dissolveChunks(c) {   // 把這張圖切成小方塊（同一張圖只算一次）
  const key = c.img.src + '|' + c.w + 'x' + c.h;
  if (dissolveCache.has(key)) return dissolveCache.get(key);
  const cv = document.createElement('canvas'); cv.width = c.w; cv.height = c.h;
  const g = cv.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(c.img, 0, 0, c.w, c.h);
  const B = DISSOLVE.block, out = [];
  let d;
  try { d = g.getImageData(0, 0, c.w, c.h).data; }
  catch (_) {
    // 直接雙擊 HTML（file://）開啟時，瀏覽器不准讀圖片像素：改成在橢圓範圍內撒碎塊，
    // 還沒碎掉的部分直接畫原圖（見 drawDissolve），外形一樣正確。
    out.approx = true;
    for (let by = 0; by < c.h; by += B) for (let bx = 0; bx < c.w; bx += B) {
      const nx = (bx + B / 2 - c.w / 2) / (c.w / 2), ny = (by + B / 2 - c.h * .55) / (c.h * .5);
      if (nx * nx + ny * ny > 1 || Math.random() < .35) continue;
      const v = 14 + Math.floor(Math.random() * 14);
      out.push({ x: bx - c.w / 2, y: by - c.h, color: `rgb(${v},${v - 2},${v + 6})`, h: by / c.h,
        delay: (by / c.h) * DISSOLVE.spread + Math.random() * .18, vx: (Math.random() * 2 - 1) * 22, vy: -(18 + Math.random() * 34), rot: Math.random() });
    }
    dissolveCache.set(key, out);
    return out;
  }
  for (let by = 0; by < c.h; by += B) for (let bx = 0; bx < c.w; bx += B) {
    const cx = Math.min(c.w - 1, bx + 1), cy = Math.min(c.h - 1, by + 1), i = (cy * c.w + cx) * 4;
    if (d[i + 3] < 90) continue;
    const mix = v => Math.round(v * (1 - DISSOLVE.dark) + 9 * DISSOLVE.dark);   // 跟變黑後的顏色一致
    out.push({ x: bx - c.w / 2, y: by - c.h, color: `rgb(${mix(d[i])},${mix(d[i + 1])},${mix(d[i + 2])})`, h: by / c.h,
      delay: (by / c.h) * DISSOLVE.spread + Math.random() * .18, vx: (Math.random() * 2 - 1) * 22, vy: -(18 + Math.random() * 34), rot: Math.random() });
  }
  dissolveCache.set(key, out);
  return out;
}
function drawDissolve(ctx, c) {
  const B = DISSOLVE.block, T = c.t - DISSOLVE.start, chunks = dissolveChunks(c);
  if (chunks.approx) {   // 備用做法：還沒碎掉的部分＝原圖＋變黑，從碎裂線以下照畫
    const line = Math.max(0, Math.min(1, T / DISSOLVE.spread)) * c.h;
    if (line < c.h) {
      ctx.save(); ctx.beginPath(); ctx.rect(-c.w / 2, -c.h + line, c.w, c.h - line); ctx.clip();
      ctx.globalAlpha = 1; ctx.drawImage(c.img, -c.w / 2, -c.h, c.w, c.h);
      const black = flashSprite(c.img, '#07090c');
      if (black) { ctx.globalAlpha = DISSOLVE.dark; ctx.drawImage(black, -c.w / 2, -c.h, c.w, c.h); }
      ctx.restore();
    }
  }
  for (const ch of chunks) {
    const age = T - ch.delay;
    if (age < 0) { if (chunks.approx) continue; ctx.globalAlpha = 1; ctx.fillStyle = ch.color; ctx.fillRect(ch.x, ch.y, B, B); continue; }   // 還沒碎到這裡
    const p = age / DISSOLVE.life;
    if (p >= 1) continue;
    const x = ch.x + ch.vx * age + Math.sin(age * 6 + ch.rot * 9) * 3, y = ch.y + ch.vy * age - 40 * age * age;   // 往上飄、左右晃
    const s = B * (1 - p * .6);
    ctx.globalAlpha = 1 - p;
    ctx.fillStyle = p < .18 ? '#6b5a8a' : ch.color;   // 剛碎開時帶一點淡紫微光
    ctx.fillRect(x, y, s, s);
  }
}
function drawDropCorpse(ctx, c) {   // 由 combat-feel.js 的地面層呼叫
  ctx.translate(c.x, c.y + 13 - c.z);
  if (c.t >= DISSOLVE.start && c.img.width) { drawDissolve(ctx, c); return; }
  const squash = c.landed ? Math.max(0, 1 - (c.t - c.landT) / .15) * .15 : 0;   // 落地時壓扁一下
  ctx.scale(1 + squash, 1 - squash);
  if (c.img.width) {
    ctx.drawImage(c.img, -c.w / 2, -c.h, c.w, c.h);
    const black = flashSprite(c.img, '#07090c');
    if (black) { ctx.globalAlpha = Math.min(DISSOLVE.dark, Math.max(0, c.t - .2) / .9); ctx.drawImage(black, -c.w / 2, -c.h, c.w, c.h); }
  }
}
