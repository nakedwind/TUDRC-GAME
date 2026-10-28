/* ===== 金蕉王（behavior: "healer"）=====
   ・補師：每 healEvery 秒舉起權杖施法一次，幫 healRange 格內的所有怪物（含自己）補 healAmount HP。範圍內沒人受傷就先不施法，等有人受傷再補。
     阿瓦倫也是異質體，站在範圍內一樣會被補到（healSentries；他還是會躲阿瓦倫）。
   ・膽小：看到我方（溫特、隊友）會優先逃走，附近有其他怪物就往那隻怪物的方向逃；但只要看到有怪物受傷，就會不顧危險靠過去補血。
   ・自己不會攻擊，走得很慢。
   ・打死掉香蕉（掉在地上，走過去按互動鍵撿）。
   ・帶隊：每隻金蕉王出現時都會帶 squadSize 隻同一種的怪物（從 squadPool 隨機挑一種），四隻一組像一個小隊，不會散開：
     隊員閒晃時待在金蕉王附近；離他超過 squadLeash 格（追人追太遠、被引開）就放下目標、用尋路走回來；
     金蕉王逃跑優先躲回自己的隊員；核心甦醒時金蕉王也跟著回去守核心（隊員跟著他）。
   ・測試用：進戰鬥地圖時在營地右邊 testCampDist 格生一隻（testSpawn 改 false 就關掉）。
   必須在 enemy-ai.js 之後、game.js 之前載入。數值都集中在下面的 BANANA_KING。
*/
const BANANA_KING = {
  // ---- 補血 ----
  healEvery: 10,       // 幾秒施法一次
  healAmount: 30,      // 每次補多少 HP
  healRange: 6,        // 補血範圍（格）
  healSelf: true,      // 也補自己
  healSentries: ['avaren'],   // 也會被補到的隊員（異質體出身的阿瓦倫）
  castTime: .9,        // 施法動作幾秒（前半舉杖、後半發光；發光那一下補血）
  glow: .5,            // 施法綠色光暈的亮度（1＝原本的亮度）
  // ---- 找傷患 ----
  seeRange: 10,        // 看得到幾格內受傷的怪物
  healStand: 3,        // 走到離傷患幾格內就停下來
  // ---- 逃跑 ----
  noticeRange: 12,     // 看到我方的距離（格；看到就逃，不用等被打）
  feelRange: 4,        // 這麼近就算隔著東西看不到也會察覺（格）
  safeRange: 14,       // 逃到離我方幾格才停
  fleeSpeedMul: 1.8,   // 逃跑時速度倍率
  buddyRange: 12,      // 逃跑時，幾格內有其他怪物就往那隻怪物逃
  buddyStand: 1.5,     // 逃到離那隻怪物幾格內就躲在旁邊
  // ---- 香蕉皮（開始逃跑時往身後拋出）----
  peelCount: 3,        // 一次拋幾個
  peelCd: 8,           // 拋完幾秒內不會再拋
  peelFly: .5,         // 飛在空中幾秒
  peelHeight: 34,      // 拋多高（像素）
  peelDist: [1, 2.2],  // 落在身後幾格（往我方的方向）
  peelSpread: 50,      // 左右散開的角度（度）
  peelLife: 40,        // 香蕉皮留幾秒
  peelMax: 15,         // 場上最多幾個（滿了先刪最舊的）
  peelTrigger: 16,     // 離香蕉皮幾像素算踩到
  slipDist: 2.5,       // 滑多遠（格）
  slipTime: .9,        // 滑行（含最後滑停）幾秒，期間不能操作
  slipDizzy: 3,        // 滑行中撞到障礙物：頭暈幾秒（頭上冒星星、左右斜晃，不能走、不能攻擊）
  peelScale: 1.6,      // 香蕉皮畫成原圖的幾倍
  // ---- 帶隊（出現時一起生成的隊員）----
  squadSize: 3,        // 帶幾隻
  squadPool: ['slime', 'fish_head', 'bird_head', 'pearl_kid', 'loofah_lady', 'clownfish'],   // 從這幾種隨機挑一種（全隊同一種）
  squadRange: 3,       // 隊員閒晃時離金蕉王最多幾格
  squadLeash: 8,       // 隊員離金蕉王超過幾格就回來（追人也不會追更遠）
  squadRegroup: 2.5,   // 走回到離他幾格內，才恢復自由行動
  squadFleeRange: 20,  // 金蕉王逃跑時，幾格內有自己的隊員就優先躲過去
  // ---- 掉落 ----
  dropId: 'banana',
  dropMin: 1,          // 掉幾根：dropMin～dropMax 隨機
  dropMax: 2,
  // ---- 測試用 ----
  testSpawn: false,    // 測試用：true＝進戰鬥地圖時在營地右邊生一隻
  testCampDist: 20,    // 營地右邊幾格
};
const BK_ART = {
  cast1: 'images/monster/golden-banana-king/golden-banana-king-cast-01.png',
  cast2: 'images/monster/golden-banana-king/golden-banana-king-cast-02.png',
  peel: 'images/monster/golden-banana-king/bananapeel.png',
};
const bkState = e => e.bk || (e.bk = { cd: BANANA_KING.healEvery * (.4 + Math.random() * .3), cast: 0, healed: false, flee: null, fleeT: 0 });
const bkAlive = o => o && !o.dead && o.hp > 0 && !o.dummy;
const bkHurt = o => bkAlive(o) && o.hp < (o.maxhp || o.hp);

