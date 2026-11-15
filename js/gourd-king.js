/* ===== 菁英葫蘆猴「葫蘆猴王」（R89 捷運站上方隱藏區的地圖 BOSS）=====
   - 平常躲在「BOSS 牆」後面的隱藏區裡：看不到、打不到（其實還沒生出來）。
   - 觸發：地圖上任何一顆異質核心被喚醒 → 牆後開始傳來撞擊聲：
       第 1 下：小裂縫 → 第 2 下：大裂縫 → 第 3 下：大裂縫02 → 第 4 下：撞破（全破的圖），隱藏區顯現。
       每一下：畫面搖晃（越撞越大）、牆本身抖一下、牆面掉碎石、沿著牆面灑下粉塵、牆腳揚起灰塵、天花板也掉小碎石。
   - 撞破後：停一下（煙霧、吼聲），葫蘆猴王踏出來站在破洞門口亮相，「葫蘆猴王現身」橫幅播完才開始攻擊（亮相時不會受傷），
     接著 BOSS 血條＋中BOSS 音樂開始。
   - BOSS 牆：用一般的「捷運高牆X6（可炸開・隱藏區）」，在下面 GOURD_KING.maps 寫上牆的位置就會變成 BOSS 牆。
       BOSS 牆不會被炸彈炸開（只會被葫蘆猴王撞開），球球也不會在上面標腳印。
   - 戰鬥（預設的發想，數值都在下面，可以再調）：
       1. 巨型泰山壓頂：跟一般葫蘆猴同一招，但範圍、震波、高度都大很多，落點圈也更大。
       2. 天花板落石：每次大壓頂都把天花板震下石頭，地上先出現影子，影子變深就會砸下來。
          落石不分敵我：怪物站在影子裡也會被砸（葫蘆猴王自己不會）。
       ＋ 壓碎礦石：壓頂砸到的煤礦、錫礦、石灰岩、錳礦直接壓碎；震波範圍內的算被炸一次（ores）。
       3. 暴怒（血量剩一半）：全身發紅、變快；每次大壓頂之後會再連跳 combo.hops 下追著人壓，
          連跳完會累得陷在地上比較久（combo.tired 秒）——這是反擊的好時機。
   - 體型：一般葫蘆猴的 scale 倍（2 倍）。不會硬直、打不退、推不動（跟一般葫蘆猴一樣）。
   必須在 gourd-monkey.js、breakable-walls.js 之後、game.js 之前載入。
*/
const GOURD_KING = {
  name: '葫蘆猴王',
  // 哪張地圖、哪一面牆是 BOSS 牆：[牆左上角的欄, 列]（地圖編輯器裡那張「捷運高牆X6」圖章的位置）
  maps: { map_mvxz356e: { wall: [37, 13] } },   // R89區-捷運站：上方的隱藏牆
  scale: 2,                      // 體型：一般葫蘆猴的幾倍
  hp: 3600,                      // 血量（再乘整體難度）
  atk: 1.6,                      // 攻擊力：一般葫蘆猴的幾倍（壓到溫特、隊友、建築）
  speedMul: 1.1,                 // 拖行速度：一般葫蘆猴的幾倍
  rewardMul: 8, crystalMul: 8,   // 打倒給的經費、結晶：一般葫蘆猴的幾倍
  // ---- BOSS 牆：每撞一下換下一張圖，最後一張是撞破 ----
  wall: {
    stages: ['tile_mrt_room_highwallx6_crack_small', 'tile_mrt_room_highwallx6_crack_large',
      'tile_mrt_room_highwallx6_crack_large02', 'tile_mrt_room_highwallx6_breached'],
  },
  knock: {                       // 撞牆演出（index 0＝第 1 下 …… 3＝第 4 下撞破）
    delay: 2.2,                  // 核心醒來後幾秒開始撞第 1 下
    gaps: [3.4, 2.9, 2.4],       // 第 1→2、2→3、3→4 下之間隔幾秒（越撞越急）
    shake: [12, 15, 18, 24],     // 畫面搖晃強度（像素；一般攻擊最多 16，這裡可以更大）
    rumble: [.55, .7, .9, 1.6],  // 搖晃持續幾秒（慢慢變小；撞破那下最久）
    hitstop: [.03, .05, .07, .09],   // 撞到的瞬間畫面頓一下（秒，最多 .09）
    jitter: [4, 6, 8, 0],        // 牆本身抖幾像素
    pebbles: [12, 20, 30],       // 牆面掉下來的碎石（落在牆腳）
    ceiling: [5, 9, 14],         // 天花板掉下來的小碎石（落在牆前面幾格內）
    dust: [8, 13, 20],           // 牆腳揚起的灰塵團
    sift: [36, 60, 90],          // 沿著牆面往下灑的粉塵粒
    haze: [3, 6, 10],            // 牆前面飄著的灰濛濛粉塵（大團、慢慢散）
    chunks: [4, 8, 12],          // 從裂縫噴出來的碎石塊
    shakeRange: 30,              // 溫特離牆幾格以上，搖晃只剩 45%
  },
  breach: {                      // 撞破那一下的額外演出
    bursts: 5,                   // 洞口噴出幾團碎石
    smoke: 34,                   // 洞口冒出幾團大煙霧（會停留一陣子才散）
    smokeLife: [1.6, 2.6],       // 煙霧停留幾秒（短一點：葫蘆猴王踏出來亮相時要看得清楚）
    pebbles: 26,                 // 天花板跟著掉下來的碎石
    flash: .35,                  // 畫面泛起一層土色閃光（秒）
  },
  landing: {                     // 葫蘆猴王踏出來亮相那一下的額外演出
    shake: 22, rumble: 1.1,      // 搖晃強度、持續幾秒
    smoke: 22,                   // 落地四周捲起的大煙霧
    bursts: 3,                   // 額外噴出幾團碎石
  },
  emerge: {                      // 撞破後：先停一下（煙霧瀰漫、牆後傳來吼聲），再踏出來站在破洞門口亮相
    wait: 1.8,                   // 撞破後等幾秒才踏出來
    growl: .9,                   // 等待中第幾秒傳來吼聲
    hold: .4,                    // 「葫蘆猴王現身」橫幅消失後，再多站幾秒才開始攻擊
    // 亮相這段時間不會受傷（讓玩家看清楚長相；隊友先開槍也打不痛）
  },
  // ---- 巨型泰山壓頂：蓋過一般葫蘆猴的 GOURD 數值（沒寫的照 GOURD）----
  slam: {
    noticeRange: 14, loseRange: 40, hunt: true,   // hunt：看不到人時也會朝溫特拖過去（BOSS 知道你在哪）
    slamRange: 6, maxLeap: 7,
    crouch: .6, rise: .75, hang: .45, drop: .14, recover: 1.6, cooldown: 3,
    height: 200, track: 70,
    hitRadius: 140, knockRadius: 270, knockMax: 3.2, knockMin: 1.2, tossHeight: 70, tossMinHeight: 30,
    shakeMax: 16, shakeMin: 6, shakeRange: 22,
    crackScale: 2.2,             // 地裂圖放大幾倍
    markEvery: 14,
  },
  // ---- 天花板落石：每次大壓頂後掉下來 ----
  rocks: {
    count: 6, aimed: 2,          // 一次掉幾顆、其中幾顆瞄準我方站的地方（其他落在葫蘆猴王身邊）
    near: 2.5, far: 8,           // 沒瞄準的落在離葫蘆猴王幾～幾格
    delay: [.15, .7],            // 震完之後幾秒才開始掉（每顆不一樣）
    fall: 1.1,                   // 影子出現到砸下來幾秒（影子越來越深）
    height: 420,                 // 從多高掉下來（像素）
    radius: 30,                  // 砸到的範圍（像素）
    playerDamage: 14, sentryDamage: 18,
    monsterDamage: 60,           // 不分敵我：砸到怪物也會扣血（葫蘆猴王自己不會被砸）
    hitKing: false,              // true＝葫蘆猴王自己也會被落石砸到
    quick: 1,                    // 暴怒連跳的小壓頂：每下掉幾顆
  },
  // ---- 壓碎礦石：壓頂砸到的普通礦石 ----
  ores: {
    types: ['ore_coal', 'ore_tin', 'ore_limestone', 'ore_manganese'],   // 會被壓碎的礦（煤礦、錫礦、石灰岩、錳礦；data/ores.js 的 id）
    crushPad: .6,                // 落點圈外再多幾格內的礦：直接壓碎（不管多硬）
    shockCrack: true,            // 震波範圍內（沒被壓到）的礦：算被炸一次（照礦的硬度累積，炸夠次數才碎）
  },
  // ---- 暴怒（血量剩一半）----
  enrageAt: .5,
  enrage: { speed: 1.3 },        // 暴怒後走路變快幾倍
  combo: {                       // 暴怒後每次大壓頂之後追加的連跳
    hops: 2,                     // 追加幾下
    gap: .3,                     // 落地後幾秒再跳下一下
    crouch: .25, rise: .42, hang: .16, height: 130,   // 連跳的小壓頂：蓄力、升空、停住都比較短，跳比較低
    tired: 2.4,                  // 連跳完陷在地上喘氣幾秒
  },
};
// 撞破後可以走的格子（[第幾欄, 第幾列]，從牆左上角算）：全破的圖中間四欄都打通；第一格是洞口正中間（球球、提示用）
const GK_WALL_OPEN = [[2, 5], [3, 5], [1, 5], [4, 5]], GK_WALL_SOLID = [];
for (let r = 4; r >= 1; r--) GK_WALL_OPEN.push([1, r], [2, r], [3, r], [4, r]);
for (let r = 5; r >= 1; r--) GK_WALL_SOLID.push([0, r], [5, r]);
// 掛到可炸開牆的表上（js/breakable-walls.js）：BOSS 牆用這份規則，不用原本「捷運高牆X6（隱藏區）」那份
BREAKABLE_WALLS.gourd_king_wall = {
  stages: GOURD_KING.wall.stages, open: GK_WALL_OPEN, solid: GK_WALL_SOLID,
  pad: 1, hide: true, hideFrom: [2, 0], hideMax: 1500,
  boss: true,   // boss：爆炸炸不開、球球不標腳印
};
const gkSpot = () => typeof MAP !== 'undefined' && MAP ? GOURD_KING.maps[MAP.id] || null : null;
// js/breakable-walls.js 的 breakableWallSpec 呼叫：這個圖章是不是這張地圖的 BOSS 牆
function gourdKingWallSpec(s) {
  const spot = gkSpot();
  return spot && s.c === spot.wall[0] && s.r === spot.wall[1] && /^tile_mrt_room_highwallx6/.test(s.id) ? 'gourd_king_wall' : null;
}
// 葫蘆猴王壓頂用的數值：一般葫蘆猴的 GOURD 蓋上 slam；暴怒連跳的小壓頂再蓋上 combo
const GK_SLAM = Object.assign({}, GOURD, GOURD_KING.slam);
const GK_SLAM_QUICK = Object.assign({}, GK_SLAM, { crouch: GOURD_KING.combo.crouch, rise: GOURD_KING.combo.rise, hang: GOURD_KING.combo.hang, height: GOURD_KING.combo.height });
function gourdKingCfg(e) { return e.gm && e.gm.slam && e.gm.slam.quick ? GK_SLAM_QUICK : GK_SLAM; }
const gkRand = (a, b) => a + Math.random() * (b - a);
const gkAlive = e => !!(e && !e.dead && e.hp > 0 && G.enemies.includes(e));
function gkWallStamp() {
  const spot = gkSpot(); if (!spot || !MAP) return null;
  return (MAP.stamps || []).find(s => s.c === spot.wall[0] && s.r === spot.wall[1] && gourdKingWallSpec(s)) || null;
}
// 牆的位置（像素）：x0／x1 左右、top 牆頂、bottom 牆腳
function gkWallBox(s) {
  const c0 = s.c + Math.round((s.ox || 0) / CELL), r0 = s.r + Math.round((s.oy || 0) / CELL);
  return { c0, r0, x0: OX + c0 * CELL, x1: OX + (c0 + 6) * CELL, top: OY + r0 * CELL, bottom: OY + (r0 + 6) * CELL, cx: OX + (c0 + 3) * CELL };
}

