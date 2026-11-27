/* ===== 水中怪物＋泳圈上戰鬥 =====
   有畫 🛟 深水區、而且現在是深水的地圖才有（池核、W118區 地下水池）。
   【水中怪物】魚頭君、虱目魚小子、小虱目魚小子、比基尼小丑魚（WATER_MONSTER_IDS）從異質核心生出來時，
     有 spawnChance 的機率改生在深水裡（離溫特 spawnMin～spawnMax 格、太小的水池不生），之後就在那一池水裡游泳（e.aqua）：
     ・魚頭君：游到靠近人的地方，從水裡噴水攻擊（跟陸地上一樣的水柱、會把人沖開，js/fish-head.js）；被打一樣會嚇得游開
     ・虱目魚小子：一樣吃隊友（js/milkfish-kid.js 的 mfGulp）：泡在水裡的隊友游過去直接吞；岸上的隊友在 milkfish.lunge 格內就跳上岸撲過去（上岸之後照陸地的行為）；
       嘴裡含著人就往離溫特遠的地方游；溫特太靠近也會咬他
     ・小虱目魚小子：每隔 small.every 秒，下潛（打不到、只看得到影子）游到人的下面，冒泡泡預警 small.warn 秒，
       再從水裡往上撞，範圍內的人被撞飛（落地扣血、暈；落水慌張，跟魚頭王的水柱衝天同一套，js/fish-king.js 的 fkLaunch）
     ・比基尼小丑魚：靠近人（保持 clown.keep 格），每隔 clown.every 秒在水裡生一顆魚卵；魚卵浮在水上載浮載沉，不會孵化，
       是單純的炸彈（坐泳圈的人碰到、或被子彈打中就爆，js/clownfish.js 的魚卵）
     被擊退推上岸、或水被抽乾：就變回一般的陸地怪物（e.aqua 拿掉）。
   【泳圈上戰鬥】溫特、隊員坐在泳圈上也能攻擊，但是：攻擊速度 × combat.rateMul、命中率 × combat.hitMul；
     開槍的人（含溫特）每開一槍就往後飄 combat.recoil 像素（只在水裡飄，碰到岸就停）
   數值：怪物編輯器「👑 BOSS 數值」→「🐟 水中怪物（共用）」「🛟 泳圈上戰鬥（共用）」
   接點：js/anomalous-core.js 的 spawnCoreGroup（生在水裡）、js/enemy-ai.js 的 stepEnemy（stepAquaMonster）、js/water.js 的 wadeInfo（aquaWade）、
         js/pool-tide.js（updateWaterMonsters）、js/render.js（drawWaterMonstersGround）、js/clownfish.js（浮在水上的魚卵）、
         js/game.js（溫特、隊員坐泳圈開槍：WATER_COMBAT、ringRecoil）
   必須在 fish-head.js、milkfish-kid.js、clownfish.js、fish-king.js 之後、game.js 之前載入。 */
// 數字以 data/monsters.js 的 BOSS_SETTINGS_DEFAULT 為準（怪物編輯器「👑 BOSS 數值」）；這裡的數字只在那邊沒有這一格時才用。
// 新增或刪掉數字欄位、改了註解之後，要跑一次 tools/build-boss-fields.py（編輯器的欄位和說明才會跟著更新）
const WATER_MONSTERS = applyBossSettings('WATER_MONSTERS', {
  spawnChance: .4,      // 這四種怪物生出來時，有幾成改生在深水裡（0＝都不生在水裡）
  spawnMin: 5,          // 生在水裡的地方離溫特至少幾格
  spawnMax: 16,         // 離溫特最多幾格（太遠的水池不生）
  minPool: 8,           // 水池至少幾格大才會生（太小的水坑不生）
  swimMul: 1,           // 游泳速度＝自己走路速度的幾倍
  noticeRange: 10,      // 幾格內看到人就游過去
  sink: .45,            // 水面在身體的哪裡（0＝腳底、1＝頭頂）
  fishHeadSink: .725,   // 魚頭君另外算：水面在身體的哪裡（.725＝只露出上面不到三成；其他水中怪物照上面的 sink）
  see: .35,             // 水面下的身體看得多清楚（0～1）
  shoreGap: 1,          // 身體邊緣離岸邊至少幾格（越大隻的怪物，中心自然離得越遠；整池都太窄的話就直接跳上岸）
  // 虱目魚小子：岸上的隊友在幾格內就跳上岸撲過去、跳多久（秒）、跳多高（像素）
  milkfish: { lunge: 2.5, leapSecs: .55, leapHeight: 50 },
  // 小虱目魚小子：每隔幾秒（隨機）下潛一次、幾格內的人會被盯上、潛水時游多快（倍率）、最多潛幾秒、冒泡泡預警幾秒、
  //   （reach＝岸上的人離水幾格內也會被盯上）、撞飛的範圍半徑（格）、跳出水面多高（像素）、往上拋的速度、飛多遠（格，最少～最多）、落地扣多少血、落水慌張幾秒
  small: { every: [4, 7], range: 9, reach: 1.8, swimMul: 1.8, diveMax: 4, warn: .7, radius: 1.3, leap: 70, up: 520, distMin: 1.5, distMax: 3, landDamage: 10, panic: 2 },
  // 比基尼小丑魚：每隔幾秒（隨機）生一顆魚卵、人在幾格內才生、跟人保持幾格、魚卵在水上留幾秒、場上最多幾顆水上的魚卵
  clown: { every: [2.5, 4], near: 6, keep: 2.5, eggLife: 30, maxEggs: 10 },
});
// 泳圈上戰鬥：攻擊速度倍率（.5＝慢一半）、命中率倍率（.7＝少三成）、每開一槍往後飄幾像素、飄多久（秒）
const WATER_COMBAT = applyBossSettings('WATER_COMBAT', {
  rateMul: .5,
  hitMul: .7,
  recoil: 30,
  recoilSecs: .35,
});
// 會生在水裡的怪物（怪物編輯器的 id）
const WATER_MONSTER_IDS = ['fish_head', 'milkfish_kid', 'milkfish_kid_small', 'clownfish'];

