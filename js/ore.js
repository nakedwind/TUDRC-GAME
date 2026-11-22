// ============================================================
//  異質碎片礦物：用地圖編輯器擺在地圖上（素材在 images/item-obstacle/09～11-ore-*.png）。
//  另有普通礦石（煤礦、錫礦、石灰岩、錳礦，15～18-ore-*.png）：一樣擋路、一樣用下面的方法打開，
//  但 crystals＝0，不掉異質碎片、不發紫光、異質探測器也不顯示。碰撞格在物件編輯器設定（data/ores.js）。
//  礦物很硬，徒手挖不開。能打開礦物的方法：
//    ・地雷爆炸（油桶炸不開，但油桶爆炸可以引爆旁邊的地雷）
//    ・瓦斯爐爆炸（威力比較小，js/oil-barrels.js）
//    ・路德：打怪時礦物剛好在拳頭的攻擊範圍內，會被震裂，打幾下就碎（暴走時更快）
//    ・阿瓦倫：打怪時腐蝕剛好噴到礦物，礦物泡在腐蝕池裡久了會溶解
//    （哨兵不會主動去打礦物，只會在攻擊範圍剛好涵蓋礦物時波及）
//    ・希奧妮：大招的小爆炸會炸開礦物
//    ・安柏：雷電打偏時，有機率劈中附近的礦物
//  很硬的礦（data/ores.js 的 blasts＝硬度，例如煤礦 3、錫礦 3、石灰岩 2、錳礦 4）要被爆炸打到好幾次才會碎；
//  手槍要的傷害、路德敲的下數、腐蝕泡的秒數也都乘上硬度，安柏的雷劈一下算炸一次。
//  數字在物件編輯器選礦物後的「硬度（炸幾次才碎）」改。
//  炸開後異質碎片會散落在地上，溫特走到旁邊按互動鍵逐顆撿起來，畫面中間跳出拾取提示。
//  礦物每次出勤重新出現。在黑暗中不會發光；被探照燈、營燈或其他燈照亮時，
//  露出的紫色結晶會亮起鮮豔的紫光（發光圖在 images/item-obstacle/glow/，由原圖的紫色部分做成）。
//  （數值集中在最上面，想調整改這裡就好）
// ============================================================
// crystals：炸開後總共掉幾個異質碎片；shards：分成幾塊掉在地上；glow：黑暗中的紫光亮度

const ORE_BLAST_PAD = .6;   // 爆炸半徑外再多算幾格也會炸到礦物（礦物本身有一格大）
const SHARD = { reach: 56, delay: .45, wallGap: 16, bounce: .6, slide: 70 };   // reach：可拾取的距離（像素）；delay：落地後幾秒才能撿
// wallGap：離牆、碰撞格幾像素內就彈開；bounce：彈回去保留幾成速度；slide：一開始就太靠牆時，往外滑的速度（像素／秒）
// 路德的拳頭剛好波及礦物：hits＝敲幾下會碎（暴走時每下算 2 下）；pad＝攻擊範圍外再多算幾格
const ORE_LUTHER = { hits: 4, pad: .5 };
// 溫特的手槍：累積多少傷害才打得碎（手槍 Lv1 一發 5 → 小型 16 發、大型 28 發、稀有 40 發）
const ORE_PISTOL = { ore_small: 80, ore_large: 140, ore_rare: 200, default: 120 };
const ORE_DISSOLVE = 3;                       // 礦物泡在腐蝕池裡累積幾秒會溶解
const ORE_STRAY = { chance: .4, range: 3 };   // 安柏打偏時：多少機率劈中目標附近幾格內的礦物
const ORE_THEONIE_R = 1.2;
// 普通礦石（煤礦、錫礦、石灰岩、錳礦）比較大顆：碎掉時噴出又大又多的石塊（畫法在 js/gourd-monkey.js 的 rockBurstFx）
// rocks：幾塊、size：石塊大小倍率（1＝油桶爆炸的石塊）、speed／up：往外、往上噴的速度、dust：灰塵團數、spread：從中心多遠開始噴
// crack：還沒碎、只是被炸裂時噴的少量石塊
const ORE_ROCK_BURST = {
  break: { rocks: 28, size: 1.7, speed: [60, 190], up: [150, 300], dust: 12, dustRise: 4, spread: 22 },
  crack: { rocks: 8, size: 1.2, speed: [40, 120], up: [110, 220], dust: 4, dustRise: 2, spread: 16 },
};                    // 希奧妮大招的爆炸半徑（格）

