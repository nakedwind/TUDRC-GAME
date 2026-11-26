/* ===== 菁英人面蝶「人面蝶后」（抱著異質核心在 4 個區域之間飛來飛去的地圖 BOSS）=====
   - 出場前的預兆：還沒出場時，溫特在這張地圖探索，偶爾會有巨大的蝶后影子從畫面一邊飛過去、伴隨拍翅聲（MOTH_BOSS.omen）。
   - 出場演出：開場時不在場上；溫特走到起點 intro.range 格內 → 時間停住、鏡頭滑過去（js/boss-cinema.js）→ 巨大黑影掠過畫面 →
           從鏡頭方向俯衝下來（越來越小、越來越清楚）→ 落地翅膀一拍、鱗粉炸開一圈、畫面震、核心亮起來 → 驚醒（見下）。
   - 沉睡：（沒有出場演出時，例如自動測試）抱著還沒醒的異質核心，停在地圖的核心候選點上（核心原本的位置），翅膀慢慢拍。
   - 驚醒：溫特走到 wakeRange 格內（看得到）、或打中牠 → 尖叫，核心跟著甦醒（異質體狂暴化），
           畫面上方出現 BOSS 血條，然後牠抱著核心飛走。
   - 換區：照 route 的順序飛往下一個區域（飛得過牆），一路灑下下一區顏色的鱗粉當路標（也是陷阱，吸滿一樣會中招）。
           有時候（MOTH_BOSS.sky.chance）改成「飛向鏡頭」：往上飛、越來越大，飛出畫面外消失一下（這段時間打不到），
           再從畫面外又大又高地飛下來，邊飛邊變回原本大小，降落在下一區的巢上。
           飛行中很難打（受到的傷害 × flyDefense）。系統訊息只說牠飛走了，不說去哪一區。
   - 築巢：飛到那一區後把核心放在地上（這時候核心打得到），在附近繞著目標飛、撒那一區的鱗粉：
           左下＝睡眠、左上＝毒、右上＝混亂、最後回到右下＝三種輪流撒。
   - 大面積撒粉：築巢時有人在這一區，每隔幾秒翅膀發光、地上出現那一區顏色的圓圈預告，接著把整個區域撒滿鱗粉（MOTH_BOSS.burst）。
   - 平常飛在高空：近戰隊員打不到（meleeLift），只能靠槍；俯衝下來抓人、掠過頭頂撒粉、睡覺時飛得低才打得到。
   - 飛行手感（MOTH_BOSS.flight）：速度＋加速度（起飛漸快、停下滑行、轉彎畫弧線）、轉彎傾斜、拍翅膀一頓一頓（拍一下往上竄、滑翔下沉）、
           影子照高度變大變小；築巢時在高空繞大圈盤旋，撒粉那一輪改成俯衝掠過目標頭頂再拉高繞回來。
   - 抓人（畫法跟抱核心一樣：人畫在身體和前方手中間，js/vines.js 那邊只畫地上的影子）：築巢時偶爾盯上溫特或隊員（一半機率抓溫特、一半抓隊員；MOTH_BOSS.grab）：尖叫預告、地上紅圈 → 俯衝，碰到就抓起來飛到空中，
           用手（抱核心的地方）抓著飛到高空繞圈幾秒（grab.circle）再丟下來（落點一定是走得到的地方，不會丟進牆裡；摔下來借用藤蔓丟人那一套：彈兩下、躺著暈、扣血）。
           抓到隊員時改成帶著他飛向鏡頭（往上、變大、淡出消失），grab.mateAway 秒後隊員從空中掉下來（js/vines.js 摔人那一套），蝶后再飛回巢。
           睡著的人（睡眠鱗粉、麻醉彈）也會被抓，一抓起來就在空中醒過來。
           抓著人的時候被打到一定的傷害（grab.breakDmg）就會鬆手，提早把人丟下來。
   - 核心護盾：人面蝶后活著的時候，牠的核心受到的傷害 × (1 - coreShield)。
   - 每掉 1/4 血 → 尖叫、先在原地把整區撒滿鱗粉（驚醒時也一樣），再飛回去撿起核心，抱著飛往下一區（同一區打不死牠，血會停在那一段的底線）。
   - 最後一區被打倒 → 核心掉在牠倒下的地方；核心如果先被打破，牠照樣換區，只是沒有東西可抱。
   - 不會趨光（2026-11-21 拿掉）：一般人面蝶會飛去停在燈上，人面蝶后不會。
   - 鱗粉霧、粉塵爆炸、中毒／混亂／睡眠都沿用一般人面蝶（js/human-face-butterfly.js）。
   出現在哪張地圖：MOTH_BOSS.maps（地圖 id → 起點、各區巢的位置）。起點會抱走離起點最近的那顆地圖核心。
   數值都在下面的 MOTH_BOSS。必須在 human-face-butterfly.js、anomalous-core.js 之後、game.js 之前載入。
*/
// 數字以 data/monsters.js 的 BOSS_SETTINGS_DEFAULT 為準（怪物編輯器「👑 BOSS 數值」）；這裡的數字只在那邊沒有這一格時才用。
// 新增或刪掉數字欄位、改了註解之後，要跑一次 tools/build-boss-fields.py（編輯器的欄位和說明才會跟著更新）
const MOTH_BOSS = applyBossSettings('MOTH_BOSS', {
  name: '人面蝶后',
  artDir: 'images/monster/moth-queen/',   // 專用的圖（翅膀紫藍、紅斑和身體紫紅）：檔名跟人面蝶一樣（含「-前方手」圖），只換資料夾；用 tools/recolor-moth-queen.py 從人面蝶的圖換色產生
  maps: {
    // B56區-藍線捷運站：起點是右下區的核心候選點；四個角落的大房間（都在 2 樓）
    map_mwizzi7s: {
      start: { c: 75, r: 64 },
      zones: {
        rb: { name: '右下區', c: 75, r: 64, radius: 9 },
        lb: { name: '左下區', c: 15, r: 64, radius: 9 },
        lt: { name: '左上區', c: 17, r: 25, radius: 8 },
        rt: { name: '右上區', c: 71, r: 25, radius: 8 },
      },
      // 抓人後丟下來的地方：改在地圖編輯器用「🦋 BOSS 丟人落點」工具放（存在地圖的 bossDrops），這裡不再寫
      // 飛的順序和每一區撒的鱗粉（poison 毒、confuse 混亂、sleep 睡眠、mix 三種輪流）
      route: [
        { zone: 'lb', kind: 'sleep' },
        { zone: 'lt', kind: 'poison' },
        { zone: 'rt', kind: 'confuse' },
        { zone: 'rb', kind: 'mix' },
      ],
    },
  },
  hp: 2400,                      // 血量（再乘整體難度）；分成 route 那麼多段，每一段打完就換區
  coreHp: 1500,                  // 牠抱著的核心血量（地圖難度 1；難度越高照比例加）
  rewardMul: 8, crystalMul: 8,   // 以一般人面蝶（data/monsters.js）為基準
  scale: 2.16,                   // 體型放大倍率（以一般人面蝶為基準）
  height: 110,                   // 平常飛多高（像素）
  sleepHeight: 46,               // 沉睡時停多高
  speedMul: 2,                   // 在巢附近飛的速度倍率（以一般人面蝶為基準）
  flySpeedMul: 1.2,              // 換區時再乘這個倍率（抱著核心飛走；2026-11-23 使用者要慢一半：2.4 → 1.2）
  wakeRange: 7,                  // 溫特走到幾格內（看得到）就驚醒
  scream: 1.4,                   // 尖叫幾秒（驚醒、換區前）
  flyDefense: .35,               // 飛行換區時受到的傷害倍率
  flyFloor: .06,                 // 飛行途中血量最少留到「這一段的底線 + 幾成血」（才不會一到巢就馬上又飛走）
  trailEvery: .55,               // 飛行時每幾秒在身後灑一團鱗粉（路標）
  // 飛向鏡頭（換區時有機會用這種方式）：chance＝機率、up＝往上飛走幾秒、away＝消失在畫面外幾秒、down＝飛回來幾秒、
  // rise＝最高再往上飛幾像素（要飛出畫面）、grow＝最大時體型再加幾倍（1.2＝變成 2.2 倍）、
  // fadeFrom＝飛走時飛到幾成開始淡出（0.2＝前 2 成清楚，之後越來越透明，飛出畫面時完全看不到）
  sky: { chance: .5, up: 2.6, away: 1.6, down: 1.5, rise: 700, grow: 1.2, fadeFrom: .2 },
  leash: 8,                      // 築巢時離巢最遠飛幾格（目標跑太遠就回巢）
  // 飛行手感：accel＝加速度（像素／秒²，越大起飛停下越快、轉彎越急）、brake＝離目的地幾格開始煞車、
  // tilt＝轉彎時身體最多傾斜幾度、lean＝往前衝時微微前傾幾度、tiltSpeed＝傾斜跟上的快慢、
  // flapEvery＝每隔幾秒拍一下翅膀（最短～最長，亂一點像蛾）、flapDown＝拍下去那張圖停幾秒、flapKick＝拍一下往上竄多快（像素／秒）、
  // sink＝滑翔時往下沉的力道、bobSpring＝拉回原本高度的彈簧力、bobRange＝上下竄最多幾像素、wobble＝每拍一下方向亂偏多少（像素／秒）、
  // cruiseLift＝平常盤旋的高度（像素）、circleR＝盤旋的半徑（格）、circleSpeed＝盤旋多快（每秒轉幾弧度）、cruiseSpeedMul＝盤旋的速度倍率、
  // strafeLift＝掠過目標頭頂時飛多低（像素）、strafeRise＝離目標幾格內開始往下俯衝、strafeLen＝掠過頭頂後再衝幾格才拉高繞回來、strafeSpeedMul＝掠過時的速度倍率、
  // circleRest＝兩輪掠過之間至少在高空盤旋幾秒、liftSpeed＝高度變化跟上的快慢（越大俯衝、拉高越快）、
  // shadowLow／shadowHigh＝影子最大最深／最小最淡時的飛行高度（像素）、shadowMinW／shadowMaxW＝影子寬是身體寬的幾成、shadowMinA／shadowMaxA＝影子多黑（0～1）
  flight: { accel: 260, brake: 1.5, tilt: 13, lean: 5, tiltSpeed: 6, flapEvery: [.28, .55], flapDown: .12, flapKick: 90, sink: 140, bobSpring: 6, bobRange: 26, wobble: 22,
    cruiseLift: 170, circleR: 4, circleSpeed: .45, cruiseSpeedMul: 1.6, strafeLift: 35, strafeRise: 4, strafeLen: 4, strafeSpeedMul: 3, circleRest: 3, liftSpeed: 6,
    shadowLow: 40, shadowHigh: 260, shadowMinW: .18, shadowMaxW: .5, shadowMinA: .12, shadowMaxA: .42 },
  orbit: { min: 1.6, max: 3.2 }, // 繞著目標飛：離目標最近、最遠幾格（舊的盤旋方式，現在改用 flight 的 circleR）
  nestOrbit: 2.2,                // 沒有目標時繞著巢飛的半徑（格）
  // 大面積撒粉（築巢時、這一區有目標才會撒）：every＝每隔幾秒一次（最短～最長）、first＝到巢後第一次等幾秒、
  // telegraph＝預告幾秒（翅膀發光、地上圓圈）、time＝幾秒內撒完、puffs＝撒幾團（大團）、cover＝撒滿這一區半徑的幾成
  burst: { every: [7, 10], first: 2.5, telegraph: 1.6, time: 1.2, puffs: 16, cover: .95 },
  meleeLift: 70,                 // 飛得比這個高（像素）時，近戰隊員（雷德、路德、阿瓦倫、柯林）打不到牠；俯衝抓人、睡覺時飛得低才打得到
  // 出場演出：range＝溫特走到起點幾格內（同一層）就開演、shadow＝黑影掠過畫面幾秒、shadowScale＝黑影是本體的幾倍大、shadowAlpha＝黑影多黑（0～1）、
  // dive＝從鏡頭俯衝下來幾秒、diveRise＝俯衝一開始比平常飛的高度再高幾像素（太高會在畫面外看不到）、diveAlpha＝俯衝一開始多透明（0～1，越小越透明）、land＝落地亮相停幾秒才開始戰鬥
  intro: { range: 12, shadow: 1.6, shadowScale: 2.6, shadowAlpha: .55, dive: 1.8, diveRise: 80, diveAlpha: .35, land: .9 },
  // 出場前的預兆（還沒甦醒、溫特在這張地圖探索時）：偶爾有巨大的蝶后影子從畫面一邊飛過去、伴隨拍翅聲。
  // 每次飛的方向都不一樣（任何角度都有可能：橫的、斜的、直的，跟上一次至少差 60 度）。
  // every＝每隔幾秒一次（最短～最長）、first＝進地圖後第一次最快幾秒、time＝影子飛過畫面要幾秒（2026-11-23 使用者要慢一半：2.4 → 4.8）、scale＝影子是本體的幾倍大、
  // alpha＝影子多黑（0～1）、flapEvery＝拍翅聲每幾秒一下、volume＝拍翅聲音量
  omen: { every: [25, 45], first: 12, time: 4.8, scale: 1.8, alpha: .5, flapEvery: .4, volume: .7 },
  leaveTelegraph: .9,            // 飛走前在原地大範圍撒粉：預告幾秒（撒的團數、範圍跟 burst 一樣）
  // 抓人：every＝每隔幾秒抓一次（最短～最長）、first＝到巢後第一次等幾秒、range＝離溫特／隊員幾格內才會去抓（一半機率抓溫特、一半抓隊員）、
  // warn＝俯衝前預告幾秒（尖叫、地上紅圈）、dive＝俯衝最久幾秒（沒碰到就撲空）、diveSpeedMul＝俯衝的速度倍率、diveLift＝俯衝時飛多低（像素）、
  // reach＝離目標幾格內算抓到、circle＝抓起來後在高空繞幾秒才丟下、carryLift＝抓著人時飛多高（像素）、
  // circleR＝繞圈的半徑（格，繞著抓人的地方）、circleSpeed＝繞圈多快（每秒轉幾弧度，6.28＝一秒一圈）、carrySpeedMul＝抓著人繞圈時的飛行速度倍率、
  // playerCircleMul＝抓到溫特時在空中多繞幾倍時間（2＝溫特繞 circle × 2 秒）、
  // eightW／eightH＝抓到溫特時飛的固定「∞」字路線（以那一區的巢為中心）：左右多寬、上下多高（像素）、eightLoops＝飛幾圈、eightTime＝飛完全部要幾秒、
  // eightEase＝開頭、結尾各用多少比例的時間慢慢加速、減速（0～0.5）、eightJoin＝被抓後幾秒內從抓人的地方順順地滑進這條路線、
  // mateAway＝抓到隊員時：蝶后帶著隊員往鏡頭飛走（跟換區的「飛向鏡頭」一樣變大、淡出），消失後隊員幾秒才從空中掉下來、
  // mateDropMin／mateDropMax＝隊員掉在離被抓的地方幾格遠（地圖編輯器有放「🦋 BOSS 丟人落點」時不用，B56 有放）、
  // breakDmg＝抓著人時被打掉多少血（最大血量的幾成）就鬆手、
  // struggleAngle＝溫特被抓在手上時左右掙扎的角度（度，以手抓的地方為支點、腳左右甩；跟著蝶后拍翅膀的圖換格，在左右兩個姿勢之間切換）、struggleShake＝掙扎時身體往左右偏幾像素
  grab: { every: [10, 14], first: 4, range: 10, warn: .8, dive: 1.6, diveSpeedMul: 4, diveLift: 40, reach: .8, circle: 3, carryLift: 260, circleR: 2.5, circleSpeed: .9, carrySpeedMul: 1.2, playerCircleMul: 2, eightW: 640, eightH: 160, eightLoops: 1, eightTime: 7, eightEase: .12, eightJoin: .8, mateAway: 3, mateDropMin: 2, mateDropMax: 5, breakDmg: .05, struggleAngle: 8, struggleShake: 2 },
  coreShield: .5,                // 人面蝶后活著時，核心少受幾成傷害（0.5＝只受一半）
  sound: { wake: 1.8, flap: .7 },   // 音量：尖叫、拍翅膀
});
const mbSpot = () => typeof MAP !== 'undefined' && MAP ? MOTH_BOSS.maps[MAP.id] || null : null;
// 場上的人面蝶后（包括飛到畫面外、暫時不在怪物清單 G.enemies 裡的，見 G.mothBossAway）
const mothBosses = () => (G && G.enemies ? [...G.enemies, ...(G.mothBossAway || [])].filter(e => e.mothBoss && !e.dead && e.hp > 0) : []);
const mbDist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

