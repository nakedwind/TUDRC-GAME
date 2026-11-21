/* ===== 菁英 BOSS「虱目魚王」（behavior: "milkfishKing"；G11區-綠線捷運站，守在核心旁）=====
   ・外型：虱目魚小子放大、頭上戴王冠（之後有專屬圖再換）。走路很重：每一步震動畫面、大聲的腳步聲、地上踩出小裂痕。
   ・走路的重量感（參考鳥頭大隊長）：每一步先跨出去、落腳時慢下來（一頓一頓的），身體跟著上下起伏，
           走路圖兩張換一步、跟落腳同步；落腳時壓扁一下、揚起煙塵。數值在下面的 MILKFISH_KING_FX（gaitMin、bobHeight）。
   ・守衛：一開始站在核心旁邊不動。溫特走近（看得到）、牠被打、或核心被叫醒 → 吼叫，核心跟著甦醒，
           牠走過去把核心「吞進肚子裡」保護（肚子透出紫光）。核心在肚子裡：打不到、炸不到；牠自己的防禦力不變。
   ・核心在肚子裡的時候：攻擊力變高（coreAtkMul 倍：咬人、打建築、吐東西砸人、隊友摔傷都算），
           每一步在腳下留一攤腐蝕池（溫特、隊友踩到扣血；怪物不怕），站著不動也會一直冒在腳下。核心吐出來就恢復。
   ・吃建築：燈、路障、油箱、油桶、地雷……兩格以內的建築都吃（基地、礦石、鐵門不吃），存在肚子裡。
   ・吐建築攻擊：瞄準隊友或溫特把肚子裡的東西吐出去（地上先出現紅圈），砸到的人受傷、被撞開。
       地雷 → 落地爆炸；油桶、油箱、瓦斯爐 → 落地爆炸（跟被溫特打爆一樣，會起火）；郵筒 → 撞破漏出一灘油；
       露營燈 → 燒一小團火。地雷以外的東西落地都會碎成好幾塊往外飛（碎掉動畫）。
       （在肚子裡不會爆炸）
   ・吃隊友：最多同時含 maxPrey 個（整個人看不見，肚子那裡冒出他說的話，每 preyTalkEvery 秒一句），含 holdTime 秒後瞄準別的隊友或溫特吐出來；
       含著隊友時附近沒人，就主動走去找人準備吐。追隊友／建築走不過去（身體太寬）時，stuckGive 秒後先放棄，去做別的事：
       隊友飛到地上受傷、躺著暈眩（借用 js/vines.js 被藤蔓丟下來的動畫），落點旁邊的人也會被砸到。
   ・吐核心（表演）：血量每掉 coreSpitHp，就把核心吐到地上，喘 coreOutTime 秒後急著衝回去吞回來；核心在地上時打得到。
   ・倒下：核心掉在原地，嘴裡的隊友獲救（直接放出來）。
   數值：怪物編輯器的「虱目魚王」（data/monsters.js 的 milkfish_king；行為欄位表在 js/monster-data.js 的 MILKFISH_KING_FIELDS）。
   哪張地圖有牠：下面的 MILKFISH_KING_MAPS。
   必須在 milkfish-kid.js、vines.js、landmine.js、oil-barrels.js 之後、game.js 之前載入。
*/
// 地圖 id → 出生位置（{ c, r }；空的 {}＝站在地圖核心下方 2 格）
const MILKFISH_KING_MAPS = {
  map_mwm655e8: {},   // G11區-綠線捷運站
};
// 不想給編輯器調的細節（動畫、特效）
const MILKFISH_KING_FX = {
  name: '虱目魚王',
  stepEvery: 70,          // 每走幾像素踩一步（震動、腳步聲）
  shakeRange: 18,         // 溫特在幾格內才感覺得到震動
  eatReach: 95,           // 離隊友幾像素內可以吞
  gulpWindup: .45,        // 吞隊友前張嘴（秒）
  biteReach: 80, biteWindup: .5, biteHit: 100, biteCooldown: 1.4,   // 咬溫特
  itemReach: 1.5,         // 離建築中心幾格內可以吃（牠很大隻）
  itemMaxCells: 2,        // 佔幾格以內的建築才吃得下
  roarTime: 1.4,          // 吼叫幾秒
  coreGulpTime: .9,       // 吞核心要嚼多久
  coreSpitWindup: 1,      // 吐核心前鼓起來發抖（秒）
  coreFlight: .8,         // 核心在空中飛幾秒
  coreSpitDist: [3, 4.5], // 核心吐多遠（格）
  mateArcTime: .9,        // 隊友在空中飛幾秒
  wanderRadius: 3,        // 閒晃範圍（格，以原位為中心）
  stuckGive: 2.5,         // 走向隊友／建築／溫特，幾秒都沒更靠近就放棄（身體太寬擠不過去時才不會卡在原地）
  stuckSkip: 6,           // 放棄後幾秒內不再去追那個目標
  preyTalkEvery: 3.5,     // 被吞進肚子的隊友每隔幾秒在肚子那裡冒一句話（對話編輯器「被虱目魚小子吞掉」那格的台詞）
  gaitMin: .3,            // 落腳那一刻的速度只剩幾成（越小越「一頓一頓」）；平均速度還是怪物編輯器的「速度」
  bobHeight: 5,           // 走路時身體上下起伏多高（像素）
  shards: { cols: 3, rows: 3, gravity: 900, life: 1.2 },   // 吐出來的建築碎掉：切成幾塊、往下掉多快、碎片留幾秒
};
// 走路一頓一頓的時候，為了讓平均速度不變要乘的倍數（照 gaitMin 先算好）
const MK_GAIT_NORM = (() => { const m = MILKFISH_KING_FX.gaitMin, n = 200; let s = 0; for (let i = 0; i < n; i++) s += 1 / (m + (1 - m) * Math.sin(Math.PI * (i + .5) / n)); return s / n; })();
// 現在的攻擊力倍數：核心在肚子裡才變高
const mkAtk = e => e && e.mk && e.mk.coreIn ? mkCfg(e).coreAtkMul : 1;
const mkKings = () => (G && G.mkKings) || [];
const mkDist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const mkCfg = e => e.mkCfg || (typeof validMilkfishKingCfg === 'function' ? validMilkfishKingCfg(null) : {});
const mkAlive = e => !!(e && !e.dead && e.hp > 0 && G.enemies.includes(e));

// ---- 開場：照 MILKFISH_KING_MAPS 擺在核心旁（game.js 在 seedCores 之後呼叫）----
function seedMilkfishKing() {
  G.mkKings = []; G.mkShots = []; G.mkShards = [];
  const cfg = typeof MAP !== 'undefined' && MAP ? MILKFISH_KING_MAPS[MAP.id] : null;
  if (!cfg || MAP_SAFE || (typeof practiceOn === 'function' && practiceOn())) return;
  const base = ACTIVE_MONSTERS.find(m => m.id === 'milkfish_king');
  if (!base) return;
  let c = Number(cfg.c), r = Number(cfg.r);
  const near = Number.isFinite(c) && Number.isFinite(r) ? center(c, r) : null;
  const core = near ? G.cores.reduce((best, k) => !best || mkDist(k, { x: near[0], y: near[1] }) < mkDist(best, { x: near[0], y: near[1] }) ? k : best, null) : G.cores[0] || null;
  if (!near) {
    if (!core) return;
    const spot = mkFreeCellNear(core.x, core.y + 2 * CELL);
    if (!spot) return;
    [c, r] = spot;
  }
  if (!inGrid(c, r) || isWall(c, r)) return;
  const [x, y] = center(c, r), e = createMonster(base, x, y);
  mkInit(e, core);
  G.enemies.push(e);
}
// 離 (x, y) 最近、走得到的空格（一圈一圈往外找）
function mkFreeCellNear(x, y) {
  const [c0, r0] = cellAt(x, y);
  for (let rad = 0; rad <= 5; rad++) for (let dr = -rad; dr <= rad; dr++) for (let dc = -rad; dc <= rad; dc++) {
    if (Math.max(Math.abs(dc), Math.abs(dr)) !== rad) continue;
    const c = c0 + dc, r = r0 + dr;
    if (!inGrid(c, r) || isWall(c, r) || G.grid[c + ',' + r]) continue;
    const [cx, cy] = center(c, r);
    if (!enemyBlocked(cx, cy)) return [c, r];
  }
  return null;
}
// 第一次更新時補齊狀態（怪物編輯器的單隻測試場是照一般怪物生出來的，也要能動）
function mkInit(e, core) {
  const spec = ACTIVE_MONSTERS.find(m => m.id === e.type);
  e.mkCfg = typeof validMilkfishKingCfg === 'function' ? validMilkfishKingCfg(spec && spec.mfKing) : {};
  e.eliteName = MILKFISH_KING_FX.name;
  e.knockMul = 0; e.staggerTime = 0; e.unpushable = true; e.noHitSquash = true; e.wide = true; e.mineEater = true;
  e.walkStride = MILKFISH_KING_FX.stepEvery / 2;   // 走路圖兩張換一步，跟落腳（震動、腳步聲）同步（js/render.js 的 monsterWalkFrame）   // mineEater：踩到地雷不會引爆（會把地雷吃掉，js/landmine.js）
  if (core === undefined) core = G.cores.filter(k => !k.dead).reduce((best, k) => !best || mkDist(k, e) < mkDist(best, e) ? k : best, null);
  e.mk = { state: 'guard', t: 0, home: { x: e.x, y: e.y }, core: core || null, coreIn: false,
    belly: [], prey: [], spitCd: 2, biteCd: 0, wait: 1, spot: null, stepDist: 0, stunSeen: 0,
    nextCoreSpit: 1 - mkCfg(e).coreSpitHp, poolT: 0, lastPool: null,
    baseDmg: { p: e.playerDamage, s: e.sentryDamage, b: e.buildingDamage } };   // baseDmg：原本的攻擊力（核心在肚子裡時乘上倍數）
  (G.mkKings = G.mkKings || []).push(e);
  G.mkShots = G.mkShots || [];
}
function mkSet(e, state, t = 0) { e.mk.state = state; e.mk.t = t; }

