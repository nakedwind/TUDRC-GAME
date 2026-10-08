// ============================================================
//  異質碎片礦物：用地圖編輯器擺在地圖上（素材在 images/item-obstacle/09～11-ore-*.png）。
//  礦物很硬，徒手挖不開。能打開礦物的方法：
//    ・地雷爆炸（油桶炸不開，但油桶爆炸可以引爆旁邊的地雷）
//    ・瓦斯爐爆炸（威力比較小，js/oil-barrels.js）
//    ・路德：打怪時礦物剛好在拳頭的攻擊範圍內，會被震裂，打幾下就碎（暴走時更快）
//    ・阿瓦倫：打怪時腐蝕剛好噴到礦物，礦物泡在腐蝕池裡久了會溶解
//    （哨兵不會主動去打礦物，只會在攻擊範圍剛好涵蓋礦物時波及）
//    ・希奧妮：大招的小爆炸會炸開礦物
//    ・安柏：雷電打偏時，有機率劈中附近的礦物
//  炸開後異質碎片會散落在地上，溫特走過去就會撿起來，畫面中間跳出拾取提示。
//  礦物每次出勤重新出現；在黑暗中會發出淡淡的紫光，方便發現。
//  （數值集中在最上面，想調整改這裡就好）
// ============================================================
// crystals：炸開後總共掉幾個異質碎片；shards：分成幾塊掉在地上；glow：黑暗中的紫光亮度
const ORE_TYPES = {
  ore_small: { name: '小型異質礦', file: 'images/item-obstacle/09-ore-small.png', crystals: 8,  shards: 3, glow: .22 },
  ore_large: { name: '大型異質礦', file: 'images/item-obstacle/10-ore-large.png', crystals: 20, shards: 5, glow: .32 },
  ore_rare:  { name: '稀有紫晶礦', file: 'images/item-obstacle/11-ore-rare.png',  crystals: 50, shards: 8, glow: .55 },
};
const ORE_BLAST_PAD = .6;   // 爆炸半徑外再多算幾格也會炸到礦物（礦物本身有一格大）
const SHARD = { magnet: 90, pickup: 24, delay: .45 };   // 多近會被吸過來、多近算撿到（像素）；落地後幾秒才能撿
// 路德的拳頭剛好波及礦物：hits＝敲幾下會碎（暴走時每下算 2 下）；pad＝攻擊範圍外再多算幾格
const ORE_LUTHER = { hits: 4, pad: .5 };
const ORE_DISSOLVE = 3;                       // 礦物泡在腐蝕池裡累積幾秒會溶解
const ORE_STRAY = { chance: .4, range: 3 };   // 安柏打偏時：多少機率劈中目標附近幾格內的礦物
const ORE_THEONIE_R = 1.2;                    // 希奧妮大招的爆炸半徑（格）

const oreByFile = file => Object.entries(ORE_TYPES).find(([, spec]) => file.endsWith(spec.file.replace('images/', ''))) || null;
const oreCenter = o => ({ x: OX + (o.c + .5) * CELL, y: OY + (o.r + .5) * CELL });

// 靠近礦物時的提示（礦物在 1.5 格內）
function oreNearPlayer() {
  const p = G && G.player; if (!p || p.sitting || p.hp <= 0) return null;
  let best = null, bestD = 1.5 * CELL;
  for (const o of G.obstacles) {
    if (!o.ore || o.hp <= 0) continue;
    const c = oreCenter(o), d = Math.hypot(c.x - p.x, c.y - p.y);
    if (d < bestD) { best = o; bestD = d; }
  }
  return best;
}
// 對著礦物按互動鍵：提醒打開礦物的方法
function oreHint(o) {
  const c = oreCenter(o);
  flash('太硬了！要用地雷或瓦斯爐炸開', c.x, c.y - 34, '#d6b8ff', 1.4);
  sfx('error');
}