const wmRand = ([a, b]) => a + Math.random() * (b - a);
const aquaOn = () => typeof deepWaterCells === 'function' && deepWaterCells().size > 0 && !(typeof poolDeepIsDeep === 'function' && !poolDeepIsDeep());
const aquaKey = (x, y) => { const [c, r] = cellAt(x, y); return c + ',' + r; };

// ---- 水池分區：哪些深水格連在一起（同一池水），怪物只在自己那一池游 ----
let aquaLabelCache = null;
function aquaLabels() {
  const deep = deepWaterCells();
  if (aquaLabelCache && aquaLabelCache.deep === deep && aquaLabelCache.size === deep.size) return aquaLabelCache;
  const label = new Map(), sizes = []; let id = 0;
  for (const k of deep) {
    if (label.has(k)) continue;
    const q = [k]; label.set(k, id); let n = 0;
    while (q.length) {
      const [c, r] = q.pop().split(',').map(Number); n++;
      for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const kk = (c + dc) + ',' + (r + dr); if (deep.has(kk) && !label.has(kk)) { label.set(kk, id); q.push(kk); } }
    }
    sizes[id++] = n;
  }
  // 每一格深水離岸邊幾格：緊貼岸邊（旁邊 8 格有一格不是深水）＝1，再往裡面一格＝2…
  const shore = new Map(), q = [];
  for (const k of deep) {
    const [c, r] = k.split(',').map(Number);
    let edge = false;
    for (let dc = -1; dc <= 1 && !edge; dc++) for (let dr = -1; dr <= 1; dr++) if ((dc || dr) && !deep.has((c + dc) + ',' + (r + dr))) { edge = true; break; }
    if (edge) { shore.set(k, 1); q.push(k); }
  }
  for (let i = 0; i < q.length; i++) {
    const [c, r] = q[i].split(',').map(Number), d = shore.get(q[i]) + 1;
    for (let dc = -1; dc <= 1; dc++) for (let dr = -1; dr <= 1; dr++) { const kk = (c + dc) + ',' + (r + dr); if ((dc || dr) && deep.has(kk) && !shore.has(kk)) { shore.set(kk, d); q.push(kk); } }
  }
  return aquaLabelCache = { deep, size: deep.size, label, sizes, shore, room: new Map() };
}
// 這隻怪物的中心至少要離岸邊幾格（看身體寬度：身體邊緣到岸邊至少留 shoreGap 格）；小虱目魚小子潛水時不限
function aquaMarginOf(width) {
  return Math.ceil(.5 + WATER_MONSTERS.shoreGap + width / 2 / CELL);
}
const aquaMargin = e => e.aq && e.aq.diving ? 0 : aquaMarginOf((e.drawWidth || 42) * (e.sizeMul || 1));
const aquaRoomy = (L, k, m) => !m || (L.shore.get(k) || 0) >= m;   // 這一格離岸邊夠不夠遠
// 這一池水裡有沒有夠寬的地方讓這麼大的怪物游（記起來，不用每一幀重算）
function aquaPoolHasRoom(e) {
  const L = aquaLabels(), id = L.label.get(aquaKey(e.x, e.y)), m = aquaMargin(e);
  if (id == null || !m) return true;
  const key = id + ':' + m;
  if (!L.room.has(key)) { let ok = false; for (const [k, v] of L.label) if (v === id && aquaRoomy(L, k, m)) { ok = true; break; } L.room.set(key, ok); }
  return L.room.get(key);
}
// 同一池水裡，離 (tx, ty) 最近的那一格（m＝離岸邊至少幾格，沒給就照這隻怪物的大小；0＝不限）
function aquaNearestCell(e, tx, ty, m = aquaMargin(e)) {
  const L = aquaLabels(), id = L.label.get(aquaKey(e.x, e.y)); if (id == null) return null;
  let best = null, bd = Infinity;
  for (const o of aquaPoolCells(L, id)) {   // 只看這一池的格子（以前每次都把整張地圖的深水格一格一格拆開算，W118 兩千多格，水中怪物一多就會頓）
    if (m && o.s < m) continue;   // 離岸邊不夠遠
    const d = Math.hypot(o.x - tx, o.y - ty);
    if (d < bd) { bd = d; best = o.k; }
  }
  return best;
}
// 每一池的格子清單（格子名、中心點、離岸幾格），第一次用到時整理好記在 aquaLabels 的結果裡（換地圖、水位變了才重算）
function aquaPoolCells(L, id) {
  if (!L.byId) {
    L.byId = [];
    for (const [k, v] of L.label) {
      const i = k.indexOf(','), [x, y] = center(+k.slice(0, i), +k.slice(i + 1));
      (L.byId[v] || (L.byId[v] = [])).push({ k, x, y, s: L.shore.get(k) || 0 });
    }
  }
  return L.byId[id] || [];
}
// 沿著水裡的格子找路（只在同一池裡）：回傳一串格子中心 [[x, y], …]
// m＝離岸邊至少幾格：已經在夠遠的地方就不會再游回岸邊；現在太靠岸（被推過去、剛浮上來）的話先游出來
function aquaPath(fromKey, toKey, m = 0) {
  const L = aquaLabels(); if (!L.label.has(fromKey) || L.label.get(fromKey) !== L.label.get(toKey)) return null;
  const prev = new Map([[fromKey, null]]), q = [fromKey];
  for (let i = 0; i < q.length && i < 4000; i++) {
    const cur = q[i]; if (cur === toKey) break;
    const [c, r] = cur.split(',').map(Number), curOk = aquaRoomy(L, cur, m);
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const k = (c + dc) + ',' + (r + dr); if (L.deep.has(k) && !prev.has(k) && (!curOk || aquaRoomy(L, k, m))) { prev.set(k, cur); q.push(k); } }
  }
  if (!prev.has(toKey)) return null;
  const out = []; for (let k = toKey; k && k !== fromKey; k = prev.get(k)) out.unshift(center(...k.split(',').map(Number)));
  return out;
}
// 往 (tx, ty) 游過去（在水裡最接近那裡的地方）；回傳離目標點多遠
function aquaGo(e, tx, ty, dt, mul = 1) {
  const A = e.aq, W = WATER_MONSTERS;
  A.repath = (A.repath || 0) - dt;
  const goal = A.repath <= 0 || !A.path ? aquaNearestCell(e, tx, ty) : A.goalKey;
  if (goal && (goal !== A.goalKey || !A.path || A.repath <= 0)) { A.goalKey = goal; A.path = aquaPath(aquaKey(e.x, e.y), goal, aquaMargin(e)) || []; A.repath = .6; }
  const pt = A.path && A.path[0], end = !pt && A.goalKey ? center(...A.goalKey.split(',').map(Number)) : null;   // 走完了：停在水裡最接近目標的那一格
  const gx = pt ? pt[0] : end ? end[0] : tx, gy = pt ? pt[1] : end ? end[1] : ty;
  const dx = gx - e.x, dy = gy - e.y, d = Math.hypot(dx, dy), step = Math.min(d, (e.speed || 60) * W.swimMul * mul * dt);
  if (d > .5) {
    const nx = e.x + dx / d * step, ny = e.y + dy / d * step;
    if (deepWaterAtPoint(nx, ny)) { e.x = nx; e.y = ny; e.moving = true; }
    if (Math.abs(dx) > 1) e.faceRight = dx > 0;
  }
  if (pt && d <= 4) A.path.shift();
  A.arrived = !pt && d <= 4;   // 已經游到水裡最接近目標的地方（目標在岸上就只能到這裡）
  return Math.hypot(tx - e.x, ty - e.y);
}
// 沒事做：在這一池裡慢慢晃
function aquaWander(e, dt) {
  const A = e.aq;
  if (!A.spot || Math.hypot(A.spot[0] - e.x, A.spot[1] - e.y) < 8 || (A.spotT -= dt) <= 0) {
    const L = aquaLabels(), id = L.label.get(aquaKey(e.x, e.y)), cand = [], m = aquaMargin(e);
    for (const o of aquaPoolCells(L, id)) { if (m && o.s < m) continue; if (Math.hypot(o.x - e.x, o.y - e.y) < 6 * CELL) cand.push([o.x, o.y]); }   // 只看這一池（aquaPoolCells）
    A.spot = cand.length ? cand[Math.floor(Math.random() * cand.length)] : [e.x, e.y]; A.spotT = 4 + Math.random() * 3; A.path = null;
  }
  aquaGo(e, A.spot[0], A.spot[1], dt, .5);
}
// 往離溫特遠的地方游（嚇到、嘴裡含著人）
function aquaAway(e, dt, mul) {
  const p = G.player; if (!p) return aquaWander(e, dt);
  const A = e.aq;
  if (!A.away || (A.awayT -= dt) <= 0) {
    const L = aquaLabels(), id = L.label.get(aquaKey(e.x, e.y)), m = aquaMargin(e); let best = null, bd = -1, n = 0;
    for (const o of aquaPoolCells(L, id)) { if ((m && o.s < m) || Math.random() > .25) continue; const d = Math.hypot(o.x - p.x, o.y - p.y); if (d > bd) { bd = d; best = [o.x, o.y]; } if (++n > 200) break; }   // 只看這一池（aquaPoolCells）
    A.away = best || [e.x, e.y]; A.awayT = 2; A.path = null;
  }
  aquaGo(e, A.away[0], A.away[1], dt, mul);
}
// 看得到的人：溫特、隊員（活著、沒被噴飛／吃掉）
function aquaTargets(e, range) {
  return [G.player, ...(G.towers || [])].filter(a => a && a.hp > 0 && !a.vineCap && !a.eatenBy && !a.mrtRide && !a.grabbed && !a.grabFall && !a.berserk
    && Math.hypot(a.x - e.x, a.y - e.y) <= range * CELL && hasLineOfSight(e.x, e.y, a.x, a.y));
}
const aquaNearest = (e, list) => list.reduce((b, a) => !b || Math.hypot(a.x - e.x, a.y - e.y) < Math.hypot(b.x - e.x, b.y - e.y) ? a : b, null);
const aquaPersonInWater = a => !!(a.swimRing || a.drowning || a.poolFall || deepWaterAtPoint(a.x, a.y));

