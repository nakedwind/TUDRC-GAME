/* ===== 森林的垂吊藤蔓（地圖編輯器「🌿 藤蔓」擺放）=====
   ・藤蔓從畫面上方垂下來，尖端垂到地面那一格；溫特靠近時尖端會抽動（預告）
   ・溫特或隊友碰到尖端：被纏住 → 翻成頭下腳上、往上捲，越拉越大（往鏡頭靠近）、太近就淡掉（鏡頭停在原地）→ 在畫面外吊 VINES.awayTime 秒
     → 從畫面上方被丟回附近的地面（摔一下扣一點血、頭暈一下）
   ・被吊走的期間：不能動、不能攻擊，怪物打不到（扣的血會補回來）；鏡頭只有溫特被抓時才會停住
   ・剛摔下來的人 VINES.safeTime 秒內不會又被抓
   ・藤蔓抓過人會縮上去，VINES.regrowTime 秒後再慢慢垂下來
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
  awayTime: 3,       // 在畫面外被吊幾秒
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
  // 被抓時身上纏繞的顏色（絲瓜藤的畫法，但改成墨綠，跟藤蔓圖搭）
  wrapCol: { line: '#132209', fill: '#3b5a2c', light: '#5f7d42', back: '#28401e' },
  starDx: -10,       // 暈眩星星：往頭那一邊的反方向挪幾像素（往右倒＝往左挪，往左倒自動鏡射）
  starDy: -10,       //           往上挪幾像素（負的＝往上）
};

// ---- 開場：照地圖上的 MAP.vines ['欄,列'…] 擺藤蔓 ----
// G.vineCaps：正在被藤蔓抓著的人（溫特、隊友各自一筆）{ v, actor, isPlayer, phase, t, h, x0, y0, hp, … }
function seedVines() {
  G.vines = []; G.vineCaps = [];
  for (const a of [G.player, ...(G.towers || [])]) if (a) { a.vineCap = false; a.vineDazeT = 0; a.vineSafeT = 0; }
  if (MAP_SAFE || !MAP || !Array.isArray(MAP.vines)) return;
  for (const key of MAP.vines) {
    const [c, r] = key.split(',').map(Number);
    if (!inGrid(c, r)) continue;
    const [x, cy] = center(c, r);
    G.vines.push({ c, r, x, y: cy + 6, state: 'hang', t: 0, len: 1, seed: Math.random() * 10, twitch: 0 });
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
  } else if (cap.phase === 'lift') {
    const k = Math.min(1, cap.t / VINES.liftTime);
    cap.topH = Math.max(cap.topH, (a.y - cam.y) + 110);   // 鏡頭跟著溫特動：隊友要拉到「現在」的畫面上緣外面
    cap.h = cap.topH * k * k * (1.4 - .4 * k);   // 一開始慢、越拉越快
    if (k >= 1) { cap.phase = 'away'; cap.t = 0; cap.v.state = 'gone'; cap.v.t = VINES.regrowTime; pickVineDrop(cap); }
  } else if (cap.phase === 'away') {
    if (cap.t >= VINES.awayTime) {
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
  G.vineCaps.push({ v, actor: a, isPlayer, phase: 'wrap', t: 0, h: 0, x0: a.x, y0: a.y, hp: a.hp, camX: cam.x, camY: cam.y,
    topH: (a.y - cam.y) + 110 });   // 拉到畫面上緣外面
  a.vineCap = true; a.dashT = 0;
  if (isPlayer) { flash('被藤蔓抓住了！', a.x, a.y - 56, '#9fe07a', .9); addShake(3); }
  else sentryStatus(a, '被藤蔓抓住了！', '#9fe07a', true);
  sfxAt('vineGrab', a.x, a.y, .8);
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

// 溫特摔到地上：播共通的「溫特受傷」音效（js/game.js 的 playPlayerHit；音效編輯器的「溫特受傷」）
function vineHitSound(cap) {
  if (cap.isPlayer && typeof playPlayerHit === 'function') playPlayerHit();
}

function vineLand(a, cap) {
  G.vineCaps = G.vineCaps.filter(c => c !== cap); a.vineCap = false;
  a.vineDazeT = VINES.dazeTime;
  a.vineSafeT = VINES.safeTime;   // 剛摔下來：一陣子不會又被抓
  const dmg = Math.min(VINES.fallDamage, Math.max(0, a.hp - 1));
  if (dmg > 0 && !(typeof practiceOn === 'function' && practiceOn())) {
    a.hp -= dmg;   // 不閃紅
    flashDmg('-' + dmg, a.x, a.y - 46, '#ff6b6b');
  }
  a.vineLieSide = cap.lieSide || (Math.random() < .5 ? -1 : 1);   // 往左或往右躺（掉下來時就已經躺好了）
  a.vineLieInstant = true; a.vineBounced = false;
  if (!cap.bounces) G.effects.push({ ring: true, x: a.x, y: a.y + 14, r: 6, r2: 30, life: .35, life0: .35, color: '#d8dee6' });
  a.dir = 'front'; a.moving = false; a.anim = 0;   // 正面躺下（閉眼圖是正面的）
  if (!cap.isPlayer) { a.navPath = null; a.navGoal = null; a.target = null; }   // 落地不震動畫面
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
    if (v.state === 'gone' || caps.some(c => c.v === v && c.phase !== 'away')) continue;   // 抓著人的那條跟被抓的人一起畫
    const tip = vineTip(v, now), topY = cam.y - 30;
    const ty = v.state === 'descend' ? topY + (tip.y - topY) * (1 - Math.pow(1 - v.len, 3)) : tip.y;
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
    if (s === 1 && alpha === 1) { list.push({ y: tip.y + 2, draw: () => drawVineStem(ctx, v, tx, ty, now, false) }); continue; }
    list.push({ y: tip.y + 2 + front, draw: () => { ctx.save(); ctx.globalAlpha *= alpha; drawVineStem(ctx, v, tx, ty, now, false, s); ctx.restore(); } });
  }
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
  if (cap.phase === 'lift') {
    ang = Math.PI * Math.min(1, cap.t / VINES.flipTime);
    near = Math.min(1, cap.t / VINES.liftTime);
  } else if (cap.phase === 'fall') {
    const q = cap.fallH0 > 0 ? Math.max(0, h / cap.fallH0) : 0;   // 1＝剛開始掉、0＝落地
    lieK = Math.min(1, (1 - q) / .85);
    const target = cap.lieSide === 1 ? Math.PI / 2 : Math.PI * 1.5;   // 往右躺＝頭朝右、往左躺＝頭朝左（跟躺在地上暈的姿勢一樣）
    ang = Math.PI + (target - Math.PI) * lieK;
    near = q * .9;
  }
  const flipK = cap.phase === 'fall' ? 1 : Math.min(1, ang / Math.PI);
  const { s, alpha } = vineNear(near);
  const air = cap.phase === 'lift' || (cap.phase === 'fall' && h > 50);   // 快落地、彈跳時畫回一般那層（跟躺在地上的樣子接得起來）
  if (!overlay) {   // 地上的影子：離地越高越小越淡
    ctx.fillStyle = 'rgba(0,0,0,' + Math.max(.05, .3 - h * .002).toFixed(3) + ')';
    ctx.beginPath(); ctx.ellipse(a.x, a.y + 15, Math.max(4, 15 - h * .05) + 12 * lieK * Math.max(0, 1 - h / 80), Math.max(2, 5 - h * .02), 0, 0, Math.PI * 2); ctx.fill();   // 躺的姿勢快落地時影子變寬
    if (air) return;   // 身體在 overlay 那一層畫
  } else if (!air) return;
  if (alpha <= 0) return;
  // 被吊著左右晃、剛纏住時掙扎抖動
  const sx = cap.phase === 'fall' ? 0 : (cap.phase === 'wrap' ? (Math.random() - .5) * 2.4 : Math.sin(now * 4 + (cap.isPlayer ? 0 : a.x)) * Math.min(8, h * .06));
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
    if (C) Object.assign(C, VINES.wrapCol);   // 暫時換成墨綠，畫完換回去（絲瓜小姐的藤照舊）
    try { drawWrap(ctx, { x: a.x, y: a.y, rootT: 0, struggleT: 0 }, grow, now, cap.wrapSeed); } finally { if (C) Object.assign(C, keep); }
  }
  ctx.restore();
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
