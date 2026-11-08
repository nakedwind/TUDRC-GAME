/* ===== 菁英絲瓜小姐「絲瓜女王」（F307 右上農田房的地圖 BOSS）=====
   - 外觀：絲瓜小姐放大 LOOFAH_QUEEN.scale 倍；走路、抬腳、收腳、兩次踏地的間隔都慢 slow 倍。
   - 觸發：溫特走到 wakeRange 格內（看得到）、或打中她 → BOSS 戰開始（畫面上方 BOSS 血條＋中BOSS 音樂），她頭上的核心一起甦醒。
   - 踏地：每踏一次，從天上垂下好幾條藤蔓（森林垂吊藤蔓那一套，js/vines.js）：
       幾條瞄準我方站的地方，其他隨機落在她身邊。藤蔓垂下來的那段時間就是預警，走開就躲得掉。
       「捲走藤蔓」：碰到的人被捲上去，過一會兒從天上丟回附近的地面（摔一下、暈一下）。
       「倒吊藤蔓」：隊友碰到會被倒吊在半空中，溫特要開槍把藤蔓打斷才救得下來（溫特碰到照樣被捲走丟回來）。
       垂下來的藤蔓停 vines.life 秒就縮回去；一樣怕火。
   - 核心：被異質絲瓜藤纏著吊在她頭上的半空中，跟著她走。打不到、炸不到。
       她活著時異質絲瓜藤燒不掉；她倒下後，核心還吊在原地，這時用火（燃燒彈、油桶的火海、希奧妮的攻擊）燒正下方 → 藤蔓燒斷、核心掉下來，才打得到。
   - 4 片農田：一直長著會纏人的絲瓜藤（走上去就被纏住，跟絲瓜小姐的藤蔓一樣：連按方向鍵掙扎、溫特開槍幫隊友射斷）。
       怕火：被火海或希奧妮的火燒到 → 整片藤蔓消失 farm.burnTime 秒，之後再長出來。
   - 守衛：她身邊另外有 guards.count 隻普通絲瓜小姐（金蕉王隊員那一套，離她太遠會走回來）。
   出現在哪張地圖、生在哪一格：LOOFAH_QUEEN.maps（地圖 id → 欄、列）。那一格附近 core.adopt 格內有地圖本來的核心就用那顆，沒有就自己帶一顆。
   數值都在下面的 LOOFAH_QUEEN。必須在 loofah-lady.js、vines.js、anomalous-core.js 之後、game.js 之前載入。
*/
const LOOFAH_QUEEN = {
  name: '絲瓜女王',
  maps: { map_f307boss: { c: 86, r: 15 }, map_mw2dn6re: { c: 113, r: 23 } },   // 出現在哪幾張地圖、生在哪一格（測試：F307 BOSS 場地、F307 本圖的農田房上方）
  hp: 3000, dmgMul: 1.5, rewardMul: 6, crystalMul: 6,   // 以絲瓜小姐（data/monsters.js）為基準；hp：血量（再乘整體難度）
  scale: 2.5,                    // 體型放大倍率
  slow: 2,                       // 動作慢幾倍：走路速度 ÷ slow；抬腳、收腳、踏地間隔 × slow（以絲瓜小姐的 LOOFAH 為基準）
  wakeRange: 7,                  // 溫特走到幾格內（看得到）就觸發 BOSS 戰
  loseRange: 16,                 // 目標離她幾格以外就不追
  leash: 9,                      // 最遠走到離原位幾格（不會被引出農田房）
  stompRange: 9,                 // 目標在幾格內（看得到）就踏地
  keepDistance: 3,               // 目標太近（格）：往後退一點
  vines: {                       // 每次踏地垂下來的藤蔓
    count: 6,                    // 一次幾條
    aimed: 3,                    // 其中最多幾條瞄準我方（溫特、隊友站的地方；其他隨機落在她身邊）
    aimJitter: .5,               // 瞄準的那幾條會偏開多少（格）
    spreadMin: 2, spreadMax: 7,  // 隨機的那幾條：落在離她幾格～幾格
    hangChance: .5,              // 每條有幾成是「倒吊藤蔓」（綁隊友），其餘是「捲走藤蔓」（拉走再丟下來）
    gap: 1.5,                    // 兩條藤蔓至少隔幾格
    life: 6,                     // 完全垂下來之後停幾秒就縮回去
    ground: {                    // 從地面鑽出來的藤蔓：把人抓到半空中，不能動、不能打
      count: 2,                  // 每次踏地鑽出幾條（瞄準我方站的地方；先挑沒被天上藤蔓瞄準的人）
      warn: .9,                  // 地面先冒土、震動幾秒才鑽出來（這段時間走開就躲得掉）
      grabR: 32,                 // 鑽出來時離多近的人會被抓（像素）
      hold: 4,                   // 抓在半空中最久幾秒（隊友可以被溫特開槍打斷藤蔓救下來；火燒也會放開）
      throwChance: .5,           // 幾成的藤蔓不是抓著，而是把人往最近的牆丟過去
      throwAfter: .35,           // 往上拉幾秒後甩出去
      throwRange: 8,             // 往幾格內最近的牆丟（範圍內沒有牆：就丟往隨便一個方向，落地而已）
      throwSpeed: 430,           // 飛出去的速度（像素／秒）
      throwUp: 160,              // 飛出去時往上的速度（拋物線；像素／秒）
      wallDamage: 15,            // 撞到牆扣多少 HP（不會撞到倒下，最少留 1）；之後跟被丟下來一樣躺著暈
    },
  },
  core: {
    hp: 1000,                    // 核心血量（地圖難度 1；難度越高照比例加）
    adopt: 9,                    // 出生格幾格內有地圖本來的核心：用那顆（沒有就自己帶一顆；核心會吊在她頭上跟著走，所以原本在哪都沒關係）
    above: 26,                   // 吊在她頭頂上方多高（像素，從頭頂往上量）
    fireR: 30,                   // 她倒下後：火海離核心正下方多近（像素）就把藤蔓燒斷
    fall: 1700,                  // 掉下來的重力
  },
  guards: { count: 3, radius: 2.5 },   // 一起守核心的絲瓜小姐：幾隻、生在離她幾格的地方
  farm: {                        // 農田上會纏人的絲瓜藤
    tile: 'tile_forest_bg_outside_farm01',   // 哪一種素材算農田
    range: 16,                   // 離她出生格幾格內的農田才長藤蔓
    cols: [1.3, 2.4, 3.5, 4.6],  // 一片農田（6×4 格）上藤蔓長在哪幾欄、哪幾列（從農田左上角量，格）
    rows: [1.5, 2.6],
    catchR: 20,                  // 腳底離藤蔓多近就被纏住（像素）
    rootTime: 4,                 // 被纏住幾秒（可以掙扎、開槍幫隊友射斷）
    safeTime: 2,                 // 掙脫後幾秒內不會又被同一片農田纏住（讓人走得出來）
    fireR: 20,                   // 火海離藤蔓多近算燒到（像素）
    burnTime: 25,                // 燒掉後幾秒再長出來
  },
};