// ---- 生在水裡（js/anomalous-core.js 的 spawnCoreGroup 呼叫）：這隻要不要改生在深水裡；要的話回傳位置 ----
function aquaSpawnSpot(spec) {
  const W = WATER_MONSTERS;
  if (!spec || !WATER_MONSTER_IDS.includes(spec.id) || !aquaOn() || Math.random() >= W.spawnChance) return null;
  const p = G.player, L = aquaLabels(), out = [], m = aquaMarginOf(spec.width || 42);
  for (const k of L.deep) {
    if (L.sizes[L.label.get(k)] < W.minPool || !aquaRoomy(L, k, m)) continue;   // 離岸邊太近（身體會穿到岸上）不生
    const [x, y] = center(...k.split(',').map(Number));
    if (!deepWaterAtPoint(x, y)) continue;
    if (p) { const d = Math.hypot(x - p.x, y - p.y) / CELL; if (d < W.spawnMin || d > W.spawnMax) continue; }
    if ((G.towers || []).some(t => t.hp > 0 && Math.hypot(t.x - x, t.y - y) < 3 * CELL)) continue;
    out.push([x, y]);
  }
  if (!out.length) return null;
  const [x, y] = out[Math.floor(Math.random() * out.length)];
  return { x, y };
}
// 生出來之後（js/anomalous-core.js）：標記成水中怪物、濺個水花
function aquaSpawned(m) {
  m.aqua = true; m.aq = {};
  if (typeof poolCrownSplash === 'function') poolCrownSplash(G.poolSplash || (G.poolSplash = []), m.x, m.y + 8, .8);
}
// 不在水裡了（被推上岸、跳上岸、水被抽乾）：變回一般的陸地怪物
function aquaLeave(e) {
  e.aqua = false; e.aq = null; e.slimeLift = 0; e.airborne = false;
  if (e.behavior === 'clownfish' && typeof cfSwimStride === 'function') cfSwimStride(e, false);   // 小丑魚上岸：換圖速度換回原本的
  if (typeof resetEnemyNavigation === 'function') resetEnemyNavigation(e);
}