// ---- 補血範圍內有沒有人受傷 ----
function bkHealTargets(e) {
  const C = BANANA_KING, R = C.healRange * CELL;
  const near = o => Math.hypot(o.x - e.x, o.y - e.y) <= R;
  return [...G.enemies.filter(o => bkAlive(o) && (o !== e || C.healSelf) && near(o)),
    ...G.towers.filter(t => C.healSentries.includes(t.type) && t.hp > 0 && near(t))];
}
// ---- 看得到的傷患（最近的那隻，不含自己）----
function bkHurtAlly(e) {
  const R = BANANA_KING.seeRange * CELL;
  let best = null, bestD = R;
  for (const o of G.enemies) {
    if (o === e || !bkHurt(o)) continue;
    const d = Math.hypot(o.x - e.x, o.y - e.y);
    if (d <= bestD && hasLineOfSight(e.x, e.y, o.x, o.y)) { best = o; bestD = d; }
  }
  return best;
}
// ---- 看得到的我方（溫特、隊友）----
function bkThreats(e) {
  const C = BANANA_KING, R = C.noticeRange * CELL, list = [];
  const seen = t => { if (!t || t.hp <= 0) return false; const d = Math.hypot(t.x - e.x, t.y - e.y); return d <= C.feelRange * CELL || (d <= R && hasLineOfSight(e.x, e.y, t.x, t.y)); };
  if (seen(G.player) || ((e.playerAggroT || 0) > 0 && G.player && G.player.hp > 0)) list.push(G.player);   // 被開槍打中：就算沒看到也知道要跑
  for (const t of G.towers) if (!t.berserk && seen(t)) list.push(t);
  return list;
}