// ---- 開場（game.js 在 newGame 裡呼叫，要在 setupBreakableWalls 之後）----
// G.gourdKing：{ stamp, phase: 'sleep'｜'knock'｜'breach'（撞破了、還沒踏出來）｜'out'｜'dead', t, hits, e }
function seedGourdKing() {
  G.gourdKing = null; G.gkRocks = []; G.gkSift = [];
  if (MAP_SAFE || (typeof practiceOn === 'function' && practiceOn())) return;
  const s = gkWallStamp(); if (!s) return;
  G.gourdKing = { stamp: s, phase: 'sleep', t: 0, hits: 0, e: null, jitter: 0, jitterT: 0 };
  const base = ACTIVE_MONSTERS.find(m => m.id === 'gourd_monkey');
  if (base) [base.sprite, GOURD.art.squash, GOURD.art.tall].forEach(monsterImage);   // 先載好圖，踏出來那一下才不會閃空白
  GOURD_KING.wall.stages.forEach(id => { const t = mapTileById(id); if (t && typeof tileImage === 'function') tileImage(t); });
}

// ---- 每幀（gourd-monkey.js 的 updateGourd 呼叫）----
function updateGourdKing(dt) {
  updateGkRocks(dt); updateGkSift(dt);
  const Rb = G.gkRumble;
  if (Rb && Rb.t > 0) { Rb.t -= dt; const k = Math.max(0, Rb.t / Rb.dur); shakeAmt = Math.max(shakeAmt, Rb.amt * (.35 + .65 * k) * (k > 0 ? 1 : 0)); }
  if (G.gkFlash && (G.gkFlash.t -= dt) <= 0) G.gkFlash = null;
  const K = G.gourdKing; if (!K || !G.running || G.over) return;
  if (K.jitterT > 0) K.jitterT -= dt;
  if (K.phase === 'sleep') {
    if ((G.cores || []).some(c => c.awake && !c.dead)) { K.phase = 'knock'; K.t = GOURD_KING.knock.delay; }   // 核心醒了：開始撞牆
    return;
  }
  if (K.phase === 'knock') {
    K.t -= dt;
    if (K.t > 0) return;
    K.hits++;
    gkWallHit(K, K.hits);
    if (K.hits >= GOURD_KING.wall.stages.length) { K.phase = 'breach'; K.t = GOURD_KING.emerge.wait; K.growled = false; }   // 撞破了：先停一下才踏出來
    else K.t = GOURD_KING.knock.gaps[K.hits - 1] ?? 1.5;
    return;
  }
  if (K.phase === 'breach') {   // 煙霧瀰漫，牆後傳來吼聲，地面微微震著
    K.t -= dt;
    const box = gkWallBox(K.stamp), E = GOURD_KING.emerge;
    if (!K.growled && K.t <= E.wait - E.growl) {
      K.growled = true;
      gkSound('gourdLaugh', box.cx, box.bottom, 1.1);
      gkRumble(box.cx, box.bottom, 7, .8);
      for (let k = 0; k < 6; k++) gkPebble(box.cx + gkRand(-3, 3) * CELL, box.bottom + gkRand(0, 3) * CELL, gkRand(200, 320), .9);
    }
    if (K.t <= 0) { K.phase = 'out'; gkEmerge(K); }
  }
}

