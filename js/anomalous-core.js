/* ===== 異質核心 =====
   - 沉睡：立在地上，慢慢召喚異質體（跟以前一樣）。
   - 甦醒：只有溫特開槍打中、或阿瓦倫靠近才會醒來（哨兵不會去打沉睡的核心）——浮到空中載浮載沉、發光、
           飄出黑色與紫色粒子，腳下出現腐蝕痕跡（溫特和哨兵站上去會扣血；阿瓦倫、異質體免疫）。
   - 第一階段：甦醒後召喚更多異質體。
   - 第二階段：血量剩一半以下，召喚得更多、更快，召喚出來的異質體也跑得更快。
   - 被打破：核心碎裂成好幾塊飛散（碎片、閃光、衝擊波、紫黑粒子）。
   數值都在下面的 CORE 表格。
*/
const CORE = {
  image: 'images/background/Anomalous-Core.png',
  w: 80, h: 120,                 // 圖片大小（像素）
  hp: 200,                       // 每一級難度的血量
  reward: 100,                   // 每一級難度的結晶獎勵
  wakeAvarenCells: 4,            // 阿瓦倫走到幾格內，核心就會醒來
  float: { height: 18, bob: 5, rise: .9 },   // 甦醒後浮起的高度、上下飄動幅度、浮起需要幾秒
  pool: { r: 46, dps: 8 },       // 腳下腐蝕痕跡：半徑（像素）、每秒傷害
  phase2At: .5,                  // 血量比例低於多少進入第二階段
  maxEnemies: 60,                // 場上異質體上限
  spawn: {                       // every＝每隔幾秒召喚一批（最短～最長）；group＝一批幾隻；speed＝召喚出的怪物速度倍率
    dormant: { every: [2.6, 6.8], group: [1, 3], speed: 1 },
    phase1:  { every: [1.8, 3.6], group: [2, 4], speed: 1 },
    phase2:  { every: [1.1, 2.4], group: [3, 5], speed: 1.35 },
  },
  shards: 11,                    // 打破時碎成幾塊
};
const coreImg = new Image(); coreImg.src = CORE.image;
const randRange = ([lo, hi]) => lo + Math.random() * (hi - lo);

function seedCores() {
  G.cores = []; G.coreShards = [];
  if (MAP_SAFE) return;
  const map = typeof MAP !== 'undefined' ? MAP : {};
  const difficulty = Math.max(1, Math.min(5, Number(map.difficulty) || 1));
  const count = Math.max(1, Math.min(20, Math.floor(Number(map.coreCount) || difficulty)));
  // 新地圖從編輯器指定的候選點抽取；舊地圖保留原入口作為相容候選點。
  const marked = Array.isArray(map.coreSpots) && map.coreSpots.length
    ? map.coreSpots.map(key => key.split(',').map(Number)) : spawnCells();
  const seen = new Set();
  const cells = marked.filter(([c, r]) => {
    const key = c + ',' + r;
    if (seen.has(key) || !inGrid(c, r) || isWall(c, r) || G.grid[key]) return false;
    seen.add(key); return true;
  });
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }
  for (let i = 0; i < Math.min(count, cells.length); i++) {
    const [c, r] = cells[i];
    const [x, y] = center(c, r);
    const hp = CORE.hp * difficulty;
    G.cores.push({ x, y, hp, maxhp: hp, lastHp: hp, dead: false, awake: false, phase: 0, awakeT: 0,
      timer: 1.8 + i * .7 + Math.random() * 2.4, reward: CORE.reward * difficulty, moteT: 0, hitT: 0, seed: Math.random() * 10 });
  }
}
function darkMonsterSpawnCells() {
  const recent = new Set((G.recentMonsterSpawns || []).slice(-12));
  const candidates = [], fallback = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const key = c + ',' + r;
    if (isWall(c, r) || G.grid[key]) continue;
    const [x, y] = center(c, r);
    if (G.player && Math.hypot(x - G.player.x, y - G.player.y) < CELL * 4) continue;
    if (G.towers.some(t => t.hp > 0 && Math.hypot(x - t.x, y - t.y) < CELL * 3)) continue;
    if (!cellLit(c, r)) {
      fallback.push([c, r]);
      if (!recent.has(key) && !G.enemies.some(e => Math.hypot(x - e.x, y - e.y) < CELL * 1.5)) candidates.push([c, r]);
    }
  }
  return candidates.length ? candidates : fallback;
}
function coreSpawnRule(core) {
  return !core.awake ? CORE.spawn.dormant : core.phase === 2 ? CORE.spawn.phase2 : CORE.spawn.phase1;
}
function spawnCoreGroup(core) {
  const cells = darkMonsterSpawnCells();
  if (!cells.length) return;
  const rule = coreSpawnRule(core);
  const want = Math.round(randRange([rule.group[0], rule.group[1] + .99]) - .49);
  const count = Math.min(want, CORE.maxEnemies - G.enemies.length, cells.length);
  for (let i = 0; i < count; i++) {
    const index = Math.floor(Math.random() * cells.length), [c, r] = cells.splice(index, 1)[0];
    const [x, y] = center(c, r);
    const m = createMonster(chooseMonster(MAP, ACTIVE_MONSTERS), x, y);
    m.speed *= rule.speed;   // 第二階段：召喚出的異質體跑得更快
    G.enemies.push(m);
    G.recentMonsterSpawns = G.recentMonsterSpawns || [];
    G.recentMonsterSpawns.push(c + ',' + r);
    if (G.recentMonsterSpawns.length > 18) G.recentMonsterSpawns.shift();
  }
}

