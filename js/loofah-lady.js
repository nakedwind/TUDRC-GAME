/* ===== 絲瓜小姐（behavior: "vine"）=====
   ・看到玩家或哨兵就走近；進到射程後抬腳（stomp 圖）→ 重踏地面，畫面震一下。
   ・絲瓜藤鑽進地底，朝目標「踏下去那一刻的位置」往前鑽：地上一路冒出煙塵、留下裂痕，提示藤蔓往哪裡去。
   ・鑽到底就從地面冒出來：範圍內的玩家和隊友都會被纏住，LOOFAH.rootTime 秒不能移動（還是可以開槍、攻擊），之後放開。
   ・看到煙塵就快點閃開！被纏住時連按方向鍵可以掙扎，縮短被纏的時間（隊友會自己扭動，但時間照舊）。
   ・幫隊友掙脫：隊友被纏住時，溫特在手槍射程內（data/characters.js 溫特的 playerAttack.range 格）、看得到隊友，就能用手槍朝他身上的藤蔓開槍，
     把藤蔓射斷：每打中一發縮短的時間跟自己被纏住時按一下方向鍵一樣（LOOFAH.struggleCut）。開槍照常扣子彈、要裝填，不會打傷隊友。
   必須在 enemy-ai.js 之後、game.js 之前載入。數值在下面的 LOOFAH。
*/
const LOOFAH = {
  noticeRange: 8,       // 看到玩家／哨兵的距離（格）
  loseRange: 13,        // 追多遠就放棄（格）
  stompRange: 5.5,      // 幾格內會踏地放藤蔓
  keepDistance: 2.5,    // 太近會稍微退開（格）
  windup: 0.55,         // 抬腳多久才踏下去（秒）
  recover: 0.45,        // 踏完腳收回的時間（秒）
  cooldown: 3,          // 兩次踏地之間隔幾秒
  vineSpeed: 170,       // 藤蔓在地底鑽的速度（像素／秒）
  vineOvershoot: 0.4,   // 藤蔓會比目標位置多鑽幾格（目標已經不在了才用得到）
  vineTurn: 2.4,        // 藤蔓在地底追目標的轉彎速度（弧度／秒；越大越難閃）
  vineReach: 12,        // 鑽到離目標腳下幾像素就冒出來
  vineMaxTravel: 9,     // 藤蔓最多鑽幾格（追不到就在那裡冒出來）
  eruptRadius: 34,      // 冒出來時抓人的範圍（像素）
  rootTime: 7,          // 被纏住幾秒
  linger: 3,            // 藤蔓冒出來後在地上停留幾秒：這段時間內有人碰到也會被抓住
  struggleCut: 0.25,    // 被纏住時每「按一下」方向鍵，少纏幾秒（拚命連按約 2 秒就能掙脫）
  struggleMin: 1,       // 至少被纏幾秒才可能掙脫          // 被纏住幾秒
  testSpawn: false,     // 測試用：開始戰鬥時在離溫特約 20 格的地方直接放一隻（測完改成 false）
  testSpawnDist: 20,    // 測試用：離溫特幾格
  eruptDamage: true,    // 冒出來時造成一次傷害（怪物編輯器的「玩家傷害／哨兵傷害」）
  wanderRadius: 2.5, wanderSpeedMul: 0.55, idleMin: 1.5, idleMax: 3.5,
  stompFrame: 'images/monster/loofah-lady/loofah-lady-stomp.png',
  stepEvery: 20,        // 走幾像素響一次腳步聲
};
const llRand = (a, b) => a + Math.random() * (b - a);

// ---- 目標 ----
function llTargets(e) {
  const list = [], p = G.player;
  if (p && p.hp > 0) list.push(p);
  for (const t of G.towers) if (t.hp > 0 && !t.berserk && enemyNoticesSentry(e, t)) list.push(t);
  return list;
}
function llPickTarget(e) {
  const dist = t => Math.hypot(t.x - e.x, t.y - e.y), targets = llTargets(e);
  if ((e.playerAggroT || 0) > 0 && targets.includes(G.player) && dist(G.player) <= ENEMY_SENSE_RANGE) return G.player;
  if (e.sentryAggroT > 0 && targets.includes(e.sentryAggro) && dist(e.sentryAggro) <= ENEMY_SENSE_RANGE) return e.sentryAggro;
  let best = null, bestD = LOOFAH.noticeRange * CELL;
  for (const t of targets) { const d = dist(t); if (d <= bestD && hasLineOfSight(e.x, e.y, t.x, t.y)) { best = t; bestD = d; } }
  return best;
}

