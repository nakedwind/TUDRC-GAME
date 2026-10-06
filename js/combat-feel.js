// ============================================================
//  戰鬥表演：史萊姆變體、受擊回饋、死亡表演
//  （數值都集中在最上面的表格，想調整改這裡就好）
// ============================================================

// ---- 史萊姆變體 ----
// chance：每隻史萊姆生成時變成這種的機率；unlockAt：開戰幾秒後才會出現
// hue：顏色偏移（度）；hpMul / speedMul / dmgMul / rewardMul：相對於基本史萊姆的倍率
// scale：體型；knockResist：擊退抗性（1 = 完全不會被推、不會硬直）
const SLIME_VARIANTS = {
  normal:   { name: '史萊姆', goo: '#62d3df' },
  splitter: { name: '分裂史萊姆', chance: .14, unlockAt: 15, hue: -75, hpMul: 1.25, goo: '#a4e35c' },
  bomber:   { name: '自爆史萊姆', chance: .11, unlockAt: 30, hue: 170, hpMul: .7, speedMul: 1.3, goo: '#ff6d4f' },
  // 巨型不靠機率，改由下方 GIANT_EVENT 固定時間登場
  giant:    { name: '巨型史萊姆', maxAlive: 1, hue: 95, hpMul: 4, speedMul: .7,
              dmgMul: 2, rewardMul: 4, scale: 1.65, knockResist: 1, goo: '#b983ff' },
  spitter:  { name: '吐酸史萊姆', chance: .12, unlockAt: 40, hue: -130, hpMul: .9, speedMul: .85, goo: '#d4e04a' },
  mini:     { name: '小史萊姆', hue: -75, hpMul: .3, speedMul: 1.35, dmgMul: .5, rewardMul: .25, scale: .6, goo: '#a4e35c' },
};
// 自爆史萊姆：靠近目標後引爆的距離、引信秒數、爆炸半徑與各對象傷害
const SLIME_BOMB = { trigger: CELL * 1.25, fuse: 1.1, radius: CELL * 1.6,
                     player: 24, sentry: 30, building: 60, monster: 20, killedMul: .6 };
// 巨型史萊姆登場事件：開戰 first 秒後第一次出現，之後每 every 秒再來一隻（場上同時最多 1 隻）
const GIANT_EVENT = { first: 45, every: 75 };
// 吐酸史萊姆：range 在多遠內會吐（格）、minRange 太近就不吐；windup 蓄力秒數（地上出現落點警示）
// flySpeed 酸液飛行速度（格／秒）；cooldown 冷卻；pool 地上酸液：半徑（格）、存在秒數、每秒傷害（玩家／哨兵）
const SLIME_SPIT = { range: 5, minRange: 1.5, windup: .75, flySpeed: 6.5, cooldown: 3.8,
                     pool: { radius: .75, life: 4.5, playerDps: 9, sentryDps: 10 } };
// 受擊回饋：擊退距離（一般／重擊）、重擊硬直秒數
const HIT_FEEL = { knock: 5, heavyKnock: 16, stagger: .3 };
// 畫面震動只在玩家附近發生：range 格以內才震，越近越強
const SHAKE_FEEL = { range: 6 };

// 大型衝擊（巨型倒下、自爆）：依玩家距離決定震動強度，太遠就完全不震、不頓格
function nearbyImpact(x, y, shake, stop) {
  if (!G.player) return;
  const d = Math.hypot(G.player.x - x, G.player.y - y) / CELL;
  if (d > SHAKE_FEEL.range) return;
  const k = 1 - d / SHAKE_FEEL.range;
  addShake(shake * (.35 + .65 * k));
  if (stop && k > .5) addHitstop(stop);
}

function rollSlimeVariant() {
  const t = G.battleTime || 0;
  for (const [id, v] of Object.entries(SLIME_VARIANTS)) {
    if (!v.chance || t < (v.unlockAt || 0)) continue;
    if (v.maxAlive && G.enemies.filter(e => e.variant === id && !e.dead).length >= v.maxAlive) continue;
    if (Math.random() < v.chance) return id;
  }
  return 'normal';
}
function applySlimeVariant(e, id) {
  const v = SLIME_VARIANTS[id] || SLIME_VARIANTS.normal;
  e.variant = id; e.tint = v.hue ?? null; e.sizeMul = v.scale || 1;
  e.hp = e.maxhp = Math.max(1, Math.round(e.hp * (v.hpMul || 1)));
  e.speed *= v.speedMul || 1;
  const dmg = v.dmgMul || 1;
  if (e.playerDamage != null) e.playerDamage = Math.round(e.playerDamage * dmg);
  if (e.sentryDamage != null) e.sentryDamage = Math.round(e.sentryDamage * dmg);
  if (e.buildingDamage != null) e.buildingDamage = Math.round(e.buildingDamage * dmg);
  const reward = v.rewardMul || 1;
  e.reward = Math.round((e.reward || 0) * reward);
  if (e.crystals != null) e.crystals = Math.round(e.crystals * reward);
  e.drawWidth = (e.drawWidth || 42) * e.sizeMul;
  e.drawHeight = (e.drawHeight || 33) * e.sizeMul;
  return e;
}