// ---- 施法：舉杖 → 發光的瞬間補血 ----
function bkCast(e, dt) {
  const C = BANANA_KING, bk = bkState(e);
  bk.cast -= dt;
  const half = C.castTime / 2;
  e.forceFrame = bk.cast > half ? BK_ART.cast1 : BK_ART.cast2; e.forceFlip = !!e.faceRight;   // 原圖朝左：面向右邊就翻
  if (!bk.healed && bk.cast <= half) { bk.healed = true; bkHealPulse(e); }
  else if (!bk.healed && Math.random() < dt * 30) {   // 舉杖蓄力：綠色光點往權杖頂端聚過來
    const [sx, sy] = bkStaffTip(e), a = Math.random() * Math.PI * 2, r = 22 + Math.random() * 18;
    G.effects.push({ particle: true, x: sx + Math.cos(a) * r, y: sy + Math.sin(a) * r, vx: -Math.cos(a) * r * 3.4, vy: -Math.sin(a) * r * 3.4, r: 1.6 + Math.random() * 1.6, life: .3, life0: .3, color: '#b8ff9c' });
  }
  if (bk.cast <= 0) { bk.cast = 0; e.forceFrame = null; bk.cd = C.healEvery; }
}
// 權杖頂端的紫色結晶在哪（原圖朝左，權杖在左手邊；面向右邊時圖片翻過來）
function bkStaffTip(e) {
  const w = e.drawWidth || 78, h = e.drawHeight || 143;
  return [e.x + (e.faceRight ? 1 : -1) * w * .36, e.y - h * .78];
}
// 開始施法：權杖頂端亮起來、播補血音效（js/golden-banana-king.js 的 stepHealerEnemy 呼叫）
function bkCastStart(e) {
  const C = BANANA_KING, [sx, sy] = bkStaffTip(e);
  G.effects.push({ fglow: true, green: true, strength: BANANA_KING.glow, grow: true, x: sx, y: sy, r0: 6, r1: 34, life: C.castTime / 2, life0: C.castTime / 2 });
  if (typeof sfxAt === 'function') sfxAt('bananaHeal', e.x, e.y, .8, 'banana-heal');
}
function bkHealPulse(e) {
  const C = BANANA_KING, R = C.healRange * CELL, [sx, sy] = bkStaffTip(e);
  // 權杖爆出白綠閃光＋整片補血範圍的綠色光暈（黑暗中也會被照亮）
  G.effects.push({ fglow: true, green: true, strength: BANANA_KING.glow, x: sx, y: sy, r0: 14, r1: 60, life: .45, life0: .45 });
  G.effects.push({ fglow: true, green: true, strength: BANANA_KING.glow, grow: true, x: e.x, y: e.y - 20, r0: R * .3, r1: R, life: 1.1, life0: 1.1 });
  G.effects.push({ ring: true, x: e.x, y: e.y, r: 8, r2: R, life: .7, life0: .7, color: '#9dff7a' });
  G.effects.push({ ring: true, x: e.x, y: e.y, r: 4, r2: R * .65, life: .5, life0: .5, color: '#e6ffd0' });
  if (typeof addLightFlash === 'function') addLightFlash('heal', e.x, e.y - 20, R / 240);
  for (const o of bkHealTargets(e)) {
    if (!bkHurt(o)) continue;
    const add = Math.min(C.healAmount, o.maxhp - o.hp);
    o.hp += add;
    if (o.cf) o.cf.hp0 = o.hp;   // 比基尼小丑魚用 hp 變化判斷被打：補血不要被當成受驚
    const h = o.drawHeight || 50;
    G.effects.push({ fglow: true, green: true, strength: BANANA_KING.glow, grow: true, x: o.x, y: o.y - h * .35, r0: 10, r1: 30 + h * .25, life: .8, life0: .8 });
    G.effects.push({ ring: true, x: o.x, y: o.y, r: 4, r2: 26, life: .45, life0: .45, color: '#9dff7a' });
    for (let i = 0; i < 9; i++) {   // 身上冒出往上飄的綠色光點
      G.effects.push({ particle: true, x: o.x + (Math.random() - .5) * 30, y: o.y - Math.random() * h * .6, vx: (Math.random() - .5) * 20,
        vy: -55 - Math.random() * 60, r: 1.5 + Math.random() * 2, life: .6 + Math.random() * .4, life0: 1, color: Math.random() < .3 ? '#eaffd8' : '#7dff8a' });
    }
    if (o !== e && typeof addLightFlash === 'function') addLightFlash('heal', o.x, o.y - 20, .35);
    flashDmg('+' + Math.round(add), o.x, o.y - h * .6, '#7dff8a');
  }
}

// ---- 逃跑時要投靠的怪物：buddyRange 格內最近、而且不在我方那一側的（不會往人身上撞）----
function bkBuddy(e, threats) {
  return bkPickBuddy(e, threats, BANANA_KING.squadFleeRange, o => o.squadLeader === e)   // 優先：自己的隊員
    || bkPickBuddy(e, threats, BANANA_KING.buddyRange, () => true);
}
function bkPickBuddy(e, threats, range, ok) {
  const R = range * CELL;
  let best = null, bestD = R;
  for (const o of G.enemies) {
    if (o === e || !bkAlive(o) || o.behavior === 'healer' || !ok(o)) continue;
    const d = Math.hypot(o.x - e.x, o.y - e.y);
    if (d > bestD) continue;
    const ux = (o.x - e.x) / (d || 1), uy = (o.y - e.y) / (d || 1);
    const toward = threats.some(t => { const td = Math.hypot(t.x - e.x, t.y - e.y) || 1; return td < d && ((t.x - e.x) * ux + (t.y - e.y) * uy) / td > .5; });   // 那隻怪物在我方後面：不去
    if (toward) continue;
    best = o; bestD = d;
  }
  return best;
}
// ---- 逃跑：在走得到的 8 步內，找一格離我方最遠的地方 ----
const bkFleeCell = (e, threats) => enemyFleeCell(e, threats);   // js/enemy-ai.js（死路會扣分，不會躲進牆角）