const lqSpot = () => typeof MAP !== 'undefined' && MAP ? LOOFAH_QUEEN.maps[MAP.id] || null : null;
const lqAlive = e => !!(e && !e.dead && e.hp > 0 && G.enemies.includes(e));
const lqDist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

// ---- 開場（game.js 在 seedCores、seedVines 之後呼叫）----
// G.loofahQueens：[{ e, core, state, h, fallV, plots }]；state：carried（吊在她頭上）→ hung（她倒下，吊在原地）→ falling → down
function seedLoofahQueen() {
  G.loofahQueens = [];
  const spot = lqSpot();
  if (!spot || MAP_SAFE || (typeof practiceOn === 'function' && practiceOn())) return;
  const base = ACTIVE_MONSTERS.find(m => m.id === 'loofah_lady');
  if (!base || !inGrid(spot.c, spot.r) || isWall(spot.c, spot.r)) return;
  const Q = LOOFAH_QUEEN, [x, y] = center(spot.c, spot.r);
  // 核心：出生格附近有地圖本來的核心就用那顆，沒有就自己帶一顆
  const difficulty = Math.max(1, Math.min(5, Number(MAP.difficulty) || 1));
  let core = G.cores.find(c => !c.dead && Math.hypot(c.x - x, c.y - y) <= Q.core.adopt * CELL);
  if (!core) {
    const hp = CORE.hp * difficulty;
    core = { x, y, hp, maxhp: hp, lastHp: hp, dead: false, awake: false, phase: 0, awakeT: 0,
      timer: 2 + Math.random() * 2.4, reward: CORE.reward * difficulty, moteT: 0, hitT: 0, seed: Math.random() * 10 };
    G.cores.push(core);
  }
  core.hp = core.maxhp = core.lastHp = Math.round(Q.core.hp * difficulty);
  core.carried = true; core.x = x; core.y = y;   // carried：打不到、炸不到、阿瓦倫靠近也不會醒（js/game.js、js/anomalous-core.js）
  lqCorePool(core, false);
  const e = createMonster(base, x, y);
  e.loofahQueen = true; e.eliteName = Q.name;
  e.hp = e.maxhp = Math.round(e.maxhp / base.hp * Q.hp);   // createMonster 給的是絲瓜小姐血量 × 整體難度：換成女王的血量，難度照樣乘
  e.playerDamage = Math.round(e.playerDamage * Q.dmgMul);
  e.sentryDamage = Math.round(e.sentryDamage * Q.dmgMul);
  e.buildingDamage = Math.round(e.buildingDamage * Q.dmgMul);
  e.reward = Math.round(e.reward * Q.rewardMul); e.crystals = Math.round((e.crystals ?? 5) * Q.crystalMul);
  e.drawWidth = Math.round(base.width * Q.scale); e.drawHeight = Math.round(base.height * Q.scale);
  e.speed = base.speed / Q.slow;
  e.knockMul = 0; e.staggerTime = 0; e.unpushable = true; e.noHitSquash = true; e.wide = true;   // 推不動、不硬直、擠不進一格寬的窄道
  e.lq = { home: { x, y }, cd: 2, windup: 0, recover: 0, wait: 1, spot: null, hp0: e.hp, target: null };
  G.enemies.push(e);
  const rec = { e, core, state: 'carried', h: 0, fallV: 0, plots: [] };
  G.loofahQueens.push(rec);
  // 守衛：普通絲瓜小姐，跟著她（金蕉王隊員的規則：離她太遠就走回來，js/golden-banana-king.js）
  for (let i = 0; i < Q.guards.count; i++) {
    const a = i / Q.guards.count * Math.PI * 2 + Math.random() * .5, at = lqFreeSpot(x + Math.cos(a) * Q.guards.radius * CELL, y + Math.sin(a) * Q.guards.radius * CELL);
    if (!at) continue;
    const g = createMonster(base, at.x, at.y);
    g.squadLeader = e;
    G.enemies.push(g);
  }
  // 農田：出生格附近的農田素材，各長一片會纏人的絲瓜藤
  for (const st of MAP.stamps || []) {
    if (st.id !== Q.farm.tile) continue;
    const t = mapTileById(st.id); if (!t) continue;
    const w = mapStampW(st, t), h = mapStampH(st, t);
    if (Math.hypot(st.c + w / 2 - spot.c, st.r + h / 2 - spot.r) > Q.farm.range) continue;
    const plot = { c: st.c, r: st.r, w, h, state: 'grown', t: 0, vines: [] };
    rec.plots.push(plot);
    lqGrowPlot(plot, false);
  }
}
// 這個點附近最近一格空地（站得下怪物）
function lqFreeSpot(x, y) {
  const [gc, gr] = cellAt(x, y);
  for (let rad = 0; rad <= 3; rad++) for (let dr = -rad; dr <= rad; dr++) for (let dc = -rad; dc <= rad; dc++) {
    if (Math.max(Math.abs(dc), Math.abs(dr)) !== rad) continue;
    const c = gc + dc, r = gr + dr;
    if (!inGrid(c, r) || isWall(c, r)) continue;
    const [px, py] = center(c, r);
    if (!enemyBlocked(px, py)) return { x: px, y: py };
  }
  return null;
}
// 核心的腐蝕痕跡：吊在半空中時拿掉，掉到地上才鋪
function lqCorePool(core, on) {
  if (!core.pool) return;
  G.acidPools = (G.acidPools || []).filter(p => p !== core.pool);
  if (core.scorch) { G.scorchMarks = (G.scorchMarks || []).filter(s => s !== core.scorch); core.scorch = null; }
  if (!on) return;
  core.pool.x = core.x; core.pool.y = core.y + 8; core.pool.t = 999;
  G.acidPools.push(core.pool);
  if (typeof keepCoreScorch === 'function') keepCoreScorch(core);
}

