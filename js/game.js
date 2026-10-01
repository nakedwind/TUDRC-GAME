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
const PLAYER = CHARACTERS.winter.player;   // 移動速度、碰撞半徑、角色圖尺寸
const PLAYER_CHARACTER = CHARACTERS.winter.id;
const PLAYER_OUTFIT = CHARACTERS.winter.sprite.slice(-1);
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
// 持槍攻擊圖（四個方向各一張靜態圖）；只有這些角色有，避免對其他角色發出 404。
const GUN_FILES = { gunFront: '0000_Front_withgun.png', gunBack: '0009_back_withgun.png', gunLeft: '0003_Leftside_withgun.png', gunRight: '0006_right-side_withgun.png' };
const GUN_FOLDERS = new Set(['theonie_B', 'amber_B', 'eldrin_B', 'chris_B', 'winter_B']);
function loadCharacterSprites(folder) {   // folder 例如 'winter_B'
  const prefix = folder.replace('_', '') + '_';
  const set = {};
  for (const k of Object.keys(CHARACTER_SPRITE_FILES)) {
    set[k] = CHARACTER_SPRITE_FILES[k].map(file => {
      const img = new Image(); img.src = `images/character/${folder}/${prefix}${file}`; return img;
    });
  }
  if (GUN_FOLDERS.has(folder)) {   // 攻擊時用的持槍圖
    for (const k of Object.keys(GUN_FILES)) {
      const img = new Image(); img.src = `images/character/${folder}/${prefix}${GUN_FILES[k]}`; set[k] = [img];
    }
  }
  return set;
}
// ---- 造型切換：安全區穿 A 版、戰鬥區穿 B 版 ----
// 兩套都先準備好，換地圖時再把下面三組精靈圖換成對應的造型。
// 只有一種造型的角色（例如克萊兒、穆恩）就一直用它原本那套。
const OUTFIT_SETS = {};   // 基底名稱（例如 'red'）→ { A, B, declared }
function outfitRecord(folder) {
  const base = String(folder).replace(/_[AB]$/, '');
  const declared = /_(A|B)$/.test(folder) ? folder.slice(-1) : 'B';
  let rec = OUTFIT_SETS[base];
  if (rec) return rec;
  rec = OUTFIT_SETS[base] = { A: null, B: null, declared };
  rec[declared] = loadCharacterSprites(base + '_' + declared);
  const other = declared === 'A' ? 'B' : 'A';
  const probe = new Image();   // 先確認另一套存在再載入，避免對沒有該造型的角色發出一堆 404
  probe.onload = () => { rec[other] = loadCharacterSprites(base + '_' + other); };
  probe.src = `images/character/${base}_${other}/${base}${other}_0000_Front.png`;
  return rec;
}
function outfitSet(folder) {
  const rec = outfitRecord(folder);
  const want = MAP_SAFE ? 'A' : 'B';
  return rec[want] || rec[rec.declared];
}
const playerSprites = {};
const sentrySprites = {};   // 哨兵類型 → 精靈圖（data/balance.js 的 TYPES 有填 sprite 才有）
const wandererSprites = {};
function applyOutfits() {   // 每次開始遊戲／換地圖時呼叫
  Object.assign(playerSprites, outfitSet(`${PLAYER_CHARACTER}_${PLAYER_OUTFIT}`));
  for (const type of Object.keys(TYPES)) if (TYPES[type].sprite) sentrySprites[type] = outfitSet(TYPES[type].sprite);
  for (const profile of WANDERERS) wandererSprites[profile.id] = outfitSet(profile.sprite);
}
applyOutfits();
// 雷德：盾牌造型圖集（redB_*_Shield.png，近戰舉盾時用）＋新斧頭圖（fire_axe_01）
const redAxeImg = new Image(); redAxeImg.src = 'images/weapon/fire_axe_01.png';
const avarenKnifeImg = new Image(); avarenKnifeImg.src = 'images/weapon/military_knife.png';
const lutherAxeImg = new Image(); lutherAxeImg.src = 'images/weapon/fire_axe_02.png';
function loadRedShieldSprites() {
  const set = {};
  for (const k of ['front', 'back', 'left', 'right', 'blink']) {
    set[k] = CHARACTER_SPRITE_FILES[k].map(file => {
      const img = new Image(); img.src = `images/character/red_B/redB_${file.replace('.png', '_Shield.png')}`; return img;
    });
  }
  return set;
}
const redShieldSprites = loadRedShieldSprites();
const ACTIVE_MONSTERS = monsterCatalog(/[?&](preview|previewMonsters)=1(&|$)/.test(location.search));
const monsterImageCache = new Map();
function monsterImage(file) {
  if (!monsterImageCache.has(file)) {
    const image = new Image(); image.src = file;
    monsterImageCache.set(file, image);
  }
  return monsterImageCache.get(file);
}
ACTIVE_MONSTERS.forEach(monster => monsterImage(monster.sprite));
function createMonster(spec, x, y) {
  const legacy = !Array.isArray(MAP?.monsterMix) || !MAP.monsterMix.length;
  const oldRules = legacy && spec.id === 'slime' ? (MAP.rules || {}) : {};
  const hp = spec.hp;   // 血量一律用怪物編輯器（catalog）的設定，不再被地圖舊規則 rules.hp 覆蓋
  return {
    type: spec.id, x, y, hp, maxhp: hp,
    speed: Number(oldRules.speed) || spec.speed,
    reward: oldRules.reward != null ? Number(oldRules.reward) : spec.reward,
    crystals: spec.crystals, playerDamage: spec.playerDamage,
    sentryDamage: spec.sentryDamage, buildingDamage: spec.buildingDamage,
    sprite: spec.sprite, drawWidth: spec.width, drawHeight: spec.height,
    hasTarget: false, wanderWait: Math.random() * .8, slimeClock: Math.random() * 1.83,
  };
}
const ATTACK_EFFECT_KINDS = ['fire', 'lightning', 'slash', 'guidance', 'corrosion', 'impact'];
const attackEffectFrames = Object.fromEntries(ATTACK_EFFECT_KINDS.map(kind => [kind,
  Array.from({ length: 4 }, (_, i) => {
    const img = new Image();
    img.src = `images/Attack%20effects/${kind}/frame_${String(i + 1).padStart(2, '0')}.png`;
    return img;
  })
]));
function playAttackSprite(kind, x, y, duration = .32, angle = 0) {
  if (!G || !attackEffectFrames[kind]) return;
  G.effects.push({ spriteEffect: kind, x, y, angle, life: duration, life0: duration });
}
let lastSlimeLandSound = 0;
function playSlimeAudio(kind, slime = null) {
  if (typeof SFX !== 'undefined' && !SFX.enabled) return;
  if (kind === 'land' && slime && (!G.player || Math.hypot(slime.x - G.player.x, slime.y - G.player.y) > CELL * 15)) return;
  const now = performance.now();
  if (kind === 'land' && now - lastSlimeLandSound < 90) return;
  if (kind === 'land') lastSlimeLandSound = now;
  const audio = new Audio(kind === 'hit' ? 'Sound effects/slime-hit.mp3' : 'Sound effects/slime-land.mp3');
  audio.volume = kind === 'hit' ? .72 : .28;
  audio.play().catch(() => {});
}

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
function interactionNearPlayer() {
  const p = G && G.player; if (!p || p.sitting) return null;
  let best = null, bestDistance = NPC_TALK.radius;
  const actors = [...(G.npcs || []), ...(G.towers || [])];
  for (const actor of actors) {
    if (actor.kind === 'tower' && actor.hp <= 0) continue;
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
  if (who.gunT > 0) {   // 攻擊中：用面向目標的持槍圖（沒有該圖就照常）
    const gunKey = { front: 'gunFront', back: 'gunBack', left: 'gunLeft', right: 'gunRight' }[who.dir || 'front'];
    const g = set[gunKey] && set[gunKey][0];
    if (g && g.complete && g.naturalWidth) return g;
  }
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
const mapTransition = document.getElementById('mapTransition');
let mapTransitioning = false;
const elevatorMenu = document.getElementById('elevatorMenu');
let elevatorMenuOpen = false;
function closeElevatorMenu() { elevatorMenuOpen = false; elevatorMenu.classList.add('hidden'); }
function openElevatorMenu() {
  sfx('menu');
  elevatorMenuOpen = true;
  Object.keys(keys).forEach(key => { keys[key] = false; });
  document.getElementById('elevatorMessage').textContent = '選擇要前往的樓層';
  elevatorMenu.querySelectorAll('[data-floor]').forEach(button => button.classList.remove('sel'));
  elevatorMenu.classList.remove('hidden');
  document.getElementById('elevatorClose').focus();
}
document.getElementById('elevatorClose').addEventListener('click', () => { sfx('switch'); closeElevatorMenu(); });
elevatorMenu.addEventListener('click', e => { if (e.target === elevatorMenu) { sfx('switch'); closeElevatorMenu(); } });
elevatorMenu.querySelectorAll('[data-floor]').forEach(button => button.addEventListener('click', () => {
  sfx('button');
  closeElevatorMenu();
  enterPortal({ to: 'map_mu5ad7t2', elevator: true });
}));
const MOVE_KEYS = ['w', 'a', 's', 'd', 'arrowup', 'arrowleft', 'arrowdown', 'arrowright'];
const anyMoveKey = () => MOVE_KEYS.some(k => keys[k]);
window.addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if (mapTransitioning) {
    if (MOVE_KEYS.includes(k) || isInteractKey(k)) e.preventDefault();
    return;
  }
  if (elevatorMenuOpen) {
    if (k === 'escape') { e.preventDefault(); closeElevatorMenu(); }
    else if (isInteractKey(k) || MOVE_KEYS.includes(k)) e.preventDefault();
    return;
  }
  if (dialogueState) {
    if (k.startsWith('arrow') || k === ' ' || k === 'enter') e.preventDefault();
    if (!e.repeat && (isInteractKey(k) || k === 'enter')) advanceDialogue();
    else if (!e.repeat && k === 'escape') closeDialogue();
    return;
  }
  keys[k] = true;
  if (k.startsWith('arrow') || k === ' ') e.preventDefault();   // 方向鍵／空白鍵不要捲動網頁
  if (!e.repeat && k === 'r' && G && G.running && !G.over && !MAP_SAFE && G.player && G.player.hp > 0) startReload(G.player);   // 手動裝填
  if (npcArrangeMode) return;
  if (!e.repeat && isInteractKey(k) && G && G.running && !G.over) { // 互動鍵：空白鍵 或 E
    const elevator = (G.player && !G.player.sitting) ? elevatorNearPlayer() : null;
    const near = (G.player && !G.player.sitting) ? portalNearPlayer() : null;
    if (elevator) {
      if (elevator.mode === 'closed') { openElevator(elevator.stamp); sfx('door'); }
      else openElevatorMenu();
    }
    else if (near) enterPortal(near.portal);   // 靠近出入口→進入另一張地圖
    else {
      const actor = interactionNearPlayer();
      if (actor?.kind === 'tower' && !MAP_SAFE) soothe(actor);
      else if (actor) openDialogue(actor);
      else toggleSit();                   // 附近沒有角色才判定座位
    }
  }
});
const isInteractKey = k => k === ' ' || k === SIT.key;   // 空白鍵為主，E 也可觸發
// ---- 出入口（走到門旁按 E 進入另一張地圖）----
const PORTAL_RADIUS = 52;   // 離門多近才會出現提示（像素）
const PORTAL_FADE_MS = 500;
const PORTAL_BLACK_MS = 500;
function elevatorNearPlayer() {
  if (!MAP_SAFE || !G.player || !MAP || !MAP.stamps) return null;
  let best = null, bestDistance = 72;
  for (const stamp of MAP.stamps) {
    const tile = mapTileById(stamp.id);
    if (!isElevatorTile(tile)) continue;
    const left = OX + stamp.c * CELL + (stamp.ox || 0), top = OY + stamp.r * CELL + (stamp.oy || 0);
    const x = left + 60, y = top + 140;
    if (stamp === openElevatorStamp) {
      if (playerInsideElevator(stamp)) {
        return { x, top, stamp, mode: 'inside' };
      }
      continue;
    }
    const distance = Math.hypot(x - G.player.x, y - G.player.y);
    if (distance < bestDistance) { bestDistance = distance; best = { x, top, stamp, mode: 'closed' }; }
  }
  return best;
}
function playerInsideElevator(stamp) {
  if (!stamp || !G.player) return false;
  const left = OX + stamp.c * CELL + (stamp.ox || 0), top = OY + stamp.r * CELL + (stamp.oy || 0);
  return G.player.x >= left + 25 && G.player.x <= left + 95 &&
    G.player.y >= top + 55 && G.player.y <= top + 115;
}
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
function placePlayerNearPortal(portal) {
  if (!portal || !G.player) return;
  // 門格可能是牆或門框；優先站在門前，再從近到遠找能容納角色的空位。
  const offsets = [[0, 1], [0, 0], [1, 0], [-1, 0], [0, -1]];
  for (let radius = 2; radius <= 5; radius++) {
    for (let dr = -radius; dr <= radius; dr++) for (let dc = -radius; dc <= radius; dc++) {
      if (Math.max(Math.abs(dc), Math.abs(dr)) === radius) offsets.push([dc, dr]);
    }
  }
  for (const [dc, dr] of offsets) {
    const c = portal.c + dc, r = portal.r + dr;
    if (!inGrid(c, r)) continue;
    const [x, y] = center(c, r);
    if (!playerBlocked(x, y)) { G.player.x = x; G.player.y = y; return; }
  }
}
function enterPortal(pt) {
  if (mapTransitioning) return;
  if (mapIndexById(pt.to) < 0) { flash('目標地圖不存在（可能已被刪除）', G.player.x, G.player.y - 30, '#ff8f8f'); return; }
  const fromId = MAP.id;
  mapTransitioning = true;
  Object.keys(keys).forEach(key => { keys[key] = false; });
  sfx('door');
  requestAnimationFrame(() => {
    mapTransition.classList.add('visible');
    setTimeout(() => {
      setTimeout(() => {
        switchMap(mapIndexById(pt.to));         // 全黑維持半秒後換地圖
        begin(false);                           // 重建並進入遊玩狀態，不播放開始按鈕聲
        const back = returnPortalCell(fromId);  // 落在新地圖「通回原地圖」的門旁
        if (pt.elevator) {
          const stamp = (MAP.stamps || []).find(s => String(mapTileById(s.id)?.file || '').replaceAll('\\', '/').endsWith('/應變中心/elevator.png'));
          if (stamp) {
            const x = OX + (stamp.c + 1.5) * CELL + (stamp.ox || 0);
            const y = OY + (stamp.r + 3.5) * CELL + (stamp.oy || 0);
            if (!playerBlocked(x, y)) { G.player.x = x; G.player.y = y; }
          }
        } else placePlayerNearPortal(back);
        updateCamera(); draw();
        requestAnimationFrame(() => mapTransition.classList.remove('visible'));
        setTimeout(() => { mapTransitioning = false; }, PORTAL_FADE_MS);
      }, PORTAL_BLACK_MS);
    }, PORTAL_FADE_MS);
  });
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

// ---- 地面情境選單：指定格子召喚哨兵 ----
const groundMenu = document.getElementById('groundMenu');
let groundTarget = null;
function closeGroundMenu() {
  groundTarget = null;
  groundMenu.classList.add('hidden');
}
function positionGroundMenu(clientX, clientY) {
  const wrapRect = document.getElementById('wrap').getBoundingClientRect();
  const menuW = groundMenu.offsetWidth, menuH = groundMenu.offsetHeight;
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
function assignSentryToGround(t, guard = false) {
  if (!groundTarget) return;
  const { c, r } = groundTarget, [x, y] = center(c, r);
  if (t.berserk) { sfx('error'); flash(TYPES[t.type].name + '正在暴走，無法指派', x, y, '#ff8f8f'); return; }
  if (!isLit(x, y)) { sfx('error'); flash('巡邏點必須在亮處', x, y, '#ffd24a'); return; }
  if (isWall(c, r) || isEntrance(c, r) || G.grid[c + ',' + r]) { sfx('error'); flash('這裡不能巡邏', x, y, '#ff8f8f'); return; }
  t.mode = 'goto'; t.target = { x, y }; t.anchor = null; t.waitT = 0; t.navPath = null; t.navGoal = null;
  t.guardSummoned = guard;
  t.guardBase = null;
  sfx('button'); flash(TYPES[t.type].name + '：前往巡邏點', t.x, t.y - 24, '#8fd3ff');
  systemNotice(TYPES[t.type].name + '正前往巡邏點');
  closeGroundMenu();
}
function summonNearestSentryToGround() {
  if (!groundTarget) return;
  const { c, r } = groundTarget, [x, y] = center(c, r);
  if (!sentryCellWalkable(c, r)) {
    sfx('error'); flash('此處無法讓哨兵駐守', x, y, '#ff8f8f'); return;
  }
  const choices = G.towers.filter(t => t.hp > 0 && !t.berserk && !TYPES[t.type].guide)
    .map(t => ({ t, path: buildSentryPath(t, x, y) }))
    .filter(choice => choice.path !== null)
    .sort((a, b) => a.path.length - b.path.length ||
      Math.hypot(a.t.x - x, a.t.y - y) - Math.hypot(b.t.x - x, b.t.y - y));
  if (!choices.length) {
    sfx('error'); flash('沒有可到達此處的哨兵', x, y, '#ff8f8f'); return;
  }
  assignSentryToGround(choices[0].t, true);
}
function renderGroundActions() {
  if (!groundTarget) return;
  groundMenu.innerHTML = '';
  addGroundCloseButton();
  const patrol = document.createElement('button');
  patrol.textContent = '📣 召喚哨兵';
  patrol.addEventListener('click', renderGroundSentryChoices);
  groundMenu.appendChild(patrol);
  const nearest = document.createElement('button');
  nearest.className = 'gm-nearest';
  nearest.textContent = '🎯 召喚最近的哨兵至此';
  nearest.addEventListener('click', summonNearestSentryToGround);
  groundMenu.appendChild(nearest);
  if (!groundMenu.classList.contains('hidden')) positionGroundMenu(groundTarget.clientX, groundTarget.clientY);
}
function playerBuildingAt(c, r) {
  return [...G.obstacles].reverse().find(o =>
    o.playerBuilt && c >= o.c && r >= o.r && c < o.c + (o.w || 1) && r < o.r + (o.h || 1)
  ) || null;
}
function demolishPlayerBuilding(o) {
  if (!o || !o.playerBuilt || !G.obstacles.includes(o)) return false;
  const [fx, fy] = center(o.c + ((o.w || 1) - 1) / 2, o.r + ((o.h || 1) - 1) / 2);
  removeBarrier(o);
  for (const t of G.towers) { t.navPath = null; t.navGoal = null; t.navTimer = 0; }
  for (const enemy of G.enemies) { enemy.aiPath = null; enemy.aiGoal = null; enemy.aiRouteTimer = 0; }
  computeFlow();
  sfx('hit'); flash('已拆除', fx, fy - 20, '#ffd479');
  closeGroundMenu(); updateHUD();
  return true;
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
    if (!demolishPlayerBuilding(o)) closeGroundMenu();
  });
  groundMenu.appendChild(demolish);
}
function openBuildingMenu(o, c, r, clientX, clientY) {
  closeBuildMenu(); closeSentryMenu();
  groundTarget = { c, r, obstacle: o };
  renderBuildingActions(o);
  groundMenu.classList.remove('hidden');
  positionGroundMenu(clientX, clientY);
  groundMenu.style.animation = 'none'; void groundMenu.offsetWidth; groundMenu.style.animation = '';
  sfx('menu');
}
function campBaseAt(x, y) {
  return G.obstacles.find(o => {
    if (!o.isBase || o.hp <= 0) return false;
    const left = o.artX ?? OX + o.c * CELL;
    const top = o.artY ?? OY + o.r * CELL;
    return x >= left && x < left + o.w * CELL && y >= top && y < top + o.h * CELL;
  }) || null;
}
function recallSentriesToCamp(base) {
  const centerC = base.c + (base.w - 1) / 2, centerR = base.r + (base.h - 1) / 2;
  const spots = [];
  for (let r = Math.max(0, base.r - 2); r < Math.min(ROWS, base.r + base.h + 2); r++) {
    for (let c = Math.max(0, base.c - 2); c < Math.min(COLS, base.c + base.w + 2); c++) {
      if (sentryCellWalkable(c, r)) spots.push({ c, r });
    }
  }
  const reserved = [];
  let recalled = 0;
  for (const t of G.towers) {
    if (t.hp <= 0 || t.berserk) continue;
    const choices = spots.filter(p => !reserved.some(q => q.c === p.c && q.r === p.r));
    choices.sort((a, b) => {
      const score = p => Math.hypot(p.c - centerC, p.r - centerR) +
        reserved.reduce((penalty, q) => penalty + (Math.hypot(p.c - q.c, p.r - q.r) < 2 ? 8 : 0), 0);
      return score(a) - score(b);
    });
    const spot = choices.find(p => {
      const [x, y] = center(p.c, p.r);
      return buildSentryPath(t, x, y) !== null;
    });
    if (!spot) continue;
    reserved.push(spot);
    const [x, y] = center(spot.c, spot.r);
    t.mode = 'goto'; t.target = { x, y }; t.anchor = null; t.waitT = 0;
    t.guardSummoned = true;
    t.guardBase = base;
    t.navPath = null; t.navGoal = null; t.navTimer = 0; t.navFailed = false;
    recalled++;
  }
  return recalled;
}
// 哨兵是否正待在營地範圍（含周邊 1 格）
function sentryAtBase(t) {
  for (const o of G.obstacles) {
    if (!o.isBase || o.hp <= 0) continue;
    const left = (o.artX ?? OX + o.c * CELL) - CELL, top = (o.artY ?? OY + o.r * CELL) - CELL;
    if (t.x >= left && t.x < left + (o.w + 2) * CELL && t.y >= top && t.y < top + (o.h + 2) * CELL) return o;
  }
  return null;
}
// 污染>85：自動退守營地（找最近可到達的營地旁空格）
function sendSentryRest(t) {
  const base = G.obstacles.find(o => o.isBase && o.hp > 0);
  if (!base) return;
  const centerC = base.c + (base.w - 1) / 2, centerR = base.r + (base.h - 1) / 2;
  let bestSpot = null, bestScore = Infinity;
  for (let r = Math.max(0, base.r - 2); r < Math.min(ROWS, base.r + base.h + 2); r++)
    for (let c = Math.max(0, base.c - 2); c < Math.min(COLS, base.c + base.w + 2); c++) {
      if (!sentryCellWalkable(c, r)) continue;
      const sc = Math.hypot(c - centerC, r - centerR);
      if (sc < bestScore) { const [x, y] = center(c, r); if (buildSentryPath(t, x, y)) { bestScore = sc; bestSpot = { x, y }; } }
    }
  if (!bestSpot) return;
  t.mode = 'goto'; t.target = { x: bestSpot.x, y: bestSpot.y }; t.anchor = null; t.waitT = 0;
  t.guardSummoned = true; t.guardBase = base; t.navPath = null; t.navGoal = null; t.navTimer = 0; t.navFailed = false;
  flash('瀕臨暴走，退守營地', t.x, t.y - 30, '#ffb24d');
}
// 混亂（污染 100）：無差別攻擊最近的任意目標——敵人、其他哨兵、玩家、基地、核心
// 隊友避開腐蝕池：在池內／貼邊時往外推（阿瓦倫本人免疫、不避；混亂中不避）
function avoidAcidPools(t, dt) {
  if (MAP_SAFE || t.type === 'avaren' || t.berserk || t.hp <= 0 || !G.acidPools || !G.acidPools.length) return;
  for (const pool of G.acidPools) {
    const dx = t.x - pool.x, dy = t.y - pool.y, d = Math.hypot(dx, dy) || 1, margin = pool.r + 10;
    if (d >= margin) continue;
    const step = Math.min(margin - d, 130 * dt), nx = t.x + dx / d * step, ny = t.y + dy / d * step;
    const [cc, cr] = cellAt(nx, ny);
    if (sentryCellWalkable(cc, cr)) { t.x = nx; t.y = ny; }
    else { const [ac] = cellAt(nx, t.y); if (sentryCellWalkable(ac, cellAt(t.x, t.y)[1])) t.x = nx; else { const [, br] = cellAt(t.x, ny); if (sentryCellWalkable(cellAt(t.x, t.y)[0], br)) t.y = ny; } }
  }
}
function updateChaosSentry(t, spec, dt) {
  let best = null, bestD = Infinity;   // t.cd 已在呼叫前扣過
  const consider = (o, x, y) => { const d = Math.hypot(x - t.x, y - t.y); if (d < bestD) { bestD = d; best = { o, x, y }; } };
  for (const e of G.enemies) if (!e.dead) consider(e, e.x, e.y);
  for (const o of G.towers) if (o !== t && o.hp > 0) consider(o, o.x, o.y);
  if (G.player && G.player.hp > 0) consider(G.player, G.player.x, G.player.y);
  for (const o of G.obstacles) if (o.isBase && o.hp > 0) consider(o, (o.artX ?? OX + o.c * CELL) + o.w * CELL / 2, (o.artY ?? OY + o.r * CELL) + o.h * CELL / 2);
  for (const c of G.cores) if (!c.dead) consider(c, c.x, c.y);
  if (!best) return;
  const range = spec.range * CELL;
  if (bestD > range * 0.9) {                                   // 走向目標（直線步進、撞牆改走單軸）
    const sp = (spec.walkSpeed || 80) * dt, dx = best.x - t.x, dy = best.y - t.y, d = bestD || 1;
    const nx = t.x + dx / d * sp, ny = t.y + dy / d * sp;
    const [cc, cr] = cellAt(nx, ny);
    if (sentryCellWalkable(cc, cr)) { t.x = nx; t.y = ny; }
    else { const [ac] = cellAt(nx, t.y); if (sentryCellWalkable(ac, cellAt(t.x, t.y)[1])) t.x = nx; else { const [, br] = cellAt(t.x, ny); if (sentryCellWalkable(cellAt(t.x, t.y)[0], br)) t.y = ny; } }
    t.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'back' : 'front');
  } else if (t.cd <= 0) {
    t.cd = 1 / spec.rate;
    applyChaosDamage(t, best, spec);
  }
}
function applyChaosDamage(t, best, spec) {
  const o = best.o, dmg = spec.dmg;
  spawnAttackVisual(t, { x: best.x, y: best.y, hp: 1, maxhp: 1 }, spec, [], { x: best.x, y: best.y });
  if (G.enemies.includes(o)) { o.hp -= dmg; }
  else if (G.cores.includes(o)) { o.hp -= dmg; }
  else if (o === G.player) {
    o.hp = Math.max(0, o.hp - dmg); o.hitT = .3; G.damageVignetteT = Math.max(G.damageVignetteT, .3);
    if (o.hp <= 0 && !G.over) { flash('部隊長失去戰鬥能力', o.x, o.y - 58, '#ff5b6e'); lose(); }
  } else if (o.isBase) {
    o.hp -= dmg; o.hitT = HIT_DUR;
    if (o.hp <= 0) { removeBarrier(o); G.lives = 0; flash('基地被摧毀！', OX + (o.c + o.w / 2) * CELL, OY + o.r * CELL - 18, '#ff5b5b'); if (!G.over) lose(); }
  } else if (G.towers.includes(o)) {   // 攻擊隊友
    const def = Math.max(0, Math.min(.75, (TYPES[o.type] && TYPES[o.type].defense) || 0));
    o.hp = Math.max(0, o.hp - dmg * (1 - def)); o.hitT = Math.max(o.hitT || 0, .16); o.hitColor = '#ff5b5b';
    if (o.hp <= 0) { o.target = null; o.meleeSwing = null; flash('失去戰鬥能力', o.x, o.y - 42, '#ff5b6e'); }
  }
}
function openCampMenu(base, clientX, clientY) {
  closeBuildMenu(); closeSentryMenu();
  groundTarget = null;
  groundMenu.innerHTML = '<div class="gm-title">營地</div>';
  addGroundCloseButton();
  const recall = document.createElement('button');
  recall.textContent = '📣 召回所有哨兵';
  recall.disabled = !G.towers.some(t => t.hp > 0 && !t.berserk);
  recall.addEventListener('click', () => {
    const count = recallSentriesToCamp(base);
    closeGroundMenu();
    const x = (base.artX ?? OX + base.c * CELL) + base.w * CELL / 2;
    const y = (base.artY ?? OY + base.r * CELL) + base.h * CELL / 2;
    sfx(count ? 'button' : 'error');
    flash(count ? `已召回 ${count} 位哨兵守衛營地` : '營地附近沒有可到達的守衛位置',
      x, y - 24, count ? '#7ee0c0' : '#ff8f8f');
  });
  groundMenu.appendChild(recall);
  groundMenu.classList.remove('hidden');
  positionGroundMenu(clientX, clientY);
  groundMenu.style.animation = 'none'; void groundMenu.offsetWidth; groundMenu.style.animation = '';
  sfx('menu');
}
function renderGroundSentryChoices() {
  if (!groundTarget) return;
  groundMenu.innerHTML = '<div class="gm-title">選擇要召喚的哨兵</div>';
  addGroundCloseButton();
  for (const t of G.towers) {
    const b = document.createElement('button');
    b.className = 'gm-sentry';
    const avatar = document.createElement('span'); avatar.className = 'gm-avatar';
    const portrait = sentrySprites[t.type]?.front?.[0];
    if (portrait) { const img = document.createElement('img'); img.src = portrait.src; img.alt = ''; avatar.appendChild(img); }
    const info = document.createElement('span'); info.className = 'gm-sentry-info';
    const name = document.createElement('strong'); name.textContent = TYPES[t.type].name;
    const status = document.createElement('small'); status.textContent = t.berserk ? '混亂中' : (t.taint > 85 ? '瀕臨暴走' : '汙染 ' + Math.round(t.taint));
    info.append(name, status); b.append(avatar, info);
    b.disabled = !!t.berserk;
    b.addEventListener('click', () => assignSentryToGround(t));
    groundMenu.appendChild(b);
  }
  const back = document.createElement('button'); back.textContent = '← 返回';
  back.addEventListener('click', renderGroundActions); groundMenu.appendChild(back);
  positionGroundMenu(groundTarget.clientX, groundTarget.clientY);
}
function openGroundMenu(c, r, clientX, clientY) {
  closeBuildMenu();
  groundTarget = { c, r, clientX, clientY };
  closeSentryMenu();
  renderGroundActions();
  groundMenu.classList.remove('hidden');
  positionGroundMenu(clientX, clientY);
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
  applyOutfits();   // 依這張地圖是安全區或戰鬥區，換成 A／B 造型
  closeElevatorMenu();
  setNpcArrangeMode(false);
  document.getElementById('systemNotices').replaceChildren();
  G = {
    phase: 'ready', money: START.money, lives: START.lives,
    guide: START.guide, guideMax: START.guideMax, guideRegen: START.guideRegen,
    grid: {}, towers: [], npcs: [], obstacles: [], enemies: [], effects: [], acidPools: [], mapDestroyed: new Set(),
    recentMonsterSpawns: [],
    selType: null, waveIndex: 0, waves: buildWaves(),
    spawnQueue: [], spawnTimer: 0, curGap: 0.9, betweenWaves: 0,
    running: false, over: false, won: false, damageVignetteT: 0, cameraShakeT: 0,
  };
  computeFlow();
  seedMapObstacles();   // 把地圖裡預設的「可破壞障礙物」擺上場
  computeFlow();        // 地圖障礙物接管舊固定碰撞後，重算可走路線
  seedCores();
  spawnSentries();      // 三位哨兵開場就在基地（隨機位置）
  spawnWanderers();     // 場景 NPC 只會在亮處自由走動
  const [px, py] = playerSpawnPos();
  G.player = { x: px, y: py, hp: 100, maxhp: 100, hitT: 0, underAttackT: 0, dir: 'front', moving: false, anim: 0, blinkWait: 2 + Math.random() * 3, blinkTime: -1 };
  updateCamera();
  updateHUD();
  updateBuildToggle();
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
  for (let i = 0; i < w.count; i++) G.spawnQueue.push({});
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
  const occByStamp = new Map(), occByCell = new Map();
  for (const it of mapOccluders()) {
    if (it.kind === 'stamp') occByStamp.set(it.stamp, it);
    else if (it.kind === 'cell') occByCell.set(MAP_LAYER_ORDER[it.li] + ':' + it.c + ',' + it.r, it);
  }
  const seats = [];
  function addSeat(s, occ) {
    const cfg = chairConfig(s.id); if (!cfg) return;
    const t = mapTileById(s.id) || {};
    const x0 = s.c * CELL + (s.ox || 0), y0 = s.r * CELL + (s.oy || 0);
    const w = mapTileW(t) * CELL, h = mapTileH(t) * CELL;
    let dir = cfg.seat.dir || 'front';
    if (s.fx && (dir === 'left' || dir === 'right')) dir = dir === 'left' ? 'right' : 'left';   // 椅子翻面→人也跟著翻
    if (s.fy && (dir === 'front' || dir === 'back')) dir = dir === 'front' ? 'back' : 'front';
    seats.push({
      x: x0 + (s.fx ? w - cfg.seat.x : cfg.seat.x),
      y: y0 + (s.fy ? h - cfg.seat.y : cfg.seat.y),
      top: y0, dir, x0, y0, w, h,
      rotation: Number(cfg.seat.rotation) || 0,
      prompt: /bed|床/i.test(s.id) ? '躺' : '坐',
      sortY: occ ? occ.y : y0 + cfg.depth,
    });
  }
  for (const [lid, layer] of Object.entries((MAP && MAP.layers) || {})) {
    for (const [key, id] of Object.entries(layer)) {
      if (!chairConfig(id)) continue;
      const [c, r] = key.split(',').map(Number);
      addSeat({ id, c, r }, occByCell.get(lid + ':' + key));
    }
  }
  for (const s of (MAP && MAP.stamps) || []) addSeat(s, occByStamp.get(s));
  seatCache = seats; seatCacheFor = MAP;
  return seats;
}
function seatNearPlayer() {
  const p = G.player; if (!p) return null;
  let best = null, bd = SIT.radius;
  for (const s of mapSeats()) {
    // 大床中央可能被碰撞格包住；互動距離要從家具外緣算，不能只量床中央。
    const dx = Math.max(s.x0 - p.x, 0, p.x - (s.x0 + s.w));
    const dy = Math.max(s.y0 - p.y, 0, p.y - (s.y0 + s.h));
    const d = Math.hypot(dx, dy);
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
  if (npcArrangeMode) { p.moving = false; p.anim = 0; return; }
  if (p.sitting) {                      // 坐著：不判定碰撞（椅子本來就是不可穿透），按移動鍵才起身
    if (!anyMoveKey()) { p.moving = false; p.anim = 0; updateBlink(p, dt); return; }
    standUp();
  }
  rescueStuck(p, playerBlocked);          // 被卡住時自動移到可走位置，不顯示除錯符號
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

// 安全區域的人物擺位；只保留在本次場景，不改動地圖資料。
let npcArrangeMode = false;
let npcDrag = null;
const npcArrangeToggle = document.getElementById('npcArrangeToggle');
function faceNpcFront(actor) {
  actor.dir = 'front'; actor.moving = false; actor.anim = 0;
}
function finishNpcDrag(cancel = false) {
  if (!npcDrag) return;
  const drag = npcDrag;
  npcDrag = null;
  if (cancel) {
    drag.actor.x = drag.x; drag.actor.y = drag.y;
    drag.actor.npcPosed = drag.wasPosed;
  } else drag.actor.npcPosed = true;
  faceNpcFront(drag.actor);
  if (cv.hasPointerCapture(drag.pointerId)) cv.releasePointerCapture(drag.pointerId);
  cv.classList.remove('npc-dragging');
}
function setNpcArrangeMode(enabled) {
  finishNpcDrag(true);
  npcArrangeMode = !!enabled;
  npcArrangeToggle.textContent = enabled ? '完成擺位' : '移動 NPC';
  npcArrangeToggle.setAttribute('aria-pressed', String(npcArrangeMode));
  npcArrangeToggle.classList.toggle('sel', npcArrangeMode);
  document.getElementById('npcArrangeHint').classList.toggle('hidden', !npcArrangeMode);
  cv.classList.toggle('npc-arranging', npcArrangeMode);
  if (enabled) {
    closeDialogue(); closeGroundMenu(); closeSentryMenu(); assigning = null;
    for (const actor of [...G.npcs, ...G.towers]) faceNpcFront(actor);
  }
}
npcArrangeToggle.addEventListener('click', () => {
  if (MAP_SAFE && G?.running && !G.over) setNpcArrangeMode(!npcArrangeMode);
});
function npcPointerPosition(e) {
  const rect = cv.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) * cv.width / rect.width / VIEW_SCALE + cam.x,
    y: (e.clientY - rect.top) * cv.height / rect.height / VIEW_SCALE + cam.y,
  };
}
// 右鍵＝開選單；左鍵＝確認/放建築/拆除，點空地則開槍（按住連射，朝游標方向）
cv.addEventListener('contextmenu', e => { e.preventDefault(); if (!npcDrag) handleMapClick(e, false); });
cv.addEventListener('mousemove', e => { aimClient = { x: e.clientX, y: e.clientY }; });
cv.addEventListener('mousedown', e => {
  if (e.button !== 0) return;
  aimClient = { x: e.clientX, y: e.clientY };
  if (e.ctrlKey && !MAP_SAFE && G?.running && !G.over && !dialogueState && !elevatorMenuOpen) {
    e.preventDefault();
    closeGroundMenu(); closeSentryMenu();
    aimHeld = true;
    return;
  }
  aimHeld = handleMapClick(e, true);   // 回傳 true（點空地）才開始射擊；開了選單/放建築則不射
});
window.addEventListener('mouseup', e => { if (e.button === 0) aimHeld = false; });
window.addEventListener('blur', () => { aimHeld = false; });
cv.addEventListener('pointerdown', e => {
  if (!npcArrangeMode || !MAP_SAFE || !G.running || G.over || e.button !== 0 || npcDrag) return;
  const p = npcPointerPosition(e);
  const actor = [...G.npcs, ...G.towers].sort((a, b) => b.y - a.y)
    .find(a => Math.abs(a.x - p.x) <= 26 && p.y >= a.y - 48 && p.y <= a.y + 18);
  if (!actor) return;
  e.preventDefault();
  npcDrag = { actor, x: actor.x, y: actor.y, wasPosed: actor.npcPosed,
    dx: actor.x - p.x, dy: actor.y - p.y, pointerId: e.pointerId };
  cv.setPointerCapture(e.pointerId);
  cv.classList.add('npc-dragging');
  faceNpcFront(actor);
});
cv.addEventListener('pointermove', e => {
  if (!npcDrag || npcDrag.pointerId !== e.pointerId) return;
  const p = npcPointerPosition(e), x = p.x + npcDrag.dx, y = p.y + npcDrag.dy;
  if (!sentryBlocked(x, y) && isLit(x, y)) {
    npcDrag.actor.x = x; npcDrag.actor.y = y;
  }
});
cv.addEventListener('pointerup', e => { if (npcDrag?.pointerId === e.pointerId) finishNpcDrag(); });
cv.addEventListener('pointercancel', () => finishNpcDrag(true));
cv.addEventListener('lostpointercapture', () => finishNpcDrag(true));
window.addEventListener('blur', () => finishNpcDrag(true));
window.addEventListener('keydown', e => {
  if (e.key === 'Escape' && npcArrangeMode) setNpcArrangeMode(false);
});

