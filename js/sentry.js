/* ===== 哨兵系統 =====
   哨兵是會走動的人：開場佈署、巡邏移動 AI、點擊選單（巡邏/指派/疏導）。
   哨兵數值在 data/balance.js 的 TYPES。
*/
// ---- 開場佈署：三位哨兵在基地（營地）區隨機位置出現 ----
function spawnSentries() {
  const cand = [];
  if (campCells.size) campCells.forEach(k => cand.push(k.split(',').map(Number)));
  else for (let c = 0; c < COLS; c++) cand.push([c, ROWS - 1]);   // 沒自訂營地＝最下排
  const ok = cand.filter(([c, r]) => inGrid(c, r) && !isWall(c, r) && !isEntrance(c, r) && !G.grid[c + ',' + r]);
  // 應變中心是全員集合的安全區；戰鬥地圖仍只生成已編入的出勤隊伍。
  const team = (MAP_SAFE && MAP_NPCS && typeof ROSTER !== 'undefined')
    ? ROSTER : ((typeof getTeam === 'function') ? getTeam() : Object.keys(TYPES));
  for (const type of team) {
    const spec = TYPES[type]; if (!spec) continue;
    const cell = ok.length ? ok.splice(Math.floor(Math.random() * ok.length), 1)[0] : [Math.floor(COLS / 2), ROWS - 1];
    const [x, y] = center(cell[0], cell[1]);
    G.towers.push({ kind: 'tower', type, x, y, hp: spec.hp, maxhp: spec.hp, cd: 0, taint: 0, berserk: false, mode: 'free', target: null, anchor: null, waitT: 0.4 + Math.random() });
  }
}

// ---- 場景 NPC：從營地附近出生，只在亮處自由走動 ----
function spawnWanderers() {
  if (!MAP_NPCS) return;            // 只有勾了「場景 NPC」的地圖才會有這些人
  const candidates = [], seen = new Set();
  const occupied = new Set(G.towers.map(t => cellAt(t.x, t.y).join(',')));
  const addCell = (c, r) => {
    const key = c + ',' + r;
    if (seen.has(key) || occupied.has(key) || !inGrid(c, r) || isWall(c, r) || isEntrance(c, r) || G.grid[key]) return;
    seen.add(key); candidates.push([c, r]);
  };

  if (campCells.size) campCells.forEach(key => addCell(...key.split(',').map(Number)));
  else for (let c = 0; c < COLS; c++) addCell(c, ROWS - 1);
  for (let r = ROWS - 1; r >= 0; r--) for (let c = 0; c < COLS; c++) addCell(c, r);

  for (const profile of WANDERERS) {
    const cell = candidates.shift() || [Math.floor(COLS / 2), ROWS - 1];
    const [x, y] = center(cell[0], cell[1]);
    G.npcs.push({
      kind: 'npc', id: profile.id, x, y, target: null,
      waitT: 0.5 + Math.random() * 1.5, dir: 'front', moving: false, anim: 0,
      blinkWait: 2 + Math.random() * 3, blinkTime: -1,
      say: null, sayWait: 2 + Math.random() * 8,   // 平時對話：倒數到 0 冒一句
    });
  }
}

