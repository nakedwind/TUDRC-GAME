/* ===== 球球（搜救犬）的額外姿勢：坐下、睡在自己的床上 =====
   ・停下來超過 sitAfter 秒就坐下：安全區 ballA_sit.png、戰鬥區 ballB_sit.png（images/character/ball/；圖是朝左，朝右時左右翻）
   ・安全區閒逛時，有機率走到「球球的床」（基地編輯器的素材 tile_eoc_ball_bed）睡一陣子；
     睡覺時在床的位置畫 ballsleep.png（狗躺在床上的整張圖），原本的床先藏起來（js/maploader.js 問 ballBedHidden）
   ・走路只用 Walking01、02 兩張：js/game.js 的 pickCharacterFrame（TWO_FRAME_WALK）
*/
// sitAfter：停幾秒才坐下；sleepChance：每次挑新的閒逛點時去睡的機率；sleep：睡幾秒（最短、最長）；
// cooldown：睡醒後隔幾秒才會再去睡；radius：床在幾格內才會走過去；feetPad：走路圖（64×64）腳底下面空了幾像素
const BALL_POSES = { sitAfter: 1.2, sleepChance: .3, sleep: [20, 40], cooldown: 25, radius: 30, feetPad: 0 };
const BALL_BED_ID = 'tile_eoc_ball_bed';
const ballPoseImgs = {};
for (const [k, src] of Object.entries({ A: 'images/character/ball/ballA_sit.png', B: 'images/character/ball/ballB_sit.png', sleep: 'images/character/ball/ballsleep.png' })) {
  const img = new Image(); img.src = src; ballPoseImgs[k] = img;
}
const ballImgReady = img => img && img.complete && img.naturalWidth;

// 這張地圖上的球球床（格子層、貼圖都找）：x、y＝球球睡覺時站的位置（床中間偏下），x0、y0、w、h＝床的範圍
let ballBedCache = null, ballBedCacheFor = null;
function ballBeds() {
  if (!MAP) return [];
  if (ballBedCacheFor === MAP) return ballBedCache;
  const t = mapTileById(BALL_BED_ID), beds = [];
  if (t) {
    const w = mapTileW(t) * CELL, h = mapTileH(t) * CELL;
    const add = (x0, y0, fx, src) => beds.push({ x0, y0, w, h, fx: !!fx, x: x0 + w / 2, y: y0 + h - 6, src });   // src＝那張貼圖，或格子的 'c,r'
    for (const layer of Object.values(MAP.layers || {})) for (const [key, id] of Object.entries(layer)) {
      if (id !== BALL_BED_ID) continue;
      const [c, r] = key.split(',').map(Number); add(c * CELL, r * CELL, false, key);
    }
    for (const s of MAP.stamps || []) if (s.id === BALL_BED_ID && !mapStampTurn(s)) add(s.c * CELL + (s.ox || 0), s.r * CELL + (s.oy || 0), s.fx, s);
  }
  ballBedCache = beds; ballBedCacheFor = MAP;
  return beds;
}

// 閒逛挑新地點時呼叫（js/sentry.js 的 updateWanderer）：決定去睡就回傳 true
function tryBallBed(npc) {
  if (!MAP_SAFE || (npc.bedCd || 0) > 0 || Math.random() >= BALL_POSES.sleepChance) return false;
  const bed = ballBeds().map(b => ({ b, d: Math.hypot(b.x - npc.x, b.y - npc.y) }))
    .filter(o => o.d <= BALL_POSES.radius * CELL).sort((a, b) => a.d - b.d)[0];
  if (!bed) { npc.bedCd = 3; return false; }
  const [lo, hi] = BALL_POSES.sleep;
  npc.ballSleep = { bed: bed.b, going: true, t: lo + Math.random() * (hi - lo) };
  npc.target = null; npc.navPath = null; npc.waitT = 0;
  return true;
}
// 每幀先跑這裡：正走向床或睡著時回傳 true（這幀不跑一般閒逛）
function ballBedStep(npc, dt) {
  npc.bedCd = Math.max(0, (npc.bedCd || 0) - dt);
  const s = npc.ballSleep;
  if (!s) return false;
  const wake = () => { npc.ballSleep = null; npc.navPath = null; npc.bedCd = BALL_POSES.cooldown; };
  if (!MAP_SAFE || !ballBeds().includes(s.bed)) { wake(); return false; }   // 換地圖、或床被拿掉了
  if (s.going) {
    if (moveSentryWithPath(npc, s.bed.x, s.bed.y, 65, dt)) { s.going = false; npc.navPath = null; }
    else if (npc.navFailed) { npc.navFailed = false; wake(); }   // 走不到床邊：過一陣子再試
    return true;
  }
  npc.x = s.bed.x; npc.y = s.bed.y; npc.moving = false; npc.anim = 0;
  s.t -= dt;
  if (s.t <= 0) { wake(); npc.y = s.bed.y0 + s.bed.h + CELL * .4; npc.dir = 'front'; npc.waitT = 1 + Math.random(); }   // 睡醒：從床上下來
  return true;
}
const ballSleeping = npc => !!(npc && npc.ballSleep && !npc.ballSleep.going);
// 這張床（貼圖，或格子的 'c,r'＋素材 id）上正睡著球球：原本的床不畫，免得跟睡覺圖疊成兩張床（js/maploader.js）
function ballBedHidden(src, id) {
  if (id != null && id !== BALL_BED_ID) return false;
  const ball = typeof G !== 'undefined' && G && G.npcs && G.npcs.find(n => n.id === 'ball');
  return ballSleeping(ball) && ball.ballSleep.bed.src === src;
}
// 排前後用的 y（js/render.js）：睡覺圖底邊對齊床底，就用床底；其他時候回傳 null 照一般角色算
const ballSortY = npc => ballSleeping(npc) ? npc.ballSleep.bed.y0 + npc.ballSleep.bed.h : null;

