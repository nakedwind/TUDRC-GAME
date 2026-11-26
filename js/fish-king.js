/* ===== 魚頭王（魚頭君放大 2.4 倍的菁英 BOSS，住在 W118區 地下水池右上角那一池永遠不會抽乾的深水裡）=====
   ・開戰前：躲在水裡看不到。每隔 peek.every 秒會在地圖右邊的深水（maps 的 area）隨機冒出頭來，盯著溫特看 peek.stay 秒，
     不攻擊、打不到，看完就潛下去消失（冒頭的地方盡量挑照得到的；在暗處的話，黑暗中只看得到兩顆紅眼睛）
   ・正式登場：牠守的那顆異質核心被打到（扣血）→ 從離那顆核心最近的右邊深水躍出來（大水花、畫面震動）→ 開戰（畫面上方出現 BOSS 血條）；
     之後在登場的那一池水裡游（偶爾海豚跳換到別的水池）
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
   ・海豚跳（leap）：潛水時隔一陣子會跳出水面、像海豚一樣連跳幾下，跳到別的水池（換區）或同一池的別處；在空中打得到
   ・被溫特的一般子彈打到（flinch）：閃白、轉身往下潛（開戰前冒頭時也一樣；隊員打的不算）
   ・被雷電打到（shocked）：原地發抖 → 轉 30 度露出背面魚肉（像趴著）垂直掉下來 → 掉在地上擱淺、掉在水裡沉下去消失，過一下再浮出來繼續打；
     開戰前冒頭時被電：一樣發抖、掉下去淡出，不會出現血條、不扣血
   ・開戰前冒頭偷看時放進怪物清單（溫特打得到；隊員只有安柏的雷電會打牠），比較常挑右邊的超深水區（maps 的 deep）冒出來，冒出來後慢慢游
   ・魚頭君本來的特性照舊：正面硬、背面痛、抗火、怕電（js/fish-head.js 的 fishHeadArmor）
   ・圖：images/monster/fish-king/（檔名跟魚頭君一樣、只換資料夾），用 tools/recolor-fish-king.py 從魚頭君的圖換色產生
   ・數值都在下面的 FISH_KING；必須在 fish-head.js、pool-boss.js、pool-fall.js 之後、game.js 之前載入 */
