/* ===== 菁英花蓮版權老鼠「花蓮老鼠王」（O666區-橘線捷運站 上方月台的地圖 BOSS）=====
   - 平常躲在鐵軌底下，看不到、打不到（其實還沒生出來）。上方那班紅色列車也被牠卡住，不會進站。
   - 觸發：地圖上任何一顆異質核心被喚醒 → 鐵軌底下開始震動、冒土 → 老鼠王從鐵軌冒出上半身（下半身被月台擋住）。
   - 異質核心＝老鼠王的護甲：場上每還有一顆沒打破的核心，老鼠王受到的傷害就少一截（armor）。
     核心和老鼠王之間會連著淡淡的紫色光線，看得出來是核心在幫牠撐著。
   - 核心洞（打地鼠）：地圖上鋪的洞素材（RAT_KING.holeTile）專門放核心。核心一開始就隨機放在其中一個洞口。
       核心被打到 → 先震動 → 洞裡冒出手把核心抓住 → 拖進洞裡 → 從另一個洞冒出來放下。
       每次核心露出來，最多只會被打掉 core.exposeCap 成血量（打到上限就打不動了，等手來搬），所以要多打幾輪才打得破。
   - 一般的手（只在核心洞以外的地方冒出來，冒出來的地方會先裂開一個洞）：
       1. 拳頭：在溫特或隊員腳下冒出握拳的手往上打，一隻手只打一個（範圍裡離洞口最近的；怪物自己人也會被打到），打中會被揍飛（飛出去、彈兩下、躺著暈，跟藤蔓丟人同一套）。
       2. 抓人：紫色預警圈。被抓到的人握在拳頭裡（頭露在外面），過 grab.hold 秒：
          溫特 → 被往外丟出去；隊員 → 有 grab.dragChance 的機會被拖進地底（過一陣子別的地方的地面裂開，從洞口被往上拋飛、落地暈眩），不然也是被丟出去。
          被揍飛、丟出去、躺在地上暈的時候不會受擊閃紅、發抖。
          在這之前把那隻手打掉（手有血量），人就救出來了。
   - 最後一顆核心破掉：老鼠王暈倒 stun.time 秒（頭上轉星星），這段時間受到的傷害 ×stun.dmgMul，是爆發輸出的好時機。
   - 暴怒（血量剩一半）：手變多、變快，一次冒 2～3 隻；還會從洞裡叫出小的花蓮版權老鼠。
   - 血量歸零（死亡表演，節奏慢）：老鼠王卡在鐵軌上暈頭轉向 → 響起這個車站的到站音樂、隧道裡的車燈越來越亮、地面越震越大
     → 捷運煞車聲（煞車來不及）→ 紅色列車撞上去（白光、畫面頓住、慢動作、大震動、火花）→ 老鼠王邊轉邊飛向鏡頭 → 「討伐成功」。
     之後列車照常停靠，可以搭車（開往哪裡寫在 data/mrt-train.js 的 variants）。核心全破的結算畫面會等老鼠王被撞飛之後才跳。
   素材：本體沿用花蓮版權老鼠的圖（放大 scale 倍）；拳頭是 left-fist.png，抓核心張開的手是 left-hand.png（都用 images/monster/rat-king/ 的紫藍版，見 RAT_KING.artDir）。
   數值都在下面的 RAT_KING。必須在 burrowing-mouse.js 之後、game.js 之前載入。
*/
const RAT_KING = {
  name: '花蓮老鼠王',
  // 哪張地圖：train＝被卡住的那班列車的車頭位置 [欄, 列]（地圖編輯器裡車頭圖章的位置）；
  // area＝手會冒出來的範圍 [左欄, 上列, 右欄, 下列]（只會冒在有地板、不是牆的格子）
  maps: { 'map_691cf40a-884b-423d-b1df-beef88b16f00': { train: [20, 4], area: [12, 8, 57, 39] } },   // O666區-橘線捷運站：上方月台
  scale: 4,                      // 體型：花蓮版權老鼠原圖（110×90）的幾倍
  showRow: 72,                   // 原圖第幾列對齊月台邊緣（這列以下被月台擋住看不到）
  hp: 4200,                      // 血量
  atk: 1.4,                      // 攻擊力：花蓮版權老鼠的幾倍（拳頭、丟人的傷害）
  rewardMul: 8, crystalMul: 8,   // 打倒給的結晶：花蓮版權老鼠的幾倍
  sway: { cells: 1.5, speed: .35 },   // 在鐵軌上左右慢慢晃：幅度（格）、速度
  armor: { perCore: .25, max: .8 },   // 每顆還沒打破的核心擋掉幾成傷害、最多擋幾成
  stun: { time: 6, dmgMul: 2 },       // 最後一顆核心破掉：暈幾秒、這段時間傷害幾倍
  enrageAt: .5,                  // 血量剩幾成暴怒
  emerge: { delay: 2.2, rumble: 2.4, rise: 2.4, hold: 1.2 },   // 核心醒了幾秒後開始震、震幾秒才冒出來、冒出來花幾秒、亮相多停幾秒
  // 手：every＝隔幾秒冒一波（最短～最長），count＝一波幾隻；frenzy＝暴怒時的版本
  //   scale＝手的大小（原圖 110×90 的幾倍）；riseSpeed＝往上舉、縮回去的速度（1＝原本的速度，.5＝一半的速度）
  //   coreHoleGap＝一般的手離核心洞至少幾格（核心洞只給搬核心的手用）
  //   grabChance＝一波裡第一隻手用「抓」的機會（其他是拳頭）；holdSway＝抓住人時手左右搖晃：幅度（弧度，.1 約 6 度）、速度
  hands: { every: [2.8, 4.2], count: [1, 1], frenzyEvery: [2.8, 4.2], frenzyCount: [2, 3], frenzySpeed: .75, grabChance: .6, scale: 2.5, riseSpeed: .5, coreHoleGap: 2.5, holdSway: { angle: .1, speed: 2.4 } },
  // 核心洞：地圖上鋪的這種洞素材就是核心會出現的地方（在地圖編輯器加減、搬動，核心出現的位置就跟著變）
  holeTile: 'tile_mvmo77lx',     // 地圖素材「hole02」
  // 一般的手冒出來時地上裂開的洞（用同一張 hole02 圖）：size＝大小倍率、linger＝手縮回去後洞還留幾秒才淡掉
  dig: { art: 'images/破損建築/hole02.png', size: 1, linger: 1.2 },
  // 拳頭：預警幾秒、冒出、停住、縮回；打中範圍（格）；launch＝揍飛：飛多遠（格，最短～最長）、往上拋的速度
  //   monsterDamage＝拳頭打到怪物（自己人也會被打）扣多少血
  punch: { windup: .95, rise: .18, hold: .35, sink: .3, radius: 2.2, launch: { dist: [2.5, 3.8], up: 230 }, monsterDamage: 40 },
  // 抓人：預警幾秒、冒出、打中範圍（格）、握住幾秒才丟出去／拖下去（這段時間打掉手就救出來）、手的血量、
  //   在地底幾秒、吐出來的傷害倍率、吐出來暈幾秒、兩次抓人至少隔幾秒；
  //   dragChance＝抓到隊員時被拖進地底的機會（其他就丟出去；溫特一律丟出去）；
  //   throw＝丟出去：飛多遠（格）、往上拋的速度、從多高丟出去（像素，約拳頭的高度）、撞牆扣多少血、丟出去時的傷害倍率
  grab: { windup: 1.15, rise: .22, radius: 2, hold: 5, handHp: 260, under: 6, spitDamageMul: 1.2, daze: 1.4, cooldown: 3,
    dragChance: .5, throw: { dist: [4.5, 7], up: 260, height: 100, wallDamage: 12, damageMul: 1 },
    // pop＝拖進地底的隊員過一陣子從洞口被往上拋出來：地面先裂開冒土幾秒（warn），再往上拋（up＝往上的速度，越大飛越高）、落在幾格外（dist），落地彈兩下、躺著暈
    pop: { warn: .7, up: 520, dist: [1.5, 3] } },
  // 搬核心：
  //   react＝核心被打到：先震幾秒，手才冒出來（冒出來花 windup 秒）把它抓住
  //   exposeCap＝核心每露出來一次，最多被打掉幾成血（.2＝兩成；打到上限就打不動，等手來搬）
  //   first／every＝另外每隔一陣子也會自己搬一次（老鼠王冒出來後幾秒第一次、之後隔幾秒）；windup＝自己搬的預警
  //   rise／hold／sink＝冒出、握住、拖下去；under＝在地底幾秒；popHold＝從另一個洞冒出來後握著幾秒才放下；minMove＝新的洞至少離原本幾格
  core: { react: { shake: .55, windup: .2 }, exposeCap: .2, first: [10, 14], every: [16, 24], windup: 1, rise: .25, hold: .55, sink: .4, under: [1.2, 2], popHold: 1, minMove: 6 },
  mice: { every: [9, 13], count: [1, 2], max: 4 },   // 暴怒後叫出小老鼠：隔幾秒、一次幾隻、場上最多幾隻
  // 最後一擊：列車進站的速度（減速度倍率，越大衝越快；1＝平常進站的速度）、老鼠王被撞飛幾秒
  //   slowMo＝撞上去那一刻的慢動作：持續幾秒（現實時間）、變成幾倍速；flyDir＝被撞飛往哪邊（1＝右、-1＝左、0＝跟著列車開的方向）；
  //   flyAngle＝往上飛的角度（度，0＝水平、10＝稍微往上）；flyDist＝飛多遠（格）
  ram: { decelMul: 2, fly: 2.2, slowMo: { time: 1, scale: .3 }, flyDir: 1, flyAngle: 10, flyDist: 16 },
  // 死亡表演的節奏：daze＝血量歸零後先暈幾秒才響到站音樂；musicLead＝音樂響了幾秒後列車才從隧道進站；
  //   （現在：暈 2.5 秒＋音樂 17 秒＋列車衝進來約 0.7 秒 ≒ 血量歸零後 20 秒撞上）
  //   brakeLead＝撞上前幾秒響煞車聲（音效「mrtBrake」）；musicGain＝到站音樂的音量；slowMo＝血量歸零那一刻的慢動作
  finale: { daze: 2.5, musicLead: 17, brakeLead: 1.6, musicGain: .8, slowMo: { time: .5, scale: .5 } },
  // 拳頭（老鼠王專用的紫藍版）；fistFront＝只有前面手指的那一層，握住人／核心時蓋在上面（拳頭 → 人／核心 → 手指）
  art: { fist: 'images/monster/rat-king/left-fist.png', fistFront: 'images/monster/rat-king/left-fist-02.png' },
  // 握在拳頭裡的人／核心放在原圖（110×90）的哪一點：held＝人身體的中心（人橫躺、頭朝外露出拳頭），core＝核心的中心
  grip: { held: [33, 31], core: [48, 31], coreSize: 1 },   // coreSize＝核心畫成原本大小的幾倍；核心橫躺握在拳頭裡、兩頭露出來
  artDir: 'images/monster/rat-king/',   // 專用的圖（黑毛深紫藍、領結袖子紫藍）：檔名跟花蓮版權老鼠一樣，只換資料夾；用 tools/recolor-rat-king.py 換色產生
};
// 老鼠王用的整組圖：身體、眨眼、暈眩、手換成 RAT_KING.artDir 的紫藍版，地洞、土堆照用花蓮版權老鼠的（js/burrowing-mouse.js 的 BURROW_MOUSE_ART）
const RK_ART_KEYS = ['body', 'bodyHalf', 'bodyClosed', 'dizzy1', 'dizzy2', 'dizzy3', 'dizzy4', 'hand'];
let rkArtCache = null;
const rkArt = () => rkArtCache || (rkArtCache = Object.fromEntries(Object.entries(BURROW_MOUSE_ART).map(([k, f]) =>
  [k, RK_ART_KEYS.includes(k) && RAT_KING.artDir ? RAT_KING.artDir + f.split('/').pop() : f])));
