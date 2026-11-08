/* ===== 森林的垂吊藤蔓（地圖編輯器「🌿 藤蔓」擺放）=====
   ・藤蔓從畫面上方垂下來，尖端垂到地面那一格；溫特靠近時尖端會抽動（預告）
   ・溫特或隊友碰到尖端：被纏住 → 翻成頭下腳上、往上捲，越拉越大（往鏡頭靠近）、太近就淡掉（鏡頭停在原地）→ 在畫面外吊 VINES.awayTime 秒（隊友 VINES.mateAwayTime 秒）
     → 從畫面上方被丟回附近的地面（摔一下扣一點血、頭暈一下）
   ・被吊走的期間：不能動、不能攻擊，怪物打不到（扣的血會補回來）；鏡頭只有溫特被抓時才會停住
   ・剛摔下來的人 VINES.safeTime 秒內不會又被抓
   ・藤蔓抓過人會縮上去，VINES.regrowTime 秒後再慢慢垂下來
   ・倒吊藤蔓（地圖編輯器「🪢 倒吊藤蔓」）：抓到隊友不丟下來，而是把他倒吊在半空中晃來晃去；
     溫特要開槍把藤蔓打斷（VINES.hangHits 發）才能救下來。溫特碰到倒吊藤蔓照樣被捲走、丟回來
   ・藤蔓怕火：被火海（燃燒彈、油桶）或希奧妮的火燒到就縮回去，VINES.fireRegrow 秒後才重新垂下來；
     正在纏人、倒吊隊友的藤蔓被燒到會放開（倒吊的隊友會掉下來）
   ・藤蔓尖端正下方的地上有影子，看得出藤蔓垂在哪裡
   ・傳送藤蔓（地圖編輯器「🌿➡ 傳送藤蔓」，MAP.vinesFerry）：抓到人丟到編輯器設的落點（走不過去的地方靠它過去）；
     溫特被抓時，跟在身邊的隊友也各被一條藤蔓捲走、一個接一個丟到落點旁邊。摔下來扣 VINES.ferryFallDamage（預設 0）
   藤蔓圖：images/森林/vine.png（VINE_IMG）；被抓時身上的纏繞用絲瓜小姐的 drawWrap（js/loofah-lady.js）
   必須在 js/render.js、js/enemy-ai.js、js/combat-feel.js、js/loofah-lady.js 之後載入、js/grab.js 之前載入（會包住 drawPlayer、drawTower、enemyAttackPlayer、hurtGraceBlocked）。
*/
// 人物身上的位置（從腳底中心 a.y 往上量，像素）：翻轉、放大的軸心，藤蔓接在腰、翻過來接在腳
const VINE_BODY = { pivot: 18, waist: 15, feet: 34 };
const VINES = {
  grabR: 18,         // 溫特、隊友腳底離藤蔓尖端多近算碰到（像素，一格 40）
  warnR: 90,         // 靠多近藤蔓尖端開始抽動
  wrapTime: .5,      // 纏住幾秒後開始往上拉
  liftTime: 1.2,     // 往上拉出畫面要幾秒
  awayTime: 3,       // 溫特在畫面外被吊幾秒
  mateAwayTime: 10,  // 隊友在畫面外被吊幾秒（被捲走比較久才回來）
  dropMin: 3,        // 丟回地面：離被抓的地方至少幾格
  dropMax: 6,        //               最多幾格
  fallDamage: 10,    // 摔下來扣多少 HP（不會摔死，最少留 1）
  dazeTime: 2,       // 落地後躺在地上暈幾秒（最後 getUpTime 秒是爬起來的動作）
  getUpTime: .45,    // 爬起來要幾秒
  lieTime: .15,      // 摔到地上、倒下去要幾秒
  safeTime: 3,       // 落地後幾秒內不會又被藤蔓抓
  regrowTime: 8,     // 抓過人縮上去後，幾秒再垂下來
  descendTime: 1.6,  // 重新垂下來要幾秒
  sway: 9,           // 尖端左右晃多大（像素）
  gravity: 1700,     // 被丟下來的重力
  bounces: [.32, .5], // 掉到地上彈幾下才倒下：每一下剩多少速度（越大彈越高；第一下約 30 像素高、第二下約 8 像素）
  flipTime: .35,     // 往上拉一開始，幾秒翻成頭下腳上
  nearScale: 1.2,    // 假 3D：往上拉到最高、垂著的藤蔓到畫面下緣時放大幾倍（像往鏡頭靠近；原本 2.6，使用者要減弱一半）
  fadeFrom: .55,     //        拉到幾成開始淡掉（太靠近鏡頭就消失）
  depthStart: .55,   // 垂著的藤蔓景深：尖端在畫面幾成高度以下開始變大（.5＝畫面正中間，溫特站的地方）
  depthEnd: 1.05,    //                到畫面幾成高度最大（1＝畫面下緣）
  depthNear: 1,      //                到最下面時算多靠近鏡頭（1＝跟 nearScale 一樣大、完全淡掉）
  color: '#3f6b2a', dark: '#24401a', leaf: '#5d9a3a',
  // 被抓時身上纏繞的顏色（絲瓜藤的畫法，但改成橄欖綠，跟藤蔓圖搭）
  wrapCol: { line: '#1e220c', fill: '#7a8432', light: '#a6ae52', back: '#555c22' },   // 橄欖綠
  starDx: -10,       // 暈眩星星：往頭那一邊的反方向挪幾像素（往右倒＝往左挪，往左倒自動鏡射）
  starDy: -10,       //           往上挪幾像素（負的＝往上）
  // 倒吊藤蔓
  hangH: 70,         // 隊友被倒吊在離地多高（像素）
  hangLiftTime: .9,  // 拉上去要幾秒
  hangSwing: 12,     // 倒吊時左右晃多大（像素）
  hangHits: 3,       // 溫特要打中幾發才打得斷
  // 怕火
  fireR: 34,         // 火海離藤蔓尖端（或被倒吊的隊友正下方）多近算燒到（像素）
  fireRegrow: 60,    // 被火燒到縮回去後，幾秒才重新垂下來
  retractTime: .6,   // 縮回去要幾秒
  // 地上的影子（藤蔓尖端正下方）
  shadowW: 16, shadowH: 6, shadowAlpha: .32,
  // 傳送藤蔓（地圖編輯器「🌿➡ 傳送藤蔓」）：抓到人丟到指定的落點（過不去的地方靠它過去）
  ferryFallDamage: 0,   // 被丟過去摔下來扣多少 HP（這是必經的路，預設不扣血；照樣躺著暈一下）
  ferryMateGap: .4,     // 跟著溫特一起被捲過去的隊友：一個接一個掉下來，每人間隔幾秒
};