// ---- 爆炸：地雷（js/landmine.js）、瓦斯爐（js/oil-barrels.js）、希奧妮大招（js/attack-fx.js）爆炸時呼叫 ----
function blastOres(x, y, R) {
  if (!G) return;
  for (const o of [...G.obstacles]) {
    if (!o.ore || o.hp <= 0) continue;
    const c = oreCenter(o);
    if (Math.hypot(c.x - x, c.y - y) <= R + ORE_BLAST_PAD * CELL) breakOre(o, x, y);
  }
}
function breakOre(o, bx, by, msg) {
  const spec = ORE_TYPES[o.type], c = oreCenter(o);
  o.lastHitBy = 'demolish';
  removeBarrier(o);
  // 碎片：總數平均分給每一塊，往爆炸的反方向噴出去
  G.oreShards = G.oreShards || [];
  const away = Math.atan2(c.y - by, c.x - bx) || 0;
  for (let i = 0; i < spec.shards; i++) {
    const value = Math.floor(spec.crystals / spec.shards) + (i < spec.crystals % spec.shards ? 1 : 0);
    const a = away + (Math.random() - .5) * 2.2, sp = 70 + Math.random() * 90;
    G.oreShards.push({ x: c.x, y: c.y, z: 4, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * .7, vz: 160 + Math.random() * 120,
      value, t: 0, spin: Math.random() * 6, rare: o.type === 'ore_rare' });
  }
  // 畫面：紫色爆光、碎石
  G.effects.push({ ring: true, x: c.x, y: c.y, r: 6, r2: 52, life: .5, life0: .5, color: '#d69bff' });
  for (let i = 0; i < 12; i++) {
    const a = Math.random() * Math.PI * 2, sp = 60 + Math.random() * 120;
    G.effects.push({ ember: true, spark: true, x: c.x, y: c.y - 6, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * .6 - 60,
      r: 1.5 + Math.random() * 2, life: .5 + Math.random() * .3, life0: .8, color: '#c47dff' });
  }
  if (typeof spawnGoo === 'function') spawnGoo(c.x, c.y - 4, '#6b6372', 8, 1.1);   // 碎石
  flash(msg || spec.name + ' 炸開了！', c.x, c.y - 40, '#d69bff', 1.6);
  if (typeof sfxAt === 'function') sfxAt('glassBreak3', c.x, c.y, .6, 'ore-break');
}

// ---- 每幀更新（在 update 裡呼叫）：碎片噴飛、落地、被溫特吸過去撿起來 ----
function updateOre(dt) {
  updateOreDissolve(dt);
  const list = G.oreShards; if (!list || !list.length) return;
  const p = G.player;
  for (const s of list) {
    s.t += dt; s.spin += dt * 4;
    if (s.z > 0 || s.vz > 0) {   // 還在空中：拋物線＋落地彈一下
      s.vz -= 620 * dt; s.z += s.vz * dt;
      if (s.z <= 0) { s.z = 0; s.vz = Math.abs(s.vz) > 60 ? -s.vz * .32 : 0; s.vx *= .55; s.vy *= .55; }
    }
    const nx = s.x + s.vx * dt, ny = s.y + s.vy * dt;
    // 溫特站不到的地方，碎片也不會落進去（已經卡在裡面時允許滑出來）
    const blocked = (x, y) => typeof playerBlocked === 'function' ? playerBlocked(x, y) : solidBlocksPoint(x, y);
    if (blocked(nx, ny) && !blocked(s.x, s.y)) { s.vx = 0; s.vy = 0; }
    else { s.x = nx; s.y = ny; }
    if (s.z === 0) { s.vx *= Math.pow(.02, dt); s.vy *= Math.pow(.02, dt); }   // 在地上滑一下就停
    if (!p || p.hp <= 0 || s.t < SHARD.delay) continue;
    const d = Math.hypot(p.x - s.x, p.y - s.y);
    if (d < SHARD.magnet) {   // 靠近就被吸過去
      const k = Math.min(1, (420 + (SHARD.magnet - d) * 8) * dt / Math.max(d, 1));
      s.x += (p.x - s.x) * k; s.y += (p.y - s.y) * k;
    }
    if (d < SHARD.pickup) s.picked = true;
  }
  const picked = list.filter(s => s.picked);
  if (picked.length) {
    const total = picked.reduce((sum, s) => sum + s.value, 0);
    earnCrystals(total);
    G.oreShards = list.filter(s => !s.picked);
    showPickupToast(total);
    flash('+' + total, p.x, p.y - 50, '#d69bff', .9);
    SFX.play('crystalGet', .7, 'shard-pickup');
    updateHUD();
  }
}

