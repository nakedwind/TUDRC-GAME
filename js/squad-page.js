/* ===== T-Pad「Y102隊員」頁：技能樹頁／隊員裝備頁（右上的切換鈕換頁）=====
   ・左：隊員頭像列（◀＝目前選的人）　中：角色資料（立繪、名字、定位、簡介、HP／SP 或負荷、6 個數值）
   ・技能樹頁：右上＝技能樹（js/skills.js）、右下＝點到的技能的說明＋培養（還沒解鎖的顯示鎖頭和條件）
   ・裝備頁：右上＝隊員裝備 3 格＋外觀預覽＋外觀裝備 5 格（服裝系統 js/costumes.js）、右下＝裝備說明、數值、可用裝備、穿上／卸下
   ・畫面是固定 888×520 的畫布，依 T-Pad 螢幕大小等比例縮放（所以編輯器調的像素在每種螢幕上都一樣）
   ・每個可以調整的東西身上有 data-sq="名字"；版面設定在 data/squad-layout.js（「Y102隊員裝備／技能編輯器」存的），套用方式跟背包編輯器一樣
   ・?squadedit=1：編輯器裡的預覽（最下面），用 postMessage 跟編輯器溝通
*/
const SQ_W = 888, SQ_H = 520;
const squadPageState = { member: null, page: 'skills', skill: {}, slot: { kind: 'gear', id: 0 }, avail: null };
const SQ_STATS = [
  { id: 'atk', name: '攻擊', icon: 'atk', val: s => s.noAttack ? '—' : String(s.dmg), num: s => s.dmg },
  { id: 'def', name: '防禦', icon: 'def', val: s => Math.round((s.defense || 0) * 100) + '%', num: s => Math.round((s.defense || 0) * 100) },
  { id: 'range', name: '射程', icon: 'range', val: s => (s.range || 0).toFixed(1) + ' 格', num: s => Math.round((s.range || 0) * 10) / 10 },
  { id: 'rate', name: '攻速', icon: 'rate', val: s => (s.rate || 0).toFixed(1) + '/秒', num: s => Math.round((s.rate || 0) * 10) / 10 },
  { id: 'acc', name: '命中', icon: 'acc', val: s => Math.round((s.accuracy || 0) * 100) + '%', num: s => Math.round((s.accuracy || 0) * 100) },
  { id: 'move', name: '移動速度', icon: 'move', val: s => String(Math.round(s.walkSpeed || 0)), num: s => Math.round(s.walkSpeed || 0) },
];
const SQ_MOVE_ICON = '<svg class="stat-ico move" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M13.5 3.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM9.8 8.6l3.6-.4 2.2 3.2 3 1-.6 1.9-3.7-1.2-1-1.4-1 3.6 2.6 2.4V22h-2v-4.3l-2.7-2.3-1 3.8-4.3 2.6-1-1.7 3.6-2.2 1.6-6.1-1.6.7-.9 3H5.4l1.3-4.4Z"/></svg>';
const SQ_CRYSTAL = 'images/碎片鑰匙/anomalous-shard-ground-glow.png';
const sqEsc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
// 可以在編輯器改字的介面文字：sqT(名字, 原本的字)
const SQ_TEXT_DEFAULT = {};
function sqT(key, def) { SQ_TEXT_DEFAULT[key] = def; const t = typeof SQUAD_LAYOUT !== 'undefined' && SQUAD_LAYOUT.texts && SQUAD_LAYOUT.texts[key]; return sqEsc(t || def); }
const sqIsImgSrc = v => /[./]/.test(String(v || '')) && !/^\p{Extended_Pictographic}/u.test(String(v || ''));
const sqIcon = (icon, key) => sqIsImgSrc(icon) ? '<img data-sq="' + key + '" src="' + sqEsc(icon) + '" alt="">' : '<span class="sq-emoji" data-sq="' + key + '">' + sqEsc(icon) + '</span>';
const sqSpriteOf = spec => typeof memberPortraitPath === 'function' ? memberPortraitPath(spec) : '';