// ---- 開場（game.js 在 seedCores 之後呼叫）：生在起點，抱起離起點最近的核心 ----
function seedMothBoss() {
  G.mothBossPathCache = null; G.mothBossAway = [];
  const spot = mbSpot();
  if (!spot || MAP_SAFE || (typeof practiceOn === 'function' && practiceOn())) return;
  const base = ACTIVE_MONSTERS.find(m => m.id === 'human_face_butterfly');
  if (!base || !inGrid(spot.start.c, spot.start.r)) return;
  let [x, y] = center(spot.start.c, spot.start.r);
  // 抱走地圖上的核心（核心候選點那顆）；沒有就自己帶一顆
  let core = null, best = Infinity;
  for (const c of G.cores) { if (c.dead || c.carried || c.hidden) continue; const d = Math.hypot(c.x - x, c.y - y); if (d < best) { best = d; core = c; } }
  if (core && best <= CELL * 3) { x = core.x; y = core.y; }
  else {
    const difficulty = Math.max(1, Math.min(5, Number(MAP.difficulty) || 1)), hp = CORE.hp * difficulty;
    core = { x, y, floor: spawnFloorAt(spot.start.c, spot.start.r), hp, maxhp: hp, lastHp: hp, dead: false, awake: false, phase: 0, awakeT: 0,
      timer: 2 + Math.random() * 2.4, reward: CORE.reward * difficulty, moteT: 0, hitT: 0, seed: Math.random() * 10 };
    G.cores.push(core);
  }
  const P = MOTH_BOSS, e = createMonster(base, x, y);
  e.mothBoss = true; e.eliteName = P.name;
  if (P.artDir) {   // 換成蝶后專用的圖（另外複製一份，不要改到人面蝶共用的設定；前方手圖照同名加「-前方手」找，會跟著換資料夾）
    const swap = f => typeof f === 'string' && /\.png$/i.test(f) ? P.artDir + f.split('/').pop() : f;
    e.sprite = swap(e.sprite);
    if (e.frames) e.frames = Object.fromEntries(Object.entries(e.frames).map(([k, f]) => [k, Array.isArray(f) ? f.map(swap) : swap(f)]));
  }
  e.hp = e.maxhp = Math.round(e.maxhp / base.hp * P.hp);   // createMonster 給的是一般人面蝶血量 × 整體難度：換成 BOSS 的血量，難度照樣乘
  e.reward = Math.round(e.reward * P.rewardMul); e.crystals = Math.round((e.crystals ?? 5) * P.crystalMul);
  e.drawWidth = e.mbW = Math.round(base.width * P.scale); e.drawHeight = e.mbH = Math.round(base.height * P.scale);   // mbW、mbH：原本的大小（飛向鏡頭時會暫時變大）
  e.speed = base.speed * P.speedMul;
  e.knockMul = 0; e.staggerTime = 0; e.unpushable = true; e.noHitSquash = true;   // 推不動、不硬直
  e.floor = spawnFloorAt(...cellAt(x, y));
  e.carryCore = core; core.carried = true; core.x = x; core.y = y;
  core.hp = core.maxhp = core.lastHp = Math.round(P.coreHp * core.maxhp / CORE.hp);   // 照地圖難度的比例（seedCores 給的是 CORE.hp × 難度）；carried：打不到、阿瓦倫靠近也不會醒
  e.mo = { phase: Math.random() * 6, cd: 1, wait: 0, lift: P.sleepHeight, orbit: 0 };
  e.flying = true;
  e.mb = { state: 'sleep', t: 0, stage: 0, nest: null, path: null, trail: 0, mixIdx: 0 };
  e.mbHp = e.hp;
  // 先把拍翅膀的圖（含前方手）載好：出場演出的黑影、俯衝第一格就要用，不然會閃一下空白
  for (const f of [e.sprite, ...Object.values(e.frames || {}).flat()]) if (typeof f === 'string') { monsterImage(f); monsterImage(f.replace(/\.png$/i, '-前方手.png')); }
  // 出場演出：一開始躲在畫面外（不在怪物清單裡，打不到），溫特走近才從鏡頭俯衝下來（mbIntroCheck）
  if (typeof startBossCinema === 'function' && !window.NO_BOSS_CINEMA) { e.mb.state = 'hidden'; G.mothBossAway.push(e); return; }
  G.enemies.push(e);
}

// ---- 每一段的血量底線：第 stage 段（0 開始）打到這裡就換區；最後一段是 0 ----
function mbStageFloor(e, stage) {
  const n = mbSpot().route.length;
  return stage >= n - 1 ? 0 : e.maxhp * (1 - (stage + 1) / n);
}
const mbZone = (e, stage) => { const s = mbSpot(), step = s.route[Math.min(stage, s.route.length - 1)]; return { ...s.zones[step.zone], kind: step.kind }; };
function mbSet(e, state, t = 0) { e.mb.state = state; e.mb.t = t; }

// ---- 受傷（game.js 在結算死亡前呼叫）：飛行中難打、停在燈上好打、同一區打不死 ----
function mothBossArmor() {
  for (const e of mothBosses()) {
    const mb = e.mb;
    if (e.mbHp == null || e.hp > e.mbHp) { e.mbHp = e.hp; continue; }
    let lost = e.mbHp - e.hp;
    if (lost <= 0) continue;
    if (mb.state === 'fly' || mb.state === 'grab' || mb.state === 'skyUp' || mb.state === 'skyDown') lost *= MOTH_BOSS.flyDefense;
    e.hp = e.mbHp - lost;
    if (mb.state === 'sleep') mothBossWake(e);
    if ((mb.state === 'carry' || mb.state === 'toDrop' || mb.state === 'skyUp') && mb.carry) mb.carry.hurt += lost;   // 抓著人時被打：打夠了就鬆手（mbCarry、飛向鏡頭時也一樣）
    const floor = mbStageFloor(e, mb.stage);
    if (mb.state === 'nest' || mb.state === 'swoop' || mb.state === 'carry' || mb.state === 'toDrop') {
      if (floor > 0 && e.hp <= floor) { e.hp = floor; mothBossLeave(e); }   // 這一段打完：換區（最後一區的底線是 0，照常打死）
    } else e.hp = Math.max(e.hp, floor + e.maxhp * MOTH_BOSS.flyFloor);   // 尖叫、換區途中打不死
    e.mbHp = e.hp;
  }
}

// ---- 驚醒：尖叫、核心甦醒，然後飛往第一區 ----
function mothBossWake(e) {
  const mb = e.mb;
  if (e.eliteAwake) return;
  e.eliteAwake = true;
  const core = e.carryCore;
  if (core && !core.dead && !core.awake) { wakeCore(core); core.lastHp = core.hp; mbCorePool(core, false); }
  mbScream(e, MOTH_BOSS.name + '驚醒了');
  mb.next = 'fly';
  mb.farewell = { zone: mbZone(e, mbSpot().route.length - 1), home: { x: e.x, y: e.y } };   // 飛走前先在原地撒粉（起點＝路線最後一區）
  systemNotice(MOTH_BOSS.name + '抱著異質核心要飛走了！', true);   // 不說飛去哪一區（讓玩家自己找）
}
// 這一段打完：尖叫、回去撿核心、往下一區飛
function mothBossLeave(e) {
  const mb = e.mb;
  mbRelease(e);   // 抓著人：先丟下來
  mb.farewell = { zone: mbZone(e, mb.stage), home: mb.nest ? { x: mb.nest.x, y: mb.nest.y } : { x: e.x, y: e.y } };   // 飛走前先在這一區撒粉
  mb.stage++;
  mbScream(e, null);
  mb.next = e.carryCore && !e.carryCore.dead && !e.carryCore.carried ? 'grab' : 'fly';
  e.mo.spray = null; mb.burst = null;
  systemNotice(MOTH_BOSS.name + (mb.next === 'grab' ? '撿起核心' : '') + '要飛走了！', true);   // 不說飛去哪一區（讓玩家自己找）
  if (typeof coreBanner === 'function') coreBanner(MOTH_BOSS.name + '要飛走了', '', '#f4d9ff');
}
function mbScream(e, banner) {
  mbSet(e, 'scream', MOTH_BOSS.scream);
  e.alertT = ENEMY_ALERT_TIME;
  if (banner && typeof coreBanner === 'function') coreBanner(banner, '', '#f4d9ff');
  const top = e.y - (e.slimeLift || 0) - e.drawHeight * .5;
  for (let i = 0; i < 3; i++) G.effects.push({ ring: true, x: e.x, y: top, r: 8 + i * 6, r2: 110 + i * 40, life: .45 + i * .15, life0: .45 + i * .15, color: i ? '#e7c8ff' : '#ffffff' });
  bossImpact(e.x, e.y, 7, .05);
  if (typeof sfxAt === 'function') bossSfxAt('mothHurt', e.x, e.y, MOTH_BOSS.sound.wake, 'moth-boss-scream');
}