// ---- 觸發 BOSS 戰 ----
function lqWake(e) {
  if (e.eliteAwake) return;
  e.eliteAwake = true; e.alertT = ENEMY_ALERT_TIME; e.lq.cd = Math.min(e.lq.cd, 1.5);
  const rec = (G.loofahQueens || []).find(r => r.e === e), core = rec && rec.core;
  if (core && !core.dead && !core.awake) { wakeCore(core); core.lastHp = core.hp; lqCorePool(core, false); }   // 核心一起甦醒（還是打不到）
  if (typeof coreBanner === 'function') coreBanner(LOOFAH_QUEEN.name + '發現你了', '', '#d9f5b8');   // 不寫提示：怎麼打讓玩家自己探索
  systemNotice(LOOFAH_QUEEN.name + '發現你了！', true);
  const top = e.y - e.drawHeight * .7;
  for (let i = 0; i < 3; i++) G.effects.push({ ring: true, x: e.x, y: top, r: 8 + i * 6, r2: 110 + i * 40, life: .45 + i * .15, life0: .45 + i * .15, color: i ? '#cdeeaa' : '#ffffff' });
  if (typeof sfxAt === 'function') sfxAt('loofahStomp', e.x, e.y, 1.4, 'loofah-queen-wake');
}

// ---- 選目標：溫特優先（夠近、看得到）；不在就找看得到的最近隊員 ----
function lqTarget(e) {
  const p = G.player, R = LOOFAH_QUEEN.loseRange * CELL;
  if (p && p.hp > 0 && !p.vineCap && lqDist(p, e) <= R && hasLineOfSight(e.x, e.y, p.x, p.y)) return p;
  let best = null, bestD = R;
  for (const t of G.towers) {
    if (t.hp <= 0 || t.berserk || t.vineCap || !enemyNoticesSentry(e, t)) continue;
    const d = lqDist(t, e);
    if (d <= bestD && hasLineOfSight(e.x, e.y, t.x, t.y)) { best = t; bestD = d; }
  }
  return best;
}

// ---- 行為（enemy-ai.js 的 stepEnemy 呼叫）----
function stepLoofahQueen(e, dt) {
  const Q = LOOFAH_QUEEN, L = LOOFAH, q = e.lq;
  // 腳步聲：體型大，步子跨得遠；比較大聲
  const moved = q.lx == null ? 0 : Math.hypot(e.x - q.lx, e.y - q.ly);
  q.lx = e.x; q.ly = e.y;
  if (moved > .1 && moved < 20) {
    q.stepDist = (q.stepDist || 0) + moved;
    if (q.stepDist >= L.stepEvery * Q.scale * .6) { q.stepDist = 0; if (typeof sfxAt === 'function') sfxAt('loofahStep', e.x, e.y, .8, 'loofah-queen-step'); }
  }
  if (e.hp < q.hp0) lqWake(e);   // 被打到：BOSS 戰開始
  q.hp0 = e.hp;
  q.cd -= dt;
  if (e.stunT > 0) { q.windup = 0; q.recover = 0; e.forceFrame = null; return; }
  if (q.windup > 0) {   // 抬腳 → 重踏
    q.windup -= dt; e.forceFrame = L.stompFrame;
    if (q.windup <= 0) lqStomp(e);
    return;
  }
  if (q.recover > 0) { q.recover -= dt; return; }
  e.forceFrame = null;
  if (!e.eliteAwake) {
    const p = G.player;
    if (p && p.hp > 0 && lqDist(p, e) <= Q.wakeRange * CELL && hasLineOfSight(e.x, e.y, p.x, p.y)) lqWake(e);
    else { lqIdle(e, dt); return; }
  }
  const t = lqTarget(e), home = q.home;
  q.target = t;
  if (!t) {   // 沒有目標：走回原位
    if (lqDist(e, home) > CELL) { const [hc, hr] = cellAt(home.x, home.y); enemyNavigate(e, hc, hr, dt, 'lqueen-home', true); }
    return;
  }
  const d = lqDist(t, e);
  if (d <= Q.stompRange * CELL && hasLineOfSight(e.x, e.y, t.x, t.y)) {
    if (d < Q.keepDistance * CELL) moveEnemyToward(e, { x: e.x - (t.x - e.x), y: e.y - (t.y - e.y) }, dt * .6);
    if (q.cd <= 0) { q.windup = L.windup * Q.slow; q.aim = t; e.faceRight = t.x > e.x; }
    return;
  }
  // 走過去，但不離開原位 leash 格
  let gx = t.x, gy = t.y;
  const hd = Math.hypot(gx - home.x, gy - home.y), R = Q.leash * CELL;
  if (hd > R) { gx = home.x + (gx - home.x) / hd * R; gy = home.y + (gy - home.y) / hd * R; }
  if (Math.hypot(gx - e.x, gy - e.y) < CELL * .6) return;
  const [gc, gr] = cellAt(gx, gy);
  const nav = enemyNavigate(e, gc, gr, dt, 'lqueen:' + gc + ',' + gr, true);
  if (nav && nav.blocker) enemyAttackObstacle(e, nav.blocker, dt);
}
// 還沒開戰：在原位附近慢慢走走、發呆
function lqIdle(e, dt) {
  const q = e.lq, L = LOOFAH;
  if (q.spot) {
    const moved = moveEnemyToward(e, q.spot, dt * L.wanderSpeedMul);
    if (!moved || lqDist(q.spot, e) <= 3) { q.spot = null; q.wait = llRand(L.idleMin, L.idleMax) * LOOFAH_QUEEN.slow; }
    return;
  }
  q.wait -= dt;
  if (q.wait > 0) return;
  for (let i = 0; i < 8; i++) {
    const a = Math.random() * Math.PI * 2, r = (.6 + Math.random() * 2) * CELL, x = q.home.x + Math.cos(a) * r, y = q.home.y + Math.sin(a) * r;
    if (!enemyBlocked(x, y, e) && hasLineOfSight(e.x, e.y, x, y)) { q.spot = { x, y }; break; }
  }
  q.wait = llRand(L.idleMin, L.idleMax) * LOOFAH_QUEEN.slow;
}