// ---- 開場：照地圖上的 MAP.vines ['欄,列'…] 擺藤蔓 ----
// G.vineCaps：正在被藤蔓抓著的人（溫特、隊友各自一筆）{ v, actor, isPlayer, phase, t, h, x0, y0, hp, … }
function seedVines() {
  G.vines = []; G.vineCaps = [];
  for (const a of [G.player, ...(G.towers || [])]) if (a) { a.vineCap = false; a.vineDazeT = 0; a.vineSafeT = 0; }
  if (MAP_SAFE || !MAP) return;
  // MAP.vines＝一般藤蔓（捲走再丟回來）、MAP.vinesHang＝倒吊藤蔓（把隊友吊在半空中）
  for (const [list, kind] of [[MAP.vines, 'toss'], [MAP.vinesHang, 'hang']]) {
    if (!Array.isArray(list)) continue;
    for (const key of list) {
      const [c, r] = key.split(',').map(Number);
      if (!inGrid(c, r)) continue;
      const [x, cy] = center(c, r);
      G.vines.push({ c, r, x, y: cy + 6, kind, state: 'hang', t: 0, len: 1, seed: Math.random() * 10, twitch: 0 });
    }
  }
  // MAP.vinesFerry＝傳送藤蔓 [{ at: '欄,列', to: '欄,列' }]：抓到人丟到 to 那一格
  for (const f of Array.isArray(MAP.vinesFerry) ? MAP.vinesFerry : []) {
    const [c, r] = String(f.at || '').split(',').map(Number), to = String(f.to || '').split(',').map(Number);
    if (!inGrid(c, r) || !inGrid(to[0], to[1])) continue;
    const [x, cy] = center(c, r);
    G.vines.push({ c, r, x, y: cy + 6, kind: 'ferry', to, state: 'hang', t: 0, len: 1, seed: Math.random() * 10, twitch: 0 });
  }
}

function vineTip(v, now) {   // 尖端位置（會晃）
  const sw = Math.sin(now * .9 + v.seed) * VINES.sway + Math.sin(now * 2.3 + v.seed * 2) * VINES.sway * .3;
  const tw = v.twitch > 0 ? Math.sin(now * 38 + v.seed) * 4 * v.twitch : 0;
  return { x: v.x + sw + tw, y: v.y };
}
const vineCapOf = a => (G && G.vineCaps && a && a.vineCap) ? G.vineCaps.find(c => c.actor === a) || null : null;
const vineHolding = () => !!vineCapOf(G && G.player);
// 這個人現在能不能被藤蔓抓
function vineCanGrab(a, isPlayer) {
  if (!a || a.hp <= 0 || a.vineCap || a.vineDazeT > 0 || a.vineSafeT > 0 || a.mrtRide) return false;
  if (isPlayer) return !G.playerDeath;
  return !a.grabbed && !a.grabFall && !a.eatenBy && !a.sitting && !a.berserk;
}

// ---- 每幀（js/game.js 的 update 最後呼叫）----
function updateVines(dt) {
  if (!G || !G.vines) return;
  if (!G.vineCaps) G.vineCaps = [];
  const p = G.player, now = performance.now() / 1000;
  const people = [p, ...(G.towers || [])].filter(Boolean);
  for (const a of people) {
    if (a.vineDazeT > 0) a.vineDazeT = Math.max(0, a.vineDazeT - dt);
    if (a.vineSafeT > 0) a.vineSafeT = Math.max(0, a.vineSafeT - dt);
  }
  for (const v of G.vines) {
    v.twitch = Math.max(0, v.twitch - dt * 2);
    if (v.state === 'gone') { if ((v.t -= dt) <= 0) { v.state = 'descend'; v.t = 0; v.len = 0; } continue; }
    if (v.state === 'retract') { v.len -= dt / VINES.retractTime; if (v.len <= 0) { v.len = 0; v.state = 'gone'; v.t = v.regrowAfter || VINES.regrowTime; } continue; }
    if (vineTouchesFire(v)) { vineScorch(v); continue; }   // 怕火：燒到就縮回去
    if (v.state === 'descend') { v.len = Math.min(1, v.len + dt / VINES.descendTime); if (v.len >= 1) v.state = 'hang'; continue; }
    if (v.state !== 'hang' || G.over) continue;
    const tip = vineTip(v, now);
    for (const a of people) {
      const isPlayer = a === p;
      if (!vineCanGrab(a, isPlayer)) continue;
      const d = Math.hypot(a.x - tip.x, (a.y + 12 - tip.y) * 1.3);
      if (d < VINES.warnR) v.twitch = Math.max(v.twitch, 1 - d / VINES.warnR);
      if (d <= VINES.grabR) { vineGrab(v, a, isPlayer); break; }
    }
  }
  for (let i = G.vineCaps.length - 1; i >= 0; i--) {
    const cap = G.vineCaps[i], a = cap.actor;
    if (!people.includes(a) || (cap.isPlayer && a !== p)) { a.vineCap = false; G.vineCaps.splice(i, 1); continue; }   // 換地圖、隊友離隊
    stepVineCap(cap, a, dt);
  }
}