// ---- 能吃的東西 ----
function mkEdibleItem(e, o) {
  if (!o || o.kind !== 'obstacle' || o.hp <= 0 || !o.type || o.isBase || o.ore || o.type === 'irongate' || o.mrtHidden) return false;
  if (!G.obstacles.includes(o) || !sameFloor(e, o)) return false;
  const cells = obstacleSolidCells(o).length;
  if (cells > MILKFISH_KING_FX.itemMaxCells || (o.w || 1) > 3 || (o.h || 1) > 3) return false;
  return true;
}
const mkItemCenter = o => ({ x: OX + (o.c + (o.w || 1) / 2) * CELL, y: OY + (o.r + (o.h || 1) - .5) * CELL });
function mkEdibleMate(e, t) {
  if (mkSkipped(e, t)) return false;   // 剛剛走不過去、先放棄的隊友
  return t.hp > 0 && !t.berserk && !t.eatenBy && !t.vineCap && !(t.vineDazeT > 0) && !t.grabbed && !t.mrtRide && enemyNoticesSentry(e, t);
}
// 可以瞄準吐東西的人：溫特、看得到的隊友（不包括嘴裡的、被丟在空中的）
function mkSpitTargets(e, except) {
  const C = mkCfg(e), out = [], p = G.player, R = C.spitRange * CELL;
  if (p && p.hp > 0 && sameFloor(e, p) && mkDist(p, e) <= R && hasLineOfSight(e.x, e.y, p.x, p.y)) out.push(p);
  for (const t of G.towers) {
    if (t === except || t.hp <= 0 || t.eatenBy || t.vineCap || t.berserk || !sameFloor(e, t) || mkDist(t, e) > R) continue;
    if (hasLineOfSight(e.x, e.y, t.x, t.y)) out.push(t);
  }
  return out;
}
const mkPick = list => list.length ? list[Math.floor(Math.random() * list.length)] : null;

