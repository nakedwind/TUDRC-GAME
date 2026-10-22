/* ===== 哨兵／嚮導技能樹 =====
   每位隊員 10 格（排法在 js/skills.js 的 SKILL_LAYOUT）：
     ① 起點（攻擊第 1 層）→ ② 分岔點（生存第 1 層）→ 往右分成三條路：
       上排：攻擊第 2、3 層　中排：異能第 1～3 層＋終極技能（abl 的第 4 個）　下排：生存第 2、3 層
   要學一格，它前面那一格要先學。每格直接花異質碎片（SKILL_NODE_COST）。在基地的 Y102 隊員名單按「技能樹」學習。
   效果 mods：改這位隊員的數值（js/skills.js 會套到 TYPES 上）
     path＝數值名稱（例：dmg 攻擊、rate 攻速、hp 血量、range 射程、defense 防禦、burn.duration 燃燒秒數…）
     mul＝乘上多少（1.1＝+10%）、add＝加多少
*/
const SKILL_COST = [40, 80, 150, 250];   // 舊的寫法（第 1／2／3／4 層），新版看下面的 SKILL_NODE_COST
// 每一格要花多少異質碎片（id＝分支-層：atk 攻擊、def 生存、abl 異能；abl-4＝終極技能）
const SKILL_NODE_COST = { 'atk-1': 40, 'def-1': 40, 'atk-2': 80, 'atk-3': 150, 'abl-1': 40, 'abl-2': 80, 'abl-3': 150, 'abl-4': 250, 'def-2': 80, 'def-3': 150 };
const SKILL_BRANCHES = [
  { id: 'atk', name: '攻擊', icon: '⚔️' },
  { id: 'def', name: '生存', icon: '🛡️' },
  { id: 'abl', name: '異能', icon: '✨' },
];
// 攻擊、生存的前兩層大家都一樣；第 3 層和異能分支依每個人的個性設計
const SKILL_COMMON = {
  atk: [
    { name: '鍛鍊', desc: '攻擊力 +10%', mods: [{ path: 'dmg', mul: 1.1 }] },
    { name: '連擊', desc: '攻擊速度 +15%', mods: [{ path: 'rate', mul: 1.15 }] },
  ],
  def: [
    { name: '體能訓練', desc: '最大 HP +15%', mods: [{ path: 'hp', mul: 1.15 }] },
    { name: '防護技巧', desc: '受到的傷害再減少 8%', mods: [{ path: 'defense', add: .08 }] },
  ],
};
// 每個人：atk3／def3＝攻擊、生存第 3 層；abl＝異能分支四格（第 4 格＝終極技能）
// 終極技能可以用的數值：ultCdCut（大招冷卻減少幾成，add .25＝−25%）、ultDmgBonus（大招傷害增加幾成，add .3＝+30%）
const SKILL_TREES = {
  theonie: {
    atk3: { name: '精準烈焰', desc: '攻擊力 +20%，射程 +1 格', mods: [{ path: 'dmg', mul: 1.2 }, { path: 'range', add: 1 }] },
    def3: { name: '耐熱體質', desc: '最大 HP +20%，每次攻擊增加的精神負荷 −20%', mods: [{ path: 'hp', mul: 1.2 }, { path: 'taint', mul: .8 }] },
    abl: [
      { name: '延燒', desc: '燃燒時間 +2 秒', mods: [{ path: 'burn.duration', add: 2 }] },
      { name: '烈焰', desc: '燃燒每秒傷害 +3', mods: [{ path: 'burn.damage', add: 3 }] },
      { name: '業火', desc: '燃燒時間再 +3 秒，每秒傷害再 +4', mods: [{ path: 'burn.duration', add: 3 }, { path: 'burn.damage', add: 4 }] },
      { name: '焚天', desc: '大招傷害 +30%，大招冷卻 −25%，燃燒時間再 +2 秒', mods: [{ path: 'ultDmgBonus', add: .3 }, { path: 'ultCdCut', add: .25 }, { path: 'burn.duration', add: 2 }] },
    ],
  },
  amber: {
    atk3: { name: '雷霆萬鈞', desc: '攻擊力 +15%，雷擊範圍 +0.5 格', mods: [{ path: 'dmg', mul: 1.15 }, { path: 'splash', add: .5 }] },
    def3: { name: '避雷針', desc: '受到的傷害再減少 10%，最大 HP +15%', mods: [{ path: 'defense', add: .1 }, { path: 'hp', mul: 1.15 }] },
    abl: [
      { name: '麻痺延長', desc: '麻痺時間 +0.5 秒', mods: [{ path: 'stun', add: .5 }] },
      { name: '落雷範圍', desc: '雷擊範圍 +0.4 格', mods: [{ path: 'splash', add: .4 }] },
      { name: '精準雷擊', desc: '命中率 +25%，麻痺時間再 +1 秒', mods: [{ path: 'accuracy', add: .25 }, { path: 'stun', add: 1 }] },
      { name: '雷神降臨', desc: '大招傷害 +30%，大招冷卻 −25%，麻痺時間再 +0.5 秒', mods: [{ path: 'ultDmgBonus', add: .3 }, { path: 'ultCdCut', add: .25 }, { path: 'stun', add: .5 }] },
    ],
  },
  red: {
    atk3: { name: '重斧', desc: '攻擊力 +30%', mods: [{ path: 'dmg', mul: 1.3 }] },
    def3: { name: '鋼鐵意志', desc: '每秒回復 HP +3，受到的傷害再減少 10%', mods: [{ path: 'hpRegen', add: 3 }, { path: 'defense', add: .1 }] },
    abl: [
      { name: '挑釁', desc: '嘲諷範圍 +1 格', mods: [{ path: 'taunt', add: 1 }] },
      { name: '再生', desc: '每秒回復 HP +2', mods: [{ path: 'hpRegen', add: 2 }] },
      { name: '堅盾', desc: '受到的傷害再減少 15%，嘲諷範圍再 +1 格', mods: [{ path: 'defense', add: .15 }, { path: 'taunt', add: 1 }] },
      { name: '不倒之盾', desc: '大招冷卻 −30%，每秒回復 HP 再 +2，受到的傷害再減少 5%', mods: [{ path: 'ultCdCut', add: .3 }, { path: 'hpRegen', add: 2 }, { path: 'defense', add: .05 }] },
    ],
  },
  avaren: {
    atk3: { name: '致命刺擊', desc: '攻擊力 +20%，攻擊速度 +10%', mods: [{ path: 'dmg', mul: 1.2 }, { path: 'rate', mul: 1.1 }] },
    def3: { name: '隱匿', desc: '受到的傷害再減少 10%，移動速度 +15%', mods: [{ path: 'defense', add: .1 }, { path: 'walkSpeed', mul: 1.15 }] },
    abl: [
      { name: '腐蝕擴散', desc: '腐蝕範圍 +0.4 格', mods: [{ path: 'splash', add: .4 }] },
      { name: '侵蝕神智', desc: '混亂時間 +1.5 秒', mods: [{ path: 'confuse', add: 1.5 }] },
      { name: '劇毒', desc: '攻擊力 +15%，腐蝕範圍再 +0.4 格，混亂時間再 +1 秒', mods: [{ path: 'dmg', mul: 1.15 }, { path: 'splash', add: .4 }, { path: 'confuse', add: 1 }] },
      { name: '腐蝕領域', desc: '大招傷害 +30%，大招冷卻 −20%，腐蝕範圍再 +0.4 格', mods: [{ path: 'ultDmgBonus', add: .3 }, { path: 'ultCdCut', add: .2 }, { path: 'splash', add: .4 }] },
    ],
  },
  luther: {
    atk3: { name: '破壞拳', desc: '攻擊力 +25%', mods: [{ path: 'dmg', mul: 1.25 }] },
    def3: { name: '硬漢', desc: '最大 HP +20%，受到的傷害再減少 8%', mods: [{ path: 'hp', mul: 1.2 }, { path: 'defense', add: .08 }] },
    abl: [
      { name: '震退', desc: '擊退距離 +0.5 格', mods: [{ path: 'knockback', add: .5 }] },
      { name: '重擊暈眩', desc: '暈眩時間 +0.7 秒', mods: [{ path: 'stun', add: .7 }] },
      { name: '狂暴', desc: '怪力加成再 +50%（精神負荷越高越強），擊退距離再 +0.5 格', mods: [{ path: 'rageDmg', add: .5 }, { path: 'knockback', add: .5 }] },
      { name: '崩山', desc: '大招傷害 +40%，大招冷卻 −20%，暈眩時間再 +0.5 秒', mods: [{ path: 'ultDmgBonus', add: .4 }, { path: 'ultCdCut', add: .2 }, { path: 'stun', add: .5 }] },
    ],
  },
  tino: {
    atk3: { name: '速射', desc: '攻擊速度 +25%', mods: [{ path: 'rate', mul: 1.25 }] },
    def3: { name: '靈敏', desc: '移動速度 +20%，受到的傷害再減少 8%', mods: [{ path: 'walkSpeed', mul: 1.2 }, { path: 'defense', add: .08 }] },
    abl: [
      { name: '遠距感知', desc: '感知範圍 +5 格', mods: [{ path: 'sense', add: 5 }] },
      { name: '鷹眼', desc: '射程 +1 格，命中率 +5%', mods: [{ path: 'range', add: 1 }, { path: 'accuracy', add: .05 }] },
      { name: '全域感知', desc: '感知範圍再 +10 格', mods: [{ path: 'sense', add: 10 }] },
      { name: '夜之眼', desc: '感知範圍再 +10 格，命中率 +10%，攻擊力 +15%', mods: [{ path: 'sense', add: 10 }, { path: 'accuracy', add: .1 }, { path: 'dmg', mul: 1.15 }] },
    ],
  },
  eldrin: {
    atk3: { name: '護身術', desc: '攻擊力 +25%', mods: [{ path: 'dmg', mul: 1.25 }] },
    def3: { name: '沉著', desc: '最大 HP +20%，受到的傷害再減少 8%', mods: [{ path: 'hp', mul: 1.2 }, { path: 'defense', add: .08 }] },
    abl: [
      { name: '疏導範圍', desc: '疏導光環範圍 +0.8 格', mods: [{ path: 'aura.r', add: .8 }] },
      { name: '深度疏導', desc: '每次疏導回復 +3', mods: [{ path: 'aura.heal', add: 3 }] },
      { name: '共鳴', desc: '疏導量 +2／秒，光環範圍再 +0.5 格', mods: [{ path: 'aura.rate', add: 2 }, { path: 'aura.r', add: .5 }] },
      { name: '聖域', desc: '疏導光環範圍再 +0.6 格，疏導量再 +2／秒，每次疏導回復再 +3', mods: [{ path: 'aura.r', add: .6 }, { path: 'aura.rate', add: 2 }, { path: 'aura.heal', add: 3 }] },
    ],
  },
  chris: {
    atk3: { name: '戰鬥嚮導', desc: '攻擊力 +25%，射程 +1 格', mods: [{ path: 'dmg', mul: 1.25 }, { path: 'range', add: 1 }] },
    def3: { name: '沉著', desc: '最大 HP +20%，受到的傷害再減少 8%', mods: [{ path: 'hp', mul: 1.2 }, { path: 'defense', add: .08 }] },
    abl: [
      { name: '疏導範圍', desc: '疏導光環範圍 +0.8 格', mods: [{ path: 'aura.r', add: .8 }] },
      { name: '深度疏導', desc: '每次疏導回復 +3', mods: [{ path: 'aura.heal', add: 3 }] },
      { name: '共鳴', desc: '疏導量 +2／秒，光環範圍再 +0.5 格', mods: [{ path: 'aura.rate', add: 2 }, { path: 'aura.r', add: .5 }] },
      { name: '戰場指揮', desc: '攻擊力 +20%，疏導量再 +2／秒，光環範圍再 +0.4 格', mods: [{ path: 'dmg', mul: 1.2 }, { path: 'aura.rate', add: 2 }, { path: 'aura.r', add: .4 }] },
    ],
  },
};