// 換色後的史萊姆圖：只在第一次用到時算一次，之後直接拿快取
const tintedSpriteCache = new Map();
function tintedSprite(img, hue) {
  if (hue == null || !img.complete || !img.naturalWidth) return img;
  const key = img.src + '|' + hue;
  if (!tintedSpriteCache.has(key)) {
    const cv = document.createElement('canvas');
    cv.width = img.naturalWidth; cv.height = img.naturalHeight;
    const c = cv.getContext('2d');
    c.filter = `hue-rotate(${hue}deg) saturate(1.35)`;
    c.drawImage(img, 0, 0);
    tintedSpriteCache.set(key, cv);
  }
  return tintedSpriteCache.get(key);
}

// 受擊閃光用的「純色剪影」：把圖片形狀塗成單一顏色，第一次用到時算一次就快取。
// （取代每幀用 ctx.filter 即時算色；怪物一多時 filter 很吃效能）
const flashSpriteCache = new WeakMap();
function flashSprite(img, color) {
  const w = img && (img.naturalWidth || img.width), h = img && (img.naturalHeight || img.height);
  if (!w || !h) return null;
  let byColor = flashSpriteCache.get(img);
  if (!byColor) { byColor = new Map(); flashSpriteCache.set(img, byColor); }
  let cv = byColor.get(color);
  if (!cv) {
    cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    const c = cv.getContext('2d');
    c.drawImage(img, 0, 0);
    c.globalCompositeOperation = 'source-in';   // 只保留圖片形狀，塗滿指定顏色
    c.fillStyle = color; c.fillRect(0, 0, w, h);
    byColor.set(color, cv);
  }
  return cv;
}
// 受擊閃光：剛被打中先「閃白」，接著轉成攻擊者的屬性色並淡出。
// white＝閃白佔整段的比例；whiteAlpha／colorAlpha＝閃白、屬性色最濃時的不透明度
const HIT_FLASH = { white: .3, whiteAlpha: .9, colorAlpha: .65 };
function drawHitFlash(img, k, color, dx, dy, dw, dh) {   // k＝剩餘比例（1 剛被打 → 0 結束）
  if (!(k > 0)) return;
  const white = k > 1 - HIT_FLASH.white;
  const sil = flashSprite(img, white ? '#ffffff' : (color || '#ff5b5b'));
  if (!sil) return;
  const a = ctx.globalAlpha;
  ctx.globalAlpha = a * (white ? HIT_FLASH.whiteAlpha : HIT_FLASH.colorAlpha * k / (1 - HIT_FLASH.white));
  ctx.drawImage(sil, dx, dy, dw, dh);
  ctx.globalAlpha = a;
}

// ---- 受擊回饋：往後滑、壓扁回彈、重擊硬直 ----
function enemyHitReact(e, fromX, fromY, heavy) {
  if (!e || e.dead) return;
  e.hitSquashT = .16;
  e.lastHitHeavy = !!heavy;
  if (e.playerPounceT > 0) return;   // 空中不受擊退
  const resist = SLIME_VARIANTS[e.variant]?.knockResist || 0;
  const dist = (heavy ? HIT_FEEL.heavyKnock : HIT_FEEL.knock) * (1 - resist);
  const dx = e.x - fromX, dy = e.y - fromY, d = Math.hypot(dx, dy);
  if (dist > .5 && d > 0) { e.knockT = .12; e.knockVX = dx / d * dist / .12; e.knockVY = dy / d * dist / .12; }
  if (heavy && resist < 1) {
    e.staggerT = HIT_FEEL.stagger;
    e.playerWindupT = 0; e.playerPounceGoal = null;   // 重擊可以打斷撲擊蓄力
    e.spitWindT = 0; e.spitGoal = null;                // 也能打斷吐酸蓄力
  }
}

