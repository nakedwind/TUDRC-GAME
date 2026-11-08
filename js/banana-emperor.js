/* ===== 菁英金蕉王「金蕉大王」（F307 左下大草地房的地圖 BOSS）=====
   - 外觀：金蕉王放大 BANANA_EMPEROR.scale 倍。守在核心旁邊，不逃跑；沒施法時在核心旁邊慢慢走來走去（wander）。
   - 觸發：溫特走到 wakeRange 格內（看得到）、或他和他的隊伍被打 → BOSS 戰開始（BOSS 血條＋中BOSS 音樂），核心一起甦醒。
   - 施法：每次都是同一個姿勢——舉高權杖（cast-02）→ 往下用力敲地板（cast-02-tap），地板顫動、裂開。
       舉杖的時候，他腳下會畫出一個魔法陣（半徑 circle 格），敲下去那一刻才生效：
         陣裡的怪物得到 BUFF，陣裡的我方（溫特、隊友）得到 DEBUFF。看到魔法陣就可以先走出去躲掉。
       魔法陣、權杖的光、地上裂縫的顏色代表這次施的是哪一種法術（spells）：
         綠＝補血（怪物補血；我方被吸走一點血）
         紅＝攻擊（怪物攻擊上升；我方攻擊下降）
         藍＝防禦（怪物受到的傷害變少；我方受到的傷害變多）
         紫＝速度（怪物變快；我方變慢）
         黃＝香蕉皮雨（天上掉下香蕉皮，落點先出現影子；我方踩到會滑倒，js/golden-banana-king.js 那一套）
         白＝召喚狂風（陣裡的我方被吹上天，再掉到離他很遠的地方，摔一下、暈一下；用 js/vines.js 被丟下來那一套）
       有人受傷就優先補血；其他時候輪流挑沒剛用過的。
   - 地上的裂痕：每敲一次就多裂幾片，整場戰鬥都不會消失（他倒下後才慢慢淡掉）；我方踩在裂痕上走路很慢。
   - 隊伍（都比一般的大、比較慢、但比較痛）：大鳥頭人、大史萊姆、大生命體各 count 隻，再加兩隻普通金蕉王（只負責補血：不逃跑、不丟香蕉皮、不帶小怪）。
       站位：大隻的排成 V 字（尖端在核心下面、往左上右上張開），金蕉王站在核心上方（squad.formation）。
       有紀律：離自己的站位超過 squad.leash 格就放下目標走回去（金蕉王隊員的牽繩，js/golden-banana-king.js 的 stepSquadLeash）。
   出現在哪張地圖、哪一格：BANANA_EMPEROR.maps（地圖 id → 核心那一格的欄、列）。附近有地圖本來的核心就用那顆（core.adopt／core.pull），沒有就自己帶一顆。
   數值都在下面的 BANANA_EMPEROR。必須在 golden-banana-king.js、vines.js、loofah-queen.js、attack-fx.js 之後、game.js 之前載入。
*/
const BANANA_EMPEROR = {
  name: '金蕉大王',
  maps: { map_f307boss: { c: 19, r: 58 }, map_mw2dn6re: { c: 18, r: 94 } },   // 核心在哪一格（測試：F307 BOSS 場地、F307 本圖的大草地房，都在房間下面）；他站在核心右邊 standOff 格
  standOff: 3.5,                 // 一開始站在核心右邊幾格（太近權杖會被核心擋住；體型越大要站越遠）
  wander: {                      // 沒在施法的時候：在核心旁邊慢慢走來走去
    near: 3, far: 5.5,           // 走到離核心幾格～幾格的地方（他身體很寬，太近會跟核心疊在一起）
    speed: .5,                   // 走路速度：金蕉王的幾倍（.5＝一半，慢慢走）
    pause: [1.5, 3.5],           // 走到之後停下來站幾秒～幾秒，再走下一段
  },
  hp: 2500, rewardMul: 6, crystalMul: 6,   // hp：血量（再乘整體難度）
  scale: 2.3,                    // 體型放大倍率（以金蕉王為準）
  wakeRange: 8,                  // 溫特走到幾格內（看得到）就觸發 BOSS 戰
  castEvery: 4.5,                // 兩次施法間隔幾秒（BOSS 戰開始後）
  firstCast: 1.5,                // BOSS 戰開始後幾秒放第一次
  raiseTime: .9,                 // 舉高權杖蓄力幾秒（魔法陣慢慢畫出來；這段時間可以走出魔法陣）
  tapHold: .45,                  // 敲下去後停在敲地姿勢幾秒
  circle: 9,                     // 魔法陣半徑（格）：陣裡的怪物得到 BUFF、我方得到 DEBUFF
  healBelow: .85,                // 陣裡有怪物血量低於幾成：優先補血
  spells: {                      // color：魔法陣、權杖的光、地上裂縫、身上光點的顏色
    heal:  { name: '補血',     color: [125, 255, 138], amount: 80 },              // amount：每隻怪物補多少 HP
    atk:   { name: '攻擊上升', color: [255, 84, 70],   mul: 1.5, time: 12 },       // 攻擊力 × mul，持續 time 秒
    def:   { name: '防禦上升', color: [80, 170, 255],  cut: .4,  time: 12 },       // 受到的傷害減少 cut（.4＝少 4 成）
    spd:   { name: '速度上升', color: [196, 120, 255], mul: 1.5, time: 10 },       // 移動速度 × mul
    peels: { name: '香蕉皮雨', color: [255, 224, 80],  count: 7, aimed: 3, near: 2, far: 7, fall: 1.1, height: 420 },   // 一次掉幾個、幾個瞄準我方、其他落在離他幾～幾格、掉多久、從多高
    wind:  { name: '召喚狂風', color: [235, 245, 255], dist: 8, away: .5 },       // dist：吹到離他最多幾格（撞到牆就停在牆前）；away：在天上停幾秒才掉下來
  },
  debuffs: {                     // 站在魔法陣裡的我方（溫特、隊友）得到的 DEBUFF
    heal: { name: '生命被吸走', drain: 10 },                 // 綠：每人扣幾 HP（不會扣到倒下，最少留 1）
    atk:  { name: '攻擊下降',   mul: .6,  time: 8 },          // 紅：打出去的傷害 × mul
    def:  { name: '防禦下降',   mul: 1.4, time: 8 },          // 藍：受到的傷害 × mul
    spd:  { name: '速度下降',   mul: .6,  time: 8 },          // 紫：走路速度 × mul
  },
  shake: 7,                      // 敲地時畫面震多大
  crackR: 46,                    // 地上焦黑的大小（像素）
  cracks: {                      // 地上的裂痕（整場戰鬥都在，越敲越多）
    count: 8, len: [55, 120],    // 每片幾條裂縫、每條多長（像素）
    extra: 2, extraScale: .7,    // 每敲一次，魔法陣裡另外再裂幾片小的、小的是幾倍大
    glow: 1.4,                   // 剛裂開時發光幾秒
    max: 30,                     // 地上最多幾片（太多就把最舊的拿掉）
    slow: .5,                    // 我方踩在裂痕上：走路速度 × slow
    fade: 3,                     // 他倒下後，裂痕幾秒內淡掉
  },
  core: { adopt: 4, pull: 12 },  // 核心那一格附近 adopt 格內有地圖本來的核心：用那顆；pull 格內有的話：把那顆搬過來用（不會多一顆）
  squad: {                       // 隊伍
    leash: 6,                    // 離自己的站位超過幾格就走回來
    regroup: 1.5,                // 走回到離站位幾格內，才恢復自由行動
    roam: 1,                     // 閒晃時離站位最多幾格
    formation: {                 // 站位：大隻的排成 V 字（尖端在核心下面，兩邊往左上、右上張開），金蕉王站在核心上方
      vertexDown: 1.5,           // V 的尖端在核心下面幾格
      armAngle: 30,              // 兩邊往上張開的角度（度；越小越扁、越寬）
      spacing: 2.4,              // 同一邊兩隻之間隔幾格
      kingsUp: 2,                // 金蕉王站在核心上面幾格
      kingsApart: 2.4,           // 兩隻金蕉王左右隔幾格
    },
    big: [                       // 大隻的隊員：id、count 幾隻、scale 放大、slow 慢幾倍、atk 攻擊力倍率、hp 血量倍率
      { id: 'bird_head', count: 3, scale: 1.8, slow: 1.5, atk: 1.8, hp: 3 },
      { id: 'slime',     count: 3, scale: 1.8, slow: 1.5, atk: 1.8, hp: 3 },
      { id: 'lifeform',  count: 3, scale: 1.4, slow: 1.5, atk: 1.8, hp: 3 },   // 生命體本來就很高：放大少一點，才不會比金蕉大王還大
    ],
    kings: 2,                    // 普通金蕉王幾隻（只負責補血）
  },
};
const BE_ART = {
  stand: 'images/monster/golden-banana-king/golden-banana-king-cast-01.png',
  raise: 'images/monster/golden-banana-king/golden-banana-king-cast-02.png',
  tap: 'images/monster/golden-banana-king/golden-banana-king-cast-02-tap.png',
};
const beSpot = () => typeof MAP !== 'undefined' && MAP ? BANANA_EMPEROR.maps[MAP.id] || null : null;
const beAlive = e => !!(e && !e.dead && e.hp > 0 && G.enemies.includes(e));
const beRgb = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
const beHex = c => '#' + c.map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
const bePeople = () => [G.player, ...(G.towers || [])].filter(a => a && a.hp > 0);
// 地上裂縫：用焦痕那一套畫（js/attack-fx.js 的 SCORCH），每種法術一個顏色，裂縫剛裂開時透出那個顏色的光
for (const [id, s] of Object.entries(BANANA_EMPEROR.spells))
  SCORCH.styles['bananaTap_' + id] = { life: 6, fade: 2, size: 1, cracks: 7, heat: 1.6, halo: '#2a2418',
    c0: [30, 26, 18], c1: [44, 38, 26], c2: [70, 60, 40], crack: '#120e08', fleck: '#3a3020', glow: s.color };