// ---- 重踏：大震動、揚塵，從天上垂下好幾條藤蔓 ----
function lqStomp(e) {
  const Q = LOOFAH_QUEEN, L = LOOFAH, q = e.lq, V = Q.vines;
  q.cd = L.cooldown * Q.slow; q.recover = L.recover * Q.slow; e.forceFrame = null;
  G.effects.push({ ring: true, x: e.x, y: e.y + 12, r: 14, r2: 46 * Q.scale, life: .45, life0: .45, color: '#b9a27a' });
  G.effects.push({ ring: true, x: e.x, y: e.y + 12, r: 8, r2: 28 * Q.scale, life: .3, life0: .3, color: '#e3d3a8' });
  for (let i = 0; i < 16; i++) llDust(e.x + (Math.random() - .5) * 30 * Q.scale, e.y + 12, 1);
  if (typeof nearbyImpact === 'function') nearbyImpact(e.x, e.y, 10, .18); else addShake(5);
  if (typeof sfxAt === 'function') sfxAt('loofahStomp', e.x, e.y, 1.4, 'loofah-queen-stomp');
  if (!G.vines) G.vines = [];
  let made = 0;
  // 瞄準我方：離她最近的幾個人站的地方
  const people = [G.player, ...G.towers].filter(a => a && a.hp > 0 && !a.vineCap && lqDist(a, e) <= Q.loseRange * CELL)
    .sort((a, b) => lqDist(a, e) - lqDist(b, e)).slice(0, V.aimed);
  for (const a of people) {
    const ang = Math.random() * Math.PI * 2, j = Math.random() * V.aimJitter * CELL;
    if (lqDropVine(a.x + Math.cos(ang) * j, a.y + Math.sin(ang) * j, e)) made++;
  }
  // 從地面鑽出來的藤蔓：瞄準我方站的地方（先挑沒被天上藤蔓瞄準的人）
  const all = [G.player, ...G.towers].filter(a => a && a.hp > 0 && !a.vineCap && lqDist(a, e) <= Q.loseRange * CELL && hasLineOfSight(e.x, e.y, a.x, a.y));
  const picks = [...all.filter(a => !people.includes(a)), ...all.filter(a => people.includes(a))].slice(0, V.ground.count);
  for (const a of picks) (G.lqGround = G.lqGround || []).push({ x: a.x, y: a.y + 12, t: V.ground.warn, puff: 0, owner: e });
  // 其他：隨機落在她身邊（看得到的地方，不會穿牆垂到隔壁房間）
  for (let k = 0; k < 60 && made < V.count; k++) {
    const ang = Math.random() * Math.PI * 2, d = (V.spreadMin + Math.random() * (V.spreadMax - V.spreadMin)) * CELL;
    const x = e.x + Math.cos(ang) * d, y = e.y + Math.sin(ang) * d;
    if (!hasLineOfSight(e.x, e.y, x, y)) continue;
    if (lqDropVine(x, y, e)) made++;
  }
}
// 在 (x, y) 垂下一條藤蔓（放進 G.vines，js/vines.js 負責垂下來、抓人、怕火；lqTemp：時間到就縮回去、用完就拿掉）
function lqDropVine(x, y, e) {
  const V = LOOFAH_QUEEN.vines, [c, r] = cellAt(x, y);
  if (!inGrid(c, r) || isWall(c, r) || (typeof mapFloorCells === 'function' && !mapFloorCells().has(c + ',' + r))) return false;
  if (G.vines.some(v => v.lqTemp && v.state !== 'gone' && Math.hypot(v.x - x, v.y - 8 - y) < V.gap * CELL)) return false;
  const kind = Math.random() < V.hangChance ? 'hang' : 'toss';
  G.vines.push({ c, r, x, y: y + 8, kind, state: 'descend', t: 0, len: 0, seed: Math.random() * 10, twitch: 0, lqTemp: true, lqLife: V.life, lqOwner: e });
  return true;
}

// ---- 每幀（game.js 的 update 呼叫，在 updateLoofahVines 之後、updateVines 之前）----
function updateLoofahQueen(dt) {
  if (!G.loofahQueens || !G.loofahQueens.length) return;
  // 女王垂下來的藤蔓：停夠久就縮回去；縮完（或抓完人）就拿掉
  if (G.vines) {
    for (const v of G.vines) {
      if (!v.lqTemp || v.state !== 'hang') continue;
      v.lqLife -= dt;
      if (v.lqLife <= 0) { v.state = 'retract'; v.len = 1; v.regrowAfter = 1e9; }
    }
    G.vines = G.vines.filter(v => !(v.lqTemp && v.state === 'gone'));
  }
  for (const a of [G.player, ...G.towers]) if (a && a.lqFarmSafeT > 0) a.lqFarmSafeT = Math.max(0, a.lqFarmSafeT - dt);
  lqUpdateGroundVines(dt);
  for (const rec of G.loofahQueens) {
    lqUpdateCore(rec, dt);
    for (const plot of rec.plots) lqUpdatePlot(plot, dt);
  }
}