// ---- 編輯器清單用：每個名字是什麼、屬於哪一組、是不是圖片 ----
const SQ_PARTS = {
  'panel.roster': ['面板區域', '左側隊員列'], 'panel.profile': ['面板區域', '角色資料'], 'panel.tree': ['面板區域', '技能樹（技能樹頁）'],
  'panel.skillInfo': ['面板區域', '技能說明（技能樹頁）'], 'panel.gear': ['面板區域', '裝備欄（裝備頁）'], 'panel.gearInfo': ['面板區域', '裝備說明（裝備頁）'], 'panel.avail': ['面板區域', '可用裝備格子區（裝備頁）'],
  'img.arrow': ['角色資料', '◀ 目前選的隊員'], 'btn.more': ['角色資料', '「深入了解」'], 'box.portrait': ['角色資料', '立繪的框'], 'img.portrait': ['角色資料', '角色立繪'],
  'box.job': ['角色資料', '嚮導／哨兵圖示的框'], 'img.job': ['角色資料', '嚮導／哨兵圖示'], 'text.name': ['角色資料', '角色名'], 'text.status': ['角色資料', '「已編入」「待命」'],
  'text.role': ['角色資料', '角色定位'], 'text.ability': ['角色資料', '異能力／疏導能力'], 'text.intro': ['角色資料', '角色簡介'], 'box.bars': ['角色資料', 'HP／負荷 區塊'],
  'text.hpLabel': ['角色資料', '「HP」'], 'text.hpValue': ['角色資料', 'HP 數字'], 'bar.hp': ['角色資料', 'HP 條'], 'text.spLabel': ['角色資料', '「SP」（嚮導）'], 'text.taintLabel': ['角色資料', '「負荷」（哨兵）'],
  'text.loadValue': ['角色資料', 'SP／負荷 數字'], 'bar.load': ['角色資料', 'SP／負荷 條'], 'box.stats': ['角色資料', '數值區'],
  'text.progress': ['技能樹頁', '已學幾格'], 'text.crystals': ['技能樹頁', '持有的異質碎片'], 'img.crystalsIcon': ['技能樹頁', '異質碎片圖示（持有）'],
  'text.labelA': ['技能樹頁', '「A系列－生存」標題'], 'text.labelB': ['技能樹頁', '「B系列－攻擊」標題'], 'text.switchLabel': ['技能樹頁', '「切換技能樹／裝備」'],
  'btn.switch': ['技能樹頁', '切換按鈕'], 'img.switch': ['技能樹頁', '切換按鈕的圖'], 'btn.reset': ['技能樹頁', '「重置技能」'], 'svg.lines': ['技能樹頁', '技能之間的連線（整組）'],
  'box.skillIcon': ['技能說明', '技能圖示的框'], 'img.skillIcon': ['技能說明', '技能圖示'], 'text.skillName': ['技能說明', '技能名稱'], 'text.skillTag': ['技能說明', '技能分類（Lv1、A 系列…）'],
  'text.skillDesc': ['技能說明', '技能描述'], 'text.skillEffect': ['技能說明', '技能效果（數值）'], 'box.learn': ['技能說明', '培養區塊'], 'text.costLabel': ['技能說明', '「需要」'],
  'img.costIcon': ['技能說明', '異質碎片圖示（價格）'], 'text.cost': ['技能說明', '價格數字'], 'btn.learn': ['技能說明', '「培養」按鈕'],
  'box.locked': ['技能說明', '還沒解鎖：整塊'], 'box.lockIcon': ['技能說明', '還沒解鎖：鎖頭的框'], 'img.lockIcon': ['技能說明', '還沒解鎖：鎖頭'], 'text.lockHint': ['技能說明', '還沒解鎖：條件提示'], 'text.lockDesc': ['技能說明', '還沒解鎖：技能說明'],
  'text.gearTitle': ['裝備頁', '「隊員裝備」'], 'box.preview': ['裝備頁', '角色外觀預覽的框'], 'img.preview': ['裝備頁', '角色外觀預覽'], 'text.lookTitle': ['裝備頁', '「外觀裝備」'],
  'text.switchLabelG': ['裝備頁', '「切換技能樹／裝備」'], 'btn.switchG': ['裝備頁', '切換按鈕'], 'img.switchG': ['裝備頁', '切換按鈕的圖'],
  'text.descTitle': ['裝備說明', '「裝備說明」'], 'text.descHint': ['裝備說明', '「（點選上方裝備 ICON）」'], 'box.desc': ['裝備說明', '裝備說明的框'], 'text.desc': ['裝備說明', '裝備說明文字'],
  'text.statTitle': ['裝備說明', '「裝備數值」'], 'box.stat': ['裝備說明', '裝備數值的框'], 'text.stat': ['裝備說明', '裝備數值文字'], 'text.availTitle': ['裝備說明', '「可用裝備」'],
  'btn.unequip': ['裝備說明', '「卸下裝備」'], 'btn.equip': ['裝備說明', '「穿上裝備」'],
};
const SQ_LOOK_SLOTS = () => typeof COSTUME_SLOTS !== 'undefined' ? COSTUME_SLOTS : [{ id: 'skin', name: '服裝' }];
function squadPart(key) {
  key = String(key || '');
  const kind = /^img\.|Img:|Icon:|^img:/.test(key) ? 'img' : '';
  if (SQ_PARTS[key]) return { key, group: SQ_PARTS[key][0], label: SQ_PARTS[key][1], kind, text: key in SQ_TEXT_DEFAULT };
  const [p, ...rest] = key.split(':'), id = rest.join(':'), nm = t => (TYPES[t] || (typeof CHARACTERS !== 'undefined' && CHARACTERS[t]) || {}).name || t;
  const lay = typeof skillLayoutOf === 'function' ? skillLayoutOf(id) : null, st = SQ_STATS.find(s => s.id === id), look = SQ_LOOK_SLOTS().find(s => s.id === id);
  const gearName = x => { const g = typeof squadGearById === 'function' && squadGearById(x); return g ? g.name : x; };
  const L = {
    roster: ['隊員列', '隊員格：' + nm(id)], rosterImg: ['隊員列', '隊員頭像：' + nm(id)],
    node: ['技能格', '技能格：' + (lay ? lay.tag + '（' + id + '）' : id)], nodeIcon: ['技能格', '技能圖示：' + (lay ? lay.tag + '（' + id + '）' : id)],
    stat: ['數值格', '數值格：' + (st ? st.name : id)], statIcon: ['數值格', '數值圖示：' + (st ? st.name : id)], statLabel: ['數值格', '數值名稱：' + (st ? st.name : id)], statValue: ['數值格', '數值數字：' + (st ? st.name : id)],
    gearSlot: ['裝備格', '隊員裝備第 ' + (Number(id) + 1) + ' 格（框）'], gearSlotImg: ['裝備格', '隊員裝備第 ' + (Number(id) + 1) + ' 格（圖）'], gearSlotName: ['裝備格', '隊員裝備第 ' + (Number(id) + 1) + ' 格（名稱）'],
    lookSlot: ['外觀裝備格', '外觀：' + (look ? look.name : id) + '（框）'], lookSlotImg: ['外觀裝備格', '外觀：' + (look ? look.name : id) + '（圖）'], lookSlotName: ['外觀裝備格', '外觀：' + (look ? look.name : id) + '（名稱）'],
    avail: ['可用裝備（每件各自）', '可用裝備格：' + gearName(id)], availImg: ['可用裝備（每件各自）', '可用裝備圖：' + gearName(id)],
  }[p];
  return L ? { key, group: L[0], label: L[1], kind, text: key in SQ_TEXT_DEFAULT } : null;
}