const rkRand = (a, b) => a + Math.random() * (b - a);
const rkRandInt = ([a, b]) => Math.floor(rkRand(a, b + 1));
const rkSpot = () => typeof MAP !== 'undefined' && MAP ? RAT_KING.maps[MAP.id] || null : null;
const rkAlive = e => !!(e && !e.dead && e.hp > 0 && G.enemies.includes(e));
// 被卡住的那班列車（js/mrt-train.js 的 G.mrtTrains）：車頭圖章在 spot.train 那格的那一班
function rkTrain() {
  const spot = rkSpot(); if (!spot || !G || !G.mrtTrains) return null;
  return G.mrtTrains.find(tr => tr.cars.some(c => c.stamp && c.stamp.c === spot.train[0] && c.stamp.r === spot.train[1])) || null;
}
// 手會冒出來的格子（有地板、不是牆），換地圖才重算
let rkAreaCache = { map: null, cells: [] };
function rkAreaCells() {
  const spot = rkSpot(); if (!spot) return [];
  if (rkAreaCache.map === MAP) return rkAreaCache.cells;
  const [c0, r0, c1, r1] = spot.area, floor = typeof mapFloorCells === 'function' ? mapFloorCells() : null, cells = [];
  for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) if (inGrid(c, r) && !isWall(c, r) && (!floor || floor.has(c + ',' + r))) cells.push([c, r]);
  rkAreaCache = { map: MAP, cells };
  return cells;
}
const rkInArea = (x, y) => { const spot = rkSpot(); if (!spot) return false; const [c, r] = cellAt(x, y), [c0, r0, c1, r1] = spot.area; return c >= c0 && c <= c1 && r >= r0 && r <= r1; };
// 這一點離核心洞太近嗎（一般的手不從核心洞旁邊冒出來）
const rkNearCoreHole = (x, y) => rkHoles().some(o => Math.hypot(o.cx - x, o.cy - y) < RAT_KING.hands.coreHoleGap * CELL);
// 範圍裡隨機一個點（不在核心洞旁邊）；avoid＝要離這些點至少 minCells 格
function rkRandomSpot(avoid = [], minCells = 0) {
  const cells = rkAreaCells(); if (!cells.length) return null;
  for (let k = 0; k < 60; k++) {
    const [c, r] = cells[Math.floor(Math.random() * cells.length)], [x, y] = center(c, r);
    if (rkNearCoreHole(x, y)) continue;
    if (avoid.every(p => Math.hypot(p.x - x, p.y - y) >= minCells * CELL)) return { x, y };
  }
  const [c, r] = cells[Math.floor(Math.random() * cells.length)], [x, y] = center(c, r);
  return { x, y };
}
// ---- 核心洞（地圖上鋪的 RAT_KING.holeTile）----
// 每個洞：{ x, y＝手的落腳點（洞口剛好在洞的正中間）, cx, cy＝洞的正中間 }；換地圖才重算
let rkHoleCache = { map: null, holes: [] };
const rkHandH = () => 90 * RAT_KING.hands.scale;
// 手的落腳點要比洞口低一點：手的洞口在原圖第 77 列（js/burrowing-mouse.js 的 drawBurrowMasked）
const rkFootY = cy => cy - 13 + rkHandH() * 13 / 90;
function rkHoles() {
  if (rkHoleCache.map === MAP) return rkHoleCache.holes;
  const holes = [];
  const tile = typeof mapTileById === 'function' ? mapTileById(RAT_KING.holeTile) : null;
  if (MAP && tile) for (const s of MAP.stamps || []) {
    if (s.id !== RAT_KING.holeTile) continue;
    const w = mapStampW(s, tile) * CELL, h = mapStampH(s, tile) * CELL;
    const k = typeof stampScaleOf === 'function' ? stampScaleOf(s) || 1 : 1;   // 物件大小%：以底部中央為基準縮放
    const cx = OX + s.c * CELL + (s.ox || 0) + w / 2, bottom = OY + s.r * CELL + (s.oy || 0) + h, cy = bottom - h * k / 2;
    holes.push({ cx, cy, x: cx, y: rkFootY(cy) });
  }
  rkHoleCache = { map: MAP, holes };
  return holes;
}
// 這個洞現在有手嗎（一個洞一次只冒一隻手）
const rkHoleBusy = (K, hole) => K.hands.some(h => h.hole === hole);
// 隨便挑一個空的核心洞（離 avoid 這些點至少 minCells 格；找不到就放寬）
function rkRandomHole(K, avoid = [], minCells = 0) {
  const free = rkHoles().filter(o => !rkHoleBusy(K, o) && !(G.cores || []).some(c => !c.dead && !c.hidden && c.rkHole === o));
  let list = free.filter(o => avoid.every(p => Math.hypot(p.x - o.cx, p.y - o.cy) >= minCells * CELL));
  if (!list.length) list = free;
  return list.length ? list[Math.floor(Math.random() * list.length)] : null;
}
const rkSound = (name, x, y, gain = .9) => { if (typeof sfxAt === 'function') sfxAt(name, x, y, gain, 'rat-king-' + name); };

// ---- 開場（game.js 在 newGame 裡呼叫）----
// G.ratKing：{ phase: 'sleep'｜'rumble'｜'rise'｜'fight'｜'finale'｜'ram'｜'dead', t, e, hands, under, digs, waveT, coreT, miceT, grabCd }
function seedRatKing() {
  G.ratKing = null;
  if (MAP_SAFE || (typeof practiceOn === 'function' && practiceOn()) || !rkSpot()) return;
  G.ratKing = { phase: 'sleep', t: 0, e: null, hands: [], under: [], digs: [], pops: [], waveT: 0, coreT: 0, miceT: 0, grabCd: 0, cores: 0, flash: 0 };
  [...Object.values(rkArt()), RAT_KING.art.fist, RAT_KING.art.fistFront, RAT_KING.dig.art].forEach(f => typeof monsterImage === 'function' && monsterImage(f));   // 先載好圖
  rkWrapCoreDraw();
}
// 核心被打到時的震動：在畫核心的程式外面包一層（js/anomalous-core.js 的 drawCore），震動中就左右抖
function rkWrapCoreDraw() {
  if (typeof drawCore !== 'function' || drawCore.rkWrapped) return;
  const base = drawCore;
  drawCore = function (core) {
    if (!(core.rkShakeT > 0)) return base(core);
    const k = Math.min(1, core.rkShakeT / RAT_KING.core.react.shake);
    ctx.save(); ctx.translate((Math.random() * 2 - 1) * 5 * (.4 + .6 * k), (Math.random() * 2 - 1) * 1.5);
    try { base(core); } finally { ctx.restore(); }
  };
  drawCore.rkWrapped = true;
}
// 列車被老鼠王卡住了嗎（js/mrt-train.js 問）：老鼠王還沒被撞飛之前，那班車都不進站
function ratKingBlocksTrain(tr) {
  const K = G && G.ratKing;
  return !!(K && K.phase !== 'dead' && K.phase !== 'ram' && tr === rkTrain());
}
// 核心全破的結算要不要先等（js/core-clear.js 問）：老鼠王還沒被撞飛就等
function ratKingHoldsClear() {
  const K = G && G.ratKing;
  return !!(K && K.e && K.phase !== 'dead');
}
// 月台邊緣（老鼠王的下半身被擋住的那條線）＝列車的下緣
function rkEdgeY() { const tr = rkTrain(); return tr ? tr.bottom : OY + 8 * CELL; }
function rkHomeX() { const tr = rkTrain(); if (!tr) return OX + 35 * CELL; return Math.max(tr.clipL + 6 * CELL, Math.min(tr.clipR - 6 * CELL, (tr.clipL + tr.clipR) / 2)); }

// ---- 每幀（game.js 的 update 呼叫）----
function updateRatKing(dt) {
  const K = G && G.ratKing; if (!K || dt <= 0) return;
  updateRkFx(K, dt);
  updateRkThrows(dt);
  rkMuteHitFx();
  if (K.phase === 'finale') { updateRkFinale(K, dt); return; }
  if (K.phase === 'ram') { updateRkRam(K, dt); return; }
  if (!G.running || G.over || K.phase === 'dead') return;
  updateRkCores(K, dt);
  if (K.phase === 'sleep') {
    if ((G.cores || []).some(c => c.awake && !c.dead)) { K.phase = 'rumble'; K.t = RAT_KING.emerge.delay + RAT_KING.emerge.rumble; K.noticed = false; }
    return;
  }
  if (K.phase === 'rumble') {   // 鐵軌底下震動、冒土
    K.t -= dt;
    const x = rkHomeX(), y = rkEdgeY(), Em = RAT_KING.emerge;
    if (K.t <= Em.rumble) {
      if (!K.noticed) { K.noticed = true; systemNotice('⚠ 鐵軌底下傳來啃咬聲……', true); rkSound('mouseDig', x, y, 1.1); }
      // 越接近冒出來震得越大
      if (typeof addShake === 'function') addShake(3 + 4 * (1 - K.t / Em.rumble));
      if (Math.random() < dt * 9) rkDirt(x + rkRand(-3, 3) * CELL, y, .8);
    } else if (typeof addShake === 'function') addShake(1.5);   // 核心剛醒：地面先微微震動
    if (K.t <= 0) rkEmerge(K);
    return;
  }
  const e = K.e;
  if (!e || e.dead) return;
  // 冒出來亮相（不會受傷）
  if (K.phase === 'rise') {
    K.t -= dt; e.hp = Math.max(e.hp, e.rkIntroHp); e.rkHp = e.hp;
    e.rkRise = Math.min(1, 1 - Math.max(0, K.t - RAT_KING.emerge.hold) / RAT_KING.emerge.rise);
    if (Math.random() < dt * 14 && e.rkRise < 1) rkDirt(e.x + rkRand(-2.4, 2.4) * CELL, rkEdgeY(), 1.2);
    if (typeof addShake === 'function') addShake(e.rkRise < 1 ? 7 : 3);   // 鑽出來的整段都在震；亮相時小一點
    if (K.t <= 0) { K.phase = 'fight'; e.eliteAwake = true; e.rkRise = 1; K.waveT = 1.5; K.coreT = rkRand(...RAT_KING.core.first); }
    return;
  }
  // ---- 戰鬥 ----
  const alive = rkCoresAlive();
  if (alive === 0 && K.cores > 0 && !e.rkStunned) rkStun(K, e);   // 最後一顆核心剛破掉：暈倒
  K.cores = alive;
  if (!e.rkEnraged && e.hp <= e.maxhp * RAT_KING.enrageAt) rkEnrage(e);
  updateRkHands(K, dt);
  updateRkUnder(K, dt);
  updateRkPops(K, dt);
  updateRkCoreReact(K, dt);   // 核心被打到：震完就叫手來搬（暈倒時也照搬）
  if (e.rkStunT > 0) { e.rkStunT -= dt; return; }   // 暈著：不出手
  K.grabCd = Math.max(0, K.grabCd - dt);
  if ((K.waveT -= dt) <= 0) {
    const H = RAT_KING.hands;
    K.waveT = rkRand(...(e.rkEnraged ? H.frenzyEvery : H.every));
    rkHandWave(K, e, rkRandInt(e.rkEnraged ? H.frenzyCount : H.count));
  }
  if ((K.coreT -= dt) <= 0) { K.coreT = rkRand(...RAT_KING.core.every); rkGrabCore(K, e); }
  if (e.rkEnraged && (K.miceT -= dt) <= 0) { K.miceT = rkRand(...RAT_KING.mice.every); rkSummonMice(K, e); }
}
// 場上還沒打破的核心有幾顆（躲在地底的也算）
const rkCoresAlive = () => (G.cores || []).filter(c => !c.dead).length;
// 老鼠王現在受到的傷害倍率：核心越多越硬，暈倒時加倍
function ratKingDamageMul(e) {
  if (e.rkStunT > 0) return RAT_KING.stun.dmgMul;
  const A = RAT_KING.armor;
  return 1 - Math.min(A.max, A.perCore * rkCoresAlive());
}