// ---- 每幀（enemy-ai.js 的 stepEnemy 呼叫）----
function stepMilkfishKing(e, dt) {
  if (!e.mk) mkInit(e);
  const C = mkCfg(e), F = MILKFISH_KING_FX, mk = e.mk;
  const x0 = e.x, y0 = e.y;
  mk.t -= dt; mk.spitCd -= dt; mk.biteCd -= dt;
  for (const pr of mk.prey) pr.left -= dt;
  // 吼叫、吐東西、吞核心中：打不斷（霸體）；其他時候暈眩只算一半時間
  const armored = ['roar', 'spitWind', 'coreWind', 'coreGulp'].includes(mk.state);
  e.superArmor = armored;
  if (armored) { e.stunT = 0; e.confuseT = 0; }
  else if ((e.stunT || 0) > mk.stunSeen) e.stunT = mk.stunSeen + (e.stunT - mk.stunSeen) * .5;
  mk.stunSeen = e.stunT || 0;
  e.tremble = mk.state === 'spitWind' || mk.state === 'coreWind';
  mkApplyAtk(e);
  if (mk.coreIn) mkPoolUnderFeet(e, dt);
  if (!armored && (e.stunT > 0 || e.confuseT > 0)) { mfPose(e, null); mkBob(e, 0, dt); return; }
  // 一頓一頓的步伐：這一幀的速度照「走到這一步的哪裡」變快變慢（跨出去快、落腳慢）
  const sp = e.speed;
  e.speed = sp * mkGait(e);
  try { mkStep(e, dt); } finally { e.speed = sp; }
  const moved = Math.hypot(e.x - x0, e.y - y0);
  mkFootsteps(e, moved);
  mkBob(e, moved, dt);
}
// 走到這一步的哪裡（0＝剛落腳 → 1＝下一步落腳）→ 速度倍數
function mkGait(e) {
  const F = MILKFISH_KING_FX, k = Math.min(1, (e.mk.stepDist || 0) / F.stepEvery);
  return (F.gaitMin + (1 - F.gaitMin) * Math.sin(Math.PI * k)) * MK_GAIT_NORM;
}
// 身體上下起伏：跨步時抬高、落腳時落到地上；停下來慢慢放回地面（slimeLift：render.js 畫怪物時往上抬幾像素）
function mkBob(e, moved, dt) {
  const F = MILKFISH_KING_FX;
  if (moved > .05) e.slimeLift = Math.sin(Math.PI * Math.min(1, (e.mk.stepDist || 0) / F.stepEvery)) * F.bobHeight;
  else e.slimeLift = Math.max(0, (e.slimeLift || 0) - dt * 30);
}
// 攻擊力：核心在肚子裡就乘上倍數（咬人、打建築、碰到隊友），吐出來就恢復
function mkApplyAtk(e) {
  const b = e.mk.baseDmg, k = mkAtk(e);
  if (!b) return;
  e.playerDamage = Math.round(b.p * k); e.sentryDamage = Math.round(b.s * k); e.buildingDamage = Math.round(b.b * k);
}
// ---- 核心在肚子裡：腳下的腐蝕池 ----
// 落腳時（mkFootsteps）、站著不動時（每隔一陣子）在腳下鋪一攤；附近已經有一攤還很新，就只把它的時間補滿
function mkDropPool(e) {
  const C = mkCfg(e), mk = e.mk, R = C.acidPoolR * CELL, x = e.x, y = e.y + 14;
  mk.poolT = C.acidPoolLife * .5;
  const last = mk.lastPool;
  if (last && (G.acidPools || []).includes(last) && last.t > 0 && Math.hypot(last.x - x, last.y - y) < R * .6) { last.t = last.t0; return; }
  const blobs = [];
  for (let i = 0; i < 4; i++) blobs.push({ dx: (Math.random() * 2 - 1) * R * .5, dy: (Math.random() * 2 - 1) * R * .35, rr: R * (.55 + Math.random() * .5) });
  const floor = typeof actorFloor === 'function' ? actorFloor(e) : 0;
  const pool = { x, y, floor, r: R, t: C.acidPoolLife, t0: C.acidPoolLife, dps: C.acidPoolDps, blobs, fizz: 0, noEnemy: true, mkKing: true };   // noEnemy：怪物踩到不扣血（跟異質核心腳下的一樣，js/game.js）
  (G.acidPools = G.acidPools || []).push(pool);
  mk.lastPool = pool;
  if (typeof addScorchMark === 'function') addScorchMark(x, y, R, pool, 'corrosion');   // 地上焦痕（腐蝕池還在時透紫光，js/attack-fx.js）
  if (typeof pushCorrosionMist === 'function') for (let i = 0; i < 3; i++) { const a = -Math.PI / 2 + (Math.random() * 2 - 1) * 1.4, sp = 6 + Math.random() * 12; pushCorrosionMist(x + (Math.random() * 2 - 1) * R * .4, y + (Math.random() * 2 - 1) * R * .2, Math.cos(a) * sp, Math.sin(a) * sp); }
}
function mkPoolUnderFeet(e, dt) {
  e.mk.poolT -= dt;
  if (e.mk.poolT <= 0) mkDropPool(e);
}
function mkStep(e, dt) {
  const C = mkCfg(e), F = MILKFISH_KING_FX, mk = e.mk, p = G.player;
  switch (mk.state) {
    case 'guard': {   // 還沒醒：站著不動
      mfPose(e, null);
      const core = mk.core, see = p && p.hp > 0 && sameFloor(e, p) && mkDist(p, e) <= C.noticeRange * CELL && hasLineOfSight(e.x, e.y, p.x, p.y);
      if (see || e.hp < e.maxhp || (core && core.awake)) mkRoar(e);
      return;
    }
    case 'roar': mfPose(e, 'attack', p ? p.x : null); if (mk.t <= 0) mkSet(e, mk.core && !mk.core.dead && !mk.coreIn ? 'toCore' : 'hunt'); return;
    case 'toCore': case 'rushCore': {   // 走過去（吐出來後：急著衝過去）把核心吞進肚子
      const core = mk.core;
      if (!core || core.dead || core.carried) { mkSet(e, 'hunt'); return; }
      mfPose(e, null);
      if (mkDist(core, e) <= CELL * 1.4) { mkSet(e, 'coreGulp', F.coreGulpTime); e.faceRight = core.x > e.x; return; }
      const [gc, gr] = cellAt(core.x, core.y);
      const nav = enemyNavigate(e, gc, gr, dt * (mk.state === 'rushCore' ? C.rushSpeedMul : 1), 'mk-core:' + gc + ',' + gr, true);
      if (nav.blocker) mkBlocked(e, nav.blocker, dt);
      else if (nav.reached) moveEnemyToward(e, core, dt);
      return;
    }
    case 'coreGulp': {   // 嚼一嚼把核心吞下去
      const core = mk.core;
      const bitten = MILKFISH_KING_FX.coreGulpTime - mk.t;
      mfPose(e, bitten < .3 ? 'attack' : Math.floor(mk.t * 7) % 2 ? 'smile-01' : 'smile-02', core ? core.x : null);
      if (mk.t <= 0) { if (core && !core.dead && mkDist(core, e) <= CELL * 2) mkSwallowCore(e); mkSet(e, 'hunt'); }
      return;
    }
    case 'coreWind': {   // 鼓起來要吐核心
      mfPose(e, Math.floor(mk.t * 10) % 2 ? 'smile-01' : 'smile-02');
      if (mk.t <= 0) { mkSpitCore(e); mkSet(e, 'coreOut', C.coreOutTime); }
      return;
    }
    case 'coreOut': {   // 吐完核心喘氣，喘完急著衝回去吞
      mfPose(e, null);
      if (mk.t <= 0) mkSet(e, mk.core && !mk.core.dead && !mk.core.carried && !mkCoreFlying() ? 'rushCore' : 'hunt');
      return;
    }
    case 'spitWind': {   // 鼓起來要吐東西（隊友或建築）
      const tg = mk.spit && mk.spit.target;
      if (tg && !mk.spit.locked) { mk.spit.x = tg.x; mk.spit.y = tg.y; e.faceRight = tg.x > e.x; }   // 前段跟著目標轉，最後 0.25 秒鎖定
      if (mk.t <= .25) mk.spit.locked = true;
      mfPose(e, mk.t > .25 ? (Math.floor(mk.t * 10) % 2 ? 'smile-01' : 'smile-02') : 'attack', mk.spit.x);
      if (mk.t <= 0) { mkLaunch(e); mkSet(e, 'recover', .5); }
      return;
    }
    case 'gulp': {   // 張嘴吞隊友
      mfPose(e, 'attack', mk.aim ? mk.aim.x : null);
      if (mk.t <= 0) { mkGulpMate(e); mkSet(e, 'recover', .35); }
      return;
    }
    case 'chew': {   // 嚼建築
      const o = mk.chewing, bitten = C.chewTime - mk.t;
      mfPose(e, bitten < .3 ? 'attack' : Math.floor(mk.t * 7) % 2 ? 'smile-01' : 'smile-02', o ? mkItemCenter(o).x : null);
      if (mk.t <= 0) { mkSwallowItem(e, o); mkSet(e, 'recover', .25); }
      return;
    }
    case 'bite': {
      mfPose(e, 'attack', p ? p.x : null);
      if (mk.t <= 0) {
        mk.biteCd = F.biteCooldown;
        if (p && p.hp > 0 && mkDist(p, e) <= F.biteHit) { e.playerTouchCd = 0; enemyAttackPlayer(e, 0); }
        mkSet(e, 'recover', .4);
      }
      return;
    }
    case 'recover': mfPose(e, null); if (mk.t <= 0) mkSet(e, 'hunt'); return;
    case 'return': {   // 被引開太遠：走回原位
      mfPose(e, null);
      if (mkDist(e, mk.home) <= C.leash * CELL * .5) { mkSet(e, 'hunt'); return; }
      const [hc, hr] = cellAt(mk.home.x, mk.home.y);
      const nav = enemyNavigate(e, hc, hr, dt * 1.2, 'mk-home', true);
      if (nav.blocker) mkBlocked(e, nav.blocker, dt);
      return;
    }
    default: mkHunt(e, dt);
  }
}