// ---- 畫面 ----
function squadMemberList() {
  const prio = ['red', 'avaren', 'theonie', 'amber'];
  return (typeof squadMembers === 'function' ? squadMembers() : []).sort((a, b) => {
    const ar = prio.indexOf(a.type), br = prio.indexOf(b.type);
    return (ar < 0 ? prio.length : ar) - (br < 0 ? prio.length : br);
  });
}
function renderSquadPage(body) {
  if (!body) return;
  const st = squadPageState, safe = typeof MAP_SAFE !== 'undefined' && MAP_SAFE, members = squadMemberList();
  if (!members.some(m => m.type === st.member)) st.member = members[0] ? members[0].type : null;
  const actor = members.find(m => m.type === st.member) || null;
  body.classList.add('tpad-squad-app', 'sq-app');
  const roster = '<aside class="sq-roster" data-sq="panel.roster"><div class="sq-roster-list">' + members.map(m => {
    const spec = TYPES[m.type] || m.profile || {}, on = m.type === st.member;
    return '<button type="button" class="sq-member' + (on ? ' on' : '') + '" data-squad-member="' + m.type + '" data-sq="roster:' + m.type + '" title="' + sqEsc(spec.name || m.type) + '">' +
      '<img data-sq="rosterImg:' + m.type + '" src="' + sqSpriteOf(spec) + '" alt=""></button>';
  }).join('') + '</div></aside><span class="sq-arrow" data-sq="img.arrow">◀</span>';
  let html = roster;
  if (!actor) html += '<section class="sq-profile" data-sq="panel.profile"><p class="sq-empty">本次任務沒有攜帶隊員。</p></section>';
  else {
    html += squadProfileHtml(actor, safe);
    if (actor.noncombat || !TYPES[actor.type]) html += '<section class="sq-main" data-sq="panel.tree"><p class="sq-empty">支援人員沒有技能樹，也沒有隊員裝備。</p></section>';
    else if (st.page === 'gear') html += squadGearHtml(actor, safe);
    else html += squadSkillHtml(actor, safe);
  }
  const keep = body.querySelector('.sq-roster-list')?.scrollTop || 0;
  body.innerHTML = '<div class="sq-fit"><div class="sq-canvas" data-page="' + st.page + '">' + html + '<div class="sq-tip" hidden></div></div></div>';
  const list = body.querySelector('.sq-roster-list'); if (list) list.scrollTop = keep;
  fitSquadCanvas(body); afterSquadRender(body);
}
function squadProfileHtml(actor, safe) {
  const spec = TYPES[actor.type] || actor.profile || {}, ch = (typeof CHARACTERS !== 'undefined' && CHARACTERS[actor.type]) || {};
  const cond = typeof memberCondition === 'function' ? memberCondition(actor, safe) : { text: '', cls: '' };
  let h = '<section class="sq-profile" data-sq="panel.profile">' +
    (!actor.noncombat ? '<button type="button" class="sq-more" data-impression="' + actor.type + '" data-sq="btn.more">' + sqT('btn.more', '深入了解') + '</button>' : '') +
    '<div class="sq-portrait" data-sq="box.portrait"><img data-sq="img.portrait" src="' + sqSpriteOf(spec) + '" alt=""></div>' +
    (!actor.noncombat && typeof ROLE_ICON !== 'undefined' ? '<span class="sq-job" data-sq="box.job"><img data-sq="img.job" src="' + (spec.guide ? ROLE_ICON.guide : ROLE_ICON.sentinel) + '" alt="' + (spec.guide ? '嚮導' : '哨兵') + '"></span>' : '') +
    '<div class="sq-name-row"><b class="sq-name" data-sq="text.name">' + sqEsc(spec.name || actor.type) + '</b><em class="sq-status ' + cond.cls + '" data-sq="text.status">' + sqEsc(cond.text) + '</em></div>';
  if (actor.noncombat) return h + '<p class="sq-intro" data-sq="text.intro">' + sqEsc(ch.intro || (actor.profile && actor.profile.intro) || '') + '</p></section>';
  const live = actor.live, hp = live ? Math.max(0, Math.round(live.hp)) : spec.hp, maxhp = live ? live.maxhp : spec.hp;
  const guide = !!spec.guide, sp = guide && typeof guideSPFor === 'function' ? Math.floor(guideSPFor(actor.type)) : 0, spMax = guide && typeof guideSPMax === 'function' ? guideSPMax() : 100;
  const taint = live ? Math.max(0, Math.min(100, Math.round(live.taint || 0))) : 0;
  const load = guide ? { label: sqT('text.spLabel', 'SP'), key: 'text.spLabel', v: sp, max: spMax } : { label: sqT('text.taintLabel', '負荷'), key: 'text.taintLabel', v: taint, max: 100 };
  const noGear = (typeof SKILL_NO_GEAR !== 'undefined' && SKILL_NO_GEAR[actor.type]) || spec;
  h += '<div class="sq-tags"><span class="sq-tag" data-sq="text.role">' + sqEsc(spec.role || '') + '</span><span class="sq-tag" data-sq="text.ability">' + (guide ? '疏導能力' : '異能力') + '：' + sqEsc(spec.ability || '—') + '</span></div>' +
    '<p class="sq-intro" data-sq="text.intro">' + sqEsc(ch.intro || '') + '</p>' +
    '<div class="sq-bars" data-sq="box.bars">' +
      '<div class="sq-bar hp"><span data-sq="text.hpLabel">' + sqT('text.hpLabel', 'HP') + '</span><b data-sq="text.hpValue">' + hp + ' / ' + maxhp + '</b><i data-sq="bar.hp"><u style="width:' + Math.max(0, Math.min(100, hp / Math.max(1, maxhp) * 100)) + '%"></u></i></div>' +
      '<div class="sq-bar ' + (guide ? 'sp' : 'taint') + '"><span data-sq="' + load.key + '">' + load.label + '</span><b data-sq="text.loadValue">' + load.v + ' / ' + load.max + '</b><i data-sq="bar.load"><u style="width:' + Math.max(0, Math.min(100, load.v / Math.max(1, load.max) * 100)) + '%"></u></i></div>' +
    '</div><dl class="sq-stats" data-sq="box.stats">' + SQ_STATS.map(s => {
      const d = Math.round((s.num(spec) - s.num(noGear)) * 10) / 10;   // 裝備加了多少
      const icon = s.icon === 'move' ? SQ_MOVE_ICON : (typeof STAT_ICON !== 'undefined' && STAT_ICON[s.icon]) || '';
      return '<div class="sq-stat" data-sq="stat:' + s.id + '"><span class="sq-stat-icon" data-sq="statIcon:' + s.id + '">' + icon + '</span><dt data-sq="statLabel:' + s.id + '">' + sqT('statLabel:' + s.id, s.name) + '</dt>' +
        '<dd data-sq="statValue:' + s.id + '">' + s.val(spec) + (d && !spec.noAttack ? '<small class="sq-plus' + (d < 0 ? ' minus' : '') + '">' + (d > 0 ? '+' : '') + d + '</small>' : '') + '</dd></div>';
    }).join('') + '</dl>';
  return h + '</section>';
}
function squadSwitchHtml(suffix) {
  return '<span class="sq-switch-label" data-sq="text.switchLabel' + suffix + '">' + sqT('text.switchLabel' + suffix, '切換技能樹／裝備') + '</span>' +
    '<button type="button" class="sq-switch" data-sq-switch data-sq="btn.switch' + suffix + '" title="切換技能樹／裝備"><img data-sq="img.switch' + suffix + '" src="images/ui/squad-switch.svg" alt=""></button>';
}
function squadSkillHtml(actor, safe) {
  const type = actor.type, st = squadPageState;
  let sel = st.skill[type]; if (!skillLayoutOf(sel)) sel = (SKILL_LAYOUT.find(n => skillStateOf(type, n.id) === 'open') || SKILL_LAYOUT[0]).id;
  st.skill[type] = sel;
  const nodes = SKILL_LAYOUT.map(n => {
    const node = skillNodeOf(type, n.id), state = skillStateOf(type, n.id), icon = node.icon || SKILL_GROUP_ICON[n.group];
    return '<button type="button" class="sq-node g-' + n.group + ' ' + state + (n.id === sel ? ' sel' : '') + '" data-skill-pick="' + n.id + '" data-sq="node:' + n.id + '" data-tip="' + sqEsc(node.name) + '" data-tip-desc="' + sqEsc(node.desc || node.effect) + '">' +
      sqIcon(icon, 'nodeIcon:' + n.id) + (state === 'locked' ? '<i class="sq-node-lock">🔒</i>' : '') + '</button>';
  }).join('');
  const learned = skillLearnedCount(type);
  let h = '<section class="sq-main sq-tree" data-sq="panel.tree"><svg class="sq-lines" data-sq="svg.lines" aria-hidden="true"></svg>' +
    '<span class="sq-progress" data-sq="text.progress">已學 ' + learned + ' / ' + SKILL_TOTAL + '</span>' +
    '<span class="sq-crystals" data-sq="text.crystals"><img data-sq="img.crystalsIcon" src="' + SQ_CRYSTAL + '" alt="異質碎片">' + training.crystals + '</span>' +
    '<span class="sq-label a" data-sq="text.labelA">' + sqT('text.labelA', 'A系列－生存（防禦、血量、迴避等數值）') + '</span>' +
    '<span class="sq-label b" data-sq="text.labelB">' + sqT('text.labelB', 'B系列－攻擊（物理攻擊、射程、攻速、命中等）') + '</span>' +
    squadSwitchHtml('') + nodes +
    ((training.skills[type] || []).length ? '<button type="button" class="sq-reset" data-squad-reset data-sq="btn.reset">' + sqT('btn.reset', '重置技能') + '</button>' : '') + '</section>';
  // 右下：說明
  const lay = skillLayoutOf(sel), node = skillNodeOf(type, sel), state = skillStateOf(type, sel), cost = node.cost, afford = training.crystals >= cost;
  const icon = node.icon || SKILL_GROUP_ICON[lay.group], effect = node.effect || (typeof modsText === 'function' ? modsText(node.mods) : '');
  if (state === 'locked') {
    const req = skillNodeOf(type, lay.req);
    h += '<section class="sq-info locked" data-sq="panel.skillInfo"><div class="sq-locked" data-sq="box.locked">' +
      '<span class="sq-lock-icon" data-sq="box.lockIcon"><img data-sq="img.lockIcon" src="images/ui/skill-lock.svg" alt="未解鎖"></span>' +
      '<p class="sq-lock-hint" data-sq="text.lockHint">「' + sqEsc(node.name) + '」需先解鎖「' + sqEsc(req ? req.name : lay.req) + '」技能。</p>' +
      '<p class="sq-lock-desc" data-sq="text.lockDesc">' + sqEsc(node.desc) + (effect ? '<br>' + sqEsc(effect) : '') + '</p></div></section>';
  } else {
    const label = state === 'owned' ? '已學會' : !safe ? '回基地才能培養' : afford ? sqT('btn.learn', '培養') : '碎片不足';
    h += '<section class="sq-info" data-sq="panel.skillInfo">' +
      '<span class="sq-info-icon" data-sq="box.skillIcon">' + sqIcon(icon, 'img.skillIcon') + '</span>' +
      '<b class="sq-info-name" data-sq="text.skillName">' + sqEsc(node.name) + '</b><small class="sq-info-tag" data-sq="text.skillTag">' + sqEsc(lay.tag) + '</small>' +
      '<p class="sq-info-desc" data-sq="text.skillDesc">' + sqEsc(node.desc) + '</p>' +
      '<p class="sq-info-effect" data-sq="text.skillEffect">' + sqEsc(effect) + '</p>' +
      '<div class="sq-learn" data-sq="box.learn">' + (state === 'owned' ? '' : '<span class="sq-cost"><span data-sq="text.costLabel">' + sqT('text.costLabel', '需要') + '</span><img data-sq="img.costIcon" src="' + SQ_CRYSTAL + '" alt="異質碎片"><b data-sq="text.cost">' + cost + '</b></span>') +
      '<button type="button" class="sq-learn-btn" data-skill-learn="' + sel + '" data-sq="btn.learn"' + (state === 'open' && safe && afford ? '' : ' disabled') + '>' + label + '</button></div></section>';
  }
  return h;
}
// ---- 裝備頁 ----
function squadLookItem(type, slot) {   // 這一格外觀現在穿的：{ id, name, image } 或 null
  if (typeof costumeState === 'undefined') return null;
  const eq = costumeState.equip[type] || {}, safe = typeof MAP_SAFE !== 'undefined' && MAP_SAFE;
  if (slot === 'skin') {
    const id = typeof wdSkinOf === 'function' ? wdSkinOf(type, safe ? 'base' : 'battle') : null;
    const s = typeof costumeSkinsFor === 'function' ? costumeSkinsFor(type).find(x => x.id === id) : null;
    return s ? { id: s.id, name: s.name, image: 'images/character/' + s.folder + '/' + s.folder.replace('_', '') + '_0000_Front.png', builtin: s.builtin } : null;
  }
  const a = eq[slot] && typeof ACC_BY_ID !== 'undefined' && ACC_BY_ID[eq[slot]];
  return a ? { id: a.id, name: a.name, image: a.art.front } : null;
}
function squadAvailList(type) {   // 下面「可用裝備」：選的是隊員裝備格→背包裡的隊員裝備；外觀格→能穿的服裝／配件
  const sl = squadPageState.slot;
  if (sl.kind === 'gear') return squadGearList().filter(g => (supplyInventory.get(g.id) || 0) > 0).map(g => ({ id: g.id, name: g.name, image: squadGearImage(g), n: supplyInventory.get(g.id), desc: g.desc, stat: squadGearEffect(g) }));
  if (typeof costumeSkinsFor === 'undefined') return [];
  if (sl.id === 'skin') return costumeSkinsFor(type).map(s => ({ id: 'skin-' + s.id, wear: s.id, name: s.name, image: 'images/character/' + s.folder + '/' + s.folder.replace('_', '') + '_0000_Front.png', desc: s.builtin ? '原本的服裝。' : '扭蛋得到的服裝' + (s.rarity ? '（' + s.rarity + '）' : '') + '。', stat: '外觀裝備，不影響數值' }));
  return COSTUME_ACCESSORIES.filter(a => a.slot === sl.id && costumeCanWear(type, a.id)).map(a => ({ id: a.id, wear: a.id, name: a.name, image: a.art.front, desc: '扭蛋得到的配件' + (a.rarity ? '（' + a.rarity + '）' : '') + '。', stat: '外觀裝備，不影響數值' }));
}
function squadGearHtml(actor, safe) {
  const type = actor.type, st = squadPageState, gear = squadGearOf(type);
  let h = '<section class="sq-main sq-gear" data-sq="panel.gear">' + squadSwitchHtml('G') +
    '<b class="sq-title gear" data-sq="text.gearTitle">' + sqT('text.gearTitle', '隊員裝備') + '</b>' +
    gear.map((id, i) => {
      const g = id && squadGearById(id), on = st.slot.kind === 'gear' && st.slot.id === i;
      return '<button type="button" class="sq-slot gear s' + i + (on ? ' sel' : '') + (g ? ' filled' : '') + '" data-gear-slot="' + i + '" data-sq="gearSlot:' + i + '" title="' + sqEsc(g ? g.name : '空') + '">' +
        (g ? '<img data-sq="gearSlotImg:' + i + '" src="' + squadGearImage(g) + '" alt="">' : '<i class="sq-plus-icon">+</i>') + '</button>' +
        '<span class="sq-slot-name gear s' + i + '" data-sq="gearSlotName:' + i + '">' + sqEsc(g ? g.name : '未裝備') + '</span>';
    }).join('') +
    '<div class="sq-preview" data-sq="box.preview"><canvas data-sq="img.preview" width="128" height="128"></canvas></div>' +
    '<b class="sq-title look" data-sq="text.lookTitle">' + sqT('text.lookTitle', '外觀裝備') + '</b>' +
    SQ_LOOK_SLOTS().map((s, i) => {
      const it = squadLookItem(type, s.id), on = st.slot.kind === 'look' && st.slot.id === s.id;
      return '<button type="button" class="sq-slot look l' + i + (on ? ' sel' : '') + (it ? ' filled' : '') + '" data-look-slot="' + s.id + '" data-sq="lookSlot:' + s.id + '" title="' + sqEsc(s.name + '：' + (it ? it.name : '未裝備')) + '">' +
        (it ? '<img data-sq="lookSlotImg:' + s.id + '" src="' + sqEsc(it.image) + '" alt="">' : '<i class="sq-plus-icon">+</i>') + '</button>' +
        '<span class="sq-slot-name look l' + i + '" data-sq="lookSlotName:' + s.id + '">' + sqT('lookSlotName:' + s.id, s.name) + '</span>';
    }).join('') + '</section>';
  // 右下：說明、數值、可用裝備
  const avail = squadAvailList(type);
  if (st.avail && !avail.some(a => a.id === st.avail)) st.avail = null;
  const pick = st.avail ? avail.find(a => a.id === st.avail) : null;
  let cur = null;
  if (st.slot.kind === 'gear') { const g = squadGearById(gear[st.slot.id]); if (g) cur = { name: g.name, desc: g.desc, stat: squadGearEffect(g) }; }
  else { const it = squadLookItem(type, st.slot.id); if (it) cur = { name: it.name, desc: it.builtin ? '原本的服裝。' : '外觀裝備。', stat: '外觀裝備，不影響數值' }; }
  const show = pick || cur;
  h += '<section class="sq-info sq-gear-info" data-sq="panel.gearInfo">' +
    '<b class="sq-title desc" data-sq="text.descTitle">' + sqT('text.descTitle', '裝備說明') + '</b><small class="sq-hint" data-sq="text.descHint">' + sqT('text.descHint', '（點選上方裝備 ICON）') + '</small>' +
    '<div class="sq-box desc" data-sq="box.desc"><p data-sq="text.desc">' + (show ? '<b>' + sqEsc(show.name) + '</b>　' + sqEsc(show.desc || '') : '<span class="sq-dim">這一格還沒有裝備。</span>') + '</p></div>' +
    '<b class="sq-title stat" data-sq="text.statTitle">' + sqT('text.statTitle', '裝備數值') + '</b>' +
    '<div class="sq-box stat" data-sq="box.stat"><p data-sq="text.stat">' + (show ? sqEsc(show.stat || '—') : '') + '</p></div>' +
    '<b class="sq-title avail" data-sq="text.availTitle">' + sqT('text.availTitle', '可用裝備') + '</b>' +
    '<div class="sq-avail" data-sq="panel.avail">' + (avail.length ? avail.map(a => '<button type="button" class="sq-avail-item' + (a.id === st.avail ? ' sel' : '') + '" data-avail="' + sqEsc(a.id) + '" data-sq="avail:' + sqEsc(a.id) + '" title="' + sqEsc(a.name) + '"><img data-sq="availImg:' + sqEsc(a.id) + '" src="' + sqEsc(a.image) + '" alt="">' + (a.n > 1 ? '<em>×' + a.n + '</em>' : '') + '</button>').join('')
      : '<p class="sq-dim">' + (st.slot.kind === 'gear' ? '背包裡沒有隊員裝備（便利商店有賣）' : '還沒有這個欄位的外觀裝備') + '</p>') + '</div>' +
    '<button type="button" class="sq-btn unequip" data-gear-unequip data-sq="btn.unequip"' + (cur && safe && !(st.slot.kind === 'look' && st.slot.id === 'skin' && cur.desc === '原本的服裝。') ? '' : ' disabled') + '>' + sqT('btn.unequip', '卸下裝備') + '</button>' +
    '<button type="button" class="sq-btn equip" data-gear-equip data-sq="btn.equip"' + (pick && safe ? '' : ' disabled') + '>' + sqT('btn.equip', '穿上裝備') + '</button></section>';
  return h;
}

