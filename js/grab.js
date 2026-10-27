/* ===== 抓取隊友／NPC（右鍵按住）=====
   ・右鍵按住隊友（戰鬥區、基地都可以）或應變中心裡的 NPC：抓起來，拖到別的地方放開就掉下去
   ・快速點一下右鍵＝照舊打開隊員命令選單；按住超過 GRAB.holdTime 秒、或按著移動滑鼠才算抓
   ・抓著的時候：人物轉正面、跟著滑鼠左右晃；不能攻擊，怪物也不會打他（js/enemy-ai.js 的 enemyNoticesSentry、js/sentry.js 的 sentryDefense）
   ・拖的途中撞到牆或障礙物＝在撞到之前的位置掉下來；滑鼠移太快（超過 GRAB.maxSpeed）＝在原地掉下來（不會穿牆）
   ・放下後：
       戰鬥區的隊友＝在落地的地方巡邏（等於「在原地巡邏」）；掉在黑暗裡會自己走到最近的亮處，再在那裡巡邏
       基地裡的人＝在附近閒晃 GRAB.wanderTime 秒，再走回自己原本的區域
   ・倒下的隊友也抓得起來（可以拖到安全的地方再急救）
   ・溫特自己蓋的建築（地雷除外）也抓得起來：拖到新位置放開；太遠、太黑、放不下就回到原位（檔案下面「抓建築」那段）
   必須在 js/render.js（drawTower、drawWanderer）、js/game.js、js/channel-actions.js 之後載入。
*/
const GRAB = {
  holdTime: .18,     // 右鍵按住幾秒才算抓（比這短＝點一下，開命令選單）
  moveStart: 6,      // 按著右鍵移動超過幾像素（螢幕）也算抓
  lift: 18,          // 抓起來離地多高（像素）
  liftTime: .12,     // 抓起來要幾秒
  maxSpeed: 2000,    // 拖動速度上限（地圖像素／秒，一格 = CELL）：超過就在原地掉下來
  wanderTime: 5,     // 基地裡放下後在附近閒晃幾秒，再走回原本的區域
  wanderRadius: 70,  // 閒晃的範圍（像素）
  gravity: 1500,     // 掉下來的重力
  bounces: 0,        // 落地最多彈幾下
  bounce: .5,        // 每彈一下剩多少速度（越大彈越高）
  squash: .3,        // 落地壓扁最多幾成（.3＝高度少 30%、變寬）
  squashTime: .5,    // 壓扁→拉長→恢復要幾秒
  bodyR: 6,          // 拖動時撞牆判定的身體大小（像素，從腳底中心往外）：越小越不容易撞到；走路用的是 12
  menuCooldown: 1,   // 放下（或撞到東西掉下來）後，放開右鍵再過幾秒才會開命令選單
};
let grab = null;           // 抓著的：{ actor, dx, dy, lift, sway, swayV, vx }
let grabPress = null;      // 右鍵按下、還沒變成抓取：{ actor, cx, cy, t }
let grabRightAt = 0;       // 右鍵在遊戲畫面上按下的時間（游標要不要換成抓取手勢）
let grabMouse = null;      // 滑鼠最後的位置（螢幕座標）
let grabEatMenuUntil = 0;  // 剛放開抓取：這段時間內的右鍵選單不要開（冷卻）
let grabDroppedHeld = false;   // 撞到東西掉下來了，但右鍵還按著：放開時才開始算冷卻
const grabFalling = [];    // 正在掉下來的人

// 滑鼠底下可以抓的人：隊友（哪裡都可以）、NPC（只有基地裡）
function grabActorAt(x, y) {
  const list = [...G.towers, ...(MAP_SAFE ? G.npcs : [])].filter(a => !a.eatenBy && !a.grabFall && (!grab || grab.actor !== a));
  return list.sort((a, b) => b.y - a.y).find(a => Math.abs(a.x - x) <= 26 && y >= a.y - 48 && y <= a.y + 18) || null;
}
function grabCanStart() {
  return G && G.running && !G.over && G.player && !npcArrangeMode && !dialogueState && !(typeof graffitiPlace !== 'undefined' && graffitiPlace)
    && !(G.selType && (G.selType.startsWith('build:') || G.selType === 'demolish'));
}

