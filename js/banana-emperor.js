/* ===== 菁英金蕉王「金蕉大王」（F307 左下大草地房的地圖 BOSS）=====
   - 外觀：金蕉王放大 BANANA_EMPEROR.scale 倍。站在核心旁邊守著，不逃跑、不離開（被推開會走回原位）。
   - 觸發：溫特走到 wakeRange 格內（看得到）、或他和他的隊伍被打 → BOSS 戰開始（BOSS 血條＋中BOSS 音樂），核心一起甦醒。
   - 施法：每次都是同一個姿勢——舉高權杖（cast-02）→ 往下用力敲地板（cast-02-tap），地板顫動、裂開。
       權杖的光和地上裂縫的顏色代表這次施的是哪一種法術（spells）：
         綠＝補血（範圍內受傷的怪物都補血）
         紅＝攻擊力上升、藍＝防禦力上升（受到的傷害變少）、紫＝速度上升（範圍內的怪物，持續幾秒，身上冒同顏色的光點）
         黃＝香蕉皮雨（天上掉下香蕉皮，落點先出現影子；我方踩到會滑倒，滑去撞到東西會頭暈，js/golden-banana-king.js 那一套）
       有人受傷就優先補血；其他時候輪流挑沒剛用過的。
   - 隊伍（都比一般的大、比較慢、但比較痛）：大鳥頭人、大史萊姆、大生命體各一隻，再加兩隻普通金蕉王（會補血，但不會逃離隊伍）。
       有紀律：離核心超過 squad.leash 格就放下目標走回來（金蕉王隊員的牽繩，js/golden-banana-king.js 的 stepSquadLeash）。
   出現在哪張地圖、哪一格：BANANA_EMPEROR.maps（地圖 id → 核心那一格的欄、列）。那一格附近 core.adopt 格內有地圖本來的核心就用那顆，沒有就自己帶一顆。
   數值都在下面的 BANANA_EMPEROR。必須在 golden-banana-king.js、attack-fx.js 之後、game.js 之前載入。
*/
const BANANA_EMPEROR = {
  name: '金蕉大王',
  maps: { map_f307boss: { c: 19, r: 51 }, map_mw2dn6re: { c: 18, r: 87 } },   // 核心在哪一格（測試：F307 BOSS 場地、F307 本圖的大草地房）；他站在核心右邊 standOff 格
  standOff: 3.5,                 // 站在核心右邊幾格（太近權杖會被核心擋住；體型越大要站越遠）
  hp: 2500, rewardMul: 6, crystalMul: 6,   // hp：血量（再乘整體難度）
  scale: 2.5,                    // 體型放大倍率（以金蕉王為準）
  wakeRange: 8,                  // 溫特走到幾格內（看得到）就觸發 BOSS 戰
  castEvery: 4.5,                // 兩次施法間隔幾秒（BOSS 戰開始後）
  firstCast: 1.5,                // BOSS 戰開始後幾秒放第一次
  raiseTime: .75,                // 舉高權杖蓄力幾秒
  tapHold: .45,                  // 敲下去後停在敲地姿勢幾秒
  range: 9,                      // 施法範圍（格）：補血、加 BUFF 的對象
  healBelow: .85,                // 範圍內有怪物血量低於幾成：優先補血
  spells: {                      // color：權杖的光、地上裂縫、身上光點的顏色
    heal:  { name: '補血',     color: [125, 255, 138], amount: 80 },              // amount：每隻補多少 HP
    atk:   { name: '攻擊上升', color: [255, 84, 70],   mul: 1.5, time: 12 },       // 攻擊力 × mul，持續 time 秒
    def:   { name: '防禦上升', color: [80, 170, 255],  cut: .4,  time: 12 },       // 受到的傷害減少 cut（.4＝少 4 成）
    spd:   { name: '速度上升', color: [196, 120, 255], mul: 1.5, time: 10 },       // 移動速度 × mul
    peels: { name: '香蕉皮雨', color: [255, 224, 80],  count: 7, aimed: 3, near: 2, far: 7, fall: 1.1, height: 420 },   // 一次掉幾個、幾個瞄準我方、其他落在離他幾～幾格、掉多久、從多高
  },
  shake: 7,                      // 敲地時畫面震多大
  crackR: 46,                    // 地上焦黑的大小（像素）
  cracks: { count: 8, len: [55, 120], glow: 1.4, life: 5, fade: 2 },   // 發光裂縫：幾條、每條多長（像素）、發光幾秒、留在地上幾秒、最後幾秒淡出
  core: { adopt: 4 },            // 核心那一格附近幾格內有地圖本來的核心：用那顆
  squad: {                       // 隊伍
    leash: 6,                    // 離核心超過幾格就走回來
    regroup: 2.5,                // 走回到離核心幾格內，才恢復自由行動
    roam: 3,                     // 閒晃時離核心最多幾格
    big: [                       // 大隻的隊員：id、scale 放大、slow 慢幾倍、atk 攻擊力倍率、hp 血量倍率
      { id: 'bird_head', scale: 1.8, slow: 1.5, atk: 1.8, hp: 3 },
      { id: 'slime',     scale: 1.8, slow: 1.5, atk: 1.8, hp: 3 },
      { id: 'lifeform',  scale: 1.4, slow: 1.5, atk: 1.8, hp: 3 },   // 生命體本來就很高：放大少一點，才不會比金蕉大王還大
    ],
    kings: 2,                    // 普通金蕉王幾隻
    radius: 2.2,                 // 生在離核心幾格的地方
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
// 地上裂縫：用焦痕那一套畫（js/attack-fx.js 的 SCORCH），每種法術一個顏色，裂縫剛裂開時透出那個顏色的光
for (const [id, s] of Object.entries(BANANA_EMPEROR.spells))
  SCORCH.styles['bananaTap_' + id] = { life: 6, fade: 2, size: 1, cracks: 7, heat: 1.6, halo: '#2a2418',
    c0: [30, 26, 18], c1: [44, 38, 26], c2: [70, 60, 40], crack: '#120e08', fleck: '#3a3020', glow: s.color };

// ---- 開場（game.js 在 seedLoofahQueen 之後呼叫）----
// G.bananaEmperors：[{ e, core, home, anchor }]；anchor＝隊伍的牽繩中心（核心的位置，固定不動）
function seedBananaEmperor() {
  G.bananaEmperors = [];
  const spot = beSpot();
  if (!spot || MAP_SAFE || (typeof practiceOn === 'function' && practiceOn())) return;
  const base = ACTIVE_MONSTERS.find(m => m.id === 'golden_banana_king');
  if (!base || !inGrid(spot.c, spot.r) || isWall(spot.c, spot.r)) return;
  const B = BANANA_EMPEROR, [cx, cy] = center(spot.c, spot.r);
  // 核心：附近有地圖本來的核心就用那顆，沒有就自己帶一顆
  const difficulty = Math.max(1, Math.min(5, Number(MAP.difficulty) || 1));
  let core = G.cores.find(c => !c.dead && Math.hypot(c.x - cx, c.y - cy) <= B.core.adopt * CELL);
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
  e.be = { home: { x: at.x, y: at.y }, cd: B.firstCast, phase: null, t: 0, spell: null, last: null, hp0: e.hp };
  G.enemies.push(e);
  const anchor = { anchor: true, x: core.x, y: core.y, leash: B.squad.leash, regroup: B.squad.regroup, roam: B.squad.roam };
  const rec = { e, core, anchor, squad: [] };
  G.bananaEmperors.push(rec);
  // 隊伍：大隻的三隻＋普通金蕉王，圍在核心旁邊
  const list = [...B.squad.big, ...Array.from({ length: B.squad.kings }, () => ({ id: 'golden_banana_king' }))];
  list.forEach((g, i) => {
    const spec = ACTIVE_MONSTERS.find(m => m.id === g.id); if (!spec) return;
    const a = Math.PI * .5 + i / list.length * Math.PI * 2;
    const p = lqFreeSpot(core.x + Math.cos(a) * B.squad.radius * CELL, core.y + Math.sin(a) * B.squad.radius * CELL); if (!p) return;
    const m = createMonster(spec, p.x, p.y, g.id === 'slime' ? 'normal' : undefined);
    if (g.scale) beEnlarge(m, g);
    if (g.id === 'golden_banana_king') m.bkSquad = true;   // 普通金蕉王：不另外帶隊員
    m.squadLeader = anchor; m.beOwner = e;
    G.enemies.push(m); rec.squad.push(m);
  });
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

// ---- 行為（enemy-ai.js 的 stepEnemy 呼叫）：站在原位，輪流施法 ----
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
  e.forceFrame = BE_ART.stand; e.forceFlip = !!e.faceRight;
  // 被推開了：走回原位
  if (Math.hypot(e.x - be.home.x, e.y - be.home.y) > CELL * .6) {
    e.forceFrame = null;
    const [hc, hr] = cellAt(be.home.x, be.home.y);
    enemyNavigate(e, hc, hr, dt, 'bemperor-home', true);
    return;
  }
  if (!e.eliteAwake) return;
  const foe = beFoe(e);
  if (foe) e.faceRight = foe.x > e.x;
  be.cd -= dt;
  if (be.cd > 0) return;
  be.spell = bePickSpell(e, foe);
  if (!be.spell) { be.cd = .5; return; }
  be.phase = 'raise'; be.t = B.raiseTime; be.aim = foe;
  const [sx, sy] = beStaffTip(e), col = B.spells[be.spell].color;
  G.effects.push({ fglow: true, pal: beGlowPal(col), grow: true, x: sx, y: sy, r0: 8, r1: 46, life: B.raiseTime, life0: B.raiseTime });
  if (typeof sfxAt === 'function') sfxAt('bananaHeal', e.x, e.y, .7, 'banana-emperor-raise');
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
// 敲地的畫面：地上裂開、畫面震動、塵土、顏色光圈往外擴
function beTapFx(e, col) {
  const B = BANANA_EMPEROR, [fx, fy] = beStaffFoot(e);
  addScorchMark(fx, fy, B.crackR, null, 'bananaTap_' + e.be.spell);
  beAddCracks(fx, fy, col);
  if (typeof nearbyImpact === 'function') nearbyImpact(fx, fy, B.shake, .06); else addShake(B.shake);
  G.effects.push({ fglow: true, pal: beGlowPal(col), x: fx, y: fy - 6, r0: 16, r1: 90, life: .5, life0: .5 });
  G.effects.push({ ring: true, x: fx, y: fy, r: 6, r2: B.range * CELL, life: .7, life0: .7, color: beHex(col) });
  G.effects.push({ ring: true, x: fx, y: fy, r: 4, r2: 70, life: .35, life0: .35, color: '#fff3c4' });
  for (let i = 0; i < 14; i++) {   // 碎石、塵土往外噴
    const a = -Math.PI * Math.random(), sp = 60 + Math.random() * 110;
    G.effects.push({ particle: true, x: fx + (Math.random() - .5) * 16, y: fy - 2, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * .6, r: 1.5 + Math.random() * 2.2, life: .45 + Math.random() * .3, life0: .75, color: Math.random() < .5 ? '#8a7a5a' : beHex(col) });
  }
  if (typeof llDust === 'function') for (let i = 0; i < 4; i++) llDust(fx + (Math.random() - .5) * 50, fy + 4, true);
  if (typeof addLightFlash === 'function') addLightFlash('heal', fx, fy - 20, 1.2);
  if (typeof sfxAt === 'function') sfxAt('loofahStomp', fx, fy, 1.1, 'banana-emperor-tap');
}

// 發光裂縫：從權杖敲下的地方往外裂開（一瞬間裂出去），先透出法術顏色的光，再慢慢變成暗暗的裂痕
function beAddCracks(x, y, col) {
  const K = BANANA_EMPEROR.cracks, lines = [], a0 = Math.random() * Math.PI * 2;
  for (let i = 0; i < K.count; i++) {
    let a = a0 + i / K.count * Math.PI * 2 + (Math.random() - .5) * .5, d = 0;
    const len = K.len[0] + Math.random() * (K.len[1] - K.len[0]), pts = [[0, 0]];
    while (d < len) { d += 10 + Math.random() * 12; a += (Math.random() - .5) * .7; pts.push([Math.cos(a) * d, Math.sin(a) * d * .55]); }   // 上下壓扁：貼在地上的透視
    lines.push({ pts, w: 2.6 });
    if (Math.random() < .7) {   // 岔出去的細裂縫
      const k = 1 + Math.floor(Math.random() * (pts.length - 2)), [bx, by] = pts[k], br = [[bx, by]];
      let ba = a + (Math.random() < .5 ? -1 : 1) * (.6 + Math.random() * .6), bd = 0;
      for (let j = 0; j < 3; j++) { bd += 8 + Math.random() * 8; ba += (Math.random() - .5) * .5; br.push([bx + Math.cos(ba) * bd, by + Math.sin(ba) * bd * .55]); }
      lines.push({ pts: br, w: 1.5 });
    }
  }
  (G.beCracks = G.beCracks || []).push({ x, y, col, lines, t: 0 });
  if (G.beCracks.length > 12) G.beCracks.shift();
}
// 畫在地面層（跟香蕉皮一起，js/render.js 呼叫）
function drawBananaEmperorGround(ctx) {
  const K = BANANA_EMPEROR.cracks;
  for (const c of G.beCracks || []) {
    const grow = Math.min(1, c.t / .12), glow = Math.max(0, 1 - c.t / K.glow), fade = Math.min(1, (K.life - c.t) / K.fade);
    if (fade <= 0) continue;
    ctx.save(); ctx.translate(c.x, c.y); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const path = l => { const n = Math.max(2, Math.ceil(l.pts.length * grow)); ctx.beginPath(); ctx.moveTo(l.pts[0][0], l.pts[0][1]); for (let i = 1; i < n; i++) ctx.lineTo(l.pts[i][0], l.pts[i][1]); };
    // 暗色的裂痕本體
    ctx.globalAlpha = .85 * fade; ctx.strokeStyle = '#140f08';
    for (const l of c.lines) { ctx.lineWidth = l.w + 1; path(l); ctx.stroke(); }
    if (glow > 0) {   // 剛裂開：裂縫裡透出法術顏色的光
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = beRgb(c.col, .55 * glow); for (const l of c.lines) { ctx.lineWidth = l.w + 6; path(l); ctx.stroke(); }
      ctx.strokeStyle = beRgb(c.col.map(v => Math.min(255, v + 120)), .95 * glow); for (const l of c.lines) { ctx.lineWidth = l.w * .7; path(l); ctx.stroke(); }
    }
    ctx.restore();
  }
}

// ---- 目標：看得到的最近一個我方（溫特、隊友）----
function beFoe(e) {
  const R = 16 * CELL, list = [G.player, ...G.towers].filter(t => t && t.hp > 0 && !t.berserk);
  let best = null, bestD = R;
  for (const t of list) { const d = Math.hypot(t.x - e.x, t.y - e.y); if (d <= bestD && hasLineOfSight(e.x, e.y, t.x, t.y)) { best = t; bestD = d; } }
  return best;
}
// ---- 挑法術：有人受傷優先補血；其他輪流挑沒剛用過的 ----
function beAllies(e) {
  const R = BANANA_EMPEROR.range * CELL;
  return G.enemies.filter(o => !o.dead && o.hp > 0 && !o.dummy && Math.hypot(o.x - e.x, o.y - e.y) <= R);
}
function bePickSpell(e, foe) {
  const B = BANANA_EMPEROR, allies = beAllies(e);
  if (e.be.last !== 'heal' && allies.some(o => o.hp < o.maxhp * B.healBelow)) return 'heal';
  const pool = ['atk', 'def', 'spd'].filter(id => id !== e.be.last && allies.some(o => o !== e && !(o.beBuff && o.beBuff[id] > 2)));
  if (foe && e.be.last !== 'peels') pool.push('peels', 'peels');   // 有看到人：比較常下香蕉皮雨
  if (!pool.length) return allies.some(o => o.hp < o.maxhp) ? 'heal' : (foe ? 'peels' : null);
  return pool[Math.floor(Math.random() * pool.length)];
}
// ---- 施法效果 ----
function beCast(e, rec, id, foe) {
  const B = BANANA_EMPEROR, S = B.spells[id];
  flash(S.name + '！', e.x, e.y - e.drawHeight - 12, beHex(S.color));
  if (id === 'peels') { bePeelRain(e, foe); return; }
  for (const o of beAllies(e)) {
    const h = o.drawHeight || 50;
    if (id === 'heal') {
      if (o.hp >= o.maxhp) continue;
      const add = Math.min(S.amount, o.maxhp - o.hp);
      o.hp += add; if (o.cf) o.cf.hp0 = o.hp;
      if (o.beHp != null) o.beHp = o.hp;   // 防禦 BUFF 不要把補的血當成扣血
      flashDmg('+' + Math.round(add), o.x, o.y - h * .6, beHex(S.color));
    } else {
      if (o === e && id !== 'def') continue;   // 他自己不走路、不打人：只吃防禦
      beApplyBuff(o, id, S.time);
    }
    G.effects.push({ fglow: true, pal: beGlowPal(S.color), grow: true, x: o.x, y: o.y - h * .35, r0: 10, r1: 30 + h * .25, life: .8, life0: .8 });
    G.effects.push({ ring: true, x: o.x, y: o.y, r: 4, r2: 26 + h * .15, life: .45, life0: .45, color: beHex(S.color) });
    for (let i = 0; i < 8; i++) G.effects.push({ particle: true, x: o.x + (Math.random() - .5) * 30, y: o.y - Math.random() * h * .6, vx: (Math.random() - .5) * 20, vy: -55 - Math.random() * 60, r: 1.5 + Math.random() * 2, life: .6 + Math.random() * .4, life0: 1, color: beHex(S.color) });
  }
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

// ---- 每幀（game.js 的 update 呼叫）：BUFF 計時、防禦減傷、身上的光點 ----
function updateBananaEmperor(dt) {
  if (!G.enemies) return;
  const B = BANANA_EMPEROR;
  if (G.beCracks) { for (const c of G.beCracks) c.t += dt; G.beCracks = G.beCracks.filter(c => c.t < B.cracks.life); }
  for (const o of G.enemies) {
    const b = o.beBuff;
    if (!b) continue;
    if (o.dead || o.hp <= 0) continue;
    if (b.def > 0 && o.beHp != null && o.hp < o.beHp) o.hp += (o.beHp - o.hp) * B.spells.def.cut;   // 防禦：這一幀被扣的血退一部分回來
    if (b.def > 0) o.beHp = o.hp;
    for (const id of ['atk', 'def', 'spd']) {
      if (!(b[id] > 0)) continue;
      b[id] -= dt;
      if (b[id] <= 0) { beEndBuff(o, id); continue; }
      if (Math.random() < dt * 5) {   // 身上冒這個 BUFF 顏色的光點
        const h = o.drawHeight || 50;
        G.effects.push({ particle: true, x: o.x + (Math.random() - .5) * (o.drawWidth || 40) * .7, y: o.y - Math.random() * h * .5, vx: (Math.random() - .5) * 12, vy: -30 - Math.random() * 30, r: 1.4 + Math.random() * 1.4, life: .7, life0: .7, color: beHex(B.spells[id].color) });
      }
    }
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
