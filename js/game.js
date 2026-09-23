/* ===== 台北地下災害應變中心 — 塔防主邏輯 =====
   遊戲核心：遊戲狀態、波次、怪物、玩家操作、主迴圈、畫面繪製、HUD、勝負判定。
   其他系統拆在獨立檔案：
   - js/lighting.js  黑暗與光源（格子擴散光）
   - js/build.js     建築系統（放置判定/選單/動畫）
   - js/sentry.js    哨兵系統（巡邏AI/點擊選單/疏導）
   數值在 data/balance.js；格線在 js/config.js；尋路在 js/pathfinding.js。
*/
const cv = document.getElementById('cv');
const ctx = cv.getContext('2d');

// ---- 地板 ----
// 不再自動鋪滿地板貼圖：沒鋪素材的格子就是黑的（地板請在地圖編輯器裡鋪）

// ---- 玩家角色（嚮導本人，可用 WASD／方向鍵操縱）----
const PLAYER = { speed: 230, r: 14, drawSize: 64 };   // 移動速度、碰撞半徑、角色圖尺寸
const PLAYER_CHARACTER = 'winter';
const PLAYER_OUTFIT = 'B';
// ---- 角色精靈圖（玩家與哨兵共用）----
// 資料夾 images/character/<角色>_<服裝>/，檔名 <角色><服裝>_0000_Front.png …
const CHARACTER_SPRITE_FILES = {
  front: ['0000_Front.png', '0001_Front-Walking01.png', '0002_Front-Walking02.png'],
  back:  ['0009_back.png', '0010_back-walking01.png', '0011_back-walking02.png'],
  left:  ['0003_Leftside.png', '0004_Leftside-walking01.png', '0005_Leftside-walking02.png'],
  right: ['0006_right-side.png', '0007_right-side-walking01.png', '0008_right-side-walking02.png'],
  // 正面待機眨眼：半閉眼 → 閉眼 → 全閉，再倒放回張眼。
  blink: ['0014_closeeyes01.png', '0013_closeeyes02.png', '0012_closeeyes03.png'],
};
function loadCharacterSprites(folder) {   // folder 例如 'winter_B'
  const prefix = folder.replace('_', '') + '_';
  const set = {};
  for (const k of Object.keys(CHARACTER_SPRITE_FILES)) {
    set[k] = CHARACTER_SPRITE_FILES[k].map(file => {
      const img = new Image(); img.src = `images/character/${folder}/${prefix}${file}`; return img;
    });
  }
  return set;
}
const playerSprites = loadCharacterSprites(`${PLAYER_CHARACTER}_${PLAYER_OUTFIT}`);
const sentrySprites = {};   // 哨兵類型 → 精靈圖（data/balance.js 的 TYPES 有填 sprite 才有）
for (const type of Object.keys(TYPES)) if (TYPES[type].sprite) sentrySprites[type] = loadCharacterSprites(TYPES[type].sprite);
const wandererSprites = {};
for (const profile of WANDERERS) wandererSprites[profile.id] = loadCharacterSprites(profile.sprite);
const monsterSlimeSprite = new Image();
monsterSlimeSprite.src = 'images/monster/Monster_Slime.png';

// ---- NPC 正式對話（靠近後按 Space／E）----
const dialogueBox = document.getElementById('dialogueBox');
const dialoguePortrait = document.getElementById('dialoguePortrait');
const dialogueName = document.getElementById('dialogueName');
const dialogueProgress = document.getElementById('dialogueProgress');
const dialogueText = document.getElementById('dialogueText');
const dialogueNext = document.getElementById('dialogueNext');
let dialogueState = null;
let dialogueTypeTimer = null;

function dialogueKey(actor) { return actor.kind === 'tower' ? actor.type : actor.id; }
function dialogueProfile(actor) {
  return actor.kind === 'tower' ? TYPES[actor.type] : WANDERERS.find(profile => profile.id === actor.id);
}
function dialogueNearPlayer() {
  const p = G && G.player; if (!p || p.sitting) return null;
  let best = null, bestDistance = NPC_TALK.radius;
  const actors = [...(G.npcs || []), ...(G.towers || [])];
  for (const actor of actors) {
    if (actor.berserk) continue;
    const distance = Math.hypot(actor.x - p.x, actor.y - p.y);
    if (distance < bestDistance) { best = actor; bestDistance = distance; }
  }
  return best;
}
function faceEachOther(actor) {
  const p = G.player, dx = actor.x - p.x, dy = actor.y - p.y;
  if (Math.abs(dx) >= Math.abs(dy)) { p.dir = dx < 0 ? 'left' : 'right'; actor.dir = dx < 0 ? 'right' : 'left'; }
  else { p.dir = dy < 0 ? 'back' : 'front'; actor.dir = dy < 0 ? 'front' : 'back'; }
  p.moving = false; p.anim = 0; actor.moving = false; actor.anim = 0;
}
function renderDialogueLine() {
  if (!dialogueState) return;
  const { actor, lines, index } = dialogueState, profile = dialogueProfile(actor) || { name: '？？？' };
  const line = lines[index], text = typeof line === 'string' ? line : line.text;
  dialogueName.textContent = typeof line === 'object' && line.speaker ? line.speaker : profile.name;
  dialogueProgress.textContent = (index + 1) + ' / ' + lines.length;
  dialogueText.classList.remove('line-in'); void dialogueText.offsetWidth; dialogueText.classList.add('line-in');
  startDialogueTyping(text || '……');
}
function setDialogueNextLabel(label) {
  dialogueNext.lastChild.textContent = ' ' + label;
}
function clearDialogueTypeTimer() {
  if (dialogueTypeTimer != null) clearTimeout(dialogueTypeTimer);
  dialogueTypeTimer = null;
}
function finishDialogueTyping() {
  if (!dialogueState || !dialogueState.typing) return false;
  clearDialogueTypeTimer();
  dialogueState.typing = false;
  dialogueText.textContent = dialogueState.fullText;
  dialogueText.classList.remove('typing');
  setDialogueNextLabel(dialogueState.index >= dialogueState.lines.length - 1 ? '結束' : '下一句');
  return true;
}
function startDialogueTyping(text) {
  clearDialogueTypeTimer();
  const chars = Array.from(text), speed = Math.max(5, Number(NPC_TALK.typeSpeed) || 24);
  dialogueState.fullText = text; dialogueState.typing = true;
  dialogueText.textContent = ''; dialogueText.classList.add('typing'); setDialogueNextLabel('快速顯示');
  let index = 0;
  const typeNext = () => {
    if (!dialogueState || !dialogueState.typing) return;
    dialogueText.textContent += chars[index++] || '';
    if (index >= chars.length) { finishDialogueTyping(); return; }
    dialogueTypeTimer = setTimeout(typeNext, speed);
  };
  typeNext();
}
function openDialogue(actor) {
  if (!actor || dialogueState) return;
  if (actor.berserk) { flash('污染失控，現在無法對話', actor.x, actor.y - 32, '#ff8f8f'); sfx('error'); return; }
  const key = dialogueKey(actor), profile = dialogueProfile(actor);
  const lines = chapterPick(actor.kind === 'tower' ? SENTRY_DIALOGUES[key] : NPC_DIALOGUES[key]) || chapterPick(WANDER_LINES[key]) || ['……'];
  dialogueState = { actor, lines, index: 0 };
  actor.target = null; actor.say = null; actor.sayWait = 2;
  MOVE_KEYS.forEach(key => { keys[key] = false; });
  faceEachOther(actor);
  closeSentryMenu(); closeGroundMenu(); closeBuildMenu();
  const set = actor.kind === 'tower' ? sentrySprites[actor.type] : wandererSprites[actor.id];
  const portrait = set && set.front && set.front[0];
  dialoguePortrait.src = portrait ? portrait.src : '';
  dialoguePortrait.alt = profile ? profile.name : 'NPC';
  dialogueBox.classList.remove('hidden');
  renderDialogueLine(); sfx('menu');
}
function advanceDialogue() {
  if (!dialogueState) return;
  if (finishDialogueTyping()) { sfx('blip'); return; }
  if (dialogueState.index >= dialogueState.lines.length - 1) { closeDialogue(); return; }
  dialogueState.index++; renderDialogueLine(); sfx('blip');
}
function closeDialogue(silent = false) {
  clearDialogueTypeTimer();
  if (!dialogueState) { dialogueBox.classList.add('hidden'); return; }
  const actor = dialogueState.actor;
  if (actor) actor.waitT = 0.6;
  dialogueState = null; dialogueText.classList.remove('typing'); dialogueBox.classList.add('hidden');
  if (!silent) sfx('switch');
}
dialogueNext.addEventListener('click', advanceDialogue);
document.getElementById('dialogueClose').addEventListener('click', () => closeDialogue());

// 站著不動時的眨眼計時（玩家與哨兵共用）
function updateBlink(who, dt) {
  if (who.dir !== 'front') { who.blinkTime = -1; return; }
  if (who.blinkTime >= 0) {
    who.blinkTime += dt;
    if (who.blinkTime >= 0.42) { who.blinkTime = -1; who.blinkWait = 2 + Math.random() * 4; }
  } else {
    who.blinkWait = (who.blinkWait ?? 2 + Math.random() * 3) - dt;
    if (who.blinkWait <= 0) who.blinkTime = 0;
  }
}
// 依朝向／走路／眨眼狀態挑出這一幀要畫的圖
function pickCharacterFrame(set, who) {
  if (!who.moving && who.dir === 'front' && who.blinkTime >= 0) {
    const blinkOrder = [0, 1, 2, 2, 1, 0];
    return set.blink[blinkOrder[Math.min(blinkOrder.length - 1, Math.floor(who.blinkTime / 0.07))]];
  }
  const frames = set[who.dir || 'front'];
  const walkOrder = [1, 0, 2, 0];
  return frames && frames[who.moving ? walkOrder[Math.floor(who.anim * 8) % walkOrder.length] : 0];
}
// 哨兵走路動畫：用這一幀實際移動的距離決定朝向與是否在走
function animateSentry(t, mx, my, dt) {
  t.moving = Math.hypot(mx, my) > 0.01;
  if (!t.moving) { t.anim = 0; t.dir = t.dir || 'front'; updateBlink(t, dt); return; }
  t.blinkTime = -1;
  t.dir = Math.abs(mx) >= Math.abs(my) ? (mx < 0 ? 'left' : 'right') : (my < 0 ? 'back' : 'front');
  t.anim = (t.anim || 0) + dt;
}
const keys = {};                         // 目前按住的按鍵
const MOVE_KEYS = ['w', 'a', 's', 'd', 'arrowup', 'arrowleft', 'arrowdown', 'arrowright'];
const anyMoveKey = () => MOVE_KEYS.some(k => keys[k]);
window.addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if (dialogueState) {
    if (k.startsWith('arrow') || k === ' ' || k === 'enter') e.preventDefault();
    if (!e.repeat && (isInteractKey(k) || k === 'enter')) advanceDialogue();
    else if (!e.repeat && k === 'escape') closeDialogue();
    return;
  }
  keys[k] = true;
  if (k.startsWith('arrow') || k === ' ') e.preventDefault();   // 方向鍵／空白鍵不要捲動網頁
  if (isInteractKey(k) && G && G.running && !G.over) {          // 互動鍵：空白鍵 或 E
    const near = (G.player && !G.player.sitting) ? portalNearPlayer() : null;
    if (near) enterPortal(near.portal);   // 靠近出入口→進入另一張地圖
    else {
      const npc = dialogueNearPlayer();
      if (npc) openDialogue(npc);
      else toggleSit();                   // 附近沒有 NPC 才判定座位
    }
  }
});
const isInteractKey = k => k === ' ' || k === SIT.key;   // 空白鍵為主，E 也可觸發
// ---- 出入口（走到門旁按 E 進入另一張地圖）----
const PORTAL_RADIUS = 52;   // 離門多近才會出現提示（像素）
function portalNearPlayer() {
  const p = G.player; if (!p || typeof mapPortals === 'undefined') return null;
  let best = null, bd = PORTAL_RADIUS;
  for (const pt of mapPortals) {
    const [x, y] = center(pt.c, pt.r), d = Math.hypot(x - p.x, y - p.y);
    if (d < bd) { bd = d; best = { portal: pt, x, y }; }
  }
  return best;
}
function portalTargetName(pt) { const i = mapIndexById(pt.to), list = mapList(); return (i >= 0 && list[i] && list[i].name) || '另一張地圖'; }
function enterPortal(pt) {
  if (mapIndexById(pt.to) < 0) { flash('目標地圖不存在（可能已被刪除）', G.player.x, G.player.y - 30, '#ff8f8f'); return; }
  const fromId = MAP.id;
  sfx('switch');
  switchMap(mapIndexById(pt.to));           // 換地圖＋重算尺寸/路徑
  begin();                                  // 重建並進入遊玩狀態
  const back = returnPortalCell(fromId);    // 落在新地圖「通回原地圖」的門旁
  if (back && G.player) { const [x, y] = center(back.c, back.r); G.player.x = x; G.player.y = y; }
  updateCamera(); draw();
}
window.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });

