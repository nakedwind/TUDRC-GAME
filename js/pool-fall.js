/* ===== 不小心掉進深水：搖晃 → 掉下去（水柱、水花）→ 在水裡掙扎（溺水）=====
   有畫 🛟 深水區、而且現在是深水的地圖才有（池核、W118區 地下水池）。溫特和隊員都會掉。
   怎麼會掉下去：
     ① 太靠近水邊走路：溫特身體中心離深水 edgeNear 點以內在走動，每秒有 edgeRate 的機率失足；
        隊員走在緊貼深水的那一格（allyEdgeNear）時，每秒 allyRate 的機率失足
     ② 硬要往深水走：溫特一直往深水的方向走、被擋住超過 pushSecs 秒（頭上的「好像可以用泳圈做點什麼……」不理它）
   掉下去的過程：
     搖晃（wobble）：原地左右晃、頭上說一句（對話編輯器的「掉進水池」poolFall；溫特沒填就用 POOL_FALL.winterSay）
     → 掉下去（fall）：往深水裡跳一小段弧線，落水的那一刻噴起水柱＋水花＋水波
     → 掙扎（struggle）：泡在水裡載浮載沉、左右搖擺、不斷濺起小水花，臉換成 >< 的表情
        （圖是各角色資料夾裡手畫的 *_drown.png，有哪些角色寫在 js/game.js 的 DROWN_FACE_FOLDERS），
        溫特：慌張一下之後，玩家自己用方向鍵控制往哪游（POOL_FALL.playerSwim、swimMul）；隊員：自動往最近的岸邊游（js/pool-tide.js 的 poolDrownFlee）；
        跟漲潮溺水一樣每秒扣血、會喊溺水的台詞
   泳圈：
     ・隊員有自己的游泳圈（t.ownRing）：掙扎 ringDelay 秒後自動戴上
     ・溫特：要按互動鍵（空白鍵／Enter）才會戴上（js/swim-ring.js 的 useSwimRingNearPlayer，腳下有「空白鍵／使用救生圈」）
   游到岸上、戴上泳圈、水被抽乾，掙扎就結束。
   漲潮溺水（js/pool-tide.js）也用同一套掙扎的畫法。 */