// ---- 行為（enemy-ai.js 的 stepEnemy 呼叫）----
function stepVineEnemy(e, dt) {
  const C = LOOFAH;
  if (!e.ll) e.ll = { cd: 1 + Math.random() * 1.5, wait: Math.random() * 2 };
  const ll = e.ll;
  ll.cd -= dt;
  // 腳步聲：走路動畫每 10 像素換一張（js/render.js），4 張一輪踏兩步 → 每走 20 像素響一聲
  const moved = ll.lx == null ? 0 : Math.hypot(e.x - ll.lx, e.y - ll.ly);
  ll.lx = e.x; ll.ly = e.y;
  if (moved > .2 && moved < 20) {
    ll.stepDist = (ll.stepDist || 0) + moved;
    if (ll.stepDist >= C.stepEvery) { ll.stepDist = 0; if (typeof sfxAt === 'function') sfxAt('loofahStep', e.x, e.y, .4, 'loofah-step'); }   // 黑暗中也聽得到（越遠越小聲）
  }
  if (e.stunT > 0) { ll.windup = 0; ll.recover = 0; e.forceFrame = null; return; }
  // 抬腳 → 重踏
  if (ll.windup > 0) {
    ll.windup -= dt; e.forceFrame = C.stompFrame;
    if (ll.windup <= 0) loofahStomp(e);
    return;
  }
  if (ll.recover > 0) { ll.recover -= dt; return; }   // 踏完：站一下
  e.forceFrame = null;
  let target = llPickTarget(e);
  if (!target && ll.target && ll.target.hp > 0 && Math.hypot(ll.target.x - e.x, ll.target.y - e.y) <= C.loseRange * CELL) target = ll.target;
  ll.target = target;
  if (target) {
    const d = Math.hypot(target.x - e.x, target.y - e.y);
    if (d <= C.stompRange * CELL && hasLineOfSight(e.x, e.y, target.x, target.y)) {
      if (d < C.keepDistance * CELL) moveEnemyToward(e, { x: e.x - (target.x - e.x), y: e.y - (target.y - e.y) }, dt * .6);
      if (ll.cd <= 0) { ll.windup = C.windup; ll.aim = target; e.faceRight = target.x > e.x; }
      return;
    }
    const [gc, gr] = cellAt(target.x, target.y);
    const nav = enemyNavigate(e, gc, gr, dt, 'loofah:' + gc + ',' + gr, true);
    if (nav && nav.blocker) enemyAttackObstacle(e, nav.blocker, dt);
    return;
  }
  // 沒事做：發呆、走走
  if (ll.spot) {
    const moved = moveEnemyToward(e, ll.spot, dt * C.wanderSpeedMul);
    if (!moved || Math.hypot(ll.spot.x - e.x, ll.spot.y - e.y) <= 3) { ll.spot = null; ll.wait = llRand(C.idleMin, C.idleMax); }
    return;
  }
  ll.wait -= dt;
  if (ll.wait <= 0) {
    const o = typeof squadAnchor === 'function' ? squadAnchor(e) : e;   // 金蕉王的隊員：繞著隊長散步（js/golden-banana-king.js）
    for (let i = 0; i < 8; i++) {
      const a = Math.random() * Math.PI * 2, r = (.6 + Math.random() * (C.wanderRadius - .6)) * CELL, x = o.x + Math.cos(a) * r, y = o.y + Math.sin(a) * r;
      if (!enemyBlocked(x, y) && hasLineOfSight(e.x, e.y, x, y)) { ll.spot = { x, y }; break; }
    }
    ll.wait = llRand(C.idleMin, C.idleMax);
  }
}

// ---- 重踏：震動、揚塵，放出一條鑽地的藤蔓 ----
function loofahStomp(e) {
  const C = LOOFAH, ll = e.ll, t = ll.aim;
  ll.cd = C.cooldown; ll.recover = C.recover; e.forceFrame = null;
  G.effects.push({ ring: true, x: e.x, y: e.y + 12, r: 8, r2: 46, life: .35, life0: .35, color: '#b9a27a' });
  G.effects.push({ ring: true, x: e.x, y: e.y + 12, r: 4, r2: 28, life: .25, life0: .25, color: '#e3d3a8' });
  for (let i = 0; i < 8; i++) llDust(e.x + (Math.random() - .5) * 30, e.y + 12, 1);
  if (typeof nearbyImpact === 'function') nearbyImpact(e.x, e.y, 5, .1); else addShake(2);
  if (typeof sfxAt === 'function') sfxAt('loofahStomp', e.x, e.y, .8, 'loofah-stomp');
  if (!t || t.hp <= 0) return;
  const dx = t.x - e.x, dy = t.y - e.y, d = Math.hypot(dx, dy) || 1;
  const len = d + C.vineOvershoot * CELL;
  (G.loofahVines = G.loofahVines || []).push({ owner: e, target: t, x: e.x, y: e.y + 10, ux: dx / d, uy: dy / d, left: len, travel: 0, state: 'dig', t: 0, puff: 0, cracks: [], seed: Math.random() * 9 });
}
function llDust(x, y, big) {
  const n = big ? 2 : 1;
  for (let i = 0; i < n; i++)
    G.effects.push({ particle: true, kind: 'spark', x: x + (Math.random() - .5) * 8, y: y - 2, vx: (Math.random() - .5) * 30, vy: -(18 + Math.random() * 30),
      r: 2 + Math.random() * 2.5, life: .45 + Math.random() * .3, life0: .75, color: Math.random() < .5 ? '#a8936c' : '#cdbb91' });
}