// ---- 開場（game.js 在 seedLoofahQueen 之後呼叫）----
// G.bananaEmperors：[{ e, core, anchor, squad }]；anchor＝核心的位置；隊員各自的站位在 m.squadLeader（V 字隊形）
function seedBananaEmperor() {
  G.bananaEmperors = []; G.beCracks = []; G.beCircles = [];
  const spot = beSpot();
  if (!spot || MAP_SAFE || (typeof practiceOn === 'function' && practiceOn())) return;
  const base = ACTIVE_MONSTERS.find(m => m.id === 'golden_banana_king');
  if (!base || !inGrid(spot.c, spot.r) || isWall(spot.c, spot.r)) return;
  const B = BANANA_EMPEROR, [cx, cy] = center(spot.c, spot.r);
  // 核心：附近有地圖本來的核心就用那顆，沒有就自己帶一顆
  const difficulty = Math.max(1, Math.min(5, Number(MAP.difficulty) || 1));
  let core = G.cores.find(c => !c.dead && Math.hypot(c.x - cx, c.y - cy) <= B.core.adopt * CELL);
  if (!core) {   // 同一間房裡（pull 格內）有地圖本來的核心：搬到他要守的那一格（核心還沒醒，腳下的腐蝕痕跡醒了才會鋪）
    core = G.cores.find(c => !c.dead && !c.awake && !c.carried && Math.hypot(c.x - cx, c.y - cy) <= B.core.pull * CELL && hasLineOfSight(c.x, c.y, cx, cy));
    if (core) { core.x = cx; core.y = cy; }
  }
  if (!core) {
    const hp = CORE.hp * difficulty;
    core = { x: cx, y: cy, hp, maxhp: hp, lastHp: hp, dead: false, awake: false, phase: 0, awakeT: 0,
      timer: 2 + Math.random() * 2.4, reward: CORE.reward * difficulty, moteT: 0, hitT: 0, seed: Math.random() * 10 };
    G.cores.push(core);
  }
  const at = lqFreeSpot(core.x + B.standOff * CELL, core.y) || { x: core.x + CELL, y: core.y };
  const e = createMonster(base, at.x, at.y);
  e.bananaEmperor = true; e.eliteName = B.name; e.bkSquad = true;   // bkSquad：不要再叫普通金蕉王的那種隊員
  e.hp = e.maxhp = Math.round(e.maxhp / base.hp * B.hp);
  e.reward = Math.round(e.reward * B.rewardMul); e.crystals = Math.round((e.crystals ?? 5) * B.crystalMul);
  e.drawWidth = Math.round(base.width * B.scale); e.drawHeight = Math.round(base.height * B.scale);
  e.knockMul = 0; e.staggerTime = 0; e.unpushable = true; e.noHitSquash = true; e.wide = true;
  e.faceRight = false; e.forceFrame = BE_ART.stand;
  e.speed = base.speed * B.wander.speed;
  e.be = { cd: B.firstCast, phase: null, t: 0, spell: null, last: null, hp0: e.hp };
  G.enemies.push(e);
  const anchor = { anchor: true, x: core.x, y: core.y, leash: B.squad.leash, regroup: B.squad.regroup, roam: B.squad.roam };
  const rec = { e, core, anchor, squad: [] };
  G.bananaEmperors.push(rec);
  // 隊伍：大隻的排成 V 字、金蕉王站在核心上方；每隻有自己的站位（anchor），離站位太遠就走回去
  const F = B.squad.formation, ang = F.armAngle * Math.PI / 180, vx = core.x, vy = core.y + F.vertexDown * CELL;
  const pools = B.squad.big.map(g => Array(g.count || 1).fill(g)), order = [];
  while (pools.some(q => q.length)) for (const q of pools) if (q.length) order.push(q.shift());   // 鳥頭人、史萊姆、生命體輪流排，兩邊都混著
  const posts = order.map((g, i) => {
    if (i === 0) return { g, x: vx, y: vy };   // 第一隻站在 V 的尖端
    const k = Math.ceil(i / 2), side = i % 2 ? -1 : 1;
    return { g, x: vx + side * Math.cos(ang) * k * F.spacing * CELL, y: vy - Math.sin(ang) * k * F.spacing * CELL };
  });
  for (let i = 0; i < B.squad.kings; i++)
    posts.push({ g: { id: 'golden_banana_king' }, x: core.x + (i - (B.squad.kings - 1) / 2) * F.kingsApart * CELL, y: core.y - F.kingsUp * CELL });
  for (const post of posts) {
    const g = post.g, spec = ACTIVE_MONSTERS.find(m => m.id === g.id); if (!spec) continue;
    const p = lqFreeSpot(post.x, post.y); if (!p) continue;
    const m = createMonster(spec, p.x, p.y, g.id === 'slime' ? 'normal' : undefined);
    if (g.scale) beEnlarge(m, g);
    if (g.id === 'golden_banana_king') m.bkSquad = true;   // 普通金蕉王：不另外帶小怪
    m.squadLeader = { anchor: true, x: p.x, y: p.y, leash: B.squad.leash, regroup: B.squad.regroup, roam: B.squad.roam };   // 自己的站位
    m.beOwner = e;
    G.enemies.push(m); rec.squad.push(m);
  }
}
// 大隻的隊員：放大、變慢、攻擊和血量提高
function beEnlarge(m, g) {
  m.drawWidth = Math.round((m.drawWidth || 42) * g.scale); m.drawHeight = Math.round((m.drawHeight || 33) * g.scale);
  if (m.sizeMul) m.sizeMul *= g.scale;   // 史萊姆：影子跟著變大
  m.speed /= g.slow;
  for (const k of ['playerDamage', 'sentryDamage', 'buildingDamage']) if (m[k] != null) m[k] = Math.round(m[k] * g.atk);
  m.hp = m.maxhp = Math.round(m.maxhp * g.hp);
  m.knockMul = (m.knockMul ?? 1) * .3; m.wide = true;
  m.beBig = true;
}