// ---- 撞牆一下：換裂痕圖、畫面搖晃、牆抖、碎石、粉塵 ----
function gkWallHit(K, n) {
  const C = GOURD_KING.knock, s = K.stamp, box = gkWallBox(s), i = n - 1, last = n >= GOURD_KING.wall.stages.length;
  if (last) {
    if (typeof openBreakableWall === 'function') openBreakableWall(s, n); else G.wallStage.set(s, n);   // 打通、隱藏區顯現（js/breakable-walls.js）
  } else G.wallStage.set(s, n);
  gkRumble(box.cx, box.bottom, C.shake[i] || 8, C.rumble[i] || .5);
  addHitstop(C.hitstop[i] || 0);
  K.jitter = C.jitter[i] || 0; K.jitterT = .4;
  // 聲音：撞擊聲越來越大；離得遠也聽得到一點（悶悶的）
  gkSound('gourdSlam', box.cx, box.bottom, .7 + .15 * n);
  if (last) { gkSound('bigBoom', box.cx, box.bottom, .9); gkSound('gourdLandCry', box.cx, box.bottom, 1); }
  if (n === 1) systemNotice('⚠ 牆後面傳來沉重的撞擊聲……', true);
  if (n === 3) systemNotice('⚠ 牆快要撐不住了！', true);
  const W = box.x1 - box.x0;
  if (!last) {
    for (let k = 0; k < (C.pebbles[i] || 0); k++)   // 牆面掉下來的碎石：從牆上不同高度掉到牆腳
      gkPebble(box.x0 + gkRand(.08, .92) * W, box.bottom + gkRand(4, 22), gkRand(30, (box.bottom - box.top) * .85), .8 + .1 * n);
    for (let k = 0; k < (C.ceiling[i] || 0); k++)   // 天花板掉下來的小碎石：落在牆前面幾格內
      gkPebble(box.cx + gkRand(-5, 5) * CELL, box.bottom + gkRand(.5, 5) * CELL, gkRand(260, 360), .7);
    for (let k = 0; k < (C.dust[i] || 0); k++) {   // 牆腳揚起的灰塵團
      const x = box.x0 + gkRand(.05, .95) * W;
      (G.gourdDust = G.gourdDust || []).push({ x, y: box.bottom + gkRand(0, 10), vx: gkRand(-30, 30), vy: gkRand(8, 30), r0: gkRand(10, 16), r1: gkRand(30, 46) + n * 4, life: 0, life0: gkRand(1, 1.6), shade: Math.random() });
      G.gourdDust[G.gourdDust.length - 1].life = G.gourdDust[G.gourdDust.length - 1].life0;
    }
    for (let k = 0; k < (C.sift[i] || 0); k++)   // 沿著牆面往下灑的粉塵：從牆頂、裂縫附近往下飄落
      G.gkSift.push({ x: box.x0 + gkRand(.05, .95) * W, y: box.top + gkRand(.15, .7) * (box.bottom - box.top), vx: gkRand(-6, 6), vy: gkRand(10, 40), r: gkRand(1, 2.4), life: 0, life0: gkRand(1, 1.8), floor: box.bottom + gkRand(0, 12) });
    for (const g of G.gkSift) if (g.life === 0) g.life = g.life0;
    for (let k = 0; k < (C.haze[i] || 0); k++)   // 牆前面飄著的灰濛濛粉塵
      gkSmoke(box.x0 + gkRand(0, 1) * W, box.bottom + gkRand(-.5, 2.5) * CELL, gkRand(50, 80), gkRand(1.6, 2.6), 14);
    rockBurstFx(box.cx, box.bottom - 4, { rocks: C.chunks[i] || 0, speed: [40, 120], up: [90, 200], dust: 2 + n, dustRise: n, size: .9 + .15 * n, spread: 30 });   // 裂縫噴出碎石塊
  } else {
    // 撞破：大量碎石、灰塵往外噴（js/gourd-monkey.js 的 rockBurstFx），洞口冒出大團煙霧、天花板跟著掉石頭
    const Bk = GOURD_KING.breach;
    for (let k = 0; k < Bk.bursts; k++) rockBurstFx(box.cx + (k / (Bk.bursts - 1) - .5) * 4 * CELL, box.bottom - gkRand(0, 60), { rocks: 18, speed: [90, 260], up: [160, 360], dust: 10, dustRise: 5, size: 1.6, spread: 30 });
    for (let k = 0; k < Bk.pebbles; k++) gkPebble(box.cx + gkRand(-7, 7) * CELL, box.bottom + gkRand(.5, 7) * CELL, gkRand(260, 420), 1.2);
    for (let k = 0; k < Bk.smoke; k++) {   // 煙霧：從洞口往外、往前翻滾出來，停留一陣子才散
      const a = gkRand(.15, Math.PI - .15), sp = gkRand(30, 140);
      gkSmoke(box.cx + gkRand(-2, 2) * CELL, box.bottom - gkRand(0, 3) * CELL, gkRand(60, 110), gkRand(Bk.smokeLife[0], Bk.smokeLife[1]), 0, Math.cos(a) * sp, Math.sin(a) * sp * .7);
    }
    G.effects.push({ ring: true, x: box.cx, y: box.bottom, r: 10, r2: 260, life: .6, life0: .6, color: '#b49a6c' });
    G.effects.push({ ring: true, x: box.cx, y: box.bottom, r: 6, r2: 160, life: .4, life0: .4, color: '#efe0b8' });
    G.gkFlash = { t: Bk.flash, t0: Bk.flash };
  }
}
// 一大團慢慢散開的煙霧（跟葫蘆猴落地的灰塵團共用：js/gourd-monkey.js 的 G.gourdDust）；spread＝出現位置的隨機範圍
function gkSmoke(x, y, r1, life, spread = 0, vx = gkRand(-12, 12), vy = gkRand(-10, 6)) {
  const d = { x: x + gkRand(-spread, spread), y: y + gkRand(-spread, spread) * .5, vx, vy, r0: r1 * .35, r1, life, life0: life, shade: Math.random() };
  (G.gourdDust = G.gourdDust || []).push(d);
}
// 持續的強烈搖晃：amt 像素，dur 秒內慢慢變小（js/attack-fx.js 的 shakeAmt；一般 addShake 最多 16，這裡可以更大）
function gkRumble(x, y, amt, dur) {
  const p = G.player, d = p ? Math.hypot(p.x - x, p.y - y) / CELL : 0;
  const k = Math.max(.45, 1 - d / GOURD_KING.knock.shakeRange);
  G.gkRumble = { amt: amt * k, t: dur, dur };
  shakeAmt = Math.max(shakeAmt, amt * k);
}
// 一顆從高處掉下來的小石頭（跟葫蘆猴落地的石礫共用：js/gourd-monkey.js 的 G.gourdRocks，落地會彈、會滾）
function gkPebble(x, y, z, size = 1) {
  const pts = [], n = 5 + (Math.random() < .5 ? 1 : 0), sz = (Math.random() < .3 ? gkRand(4, 6.5) : gkRand(2, 4)) * size;
  for (let k = 0; k < n; k++) { const t = k / n * Math.PI * 2; pts.push([Math.cos(t) * sz * gkRand(.65, 1.1), Math.sin(t) * sz * gkRand(.55, 1)]); }
  (G.gourdRocks = G.gourdRocks || []).push({ x, y, z, vx: gkRand(-20, 20), vy: gkRand(-4, 14), vz: gkRand(-20, 30), spin: gkRand(-10, 10), rot: Math.random() * 6,
    pts, col: GM_ROCK_COLORS[Math.floor(Math.random() * GM_ROCK_COLORS.length)], life: gkRand(2.2, 3.2), bounces: 0 });
}
// 畫面搖晃：離得越遠越小，但不會完全沒有（整個捷運站都在震）
function gkShake(x, y, amt) {
  const p = G.player, d = p ? Math.hypot(p.x - x, p.y - y) / CELL : 0;
  addShake(amt * Math.max(.35, 1 - d / GOURD_KING.knock.shakeRange));
}
function gkSound(name, x, y, gain) {
  if (typeof SFX === 'undefined' || !G.player) return;
  const d = Math.hypot(x - G.player.x, y - G.player.y) / CELL;
  SFX.play(name, gain * (d <= 4 ? 1 : Math.max(.3, 1 - (d - 4) / 30)), name + ':gourd-king');
}
// 牆抖動（js/maploader.js 畫圖章時呼叫）：回傳 [dx, dy] 或 null
function gourdKingWallJitter(s) {
  const K = typeof G !== 'undefined' && G && G.gourdKing;
  if (!K || K.stamp !== s || !(K.jitterT > 0) || !K.jitter) return null;
  const a = K.jitter * K.jitterT / .4;
  return [(Math.random() * 2 - 1) * a, (Math.random() * 2 - 1) * a * .5];
}