// ---- 甦醒與階段 ----
function wakeCore(core) {
  if (core.awake || core.dead) return;
  core.awake = true; core.phase = 1; core.awakeT = 0;
  core.timer = Math.min(core.timer, .8);   // 醒來後很快就召喚第一批
  // 腳下的腐蝕痕跡：沿用阿瓦倫腐蝕池（扣溫特與哨兵的血、哨兵會避開、冒黑霧），但不傷異質體
  const blobs = [];
  for (let i = 0; i < 4; i++) blobs.push({ dx: (Math.random() * 2 - 1) * CORE.pool.r * .5, dy: (Math.random() * 2 - 1) * CORE.pool.r * .35, rr: CORE.pool.r * (.55 + Math.random() * .5) });
  core.pool = { x: core.x, y: core.y + 8, r: CORE.pool.r, t: 999, t0: 999, dps: CORE.pool.dps, blobs, fizz: 0, noEnemy: true, fromCore: true };
  (G.acidPools = G.acidPools || []).push(core.pool);
  core.scorch = null; keepCoreScorch(core);
  // 甦醒表演：紫色衝擊波、黑紫霧、附近震動
  G.effects.push({ ring: true, x: core.x, y: core.y, r: 8, r2: 90, life: .5, life0: .5, color: '#b56bff' });
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (Math.random() * 2 - 1) * 1.6, sp = 8 + Math.random() * 16;
    pushCorrosionMist(core.x + (Math.random() * 2 - 1) * 14, core.y + (Math.random() * 2 - 1) * 6, Math.cos(a) * sp, Math.sin(a) * sp);
  }
  nearbyImpact(core.x, core.y, 5, 0);
  if (typeof sfxAt === 'function') sfxAt('corrosionImpact', core.x, core.y, .7, 'core-wake');
  flash('異質核心甦醒了！', core.x, core.y - CORE.h, '#d69bff');
  systemNotice('異質核心甦醒了！異質體開始大量湧出', true);
  if (typeof openAutoDoors === 'function') openAutoDoors('core-awake');   // 地圖上的自動門跟著打開
}
function enterPhase2(core) {
  core.phase = 2;
  G.effects.push({ ring: true, x: core.x, y: core.y, r: 10, r2: 130, life: .6, life0: .6, color: '#ff5fd2' });
  G.effects.push({ ring: true, x: core.x, y: core.y, r: 6, r2: 80, life: .4, life0: .4, color: '#ffffff' });
  addLightFlash('core', core.x, core.y - 40, .6);
  nearbyImpact(core.x, core.y, 7, .05);
  flash('核心狂暴化！', core.x, core.y - CORE.h, '#ff7ae0');
  systemNotice('異質核心進入第二階段！異質體更多、更快', true);
}
// 腐蝕痕跡的焦痕要一直留著（焦痕本身會倒數消失，這裡持續補時間；被擠出清單就重新加回）
function keepCoreScorch(core) {
  const st = SCORCH.styles.corrosion;
  if (!core.scorch || !(G.scorchMarks || []).includes(core.scorch)) {
    addScorchMark(core.pool.x, core.pool.y, CORE.pool.r, core.pool, 'corrosion');
    core.scorch = G.scorchMarks[G.scorchMarks.length - 1];
  }
  core.scorch.t = Math.max(core.scorch.t, st.life - .3);
}