// 核心腳下的腐蝕痕跡：抱在身上時收掉，放到地上時在巢那裡重新鋪上（跟 js/pearl-elder.js 同一套）
function mbCorePool(core, on) {
  if (!core.pool) return;
  G.acidPools = (G.acidPools || []).filter(p => p !== core.pool);
  if (core.scorch) { G.scorchMarks = (G.scorchMarks || []).filter(s => s !== core.scorch); core.scorch = null; }
  if (!on) return;
  core.pool.x = core.x; core.pool.y = core.y + 8; core.pool.t = 999; core.pool.floor = core.floor || 0;
  G.acidPools.push(core.pool);
  keepCoreScorch(core);
}

// ---- 換區的飛行路線：在「飛得到的格子」上找路（8 方向），再把看得到的點連成直線，減少轉彎 ----
function mbFlyCells() {
  const cache = G.mothBossPathCache;
  if (cache && cache.map === MAP) return cache.ok;
  const ok = new Set();
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) { const [x, y] = center(c, r); if (mothCanFly(x, y)) ok.add(c + ',' + r); }
  G.mothBossPathCache = { map: MAP, ok };
  return ok;
}
function mbStraightOk(x0, y0, x1, y1) {
  const d = Math.hypot(x1 - x0, y1 - y0), n = Math.ceil(d / (CELL * .4));
  for (let i = 1; i < n; i++) if (!mothCanFly(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n)) return false;
  return true;
}
function mbFindPath(x0, y0, x1, y1) {
  const ok = mbFlyCells(), [sc, sr] = cellAt(x0, y0), [gc, gr] = cellAt(x1, y1), goal = gc + ',' + gr;
  const prev = new Map([[sc + ',' + sr, null]]), q = [[sc, sr]];
  for (let i = 0; i < q.length && !prev.has(goal); i++) {
    const [c, r] = q[i];
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
      const k = (c + dc) + ',' + (r + dr);
      if (prev.has(k) || !ok.has(k)) continue;
      if (dc && dr && (!ok.has((c + dc) + ',' + r) || !ok.has(c + ',' + (r + dr)))) continue;   // 斜著走不切牆角
      prev.set(k, c + ',' + r); q.push([c + dc, r + dr]);
    }
  }
  if (!prev.has(goal)) return [{ x: x1, y: y1 }];   // 找不到路：直接飛過去（mothFlyToward 會自己貼著邊滑）
  const cells = [];
  for (let k = goal; k; k = prev.get(k)) { const [c, r] = k.split(',').map(Number), [x, y] = center(c, r); cells.unshift({ x, y }); }
  cells[cells.length - 1] = { x: x1, y: y1 };
  const out = [];   // 拉直：從目前的點往後找最遠一個直線飛得到的點
  let from = { x: x0, y: y0 }, i = 0;
  while (i < cells.length) {
    let j = cells.length - 1;
    while (j > i && !mbStraightOk(from.x, from.y, cells[j].x, cells[j].y)) j--;
    out.push(cells[j]); from = cells[j]; i = j + 1;
  }
  return out;
}
// 照路線飛；到了回傳 true
function mbFollowPath(e, dt, mul) {
  const mb = e.mb;
  if (!mb.path || !mb.path.length) return true;
  const pt = mb.path[0];
  const last = mb.path.length === 1;   // 中間的路點不煞車（一路順順地轉過去），最後一點才慢下來
  if (mbFlyToward(e, pt.x, pt.y, dt, mul, !last) || mbDist(e, pt) < (last ? 6 : CELL * .8)) mb.path.shift();
  return !mb.path.length;
}

// ---- 巢的位置：那一區的中心 ----
function mbNestFor(e, z) {
  const [x, y] = center(z.c, z.r);
  return { x, y };
}