const POOL_FALL = {
  edgeNear: 18,         // 溫特身體中心離深水幾點以內算「太靠近水邊」：要比「貼著水邊走時離水多遠」大才算得到（池核有些岸邊約 5 點，W118 大部分岸邊被擋在 16 點，以前設 10 在 W118 永遠不會腳滑）
  edgeRate: .12,        // 溫特太靠近水邊走動時，每秒失足的機率（.12 ≈ 貼著水邊走 8 秒左右會掉一次）
  allyEdgeNear: 22,     // 隊員身體中心離深水幾點以內算太靠近（隊員走在格子中間，緊貼深水那一格大約 20 點）
  allyRate: .04,        // 隊員太靠近水邊走動時，每秒失足的機率
  pushSecs: .6,         // 溫特一直往深水走、被擋住幾秒就會掉下去
  cooldown: 8,          // 爬上岸之後幾秒內不會再失足（秒）
  wobbleSecs: .8,       // 搖晃多久才掉下去
  wobbleAmp: .22,       // 搖晃的幅度（弧度，.22 ≈ 13 度）：越晃越大
  wobbleSpeed: 9,       // 搖晃的快慢（9 ≈ 0.7 秒晃一個來回，像站不穩；太快會像在發抖）
  fallSecs: .38,        // 從岸邊掉進水裡要幾秒
  fallLift: 16,         // 掉下去時往上彈多高（點）
  fallIn: 52,           // 落水點離原本站的地方多遠（點）：往深水裡面掉；那裡不是深水就慢慢縮短
  panicSecs: 1.2,       // 剛落水先原地慌張掙扎幾秒，才開始往岸邊游（溫特：這段時間按方向鍵也不會動）
  playerSwim: true,     // 溫特掉進水裡：true＝玩家自己用方向鍵控制往哪游；false＝自動游到最近的岸邊
  swimMul: .2,          // 溫特自己游的速度＝走路速度的幾倍（.2 ≈ 每秒 46 點，大約一秒一格）
  ringDelay: 1,         // 隊員有游泳圈：掙扎幾秒後自動戴上
  sink: .3,             // 掙扎時水面在身體的哪裡（0＝腳底、1＝頭頂；角色是大頭比例，.3 ≈ 到胸口，眼睛在 .44 左右要露出來）
  see: .35,             // 水面下的身體看得多清楚（0～1）
  bobAmp: 4,            // 載浮載沉：上下多少點
  bobSpeed: 5.5,        // 上下的快慢
  swayAmp: .16,         // 左右搖擺的角度（弧度）
  swaySpeed: 3.4,       // 左右搖擺的快慢
  flailSecs: .16,       // 掙扎的兩張圖（手揮來揮去）多久換一張
  splashGap: [.22, .45],   // 掙扎時隔幾秒濺一次小水花
  dropSplash: .275,        // 溫特右鍵抓起隊友丟進水裡時，落水水花的大小（1＝跟自己失足掉下去一樣大）
  // 漂在水上載浮載沉（共用：陣亡在深水裡的隊員用倒地圖漂著、丟進深水的道具；水被抽乾就照常躺在地上）（poolFloatPose）
  float: { sink: .3, see: .35, bobAmp: 2.5, bobSpeed: 1.8, swayAmp: .05, swaySpeed: 1.1,   // 水面在身體的哪裡、水面下看得多清楚、上下浮沉幾像素、浮沉多快、左右晃幾度（弧度）、晃多快
    itemSink: .35, itemBob: .6,   // 道具：水面在道具圖的哪裡（從底部算）、浮沉幅度是上面的幾倍（道具比較小）
    ripple: { speed: .45, rings: 3, grow: 1.4, alpha: .55, noBase: true } },   // 身體四周的水波紋：一秒擴散幾輪（.45＝約 2.2 秒一輪）、同時幾圈、擴到原本的幾倍大、最濃多濃、noBase＝不畫固定的那一圈（只有往外擴散的）
  bigSplash: { drops: 22, column: 14, up: 230, spread: 120, width: 46 },   // 落水的大水花：水滴數、水柱數、往上衝的速度、往旁邊噴的速度、範圍寬度
  smallSplash: { drops: 5, up: 120, spread: 55, width: 26 },               // 掙扎時的小水花
  // 落水那一下的皇冠水花用第幾版：
  //   4＝第 4 版（第 2 版的杯子＋尖尖浪花、浪花散開時不往回縮；第 3 版的水滴散落和細水圈；第 1 版中間往上噴的水柱）
  //   3＝第 3 版（照 12 格示意圖：厚厚往外捲的浪頭、會破成水絲、最後剩細細的水圈）
  //   2＝第 2 版（一圈尖尖的浪花）、0＝不要皇冠水花（第 1 版）
  crownStyle: 4,
  // 第 4 版另外的數值（杯子大小用下面 crownV2 那一組）：破掉時甩出幾顆水滴、中間往上噴幾根水柱、細水圈第幾秒開始出現、要幾圈
  // 第 4 版另外的數值（杯子大小用下面 crownV2 那一組）：破掉時甩出幾顆水滴、中間往上噴幾根水柱、細水圈第幾秒開始出現、要幾圈、
  // 水滴的重力是平常的幾倍（越大掉得越乾脆，不會在最高點停一下；噴的高度會自動補回來，差不多一樣高）
  // headSize＝杯口浪花尾端那一小團的大小是原本的幾倍；rimWave＝杯口波浪狀凹凸的程度（0＝正正的扁圓、1＝現在、越大越歪）
  // band＝杯底水面上那圈白色水沫帶（第 3 版那種，一團團白沫加幾根小水柱），跟杯子水花一起出現、一起往外散、一起消失（false＝不要）
  crown4: { drops: 16, column: 14, rippleAt: .4, ripples: 2, gravity: 2.2, headSize: 2, rimWave: 1, band: true },
  // 第 3 版：杯口一開始多寬、最高多高（點）、播幾秒、整朵往外散開多少（.5＝最後寬出五成）、杯口左右高中間低的程度（0＝一樣高、.4＝中間矮四成）、破成幾條水絲、破掉時噴幾顆水滴
  crown: { width: 40, height: 42, life: 1.25, spread: .5, saddle: .5, tendrils: 5, drops: 16 },
  // 第 2 版：杯口一開始多寬、最高多高（點）、播幾秒、杯口幾根浪花尖、往外散開多少、杯子塌下去時白沫再往外漂多少
  crownV2: { width: 46, height: 40, life: .8, tips: 11, spread: .9, foamOut: .8 },
  crownColumn: 6,       // 第 2 版：有皇冠水花時，往上衝的水柱數改成這麼多（皇冠已經夠大一團，水柱少一點才不會糊在一起）
  sound: 'poolBossSplash', soundVol: .45,   // 落水的聲音（音效編輯器；先借池核 BOSS 的水花聲）
  winterSay: '哇、腳滑了——！',   // 溫特失足時說的話（對話編輯器的溫特「掉進水池」有填就用那邊的）
  saySecs: 1.8,
};

const poolFallRand = (a, b) => a + Math.random() * (b - a);
const poolFallOn = () => typeof deepWaterCells === 'function' && deepWaterCells().size > 0
  && !(typeof poolDeepIsDeep === 'function' && !poolDeepIsDeep());
// 這個人現在在不在掙扎（掉進水裡的、漲潮溺水的都算）
const poolStruggling = a => !!a && !a.swimRing && a.hp > 0 && (a.drowning || (a.poolFall && a.poolFall.phase === 'struggle'));

// 身體中心離最近的深水有多遠（點）；附近兩格都沒有深水＝Infinity
function poolFallEdgeDist(a) {
  if (typeof isDeepWaterCell !== 'function') return Infinity;
  const [c0, r0] = cellAt(a.x, a.y); let best = Infinity;
  for (let dc = -2; dc <= 2; dc++) for (let dr = -2; dr <= 2; dr++) {
    const c = c0 + dc, r = r0 + dr; if (!isDeepWaterCell(c, r)) continue;
    const x0 = OX + c * CELL, y0 = OY + r * CELL;
    const d = Math.hypot(Math.max(x0 - a.x, 0, a.x - (x0 + CELL)), Math.max(y0 - a.y, 0, a.y - (y0 + CELL)));
    if (d < best) best = d;
  }
  return best;
}
// 可不可以開始失足：在地上走、沒在做別的事
function poolFallCanStart(a) {
  if (!a || a.hp <= 0 || a.poolFall || a.swimRing || a.drowning || a.sitting || !poolFallOn()) return false;
  if (a.eatenBy || a.mrtRide || a.grabbed || a.vineCap || a.vineDazeT > 0 || a.poolJump || a.poolDownT > 0 || a.slipT > 0) return false;
  if (performance.now() < (a.poolFallCdUntil || 0)) return false;
  if (typeof poolPlatformAt === 'function' && poolPlatformAt(a.x, a.y)) return false;   // 站在救生台上
  if (typeof MAP_SAFE !== 'undefined' && MAP_SAFE) return false;
  return true;
}