// ---- 核心：一開始放進核心洞、被打到要搬走 ----
function updateRkCores(K, dt) {
  if (!K.placed) rkPlaceCores(K);
  for (const c of G.cores || []) if (c.rkShakeT > 0) c.rkShakeT -= dt;
}
// 開場：每顆核心隨機放進一個核心洞（洞不夠就留在原地）
function rkPlaceCores(K) {
  K.placed = true;
  const holes = rkHoles().slice().sort(() => Math.random() - .5);
  for (const c of G.cores || []) {
    c.rkExpHp = c.hp; c.rkPrevHp = c.hp;
    if (c.dead) continue;
    const hole = holes.shift(); if (!hole) continue;
    c.x = hole.cx; c.y = hole.cy; c.floor = 1; c.rkHole = hole;
  }
}
// 這一幀打在核心上的傷害（game.js 判斷核心破掉之前呼叫，跟其他 BOSS 的核心護盾一樣）：
//   每次露出來最多被打掉 exposeCap 成；剛被打到 → 開始震動，等一下叫手來搬
function ratKingShieldCore() {
  const K = G && G.ratKing; if (!K || K.phase === 'dead' || K.phase === 'sleep' && !K.placed) return;
  const C = RAT_KING.core;
  for (const c of G.cores || []) {
    if (c.dead) continue;
    if (c.rkExpHp == null) c.rkExpHp = c.hp;
    if (c.rkPrevHp == null) c.rkPrevHp = c.hp;
    const floor = c.rkExpHp - C.exposeCap * c.maxhp;
    if (floor > 0 && c.hp < floor) {   // 這一輪打到上限了：打不動，閃一下紫光
      c.hp = floor;
      if (!(c.rkBlockFx > 0)) { c.rkBlockFx = .3; G.effects.push({ ring: true, x: c.x, y: c.y - 30, r: 18, r2: 46, life: .3, life0: .3, color: '#c79bff' }); }
    }
    if (c.rkBlockFx > 0) c.rkBlockFx -= 1 / 60;
    if (c.hp < c.rkPrevHp && c.awake && !c.hidden && !c.rkReact && !rkCoreBusy(K, c)) {   // 剛被打到：開始震動
      c.rkReact = { t: C.react.shake }; c.rkShakeT = C.react.shake;
      rkSound('mouseDig', c.x, c.y, .9);
    }
    c.rkPrevHp = c.hp;
  }
}
// 這顆核心已經有手在搬、或在地底了嗎
const rkCoreBusy = (K, c) => K.hands.some(h => h.core === c) || K.under.some(u => u.core === c);
// 被打到的核心：震完就從核心洞冒出手把它抓住（老鼠王還沒進入戰鬥就先等著）
function updateRkCoreReact(K, dt) {
  for (const c of G.cores || []) {
    if (!c.rkReact) continue;
    if (c.dead || c.hidden) { c.rkReact = null; continue; }
    if ((c.rkReact.t -= dt) > 0) continue;
    if (rkCoreBusy(K, c)) { c.rkReact = null; continue; }
    const hole = c.rkHole && rkHoles().includes(c.rkHole) ? c.rkHole : null;
    if (hole && rkHoleBusy(K, hole)) continue;   // 洞裡剛好有別的手：等它縮回去
    c.rkReact = null;
    const extra = { core: c, windup: RAT_KING.core.react.windup };
    if (hole) rkNewHand(K, 'core', hole.x, hole.y, { ...extra, hole });
    else rkNewHand(K, 'core', c.x, rkFootY(c.y), { ...extra, cx: c.x, cy: c.y, dig: true });
  }
}

// ---- 冒出來：生出老鼠王本體 ----
function rkEmerge(K) {
  const B = RAT_KING, base = (typeof ACTIVE_MONSTERS !== 'undefined' && ACTIVE_MONSTERS.find(m => m.id === 'burrowing_mouse')) || burrowingMouseDefinition();
  const edge = rkEdgeY(), x = rkHomeX();
  const e = createMonster(base, x, edge + 6);   // 腳底放在月台第一排（打得到、看得到），畫的時候照月台邊緣切
  e.behavior = 'ratKing'; e.ratKing = true; e.eliteName = B.name; e.eliteAwake = false; e.floor = 1;
  e.hp = e.maxhp = Math.round(B.hp * (typeof difficultyOf === 'function' ? difficultyOf('enemyHp') || 1 : 1));
  e.crystals = Math.round((base.crystals ?? 5) * B.crystalMul); e.reward = Math.round((base.reward || 0) * B.rewardMul);
  for (const k of ['playerDamage', 'sentryDamage', 'buildingDamage']) e[k] = Math.round((base[k] || 14) * B.atk);
  e.drawWidth = Math.round(110 * B.scale); e.drawHeight = Math.round(B.showRow * B.scale) + 19;   // 被打的範圍＝看得到的上半身（往下多 19 像素到腳底）
  e.knockMul = 0; e.staggerTime = 0; e.unpushable = true; e.noHitSquash = true; e.wide = true; e.noStun = true;
  e.rkHomeX = x; e.rkAge = 0; e.rkRise = 0; e.rkIntroHp = e.hp; e.rkHp = e.hp;
  G.enemies.push(e);
  K.e = e; K.phase = 'rise'; K.t = B.emerge.rise + B.emerge.hold; K.cores = rkCoresAlive();
  rkSound('mouseOut', x, edge, 1.2); rkSound('bigBoom', x, edge, .7);
  if (typeof addShake === 'function') addShake(14);
  if (typeof addHitstop === 'function') addHitstop(.06);
  for (let k = 0; k < 5; k++) rkDirt(x + (k / 4 - .5) * 6 * CELL, edge, 1.6);
  if (typeof coreBanner === 'function') coreBanner(B.name + '現身', '', '#f0a3c8');   // 不說怎麼打（核心是護甲這件事讓玩家自己發現）
}
function rkStun(K, e) {
  e.rkStunned = true; e.rkStunT = RAT_KING.stun.time; e.stunT = 0;
  K.hands = K.hands.filter(h => h.kind !== 'punch' || h.age >= h.windup);   // 還在預警的拳頭取消
  if (typeof coreBanner === 'function') coreBanner(RAT_KING.name + '暈倒了', '', '#ffe36e');   // 不說傷害加倍（讓玩家自己發現）
  rkSound('mouseHurt', e.x, e.y, 1.2);
}
function rkEnrage(e) {
  e.rkEnraged = true;

  if (typeof coreBanner === 'function') coreBanner(RAT_KING.name + '暴怒', '', '#ff6a5a');
  if (typeof addShake === 'function') addShake(8);
  rkSound('mouseAttack', e.x, e.y, 1.2);
  G.ratKing.miceT = 1.5;
}

// ---- 老鼠王本體每幀（enemy-ai.js 的 stepEnemy 呼叫）：傷害照護甲打折、在鐵軌上左右晃 ----
function stepRatKing(e, dt) {
  ratKingApplyArmor(e);
  e.rkAge = (e.rkAge || 0) + dt;
  e.moving = false; e.target = null; e.knockT = 0; e.stunT = 0; e.sleepT = 0; e.confuseT = 0;
  const S = RAT_KING.sway;
  if (!(e.rkStunT > 0) && G.ratKing && G.ratKing.phase === 'fight') e.x = e.rkHomeX + Math.sin(e.rkAge * S.speed) * S.cells * CELL;
}
// 這一幀受到的傷害照倍率重算（不管是子彈、近戰、爆炸，都是直接扣 hp，這裡事後補回來）
function ratKingApplyArmor(e) {
  if (e.rkHp == null) { e.rkHp = e.hp; return; }
  if (e.hp < e.rkHp) {
    const dmg = e.rkHp - e.hp, mul = ratKingDamageMul(e);
    e.hp = e.rkHp - dmg * mul;
    if (mul < 1) e.rkArmorFlash = .18;   // 被護甲擋掉：身上閃一下紫光
  }
  e.rkHp = e.hp;
}
// 血量歸零的時候（game.js 判斷怪物死亡前問）：回傳 true＝先不要死
//   老鼠王：先照護甲補回來，還有血就繼續打；真的沒血 → 死亡表演、等列車撞飛
//   抓人的手：被打掉 → 放人，手不算擊殺（不掉碎片、不記圖鑑）
function ratKingHoldDeath(e) {
  if (e.ratKingHand) { rkHandBroken(e); return true; }
  if (!e.ratKing) return false;
  if (e.rkRammed) return false;   // 列車撞飛了：照一般怪物死掉（掉碎片、記圖鑑、特別獎金）
  ratKingApplyArmor(e);
  if (e.hp > 0) return true;
  rkStartFinale(e);
  return true;
}

