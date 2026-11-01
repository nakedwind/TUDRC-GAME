/* ===== 路邊會暴衝的機車、腳踏車（K56 區-地下街）=====
   地圖上擺的外送機車、公共自行車（物件圖，在地圖編輯器照常擺放）：
   ・平常停著。有人（溫特、隊員、怪物都算）走進車頭前方的路線 → 發出機車聲／腳踏車聲、車身抖一下，就往車頭方向直衝；
   ・衝到牆邊、建築前面才停，路線上碰到的每個人各撞一次（敵我都撞飛、都會痛），撞到人時響喇叭／車鈴；
   ・撞上去時播撞牆動畫：車頭頂著牆、後輪翹起來，車身左右壓扁再彈回；
   ・動畫播完調頭，冷卻完可以再往回衝。玩家可以利用牠們把怪物引到路線上撞。
   飛在空中的怪物、鑽在地底的老鼠撞不到；推不動的菁英怪只扣血、不會飛出去。
   （數值集中在最上面，想調整改這裡就好）
*/
const STREET_VEHICLES = {
  maps: ['map_mvvdbiyx'],     // 哪幾張地圖的車會動（K56區-地下街）
  triggerCells: 7,            // 車頭前方幾格內有人就發動
  laneHalf: 30,               // 路線的半寬（像素）：離車身中線這麼近才算在路線上、才撞得到
  activeCells: 18,            // 離溫特幾格內的車才會動（畫面外不自己把怪撞死）
  minLaneCells: 3,            // 前方空地少於幾格就不衝
  startOutCells: 2.5,         // 車停在人行道（不可走的格子）上：衝出來時最多穿過幾格
  backReach: 24,              // 車尾往後幾像素內也算撞到
  front: 34,                  // 車頭離車身中心幾像素（撞牆、撞人都從這裡算）
  buildingDamage: 40,         // 撞到玩家蓋的建築扣多少血（地圖原本的障礙物、營地基地不受傷）
  types: {
    tile_street_scooter_delivery_green: 'scooter',
    tile_street_scooter_delivery_pink: 'scooter',
    tile_street_ubike: 'bike',
  },
  // warn：發動前的警示秒數；speed、accel：最高速、加速度（像素／秒）；cooldown：停下來之後最少等幾秒，再加上 0～cooldownRand 秒
  // crash：撞牆動畫（time 秒數；lift 後輪翹起的角度〔弧度〕；squash 左右壓扁的比例；pivot 前輪離車身中心幾像素，繞這裡翹起來）
  // startSound：發動時的聲音；hitSound：撞到人的聲音（音效編輯器可以換）
  // player、mate、enemy：撞到溫特、隊員、怪物的傷害；knock：撞飛距離（像素）；knockTime：飛在空中幾秒；toss：飛多高（像素）、往前翻幾度（弧度）、落地小彈幾秒
  scooter: { warn: .65, speed: 560, accel: 1800, cooldown: 6, cooldownRand: 4, player: 20, mate: 22, enemy: 80, knock: 200, knockTime: .62, toss: { h: 74, spin: 1.3, bounce: .2 }, startSound: 'scooterRev', hitSound: 'scooterHorn', shake: 7, crash: { time: .65, lift: .44, squash: .24, pivot: 26 } },
  bike:    { warn: .55, speed: 330, accel: 1100, cooldown: 5, cooldownRand: 3, player: 10, mate: 11, enemy: 35, knock: 115, knockTime: .46, toss: { h: 42, spin: .8, bounce: .16 }, startSound: 'bikeRide', hitSound: 'bikeBell', shake: 4, crash: { time: .55, lift: .34, squash: .2, pivot: 28 } },
};