// ---- 開始失足：搖晃，頭上說一句 ----
// 從 a 看過去，(x, y) 在哪個方向（right／left／front／back）
const poolFallDirTo = (a, x, y) => Math.abs(x - a.x) > Math.abs(y - a.y) ? (x < a.x ? 'left' : 'right') : (y < a.y ? 'back' : 'front');
function poolFallStart(a) {
  // 面向水（搖晃、掉下去的時候鎖住面向：別的程式會一直改 dir，圖在正面／側面之間亂換看起來像抽搐，見 poolFallFrame）
  const near = typeof deepWaterNearActor === 'function' ? deepWaterNearActor(a) : null;
  const dir = near ? poolFallDirTo(a, near.x, near.y) : (a.dir || 'front');
  a.poolFall = { phase: 'wobble', t: 0, dir }; a.dir = dir;
  a.moving = false; a.dashT = 0; a.navPath = null; a.target = null;
  const isPlayer = typeof G !== 'undefined' && G && a === G.player;
  const id = isPlayer ? (typeof PLAYER_CHARACTER !== 'undefined' ? PLAYER_CHARACTER : 'winter') : a.type;
  const line = (typeof pickDialogueLine === 'function' && pickDialogueLine(id, 'poolFall')) || (isPlayer ? POOL_FALL.winterSay : null);
  if (!line) return;
  if (isPlayer) a.poolSay = { text: line, until: performance.now() + POOL_FALL.saySecs * 1000 };   // 溫特頭上的泡泡（js/pool-tide.js 的 drawPoolTideBubble 畫）
  else if (!a.berserk) a.say = { text: line, life: POOL_FALL.saySecs };
}

// ---- 被推下水：被撞飛、被水沖開、滑倒的滑行途中撞到深水 → 直接掉下去（不搖晃）----
// js/bird-head.js 的 stepActorKnock 在滑行被擋住時呼叫：前面是深水就掉下去，回傳 true；不是深水（牆之類的）回傳 false，照舊停下來
// 誰會：溫特、隊員（坐泳圈、已經在水裡的不算）；剛爬上岸的冷卻不算（被推是被推，不是自己腳滑）；站在救生台上被撞下去也算
// ux、uy＝滑行的方向；nx、ny＝這一步本來要走到的位置
function poolFallKnockIn(a, ux, uy, nx, ny) {
  if (!a || typeof G === 'undefined' || !G || !poolFallOn()) return false;
  if (a !== G.player && !(G.towers || []).includes(a)) return false;
  if (a.hp <= 0 || a.poolFall || a.swimRing || a.drowning || a.sitting || a.eatenBy || a.mrtRide || a.grabbed || a.vineCap) return false;
  const ahead = (typeof PLAYER !== 'undefined' ? PLAYER.r : 14) + 4;
  if (!deepWaterAtPoint(nx + ux * ahead, ny + uy * ahead)) return false;   // 擋住的不是深水
  // 掉到哪裡：順著被推的方向往水裡 fallIn 點（四周都是深水的位置；不行就短一點；再不行就找最近的深水）
  const deepAround = (x, y, r) => [[0, 0], [r, 0], [-r, 0], [0, r], [0, -r]].every(([dx, dy]) => deepWaterAtPoint(x + dx, y + dy));
  let to = null;
  for (let d = POOL_FALL.fallIn; d >= 14 && !to; d -= 4) {
    for (const turn of [0, .3, -.3, .6, -.6]) {
      const c = Math.cos(turn), s = Math.sin(turn), vx = ux * c - uy * s, vy = ux * s + uy * c;
      if (deepAround(a.x + vx * d, a.y + vy * d, 12)) { to = { x: a.x + vx * d, y: a.y + vy * d }; break; }
    }
  }
  if (!to) to = poolFallTarget(a);
  if (!to) return false;
  a.knockT = 0; a.slipT = 0; a.slipDizzyT = 0; a.dashT = 0; a.moving = false; a.navPath = null; a.target = null; a.poolPushT = 0;
  const dir = poolFallDirTo(a, to.x, to.y);
  a.poolFall = { phase: 'fall', t: 0, dir, from: { x: a.x, y: a.y }, to, knocked: true }; a.dir = dir;
  return true;
}

// 搖晃完要掉到哪裡：往最近那格深水的方向，掉進去 fallIn 點（四周都是深水的位置；不行就短一點）
function poolFallTarget(a) {
  const spot = typeof deepWaterNearActor === 'function' ? deepWaterNearActor(a) : null; if (!spot) return null;
  const deepAround = (x, y, r) => [[0, 0], [r, 0], [-r, 0], [0, r], [0, -r]].every(([dx, dy]) => deepWaterAtPoint(x + dx, y + dy));
  let ux = spot.x - a.x, uy = spot.y - a.y; const len = Math.hypot(ux, uy) || 1; ux /= len; uy /= len;
  for (let d = POOL_FALL.fallIn; d >= 14; d -= 4) {
    for (const turn of [0, .35, -.35, .7, -.7]) {   // 正前方不行就稍微偏一點
      const c = Math.cos(turn), sn = Math.sin(turn), vx = ux * c - uy * sn, vy = ux * sn + uy * c;
      const x = a.x + vx * d, y = a.y + vy * d;
      if (deepAround(x, y, 12)) return { x, y };
    }
  }
  return { x: spot.x, y: spot.y };
}

