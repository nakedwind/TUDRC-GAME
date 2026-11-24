/* ===== 地面怪物被推下深水：掉進水裡 → 掙扎、扣血、往岸邊游，爬上岸就活下來 =====
   有畫 🛟 深水區、而且現在是深水的地圖才有（池核、W118區 地下水池）。
   什麼時候會掉：怪物被擊退滑行（溫特、隊員打的擊退、小丑魚 BOSS 的水浪…，設 e.knockT 的都算），
               滑到深水邊被擋住的那一刻（js/combat-feel.js 的 updateEnemyFeel 呼叫 poolMonsterKnockIn）
   不會掉的：BOSS（池核 BOSS、虱目魚王）、會飛的人面蝶、推不動的、已經在水裡的（POOL_MONSTER_FALL_IMMUNE）
   會游泳的（POOL_MONSTER_SWIMMERS：史萊姆、魚頭君、虱目魚小子、小虱目魚小子、比基尼小丑魚、小丑魚幼體）：
             一樣會被推下水、噴水花，但不慌張、不扣血、不掙扎，直接用 swimmerMul 的速度游回岸上
   其他地面怪物（例如鳥頭人、金蕉王）掉下去之後：
     ① 往被推的方向掉進水裡一小段，落水的那一刻噴皇冠水花（js/pool-fall.js 的 poolCrownSplash，照怪物體型放大）
     ② 先原地慌張 panicSecs 秒，再往最近的岸邊游（速度＝自己走路速度 × swimMul）；掙扎時上下浮沉、左右搖擺、一直濺小水花
     ③ 在水裡每秒扣「最大血量的 dpsPct %」；血扣光就照一般擊殺算（獎勵、掉落物照舊）
     ④ 整個身體爬上岸、站得住，就結束，照常行動
   數值：怪物編輯器「👑 BOSS 數值」→「🌊 怪物掉進深水（共用）」（存在 data/monsters.js 的 BOSS_SETTINGS_DEFAULT.POOL_MONSTER_FALL；
         改了下面的欄位或註解要跑 tools/build-boss-fields.py，跑完把只有行尾變動的其他 BOSS 檔案還原）
   畫法：js/water.js 的 drawWaded 問 poolMonsterFallPose（轉身體、浮沉、水面以下半透明） */
// 數字以 data/monsters.js 的 BOSS_SETTINGS_DEFAULT 為準（怪物編輯器「👑 BOSS 數值」）；這裡的數字只在那邊沒有這一格時才用。
// 新增或刪掉數字欄位、改了註解之後，要跑一次 tools/build-boss-fields.py（編輯器的欄位和說明才會跟著更新）
const POOL_MONSTER_FALL = applyBossSettings('POOL_MONSTER_FALL', {
  fallSecs: .4,       // 從岸邊掉進水裡要幾秒
  fallLift: 14,       // 掉下去時往上彈多高（像素）
  fallIn: 44,         // 掉進水裡多遠（像素，順著被推的方向；那裡不是深水就縮短）
  panicSecs: 1,       // 剛落水先原地慌張幾秒，才開始往岸邊游
  swimMul: .35,       // 往岸邊游的速度＝自己走路速度的幾倍
  dpsPct: 8,          // 在水裡每秒扣最大血量的幾 %（8＝游 3 秒大約扣掉四分之一）
  sink: .38,          // 水面在身體的哪裡（0＝腳底、1＝頭頂）
  see: .35,           // 水面下的身體看得多清楚（0～1）
  bobAmp: 3,          // 上下浮沉幾像素
  bobSpeed: 5,        // 浮沉多快
  swayAmp: .14,       // 左右搖擺的角度（弧度）
  swaySpeed: 3.2,     // 搖擺多快
  splashScale: 1.2,   // 落水水花的大小（再乘怪物體型：寬 42 的怪物＝1 倍）
  splashGap: .35,     // 掙扎時平均隔幾秒濺一次小水花
  swimmerMul: .7,     // 會游泳的怪物（不會溺水）游回岸上的速度＝自己走路速度的幾倍
});
// 不會掉進水裡的怪物種類（behavior）：會飛的人面蝶、虱目魚王（BOSS）。池核 BOSS 另外用 e.poolBoss 判斷
const POOL_MONSTER_FALL_IMMUNE = new Set(['moth', 'milkfishKing']);
// 會游泳的怪物（怪物編輯器的代號 id）：被推下水不會溺水，直接游回岸上
const POOL_MONSTER_SWIMMERS = new Set(['slime', 'fish_head', 'milkfish_kid', 'milkfish_kid_small', 'clownfish', 'clownfish_small']);
const pmfSwimmer = e => POOL_MONSTER_SWIMMERS.has(e.type);

