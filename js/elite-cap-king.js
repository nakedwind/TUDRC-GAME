/* ===== 菁英 BOSS「順順宮主」：異質核心躲在大宮帽裡（K56 區地下街左上角）=====
   - 開場：地圖標好的位置各放一頂大宮帽（順順宮帽放大，蓋得住異質核心），核心躲在其中一頂裡。
           大宮帽像牆一樣擋路（擋住底下好幾格），打開的方式跟一般順順宮帽一樣（開槍、爆炸、火、照明彈…）。
   - 其中 bigCaps 頂（含核心那頂）各藏一隻「大夯吉寶」（放大、每一步都震動畫面，一次丟三頂帽子散開）：
       核心那頂＝大夯吉寶＋核心；其他頂＝大夯吉寶＋bigCapHangi 隻普通夯吉寶。
     其餘的帽子第一次打開跳出普通夯吉寶（spawnCount 隻）。蓋回去之後再打開，不管哪頂都只跳 reopenCount 隻。
   - 第一次找到核心：核心甦醒＝正式開戰（BOSS 血條、異質體狂暴化）。還有大夯吉寶活著時核心少受傷（coreShield）。
   - 核心露出來 exposeTime 秒後：所有打開的大宮帽一起蓋回去，接著「蓋杯子」洗牌——帽子兩兩交換位置，
     核心跟著它的帽子一起移動，眼睛跟得上就知道核心躲到哪一頂（暗處要靠照明彈或黑暗中的閃光）。
   - 之後再找到核心：不會再出現大夯吉寶，改跳 reopenCount 隻普通夯吉寶。一樣 exposeTime 秒後再蓋回去洗牌。
   - 大宮帽不會消失，直到核心被打破為止；大夯吉寶活著就一直留在場上。黑暗中大宮帽不會發光（跟一般順順宮帽一樣，要照亮才看得到）。
   地圖資料：maps.js 的 "capKing": { "caps": ["欄,列", …] }（🗺️ 地圖編輯器的「🎩 順順宮主帽子」標位置；至少 2 頂）。
   數值都在下面的 CAP_KING。必須在 hangi-bao.js、anomalous-core.js 之後、game.js 之前載入。
*/
const CAP_KING = {
  name: '順順宮主',
  capScale: 2.3,           // 大宮帽的大小（順順宮帽原圖的幾倍；一般地上的帽子是 1.2）
  blockW: 3, blockH: 2,    // 擋路範圍：寬幾格、高幾格（以標的那一格為下方中間）
  coreHp: 1000,            // 核心血量（取代 js/anomalous-core.js 的 CORE.hp × 難度）
  bigCaps: 3,              // 幾頂帽子各藏一隻大夯吉寶（其中一頂一定是核心那頂；血條在畫面上方縮短並排，js/core-frenzy.js）
  bigCapHangi: 2,          // 沒有核心、有大夯吉寶的帽子：另外跳出幾隻普通夯吉寶
  spawnCount: [3, 5],      // 其餘的帽子第一次打開跳出幾隻普通夯吉寶
  reopenCount: [1, 1],     // 蓋回去之後再打開，跳出幾隻普通夯吉寶
  exposeTime: 10,          // 核心露出來幾秒後蓋回去
  warnTime: 3,             // 蓋回去前幾秒：露出核心的那頂帽子開始發抖（提示快要蓋回去了）
  closeTime: .45,          // 蓋回去的動畫（秒）
  shuffle: { rounds: 7, pairs: 2, swapTime: .55, arc: 34, pause: .12, near: 1.5 },   // 洗牌：交換幾輪、每輪同時交換幾對、每次交換幾秒、交錯時往旁邊繞開幾像素、每輪之間停多久、只跟多近的帽子交換（最近兩頂帽子距離的幾倍；1.5＝只換上下左右相鄰的，不換斜對角、不跨過中間）
  coreShield: .9,          // 還有大夯吉寶活著（含還躲在帽子裡沒跳出來的）時，核心少受幾成傷害
  big: {                   // 大夯吉寶（以普通夯吉寶 data/monsters.js 的數值為基準）
    name: '大夯吉寶',
    scale: 2.6, hpMul: 18, dmgMul: 1.8, rewardMul: 5, crystalMul: 5,   // hpMul 18 → 血量 810
    speedMul: 1.5,         // 移動速度倍率（1＝跟普通夯吉寶一樣快）
    walkStride: 18,        // 走路動畫每走幾像素換一步（普通 10；體型大，步伐跟著放大）
    capSpread: { n: 3, angle: 22, scale: 1.8, hitR: 28 },   // 一次丟幾頂、相鄰兩頂差幾度、帽子放大、打中判定半徑（像素）
    boomerang: { noticeRange: 12, loseRange: 20, throwRange: 6.5, keepDistance: 2.5, windup: .55, cooldown: 2.2, capSpeed: 230 },   // 覆蓋普通夯吉寶的迴力鏢數值（欄位見 js/monster-data.js 的 BOOMERANG_FIELDS）
    stepEvery: 46,         // 每走幾像素踩一步（震動、揚塵、腳步聲）
    stepShake: 6, shakeRange: 16,   // 每一步的畫面震動（貼身時最大），溫特在幾格內才震
  },
};
const ckRand = ([a, b]) => Math.round(a + Math.random() * (b - a));