// 結晶發光：strength＝紫光亮度；halo＝外圍光暈亮度；pulse＝閃爍幅度；speed＝閃爍快慢；pad＝光暈圖四周多留的像素
const ORE_CRYSTAL_GLOW = { strength: .85, halo: .6, pulse: .25, speed: 1.8, pad: 8 };
// 發光圖依礦物圖檔名對應：images/item-obstacle/09-ore-small.png → glow/09-ore-small-glow.png、-halo.png
const oreGlowImgs = {};
function oreGlowFor(type) {
  if (oreGlowImgs[type] !== undefined) return oreGlowImgs[type];
  const spec = ORE_TYPES[type], base = spec && String(spec.file || '').split('/').pop().replace(/\.png$/i, '');
  if (!base || !spec.glow) return (oreGlowImgs[type] = null);   // 不發光的礦（煤礦、錫礦…）：沒有發光圖
  const glow = new Image(); glow.src = `images/item-obstacle/glow/${base}-glow.png`;
  const halo = new Image(); halo.src = `images/item-obstacle/glow/${base}-halo.png`;
  return (oreGlowImgs[type] = { glow, halo });
}
Object.keys(ORE_TYPES).forEach(oreGlowFor);   // 先載入
// 被照亮的礦物：結晶疊上鮮豔紫光（由 render.js 的 drawObstacle 呼叫，跟礦物圖同一個前後順序）
function drawOreGlow(ctx, o, x, y, w, h) {
  const c = oreCenter(o);
  if (o.hp <= 0 || !isLit(c.x, c.y) || oreConcealed(o)) return;   // 黑暗中不發光；還沒炸開的隱藏區也不發光
  const imgs = oreGlowFor(o.type); if (!imgs) return;
  const now = performance.now() / 1000, C = ORE_CRYSTAL_GLOW;
  const k = 1 - C.pulse + C.pulse * (.5 + .5 * Math.sin(now * C.speed + o.c * 1.7 + o.r));
  ctx.save();
  ctx.globalCompositeOperation = 'lighter'; ctx.imageSmoothingEnabled = false;
  if (imgs.halo.complete && imgs.halo.naturalWidth) {   // 光暈圖四周多留 pad 像素（以原圖比例換算）
    const px = C.pad * w / (imgs.glow.naturalWidth || w), py = C.pad * h / (imgs.glow.naturalHeight || h);
    ctx.globalAlpha = C.halo * k; ctx.drawImage(imgs.halo, x - px, y - py, w + px * 2, h + py * 2);
  }
  if (imgs.glow.complete && imgs.glow.naturalWidth) { ctx.globalAlpha = C.strength * k; ctx.drawImage(imgs.glow, x, y, w, h); }
  ctx.restore();
}
// 有沒有異質結晶：煤礦、錫礦、石灰岩、錳礦是普通礦石（crystals＝0），不掉異質碎片、不發紫光、探測器也不顯示
const oreHasCrystals = o => ((ORE_TYPES[o && o.type] || {}).crystals || 0) > 0;
const oreByFile = file => Object.entries(ORE_TYPES).find(([, spec]) => file.endsWith(spec.file.replace('images/', ''))) || null;
// 礦物的「中心」（瞄準、打中、亮不亮、碎片噴出的位置）：左右＝整張圖的中間；高度＝擋路那幾格（石頭底座）的中間。
// 不用整張圖的中心：高的礦（稀有紫晶礦 2×3）上半部常常疊在牆上，中心會落在牆裡，子彈的視線、照明判定都會失敗（打不到）
const oreCenter = o => {
  const sol = Array.isArray(o.solid) && o.solid.length ? o.solid : null;
  const ry = sol ? sol.reduce((sum, [, r]) => sum + r + .5, 0) / sol.length : (o.h || 1) / 2;
  // o.off：地圖編輯器用方向鍵微調過、不到半格的像素（js/maploader.js），中心也跟著挪，判定才會跟畫面上的礦對齊
  const off = o.off || [0, 0];
  return { x: OX + (o.c + (o.w || 1) / 2) * CELL + off[0], y: OY + (o.r + ry) * CELL + off[1] };
};
// 這個點（滑鼠瞄準的位置）有沒有點在礦的圖上：跟 js/render.js 的 drawObstacle 畫礦用同一套位置
// （地圖編輯器的微調、大小 %、角度都照算；格子素材的礦固定一格大）
function oreArtHit(o, x, y) {
  const s = o.mapSource && typeof o.mapSource === 'object' ? o.mapSource : null, t = o.mapTileId ? mapTileById(o.mapTileId) : null;
  if (s && t) {
    const sx = OX + s.c * CELL + (s.ox || 0), sy = OY + s.r * CELL + (s.oy || 0), sw = mapStampW(s, t) * CELL, sh = mapStampH(s, t) * CELL;
    return typeof stampHitTest === 'function' ? stampHitTest(s, sx, sy, sw, sh, x, y) : x >= sx && x <= sx + sw && y >= sy && y <= sy + sh;
  }
  const [dx, dy] = obstacleOff(o), left = OX + o.c * CELL + dx, top = OY + o.r * CELL + dy, w = (t ? 1 : (o.w || 1)) * CELL, h = (t ? 1 : (o.h || 1)) * CELL;
  return x >= left && x <= left + w && y >= top && y <= top + h;
}
// 礦物還藏在沒炸開的隱藏區裡：不發光，免得露餡；探測器照常顯示，算是找隱藏區的線索（js/breakable-walls.js、js/equipment.js）
// 除了看位置，也看礦物圖本身是不是畫在隱藏區圖層上（mapSource：圖章物件，或格子素材的 "圖層:c,r" 字串）
function oreConcealed(o) {
  const c = oreCenter(o), src = o.mapSource;
  if (typeof inHiddenArea === 'function' && inHiddenArea(c.x, c.y)) return true;
  if (!src || typeof secretAlpha !== 'function') return false;
  if (typeof src === 'object') return secretAlpha(src) <= 0;
  const i = String(src).indexOf(':');
  return i > 0 && secretAlpha(null, src.slice(0, i), src.slice(i + 1)) <= 0;
}

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
  flash('太硬了！', c.x, c.y - 34, '#d6b8ff', 1.4);
  sfx('error');
}