// ---- 撞破：葫蘆猴王踏出來，站在破洞門口亮相；「現身」橫幅播完才開始攻擊 ----
function gkEmerge(K) {
  const B = GOURD_KING, base = ACTIVE_MONSTERS.find(m => m.id === 'gourd_monkey'); if (!base) return;
  const box = gkWallBox(K.stamp);
  const sx = box.cx, sy = OY + (box.r0 + 5.5) * CELL;   // 破洞最下排（牆腳）：整隻站在牆前面，看得清楚
  const e = createMonster(base, sx, sy);
  e.gourdKing = true; e.eliteName = B.name; e.eliteAwake = false;
  e.hp = e.maxhp = Math.round(e.maxhp / base.hp * B.hp);
  e.reward = Math.round((e.reward || 0) * B.rewardMul); e.crystals = Math.round((e.crystals ?? 5) * B.crystalMul);
  e.drawWidth = Math.round(base.width * B.scale); e.drawHeight = Math.round(base.height * B.scale);
  e.speed = base.speed * B.speedMul;
  for (const k of ['playerDamage', 'sentryDamage', 'buildingDamage']) if (e[k] != null) e[k] = Math.round(e[k] * B.atk);
  e.knockMul = 0; e.staggerTime = 0; e.unpushable = true; e.noHitSquash = true; e.wide = true; e.noStun = true;
  e.alertT = typeof ENEMY_ALERT_TIME !== 'undefined' ? ENEMY_ALERT_TIME : 1;
  e.faceRight = !!(G.player && G.player.x > sx);
  e.gm = { cd: 0, wait: 0, pulse: 0, laughCd: 0 };
  e.forceFrame = null;   // 正面站姿
  e.gkIntroT = (typeof CORE_FRENZY !== 'undefined' ? CORE_FRENZY.banner : 3.2) + B.emerge.hold;   // 亮相幾秒（橫幅播完＋hold）
  e.gkIntroHp = e.hp;
  G.enemies.push(e);
  K.e = e;
  // 踏出來那一下：重震、捲起煙霧和碎石、吼叫，大橫幅「葫蘆猴王現身」
  gkLandingFx(e);
  gkSound('gourdLandCry', e.x, e.y, 1.1);
  if (typeof coreBanner === 'function') coreBanner(B.name + '現身', '撞破牆壁衝出來了！', '#e8c27a');
  systemNotice('⚠ ' + B.name + '撞破牆壁衝出來了！', true);
  e.gkLaughT = 1.2;   // 踏出來後幾秒得意地笑一聲
}
// 附近一格怪物站得下的地方（要夠寬）
function gkFreeSpot(x, y) {
  const [gc, gr] = cellAt(x, y);
  for (let rad = 0; rad <= 4; rad++) for (let dr = -rad; dr <= rad; dr++) for (let dc = -rad; dc <= rad; dc++) {
    if (Math.max(Math.abs(dc), Math.abs(dr)) !== rad) continue;
    const c = gc + dc, r = gr + dr;
    if (!inGrid(c, r) || isWall(c, r) || !enemyWideAt(c, r)) continue;
    const [px, py] = center(c, r);
    if (!enemyBlocked(px, py)) return { x: px, y: py };
  }
  return null;
}