// ---- 開場：照地圖設定擺上大宮帽，把核心藏進其中一頂（game.js 在 seedCores 之後呼叫）----
function seedCapKing() {
  G.capKing = null;
  const cfg = typeof MAP !== 'undefined' && MAP && MAP.capKing;
  if (!cfg || MAP_SAFE || (typeof practiceOn === 'function' && practiceOn())) return;
  const spots = (Array.isArray(cfg.caps) ? cfg.caps : []).map(k => String(k).split(',').map(Number))
    .filter(([c, r]) => inGrid(c, r) && !isWall(c, r)).map(([c, r]) => { const [x, y] = center(c, r); return { c, r, x, y }; });
  if (spots.length < 2) return;
  // 核心：宮主自己帶一顆（地圖上原本的核心照樣留在原位，要另外打破）
  const difficulty = Math.max(1, Math.min(5, Number(MAP.difficulty) || 1)), hp = CORE.hp * difficulty;
  const core = { x: 0, y: 0, hp, maxhp: hp, lastHp: hp, dead: false, awake: false, phase: 0, awakeT: 0,
    timer: 2 + Math.random() * 2.4, reward: CORE.reward * difficulty, moteT: 0, hitT: 0, seed: Math.random() * 10 };
  G.cores.push(core);
  core.hp = core.maxhp = core.lastHp = CAP_KING.coreHp;
  G.hangiCaps = G.hangiCaps || [];
  const caps = spots.map((p, i) => {
    const cap = { x: p.x, y: p.y, c: p.c, r: p.r, state: 'closed', t: 0, boss: true, scale: CAP_KING.capScale, spawned: false, slot: i };
    G.hangiCaps.push(cap);
    capKingBlock(cap, true);
    return cap;
  });
  const coreCap = caps[Math.floor(Math.random() * caps.length)];
  // 大夯吉寶藏在哪幾頂：核心那頂一定有，其餘隨機挑
  const others = caps.filter(c => c !== coreCap).sort(() => Math.random() - .5);
  for (const cap of [coreCap, ...others.slice(0, Math.max(0, CAP_KING.bigCaps - 1))]) cap.hasBig = true;
  core.x = coreCap.x; core.y = coreCap.y; core.hidden = true;
  G.capKing = { caps, spots, core, coreCap, phase: 'hidden', t: 0, started: false, bigs: [] };
}

