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
    try { const saved = JSON.parse(localStorage.getItem(SLIME_SETTINGS_STORAGE_KEY) || 'null'); if (saved) return validSlimeSettings(saved); } catch (_) {}
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
    ...(validMonsterArt(monster.art) ? { art: validMonsterArt(monster.art) } : {}),   // 狀態圖（一般／眨眼／生氣、子彈），給 shooter 用
    // 專屬音效（js/sfx.js 裡的名稱）：hitSound 被打中、deathSound 死掉；沒填就用通用的
    ...(typeof monster.hitSound === 'string' && monster.hitSound ? { hitSound: monster.hitSound } : {}),
    ...(typeof monster.deathSound === 'string' && monster.deathSound ? { deathSound: monster.deathSound } : {}),
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
  const walkFront = list(frames.walkFront), side = list(frames.side), idle = list(frames.idle);
  const points = v => (Array.isArray(v) ? v : []).filter(q => Array.isArray(q) && Number.isFinite(+q[0]) && Number.isFinite(+q[1])).map(q => [+q[0], +q[1]]);
  const eyes = points(frames.eyes), idleEyes = points(frames.idleEyes);
  if (!front && !walkFront.length && !side.length) return null;
  return { front: front || walkFront[0] || side[0], walkFront: walkFront.length ? walkFront : [front || side[0]],
    ...(side.length ? { side, sideFacing: frames.sideFacing === 'right' ? 'right' : 'left' } : {}),
    // idle 站著不動時的動畫（例如鳥頭人轉眼睛）；idleFacing＝原圖朝哪邊；idleFps＝每秒幾張
    ...(idle.length ? { idle, idleFacing: frames.idleFacing === 'right' ? 'right' : 'left', idleFps: Math.max(.5, Math.min(24, Number(frames.idleFps) || 4)) } : {}),
    // eyes／idleEyes：眼睛在原圖上的像素座標（正面圖／發呆圖），鎖定目標時眼睛閃光用
    ...(eyes.length ? { eyes } : {}), ...(idleEyes.length ? { idleEyes } : {}) };
}
function monsterFrameFiles(monster) {
  const f = monster.frames; if (!f) return [];
  return [...new Set([f.front, ...f.walkFront, ...(f.side || []), ...(f.idle || [])])];
}
function monsterCatalog(useBrowserDraft = false) {
  if (useBrowserDraft) {
    try {
      const saved = validMonsterCatalog(JSON.parse(localStorage.getItem(MONSTER_STORAGE_KEY) || 'null'));
      if (saved.length) {
        for (const monster of validMonsterCatalog(MONSTERS_DEFAULT)) {
          const own = saved.find(m => m.id === monster.id);
          if (!own) saved.push(monster);
          else {
            if (monster.frames) own.frames = monster.frames;   // 走路動畫、行為模式不在編輯器裡改，一律用檔案的設定
            if (monster.behavior) own.behavior = monster.behavior;
            if (monster.art) own.art = monster.art;   // 狀態圖不在編輯器裡改
            if (monster.shooter && !own.shooter) own.shooter = monster.shooter;
            if (monster.hitSound) own.hitSound = monster.hitSound;     // 音效不在編輯器裡改，一律用檔案的設定
            if (monster.deathSound) own.deathSound = monster.deathSound;
            if (monster.charger && !own.charger) own.charger = monster.charger;   // 舊暫存還沒有行為數值
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