// ---- 水花 ----（畫在 G.poolSplash，跟池核 BOSS 的水花同一套畫法：js/pool-boss.js 的 drawPoolSplash）
function poolFallSplash(x, y, big) {
  if (typeof G === 'undefined' || !G) return;
  const K = big ? POOL_FALL.bigSplash : POOL_FALL.smallSplash, w = K.width, list = G.poolSplash || (G.poolSplash = []);
  const style = big ? POOL_FALL.crownStyle : 0;
  if (style === 3) {   // 第 3 版：水圈、水沫、水滴都由皇冠水花自己安排（畫法在 js/pool-boss.js 的 drawPoolCrown3）
    const C3 = POOL_FALL.crown;
    list.push({ crown: true, style: 3, x, y, w: C3.width, h: C3.height, spread: C3.spread, saddle: C3.saddle, nTend: C3.tendrils, t: 0, life: C3.life });
    for (let i = 0; i < 4; i++) {   // 剛落水：幾顆小水滴先蹦出來
      const ang = Math.random() * Math.PI * 2, sp = poolFallRand(20, 50);
      list.push({ x, y, z: 2, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp * .4, vz: poolFallRand(90, 140), r: poolFallRand(1, 1.8), t: 0, life: 1 });
    }
    for (let i = 0; i < C3.drops; i++) {   // 杯口破掉的時候：從杯口邊上甩出水滴（wait＝等幾秒才出現）
      const ang = Math.random() * Math.PI * 2, rx = C3.width * .5 * (1 + C3.spread * .6), sp = poolFallRand(10, 45);
      list.push({ x: x + Math.cos(ang) * rx, y: y + Math.sin(ang) * rx * .3, z: C3.height * poolFallRand(.4, .8), vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp * .35,
        vz: poolFallRand(40, 150), r: poolFallRand(1.1, 2.4), t: 0, life: 1.4, wait: C3.life * poolFallRand(.48, .6) });
    }
    if (list.length > 900) list.splice(0, list.length - 900);
    return;
  }
  if (style === 4) {   // 第 4 版：三版各取最好的部分（畫法在下面的 poolCrownSplash，池核 BOSS 跳水也用同一個、放大來用）
    poolCrownSplash(list, x, y, 1);
    return;
  }
  list.push({ ring: true, x, y, r0: w * .2, r1: w * (big ? 1.4 : .9), t: 0, life: big ? .8 : .5 });   // 水波
  if (big) list.push({ ring: true, x, y, r0: w * .2, r1: w * 2, t: -.15, life: .7 });
  list.push({ foam: true, x, y, r: w * (big ? .45 : .3), t: 0, life: big ? .55 : .3 });   // 白色水沫
  const CR = style === 2 && POOL_FALL.crownV2;
  if (CR) list.push({ crown: true, x, y, w: CR.width, h: CR.height, n: CR.tips, spread: CR.spread, foamOut: CR.foamOut, t: 0, life: CR.life });   // 第 2 版皇冠水花（畫法在 js/pool-boss.js 的 drawPoolCrown）
  for (let i = 0; i < K.drops; i++) {   // 往四周噴的水滴
    const ang = Math.random() * Math.PI * 2, sp = K.spread * poolFallRand(.35, 1), rr = w * poolFallRand(.05, .3);
    list.push({ x: x + Math.cos(ang) * rr, y: y + Math.sin(ang) * rr * .45, z: poolFallRand(2, 10), vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp * .45,
      vz: K.up * poolFallRand(.35, 1), r: big ? poolFallRand(1.8, 3.6) : poolFallRand(1.2, 2.4), t: 0, life: 1.4 });
  }
  const columns = CR ? POOL_FALL.crownColumn : (K.column || 0);
  for (let i = 0; i < columns; i++) {   // 往上衝的水柱（窄、高）
    const ang = Math.random() * Math.PI * 2, sp = poolFallRand(8, 30);
    list.push({ x: x + (Math.random() - .5) * w * .3, y, z: Math.random() * 12, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp * .45,
      vz: K.up * poolFallRand(1, 1.6), r: poolFallRand(2.4, 4.2), t: 0, life: 1.8 });
  }
  if (list.length > 900) list.splice(0, list.length - 900);
}