// ---- 醒著的時候：決定下一個動作 ----
function mkHunt(e, dt) {
  const C = mkCfg(e), F = MILKFISH_KING_FX, mk = e.mk, p = G.player;
  mfPose(e, null);
  // 1. 血量掉到一段：把核心吐出來（表演）
  if (mk.coreIn && e.hp / e.maxhp <= mk.nextCoreSpit) { mk.nextCoreSpit -= C.coreSpitHp; mkSet(e, 'coreWind', F.coreSpitWindup); return; }
  // 核心還在地上（例如吞的時候被打斷）：先去吞回來
  if (mk.core && !mk.core.dead && !mk.coreIn && !mk.core.carried && !mkCoreFlying() && mk.core.awake) { mkSet(e, 'rushCore'); return; }
  // 2. 含太久的隊友：吐出來
  const done = mk.prey.find(pr => pr.left <= 0);
  if (done) { mkStartSpit(e, { mate: done.t }, mkPick(mkSpitTargets(e, done.t))); return; }
  // 3. 肚子裡有東西、有人在射程內：吐出去砸人
  if (mk.spitCd <= 0 && mk.belly.length) {
    const tg = mkPick(mkSpitTargets(e));
    if (tg) { mkStartSpit(e, { item: mk.belly.shift() }, tg); return; }
  }
  // 太遠就回去
  if (mkDist(e, mk.home) > C.leash * CELL) { mkSet(e, 'return'); return; }
  // 溫特貼太近：咬一口
  if (p && p.hp > 0 && sameFloor(e, p) && mkDist(p, e) <= F.biteReach && mk.biteCd <= 0) { e.faceRight = p.x > e.x; mkSet(e, 'bite', F.biteWindup); return; }
  // 4. 嘴巴還有空位：去吞隊友
  if (mk.prey.length < C.maxPrey) {
    let mate = mk.mate && mkEdibleMate(e, mk.mate) && mkDist(mk.mate, e) <= C.noticeRange * 1.5 * CELL ? mk.mate : null;
    if (!mate) {
      let bestD = C.noticeRange * CELL;
      for (const t of G.towers) {
        if (!mkEdibleMate(e, t) || mkDist(t, mk.home) > C.leash * CELL) continue;
        const d = mkDist(t, e);
        if (d <= bestD && hasLineOfSight(e.x, e.y, t.x, t.y)) { mate = t; bestD = d; }
      }
    }
    mk.mate = mate;
    if (mate) {
      if (mkDist(mate, e) <= F.eatReach) { mk.aim = mate; e.faceRight = mate.x > e.x; mkSet(e, 'gulp', F.gulpWindup); return; }
      if (mkStuck(e, mate, dt)) mk.mate = null;   // 走不過去：先放棄這個隊友，下一幀找別的事做
      else mkGo(e, mate, dt, 'mk-mate');
      return;
    }
  }
  // 5. 附近有建築：去吃
  const item = mk.item && mkEdibleItem(e, mk.item) && !mkSkipped(e, mk.item) ? mk.item : mkPickItem(e);
  mk.item = item;
  if (item) {
    const ic = mkItemCenter(item);
    if (mkDist(ic, e) <= F.itemReach * CELL + ((item.w || 1) - 1) * CELL * .5) { mkStartChew(e, item); return; }
    if (mkStuck(e, item, dt)) { mk.item = null; return; }   // 走不過去：先放棄這個建築
    const nav = enemyNavigate(e, item.c, item.r + (item.h || 1) - 1, dt, 'mk-item:' + item.c + ',' + item.r, true);
    if (nav.blocker) mkBlocked(e, nav.blocker, dt);
    else if (nav.reached) moveEnemyToward(e, ic, dt);
    return;
  }
  // 6. 溫特看得到：走過去
  if (p && p.hp > 0 && sameFloor(e, p) && mkDist(p, e) <= C.noticeRange * 1.5 * CELL && hasLineOfSight(e.x, e.y, p.x, p.y)) { mkGo(e, p, dt, 'mk-player'); return; }
  // 6b. 嘴裡含著隊友、附近又沒人：主動去找人準備吐（以前會在原位慢慢晃、停很久，看起來像卡住）
  if (mk.prey.length && mkSeekSpitTarget(e, dt)) return;
  // 7. 沒事做：在原位附近晃
  mkWander(e, dt);
}
// ---- 走不過去就放棄：一直沒有更靠近目標（例如身體太寬擠不進窄道）超過 stuckGive 秒，就先不理牠 stuckSkip 秒，去做別的事 ----
const mkClock = () => (G && G.battleTime) || 0;
function mkSkipped(e, t) { const sk = e.mk && e.mk.skip; return !!(sk && sk.has(t) && sk.get(t) > mkClock()); }
function mkStuck(e, t, dt) {
  const mk = e.mk, F = MILKFISH_KING_FX, d = mkDist(t.x != null ? t : mkItemCenter(t), e);
  if (!mk.stuck || mk.stuck.t !== t) mk.stuck = { t, best: d, time: 0 };
  if (d < mk.stuck.best - 6) { mk.stuck.best = d; mk.stuck.time = 0; return false; }
  mk.stuck.time += dt;
  if (mk.stuck.time < F.stuckGive) return false;
  (mk.skip = mk.skip || new Map()).set(t, mkClock() + F.stuckSkip);
  mk.stuck = null;
  return true;
}
// 嘴裡含著隊友時要找人吐：離原位守備範圍內最近的溫特或隊友（看不到也走過去，找到看得到、在射程內的位置就停下來）
function mkSeekSpitTarget(e, dt) {
  const C = mkCfg(e), mk = e.mk, p = G.player, cands = [];
  if (p && p.hp > 0 && sameFloor(e, p)) cands.push(p);
  for (const t of G.towers) if (t.hp > 0 && !t.eatenBy && !t.vineCap && sameFloor(e, t)) cands.push(t);
  let best = null, bestD = Infinity;
  for (const t of cands) {
    if (mkSkipped(e, t) || mkDist(t, mk.home) > C.leash * CELL) continue;
    const d = mkDist(t, e);
    if (d < bestD) { best = t; bestD = d; }
  }
  if (!best) return false;
  if (bestD <= C.spitRange * CELL * .6 && hasLineOfSight(e.x, e.y, best.x, best.y)) { e.faceRight = best.x > e.x; return true; }   // 夠近了：站著等吐
  if (mkStuck(e, best, dt)) return false;
  mkGo(e, best, dt, 'mk-seek');
  return true;
}
function mkGo(e, t, dt, key) {
  const [gc, gr] = cellAt(t.x, t.y);
  const nav = enemyNavigate(e, gc, gr, dt, key + ':' + gc + ',' + gr, true);
  if (nav.blocker) mkBlocked(e, nav.blocker, dt);
  else if (nav.reached) moveEnemyToward(e, t, dt);
}
// 路被擋住：擋路的建築吃得下就吃掉，不然照一般怪物打
function mkBlocked(e, o, dt) {
  if (mkEdibleItem(e, o)) mkStartChew(e, o);
  else enemyAttackObstacle(e, o, dt);
}
function mkPickItem(e) {
  const C = mkCfg(e), mk = e.mk;
  let best = null, bestD = C.eatSense * CELL;
  for (const o of G.obstacles) {
    if (!mkEdibleItem(e, o) || mkSkipped(e, o)) continue;
    const c = mkItemCenter(o), d = mkDist(c, e);
    if (d < bestD && mkDist(c, mk.home) <= C.leash * CELL) { best = o; bestD = d; }
  }
  return best;
}
function mkWander(e, dt) {
  const mk = e.mk, F = MILKFISH_KING_FX;
  if (mk.spot) {
    const moved = moveEnemyToward(e, mk.spot, dt * .5);
    if (!moved || mkDist(mk.spot, e) <= 3) { mk.spot = null; mk.wait = 1.5 + Math.random() * 2; }
    return;
  }
  mk.wait -= dt;
  if (mk.wait > 0) return;
  for (let i = 0; i < 8; i++) {
    const a = Math.random() * Math.PI * 2, r = Math.random() * F.wanderRadius * CELL, x = mk.home.x + Math.cos(a) * r, y = mk.home.y + Math.sin(a) * r;
    if (!enemyBlocked(x, y) && hasLineOfSight(e.x, e.y, x, y)) { mk.spot = { x, y }; break; }
  }
  mk.wait = 1.5 + Math.random() * 2;
}

// ---- 吼叫：核心跟著醒來 ----
function mkRoar(e) {
  const mk = e.mk;
  e.eliteAwake = true;
  mkSet(e, 'roar', MILKFISH_KING_FX.roarTime);
  e.alertT = typeof ENEMY_ALERT_TIME !== 'undefined' ? ENEMY_ALERT_TIME : 1;
  const core = mk.core;
  if (core && !core.awake && !core.dead) { wakeCore(core); core.lastHp = core.hp; }
  if (typeof coreBanner === 'function') coreBanner(e.eliteName + '甦醒了', '牠要把核心吞進肚子裡！', '#8fd3ff');
  systemNotice(e.eliteName + '甦醒了！', true);
  flash('咕嚕嚕——！！', e.x, e.y - e.drawHeight - 10, '#8fd3ff');
  for (let i = 0; i < 3; i++) G.effects.push({ ring: true, x: e.x, y: e.y - e.drawHeight * .55, r: 8 + i * 6, r2: 110 + i * 40, life: .45 + i * .15, life0: .45 + i * .15, color: i ? '#8fd3ff' : '#ffffff' });
  if (typeof nearbyImpact === 'function') nearbyImpact(e.x, e.y, 9, .06); else addShake(6);
  if (typeof sfxAt === 'function') sfxAt('milkfishKingRoar', e.x, e.y, 2, 'milkfish-king-roar');
}