// ---- 擋路：大宮帽蓋著時佔住底下 blockW×blockH 格（打開、洗牌時不擋）----
function capKingCells(cap) {
  const out = [], W = CAP_KING.blockW, H = CAP_KING.blockH, c0 = cap.c - Math.floor((W - 1) / 2);
  for (let dc = 0; dc < W; dc++) for (let dr = 0; dr < H; dr++) {
    const c = c0 + dc, r = cap.r - dr;
    if (inGrid(c, r) && !isWall(c, r)) out.push(c + ',' + r);
  }
  return out;
}
function capKingBlock(cap, on) {
  if (!on) {
    for (const key of cap.cells || []) if (G.grid[key] && G.grid[key].cap === cap) delete G.grid[key];
    cap.cells = [];
    return;
  }
  cap.cells = capKingCells(cap).filter(key => !G.grid[key]);   // 已經有建築的格子不搶
  for (const key of cap.cells) G.grid[key] = { kind: 'hangiCap', cap };
  // 蓋下來時剛好站在底下的人：推到旁邊的空位
  const inside = o => o && cap.cells.includes(cellAt(o.x, o.y).join(','));
  if (inside(G.player) && typeof rescueStuck === 'function') rescueStuck(G.player, playerBlocked);
  for (const t of G.towers) if (inside(t)) rescueStuck(t, (x, y) => !sentryCellWalkable(...cellAt(x, y), true, true));
  for (const e of G.enemies) if (inside(e)) { rescueStuck(e, (x, y) => enemyBlocked(x, y, e)); if (typeof resetEnemyNavigation === 'function') resetEnemyNavigation(e); }
}

// ---- 打開大宮帽（hangi-bao.js 的 openHangiCap 轉過來）----
function openCapKingCap(cap) {
  const K = G.capKing;
  if (!K || cap.state !== 'closed' || (K.phase !== 'hidden' && K.phase !== 'exposed')) return;   // 蓋回去、洗牌中打不開
  cap.state = 'open'; cap.t = 0;
  capKingBlock(cap, false);
  const first = !cap.spawned; cap.spawned = true;
  const hasCore = K.coreCap === cap && !K.core.dead;
  if (typeof sfxAt === 'function') sfxAt('capKingPop', cap.x, cap.y, 1, 'hangi-cap');
  G.effects.push({ ring: true, x: cap.x, y: cap.y, r: 10, r2: 80, life: .4, life0: .4, color: hasCore ? '#c77bff' : '#ffd479' });
  if (typeof addLightFlash === 'function') addLightFlash('muzzle', cap.x, cap.y - 40);
  nearbyImpact(cap.x, cap.y, 3, 0);
  if (first) {
    if (typeof questEvent === 'function') questEvent('openCap');   // 支線進度（js/quests.js）
    if (typeof tryEquipDrop === 'function') tryEquipDrop('charm', cap.x, cap.y);   // 偶爾掉出順順宮平安符（js/equipment.js）
  }
  if (first && cap.hasBig) capKingSpawnBig(cap);   // 大夯吉寶：每頂只有第一次打開會跳出來
  if (hasCore) { capKingExpose(cap); if (!first) capKingPopHangi(cap, ckRand(CAP_KING.reopenCount)); return; }
  capKingPopHangi(cap, !first ? ckRand(CAP_KING.reopenCount) : cap.hasBig ? CAP_KING.bigCapHangi : ckRand(CAP_KING.spawnCount));
}
// 從帽子裡跳出普通夯吉寶（跟一般順順宮帽一樣往外彈開）
function capKingPopHangi(cap, n) {
  const spec = ACTIVE_MONSTERS.find(m => m.id === 'hangi_bao');
  if (!spec || n <= 0) return;
  flash('！', cap.x, cap.y - 70, '#ffd479', 1.2);
  for (let i = 0; i < n; i++) {
    const e = createMonster(spec, cap.x, cap.y);
    const a = (i / n) * Math.PI * 2 + Math.random() * .6, sp = 110 + Math.random() * 60;
    e.hb = { pop: .5, pvx: Math.cos(a) * sp, pvy: Math.sin(a) * sp * .7, vz: 190 + Math.random() * 60, cd: .6 + Math.random() * .8, wait: 0, target: G.player };
    G.enemies.push(e);
  }
}