function startGrab(actor, press) {
  const p = clientToWorld(press.cx, press.cy);
  if (typeof npcStandUp === 'function') npcStandUp(actor);
  actor.seatGoal = null; actor.npcPosed = false;
  if (typeof playerChannel !== 'undefined' && playerChannel && playerChannel.target === actor) cancelChannel();   // 正在疏導／急救他：中斷
  Object.assign(actor, { grabbed: true, target: null, navPath: null, navGoal: null, knockT: 0, waitT: 0, meleeSwing: null, gunSwing: null });
  if (typeof assigning !== 'undefined' && assigning === actor) assigning = null;
  closeSentryMenu(); closeGroundMenu();
  grab = { actor, dx: actor.x - p.x, dy: actor.y - p.y, lift: 0, sway: 0, swayV: 0, vx: 0 };
  grabPress = null;
  faceNpcFront(actor);
  sfx('blip');
}
function dropGrab(reason) {
  if (!grab) return;
  const g = grab, a = g.actor;
  grab = null; a.grabbed = false;
  a.grabFall = { h: g.lift, v: 0, sway: g.sway, swayV: g.swayV, dx: g.dx, dy: g.dy, bounced: false };
  grabFalling.push(a);
  grabEatMenuUntil = performance.now() + GRAB.menuCooldown * 1000;
  if (grabRightAt > 0) grabDroppedHeld = true;
  if (reason === 'wall') flash('撞到了！', a.x, a.y - 52, '#ffd479', .9);
  else if (reason === 'fast') flash('太快了！', a.x, a.y - 52, '#ffd479', .9);
}
// 落地：決定之後要做什麼
function landGrab(a) {
  a.grabFall = null;
  a.target = null; a.navPath = null; a.navGoal = null; a.waitT = .5; a.moving = false;
  if (MAP_SAFE) { a.grabWanderT = GRAB.wanderTime; return; }   // 基地：在附近閒晃一下再回去
  if (!G.towers.includes(a)) return;
  Object.assign(a, { mode: 'hold', anchor: { x: a.x, y: a.y }, guardSummoned: false, guardBase: null, summonDark: false, darkResumeTarget: null });
  a.grabDark = typeof personnelInLight === 'function' && !personnelInLight(a.x, a.y);   // 掉在黑暗裡：走到亮處後改在那裡巡邏
  if (a.hp > 0 && !a.berserk) sentryStatus(a, '在這裡巡邏');
}
function grabLandFx(a, big, v = 0) {
  a.grabSquash = { t: 0, amp: Math.min(GRAB.squash, .06 + v * .0005) };   // 落地壓扁：撞得越用力扁越多
  G.effects.push({ ring: true, x: a.x, y: a.y + 14, r: 4, r2: big ? 22 : 12, life: .25, life0: .25, color: '#d8dee6' });
  if (typeof sfxAt === 'function') sfxAt('place', a.x, a.y, big ? .45 : .2);
}