// ---- 第 4 版皇冠水花（落水用 sc＝1；池核 BOSS 跳水用放大的，js/pool-boss.js 的 poolBossSplash）----
// sc＝放大幾倍：杯子、水圈、水沫帶的大小 × sc；水滴噴的高度、範圍跟著變大；整個水花也播久一點
// 內容：中間白色水沫（第 1 版）＋杯子和往外飛的浪花（第 2 版）＋水面白沫帶、細水圈、水滴散落（第 3 版）＋中間往上噴的水柱（第 1 版）
function poolCrownSplash(list, x, y, sc = 1) {
  const V2 = POOL_FALL.crownV2, C4 = POOL_FALL.crown4, K = POOL_FALL.bigSplash, w = K.width * sc;
  const g4 = C4.gravity || 1, gk = Math.sqrt(g4);   // 水滴重力加重幾倍；往上噴的速度乘 gk，噴的高度才會差不多一樣
  const ss = Math.sqrt(sc), lifeK = 1 + .22 * (sc - 1), many = 1 + .5 * (sc - 1);   // ss：速度放大幾倍（高度＝sc 倍）；lifeK：播久幾倍；many：水滴多幾倍
  const life = V2.life * lifeK;
  list.push({ foam: true, x, y, r: w * .45, t: 0, life: .55 * lifeK });   // 中間的白色水沫（第 1 版）
  const crownAt = list.length;   // 杯子在清單裡的位置（水沫帶要插在它前面，才會畫在杯子後面）
  list.push({ crown: true, x, y, w: V2.width * sc, h: V2.height * sc, n: V2.tips + Math.round((sc - 1) * 2), spread: V2.spread, foamOut: V2.foamOut,
    keepTips: true, headK: C4.headSize, waveK: C4.rimWave, t: 0, life });   // 杯子（第 2 版，浪花不往回縮）
  const rEnd = V2.width * sc * .5 * (1 + V2.spread);   // 杯口散到最開大約多寬
  if (C4.band)   // 水面上的白色水沫帶（第 3 版）：跟杯子同時出現、同時消失（syncCrown＝淡出的時間跟杯子一樣），跟著杯子一起往外擴
    list.splice(crownAt, 0, { band: true, syncCrown: true, x, y, w: V2.width * sc, r0: V2.width * sc * .35, r1: rEnd * 1.05, t: 0, life });
  for (let i = 0; i < C4.ripples; i++)   // 細細的白色水圈（第 3 版）：從杯口最開的地方再往外擴散
    list.push({ ripple: true, x, y, r0: rEnd * (.8 - i * .15), r1: rEnd * (1.9 - i * .3), t: -(C4.rippleAt + i * .12) * lifeK, life: (.9 - i * .1) * lifeK });
  for (let i = 0; i < Math.round(4 * many); i++) {   // 剛落水：幾顆小水滴先蹦出來（第 3 版）
    const ang = Math.random() * Math.PI * 2, sp = poolFallRand(20, 50) * ss;
    list.push({ x, y, z: 2, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp * .4, vz: poolFallRand(90, 140) * gk * ss, gMul: g4, r: poolFallRand(1, 1.8) * ss, t: 0, life: 1 * lifeK });
  }
  for (let i = 0; i < Math.round(C4.drops * many); i++) {   // 杯口散開、塌下去時：從杯口邊上甩出水滴（第 3 版；wait＝等幾秒才出現）
    const ang = Math.random() * Math.PI * 2, rx = rEnd * poolFallRand(.6, .85), sp = poolFallRand(30, 80) * ss;
    list.push({ x: x + Math.cos(ang) * rx, y: y + Math.sin(ang) * rx * .3, z: V2.height * sc * poolFallRand(.5, .9), vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp * .35,
      vz: poolFallRand(60, 160) * gk * ss, gMul: g4, r: poolFallRand(1.1, 2.4) * ss, t: 0, life: 1.4 * lifeK, wait: life * poolFallRand(.4, .55) });
  }
  for (let i = 0; i < Math.round(C4.column * (1 + .3 * (sc - 1))); i++) {   // 中間往上噴的水柱（第 1 版）
    const ang = Math.random() * Math.PI * 2, sp = poolFallRand(8, 30) * ss;
    list.push({ x: x + (Math.random() - .5) * w * .3, y, z: Math.random() * 12 * sc, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp * .45,
      vz: K.up * poolFallRand(1, 1.6) * gk * ss, gMul: g4, r: poolFallRand(2.4, 4.2) * ss, t: 0, life: 1.8 * lifeK });
  }
  if (list.length > 900) list.splice(0, list.length - 900);
}
// ---- 搖晃、掉下去、掙扎的每一幀 ----
// 溫特：js/game.js 的 updatePlayer 呼叫，回傳 true＝這一幀由這裡處理（不能走路、不能開槍）
// 隊員：搖晃、掉下去由 poolFallTick 處理；掙扎往岸上游照舊由 js/sentry.js 呼叫 poolDrownFlee
function poolFallStep(a, dt) {
  const f = a && a.poolFall; if (!f) return false;
  if (a.hp <= 0 || a.swimRing || !poolFallOn()) { poolFallEnd(a); return false; }   // 倒下、戴上泳圈、水被抽乾
  f.t += dt; a.moving = false; a.anim = 0;
  if (f.phase === 'wobble') {
    if (f.t >= POOL_FALL.wobbleSecs) {
      const to = poolFallTarget(a);
      if (!to) { poolFallEnd(a); return false; }   // 旁邊找不到深水（例如剛好走開了）：站穩了
      f.phase = 'fall'; f.t = 0; f.from = { x: a.x, y: a.y }; f.to = to;
      f.dir = a.dir = poolFallDirTo(a, to.x, to.y);
    }
    return true;
  }
  if (f.phase === 'fall') {
    const k = Math.min(1, f.t / POOL_FALL.fallSecs);
    a.x = f.from.x + (f.to.x - f.from.x) * k; a.y = f.from.y + (f.to.y - f.from.y) * k;
    if (k >= 1) {   // 落水：水柱、水花、水聲
      f.phase = 'struggle'; f.t = 0; f.splashAt = poolFallRand(...POOL_FALL.splashGap);
      a.dir = 'front'; a.drownPath = null;
      poolFallSplash(a.x, a.y + 10, true);
      if (typeof sfxAt === 'function') sfxAt(POOL_FALL.sound, a.x, a.y, POOL_FALL.soundVol, 'pool-fall-' + (a.id ?? a.type ?? 'p'));
      if (typeof nearbyImpact === 'function') nearbyImpact(a.x, a.y, 2, 0);
    }
    return true;
  }
  // 掙扎：剛落水先原地慌張一下，之後：
  //   溫特：玩家自己用方向鍵（WASD／方向鍵）控制往哪游（POOL_FALL.playerSwim 關掉的話，改回自動游到最近的岸邊）
  //   隊員：自動往岸上游（js/sentry.js）
  //   漲潮溺水那套（js/pool-tide.js）會把 drowning 打開、每秒扣血
  if (f.t >= POOL_FALL.panicSecs && typeof G !== 'undefined' && G && a === G.player && a.drowning) {
    if (POOL_FALL.playerSwim) poolFallPlayerSwim(a, dt);
    else if (typeof poolDrownFlee === 'function') poolDrownFlee(a, dt);
  }
  return true;
}
// 溫特掉進水裡：玩家按方向鍵自己游（速度＝走路速度 × POOL_FALL.swimMul）
// 水裡、岸上都能游過去，只有牆擋得住；游到岸邊之後，poolFallTick 會接手讓她爬上岸、結束掙扎
function poolFallPlayerSwim(a, dt) {
  if (typeof keys === 'undefined') return;
  const dx = ((keys['d'] || keys['arrowright']) ? 1 : 0) - ((keys['a'] || keys['arrowleft']) ? 1 : 0);
  const dy = ((keys['s'] || keys['arrowdown']) ? 1 : 0) - ((keys['w'] || keys['arrowup']) ? 1 : 0);
  if (!dx && !dy) return;   // 沒按方向鍵：原地載浮載沉
  const len = Math.hypot(dx, dy), step = (typeof PLAYER !== 'undefined' ? PLAYER.speed : 230) * POOL_FALL.swimMul * dt;
  const ok = (x, y) => {
    const [c, r] = cellAt(x, y);
    if (!inGrid(c, r) || isWall(c, r)) return false;                                                         // 牆、地圖外面
    if (typeof edgeWallCrossed === 'function' && edgeWallCrossed(a.x, a.y, x, y, PLAYER.r)) return false;   // 薄牆
    return true;
  };
  const nx = a.x + dx / len * step, ny = a.y + dy / len * step;
  if (dx && ok(nx, a.y)) a.x = nx;   // 左右、上下分開試，貼著牆也能沿著牆游
  if (dy && ok(a.x, ny)) a.y = ny;
  a.moving = true;   // 臉一樣維持正面（掙扎的 >< 圖只有正面）
}
// ---- 溫特右鍵抓隊友（js/grab.js）----
// 抓起來的那一刻：在水裡（掙扎、漂著）就讓掙扎停下來；回傳 true＝是從水裡抓起來的（放到岸上會跳「救上岸了！」）
function poolFallGrabbed(a) {
  if (!a) return false;
  const inWater = !!(a.poolFall || a.drowning || (poolFallOn() && deepWaterAtPoint(a.x, a.y) && !a.swimRing));
  if (a.poolFall) { a.poolFall = null; a.drownPath = null; }
  a.drowning = false; a.poolPushT = 0;
  return inWater;
}
// 放下的那一刻：放在深水上（沒坐泳圈）就掉進水裡，噴水花、開始掙扎往岸邊游；回傳 true＝掉進水裡了
function poolFallDropIn(a) {
  if (!a || a.swimRing || !poolFloatsAt(a.x, a.y)) return false;
  if (typeof poolCrownSplash === 'function') poolCrownSplash(G.poolSplash || (G.poolSplash = []), a.x, a.y + 10, POOL_FALL.dropSplash);   // 比自己失足掉下去的小一點
  else poolFallSplash(a.x, a.y + 10, false);
  if (typeof sfxAt === 'function') sfxAt(POOL_FALL.sound, a.x, a.y, POOL_FALL.soundVol, 'pool-drop-' + (a.id ?? a.type ?? ''));
  if (a.hp <= 0) return true;   // 倒下的：漂在水上（poolFallPose）
  a.poolFall = { phase: 'struggle', t: 0, dir: 'front', dropped: true, splashAt: .3 };
  a.dir = 'front'; a.drownPath = null; a.moving = false;
  a.mode = 'hold'; a.anchor = null;   // 游上岸之後在岸邊巡邏（poolFallEnd 補上 anchor）
  return true;
}
function poolFallEnd(a) {
  if (!a || !a.poolFall) return;
  if (a.poolFall.dropped && typeof G !== 'undefined' && G && (G.towers || []).includes(a) && a.mode === 'hold') a.anchor = { x: a.x, y: a.y };   // 被丟下水的：游上岸後就在岸邊巡邏
  a.poolFall = null; a.drownPath = null;
  a.poolFallCdUntil = performance.now() + POOL_FALL.cooldown * 1000;
}