// ---- 手 ----
// h：{ kind: 'punch'｜'grab'｜'core'｜'pop'｜'spit', x, y＝落腳點, cx, cy＝洞口（打／抓的中心）, age, windup, rise, hold, sink, side, hole?, dig? }
function rkHandTimes(kind, fast = 1) {
  const P = RAT_KING.punch, Gb = RAT_KING.grab, C = RAT_KING.core, up = 1 / (RAT_KING.hands.riseSpeed || 1);   // up：往上舉要多花幾倍時間
  if (kind === 'punch') return { windup: P.windup * fast, rise: P.rise * up, hold: P.hold, sink: P.sink * up };
  if (kind === 'grab') return { windup: Gb.windup * fast, rise: Gb.rise * up, hold: Gb.hold, sink: .45 * up };
  if (kind === 'core') return { windup: C.windup, rise: C.rise * up, hold: C.hold, sink: C.sink * up };
  if (kind === 'pop') return { windup: C.windup * .8, rise: C.rise * up, hold: C.popHold, sink: .3 * up };
  return { windup: .7, rise: .2 * up, hold: .35, sink: .3 * up };
}
function rkNewHand(K, kind, x, y, extra = {}) {
  const e = K.e, fast = e && e.rkEnraged ? RAT_KING.hands.frenzySpeed : 1;
  const h = Object.assign({ kind, x, y, age: 0, side: e && x > e.x ? 'right' : 'left', ...rkHandTimes(kind, fast) }, extra);
  if (h.hole) { h.cx = h.hole.cx; h.cy = h.hole.cy; }
  if (h.cx == null) { h.cx = x; h.cy = y; }
  if (h.dig) rkAddDig(K, h.cx, h.cy, h.windup + h.rise + h.hold + h.sink);   // 冒出來的地方裂開一個洞
  K.hands.push(h);
  return h;
}
// 手抓／打的中心點＝洞口
const rkHandSpot = h => ({ x: h.cx ?? h.x, y: h.cy ?? h.y });
// 一般的手在 (x, y) 冒出來：落腳點往下挪，讓洞口剛好在 (x, y)
const rkDigHand = (K, kind, x, y, extra = {}) => rkNewHand(K, kind, x, rkFootY(y), { cx: x, cy: y, dig: true, ...extra });
// 地上裂開的洞（hole02 圖）：一般的手冒出來時出現，手縮回去後再留一下才淡掉
function rkAddDig(K, x, y, life) {
  (K.digs || (K.digs = [])).push({ x, y, age: 0, life: life + RAT_KING.dig.linger });
}
// 找一個一般的手可以冒出來的點：目標腳下（離核心洞太近就往旁邊挪），第二隻以後落在目標附近封走位
function rkHandSpotNear(K, a, lead) {
  for (let k = 0; k < 12; k++) {
    const d = lead + (k ? rkRand(.8, 2.2) * CELL : 0), ang = Math.random() * Math.PI * 2;
    const x = a.x + Math.cos(ang) * d, y = a.y + Math.sin(ang) * d * .7;
    const [c, r] = cellAt(x, y);
    if (!inGrid(c, r) || isWall(c, r) || rkNearCoreHole(x, y)) continue;
    if (K.hands.some(h => Math.hypot(h.cx - x, h.cy - y) < CELL * 1.6)) continue;
    return { x, y };
  }
  return null;
}
// 一波手：每隻挑一個目標（溫特、隊員；要在範圍裡），有機會變成抓人；一律在核心洞以外的地方冒出來
function rkHandWave(K, e, n) {
  const pool = [G.player, ...(G.towers || [])].filter(a => a && a.hp > 0 && !a.eatenBy && !a.rkHeld && !a.vineCap && !a.mrtRide && rkInArea(a.x, a.y) && sameFloor(e, a));
  if (!pool.length) return;
  for (let i = 0; i < n; i++) {
    const a = pool[Math.floor(Math.random() * pool.length)];
    const s = rkHandSpotNear(K, a, i === 0 ? 0 : rkRand(.6, 1.6) * CELL); if (!s) continue;
    const grab = i === 0 && K.grabCd <= 0 && Math.random() < RAT_KING.hands.grabChance && !K.hands.some(h => h.kind === 'grab');
    if (grab) { rkDigHand(K, 'grab', s.x, s.y, { target: a }); K.grabCd = RAT_KING.grab.cooldown; }
    else rkDigHand(K, 'punch', s.x, s.y);
    rkSound('mouseDig', s.x, s.y, .5);
  }
}
// 每隔一陣子自己搬核心：挑一顆沒被搬走、沒破的核心，手從它的核心洞冒出來
function rkGrabCore(K, e) {
  const list = (G.cores || []).filter(c => !c.dead && !c.hidden && !c.carried && !c.rkReact && !rkCoreBusy(K, c));
  if (!list.length) return;
  const core = list[Math.floor(Math.random() * list.length)];
  const hole = core.rkHole && rkHoles().includes(core.rkHole) ? core.rkHole : null;
  if (hole && rkHoleBusy(K, hole)) return;   // 那個洞正好有別的手：下次再搬
  if (hole) rkNewHand(K, 'core', hole.x, hole.y, { core, hole });
  else rkNewHand(K, 'core', core.x, rkFootY(core.y), { core, cx: core.x, cy: core.y, dig: true });
}
function updateRkHands(K, dt) {
  const e = K.e;
  for (const h of K.hands) {
    const before = h.age; h.age += dt;
    const up = h.windup + h.rise;
    if (before < h.windup && h.age >= h.windup) {   // 鑽出地面：噴土
      rkSound('mouseAttack', h.cx, h.cy, .8);
      if (typeof rockBurstFx === 'function') rockBurstFx(h.cx, h.cy, 'mouseHand');
    }
    if (before < up && h.age >= up) rkHandUp(K, e, h);
    if (h.kind === 'grab' && h.held) rkHoldStep(h);
    if (h.kind === 'core' && h.age >= h.windup && !h.taken && h.core && !h.core.dead) { h.taken = true; h.core.hidden = true; h.core.rkShakeT = 0; }   // 手一冒出來就握住核心（打不到了）
    if (h.kind === 'core' && h.core && h.core.dead) h.core = null;   // 握住之前就被打破了
    if (before < up + h.hold && h.age >= up + h.hold) rkHandSink(K, h);
  }
  K.hands = K.hands.filter(h => h.age < h.windup + h.rise + h.hold + h.sink);
}
// 手完全冒出來的那一刻
function rkHandUp(K, e, h) {
  const P = RAT_KING.punch;
  if (h.kind === 'punch') {   // 揍飛：一隻手只打一個（範圍裡離洞口最近的那個，怪物自己人也算），打中的人飛出去、彈兩下、躺著暈
    const o = rkHandSpot(h), near = a => Math.hypot(a.x - o.x, a.y - o.y) <= P.radius * CELL;
    const people = [G.player, ...G.towers].filter(a => a && a.hp > 0 && !a.rkHeld && !a.eatenBy && !a.vineCap && near(a));
    const monsters = G.enemies.filter(m => !m.dead && m.hp > 0 && !m.ratKing && !m.ratKingHand && (!e || sameFloor(e, m)) && near(m));
    const a = [...people, ...monsters].sort((p, q) => Math.hypot(p.x - o.x, p.y - o.y) - Math.hypot(q.x - o.x, q.y - o.y))[0];
    if (a === G.player) { const hp0 = a.hp; e.playerTouchCd = 0; enemyAttackPlayer(e, 0); if (a.hp < hp0 && a.hp > 0) rkLaunch(a, o, P.launch); }
    else if (a && G.towers.includes(a)) { const hp0 = a.hp; e.atkCd = 0; enemyAttackSentry(e, a, 0); if (a.hp < hp0 && a.hp > 0) rkLaunch(a, o, P.launch); }
    else if (a) {   // 打到怪物：扣血、重重往外彈開（打死了照一般怪物死掉，會掉碎片）
      a.hp -= P.monsterDamage; a.hitT = Math.max(a.hitT || 0, .2); a.hitColor = '#f0a3c8';
      if (typeof flashDmg === 'function') flashDmg('-' + P.monsterDamage, a.x, a.y - 26, '#f0a3c8');
      if (typeof enemyHitReact === 'function') enemyHitReact(a, o.x, o.y, true);
    }
    if (typeof addShake === 'function') addShake(4);
  } else if (h.kind === 'grab') {
    const a = h.target, o = rkHandSpot(h);
    if (a && a.hp > 0 && !a.rkHeld && !a.eatenBy && !a.vineCap && !a.mrtRide && Math.hypot(a.x - o.x, a.y - o.y) <= RAT_KING.grab.radius * CELL) rkGrab(K, h, a);
  } else if (h.kind === 'pop' && h.core) {
    rkSound('mouseOut', h.cx, h.cy, .9);
  } else if (h.kind === 'spit') rkSpit(K, h);
}
// 抓到人：握在拳頭裡（不能動），手變成打得到的東西（打掉就放人）
function rkGrab(K, h, a) {
  const Gb = RAT_KING.grab;
  if (a === G.player && typeof cancelChannel === 'function' && typeof playerChannel !== 'undefined' && playerChannel) cancelChannel();
  if (a === G.player && a.sitting && typeof standUp === 'function') standUp();
  h.held = a; a.rkHeld = h;
  const o = rkHandSpot(h); a.x = o.x; a.y = o.y; a.moving = false; a.navPath = null; a.navGoal = null; a.target = null; a.knockT = 0; a.meleeSwing = null; a.gunSwing = null; a.dashT = 0;
  const base = K.e;
  const hand = createMonster((typeof ACTIVE_MONSTERS !== 'undefined' && ACTIVE_MONSTERS.find(m => m.id === 'burrowing_mouse')) || burrowingMouseDefinition(), h.x, h.y);
  Object.assign(hand, { behavior: 'ratKingHand', ratKingHand: true, rkHand: h, eliteName: RAT_KING.name + '的手', floor: base.floor || 1,
    hp: Gb.handHp, maxhp: Gb.handHp, crystals: 0, reward: 0, drawWidth: Math.round(48 * RAT_KING.hands.scale), drawHeight: Math.round(68 * RAT_KING.hands.scale),   // 被打的範圍＝看得到的拳頭和手臂
    knockMul: 0, staggerTime: 0, unpushable: true, noHitSquash: true, noStun: true, playerDamage: 0, sentryDamage: 0, buildingDamage: 0 });
  G.enemies.push(hand);
  h.enemy = hand;
  if (G.towers.includes(a)) {
    if (typeof sentryStatus === 'function') sentryStatus(a, '被抓住了！快打那隻手！', '#ffb36b', true);
  } else systemNotice('⚠ 溫特被老鼠王抓住了！快打那隻手！', true);
  rkSound('mouseAttack', h.cx, h.cy, 1);
  if (typeof addShake === 'function') addShake(4);
}
// 握著的時候：人跟著手，不能動；快丟出去之前用力晃
function rkHoldStep(h) {
  const a = h.held; if (!a) return;
  const o = rkHandSpot(h); a.x = o.x; a.y = o.y; a.moving = false; a.navPath = null; a.target = null;
  const left = h.windup + h.rise + h.hold - h.age;
  if (left < .5 && !h.warned) { h.warned = true; if (typeof flash === 'function') flash('要被丟出去了！', o.x, o.y - 150, '#ffd27a', .7); }
}
// 抓人的手被打掉（game.js 判斷死亡時呼叫）：放人、手縮回去
function rkHandBroken(handEnemy) {
  const h = handEnemy.rkHand;
  handEnemy.dead = true;
  G.enemies = G.enemies.filter(o => o !== handEnemy);
  if (!h) return;
  h.enemy = null;
  const a = h.held;
  if (a) {
    rkRelease(a);
    if (G.towers.includes(a) && typeof sentryStatus === 'function') sentryStatus(a, '獲救了！', '#9ff0c0', true);
    else if (a === G.player) systemNotice('溫特掙脫了老鼠王的手！', false);
  }
  h.held = null;
  // 手立刻縮回去
  const up = h.windup + h.rise;
  h.age = Math.max(h.age, up + h.hold);
  rkSound('mouseHurt', h.cx, h.cy, 1);
  for (let i = 0; i < 8; i++) G.effects.push({ particle: true, kind: 'spark', x: h.cx, y: h.cy - 60, vx: (Math.random() - .5) * 90, vy: -(30 + Math.random() * 60), r: 2 + Math.random() * 1.5, life: .45, life0: .45, color: i % 2 ? '#ffffff' : '#9fd6ff' });
}
function rkRelease(a) {
  a.rkHeld = null; a.rkUnder = false; a.hitT = .3; a.navPath = null; a.navGoal = null;
}
// 手縮回地底的那一刻
function rkHandSink(K, h) {
  if (h.enemy) { h.enemy.dead = true; G.enemies = G.enemies.filter(o => o !== h.enemy); h.enemy = null; }
  if (h.kind === 'grab' && h.held) {   // 沒人救：溫特丟出去；隊員有機會拖進地底，不然也丟出去
    const a = h.held, isMate = G.towers.includes(a);
    if (isMate && Math.random() < RAT_KING.grab.dragChance) {
      a.rkUnder = true; h.carry = a;   // carry：縮回去的這段還畫在拳頭裡
      K.under.push({ who: a, t: RAT_KING.grab.under, from: { x: h.cx, y: h.cy } });
      if (typeof sentryStatus === 'function') sentryStatus(a, '被拖進地底了！', '#ff8f8f', true);
      rkSound('mouseDig', h.cx, h.cy, 1);
    } else rkThrowHeld(K, h, a);
    h.held = null;
  }
  if (h.kind === 'core' && h.core && !h.core.dead) {   // 核心拖進地洞
    K.under.push({ core: h.core, t: rkRand(...RAT_KING.core.under), from: { x: h.core.x, y: h.core.y } });
    rkSound('mouseDig', h.cx, h.cy, 1);
  }
  if (h.kind === 'pop' && h.core) {   // 放下核心：這一輪重新算「最多被打掉幾成」
    const c = h.core;
    c.x = h.cx; c.y = h.cy; c.floor = 1; c.hidden = false; c.rkHole = h.hole || null;
    c.rkExpHp = c.hp; c.rkPrevHp = c.hp;
    G.effects.push({ ring: true, x: c.x, y: c.y + 8, r: 6, r2: 60, life: .4, life0: .4, color: '#c79bff' });
    h.core = null;
  }
}
// 握在手裡的人被丟出去：先扣血，再從拳頭的高度往外（遠離老鼠王的方向）丟
function rkThrowHeld(K, h, a) {
  const T = RAT_KING.grab.throw, e = K.e;
  rkRelease(a);
  if (e) {
    if (a === G.player) { const pd = e.playerDamage; e.playerDamage = Math.round(pd * T.damageMul); e.playerTouchCd = 0; enemyAttackPlayer(e, 0); e.playerDamage = pd; }
    else { const sd = e.sentryDamage; e.sentryDamage = Math.round(sd * T.damageMul); e.atkCd = 0; enemyAttackSentry(e, a, 0); e.sentryDamage = sd; }
  }
  if (a.hp <= 0) return;
  rkLaunch(a, { x: e ? e.x : a.x, y: rkEdgeY() }, { dist: T.dist, up: T.up, wallDamage: T.wallDamage, spread: .7 }, T.height);
  if (typeof flash === 'function') flash('被丟出去了！', a.x, a.y - 60, '#ffd27a', .8);
  rkSound('mouseAttack', h.cx, h.cy, 1);
  if (typeof addShake === 'function') addShake(5);
}
// 在地底的東西（被拖下去的人、核心）：時間到就從別的地方冒出來
function updateRkUnder(K, dt) {
  for (const u of K.under) u.t -= dt;
  const due = K.under.filter(u => u.t <= 0);
  K.under = K.under.filter(u => u.t > 0);
  for (const u of due) {
    if (u.core) {   // 核心：從另一個核心洞冒出來
      if (u.core.dead) continue;
      const others = (G.cores || []).filter(c => !c.dead && !c.hidden);
      const avoid = [u.from, ...(G.player ? [G.player] : []), ...others];
      if (rkHoles().length) {
        const hole = rkRandomHole(K, avoid, RAT_KING.core.minMove);
        if (!hole) { u.t = .3; K.under.push(u); continue; }   // 洞都有手：等一下再冒
        rkNewHand(K, 'pop', hole.x, hole.y, { core: u.core, hole });
        continue;
      }
      const s = rkRandomSpot(avoid, RAT_KING.core.minMove) || u.from;
      rkDigHand(K, 'pop', s.x, s.y, { core: u.core });
    } else if (u.who) {   // 被拖下去的隊員：別的地方（核心洞以外）的地面先裂開冒土，等一下從洞口被往上拋出來
      const a = u.who;
      if (a.hp <= 0 || (!G.towers.includes(a) && a !== G.player)) { rkRelease(a); continue; }
      const s = rkRandomSpot([u.from], 5) || u.from, P = RAT_KING.grab.pop;
      a.x = s.x; a.y = s.y;
      (K.pops || (K.pops = [])).push({ who: a, x: s.x, y: s.y, t: P.warn, puff: 0 });
      rkAddDig(K, s.x, s.y, P.warn + .6);
      rkSound('mouseDig', s.x, s.y, 1);
    }
  }
}
// 從洞口被拋出來的隊員：裂開的地方一直冒土，時間到就往上拋飛（扣血）→ 落地彈兩下 → 躺著暈
function updateRkPops(K, dt) {
  if (!K.pops || !K.pops.length) return;
  const P = RAT_KING.grab.pop, Gb = RAT_KING.grab, e = K.e;
  for (const p of K.pops) {
    p.t -= dt; p.puff -= dt;
    if (p.t > 0) { if (p.puff <= 0) { p.puff = .12; rkDirt(p.x + rkRand(-14, 14), p.y + 4, .5); } continue; }
    const a = p.who;
    rkRelease(a); a.x = p.x; a.y = p.y;
    if (e && a.hp > 0) {
      if (a === G.player) { const pd = e.playerDamage; e.playerDamage = Math.round(pd * Gb.spitDamageMul); e.playerTouchCd = 0; enemyAttackPlayer(e, 0); e.playerDamage = pd; }
      else { const sd = e.sentryDamage; e.sentryDamage = Math.round(sd * Gb.spitDamageMul); e.atkCd = 0; enemyAttackSentry(e, a, 0); e.sentryDamage = sd; }
    }
    if (a.hp > 0) rkLaunch(a, { x: p.x + rkRand(-1, 1), y: p.y + rkRand(-1, 1) }, { dist: P.dist, up: P.up, spread: Math.PI });
    if (typeof rockBurstFx === 'function') rockBurstFx(p.x, p.y, 'mouseHand');
    for (let k = 0; k < 2; k++) rkDirt(p.x + rkRand(-10, 10), p.y + 4, 1.4);
    G.effects.push({ ring: true, x: p.x, y: p.y, r: 6, r2: 50, life: .35, life0: .35, color: '#d8c6a0' });
    rkSound('mouseOut', p.x, p.y, 1);
    if (typeof addShake === 'function') addShake(4);
    if (G.towers.includes(a) && typeof sentryStatus === 'function') sentryStatus(a, '被拋出來了！', '#ffb36b', true);
  }
  K.pops = K.pops.filter(p => p.t > 0);
}
// 吐出來（沒有地方可以拋飛時的舊做法，留著給 spit 手用）：扣血、揍飛一小段、暈一下
function rkSpit(K, h) {
  const a = h.who, e = K.e; if (!a) return;
  rkRelease(a);
  const o = rkHandSpot(h); a.x = o.x; a.y = o.y;
  const Gb = RAT_KING.grab;
  if (a === G.player) {
    const pd = e.playerDamage; e.playerDamage = Math.round(pd * Gb.spitDamageMul); e.playerTouchCd = 0;
    enemyAttackPlayer(e, 0); e.playerDamage = pd;
  } else if (G.towers.includes(a)) {
    const sd = e.sentryDamage; e.sentryDamage = Math.round(sd * Gb.spitDamageMul); e.atkCd = 0;
    enemyAttackSentry(e, a, 0); e.sentryDamage = sd;
  }
  if (a.hp > 0 && !rkLaunch(a, { x: o.x + rkRand(-1, 1), y: o.y + 6 }, { dist: [1.5, 2.5], up: 200 }, 60)) {
    a.slipDizzyT = Math.max(a.slipDizzyT || 0, Gb.daze); a.dazeT = Math.max(a.dazeT || 0, Gb.daze);
  }
  rkSound('mouseOut', h.cx, h.cy, 1);
  if (typeof rockBurstFx === 'function') rockBurstFx(h.cx, h.cy, 'mouseHand');
}
// 暴怒：從地上裂開的洞叫出小老鼠（一般的花蓮版權老鼠，會自己鑽地找人）
function rkSummonMice(K, e) {
  const M = RAT_KING.mice, have = [...G.enemies, ...(G.burrowLurkers || [])].filter(o => o.behavior === 'burrow' && !o.dead && o.hp > 0).length;
  const n = Math.min(rkRandInt(M.count), M.max - have);
  const spec = (typeof ACTIVE_MONSTERS !== 'undefined' && ACTIVE_MONSTERS.find(m => m.id === 'burrowing_mouse')) || burrowingMouseDefinition();
  for (let i = 0; i < n; i++) {
    const s = rkRandomSpot(G.player ? [G.player] : [], 4); if (!s) return;
    const m = createMonster(spec, s.x, s.y); m.floor = 1;
    G.enemies.push(m);
    rkAddDig(K, s.x, s.y, 1.5);
  }
  if (n > 0) rkSound('mouseDig', e.x, e.y, 1);
}

