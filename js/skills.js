/* ===== 技能樹（資料在 data/skills.js）=====
   學會的技能存在 training.skills（跟異質碎片同一個存檔，js/progression.js）：{ 隊員: [技能 id…] }
   技能 id＝分支-層（例：atk-1、abl-3；abl-4＝終極技能）。學會後把 mods 套到 TYPES（哨兵數值）上。
   版面（SKILL_LAYOUT）：① 起點 → ② 分岔點 → 往右分成攻擊（上）、異能（中，最長，最後是終極技能）、生存（下）。
   畫面：上面是技能圖（點圓形圖示）→ 下面顯示完整說明和「培養」按鈕。技能樹視窗和 T-Pad 的隊員畫面共用 skillTreeHtml。
*/
// col：第幾欄（0＝最左）；row：0 上排、1 中排、2 下排；req：要先學哪一格
const SKILL_LAYOUT = [
  { id: 'atk-1', col: 0, row: 1, req: null, tag: '起點' },
  { id: 'def-1', col: 1, row: 1, req: 'atk-1', tag: '分岔點' },
  { id: 'atk-2', col: 2, row: 0, req: 'def-1' }, { id: 'atk-3', col: 3, row: 0, req: 'atk-2' },
  { id: 'abl-1', col: 2, row: 1, req: 'def-1' }, { id: 'abl-2', col: 3, row: 1, req: 'abl-1' }, { id: 'abl-3', col: 4, row: 1, req: 'abl-2' }, { id: 'abl-4', col: 5, row: 1, req: 'abl-3', tag: '終極技能' },
  { id: 'def-2', col: 2, row: 2, req: 'def-1' }, { id: 'def-3', col: 3, row: 2, req: 'def-2' },
];
const SKILL_TOTAL = SKILL_LAYOUT.length;
const skillLayoutOf = id => SKILL_LAYOUT.find(n => n.id === id) || null;
const skillCost = id => (typeof SKILL_NODE_COST !== 'undefined' && SKILL_NODE_COST[id]) || SKILL_COST[Number(String(id).split('-')[1]) - 1] || 0;
const SKILL_BASE = Object.fromEntries(Object.entries(TYPES).map(([k, s]) => [k, JSON.parse(JSON.stringify(s))]));   // 沒學技能時的原始數值
if (!training.skills) training.skills = {};