// 每局開始（js/game.js 的 newGame）：把車的物件圖從地圖上藏起來，改成會動的版本
function setupStreetVehicles() {
  G.streetVehicles = [];
  if (!MAP || MAP_SAFE || !STREET_VEHICLES.maps.includes(MAP.id)) return;
  for (const s of MAP.stamps || []) {
    const kind = STREET_VEHICLES.types[s.id], tile = kind && mapTileById(s.id);
    if (!tile) continue;
    G.mapDestroyed.add(s);
    G.streetVehicles.push({
      stamp: s, tile, cfg: STREET_VEHICLES[kind], kind, state: 'idle', dir: s.fx ? -1 : 1, spd: 0, cd: Math.random() * 2, scanT: Math.random() * .25,
      x: OX + (s.c + mapTileW(tile) / 2) * CELL + (s.ox || 0),
      y: OY + (s.r + mapTileH(tile) - .5) * CELL + (s.oy || 0),   // 最下面那一格的中心：輪子壓的那條線
      outOfStart: false, stopX: 0, hit: new Set(), warnT: 0, crashT: 0,
    });
    const v = G.streetVehicles[G.streetVehicles.length - 1];
    if (vehicleLaneStop(v) === null) v.dir = -v.dir;   // 車頭朝著牆停的：一開始就調頭，不然永遠衝不出去
  }
}

const vehicleBlockedAt = (x, y) => { const [c, r] = cellAt(x, y); return !inGrid(c, r) || solidBlocksPoint(x, y) || !!barrierAt(c, r); };
// 往車頭方向看：能衝到哪裡（回傳車身中心的停止 x）；前面沒地方衝就回傳 null
function vehicleLaneStop(v) {
  const S = STREET_VEHICLES, step = CELL / 4;
  let d = S.front, out = false;
  for (; d < 40 * CELL; d += step) {
    const blocked = vehicleBlockedAt(v.x + v.dir * d, v.y);
    if (!blocked) out = true;
    else if (out) break;
    else if (d > S.startOutCells * CELL + S.front) return null;   // 整段都是牆：這台車出不去
  }
  const dist = d - S.front;
  return out && dist >= S.minLaneCells * CELL ? v.x + v.dir * dist : null;
}
// 誰會被車撞到／誰會讓車發動：活著、在地面上
function vehicleEnemyOk(e) {
  return !e.dead && e.hp > 0 && !e.flying && !(e.playerPounceT > 0) && !(e.behavior === 'burrow' && typeof burrowUnderground === 'function' && burrowUnderground(e));
}
const vehicleMateOk = t => t.hp > 0 && !t.eatenBy && !t.grabbed && !t.grabFall && !t.sitting;
function vehicleLaneHasSomeone(v, stopX) {
  const S = STREET_VEHICLES, reach = Math.min(S.triggerCells * CELL, Math.abs(stopX - v.x) + S.front);
  const inLane = o => { const dx = (o.x - v.x) * v.dir; return dx > 0 && dx <= reach && Math.abs(o.y - v.y) <= S.laneHalf; };
  const p = G.player;
  if (p && p.hp > 0 && !p.sitting && inLane(p)) return true;
  return G.towers.some(t => vehicleMateOk(t) && inLane(t)) || G.enemies.some(e => vehicleEnemyOk(e) && inLane(e));
}