// ---- 每一幀（js/pool-tide.js 的 updatePoolTide 呼叫）：隊員搖晃、掉下去；所有掙扎的人濺水花、隊員自動戴泳圈、游上岸就結束 ----
function poolFallTick(dt) {
  if (typeof G === 'undefined' || !G) return;
  const all = [G.player, ...(G.towers || [])].filter(Boolean);
  for (const a of all) {
    const isPlayer = a === G.player;
    if (a.poolFall && a.poolFall.phase !== 'struggle' && !isPlayer) poolFallStep(a, dt);   // 隊員的搖晃、掉下去（溫特的在 updatePlayer）
    const f = a.poolFall;
    if (f && f.phase === 'struggle') {
      if (a.hp <= 0 || a.swimRing || !poolFallOn()) { poolFallEnd(a); continue; }
      if (typeof poolPointInDeepZone === 'function' && !poolPointInDeepZone(a.x, a.y)) {   // 游到岸邊了
        // 整個人在岸上站得住才結束；身體還碰著深水的話，遊戲會判定卡住、一口氣把人推開（看起來跳一下），所以再慢慢游上去
        if (!poolFallStuckIfEnded(a, a.x, a.y) || !poolFallClimbOut(a, dt)) { poolFallEnd(a); continue; }
      }
      if (!isPlayer) {
        f.t += dt;   // 溫特的在 poolFallStep 算
        if (a.ownRing && f.t >= POOL_FALL.ringDelay) {   // 隊員有自己的游泳圈：掙扎一下就戴上
          a.swimRing = true; a.drowning = false; poolFallEnd(a);
          if (typeof sentryStatus === 'function') sentryStatus(a, '戴上游泳圈', '#9ff0c0');
          continue;
        }
      }
    }
    if (poolStruggling(a)) {   // 掙扎中：隔一下就濺起小水花
      a.poolSplashT = (a.poolSplashT ?? .2) - dt;
      if (a.poolSplashT <= 0) { a.poolSplashT = poolFallRand(...POOL_FALL.splashGap); poolFallSplash(a.x + poolFallRand(-10, 10), a.y + 8, false); }
    }
  }
}