// ---- 哨兵移動 AI（哨兵是「人」：在亮處走動巡邏）----
// 模式：free=自由走動（亮處隨便逛）/ hold=在錨點附近小範圍巡邏 / goto=走去指派位置後轉 hold
function sentryBlocked(x, y) {
  const r = 12;
  for (const [sx, sy] of [[-r, -r], [r, -r], [-r, r], [r, r]]) {
    const px = x + sx, py = y + sy;
    const [c, rr] = cellAt(px, py);
    if (!inGrid(c, rr) || G.grid[c + ',' + rr]) return true;
    if (solidBlocksPoint(px, py)) return true;      // 不可穿透（含像素微調）
  }
  return false;
}
// 身體邊緣也要留在光內，避免中心仍亮、人物已踏進黑暗。
function personnelInLight(x, y) {
  if (MAP_SAFE || !LIGHT.enabled) return true;
  return [[0,0],[-12,-12],[12,-12],[-12,12],[12,12]]
    .every(([dx,dy]) => isLit(x + dx, y + dy));
}
function personnelStepAllowed(x, y, tx, ty, allowDark = false) {
  const steps = Math.max(1, Math.ceil(Math.hypot(tx-x, ty-y) / 4));
  for (let i = 1; i <= steps; i++) {
    const px = x + (tx-x)*i/steps, py = y + (ty-y)*i/steps;
    if (sentryBlocked(px, py) || (!allowDark && !personnelInLight(px, py))) return false;
  }
  return true;
}
function darkEscapeCell(c, r) {
  if (!inGrid(c, r) || isWall(c, r) || isEntrance(c, r) || G.grid[c + ',' + r]) return false;
  const [x, y] = center(c, r);
  return !sentryBlocked(x, y);
}
function pathToLight(actor) {
  const [sc, sr] = cellAt(actor.x, actor.y), startKey = sc + ',' + sr;
  const queue = [[sc, sr]], cameFrom = new Map([[startKey, null]]);
  let partialGoal = null, goal = null;
  for (let head = 0; head < queue.length; head++) {
    const [c, r] = queue[head], key = c + ',' + r, [x, y] = center(c, r);
    if (personnelInLight(x, y)) { goal = key; break; }
    if (!partialGoal && isLit(x, y)) partialGoal = key;
    for (const [dc, dr] of [[0,-1],[1,0],[0,1],[-1,0]]) {
      const nc = c + dc, nr = r + dr, nextKey = nc + ',' + nr;
      if (cameFrom.has(nextKey) || !darkEscapeCell(nc, nr)) continue;
      cameFrom.set(nextKey, key); queue.push([nc, nr]);
    }
  }
  goal ||= partialGoal;
  if (!goal) return null;
  const path = [];
  for (let key = goal; key && key !== startKey; key = cameFrom.get(key)) {
    const [c, r] = key.split(',').map(Number); path.push({ c, r });
  }
  if (!path.length) path.push({ c: sc, r: sr });
  return path.reverse();
}
function escapeDarkness(actor, dt) {
  if (MAP_SAFE || !LIGHT.enabled || personnelInLight(actor.x, actor.y)) {
    if (actor.mode === 'goto' && actor.darkResumeTarget) actor.target = actor.darkResumeTarget;
    if (actor.escapePath) {
      actor.navPath = null;
      actor.navGoal = null;
      actor.navTimer = 0;
    }
    actor.darkResumeTarget = null;
    actor.escapePath = null; actor.escapeTimer = 0;
    return false;
  }
  if (actor.mode !== 'goto') actor.darkResumeTarget = null;
  else if (actor.target) actor.darkResumeTarget = actor.target;
  actor.target = null; actor.waitT = 0;
  actor.escapeTimer = (actor.escapeTimer || 0) - dt;
  const goal = actor.escapePath?.at(-1);
  if (!actor.escapePath?.length || actor.escapeTimer <= 0 || !goal || !darkEscapeCell(goal.c, goal.r)) {
    actor.escapePath = pathToLight(actor);
    actor.escapeTimer = .5;
  }
  const next = actor.escapePath?.[0];
  if (!next) return true;
  const [tx, ty] = center(next.c, next.r);
  const dx = tx - actor.x, dy = ty - actor.y, distance = Math.hypot(dx, dy);
  if (distance <= 2) { actor.escapePath.shift(); return true; }
  const step = Math.min(distance, Math.max(100, (TYPES[actor.type]?.walkSpeed || 65) * 1.25) * dt);
  const nx = actor.x + dx / distance * step, ny = actor.y + dy / distance * step;
  const oldX = actor.x, oldY = actor.y;
  if (personnelStepAllowed(actor.x, actor.y, nx, actor.y, true)) actor.x = nx;
  if (personnelStepAllowed(actor.x, actor.y, actor.x, ny, true)) actor.y = ny;
  if (Math.hypot(actor.x - oldX, actor.y - oldY) < .001) actor.escapeTimer = 0;
  return true;
}
function sentryCellWalkable(c, r) {
  if (!inGrid(c, r) || isWall(c, r) || isEntrance(c, r) || G.grid[c + ',' + r]) return false;
  const [x, y] = center(c, r);
  if (sentryBlocked(x, y)) return false;
  if (!personnelInLight(x, y)) return false;
  return true;
}
function nearestSentryGoal(c, r) {
  for (let radius = 0; radius <= 4; radius++) {
    let best = null, bestDistance = Infinity;
    for (let dc = -radius; dc <= radius; dc++) for (let dr = -radius; dr <= radius; dr++) {
      if (radius && Math.abs(dc) !== radius && Math.abs(dr) !== radius) continue;
      const nc = c + dc, nr = r + dr;
      if (!sentryCellWalkable(nc, nr)) continue;
      const distance = Math.abs(dc) + Math.abs(dr);
      if (distance < bestDistance) { best = [nc, nr]; bestDistance = distance; }
    }
    if (best) return best;
  }
  return null;
}
// 哨兵用格線 BFS 尋路。與怪物的營地流場分開，因為哨兵的目的地會隨指令與敵人改變。
function buildSentryPath(t, targetX, targetY) {
  const [sc, sr] = cellAt(t.x, t.y), [rawGc, rawGr] = cellAt(targetX, targetY);
  const goal = nearestSentryGoal(rawGc, rawGr); if (!goal) return null;
  const [gc, gr] = goal, startKey = sc + ',' + sr, goalKey = gc + ',' + gr;
  if (startKey === goalKey) return [];
  const queue = [[sc, sr]], cameFrom = new Map([[startKey, null]]);
  let head = 0;
  while (head < queue.length) {
    const [c, r] = queue[head++];
    if (c === gc && r === gr) break;
    for (const [dc, dr] of [[0,-1],[1,0],[0,1],[-1,0]]) {
      const nc = c + dc, nr = r + dr, key = nc + ',' + nr;
      if (cameFrom.has(key) || !sentryCellWalkable(nc, nr)) continue;
      cameFrom.set(key, c + ',' + r); queue.push([nc, nr]);
    }
  }
  if (!cameFrom.has(goalKey)) return null;
  const path = []; let key = goalKey;
  while (key && key !== startKey) {
    const [c, r] = key.split(',').map(Number); path.push({ c, r }); key = cameFrom.get(key);
  }
  return path.reverse();
}
function moveSentryWithPath(t, targetX, targetY, speed, dt) {
  const [goalC, goalR] = cellAt(targetX, targetY), goalKey = goalC + ',' + goalR;
  t.navTimer = (t.navTimer || 0) - dt;
  const next = t.navPath && t.navPath[0];
  if (t.navGoal !== goalKey || (!t.navPath && t.navTimer <= 0) || t.navStall > .8 || (next && !sentryCellWalkable(next.c, next.r))) {
    t.navPath = buildSentryPath(t, targetX, targetY); t.navGoal = goalKey; t.navTimer = .75;
    t.navStall = 0;
  }
  if (!t.navPath) { t.navFailed = true; return false; }
  t.navFailed = false;
  // 必須到達轉彎格中心，不能剛跨入格子就跳過路點，否則會切角卡牆。
  while (t.navPath.length) {
    const [wx, wy] = center(t.navPath[0].c, t.navPath[0].r);
    if (Math.hypot(wx - t.x, wy - t.y) > 1) break;
    t.navPath.shift();
  }
  const waypoint = t.navPath && t.navPath[0];
  let moveX = targetX, moveY = targetY;
  if (!waypoint && (sentryBlocked(moveX, moveY) || !personnelInLight(moveX, moveY))) {
    const goal = nearestSentryGoal(goalC, goalR);
    if (!goal) { t.navFailed = true; return false; }
    [moveX, moveY] = center(...goal);
  }
  if (waypoint) [moveX, moveY] = center(waypoint.c, waypoint.r);
  const dx = moveX - t.x, dy = moveY - t.y, distance = Math.hypot(dx, dy), step = speed * dt;
  if (distance <= step && personnelStepAllowed(t.x, t.y, moveX, moveY)) {
    t.x = moveX; t.y = moveY;
    if (waypoint) t.navPath.shift();
    return !waypoint;
  }
  if (distance <= 0) return true;
  const nx = t.x + dx / distance * step, ny = t.y + dy / distance * step;
  const oldX = t.x, oldY = t.y;
  if (personnelStepAllowed(t.x, t.y, nx, t.y)) t.x = nx;
  if (personnelStepAllowed(t.x, t.y, t.x, ny)) t.y = ny;
  const moved = Math.hypot(t.x - oldX, t.y - oldY) > .001;
  t.navStall = Math.hypot(dx, dy) > 2 && !moved ? (t.navStall || 0) + dt : 0;
  if (t.navStall > .8) { t.navTimer = 0; t.navFailed = true; }
  return false;
}
// 在 (cx,cy) 周圍找一個「亮的、走得到」的隨機點
function sampleWanderTarget(cx, cy, radius) {
  for (let i = 0; i < 12; i++) {
    const ang = Math.random() * Math.PI * 2, d = 30 + Math.random() * radius;
    const x = cx + Math.cos(ang) * d, y = cy + Math.sin(ang) * d;
    const [c, r] = cellAt(x, y);
    if (!inGrid(c, r) || isWall(c, r) || isEntrance(c, r) || G.grid[c + ',' + r]) continue;
    if (sentryBlocked(x, y) || !personnelInLight(x, y)) continue;
    return { x, y };
  }
  return null;
}
function sentryCompanionRule(t) {
  if (t.mode !== 'free' || typeof FOLLOW === 'undefined') return null;
  if (t.type === 'avaren') {
    const anchor = (G.towers || []).find(x => x !== t && x.type === 'eldrin' && x.hp > 0);
    if (anchor) return { anchor, radius: (FOLLOW.avaren.radiusCells || 4) * CELL, speed: FOLLOW.avaren.speed || 96 };
  }
  if (t.type === 'red' && G.player) {
    return { anchor: G.player, radius: (FOLLOW.red.radiusCells || 7) * CELL, speed: FOLLOW.red.speed || 92 };
  }
  return null;
}
// 索敵範圍內有沒有看得見的敵人／核心（有的話護衛圈先讓位給接敵，避免在圈邊抖動）
function hasAggroTarget(t) {
  const spec = TYPES[t.type]; if (!spec) return false;
  const cores = (typeof G.cores !== 'undefined') ? G.cores : [];
  if (!G.enemies.length && !cores.some(c => !c.dead)) return false;
  const detectR = (spec.aggroRange || spec.range + 1.5) * CELL;
  for (const e of [...G.enemies, ...cores]) {
    if (e.dead) continue;
    if (LIGHT.enabled && !isLit(e.x, e.y)) continue;
    if (Math.hypot(e.x - t.x, e.y - t.y) <= detectR) return true;
  }
  return false;
}
function redAttacker() {
  const player = G.player, attacker = player && player.lastAttacker;
  return player && player.underAttackT > 0 && attacker && attacker.hp > 0 && !attacker.dead && G.enemies.includes(attacker)
    ? attacker : null;
}
function campAttackerFor(t, maxDistance = Infinity) {
  const base = t.guardBase;
  if (!base || base.hp <= 0 || !G.obstacles.includes(base)) return null;
  let closest = null, bestDistance = maxDistance;
  for (const e of G.enemies) {
    if (e.dead || e.hp <= 0 || e.attackingObstacle !== base) continue;
    if (LIGHT.enabled && !isLit(e.x, e.y)) continue;
    const distance = Math.hypot(e.x - t.x, e.y - t.y);
    if (distance <= bestDistance) { closest = e; bestDistance = distance; }
  }
  return closest;
}
function updateSentry(t, dt) {
  if (t.hp <= 0) { t.target = null; t.moving = false; return; }
  rescueStuck(t, sentryBlocked);                      // 被卡在建築裡→自動脫困
  updateNpcTalk(t, dt);                                // 哨兵平時也會冒泡泡說話
  t.guardSpeechCd = Math.max(0, (t.guardSpeechCd || 0) - dt);
  if (t.berserk) { t.target = null; return; }        // 暴走中：站在原地失控
  if (escapeDarkness(t, dt)) return;
  const ownSpec = TYPES[t.type];
  // 召回營地的哨兵抵達後，優先攔截正在破壞營地的怪物。
  if (t.mode !== 'goto' && !ownSpec.guide) {
    const campThreat = campAttackerFor(t);
    if (campThreat) {
      t.target = null; t.waitT = 0;
      if (Math.hypot(campThreat.x - t.x, campThreat.y - t.y) > ownSpec.range * CELL - 6) {
        moveSentryWithPath(t, campThreat.x, campThreat.y, (ownSpec.walkSpeed || 80) * 1.25, dt);
      }
      return;
    }
  }
  const attacker = t.type === 'red' ? redAttacker() : null;
  if (attacker) {
    if (t.guardSpeechCd <= 0) {
      t.say = { text: '部隊長！我來擋住牠！', life: 3.4 };
      t.guardSpeechCd = 6;
    }
    t.target = null; t.waitT = 0;
    if (Math.hypot(attacker.x - t.x, attacker.y - t.y) > ownSpec.range * CELL - 6) {
      moveSentryWithPath(t, attacker.x, attacker.y, Math.max(170, (ownSpec.walkSpeed || 80) * 2.2), dt);
    }
    return;
  }
  if (menuSentry === t) return;                       // 選單開著時先站好
  // 嚮導保持安全距離：敵人靠近時優先往反方向撤退，仍可在遠處攻擊與治療。
  if (ownSpec.guide && G.enemies.length) {
    let threat = null, threatD = Infinity;
    for (const e of G.enemies) {
      if (e.dead || e.confuseT > 0) continue;
      const d = Math.hypot(e.x - t.x, e.y - t.y);
      if (d < threatD) { threat = e; threatD = d; }
    }
    const safeDistance = (ownSpec.evade || 3) * CELL;
    if (threat && threatD < safeDistance) {
      const dx=t.x-threat.x,dy=t.y-threat.y,d=threatD||1,step=(ownSpec.walkSpeed||80)*1.35*dt;
      const nx=t.x+dx/d*step,ny=t.y+dy/d*step;
      if (personnelStepAllowed(t.x,t.y,nx,t.y)) t.x=nx;
      if (personnelStepAllowed(t.x,t.y,t.x,ny)) t.y=ny;
      t.target=null; t.waitT=0; return;
    }
  }
  // 艾德林完成移動指令後仍主動照顧需要疏導或治療的哨兵；正在前往指定地點時先遵守指令。
  if (t.type === 'eldrin' && t.mode !== 'goto') {
    const sentinels = G.towers.filter(o =>
      o !== t && o.hp > 0 && !TYPES[o.type].guide &&
      (o.berserk || (o.taint || 0) >= 10 || o.maxhp - o.hp >= 10)
    );
    if (sentinels.length) {
      sentinels.sort((a, b) => {
        const loadDiff = (b.taint || 0) - (a.taint || 0);
        if (Math.abs(loadDiff) > 1) return loadDiff;
        const injuryDiff = (b.maxhp - b.hp) - (a.maxhp - a.hp);
        if (Math.abs(injuryDiff) > 1) return injuryDiff;
        return Math.hypot(a.x - t.x, a.y - t.y) - Math.hypot(b.x - t.x, b.y - t.y);
      });
      const supportTarget = sentinels.find(o =>
        Math.hypot(o.x - t.x, o.y - t.y) <= ownSpec.aura.r * CELL ||
        buildSentryPath(t, o.x, o.y) !== null
      );
      if (supportTarget) {
        t.supportTarget = supportTarget.type;
        followTarget(t, supportTarget, { dist: CELL * 1.35, speed: (ownSpec.walkSpeed || 80) * 1.12 }, dt);
        t.target = null; t.waitT = 0;
        return; // 支援位置優先；攻擊仍由 game.js 對射程內目標自動執行
      }
    }
  }
  // 玩家明確下達的前往指令優先於追敵與角色跟隨關係，避免目的地被接敵邏輯清除。
  if (t.mode === 'goto' && t.target) {
    const speed = (ownSpec.walkSpeed || 80) * 1.5;
    if (moveSentryWithPath(t, t.target.x, t.target.y, speed, dt)) {
      t.target = null; t.navPath = null; t.navGoal = null;
      t.mode = 'hold'; t.anchor = { x: t.x, y: t.y };
      flash('開始巡邏', t.x, t.y - 24, '#7ee0c0');
      systemNotice(TYPES[t.type].name + '已抵達巡邏點，開始巡邏');
    }
    return;
  }
  // 護衛圈：圈內可自行巡邏；距離被拉開時，會先追上指定角色再恢復自由行動。
  // 玩家明確下達的 goto / hold 指令仍優先，不會被護衛關係覆蓋。
  const companion = sentryCompanionRule(t);
  if (companion && !hasAggroTarget(t)) {   // 有敵可打時交給接敵邏輯，護衛圈先讓位（避免圈邊抖動）
    const companionDistance = Math.hypot(companion.anchor.x - t.x, companion.anchor.y - t.y);
    if (companionDistance > companion.radius) {
      t.target = null; t.waitT = 0;
      followTarget(t, companion.anchor, { dist: companion.radius * .82, speed: companion.speed }, dt);
      return;
    }
    if (t.target && Math.hypot(t.target.x - companion.anchor.x, t.target.y - companion.anchor.y) > companion.radius) {
      t.target = null; t.navPath = null;
    }
  }
  // 主動接敵：看到亮處的怪物就靠近攻擊（開火由 game.js 處理；這裡只負責走過去）
  // 追多遠依模式：自由走動＝追得遠、原地巡邏／指派＝只追崗位附近，怪死或跑遠就回去巡邏。
  const litHere = !LIGHT.enabled || isLit(t.x, t.y);
  if (litHere && (G.enemies.length || G.cores.some(c=>!c.dead))) {
    const spec = TYPES[t.type];
    const atkR = spec.range * CELL;                       // 射程（像素）
    const anchor = (t.mode !== 'free' && t.anchor) ? t.anchor : t;
    const detectR = t.guardSummoned ? Math.max(220, (spec.aggroRange || spec.range + 1.5) * CELL) : (spec.aggroRange || spec.range + 1.5) * CELL;
    const holdR = ((typeof PATROL !== 'undefined' && PATROL.holdChaseCells) || 6) * CELL;
    const leashR = t.guardSummoned ? 220 : t.mode === 'free' ? Math.max(260, detectR) : t.mode === 'hold' ? holdR : 110;
    let foe = null, fd = Infinity;
    for (const e of (t.guardSummoned ? G.enemies : [...G.enemies, ...G.cores])) {
      if (e.dead) continue;
      if (LIGHT.enabled && !isLit(e.x, e.y)) continue;    // 只追亮處看得見的怪
      if (Math.hypot(e.x - anchor.x, e.y - anchor.y) > leashR) continue;  // 不離崗太遠
      const d = Math.hypot(e.x - t.x, e.y - t.y);
      if (d < fd && d <= detectR) { fd = d; foe = e; }
    }
    if (foe) {
      t.target = null; t.waitT = 0;                       // 取消原本的閒逛
      if (fd > atkR - 6) {                                // 還沒進射程→靠過去
        moveSentryWithPath(t, foe.x, foe.y, (spec.walkSpeed || 80) * 1.25, dt); // 追敵時也會繞過障礙
      }
      return;                                             // 接敵中：不進入閒逛邏輯
    }
  }
  if (t.waitT > 0) { t.waitT -= dt; return; }
  if (!t.target) {
    const anchor = companion ? companion.anchor : (t.mode === 'hold' && t.anchor ? t.anchor : t);
    const radius = companion ? companion.radius * .92 : (t.mode === 'hold' ? 70 : 200);
    const tgt = sampleWanderTarget(anchor.x, anchor.y, radius);
    if (!tgt) { t.waitT = 0.8; return; }
    t.target = tgt; return;
  }
  const sp = (TYPES[t.type].walkSpeed || 80) * (t.mode === 'goto' ? 1.5 : 1) * ((t.taint > 85 && !t.berserk) ? 0.5 : 1) * (t.shieldMode ? 1.7 : 1);   // 指派快一點；瀕臨暴走減半；雷德舉盾衝刺加速
  if (moveSentryWithPath(t, t.target.x, t.target.y, sp, dt)) {
    t.target = null; t.navPath = null;
    if (t.mode === 'goto') { t.mode = 'hold'; t.anchor = { x: t.x, y: t.y }; flash('開始巡邏', t.x, t.y - 24, '#7ee0c0'); systemNotice(TYPES[t.type].name + '已抵達巡邏點，開始巡邏'); }
    else t.waitT = 0.6 + Math.random() * 1.8;         // 到點後停一下再逛
    return;
  }
  if (t.navFailed) { t.target = null; t.navPath = null; t.waitT = .5; }
}