function updateCores(dt) {
  for (const core of G.cores) {
    if (core.dead) continue;
    if (core.hitT > 0) core.hitT -= dt;
    if (core.hp < core.lastHp) {
      if (core.awake) core.hitT = .16;
      else core.hp = core.lastHp;   // 沉睡中不會受傷（只有溫特的槍能叫醒它，見 game.js）
    }
    core.lastHp = core.hp;
    if (!core.awake && G.towers.some(t => t.type === 'avaren' && t.hp > 0 && Math.hypot(t.x - core.x, t.y - core.y) <= CORE.wakeAvarenCells * CELL)) wakeCore(core);
    if (core.awake) {
      core.awakeT += dt;
      if (core.phase === 1 && core.hp > 0 && core.hp <= core.maxhp * CORE.phase2At) enterPhase2(core);   // 一擊打破時不再跳第二階段
      keepCoreScorch(core);
      core.pool.t = 999;
      core.moteT -= dt;
      while (core.moteT <= 0) {   // 黑色、紫色粒子從核心周圍飄出
        core.moteT += core.phase === 2 ? .05 : .09;
        const lift = coreLift(core), a = Math.random() * Math.PI * 2, rr = 10 + Math.random() * 26;
        const dark = Math.random() < .45, L = .9 + Math.random() * .9;
        G.effects.push({ coreMote: true, dark, x: core.x + Math.cos(a) * rr, y: core.y - 50 - lift + Math.sin(a) * rr * 1.3,
          vx: Math.cos(a) * (6 + Math.random() * 14), vy: -(10 + Math.random() * 22), r: 1.4 + Math.random() * 2.4, life: L, life0: L });
      }
    }
    core.timer -= dt;
    if (core.timer <= 0 && G.enemies.length < CORE.maxEnemies) {
      spawnCoreGroup(core);
      core.timer = randRange(coreSpawnRule(core).every);
    }
  }
  updateCoreShards(dt);
}
// 浮起高度：甦醒後慢慢升起，之後上下飄動
function coreLift(core) {
  if (!core.awake) return 0;
  const p = Math.min(1, core.awakeT / CORE.float.rise), ease = 1 - (1 - p) * (1 - p);
  return CORE.float.height * ease + Math.sin(core.awakeT * 2.1 + core.seed) * CORE.float.bob * ease;
}
// 甦醒的核心會照亮周圍（只影響畫面，跟攻擊閃光同一套；js/lighting.js 會讀這裡）
function coreGlowLights() {
  if (!G || !G.cores) return [];
  const now = performance.now() / 1000;
  return G.cores.filter(c => c.awake && !c.dead).map(c => ({
    x: c.x, y: c.y - 30, r: c.phase === 2 ? 190 : 150, life: 1, life0: 1,
    power: (c.phase === 2 ? .7 : .55) + .1 * Math.sin(now * (c.phase === 2 ? 5 : 2.5) + c.seed),
    color: c.phase === 2 ? [230, 110, 255] : [180, 110, 255],
  }));
}