// ---- 行為（enemy-ai.js 的 stepEnemy 呼叫）：基本上就是一般葫蘆猴（數值換成 GK_SLAM），加上暴怒連跳 ----
function stepGourdKing(e, dt) {
  const B = GOURD_KING, g = e.gm;
  if (e.gkIntroT > 0) {   // 亮相中：站在門口不動、不會受傷，面向溫特
    e.gkIntroT -= dt; e.hp = Math.max(e.hp, e.gkIntroHp); e.moving = false; e.forceFrame = null;
    if (e.gkLaughT > 0 && (e.gkLaughT -= dt) <= 0 && typeof gourdLaugh === 'function') gourdLaugh(e, true);
    if (G.player) e.faceRight = G.player.x > e.x;
    if (e.gkIntroT <= 0) gkWake(e);
    return;
  }
  if (!e.gkEnraged && e.hp <= e.maxhp * B.enrageAt) gkEnrage(e);
  if (g && g.comboLeft > 0 && !g.slam && !(g.recover > 0)) {   // 暴怒連跳：落地喘一下就追著人再跳
    const t = gkComboTarget(e);
    if (t) { gourdStartSlam(e, t, t); g.slam.quick = true; }
    else { g.comboLeft = 0; g.recover = B.combo.tired; }
  }
  stepGourdEnemy(e, dt);
}
function gkComboTarget(e) {
  const g = e.gm;
  if (g.target && g.target.hp > 0 && Math.hypot(g.target.x - e.x, g.target.y - e.y) <= GK_SLAM.maxLeap * CELL * 1.6) return g.target;
  return gmPickTarget(e);
}
// gourd-monkey.js 的 gourdImpact 最後呼叫：每次砸下來之後
function gourdKingImpact(e, quick) {
  const B = GOURD_KING, g = e.gm;
  gkCrushOres(e);
  gkDropRocks(e, quick ? B.rocks.quick : B.rocks.count);
  if (!e.gkEnraged) return;
  // 暴怒：大壓頂之後追加連跳；連跳完累得陷在地上比較久
  if (!quick) g.comboLeft = B.combo.hops; else g.comboLeft = Math.max(0, (g.comboLeft || 0) - 1);
  if (g.comboLeft > 0) { g.recover = B.combo.gap; g.cd = 0; }
  else if (quick) g.recover = B.combo.tired;
}
function gkLandingFx(e) {
  const L = GOURD_KING.landing;
  gkRumble(e.x, e.y, L.shake, L.rumble);
  addHitstop(.09);
  for (let k = 0; k < L.bursts; k++) rockBurstFx(e.x + gkRand(-1.5, 1.5) * CELL, e.y + 10, { rocks: 16, speed: [100, 260], up: [160, 340], dust: 10, dustRise: 4, size: 1.5, spread: 40 });
  for (let k = 0; k < L.smoke; k++) {   // 四周捲起的大煙霧：往外滾開
    const a = k / L.smoke * Math.PI * 2 + gkRand(-.2, .2), sp = gkRand(60, 150);
    gkSmoke(e.x + Math.cos(a) * 40, e.y + 10 + Math.sin(a) * 18, gkRand(55, 95), gkRand(1.8, 3), 0, Math.cos(a) * sp, Math.sin(a) * sp * .45);
  }
  G.effects.push({ ring: true, x: e.x, y: e.y + 12, r: 20, r2: 340, life: .7, life0: .7, color: '#8f7b56' });
}
// 亮相結束：BOSS 戰開始（血條、音樂），馬上可以壓頂
function gkWake(e) {
  e.eliteAwake = true; e.gkIntroT = 0;
  e.gm.cd = 0; e.gm.laughCd = 0;
  if (typeof gourdLaugh === 'function') gourdLaugh(e, true);
}
function gkEnrage(e) {
  e.gkEnraged = true;
  e.speed *= GOURD_KING.enrage.speed;
  if (typeof coreBanner === 'function') coreBanner(GOURD_KING.name + '暴怒了', '落地後會連續追著人壓！', '#ff6a4a');
  systemNotice('⚠ ' + GOURD_KING.name + '暴怒了！', true);
  G.effects.push({ ring: true, x: e.x, y: e.y, r: 10, r2: 160, life: .55, life0: .55, color: '#ff5a3a' });
  gkShake(e.x, e.y, 8);
  if (typeof gourdLaugh === 'function') gourdLaugh(e, true);
}