// ---- 每一幀（js/enemy-ai.js 的 stepEnemy 呼叫）：回傳 true＝這一幀由這裡處理（不跑陸地的 AI）----
function stepAquaMonster(e, dt) {
  if (!e.aq) e.aq = {};
  const A = e.aq;
  if (A.leap) { aquaLeapStep(e, dt); return true; }
  if (A.pop) {   // 小虱目魚小子剛從水裡撞上來：跳出水面再落回去
    A.pop.t += dt; const k = Math.min(1, A.pop.t / .6);
    e.slimeLift = Math.sin(Math.PI * k) * WATER_MONSTERS.small.leap; e.airborne = k < 1;
    if (k >= 1) { A.pop = null; e.slimeLift = 0; e.airborne = false; if (typeof poolFallSplash === 'function') poolFallSplash(e.x, e.y + 8, true); }
    return true;
  }
  if (!aquaOn() || !deepWaterAtPoint(e.x, e.y)) { aquaLeave(e); return false; }
  if (e.behavior === 'clownfish' && typeof cfSwimStride === 'function') cfSwimStride(e, true);   // 普通小丑魚在深水裡游：換圖慢一點（CLOWNFISH.swimFrameMul，js/clownfish.js）
  e.moving = false;
  if (e.stunT > 0) return true;
  if (!aquaPoolHasRoom(e)) { aquaGoAshore(e); return true; }   // 這一池太窄、游哪裡身體都會穿到岸上：直接跳上岸
  const busy = (e.fh && (e.fh.windup > 0 || e.fh.spray)) || (e.mf && (e.mf.windup > 0 || e.mf.pwindup > 0));   // 噴水、咬人到一半不打斷
  if (!busy && !aquaRoomy(aquaLabels(), aquaKey(e.x, e.y), aquaMargin(e))) { aquaGo(e, e.x, e.y, dt); return true; }   // 太靠岸邊（被推過來、剛浮上來）：先游回離岸夠遠的地方
  if (e.behavior === 'fishhead') aquaFish(e, dt);
  else if (e.behavior === 'milkfish') aquaMilkfish(e, dt);
  else if (e.behavior === 'milkfishSmall') aquaSmall(e, dt);
  else if (e.behavior === 'clownfish') aquaClown(e, dt);
  else aquaWander(e, dt);
  return true;
}