function vehicleStart(v, stopX) {
  v.state = 'warn'; v.warnT = v.cfg.warn; v.stopX = stopX; v.hit.clear();
  if (typeof sfxAt === 'function') sfxAt(v.cfg.startSound, v.x, v.y, 1, 'vehicle-start-' + v.stamp.c + ',' + v.stamp.r);
}
// 撞上牆或建築：先播撞牆動畫，播完才調頭（updateStreetVehicles）
function vehicleCrash(v) {
  const S = STREET_VEHICLES, x = v.x + v.dir * S.front, p = G.player;
  v.state = 'crash'; v.spd = 0; v.outOfStart = false; v.crashT = 0;
  G.effects.push({ ring: true, x, y: v.y + 12, r: 4, r2: 26, life: .24, life0: .24, color: '#c9c2b0' });
  for (let i = 0; i < 6; i++) {
    const a = (v.dir > 0 ? Math.PI : 0) + (Math.random() * 2 - 1) * 1.1, sp = 70 + Math.random() * 120;
    G.effects.push({ particle: true, kind: 'spark', x, y: v.y + Math.random() * 14 - 4, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 40, r: 2 + Math.random() * 2, life: .18 + Math.random() * .16, life0: .34, color: i % 2 ? '#fff0c8' : '#b9b2a2' });
  }
  if (typeof sfxAt === 'function') sfxAt('knock2', x, v.y, .8, 'vehicle-crash-' + v.stamp.c + ',' + v.stamp.r);
  if (p && Math.hypot(p.x - v.x, p.y - v.y) < 6 * CELL) addShake(v.cfg.shake * .5);
  vehicleCrashBuilding(v, v.x + v.dir * (S.front + CELL / 4 + 1), v.y);
}
function vehicleCrashDone(v) {
  v.state = 'idle'; v.dir = -v.dir;   // 調頭，下次往回衝
  v.cd = v.cfg.cooldown + Math.random() * v.cfg.cooldownRand;
}
// 撞到玩家蓋的建築：扣血（地圖原本的障礙物、營地基地不受傷）
function vehicleCrashBuilding(v, x, y) {
  const [c, r] = cellAt(x, y), o = inGrid(c, r) && barrierAt(c, r);
  if (!o || o.mapSource || o.isBase) return;
  o.lastHitBy = 'monster'; o.hp -= STREET_VEHICLES.buildingDamage; o.hitT = HIT_DUR;   // 油桶類只會漏油、不會爆炸（js/oil-barrels.js）
  if (o.hp <= 0) destroyObstacleNow(o);
}