// 畫球球（js/render.js 的 drawWanderer 先問這裡）：睡覺、坐著時畫特別的圖並回傳 true；其他時候照一般走路圖
function drawBallPose(npc, size) {
  const now = performance.now();
  if (npc.moving || npc.sitting) npc.stillSince = 0;
  else if (!npc.stillSince) npc.stillSince = now;
  if (ballSleeping(npc)) {
    const img = ballPoseImgs.sleep, b = npc.ballSleep.bed;
    if (!ballImgReady(img)) return false;
    const h = b.w * img.naturalHeight / img.naturalWidth;   // 跟床一樣寬，底邊對齊床的底邊（狗比床高出來的部分往上）
    ctx.save(); ctx.imageSmoothingEnabled = false;
    if (b.fx) { ctx.translate(b.x0 + b.w, 0); ctx.scale(-1, 1); ctx.drawImage(img, 0, b.y0 + b.h - h, b.w, h); }
    else ctx.drawImage(img, b.x0, b.y0 + b.h - h, b.w, h);
    ctx.restore();
    return true;
  }
  if (npc.moving || !npc.stillSince || now - npc.stillSince < BALL_POSES.sitAfter * 1000) return false;
  const img = ballPoseImgs[MAP_SAFE ? 'A' : 'B'];
  if (!ballImgReady(img)) return false;
  const w = img.naturalWidth, h = img.naturalHeight;
  const feetY = Math.round(npc.y + 18 - BALL_POSES.feetPad);   // 跟走路圖的腳底同一條線
  ctx.save(); ctx.imageSmoothingEnabled = false;
  if (npc.dir === 'right') { ctx.translate(Math.round(npc.x), 0); ctx.scale(-1, 1); ctx.drawImage(img, -w / 2, feetY - h, w, h); }
  else ctx.drawImage(img, Math.round(npc.x - w / 2), feetY - h, w, h);
  ctx.restore();
  return true;
}

// ---- 球球偶爾叫：在溫特身邊 range 格內時，每 every 秒（隨機）叫一次（音效 ballBark：叫 1 聲／叫 2 聲隨機，音效編輯器可以換）----
// 越遠越小聲：near 格內最大聲，到 range 格變成 0；睡覺時不叫；走遠了計時先停著，回到範圍內再接著數
const BALL_BARK = { range: 20, near: 2, every: [20, 60], gain: .5 };
let ballBarkT = null;
function updateBallBark(dt) {
  const p = G && G.player, ball = p && G.npcs && G.npcs.find(n => n.id === 'ball');
  if (!ball || ballSleeping(ball) || ball.eatenBy) return;
  const d = Math.hypot(ball.x - p.x, ball.y - p.y) / CELL;
  if (d > BALL_BARK.range) return;
  if (ballBarkT == null) ballBarkT = BALL_BARK.every[0] + Math.random() * (BALL_BARK.every[1] - BALL_BARK.every[0]);
  if ((ballBarkT -= dt) > 0) return;
  ballBarkT = null;
  const fade = d <= BALL_BARK.near ? 1 : Math.max(0, (BALL_BARK.range - d) / (BALL_BARK.range - BALL_BARK.near));
  if (fade > 0 && typeof SFX !== 'undefined') SFX.play('ballBark', BALL_BARK.gain * fade, 'ball-bark');
}