// 拖動時的撞牆判定：跟走路（sentryBlocked）一樣，但身體算小一點（GRAB.bodyR），靠牆站的人才抓得起來
function grabBlocked(x, y) {
  const r = GRAB.bodyR;
  for (const [sx, sy] of [[-r, -r], [r, -r], [-r, r], [r, r]]) {
    const px = x + sx, py = y + sy, [c, rr] = cellAt(px, py);
    if (!inGrid(c, rr) || G.grid[c + ',' + rr] || solidBlocksPoint(px, py)) return true;
  }
  return false;
}
// 拖動：一小段一小段檢查有沒有撞到東西
function moveGrab(dt) {
  const g = grab, a = g.actor;
  g.lift = Math.min(GRAB.lift, g.lift + GRAB.lift * dt / GRAB.liftTime);
  faceNpcFront(a);
  if (grabMouse) {
    const p = clientToWorld(grabMouse.x, grabMouse.y);
    const tx = p.x + g.dx, ty = p.y + g.dy, dist = Math.hypot(tx - a.x, ty - a.y);
    if (dist > GRAB.maxSpeed * Math.max(dt, 1 / 60)) { dropGrab('fast'); return; }
    const startBlocked = grabBlocked(a.x, a.y);   // 原本就有點卡在東西裡：先讓他出來
    const steps = Math.max(1, Math.ceil(dist / 4));
    let lx = a.x, ly = a.y, hit = false;
    for (let i = 1; i <= steps; i++) {
      const px = a.x + (tx - a.x) * i / steps, py = a.y + (ty - a.y) * i / steps;
      if (!startBlocked && grabBlocked(px, py)) { hit = true; break; }
      lx = px; ly = py;
    }
    const vx = (lx - a.x) / Math.max(dt, 1e-3);
    a.x = lx; a.y = ly;
    g.vx += (vx - g.vx) * Math.min(1, dt * 12);
    if (hit) { dropGrab('wall'); return; }
  }
  // 晃動：往右拖身體往左甩，像吊著的鐘擺
  const want = Math.max(-.5, Math.min(.5, -g.vx * .0012));
  g.swayV += ((want - g.sway) * 60 - g.swayV * 6) * dt;
  g.sway += g.swayV * dt;
}
function stepGrabFalls(dt) {
  for (let i = grabFalling.length - 1; i >= 0; i--) {
    const a = grabFalling[i], f = a.grabFall;
    if (!f || !G.towers.concat(G.npcs).includes(a)) { a.grabFall = null; grabFalling.splice(i, 1); continue; }
    faceNpcFront(a);
    f.v += GRAB.gravity * dt; f.h -= f.v * dt;
    f.swayV += (-f.sway * 60 - f.swayV * 6) * dt; f.sway += f.swayV * dt;
    if (f.h > 0) continue;
    f.bounced = (f.bounced | 0);
    if (f.bounced < GRAB.bounces && f.v > 100) { grabLandFx(a, f.bounced === 0, f.v); f.bounced++; f.h = 0; f.v = -f.v * GRAB.bounce; continue; }   // 彈一下
    if (!f.bounced) grabLandFx(a, true, f.v);
    else if (f.v > 60) a.grabSquash = { t: 0, amp: Math.min(GRAB.squash, .04 + f.v * .0005) };   // 最後輕輕落地：小小壓一下
    grabFalling.splice(i, 1); landGrab(a);
  }
}
// 放下之後：黑暗裡走出來的隊友改在亮處巡邏；基地裡的人在附近閒晃
function stepGrabAfter(dt) {
  for (const a of G.towers.concat(G.npcs)) {
    if (a.grabSquash && (a.grabSquash.t += dt) >= GRAB.squashTime) a.grabSquash = null;
    if (a.grabDark && !a.grabbed && !a.grabFall) {
      if (MAP_SAFE || a.mode !== 'hold') a.grabDark = false;
      else if (!personnelInLight(a.x, a.y)) a.grabLitT = 0;
      else if ((a.grabLitT = (a.grabLitT || 0) + dt) >= .5) { a.anchor = { x: a.x, y: a.y }; a.grabDark = false; a.grabLitT = 0; }   // 在亮處待穩了（燈會閃）才改在這裡巡邏
    }
    if (a.grabWanderT > 0) {
      a.grabWanderT -= dt;
      if (!MAP_SAFE || a.sitting || a.seatGoal) a.grabWanderT = 0;
      else if (!a.target && !(a.waitT > 0)) a.target = sampleWanderTarget(a.x, a.y, GRAB.wanderRadius);
    }
  }
}