// ---- 觸發 BOSS 戰 ----
function beWake(rec) {
  const e = rec.e;
  if (e.eliteAwake) return;
  e.eliteAwake = true; e.alertT = ENEMY_ALERT_TIME; e.be.cd = BANANA_EMPEROR.firstCast;
  if (rec.core && !rec.core.dead && !rec.core.awake) wakeCore(rec.core);
  for (const m of rec.squad) if (beAlive(m)) m.alertT = ENEMY_ALERT_TIME;
  if (typeof coreBanner === 'function') coreBanner(BANANA_EMPEROR.name + '發現你了', '', '#ffe27a');
  systemNotice(BANANA_EMPEROR.name + '發現你了！', true);
  if (typeof sfxAt === 'function') sfxAt('bananaHeal', e.x, e.y, 1.2, 'banana-emperor-wake');
}

// ---- 行為（enemy-ai.js 的 stepEnemy 呼叫）：在核心旁邊慢慢走，時間到就停下來施法 ----
function stepBananaEmperor(e, dt) {
  const B = BANANA_EMPEROR, be = e.be, rec = (G.bananaEmperors || []).find(r => r.e === e);
  if (!rec) return;
  if (!e.eliteAwake) {
    const p = G.player, hurt = e.hp < be.hp0 || rec.squad.some(m => m.hp < m.maxhp) || (rec.core && rec.core.awake);
    if (hurt || (p && p.hp > 0 && Math.hypot(p.x - e.x, p.y - e.y) <= B.wakeRange * CELL && hasLineOfSight(e.x, e.y, p.x, p.y))) beWake(rec);
  }
  be.hp0 = e.hp;
  if (e.stunT > 0 && !be.phase) { e.forceFrame = BE_ART.stand; return; }
  if (be.phase === 'raise') { beRaise(e, rec, dt); return; }
  if (be.phase === 'tap') { be.t -= dt; e.forceFrame = BE_ART.tap; e.forceFlip = !!e.faceRight; if (be.t <= 0) { be.phase = null; e.forceFrame = BE_ART.stand; } return; }
  if (!e.eliteAwake) { beWander(e, rec, dt); return; }
  be.cd -= dt;
  if (be.cd > 0) { beWander(e, rec, dt); return; }
  // 時間到：停下腳步、面向我方，開始施法（腳下畫出魔法陣）
  const foe = beFoe(e);
  be.spell = bePickSpell(e, foe);
  if (!be.spell) { be.cd = .5; beWander(e, rec, dt); return; }
  e.aiPath = null; be.goal = null; e.moving = false;
  if (foe) e.faceRight = foe.x > e.x;
  be.phase = 'raise'; be.t = B.raiseTime; be.aim = foe;
  const [sx, sy] = beStaffTip(e), col = B.spells[be.spell].color;
  G.effects.push({ fglow: true, pal: beGlowPal(col), grow: true, x: sx, y: sy, r0: 8, r1: 46, life: B.raiseTime, life0: B.raiseTime });
  be.circle = { x: e.x, y: e.y + 6, r: B.circle * CELL, col, t: 0, charge: B.raiseTime, burst: 0, spin: Math.random() * 6 };
  (G.beCircles = G.beCircles || []).push(be.circle);
  if (typeof sfxAt === 'function') sfxAt('bananaHeal', e.x, e.y, .7, 'banana-emperor-raise');
}
// 沒在施法：在核心旁邊挑一個地方慢慢走過去，到了站一下，再挑下一個
function beWander(e, rec, dt) {
  const W = BANANA_EMPEROR.wander, be = e.be;
  if (be.wait > 0) { be.wait -= dt; e.forceFrame = BE_ART.stand; e.forceFlip = !!e.faceRight; return; }
  if (!be.goal) be.goal = beWanderSpot(rec);
  if (!be.goal) { be.wait = 1; return; }
  e.forceFrame = null;   // 用金蕉王的走路圖
  const [gc, gr] = cellAt(be.goal.x, be.goal.y);
  const nav = enemyNavigate(e, gc, gr, dt, 'bemperor-walk:' + gc + ',' + gr, true);
  if ((nav && (nav.reached || nav.blocker)) || Math.hypot(be.goal.x - e.x, be.goal.y - e.y) < CELL * .4) {
    be.goal = null; e.aiPath = null; e.moving = false;
    be.wait = W.pause[0] + Math.random() * (W.pause[1] - W.pause[0]);
  }
}
function beWanderSpot(rec) {
  const W = BANANA_EMPEROR.wander, c = rec.core;
  for (let i = 0; i < 24; i++) {
    const a = Math.random() * Math.PI * 2, d = (W.near + Math.random() * (W.far - W.near)) * CELL;
    const p = lqFreeSpot(c.x + Math.cos(a) * d, c.y + Math.sin(a) * d);
    if (!p || Math.hypot(p.x - c.x, p.y - c.y) < W.near * CELL * .9 || Math.hypot(p.x - rec.e.x, p.y - rec.e.y) <= CELL) continue;
    // 走過去的直線不能穿過核心（離核心至少 near－1 格）：不然會從核心身上走過去
    const ex = rec.e.x, ey = rec.e.y, dx = p.x - ex, dy = p.y - ey, L2 = dx * dx + dy * dy || 1;
    const k = Math.max(0, Math.min(1, ((c.x - ex) * dx + (c.y - ey) * dy) / L2));
    if (Math.hypot(ex + dx * k - c.x, ey + dy * k - c.y) >= (W.near - 1) * CELL) return p;
  }
  return null;
}
// 舉杖蓄力：顏色光點往權杖頂端聚過來
function beRaise(e, rec, dt) {
  const B = BANANA_EMPEROR, be = e.be, col = B.spells[be.spell].color;
  be.t -= dt;
  e.forceFrame = BE_ART.raise; e.forceFlip = !!e.faceRight;
  if (Math.random() < dt * 40) {
    const [sx, sy] = beStaffTip(e), a = Math.random() * Math.PI * 2, r = 26 + Math.random() * 24;
    G.effects.push({ particle: true, x: sx + Math.cos(a) * r, y: sy + Math.sin(a) * r, vx: -Math.cos(a) * r * 3.4, vy: -Math.sin(a) * r * 3.4, r: 1.8 + Math.random() * 1.8, life: .3, life0: .3, color: beHex(col) });
  }
  if (be.t > 0) return;
  // 敲地！
  be.phase = 'tap'; be.t = B.tapHold; be.cd = B.castEvery; be.last = be.spell;
  e.forceFrame = BE_ART.tap;
  if (be.circle) { be.circle.burst = .9; be.circle = null; }   // 魔法陣亮一下再淡掉
  beTapFx(e, col);
  beCast(e, rec, be.spell, be.aim);
}
// 權杖頂端在哪（原圖朝左，權杖在左手邊；敲地時權杖尾端在腳邊）
function beStaffTip(e) {
  const w = e.drawWidth, h = e.drawHeight, side = e.faceRight ? 1 : -1;
  return [e.x + side * w * .36, e.y - h * .86];
}
function beStaffFoot(e) {
  const w = e.drawWidth, side = e.faceRight ? 1 : -1;
  return [e.x + side * w * .37, e.y - 6];
}
const beGlowPal = c => [c.map(v => Math.min(255, v + 90)), c, c.map(v => v * .3)];
// 敲地的畫面：地上裂開（越裂越多）、畫面震動、塵土、顏色光圈往外擴
function beTapFx(e, col) {
  const B = BANANA_EMPEROR, K = B.cracks, [fx, fy] = beStaffFoot(e);
  addScorchMark(fx, fy, B.crackR, null, 'bananaTap_' + e.be.spell);
  beAddCracks(fx, fy, col, 1);
  for (let i = 0; i < K.extra; i++) {   // 魔法陣裡另外裂開幾片小的
    const a = Math.random() * Math.PI * 2, d = (1.5 + Math.random() * (B.circle - 2)) * CELL;
    const x = e.x + Math.cos(a) * d, y = e.y + Math.sin(a) * d, [c, r] = cellAt(x, y);
    if (!inGrid(c, r) || isWall(c, r)) continue;
    beAddCracks(x, y, col, K.extraScale);
    if (typeof llDust === 'function') llDust(x, y + 4, false);
  }
  if (typeof nearbyImpact === 'function') nearbyImpact(fx, fy, B.shake, .06); else addShake(B.shake);
  G.effects.push({ fglow: true, pal: beGlowPal(col), x: fx, y: fy - 6, r0: 16, r1: 90, life: .5, life0: .5 });
  G.effects.push({ ring: true, x: e.x, y: e.y + 6, r: 6, r2: B.circle * CELL, life: .55, life0: .55, color: beHex(col) });
  G.effects.push({ ring: true, x: fx, y: fy, r: 4, r2: 70, life: .35, life0: .35, color: '#fff3c4' });
  for (let i = 0; i < 14; i++) {   // 碎石、塵土往外噴
    const a = -Math.PI * Math.random(), sp = 60 + Math.random() * 110;
    G.effects.push({ particle: true, x: fx + (Math.random() - .5) * 16, y: fy - 2, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * .6, r: 1.5 + Math.random() * 2.2, life: .45 + Math.random() * .3, life0: .75, color: Math.random() < .5 ? '#8a7a5a' : beHex(col) });
  }
  if (typeof llDust === 'function') for (let i = 0; i < 4; i++) llDust(fx + (Math.random() - .5) * 50, fy + 4, true);
  if (typeof addLightFlash === 'function') addLightFlash('heal', fx, fy - 20, 1.2);
  if (typeof sfxAt === 'function') sfxAt('loofahStomp', fx, fy, 1.1, 'banana-emperor-tap');
}