// 魚頭君：游到噴得到的地方，從水裡噴水
function aquaFish(e, dt) {
  const fh = e.fh || (e.fh = { cd: .8 + Math.random(), wait: 0, still: 0, trail: 0, lx: e.x, ly: e.y });
  fh.cd -= dt;
  if (fh.flee > 0) { fh.flee -= dt; fh.windup = 0; aquaAway(e, dt, 1.6); return; }   // 被打：嚇得游開
  if (fh.windup > 0) { fh.windup -= dt; if (fh.windup <= 0) startFishSpray(e); return; }
  if (fh.spray) return;   // 噴水中（js/fish-head.js 的 updateFishSprays）
  const t = aquaNearest(e, aquaTargets(e, WATER_MONSTERS.noticeRange));
  if (!t) { aquaWander(e, dt); return; }
  const d = Math.hypot(t.x - e.x, t.y - e.y);
  if (d <= FISH_HEAD.sprayRange * CELL) {
    if (fh.cd <= 0) { fh.aim = { x: t.x, y: t.y, who: t }; fh.windup = FISH_HEAD.windup; e.faceRight = t.x > e.x; }
    return;
  }
  aquaGo(e, t.x, t.y, dt);
}

// 虱目魚小子：吃隊友
function aquaMilkfish(e, dt) {
  const C = MILKFISH, mf = e.mf || (e.mf = { cd: 1 + Math.random(), wait: 0 });
  mf.cd -= dt; mf.patk = (mf.patk || 0) - dt;
  if (mf.windup > 0) { mf.windup -= dt; mfPose(e, 'attack', mf.aim ? mf.aim.x : null); if (mf.windup <= 0) mfGulp(e); return; }
  if (mf.pwindup > 0) { mf.pwindup -= dt; mfPose(e, 'attack', G.player ? G.player.x : null); if (mf.pwindup <= 0) mfBitePlayer(e); return; }
  mfPose(e, null);
  if (mf.prey) { aquaAway(e, dt, 1.3); return; }   // 嘴裡含著人：往離溫特遠的地方游
  let mate = null, md = Infinity;
  for (const t of G.towers || []) {
    if (!mfEdibleMate(e, t) || t.vineCap) continue;
    const d = Math.hypot(t.x - e.x, t.y - e.y);
    if (d <= WATER_MONSTERS.noticeRange * CELL && d < md && hasLineOfSight(e.x, e.y, t.x, t.y)) { mate = t; md = d; }
  }
  const p = G.player, pd = p && p.hp > 0 ? Math.hypot(p.x - e.x, p.y - e.y) : Infinity;
  if (pd <= C.playerReach && mf.patk <= 0 && !(mate && md <= C.eatReach)) { mf.pwindup = C.playerWindup; e.faceRight = p.x > e.x; return; }   // 溫特太靠近：咬一口
  if (!mate) { aquaWander(e, dt); return; }
  if (mf.cd <= 0 && md <= C.eatReach + 8) { mf.windup = C.windup; mf.aim = mate; e.faceRight = mate.x > e.x; return; }
  if (mf.cd <= 0 && !aquaPersonInWater(mate) && md <= (WATER_MONSTERS.milkfish.lunge + aquaMargin(e) - 1) * CELL) { aquaLeapAt(e, mate); return; }   // 隊友在岸上：跳上岸撲過去（牠現在離岸邊比較遠，撲的距離跟著加長）
  aquaGo(e, mate.x, mate.y, dt, 1.3);
}
// 跳上岸：往目標旁邊跳過去，落地後變回陸地怪物
function aquaLeapAt(e, t) {
  const dx = t.x - e.x, dy = t.y - e.y, d = Math.hypot(dx, dy) || 1, stop = Math.max(0, d - 26);
  e.aq.leap = { t: 0, from: { x: e.x, y: e.y }, to: { x: e.x + dx / d * stop, y: e.y + dy / d * stop } };
  e.faceRight = dx > 0;
  if (typeof poolCrownSplash === 'function') poolCrownSplash(G.poolSplash || (G.poolSplash = []), e.x, e.y + 8, .9);
  if (typeof sfxAt === 'function') sfxAt('poolBossSplash', e.x, e.y, .4, 'aqua-leap');
}
// 跳上離自己最近的岸（水池太窄時用）：挑旁邊是這一池深水、怪物站得住的地面格
function aquaGoAshore(e) {
  const L = aquaLabels(), id = L.label.get(aquaKey(e.x, e.y));
  let best = null, bd = Infinity;
  for (const [k, v] of L.label) {
    if (v !== id) continue;
    const [c, r] = k.split(',').map(Number);
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const kk = (c + dc) + ',' + (r + dr); if (L.deep.has(kk) || !inGrid(c + dc, r + dr)) continue;
      const [x, y] = center(c + dc, r + dr);
      if (typeof enemyBlocked === 'function' && enemyBlocked(x, y)) continue;
      const d = Math.hypot(x - e.x, y - e.y); if (d < bd) { bd = d; best = { x, y }; }
    }
  }
  if (!best) { aquaWander(e, 0); return; }   // 找不到能站的岸：留在水裡
  e.aq.leap = { t: 0, from: { x: e.x, y: e.y }, to: best };
  e.faceRight = best.x > e.x;
  if (typeof poolCrownSplash === 'function') poolCrownSplash(G.poolSplash || (G.poolSplash = []), e.x, e.y + 8, .9);
  if (typeof sfxAt === 'function') sfxAt('poolBossSplash', e.x, e.y, .4, 'aqua-leap');
}
function aquaLeapStep(e, dt) {
  const L = e.aq.leap, M = WATER_MONSTERS.milkfish;
  L.t += dt; const k = Math.min(1, L.t / M.leapSecs);
  e.x = L.from.x + (L.to.x - L.from.x) * k; e.y = L.from.y + (L.to.y - L.from.y) * k;
  e.slimeLift = Math.sin(Math.PI * k) * M.leapHeight; e.airborne = k < 1;
  if (k >= 1) { aquaLeave(e); if (e.mf) e.mf.cd = 0; }   // 上岸了：照陸地的行為（馬上撲過去吃）
}