// 每幀（js/game.js 的 frame 呼叫）；paused＝選單開著、對話中、換地圖…
function updateGrab(dt, paused) {
  if (!G || !G.towers) return;
  const now = performance.now();
  cv.classList.toggle('grab-holding', !!grab || !!grabB || (grabRightAt > 0 && now - grabRightAt >= GRAB.holdTime * 1000));
  if (paused || !G.running || G.over) { if (grab) dropGrab(); if (grabB) dropGrabBuilding(true); grabPress = null; return; }
  stepGrabFalls(dt);
  stepGrabAfter(dt);
  if (grabPress && !grab) {
    const a = grabPress.actor, moved = grabMouse ? Math.hypot(grabMouse.x - grabPress.cx, grabMouse.y - grabPress.cy) : 0;
    if (!grabCanStart() || (a.kind === 'obstacle' ? !grabbableBuilding(a) || !G.obstacles.includes(a) : a.eatenBy || a.grabFall || !G.towers.concat(MAP_SAFE ? G.npcs : []).includes(a))) grabPress = null;
    else if (now - grabPress.t >= GRAB.holdTime * 1000 || moved > GRAB.moveStart) a.kind === 'obstacle' ? startGrabBuilding(a, grabPress) : startGrab(a, grabPress);
  }
  if (grab) moveGrab(dt);
  if (grabB) moveGrabBuilding(dt);
}