const pmfOn = () => typeof deepWaterCells === 'function' && deepWaterCells().size > 0 && !(typeof poolDeepIsDeep === 'function' && !poolDeepIsDeep());
const pmfCanFall = e => !!e && !e.dead && e.hp > 0 && !e.poolBoss && !e.unpushable && !e.airborne && !e.poolMFall
  && !POOL_MONSTER_FALL_IMMUNE.has(e.behavior) && !(typeof deepWaterAtPoint === 'function' && deepWaterAtPoint(e.x, e.y));

// ---- 擊退滑行被擋住時（js/combat-feel.js 的 updateEnemyFeel 呼叫）：擋住的是深水就掉下去；回傳 true＝掉下去了 ----
function poolMonsterKnockIn(e, vx, vy) {
  if (!pmfOn() || !pmfCanFall(e)) return false;
  const len = Math.hypot(vx, vy); if (!len) return false;
  const ux = vx / len, uy = vy / len;
  // 擋住的是不是深水：跟怪物被深水擋路用同一套判斷（js/enemy-ai.js 的 enemyBlocked 看身體中心所在的格子）
  const deepAhead = d => { const x = e.x + ux * d, y = e.y + uy * d, [c, r] = cellAt(x, y); return deepWaterAtPoint(x, y) || (typeof deepWaterBlocksCell === 'function' && deepWaterBlocksCell(c, r)); };
  if (!deepAhead(6) && !deepAhead(12)) return false;   // 擋住的不是深水（牆、建築…）
  // 落水點：順著被推的方向往水裡 fallIn 像素（四周都是深水的位置；不行就短一點、偏一點）
  const deepAround = (x, y, r) => [[0, 0], [r, 0], [-r, 0], [0, r], [0, -r]].every(([dx, dy]) => deepWaterAtPoint(x + dx, y + dy));
  let to = null;
  for (let d = POOL_MONSTER_FALL.fallIn; d >= 12 && !to; d -= 4)
    for (const turn of [0, .3, -.3, .6, -.6]) {
      const c = Math.cos(turn), s = Math.sin(turn), wx = ux * c - uy * s, wy = ux * s + uy * c;
      if (deepAround(e.x + wx * d, e.y + wy * d, 10)) { to = { x: e.x + wx * d, y: e.y + wy * d }; break; }
    }
  if (!to) return false;
  e.knockT = 0; e.target = null; e.hasTarget = false; e.swing = null;
  e.poolMFall = { phase: 'fall', t: 0, from: { x: e.x, y: e.y }, to, seed: Math.random() * 10, splashT: .2, swimmer: pmfSwimmer(e) };
  return true;
}