// 小虱目魚小子：下潛 → 游到人下面 → 冒泡泡 → 往上撞飛
function aquaSmall(e, dt) {
  const S = WATER_MONSTERS.small, A = e.aq;
  if (A.atkT == null) A.atkT = wmRand(S.every) * .6;
  A.atkT -= dt;
  const list = aquaTargets(e, S.range).filter(a => aquaPersonInWater(a) || aquaNearShore(e, a, S.reach)), t = aquaNearest(e, list);   // 泡在水裡、或站在水邊的人
  if (t && A.atkT <= 0) { A.atkT = wmRand(S.every); aquaDive(e, t); return; }
  if (t) { if (Math.hypot(t.x - e.x, t.y - e.y) > 3 * CELL) aquaGo(e, t.x, t.y, dt); return; }
  aquaWander(e, dt);
}
// 岸上的人離這一池水夠不夠近（reach 格內）
function aquaNearShore(e, a, reach) {
  const k = aquaNearestCell(e, a.x, a.y, 0); if (!k) return false;   // 量的是「離水邊多遠」，不管怪物自己能不能游到那裡
  const [x, y] = center(...k.split(',').map(Number));
  return Math.hypot(x - a.x, y - a.y) <= reach * CELL;
}
function aquaDive(e, t) {
  const i = G.enemies.indexOf(e); if (i < 0) return;
  G.enemies.splice(i, 1);
  for (const o of G.towers || []) if (o.target === e) o.target = null;
  e.aq.diving = true; e.aq.path = null;   // 潛在水裡（只看得到影子）：可以游到岸邊撞人，不用離岸
  (G.aquaUnder = G.aquaUnder || []).push({ e, target: t, t: 0, phase: 'swim' });
  if (typeof poolCrownSplash === 'function') poolCrownSplash(G.poolSplash || (G.poolSplash = []), e.x, e.y + 8, .7);
}
function updateAquaUnder(dt) {
  const list = G.aquaUnder; if (!list || !list.length) return;
  const S = WATER_MONSTERS.small;
  for (const u of [...list]) {
    const e = u.e;
    const done = () => { list.splice(list.indexOf(u), 1); if (e.aq) { e.aq.diving = false; e.aq.path = null; } if (e.hp > 0 && !e.dead && !G.enemies.includes(e)) G.enemies.push(e); };
    if (e.hp <= 0 || e.dead || !aquaOn()) { done(); continue; }
    u.t += dt;
    if (u.phase === 'swim') {
      const t = u.target, alive = t && t.hp > 0 && !t.vineCap && !t.eatenBy;
      const d = alive ? aquaGo(e, t.x, t.y, dt, S.swimMul) : 0;
      if (!alive || d < S.radius * CELL || e.aq.arrived || u.t >= S.diveMax) {   // 游到目標附近（撞得到的距離）就準備撞上來
        u.phase = 'warn'; u.t = 0; u.spot = { x: e.x, y: e.y };
        if (alive && d > 4) { const k = Math.min(d, CELL * .9) / d; u.spot = { x: e.x + (t.x - e.x) * k, y: e.y + (t.y - e.y) * k }; }   // 目標在岸上：從水邊（往目標那邊靠一點）撞上來
        if (typeof sfxAt === 'function') sfxAt('poolWaterDrop', e.x, e.y, .6, 'aqua-bubble'); }
      continue;
    }
    if (u.t < S.warn) continue;
    // 撞上來！範圍內的人往上撞飛
    done();
    e.aq.pop = { t: 0 };
    if (typeof poolCrownSplash === 'function') poolCrownSplash(G.poolSplash || (G.poolSplash = []), u.spot.x, u.spot.y + 6, 1.1);
    if (typeof sfxAt === 'function') sfxAt('poolBossSplash', u.spot.x, u.spot.y, .8, 'aqua-pop');
    for (const a of [G.player, ...(G.towers || [])]) {
      if (!a || a.hp <= 0 || a.vineCap || a.eatenBy || Math.hypot(a.x - u.spot.x, a.y - u.spot.y) > S.radius * CELL) continue;
      if (typeof fkLaunch === 'function') fkLaunch(a, u.spot, { up: S.up, distMin: S.distMin, distMax: S.distMax, landDamage: S.landDamage, panic: S.panic, say: '被撞飛了！' });
    }
  }
}