// ---- 抓建築：溫特自己蓋的障礙物（地雷除外）右鍵按住拿起來，拖到新位置放開 ----
// 拿起來的時候建築先從地圖上拿掉（不擋路、怪物打不到）；放下的規則跟蓋建築一樣（太遠、太黑、放不下＝回到原位）
let grabB = null;   // 抓著的建築：{ o, G, from: [c, r], dx, dy, x, y, lift, sway, swayV, vx }（x, y＝圖片左上角）
const grabbableBuilding = o => !!o && o.playerBuilt && !o.trap && o.hp > 0;
function grabBuildingAt(x, y) {
  return G.obstacles.filter(grabbableBuilding).sort((a, b) => (b.r + (b.h || 1)) - (a.r + (a.h || 1))).find(o => {
    const x0 = OX + o.c * CELL, y0 = OY + o.r * CELL;
    return x >= x0 && x < x0 + (o.w || 1) * CELL && y >= y0 && y < y0 + (o.h || 1) * CELL;
  }) || null;
}
function grabBuildingRepath() {
  for (const t of G.towers) { t.navPath = null; t.navGoal = null; t.navTimer = 0; }
  for (const e of G.enemies) { e.aiPath = null; e.aiGoal = null; e.aiRouteTimer = 0; }
  computeFlow();
}
function startGrabBuilding(o, press) {
  const p = clientToWorld(press.cx, press.cy), x = OX + o.c * CELL, y = OY + o.r * CELL;
  grabB = { o, G, from: [o.c, o.r], dx: x - p.x, dy: y - p.y, x, y, lift: 0, sway: 0, swayV: 0, vx: 0 };
  grabPress = null;
  for (const [dc, dr] of obstacleSolidCells(o)) { const k = (o.c + dc) + ',' + (o.r + dr); if (G.grid[k] === o) delete G.grid[k]; }
  G.obstacles = G.obstacles.filter(x => x !== o);
  closeSentryMenu(); closeGroundMenu();
  grabBuildingRepath();
  sfx('blip');
}
// 放下的格子：圖片左上角最靠近的那格
const grabBuildingCell = g => [Math.round((g.x - OX) / CELL), Math.round((g.y - OY) / CELL)];
// 能不能放在 (c, r)：可以就回傳 ''，不行就回傳原因（跟 js/build.js 的 placeObstacle 一樣的規則，只是不用錢）
function grabBuildingProblem(o, c, r) {
  const v = { w: o.w || 1, h: o.h || 1, solid: obstacleSolidCells(o) }, extra = placeExtra({ id: o.type });
  if (!buildInRange(v, c, r)) return '太遠了';
  if (!footprintNearLight(v, c, r, extra)) return '太黑了';
  if (!canPlaceObstacle(v, c, r, extra)) return '不能放這裡';
  if (!v.solid.length && sameBuildingOverlaps(o.type, v, c, r)) return '已經有' + (buildableById(o.type)?.name || '同樣的建築') + '了';
  return '';
}
function moveGrabBuilding(dt) {
  const g = grabB;
  g.lift = Math.min(GRAB.lift, g.lift + GRAB.lift * dt / GRAB.liftTime);
  if (grabMouse) {
    const p = clientToWorld(grabMouse.x, grabMouse.y), nx = p.x + g.dx;
    g.vx += ((nx - g.x) / Math.max(dt, 1e-3) - g.vx) * Math.min(1, dt * 12);
    g.x = nx; g.y = p.y + g.dy;
  }
  const want = Math.max(-.25, Math.min(.25, -g.vx * .0006));   // 建築比人重：晃得小一點
  g.swayV += ((want - g.sway) * 60 - g.swayV * 6) * dt;
  g.sway += g.swayV * dt;
}
// 放下：cancel＝直接放回原位（選單打開、切出視窗…）
function dropGrabBuilding(cancel = false) {
  const g = grabB; if (!g) return;
  grabB = null;
  grabEatMenuUntil = performance.now() + GRAB.menuCooldown * 1000;
  if (grabRightAt > 0) grabDroppedHeld = true;
  if (g.G !== G) return;   // 已經換地圖了
  const o = g.o;
  let [c, r] = grabBuildingCell(g);
  const problem = cancel ? 'cancel' : grabBuildingProblem(o, c, r);
  if (problem) { if (!cancel && (c !== g.from[0] || r !== g.from[1])) buildFail(problem, c, r); [c, r] = g.from; }
  o.c = c; o.r = r;
  for (const [dc, dr] of obstacleSolidCells(o)) G.grid[(c + dc) + ',' + (r + dr)] = o;
  G.obstacles.push(o);
  o.spawnT = DROP.fall * .85;   // 從手上的高度掉下來：落地壓扁＋塵埃（js/build.js 的 dropAnim）
  grabBuildingRepath();
  if (typeof rememberStoryBuilds === 'function') rememberStoryBuilds();
  if (!problem) sfx(LIGHT.buildings && LIGHT.buildings[o.type] ? 'placeLight' : 'place');
}
// 畫：抓著的建築跟著滑鼠、離地晃（跟其他東西一起排前後；js/render.js 呼叫）
function grabBuildingSortables(list) {
  const g = grabB; if (!g || g.G !== G) return;
  const o = g.o, w = (o.w || 1) * CELL, h = (o.h || 1) * CELL;
  list.push({ y: g.y - OY + h + 1, draw: () => {
    ctx.fillStyle = 'rgba(0,0,0,.25)';
    ctx.beginPath(); ctx.ellipse(g.x + w / 2, g.y + h - 4, w * .42, Math.max(4, h * .08), 0, 0, Math.PI * 2); ctx.fill();
    ctx.save();
    const px = g.x + w / 2, py = g.y - g.lift;   // 以上緣中間（手抓的地方）為軸晃
    ctx.translate(px, py); ctx.rotate(g.sway + Math.sin(performance.now() / 1000 * 3.2) * .03); ctx.translate(-px, -py);
    ctx.translate(g.x - (OX + o.c * CELL), g.y - g.lift - (OY + o.r * CELL));
    drawObstacle(o);
    ctx.restore();
  } });
}
// 放下去的位置：虛線框（藍＝可以放、紅＝放不下會回原位），加上能蓋的範圍圈。畫在黑幕上面，暗處也看得到
function drawGrabBuildingTarget(ctx) {
  const g = grabB; if (!g || g.G !== G) return;
  const o = g.o, [c, r] = grabBuildingCell(g), ok = !grabBuildingProblem(o, c, r);
  const x = OX + c * CELL, y = OY + r * CELL, w = (o.w || 1) * CELL, h = (o.h || 1) * CELL;
  ctx.save();
  ctx.strokeStyle = ok ? '#8fd3ff' : '#ff5b5b'; ctx.lineWidth = 2; ctx.setLineDash([6, 4]);
  ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
  ctx.fillStyle = ok ? 'rgba(80,210,150,.28)' : 'rgba(255,80,80,.3)';
  for (const [dc, dr] of placeCheckCells({ w: o.w || 1, h: o.h || 1, solid: obstacleSolidCells(o) })) ctx.fillRect(x + dc * CELL, y + dr * CELL, CELL, CELL);
  if (G.player && typeof BUILD_RANGE !== 'undefined') {
    ctx.beginPath(); ctx.arc(G.player.x, G.player.y, BUILD_RANGE * CELL, 0, Math.PI * 2);
    ctx.lineWidth = 1.3; ctx.strokeStyle = 'rgba(143,211,255,.9)'; ctx.setLineDash([10, 6]); ctx.stroke();
  }
  ctx.restore();
}