// ---- 行為（enemy-ai.js 的 stepEnemy 呼叫）----
function stepHealerEnemy(e, dt) {
  const C = BANANA_KING, bk = bkState(e);
  if (!e.bkSquad) bkSpawnSquad(e);   // 剛出現：叫隊員出來
  if (bk.cast > 0) { bkCast(e, dt); return; }   // 施法中站著不動
  if (bk.tossT > 0) { bk.tossT -= dt; if (bk.tossT <= 0) e.forceFrame = null; }   // 拋香蕉皮的舉手姿勢
  if (e.stunT > 0) { e.forceFrame = null; return; }
  bk.cd -= dt;
  bk.peelCd = (bk.peelCd || 0) - dt;
  if (bk.cd <= 0 && bkHealTargets(e).some(bkHurt)) { bk.cast = C.castTime; bk.healed = false; bkCastStart(e); bkCast(e, 0); return; }
  const ally = bkHurtAlly(e);
  if (ally) {   // 有人受傷：不管危不危險都走過去
    bk.flee = null;
    e.faceRight = ally.x > e.x;
    if (Math.hypot(ally.x - e.x, ally.y - e.y) > C.healStand * CELL) {
      const [gc, gr] = cellAt(ally.x, ally.y);
      enemyNavigate(e, gc, gr, dt, 'bk-heal:' + gc + ',' + gr, false);
    }
    return;
  }
  const threats = bkThreats(e);
  if (threats.length) bk.threats = threats;
  // 核心醒著：跟著回去守核心（隊員會跟著他走）；我方貼得很近才先逃
  const guard = typeof frenzyCoreGoal === 'function' ? frenzyCoreGoal(e) : null;
  if (guard && !threats.some(t => Math.hypot(t.x - e.x, t.y - e.y) < 3 * CELL)) {
    bk.flee = null;
    const [gc, gr] = cellAt(guard.x, guard.y);
    const nav = enemyNavigate(e, gc, gr, dt * C.fleeSpeedMul, 'core:' + gc + ',' + gr, 'detour');
    if (nav.blocker || (nav.reached && Math.hypot(guard.x - e.x, guard.y - e.y) > CELL * 2)) { e.coreReturning = false; e.coreGiveUpT = 4; }   // 走不到（他不會拆建築）：先放棄，過一下再試
    return;
  }
  const chasers = (bk.flee && bk.threats || []).filter(t => t.hp > 0);   // 看不到了也要逃到夠遠才停
  const near = chasers.length && Math.min(...chasers.map(t => Math.hypot(t.x - e.x, t.y - e.y))) < C.safeRange * CELL;
  if (threats.length || near) {   // 看到我方：逃
    if (!bk.flee && bk.peelCd <= 0 && threats.length) bkTossPeels(e, threats);   // 剛開始逃：往身後拋香蕉皮
    bk.fleeT -= dt;
    const from = threats.length ? threats : chasers, buddy = bkBuddy(e, from);
    if (buddy) {   // 附近有其他怪物：躲到牠旁邊
      bk.flee = cellAt(buddy.x, buddy.y); bk.fleeT = .5;
      if (Math.hypot(buddy.x - e.x, buddy.y - e.y) > C.buddyStand * CELL) {
        const [bc, br] = bk.flee;
        enemyNavigate(e, bc, br, dt * C.fleeSpeedMul, 'bk-buddy:' + bc + ',' + br, false);
      }
      return;
    }
    if (!bk.flee || bk.fleeT <= 0) { bk.flee = bkFleeCell(e, from); bk.fleeT = 1.6; }
    if (bk.flee) {
      const [fc, fr] = bk.flee;
      const nav = enemyNavigate(e, fc, fr, dt * C.fleeSpeedMul, 'bk-flee:' + fc + ',' + fr, false);
      if (nav.reached) bk.fleeT = 0;
    }
    return;
  }
  bk.flee = null;
  bkWander(e, dt);
}
function bkWander(e, dt) {
  e.wanderWait = Math.max(0, (e.wanderWait || 0) - dt);
  if (!e.wanderCell && e.wanderWait <= 0) e.wanderCell = chooseDarkWanderCell(e);
  if (e.wanderCell) {
    const [wc, wr] = e.wanderCell;
    const nav = enemyNavigate(e, wc, wr, dt, 'bkw:' + wc + ',' + wr, false);
    if (nav.reached) { e.wanderCell = null; e.aiPath = null; e.wanderWait = 1 + Math.random() * 2; }
  } else if (e.wanderWait <= 0) {
    e.wanderWait = .5 + Math.random();
  }
}