// 數字以 data/monsters.js 的 BOSS_SETTINGS_DEFAULT 為準（怪物編輯器「👑 BOSS 數值」）；這裡的數字只在那邊沒有這一格時才用。
// 新增或刪掉數字欄位、改了註解之後，要跑一次 tools/build-boss-fields.py（編輯器的欄位和說明才會跟著更新）
const FISH_KING = applyBossSettings('FISH_KING', {
  name: '魚頭王',
  // W118區 地下水池：home＝原位（格子座標）、area＝冒頭偷看、登場的範圍 [左邊第幾欄, 上面第幾列, 右邊第幾欄, 下面第幾列]（地圖右邊那些深水）
  //   deep＝右邊的超深水區（最右邊那一長條水池），冒頭偷看比較常挑這裡（機率 peek.deepChance）
//   core＝牠守哪一顆核心（離這格最近的那顆）：只有這顆被打到才會登場；沒寫＝任何一顆被打到都登場
//     （W118 中間深水區那顆 57,19 給池核 BOSS 巨大比基尼小丑魚守，js/pool-boss.js；魚頭王守右邊那顆 87,28，測試地圖是 87,29）
//   peek＝開戰前冒頭偷看只在這幾塊水域（[左欄, 上列, 右欄, 下列]，好幾塊；沒寫＝area 裡的深水都可以）：
//     右上大水池、走道下面左邊那池、右邊大池＋往下那一長條、中間水池上半、右下那池、最下面中間窄的那池、最下面右邊那池
//   leap＝開戰後海豚跳只跳到這幾塊水域（沒寫＝area 裡的深水都可以）：跟 peek 一樣，但不含最下面那兩池
  maps: { 'map_89aacb92-4b89-47ec-a76b-0908972d3fdf': { home: [95, 16], area: [64, 0, 115, 89], deep: [97, 26, 106, 61], core: [87, 28],
      peek: [[68, 12, 106, 19], [69, 26, 85, 35], [89, 26, 106, 32], [97, 33, 106, 47], [78, 38, 92, 50], [97, 51, 106, 61], [77, 65, 84, 79], [87, 65, 106, 79]],
      leap: [[68, 12, 106, 19], [69, 26, 85, 35], [89, 26, 106, 32], [97, 33, 106, 47], [78, 38, 92, 50], [97, 51, 106, 61]] },
    'map_w118_deep_test': { home: [95, 16], area: [64, 0, 115, 89], deep: [97, 26, 106, 61], core: [87, 29],
      peek: [[68, 12, 106, 19], [69, 26, 85, 35], [89, 26, 106, 32], [97, 33, 106, 47], [78, 38, 92, 50], [97, 51, 106, 61], [77, 65, 84, 79], [87, 65, 106, 79]],
      leap: [[68, 12, 106, 19], [69, 26, 85, 35], [89, 26, 106, 32], [97, 33, 106, 47], [78, 38, 92, 50], [97, 51, 106, 61]] } },   // W118區 超深水區（魚頭王測試）：跟 W118 一樣   // W118區 超深水區（魚頭王測試）：跟 W118 一樣
  of: 'fish_head',            // 以哪隻怪物為基準（怪物編輯器的魚頭君）
  artDir: 'images/monster/fish-king/',
  scale: 2.904,               // 放大幾倍（魚頭君的幾倍）
  hp: 4200,                   // 血量（再乘整體難度）
  rewardMul: 6, crystalMul: 6,
  // 開戰前冒頭偷看：每隔幾秒（隨機）一次、盯著看幾秒、慢慢浮出來要幾秒、慢慢沉下去要幾秒、離溫特幾格（最近～最遠）的深水才冒
  peek: { every: [.5, 1.5], stay: 9, rise: 2.2, sink: 2.4, distMin: 4, distMax: 10, splashRise: .5, splashSink: .7, deepChance: .9, deepDistMax: 16, drift: 22 },   // splashRise／splashSink＝浮出來、沉下去時，水花散開的寬度大約是身體寬的幾倍；deepChance＝有幾成挑右邊的超深水區冒頭；deepDistMax＝超深水區離溫特幾格內都可以冒；drift＝冒頭時慢慢游的速度（像素／秒，0＝不動）
  shoreGap: 0,                // 身體邊緣離岸邊至少幾格（其他水中怪物是 1；0＝可以游到身體快碰到岸邊）
  surfaceRise: 1.2,           // 開戰後：從水裡浮上來要幾秒（慢慢浮出來，不是一下子跳出來）
  fadeAt: .7,                 // 淡入淡出：浮到幾成高之前身體是半透明的（沉下去時反過來慢慢淡掉；0＝不淡入淡出）
  // 泡在水裡時，水面那一圈橢圓：wide＝寬度是身體寬的幾倍、flat＝扁度（高÷寬，越小越扁）
  oval: { wide: 1, flat: .3 },
  // 游泳時的水波紋：在水裡游（潛水、浮上來、開戰前冒頭慢慢游都算）時，每隔 every 秒在牠的位置冒出一圈，往外擴散、慢慢淡掉，游過的路上留下一圈一圈的波紋
  //   every＝幾秒冒一圈、life＝一圈播幾秒、size＝一開始多大（身體寬的幾倍）、grow＝最後擴到一開始的幾倍、alpha＝最濃多濃（0～1）、
  //   subAlpha＝潛在水裡時再乘幾倍（淡一點）、minMove＝每秒至少游幾像素才算在游（停著不冒）
  ripple: { every: .35, life: 1.6, size: .45, grow: 2.2, alpha: .5, subAlpha: .7, minMove: 12 },
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
  dive: [1.5, 2.5],           // 潛水幾秒（隨機）；時間到就游去岸邊浮上來
  surface: [4, 6],            // 浮上來幾秒（隨機）
  approachMax: 4,             // 潛水時間到之後，最多花幾秒游到岸邊才浮上來
  diveTurn: 1.4,              // 潛下去之前轉身露出背面幾秒（打得到、背面比較痛；這段時間身體慢慢沉下去）
  surfaceDepth: .57,          // 浮上來時水面在身體的哪裡（0＝腳底、1＝頭頂；.57＝水面在眼睛下面一點，只露出頭和背）
  silhouette: .4,             // 潛水時的影子多濃（再乘水的能見度）
  defaultSee: .45,            // 水的能見度（沒有水素材時用）
  splashSize: 2.4,            // 浮上來、潛下去的水花大小（皇冠水花放大幾倍；2.4 散開時大約跟身體一樣寬）
  // 潛下水、落回水面（包括海豚跳落水）時溢上岸的水（js/pool-surge.js）：水波沿著水面最遠擴散幾格、最多溢上岸幾格、
  //   最靠近水邊的人被推開幾像素（越往岸上越小）、水退回去時把還站在濕地上的人往水池拉回幾像素（0＝不拉；站在水邊的會被拖進水裡）
  surge: { range: 9.24, spill: 1.32, push: 55, pull: 85 },   // pull 比 push 大：站在水邊 1 格內的人會被退水拖進水裡
  // 高壓水砲：每隔幾秒（隨機）一次、預警幾秒、掃多久（秒）、掃的角度（弧度）、射程（格）、水柱多粗（像素）、扣多少血、把人沖開幾格
  //   先跳上岸才噴：reach＝離牠幾格內找岸上的落腳處、shore＝落腳處離水最多幾格、jumpSecs／jumpHeight＝跳上岸要幾秒、跳多高（像素）、
  //   stay＝噴完在岸上多待幾秒才跳回水裡
  //   fromDive＝潛水游到岸邊時，有幾成直接從水裡跳上岸噴水砲（不先浮上來；浮上來常常被溫特一打就縮回去）
  //   retry＝浮在水面上要噴、但附近找不到岸可以跳時，幾秒後再找一次
  cannon: { every: [1.5, 2.5], fromDive: .6, retry: .6, windup: 1.1, sweep: 1.4, arc: 2.094, range: 14.2, width: 60, damage: 14, push: 2.4,
    reach: 8, shore: 2.5, jumpSecs: .8, jumpHeight: 120, stay: .6,
    // 沖下水：被水砲沖開時，旁邊 push 格內有深水的話，往水池那邊偏過去（最多偏幾度；0＝照水柱方向直直沖開、不偏）
    //   魚頭王是站在走道上噴的，水柱常常沿著走道掃，不偏的話人只會在走道上滑，很少掉下水
    toWater: 90,
    // 打到地上的白色水花：rate＝每秒冒幾團、size＝一團多大（水柱粗細的幾倍）、life＝一團播幾秒、wobble＝邊緣變形多劇烈（0～1）、spread＝往兩旁散開多寬（水柱粗細的幾倍）
    impact: { rate: 26, size: .8, life: .45, wobble: .45, spread: 2.2 } },
  // 水柱衝天：每隔幾秒（隨機）一次、預警幾秒、水柱噴多久（秒）、範圍半徑（格）、一次最多幾個人、
  //   離牠幾格內泡在水裡的人會被噴（不限牠自己那一池）、往上拋的速度、飛多遠（格，最少～最多）、落地扣多少血、落水後慌張幾秒才能戴泳圈
  //   panicPlayer＝溫特落水後慌張幾秒（隊員照 panic）
  geyser: { every: [4, 6.5], warn: 1.2, column: .7, radius: .9, count: 2, range: 16, up: 620, distMin: 2, distMax: 4.5, landDamage: 14, panic: 3, panicPlayer: 1 },
  // 海豚跳換區：潛水時每隔幾秒（隨機）跳一次、一次連跳幾下（隨機）、跳一下要幾秒、跳多高（像素）、跳多遠（格，最少～最多）、
  //   身體最多斜幾度（弧度：起跳頭朝上、落下頭朝下）、有幾成跳去別的水池（不然就在同一池裡跳）
  //   （secs、height 是跳 6 格的樣子；跳得更遠會飛久一點、高一點）
  leap: { every: [6, 10], hops: [1, 3], secs: 1.1, height: 150, distMin: 4, distMax: 14, tilt: .6, otherPool: .7,
    // 地圖編輯器畫的海豚躍路線：離起點幾格內就算到了（直接起跳）、游去起點最多游幾秒（游不到就從現在的位置直接跳）、游去起點的速度倍率
    routeArrive: .8, routeMaxSwim: 8, routeSwimMul: 1.3,
    // 海豚跳起跳、落水時激起的水花，是一般水花（splashSize）的幾倍大
    splashMul: 1.2 },
  // 被溫特的一般子彈打到：閃白、轉身往下潛（turn＝轉身沉下去要幾秒；開戰前冒頭時也一樣）
  flinch: { turn: .5 },
  // 被雷電打到（雷電彈、安柏）：原地發抖幾秒 → 轉 tilt 度、露出背面魚肉（像趴著）垂直掉下來（fall＝往下掉的加速度）
  //   → 掉在地上就擱淺、掉在水裡就沉下去（sink＝沉下去要幾秒）消失 gone 秒（隨機）再從靠近人的岸邊浮出來
  shocked: { shake: .8, tilt: 30, fall: 1600, sink: 1.1, gone: [1.2, 2] },
  // 在岸上（跳上岸噴水砲、擱淺）被雷電打到：原地麻痺 secs 秒（全身發抖、冒電花、不會噴水砲也不會跳回水裡）；
  //   麻痺結束後 cd 秒內再被電不會又麻痺（不然安柏一直電，牠就永遠動不了）
  landShock: { secs: 3, cd: 1.5 },
  // 巨物的重量感（跟虱目魚王落地同一套做法）：
  //   落地（跳上岸噴水砲、被電掉在地上）＝畫面大震 landShake 像素、慢慢減弱 landSecs 秒，地上裂開（crack＝中間那片裂痕多大）、揚起塵土、落地聲（音量 landVol）
  //   落水（登場、海豚跳、跳回水裡、被電掉進水裡）＝畫面震 waterShake 像素、慢慢減弱 waterSecs 秒
  //   離溫特越遠震得越小（30 格外不震）
  impact: { landShake: 10, landSecs: .6, crack: 1, landVol: 2, waterShake: 7, waterSecs: .45 },
  // 記仇：誰打牠守的核心，水砲、水柱衝天就優先瞄準誰（記 secs 秒；溫特開槍打的、正在打核心的隊員都算）
  //   核心血量剩 enrageAt 成以下：暴怒，水砲、水柱衝天的間隔變成 enrageMul 倍（0.6＝快很多）
  grudge: { secs: 8, enrageAt: .5, enrageMul: .6 },
  strandSecs: 6,              // 被推上岸擱淺幾秒才跳回水裡
  strandMul: 2,               // 擱淺時被打的傷害倍率
  hopSecs: .75,               // 擱淺後跳回水裡要幾秒
  hopHeight: 90,              // 跳回水裡時跳多高（像素）
  flop: [.9, 1.8],            // 擱淺時隔幾秒拍一下
  flopLift: 16,               // 拍起來多高（像素）
  // 導電：被雷電打到時多扣牠多少血、池裡的隊友／溫特扣多少血、池裡的其他怪物扣多少血、隊友被電暈幾秒、多久才能再導電一次（秒）
  shock: { boss: 60, mate: 12, minion: 40, daze: .8, cd: .6 },
  // 叫小弟：血量剩幾成時叫（每個只叫一次）、叫幾隻、潛到最遠的地方躲幾秒、躲的時候游多快（倍率）
  minions: { at: [.7, .4], count: 3, hideSecs: 2.5, fleeMul: 1.8 },
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
  G.fishKing = { e, ...R, area: spot.area || [0, 0, COLS - 1, ROWS - 1], deep: spot.deep || null, peekZones: spot.peek || null, leapZones: spot.leap || null, leapT: fkRand(P.leap.every), phase: 'hidden', sub: true, t: 0, goal: null, ang: Math.PI, age: 0,
    cannon: null, cannonT: fkRand(P.cannon.every), geysers: [], geyserT: fkRand(P.geyser.every) * .6, sparks: [], shockCd: 0,
    minionsDone: 0, hideT: 0, home: { x: hx, y: hy }, peekT: fkRand(P.peek.every) * .5, core: fkGuardCore(spot) };
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
// 身體多寬 → 中心至少離岸邊幾格（身體邊緣到岸邊至少留 FISH_KING.shoreGap 格；算法跟 js/water-monsters.js 的 aquaMarginOf 一樣，只是空隙用魚頭王自己的）
const fkMargin = width => width ? Math.ceil(.5 + (FISH_KING.shoreGap ?? 1) + width / 2 / CELL) : 0;
const fkRoomyAt = (K, x, y) => !K.swimSet || K.swimSet.has(fkCellKey(x, y));

// ---- 每一幀（js/pool-tide.js 的 updatePoolTide 呼叫；潛水時牠不在 G.enemies 裡，所以由這裡自己動）----
function updateFishKing(dt) {
  const K = fishKingState(); if (!K) return;
  fkRumbleStep(dt);   // 落地／落水的持續搖晃
  updateFkGeysers(K, dt);
  fkRippleStep(K, dt);   // 游泳時的水波紋
  K.sparks = K.sparks.filter(s => (s.t += dt) < s.life);
  fkImpactAge(K, dt);   // 水砲打到地上的白色水花：慢慢長大、變形、淡掉（水砲停了也會播完）
  if (K.shockCd > 0) K.shockCd -= dt;
  if (K.paraCd > 0) K.paraCd -= dt;
  if (K.done) return;
  const e = K.e;
  if (!fishKingAlive(K)) { K.done = true; K.cannon = null; K.paraT = 0; e.tremble = false; fkShow(K, true); return; }
  const P = FISH_KING;
  // 有沒有被溫特打到：溫特的手槍、特殊子彈打中都會設 playerAggroT（隊員打的不會）；牠不用仇恨，讀完就歸零，下次有值＝又被打了
  const playerHit = (e.playerAggroT || 0) > 0; e.playerAggroT = 0;
  // 被雷電打到：發抖、掉下去（fishKingShocked 開始的）
  if (K.phase === 'shocked') { fkShockStep(K, dt); return; }
  // 開戰前：躲在水裡，偶爾冒頭偷看；核心被打到就正式登場
  if (K.phase === 'hidden' || K.phase === 'peek') {
    if (K.phase === 'peek') e.hp = e.maxhp;   // 還沒開戰：打不死、不扣血
    const hit = fkHitCore(K);
    if (hit) { fkIntroStart(K, hit); return; }
    if (K.phase === 'peek') { if (playerHit) fkPeekFlinch(K); fkPeekStep(K, dt); return; }
    if ((K.peekT -= dt) <= 0) { K.peekT = fkRand(P.peek.every); fkPeekStart(K); }
    return;
  }
  fkGrudgeStep(K);   // 記仇：誰在打牠守的核心；核心剩一半暴怒
  if (K.paraT > 0) { fkParaStep(K, dt); return; }   // 在岸上被電麻痺：什麼都不做（擱淺的話被打照樣比較痛）
  if (K.phase === 'intro') { fkIntroStep(K, dt); return; }
  if (K.phase === 'leap') { fkLeapStep(K, dt); return; }
  if (K.phase === 'landJump') { fkLandJumpStep(K, dt); return; }   // 跳上岸準備噴水砲
  if (K.phase === 'land') { e.dmgTakenMul = 1; fkLandStep(K, dt); return; }   // 在岸上噴水砲
  e.dmgTakenMul = K.phase === 'strand' ? P.strandMul : 1;   // 擱淺：被打比較痛（js/fish-head.js 的 fishHeadArmor 乘上去）
  fkMinionCheck(K);
  // 被推上岸：擱淺
  if (K.phase === 'swim' && !K.sub && !deepWaterAtPoint(e.x, e.y)) fkStrand(K);
  if (K.phase === 'strand') { fkStrandStep(K, dt); return; }
  if (K.phase === 'hop') { fkHopStep(K, dt); return; }
  // 被電到沉下去消失：過一下再從靠近人的岸邊浮出來
  if (K.goneT > 0) {
    if ((K.geyserT -= dt * fkRage(K)) <= 0) { K.geyserT = fkRand(P.geyser.every); fkStartGeysers(K); }
    if ((K.goneT -= dt) <= 0) fkReappear(K);
    return;
  }
  // 被溫特的一般子彈打到（浮在水面上時）：閃白、轉身往下潛
  if (playerHit && K.phase === 'swim' && !K.sub && !(K.turnT > 0)) fkFlinch(K);
  // 開戰後浮上來：慢慢浮出水面（越接近水面越慢）
  if (K.riseT != null && !K.sub) {
    K.riseT += dt; const k = Math.min(1, K.riseT / (P.surfaceRise || .01));
    e.fkRise = 1 - (1 - k) * (1 - k);
    if (k >= 1) { K.riseT = null; e.fkRise = null; }
  }
  // 水柱衝天：醒著就會（潛水時也會）；暴怒時比較常噴
  if ((K.geyserT -= dt * fkRage(K)) <= 0) { K.geyserT = fkRand(P.geyser.every); fkStartGeysers(K); }
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
    if (K.leapRoute) { if (fkLeapRouteStep(K, dt)) return; }   // 正在游去海豚躍路線的起點（地圖編輯器畫的）：游到就跳
    else if ((K.leapT -= dt) <= 0) { if (fkLeapStart(K, Math.round(fkRand(P.leap.hops)) - 1)) return; K.leapT = 1.5; }   // 海豚跳換區（找不到地方跳：等一下再試）
    if (K.t <= 0 && !K.approach) { K.approach = true; K.goal = fkShoreGoal(K); K.t = P.approachMax; }   // 潛水時間到：游去岸邊（靠近人的地方）
    if (K.approach && (K.t <= 0 || (K.goal && Math.hypot(K.goal.x - e.x, K.goal.y - e.y) < 24))) {
      if (Math.random() < (P.cannon.fromDive || 0) && fkStartCannon(K)) return;   // 有機會直接從水裡跳上岸噴水砲
      fkSurface(K);
    }
  } else if (K.turnT > 0) {   // 轉身露出背面，等一下就潛下去
    K.turnT -= dt; fkFace(e, 'back');
    const k = Math.max(0, K.turnT / (K.turnT0 || FISH_KING.diveTurn)); e.fkRise = (K.turnRise ?? 1) * k * k * (3 - 2 * k);   // 轉身時慢慢沉下去
    if (K.turnT <= 0) fkDive(K);
    return;
  } else {
    if (K.t <= 0) { K.turnT = K.turnT0 = P.diveTurn; K.turnRise = e.fkRise ?? 1; return; }
    if ((K.cannonT -= dt * fkRage(K)) <= 0) { if (fkStartCannon(K)) { K.cannonT = fkRand(P.cannon.every); return; } K.cannonT = P.cannon.retry || fkRand(P.cannon.every); }   // 暴怒時比較常噴；找不到岸就等一下再找
  }
  fkSwim(K, dt, 1);
}
// ---- 記仇、暴怒（FISH_KING.grudge）----
// 每一幀：牠守的核心掉血了 → 記下是誰打的（溫特開槍打的：js/game.js 記在核心的 lastHitBy；隊員：正在瞄準這顆核心的）
function fkGrudgeStep(K) {
  const core = K.core, Gd = FISH_KING.grudge; if (!core || !Gd) return;
  const now = performance.now() / 1000, hp = core.dead ? 0 : core.hp;
  if (K.coreSeen == null) K.coreSeen = hp;
  if (hp < K.coreSeen - .01) {
    const who = (G.towers || []).filter(t => t.hp > 0 && t.target === core);
    if (core.lastHitBy === G.player && now - (core.lastHitAt || -9) < .6) who.push(G.player);
    if (!who.length && G.player && G.player.hp > 0) who.push(G.player);   // 炸彈、火海這類算不出是誰的：算溫特
    K.grudge = K.grudge || new Map();
    for (const a of who) {
      if (!K.grudge.has(a) || K.grudge.get(a) < now) flash(a === G.player ? FISH_KING.name + '盯上你了！' : '被' + FISH_KING.name + '盯上了！', a.x, a.y - 64, '#ff8a7a', 1.2);
      K.grudge.set(a, now + Gd.secs);
    }
  }
  K.coreSeen = hp;
  if (!K.enraged && core.maxhp && hp <= core.maxhp * Gd.enrageAt) {   // 核心剩一半：暴怒
    K.enraged = true;
    if (typeof coreBanner === 'function') coreBanner(FISH_KING.name + '暴怒了', '水砲、水柱衝天變得更頻繁！', '#ff6a4a');
    if (typeof bossSfxAt === 'function') bossSfxAt('fishHurt', K.e.x, K.e.y, 1.4, 'fish-king-enrage');
    fkRumble(K.e.x, K.e.y, FISH_KING.impact.waterShake, FISH_KING.impact.waterSecs);
  }
}
// 暴怒時計時器跑得比較快（間隔變成 enrageMul 倍）
const fkRage = K => K.enraged && FISH_KING.grudge.enrageMul > 0 ? 1 / FISH_KING.grudge.enrageMul : 1;
// 這個人是不是正被記仇（打過牠守的核心、還在記仇時間內）
const fkGrudged = (K, a) => !!(K.grudge && K.grudge.get(a) > performance.now() / 1000);
// ---- 開戰前：冒頭偷看 ----
// 地圖上有沒有核心被打到（扣了血）：回傳那顆核心
// （泡在深水裡、沉睡中的核心被打不會扣血，所以看 js/anomalous-core.js 記下的 struck＝被打過，或血量少了）
// K.core＝牠守的那顆（地圖設定有寫 core 時）：只看那一顆；沒寫就看全部
const fkHitCore = K => (K && K.core ? [K.core] : (G.cores || [])).find(c => !c.dead && (c.struck || (c.maxhp && c.hp < c.maxhp - .01))) || null;
// 牠守哪一顆核心：地圖設定的 core 那一格最近的核心（沒寫 core＝不指定）
function fkGuardCore(spot) {
  if (!spot.core) return null;
  const [x, y] = center(...spot.core);
  let best = null, bd = Infinity;
  for (const c of G.cores || []) { const d = Math.hypot(c.x - x, c.y - y); if (d < bd) { bd = d; best = c; } }
  return best;
}
// 這格深水在不在地圖右邊的範圍（maps 的 area）
const fkInArea = (K, c, r) => c >= K.area[0] && c <= K.area[2] && r >= K.area[1] && r <= K.area[3];
// 這格在不在冒頭偷看的水域裡（maps 的 peek；沒寫＝都可以）
const fkInPeekZone = (K, c, r) => !K.peekZones || K.peekZones.some(([a, b, cc, d]) => c >= a && c <= cc && r >= b && r <= d);
// 這格在不在開戰後海豚跳的水域裡（maps 的 leap；沒寫＝都可以）
const fkInLeapZone = (K, c, r) => !K.leapZones || K.leapZones.some(([a, b, cc, d]) => c >= a && c <= cc && r >= b && r <= d);
// 這格在不在右邊的超深水區（maps 的 deep）
const fkInDeep = (K, c, r) => !!K.deep && c >= K.deep[0] && c <= K.deep[2] && r >= K.deep[1] && r <= K.deep[3];
function fkPeekStart(K) {
  const p = G.player; if (!p || p.hp <= 0) return;
  const P = FISH_KING.peek, m = fkMargin(K.e.drawWidth), pick = { deep: [[], []], near: [[], []] };   // [照得到的, 暗處的]
  for (const k of deepWaterCells()) {
    const [c, r] = k.split(',').map(Number); if (!fkInArea(K, c, r) || !fkInPeekZone(K, c, r)) continue;   // 只在指定的水域冒頭
    const deep = fkInDeep(K, c, r);
    const [x, y] = center(c, r), d = Math.hypot(x - p.x, y - p.y) / CELL;
    if (d < P.distMin || d > (deep ? (P.deepDistMax || P.distMax) : P.distMax) || !hasLineOfSight(x, y, p.x, p.y)) continue;   // 超深水區：遠一點也會冒
    if (![[1, 0], [-1, 0], [0, 1], [0, -1]].every(([dc, dr]) => deepWaterAtPoint(x + dc * CELL * .6, y + dr * CELL * .6))) continue;   // 四周也是水（身體不會凸到岸上）
    if (fkShoreDist(k) < m) continue;   // 離岸邊不夠遠：身體會穿到岸上
    const lit = typeof isLit === 'function' && isLit(x, y - 40) ? 0 : 1;
    if (deep) pick.deep[lit].push([x, y, k]);
    if (!deep || d <= P.distMax) pick.near[lit].push([x, y, k]);   // 超深水區在一般距離內的也算進一般的
  }
  const choose = g => g[0].length ? g[0] : g[1];   // 盡量挑照得到的
  const deepPool = choose(pick.deep), nearPool = choose(pick.near);
  const pool = deepPool.length && (Math.random() < (P.deepChance ?? 0) || !nearPool.length) ? deepPool : nearPool;   // 有幾成挑右邊的超深水區
  if (!pool.length) return;   // 溫特附近沒有右邊的深水：這次不冒頭
  const [x, y, key] = pool[Math.floor(Math.random() * pool.length)], e = K.e;
  e.x = x; e.y = y; e.faceRight = p.x > x; e.slimeLift = 0; e.fkRise = 0; e.mbTilt = 0; fkFace(e, 'front');
  e.hideBar = true;   // 偷看時頭上不畫血條（還沒開戰）
  e.fkPeek = true; e.hp = e.maxhp;   // 放進怪物清單：溫特打得到（隊員只有雷電的會打，js/game.js 的 pickSentryTarget）
  K.phase = 'peek'; K.peek = { t: 0, x, y, swim: fkRegionFrom(key, e.drawWidth).swim.filter(k => { const [c, r] = k.split(',').map(Number); return fkInPeekZone(K, c, r); }), goal: null };   // swim＝冒頭時慢慢游得到的地方（也只在指定的水域裡）
  fkShow(K, true);
  if (typeof poolCrownSplash === 'function') poolCrownSplash(G.poolSplash || (G.poolSplash = []), x, fkWaterY(e), fkSplashSc(e, FISH_KING.peek.splashRise));   // 冒頭：水面那裡冒一圈水花（照牠的體型），慢慢浮上來
  if (typeof sfxAt === 'function') sfxAt('poolWaterDrop', x, y, .8, 'fish-king-peek');
}
function fkPeekStep(K, dt) {
  const e = K.e, P = FISH_KING.peek, p = G.player, Pk = K.peek;
  Pk.t += dt;
  e.knockT = 0; e.x = Pk.x; e.y = Pk.y;   // 被子彈擊退也不會亂飄（位置由這裡管）
  const ease = k => k * k * (3 - 2 * k);
  // 被溫特打到：轉身往下潛（fkPeekFlinch 開始的）
  if (Pk.dive != null) {
    Pk.dive += dt; fkFace(e, 'back');
    const k = Math.min(1, Pk.dive / (FISH_KING.flinch.turn || .5));
    e.fkRise = Pk.diveFrom * (1 - ease(k));
    if (k >= 1) fkPeekEnd(K);
    return;
  }
  const sinkAt = P.rise + P.stay, sink = P.sink || P.rise;
  // 慢慢游（冒頭的這段時間在附近游來游去）
  let moved = false;
  if (P.drift > 0 && Pk.t < sinkAt + sink * .5 && Pk.swim && Pk.swim.length) {
    if (!Pk.goal || Math.hypot(Pk.goal.x - e.x, Pk.goal.y - e.y) < 6) {
      Pk.goal = null;
      for (let n = 0; n < 12; n++) {   // 挑附近（4 格內）游得到的一格
        const [x, y] = center(...Pk.swim[Math.floor(Math.random() * Pk.swim.length)].split(',').map(Number));
        const d = Math.hypot(x - e.x, y - e.y); if (d < CELL * 1.2 || d > CELL * 4) continue;
        Pk.goal = { x, y }; break;
      }
    }
    if (Pk.goal) {
      const dx = Pk.goal.x - e.x, dy = Pk.goal.y - e.y, d = Math.hypot(dx, dy) || 1, sp = Math.min(d, P.drift * dt);
      Pk.x += dx / d * sp; Pk.y += dy / d * sp; e.x = Pk.x; e.y = Pk.y; moved = true;
      if (Math.abs(dx) > 4) e.faceRight = dx > 0;
    }
  }
  if (!moved && p) e.faceRight = p.x > e.x;   // 沒在游：盯著溫特
  fkFace(e, 'front', moved);
  // 慢慢浮出來（越接近水面越慢）→ 在附近游、盯著溫特看（身體隨水微微起伏）→ 慢慢沉下去（一開始很慢，像是捨不得移開視線）
  e.fkRise = Pk.t < P.rise ? ease(Pk.t / P.rise)
    : Pk.t < sinkAt ? 1 - .04 * (1 - Math.cos((Pk.t - P.rise) * 1.6))
    : Math.max(0, 1 - ease(Math.min(1, (Pk.t - sinkAt) / sink)));
  if (Pk.t >= sinkAt && !Pk.sank) { Pk.sank = true; if (typeof poolCrownSplash === 'function') poolCrownSplash(G.poolSplash || (G.poolSplash = []), e.x, fkWaterY(e), fkSplashSc(e, FISH_KING.peek.splashSink)); }   // 沉下去：在水面那裡、跟身體差不多寬的水花
  if (Pk.t >= sinkAt + sink) fkPeekEnd(K);
}
// 冒頭偷看時被溫特的一般子彈打到：閃白、轉身往下潛
function fkPeekFlinch(K) {
  const e = K.e, Pk = K.peek; if (!Pk || Pk.dive != null) return;
  Pk.dive = 0; Pk.diveFrom = e.fkRise ?? 1;
  fkFlashWhite(e); e.faceRight = !e.faceRight;   // 轉身（背對溫特）
  if (typeof poolCrownSplash === 'function') poolCrownSplash(G.poolSplash || (G.poolSplash = []), e.x, fkWaterY(e), fkSplashSc(e, FISH_KING.peek.splashSink));
  if (typeof sfxAt === 'function') sfxAt('poolWaterDrop', e.x, e.y, .8, 'fish-king-peek-dive');
}
// 偷看結束：沉回水裡、拿出怪物清單
function fkPeekEnd(K) {
  const e = K.e; K.phase = 'hidden'; K.peek = null; e.fkRise = null; e.fkPeek = false; e.mbTilt = 0;
  fkShow(K, false);
}
// 閃白（被打到的那一下）
function fkFlashWhite(e) { e.hitT = Math.max(e.hitT || 0, .2); e.hitColor = '#ffffff'; }
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
  e.x = x; e.y = y; e.fkRise = null; e.eliteAwake = true; e.hideBar = false; e.fkPeek = false; e.mbTilt = 0; e.tremble = false;
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
  fkWaterImpact(e, 1.2);   // 登場落水：比平常震更大
  if (typeof bossImpact === 'function') bossImpact(e.x, e.y, 0, .05);   // 很近才頓一下
  K.phase = 'swim'; K.sub = false; K.t = fkRand(P.surface) * .6; K.cannonT = 1;
}
// js/render.js：開戰前冒頭偷看時（不在怪物清單裡）也要畫出來，跟人物一起排前後
function fishKingSortables(out) {
  const K = fishKingState(); if (!K || K.phase !== 'peek' || !fishKingAlive(K)) return;
  const e = K.e; if (G.enemies.includes(e)) return;   // 在怪物清單裡：一般畫怪物的地方會畫
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
  if (surge && typeof poolSurgeStart === 'function') poolSurgeStart(e.x, e.y, 'land', FISH_KING.surge);   // 用魚頭王自己的溢水大小（FISH_KING.surge）   // 水溢上岸、把人推開一點（js/pool-surge.js）
}
// ---- 巨物落地／落水：畫面搖晃、裂痕、落地聲（FISH_KING.impact）----
// 震一下並持續 dur 秒慢慢減弱（一般的 addShake 一瞬間就衰減完，巨物要震久一點才感覺得到；做法跟虱目魚王的 mkRumble 一樣）
function fkRumble(x, y, amt, dur) {
  const p = G.player; if (!p) return;
  const R = (typeof BOSS_SHAKE !== 'undefined' && BOSS_SHAKE.range) || 30, d = Math.hypot(p.x - x, p.y - y) / CELL;
  if (d > R) return;
  const a = amt * (.25 + .75 * Math.pow(1 - d / R, 2));   // 平方衰減：貼身最大，越遠越小
  const Rb = G.fkRumble;
  if (Rb && Rb.t > 0 && Rb.amt * Rb.t / Rb.dur > a) return;   // 正在震更大的：不要蓋掉
  G.fkRumble = { amt: a, t: dur, dur };
  addShake(a);
}
function fkRumbleStep(dt) {
  const Rb = G.fkRumble; if (!Rb || Rb.t <= 0) return;
  Rb.t -= dt; const k = Math.max(0, Rb.t / Rb.dur);
  if (k > 0 && typeof shakeAmt !== 'undefined') shakeAmt = Math.max(shakeAmt, Rb.amt * (.35 + .65 * k));
}
// 重重摔在地上：大震動、裂痕、塵土、白色衝擊圈、落地聲；power＝強度倍率
function fkLandImpact(e, power = 1) {
  const I = FISH_KING.impact, x = e.x, y = e.y + 14, now = performance.now() / 1000, w = e.drawWidth || 200;
  fkRumble(e.x, e.y, I.landShake * power, I.landSecs);
  if (typeof addHitstop === 'function' && G.player && Math.hypot(G.player.x - e.x, G.player.y - e.y) < CELL * 6) addHitstop(.05);   // 很近才頓一下
  for (let i = 0; i < 2; i++) G.effects.push({ ring: true, x, y, r: 10 + i * 8, r2: w * (.45 + i * .25), life: .4 + i * .12, life0: .4 + i * .12, color: i ? '#b9b2a2' : '#ffffff' });
  if (typeof rockBurstFx === 'function' && typeof ELITE_BIRD !== 'undefined') rockBurstFx(x, y, ELITE_BIRD.runDust);   // 揚起塵土（js/gourd-monkey.js）
  if (I.crack > 0) {   // 地上裂開（跟鳥頭大隊長、虱目魚王共用的裂痕，js/elite-bird-head.js 的 drawEliteGround 畫）
    const cracks = G.eliteCracks = G.eliteCracks || [];
    cracks.push({ size: I.crack * power, power: 1, life: 6, x, y, at: now });
    for (let i = 0; i < 4; i++) cracks.push({ size: I.crack * power * .5, life: 6, x: x + (Math.random() * 2 - 1) * w * .22, y: y - 2 + (Math.random() * 2 - 1) * 10, at: now, rot: (Math.random() * 2 - 1) * .8, flip: Math.random() < .5 });
    if (cracks.length > 40) cracks.splice(0, cracks.length - 40);
  }
  if (typeof sfxAt === 'function') sfxAt('milkfishKingStep', e.x, e.y, I.landVol * power, 'fish-king-land');   // 落地聲（跟虱目魚王落地同一個）
}
// 重重摔進水裡：畫面搖晃（水花、溢水另外處理）
function fkWaterImpact(e, power = 1) {
  const I = FISH_KING.impact;
  fkRumble(e.x, e.y, I.waterShake * power, I.waterSecs);
}
function fkSurface(K) {
  const e = K.e; K.sub = false; K.approach = false; K.t = fkRand(FISH_KING.surface); K.cannonT = Math.max(K.cannonT, FISH_KING.surfaceRise || 0);   // 浮出來之前不會開水砲
  K.riseT = 0; e.fkRise = 0;   // 從水裡慢慢浮上來（updateFishKing 一幀一幀推）
  fkShow(K, true); fkSplash(e, FISH_KING.splashSize * .6, false);
}
function fkDive(K) {
  K.leapRoute = null;   // 還沒跳的海豚躍路線：不跳了
  const e = K.e; K.sub = true; K.t = fkRand(FISH_KING.dive); K.goal = null; K.turnT = 0; K.turnT0 = 0; K.turnRise = null; K.riseT = null; e.fkRise = null; e.mbTilt = 0;
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
  const canGo = (x, y) => K.region.has(fkCellKey(x, y)) && deepWaterAtPoint(x, y) && (K.leapRoute || fkRoomyAt(K, x, y) || !fkRoomyAt(K, e.x, e.y));   // 游去海豚躍路線的起點：照編輯器指定的位置，靠岸也游過去
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
// 水砲：先跳上岸（離水 shore 格內、身體整個站得下、看得到目標、目標在射程內的地方），落地後才開始預警、噴射；回傳 true＝開始了
function fkStartCannon(K) {
  const e = K.e, P = FISH_KING.cannon, list = fkTargets(K, false);
  if (!list.length) return false;
  const mad = list.filter(a => fkGrudged(K, a));   // 記仇：打過核心的人優先
  const pool = mad.length ? mad : list, t = pool[Math.floor(Math.random() * pool.length)];
  const spot = fkLandSpot(K, t); if (!spot) return false;   // 附近找不到能跳上去的岸：這次不噴
  K.phase = 'landJump'; K.landJump = { t: 0, from: { x: e.x, y: e.y }, to: spot, target: t };
  K.sub = false; K.approach = false; K.goal = null; K.riseT = null; K.turnT = 0; e.fkRise = null; e.airborne = true; e.moving = false;
  e.faceRight = spot.x > e.x;
  fkShow(K, true);
  fkSplash(e, FISH_KING.splashSize * .8, false);
  if (typeof sfxAt === 'function') sfxAt('fishSpray', e.x, e.y, .5, 'fish-king-cannon-windup');
  return true;
}
// 找岸上的落腳處：離牠 reach 格內、離水 shore 格內、身體四周都不是牆也不是水、看得到目標、目標在射程內（太近的不要），挑跳得最近的幾個之一
function fkLandSpot(K, t) {
  const e = K.e, P = FISH_KING.cannon, [c0, r0] = cellAt(e.x, e.y), R = Math.ceil(P.reach), bw = (e.drawWidth || 200) * .28, out = [];
  const nearWater = (x, y) => { for (let d = CELL * .5; d <= P.shore * CELL; d += CELL * .5) for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; if (deepWaterAtPoint(x + Math.cos(a) * d, y + Math.sin(a) * d)) return true; } return false; };
  for (let r = r0 - R; r <= r0 + R; r++) for (let c = c0 - R; c <= c0 + R; c++) {
    if (!inGrid(c, r) || isWall(c, r)) continue;
    const [x, y] = center(c, r), d = Math.hypot(x - e.x, y - e.y);
    if (d > P.reach * CELL || d < CELL) continue;
    if ([[0, 0], [-bw, 0], [bw, 0], [0, -14], [0, 10], [-bw, -14], [bw, -14]].some(([dx, dy]) => deepWaterAtPoint(x + dx, y + dy) || solidBlocksPoint(x + dx, y + dy))) continue;   // 整個身體站在地上
    if (!nearWater(x, y) || !fkLeapClear(e.x, e.y, x, y)) continue;
    const td = Math.hypot(t.x - x, t.y - y);
    if (td > P.range * CELL * .85 || td < 2 * CELL || !hasLineOfSight(x, y, t.x, t.y)) continue;
    out.push({ x, y, d });
  }
  if (!out.length) return null;
  out.sort((a, b) => a.d - b.d);
  return out[Math.floor(Math.random() * Math.min(4, out.length))];
}
// 對準目標，開始預警（在岸上落地之後呼叫）
function fkAimCannon(K, t) {
  const e = K.e, P = FISH_KING.cannon;
  e.faceRight = t.x > e.x; fkFace(e, 'front');
  const m = fkMouth(e), aim = Math.atan2(t.y - m.y, t.x - m.x), dir = Math.random() < .5 ? 1 : -1;
  K.cannon = { t: 0, a0: aim - dir * P.arc / 2, a1: aim + dir * P.arc / 2, hit: new Set(), firing: false, seed: Math.random() * 9 };
}
// 跳上岸：拋物線跳過去，落地震一下，接著對準目標開始預警
function fkLandJumpStep(K, dt) {
  const e = K.e, P = FISH_KING.cannon, J = K.landJump;
  J.t += dt; const k = Math.min(1, J.t / P.jumpSecs);
  e.knockT = 0;
  e.x = J.from.x + (J.to.x - J.from.x) * k; e.y = J.from.y + (J.to.y - J.from.y) * k;
  e.slimeLift = Math.sin(Math.PI * k) * P.jumpHeight; e.airborne = k < 1;
  const side = e.faceRight ? 1 : -1; e.mbTilt = -side * .4 * (1 - 2 * k);
  fkFace(e, 'front');
  if (k < 1) return;
  e.airborne = false; e.slimeLift = 0; e.mbTilt = 0;
  fkLandImpact(e);   // 跳上岸：重重落地（震動、裂痕、落地聲）
  const t = J.target && J.target.hp > 0 ? J.target : fkTargets(K, false)[0];
  K.landJump = null; K.phase = 'land'; K.landT = P.stay;
  if (t) fkAimCannon(K, t);
}
// 在岸上：噴完水砲再待一下，然後跳回水裡
function fkLandStep(K, dt) {
  const e = K.e;
  if (deepWaterAtPoint(e.x, e.y)) { K.cannon = null; K.phase = 'swim'; fkDive(K); return; }   // 被推回水裡了
  if (K.cannon) { fkCannonStep(K, dt); return; }
  fkFace(e, 'front'); e.moving = false;
  if ((K.landT -= dt) <= 0) fkJumpBack(K);
}
// 跳回最近、離岸夠遠的深水（擱淺結束、在岸上噴完水砲都用）
function fkJumpBack(K) {
  const e = K.e;
  let best = null, bd = Infinity;
  const m = fkMargin(e.drawWidth);
  for (const k of deepWaterCells()) {   // 右邊範圍裡哪一池都可以：被電掉在走道上時，跳進旁邊那一池
    const [c, r] = k.split(',').map(Number); if (!fkInArea(K, c, r) || fkShoreDist(k) < m) continue;
    const [x, y] = center(c, r), d = Math.hypot(x - e.x, y - e.y); if (d < bd && deepWaterAtPoint(x, y)) { bd = d; best = { x, y, k }; }
  }
  if (!best) for (const k of K.swim || K.list) { const [x, y] = center(...k.split(',').map(Number)); const d = Math.hypot(x - e.x, y - e.y); if (d < bd && deepWaterAtPoint(x, y)) { bd = d; best = { x, y, k }; } }
  if (!best) best = { ...K.home };
  K.phase = 'hop'; K.hop = { t: 0, from: { x: e.x, y: e.y }, to: best }; e.airborne = true; e.slimeLift = 0;
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
    if (!fkInWater(a) && a.hp > 0) { const [px, py] = fkPushToWater(a, ux, uy, P.push * CELL, P.toWater); knockActor(a, px, py, P.push * CELL, .4); if (a !== G.player) { a.navPath = null; a.navGoal = null; } }   // 往遠離牠的方向沖開（被沖下水就掉進水裡）
  }
  // 水柱經過的地方把火澆熄（魚頭君本來就會滅火，js/fish-head.js）
  if (typeof firesAt === 'function' && typeof douseFire === 'function') for (const f of firesAt(end.x, end.y, 20)) douseFire(f, 1);
  if (Math.random() < dt * 14 && typeof poolFallSplash === 'function') poolFallSplash(end.x, end.y + 4, false);
  fkCannonDrops(K, m, end, dt);
  fkImpactSpawn(K, end.x, end.y, c.ang || 0, dt);   // 打到地上：一直冒出新的白色水花團
  if (k >= 1) K.cannon = null;
}
// 水柱兩邊甩出去的水滴、打到的地方往上噴的水花（畫在 G.poolSplash，跟池核 BOSS 的水花同一套：js/pool-boss.js 的 drawPoolSplash）
function fkCannonDrops(K, m, end, dt) {
  const list = G.poolSplash || (G.poolSplash = []), W = FISH_KING.cannon.width, L = Math.hypot(end.x - m.x, end.y - m.y) || 1;
  const ux = (end.x - m.x) / L, uy = (end.y - m.y) / L;
  for (let n = Math.round(dt * 70 + Math.random()); n > 0; n--) {   // 沿著水柱甩出去的水滴（往兩側、往上一點）
    const k = .2 + Math.random() * .8, side = Math.random() < .5 ? -1 : 1, sp = 40 + Math.random() * 90;
    const x = m.x + (end.x - m.x) * k, y = m.y + (end.y - m.y) * k, z = fkCannonZ(m.z, k, W) * .9;
    list.push({ x, y, z, vx: -uy * side * sp + ux * 60, vy: ux * side * sp * .5 + uy * 60, vz: 40 + Math.random() * 120, r: 1.5 + Math.random() * 2.5 * (W / 60), t: 0, life: 1.2 });
  }
  for (let n = Math.round(dt * 45 + Math.random()); n > 0; n--) {   // 打到的地方往上、往四周噴
    const a = Math.atan2(uy, ux) + Math.PI + (Math.random() - .5) * 2.6, sp = 60 + Math.random() * 140;
    list.push({ x: end.x + (Math.random() - .5) * W * .4, y: end.y, z: 6, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * .5, vz: 150 + Math.random() * 220, r: 2 + Math.random() * 3 * (W / 60), t: 0, life: 1.3 });
  }
  if (list.length > 900) list.splice(0, list.length - 900);
}
// ---- 水砲打到地上的水花：好幾團白色水花疊在一起，每一團冒出來 → 長大、邊緣劇烈變形 → 散開淡掉，一團接一團，所以形狀一直在變 ----
// 數值在 FISH_KING.cannon 的 impact：每秒冒幾團、一團多大（水柱粗細的幾倍）、一團播幾秒、變形多劇烈（0～1）
function fkImpactSpawn(K, x, y, ang, dt) {
  const I = FISH_KING.cannon.impact || { rate: 26, size: .8, life: .45, wobble: .45, spread: 2.2 }, W = FISH_KING.cannon.width;
  const list = K.impact || (K.impact = []);
  K.impactAcc = (K.impactAcc || 0) + dt * I.rate;
  for (; K.impactAcc >= 1; K.impactAcc--) {
    // 四成是蓋在水柱尾端正中間的（把水柱的尾巴遮住），其他的往兩旁散得比較開（spread＝散開的寬度是水柱粗細的幾倍）
    const core = Math.random() < .4, ux = Math.cos(ang), uy = Math.sin(ang);
    const back = core ? Math.random() * W * .3 : Math.random() * W * 1.1 - W * .3, side = (Math.random() - .5) * W * (core ? .6 : (I.spread ?? 2.2));
    list.push({ x: x - ux * back - uy * side, y: y - uy * back * .5 + ux * side * .5, t: 0, life: I.life * (.7 + Math.random() * .6),
      r: W * I.size * (.45 + Math.random() * .55), seed: Math.random() * 100, n: 9 + Math.floor(Math.random() * 5), spin: (Math.random() - .5) * 3,
      up: 6 + Math.random() * W * .5 });   // up：往上衝多高（像素）
  }
  if (list.length > 60) list.splice(0, list.length - 60);
}
function fkImpactAge(K, dt) {
  if (!K.impact) return;
  for (const b of K.impact) b.t += dt;
  K.impact = K.impact.filter(b => b.t < b.life);
}
// 畫一團：n 個方向的半徑各自隨時間大幅抖動（不是固定的雲朵形），越到後面越攤開、越扁、越淡
function fkDrawImpactBlob(ctx, b, now, wob) {
  const k = b.t / b.life, grow = 1 - Math.pow(1 - Math.min(1, k * 1.6), 3);
  const R = b.r * (.35 + .9 * grow), flat = .55 - .2 * k, lift = b.up * Math.sin(Math.PI * Math.min(1, k * 1.2));
  const pts = [], rot = b.seed + b.spin * k;
  for (let i = 0; i < b.n; i++) {
    const a = rot + i / b.n * Math.PI * 2;
    const j = 1 + wob * (Math.sin(b.seed * 3 + i * 2.3 + now * 19) * .6 + Math.sin(b.seed + i * 5.1 - now * 31) * .4) * (.5 + k);   // 越後面抖越大
    pts.push([b.x + Math.cos(a) * R * j, b.y - lift + Math.sin(a) * R * j * flat]);
  }
  const mid = i => { const p = pts[i % b.n], q = pts[(i + 1) % b.n]; return [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]; };
  const path = dy => {
    ctx.beginPath(); const m0 = mid(b.n - 1); ctx.moveTo(m0[0], m0[1] + dy);
    for (let i = 0; i < b.n; i++) { const m = mid(i); ctx.quadraticCurveTo(pts[i][0], pts[i][1] + dy, m[0], m[1] + dy); }
    ctx.closePath();
  };
  const a = k < .7 ? 1 : 1 - (k - .7) / .3;
  ctx.globalAlpha = a * .55; ctx.fillStyle = '#b9e4f7'; path(R * .18); ctx.fill();   // 底下淡淡的藍色陰影（才看得出立體）
  ctx.globalAlpha = a * .95; ctx.fillStyle = '#ffffff'; path(0); ctx.fill();          // 白色水花
  if (k > .45) {   // 後半段破開：中間挖一個洞（水花散開成一圈）
    ctx.globalCompositeOperation = 'destination-out';
    ctx.globalAlpha = Math.min(1, (k - .45) / .4) * .9;
    ctx.beginPath(); ctx.ellipse(b.x, b.y - lift, R * .55 * (k - .3), R * .55 * (k - .3) * flat, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }
}
// 畫全部的水花團（另外畫在一張小畫布上再貼回來，挖洞時才不會把後面的地板也挖掉）
function fkDrawImpact(ctx, K, now) {
  const list = K && K.impact; if (!list || !list.length) return;
  const wob = (FISH_KING.cannon.impact || {}).wobble ?? .45;
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const b of list) { x0 = Math.min(x0, b.x - b.r * 2); x1 = Math.max(x1, b.x + b.r * 2); y0 = Math.min(y0, b.y - b.r * 2 - b.up); y1 = Math.max(y1, b.y + b.r * 1.5); }
  const w = Math.ceil(x1 - x0), h = Math.ceil(y1 - y0); if (w <= 0 || h <= 0 || w > 2000 || h > 2000) return;
  const off = fkDrawImpact.cv || (fkDrawImpact.cv = document.createElement('canvas'));
  if (off.width < w) off.width = w; if (off.height < h) off.height = h;
  const o = off.getContext('2d'); o.setTransform(1, 0, 0, 1, 0, 0); o.clearRect(0, 0, off.width, off.height); o.translate(-x0, -y0);
  for (const b of list) fkDrawImpactBlob(o, b, now, wob);
  ctx.save(); ctx.drawImage(off, 0, 0, w, h, x0, y0, w, h); ctx.restore();
}
// 水柱在 k（0＝嘴巴、1＝打到的地方）這一點離地多高：嘴巴的高度往下落，中間往上拱一點（像真的水，不是一條直直的光束）
const fkCannonZ = (z0, k, W) => z0 * (1 - k) * (1 - k * .35) + 8 * k + W * .55 * 4 * k * (1 - k);
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
  const list = fkTargets(K, true).sort(() => Math.random() - .5).sort((a, b) => fkGrudged(K, b) - fkGrudged(K, a)).slice(0, FISH_KING.geyser.count);   // 記仇的人排前面
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
    tx, ty, vh: P.up, speed: dist / flight, spin: 0, spinDir: tx >= 0 ? 1 : -1, lieSide: tx >= 0 ? 1 : -1, landDamage: P.landDamage,
    panic: isPlayer && P.panicPlayer != null ? P.panicPlayer : P.panic });   // 落水慌張幾秒：溫特照 panicPlayer（有給的話），隊員照 panic
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
  if (typeof sfxAt === 'function') bossSfxAt('fishHurt', e.x, e.y, 1, 'fish-king-strand');
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
  fkJumpBack(K);   // 跳回最近的深水
}
function fkHopStep(K, dt) {
  const e = K.e, P = FISH_KING, H = K.hop;
  H.t += dt; const k = Math.min(1, H.t / P.hopSecs);
  e.x = H.from.x + (H.to.x - H.from.x) * k; e.y = H.from.y + (H.to.y - H.from.y) * k;
  e.slimeLift = Math.sin(Math.PI * k) * P.hopHeight; e.faceRight = H.to.x > H.from.x; fkFace(e, 'front');
  if (k < 1) return;
  e.airborne = false; e.slimeLift = 0; K.hop = null; K.phase = 'swim';
  if (H.to.k && deepWaterCells().has(H.to.k)) Object.assign(K, fkRegionFrom(H.to.k, e.drawWidth));   // 之後在跳進去的那一池
  fkSplash(e, P.splashSize * 1.2, true);
  fkWaterImpact(e);   // 跳回水裡：畫面搖晃
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
  // 發抖、掉下去：冒頭偷看時（不扣血、沒有血條）、浮在水面上、跳在空中被電到都會
  const pre = K.phase === 'peek';
  if (K.phase === 'land' || K.phase === 'strand') { fkParalyze(K); return; }   // 在岸上被電：麻痺（岸上不導電）
  if (pre || K.phase === 'leap' || (K.phase === 'swim' && !K.sub)) {
    const inWater = (e.slimeLift || 0) < 5 && deepWaterAtPoint(e.x, e.y);
    fkShockStart(K, pre);
    if (pre || !inWater) return;   // 開戰前、在空中：不導電
  } else if (K.phase !== 'shocked') return;   // 擱淺、跳回水裡、登場中：不導電
  if (K.shock && K.shock.pre) return;
  if (K.shockCd > 0 || (e.slimeLift || 0) >= 5 || !deepWaterAtPoint(e.x, e.y)) return;   // 在空中、在岸上不導電
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

// ---- 在岸上被雷電打到：麻痺（FISH_KING.landShock）----
function fkParalyze(K) {
  const e = K.e, L = FISH_KING.landShock || { secs: 3, cd: 1.5 };
  if (K.paraT > 0 || K.paraCd > 0) return;   // 已經在麻痺、或剛麻痺完：不重來
  K.paraT = L.secs; K.cannon = null;   // 正在預警／噴的水砲中斷
  e.tremble = true; e.moving = false; e.knockT = 0;
  flash('麻痺！', e.x, e.y - (e.drawHeight || 190) - 10, '#fff27a', 1.2);
  if (typeof sfxAt === 'function') bossSfxAt('fishHurt', e.x, e.y, 1, 'fish-king-paralyzed');
  fkParaSparks(K, 5);
}
function fkParaSparks(K, n) {   // 身上竄來竄去的小電花
  const e = K.e, w = (e.drawWidth || 190) * .4, h = e.drawHeight || 190;
  for (let i = 0; i < n; i++) {
    const x = e.x + (Math.random() - .5) * w * 2, y = e.y - Math.random() * h * .7;
    K.sparks.push({ x1: x, y1: y, x2: x + (Math.random() - .5) * 60, y2: y + (Math.random() - .5) * 60, t: 0, life: .25, seed: Math.random() * 10 });
  }
}
function fkParaStep(K, dt) {
  const e = K.e;
  e.dmgTakenMul = K.phase === 'strand' ? FISH_KING.strandMul : 1;
  e.tremble = true; e.moving = false; e.knockT = 0;
  if (Math.random() < dt * 8) fkParaSparks(K, 1);
  if ((K.paraT -= dt) > 0) return;
  K.paraT = 0; e.tremble = false; K.paraCd = (FISH_KING.landShock || {}).cd || 0;   // 麻痺完：接著原本的事（在岸上就待一下跳回水裡、擱淺就繼續翻）
}

// ---- 被溫特的一般子彈打到：閃白、轉身往下潛 ----
function fkFlinch(K) {
  const e = K.e;
  K.cannon = null; K.riseT = null;
  K.turnT = K.turnT0 = FISH_KING.flinch.turn || .5; K.turnRise = e.fkRise ?? 1;   // 從現在浮出來的高度開始沉
  fkFlashWhite(e); e.faceRight = !e.faceRight;   // 轉身（背對打牠的方向）
}

// ---- 海豚跳換區 ----
// 從 (x1,y1) 跳到 (x2,y2) 中間有沒有牆擋著
function fkLeapClear(x1, y1, x2, y2) {
  const L = Math.hypot(x2 - x1, y2 - y1);
  for (let d = 10; d < L; d += 10) if (solidBlocksPoint(x1 + (x2 - x1) * d / L, y1 + (y2 - y1) * d / L)) return false;
  return true;
}
// ---- 地圖編輯器畫的海豚躍路線（地圖編輯器「🐬 魚頭王海豚躍」，MAP.fkLeaps：[{ at: '起跳那一格 欄,列', to: '落水那一格 欄,列' }]）----
// 有畫路線的地圖：要跳的時候，先潛水游到某條路線的起點，再照路線跳到終點；沒畫路線的地圖照原本的隨機跳
// 起點要在牠現在這一池裡（游得到），終點要是深水；這一池裡沒有任何路線的起點 → 這一池就不跳（要回來的話，記得也畫一條從那一池跳回來的路線）
const fkLeapRoutes = () => (typeof MAP !== 'undefined' && MAP && Array.isArray(MAP.fkLeaps)) ? MAP.fkLeaps.filter(r => r && typeof r.at === 'string' && typeof r.to === 'string') : [];
const fkKeyPoint = k => { const [x, y] = center(...k.split(',').map(Number)); return { x, y, k }; };
// 挑一條起點在這一池（或離牠 near 格內）、終點是深水的路線；偏向終點靠近人的那幾條
function fkPickRoute(K, near) {
  const e = K.e, list = [];
  for (const r of fkLeapRoutes()) {
    const a = fkKeyPoint(r.at), b = fkKeyPoint(r.to);
    if (!deepWaterAtPoint(b.x, b.y)) continue;   // 終點不是深水（畫錯、或水被抽乾）：不跳
    const d = Math.hypot(a.x - e.x, a.y - e.y) / CELL;
    if (near != null ? d > near : !(K.region.has(r.at) || d <= 2)) continue;
    list.push({ a, b, d });
  }
  if (!list.length) return null;
  const who = [G.player, ...(G.towers || [])].filter(t => t && t.hp > 0);
  let pool = list;
  if (who.length && pool.length > 1) {   // 偏向終點靠近人的路線：從比較近的那一半裡隨便挑
    const dist = q => Math.min(...who.map(t => Math.hypot(t.x - q.b.x, t.y - q.b.y)));
    pool = pool.sort((x, y) => dist(x) - dist(y)).slice(0, Math.ceil(pool.length / 2));
  }
  return pool[Math.floor(Math.random() * pool.length)];
}
// 照路線跳：起點就在旁邊（arrive 格內）就直接跳；不然先記下來，潛水游過去（fkLeapRouteStep）
// chain＝剛落水、要連跳：只看起點就在落點旁邊的路線，沒有就不連跳
function fkLeapRouteStart(K, hops, chain) {
  const R = fkPickRoute(K, chain ? Math.max(2, FISH_KING.leap.routeArrive) : null);   // 連跳：起點在落點 2 格內的路線
  if (!R) return null;   // 這一池沒有路線起點
  if (R.d <= FISH_KING.leap.routeArrive) return fkLeapGo(K, R.b, hops);
  K.leapRoute = { a: R.a, b: R.b, hops, t: 0 };
  return true;
}
// 正在游去路線的起點（潛在水裡）：到了就跳；游太久（起點太靠岸、身體過不去）就從現在的位置直接跳過去
function fkLeapRouteStep(K, dt) {
  const e = K.e, J = K.leapRoute, L = FISH_KING.leap;
  J.t += dt;
  if (!deepWaterAtPoint(J.b.x, J.b.y)) { K.leapRoute = null; K.leapT = fkRand(L.every); return false; }   // 終點的水被抽乾了：不跳了
  if (Math.hypot(J.a.x - e.x, J.a.y - e.y) <= L.routeArrive * CELL || J.t >= L.routeMaxSwim) return fkLeapGo(K, J.b, J.hops);
  K.goal = { x: J.a.x, y: J.a.y };   // 一直朝起點游（fkSwim 撞到邊時會換目標，這裡每一幀改回來）
  fkSwim(K, dt, L.routeSwimMul);
  return true;
}
// hops＝跳完這一下之後還要再連跳幾下；chain＝剛落水的連跳
function fkLeapStart(K, hops, chain) {
  if (fkLeapRoutes().length) return !!fkLeapRouteStart(K, hops, chain);   // 有畫路線：只照路線跳（這一池沒有路線起點就不跳）
  const e = K.e, L = FISH_KING.leap, m = fkMargin(e.drawWidth), other = [], same = [];
  for (const k of deepWaterCells()) {
    const [c, r] = k.split(',').map(Number); if (!fkInArea(K, c, r) || !fkInLeapZone(K, c, r) || fkShoreDist(k) < m) continue;   // 落點要在指定的水域裡、離岸夠遠
    const [x, y] = center(c, r), d = Math.hypot(x - e.x, y - e.y) / CELL;
    if (d < L.distMin || d > L.distMax || !fkLeapClear(e.x, e.y, x, y)) continue;
    (K.region.has(k) ? same : other).push({ x, y, k });
  }
  let pool = other.length && (Math.random() < L.otherPool || !same.length) ? other : same;   // 有幾成跳去別的水池
  if (!pool.length) return false;
  // 偏向靠近人的地方：照離溫特（或隊員）的距離排，從比較近的那一半裡隨便挑
  const who = [G.player, ...(G.towers || [])].filter(a => a && a.hp > 0);
  if (who.length) {
    const near = q => Math.min(...who.map(a => Math.hypot(a.x - q.x, a.y - q.y)));
    pool = pool.sort((a, b) => near(a) - near(b)).slice(0, Math.max(1, Math.ceil(pool.length / 2)));
  }
  return fkLeapGo(K, pool[Math.floor(Math.random() * pool.length)], hops);
}
// 從現在的位置跳到 to（{ x, y, k＝落點那一格 '欄,列' }）；hops＝跳完還要再連跳幾下
function fkLeapGo(K, to, hops) {
  const e = K.e, L = FISH_KING.leap;
  K.leapRoute = null;
  const far = Math.max(1, Math.sqrt(Math.hypot(to.x - e.x, to.y - e.y) / (6 * CELL)));   // 跳得比 6 格遠：飛久一點、高一點
  K.phase = 'leap'; K.leap = { t: 0, from: { x: e.x, y: e.y }, to, hops, secs: L.secs * far, height: L.height * far };
  K.sub = false; K.approach = false; K.goal = null; K.riseT = null; K.cannon = null; K.turnT = 0;
  e.fkRise = null; e.airborne = true; e.moving = false;
  if (Math.abs(to.x - e.x) > 4) e.faceRight = to.x > e.x;   // 直直往上下跳：照原本的方向
  fkShow(K, true);   // 在空中打得到
  fkSplash(e, FISH_KING.splashSize * .8 * (FISH_KING.leap.splashMul ?? 1), false);   // 起跳的水花
  return true;
}
function fkLeapStep(K, dt) {
  const e = K.e, L = FISH_KING.leap, H = K.leap;
  H.t += dt; const k = Math.min(1, H.t / (H.secs || L.secs));
  e.knockT = 0;   // 在空中不會被擊退（位置由這裡管）
  e.x = H.from.x + (H.to.x - H.from.x) * k; e.y = H.from.y + (H.to.y - H.from.y) * k;
  e.slimeLift = Math.sin(Math.PI * k) * (H.height || L.height); e.airborne = k < 1;
  const side = e.faceRight ? 1 : -1;
  e.mbTilt = -side * L.tilt * (1 - 2 * k);   // 起跳頭朝上、落下頭朝下（js/render.js 的 drawEnemy 照 mbTilt 轉）
  fkFace(e, 'front');
  if (k < 1) return;
  e.airborne = false; e.slimeLift = 0; e.mbTilt = 0;
  Object.assign(K, fkRegionFrom(H.to.k, e.drawWidth));   // 換到落下去的那一池
  K.leap = null; K.phase = 'swim';
  fkSplash(e, FISH_KING.splashSize * (FISH_KING.leap.splashMul ?? 1), false);   // 落水的水花
  fkWaterImpact(e);   // 海豚跳落水：畫面搖晃
  if (H.hops > 0 && fkLeapStart(K, H.hops - 1, true)) {   // 連跳：馬上又跳起來，落水這一下也溢水（推出去、退水拉回來；js/pool-surge.js）
    if (typeof poolSurgeStart === 'function') poolSurgeStart(H.to.x, H.to.y, 'land', FISH_KING.surge);
    return;
  }
  // 不連跳：接著潛下去（fkDive），潛下去那一下會溢水
  fkDive(K); K.leapT = fkRand(L.every);
}

// 被沖開的方向：照水柱方向（ux, uy），但旁邊 dist 像素內有深水的話，往水池那邊偏（最多偏 maxDeg 度，挑偏最少的那個方向）
// 回傳 [x 方向, y 方向]；附近沒有水、或 maxDeg 是 0，就照原本的水柱方向
function fkPushToWater(a, ux, uy, dist, maxDeg) {
  if (!maxDeg || typeof deepWaterAtPoint !== 'function') return [ux, uy];
  const base = Math.atan2(uy, ux), max = maxDeg * Math.PI / 180, reach = dist * .9;
  for (let off = 0; off <= max + 1e-6; off += Math.PI / 24) {   // 從水柱方向開始，每次往左右各多偏 7.5 度試試看
    for (const sgn of off ? [1, -1] : [1]) {
      const ang = base + sgn * off, cx = Math.cos(ang), cy = Math.sin(ang);
      for (let d = CELL * .5; d <= reach; d += CELL * .25) {
        if (solidBlocksPoint(a.x + cx * d, a.y + cy * d)) break;   // 中間有牆：這個方向不行
        if (deepWaterAtPoint(a.x + cx * d, a.y + cy * d)) return [cx, cy];
      }
    }
  }
  return [ux, uy];
}

// ---- 被雷電打到：發抖 → 轉 30 度露出背面垂直掉下來 → 擱淺或沉下去消失 ----
function fkShockStart(K, pre) {
  const e = K.e;
  K.shock = { stage: 'shake', t: 0, pre, x: e.x, y: e.y, lift: Math.max(0, e.slimeLift || 0), vy: 0 };
  K.phase = 'shocked'; K.cannon = null; K.turnT = 0; K.leap = null; K.riseT = null; K.approach = false;
  if (K.peek) { e.fkRise = e.fkRise ?? 1; K.peek = null; }
  e.tremble = true; e.moving = false; e.knockT = 0;
  flash('觸電！', e.x, e.y - (e.drawHeight || 190) - (e.slimeLift || 0) - 10, '#bfe9ff', 1);
  if (typeof sfxAt === 'function') bossSfxAt('fishHurt', e.x, e.y, 1, 'fish-king-shocked');
}
function fkShockStep(K, dt) {
  const e = K.e, S = FISH_KING.shocked, Sh = K.shock;
  Sh.t += dt;
  if (Sh.pre) e.hp = e.maxhp;   // 開戰前被電：不扣血
  e.knockT = 0; e.x = Sh.x; e.y = Sh.y; e.moving = false;
  if (Sh.stage === 'shake') {   // 原地發抖（在空中就停在空中）
    e.tremble = true; e.slimeLift = Sh.lift; e.airborne = Sh.lift > 1;
    if (Sh.t >= S.shake) {
      Sh.stage = 'fall'; Sh.t = 0; e.tremble = false;
      fkFace(e, 'back');   // 露出背面的魚肉
      e.mbTilt = (e.faceRight ? 1 : -1) * (S.tilt || 0) * Math.PI / 180;   // 往頭那邊轉 30 度：看起來像趴著（背面圖頭朝右，往左看時圖會翻過來）
    }
    return;
  }
  fkFace(e, 'back');
  if (Sh.stage === 'fall') {   // 垂直掉下來
    Sh.vy += S.fall * dt; Sh.lift = Math.max(0, Sh.lift - Sh.vy * dt); e.slimeLift = Sh.lift;
    if (Sh.lift > 0) return;
    e.airborne = false; e.slimeLift = 0;
    if (deepWaterAtPoint(e.x, e.y)) {   // 掉在水裡：沉下去
      Sh.stage = 'sink'; Sh.t = 0; Sh.rise0 = e.fkRise ?? 1;
      fkSplash(e, FISH_KING.splashSize * (Sh.vy > 300 ? 1.2 : .6), Sh.vy > 300);
      if (!Sh.pre) fkWaterImpact(e, Sh.vy > 300 ? 1 : .4);   // 從高處掉下來震比較大（開戰前冒頭被電不震）
      return;
    }
    // 掉在地上：擱淺
    e.mbTilt = 0; K.shock = null;
    if (Sh.pre) { fkPeekEnd(K); return; }   // （開戰前一定在水裡，保險起見）
    K.phase = 'swim'; K.sub = false;
    fkLandImpact(e);   // 摔在地上：重重落地（震動、裂痕、落地聲）
    fkStrand(K);
    return;
  }
  // 沉下去、慢慢淡掉（fishKingWade 照 fkRise 淡出）
  const k = Math.min(1, Sh.t / (S.sink || 1));
  e.fkRise = Sh.rise0 * (1 - k);
  if (k < 1) return;
  e.mbTilt = 0; K.shock = null;
  if (Sh.pre) { fkPeekEnd(K); K.peekT = fkRand(FISH_KING.peek.every); return; }
  const key = fkCellKey(e.x, e.y);
  if (deepWaterCells().has(key)) Object.assign(K, fkRegionFrom(key, e.drawWidth));   // 掉進別的水池（跳到一半被電）：之後在那一池
  K.phase = 'swim'; K.sub = true; K.goal = null; K.approach = false; K.riseT = null; e.fkRise = null;
  K.goneT = fkRand(S.gone);   // 消失一下（連影子都看不到）
  fkShow(K, false);
}
// 消失完：從靠近人的岸邊浮出來，繼續打
function fkReappear(K) {
  const e = K.e, g = fkShoreGoal(K);
  if (g) { e.x = g.x; e.y = g.y; }
  K.leapT = fkRand(FISH_KING.leap.every);
  fkSurface(K);
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
  // 淡入淡出：浮上來時慢慢顯現、沉下去時慢慢消失（fade＝整隻的透明度，js/water.js 的 drawWaded 照這個畫）
  const fade = Math.max(0, Math.min(1, rise / (FISH_KING.fadeAt || .01)));
  // dive＝下潛的程度：越沉越壓藍黑色（js/water.js 的 WATER.dive；浮出來＝0、整隻沉下去＝1）
  return { w: { depth: h * depth / H, see: fkSee(a) }, bottom: a.y + 13, height: H, width: (a.drawWidth || 190) * O.wide, flat: O.flat, sinkDy, fade, dive: 1 - rise };
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

// ---- 游泳時的水波紋（FISH_KING.ripple）----
// 在水裡游的時候，每隔 every 秒在牠的位置留一圈；圈留在原地往外擴散、淡掉（所以游過的路上一圈一圈的）
function fkRippleStep(K, dt) {
  const R = FISH_KING.ripple, list = K.ripples || (K.ripples = []), e = K.e;
  for (const r of list) r.t += dt;
  K.ripples = list.filter(r => r.t < R.life);
  if (!R || dt <= 0 || K.done || !fishKingAlive(K) || K.goneT > 0) { K.rpLast = null; return; }
  const swimming = (K.phase === 'swim' || K.phase === 'peek') && (e.slimeLift || 0) <= 4 && deepWaterAtPoint(e.x, e.y);
  const last = K.rpLast, speed = last ? Math.hypot(e.x - last.x, e.y - last.y) / dt : 0;
  K.rpLast = { x: e.x, y: e.y };
  if (!swimming || speed < R.minMove) return;
  if ((K.rpT = (K.rpT || 0) - dt) > 0) return;
  K.rpT = R.every;
  // 水面那條線：跟身體四周那圈水面一樣高（js/water.js 的 drawWaterRipple：bottom − 身高 × 水面深度）。
  // 魚頭王泡在水裡時水面在身體中間，不是腳底；潛下去時是身體往下沉，水面高度不變
  const wade = typeof fishKingWade === 'function' ? fishKingWade(e) : null;
  const y = wade ? wade.bottom - wade.height * wade.w.depth : e.y + 13 - (e.drawHeight || 190) * FISH_KING.surfaceDepth;
  K.ripples.push({ x: e.x, y, w: (e.drawWidth || 190) * R.size, t: 0, a: K.sub ? R.subAlpha : 1 });
}
function fkDrawRipples(ctx, K) {
  const R = FISH_KING.ripple, flat = (FISH_KING.oval && FISH_KING.oval.flat) || WATER.rippleFlat;
  if (!K.ripples || !K.ripples.length) return;
  ctx.save(); ctx.lineWidth = 1.6;
  for (const r of K.ripples) {
    const k = r.t / R.life, rx = r.w * (1 + k * (R.grow - 1)), a = R.alpha * r.a * (1 - k) * Math.min(1, r.t / .15);   // 剛冒出來淡入一下，之後越擴越淡
    if (a <= .01) continue;
    ctx.strokeStyle = WATER.rippleColor + a.toFixed(3) + ')';
    ctx.beginPath(); ctx.ellipse(r.x, r.y, rx, Math.max(3, rx * flat), 0, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = WATER.rippleColor + (a * .45).toFixed(3) + ')';   // 裡面再一圈細的，比較像水波
    ctx.beginPath(); ctx.ellipse(r.x, r.y, rx * .72, Math.max(2, rx * .72 * flat), 0, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
}

// ---- 畫面 ----
// 地上那一層（js/render.js 畫地面時呼叫）：潛水的影子、水柱衝天的預警泡泡、水砲的預警扇形
function drawFishKingGround(ctx) {
  const K = fishKingState(); if (!K) return;
  const now = performance.now() / 1000;
  fkDrawRipples(ctx, K);   // 游泳時的水波紋（畫在地面那層：在魚身體、影子下面）
  // 潛在水裡的影子
  if (!K.done && K.sub && K.phase === 'swim' && !(K.goneT > 0) && fishKingAlive(K)) {   // 開戰前躲著的時候、被電沉下去消失的時候不畫
    const e = K.e, img = monsterImage(e.forceFrame || (e.frames && e.frames.front) || e.sprite);
    if (img.complete && img.naturalWidth) {
      const w = e.drawWidth, h = e.drawHeight, a = FISH_KING.silhouette * fkSee(e) * (.85 + .15 * Math.sin(now * 1.7));
      ctx.save(); ctx.globalAlpha = a; ctx.imageSmoothingEnabled = false;
      ctx.translate(e.x, e.y + 13 + h * .12); if (e.forceFlip) ctx.scale(-1, 1);
      if (typeof drawDiveTinted === 'function') drawDiveTinted(ctx, img, -w / 2, -h, w, h);   // 潛在水裡：壓藍黑色（js/water.js 的 WATER.dive）
      else { ctx.filter = 'brightness(.5) saturate(.6)'; ctx.drawImage(img, -w / 2, -h, w, h); }
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
// ---- 高壓水砲的畫法 ----
// 不是一條直直的方條：沿著往上拱再落下的弧線畫，嘴巴那端細、越往前越粗、最後散開；兩邊的邊緣各自波動；
// 由外到內四層：淡淡的水霧、深藍水身、淺藍水身、中間白色的水流線（虛線往前跑，看起來在流動）；再加幾顆往前衝的亮點。
// 剛開始噴時水柱從嘴巴長出去（.15 秒），快噴完時從嘴巴那端斷開、往前甩掉。
function fkDrawCannon(ctx, K, m, now) {
  const c = K.cannon, end = c.end, W = FISH_KING.cannon.width, sweep = FISH_KING.cannon.sweep;
  const grow = Math.min(1, c.t / .15), cut = Math.max(0, (c.t - (sweep - .2)) / .2);   // 長出去、快結束時斷開
  const n = 30, k0 = Math.min(.95, cut), k1 = grow, pts = [];
  for (let i = 0; i <= n; i++) {
    const k = k0 + (k1 - k0) * i / n, x = m.x + (end.x - m.x) * k, y = m.y + (end.y - m.y) * k;
    pts.push({ k, x, y: y - fkCannonZ(m.z, k, W) });
  }
  // 每一點的寬度（嘴巴細、越往前越粗、最後一段散開）和左右邊緣各自的波動
  const half = (p, side, mul) => {
    const k = p.k, base = W * .5 * (.28 + .72 * Math.sqrt(k)) * (k > .85 ? 1 + (k - .85) * 2.2 : 1) * (k > .92 ? Math.sqrt(Math.max(0, 1 - (k - .92) / .08 * .75)) : 1) * (1 - cut * .5);   // 最後一小段收圓（不是方方的切口），再被白色水花蓋住
    const wob = Math.sin(k * 11 - now * 24 + side * 1.7 + c.seed) * .12 + Math.sin(k * 27 - now * 41 + side * 3.1) * .07;
    return base * mul * (1 + wob);
  };
  const shape = mul => {
    ctx.beginPath();
    for (let i = 0; i <= n; i++) {
      const p = pts[i], q = pts[Math.min(n, i + 1)], o = pts[Math.max(0, i - 1)], tx = q.x - o.x, ty = q.y - o.y, tl = Math.hypot(tx, ty) || 1;
      const nx = -ty / tl, ny = tx / tl, h = half(p, 1, mul);
      i ? ctx.lineTo(p.x + nx * h, p.y + ny * h) : ctx.moveTo(p.x + nx * h, p.y + ny * h);
    }
    for (let i = n; i >= 0; i--) {
      const p = pts[i], q = pts[Math.min(n, i + 1)], o = pts[Math.max(0, i - 1)], tx = q.x - o.x, ty = q.y - o.y, tl = Math.hypot(tx, ty) || 1;
      const nx = -ty / tl, ny = tx / tl, h = half(p, -1, mul);
      ctx.lineTo(p.x - nx * h, p.y - ny * h);
    }
    ctx.closePath();
  };
  ctx.save();
  ctx.globalAlpha = .28; ctx.fillStyle = '#bfe6ff'; shape(1.45); ctx.fill();   // 外面一圈水霧
  ctx.globalAlpha = .9; ctx.fillStyle = '#3d8fe0'; shape(1); ctx.fill();       // 深藍水身
  ctx.globalAlpha = .9; ctx.fillStyle = '#8fd0ff'; shape(.62); ctx.fill();     // 淺藍水身
  // 中間的白色水流線（虛線往前跑）
  ctx.lineCap = 'round'; ctx.strokeStyle = '#ffffff';
  for (const [off, lw, al, sp] of [[0, W * .12, .85, 520], [-.3, W * .05, .6, 680], [.32, W * .05, .55, 610]]) {
    ctx.globalAlpha = al; ctx.lineWidth = lw; ctx.setLineDash([W * .9, W * .45]); ctx.lineDashOffset = -now * sp;
    ctx.beginPath();
    for (let i = 0; i <= n; i++) {
      const p = pts[i], q = pts[Math.min(n, i + 1)], o = pts[Math.max(0, i - 1)], tx = q.x - o.x, ty = q.y - o.y, tl = Math.hypot(tx, ty) || 1;
      const h = half(p, 1, .62) * off, x = p.x - ty / tl * h, y = p.y + tx / tl * h;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.stroke();
  }
  ctx.setLineDash([]);
  // 往前衝的亮點（水裡的氣泡反光）
  ctx.fillStyle = '#ffffff';
  for (let j = 0; j < 7; j++) {
    const k = ((now * 1.6 + j / 7 + c.seed) % 1), i = Math.round(k * n), p = pts[i]; if (!p) continue;
    ctx.globalAlpha = .7 * Math.sin(Math.PI * k);
    ctx.beginPath(); ctx.ellipse(p.x, p.y + (j % 3 - 1) * W * .12, W * .09, W * .05, 0, 0, Math.PI * 2); ctx.fill();
  }
  // 嘴巴那端一團白色水沫（還沒斷開的時候）
  if (cut <= 0) {
    for (let j = 0; j < 5; j++) {
      const a = j / 5 * Math.PI * 2 + now * 9, r = W * (.16 + .05 * Math.sin(now * 30 + j));
      ctx.globalAlpha = .85; ctx.beginPath(); ctx.arc(m.x + Math.cos(a) * W * .12, m.y - m.z + Math.sin(a) * W * .1, r, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
}
// 特效那一層（js/render.js 畫完人之後呼叫）：水砲的水柱、衝天的水柱、導電的電弧
function drawFishKingFx(ctx) {
  const K = fishKingState(); if (!K) return;
  const now = performance.now() / 1000;
  // 高壓水砲：跟魚頭君的噴水同一套畫法（js/fish-head.js 的 drawFishStream／drawFishSplash：嘴巴端尖細、越往前越粗的拋物線水柱、白色反光線、白邊水花），只是放大
  const FH = typeof FISH_HEAD !== 'undefined' ? FISH_HEAD : { streamWidth: 17, arcHeight: 16, splashSize: 1.6, streamColor: '#6aa8ff' };
  const big = FISH_KING.cannon.width / (FH.streamWidth || 17);   // 比魚頭君的水柱粗幾倍
  if (K.cannon && fishKingAlive(K)) {
    const m = fkMouth(K.e);
    if (!K.cannon.firing) {   // 預警時：嘴邊的水珠（跟魚頭君張嘴準備一樣）
      const k = Math.sin(now * 16) * .5 + .5, r = (2.5 + k * 1.5) * Math.sqrt(big);
      ctx.save(); ctx.globalAlpha = .7 + .3 * k; ctx.fillStyle = FH.streamColor;
      ctx.beginPath(); ctx.arc(m.x, m.y - m.z, r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(m.x - r * .3, m.y - m.z - r * .3, r * .35, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    } else if (K.cannon.end) {
      fkDrawCannon(ctx, K, m, now);
      if (false) drawFishSplash(ctx, { x: K.cannon.end.x, y: K.cannon.end.y, z: 8, t: .3, ux: Math.cos(K.cannon.ang || 0), seed: K.cannon.seed || 0, age: K.cannon.t }, (FH.splashSize || 1.6) * big * .6, FH.streamColor, now);
    }
  }
  fkDrawImpact(ctx, K, now);   // 水砲打到地上的白色水花
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