// 比基尼小丑魚：靠近人，在水裡生浮在水上的魚卵（炸彈，不會孵化）
function aquaClown(e, dt) {
  const K = WATER_MONSTERS.clown, A = e.aq;
  if (A.eggT == null) A.eggT = wmRand(K.every) * .5;
  A.eggT -= dt;
  const t = aquaNearest(e, aquaTargets(e, WATER_MONSTERS.noticeRange));
  if (!t) { aquaWander(e, dt); return; }
  const d = Math.hypot(t.x - e.x, t.y - e.y);
  if (d > K.keep * CELL) aquaGo(e, t.x, t.y, dt); else e.faceRight = t.x > e.x;
  if (A.eggT <= 0 && d <= K.near * CELL) { A.eggT = wmRand(K.every); aquaLayEgg(e); }
}
function aquaLayEgg(e) {
  const K = WATER_MONSTERS.clown, eggs = (G.fishEggs = G.fishEggs || []);
  if (eggs.filter(g => g.water).length >= K.maxEggs) return;
  const a = Math.random() * Math.PI * 2, x = e.x + Math.cos(a) * 14, y = e.y + 8 + Math.sin(a) * 8;
  if (!deepWaterAtPoint(x, y)) return;
  eggs.push({ x, y, floor: typeof actorFloor === 'function' ? actorFloor(e) : 1, vx: 0, vy: 0, arm: CLOWNFISH.eggArm, life: K.eggLife, age: 0, fuse: 0, seed: Math.random() * 9, hatch: false, water: true });
  if (typeof sfxAt === 'function') sfxAt('pop', e.x, e.y, .5, 'egg-pop');
  if (typeof poolFallSplash === 'function') poolFallSplash(x, y, false);
}

// ---- 泳圈上戰鬥 ----
// 開槍的後座力（js/game.js 溫特開槍、隊員開槍時呼叫）：往槍口反方向飄一小段
function ringRecoil(a, ang) {
  if (!a || !a.swimRing) return;
  const C = WATER_COMBAT, v = 2 * C.recoil / C.recoilSecs;
  a.ringDrift = { vx: -Math.cos(ang) * v, vy: -Math.sin(ang) * v, t: C.recoilSecs, t0: C.recoilSecs };
}
function ringDriftStep(a, dt) {
  const d = a && a.ringDrift; if (!d) return;
  if (!a.swimRing || a.vineCap || a.eatenBy) { a.ringDrift = null; return; }
  const k = Math.max(0, d.t / d.t0), nx = a.x + d.vx * k * dt, ny = a.y + d.vy * k * dt;
  if (deepWaterAtPoint(nx, ny) && !solidBlocksPoint(nx, ny)) { a.x = nx; a.y = ny; }   // 只在水裡飄，碰到岸、牆就停
  if ((d.t -= dt) <= 0) a.ringDrift = null;
}
// 坐泳圈時打不中（js/game.js 問）：true＝這一下打偏了
const ringShotMiss = a => !!(a && a.swimRing && Math.random() > WATER_COMBAT.hitMul);
// 坐泳圈時攻擊速度倍率（js/game.js 算冷卻時用）
const ringRateMul = a => a && a.swimRing ? WATER_COMBAT.rateMul : 1;