function drawCore(core) {
  if (core.dead) return;
  const lift = coreLift(core), now = performance.now() / 1000;
  const dx = Math.round(core.x - CORE.w / 2), bottom = core.y + 20, dy = Math.round(bottom - CORE.h - lift);
  ctx.save();
  // 地上影子：浮得越高越小越淡
  ctx.fillStyle = `rgba(0,0,0,${(.38 - lift * .008).toFixed(3)})`;
  ctx.beginPath(); ctx.ellipse(core.x, bottom - 4, 26 - lift * .3, 8 - lift * .1, 0, 0, Math.PI * 2); ctx.fill();
  if (core.awake) {   // 背後的紫色光暈（第二階段更亮、脈動更快）
    const pulse = .7 + .3 * Math.sin(now * (core.phase === 2 ? 6 : 3) + core.seed);
    const cy = dy + CORE.h * .45, R = (core.phase === 2 ? 78 : 62) * (0.9 + .1 * pulse);
    const g = ctx.createRadialGradient(core.x, cy, 0, core.x, cy, R);
    const col = core.phase === 2 ? '235,110,255' : '170,100,255';
    g.addColorStop(0, `rgba(${col},${(.55 * pulse).toFixed(3)})`); g.addColorStop(.5, `rgba(${col},${(.2 * pulse).toFixed(3)})`); g.addColorStop(1, `rgba(${col},0)`);
    ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(core.x, cy, R, 0, Math.PI * 2); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }
  if (coreImg.complete && coreImg.naturalWidth) {
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(coreImg, dx, dy, CORE.w, CORE.h);
    if (core.awake) {   // 本體發光：疊一層紫色剪影，一明一暗
      const glow = flashSprite(coreImg, core.phase === 2 ? '#ff9cf0' : '#c99bff');
      if (glow) {
        ctx.globalAlpha = .12 + .16 * (.5 + .5 * Math.sin(now * (core.phase === 2 ? 6 : 3) + core.seed));
        ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(glow, dx, dy, CORE.w, CORE.h);
        ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
      }
    }
    if (core.hitT > 0) drawHitFlash(coreImg, Math.min(1, core.hitT / .16), '#d69bff', dx, dy, CORE.w, CORE.h);
    ctx.imageSmoothingEnabled = true;
  }
  // 頭上只有血條（第二階段變粉紅色）
  const barY = dy - 10;
  ctx.fillStyle = '#25202b'; ctx.fillRect(core.x - 30, barY, 60, 6);
  ctx.fillStyle = core.phase === 2 ? '#ff7ae0' : '#d69bff'; ctx.fillRect(core.x - 30, barY, 60 * Math.max(0, core.hp / core.maxhp), 6);
  ctx.restore();
}