// ---- 核心露出來 ----
function capKingExpose(cap) {
  const K = G.capKing, core = K.core;
  core.x = cap.x; core.y = cap.y; core.hidden = false;
  K.phase = 'exposed'; K.t = CAP_KING.exposeTime;
  if (!K.started) {   // 第一次找到：核心甦醒＝正式開戰
    K.started = true;
    if (!core.awake) { wakeCore(core); core.lastHp = core.hp; }
    if (typeof coreBanner === 'function') coreBanner(CAP_KING.name + '現身了', '找到異質核心！還有' + CAP_KING.big.name + '躲在其他帽子裡', '#ffd27a');
    systemNotice('找到異質核心了！核心過一陣子又會躲回帽子裡', true);
    return;
  }
  if (!core.awake) { wakeCore(core); core.lastHp = core.hp; }
  else capKingPool(core, true);   // 腐蝕痕跡跟著核心搬到新的位置
  flash('找到核心了！', cap.x, cap.y - CORE.h - 20, '#d69bff');
}
// 核心腳下的腐蝕痕跡：躲起來時收掉，露出來時在新的位置重新鋪上（js/anomalous-core.js 的 wakeCore 做的那一攤）
function capKingPool(core, on) {
  if (!core.pool) return;
  G.acidPools = (G.acidPools || []).filter(p => p !== core.pool);
  if (core.scorch) { G.scorchMarks = (G.scorchMarks || []).filter(s => s !== core.scorch); core.scorch = null; }
  if (!on) return;
  core.pool.x = core.x; core.pool.y = core.y + 8; core.pool.t = 999;
  G.acidPools.push(core.pool);
  keepCoreScorch(core);
}