// ---- 地上的裂痕：從敲下的地方往外裂開，先透出法術顏色的光，之後變成暗暗的裂痕留在地上（踩到會變慢）----
function beAddCracks(x, y, col, scale = 1) {
  const K = BANANA_EMPEROR.cracks, lines = [], a0 = Math.random() * Math.PI * 2;
  let R = 0;
  for (let i = 0; i < K.count; i++) {
    let a = a0 + i / K.count * Math.PI * 2 + (Math.random() - .5) * .5, d = 0;
    const len = (K.len[0] + Math.random() * (K.len[1] - K.len[0])) * scale, pts = [[0, 0]];
    while (d < len) { d += 10 + Math.random() * 12; a += (Math.random() - .5) * .7; pts.push([Math.cos(a) * d, Math.sin(a) * d * .55]); }   // 上下壓扁：貼在地上的透視
    R = Math.max(R, d);
    lines.push({ pts, w: 2.6 * Math.max(.7, scale) });
    if (Math.random() < .7) {   // 岔出去的細裂縫
      const k = 1 + Math.floor(Math.random() * (pts.length - 2)), [bx, by] = pts[k], br = [[bx, by]];
      let ba = a + (Math.random() < .5 ? -1 : 1) * (.6 + Math.random() * .6), bd = 0;
      for (let j = 0; j < 3; j++) { bd += 8 + Math.random() * 8; ba += (Math.random() - .5) * .5; br.push([bx + Math.cos(ba) * bd, by + Math.sin(ba) * bd * .55]); }
      lines.push({ pts: br, w: 1.5 });
    }
  }
  (G.beCracks = G.beCracks || []).push({ x, y, col, lines, R: R * .8, t: 0 });
  while (G.beCracks.length > K.max) G.beCracks.shift();
}
// 這個人有沒有踩在裂痕上（裂痕是壓扁的：上下的距離放大來算）
function beOnCrack(a) {
  const fy = a.y + 12;
  return (G.beCracks || []).some(c => c.fadeOut == null && Math.hypot(a.x - c.x, (fy - c.y) / .55) <= c.R);
}
// 畫在地面層（跟香蕉皮一起，js/render.js 呼叫）：魔法陣、裂痕
function drawBananaEmperorGround(ctx) {
  const K = BANANA_EMPEROR.cracks, now = performance.now() / 1000;
  for (const c of G.beCracks || []) {
    const grow = Math.min(1, c.t / .12), glow = Math.max(0, 1 - c.t / K.glow), fade = c.fadeOut == null ? 1 : Math.max(0, c.fadeOut / K.fade);
    if (fade <= 0) continue;
    ctx.save(); ctx.translate(c.x, c.y); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const path = l => { const n = Math.max(2, Math.ceil(l.pts.length * grow)); ctx.beginPath(); ctx.moveTo(l.pts[0][0], l.pts[0][1]); for (let i = 1; i < n; i++) ctx.lineTo(l.pts[i][0], l.pts[i][1]); };
    ctx.globalAlpha = .85 * fade; ctx.strokeStyle = '#140f08';   // 暗色的裂痕本體
    for (const l of c.lines) { ctx.lineWidth = l.w + 1; path(l); ctx.stroke(); }
    if (glow > 0) {   // 剛裂開：裂縫裡透出法術顏色的光
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = beRgb(c.col, .55 * glow); for (const l of c.lines) { ctx.lineWidth = l.w + 6; path(l); ctx.stroke(); }
      ctx.strokeStyle = beRgb(c.col.map(v => Math.min(255, v + 120)), .95 * glow); for (const l of c.lines) { ctx.lineWidth = l.w * .7; path(l); ctx.stroke(); }
    }
    ctx.restore();
  }
  for (const m of G.beCircles || []) beDrawCircle(ctx, m, now);
}
// 魔法陣：舉杖時從中間慢慢畫出來（外圈、刻度、六芒星會轉），敲下去時亮一下再淡掉
function beDrawCircle(ctx, m, now) {
  const charging = m.burst <= 0, k = charging ? Math.min(1, m.t / m.charge) : 1;
  const ease = 1 - Math.pow(1 - k, 3), r = m.r * (.25 + .75 * ease);
  const a = charging ? .35 + .45 * k : Math.max(0, m.burst / .9) * (1 + .6 * Math.max(0, m.burst - .7) / .2);
  if (a <= 0) return;
  const spin = m.spin + now * .8, col = m.col;
  ctx.save(); ctx.translate(m.x, m.y);
  // 先用深色描一圈底線：草地、地板很亮的時候也看得清楚
  ctx.strokeStyle = beRgb(col.map(v => v * .35), .55 * Math.min(1, a)); ctx.lineWidth = 6;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
  ctx.lineWidth = 3.5; ctx.beginPath(); ctx.arc(0, 0, r * .86, 0, Math.PI * 2); ctx.stroke();
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(0, 0, r * .2, 0, 0, r);   // 陣裡淡淡的光
  g.addColorStop(0, beRgb(col, 0)); g.addColorStop(.8, beRgb(col, .1 * a)); g.addColorStop(1, beRgb(col, .22 * a));
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = beRgb(col, .9 * a); ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();                    // 外圈
  ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(0, 0, r * .86, 0, Math.PI * 2); ctx.stroke();   // 內圈
  for (let i = 0; i < 24; i++) {   // 兩圈之間的刻度（跟著轉）
    const t = spin + i / 24 * Math.PI * 2, l = i % 2 ? .04 : .1;
    ctx.beginPath(); ctx.moveTo(Math.cos(t) * r * .87, Math.sin(t) * r * .87); ctx.lineTo(Math.cos(t) * r * (.87 + l), Math.sin(t) * r * (.87 + l)); ctx.stroke();
  }
  ctx.lineWidth = 1.8; ctx.beginPath();   // 六芒星（反方向轉）
  for (let s = 0; s < 2; s++) for (let i = 0; i <= 3; i++) {
    const t = -spin * .6 + s * Math.PI / 3 + i / 3 * Math.PI * 2, x = Math.cos(t) * r * .78, y = Math.sin(t) * r * .78;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(0, 0, r * .3, 0, Math.PI * 2); ctx.stroke();   // 中間的小圈
  ctx.restore();
}

// ---- 目標：看得到的最近一個我方（溫特、隊友）----
function beFoe(e) {
  const R = 16 * CELL, list = [G.player, ...G.towers].filter(t => t && t.hp > 0 && !t.berserk);
  let best = null, bestD = R;
  for (const t of list) { const d = Math.hypot(t.x - e.x, t.y - e.y); if (d <= bestD && hasLineOfSight(e.x, e.y, t.x, t.y)) { best = t; bestD = d; } }
  return best;
}
// ---- 魔法陣裡的怪物、我方 ----
function beAllies(e) {
  const R = BANANA_EMPEROR.circle * CELL;
  return G.enemies.filter(o => !o.dead && o.hp > 0 && !o.dummy && Math.hypot(o.x - e.x, o.y - e.y) <= R);
}
function beVictims(e) {
  const R = BANANA_EMPEROR.circle * CELL;
  return bePeople().filter(a => !a.vineCap && !a.grabbed && !a.grabFall && Math.hypot(a.x - e.x, a.y - e.y) <= R);
}
// ---- 挑法術：有人受傷優先補血；其他輪流挑沒剛用過的；有人站在陣裡比較會叫狂風 ----
function bePickSpell(e, foe) {
  const B = BANANA_EMPEROR, allies = beAllies(e), inside = beVictims(e).length > 0;
  if (e.be.last !== 'heal' && allies.some(o => o.hp < o.maxhp * B.healBelow)) return 'heal';
  const pool = ['atk', 'def', 'spd'].filter(id => id !== e.be.last && allies.some(o => o !== e && !(o.beBuff && o.beBuff[id] > 2)));
  if (foe && e.be.last !== 'peels') pool.push('peels', 'peels');   // 有看到人：比較常下香蕉皮雨
  if (inside && e.be.last !== 'wind') pool.push('wind', 'wind');   // 有人靠太近：比較常叫狂風把人吹走
  if (!pool.length) return allies.some(o => o.hp < o.maxhp) ? 'heal' : (foe ? 'peels' : null);
  return pool[Math.floor(Math.random() * pool.length)];
}
// ---- 施法效果：陣裡的怪物 BUFF、陣裡的我方 DEBUFF ----
function beCast(e, rec, id, foe) {
  const B = BANANA_EMPEROR, S = B.spells[id];
  flash(S.name + '！', e.x, e.y - e.drawHeight - 12, beHex(S.color));
  if (id === 'peels') { bePeelRain(e, foe); return; }
  if (id === 'wind') { beWindBurst(e); for (const a of beVictims(e)) beWindBlow(e, a); return; }
  for (const o of beAllies(e)) {
    const h = o.drawHeight || 50;
    if (id === 'heal') {
      if (o.hp >= o.maxhp) continue;
      const add = Math.min(S.amount, o.maxhp - o.hp);
      o.hp += add; if (o.cf) o.cf.hp0 = o.hp;
      if (o.beHp != null) o.beHp = o.hp;   // 防禦 BUFF 不要把補的血當成扣血
      flashDmg('+' + Math.round(add), o.x, o.y - h * .6, beHex(S.color));
    } else {
      if (o === e && id !== 'def') continue;   // 他自己走很慢、不打人：只吃防禦
      beApplyBuff(o, id, S.time);
    }
    G.effects.push({ fglow: true, pal: beGlowPal(S.color), grow: true, x: o.x, y: o.y - h * .35, r0: 10, r1: 30 + h * .25, life: .8, life0: .8 });
    G.effects.push({ ring: true, x: o.x, y: o.y, r: 4, r2: 26 + h * .15, life: .45, life0: .45, color: beHex(S.color) });
    for (let i = 0; i < 8; i++) G.effects.push({ particle: true, x: o.x + (Math.random() - .5) * 30, y: o.y - Math.random() * h * .6, vx: (Math.random() - .5) * 20, vy: -55 - Math.random() * 60, r: 1.5 + Math.random() * 2, life: .6 + Math.random() * .4, life0: 1, color: beHex(S.color) });
  }
  for (const a of beVictims(e)) beApplyDebuff(a, id);
}
// BUFF：攻擊、速度直接乘上倍率（到期再除回去）；防禦在 updateBananaEmperor 每幀把扣掉的血退一部分回去
// 核心甦醒時怪物會狂暴（js/core-frenzy.js，會記下原本的數值、核心被打掉時還原）：記下的那份也一起乘／除，兩邊才不會互相蓋掉
const BE_ATK_KEYS = ['playerDamage', 'sentryDamage', 'buildingDamage'];
function beScale(o, id, k) {
  const keys = id === 'atk' ? BE_ATK_KEYS : ['speed'];
  for (const key of keys) {
    if (o[key] != null) o[key] *= k;
    if (o.frenzy && o.frenzy[key] != null) o.frenzy[key] *= k;
  }
}
function beApplyBuff(o, id, time) {
  const B = BANANA_EMPEROR, b = (o.beBuff = o.beBuff || {});
  if (!(b[id] > 0)) {
    if (id === 'atk') beScale(o, 'atk', B.spells.atk.mul);
    if (id === 'spd') beScale(o, 'spd', B.spells.spd.mul);
    if (id === 'def') o.beHp = o.hp;
  }
  b[id] = time;
}
function beEndBuff(o, id) {
  const B = BANANA_EMPEROR;
  if (id === 'atk') beScale(o, 'atk', 1 / B.spells.atk.mul);
  if (id === 'spd') beScale(o, 'spd', 1 / B.spells.spd.mul);
  if (id === 'def') o.beHp = null;
  o.beBuff[id] = 0;
}
// DEBUFF（溫特、隊友）：攻擊下降在 playerGun／sentryDamageMul 乘上 bananaDebuffAtk；防禦下降、速度下降在 updateBananaEmperor 每幀處理
function beApplyDebuff(a, id) {
  const D = BANANA_EMPEROR.debuffs[id], col = BANANA_EMPEROR.spells[id].color;
  if (!D) return;
  if (D.drain) {
    const n = Math.min(D.drain, Math.max(0, a.hp - 1));
    if (n > 0) { a.hp -= n; flashDmg('-' + n, a.x, a.y - 46, beHex(col)); }
  } else {
    const d = (a.beDebuff = a.beDebuff || {});
    d[id] = D.time;
    if (id === 'def') a.beDHp = a.hp;
  }
  flash(D.name, a.x, a.y - 58, beHex(col), .8);
  for (let i = 0; i < 8; i++) G.effects.push({ particle: true, x: a.x + (Math.random() - .5) * 26, y: a.y - 40 - Math.random() * 20, vx: (Math.random() - .5) * 16, vy: 40 + Math.random() * 30, r: 1.5 + Math.random() * 1.5, life: .7, life0: .7, color: beHex(col) });
}
// 攻擊下降的倍率（js/game.js 的 playerGun、js/sentry.js 的 sentryDamageMul 呼叫）
function bananaDebuffAtk(a) { return a && a.beDebuff && a.beDebuff.atk > 0 ? BANANA_EMPEROR.debuffs.atk.mul : 1; }
// 香蕉皮雨：幾個瞄準我方站的地方，其他落在他身邊；落點先出現影子
function bePeelRain(e, foe) {
  const S = BANANA_EMPEROR.spells.peels, C = BANANA_KING, peels = (G.bananaPeels = G.bananaPeels || []);
  const foes = [G.player, ...G.towers].filter(t => t && t.hp > 0 && Math.hypot(t.x - e.x, t.y - e.y) <= 16 * CELL && hasLineOfSight(e.x, e.y, t.x, t.y));
  const spots = [];
  for (let i = 0; i < S.count; i++) {
    let x, y;
    if (i < S.aimed && foes.length) {
      const t = foes[i % foes.length], lead = i >= foes.length ? CELL * (.6 + Math.random() * .8) : 0, a = Math.random() * Math.PI * 2;
      x = t.x + Math.cos(a) * lead; y = t.y + Math.sin(a) * lead;
    } else {
      const a = Math.random() * Math.PI * 2, d = (S.near + Math.random() * (S.far - S.near)) * CELL;
      x = e.x + Math.cos(a) * d; y = e.y + Math.sin(a) * d;
    }
    const [c, r] = cellAt(x, y);
    if (!inGrid(c, r) || isWall(c, r) || enemyBlocked(x, y) || spots.some(s => Math.hypot(s.x - x, s.y - y) < CELL * .8)) continue;
    spots.push({ x, y });
  }
  for (const s of spots) peels.push({ sky: true, sx: s.x, sy: s.y - S.height, x: s.x, y: s.y, fly: S.fall * (.85 + Math.random() * .3), t: 0, life: C.peelLife, rot: Math.random() * Math.PI * 2, spin: (Math.random() < .5 ? -1 : 1) * (6 + Math.random() * 5) });
  while (peels.length > C.peelMax * 2) peels.shift();
}
// ---- 召喚狂風：陣裡的我方被吹上天，掉到遠遠的地方（用 js/vines.js 被捲上天再丟下來那一套，只是不畫藤蔓）----
function beWindBurst(e) {
  const R = BANANA_EMPEROR.circle * CELL;
  for (let i = 0; i < 3; i++) G.effects.push({ ring: true, x: e.x, y: e.y, r: 10 + i * 20, r2: R * (.7 + i * .2), life: .5 + i * .15, life0: .5 + i * .15, color: i ? '#dfefff' : '#ffffff' });
  for (let i = 0; i < 36; i++) {   // 往外捲出去的風（白色的細線點點）
    const a = Math.random() * Math.PI * 2, d = 20 + Math.random() * R * .6, sp = 160 + Math.random() * 160;
    G.effects.push({ particle: true, x: e.x + Math.cos(a) * d, y: e.y + Math.sin(a) * d * .7, vx: Math.cos(a + .9) * sp, vy: Math.sin(a + .9) * sp * .7 - 30, r: 1.2 + Math.random() * 1.8, life: .5 + Math.random() * .3, life0: .8, color: Math.random() < .5 ? '#ffffff' : '#cfe6ff' });
  }
  if (typeof addShake === 'function') addShake(4);
}
function beWindBlow(e, a) {
  if (!G.vineCaps || a.vineCap || a.grabbed || a.grabFall || a.eatenBy || a.mrtRide) return;
  const S = BANANA_EMPEROR.spells.wind, isPlayer = a === G.player;
  if (isPlayer && typeof cancelChannel === 'function' && typeof playerChannel !== 'undefined' && playerChannel) cancelChannel();
  if (isPlayer && a.sitting && typeof standUp === 'function') standUp();
  // 落點：從他往這個人的方向一路往外，撞到牆就停在牆前，最遠 dist 格
  let dx = a.x - e.x, dy = a.y - e.y; const d0 = Math.hypot(dx, dy) || 1; dx /= d0; dy /= d0;
  if (d0 < 2) { const ang = Math.random() * Math.PI * 2; dx = Math.cos(ang); dy = Math.sin(ang); }
  let to = cellAt(a.x, a.y);
  for (let s = 1; s <= S.dist * 2; s++) {
    const x = a.x + dx * s * CELL / 2, y = a.y + dy * s * CELL / 2, [c, r] = cellAt(x, y);
    if (!inGrid(c, r) || isWall(c, r) || Math.hypot(x - e.x, y - e.y) > S.dist * CELL) break;
    to = [c, r];
  }
  const v = { x: a.x, y: a.y, kind: 'ferry', state: 'grab', t: 0, len: 1, seed: 0, twitch: 0, temp: true };   // 假的藤蔓（不放進 G.vines、不會畫出來）
  G.vineCaps.push({ v, actor: a, isPlayer, mode: 'ferry', to, wind: true, awayT: S.away, phase: 'lift', t: 0, h: 0, x0: a.x, y0: a.y, hp: a.hp, camX: cam.x, camY: cam.y, topH: (a.y - cam.y) + 110 });
  a.vineCap = true; a.dashT = 0; a.knockT = 0;
  if (!isPlayer) { a.navPath = null; a.navGoal = null; a.meleeSwing = null; a.gunSwing = null; }
  flash('被狂風吹走了！', a.x, a.y - 56, '#eaf4ff', .9);
  if (typeof sfxAt === 'function') sfxAt('vineLift', a.x, a.y, .6, 'banana-emperor-wind');
}

// ---- 每幀（game.js 的 update 呼叫）：BUFF／DEBUFF 計時、防禦增減傷害、裂痕和速度下降讓人變慢、魔法陣 ----
function updateBananaEmperor(dt) {
  if (!G.enemies) return;
  const B = BANANA_EMPEROR, K = B.cracks;
  // 魔法陣
  if (G.beCircles && G.beCircles.length) {
    for (const m of G.beCircles) { m.t += dt; if (m.burst > 0) m.burst -= dt; }
    G.beCircles = G.beCircles.filter(m => m.burst > 0 || (m.burst === 0 && m.t < m.charge + 1));
    for (const rec of G.bananaEmperors || []) if (rec.e.be.circle && (!beAlive(rec.e) || rec.e.be.phase !== 'raise')) { G.beCircles = G.beCircles.filter(m => m !== rec.e.be.circle); rec.e.be.circle = null; }   // 施法被打斷、他倒下：陣消失
  }
  // 裂痕：他還活著就一直留著；倒下後慢慢淡掉
  if (G.beCracks && G.beCracks.length) {
    const alive = (G.bananaEmperors || []).some(r => beAlive(r.e));
    for (const c of G.beCracks) { c.t += dt; if (!alive) c.fadeOut = (c.fadeOut ?? K.fade) - dt; }
    G.beCracks = G.beCracks.filter(c => c.fadeOut == null || c.fadeOut > 0);
  }
  // 被狂風吹上天的人：身邊捲著白色的風
  for (const cap of G.vineCaps || []) if (cap.wind && cap.phase === 'lift' && Math.random() < dt * 30) {
    const a = cap.actor, ang = Math.random() * Math.PI * 2;
    G.effects.push({ particle: true, x: a.x + Math.cos(ang) * 18, y: a.y - cap.h - 20 + Math.sin(ang) * 10, vx: -Math.sin(ang) * 90, vy: -60 - Math.random() * 60, r: 1.2 + Math.random() * 1.4, life: .35, life0: .35, color: '#f2f8ff' });
  }
  // 怪物的 BUFF
  for (const o of G.enemies) {
    const b = o.beBuff;
    if (!b || o.dead || o.hp <= 0) continue;
    if (b.def > 0 && o.beHp != null && o.hp < o.beHp) o.hp += (o.beHp - o.hp) * B.spells.def.cut;   // 防禦：這一幀被扣的血退一部分回來
    if (b.def > 0) o.beHp = o.hp;
    for (const id of ['atk', 'def', 'spd']) {
      if (!(b[id] > 0)) continue;
      b[id] -= dt;
      if (b[id] <= 0) { beEndBuff(o, id); continue; }
      if (Math.random() < dt * 5) {   // 身上冒這個 BUFF 顏色的光點（往上飄）
        const h = o.drawHeight || 50;
        G.effects.push({ particle: true, x: o.x + (Math.random() - .5) * (o.drawWidth || 40) * .7, y: o.y - Math.random() * h * .5, vx: (Math.random() - .5) * 12, vy: -30 - Math.random() * 30, r: 1.4 + Math.random() * 1.4, life: .7, life0: .7, color: beHex(B.spells[id].color) });
      }
    }
  }
  // 我方：DEBUFF 計時、防禦下降多扣血、速度下降／踩在裂痕上走得慢
  for (const a of [G.player, ...(G.towers || [])]) {
    if (!a) continue;
    const d = a.beDebuff;
    if (d) {
      if (d.def > 0 && a.beDHp != null && a.hp < a.beDHp && a.hp > 0) a.hp = Math.max(1, a.hp - (a.beDHp - a.hp) * (B.debuffs.def.mul - 1));   // 這一幀被扣的血再多扣一些（不會因為這樣倒下）
      a.beDHp = a.hp;
      for (const id of ['atk', 'def', 'spd']) {
        if (!(d[id] > 0)) continue;
        d[id] -= dt;
        if (a.hp > 0 && Math.random() < dt * 4) G.effects.push({ particle: true, x: a.x + (Math.random() - .5) * 24, y: a.y - 44 - Math.random() * 10, vx: (Math.random() - .5) * 8, vy: 25 + Math.random() * 20, r: 1.3 + Math.random() * 1.2, life: .7, life0: .7, color: beHex(B.spells[id].color) });   // 往下掉的光點＝被削弱
      }
    }
    let mul = 1;
    if (d && d.spd > 0) mul *= B.debuffs.spd.mul;
    if (a.hp > 0 && beOnCrack(a)) mul *= K.slow;
    // 走得慢：把這一幀走的距離拉回一部分（被擊退、滑倒、被吹上天、被抓著、瞬間移動時不算）
    if (mul < 1 && a.beLX != null && a.hp > 0 && !(a.knockT > 0) && !(a.slipT > 0) && !a.vineCap && !a.grabbed && !a.grabFall) {
      const dx = a.x - a.beLX, dy = a.y - a.beLY, dist = Math.hypot(dx, dy);
      if (dist > 0 && dist < CELL) { a.x = a.beLX + dx * mul; a.y = a.beLY + dy * mul; }
    }
    a.beLX = a.x; a.beLY = a.y;
  }
}
// ---- 倒下（combat-feel.js 的 onEnemyDeath 呼叫）----
function bananaEmperorDown(e) {
  systemNotice(e.eliteName + '倒下了！', true);
  if (typeof coreBanner === 'function') coreBanner(e.eliteName + '倒下了', '', '#ffe27a');
  if (typeof nearbyImpact === 'function') nearbyImpact(e.x, e.y, 10, .1);
}
// ---- BOSS 血條（js/core-frenzy.js）、中BOSS 音樂（js/boss-music.js）----
function bananaEmperorBars() {
  const out = [];
  for (const rec of G.bananaEmperors || []) {
    const e = rec.e;
    if (!beAlive(e) || !e.eliteAwake) continue;
    out.push({ label: e.eliteName, ratio: e.hp / e.maxhp, hit: e.hitT > 0, colors: ['#b8901c', '#ffe27a'], frame: '#ffd84a', text: '#fff6d0' });
  }
  return out;
}
const bananaEmperorHunting = () => (G.bananaEmperors || []).some(rec => beAlive(rec.e) && rec.e.eliteAwake && beFoe(rec.e));