// ---- 滑鼠所在格（建築放置預覽用）----
let hoverCell = null;
function spawnGroundRipple(clientX, clientY) {
  const wrap = document.getElementById('wrap'), rect = wrap.getBoundingClientRect();
  const ripple = document.createElement('span'); ripple.className = 'ground-ripple';
  ripple.style.left = (clientX - rect.left) + 'px'; ripple.style.top = (clientY - rect.top) + 'px';
  ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
  wrap.appendChild(ripple);
}

// ---- 地面情境選單：指定格子建築／召喚哨兵 ----
const groundMenu = document.getElementById('groundMenu');
let groundTarget = null;
function closeGroundMenu() {
  groundTarget = null;
  groundMenu.classList.add('hidden');
}
function positionGroundMenu(clientX, clientY) {
  const wrapRect = document.getElementById('wrap').getBoundingClientRect();
  const menuW = 178, menuH = 260;
  const left = Math.max(8, Math.min(clientX - wrapRect.left + 10, wrapRect.width - menuW - 8));
  const top = Math.max(8, Math.min(clientY - wrapRect.top + 10, wrapRect.height - menuH - 8));
  groundMenu.style.left = Math.round(left) + 'px';
  groundMenu.style.top = Math.round(top) + 'px';
}
function addGroundCloseButton() {
  const close = document.createElement('button');
  close.type = 'button'; close.className = 'gm-close'; close.textContent = '×'; close.title = '關閉';
  close.setAttribute('aria-label', '關閉選單');
  close.addEventListener('click', () => { sfx('switch'); closeGroundMenu(); });
  groundMenu.appendChild(close);
}
function assignSentryToGround(t) {
  if (!groundTarget) return;
  const { c, r } = groundTarget, [x, y] = center(c, r);
  if (t.berserk) { sfx('error'); flash(TYPES[t.type].name + '正在暴走，無法指派', x, y, '#ff8f8f'); return; }
  if (!isLit(x, y)) { sfx('error'); flash('巡邏點必須在亮處', x, y, '#ffd24a'); return; }
  if (isWall(c, r) || isEntrance(c, r) || G.grid[c + ',' + r]) { sfx('error'); flash('這裡不能巡邏', x, y, '#ff8f8f'); return; }
  t.mode = 'goto'; t.target = { x, y }; t.anchor = null; t.waitT = 0; t.navPath = null; t.navGoal = null;
  sfx('button'); flash(TYPES[t.type].name + '：前往巡邏點', t.x, t.y - 24, '#8fd3ff');
  closeGroundMenu();
}
function renderGroundActions() {
  if (!groundTarget) return;
  const { c, r } = groundTarget;
  groundMenu.innerHTML = '';
  addGroundCloseButton();
  const build = document.createElement('button');
  build.textContent = '🏗️ 建築';
  build.addEventListener('click', () => {
    buildTargetCell = [c, r]; G.selType = null;
    renderBuildBar(); buildBar.classList.remove('hidden'); updateBuildToggle();
    sfx('menu'); closeGroundMenu();
  });
  const patrol = document.createElement('button');
  patrol.textContent = '📣 召喚哨兵';
  patrol.addEventListener('click', renderGroundSentryChoices);
  groundMenu.append(build, patrol);
}
function playerBuildingAt(c, r) {
  return [...G.obstacles].reverse().find(o =>
    o.playerBuilt && c >= o.c && r >= o.r && c < o.c + (o.w || 1) && r < o.r + (o.h || 1)
  ) || null;
}
function renderBuildingActions(o) {
  if (!groundTarget || !o || !G.obstacles.includes(o)) { closeGroundMenu(); return; }
  const data = typeof buildableById === 'function' ? buildableById(o.type) : null;
  groundMenu.innerHTML = '<div class="gm-title">' + (data?.name || '建築') + '</div>';
  addGroundCloseButton();
  const demolish = document.createElement('button');
  demolish.className = 'gm-demolish';
  demolish.textContent = '🔨 拆除';
  demolish.addEventListener('click', () => {
    if (!o.playerBuilt || !G.obstacles.includes(o)) { closeGroundMenu(); return; }
    const [fx, fy] = center(o.c + ((o.w || 1) - 1) / 2, o.r + ((o.h || 1) - 1) / 2);
    removeBarrier(o);
    for (const t of G.towers) { t.navPath = null; t.navGoal = null; t.navTimer = 0; }
    for (const enemy of G.enemies) { enemy.aiPath = null; enemy.aiGoal = null; enemy.aiRouteTimer = 0; }
    computeFlow();
    sfx('hit'); flash('已拆除', fx, fy - 20, '#ffd479');
    closeGroundMenu(); updateHUD();
  });
  groundMenu.appendChild(demolish);
}
function openBuildingMenu(o, c, r, clientX, clientY) {
  closeBuildMenu(); closeSentryMenu();
  groundTarget = { c, r, obstacle: o };
  renderBuildingActions(o); positionGroundMenu(clientX, clientY);
  groundMenu.classList.remove('hidden');
  groundMenu.style.animation = 'none'; void groundMenu.offsetWidth; groundMenu.style.animation = '';
  sfx('menu');
}
function renderGroundSentryChoices() {
  if (!groundTarget) return;
  groundMenu.innerHTML = '<div class="gm-title">選擇要召喚的哨兵</div>';
  addGroundCloseButton();
  for (const t of G.towers) {
    const b = document.createElement('button');
    b.innerHTML = '🎯 ' + TYPES[t.type].name + '<small>' + (t.berserk ? '暴走中，暫時無法指派' : '汙染 ' + Math.round(t.taint)) + '</small>';
    b.disabled = !!t.berserk;
    b.addEventListener('click', () => assignSentryToGround(t));
    groundMenu.appendChild(b);
  }
  const back = document.createElement('button'); back.textContent = '← 返回';
  back.addEventListener('click', renderGroundActions); groundMenu.appendChild(back);
}
function openGroundMenu(c, r, clientX, clientY) {
  closeBuildMenu();
  groundTarget = { c, r };
  closeSentryMenu();
  renderGroundActions(); positionGroundMenu(clientX, clientY);
  groundMenu.classList.remove('hidden');
  // 彈窗已開著時換位置，也強制重新播放展開動畫。
  groundMenu.style.animation = 'none'; void groundMenu.offsetWidth; groundMenu.style.animation = '';
  sfx('menu');
}

// ---- 鏡頭（相框位置）：跟著玩家，碰到地圖邊緣就停 ----
let cam = { x: 0, y: 0 };
function updateCamera() {
  const p = G && G.player;
  const mapW = COLS * CELL, mapH = ROWS * CELL;
  const vw = viewW(), vh = viewH();                  // 相框換算成世界座標的大小（含縮放）
  cam.x = p ? Math.max(0, Math.min(mapW - vw, p.x - vw / 2)) : 0;
  cam.y = p ? Math.max(0, Math.min(mapH - vh, p.y - vh / 2)) : 0;
  if (mapW <= vw) cam.x = (mapW - vw) / 2;           // 地圖比畫面小 → 置中
  if (mapH <= vh) cam.y = (mapH - vh) / 2;
}

// ---- 遊戲狀態 ----
let G;
function newGame() {
  G = {
    phase: 'ready', money: START.money, lives: START.lives,
    guide: START.guide, guideMax: START.guideMax, guideRegen: START.guideRegen,
    grid: {}, towers: [], npcs: [], obstacles: [], enemies: [], effects: [],
    recentMonsterSpawns: [],
    selType: null, waveIndex: 0, waves: buildWaves(),
    spawnQueue: [], spawnTimer: 0, curGap: 0.9, betweenWaves: 0,
    running: false, over: false, won: false,
  };
  computeFlow();
  seedMapObstacles();   // 把地圖裡預設的「可破壞障礙物」擺上場
  seedCores();
  spawnSentries();      // 三位哨兵開場就在基地（隨機位置）
  spawnWanderers();     // 場景 NPC 只會在亮處自由走動
  const [px, py] = playerSpawnPos();
  G.player = { x: px, y: py, hp: 100, maxhp: 100, hitT: 0, underAttackT: 0, dir: 'front', moving: false, anim: 0, blinkWait: 2 + Math.random() * 3, blinkTime: -1 };
  updateCamera();
  updateHUD();
}
function buildWaves() {
  if (MAP_SAFE) return [];        // 安全場景：完全不生怪
  const w = [], W = WAVE_CFG;
  for (let i = 0; i < W.total; i++) {
    w.push({
      count: W.baseCount + i * W.addCount,
      hp: W.baseHp + i * W.addHp,
      speed: W.baseSpeed + i * W.addSpeed,
      reward: W.reward,
      gap: W.baseGap - i * W.subGap,
    });
  }
  return w;
}
function startWave() {
  if (G.cores) { G.spawnQueue=[]; return; }
  const w = G.waves[G.waveIndex];
  G.spawnQueue = [];
  for (let i = 0; i < w.count; i++) G.spawnQueue.push({ hp: w.hp, speed: w.speed, reward: w.reward });
  G.spawnTimer = 0; G.curGap = w.gap;
  sfx('wave');   // 新一波開始
}

