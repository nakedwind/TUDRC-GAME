/* ===== 技能樹（T-Pad「Y102隊員」的技能樹頁：js/squad-page.js）=====
   每位隊員 12 格（排法在下面的 SKILL_LAYOUT）：
     ① 普通技能 Lv1（trait-1）＝原本的特性，一開始就會
     ② 普通技能 Lv2（trait-2）＝特性更強
     ③ 從 Lv2 往右分三條：A 系列－生存（上排 2 格）、核心技能（中排 3 格）→ 終極核心大招、B 系列－攻擊（下排 2 格）
        核心技能第 1 格：A1、B1 要先學其中一個（技能樹上的兩條斜線）
     ④ 輔助技能 2 個（永久被動，學會 Lv2 之後就能學，各自獨立）
   技能內容：data/squad-skills.js（「Y102隊員裝備／技能編輯器」存的）；那邊沒寫的，從 data/skills.js（舊版技能資料）自動換算。
   學會的技能存在 training.skills（js/progression.js）：{ 隊員: [技能 id…] }。學會後把 mods 套到 TYPES 上；隊員裝備（js/squad-gear.js）的數值也在這裡一起套。
   效果 mods：path＝數值名稱（dmg 攻擊、rate 攻速、hp 血量、range 射程、defense 防禦、accuracy 命中、walkSpeed 移動速度…），mul＝乘、add＝加
*/
// req：要先學哪一格；reqAny：這幾格要先學其中一個；group：trait／a／b／core／ult／aux（畫面分區用）
const SKILL_LAYOUT = [
  { id: 'trait-1', group: 'trait', req: null, tag: '普通技能 Lv1' },
  { id: 'trait-2', group: 'trait', req: 'trait-1', tag: '普通技能 Lv2' },
  { id: 'a-1', group: 'a', req: 'trait-2', tag: 'A 系列－生存' }, { id: 'a-2', group: 'a', req: 'a-1', tag: 'A 系列－生存' },
  // core-1 沒有 req、只有 reqAny：A1、B1 要先學其中一個（技能樹上的兩條斜線）；Lv2 不直接連過來，免得看起來學完 Lv2 就能學
  { id: 'core-1', group: 'core', req: null, reqAny: ['a-1', 'b-1'], tag: '核心技能' }, { id: 'core-2', group: 'core', req: 'core-1', tag: '核心技能' }, { id: 'core-3', group: 'core', req: 'core-2', tag: '核心技能' },
  { id: 'ult', group: 'ult', req: 'core-3', tag: '終極核心大招' },
  { id: 'b-1', group: 'b', req: 'trait-2', tag: 'B 系列－攻擊' }, { id: 'b-2', group: 'b', req: 'b-1', tag: 'B 系列－攻擊' },
  { id: 'aux-1', group: 'aux', req: 'trait-2', tag: '輔助技能（永久被動）' }, { id: 'aux-2', group: 'aux', req: 'trait-2', tag: '輔助技能（永久被動）' },
];
const SKILL_TOTAL = SKILL_LAYOUT.length;
const SKILL_DEFAULT_COST = { 'trait-1': 0, 'trait-2': 40, 'a-1': 40, 'a-2': 150, 'core-1': 80, 'core-2': 150, 'core-3': 200, 'ult': 250, 'b-1': 40, 'b-2': 150, 'aux-1': 80, 'aux-2': 80 };
const SKILL_GROUP_ICON = { trait: '✦', a: '🛡️', b: '⚔️', core: '✨', ult: '🌟', aux: '◎' };
const skillLayoutOf = id => SKILL_LAYOUT.find(n => n.id === id) || null;
const SKILL_BASE = Object.fromEntries(Object.entries(TYPES).map(([k, s]) => [k, JSON.parse(JSON.stringify(s))]));   // 沒學技能、沒穿裝備時的原始數值
const SKILL_NO_GEAR = {};   // 套完技能、還沒套裝備的數值（隊員頁顯示「裝備加了多少」用）
if (!training.skills) training.skills = {};