// 某位隊員某個技能的資料（tier：1～3；異能有第 4 格＝終極技能）
function skillNode(type, branch, tier) {
  const tree = SKILL_TREES[type]; if (!tree) return null;
  if (branch === 'abl') return tree.abl[tier - 1] || null;
  if (tier > 3) return null;
  if (tier <= 2) return SKILL_COMMON[branch][tier - 1];
  return branch === 'atk' ? tree.atk3 : tree.def3;
}
const skillId = (branch, tier) => branch + '-' + tier;
const hasSkill = (type, id) => (training.skills[type] || []).includes(id);
function skillState(type, branch, tier) {
  const id = skillId(branch, tier), lay = skillLayoutOf(id);
  if (hasSkill(type, id)) return 'owned';
  if (!lay || !skillNode(type, branch, tier)) return 'locked';
  if (lay.req && !hasSkill(type, lay.req)) return 'locked';   // 前面那一格還沒學
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
  const cost = skillCost(skillId(branch, tier));
  if (training.crystals < cost) return false;
  training.crystals -= cost;
  (training.skills[type] = training.skills[type] || []).push(skillId(branch, tier));
  applySkills(); saveTraining(); refreshLiveSentries(type);
  return true;
}
// 重置技能：退回這位隊員學技能花掉的全部碎片
function resetSkills(type) {
  const list = training.skills[type] || []; if (!list.length) return 0;
  const refund = list.reduce((sum, id) => sum + skillCost(id), 0);
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

// ---- 共用畫面：上面技能圖、下面說明＋培養按鈕（技能樹視窗、T-Pad 的隊員畫面都用這個）----
// 點圓形圖示（data-skill-pick）＝選這一格看說明；按「培養」（data-skill-learn）＝學這一格
const skillSelected = {};   // 每位隊員目前選的那一格
const SKILL_ICONS = { atk: '⚔️', def: '🛡️', abl: '✨' };
function skillPickOf(type) {
  const cur = skillSelected[type]; if (cur && skillLayoutOf(cur)) return cur;
  const open = SKILL_LAYOUT.find(n => skillStateOf(type, n.id) === 'open');
  return open ? open.id : SKILL_LAYOUT[0].id;
}
const skillStateOf = (type, id) => { const [b, t] = id.split('-'); return skillState(type, b, Number(t)); };
const skillNodeOf = (type, id) => { const [b, t] = id.split('-'); return skillNode(type, b, Number(t)); };
function skillBranchName(type, id) { const b = id.split('-')[0], br = SKILL_BRANCHES.find(x => x.id === b); return b === 'abl' ? (TYPES[type].ability || '異能') : (br ? br.name : b); }
// opts.coin：碎片圖示的 HTML（T-Pad 用圖片；沒給就用 ◆）
function skillTreeHtml(type, opts = {}) {
  const spec = TYPES[type], safe = typeof MAP_SAFE !== 'undefined' && MAP_SAFE, coin = opts.coin || '◆', sel = skillPickOf(type);
  const X = col => 7 + col * 17.2, Y = row => [19, 50, 81][row];   // 位置（百分比）
  const lines = SKILL_LAYOUT.filter(n => n.req).map(n => {
    const a = skillLayoutOf(n.req), x1 = X(a.col), y1 = Y(a.row), x2 = X(n.col), y2 = Y(n.row);
    const d = y1 === y2 ? 'M' + x1 + ' ' + y1 + ' H' + x2 : 'M' + x1 + ' ' + y1 + ' V' + y2 + ' H' + x2;   // 分岔：先從分岔點往上／下，再往右
    return '<path d="' + d + '" class="' + (hasSkill(type, n.id) ? 'on' : skillStateOf(type, n.id) === 'open' ? 'next' : '') + '"/>';
  }).join('');
  const orbs = SKILL_LAYOUT.map(n => {
    const node = skillNodeOf(type, n.id); if (!node) return '';
    const st = skillStateOf(type, n.id), b = n.id.split('-')[0], ult = n.id === 'abl-4';
    const icon = st === 'locked' ? '🔒' : ult ? '🌟' : SKILL_ICONS[b];
    return '<button type="button" class="skill-orb ' + st + (ult ? ' ult' : '') + (n.id === sel ? ' sel' : '') + '" data-skill-pick="' + n.id + '" style="left:' + X(n.col) + '%;top:' + Y(n.row) + '%" title="' + node.name + '">' +
      '<i>' + icon + '</i><span class="skill-orb-name">' + node.name + '</span></button>';
  }).join('');
  const rows = '<span class="skill-row-label" style="left:' + X(4) + '%;top:' + Y(0) + '%">⚔️ 攻擊</span>' +
    '<span class="skill-row-label" style="left:' + (X(4) - 4) + '%;top:' + (Y(1) - 17) + '%">✨ ' + (spec.ability || '異能') + '</span>' +
    '<span class="skill-row-label" style="left:' + X(4) + '%;top:' + Y(2) + '%">🛡️ 生存</span>';
  // 下面的說明
  const lay = skillLayoutOf(sel), node = skillNodeOf(type, sel), st = skillStateOf(type, sel), cost = skillCost(sel), afford = training.crystals >= cost;
  const where = lay.tag ? lay.tag + '・' + skillBranchName(type, sel) : skillBranchName(type, sel) + '・第 ' + (SKILL_LAYOUT.filter(n => n.row === lay.row && n.col >= 2 && n.col <= lay.col).length) + ' 格';
  const btnLabel = st === 'owned' ? '已學會' : st === 'locked' ? '先學前一格' : !safe ? '回基地才能培養' : afford ? '培養' : '碎片不足';
  const can = st === 'open' && safe && afford;
  const detail = '<div class="skill-detail"><div class="skill-detail-main"><small>' + where + '</small><b>' + node.name + '</b><p>' + node.desc + '</p></div>' +
    '<div class="skill-detail-side"><div class="skill-detail-cost">' + (st === 'owned' ? '已學會' : '需要 ' + coin + ' ' + cost) + '</div>' +
    '<button type="button" class="skill-learn" data-skill-learn="' + sel + '"' + (can ? '' : ' disabled') + '>' + btnLabel + '</button></div></div>';
  return '<div class="skill-board"><svg class="skill-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">' + lines + '</svg>' + rows + orbs + '</div>' + detail;
}
// 共用的點擊：回傳 'pick'（換了選擇）、'learn'（學會了）、'fail'（不能學）或 null（不是技能樹的按鈕）
function handleSkillTreeClick(type, target) {
  const pick = target.closest('[data-skill-pick]');
  if (pick) { skillSelected[type] = pick.dataset.skillPick; if (typeof sfx === 'function') sfx('switch'); return 'pick'; }
  const learn = target.closest('[data-skill-learn]');
  if (learn) {
    const [b, t] = learn.dataset.skillLearn.split('-');
    if (learnSkill(type, b, Number(t))) { if (typeof sfx === 'function') sfx('achievement'); return 'learn'; }
    if (typeof sfx === 'function') sfx('error'); return 'fail';
  }
  return null;
}

// ---- 技能樹視窗 ----
let skillPanel = null, skillPanelType = null;
function openSkillTree(type) {
  if (!SKILL_TREES[type]) return;
  skillPanelType = type;
  if (!skillPanel) {
    skillPanel = document.createElement('div'); skillPanel.id = 'skillTreePanel'; skillPanel.className = 'hidden';
    skillPanel.addEventListener('click', e => {
      if (e.target === skillPanel || e.target.closest('.skill-close')) { closeSkillTree(); return; }
      const r = handleSkillTreeClick(skillPanelType, e.target);
      if (r) { renderSkillTree(); if (r === 'learn' && typeof renderSquadPanel === 'function') renderSquadPanel(); return; }
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
  const owned = (training.skills[type] || []).length;
  skillPanel.innerHTML = '<section class="skill-card" role="dialog" aria-modal="true" aria-label="' + spec.name + ' 的技能樹">' +
    '<header><img src="' + (typeof memberPortraitPath === 'function' ? memberPortraitPath(spec) : '') + '" alt=""><div><small>SKILL TREE</small><h3>' + spec.name + ' 的技能樹</h3>' +
    '<p>' + (spec.guide ? '嚮導' : '哨兵') + '・' + spec.role + '・已學 ' + owned + ' / ' + SKILL_TOTAL + '</p></div>' +
    '<span class="crystal-wallet"><i>◆</i><small>異質碎片</small><b>' + training.crystals + '</b></span>' +
    '<button type="button" class="skill-close" aria-label="關閉">×</button></header>' +
    skillTreeHtml(type) +
    '<footer><span>點技能圖示看完整說明；每一格要先學前面那一格。</span>' +
    (owned ? '<button type="button" class="skill-reset">重置技能（退回全部碎片）</button>' : '') + '</footer></section>';
}
window.addEventListener('keydown', e => {
  if (e.key === 'Escape' && skillPanel && !skillPanel.classList.contains('hidden')) { e.preventDefault(); e.stopImmediatePropagation(); closeSkillTree(); }
}, true);