// ---- 從地面鑽出來的藤蔓：先冒土震動 → 鑽出來，旁邊的人被藤蔓纏住抬到半空中（用 js/vines.js 倒吊藤蔓那一套，cap.ground＝從下面撐著、不翻過來）----
function lqUpdateGroundVines(dt) {
  const V = LOOFAH_QUEEN.vines.ground;
  if (G.lqGround && G.lqGround.length) {
    for (const g of G.lqGround) {
      g.t -= dt; g.puff -= dt;
      if (g.t > 0) {   // 預警：地面一直冒土、小小的震動圈
        if (g.puff <= 0) { g.puff = .12; llDust(g.x + (Math.random() - .5) * 26, g.y, Math.random() < .5); G.effects.push({ ring: true, x: g.x, y: g.y, r: 4, r2: V.grabR, life: .3, life0: .3, color: '#8a7a50' }); }
        continue;
      }
      lqGroundErupt(g);
    }
    G.lqGround = G.lqGround.filter(g => g.t > 0);
  }
  // 被丟出去的人：飛向牆，撞到就摔下來
  for (const cap of G.vineCaps || []) if (cap.ground && cap.phase === 'thrown') lqThrowStep(cap, dt);
  // 被抓在半空中的人：時間到、或被火燒到就放下來；要丟的那一半：拉起來一下就甩出去
  for (const cap of G.vineCaps || []) {
    if (!cap.ground || (cap.phase !== 'hang' && cap.phase !== 'wrap' && cap.phase !== 'lift')) continue;
    if (cap.throwWall && cap.phase === 'lift' && cap.t >= V.throwAfter) { lqThrowStart(cap); continue; }
    const a = cap.actor, burnt = typeof anyFireAt === 'function' && anyFireAt(a.x, a.y + 10, 30);
    if (cap.phase === 'hang') cap.holdT -= dt;
    if (burnt) for (let i = 0; i < 3; i++) spawnFlameBurst(a.x + (Math.random() - .5) * 12, a.y - Math.random() * cap.h, .55);
    if (burnt || cap.holdT <= 0) {
      if (cap.phase === 'wrap') { G.vineCaps = G.vineCaps.filter(c => c !== cap); a.vineCap = false; a.vineSafeT = VINES.safeTime; }
      else vineDropHung(cap);
    }
  }
}
function lqGroundErupt(g) {
  const V = LOOFAH_QUEEN.vines.ground, p = G.player;
  G.effects.push({ ring: true, x: g.x, y: g.y, r: 6, r2: V.grabR + 14, life: .35, life0: .35, color: '#7fbf5a' });
  for (let i = 0; i < 8; i++) llDust(g.x + (Math.random() - .5) * 30, g.y, true);
  for (let i = 0; i < 10; i++) {   // 碎土、葉片往上噴
    const a = -Math.PI / 2 + (Math.random() - .5) * 1.4, sp = 80 + Math.random() * 120;
    G.effects.push({ particle: true, x: g.x + (Math.random() - .5) * 14, y: g.y - 4, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: 1.6 + Math.random() * 2, life: .5, life0: .5, color: Math.random() < .5 ? '#7a6a48' : '#7fbf5a' });
  }
  if (typeof sfxAt === 'function') sfxAt('loofahVine', g.x, g.y, .9, 'loofah-queen-ground-vine');
  if (G.over) return;
  for (const a of [p, ...G.towers]) {
    if (!a || typeof vineCanGrab !== 'function' || !vineCanGrab(a, a === p)) continue;
    if (Math.hypot(a.x - g.x, (a.y + 12 - g.y) * 1.3) > V.grabR) continue;
    lqGroundGrab(a, a === p, g);
  }
}
function lqGroundGrab(a, isPlayer, g) {
  if (isPlayer && typeof cancelChannel === 'function' && typeof playerChannel !== 'undefined' && playerChannel) cancelChannel();
  if (isPlayer && a.sitting && typeof standUp === 'function') standUp();
  const v = { x: a.x, y: a.y, kind: 'hang', state: 'grab', t: 0, len: 1, seed: Math.random() * 10, twitch: 0, temp: true };   // 假的藤蔓（不放進 G.vines）
  const V = LOOFAH_QUEEN.vines.ground;
  G.vineCaps.push({ v, actor: a, isPlayer, mode: 'hang', ground: true, holdT: V.hold, phase: 'wrap', t: 0, h: 0, throwWall: Math.random() < V.throwChance,
    x0: a.x, y0: a.y, hp: a.hp, camX: cam.x, camY: cam.y, topH: (a.y - cam.y) + 110, seed: Math.random() * 10 });
  a.vineCap = true; a.dashT = 0; a.knockT = 0; a.rootT = 0;
  if (!isPlayer) { a.navPath = null; a.navGoal = null; a.meleeSwing = null; a.gunSwing = null; }
  flash(isPlayer ? '被藤蔓抓到半空中了！' : '隊友被藤蔓抓住了！', a.x, a.y - 56, '#9fe07a', .9);
  if (isPlayer) addShake(3);
  if (typeof sfxAt === 'function') sfxAt('vineGrab', a.x, a.y, .8);
}
// 把人往最近的牆丟：16 個方向一格一格往外找，找到最近的牆就往那邊飛
function lqThrowStart(cap) {
  const V = LOOFAH_QUEEN.vines.ground, a = cap.actor;
  const blocked = cap.isPlayer ? playerBlocked : (typeof sentryBlocked === 'function' ? sentryBlocked : playerBlocked);
  let best = null, bestD = Infinity;
  for (let i = 0; i < 16; i++) {
    const ang = i / 16 * Math.PI * 2, dx = Math.cos(ang), dy = Math.sin(ang);
    for (let d = 10; d <= V.throwRange * CELL; d += 10) {
      if (blocked(a.x + dx * d, a.y + dy * d)) { if (d < bestD) { bestD = d; best = ang; } break; }
    }
  }
  const ang = best ?? Math.random() * Math.PI * 2;
  cap.phase = 'thrown'; cap.t = 0; cap.tx = Math.cos(ang); cap.ty = Math.sin(ang); cap.vh = V.throwUp; cap.spin = 0;
  cap.spinDir = cap.tx >= 0 ? 1 : -1; cap.lieSide = cap.spinDir;
  G.effects.push({ ring: true, x: a.x, y: a.y - cap.h, r: 6, r2: 34, life: .3, life0: .3, color: '#9fe07a' });
  if (typeof sfxAt === 'function') sfxAt('swordSwing', a.x, a.y, .5, 'loofah-queen-throw');
  flash('被甩出去了！', a.x, a.y - 56 - cap.h, '#9fe07a', .8);
}
function lqThrowStep(cap, dt) {
  const V = LOOFAH_QUEEN.vines.ground, a = cap.actor;
  const blocked = cap.isPlayer ? playerBlocked : (typeof sentryBlocked === 'function' ? sentryBlocked : playerBlocked);
  cap.t += dt; cap.vh -= 900 * dt; cap.h = Math.max(0, cap.h + cap.vh * dt);
  cap.spin += cap.spinDir * 9 * dt;   // 在空中翻滾
  const step = V.throwSpeed * dt, nx = cap.x0 + cap.tx * step, ny = cap.y0 + cap.ty * step;
  if (blocked(nx, ny)) {   // 撞牆！
    const dmg = Math.min(V.wallDamage, Math.max(0, a.hp - 1));
    if (dmg > 0 && !(typeof practiceOn === 'function' && practiceOn())) { a.hp -= dmg; cap.hp = a.hp; flashDmg('-' + dmg, a.x, a.y - 46, '#ff6b6b'); }
    flash('撞到牆了！', a.x, a.y - 60, '#ffd27a', .8);
    G.effects.push({ ring: true, x: nx, y: ny - cap.h, r: 4, r2: 30, life: .3, life0: .3, color: '#e8dcc0' });
    for (let i = 0; i < 8; i++) G.effects.push({ particle: true, x: nx, y: ny - cap.h - 10, vx: -cap.tx * (40 + Math.random() * 80) + (Math.random() - .5) * 60, vy: -30 - Math.random() * 60, r: 1.5 + Math.random() * 1.5, life: .45, life0: .45, color: '#b9a27a' });
    if (typeof nearbyImpact === 'function') nearbyImpact(a.x, a.y, cap.isPlayer ? 8 : 5, .08); else addShake(5);
    if (typeof sfxAt === 'function') sfxAt('knock2', a.x, a.y, .9, 'loofah-queen-wall');
    lqThrowLand(cap, true);
    return;
  }
  cap.x0 = nx; cap.y0 = ny;   // js/vines.js 的 stepVineCap 會把人放到 x0, y0
  if (cap.h <= 0 && cap.vh < 0) lqThrowLand(cap, false);   // 沒撞到牆：落地
}
// 撞牆或落地：交給 js/vines.js 的「掉下來」那一段（彈兩下、躺著暈）
function lqThrowLand(cap, wall) {
  const a = cap.actor;
  a.x = cap.x0; a.y = cap.y0;
  cap.phase = 'fall'; cap.t = 0; cap.fallV = wall ? 60 : Math.max(0, -cap.vh); cap.cut = true;
  cap.h = Math.max(1, cap.h); cap.fallH0 = Math.max(1, cap.h);
}
// 畫從地面撐起來的藤（js/vines.js 的 drawVineActor 呼叫）：從腳下的地面長上來，接到腰上；兩三根粗細不一的藤交纏
function lqDrawGroundStalk(ctx, cap, a, ax, ay) {
  if (cap.phase === 'thrown') return;   // 已經被甩出去：沒有藤
  const gx = a.x, gy = a.y + 14, h = gy - ay;
  if (h < 4 || typeof vineStroke !== 'function') return;
  const seed = cap.seed || 1, now = performance.now() / 1000;
  for (let i = 0; i < 3; i++) {
    const off = (i - 1) * 7, sway = Math.sin(now * 2 + seed + i) * 4;
    vineStroke(ctx, [[gx + off, gy], [gx + off * 1.8 + sway + (i - 1) * 10, gy - h * .55], [ax + off * .3, ay + 4]], (i === 1 ? 11 : 7), seed + i);
  }
  ctx.fillStyle = 'rgba(70,52,30,.55)';   // 地面被撐破的土
  ctx.beginPath(); ctx.ellipse(gx, gy + 1, 14, 5, 0, 0, Math.PI * 2); ctx.fill();
}