// ---- 技能內容：data/squad-skills.js 優先，沒有就用舊版 data/skills.js 換算 ----
function legacySkillNodes(type) {
  const spec = SKILL_BASE[type] || TYPES[type] || {}, tree = typeof SKILL_TREES !== 'undefined' ? SKILL_TREES[type] : null;
  const C = typeof SKILL_COMMON !== 'undefined' ? SKILL_COMMON : { atk: [], def: [] };
  const n = (name, desc, effect, mods) => ({ name, desc, effect: effect || '', mods: JSON.parse(JSON.stringify(mods || [])) });
  const abl = (tree && tree.abl) || [];
  return {
    'trait-1': n('特性', spec.trait || '', '初始技能'),
    'trait-2': abl[0] ? n(abl[0].name, '原本的特性更強。', abl[0].desc, abl[0].mods) : n('特性強化', '原本的特性更強。', '（尚未設計）'),
    'a-1': C.def[0] ? n(C.def[0].name, '鍛鍊體能，撐得更久。', C.def[0].desc, C.def[0].mods) : n('體能訓練', '', ''),
    'a-2': tree && tree.def3 ? n(tree.def3.name, '生存系列的專長。', tree.def3.desc, tree.def3.mods) : n('生存專長', '', '（尚未設計）'),
    'core-1': abl[1] ? n(abl[1].name, '以角色特性為核心的技能。', abl[1].desc, abl[1].mods) : n('核心技能 1', '', '（尚未設計）'),
    'core-2': abl[2] ? n(abl[2].name, '以角色特性為核心的技能。', abl[2].desc, abl[2].mods) : n('核心技能 2', '', '（尚未設計）'),
    'core-3': abl[0] ? n(abl[0].name + '・精通', '以角色特性為核心的技能。（草稿：請在編輯器修改）', abl[0].desc, abl[0].mods) : n('核心技能 3', '', '（尚未設計）'),
    'ult': abl[3] ? n(abl[3].name, '以角色特性為核心的終極大招：用前面的技能強化大招，不是另外一招。', abl[3].desc, abl[3].mods) : n('終極核心大招', '', '（尚未設計）'),
    'b-1': C.atk[0] ? n(C.atk[0].name, '鍛鍊攻擊技巧。', C.atk[0].desc, C.atk[0].mods) : n('鍛鍊', '', ''),
    'b-2': tree && tree.atk3 ? n(tree.atk3.name, '攻擊系列的專長。', tree.atk3.desc, tree.atk3.mods) : n('攻擊專長', '', '（尚未設計）'),
    'aux-1': C.def[1] ? n(C.def[1].name, '永久被動技能。', C.def[1].desc, C.def[1].mods) : n('輔助技能 1', '永久被動技能。', ''),
    'aux-2': C.atk[1] ? n(C.atk[1].name, '永久被動技能。', C.atk[1].desc, C.atk[1].mods) : n('輔助技能 2', '永久被動技能。', ''),
  };
}
// 某位隊員某一格的技能：{ name, desc, effect, icon, cost, mods }
function skillNodeOf(type, id) {
  const lay = skillLayoutOf(id); if (!lay || !TYPES[type]) return null;
  const saved = typeof SQUAD_SKILLS !== 'undefined' && SQUAD_SKILLS.members && SQUAD_SKILLS.members[type] && SQUAD_SKILLS.members[type][id];
  const base = saved || legacySkillNodes(type)[id] || { name: lay.tag, desc: '', effect: '', mods: [] };
  return {
    name: base.name || lay.tag, desc: base.desc || '', effect: base.effect || '', note: base.note || '', icon: base.icon || '', mods: base.mods || [],
    cost: id === 'trait-1' ? 0 : base.cost != null ? Number(base.cost) || 0 : SKILL_DEFAULT_COST[id] || 0,
  };
}
const skillCost = (type, id) => (skillNodeOf(type, id) || {}).cost || 0;
const skillTreeOpen = type => !!TYPES[type];
const hasSkill = (type, id) => id === 'trait-1' || (training.skills[type] || []).includes(id);
function skillStateOf(type, id) {
  if (hasSkill(type, id)) return 'owned';
  const lay = skillLayoutOf(id); if (!lay) return 'locked';
  if (lay.req && !hasSkill(type, lay.req)) return 'locked';   // 前面那一格還沒學
  if (lay.reqAny && !lay.reqAny.some(id => hasSkill(type, id))) return 'locked';   // 斜線的那幾格一個都還沒學
  return 'open';
}
const skillLearnedCount = type => SKILL_LAYOUT.filter(n => hasSkill(type, n.id)).length;