// 隊員剛落水還在原地慌張（js/sentry.js 問：是的話這一幀不往岸上游）
const poolFallPanicking = t => !!(t && t.poolFall && t.poolFall.phase === 'struggle' && t.poolFall.t < POOL_FALL.panicSecs);

// 如果掙扎在這裡結束（變回普通走路的人），(x, y) 這個位置會不會被判定卡住（身體碰到深水、牆）
function poolFallStuckIfEnded(a, x, y) {
  const keep = [a.poolFall, a.drowning, a.x, a.y];
  a.poolFall = null; a.drowning = false; a.x = x; a.y = y;
  try {
    if (typeof G !== 'undefined' && G && a === G.player) return typeof playerBlocked === 'function' && playerBlocked(x, y);
    return typeof sentryBlocked === 'function' && (typeof swimRingWithActor === 'function' ? swimRingWithActor(a, () => sentryBlocked(x, y)) : sentryBlocked(x, y));
  } finally { [a.poolFall, a.drowning, a.x, a.y] = keep; }
}
// 游到岸邊、身體還碰著深水：往最近「站得住」的地方慢慢游過去；回傳 false＝附近找不到（直接結束）
function poolFallClimbOut(a, dt) {
  const f = a.poolFall;
  if (!f.shore || Math.hypot(f.shore.x - a.x, f.shore.y - a.y) < .5) {   // 找一次目標（到了還站不住就再找）
    f.shore = null;
    for (let d = 2; d <= 32 && !f.shore; d += 2) for (let i = 0; i < 16; i++) {
      const ang = i / 16 * Math.PI * 2, x = a.x + Math.cos(ang) * d, y = a.y + Math.sin(ang) * d;
      if (!poolFallStuckIfEnded(a, x, y)) { f.shore = { x, y }; break; }
    }
  }
  if (!f.shore) return false;
  const speed = ((typeof TYPES !== 'undefined' && TYPES[a.type] && TYPES[a.type].walkSpeed) || 80) * (POOL_TIDE.drownFleeMul || .3);
  const dx = f.shore.x - a.x, dy = f.shore.y - a.y, d = Math.hypot(dx, dy), step = Math.min(d, speed * dt);
  if (d > 0) { a.x += dx / d * step; a.y += dy / d * step; }
  a.moving = true;
  return true;
}

// ---- 溫特走動之後（js/game.js 的 updatePlayer 呼叫）：太靠近水邊、硬往深水走 → 失足 ----
function poolFallAfterMove(p, dx, dy, dt, px0, py0) {
  if (!poolFallCanStart(p)) { if (p) p.poolPushT = 0; return; }
  if (!(dx || dy)) { p.poolPushT = 0; return; }
  const len = Math.hypot(dx, dy), ahead = PLAYER.r + 6;
  const towardDeep = deepWaterAtPoint(p.x + dx / len * ahead, p.y + dy / len * ahead);
  const stuck = Math.hypot(p.x - px0, p.y - py0) < .5;
  p.poolPushT = towardDeep && stuck ? (p.poolPushT || 0) + dt : 0;
  if (p.poolPushT >= POOL_FALL.pushSecs) { p.poolPushT = 0; poolFallStart(p); return; }   // 硬要往水裡走
  if (poolFallEdgeDist(p) <= POOL_FALL.edgeNear && Math.random() < POOL_FALL.edgeRate * dt) poolFallStart(p);   // 太靠近水邊：不小心失足
}
// ---- 隊員走動之後（js/sentry.js 的 updateSentry 呼叫）----
function poolFallAllyCheck(t, dt, x0, y0) {
  if (!poolFallCanStart(t) || t.berserk) return;
  if (Math.hypot(t.x - x0, t.y - y0) < .3) return;   // 沒在走
  if (poolFallEdgeDist(t) <= POOL_FALL.allyEdgeNear && Math.random() < POOL_FALL.allyRate * dt) poolFallStart(t);
}