// ---- 爆炸：地雷（js/landmine.js）、瓦斯爐（js/oil-barrels.js）、希奧妮大招（js/attack-fx.js）爆炸時呼叫 ----
function blastOres(x, y, R) {
  if (!G) return;
  for (const o of [...G.obstacles]) {
    if (!o.ore || o.hp <= 0) continue;
    const c = oreCenter(o);
    if (Math.hypot(c.x - x, c.y - y) <= R + ORE_BLAST_PAD * CELL) blastHitOre(o, x, y);
  }
}
// 礦物的硬度＝data/ores.js 的 blasts（沒填＝1）。爆炸要打幾次、手槍要多少傷害、路德敲幾下、腐蝕泡幾秒，都乘上這個數字
const oreHardness = o => Math.max(1, Math.round(ORE_TYPES[o.type]?.blasts || 1));
// 一次爆炸打到礦物：很硬的礦（data/ores.js 的 blasts，物件編輯器「炸幾次才碎」）要炸好幾次；沒填＝炸一次就碎
function blastHitOre(o, bx, by) {
  const need = oreHardness(o);
  o.blastHits = (o.blastHits || 0) + 1;
  if (o.blastHits >= need) { breakOre(o, bx, by); return; }
  // 還沒碎：閃一下、噴幾顆碎石（不跳文字提示）
  const c = oreCenter(o);
  o.hitT = HIT_DUR; o.gunFlashAt = performance.now();
  for (let i = 0; i < 6; i++) {
    const a = Math.random() * Math.PI * 2, sp = 40 + Math.random() * 80;
    G.effects.push({ ember: true, spark: true, x: c.x, y: c.y - 6, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * .6 - 50,
      r: 1.3 + Math.random() * 1.5, life: .4 + Math.random() * .3, life0: .7, color: '#a08a6e' });
  }
  if (!oreHasCrystals(o) && typeof rockBurstFx === 'function') rockBurstFx(c.x, c.y, ORE_ROCK_BURST.crack);   // 普通礦石：掉一些石塊
  if (typeof sfxAt === 'function') sfxAt('knock2', c.x, c.y, .6, 'ore-hit');
}
function breakOre(o, bx, by, msg) {
  const crystal = oreHasCrystals(o);
  if (crystal && typeof questEvent === 'function') questEvent('breakOre');   // 支線進度（js/quests.js）
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
      value, t: 0, spin: Math.random() * 6, rare: o.type === 'ore_rare', floor: hasFloors ? actorFloor(o) : 0 });   // floor：在幾樓（陸橋上下分開畫、分開撿）
  }
  // 畫面：紫色爆光、碎石（普通礦石：土黃色）
  G.effects.push({ ring: true, x: c.x, y: c.y, r: 6, r2: 52, life: .5, life0: .5, color: crystal ? '#d69bff' : '#c8b49a' });
  for (let i = 0; i < 12; i++) {
    const a = Math.random() * Math.PI * 2, sp = 60 + Math.random() * 120;
    G.effects.push({ ember: true, spark: true, x: c.x, y: c.y - 6, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * .6 - 60,
      r: 1.5 + Math.random() * 2, life: .5 + Math.random() * .3, life0: .8, color: crystal ? '#c47dff' : '#a08a6e' });
  }
  if (typeof spawnGoo === 'function') spawnGoo(c.x, c.y - 4, '#6b6372', 8, 1.1);   // 碎石
  if (!crystal && typeof rockBurstFx === 'function') rockBurstFx(c.x, c.y, ORE_ROCK_BURST.break);   // 普通礦石：噴出又大又多的石塊
  if (crystal && typeof LOOT_FX_VERSION !== 'undefined' && LOOT_FX_VERSION === 2) lootV2OreBreak(c.x, c.y - 6);   // V2：水晶碎片、星光、一閃（js/loot-fx-v2.js）
  if (typeof sfxAt === 'function') { if (crystal) sfxAt('glassBreak3', c.x, c.y, .6, 'ore-break'); sfxAt('oreMine', c.x, c.y, .7, 'ore-mine'); }   // 碎掉的玻璃聲＋挖礦聲
}

