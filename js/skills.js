/* ===== 技能樹（資料在 data/skills.js）=====
   學會的技能存在 training.skills（跟異質碎片同一個存檔，js/progression.js）：{ 隊員: [技能 id…] }
   技能 id＝分支-層（例：atk-1、abl-3）。學會後把 mods 套到 TYPES（哨兵數值）上。
*/
const SKILL_BASE = Object.fromEntries(Object.entries(TYPES).map(([k, s]) => [k, JSON.parse(JSON.stringify(s))]));   // 沒學技能時的原始數值
if (!training.skills) training.skills = {};

// 某位隊員某個技能的資料（tier：1～3）
function skillNode(type, branch, tier) {
  const tree = SKILL_TREES[type]; if (!tree) return null;
  if (branch === 'abl') return tree.abl[tier - 1] || null;
  if (tier <= 2) return SKILL_COMMON[branch][tier - 1];
  return branch === 'atk' ? tree.atk3 : tree.def3;
}
const skillId = (branch, tier) => branch + '-' + tier;
const hasSkill = (type, id) => (training.skills[type] || []).includes(id);
function skillState(type, branch, tier) {
  const id = skillId(branch, tier);
  if (hasSkill(type, id)) return 'owned';
  if (tier > 1 && !hasSkill(type, skillId(branch, tier - 1))) return 'locked';   // 上一層還沒學
  return 'open';
}
// 把學會的技能套到 TYPES：從原始數值開始，依序乘／加
function applySkills() {
  for (const [type, base] of Object.entries(SKILL_BASE)) {
    const spec = TYPES[type]; if (!spec) continue;
    for (const [k, v] of Object.entries(JSON.parse(JSON.stringify(base)))) spec[k] = v;
    for (const id of training.skills[type] || []) {
      const [branch, tier] = id.split('-'), node = skillNode(type, branch, Number(tier));
      for (const m of (node && node.mods) || []) {
        const keys = m.path.split('.'), last = keys.pop();
        let obj = spec; for (const k of keys) { if (!obj[k]) obj[k] = {}; obj = obj[k]; }
        const cur = Number(obj[last]) || 0;
        obj[last] = m.mul != null ? cur * m.mul : cur + (m.add || 0);
      }
    }
    spec.hp = Math.round(spec.hp); spec.dmg = Math.round(spec.dmg);
    spec.defense = Math.min(.75, spec.defense || 0); spec.accuracy = Math.min(1, spec.accuracy || 0);
  }
}
// 學技能：在基地裡、碎片夠、上一層學過
function learnSkill(type, branch, tier) {
  if (typeof MAP_SAFE === 'undefined' || !MAP_SAFE) return false;
  if (skillState(type, branch, tier) !== 'open') return false;
  const cost = SKILL_COST[tier - 1];
  if (training.crystals < cost) return false;
  training.crystals -= cost;
  (training.skills[type] = training.skills[type] || []).push(skillId(branch, tier));
  applySkills(); saveTraining(); refreshLiveSentries(type);
  return true;
}
// 重置技能：退回這位隊員學技能花掉的全部碎片
function resetSkills(type) {
  const list = training.skills[type] || []; if (!list.length) return 0;
  const refund = list.reduce((sum, id) => sum + SKILL_COST[Number(id.split('-')[1]) - 1], 0);
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

// ---- 技能樹視窗 ----
let skillPanel = null, skillPanelType = null;
function openSkillTree(type) {
  if (!SKILL_TREES[type]) return;
  skillPanelType = type;
  if (!skillPanel) {
    skillPanel = document.createElement('div'); skillPanel.id = 'skillTreePanel'; skillPanel.className = 'hidden';
    skillPanel.addEventListener('click', e => {
      if (e.target === skillPanel || e.target.closest('.skill-close')) { closeSkillTree(); return; }
      const node = e.target.closest('[data-skill]');
      if (node) {
        const [branch, tier] = node.dataset.skill.split('-');
        if (learnSkill(skillPanelType, branch, Number(tier))) { if (typeof sfx === 'function') sfx('achievement'); }
        else if (typeof sfx === 'function') sfx('error');
        renderSkillTree(); if (typeof renderSquadPanel === 'function') renderSquadPanel();
        return;
      }
      if (e.target.closest('.skill-reset')) {
        const n = (training.skills[skillPanelType] || []).length; if (!n) return;
        if (!confirm('重置 ' + TYPES[skillPanelType].name + ' 的技能？學技能花掉的碎片會全部退回。')) return;
        const refund = resetSkills(skillPanelType);
        if (typeof sfx === 'function') sfx('switch');
        if (typeof systemNotice === 'function') systemNotice('已重置技能，退回 ◆ ' + refund);
        renderSkillTree(); if (typeof renderSquadPanel === 'function') renderSquadPanel();
      }
    });
    (document.getElementById('wrap') || document.body).appendChild(skillPanel);
  }
  renderSkillTree(); skillPanel.classList.remove('hidden');
  if (typeof sfx === 'function') sfx('menu');
}
function closeSkillTree() { if (skillPanel) skillPanel.classList.add('hidden'); }
function renderSkillTree() {
  const type = skillPanelType, spec = TYPES[type]; if (!skillPanel || !spec) return;
  const safe = typeof MAP_SAFE !== 'undefined' && MAP_SAFE;
  const owned = (training.skills[type] || []).length;
  const col = br => {
    const nodes = [1, 2, 3].map(tier => {
      const node = skillNode(type, br.id, tier), state = skillState(type, br.id, tier), cost = SKILL_COST[tier - 1];
      const afford = training.crystals >= cost;
      const label = state === 'owned' ? '已學會' : state === 'locked' ? '先學上一層' : !safe ? '回基地才能學' : afford ? '學習 ◆ ' + cost : '碎片不足 ◆ ' + cost;
      const disabled = state !== 'open' || !safe || !afford;
      return '<button type="button" class="skill-node ' + state + (state === 'open' && afford && safe ? ' can' : '') + '" data-skill="' + br.id + '-' + tier + '"' + (disabled ? ' disabled' : '') + '>' +
        '<small>第 ' + tier + ' 層</small><b>' + node.name + '</b><span>' + node.desc + '</span><em>' + label + '</em></button>' +
        (tier < 3 ? '<i class="skill-link' + (state === 'owned' ? ' on' : '') + '"></i>' : '');
    }).join('');
    return '<div class="skill-branch"><h4>' + br.icon + ' ' + (br.id === 'abl' ? spec.ability : br.name) + '</h4>' + nodes + '</div>';
  };
  skillPanel.innerHTML = '<section class="skill-card" role="dialog" aria-modal="true" aria-label="' + spec.name + ' 的技能樹">' +
    '<header><img src="' + (typeof memberPortraitPath === 'function' ? memberPortraitPath(spec) : '') + '" alt=""><div><small>SKILL TREE</small><h3>' + spec.name + ' 的技能樹</h3>' +
    '<p>' + (spec.guide ? '嚮導' : '哨兵') + '・' + spec.role + '・已學 ' + owned + ' / 9</p></div>' +
    '<span class="crystal-wallet"><i>◆</i><small>異質碎片</small><b>' + training.crystals + '</b></span>' +
    '<button type="button" class="skill-close" aria-label="關閉">×</button></header>' +
    '<div class="skill-branches">' + SKILL_BRANCHES.map(col).join('') + '</div>' +
    '<footer><span>攻擊、生存、異能三條分支，每條要從第 1 層開始學。</span>' +
    (owned ? '<button type="button" class="skill-reset">重置技能（退回全部碎片）</button>' : '') + '</footer></section>';
}
window.addEventListener('keydown', e => {
  if (e.key === 'Escape' && skillPanel && !skillPanel.classList.contains('hidden')) { e.preventDefault(); e.stopImmediatePropagation(); closeSkillTree(); }
}, true);