// ---- 畫面：搖晃、掉下去、掙扎時的姿勢（js/water.js 的 drawWaded 呼叫）----
// 回傳 { rot：轉幾度、pivot：繞哪裡轉（角色位置往下幾點）、dy：上下移多少、wade：泡水的範圍（掙扎時用） }；平常回傳 null
function poolFallPose(a) {
  if (!a || a.swimRing) return null;
  const f = a.poolFall, now = performance.now() / 1000;
  if (a.poolSeed == null) a.poolSeed = Math.random() * 10;   // 每個人固定錯開節奏（不能用位置算：游動時位置一直變，節奏會每一幀亂跳、看起來像抽搐）
  const seed = a.poolSeed;
  if (a.hp <= 0 && typeof G !== 'undefined' && G && a !== G.player && !a.grabbed && !a.grabFall && poolFloatsAt(a.x, a.y)) {   // 隊員陣亡在深水裡：用倒地圖漂在水上載浮載沉（被抓起來時不算）
    const size = (typeof PLAYER !== 'undefined' && PLAYER.drawSize) || 64;
    return poolFloatPose(a, { bottom: a.y + 18, height: size, width: size * .8 });
  }
  if (f && f.phase === 'wobble') {
    const ramp = .45 + .55 * Math.min(1, f.t / POOL_FALL.wobbleSecs);   // 越晃越大
    return { rot: Math.sin(f.t * POOL_FALL.wobbleSpeed) * POOL_FALL.wobbleAmp * ramp, pivot: 16, dy: 0 };
  }
  if (f && f.phase === 'fall') {
    const k = Math.min(1, f.t / POOL_FALL.fallSecs), dir = f.to.x >= f.from.x ? 1 : -1;
    return { rot: dir * k * .7, pivot: 16, dy: -Math.sin(k * Math.PI) * POOL_FALL.fallLift + k * k * 14 };   // 往上彈一下、往前倒、往下沉
  }
  if (!poolStruggling(a)) return null;
  const t = now + seed;
  const size = (typeof PLAYER !== 'undefined' && PLAYER.drawSize) || 64;
  const settle = f && f.phase === 'struggle' ? Math.min(1, f.t / .3) : 1;   // 剛落水：從深處浮上來
  return {
    rot: Math.sin(t * POOL_FALL.swaySpeed) * POOL_FALL.swayAmp,
    pivot: 6,
    dy: Math.sin(t * POOL_FALL.bobSpeed) * POOL_FALL.bobAmp + (1 - settle) * 14,
    wade: { w: { depth: POOL_FALL.sink, see: POOL_FALL.see }, bottom: a.y + 18, height: size, width: size * .62 },
  };
}
// ---- 漂在水上載浮載沉（共用：陣亡的隊員、丟進深水的道具）----
// 這個點會不會漂起來：現在是深水的地方（水被抽乾就不會）
const poolFloatsAt = (x, y) => poolFallOn() && deepWaterAtPoint(x, y);
// 地上的道具是不是漂在水裡（隊員、球球就不會走去撿，js/ground-items.js、js/swim-ring.js）
const poolItemFloating = g => !!g && poolFloatsAt(g.x, g.y);
// 姿勢：box＝{ bottom：圖的底部 y、height：圖多高、width：水波紋多寬、sink：水面在圖的哪裡（沒給＝POOL_FALL.float.sink）、bob：浮沉幅度倍率 }
// 回傳給 js/water.js 的 drawWaded 用（kind 'float' 讀 a.floatPose；隊員由 poolFallPose 回傳）
function poolFloatPose(o, box) {
  if (o.poolSeed == null) o.poolSeed = Math.random() * 10;   // 每個錯開節奏
  const D = POOL_FALL.float, t = performance.now() / 1000 + o.poolSeed, bob = box.bob ?? 1;
  return {
    rot: Math.sin(t * D.swaySpeed) * D.swayAmp, pivot: box.pivot ?? 6,
    dy: Math.sin(t * D.bobSpeed) * D.bobAmp * bob,
    wade: { w: { depth: box.sink ?? D.sink, see: D.see }, bottom: box.bottom, height: box.height, width: box.width, ripple: { ...D.ripple, phase: o.poolSeed % 1 } },   // phase：波紋錯開
  };
}
// 掙扎時用哪張圖：>< 表情的正面走路圖輪流換（手揮來揮去）；沒有這組圖就回傳 null（照原本的圖）
function poolFallFrame(set, who) {
  const f = who && who.poolFall;
  if (set && f && (f.phase === 'wobble' || f.phase === 'fall') && f.dir) {   // 搖晃、掉下去：固定用面向水的站立圖
    const g = set[f.dir] && set[f.dir][0];
    if (g && g.complete && g.naturalWidth) return g;
  }
  if (!set || !set.drown || !poolStruggling(who)) return null;
  const i = Math.floor(performance.now() / 1000 / POOL_FALL.flailSecs) % 2;
  const g = set.drown[i] || set.drown[0];
  return g && g.complete && g.naturalWidth ? g : null;
}