// ---- 核心：吊在女王頭上 → 她倒下後吊在原地 → 被火燒斷藤蔓掉下來 ----
function lqUpdateCore(rec, dt) {
  const core = rec.core, e = rec.e, Q = LOOFAH_QUEEN;
  if (!core || core.dead) return;
  if (rec.state === 'carried') {
    if (!lqAlive(e)) { rec.state = 'hung'; return; }
    core.x = e.x; core.y = e.y; rec.h = e.drawHeight + Q.core.above;
    if (typeof anyFireAt === 'function' && anyFireAt(core.x, core.y, Q.core.fireR) && Math.random() < dt * 6)   // 她活著：火燒不斷，只冒幾顆綠色火星
      G.effects.push({ particle: true, kind: 'spark', x: core.x + (Math.random() - .5) * 20, y: core.y - rec.h + 10, vx: (Math.random() - .5) * 40, vy: -(20 + Math.random() * 30), r: 1.5 + Math.random(), life: .4, life0: .4, color: '#9fe07a' });
    return;
  }
  if (rec.state === 'hung') {
    if (typeof anyFireAt === 'function' && anyFireAt(core.x, core.y, Q.core.fireR)) {   // 燒斷吊著核心的藤蔓
      rec.state = 'falling'; rec.fallV = 0;
      for (let i = 0; i < 4; i++) spawnFlameBurst(core.x + (Math.random() * 2 - 1) * 10, core.y - rec.h + Math.random() * 30, .8);
      if (typeof sfxAt === 'function') sfxAt('hitIncendiary', core.x, core.y, .6, 'loofah-queen-core-burn');
    }
    return;
  }
  if (rec.state === 'falling') {
    rec.fallV += Q.core.fall * dt; rec.h -= rec.fallV * dt;
    if (rec.h > 0) return;
    rec.h = 0; rec.state = 'down';
    core.carried = false; core.lastHp = core.hp;   // 掉到地上：打得到了
    if (core.awake) lqCorePool(core, true);
    G.effects.push({ ring: true, x: core.x, y: core.y, r: 8, r2: 80, life: .45, life0: .45, color: '#b56bff' });
    for (let i = 0; i < 6; i++) {
      const a = Math.random() * Math.PI * 2, sp = 8 + Math.random() * 16;
      if (typeof pushCorrosionMist === 'function') pushCorrosionMist(core.x + Math.cos(a) * 12, core.y + 4 + Math.sin(a) * 8, Math.cos(a) * sp, Math.sin(a) * sp);
    }
    if (typeof nearbyImpact === 'function') nearbyImpact(core.x, core.y, 8, .1); else addShake(3);
    if (typeof sfxAt === 'function') sfxAt('vineLand', core.x, core.y, .9, 'loofah-queen-core-land');
    systemNotice('異質核心掉下來了！', true);
  }
}