// ---- 核心：吞進肚子、吐出來 ----
function mkSwallowCore(e) {
  const mk = e.mk, core = mk.core;
  if (!core || core.dead) return;
  mk.coreIn = true;
  core.carried = true; core.hidden = true; core.x = e.x; core.y = e.y; core.lastHp = core.hp;   // carried＋hidden：打不到、炸不到、不畫（js/game.js、js/render.js）
  if (!core.awake) { wakeCore(core); core.lastHp = core.hp; }
  G.effects.push({ ring: true, x: e.x, y: e.y - e.drawHeight * .45, r: 8, r2: 60, life: .4, life0: .4, color: '#c78bff' });
  if (typeof coreBanner === 'function') coreBanner('核心被吞進肚子裡了', e.eliteName + '攻擊力變高了！趁牠把核心吐出來的時候打！', '#c78bff');
  mkApplyAtk(e); mkDropPool(e);
  flash('咕嚕！', e.x, e.y - e.drawHeight - 8, '#c78bff');
  if (typeof sfxAt === 'function') sfxAt('milkfishGulp', e.x, e.y, 1.3, 'milkfish-king-core');
  addShake(3);
}
const mkCoreFlying = () => (G.mkShots || []).some(s => s.kind === 'core');
function mkSpitCore(e) {
  const mk = e.mk, core = mk.core, F = MILKFISH_KING_FX;
  if (!core || core.dead || !mk.coreIn) return;
  mk.coreIn = false;
  mkApplyAtk(e);   // 攻擊力恢復、不再鋪腐蝕池
  // 找一個走得到的落點：離牠 coreSpitDist 格，盡量在牠前面（離溫特近的那邊）
  const p = G.player;
  let to = null;
  for (let i = 0; i < 40 && !to; i++) {
    const base = p ? Math.atan2(p.y - e.y, p.x - e.x) : 0, a = base + (Math.random() * 2 - 1) * (i < 20 ? 1 : Math.PI);
    const d = (F.coreSpitDist[0] + Math.random() * (F.coreSpitDist[1] - F.coreSpitDist[0])) * CELL;
    const x = e.x + Math.cos(a) * d, y = e.y + Math.sin(a) * d, [c, r] = cellAt(x, y);
    if (inGrid(c, r) && !isWall(c, r) && !G.grid[c + ',' + r] && !enemyBlocked(x, y) && hasLineOfSight(e.x, e.y, x, y)) to = { x, y };
  }
  if (!to) to = { x: e.x, y: e.y + CELL };
  core.carried = true; core.hidden = true;   // 飛在空中：還打不到（落地才打得到）
  G.mkShots.push({ kind: 'core', king: e, core, x0: e.x, y0: e.y - e.drawHeight * .35, x1: to.x, y1: to.y, t: 0, T: F.coreFlight, peak: 90, spin: 0 });
  flash('噗！核心被吐出來了！', e.x, e.y - e.drawHeight - 8, '#ffd27a');
  if (typeof sfxAt === 'function') sfxAt('milkfishKingSpit', e.x, e.y, 1.4, 'milkfish-king-spit');
  addShake(4);
}
function mkCoreLand(s) {
  const core = s.core;
  core.x = s.x1; core.y = s.y1; core.carried = false; core.hidden = false; core.lastHp = core.hp; core.hitT = .2;
  G.effects.push({ ring: true, x: core.x, y: core.y + 10, r: 6, r2: 50, life: .4, life0: .4, color: '#c78bff' });
  if (typeof nearbyImpact === 'function') nearbyImpact(core.x, core.y, 6, .05);
  if (typeof coreBanner === 'function') coreBanner('核心掉出來了', '趁牠還沒吞回去，快打核心！', '#ffd27a');
  if (typeof sfxAt === 'function') sfxAt('knock2', core.x, core.y, 1, 'milkfish-king-core-land');
}

// ---- 吃隊友 ----
function mkGulpMate(e) {
  const mk = e.mk, t = mk.aim, C = mkCfg(e);
  mk.aim = null;
  if (!t || !mkEdibleMate(e, t) || mkDist(t, e) > MILKFISH_KING_FX.eatReach + 30 || mk.prey.length >= C.maxPrey) return;
  mk.prey.push({ t, left: C.holdTime });
  mk.mate = null;
  t.eatenBy = e; t.moving = false; t.target = null; t.navPath = null; t.navGoal = null; t.knockT = 0;
  t.meleeSwing = null; t.gunSwing = null; t.rootT = 0;
  t.x = e.x; t.y = e.y;
  G.effects.push({ ring: true, x: e.x, y: e.y - 60, r: 6, r2: 44, life: .3, life0: .3, color: '#f3e7c9' });
  if (typeof sfxAt === 'function') sfxAt('milkfishGulp', e.x, e.y, 1.1, 'milkfish-king-gulp');
  if (typeof sentryStatus === 'function') sentryStatus(t, '被吞掉了！', '#ffb36b', true);
  if (typeof mateHurtSay === 'function') mateHurtSay(t, 'swallowed');
  addShake(3);
}
// ---- 吃建築 ----
function mkStartChew(e, o) {
  e.mk.chewing = o; e.mk.item = null;
  e.faceRight = mkItemCenter(o).x > e.x;
  mkSet(e, 'chew', mkCfg(e).chewTime);
}
function mkSwallowItem(e, o) {
  const mk = e.mk, C = mkCfg(e);
  mk.chewing = null;
  if (!mkEdibleItem(e, o)) return;   // 嚼到一半被拆掉了
  const c = mkItemCenter(o);
  o.lastHitBy = 'eaten';   // 被吃掉：不漏油、不爆炸（js/oil-barrels.js）
  if (o.fuseT > 0) o.fuseT = 0;   // 已經在倒數的地雷：吞下去就不爆了
  removeBarrier(o);
  if (typeof destroyObstacleNow === 'function') { for (const t of G.towers) { t.navPath = null; t.navGoal = null; } if (typeof computeFlow === 'function') computeFlow(); }
  mk.belly.push(o);
  while (mk.belly.length > C.bellyMax) mk.belly.shift();   // 肚子滿了：最早吃的那個消化掉
  e.hasTarget = false; e.attackingObstacle = null;
  for (let i = 0; i < 8; i++) G.effects.push({ particle: true, kind: 'spark', x: c.x + (Math.random() - .5) * 22, y: c.y - 6, vx: (Math.random() - .5) * 80, vy: -(20 + Math.random() * 60), r: 1.8 + Math.random() * 1.8, life: .4, life0: .4, color: i % 2 ? '#8a7a66' : '#cbbca4' });
  flash('吃掉了！', c.x, c.y - 26, '#8fd3ff', .8);
  if (typeof sfxAt === 'function') sfxAt('milkfishChew', e.x, e.y, 1.1, 'milkfish-king-chew');
}

// ---- 吐東西（隊友或建築）----
// what＝{ mate } 或 { item }；target＝要砸的人（沒有就往前面隨便吐）
function mkStartSpit(e, what, target) {
  const mk = e.mk, C = mkCfg(e);
  const tx = target ? target.x : e.x + (e.faceRight ? 1 : -1) * 3 * CELL, ty = target ? target.y : e.y + CELL;
  mk.spit = { ...what, target, x: tx, y: ty, locked: !target };
  mkSet(e, 'spitWind', C.spitWindup);
}
function mkLaunch(e) {
  const mk = e.mk, C = mkCfg(e), s = mk.spit; mk.spit = null;
  if (!s) return;
  mk.spitCd = C.spitCooldown;
  // 落點：鎖定的位置附近，要是落在牆裡就往牠這邊拉回來
  let x1 = s.x + (Math.random() - .5) * CELL * .6, y1 = s.y + (Math.random() - .5) * CELL * .6;
  const ok = (x, y) => { const [c, r] = cellAt(x, y); return inGrid(c, r) && !isWall(c, r) && !(s.mate && typeof sentryBlocked === 'function' && sentryBlocked(x, y)); };
  for (let k = 0; k < 12 && !ok(x1, y1); k++) { x1 += (e.x - x1) * .2; y1 += (e.y - y1) * .2; }
  if (!ok(x1, y1)) { x1 = s.x; y1 = s.y; }
  const mouth = { x: e.x + (e.faceRight ? 1 : -1) * e.drawWidth * .12, y: e.y - e.drawHeight * .3 };
  if (s.mate) mkLaunchMate(e, s.mate, x1, y1);
  else G.mkShots.push({ kind: 'item', king: e, atk: mkAtk(e), o: s.item, x0: mouth.x, y0: mouth.y, x1, y1, t: 0, T: C.spitFlight, peak: 80 + mkDist({ x: x1, y: y1 }, e) * .15, spin: 0, spinV: (Math.random() < .5 ? -1 : 1) * (6 + Math.random() * 4) });
  G.effects.push({ ring: true, x: mouth.x, y: mouth.y, r: 6, r2: 36, life: .25, life0: .25, color: '#cfe9ff' });
  for (let i = 0; i < 6; i++) G.effects.push({ particle: true, kind: 'spark', x: mouth.x, y: mouth.y, vx: (x1 - e.x) * .3 + (Math.random() - .5) * 80, vy: (y1 - e.y) * .3 - 30 - Math.random() * 40, r: 1.5 + Math.random() * 1.5, life: .35, life0: .35, color: '#9fd6ff' });   // 口水
  if (typeof sfxAt === 'function') sfxAt('milkfishKingSpit', e.x, e.y, 1.1, 'milkfish-king-spit');
  addShake(2);
}
// 隊友：交給 js/vines.js 的「掉下來」那一段（往上拋、翻滾、落地彈兩下、躺著暈），水平移動由這裡管
function mkLaunchMate(e, t, x1, y1) {
  const mk = e.mk, F = MILKFISH_KING_FX;
  mk.prey = mk.prey.filter(pr => pr.t !== t);
  t.eatenBy = null;
  if (!G.vineCaps) G.vineCaps = [];
  const T = F.mateArcTime, g = typeof VINES !== 'undefined' ? VINES.gravity : 1700, h0 = 70;
  const v0 = (g * T * T / 2 - h0) / T, peak = h0 + v0 * v0 / (2 * g);   // 往上拋的速度：剛好 T 秒落地
  const sx = e.x, sy = e.y;
  t.x = sx; t.y = sy;
  const cap = { v: { x: sx, y: sy, kind: 'hang', state: 'grab', t: 0, len: 1, seed: Math.random() * 10, twitch: 0, temp: true },
    actor: t, isPlayer: false, mode: 'hang', phase: 'fall', cut: true, t: 0, h: h0, fallV: -v0, fallH0: peak,
    x0: sx, y0: sy, hp: t.hp, camX: cam.x, camY: cam.y, topH: 0, lieSide: x1 >= sx ? 1 : -1, mkSpit: true };
  G.vineCaps.push(cap);
  t.vineCap = true; t.navPath = null; t.navGoal = null; t.target = null;
  G.mkShots.push({ kind: 'mate', king: e, atk: mkAtk(e), t, cap, x0: sx, y0: sy, x1, y1, t0: 0, tt: 0, T });
  if (typeof sentryStatus === 'function') sentryStatus(t, '被吐出來了！', '#ffd27a', true);
}