// ---- 被揍飛／丟出去（借用 js/vines.js 藤蔓丟人那一套：飛出去 → 彈兩下 → 躺著暈 → 爬起來）----
// from＝從哪裡被打飛（往反方向飛）；cfg：dist＝飛多遠（格）、up＝往上拋的速度、wallDamage＝撞牆扣血、spread＝方向亂飄多少；startH＝從多高飛出去
// 回傳 false＝沒辦法飛（例如正被藤蔓抓著）
const RK_GRAVITY = 900;
function rkLaunch(a, from, cfg, startH = 0) {
  if (!a || a.hp <= 0 || !G.vineCaps || a.vineCap || a.rkHeld || a.mrtRide || a.eatenBy) return false;
  const isPlayer = a === G.player;
  let ang = Math.hypot(a.x - from.x, a.y - from.y) < 6 ? Math.random() * Math.PI * 2 : Math.atan2(a.y - from.y, a.x - from.x);
  ang += rkRand(-1, 1) * (cfg.spread || .25);
  const tx = Math.cos(ang), ty = Math.sin(ang), dist = rkRand(...cfg.dist) * CELL;
  const flight = (cfg.up + Math.sqrt(cfg.up * cfg.up + 2 * RK_GRAVITY * startH)) / RK_GRAVITY;   // 在空中飛幾秒（拋物線）
  const v = { x: a.x, y: a.y, kind: 'hang', state: 'grab', t: 0, len: 1, seed: Math.random() * 10, twitch: 0, temp: true };   // 假的藤蔓（不放進 G.vines）
  G.vineCaps.push({ v, actor: a, isPlayer, mode: 'toss', ground: true, rkThrow: true, phase: 'thrown', t: 0, h: startH,
    x0: a.x, y0: a.y, hp: a.hp, camX: cam.x, camY: cam.y, topH: 0,
    tx, ty, vh: cfg.up, speed: dist / Math.max(.2, flight), wallDamage: cfg.wallDamage || 0, spin: 0, spinDir: tx >= 0 ? 1 : -1, lieSide: tx >= 0 ? 1 : -1 });
  a.vineCap = true; a.dashT = 0; a.knockT = 0; a.rootT = 0; a.moving = false; a.rkTossed = true;
  if (isPlayer) {
    if (typeof cancelChannel === 'function' && typeof playerChannel !== 'undefined' && playerChannel) cancelChannel();
    if (a.sitting && typeof standUp === 'function') standUp();
  } else { a.navPath = null; a.navGoal = null; a.target = null; a.meleeSwing = null; a.gunSwing = null; }
  G.effects.push({ ring: true, x: a.x, y: a.y - startH, r: 6, r2: 34, life: .3, life0: .3, color: '#f0a3c8' });
  return true;
}
// 飛在空中的人：往前飛、往上拋再掉下來、翻滾；撞牆或落地就交給 js/vines.js 的「掉下來」（彈兩下、躺著暈）
function updateRkThrows(dt) {
  for (const cap of G.vineCaps || []) if (cap.rkThrow && cap.phase === 'thrown') rkThrowStep(cap, dt);
}
// 被揍飛、丟出去、躺在地上暈的這段：不要受擊閃紅、發抖（溫特也不要畫面四周閃紅、被打的鏡頭震動）
//   每幀在 update 和畫圖前各清一次（同一幀別的怪物打到他也照樣清掉）；爬起來就恢復正常
function rkMuteHitFx() {
  for (const a of [G && G.player, ...((G && G.towers) || [])]) {
    if (!a || !a.rkTossed) continue;
    if (!a.vineCap && !(a.vineDazeT > 0)) { a.rkTossed = false; continue; }
    a.hitT = 0;
    if (a === G.player) { G.damageVignetteT = 0; G.cameraShakeT = 0; }
  }
}
function rkThrowStep(cap, dt) {
  const a = cap.actor;
  const blocked = cap.isPlayer ? playerBlocked : (typeof sentryBlocked === 'function' ? sentryBlocked : playerBlocked);
  cap.t += dt; cap.vh -= RK_GRAVITY * dt; cap.h = Math.max(0, cap.h + cap.vh * dt);
  cap.spin += cap.spinDir * 10 * dt;   // 在空中翻滾
  const step = cap.speed * dt, nx = cap.x0 + cap.tx * step, ny = cap.y0 + cap.ty * step;
  if (blocked(nx, ny)) {   // 撞牆！
    const dmg = Math.min(cap.wallDamage, Math.max(0, a.hp - 1));
    if (dmg > 0 && !(typeof practiceOn === 'function' && practiceOn())) { a.hp -= dmg; cap.hp = a.hp; flashDmg('-' + dmg, a.x, a.y - 46, '#ff6b6b'); }
    G.effects.push({ ring: true, x: cap.x0, y: cap.y0 - cap.h, r: 4, r2: 30, life: .3, life0: .3, color: '#e8dcc0' });
    if (typeof addShake === 'function') addShake(cap.isPlayer ? 7 : 4);
    if (typeof sfxAt === 'function') sfxAt('knock2', a.x, a.y, .9, 'rat-king-wall');
    rkThrowLand(cap, true);
    return;
  }
  cap.x0 = nx; cap.y0 = ny;   // js/vines.js 的 stepVineCap 會把人放到 x0, y0
  if (cap.h <= 0 && cap.vh < 0) rkThrowLand(cap, false);
}
function rkThrowLand(cap, wall) {
  const a = cap.actor;
  a.x = cap.x0; a.y = cap.y0;
  cap.phase = 'fall'; cap.t = 0; cap.fallV = wall ? 60 : Math.max(0, -cap.vh); cap.cut = true;
  // fallH0＝掉下來的起始高度（js/vines.js 照它算躺下去的姿勢、影子大小）：至少 60，落地彈起來（約 30 像素）才不會比它高、算出負的影子
  cap.h = Math.max(1, cap.h); cap.fallH0 = Math.max(60, cap.h);
}

