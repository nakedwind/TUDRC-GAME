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
function createMonster(spec, x, y, variant) {
  const legacy = !Array.isArray(MAP?.monsterMix) || !MAP.monsterMix.length;
  const oldRules = legacy && spec.id === 'slime' ? (MAP.rules || {}) : {};
  const hp = spec.hp;   // 血量一律用怪物編輯器（catalog）的設定，不再被地圖舊規則 rules.hp 覆蓋
  const monster = {
    type: spec.id, x, y, hp, maxhp: hp,
    speed: Number(oldRules.speed) || spec.speed,
    reward: oldRules.reward != null ? Number(oldRules.reward) : spec.reward,
    crystals: spec.crystals, playerDamage: spec.playerDamage,
    sentryDamage: spec.sentryDamage, buildingDamage: spec.buildingDamage,
    sprite: spec.sprite, drawWidth: spec.width, drawHeight: spec.height,
    hasTarget: false, wanderWait: Math.random() * .8, slimeClock: Math.random() * 1.83,
  };
  // 史萊姆變體（分裂／自爆／巨型…），設定在 js/combat-feel.js
  return spec.id === 'slime' ? applySlimeVariant(monster, variant || rollSlimeVariant()) : monster;
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
  let landGain = 1;
  if (kind === 'land') {
    if (!slime || !G.player) return;
    const distance = Math.hypot(slime.x - G.player.x, slime.y - G.player.y) / CELL;
    if (distance >= 15) return;
    landGain = Math.pow(Math.min(1, (15 - distance) / 13), 1.4);
  }
  const now = performance.now();
  if (kind === 'land' && now - lastSlimeLandSound < 90) return;
  if (kind === 'land') lastSlimeLandSound = now;
  // 原本的實際音量：撞擊 0.72、落地 0.36；換算成相對總音量的倍率，改由 SFX 預先載入的音檔播放
  const name = kind === 'hit' ? 'slimeHit' : 'slimeLand', target = kind === 'hit' ? .72 : .36 * landGain;
  SFX.play(name, target / Math.max(.01, SFX.volume), name);
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
  const actorDir = actor.dir;
  if (Math.abs(dx) >= Math.abs(dy)) { p.dir = dx < 0 ? 'left' : 'right'; actor.dir = dx < 0 ? 'right' : 'left'; }
  else { p.dir = dy < 0 ? 'back' : 'front'; actor.dir = dy < 0 ? 'front' : 'back'; }
  if (actor.sitting) actor.dir = actorDir;   // 坐著／躺著的人不轉身
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
  if (who.sitting && who.sitting.bed && set.blink && set.blink[2] && set.blink[2].complete && set.blink[2].naturalWidth) return set.blink[2];   // 躺床：正面閉眼
  if (who.soothingT > 0 && set.blink && set.blink[2] && set.blink[2].complete && set.blink[2].naturalWidth) return set.blink[2];   // 疏導中：正面閉眼
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
      if (elevator.mode === 'closed') {
        startElevatorOpen(elevator.stamp);
        sfx('elevator');
        const stamp = elevator.stamp;
        setTimeout(() => finishElevatorOpen(stamp), 550);
      } else if (elevator.mode === 'inside') openElevatorMenu();
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
    if (distance < bestDistance) { bestDistance = distance; best = { x, top, stamp, mode: elevatorOpenAnim?.stamp === stamp ? 'opening' : 'closed' }; }
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
  if (!pt.elevator) sfx('door');
  requestAnimationFrame(() => {
    mapTransition.classList.add('visible');
    setTimeout(() => {
      setTimeout(() => {
        switchMap(mapIndexById(pt.to));         // 全黑維持半秒後換地圖
        begin(false);                           // 重建並進入遊玩狀態，不播放開始按鈕聲
        const back = returnPortalCell(fromId);  // 落在新地圖「通回原地圖」的門旁
        let arrivalElevator = null;
        if (pt.elevator) {
          arrivalElevator = (MAP.stamps || []).find(isElevatorStamp) || null;
          if (arrivalElevator) {
            openElevator(arrivalElevator);
            const x = OX + (arrivalElevator.c + 1.5) * CELL + (arrivalElevator.ox || 0);
            const y = OY + (arrivalElevator.r + 3.5) * CELL + (arrivalElevator.oy || 0);
            if (!playerBlocked(x, y)) { G.player.x = x; G.player.y = y; }
          }
        } else placePlayerNearPortal(back);
        updateCamera(); draw();
        requestAnimationFrame(() => mapTransition.classList.remove('visible'));
        if (arrivalElevator) {
          setTimeout(() => {
            if (!(MAP.stamps || []).includes(arrivalElevator)) { mapTransitioning = false; return; }
            startElevatorClose(arrivalElevator);
            setTimeout(() => {
              if (openElevatorStamp === arrivalElevator) {
                finishElevatorClose(arrivalElevator);
                sfx('elevator');
              }
              mapTransitioning = false;
            }, 550);
          }, PORTAL_FADE_MS + 180);
        } else setTimeout(() => { mapTransitioning = false; }, PORTAL_FADE_MS);
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
  sfx('button'); flash(TYPES[t.type].name + '：前往巡邏點', t.x, t.y - 24, '#8fd3ff', 3);
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
function playerBuildingAt(c, r) {
  return [...G.obstacles].reverse().find(o =>
    o.playerBuilt && c >= o.c && r >= o.r && c < o.c + (o.w || 1) && r < o.r + (o.h || 1)
  ) || null;
}
function demolishPlayerBuilding(o) {
  if (!o || !o.playerBuilt || !G.obstacles.includes(o)) return false;
  const [fx, fy] = center(o.c + ((o.w || 1) - 1) / 2, o.r + ((o.h || 1) - 1) / 2);
  o.lastHitBy = 'demolish';   // 自己拆除的油桶不會爆炸也不會漏油
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
  sentryStatus(t, '瀕臨暴走，退守營地', '#ffb24d', true);
}
// 暴走（污染 100）：無差別攻擊最近的任意目標——敵人、其他哨兵、玩家、基地、核心
// 隊友避開腐蝕池：在池內／貼邊時往外推（阿瓦倫本人免疫、不避；暴走中不避）
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
  const canSee = hasLineOfSight(t.x, t.y, best.x, best.y);
  if (bestD > range * 0.9 || !canSee) {                        // 走向目標（直線步進、撞牆改走單軸）；隔牆看不到也繼續走
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
  const rageMul = sentryDamageMul(t), o = best.o, dmg = spec.dmg * rageMul;   // 暴走時汙染 100：路德的亂打也是最痛的
  const heavy = spec.ability === '怪力' || spec.ability === '自癒' || spec.ability === '雷電';   // 近戰、雷電＝重擊，震退比較遠
  spawnAttackVisual(t, { x: best.x, y: best.y, hp: 1, maxhp: 1 }, rageMul > 1 ? { ...spec, dmg, rage: rageMul } : spec, [], { x: best.x, y: best.y });
  if (G.enemies.includes(o)) { o.hp -= dmg; enemyHitReact(o, t.x, t.y, heavy); }
  else if (G.cores.includes(o)) { o.hp -= dmg; }
  else if (o === G.player) {
    o.hp = Math.max(0, o.hp - dmg); o.hitT = .3; G.damageVignetteT = Math.max(G.damageVignetteT, .3);
    friendlyHitReact(o, t.x, t.y, dmg, heavy, t);   // 閃紅、震退、傷害數字
    if (o.hp <= 0 && !G.over) { flash('部隊長失去戰鬥能力', o.x, o.y - 58, '#ff5b6e'); lose('player'); }
  } else if (o.isBase) {
    o.hp -= dmg; o.hitT = HIT_DUR;
    warnCampAttack();
    if (o.hp <= 0) { removeBarrier(o); flash('基地被摧毀！', OX + (o.c + o.w / 2) * CELL, OY + o.r * CELL - 18, '#ff5b5b'); if (!G.over) lose('base'); }
  } else if (G.towers.includes(o)) {   // 攻擊隊友
    const def = Math.max(0, Math.min(.75, (TYPES[o.type] && TYPES[o.type].defense) || 0));
    o.hp = Math.max(0, o.hp - dmg * (1 - def));
    friendlyHitReact(o, t.x, t.y, dmg * (1 - def), heavy, t);   // 閃紅、震退、被打斷一下、喊話、傷害數字
    if (o.hp <= 0) { o.target = null; o.meleeSwing = null; sentryStatus(o, '失去戰鬥能力', '#ff5b6e', true); }
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
// 點空地的彈窗：一打開就列出「召喚最近的哨兵」和每位隊員，點誰就召喚誰到這格
function renderGroundActions() {
  if (!groundTarget) return;
  groundMenu.innerHTML = '<div class="gm-title">召喚至此</div>';
  addGroundCloseButton();
  const nearest = document.createElement('button');
  nearest.className = 'gm-nearest';
  nearest.textContent = '🎯 召喚最近的哨兵';
  nearest.addEventListener('click', summonNearestSentryToGround);
  groundMenu.appendChild(nearest);
  for (const t of G.towers) {
    const b = document.createElement('button');
    b.className = 'gm-sentry';
    const avatar = document.createElement('span'); avatar.className = 'gm-avatar';
    const portrait = sentrySprites[t.type]?.front?.[0];
    if (portrait) { const img = document.createElement('img'); img.src = portrait.src; img.alt = ''; avatar.appendChild(img); }
    const info = document.createElement('span'); info.className = 'gm-sentry-info';
    const name = document.createElement('strong'); name.textContent = TYPES[t.type].name;
    const status = document.createElement('small'); status.textContent = t.berserk ? '暴走中' : (t.taint > 85 ? '瀕臨暴走' : '汙染 ' + Math.round(t.taint));
    info.append(name, status); b.append(avatar, info);
    b.disabled = !!t.berserk;
    b.addEventListener('click', () => assignSentryToGround(t));
    groundMenu.appendChild(b);
  }
  if (!groundMenu.classList.contains('hidden')) positionGroundMenu(groundTarget.clientX, groundTarget.clientY);
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
  setPaused(false);
  document.getElementById('systemNotices').replaceChildren();
  G = {
    phase: 'ready', money: START.money,
    campWarningAt: -Infinity,
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
  G.player = { x: px, y: py, hp: PLAYER.hp ?? 100, maxhp: PLAYER.hp ?? 100, hitT: 0, underAttackT: 0, dir: 'front', moving: false, anim: 0, blinkWait: 2 + Math.random() * 3, blinkTime: -1 };
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
      bed: /bed|床/i.test(s.id),
      // 背面的椅子：人背對鏡頭坐著，椅背擋在人前面 → 椅子要畫在人物上面（床不算）
      chairInFront: dir === 'back' && !/bed|床/i.test(s.id),
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
    if (typeof seatTaken === 'function' && seatTaken(s, G.player)) continue;   // NPC 坐著的位子
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
  if (p.soothingT > 0) {                // 疏導中：站定、正面閉眼，按移動鍵也不會走
    p.soothingT = Math.max(0, p.soothingT - dt);
    p.moving = false; p.anim = 0; p.dir = 'front';
    return;
  }
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
    for (const actor of [...G.npcs, ...G.towers]) { npcStandUp(actor); actor.seatGoal = null; faceNpcFront(actor); }
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
    sfx('button'); flash(TYPES[t.type].name + '：前往巡邏點', t.x, t.y - 24, '#8fd3ff', 3); systemNotice(TYPES[t.type].name + '正前往巡邏點');
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

  // ── 營地／哨兵選單：左右鍵都可開；自己蓋的建築只有右鍵開（左鍵照常開槍）──
  const campBase = !MAP_SAFE && campBaseAt(x, y);
  if (campBase) { openCampMenu(campBase, e.clientX, e.clientY); return false; }
  const hit = G.towers.find(t => sentrySprites[t.type] ? Math.hypot(t.x - x, t.y - 14 - y) <= 28 : Math.hypot(t.x - x, t.y - y) <= 22);
  if (hit) { closeGroundMenu(); openSentryMenu(hit); return false; }
  closeSentryMenu();
  if (MAP_SAFE) { closeGroundMenu(); return false; }
  const clickedBuilding = playerBuildingAt(c, r);
  if (clickedBuilding) {
    if (isLeft) { closeGroundMenu(); return true; }   // 左鍵點到建築：不開拆除選單，當成開槍
    spawnGroundRipple(e.clientX, e.clientY); openBuildingMenu(clickedBuilding, c, r, e.clientX, e.clientY); return false;
  }
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

// ---- 哨兵挑目標（射程 R 內）----
// 優先順序：正在打營地或部隊長的怪物 → 最近的怪物 → 最近的異質核心（被召喚護衛時不打核心）
function pickSentryTarget(t, R) {
  const p = G.player;
  let best = null, bestScore = Infinity;
  for (const e of G.enemies) {
    if (e.dead) continue;
    const distance = Math.hypot(e.x - t.x, e.y - t.y);
    if (distance > R) continue;
    if (!hasLineOfSight(t.x, t.y, e.x, e.y)) continue;   // 隔著牆看不到就不能打
    const urgent = (e.attackingObstacle && e.attackingObstacle.isBase) || (p && p.underAttackT > 0 && p.lastAttacker === e);
    const score = urgent ? distance - 100000 : distance;
    if (score < bestScore) { best = e; bestScore = score; }
  }
  if (best || t.guardSummoned) return best;
  for (const core of G.cores) {
    if (core.dead) continue;
    const distance = Math.hypot(core.x - t.x, core.y - t.y);
    if (distance <= R && distance < bestScore && hasLineOfSight(t.x, t.y, core.x, core.y)) { best = core; bestScore = distance; }
  }
  return best;
}

// ---- 疏導冷卻與大招數值（特效本身在 js/attack-fx.js）----
const SOOTHE_AURA_CD = 3;   // 嚮導被動疏導的冷卻秒數
const SOOTHE_CHANNEL = 1;  // 嚮導疏導時站定、閉眼施法的秒數（期間不走動、不攻擊）
const ACID_TICK = 1;   // 阿瓦倫腐蝕池：每隔幾秒扣一次血（每次扣「每秒傷害 × 間隔」）
// 大招：平時普攻，冷卻好時放一次（傷害高、範圍大、特效大）；喊的話在 data/dialogues.js 的 ultimate
const ULTIMATES = {
  theonie: { cd: 8,  dmgMul: 2.6, splash: 2.2, scale: 1.9 },
  amber:   { cd: 9,  dmgMul: 2.6, splash: 2.4, scale: 1.9 },
  avaren:  { cd: 10, dmgMul: 2.3, splash: 2.8, scale: 2.0 },
  // 近戰大招（大範圍）：red 盾牌衝撞＋回HP回污染、擊退；luther 大範圍重擊＋暈眩、傷害更高
  red:     { cd: 10, dmgMul: 2.2, radius: 2.8, kind: 'bash',  knockback: 1.6, healHp: 40, healTaint: 40 },
  luther:  { cd: 11, dmgMul: 3.0, radius: 3.0, kind: 'smash', knockback: 0.8, stun: 2.5 },
};
const ULT_SWING = { wind: .6, impact: .8, duration: 1.2 };   // 大招：長前搖→放招→收招
// 近戰普攻的節奏（秒，從出手開始算）：wind＝舉起蓄力結束、impact＝命中瞬間、duration＝收招完成
const MELEE_SWING = {
  normal: { wind: .19, impact: .30, duration: .58 },   // 雷德
  luther: { wind: .29, impact: .43, duration: .78 },   // 路德：重擊，比較慢
  avaren: { wind: .11, impact: .18, duration: .36 },   // 阿瓦倫：短刀，快而俐落
};
// 玩家（溫特）攻擊：按住左鍵朝游標方向開槍。彈匣 6 發，打完或按 R 裝填；傷害很低、會吸引仇恨。
const PLAYER_ATK = CHARACTERS.winter.playerAttack || { range: 6, dmg: 3, rate: 5, aggro: 3.5, cone: 0.44, mag: 6, reloadTime: 2 };
const GUIDE_GUN_TYPES = new Set(['eldrin', 'chris']);
const GUIDE_GUN = { mag: 6, reloadTime: 2 };
let aimHeld = false, aimClient = null;
function gunMuzzleAt(who, angle) {
  let x = who.x + Math.cos(angle) * 15, y = who.y - 8 + Math.sin(angle) * 10;
  if (who.dir === 'left') { x -= 5; y += 5; }
  else if (who.dir === 'right') { x += 3; y += 5; }
  else if (who.dir === 'back') y -= 25;
  return { x, y };
}
function spawnGuideGunshot(t, sw) {
  const foe = sw.target, angle = sw.angle, muzzle = gunMuzzleAt(t, angle);
  const endX = foe && !foe.dead ? foe.x : t.x + Math.cos(angle) * TYPES[t.type].range * CELL;
  const endY = foe && !foe.dead ? foe.y : t.y + Math.sin(angle) * TYPES[t.type].range * CELL;
  G.effects.push({ muzzle: true, x: muzzle.x, y: muzzle.y, ang: angle, life: .07, life0: .07 });
  addLightFlash('muzzle', muzzle.x, muzzle.y);
  spawnShellCasing(muzzle.x, muzzle.y, angle);
  G.effects.push({ bullet: true, x1: muzzle.x, y1: muzzle.y, x2: endX, y2: endY, life: .07, life0: .07, color: '#ffe79a' });
  t.gunAmmo = Math.max(0, (t.gunAmmo ?? GUIDE_GUN.mag) - 1);
  if (typeof sfxAt === 'function') sfxAt('gunshot', t.x, t.y, 0.42, t.type);
  if (t.gunAmmo === 0) {
    t.gunReloadT = GUIDE_GUN.reloadTime;
    if (typeof sfxAt === 'function') sfxAt('reload', t.x, t.y, 0.35, t.type);
  }
}
function clientToWorld(cx, cy) {
  const rect = cv.getBoundingClientRect();
  return { x: (cx - rect.left) * cv.width / rect.width / VIEW_SCALE + cam.x, y: (cy - rect.top) * cv.height / rect.height / VIEW_SCALE + cam.y };
}
function startReload(p) {
  if (!p || p.reloadT > 0 || (p.ammo ?? PLAYER_ATK.mag) >= PLAYER_ATK.mag) return;
  p.reloadT = PLAYER_ATK.reloadTime;
  if (typeof sfx === 'function') sfx('reload');
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
  if (p.hp <= 0 || !aimHeld || !aimClient || p.atkCd > 0 || p.soothingT > 0 || G.over || dialogueState || elevatorMenuOpen) return;   // 疏導中不開槍
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
    if (!hasLineOfSight(p.x, p.y, e.x, e.y)) continue;   // 隔牆打不到
    const d = Math.hypot(e.x - p.x, e.y - p.y);
    if (d > PLAYER_ATK.range * CELL) continue;
    let da = Math.abs(Math.atan2(e.y - p.y, e.x - p.x) - aimAng); if (da > Math.PI) da = 2 * Math.PI - da;
    if (da <= PLAYER_ATK.cone && d < bestD) { bestD = d; best = e; }
  }
  for (const o of G.obstacles) {   // 油桶／油箱也能瞄準（開槍打爆）
    if (!oilItem(o) || o.hp <= 0) continue;
    const c = oilCenter(o), d = Math.hypot(c.x - p.x, c.y - p.y);
    if (d > PLAYER_ATK.range * CELL || !isLit(c.x, c.y) || !hasLineOfSight(p.x, p.y, c.x, c.y)) continue;
    let da = Math.abs(Math.atan2(c.y - p.y, c.x - p.x) - aimAng); if (da > Math.PI) da = 2 * Math.PI - da;
    if (da <= PLAYER_ATK.cone && d < bestD) { bestD = d; best = oilProxy(o); }
  }
  const endX = best ? best.x : p.x + Math.cos(aimAng) * PLAYER_ATK.range * CELL;
  const endY = best ? best.y : p.y + Math.sin(aimAng) * PLAYER_ATK.range * CELL;
  const { x: mx, y: my } = gunMuzzleAt(p, aimAng);
  G.effects.push({ muzzle: true, x: mx, y: my, ang: aimAng, life: .07, life0: .07 });   // 槍口閃光
  addLightFlash('muzzle', mx, my);   // 槍口火光照亮周圍的黑暗
  spawnShellCasing(mx, my, aimAng);  // 彈殼拋出
  G.effects.push({ bullet: true, x1: mx, y1: my, x2: endX, y2: endY, life: .07, life0: .07, color: '#ffe79a' });   // 子彈曳光（飛向目標）
  if (best) G.effects.push({ ring: true, x: best.x, y: best.y, r: 2, r2: 9, life: .14, life0: .14, color: '#ffe79a' });   // 命中小火花
  igniteSlicksOnLine(p.x, p.y, endX, endY);   // 子彈穿過油汙 → 點燃
  if (best && best.oilRef) { damageOil(best.oilRef, Math.round(PLAYER_ATK.dmg * (rollCrit('player') || 1)), 'player'); best = null; }   // 打到油桶
  if (best) {
    const critMul = rollCrit('player'), shotDmg = Math.round(PLAYER_ATK.dmg * (critMul || 1));
    best.hp -= shotDmg;
    if (!(best.playerAggroT > 0)) best.alertT = ENEMY_ALERT_TIME;   // 這一槍才把牠吸引過來：頭上冒「！」
    best.playerAggroT = PLAYER_ATK.aggro;   // 吸引仇恨
    markHit(critMul);                       // 準星旁閃一下命中標記
    best.hitT = Math.max(best.hitT || 0, .14); best.hitColor = '#bfe0ff';
    enemyHitReact(best, p.x, p.y, !!critMul);   // 爆擊算重擊（會擊退、硬直）
    if (critMul) flashCrit('-' + shotDmg, best.x, best.y - 30);
    else flashDmg('-' + shotDmg, best.x, best.y - 26, '#bfe0ff');
    if (typeof sfxAt === 'function') sfxAt('monsterHit', best.x, best.y, 0.48, 'player');
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

// ---- 主迴圈（幀率校正）----
let last = 0;
// ---- 腳步聲（走路時循環播放；安全場景=footsteps02、戰鬥場景=footsteps01）----
const FOOT = { audio: null, file: '' };
function updateFootsteps() {
  const p = G && G.player;
  const walking = !!(p && p.moving && !p.sitting && G.running && !G.over && !paused);
  if (!FOOT.audio) { FOOT.audio = new Audio(); FOOT.audio.loop = true; FOOT.audio.volume = 0.5; }
  const a = FOOT.audio;
  const want = MAP_SAFE ? 'Sound effects/footsteps02.mp3' : 'Sound effects/footsteps01.mp3';
  if (FOOT.file !== want) { FOOT.file = want; a.src = want; }
  a.muted = !SFX.enabled;                       // 跟著 M 鍵一起靜音
  if (walking) { if (a.paused) a.play().catch(() => {}); }
  else if (!a.paused) a.pause();
}
// ---- 暫停（P 鍵）：戰場與玩家停住，畫面照常繪製，仍可點哨兵下指令 ----
let paused = false;
function setPaused(on) {
  paused = !!on;
  const badge = document.getElementById('pauseBadge');
  if (badge) badge.classList.toggle('hidden', !paused);
}
window.addEventListener('keydown', e => {
  if (e.repeat || e.key.toLowerCase() !== 'p' || dialogueState || elevatorMenuOpen || mapTransitioning) return;
  if (!G || !G.running || G.over || MAP_SAFE) return;   // 只有戰鬥中可以暫停
  sfx('switch'); setPaused(!paused);
});
function loop(ts) {
  const dt = Math.min(0.05, (ts - last) / 1000 || 0); last = ts;
  const frozen = hitstop > 0; if (frozen) hitstop = Math.max(0, hitstop - dt);   // 命中頓格：短暫凍結戰場
  const sdt = dt * battleTimeScale(dt);   // 哨兵暴走瞬間的慢動作（js/berserk-fx.js）
  if (!paused && !G.over && !dialogueState && !elevatorMenuOpen && !mapTransitioning && !frozen) updatePlayer(sdt);   // 對話或轉場時暫停玩家與戰場
  updateFootsteps();               // 走路腳步聲
  updateCamera();
  if (!paused && G.running && !G.over && !dialogueState && !elevatorMenuOpen && !mapTransitioning && !frozen) update(sdt);
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
    else if (t.soothingT > 0 && t.hp > 0 && !t.berserk) t.dir = 'front';   // 疏導中：站定、面向鏡頭（原本的指令保留，施法完繼續）
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
      aggroOnSentry(foe, t);
      const dx = foe.x - t.x, dy = foe.y - t.y;
      displaceEnemy(foe, dx, dy, CELL * 1.2);
      foe.hitT = Math.max(foe.hitT || 0, .16); foe.hitColor = '#dbe7ff';
      if (typeof sfxAt === 'function') sfxAt('monsterHit', foe.x, foe.y, 0.48, 'red-ram');
      flashDmg('-' + ramDmg, foe.x, foe.y - 26, '#dbe7ff');
      G.effects.push({ ring: true, x: foe.x, y: foe.y, r: 5, r2: 24, life: .2, life0: .2, color: '#dbe7ff' });
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
    if (GUIDE_GUN_TYPES.has(t.type) && t.gunReloadT > 0) {
      t.gunReloadT = Math.max(0, t.gunReloadT - dt);
      if (t.gunReloadT === 0) t.gunAmmo = GUIDE_GUN.mag;
    }
    if (t.hitT > 0) t.hitT -= dt;   // 受擊閃紅計時
    if (t.soothingT > 0) t.soothingT = Math.max(0, t.soothingT - dt);   // 疏導施法計時
    if (t.ultCd > 0) t.ultCd -= dt;   // 大招冷卻
    if (spec.hpRegen) t.hp = Math.min(t.maxhp, t.hp + spec.hpRegen * dt);
    if (sentryAtBase(t)) t.hp = Math.min(t.maxhp, t.hp + (10 / 60) * dt);   // 在營地緩慢回 HP（1分鐘+10），污染不恢復
    if (spec.taintRegen && !t.berserk) t.taint = Math.max(0, t.taint - spec.taintRegen * dt);
    if (!t.berserk && !TYPES[t.type].guide && !spec.noRetreat && t.taint > 85) {   // 瀕臨暴走：自動退守營地（觸發一次）；noRetreat 的角色（路德）會留在前線
      if (!t.resting) { t.resting = true; sendSentryRest(t); }
    } else if (t.taint <= 80) t.resting = false;
    if (spec.aura && !t.berserk) {   // 嚮導隨身疏導：改成「冷卻一到就一次清一批」，不再每幀連續疏導
      t.auraCd = Math.max(0, (t.auraCd || 0) - dt);
      if (t.auraCd <= 0) {
        const AURA_CD = SOOTHE_AURA_CD, sc = SOOTHE_COLORS[t.type] || SOOTHE_COLORS.eldrin;
        const soothed = [];
        for (const o of G.towers) {
          if (o === t || o.hp <= 0 || TYPES[o.type].guide || Math.hypot(o.x - t.x, o.y - t.y) > spec.aura.r * CELL) continue;
          if ((o.taint || 0) <= 0 && o.hp >= o.maxhp && !o.berserk) continue;   // 不需要疏導就跳過
          const taintBefore = o.taint || 0;
          o.taint = Math.max(0, taintBefore - spec.aura.rate * AURA_CD);          // 一次清一批（平均速率不變）
          o.hp = Math.min(o.maxhp, o.hp + (spec.aura.heal || 0) * AURA_CD);
          if (o.berserk && o.taint < 60) o.berserk = false;
          spawnSootheEffect(o.x, o.y - 8, sc, o);
          const cleared = Math.round(taintBefore - o.taint);
          if (cleared > 0) flashDmg('汙染 -' + cleared, o.x, o.y - 44, `rgb(${sc[0]},${sc[1]},${sc[2]})`);
          soothed.push(o);
        }
        if (soothed.length) {
          t.auraCd = AURA_CD;
          spawnSootheCast(t, sc, spec.aura.r * CELL);   // 疏導表演：法陣、光波
          t.soothingT = SOOTHE_CHANNEL; t.gunSwing = null; t.gunT = 0; t.dir = 'front'; t.moving = false;   // 停下來閉眼疏導
          if (typeof sfxAt === 'function') sfxAt('soothe', t.x, t.y, 0.42, t.type);
        }
      }
    }
    if (t.soothingT > 0) continue;   // 疏導中專心施法，不開槍
    t.cd -= dt;
    let swingTarget = null;
    if (t.berserk) { t.meleeSwing = null; t.gunSwing = null; updateChaosSentry(t, spec, dt); continue; }   // 暴走：無差別攻擊
    if (t.meleeSwing) {
      const swing = t.meleeSwing;
      swing.age += dt;
      if (!swing.soundPlayed && swing.age >= swing.wind) { swing.soundPlayed = true; playSentryAttackSound(t); }
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
        if (GUIDE_GUN_TYPES.has(t.type)) spawnGuideGunshot(t, sw);
        else { playSentryAttackSound(t); spawnSentryShotVisual(t, sw, spec); }
        const foe = sw.target;
        if (foe && !foe.dead && foe.hp > 0 && Math.hypot(foe.x - t.x, foe.y - t.y) <= spec.range * CELL + 12) swingTarget = foe;
      }
      if (sw.age >= sw.duration) t.gunSwing = null;
      if (!swingTarget) continue;
    } else if (t.cd > 0) continue;
    if (GUIDE_GUN_TYPES.has(t.type) && t.gunReloadT > 0 && !swingTarget) continue;
    const R = spec.range * CELL;
    let target = swingTarget;
    if (!target) target = t.mode === 'goto' ? null : campAttackerFor(t, R);
    if (target && target !== swingTarget && !hasLineOfSight(t.x, t.y, target.x, target.y)) target = null;   // 隔牆看不到
    const attacker = !target && t.type === 'red' ? redAttacker() : null;
    if (attacker && Math.hypot(attacker.x - t.x, attacker.y - t.y) <= R && hasLineOfSight(t.x, t.y, attacker.x, attacker.y)) target = attacker;
    if (!target) target = pickSentryTarget(t, R);
    if (target) {
      if (!swingTarget) t.cd = 1 / (spec.rate * (t.taint > 85 && !t.berserk ? 0.5 : 1));   // 瀕臨暴走：攻速減半
      if ((t.type === 'red' || t.type === 'luther' || t.type === 'avaren') && !swingTarget) {
        const heavy = t.type === 'luther', dx = target.x - t.x, dy = target.y - t.y;
        t.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'back' : 'front');
        const isUlt = !!(ULTIMATES[t.type] && (t.ultCd || 0) <= 0);
        if (isUlt) { t.ultCd = ULTIMATES[t.type].cd; const ultLine = pickDialogueLine(t.type, 'ultimate'); if (ultLine) t.say = { text: ultLine, life: 2.5 }; spawnChargeFx(t.x, t.y - 8, ULT_CHARGE_COLOR[t.type]); }
        const sw = isUlt ? ULT_SWING : (MELEE_SWING[t.type] || MELEE_SWING.normal);
        t.meleeSwing = { target, angle: Math.atan2(dy, dx), age: 0, wind: sw.wind, impact: sw.impact, duration: sw.duration, hit: false, ult: isUlt };
        t.moving = false;
        continue;
      }
      if (!swingTarget) {   // 遠程角色：即使沒有持槍素材，也先做瞄準／後座動畫再判定命中
        const dx = target.x - t.x, dy = target.y - t.y;
        t.dir = Math.abs(dx) >= Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'back' : 'front');
        const isUlt = !!(ULTIMATES[t.type] && (t.ultCd || 0) <= 0);
        if (isUlt) { t.ultCd = ULTIMATES[t.type].cd; const ultLine = pickDialogueLine(t.type, 'ultimate'); if (ultLine) t.say = { text: ultLine, life: 2.5 }; spawnChargeFx(t.x, t.y - 8, ULT_CHARGE_COLOR[t.type]); }
        const sw = isUlt ? ULT_SWING : { wind: .14, impact: .21, duration: .4 };
        t.gunSwing = { target, angle: Math.atan2(dy, dx), age: 0, wind: sw.wind, impact: sw.impact, duration: sw.duration, fired: false, ult: isUlt };
        t.gunT = sw.duration; t.moving = false;
        continue;
      }
      const U = ((t.gunSwing && t.gunSwing.ult) || (t.meleeSwing && t.meleeSwing.ult)) ? ULTIMATES[t.type] : null;   // 大招（在揮擊啟動時已決定）
      if (U && U.radius) {   // 近戰大招：大範圍（紅＝盾牌衝撞＋回復；路德＝重擊＋暈眩）
        const r = U.radius * CELL, dmg = spec.dmg * U.dmgMul * sentryDamageMul(t), col = U.kind === 'bash' ? '#bfe0ff' : '#ffd0d5';
        const hitEnemy = G.enemies.find(e => !e.dead && Math.hypot(e.x - t.x, e.y - t.y) <= r && hasLineOfSight(t.x, t.y, e.x, e.y));
        for (const e of G.enemies) {
          if (e.dead || Math.hypot(e.x - t.x, e.y - t.y) > r || !hasLineOfSight(t.x, t.y, e.x, e.y)) continue;   // 牆後的不受影響
          e.hp -= dmg;
          aggroOnSentry(e, t);
          if (U.knockback) { const dx = e.x - t.x, dy = e.y - t.y; displaceEnemy(e, dx, dy, CELL * U.knockback); }
          if (U.stun) e.stunT = Math.max(e.stunT || 0, U.stun);
          e.hitT = Math.max(e.hitT || 0, .2); e.hitColor = col;
          flashDmg('-' + Math.round(dmg), e.x, e.y - 26, col);
        }
        if (U.healHp) { t.hp = Math.min(t.maxhp, t.hp + U.healHp); flashDmg('+' + U.healHp, t.x, t.y - 40, '#7ee0a0'); }
        if (U.healTaint) t.taint = Math.max(0, t.taint - U.healTaint);
        spawnUltShockwave(t.x, t.y, r, col);
        if (hitEnemy && typeof sfxAt === 'function') sfxAt('monsterHit', hitEnemy.x, hitEnemy.y, 0.48, t.type + '-ult');
      } else if (!G.enemies.includes(target) || Math.random() < spec.accuracy) {
        const impactPoint = { x: target.x, y: target.y };
        const critMul = U ? 0 : rollCrit('sentry');   // 一般攻擊才會爆擊（js/combat-feel.js 的 CRIT）
        const rageMul = sentryDamageMul(t);   // 路德：汙染越高打越痛
        const atkDmg = spec.dmg * (U ? U.dmgMul : 1) * (critMul || 1) * rageMul, atkSplash = U ? U.splash : spec.splash;
        target.hp -= atkDmg;
        onSentryHitOil(t, target, atkDmg, impactPoint, (atkSplash || 0) * CELL);   // 安柏／希奧妮：不小心波及附近的油桶、油汙
        const affected = target.maxhp && G.enemies.includes(target) ? [target] : [];
        if (atkSplash > 0) for (const e of G.enemies) if (e !== target && !e.dead && Math.hypot(e.x - target.x, e.y - target.y) <= atkSplash * CELL && hasLineOfSight(target.x, target.y, e.x, e.y)) { e.hp -= atkDmg * .6; affected.push(e); }
        for (const e of affected) {
          if (spec.burn) { e.burnT=spec.burn.duration; e.burnDmg=spec.burn.damage; e.burnTick=1; }
          if (spec.stun) e.stunT=Math.max(e.stunT||0,spec.stun);
          if (spec.confuse) e.confuseT=Math.max(e.confuseT||0,spec.confuse);
          if (spec.knockback) {
            const dx=e.x-t.x,dy=e.y-t.y;
            displaceEnemy(e,dx,dy,CELL*spec.knockback);
          }
        }
        spawnAttackVisual(t, target, (U || critMul || rageMul > 1) ? { ...spec, dmg: atkDmg, splash: atkSplash, crit: !!critMul, rage: rageMul } : spec, affected, impactPoint, U ? U.scale : 1);
      } else flashDmg('MISS', target.x, target.y - 26, '#c6d1dd');
      if (!spec.guide) t.taint = Math.min(100, t.taint + spec.taint);
      if (t.taint >= 100 && !t.berserk) { t.berserk = true; sfx('berserk'); flash('暴走!', t.x, t.y - 30, '#ff4d4d', 3); systemNotice(TYPES[t.type].name + '污染達到極限，陷入暴走，開始無差別攻擊！', true); }
    }
  }
  // 地上腐蝕痕跡：站在裡面的對象每 ACID_TICK 秒扣一次血、偶爾冒紫黑霧。
  // 計時跟著「被腐蝕的對象」走：同時站在好幾灘裡，也只吃最痛的那一灘（不疊加）。
  if (G.acidPools && G.acidPools.length) {
    const acidDps = o => {   // 站在哪幾灘裡 → 取最痛的那一灘的每秒傷害；不在任何一灘裡回傳 0
      let best = 0;
      for (const pool of G.acidPools) if (pool.t > 0 && Math.hypot(o.x - pool.x, o.y - pool.y) <= pool.r) best = Math.max(best, pool.dps);
      return best;
    };
    // 回傳這一刻要扣多少血（0＝還沒到時間或不在池子裡）；剛踩進去要等 1 秒才第一次扣
    const acidTick = o => {
      const dps = acidDps(o);
      if (!dps) { o.acidT = ACID_TICK; return 0; }
      o.acidT = (o.acidT ?? ACID_TICK) - dt;
      if (o.acidT > 0) return 0;
      o.acidT += ACID_TICK;
      return dps * ACID_TICK;   // 一次扣掉「每秒傷害 × 間隔」
    };
    for (const e of G.enemies) {
      if (e.dead) continue;
      const dmgAmt = acidTick(e);
      if (!dmgAmt) continue;
      e.hp -= dmgAmt;
      e.hitT = Math.max(e.hitT || 0, .16); e.hitColor = '#b060ff';
      flashDmg('-' + Math.round(dmgAmt), e.x, e.y - 26, '#c58aff');
    }
    // 隊友也會被腐蝕：哨兵（依防禦減免，歸 0 失去戰鬥能力）。阿瓦倫本人對自己的腐蝕免疫。
    for (const t of G.towers) {
      if (t.hp <= 0 || t.berserk || t.type === 'avaren') continue;
      const dmgAmt = acidTick(t);
      if (!dmgAmt) continue;
      const def = Math.max(0, Math.min(.75, (TYPES[t.type] && TYPES[t.type].defense) || 0));
      const hurt = dmgAmt * (1 - def);
      t.hp = Math.max(0, t.hp - hurt);
      t.hitT = Math.max(t.hitT || 0, .2); t.hitColor = '#b060ff';
      flashDmg('-' + Math.round(hurt), t.x, t.y - 30, '#c58aff');
      if (t.hp <= 0) { t.target = null; sentryStatus(t, '失去戰鬥能力', '#ff5b6e', true); }
    }
    // 玩家（溫特）
    const p = G.player;
    const playerAcid = p && p.hp > 0 ? acidTick(p) : 0;
    if (playerAcid) {
      p.hp = Math.max(0, p.hp - playerAcid);
      p.hitT = Math.max(p.hitT || 0, .3); G.damageVignetteT = Math.max(G.damageVignetteT, .35);
      flashDmg('-' + Math.round(playerAcid), p.x, p.y - 46, '#c58aff');
      if (p.hp <= 0 && !G.over) { flash('部隊長失去戰鬥能力', p.x, p.y - 58, '#ff5b6e'); lose('player'); }
    }
    for (const pool of G.acidPools) {
      pool.t -= dt;
      pool.fizz -= dt;
      if (pool.fizz <= 0 && pool.t > .4) {   // 焦痕上持續冒出往上飄散的黑霧
        pool.fizz = .14 + Math.random() * .12;
        const ang = Math.random() * Math.PI * 2, rr = Math.random() * pool.r * 0.75;
        pushBlackSmoke(pool.x + Math.cos(ang) * rr, pool.y + Math.sin(ang) * rr * .6);
      }
    }
    G.acidPools = G.acidPools.filter(p => p.t > 0);
  }
  if (G.scorchMarks) {   // 焦痕計時（比傷害區域留得久）
    for (const m of G.scorchMarks) m.t -= dt;
    G.scorchMarks = G.scorchMarks.filter(m => m.t > 0);
  }
  for (const e of G.enemies) { if (e.hp <= 0 && !e.dead) { e.dead = true; G.money += e.reward; earnCrystals(e.crystals ?? 3); onEnemyDeath(e); if (e.type === 'slime' && typeof sfxAt === 'function') sfxAt('monsterDown', e.x, e.y, 0.58, 'slime-death'); else sfx('kill'); } }
  for (const core of G.cores) if(core.hp<=0 && !core.dead) {
    core.dead=true; addLightFlash('core', core.x, core.y);
    SFX.play('glassBreak3', .85, 'core-break-3'); SFX.play('glassBreak4', .85, 'core-break-4');   // 核心碎裂：兩種玻璃碎裂聲疊在一起 earnCrystals(core.reward); flash('異質核心已摧毀 +'+core.reward+' 結晶',core.x,core.y,'#d69bff'); systemNotice('異質核心已摧毀，獲得 ' + core.reward + ' 結晶');
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
    if (f.shell) {   // 彈殼：拋出、受重力落地彈一下，之後躺在地上淡出
      f.x += f.vx * dt; f.y += f.vy * dt; f.rot += f.spin * dt;
      f.vz -= 420 * dt; f.z += f.vz * dt;
      if (f.z <= 0) {
        f.z = 0;
        if (f.vz < -40) { f.vz *= -.35; f.vx *= .5; f.vy *= .5; f.spin *= .5; }
        else { f.vz = 0; f.vx *= (1 - 8 * dt); f.vy *= (1 - 8 * dt); f.spin *= (1 - 8 * dt); }
      }
    } else if (f.dust) {   // 塵埃：往外飄、逐漸減速
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
    } else if (f.smoke) {   // 黑霧：往上飄、左右搖擺、上升逐漸變慢，微微被風吹向一側
      const age = f.life0 - f.life;
      f.x += (f.vx + Math.sin(age * 2.2 + f.ph) * 10) * dt; f.y += f.vy * dt;
      f.vy *= (1 - .3 * dt); f.vx += 4 * dt;
    } else if (f.mote) {    // 疏導光點：緩緩上飄、減速
      f.x += f.vx * dt; f.y += f.vy * dt;
      f.vy -= 8 * dt;
      f.vx *= (1 - 1.5 * dt); f.vy *= (1 - 1.2 * dt);
    } else if (f.sootheGlow && f.follow) {   // 疏導光環：跟著被疏導的哨兵移動
      f.x = f.follow.x; f.y = f.follow.y + (f.foy || -8);
    }
  }
  G.effects = G.effects.filter(f => f.life > 0);
  updateLightFlashes(dt);   // 攻擊閃光逐漸熄滅
  updateCombatFeel(dt);   // 屍體、黏液、地上痕跡
  updateBerserkFx(dt);    // 瀕臨暴走黑霧、暴走瞬間、疏導吹散
  updateOil(dt);          // 油汙、火海（js/oil-barrels.js）
  updateLandmines(dt);    // 地雷（js/landmine.js）
  // 波次（安全場景沒有波次，也不會有勝負）
  if (!MAP_SAFE && G.cores.length && G.cores.every(c=>c.dead) && G.enemies.length===0) win();
  updateHUD();
}
const FLASH_LIFE = 1.5;   // 提示字停留時間（秒）；想更久／更短改這裡
function flash(text, x, y, color, life = FLASH_LIFE) { G.effects.push({ text, x, y, life, life0: life, color, vy: -22 }); }
function sentryStatus(t, text, color = '#8fd3ff', warning = false) {
  flash(text, t.x, t.y - 30, color, 3);
  systemNotice((TYPES[t.type]?.name || '哨兵') + '：' + text, warning);
}
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
function warnCampAttack() {
  const now = performance.now();
  if (now - G.campWarningAt < 10000) return;
  G.campWarningAt = now;
  systemNotice('營地遭受攻擊', true);
  sfx('campWarning');
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
    '後室<b>一片漆黑</b>——只有營地和你身上的燈是亮的。<br><b>哨兵已在基地待命</b>：點擊哨兵可下指令（巡邏／指派位置／疏導）。<br>異質體會成群出現在<b>不同的黑暗角落</b>並四處遊蕩；進入感知範圍後會優先追擊哨兵，若被建築擋住就會先破壞建築。<br>放置<b>探照燈</b>與防禦設施控制戰場，在哨兵<b>暴走</b>前記得<b>疏導</b>。破壞所有異質核心並清除異質體即可控制 Y 區。<br>戰鬥中按 <b>P</b> 可以暫停。',
    '開始防禦');
}
function winOverlay() { showOverlay('✅ Y 區已控制', '所有異質核心與殘存異質體已清除！異質結晶已儲存，可用於哨兵培養。', '再玩一次'); }
// 失敗原因 → 標題與提示（player＝部隊長倒下、base＝地圖上的營地物件被摧毀）
const LOSE_TEXT = {
  player: ['💀 部隊長倒下', '溫特失去了戰鬥能力。<br>別離哨兵太遠，被異質體包圍時先退回亮處或營地。'],
  base:   ['💀 營地被摧毀', '異質體打穿了基地。<br>用防禦設施拖住牠們，並讓哨兵守在基地附近。'],
};
function loseOverlay(reason) { const [title, text] = LOSE_TEXT[reason] || LOSE_TEXT.base; showOverlay(title, text, '再挑戰'); }

function begin(playSound = true) { if (playSound) sfx('button'); closeElevatorMenu(); closeDialogue(true); closeSentryMenu(); closeGroundMenu(); assigning = null; setPaused(false); newGame(); G.phase = 'playing'; hideOverlay(); G.running = true; G.betweenWaves = 0.01; }
function win() { G.over = true; G.won = true; G.running = false; G.phase = 'won'; setPaused(false); sfx('win'); addStat('wins'); winOverlay(); }
function lose(reason) { G.over = true; G.running = false; G.phase = 'lost'; setPaused(false); sfx('lose'); loseOverlay(reason); }
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
