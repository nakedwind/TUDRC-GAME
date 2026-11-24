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
        一邊掙扎一邊往最近的岸邊游（js/pool-tide.js 的 poolDrownFlee），跟漲潮溺水一樣每秒扣血、會喊溺水的台詞
   泳圈：
     ・隊員有自己的游泳圈（t.ownRing）：掙扎 ringDelay 秒後自動戴上
     ・溫特：要按互動鍵（空白鍵／Enter）才會戴上（js/swim-ring.js 的 useSwimRingNearPlayer，腳下有「空白鍵／使用救生圈」）
   游到岸上、戴上泳圈、水被抽乾，掙扎就結束。
   漲潮溺水（js/pool-tide.js）也用同一套掙扎的畫法。 */
const POOL_FALL = {
  edgeNear: 6,          // 溫特身體中心離深水幾點以內算「太靠近水邊」
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
  panicSecs: 1.2,       // 剛落水先原地慌張掙扎幾秒，才開始往岸邊游
  ringDelay: 1,         // 隊員有游泳圈：掙扎幾秒後自動戴上
  sink: .3,             // 掙扎時水面在身體的哪裡（0＝腳底、1＝頭頂；角色是大頭比例，.3 ≈ 到胸口，眼睛在 .44 左右要露出來）
  see: .35,             // 水面下的身體看得多清楚（0～1）
  bobAmp: 4,            // 載浮載沉：上下多少點
  bobSpeed: 5.5,        // 上下的快慢
  swayAmp: .16,         // 左右搖擺的角度（弧度）
  swaySpeed: 3.4,       // 左右搖擺的快慢
  flailSecs: .16,       // 掙扎的兩張圖（手揮來揮去）多久換一張
  splashGap: [.22, .45],   // 掙扎時隔幾秒濺一次小水花
  bigSplash: { drops: 22, column: 14, up: 230, spread: 120, width: 46 },   // 落水的大水花：水滴數、水柱數、往上衝的速度、往旁邊噴的速度、範圍寬度
  smallSplash: { drops: 5, up: 120, spread: 55, width: 26 },               // 掙扎時的小水花
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
  list.push({ ring: true, x, y, r0: w * .2, r1: w * (big ? 1.4 : .9), t: 0, life: big ? .8 : .5 });   // 水波
  if (big) list.push({ ring: true, x, y, r0: w * .2, r1: w * 2, t: -.15, life: .7 });
  list.push({ foam: true, x, y, r: w * (big ? .45 : .3), t: 0, life: big ? .55 : .3 });   // 白色水沫
  for (let i = 0; i < K.drops; i++) {   // 往四周噴的水滴
    const ang = Math.random() * Math.PI * 2, sp = K.spread * poolFallRand(.35, 1), rr = w * poolFallRand(.05, .3);
    list.push({ x: x + Math.cos(ang) * rr, y: y + Math.sin(ang) * rr * .45, z: poolFallRand(2, 10), vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp * .45,
      vz: K.up * poolFallRand(.35, 1), r: big ? poolFallRand(1.8, 3.6) : poolFallRand(1.2, 2.4), t: 0, life: 1.4 });
  }
  for (let i = 0; i < (K.column || 0); i++) {   // 往上衝的水柱（窄、高）
    const ang = Math.random() * Math.PI * 2, sp = poolFallRand(8, 30);
    list.push({ x: x + (Math.random() - .5) * w * .3, y, z: Math.random() * 12, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp * .45,
      vz: K.up * poolFallRand(1, 1.6), r: poolFallRand(2.4, 4.2), t: 0, life: 1.8 });
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
  // 掙扎：剛落水先原地慌張一下，之後溫特往岸上游（隊員在 js/sentry.js 游）；漲潮溺水那套（js/pool-tide.js）會把 drowning 打開、每秒扣血
  if (f.t >= POOL_FALL.panicSecs && typeof G !== 'undefined' && G && a === G.player && a.drowning && typeof poolDrownFlee === 'function') poolDrownFlee(a, dt);
  return true;
}
function poolFallEnd(a) {
  if (!a || !a.poolFall) return;
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