// ---- 玩家出生點：優先站營地，找不到就從下往上找空地 ----
function playerSpawnPos() {
  const cand = [];
  campCells.forEach(k => cand.push(k.split(',').map(Number)));
  for (let r = ROWS - 1; r >= 0; r--) for (let c = 0; c < COLS; c++) cand.push([c, r]);
  for (const [c, r] of cand) if (inGrid(c, r) && !isWall(c, r) && !isEntrance(c, r)) return center(c, r);
  return center(Math.floor(COLS / 2), ROWS - 1);
}
// ---- 玩家移動與碰撞（牆、哨兵、障礙物都擋路；水平垂直分開判斷可貼牆滑行）----
function playerBlocked(x, y) {
  const r = PLAYER.r;
  for (const [sx, sy] of [[-r, -r], [r, -r], [-r, r], [r, r]]) {
    const px = x + sx, py = y + sy;
    const [c, rr] = cellAt(px, py);
    if (!inGrid(c, rr) || G.grid[c + ',' + rr]) return true;
    if (solidBlocksPoint(px, py)) return true;      // 不可穿透（含像素微調）
  }
  return false;
}
// 救援機制：角色若被卡在牆／建築裡（例如放置時的邊角誤差），
// 由近到遠繞圈找最近的空位，把角色推出去。
function rescueStuck(p, blockedFn) {
  if (!blockedFn(p.x, p.y)) return false;
  for (let d = 6; d <= CELL * 5; d += 6) {
    for (let a = 0; a < 16; a++) {
      const ang = (a / 16) * Math.PI * 2;
      const x = p.x + Math.cos(ang) * d, y = p.y + Math.sin(ang) * d;
      if (!blockedFn(x, y)) { p.x = x; p.y = y; return true; }
    }
  }
  return false;
}

// ---- 坐椅子 ----
// 座位＝地圖上「可以坐的磚塊」，位置含編輯器的微調位移；
// sortY 沿用那張圖在深度排序裡的值，坐上去時 +0.5 就會畫在椅子上面。
let seatCache = null, seatCacheFor = null;
function mapSeats() {
  if (seatCache && seatCacheFor === MAP) return seatCache;
  const occByStamp = new Map();
  for (const it of mapOccluders()) if (it.kind === 'stamp') occByStamp.set(it.stamp, it);
  const seats = [];
  for (const s of (MAP && MAP.stamps) || []) {
    const cfg = SIT.tiles[s.id]; if (!cfg) continue;
    const t = mapTileById(s.id) || {};
    const x0 = s.c * CELL + (s.ox || 0), y0 = s.r * CELL + (s.oy || 0);
    const w = mapTileW(t) * CELL, h = mapTileH(t) * CELL;
    let dir = cfg.dir || 'front';
    if (s.fx && (dir === 'left' || dir === 'right')) dir = dir === 'left' ? 'right' : 'left';   // 椅子翻面→人也跟著翻
    const dx = (cfg.seatDx || 0) * (s.fx ? -1 : 1);                                             // 翻面時左右微調也鏡射
    const occ = occByStamp.get(s);
    seats.push({
      x: x0 + w / 2 + dx,
      y: y0 + (cfg.seatDy != null ? cfg.seatDy : h * 0.7),
      top: y0, dir,
      sortY: occ ? occ.y : y0 + h,
    });
  }
  seatCache = seats; seatCacheFor = MAP;
  return seats;
}
function seatNearPlayer() {
  const p = G.player; if (!p) return null;
  let best = null, bd = SIT.radius;
  for (const s of mapSeats()) {
    const d = Math.hypot(s.x - p.x, s.y - p.y);
    if (d < bd) { bd = d; best = s; }
  }
  return best;
}
function toggleSit() {
  const p = G.player; if (!p) return;
  if (p.sitting) { standUp(); return; }
  const seat = seatNearPlayer(); if (!seat) return;
  p.sitFrom = { x: p.x, y: p.y };      // 記住原本站的位置，起身時回到那裡
  p.sitting = seat;
  p.x = seat.x; p.y = seat.y; p.dir = seat.dir;
  p.moving = false; p.anim = 0; p.blinkTime = -1;
  sfx('button');
}
function standUp() {
  const p = G.player; if (!p || !p.sitting) return;
  const from = p.sitFrom || { x: p.x, y: p.y + CELL };
  p.x = from.x; p.y = from.y;
  p.sitting = null; p.sitFrom = null;
  sfx('switch');
}

function updatePlayer(dt) {
  const p = G.player; if (!p) return;
  if (p.sitting) {                      // 坐著：不判定碰撞（椅子本來就是不可穿透），按移動鍵才起身
    if (!anyMoveKey()) { p.moving = false; p.anim = 0; updateBlink(p, dt); return; }
    standUp();
  }
  if (rescueStuck(p, playerBlocked)) flash('!', p.x, p.y - 30, '#ffd479');   // 被卡住→自動脫困
  const dx = ((keys['d'] || keys['arrowright']) ? 1 : 0) - ((keys['a'] || keys['arrowleft']) ? 1 : 0);
  const dy = ((keys['s'] || keys['arrowdown']) ? 1 : 0) - ((keys['w'] || keys['arrowup']) ? 1 : 0);
  p.moving = !!(dx || dy);
  if (!p.moving) {
    p.anim = 0;
    updateBlink(p, dt);
    return;
  }
  p.blinkTime = -1;
  if (Math.abs(dx) >= Math.abs(dy) && dx) p.dir = dx < 0 ? 'left' : 'right';
  else if (dy) p.dir = dy < 0 ? 'back' : 'front';
  p.anim += dt;
  const len = Math.hypot(dx, dy), step = PLAYER.speed * dt;
  const nx = p.x + dx / len * step, ny = p.y + dy / len * step;
  if (!playerBlocked(nx, p.y)) p.x = nx;
  if (!playerBlocked(p.x, ny)) p.y = ny;
}

// ---- 輸入：點畫面（放置 / 哨兵選單）----
cv.addEventListener('click', e => {
  const rect = cv.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (cv.width / rect.width) / VIEW_SCALE + cam.x;   // 去掉縮放、加上鏡頭＝世界座標
  const y = (e.clientY - rect.top) * (cv.height / rect.height) / VIEW_SCALE + cam.y;
  const [c, r] = cellAt(x, y);
  if (!inGrid(c, r)) return;

  if (!G.running || dialogueState) return;
  // 「指派位置巡邏」模式：這一下點擊＝指定目的地
  if (assigning) {
    spawnGroundRipple(e.clientX, e.clientY);
    closeGroundMenu();
    const t = assigning;
    if (!isLit(x, y)) { sfx('error'); flash('要指派在亮處', x, y, '#ffd24a'); return; }
    if (!inGrid(c, r) || isWall(c, r) || isEntrance(c, r) || G.grid[c + ',' + r]) { sfx('error'); flash('這裡不能巡邏', x, y, '#ff8f8f'); return; }
    t.mode = 'goto'; t.target = { x, y }; t.anchor = null; t.waitT = 0; t.navPath = null; t.navGoal = null; assigning = null;
    sfx('button');
    flash(TYPES[t.type].name + '：前往巡邏點', t.x, t.y - 24, '#8fd3ff');
    return;
  }
  // 點到哨兵 → 開選單
  // 有精靈圖的哨兵比色塊高，判定圈往上移到身體中間、放大一點
  const hit = G.towers.find(t => sentrySprites[t.type] ? Math.hypot(t.x - x, t.y - 14 - y) <= 28 : Math.hypot(t.x - x, t.y - y) <= 22);
  if (hit) { closeGroundMenu(); openSentryMenu(hit); return; }
  closeSentryMenu();
  // 安全區域：地面點擊不做事（不能蓋建築、也不能召喚哨兵）
  if (MAP_SAFE) { closeGroundMenu(); return; }
  // 點到玩家蓋的建築：在建築旁開啟操作選單，可用槌子按鈕拆除。
  const clickedBuilding = playerBuildingAt(c, r);
  if (clickedBuilding) {
    spawnGroundRipple(e.clientX, e.clientY);
    openBuildingMenu(clickedBuilding, c, r, e.clientX, e.clientY);
    return;
  }
  // 地圖原生障礙物與基地不能由玩家拆除。
  if (buildAt(c, r) || isWall(c, r) || isEntrance(c, r)) { closeGroundMenu(); return; }
  spawnGroundRipple(e.clientX, e.clientY);
  // 放置（合不合法由 placeObstacle 檢查「擋路格」決定，跟預覽框一致）
  if (!G.selType) { openGroundMenu(c, r, e.clientX, e.clientY); return; }
  closeGroundMenu();
  if (G.selType.startsWith('build:')) {
    const ob = buildableById(G.selType.slice(6));   // 去掉 'build:' 前綴，跨障礙物/裝飾查找
    if (ob) placeObstacle(ob, c, r);
  }
  updateHUD();
});

// ---- 滑鼠移動：記住目前指到哪一格（世界座標）----
cv.addEventListener('mousemove', e => {
  const rect = cv.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (cv.width / rect.width) / VIEW_SCALE + cam.x;
  const y = (e.clientY - rect.top) * (cv.height / rect.height) / VIEW_SCALE + cam.y;
  const [c, r] = cellAt(x, y);
  hoverCell = inGrid(c, r) ? [c, r] : null;
});
cv.addEventListener('mousedown', () => cv.classList.add('cursor-pressed'));
window.addEventListener('mouseup', () => cv.classList.remove('cursor-pressed'));
cv.addEventListener('mouseleave', () => { hoverCell = null; cv.classList.remove('cursor-pressed'); });