function stepVineCap(cap, a, dt) {
  cap.t += dt;
  if (a.hp < cap.hp) a.hp = cap.hp; else cap.hp = a.hp;   // 被吊著的時候不會被打到（扣了也補回來）
  a.knockT = 0; a.rootT = 0; a.moving = false; a.anim = 0; a.dir = 'front';
  if (!cap.isPlayer) { a.navPath = null; a.navGoal = null; a.meleeSwing = null; a.gunSwing = null; }
  if (cap.phase !== 'fall') { a.x = cap.x0; a.y = cap.y0; }
  if (cap.phase === 'wrap') {
    if (cap.t >= VINES.wrapTime) { cap.phase = 'lift'; cap.t = 0; cap.v.state = 'lift'; sfxAt('vineLift', a.x, a.y, .5); }
  } else if (cap.phase === 'lift' && cap.mode === 'hang') {   // 倒吊藤蔓：拉到半空中就停住
    const k = Math.min(1, cap.t / VINES.hangLiftTime);
    cap.h = VINES.hangH * (1 - Math.pow(1 - k, 3));
    if (k >= 1) { cap.phase = 'hang'; cap.t = 0; cap.hits = 0; }
  } else if (cap.phase === 'hang') {   // 倒吊中：一直吊著，等溫特把藤蔓打斷（或藤蔓被火燒到）
    cap.h = VINES.hangH;
  } else if (cap.phase === 'lift') {
    const k = Math.min(1, cap.t / VINES.liftTime);
    cap.topH = Math.max(cap.topH, (a.y - cam.y) + 110);   // 鏡頭跟著溫特動：隊友要拉到「現在」的畫面上緣外面
    cap.h = cap.topH * k * k * (1.4 - .4 * k);   // 一開始慢、越拉越快
    if (k >= 1) { cap.phase = 'away'; cap.t = 0; cap.v.state = 'gone'; cap.v.t = VINES.regrowTime; if (cap.mode === 'ferry') pickFerryDrop(cap); else pickVineDrop(cap); }
  } else if (cap.phase === 'away') {
    if (cap.t >= (cap.awayT ?? (cap.isPlayer ? VINES.awayTime : VINES.mateAwayTime))) {
      cap.phase = 'fall'; cap.t = 0; cap.fallV = 0;
      a.x = cap.dropX; a.y = cap.dropY;
      cap.h = Math.max(160, (a.y - cam.y) + 90);   // 從畫面上緣外面掉下來
      cap.fallH0 = cap.h;
      cap.lieSide = Math.random() < .5 ? -1 : 1;   // 掉下來時翻成躺的姿勢：往左或往右躺
      if (cap.isPlayer) flash('被丟下來了！', a.x, a.y - 60, '#c6f08a', .8);
    }
  } else if (cap.phase === 'fall') {
    cap.fallV += VINES.gravity * dt; cap.h -= cap.fallV * dt;
    if (cap.h <= 0) {
      const n = cap.bounces || 0;
      if (n < VINES.bounces.length && cap.fallV > 120) {   // 落地彈起來（一次比一次低），最後才倒下
        cap.h = 0; cap.fallV = -cap.fallV * VINES.bounces[n]; cap.bounces = n + 1; a.vineBounced = true;
        if (n === 0) { G.effects.push({ ring: true, x: a.x, y: a.y + 14, r: 6, r2: 30, life: .35, life0: .35, color: '#d8dee6' }); vineHitSound(cap); }
        sfxAt('vineLand', a.x, a.y, (cap.isPlayer ? .8 : .55) * (n === 0 ? 1 : .45));
      } else vineLand(a, cap);
    }
  }
}

function vineGrab(v, a, isPlayer) {
  if (typeof cancelChannel === 'function' && typeof playerChannel !== 'undefined' && playerChannel && (isPlayer || playerChannel.target === a)) cancelChannel();
  if (isPlayer && a.sitting && typeof standUp === 'function') standUp();
  if (!isPlayer && typeof assigning !== 'undefined' && assigning === a) assigning = null;
  v.state = 'grab';
  const mode = v.kind === 'ferry' ? 'ferry' : v.kind === 'hang' && !isPlayer ? 'hang' : 'toss';
  const cap = { v, actor: a, isPlayer, mode, phase: 'wrap', t: 0, h: 0, x0: a.x, y0: a.y, hp: a.hp, camX: cam.x, camY: cam.y,
    topH: (a.y - cam.y) + 110 };   // 拉到畫面上緣外面
  if (mode === 'ferry') { cap.to = v.to; cap.awayT = VINES.awayTime; }
  G.vineCaps.push(cap);
  a.vineCap = true; a.dashT = 0;
  if (isPlayer) { flash('被藤蔓抓住了！', a.x, a.y - 56, '#9fe07a', .9); addShake(3); }
  else if (!(typeof mateHurtSay === 'function' && mateHurtSay(a, 'vineGrab'))) sentryStatus(a, '被藤蔓抓住了！', '#9fe07a', true);   // 對話編輯器「被森林藤蔓抓走」；沒填台詞就照舊跳狀態字
  sfxAt('vineGrab', a.x, a.y, .8);
  if (mode === 'ferry' && isPlayer) ferryFollowers(v, a);
}
// 傳送藤蔓抓到溫特：跟在身邊的隊友（護衛中、或離溫特 WARP_FOLLOW_CELLS 格內）也各被一條藤蔓捲走，一起丟到對面（不然隊友會卡在這一邊）
function ferryFollowers(v, p) {
  const near = typeof WARP_FOLLOW_CELLS !== 'undefined' ? WARP_FOLLOW_CELLS : 4;
  const mates = (G.towers || []).filter(t => vineCanGrab(t, false) && (t.mode === 'escort' || Math.hypot(t.x - p.x, t.y - p.y) <= near * CELL));
  mates.forEach((t, i) => {
    const own = { x: t.x, y: t.y, kind: 'ferry', to: v.to, state: 'grab', t: 0, len: 1, seed: Math.random() * 10, twitch: 0, temp: true };   // 每人一條（不放進 G.vines：用完就不見）
    vineGrab(own, t, false);
    const cap = G.vineCaps[G.vineCaps.length - 1];
    if (cap && cap.actor === t) cap.awayT = VINES.awayTime + VINES.ferryMateGap * (i + 1);   // 溫特先落地，隊友一個接一個掉下來
  });
}