// ---- 每幀（enemy-ai.js 的 stepEnemy 呼叫）----
function stepMothBoss(e, dt) {
  const P = MOTH_BOSS, m = e.mo, mb = e.mb, f = e.frames || {};
  m.phase += dt; mb.t -= dt;
  // 拍翅膀一頓一頓、上下竄、傾斜（沉睡時拍得慢、不傾斜）
  const slow = mb.state === 'sleep';
  mbFlightLook(e, dt, slow);
  e.forceFlip = !!e.faceRight;   // 原圖朝左
  const diving = mb.state === 'swoop' && mb.swoopT >= P.grab.warn;
  const goalLift = mb.state === 'sleep' ? P.sleepHeight : diving ? P.grab.diveLift : (mb.state === 'carry' || mb.state === 'toDrop') ? P.grab.carryLift
    : mb.state === 'nest' ? (mb.liftGoal ?? P.flight.cruiseLift) : P.height;   // 築巢時：盤旋飛高、掠過時飛低（mbCircle、mbStrafe 設 liftGoal）
  if (mb.state !== 'nest') mb.liftGoal = goalLift;
  m.lift += (goalLift - m.lift) * Math.min(1, dt * (mb.state === 'nest' ? P.flight.liftSpeed : 3));   // 築巢時俯衝、拉高比較快
  e.slimeLift = Math.max(4, m.lift + (mb.bobY || 0));
  if (mb.state === 'skyUp' || mb.state === 'skyDown') mbSkyLook(e);   // 飛向鏡頭：飛得更高、變大
  m.fleeT = 0;   // 一般人面蝶「撒完就逃」不適用：BOSS 自己決定去哪
  const core = e.carryCore;
  if (core && core.dead) e.carryCore = null;
  else if (core && core.carried) { core.x = e.x; core.y = e.y; }   // 核心抱在身上，跟著飛
  if (e.stunT > 0) {   // 被麻醉、麻痺：停在空中（大面積撒粉也被打斷；抓著的人跟著停在空中）
    m.spray = null; if (mb.state !== 'farewell') mb.burst = null;
    if (mb.state === 'carry' || mb.state === 'toDrop') mbCarryHold(e, 0);
    return;
  }
  switch (mb.state) {
    case 'sleep': {
      const p = G.player;
      if (p && p.hp > 0 && sameFloor(e, p) && mbDist(p, e) <= P.wakeRange * CELL && hasLineOfSight(e.x, e.y, p.x, p.y)) mothBossWake(e);
      return;
    }
    case 'scream':
      e.tremble = true;
      if (mb.t <= 0) {
        e.tremble = false;
        if (mb.farewell) { mb.burst = null; mbSet(e, 'farewell'); }   // 先在原地大範圍撒粉再走
        else mbStartMove(e, mb.next || 'fly');
      }
      return;
    case 'farewell': {   // 飛走前：停在原地，把這一區撒滿鱗粉，撒完才去撿核心、飛走
      const F = mb.farewell;
      if (!F || !mbBurst(e, dt, F.zone, true, { home: F.home, force: true, telegraph: P.leaveTelegraph })) { mb.farewell = null; mbStartMove(e, mb.next || 'fly'); }
      return;
    }
    case 'swoop': mbSwoop(e, dt); return;
    case 'carry': mbCarry(e, dt); return;
    case 'toDrop': mbToDrop(e, dt); return;
    case 'grab': {   // 飛回巢把核心撿起來
      const c = e.carryCore;
      if (!c) { mbStartMove(e, 'fly'); return; }
      if (mbFlyToward(e, c.x, c.y, dt, P.flySpeedMul) || mbDist(e, c) < 8) {
        c.carried = true; mbCorePool(c, false);
        G.effects.push({ ring: true, x: c.x, y: c.y, r: 6, r2: 70, life: .35, life0: .35, color: '#b56bff' });
        mbStartMove(e, 'fly');
      }
      return;
    }
    case 'fly': mbFly(e, dt); return;
    case 'skyUp': {   // 往上飛、越來越大，時間到就飛出畫面外（移出怪物清單，打不到）
      const c = mb.carry;
      if (c) {   // 抓著隊員一起飛走：隊員跟著手；被打夠了就鬆手（從半空中掉下來）
        c.t += dt; mbCarryHold(e, dt);
        if (c.hurt >= e.maxhp * P.grab.breakDmg) { flash('鬆手了！', e.x, e.y - e.slimeLift - e.drawHeight * .5, '#fff2b0', .9); mbRelease(e); }
      }
      if (mb.t <= 0) mbSkyLeave(e);
      return;
    }
    case 'skyDown': {   // 從畫面外飛回來，邊降邊變回原本大小
      if (mb.t <= 0) {
        e.drawWidth = e.mbW; e.drawHeight = e.mbH;
        if (mb.skyCarry) { mb.skyCarry = false; mbSet(e, 'nest'); return; }   // 丟完隊員飛回來：直接回到巢上
        mbSet(e, e.carryCore && e.carryCore.carried ? 'land' : 'nest');
        if (!e.carryCore || !e.carryCore.carried) mbArrive(e);
      }
      return;
    }
    case 'land': {   // 降到巢上，把核心放下來
      if (mbFlyToward(e, mb.nest.x, mb.nest.y, dt, P.flySpeedMul * .6) || mbDist(e, mb.nest) < 6) mbDropCore(e);
      return;
    }
    case 'nest': mbNest(e, dt); return;
    case 'intro': case 'hidden': return;   // 出場演出中（mbIntroTick 在管）、還沒出場
    default: mbSet(e, 'nest');
  }
}
function mbStartMove(e, state) {
  const mb = e.mb;
  if (state === 'grab') { mbSet(e, 'grab'); return; }
  const z = mbZone(e, mb.stage);
  mb.nest = mbNestFor(e, z);
  mb.path = mbFindPath(e.x, e.y, mb.nest.x, mb.nest.y);
  mb.trail = 0;
  // 有時候改成飛向鏡頭（抱著核心時才這樣飛：核心還在，飛走的那幾秒不會被當成清場）
  const P = MOTH_BOSS.sky;
  if (e.carryCore && !e.carryCore.dead && Math.random() < P.chance) {
    mbSet(e, 'skyUp', P.up);
    if (typeof sfxAt === 'function') sfxAt('mothFlap', e.x, e.y, MOTH_BOSS.sound.wake, 'moth-boss-sky');
    return;
  }
  mbSet(e, 'fly');
}
// ---- 飛向鏡頭 ----
// 0＝原本的樣子、1＝最高最大（飛出畫面外）
function mbSkyAmount(e) {
  const P = MOTH_BOSS.sky, mb = e.mb;
  const u = mb.state === 'skyUp' ? 1 - Math.max(0, mb.t) / P.up : mb.state === 'skyDown' ? Math.max(0, mb.t) / P.down : 0;
  return Math.max(0, Math.min(1, u));
}
// 照進度把牠畫得更高、更大（一開始慢、越飛越快）
function mbSkyLook(e) {
  const P = MOTH_BOSS.sky, u = mbSkyAmount(e), k = u * u, grow = 1 + P.grow * u;
  e.slimeLift += P.rise * k;
  e.drawWidth = Math.round(e.mbW * grow); e.drawHeight = Math.round(e.mbH * grow);
  // 飛走時淡出（js/render.js 畫人面蝶時讀 mbFade）；飛回來不淡入（從畫面外飛進來）
  e.mbFade = e.mb.state === 'skyUp' ? Math.max(0, Math.min(1, (1 - u) / (1 - P.fadeFrom))) : 1;
}
// 飛出畫面外：移出怪物清單（子彈、隊員都打不到），位置直接換到下一區的巢，等 away 秒再飛回來
function mbSkyLeave(e) {
  const P = MOTH_BOSS.sky, mb = e.mb;
  mbMateAway(e);   // 抓著隊員：隊員留在畫面外，過幾秒從空中掉下來
  const i = G.enemies.indexOf(e);
  if (i >= 0) G.enemies.splice(i, 1);
  (G.mothBossAway || (G.mothBossAway = [])).push(e);
  e.x = mb.nest.x; e.y = mb.nest.y;
  e.floor = spawnFloorAt(...cellAt(e.x, e.y));
  e.mo.spray = null; e.mo.target = null;
  mbSet(e, 'away', P.away);
}
// 每幀（game.js 呼叫）：飛到畫面外的人面蝶后倒數，時間到就放回怪物清單、從畫面外飛下來
function updateMothBossAway(dt) {
  const list = G && G.mothBossAway;
  if (!list || !list.length) return;
  for (const e of [...list]) {
    const core = e.carryCore;
    if (core && core.carried) { core.x = e.x; core.y = e.y; }
    if (e.dead || e.hp <= 0) { G.mothBossAway = G.mothBossAway.filter(o => o !== e); continue; }
    if (e.mb.state === 'hidden') { mbOmenTick(e, dt); mbIntroCheck(e); continue; }   // 還沒出場：偶爾影子飛過去（預兆）、等溫特走近
    e.mb.t -= dt;
    if (e.mb.t > 0) continue;
    G.mothBossAway = G.mothBossAway.filter(o => o !== e);
    if (!G.enemies.includes(e)) G.enemies.push(e);
    mbSet(e, 'skyDown', MOTH_BOSS.sky.down);
    if (typeof sfxAt === 'function') sfxAt('mothFlap', e.x, e.y, MOTH_BOSS.sound.wake, 'moth-boss-sky');
  }
}
// ===== 出場演出（js/boss-cinema.js 的共用演出：時間停住、溫特不能動、鏡頭滑過去、上下黑邊）=====
// 開場時蝶后不在場上（躲在畫面外，G.mothBossAway、狀態 'hidden'），溫特走到起點 intro.range 格內（同一層）就開演：
//   1. shadow：一個巨大的蝶后黑影從畫面一邊掠過整個畫面，伴隨拍翅聲
//   2. dive：蝶后從鏡頭方向俯衝下來（一開始很大、很近、半透明，邊降邊縮小、變清楚），落到起點、原本的大小（跟「飛向鏡頭／飛回來」同一套 mbSkyLook）
//   3. land：落地時翅膀一拍，鱗粉往外炸開一圈＋畫面震一下，手上的核心亮起來（核心甦醒），接著照原本的驚醒流程：尖叫 → 在原地撒粉 → 飛走
// 自動測試關掉演出（window.NO_BOSS_CINEMA）時，直接出現並驚醒。
function mbIntroCheck(e) {
  const I = MOTH_BOSS.intro, p = G.player;
  if (!p || p.hp <= 0 || !sameFloor(e, p) || mbDist(p, e) > I.range * CELL) return;
  mbIntroStart(e);
}
function mbIntroStart(e) {
  const I = MOTH_BOSS.intro, mb = e.mb;
  G.mothBossAway = (G.mothBossAway || []).filter(o => o !== e);   // 放回怪物清單（演出期間時間停住，打不到也不會動）
  if (!G.enemies.includes(e)) G.enemies.push(e);
  mb.intro = { phase: 'pan', t: 0, flapT: 0, shadowDir: e.x < (G.player ? G.player.x : e.x) ? 1 : -1 };
  mbSet(e, 'intro');
  e.mbFade = 0;   // 黑影掠過的時候還看不到本體
  const ok = typeof startBossCinema === 'function' && startBossCinema({
    focus: { x: e.x, y: e.y - CELL * BOSS_CINEMA.moth.focusUp },   // 鏡頭對準起點再往上（上面留空間給牠從鏡頭俯衝下來）
    tick: dt => mbIntroTick(e, dt),
    done: () => !e.mb.intro,
    holdAfter: BOSS_CINEMA.moth.holdAfter,
    zoom: BOSS_CINEMA.moth.zoom, bars: BOSS_CINEMA.moth.bars,   // 不拉遠、不要上下黑邊（怪物編輯器可改）
  });
  if (!ok) { mb.intro = null; e.mbFade = 1; mbIntroLand(e); }   // 沒有演出（自動測試）：直接落地驚醒
}
// 停住的時候每一幀跑：黑影掠過 → 俯衝 → 落地
function mbIntroTick(e, dt) {
  const I = MOTH_BOSS.intro, S = MOTH_BOSS.sky, mb = e.mb, it = mb.intro;
  if (!it) return;
  it.t += dt;
  mbIntroFlap(e, dt, it.phase === 'dive' ? 1.4 : 1);
  if (it.phase === 'pan') {   // 鏡頭還在滑過去
    if (it.t >= BOSS_CINEMA.pan) { it.phase = 'shadow'; it.t = 0; }
  } else if (it.phase === 'shadow') {   // 巨大黑影掠過畫面
    if ((it.flapT -= dt) <= 0) { it.flapT = .35; if (typeof sfxAt === 'function') sfxAt('mothFlap', cam.x + viewW() / 2, cam.y + viewH() / 2, MOTH_BOSS.sound.wake, 'moth-boss-intro-flap'); }
    if (it.t >= I.shadow) { it.phase = 'dive'; it.t = 0; if (typeof sfxAt === 'function') bossSfxAt('mothHurt', e.x, e.y, MOTH_BOSS.sound.wake, 'moth-boss-scream'); }
  } else if (it.phase === 'dive') {   // 從鏡頭方向俯衝下來：跟「飛回來」同一套（mbSkyLook 的 skyDown），一開始半透明
    const u = Math.max(0, 1 - it.t / I.dive);   // 1＝最大最近、0＝原本的樣子
    e.slimeLift = MOTH_BOSS.height + I.diveRise * u * u;
    e.drawWidth = Math.round(e.mbW * (1 + S.grow * u)); e.drawHeight = Math.round(e.mbH * (1 + S.grow * u));
    e.mbFade = I.diveAlpha + (1 - I.diveAlpha) * (1 - u);
    if (it.t >= I.dive) { e.drawWidth = e.mbW; e.drawHeight = e.mbH; e.mbFade = 1; e.slimeLift = MOTH_BOSS.height; e.mo.lift = MOTH_BOSS.height; it.phase = 'land'; it.t = 0; mbIntroLand(e); }
  } else if (it.phase === 'land') {   // 落地亮相：停一下才開始戰鬥
    e.slimeLift = MOTH_BOSS.height + Math.sin(it.t * 9) * 4 * Math.max(0, 1 - it.t / I.land);
    if (it.t >= I.land) mb.intro = null;   // 演完（js/boss-cinema.js 收尾、鏡頭滑回溫特）
  }
}
// 演出中拍翅膀（平常在 stepMothBoss 做；演出時時間停住，這裡自己換圖）
function mbIntroFlap(e, dt, mul) {
  const f = e.frames || {}, m = e.mo, wings = f.walkFront && f.walkFront.length ? f.walkFront : [f.front || e.sprite];
  m.flapT = (m.flapT || 0) + dt * MOTH.flapFps * mul;
  e.forceFrame = wings[Math.floor(m.flapT) % wings.length];
  e.forceFlip = !!e.faceRight;
}
// 落地：翅膀一拍、鱗粉往外炸開一圈（只是畫面，不會讓人中招）、畫面震一下、核心亮起來，然後照原本的驚醒流程
function mbIntroLand(e) {
  const top = e.y - (e.slimeLift || 0) - e.drawHeight * .5;
  for (let i = 0; i < 4; i++) { const life = .5 + i * .15; G.effects.push({ ring: true, x: e.x, y: e.y + 6, r: 10 + i * 8, r2: (3 + i * 1.6) * CELL, life, life0: life, color: ['#e7c8ff', '#7dff6a', '#c98bff', '#7fc4ff'][i] }); }
  for (let i = 0; i < 40; i++) {   // 鱗粉亮點往外噴（三種顏色）
    const a = Math.random() * Math.PI * 2, sp = 120 + Math.random() * 260, col = MOTH_COLORS[MOTH_KINDS[i % 3]].glow;
    G.effects.push({ ember: true, spark: true, x: e.x, y: top + 30, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * .6, r: 1.5 + Math.random() * 2.5, life: .6 + Math.random() * .5, life0: 1.1, color: col });
  }
  if (typeof sfxAt === 'function') sfxAt('mothSpray', e.x, e.y, 1.2, 'moth-boss-intro-land');
  bossImpact(e.x, e.y, 10, .12);
  const core = e.carryCore;
  if (core && !core.dead) G.effects.push({ ring: true, x: e.x, y: top, r: 6, r2: 90, life: .6, life0: .6, color: '#b56bff' });   // 手上的核心亮一下
  mothBossWake(e);   // 核心甦醒（異質體狂暴、核心發光）、橫幅；尖叫、撒粉、飛走在演出結束後照常進行
}
// 黑影（js/render.js 在黑幕上面畫）：巨大、半透明的蝶后剪影從畫面一邊掠過另一邊
function drawMothBossIntro(ctx) {
  for (const e of mothBosses()) {
    const it = e.mb && e.mb.intro, om = e.mb && e.mb.omen;
    if (it && it.phase === 'shadow') { const I = MOTH_BOSS.intro; drawMothShadowPass(ctx, e, Math.min(1, it.t / I.shadow), it.shadowDir, I.shadowScale, I.shadowAlpha, .45, e.mo.flapT || 0); }
    else if (om) { const O = MOTH_BOSS.omen; drawMothShadowPass(ctx, e, Math.min(1, om.t / O.time), om.dir, O.scale, O.alpha, om.yFrac, om.t * MOTH.flapFps, om); }   // 出場前的預兆（照 om.ang 的方向飛）
  }
}
// 斜著飛的影子在畫面上的位置（k：0＝剛進畫面、1＝飛出去）：沿著 om.ang 的方向直直穿過畫面，
//   中線從畫面中間偏 om.off（-0.5～0.5，往旁邊偏幾成），進出都在畫面外（w、h＝影子的大小）
function mbOmenPos(om, k, w, h) {
  const vw = viewW(), vh = viewH(), dx = Math.cos(om.ang), dy = Math.sin(om.ang);
  const half = (Math.abs(dx) * vw + Math.abs(dy) * vh) / 2 + Math.max(w, h) * .6;   // 從中間走到畫面外要多遠
  const side = om.off * (Math.abs(dx) * vh + Math.abs(dy) * vw) * .5;   // 往旁邊（跟飛的方向垂直）偏多少
  const t = -half + half * 2 * k, bob = Math.sin(k * Math.PI) * Math.min(vw, vh) * .06;   // bob：飛的途中微微畫一道弧
  return { x: cam.x + vw / 2 + dx * t - dy * (side + bob), y: cam.y + vh / 2 + dy * t + dx * (side + bob), dx, dy };
}
// 巨大的蝶后黑影從畫面一邊掠過另一邊（k：0＝剛進畫面、1＝飛出去；dir：1 往右、-1 往左；yFrac：在畫面幾成高的地方飛過）
//   om（出場前的預兆才有）：照 om.ang 的方向飛（任何角度），不照 dir、yFrac
function drawMothShadowPass(ctx, e, k, dir, scale, alpha, yFrac, flap, om) {
  const vw = viewW(), vh = viewH();
  const f = e.frames || {}, wings = f.walkFront && f.walkFront.length ? f.walkFront : [f.front || e.sprite];
  const img = monsterImage(wings[Math.floor(flap) % wings.length]);
  const sil = img && img.complete && img.naturalWidth && typeof flashSprite === 'function' ? flashSprite(img, '#08040e') : null;
  if (!sil) return;
  const w = e.mbW * scale, h = e.mbH * scale;
  let x, y, tilt = 0;
  if (om && om.ang != null) {
    const p = mbOmenPos(om, k, w, h);
    x = p.x; y = p.y; dir = p.dx >= 0 ? 1 : -1;
    tilt = Math.max(-.6, Math.min(.6, Math.atan2(p.dy, Math.abs(p.dx)) * .6)) * dir;   // 斜著飛時身體跟著往那邊歪一點（最多約 35 度）
  } else {
    x = dir > 0 ? cam.x - w + (vw + w * 2) * k : cam.x + vw + w - (vw + w * 2) * k;
    y = cam.y + vh * yFrac + Math.sin(k * Math.PI) * vh * .08;
  }
  ctx.save();
  ctx.globalAlpha = alpha * Math.sin(k * Math.PI);   // 進來、出去時淡一點
  ctx.translate(x, y);
  if (tilt) ctx.rotate(tilt);
  if (dir > 0) ctx.scale(-1, 1);   // 原圖朝左：往右飛要翻過來
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(sil, -w / 2, -h / 2, w, h);
  ctx.restore();
}
// 出場前的預兆（js/moth-boss.js 的 updateMothBossAway 在蝶后還沒出場時呼叫）：倒數到了就讓影子從畫面飛過去、播拍翅聲
function mbOmenTick(e, dt) {
  const O = MOTH_BOSS.omen, mb = e.mb, p = G.player;
  if (typeof bossDownBefore === 'function' && bossDownBefore('mothBoss')) { mb.omen = null; return; }   // 人面蝶后打倒過了：不再出現預兆影子
  if (mb.omen) {
    const om = mb.omen;
    om.t += dt;
    if ((om.flapCd -= dt) <= 0 && om.t < O.time) {   // 拍翅聲：跟著影子的位置（畫面中間附近，溫特聽得到）
      om.flapCd = O.flapEvery;
      const pos = mbOmenPos(om, om.t / O.time, 0, 0);
      if (typeof sfxAt === 'function') sfxAt('mothFlap', pos.x, pos.y, O.volume, 'moth-boss-omen');
    }
    if (om.t >= O.time) { mb.omen = null; mb.omenCd = mothRand(O.every[0], O.every[1]); }
    return;
  }
  if (mb.omenCd == null) mb.omenCd = mothRand(O.first, O.first + (O.every[1] - O.every[0]));   // 進地圖後第一次
  mb.omenCd -= dt;
  if (mb.omenCd > 0 || !p || p.hp <= 0 || (typeof bossCinemaActive === 'function' && bossCinemaActive())) return;
  // 方向：隨機任何角度，跟上一次至少差 60 度（才不會連續兩次看起來一樣）
  let ang = Math.random() * Math.PI * 2;
  for (let i = 0; i < 20 && mb.omenLastAng != null; i++) {
    const d = Math.abs(((ang - mb.omenLastAng) % (Math.PI * 2) + Math.PI * 3) % (Math.PI * 2) - Math.PI);
    if (d >= Math.PI / 3) break;
    ang = Math.random() * Math.PI * 2;
  }
  mb.omenLastAng = ang;
  mb.omen = { t: 0, ang, off: mothRand(-.35, .35), dir: Math.cos(ang) >= 0 ? 1 : -1, yFrac: .45, flapCd: 0 };
}