// ---- 怪物尋路：走向流場更低的相鄰格 ----
function commitNext(e) {
  const [cc, cr] = cellAt(e.x, e.y);
  if (isCamp(cc, cr) && !isWall(cc, cr)) {
    // 有可破壞基地時，走進開放入口的怪物會停下攻擊基地，而不是略過基地 HP。
    const base = G.obstacles.find(o => o.isBase && o.hp > 0);
    if (base) { e.baseTarget = base; }
    else if (campCells.size) { e.reached = true; }
    else { e.exiting = true; }
    e.hasTarget = true; e.tcell = null; return;
  }
  let best = null, bestd = flowAt(cc, cr);
  for (const [dc, dr] of [[0, 1], [-1, 0], [1, 0], [0, -1]]) {
    const nc = cc + dc, nr = cr + dr, fd = flowAt(nc, nr);
    if (fd < bestd) { bestd = fd; best = [nc, nr]; }
  }
  if (!best) { e.stuck = true; e.hasTarget = true; e.tcell = null; return; }
  e.tcell = best; [e.tx, e.ty] = center(best[0], best[1]);
  e.hasTarget = true; e.stuck = false; e.exiting = false;
}
function enemyAttackObstacle(e, o, dt) {
  e.atkCd = (e.atkCd || 0) - dt;
  if (e.atkCd > 0) return;
  e.atkCd = BARRIER.breakInterval;
  o.hp -= BARRIER.breakDmg;
  o.hitT = HIT_DUR;
  sfx('hit');
  if (o.hp > 0) return;
  removeBarrier(o); e.hasTarget = false; e.baseTarget = null;
  if (o.isBase) {
    G.lives = 0;
    flash('基地被摧毀！', OX + (o.c + o.w / 2) * CELL, OY + o.r * CELL - 18, '#ff5b5b');
    if (!G.over) lose();
  }
}
function enemyAttackSentry(e, target, dt) {
  e.atkCd = (e.atkCd || 0) - dt;
  if (e.atkCd > 0 || !target || target.hp <= 0) return;
  e.atkCd = 1;
  const spec = TYPES[target.type], defense = Math.max(0, Math.min(.75, spec.defense || 0));
  target.hp = Math.max(0, target.hp - 14 * (1 - defense));
  flash('-' + Math.round(14 * (1 - defense)), target.x, target.y - 30, '#ff8f8f');
  if (target.hp <= 0) { target.target = null; flash('失去戰鬥能力', target.x, target.y - 42, '#ff5b6e'); }
}
function enemyAttackPlayer(e, dt) {
  const p = G.player;
  if (!p || p.hp <= 0) return;
  e.atkCd = (e.atkCd || 0) - dt;
  if (e.atkCd > 0) return;
  e.atkCd = 1;
  p.hp = Math.max(0, p.hp - 12);
  p.hitT = .3; p.underAttackT = 5;
  flash('-12', p.x, p.y - 46, '#ff6b6b');
  sfx('hit');
  if (p.hp <= 0 && !G.over) {
    flash('部隊長失去戰鬥能力', p.x, p.y - 58, '#ff5b6e');
    lose();
  }
}
function enemyPursuePlayer(e, playerDistance, moveDt, dt) {
  if (!G.player || G.player.hp <= 0 || playerDistance > ENEMY_SENSE_RANGE) return false;
  if (playerDistance <= 30) { enemyAttackPlayer(e, dt); return true; }
  const [gc, gr] = cellAt(G.player.x, G.player.y);
  const nav = enemyNavigate(e, gc, gr, moveDt, 'player:' + gc + ',' + gr, true);
  if (nav.blocker) enemyAttackObstacle(e, nav.blocker, dt);
  return true;
}
function moveEnemyToward(e, target, dt) {
  const dx = target.x - e.x, dy = target.y - e.y, d = Math.hypot(dx, dy) || 1;
  const step = e.speed * dt;
  const nx=e.x+dx/d*Math.min(step,d),ny=e.y+dy/d*Math.min(step,d),[c,r]=cellAt(nx,ny);
  if (!inGrid(c,r) || isWall(c,r) || barrierAt(c,r)) return false;
  e.x=nx;e.y=ny;
  e.hasTarget = false; e.baseTarget = null;
  return true;
}

// ---- 異質體行為：18 格感知、尋路與黑暗遊蕩 ----
const ENEMY_SENSE_RANGE = 18 * CELL;
const ENEMY_NEIGHBORS = [[0, -1], [-1, 0], [1, 0], [0, 1]];
function enemyObstacleDistance(e, o) {
  let best = Infinity;
  for (const [dc, dr] of obstacleSolidCells(o)) {
    const [x, y] = center(o.c + dc, o.r + dr);
    best = Math.min(best, Math.hypot(x - e.x, y - e.y));
  }
  return best;
}
function closestObstacleCell(e, o) {
  let best = [o.c, o.r], bestD = Infinity;
  for (const [dc, dr] of obstacleSolidCells(o)) {
    const c = o.c + dc, r = o.r + dr, [x, y] = center(c, r);
    const d = Math.hypot(x - e.x, y - e.y);
    if (d < bestD) { best = [c, r]; bestD = d; }
  }
  return best;
}
function buildEnemyRoute(e, goalC, goalR, canBreakBuildings) {
  const [startC, startR] = cellAt(e.x, e.y);
  if (!inGrid(goalC, goalR) || isWall(goalC, goalR)) return null;
  const startKey = startC + ',' + startR, goalKey = goalC + ',' + goalR;
  const queue = [[startC, startR]], cameFrom = new Map([[startKey, null]]);
  for (let qi = 0; qi < queue.length; qi++) {
    const [c, r] = queue[qi];
    if (c === goalC && r === goalR) break;
    for (const [dc, dr] of ENEMY_NEIGHBORS) {
      const nc = c + dc, nr = r + dr, key = nc + ',' + nr;
      if (!inGrid(nc, nr) || isWall(nc, nr) || cameFrom.has(key)) continue;
      if (barrierAt(nc, nr) && !canBreakBuildings) continue;
      cameFrom.set(key, [c, r]); queue.push([nc, nr]);
    }
  }
  if (!cameFrom.has(goalKey)) return null;
  const path = [];
  for (let cur = [goalC, goalR]; cur && (cur[0] !== startC || cur[1] !== startR); ) {
    path.push(cur); cur = cameFrom.get(cur[0] + ',' + cur[1]);
  }
  path.reverse();
  return path;
}
function enemyNavigate(e, goalC, goalR, moveDt, routeKey, canBreakBuildings) {
  e.aiRouteTimer = (e.aiRouteTimer || 0) - moveDt;
  const goal = goalC + ',' + goalR;
  if (e.aiRouteKey !== routeKey || e.aiGoal !== goal || e.aiRouteTimer <= 0 || !e.aiPath || !e.aiPath.length) {
    e.aiPath = buildEnemyRoute(e, goalC, goalR, canBreakBuildings);
    e.aiRouteKey = routeKey; e.aiGoal = goal; e.aiRouteTimer = .65 + Math.random() * .35;
  }
  if (!e.aiPath || !e.aiPath.length) return { reached: true };
  const [nc, nr] = e.aiPath[0], blocker = barrierAt(nc, nr);
  if (blocker) return { blocker };
  const [tx, ty] = center(nc, nr), d = Math.hypot(tx - e.x, ty - e.y);
  if (d <= Math.max(2, e.speed * moveDt)) {
    e.x = tx; e.y = ty; e.aiPath.shift();
    return { reached: !e.aiPath.length };
  }
  moveEnemyToward(e, { x: tx, y: ty }, moveDt);
  return {};
}
function chooseDarkWanderCell(e) {
  const [ec, er] = cellAt(e.x, e.y), choices = [];
  for (let r = Math.max(0, er - 7); r <= Math.min(ROWS - 1, er + 7); r++) {
    for (let c = Math.max(0, ec - 7); c <= Math.min(COLS - 1, ec + 7); c++) {
      const distance = Math.abs(c - ec) + Math.abs(r - er);
      if (distance < 2 || distance > 9 || isWall(c, r) || barrierAt(c, r) || cellLit(c, r)) continue;
      choices.push([c, r]);
    }
  }
  if (!choices.length) return null;
  return choices[Math.floor(Math.random() * choices.length)];
}
function updateEnemyEffects(e, dt) {
  if (e.hitT > 0) e.hitT -= dt;
  if (e.burnT > 0) {
    e.burnT -= dt; e.burnTick = (e.burnTick || 0) - dt;
    if (e.burnTick <= 0) { e.burnTick += 1; e.hp -= e.burnDmg || 5; flash('燒傷', e.x, e.y - 25, '#ff8a42'); }
  }
  if (e.stunT > 0) e.stunT -= dt;
  if (e.confuseT > 0) e.confuseT -= dt;
}

const SLIME_JUMP = { ready: .14, air: .34, land: .14, height: 9 };
SLIME_JUMP.total = SLIME_JUMP.ready + SLIME_JUMP.air + SLIME_JUMP.land;
function updateSlimeJump(e, dt) {
  if (e.slimeClock == null) e.slimeClock = Math.random() * SLIME_JUMP.total;
  e.slimeClock = (e.slimeClock + dt) % SLIME_JUMP.total;
  const time = e.slimeClock;
  e.slimeLift = 0; e.slimeScaleX = 1; e.slimeScaleY = 1;
  if (time < SLIME_JUMP.ready) {
    const p = time / SLIME_JUMP.ready;
    e.slimeScaleX = 1 + .1 * p;
    e.slimeScaleY = 1 - .08 * p;
    return 0; // 蓄力時停在原地
  }
  if (time < SLIME_JUMP.ready + SLIME_JUMP.air) {
    const p = (time - SLIME_JUMP.ready) / SLIME_JUMP.air;
    e.slimeLift = Math.sin(Math.PI * p) * SLIME_JUMP.height;
    e.slimeScaleX = 1 - .05 * Math.sin(Math.PI * p);
    e.slimeScaleY = 1 + .09 * Math.sin(Math.PI * p);
    return dt * (SLIME_JUMP.total / SLIME_JUMP.air); // 只在空中前進，維持原本平均速度
  }
  const p = (time - SLIME_JUMP.ready - SLIME_JUMP.air) / SLIME_JUMP.land;
  e.slimeScaleX = 1 + .18 * (1 - p);
  e.slimeScaleY = 1 - .14 * (1 - p);
  return 0; // 落地壓扁並停頓
}