// ---- 縮放、連線、◀、外觀預覽 ----
function fitSquadCanvas(body) {
  const canvas = body.querySelector('.sq-canvas'); if (!canvas) return;
  const w = body.clientWidth, h = body.clientHeight - (parseFloat(getComputedStyle(body).paddingBottom) || 0);
  const s = Math.max(.2, Math.min(w / SQ_W, h / SQ_H));
  canvas.style.transform = 'scale(' + s + ')'; canvas.style.left = Math.max(0, (w - SQ_W * s) / 2) + 'px'; canvas.style.top = Math.max(0, (h - SQ_H * s) / 2) + 'px';
}
function afterSquadRender(body) {
  placeSquadArrow(body); drawSquadLines(body); drawSquadPreview(body);
  if (!body._sqResize && typeof ResizeObserver !== 'undefined') { body._sqResize = new ResizeObserver(() => { fitSquadCanvas(body); }); body._sqResize.observe(body); }
}
const sqScale = el => { const r = el.getBoundingClientRect(); return el.offsetWidth ? r.width / el.offsetWidth || 1 : 1; };
function placeSquadArrow(body) {
  const arrow = body.querySelector('.sq-arrow'), btn = body.querySelector('.sq-member.on'), canvas = body.querySelector('.sq-canvas');
  if (!arrow || !canvas) return;
  if (!btn) { arrow.style.visibility = 'hidden'; return; }
  const s = sqScale(canvas), cr = canvas.getBoundingClientRect(), br = btn.getBoundingClientRect(), list = btn.parentElement.getBoundingClientRect();
  const visible = br.bottom > list.top && br.top < list.bottom;
  arrow.style.visibility = visible ? '' : 'hidden';
  arrow.style.top = ((br.top + br.height / 2 - cr.top) / s - arrow.offsetHeight / 2) + 'px';
}
function drawSquadLines(body) {
  const svg = body.querySelector('.sq-lines'), panel = svg && svg.parentElement; if (!svg) return;
  const type = squadPageState.member, s = sqScale(panel), pr = panel.getBoundingClientRect();
  svg.setAttribute('viewBox', '0 0 ' + panel.offsetWidth + ' ' + panel.offsetHeight);
  const box = id => { const el = panel.querySelector('[data-skill-pick="' + id + '"]'); if (!el) return null; const r = el.getBoundingClientRect(); return { l: (r.left - pr.left) / s, r: (r.right - pr.left) / s, cy: (r.top + r.height / 2 - pr.top) / s }; };
  svg.innerHTML = SKILL_LAYOUT.filter(n => n.req && n.group !== 'aux').map(n => {
    const a = box(n.req), b = box(n.id); if (!a || !b) return '';
    const mx = (a.r + b.l) / 2, d = Math.abs(a.cy - b.cy) < 3 ? 'M' + a.r + ' ' + a.cy + ' H' + b.l : 'M' + a.r + ' ' + a.cy + ' H' + mx + ' V' + b.cy + ' H' + b.l;
    return '<path d="' + d + '" class="' + (hasSkill(type, n.id) ? 'on' : skillStateOf(type, n.id) === 'open' ? 'next' : '') + '"/>';
  }).join('');
}
function drawSquadPreview(body) {
  const cvs = body.querySelector('.sq-preview canvas'); if (!cvs || typeof costumeSkinSet !== 'function') return;
  const type = squadPageState.member, safe = typeof MAP_SAFE !== 'undefined' && MAP_SAFE;
  const draw = () => {
    const c = cvs.getContext('2d'); c.clearRect(0, 0, cvs.width, cvs.height); c.imageSmoothingEnabled = false;
    const set = costumeSkinSet(type, costumeFolderOf(type), wdSkinOf(type, safe ? 'base' : 'battle')), img = set && set.front && set.front[0];
    drawCostumeAccessories(c, type, { dir: 'front', frame: 0 }, 0, 0, 128, 'behind');
    if (img && img.complete && img.naturalWidth) c.drawImage(img, 0, 0, 128, 128);
    drawCostumeAccessories(c, type, { dir: 'front', frame: 0 }, 0, 0, 128, 'front');
  };
  draw(); for (const ms of [120, 400, 1200]) setTimeout(() => { if (cvs.isConnected) draw(); }, ms);   // 圖還在下載：晚一點再畫一次
}