// ---- 舊存檔（舊的 10 格技能樹）：學過的全部退回碎片，改用新的技能樹 ----
(() => {
  const ids = new Set(SKILL_LAYOUT.map(n => n.id)), old = typeof SKILL_NODE_COST !== 'undefined' ? SKILL_NODE_COST : {};
  let refund = 0;
  for (const [type, list] of Object.entries(training.skills || {})) {
    if (!Array.isArray(list) || list.every(id => ids.has(id))) continue;
    refund += list.filter(id => !ids.has(id)).reduce((sum, id) => sum + (old[id] || 0), 0);
    training.skills[type] = list.filter(id => ids.has(id));
  }
  if (refund > 0) {
    training.crystals += refund;
    if (typeof saveTraining === 'function') saveTraining();
    setTimeout(() => { if (typeof systemNotice === 'function') systemNotice('技能樹改版：舊的技能已重置，退回異質碎片 ◆ ' + refund); }, 1500);
  }
})();

// 把學會的技能、穿的隊員裝備套到 TYPES：從原始數值開始，依序乘／加
function applyModList(spec, mods) {
  for (const m of mods || []) {
    if (!m || !m.path) continue;
    const keys = m.path.split('.'), last = keys.pop();
    let obj = spec; for (const k of keys) { if (!obj[k] || typeof obj[k] !== 'object') obj[k] = {}; obj = obj[k]; }
    const cur = Number(obj[last]) || 0;
    obj[last] = m.mul != null ? cur * Number(m.mul) : cur + (Number(m.add) || 0);
  }
}
function finishSpec(spec) {
  spec.hp = Math.round(spec.hp); spec.dmg = Math.round(spec.dmg);
  spec.defense = Math.min(.75, spec.defense || 0); spec.accuracy = Math.min(1, spec.accuracy || 0);
}
function applySkills() {
  for (const [type, base] of Object.entries(SKILL_BASE)) {
    const spec = TYPES[type]; if (!spec) continue;
    for (const k of Object.keys(spec)) if (!(k in base)) delete spec[k];   // 技能、裝備加出來的數值（例如 hpRegen）拿掉了要跟著消失
    for (const [k, v] of Object.entries(JSON.parse(JSON.stringify(base)))) spec[k] = v;
    for (const n of SKILL_LAYOUT) if (hasSkill(type, n.id)) applyModList(spec, (skillNodeOf(type, n.id) || {}).mods);
    const noGear = JSON.parse(JSON.stringify(spec)); finishSpec(noGear); SKILL_NO_GEAR[type] = noGear;
    if (typeof squadGearMods === 'function') applyModList(spec, squadGearMods(type));
    finishSpec(spec);
  }
}
// 學技能：在基地裡、碎片夠、前一格學過
function learnSkill(type, id) {
  if (typeof MAP_SAFE === 'undefined' || !MAP_SAFE) return false;
  if (skillStateOf(type, id) !== 'open') return false;
  const cost = skillCost(type, id);
  if (training.crystals < cost) return false;
  training.crystals -= cost;
  if (typeof addStat === 'function') addStat('crystalsSpent', cost);   // 成就：花掉的異質碎片
  (training.skills[type] = training.skills[type] || []).push(id);
  applySkills(); saveTraining(); refreshLiveSentries(type);
  return true;
}
// 重置技能：退回這位隊員學技能花掉的全部碎片
function resetSkills(type) {
  const list = training.skills[type] || []; if (!list.length) return 0;
  const refund = list.reduce((sum, id) => sum + skillCost(type, id), 0);
  training.crystals += refund; training.skills[type] = [];
  applySkills(); saveTraining(); refreshLiveSentries(type);
  return refund;
}
// 場上的這位隊員：血量上限跟著變（照比例保留目前血量）
function refreshLiveSentries(type) {
  if (typeof G === 'undefined' || !G || !G.towers) return;
  for (const t of G.towers) if (t.type === type) {
    const ratio = t.maxhp > 0 ? t.hp / t.maxhp : 1;
    t.maxhp = TYPES[type].hp; t.hp = Math.max(0, ratio * t.maxhp);
  }
}
applySkills();

// 舊的「技能樹」按鈕（js/team.js）：改成打開 T-Pad 的 Y102隊員 → 技能樹頁
function openSkillTree(type) {
  if (typeof openTPad !== 'function') return;
  if (typeof squadPageState !== 'undefined') { squadPageState.member = type; squadPageState.page = 'skills'; }
  if (!tpadOpen) openTPad();
  if (tpadOpen && typeof launchTPadApp === 'function') launchTPadApp('squad');
}
function closeSkillTree() {}
