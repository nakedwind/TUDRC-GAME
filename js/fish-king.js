/* ===== 魚頭王（魚頭君放大 2.4 倍的菁英 BOSS，住在 W118區 地下水池右上角那一池永遠不會抽乾的深水裡）=====
   ・開戰前：躲在水裡看不到。每隔 peek.every 秒會在地圖右邊的深水（maps 的 area）隨機冒出頭來，盯著溫特看 peek.stay 秒，
     不攻擊、打不到，看完就潛下去消失（冒頭的地方盡量挑照得到的；在暗處的話，黑暗中只看得到兩顆紅眼睛）
   ・正式登場：地圖上任何一顆異質核心被打到（扣血）→ 從離那顆核心最近的右邊深水躍出來（大水花、畫面震動）→ 開戰（畫面上方出現 BOSS 血條）；
     之後只在登場的那一池水裡游
   ・潛水／浮上來：大部分時間潛在水裡（只看得到淡淡的影子、打不到），游到靠近岸邊的地方才浮上來（打得到）；
     要潛下去之前會先轉身、露出背面的魚肉 diveTurn 秒（打背面比較痛，魚頭君本來的特性：js/fish-head.js 的 FISH_HEAD.backMul）
   ・高壓水砲（cannon）：浮上來時，對準岸上的人，先在地上畫出預警的扇形，再噴一道粗水柱橫掃過去；
     被掃到扣血、被往遠離牠的方向沖開（走道上下都是深水，被沖下去就會掉進水裡掙扎，js/pool-fall.js 的 poolFallKnockIn）
   ・水柱衝天（geyser）：泡在水裡的人（坐泳圈的、掉進水裡掙扎的）腳下會先冒泡泡預警，再噴出水柱把人往上擊飛：
     落在地上＝扣血、躺著暈（跟花蓮老鼠王的揍飛同一套，js/rat-king.js 的 rkThrowLand → js/vines.js）；
     落在水裡＝激起水花、慌張溺水 geyser.panic 秒之後才能戴泳圈（js/pool-fall.js 的 poolFallSplashIn）
   ・擱淺（strand）：浮上來時被擊退（雷德盾撞、大招、擊退槍、爆炸…）推上岸 → 在地上翻來翻去、露出背面，被打傷害 × strandMul；
     strandSecs 秒後跳回水裡
   ・導電（shock）：牠泡在水裡時被雷電打到（安柏、雷電槍）→ 電流傳遍整池水：牠多扣 shock.boss 的血，
     池裡其他泡在水裡的人、怪物也會被電到（隊友、溫特扣 shock.mate；怪物扣 shock.minion）
   ・叫小弟（minions）：血量掉到 minions.at 裡的比例時，嚇得潛到最遠的地方躲 minions.hideSecs 秒，並從靠近人的水邊叫出 minions.count 隻魚頭君爬上岸
   ・魚頭君本來的特性照舊：正面硬、背面痛、抗火、怕電（js/fish-head.js 的 fishHeadArmor）
   ・圖：images/monster/fish-king/（檔名跟魚頭君一樣、只換資料夾），用 tools/recolor-fish-king.py 從魚頭君的圖換色產生
   ・數值都在下面的 FISH_KING；必須在 fish-head.js、pool-boss.js、pool-fall.js 之後、game.js 之前載入 */
// 數字以 data/monsters.js 的 BOSS_SETTINGS_DEFAULT 為準（怪物編輯器「👑 BOSS 數值」）；這裡的數字只在那邊沒有這一格時才用。
// 新增或刪掉數字欄位、改了註解之後，要跑一次 tools/build-boss-fields.py（編輯器的欄位和說明才會跟著更新）
const FISH_KING = applyBossSettings('FISH_KING', {
  name: '魚頭王',
  // W118區 地下水池：home＝原位（格子座標）、area＝冒頭偷看、登場的範圍 [左邊第幾欄, 上面第幾列, 右邊第幾欄, 下面第幾列]（地圖右邊那些深水）
  maps: { 'map_89aacb92-4b89-47ec-a76b-0908972d3fdf': { home: [95, 16], area: [64, 0, 115, 89] } },
  of: 'fish_head',            // 以哪隻怪物為基準（怪物編輯器的魚頭君）
  artDir: 'images/monster/fish-king/',
  scale: 2.64,                // 放大幾倍
  hp: 4200,                   // 血量（再乘整體難度）
  rewardMul: 6, crystalMul: 6,
  // 開戰前冒頭偷看：每隔幾秒（隨機）一次、盯著看幾秒、慢慢浮出來要幾秒、慢慢沉下去要幾秒、離溫特幾格（最近～最遠）的深水才冒
  peek: { every: [14, 26], stay: 4.5, rise: 2.2, sink: 2.4, distMin: 4, distMax: 10, splashRise: .5, splashSink: .7 },   // splashRise／splashSink＝浮出來、沉下去時，水花散開的寬度大約是身體寬的幾倍
  surfaceRise: 1.2,           // 開戰後：從水裡浮上來要幾秒（慢慢浮出來，不是一下子跳出來）
  // 泡在水裡時，水面那一圈橢圓：wide＝寬度是身體寬的幾倍、flat＝扁度（高÷寬，越小越扁）
  oval: { wide: 1, flat: .3 },
  introSecs: 1.1,             // 正式登場：從水裡躍出來到落回水面要幾秒
  introHeight: 150,           // 正式登場：跳多高（像素）
  introSplash: 3.2,           // 正式登場：落水水花多大（皇冠水花放大幾倍）
  knockMul: .6,               // 被打時的擊退倍率（被推上岸才會擱淺；0＝推不動）
  swimSpeed: 90,              // 潛在水裡游的速度（像素／秒）
  surfacedSpeedMul: .35,      // 浮上來時游的速度倍率
  turnRate: 1.6,              // 轉彎多快（每秒最多轉幾弧度；小一點＝大身體轉得慢）
  accel: .9,                  // 加速／減速多快（每秒追上目標速度的幾成；小一點＝起步、停下都慢慢的，比較有重量）
  weave: { amp: .2, freq: 1.5 },   // 游的時候左右擺（amp＝擺多大，弧度；freq＝擺多快）
  strokeSecs: .55,            // 游泳時換一張動作圖要幾秒（大一點＝擺尾慢、比較沉重）
  dive: [3, 5],               // 潛水幾秒（隨機）；時間到就游去岸邊浮上來
  surface: [4, 6],            // 浮上來幾秒（隨機）
  approachMax: 4,             // 潛水時間到之後，最多花幾秒游到岸邊才浮上來
  diveTurn: 1.4,              // 潛下去之前轉身露出背面幾秒（打得到、背面比較痛；這段時間身體慢慢沉下去）
  surfaceDepth: .57,          // 浮上來時水面在身體的哪裡（0＝腳底、1＝頭頂；.57＝水面在眼睛下面一點，只露出頭和背）
  silhouette: .4,             // 潛水時的影子多濃（再乘水的能見度）
  defaultSee: .45,            // 水的能見度（沒有水素材時用）
  splashSize: 2.4,            // 浮上來、潛下去的水花大小（皇冠水花放大幾倍；2.4 散開時大約跟身體一樣寬）
  // 高壓水砲：每隔幾秒（隨機）一次、預警幾秒、掃多久（秒）、掃的角度（弧度）、射程（格）、水柱多粗（像素）、扣多少血、把人沖開幾格
  cannon: { every: [2.5, 4], windup: 1.1, sweep: 1.4, arc: 1.1, range: 11, width: 30, damage: 14, push: 2.4 },
  // 水柱衝天：每隔幾秒（隨機）一次、預警幾秒、水柱噴多久（秒）、範圍半徑（格）、一次最多幾個人、
  //   離牠幾格內泡在水裡的人會被噴（不限牠自己那一池）、往上拋的速度、飛多遠（格，最少～最多）、落地扣多少血、落水後慌張幾秒才能戴泳圈
  geyser: { every: [4, 6.5], warn: 1.2, column: .7, radius: .9, count: 2, range: 16, up: 620, distMin: 2, distMax: 4.5, landDamage: 14, panic: 3 },
  strandSecs: 6,              // 被推上岸擱淺幾秒才跳回水裡
  strandMul: 2,               // 擱淺時被打的傷害倍率
  hopSecs: .75,               // 擱淺後跳回水裡要幾秒
  hopHeight: 90,              // 跳回水裡時跳多高（像素）
  flop: [.9, 1.8],            // 擱淺時隔幾秒拍一下
  flopLift: 16,               // 拍起來多高（像素）
  // 導電：被雷電打到時多扣牠多少血、池裡的隊友／溫特扣多少血、池裡的其他怪物扣多少血、隊友被電暈幾秒、多久才能再導電一次（秒）
  shock: { boss: 60, mate: 12, minion: 40, daze: .8, cd: .6 },
  // 叫小弟：血量剩幾成時叫（每個只叫一次）、叫幾隻、潛到最遠的地方躲幾秒、躲的時候游多快（倍率）
  minions: { at: [.7, .4], count: 3, hideSecs: 4, fleeMul: 1.8 },
  minionId: 'fish_head',
});