// ---- 點擊 ----
function handleSquadClick(body, e) {
  const st = squadPageState, safe = typeof MAP_SAFE !== 'undefined' && MAP_SAFE, sound = n => { if (typeof sfx === 'function') sfx(n); };
  const t = e.target, type = st.member;
  const member = t.closest('[data-squad-member]');
  if (member) { st.member = member.dataset.squadMember; st.avail = null; sound('switch'); renderSquadPage(body); return; }
  if (t.closest('[data-sq-switch]')) { st.page = st.page === 'gear' ? 'skills' : 'gear'; sound('switch'); renderSquadPage(body); return; }
  const pick = t.closest('[data-skill-pick]');
  if (pick) { st.skill[type] = pick.dataset.skillPick; sound('switch'); renderSquadPage(body); return; }
  const learn = t.closest('[data-skill-learn]');
  if (learn) { if (learnSkill(type, learn.dataset.skillLearn)) sound('achievement'); else sound('error'); renderSquadPage(body); return; }
  if (t.closest('[data-squad-reset]')) {
    if (!confirm('重置 ' + TYPES[type].name + ' 的技能？學技能花掉的碎片會全部退回。')) return;
    const refund = resetSkills(type);
    if (typeof systemNotice === 'function') systemNotice('已重置技能，退回 ◆ ' + refund);
    sound('switch'); renderSquadPage(body); return;
  }
  const imp = t.closest('[data-impression]'); if (imp) { if (typeof openCaptainImpression === 'function') openCaptainImpression(imp.dataset.impression); return; }
  const gs = t.closest('[data-gear-slot]'), ls = t.closest('[data-look-slot]');
  if (gs || ls) { st.slot = gs ? { kind: 'gear', id: Number(gs.dataset.gearSlot) } : { kind: 'look', id: ls.dataset.lookSlot }; st.avail = null; sound('switch'); renderSquadPage(body); return; }
  const av = t.closest('[data-avail]');
  if (av) { st.avail = av.dataset.avail; sound('blip'); renderSquadPage(body); if (e.detail >= 2) squadEquip(body); return; }   // 連點兩下＝直接穿上
  if (t.closest('[data-gear-equip]')) { squadEquip(body); return; }
  if (t.closest('[data-gear-unequip]')) { squadUnequip(body); return; }
}
function squadEquip(body) {
  const st = squadPageState, type = st.member, safe = typeof MAP_SAFE !== 'undefined' && MAP_SAFE;
  if (!safe) { if (typeof tpadToast === 'function') tpadToast('回到基地才能換裝備'); return; }
  const a = squadAvailList(type).find(x => x.id === st.avail); if (!a) return;
  let ok = false;
  if (st.slot.kind === 'gear') ok = equipSquadGear(type, st.slot.id, a.id);
  else {
    const eq = costumeEquip(type);
    if (st.slot.id === 'skin') eq.base = a.wear; else eq[st.slot.id] = a.wear;   // 服裝：換基地穿的那套（戰鬥區的在衣櫃換）
    saveCostumes(); if (typeof applyOutfits === 'function') applyOutfits(); ok = true;
  }
  if (typeof sfx === 'function') sfx(ok ? 'button' : 'error');
  st.avail = null; renderSquadPage(body);
}
function squadUnequip(body) {
  const st = squadPageState, type = st.member, safe = typeof MAP_SAFE !== 'undefined' && MAP_SAFE;
  if (!safe) { if (typeof tpadToast === 'function') tpadToast('回到基地才能換裝備'); return; }
  if (st.slot.kind === 'gear') unequipSquadGear(type, st.slot.id);
  else {
    const eq = costumeEquip(type);
    if (st.slot.id === 'skin') delete eq.base; else eq[st.slot.id] = null;
    saveCostumes(); if (typeof applyOutfits === 'function') applyOutfits();
  }
  if (typeof sfx === 'function') sfx('switch');
  renderSquadPage(body);
}
// 滑鼠停在技能格上：小視窗顯示名稱和說明（第一格＝原本的特性）
function handleSquadHover(body, e) {
  const tip = body.querySelector('.sq-tip'), node = e.target.closest && e.target.closest('[data-tip]'), canvas = body.querySelector('.sq-canvas');
  if (!tip || !canvas) return;
  if (!node) { tip.hidden = true; return; }
  const s = sqScale(canvas), cr = canvas.getBoundingClientRect(), r = node.getBoundingClientRect();
  tip.innerHTML = '<b>' + node.dataset.tip + '</b><p>' + node.dataset.tipDesc + '</p>'; tip.hidden = false;
  const x = Math.min(SQ_W - tip.offsetWidth - 6, Math.max(6, (r.left + r.width / 2 - cr.left) / s - tip.offsetWidth / 2));
  tip.style.left = x + 'px'; tip.style.top = Math.max(4, (r.top - cr.top) / s - tip.offsetHeight - 8) + 'px';
}