// 每隻怪物每幀先跑這裡；回傳 true 代表這幀不再執行 AI（硬直、引信中）
function updateEnemyFeel(e, dt) {
  e.hitSquashT = Math.max(0, (e.hitSquashT || 0) - dt);
  if (e.playerPounceT > 0) return false;
  if (e.knockT > 0) {
    const step = Math.min(dt, e.knockT); e.knockT -= step;
    displaceEnemy(e, e.knockVX, e.knockVY, Math.hypot(e.knockVX, e.knockVY) * step, false);
  }
  if (e.variant === 'bomber') {
    if (e.fuseT > 0) {
      e.fuseT -= dt;
      const p = 1 - Math.max(0, e.fuseT) / SLIME_BOMB.fuse;
      e.slimeLift = 0; e.slimeScaleX = 1 + .3 * p; e.slimeScaleY = 1 + .22 * p;
      e.beepT = (e.beepT || 0) - dt;
      if (e.beepT <= 0) {
        e.beepT = .32 - .24 * p;
        if (typeof sfxAt === 'function') sfxAt('blip', e.x, e.y, .45, 'bomber');
      }
      if (e.fuseT <= 0) { slimeExplode(e, 1); e.hp = 0; e.exploded = true; }
      return true;
    }
    if (bomberShouldArm(e)) { e.fuseT = SLIME_BOMB.fuse; e.playerWindupT = 0; e.playerPounceGoal = null; return true; }
  }
  if (e.staggerT > 0) {
    e.staggerT -= dt;
    e.slimeLift = 0; e.slimeScaleX = 1.12; e.slimeScaleY = .88;
    return true;
  }
  if (e.variant === 'spitter' && updateSpitter(e, dt)) return true;   // 吐酸蓄力／吐完的後座
  return false;
}
function bomberShouldArm(e) {
  const r = SLIME_BOMB.trigger;
  if (G.player && G.player.hp > 0 && Math.hypot(G.player.x - e.x, G.player.y - e.y) <= r) return true;
  if (G.towers.some(t => t.hp > 0 && Math.hypot(t.x - e.x, t.y - e.y) <= r)) return true;
  return G.obstacles.some(o => o.playerBuilt && o.hp > 0 && enemyObstacleDistance(e, o) <= r * .8);
}

// ---- 自爆 ----
function slimeExplode(e, mul) {
  const R = SLIME_BOMB.radius, x = e.x, y = e.y;
  const p = G.player;
  if (p && p.hp > 0 && Math.hypot(p.x - x, p.y - y) <= R) {
    const dmg = Math.round(SLIME_BOMB.player * mul);
    p.hp = Math.max(0, p.hp - dmg);
    p.hitT = .45; p.underAttackT = 5; G.damageVignetteT = .5;
    const dx = p.x - x, dy = p.y - y, d = Math.hypot(dx, dy) || 1;
    for (let push = 30; push >= 2; push -= 4) {
      const nx = p.x + dx / d * push, ny = p.y + dy / d * push;
      if (!playerBlocked(nx, ny)) { p.x = nx; p.y = ny; break; }
    }
    flashDmg('-' + dmg, p.x, p.y - 46, '#ff6b6b');
    if (p.hp <= 0 && !G.over) { flash('部隊長失去戰鬥能力', p.x, p.y - 58, '#ff5b6e'); lose('player'); }
  }
  for (const t of G.towers) {
    if (t.hp <= 0 || Math.hypot(t.x - x, t.y - y) > R) continue;
    const defense = Math.max(0, Math.min(.75, TYPES[t.type].defense || 0));
    const dmg = SLIME_BOMB.sentry * mul * (1 - defense);
    t.hp = Math.max(0, t.hp - dmg); t.hitT = Math.max(t.hitT || 0, .25);
    flashDmg('-' + Math.round(dmg), t.x, t.y - 30, '#ff8f8f');
    if (t.hp <= 0) { t.target = null; sentryStatus(t, '失去戰鬥能力', '#ff5b6e', true); }
  }
  for (const o of [...G.obstacles]) {
    if (!o.playerBuilt || o.isBase || o.hp <= 0 || enemyObstacleDistance(e, o) > R) continue;
    o.hp -= SLIME_BOMB.building * mul; o.hitT = HIT_DUR;
    if (o.hp <= 0) removeBarrier(o);
  }
  for (const other of G.enemies) {   // 炸到其他怪物（可以引發連鎖爆炸）
    if (other === e || other.dead || other.hp <= 0 || Math.hypot(other.x - x, other.y - y) > R) continue;
    other.hp -= SLIME_BOMB.monster * mul; other.hitT = .16; other.hitColor = '#ffb37a';
    enemyHitReact(other, x, y, true);
  }
  // 畫面：爆閃、雙層衝擊環、火星與黏液四濺
  G.effects.push({ fglow: true, x, y: y - 6, r0: 16, r1: R * 1.1, life: .35, life0: .35 });
  G.effects.push({ ring: true, x, y, r: 10, r2: R, life: .4, life0: .4, color: '#ff7b4a' });
  G.effects.push({ ring: true, x, y, r: 6, r2: R * .65, life: .28, life0: .28, color: '#ffe2b8' });
  for (let i = 0; i < 16; i++) {
    const a = Math.random() * Math.PI * 2, sp = 90 + Math.random() * 140;
    G.effects.push({ ember: true, spark: true, x, y: y - 6, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * .6 - 30,
      r: 1.5 + Math.random() * 2.5, life: .35 + Math.random() * .3, life0: .65 });
  }
  spawnGoo(x, y, SLIME_VARIANTS.bomber.goo, 14, 1.3);
  addSlimeSplat(x, y, SLIME_VARIANTS.bomber.goo, 30);
  nearbyImpact(x, y, 12, .07);
  if (typeof sfxAt === 'function') sfxAt('fireImpact', x, y, .8, 'bomber-boom');
}