// ---- 怕火：火海碰到藤蔓尖端（或倒吊的隊友正下方）就縮回去 ----
function vineFireAt(x, y) {
  if (typeof anyFireAt === 'function') return !!anyFireAt(x, y, VINES.fireR);   // 火海＋希奧妮的火（js/oil-barrels.js）
  for (const f of G.oilFires || []) if (f.t > 0 && Math.hypot(x - f.x, (y - f.y) / .7) <= f.r + VINES.fireR) return true;
  return false;
}
function vineHeldCap(v) { return G.vineCaps.find(c => c.v === v && (c.phase === 'wrap' || c.phase === 'hang')) || null; }   // 正在纏人、倒吊隊友
function vineTouchesFire(v) {
  if (v.state === 'hang' || v.state === 'descend') return vineFireAt(v.x, v.y);
  const cap = vineHeldCap(v);
  return !!(cap && vineFireAt(cap.actor.x, cap.actor.y));
}
function vineScorch(v) {
  const cap = vineHeldCap(v);
  if (cap) {
    if (cap.phase === 'hang') vineDropHung(cap);   // 倒吊的隊友掉下來
    else { G.vineCaps = G.vineCaps.filter(c => c !== cap); cap.actor.vineCap = false; cap.actor.vineSafeT = VINES.safeTime; }   // 還沒拉上去：直接放開
  }
  v.state = 'retract'; v.regrowAfter = VINES.fireRegrow; v.twitch = 1;
  const tipY = cap ? cap.actor.y - (cap.h || 0) - 30 : v.y;
  for (let i = 0; i < 3; i++) spawnFlameBurst(v.x + (Math.random() * 2 - 1) * 8, tipY - Math.random() * 20, .6);
  if (typeof sfxAt === 'function') sfxAt('hitIncendiary', v.x, v.y, .35, 'vine-scorch');
}

// ---- 倒吊藤蔓：溫特開槍打斷 ----
// 游標點在被倒吊的隊友（或他上面那一段藤蔓）身上、在手槍射程內、看得到：這一槍打藤蔓（js/game.js 的 updatePlayerAttack 呼叫）
function vineHangShotTarget(aim) {
  const p = G && G.player; if (!p || !G.vineCaps) return null;
  for (const cap of G.vineCaps) {
    if (cap.phase !== 'hang') continue;
    const a = cap.actor, bx = a.x + (cap.sx || 0), top = a.y - cap.h - 80, bottom = a.y - cap.h + 20;
    if (Math.abs(aim.x - bx) > 22 || aim.y < top || aim.y > bottom) continue;
    if (Math.hypot(a.x - p.x, a.y - p.y) > PLAYER_ATK.range * CELL || !hasLineOfSight(p.x, p.y, a.x, a.y)) continue;
    return cap;
  }
  return null;
}
function shootHangVine(p, cap, aim, aimAng) {
  const a = cap.actor, hx = a.x + (cap.sx || 0), hy = a.y - cap.h - VINE_BODY.feet - 12;   // 子彈打在腳上面那一段藤蔓
  const m = gunMuzzleAt(p, aimAng), mx = m.x, my = m.y;
  G.effects.push({ muzzle: true, x: mx, y: my, ang: aimAng, life: .07, life0: .07 });
  addLightFlash('muzzle', mx, my);
  spawnShellCasing(mx, my, aimAng);
  G.effects.push({ bullet: true, x1: mx, y1: my, x2: hx, y2: hy, life: .07, life0: .07, color: '#ffe79a' });
  G.effects.push({ ring: true, x: hx, y: hy, r: 2, r2: 9, life: .14, life0: .14, color: '#a6ae52' });
  sfx('shotPistol');
  for (let i = 0; i < 4; i++) G.effects.push({ particle: true, kind: 'spark', x: hx, y: hy, vx: (Math.random() - .5) * 90, vy: -(10 + Math.random() * 40), r: 1.5 + Math.random(), life: .35, life0: .35, color: i % 2 ? '#7a8432' : '#a6ae52' });
  if (typeof sfxAt === 'function') sfxAt('knock2', hx, hy, .3, 'vine-hit');
  cap.hits = (cap.hits || 0) + 1; cap.kick = aim.x < a.x ? 1 : -1;   // 被打中：晃一下
  if (cap.hits >= VINES.hangHits) {
    vineDropHung(cap); cap.v.state = 'retract'; cap.v.len = 1; cap.v.regrowAfter = VINES.regrowTime;
    if (typeof sfxAt === 'function') sfxAt('swordSwing', hx, hy, .4, 'vine-snap');
  }
  if (p.ammo <= 0) startReload(p);
  else if (PLAYER_ATK.double && Math.random() < PLAYER_ATK.double) p.atkCd = .07;
}
// 倒吊的隊友掉下來（藤蔓被打斷或被火燒到）：從半空中翻成躺的姿勢掉到地上，跟被丟下來一樣彈兩下、躺著暈
function vineDropHung(cap) {
  const a = cap.actor;
  cap.phase = 'fall'; cap.t = 0; cap.fallV = 0; cap.cut = true;
  cap.fallH0 = Math.max(1, cap.h); cap.lieSide = Math.random() < .5 ? -1 : 1;
  if (cap.v.state !== 'retract') { cap.v.state = 'retract'; cap.v.len = 1; }
  for (let i = 0; i < 10; i++) {
    const ang = Math.random() * Math.PI * 2, sp = 50 + Math.random() * 80;
    G.effects.push({ particle: true, kind: 'spark', x: a.x, y: a.y - cap.h - 30, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp * .6 - 30, r: 2 + Math.random() * 1.5, life: .45, life0: .45, color: i % 2 ? '#7a8432' : '#a6ae52' });
  }
}