// ---- 藤蔓：鑽地 → 冒出來纏人 → 放開（game.js 的 update 呼叫）----
function updateLoofahVines(dt) {
  if (LOOFAH.testSpawn) loofahTestSpawn(dt);
  if (G.loofahVines && G.loofahVines.length) {
    const C = LOOFAH;
    for (const v of G.loofahVines) {
      v.t += dt;
      if (v.state === 'dig') {
        // 追目標：朝目標現在的腳下慢慢轉彎（轉彎速度有上限，跑得快還是閃得掉）；鑽到腳下就冒出來
        const tg = v.target;
        if (tg && tg.hp > 0 && !(tg.rootT > 0)) {
          const want = Math.atan2(tg.y - v.y, tg.x - v.x), cur = Math.atan2(v.uy, v.ux);
          let diff = want - cur; while (diff > Math.PI) diff -= Math.PI * 2; while (diff < -Math.PI) diff += Math.PI * 2;
          const a = cur + Math.max(-C.vineTurn * dt, Math.min(C.vineTurn * dt, diff));
          v.ux = Math.cos(a); v.uy = Math.sin(a);
          const dist = Math.hypot(tg.x - v.x, tg.y - v.y);
          v.left = dist <= C.eruptRadius * .8 ? 0   // 已經在腳邊（抓得到的範圍）：直接冒出來，不要在旁邊繞圈
            : Math.min(C.vineMaxTravel * CELL - v.travel, Math.max(0, dist - C.vineReach) + (Math.abs(diff) > .6 ? CELL : 0));
        }
        let move = C.vineSpeed * dt;
        while (move > 0 && v.state === 'dig') {
          const s = Math.min(4, move); move -= s; v.left -= s; v.travel = (v.travel || 0) + s;
          const nx = v.x + v.ux * s, ny = v.y + v.uy * s, [c, r] = cellAt(nx, ny);
          if (!inGrid(c, r) || isWall(c, r)) { v.left = 0; }   // 撞到牆：就在牆前冒出來
          else { v.x = nx; v.y = ny; }
          v.puff -= s;
          if (v.puff <= 0) { v.puff = 10; llDust(v.x, v.y, Math.random() < .4); v.cracks.push({ x: v.x, y: v.y, a: Math.atan2(v.uy, v.ux) + (Math.random() - .5) * .9, life: 1.4 }); }
          if (v.left <= 0) loofahErupt(v);
        }
      } else if (v.state === 'grab') {
        v.lingerT -= dt;
        if (v.lingerT > 0) llCatchNearby(v);   // 還停在地上：有人碰到就抓
        for (const a of v.caught) if (a.hp <= 0) a.rootT = 0;
        if (v.lingerT <= 0 && !v.caught.some(a => a.rootT > 0 && a.hp > 0)) { v.state = 'retract'; v.rt = 0; for (const a of v.caught) a.rootT = 0; }
      } else if (v.state === 'retract') {
        v.rt += dt; if (v.rt > .35) v.done = true;
      }
      for (const k of v.cracks) k.life -= dt;
      v.cracks = v.cracks.filter(k => k.life > 0);
    }
    G.loofahVines = G.loofahVines.filter(v => !v.done || v.cracks.length);
  }
  // 被纏住的人：倒數
  const tick = a => {
    if (!a) return;
    if (a.struggleT > 0) a.struggleT = Math.max(0, a.struggleT - dt);
    if (a.helpHintT > 0) a.helpHintT = Math.max(0, a.helpHintT - dt);   // 「幫隊友掙脫」小提示
    if (!(a.rootT > 0)) return;
    a.rootT = Math.max(0, a.rootT - dt);
    if (a.rootT <= 0 && a === G.player && (a.struggleCount || 0) >= 2) loofahBreakFree(a);   // 掙脫
  };
  tick(G.player);
  for (const t of G.towers) {
    tick(t);
    if (t.rootT > 0 && !(t.struggleT > 0) && Math.random() < dt * 1.6) { t.struggleT = .18; t.struggleDir = [Math.random() < .5 ? -1 : 1, 0]; }   // 隊友自己扭動
  }
}
function loofahErupt(v) {
  const C = LOOFAH, e = v.owner;
  v.state = 'grab'; v.et = 0; v.eruptAt = performance.now() / 1000; v.lingerT = C.linger; v.caught = [];
  G.effects.push({ ring: true, x: v.x, y: v.y + 4, r: 6, r2: C.eruptRadius + 10, life: .3, life0: .3, color: '#7fbf5a' });
  for (let i = 0; i < 6; i++) llDust(v.x + (Math.random() - .5) * 26, v.y + 4, true);
  if (typeof sfxAt === 'function') sfxAt('loofahVine', v.x, v.y, .8, 'loofah-vine');
  llCatchNearby(v);
}
// 抓住藤蔓旁邊的人（冒出來那一刻，還有停在地上的這段時間都會呼叫；同一根藤蔓不會重複抓同一個人）
function llCatchNearby(v) {
  const C = LOOFAH, e = v.owner;
  const p = G.player, inR = a => Math.hypot(a.x - v.x, a.y - v.y) <= C.eruptRadius && !v.caught.includes(a) && !(a.rootT > 0);
  if (p && p.hp > 0 && inR(p)) {
    v.caught.push(p); p.rootT = C.rootTime; p.rootT0 = C.rootTime; p.struggleCount = 0; p.knockT = 0; p.moving = false;
    if (C.eruptDamage && e) {
      const dmg = Math.round(typeof equipPlayerDamage === 'function' ? equipPlayerDamage(e.playerDamage ?? 6) : e.playerDamage ?? 6);
      p.hp = Math.max(0, p.hp - dmg); p.hitT = .35; p.underAttackT = 5; p.lastAttacker = e;
      G.damageVignetteT = Math.max(G.damageVignetteT || 0, .3);
      flashDmg('-' + dmg, p.x, p.y - 46, '#ff6b6b'); addShake(2);
      playPlayerHit(1, true);
      if (p.hp <= 0 && !G.over) { flash('部隊長失去戰鬥能力', p.x, p.y - 58, '#ff5b6e'); lose('player', '被' + monsterNameOf(e) + '的絲瓜藤纏住'); }
    }
  }
  for (const t of G.towers) {
    if (t.hp <= 0 || t.berserk || !inR(t)) continue;
    v.caught.push(t); t.rootT = C.rootTime; t.rootT0 = C.rootTime; t.helpCount = 0; t.knockT = 0; t.navPath = null; t.navGoal = null;
    if (C.eruptDamage && e && !e.dead) { e.atkCd = 0; enemyAttackSentry(e, t, 0); t.knockT = 0; }
  }
}
// 測試用：開戰 1 秒後，在離溫特約 testSpawnDist 格、離哨兵至少 6 格的空地放一隻（太遠放不下就慢慢往近處找）
function loofahTestSpawn(dt) {
  if (G.loofahTestDone || MAP_SAFE || !G.running || G.over || !G.player) return;
  G.loofahTestT = (G.loofahTestT || 0) + dt;
  if (G.loofahTestT < 1) return;
  G.loofahTestDone = true;
  const spec = ACTIVE_MONSTERS.find(m => m.id === 'loofah_lady'), p = G.player;
  if (!spec) return;
  const D = LOOFAH.testSpawnDist, dists = [];
  for (let k = 0; k <= D; k++) { dists.push(D + k); if (k) dists.push(D - k); }   // 20、21、19、22、18…
  for (const d of dists) if (d > 2) for (let k = 0; k < 32; k++) {
    const a = k / 32 * Math.PI * 2, x = p.x + Math.cos(a) * d * CELL, y = p.y + Math.sin(a) * d * CELL, [c, r] = cellAt(x, y);
    if (!inGrid(c, r) || enemyBlocked(x, y)) continue;
    if (G.towers.some(t => t.hp > 0 && Math.hypot(t.x - x, t.y - y) < 6 * CELL)) continue;
    G.enemies.push(createMonster(spec, x, y));
    return;
  }
}
// ---- 掙扎：被纏住時按方向鍵（WASD／方向鍵），每按一下少纏一點時間，身體朝那個方向扭 ----
const STRUGGLE_KEYS = { w: [0, -1], arrowup: [0, -1], s: [0, 1], arrowdown: [0, 1], a: [-1, 0], arrowleft: [-1, 0], d: [1, 0], arrowright: [1, 0] };
window.addEventListener('keydown', e => {
  if (e.repeat || typeof G === 'undefined' || !G) return;   // 按住不放不算，要一下一下按
  const dir = STRUGGLE_KEYS[String(e.key).toLowerCase()], p = G.player;
  if (!dir || !p || !(p.rootT > 0) || G.over || (typeof paused !== 'undefined' && paused)) return;
  loofahStruggle(p, dir);
});
function loofahStruggle(p, dir) {
  const C = LOOFAH, held = (p.rootT0 || C.rootTime) - p.rootT;
  p.struggleCount = (p.struggleCount || 0) + 1;
  p.struggleT = .18; p.struggleDir = dir;
  p.rootT = Math.max(p.rootT - C.struggleCut, C.struggleMin - held, 0);   // 至少要被纏 struggleMin 秒
  if (Math.random() < .5) G.effects.push({ particle: true, kind: 'spark', x: p.x + (Math.random() - .5) * 16, y: p.y + 4, vx: (Math.random() - .5) * 60, vy: -(20 + Math.random() * 30), r: 1.5 + Math.random(), life: .3, life0: .3, color: '#8fcf5e' });
  if (p.rootT <= 0) loofahBreakFree(p);
}
// ---- 幫隊友掙脫：隊友被纏住時，用手槍（一般子彈）朝他身上的藤蔓開槍，把藤蔓射斷 ----
// 每打中一發少纏 struggleCut 秒（跟自己按一下方向鍵一樣），一樣至少要被纏 struggleMin 秒；溫特要在手槍射程內、看得到隊友（中間沒有牆、隊友不在黑暗裡）
// 開槍照常：舉槍、槍口火光、彈殼、扣彈匣、要裝填，射速也跟平常一樣（js/game.js 的 updatePlayerAttack 呼叫 vineShotTarget、shootVine）
// 換成特殊子彈時照特殊子彈的效果打，不會射斷藤蔓
function rootedTeammateAt(x, y) {   // 滑鼠點到哪位被纏住的隊員（身體範圍：腳底往上約一個人高）
  return G.towers.find(t => t.rootT > 0 && t.hp > 0 && !t.eatenBy && !t.grabbed && Math.abs(x - t.x) <= 20 && y >= t.y - 44 && y <= t.y + 18) || null;
}
const helpInRange = t => Math.hypot(t.x - G.player.x, t.y - G.player.y) <= PLAYER_ATK.range * CELL;   // 手槍射程（PLAYER_ATK 在 js/game.js）
// 看得到隊員：跟溫特開槍打怪物同一套——身上任何一個地方在畫面上夠亮、而且視線沒有被牆整個擋住（腳底、腰、胸口、左右兩側）
const mateBodyBox = t => ({ x0: t.x - 14, y0: t.y - 40, x1: t.x + 14, y1: t.y + 14, cx: t.x, cy: t.y - 13 });
function helpSeen(t) {
  const p = G.player, b = mateBodyBox(t);
  if (!(bodyVisible(b, t.x, t.y) || isLit(t.x, t.y))) return false;
  return [[t.x, t.y], [t.x, t.y - 8], [b.cx, b.cy], [b.x0 + 4, b.cy], [b.x1 - 4, b.cy]].some(([x, y]) => hasLineOfSight(p.x, p.y, x, y));
}
const canHelpFree = t => !!(G.player && G.player.hp > 0 && helpInRange(t) && helpSeen(t));
document.getElementById('cv').addEventListener('mousedown', e => {   // 這個檔比 game.js 早載入，還不能用 cv
  if (e.button !== 0 || typeof G === 'undefined' || !G || !G.running || G.over || MAP_SAFE || !G.player || G.player.hp <= 0) return;
  if ((typeof paused !== 'undefined' && paused) || dialogueState || G.selType) return;   // 暫停、對話中、正在放建築／拆除：照原本的處理
  if (playerWeapon(G.player).id !== 'pistol') return;   // 特殊子彈：照原本的效果
  const { x, y } = clientToWorld(e.clientX, e.clientY), t = rootedTeammateAt(x, y);
  if (!t || canHelpFree(t)) return;   // 打得到藤蔓：交給平常的開槍（js/game.js 的 updatePlayerAttack → shootVine）
  const now = performance.now();   // 太遠或看不到：照樣開槍（只是射不到藤蔓），旁邊提示一下（連點時不要一直疊字）
  if (now - (t.helpFarAt || 0) > 900) { t.helpFarAt = now; flash(helpInRange(t) ? '看不到' : '太遠了', t.x, t.y - 58, '#ffd479', .6); sfx('error'); }
}, true);
// 游標點在哪位被纏住、打得到的隊員身上（js/game.js 的 updatePlayerAttack 呼叫；沒有就回傳 null，照平常打怪）
function vineShotTarget(aim) {
  const t = rootedTeammateAt(aim.x, aim.y);
  return t && canHelpFree(t) ? t : null;
}
// 開一槍打在隊友身上的藤蔓：子彈曳光飛到藤蔓上、碎葉噴出，藤蔓鬆一點（彈匣已經在 game.js 扣過了）
function shootVine(p, t, aim, aimAng) {
  const hx = Math.max(t.x - 13, Math.min(t.x + 13, aim.x)), hy = Math.max(t.y - 4, Math.min(t.y + 12, aim.y));   // 子彈打在纏住身體的那一圈藤上
  const { x: mx, y: my } = gunMuzzleAt(p, aimAng);
  G.effects.push({ muzzle: true, x: mx, y: my, ang: aimAng, life: .07, life0: .07 });   // 槍口閃光
  addLightFlash('muzzle', mx, my);
  spawnShellCasing(mx, my, aimAng);
  G.effects.push({ bullet: true, x1: mx, y1: my, x2: hx, y2: hy, life: .07, life0: .07, color: '#ffe79a' });   // 子彈曳光
  G.effects.push({ ring: true, x: hx, y: hy, r: 2, r2: 9, life: .14, life0: .14, color: '#a7dd7a' });   // 打中藤蔓：綠色小火花
  sfx('shotPistol');
  t.helpHintT = HELP_HINT.show;   // 旁邊冒出「幫隊友掙脫」
  loofahHelpFree(t, hx, hy);
  if (p.ammo <= 0) startReload(p);   // 打完最後一發→自動裝填
  else if (PLAYER_ATK.double && Math.random() < PLAYER_ATK.double) p.atkCd = .07;   // 快速射擊（手槍 Lv3 起）
}
function loofahHelpFree(t, x, y) {
  const C = LOOFAH, p = G.player, held = (t.rootT0 || C.rootTime) - t.rootT;
  t.helpCount = (t.helpCount || 0) + 1;
  t.struggleT = .18; t.struggleDir = [x < t.x ? 1 : -1, 0];   // 藤蔓被扯：隊友往另一邊歪一下
  t.rootT = Math.max(t.rootT - C.struggleCut, C.struggleMin - held, 0);   // 至少要被纏 struggleMin 秒
  for (let i = 0; i < 3; i++) G.effects.push({ particle: true, kind: 'spark', x, y, vx: (Math.random() - .5) * 80, vy: -(20 + Math.random() * 40), r: 1.5 + Math.random(), life: .3, life0: .3, color: i % 2 ? '#6fae4a' : '#a7dd7a' });   // 射斷的碎葉
  if (typeof sfxAt === 'function') sfxAt('knock2', t.x, t.y, .3, 'loofah-help');
  if (t.rootT <= 0) loofahBreakFree(t);
}
// 掙脫：藤蔓斷開、碎葉彈出來
function loofahBreakFree(p) {
  p.rootT = 0;
  // 纏住他的藤蔓：不再停留抓人；藤蔓上沒有別人被纏著就馬上縮回地底（不會留在身上）
  for (const v of G.loofahVines || []) {
    if (v.state !== 'grab' || !v.caught.includes(p)) continue;
    v.lingerT = 0;
    if (!v.caught.some(a => a !== p && a.rootT > 0 && a.hp > 0)) { v.state = 'retract'; v.rt = 0; }
  }
  flash('掙脫！', p.x, p.y - 64, '#c8f59a', .9);
  for (let i = 0; i < 10; i++) {
    const a = Math.random() * Math.PI * 2, sp = 60 + Math.random() * 90;
    G.effects.push({ particle: true, kind: 'spark', x: p.x, y: p.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * .6 - 30, r: 2 + Math.random() * 1.5, life: .4 + Math.random() * .25, life0: .65, color: i % 2 ? '#6fae4a' : '#a7dd7a' });
  }
  if (typeof sfxAt === 'function') sfxAt('swordSwing', p.x, p.y, .4, 'loofah-break');
}
// 畫人物時呼叫（render.js 的 drawPlayer／drawTower）：被纏住時以腳底為支點扭動
function applyStruggleTransform(ctx, a) {
  if (!(a && a.rootT > 0)) return;
  const now = performance.now() / 1000, k = (a.struggleT || 0) / .18, dir = a.struggleDir || [0, 0];
  const ang = Math.sin(now * 4.3 + (a.x % 7)) * .035 + dir[0] * .2 * k;   // 平常小小扭動；按下去那一刻用力歪
  const fx = a.x, fy = a.y + 16;
  ctx.translate(fx + dir[0] * 3 * k, fy + dir[1] * 2 * k); ctx.rotate(ang); ctx.translate(-fx, -fy);
}