// ---- 壓碎礦石：落點圈裡的直接壓碎；震波範圍裡的算被炸一次（用 js/ore.js 的 breakOre／blastHitOre，碎掉的石塊、聲音都跟炸開一樣）----
function gkCrushOres(e) {
  const O = GOURD_KING.ores, C = gmCfg(e);
  if (typeof breakOre !== 'function') return;
  for (const o of [...(G.obstacles || [])]) {
    if (!o.ore || o.hp <= 0 || !O.types.includes(o.type)) continue;
    const c = oreCenter(o), d = Math.hypot(c.x - e.x, (c.y - e.y) / .6);   // 落點圈是扁的：上下距離放大來算
    if (d <= C.hitRadius + O.crushPad * CELL) breakOre(o, e.x, e.y);
    else if (O.shockCrack && d <= C.knockRadius && typeof blastHitOre === 'function') blastHitOre(o, e.x, e.y);
  }
}
// ---- 天花板落石：先出現影子，影子越來越深，時間到砸下來 ----
function gkDropRocks(e, n) {
  const R = GOURD_KING.rocks, foes = [G.player, ...(G.towers || [])].filter(a => a && a.hp > 0 && (typeof sameFloor !== 'function' || sameFloor(e, a)));
  for (let i = 0; i < n; i++) {
    let x, y;
    const aim = i < R.aimed && foes.length ? foes[Math.floor(Math.random() * foes.length)] : null;
    for (let k = 0; k < 8; k++) {
      if (aim) { x = aim.x + gkRand(-18, 18); y = aim.y + gkRand(-10, 10); }
      else { const a = Math.random() * Math.PI * 2, d = gkRand(R.near, R.far) * CELL; x = e.x + Math.cos(a) * d; y = e.y + Math.sin(a) * d * .8; }
      const [c, r] = cellAt(x, y);
      if (inGrid(c, r) && !isWall(c, r)) break;
      x = null;
    }
    if (x == null) continue;
    G.gkRocks.push({ x, y, t: -gkRand(R.delay[0], R.delay[1]), seed: Math.random() * 9, size: gkRand(.9, 1.3) });
  }
}
function updateGkRocks(dt) {
  if (!G.gkRocks || !G.gkRocks.length) return;
  const R = GOURD_KING.rocks;
  for (const k of G.gkRocks) {
    k.t += dt;
    if (k.hit || k.t < R.fall) continue;
    k.hit = true;   // 砸下來了
    rockBurstFx(k.x, k.y, { rocks: 7, speed: [40, 120], up: [90, 180], dust: 4, dustRise: 1, size: .8 * k.size, spread: 10 });
    G.effects.push({ ring: true, x: k.x, y: k.y, r: 4, r2: R.radius * 1.3, life: .3, life0: .3, color: '#a8936c' });
    if (typeof nearbyImpact === 'function') nearbyImpact(k.x, k.y, 4, 0);
    if (typeof sfxAt === 'function') sfxAt('gourdTossLand', k.x, k.y, .5, 'gk-rock');
    const p = G.player;
    if (p && p.hp > 0 && Math.hypot(p.x - k.x, p.y - k.y) <= R.radius + 10 && !(typeof hurtGraceBlocked === 'function' && hurtGraceBlocked(p))) {
      const dmg = Math.round(typeof equipPlayerDamage === 'function' ? equipPlayerDamage(R.playerDamage) : R.playerDamage);
      p.hp = Math.max(0, p.hp - dmg); p.hitT = .35; p.underAttackT = 5;
      G.damageVignetteT = .4; flashDmg('-' + dmg, p.x, p.y - 46, '#ff6b6b'); playPlayerHit(1, true);
      if (p.hp <= 0 && !G.over) { flash('部隊長失去戰鬥能力', p.x, p.y - 58, '#ff5b6e'); lose('player', '被落石砸中'); }
    }
    for (const t of G.towers || []) {
      if (t.hp <= 0 || Math.hypot(t.x - k.x, t.y - k.y) > R.radius + 8 || (typeof hurtGraceBlocked === 'function' && hurtGraceBlocked(t))) continue;
      const dmg = R.sentryDamage * (1 - sentryDefense(t));
      t.hp = Math.max(0, t.hp - dmg); t.hitT = Math.max(t.hitT || 0, .25);
      flash('-' + Math.round(dmg), t.x, t.y - 30, '#ff8f8f');
      if (t.hp <= 0) { t.target = null; sentryStatus(t, '失去戰鬥能力', '#ff5b6e', true); }
    }
    // 不分敵我：怪物也會被砸到（倒下的結算在 game.js 統一處理）
    for (const m of G.enemies || []) {
      if (m.dead || m.hp <= 0 || (m.gourdKing && !R.hitKing) || Math.hypot(m.x - k.x, m.y - k.y) > R.radius + (m.drawWidth || 40) * .25) continue;
      if (typeof burrowUnderground === 'function' && burrowUnderground(m)) continue;   // 鑽在地底的老鼠砸不到
      m.hp -= R.monsterDamage; m.hitT = .2; m.hitColor = '#c8b590';
      flashDmg('-' + R.monsterDamage, m.x, m.y - 26, '#e0c890');
      if (typeof enemyHitReact === 'function') enemyHitReact(m, k.x, k.y, true);
    }
  }
  G.gkRocks = G.gkRocks.filter(k => !k.hit || k.t < R.fall + .05);
}
// 沿著牆面往下灑的粉塵：往下飄、到牆腳就散掉
function updateGkSift(dt) {
  if (!G.gkSift || !G.gkSift.length) return;
  for (const g of G.gkSift) { g.life -= dt; g.vy += 60 * dt; g.x += g.vx * dt; g.y += g.vy * dt; if (g.y >= g.floor) { g.y = g.floor; g.vy = 0; g.vx *= .9; } }
  G.gkSift = G.gkSift.filter(g => g.life > 0);
}