// ---- 打破：碎成好幾塊往外噴飛，落地彈一下後淡出 ----
function breakCore(core) {
  const lift = coreLift(core), bottom = core.y + 20, top = bottom - CORE.h - lift, left = core.x - CORE.w / 2;
  const cx = CORE.w / 2, cy = CORE.h * .55;   // 碎裂中心（圖片座標）
  // 把圖片沿著外框切成一圈楔形碎片（每片＝中心點＋外框上兩個點）
  const rim = [];
  const per = 2 * (CORE.w + CORE.h);
  for (let i = 0; i < CORE.shards; i++) {
    let d = (i + Math.random() * .6) / CORE.shards * per;
    if (d < CORE.w) rim.push([d, 0]); else if ((d -= CORE.w) < CORE.h) rim.push([CORE.w, d]);
    else if ((d -= CORE.h) < CORE.w) rim.push([CORE.w - d, CORE.h]); else rim.push([0, CORE.h - (d - CORE.w)]);
  }
  G.coreShards = G.coreShards || [];
  for (let i = 0; i < rim.length; i++) {
    const a = rim[i], b = rim[(i + 1) % rim.length];
    const jx = cx + (Math.random() * 2 - 1) * 6, jy = cy + (Math.random() * 2 - 1) * 8;   // 中心點稍微錯開，碎片才不會太整齊
    const poly = [[jx, jy], a, ...(cornerBetween(a, b)), b];
    const mx = poly.reduce((s, p) => s + p[0], 0) / poly.length, my = poly.reduce((s, p) => s + p[1], 0) / poly.length;
    const ang = Math.atan2(my - cy, mx - cx), sp = 70 + Math.random() * 110;
    G.coreShards.push({ poly, ox: mx, oy: my, x: left + mx, y: top + my, ground: bottom - 2 + Math.random() * 10,
      vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 90 - Math.random() * 60, rot: 0, spin: (Math.random() * 2 - 1) * 9,
      life: 1.6 + Math.random() * .6, life0: 2.2, flash: .12 });
  }
  // 閃光、衝擊波、紫黑粒子、腐蝕霧、震動與頓格、音效
  G.effects.push({ ring: true, x: core.x, y: core.y - 30, r: 10, r2: 150, life: .55, life0: .55, color: '#c77bff' });
  G.effects.push({ ring: true, x: core.x, y: core.y - 30, r: 4, r2: 90, life: .35, life0: .35, color: '#ffffff' });
  for (let i = 0; i < 46; i++) {
    const a = Math.random() * Math.PI * 2, sp = 60 + Math.random() * 180, L = .5 + Math.random() * .8;
    G.effects.push({ coreMote: true, dark: Math.random() < .4, x: core.x, y: core.y - 50 - lift, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 40,
      r: 1.6 + Math.random() * 3, life: L, life0: L, drag: 2.6 });
  }
  for (let i = 0; i < 4; i++) {   // 少量紫黑霧（太多會蓋住碎片）
    const a = Math.random() * Math.PI * 2, sp = 10 + Math.random() * 22;
    pushCorrosionMist(core.x + Math.cos(a) * 12, core.y + 4 + Math.sin(a) * 10, Math.cos(a) * sp, Math.sin(a) * sp);
  }
  addLightFlash('core', core.x, core.y - 30);
  nearbyImpact(core.x, core.y, 12, .09);
  if (typeof sfxAt === 'function') { sfxAt('corrosionImpact', core.x, core.y, .9, 'core-break'); sfxAt('monsterDown', core.x, core.y, .8, 'core-break2'); }
  if (core.pool) core.pool.t = 1.5;   // 腳下腐蝕痕跡慢慢退去
}
// 兩個外框點之間如果跨過圖片角落，要把角落也放進碎片的多邊形裡
function cornerBetween(a, b) {
  const corners = [[CORE.w, 0], [CORE.w, CORE.h], [0, CORE.h], [0, 0]];
  const side = p => p[1] === 0 && p[0] < CORE.w ? 0 : p[0] === CORE.w && p[1] < CORE.h ? 1 : p[1] === CORE.h && p[0] > 0 ? 2 : 3;
  const out = []; let s = side(a);
  for (let k = 0; k < 4 && s !== side(b); k++) { out.push(corners[s]); s = (s + 1) % 4; }
  return out;
}
function updateCoreShards(dt) {
  if (!G.coreShards || !G.coreShards.length) return;
  for (const s of G.coreShards) {
    s.life -= dt; if (s.flash > 0) s.flash -= dt;
    s.vy += 520 * dt; s.x += s.vx * dt; s.y += s.vy * dt; s.rot += s.spin * dt;
    if (s.y > s.ground && s.vy > 0) {   // 落地：彈一下、摩擦、轉速變慢
      s.y = s.ground; s.vy *= -.28; s.vx *= .55; s.spin *= .5;
      if (Math.abs(s.vy) < 25) s.vy = 0;
    }
  }
  G.coreShards = G.coreShards.filter(s => s.life > 0);
}
function drawCoreShards(ctx) {
  if (!G.coreShards || !G.coreShards.length || !coreImg.complete) return;
  const white = flashSprite(coreImg, '#ffffff');
  for (const s of G.coreShards) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, s.life / .5);
    ctx.translate(s.x, s.y); ctx.rotate(s.rot); ctx.translate(-s.ox, -s.oy);
    ctx.beginPath(); ctx.moveTo(s.poly[0][0], s.poly[0][1]);
    for (let i = 1; i < s.poly.length; i++) ctx.lineTo(s.poly[i][0], s.poly[i][1]);
    ctx.closePath(); ctx.clip();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(coreImg, 0, 0, CORE.w, CORE.h);
    if (s.flash > 0 && white) { ctx.globalAlpha *= Math.min(1, s.flash / .12); ctx.drawImage(white, 0, 0, CORE.w, CORE.h); }   // 剛碎開時閃白
    ctx.restore();
  }
}
// 黑紫粒子的移動（在 game.js 的特效更新裡呼叫）
function updateCoreMote(f, dt) {
  f.x += f.vx * dt; f.y += f.vy * dt;
  const drag = f.drag || 1.2;
  f.vx *= (1 - drag * dt); f.vy *= (1 - drag * dt); f.vy -= 6 * dt;
}
function drawCoreMote(ctx, f) {
  const p = Math.max(0, f.life / f.life0), a = Math.sin(p * Math.PI);
  ctx.globalAlpha = a * (f.dark ? .8 : 1);
  if (!f.dark) ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = f.dark ? '#140a1c' : '#b06bff';
  ctx.beginPath(); ctx.arc(f.x, f.y, Math.max(.5, f.r * (.4 + .6 * p)), 0, Math.PI * 2); ctx.fill();
  if (!f.dark) { ctx.globalAlpha = a * .6; ctx.fillStyle = '#f1ddff'; ctx.beginPath(); ctx.arc(f.x, f.y, Math.max(.3, f.r * .35 * p), 0, Math.PI * 2); ctx.fill(); }
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
}