// 平時對話：倒數到 0 隨機冒一句話，顯示幾秒後消失、再排下一次
function updateNpcTalk(npc, dt) {
  if (typeof WANDER_TALK === 'undefined') return;
  if (npc.berserk) { npc.say = null; return; }   // 暴走的哨兵不說話
  const battle = !MAP_SAFE && npc.kind === 'tower' && typeof BATTLE_WANDER_LINES !== 'undefined';
  const talkCfg = battle && typeof BATTLE_WANDER_TALK !== 'undefined' ? BATTLE_WANDER_TALK : WANDER_TALK;
  const nextGap = () => talkCfg.minGap + Math.random() * (talkCfg.maxGap - talkCfg.minGap);
  if (npc.sayWait == null) npc.sayWait = nextGap();
  if (npc.say) {
    npc.say.life -= dt;
    if (npc.say.life <= 0) { npc.say = null; npc.sayWait = nextGap(); }
    return;
  }
  npc.sayWait -= dt;
  if (npc.sayWait <= 0) {
    const key = npc.id || npc.type;   // NPC 用 id、哨兵用 type
    const battleLines = battle ? chapterPick(BATTLE_WANDER_LINES[key]) : null;
    const lines = battleLines || ((typeof WANDER_LINES !== 'undefined' && chapterPick(WANDER_LINES[key])) || null);
    if (lines && lines.length) npc.say = { text: lines[Math.floor(Math.random() * lines.length)], life: talkCfg.duration };
    else npc.sayWait = 4;   // 沒台詞：晚點再檢查
  }
}
// 跟隨：朝目標移動，保持 cfg.dist 的距離就停（只改座標，走路動畫由主迴圈處理）
function followTarget(mover, target, cfg, dt) {
  if (!target) return false;
  const dx = target.x - mover.x, dy = target.y - mover.y, d = Math.hypot(dx, dy);
  if (d <= cfg.dist) return true;          // 夠近了就停
  const tx = target.x - dx / d * cfg.dist, ty = target.y - dy / d * cfg.dist;
  moveSentryWithPath(mover, tx, ty, cfg.speed, dt);
  return true;
}
function updateWanderer(npc, dt) {
  rescueStuck(npc, sentryBlocked);
  updateNpcTalk(npc, dt);   // 對話倒數（即使站著不動也會說話）
  if (escapeDarkness(npc, dt)) return;
  // 阿瓦倫緊跟著艾德林
  if (npc.id === 'avaren' && typeof FOLLOW !== 'undefined') {
    const eldrin = G.npcs.find(n => n.id === 'eldrin');
    if (eldrin) { followTarget(npc, eldrin, FOLLOW.avaren, dt); npc.target = null; npc.waitT = 0; return; }
  }
  if (npc.waitT > 0) { npc.waitT -= dt; return; }
  if (!npc.target) {
    npc.target = sampleWanderTarget(npc.x, npc.y, 180);
    if (!npc.target) npc.waitT = 0.8;
    return;
  }

  if (moveSentryWithPath(npc, npc.target.x, npc.target.y, 65, dt)) {
    npc.target = null; npc.navPath = null;
    npc.waitT = 0.8 + Math.random() * 2;
    return;
  }

  if (npc.navFailed) { npc.target = null; npc.navPath = null; npc.waitT = .5; }
}