// 被纏住的人不能移動（game.js 玩家移動、sentry.js 哨兵移動呼叫）
function isRooted(a) { return !!(a && a.rootT > 0); }

// ---- 繪圖 ----
// 地面：鑽地時的裂痕（畫在角色下面）
function drawLoofahGround(ctx) {
  for (const v of G.loofahVines || []) {
    ctx.save(); ctx.strokeStyle = '#4a3b26'; ctx.lineCap = 'round';
    for (const k of v.cracks) {
      if (!isVisible(k.x, k.y)) continue;
      ctx.globalAlpha = Math.min(1, k.life / .6) * .7; ctx.lineWidth = 2;
      const L = 7;
      ctx.beginPath(); ctx.moveTo(k.x - Math.cos(k.a) * L, k.y - Math.sin(k.a) * L * .5);
      ctx.lineTo(k.x + Math.cos(k.a + .5) * 3, k.y + Math.sin(k.a + .5) * 2);
      ctx.lineTo(k.x + Math.cos(k.a) * L, k.y + Math.sin(k.a) * L * .5); ctx.stroke();
    }
    if (v.state === 'dig' && isVisible(v.x, v.y)) {   // 鑽地的前端：隆起的小土堆
      ctx.globalAlpha = .85; ctx.fillStyle = '#7a6545';
      ctx.beginPath(); ctx.ellipse(v.x, v.y, 7, 3.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#9c8660'; ctx.beginPath(); ctx.ellipse(v.x - 1, v.y - 1, 4, 2, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
}
// 冒出地面的藤蔓、纏在人身上的藤蔓（畫在角色上面）
function drawLoofahVines(ctx) {
  const now = performance.now() / 1000;
  for (const v of G.loofahVines || []) {
    if (v.state === 'dig' || v.done || !isVisible(v.x, v.y)) continue;
    const grow = v.state === 'retract' ? Math.max(0, 1 - v.rt / .35) : Math.min(1, (now - v.eruptAt) / .22);
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    // 地上破開的洞
    ctx.globalAlpha = .55; ctx.fillStyle = '#3a2d1c';
    ctx.beginPath(); ctx.ellipse(v.x, v.y + 6, 16 * grow + 4, 6 * grow + 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
    if (v.caught.length) for (const a of v.caught) if (a.rootT > 0) drawWrap(ctx, a, grow, now, v.seed);   // 只畫還被纏著的人（掙脫、時間到的人身上不留藤蔓）
    const p = G.player;
    if (p && p.rootT > 0 && v.caught.includes(p)) {   // 溫特頭上的掙扎進度條：還要被纏多久（一開始是滿的，掙扎、時間過去就變短）
      const T0 = p.rootT0 || LOOFAH.rootTime, prog = Math.min(1, p.rootT / T0), bx = p.x - 22, by = p.y - 74;
      ctx.globalAlpha = .9; ctx.fillStyle = '#0d1218'; ctx.fillRect(bx - 1, by - 1, 46, 7);
      ctx.fillStyle = '#5f9c3e'; ctx.fillRect(bx, by, 44 * prog, 5);
      ctx.strokeStyle = '#c8f59a'; ctx.lineWidth = 1; ctx.strokeRect(bx - .5, by - .5, 45, 6);
      if ((p.struggleCount || 0) < 4) {
        ctx.font = 'bold 11px "Microsoft JhengHei", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
        const blink = .65 + .35 * Math.sin(now * 8);
        ctx.globalAlpha = blink; ctx.fillStyle = '#0d1218'; ctx.fillText('連按方向鍵掙扎！', p.x + 1, by - 2);
        ctx.fillStyle = '#e8ffd2'; ctx.fillText('連按方向鍵掙扎！', p.x, by - 3);
      }
      ctx.globalAlpha = 1;
    }
    for (const t of v.caught) {   // 被纏住的隊友頭上：掙脫進度條（跟溫特的一樣，從滿的往下減）；溫特在旁邊時提示可以幫忙
      if (!G.towers.includes(t) || !(t.rootT > 0) || t.hp <= 0) continue;
      const T0 = t.rootT0 || LOOFAH.rootTime, prog = Math.min(1, t.rootT / T0), bx = t.x - 22, by = t.y - 64;
      ctx.globalAlpha = .9; ctx.fillStyle = '#0d1218'; ctx.fillRect(bx - 1, by - 1, 46, 7);
      ctx.fillStyle = '#5f9c3e'; ctx.fillRect(bx, by, 44 * prog, 5);
      ctx.strokeStyle = '#c8f59a'; ctx.lineWidth = 1; ctx.strokeRect(bx - .5, by - .5, 45, 6);
      if (!(t.helpHintT > 0) && ((t.helpCount || 0) < 4 && canHelpFree(t) && playerWeapon(G.player).id === 'pistol')) {   // 正在射藤蔓時換成旁邊的「幫隊友掙脫」（drawLoofahHelpHints）
        ctx.font = 'bold 11px "Microsoft JhengHei", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
        ctx.globalAlpha = .65 + .35 * Math.sin(now * 8);
        ctx.fillStyle = '#0d1218'; ctx.fillText('開槍射斷藤蔓幫他掙脫！', t.x + 1, by - 2);
        ctx.fillStyle = '#e8ffd2'; ctx.fillText('開槍射斷藤蔓幫他掙脫！', t.x, by - 3);
      }
      ctx.globalAlpha = 1;
    }
    if (!(p && p.rootT > 0 && v.caught.includes(p))) for (const k of [0, 1, 2]) {   // 沒抓到人：三根高矮不一的捲鬚從洞裡竄出來，中段繞成彈簧圈、頂端有葉子和勾起的捲尖
      const r = n => (Math.sin(v.seed * (3 + n) + k * (5 + n)) + 1) / 2;   // 每根藤固定的隨機值（0～1）
      const bx = v.x + [-12, 3, 14][k] + (r(1) - .5) * 5;
      drawTendril(ctx, bx, v.y + 7, {
        h: [46, 34, 25][k] * (.88 + r(2) * .24), grow,
        lean: [-7, 4, 9][k] + Math.sin(now * 2.6 + k * 1.7 + v.seed) * 2.5,
        turns: 1.7 + r(3) * .5, r: [8.5, 7, 5][k] + r(4) * 1.5, w: [3.4, 3, 2.4][k] * .8,
        phase: v.seed + k * 2.1, side: k === 1 ? -1 : 1, leaf: k !== 2 || r(5) > .5,
      });
    }
    ctx.restore();
  }
}
// ---- 射藤蔓時隊友旁邊的小提示：滑鼠左鍵圖示＋「幫隊友掙脫」，沒有底框，圖示和字同一個顏色 ----
// 圖示用 images/ui/mouse-click.png（對話框「下一句」也用這張；原圖 80×80，滑鼠本體在 x 22～57、y 11～68）
const HELP_HINT = { text: '幫隊友掙脫', color: '#88c8f3', show: .8, fade: .25, iconH: 14, dx: 20, dy: -22 };   // 顏色＝圖示的藍色；show：最後一發後留幾秒；dx／dy：在隊員腳底右上方多遠
const helpHintIcon = new Image(); helpHintIcon.src = 'images/ui/mouse-click.png?v=3';
// render.js 在黑幕之後呼叫：提示畫在黑幕上面，顏色才不會被暗處壓暗
function drawLoofahHelpHints(ctx) {
  for (const t of G.towers) if (t.helpHintT > 0 && t.rootT > 0 && t.hp > 0 && !t.eatenBy) drawHelpHint(ctx, t);
}
function drawHelpHint(ctx, t) {
  const H = HELP_HINT, a = Math.min(1, t.helpHintT / H.fade), x = t.x + H.dx, y = t.y + H.dy;
  ctx.save(); ctx.globalAlpha = a;
  ctx.shadowColor = 'rgba(0,0,0,.85)'; ctx.shadowBlur = 3;   // 沒有底框：只加一點陰影，亮的地板上也看得清楚
  let tx = x;
  if (helpHintIcon.complete && helpHintIcon.naturalWidth) {
    const iw = H.iconH * 36 / 58;
    ctx.drawImage(helpHintIcon, 22, 11, 36, 58, x, y - H.iconH / 2, iw, H.iconH);
    tx = x + iw + 4;
  }
  ctx.font = 'bold 12px "Microsoft JhengHei", sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillStyle = H.color; ctx.fillText(H.text, tx, y + 1);
  ctx.restore();
}
// 一根絲瓜藤：根部較粗、越往上越細，尖端是尖的（不是圓頭）；中段旁邊長一片尖葉和一條捲鬚
function vineStroke(ctx, pts, w, seed = 0) {
  const at = t => {   // 二次曲線上的點和方向
    const u = 1 - t, [a, b, c] = pts;
    return { x: u * u * a[0] + 2 * u * t * b[0] + t * t * c[0], y: u * u * a[1] + 2 * u * t * b[1] + t * t * c[1],
      dx: 2 * u * (b[0] - a[0]) + 2 * t * (c[0] - b[0]), dy: 2 * u * (b[1] - a[1]) + 2 * t * (c[1] - b[1]) };
  };
  const N = 14, L = [], R = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N, q = at(t), len = Math.hypot(q.dx, q.dy) || 1, nx = -q.dy / len, ny = q.dx / len;
    const half = (w * Math.pow(1 - t, .85)) / 2;   // 尖端寬度 0
    L.push([q.x + nx * half, q.y + ny * half]); R.push([q.x - nx * half, q.y - ny * half]);
  }
  const shape = grow => { ctx.beginPath(); L.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); for (let i = R.length - 1; i >= 0; i--) ctx.lineTo(R[i][0], R[i][1]); ctx.closePath(); };
  ctx.strokeStyle = '#2b4f1e'; ctx.lineWidth = 1.2; ctx.fillStyle = '#5f9c3e';
  shape(); ctx.fill(); ctx.stroke();
  // 亮線（中段）
  ctx.strokeStyle = '#9fd36f'; ctx.lineWidth = .8; ctx.beginPath();
  for (let i = 2; i <= N * .7; i++) { const q = at(i / N); i === 2 ? ctx.moveTo(q.x, q.y) : ctx.lineTo(q.x, q.y); }
  ctx.stroke();
  // 中段旁邊的尖葉
  const m = at(.45), side = Math.sin(seed * 7) > 0 ? 1 : -1, ang = Math.atan2(m.dy, m.dx) + side * 1.0;
  ctx.save(); ctx.translate(m.x, m.y); ctx.rotate(ang);
  ctx.fillStyle = '#76b84c'; ctx.strokeStyle = '#2b4f1e'; ctx.lineWidth = .8;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(4, -3, 8, 0); ctx.quadraticCurveTo(4, 3, 0, 0); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = '#3f7a2a'; ctx.beginPath(); ctx.moveTo(.5, 0); ctx.lineTo(7, 0); ctx.stroke();   // 葉脈
  ctx.restore();
  // 捲鬚：另一側細細捲一圈
  const k = at(.65), a0 = Math.atan2(k.dy, k.dx) - side * 1.2;
  ctx.strokeStyle = '#6fae4a'; ctx.lineWidth = .9; ctx.beginPath();
  for (let i = 0; i <= 16; i++) { const t = i / 16, r = 5 * (1 - t * .7), a = a0 + side * t * Math.PI * 2.2, x = k.x + Math.cos(a0) * 3 * t + Math.cos(a) * r - Math.cos(a0) * 5, y = k.y + Math.sin(a0) * 3 * t + Math.sin(a) * r - Math.sin(a0) * 5; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
  ctx.stroke();
}
// ---- 絲瓜捲鬚（參考使用者給的圖：粗粗的黃綠色藤，中段繞成彈簧圈，頂端一片葉子、尖端往外勾）----
const TENDRIL_COL = { line: '#1f3a12', fill: '#8dc63f', light: '#c4ec78', back: '#5e8f2a', leaf: '#78b83c', vein: '#3f7a22' };
// 沿著一條路徑畫藤：先畫「背面」那幾段（顏色暗、在後面），再畫「正面」，彈簧圈才有前後交錯的立體感
function strokeVinePath(ctx, pts, alpha = 1) {
  const C = TENDRIL_COL;
  for (const front of [false, true]) {
    const segs = [];
    for (let i = 1; i < pts.length; i++) if (pts[i].front === front) segs.push(i);
    if (!segs.length) continue;
    ctx.globalAlpha = alpha * (front ? 1 : .9);
    for (const pass of ['line', 'fill']) {
      ctx.strokeStyle = pass === 'line' ? C.line : (front ? C.fill : C.back);
      for (const i of segs) {
        const a = pts[i - 1], b = pts[i];
        ctx.lineWidth = b.w + (pass === 'line' ? Math.max(.9, Math.min(2, b.w * .7)) : 0);   // 細的地方外框也細，尖端才尖
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
    }
    if (front) {   // 正面的亮邊
      ctx.strokeStyle = C.light; ctx.lineWidth = .9;
      for (const i of segs) { const a = pts[i - 1], b = pts[i]; if (b.w < 1.6) continue; ctx.beginPath(); ctx.moveTo(a.x - b.w * .25, a.y - b.w * .25); ctx.lineTo(b.x - b.w * .25, b.y - b.w * .25); ctx.stroke(); }
    }
  }
  ctx.globalAlpha = alpha;
}
// 一片尖葉：(x,y) 葉柄、ang 方向、size 長度
function drawVineLeaf(ctx, x, y, ang, size) {
  const C = TENDRIL_COL;
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
  ctx.fillStyle = C.leaf; ctx.strokeStyle = C.line; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(size * .45, -size * .48, size, 0); ctx.quadraticCurveTo(size * .5, size * .4, 0, 0); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = C.vein; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(1, 0); ctx.lineTo(size * .8, -size * .05); ctx.stroke();
  ctx.restore();
}
// 從地上 (x,y) 往上長的一根捲鬚。o：h 高度、grow 長出來的比例、lean 往左右歪、turns 繞幾圈、r 圈的大小、w 粗細、phase、side 葉子／捲尖朝哪邊、leaf 有沒有葉子
function drawTendril(ctx, x, y, o) {
  const N = 60, c0 = .24, c1 = .64, pts = [], show = Math.max(0, Math.min(1, o.grow));
  if (show <= 0) return;
  for (let i = 0; i <= N; i++) {
    const t = i / N; if (t > show) break;
    const bend = Math.sin(t * Math.PI * .5) * o.lean;   // 整根往一邊歪
    let px = x + bend, py = y - o.h * t, front = true;
    if (t > c0 && t < c1) {   // 中段：彈簧圈（側看的螺旋：左右擺＋上下前後）
      const u = (t - c0) / (c1 - c0), env = Math.sin(u * Math.PI), th = u * o.turns * Math.PI * 2 + o.phase;
      px += Math.sin(th) * o.r * env;
      py += Math.cos(th) * o.r * .95 * env;
      front = Math.cos(th) > -.15;
    }
    if (t >= .86) {   // 尖端：往外勾一小圈
      const u = (t - .86) / .14, a = u * Math.PI * 1.25;
      px += o.side * (Math.sin(a) * 4.5 + u * 2); py += (1 - Math.cos(a)) * 3.2 - u * 1.5;
    }
    pts.push({ x: px, y: py, w: Math.max(.5, o.w * Math.pow(1 - t, .9) + .35), front });   // 越往上越細，尖端很細
  }
  strokeVinePath(ctx, pts);
  if (o.leaf && show > .8) {   // 圈的上方長一片葉子
    const q = pts[Math.round(N * .78)] || pts[pts.length - 1];
    drawVineLeaf(ctx, q.x, q.y, -Math.PI / 2 - o.side * 1.05, 9 * Math.min(1, (show - .8) / .15));
  }
}
// 纏在人身上（參考使用者畫的圖）：粗藤從下巴到腰一圈一圈緊緊捆住身體，圈有點歪、粗細不一；
// 繞到身體後面的那段比較暗；最下面拖出一條細細的捲鬚往旁邊捲。越接近放開越淡
function drawWrap(ctx, a, grow, now, seed) {
  const fade = a.rootT > 0 ? Math.min(1, a.rootT / .4 + .3) : grow;
  const shake = (a.struggleT || 0) > 0 ? (Math.random() - .5) * 2.4 : 0;   // 掙扎時藤蔓被扯得抖一下
  const rs = n => (Math.sin(seed * (2.3 + n) + 1.7 * n) + 1) / 2;          // 這根藤固定的隨機值
  const dir = rs(1) > .5 ? 1 : -1, x = a.x + shake;
  const bottom = a.y + 12, top = a.y - 3, H = (bottom - top) * grow;     // 身體那一段（Q版：頭以下到腰）
  const turns = 4 + rs(3) * .8, N = 110, pts = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N, th = t * turns * Math.PI * 2 * dir + seed;
    const loop = Math.floor(t * turns);                                    // 第幾圈：每圈的大小、傾斜都不太一樣
    const rx = 13.5 + Math.sin(loop * 2.7 + seed) * 1.6 - t * 1.5;
    const tilt = Math.sin(loop * 1.9 + seed * 3) * 1.8;
    const px = x + Math.sin(th) * rx;
    const py = bottom - t * H + Math.cos(th) * 2.6 + Math.sin(th) * tilt;   // 前面那半圈比較低（從上往下看的圈）
    pts.push({ x: px, y: py, w: (3.6 + Math.sin(t * 17 + seed) * .5) * .7, front: Math.cos(th) > -.05 });
  }
  ctx.save(); ctx.globalAlpha = fade;
  strokeVinePath(ctx, pts, fade);
  // 最下面拖出去的細捲鬚：往旁邊伸出去，尾巴捲一圈半
  const sx = x - dir * 9, sy = bottom + 2, len = 16 + rs(5) * 5, curl = [];
  const M = 40, wob = Math.sin(now * 2.5 + seed) * 1.2;
  for (let i = 0; i <= M; i++) {
    const t = i / M;
    let px, py;
    if (t < .55) { const u = t / .55; px = sx - dir * len * u; py = sy + Math.sin(u * Math.PI) * 2.5 + u * 3 + wob * u; }
    else {
      const u = (t - .55) / .45, r = 4.2 * (1 - u * .6), ang = Math.PI / 2 + dir * u * Math.PI * 2.6;
      const cx = sx - dir * len, cy = sy + 3 + wob - 4.2;
      px = cx + Math.cos(ang) * r * -dir; py = cy + Math.sin(ang) * r;
    }
    curl.push({ x: px, y: py, w: Math.max(.5, 1.7 * .7 * (1 - t * .6)), front: true });
  }
  strokeVinePath(ctx, curl, fade);
  ctx.restore();
}