// ---- 滑鼠 ----
cv.addEventListener('mousedown', e => {
  if (e.button !== 2) return;
  grabMouse = { x: e.clientX, y: e.clientY }; grabRightAt = performance.now();
  if (grab || grabB || !grabCanStart()) return;
  const p = clientToWorld(e.clientX, e.clientY), actor = grabActorAt(p.x, p.y) || grabBuildingAt(p.x, p.y);   // 人優先，再來是建築
  grabPress = actor ? { actor, cx: e.clientX, cy: e.clientY, t: performance.now() } : null;
}, true);
window.addEventListener('mousemove', e => { grabMouse = { x: e.clientX, y: e.clientY }; });
window.addEventListener('mouseup', e => {
  if (e.button !== 2) return;
  grabRightAt = 0; grabPress = null;
  if (grab) dropGrab();
  if (grabB) dropGrabBuilding();
  if (grabDroppedHeld || performance.now() < grabEatMenuUntil) grabEatMenuUntil = performance.now() + GRAB.menuCooldown * 1000;   // 從放開右鍵算起
  grabDroppedHeld = false;
});
// 剛放開抓取：GRAB.menuCooldown 秒內不要開命令選單（Windows 的右鍵選單是放開時才跳）
cv.addEventListener('contextmenu', e => {
  if (!grab && !grabB && !grabDroppedHeld && performance.now() > grabEatMenuUntil) return;
  e.preventDefault(); e.stopImmediatePropagation();
}, true);
window.addEventListener('blur', () => { grabRightAt = 0; grabPress = null; if (grab) dropGrab(); if (grabB) dropGrabBuilding(true); });

// ---- 畫：抓著／掉下來的人離地、跟著手晃，地上留影子 ----
function grabDrawWrap(a, draw) {
  const g = grab && grab.actor === a ? grab : a.grabFall, sq = a.grabSquash;
  if (!g && !sq) { draw(); return; }
  ctx.save();
  // 壓扁／拉長：以腳底為中心縮放（落地先扁、再彈成瘦長、慢慢恢復；往下掉的時候稍微拉長）
  let sy = 1;
  if (sq) { const u = sq.t; sy -= sq.amp * Math.exp(-u * 7) * Math.cos(u * 20); }
  if (g && g !== grab && g.v > 0) sy += Math.min(.12, g.v * .00012);
  if (sy !== 1) { const fy = a.y + 16; ctx.translate(a.x, fy); ctx.scale(1 + (1 - sy) * .8, sy); ctx.translate(-a.x, -fy); }
  if (!g) { draw(); ctx.restore(); return; }
  const h = Math.max(0, g === grab ? g.lift : g.h);
  ctx.fillStyle = 'rgba(0,0,0,' + Math.max(.12, .3 - h * .006).toFixed(3) + ')';
  ctx.beginPath(); ctx.ellipse(a.x, a.y + 15, Math.max(8, 15 - h * .2), Math.max(3, 5 - h * .06), 0, 0, Math.PI * 2); ctx.fill();
  const px = a.x - g.dx, py = a.y - g.dy - h;   // 手抓的那一點（以這裡為軸晃）
  const ang = g.sway + (g === grab ? Math.sin(performance.now() / 1000 * 3.2) * .06 : 0);   // 抓著時一直輕輕晃
  ctx.translate(px, py); ctx.rotate(ang); ctx.translate(-px, -py); ctx.translate(0, -h);
  draw();
  ctx.restore();
}
const grabBaseDrawTower = drawTower, grabBaseDrawWanderer = drawWanderer;
drawTower = t => grabDrawWrap(t, () => grabBaseDrawTower(t));
drawWanderer = npc => grabDrawWrap(npc, () => grabBaseDrawWanderer(npc));
