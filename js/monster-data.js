const MONSTER_STORAGE_KEY = 'tudrc_monsters_v1';
const SLIME_SETTINGS_STORAGE_KEY = 'tudrc_slime_variants_v1';
// ---- 史萊姆種類（分裂、自爆、吐酸、巨型、小史萊姆）的機率與倍率 ----
const SLIME_VARIANT_FIELDS = {   // 欄位：[最小值, 最大值]
  chance: [0, 1], unlockAt: [0, 3600], hpMul: [0.05, 50], speedMul: [0.05, 10],
  dmgMul: [0, 50], rewardMul: [0, 50], scale: [0.2, 5], hue: [-180, 180],
};
function validSlimeSettings(raw) {
  const base = typeof SLIME_SETTINGS_DEFAULT !== 'undefined' ? SLIME_SETTINGS_DEFAULT : { variants: [], giant: {} };
  const src = raw && typeof raw === 'object' ? raw : {};
  const clamp = (v, [lo, hi], fallback) => { const n = Number(v); return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : fallback; };
  const variants = (base.variants || []).map(def => {
    const own = (Array.isArray(src.variants) ? src.variants : []).find(v => v && v.id === def.id) || {};
    const out = { id: def.id, name: String(own.name || def.name || def.id).slice(0, 40) };
    for (const [key, range] of Object.entries(SLIME_VARIANT_FIELDS)) out[key] = clamp(own[key], range, def[key] ?? (key === 'chance' || key === 'unlockAt' || key === 'hue' ? 0 : 1));
    return out;
  });
  const g = src.giant || {}, gd = base.giant || {};
  const giant = { first: clamp(g.first, [0, 3600], gd.first ?? 45), every: clamp(g.every, [5, 3600], gd.every ?? 75) };
  return { variants, giant };
}
function slimeSettings(useBrowserDraft = false) {
  if (useBrowserDraft) {
    try { const saved = (typeof DraftSync !== 'undefined' ? DraftSync.load(SLIME_SETTINGS_STORAGE_KEY, (typeof SLIME_SETTINGS_DEFAULT !== 'undefined' ? SLIME_SETTINGS_DEFAULT : undefined), { label: '史萊姆設定' }) : JSON.parse(localStorage.getItem(SLIME_SETTINGS_STORAGE_KEY) || 'null')); if (saved) return validSlimeSettings(saved); } catch (_) {}
  }
  return validSlimeSettings(null);
}
function validMonsterCatalog(list) {
  if (!Array.isArray(list)) return [];
  const ids = new Set();
  return list.filter(monster => {
    if (!monster || !/^[a-z][a-z0-9_]*$/.test(monster.id) || ids.has(monster.id)) return false;
    ids.add(monster.id);
    return true;
  }).map(monster => ({
    id: monster.id,
    name: String(monster.name || monster.id),
    sprite: String(monster.sprite || 'images/monster/Monster_Slime.png'),
    hp: Math.max(1, Number(monster.hp) || 40),
    speed: Math.max(1, Number(monster.speed) || 44),
    playerDamage: Math.max(0, Number(monster.playerDamage) || 0),
    sentryDamage: Math.max(0, Number(monster.sentryDamage) || 0),
    buildingDamage: Math.max(0, Number(monster.buildingDamage) || 0),
    reward: Math.max(0, Number(monster.reward) || 0),
    crystals: Math.max(0, Number(monster.crystals) || 0),
    width: Math.max(8, Number(monster.width) || 42),
    height: Math.max(8, Number(monster.height) || 33),
    ...(validMonsterFrames(monster.frames) ? { frames: validMonsterFrames(monster.frames) } : {}),
    ...(monster.behavior === 'charger' ? { behavior: 'charger', charger: validChargerCfg(monster.charger) } : {}),   // 行為模式：charger＝鳥頭人的發呆／衝撞（js/bird-head.js）
    ...(monster.behavior === 'shooter' ? { behavior: 'shooter', shooter: validShooterCfg(monster.shooter) } : {}),   // shooter＝珍珠小童的飄浮／噴珍珠（js/pearl-kid.js）
    ...(monster.behavior === 'boomerang' ? { behavior: 'boomerang', boomerang: validBoomerangCfg(monster.boomerang) } : {}),
    ...(monster.behavior === 'fishhead' ? { behavior: 'fishhead' } : {}),
    ...(monster.behavior === 'burrow' ? { behavior: 'burrow', burrow: validBurrowCfg(monster.burrow) } : {}),
    ...(monster.behavior === 'milkfish' || monster.behavior === 'milkfishSmall' ? { behavior: monster.behavior } : {}),   // milkfish＝虱目魚小子：吃隊友、吃一格的物品；milkfishSmall＝小虱目魚小子：只吃物品（js/milkfish-kid.js，數值在 MILKFISH）
    ...(monster.behavior === 'vine' ? { behavior: 'vine' } : {}),
    ...(monster.behavior === 'clownfish' ? { behavior: 'clownfish' } : {}),
    ...(monster.behavior === 'gourd' ? { behavior: 'gourd' } : {}),   // gourd＝葫蘆猴：慢慢拖行、升空泰山壓頂、一格的窄道過不去（js/gourd-monkey.js，數值在 GOURD）
    ...(monster.behavior === 'moth' ? { behavior: 'moth' } : {}),   // moth＝人面蝶：在空中慢慢飛、撒三色鱗粉（毒／混亂／睡眠）、趨光（js/human-face-butterfly.js，數值在 MOTH）
    ...(monster.behavior === 'healer' ? { behavior: 'healer' } : {}),   // healer＝金蕉王：幫附近的怪物補血、看到人就逃（js/golden-banana-king.js，數值在 BANANA_KING）   // vine＝絲瓜小姐：重踏放藤蔓纏人（js/loofah-lady.js，數值在 LOOFAH）   // fishhead＝魚頭君：噴水、去滅火、留水漬（js/fish-head.js，數值在 FISH_HEAD）   // boomerang＝夯吉寶丟迴力鏢帽子（js/hangi-bao.js）
    ...(validMonsterArt(monster.art) ? { art: validMonsterArt(monster.art) } : {}),   // 狀態圖（一般／眨眼／生氣、子彈），給 shooter 用
    // 專屬音效（js/sfx.js 裡的名稱）：hitSound 被打中、deathSound 死掉；沒填就用通用的
    ...(typeof monster.hitSound === 'string' && monster.hitSound ? { hitSound: monster.hitSound } : {}),
    ...(typeof monster.deathSound === 'string' && monster.deathSound ? { deathSound: monster.deathSound } : {}),
    ...(monster.undying ? { undying: true } : {}),
    ...(monster.noHitSquash ? { noHitSquash: true } : {}),   // 被打中時不要壓扁回彈
    ...(Number.isFinite(+monster.stagger) ? { stagger: Math.max(0, Math.min(2, +monster.stagger)) } : {}),
    ...(monster.noStun ? { noStun: true } : {}),
    ...(Number.isFinite(+monster.shockResist) ? { shockResist: Math.max(0, Math.min(2, +monster.shockResist)) } : {}),   // 不怕電：雷電傷害的倍率（0.6＝只吃 6 成），而且不會被電到麻痺（安柏的雷擊、雷電彈）
    // sweep：範圍攻擊（揮一下打到前方扇形內所有人）。range＝攻擊距離（格）、arc＝扇形角度（度）
    ...(monster.sweep && typeof monster.sweep === 'object' ? { sweep: { range: Math.max(.3, Math.min(5, Number(monster.sweep.range) || 1.5)), arc: Math.max(20, Math.min(360, Number(monster.sweep.arc) || 140)) } } : {}),   // 不會被隊員的攻擊停住（安柏的雷電麻痺、路德的拳頭和大招）
    ...(Number.isFinite(+monster.knockMul) ? { knockMul: Math.max(0, Math.min(2, +monster.knockMul)) } : {}),   // 被打時擊退距離的倍率（1＝一般；0.4＝只微微後退；0＝不退）   // 被重擊時硬直幾秒（沒填用通用值 0.3）   // 不死：HP 歸零只會碎掉，30 秒後復活；要用火燒才會真的死（js/lifeform.js）
  }));
}
// 走路動畫（選填）：front 站著、walkFront 走路（沒有 side 時，往任何方向走都用這組）、
// side 側面走路（選填；sideFacing＝原圖朝哪邊，另一邊自動左右翻）
// 沒有 frames 的怪物（例如史萊姆）維持單張圖＋跳躍。
// ---- 衝撞型（鳥頭人）的行為數值：怪物編輯器與遊戲共用這份欄位表 ----
// [欄位, 編輯器標籤, 最小, 最大, 間距, 預設]；pct＝編輯器以 % 顯示
const CHARGER_FIELDS = [
  { key: 'noticeRange',     label: '注意範圍（格）',         min: 1,   max: 30,   step: .5,  def: 6 },
  { key: 'loseRange',       label: '放棄追擊距離（格）',     min: 2,   max: 40,   step: .5,  def: 12 },
  { key: 'idleMin',         label: '發呆最短（秒）',         min: .2,  max: 60,   step: .5,  def: 2.5 },
  { key: 'idleMax',         label: '發呆最長（秒）',         min: .2,  max: 60,   step: .5,  def: 5 },
  { key: 'wanderChance',    label: '發呆完去散步的機率 %',   min: 0,   max: 1,    step: .05, def: .4, pct: true },
  { key: 'wanderRadius',    label: '散步最遠（格）',         min: .5,  max: 15,   step: .5,  def: 3 },
  { key: 'wanderSpeedMul',  label: '散步速度 ×',             min: .05, max: 3,    step: .05, def: .45 },
  { key: 'noticeTime',      label: '發現後愣住（秒）',       min: 0,   max: 5,    step: .05, def: .45 },
  { key: 'chargeRange',     label: '幾格內才衝撞',           min: 1,   max: 20,   step: .5,  def: 7 },
  { key: 'chargeSpeed',     label: '衝撞速度（像素／秒）',   min: 20,  max: 800,  step: 10,  def: 210 },
  { key: 'chargeOvershoot', label: '衝過頭多衝（格）',       min: 0,   max: 10,   step: .1,  def: 1.2 },
  { key: 'huntSpeedMul',    label: '繞路追擊速度 ×',         min: .1,  max: 5,    step: .1,  def: 1.5 },
  { key: 'recoverHit',      label: '撞到人後喘氣（秒）',     min: 0,   max: 10,   step: .1,  def: .9 },
  { key: 'recoverMiss',     label: '沒撞到停頓（秒）',       min: 0,   max: 10,   step: .1,  def: .5 },
  { key: 'recoverWall',     label: '撞牆暈眩（秒）',         min: 0,   max: 10,   step: .1,  def: 1.2 },
  { key: 'knockback',       label: '撞飛距離（像素）',       min: 0,   max: 300,  step: 5,   def: 80 },
];
// 鑽地型：本體從洞口探出；手鎖定地面位置，出手前保留可閃避的預警。
const BURROW_FIELDS = [
  { key: 'noticeRange', label: '注意範圍（格）', min: 1, max: 30, step: .5, def: 14 },
  { key: 'hitRadius', label: '地底手命中半徑（格）', min: .3, max: 3, step: .1, def: 1.2 },
  { key: 'tunnelSpeed', label: '地底鑽行速度（格／秒）', min: .5, max: 10, step: .05, def: 1.75 },
  { key: 'windup', label: '地洞預警（秒）', min: .2, max: 4, step: .05, def: .8 },
  { key: 'handRise', label: '手鑽出到命中（秒）', min: .1, max: 1, step: .05, def: .2 },
  { key: 'handHold', label: '手停留（秒）', min: .1, max: 2, step: .05, def: .4 },
  { key: 'cooldown', label: '攻擊間隔（秒）', min: .5, max: 15, step: .1, def: 2.6 },
  { key: 'emergeTime', label: '本體出土／入土（秒）', min: .3, max: 3, step: .05, def: .75 },
];
function validBurrowCfg(raw) {
  const src = raw && typeof raw === 'object' ? raw : {}, out = {};
  for (const f of BURROW_FIELDS) {
    const n = Number(src[f.key]); out[f.key] = Number.isFinite(n) ? Math.max(f.min, Math.min(f.max, n)) : f.def;
  }
  return out;
}
function validChargerCfg(raw) {
  const src = raw && typeof raw === 'object' ? raw : {}, out = {};
  for (const f of CHARGER_FIELDS) {
    const n = Number(src[f.key]);
    out[f.key] = Number.isFinite(n) ? Math.max(f.min, Math.min(f.max, n)) : f.def;
  }
  if (out.idleMax < out.idleMin) out.idleMax = out.idleMin;
  return out;
}
// ---- 飄浮射擊型（珍珠小童）的行為數值 ----
const SHOOTER_FIELDS = [
  { key: 'noticeRange',      label: '注意範圍（格）',         min: 1,   max: 30,  step: .5,  def: 7 },
  { key: 'loseRange',        label: '放棄追擊距離（格）',     min: 2,   max: 40,  step: .5,  def: 12 },
  { key: 'shootRange',       label: '射程（格）',             min: 1,   max: 15,  step: .5,  def: 5 },
  { key: 'keepDistance',     label: '太近就後退（格）',       min: 0,   max: 10,  step: .5,  def: 2.5 },
  { key: 'retreatSpeedMul',  label: '後退速度 ×',             min: 0,   max: 3,   step: .1,  def: .8 },
  { key: 'hover',            label: '浮空高度（像素）',       min: 0,   max: 60,  step: 2,   def: 16 },
  { key: 'windup',           label: '噴之前蓄力（秒）',       min: 0,   max: 3,   step: .05, def: .5 },
  { key: 'cooldown',         label: '每次噴的間隔（秒）',     min: .2,  max: 15,  step: .1,  def: 2.4 },
  { key: 'angryCooldownMul', label: '生氣時間隔 ×',           min: .1,  max: 2,   step: .05, def: .75 },
  { key: 'pearlSpeed',       label: '珍珠速度（像素／秒）',   min: 40,  max: 900, step: 10,  def: 240 },
  { key: 'pearlCount',       label: '一次噴幾顆',             min: 1,   max: 7,   step: 1,   def: 1 },
  { key: 'pearlSpread',      label: '多顆時散開角度（度）',   min: 0,   max: 90,  step: 2,   def: 14 },
  { key: 'wanderRadius',     label: '閒晃最遠（格）',         min: .5,  max: 10,  step: .5,  def: 2.5 },
  { key: 'wanderSpeedMul',   label: '閒晃速度 ×',             min: .05, max: 3,   step: .05, def: .7 },
  { key: 'idleMin',          label: '發呆最短（秒）',         min: .2,  max: 30,  step: .5,  def: 1.5 },
  { key: 'idleMax',          label: '發呆最長（秒）',         min: .2,  max: 30,  step: .5,  def: 3.5 },
];
// ---- 迴力鏢型（夯吉寶）：丟出小順順宮帽，飛到盡頭再飛回自己身上（js/hangi-bao.js）----
const BOOMERANG_FIELDS = [
  { key: 'noticeRange',     label: '注意範圍（格）',         min: 1,   max: 30,  step: .5,  def: 7 },
  { key: 'loseRange',       label: '放棄追擊距離（格）',     min: 2,   max: 40,  step: .5,  def: 12 },
  { key: 'throwRange',      label: '丟帽子的距離（格）',     min: 1,   max: 15,  step: .5,  def: 4.5 },
  { key: 'keepDistance',    label: '太近就後退（格）',       min: 0,   max: 10,  step: .5,  def: 2 },
  { key: 'retreatSpeedMul', label: '後退速度 ×',             min: 0,   max: 3,   step: .1,  def: .8 },
  { key: 'windup',          label: '丟之前的準備（秒）',     min: 0,   max: 3,   step: .05, def: .35 },
  { key: 'cooldown',        label: '帽子回來後再丟的間隔（秒）', min: .2, max: 10, step: .1, def: 1.6 },
  { key: 'capSpeed',        label: '帽子飛行速度',           min: 40,  max: 800, step: 10,  def: 260 },
  { key: 'returnSpeedMul',  label: '飛回來的速度 ×',         min: .3,  max: 3,   step: .05, def: 1.15 },
  { key: 'wanderRadius',    label: '閒晃範圍（格）',         min: .5,  max: 10,  step: .5,  def: 2.5 },
  { key: 'wanderSpeedMul',  label: '閒晃速度 ×',             min: .1,  max: 2,   step: .1,  def: .6 },
  { key: 'idleMin',         label: '發呆最短（秒）',         min: .2,  max: 30,  step: .5,  def: 1 },
  { key: 'idleMax',         label: '發呆最長（秒）',         min: .2,  max: 30,  step: .5,  def: 3 },
];
function validBoomerangCfg(raw) {
  const src = raw && typeof raw === 'object' ? raw : {}, out = {};
  for (const f of BOOMERANG_FIELDS) {
    const n = Number(src[f.key]);
    out[f.key] = Number.isFinite(n) ? Math.max(f.min, Math.min(f.max, n)) : f.def;
  }
  if (out.idleMax < out.idleMin) out.idleMax = out.idleMin;
  return out;
}
function validShooterCfg(raw) {
  const src = raw && typeof raw === 'object' ? raw : {}, out = {};
  for (const f of SHOOTER_FIELDS) {
    const n = Number(src[f.key]);
    out[f.key] = Number.isFinite(n) ? Math.max(f.min, Math.min(f.max, n)) : f.def;
  }
  if (out.idleMax < out.idleMin) out.idleMax = out.idleMin;
  out.pearlCount = Math.round(out.pearlCount);
  return out;
}
// 狀態圖：normal／half／closed（眨眼）、angry／angryHalf（生氣）、pearl（子彈）等，值都是圖片路徑
function validMonsterArt(art) {
  if (!art || typeof art !== 'object') return null;
  const out = {};
  for (const [k, v] of Object.entries(art)) if (typeof v === 'string' && v) out[k] = v;
  return Object.keys(out).length ? out : null;
}
function validMonsterFrames(frames) {
  if (!frames || typeof frames !== 'object') return null;
  const list = v => (Array.isArray(v) ? v : []).filter(x => typeof x === 'string' && x);
  const front = typeof frames.front === 'string' ? frames.front : '';
  const walkFront = list(frames.walkFront), walkBack = list(frames.walkBack), side = list(frames.side), idle = list(frames.idle), attack = list(frames.attack), blink = list(frames.blink);
  const points = v => (Array.isArray(v) ? v : []).filter(q => Array.isArray(q) && Number.isFinite(+q[0]) && Number.isFinite(+q[1])).map(q => [+q[0], +q[1]]);
  const eyes = points(frames.eyes), idleEyes = points(frames.idleEyes);
  if (!front && !walkFront.length && !side.length) return null;
  return { front: front || walkFront[0] || side[0], walkFront: walkFront.length ? walkFront : [front || side[0]],
    // walkFacing：站姿／走路圖本身朝哪邊（例如生命體朝左）；往另一邊走時左右翻。沒填＝正面圖，不翻
    ...(frames.walkFacing === 'left' || frames.walkFacing === 'right' ? { walkFacing: frames.walkFacing } : {}),
    ...(side.length ? { side, sideFacing: frames.sideFacing === 'right' ? 'right' : 'left' } : {}),
    // back／walkBack：背面（斜後）站姿與走路圖（例如魚頭君往上走時露出魚肉）；backFacing＝原圖朝哪邊
    ...(walkBack.length ? { back: typeof frames.back === 'string' && frames.back ? frames.back : walkBack[0], walkBack, backFacing: frames.backFacing === 'left' ? 'left' : 'right' } : {}),
    // idle 站著不動時的動畫（例如鳥頭人轉眼睛）；idleFacing＝原圖朝哪邊；idleFps＝每秒幾張
    ...(idle.length ? { idle, idleFacing: frames.idleFacing === 'right' ? 'right' : 'left', idleFps: Math.max(.5, Math.min(24, Number(frames.idleFps) || 4)) } : {}),
    // eyes／idleEyes：眼睛在原圖上的像素座標（正面圖／發呆圖），鎖定目標時眼睛閃光用
    ...(eyes.length ? { eyes } : {}), ...(idleEyes.length ? { idleEyes } : {}),
    // blink：站著不動時每隔幾秒眨一次眼（2 張：半閉、全閉）
    ...(blink.length ? { blink } : {}),
    // attack：揮手攻擊動畫（3 張：舉手、揮出、收手；4 張：半舉、高舉蓄力、揮下、收回）
    // attackFacing＝原圖往哪邊揮，目標在另一邊時左右翻；圖可以比站姿大（以腳底中央對齊）
    ...(attack.length ? { attack, attackFacing: frames.attackFacing === 'left' ? 'left' : 'right' } : {}),
    // attackRig：揮手時「即時轉動手臂」，比換圖流暢。body＝沒有那隻手的身體、arm＝只有那隻手（兩張跟站姿圖同尺寸）
    // pivot＝肩膀在圖上的位置、rest＝手臂平常的角度、angles＝[半舉, 高舉, 揮下] 的角度（0＝往右、90＝往下、180＝往左、270＝往上）
    ...(validAttackRig(frames.attackRig) ? { attackRig: validAttackRig(frames.attackRig) } : {}) };
}
function validAttackRig(r) {
  if (!r || typeof r.body !== 'string' || typeof r.arm !== 'string') return null;
  const n = (v, d) => Number.isFinite(+v) ? +v : d;
  const pivot = Array.isArray(r.pivot) ? [n(r.pivot[0], 0), n(r.pivot[1], 0)] : [0, 0];
  const angles = Array.isArray(r.angles) && r.angles.length >= 3 ? r.angles.slice(0, 3).map(a => n(a, 0)) : null;
  if (!angles) return null;
  return { body: r.body, arm: r.arm, pivot, rest: n(r.rest, 90), angles, facing: r.facing === 'left' ? 'left' : 'right' };
}
function monsterFrameFiles(monster) {
  const f = monster.frames; if (!f) return [];
  return [...new Set([f.front, ...f.walkFront, ...(f.back ? [f.back] : []), ...(f.walkBack || []), ...(f.side || []), ...(f.idle || []), ...(f.attack || []), ...(f.blink || []), ...(f.attackRig ? [f.attackRig.body, f.attackRig.arm] : [])])];
}
function monsterCatalog(useBrowserDraft = false) {
  if (useBrowserDraft) {
    try {
      const saved = validMonsterCatalog((typeof DraftSync !== 'undefined' ? DraftSync.load(MONSTER_STORAGE_KEY, MONSTERS_DEFAULT, { label: '怪物' }) : JSON.parse(localStorage.getItem(MONSTER_STORAGE_KEY) || 'null')));   // 編輯器裡：暫存和專案檔三方合併（js/draft-sync.js）
      if (saved.length) {
        for (const monster of validMonsterCatalog(MONSTERS_DEFAULT)) {
          const own = saved.find(m => m.id === monster.id);
          if (!own) saved.push(monster);
          else {
            if (monster.frames) own.frames = monster.frames;   // 走路動畫、行為模式不在編輯器裡改，一律用檔案的設定
            if (monster.behavior) own.behavior = monster.behavior;
            if (monster.art) own.art = monster.art;   // 狀態圖不在編輯器裡改
            if (monster.shooter && !own.shooter) own.shooter = monster.shooter;
            if (monster.boomerang && !own.boomerang) own.boomerang = monster.boomerang;
            if (monster.hitSound) own.hitSound = monster.hitSound;     // 音效不在編輯器裡改，一律用檔案的設定
            if (monster.deathSound) own.deathSound = monster.deathSound;
            if (monster.charger && !own.charger) own.charger = monster.charger;   // 舊暫存還沒有行為數值
            if (monster.burrow && !own.burrow) own.burrow = monster.burrow;
            if (String(own.sprite).startsWith('images/monster/鳥頭人/')) own.sprite = monster.sprite;   // 2026-10-11 圖片改成英文檔名
          }
        }
        return saved;
      }
    } catch (_) {}
  }
  return validMonsterCatalog(MONSTERS_DEFAULT);
}
function monsterChoices(map, catalog) {
  const available = new Set(catalog.map(monster => monster.id));
  const mix = Array.isArray(map && map.monsterMix) ? map.monsterMix : [];
  const choices = mix.filter(item => available.has(item.id) && Number(item.weight) > 0)
    .map(item => ({ id: item.id, weight: Number(item.weight) }));
  if (choices.length) return choices;
  const fallback = available.has('slime') ? 'slime' : catalog[0]?.id;
  return fallback ? [{ id: fallback, weight: 1 }] : [];
}
function chooseMonster(map, catalog, random = Math.random()) {
  const choices = monsterChoices(map, catalog);
  let roll = random * choices.reduce((sum, item) => sum + item.weight, 0);
  for (const item of choices) {
    roll -= item.weight;
    if (roll < 0) return catalog.find(monster => monster.id === item.id) || catalog[0];
  }
  return catalog[0];
}