function spawnAttackVisual(attacker, target, spec, affected) {
  const kind = spec.ability === '火焰' ? 'flame'
    : spec.ability === '雷電' ? 'lightning'
    : spec.ability === '怪力' || spec.ability === '自癒' ? 'melee'
    : spec.ability === '腐蝕' ? 'corrosion' : 'shot';
  const duration = kind === 'lightning' ? .34 : (kind === 'melee' ? .24 : .28);
  G.effects.push({ attack: true, kind, x1: attacker.x, y1: attacker.y - 9, x2: target.x, y2: target.y, life: duration, life0: duration, color: spec.color, seed: Math.random() * 1000 });
  const hitTargets = affected && affected.length ? affected : [target];
  for (const enemy of hitTargets) {
    enemy.hitT = Math.max(enemy.hitT || 0, .16);
    enemy.hitColor = spec.color;
  }
  const particleCount = kind === 'lightning' ? 12 : (kind === 'melee' ? 9 : 7);
  for (let i = 0; i < particleCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = (kind === 'corrosion' ? 20 : 35) + Math.random() * 55;
    G.effects.push({
      particle: true, kind, x: target.x, y: target.y,
      vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - (kind === 'flame' ? 22 : 0),
      r: 1.5 + Math.random() * 2.2, life: .24 + Math.random() * .2, life0: .44,
      color: kind === 'lightning' ? '#fff3a3' : (kind === 'flame' ? '#ffb347' : spec.color)
    });
  }
  if (typeof sfx === 'function') sfx('hit');
}
function stepEnemy(e, dt) {
  updateEnemyEffects(e, dt);
  if (e.hp <= 0) return;
  if (e.stunT > 0) { e.slimeLift = 0; e.slimeScaleX = 1.08; e.slimeScaleY = .92; return; }
  const moveDt = updateSlimeJump(e, dt);
  if (e.confuseT > 0) {
    const allies = G.enemies.filter(o => o !== e && !o.dead && o.hp > 0).sort((a,b) => Math.hypot(a.x-e.x,a.y-e.y)-Math.hypot(b.x-e.x,b.y-e.y));
    const foe = allies[0];
    if (foe) {
      const d = Math.hypot(foe.x-e.x,foe.y-e.y);
      if (d > 22) moveEnemyToward(e, foe, moveDt);
      else { e.confuseCd=(e.confuseCd||0)-dt; if(e.confuseCd<=0){e.confuseCd=.8;foe.hp-=10;flash('混亂攻擊',foe.x,foe.y-24,'#c791ff');} }
    }
    return;
  }
  // 發光建築是異質體的最高優先目標：先破壞探照燈，讓周圍重新陷入黑暗。
  const lightChoice = G.obstacles
    .filter(o => o.hp > 0 && o.type && LIGHT.buildings && LIGHT.buildings[o.type])
    .map(o => ({ o, d: enemyObstacleDistance(e, o) }))
    .filter(item => item.d <= ENEMY_SENSE_RANGE)
    .sort((a, b) => a.d - b.d)[0];
  if (lightChoice) {
    const [gc, gr] = closestObstacleCell(e, lightChoice.o);
    const nav = enemyNavigate(e, gc, gr, moveDt, 'light:' + gc + ',' + gr, true);
    if (nav.blocker) enemyAttackObstacle(e, nav.blocker, dt);
    return;
  }
  const living = G.towers.filter(t => t.hp > 0 && !t.berserk);
  const sensedSentries = living
    .map(t => ({ t, d: Math.hypot(t.x - e.x, t.y - e.y) }))
    .filter(item => item.d <= ENEMY_SENSE_RANGE)
    .sort((a, b) => a.d - b.d);

  // 哨兵是第一優先；具有嘲諷能力者若在嘲諷範圍內，會覆蓋最近目標。
  let sentryChoice = sensedSentries[0] || null;
  const taunter = sensedSentries.find(item => {
    const taunt = TYPES[item.t.type].taunt || 0;
    return taunt && item.d <= taunt * CELL;
  });
  if (taunter) sentryChoice = taunter;
  const playerDistance = G.player && G.player.hp > 0 ? Math.hypot(G.player.x - e.x, G.player.y - e.y) : Infinity;
  // 玩家貼近怪物時一定會引起攻擊；距離明顯比哨兵近時也會成為目標。
  // 嘲諷中的哨兵仍能把遠處怪物的注意力拉回自己身上。
  const playerIsImmediate = playerDistance <= CELL * 2.25;
  const playerIsMuchCloser = !taunter && playerDistance <= ENEMY_SENSE_RANGE &&
    (!sentryChoice || playerDistance + CELL * 1.5 < sentryChoice.d);
  if ((playerIsImmediate || playerIsMuchCloser) && enemyPursuePlayer(e, playerDistance, moveDt, dt)) return;
  if (sentryChoice) {
    const target = sentryChoice.t;
    if (sentryChoice.d <= 22) { enemyAttackSentry(e, target, dt); return; }
    const [gc, gr] = cellAt(target.x, target.y);
    const nav = enemyNavigate(e, gc, gr, moveDt, 'sentry:' + target.type + ':' + gc + ',' + gr, true);
    // 追擊途中碰到任何建築，立刻先拆掉擋路的建築。
    if (nav.blocker) { enemyAttackObstacle(e, nav.blocker, dt); return; }
    return;
  }

  // 沒有哨兵攔截時，異質體會主動追擊 18 格內的玩家。
  if (enemyPursuePlayer(e, playerDistance, moveDt, dt)) return;

  // 沒有哨兵時，才搜尋 18 格內由玩家建造的設施。
  const buildingChoice = G.obstacles
    .filter(o => o.playerBuilt && o.hp > 0)
    .map(o => ({ o, d: enemyObstacleDistance(e, o) }))
    .filter(item => item.d <= ENEMY_SENSE_RANGE)
    .sort((a, b) => a.d - b.d)[0];
  if (buildingChoice) {
    const [gc, gr] = closestObstacleCell(e, buildingChoice.o);
    const nav = enemyNavigate(e, gc, gr, moveDt, 'building:' + gc + ',' + gr, true);
    if (nav.blocker) enemyAttackObstacle(e, nav.blocker, dt);
    return;
  }

  // 沒有感知到目標時不再直衝營地，而是在附近黑暗處走走停停。
  e.wanderWait = Math.max(0, (e.wanderWait || 0) - dt);
  if (!e.wanderCell && e.wanderWait <= 0) e.wanderCell = chooseDarkWanderCell(e);
  if (e.wanderCell) {
    const [wc, wr] = e.wanderCell;
    const nav = enemyNavigate(e, wc, wr, moveDt, 'wander:' + wc + ',' + wr, false);
    if (nav.reached) {
      e.wanderCell = null; e.aiPath = null;
      e.wanderWait = .35 + Math.random() * 1.35;
    }
  } else if (e.wanderWait <= 0) {
    e.wanderWait = .5 + Math.random();
  }
}

// ---- 主迴圈（幀率校正）----
let last = 0;
// ---- 腳步聲（走路時循環播放；安全場景=footsteps02、戰鬥場景=footsteps01）----
const FOOT = { audio: null, file: '' };
function updateFootsteps() {
  const p = G && G.player;
  const walking = !!(p && p.moving && !p.sitting && G.running && !G.over);
  if (!FOOT.audio) { FOOT.audio = new Audio(); FOOT.audio.loop = true; FOOT.audio.volume = 0.5; }
  const a = FOOT.audio;
  const want = MAP_SAFE ? 'Sound effects/footsteps02.mp3' : 'Sound effects/footsteps01.mp3';
  if (FOOT.file !== want) { FOOT.file = want; a.src = want; }
  a.muted = !SFX.enabled;                       // 跟著 M 鍵一起靜音
  if (walking) { if (a.paused) a.play().catch(() => {}); }
  else if (!a.paused) a.pause();
}
function loop(ts) {
  const dt = Math.min(0.05, (ts - last) / 1000 || 0); last = ts;
  if (!G.over && !dialogueState) updatePlayer(dt);   // 對話時暫停玩家與戰場
  updateFootsteps();               // 走路腳步聲
  updateCamera();
  if (G.running && !G.over && !dialogueState) update(dt);
  draw();
  requestAnimationFrame(loop);
}
function update(dt) {
  updateCores(dt);
  if (G.player) {
    G.player.hitT = Math.max(0, (G.player.hitT || 0) - dt);
    G.player.underAttackT = Math.max(0, (G.player.underAttackT || 0) - dt);
  }
  G.guide = Math.min(G.guideMax, G.guide + G.guideRegen * dt);
  // 生怪
  if (G.spawnQueue.length > 0) {
    G.spawnTimer -= dt;
    if (G.spawnTimer <= 0) {
      const cells = spawnCells();   // 地圖的「入口」格（沒設定就用最上排）
      if (cells.length) {
        const s = G.spawnQueue.shift();
        const [sc, sr] = cells[Math.floor(Math.random() * cells.length)];
        const [sx, sy] = center(sc, sr);
        G.enemies.push({ x: sx, y: sy, hp: s.hp, maxhp: s.hp, speed: s.speed, reward: s.reward, hasTarget: false });
      }
      G.spawnTimer = G.curGap;
    }
  }
  // 怪物移動
  for (const e of G.enemies) stepEnemy(e, dt);
  for (const e of G.enemies) { if (e.reached) { G.lives--; e.dead = true; } }
  // 哨兵走動（巡邏）
  for (const t of G.towers) {
    const ox = t.x, oy = t.y;
    updateSentry(t, dt);
    animateSentry(t, t.x - ox, t.y - oy, dt);
  }
  for (const npc of G.npcs) {
    const ox = npc.x, oy = npc.y;
    updateWanderer(npc, dt);
    animateSentry(npc, npc.x - ox, npc.y - oy, dt);
  }
  // 哨兵攻擊
  for (const t of G.towers) {
    const spec = TYPES[t.type];
    if (t.hp <= 0) continue;
    if (spec.hpRegen) t.hp = Math.min(t.maxhp, t.hp + spec.hpRegen * dt);
    if (spec.taintRegen && !t.berserk) t.taint = Math.max(0, t.taint - spec.taintRegen * dt);
    if (spec.aura && !t.berserk) {
      t.supportFxCd = Math.max(0, (t.supportFxCd || 0) - dt);
      for (const o of G.towers) {
        if (o === t || o.hp <= 0 || TYPES[o.type].guide || Math.hypot(o.x - t.x, o.y - t.y) > spec.aura.r * CELL) continue;
        const beforeTaint = o.taint || 0, beforeHp = o.hp;
        o.taint = Math.max(0, beforeTaint - spec.aura.rate * dt);
        o.hp = Math.min(o.maxhp, beforeHp + (spec.aura.heal || 0) * dt);
        if (o.berserk && o.taint < 60) o.berserk = false;
        if ((o.taint < beforeTaint || o.hp > beforeHp) && t.supportFxCd <= 0) {
          G.effects.push({ heal: true, x: o.x, y: o.y - 9, life: .72, life0: .72, color: '#72e0bd' });
          G.effects.push({ support: true, x1: t.x, y1: t.y - 8, x2: o.x, y2: o.y - 8, life: .32, life0: .32, color: '#72e0bd' });
          t.supportFxCd = .55;
        }
      }
    }   // 嚮導隨身疏導與治療
    t.cd -= dt;
    if (t.berserk || t.cd > 0) continue;
    const R = spec.range * CELL;
    let target = null, bestY = -1;
    for (const e of [...G.enemies, ...G.cores]) {
      if (e.dead) continue;
      if (Math.hypot(e.x - t.x, e.y - t.y) <= R && e.y > bestY) { target = e; bestY = e.y; }
    }
    if (target) {
      t.cd = 1 / spec.rate;
      if (Math.random() < spec.accuracy) {
        target.hp -= spec.dmg;
        const affected = target.maxhp && G.enemies.includes(target) ? [target] : [];
        if (spec.splash > 0) for (const e of G.enemies) if (e !== target && !e.dead && Math.hypot(e.x - target.x, e.y - target.y) <= spec.splash * CELL) { e.hp -= spec.dmg * .6; affected.push(e); }
        for (const e of affected) {
          if (spec.burn) { e.burnT=spec.burn.duration; e.burnDmg=spec.burn.damage; e.burnTick=1; }
          if (spec.stun) e.stunT=Math.max(e.stunT||0,spec.stun);
          if (spec.confuse) e.confuseT=Math.max(e.confuseT||0,spec.confuse);
          if (spec.knockback) {
            const dx=e.x-t.x,dy=e.y-t.y,d=Math.hypot(dx,dy)||1;
            e.x+=dx/d*CELL*spec.knockback;e.y+=dy/d*CELL*spec.knockback;e.hasTarget=false;e.baseTarget=null;
          }
        }
        spawnAttackVisual(t, target, spec, affected);
      } else flash('MISS', t.x, t.y - 26, '#9aa4b2');
      if (!spec.guide) t.taint = Math.min(100, t.taint + spec.taint);
      if (t.taint >= 100 && !t.berserk) { t.berserk = true; G.lives -= BERSERK.livesPenalty; sfx('berserk'); flash('暴走!', t.x, t.y - 30, '#ff4d4d'); }
    }
  }
  for (const e of G.enemies) { if (e.hp <= 0 && !e.dead) { e.dead = true; G.money += e.reward; earnCrystals(3); sfx('kill'); } }
  for (const core of G.cores) if(core.hp<=0 && !core.dead) {
    core.dead=true; earnCrystals(core.reward); flash('異質核心已摧毀 +'+core.reward+' 結晶',core.x,core.y,'#d69bff');
  }
  G.enemies = G.enemies.filter(e => !e.dead);
  // 建築放置動畫計時（落地瞬間揚塵）＋受擊閃紅計時
  for (const o of G.obstacles) {
    if (o.spawnT !== undefined && o.spawnT < DROP_TOTAL) {
      const before = o.spawnT; o.spawnT += dt;
      if (before < DROP.fall && o.spawnT >= DROP.fall) spawnDust(o);
    }
    if (o.hitT > 0) o.hitT -= dt;
  }
  for (const f of G.effects) {
    f.life -= dt;
    if (f.dust) {   // 塵埃：往外飄、逐漸減速
      f.x += f.vx * dt; f.y += f.vy * dt;
      f.vx *= (1 - 2.5 * dt); f.vy *= (1 - 2.5 * dt);
    } else if (f.particle) {
      f.x += f.vx * dt; f.y += f.vy * dt;
      f.vx *= (1 - 3.4 * dt); f.vy *= (1 - 3.4 * dt);
      if (f.kind === 'flame') f.vy -= 18 * dt;
    }
  }
  G.effects = G.effects.filter(f => f.life > 0);
  // 波次（安全場景沒有波次，也不會有勝負）
  if (!MAP_SAFE && G.cores.length && G.cores.every(c=>c.dead) && G.enemies.length===0) win();
  if (G.lives <= 0) { G.lives = 0; lose(); }
  updateHUD();
}
const FLASH_LIFE = 1.5;   // 提示字停留時間（秒）；想更久／更短改這裡
function flash(text, x, y, color) { G.effects.push({ text, x, y, life: FLASH_LIFE, life0: FLASH_LIFE, color, vy: -22 }); }