// ---- 每幀更新（在 update 裡呼叫）：碎片噴飛、落地 ----
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
    // 溫特站不到的地方，碎片也不會落進去；離牆、碰撞格 wallGap 像素內就彈回來（才不會看起來卡進牆裡）
    // 碎片照自己在幾樓判斷牆（2 樓打碎的礦，碎片在 2 樓彈，不會照溫特那一層、掉出 2 樓地面）
    const who = hasFloors && s.floor ? { x: s.x, y: s.y, floor: s.floor } : null;
    const blocked = (x, y) => typeof playerBlocked === 'function' ? playerBlocked(x, y, who) : solidBlocksPoint(x, y);
    const gap = SHARD.wallGap, tooClose = (x, y) => blocked(x, y) || blocked(x - gap, y) || blocked(x + gap, y) || blocked(x, y - gap) || blocked(x, y + gap);
    const nx = s.x + s.vx * dt;
    if (blocked(nx, s.y) || (tooClose(nx, s.y) && !tooClose(s.x, s.y))) s.vx = -s.vx * SHARD.bounce; else s.x = nx;
    const ny = s.y + s.vy * dt;
    if (blocked(s.x, ny) || (tooClose(s.x, ny) && !tooClose(s.x, s.y))) s.vy = -s.vy * SHARD.bounce; else s.y = ny;
    // 一開始就太靠牆（例如礦物貼著牆）：慢慢往牆的反方向滑開
    const px = (blocked(s.x - gap, s.y) ? 1 : 0) - (blocked(s.x + gap, s.y) ? 1 : 0), py = (blocked(s.x, s.y - gap) ? 1 : 0) - (blocked(s.x, s.y + gap) ? 1 : 0);
    if (px && !blocked(s.x + px * SHARD.slide * dt, s.y)) s.x += px * SHARD.slide * dt;
    if (py && !blocked(s.x, s.y + py * SHARD.slide * dt)) s.y += py * SHARD.slide * dt;
    if (s.z === 0) { s.vx *= Math.pow(.02, dt); s.vy *= Math.pow(.02, dt); }   // 在地上滑一下就停
  }
}
// 溫特旁邊可以撿的碎片（已經落地、離溫特 SHARD.reach 以內，最近的那顆）：render.js 畫「撿起異質碎片」提示、game.js 按空白鍵撿
function shardNearPlayer() {
  const p = G && G.player; if (!p || p.hp <= 0 || p.sitting) return null;
  let best = null, bd = SHARD.reach;
  for (const s of G.oreShards || []) {
    if (s.picked || s.z > 0 || s.t < SHARD.delay || !fieldHits(s.floor, p)) continue;   // 橋上、橋下的碎片要在同一層才撿得到
    const d = Math.hypot(p.x - s.x, p.y - s.y); if (d < bd) { bd = d; best = s; }
  }
  return best;
}
// 玩家與搜救犬共用，每次只結算指定的那一顆。
function pickShard(shard, collector, reach = SHARD.reach) {
  if (!shard || !collector || !G?.oreShards?.includes(shard) || shard.picked || shard.z > 0 || shard.t < SHARD.delay
      || Math.hypot(collector.x - shard.x, collector.y - shard.y) >= reach) return false;
  shard.picked = true;
  G.oreShards = G.oreShards.filter(s => s !== shard);
  earnCrystals(shard.value);
  showPickupToast(shard.value);
  flash('+' + shard.value, collector.x, collector.y - 50, '#d69bff', .9);
  if (typeof LOOT_FX_VERSION !== 'undefined' && LOOT_FX_VERSION === 2) lootV2Collect(shard.x, shard.y - 6, collector);   // V2：撿起時炸開一圈小光點、飛向撿的人（js/loot-fx-v2.js）
  SFX.play('crystalGet', .7, 'shard-pickup');
  updateHUD();
  return true;
}
// 按一次互動鍵只撿最近的一顆；每顆原本的價值保持不變。
function pickShardsNearPlayer() {
  return pickShard(shardNearPlayer(), G && G.player);
}