// ---- 每幀（milkfish-kid.js 的 updateMilkfish 呼叫）：嘴裡的人跟著走、飛行中的東西、BOSS 倒下 ----
function updateMilkfishKing(dt) {
  if (!G) return;
  for (const e of [...mkKings()]) {
    const mk = e.mk;
    if (!mkAlive(e)) { mkDown(e); continue; }
    for (const pr of mk.prey) {
      pr.t.x = e.x; pr.t.y = e.y; pr.t.moving = false;
      pr.talkT = (pr.talkT ?? MILKFISH_KING_FX.preyTalkEvery) - dt;   // 隔一陣子在肚子裡再冒一句（剛吞下去那句由 mkGulpMate 說）
      if (pr.talkT <= 0) { pr.talkT = MILKFISH_KING_FX.preyTalkEvery; if (!(pr.t.say && pr.t.say.text) && typeof mateHurtSay === 'function') mateHurtSay(pr.t, 'swallowed'); }
    }
    mk.prey = mk.prey.filter(pr => pr.t.eatenBy === e && G.towers.includes(pr.t));
    for (const t of G.towers) if (t.eatenBy === e && !mk.prey.some(pr => pr.t === t)) mfRelease(t, true);   // 保險：標記被吞、卻不在嘴裡名單上的人，直接放出來（不會永遠卡住）
    if (mk.coreIn && mk.core) {
      if (mk.core.dead) mk.coreIn = false;
      else { mk.core.x = e.x; mk.core.y = e.y; mk.core.carried = true; mk.core.hidden = true; mk.core.lastHp = mk.core.hp; }
    }
  }
  mkUpdateShots(dt);
}
function mkUpdateShots(dt) {
  const list = G.mkShots || [];
  for (const s of list) {
    if (s.kind === 'mate') {   // 隊友：水平移動到落點，上下由 vines.js 管；第一次碰地時算傷害
      s.tt += dt;
      const k = Math.min(1, s.tt / s.T), a = s.t;
      if (G.vineCaps.includes(s.cap) && s.cap.phase === 'fall') { a.x = s.x0 + (s.x1 - s.x0) * k; a.y = s.y0 + (s.y1 - s.y0) * k; }
      if (!s.hit && (k >= 1 || (s.cap.bounces || 0) > 0 || !G.vineCaps.includes(s.cap))) { s.hit = true; mkMateLand(s); }
      if (s.hit && !G.vineCaps.includes(s.cap)) {   // vines.js 已經讓他躺下了：暈久一點
        a.vineDazeT = Math.max(a.vineDazeT || 0, mkCfg(s.king).mateStun); s.done = true;
      }
      if (a.hp <= 0 || !G.towers.includes(a)) s.done = true;
      continue;
    }
    s.t += dt;
    s.spin += (s.spinV || 4) * dt;
    if (s.t >= s.T) { s.done = true; if (s.kind === 'core') mkCoreLand(s); else mkItemLand(s); }
  }
  G.mkShots = list.filter(s => !s.done);
  mkUpdateShards(dt);
}
// ---- 吐出來的建築碎掉：把建築的圖切成幾塊，往外噴、翻滾、落地彈兩下、慢慢淡掉 ----
function mkShatter(o, x, y) {
  const S = MILKFISH_KING_FX.shards, img = mkItemImage(o);
  const w = (o.w || 1) * CELL * .9, h = (o.h || 1) * CELL * .9, pw = w / S.cols, ph = h / S.rows;
  const list = G.mkShards = G.mkShards || [];
  for (let r = 0; r < S.rows; r++) for (let c = 0; c < S.cols; c++) {
    const ox = (c + .5) * pw - w / 2, z = h - (r + .5) * ph;   // 這一塊原本在建築的哪裡（左右位置、離地多高）
    const a = Math.atan2(-z * .3, ox || (Math.random() - .5)) + (Math.random() * 2 - 1) * .5, sp = 70 + Math.random() * 110;
    list.push({ img, sx: c / S.cols, sy: r / S.rows, sw: 1 / S.cols, sh: 1 / S.rows, pw, ph, x: x + ox, y: y + (Math.random() * 2 - 1) * 4, z,
      vx: Math.cos(a) * sp, vy: (Math.random() * 2 - 1) * 40, vz: 140 + Math.random() * 180 - r * 30,
      rot: 0, vr: (Math.random() * 2 - 1) * 9, t: 0, T: S.life + Math.random() * .4, bounce: 0 });
  }
  while (list.length > 120) list.shift();
  for (let i = 0; i < 6; i++) G.effects.push({ particle: true, kind: 'spark', x: x + (Math.random() * 2 - 1) * w * .4, y: y - Math.random() * h * .6, vx: (Math.random() * 2 - 1) * 90, vy: -30 - Math.random() * 60, r: 2.5 + Math.random() * 2.5, life: .5, life0: .5, color: '#bdb5a3' });   // 碎掉時的灰塵
}
function mkUpdateShards(dt) {
  const S = MILKFISH_KING_FX.shards, list = G.mkShards || [];
  for (const p of list) {
    p.t += dt;
    p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
    p.vz -= S.gravity * dt; p.z += p.vz * dt;
    if (p.z <= 0) {   // 碰到地面：彈兩下，之後躺在地上滑一下停住
      p.z = 0;
      if (p.bounce < 2 && p.vz < -60) { p.vz = -p.vz * .35; p.vx *= .5; p.vy *= .5; p.vr *= .5; p.bounce++; }
      else { p.vz = 0; p.vx *= Math.max(0, 1 - dt * 8); p.vy *= Math.max(0, 1 - dt * 8); p.vr = 0; }
    }
  }
  G.mkShards = list.filter(p => p.t < p.T);
}
function mkDrawShards(ctx) {
  for (const p of G.mkShards || []) {
    const a = p.t > p.T - .4 ? Math.max(0, (p.T - p.t) / .4) : 1;
    ctx.save();
    ctx.globalAlpha = .22 * a; ctx.fillStyle = '#000';   // 地上的小影子
    ctx.beginPath(); ctx.ellipse(p.x, p.y + 4, p.pw * .4, p.pw * .15, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = a;
    ctx.translate(p.x, p.y - p.z - p.ph / 2); ctx.rotate(p.rot);
    const img = p.img;
    if (img && img.naturalWidth) {
      ctx.imageSmoothingEnabled = false;
      const iw = img.naturalWidth, ih = img.naturalHeight;
      ctx.drawImage(img, p.sx * iw, p.sy * ih, p.sw * iw, p.sh * ih, -p.pw / 2, -p.ph / 2, p.pw, p.ph);
    } else { ctx.fillStyle = '#7a5a3a'; ctx.fillRect(-p.pw / 2, -p.ph / 2, p.pw, p.ph); }
    ctx.restore();
  }
}
// 隊友落地：自己摔傷（不會摔死），旁邊的人被砸到
function mkMateLand(s) {
  const C = mkCfg(s.king), a = s.t, x = a.x, y = a.y;
  const atk = s.atk || 1, dmg = Math.min(C.mateLandDamage * atk, Math.max(0, a.hp - 1));
  if (dmg > 0) { a.hp -= dmg; if (s.cap) s.cap.hp = a.hp; flashDmg('-' + Math.round(dmg), a.x, a.y - 50, '#ff6b6b'); }
  mkSplash(s.king, x, y, C.spitDamage * .6 * atk, a);
  G.effects.push({ ring: true, x, y: y + 12, r: 6, r2: C.spitRadius * CELL, life: .35, life0: .35, color: '#cfe9ff' });
  if (typeof nearbyImpact === 'function') nearbyImpact(x, y, 5, .05);
}
// 建築落地：依種類爆炸、漏油、起火或砸碎
function mkItemLand(s) {
  const e = s.king, C = mkCfg(e), o = s.o, x = s.x1, y = s.y1;
  const [c, r] = cellAt(x, y);
  o.c = c - Math.floor(((o.w || 1) - 1) / 2); o.r = r - ((o.h || 1) - 1); o.hp = 0;   // 落點：讓物品的「站立格」對在落點上
  const floorOf = typeof actorFloor === 'function' ? actorFloor(e) : undefined;
  const run = fn => typeof withBlastFloor === 'function' ? withBlastFloor(floorOf, fn) : fn();
  mkSplash(e, x, y, C.spitDamage * (s.atk || 1), null);
  G.effects.push({ ring: true, x, y: y + 6, r: 6, r2: C.spitRadius * CELL, life: .35, life0: .35, color: '#d9d2c0' });
  for (let i = 0; i < 10; i++) { const a = Math.random() * Math.PI * 2, sp = 80 + Math.random() * 120; G.effects.push({ particle: true, kind: 'spark', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * .6 - 40, r: 2 + Math.random() * 2.5, life: .45, life0: .45, color: '#9a9283' }); }
  if (typeof nearbyImpact === 'function') nearbyImpact(x, y, 6, .05); else addShake(4);
  if (typeof sfxAt === 'function') sfxAt('knock2', x, y, 1.1, 'milkfish-king-land');
  const name = String(o.type || '') + ' ' + String((typeof mapTileById === 'function' && o.mapTileId && (mapTileById(o.mapTileId) || {}).name) || '');
  if (o.trap) {   // 地雷：落地就爆
    if (typeof detonateMineNow === 'function') run(() => detonateMineNow(o));
    return;
  }
  mkShatter(o, x, y);   // 其他東西：碎成好幾塊往外飛
  const oil = typeof oilItem === 'function' && oilItem(o);
  if (oil) {   // 油桶、油箱、瓦斯爐：落地爆炸（'explosion'＝跟被爆炸波及一樣會炸開、起火，js/oil-barrels.js）；露營燈：燒一小團火
    o.lastHitBy = oil.smallFire ? 'monster' : 'explosion';
    run(() => removeBarrier(o));
    return;
  }
  if (/郵筒|mailbox|postbox/i.test(name)) {   // 郵筒：撞破漏出一灘油
    if (typeof addOilSlick === 'function') run(() => addOilSlick(x, y, CELL, 300));
    return;
  }
  flash('碎了！', x, y - 24, '#d9d2c0', .6);
}
// 落點範圍內的人：受傷、被撞開（except＝被吐出來的那個隊友自己）
function mkSplash(e, x, y, dmg, except) {
  const R = mkCfg(e).spitRadius * CELL, p = G.player;
  if (p && p.hp > 0 && sameFloor(e, p) && Math.hypot(p.x - x, p.y - y) <= R && !p.vineCap) {
    const hurt = typeof equipPlayerDamage === 'function' ? equipPlayerDamage(dmg) : dmg;
    p.hp = Math.max(0, p.hp - hurt); G.damageVignetteT = .5;
    if (typeof playPlayerHit === 'function') playPlayerHit();
    if (typeof blastPush === 'function') blastPush(p, x, y, hurt, 46);
    if (p.hp <= 0 && !G.over) { flash('部隊長失去戰鬥能力', p.x, p.y - 58, '#ff5b6e'); lose('player', '被' + e.eliteName + '吐出來的東西砸中'); }
  }
  for (const t of G.towers) {
    if (t === except || t.hp <= 0 || t.eatenBy || t.vineCap || !sameFloor(e, t) || Math.hypot(t.x - x, t.y - y) > R) continue;
    const hurt = dmg * (1 - (typeof sentryDefense === 'function' ? sentryDefense(t) : 0));
    t.hp = Math.max(0, t.hp - hurt);
    if (typeof blastPush === 'function') blastPush(t, x, y, hurt, 30);
    if (t.hp <= 0) { t.target = null; sentryStatus(t, '失去戰鬥能力', '#ff5b6e', true); }
  }
}

// ---- 倒下：核心掉在原地、嘴裡的人獲救 ----
function mkDown(e) {
  const mk = e.mk;
  G.mkKings = mkKings().filter(k => k !== e);
  for (const pr of mk.prey) if (typeof mfRelease === 'function') { pr.t.eatenBy = e; mfRelease(pr.t, true); }   // 跟虱目魚小子一樣：放在腳邊
  mk.prey = [];
  const core = mk.core;
  if (core && !core.dead && (mk.coreIn || core.carried)) {
    G.mkShots = (G.mkShots || []).filter(s => s.core !== core);
    core.x = e.x; core.y = e.y; core.carried = false; core.hidden = false; core.lastHp = core.hp;
  }
  mk.coreIn = false;
  if (typeof coreBanner === 'function') coreBanner(e.eliteName + '倒下了', '核心掉出來了，趁現在打破核心！', '#8fd3ff');
  systemNotice(e.eliteName + '倒下了！核心掉出來了', true);
  if (typeof nearbyImpact === 'function') nearbyImpact(e.x, e.y, 10, .08);
}

// ---- 腳步：每一步震動、腳步聲、揚塵、小裂痕 ----
function mkFootsteps(e, moved) {
  const F = MILKFISH_KING_FX, mk = e.mk, C = mkCfg(e);
  if (moved <= 0) return;
  mk.stepDist += moved;
  if (mk.stepDist < F.stepEvery) return;
  mk.stepDist %= F.stepEvery;
  const p = G.player;
  if (p) { const d = mkDist(p, e) / CELL, k = 1 - d / F.shakeRange; if (d < F.shakeRange) addShake(C.stepShake * (.2 + .8 * k * k)); }
  e.hitSquashT = .12;   // 落腳時身體被壓扁一下再彈回
  G.effects.push({ ring: true, x: e.x, y: e.y + 14, r: 6, r2: 48, life: .32, life0: .32, color: '#b9b2a2' });
  if (typeof rockBurstFx === 'function' && typeof ELITE_BIRD !== 'undefined') rockBurstFx(e.x, e.y + 14, ELITE_BIRD.runDust);   // 跟鳥頭大隊長跑步一樣揚起一團煙塵（js/gourd-monkey.js）
  if (mk.coreIn) mkDropPool(e);   // 核心在肚子裡：踩一步留一攤腐蝕池
  (G.eliteCracks = G.eliteCracks || []).push({ x: e.x + (Math.random() * 2 - 1) * 8, y: e.y + 14, at: performance.now() / 1000, rot: (Math.random() * 2 - 1) * .5, flip: Math.random() < .5 });   // 跟鳥頭大隊長共用的小裂痕（js/elite-bird-head.js 的 drawEliteGround）
  if (G.eliteCracks.length > 40) G.eliteCracks.shift();
  for (let i = 0; i < 4; i++) G.effects.push({ particle: true, kind: 'spark', x: e.x + (Math.random() * 2 - 1) * 22, y: e.y + 14, vx: (Math.random() * 2 - 1) * 70, vy: -20 - Math.random() * 30, r: 2 + Math.random() * 2.5, life: .35, life0: .35, color: '#a9a292' });
  if (typeof sfxAt === 'function') sfxAt('milkfishKingStep', e.x, e.y, 1.2, 'milkfish-king-step');
}

// ---- 畫面 ----
// 身上（render.js 的 drawEnemy 畫完本體後呼叫）：肚子裡的核心透出紫光、嘴裡露出的腳、頭上的王冠
function drawMilkfishKingBody(ctx, e, dx, dy, dw, dh, frameImg) {
  const mk = e.mk; if (!mk) return;
  const now = performance.now() / 1000;
  if (mk.coreIn) {   // 肚子透出紫光（跟著心跳一樣慢慢脈動）
    const cx = dx + dw / 2, cy = dy + dh * .62, k = .55 + .45 * Math.sin(now * 3.2), R = dw * .3;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
    g.addColorStop(0, `rgba(214,150,255,${.85 * k})`); g.addColorStop(.5, `rgba(150,70,255,${.45 * k})`); g.addColorStop(1, 'rgba(120,50,255,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  // 吞進去的隊友：整個人看不見（不畫嘴裡的腳），說的話畫在肚子上（js/render.js 的 drawTower 呼叫 milkfishKingBellySpot）
  mkDrawCrown(ctx, dx, dy, dw, !!(e.forceFrame && /attack/.test(e.forceFrame)));
}
// 王冠：畫在頭頂上（像素風的小金冠）；raised＝張嘴攻擊圖（頭比較高）；dark＝倒下時變黑的程度 0～1
function mkDrawCrown(ctx, dx, dy, dw, raised, dark = 0) {
  const s = Math.max(2, Math.round(dw / 60)), cw = 9 * s, cx = Math.round(dx + dw / 2 - cw / 2), cy = Math.round(dy - 5 * s + (raised ? 0 : 2 * s));
  const rows = ['1...1...1', '11.111.11', '111111111', '121212121', '111111111'];
  ctx.save();
  if (dark > 0) ctx.filter = 'brightness(' + Math.max(0, 1 - dark).toFixed(2) + ')';
  for (let r = 0; r < rows.length; r++) for (let c = 0; c < 9; c++) {
    const ch = rows[r][c]; if (ch === '.') continue;
    ctx.fillStyle = ch === '2' ? '#e8423f' : r === 0 ? '#fff1a8' : '#f2c230';
    ctx.fillRect(cx + c * s, cy + r * s, s, s);
  }
  ctx.fillStyle = '#9a6a10'; ctx.fillRect(cx, cy + 5 * s, cw, s);
  ctx.restore();
}
// 倒下的屍體上的王冠（js/bird-head.js 的巨物倒下呼叫；座標已經轉到屍體腳底）
function milkfishKingCorpseCrown(ctx, c, dark) { mkDrawCrown(ctx, -c.w / 2, -c.h, c.w, false, dark); }
// 被吞進肚子的隊友說話泡泡要畫在哪裡：肚子的位置；吞了兩個就左右分開（js/render.js 的 drawTower 呼叫）
function milkfishKingBellySpot(t) {
  const e = t.eatenBy, mk = e && e.mk;
  if (!mk) return null;
  const n = mk.prey.length, i = Math.max(0, mk.prey.findIndex(pr => pr.t === t));
  const off = n > 1 ? (i - (n - 1) / 2) * e.drawWidth * .32 : 0;
  return { x: e.x + off, y: e.y - (e.drawHeight || 264) * .38 };
}
function mkItemImage(o) {
  if (o.mapTileId && typeof mapTileById === 'function' && typeof tileImage === 'function') { const img = tileImage(mapTileById(o.mapTileId)); if (img) return img; }
  const set = typeof obstacleImgs !== 'undefined' && obstacleImgs[o.type];
  const img = set && (set[o.orient || 'h'] || set.h);
  if (img && img.complete && img.naturalWidth) return img;
  const oil = typeof oilItem === 'function' && oilItem(o);
  if (oil && oil.file) { const im = monsterImage(oil.file); if (im.complete && im.naturalWidth) return im; }
  return null;
}
// 黑幕上面（render.js 呼叫）：落點紅圈、飛在空中的東西、蓄力時的瞄準線
function drawMilkfishKingFx(ctx) {
  if (!G) return;
  const now = performance.now() / 1000;
  mkDrawShards(ctx);   // 吐出來的建築碎片
  for (const e of mkKings()) {   // 鼓起來要吐：目標腳下的紅圈
    const s = e.mk && e.mk.state === 'spitWind' && e.mk.spit;
    if (s) mkDrawTarget(ctx, s.x, s.y, mkCfg(e).spitRadius * CELL, 1 - Math.max(0, e.mk.t) / mkCfg(e).spitWindup, s.locked);
  }
  for (const s of G.mkShots || []) {
    const e = s.king, R = mkCfg(e).spitRadius * CELL;
    if (s.kind === 'mate') { if (!s.hit) mkDrawTarget(ctx, s.x1, s.y1, R, 1, true); continue; }
    const k = Math.min(1, s.t / s.T), x = s.x0 + (s.x1 - s.x0) * k, gy = s.y0 + (s.y1 - s.y0) * k, h = 4 * s.peak * k * (1 - k);
    if (s.kind === 'item') mkDrawTarget(ctx, s.x1, s.y1, R, 1, true);
    ctx.save();   // 地上的影子
    ctx.fillStyle = `rgba(0,0,0,${.15 + .2 * k})`; ctx.beginPath(); ctx.ellipse(x, gy + 8, 16 + 8 * k, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    if (s.kind === 'core') {
      ctx.save(); ctx.translate(0, -h); const c = s.core, ox = c.x, oy = c.y; c.x = x; c.y = gy;
      try { drawCore(c); } finally { c.x = ox; c.y = oy; }
      ctx.restore();
      continue;
    }
    const img = mkItemImage(s.o), w = (s.o.w || 1) * CELL * .9, hh = (s.o.h || 1) * CELL * .9;
    ctx.save(); ctx.translate(x, gy - h - hh / 2); ctx.rotate(s.spin);
    if (img) { ctx.imageSmoothingEnabled = false; ctx.drawImage(img, -w / 2, -hh / 2, w, hh); }
    else { ctx.fillStyle = '#7a5a3a'; ctx.fillRect(-w / 2 + 3, -hh / 2 + 3, w - 6, hh - 6); }
    ctx.restore();
  }
  // 喘氣（吐完核心）：頭上轉圈的星星
  for (const e of mkKings()) {
    if (!e.mk || e.mk.state !== 'coreOut') continue;
    const hx = e.x, hy = e.y - e.drawHeight - 6;
    ctx.save();
    for (let i = 0; i < 3; i++) {
      const th = now * 4 + i * Math.PI * 2 / 3, x = hx + Math.cos(th) * 26, y = hy + Math.sin(th) * 7;
      ctx.fillStyle = '#ffe36b'; ctx.strokeStyle = '#7a5a00'; ctx.lineWidth = 1; ctx.beginPath();
      for (let j = 0; j < 10; j++) { const r = j % 2 ? 2.5 : 5.5, t = j * Math.PI / 5 - Math.PI / 2; j ? ctx.lineTo(x + Math.cos(t) * r, y + Math.sin(t) * r) : ctx.moveTo(x + Math.cos(t) * r, y + Math.sin(t) * r); }
      ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    ctx.restore();
  }
}
// 落點紅圈：k＝蓄力進度（0～1），locked＝已經鎖定（實線）
function mkDrawTarget(ctx, x, y, R, k, locked) {
  ctx.save();
  ctx.fillStyle = `rgba(255,75,58,${.1 + .2 * k})`;
  ctx.beginPath(); ctx.ellipse(x, y + 8, R * Math.max(.3, k), R * .6 * Math.max(.3, k), 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = locked ? 'rgba(255,106,77,.9)' : 'rgba(255,176,138,.6)'; ctx.lineWidth = 2; ctx.setLineDash(locked ? [] : [6, 5]);
  ctx.beginPath(); ctx.ellipse(x, y + 8, R, R * .6, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
}

// ---- 畫面上方的 BOSS 血條（core-frenzy.js 的 drawCoreBossUI 呼叫）：牠＋肚子裡的核心同一列 ----
function milkfishKingBars() {
  const out = [];
  for (const e of mkKings()) {
    if (!e.eliteAwake || !mkAlive(e)) continue;
    out.push({ label: e.eliteName, ratio: e.hp / e.maxhp, hit: e.hitT > 0, colors: ['#2f7fb8', '#8fd3ff'], frame: '#6fc3ff', text: '#d6f1ff' });
    const core = e.mk.core;
    if (core && !core.dead && core.carried) out.push({ label: '異質核心（在肚子裡）', ratio: core.hp / core.maxhp, hit: core.hitT > 0, colors: ['#7b3cff', '#c78bff'], frame: '#a970ff', text: '#e3b8ff' });
  }
  return out;
}
// BOSS 音樂（js/boss-music.js）：醒著、活著就算在戰鬥
const milkfishKingHunting = () => mkKings().some(e => e.eliteAwake && mkAlive(e) && e.mk.state !== 'return');