// ---- 死亡表演（節奏：暈眩 → 到站音樂 → 列車進站、越近越震 → 煞車聲 → 煞車來不及撞飛）----
// 1. 血量歸零：畫面頓一下、短暫慢動作（不閃白）；老鼠王卡在鐵軌上暈頭轉向（頭上轉星星）
function rkStartFinale(e) {
  const K = G.ratKing;
  e.hp = 1; e.rkHp = 1; e.rkStunT = 99; e.rkDying = true;
  e.hitT = 0; e.rkArmorFlash = 0;   // 最後一槍的受擊白光：本體離開怪物清單後就不會再倒數，不清掉會一直閃白
  G.enemies = G.enemies.filter(o => o !== e);   // 不再被瞄準
  for (const h of K.hands) { if (h.enemy) h.enemy.hp = 0; if (h.held) { rkRelease(h.held); h.held = null; } }
  for (const o of G.enemies) if (o.ratKingHand) { o.dead = true; }
  G.enemies = G.enemies.filter(o => !o.ratKingHand);
  for (const u of K.under) {   // 地底的人吐回原地、核心放回原地
    if (u.who) { rkRelease(u.who); u.who.x = u.from.x; u.who.y = u.from.y; }
    if (u.core) { u.core.hidden = false; u.core.x = u.from.x; u.core.y = u.from.y; }
  }
  for (const h of K.hands) { if (h.core) h.core.hidden = false; h.age = Math.max(h.age, h.windup + h.rise + h.hold); }   // 場上的手全部縮回去
  for (const c of G.cores || []) c.rkReact = null;
  for (const p of K.pops || []) { rkRelease(p.who); p.who.x = p.x; p.who.y = p.y; }   // 正要被拋出來的人：直接放出來
  K.under = []; K.pops = [];
  K.phase = 'finale'; K.t = 0; K.hit = false; K.music = false; K.braked = false; K.rumble = 0; K.flash = 0;   // 暈眩開始：不閃白
  // 先算好：列車開始進站後幾秒會撞到老鼠王 → 煞車聲要在撞上前 brakeLead 秒響（可能在列車露臉之前就開始響）
  const F = RAT_KING.finale, tr = rkTrain();
  K.enterAt = F.daze + F.musicLead;
  K.hitIn = tr ? rkRamHitTime(tr, e, RAT_KING.ram.decelMul) : 0;
  K.brakeAt = Math.max(F.daze, K.enterAt + K.hitIn - F.brakeLead);
  if (typeof addHitstop === 'function') addHitstop(.09);
  rkSlowMo(F.slowMo);
  if (typeof addShake === 'function') addShake(8);
  rkSound('mouseHurt', e.x, e.y, 1.3);
  systemNotice(RAT_KING.name + '卡在鐵軌上動不了了……', true);
}
// 列車用 mrtRamArrive(tr, decelMul) 進站的話，幾秒後車頭會碰到老鼠王（js/mrt-train.js：一開始速度 v0、一路減速，停在月台）
function rkRamHitTime(tr, e, decelMul) {
  const a = MRT_TRAIN.arriveDecel * decelMul, D = tr.inDist, v0 = Math.sqrt(2 * a * D);
  const head = tr.dir > 0 ? Math.max(...tr.cars.map(c => c.x + c.w)) : Math.min(...tr.cars.map(c => c.x));   // 停好時車頭的位置
  const reachX = tr.dir > 0 ? e.x - e.drawWidth * .3 : e.x + e.drawWidth * .3;
  const d = Math.max(0, Math.min(D, D - (head - reachX) * (tr.dir > 0 ? 1 : -1)));   // 從隧道口開始要走多遠才碰到
  const disc = v0 * v0 - 2 * a * d;
  return disc <= 0 ? v0 / a : (v0 - Math.sqrt(disc)) / a;
}
// 震動強度（0～1）：暈眩時不震，到站音樂響了以後越來越大，列車進站後照「還有幾秒撞上」越來越大
function rkRumbleK(K, e) {
  const F = RAT_KING.finale;
  if (K.phase === 'finale') return K.t < F.daze ? 0 : .15 + .45 * Math.min(1, (K.t - F.daze) / F.musicLead);
  if (K.hit) return 0;
  const left = Math.max(0, K.hitIn - K.t);
  return .6 + .4 * (1 - Math.min(1, left / Math.max(.1, K.hitIn)));
}
function updateRkFinale(K, dt) {
  const e = K.e, F = RAT_KING.finale; if (!e) return;
  K.t += dt; e.rkAge = (e.rkAge || 0) + dt;
  updateRkHands(K, dt);   // 剛剛縮回去的手把動畫播完
  if (!K.music && K.t >= F.daze) {   // 2. 到站音樂（這個車站自己的那首，js/mrt-train.js 的 mrtArriveSound）
    K.music = true;
    const name = typeof mrtArriveSound === 'function' ? mrtArriveSound() : 'mrtArrive';
    if (typeof SFX !== 'undefined' && SFX.play) SFX.play(name, F.musicGain, 'rat-king-arrive');
  }
  rkBrakeCheck(K, K.t);
  K.rumble = rkRumbleK(K, e);
  if (K.rumble > 0 && typeof addShake === 'function') addShake(1 + 9 * K.rumble);
  if (K.rumble > .3 && Math.random() < dt * 8 * K.rumble) rkDirt(e.x + rkRand(-3, 3) * CELL, rkEdgeY(), .7);
  if (K.t >= K.enterAt) rkStartRam(K, e);
}
// 煞車聲：時間到就響一次（finale 和 ram 都要檢查；at＝從血量歸零開始算的秒數）
function rkBrakeCheck(K, at) {
  if (K.braked || at < K.brakeAt) return;
  K.braked = true;
  if (typeof sfx === 'function') sfx('mrtBrake');
}
// 3. 列車衝進站（車速 ram.decelMul）
function rkStartRam(K, e) {
  K.phase = 'ram'; K.t = 0; K.hit = false;
  const tr = rkTrain();
  if (tr && typeof mrtRamArrive === 'function') mrtRamArrive(tr, RAT_KING.ram.decelMul);
  else rkRamHit(K, e);   // 沒有列車：直接倒下
}
function updateRkRam(K, dt) {
  const e = K.e; if (!e) return;
  e.rkAge = (e.rkAge || 0) + dt;
  updateRkHands(K, dt);
  if (!K.hit) {
    K.t += dt;
    rkBrakeCheck(K, K.enterAt + K.t);
    K.rumble = rkRumbleK(K, e);
    if (typeof addShake === 'function') addShake(1 + 9 * K.rumble);
    if (Math.random() < dt * 10) rkDirt(e.x + rkRand(-3, 3) * CELL, rkEdgeY(), .9);
    const tr = rkTrain();
    if (!tr) { rkRamHit(K, e); return; }
    // 車頭的位置：往右開的車頭在右邊（off 是負的＝還在隧道裡）
    const front = tr.dir > 0 ? Math.max(...tr.cars.map(c => c.x + c.w)) + tr.off * tr.dir : Math.min(...tr.cars.map(c => c.x)) + tr.off * tr.dir;
    const reach = tr.dir > 0 ? front >= e.x - e.drawWidth * .3 : front <= e.x + e.drawWidth * .3;
    if (reach || tr.state !== 'arrive') rkRamHit(K, e, tr.dir || 1);
    return;
  }
  K.t += dt;
  if (Math.random() < dt * 30) {   // 飛走的路上灑星星
    const p = rkFlyPos(K, e);
    G.effects.push({ particle: true, kind: 'spark', x: p.x, y: p.y, vx: (Math.random() - .5) * 60, vy: (Math.random() - .5) * 60, r: 2 + Math.random() * 2.5, life: .6, life0: .6, color: ['#ffe36e', '#ffffff', '#f0a3c8'][Math.floor(Math.random() * 3)] });
  }
  if (K.t >= RAT_KING.ram.fly) { K.phase = 'dead'; K.flyDone = true; rkVictory(K, e); }
}
// 4. 撞上去：畫面頓住、白光、慢動作、大震動、衝擊波、火花碎片
function rkRamHit(K, e, dir = 1) {
  K.hit = true; K.t = 0; K.flyDir = RAT_KING.ram.flyDir || dir; K.flash = 1; K.rumble = 0;
  e.rkRammed = true; e.hp = 0; e.rkStunT = 0;
  if (typeof addShake === 'function') addShake(16);
  if (typeof addHitstop === 'function') addHitstop(.09);
  rkSlowMo(RAT_KING.ram.slowMo);
  rkSound('bigBoom', e.x, e.y, 1.2); rkSound('mouseDeath', e.x, e.y, 1.3);
  const edge = rkEdgeY(), my = edge - RAT_KING.showRow * RAT_KING.scale * .5;
  for (let k = 0; k < 6; k++) rkDirt(e.x + rkRand(-3, 3) * CELL, edge, 1.8);
  G.effects.push({ ring: true, x: e.x, y: edge, r: 10, r2: 260, life: .55, life0: .55, color: '#ffd28a' });
  G.effects.push({ ring: true, x: e.x, y: my, r: 20, r2: 340, life: .7, life0: .7, color: '#ffffff' });
  for (let i = 0; i < 46; i++) {   // 撞擊的火花往老鼠王飛的方向噴
    const a = (K.flyDir > 0 ? 0 : Math.PI) + (Math.random() - .5) * 2.2, sp = 160 + Math.random() * 360;
    G.effects.push({ particle: true, kind: 'spark', x: e.x - K.flyDir * 40, y: my + rkRand(-40, 40), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 80, r: 1.5 + Math.random() * 2.5, life: .5 + Math.random() * .4, life0: .9, color: i % 3 ? '#ffd28a' : '#ffffff' });
  }
  // 照一般怪物死掉的流程：掉碎片、記擊殺、圖鑑、特別獎金（game.js 的死亡判斷；這時已經不在 G.enemies 裡，這裡自己跑一次）
  e.dead = true;
  if (!(typeof practiceOn === 'function' && practiceOn()) && typeof dropShard === 'function') dropShard(e.x, rkEdgeY() + CELL, e.crystals ?? 5, 1);
  if (G.battle) { const nm = monsterNameOf(e); G.battle.kills[nm] = (G.battle.kills[nm] || 0) + 1; }
  if (typeof onEnemyDeath === 'function') onEnemyDeath(e);
  if (typeof questEvent === 'function') questEvent('kill', { monster: e.type });
}
// 5. 飛遠之後：討伐成功的橫幅、到站音樂慢慢收掉
function rkVictory(K, e) {
  if (typeof coreBanner === 'function') coreBanner('討伐成功！', RAT_KING.name + '被列車撞飛了・列車恢復通行', '#ffd28a');
  if (typeof SFX !== 'undefined' && SFX.fadeOut) SFX.fadeOut('rat-king-arrive', 2.5);
  if (typeof sfx === 'function') sfx('win');
}
// 慢動作：借用隊員暴走那一套（js/berserk-fx.js 的 battleTimeScale 讀 G.slowMoT／G.slowMoScale）
function rkSlowMo(cfg) { if (cfg && cfg.time > 0) { G.slowMoT = cfg.time; G.slowMoScale = cfg.scale; } }
// 被撞飛時老鼠王的位置（畫圖和灑星星共用）
function rkFlyPos(K, e) {
  const B = RAT_KING, k = Math.min(1, K.t / B.ram.fly), dir = K.flyDir || 1;
  const top = rkEdgeY() - B.showRow * B.scale, h = 90 * B.scale;
  const dist = k * (B.ram.flyDist || 16) * CELL;   // 沿著 flyAngle 的斜線直直飛出去
  return { k, x: e.x + dir * dist, y: top + h / 2 - dist * Math.tan((B.ram.flyAngle || 0) * Math.PI / 180) };
}
// ---- 倒下（combat-feel.js 的 onEnemyDeath 呼叫）----
function ratKingDown(e) {
  systemNotice(RAT_KING.name + '被列車撞飛了！', true);
}