// ---- 大夯吉寶 ----
const capKingBigsAlive = K => (K.bigs || []).filter(e => e.hp > 0 && !e.dead);
// 還躲在帽子裡、沒跳出來的大夯吉寶（核心打破後帽子交回一般帽子，就不會再跳出來了）
const capKingBigsHidden = K => K.over ? 0 : K.caps.filter(c => c.hasBig && !c.spawned).length;
// 大夯吉寶盯上溫特：播 BOSS 音樂（js/boss-music.js）
function capKingHunting() {
  const K = G && G.capKing; if (!K) return false;
  return capKingBigsAlive(K).some(e => e.hb && !(e.hb.pop > 0) && e.hb.target === G.player && G.player && G.player.hp > 0);
}
function capKingSpawnBig(cap) {
  const spec = ACTIVE_MONSTERS.find(m => m.id === 'hangi_bao');
  if (!spec) return;
  const B = CAP_KING.big, e = createMonster(spec, cap.x, cap.y + CELL * .6);
  e.capKing = true; e.eliteName = B.name;
  e.hp = e.maxhp = Math.round(e.maxhp * B.hpMul);
  e.playerDamage = Math.round(e.playerDamage * B.dmgMul);
  e.sentryDamage = Math.round(e.sentryDamage * B.dmgMul);
  e.buildingDamage = Math.round(e.buildingDamage * B.dmgMul);
  e.reward = Math.round(e.reward * B.rewardMul); e.crystals = Math.round((e.crystals ?? 2) * B.crystalMul);
  e.drawWidth = Math.round(spec.width * B.scale); e.drawHeight = Math.round(spec.height * B.scale);
  e.speed = spec.speed * B.speedMul; e.walkStride = B.walkStride;
  e.boomerangCfg = validBoomerangCfg({ ...(spec.boomerang || {}), ...B.boomerang });
  e.capSpread = B.capSpread;
  e.knockMul = .15; e.unpushable = true; e.noHitSquash = true; e.staggerTime = 0;   // 推不太動、被打不會硬直
  e.hb = { pop: .6, pvx: 0, pvy: 50, vz: 240, cd: 1.2, wait: 0, target: G.player };   // 從帽子裡跳出來
  e.ckStep = 0; e.ckX = e.x; e.ckY = e.y;
  G.enemies.push(e);
  G.capKing.bigs.push(e);
  for (let i = 0; i < 3; i++) G.effects.push({ ring: true, x: cap.x, y: cap.y - 40, r: 10 + i * 8, r2: 120 + i * 40, life: .45 + i * .15, life0: .45 + i * .15, color: i ? '#ffd27a' : '#ffffff' });
  nearbyImpact(cap.x, cap.y, 9, .06);
  flash('！！', cap.x, cap.y - e.drawHeight - 20, '#ffd27a', 1.4);
  systemNotice(B.name + '從帽子裡跳出來了！', true);
}
// 沉重的腳步：照實際走的距離算步數，每一步震一下畫面、揚灰、腳步聲
function capKingBigSteps(e) {
  const B = CAP_KING.big, moved = Math.hypot(e.x - e.ckX, e.y - e.ckY);
  e.ckX = e.x; e.ckY = e.y;
  if (moved > 30 || (e.hb && e.hb.pop > 0)) return;   // 被擊退、從帽子跳出來的那段不算走路
  e.ckStep += moved;
  if (e.ckStep < B.stepEvery) return;
  e.ckStep %= B.stepEvery;
  const p = G.player;
  if (p) {
    const d = Math.hypot(p.x - e.x, p.y - e.y) / CELL, k = 1 - d / B.shakeRange;
    if (d < B.shakeRange) addShake(B.stepShake * (.2 + .8 * k * k));   // 平方衰減：貼身震很大，越遠越小
  }
  e.hitSquashT = .07;   // 落腳時身體被壓扁一下
  G.effects.push({ ring: true, x: e.x, y: e.y + 12, r: 8, r2: 46, life: .3, life0: .3, color: '#b9b2a2' });
  for (let i = 0; i < 4; i++) G.effects.push({ particle: true, kind: 'spark', x: e.x + (Math.random() * 2 - 1) * 30, y: e.y + 12,
    vx: (Math.random() * 2 - 1) * 70, vy: -20 - Math.random() * 30, r: 2 + Math.random() * 2.5, life: .35, life0: .35, color: '#a9a292' });
  if (typeof sfxAt === 'function') sfxAt('capKingStep', e.x, e.y, 1, 'cap-king-step');
}
// 核心護盾：大夯吉寶活著時，核心這段時間少掉的血只算一部分（game.js、anomalous-core.js 呼叫）
function capKingShieldCore() {
  const K = G && G.capKing; if (!K || K.over) return;
  const core = K.core;
  if (core.dead || !(core.hp < core.lastHp)) return;
  // 躲在帽子裡：一滴血都不扣（哨兵在核心躲回去前就揮下去的刀、開的槍，game.js 結算時沒看 hidden）
  if (core.hidden) { core.hp = core.lastHp; return; }
  if (!core.awake || (!capKingBigsAlive(K).length && !capKingBigsHidden(K))) return;
  core.hp = core.lastHp - (core.lastHp - core.hp) * (1 - CAP_KING.coreShield);
  core.lastHp = core.hp; core.hitT = .16;
  const now = performance.now();
  if (now > (G.capKingShieldNoteAt || 0)) {   // 偶爾提示一下，不要每一槍都跳字
    G.capKingShieldNoteAt = now + 2500;
    flash('核心護盾：' + CAP_KING.big.name + '還活著', core.x, core.y - CORE.h - 14, '#ffd27a');
  }
}
// 畫面上方的 BOSS 血條（core-frenzy.js 的 drawCoreBossUI 呼叫）
function capKingBossBars() {
  const K = G && G.capKing; if (!K) return [];
  const alive = capKingBigsAlive(K), many = K.bigs.length > 1;
  return alive.map(e => ({ label: e.eliteName + (many ? ' ' + (K.bigs.indexOf(e) + 1) : ''), ratio: e.hp / e.maxhp, hit: e.hitT > 0, colors: ['#c9781f', '#ffd27a'], frame: '#ffb347', text: '#ffe2a8' }));
}
// 倒下（combat-feel.js 的 onEnemyDeath 呼叫）
function capKingBigDown(e) {
  nearbyImpact(e.x, e.y, 10, .08);
  e.deathSound = 'capKingDeath';   // 死掉的聲音：這裡先大聲播（有回音）；game.js 接著用同一個來源（monster-death）播的那聲會被去重吃掉，不會疊兩次
  if (typeof sfxAt === 'function') sfxAt('capKingDeath', e.x, e.y, 2.2, 'monster-death');
  const K = G.capKing; if (!K) return;
  const alive = capKingBigsAlive(K).filter(o => o !== e).length, hidden = capKingBigsHidden(K);
  if (K.over) { systemNotice(e.eliteName + '倒下了！' + (alive ? '還剩 ' + alive + ' 隻' : ''), true); return; }   // 核心已經打破：沒有護盾可解除
  if (alive || hidden) {   // 全部倒下（含還躲在帽子裡的）才解除核心護盾
    systemNotice(e.eliteName + '倒下了！還剩 ' + (alive + hidden) + ' 隻' + (hidden ? '（' + hidden + ' 隻還躲在帽子裡）' : ''), true);
    return;
  }
  systemNotice(e.eliteName + '全部倒下了！核心護盾消失', true);
  if (typeof coreBanner === 'function') coreBanner(e.eliteName + '全部倒下了', '核心護盾消失，趁核心露出來的時候打破它！', '#ffd27a');
}

