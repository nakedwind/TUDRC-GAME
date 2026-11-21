/* ===== 菁英花蓮版權老鼠「花蓮老鼠王」（O666區-橘線捷運站 上方月台的地圖 BOSS）=====
   - 平常躲在鐵軌底下，看不到、打不到（其實還沒生出來）。上方那班紅色列車也被牠卡住，不會進站。
   - 觸發：地圖上任何一顆異質核心被喚醒 → 鐵軌底下開始震動、冒土 → 老鼠王從鐵軌冒出上半身（下半身被月台擋住）。
   - 異質核心＝老鼠王的護甲：場上每還有一顆沒打破的核心，老鼠王受到的傷害就少一截（armor）。
     核心和老鼠王之間會連著淡淡的紫色光線，看得出來是核心在幫牠撐著。
   - 老鼠王的手（整片月台都可能冒出來，地上先出現預警圈）：
       1. 拳頭砸地：在溫特或隊員腳下冒出握拳的手往上打，打中會被戳飛。
       2. 抓人：紫色預警圈。被抓到的人被拳頭握住，過 grab.hold 秒就被拖進地底，之後從別的地方吐出來（扣血＋暈一下）。
          在被拖下去之前把那隻手打掉（手有血量），人就救出來了。
       3. 搬核心（打地鼠）：手會抓住異質核心拖進地洞，過幾秒再從月台別的地方冒出來把核心放下。
          核心在地底的時候打不到（但還是算護甲）。
   - 最後一顆核心破掉：老鼠王暈倒 stun.time 秒（頭上轉星星），這段時間受到的傷害 ×stun.dmgMul，是爆發輸出的好時機。
   - 暴怒（血量剩一半）：手變多、變快，一次冒 2～3 隻；還會從洞裡叫出小的花蓮版權老鼠。
   - 血量歸零：老鼠王卡在鐵軌上動不了 → 紅色列車鳴笛衝進站把牠撞飛 → 列車照常停靠，之後可以搭車（開往哪裡寫在 data/mrt-train.js 的 variants）。
     核心全破的結算畫面會等老鼠王被撞飛之後才跳。
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
  atk: 1.4,                      // 攻擊力：花蓮版權老鼠的幾倍（拳頭、吐出來的傷害）
  rewardMul: 8, crystalMul: 8,   // 打倒給的結晶：花蓮版權老鼠的幾倍
  sway: { cells: 1.5, speed: .35 },   // 在鐵軌上左右慢慢晃：幅度（格）、速度
  armor: { perCore: .25, max: .8 },   // 每顆還沒打破的核心擋掉幾成傷害、最多擋幾成
  stun: { time: 6, dmgMul: 2 },       // 最後一顆核心破掉：暈幾秒、這段時間傷害幾倍
  enrageAt: .5,                  // 血量剩幾成暴怒
  emerge: { delay: 2.2, rumble: 2.4, rise: 2.4, hold: 1.2 },   // 核心醒了幾秒後開始震、震幾秒才冒出來、冒出來花幾秒、亮相多停幾秒
  // 手：every＝隔幾秒冒一波（最短～最長），count＝一波幾隻；frenzy＝暴怒時的版本
  //   scale＝手的大小（原圖 110×90 的幾倍；2.5＝以前 1.25 的兩倍，抓得住人和核心）
  hands: { every: [2.8, 4.2], count: [1, 1], frenzyEvery: [1.4, 2.4], frenzyCount: [2, 3], frenzySpeed: .75, grabChance: .3, scale: 2.5 },
  // 打地鼠的洞：手（拳頭、抓人、搬核心、吐人）和暴怒叫出的小老鼠，都從地圖上鋪的這種洞冒出來。
  // 在地圖編輯器多鋪、搬動、刪掉這種洞，手冒出來的位置就跟著變；地圖上一個都沒有時，才改回在目標腳下冒出來
  holeTile: 'tile_mvmo77lx',     // 地圖素材「hole02」
  punch: { windup: .95, rise: .18, hold: .35, sink: .3, radius: 2.2 },   // 拳頭砸地：預警幾秒、冒出、停住、縮回；打中範圍（格，以洞口為中心）
  grab: { windup: 1.15, rise: .22, radius: 2, hold: 2.6, handHp: 260, under: 2.2, spitDamageMul: 1.2, daze: 1.4, cooldown: 7 },
  //   抓人：預警幾秒、打中範圍（格，以洞口為中心）、握住幾秒才拖下去（這段時間打掉手就救出來）、手的血量、在地底幾秒、吐出來的傷害倍率、暈幾秒、兩次抓人至少隔幾秒
  core: { first: [10, 14], every: [14, 20], windup: 1, rise: .25, hold: .55, sink: .4, under: [1.2, 2], popHold: 1, minMove: 6 },
  //   搬核心：老鼠王冒出來後幾秒才第一次搬、之後隔幾秒搬一顆、預警、冒出、握住、拖下去；在地底幾秒（最短～最長）、從洞裡冒出來後握著幾秒才放下、新的洞至少離原本幾格
  //   （放下的核心會留在那個洞口，直到下一次被搬走；這段時間打得到）
  mice: { every: [9, 13], count: [1, 2], max: 4 },   // 暴怒後叫出小老鼠：隔幾秒、一次幾隻、場上最多幾隻
  ram: { decelMul: 3.2, fly: 1.6 },   // 最後一擊：列車進站的速度（減速度倍率，越大衝越快）、老鼠王被撞飛幾秒
  // 拳頭（老鼠王專用的紫藍版）；fistFront＝只有前面手指的那一層，握住人／核心時蓋在上面（拳頭 → 人／核心 → 手指）
  art: { fist: 'images/monster/rat-king/left-fist.png', fistFront: 'images/monster/rat-king/left-fist-02.png' },
  // 握在拳頭裡的人／核心放在原圖（110×90）的哪一點：held＝人身體的中心（人橫躺、頭朝外露出拳頭），core＝核心的中心
  grip: { held: [33, 31], core: [48, 20], coreSize: .65 },   // coreSize＝核心畫成原本大小的幾倍（核心從拳頭上方露出來）
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
// 範圍裡隨機一個點；far＝要離這些點至少幾格
function rkRandomSpot(avoid = [], minCells = 0) {
  const cells = rkAreaCells(); if (!cells.length) return null;
  for (let k = 0; k < 40; k++) {
    const [c, r] = cells[Math.floor(Math.random() * cells.length)], [x, y] = center(c, r);
    if (avoid.every(p => Math.hypot(p.x - x, p.y - y) >= minCells * CELL)) return { x, y };
  }
  const [c, r] = cells[Math.floor(Math.random() * cells.length)], [x, y] = center(c, r);
  return { x, y };
}
// ---- 打地鼠的洞（地圖上鋪的 RAT_KING.holeTile）----
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
// 離某一點最近的幾個空的洞（far＝要離這些點至少幾格）
function rkHolesNear(K, x, y, avoid = [], minCells = 0) {
  return rkHoles().filter(o => !rkHoleBusy(K, o) && avoid.every(p => Math.hypot(p.x - o.cx, p.y - o.cy) >= minCells * CELL))
    .sort((a, b) => Math.hypot(a.cx - x, a.cy - y) - Math.hypot(b.cx - x, b.cy - y));
}
// 隨便挑一個空的洞（離 avoid 這些點至少 minCells 格；找不到就放寬）
function rkRandomHole(K, avoid = [], minCells = 0) {
  let list = rkHolesNear(K, 0, 0, avoid, minCells);
  if (!list.length) list = rkHolesNear(K, 0, 0);
  return list.length ? list[Math.floor(Math.random() * list.length)] : null;
}
const rkSound = (name, x, y, gain = .9) => { if (typeof sfxAt === 'function') sfxAt(name, x, y, gain, 'rat-king-' + name); };

// ---- 開場（game.js 在 newGame 裡呼叫）----
// G.ratKing：{ phase: 'sleep'｜'rumble'｜'rise'｜'fight'｜'ram'｜'dead', t, e, hands, under, waveT, coreT, miceT, grabCd }
function seedRatKing() {
  G.ratKing = null;
  if (MAP_SAFE || (typeof practiceOn === 'function' && practiceOn()) || !rkSpot()) return;
  G.ratKing = { phase: 'sleep', t: 0, e: null, hands: [], under: [], waveT: 0, coreT: 0, miceT: 0, grabCd: 0, cores: 0 };
  [...Object.values(rkArt()), RAT_KING.art.fist, RAT_KING.art.fistFront].forEach(f => typeof monsterImage === 'function' && monsterImage(f));   // 先載好圖
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
  updateRkFx(dt);
  if (K.phase === 'ram') { updateRkRam(K, dt); return; }
  if (!G.running || G.over || K.phase === 'dead') return;
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
  if (typeof coreBanner === 'function') coreBanner(B.name + '現身', '異質核心在保護牠：先把核心打破！', '#f0a3c8');
  systemNotice('⚠ ' + B.name + '從鐵軌底下鑽出來了！核心還在的時候牠很硬，先打破核心！', true);
}
function rkStun(K, e) {
  e.rkStunned = true; e.rkStunT = RAT_KING.stun.time; e.stunT = 0;
  K.hands = K.hands.filter(h => h.kind !== 'punch' || h.age >= h.windup);   // 還在預警的拳頭取消
  systemNotice('★ ' + RAT_KING.name + '失去核心的保護、暈倒了！趁現在猛攻！', true);
  if (typeof coreBanner === 'function') coreBanner(RAT_KING.name + '暈倒了', '受到的傷害加倍！', '#ffe36e');
  rkSound('mouseHurt', e.x, e.y, 1.2);
}
function rkEnrage(e) {
  e.rkEnraged = true;
  systemNotice('⚠ ' + RAT_KING.name + '暴怒了！手變多了，還叫來了小老鼠！', true);
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
//   老鼠王：先照護甲補回來，還有血就繼續打；真的沒血 → 卡在鐵軌上等列車撞飛
//   抓人的手：被打掉 → 放人，手不算擊殺（不掉碎片、不記圖鑑）
function ratKingHoldDeath(e) {
  if (e.ratKingHand) { rkHandBroken(e); return true; }
  if (!e.ratKing) return false;
  if (e.rkRammed) return false;   // 列車撞飛了：照一般怪物死掉（掉碎片、記圖鑑、特別獎金）
  ratKingApplyArmor(e);
  if (e.hp > 0) return true;
  rkStartRam(e);
  return true;
}

// ---- 手 ----
// h：{ kind: 'punch'｜'grab'｜'core'｜'pop'｜'spit', x, y, age, windup, rise, hold, sink, side, ... }
function rkHandTimes(kind, fast = 1) {
  const P = RAT_KING.punch, Gb = RAT_KING.grab, C = RAT_KING.core;
  if (kind === 'punch') return { windup: P.windup * fast, rise: P.rise, hold: P.hold, sink: P.sink };
  if (kind === 'grab') return { windup: Gb.windup * fast, rise: Gb.rise, hold: Gb.hold, sink: .45 };
  if (kind === 'core') return { windup: C.windup, rise: C.rise, hold: C.hold, sink: C.sink };
  if (kind === 'pop') return { windup: C.windup * .8, rise: C.rise, hold: C.popHold, sink: .3 };
  return { windup: .7, rise: .2, hold: .35, sink: .3 };   // spit：把抓走的人吐出來
}
function rkNewHand(K, kind, x, y, extra = {}) {
  const e = K.e, fast = e && e.rkEnraged ? RAT_KING.hands.frenzySpeed : 1;
  const h = Object.assign({ kind, x, y, age: 0, side: e && x > e.x ? 'right' : 'left', ...rkHandTimes(kind, fast) }, extra);
  K.hands.push(h);
  return h;
}
// 手抓／打的中心點：從地圖上的洞冒出來的＝洞的正中間，不然＝落腳點
const rkHandSpot = h => h.hole ? { x: h.hole.cx, y: h.hole.cy } : { x: h.x, y: h.y };
// 一波手：每隻挑一個目標（溫特、隊員；要在範圍裡），有機會變成抓人
function rkHandWave(K, e, n) {
  const pool = [G.player, ...(G.towers || [])].filter(a => a && a.hp > 0 && !a.eatenBy && !a.rkHeld && !a.mrtRide && rkInArea(a.x, a.y) && sameFloor(e, a));
  if (!pool.length) return;
  if (rkHoles().length) {   // 打地鼠：從離目標最近的洞冒出來（第二隻以後挑附近的另一個洞）
    for (let i = 0; i < n; i++) {
      const a = pool[Math.floor(Math.random() * pool.length)];
      const near = rkHolesNear(K, a.x, a.y);
      if (!near.length) return;
      const hole = i === 0 ? near[0] : near[Math.floor(Math.random() * Math.min(3, near.length))];
      const close = Math.hypot(a.x - hole.cx, a.y - hole.cy) <= RAT_KING.grab.radius * CELL * 1.5;   // 目標在洞旁邊才會用抓的
      const grab = i === 0 && close && K.grabCd <= 0 && Math.random() < RAT_KING.hands.grabChance && !K.hands.some(h => h.kind === 'grab');
      if (grab) { rkNewHand(K, 'grab', hole.x, hole.y, { target: a, hole }); K.grabCd = RAT_KING.grab.cooldown; }
      else rkNewHand(K, 'punch', hole.x, hole.y, { hole });
      rkSound('mouseDig', hole.cx, hole.cy, .5);
    }
    return;
  }
  for (let i = 0; i < n; i++) {
    const a = pool[Math.floor(Math.random() * pool.length)];
    const lead = i === 0 ? 0 : rkRand(.6, 1.6) * CELL, ang = Math.random() * Math.PI * 2;   // 第二隻以後：落在目標附近，封走位
    const x = a.x + Math.cos(ang) * lead, y = a.y + Math.sin(ang) * lead * .7;
    const [c, r] = cellAt(x, y);
    if (!inGrid(c, r) || isWall(c, r)) continue;
    if (K.hands.some(h => Math.hypot(h.x - x, h.y - y) < CELL * 1.6)) continue;
    const grab = i === 0 && K.grabCd <= 0 && Math.random() < RAT_KING.hands.grabChance && !K.hands.some(h => h.kind === 'grab');
    if (grab) { rkNewHand(K, 'grab', a.x, a.y, { target: a }); K.grabCd = RAT_KING.grab.cooldown; }
    else rkNewHand(K, 'punch', x, y);
    rkSound('mouseDig', x, y, .5);
  }
}
// 搬核心：挑一顆沒被搬走、沒破的核心，手在它底下冒出來
function rkGrabCore(K, e) {
  const busy = new Set([...K.hands.map(h => h.core), ...K.under.map(u => u.core)].filter(Boolean));
  const list = (G.cores || []).filter(c => !c.dead && !c.hidden && !c.carried && !busy.has(c));
  if (!list.length) return;
  const core = list[Math.floor(Math.random() * list.length)];
  // 核心放在洞口的話，手從那個洞冒出來；還在原本位置（第一次被搬）就從核心底下鑽出來
  const hole = core.rkHole && rkHoles().includes(core.rkHole) && !rkHoleBusy(K, core.rkHole) ? core.rkHole : null;
  if (core.rkHole && !hole) return;   // 那個洞正好有別的手：下次再搬
  if (hole) rkNewHand(K, 'core', hole.x, hole.y, { core, hole });
  else rkNewHand(K, 'core', core.x, rkFootY(core.y - 20), { core });
}
function updateRkHands(K, dt) {
  const e = K.e;
  for (const h of K.hands) {
    const before = h.age; h.age += dt;
    const up = h.windup + h.rise;
    if (before < h.windup && h.age >= h.windup) {   // 鑽出地面：噴土
      rkSound('mouseAttack', h.x, h.y, .8);
      if (typeof rockBurstFx === 'function') rockBurstFx(h.x, h.y, 'mouseHand');
    }
    if (before < up && h.age >= up) rkHandUp(K, e, h);
    if (h.kind === 'grab' && h.held) rkHoldStep(h);
    if (h.kind === 'core' && h.age >= h.windup && !h.taken && h.core && !h.core.dead) { h.taken = true; h.core.hidden = true; }   // 手一冒出來就握住核心（打不到了）
    if (h.kind === 'core' && h.core && h.core.dead) h.core = null;   // 握住之前就被打破了
    if (before < up + h.hold && h.age >= up + h.hold) rkHandSink(K, h);
  }
  K.hands = K.hands.filter(h => h.age < h.windup + h.rise + h.hold + h.sink);
}
// 手完全冒出來的那一刻
function rkHandUp(K, e, h) {
  const P = RAT_KING.punch;
  if (h.kind === 'punch') {
    const o = rkHandSpot(h), within = a => a && a.hp > 0 && !a.rkHeld && !a.eatenBy && Math.hypot(a.x - o.x, a.y - o.y) <= P.radius * CELL;
    if (within(G.player)) { const hp0 = G.player.hp; e.playerTouchCd = 0; enemyAttackPlayer(e, 0); if (G.player.hp < hp0 && typeof burrowMousePoke === 'function') burrowMousePoke(G.player, h); }
    for (const t of G.towers) if (within(t)) { const hp0 = t.hp; e.atkCd = 0; enemyAttackSentry(e, t, 0); if (t.hp < hp0 && typeof burrowMousePoke === 'function') burrowMousePoke(t, h); }
    if (typeof addShake === 'function') addShake(3);
  } else if (h.kind === 'grab') {
    const a = h.target;
    const o = rkHandSpot(h);
    if (a && a.hp > 0 && !a.rkHeld && !a.eatenBy && !a.mrtRide && Math.hypot(a.x - o.x, a.y - o.y) <= RAT_KING.grab.radius * CELL) rkGrab(K, h, a);
  } else if (h.kind === 'pop' && h.core) {
    rkSound('mouseOut', h.x, h.y, .9);
  } else if (h.kind === 'spit') rkSpit(K, h);
}
// 抓到人：握住（看不到人、不能動），手變成打得到的東西（打掉就放人）
function rkGrab(K, h, a) {
  const Gb = RAT_KING.grab;
  h.held = a; a.rkHeld = h;
  const o = rkHandSpot(h); a.x = o.x; a.y = o.y; a.moving = false; a.navPath = null; a.navGoal = null; a.target = null; a.knockT = 0; a.meleeSwing = null; a.gunSwing = null;
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
  rkSound('mouseAttack', h.x, h.y, 1);
  if (typeof addShake === 'function') addShake(4);
}
// 握著的時候：人跟著手，不能動
function rkHoldStep(h) {
  const a = h.held; if (!a) return;
  const o = rkHandSpot(h); a.x = o.x; a.y = o.y; a.moving = false; a.navPath = null; a.target = null;
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
  rkSound('mouseHurt', h.x, h.y, 1);
  for (let i = 0; i < 8; i++) G.effects.push({ particle: true, kind: 'spark', x: h.x, y: h.y - 30, vx: (Math.random() - .5) * 90, vy: -(30 + Math.random() * 60), r: 2 + Math.random() * 1.5, life: .45, life0: .45, color: i % 2 ? '#ffffff' : '#9fd6ff' });
}
function rkRelease(a) {
  a.rkHeld = null; a.rkUnder = false; a.hitT = .3; a.navPath = null; a.navGoal = null;
}
// 手縮回地底的那一刻
function rkHandSink(K, h) {
  if (h.enemy) { h.enemy.dead = true; G.enemies = G.enemies.filter(o => o !== h.enemy); h.enemy = null; }
  if (h.kind === 'grab' && h.held) {   // 沒人救：拖進地底，過一陣子從別的地方吐出來
    const a = h.held; a.rkUnder = true; h.carry = a;   // carry：縮回去的這段還畫在拳頭裡
    K.under.push({ who: a, t: RAT_KING.grab.under, from: { x: h.x, y: h.y } });
    if (G.towers.includes(a) && typeof sentryStatus === 'function') sentryStatus(a, '被拖進地底了！', '#ff8f8f', true);
    else if (a === G.player) systemNotice('⚠ 溫特被拖進地底了！', true);
    rkSound('mouseDig', h.x, h.y, 1);
    h.held = null;
  }
  if (h.kind === 'core' && h.core && !h.core.dead) {   // 核心拖進地洞
    K.under.push({ core: h.core, t: rkRand(...RAT_KING.core.under), from: { x: h.core.x, y: h.core.y } });
    rkSound('mouseDig', h.x, h.y, 1);
  }
  if (h.kind === 'pop' && h.core) {   // 放下核心
    const c = h.core;
    const o = rkHandSpot(h);
    c.x = o.x; c.y = h.hole ? o.y : h.y - 4; c.floor = 1; c.hidden = false; c.rkHole = h.hole || null;   // 放在洞口：下次從同一個洞搬走
    G.effects.push({ ring: true, x: c.x, y: c.y + 8, r: 6, r2: 60, life: .4, life0: .4, color: '#c79bff' });
    h.core = null;
  }
  if (!h.hole) rkLeaveHole(h.x, h.y);   // 從地圖上的洞冒出來的就不用另外挖洞
}
// 在地底的東西（被拖下去的人、核心）：時間到就從別的地方冒出來
function updateRkUnder(K, dt) {
  for (const u of K.under) u.t -= dt;
  const due = K.under.filter(u => u.t <= 0);
  K.under = K.under.filter(u => u.t > 0);
  for (const u of due) {
    const others = (G.cores || []).filter(c => !c.dead && !c.hidden);
    if (u.core) {
      if (u.core.dead) continue;
      const avoid = [u.from, ...(G.player ? [G.player] : []), ...others];
      if (rkHoles().length) {   // 從另一個洞冒出來
        const hole = rkRandomHole(K, avoid, RAT_KING.core.minMove);
        if (!hole) { u.t = .3; K.under.push(u); continue; }   // 洞都有手：等一下再冒
        rkNewHand(K, 'pop', hole.x, hole.y, { core: u.core, hole });
        continue;
      }
      const s = rkRandomSpot(avoid, RAT_KING.core.minMove) || u.from;
      rkNewHand(K, 'pop', s.x, s.y + 4, { core: u.core });
    } else if (u.who) {
      const a = u.who;
      if (a.hp <= 0 || (!G.towers.includes(a) && a !== G.player)) { rkRelease(a); continue; }
      if (rkHoles().length) {   // 從另一個洞吐出來
        const hole = rkRandomHole(K, [u.from], 5);
        if (!hole) { u.t = .3; K.under.push(u); continue; }
        a.x = hole.cx; a.y = hole.cy;
        rkNewHand(K, 'spit', hole.x, hole.y, { who: a, hole });
        continue;
      }
      const s = rkRandomSpot([u.from], 5) || u.from;
      a.x = s.x; a.y = s.y;
      rkNewHand(K, 'spit', s.x, s.y, { who: a });
    }
  }
}
// 吐出來：扣血、戳飛、暈一下
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
  if (a.hp > 0) {
    if (typeof burrowMousePoke === 'function') burrowMousePoke(a, { x: h.x, y: h.y + 6 });
    a.slipDizzyT = Math.max(a.slipDizzyT || 0, Gb.daze); a.dazeT = Math.max(a.dazeT || 0, Gb.daze);
  }
  rkSound('mouseOut', h.x, h.y, 1);
  if (typeof rockBurstFx === 'function') rockBurstFx(h.x, h.y, 'mouseHand');
}
// 暴怒：從洞裡叫出小老鼠（一般的花蓮版權老鼠，會自己鑽地找人）
function rkSummonMice(K, e) {
  const M = RAT_KING.mice, have = [...G.enemies, ...(G.burrowLurkers || [])].filter(o => o.behavior === 'burrow' && !o.dead && o.hp > 0).length;
  const n = Math.min(rkRandInt(M.count), M.max - have);
  const spec = (typeof ACTIVE_MONSTERS !== 'undefined' && ACTIVE_MONSTERS.find(m => m.id === 'burrowing_mouse')) || burrowingMouseDefinition();
  for (let i = 0; i < n; i++) {
    const hole = rkHoles().length ? rkRandomHole(K, G.player ? [G.player] : [], 4) : null;   // 有打地鼠的洞就從洞裡鑽出來
    const s = hole ? { x: hole.cx, y: hole.cy } : rkRandomSpot(G.player ? [G.player] : [], 4); if (!s) return;
    const m = createMonster(spec, s.x, s.y); m.floor = 1;
    G.enemies.push(m);
    if (!hole) rkLeaveHole(s.x, s.y);
  }
  if (n > 0) rkSound('mouseDig', e.x, e.y, 1);
}
// 手留下的洞（沿用花蓮版權老鼠的洞：G.burrowHoles，幾秒後消失）
function rkLeaveHole(x, y) {
  (G.burrowHoles || (G.burrowHoles = [])).push({ x, y, floor: 1, w: 80, h: 66, image: BURROW_MOUSE_ART.hole, age: 0, lifetime: 2.5 });
}

// ---- 最後一擊：紅色列車鳴笛衝進站，把老鼠王撞飛 ----
function rkStartRam(e) {
  const K = G.ratKing;
  e.hp = 1; e.rkHp = 1; e.rkStunT = 99; e.rkDying = true;
  G.enemies = G.enemies.filter(o => o !== e);   // 不再被瞄準
  for (const h of K.hands) { if (h.enemy) h.enemy.hp = 0; if (h.held) { rkRelease(h.held); h.held = null; } }
  for (const o of G.enemies) if (o.ratKingHand) { o.dead = true; }
  G.enemies = G.enemies.filter(o => !o.ratKingHand);
  for (const u of K.under) {   // 地底的人吐回原地、核心放回原地
    if (u.who) { rkRelease(u.who); u.who.x = u.from.x; u.who.y = u.from.y; }
    if (u.core) { u.core.hidden = false; u.core.x = u.from.x; u.core.y = u.from.y; }
  }
  for (const h of K.hands) if (h.core) { h.core.hidden = false; }
  K.hands = []; K.under = [];
  K.phase = 'ram'; K.t = 0; K.hit = false;
  systemNotice('⚠ 列車進站了！' + RAT_KING.name + '卡在鐵軌上動不了！', true);
  if (typeof sfx === 'function') sfx('mrtHorn');
  const tr = rkTrain();
  if (tr && typeof mrtRamArrive === 'function') mrtRamArrive(tr, RAT_KING.ram.decelMul);
  else rkRamHit(K, e);   // 沒有列車：直接倒下
}
function updateRkRam(K, dt) {
  const e = K.e; if (!e) return;
  e.rkAge = (e.rkAge || 0) + dt;
  if (!K.hit) {
    const tr = rkTrain();
    if (!tr) { rkRamHit(K, e); return; }
    // 車頭的位置：往右開的車頭在右邊（off 是負的＝還在隧道裡）
    const front = tr.dir > 0 ? Math.max(...tr.cars.map(c => c.x + c.w)) + tr.off * tr.dir : Math.min(...tr.cars.map(c => c.x)) + tr.off * tr.dir;
    const reach = tr.dir > 0 ? front >= e.x - e.drawWidth * .3 : front <= e.x + e.drawWidth * .3;
    if (reach || tr.state !== 'arrive') rkRamHit(K, e, tr.dir || 1);
    return;
  }
  K.t += dt;
  if (K.t >= RAT_KING.ram.fly) { K.phase = 'dead'; K.flyDone = true; }
}
function rkRamHit(K, e, dir = 1) {
  K.hit = true; K.t = 0; K.flyDir = dir;
  e.rkRammed = true; e.hp = 0; e.rkStunT = 0;
  if (typeof addShake === 'function') addShake(16);
  if (typeof addHitstop === 'function') addHitstop(.09);
  rkSound('bigBoom', e.x, e.y, 1.1); rkSound('mouseDeath', e.x, e.y, 1.2);
  for (let k = 0; k < 4; k++) rkDirt(e.x + rkRand(-2, 2) * CELL, rkEdgeY(), 1.6);
  G.effects.push({ ring: true, x: e.x, y: rkEdgeY(), r: 10, r2: 220, life: .5, life0: .5, color: '#ffd28a' });
  // 照一般怪物死掉的流程：掉碎片、記擊殺、圖鑑、特別獎金（game.js 的死亡判斷；這時已經不在 G.enemies 裡，這裡自己跑一次）
  e.dead = true;
  if (!(typeof practiceOn === 'function' && practiceOn()) && typeof dropShard === 'function') dropShard(e.x, rkEdgeY() + CELL, e.crystals ?? 5, 1);
  if (G.battle) { const nm = monsterNameOf(e); G.battle.kills[nm] = (G.battle.kills[nm] || 0) + 1; }
  if (typeof onEnemyDeath === 'function') onEnemyDeath(e);
  if (typeof questEvent === 'function') questEvent('kill', { monster: e.type });
}
// ---- 倒下（combat-feel.js 的 onEnemyDeath 呼叫）----
function ratKingDown(e) {
  systemNotice(RAT_KING.name + '被列車撞飛了！', true);
  if (typeof coreBanner === 'function') coreBanner(RAT_KING.name + '被撞飛了', '列車恢復通行', '#f0a3c8');
}

// ---- 特效：鐵軌冒土 ----
function rkDirt(x, y, size = 1) {
  if (typeof rockBurstFx === 'function') rockBurstFx(x, y - 4, { rocks: Math.round(6 * size), speed: [40, 140], up: [90, 220], dust: Math.round(3 * size), dustRise: 2, size, spread: 20 });
}
function updateRkFx(dt) {
  const e = G.ratKing && G.ratKing.e;
  if (e && e.rkArmorFlash > 0) e.rkArmorFlash -= dt;
}

// ---- BOSS 血條（js/core-frenzy.js）、BOSS 音樂（js/boss-music.js）----
function ratKingBars() {
  const K = G && G.ratKing, e = K && K.e;
  if (!rkAlive(e) || !e.eliteAwake) return [];
  const armor = Math.round((1 - ratKingDamageMul(e)) * 100);
  const tag = e.rkStunT > 0 ? '（暈倒・傷害加倍）' : armor > 0 ? '（核心護甲 ' + armor + '%）' : e.rkEnraged ? '（暴怒）' : '';
  return [{ label: RAT_KING.name + tag, ratio: e.hp / e.maxhp, hit: e.hitT > 0, colors: ['#7a2e55', '#f0a3c8'], frame: '#d95a9a', text: '#ffe0f0' }];
}
const ratKingHunting = () => { const K = G && G.ratKing; return !!(K && rkAlive(K.e) && K.e.eliteAwake); };

// ---- 畫圖 ----
// 老鼠王本體（render.js 的 drawEnemy 呼叫；被撞飛時由 ratKingSortables 畫）
function drawRatKing(c, e) {
  const B = RAT_KING, S = B.scale, w = 110 * S, h = 90 * S, edge = rkEdgeY();
  const art = rkArt(), t = performance.now() / 1000;
  const K = G.ratKing, flying = K && K.phase === 'ram' && K.hit;
  let file = burrowMouseBlinkFrame(art, e.rkAge || 0);
  const dizzy = e.rkStunT > 0 || e.rkDying;
  if (dizzy) { const slot = Math.floor(t / .22); file = art['dizzy' + (1 + Math.floor(Math.abs(Math.sin(slot * 12.9898) * 43758.5453) % 1 * 4))]; }
  const img = monsterImage(file); if (!img || !img.complete || !img.naturalWidth) return;
  const top = edge - B.showRow * S + (1 - (e.rkRise ?? 1)) * B.showRow * S;   // 冒出來的過程：從月台邊緣往上升
  c.save();
  c.imageSmoothingEnabled = false;
  if (flying) {   // 被撞飛：往列車開的方向飛出去、往上拋、旋轉、慢慢淡掉
    const k = Math.min(1, K.t / B.ram.fly), dir = K.flyDir || 1;
    c.globalAlpha = 1 - k;
    const fx = e.x + dir * k * 14 * CELL, fy = top + h / 2 - Math.sin(k * Math.PI) * 6 * CELL - k * 4 * CELL;
    c.translate(fx, fy); c.rotate(dir * k * 7); c.drawImage(img, -w / 2, -h / 2, w, h);
    c.restore(); return;
  }
  c.beginPath(); c.rect(e.x - w, edge - h * 2, w * 2, h * 2); c.clip();   // 月台邊緣以下不畫（被月台擋住）
  if (e.hitT > 0) c.translate((Math.random() * 2 - 1) * 3, 0);
  if (dizzy) { c.translate(e.x, edge); c.rotate(Math.sin(t * 5) * .04); c.translate(-e.x, -edge); }
  // 核心護甲：身體外圍一圈紫光（越多核心越亮）；剛被護甲擋掉傷害時閃一下
  const armor = 1 - ratKingDamageMul(e);
  if (armor > 0 && !(e.rkStunT > 0)) { c.shadowColor = 'rgba(176,110,255,' + Math.min(1, .45 + armor * .6 + (e.rkArmorFlash > 0 ? .4 : 0)) + ')'; c.shadowBlur = 18 + armor * 22; }
  else if (e.rkEnraged) { c.shadowColor = 'rgba(255,80,60,' + (.55 + .3 * Math.sin(t * 7)) + ')'; c.shadowBlur = 26; }
  c.drawImage(img, e.x - w / 2, top, w, h);
  c.shadowBlur = 0;
  if (e.hitT > 0) { c.globalAlpha = .35; c.globalCompositeOperation = 'lighter'; c.drawImage(img, e.x - w / 2, top, w, h); }
  c.restore();
  if (dizzy && typeof drawBurrowDizzyStars === 'function' && !flying) drawBurrowDizzyStars(c, e.x, top + 8 * S, S * .9, t);
}
// 一隻手：照花蓮版權老鼠同一套出土遮罩畫（js/burrowing-mouse.js 的 drawBurrowMasked），拳頭換成 left-fist.png
function rkHandPose(h) {
  const t = h.age - h.windup, up = h.rise, top = h.rise + h.hold;
  const reveal = t < 0 ? 0 : t < up ? burrowEase(t / up) : t < top ? 1 : 1 - burrowEase((t - top) / Math.max(.01, h.sink));
  return { reveal, open: t < 0 ? burrowEase(h.age / h.windup) : 1, crack: 0, stretch: t >= up && t < up + .15 ? 1 + .08 * Math.sin((t - up) / .15 * Math.PI) : 1 };
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
        ctx.drawImage(coreImg, left + gx * sx - cw / 2, top + gy * sy - ch / 2, cw, ch);
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
// 這隻手現在握著誰：抓到還沒拖下去的、正在拖下去的、正要吐出來的
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
// 預警圈：拳頭橘色、抓人紫色、搬核心淡紫
function drawRkWarning(c, h) {
  if (h.age >= h.windup + h.rise) return;
  const k = Math.min(1, h.age / Math.max(.01, h.windup));
  const R = (h.kind === 'grab' ? RAT_KING.grab.radius : h.kind === 'punch' ? RAT_KING.punch.radius : 1.4) * CELL, o = rkHandSpot(h);
  const col = h.kind === 'grab' ? ['#c58bff', '#9b4dff'] : h.kind === 'punch' ? ['#ff986c', '#e96b4a'] : ['#d9c2ff', '#8c6bbf'];
  c.save(); c.strokeStyle = col[0]; c.fillStyle = col[1]; c.lineWidth = 2;
  c.globalAlpha = .18 + .14 * k; c.beginPath(); c.ellipse(o.x, o.y, R, R * .48, 0, 0, Math.PI * 2); c.fill();
  c.globalAlpha = .85; c.beginPath(); c.ellipse(o.x, o.y, R * (1.5 - k * .5), R * .48 * (1.5 - k * .5), 0, 0, Math.PI * 2); c.stroke();
  c.restore();
}
// 地上：預警圈、核心連到老鼠王的紫色光線（js/render.js 的 groundFx 呼叫）
function drawRatKingGround(c) {
  const K = G && G.ratKing; if (!K) return;
  if (typeof fxSkip === 'function' && fxSkip(1)) return;
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
// 手、被撞飛的本體：跟人一起排前後（render.js 呼叫）
function ratKingSortables(list) {
  const K = G && G.ratKing; if (!K) return;
  for (const h of K.hands) if (h.age >= h.windup * .5) list.push({ floor: 1, y: h.y + 13, draw: () => drawRkHand(ctx, h) });
  if (K.phase === 'ram' && K.e) list.push({ floor: 1, y: rkEdgeY() + (K.hit ? 400 : 0), draw: () => drawRatKing(ctx, K.e) });   // 被撞飛：畫在最前面
}