// ---- 死亡表演 ----
function onEnemyDeath(e) {
  trackKillAchievements(e);   // 成就計數（js/achievements.js）
  const v = SLIME_VARIANTS[e.variant] || SLIME_VARIANTS.normal;
  const size = e.sizeMul || 1;
  if (e.variant === 'bomber') {   // 自爆型：被打死也會爆（威力較小），不留屍體
    if (!e.exploded) slimeExplode(e, SLIME_BOMB.killedMul);
    return;
  }
  const base = monsterImage(e.sprite || 'images/monster/Monster_Slime.png');
  const heavy = !!e.lastHitHeavy;
  (G.fxCorpses = G.fxCorpses || []).push({
    img: tintedSprite(base, e.tint), x: e.x, y: e.y, z: e.slimeLift || 0,
    w: e.drawWidth || 42, h: e.drawHeight || 33, t: 0,
    // 重擊打死：被打飛旋轉再爆開；一般：原地閃白膨脹後爆開
    fly: heavy, vx: heavy ? (Math.random() < .5 ? -1 : 1) * (70 + Math.random() * 50) : 0,
    vz: heavy ? 150 : 0, spin: heavy ? (Math.random() * 2 - 1) * 14 : 0, rot: 0,
    life: heavy ? .5 : .22, goo: v.goo, size,
  });
  if (!heavy) popCorpse(e.x, e.y, v.goo, size);
  // 一般史萊姆死亡不震動（怪一多會頭暈）；只有巨型倒下、且玩家在附近才震
  if (e.variant === 'giant') nearbyImpact(e.x, e.y, 8, .09);
  if (e.variant === 'splitter') {
    for (const side of [-1, 1]) {
      const spec = ACTIVE_MONSTERS.find(m => m.id === e.type) || ACTIVE_MONSTERS[0];
      const mini = createMonster(spec, e.x + side * 8, e.y, 'mini');
      if (enemyBlocked(mini.x, mini.y)) { mini.x = e.x; mini.y = e.y; }
      mini.knockT = .2; mini.knockVX = side * 110; mini.knockVY = (Math.random() * 2 - 1) * 40;
      mini.slimeClock = 0; mini.hitSquashT = .16;
      G.enemies.push(mini);
    }
    flash('分裂！', e.x, e.y - 30, v.goo);
  }
  if (e.variant === 'giant') flash(v.name + ' 倒下！', e.x, e.y - 50, '#e3c8ff');
}
function popCorpse(x, y, color, size) {
  spawnGoo(x, y, color, Math.round(9 * size), size);
  addSlimeSplat(x, y, color, 16 * size);
  G.effects.push({ ring: true, x, y: y + 6, r: 4, r2: 24 * size, life: .22, life0: .22, color });
}
// 黏液滴：往外噴、受重力落地，落地時在地上留下小污漬
function spawnGoo(x, y, color, count, power = 1) {
  G.fxGoo = G.fxGoo || [];
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2, sp = (40 + Math.random() * 80) * power;
    G.fxGoo.push({ x, y: y + 8, z: 10, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * .5,
      vz: 90 + Math.random() * 110 * power, r: 2 + Math.random() * 2.5, color });
  }
}
// 地上的黏液痕跡：幾秒後慢慢淡掉
function addSlimeSplat(x, y, color, r) {
  G.slimeSplats = G.slimeSplats || [];
  const blobs = [];
  const n = 3 + Math.floor(Math.random() * 3);
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, d = Math.random() * r * .55;
    blobs.push({ dx: Math.cos(a) * d, dy: Math.sin(a) * d * .55, rr: r * (.35 + Math.random() * .4) });
  }
  G.slimeSplats.push({ x, y: y + 10, color, blobs, t: 7, t0: 7 });
  if (G.slimeSplats.length > 80) G.slimeSplats.shift();
}