// 丟回去的地方：離被抓的地方 dropMin～dropMax 格、走得到、旁邊沒有別的藤蔓
function pickVineDrop(cap) {
  const near = (x, y) => G.vines.some(v => v.state !== 'gone' && Math.hypot(v.x - x, v.y - y) < CELL * 1.6);
  const blocked = cap.isPlayer ? playerBlocked : (typeof sentryBlocked === 'function' ? sentryBlocked : playerBlocked);
  for (let i = 0; i < 80; i++) {
    const a = Math.random() * Math.PI * 2, d = (VINES.dropMin + Math.random() * (VINES.dropMax - VINES.dropMin)) * CELL * (i < 60 ? 1 : .5);
    const x = cap.x0 + Math.cos(a) * d, y = cap.y0 + Math.sin(a) * d, [c, r] = cellAt(x, y);
    if (!inGrid(c, r) || blocked(x, y) || near(x, y)) continue;
    cap.dropX = x; cap.dropY = y; return;
  }
  cap.dropX = cap.x0; cap.dropY = cap.y0;   // 找不到：丟回原地
}
// 傳送藤蔓的落點：編輯器設的那一格；已經有人要掉在那裡就往外一圈一圈找空的、走得到的格子（一人一格）
function pickFerryDrop(cap) {
  const blocked = cap.isPlayer ? playerBlocked : (typeof sentryBlocked === 'function' ? sentryBlocked : playerBlocked);
  const [tc, tr] = cap.to;
  const taken = G.vineCaps.filter(c => c !== cap && c.mode === 'ferry' && c.dropX != null).map(c => cellAt(c.dropX, c.dropY).join(','));
  for (let radius = 0; radius <= 4; radius++) {
    for (let dr = -radius; dr <= radius; dr++) for (let dc = -radius; dc <= radius; dc++) {
      if (Math.max(Math.abs(dc), Math.abs(dr)) !== radius) continue;
      const c = tc + dc, r = tr + dr;
      if (!inGrid(c, r) || taken.includes(c + ',' + r)) continue;
      const [x, y] = center(c, r);
      if (blocked(x, y)) continue;
      cap.dropX = x; cap.dropY = y; return;
    }
  }
  const [x, y] = center(tc, tr); cap.dropX = x; cap.dropY = y;   // 都滿了：照樣丟在落點
}

// 溫特摔到地上：播共通的「溫特受傷」音效（js/game.js 的 playPlayerHit；音效編輯器的「溫特受傷」）
function vineHitSound(cap) {
  if (cap.isPlayer && typeof playPlayerHit === 'function') playPlayerHit();
}

function vineLand(a, cap) {
  G.vineCaps = G.vineCaps.filter(c => c !== cap); a.vineCap = false;
  a.vineDazeT = VINES.dazeTime;
  a.vineSafeT = VINES.safeTime;   // 剛摔下來：一陣子不會又被抓
  const dmg = Math.min(cap.mode === 'ferry' ? VINES.ferryFallDamage : VINES.fallDamage, Math.max(0, a.hp - 1));
  if (dmg > 0 && !(typeof practiceOn === 'function' && practiceOn())) {
    a.hp -= dmg;   // 不閃紅
    flashDmg('-' + dmg, a.x, a.y - 46, '#ff6b6b');
  }
  a.vineLieSide = cap.lieSide || (Math.random() < .5 ? -1 : 1);   // 往左或往右躺（掉下來時就已經躺好了）
  a.vineLieInstant = true; a.vineBounced = false;
  if (!cap.bounces) G.effects.push({ ring: true, x: a.x, y: a.y + 14, r: 6, r2: 30, life: .35, life0: .35, color: '#d8dee6' });
  a.dir = 'front'; a.moving = false; a.anim = 0;   // 正面躺下（閉眼圖是正面的）
  if (!cap.isPlayer) {
    a.navPath = null; a.navGoal = null; a.target = null;
    if (typeof mateHurtSay === 'function') { if (a.mateHurt) a.mateHurt.hp = a.hp; mateHurtSay(a, 'vineLand'); }   // 對話編輯器「被藤蔓丟下來」（先記住摔完的血量，免得又喊一般被打）
  }   // 落地不震動畫面
  if (!cap.bounces) { sfxAt('vineLand', a.x, a.y, cap.isPlayer ? .8 : .55); vineHitSound(cap); }
}

// ---- 鏡頭：溫特被拉走的時候停在原地，吊在外面時慢慢移到要被丟下去的地方（js/game.js 的 updateCamera 呼叫）----
function vineCameraHold() {
  const cap = vineCapOf(G && G.player);
  if (!cap || cap.phase === 'fall') return false;
  if (cap.phase === 'away') {
    const mapW = COLS * CELL, mapH = ROWS * CELL, vw = viewW(), vh = viewH();
    let tx = Math.max(0, Math.min(mapW - vw, cap.dropX - vw / 2)), ty = Math.max(0, Math.min(mapH - vh, cap.dropY - vh / 2));
    if (mapW <= vw) tx = (mapW - vw) / 2;
    if (mapH <= vh) ty = (mapH - vh) / 2;
    const k = Math.min(1, cap.t / (VINES.awayTime * .8)), e = k * k * (3 - 2 * k);
    cam.x = cap.camX + (tx - cap.camX) * e; cam.y = cap.camY + (ty - cap.camY) * e;
  } else { cam.x = cap.camX; cam.y = cap.camY; }
  return true;
}