// ---- 倒下（combat-feel.js 的 onEnemyDeath 呼叫）：核心留在半空中、她垂下來的藤蔓縮回去 ----
function loofahQueenDown(e) {
  const rec = (G.loofahQueens || []).find(r => r.e === e);
  if (rec && rec.state === 'carried') { rec.state = 'hung'; rec.core.x = e.x; rec.core.y = e.y; }
  for (const v of G.vines || []) if (v.lqTemp && v.lqOwner === e && (v.state === 'hang' || v.state === 'descend')) { v.state = 'retract'; v.regrowAfter = 1e9; }
  if (typeof sfxAt === 'function') sfxAt('loofahDeath', e.x, e.y, 2.2, 'monster-death');   // 先大聲播；game.js 接著播的那聲會被去重吃掉
  systemNotice(e.eliteName + '倒下了！', true);
  if (typeof coreBanner === 'function') coreBanner(e.eliteName + '倒下了', '', '#d9f5b8');   // 不提示要用火燒
  if (typeof nearbyImpact === 'function') nearbyImpact(e.x, e.y, 12, .1);
}

// ---- 農田的絲瓜藤（放進 G.loofahVines，farm 標記；畫法、掙扎、開槍幫隊友都跟絲瓜小姐的藤蔓一樣，js/loofah-lady.js）----
function lqGrowPlot(plot, fx) {
  const F = LOOFAH_QUEEN.farm, now = performance.now() / 1000;
  plot.vines = [];
  for (const dc of F.cols) for (const dr of F.rows) {
    const x = OX + (plot.c + dc) * CELL, y = OY + (plot.r + dr) * CELL;
    const v = { farm: plot, owner: null, target: null, x, y, ux: 0, uy: 0, left: 0, travel: 0, state: 'grab', t: 0, puff: 0, cracks: [],
      seed: Math.random() * 9, eruptAt: now - Math.random() * .1, lingerT: 1e9, caught: [] };
    plot.vines.push(v);
    (G.loofahVines = G.loofahVines || []).push(v);
    if (fx) for (let i = 0; i < 2; i++) llDust(x + (Math.random() - .5) * 20, y + 4, true);
  }
  plot.state = 'grown';
  if (fx && typeof sfxAt === 'function') sfxAt('loofahVine', OX + (plot.c + plot.w / 2) * CELL, OY + (plot.r + plot.h / 2) * CELL, .6, 'loofah-farm-grow');
}
function lqUpdatePlot(plot, dt) {
  const F = LOOFAH_QUEEN.farm;
  if (plot.state === 'burnt') {
    plot.t -= dt;
    if (plot.t <= 0) {
      if (lqPlotOnFire(plot)) plot.t = 1;   // 還在燒：等火滅了再長
      else lqGrowPlot(plot, true);
    }
    return;
  }
  if (!lqPlotOnFire(plot)) return;
  // 被火燒到：整片藤蔓縮回去、放開被纏住的人，burnTime 秒後再長出來
  plot.state = 'burnt'; plot.t = F.burnTime;
  for (const v of plot.vines) {
    for (const a of v.caught) { a.rootT = 0; a.lqFarmSafeT = F.safeTime; }
    v.caught = []; v.state = 'retract'; v.rt = 0;
    if (Math.random() < .5) spawnFlameBurst(v.x + (Math.random() - .5) * 10, v.y - 6, .6);
  }
  if (typeof sfxAt === 'function') sfxAt('hitIncendiary', OX + (plot.c + plot.w / 2) * CELL, OY + (plot.r + plot.h / 2) * CELL, .45, 'loofah-farm-burn');
}
// 農田有沒有被火海燒到：看每一條藤蔓長的位置（燒掉後照同樣的位置看，等火滅了才長回來）
function lqPlotOnFire(plot) {
  if (typeof anyFireAt !== 'function') return false;
  const F = LOOFAH_QUEEN.farm;
  return F.cols.some(dc => F.rows.some(dr => anyFireAt(OX + (plot.c + dc) * CELL, OY + (plot.r + dr) * CELL, F.fireR)));
}
// 一條農田藤蔓每幀（js/loofah-lady.js 的 updateLoofahVines 呼叫）：碰到的人纏住；放開的人一陣子內不會再被纏
function lqFarmVineStep(v, dt) {
  const F = LOOFAH_QUEEN.farm;
  v.caught = v.caught.filter(a => { if (a.rootT > 0 && a.hp > 0) return true; a.lqFarmSafeT = F.safeTime; return false; });
  if (G.over) return;
  for (const a of [G.player, ...G.towers]) {
    if (!a || a.hp <= 0 || a.rootT > 0 || a.lqFarmSafeT > 0 || a.vineCap || a.vineDazeT > 0 || a.berserk || a.grabbed || a.eatenBy || a.mrtRide) continue;
    if (Math.hypot(a.x - v.x, (a.y - v.y) * 1.3) > F.catchR) continue;
    v.caught.push(a); a.rootT = F.rootTime; a.rootT0 = F.rootTime; a.knockT = 0;
    if (a === G.player) { a.struggleCount = 0; a.moving = false; }
    else { a.helpCount = 0; a.navPath = null; a.navGoal = null; if (typeof mateHurtSay === 'function') mateHurtSay(a, 'rooted'); }   // 對話編輯器「被絲瓜藤纏住」
    G.effects.push({ ring: true, x: v.x, y: v.y + 4, r: 6, r2: F.catchR + 12, life: .3, life0: .3, color: '#7fbf5a' });
    if (typeof sfxAt === 'function') sfxAt('loofahVine', v.x, v.y, .5, 'loofah-farm-grab');
  }
}