// ---- 撞到人：往車子前進的方向飛，稍微往旁邊偏（看人站在車身哪一側）----
function vehicleKnockDir(v, o) {
  const ux = v.dir, uy = Math.max(-.6, Math.min(.6, (o.y - v.y) / STREET_VEHICLES.laneHalf * .6)), d = Math.hypot(ux, uy);
  return { x: ux / d, y: uy / d };
}
// 被撞飛：飛到空中再落地（沿用 js/gourd-monkey.js 的 gourdToss，水平移動是擊退滑行）
function vehicleToss(v, a, dir, k = 1) {
  const T = v.cfg.toss;
  a.gourdToss = { t: 0, h: T.h * k, dur: v.cfg.knockTime, bounce: T.bounce, spin: T.spin * k, side: dir.x >= 0 ? 1 : -1, bounced: false };
}
function vehicleImpactFx(v, o) {
  const x = (v.x + o.x) / 2, y = o.y - 14;
  playAttackSprite('charge-impact', x, y, .34, v.dir > 0 ? 0 : Math.PI);   // 跟鳥頭人衝撞同一張撞擊圖
  for (let i = 0; i < 5; i++) {
    const a = (v.dir > 0 ? 0 : Math.PI) + (Math.random() * 2 - 1) * .8, sp = 140 + Math.random() * 160;
    G.effects.push({ particle: true, kind: 'spark', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 30, r: 2 + Math.random() * 2, life: .16 + Math.random() * .14, life0: .3, color: i % 2 ? '#fff0c8' : '#ffb066' });
  }
  if (typeof sfxAt === 'function') sfxAt(v.cfg.hitSound, x, y, 1, 'vehicle-hit-' + v.stamp.c + ',' + v.stamp.r);
}
function vehicleHitPlayer(v, p) {
  const C = v.cfg, dmg = Math.round(typeof equipPlayerDamage === 'function' ? equipPlayerDamage(C.player) : C.player), dir = vehicleKnockDir(v, p);
  vehicleImpactFx(v, p);
  p.hp = Math.max(0, p.hp - dmg);
  p.hitT = .35; p.underAttackT = 5; G.damageVignetteT = .35;
  flashDmg('-' + dmg, p.x, p.y - 46, '#ff6b6b');
  addShake(C.shake); addHitstop(.06);
  playPlayerHit(1, true);
  if (!(p.rootT > 0)) { knockActor(p, dir.x, dir.y, C.knock, C.knockTime); vehicleToss(v, p, dir); }   // 被絲瓜藤纏住的飛不動
  if (p.hp <= 0 && !G.over) { flash('部隊長失去戰鬥能力', p.x, p.y - 58, '#ff5b6e'); lose('player', v.kind === 'bike' ? '被腳踏車撞倒' : '被機車撞倒'); }
}
function vehicleHitMate(v, t) {
  if (parryMiss(t, false)) return;   // 柯林的劍舞架勢：閃開
  const C = v.cfg, dmg = C.mate * (1 - sentryDefense(t)), dir = vehicleKnockDir(v, t);
  vehicleImpactFx(v, t);
  t.hp = Math.max(0, t.hp - dmg);
  t.hitT = Math.max(t.hitT || 0, .25);
  flash('-' + Math.round(dmg), t.x, t.y - 30, '#ff8f8f');
  if (!(t.rootT > 0)) { knockActor(t, dir.x, dir.y, C.knock, C.knockTime); vehicleToss(v, t, dir); }
  t.navPath = null; t.navGoal = null;
  if (t.hp <= 0) { t.target = null; sentryStatus(t, '失去戰鬥能力', '#ff5b6e', true); }
  else if (typeof mateHurtSay === 'function') mateHurtSay(t, 'hurt');
}
function vehicleHitEnemy(v, e) {
  const C = v.cfg, dir = vehicleKnockDir(v, e);
  vehicleImpactFx(v, e);
  const resist = (typeof SLIME_VARIANTS !== 'undefined' && SLIME_VARIANTS[e.variant]?.knockResist) || 0, mul = e.unpushable ? 0 : (1 - resist) * (e.knockMul ?? 1), flies = C.knock * mul > 1;
  const lethal = flies && e.hp <= C.enemy;
  e.hp = lethal ? 1 : e.hp - C.enemy;   // 這一下會死的：先飛出去，落地才死（不然屍體直接倒在原地，看不到撞飛）
  e.hitT = .2; e.hitColor = '#ffd27a';
  flashDmg('-' + C.enemy, e.x, e.y - 26, '#ffd27a');
  enemyHitReact(e, v.x, v.y, true);
  if (!flies) return;
  const dist = C.knock * mul;
  e.knockT = C.knockTime; e.knockVX = dir.x * dist / C.knockTime; e.knockVY = dir.y * dist / C.knockTime;
  vehicleToss(v, e, dir, Math.max(.4, mul));
  if (lethal) e.vehicleDoomed = true;
}
function vehicleHitSomeone(v) {
  const S = STREET_VEHICLES;
  const touch = o => { const dx = (o.x - v.x) * v.dir; return dx >= -S.backReach && dx <= S.front + 8 && Math.abs(o.y - v.y) <= S.laneHalf && !v.hit.has(o); };
  const p = G.player;
  if (p && p.hp > 0 && !p.sitting && touch(p)) { v.hit.add(p); vehicleHitPlayer(v, p); }
  for (const t of G.towers) if (vehicleMateOk(t) && touch(t)) { v.hit.add(t); vehicleHitMate(v, t); }
  for (const e of G.enemies) if (vehicleEnemyOk(e) && touch(e)) { v.hit.add(e); vehicleHitEnemy(v, e); }
}