// ---- 蓋回去、洗牌 ----
function capKingClose() {
  const K = G.capKing;
  K.phase = 'closing'; K.t = CAP_KING.closeTime;
  for (const cap of K.caps) if (cap.state === 'open') { cap.state = 'closed'; cap.dropT = CAP_KING.closeTime; }
  K.core.hidden = true;
  capKingPool(K.core, false);
  if (typeof sfxAt === 'function') sfxAt('capKingClose', K.coreCap.x, K.coreCap.y, .8, 'cap-king-close');
  systemNotice('核心躲回帽子裡了！注意帽子怎麼移動', true);
}
function capKingStartShuffle() {
  const K = G.capKing;
  for (const cap of K.caps) capKingBlock(cap, false);   // 洗牌中帽子滑來滑去，不擋路
  K.phase = 'shuffle'; K.round = 0; K.moves = []; K.t = CAP_KING.shuffle.pause;
}
// 兩個帽子位置算不算相鄰：距離在「最近兩個位置的距離 × near」以內（只換旁邊的，眼睛才跟得上）
function capKingNearLimit(K) {
  if (K.nearLimit) return K.nearLimit;
  let min = Infinity;
  for (const a of K.spots) for (const b of K.spots) if (a !== b) min = Math.min(min, Math.hypot(a.x - b.x, a.y - b.y));
  return (K.nearLimit = min * CAP_KING.shuffle.near + 1);
}
// 下一輪：挑幾對相鄰的帽子交換位置（同一頂帽子一輪只動一次）
function capKingNextRound() {
  const K = G.capKing, S = CAP_KING.shuffle, limit = capKingNearLimit(K);
  const order = K.caps.slice().sort(() => Math.random() - .5);
  if (Math.random() < .6) order.unshift(...order.splice(order.indexOf(K.coreCap), 1));   // 核心那頂多動幾次，不然太好猜
  const used = new Set();
  K.moves = [];
  for (const a of order) {
    if (K.moves.length >= S.pairs * 2) break;
    if (used.has(a)) continue;
    const sa = K.spots[a.slot];
    const near = order.filter(b => b !== a && !used.has(b) && Math.hypot(K.spots[b.slot].x - sa.x, K.spots[b.slot].y - sa.y) <= limit);
    if (!near.length) continue;
    const b = near[Math.floor(Math.random() * near.length)], sb = K.spots[b.slot];
    used.add(a); used.add(b);
    K.moves.push({ cap: a, from: sa, to: sb, side: 1 }, { cap: b, from: sb, to: sa, side: -1 });
  }
  K.t = S.swapTime; K.round++;
  if (typeof sfxAt === 'function') sfxAt('capKingShuffle', K.core.x, K.core.y, .35, 'cap-king-shuffle');
}
function capKingShuffleStep(dt) {
  const K = G.capKing, S = CAP_KING.shuffle;
  K.t -= dt;
  if (!K.moves.length) {   // 每輪之間的停頓
    if (K.t > 0) return;
    if (K.round >= S.rounds) { capKingEndShuffle(); return; }
    capKingNextRound();
    return;
  }
  const k = Math.min(1, 1 - K.t / S.swapTime), ease = k * k * (3 - 2 * k);
  for (const m of K.moves) {
    const dx = m.to.x - m.from.x, dy = m.to.y - m.from.y, d = Math.hypot(dx, dy) || 1;
    const off = Math.sin(ease * Math.PI) * S.arc * m.side;   // 兩頂交錯時往兩邊繞開
    m.cap.x = m.from.x + dx * ease - dy / d * off;
    m.cap.y = m.from.y + dy * ease + dx / d * off;
    m.cap.hop = Math.sin(ease * Math.PI) * 10;
  }
  if (k < 1) return;
  for (const m of K.moves) {
    m.cap.x = m.to.x; m.cap.y = m.to.y; m.cap.c = m.to.c; m.cap.r = m.to.r; m.cap.hop = 0;
    m.cap.slot = K.spots.indexOf(m.to);
  }
  K.moves = []; K.t = S.pause;
}
function capKingEndShuffle() {
  const K = G.capKing;
  for (const cap of K.caps) { cap.hop = 0; capKingBlock(cap, true); }
  K.core.x = K.coreCap.x; K.core.y = K.coreCap.y;
  K.phase = 'hidden';
}