// ---- 藤蔓素材圖（images/森林/vine.png，80×701）----
//      最上面是樹枝（不畫）、中間彎曲的藤、最下面捲起來的尖端。畫面比圖長時，把中間 VINE_IMG.loop 那一段往上接（接縫已對齊）。
const VINE_IMG = {
  src: 'images/森林/vine.png',
  tipX: 38,            // 尖端捲鬚在圖上的橫向位置（像素）
  start: 189,          // 從圖的第幾列開始畫（上面是樹枝）
  loop: [189, 302],    // 往上接的那一段（這兩列的藤蔓位置剛好對齊，接起來看不出來）
  cutTip: 660,         // 抓著人的時候：畫到第幾列（不畫最下面的捲鬚，藤蔓接進身上的纏繞）
};
const vineImg = new Image();
vineImg.src = encodeURI(VINE_IMG.src);
const vineImgReady = () => vineImg.complete && vineImg.naturalWidth > 0;

// 從畫面上緣垂到 (tx, ty)：整條像鐘擺一樣斜過去（上面不動、越下面晃越多）
// cut＝抓著人：圖畫到 VINE_IMG.cutTip 那一列就停（ty 是那一列的位置）
// scale＝往鏡頭靠近時放大（以尖端為軸；上緣照樣接到畫面外）
function drawVineStem(ctx, v, tx, ty, now, cut, scale = 1) {
  if (!vineImgReady()) return drawVineStemFallback(ctx, v, tx, ty, now, cut);
  const topY = cam.y - 30, L = ty - topY;
  if (L <= 4) return;
  const W = vineImg.naturalWidth, end = cut ? VINE_IMG.cutTip : vineImg.naturalHeight;
  const [l0, l1] = VINE_IMG.loop, seg = l1 - l0;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.translate(tx, ty);
  ctx.transform(1, 0, (tx - v.x) / L, 1, 0, 0);   // 尖端在 tx，越往上越回到藤蔓原本的位置（v.x）
  if (scale !== 1) ctx.scale(scale, scale);
  // 下面那一大段：尖端對齊 (0, 0)
  let y = -(end - VINE_IMG.start);
  const top = -L / scale - 4;
  if (y < top) {   // 畫面比圖短：只畫看得到的部分
    const sy = VINE_IMG.start + (top - y);
    ctx.drawImage(vineImg, 0, sy, W, end - sy, -VINE_IMG.tipX, top, W, end - sy);
  } else {
    ctx.drawImage(vineImg, 0, VINE_IMG.start, W, end - VINE_IMG.start, -VINE_IMG.tipX, y, W, end - VINE_IMG.start);
    while (y > top) {   // 往上接中間那段，直到畫面上緣外面
      y -= seg;
      ctx.drawImage(vineImg, 0, l0, W, seg, -VINE_IMG.tipX, y, W, seg + .5);
    }
  }
  ctx.restore();
}

// 圖還沒載入時的備用畫法（程式畫的藤）
function drawVineStemFallback(ctx, v, tx, ty, now, cut) {
  const topY = cam.y - 30, L = ty - topY;
  if (L <= 4) return;
  ctx.save();
  ctx.lineCap = 'round';
  for (const [w, col] of [[7, VINES.dark], [4.5, VINES.color]]) {
    ctx.strokeStyle = col; ctx.lineWidth = w;
    ctx.beginPath(); ctx.moveTo(v.x, topY); ctx.quadraticCurveTo(v.x, topY + L * .6, tx, ty); ctx.stroke();
  }
  ctx.restore();
}

function vineSortables(list) {
  if (!G || !G.vines || !G.vines.length) return;
  const now = performance.now() / 1000, caps = G.vineCaps || [];
  for (const v of G.vines) {
    if (v.state === 'gone' || caps.some(c => c.v === v && (c.phase === 'wrap' || c.phase === 'lift' || c.phase === 'hang'))) continue;   // 抓著人的那條跟被抓的人一起畫
    const tip = vineTip(v, now), topY = cam.y - 30;
    const ty = v.state === 'descend' || v.state === 'retract' ? topY + (tip.y - topY) * (1 - Math.pow(1 - v.len, 3)) : tip.y;   // 重新垂下來、被火燒到縮回去
    // 假 3D 景深：畫面越下面＝越靠近鏡頭 → 越大（尖端不動），到畫面下緣附近淡掉
    // （溫特往上走＝往前進，藤蔓就從畫面上方往下「迎面而來」，越來越大，最後淡出）
    const vh = viewH(), u = (tip.y - cam.y) / vh;
    const depthK = Math.max(0, Math.min(1, (u - VINES.depthStart) / (VINES.depthEnd - VINES.depthStart)));
    const descK = v.state === 'descend' ? (1 - v.len) * .9 : 0;   // 重新垂下來：從鏡頭前面（大、透明）慢慢退回原位
    const { s, alpha } = vineNear(Math.max(depthK * VINES.depthNear, descK));
    if (alpha <= 0) continue;
    const tx = tip.x;   // 放大時尖端位置不動（以尖端為軸放大）：看得出碰到哪裡會被抓
    if (tx < cam.x - 80 * s || tx > cam.x + viewW() + 80 * s || ty < cam.y - 40) continue;
    const front = depthK > 0 ? 100000 : 0;   // 靠近鏡頭的畫在人物前面
    // 地上的影子：尖端正下方（垂下來、縮回去時跟著變淡），畫在地面那一層（人物下面）
    const shK = (v.state === 'descend' || v.state === 'retract' ? v.len * v.len : 1) * alpha;
    if (shK > .02) list.push({ y: -1e6, draw: () => drawVineShadow(ctx, tip.x, tip.y, shK) });
    if (s === 1 && alpha === 1) { list.push({ y: tip.y + 2, draw: () => drawVineStem(ctx, v, tx, ty, now, false) }); continue; }
    list.push({ y: tip.y + 2 + front, draw: () => { ctx.save(); ctx.globalAlpha *= alpha; drawVineStem(ctx, v, tx, ty, now, false, s); ctx.restore(); } });
  }
}