// 巨型史萊姆每次落地：地面震動＋塵環
function onGiantLand(e) {
  nearbyImpact(e.x, e.y, 3.5, 0);
  G.effects.push({ ring: true, x: e.x, y: e.y + 12, r: 10, r2: 34, life: .3, life0: .3, color: '#c9b6e8' });
}

// 巨型史萊姆登場：從黑暗處（核心模式）或入口（波次模式）悄悄出現
function updateGiantEvent() {
  if (MAP_SAFE || G.over) return;
  if (G.cores.length ? !G.cores.some(c => !c.dead) : G.waveIndex >= G.waves.length) return;   // 戰鬥已結束
  if (G.nextGiantAt == null) G.nextGiantAt = GIANT_EVENT.first;
  if (G.battleTime < G.nextGiantAt) return;
  if (G.enemies.some(e => e.variant === 'giant' && !e.dead)) return;   // 上一隻還沒倒就先等
  const cells = G.cores.length ? darkMonsterSpawnCells() : spawnCells();
  if (!cells.length) return;
  const [c, r] = cells[Math.floor(Math.random() * cells.length)];
  const [x, y] = center(c, r);
  const spec = ACTIVE_MONSTERS.find(m => m.id === 'slime');
  if (!spec) return;
  G.enemies.push(createMonster(spec, x, y, 'giant'));
  G.nextGiantAt = G.battleTime + GIANT_EVENT.every;
}

// ---- 每幀更新（在 update 裡呼叫）----
function updateCombatFeel(dt) {
  G.battleTime = (G.battleTime || 0) + dt;
  updateGiantEvent();
  updateAcidSpit(dt);
  if (G.fxCorpses) {
    for (const c of G.fxCorpses) {
      c.t += dt; c.life -= dt;
      if (c.fly) {
        c.x += c.vx * dt; c.z += c.vz * dt; c.vz -= 520 * dt; c.rot += c.spin * dt;
        if (c.life <= 0 || c.z < 0) { c.life = 0; popCorpse(c.x, c.y, c.goo, c.size); }
      }
    }
    G.fxCorpses = G.fxCorpses.filter(c => c.life > 0);
  }
  if (G.fxGoo) {
    for (const g of G.fxGoo) {
      g.x += g.vx * dt; g.y += g.vy * dt; g.z += g.vz * dt; g.vz -= 420 * dt;
      g.vx *= 1 - 1.2 * dt; g.vy *= 1 - 1.2 * dt;
      if (g.z <= 0) { g.dead = true; if (Math.random() < .35) addSlimeSplat(g.x, g.y - 10, g.color, 5 + g.r); }
    }
    G.fxGoo = G.fxGoo.filter(g => !g.dead);
  }
  if (G.slimeSplats) {
    for (const s of G.slimeSplats) s.t -= dt;
    G.slimeSplats = G.slimeSplats.filter(s => s.t > 0);
  }
}