// 怪物死掉時掉一顆碎片（value＝這顆值多少碎片），從屍體的位置彈出來落在地上，靠近後可逐顆拾取
function dropShard(x, y, value, floor = blastFloor) {   // floor：掉在幾樓（0＝不分）
  if (!G || !value) return;
  G.oreShards = G.oreShards || [];
  const a = Math.random() * Math.PI * 2, sp = 20 + Math.random() * 40;
  G.oreShards.push({ x, y, z: 6, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * .7, vz: 140 + Math.random() * 60, value, t: 0, spin: Math.random() * 6, floor: hasFloors ? floor || 0 : 0 });
}
// 溫特開槍打中礦物（js/game.js 呼叫）：累積傷害，夠了就碎掉
function pistolHitOre(o, dmg) {
  if (!o || !o.ore || o.hp <= 0 || !G.obstacles.includes(o)) return;
  const need = (ORE_PISTOL[o.type] ?? ORE_PISTOL.default) * oreHardness(o), c = oreCenter(o);   // 很硬的礦要打更多發
  o.gunDmg = (o.gunDmg || 0) + dmg; o.hitT = HIT_DUR * .7; o.gunFlashAt = performance.now();   // 閃白（js/render.js 的 drawObstacle）
  if (o.gunDmg >= need) breakOre(o, G.player.x, G.player.y, '');   // 不跳文字提示
  else if (typeof sfxAt === 'function') sfxAt('knock2', c.x, c.y, .45, 'ore-hit');
}
// 給溫特瞄準用的「假目標」（跟油桶一樣）
function oreProxy(o) {
  if (!o.proxy) { const c = oreCenter(o); o.proxy = { x: c.x, y: c.y, hp: 1, maxhp: 1, oreRef: o }; }
  return o.proxy;
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
    if (o.oreHits >= ORE_LUTHER.hits * oreHardness(o)) breakOre(o, t.x, t.y, '路德的怪力把礦物震碎了！');
  }
}
// ---- 腐蝕：礦物泡在腐蝕池裡會慢慢溶解（阿瓦倫的腐蝕池；異質核心腳下的不算）----
function updateOreDissolve(dt) {
  const pools = (G.acidPools || []).filter(p => p.t > 0 && !p.noEnemy);
  if (!pools.length) return;
  for (const o of [...G.obstacles]) {
    if (!o.ore || o.hp <= 0) continue;
    const c = oreCenter(o);
    if (!pools.some(p => acidPoolDist(p, c.x, c.y) <= p.r + 16)) continue;
    o.dissolve = (o.dissolve || 0) + dt;
    o.fizzT = (o.fizzT || 0) - dt;
    if (o.fizzT <= 0) {   // 冒泡、礦物微微閃光
      o.fizzT = .35; o.hitT = HIT_DUR * .5;
      G.effects.push({ ember: true, x: c.x + (Math.random() - .5) * 18, y: c.y + 4, vx: 0, vy: -30 - Math.random() * 20, r: 2 + Math.random() * 2, life: .5, life0: .5, color: '#9c5cff' });
    }
    if (o.dissolve >= ORE_DISSOLVE * oreHardness(o)) breakOre(o, c.x, c.y + 1, '礦物被腐蝕溶解了！');
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
  if (oreHardness(o) > 1) { blastHitOre(o, t.x, t.y); return; }   // 很硬的礦：劈一下只算炸一次
  breakOre(o, t.x, t.y, '雷打偏了……劈開了礦物！');
}

// ---- 黑暗中的紫光（只影響畫面，js/lighting.js 會呼叫）----
function oreGlowLights() {
  if (!G || !G.obstacles) return [];
  const now = performance.now() / 1000;
  const lights = G.obstacles.filter(o => o.ore && o.hp > 0 && oreHasCrystals(o) && isLit(oreCenter(o).x, oreCenter(o).y) && !oreConcealed(o)).map(o => {   // 黑暗中不發光；還沒炸開的隱藏區也不發光
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
  for (const s of list) if (!fxSkip(s.floor)) drawOreShard(ctx, s);   // 陸橋補畫時跳過橋下的（js/pathfinding.js）
}
// 碎片一顆一顆跟人物、物件一起照底部 Y 排前後（js/render.js）：不會被「前後深度 0」的樓梯、柱子蓋住
function oreShardSortables(out) {
  for (const s of G.oreShards || []) out.push({ floor: looseFloor(s), y: s.y + 2, draw: () => drawOreShard(ctx, s) });
}
function drawOreShard(ctx, s) {
  const now = performance.now() / 1000;
  {
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
    if (typeof lootV2ShardGlint === 'function') lootV2ShardGlint(ctx, s, x, y);   // V2：掃過的白光、往上飄的小光點（js/loot-fx-v2.js）
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
  const now=performance.now(),box=document.getElementById('itemPickupNotices');
  let total=amount;
  if(pickupToast&&now-pickupToast.at<1800&&box?.contains(pickupToast.el)){
    total+=pickupToast.total;pickupToast.el.remove();
  }
  const el=showItemPickupNotice({name:'異質碎片',image:'images/碎片鑰匙/anomalous-shard.png'},total);
  pickupToast={el,total,at:now};
  // 第一次撿到：跳出說明視窗（js/item-intro.js）
  if(typeof itemIntro==='function')itemIntro({key:'item:anomalous-shard',kindLabel:'素材',name:'異質碎片',image:'images/碎片鑰匙/anomalous-shard.png',tag:'◆ 養成素材',
    desc:'打倒怪物、敲碎異質礦會掉出來的碎片，走過去就會吸過來。帶回應變中心後，可以在隊員名單按「技能樹」花碎片幫哨兵、嚮導學技能。'});
}