function updateStreetVehicles(dt) {
  if (!G.streetVehicles || !G.streetVehicles.length || G.over) return;
  const S = STREET_VEHICLES, p = G.player;
  for (const e of G.enemies) if (e.vehicleDoomed && !(e.gourdToss && !e.gourdToss.bounced)) { e.vehicleDoomed = false; e.hp = 0; }   // 被撞死的怪：落地了
  for (const v of G.streetVehicles) {
    if (v.state === 'idle') {
      v.cd -= dt; v.scanT -= dt;
      if (v.cd > 0 || v.scanT > 0) continue;
      v.scanT = .2;
      if (!p || Math.hypot(p.x - v.x, p.y - v.y) > S.activeCells * CELL) continue;
      const stopX = vehicleLaneStop(v);
      if (stopX !== null && vehicleLaneHasSomeone(v, stopX)) vehicleStart(v, stopX);
    } else if (v.state === 'warn') {
      v.warnT -= dt;
      if (v.warnT > 0) continue;
      v.state = 'dash'; v.spd = 0; v.outOfStart = false;
    } else if (v.state === 'crash') {
      v.crashT += dt;
      if (v.crashT >= v.cfg.crash.time) vehicleCrashDone(v);
    } else {
      v.spd = Math.min(v.cfg.speed, v.spd + v.cfg.accel * dt);
      let move = v.spd * dt;
      while (move > 0 && v.state === 'dash') {
        const s = Math.min(6, move); move -= s;
        const fx = v.x + v.dir * (S.front + s), blocked = vehicleBlockedAt(fx, v.y);
        if (!blocked) v.outOfStart = true;
        if (blocked && v.outOfStart) { vehicleCrash(v); break; }
        v.x += v.dir * s;
        vehicleHitSomeone(v);
        if ((v.stopX - v.x) * v.dir <= 0) vehicleCrash(v);
      }
      if (v.state === 'dash' && Math.random() < .6) G.effects.push({ particle: true, kind: 'spark', x: v.x - v.dir * 30, y: v.y + 16, vx: -v.dir * 50, vy: -10, r: 2 + Math.random() * 2, life: .28, life0: .28, color: '#b9b2a2' });   // 車尾揚起的灰塵
    }
  }
}

// ---- 畫車：跟角色一起排前後（js/render.js）----
function streetVehicleSortables(list) {
  for (const v of G.streetVehicles || []) list.push({ y: v.y + 16, draw: () => drawStreetVehicle(ctx, v) });
}
function drawStreetVehicle(ctx, v) {
  const img = tileImage(v.tile); if (!img) return;
  const w = mapTileW(v.tile) * CELL, h = mapTileH(v.tile) * CELL;
  const shake = v.state === 'warn' ? (Math.random() * 2 - 1) * 1.6 : 0;   // 發動前抖動
  const lean = v.state === 'dash' ? -.05 * Math.min(1, v.spd / v.cfg.speed) : 0;   // 衝刺時車頭微微抬起
  ctx.save();
  ctx.translate(v.x + shake, v.y + CELL / 2);   // 原點：車子底邊中央
  ctx.scale(v.dir, 1);
  if (lean) ctx.rotate(lean);
  if (v.state === 'crash') {
    const C = v.cfg.crash, k = v.crashT / C.time, a = vehicleCrashLift(k) * C.lift;
    const q = C.squash * Math.exp(-4.5 * k) * Math.cos(k * 13);   // 一撞上最扁，邊彈邊恢復
    ctx.translate(C.pivot, 0); ctx.rotate(a); ctx.scale(1 - q, 1 + q * .5); ctx.translate(-C.pivot, 0);   // 以前輪著地點為軸：後輪翹起、往牆的方向壓扁
  }
  ctx.drawImage(img, -w / 2, -h, w, h);
  ctx.restore();
}
// 撞牆動畫的後輪高度（0＝著地、1＝翹最高）：k＝動畫進度 0～1。很快翹起來、落下，再小彈一下
function vehicleCrashLift(k) {
  if (k < .25) { const u = k / .25; return 1 - (1 - u) * (1 - u); }
  if (k < .72) { const u = (k - .25) / .47; return 1 - u * u; }
  return .14 * Math.sin((k - .72) / .28 * Math.PI);
}