// ---- 各種角色/物件的畫法（拆成函式，方便深度排序時逐一呼叫）----
const HIT_DUR = 0.3;   // 建築被攻擊時「閃紅＋震動」持續秒數
function drawObstacle(o) {
  const w = (o.w || 1) * CELL, h = (o.h || 1) * CELL;
  // 受擊震動：依剩餘 hitT 隨機抖動，越接近結束越小
  const hit = o.hitT > 0 ? o.hitT / HIT_DUR : 0;
  const shX = hit ? (Math.random() * 2 - 1) * 4 * hit : 0;
  const shY = hit ? (Math.random() * 2 - 1) * 4 * hit : 0;
  const x = OX + o.c * CELL + shX, y = OY + o.r * CELL + shY;
  // 放置動畫：位移＋以「底部中央」為錨點的壓扁/回彈縮放
  const a = dropAnim(o.spawnT);
  if (a) {
    ctx.save();
    ctx.translate(0, a.dy);                       // 掉落中的高度位移
    ctx.translate(x + w / 2, y + h);              // 錨點移到底部中央
    ctx.scale(a.sx, a.sy);
    ctx.translate(-(x + w / 2), -(y + h));
  }
  const img = o.type && obstacleImgs[o.type] && obstacleImgs[o.type][o.orient || 'h'];
  // 基地本體是地圖上的平面大圖，這裡只負責碰撞、受擊效果與血條，避免重複繪製。
  if (!o.isBase) {
    if (img && img.complete && img.naturalWidth) ctx.drawImage(img, x, y, w, h);
    else { ctx.fillStyle = '#7a5a3a'; roundRect(x + 3, y + 3, w - 6, h - 6, 5); ctx.fill(); ctx.strokeStyle = '#5a4128'; ctx.lineWidth = 2; ctx.stroke(); }
  }
  if (hit) {   // 閃紅：半透明紅疊在圖上
    ctx.globalAlpha = 0.55 * hit; ctx.fillStyle = '#ff3030';
    if (o.isBase) {
      ctx.lineWidth = 6; ctx.strokeStyle = '#ff3030'; ctx.strokeRect(x + 3, y + 3, w - 6, h - 6);
    } else ctx.fillRect(x, y, w, h);
    ctx.globalAlpha = 1;
  }
  if (a) ctx.restore();
  if (o.isBase) {         // 基地血條永久顯示，並依剩餘 HP 變色
    const ratio = Math.max(0, Math.min(1, o.hp / o.maxhp));
    const barW = Math.max(120, w - 48), barH = 10;
    const barX = x + (w - barW) / 2, barY = y - 22;
    ctx.fillStyle = 'rgba(0,0,0,.82)'; roundRect(barX - 3, barY - 3, barW + 6, barH + 6, 4); ctx.fill();
    ctx.fillStyle = '#352d2d'; roundRect(barX, barY, barW, barH, 2); ctx.fill();
    ctx.fillStyle = ratio > 0.5 ? '#59d26f' : (ratio > 0.25 ? '#f0c54d' : '#ef5b5b');
    if (ratio > 0) { roundRect(barX, barY, barW * ratio, barH, 2); ctx.fill(); }
    ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,.9)';
    const label = '基地 HP ' + Math.max(0, Math.ceil(o.hp)) + ' / ' + o.maxhp;
    ctx.strokeText(label, x + w / 2, barY - 4); ctx.fillStyle = '#fff'; ctx.fillText(label, x + w / 2, barY - 4);
  } else if (o.hp < o.maxhp) {   // 一般障礙物受損才顯示血條
    ctx.fillStyle = '#000'; ctx.fillRect(x + 2, y + h - 6, w - 4, 4);
    ctx.fillStyle = '#c9a26a'; ctx.fillRect(x + 2, y + h - 6, (w - 4) * Math.max(0, o.hp) / o.maxhp, 4);
  }
}
function drawTower(t) {
  const spec = TYPES[t.type];
  const set = sentrySprites[t.type];
  const img = set && pickCharacterFrame(set, t);
  let visualTop = t.y - 17;
  if (img && img.complete && img.naturalWidth) {
    const size = PLAYER.drawSize;
    visualTop = t.y - size + 18;
    const shX = t.berserk ? (Math.random() * 2 - 1) * 1.5 : 0;   // 暴走：微微發抖
    if (t.berserk) {   // 暴走：腳下紅光
      ctx.fillStyle = 'rgba(255,60,60,0.45)';
      ctx.beginPath(); ctx.ellipse(t.x, t.y + 14, 20, 7, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, t.x - size / 2 + shX, t.y - size + 18, size, size);
    ctx.imageSmoothingEnabled = true;
  } else {
    ctx.fillStyle = t.berserk ? '#5a1f27' : spec.color; roundRect(t.x - 17, t.y - 17, 34, 34, 6); ctx.fill();
  }

  // 頭頂資訊：名字在上，HP 條在下。
  // 安全區域沒有血條，名字往下 5px 貼近頭頂（跟 NPC 一致）；戰鬥區域維持原本的名字＋血條間距。
  const nameY = visualTop - (MAP_SAFE ? 6 : 11);
  ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,.9)'; ctx.strokeText(spec.name, t.x, nameY);
  ctx.fillStyle = t.berserk ? '#ff7777' : '#fff'; ctx.fillText(spec.name, t.x, nameY);

  if (!MAP_SAFE) {        // 安全區域沒有戰鬥，頭上不顯示血條（名字留著）
    const maxhp = t.maxhp || spec.hp || 100;
    const hp = Math.max(0, Math.min(maxhp, t.hp ?? maxhp));
    const barW = 42, barH = 3, barX = t.x - barW / 2, barY = visualTop - 7;
    ctx.fillStyle = 'rgba(0,0,0,.85)'; roundRect(barX - 1, barY - 1, barW + 2, barH + 2, 2); ctx.fill();
    if (hp > 0) {
      ctx.fillStyle = hp / maxhp > 0.5 ? '#57d879' : (hp / maxhp > 0.25 ? '#f1c84b' : '#ef5b5b');
      roundRect(barX, barY, barW * hp / maxhp, barH, 1); ctx.fill();
    }
  }
  if (t.berserk) { ctx.fillStyle = '#ff4d4d'; ctx.font = 'bold 10px sans-serif'; ctx.fillText('暴走', t.x, nameY - 14); }
  if (t.say && t.say.text && !t.berserk) drawSpeechBubble(t.x, nameY - 13, t.say.text, BUBBLE_COLORS[t.type]);   // 哨兵對話泡泡
}
function drawEnemy(e) {
  ctx.save();
  if (e.hitT > 0) ctx.translate((Math.random() * 2 - 1) * 2.5, (Math.random() * 2 - 1) * 1.5);
  const lift = e.slimeLift || 0;
  const slimeW = 42 * (e.slimeScaleX || 1), slimeH = 33 * (e.slimeScaleY || 1);
  const bottomY = e.y + 13 - lift;
  const shadowScale = Math.max(.55, 1 - lift / 22);
  ctx.globalAlpha = .28 * shadowScale; ctx.fillStyle = '#071015';
  ctx.beginPath(); ctx.ellipse(e.x, e.y + 13, 15 * shadowScale, 4 * shadowScale, 0, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;
  if (monsterSlimeSprite.complete && monsterSlimeSprite.naturalWidth) {
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(monsterSlimeSprite, Math.round(e.x - slimeW / 2), Math.round(bottomY - slimeH), Math.round(slimeW), Math.round(slimeH));
    ctx.imageSmoothingEnabled = true;
  } else {
    ctx.fillStyle = '#48c7d5'; ctx.beginPath(); ctx.ellipse(e.x, bottomY - slimeH / 2, slimeW / 2.8, slimeH / 2.8, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = '#000'; ctx.fillRect(e.x - 16, e.y - 26, 32, 3);
  ctx.fillStyle = '#7CFC7C'; ctx.fillRect(e.x - 16, e.y - 26, 32 * Math.max(0, e.hp) / e.maxhp, 3);
  if (e.burnT > 0) { ctx.strokeStyle='#ff7b39';ctx.lineWidth=2;ctx.beginPath();ctx.arc(e.x,e.y,17,0,Math.PI*2);ctx.stroke(); }
  if (e.stunT > 0) { ctx.fillStyle='#ffe36e';ctx.font='bold 11px sans-serif';ctx.textAlign='center';ctx.fillText('顫抖',e.x,e.y-33); }
  if (e.confuseT > 0) { ctx.fillStyle='#d6a0ff';ctx.font='bold 11px sans-serif';ctx.textAlign='center';ctx.fillText('混亂',e.x,e.y-33); }
  if (e.hitT > 0) {
    ctx.globalAlpha = Math.min(1, e.hitT / .16);
    ctx.strokeStyle = e.hitColor || '#fff'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(e.x, e.y, 15 + (1 - e.hitT / .16) * 5, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}
function drawWanderer(npc) {
  const set = wandererSprites[npc.id];
  const img = set && pickCharacterFrame(set, npc);
  const size = PLAYER.drawSize;
  if (img && img.complete && img.naturalWidth) {
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, npc.x - size / 2, npc.y - size + 18, size, size);
    ctx.imageSmoothingEnabled = true;
  }
  // 頭頂名字（跟哨兵同樣式；NPC 沒有血條）
  const name = (WANDERERS.find(w => w.id === npc.id) || {}).name;
  if (!name) return;
  ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  const nameY = npc.y - size + 12;   // 比圖片頂端再往下 5px
  ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,.9)'; ctx.strokeText(name, npc.x, nameY);
  ctx.fillStyle = '#fff'; ctx.fillText(name, npc.x, nameY);
  if (npc.say && npc.say.text) drawSpeechBubble(npc.x, nameY - 13, npc.say.text, BUBBLE_COLORS[npc.id]);   // 頭上對話泡泡（角色專屬色）
}
// 對話泡泡：參考《苦艾與甘露》——深色半透明底＋角色專屬色邊框/文字＋圓角＋向下小尾巴＋淡光暈
// 淺底色＋深色字，每個角色一種顏色（bg 淺底／bd 邊框＋尾巴／tx 深色文字）
const BUBBLE_COLORS = {
  avaren:  { bg: '#dce8fb', bd: '#3a5fa0', tx: '#1c3766' },   // 淺藍
  eldrin:  { bg: '#d8efe6', bd: '#2f8a68', tx: '#123f2e' },   // 青綠
  noah:    { bg: '#f3ecd9', bd: '#a89355', tx: '#4a3f1c' },   // 米黃
  chris:   { bg: '#eef2f6', bd: '#8a97a8', tx: '#2b3541' },   // 冷白
  claire:  { bg: '#f5ecd6', bd: '#a07a3a', tx: '#4d3712' },   // 金
  luther:  { bg: '#e4f0d6', bd: '#5f8a35', tx: '#2c4014' },   // 草綠
  mumu:    { bg: '#d6edf2', bd: '#2f8598', tx: '#123842' },   // 藍綠
  theonie: { bg: '#fbe0ec', bd: '#c04a7a', tx: '#5a1c38' },   // 粉紅
  amber:   { bg: '#e5e2f7', bd: '#5f52a8', tx: '#2a2356' },   // 藍紫
  red:     { bg: '#f7dee1', bd: '#a8303a', tx: '#5a1a20' },   // 紅
};
const BUBBLE_DEFAULT = { bg: '#eef2f7', bd: '#5a6a86', tx: '#232a36' };
function drawSpeechBubble(cx, bottomY, text, col) {
  const c = col || BUBBLE_DEFAULT, tail = 6, rad = 9;
  ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  const tw = ctx.measureText(text).width, w = tw + 24, h = 26;
  const x = Math.round(cx - w / 2), y = Math.round(bottomY - tail - h);
  ctx.fillStyle = c.bg; roundRect(x, y, w, h, rad); ctx.fill();
  ctx.strokeStyle = c.bd; ctx.lineWidth = 1.2; roundRect(x, y, w, h, rad); ctx.stroke();
  ctx.fillStyle = c.bd;                                       // 向下小三角尾巴（同邊框色）
  ctx.beginPath(); ctx.moveTo(cx - 5, y + h); ctx.lineTo(cx + 5, y + h); ctx.lineTo(cx, y + h + tail); ctx.closePath(); ctx.fill();
  ctx.fillStyle = c.tx; ctx.fillText(text, cx, y + h - 8);    // 角色色文字
}
// 椅子上方的「[E] 坐」提示框
function drawInteractPrompt(cx, topY, label) {
  const keyLabel = 'Space';
  ctx.textBaseline = 'alphabetic';
  ctx.font = 'bold 10px sans-serif'; const keyW = Math.max(18, ctx.measureText(keyLabel).width + 10);
  ctx.font = 'bold 13px sans-serif'; const gap = 6, pad = 9, textW = ctx.measureText(label).width;
  const boxW = pad * 2 + keyW + gap + textW, boxH = 24;
  const x = Math.round(cx - boxW / 2), y = Math.round(topY - boxH - 10);
  ctx.fillStyle = 'rgba(12,16,22,.9)'; roundRect(x, y, boxW, boxH, 6); ctx.fill();
  ctx.strokeStyle = 'rgba(143,211,255,.85)'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = '#8fd3ff'; roundRect(x + pad, y + 5, keyW, 14, 3); ctx.fill();
  ctx.fillStyle = '#0e1116'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(keyLabel, x + pad + keyW / 2, y + 15.5);
  ctx.fillStyle = '#e6ebf2'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'left';
  ctx.fillText(label, x + pad + keyW + gap, y + 17);
}
function drawSitPrompt(seat) { drawInteractPrompt(seat.x, seat.top, '坐'); }
function drawPlayer(p) {
  const img = pickCharacterFrame(playerSprites, p);
  const size = PLAYER.drawSize;
  if (img && img.complete && img.naturalWidth) {
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, p.x - size / 2, p.y - size + 18, size, size);
    ctx.imageSmoothingEnabled = true;
  } else {
    ctx.fillStyle = '#5ec8ff'; roundRect(p.x - 14, p.y - 16, 28, 32, 8); ctx.fill();
  }
  if (p.hitT > 0) {
    ctx.fillStyle = `rgba(255,70,70,${Math.min(.38, p.hitT)})`;
    ctx.beginPath(); ctx.arc(p.x, p.y - 15, 25, 0, Math.PI * 2); ctx.fill();
  }
  if (!MAP_SAFE) {
    const w = 46, h = 5, ratio = Math.max(0, p.hp / p.maxhp), x = p.x - w / 2, y = p.y - size + 13;
    ctx.fillStyle = 'rgba(8,12,18,.88)'; roundRect(x - 1, y - 1, w + 2, h + 2, 3); ctx.fill();
    ctx.fillStyle = ratio > .35 ? '#63d7aa' : '#ff6363'; roundRect(x, y, w * ratio, h, 2); ctx.fill();
  }
}

// ---- 繪製 ----
function draw() {
  lightsCache = LIGHT.enabled ? getLights() : [];   // 更新這一幀的光源
  computeLightField();                              // 光沿格子擴散、碰牆停（牆後全黑）
  ctx.clearRect(0, 0, cv.width, cv.height);
  // 之後畫的都是「世界座標」：先套畫面縮放，再平移鏡頭位置，畫面就會跟著玩家捲動
  ctx.save();
  ctx.scale(VIEW_SCALE, VIEW_SCALE);
  ctx.translate(-Math.round(cam.x * VIEW_SCALE) / VIEW_SCALE, -Math.round(cam.y * VIEW_SCALE) / VIEW_SCALE);
  ctx.imageSmoothingEnabled = false;   // 放大時保持像素銳利
  // 底色＝純黑：沒有鋪任何素材的格子就是黑的（跟地圖編輯器看到的一致）
  ctx.fillStyle = '#000'; ctx.fillRect(OX, OY, COLS * CELL, ROWS * CELL);
  // 地面層（地板、地面裝飾）：永遠畫在角色下方
  drawMapGround(ctx);
  // 沒有美術的固定牆（入口／營地的區域色已取消，改用地圖美術自己表現）
  for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++) {
    const [cx, cy] = [OX + c * CELL, OY + r * CELL];
    if (isWall(c, r) && !hasImageAt(c, r)) {
      ctx.fillStyle = '#3f434b'; ctx.fillRect(cx + 2, cy + 2, CELL - 4, CELL - 4);
      ctx.strokeStyle = '#565b64'; ctx.lineWidth = 2; ctx.strokeRect(cx + 5, cy + 5, CELL - 10, CELL - 10);
    }
  }
  // ---- 深度排序：會遮擋的地圖圖片（牆/物件）＋障礙物＋哨兵＋怪物＋玩家，一起依「底部Y」由上往下畫 ----
  //      底部Y 較小（畫面上方）的先畫、會被後畫的蓋住 → 走到牆後面就會被牆遮住。
  const sortables = [];
  collectMapOccluders(ctx, sortables);
  for(const core of G.cores) if(!core.dead && isLit(core.x,core.y)) sortables.push({y:core.y+23,draw:()=>drawCore(core)});
  for (const o of G.obstacles) sortables.push({ y: (o.r + (o.h || 1)) * CELL, draw: () => drawObstacle(o) });
  for (const t of G.towers) sortables.push({ y: t.y + 17, draw: () => drawTower(t) });
  for (const npc of G.npcs) sortables.push({ y: npc.y + 17, draw: () => drawWanderer(npc) });
  for (const e of G.enemies) if (isLit(e.x, e.y)) sortables.push({ y: e.y + 13, draw: () => drawEnemy(e) });   // 黑暗中的怪物看不到
  // 坐著時沿用椅子的排序值再 +0.5 → 畫在椅子上面（坐進椅子裡而不是被椅背蓋住）
  if (G.player) sortables.push({ y: G.player.sitting ? G.player.sitting.sortY + 0.5 : G.player.y + 16, draw: () => drawPlayer(G.player) });
  sortables.sort((a, b) => a.y - b.y);
  for (const it of sortables) it.draw();

  // 上層（樹冠、屋簷等，永遠蓋在最上面）
  drawMapTop(ctx);
  // 互動提示（靠近且還沒坐下時）：出入口優先，其次 NPC，最後椅子
  if (G.player && !G.player.sitting && !G.over && !dialogueState) {
    const near = G.running ? portalNearPlayer() : null;
    if (near) drawInteractPrompt(near.x, near.y - CELL / 2, '進入 ' + portalTargetName(near.portal));
    else {
      const actor = dialogueNearPlayer(), profile = actor && dialogueProfile(actor);
      if (actor) drawInteractPrompt(actor.x, actor.y - 57, '與 ' + (profile ? profile.name : '角色') + ' 對話');
      else { const seat = seatNearPlayer(); if (seat) drawSitPrompt(seat); }
    }
  }
  // 特效
  for (const f of G.effects) {
    if (f.text) {
      const life0 = f.life0 || 0.8;
      const alpha = Math.min(1, f.life / 0.6);                 // 最後 0.6 秒才淡出，其餘維持清晰
      const ty = f.y + (f.vy || 0) * Math.min(0.8, life0 - f.life);   // 只在前段緩緩上飄
      ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center';
      // 黑底標籤：讓提示字在任何背景上都看得清楚
      const tw = ctx.measureText(f.text).width;
      ctx.globalAlpha = alpha * 0.72; ctx.fillStyle = '#000';
      roundRect(f.x - tw / 2 - 8, ty - 15, tw + 16, 21, 6); ctx.fill();
      ctx.globalAlpha = alpha; ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, ty);
      ctx.globalAlpha = 1;
    } else if (f.heal) {
      const p = Math.max(0, f.life / f.life0), grow = 1 - p;
      ctx.globalAlpha = p; ctx.strokeStyle = f.color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(f.x, f.y, 8 + grow * 10, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#bfffe8';
      ctx.fillRect(f.x - 2, f.y - 10 - grow * 7, 4, 14);
      ctx.fillRect(f.x - 7, f.y - 5 - grow * 7, 14, 4);
      ctx.globalAlpha = 1;
    } else if (f.support) {
      const p = Math.max(0, f.life / f.life0);
      ctx.globalAlpha = p * .72; ctx.strokeStyle = f.color; ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(f.x1, f.y1); ctx.lineTo(f.x2, f.y2); ctx.stroke();
      ctx.setLineDash([]); ctx.globalAlpha = 1;
    } else if (f.attack) {
      const p = Math.max(0, f.life / f.life0), grow = 1 - p;
      ctx.save(); ctx.globalAlpha = Math.min(1, p * 1.35);
      if (f.kind === 'lightning') {
        ctx.strokeStyle = '#fff4a8'; ctx.lineWidth = 3; ctx.shadowColor = '#ffe55e'; ctx.shadowBlur = 11;
        ctx.beginPath(); ctx.moveTo(f.x2 + 5, f.y2 - 92);
        for (let i = 1; i <= 6; i++) {
          const y = f.y2 - 92 + i * 15.5;
          const x = f.x2 + Math.sin(f.seed + i * 7.3) * (i === 6 ? 0 : 9);
          ctx.lineTo(x, y);
        }
        ctx.stroke(); ctx.shadowBlur = 0;
        ctx.strokeStyle = '#ffe36e'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(f.x2, f.y2, 12 + grow * 18, 0, Math.PI * 2); ctx.stroke();
      } else if (f.kind === 'melee') {
        const angle = Math.atan2(f.y2 - f.y1, f.x2 - f.x1);
        ctx.strokeStyle = '#fff2cf'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.shadowColor = f.color; ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.arc(f.x2, f.y2, 19 + grow * 9, angle - 1.25, angle + .85); ctx.stroke();
        ctx.shadowBlur = 0; ctx.strokeStyle = f.color; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(f.x2, f.y2 + 5, 8 + grow * 24, 0, Math.PI * 2); ctx.stroke();
      } else {
        const dx = f.x2 - f.x1, dy = f.y2 - f.y1, d = Math.hypot(dx, dy) || 1;
        ctx.strokeStyle = f.kind === 'flame' ? '#ffd080' : (f.kind === 'corrosion' ? '#8db8ff' : f.color);
        ctx.lineWidth = f.kind === 'flame' ? 4 : 2.5; ctx.lineCap = 'round'; ctx.shadowColor = f.color; ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.moveTo(f.x1, f.y1); ctx.lineTo(f.x2 - dx / d * 5, f.y2 - dy / d * 5); ctx.stroke();
        ctx.shadowBlur = 0; ctx.fillStyle = f.color;
        ctx.beginPath(); ctx.arc(f.x2, f.y2, 5 + grow * (f.kind === 'corrosion' ? 13 : 9), 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    } else if (f.particle) {
      const p = Math.max(0, f.life / f.life0);
      ctx.globalAlpha = p; ctx.fillStyle = f.color;
      if (f.kind === 'lightning') {
        ctx.fillRect(f.x - f.r, f.y - .8, f.r * 2, 1.6);
        ctx.fillRect(f.x - .8, f.y - f.r, 1.6, f.r * 2);
      } else {
        ctx.beginPath(); ctx.arc(f.x, f.y, Math.max(.5, f.r * p), 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    } else if (f.dust) {   // 塵埃：淡土色小圓點，隨時間變淡、略微放大
      const p = Math.max(0, f.life / f.life0);
      ctx.globalAlpha = 0.45 * p;
      ctx.fillStyle = '#cfc4ae';
      ctx.beginPath(); ctx.arc(f.x, f.y, f.r * (1.6 - 0.6 * p), 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    } else {
      ctx.globalAlpha = Math.max(0, f.life / 0.12); ctx.strokeStyle = f.color; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(f.x1, f.y1); ctx.lineTo(f.x2, f.y2); ctx.stroke(); ctx.globalAlpha = 1;
    }
  }
  // 建築放置預覽（40% 半透明，放不下時紅框）
  if (hoverCell && G.running && G.selType && G.selType.startsWith('build:')) {
    const ob = buildableById(G.selType.slice(6));   // 去掉 'build:' 前綴，跨障礙物/裝飾查找
    if (ob) {
      const v = ob[buildOrient], [c, r] = hoverCell;
      const x = OX + c * CELL, y = OY + r * CELL, w = v.w * CELL, h = v.h * CELL;
      const ok = canPlaceObstacle(v, c, r, placeExtra(ob));   // 探照燈可蓋在光圈邊緣附近
      const img = obstacleImgs[ob.id][buildOrient];
      ctx.globalAlpha = 0.4;
      if (img && img.complete && img.naturalWidth) ctx.drawImage(img, x, y, w, h);
      else { ctx.fillStyle = '#7a5a3a'; ctx.fillRect(x + 3, y + 3, w - 6, h - 6); }
      ctx.globalAlpha = 1;
      ctx.strokeStyle = ok ? '#8fd3ff' : '#ff5b5b'; ctx.lineWidth = 2; ctx.setLineDash([6, 4]);
      ctx.strokeRect(x + 1, y + 1, w - 2, h - 2); ctx.setLineDash([]);
      ctx.fillStyle = ok ? 'rgba(80,210,150,.28)' : 'rgba(255,80,80,.3)';
      for (const [dc, dr] of variantSolidCells(v)) ctx.fillRect(x + dc * CELL, y + dr * CELL, CELL, CELL);
    }
  }
  // 情境選單或指定建築的目標格
  const actionCell = buildTargetCell || (groundTarget && !groundMenu.classList.contains('hidden') ? [groundTarget.c, groundTarget.r] : null);
  drawDarkness();  // 蓋上黑幕、在光源處挖洞（同樣畫在世界座標上）
  // 目標框畫在黑幕上方，黑暗區域也能清楚看到所選格子。
  if (actionCell) {
    const [ac, ar] = actionCell, ax = OX + ac * CELL, ay = OY + ar * CELL;
    ctx.fillStyle = 'rgba(143,211,255,.13)'; ctx.fillRect(ax + 1, ay + 1, CELL - 2, CELL - 2);
    ctx.strokeStyle = '#9fddff'; ctx.lineWidth = 2; ctx.setLineDash([5, 4]);
    ctx.strokeRect(ax + 2, ay + 2, CELL - 4, CELL - 4); ctx.setLineDash([]);
  }
  ctx.restore();   // 世界座標畫完，回到螢幕座標（下面的提示固定在畫面上）
  // 指派巡邏位置中：畫面上方顯示提示
  if (assigning) {
    ctx.fillStyle = 'rgba(20,25,35,.75)'; ctx.fillRect(0, 0, cv.width, 44);
    ctx.fillStyle = '#ffd479'; ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('🎯 點擊地圖，指定「' + TYPES[assigning.type].name + '」的巡邏位置（Esc 取消）', cv.width / 2, 29);
  }
}
function roundRect(x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

// ---- HUD / 狀態畫面 ----
function updateHUD() {
  // 安全區域：資源／營地HP／嚮導能量／波次都沒有意義，連同「建築」按鈕一起收起來
  const hud = document.getElementById('hud');
  if (hud) hud.classList.toggle('hidden', MAP_SAFE);
  if (typeof buildToggle !== 'undefined' && buildToggle) buildToggle.classList.toggle('hidden', MAP_SAFE);
  if (typeof updateTeamButton === 'function') updateTeamButton();   // 安全場景才顯示「出勤編隊」按鈕
  if (MAP_SAFE && typeof buildBar !== 'undefined' && buildBar) buildBar.classList.add('hidden');
  document.getElementById('money').textContent = Math.floor(G.money);
  document.getElementById('lives').textContent = Math.max(0, G.lives);
  document.getElementById('guide').textContent = Math.floor(G.guide);
  document.getElementById('wave').textContent = G.cores.filter(c=>c.dead).length;
  document.getElementById('wavemax').textContent = G.cores.length || '—';
  const mission = document.getElementById('missionText');
  if (mission) mission.textContent = MAP_SAFE ? '目前任務：休息一下（安全區域）' : '目前任務：守住營地';
}
const overlay = document.getElementById('overlay');
const ovTitle = document.getElementById('ov-title'), ovText = document.getElementById('ov-text'), ovBtn = document.getElementById('ov-btn');
function showOverlay(title, text, btn) { ovTitle.textContent = title; ovText.innerHTML = text; ovBtn.textContent = btn; overlay.classList.remove('hidden'); }
function hideOverlay() { overlay.classList.add('hidden'); }
function showStart() {
  if (MAP_SAFE) {   // 安全場景（基地）：沒有怪物、沒有黑幕，純走動看場景
    showOverlay((MAP && MAP.name) || '安全區域',
      '這裡是<b>安全區域</b>：<b>沒有怪物</b>，燈也全開著（<b>沒有黑幕</b>）。<br>用 <b>WASD／方向鍵</b>走動，靠近 NPC 或哨兵按 <b>Space／E</b> 可以對話。<br>想回去防守，按上方的<b>地圖選單</b>換一張地圖。',
      '進入');
    return;
  }
  showOverlay('台北地下災害應變中心 · 塔防原型',
    '後室<b>一片漆黑</b>——只有營地和你身上的燈是亮的。<br><b>哨兵已在基地待命</b>：點擊哨兵可下指令（巡邏／指派位置／疏導）。<br>異質體會成群出現在<b>不同的黑暗角落</b>並四處遊蕩；進入感知範圍後會優先追擊哨兵，若被建築擋住就會先破壞建築。<br>放置<b>探照燈</b>與防禦設施控制戰場，在哨兵<b>暴走</b>前記得<b>疏導</b>。破壞所有異質核心並清除異質體即可控制 Y 區。',
    '開始防禦');
}
function winOverlay() { showOverlay('✅ Y 區已控制', '所有異質核心與殘存異質體已清除！異質結晶已儲存，可用於哨兵培養。', '再玩一次'); }
function loseOverlay() { showOverlay('💀 營地失守', '怪物攻進了營地。<br>試試多築牆卡位、提早疏導快暴走的哨兵。', '再挑戰'); }

function begin() { sfx('button'); closeDialogue(true); closeSentryMenu(); closeGroundMenu(); assigning = null; newGame(); G.phase = 'playing'; hideOverlay(); G.running = true; G.betweenWaves = 0.01; }
function win() { G.over = true; G.won = true; G.running = false; G.phase = 'won'; sfx('win'); winOverlay(); }
function lose() { G.over = true; G.running = false; G.phase = 'lost'; sfx('lose'); loseOverlay(); }
ovBtn.addEventListener('click', begin);

// ---- 地圖選單（有兩張以上地圖才顯示；在開始畫面切換要玩哪張）----
const mapPick = document.getElementById('mapPick');
const mapPickRow = document.getElementById('mapPickRow');
if (mapPick && mapPickRow && !PREVIEW && typeof MAPS_DEFAULT !== 'undefined' && MAPS_DEFAULT.length > 1) {
  MAPS_DEFAULT.forEach((m, i) => { const o = document.createElement('option'); o.value = i; o.textContent = m.name || ('地圖 ' + (i + 1)); mapPick.appendChild(o); });
  mapPick.value = MAP_INDEX;
  mapPickRow.classList.remove('hidden');
  mapPick.addEventListener('change', () => {
    switchMap(Number(mapPick.value));   // 換地圖、重算尺寸與路徑
    newGame();                          // 重新佈署哨兵、玩家、鏡頭
    showStart(); draw();                // 回到開始畫面
  });
}

// ---- 啟動遊戲 ----
newGame(); renderBuildBar();
if (PREVIEW) {                 // 從地圖編輯器來的預覽：直接進場，標題列標示是預覽
  const note = document.querySelector('.header-note');
  if (note) note.textContent = '🔍 預覽模式 · ' + ((MAP && MAP.name) || '編輯中的地圖');
  begin();
} else showStart();
requestAnimationFrame(loop);