function nearestOreTo(x, y, maxD) {
  let best = null, bestD = maxD;
  for (const o of G.obstacles) {
    if (!o.ore || o.hp <= 0) continue;
    const c = oreCenter(o), d = Math.hypot(c.x - x, c.y - y);
    if (d < bestD) { best = o; bestD = d; }
  }
  return best;
}
// ---- 路德：打怪時拳頭的攻擊範圍剛好涵蓋礦物，礦物會被震裂（js/game.js 哨兵命中時呼叫）----
function sentryHitOre(t, point, splashPx) {
  const spec = TYPES[t.type];
  if (!spec || spec.ability !== '怪力' || !G) return;
  const R = Math.max(splashPx || 0, CELL * .6) + ORE_LUTHER.pad * CELL;
  for (const o of [...G.obstacles]) {
    if (!o.ore || o.hp <= 0) continue;
    const c = oreCenter(o);
    if (Math.hypot(c.x - point.x, c.y - point.y) > R) continue;
    o.hitT = HIT_DUR * .7;
    o.oreHits = (o.oreHits || 0) + (t.berserk ? 2 : 1);
    if (o.oreHits >= ORE_LUTHER.hits) breakOre(o, t.x, t.y, '路德的怪力把礦物震碎了！');
  }
}
// ---- 腐蝕：礦物泡在腐蝕池裡會慢慢溶解（阿瓦倫的腐蝕池；異質核心腳下的不算）----
function updateOreDissolve(dt) {
  const pools = (G.acidPools || []).filter(p => p.t > 0 && !p.noEnemy);
  if (!pools.length) return;
  for (const o of [...G.obstacles]) {
    if (!o.ore || o.hp <= 0) continue;
    const c = oreCenter(o);
    if (!pools.some(p => Math.hypot(p.x - c.x, p.y - c.y) <= p.r + 16)) continue;
    o.dissolve = (o.dissolve || 0) + dt;
    o.fizzT = (o.fizzT || 0) - dt;
    if (o.fizzT <= 0) {   // 冒泡、礦物微微閃光
      o.fizzT = .35; o.hitT = HIT_DUR * .5;
      G.effects.push({ ember: true, x: c.x + (Math.random() - .5) * 18, y: c.y + 4, vx: 0, vy: -30 - Math.random() * 20, r: 2 + Math.random() * 2, life: .5, life0: .5, color: '#9c5cff' });
    }
    if (o.dissolve >= ORE_DISSOLVE) breakOre(o, c.x, c.y + 1, '礦物被腐蝕溶解了！');
  }
}
// ---- 安柏：雷電打偏時，有機率劈中附近的礦物（js/game.js 打偏時呼叫）----
function strayBoltOre(t, target) {
  const spec = TYPES[t.type];
  if (!spec || spec.ability !== '雷電' || Math.random() >= ORE_STRAY.chance) return;
  const o = nearestOreTo(target.x, target.y, ORE_STRAY.range * CELL);
  if (!o) return;
  const c = oreCenter(o);
  if (Math.hypot(c.x - t.x, c.y - t.y) > (spec.range + 1) * CELL) return;
  const hitPoint = { x: c.x, y: c.y - 4, hp: 1, maxhp: 1 };
  spawnAttackVisual(t, hitPoint, spec, [], hitPoint);
  breakOre(o, t.x, t.y, '雷打偏了……劈開了礦物！');
}

// ---- 黑暗中的紫光（只影響畫面，js/lighting.js 會呼叫）----
function oreGlowLights() {
  if (!G || !G.obstacles) return [];
  const now = performance.now() / 1000;
  const lights = G.obstacles.filter(o => o.ore && o.hp > 0).map(o => {
    const c = oreCenter(o), spec = ORE_TYPES[o.type];
    return { x: c.x, y: c.y - 6, r: 70 + spec.glow * 60, life: 1, life0: 1,
      power: spec.glow * (.8 + .2 * Math.sin(now * 2 + o.c * 1.7 + o.r)), color: [190, 110, 255] };
  });
  for (const s of G.oreShards || []) lights.push({ x: s.x, y: s.y, r: 44, life: 1, life0: 1, power: .3, color: [190, 110, 255] });
  return lights;
}