// ---- 輸入：點畫面（放置 / 哨兵選單）----
// 回傳 true＝左鍵點在空地（交給射擊）；其餘情況自行處理並回傳 false。
// 左鍵：確認（指派/放建築/拆除）；右鍵：開召喚選單。營地／哨兵／建築選單左右鍵都可開。
function handleMapClick(e, isLeft) {
  if (npcArrangeMode) return false;
  const rect = cv.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (cv.width / rect.width) / VIEW_SCALE + cam.x;   // 去掉縮放、加上鏡頭＝世界座標
  const y = (e.clientY - rect.top) * (cv.height / rect.height) / VIEW_SCALE + cam.y;
  const [c, r] = cellAt(x, y);
  if (!inGrid(c, r) || !G.running || dialogueState) return false;

  // ── 左鍵確認類動作 ──
  if (isLeft && assigning) {   // 指派巡邏點
    spawnGroundRipple(e.clientX, e.clientY); closeGroundMenu();
    const t = assigning;
    if (!isLit(x, y)) { sfx('error'); flash('要指派在亮處', x, y, '#ffd24a'); return false; }
    if (isWall(c, r) || isEntrance(c, r) || G.grid[c + ',' + r]) { sfx('error'); flash('這裡不能巡邏', x, y, '#ff8f8f'); return false; }
    t.mode = 'goto'; t.guardSummoned = false; t.guardBase = null; t.target = { x, y }; t.anchor = null; t.waitT = 0; t.navPath = null; t.navGoal = null; assigning = null;
    sfx('button'); flash(TYPES[t.type].name + '：前往巡邏點', t.x, t.y - 24, '#8fd3ff'); systemNotice(TYPES[t.type].name + '正前往巡邏點');
    return false;
  }
  if (isLeft && G.selType && G.selType.startsWith('build:')) {   // 放建築
    if (MAP_SAFE) return false;
    closeGroundMenu(); closeSentryMenu(); spawnGroundRipple(e.clientX, e.clientY);
    const ob = buildableById(G.selType.slice(6)); if (ob) placeObstacle(ob, c, r); updateHUD();
    return false;
  }
  if (isLeft && G.selType === 'demolish') {   // 拆除
    const target = playerBuildingAt(c, r);
    if (target) { spawnGroundRipple(e.clientX, e.clientY); demolishPlayerBuilding(target); }
    else { sfx('error'); flash('只能拆除自己建造的建築', x, y - 18, '#ff8f8f'); }
    return false;
  }

  // ── 營地／哨兵／建築選單：左右鍵都可開 ──
  const campBase = !MAP_SAFE && campBaseAt(x, y);
  if (campBase) { openCampMenu(campBase, e.clientX, e.clientY); return false; }
  const hit = G.towers.find(t => sentrySprites[t.type] ? Math.hypot(t.x - x, t.y - 14 - y) <= 28 : Math.hypot(t.x - x, t.y - y) <= 22);
  if (hit) { closeGroundMenu(); openSentryMenu(hit); return false; }
  closeSentryMenu();
  if (MAP_SAFE) { closeGroundMenu(); return false; }
  const clickedBuilding = playerBuildingAt(c, r);
  if (clickedBuilding) { spawnGroundRipple(e.clientX, e.clientY); openBuildingMenu(clickedBuilding, c, r, e.clientX, e.clientY); return false; }
  if (buildAt(c, r) || isWall(c, r) || isEntrance(c, r)) { closeGroundMenu(); return false; }

  // ── 空地：右鍵開召喚選單；左鍵交給射擊 ──
  if (isLeft) return true;
  spawnGroundRipple(e.clientX, e.clientY); openGroundMenu(c, r, e.clientX, e.clientY);
  return false;
}

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
  e.attackingObstacle = o;
  e.atkCd = (e.atkCd || 0) - dt;
  if (e.atkCd > 0) return;
  e.atkCd = BARRIER.breakInterval;
  o.hp -= e.buildingDamage ?? BARRIER.breakDmg;
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
  const damage = (e.sentryDamage ?? 14) * (1 - defense);
  target.hp = Math.max(0, target.hp - damage);
  target.hitT = Math.max(target.hitT || 0, .2);   // 受擊閃紅
  // 擊退：被怪物往外推約 0.6 格（撞牆就不推）
  const dx = target.x - e.x, dy = target.y - e.y, d = Math.hypot(dx, dy) || 1;
  const nx = target.x + dx / d * CELL * 0.6, ny = target.y + dy / d * CELL * 0.6;
  const [cc, cr] = cellAt(nx, ny);
  if (typeof sentryCellWalkable === 'function' && sentryCellWalkable(cc, cr)) { target.x = nx; target.y = ny; target.navPath = null; target.navGoal = null; }
  flash('-' + Math.round(damage), target.x, target.y - 30, '#ff8f8f');
  if (target.hp <= 0) { target.target = null; flash('失去戰鬥能力', target.x, target.y - 42, '#ff5b6e'); }
}
function enemyAttackPlayer(e, dt) {
  const p = G.player;
  if (!p || p.hp <= 0) return;
  if ((e.playerTouchCd || 0) > 0) return;
  e.playerTouchCd = 1;
  const damage = e.playerDamage ?? 12;
  p.hp = Math.max(0, p.hp - damage);
  p.hitT = .45; p.underAttackT = 5; p.lastAttacker = e;
  for (const sentry of G.towers) if (sentry.type === 'red' && sentry.hp > 0 && !sentry.berserk) {
    sentry.cd = Math.min(sentry.cd, .1);
    sentry.navPath = null; sentry.navGoal = null; sentry.navTimer = 0;
  }
  G.damageVignetteT = .45; G.cameraShakeT = .2;
  // 沿史萊姆撞擊方向將玩家推開；若後方是牆或建築，就逐步縮短擊退距離。
  const dx = p.x - e.x, dy = p.y - e.y, distance = Math.hypot(dx, dy) || 1;
  for (let push = 18; push >= 2; push -= 2) {
    const nx = p.x + dx / distance * push, ny = p.y + dy / distance * push;
    if (!playerBlocked(nx, ny)) { p.x = nx; p.y = ny; break; }
    if (!playerBlocked(nx, p.y)) { p.x = nx; break; }
    if (!playerBlocked(p.x, ny)) { p.y = ny; break; }
  }
  flashDmg('-' + damage, p.x, p.y - 46, '#ff6b6b'); addShake(4);   // 玩家被打：彈出傷害＋震動
  playSlimeAudio('hit');
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
function enemyBlocked(x, y) {
  const [c, r] = cellAt(x, y);
  return !inGrid(c, r) || isWall(c, r) || !!barrierAt(c, r);
}
function resetEnemyNavigation(e) {
  e.hasTarget = false; e.baseTarget = null;
  e.aiPath = null; e.aiGoal = null; e.aiRouteKey = null; e.aiRouteTimer = 0;
  e.wanderCell = null;
}
// 擊退與衝撞要逐小步檢查，避免一次跨進基地、牆壁或建築的阻擋格。
function displaceEnemy(e, dx, dy, distance, resetRoute = true) {
  const length = Math.hypot(dx, dy);
  if (!length || distance <= 0) return false;
  const steps = Math.max(1, Math.ceil(distance / 4));
  const sx = dx / length * distance / steps, sy = dy / length * distance / steps;
  let moved = false;
  for (let i = 0; i < steps; i++) {
    const nx = e.x + sx, ny = e.y + sy;
    if (!enemyBlocked(nx, ny)) { e.x = nx; e.y = ny; moved = true; continue; }
    if (!enemyBlocked(nx, e.y)) { e.x = nx; moved = true; continue; }
    if (!enemyBlocked(e.x, ny)) { e.y = ny; moved = true; continue; }
    break;
  }
  if (moved) {
    if (resetRoute) resetEnemyNavigation(e);
    else { e.hasTarget = false; e.baseTarget = null; }
  }
  return moved;
}
function moveEnemyToward(e, target, dt) {
  const dx = target.x - e.x, dy = target.y - e.y, d = Math.hypot(dx, dy) || 1;
  const step = e.speed * dt;
  return displaceEnemy(e, dx, dy, Math.min(step, d), false);
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
  if (e.playerAggroT > 0) e.playerAggroT -= dt;   // 玩家射擊造成的仇恨計時
  e.playerTouchCd = Math.max(0, (e.playerTouchCd || 0) - dt);
  if (e.burnT > 0) {
    e.burnT -= dt; e.burnTick = (e.burnTick || 0) - dt;
    if (e.burnTick <= 0) { e.burnTick += 1; e.hp -= e.burnDmg || 5; flash('燒傷', e.x, e.y - 25, '#ff8a42'); }
  }
  if (e.stunT > 0) e.stunT -= dt;
  if (e.confuseT > 0) e.confuseT -= dt;
}

// 與《苦艾與甘露》一致：完整週期約 1.83 秒，前 62% 騰空移動，落地後壓扁並停住。
const SLIME_JUMP = { total: 1.83, airRatio: .62, height: 14 };
function slimeLerp(a, b, p) { return a + (b - a) * Math.max(0, Math.min(1, p)); }
function updateSlimeJump(e, dt) {
  if (e.slimeClock == null) e.slimeClock = Math.random() * SLIME_JUMP.total;
  const previous = e.slimeClock / SLIME_JUMP.total;
  e.slimeClock = (e.slimeClock + dt) % SLIME_JUMP.total;
  const phase = e.slimeClock / SLIME_JUMP.total;
  if (previous < SLIME_JUMP.airRatio && phase >= SLIME_JUMP.airRatio) playSlimeAudio('land', e);
  if (phase < .35) {
    const p = phase / .35;
    e.slimeLift = slimeLerp(0, 14, p); e.slimeScaleX = slimeLerp(1, .96, p); e.slimeScaleY = slimeLerp(1, 1.07, p);
  } else if (phase < .62) {
    const p = (phase - .35) / .27;
    e.slimeLift = slimeLerp(14, 0, p); e.slimeScaleX = slimeLerp(.96, 1.08, p); e.slimeScaleY = slimeLerp(1.07, .88, p);
  } else if (phase < .78) {
    const p = (phase - .62) / .16;
    e.slimeLift = slimeLerp(0, 1, p); e.slimeScaleX = slimeLerp(1.08, .98, p); e.slimeScaleY = slimeLerp(.88, 1.02, p);
  } else {
    const p = (phase - .78) / .22;
    e.slimeLift = slimeLerp(1, 0, p); e.slimeScaleX = slimeLerp(.98, 1, p); e.slimeScaleY = slimeLerp(1.02, 1, p);
  }
  return phase < SLIME_JUMP.airRatio ? dt / SLIME_JUMP.airRatio : 0;
}

// ---- 打擊感：畫面震動、命中頓格、彈出傷害數字 ----
let shakeAmt = 0, hitstop = 0;
function addShake(a) { shakeAmt = Math.min(16, Math.max(shakeAmt, a)); }
function addHitstop(t) { hitstop = Math.min(0.09, Math.max(hitstop, t)); }
function flashDmg(text, x, y, color) { G.effects.push({ dmg: true, text, x, y, vy: -34, life: 0.7, life0: 0.7, color: color || '#fff' }); }
// 疏導特效：柔和光環＋上升的療癒光點，顏色依施術者（溫特藍／艾德林草綠／克莉思白）
const SOOTHE_COLORS = { winter: [96, 170, 255], eldrin: [128, 222, 112], chris: [238, 246, 255] };
const SOOTHE_AURA_CD = 3;   // 嚮導被動疏導的冷卻秒數
// 大招：平時普攻，冷卻好時放一次（傷害高、範圍大、特效大）
const ULTIMATES = {
  theonie: { cd: 8,  dmgMul: 2.6, splash: 2.2, scale: 1.9, line: '集中火力!' },
  amber:   { cd: 9,  dmgMul: 2.6, splash: 2.4, scale: 1.9, line: '請保持距離!' },
  avaren:  { cd: 10, dmgMul: 2.3, splash: 2.8, scale: 2.0, line: '別礙事' },
  // 近戰大招（大範圍）：red 盾牌衝撞＋回HP回污染、擊退；luther 大範圍重擊＋暈眩、傷害更高
  red:     { cd: 10, dmgMul: 2.2, radius: 2.8, kind: 'bash',  knockback: 1.6, healHp: 40, healTaint: 40, line: '交給我來扛住!' },
  luther:  { cd: 11, dmgMul: 3.0, radius: 3.0, kind: 'smash', knockback: 0.8, stun: 2.5, line: '不准靠近!' },
};
const ULT_SWING = { wind: .6, impact: .8, duration: 1.2 };   // 大招：長前搖→放招→收招
const ULT_CHARGE_COLOR = { theonie: '#ff8a3a', amber: '#aee9ff', avaren: '#b060ff', red: '#bfe0ff', luther: '#ffd0d5' };
function spawnChargeFx(x, y, color) {   // 大招蓄力telegraph：收束的光圈＋漸亮的核心
  G.effects.push({ charge: true, x, y, color, life: ULT_SWING.impact, life0: ULT_SWING.impact });
}
function spawnUltShockwave(x, y, r, color) {   // 近戰大招：大範圍衝擊波（雙圈擴張＋四濺）
  G.effects.push({ ring: true, x, y, r: 10, r2: r, life: .38, life0: .38, color });
  G.effects.push({ ring: true, x, y, r: 5, r2: r * 0.65, life: .26, life0: .26, color });
  for (let i = 0; i < 16; i++) {
    const a = Math.random() * Math.PI * 2, sp = 70 + Math.random() * 130;
    G.effects.push({ particle: true, kind: 'spark', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
      r: 2 + Math.random() * 2.6, life: .2 + Math.random() * .22, life0: .42, color });
  }
}
function spawnSootheEffect(x, y, color, follow) {
  const col = color || SOOTHE_COLORS.winter;
  G.effects.push({ sootheGlow: true, x, y, r0: 10, r1: 52, life: 1.5, life0: 1.5, col, follow, foy: y - (follow ? follow.y : y) });   // 大、久、明顯；可跟隨哨兵
  for (let i = 0; i < 14; i++) {
    const a = -Math.PI / 2 + (Math.random() * 2 - 1) * 1.0, sp = 16 + Math.random() * 30, L = 1.0 + Math.random() * .8;
    G.effects.push({ mote: true, x: x + (Math.random() * 2 - 1) * 18, y: y + (Math.random() * 2 - 1) * 11,
      vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: 2.2 + Math.random() * 2.8, seed: Math.random() * 99, wob: 5 + Math.random() * 7, life: L, life0: L, col });
  }
}
// 火焰命中特效：程式即時繪製（取代 PNG 序列圖）。畫成一叢會扭動竄升的火舌。
function drawFlameShape(ctx, cx, baseY, h, w, tipSway, color) {   // 尖端向上的水滴狀火舌
  const tipX = cx + tipSway, tipY = baseY - h;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx - w / 2, baseY);
  ctx.quadraticCurveTo(cx - w * 0.62, baseY - h * 0.5, tipX, tipY);   // 左側鼓出→尖端
  ctx.quadraticCurveTo(cx + w * 0.62, baseY - h * 0.5, cx + w / 2, baseY);   // 尖端→右側落下
  ctx.quadraticCurveTo(cx, baseY + h * 0.08, cx - w / 2, baseY);      // 圓底
  ctx.closePath();
  ctx.fill();
}
// 雷電命中特效：從上方劈下的鋸齒閃電（帶分岔）＋青白爆閃＋電火花。
function makeBolt(x0, y0, x1, y1, segs, jit) {
  const pts = [[x0, y0]];
  for (let i = 1; i < segs; i++) {
    const t = i / segs, bx = x0 + (x1 - x0) * t, by = y0 + (y1 - y0) * t, j = jit * (1 - t * 0.6);
    pts.push([bx + (Math.random() * 2 - 1) * j, by + (Math.random() * 2 - 1) * j * 0.4]);
  }
  pts.push([x1, y1]);
  return pts;
}
function spawnLightningBolt(x, y, scale = 1) {
  const top = y - (95 + Math.random() * 30) * scale;
  const main = makeBolt(x + (Math.random() * 2 - 1) * 10 * scale, top, x, y, 8, 16 * scale);
  const branches = [];
  for (let b = 0; b < 2 + (scale > 1.5 ? 2 : 0); b++) {   // 大招多幾條分岔
    const i = 2 + Math.floor(Math.random() * (main.length - 4));
    const [bx, by] = main[i];
    branches.push(makeBolt(bx, by, bx + (Math.random() * 2 - 1) * 34 * scale, by + (10 + Math.random() * 22) * scale, 4, 12 * scale));
  }
  G.effects.push({ bolt: true, x, y, main, branches, lw: scale, life: .26, life0: .26 });
  G.effects.push({ ring: true, x, y, r: 5, r2: 30 * scale, life: .2, life0: .2, color: '#bfefff' });   // 命中閃光環
  for (let i = 0; i < Math.round(7 * scale); i++) {                                            // 電火花四濺
    const a = Math.random() * Math.PI * 2, sp = (40 + Math.random() * 80) * scale;
    G.effects.push({ particle: true, kind: 'lightning', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 10,
      r: (2 + Math.random() * 3) * scale, life: .2 + Math.random() * .18, life0: .38, color: '#cbf2ff' });
  }
}
// 近戰命中特效：揮砍弧光（月牙斬）＋迸擊火花。
const SLASH_PALETTES = {
  blue:   { after: '#3f8bff', outer: '#4a9cff', glow: '#6ab4ff', core: '#eef8ff', edge: '#ffffff' },
  purple: { after: '#8a3fff', outer: '#a860ff', glow: '#c77bff', core: '#f1e2ff', edge: '#ffffff' },
};
function spawnMeleeSlash(x, y, angle, heavy, pal) {
  G.effects.push({ slash: true, x, y, angle, heavy, pal: SLASH_PALETTES[pal] || SLASH_PALETTES.blue, life: heavy ? .26 : .2, life0: heavy ? .26 : .2 });
}
function spawnMeleeImpact(x, y, heavy) {
  G.effects.push({ ring: true, x, y, r: 5, r2: heavy ? 34 : 26, life: .2, life0: .2, color: '#dceaff' });
  for (let i = 0; i < (heavy ? 12 : 8); i++) {
    const a = Math.random() * Math.PI * 2, sp = 90 + Math.random() * 110;
    G.effects.push({ particle: true, kind: 'spark', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
      r: 2 + Math.random() * 2.6, life: .18 + Math.random() * .14, life0: .32, color: '#eaf4ff' });
  }
}
// 一團扭曲、濃稠的紫黑霧：由多個不規則裂片組成，會很緩慢地churn扭動；大片、停留久。
function pushCorrosionMist(x, y, vx, vy) {
  const nl = 4 + Math.floor(Math.random() * 4), lobes = [];   // 4~7 片，更不規則
  for (let j = 0; j < nl; j++) lobes.push({
    ox: (Math.random() * 2 - 1) * 16, oy: (Math.random() * 2 - 1) * 16,
    rr: 8 + Math.random() * 9, ph: Math.random() * 6.28, wob: 2 + Math.random() * 4,
    ang: Math.random() * 6.28, sx: 1.1 + Math.random() * 1.2, sy: 0.5 + Math.random() * 0.4   // 拉長的捲鬚
  });
  const L = 1.6 + Math.random() * 1.1;   // 停留更久
  G.effects.push({ cmist: true, x, y, vx, vy, r0: 0.8, rMax: 1.7, lobes, spin: (Math.random() * 2 - 1) * 0.3, life: L, life0: L });
}
// 腐蝕命中特效：濃稠扭曲的紫黑霧＋暗紫液滴，並在地上留下 5 秒的腐蝕痕跡（怪物碰到會扣血）。
function spawnCorrosionSplash(x, y, splash, dmg, scale = 1) {
  const R = (splash > 0 ? Math.min(46 * scale, splash * CELL * 0.9) : 22) * (scale > 1 ? 1.1 : 1);
  // 地上腐蝕痕跡（存活 5 秒，範圍內怪物持續扣血）
  const blobs = [];
  for (let i = 0; i < 4; i++) blobs.push({ dx: (Math.random() * 2 - 1) * R * 0.5, dy: (Math.random() * 2 - 1) * R * 0.35, rr: R * (0.55 + Math.random() * 0.5) });
  (G.acidPools = G.acidPools || []).push({ x, y, r: R, t: 6, t0: 6, dps: Math.max(2, dmg * 0.5), blobs, fizz: 0 });
  // 命中瞬間噴出的紫黑霧（很慢、黏稠、大片）
  for (let i = 0; i < Math.round(9 * scale); i++) {
    const a = -Math.PI / 2 + (Math.random() * 2 - 1) * 1.6, sp = 6 + Math.random() * 14;
    pushCorrosionMist(x + (Math.random() * 2 - 1) * 8, y + (Math.random() * 2 - 1) * 5, Math.cos(a) * sp, Math.sin(a) * sp);
  }
  // 幾滴暗紫液滴
  for (let i = 0; i < 6; i++) {
    const a = -Math.PI / 2 + (Math.random() * 2 - 1) * 1.2, sp = 40 + Math.random() * 70, L = .35 + Math.random() * .3;
    G.effects.push({ cdrop: true, x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
      r: 1.6 + Math.random() * 2.4, life: L, life0: L, col: Math.random() < .5 ? '#55384f' : '#2e1f33' });
  }
}
function spawnFlameBurst(x, y, scale = 1) {
  const L = 0.5, n = scale > 1.5 ? 6 : 4, tongues = [];   // 大招火舌更多
  for (let i = 0; i < n; i++) {
    const center = Math.pow(1 - Math.abs(i - (n - 1) / 2) / ((n - 1) / 2), 1.4);   // 中間主導
    tongues.push({
      dx: ((i - (n - 1) / 2) * 8 + (Math.random() * 2 - 1) * 2.5) * scale,
      h: (32 + center * 44 + Math.random() * 8) * scale,   // 中間明顯高、兩側矮
      w: (16 + center * 14 + Math.random() * 4) * scale,
      phase: Math.random() * Math.PI * 2,
      freq: 11 + Math.random() * 6,
      lean: (Math.random() * 2 - 1) * 7,
    });
  }
  G.effects.push({ flame: true, x, y, tongues, life: L, life0: L });
  G.effects.push({ fglow: true, x, y: y - 14 * scale, r0: 12 * scale, r1: 46 * scale, life: .3, life0: .3 });   // 底層爆閃光暈
  for (let i = 0; i < Math.round(8 * scale); i++) {                                     // 飛散火星
    const a = -Math.PI / 2 + (Math.random() * 2 - 1) * 1.0, sp = (60 + Math.random() * 85) * scale;
    const sl = .3 + Math.random() * .3;
    G.effects.push({ ember: true, spark: true, x, y: y - 6, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
      r: (1.3 + Math.random() * 1.5) * scale, wob: 4 + Math.random() * 6, seed: Math.random() * 99, life: sl, life0: sl });
  }
}
// 玩家（溫特）攻擊：按住左鍵朝游標方向開槍。彈匣 6 發，打完或按 R 裝填；傷害很低、會吸引仇恨。
const PLAYER_ATK = { range: 6, dmg: 3, rate: 5, aggro: 3.5, cone: 0.44, mag: 6, reloadTime: 2 };
let aimHeld = false, aimClient = null;
function clientToWorld(cx, cy) {
  const rect = cv.getBoundingClientRect();
  return { x: (cx - rect.left) * cv.width / rect.width / VIEW_SCALE + cam.x, y: (cy - rect.top) * cv.height / rect.height / VIEW_SCALE + cam.y };
}
function startReload(p) {
  if (!p || p.reloadT > 0 || (p.ammo ?? PLAYER_ATK.mag) >= PLAYER_ATK.mag) return;
  p.reloadT = PLAYER_ATK.reloadTime;
  if (typeof sfx === 'function') sfx('reload');
  flash('裝填中…', p.x, p.y - 46, '#ffd24a');
}
function updatePlayerAttack(dt) {
  const p = G.player;
  if (!p || MAP_SAFE) { updateAmmoHud(); return; }
  if (p.ammo == null) p.ammo = PLAYER_ATK.mag;
  if (p.gunT > 0) p.gunT -= dt;
  if (p.recoilT > 0) p.recoilT -= dt;
  p.atkCd = (p.atkCd || 0) - dt;
  if (aimHeld && p.hp > 0) p.gunT = Math.max(p.gunT, 0.3);   // 按住時持續舉槍，不會射完一發就跳回
  if (p.reloadT > 0) {   // 裝填中
    p.reloadT -= dt;
    if (p.reloadT <= 0) { p.ammo = PLAYER_ATK.mag; }
    updateAmmoHud(); return;
  }
  updateAmmoHud();
  if (p.hp <= 0 || !aimHeld || !aimClient || p.atkCd > 0 || G.over || dialogueState || elevatorMenuOpen) return;
  if (p.ammo <= 0) { startReload(p); return; }   // 空彈匣→自動裝填
  const aim = clientToWorld(aimClient.x, aimClient.y);
  const adx = aim.x - p.x, ady = aim.y - p.y, aimAng = Math.atan2(ady, adx);
  p.atkCd = 1 / PLAYER_ATK.rate;
  p.ammo--;
  p.dir = Math.abs(adx) >= Math.abs(ady) ? (adx < 0 ? 'left' : 'right') : (ady < 0 ? 'back' : 'front');
  p.gunT = 0.45; p.recoilT = 0.12; p.recoilAng = aimAng;   // 持槍姿勢（每發刷新，連射時持續舉槍）＋後座力
  // 朝游標方向、射程內、照亮的最近怪
  let best = null, bestD = PLAYER_ATK.range * CELL;
  for (const e of G.enemies) {
    if (e.dead || !isLit(e.x, e.y)) continue;
    const d = Math.hypot(e.x - p.x, e.y - p.y);
    if (d > PLAYER_ATK.range * CELL) continue;
    let da = Math.abs(Math.atan2(e.y - p.y, e.x - p.x) - aimAng); if (da > Math.PI) da = 2 * Math.PI - da;
    if (da <= PLAYER_ATK.cone && d < bestD) { bestD = d; best = e; }
  }
  const endX = best ? best.x : p.x + Math.cos(aimAng) * PLAYER_ATK.range * CELL;
  const endY = best ? best.y : p.y + Math.sin(aimAng) * PLAYER_ATK.range * CELL;
  let mx = p.x + Math.cos(aimAng) * 15, my = p.y - 8 + Math.sin(aimAng) * 10;
  if (p.dir === 'left') { mx -= 5; my += 5; }
  else if (p.dir === 'right') { mx += 3; my += 5; }
  else if (p.dir === 'back') { my -= 25; }
  G.effects.push({ muzzle: true, x: mx, y: my, ang: aimAng, life: .07, life0: .07 });   // 槍口閃光
  G.effects.push({ bullet: true, x1: mx, y1: my, x2: endX, y2: endY, life: .07, life0: .07, color: '#ffe79a' });   // 子彈曳光（飛向目標）
  if (best) G.effects.push({ ring: true, x: best.x, y: best.y, r: 2, r2: 9, life: .14, life0: .14, color: '#ffe79a' });   // 命中小火花
  if (best) {
    best.hp -= PLAYER_ATK.dmg;
    best.playerAggroT = PLAYER_ATK.aggro;   // 吸引仇恨
    best.hitT = Math.max(best.hitT || 0, .14); best.hitColor = '#bfe0ff';
    flashDmg('-' + PLAYER_ATK.dmg, best.x, best.y - 26, '#bfe0ff');
  }
  if (typeof sfx === 'function') sfx('gunshot');
  if (p.ammo <= 0) startReload(p);   // 打完最後一發→自動裝填
}
// 右下角彈藥數顯示
let ammoHudEl = null;
function updateAmmoHud() {
  if (typeof MAP_SAFE !== 'undefined' && MAP_SAFE) { if (ammoHudEl) ammoHudEl.style.display = 'none'; return; }
  if (!ammoHudEl) {
    ammoHudEl = document.createElement('div');
    ammoHudEl.id = 'ammoHud';
    ammoHudEl.style.cssText = 'position:absolute;right:14px;bottom:14px;z-index:9;font:700 16px sans-serif;color:#dbe7ff;background:rgba(10,14,20,.72);border:1px solid #3a5168;border-radius:8px;padding:6px 14px;pointer-events:none;letter-spacing:1px';
    document.getElementById('wrap').appendChild(ammoHudEl);
  }
  ammoHudEl.style.display = '';
  const p = G.player, mag = PLAYER_ATK.mag, ammo = p ? (p.ammo ?? mag) : mag;
  ammoHudEl.innerHTML = (p && p.reloadT > 0) ? '🔄 裝填中…' : '🔫 ' + ammo + ' / ' + mag;
}
function spawnAttackVisual(attacker, target, spec, affected, impactPoint = target, scale = 1) {
  const kind = spec.ability === '火焰' ? 'flame'
    : spec.ability === '雷電' ? 'lightning'
    : spec.ability === '怪力' || spec.ability === '自癒' ? 'melee'
    : spec.ability === '腐蝕' ? 'corrosion' : 'shot';
  if (attacker) {   // 攻擊時面向目標，並短暫切換成持槍圖（有持槍圖的角色才會顯示）
    const dx = target.x - attacker.x, dy = target.y - attacker.y;
    attacker.dir = Math.abs(dx) >= Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'back' : 'front');
    attacker.gunT = 0.3;
  }
  // 火焰、雷電、近戰改用程式即時繪製；其餘維持原本序列圖／光束
  const proc = kind === 'flame' || kind === 'lightning' || kind === 'melee' || kind === 'corrosion';
  if (kind === 'flame') spawnFlameBurst(impactPoint.x, impactPoint.y + 8, scale);
  else if (kind === 'lightning') spawnLightningBolt(impactPoint.x, impactPoint.y, scale);
  else if (kind === 'melee') spawnMeleeImpact(impactPoint.x, impactPoint.y, spec.splash > 0);
  else if (kind === 'corrosion') spawnCorrosionSplash(impactPoint.x, impactPoint.y, spec.splash, spec.dmg, scale);
  else G.effects.push({ attack: true, kind, x1: attacker.x, y1: attacker.y - 9, x2: target.x, y2: target.y, life: .28, life0: .28, color: spec.color, seed: Math.random() * 1000 });
  const hitTargets = affected && affected.length ? affected : [target];
  for (const enemy of hitTargets) {
    enemy.hitT = Math.max(enemy.hitT || 0, .16);
    enemy.hitColor = spec.color;
  }
  const particleCount = proc ? 0 : 7;
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
  // 依屬性給不同的打擊感：震動強度、命中頓格、衝擊環顏色
  const feel = ({
    flame:     { shake: 3.5, stop: 0,    ring: '#ff8a3a' },   // 希奧妮 火焰：中震、灼燒環
    lightning: { shake: 8,   stop: 0.05, ring: '#fff3a3' },   // 安柏 雷電：強震＋頓格＋亮環
    melee:     { shake: 6.5, stop: 0.05, ring: '#ffd0d5' },   // 雷德／路德 近戰：重擊震＋頓格
    corrosion: { shake: 2.5, stop: 0,    ring: '#b98cff' },   // 阿瓦倫 腐蝕：輕震、紫環
    shot:      { shake: 2.5, stop: 0,    ring: spec.color },
  })[kind] || { shake: 2.5, stop: 0, ring: spec.color };
  if (feel.stop) addHitstop(feel.stop);
  if (!proc) G.effects.push({ ring: true, x: impactPoint.x, y: impactPoint.y, r: 5, r2: (spec.splash > 0 ? spec.splash * CELL + 6 : CELL * 0.85), life: 0.22, life0: 0.22, color: feel.ring });
  for (const enemy of hitTargets) flashDmg('-' + Math.round(spec.dmg * (enemy === target ? 1 : 0.6)), enemy.x, enemy.y - 26, feel.ring);
  if (typeof sfx === 'function') sfx('hit');
}
function stepEnemy(e, dt) {
  e.attackingObstacle = null;
  updateEnemyEffects(e, dt);
  if (e.hp <= 0) return;
  if (enemyBlocked(e.x, e.y)) {
    const safeX = e.lastSafeX, safeY = e.lastSafeY;
    if (Number.isFinite(safeX) && Number.isFinite(safeY) && !enemyBlocked(safeX, safeY)) {
      e.x = safeX; e.y = safeY;
    } else if (!rescueStuck(e, enemyBlocked)) return;
    resetEnemyNavigation(e);
  }
  e.lastSafeX = e.x; e.lastSafeY = e.y;
  // 玩家碰到史萊姆本體就會受傷，與史萊姆目前鎖定誰或正在做什麼無關。
  // 每隻史萊姆各自有 1 秒碰撞冷卻；哨兵仍沿用原本的主動攻擊規則。
  if (G.player && G.player.hp > 0 && Math.hypot(G.player.x - e.x, G.player.y - e.y) <= 30) {
    enemyAttackPlayer(e, dt);
    return;
  }
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
  const playerAggro = !taunter && (e.playerAggroT || 0) > 0 && playerDistance <= ENEMY_SENSE_RANGE;   // 被玩家射擊→優先追玩家
  if ((playerIsImmediate || playerIsMuchCloser || playerAggro) && enemyPursuePlayer(e, playerDistance, moveDt, dt)) return;
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
  const frozen = hitstop > 0; if (frozen) hitstop = Math.max(0, hitstop - dt);   // 命中頓格：短暫凍結戰場
  if (!G.over && !dialogueState && !elevatorMenuOpen && !mapTransitioning && !frozen) updatePlayer(dt);   // 對話或轉場時暫停玩家與戰場
  updateFootsteps();               // 走路腳步聲
  updateCamera();
  if (G.running && !G.over && !dialogueState && !elevatorMenuOpen && !mapTransitioning && !frozen) update(dt);
  if (shakeAmt > 0) shakeAmt = Math.max(0, shakeAmt - dt * 40);   // 畫面震動線性衰減
  draw();
  if (!MAP_SAFE && typeof updateFieldCdRings === 'function') updateFieldCdRings();   // 隊員頭像大招冷卻環
  requestAnimationFrame(loop);
}
function update(dt) {
  updateCores(dt);
  if (G.player) {
    G.player.hitT = Math.max(0, (G.player.hitT || 0) - dt);
    G.player.underAttackT = Math.max(0, (G.player.underAttackT || 0) - dt);
    updatePlayerAttack(dt);   // 玩家自動開槍射擊附近可見的怪物（低傷害、吸引仇恨）
  }
  G.damageVignetteT = Math.max(0, (G.damageVignetteT || 0) - dt);
  G.cameraShakeT = Math.max(0, (G.cameraShakeT || 0) - dt);
  G.guide = Math.min(G.guideMax, G.guide + G.guideRegen * dt);
  // 生怪
  if (G.spawnQueue.length > 0) {
    G.spawnTimer -= dt;
    if (G.spawnTimer <= 0) {
      const cells = spawnCells();   // 地圖的「入口」格（沒設定就用最上排）
      if (cells.length) {
        G.spawnQueue.shift();
        const [sc, sr] = cells[Math.floor(Math.random() * cells.length)];
        const [sx, sy] = center(sc, sr);
        G.enemies.push(createMonster(chooseMonster(MAP, ACTIVE_MONSTERS), sx, sy));
      }
      G.spawnTimer = G.curGap;
    }
  }
  // 怪物移動
  for (const e of G.enemies) stepEnemy(e, dt);
  for (const e of G.enemies) { if (e.reached) { G.lives--; e.dead = true; } }
  // 雷德：偵測最近怪物，3 格內進入「舉盾衝撞」模式（供移動衝刺、撞擊、繪製共用）
  for (const t of G.towers) {
    if (t.type !== 'red') continue;
    let nd = Infinity, near = null;
    if (!MAP_SAFE && !t.berserk && t.hp > 0) for (const e of G.enemies) { if (e.dead) continue; const d = Math.hypot(e.x - t.x, e.y - t.y); if (d < nd) { nd = d; near = e; } }
    t.shieldMode = nd <= 3 * CELL;
    t.ramTarget = t.shieldMode ? near : null;
    t.nearestEnemyDist = nd;
    if (t.ramCd > 0) t.ramCd -= dt;
  }
  // 哨兵走動（巡邏）
  for (const t of G.towers) {
    const ox = t.x, oy = t.y;
    if (MAP_SAFE && (npcArrangeMode || t.npcPosed)) faceNpcFront(t);
    else if ((!t.meleeSwing && !t.gunSwing) || t.hp <= 0 || t.berserk) updateSentry(t, dt);
    avoidAcidPools(t, dt);   // 被腐蝕池推開（阿瓦倫本人免疫、不避）
    animateSentry(t, t.x - ox, t.y - oy, dt);
  }
  // 雷德衝撞：舉盾模式下撞到怪物 → 擊退＋少量傷害（有冷卻，避免連續觸發）
  for (const t of G.towers) {
    if (t.type !== 'red' || !t.shieldMode || t.ramCd > 0 || t.hp <= 0 || t.berserk) continue;
    const foe = t.ramTarget;
    if (foe && !foe.dead && Math.hypot(foe.x - t.x, foe.y - t.y) <= CELL * 1.1) {
      const spec = TYPES.red, ramDmg = Math.max(1, Math.round(spec.dmg * 0.4));
      foe.hp -= ramDmg;
      const dx = foe.x - t.x, dy = foe.y - t.y;
      displaceEnemy(foe, dx, dy, CELL * 1.2);
      foe.hitT = Math.max(foe.hitT || 0, .16); foe.hitColor = '#dbe7ff';
      flashDmg('-' + ramDmg, foe.x, foe.y - 26, '#dbe7ff');
      G.effects.push({ ring: true, x: foe.x, y: foe.y, r: 5, r2: 24, life: .2, life0: .2, color: '#dbe7ff' });
      if (typeof sfx === 'function') sfx('hit');
      t.ramCd = 1.4;
    }
  }
  for (const npc of G.npcs) {
    const ox = npc.x, oy = npc.y;
    if (MAP_SAFE && (npcArrangeMode || npc.npcPosed)) faceNpcFront(npc);
    else updateWanderer(npc, dt);
    animateSentry(npc, npc.x - ox, npc.y - oy, dt);
  }
  // 哨兵攻擊
  for (const t of G.towers) {
    const spec = TYPES[t.type];
    if (t.hp <= 0) { t.meleeSwing = null; t.gunSwing = null; continue; }
    if (t.gunT > 0) t.gunT -= dt;   // 持槍攻擊圖計時
    if (t.hitT > 0) t.hitT -= dt;   // 受擊閃紅計時
    if (t.ultCd > 0) t.ultCd -= dt;   // 大招冷卻
    if (spec.hpRegen) t.hp = Math.min(t.maxhp, t.hp + spec.hpRegen * dt);
    if (sentryAtBase(t)) t.hp = Math.min(t.maxhp, t.hp + (10 / 60) * dt);   // 在營地緩慢回 HP（1分鐘+10），污染不恢復
    if (spec.taintRegen && !t.berserk) t.taint = Math.max(0, t.taint - spec.taintRegen * dt);
    if (!t.berserk && !TYPES[t.type].guide && t.taint > 85) {   // 瀕臨暴走：自動退守營地（觸發一次）
      if (!t.resting) { t.resting = true; sendSentryRest(t); }
    } else if (t.taint <= 80) t.resting = false;
    if (spec.aura && !t.berserk) {   // 嚮導隨身疏導：改成「冷卻一到就一次清一批」，不再每幀連續疏導
      t.auraCd = Math.max(0, (t.auraCd || 0) - dt);
      if (t.auraCd <= 0) {
        const AURA_CD = SOOTHE_AURA_CD, sc = SOOTHE_COLORS[t.type] || SOOTHE_COLORS.eldrin;
        let did = false;
        for (const o of G.towers) {
          if (o === t || o.hp <= 0 || TYPES[o.type].guide || Math.hypot(o.x - t.x, o.y - t.y) > spec.aura.r * CELL) continue;
          if ((o.taint || 0) <= 0 && o.hp >= o.maxhp && !o.berserk) continue;   // 不需要疏導就跳過
          o.taint = Math.max(0, (o.taint || 0) - spec.aura.rate * AURA_CD);      // 一次清一批（平均速率不變）
          o.hp = Math.min(o.maxhp, o.hp + (spec.aura.heal || 0) * AURA_CD);
          if (o.berserk && o.taint < 60) o.berserk = false;
          spawnSootheEffect(o.x, o.y - 8, sc, o);
          G.effects.push({ support: true, x1: t.x, y1: t.y - 8, x2: o.x, y2: o.y - 8, life: .5, life0: .5, color: `rgb(${sc[0]},${sc[1]},${sc[2]})` });
          did = true;
        }
        if (did) t.auraCd = AURA_CD;
      }
    }
    t.cd -= dt;
    let swingTarget = null;
    if (t.berserk) { t.meleeSwing = null; t.gunSwing = null; updateChaosSentry(t, spec, dt); continue; }   // 混亂：無差別攻擊
    if (t.meleeSwing) {
      const swing = t.meleeSwing;
      swing.age += dt;
      if (!swing.slashFx && swing.age >= swing.wind && !(swing.ult && ULTIMATES[t.type] && ULTIMATES[t.type].radius)) {   // 近戰大招用衝擊波，不噴小月牙
        swing.slashFx = true;
        const slashAng = Math.atan2(Math.sin(swing.angle) + 1.1, Math.cos(swing.angle));   // 偏向下前方（配合往下劈）
        spawnMeleeSlash(t.x + Math.cos(swing.angle) * 20, t.y - 6 + Math.sin(swing.angle) * 16, slashAng, t.type === 'luther', t.type === 'avaren' ? 'purple' : 'blue');
      }
      if (!swing.hit && swing.age >= swing.impact) {
        swing.hit = true;
        const foe = swing.target;
        if (foe && !foe.dead && foe.hp > 0 && Math.hypot(foe.x - t.x, foe.y - t.y) <= spec.range * CELL + 12) swingTarget = foe;
      }
      if (swing.age >= swing.duration) t.meleeSwing = null;
      if (!swingTarget) continue;
    } else if (t.gunSwing) {   // 開槍：瞄準(前搖) → 開火(命中) → 收招
      const sw = t.gunSwing;
      sw.age += dt;
      t.gunT = Math.max(t.gunT || 0, .08);   // 整段都舉槍
      if (!sw.fired && sw.age >= sw.impact) {
        sw.fired = true;
        const foe = sw.target;
        if (foe && !foe.dead && foe.hp > 0 && Math.hypot(foe.x - t.x, foe.y - t.y) <= spec.range * CELL + 12) swingTarget = foe;
      }
      if (sw.age >= sw.duration) t.gunSwing = null;
      if (!swingTarget) continue;
    } else if (t.cd > 0) continue;
    const R = spec.range * CELL;
    let target = swingTarget, bestY = -1, bestDistance = Infinity;
    if (!target) target = t.mode === 'goto' ? null : campAttackerFor(t, R);
    const attacker = !target && t.type === 'red' ? redAttacker() : null;
    if (attacker && Math.hypot(attacker.x - t.x, attacker.y - t.y) <= R) target = attacker;
    if (!target) {
      for (const e of (t.guardSummoned ? G.enemies : [...G.enemies, ...G.cores])) {
        if (e.dead) continue;
        const distance = Math.hypot(e.x - t.x, e.y - t.y);
        if (distance <= R && (t.guardSummoned ? distance < bestDistance : e.y > bestY)) {
          target = e; bestY = e.y; bestDistance = distance;
        }
      }
    }
    if (target) {
      if (!swingTarget) t.cd = 1 / (spec.rate * (t.taint > 85 && !t.berserk ? 0.5 : 1));   // 瀕臨暴走：攻速減半
      if ((t.type === 'red' || t.type === 'luther' || t.type === 'avaren') && !swingTarget) {
        const heavy = t.type === 'luther', dx = target.x - t.x, dy = target.y - t.y;
        t.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'back' : 'front');
        const isUlt = !!(ULTIMATES[t.type] && (t.ultCd || 0) <= 0);
        if (isUlt) { t.ultCd = ULTIMATES[t.type].cd; t.say = { text: ULTIMATES[t.type].line, life: 2.5 }; spawnChargeFx(t.x, t.y - 8, ULT_CHARGE_COLOR[t.type]); }
        const sw = isUlt ? ULT_SWING : { wind: heavy ? .29 : .19, impact: heavy ? .43 : .30, duration: heavy ? .78 : .58 };
        t.meleeSwing = { target, angle: Math.atan2(dy, dx), age: 0, wind: sw.wind, impact: sw.impact, duration: sw.duration, hit: false, ult: isUlt };
        t.moving = false;
        continue;
      }
      if (GUN_FOLDERS.has(spec.sprite) && !swingTarget) {   // 開槍角色：先瞄準再開火（前搖→命中→收招）
        const dx = target.x - t.x, dy = target.y - t.y;
        t.dir = Math.abs(dx) >= Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'back' : 'front');
        const isUlt = !!(ULTIMATES[t.type] && (t.ultCd || 0) <= 0);
        if (isUlt) { t.ultCd = ULTIMATES[t.type].cd; t.say = { text: ULTIMATES[t.type].line, life: 2.5 }; spawnChargeFx(t.x, t.y - 8, ULT_CHARGE_COLOR[t.type]); }
        const sw = isUlt ? ULT_SWING : { wind: .14, impact: .21, duration: .4 };
        t.gunSwing = { target, angle: Math.atan2(dy, dx), age: 0, wind: sw.wind, impact: sw.impact, duration: sw.duration, fired: false, ult: isUlt };
        t.gunT = sw.duration; t.moving = false;
        continue;
      }
      const U = ((t.gunSwing && t.gunSwing.ult) || (t.meleeSwing && t.meleeSwing.ult)) ? ULTIMATES[t.type] : null;   // 大招（在揮擊啟動時已決定）
      if (U && U.radius) {   // 近戰大招：大範圍（紅＝盾牌衝撞＋回復；路德＝重擊＋暈眩）
        const r = U.radius * CELL, dmg = spec.dmg * U.dmgMul, col = U.kind === 'bash' ? '#bfe0ff' : '#ffd0d5';
        for (const e of G.enemies) {
          if (e.dead || Math.hypot(e.x - t.x, e.y - t.y) > r) continue;
          e.hp -= dmg;
          if (U.knockback) { const dx = e.x - t.x, dy = e.y - t.y; displaceEnemy(e, dx, dy, CELL * U.knockback); }
          if (U.stun) e.stunT = Math.max(e.stunT || 0, U.stun);
          e.hitT = Math.max(e.hitT || 0, .2); e.hitColor = col;
          flashDmg('-' + Math.round(dmg), e.x, e.y - 26, col);
        }
        if (U.healHp) { t.hp = Math.min(t.maxhp, t.hp + U.healHp); flashDmg('+' + U.healHp, t.x, t.y - 40, '#7ee0a0'); }
        if (U.healTaint) t.taint = Math.max(0, t.taint - U.healTaint);
        spawnUltShockwave(t.x, t.y, r, col);
        if (typeof sfx === 'function') sfx('hit');
      } else if (Math.random() < spec.accuracy) {
        const impactPoint = { x: target.x, y: target.y };
        const atkDmg = spec.dmg * (U ? U.dmgMul : 1), atkSplash = U ? U.splash : spec.splash;
        target.hp -= atkDmg;
        const affected = target.maxhp && G.enemies.includes(target) ? [target] : [];
        if (atkSplash > 0) for (const e of G.enemies) if (e !== target && !e.dead && Math.hypot(e.x - target.x, e.y - target.y) <= atkSplash * CELL) { e.hp -= atkDmg * .6; affected.push(e); }
        for (const e of affected) {
          if (spec.burn) { e.burnT=spec.burn.duration; e.burnDmg=spec.burn.damage; e.burnTick=1; }
          if (spec.stun) e.stunT=Math.max(e.stunT||0,spec.stun);
          if (spec.confuse) e.confuseT=Math.max(e.confuseT||0,spec.confuse);
          if (spec.knockback) {
            const dx=e.x-t.x,dy=e.y-t.y;
            displaceEnemy(e,dx,dy,CELL*spec.knockback);
          }
        }
        spawnAttackVisual(t, target, U ? { ...spec, dmg: atkDmg, splash: atkSplash } : spec, affected, impactPoint, U ? U.scale : 1);
      } else flash('MISS', t.x, t.y - 26, '#9aa4b2');
      if (!spec.guide) t.taint = Math.min(100, t.taint + spec.taint);
      if (t.taint >= 100 && !t.berserk) { t.berserk = true; sfx('berserk'); flash('混亂!', t.x, t.y - 30, '#ff4d4d'); systemNotice(TYPES[t.type].name + '污染達到極限，陷入混亂，開始無差別攻擊！', true); }
    }
  }
  // 地上腐蝕痕跡：計時、範圍內怪物持續扣血、偶爾冒紫黑霧
  if (G.acidPools && G.acidPools.length) {
    for (const pool of G.acidPools) {
      pool.t -= dt;
      const dmgAmt = pool.dps * dt;
      for (const e of G.enemies) {
        if (e.dead) continue;
        if (Math.hypot(e.x - pool.x, e.y - pool.y) <= pool.r) {
          e.hp -= dmgAmt;
          e.hitT = Math.max(e.hitT || 0, .12); e.hitColor = '#b060ff';
        }
      }
      // 隊友也會被腐蝕：哨兵（依防禦減免，歸 0 失去戰鬥能力）。阿瓦倫本人對自己的腐蝕免疫。
      for (const t of G.towers) {
        if (t.hp <= 0 || t.berserk || t.type === 'avaren') continue;
        if (Math.hypot(t.x - pool.x, t.y - pool.y) <= pool.r) {
          const def = Math.max(0, Math.min(.75, (TYPES[t.type] && TYPES[t.type].defense) || 0));
          t.hp = Math.max(0, t.hp - dmgAmt * (1 - def));
          t.hitT = Math.max(t.hitT || 0, .12); t.hitColor = '#b060ff';
          if (t.hp <= 0) { t.target = null; flash('失去戰鬥能力', t.x, t.y - 42, '#ff5b6e'); }
        }
      }
      // 玩家（溫特）
      const p = G.player;
      if (p && p.hp > 0 && Math.hypot(p.x - pool.x, p.y - pool.y) <= pool.r) {
        p.hp = Math.max(0, p.hp - dmgAmt);
        p.hitT = Math.max(p.hitT || 0, .2); G.damageVignetteT = Math.max(G.damageVignetteT, .3);
        if (p.hp <= 0 && !G.over) { flash('部隊長失去戰鬥能力', p.x, p.y - 58, '#ff5b6e'); lose(); }
      }
      pool.fizz -= dt;
      if (pool.fizz <= 0 && pool.t > .4) {   // 痕跡上緩緩冒濃霧
        pool.fizz = .35 + Math.random() * .35;
        const ang = Math.random() * Math.PI * 2, rr = Math.random() * pool.r * 0.8;
        pushCorrosionMist(pool.x + Math.cos(ang) * rr, pool.y + Math.sin(ang) * rr, (Math.random() * 2 - 1) * 5, -4 - Math.random() * 6);
      }
    }
    G.acidPools = G.acidPools.filter(p => p.t > 0);
  }
  for (const e of G.enemies) { if (e.hp <= 0 && !e.dead) { e.dead = true; G.money += e.reward; earnCrystals(e.crystals ?? 3); sfx('kill'); } }
  for (const core of G.cores) if(core.hp<=0 && !core.dead) {
    core.dead=true; earnCrystals(core.reward); flash('異質核心已摧毀 +'+core.reward+' 結晶',core.x,core.y,'#d69bff'); systemNotice('異質核心已摧毀，獲得 ' + core.reward + ' 結晶');
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
    } else if (f.ember) {   // 火焰粒子：往上竄、浮力持續、水平減速
      f.x += f.vx * dt; f.y += f.vy * dt;
      f.vy -= (f.spark ? 8 : 26) * dt;
      f.vx *= (1 - 1.6 * dt);
    } else if (f.cdrop) {   // 腐蝕液滴：噴出後受重力灑落
      f.x += f.vx * dt; f.y += f.vy * dt;
      f.vy += 190 * dt;
      f.vx *= (1 - 1.2 * dt);
    } else if (f.cmist) {   // 腐蝕紫黑霧：黏稠——移動極慢、強阻力很快就停住
      f.x += f.vx * dt; f.y += f.vy * dt;
      f.vy -= 2.5 * dt;
      f.vx *= (1 - 4.2 * dt); f.vy *= (1 - 3.8 * dt);
    } else if (f.mote) {    // 疏導光點：緩緩上飄、減速
      f.x += f.vx * dt; f.y += f.vy * dt;
      f.vy -= 8 * dt;
      f.vx *= (1 - 1.5 * dt); f.vy *= (1 - 1.2 * dt);
    } else if (f.sootheGlow && f.follow) {   // 疏導光環：跟著被疏導的哨兵移動
      f.x = f.follow.x; f.y = f.follow.y + (f.foy || -8);
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
function systemNotice(text, warning = false) {
  const list = document.getElementById('systemNotices');
  if (!list) return;
  const item = document.createElement('div');
  item.className = 'system-notice' + (warning ? ' warning' : '');
  item.textContent = text;
  list.prepend(item);
  while (list.children.length > 3) list.lastElementChild.remove();
  setTimeout(() => { item.classList.add('leaving'); setTimeout(() => item.remove(), 300); }, 3800);
}

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
  if (!o.isBase && !o.mapSource) {
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
    const barX = x + (w - barW) / 2, barY = y + 8;
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
// 開槍後座位移：前搖微微前傾瞄準 → 開火往後踢 → 收招回正。回傳 -1(後)～+0.3(前)
function gunSwingOffset(s) {
  if (s.age < s.wind) return 0.3 * (s.age / s.wind);
  if (s.age < s.impact) return 0.3;
  if (s.age < s.impact + .07) return 0.3 - 1.3 * ((s.age - s.impact) / .07);
  const u = Math.min(1, (s.age - s.impact - .07) / (s.duration - s.impact - .07));
  return -1 + u;
}
function meleeSwingAngle(s) {
  // 角度＝斧頭方向（已鏡像的座標系）：-π/2 朝上、0 朝前、+π/2 朝下。過頭劈：上後方→前下方。
  const REST = -0.5, BACK = -2.15, CHOP = 0.8, OVER = 1.0;
  if (s.age < s.wind) {                                   // 舉斧過頭蓄力（ease-out）
    const u = s.age / s.wind, e = 1 - (1 - u) * (1 - u);
    return REST + (BACK - REST) * e;
  }
  if (s.age < s.impact) {                                 // 往下劈（ease-in 加速，才有力道）
    const u = (s.age - s.wind) / (s.impact - s.wind), e = u * u;
    return BACK + (CHOP - BACK) * e;
  }
  if (s.age < s.impact + .06) {                           // 命中過衝一下
    const u = (s.age - s.impact) / .06;
    return CHOP + (OVER - CHOP) * Math.sin(u * Math.PI);
  }
  const u = Math.min(1, (s.age - s.impact - .06) / (s.duration - s.impact - .06));   // 收招回正
  return CHOP + (REST - CHOP) * (1 - (1 - u) * (1 - u));
}
function drawSwingWeapon(t, img, w, h, arm) {   // 揮擊時才出現的武器圖（過頭揮，沿弧線往外）
  const s = t.meleeSwing;
  if (!s || !img.complete || !img.naturalWidth) return;
  const fx = Math.cos(s.angle) >= 0 ? 1 : -1, sweep = meleeSwingAngle(s);
  ctx.save();
  ctx.translate(t.x + fx * 4, t.y - 14);   // 肩膀支點（揮擊弧線中心）
  ctx.scale(fx, 1);
  ctx.rotate(sweep + Math.PI / 2);   // 讓圖中朝上的武器對齊揮砍方向
  ctx.translate(0, -arm);            // 沿弧線往外推，離身體遠一點
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, -w / 2, -h, w, h);
  ctx.restore();
}
function drawFireAxe(t) {
  if (MAP_SAFE || t.hp <= 0 || t.berserk) return;
  if (t.type === 'red') { if (!(t.meleeSwing && t.meleeSwing.ult)) drawSwingWeapon(t, redAxeImg, 21, 32, 22); return; }   // 雷德：fire_axe_01（大招用盾衝撞，不拿斧）
  if (t.type === 'avaren') { drawSwingWeapon(t, avarenKnifeImg, 9, 29, 20); return; }  // 阿瓦倫：military_knife
  if (t.type === 'luther') { drawSwingWeapon(t, lutherAxeImg, 28, 46, 26); return; }   // 路德：fire_axe_02（攻擊時才出現）
}
function sentryRedFlash(t) {   // 回傳紅閃強度 0~1：受擊閃一下、瀕臨暴走慢脈動、暴走快脈動
  if (t.hp <= 0) return 0;
  const hit = t.hitT > 0 ? Math.min(1, t.hitT / .2) * 0.9 : 0;   // 受擊閃紅
  if (MAP_SAFE) return hit;
  const now = performance.now() / 1000;
  if (t.berserk) return Math.max(hit, (Math.sin(now * Math.PI * 2 * 3) + 1) / 2);                                       // 暴走：快閃（約 3Hz）
  if (!TYPES[t.type].guide && t.taint > 85) return Math.max(hit, (Math.sin(now * Math.PI * 2 * 0.8) + 1) / 2 * 0.85);   // 瀕臨暴走：慢閃
  return hit;
}
function drawTower(t) {
  const spec = TYPES[t.type];
  let set = sentrySprites[t.type];
  if (t.type === 'red' && t.shieldMode && !MAP_SAFE && !t.berserk && redShieldSprites.front) set = redShieldSprites;   // 舉盾造型
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
    ctx.save();
    if (t.meleeSwing) {
      const s = t.meleeSwing;
      let lunge;   // -1 後仰蓄力 → +1 前傾撲擊
      if (s.age < s.wind) lunge = -Math.sin(s.age / s.wind * Math.PI / 2) * .65;
      else if (s.age < s.impact) { const u = (s.age - s.wind) / (s.impact - s.wind); lunge = -.65 + 1.65 * u * u; }
      else { const u = Math.min(1, (s.age - s.impact) / (s.duration - s.impact)); lunge = 1 * (1 - u * u); }
      const dx = Math.cos(s.angle), dy = Math.sin(s.angle);
      ctx.translate(t.x + dx * lunge * 6, t.y + dy * lunge * 4);
      ctx.rotate(dx * lunge * .16); ctx.translate(-t.x, -t.y);
    } else if (t.gunSwing) {   // 開槍後座：沿瞄準方向前傾→後踢→回正
      const off = gunSwingOffset(t.gunSwing), dx = Math.cos(t.gunSwing.angle), dy = Math.sin(t.gunSwing.angle);
      ctx.translate(dx * off * 4, dy * off * 4);
    }
    ctx.drawImage(img, t.x - size / 2 + shX, t.y - size + 18, size, size);
    const redFlash = sentryRedFlash(t);   // 瀕臨暴走慢閃紅、暴走快閃紅
    if (redFlash > 0.01) {
      ctx.globalAlpha = redFlash * 0.6;
      ctx.filter = 'sepia(1) saturate(7) hue-rotate(-30deg) brightness(1.1)';
      ctx.drawImage(img, t.x - size / 2 + shX, t.y - size + 18, size, size);
      ctx.filter = 'none'; ctx.globalAlpha = 1;
    }
    ctx.restore();
    ctx.imageSmoothingEnabled = true;
  } else {
    ctx.fillStyle = t.berserk ? '#5a1f27' : spec.color; roundRect(t.x - 17, t.y - 17, 34, 34, 6); ctx.fill();
  }

  drawFireAxe(t);
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
  if (t.berserk) { ctx.fillStyle = '#ff4d4d'; ctx.font = 'bold 10px sans-serif'; ctx.fillText('混亂', t.x, nameY - 14); }
  else if (t.taint > 85) { ctx.fillStyle = '#ffb24d'; ctx.font = 'bold 10px sans-serif'; ctx.fillText('瀕臨暴走', t.x, nameY - 14); }
  if (t.say && t.say.text && !t.berserk) drawSpeechBubble(t.x, nameY - 13, t.say.text, BUBBLE_COLORS[t.type]);   // 哨兵對話泡泡
}
// ---- 堤諾的異能力「感知」----
// 帶著堤諾出勤時，他周圍一定範圍內、位於黑暗中的怪物會以輪廓標示出來。
// 這是「只有玩家看得見」的情報：哨兵的索敵仍然只看亮處，所以不影響戰鬥判定。
function sensedEnemies() {
  if (!LIGHT.enabled || !G || !G.enemies.length) return [];
  const eyes = (G.towers || []).filter(t => (TYPES[t.type] || {}).sense && t.hp > 0 && !t.berserk);
  if (!eyes.length) return [];
  return G.enemies.filter(e => !e.dead && !isLit(e.x, e.y)
    && eyes.some(t => Math.hypot(e.x - t.x, e.y - t.y) <= TYPES[t.type].sense * CELL));
}
function drawSensedEnemies() {
  const list = sensedEnemies();
  if (!list.length) return;
  const pulse = .55 + .25 * Math.sin(performance.now() / 260);
  ctx.save();
  for (const e of list) {
    ctx.globalAlpha = pulse;
    ctx.strokeStyle = '#f0a63c'; ctx.lineWidth = 1.5;                   // 堤諾的代表色
    ctx.beginPath(); ctx.ellipse(e.x, e.y + 2, 14, 12, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = pulse * .35; ctx.fillStyle = '#f0a63c';
    ctx.beginPath(); ctx.ellipse(e.x, e.y + 2, 14, 12, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = pulse; ctx.fillStyle = '#ffd9a0';                 // 中心小點，暗處也看得出位置
    ctx.beginPath(); ctx.arc(e.x, e.y + 2, 2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}
function drawEnemy(e) {
  ctx.save();
  if (e.hitT > 0) ctx.translate((Math.random() * 2 - 1) * 2.5, (Math.random() * 2 - 1) * 1.5);
  const lift = e.slimeLift || 0;
  const slimeW = (e.drawWidth || 42) * (e.slimeScaleX || 1), slimeH = (e.drawHeight || 33) * (e.slimeScaleY || 1);
  const bottomY = e.y + 13 - lift;
  const shadowScale = Math.max(.55, 1 - lift / 22);
  ctx.globalAlpha = .28 * shadowScale; ctx.fillStyle = '#071015';
  ctx.beginPath(); ctx.ellipse(e.x, e.y + 13, 15 * shadowScale, 4 * shadowScale, 0, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;
  const sprite = monsterImage(e.sprite || 'images/monster/Monster_Slime.png');
  if (sprite.complete && sprite.naturalWidth) {
    ctx.imageSmoothingEnabled = false;
    const dx = Math.round(e.x - slimeW / 2), dy = Math.round(bottomY - slimeH), dw = Math.round(slimeW), dh = Math.round(slimeH);
    ctx.drawImage(sprite, dx, dy, dw, dh);
    if (e.hitT > 0) {   // 受擊閃紅
      ctx.save();
      ctx.globalAlpha = Math.min(1, e.hitT / .16) * 0.65;
      ctx.filter = 'sepia(1) saturate(8) hue-rotate(-35deg) brightness(1.1)';
      ctx.drawImage(sprite, dx, dy, dw, dh);
      ctx.restore();
    }
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
  muomn:   { bg: '#d6edf2', bd: '#2f8598', tx: '#123842' },   // 藍綠
  theonie: { bg: '#fbe0ec', bd: '#c04a7a', tx: '#5a1c38' },   // 粉紅
  amber:   { bg: '#e5e2f7', bd: '#5f52a8', tx: '#2a2356' },   // 藍紫
  red:     { bg: '#f7dee1', bd: '#a8303a', tx: '#5a1a20' },   // 紅
  tino:    { bg: '#fdeacb', bd: '#d1892a', tx: '#5a3410' },   // 橘黃（對應橘髮與金黃色眼睛）
  ash:     { bg: '#e6e8ee', bd: '#5b6478', tx: '#242a36' },   // 墨灰
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
function drawSitPrompt(seat) { drawInteractPrompt(seat.x, seat.top, seat.prompt || '坐'); }
function drawPlayer(p) {
  const img = pickCharacterFrame(playerSprites, p);
  const size = PLAYER.drawSize;
  if (img && img.complete && img.naturalWidth) {
    ctx.save();
    if (p.recoilT > 0) {   // 開槍後座力：往反方向頂一下再回正
      const k = (p.recoilT / 0.14) * 4;
      ctx.translate(-Math.cos(p.recoilAng || 0) * k, -Math.sin(p.recoilAng || 0) * k);
    }
    if (p.hitT > 0) ctx.filter = 'sepia(1) saturate(4) hue-rotate(-38deg) brightness(1.32)';
    ctx.imageSmoothingEnabled = false;
    if (p.sitting?.rotation) {
      ctx.translate(p.x, p.y - size / 2 + 18);
      ctx.rotate(p.sitting.rotation * Math.PI / 180);
      ctx.drawImage(img, -size / 2, -size / 2, size, size);
    } else ctx.drawImage(img, p.x - size / 2, p.y - size + 18, size, size);
    ctx.imageSmoothingEnabled = true;
    ctx.restore();
  } else {
    ctx.fillStyle = '#5ec8ff'; roundRect(p.x - 14, p.y - 16, 28, 32, 8); ctx.fill();
  }
  if (!MAP_SAFE) {
    const w = 46, h = 5, ratio = Math.max(0, p.hp / p.maxhp), x = p.x - w / 2, y = p.y - size + 13;
    ctx.fillStyle = 'rgba(8,12,18,.88)'; roundRect(x - 1, y - 1, w + 2, h + 2, 3); ctx.fill();
    if (ratio > 0) { ctx.fillStyle = ratio > .35 ? '#63d7aa' : '#ff6363'; roundRect(x, y, w * ratio, h, 2); ctx.fill(); }
  }
}

// ---- 繪製 ----
function draw() {
  lightsCache = LIGHT.enabled ? getLights() : [];   // 更新這一幀的光源
  computeLightField();                              // 光沿格子擴散、碰牆停（牆後全黑）
  ctx.clearRect(0, 0, cv.width, cv.height);
  // 之後畫的都是「世界座標」：先套畫面縮放，再平移鏡頭位置，畫面就會跟著玩家捲動
  ctx.save();
  if ((G.cameraShakeT || 0) > 0) {
    const power = 4 * Math.min(1, G.cameraShakeT / .2);
    ctx.translate((Math.random() * 2 - 1) * power, (Math.random() * 2 - 1) * power);
  }
  ctx.scale(VIEW_SCALE, VIEW_SCALE);
  const shx = shakeAmt ? (Math.random() * 2 - 1) * shakeAmt : 0, shy = shakeAmt ? (Math.random() * 2 - 1) * shakeAmt : 0;   // 打擊震動
  ctx.translate(-Math.round(cam.x * VIEW_SCALE) / VIEW_SCALE + shx, -Math.round(cam.y * VIEW_SCALE) / VIEW_SCALE + shy);
  ctx.imageSmoothingEnabled = false;   // 放大時保持像素銳利
  // 底色＝純黑：沒有鋪任何素材的格子就是黑的（跟地圖編輯器看到的一致）
  ctx.fillStyle = '#000'; ctx.fillRect(OX, OY, COLS * CELL, ROWS * CELL);
  // 地面層（地板、地面裝飾）：永遠畫在角色下方
  drawMapGround(ctx);
  // 不可穿透格只負責碰撞；沒放美術素材時保持地圖原貌，與編輯器一致。
  // ---- 深度排序：會遮擋的地圖圖片（牆/物件）＋障礙物＋哨兵＋怪物＋玩家，一起依「底部Y」由上往下畫 ----
  //      底部Y 較小（畫面上方）的先畫、會被後畫的蓋住 → 走到牆後面就會被牆遮住。
  const sortables = [];
  collectMapOccluders(ctx, sortables);
  for(const core of G.cores) if(!core.dead && isLit(core.x,core.y)) sortables.push({y:core.y+23,draw:()=>drawCore(core)});
  for (const o of G.obstacles) sortables.push({ y: (o.r + (o.h || 1)) * CELL, draw: () => drawObstacle(o) });
  for (const t of G.towers) sortables.push({ y: t.y + 17, draw: () => drawTower(t) });
  for (const npc of G.npcs) sortables.push({ y: npc.y + 17, draw: () => drawWanderer(npc) });
  for (const e of G.enemies) if (isLit(e.x, e.y)) sortables.push({ y: e.y + 13, draw: () => drawEnemy(e) });   // 黑暗中的怪物看不到（堤諾感知到的另外畫在黑幕上）
  // 坐著時沿用椅子的排序值再 +0.5 → 畫在椅子上面（坐進椅子裡而不是被椅背蓋住）
  if (G.player) sortables.push({ y: G.player.sitting ? G.player.sitting.sortY + 0.5 : G.player.y + 16, draw: () => drawPlayer(G.player) });
  // 地上腐蝕痕跡（畫在單位腳下：紫黑色murky污漬，壓扁貼地）
  if (G.acidPools) for (const pool of G.acidPools) {
    const a = Math.min(1, (pool.t0 - pool.t) / 0.3, pool.t / 1.0);   // 淡入 0.3s、最後 1s 淡出
    for (const b of pool.blobs) {
      const cxp = pool.x + b.dx, cyp = pool.y + b.dy;
      const g = ctx.createRadialGradient(cxp, cyp, 0, cxp, cyp, b.rr);
      g.addColorStop(0, `rgba(32,19,37,${(0.6 * a).toFixed(3)})`);
      g.addColorStop(0.6, `rgba(24,14,29,${(0.38 * a).toFixed(3)})`);
      g.addColorStop(1, 'rgba(10,4,14,0)');
      ctx.save(); ctx.translate(cxp, cyp); ctx.scale(1, 0.6); ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(0, 0, b.rr, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
  }
  sortables.sort((a, b) => a.y - b.y);
  for (const it of sortables) it.draw();

  // 上層（樹冠、屋簷等，永遠蓋在最上面）
  drawMapTop(ctx);
  // 電梯是獨立物件：牆之後繪製；開門後站進去的人物顯示在門框前。
  drawElevators(ctx);
  if (G.player) for (const stamp of MAP.stamps || []) {
    if (!isElevatorStamp(stamp)) continue;
    const left = OX + stamp.c * CELL + (stamp.ox || 0), top = OY + stamp.r * CELL + (stamp.oy || 0);
    const cfg = elevatorConfig(stamp.id), phase = stamp === openElevatorStamp ? 'open' : 'closed';
    const depth = cfg?.[phase]?.depth ?? (phase === 'open' ? 35 : 120);
    if (G.player.x >= left && G.player.x <= left + 3 * CELL &&
        G.player.y + 16 >= top + depth && G.player.y <= top + 4 * CELL) drawPlayer(G.player);
  }
  // 互動提示（靠近且還沒坐下時）：出入口優先，其次 NPC，最後椅子
  if (G.player && !G.player.sitting && !G.over && !dialogueState && !elevatorMenuOpen) {
    const elevator = G.running ? elevatorNearPlayer() : null;
    const near = G.running ? portalNearPlayer() : null;
    if (elevator) drawInteractPrompt(elevator.x, elevator.top, elevator.mode === 'closed' ? '電梯' : '選擇樓層');
    else if (near) drawInteractPrompt(near.x, near.y - CELL / 2, '進入 ' + portalTargetName(near.portal));
    else {
      const actor = interactionNearPlayer(), profile = actor && dialogueProfile(actor);
      if (actor) drawInteractPrompt(actor.x, actor.y - 57,
        actor.kind === 'tower' && !MAP_SAFE ? '疏導' : '與 ' + (profile ? profile.name : '角色') + ' 對話');
      else { const seat = seatNearPlayer(); if (seat) drawSitPrompt(seat); }
    }
  }
  // 特效
  for (const f of G.effects) {
    if (f.spriteEffect) {
      const frames = attackEffectFrames[f.spriteEffect];
      const age = 1 - Math.max(0, f.life) / f.life0;
      const frame = frames[Math.min(3, Math.floor(age * 4))];
      if (frame && frame.complete && frame.naturalWidth) {
        ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.angle || 0);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(frame, -32, -32, 64, 64);
        ctx.restore();
      }
    } else if (f.slash) {                                  // 近戰揮砍：月牙斬弧光（殘影拖尾＋外光暈＋白核＋銳利前緣）
      const p = Math.max(0, f.life / f.life0), prog = 1 - p;
      const R = (f.heavy ? 54 : 42) * (0.92 + prog * 0.22), band = f.heavy ? 13 : 10, span = f.heavy ? 2.2 : 1.9;
      const rot = (prog - 0.5) * 0.7, alpha = Math.min(1, p * 1.7);
      const pal = f.pal || SLASH_PALETTES.blue;
      const crescent = (ro, ri, s, e) => { ctx.beginPath(); ctx.arc(0, 0, ro, s, e); ctx.arc(0, 0, ri, e, s, true); ctx.closePath(); ctx.fill(); };
      ctx.save(); ctx.translate(f.x, f.y); ctx.globalCompositeOperation = 'lighter';
      ctx.save(); ctx.rotate(f.angle + rot - 0.4); ctx.globalAlpha = alpha * 0.28; ctx.fillStyle = pal.after;   // 殘影拖尾
      crescent(R * 0.97, R * 0.97 - band, -span / 2, span / 2); ctx.restore();
      ctx.rotate(f.angle + rot);
      ctx.globalAlpha = alpha * 0.6; ctx.fillStyle = pal.outer; ctx.shadowColor = pal.glow; ctx.shadowBlur = 20;   // 外光暈
      crescent(R, R - band, -span / 2, span / 2);
      ctx.shadowBlur = 0; ctx.globalAlpha = alpha; ctx.fillStyle = pal.core;                                       // 白核
      crescent(R - band * 0.08, R - band * 0.5, -span * 0.49, span * 0.49);
      ctx.globalAlpha = alpha; ctx.strokeStyle = pal.edge; ctx.lineWidth = 2;                                      // 銳利前緣亮線
      ctx.beginPath(); ctx.arc(0, 0, R - 1, -span * 0.5, span * 0.5); ctx.stroke();
      ctx.restore(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    } else if (f.bolt) {                                   // 雷電本體：鋸齒閃電＋分岔，青藍外光＋白核，快速明滅
      const p = Math.max(0, f.life / f.life0), age = f.life0 - f.life;
      const flick = age < .04 ? 1 : (Math.sin(age * 90) > -0.3 ? 1 : 0.25);   // 明滅閃爍
      const a = Math.min(1, p * 1.6) * flick;
      ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.globalCompositeOperation = 'lighter';
      const stroke = (pts, wGlow, wCore) => {
        const trace = () => { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.stroke(); };
        ctx.globalAlpha = a * 0.5; ctx.strokeStyle = '#3ad6ff'; ctx.lineWidth = wGlow; ctx.shadowColor = '#3ad6ff'; ctx.shadowBlur = 14; trace();
        ctx.shadowBlur = 0; ctx.globalAlpha = a; ctx.strokeStyle = '#eafcff'; ctx.lineWidth = wCore; trace();
      };
      const lw = f.lw || 1;
      stroke(f.main, 5 * lw, 1.8 * lw);
      for (const br of f.branches) stroke(br, 3 * lw, 1.1 * lw);
      ctx.globalAlpha = a; ctx.fillStyle = '#eafcff';                          // 命中處白熱點
      ctx.beginPath(); ctx.arc(f.x, f.y, (4 + (1 - p) * 3) * lw, 0, Math.PI * 2); ctx.fill();
      ctx.restore(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    } else if (f.flame) {                                  // 火焰本體：一叢扭動竄升的火舌（三層色＋加色疊加）
      const t = 1 - Math.max(0, f.life) / f.life0, age = f.life0 - f.life;
      const rise = t < .25 ? t / .25 : 1;                  // 快速長出
      const shrink = t < .6 ? 1 : Math.max(.2, 1 - (t - .6) / .4 * .85);   // 後段收縮
      const gscale = (0.55 + rise * 0.45) * shrink;
      const alpha = t < .68 ? 1 : Math.max(0, 1 - (t - .68) / .32);
      const baseY = f.y - t * 12;                           // 整體略往上飄
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = alpha;
      for (const tg of f.tongues) {
        const cx = f.x + tg.dx;
        const flick = Math.sin(age * tg.freq + tg.phase);
        const flick2 = Math.sin(age * tg.freq * 0.6 + tg.phase * 1.7);
        const h = tg.h * gscale * (0.85 + 0.15 * flick);
        const w = tg.w * gscale * (0.9 + 0.12 * flick2);
        const sway = flick * w * 0.35 + tg.lean * gscale;
        drawFlameShape(ctx, cx, baseY, h,        w,        sway,        '#ff5a10');   // 外層 橙紅
        drawFlameShape(ctx, cx, baseY, h * 0.66, w * 0.58, sway * 0.8,  '#ffab1e');   // 中層 黃
        drawFlameShape(ctx, cx, baseY, h * 0.28, w * 0.24, sway * 0.6, '#ffcf66');   // 核心 暖黃（縮小、留在底部）
      }
      ctx.restore(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    } else if (f.cmist) {                                  // 腐蝕紫黑霧：多裂片組成的扭曲濃霧，緩慢churn（murky 不發光）
      const prog = 1 - Math.max(0, f.life) / f.life0, s = f.r0 + (f.rMax - f.r0) * prog;
      const alpha = (prog < .15 ? prog / .15 : prog > .6 ? Math.max(0, (1 - prog) / .4) : 1) * .62;
      if (alpha > 0.01) {
        const age = f.life0 - f.life, rot = f.spin * age;
        for (const lo of f.lobes) {
          const wob = Math.sin(age * 1.3 + lo.ph) * (lo.wob || 2.5);
          const lx = f.x + (lo.ox * Math.cos(rot) - lo.oy * Math.sin(rot)) + wob;
          const ly = f.y + (lo.ox * Math.sin(rot) + lo.oy * Math.cos(rot));
          const rr = lo.rr * s;
          ctx.save(); ctx.translate(lx, ly); ctx.rotate((lo.ang || 0) + rot); ctx.scale(lo.sx || 1, lo.sy || 1);
          const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rr);
          g.addColorStop(0, `rgba(42,26,48,${alpha.toFixed(3)})`);
          g.addColorStop(0.55, `rgba(26,15,30,${(alpha * 0.72).toFixed(3)})`);
          g.addColorStop(1, 'rgba(10,4,14,0)');
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, rr, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
        }
      }
    } else if (f.cdrop) {                                  // 腐蝕液滴：暗紫小圓
      const p = Math.max(0, f.life / f.life0);
      ctx.globalAlpha = Math.min(1, p * 1.5); ctx.fillStyle = f.col;
      ctx.beginPath(); ctx.arc(f.x, f.y, Math.max(.6, f.r * (0.6 + 0.4 * p)), 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    } else if (f.bullet) {                                 // 子彈曳光：一顆亮點＋短尾，從槍口快速飛向目標
      const prog = 1 - Math.max(0, f.life) / f.life0;
      const cx = f.x1 + (f.x2 - f.x1) * prog, cy = f.y1 + (f.y2 - f.y1) * prog;
      const ang = Math.atan2(f.y2 - f.y1, f.x2 - f.x1), tx = cx - Math.cos(ang) * 8, ty = cy - Math.sin(ang) * 8;
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
      ctx.strokeStyle = f.color; ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(cx, cy); ctx.stroke();
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(cx, cy, 1.8, 0, Math.PI * 2); ctx.fill();
      ctx.restore(); ctx.globalCompositeOperation = 'source-over';
    } else if (f.muzzle) {                                 // 槍口閃光：短暫的亮星＋前射小扇
      const p = Math.max(0, f.life / f.life0);
      ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.ang || 0); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = p;
      ctx.fillStyle = '#fff0c0';
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(9, -3.5); ctx.lineTo(13, 0); ctx.lineTo(9, 3.5); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.arc(0, 0, 3.2, 0, Math.PI * 2); ctx.fill();
      ctx.restore(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    } else if (f.charge) {                                 // 大招蓄力：收束光圈＋漸亮核心（加色疊加）
      const prog = 1 - Math.max(0, f.life) / f.life0;
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const rr = Math.max(3, 44 - 36 * prog);
      ctx.globalAlpha = 0.25 + 0.55 * prog; ctx.strokeStyle = f.color; ctx.lineWidth = 1.5 + 2.5 * prog;
      ctx.beginPath(); ctx.arc(f.x, f.y, rr, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = 0.2 + 0.6 * prog; ctx.fillStyle = f.color;
      ctx.beginPath(); ctx.arc(f.x, f.y, 3 + 15 * prog, 0, Math.PI * 2); ctx.fill();
      ctx.restore(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    } else if (f.sootheGlow) {                             // 疏導柔和光環＋雙層擴張圈（加色疊加）
      const p = Math.max(0, f.life / f.life0), r = f.r0 + (f.r1 - f.r0) * (1 - p), a = Math.sin(p * Math.PI);
      const [cr, cg, cb] = f.col;
      ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, r);
      g.addColorStop(0, `rgba(${cr},${cg},${cb},${(0.7 * a).toFixed(3)})`);
      g.addColorStop(0.45, `rgba(${cr},${cg},${cb},${(0.32 * a).toFixed(3)})`);
      g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(f.x, f.y, r, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = `rgb(${cr},${cg},${cb})`;
      ctx.globalAlpha = a * 0.85; ctx.lineWidth = 2.6;                         // 主圈
      ctx.beginPath(); ctx.arc(f.x, f.y, r, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = a * 0.4; ctx.lineWidth = 1.6;                          // 外層漣漪
      ctx.beginPath(); ctx.arc(f.x, f.y, r * 1.35, 0, Math.PI * 2); ctx.stroke();
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    } else if (f.mote) {                                   // 疏導療癒光點：柔光＋白核，上飄淡出
      const p = Math.max(0, f.life / f.life0), age = f.life0 - f.life;
      const wob = Math.sin(age * 6 + f.seed) * (f.wob || 4) * 0.5, alpha = Math.sin(p * Math.PI);
      const [cr, cg, cb] = f.col;
      ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = alpha;
      ctx.fillStyle = `rgb(${cr},${cg},${cb})`;
      ctx.beginPath(); ctx.arc(f.x + wob, f.y, Math.max(.6, f.r * p), 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = alpha * 0.7; ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(f.x + wob, f.y, Math.max(.3, f.r * p * 0.42), 0, Math.PI * 2); ctx.fill();
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    } else if (f.fglow) {                                  // 火焰爆閃光暈（加色疊加）
      const p = Math.max(0, f.life / f.life0), r = f.r0 + (f.r1 - f.r0) * (1 - p);
      const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, r);
      g.addColorStop(0, `rgba(255,240,190,${(0.9 * p).toFixed(3)})`);
      g.addColorStop(0.4, `rgba(255,150,40,${(0.6 * p).toFixed(3)})`);
      g.addColorStop(1, 'rgba(120,20,0,0)');
      ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(f.x, f.y, r, 0, Math.PI * 2); ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    } else if (f.ember) {                                  // 火焰粒子：白熱→黃→橙→暗紅，閃爍上竄
      const t = 1 - Math.max(0, f.life) / f.life0, age = f.life0 - f.life;
      let cr, cg, cb;
      if (f.spark) { cr = 255; cg = 240; cb = 180; }
      else if (t < .35) { const u = t / .35; cr = 255; cg = 250 - u * 40; cb = 200 - u * 150; }
      else if (t < .7)  { const u = (t - .35) / .35; cr = 255; cg = 210 - u * 100; cb = 50 - u * 40; }
      else { const u = (t - .7) / .3; cr = 255 - u * 90; cg = 110 - u * 80; cb = 10; }
      const wob = Math.sin(f.seed + age * 22) * (f.wob || 6) * (1 - t) * 0.5;
      const alpha = Math.min(1, f.life / (f.life0 * .5)), rad = Math.max(.4, f.r * (1 - t * .7));
      ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = alpha;
      ctx.fillStyle = `rgb(${cr | 0},${cg | 0},${cb | 0})`;
      ctx.beginPath(); ctx.arc(f.x + wob, f.y, rad, 0, Math.PI * 2); ctx.fill();
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    } else if (f.ring) {                                   // 命中衝擊環：快速擴張＋淡出
      const p = Math.max(0, f.life / f.life0), rr = f.r + (f.r2 - f.r) * (1 - p);
      ctx.globalAlpha = p * 0.9; ctx.strokeStyle = f.color; ctx.lineWidth = 1.5 + p * 2.5;
      ctx.beginPath(); ctx.arc(f.x, f.y, rr, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
    } else if (f.dmg) {                             // 彈出傷害數字：先放大一下再定住、上飄淡出
      const life0 = f.life0 || 0.7, age = life0 - f.life;
      const pop = age < 0.09 ? 0.7 + (age / 0.09) * 0.5 : 1.2 - Math.min(1, (age - 0.09) / 0.28) * 0.2;
      const alpha = Math.min(1, f.life / 0.35), ty = f.y + (f.vy || -34) * Math.min(0.5, age);
      ctx.save(); ctx.translate(f.x, ty); ctx.scale(pop, pop);
      ctx.font = 'bold 17px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.globalAlpha = alpha; ctx.lineWidth = 3.5; ctx.strokeStyle = 'rgba(0,0,0,.85)';
      ctx.strokeText(f.text, 0, 0); ctx.fillStyle = f.color; ctx.fillText(f.text, 0, 0);
      ctx.restore(); ctx.globalAlpha = 1;
    } else if (f.text) {
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
        const heavy = f.meleeType === 'luther';
        const radius = (heavy ? 34 : 25) * (0.72 + grow * 0.38);
        const start = -1.25 + grow * .45, end = 1.25 + grow * .45;
        ctx.translate(f.x2, f.y2 - 7); ctx.rotate(angle);
        ctx.shadowColor = '#2379ff'; ctx.shadowBlur = heavy ? 17 : 11;
        ctx.fillStyle = heavy ? '#348cff' : '#66b6ff';
        ctx.beginPath(); ctx.arc(0, 0, radius, start, end);
        ctx.quadraticCurveTo(radius * .36, 0, radius * Math.cos(start), radius * Math.sin(start));
        ctx.closePath(); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#f4ffff';
        ctx.beginPath(); ctx.arc(0, 0, radius * .82, start + .13, end - .13);
        ctx.quadraticCurveTo(radius * .48, 0, radius * .82 * Math.cos(start + .13), radius * .82 * Math.sin(start + .13));
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#6dbbff'; ctx.lineWidth = heavy ? 2.5 : 1.7;
        ctx.beginPath(); ctx.arc(0, 0, radius + 2, start - .1, end + .1); ctx.stroke();
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
      const ok = canPlaceObstacle(v, c, r, placeExtra(ob)) && G.money >= ob.cost;
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
  drawSensedEnemies();   // 堤諾的「感知」：黑暗中的怪物只對玩家顯示輪廓（畫在黑幕之上）
  // 選好建築並移到地圖上時，在預覽圖上方提示旋轉快捷鍵。
  if (hoverCell && G.running && G.selType && G.selType.startsWith('build:')) {
    const ob = buildableById(G.selType.slice(6));
    if (ob) {
      const v = ob[buildOrient], [c, r] = hoverCell;
      const labelX = OX + (c + v.w / 2) * CELL;
      const labelBottom = Math.max(OY + 28, OY + r * CELL - 7);
      ctx.save();
      ctx.font = 'bold 12px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(10, 16, 23, .88)';
      ctx.fillRect(labelX - 43, labelBottom - 23, 86, 23);
      ctx.fillStyle = '#f1f7fc';
      ctx.fillText('［R］旋轉', labelX, labelBottom - 6);
      ctx.restore();
    }
  }
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
  // 玩家受擊：畫面四周紅暈快速閃現後淡出（同《苦艾與甘露》的受擊回饋）。
  if ((G.damageVignetteT || 0) > 0) {
    const elapsed = 1 - G.damageVignetteT / .45;
    const strength = elapsed < .25 ? elapsed / .25 : Math.max(0, 1 - (elapsed - .25) / .75);
    const radius = Math.max(cv.width, cv.height) * .72;
    const vignette = ctx.createRadialGradient(cv.width / 2, cv.height / 2, radius * .35, cv.width / 2, cv.height / 2, radius);
    vignette.addColorStop(0, 'rgba(170,0,0,0)');
    vignette.addColorStop(.62, `rgba(190,0,0,${.08 * strength})`);
    vignette.addColorStop(1, `rgba(210,0,0,${.72 * strength})`);
    ctx.fillStyle = vignette; ctx.fillRect(0, 0, cv.width, cv.height);
  }
}
function roundRect(x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

// ---- HUD / 狀態畫面 ----
function updateHUD() {
  document.getElementById('npcArrangeToolbar').classList.toggle('hidden', !MAP_SAFE);
  // 安全區域不顯示戰鬥資訊條，連同「建築」按鈕一起收起來
  const hud = document.getElementById('hud');
  if (hud) hud.classList.toggle('hidden', MAP_SAFE);
  const buildToolbar = document.getElementById('buildToolbar');
  if (buildToolbar) buildToolbar.classList.toggle('hidden', MAP_SAFE);
  if (typeof updateTeamButton === 'function') updateTeamButton();   // 安全場景才顯示「出勤編隊」按鈕
  if (MAP_SAFE && typeof buildBar !== 'undefined' && buildBar) buildBar.classList.add('hidden');
  document.getElementById('money').textContent = Math.floor(G.money);
  document.getElementById('lives').textContent = Math.max(0, G.lives);
  document.getElementById('crystals').textContent = training.crystals;
  const playerHpBar = document.getElementById('playerHpBar');
  const playerHp = Math.max(0, G.player?.hp ?? 0);
  const playerMaxHp = Math.max(1, G.player?.maxhp ?? 100);
  playerHpBar.style.width = Math.min(100, playerHp / playerMaxHp * 100) + '%';
  playerHpBar.parentElement.setAttribute('aria-valuenow', Math.ceil(playerHp));
  playerHpBar.parentElement.setAttribute('aria-valuemax', playerMaxHp);
  const playerEnergyBar = document.getElementById('playerEnergyBar');
  playerEnergyBar.style.width = Math.max(0, Math.min(100, G.guide / Math.max(1, G.guideMax) * 100)) + '%';
  playerEnergyBar.parentElement.setAttribute('aria-valuenow', Math.floor(G.guide));
  playerEnergyBar.parentElement.setAttribute('aria-valuemax', G.guideMax);
  const mission = document.getElementById('missionText');
  if (mission) {
    if (MAP_SAFE) {
      if (mission.dataset.mode !== 'safe') mission.textContent = '目前任務：休息一下（安全區域）';
      mission.dataset.mode = 'safe';
    } else {
      if (mission.dataset.mode !== 'combat') mission.innerHTML = '目前任務：守住營地 <span class="mission-secondary">| 破壞異質核心</span>';
      mission.dataset.mode = 'combat';
    }
  }
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

function begin(playSound = true) { if (playSound) sfx('button'); closeElevatorMenu(); closeDialogue(true); closeSentryMenu(); closeGroundMenu(); assigning = null; newGame(); G.phase = 'playing'; hideOverlay(); G.running = true; G.betweenWaves = 0.01; }
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