// ---- 特效：鐵軌冒土 ----
function rkDirt(x, y, size = 1) {
  if (typeof rockBurstFx === 'function') rockBurstFx(x, y - 4, { rocks: Math.round(6 * size), speed: [40, 140], up: [90, 220], dust: Math.round(3 * size), dustRise: 2, size, spread: 20 });
}
function updateRkFx(K, dt) {
  const e = K.e;
  if (e && e.rkArmorFlash > 0) e.rkArmorFlash -= dt;
  if (K.flash > 0) K.flash = Math.max(0, K.flash - dt * 2.6);
  for (const d of K.digs || []) d.age += dt;
  if (K.digs) K.digs = K.digs.filter(d => d.age < d.life);
}

// ---- 隊友挑目標（js/game.js 的 pickSentryTarget 呼叫，回傳要加在「距離分數」上的數字，越小越優先）----
//   老鼠王本體：射程裡還有別的怪物就先打牠們（小怪清完才打老鼠王）；抓著人的手：比小怪還優先（先救人）
function ratKingTargetBias(e) {
  if (e.ratKingHand) return -50000;
  if (e.ratKing) return 50000;
  return 0;
}
// ---- BOSS 血條（js/core-frenzy.js）、BOSS 音樂（js/boss-music.js）----
function ratKingBars() {
  const K = G && G.ratKing, e = K && K.e;
  if (!rkAlive(e) || !e.eliteAwake) return [];
  const tag = e.rkStunT > 0 ? '（暈倒）' : e.rkEnraged ? '（暴怒）' : '';   // 不顯示核心護甲幾 %（讓玩家自己發現）
  return [{ label: RAT_KING.name + tag, ratio: e.hp / e.maxhp, hit: e.hitT > 0, colors: ['#7a2e55', '#f0a3c8'], frame: '#d95a9a', text: '#ffe0f0' }];
}
const ratKingHunting = () => { const K = G && G.ratKing; return !!(K && rkAlive(K.e) && K.e.eliteAwake); };