// ---- 繪製 ----
// 地面層（角色腳下）：黏液痕跡＋自爆範圍警示
function drawCombatFeelGround(ctx) {
  drawAcidGround(ctx);   // 吐酸：酸液池、落點警示
  if (G.slimeSplats) for (const s of G.slimeSplats) {
    const a = Math.min(1, s.t / 2) * .55;   // 最後 2 秒淡出
    ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = s.color;
    for (const b of s.blobs) {
      ctx.beginPath(); ctx.ellipse(s.x + b.dx, s.y + b.dy, b.rr, b.rr * .5, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
  for (const e of G.enemies) {
    if (!(e.fuseT > 0) || !isLit(e.x, e.y)) continue;
    const p = 1 - e.fuseT / SLIME_BOMB.fuse, R = SLIME_BOMB.radius;
    ctx.save();
    ctx.globalAlpha = .12 + .2 * p; ctx.fillStyle = '#ff3b2a';
    ctx.beginPath(); ctx.ellipse(e.x, e.y + 10, R * p, R * .5 * p, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = .5 + .45 * Math.abs(Math.sin(p * 14)); ctx.strokeStyle = '#ff7b4a'; ctx.lineWidth = 2;
    ctx.setLineDash([6, 5]);
    ctx.beginPath(); ctx.ellipse(e.x, e.y + 10, R, R * .5, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
}
// 角色上層：被打飛的屍體與飛濺的黏液
function drawCombatFeelTop(ctx) {
  drawAcidTop(ctx);      // 吐酸：飛行中的酸液球
  if (G.fxCorpses) for (const c of G.fxCorpses) {
    if (!isLit(c.x, c.y)) continue;
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    if (c.fly) {
      ctx.translate(c.x, c.y + 13 - c.z - c.h / 2); ctx.rotate(c.rot);
      ctx.globalAlpha = Math.min(1, c.life / .15);
      if (c.img.width) ctx.drawImage(c.img, -c.w / 2, -c.h / 2, c.w, c.h);
    } else {
      // 閃白＋膨脹後消失
      const p = Math.min(1, c.t / .22), s = 1 + .35 * p;
      ctx.translate(c.x, c.y + 13 - c.z);
      ctx.globalAlpha = 1 - p * .8;
      if (c.img.width) {
        ctx.drawImage(c.img, -c.w * s / 2, -c.h * s, c.w * s, c.h * s);
        const white = flashSprite(c.img, '#ffffff');
        if (white) { ctx.globalAlpha = (1 - p) * .9; ctx.drawImage(white, -c.w * s / 2, -c.h * s, c.w * s, c.h * s); }
      }
    }
    ctx.restore();
  }
  if (G.fxGoo) for (const g of G.fxGoo) {
    ctx.fillStyle = g.color; ctx.globalAlpha = .9;
    ctx.beginPath(); ctx.arc(g.x, g.y - g.z, g.r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ============================================================
//  爆擊
// ============================================================
// 爆擊：chance 機率、mul 傷害倍率（哨兵一般攻擊與玩家開槍才會爆擊；大招不會）
const CRIT = { sentry: { chance: .12, mul: 1.8 }, player: { chance: .1, mul: 2 } };
function rollCrit(kind) {
  const c = CRIT[kind] || CRIT.sentry;
  return Math.random() < c.chance ? c.mul : 0;
}
// 爆擊傷害數字：金色大字＋「爆擊」小標，停留比較久
function flashCrit(text, x, y) {
  addStat('crits');   // 成就計數
  G.effects.push({ dmg: true, crit: true, text, x, y, vy: -40, life: .95, life0: .95, color: '#ffd84a' });
  G.effects.push({ ring: true, x, y: y + 18, r: 6, r2: 30, life: .25, life0: .25, color: '#ffe27a' });
  if (G.player && Math.hypot(G.player.x - x, G.player.y - y) <= SHAKE_FEEL.range * CELL) addHitstop(.04);
}

// ============================================================
//  吐酸史萊姆：蓄力（地上出現落點警示）→ 吐出拋物線酸液 → 落地留下一灘會傷人的酸液
// ============================================================
// 每幀在 updateEnemyFeel 呼叫；回傳 true 代表正在蓄力或剛吐完，這幀不移動
function updateSpitter(e, dt) {
  e.spitCd = Math.max(0, (e.spitCd || 0) - dt);
  if (e.spitWindT > 0 && e.spitGoal) {   // 蓄力：先壓扁鼓起
    e.spitWindT -= dt;
    const p = 1 - Math.max(0, e.spitWindT) / SLIME_SPIT.windup;
    e.slimeLift = 0; e.slimeScaleX = 1 + .16 * p; e.slimeScaleY = 1 - .2 * p;
    if (e.spitWindT <= 0) launchAcidSpit(e);
    return true;
  }
  if (e.spitRecoverT > 0) {   // 吐完：往上拉長再回彈
    e.spitRecoverT -= dt;
    e.slimeLift = 0; e.slimeScaleX = .86; e.slimeScaleY = 1.2;
    return true;
  }
  if (e.spitCd > 0 || e.stunT > 0 || e.confuseT > 0 || !isLit(e.x, e.y)) return false;   // 在黑暗裡不吐（玩家看不到蓄力就太不公平）
  // 目標：射程內最近的玩家或哨兵
  let best = null, bestD = SLIME_SPIT.range * CELL;
  const consider = o => {
    const d = Math.hypot(o.x - e.x, o.y - e.y);
    if (d >= SLIME_SPIT.minRange * CELL && d <= bestD) { best = o; bestD = d; }
  };
  if (G.player && G.player.hp > 0) consider(G.player);
  for (const t of G.towers) if (t.hp > 0) consider(t);
  if (!best) return false;
  e.spitWindT = SLIME_SPIT.windup;
  e.spitGoal = { x: best.x, y: best.y + 6 };   // 鎖定蓄力開始當下的位置，看到警示就能閃開
  e.playerWindupT = 0; e.playerPounceGoal = null;
  return true;
}
function launchAcidSpit(e) {
  const g = e.spitGoal; e.spitGoal = null;
  const d = Math.hypot(g.x - e.x, g.y - e.y);
  (G.acidShots = G.acidShots || []).push({
    x0: e.x, y0: e.y - 8, x1: g.x, y1: g.y, t: 0,
    dur: Math.max(.4, Math.min(.9, d / (SLIME_SPIT.flySpeed * CELL))), h: 34 + d * .18, trailT: 0,
  });
  e.spitCd = SLIME_SPIT.cooldown; e.spitRecoverT = .22;
  if (typeof sfxAt === 'function') sfxAt('knock2', e.x, e.y, .35, 'spitter');
}
function updateAcidSpit(dt) {
  if (G.acidShots) {
    for (const s of G.acidShots) {
      s.t += dt;
      s.trailT -= dt;
      if (s.trailT <= 0 && s.t < s.dur) {   // 飛行中滴落的小酸滴
        s.trailT = .05;
        const [x, y, z] = acidShotPos(s);
        (G.fxGoo = G.fxGoo || []).push({ x, y: y + 8, z: z + 2, vx: (Math.random() * 2 - 1) * 15, vy: 0, vz: -10, r: 1.5 + Math.random(), color: SLIME_VARIANTS.spitter.goo });
      }
      if (s.t >= s.dur) { s.done = true; addSpitPool(s.x1, s.y1); }
    }
    G.acidShots = G.acidShots.filter(s => !s.done);
  }
  if (G.spitPools) {
    const P = SLIME_SPIT.pool;
    for (const pool of G.spitPools) {
      pool.t -= dt;
      if (pool.t <= 0) continue;
      const inPool = o => { const dx = o.x - pool.x, dy = (o.y - pool.y) / .6; return dx * dx + dy * dy <= pool.r * pool.r; };
      const p = G.player;
      if (p && p.hp > 0 && inPool(p)) {
        p.hp = Math.max(0, p.hp - P.playerDps * dt);
        p.hitT = Math.max(p.hitT || 0, .15); G.damageVignetteT = Math.max(G.damageVignetteT || 0, .25);
        p.acidTick = (p.acidTick || 0) - dt;
        if (p.acidTick <= 0) { p.acidTick = .5; flashDmg('-' + Math.round(P.playerDps * .5), p.x, p.y - 46, '#d4e04a'); }
        if (p.hp <= 0 && !G.over) { flash('部隊長失去戰鬥能力', p.x, p.y - 58, '#ff5b6e'); lose(); }
      }
      for (const t of G.towers) {
        if (t.hp <= 0 || !inPool(t)) continue;
        const def = Math.max(0, Math.min(.75, TYPES[t.type]?.defense || 0));
        t.hp = Math.max(0, t.hp - P.sentryDps * (1 - def) * dt);
        t.hitT = Math.max(t.hitT || 0, .12); t.hitColor = '#d4e04a';
        if (t.hp <= 0) { t.target = null; sentryStatus(t, '失去戰鬥能力', '#ff5b6e', true); }
      }
      pool.fizzT -= dt;   // 冒泡
      if (pool.fizzT <= 0) {
        pool.fizzT = .12 + Math.random() * .15;
        const a = Math.random() * Math.PI * 2, rr = Math.random() * pool.r * .8;
        pool.bubbles.push({ x: Math.cos(a) * rr, y: Math.sin(a) * rr * .6, t: 0, life: .5 + Math.random() * .4, r: 1.5 + Math.random() * 2.5 });
      }
      for (const b of pool.bubbles) b.t += dt;
      pool.bubbles = pool.bubbles.filter(b => b.t < b.life);
    }
    G.spitPools = G.spitPools.filter(pool => pool.t > 0);
  }
}
function acidShotPos(s) {
  const p = Math.min(1, s.t / s.dur);
  return [s.x0 + (s.x1 - s.x0) * p, s.y0 + (s.y1 - s.y0) * p, 4 * s.h * p * (1 - p)];
}
function addSpitPool(x, y) {
  const P = SLIME_SPIT.pool, r = P.radius * CELL;
  (G.spitPools = G.spitPools || []).push({ x, y, r, t: P.life, t0: P.life, shape: scorchShape(r, 18), bubbles: [], fizzT: 0 });
  spawnGoo(x, y - 8, SLIME_VARIANTS.spitter.goo, 8, .9);
  G.effects.push({ ring: true, x, y, r: 4, r2: r * 1.1, life: .25, life0: .25, color: '#e6f06a' });
  if (typeof sfxAt === 'function') sfxAt('corrosionImpact', x, y, .45, 'spitter-land');
}
// 地面層：酸液池＋落點警示（蓄力中、飛行中）
function drawAcidGround(ctx) {
  if (G.spitPools) for (const pool of G.spitPools) {
    const a = Math.min(1, (pool.t0 - pool.t) / .2, pool.t / 1);   // 0.2 秒擴散開、最後 1 秒淡掉
    const grow = Math.min(1, (pool.t0 - pool.t) / .2);
    ctx.save(); ctx.translate(pool.x, pool.y); ctx.scale(1, .6);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, pool.r);
    g.addColorStop(0, `rgba(196,220,60,${(.75 * a).toFixed(3)})`);
    g.addColorStop(.7, `rgba(140,175,30,${(.6 * a).toFixed(3)})`);
    g.addColorStop(1, `rgba(90,120,20,${(.45 * a).toFixed(3)})`);
    ctx.fillStyle = g; scorchPath(ctx, pool.shape, .4 + .6 * grow); ctx.fill();
    ctx.globalAlpha = .5 * a; ctx.strokeStyle = '#f0ff8a'; ctx.lineWidth = 1.5;   // 亮綠邊緣，提醒會受傷
    scorchPath(ctx, pool.shape, .4 + .6 * grow); ctx.stroke();
    for (const b of pool.bubbles) {   // 泡泡：長大後破掉
      const k = b.t / b.life;
      ctx.globalAlpha = a * (k < .8 ? .85 : (1 - k) * 4);
      ctx.strokeStyle = '#f4ffa0'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(b.x, b.y / .6, b.r * (.4 + k), 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
  }
  const warn = (x, y, k) => {   // 落點警示：黃綠色虛線圈，越接近落地越滿
    const R = SLIME_SPIT.pool.radius * CELL;
    ctx.save();
    ctx.globalAlpha = .15 + .2 * k; ctx.fillStyle = '#c8e040';
    ctx.beginPath(); ctx.ellipse(x, y, R * k, R * .6 * k, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = .7; ctx.strokeStyle = '#e6f06a'; ctx.lineWidth = 2; ctx.setLineDash([5, 4]);
    ctx.beginPath(); ctx.ellipse(x, y, R, R * .6, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  };
  for (const e of G.enemies) if (e.spitWindT > 0 && e.spitGoal && isLit(e.x, e.y)) warn(e.spitGoal.x, e.spitGoal.y, .4 * (1 - e.spitWindT / SLIME_SPIT.windup));
  if (G.acidShots) for (const s of G.acidShots) warn(s.x1, s.y1, .4 + .6 * Math.min(1, s.t / s.dur));
}
// 角色上層：飛行中的酸液球（地上有影子）
function drawAcidTop(ctx) {
  if (!G.acidShots) return;
  for (const s of G.acidShots) {
    const [x, y, z] = acidShotPos(s);
    ctx.save();
    ctx.globalAlpha = .3; ctx.fillStyle = '#0a1005';
    ctx.beginPath(); ctx.ellipse(x, y + 8, 6, 2.5, 0, 0, Math.PI * 2); ctx.fill();
    const by = y - z;
    const g = ctx.createRadialGradient(x - 1.5, by - 1.5, 0, x, by, 9);
    g.addColorStop(0, 'rgba(250,255,190,1)'); g.addColorStop(.45, 'rgba(210,230,70,.95)'); g.addColorStop(1, 'rgba(150,190,30,0)');
    ctx.globalAlpha = 1; ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, by, 9, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
}