// ===== 飛行手感（MOTH_BOSS.flight）=====
// 不再等速直線、到點就停：用速度＋加速度飛（起飛漸快、停下滑一段、轉向畫弧線），身體照轉彎傾斜，
// 拍翅膀一頓一頓（拍一下往上竄、滑翔慢慢下沉，帶點蛾的歪扭），影子照飛的高度變大變小。
// 往 (x, y) 飛：用加速度追上「想要的速度」（越靠近越慢，brake 格內開始煞車），所以會畫弧線、會滑行。到了回傳 true
function mbFlyToward(e, x, y, dt, mul = 1, noBrake = false) {   // noBrake：經過的路點，不用慢下來
  const F = MOTH_BOSS.flight, mb = e.mb;
  if (mb.vx == null) { mb.vx = 0; mb.vy = 0; }
  if (dt <= 0) return Math.hypot(x - e.x, y - e.y) < 6;
  const dx = x - e.x, dy = y - e.y, d = Math.hypot(dx, dy), max = e.speed * mul;
  const want = d > .5 ? max * (noBrake ? 1 : Math.min(1, d / (F.brake * CELL))) : 0;   // 想要的速度：快到了就慢下來
  const tvx = d > .5 ? dx / d * want : 0, tvy = d > .5 ? dy / d * want : 0;
  let ax = tvx - mb.vx, ay = tvy - mb.vy;
  const al = Math.hypot(ax, ay), amax = F.accel * Math.max(1, mul) * dt;   // 飛得越快的模式加速度也越大
  if (al > amax) { ax *= amax / al; ay *= amax / al; }
  mb.vx += ax; mb.vy += ay; mb.ax = ax / dt; mb.ay = ay / dt;
  const nx = e.x + mb.vx * dt, ny = e.y + mb.vy * dt;
  if (mothCanFly(nx, ny) || !mothCanFly(e.x, e.y)) { e.x = nx; e.y = ny; }   // 飛得過牆，只是不能飛出地圖（地圖外的黑色區）
  else if (mothCanFly(nx, e.y)) { e.x = nx; mb.vy *= .3; }
  else if (mothCanFly(e.x, ny)) { e.y = ny; mb.vx *= .3; }
  else { mb.vx *= .3; mb.vy *= .3; }
  if (Math.abs(mb.vx) > 12) e.faceRight = mb.vx > 0;   // 照真的飛的方向轉身（太慢不轉，免得原地一直翻）
  return Math.hypot(x - e.x, y - e.y) < 6;
}
// 每幀：拍翅膀（一頓一頓）、上下竄動、身體傾斜（stepMothBoss 開頭呼叫）
function mbFlightLook(e, dt, slow) {
  const F = MOTH_BOSS.flight, mb = e.mb, m = e.mo, f = e.frames || {};
  const wings = f.walkFront && f.walkFront.length ? f.walkFront : [f.front || e.sprite];
  if (mb.bobY == null) { mb.bobY = 0; mb.bobV = 0; mb.flapCd = 0; mb.flapHold = 0; mb.tilt = 0; }
  const speed = Math.hypot(mb.vx || 0, mb.vy || 0), climbing = (e.mo.lift || 0) < (mb.liftGoal || 0) - 10;
  mb.flapCd -= dt * (slow ? .35 : 1) * (climbing ? 1.6 : 1) * (1 + Math.min(1, speed / 200) * .5);   // 往上爬、飛得快：拍得比較勤
  if (mb.flapCd <= 0) {   // 拍一下：往上竄、身體歪一下、播拍翅膀聲
    mb.flapCd = mothRand(F.flapEvery[0], F.flapEvery[1]);
    mb.flapHold = F.flapDown;
    mb.bobV += F.flapKick * (slow ? .35 : 1);
    if (!slow) { mb.vx = (mb.vx || 0) + mothRand(-1, 1) * F.wobble; mb.vy = (mb.vy || 0) + mothRand(-1, 1) * F.wobble * .5; }   // 蛾的歪扭：每拍一下方向亂偏一點
    m.flapT = (Math.floor(m.flapT || 0) + 1);   // 拍了第幾下（被抓的人掙扎跟這個換邊）
    if (typeof sfxAt === 'function') sfxAt('mothFlap', e.x, e.y, MOTH_BOSS.sound.flap * (slow ? .5 : 1), 'moth-boss-flap');
  }
  mb.flapHold -= dt;
  e.forceFrame = wings[mb.flapHold > 0 && wings.length > 1 ? 1 : 0];   // 拍下去那一下換成第二張圖，其他時間翅膀張開滑翔
  // 上下：拍一下往上竄，之後像滑翔一樣慢慢往下沉（彈簧拉回原本的高度）
  mb.bobV -= (F.sink + mb.bobY * F.bobSpring) * dt;
  mb.bobV *= Math.pow(.35, dt);
  mb.bobY = Math.max(-F.bobRange, Math.min(F.bobRange, mb.bobY + mb.bobV * dt));
  // 傾斜：往轉向的那一邊傾（照左右的加速度），往前衝時微微前傾（照左右的速度）
  const maxS = Math.max(1, e.speed * F.strafeSpeedMul);
  const turn = Math.max(-1, Math.min(1, (mb.ax || 0) / (F.accel * 1.5)));
  const lean = Math.max(-1, Math.min(1, (mb.vx || 0) / maxS));
  const goal = slow ? 0 : (turn * F.tilt + lean * F.lean) * Math.PI / 180;
  mb.tilt += (goal - mb.tilt) * Math.min(1, dt * F.tiltSpeed);
  e.mbTilt = mb.tilt;   // js/render.js 畫身體時照這個角度轉（核心、抓著的人在同一個畫面裡，一起轉）
}
// 盤旋：在高空繞著目標（沒有目標就繞著巢）轉大圈
function mbCircle(e, dt, center, home) {
  const P = MOTH_BOSS, F = P.flight, m = e.mo, mb = e.mb;
  m.orbit += dt * F.circleSpeed;
  let cx = center.x, cy = center.y;
  const dd = Math.hypot(cx - home.x, cy - home.y), max = P.leash * CELL;
  if (dd > max) { cx = home.x + (cx - home.x) * max / dd; cy = home.y + (cy - home.y) * max / dd; }
  const R = F.circleR * CELL;
  mbFlyToward(e, cx + Math.cos(m.orbit) * R, cy + Math.sin(m.orbit) * R * .6, dt, F.cruiseSpeedMul);
  mb.liftGoal = F.cruiseLift;
}
// 掠過攻擊：從目標的一邊俯衝下來、貼著頭頂掠過（這時候撒粉），衝過頭 strafeLen 格後拉高、繞回來再掠過一次
function mbStrafe(e, dt, target, home) {
  const P = MOTH_BOSS, F = P.flight, mb = e.mb;
  let run = mb.run;
  const newPass = () => {
    let dx = target.x - e.x, dy = target.y - e.y; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
    let ex = target.x + dx * F.strafeLen * CELL, ey = target.y + dy * F.strafeLen * CELL * .7;
    const dd = Math.hypot(ex - home.x, ey - home.y), max = P.leash * CELL;
    if (dd > max) { ex = home.x + (ex - home.x) * max / dd; ey = home.y + (ey - home.y) * max / dd; }
    return { target, x: ex, y: ey, passed: false };
  };
  if (!run || run.target !== target) run = mb.run = newPass();
  const dT = mbDist(e, target);
  if (!run.passed && dT < CELL * .8) run.passed = true;   // 已經從頭頂掠過去了
  if (mbFlyToward(e, run.x, run.y, dt, F.strafeSpeedMul) || (run.passed && Math.hypot(run.x - e.x, run.y - e.y) < CELL)) run = mb.run = newPass();   // 衝到底：再來一輪
  // 高度：離目標越近飛得越低（貼著頭頂），越遠越高（拉高繞回來）
  const k = Math.max(0, Math.min(1, (dT - CELL) / (F.strafeRise * CELL)));
  mb.liftGoal = F.strafeLift + (F.cruiseLift - F.strafeLift) * k;
}
// 影子（js/render.js 的 drawEnemy 畫在腳下）：飛得高小而淡、飛得低大而深，跟本體之間隔著飛的高度
function drawMothBossShadow(ctx, e) {
  const F = MOTH_BOSS.flight, lift = e.slimeLift || 0;
  const k = Math.max(0, Math.min(1, (F.shadowHigh - lift) / (F.shadowHigh - F.shadowLow)));   // 1＝貼地、0＝很高
  const grow = e.mbH ? e.drawHeight / e.mbH : 1;
  const w = (e.mbW || e.drawWidth) * grow * (F.shadowMinW + (F.shadowMaxW - F.shadowMinW) * k);
  ctx.save();
  ctx.globalAlpha = F.shadowMinA + (F.shadowMaxA - F.shadowMinA) * k;
  ctx.fillStyle = '#071015';
  ctx.beginPath(); ctx.ellipse(e.x, e.y + 13, w / 2, w * .13, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// 飛往下一區：一路灑下一區顏色的鱗粉
function mbFly(e, dt) {
  const P = MOTH_BOSS, mb = e.mb, z = mbZone(e, mb.stage);
  mb.trail -= dt;
  if (mb.trail <= 0 && !(e.burnT > 0)) { mb.trail = P.trailEvery; mothPuff(e.x + mothRand(-20, 20), e.y + mothRand(-10, 16), mbKind(e, z), false, actorFloor(e)); }
  if (mbFollowPath(e, dt, P.flySpeedMul)) {
    mbSet(e, e.carryCore && e.carryCore.carried ? 'land' : 'nest');
    if (!e.carryCore || !e.carryCore.carried) mbArrive(e);
  }
}
// 到巢了
function mbArrive(e) {
  const z = mbZone(e, e.mb.stage);
  e.mb.burstCd = MOTH_BOSS.burst.first; e.mb.burst = null;   // 到巢後等一下才第一次大面積撒粉
  e.mb.grabCd = MOTH_BOSS.grab.first;   // 到巢後等一下才第一次抓人
  flash(MOTH_BOSS.name + '在' + z.name + '築巢', e.x, e.y - e.slimeLift - e.drawHeight - 6, '#f4d9ff');
}
function mbDropCore(e) {
  const mb = e.mb, c = e.carryCore;
  if (c && c.carried) {
    c.carried = false;
    c.x = mb.nest.x; c.y = mb.nest.y;
    const [cc, cr] = cellAt(c.x, c.y);
    c.floor = spawnFloorAt(cc, cr); c.lastHp = c.hp;
    if (c.awake) mbCorePool(c, true);
    G.effects.push({ ring: true, x: c.x, y: c.y, r: 8, r2: 80, life: .45, life0: .45, color: '#b56bff' });
    for (let i = 0; i < 6; i++) {
      const a = Math.random() * Math.PI * 2, sp = 8 + Math.random() * 16;
      pushCorrosionMist(c.x + Math.cos(a) * 12, c.y + 4 + Math.sin(a) * 8, Math.cos(a) * sp, Math.sin(a) * sp);
    }
    bossImpact(c.x, c.y, 5, .03);
  }
  mbSet(e, 'nest');
  mbArrive(e);
}
// 這一區撒哪一種（最後一區三種輪流）
function mbKind(e, z) {
  if (z.kind !== 'mix') return z.kind;
  return MOTH_KINDS[e.mb.mixIdx % MOTH_KINDS.length];
}
// 築巢：在巢附近繞著目標飛、撒這一區的鱗粉；目標跑出巢的範圍就回巢上空繞
function mbNest(e, dt) {
  const P = MOTH_BOSS, m = e.mo, mb = e.mb, z = mbZone(e, mb.stage), home = mb.nest;
  let target = mothPickTarget(e);
  if (target && mbDist(target, home) > (P.leash + 3) * CELL) target = null;   // 跑出巢的範圍：不追
  m.target = target;
  if (!mb.burst && mbTryGrab(e, dt, home)) return;   // 冷卻好了、附近有人：開始俯衝抓人
  if (!mbBurst(e, dt, z, !!target)) {   // 沒在大面積撒粉：照一般人面蝶一輪一輪撒
    const had = m.spray;
    mothSpray(e, dt, true);
    if (m.spray && m.spray !== had) { m.spray.kind = mbKind(e, z); mb.mixIdx++; }   // 新的一輪：換成這一區的顏色
    if (had && !m.spray) m.cd = Math.max(m.cd || 0, P.flight.circleRest);   // 一輪掠過撒完：先回高空盤旋一陣子再來
  }
  // 飛行路線：平常在高空繞大圈盤旋；撒粉的那一輪（預告＋撒的時間，撒粉本身照舊）改成俯衝下來貼著目標頭頂掠過、拉高繞回來再掠過
  if (target && m.spray && !m.spray.burst) mbStrafe(e, dt, target, home);
  else { mb.run = null; mbCircle(e, dt, target || home, home); }
}
// 大面積撒粉：冷卻好了（而且這一區有人）→ 翅膀發光、地上圓圈預告 → 在 time 秒內把整區撒滿大團鱗粉。
// 正在預告或撒的時候回傳 true（這時候不做一般的一輪一輪撒粉）
// opt.home＝撒在哪裡（沒給＝巢）、opt.force＝不管冷卻馬上撒（飛走前用）、opt.telegraph＝預告幾秒（沒給＝burst.telegraph）
function mbBurst(e, dt, z, hasTarget, opt = {}) {
  const B = MOTH_BOSS.burst, m = e.mo, mb = e.mb;
  if (!mb.burst) {
    const home = opt.home || mb.nest;
    if (!opt.force) mb.burstCd = (mb.burstCd ?? B.first) - dt;
    if ((!opt.force && (mb.burstCd > 0 || !hasTarget)) || e.burnT > 0 || !home) return false;
    const tele = opt.telegraph ?? B.telegraph;
    // 開始預告：用一般人面蝶的翅膀發光（m.spray 的 tele），顏色＝這一區的鱗粉
    const kind = mbKind(e, z), [r, g, b] = MOTH_COLORS[kind].rgb, R = z.radius * CELL * B.cover;
    mb.mixIdx++;
    mb.burst = { kind, t: 0, done: 0, R, home, tele, spots: mbBurstSpots(home, R, B.puffs) };
    m.spray = { kind, phase: 'tele', t: 0, burst: true };
    const col = `rgb(${r},${g},${b})`;
    for (let i = 0; i < 3; i++) { const life = Math.max(.3, tele - i * .3); G.effects.push({ ring: true, x: home.x, y: home.y, r: R * (.15 + i * .25), r2: R, life, life0: life, color: col }); }
    flash(MOTH_BOSS.name + '張開翅膀…', e.x, e.y - e.slimeLift - e.drawHeight - 6, MOTH_COLORS[kind].glow);
    if (typeof sfxAt === 'function') bossSfxAt('mothHurt', e.x, e.y, MOTH_BOSS.sound.wake * .6, 'moth-boss-scream');
    return true;
  }
  const s = mb.burst, home = s.home;
  if (e.burnT > 0) { mb.burst = null; m.spray = null; mb.burstCd = B.every[0]; return false; }   // 身上著火：鱗粉燒掉了，撒不出來
  s.t += dt;
  if (m.spray && m.spray.burst) m.spray.t = Math.min(s.t, s.tele) / s.tele * MOTH.telegraph;   // 翅膀照預告進度越來越亮
  if (s.t < s.tele) return true;
  if (m.spray && m.spray.phase === 'tele') {   // 預告結束：開始撒（翅膀一閃一閃）
    m.spray.phase = 'spray';
    G.effects.push({ ring: true, x: home.x, y: home.y, r: 20, r2: s.R, life: .5, life0: .5, color: MOTH_COLORS[s.kind].glow });
    if (typeof sfxAt === 'function') sfxAt('mothSpray', e.x, e.y, 1, 'moth-boss-burst');
  }
  const want = Math.min(s.spots.length, Math.ceil((s.t - s.tele) / B.time * s.spots.length));
  for (; s.done < want; s.done++) { const p = s.spots[s.done]; mothPuff(p.x, p.y, s.kind, true, actorFloor(e)); }
  if (s.done >= s.spots.length) {
    mb.burst = null; m.spray = null;
    mb.burstCd = mothRand(B.every[0], B.every[1]);
    return false;
  }
  return true;
}
// 近戰打得到牠嗎（js/human-face-butterfly.js 的 mothDodgesMelee 呼叫）：飛得比 meleeLift 高就打不到，只能用槍
function mothBossDodgesMelee(e) { return (e.slimeLift || 0) > MOTH_BOSS.meleeLift; }

// ---- 抓人 ----
// 這個人能不能被抓（借用 js/vines.js 的判斷：沒被藤蔓、狂風吊著，沒在暈、沒剛被丟下來…）
function mbCanGrab(e, a) {
  if (!a || a.hp <= 0 || !G.vineCaps || typeof vineCanGrab !== 'function') return false;
  return vineCanGrab(a, a === G.player) && sameFloor(e, a);
}
// 築巢時：冷卻好了就挑附近的人（優先現在繞著飛的那個），開始預告、俯衝。開始了回傳 true
function mbTryGrab(e, dt, home) {
  const C = MOTH_BOSS.grab, mb = e.mb;
  mb.grabCd = (mb.grabCd ?? C.first) - dt;
  if (mb.grabCd > 0) return false;
  const asleep = a => !!(a && a.mothSleep && a.sleepT > 0);   // 睡著的人（睡眠鱗粉、麻醉彈）：睡在巢的範圍外也照樣抓
  const ok = a => mbCanGrab(e, a) && mbDist(a, e) <= C.range * CELL && (asleep(a) || mbDist(a, home) <= (MOTH_BOSS.leash + 2) * CELL);
  // 一半機率抓溫特、一半抓隊員（隊員從抓得到的裡面隨機挑一個）；想抓的那一邊沒人可抓，就抓另一邊
  const mates = (G.towers || []).filter(ok), playerOk = ok(G.player);
  const pickMate = () => mates.length ? mates[Math.floor(Math.random() * mates.length)] : null;
  let a = Math.random() < .5 ? (playerOk ? G.player : pickMate()) : (pickMate() || (playerOk ? G.player : null));
  if (!a) { mb.grabCd = 1; return false; }   // 附近沒人：等一下再看
  mb.victim = a; mb.swoopT = 0; mb.ringT = 0;
  e.mo.spray = null;
  mbSet(e, 'swoop');
  flash(a === G.player ? MOTH_BOSS.name + '盯上你了！' : MOTH_BOSS.name + '盯上了隊員！', a.x, a.y - 70, '#ff8fb0', .9);
  if (typeof sfxAt === 'function') bossSfxAt('mothHurt', e.x, e.y, MOTH_BOSS.sound.wake * .7, 'moth-boss-scream');
  return true;
}
// 預告（發抖、目標腳下紅圈）→ 俯衝：碰到就抓起來，時間到沒碰到就撲空
function mbSwoop(e, dt) {
  const C = MOTH_BOSS.grab, mb = e.mb, a = mb.victim;
  mb.swoopT += dt;
  const miss = text => { mb.victim = null; e.tremble = false; mb.grabCd = C.every[0] * .5; mbSet(e, 'nest'); if (text) flash(text, e.x, e.y - e.slimeLift - e.drawHeight * .5, '#e7c8ff', .8); };
  if (!mbCanGrab(e, a)) { miss(null); return; }   // 目標被藤蔓吊走、倒下、換樓層…：取消
  if (mb.swoopT < C.warn) {   // 預告：在目標上方發抖，腳下紅圈一圈一圈縮
    e.tremble = true;
    mbFlyToward(e, a.x, a.y - 10, dt, .4);
    if ((mb.ringT -= dt) <= 0) { mb.ringT = .25; G.effects.push({ ring: true, x: a.x, y: a.y + 10, r: 46, r2: 10, life: .3, life0: .3, color: '#ff5b7a' }); }
    return;
  }
  e.tremble = false;
  if (mbDist(e, a) <= C.reach * CELL && e.slimeLift <= C.diveLift + 30) { mbGrabVictim(e, a); return; }
  mbFlyToward(e, a.x, a.y, dt, C.diveSpeedMul);
  if (mb.swoopT >= C.warn + C.dive) miss('撲空了');
}
// 抓起來：借用 js/vines.js 的「被吊著」（不能動、怪物打不到；cap.wind＝不畫藤蔓），位置每幀跟著蝶后（mbCarryHold）
function mbGrabVictim(e, a) {
  const C = MOTH_BOSS.grab, mb = e.mb, isPlayer = a === G.player;
  if (isPlayer && typeof cancelChannel === 'function' && typeof playerChannel !== 'undefined' && playerChannel) cancelChannel();
  if (isPlayer && a.sitting && typeof standUp === 'function') standUp();
  const v = { x: a.x, y: a.y, kind: 'toss', state: 'grab', t: 0, len: 1, seed: 0, twitch: 0, temp: true };   // 假的藤蔓（不放進 G.vines、不會畫出來）
  if (a.mothSleep && a.sleepT > 0 && typeof mothWake === 'function') { mothWake(a); a.mothWakeT = 0; a.mothWakeFell = false; }   // 睡著的人被抓起來：在空中馬上醒過來（js/human-face-butterfly.js；不播從地上爬起來的動畫）
  const cap = { v, actor: a, isPlayer, mode: 'toss', wind: true, mothCarry: true, phase: 'mothCarry', t: 0, h: 0, x0: a.x, y0: a.y, hp: a.hp, camX: cam.x, camY: cam.y, topH: 0 };
  G.vineCaps.push(cap);
  a.vineCap = true; a.dashT = 0; a.knockT = 0;
  if (!isPlayer) { a.navPath = null; a.navGoal = null; a.meleeSwing = null; a.gunSwing = null; a.target = null; }
  mb.carry = { cap, t: 0, hurt: 0, from: { x: a.x, y: a.y }, ang: Math.atan2(e.y - a.y, e.x - a.x), face: !!e.faceRight };   // ang：繞圈現在轉到哪；face：抓著的時候一直朝同一邊（不然繞圈時一直轉身，人會在兩隻手之間跳來跳去）
  mb.victim = null;
  if (isPlayer) mbSet(e, 'carry');   // 溫特：抓到高空繞圈再丟下
  else { mb.skyCarry = true; mbSet(e, 'skyUp', MOTH_BOSS.sky.up); }   // 隊員：帶著飛向鏡頭、變大淡出（mbSkyLeave 把隊員交給 js/vines.js 的「吊在畫面外 → 掉下來」）
  flash(isPlayer ? '被' + MOTH_BOSS.name + '抓走了！' : '隊員被抓走了！', a.x, a.y - 60, '#ff8fb0', .9);
  if (isPlayer && typeof addShake === 'function') addShake(3);
  G.effects.push({ ring: true, x: a.x, y: a.y + 8, r: 8, r2: 46, life: .35, life0: .35, color: '#ff8fb0' });
  if (typeof sfxAt === 'function') sfxAt('mothGrab', a.x, a.y, 1, 'moth-boss-grab');   // 人面蝶后抓人（音效編輯器可換檔）
}
// 抓人時人在蝶后圖上的位置：x、y＝兩隻手中間（圖寬、圖高的比例），feet＝人的腳底在這個點下面幾像素（讓身體夾在兩隻手中間）
const MOTH_BOSS_HOLD_ART = { x: .127, y: .43, feet: 14 };   // 2026-11-23 使用者微調：往手指那邊 15px（352 寬的圖 ≈ 0.043）、往上 10px
// 蝶后兩隻手中間在畫面上的位置（圖朝右時左右翻過來）
function mbHandPoint(e) {
  const A = MOTH_BOSS_HOLD_ART, dw = e.drawWidth, dh = e.drawHeight;
  const dy = e.y + 13 - (e.slimeLift || 0) - dh;   // 身體圖的上緣（js/render.js 的 drawEnemy 同一套算法）
  let x = e.x - dw / 2 + dw * A.x;
  if (e.forceFlip) x = 2 * e.x - x;
  return { x, y: dy + dh * A.y };
}
// 抓著的人用手抓著（js/vines.js 的 stepVineCap 每幀把人放在 cap.x0、cap.y0；畫的時候往上抬 cap.h）
//   人的位置＝手的正下方、地面跟蝶后同一高度（影子在地上），往上抬到肩膀剛好在手的位置
function mbCarryHold(e, dt) {
  const c = e.mb.carry; if (!c) return;
  const hand = mbHandPoint(e), k = Math.min(1, c.t / .25);   // 剛抓到的 0.25 秒內從腳下慢慢抬到手上
  c.cap.x0 = c.from.x + (hand.x - c.from.x) * k; c.cap.y0 = c.from.y + (e.y - c.from.y) * k;
  c.cap.h = Math.max(0, c.cap.y0 - hand.y - MOTH_BOSS_HOLD_ART.feet) * k;
  const a = c.cap.actor;
  if (a.mothSleep && a.sleepT > 0 && typeof mothWake === 'function') { mothWake(a); a.mothWakeT = 0; a.mothWakeFell = false; }   // 抓在手上一定是醒著（不播睡覺動畫）
  if (c.cap.isPlayer && dt > 0 && typeof viewW === 'function') {   // 溫特被抓：鏡頭跟著空中的溫特和蝶后（js/vines.js 的 vineCameraHold 照 cap.camX、camY 擺鏡頭）
    const mapW = COLS * CELL, mapH = ROWS * CELL, vw = viewW(), vh = viewH();
    // 對準「溫特的腳」和「蝶后的頭頂」中間：兩個都在空中，只跟著地面的話會跑出畫面上方
    const feetY = c.cap.y0 - c.cap.h, topY = e.y + 13 - e.slimeLift - e.drawHeight, fx = c.cap.x0, fy = (feetY + topY) / 2;
    const tx = mapW <= vw ? (mapW - vw) / 2 : Math.max(0, Math.min(mapW - vw, fx - vw / 2));
    const ty = mapH <= vh ? (mapH - vh) / 2 : Math.max(0, Math.min(mapH - vh, fy - vh / 2));
    const k = Math.min(1, dt * 4);
    c.cap.camX += (tx - c.cap.camX) * k; c.cap.camY += (ty - c.cap.camY) * k;
  }
}
// 抓著飛到高空（carryLift），繞著抓人的地方轉 circle 秒，再丟下來；被打夠了會提早鬆手
function mbCarry(e, dt) {
  const C = MOTH_BOSS.grab, mb = e.mb, c = mb.carry;
  if (!c || !G.vineCaps || !G.vineCaps.includes(c.cap)) { mb.carry = null; mbSet(e, 'nest'); return; }   // 人已經不在了（換地圖、被別的東西放開）
  c.t += dt;
  if (c.cap.isPlayer) {   // 抓到溫特：照固定的「∞」字路線飛（mbEightStep），飛完 eightLoops 圈回到巢的上空
    mbEightStep(e, c, dt);
  } else {
    c.ang += C.circleSpeed * dt;
    const R = C.circleR * CELL;
    mbFlyToward(e, c.from.x + Math.cos(c.ang) * R, c.from.y + Math.sin(c.ang) * R * .6, dt, C.carrySpeedMul);
    e.faceRight = c.face; e.forceFlip = c.face;   // 抓著的時候不轉身
  }
  e.forceFlip = !!e.faceRight;
  mbCarryHold(e, dt);
  if (c.hurt >= e.maxhp * C.breakDmg) { flash('鬆手了！', e.x, e.y - e.slimeLift - e.drawHeight * .5, '#fff2b0', .9); mbRelease(e); return; }
  if (c.t >= (c.cap.isPlayer ? C.eightTime : C.circle)) { mbSet(e, 'toDrop'); c.dropT = 0; c.drop = null; }   // 繞完：找站得住的地方，飛過去再丟
}
// 固定的「∞」字路線：以那一區的巢為中心，左右 eightW、上下 eightH，eightTime 秒飛 eightLoops 圈。
// 直接照路線擺位置（不是追著目標點飛），所以不會切內圈、忽快忽慢；中間最快、兩端像鐘擺一樣慢下來轉身。
// 開頭、結尾各 eightEase 的時間慢慢加速、減速；被抓後 eightJoin 秒內從抓人的地方順順地滑進路線。
// ∞ 的中心：對準固定落點（離巢最近的安全落點；飛完最後一圈往右飛停下時，手剛好在落點正上方，直接鬆手），
// 整條路線伸進地圖外的黑色區時才左右、上下一格一格挪；同一個巢每次都一樣（固定路線、固定落點）
function mbEightCenter(e, c) {
  const C = MOTH_BOSS.grab, mb = e.mb, home = mb.nest || c.from;
  if (!c.fixedDrop) c.fixedDrop = mbSafeDrop(c.cap.actor, home.x, home.y);
  const off = Math.abs(mbHandPoint(e).x - e.x) * (e.mbH ? e.mbH / e.drawHeight : 1);   // 手在身體旁邊多遠（最後是往右飛，手在右邊）
  const base = { x: c.fixedDrop.x - off, y: c.fixedDrop.y };
  const key = Math.round(base.x) + ',' + Math.round(base.y) + ',' + C.eightW + ',' + C.eightH;   // 落點、大小一樣就沿用算好的中心
  if (mb.eightCenter && mb.eightCenter.key === key) return mb.eightCenter;
  const fits = (cx, cy) => { for (let i = 0; i < 48; i++) { const ph = Math.PI * 2 * i / 48; if (!mothCanFly(cx + Math.sin(ph) * C.eightW / 2, cy + Math.sin(ph * 2) * C.eightH / 2)) return false; } return true; };
  let best = { x: base.x, y: base.y };
  search: for (let R = 0; R <= 10; R++) for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
    if (Math.max(Math.abs(dx), Math.abs(dy)) !== R) continue;
    const cx = base.x + dx * CELL, cy = base.y + dy * CELL * .5;
    if (fits(cx, cy)) { best = { x: cx, y: cy }; break search; }
  }
  return (mb.eightCenter = { key, x: best.x, y: best.y });
}
function mbEightStep(e, c, dt) {
  const C = MOTH_BOSS.grab, mb = e.mb, center = mbEightCenter(e, c);
  const u = Math.min(1, c.t / C.eightTime), r = Math.max(.01, Math.min(.49, C.eightEase)), vm = 1 / (1 - r);
  const p = u < r ? vm * u * u / (2 * r) : u > 1 - r ? 1 - vm * (1 - u) * (1 - u) / (2 * r) : vm * (u - r / 2);   // 加速 → 等速 → 減速
  const ph = Math.PI * 2 * C.eightLoops * p;
  let tx = center.x + Math.sin(ph) * C.eightW / 2, ty = center.y + Math.sin(ph * 2) * C.eightH / 2;
  if (c.join == null) c.join = { x: e.x - tx, y: e.y - ty };   // 被抓那一刻蝶后跟路線起點差多少：慢慢收掉
  const j = Math.max(0, 1 - c.t / C.eightJoin), jk = j * j * (3 - 2 * j);
  tx += c.join.x * jk; ty += c.join.y * jk;
  const ox = e.x, oy = e.y, k = dt > 0 ? 1 - Math.exp(-dt * 18) : 0;   // 緊緊跟著路線（一點點平滑：路線被擋住時不會瞬間移動）
  const nx = e.x + (tx - e.x) * k, ny = e.y + (ty - e.y) * k;
  if (mothCanFly(nx, ny)) { e.x = nx; e.y = ny; }   // 飛得過牆，只是不能飛出地圖（地圖外的黑色區）
  else if (mothCanFly(nx, e.y)) e.x = nx;
  else if (mothCanFly(e.x, ny)) e.y = ny;
  if (dt > 0) {   // 照實際移動算速度、加速度（轉身、傾斜用）
    const vx = (e.x - ox) / dt, vy = (e.y - oy) / dt;
    mb.ax = (mb.ax || 0) + (((vx - (mb.vx || 0)) / dt) - (mb.ax || 0)) * Math.min(1, dt * 8);
    mb.vx = vx; mb.vy = vy;
    if (Math.abs(vx) > 30) e.faceRight = vx > 0;
  }
  c.face = !!e.faceRight;
}
// 繞完圈：飛到「人站得住的地方」正上方（手在那一格上面）才鬆手，讓人直直掉下去
function mbToDrop(e, dt) {
  const C = MOTH_BOSS.grab, mb = e.mb, c = mb.carry;
  if (!c || !G.vineCaps || !G.vineCaps.includes(c.cap)) { mb.carry = null; mbSet(e, 'nest'); return; }
  const a = c.cap.actor;
  if (!c.drop) c.drop = c.fixedDrop || (c.cap.isPlayer && mb.nest ? mbSafeDrop(a, mb.nest.x, mb.nest.y) : mbSafeDrop(a, c.cap.x0, e.y));   // 溫特：固定丟在離巢最近的安全落點；其他：離現在最近的
  c.t += dt; c.dropT += dt;
  const hand = mbHandPoint(e), off = hand.x - e.x;   // 手在身體左邊還是右邊（抓著時不轉身，固定）
  mbFlyToward(e, c.drop.x - off, c.drop.y, dt, C.carrySpeedMul);
  e.faceRight = c.face; e.forceFlip = c.face;
  mbCarryHold(e, dt);
  if (c.hurt >= e.maxhp * C.breakDmg) { flash('鬆手了！', e.x, e.y - e.slimeLift - e.drawHeight * .5, '#fff2b0', .9); mbRelease(e); return; }
  const h2 = mbHandPoint(e);
  if ((Math.abs(h2.x - c.drop.x) < 8 && Math.abs(e.y - c.drop.y) < 8) || c.dropT > 4) mbRelease(e);   // 到了（或飛太久）就丟
}
// 離 (x, y) 最近、這個人站得住的地方（一圈一圈往外找）
function mbNearestDrop(a, x, y) {
  if (mbDropOk(a, x, y)) return { x, y };
  const [c0, r0] = cellAt(x, y);
  for (let R = 1; R <= 12; R++) for (let dr = -R; dr <= R; dr++) for (let dc = -R; dc <= R; dc++) {
    if (Math.max(Math.abs(dc), Math.abs(dr)) !== R) continue;
    const [px, py] = center(c0 + dc, r0 + dr);
    if (mbDropOk(a, px, py)) return { x: px, y: py };
  }
  return null;
}
// ---- 鏡頭（js/game.js 的 updateCamera 呼叫）：溫特被抓上去、掉下來、落地後一小段時間，鏡頭都是慢慢移過去，不會一下子切換 ----
//   抓在手上的時候由 js/vines.js 的 vineCameraHold 照 cap.camX、camY 擺（mbCarryHold 每幀慢慢移）；掉下來之後交給這裡
let mbCamLast = 0;
function mothCameraEase() {
  const p = G && G.player; if (!p) return false;
  const now = performance.now(), dt = Math.min(.1, mbCamLast ? (now - mbCamLast) / 1000 : 0); mbCamLast = now;
  const cap = G.vineCaps && G.vineCaps.find(c => c.actor === p && c.mothCarry);
  if (cap) G.mothCamEase = 1.5;   // 還在空中、正在掉：一直跟；落地後再慢慢跟 1.5 秒
  else if (G.mothCamEase > 0) G.mothCamEase -= dt;
  else return false;
  const mapW = COLS * CELL, mapH = ROWS * CELL, vw = viewW(), vh = viewH();
  const fy = p.y - (cap ? Math.max(0, cap.h || 0) * .5 : 0);   // 掉下來的途中：對準他和地面中間
  const tx = mapW <= vw ? (mapW - vw) / 2 : Math.max(0, Math.min(mapW - vw, p.x - vw / 2));
  const ty = mapH <= vh ? (mapH - vh) / 2 : Math.max(0, Math.min(mapH - vh, fy - vh / 2));
  const k = 1 - Math.exp(-dt * 4);
  cam.x += (tx - cam.x) * k; cam.y += (ty - cam.y) * k;
  if (!cap && Math.abs(tx - cam.x) < 1 && Math.abs(ty - cam.y) < 1) G.mothCamEase = 0;   // 追上了：交回一般鏡頭
  return true;
}

// 帶著隊員飛出畫面：隊員交給 js/vines.js（跟藤蔓摔隊友一樣：在畫面外吊 mateAway 秒 → 從畫面上方掉下來、彈兩下、躺著暈、扣血）
function mbMateAway(e) {
  const C = MOTH_BOSS.grab, mb = e.mb, c = mb.carry;
  if (!c) return;
  mb.carry = null; mb.grabCd = mothRand(C.every[0], C.every[1]);
  const cap = c.cap, a = cap.actor;
  if (!G.vineCaps || !G.vineCaps.includes(cap) || cap.phase !== 'mothCarry') return;
  const spot = mbSafeDrop(a, c.from.x, c.from.y, true);   // 落點：固定的安全落點（隨機挑離被抓的地方近的一個）
  a.floor = spot.floor || a.floor;
  cap.phase = 'away'; cap.t = 0; cap.awayT = C.mateAway; cap.h = 0;
  cap.dropX = spot.x; cap.dropY = spot.y; cap.cut = false;   // cut false：掉下來時照藤蔓那樣從靠近鏡頭的大小縮回來
}
// 把抓著的人丟下來：落點在蝶后正下方附近、走得到的地方（不會丟進牆裡）；交給 js/vines.js 的「掉下來」（彈兩下、躺著暈、扣血）
function mbRelease(e) {
  const mb = e.mb, c = mb && mb.carry;
  if (!c) return;
  mb.carry = null; mb.grabCd = mothRand(MOTH_BOSS.grab.every[0], MOTH_BOSS.grab.every[1]);
  if (mb.state === 'carry' || mb.state === 'toDrop') mbSet(e, 'nest');
  const cap = c.cap, a = cap.actor;
  if (!G.vineCaps || !G.vineCaps.includes(cap) || cap.phase !== 'mothCarry') return;
  // 落點：一定是固定的安全落點（繞完圈時已經飛到它正上方；被打到提早鬆手時，就近挑一個，人直接落在那裡）
  const spot = c.drop && mbDropOk(a, c.drop.x, c.drop.y, true) ? c.drop : mbSafeDrop(a, cap.x0, cap.y0);
  a.x = cap.x0 = spot.x; a.y = cap.y0 = spot.y;
  if (spot.floor) a.floor = spot.floor;   // 樓層照落點那一格設好（不會被當成在 1 樓）
  cap.phase = 'fall'; cap.t = 0; cap.fallV = 0; cap.cut = true;   // cut：從半空中掉下來（不往鏡頭靠近）
  cap.fallH0 = Math.max(1, cap.h); cap.lieSide = Math.random() < .5 ? -1 : 1;
  if (cap.isPlayer) flash('被丟下來了！', a.x, a.y - 60, '#ff8fb0', .8);
}
// 這裡能不能讓這個人落地：在地圖裡、不在隱藏區、跟他同一層的地面、他走得進去（不會卡在牆、建築裡）
//   anyFloor＝不管這個人現在算在哪一層，用那一格自己的樓層來判斷（固定落點用）
function mbDropOk(a, x, y, anyFloor) {
  const [c, r] = cellAt(x, y);
  if (!inGrid(c, r) || (typeof inHiddenArea === 'function' && inHiddenArea(x, y))) return false;
  const fl = spawnFloorAt(c, r);
  if (!anyFloor && typeof hasFloors !== 'undefined' && hasFloors && fl !== actorFloor(a)) return false;
  const blocked = a === G.player ? playerBlocked : (typeof sentryBlocked === 'function' ? sentryBlocked : playerBlocked);
  const save = a.floor; if (anyFloor) a.floor = fl;
  try { return !onFloorDo(a, () => blocked(x, y)); } finally { a.floor = save; }
}
// 固定的安全落點（地圖編輯器「🦋 BOSS 丟人落點」放的格子，存在地圖的 bossDrops：['欄,列'…]）：
//   挑離 (x, y) 最近、現在沒被建築擋住的那一個；random＝從最近的 3 個裡隨機挑
//   回傳 { x, y, floor }。這張地圖沒放落點（或全部被擋住）才退回舊的找法
//   2026-11-23 使用者說：被丟到牆邊會卡在碰撞邊緣動不了、還被判定成 1 樓 → 改成只丟在固定的安全點
function mbSafeDrop(a, x, y, random) {
  const list = [];
  for (const k of (typeof MAP !== 'undefined' && MAP && MAP.bossDrops) || []) {
    const [c, r] = String(k).split(',').map(Number);
    if (!inGrid(c, r)) continue;
    const [px, py] = center(c, r);
    if (mbDropOk(a, px, py, true)) list.push({ x: px, y: py, floor: spawnFloorAt(c, r), d: Math.hypot(px - x, py - y) });
  }
  if (list.length) {
    list.sort((p, q) => p.d - q.d);
    return list[random ? Math.floor(Math.random() * Math.min(3, list.length)) : 0];
  }
  const C = MOTH_BOSS.grab, old = random ? mbDropSpot(a, x, y, C.mateDropMin, C.mateDropMax, { x, y }) : (mbNearestDrop(a, x, y) || { x: a.x, y: a.y });
  return { x: old.x, y: old.y, floor: actorFloor(a) };
}
// 找落點：離 (x, y) minD～maxD 格隨機找；找不到就從 (x, y) 一圈一圈往外找最近的；再找不到就丟回 fallback（被抓的地方）
function mbDropSpot(a, x, y, minD, maxD, fallback) {
  for (let i = 0; i < 60; i++) {
    const ang = Math.random() * Math.PI * 2, d = (minD + Math.random() * (maxD - minD)) * CELL;
    const px = x + Math.cos(ang) * d, py = y + Math.sin(ang) * d;
    if (mbDropOk(a, px, py)) return { x: px, y: py };
  }
  const [c0, r0] = cellAt(x, y);
  for (let R = 0; R <= 10; R++) for (let dr = -R; dr <= R; dr++) for (let dc = -R; dc <= R; dc++) {
    if (Math.max(Math.abs(dc), Math.abs(dr)) !== R) continue;
    const [px, py] = center(c0 + dc, r0 + dr);
    if (mbDropOk(a, px, py)) return { x: px, y: py };
  }
  return fallback ? { x: fallback.x, y: fallback.y } : { x: a.x, y: a.y };
}

// ---- 核心護盾（game.js 在判定核心破掉前呼叫）：人面蝶后活著，牠的核心少受傷 ----
function mothBossShieldCore() {
  const list = mothBosses(); if (!list.length) return;
  for (const e of list) {
    const core = e.carryCore;
    if (!core || core.dead || core.carried || !core.awake || !(core.hp < core.lastHp)) continue;
    core.hp = core.lastHp - (core.lastHp - core.hp) * (1 - MOTH_BOSS.coreShield);
    core.lastHp = core.hp; core.hitT = .16;
    const now = performance.now();
    if (now > (G.mothShieldNoteAt || 0)) { G.mothShieldNoteAt = now + 2500; flash('核心護盾', core.x, core.y - CORE.h - 14, '#e7c8ff'); }   // 偶爾提示一下
  }
}

// 大面積撒粉的落點：從巢中心往外螺旋排開（平均鋪滿整個圓，再加一點亂數），飛不到的地方（地圖外）跳過
function mbBurstSpots(home, R, n) {
  const out = [], turn = Math.PI * (3 - Math.sqrt(5));   // 黃金角：點會平均散開
  const a0 = Math.random() * Math.PI * 2;
  for (let i = 0; i < n; i++) {
    const d = R * Math.sqrt((i + .5) / n), a = a0 + i * turn;
    const x = home.x + Math.cos(a) * d + mothRand(-14, 14), y = home.y + Math.sin(a) * d * .75 + mothRand(-10, 10);
    if (mothCanFly(x, y)) out.push({ x, y });
  }
  return out;
}

// ---- 倒下（combat-feel.js 的 onEnemyDeath 呼叫）：抱著的核心掉在原地 ----
function mothBossDown(e) {
  if (typeof recordBossDown === 'function') recordBossDown('mothBoss');   // 記住打倒過了：之後再來 B56 不會再有預兆影子飛過去（js/missions.js）
  mbRelease(e);   // 抓著人：丟下來
  const c = e.carryCore;
  if (c && !c.dead && c.carried) {
    e.mb.nest = { x: e.x, y: e.y }; mbDropCore(e);
  }
  systemNotice(e.eliteName + '倒下了！', true);
  if (typeof coreBanner === 'function') coreBanner(e.eliteName + '倒下了', '', '#f4d9ff');
  bossImpact(e.x, e.y, 10, .08);
}

// ---- 畫面上方的 BOSS 血條（core-frenzy.js 的 drawCoreBossUI 呼叫）：人面蝶后＋抱著的核心 ----
function mothBossBars() {
  const out = [];
  for (const e of mothBosses()) {
    if (!e.eliteAwake) continue;
    out.push({ label: e.eliteName, ratio: e.hp / e.maxhp, hit: e.hitT > 0, colors: ['#8a5cc4', '#f3e2ff'], frame: '#e1c4ff', text: '#f6e9ff' });
    const core = e.carryCore;
    if (core && !core.dead && core.carried) out.push({ label: '異質核心（在' + e.eliteName + '懷裡）', ratio: core.hp / core.maxhp, hit: core.hitT > 0, colors: ['#7b3cff', '#c78bff'], frame: '#a970ff', text: '#e3b8ff' });
  }
  return out;
}
// 中BOSS 音樂（js/boss-music.js）：醒著就播（音量照溫特離牠多遠，在 boss-music.js 統一算）
const mothBossHunting = () => mothBosses().some(e => e.eliteAwake);

// ---- 畫面：抱在懷裡的核心＋蓋在核心上的前方手（render.js 畫完身體後呼叫，dx～dh＝身體實際畫的位置）----
const MOTH_BOSS_CORE_ART = { x: .10, y: .42, angle: -8 };   // 核心捧在兩隻手中間：中心位置（圖寬、圖高的比例）、旋轉角度（度）；大小＝核心原本的大小（CORE.w × CORE.h），不跟著牠的體型縮放
function drawMothBossCore(ctx, e, dx, dy, dw, dh) {
  const core = e.carryCore;
  const coreOn = core && !core.dead && core.carried && coreImg.complete && coreImg.naturalWidth;
  const held = mbHeldActor(e);
  if (!coreOn && !held) return;
  if (held) drawMothHeld(ctx, e, held, dx, dy, dw, dh);   // 抓著的人：畫在身體和前方手中間（跟核心一樣）
  if (coreOn) drawMothCoreArt(ctx, e, core, dx, dy, dw, dh);
  drawMothFrontHand(ctx, e, dx, dy, dw, dh);
}
// 現在抓在手上的人（還在空中、還沒丟下來）
function mbHeldActor(e) {
  const c = e.mb && e.mb.carry, cap = c && c.cap;
  return cap && cap.phase === 'mothCarry' && G.vineCaps && G.vineCaps.includes(cap) ? cap.actor : null;
}
// 把抓著的人畫在手的位置：手抓在他的肩膀（跟核心同一個點），整個人跟著蝶后的圖一起動（被打發抖、上下飄都一起）
//   一般畫人的地方（js/vines.js 的 drawVineActor）這時候只畫地上的影子，人在這裡畫
function drawMothHeld(ctx, e, a, dx, dy, dw, dh) {
  const A = MOTH_BOSS_HOLD_ART;
  let hx = dx + dw * A.x;
  const hy = dy + dh * A.y;
  ctx.save();
  if (e.forceFlip) {   // 蝶后的圖是左右翻過來畫的：人不要跟著翻（名字、血條的字才不會反過來），換算回沒翻的位置
    ctx.translate(e.x, 0); ctx.scale(-1, 1); ctx.translate(-e.x, 0);
    hx = 2 * e.x - hx;
  }
  const grow = e.mbH ? e.drawHeight / e.mbH : 1;   // 飛向鏡頭變大時，抓著的人跟著一起變大（假 3D）
  ctx.translate(hx, hy); ctx.scale(grow, grow);
  if (a === G.player) {   // 溫特被抓：像逐格動畫一樣在「往左」「往右」兩個姿勢之間切換，跟蝶后拍翅膀換圖同一拍（翅膀換一張，溫特就換一邊）
    const C = MOTH_BOSS.grab, side = Math.floor((e.mo && e.mo.flapT) || 0) % 2 ? 1 : -1;
    ctx.rotate(side * (C.struggleAngle || 0) * Math.PI / 180);
    ctx.translate(side * (C.struggleShake || 0), 0);
  }
  ctx.translate(-hx, -hy);
  ctx.translate(hx - a.x, hy + A.feet - a.y);   // 人的腳底在兩隻手中間往下 feet 像素（身體夾在兩隻手中間）
  const base = a === G.player ? (typeof vineBaseDrawPlayer === 'function' ? vineBaseDrawPlayer : drawPlayer) : (typeof vineBaseDrawTower === 'function' ? vineBaseDrawTower : drawTower);
  const shadow = typeof drawCharacterShadow === 'function' ? drawCharacterShadow : null;
  if (shadow) drawCharacterShadow = () => {};   // 影子另外畫在地上
  try { base(a); } finally { if (shadow) drawCharacterShadow = shadow; }
  ctx.restore();
}
function drawMothCoreArt(ctx, e, core, dx, dy, dw, dh) {
  const grow = e.mbH ? e.drawHeight / e.mbH : 1;   // 飛向鏡頭變大時，核心跟著一起變大
  const A = MOTH_BOSS_CORE_ART, len = CORE.h * grow, w = CORE.w * grow, now = performance.now() / 1000;
  ctx.save();
  ctx.translate(dx + dw * A.x, dy + dh * A.y); ctx.rotate(A.angle * Math.PI / 180);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(coreImg, -w / 2, -len / 2, w, len);
  const glow = flashSprite(coreImg, '#c99bff');   // 核心微微發紫光，一明一暗
  if (glow) {
    ctx.globalAlpha = .12 + .14 * (.5 + .5 * Math.sin(now * 3 + core.seed));
    ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(glow, -w / 2, -len / 2, w, len);
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  }
  if (core.hitT > 0) drawHitFlash(coreImg, Math.min(1, core.hitT / .16), '#d69bff', -w / 2, -len / 2, w, len);
  ctx.restore();
}
// 前方那隻手蓋在核心、抓著的人上面：每張動作圖都有一張同名加「-前方手」的圖（跟本體一樣大、只畫前面那隻手），疊在同一個位置
function drawMothFrontHand(ctx, e, dx, dy, dw, dh) {
  const file = e.forceFrame || e.sprite;
  const hand = file && monsterImage(file.replace(/\.png$/i, '-前方手.png'));
  if (hand && hand.complete && hand.naturalWidth) {
    const smooth = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(hand, dx, dy, dw, dh);
    if (e.hitT > 0) drawHitFlash(hand, Math.min(1, e.hitT / .16), e.hitColor, dx, dy, dw, dh);   // 被打時手也跟身體一起閃
    ctx.imageSmoothingEnabled = smooth;
  }
}