const fishKingState = () => (typeof G !== 'undefined' && G && G.fishKing) || null;
const fishKingAlive = K => !!(K && K.e && K.e.hp > 0 && !K.e.dead);
const fkRand = ([a, b]) => a + Math.random() * (b - a);
const fkCellKey = (x, y) => { const [c, r] = cellAt(x, y); return c + ',' + r; };

// ---- 開場（game.js 的 newGame 呼叫）----
function seedFishKing() {
  if (typeof G !== 'undefined' && G) G.fishKing = null;
  if (typeof MAP === 'undefined' || !MAP || MAP_SAFE || (typeof practiceOn === 'function' && practiceOn())) return;
  const spot = FISH_KING.maps[MAP.id]; if (!spot) return;
  const base = ACTIVE_MONSTERS.find(m => m.id === FISH_KING.of); if (!base) return;
  // 牠的水池：從原位那格往四周連在一起的深水格（只在這一池裡游）
  const deep = deepWaterCells(), start = spot.home[0] + ',' + spot.home[1];
  if (!deep.has(start)) return;
  const P = FISH_KING, [hx, hy] = center(...spot.home), e = createMonster(base, hx, hy);
  const R = fkRegionFrom(start, Math.round(base.width * P.scale));
  e.fishKing = true; e.eliteName = P.name;
  e.hp = e.maxhp = Math.round(e.maxhp / base.hp * P.hp);   // createMonster 給的是魚頭君血量 × 難度：換成 BOSS 的血量，難度照樣乘
  e.reward = Math.round(e.reward * P.rewardMul); e.crystals = Math.round((e.crystals ?? 3) * P.crystalMul);
  e.drawWidth = Math.round(base.width * P.scale); e.drawHeight = Math.round(base.height * P.scale);
  e.knockMul = P.knockMul; e.staggerTime = 0; e.noHitSquash = true; e.noStun = true;   // 推得動（才會擱淺），但不硬直、不會被電暈
  // 換成魚頭王的圖（檔名一樣、只換資料夾）
  const swap = f => typeof f === 'string' ? f.replace(/images\/monster\/fish-head\//, P.artDir) : f;
  const fr = base.frames || {};
  e.frames = { ...fr, front: swap(fr.front), back: swap(fr.back), walkFront: (fr.walkFront || []).map(swap), walkBack: (fr.walkBack || []).map(swap) };
  e.sprite = swap(e.sprite || base.sprite);
  G.fishKing = { e, ...R, area: spot.area || [0, 0, COLS - 1, ROWS - 1], phase: 'hidden', sub: true, t: 0, goal: null, ang: Math.PI, age: 0,
    cannon: null, cannonT: fkRand(P.cannon.every), geysers: [], geyserT: fkRand(P.geyser.every) * .6, sparks: [], shockCd: 0,
    minionsDone: 0, hideT: 0, home: { x: hx, y: hy }, peekT: fkRand(P.peek.every) * .5 };
  e.faceRight = false;   // 開戰前不放進怪物清單：打不到、隊員不會瞄
}
// 從某一格深水往四周連在一起的那一池：region＝格子集合、list＝格子清單、shore＝岸邊的深水格（旁邊就是能走的地）
function fkRegionFrom(start, width) {
  const deep = deepWaterCells(), region = new Set([start]), queue = [start];
  while (queue.length) {
    const [c, r] = queue.shift().split(',').map(Number);
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const k = (c + dc) + ',' + (r + dr);
      if (deep.has(k) && !region.has(k)) { region.add(k); queue.push(k); }
    }
  }
  const shore = [...region].filter(k => { const [c, r] = k.split(',').map(Number); return [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dc, dr]) => !deep.has((c + dc) + ',' + (r + dr)) && inGrid(c + dc, r + dr) && !isWall(c + dc, r + dr)); });
  // 牠游得到的地方：離岸邊夠遠（身體邊緣到岸邊至少 shoreGap 格，跟其他水中怪物同一套，js/water-monsters.js 的 aquaMarginOf）
  //   swim＝游得到的格子、swimShore＝游得到的格子裡最靠岸的那一圈（浮上來打人時待的地方）
  //   水池不夠寬（牠太大隻）：退一步，盡量離岸越遠越好，但游得到的地方要連成一片（不然會被困在水池的一角）
  const dist = k => fkShoreDist(k), all = [...region];
  let m = Math.min(fkMargin(width), Math.max(...all.map(dist)));
  let swim = all;
  for (; m > 1; m--) {
    const s = all.filter(k => dist(k) >= m);
    if (s.length && fkConnected(s)) { swim = s; break; }
  }
  const near = Math.min(...swim.map(dist));
  const swimShore = swim.filter(k => dist(k) <= near);
  return { region, list: [...region], shore, swim, swimSet: new Set(swim), swimShore };
}
// 這些格子是不是上下左右連成一片
function fkConnected(list) {
  const set = new Set(list), seen = new Set([list[0]]), q = [list[0]];
  while (q.length) {
    const [c, r] = q.pop().split(',').map(Number);
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const k = (c + dc) + ',' + (r + dr); if (set.has(k) && !seen.has(k)) { seen.add(k); q.push(k); } }
  }
  return seen.size === set.size;
}
// 這一格深水離岸邊幾格（緊貼岸邊＝1；js/water-monsters.js 的 aquaLabels 算好的）
const fkShoreDist = k => (typeof aquaLabels === 'function' && aquaLabels().shore.get(k)) || 99;
// 身體多寬 → 中心至少離岸邊幾格
const fkMargin = width => typeof aquaMarginOf === 'function' && width ? aquaMarginOf(width) : 0;
const fkRoomyAt = (K, x, y) => !K.swimSet || K.swimSet.has(fkCellKey(x, y));