// ---- 哨兵選單（點哨兵彈出：自由走動／原地巡邏／指派位置／疏導）----
const sentryMenu = document.getElementById('sentryMenu');
let menuSentry = null;    // 目前開著選單的哨兵
let assigning = null;     // 「指派位置巡邏」等待點地圖的哨兵
function openSentryMenu(t, silent) {
  if (!silent) sfx('menu');
  menuSentry = t; assigning = null;
  const spec = TYPES[t.type];
  sentryMenu.innerHTML =
    '<div class="sm-title">' + spec.name + '　汙染 ' + Math.round(t.taint) + '</div>' +
    '<button data-act="free">🚶 自由走動</button>' +
    '<button data-act="hold">📍 在原地巡邏</button>' +
    '<button data-act="goto">🎯 指派位置巡邏</button>' +
    (MAP_SAFE ? '<button data-act="talk">💬 對話</button>' :
      '<button data-act="soothe">💗 疏導（-' + SOOTHE.cost + ' 能量）</button>');
  sentryMenu.querySelectorAll('button').forEach(b => b.addEventListener('click', () => sentryMenuAct(b.dataset.act)));
  // 選單位置：跟著哨兵在畫面上的位置（換算成 CSS 座標）
  const rect = cv.getBoundingClientRect();
  const sx = (t.x - cam.x) * VIEW_SCALE * (rect.width / VIEW_W), sy = (t.y - cam.y) * VIEW_SCALE * (rect.height / VIEW_H);
  sentryMenu.style.left = Math.round(Math.min(sx + 22, rect.width - 170)) + 'px';
  sentryMenu.style.top = Math.round(Math.max(6, sy - 30)) + 'px';
  sentryMenu.classList.remove('hidden');
}
function closeSentryMenu() { menuSentry = null; sentryMenu.classList.add('hidden'); }
function sentryMenuAct(act) {
  const t = menuSentry; if (!t) return;
  if (act === 'free') { sfx('button'); t.mode = 'free'; t.guardSummoned = false; t.guardBase = null; t.anchor = null; t.target = null; flash('自由走動', t.x, t.y - 24, '#8fd3ff'); }
  else if (act === 'hold') { sfx('button'); t.mode = 'hold'; t.guardSummoned = false; t.guardBase = null; t.anchor = { x: t.x, y: t.y }; t.target = null; flash('在原地巡邏', t.x, t.y - 24, '#8fd3ff'); }
  else if (act === 'goto') { sfx('button'); assigning = t; closeSentryMenu(); flash('點地圖指定巡邏位置（Esc 取消）', t.x, t.y - 24, '#ffd479'); return; }
  else if (act === 'talk') { openDialogue(t); return; }
  else if (act === 'soothe') { soothe(t); openSentryMenu(t, true); return; }   // soothe() 自帶音效；選單靜默重開、更新汙染數字
  closeSentryMenu();
}
window.addEventListener('keydown', e => {
  if (e.key === 'Escape') { assigning = null; closeSentryMenu(); closeGroundMenu(); closeBuildMenu(); }
});
// ---- 疏導哨兵（花嚮導能量降汙染、解暴走）----
function soothe(t) {
  if (t.taint <= 0 && !t.berserk) { sfx('error'); flash('無需疏導', t.x, t.y - 26, '#9aa4b2'); return; }
  if (G.guide < SOOTHE.cost) { sfx('error'); flash('嚮導能量不足', t.x, t.y - 26, '#ff8f8f'); return; }
  G.guide -= SOOTHE.cost; t.taint = Math.max(0, t.taint - SOOTHE.heal);
  if (t.berserk && t.taint < 60) t.berserk = false;
  sfx('soothe');
  spawnSootheEffect(t.x, t.y - 8, SOOTHE_COLORS.winter, t);   // 玩家溫特疏導：藍色，光環跟隨哨兵
  flash('疏導 -' + SOOTHE.heal, t.x, t.y - 26, '#7ee0c0'); updateHUD();
}