function drawVineShadow(ctx, x, y, k) {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,' + (VINES.shadowAlpha * k).toFixed(3) + ')';
  ctx.beginPath(); ctx.ellipse(x, y + 2, VINES.shadowW, VINES.shadowH, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,' + (VINES.shadowAlpha * .8 * k).toFixed(3) + ')';
  ctx.beginPath(); ctx.ellipse(x, y + 2, VINES.shadowW * .5, VINES.shadowH * .5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// ---- 往鏡頭靠近的假 3D：往上拉時越來越大、太近就淡掉；掉下來／重新垂下來時反過來 ----
// k：0＝在地上（正常大小）、1＝貼到鏡頭前（最大、完全透明）
function vineNear(k) {
  k = Math.max(0, Math.min(1, k));
  const s = 1 + (VINES.nearScale - 1) * k * k;
  const alpha = k <= VINES.fadeFrom ? 1 : Math.max(0, 1 - (k - VINES.fadeFrom) / (1 - VINES.fadeFrom));
  return { s, alpha };
}

// ---- 摔下來躺在地上：倒下 → 躺著、頭上轉圈的星星 → 爬起來 ----
function drawVineLying(a, baseDraw) {
  const T = VINES.dazeTime, el = T - a.vineDazeT, now = performance.now() / 1000;
  let k;   // 1＝完全躺平、0＝站著
  if (el < VINES.lieTime && !a.vineLieInstant) k = el / VINES.lieTime;
  else if (a.vineDazeT < VINES.getUpTime) { const q = 1 - a.vineDazeT / VINES.getUpTime; k = 1 - q * q * (3 - 2 * q); }
  else k = 1;
  const side = a.vineLieSide || 1, ang = side * Math.PI / 2 * k;
  // 影子：躺下來變寬
  ctx.fillStyle = 'rgba(0,0,0,.28)';
  ctx.beginPath(); ctx.ellipse(a.x, a.y + 14, 15 + 12 * k, 5, 0, 0, Math.PI * 2); ctx.fill();
  const px = a.x, py = a.y - VINE_BODY.pivot;
  ctx.save();
  ctx.translate(px, py + (VINE_BODY.pivot + 2) * k); ctx.rotate(ang); ctx.translate(-px, -py);
  const shadow = typeof drawCharacterShadow === 'function' ? drawCharacterShadow : null;
  if (shadow) drawCharacterShadow = () => {};
  try { baseDraw(a); } finally { if (shadow) drawCharacterShadow = shadow; }
  ctx.restore();
  if (k > .5 && a.vineDazeT > VINES.getUpTime * .5) {   // 頭上轉圈的星星：頭在倒下的那一邊（往右倒＝頭在右邊）
    const hx = a.x + side * (30 * k + VINES.starDx), hy = a.y + 6 + VINES.starDy;
    ctx.save();
    for (let i = 0; i < 3; i++) {
      const th = now * 4 + i * Math.PI * 2 / 3, x = hx + Math.cos(th) * 12, y = hy - 14 + Math.sin(th) * 4;
      ctx.globalAlpha = .55 + .45 * (Math.sin(th) + 1) / 2;
      ctx.fillStyle = '#ffe36b'; ctx.strokeStyle = '#7a5a00'; ctx.lineWidth = 1;
      ctx.beginPath();
      for (let j = 0; j < 10; j++) { const r = j % 2 ? 2 : 4.5, t = j * Math.PI / 5 - Math.PI / 2; j ? ctx.lineTo(x + Math.cos(t) * r, y + Math.sin(t) * r) : ctx.moveTo(x + Math.cos(t) * r, y + Math.sin(t) * r); }
      ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    ctx.restore();
  }
}

// ---- 畫被抓的人（溫特、隊友）：被纏住、往上拉（頭下腳上、往鏡頭靠近淡出）、從上面翻滾掉下來 ----
// 身上的纏繞借用絲瓜小姐的畫法（js/loofah-lady.js 的 drawWrap）
// overlay＝黑幕、霧上面那一層（js/render.js 呼叫 drawVineOverlay）：往上拉、掉下來的人離鏡頭近，畫在黑幕和霧上面
function drawVineActor(a, baseDraw, overlay = false) {
  const cap = vineCapOf(a), sq = a && a.vineSquash;
  if (!overlay && sq && (sq.t += 1 / 60) > .5) a.vineSquash = null;
  if (!cap && a.vineDazeT > 0) return drawVineLying(a, baseDraw);   // 摔下來：躺在地上暈眩，再爬起來
  if (!cap && !a.vineSquash) return baseDraw(a);
  if (!cap) {   // 剛落地：壓扁再彈回來
    const u = a.vineSquash.t, s = 1 - .28 * Math.exp(-u * 7) * Math.cos(u * 20), fy = a.y + 16;
    ctx.save(); ctx.translate(a.x, fy); ctx.scale(1 + (1 - s) * .8, s); ctx.translate(-a.x, -fy);
    baseDraw(a); ctx.restore(); return;
  }
  if (cap.phase === 'away') return;
  const now = performance.now() / 1000, h = Math.max(0, cap.h);
  // 翻轉：往上拉一開始翻成頭下腳上；掉下來的途中翻成躺的姿勢，躺著彈兩下
  let ang = 0, near = 0, lieK = 0;
  const hangMode = cap.mode === 'hang';
  if (cap.phase === 'lift') {
    ang = Math.PI * Math.min(1, cap.t / VINES.flipTime);
    near = hangMode ? 0 : Math.min(1, cap.t / VINES.liftTime);   // 倒吊藤蔓只拉到半空中：不往鏡頭靠近
  } else if (cap.phase === 'hang') {
    if (!overlay) cap.kick = (cap.kick || 0) * .94;   // 被打中的晃動慢慢停
    ang = Math.PI + Math.sin(now * 2.2 + a.x * .01) * .12 + (cap.kick || 0) * .25;   // 倒吊著像鐘擺一樣晃
  } else if (cap.phase === 'fall') {
    const q = cap.fallH0 > 0 ? Math.max(0, h / cap.fallH0) : 0;   // 1＝剛開始掉、0＝落地
    lieK = Math.min(1, (1 - q) / .85);
    const target = cap.lieSide === 1 ? Math.PI / 2 : Math.PI * 1.5;   // 往右躺＝頭朝右、往左躺＝頭朝左（跟躺在地上暈的姿勢一樣）
    ang = Math.PI + (target - Math.PI) * lieK;
    near = cap.cut ? 0 : q * .9;   // 從半空中掉下來的不用往鏡頭靠近
  }
  const flipK = cap.phase === 'fall' ? 1 : Math.min(1, ang / Math.PI);
  const { s, alpha } = vineNear(near);
  const air = (cap.phase === 'lift' && !hangMode) || (cap.phase === 'fall' && h > 50 && !cap.cut);   // 快落地、彈跳時畫回一般那層（跟躺在地上的樣子接得起來）
  if (!overlay) {   // 地上的影子：離地越高越小越淡
    ctx.fillStyle = 'rgba(0,0,0,' + Math.max(.05, .3 - h * .002).toFixed(3) + ')';
    ctx.beginPath(); ctx.ellipse(a.x, a.y + 15, Math.max(4, 15 - h * .05) + 12 * lieK * Math.max(0, 1 - h / 80), Math.max(2, 5 - h * .02), 0, 0, Math.PI * 2); ctx.fill();   // 躺的姿勢快落地時影子變寬
    if (air) return;   // 身體在 overlay 那一層畫
  } else if (!air) return;
  if (alpha <= 0) return;
  // 被吊著左右晃、剛纏住時掙扎抖動
  const sx = cap.phase === 'fall' ? 0 : cap.phase === 'wrap' ? (Math.random() - .5) * 2.4
    : cap.phase === 'hang' ? Math.sin(now * 2.2 + a.x * .01) * VINES.hangSwing + (cap.kick || 0) * 6
    : Math.sin(now * 4 + (cap.isPlayer ? 0 : a.x)) * Math.min(8, h * .06);
  cap.sx = sx;   // 開槍判定用（vineHangShotTarget）
  const px = a.x + sx, py = a.y - h - VINE_BODY.pivot + (VINE_BODY.pivot + 2) * lieK;   // 身體中心（翻轉、放大都以這裡為軸）；躺下時中心降到貼地
  // 藤蔓接的地方：正著的時候在腰後面，翻過來後在腳上（翻到頭上方）
  const off = VINE_BODY.waist + (VINE_BODY.feet - VINE_BODY.waist) * flipK;
  const ax = px - Math.sin(ang) * off * s, ay = py + Math.cos(ang) * off * s;
  ctx.save();
  ctx.globalAlpha *= alpha;
  if (cap.phase !== 'fall') drawVineStem(ctx, cap.v, ax, ay, now, true, s);   // 藤蔓從畫面上緣垂下來，接到身上（先畫，在人後面）
  ctx.translate(px, py); ctx.rotate(ang); ctx.scale(s, s); ctx.translate(-a.x, -(a.y - VINE_BODY.pivot));
  const shadow = typeof drawCharacterShadow === 'function' ? drawCharacterShadow : null;
  if (shadow) drawCharacterShadow = () => {};   // 影子另外畫在地上
  try { baseDraw(a); } finally { if (shadow) drawCharacterShadow = shadow; }
  if (cap.phase !== 'fall' && typeof drawWrap === 'function') {   // 身上的纏繞跟著人一起翻、一起放大
    const grow = cap.phase === 'wrap' ? Math.min(1, cap.t / (VINES.wrapTime * .8)) : 1;
    cap.wrapSeed = cap.wrapSeed || (1 + Math.random() * 6);
    const C = typeof TENDRIL_COL !== 'undefined' ? TENDRIL_COL : null, keep = C && { ...C };
    if (C) Object.assign(C, VINES.wrapCol);   // 暫時換成橄欖綠，畫完換回去（絲瓜小姐的藤照舊）
    try { drawWrap(ctx, { x: a.x, y: a.y, rootT: 0, struggleT: 0 }, grow, now, cap.wrapSeed); } finally { if (C) Object.assign(C, keep); }
  }
  ctx.restore();
  if (cap.phase === 'hang') {   // 藤蔓還要打幾發：腳上面幾顆小點（打中一發暗一顆）
    const n = VINES.hangHits, left = n - (cap.hits || 0), by = ay - 10;
    for (let i = 0; i < n; i++) {
      const x = ax + (i - (n - 1) / 2) * 7;
      ctx.fillStyle = i < left ? '#c8d46a' : 'rgba(40,44,20,.6)'; ctx.strokeStyle = '#1e220c'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(x, by, 2.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }
  }
}
function drawVineOverlay(ctx) {
  if (!G || !G.vineCaps || !G.vineCaps.length) return;
  for (const cap of G.vineCaps) {
    if (cap.phase !== 'lift' && cap.phase !== 'fall') continue;
    drawVineActor(cap.actor, cap.isPlayer ? vineBaseDrawPlayer : vineBaseDrawTower, true);
  }
}
const vineBaseDrawPlayer = drawPlayer;
drawPlayer = p => drawVineActor(p, vineBaseDrawPlayer);
const vineBaseDrawTower = drawTower;
drawTower = t => drawVineActor(t, vineBaseDrawTower);

// ---- 被吊走的時候怪物打不到 ----
if (typeof enemyAttackPlayer === 'function') {
  const vineBaseEnemyAttackPlayer = enemyAttackPlayer;
  enemyAttackPlayer = (e, dt) => { if (vineHolding()) return; return vineBaseEnemyAttackPlayer(e, dt); };
}
if (typeof hurtGraceBlocked === 'function') {
  const vineBaseHurtGrace = hurtGraceBlocked;
  hurtGraceBlocked = o => (o && o.vineCap && vineCapOf(o)) ? true : vineBaseHurtGrace(o);
}