// ---- 每一幀（js/pool-tide.js 的 updatePoolTide 呼叫）----
function updateWaterMonsters(dt) {
  if (typeof updateFkThrows === 'function') updateFkThrows(dt);   // 被魚頭王的水柱、小虱目魚小子撞飛在空中的人（js/fish-king.js）
  updateAquaUnder(dt);
  for (const a of [G.player, ...(G.towers || [])]) if (a) ringDriftStep(a, dt);
}

// ---- 畫面 ----
// js/water.js 的 wadeInfo：水中怪物泡在水裡（跳起來的時候不算）
function aquaWade(a) {
  if (!a.aqua) return undefined;
  if ((a.slimeLift || 0) > 4 || !deepWaterAtPoint(a.x, a.y)) return null;
  const W = WATER_MONSTERS, w = typeof waterAt === 'function' ? waterAt(a.x, a.y + 10) : null;
  return { w: { depth: a.type === 'fish_head' && Number.isFinite(W.fishHeadSink) ? W.fishHeadSink : W.sink, see: w && Number.isFinite(w.see) ? Math.min(w.see, W.see) : W.see }, bottom: a.y + 13, height: (a.drawHeight || 33) * (a.sizeMul || 1), width: (a.drawWidth || 42) * (a.sizeMul || 1) };
}
// js/render.js 畫地面時呼叫：潛在水裡的小虱目魚小子的影子、要撞上來前的泡泡
function drawWaterMonstersGround(ctx) {
  const list = G && G.aquaUnder; if (!list || !list.length) return;
  const now = performance.now() / 1000, S = WATER_MONSTERS.small;
  for (const u of list) {
    const e = u.e, img = monsterImage((e.frames && e.frames.front) || e.sprite);
    if (img && img.complete && img.naturalWidth) {
      const w = e.drawWidth || 60, h = e.drawHeight || 60;
      ctx.save(); ctx.globalAlpha = .3; ctx.imageSmoothingEnabled = false;
      ctx.translate(e.x, e.y + 13 + h * .15); if (e.faceRight) ctx.scale(-1, 1);
      if (typeof drawDiveTinted === 'function') drawDiveTinted(ctx, img, -w / 2, -h, w, h);   // 潛在水裡：壓藍黑色（js/water.js 的 WATER.dive）
      else { ctx.filter = 'brightness(.45) saturate(.5)'; ctx.drawImage(img, -w / 2, -h, w, h); }
      ctx.restore();
    }
    if (u.phase !== 'warn') continue;
    const k = Math.max(0, Math.min(1, u.t / S.warn)), R = S.radius * CELL, x = u.spot.x, y = u.spot.y + 8;
    ctx.save();
    ctx.globalAlpha = .3 + .5 * k; ctx.strokeStyle = '#e6f8ff'; ctx.lineWidth = 2; ctx.setLineDash([5, 4]); ctx.lineDashOffset = -now * 30;
    ctx.beginPath(); ctx.ellipse(x, y, R, R * .4, 0, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 8; i++) {
      const ph = (now * 1.8 + i * .37) % 1, ang = i * 2.1, rr = R * .7 * ((i * .29) % 1);
      ctx.globalAlpha = (1 - ph) * (.4 + .5 * k);
      ctx.beginPath(); ctx.arc(x + Math.cos(ang) * rr, y + Math.sin(ang) * rr * .4 - ph * 12, 1.4 + 1.8 * (1 - ph), 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
}
// 浮在水上的魚卵（js/clownfish.js 的 drawFishEgg 呼叫）：跟丟進水裡的道具同一套載浮載沉（js/pool-fall.js 的 poolFloatPose、js/water.js 的 drawWaded）
function drawFloatingFishEgg(egg) {
  if (typeof poolFloatPose !== 'function' || typeof drawWaded !== 'function' || !deepWaterAtPoint(egg.x, egg.y)) return false;
  const S = CLOWNFISH.eggSize * (egg.big ? egg.big.size : 1);   // 池核 BOSS 生的大顆魚卵比較大
  egg.floatPose = poolFloatPose(egg, { bottom: egg.y + 2, height: S, width: S * 1.4, sink: .35, bob: .6, pivot: 0 });
  egg.floatBusy = true;
  try { drawWaded(egg, 'float', () => drawFishEgg(ctx, egg)); } finally { egg.floatBusy = false; }
  return true;
}