// ---- 每一幀（js/combat-feel.js 的 updateEnemyFeel 最前面呼叫）：回傳 true＝這一幀由這裡處理，不跑 AI ----
function poolMonsterFallStep(e, dt) {
  const f = e && e.poolMFall; if (!f) return false;
  const C = POOL_MONSTER_FALL;
  if (e.dead || e.hp <= 0) { e.poolMFall = null; e.slimeLift = 0; return false; }
  if (!pmfOn()) { e.poolMFall = null; e.slimeLift = 0; return false; }   // 水被抽乾：照常行動
  f.t += dt;
  if (f.phase === 'fall') {
    const k = Math.min(1, f.t / C.fallSecs);
    e.x = f.from.x + (f.to.x - f.from.x) * k; e.y = f.from.y + (f.to.y - f.from.y) * k;
    e.slimeLift = Math.sin(k * Math.PI) * C.fallLift;
    if (k >= 1) {   // 落水：皇冠水花、水聲
      e.slimeLift = 0; f.phase = 'struggle'; f.t = 0; f.path = null;
      const sc = Math.max(.8, Math.min(3, ((e.drawWidth || 42) * (e.sizeMul || 1)) / 42 * C.splashScale));
      if (typeof poolCrownSplash === 'function') poolCrownSplash(G.poolSplash || (G.poolSplash = []), e.x, e.y + 8, sc);
      if (typeof sfxAt === 'function') sfxAt('poolBossSplash', e.x, e.y, .45, 'monster-fall');
    }
    return true;
  }
  // 掙扎：扣血、濺水花、往岸邊游（會游泳的：不扣血、不濺水花、不慌張，直接游回去）
  if (!f.swimmer) e.hp = Math.max(0, e.hp - (e.maxhp || 1) * C.dpsPct / 100 * dt);
  if (!f.swimmer && (f.splashT -= dt) <= 0) {
    f.splashT = C.splashGap * (.6 + Math.random() * .8);
    if (typeof poolFallSplash === 'function') poolFallSplash(e.x + (Math.random() - .5) * 16, e.y + 8, false);
  }
  if (e.hp <= 0) return true;   // 溺死：交給一般的擊殺流程
  if (!f.swimmer && f.t < C.panicSecs) return true;
  const speed = (e.baseSpeed || e.speed || 60) * (f.swimmer ? C.swimmerMul : C.swimMul);
  const outOfZone = typeof poolPointInDeepZone === 'function' ? !poolPointInDeepZone(e.x, e.y) : !deepWaterAtPoint(e.x, e.y);
  if (!outOfZone) {   // 沿著深水格游到最近的岸邊（js/pool-tide.js 的 poolShorePath）
    if (!f.path || !f.path.length) f.path = typeof poolShorePath === 'function' ? poolShorePath(e) : [];
    const p = f.path && f.path[0];
    if (!p) { pmfEnd(e); return false; }
    const dx = p[0] - e.x, dy = p[1] - e.y, d = Math.hypot(dx, dy), step = Math.min(d, speed * dt);
    if (d > .5) { e.x += dx / d * step; e.y += dy / d * step; e.faceRight = dx > 0; }
    if (d <= 3) f.path.shift();
    return true;
  }
  // 身體中心上岸了：整隻站得住才結束，不然再往旁邊慢慢游上去（不然會被判定卡住、一口氣推開）
  if (!pmfStuck(e, e.x, e.y)) { pmfEnd(e); return false; }
  if (!f.shore || Math.hypot(f.shore.x - e.x, f.shore.y - e.y) < .5) {
    f.shore = null;
    for (let d = 2; d <= 36 && !f.shore; d += 2) for (let i = 0; i < 16; i++) {
      const a = i / 16 * Math.PI * 2, x = e.x + Math.cos(a) * d, y = e.y + Math.sin(a) * d;
      if (!pmfStuck(e, x, y)) { f.shore = { x, y }; break; }
    }
  }
  if (!f.shore) { pmfEnd(e); return false; }
  const dx = f.shore.x - e.x, dy = f.shore.y - e.y, d = Math.hypot(dx, dy), step = Math.min(d, speed * dt);
  if (d > 0) { e.x += dx / d * step; e.y += dy / d * step; }
  return true;
}
// 如果掙扎在這裡結束，(x, y) 這個位置怪物站不站得住（身體碰到深水、牆就算卡住）
function pmfStuck(e, x, y) {
  if (typeof enemyBlocked !== 'function') return false;
  if (enemyBlocked(x, y, null)) return true;
  const br = typeof enemyBodyR === 'function' ? enemyBodyR(e) : 10;
  return [[-br, -br], [br, -br], [-br, br], [br, br]].some(([sx, sy]) => deepWaterAtPoint(x + sx, y + sy));
}
function pmfEnd(e) {
  e.poolMFall = null; e.slimeLift = 0;
  if (typeof resetEnemyNavigation === 'function') resetEnemyNavigation(e);
}

// ---- 畫面（js/water.js 的 drawWaded 呼叫）：掉下去往前倒、掙扎時浮沉搖擺、泡在水裡 ----
function poolMonsterFallPose(e) {
  const f = e && e.poolMFall; if (!f) return null;
  const C = POOL_MONSTER_FALL;
  if (f.phase === 'fall') {
    const k = Math.min(1, f.t / C.fallSecs), dir = f.to.x >= f.from.x ? 1 : -1;
    return { rot: dir * k * .6, pivot: 10, dy: k * k * 10 };
  }
  const t = performance.now() / 1000 + f.seed, settle = Math.min(1, f.t / .3);
  const h = (e.drawHeight || 33) * (e.sizeMul || 1), w = (e.drawWidth || 42) * (e.sizeMul || 1);
  const calm = f.swimmer ? .3 : 1;   // 會游泳的：輕輕浮著，不掙扎
  return {
    rot: Math.sin(t * C.swaySpeed * calm) * C.swayAmp * calm, pivot: 6,
    dy: Math.sin(t * C.bobSpeed * calm) * C.bobAmp * calm + (1 - settle) * 12,
    wade: { w: { depth: C.sink, see: C.see }, bottom: e.y + 13, height: h, width: w },
  };
}