// ---- 畫面（gourd-monkey.js 的 drawGourdGround／drawGourdTop 最後呼叫）----
// 地面：落石的影子（越來越大、越來越深）
function drawGourdKingGround(ctx) {
  if (!G.gkRocks || !G.gkRocks.length) return;
  const R = GOURD_KING.rocks;
  ctx.save();
  for (const k of G.gkRocks) {
    if (k.t < 0 || k.hit || (typeof isVisible === 'function' && !isVisible(k.x, k.y))) continue;
    const u = Math.min(1, k.t / R.fall), r = R.radius * (.45 + .55 * u) * k.size;
    ctx.globalAlpha = .15 + .45 * u; ctx.fillStyle = '#120c08';
    ctx.beginPath(); ctx.ellipse(k.x, k.y, r, r * .45, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = .35 + .4 * u; ctx.strokeStyle = u > .75 && Math.sin(k.t * 40) > 0 ? '#ffd2c4' : '#ff8665'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(k.x, k.y, R.radius * k.size, R.radius * .45 * k.size, 0, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
}
// 上層：正在掉下來的石頭、沿著牆面灑下的粉塵
function drawGourdKingTop(ctx) {
  const R = GOURD_KING.rocks;
  ctx.save();
  if (G.gkFlash && typeof cam !== 'undefined') {
    const k = G.gkFlash.t / G.gkFlash.t0;
    ctx.globalAlpha = .45 * k; ctx.fillStyle = '#f2e2c0';
    ctx.fillRect(cam.x - 200, cam.y - 200, 4000, 3000);
    ctx.globalAlpha = 1;
  }
  for (const k of G.gkRocks || []) {
    if (k.t < R.fall * .35 || k.hit || (typeof isVisible === 'function' && !isVisible(k.x, k.y))) continue;
    const u = (k.t - R.fall * .35) / (R.fall * .65), z = R.height * (1 - u * u), s = 9 * k.size;
    ctx.globalAlpha = 1; ctx.save(); ctx.translate(k.x, k.y - z); ctx.rotate(k.seed + k.t * 4);
    ctx.beginPath();
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2, rr = s * (.75 + .3 * Math.sin(k.seed * 7 + i * 2.3)); i ? ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    ctx.closePath(); ctx.fillStyle = '#8a7f70'; ctx.fill(); ctx.strokeStyle = '#3b352e'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.restore();
  }
  for (const g of G.gkSift || []) {
    const a = Math.min(1, g.life / .5) * Math.min(1, (g.life0 - g.life) / .15) * .7;
    ctx.globalAlpha = a; ctx.fillStyle = '#d8ccb4';
    ctx.beginPath(); ctx.arc(g.x, g.y, g.r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}
// 暴怒：身上泛紅光（js/render.js 畫怪物之前沒有現成的掛勾，這裡畫在腳下）
function drawGourdKingAuras(ctx) {
  const now = performance.now() / 1000;
  for (const e of G.enemies || []) {
    if (!e.gourdKing || !e.gkEnraged || e.hp <= 0 || e.dead) continue;
    const k = .6 + .4 * Math.sin(now * 7), w = (e.drawWidth || 260) * .5;
    ctx.save(); ctx.globalAlpha = .28 * k;
    const g = ctx.createRadialGradient(e.x, e.y + 8, 0, e.x, e.y + 8, w);
    g.addColorStop(0, 'rgba(255,70,40,1)'); g.addColorStop(1, 'rgba(255,70,40,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(e.x, e.y + 8, w, w * .45, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
}

// ---- 倒下（combat-feel.js 的 onEnemyDeath 呼叫）----
function gourdKingDown(e) {
  if (G.gourdKing) G.gourdKing.phase = 'dead';
  systemNotice(GOURD_KING.name + '倒下了！', true);
  if (typeof coreBanner === 'function') coreBanner(GOURD_KING.name + '倒下了', '', '#e8c27a');
  if (typeof nearbyImpact === 'function') nearbyImpact(e.x, e.y, 12, .1);
}
// ---- BOSS 血條（js/core-frenzy.js）、中BOSS 音樂（js/boss-music.js）----
function gourdKingBars() {
  const K = G && G.gourdKing, e = K && K.e;
  if (!gkAlive(e) || !e.eliteAwake) return [];
  return [{ label: GOURD_KING.name + (e.gkEnraged ? '（暴怒）' : ''), ratio: e.hp / e.maxhp, hit: e.hitT > 0, colors: ['#7a5a2e', '#e8c27a'], frame: '#d9a94a', text: '#fff0d0' }];
}
const gourdKingHunting = () => { const K = G && G.gourdKing; return !!(K && gkAlive(K.e) && K.e.eliteAwake); };