// ---- 每一幀（js/pool-tide.js 的 updatePoolTide 呼叫；潛水時牠不在 G.enemies 裡，所以由這裡自己動）----
function updateFishKing(dt) {
  const K = fishKingState(); if (!K) return;
  updateFkGeysers(K, dt);
  K.sparks = K.sparks.filter(s => (s.t += dt) < s.life);
  if (K.shockCd > 0) K.shockCd -= dt;
  if (K.done) return;
  const e = K.e;
  if (!fishKingAlive(K)) { K.done = true; K.cannon = null; fkShow(K, true); return; }
  const P = FISH_KING;
  // 開戰前：躲在水裡，偶爾冒頭偷看；核心被打到就正式登場
  if (K.phase === 'hidden' || K.phase === 'peek') {
    const hit = fkHitCore();
    if (hit) { fkIntroStart(K, hit); return; }
    if (K.phase === 'peek') { fkPeekStep(K, dt); return; }
    if ((K.peekT -= dt) <= 0) { K.peekT = fkRand(P.peek.every); fkPeekStart(K); }
    return;
  }
  if (K.phase === 'intro') { fkIntroStep(K, dt); return; }
  e.dmgTakenMul = K.phase === 'strand' ? P.strandMul : 1;   // 擱淺：被打比較痛（js/fish-head.js 的 fishHeadArmor 乘上去）
  fkMinionCheck(K);
  // 被推上岸：擱淺
  if (K.phase === 'swim' && !K.sub && !deepWaterAtPoint(e.x, e.y)) fkStrand(K);
  if (K.phase === 'strand') { fkStrandStep(K, dt); return; }
  if (K.phase === 'hop') { fkHopStep(K, dt); return; }
  // 開戰後浮上來：慢慢浮出水面（越接近水面越慢）
  if (K.riseT != null && !K.sub) {
    K.riseT += dt; const k = Math.min(1, K.riseT / (P.surfaceRise || .01));
    e.fkRise = 1 - (1 - k) * (1 - k);
    if (k >= 1) { K.riseT = null; e.fkRise = null; }
  }
  // 水柱衝天：醒著就會（潛水時也會）
  if ((K.geyserT -= dt) <= 0) { K.geyserT = fkRand(P.geyser.every); fkStartGeysers(K); }
  // 躲起來（叫小弟的時候）：潛在水裡往遠處游
  if (K.hideT > 0) {
    K.hideT -= dt;
    if (K.hideT <= 0) { K.goal = null; K.approach = true; K.t = P.approachMax; }
    fkSwim(K, dt, P.minions.fleeMul); return;
  }
  // 高壓水砲
  if (K.cannon) { fkCannonStep(K, dt); return; }
  // 潛水 ↔ 浮上來
  K.t -= dt;
  if (K.sub) {
    if (K.t <= 0 && !K.approach) { K.approach = true; K.goal = fkShoreGoal(K); K.t = P.approachMax; }   // 潛水時間到：游去岸邊（靠近人的地方）
    if (K.approach && (K.t <= 0 || (K.goal && Math.hypot(K.goal.x - e.x, K.goal.y - e.y) < 24))) fkSurface(K);
  } else if (K.turnT > 0) {   // 轉身露出背面，等一下就潛下去
    K.turnT -= dt; fkFace(e, 'back');
    const k = Math.max(0, K.turnT / FISH_KING.diveTurn); e.fkRise = k * k * (3 - 2 * k);   // 轉身時慢慢沉下去
    if (K.turnT <= 0) fkDive(K);
    return;
  } else {
    if (K.t <= 0) { K.turnT = P.diveTurn; return; }
    if ((K.cannonT -= dt) <= 0) { K.cannonT = fkRand(P.cannon.every); if (fkStartCannon(K)) return; }
  }
  fkSwim(K, dt, 1);
}
// ---- 開戰前：冒頭偷看 ----
// 地圖上有沒有核心被打到（扣了血）：回傳那顆核心
// （泡在深水裡、沉睡中的核心被打不會扣血，所以看 js/anomalous-core.js 記下的 struck＝被打過，或血量少了）
const fkHitCore = () => (G.cores || []).find(c => !c.dead && (c.struck || (c.maxhp && c.hp < c.maxhp - .01))) || null;
// 這格深水在不在地圖右邊的範圍（maps 的 area）
const fkInArea = (K, c, r) => c >= K.area[0] && c <= K.area[2] && r >= K.area[1] && r <= K.area[3];
function fkPeekStart(K) {
  const p = G.player; if (!p || p.hp <= 0) return;
  const P = FISH_KING.peek, lit = [], dark = [];
  for (const k of deepWaterCells()) {
    const [c, r] = k.split(',').map(Number); if (!fkInArea(K, c, r)) continue;
    const [x, y] = center(c, r), d = Math.hypot(x - p.x, y - p.y) / CELL;
    if (d < P.distMin || d > P.distMax || !hasLineOfSight(x, y, p.x, p.y)) continue;
    if (![[1, 0], [-1, 0], [0, 1], [0, -1]].every(([dc, dr]) => deepWaterAtPoint(x + dc * CELL * .6, y + dr * CELL * .6))) continue;   // 四周也是水（身體不會凸到岸上）
    if (fkShoreDist(k) < fkMargin(K.e.drawWidth)) continue;   // 離岸邊不夠遠：身體會穿到岸上
    (typeof isLit === 'function' && isLit(x, y - 40) ? lit : dark).push([x, y]);
  }
  const pool = lit.length ? lit : dark; if (!pool.length) return;   // 溫特附近沒有右邊的深水：這次不冒頭
  const [x, y] = pool[Math.floor(Math.random() * pool.length)], e = K.e;
  e.x = x; e.y = y; e.faceRight = p.x > x; e.slimeLift = 0; e.fkRise = 0; fkFace(e, 'front');
  e.hideBar = true;   // 偷看時頭上不畫血條（還沒開戰）
  K.phase = 'peek'; K.peek = { t: 0 };
  if (typeof poolCrownSplash === 'function') poolCrownSplash(G.poolSplash || (G.poolSplash = []), x, fkWaterY(e), fkSplashSc(e, FISH_KING.peek.splashRise));   // 冒頭：水面那裡冒一圈水花（照牠的體型），慢慢浮上來
  if (typeof sfxAt === 'function') sfxAt('poolWaterDrop', x, y, .8, 'fish-king-peek');
}
function fkPeekStep(K, dt) {
  const e = K.e, P = FISH_KING.peek, p = G.player, Pk = K.peek;
  Pk.t += dt;
  if (p) e.faceRight = p.x > e.x;   // 一直盯著溫特
  fkFace(e, 'front');
  const sinkAt = P.rise + P.stay, sink = P.sink || P.rise;
  // 慢慢浮出來（越接近水面越慢）→ 盯著溫特看（身體隨水微微起伏）→ 慢慢沉下去（一開始很慢，像是捨不得移開視線）
  const ease = k => k * k * (3 - 2 * k);
  e.fkRise = Pk.t < P.rise ? ease(Pk.t / P.rise)
    : Pk.t < sinkAt ? 1 - .04 * (1 - Math.cos((Pk.t - P.rise) * 1.6))
    : Math.max(0, 1 - ease(Math.min(1, (Pk.t - sinkAt) / sink)));
  if (Pk.t >= sinkAt && !Pk.sank) { Pk.sank = true; if (typeof poolCrownSplash === 'function') poolCrownSplash(G.poolSplash || (G.poolSplash = []), e.x, fkWaterY(e), fkSplashSc(e, FISH_KING.peek.splashSink)); }   // 沉下去：在水面那裡、跟身體差不多寬的水花
  if (Pk.t >= sinkAt + sink) { K.phase = 'hidden'; K.peek = null; e.fkRise = null; }
}
// ---- 正式登場：核心被打到 → 從離那顆核心最近的右邊深水躍出來 ----
function fkIntroStart(K, core) {
  const e = K.e;
  let best = null, bd = Infinity;
  const m = fkMargin(e.drawWidth);
  for (const pass of [m, 0]) {   // 先找離岸夠遠的深水；都沒有才退而求其次
    for (const k of deepWaterCells()) {
      const [c, r] = k.split(',').map(Number); if (!fkInArea(K, c, r)) continue;
      const [x, y] = center(c, r);
      if (![[1, 0], [-1, 0], [0, 1], [0, -1]].every(([dc, dr]) => deepWaterAtPoint(x + dc * CELL * .6, y + dr * CELL * .6))) continue;
      if (fkShoreDist(k) < pass) continue;
      const d = Math.hypot(x - core.x, y - core.y); if (d < bd) { bd = d; best = k; }
    }
    if (best) break;
  }
  if (!best) best = fkCellKey(K.home.x, K.home.y);   // 右邊找不到深水：用原位
  Object.assign(K, fkRegionFrom(best, e.drawWidth));   // 之後只在這一池裡游
  const [x, y] = center(...best.split(',').map(Number));
  e.x = x; e.y = y; e.fkRise = null; e.eliteAwake = true; e.hideBar = false;
  K.phase = 'intro'; K.intro = { t: 0 }; K.peek = null; K.sub = false;
  fkShow(K, true);
  fkSplash(e, FISH_KING.introSplash * .7, true);
  if (typeof coreBanner === 'function') coreBanner(FISH_KING.name + '出現了', '', '#c9bfff');
  systemNotice(FISH_KING.name + '從水裡衝出來了！小心水柱！', true);
  if (typeof sfxAt === 'function') sfxAt('fishSpray', e.x, e.y, 1, 'fish-king-wake');
  if (typeof bossImpact === 'function') bossImpact(e.x, e.y, 9, .06);
}
function fkIntroStep(K, dt) {
  const e = K.e, P = FISH_KING, I = K.intro;
  I.t += dt; const k = Math.min(1, I.t / P.introSecs);
  e.airborne = k < 1; e.slimeLift = Math.sin(Math.PI * k) * P.introHeight;
  const p = G.player; if (p) e.faceRight = p.x > e.x;
  fkFace(e, 'front');
  if (k < 1) return;
  e.airborne = false; e.slimeLift = 0; K.intro = null;
  fkSplash(e, P.introSplash, true);
  if (typeof bossImpact === 'function') bossImpact(e.x, e.y, 8, .05);
  K.phase = 'swim'; K.sub = false; K.t = fkRand(P.surface) * .6; K.cannonT = 1;
}
// js/render.js：開戰前冒頭偷看時（不在怪物清單裡）也要畫出來，跟人物一起排前後
function fishKingSortables(out) {
  const K = fishKingState(); if (!K || K.phase !== 'peek' || !fishKingAlive(K)) return;
  const e = K.e;
  out.push({ floor: typeof looseFloor === 'function' ? looseFloor(e) : 1, y: e.y + 13, draw: () => (typeof drawWaded === 'function' ? drawWaded(e, 'enemy', () => drawEnemy(e)) : drawEnemy(e)) });
}
// js/render.js 畫完黑幕之後呼叫：冒頭偷看時在暗處，黑暗中看得到兩顆紅眼睛
function drawFishKingAboveDark(ctx) {
  const K = fishKingState(); if (!K || K.phase !== 'peek' || !fishKingAlive(K)) return;
  const e = K.e, k = e.fkRise ?? 1; if (k <= .05) return;
  if (typeof isLit === 'function' && isLit(e.x, e.y - (e.drawHeight || 190) * .6)) return;   // 照得到：看得到整隻，不用另外畫眼睛
  const w = e.drawWidth || 190, h = e.drawHeight || 190, side = e.faceRight ? 1 : -1;
  const x = e.x + side * w * .11, y = e.y + 13 - h * (1 - 30 / 80) + (1 - k) * h * (1 - FISH_KING.surfaceDepth), t = performance.now() / 1000;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const a = k * (.75 + .25 * Math.sin(t * 3));
  const g = ctx.createRadialGradient(x, y, 0, x, y, 16);
  g.addColorStop(0, `rgba(255,230,230,${a})`); g.addColorStop(.35, `rgba(255,40,40,${a * .8})`); g.addColorStop(1, 'rgba(255,0,0,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 16, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
// 浮上來＝放回 G.enemies（打得到）；潛下去＝拿出來（打不到、隊員也不會一直瞄著）
function fkShow(K, show) {
  const e = K.e, i = G.enemies.indexOf(e);
  if (show && i < 0 && e.hp > 0) G.enemies.push(e);
  if (!show && i >= 0) {
    G.enemies.splice(i, 1);
    for (const t of G.towers || []) if (t.target === e) t.target = null;
  }
}
// 水面在畫面上的高度（牠身體泡在水裡的那條線，不是腳底）：水花要在這裡冒出來才對
const fkWaterY = e => e.y + 13 - (e.drawHeight || 190) * FISH_KING.surfaceDepth;
// 水花大小：k＝水花散開到最大時，寬度大約是身體寬的幾倍
// （皇冠水花原本寬 POOL_FALL.crownV2.width 像素，散開時會再擴到 1＋spread 倍；高度跟寬度一起放大，所以 k 不要太大）
function fkSplashSc(e, k) {
  const V = (typeof POOL_FALL !== 'undefined' && POOL_FALL.crownV2) || { width: 46, spread: .9 };
  return (e.drawWidth || 190) * (k || .6) / (V.width * (1 + (V.spread || 0)));
}
function fkSplash(e, size, surge) {
  if (typeof poolCrownSplash === 'function') poolCrownSplash(G.poolSplash || (G.poolSplash = []), e.x, fkWaterY(e), size);   // 在水面那條線冒水花
  if (typeof sfxAt === 'function') sfxAt('poolBossSplash', e.x, e.y, .8, 'fish-king-splash');
  if (typeof bossImpact === 'function') bossImpact(e.x, e.y, 4, 0);
  if (surge && typeof poolSurgeStart === 'function') poolSurgeStart(e.x, e.y, 'land');   // 水溢上岸、把人推開一點（js/pool-surge.js）
}
function fkSurface(K) {
  const e = K.e; K.sub = false; K.approach = false; K.t = fkRand(FISH_KING.surface); K.cannonT = Math.max(K.cannonT, FISH_KING.surfaceRise || 0);   // 浮出來之前不會開水砲
  K.riseT = 0; e.fkRise = 0;   // 從水裡慢慢浮上來（updateFishKing 一幀一幀推）
  fkShow(K, true); fkSplash(e, FISH_KING.splashSize * .6, false);
}
function fkDive(K) {
  const e = K.e; K.sub = true; K.t = fkRand(FISH_KING.dive); K.goal = null; K.turnT = 0; K.riseT = null; e.fkRise = null;
  fkSplash(e, FISH_KING.splashSize * 1.1, true); fkShow(K, false);
}
// 面向（front＝正面、back＝背面魚肉）：原圖正面朝左、背面朝右；e.showBack 給 js/fish-head.js 算背面傷害
function fkFace(e, side, walk) {
  const f = e.frames || {}, step = Math.floor(performance.now() / 1000 / (FISH_KING.strokeSecs || .26)) % 2;
  e.showBack = side === 'back';
  if (side === 'back') { e.forceFrame = walk && f.walkBack && f.walkBack.length ? f.walkBack[step] : f.back; e.forceFlip = !e.faceRight; }
  else { e.forceFrame = walk && f.walkFront && f.walkFront.length ? f.walkFront[step] : f.front; e.forceFlip = !!e.faceRight; }
}
// 游泳：朝目標轉過去，邊游邊左右擺；只在自己的水池裡游
function fkSwim(K, dt, mul) {
  const e = K.e, P = FISH_KING;
  const nearShore = K.approach || (!K.sub && !(K.hideT > 0));   // 要浮上來、或已經浮上來：在岸邊附近游（才打得到岸上的人，也才有機會被推上岸）
  if (!K.goal || Math.hypot(K.goal.x - e.x, K.goal.y - e.y) < 24) K.goal = nearShore ? fkShoreGoal(K) : fkPickGoal(K);
  if (!K.goal) return;
  K.age += dt;
  const want = Math.atan2(K.goal.y - e.y, K.goal.x - e.x);
  let turn = Math.atan2(Math.sin(want - K.ang), Math.cos(want - K.ang));
  turn = Math.max(-P.turnRate * dt, Math.min(P.turnRate * dt, turn)); K.ang += turn;
  const W = P.weave || { amp: .35, freq: 3 }, a = K.ang + Math.sin(K.age * W.freq) * W.amp;
  // 速度慢慢追上目標（起步慢慢加速、轉大彎時放慢）：大身體有重量，不會一下子衝出去
  const want0 = P.swimSpeed * (K.sub ? 1 : P.surfacedSpeedMul) * mul * (1 - .5 * Math.min(1, Math.abs(turn) / (P.turnRate * dt || 1)));
  K.spd = (K.spd ?? 0) + (want0 - (K.spd ?? 0)) * Math.min(1, (P.accel || 99) * dt);
  const step = K.spd * dt, nx = e.x + Math.cos(a) * step, ny = e.y + Math.sin(a) * step;
  // 離岸夠遠的地方不再游回岸邊；現在太靠岸（被推過來）就讓牠游出來
  const canGo = (x, y) => K.region.has(fkCellKey(x, y)) && deepWaterAtPoint(x, y) && (fkRoomyAt(K, x, y) || !fkRoomyAt(K, e.x, e.y));
  const slid = () => { if ((K.slideT = (K.slideT || 0) + dt) > 1.5) { K.slideT = 0; K.goal = null; } };   // 沿著邊滑太久（目標在轉角後面）：下次換個目標
  if (canGo(nx, ny)) { e.x = nx; e.y = ny; K.slideT = 0; }
  else if (canGo(nx, e.y) && Math.abs(nx - e.x) > step * .3) { e.x = nx; slid(); }   // 斜斜撞到邊：沿著邊滑過去（才游得進窄的水道）
  else if (canGo(e.x, ny) && Math.abs(ny - e.y) > step * .3) { e.y = ny; slid(); }
  else { K.spd = (K.spd || 0) * .4; K.goal = nearShore ? fkShoreGoal(K) : fkPickGoal(K); if (K.goal) K.ang = Math.atan2(K.goal.y - e.y, K.goal.x - e.x); }
  if (Math.abs(Math.cos(a)) > .15) e.faceRight = Math.cos(a) > 0;
  e.moving = true;
  fkFace(e, Math.sin(a) < -.5 ? 'back' : 'front', true);
}
// 隨便挑一個水池裡、直直游得到的地方
function fkPickGoal(K, far) {
  const e = K.e, p = G.player;
  let best = null, bestD = -1;
  for (let n = 0; n < (far ? 40 : 14); n++) {
    const L = K.swim || K.list, k = L[Math.floor(Math.random() * L.length)]; if (!k) return null;   // 只挑離岸夠遠的地方
    const [x, y] = center(...k.split(',').map(Number));
    if (!far) { if (Math.hypot(x - e.x, y - e.y) < 3 * CELL) continue; return { x, y }; }
    const d = p ? Math.hypot(x - p.x, y - p.y) : 0;   // far：離溫特最遠的地方（躲起來用）
    if (d > bestD) { bestD = d; best = { x, y }; }
  }
  return best || fkPickGoal(K, false);
}
// 靠岸那一圈（離岸邊剛好夠遠、身體不會穿到岸上）：離最近的「岸上的人」最近的那一格（沒人就隨便一格）
function fkShoreGoal(K) {
  const who = fkTargets(K, false), S = K.swimShore || K.shore;
  if (!S.length) return fkPickGoal(K);
  const pool = S.map(k => center(...k.split(',').map(Number)));
  if (!who.length) { const [x, y] = pool[Math.floor(Math.random() * pool.length)]; return { x, y }; }
  const t = who[Math.floor(Math.random() * who.length)];
  let best = null, bd = Infinity;
  for (const [x, y] of pool) { const d = Math.hypot(x - t.x, y - t.y) + Math.random() * CELL; if (d < bd) { bd = d; best = { x, y }; } }
  return best;
}
// 打誰：溫特、隊員（活著、沒在空中、離牠不遠）；inWater＝只要泡在水裡的人（水柱衝天用）
function fkTargets(K, inWater) {
  const e = K.e, R = (inWater ? FISH_KING.geyser.range : FISH_KING.cannon.range + 4) * CELL;
  return [G.player, ...(G.towers || [])].filter(a => a && a.hp > 0 && !a.vineCap && !a.eatenBy && !a.mrtRide && !a.grabbed && !a.grabFall && !a.rkHeld
    && Math.hypot(a.x - e.x, a.y - e.y) <= R && fkInWater(a) === inWater);   // 水柱衝天：牠附近每一池水都噴得到（被水砲沖下另一池的也算）
}
const fkInWater = a => !!(a.swimRing || a.drowning || a.poolFall || (typeof deepWaterAtPoint === 'function' && deepWaterAtPoint(a.x, a.y)));

// ---- 高壓水砲 ----
function fkMouth(e) {
  const side = e.faceRight ? 1 : -1, w = e.drawWidth || 190, h = e.drawHeight || 190;
  return { x: e.x + side * w * .44, y: e.y + 4, z: h * .5 - 13 };   // 嘴唇在圖的一半高度（跟 js/fish-head.js 的 fishMouth 一樣）
}
function fkStartCannon(K) {
  const e = K.e, P = FISH_KING.cannon, list = fkTargets(K, false).filter(a => hasLineOfSight(e.x, e.y, a.x, a.y));
  if (!list.length) return false;
  const t = list[Math.floor(Math.random() * list.length)];
  e.faceRight = t.x > e.x; fkFace(e, 'front');
  const m = fkMouth(e), aim = Math.atan2(t.y - m.y, t.x - m.x), dir = Math.random() < .5 ? 1 : -1;
  K.cannon = { t: 0, a0: aim - dir * P.arc / 2, a1: aim + dir * P.arc / 2, hit: new Set(), firing: false };
  if (typeof sfxAt === 'function') sfxAt('fishSpray', e.x, e.y, .5, 'fish-king-cannon-windup');
  return true;
}
// 水柱從嘴巴沿著 ang 方向，碰到牆就停：回傳終點
function fkBeamEnd(m, ang) {
  const L = FISH_KING.cannon.range * CELL, ux = Math.cos(ang), uy = Math.sin(ang);
  for (let d = 8; d <= L; d += 8) if (solidBlocksPoint(m.x + ux * d, m.y + uy * d)) return { x: m.x + ux * (d - 8), y: m.y + uy * (d - 8) };
  return { x: m.x + ux * L, y: m.y + uy * L };
}
function fkCannonStep(K, dt) {
  const e = K.e, P = FISH_KING.cannon, c = K.cannon;
  e.moving = false; fkFace(e, 'front');
  c.t += dt;
  if (!c.firing) { if (c.t >= P.windup) { c.firing = true; c.t = 0; if (typeof sfxAt === 'function') sfxAt('fishSpray', e.x, e.y, 1, 'fish-king-cannon'); } return; }
  const k = Math.min(1, c.t / P.sweep); c.ang = c.a0 + (c.a1 - c.a0) * k;
  const m = fkMouth(e), end = fkBeamEnd(m, c.ang); c.end = end;
  const ux = Math.cos(c.ang), uy = Math.sin(c.ang), L = Math.hypot(end.x - m.x, end.y - m.y);
  for (const a of [G.player, ...(G.towers || [])]) {
    if (!a || a.hp <= 0 || c.hit.has(a) || a.vineCap || a.berserk) continue;
    const along = (a.x - m.x) * ux + (a.y - m.y) * uy; if (along < 0 || along > L + 10) continue;
    const side = Math.abs((a.x - m.x) * uy - (a.y - m.y) * ux); if (side > P.width / 2 + 12) continue;
    c.hit.add(a);
    fkHurt(a, P.damage, '被' + FISH_KING.name + '的水砲沖倒');
    if (!fkInWater(a) && a.hp > 0) { knockActor(a, ux, uy, P.push * CELL, .4); if (a !== G.player) { a.navPath = null; a.navGoal = null; } }   // 往遠離牠的方向沖開（被沖下水就掉進水裡）
  }
  // 水柱經過的地方把火澆熄（魚頭君本來就會滅火，js/fish-head.js）
  if (typeof firesAt === 'function' && typeof douseFire === 'function') for (const f of firesAt(end.x, end.y, 20)) douseFire(f, 1);
  if (Math.random() < dt * 14 && typeof poolFallSplash === 'function') poolFallSplash(end.x, end.y + 4, false);
  if (k >= 1) K.cannon = null;
}
// 扣血：溫特跟其他怪物打中一樣；隊員照防禦力減傷
function fkHurt(a, dmg, why) {
  if (typeof practiceOn === 'function' && practiceOn()) return;
  if (typeof hurtGraceBlocked === 'function' && hurtGraceBlocked(a)) return;
  if (a === G.player) {
    const d = Math.round(typeof equipPlayerDamage === 'function' ? equipPlayerDamage(dmg) : dmg);
    a.hp = Math.max(0, a.hp - d); a.hitT = .35; a.underAttackT = 5;
    G.damageVignetteT = Math.max(G.damageVignetteT || 0, .3);
    flashDmg('-' + d, a.x, a.y - 46, '#ff6b6b'); addShake(2);
    if (typeof playPlayerHit === 'function') playPlayerHit(1, true);
    if (a.hp <= 0 && !G.over) { flash('部隊長失去戰鬥能力', a.x, a.y - 58, '#ff5b6e'); lose('player', why); }
    return;
  }
  const d = Math.max(1, Math.round(dmg * (1 - (typeof sentryDefense === 'function' ? sentryDefense(a) : 0))));
  a.hp = Math.max(0, a.hp - d); a.hitT = Math.max(a.hitT || 0, .25);
  flashDmg('-' + d, a.x, a.y - 40, '#ff6b6b');
  if (a.hp <= 0) { a.target = null; if (typeof sentryStatus === 'function') sentryStatus(a, '失去戰鬥能力', '#ff5b6e', true); }
}

// ---- 水柱衝天 ----
function fkStartGeysers(K) {
  const list = fkTargets(K, true).sort(() => Math.random() - .5).slice(0, FISH_KING.geyser.count);
  for (const a of list) {
    K.geysers.push({ x: a.x, y: a.y, t: 0, phase: 'warn', seed: Math.random() * 10 });
    if (typeof sfxAt === 'function') sfxAt('poolWaterDrop', a.x, a.y, .7, 'fish-king-bubble');
  }
}
function updateFkGeysers(K, dt) {
  const P = FISH_KING.geyser;
  for (const g of K.geysers) {
    g.t += dt;
    if (g.phase === 'warn' && g.t >= P.warn) {   // 噴出來！範圍內的人全部往上擊飛
      g.phase = 'up'; g.t = 0;
      if (typeof poolCrownSplash === 'function') poolCrownSplash(G.poolSplash || (G.poolSplash = []), g.x, g.y + 6, 1.4);
      if (typeof sfxAt === 'function') sfxAt('poolBossSplash', g.x, g.y, 1, 'fish-king-geyser');
      if (typeof bossImpact === 'function') bossImpact(g.x, g.y, 4, 0);
      for (const a of [G.player, ...(G.towers || [])]) {
        if (!a || a.hp <= 0 || a.vineCap || Math.hypot(a.x - g.x, a.y - g.y) > P.radius * CELL + 10) continue;
        fkLaunch(a, g);
      }
    }
  }
  K.geysers = K.geysers.filter(g => g.phase === 'warn' || g.t < P.column);
}
// 往上擊飛（借用 js/rat-king.js 揍飛那一套的畫法和落地：js/vines.js 的 G.vineCaps）
// cfg：up＝往上拋的速度、distMin／distMax＝飛多遠（格）、landDamage＝落地扣多少血、panic＝落水後慌張幾秒（沒給＝魚頭王的水柱衝天那組）
function fkLaunch(a, from, cfg) {
  if (!G.vineCaps || a.vineCap || a.rkHeld || a.eatenBy || a.mrtRide) return false;
  const P = cfg || FISH_KING.geyser, isPlayer = a === G.player, g = 900;
  // 落點：往四周隨便一個方向飛 distMin～distMax 格（落點是牆就換一個方向）
  let tx = 1, ty = 0, dist = P.distMin * CELL;
  for (let n = 0; n < 16; n++) {
    const ang = Math.random() * Math.PI * 2, d = (P.distMin + Math.random() * (P.distMax - P.distMin)) * CELL;
    const x = a.x + Math.cos(ang) * d, y = a.y + Math.sin(ang) * d, [c, r] = cellAt(x, y);
    if (!inGrid(c, r) || solidBlocksPoint(x, y)) continue;
    tx = Math.cos(ang); ty = Math.sin(ang); dist = d; break;
  }
  const flight = 2 * P.up / g;
  // 從泳圈上被打飛：泳圈還在自己身上（隊員）／背包裡（溫特），掉進水裡要過 panic 秒才能再戴
  a.swimRing = false; a.drowning = false; a.poolFall = null; a.drownPath = null;
  const v = { x: a.x, y: a.y, kind: 'hang', state: 'grab', t: 0, len: 1, seed: Math.random() * 10, twitch: 0, temp: true };   // 假的藤蔓（不放進 G.vines）
  G.vineCaps.push({ v, actor: a, isPlayer, mode: 'toss', ground: true, fkThrow: true, phase: 'thrown', t: 0, h: 0,
    x0: a.x, y0: a.y, hp: a.hp, camX: typeof cam !== 'undefined' ? cam.x : 0, camY: typeof cam !== 'undefined' ? cam.y : 0, topH: 0,
    tx, ty, vh: P.up, speed: dist / flight, spin: 0, spinDir: tx >= 0 ? 1 : -1, lieSide: tx >= 0 ? 1 : -1, landDamage: P.landDamage, panic: P.panic });
  a.vineCap = true; a.dashT = 0; a.knockT = 0; a.rootT = 0; a.moving = false; a.rkTossed = true;
  if (isPlayer) {
    if (typeof cancelChannel === 'function' && typeof playerChannel !== 'undefined' && playerChannel) cancelChannel();
    flash(P.say || '被水柱噴飛了！', a.x, a.y - 60, '#bfefff', .9);
  } else { a.navPath = null; a.navGoal = null; a.target = null; a.meleeSwing = null; a.gunSwing = null; }
  return true;
}
// 每幀（js/water-monsters.js 的 updateWaterMonsters 呼叫，魚頭王、小虱目魚小子噴飛的人都在這裡飛）
function updateFkThrows(dt) {
  for (const cap of (G && G.vineCaps) || []) if (cap.fkThrow && cap.phase === 'thrown') fkThrowStep(cap, dt);
  if (typeof rkMuteHitFx === 'function') rkMuteHitFx();   // 飛在空中、躺著暈的時候不閃紅、不發抖
}
function fkThrowStep(cap, dt) {
  cap.t += dt; cap.vh -= 900 * dt; cap.h = Math.max(0, cap.h + cap.vh * dt);
  cap.spin += cap.spinDir * 9 * dt;
  const step = cap.speed * dt, nx = cap.x0 + cap.tx * step, ny = cap.y0 + cap.ty * step;
  if (solidBlocksPoint(nx, ny)) { cap.tx = 0; cap.ty = 0; }   // 撞到牆：直直掉下來
  else { cap.x0 = nx; cap.y0 = ny; }   // js/vines.js 的 stepVineCap 會把人放到 x0, y0
  if (!(cap.h <= 0 && cap.vh < 0)) return;
  const a = cap.actor;
  if (typeof poolFallOn === 'function' && poolFallOn() && deepWaterAtPoint(cap.x0, cap.y0)) {   // 落在水裡：激起水花、慌張溺水
    G.vineCaps = G.vineCaps.filter(c => c !== cap); a.vineCap = false; a.rkTossed = false;
    a.x = cap.x0; a.y = cap.y0;
    if (typeof poolFallSplashIn === 'function') poolFallSplashIn(a, cap.panic ?? FISH_KING.geyser.panic);
    return;
  }
  if (typeof rkThrowLand === 'function') rkThrowLand(cap, false);   // 落在地上：彈兩下、扣血、躺著暈（js/rat-king.js → js/vines.js，扣多少血看 cap.landDamage）
  else { cap.phase = 'fall'; cap.t = 0; cap.fallV = Math.max(0, -cap.vh); cap.h = 1; cap.fallH0 = 60; a.x = cap.x0; a.y = cap.y0; }
}

// ---- 擱淺 ----
function fkStrand(K) {
  const e = K.e; K.phase = 'strand'; K.t = FISH_KING.strandSecs; K.flopT = fkRand(FISH_KING.flop) * .4; K.cannon = null; K.turnT = 0;
  e.knockT = 0; e.moving = false;
  flash('擱淺了！', e.x, e.y - (e.drawHeight || 190) - 10, '#c9bfff', 1.4);
  if (typeof bossImpact === 'function') bossImpact(e.x, e.y, 5, .04);
  if (typeof sfxAt === 'function') sfxAt('fishHurt', e.x, e.y, 1, 'fish-king-strand');
}
function fkStrandStep(K, dt) {
  const e = K.e, P = FISH_KING;
  e.moving = false; fkFace(e, 'back');   // 翻過來露出背面的魚肉
  K.t -= dt; K.flopT -= dt;
  if (K.flopT <= 0) {   // 拍一下（跳起來一點點再摔回去）
    const p = -K.flopT / .3;
    e.slimeLift = Math.sin(Math.PI * Math.min(1, p)) * P.flopLift;
    if (p >= 1) { K.flopT = fkRand(P.flop); e.slimeLift = 0; e.faceRight = !e.faceRight; if (typeof bossImpact === 'function') bossImpact(e.x, e.y, 2, 0); }
  }
  if (K.t > 0) return;
  // 跳回最近的深水
  let best = null, bd = Infinity;
  for (const k of K.swim || K.list) { const [x, y] = center(...k.split(',').map(Number)); const d = Math.hypot(x - e.x, y - e.y); if (d < bd && deepWaterAtPoint(x, y)) { bd = d; best = { x, y }; } }   // 跳回離岸夠遠的深水
  if (!best) best = { ...K.home };
  K.phase = 'hop'; K.hop = { t: 0, from: { x: e.x, y: e.y }, to: best }; e.airborne = true; e.slimeLift = 0;
}
function fkHopStep(K, dt) {
  const e = K.e, P = FISH_KING, H = K.hop;
  H.t += dt; const k = Math.min(1, H.t / P.hopSecs);
  e.x = H.from.x + (H.to.x - H.from.x) * k; e.y = H.from.y + (H.to.y - H.from.y) * k;
  e.slimeLift = Math.sin(Math.PI * k) * P.hopHeight; e.faceRight = H.to.x > H.from.x; fkFace(e, 'front');
  if (k < 1) return;
  e.airborne = false; e.slimeLift = 0; K.hop = null; K.phase = 'swim';
  fkSplash(e, P.splashSize * 1.2, true);
  fkDive(K);   // 一跳回水裡就潛下去
}

// ---- 叫小弟 ----
function fkMinionCheck(K) {
  const e = K.e, M = FISH_KING.minions;
  if (K.phase !== 'swim') return;   // 擱淺、跳回水裡的時候先不叫（回到水裡再叫）
  if (K.minionsDone >= M.at.length || e.hp / e.maxhp > M.at[K.minionsDone]) return;
  K.minionsDone++;
  // 嚇到：潛下去，往離溫特最遠的地方游
  K.cannon = null; K.turnT = 0; K.approach = false;
  if (!K.sub) { K.sub = true; fkSplash(e, FISH_KING.splashSize, true); fkShow(K, false); }
  K.hideT = M.hideSecs; K.goal = fkPickGoal(K, true);
  flash('！', e.x, e.y - (e.drawHeight || 190) - 10, '#bfe6ff', .8);
  systemNotice(FISH_KING.name + '躲起來了，魚頭君從水裡爬上來了！', true);
  // 從靠近人的岸邊叫出魚頭君：在水裡往岸上游（js/pool-monster-fall.js 的會游泳的怪物）
  const spec = ACTIVE_MONSTERS.find(m => m.id === FISH_KING.minionId); if (!spec) return;
  const p = G.player;
  const spots = K.shore.map(k => center(...k.split(',').map(Number))).sort((a, b) => p ? Math.hypot(a[0] - p.x, a[1] - p.y) - Math.hypot(b[0] - p.x, b[1] - p.y) : 0);
  for (let i = 0; i < M.count && spots.length; i++) {
    const [x, y] = spots.splice(Math.floor(Math.random() * Math.min(6, spots.length)), 1)[0];
    const m = createMonster(spec, x, y);
    m.poolMFall = { phase: 'struggle', t: 0, seed: Math.random() * 10, splashT: .2, swimmer: true };
    G.enemies.push(m);
    if (typeof poolCrownSplash === 'function') poolCrownSplash(G.poolSplash || (G.poolSplash = []), x, y + 6, 1.1);
  }
}

// ---- 導電（data/balance.js 的 waterShockStun 呼叫：怪物被雷電打到時）----
function fishKingShocked(e) {
  const K = fishKingState(); if (!K || K.done || !e || !e.fishKing || K.e !== e || e.hp <= 0) return;
  if (K.phase === 'strand' || K.phase === 'hop' || K.shockCd > 0) return;   // 在岸上不導電
  const S = FISH_KING.shock; K.shockCd = S.cd;
  e.hp = Math.max(1, e.hp - S.boss);   // 牠自己多吃一下（留 1 滴血給一般的擊殺流程結算）
  flashDmg('-' + S.boss + ' 導電！', e.x, e.y - (e.drawHeight || 190) * .6, '#bfe9ff');
  const inPool = a => K.region.has(fkCellKey(a.x, a.y)) && fkInWater(a);
  const hit = [];
  for (const a of [G.player, ...(G.towers || [])]) {
    if (!a || a.hp <= 0 || a.vineCap || !inPool(a)) continue;
    fkHurt(a, S.mate, '在水裡被' + FISH_KING.name + '的電流電倒');
    if (a !== G.player) a.dazeT = Math.max(a.dazeT || 0, S.daze);
    flash('觸電！', a.x, a.y - 58, '#bfe9ff', .8); hit.push(a);
  }
  for (const m of G.enemies) {
    if (m === e || m.dead || m.hp <= 0 || !K.region.has(fkCellKey(m.x, m.y))) continue;
    m.hp -= S.minion; m.hitT = .16; m.hitColor = '#bfe9ff'; hit.push(m);
  }
  // 畫面：從牠身上往外竄的電弧、打到每個人
  for (const a of hit) K.sparks.push({ x1: e.x, y1: e.y, x2: a.x, y2: a.y - 10, t: 0, life: .35, seed: Math.random() * 10 });
  for (let i = 0; i < 6; i++) {
    const k = K.list[Math.floor(Math.random() * K.list.length)]; if (!k) break;
    const [x, y] = center(...k.split(',').map(Number));
    K.sparks.push({ x1: e.x, y1: e.y, x2: x, y2: y, t: 0, life: .3, seed: Math.random() * 10 });
  }
  if (typeof spawnLightningBolt === 'function') for (const a of hit) spawnLightningBolt(a.x, a.y + 10, .5);
}

// ---- 給其他程式用 ----
// js/enemy-ai.js：牠在 G.enemies 裡的時候，一般的怪物 AI 不要動牠（這裡自己管）
function stepFishKing(e, dt) { e.moving = false; e.target = null; }
// js/water.js 的 wadeInfo：在水裡露出上半身；在岸上（擱淺、跳回水裡）不算泡水
function fishKingWade(a) {
  const K = fishKingState(); if (!K || K.e !== a) return undefined;
  if (K.phase === 'strand' || K.phase === 'hop' || !deepWaterAtPoint(a.x, a.y)) return null;
  const h = a.drawHeight || 190, lift = Math.max(0, a.slimeLift || 0), H = h + lift;
  // 浮上來／沉下去（fkRise：0＝整隻沉在水面下、1＝浮出來）：水面高度不動，是魚的身體往下沉（js/water.js 的 drawWaded 照 sinkDy 把身體往下挪）
  const rise = a.fkRise ?? 1, depth = FISH_KING.surfaceDepth, sinkDy = (1 - rise) * h * (1 - FISH_KING.surfaceDepth);
  const O = FISH_KING.oval || { wide: .7, flat: .55 };   // 水面那圈橢圓的寬度、扁度（js/water.js 的 drawWaded／drawWaterRipple 照這個畫和切）
  return { w: { depth: h * depth / H, see: fkSee(a) }, bottom: a.y + 13, height: H, width: (a.drawWidth || 190) * O.wide, flat: O.flat, sinkDy };
}
function fkSee(a) {
  const w = typeof waterAt === 'function' ? waterAt(a.x, a.y + 10) : null;
  return w && Number.isFinite(w.see) ? w.see : FISH_KING.defaultSee;
}
// js/core-frenzy.js：畫面上方的 BOSS 血條；js/boss-music.js：BOSS 音樂
function fishKingBars() {
  const K = fishKingState(); if (!fishKingAlive(K) || !K.e.eliteAwake) return [];
  return [{ label: FISH_KING.name, ratio: K.e.hp / K.e.maxhp, hit: K.e.hitT > 0, colors: ['#5a46c8', '#b3a6ff'], frame: '#8b7bff', text: '#e4deff' }];
}
const fishKingHunting = () => { const K = fishKingState(); return fishKingAlive(K) && !!K.e.eliteAwake; };

// ---- 畫面 ----
// 地上那一層（js/render.js 畫地面時呼叫）：潛水的影子、水柱衝天的預警泡泡、水砲的預警扇形
function drawFishKingGround(ctx) {
  const K = fishKingState(); if (!K) return;
  const now = performance.now() / 1000;
  // 潛在水裡的影子
  if (!K.done && K.sub && K.phase === 'swim' && fishKingAlive(K)) {   // 開戰前躲著的時候不畫
    const e = K.e, img = monsterImage(e.forceFrame || (e.frames && e.frames.front) || e.sprite);
    if (img.complete && img.naturalWidth) {
      const w = e.drawWidth, h = e.drawHeight, a = FISH_KING.silhouette * fkSee(e) * (.85 + .15 * Math.sin(now * 1.7));
      ctx.save(); ctx.globalAlpha = a; ctx.imageSmoothingEnabled = false;
      ctx.translate(e.x, e.y + 13 + h * .12); if (e.forceFlip) ctx.scale(-1, 1);
      ctx.filter = 'brightness(.5) saturate(.6)';
      ctx.drawImage(img, -w / 2, -h, w, h);
      ctx.restore();
    }
  }
  // 水柱衝天的預警：水面冒泡泡、一圈越來越亮
  const G2 = FISH_KING.geyser;
  for (const g of K.geysers) {
    if (g.phase !== 'warn') continue;
    const k = Math.max(0, Math.min(1, g.t / G2.warn)), R = G2.radius * CELL;
    ctx.save();
    ctx.globalAlpha = .25 + .45 * k; ctx.strokeStyle = '#d8f6ff'; ctx.lineWidth = 2;
    ctx.setLineDash([6, 5]); ctx.lineDashOffset = -now * 30;
    ctx.beginPath(); ctx.ellipse(g.x, g.y + 8, R, R * .4, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = .15 + .25 * k; ctx.fillStyle = '#9fe4ff';
    ctx.beginPath(); ctx.ellipse(g.x, g.y + 8, R * k, R * .4 * k, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 10; i++) {   // 一顆顆冒上來的泡泡
      const s = g.seed + i * 1.7, ph = (now * (1.4 + (i % 3) * .3) + s) % 1, ang = s * 2.3, rr = R * .8 * ((i * .37 + s) % 1);
      ctx.globalAlpha = (1 - ph) * (.4 + .5 * k);
      ctx.beginPath(); ctx.arc(g.x + Math.cos(ang) * rr, g.y + 8 + Math.sin(ang) * rr * .4 - ph * 14, 1.5 + 2 * (1 - ph), 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
  // 高壓水砲的預警：嘴巴前面畫出要掃過的扇形
  if (K.cannon && !K.cannon.firing && fishKingAlive(K)) {
    const c = K.cannon, m = fkMouth(K.e), k = Math.min(1, c.t / FISH_KING.cannon.windup), L = FISH_KING.cannon.range * CELL;
    ctx.save();
    ctx.globalAlpha = .12 + .18 * k; ctx.fillStyle = '#7fd0ff';
    ctx.beginPath(); ctx.moveTo(m.x, m.y);
    const n = 16; for (let i = 0; i <= n; i++) { const a = c.a0 + (c.a1 - c.a0) * i / n, end = fkBeamEnd(m, a); ctx.lineTo(end.x, end.y); }
    ctx.closePath(); ctx.fill();
    const s = fkBeamEnd(m, c.a0);   // 一開始噴的那條線
    ctx.globalAlpha = .4 + .5 * k; ctx.strokeStyle = '#e8f8ff'; ctx.lineWidth = 2; ctx.setLineDash([8, 6]); ctx.lineDashOffset = -now * 40;
    ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(s.x, s.y); ctx.stroke();
    ctx.restore();
  }
}
// 特效那一層（js/render.js 畫完人之後呼叫）：水砲的水柱、衝天的水柱、導電的電弧
function drawFishKingFx(ctx) {
  const K = fishKingState(); if (!K) return;
  const now = performance.now() / 1000;
  // 高壓水砲
  if (K.cannon && K.cannon.firing && K.cannon.end && fishKingAlive(K)) {
    const m = fkMouth(K.e), end = K.cannon.end, W = FISH_KING.cannon.width, sx = m.x, sy = m.y - m.z;
    const L = Math.hypot(end.x - sx, end.y - 6 - sy), ang = Math.atan2(end.y - 6 - sy, end.x - sx);
    ctx.save(); ctx.translate(sx, sy); ctx.rotate(ang);
    const wav = x => Math.sin(x * .08 - now * 30) * 2.5;
    for (const [col, ww, al] of [['#3f8fe0', W, .55], ['#8fd4ff', W * .65, .85], ['#ffffff', W * .25, .9]]) {
      ctx.globalAlpha = al; ctx.fillStyle = col; ctx.beginPath();
      ctx.moveTo(0, -ww * .3);
      for (let x = 0; x <= L; x += 12) ctx.lineTo(x, -ww / 2 * Math.min(1, .45 + x / 60) + wav(x));
      for (let x = L; x >= 0; x -= 12) ctx.lineTo(x, ww / 2 * Math.min(1, .45 + x / 60) + wav(x + 30));
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }
  // 衝天的水柱：從水面噴上去、慢慢塌下來
  const G2 = FISH_KING.geyser;
  for (const g of K.geysers) {
    if (g.phase !== 'up') continue;
    const k = Math.max(0, Math.min(1, g.t / G2.column)), H = 170 * Math.sin(Math.PI * Math.min(1, k * 1.3)) + 10, w = 30 * (1 - k * .3);
    ctx.save();
    const gr = ctx.createLinearGradient(0, g.y - H, 0, g.y + 8);
    gr.addColorStop(0, 'rgba(255,255,255,.95)'); gr.addColorStop(.3, 'rgba(160,225,255,.9)'); gr.addColorStop(1, 'rgba(70,150,220,.75)');
    ctx.globalAlpha = 1 - Math.max(0, k - .7) / .3; ctx.fillStyle = gr;
    ctx.beginPath(); ctx.moveTo(g.x - w * .6, g.y + 8);
    for (let i = 0; i <= 10; i++) { const y = g.y + 8 - H * i / 10; ctx.lineTo(g.x - w / 2 + Math.sin(i * 1.3 + now * 20 + g.seed) * 3, y); }
    ctx.quadraticCurveTo(g.x, g.y + 8 - H - 18, g.x + w / 2, g.y + 8 - H);
    for (let i = 10; i >= 0; i--) { const y = g.y + 8 - H * i / 10; ctx.lineTo(g.x + w / 2 + Math.sin(i * 1.1 - now * 20 + g.seed) * 3, y); }
    ctx.lineTo(g.x + w * .6, g.y + 8); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  // 導電的電弧（鋸齒線）
  for (const s of K.sparks) {
    const a = 1 - s.t / s.life;
    ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = '#e8fbff'; ctx.lineWidth = 2.2; ctx.shadowColor = '#7fd8ff'; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.moveTo(s.x1, s.y1);
    const n = 7; for (let i = 1; i < n; i++) { const k = i / n, j = Math.sin(s.seed * 7 + i * 3.1 + now * 40) * 9; ctx.lineTo(s.x1 + (s.x2 - s.x1) * k + j, s.y1 + (s.y2 - s.y1) * k + j * .5); }
    ctx.lineTo(s.x2, s.y2); ctx.stroke();
    ctx.restore();
  }
}