// ---- 畫圖 ----
// 老鼠王本體（render.js 的 drawEnemy 呼叫；死亡表演、被撞飛時由 ratKingSortables 畫）
function drawRatKing(c, e) {
  const B = RAT_KING, S = B.scale, w = 110 * S, h = 90 * S, edge = rkEdgeY();
  const art = rkArt(), t = performance.now() / 1000;
  const K = G.ratKing, flying = K && K.phase === 'ram' && K.hit, struggling = K && (K.phase === 'finale' || (K.phase === 'ram' && !K.hit)), rumble = struggling ? K.rumble || 0 : 0;
  let file = burrowMouseBlinkFrame(art, e.rkAge || 0);
  const dizzy = e.rkStunT > 0 || e.rkDying;
  if (dizzy) { const slot = Math.floor(t / .22); file = art['dizzy' + (1 + Math.floor(Math.abs(Math.sin(slot * 12.9898) * 43758.5453) % 1 * 4))]; }
  const img = monsterImage(file); if (!img || !img.complete || !img.naturalWidth) return;
  const top = edge - B.showRow * S + (1 - (e.rkRise ?? 1)) * B.showRow * S;   // 冒出來的過程：從月台邊緣往上升
  c.save();
  c.imageSmoothingEnabled = false;
  if (flying) {   // 被撞飛：往列車開的方向飛出去、往上拋、邊轉邊變大（飛向鏡頭）、最後淡掉
    const p = rkFlyPos(K, e), dir = K.flyDir || 1, grow = 1 + p.k * .9;
    c.globalAlpha = Math.max(0, 1 - Math.max(0, p.k - .55) / .45);
    c.translate(p.x, p.y); c.rotate(dir * p.k * 9); c.scale(grow, grow); c.drawImage(img, -w / 2, -h / 2, w, h);
    c.restore();
    if (typeof drawBurrowDizzyStars === 'function' && p.k < .7) drawBurrowDizzyStars(c, p.x, p.y - h * .45 * grow, S * .9, t);
    return;
  }
  c.beginPath(); c.rect(e.x - w, edge - h * 2, w * 2, h * 2); c.clip();   // 月台邊緣以下不畫（被月台擋住）
  const hitFx = e.hitT > 0 && !e.rkDying;   // 死亡表演中不畫受擊抖動、白光
  if (hitFx) c.translate((Math.random() * 2 - 1) * 3, 0);
  if (rumble > 0) c.translate((Math.random() * 2 - 1) * 5 * rumble, (Math.random() * 2 - 1) * 1.5 * rumble);   // 列車越近，跟著地面抖得越厲害
  if (dizzy) { c.translate(e.x, edge); c.rotate(Math.sin(t * 5) * .05); c.translate(-e.x, -edge); }   // 暈頭轉向：慢慢左右晃
  // 核心護甲：身體外圍一圈紫光（越多核心越亮）；剛被護甲擋掉傷害時閃一下
  const armor = 1 - ratKingDamageMul(e);
  if (struggling) { /* 死亡表演：不發光 */ }
  else if (armor > 0 && !(e.rkStunT > 0)) { c.shadowColor = 'rgba(176,110,255,' + Math.min(1, .45 + armor * .6 + (e.rkArmorFlash > 0 ? .4 : 0)) + ')'; c.shadowBlur = 18 + armor * 22; }
  else if (e.rkEnraged) { c.shadowColor = 'rgba(255,80,60,' + (.55 + .3 * Math.sin(t * 7)) + ')'; c.shadowBlur = 26; }
  c.drawImage(img, e.x - w / 2, top, w, h);
  c.shadowBlur = 0;
  if (hitFx) { c.globalAlpha = .35; c.globalCompositeOperation = 'lighter'; c.drawImage(img, e.x - w / 2, top, w, h); }
  c.restore();
  if (dizzy && typeof drawBurrowDizzyStars === 'function') drawBurrowDizzyStars(c, e.x, top + 8 * S, S * .9, t);
}
// 一隻手：照花蓮版權老鼠同一套出土遮罩畫（js/burrowing-mouse.js 的 drawBurrowMasked），拳頭換成 left-fist.png
function rkHandPose(h) {
  const t = h.age - h.windup, up = h.rise, top = h.rise + h.hold;
  const reveal = t < 0 ? 0 : t < up ? burrowEase(t / up) : t < top ? 1 : 1 - burrowEase((t - top) / Math.max(.01, h.sink));
  const pose = { reveal, open: t < 0 ? burrowEase(h.age / h.windup) : 1, crack: 0, stretch: t >= up && t < up + .15 ? 1 + .08 * Math.sin((t - up) / .15 * Math.PI) : 1 };
  if (h.kind === 'grab' && h.held && h.hold - (t - up) < .5) pose.tilt = Math.sin(h.age * 40) * .12;   // 快丟出去：用力晃
  else if (h.kind === 'grab' && (h.held || h.carry)) {   // 握著人：以洞口為軸慢慢左右搖晃（剛抓到時從 0 慢慢晃起來）
    const W = RAT_KING.hands.holdSway, k = Math.min(1, Math.max(0, t - up) / .4);
    pose.tilt = Math.sin((t - up) * W.speed * Math.PI) * W.angle * k;
  }
  return pose;
}
function rkHandFile(h) {
  const open = rkArt().hand, fist = RAT_KING.art.fist, up = h.windup + h.rise;
  if (h.kind === 'core' || h.kind === 'pop') return h.age < up + h.hold * .35 && h.kind === 'core' ? open : h.kind === 'pop' && h.age >= up + h.hold * .7 ? open : fist;   // 抓核心：張開→握住；放核心：握著→張開
  if (h.kind === 'spit') return h.age < up + .1 ? fist : open;
  return fist;
}
function drawRkHand(c, h) {
  const pose = rkHandPose(h), scale = RAT_KING.hands.scale, file = rkHandFile(h), fist = file === RAT_KING.art.fist;
  // 手裡握著的人／核心：夾在拳頭和前面的手指中間（照示意圖：人橫躺、頭從拳頭旁邊露出來）
  const who = rkHandHolding(h), core = (h.kind === 'core' || h.kind === 'pop') && h.core && !h.core.dead ? h.core : null;
  if (who || core) {
    pose.between = (ctx, left, top, sx, sy) => {
      if (who) rkDrawHeldActor(ctx, who, left + RAT_KING.grip.held[0] * sx, top + RAT_KING.grip.held[1] * sy, h);
      else if (typeof coreImg !== 'undefined' && coreImg.complete && coreImg.naturalWidth) {
        const k = RAT_KING.grip.coreSize, cw = CORE.w * k, ch = CORE.h * k, [gx, gy] = RAT_KING.grip.core;
        ctx.save(); ctx.translate(left + gx * sx, top + gy * sy); ctx.rotate(-Math.PI / 2);   // 橫躺（跟握住的人一樣）
        ctx.drawImage(coreImg, -cw / 2, -ch / 2, cw, ch); ctx.restore();
      }
    };
    if (fist) pose.over = RAT_KING.art.fistFront;
  }
  drawBurrowMasked(c, monsterImage, rkArt(), h.x, h.y, 110 * scale, 90 * scale, h.side, file, pose);
  if (h.enemy && h.enemy.hp > 0) {   // 抓人的手：小血條＋「打這裡」提示（畫在拳頭上方）
    const r = h.enemy.hp / h.enemy.maxhp, x = h.x - 26, y = h.y + 13 - rkHandH() + 10 * scale;
    c.save(); c.fillStyle = 'rgba(0,0,0,.7)'; c.fillRect(x - 1, y - 1, 54, 7);
    c.fillStyle = '#ff7aa8'; c.fillRect(x, y, 52 * r, 5);
    c.font = 'bold 12px sans-serif'; c.textAlign = 'center'; c.fillStyle = '#fff'; c.strokeStyle = '#000'; c.lineWidth = 3;
    const name = h.held === G.player ? '溫特' : (h.held && TYPES[h.held.type] ? TYPES[h.held.type].name : '');
    c.strokeText('救' + name + '！', h.x, y - 6); c.fillText('救' + name + '！', h.x, y - 6);
    c.restore();
  }
}
// 這隻手現在握著誰：抓到還沒丟／拖的、正在拖下去的、正要吐出來的
function rkHandHolding(h) {
  if (h.kind === 'grab') return h.held || h.carry || null;
  if (h.kind === 'spit' && h.who && h.who.rkUnder) return h.who;
  return null;
}
// 握在拳頭裡的人：用平常的角色圖，轉成橫躺（頭朝手臂外側），微微掙扎
function rkDrawHeldActor(ctx, a, x, y, h) {
  const set = a === G.player ? (typeof playerSprites !== 'undefined' ? playerSprites : null) : (typeof sentrySprites !== 'undefined' ? sentrySprites[a.type] : null);
  const ok = im => im && im.complete && im.naturalWidth;
  // 優先用「痛的表情」（正面），沒有就用正面待機圖
  const img = !set ? null : ok(set.ouch) ? set.ouch : set.blink && ok(set.blink[0]) ? set.blink[0]
    : typeof pickCharacterFrame === 'function' && pickCharacterFrame(set, { ...a, hp: Math.max(1, a.hp), moving: false, gunT: 0, sitting: null });
  if (!img || !img.complete || !img.naturalWidth) return;
  const size = PLAYER.drawSize, t = performance.now() / 1000;
  ctx.save();
  ctx.translate(x, y); ctx.rotate(-Math.PI / 2 + Math.sin(t * 14 + (h.x || 0)) * .08);
  ctx.drawImage(img, -size / 2, -size / 2, size, size);
  ctx.restore();
}
// 預警圈：拳頭橘色、抓人紫色、搬核心淡紫（核心被打到後冒出來的手不畫）
function drawRkWarning(c, h) {
  if (h.age >= h.windup + h.rise || h.windup < .3) return;
  const k = Math.min(1, h.age / Math.max(.01, h.windup));
  const R = (h.kind === 'grab' ? RAT_KING.grab.radius : h.kind === 'punch' ? RAT_KING.punch.radius : 1.4) * CELL, o = rkHandSpot(h);
  const col = h.kind === 'grab' ? ['#c58bff', '#9b4dff'] : h.kind === 'punch' ? ['#ff986c', '#e96b4a'] : ['#d9c2ff', '#8c6bbf'];
  c.save(); c.strokeStyle = col[0]; c.fillStyle = col[1]; c.lineWidth = 2;
  c.globalAlpha = .18 + .14 * k; c.beginPath(); c.ellipse(o.x, o.y, R, R * .48, 0, 0, Math.PI * 2); c.fill();
  c.globalAlpha = .85; c.beginPath(); c.ellipse(o.x, o.y, R * (1.5 - k * .5), R * .48 * (1.5 - k * .5), 0, 0, Math.PI * 2); c.stroke();
  c.restore();
}
// 地上裂開的洞（hole02 圖）：一出現就從小撐開，最後淡掉
function drawRkDig(c, d) {
  const img = monsterImage(RAT_KING.dig.art); if (!img || !img.complete || !img.naturalWidth) return;
  const grow = 1 - Math.pow(1 - Math.min(1, d.age / .25), 3), fade = Math.min(1, (d.life - d.age) / .6);
  const w = img.naturalWidth * RAT_KING.dig.size * (.3 + .7 * grow), h = img.naturalHeight * RAT_KING.dig.size * (.3 + .7 * grow);
  c.save(); c.globalAlpha = Math.max(0, fade); c.imageSmoothingEnabled = false;
  c.drawImage(img, d.x - w / 2, d.y - h / 2, w, h);
  c.restore();
}
// 地上：裂開的洞、預警圈、核心連到老鼠王的紫色光線（js/render.js 的 groundFx 呼叫）
function drawRatKingGround(c) {
  const K = G && G.ratKing; if (!K) return;
  rkMuteHitFx();   // 畫人之前再清一次受擊閃紅（地上特效比人先畫）
  if (typeof fxSkip === 'function' && fxSkip(1)) return;
  for (const d of K.digs || []) drawRkDig(c, d);
  for (const h of K.hands) drawRkWarning(c, h);
  const e = K.e;
  if (rkAlive(e) && K.phase === 'fight' && !(e.rkStunT > 0)) {
    const t = performance.now() / 1000;
    c.save(); c.lineWidth = 2; c.setLineDash([6, 8]); c.lineDashOffset = -t * 30;
    for (const core of G.cores || []) if (!core.dead && !core.hidden) {
      c.strokeStyle = 'rgba(176,110,255,' + (.28 + .12 * Math.sin(t * 4 + core.seed)) + ')';
      c.beginPath(); c.moveTo(core.x, core.y - 30); c.lineTo(e.x, rkEdgeY() - RAT_KING.showRow * RAT_KING.scale * .45); c.stroke();
    }
    c.restore();
  }
}
// 隧道裡越來越亮的車燈（死亡表演，畫在世界裡）：列車從哪一頭進站，那一頭的軌道就亮起來
function drawRkHeadlight(c, K) {
  const tr = rkTrain(); if (!tr || K.hit) return;
  const F = RAT_KING.finale, k = K.phase === 'finale' ? Math.max(0, Math.min(1, (K.t - F.daze) / F.musicLead)) : 1, t = performance.now() / 1000;
  if (k <= 0) return;   // 還在暈：隧道裡還沒有車燈
  const x = tr.dir > 0 ? tr.clipL : tr.clipR, y = rkEdgeY() - 70, R = 120 + 380 * k;
  const g = c.createRadialGradient(x, y, 0, x, y, R), a = (.35 + .5 * k) * (.85 + .15 * Math.sin(t * 30));
  g.addColorStop(0, 'rgba(255,250,215,' + a.toFixed(3) + ')'); g.addColorStop(.35, 'rgba(255,230,150,' + (a * .45).toFixed(3) + ')'); g.addColorStop(1, 'rgba(255,220,120,0)');
  c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = g; c.beginPath(); c.arc(x, y, R, 0, Math.PI * 2); c.fill(); c.restore();
}
// 手、死亡表演的本體、車燈：跟人一起排前後（render.js 呼叫）
function ratKingSortables(list) {
  const K = G && G.ratKing; if (!K) return;
  for (const h of K.hands) if (h.age >= h.windup * .5) list.push({ floor: 1, y: h.y + 13, draw: () => drawRkHand(ctx, h) });
  if ((K.phase === 'finale' || K.phase === 'ram') && K.e) {
    list.push({ floor: 1, y: rkEdgeY() + (K.hit ? 400 : 0), draw: () => drawRatKing(ctx, K.e) });   // 被撞飛：畫在最前面
    list.push({ floor: 1, y: rkEdgeY() + 1, draw: () => drawRkHeadlight(ctx, K) });
  }
}
// 畫面最上層（js/render.js 最後呼叫，螢幕座標）：死亡表演的白光（只有撞上去那一下）
function drawRatKingScreen(c) {
  const K = G && G.ratKing; if (!K || typeof cv === 'undefined') return;
  rkMuteHitFx();   // 溫特被丟出去、躺著的時候：畫面四周不閃紅（這個函式在受擊紅暈之前呼叫）
  if (!(K.flash > 0)) return;
  c.save(); c.fillStyle = 'rgba(255,255,255,' + Math.min(1, K.flash).toFixed(3) + ')'; c.fillRect(0, 0, cv.width, cv.height); c.restore();
}