// ---- 版面設定（data/squad-layout.js）：產生 CSS 蓋在原本的樣式上 ----
function squadLayoutCss() {
  let css = '';
  const els = (typeof SQUAD_LAYOUT !== 'undefined' && SQUAD_LAYOUT.elements) || {};
  for (const [key, o] of Object.entries(els)) {
    const part = squadPart(key); if (!part || !o) continue;
    const r = [], img = part.kind === 'img';
    if (o.x || o.y) r.push('translate:' + (o.x || 0) + 'px ' + (o.y || 0) + 'px !important');
    if (img && o.size > 0) r.push('width:' + o.size + 'px !important', 'height:auto !important', 'max-width:none !important', 'max-height:none !important', 'min-width:0 !important', 'min-height:0 !important', 'font-size:' + Math.round(o.size * .62) + 'px !important');
    if (!img && o.w > 0) r.push('width:' + o.w + 'px !important', 'max-width:none !important', 'min-width:0 !important', 'flex:none !important');
    if (!img && o.h > 0) r.push('height:' + o.h + 'px !important', 'max-height:none !important', 'min-height:0 !important');
    if (o.font > 0) r.push('font-size:' + o.font + 'px !important');
    if (o.align) r.push('text-align:' + o.align + ' !important', 'justify-content:' + ({ left: 'flex-start', center: 'center', right: 'flex-end' }[o.align] || 'center') + ' !important');
    if (r.length) css += '#tpad [data-sq="' + key.replace(/["\\]/g, '\\$&') + '"]{' + r.join(';') + '}';
  }
  return css;
}
let squadLayoutStyle = null;
function applySquadLayout() {
  if (!squadLayoutStyle) { squadLayoutStyle = document.createElement('style'); squadLayoutStyle.id = 'squadLayoutStyle'; document.head.appendChild(squadLayoutStyle); }
  const css = squadLayoutCss(); if (squadLayoutStyle.textContent !== css) squadLayoutStyle.textContent = css;
  const body = document.querySelector('#tpad .sq-app'); if (body) { placeSquadArrow(body); drawSquadLines(body); }
}
applySquadLayout();

// ---- T-Pad 的 App（js/tpad.js 的 TPAD_APPS 'squad' 會呼叫 renderTPadSquadApp）----
function renderTPadSquadApp(el) {
  if (typeof ensureTeamUI === 'function') ensureTeamUI();
  if (!el._sqBound) {
    el._sqBound = true;
    el.addEventListener('click', e => { if (tpadView === 'squad') handleSquadClick(el, e); });
    el.addEventListener('mouseover', e => { if (tpadView === 'squad') handleSquadHover(el, e); });
    el.addEventListener('mouseleave', () => { const tip = el.querySelector('.sq-tip'); if (tip) tip.hidden = true; });
    el.addEventListener('scroll', e => { if (e.target.classList && e.target.classList.contains('sq-roster-list')) placeSquadArrow(el); }, true);
  }
  renderSquadPage(el);
}
function restoreTPadSquadApp() {
  if (typeof closeCaptainImpression === 'function') closeCaptainImpression();
  const body = tpadEl && tpadEl.querySelector('.tpad-appbody');
  if (body) { body.classList.remove('tpad-squad-app', 'squad-safe', 'sq-app'); if (body._sqResize) { body._sqResize.disconnect(); body._sqResize = null; } }
}
const squadPageBody = () => document.querySelector('#tpad .sq-app');
function refreshSquadPage() { const b = squadPageBody(); if (b) renderSquadPage(b); }

// ---- 編輯器裡的預覽（?squadedit=1）：在遊戲這邊處理選取、拖曳、縮放，用訊息跟編輯器溝通（跟背包編輯器同一種做法） ----
// 編輯器 → 遊戲：ping、setup、state（版面＋技能內容＋裝備清單）、select、center、mode（play＝試玩）、page（skills／gear）、member
// 遊戲 → 編輯器：ready、opened、parts、pick、info、dragstart、move、resize、moved、arrow、undo、redo、save
if (/[?&]squadedit=1(&|$)/.test(location.search)) (() => {
  let selKey = null, hoverKey = null, drag = null, play = false, keepOpen = false;
  const post = m => parent.postMessage(Object.assign({ src: 'squadedit-game' }, m), '*');
  const root = () => document.querySelector('#tpad .sq-canvas');
  const els = key => { const r = root(); return r ? [...r.querySelectorAll('[data-sq="' + String(key).replace(/["\\]/g, '\\$&') + '"]')].filter(el => el.getClientRects().length) : []; };
  const over = key => ((SQUAD_LAYOUT.elements = SQUAD_LAYOUT.elements || {})[key] = SQUAD_LAYOUT.elements[key] || {});
  const scaleOf = el => sqScale(el);
  function hit(target) {
    const r = root(); if (!r || !target || !target.closest || !r.contains(target)) return null;
    const el = target.closest('[data-sq]'); return el && r.contains(el) ? el.dataset.sq : null;
  }
  function sendParts() {
    const list = Object.keys(SQ_PARTS), members = squadMemberList().filter(m => TYPES[m.type] || m.profile);
    refreshSquadPage();   // 先畫一次，SQ_TEXT_DEFAULT（可以改字的介面文字）才完整
    for (const m of members) { list.push('roster:' + m.type, 'rosterImg:' + m.type); }
    for (const n of SKILL_LAYOUT) list.push('node:' + n.id, 'nodeIcon:' + n.id);
    for (const s of SQ_STATS) list.push('stat:' + s.id, 'statIcon:' + s.id, 'statLabel:' + s.id, 'statValue:' + s.id);
    for (let i = 0; i < SQUAD_GEAR_SLOTS; i++) list.push('gearSlot:' + i, 'gearSlotImg:' + i, 'gearSlotName:' + i);
    for (const s of SQ_LOOK_SLOTS()) list.push('lookSlot:' + s.id, 'lookSlotImg:' + s.id, 'lookSlotName:' + s.id);
    for (const g of squadGearList()) list.push('avail:' + g.id, 'availImg:' + g.id);
    post({ type: 'parts', list: list.map(k => squadPart(k)).filter(Boolean).map(p => ({ key: p.key, group: p.group, label: p.label, kind: p.kind })),
      members: members.filter(m => TYPES[m.type]).map(m => ({ id: m.type, name: TYPES[m.type].name })), nodes: SKILL_LAYOUT.map(n => ({ id: n.id, tag: n.tag })) });
  }
  function textInfo(key) {
    if (!(key in SQ_TEXT_DEFAULT)) return null;
    return { store: 'texts', k: key, value: (SQUAD_LAYOUT.texts || {})[key] || '', original: SQ_TEXT_DEFAULT[key], scope: '所有隊員共用這個字' };
  }
  function sendInfo(key) {
    if (!key) return;
    const list = els(key), el = list[0], values = {}, part = squadPart(key) || {};
    if (el) {
      const cs = getComputedStyle(el), r = el.getBoundingClientRect();
      values.w = Math.round(el.offsetWidth || r.width / scaleOf(el)); values.h = Math.round(el.offsetHeight || r.height / scaleOf(el));
      if (part.kind === 'img') {
        const nw = el.naturalWidth, nh = el.naturalHeight;
        values.size = Math.round(nw && nh && cs.objectFit === 'contain' ? Math.min(el.offsetWidth, el.offsetHeight * nw / nh) : (el.offsetWidth || r.width));
      }
      values.font = Math.round(parseFloat(cs.fontSize)); values.align = cs.textAlign === 'start' ? 'left' : cs.textAlign === 'end' ? 'right' : cs.textAlign;
    }
    const type = squadPageState.member, nodeId = key.startsWith('node:') || key.startsWith('nodeIcon:') ? key.split(':')[1] : null;
    const skill = nodeId && TYPES[type] ? { member: type, memberName: TYPES[type].name, id: nodeId, tag: skillLayoutOf(nodeId).tag, node: skillNodeOf(type, nodeId) } : null;
    post({ type: 'info', key, visible: !!el, count: list.length, values, text: textInfo(key), skill, page: squadPageState.page, member: type });
  }
  function setup() {
    try {
      const list = mapList(), idx = list.findIndex(m => /應變中心/.test(m.name));
      switchMap(Math.max(0, idx)); newGame();
      const ov = document.getElementById('overlay'); if (ov) ov.style.display = 'none';
      G.running = true;
      document.querySelectorAll('#itemIntro, #pauseBadge').forEach(el => el.classList.add('hidden'));
      const editors = document.getElementById('editors'); if (editors) editors.style.display = 'none';
      for (const g of squadGearList()) supplyInventory.set(g.id, 2);   // 每件隊員裝備放 2 件、碎片給很多、服裝都拿到（存檔被擋住了，不會留下來）
      training.crystals = 9999;
      if (typeof costumeState !== 'undefined' && typeof COSTUME_ACCESSORIES !== 'undefined') for (const a of COSTUME_ACCESSORIES) costumeState.owned[a.id] = costumeState.owned[a.id] || 1;
      const realClose = closeTPad, realHome = showTPadHome;
      closeTPad = silent => { if (!keepOpen) realClose(silent); };   // 預覽裡 T-Pad 一直開在 Y102隊員
      showTPadHome = silent => { if (!keepOpen) realHome(silent); };
      openTPad(); launchTPadApp('squad'); keepOpen = true;
      setTimeout(() => { sendParts(); post({ type: 'opened' }); }, 350);
    } catch (e) { console.warn('隊員編輯器預覽：準備畫面失敗', e); }
  }
  function applyState(m) {
    const replace = (obj, data) => { for (const k of Object.keys(obj)) delete obj[k]; Object.assign(obj, JSON.parse(JSON.stringify(data || {}))); };
    replace(SQUAD_LAYOUT, m.layout || { elements: {}, texts: {} });
    replace(SQUAD_SKILLS, m.skills || { members: {} });
    if (Array.isArray(m.gear)) {
      const before = squadGearList().map(g => g.id).join();
      SQUAD_GEAR.splice(0, SQUAD_GEAR.length, ...JSON.parse(JSON.stringify(m.gear)));
      syncSquadGearItems();
      for (const g of squadGearList()) if (!supplyInventory.has(g.id)) supplyInventory.set(g.id, 2);
      if (before !== squadGearList().map(g => g.id).join()) sendParts();
    }
    applySkills(); refreshSquadPage(); applySquadLayout();
    if (selKey) sendInfo(selKey);
  }
  function center(key, axis) {   // 對齊外面那一層（它所在的框）的正中間
    const el = els(key)[0], parentEl = el && el.parentElement; if (!parentEl) return;
    const r = el.getBoundingClientRect(), pr = parentEl.getBoundingClientRect(), s = scaleOf(parentEl) || 1, o = over(key);
    if (axis !== 'y') o.x = Math.round((o.x || 0) + (pr.left + pr.width / 2 - (r.left + r.width / 2)) / s);
    if (axis !== 'x') o.y = Math.round((o.y || 0) + (pr.top + pr.height / 2 - (r.top + r.height / 2)) / s);
    applySquadLayout(); post({ type: 'move', key, x: o.x || 0, y: o.y || 0 }); post({ type: 'moved', key }); sendInfo(key);
  }
  // 從清單選到現在看不到的東西：換頁、換隊員、換格子，把它叫出來
  function reveal(key) {
    if (els(key).length) return;
    const st = squadPageState, [p, id] = key.split(':');
    if (/^(node|nodeIcon)$/.test(p) || /^(text\.(labelA|labelB|switchLabel|progress|crystals|skill|cost|lock)|btn\.(switch|reset|learn)$|img\.(switch|skillIcon|costIcon|lockIcon|crystalsIcon)$|box\.(skillIcon|learn|locked|lockIcon)|panel\.(tree|skillInfo)|svg\.)/.test(key)) st.page = 'skills';
    if (/^(gearSlot|gearSlotImg|gearSlotName|lookSlot|lookSlotImg|lookSlotName|avail|availImg)$/.test(p) || /(G$|^text\.(gearTitle|lookTitle|desc|stat|avail)|^box\.(preview|desc|stat)|^img\.preview|^btn\.(un)?equip|^panel\.(gear|gearInfo|avail))/.test(key)) st.page = 'gear';
    if (p === 'roster' || p === 'rosterImg') st.member = id;
    if (/^box\.(locked|lockIcon)$|^img\.lockIcon$|^text\.lock/.test(key)) { const n = SKILL_LAYOUT.find(x => skillStateOf(st.member, x.id) === 'locked'); if (n) st.skill[st.member] = n.id; }
    if (/^(box\.skillIcon|img\.skillIcon|text\.skill|box\.learn|btn\.learn|text\.cost|img\.costIcon)/.test(key)) { const n = SKILL_LAYOUT.find(x => skillStateOf(st.member, x.id) === 'open'); if (n && skillStateOf(st.member, st.skill[st.member]) === 'locked') st.skill[st.member] = n.id; }
    if (p === 'gearSlotImg') { st.slot = { kind: 'gear', id: Number(id) }; if (!squadGearOf(st.member)[id]) { const g = squadGearList().find(x => supplyInventory.get(x.id) > 0); if (g) equipSquadGear(st.member, Number(id), g.id); } }
    if (p === 'avail' || p === 'availImg') st.slot = { kind: 'gear', id: st.slot.kind === 'gear' ? st.slot.id : 0 };
    refreshSquadPage(); applySquadLayout();
  }
  window.addEventListener('message', e => {
    const m = e.data; if (!m || m.src !== 'squadedit-editor') return;
    if (m.type === 'state') applyState(m);
    else if (m.type === 'select') { selKey = m.key; if (m.key) reveal(m.key); sendInfo(m.key); }
    else if (m.type === 'center') center(m.key, m.axis);
    else if (m.type === 'mode') { play = !!m.play; hoverKey = null; }
    else if (m.type === 'page') { squadPageState.page = m.page === 'gear' ? 'gear' : 'skills'; refreshSquadPage(); if (selKey) sendInfo(selKey); }
    else if (m.type === 'member') { squadPageState.member = m.member; if (m.node) { squadPageState.skill[m.member] = m.node; squadPageState.page = 'skills'; } refreshSquadPage(); if (selKey) sendInfo(selKey); }
    else if (m.type === 'setup') setup();
    else if (m.type === 'ping' && document.readyState !== 'loading') post({ type: 'ready' });
  });

  // ---- 滑鼠：點一下選、拖曳移動、拖右下角的小方塊改大小；試玩模式下照遊戲原本的方式點 ----
  let outline = null, handle = null, hoverBox = null;
  const extra = [];
  window.addEventListener('pointerdown', ev => {
    if (handle && ev.target === handle && selKey) {   // 改大小
      ev.preventDefault(); ev.stopImmediatePropagation();
      const el = els(selKey)[0]; if (!el) return;
      const o = over(selKey), img = (squadPart(selKey) || {}).kind === 'img';
      drag = { key: selKey, resize: true, img, sx: ev.clientX, sy: ev.clientY, size: o.size || el.offsetWidth || el.getBoundingClientRect().width / scaleOf(el), w: o.w || el.offsetWidth, h: o.h || el.offsetHeight, s: scaleOf(el.parentElement || el), moved: false };
      return;
    }
    if (play) return;
    ev.preventDefault(); ev.stopImmediatePropagation();
    const key = hit(ev.target); if (!key) return;
    // 點到隊員、技能格、裝備格、可用裝備：順便選它（畫面跟著換），方便接著調
    const t = ev.target, st = squadPageState, body = squadPageBody();
    const mem = t.closest('[data-squad-member]'), node = t.closest('[data-skill-pick]'), gs = t.closest('[data-gear-slot]'), ls = t.closest('[data-look-slot]'), av = t.closest('[data-avail]');
    if (body && (mem || node || gs || ls || av)) {
      if (mem) { st.member = mem.dataset.squadMember; st.avail = null; }
      if (node) st.skill[st.member] = node.dataset.skillPick;
      if (gs) { st.slot = { kind: 'gear', id: Number(gs.dataset.gearSlot) }; st.avail = null; }
      if (ls) { st.slot = { kind: 'look', id: ls.dataset.lookSlot }; st.avail = null; }
      if (av) st.avail = av.dataset.avail;
      renderSquadPage(body);
    }
    selKey = key; post({ type: 'pick', key }); sendInfo(key);
    const el = els(key)[0], o = over(key);
    drag = { key, sx: ev.clientX, sy: ev.clientY, x: o.x || 0, y: o.y || 0, s: el && el.parentElement ? scaleOf(el.parentElement) : 1, moved: false };
  }, true);
  window.addEventListener('pointermove', ev => {
    if (!drag) { hoverKey = play ? null : hit(ev.target); return; }
    ev.preventDefault();
    if (!drag.moved && Math.abs(ev.clientX - drag.sx) + Math.abs(ev.clientY - drag.sy) < 3) return;   // 只是點一下，不算拖
    if (!drag.moved) post({ type: 'dragstart', key: drag.key });   // 編輯器記下拖之前的樣子（Ctrl+Z 用）
    drag.moved = true;
    const dx = (ev.clientX - drag.sx) / drag.s, dy = (ev.clientY - drag.sy) / drag.s, o = over(drag.key);
    if (drag.resize && drag.img) { o.size = Math.max(4, Math.round(drag.size + dx)); post({ type: 'resize', key: drag.key, size: o.size }); }   // 圖片：長寬一起、1px 一格
    else if (drag.resize) { o.w = Math.max(4, Math.round(drag.w + dx)); o.h = Math.max(4, Math.round(drag.h + dy)); post({ type: 'resize', key: drag.key, w: o.w, h: o.h }); }
    else { o.x = Math.round(drag.x + dx); o.y = Math.round(drag.y + dy); post({ type: 'move', key: drag.key, x: o.x, y: o.y }); }
    applySquadLayout();   // 先在這邊動，拖起來比較順
  }, true);
  window.addEventListener('pointerup', () => { if (drag) { if (drag.moved) { post({ type: 'moved', key: drag.key }); sendInfo(drag.key); } drag = null; } }, true);
  for (const t of ['click', 'mousedown', 'mouseup', 'contextmenu', 'dblclick'])
    window.addEventListener(t, ev => { if (!play || ev.target === handle) { ev.preventDefault(); ev.stopImmediatePropagation(); } }, true);
  window.addEventListener('keydown', ev => {   // 方向鍵交給編輯器微調；Ctrl+Z／Y／S 交給編輯器；其他鍵不給遊戲
    if (ev.key.startsWith('Arrow') && selKey && !play) post({ type: 'arrow', key: ev.key, shift: ev.shiftKey });
    const k = ev.key.toLowerCase();
    if ((ev.ctrlKey || ev.metaKey) && (k === 'z' || k === 'y')) post({ type: k === 'y' || ev.shiftKey ? 'redo' : 'undo' });
    if ((ev.ctrlKey || ev.metaKey) && k === 's') post({ type: 'save' });
    ev.preventDefault(); ev.stopImmediatePropagation();
  }, true);

  // ---- 選到的東西外面畫虛線（同名的其他幾個畫細虛線）；滑鼠停著的畫黃色細線 ----
  const box = css => { const d = document.createElement('div'); d.style.cssText = 'position:fixed;z-index:99999;pointer-events:none;display:none;' + css; document.body.appendChild(d); return d; };
  const place = (d, r, pad) => Object.assign(d.style, { display: 'block', left: (r.left - pad) + 'px', top: (r.top - pad) + 'px', width: (r.width + pad * 2) + 'px', height: (r.height + pad * 2) + 'px' });
  function loop() {
    if (!outline && document.body) {
      outline = box('border:2px dashed #7fd7da;border-radius:4px');
      hoverBox = box('border:1px solid rgba(255,214,102,.9);border-radius:4px');
      handle = box('width:12px;height:12px;box-sizing:border-box;background:#7fd7da;border:2px solid #10232a;border-radius:2px;cursor:nwse-resize;pointer-events:auto;z-index:100000');
      handle.title = '拖曳改大小';
    }
    if (outline) {
      const list = selKey ? els(selKey) : [];
      if (list.length) {
        const r = list[0].getBoundingClientRect();
        place(outline, r, 2);
        Object.assign(handle.style, { display: 'block', left: (r.right - 5) + 'px', top: (r.bottom - 5) + 'px' });
      } else { outline.style.display = 'none'; handle.style.display = 'none'; }
      while (extra.length < Math.min(list.length - 1, 30)) extra.push(box('border:1px dashed rgba(127,215,218,.7);border-radius:4px'));
      extra.forEach((d, i) => { const el = list[i + 1]; if (el) place(d, el.getBoundingClientRect(), 1); else d.style.display = 'none'; });
      const hl = hoverKey && hoverKey !== selKey && !drag ? els(hoverKey)[0] : null;
      if (hl) place(hoverBox, hl.getBoundingClientRect(), 1); else hoverBox.style.display = 'none';
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