// ---- 繪製 ----
// 地上的碎片（畫在地面層，角色腳下）
function drawOreShards(ctx) {
  const list = G.oreShards; if (!list || !list.length) return;
  const now = performance.now() / 1000;
  for (const s of list) {
    const bob = s.z === 0 ? Math.sin(now * 3 + s.spin) * 1.5 : 0;
    const x = s.x, y = s.y - s.z - 6 + bob;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(s.x, s.y + 2, 6, 2.5, 0, 0, Math.PI * 2); ctx.fill();   // 影子
    const g = ctx.createRadialGradient(x, y, 0, x, y, 13);   // 光暈
    g.addColorStop(0, s.rare ? 'rgba(240,170,255,.55)' : 'rgba(200,130,255,.45)'); g.addColorStop(1, 'rgba(180,100,255,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 13, 0, Math.PI * 2); ctx.fill();
    ctx.translate(x, y); ctx.rotate(Math.sin(s.spin) * .35);
    ctx.beginPath(); ctx.moveTo(0, -7); ctx.lineTo(4, -1); ctx.lineTo(0, 6); ctx.lineTo(-4, -1); ctx.closePath();   // 菱形結晶
    ctx.fillStyle = '#5b2e8c'; ctx.fill(); ctx.lineWidth = 1.2; ctx.strokeStyle = '#140419'; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -7); ctx.lineTo(-4, -1); ctx.lineTo(0, 1); ctx.closePath(); ctx.fillStyle = '#b07cff'; ctx.fill();   // 亮面
    ctx.fillStyle = '#fff'; ctx.fillRect(-1, -4, 1.5, 1.5);   // 反光
    ctx.restore();
  }
}
// 靠近礦物時的提示（沒有按鍵，只說明要用爆炸）
function drawOreHint(o) {
  const c = oreCenter(o), spec = ORE_TYPES[o.type];
  const label = '💣 ' + spec.name + '：用地雷或瓦斯爐炸開';
  ctx.save();
  ctx.font = 'bold 12px sans-serif'; ctx.textBaseline = 'alphabetic';
  const w = ctx.measureText(label).width + 18, h = 22, x = Math.round(c.x - w / 2), y = Math.round(c.y - 30 - h - 8);
  ctx.fillStyle = 'rgba(20,10,30,.88)'; roundRect(x, y, w, h, 6); ctx.fill();
  ctx.strokeStyle = 'rgba(214,155,255,.8)'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = '#efe0ff'; ctx.textAlign = 'center'; ctx.fillText(label, c.x, y + 15);
  ctx.restore();
}

// ---- 拾取提示（畫面中間偏上彈出；短時間內連續撿到會合併成一則）----
let pickupToast = null;
function showPickupToast(amount) {
  const box = document.getElementById('pickupToasts'); if (!box) return;
  const now = performance.now();
  if (pickupToast && now - pickupToast.at < 1800 && box.contains(pickupToast.el)) {
    pickupToast.total += amount; pickupToast.at = now;
    pickupToast.el.querySelector('b').textContent = '+' + pickupToast.total;
    pickupToast.el.querySelector('small').textContent = '持有 ' + training.crystals;
    pickupToast.el.classList.remove('bump'); void pickupToast.el.offsetWidth; pickupToast.el.classList.add('bump');
    clearTimeout(pickupToast.timer);
  } else {
    const el = document.createElement('div');
    el.className = 'pickup-toast';
    el.innerHTML = `<i aria-hidden="true"></i><span>異質碎片 <b>+${amount}</b></span><small>持有 ${training.crystals}</small>`;
    box.appendChild(el);
    pickupToast = { el, total: amount, at: now };
  }
  const t = pickupToast;
  t.timer = setTimeout(() => { t.el.classList.add('leaving'); setTimeout(() => t.el.remove(), 400); if (pickupToast === t) pickupToast = null; }, 2200);
}