// ---- 畫面上方的 BOSS 血條（core-frenzy.js 的 drawCoreBossUI 呼叫）：女王＋吊著的核心 ----
// ---- 希奧妮附近沒有怪物可打時，會自己去燒的地方（js/game.js 的 pickSentryTarget 呼叫）----
// 長滿藤蔓的農田（燒農田中間）、女王倒下後還吊著的核心（燒核心正下方）。
// 回傳假的目標（不是怪物、不會扣誰的血），同一個地方每次都回傳同一個物件，瞄準動畫才接得上。
function loofahFireTargets() {
  const out = [];
  for (const v of G.loofahVines || []) {   // 絲瓜小姐纏住我方的藤蔓：燒掉就放開（js/loofah-lady.js 的 loofahVineBurn）
    if (v.farm || v.state !== 'grab' || !(v.caught || []).some(a => a.rootT > 0 && a.hp > 0)) continue;
    v.fireTarget = v.fireTarget || { fireSpot: true, dead: false, hp: 1e9, maxhp: 0, x: v.x, y: v.y };
    out.push(v.fireTarget);
  }
  for (const rec of G.loofahQueens || []) {
    if (rec.state === 'hung' && rec.core && !rec.core.dead) {
      rec.fireTarget = rec.fireTarget || { fireSpot: true, dead: false, hp: 1e9, maxhp: 0 };
      rec.fireTarget.x = rec.core.x; rec.fireTarget.y = rec.core.y;
      out.push(rec.fireTarget);
    }
    for (const plot of rec.plots) {
      if (plot.state !== 'grown') continue;
      plot.fireTarget = plot.fireTarget || { fireSpot: true, dead: false, hp: 1e9, maxhp: 0, x: OX + (plot.c + plot.w / 2) * CELL, y: OY + (plot.r + plot.h / 2) * CELL };
      out.push(plot.fireTarget);
    }
  }
  return out;
}

function loofahQueenBars() {
  const out = [];
  for (const rec of G.loofahQueens || []) {
    const e = rec.e, alive = lqAlive(e), core = rec.core;
    if (alive && !e.eliteAwake) continue;
    if (alive) out.push({ label: e.eliteName, ratio: e.hp / e.maxhp, hit: e.hitT > 0, colors: ['#5e9a3a', '#c8f08a'], frame: '#b6e08a', text: '#eaffd6' });
    if (core && !core.dead && core.carried) out.push({ label: '異質核心（被絲瓜藤吊著）', ratio: core.hp / core.maxhp, hit: core.hitT > 0, colors: ['#7b3cff', '#c78bff'], frame: '#a970ff', text: '#e3b8ff' });
  }
  return out;
}
// 中BOSS 音樂：女王醒著、盯上人（js/boss-music.js）
const loofahQueenHunting = () => (G.loofahQueens || []).some(rec => lqAlive(rec.e) && rec.e.eliteAwake && rec.e.lq && rec.e.lq.target);

// ---- 畫面：吊在半空中的核心（render.js 跟角色一起排前後）----
function loofahQueenSortables(list) {
  for (const rec of G.loofahQueens || []) {
    const core = rec.core;
    if (!core || core.dead || rec.state === 'down') continue;
    list.push({ y: core.y + 14, draw: () => drawLoofahQueenCore(ctx, rec) });
  }
}
function drawLoofahQueenCore(ctx, rec) {
  const core = rec.core, now = performance.now() / 1000;
  const sway = rec.state === 'falling' ? 0 : Math.sin(now * 1.1 + core.seed) * 4;
  const len = CORE.h * .8, w = CORE.w * .8, cx = core.x + sway, cy = core.y - rec.h;   // 核心中心
  if (!isVisible(core.x, cy) && !isVisible(core.x, core.y)) return;
  // 地上的影子
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,' + (.28 * Math.max(.3, 1 - rec.h / 400)).toFixed(3) + ')';
  ctx.beginPath(); ctx.ellipse(core.x, core.y + 6, 18, 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  // 從天上垂下來吊著核心的異質絲瓜藤（掉下來時已經燒斷，不畫）
  if (rec.state !== 'falling' && typeof drawVineStem === 'function')
    drawVineStem(ctx, { x: core.x, seed: core.seed }, cx, cy - len * .35, now, true);
  if (coreImg.complete && coreImg.naturalWidth) {
    ctx.save(); ctx.imageSmoothingEnabled = false;
    ctx.drawImage(coreImg, cx - w / 2, cy - len / 2, w, len);
    const glow = flashSprite(coreImg, '#c99bff');   // 核心微微發紫光，一明一暗
    if (glow) {
      ctx.globalAlpha = .1 + .12 * (.5 + .5 * Math.sin(now * 3 + core.seed));
      ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(glow, cx - w / 2, cy - len / 2, w, len);
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    }
    if (core.hitT > 0) drawHitFlash(coreImg, Math.min(1, core.hitT / .16), '#d69bff', cx - w / 2, cy - len / 2, w, len);
    ctx.restore();
  }
  // 纏在核心上的藤（絲瓜小姐纏人的畫法）
  if (rec.state !== 'falling' && typeof drawWrap === 'function') {
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    drawWrap(ctx, { x: cx, y: cy - 4, rootT: 1, struggleT: 0 }, 1, now, core.seed);
    ctx.restore();
  }
}
