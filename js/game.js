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
// 失去戰鬥能力時的倒地圖（<資料夾>/<資料夾去掉底線>_fail.png）；有些角色用別張就寫在值裡（艾德林：躺在地上的那張，躺擔架的是 eldrinB_fail.png）
const FAIL_FILES = { winter_B: 'fail.png', theonie_B: 'fail.png', amber_B: 'fail.png', red_B: 'fail.png', luther_B: 'fail.png', avaren_B: 'fail.png', eldrin_B: 'fail02.png', chris_B: 'fail.png', colyn_B: 'fail.png', taana_B: 'fail.png' };
function loadCharacterSprites(folder) {   // folder 例如 'winter_B'
  const prefix = folder.replace('_', '') + '_';
  const revision = folder === 'chris_A' ? '?v=chris-a-20261021-2' : '';
  const set = {};
  for (const k of Object.keys(CHARACTER_SPRITE_FILES)) {
    set[k] = CHARACTER_SPRITE_FILES[k].map(file => {
      const img = new Image(); img.src = `images/character/${folder}/${prefix}${file}${revision}`; return img;
    });
  }
  if (FAIL_FILES[folder]) { const img = new Image(); img.src = `images/character/${folder}/${prefix}${FAIL_FILES[folder]}`; set.fail = img; }   // 倒地圖
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
  const base = String(folder).replace(/_[A-Z]$/, '');   // 造型字母：A＝安全區、B＝戰鬥區；其他字母（例如 C）＝只有一套、到哪都穿它
  const declared = /_([A-Z])$/.test(folder) ? folder.slice(-1) : 'B';
  let rec = OUTFIT_SETS[base];
  if (rec) return rec;
  rec = OUTFIT_SETS[base] = { A: null, B: null, declared };
  rec[declared] = loadCharacterSprites(base + '_' + declared);
  if (declared !== 'A' && declared !== 'B') return rec;   // 只有一套的造型（C…）：不用找另一套
  const other = declared === 'A' ? 'B' : 'A';
  const probe = new Image();   // 先確認另一套存在再載入，避免對沒有該造型的角色發出一堆 404
  probe.onload = () => { rec[other] = loadCharacterSprites(base + '_' + other); };
  probe.src = `images/character/${base}_${other}/${base}${other}_0000_Front.png` + (base === 'chris' && other === 'A' ? '?v=chris-a-20261021-2' : '');
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
function applyOutfits() {   // 每次開始遊戲／換地圖時呼叫；在衣櫃換了服裝也會呼叫（js/costumes.js）
  const costume = (id, folder) => typeof costumeOutfit === 'function' ? costumeOutfit(id, folder) : null;   // 衣櫃指定的服裝（沒指定＝照原本）
  const player = costume(PLAYER_CHARACTER, `${PLAYER_CHARACTER}_${PLAYER_OUTFIT}`) || outfitSet(`${PLAYER_CHARACTER}_${PLAYER_OUTFIT}`);
  for (const k of Object.keys(playerSprites)) delete playerSprites[k];   // 換穿的那套沒有持槍圖時，不要留著上一套的
  Object.assign(playerSprites, player);
  for (const type of Object.keys(TYPES)) if (TYPES[type].sprite) sentrySprites[type] = costume(type, TYPES[type].sprite) || outfitSet(TYPES[type].sprite);
  for (const profile of WANDERERS) wandererSprites[profile.id] = costume(profile.id, profile.sprite) || (RANDOM_OUTFITS.includes(profile.id) ? randomOutfitSet(profile.sprite) : outfitSet(profile.sprite));
}
// 每次進地圖隨機穿 A 或 B（各 50%），名單在 data/balance.js 的 RANDOM_OUTFITS
function randomOutfitSet(folder) {
  const rec = outfitRecord(folder);
  const base = String(folder).replace(/_[A-Z]$/, '');
  for (const k of ['A', 'B']) if (!rec[k]) rec[k] = loadCharacterSprites(base + '_' + k);
  return rec[Math.random() < 0.5 ? 'A' : 'B'];
}
applyOutfits();
// 雷德：盾牌造型圖集（redB_*_Shield.png，近戰舉盾時用）＋新斧頭圖（fire_axe_01）
const redAxeImg = new Image(); redAxeImg.src = 'images/weapon/fire_axe_01.png';
const avarenKnifeImg = new Image(); avarenKnifeImg.src = 'images/weapon/military_knife.png';
const lutherAxeImg = new Image(); lutherAxeImg.src = 'images/weapon/fire_axe_02.png';
const colynSwordImg = new Image(); colynSwordImg.src = 'images/weapon/long_sword.png';   // 柯林：長劍
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
ACTIVE_MONSTERS.forEach(monster => [monster.sprite, ...monsterFrameFiles(monster), ...Object.values(monster.art || {})].forEach(monsterImage));
function createMonster(spec, x, y, variant) {
  if (spec.behavior === 'burrow') Object.values(burrowMouseArt(spec)).forEach(monsterImage);
  const legacy = !Array.isArray(MAP?.monsterMix) || !MAP.monsterMix.length;
  const oldRules = legacy && spec.id === 'slime' ? (MAP.rules || {}) : {};
  const hp = Math.max(1, Math.round(spec.hp * difficultyOf('monsterHp')));   // 血量用怪物編輯器的設定 × 整體難度（data/balance.js）
  const dmg = n => n == null ? n : Math.round(n * difficultyOf('monsterDamage'));
  const monster = {
    type: spec.id, x, y, hp, maxhp: hp,
    speed: Number(oldRules.speed) || spec.speed,
    reward: oldRules.reward != null ? Number(oldRules.reward) : spec.reward,
    crystals: spec.crystals, playerDamage: dmg(spec.playerDamage),
    sentryDamage: dmg(spec.sentryDamage), buildingDamage: dmg(spec.buildingDamage),
    sprite: spec.sprite, drawWidth: spec.width, drawHeight: spec.height, frames: spec.frames || null, behavior: spec.behavior || null, chargerCfg: spec.charger || null,
    hitSound: spec.hitSound || null, deathSound: spec.deathSound || null,
    undying: !!spec.undying, noHitSquash: !!spec.noHitSquash, staggerTime: spec.stagger, knockMul: spec.knockMul ?? 1, noStun: !!spec.noStun, shockResist: spec.shockResist ?? null, sweep: spec.sweep || null,   /* shockResist：不怕電（雷電傷害倍率、不會麻痺） */   // 生命體：HP 歸零只會碎掉，要用火燒才會真的死（js/lifeform.js）
    shooterCfg: spec.shooter || null, art: spec.art || null, boomerangCfg: spec.boomerang || null, burrowCfg: spec.burrow || null,   // boomerang：夯吉寶（js/hangi-bao.js）
    flying: spec.behavior === 'shooter',   // 飄在空中：踩不到地雷
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
// 自己畫的特效：格數與顯示大小各自不同（images/Attack effects/<名稱>/frame_01.png…）
const CUSTOM_ATTACK_EFFECTS = { 'charge-impact': { frames: 6, size: 80, v: 2 } };   // 鳥頭人衝撞的撞擊（v：改圖後加 1，避免瀏覽器用舊圖）
const ATTACK_EFFECT_SIZE = {};
for (const [kind, cfg] of Object.entries(CUSTOM_ATTACK_EFFECTS)) {
  attackEffectFrames[kind] = Array.from({ length: cfg.frames }, (_, i) => {
    const img = new Image();
    img.src = `images/Attack%20effects/${kind}/frame_${String(i + 1).padStart(2, '0')}.png?v=${cfg.v || 1}`;
    return img;
  });
  ATTACK_EFFECT_SIZE[kind] = cfg.size;
}
// 怪物被打中的音效：有專屬音效的怪物（鳥頭人）每隻各自冷卻，連續被打時不會一直重複響
const MONSTER_HIT_SOUND_CD = .5;   // 秒
function sfxMonsterHit(e, gain, sourceId) {
  if (typeof sfxAt !== 'function' || !e) return;
  if (e.hitSound) {
    const now = performance.now();
    if (now < (e.hitSoundAt || -Infinity) + MONSTER_HIT_SOUND_CD * 1000) return;
    e.hitSoundAt = now;
    sfxAt(e.hitSound, e.x, e.y, gain, sourceId);
  } else sfxAt('monsterHit', e.x, e.y, gain, sourceId);
}
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

// 溫特受傷的聲音（Sound effects/玩家/slime-hit.mp3）
// gain＝相對音量（1＝一般被打；酸液池、火那種持續燙傷用小一點）
// byMonster＝true：被怪物打中，slime-hit 再加上 hit 一起播（playerHitMonster）
function playPlayerHit(gain = 1, byMonster = false) {
  if (typeof SFX === 'undefined' || !SFX.enabled) return;
  const name = byMonster ? 'playerHitMonster' : 'playerHit';
  SFX.play(name, .72 * gain / Math.max(.01, SFX.volume), 'player-hit');
}

// ---- NPC 正式對話（靠近後按 Space／Enter）----
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
  let best = null, bestDistance = NPC_TALK.radius * (typeof equipTalkReach === 'function' ? equipTalkReach() : 1);   // 無線電：戰鬥中疏導距離變遠
  const actors = [...(G.npcs || []), ...(G.towers || [])];
  for (const actor of actors) {
    if (actor.kind === 'tower' && (actor.hp <= 0 || actor.eatenBy)) continue;   // 被虱目魚小子吃掉的不能互動
    const distance = Math.hypot(actor.x - p.x, actor.y - p.y);
    if (distance < bestDistance) { best = actor; bestDistance = distance; }
  }
  return best;
}
// 附近有暴走（或汙染 70 以上快暴走）的哨兵：疏導優先，不會被營地、門、商店之類的互動搶走
function urgentSootheTarget() {
  const p = G && G.player; if (!p || p.sitting || MAP_SAFE) return null;
  const warnAt = typeof BERSERK_FX !== 'undefined' ? BERSERK_FX.warnAt : 70;
  let best = null, bestDistance = NPC_TALK.radius * (typeof equipTalkReach === 'function' ? equipTalkReach() : 1);
  for (const t of G.towers || []) {
    if (t.hp <= 0 || !(t.berserk || (t.taint || 0) >= warnAt)) continue;
    const distance = Math.hypot(t.x - p.x, t.y - p.y);
    if (distance < bestDistance) { best = t; bestDistance = distance; }
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
  const { actor, lines, index } = dialogueState, profile = actor ? (dialogueProfile(actor) || { name: '？？？' }) : { name: dialogueState.name || '' };
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
// 有填「第一次見面」「平常說話」「偶爾閒聊」的角色（data/dialogues.js）：第一次依序說完自我介紹，之後每次隨機說一句
const TALK_SEEN_KEY = 'tudrc_talk_seen_v1', TALK_CHAT_CHANCE = .25;
function specialTalkLines(actor) {
  const d = typeof DIALOGUES !== 'undefined' && DIALOGUES.characters?.[dialogueKey(actor)];
  if (!d) return null;
  const first = d.firstTalk || [], talk = d.talk || [], chat = d.chat || [];
  if (!first.length && !talk.length && !chat.length) return null;
  let seen = {}; try { seen = JSON.parse(localStorage.getItem(TALK_SEEN_KEY) || '{}') || {}; } catch (_) {}
  const id = dialogueKey(actor);
  if (first.length && !seen[id]) { seen[id] = 1; try { localStorage.setItem(TALK_SEEN_KEY, JSON.stringify(seen)); } catch (_) {} return first.slice(); }
  const pool = Math.random() < TALK_CHAT_CHANCE ? chat : talk;   // 四次有一次說「偶爾閒聊」；抽到的那一格沒填就不說話（不借用另一格）
  return pool.length ? [pool[Math.floor(Math.random() * pool.length)]] : null;
}
// 找他說話用哪一格（各用各的，沒填就不說話，不借用別格）：
// 通訊員有新任務要報告 →「報告任務」；有填「第一次見面／平常說話／偶爾閒聊」的角色 → 只用這幾格；其他：「找他說話（基地）」。
// 戰鬥中的隊員不能對話（10/22 拿掉「找他說話（出勤中）」）
const talkKeyOf = () => 'npc';
const hasSpecialTalk = actor => ['firstTalk', 'talk', 'chat'].some(k => (dialogueLines(dialogueKey(actor), k) || []).length);
function canTalk(actor) {   // 有沒有可以說的台詞（沒有就不顯示「與○○對話」、選單也沒有「對話」）
  if (!actor || (!MAP_SAFE && actor.kind === 'tower')) return false;   // 戰鬥中的隊員：不對話（空白鍵、C、F 是疏導、急救）
  if (typeof missionBriefReady === 'function' && missionBriefReady(actor)) return true;
  return hasSpecialTalk(actor) || (dialogueLines(dialogueKey(actor), talkKeyOf(actor)) || []).length > 0;
}
function openDialogue(actor) {
  if (!actor || dialogueState) return;
  if (actor.berserk) { flash('污染失控，現在無法對話', actor.x, actor.y - 32, '#ff8f8f'); sfx('error'); return; }
  const key = dialogueKey(actor), profile = dialogueProfile(actor);
  const lines = (typeof missionDialogueLines === 'function' && missionDialogueLines(actor))   // 通訊員有新任務要報告（js/missions.js）
    || (hasSpecialTalk(actor) ? specialTalkLines(actor) : dialogueLines(key, talkKeyOf(actor)));   // 第一次見面／平常說話／偶爾閒聊（例如塔納），或基地／出勤中的「找他說話」
  if (!lines || !lines.length) return;   // 這一格沒填：不說話
  if (typeof achieveRemember === 'function') achieveRemember('talked', key, 'talkedAll');   // 成就：跟每一位角色說過話
  dialogueState = { actor, lines, index: 0 };
  actor.target = null; actor.say = null; actor.sayWait = 2;
  MOVE_KEYS.forEach(key => { keys[key] = false; });
  faceEachOther(actor);
  closeSentryMenu(); closeGroundMenu(); closeBuildMenu();
  const set = actor.kind === 'tower' ? sentrySprites[actor.type] : wandererSprites[actor.id];
  const portrait = set && set.front && set.front[0];
  dialoguePortrait.src = portrait ? portrait.src : '';
  dialoguePortrait.alt = profile ? profile.name : 'NPC';
  dialoguePortrait.parentElement.dataset.char = actor.kind === 'tower' ? actor.type : actor.id;   // 個別角色的頭像裁切（css/style.css，例如球球）
  dialogueBox.classList.remove('hidden');
  renderDialogueLine(); sfx('menu');
  if (typeof onDialogueOpened === 'function') onDialogueOpened(actor);
  if (typeof onDialogueOpenedPractice === 'function') onDialogueOpenedPractice(actor);   // 塔納：開始訓練按鈕（js/practice.js）
  if (typeof onDialogueOpenedWorkshop === 'function') onDialogueOpenedWorkshop(actor);   // 諾亞：開發工坊按鈕（js/equipment.js）   // 好感度、送禮按鈕（js/gifts.js）
}
// 不是跟角色說話的對話框（海報、告示…）：name＝名稱欄、image＝左邊的圖、lines＝一句一句的文字
function openTextDialogue({ name, image, lines, kind = 'text' }) {
  if (dialogueState) return;
  dialogueState = { actor: null, name, lines: lines && lines.length ? lines : ['……'], index: 0 };
  MOVE_KEYS.forEach(key => { keys[key] = false; });
  closeSentryMenu(); closeGroundMenu(); closeBuildMenu();
  dialoguePortrait.src = image || ''; dialoguePortrait.alt = name || '';
  dialoguePortrait.parentElement.dataset.char = kind;   // css：整張圖縮進框裡（不是裁半身像）
  for (const id of ['dialogueGift', 'dialogueWorkshop', 'dialoguePractice']) document.getElementById(id)?.classList.add('hidden');
  document.getElementById('dialogueFavor')?.classList.add('hidden');
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
  if (typeof onDialogueClosed === 'function') onDialogueClosed();
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
  if (who.kind === 'tower' && who.hp <= 0 && set.fail && set.fail.complete && set.fail.naturalWidth) return set.fail;   // 失去戰鬥能力：倒地圖
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
  renderElevatorFloors();
  elevatorMenu.classList.remove('hidden');
  document.getElementById('elevatorClose').focus();
}
document.getElementById('elevatorClose').addEventListener('click', () => { sfx('switch'); closeElevatorMenu(); });
elevatorMenu.addEventListener('click', e => { if (e.target === elevatorMenu) { sfx('switch'); closeElevatorMenu(); } });
// 電梯能去的樓層：放了電梯的地圖（名稱開頭要有樓層：「1F餐廳」「4F哨兵宿舍樓」「B3」…；舊寫法「B-3」也認得），高樓層排上面。
// 房間（溫特辦公室…）名稱前面也有樓層，但沒有電梯，所以不會出現在電梯選單。
const ELEVATOR_FLOOR_RE = /^\s*(B-?\d+F?|\d+F)\s*[-－・]?\s*/i;
function elevatorFloors() {
  return mapList().map(m => {
    if (!(m.stamps || []).some(isElevatorStamp)) return null;   // 沒有電梯的房間：電梯不停
    const hit = ELEVATOR_FLOOR_RE.exec(String(m.name || '')); if (!hit) return null;
    const label = hit[1].toUpperCase().replace('-', ''), rest = String(m.name).slice(hit[0].length).trim();   // 「B-3」顯示成「B3」（正式寫法不加 -）
    const n = label.startsWith('B') ? -Number(label.replace(/\D/g, '')) : Number(label.replace(/\D/g, ''));
    return { id: m.id, label, rest, n };
  }).filter(Boolean).sort((a, b) => b.n - a.n);
}
function renderElevatorFloors() {
  const box = elevatorMenu.querySelector('.elevator-floors'); if (!box) return;
  box.innerHTML = elevatorFloors().map(f => {
    const here = MAP && f.id === MAP.id;
    // 目前所在的樓層：名稱照樣顯示，後面加一個小一點的「．目前所在」
    return '<button type="button" data-floor="' + f.id + '"' + (here ? ' class="sel" disabled' : '') + '><b>' + f.label + '</b>' + (f.rest || here ? '<small>' + f.rest + (here ? '<em class="floor-here">．目前所在</em>' : '') + '</small>' : '') + '</button>';
  }).join('') || '<p>沒有可以去的樓層</p>';
}
elevatorMenu.querySelector('.elevator-floors').addEventListener('click', e => {
  const button = e.target.closest('[data-floor]'); if (!button || button.disabled) return;
  sfx('button');
  closeElevatorMenu();
  enterPortal({ to: button.dataset.floor, elevator: true });
});
const MOVE_KEYS = ['w', 'a', 's', 'd', 'arrowup', 'arrowleft', 'arrowdown', 'arrowright'];
const anyMoveKey = () => MOVE_KEYS.some(k => keys[k]);
// 移動鍵用「實體按鍵位置」判斷（e.code），不看按鍵名稱：
// 開著注音等中文輸入法時，按鍵名稱會變成 "Process"，按下和放開對不上 → 角色一直往某個方向走（卡鍵）。
const MOVE_CODES = { KeyW: 'w', KeyA: 'a', KeyS: 's', KeyD: 'd', ArrowUp: 'arrowup', ArrowLeft: 'arrowleft', ArrowDown: 'arrowdown', ArrowRight: 'arrowright' };
const keyOf = e => ({KeyE:'e',Enter:'enter',NumpadEnter:'enter',Space:' '}[e.code]) || MOVE_CODES[e.code] || String(e.key || '').toLowerCase();
const releaseMoveKeys = () => MOVE_KEYS.forEach(k => { keys[k] = false; });
// 切到別的視窗／分頁時，放開的訊號收不到 → 當作全部放開
window.addEventListener('blur', releaseMoveKeys);
document.addEventListener('visibilitychange', () => { if (document.hidden) releaseMoveKeys(); });
window.addEventListener('keydown', e => {
  const k = keyOf(e);
  if (mapTransitioning) {
    if (MOVE_KEYS.includes(k) || isInteractKey(k)) e.preventDefault();
    return;
  }
  if (typeof missionBoardOpen !== 'undefined' && missionBoardOpen) return;
  if (typeof workshopOpen !== 'undefined' && workshopOpen) return;   // 開發工坊打開時，按鍵不控制角色   // 作戰桌打開時，按鍵不控制角色（Esc／Enter 在 js/missions.js）
  if (supplyShopOpen || backpackOpen || settingsOpen) {   // 商店、背包、設定打開時：Esc 關閉，其他按鍵不控制角色
    if (k === 'escape') { e.preventDefault(); if (supplyShopOpen) closeSupplyShop(); else closeBackpack(); }
    else if (k.startsWith('arrow') || ((k === ' ' || k === 'enter') && !(e.target instanceof HTMLButtonElement))) e.preventDefault();   // 按鈕上按 Enter／空白鍵照常可以按
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
    else if (!e.repeat && k === 'escape') { e.preventDefault(); closeDialogue(); }   // preventDefault：這次 Esc 用掉了（js/save.js 的 Esc 層級）
    return;
  }
  keys[k] = true;
  if(isInteractKey(k) && G && G.running && !G.over)e.preventDefault();
  if (k.startsWith('arrow') || k === ' ') e.preventDefault();   // 方向鍵／空白鍵不要捲動網頁
  if (!e.repeat && k === 'r' && G && G.running && !G.over && !MAP_SAFE && G.player && G.player.hp > 0) startReload(G.player);   // 手動裝填手槍的彈匣（特殊子彈不用裝填）
  if (npcArrangeMode) return;
  if (!e.repeat && isInteractKey(k) && G && G.running && !G.over) { // 互動鍵：Enter 或 E
    const elevator = (G.player && !G.player.sitting) ? elevatorNearPlayer() : null;
    const near = (G.player && !G.player.sitting) ? portalNearPlayer() : null;
    // 互動優先順序：① 拾取（異質碎片、地上的道具）→ ② 地圖物件（電梯、門、置物櫃…）
    // 隊員的疏導改成 C、急救是 F（js/equipment.js、js/shop.js），空白鍵不會再撿東西撿到一半變成疏導
    if (typeof pickShardsNearPlayer === 'function' && pickShardsNearPlayer()) {}   // 撿起地上的異質碎片（js/ore.js）
    else if (typeof pickupPropNearPlayer === 'function' && pickupPropNearPlayer() && useStoragePropNearPlayer(isPickupProp)) {}   // 拾取地上的道具（js/storage-lockers.js）
    else if (elevator) {
      if (elevator.mode === 'closed') {
        startElevatorOpen(elevator.stamp);
        sfx('elevator');
        const stamp = elevator.stamp;
        setTimeout(() => finishElevatorOpen(stamp), 550);
      } else if (elevator.mode === 'inside') openElevatorMenu();
    }
    else if (near) enterPortal(near.portal);   // 靠近出入口→進入另一張地圖
    else if (typeof pickShardsNearPlayer === 'function' && pickShardsNearPlayer()) {}   // 撿起地上的異質碎片（js/ore.js）
    else if (useStoragePropNearPlayer()) {}      // 鑰匙拾取與置物箱解鎖
    else if (useCampInteractionNearPlayer(true)) {}
    else if (useAmmoCrateNearPlayer()) {}       // 靠近彈藥箱→補滿照明彈
    else if (toggleIronGateNearPlayer()) {}
    else if (typeof usePracticeDoorNearPlayer === 'function' && usePracticeDoorNearPlayer()) {}   // 訓練室的門：訓練選單（js/practice.js）
    else if (toggleDoorNearPlayer()) {}         // 靠近手動門→開門／關門
    else if (typeof useMrtLockNearPlayer === 'function' && useMrtLockNearPlayer()) {}   // 捷運閘門刷卡、入口解封（js/mrt-locks.js）
    else if (typeof useNpcChatNearPlayer === 'function' && useNpcChatNearPlayer()) {}   // 有人在閒聊：聽閒聊（js/npc-chats.js）
    else if (typeof useWardrobeNearPlayer === 'function' && useWardrobeNearPlayer()) {}   // 衣櫃：服裝介面（js/costumes.js）
    else if (typeof useGachaNearPlayer === 'function' && useGachaNearPlayer()) {}   // 扭蛋機（js/gacha.js）
    else if (typeof useBestiaryNearPlayer === 'function' && useBestiaryNearPlayer()) {}   // 2F應變中心的電腦：怪物圖鑑（js/bestiary.js）
    else if (typeof useTargetTableNearPlayer === 'function' && useTargetTableNearPlayer()) {}   // 射擊訓練室的桌子：練習射擊（js/target-practice.js）
    else if (typeof usePosterNearPlayer === 'function' && usePosterNearPlayer()) {}   // 查看海報（js/posters.js）
    else if (typeof tryLockedDoorNearPlayer === 'function' && tryLockedDoorNearPlayer()) {}   // 鎖住的房門：溫特說「好像被鎖住了」（js/locked-doors.js）
    else if (typeof missionTableUsable === 'function' && missionTableUsable()) openMissionBoard();   // 作戰桌／作戰螢幕（js/missions.js；旁邊的椅子或人更近時讓給它們）
    else if (typeof vendingNearPlayer === 'function' && vendingNearPlayer()) openVendingMachine();   // 販賣機：只賣飲料（js/shop.js）
    else if (typeof drinkShopNearPlayer === 'function' && drinkShopNearPlayer()) openDrinkShop();   // 飲料店：只賣飲料（js/shop.js）
    else if (typeof backroomShopNearPlayer === 'function' && backroomShopNearPlayer()) openBackroomShop();   // 後室商店：杏仁水、賣東西（js/shop.js）
    else if (typeof shopCounterNearPlayer === 'function' && shopCounterNearPlayer()) openSupplyShop();   // HOME Mart 結帳櫃台：商店
    else {
      const actor = interactionNearPlayer();
      if (actor?.kind === 'tower' && !MAP_SAFE) {}   // 戰鬥區的隊員：C＝疏導、F＝急救（js/equipment.js、js/shop.js）
      else if (actor && canTalk(actor)) openDialogue(actor);   // 沒有台詞的人：空白鍵照樣可以坐下、擦塗鴉
      else if (typeof graffitiNearPlayer === 'function' && graffitiNearPlayer()) startGraffitiErase(graffitiNearPlayer());   // 擦掉塗鴉（js/graffiti.js）
      else toggleSit();                   // 附近沒有角色才判定座位
    }
  }
});
const isInteractKey = k => k === ' ' || k === 'enter';   // Space／Enter 互動（E 鍵已拿掉：對話也可以用滑鼠點對話框）
// ---- 出入口（走到門旁按 Space 進入另一張地圖）----
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
    if (typeof mrtPortalBlocked === 'function' && mrtPortalBlocked(pt)) continue;   // 封鎖中的捷運入口裡面的出入口不作用
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
  const source = { map: MAP, c: pt.c, r: pt.r, cols: MAP.cols, rows: MAP.rows,
    stair: !pt.elevator && typeof stairPortalDir === 'function' ? stairPortalDir(pt) : null };
  mapTransitioning = true;
  if (typeof achieveOnTravel === 'function') achieveOnTravel(pt.elevator ? 'elevator' : source.stair ? 'stair' : 'door');   // 成就：爬樓梯、只搭電梯
  Object.keys(keys).forEach(key => { keys[key] = false; });
  if (!pt.elevator) {   // 上／下樓梯：腳步聲；其他出入口：開門聲
    const stair = source.stair;
    sfx(stair === 'down' ? 'stairsDown' : stair === 'up' ? 'stairsUp' : 'door');
  }
  requestAnimationFrame(() => {
    mapTransition.classList.add('visible');
    setTimeout(() => {
      setTimeout(() => {
        switchMap(mapIndexById(pt.to));         // 全黑維持半秒後換地圖
        begin(false);                           // 重建並進入遊玩狀態，不播放開始按鈕聲
        const back = pt.elevator ? null : returnPortalCell(fromId, source);
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
window.addEventListener('keyup', e => {
  keys[String(e.key || '').toLowerCase()] = false;
  const mk = MOVE_CODES[e.code]; if (mk) keys[mk] = false;   // 移動鍵依實體按鍵放開（輸入法切換中也放得開）
  if (!mk && (e.key === 'Process' || !e.code)) releaseMoveKeys();   // 輸入法吃掉、看不出是哪個鍵放開：保險起見全部放開（還按著的話馬上又會被按下）
});

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
  t.summonDark = true;   // 召喚：途中遇到黑暗也照走（js/sentry.js 的 escapeDarkness）
  t.guardSummoned = guard;
  t.guardBase = null;
  sfx('button'); flash(TYPES[t.type].name + '：前往巡邏點', t.x, t.y - 24, '#8fd3ff', 3);
  systemNotice(TYPES[t.type].name + '正前往巡邏點');
  closeGroundMenu();
}
function summonAllSentriesToGround() {
  if (!groundTarget) return;
  const { c, r } = groundTarget, spots = [];
  for (let dr = -3; dr <= 3; dr++) for (let dc = -3; dc <= 3; dc++) {
    const cc = c + dc, rr = r + dr;
    if (!inGrid(cc, rr) || !sentryCellWalkable(cc, rr) || isEntrance(cc, rr)) continue;
    const [x, y] = center(cc, rr); if (isLit(x, y)) spots.push({ x, y, distance: dc * dc + dr * dr });
  }
  spots.sort((a, b) => a.distance - b.distance);
  let count = 0;
  for (const t of G.towers) {
    if (t.hp <= 0 || t.berserk || TYPES[t.type].guide) continue;
    const index = spots.findIndex(p => buildSentryPath(t, p.x, p.y, true) !== null);   // 召喚：可以穿過黑暗
    if (index < 0) continue;
    const p = spots.splice(index, 1)[0];
    t.mode = 'goto'; t.target = { x: p.x, y: p.y }; t.anchor = null; t.waitT = 0;
    t.navPath = null; t.navGoal = null; t.navFailed = false; t.guardSummoned = true; t.guardBase = null; t.summonDark = true;
    count++;
  }
  sfx(count ? 'button' : 'error');
  systemNotice(count ? '已召喚 ' + count + ' 位哨兵前往此處' : '沒有可到達此處的哨兵');
  if (count) closeGroundMenu();
}
function summonNearestSentryToGround() {
  if (!groundTarget) return;
  const { c, r } = groundTarget, [x, y] = center(c, r);
  if (!sentryCellWalkable(c, r)) {
    sfx('error'); flash('此處無法讓哨兵駐守', x, y, '#ff8f8f'); return;
  }
  const choices = G.towers.filter(t => t.hp > 0 && !t.berserk && !TYPES[t.type].guide)
    .map(t => ({ t, path: buildSentryPath(t, x, y, true) }))   // 召喚：可以穿過黑暗
    .filter(choice => choice.path !== null)
    .sort((a, b) => a.path.length - b.path.length ||
      Math.hypot(a.t.x - x, a.t.y - y) - Math.hypot(b.t.x - x, b.t.y - y));
  if (!choices.length) {
    sfx('error'); flash('沒有可到達此處的哨兵', x, y, '#ff8f8f'); return;
  }
  assignSentryToGround(choices[0].t, true);
}
// 可以拆除的：自己蓋的建築，以及地圖編輯器擺的障礙物（拒馬、油桶、地雷、滑動鐵門…）。
// 不能拆：基地（營地帳篷）、異質礦（要用爆炸炸開）
const canDemolish = o => !!o && !o.isBase && !o.ore
  && (o.playerBuilt || o.mapSource || (o.kind === 'obstacle' && !o.type));
function playerBuildingAt(c, r) {
  return [...G.obstacles].reverse().find(o =>
    canDemolish(o) && c >= o.c && r >= o.r && c < o.c + (o.w || 1) && r < o.r + (o.h || 1)
  ) || null;
}
// 拆除退錢：自己蓋的才退，依剩下的血量比例退（全滿退全部、剩一半退一半，無條件捨去）；地圖編輯器擺的不退
function demolishRefund(o) {
  const spec = o && o.playerBuilt && typeof buildableById === 'function' ? buildableById(o.type) : null;
  return spec ? Math.floor((spec.cost || 0) * Math.max(0, Math.min(1, o.hp / (o.maxhp || 1)))) : 0;
}
function demolishPlayerBuilding(o) {
  if (!canDemolish(o) || !G.obstacles.includes(o)) return false;
  const [fx, fy] = center(o.c + ((o.w || 1) - 1) / 2, o.r + ((o.h || 1) - 1) / 2);
  o.lastHitBy = 'demolish';   // 自己拆除的油桶不會爆炸也不會漏油
  removeBarrier(o);
  for (const t of G.towers) { t.navPath = null; t.navGoal = null; t.navTimer = 0; }
  for (const enemy of G.enemies) { enemy.aiPath = null; enemy.aiGoal = null; enemy.aiRouteTimer = 0; }
  computeFlow();
  const refund = demolishRefund(o);
  if (refund) G.money += refund;
  sfx('demolish'); flash(refund ? '已拆除　+$' + refund : '已拆除', fx, fy - 20, '#ffd479');
  spawnHammerHit(fx, fy, o);   // 槌子敲下去＋碎片＋煙塵（js/attack-fx.js）
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
  demolish.innerHTML = '<img class="gm-demolish-icon" src="images/weapon/icon-hammer.png" alt=""> 拆除';   // 跟建築欄的拆除按鈕同一支槌子
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
// 各哨兵對火海的反應：
//   immune（希奧妮）＝火燙不到、不躲；brave（雷德）＝找路不繞開火、直接穿過去；
//   只有站著不動、停在火中心附近時才慢慢走出來（還是會被燙）
const SENTRY_FIRE_TRAITS = { theonie: 'immune', red: 'brave' };
const SENTRY_FIRE_BRAVE = { core: .55, speed: 60 };   // 雷德：火海半徑幾成以內才走出來、走出來的速度（像素／秒）
const sentryFireTrait = t => (t && SENTRY_FIRE_TRAITS[t.type]) || null;
let sentryFireWalker = null;   // 目前正在找路的哨兵（js/sentry.js 的 sentryCellWalkable 依他的特性決定火能不能走）
// 隊友避開火海（油桶、油汙燒起來的火）：在火裡／貼邊時往外推，比腐蝕池推得快（暴走中不避）
function avoidOilFires(t, dt, moved = false) {
  if (MAP_SAFE || t.berserk || t.hp <= 0 || !G.oilFires || !G.oilFires.length) return;
  const trait = sentryFireTrait(t);
  if (trait === 'immune') return;   // 希奧妮：不怕火
  if (trait === 'brave' && moved) return;   // 雷德正在走（例如穿過火海）：不推他，讓他一口氣走過去
  for (const f of G.oilFires) {
    if (f.t <= 0) continue;
    let dx = t.x - f.x, dy = (t.y - f.y) / .7;
    if (Math.hypot(dx, dy) < 1) { const a = t.fireEscapeAng ??= Math.random() * Math.PI * 2; dx = Math.cos(a); dy = Math.sin(a); }   // 正好站在火中心：隨便挑一個方向逃
    const brave = trait === 'brave';
    const d = Math.hypot(dx, dy), margin = brave ? f.r * SENTRY_FIRE_BRAVE.core : f.r + 12;   // 雷德：只有在火中心附近才走
    if (d >= margin) continue;
    const ux = dx / d, uy = dy / d * .7, ul = Math.hypot(ux, uy) || 1;   // 橢圓往外的方向
    const step = Math.min(margin - d, (brave ? SENTRY_FIRE_BRAVE.speed : 170) * dt), nx = t.x + ux / ul * step, ny = t.y + uy / ul * step;
    const [cc, cr] = cellAt(nx, ny), [hc, hr] = cellAt(t.x, t.y);
    if (sentryCellWalkable(cc, cr, true)) { t.x = nx; t.y = ny; }
    else if (sentryCellWalkable(cellAt(nx, t.y)[0], hr, true)) t.x = nx;
    else if (sentryCellWalkable(hc, cellAt(t.x, ny)[1], true)) t.y = ny;
    t.navPath = null;
  }
}
function updateChaosSentry(t, spec, dt) {
  let best = null, bestD = Infinity;   // t.cd 已在呼叫前扣過
  const consider = (o, x, y) => { const d = Math.hypot(x - t.x, y - t.y); if (d < bestD) { bestD = d; best = { o, x, y }; } };
  for (const e of G.enemies) if (!e.dead) consider(e, e.x, e.y);
  for (const o of G.towers) if (o !== t && o.hp > 0) consider(o, o.x, o.y);
  if (G.player && G.player.hp > 0) consider(G.player, G.player.x, G.player.y);
  for (const o of G.obstacles) if (o.isBase && o.hp > 0) consider(o, (o.artX ?? OX + o.c * CELL) + o.w * CELL / 2, (o.artY ?? OY + o.r * CELL) + o.h * CELL / 2);
  for (const c of G.cores) if (!c.dead && c.awake) consider(c, c.x, c.y);
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
    t.cd = 1 / (spec.rate * (1 + sortieBuff(t, 'spd')));
    applyChaosDamage(t, best, spec);
  }
}
function applyChaosDamage(t, best, spec) {
  const rageMul = sentryDamageMul(t), o = best.o, dmg = spec.dmg * rageMul;   // 暴走時汙染 100：路德的亂打也是最痛的
  const heavy = spec.ability === '怪力' || spec.ability === '自癒' || spec.ability === '雷電';   // 近戰、雷電＝重擊，震退比較遠
  spawnAttackVisual(t, { x: best.x, y: best.y, hp: 1, maxhp: 1 }, rageMul > 1 ? { ...spec, dmg, rage: rageMul } : spec, [], { x: best.x, y: best.y });
  if (typeof sentryHitOre === 'function') sentryHitOre(t, { x: best.x, y: best.y }, (spec.splash || 0) * CELL);   // 暴走亂打也可能波及礦物
  if (G.enemies.includes(o)) { o.hp -= dmg; enemyHitReact(o, t.x, t.y, heavy); }
  else if (G.cores.includes(o)) { o.hp -= dmg; }
  else if (o === G.player) {
    o.hp = Math.max(0, o.hp - (typeof equipPlayerDamage === 'function' ? equipPlayerDamage(dmg) : dmg)); o.hitT = .3; G.damageVignetteT = Math.max(G.damageVignetteT, .3);
    playPlayerHit();   // 被暴走的隊員打到
    friendlyHitReact(o, t.x, t.y, dmg, heavy, t);   // 閃紅、震退、傷害數字
    if (o.hp <= 0 && !G.over) { if (typeof addStat === 'function' && achieveNotPractice()) addStat('downedBy:' + t.type); flash('部隊長失去戰鬥能力', o.x, o.y - 58, '#ff5b6e'); lose('player', '被暴走的' + (TYPES[t.type]?.name || '隊員') + '攻擊'); }
  } else if (o.isBase) {
    o.hp -= dmg; o.hitT = HIT_DUR;
    warnCampAttack();
    if (o.hp <= 0) { removeBarrier(o); flash('基地被摧毀！', OX + (o.c + o.w / 2) * CELL, OY + o.r * CELL - 18, '#ff5b5b'); if (!G.over) baseLost(); }
  } else if (G.towers.includes(o)) {   // 攻擊隊友
    const def = sentryDefense(o);
    o.hp = Math.max(0, o.hp - dmg * (1 - def));
    friendlyHitReact(o, t.x, t.y, dmg * (1 - def), heavy, t);   // 閃紅、震退、被打斷一下、喊話、傷害數字
    if (o.hp <= 0) { o.target = null; o.meleeSwing = null; sentryStatus(o, '失去戰鬥能力', '#ff5b6e', true); }
  }
}
function openCampMenu(base, clientX, clientY) {
  closeBuildMenu(); closeSentryMenu();
  groundTarget = null;
  groundMenu.innerHTML = '<div class="gm-title gm-camp-title">營地</div>';
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
  nearest.textContent = '🎯 召喚全部哨兵';
  nearest.addEventListener('click', summonAllSentriesToGround);
  groundMenu.appendChild(nearest);
  for (const t of G.towers) {
    const b = document.createElement('button');
    b.className = 'gm-sentry';
    const avatar = document.createElement('span'); avatar.className = 'gm-avatar';
    const portrait = sentrySprites[t.type]?.front?.[0];
    if (portrait) { const img = document.createElement('img'); img.src = portrait.src; img.alt = ''; avatar.appendChild(img); }
    const info = document.createElement('span'); info.className = 'gm-sentry-info';
    const name = document.createElement('strong'); name.textContent = TYPES[t.type].name;
    info.append(name); b.append(avatar, info);
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
  document.getElementById('screenShade').classList.remove('player-dying');   // 溫特陣亡動畫的變暗效果
  applyOutfits();   // 依這張地圖是安全區或戰鬥區，換成 A／B 造型
  closeElevatorMenu();
  closeSupplyShop(true); closeBackpack(true); closeSettings(true);
  if (typeof onGiftNewGame === 'function' && !(typeof practiceOn === 'function' && practiceOn())) onGiftNewGame();   // 出勤後大家又可以收禮
  if (typeof rememberSanitySP === 'function') rememberSanitySP();   // 換地圖前先記住目前的 SP（js/sanity.js）
  if (typeof rememberGuideSP === 'function') rememberGuideSP();
  if (typeof resetSmilers === 'function') resetSmilers();   // 黑暗中的笑臉（js/smiler.js）
  if (typeof onSortieNewGame === 'function' && !(typeof practiceOn === 'function' && practiceOn())) onSortieNewGame();   // 出勤時吃掉補給、回基地清掉效果（js/sortie-supply.js）
  setNpcArrangeMode(false);
  setPaused(false);
  document.getElementById('systemNotices').replaceChildren();
  G = {
    phase: 'ready', money: window.TEST_MODE ? Math.max(START.money, 99999) : START.money,
    campWarningAt: -Infinity,
    guide: START.guide, guideMax: START.guideMax, guideRegen: START.guideRegen,
    grid: {}, towers: [], npcs: [], obstacles: [], enemies: [], effects: [], acidPools: [], mapDestroyed: new Set(),
    recentMonsterSpawns: [],
    selType: null,
    battle: { kills: {}, crystals: 0, cores: 0, got: [], spent: 0, time: 0 },   // 這一局的統計（結算畫面用，js/battle-result.js）
    running: false, over: false, won: false, damageVignetteT: 0, cameraShakeT: 0,
  };
  // 錢：基地裡用錢包的錢；戰鬥地圖用這張地圖的作戰經費（上面的 START.money，來自地圖規則）
  if (MAP_SAFE && !window.TEST_MODE && typeof walletGet === 'function') G.money = walletGet();
  // 出勤：應變中心錢包裡的錢全部帶出來，加在這張地圖的作戰經費上（回基地時剩多少就帶回多少，js/progression.js）
  if (!MAP_SAFE && !window.TEST_MODE && typeof walletGet === 'function') G.money += walletGet();
  if (G.battle && !MAP_SAFE) G.battle.budget = G.money;
  computeFlow();
  seedMapObstacles();   // 把地圖裡預設的「可破壞障礙物」擺上場
  setupStorageBoxWalls();
  setupDoors();         // 門一開始都關著（js/doors.js）
  if (typeof setupMrtLocks === 'function') setupMrtLocks();   // 捷運閘門、封鎖的入口（js/mrt-locks.js）
  if (typeof setupBreakableWalls === 'function') setupBreakableWalls();   // 可炸開的牆：一開始都是完整的（js/breakable-walls.js）
  computeFlow();        // 地圖障礙物接管舊固定碰撞後，重算可走路線
  seedCores();
  spawnSentries();      // 三位哨兵開場就在基地（隨機位置）
  if (typeof achieveOnSortie === 'function') achieveOnSortie();   // 成就：同時帶著○○出勤
  spawnWanderers();     // 場景 NPC 只會在亮處自由走動
  const [px, py] = playerSpawnPos();
  G.player = { x: px, y: py, hp: PLAYER.hp ?? 100, maxhp: PLAYER.hp ?? 100, hitT: 0, underAttackT: 0, dir: 'front', moving: false, anim: 0, blinkWait: 2 + Math.random() * 3, blinkTime: -1 };
  updateCamera();
  if (typeof restoreSanitySP === 'function') restoreSanitySP();   // SP 帶到這張地圖，不補滿（js/sanity.js）
  updateHUD();
  updateBuildToggle();
}

// ---- 玩家出生點：基地地圖可指定格子；其他情況優先站營地，再找空地 ----
function playerSpawnPos() {
  if (MAP_SAFE && MAP && Array.isArray(MAP.playerSpawn) && MAP.playerSpawn.length === 2) {
    const [c0, r0] = MAP.playerSpawn.map(Number);
    if (Number.isInteger(c0) && Number.isInteger(r0) && inGrid(c0, r0)) {
      const exact = center(c0, r0), exactKey = c0 + ',' + r0;
      if (!isWall(c0, r0) && !isEntrance(c0, r0) && !G.grid[exactKey] && !playerBlocked(...exact)) return exact;
      const nearby = [];
      for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++) nearby.push([c, r]);
      nearby.sort((a, b) => Math.abs(a[0] - c0) + Math.abs(a[1] - r0) - Math.abs(b[0] - c0) - Math.abs(b[1] - r0));
      for (const [c, r] of nearby) {
        if (isWall(c, r) || isEntrance(c, r) || G.grid[c + ',' + r]) continue;
        const pos = center(c, r);
        if (!playerBlocked(...pos)) return pos;
      }
    }
  }
  const cand = [];
  campCells.forEach(k => cand.push(k.split(',').map(Number)));
  for (let r = ROWS - 1; r >= 0; r--) for (let c = 0; c < COLS; c++) cand.push([c, r]);
  for (const [c, r] of cand) if (inGrid(c, r) && !isWall(c, r) && !isEntrance(c, r)) return center(c, r);
  return center(Math.floor(COLS / 2), ROWS - 1);
}
// ---- 玩家移動與碰撞（牆、哨兵、障礙物都擋路；水平垂直分開判斷可貼牆滑行）----
function playerBlocked(x, y) {
  if (typeof burrowMouseBlocksActor === 'function' && burrowMouseBlocksActor(x, y, PLAYER.r)) return true;
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
    const extra = (typeof CHAIR_EXTRA_SEATS !== 'undefined' && CHAIR_EXTRA_SEATS[s.id]) || [];
    const spots = [cfg.seat, ...extra.map(e => ({ ...cfg.seat, ...e }))], multi = spots.length > 1;   // 長椅：一張坐好幾個人
    for (const spot of spots) {
    let dir = spot.dir || 'front';
    if (s.fx && (dir === 'left' || dir === 'right')) dir = dir === 'left' ? 'right' : 'left';   // 椅子翻面→人也跟著翻
    if (s.fy && (dir === 'front' || dir === 'back')) dir = dir === 'front' ? 'back' : 'front';
    const sy = y0 + (s.fy ? h - spot.y : spot.y);
    seats.push({
      x: x0 + (s.fx ? w - spot.x : spot.x),
      y: sy,
      top: multi ? sy - 50 : y0, dir, x0, y0, w, h, multi,
      rotation: (Number(cfg.seat.rotation) || 0) * (s.fx ? -1 : 1),   // 床左右翻轉：躺的方向也跟著翻
      prompt: /bed|床/i.test(s.id) ? '躺' : '坐',
      bed: /bed|床/i.test(s.id),
      // 背面的椅子：人背對鏡頭坐著，椅背擋在人前面 → 椅子要畫在人物上面（床不算）
      chairInFront: dir === 'back' && !/bed|床/i.test(s.id),
      sortY: occ ? occ.y : y0 + cfg.depth,
      key: s.id + '@' + s.c + ',' + s.r,   // 這張椅子的編號（成就「坐過每張椅子」，js/achievements.js）
    });
    }
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
    const d = s.multi ? Math.max(0, Math.hypot(s.x - p.x, s.y - p.y) - 24) : Math.hypot(dx, dy);   // 長椅：量到各個位子，靠哪個坐哪個
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
  if (typeof achieveOnSit === 'function') achieveOnSit(seat);   // 成就：坐過的椅子、躺過的床
}
function standUp() {
  const p = G.player; if (!p || !p.sitting) return;
  const from = p.sitFrom || { x: p.x, y: p.y + CELL };
  p.x = from.x; p.y = from.y;
  p.sitting = null; p.sitFrom = null;
  sfx('switch');
}

// ---- 衝刺：按 Shift，DASH.time 秒內走路速度 ×DASH.mul（跟跑鞋、腎上腺素等加成相乘：腎上腺素中就是腎上腺素的速度再 ×2），冷卻 DASH.cd 秒 ----
// trail：衝刺時身後的殘影（每隔幾秒留一個、留多久）；基地、戰鬥地圖都可以衝
const DASH = { mul: 2, time: .5, cd: 3, trailGap: .035, trailLife: .25 };
let dashPressedAt = -1;
window.addEventListener('keydown', e => {
  if (e.key !== 'Shift' || e.repeat || e.ctrlKey || e.altKey || e.metaKey) return;
  if (e.target instanceof Element && e.target.closest('input, textarea, select, [contenteditable]')) return;
  dashPressedAt = performance.now();   // 真正開始衝刺在 updatePlayer（選單開著、坐著、被纏住時不會衝）
});
// dashPart：這一格（dt）有幾成時間在衝刺（最後一格只衝一部分），所以不管畫面幾 fps，衝刺都剛好 DASH.time 秒
const dashMul = p => 1 + (DASH.mul - 1) * ((p && p.dashPart) || 0);
function startDashIfPressed(p, dt) {
  if (dashPressedAt < 0) return;
  const fresh = performance.now() - dashPressedAt < 150; dashPressedAt = -1;
  if (!fresh || p.dashCd > 0 || p.hp <= 0) return;   // 冷卻中：沒反應
  p.dashPart = Math.min(1, DASH.time / dt); p.dashT = Math.max(0, DASH.time - dt); p.dashCd = DASH.cd - dt; p.dashTrail = [];   // 這一格就開始衝
  if (typeof sfxAt === 'function') sfxAt('swordSwing', p.x, p.y, .32, 'dash');   // 咻一聲
}
function updatePlayer(dt) {
  const p = G.player; if (!p) return;
  p.dashPart = dt > 0 ? Math.min(dt, p.dashT || 0) / dt : 0;   // 衝刺剩下的時間、冷卻
  p.dashT = Math.max(0, (p.dashT || 0) - dt); p.dashCd = Math.max(0, (p.dashCd || 0) - dt);
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
  if (p.rootT > 0) { p.moving = false; p.anim = 0; p.knockT = 0; return; }   // 被絲瓜藤纏住：不能移動（js/loofah-lady.js）
  if (stepActorKnock(p, dt, playerBlocked)) { p.moving = false; p.anim = 0; return; }   // 被鳥頭人撞飛：滑行中不能走（js/bird-head.js）
  startDashIfPressed(p, dt);   // Shift：衝刺（能走路的時候才算）
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
  const len = Math.hypot(dx, dy), step = PLAYER.speed * (typeof equipSpeedMul === 'function' ? equipSpeedMul() : 1) * dashMul(p) * dt   // 輕量跑鞋、腎上腺素（js/equipment.js）× 衝刺
    * (typeof slowFactorAt === 'function' ? slowFactorAt(p.x, p.y, 'ally') : 1);   // 走在鐵絲網上變慢
  const nx = p.x + dx / len * step, ny = p.y + dy / len * step;
  if (!playerBlocked(nx, p.y)) p.x = nx; else if (!dy) slideIntoGap(p, 'x', nx - p.x, step);
  if (!playerBlocked(p.x, ny)) p.y = ny; else if (!dx) slideIntoGap(p, 'y', ny - p.y, step);
  if (p.dashPart > 0) {   // 衝刺中：身後留殘影（js/render.js 的 drawDashTrail）
    const now = performance.now() / 1000, tr = p.dashTrail || (p.dashTrail = []);
    if (!tr.length || now - tr[tr.length - 1].t >= DASH.trailGap) tr.push({ x: p.x, y: p.y, t: now });
  }
}
// 走進一格寬的開口：正面被擋住，但往旁邊挪一點就過得去 → 自動往開口中間滑（不用對得很準）
const GAP_ASSIST = 18;   // 最多幫忙對齊幾像素（一格 40）
function slideIntoGap(p, axis, move, step) {
  for (let off = 2; off <= GAP_ASSIST; off += 2) for (const sign of [-1, 1]) {
    const sx = axis === 'y' ? sign * off : 0, sy = axis === 'x' ? sign * off : 0;
    if (playerBlocked(p.x + sx + (axis === 'x' ? move : 0), p.y + sy + (axis === 'y' ? move : 0))) continue;   // 挪過去之後往前還是過不去
    if (playerBlocked(p.x + sx, p.y + sy)) continue;                                                          // 旁邊本身就是牆
    const k = Math.min(step, off);
    if (axis === 'y') p.x += sign * k; else p.y += sign * k;
    return true;
  }
  return false;
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
cv.addEventListener('contextmenu', e => {
  e.preventDefault();
  // 正在放建築（或拆除模式）：右鍵＝取消，不開選單
  if (G && G.selType && (G.selType.startsWith('build:') || G.selType === 'demolish')) { closeBuildMenu(); sfx('switch'); return; }
  if (!npcDrag) handleMapClick(e, false);
});
cv.addEventListener('mousemove', e => { aimClient = { x: e.clientX, y: e.clientY }; });
// 隊員頭上的「急救」「疏導」只是按鍵提示（F 急救、C 疏導），滑鼠點不到（js/render.js 的 drawTowerPrompts）
cv.addEventListener('mousedown', e => {
  if (e.button !== 0) return;
  aimClient = { x: e.clientX, y: e.clientY };
  if (e.ctrlKey && !MAP_SAFE && G?.running && !G.over && !dialogueState && !elevatorMenuOpen && !supplyShopOpen && !backpackOpen && !settingsOpen) {
    e.preventDefault();
    closeGroundMenu(); closeSentryMenu();
    aimHeld = true; shotQueuedAt = performance.now();
    return;
  }
  aimHeld = handleMapClick(e, true);   // 回傳 true（點空地）才開始射擊；開了選單/放建築則不射
  if (aimHeld) shotQueuedAt = performance.now();   // 連點：每按一下至少開一槍（js/game.js 的 updatePlayerAttack）
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
  if (e.key === 'Escape' && npcArrangeMode) { e.preventDefault(); setNpcArrangeMode(false); }
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
  if (!G.running || dialogueState) return false;
  // 點在地圖外面（例如高個子怪物、異質核心的頭超出地圖上緣）：左鍵照樣朝游標開槍
  if (!inGrid(c, r)) return isLeft && !MAP_SAFE && !assigning && !G.selType;

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
    else { sfx('error'); flash('這裡沒有可以拆除的東西', x, y - 18, '#ff8f8f'); }
    return false;
  }

  // ── 哨兵／營地／自己蓋的建築：只有右鍵開選單（左鍵照常開槍）；哨兵站在營地裡時哨兵優先 ──
  const hitR = t => (t.berserk || (t.taint || 0) >= 70 ? 12 : 0) + (sentrySprites[t.type] ? 28 : 22);   // 暴走中的哨兵點擊範圍放大，比較好點到
  const hit = !isLeft && G.towers.find(t => Math.hypot(t.x - x, t.y - (sentrySprites[t.type] ? 14 : 0) - y) <= hitR(t));
  if (hit) { closeGroundMenu(); openSentryMenu(hit); return false; }
  const campBase = !isLeft && !MAP_SAFE && campBaseAt(x, y);
  if (campBase) { closeSentryMenu(); openCampMenu(campBase, e.clientX, e.clientY); return false; }
  closeSentryMenu();
  if (MAP_SAFE) { closeGroundMenu(); return false; }
  const clickedBuilding = playerBuildingAt(c, r);
  if (clickedBuilding) {
    if (isLeft) { closeGroundMenu(); return true; }   // 左鍵點到建築：不開拆除選單，當成開槍
    spawnGroundRipple(e.clientX, e.clientY); openBuildingMenu(clickedBuilding, c, r, e.clientX, e.clientY); return false;
  }
  // 點到牆、出入口、地圖上的物件：右鍵不開選單；左鍵照樣開槍
  // （高個子怪物、異質核心站在牆邊時，頭會畫在牆那一格上面，以前點頭會被當成點到牆而不開槍）
  if (buildAt(c, r) || isWall(c, r) || isEntrance(c, r)) { closeGroundMenu(); return isLeft; }

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
// 打異質核心可以多搆遠一點：核心本身很大，腳下又有腐蝕池（隊員會站在池子外面），近戰才打得到
const CORE_HIT_PAD = 36;
function pickSentryTarget(t, R) {
  const p = G.player;
  const marked = typeof paintTarget === 'function' && paintTarget();   // 被漆彈標記的怪物：射程內看得到就先打牠（js/special-guns.js）
  if (marked && Math.hypot(marked.x - t.x, marked.y - t.y) <= R && hasLineOfSight(t.x, t.y, marked.x, marked.y)) return marked;
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
    if (core.dead || !core.awake) continue;   // 沉睡的核心不打（只有溫特開槍或阿瓦倫靠近才會叫醒）
    const distance = Math.hypot(core.x - t.x, core.y - t.y);
    if (distance <= R + CORE_HIT_PAD && distance < bestScore && hasLineOfSight(t.x, t.y, core.x, core.y)) { best = core; bestScore = distance; }
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
  // 柯林：突擊連刺（stabs＝第幾秒刺：先往後蓄力 0.25 秒，接著 0.5 秒內連刺 3 下，再收招，整招 duration 秒；每下 stabDmg；
  //       第一刺起目標破甲 breakT 秒＝受到所有人的傷害 ×breakMul；整招只加 taint 汙染）
  colyn:   { cd: 8, stabs: [.25, .42, .59], stabDmg: 20, duration: 1, breakMul: 1.1, breakT: 3, taint: 3 },
};
const ULT_SWING = { wind: .6, impact: .8, duration: 1.2 };   // 大招：長前搖→放招→收招
// 哨兵的精神負荷增加（出勤補給可以減少）；到 100 暴走。嚮導沒有負荷
function addSentryTaint(t, amount) {
  if (!TYPES[t.type].guide) t.taint = Math.min(100, t.taint + amount * Math.max(0, 1 - sortieBuff(t, 'calm')));   // 出勤補給：負荷累積變慢
  if (t.taint >= 100 && !t.berserk) { t.berserk = true; sfx('berserk'); flash('暴走!', t.x, t.y - 30, '#ff4d4d', 3); systemNotice(TYPES[t.type].name + '污染達到極限，陷入暴走，開始無差別攻擊！', true); }
}
// 柯林的突擊連刺：每到一個刺擊時間點就刺一下；目標死了或跑出射程，剩下的就不刺
function colynStabStep(t, spec, swing) {
  const U = ULTIMATES[t.type];
  while (swing.stabIdx < swing.stabs.length && swing.age >= swing.stabs[swing.stabIdx]) {
    swing.stabIdx++;
    const foe = swing.target;
    if (!foe || foe.dead || foe.hp <= 0 || Math.hypot(foe.x - t.x, foe.y - t.y) > spec.range * CELL + 12 + (G.cores.includes(foe) ? CORE_HIT_PAD : 0)) { swing.stabIdx = swing.stabs.length; return; }
    const isEnemy = G.enemies.includes(foe), dmg = U.stabDmg * sentryDamageMul(t), col = spec.color || '#e9f2ff';   // 劍光顏色＝角色資料頁的特效顏色
    if (isEnemy && swing.stabIdx === 1) { foe.breakT = U.breakT; flashDmg('破甲', foe.x, foe.y - 46, '#ffcf6a'); }   // 第一刺：破甲（受到的傷害加成在死亡判定前統一算，所有人打牠都有）
    foe.hp -= dmg;
    swing.lungeAt = swing.age;   // 劍往前刺的動畫（js/render.js 的 drawColynSword）
    const a = Math.atan2(foe.y - t.y, foe.x - t.x);
    G.effects.push({ bullet: true, x1: t.x + Math.cos(a) * 10, y1: t.y - 8 + Math.sin(a) * 8, x2: foe.x + Math.cos(a) * 8, y2: foe.y - 6, life: .12, life0: .12, color: col });   // 刺擊的劍光
    G.effects.push({ ring: true, x: foe.x, y: foe.y, r: 3, r2: 14, life: .16, life0: .16, color: col });
    if (isEnemy) { aggroOnSentry(foe, t); foe.hitT = Math.max(foe.hitT || 0, .16); foe.hitColor = col; enemyHitReact(foe, t.x, t.y, swing.stabIdx === swing.stabs.length); sfxMonsterHit(foe, 0.48, 'colyn-ult'); }
    flashDmg('-' + Math.round(dmg * (isEnemy && foe.breakT > 0 ? U.breakMul : 1)), foe.x, foe.y - 26, col);
    playSentryAttackSound(t);
  }
}
// 近戰普攻的節奏（秒，從出手開始算）：wind＝舉起蓄力結束、impact＝命中瞬間、duration＝收招完成
const MELEE_SWING = {
  normal: { wind: .19, impact: .30, duration: .58 },   // 雷德
  luther: { wind: .29, impact: .43, duration: .78 },   // 路德：重擊，比較慢
  avaren: { wind: .11, impact: .18, duration: .36 },   // 阿瓦倫：短刀，快而俐落
  colyn:  { wind: .1, impact: .16, duration: .34 },    // 柯林：長劍快攻（每秒 1.6 下，收招要比攻擊間隔短）
};
// 玩家（溫特）攻擊：按住左鍵朝游標方向開槍。彈匣 6 發，打完或按 R 裝填；傷害很低、會吸引仇恨。
const PLAYER_ATK = CHARACTERS.winter.playerAttack || { range: 6, dmg: 3, rate: 5, aggro: 3.5, cone: 0.44, mag: 6, reloadTime: 2 };
if (typeof applyWeaponLevels === 'function') applyWeaponLevels();   // 武器等級（找諾亞升級；js/equipment.js）
const GUIDE_GUN_TYPES = new Set(['eldrin', 'chris']);
const GUIDE_GUN = { mag: 6, reloadTime: 2 };
let aimHeld = false, aimClient = null;
// 快速連點：按下到放開比一幀還短（或剛好在射速冷卻中）時，這一下也要開得到槍 → 先記下來，SHOT_QUEUE 秒內冷卻好了就補開
let shotQueuedAt = -Infinity;
const SHOT_QUEUE = .3;
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
// 溫特開槍時，這個目標能不能打：回傳 { d 距離, onBody 游標是不是直接點在牠身上 }，不能打就回傳 null。
// 看得到牠身上「任何一個地方」就打得到：腳底、腳邊靠溫特這一側、身體中間、頭、身體左右兩側。
// （以前只看腳底：站在牆邊的高個子怪物、異質核心，腳底那條線常擦到牆角，就變成打不到。）
const SHOT_BODY_PAD = 8;   // 游標點在身體框外幾像素內也算點到
function playerShotCheck(p, e, aim, angDiff) {
  const isCore = G.cores.includes(e);
  if (e.dead) return null;
  const box = targetBodyBox(e);
  const lit = bodyVisible(box, e.x, e.y) || isLit(e.x, e.y) || isLit(box.cx, box.cy);   // 畫面上看得到就打得到
  if (!lit) return null;
  const d = Math.hypot(e.x - p.x, e.y - p.y);
  if (d > PLAYER_ATK.range * CELL) return null;
  const pad = SHOT_BODY_PAD;
  const onBody = aim.x >= box.x0 - pad && aim.x <= box.x1 + pad && aim.y >= box.y0 - pad && aim.y <= box.y1 + pad;
  const ux = (p.x - e.x) / (d || 1), uy = (p.y - e.y) / (d || 1), h = box.y1 - box.y0;
  const spots = [
    [e.x, e.y],                                  // 腳底
    [e.x + ux * 16, e.y + uy * 16],              // 腳邊靠溫特這一側（貼著牆站時，腳底那一點常擦到牆角）
    [box.cx, box.cy],                            // 身體中間
    [box.cx, box.y0 + h * .2],                   // 頭（站在矮牆後面時，上半身從牆上方露出來）
    [box.x0 + 6, box.cy], [box.x1 - 6, box.cy],  // 身體左右兩側
  ];
  if (!spots.some(([x, y]) => hasLineOfSight(p.x, p.y, x, y))) return null;   // 整個身體都被牆擋住
  const da = Math.min(angDiff(e.x, e.y), angDiff(box.cx, box.cy));
  if (!onBody && da > PLAYER_ATK.cone) return null;
  return { d, onBody };
}
function updatePlayerAttack(dt) {
  const p = G.player;
  if (!p || MAP_SAFE) { updateAmmoHud(); return; }
  if (p.ammo == null) p.ammo = PLAYER_ATK.mag;
  if (p.gunT > 0) p.gunT -= dt;
  if (p.recoilT > 0) p.recoilT -= dt;
  p.atkCd = (p.atkCd || 0) - dt;
  if (aimHeld && p.hp > 0) p.gunT = Math.max(p.gunT, 0.3);   // 按住時持續舉槍，不會射完一發就跳回
  if (G.over || dialogueState || elevatorMenuOpen) shotQueuedAt = -Infinity;   // 選單、對話開著：剛才那一下不要留到之後才開
  const wid = playerWeapon(p).id, paint = wid === 'paint';   // 裝的子彈（滾輪換，js/flare.js）
  if (p.reloadT > 0) {   // 手槍彈匣裝填中（換成特殊子彈時也會繼續裝）
    p.reloadT -= dt;
    if (p.reloadT <= 0) { p.ammo = PLAYER_ATK.mag; }
    if (wid === 'pistol') { updateAmmoHud(); return; }
  }
  updateAmmoHud();
  const queued = performance.now() - shotQueuedAt < SHOT_QUEUE * 1000;   // 剛點了一下（已經放開也算）
  const canFire = !(p.hp <= 0 || !(aimHeld || queued) || !aimClient || p.atkCd > 0 || p.soothingT > 0 || G.over || dialogueState || elevatorMenuOpen);   // 疏導中不開槍
  if (canFire) shotQueuedAt = -Infinity;   // 這一下開了：用掉
  if (wid === 'flare') { updateFlareGun(p, dt, canFire ? clientToWorld(aimClient.x, aimClient.y) : null, canFire); return; }   // 照明彈（js/flare.js）
  if (playerWeapon(p).special) { updateSpecialGun(wid, p, dt, canFire ? clientToWorld(aimClient.x, aimClient.y) : null, canFire); return; }   // 燃燒彈、麻醉彈（js/special-guns.js）
  if (!canFire) return;
  const aim = clientToWorld(aimClient.x, aimClient.y);
  if (paint) { if (bulletCount('paint') <= 0) { dryFire(p, aim, 'paint'); return; } }   // 漆彈打完：只會「喀」一聲
  else if (p.ammo <= 0) { startReload(p); return; }   // 空彈匣→自動裝填
  const adx = aim.x - p.x, ady = aim.y - p.y, aimAng = Math.atan2(ady, adx);
  if (paint) { p.atkCd = BULLETS.paint.gap; useBullet('paint'); }   // 漆彈：跟一般子彈一樣瞄準，打中的怪物被標記（不扣血）
  else { p.atkCd = 1 / PLAYER_ATK.rate; p.ammo--; }
  p.dir = Math.abs(adx) >= Math.abs(ady) ? (adx < 0 ? 'left' : 'right') : (ady < 0 ? 'back' : 'front');
  p.gunT = 0.45; p.recoilT = 0.12; p.recoilAng = aimAng;   // 持槍姿勢（每發刷新，連射時持續舉槍）＋後座力
  const vineMate = !paint && typeof vineShotTarget === 'function' ? vineShotTarget(aim) : null;   // 游標點在被絲瓜藤纏住的隊友身上：子彈射斷藤蔓（js/loofah-lady.js）
  if (vineMate) { shootVine(p, vineMate, aim, aimAng); return; }
  // 朝游標方向、射程內、照亮的最近怪。
  // 浮在空中／很高的目標（珍珠小童、異質核心）畫面上的身體比腳底高：游標直接點在身體上就一定打中；
  // 扇形判定也同時看腳底和身體中心，取比較接近的角度。
  let best = null, bestD = PLAYER_ATK.range * CELL, bestOnBody = false;
  const angDiff = (x, y) => { let da = Math.abs(Math.atan2(y - p.y, x - p.x) - aimAng); return da > Math.PI ? 2 * Math.PI - da : da; };
  for (const e of paint ? G.enemies : [...G.enemies, ...G.cores]) {   // 漆彈只標記怪物
    const shot = playerShotCheck(p, e, aim, angDiff);
    if (!shot) continue;
    // 點在身上的目標優先；同樣是點在身上或同樣在扇形內，就打最近的
    if ((shot.onBody && !bestOnBody) || (shot.onBody === bestOnBody && shot.d < bestD)) { bestD = shot.d; best = e; bestOnBody = shot.onBody; }
  }
  for (const o of paint ? [] : G.obstacles) {   // 油桶／油箱、異質礦也能瞄準（開槍打爆／慢慢打碎）；漆彈不打
    const isOil = oilItem(o), isOre = o.ore && typeof oreProxy === 'function';
    if ((!isOil && !isOre) || o.hp <= 0) continue;
    const c = isOil ? oilCenter(o) : oreCenter(o), d = Math.hypot(c.x - p.x, c.y - p.y);
    if (d > PLAYER_ATK.range * CELL || !isLit(c.x, c.y) || !hasLineOfSight(p.x, p.y, c.x, c.y)) continue;
    if (isOil) {
      const left = o.artX ?? OX + o.c * CELL, top = o.artY ?? OY + o.r * CELL;
      if (aim.x >= left && aim.x <= left + (o.w || 1) * CELL && aim.y >= top && aim.y <= top + (o.h || 1) * CELL) {
        best = oilProxy(o); bestD = d; bestOnBody = true; continue;
      }
    }
    if (bestOnBody) continue;
    let da = Math.abs(Math.atan2(c.y - p.y, c.x - p.x) - aimAng); if (da > Math.PI) da = 2 * Math.PI - da;
    if (da <= PLAYER_ATK.cone && d < bestD) { bestD = d; best = isOil ? oilProxy(o) : oreProxy(o); }
  }
  const hitPt = best && !best.oilRef && !best.oreRef ? (() => { const b = targetBodyBox(best); return { x: b.cx, y: b.cy }; })() : best;   // 子彈打在身體上，不是腳底
  let endX = best ? hitPt.x : p.x + Math.cos(aimAng) * PLAYER_ATK.range * CELL;
  let endY = best ? hitPt.y : p.y + Math.sin(aimAng) * PLAYER_ATK.range * CELL;
  if (paint) {   // 漆彈：粉紅色的彈道，打中的怪物沾上螢光漆（js/special-guns.js 的 paintMark）
    const { x: mx, y: my } = gunMuzzleAt(p, aimAng), col = BULLETS.paint.color;
    G.effects.push({ muzzle: true, x: mx, y: my, ang: aimAng, life: .06, life0: .06 });
    G.effects.push({ bullet: true, x1: mx, y1: my, x2: endX, y2: endY, life: .09, life0: .09, color: col });
    G.effects.push({ ring: true, x: endX, y: endY, r: 3, r2: best ? 14 : 8, life: .2, life0: .2, color: col });
    if (best) paintMark(best);
    SFX.play('gunshot', .55, 'paint-shot');
    return;
  }
  let eggShot = null;
  if (!best && typeof shootFishEggOnLine === 'function') {   // 沒打到怪物：打中魚卵就引爆（js/clownfish.js）
    eggShot = shootFishEggOnLine(p.x, p.y, endX, endY);
    if (eggShot) { endX = eggShot.x; endY = eggShot.y; }
  }
  if (!best && !eggShot && typeof shootHangiCapOnLine === 'function') {   // 沒打到怪物：打到順順宮帽就把它打開（js/hangi-bao.js）
    const capHit = shootHangiCapOnLine(p.x, p.y, endX, endY);
    if (capHit) { endX = capHit.x; endY = capHit.y; G.effects.push({ ring: true, x: endX, y: endY, r: 2, r2: 9, life: .14, life0: .14, color: '#ffe79a' }); }
  }
  const { x: mx, y: my } = gunMuzzleAt(p, aimAng);
  G.effects.push({ muzzle: true, x: mx, y: my, ang: aimAng, life: .07, life0: .07 });   // 槍口閃光
  addLightFlash('muzzle', mx, my);   // 槍口火光照亮周圍的黑暗
  spawnShellCasing(mx, my, aimAng);  // 彈殼拋出
  G.effects.push({ bullet: true, x1: mx, y1: my, x2: endX, y2: endY, life: .07, life0: .07, color: '#ffe79a' });   // 子彈曳光（飛向目標）
  if (best) G.effects.push({ ring: true, x: endX, y: endY, r: 2, r2: 9, life: .14, life0: .14, color: '#ffe79a' });   // 命中小火花
  igniteSlicksOnLine(p.x, p.y, endX, endY);   // 子彈穿過油汙 → 點燃
  if (best && best.oilRef) { damageOil(best.oilRef, Math.round(PLAYER_ATK.dmg * (rollCrit('player') || 1)), 'player'); best = null; }   // 打到油桶
  if (best && best.oreRef) { pistolHitOre(best.oreRef, PLAYER_ATK.dmg); best = null; }   // 打到異質礦：累積傷害，打夠了才碎（js/ore.js）
  if (best && G.cores.includes(best)) {   // 打中異質核心：叫醒它並扣血，不吸仇恨、不擊退
    const critMul = rollCrit('player'), shotDmg = Math.round(PLAYER_ATK.dmg * (critMul || 1));
    wakeCore(best); best.lastHp = best.hp;
    best.hp -= shotDmg; markHit(critMul);
    if (typeof addStat === 'function') addStat('pistolDamage', shotDmg);   // 成就：手槍累計傷害
    if (critMul) flashCrit('-' + shotDmg, best.x, best.y - 60, true); else flashDmg('-' + shotDmg, best.x, best.y - 56, '#d69bff');
    best = null;
  }
  if (best) {
    const critMul = rollCrit('player'), shotDmg = Math.round(PLAYER_ATK.dmg * (critMul || 1));
    best.hp -= shotDmg;
    if (typeof addStat === 'function') addStat('pistolDamage', shotDmg);   // 成就：手槍累計傷害
    if (!(best.playerAggroT > 0)) best.alertT = ENEMY_ALERT_TIME;   // 這一槍才把牠吸引過來：頭上冒「！」
    best.playerAggroT = PLAYER_ATK.aggro;   // 吸引仇恨
    markHit(critMul);                       // 準星旁閃一下命中標記
    best.hitT = Math.max(best.hitT || 0, .14); best.hitColor = '#bfe0ff';
    enemyHitReact(best, p.x, p.y, !!critMul);   // 爆擊算重擊（會擊退、硬直）
    if (critMul) flashCrit('-' + shotDmg, best.x, best.y - 30, true);   // 溫特開槍：算成就
    else flashDmg('-' + shotDmg, best.x, best.y - 26, '#bfe0ff');
    sfxMonsterHit(best, 0.48, 'player');
  }
  if (typeof sfx === 'function') sfx('gunshot');
  if (p.ammo <= 0) startReload(p);   // 打完最後一發→自動裝填
  else if (PLAYER_ATK.double && Math.random() < PLAYER_ATK.double) p.atkCd = .07;   // 快速射擊（手槍 Lv3 起）：馬上再開一發
}
// 右下角：目前裝的子彈（上面名稱；下面子彈圖＋剩幾發）
// 子彈圖跟以前換槍一樣疊兩張：正在用的在前面、後面露出滾輪往下會換到的那顆，換的時候彈一下
let ammoHudEl = null, ammoGunEls = null, ammoTextEl = null, ammoNameEl = null, ammoHudKey = '';
function buildAmmoHud() {
  const css = document.createElement('style');
  css.textContent = `
    #ammoHud { position:absolute; right:14px; bottom:14px; z-index:9; display:flex; flex-direction:column; align-items:flex-end; gap:2px; pointer-events:none; }   /* 名稱、子彈圖、數字都靠右對齊，換子彈時右邊緣不動 */
    #ammoHud .ammo-name { height:18px; line-height:18px; white-space:nowrap; color:#eef3fa; font:700 13px 'Microsoft JhengHei',sans-serif; text-shadow:0 1px 2px #000, 0 0 3px #000; }
    #ammoHud .ammo-row { display:flex; flex-direction:column; align-items:flex-end; gap:2px; }   /* 由上往下：名稱、子彈圖、數字 */
    #ammoHud .bullet-stack { position:relative; width:62px; height:var(--stack-height,24px); }   /* 依實際顯示的一至三顆子彈收合高度 */
    #ammoHud .bullet-stack img { position:absolute; right:0; top:var(--stack-top,2px); width:57.6px; height:19.2px; image-rendering:pixelated; transform-origin:right center;
      transition:transform .22s cubic-bezier(.3,1.4,.5,1), filter .22s, opacity .22s; }
    #ammoHud .bullet-stack img.front { z-index:2; transform:translate(0,0) scale(1); filter:drop-shadow(0 0 2px rgba(255,236,190,.95)) drop-shadow(0 0 5px rgba(255,214,140,.55)); opacity:1; }
    #ammoHud .bullet-stack img.prev, #ammoHud .bullet-stack img.next { z-index:1; filter:brightness(.62) saturate(.35) drop-shadow(0 0 1px rgba(160,190,220,.5)); opacity:.85; }
    #ammoHud .bullet-stack img.prev { transform:translate(0,-22px) scale(.75); }
    #ammoHud .bullet-stack img.next { transform:translate(0,22px) scale(.75); }
    #ammoHud .bullet-stack img.off { transform:scale(.5); opacity:0; }
    #ammoHud .ammo-text { height:20px; line-height:20px; font:700 16px sans-serif; color:#dbe7ff; letter-spacing:1px; white-space:nowrap; text-align:right; text-shadow:0 1px 2px #000, 0 0 3px #000; }
    #ammoHud .ammo-text small { position:absolute; right:0; bottom:100%; margin-bottom:4px; font-size:12px; color:#ff9f7a; letter-spacing:0; white-space:nowrap; }   /* 打完的提示浮在最上面，不把整塊往上推 */
    #ammoHud .ammo-text.empty b { color:#ff9f7a; }`;
  document.head.appendChild(css);
  ammoHudEl = document.createElement('div');
  ammoHudEl.id = 'ammoHud';
  ammoNameEl = document.createElement('div'); ammoNameEl.className = 'ammo-name';
  const row = document.createElement('div'); row.className = 'ammo-row';
  const stack = document.createElement('div'); stack.className = 'bullet-stack';
  ammoGunEls = WEAPONS.map(w => { const img = new Image(); img.src = w.image || ''; img.alt = w.name; img.className = 'off'; stack.appendChild(img); return img; });
  ammoTextEl = document.createElement('div'); ammoTextEl.className = 'ammo-text';
  row.append(stack, ammoTextEl);
  ammoHudEl.append(ammoNameEl, row);
  document.getElementById('wrap').appendChild(ammoHudEl);
}
function updateAmmoHud() {
  if (typeof MAP_SAFE !== 'undefined' && MAP_SAFE) { if (ammoHudEl) ammoHudEl.style.display = 'none'; return; }
  if (!ammoHudEl) buildAmmoHud();
  ammoHudEl.style.display = '';
  const p = G.player, mag = PLAYER_ATK.mag, ammo = p ? (p.ammo ?? mag) : mag;
  const w = playerWeapon(p), wi = WEAPONS.indexOf(w), n = bulletCount(w.id), empty = w.id !== 'pistol' && n <= 0;
  const text = w.id === 'pistol' ? ((p && p.reloadT > 0) ? 'Reload' : ammo + ' / ∞')
    : '<b>' + n + '</b> / ' + BULLETS[w.id].max + (empty ? '<small>沒有子彈了・滾輪換子彈</small>' : '');
  const usable = WEAPONS.map((x, i) => weaponUsable(i) ? 1 : 0).join('');
  const key = w.id + '|' + text + '|' + usable;
  if (key === ammoHudKey) return;   // 沒變就不動 DOM（每幀都會呼叫）
  ammoHudKey = key;
  const step = d => { let k = wi; for (let i = 0; i < WEAPONS.length; i++) { k = (k + d + WEAPONS.length) % WEAPONS.length; if (weaponUsable(k)) break; } return k; };
  const nx = step(1), pv = step(-1);   // 滾輪往下、往上會換到的那顆（只有兩種時上面不重複顯示）
  const hasNext = nx !== wi, hasPrev = pv !== wi && pv !== nx;
  ammoHudEl.style.setProperty('--stack-height', (24 + (hasNext ? 22 : 0) + (hasPrev ? 22 : 0)) + 'px');
  ammoHudEl.style.setProperty('--stack-top', (hasPrev ? 24 : 2) + 'px');
  ammoGunEls.forEach((img, i) => { img.className = i === wi ? 'front' : i === nx && nx !== wi ? 'next' : i === pv && pv !== wi && pv !== nx ? 'prev' : 'off'; });
  ammoHudEl.style.setProperty('--bc', w.color || '#ffe79a');
  ammoNameEl.textContent = w.name;
  ammoTextEl.classList.toggle('empty', empty);
  ammoTextEl.innerHTML = text;
}

// ---- 主迴圈（幀率校正）----
let last = 0;
// ---- 腳步聲（走路時循環播放；安全場景=footsteps02、戰鬥場景=footsteps01）----
const FOOT = { audio: null, file: '' };
function updateFootsteps(menuOpen = false) {
  const p = G && G.player;
  const walking = !!(p && p.moving && !p.sitting && G.running && !G.over && !paused && !menuOpen);   // 選單開著時玩家停住，p.moving 會停在 true
  if (!FOOT.audio) { FOOT.audio = new Audio(); FOOT.audio.loop = true; FOOT.audio.volume = 0.5; }
  const a = FOOT.audio;
  const want = MAP_SAFE ? 'Sound effects/環境/腳步/footsteps02.mp3' : 'Sound effects/環境/腳步/footsteps01.mp3';
  if (FOOT.file !== want) { FOOT.file = want; a.src = want; }
  a.volume = Math.min(1, 0.5 * SFX.volume / 0.35 * SFX.gainOf('footsteps'));   // 跟著設定裡的音效音量＋音效編輯器的倍率
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
  if (e.repeat || e.key.toLowerCase() !== 'p' || dialogueState || elevatorMenuOpen || supplyShopOpen || backpackOpen || settingsOpen || campPlanOpen || mapTransitioning) return;
  if (!G || !G.running || G.over || MAP_SAFE) return;   // 只有戰鬥中可以暫停
  sfx('switch'); setPaused(!paused);
});
// 目標在畫面上「身體」的範圍（世界座標）：怪物依圖片大小與浮空高度，異質核心依浮起高度（js/anomalous-core.js）
function targetBodyBox(t) {
  if (G.cores && G.cores.includes(t)) {
    const lift = typeof coreLift === 'function' ? coreLift(t) : 0;
    const x0 = t.x - CORE.w / 2, y1 = t.y + 20 - lift, y0 = y1 - CORE.h;
    return { x0, y0, x1: x0 + CORE.w, y1, cx: t.x, cy: y0 + CORE.h * .5 };
  }
  const w = (t.drawWidth || 42), h = (t.drawHeight || 33), lift = t.slimeLift || 0;
  const y1 = t.y + 13 - lift, y0 = y1 - h;
  return { x0: t.x - w / 2, y0, x1: t.x + w / 2, y1, cx: t.x, cy: y0 + h * .5 };
}
// 某一幀出錯時：記一次錯誤（同樣的錯只記一次）、把畫布狀態重設，下一幀照常繼續，
// 不會因為一個錯誤就整個卡住，或畫布位移沒還原讓畫面一直壞掉。
const frameErrorsSeen = new Set();
function reportFrameError(err, where = '遊戲畫面') {
  const msg = String(err && (err.stack || err.message) || err);
  if (!frameErrorsSeen.has(msg)) { frameErrorsSeen.add(msg); console.error('[' + where + '] 這一幀出錯，已自動恢復：', err); }
}
function recoverFrame(err) {
  reportFrameError(err);
  if (typeof ctx.reset === 'function') ctx.reset();
  else { const w = cv.width; cv.width = w; }   // 舊瀏覽器：重設畫布大小也會清掉所有狀態
}
let loopTpadDrawn = false;   // T-Pad 打開後已經畫過一次後面的遊戲畫面
function loop(ts) {
  try {
    if (typeof AssetGate !== 'undefined' && AssetGate.blocking()) last = ts;   // 圖片還沒下載完：先暫停（載入畫面在 js/asset-gate.js）
    else frame(ts);
  } catch (err) { recoverFrame(err); }
  requestAnimationFrame(loop);
}
// ---- 營地的警戒線（素材「warning-line」）圍起來的範圍：站在裡面算在基地內 ----
let warningLineRects = null, warningLineRectsFor = null;   // 換地圖才重算
function warningLineAreas() {
  if (warningLineRectsFor === MAP && warningLineRects) return warningLineRects;
  warningLineRectsFor = MAP;
  warningLineRects = ((MAP && MAP.stamps) || []).map(s => {
    const t = mapTileById(s.id);
    if (!t || !(t.name === 'warning-line' || String(t.file || '').endsWith('/warning-line.png'))) return null;
    const x = OX + s.c * CELL + (s.ox || 0), y = OY + s.r * CELL + (s.oy || 0);
    return { x, y, w: mapStampW(s, t) * CELL, h: mapStampH(s, t) * CELL };
  }).filter(Boolean);
  return warningLineRects;
}
const insideWarningLine = (x, y) => warningLineAreas().some(a => x >= a.x && x < a.x + a.w && y >= a.y && y < a.y + a.h);
function frame(ts) {
  const dt = Math.min(0.05, (ts - last) / 1000 || 0); last = ts;
  const frozen = hitstop > 0; if (frozen) hitstop = Math.max(0, hitstop - dt);   // 命中頓格：短暫凍結戰場
  const sdt = dt * battleTimeScale(dt);   // 哨兵暴走瞬間的慢動作（js/berserk-fx.js）
  const introOpen = typeof itemIntroOpen !== 'undefined' && itemIntroOpen;   // 第一次拿到新東西的說明視窗（js/item-intro.js）
  const menuOpen = paused || introOpen || G.over || dialogueState || elevatorMenuOpen || supplyShopOpen || backpackOpen || settingsOpen || campPlanOpen || campSupplyOpen || mapTransitioning
    || (typeof targetPracticeOpen !== 'undefined' && targetPracticeOpen)   // 射擊練習（js/target-practice.js）
    || (typeof wardrobeOpen !== 'undefined' && wardrobeOpen)   // 衣櫃的服裝介面（js/costumes.js）
    || (typeof gachaOpen !== 'undefined' && gachaOpen)   // 扭蛋機（js/gacha.js）
    || (typeof bestiaryOpen !== 'undefined' && bestiaryOpen)   // 怪物圖鑑（js/bestiary.js）
    || (typeof tpadOpen !== 'undefined' && tpadOpen);   // T-Pad（js/tpad.js）
  if (typeof updateGrab === 'function') updateGrab(dt, menuOpen || frozen || mapTransitioning);   // 右鍵抓隊友／NPC（js/grab.js）
  if (!menuOpen && !frozen) updatePlayer(sdt);   // 對話、商店或轉場時暫停玩家與戰場
  updateFootsteps(!!menuOpen && !mapTransitioning);   // 走路腳步聲：打開選單時停掉（命中頓格很短，不停）；走樓梯、進門換地圖的過場中照樣響，跟樓梯音效一起聽起來才像在走樓梯
  updateCamera();
  if (!paused && !introOpen && G.running && !G.over && !dialogueState && !elevatorMenuOpen && !supplyShopOpen && !backpackOpen && !(typeof tpadOpen !== 'undefined' && tpadOpen) && !settingsOpen && !campPlanOpen && !campSupplyOpen && !mapTransitioning && !frozen) {
    // 遊戲邏輯出錯只記錄、不影響畫面：畫面照常畫，不會整片黑掉（畫面本身出錯才由 recoverFrame 重設畫布）
    try { update(sdt); } catch (err) { reportFrameError(err, '遊戲邏輯'); }
    if (typeof battleTick === 'function') battleTick(sdt);   // 結算畫面的作戰時間（js/battle-result.js）
  }
  if (shakeAmt > 0) shakeAmt = Math.max(0, shakeAmt - dt * 40);   // 畫面震動線性衰減
  // T-Pad 開著：遊戲本來就暫停，後面的畫面不用一直重畫（不然 T-Pad 背後的模糊每一格都要重算，開關動畫會卡）
  const tpadStill = typeof tpadOpen !== 'undefined' && tpadOpen && loopTpadDrawn;
  loopTpadDrawn = typeof tpadOpen !== 'undefined' && tpadOpen;
  if (!tpadStill) draw();
  // 溫特手上拿著槍（戰鬥區、任何槍種、沒開選單）而且走出營地警戒線外：滑鼠游標換成準心，方便瞄準怪物
  // 在警戒線裡面（基地內）、或正在放置建築／道具、拆除、放塗鴉時，就算拿著槍也是一般游標。樣式在 css/style.css 的 cursor-crosshair。
  const placingThing = !!(G.selType && (G.selType.startsWith('build:') || G.selType === 'demolish'))
    || (typeof graffitiPlace !== 'undefined' && !!graffitiPlace);
  const armed = !MAP_SAFE && G.running && !menuOpen && !!G.player && G.player.hp > 0 && playerWeapon(G.player).id !== 'none'
    && !insideWarningLine(G.player.x, G.player.y) && !placingThing;
  if (armed !== cv.classList.contains('cursor-crosshair')) cv.classList.toggle('cursor-crosshair', armed);
  if (typeof sanityAfterDraw === 'function') sanityAfterDraw();   // SP 低於 20：殘影（js/sanity.js）
  if (!MAP_SAFE && typeof updateFieldCdRings === 'function') updateFieldCdRings();   // 隊員頭像大招冷卻環
}
function update(dt) {
  if (typeof updateBurrowingMouseFx === 'function') updateBurrowingMouseFx(dt);
  if(typeof updateMrtGateAnimations==='function')updateMrtGateAnimations(dt);
  updateCores(dt);
  if (typeof updateCoreFrenzy === 'function') updateCoreFrenzy(dt);   // 核心醒著：異質體狂暴化（js/core-frenzy.js）
  if (G.player) {
    G.player.hitT = Math.max(0, (G.player.hitT || 0) - dt);
    G.player.underAttackT = Math.max(0, (G.player.underAttackT || 0) - dt);
    updatePlayerAttack(dt);   // 玩家自動開槍射擊附近可見的怪物（低傷害、吸引仇恨）
  }
  G.damageVignetteT = Math.max(0, (G.damageVignetteT || 0) - dt);
  G.cameraShakeT = Math.max(0, (G.cameraShakeT || 0) - dt);
  if (typeof SANITY === 'undefined' || SANITY.autoRegen) G.guide = Math.min(G.guideMax, G.guide + G.guideRegen * dt);   // SP 不會自己恢復，要喝杏仁水（js/sanity.js）
  // 怪物移動
  for (const e of G.enemies) stepEnemy(e, dt);
  // 雷德：偵測最近怪物，3 格內進入「舉盾衝撞」模式（供移動衝刺、撞擊、繪製共用）
  for (const t of G.towers) {
    if (t.type !== 'red') continue;
    let nd = Infinity, near = null;
    if (!MAP_SAFE && !t.berserk && t.hp > 0 && !t.eatenBy && !(t.sleepT > 0)) for (const e of G.enemies) { if (e.dead) continue; const d = Math.hypot(e.x - t.x, e.y - t.y); if (d < nd) { nd = d; near = e; } }   // 被虱目魚小子吃掉、睡著時不舉盾（不然會一直撞吃掉他的虱目魚小子）
    t.shieldMode = nd <= 3 * CELL;
    t.ramTarget = t.shieldMode ? near : null;
    t.nearestEnemyDist = nd;
    if (t.ramCd > 0) t.ramCd -= dt;
  }
  // 哨兵走動（巡邏）
  for (const t of G.towers) {
    const ox = t.x, oy = t.y;
    if (t.grabbed || t.grabFall) { faceNpcFront(t); continue; }   // 被抓著／正在掉下來（js/grab.js）
    if (MAP_SAFE && (npcArrangeMode || t.npcPosed)) faceNpcFront(t);
    else if (t.frozenT > 0) { t.frozenT -= dt; t.moving = false; t.navPath = null; if (t.hp > 0) t.dir = 'front'; }   // 溫特正在疏導／急救這位隊員：站著不動（js/channel-actions.js）
    else if (t.sleepT > 0 && t.hp > 0) { t.sleepT -= dt; t.moving = false; t.navPath = null; if (t.sleepT <= 0) sentryStatus(t, '醒來了', '#9ff0c0'); }   // 被麻醉槍打睡（js/special-guns.js）
    else if (t.dazeT > 0 && t.hp > 0) { t.dazeT -= dt; t.moving = false; t.navPath = null; }   // 被閃光彈閃到、被雷電彈電到：暈一下（js/special-guns.js）
    else if (t.soothingT > 0 && t.hp > 0 && !t.berserk) t.dir = 'front';   // 疏導中：站定、面向鏡頭（原本的指令保留，施法完繼續）
    else if ((!t.meleeSwing && !t.gunSwing) || t.hp <= 0 || t.berserk) { sentryFireWalker = t; updateSentry(t, dt); sentryFireWalker = null; }
    avoidAcidPools(t, dt);   // 被腐蝕池推開（阿瓦倫本人免疫、不避）
    avoidOilFires(t, dt, Math.hypot(t.x - ox, t.y - oy) > .3);    // 被火海推開（js/oil-barrels.js 的火）；這幀有沒有在走
    animateSentry(t, t.x - ox, t.y - oy, dt);
  }
  // 雷德衝撞：舉盾模式下撞到怪物 → 擊退＋少量傷害（有冷卻，避免連續觸發）
  for (const t of G.towers) {
    if (t.type !== 'red' || !t.shieldMode || t.ramCd > 0 || t.hp <= 0 || t.berserk || t.eatenBy || t.sleepT > 0) continue;
    const foe = t.ramTarget;
    if (foe && !foe.dead && Math.hypot(foe.x - t.x, foe.y - t.y) <= CELL * 1.1) {
      const spec = TYPES.red, ramDmg = Math.max(1, Math.round(spec.dmg * 0.4));
      foe.hp -= ramDmg;
      aggroOnSentry(foe, t);
      const dx = foe.x - t.x, dy = foe.y - t.y;
      displaceEnemy(foe, dx, dy, CELL * 1.2);
      foe.hitT = Math.max(foe.hitT || 0, .16); foe.hitColor = '#dbe7ff';
      sfxMonsterHit(foe, 0.48, 'red-ram');
      flashDmg('-' + ramDmg, foe.x, foe.y - 26, '#dbe7ff');
      G.effects.push({ ring: true, x: foe.x, y: foe.y, r: 5, r2: 24, life: .2, life0: .2, color: '#dbe7ff' });
      t.ramCd = 1.4;
    }
  }
  for (const npc of G.npcs) {
    const ox = npc.x, oy = npc.y;
    if (npc.grabbed || npc.grabFall) { faceNpcFront(npc); continue; }   // 被抓著／正在掉下來（js/grab.js）
    if (MAP_SAFE && (npcArrangeMode || npc.npcPosed)) faceNpcFront(npc);
    else updateWanderer(npc, dt);
    animateSentry(npc, npc.x - ox, npc.y - oy, dt);
  }
  // 哨兵攻擊
  for (const t of G.towers) {
    const spec = TYPES[t.type];
    if (t.hp <= 0 || t.grabbed || t.grabFall) { t.meleeSwing = null; t.gunSwing = null; continue; }   // 倒下、被抓著（js/grab.js）：不攻擊
    if (t.gunT > 0) t.gunT -= dt;   // 持槍攻擊圖計時
    if (GUIDE_GUN_TYPES.has(t.type) && t.gunReloadT > 0) {
      t.gunReloadT = Math.max(0, t.gunReloadT - dt);
      if (t.gunReloadT === 0) t.gunAmmo = GUIDE_GUN.mag;
    }
    if (t.hitT > 0) t.hitT -= dt;   // 受擊閃紅計時
    if (t.eatenBy) { t.meleeSwing = null; t.gunSwing = null; continue; }   // 被虱目魚小子吃掉：不攻擊（js/milkfish-kid.js）
    if (t.sleepT > 0 || t.dazeT > 0) { t.meleeSwing = null; t.gunSwing = null; continue; }   // 睡著、暈眩：不攻擊
    if (t.frozenT > 0) { t.meleeSwing = null; t.gunSwing = null; continue; }   // 正在被疏導／急救：不攻擊（暴走中也一樣）
    if (spec.guide) updateGuideSP(t, dt);
    if (t.soothingT > 0) {   // 疏導施法計時；期間嚮導和被疏導的隊員身邊飄出嚮導顏色的小光點（js/attack-fx.js）
      t.soothingT = Math.max(0, t.soothingT - dt);
      if (typeof spawnSootheMotes === 'function' && SOOTHE_MOTE_COLORS[t.type]) spawnSootheMotes([t, ...(t.sootheTargets || []).filter(o => o.hp > 0)], SOOTHE_MOTE_COLORS[t.type], dt, t);
    }
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
        let usedSP = false, usedMedkit = false;   // 同一次範圍疏導只扣一次 SP；治療仍消耗一個醫療包
        for (const o of G.towers) {
          if (o.hp <= 0 || (o !== t && TYPES[o.type].guide) || Math.hypot(o.x - t.x, o.y - t.y) > spec.aura.r * CELL) continue;
          // 疏導消耗 SP；補血消耗醫療包，兩項資源各自檢查。
          const needSoothe = !TYPES[o.type].guide && (o.berserk || (o.taint || 0) >= (typeof CAMP_SUPPLY !== 'undefined' ? CAMP_SUPPLY.minTaint : 1));
          const needHeal = (spec.aura.heal || 0) > 0 && o.maxhp - o.hp >= (typeof CAMP_SUPPLY !== 'undefined' ? CAMP_SUPPLY.minHeal : 1);
          const doSoothe = needSoothe && (typeof guideCanSoothe !== 'function' || guideCanSoothe(t));
          const doHeal = needHeal && (typeof guideCanHeal !== 'function' || guideCanHeal(t));
          if (!doSoothe && !doHeal) continue;   // 不需要、或身上沒東西可用就跳過
          if (doSoothe) usedSP = true; if (doHeal) usedMedkit = true;
          const taintBefore = o.taint || 0;
          if (doSoothe) o.taint = Math.max(0, taintBefore - spec.aura.rate * (1 + sortieBuff(t, 'calm')) * AURA_CD * (typeof CAMP_SUPPLY !== 'undefined' ? CAMP_SUPPLY.sootheMul : 1));   // 嚮導吃了鎮定類補給：疏導量增加          // 一次清一批（平均速率不變）
          if (doHeal) o.hp = Math.min(o.maxhp, o.hp + (spec.aura.heal || 0) * AURA_CD);
          if (o.berserk && o.taint < 60) o.berserk = false;
          spawnSootheEffect(o.x, o.y - 8, sc, o);
          const cleared = Math.round(taintBefore - o.taint);
          if (cleared > 0) flashDmg('汙染 -' + cleared, o.x, o.y - 44, `rgb(${sc[0]},${sc[1]},${sc[2]})`);
          soothed.push(o);
        }
        if (soothed.length) {
          if (usedSP) spendGuideSP(t);
          if (usedMedkit && typeof guideUse === 'function') guideUse(t, 'medkit');
          t.auraCd = AURA_CD;
          spawnSootheCast(t, sc, spec.aura.r * CELL);   // 疏導表演：法陣、光波
          t.soothingT = SOOTHE_CHANNEL; t.gunSwing = null; t.gunT = 0; t.dir = 'front'; t.moving = false;   // 停下來閉眼疏導
          t.sootheTargets = soothed.filter(o => o !== t);   // 施法者的光點已另外加入，避免自我治療時重複
          if (typeof sfxAt === 'function') sfxAt('soothe', t.x, t.y, 0.42, t.type);
        }
      }
    }
    if (t.soothingT > 0) continue;   // 疏導中專心施法，不開槍
    if (spec.noAttack) { t.meleeSwing = null; t.gunSwing = null; continue; }   // 不攻擊的嚮導（塔納）：只疏導
    t.cd -= dt;
    let swingTarget = null;
    if (t.berserk) { t.meleeSwing = null; t.gunSwing = null; updateChaosSentry(t, spec, dt); continue; }   // 暴走：無差別攻擊
    if (t.meleeSwing) {
      const swing = t.meleeSwing;
      swing.age += dt;
      if (swing.ult && swing.stabs) {   // 柯林的突擊連刺：照時間一刺一刺打（不走下面一般攻擊的流程）
        colynStabStep(t, spec, swing);
        if (swing.age >= swing.duration) t.meleeSwing = null;
        continue;
      }
      if (!swing.soundPlayed && swing.age >= swing.wind) { swing.soundPlayed = true; playSentryAttackSound(t); }
      if (!swing.slashFx && swing.age >= swing.wind && !(swing.ult && ULTIMATES[t.type] && ULTIMATES[t.type].radius)) {   // 近戰大招用衝擊波，不噴小月牙
        swing.slashFx = true;
        const slashAng = Math.atan2(Math.sin(swing.angle) + 1.1, Math.cos(swing.angle));   // 偏向下前方（配合往下劈）
        spawnMeleeSlash(t.x + Math.cos(swing.angle) * 20, t.y - 6 + Math.sin(swing.angle) * 16, slashAng, t.type === 'luther', t.type === 'avaren' ? 'purple' : 'blue');
      }
      if (!swing.hit && swing.age >= swing.impact) {
        swing.hit = true;
        const foe = swing.target;
        if (foe && !foe.dead && foe.hp > 0 && Math.hypot(foe.x - t.x, foe.y - t.y) <= spec.range * CELL + 12 + (G.cores.includes(foe) ? CORE_HIT_PAD : 0)) swingTarget = foe;
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
        if (foe && !foe.dead && foe.hp > 0 && Math.hypot(foe.x - t.x, foe.y - t.y) <= spec.range * CELL + 12 + (G.cores.includes(foe) ? CORE_HIT_PAD : 0)) swingTarget = foe;
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
      if (!swingTarget) t.cd = 1 / (spec.rate * (1 + sortieBuff(t, 'spd')) * (t.taint > 85 && !t.berserk ? 0.5 : 1));   // 瀕臨暴走：攻速減半
      if ((t.type === 'red' || t.type === 'luther' || t.type === 'avaren' || t.type === 'colyn') && !swingTarget) {
        const heavy = t.type === 'luther', dx = target.x - t.x, dy = target.y - t.y;
        t.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'back' : 'front');
        const isUlt = !!(ULTIMATES[t.type] && (t.ultCd || 0) <= 0);
        if (isUlt) { t.ultCd = ULTIMATES[t.type].cd * (1 - (spec.ultCdCut || 0)); const ultLine = pickDialogueLine(t.type, 'ultimate'); if (ultLine) t.say = { text: ultLine, life: 2.5 }; spawnChargeFx(t.x, t.y - 8, ULT_CHARGE_COLOR[t.type] || spec.color); }
        const U0 = isUlt ? ULTIMATES[t.type] : null, stab = !!(U0 && U0.stabs);   // 柯林的大招：連刺（自己的節奏）
        const sw = stab ? { wind: 0, impact: 0, duration: U0.duration } : isUlt ? ULT_SWING : (MELEE_SWING[t.type] || MELEE_SWING.normal);
        t.meleeSwing = { target, angle: Math.atan2(dy, dx), age: 0, wind: sw.wind, impact: sw.impact, duration: sw.duration, hit: false, ult: isUlt, ...(stab ? { stabs: U0.stabs, stabIdx: 0, slashFx: true } : {}) };
        if (stab) addSentryTaint(t, U0.taint);   // 突擊連刺：整招只加一次汙染
        if (stab) { const fx = G.effects.filter(o => o.charge).pop(); if (fx) fx.life = fx.life0 = U0.stabs[0]; }   // 蓄力光圈只到第一刺（不要跟連刺疊在一起）
        t.moving = false;
        continue;
      }
      if (!swingTarget) {   // 遠程角色：即使沒有持槍素材，也先做瞄準／後座動畫再判定命中
        const dx = target.x - t.x, dy = target.y - t.y;
        t.dir = Math.abs(dx) >= Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'back' : 'front');
        const isUlt = !!(ULTIMATES[t.type] && (t.ultCd || 0) <= 0);
        if (isUlt) { t.ultCd = ULTIMATES[t.type].cd * (1 - (spec.ultCdCut || 0)); const ultLine = pickDialogueLine(t.type, 'ultimate'); if (ultLine) t.say = { text: ultLine, life: 2.5 }; spawnChargeFx(t.x, t.y - 8, ULT_CHARGE_COLOR[t.type] || spec.color); }
        const sw = isUlt ? ULT_SWING : { wind: .14, impact: .21, duration: .4 };
        t.gunSwing = { target, angle: Math.atan2(dy, dx), age: 0, wind: sw.wind, impact: sw.impact, duration: sw.duration, fired: false, ult: isUlt };
        t.gunT = sw.duration; t.moving = false;
        continue;
      }
      const U = ((t.gunSwing && t.gunSwing.ult) || (t.meleeSwing && t.meleeSwing.ult)) ? ULTIMATES[t.type] : null;   // 大招（在揮擊啟動時已決定）
      if (U && U.radius) {   // 近戰大招：大範圍（紅＝盾牌衝撞＋回復；路德＝重擊＋暈眩）
        const r = U.radius * CELL, dmg = spec.dmg * U.dmgMul * (1 + (spec.ultDmgBonus || 0)) * sentryDamageMul(t), col = U.kind === 'bash' ? '#bfe0ff' : '#ffd0d5';
        const hitEnemy = G.enemies.find(e => !e.dead && Math.hypot(e.x - t.x, e.y - t.y) <= r && hasLineOfSight(t.x, t.y, e.x, e.y));
        for (const e of G.enemies) {
          if (e.dead || Math.hypot(e.x - t.x, e.y - t.y) > r || !hasLineOfSight(t.x, t.y, e.x, e.y)) continue;   // 牆後的不受影響
          e.hp -= dmg;
          aggroOnSentry(e, t);
          if (U.knockback) { const dx = e.x - t.x, dy = e.y - t.y; displaceEnemy(e, dx, dy, CELL * U.knockback); }
          if (U.stun && !e.noStun) e.stunT = Math.max(e.stunT || 0, U.stun);   // 路德的大招：生命體不會被停住
          e.hitT = Math.max(e.hitT || 0, .2); e.hitColor = col;
          flashDmg('-' + Math.round(dmg), e.x, e.y - 26, col);
        }
        if (U.healHp) { t.hp = Math.min(t.maxhp, t.hp + U.healHp); flashDmg('+' + U.healHp, t.x, t.y - 40, '#7ee0a0'); }
        if (U.healTaint) t.taint = Math.max(0, t.taint - U.healTaint);
        spawnUltShockwave(t.x, t.y, r, col);
        if (hitEnemy) sfxMonsterHit(hitEnemy, 0.48, t.type + '-ult');
      } else if (!G.enemies.includes(target) || Math.random() < spec.accuracy) {
        const impactPoint = { x: target.x, y: target.y };
        const critMul = U ? 0 : rollCrit('sentry');   // 一般攻擊才會爆擊（js/combat-feel.js 的 CRIT）
        const rageMul = sentryDamageMul(t);   // 路德：汙染越高打越痛
        const atkDmg = spec.dmg * (U ? U.dmgMul * (1 + (spec.ultDmgBonus || 0)) : 1) * (critMul || 1) * rageMul, atkSplash = U ? U.splash : spec.splash;
        target.hp -= atkDmg;
        onSentryHitOil(t, target, atkDmg, impactPoint, (atkSplash || 0) * CELL);
        if (typeof sentryHitOre === 'function') sentryHitOre(t, impactPoint, (atkSplash || 0) * CELL);   // 路德：拳頭剛好波及礦物（js/ore.js）   // 安柏／希奧妮：不小心波及附近的油桶、油汙
        const affected = target.maxhp && G.enemies.includes(target) ? [target] : [];
        if (atkSplash > 0) for (const e of G.enemies) if (e !== target && !e.dead && Math.hypot(e.x - target.x, e.y - target.y) <= atkSplash * CELL && hasLineOfSight(target.x, target.y, e.x, e.y)) { e.hp -= atkDmg * .6; affected.push(e); }
        for (const e of affected) {
          if (spec.ability === '火焰' || spec.ability === '雷電') {   // 記下屬性傷害（魚頭君抗火、怕電；js/fish-head.js）
            const amt = e === target ? atkDmg : atkDmg * .6;
            if (spec.ability === '火焰') e.fireDmg = (e.fireDmg || 0) + amt; else e.shockDmg = (e.shockDmg || 0) + amt;
          }
          if (spec.burn) { e.burnT=spec.burn.duration; e.burnDmg=spec.burn.damage; e.burnTick=1; }
          if (spec.stun && !e.noStun && !(spec.ability === '雷電' && e.shockResist != null)) {   // noStun 的怪物（生命體）不會被停住；不怕電的（小丑魚）不會被雷擊麻痺
            e.stunT=Math.max(e.stunT||0,spec.stun);
            if (spec.ability === '雷電') e.shockT = Math.max(e.shockT || 0, spec.stun);   // 安柏的雷擊：麻痺（停住＋微微顫抖）
          }
          if (spec.confuse) e.confuseT=Math.max(e.confuseT||0,spec.confuse);
          if (spec.knockback) {
            const dx=e.x-t.x,dy=e.y-t.y;
            displaceEnemy(e,dx,dy,CELL*spec.knockback);
          }
        }
        spawnAttackVisual(t, target, (U || critMul || rageMul > 1) ? { ...spec, dmg: atkDmg, splash: atkSplash, crit: !!critMul, rage: rageMul } : spec, affected, impactPoint, U ? U.scale : 1);
      } else { flashDmg('MISS', target.x, target.y - 26, '#c6d1dd'); if (typeof strayBoltOre === 'function') strayBoltOre(t, target); }   // 安柏打偏：可能劈中附近的礦物（js/ore.js）
      addSentryTaint(t, spec.taint);   // 每次攻擊增加精神負荷（到 100 暴走）
    }
  }
  // 地上腐蝕痕跡：站在裡面的對象每 ACID_TICK 秒扣一次血、偶爾冒紫黑霧。
  // 計時跟著「被腐蝕的對象」走：同時站在好幾灘裡，也只吃最痛的那一灘（不疊加）。
  if (G.acidPools && G.acidPools.length) {
    const acidDps = o => {   // 站在哪幾灘裡 → 取最痛的那一灘的每秒傷害；不在任何一灘裡回傳 0（異質核心腳下的腐蝕不傷異質體）
      let best = 0;
      const isEnemy = G.enemies.includes(o);
      for (const pool of G.acidPools) if (pool.t > 0 && !(isEnemy && pool.noEnemy) && Math.hypot(o.x - pool.x, o.y - pool.y) <= pool.r) best = Math.max(best, pool.dps);
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
      const def = sentryDefense(t);
      const hurt = dmgAmt * (1 - def);
      t.hp = Math.max(0, t.hp - hurt);
      t.hitT = Math.max(t.hitT || 0, .2); t.hitColor = '#b060ff';
      flashDmg('-' + Math.round(hurt), t.x, t.y - 30, '#c58aff');
      if (t.hp <= 0) { t.target = null; sentryStatus(t, '失去戰鬥能力', '#ff5b6e', true); }
    }
    // 玩家（溫特）
    const p = G.player;
    const playerAcid = p && p.hp > 0 ? acidTick(p) * (typeof equipAcidMul === 'function' ? equipAcidMul() : 1) : 0;   // 防毒面具（js/equipment.js）
    if (playerAcid) {
      p.hp = Math.max(0, p.hp - (typeof equipPlayerDamage === 'function' ? equipPlayerDamage(playerAcid) : playerAcid));
      playPlayerHit(.55);   // 阿瓦倫的腐蝕：每燙一次小聲響一下
      p.hitT = Math.max(p.hitT || 0, .3); G.damageVignetteT = Math.max(G.damageVignetteT, .35);
      flashDmg('-' + Math.round(playerAcid), p.x, p.y - 46, '#c58aff');
      if (p.hp <= 0 && !G.over) { if (typeof addStat === 'function' && achieveNotPractice()) addStat('acidDeaths'); flash('部隊長失去戰鬥能力', p.x, p.y - 58, '#ff5b6e'); lose('player', '被阿瓦倫的腐蝕波及'); }
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
  if (typeof fishHeadArmor === 'function') fishHeadArmor();
  if (typeof pearlShellArmor === 'function') pearlShellArmor();   // 珍珠小童：被打就閉殼、閉著防禦變高（js/pearl-kid.js）   // 魚頭君：正面減傷、斜後加傷（js/fish-head.js）
  // 柯林大招的破甲：破甲期間受到的傷害（所有人、所有來源）×ULTIMATES.colyn.breakMul；在死亡判定前統一算
  for (const e of G.enemies) {
    if (e.breakT > 0) { e.breakT -= dt; if (e.prevHp != null && e.hp < e.prevHp) e.hp = e.prevHp - (e.prevHp - e.hp) * ULTIMATES.colyn.breakMul; }
    e.prevHp = e.hp;
  }
  for (const e of G.enemies) { if (e.hp <= 0 && !e.dead) { if (e.undying && typeof lifeformCollapse === 'function' && lifeformCollapse(e)) continue;   /* 生命體：沒被火燒就只是碎掉（js/lifeform.js） */ e.dead = true; if ((typeof practiceOn === 'function' && practiceOn())) {} else if (typeof dropShard === 'function') dropShard(e.x, e.y, e.crystals ?? 3); else earnCrystals(e.crystals ?? 3);   /* 打怪不加錢；掉一顆碎片要走過去撿（js/ore.js） */ if (G.battle) { const nm = monsterNameOf(e); G.battle.kills[nm] = (G.battle.kills[nm] || 0) + 1; } onEnemyDeath(e); if (typeof questEvent === 'function') questEvent('kill', { monster: e.type }); if (e.deathSound && typeof sfxAt === 'function') sfxAt(e.deathSound, e.x, e.y, 0.8, 'monster-death'); else if (e.type === 'slime' && typeof sfxAt === 'function') sfxAt('monsterDown', e.x, e.y, 0.58, 'slime-death'); else sfx('kill'); } }
  for (const core of G.cores) if(core.hp<=0 && !core.dead) {
    core.dead=true; breakCore(core);
    SFX.play('glassBreak3', .85, 'core-break-3'); SFX.play('glassBreak4', .85, 'core-break-4');   // 核心碎裂：兩種玻璃碎裂聲疊在一起
    earnCrystals(core.reward); if (G.battle) G.battle.cores++; flash('異質核心已摧毀 +'+core.reward+' 結晶',core.x,core.y,'#d69bff'); systemNotice('異質核心已摧毀，獲得 ' + core.reward + ' 結晶');
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
  if (typeof updateSlowBuildingWear === 'function') updateSlowBuildingWear(dt);   // 鐵絲網被踩著的怪物慢慢磨壞（js/build.js）
  for (const f of G.effects) {
    f.life -= dt;
    if (f.coreMote) updateCoreMote(f, dt);   // 異質核心的黑紫粒子
    else if (f.shell) {   // 彈殼：拋出、受重力落地彈一下，之後躺在地上淡出
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
  if (typeof updateNpcChats === 'function') updateNpcChats(dt);   // 基地裡的 NPC 閒聊小表演（js/npc-chats.js）
  if (typeof updateFishEggs === 'function') updateFishEggs(dt);   // 比基尼小丑魚的魚卵（js/clownfish.js）
  updateOre(dt);          // 礦物碎片：噴飛、撿起（js/ore.js）
  updateLifePiles(dt);    // 生命體碎掉的那堆：復活、被火燒（js/lifeform.js）
  updateFlickerLights(dt);   // 不穩定的日光燈（js/flicker-light.js）
  if (typeof updateRandomDoors === 'function') { updateRandomDoors(dt); updateDoorFx(dt); }   // 隨機開關的門、解開掉落的鎖鏈（js/doors.js）
  if (typeof updateSmilers === 'function') updateSmilers(dt);
  if (typeof updateGraffiti === 'function') updateGraffiti(dt);   // 塗鴉：擦掉的進度（js/graffiti.js）
  if (typeof updateEquipment === 'function') updateEquipment(dt);   // 頭燈耗電（js/equipment.js）   // Smiler：黑暗中注視、咬人（js/smiler.js）
  updateFlares(dt);          // 照明彈的飛行與燃燒（js/flare.js）
  if (typeof updateSpecialGuns === 'function') updateSpecialGuns(dt);   // 燃燒彈、麻醉針（js/special-guns.js）
  if (typeof updateDarkDrain === 'function') updateDarkDrain(dt);   // 站在全黑的地方：SP 慢慢下降（js/sanity.js）
  if (typeof updateChannel === 'function') updateChannel(dt);   // 疏導、急救、包紮的進度條（js/channel-actions.js）
  if (typeof updatePractice === 'function') updatePractice(dt);   // 訓練室：不扣血、不耗物資、補史萊姆（js/practice.js）
  updatePearls(dt);          // 珍珠小童噴出的珍珠（js/pearl-kid.js）
  if (typeof updateFishHead === 'function') updateFishHead(dt);
  if (typeof updateMilkfish === 'function') updateMilkfish(dt);   // 虱目魚小子：嘴裡的隊友跟著走、消化扣血、打死救出來（js/milkfish-kid.js）
  if (typeof updateLoofahVines === 'function') updateLoofahVines(dt);   // 絲瓜藤（js/loofah-lady.js）   // 魚頭君的水柱、地上的水（js/fish-head.js）
  if (typeof updateHangi === 'function') updateHangi(dt);   // 順順宮帽、夯吉寶的迴力鏢帽子（js/hangi-bao.js）
  // 波次（安全場景沒有波次，也不會有勝負）
  // 核心全部打破就結算（可以留下來清場、徹底控制；js/core-clear.js）
  if (G.baseLostT > 0 && !G.over) { G.baseLostT -= dt; if (G.baseLostT <= 0) lose('base'); }   // 基地被打壞：等一下才跳失敗
  if (typeof checkCoreClear === 'function') checkCoreClear(dt);
  else if (!MAP_SAFE && G.cores.length && G.cores.every(c=>c.dead) && G.enemies.length===0) win();
  updateHUD();
}
const FLASH_LIFE = 1.5;   // 提示字停留時間（秒）；想更久／更短改這裡
const FLASH_MUL = 2;      // 提示字停留時間再乘上幾倍（隊員狀態 sentryStatus 不乘，固定 3 秒）
function flash(text, x, y, color, life = FLASH_LIFE, exact = false) { if (!exact) life *= FLASH_MUL;   // exact：照給的秒數，不乘 FLASH_MUL
  G.effects.push({ text, x, y, life, life0: life, color, vy: -22 }); }
function sentryStatus(t, text, color = '#8fd3ff', warning = false) {
  flash(text, t.x, t.y - 30, color, 3, true);   // 隊員狀態：固定 3 秒
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
  setTimeout(() => { item.classList.add('leaving'); setTimeout(() => item.remove(), 300); }, 4800);
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
  // 下方資訊條（HP／SP、補給、背包、經費、碎片）安全區域也顯示；只有「建築」按鈕在安全區收起來
  const hud = document.getElementById('hud');
  if (hud) hud.classList.remove('hidden');
  const buildToolbar = document.getElementById('buildToolbar');
  if (buildToolbar) buildToolbar.classList.toggle('hidden', MAP_SAFE);
  if (typeof updateTeamButton === 'function') updateTeamButton();   // 安全場景才顯示「出勤編隊」按鈕
  if (MAP_SAFE && typeof buildBar !== 'undefined' && buildBar) buildBar.classList.add('hidden');
  document.getElementById('money').textContent = Math.floor(G.money);
  if (MAP_SAFE && !window.TEST_MODE && typeof walletSet === 'function' && walletGet() !== Math.floor(G.money)) walletSet(G.money);   // 基地裡花錢：存回錢包
  document.getElementById('safeCornerButtons').classList.add('hidden');   // 右下角的背包按鈕不用了：資訊條上就有背包
  renderQuickSupplies();
  document.getElementById('crystals').textContent = training.crystals;
  const playerHpBar = document.getElementById('playerHpBar');
  const playerHp = Math.max(0, G.player?.hp ?? 0);
  const playerMaxHp = Math.max(1, G.player?.maxhp ?? 100);
  playerHpBar.style.width = Math.min(100, playerHp / playerMaxHp * 100) + '%';
  playerHpBar.parentElement.setAttribute('aria-valuenow', Math.ceil(playerHp));
  const hpText = Math.ceil(playerHp) + ' / ' + Math.round(playerMaxHp), hpEl = document.getElementById('playerHpText');   // 條中間的數字
  if (hpEl && hpEl.textContent !== hpText) hpEl.textContent = hpText;
  playerHpBar.parentElement.setAttribute('aria-valuemax', playerMaxHp);
  const playerEnergyBar = document.getElementById('playerEnergyBar');
  playerEnergyBar.style.width = Math.max(0, Math.min(100, G.guide / Math.max(1, G.guideMax) * 100)) + '%';
  playerEnergyBar.parentElement.setAttribute('aria-valuenow', Math.floor(G.guide));
  const spText = Math.floor(G.guide) + ' / ' + Math.round(G.guideMax), spEl = document.getElementById('playerEnergyText');
  if (spEl && spEl.textContent !== spText) spEl.textContent = spText;
  playerEnergyBar.parentElement.setAttribute('aria-valuemax', G.guideMax);
  playerEnergyBar.parentElement.setAttribute('aria-valuetext', `${Math.floor(G.guide)} / ${G.guideMax} SP`);
  const mission = document.getElementById('missionText');
  if (mission) {
    if (MAP_SAFE) {
      const text = (typeof missionHudText === 'function' && missionHudText()) || '目前任務：休息一下（安全區域）';   // js/missions.js
      if (mission.dataset.mode !== 'safe' || mission.textContent !== text) mission.textContent = text;
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
      '這裡是<b>安全區域</b>：<b>沒有怪物</b>，燈也全開著（<b>沒有黑幕</b>）。<br>用 <b>WASD／方向鍵</b>走動（<b>Shift</b> 衝刺），靠近 NPC 或哨兵按 <b>Space</b> 可以對話。<br>想回去防守，按上方的<b>地圖選單</b>換一張地圖。',
      '進入');
    return;
  }
  showOverlay('台北地下災害應變中心 · 塔防原型',
    '後室<b>一片漆黑</b>——只有營地和你身上的燈是亮的。<br><b>哨兵已在基地待命</b>：點擊哨兵可下指令（巡邏／指派位置／疏導）。<br>異質體會成群出現在<b>不同的黑暗角落</b>並四處遊蕩；進入感知範圍後會優先追擊哨兵，若被建築擋住就會先破壞建築。<br>放置<b>探照燈</b>與防禦設施控制戰場，在哨兵<b>暴走</b>前記得<b>疏導</b>。破壞所有異質核心並清除異質體即可控制 Y 區。<br>戰鬥中按 <b>P</b> 可以暫停。',
    '開始防禦');
}
function winOverlay() { if (typeof missionWinOverlay === 'function' && missionWinOverlay()) { if (typeof appendBattleResult === 'function') appendBattleResult(); return; } showOverlay('✅ Y 區已控制', '所有異質核心與殘存異質體已清除！異質結晶已儲存，可用於哨兵培養。', '再玩一次'); if (typeof appendBattleResult === 'function') appendBattleResult(); }
// 失敗原因 → 標題與提示（player＝部隊長倒下、base＝地圖上的營地物件被摧毀）
const LOSE_TEXT = {
  player: ['💀 部隊長倒下', '溫特失去了戰鬥能力。<br>別離哨兵太遠，被異質體包圍時先退回亮處或營地。'],
  base:   ['💀 營地被摧毀', '異質體打穿了基地。<br>用防禦設施拖住牠們，並讓哨兵守在基地附近。'],
};
// cause＝倒下原因（例：「被史萊姆攻擊」），會顯示在結算畫面上
function loseOverlay(reason, cause) {
  const [title, text] = LOSE_TEXT[reason] || LOSE_TEXT.base;
  const causeLine = cause ? '<span class="lose-cause">倒下原因：<b>' + cause + '</b></span>' : '';
  showOverlay(title, causeLine + text + (typeof missionLoseExtra === 'function' ? missionLoseExtra() : ''), '再挑戰');
}
// 怪物的中文名稱（怪物編輯器裡的名字）
function monsterNameOf(e) { const spec = e && ACTIVE_MONSTERS.find(m => m.id === e.type); return (spec && spec.name) || '異質體'; }

function prepareMonsterPreview() {
  if (!MONSTER_PREVIEW_ID) return;
  const spec = ACTIVE_MONSTERS.find(m => m.id === MONSTER_PREVIEW_ID);
  G.cores = []; G.enemies = []; G.towers = []; G.npcs = []; LIGHT.enabled = false;
  // Existing per-monster debug spawners must not add unrelated species to this test scene.
  G.milkfishTestDone = true; G.loofahTestDone = true; G.fishTestDone = true; G.clownfishTestDone = true;
  G.player.x = CELL * 10; G.player.y = CELL * 7; G.player.hp = PLAYER.hp; G.guide = G.guideMax;
  if (spec) G.enemies.push(createMonster(spec, CELL * 14, CELL * 7));
  const note = document.querySelector('.header-note');
  if (note) note.textContent = '🔍 ' + (spec?.name || '怪物') + '測試場 · WASD 移動，滑鼠射擊；不會寫入正式存檔';
  updateCamera(); updateHUD();
}
function begin(playSound = true) { if (playSound) sfx('button'); closeElevatorMenu(); closeSupplyShop(true); closeBackpack(true); closeDialogue(true); closeSentryMenu(); closeGroundMenu(); assigning = null; setPaused(false); if (!restoreCombatProgress()) newGame(); prepareMonsterPreview(); G.phase = 'playing'; hideOverlay(); G.running = true; G.betweenWaves = 0.01; if (typeof updateBurrowMouseTestSpawn === 'function') updateBurrowMouseTestSpawn(BURROW_MOUSE_TEST.delay, true); }
function win() { G.over = true; G.won = true; G.running = false; G.phase = 'won'; setPaused(false); sfx('win'); addStat('wins'); achieveOnBattleEnd('win'); if (typeof questEvent === 'function') questEvent('win'); winOverlay(); }
// 基地被打壞：先讓玩家看到壞掉的營地，BASE_LOSE_DELAY 秒後才跳失敗畫面
const BASE_LOSE_DELAY = 5;
function baseLost() { if (!G.over && !(G.baseLostT > 0)) { G.baseLostT = BASE_LOSE_DELAY; systemNotice('營地被摧毀了……', true); } }
// 溫特倒下的陣亡動畫：踉蹌 → 倒地（倒地圖）→ 畫面慢慢變灰變暗，戰場定格；PLAYER_DEATH.total 秒後才跳結算畫面（動畫在 js/render.js 的 drawPlayerDeath）
const PLAYER_DEATH = { stagger: .3, fall: .25, dark: .4, total: 2.4 };
function lose(reason, cause) {
  if ((typeof practiceOn === 'function' && practiceOn())) return;
  if (reason === 'player' && G.player && !G.over) {
    G.over = true; G.running = false; G.phase = 'lost'; setPaused(false);
    const run = G, death = G.playerDeath = { at: performance.now() };
    if (typeof updateHUD === 'function') updateHUD();   // 戰場定格前先刷新一次：HUD 的 HP 顯示 0
    G.cameraShakeT = 0; shakeAmt = 0;   // 不要震動（戰場定格後鏡頭震動的倒數也停了，不歸零會一直抖）
    document.getElementById('screenShade').classList.add('player-dying');   // 畫面慢慢變灰變暗（css/style.css 的 #screenShade；不動畫布的濾鏡，理智值變灰還在用）
    setTimeout(() => {
      if (G !== run || G.playerDeath !== death) return;   // 已經重新開始了
      document.getElementById('screenShade').classList.remove('player-dying');
      sfx('lose'); loseOverlay(reason, cause);
    }, PLAYER_DEATH.total * 1000);
    return;
  }
  G.over = true; G.running = false; G.phase = 'lost'; setPaused(false); sfx('lose'); loseOverlay(reason, cause);
}
ovBtn.addEventListener('click', () => { if (typeof onOverlayButton === 'function' && onOverlayButton()) return; begin(); });   // 打贏任務＝返回應變中心（js/missions.js）

// ---- 地圖選單（有兩張以上地圖才顯示；在開始畫面切換要玩哪張）----
const MAP_PICK_NAMES = ['Y 區 · 地下街入口', '2F應變中心'];   // 開始畫面能選的地圖（照地圖名稱）；清空＝全部地圖都能選
const mapPick = document.getElementById('mapPick');
const mapPickRow = document.getElementById('mapPickRow');
if (mapPick && mapPickRow && !PREVIEW && typeof MAPS_DEFAULT !== 'undefined' && MAPS_DEFAULT.length > 1) {
  MAPS_DEFAULT.forEach((m, i) => {
    if (MAP_PICK_NAMES.length && !MAP_PICK_NAMES.includes(m.name)) return;
    const o = document.createElement('option'); o.value = i; o.textContent = m.name || ('地圖 ' + (i + 1)); mapPick.appendChild(o);
  });
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