// ---- 香蕉皮：開始逃跑時往身後（我方那一側）拋出，落地後我方踩到會滑一大段 ----
function bkTossPeels(e, threats) {
  const C = BANANA_KING, bk = bkState(e), peels = (G.bananaPeels = G.bananaPeels || []);
  bk.peelCd = C.peelCd;
  let near = threats[0], nd = Infinity;
  for (const t of threats) { const d = Math.hypot(t.x - e.x, t.y - e.y); if (d < nd) { nd = d; near = t; } }
  const base = Math.atan2(near.y - e.y, near.x - e.x);
  for (let i = 0; i < C.peelCount; i++) {
    const a = base + ((C.peelCount > 1 ? i / (C.peelCount - 1) : .5) - .5) * C.peelSpread * Math.PI / 180 + (Math.random() - .5) * .25;
    const dist = (C.peelDist[0] + Math.random() * (C.peelDist[1] - C.peelDist[0])) * CELL;
    let tx = e.x + Math.cos(a) * dist, ty = e.y + Math.sin(a) * dist;
    for (let k = 0; k < 4 && enemyBlocked(tx, ty); k++) { tx = (tx + e.x) / 2; ty = (ty + e.y) / 2; }   // 落點在牆裡：往回拉
    peels.push({ sx: e.x, sy: e.y - 50, x: tx, y: ty, fly: C.peelFly * (.85 + Math.random() * .3), t: 0, life: C.peelLife, rot: Math.random() * Math.PI * 2, spin: (Math.random() < .5 ? -1 : 1) * (8 + Math.random() * 6) });
  }
  while (peels.length > C.peelMax) peels.shift();
  e.forceFrame = BK_ART.cast1; e.forceFlip = !!e.faceRight; bk.tossT = .25;   // 舉手拋出的一瞬間
  if (typeof sfxAt === 'function') sfxAt('pop', e.x, e.y, .6, 'banana-peel-toss');
}
function bkPeelVictims() {
  const list = [];
  if (G.player && G.player.hp > 0) list.push(G.player);
  for (const t of G.towers) if (t.hp > 0) list.push(t);
  return list;
}
function bkSlip(a, peel) {
  const C = BANANA_KING;
  // 滑的方向：踩上去時正在走的方向；站著不動被丟到就往遠離香蕉皮的方向
  let vx = a.x - (a.bkPrevX ?? a.x), vy = a.y - (a.bkPrevY ?? a.y);
  if (Math.hypot(vx, vy) < .2) { vx = a.x - peel.x; vy = a.y - peel.y; }
  const d = Math.hypot(vx, vy) || 1, v = C.slipDist * CELL * 2 / C.slipTime;   // 速度線性遞減：滑行距離 = v × T ÷ 2
  a.knockT = a.knockT0 = C.slipTime; a.knockVX = vx / d * v; a.knockVY = vy / d * v;
  a.slipT = C.slipTime;
  // 滑倒的姿勢：隨機挑一張走路圖（任一方向、Walking01 或 02），整段滑行定格在這張（js/game.js 的 pickCharacterFrame）
  a.slipPose = { dir: ['front', 'back', 'left', 'right'][Math.floor(Math.random() * 4)], frame: 1 + Math.floor(Math.random() * 2) };
  flash('滑倒！', a.x, a.y - 50, '#ffe066');
  G.effects.push({ ring: true, x: peel.x, y: peel.y, r: 3, r2: 18, life: .25, life0: .25, color: '#ffe066' });
  if (typeof sfxAt === 'function') sfxAt('bananaSlip', peel.x, peel.y, .8, 'banana-slip');
}
function updateBananaPeels(dt) {
  const C = BANANA_KING, peels = G.bananaPeels, actors = bkPeelVictims();
  if (peels && peels.length) {
    for (const peel of [...peels]) {
      if (peel.t < peel.fly) { peel.t += dt; peel.rot += peel.spin * dt; continue; }   // 還在空中
      peel.life -= dt;
      if (peel.life <= 0) { peels.splice(peels.indexOf(peel), 1); continue; }
      const a = actors.find(o => !(o.knockT > 0) && !(o.slipDizzyT > 0) && Math.hypot(o.x - peel.x, o.y - peel.y) <= C.peelTrigger);
      if (!a) continue;
      peels.splice(peels.indexOf(peel), 1);   // 踩過就爛掉
      bkSlip(a, peel);
    }
  }
  for (const a of actors) { a.bkPrevX = a.x; a.bkPrevY = a.y; if (a.slipT > 0) a.slipT -= dt; if (a.slipDizzyT > 0) a.slipDizzyT -= dt; }
  for (const t of G.towers) if (t.hp <= 0) t.slipDizzyT = 0;   // 倒下就不暈了
  if (G.player && G.player.hp <= 0) G.player.slipDizzyT = 0;
}
// ---- 滑行中撞到障礙物：停下來頭暈（js/bird-head.js 的 stepActorKnock、js/berserk-fx.js 的 updateKnockSlide 呼叫）----
function bkSlipBump(a) {
  if (!(a.slipT > 0)) return false;
  const C = BANANA_KING;
  a.knockT = 0; a.slipT = 0;
  a.slipDizzyT = C.slipDizzy; a.moving = false; a.navPath = null; a.meleeSwing = null; a.gunSwing = null;
  if (a.gsCast && typeof cancelGuideCast === 'function') cancelGuideCast(a);   // 嚮導詠唱中：技能取消
  flash('頭暈！', a.x, a.y - 50, '#ffe36e');
  G.effects.push({ ring: true, x: a.x, y: a.y - 10, r: 4, r2: 22, life: .2, life0: .2, color: '#d9d2c0' });
  if (typeof sfxAt === 'function') sfxAt('knock2', a.x, a.y, .6, 'banana-slip-bump');
  return true;
}
// 頭暈的星星：跟鳥頭人同一套（js/burrowing-mouse.js 的 drawBurrowDizzyStars）；畫在黑幕上面（render.js 呼叫）
function drawSlipDizzyStars(ctx) {
  if (!G || typeof drawBurrowDizzyStars !== 'function') return;
  const t = performance.now() / 1000, size = PLAYER.drawSize;
  for (const a of [G.player, ...(G.towers || [])]) {
    if (!a || !(a.slipDizzyT > 0) || a.hp <= 0) continue;
    drawBurrowDizzyStars(ctx, a.x, a.y - size + 28, 1, t);
  }
}
// ---- 滑倒中：身體往後仰、手忙腳亂地晃；頭暈中：以腳底為軸左右斜晃（js/render.js 畫溫特、隊友時呼叫）----
function applySlipTransform(ctx, a) {
  if (a && a.slipDizzyT > 0 && a.hp > 0) {
    const S = typeof DIZZY_SWAY !== 'undefined' ? DIZZY_SWAY : { angle: .09, speed: 6 };
    const ang = Math.sin(performance.now() / 1000 * S.speed + (a.swayPhase ??= Math.random() * 6)) * S.angle;
    const fx = a.x, fy = a.y + 16;
    ctx.translate(fx, fy); ctx.rotate(ang); ctx.translate(-fx, -fy);
    return;
  }
  if (!(a && a.slipT > 0)) return;
  const C = BANANA_KING, k = a.slipT / C.slipTime, side = (a.knockVX || 0) >= 0 ? 1 : -1;
  const lean = Math.sin(Math.min(1, (1 - k) * 4) * Math.PI / 2) * k * .55;   // 一踩到就往後仰，慢慢站穩
  const ang = -side * lean + Math.sin(performance.now() / 1000 * 30) * .06 * k;
  const fx = a.x, fy = a.y + 16;
  ctx.translate(fx, fy); ctx.rotate(ang); ctx.translate(-fx, -fy);
}
// ---- 繪製（地面層，跟魚卵一起；js/render.js 呼叫）----
function drawBananaPeels(ctx) {
  const peels = G.bananaPeels;
  if (!peels || !peels.length) return;
  const C = BANANA_KING, img = typeof monsterImage === 'function' ? monsterImage(BK_ART.peel) : null;
  const ready = img && img.complete && img.naturalWidth, w = ready ? img.naturalWidth * C.peelScale : 32, h = ready ? img.naturalHeight * C.peelScale : 24, s = w;
  for (const peel of peels) {
    const k = Math.min(1, peel.t / peel.fly), air = k < 1;
    const x = peel.sx + (peel.x - peel.sx) * k, y = peel.sy + (peel.y - peel.sy) * k - Math.sin(Math.PI * k) * C.peelHeight;
    const fade = peel.life < 3 ? Math.max(.2, peel.life / 3) : 1;
    ctx.save();
    ctx.globalAlpha = .25 * fade; ctx.fillStyle = '#071015';   // 影子畫在落點方向的地上
    const shx = peel.sx + (peel.x - peel.sx) * k, shy = peel.sy + 50 + (peel.y - peel.sy - 50) * k;
    ctx.beginPath(); ctx.ellipse(shx, shy - 3, s * .38, s * .16, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = fade;
    ctx.translate(x, y - h / 2 + 3);
    if (air) ctx.rotate(peel.rot);
    if (ready) { ctx.imageSmoothingEnabled = false; ctx.drawImage(img, -w / 2, -h / 2, w, h); }
    else { ctx.fillStyle = '#ffd640'; ctx.beginPath(); ctx.arc(0, 0, s * .35, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  }
}

// ---- 帶隊：金蕉王第一次行動時，在身邊生出 squadSize 隻同一種的怪物 ----
function bkSpawnSquad(e) {
  const C = BANANA_KING;
  e.bkSquad = true;
  if (MAP_SAFE || (typeof MONSTER_PREVIEW_ID !== 'undefined' && MONSTER_PREVIEW_ID) || (typeof practiceOn === 'function' && practiceOn())) return;
  const pool = C.squadPool.map(id => ACTIVE_MONSTERS.find(m => m.id === id)).filter(Boolean);
  if (!pool.length || C.squadSize <= 0) return;
  const spec = pool[Math.floor(Math.random() * pool.length)];
  const spots = [];
  for (const r of [1.3, 2, 2.8]) for (let i = 0; i < 8; i++) {   // 圍在金蕉王旁邊，由近到遠找能站的地方
    const a = (i + Math.random() * .3) / 8 * Math.PI * 2, x = e.x + Math.cos(a) * r * CELL, y = e.y + Math.sin(a) * r * CELL, [c, rr] = cellAt(x, y);
    if (!inGrid(c, rr) || isWall(c, rr) || enemyBarrierAt(c, rr) || enemyBlocked(x, y)) continue;
    if (spots.some(s => Math.hypot(s.x - x, s.y - y) < CELL * .9)) continue;
    spots.push({ x, y });
  }
  for (let i = 0; i < C.squadSize; i++) {
    const s = spots[i] || { x: e.x + (Math.random() - .5) * 12, y: e.y + (Math.random() - .5) * 12 };
    const m = createMonster(spec, s.x, s.y, spec.id === 'slime' ? 'normal' : undefined);   // 史萊姆隊員都用一般的，整隊看起來才一致
    m.squadLeader = e;
    G.enemies.push(m);
    G.effects.push({ ring: true, x: s.x, y: s.y, r: 3, r2: 20, life: .35, life0: .35, color: '#ffe066' });
  }
}
// ---- 隊員的牽繩：離金蕉王太遠就放下目標、用尋路走回來（js/enemy-ai.js 的 stepEnemy 呼叫；回傳 true＝這一幀由這裡處理）----
function stepSquadLeash(e, dt) {
  const C = BANANA_KING, L = squadAnchor(e);
  if (L === e) { e.squadReturn = false; return false; }   // 隊長不在了：自由行動
  const d = Math.hypot(L.x - e.x, L.y - e.y);
  if (!e.squadReturn) {
    if (d <= C.squadLeash * CELL || (e.ch && e.ch.state === 'charge')) return false;   // 鳥頭人衝撞到一半不打斷
    e.squadReturn = true; e.aiPath = null; e.wanderCell = null;
    if (e.behavior !== 'clownfish') e.forceFrame = null;   // 絲瓜小姐抬腳之類的動作圖：收起來再走
  } else if (d <= C.squadRegroup * CELL) { e.squadReturn = false; e.aiPath = null; return false; }
  const moveDt = e.behavior === 'clownfish' && typeof updateClownfishHop === 'function' ? updateClownfishHop(e, dt) : e.frames ? dt : updateSlimeJump(e, dt);
  e.faceRight = L.x > e.x;
  if (!moveDt) return true;
  const [lc, lr] = cellAt(L.x, L.y);
  const nav = enemyNavigate(e, lc, lr, moveDt, 'squad:' + lc + ',' + lr, 'detour');
  if (nav.blocker) enemyAttackObstacle(e, nav.blocker, dt);   // 真的被建築擋死才拆
  return true;
}
// ---- 隊員散步的中心點：隊長還在就繞著隊長，不然繞著自己（魚頭君、鳥頭人、珍珠小童、絲瓜小姐的散步呼叫）----
function squadAnchor(e) {
  const L = e.squadLeader;
  if (!L || L.dead || L.hp <= 0 || !G.enemies.includes(L)) { if (L) e.squadLeader = null; return e; }
  return L;
}
// ---- 隊員閒晃時挑金蕉王附近的格子（js/enemy-ai.js 的 chooseDarkWanderCell 呼叫）；隊長死了就各自解散 ----
function squadWanderCell(e) {
  const L = e.squadLeader;
  if (!L || L.dead || L.hp <= 0 || !G.enemies.includes(L)) { e.squadLeader = null; return null; }
  const [lc, lr] = cellAt(L.x, L.y), R = BANANA_KING.squadRange, choices = [];
  for (let r = lr - R; r <= lr + R; r++) for (let c = lc - R; c <= lc + R; c++) {
    const d = Math.abs(c - lc) + Math.abs(r - lr);
    if (d < 1 || d > R || !inGrid(c, r) || isWall(c, r) || enemyBarrierAt(c, r)) continue;
    choices.push([c, r]);
  }
  return choices.length ? choices[Math.floor(Math.random() * choices.length)] : null;
}

// ---- 打死：掉香蕉在地上（js/combat-feel.js 的 onEnemyDeath 呼叫）----
function bananaKingDeath(e) {
  const C = BANANA_KING;
  if (typeof itemById === 'function' && !itemById(C.dropId)) return;
  const n = C.dropMin + Math.floor(Math.random() * (C.dropMax - C.dropMin + 1));
  if (n <= 0) return;
  G.groundItems = G.groundItems || [];
  G.groundItems.push({ id: C.dropId, qty: n, x: e.x + (Math.random() - .5) * 16, y: e.y + 8, at: performance.now() / 1000 });
  flash('🍌 香蕉 ×' + n, e.x, e.y - 50, '#ffe066');
}

// ---- 每幀更新（game.js 的 update 呼叫）：香蕉皮、測試生成 ----
function updateBananaKing(dt) {
  updateBananaPeels(dt);
  bkTestSpawn();
}
// ---- 測試用：進戰鬥地圖時在營地右邊 testCampDist 格放一隻 ----
function bkTestSpawn() {
  const C = BANANA_KING;
  if (!C.testSpawn || G.bananaKingTestDone || MAP_SAFE || !G.running || G.over || !G.player
    || (typeof MONSTER_PREVIEW_ID !== 'undefined' && MONSTER_PREVIEW_ID) || (typeof practiceOn === 'function' && practiceOn())) return;
  G.bananaKingTestDone = true;
  const spec = ACTIVE_MONSTERS.find(m => m.id === 'golden_banana_king'); if (!spec) return;
  if (G.enemies.some(o => o.type === spec.id && bkAlive(o))) return;   // 讀回戰場進度時已經有了
  // 營地範圍：基地物件；沒有就用地圖的營地格
  const zones = (typeof mapBases !== 'undefined' ? mapBases : []).map(stamp => {
    const tile = mapTileById(stamp.id);
    return { x: OX + stamp.c * CELL + (stamp.ox || 0), y: OY + stamp.r * CELL + (stamp.oy || 0), w: mapStampW(stamp, tile) * CELL, h: mapStampH(stamp, tile) * CELL };
  });
  if (!zones.length) for (const key of campCells) { const [c, r] = key.split(',').map(Number); zones.push({ x: OX + c * CELL, y: OY + r * CELL, w: CELL, h: CELL }); }
  let gx, gy;
  if (zones.length) {
    const right = Math.max(...zones.map(z => z.x + z.w)), top = Math.min(...zones.map(z => z.y)), bottom = Math.max(...zones.map(z => z.y + z.h));
    gx = right + C.testCampDist * CELL; gy = (top + bottom) / 2;
  } else { gx = G.player.x + C.testCampDist * CELL; gy = G.player.y; }
  const floor = typeof mapFloorCells === 'function' ? mapFloorCells() : null;
  const [gc, gr] = cellAt(gx, gy);
  let best = null, bestD = Infinity;
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {   // 目標格站不了：找最近一格能站的
    if (isWall(c, r) || enemyBarrierAt(c, r) || (floor && !floor.has(c + ',' + r))) continue;
    const [x, y] = center(c, r);
    if (enemyBlocked(x, y)) continue;
    const d = Math.hypot(c - gc, r - gr);
    if (d < bestD) { bestD = d; best = [x, y]; }
  }
  if (!best) return;
  G.enemies.push(createMonster(spec, best[0], best[1]));
  if (typeof systemNotice === 'function') systemNotice('🍌 金蕉王出現在營地右邊約 ' + C.testCampDist + ' 格的地方。');
}