// ---- 每幀（game.js 的 update 呼叫）----
function updateCapKing(dt) {
  const K = G && G.capKing;
  if (!K) return;
  const core = K.core;
  for (const e of capKingBigsAlive(K)) capKingBigSteps(e);
  if (K.over) {   // 核心已經打破：只剩大夯吉寶（血條、腳步照舊），全部倒下就收掉
    if (!capKingBigsAlive(K).length) G.capKing = null;
    return;
  }
  for (const cap of K.caps) {
    cap.t += dt;
    if (cap.dropT > 0) cap.dropT = Math.max(0, cap.dropT - dt);
    // 燒起來的油火蔓延到帽子：打開帽子
    if (cap.state === 'closed' && G.oilFires && G.oilFires.some(f => f.t > 0 && Math.hypot(cap.x - f.x, (cap.y - f.y) / .7) <= f.r + 30)) openHangiCap(cap);
  }
  if (core.dead) {   // 核心打破：大宮帽全部掀開，慢慢消失（交回一般順順宮帽的淡出）
    for (const cap of K.caps) {
      capKingBlock(cap, false);
      cap.boss = false; cap.state = 'open'; cap.t = Math.max(0, HANGI_CAP.openStay - 3); cap.hop = 0; cap.shake = false;
    }
    K.over = true; K.caps = [];   // 場上還有大夯吉寶的話先留著 G.capKing（血條、腳步、倒下提示）
    if (!capKingBigsAlive(K).length) G.capKing = null;
    return;
  }
  if (K.phase === 'shuffle') { capKingShuffleStep(dt); core.x = K.coreCap.x; core.y = K.coreCap.y; return; }
  if (K.phase === 'closing') { K.t -= dt; if (K.t <= 0) capKingStartShuffle(); return; }
  if (K.phase === 'exposed') {
    K.t -= dt;
    K.coreCap.shake = K.t < CAP_KING.warnTime;   // 快要蓋回去：那頂帽子發抖
    if (K.t <= 0) { K.coreCap.shake = false; capKingClose(); }
  }
}

// ---- 繪圖（hangi-bao.js 的 hangiCapSortables 轉過來）----
function capKingCapSortable(sortables, cap) {
  const s = cap.scale || CAP_KING.capScale, h = 59 * s;
  if (!isVisible(cap.x, cap.y) && !isVisible(cap.x, cap.y - h * .6)) return;
  sortables.push({ y: cap.y + 13, draw: () => drawCapKingCap(ctx, cap) });
}
function drawCapKingCap(ctx, cap) {
  const img = hbImg(cap.state === 'open' ? HANGI_CAP.openImage : HANGI_CAP.image);
  if (!img.complete || !img.naturalWidth) return;
  const s = cap.scale || CAP_KING.capScale, w = img.naturalWidth * s, h = img.naturalHeight * s;
  const pop = cap.state === 'open' && cap.t < .3 ? Math.sin(cap.t / .3 * Math.PI) * 14 : 0;   // 打開的瞬間彈一下
  const drop = cap.dropT > 0 ? (cap.dropT / CAP_KING.closeTime) ** 2 * 70 : 0;               // 蓋回去：從上面掉下來
  const lift = pop + drop + (cap.hop || 0);
  const jx = cap.shake ? (Math.random() * 2 - 1) * 2.5 : 0;                                  // 快要蓋回去：發抖
  ctx.save(); ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = 'rgba(7,16,21,.35)'; ctx.beginPath(); ctx.ellipse(cap.x, cap.y + 12, w * .45, 10 * Math.max(.5, 1 - lift / 120), 0, 0, Math.PI * 2); ctx.fill();
  ctx.drawImage(img, Math.round(cap.x - w / 2 + jx), Math.round(cap.y + 13 - h - lift), Math.round(w), Math.round(h));
  ctx.restore();
}
