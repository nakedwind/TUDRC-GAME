/* ===== T-Pad「Y102隊員」頁：技能樹頁／隊員裝備頁（右上的切換鈕換頁）=====
   ・左：隊員頭像列（◀＝目前選的人）　中：角色資料（立繪、名字、定位、簡介、HP／SP 或負荷、6 個數值）
   ・技能樹頁：右上＝技能樹（js/skills.js）、右下＝點到的技能的說明＋培養（還沒解鎖的顯示鎖頭和條件）
   ・裝備頁：右上＝隊員裝備 3 格＋外觀預覽＋外觀裝備 5 格（服裝系統 js/costumes.js）、右下＝裝備說明、數值、可用裝備、穿上／卸下
   ・畫面是固定 888×520 的畫布，依 T-Pad 螢幕大小等比例縮放（所以編輯器調的像素在每種螢幕上都一樣）
   ・每個可以調整的東西身上有 data-sq="名字"；版面設定在 data/squad-layout.js（「Y102隊員裝備／技能編輯器」存的），套用方式跟背包編輯器一樣
   ・?squadedit=1：編輯器裡的預覽（最下面），用 postMessage 跟編輯器溝通
*/
const SQ_W = 888, SQ_H = 520;
// 先藏起技能樹的隊員：技能的效果、說明、畫面都還在，只是玩家在 Y102隊員頁看不到技能樹（只看得到裝備頁）；要打開時把他從這裡拿掉
const SQ_SKILL_TREE_HIDDEN = ['tino'];
const squadPageState = { member: null, page: 'skills', skill: {}, slot: { kind: 'gear', id: 0 }, avail: null, solo: null };   // solo：只看這一位（對話的「推薦裝備」打開的，左邊不列其他隊員）
const SQ_STATS = [
  { id: 'atk', name: '攻擊', icon: 'atk', val: s => s.noAttack ? '—' : String(s.dmg), num: s => s.dmg },
  { id: 'def', name: '防禦', icon: 'def', val: s => Math.round((s.defense || 0) * 100) + '%', num: s => Math.round((s.defense || 0) * 100) },
  { id: 'range', name: '射程', icon: 'range', val: s => s.noAttack ? '—' : (s.range || 0).toFixed(1) + ' 格', num: s => Math.round((s.range || 0) * 10) / 10 },
  { id: 'rate', name: '攻速', icon: 'rate', val: s => s.noAttack ? '—' : (s.rate || 0).toFixed(1) + '/秒', num: s => Math.round((s.rate || 0) * 10) / 10 },
  { id: 'acc', name: '命中', icon: 'acc', val: s => s.noAttack ? '—' : Math.round((s.accuracy || 0) * 100) + '%', num: s => Math.round((s.accuracy || 0) * 100) },
  { id: 'move', name: '移動速度', icon: 'move', val: s => String(Math.round(s.walkSpeed || 0)), num: s => Math.round(s.walkSpeed || 0) },
];
const SQ_MOVE_ICON = '<svg class="stat-ico move" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M13.5 3.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM9.8 8.6l3.6-.4 2.2 3.2 3 1-.6 1.9-3.7-1.2-1-1.4-1 3.6 2.6 2.4V22h-2v-4.3l-2.7-2.3-1 3.8-4.3 2.6-1-1.7 3.6-2.2 1.6-6.1-1.6.7-.9 3H5.4l1.3-4.4Z"/></svg>';
const SQ_CRYSTAL = 'images/碎片鑰匙/anomalous-shard-ground-glow.png';
const sqEsc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
// 可以在編輯器改字的介面文字：sqT(名字, 原本的字)
const SQ_TEXT_DEFAULT = {};
function sqT(key, def) { SQ_TEXT_DEFAULT[key] = def; const t = typeof SQUAD_LAYOUT !== 'undefined' && SQUAD_LAYOUT.texts && SQUAD_LAYOUT.texts[key]; return sqEsc(t || def).replace(/\n/g, '<br>'); }   // 編輯器裡按 Enter 換行＝畫面上也換行
// 同一個位置、但存成不同名字的字（技能分類每格各一個、條件提示有兩種句型）：畫面上最後畫的是哪一個
// 每格各自的版面（text.xxx@隊員/格子）沒調時照哪一份：補充說明先看分組的（@trait／@other，有調過的話），再看大家共用的
function sqParentKey(key) {
  const [b, who = ''] = String(key).split('@'), id = who.split('/')[1], g = b === 'text.skillNote' && id ? b + '@' + (id === 'trait-1' ? 'trait' : 'other') : null;
  return g && ((typeof SQUAD_LAYOUT !== 'undefined' && SQUAD_LAYOUT.elements) || {})[g] ? g : b;
}
let sqSkillTagKey = '', sqLockHintKey = '', sqIntroKey = '';   // 簡介：每位隊員各一個
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
  'text.switchLabel': ['技能樹頁', '「切換技能樹／裝備」'],   // 原本的「A系列－生存」「B系列－攻擊」標題拿掉了：分類只寫在程式裡（js/skills.js 的 tag）
  'btn.switch': ['技能樹頁', '切換按鈕'], 'text.noSkill': ['技能樹頁', '「支援人員沒有技能樹…」（選到支援人員時）'], 'img.switch': ['技能樹頁', '切換按鈕的圖'], 'btn.reset': ['技能樹頁', '「重置技能」'], 'svg.lines': ['技能樹頁', '技能之間的連線（整組）'],
  'box.skillIcon': ['技能說明', '技能圖示的框'], 'img.skillIcon': ['技能說明', '技能圖示'], 'text.skillName': ['技能說明', '技能名稱'], 'text.skillTag': ['技能說明', '技能分類（Lv1、A 系列…）'],
'text.skillEffect': ['技能說明', '技能效果（數值）・所有技能一起'], 'text.skillEffect2': ['技能說明', '技能效果 2・所有技能一起'],'text.skillNote': ['技能說明', '補充說明（效果下面）'], 'box.learn': ['技能說明', '培養區塊（還沒學）'], 'box.learned': ['技能說明', '已學會：按鈕區塊'], 'text.costLabel': ['技能說明', '「需要」'],
  'img.costIcon': ['技能說明', '異質碎片圖示（價格）'], 'text.cost': ['技能說明', '價格數字'], 'btn.learn': ['技能說明', '「培養」按鈕'], 'btn.learned': ['技能說明', '「已學會」按鈕'],
  'box.locked': ['技能說明', '還沒解鎖：整塊'], 'box.lockIcon': ['技能說明', '還沒解鎖：鎖頭的框'], 'img.lockIcon': ['技能說明', '還沒解鎖：鎖頭'], 'text.lockHint': ['技能說明', '還沒解鎖：條件提示'], 'text.lockDesc': ['技能說明', '還沒解鎖：技能說明'],
  'text.gearTitle': ['裝備頁', '「隊員裝備」'], 'box.preview': ['裝備頁', '角色外觀預覽的框'], 'img.preview': ['裝備頁', '角色外觀預覽'], 'text.lookTitle': ['裝備頁', '「外觀裝備」'],
  'text.switchLabelG': ['裝備頁', '「切換技能樹／裝備」'], 'btn.switchG': ['裝備頁', '切換按鈕'], 'img.switchG': ['裝備頁', '切換按鈕的圖'],
  'text.descTitle': ['裝備說明', '「裝備說明」'], 'box.desc': ['裝備說明', '裝備說明的框'], 'text.desc': ['裝備說明', '裝備說明文字'],
  'text.statTitle': ['裝備說明', '「裝備數值」'], 'box.stat': ['裝備說明', '裝備數值的框'], 'text.stat': ['裝備說明', '裝備數值文字'], 'text.availTitle': ['裝備說明', '「可用裝備」'],
  'btn.unequip': ['裝備說明', '「卸下裝備」'], 'btn.equip': ['裝備說明', '「穿上裝備」'],
};
// 外觀裝備格：服裝系統的欄位，但「下身」不放在這一頁（服裝、頭飾、臉部、背部、手部 5 格）
const SQ_LOOK_HIDDEN = ['lower'];
const SQ_LOOK_SLOTS = () => typeof COSTUME_SLOTS !== 'undefined' ? COSTUME_SLOTS.filter(s => !SQ_LOOK_HIDDEN.includes(s.id)) : [{ id: 'skin', name: '服裝' }];
function squadPart(key) {
  key = String(key || '');
  if (key.includes('@')) {   // 每格技能各自的（例：text.skillEffect@red/core-1）：跟共用的那一份同一種東西，只套用在這一格
    const [base, who] = key.split('@'), [t, id] = who.split('/'), bp = squadPart(base); if (!bp) return null;
    // @trait／@other：所有隊員的「特性」技能共用一份、其他技能共用另一份（補充說明的位置、大小）
    if (who === 'trait' || who === 'other') return { ...bp, key, group: '技能說明（分組）', label: bp.label + '（' + (who === 'trait' ? '所有「特性」技能' : '「特性」以外的所有技能') + '）' };
    const lay = typeof skillLayoutOf === 'function' ? skillLayoutOf(id, t) : null, name = ((typeof TYPES !== 'undefined' && TYPES[t]) || {}).name || t;
    return { ...bp, key, group: '技能說明（每格技能各自）', label: bp.label.replace('・所有技能一起', '') + '（只有這格：' + name + '・' + (lay ? lay.tag : id) + '）' };
  }
  // img＝圖片（大小＝寬，高度照比例）；box＝方形的框（大小＝寬＝高，長寬一起縮放）；其他＝面板、文字（寬、高分開）
  const kind = /^img\.|Img:|Icon:|^img:/.test(key) ? 'img' : /^(roster|g?node|gearSlot|lookSlot|avail):|^box\.(job|skillIcon|lockIcon)$|^btn\.switchG?$/.test(key) ? 'box' : '';
  if (SQ_PARTS[key]) return { key, group: SQ_PARTS[key][0], label: SQ_PARTS[key][1], kind, text: key in SQ_TEXT_DEFAULT };
  const [p, ...rest] = key.split(':'), id = rest.join(':'), nm = t => (TYPES[t] || (typeof CHARACTERS !== 'undefined' && CHARACTERS[t]) || {}).name || t;
  const lay = typeof skillLayoutOf === 'function' ? (/^gnode/.test(p) ? GUIDE_SKILL_LAYOUT.find(n => n.id === id) : skillLayoutOf(id)) : null, st = SQ_STATS.find(s => s.id === id), look = SQ_LOOK_SLOTS().find(s => s.id === id);
  const gearName = x => { const g = typeof squadGearById === 'function' && squadGearById(x); return g ? g.name : x; };
  const L = {
    roster: ['隊員列', '隊員格：' + nm(id)], rosterImg: ['隊員列', '隊員頭像：' + nm(id)],
    node: ['技能格', '技能格：' + (lay ? lay.tag + '（' + id + '）' : id)], nodeIcon: ['技能格', '技能圖示：' + (lay ? lay.tag + '（' + id + '）' : id)],
    gnode: ['技能格（嚮導）', '技能格：' + (lay ? lay.tag + '（' + id + '）' : id)], gnodeIcon: ['技能格（嚮導）', '技能圖示：' + (lay ? lay.tag + '（' + id + '）' : id)],   // 嚮導的技能樹格子比較少、位置不同：另外一組，跟哨兵的分開調
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
  if (st.solo && members.some(m => m.type === st.solo)) st.member = st.solo; else st.solo = null;
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
    if (actor.noncombat || !TYPES[actor.type]) html += '<section class="sq-main" data-sq="panel.tree"><p class="sq-empty" data-sq="text.noSkill">' + sqT('text.noSkill', '支援人員沒有技能樹，也沒有隊員裝備。') + '</p></section>';
    else if (st.page === 'gear' || SQ_SKILL_TREE_HIDDEN.includes(actor.type)) html += squadGearHtml(actor, safe);
    else html += squadSkillHtml(actor, safe);
  }
  const keep = body.querySelector('.sq-roster-list')?.scrollTop || 0;
  body.innerHTML = '<div class="sq-fit"><div class="sq-canvas' + (st.solo ? ' sq-solo' : '') + '" data-page="' + st.page + '">' + html + '<div class="sq-tip" hidden></div></div></div>';
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
  if (actor.noncombat) return h + '<p class="sq-intro" data-sq="text.intro">' + sqT(sqIntroKey = 'intro:' + actor.type, ch.intro || (actor.profile && actor.profile.intro) || '') + '</p></section>';
  const live = actor.live, hp = live ? Math.max(0, Math.round(live.hp)) : spec.hp, maxhp = live ? live.maxhp : spec.hp;
  const guide = !!spec.guide, sp = guide && typeof guideSPFor === 'function' ? Math.floor(guideSPFor(actor.type)) : 0, spMax = guide && typeof guideSPMax === 'function' ? guideSPMax(actor.type) : 100;
  const taint = live ? Math.max(0, Math.min(100, Math.round(live.taint || 0))) : 0;
  const load = guide ? { label: sqT('text.spLabel', 'SP'), key: 'text.spLabel', v: sp, max: spMax } : { label: sqT('text.taintLabel', '負荷'), key: 'text.taintLabel', v: taint, max: 100 };
  const base = (typeof SKILL_BASE !== 'undefined' && SKILL_BASE[actor.type]) || spec;   // 沒學技能、沒穿裝備時的原始數值
  h += '<div class="sq-tags"><span class="sq-tag" data-sq="text.role">' + sqEsc(spec.role || '') + '</span><span class="sq-tag" data-sq="text.ability">' + (guide ? '疏導能力' : '異能力') + '：' + sqEsc(spec.ability || '—') + '</span></div>' +
    '<p class="sq-intro" data-sq="text.intro">' + sqT(sqIntroKey = 'intro:' + actor.type, ch.intro || '') + '</p>' +
    '<div class="sq-bars" data-sq="box.bars">' +
      '<div class="sq-bar hp"><span data-sq="text.hpLabel">' + sqT('text.hpLabel', 'HP') + '</span><b data-sq="text.hpValue">' + hp + ' / ' + maxhp + '</b><i data-sq="bar.hp"><u style="width:' + Math.max(0, Math.min(100, hp / Math.max(1, maxhp) * 100)) + '%"></u></i></div>' +
      '<div class="sq-bar ' + (guide ? 'sp' : 'taint') + '"><span data-sq="' + load.key + '">' + load.label + '</span><b data-sq="text.loadValue">' + load.v + ' / ' + load.max + '</b><i data-sq="bar.load"><u style="width:' + Math.max(0, Math.min(100, load.v / Math.max(1, load.max) * 100)) + '%"></u></i></div>' +
    '</div><dl class="sq-stats" data-sq="box.stats">' + SQ_STATS.map(s => {
      const d = Math.round((s.num(spec) - s.num(base)) * 10) / 10;   // 技能＋裝備一共加了多少（綠色小字）；滑鼠停 0.25 秒會跳出算式（squadStatTipHtml）
      const icon = s.icon === 'move' ? SQ_MOVE_ICON : (typeof STAT_ICON !== 'undefined' && STAT_ICON[s.icon]) || '';
      return '<div class="sq-stat" data-sq="stat:' + s.id + '" data-sq-stat="' + s.id + '"><span class="sq-stat-icon" data-sq="statIcon:' + s.id + '">' + icon + '</span><dt data-sq="statLabel:' + s.id + '">' + sqT('statLabel:' + s.id, s.name) + '</dt>' +
        '<dd data-sq="statValue:' + s.id + '">' + s.val(spec) + (d && !spec.noAttack ? '<small class="sq-plus' + (d < 0 ? ' minus' : '') + '">' + (d > 0 ? '+' : '') + d + (SQ_STAT_PCT[s.id] ? '%' : '') + '</small>' : '') + '</dd></div>';
    }).join('') + '</dl>';
  return h + '</section>';
}
function squadSwitchHtml(suffix) {
  if (SQ_SKILL_TREE_HIDDEN.includes(squadPageState.member)) return '';   // 技能樹藏起來的隊員：不顯示「切換技能樹／裝備」
  return '<span class="sq-switch-label" data-sq="text.switchLabel' + suffix + '">' + sqT('text.switchLabel' + suffix, '切換技能樹／裝備') + '</span>' +
    '<button type="button" class="sq-switch" data-sq-switch data-sq="btn.switch' + suffix + '" title="切換技能樹／裝備"><img data-sq="img.switch' + suffix + '" src="images/ui/squad-switch.svg" alt=""></button>';
}
function squadSkillHtml(actor, safe) {
  const type = actor.type, st = squadPageState;
  // 嚮導的技能樹格子比較少（js/skills.js 的 GUIDE_SKILL_LAYOUT），排法也不同：整塊加 guide，格子用 gnode:（編輯器裡跟哨兵的分開調）
  const layout = skillLayoutFor(type), guide = isGuideTree(type), nk = guide ? 'gnode' : 'node';
  let sel = st.skill[type]; if (!skillLayoutOf(sel, type)) sel = (layout.find(n => skillStateOf(type, n.id) === 'open') || layout[0]).id;
  st.skill[type] = sel;
  const nodes = layout.map(n => {
    const node = skillNodeOf(type, n.id), state = skillStateOf(type, n.id), icon = node.icon || skillGroupIcon(type, n.group);
    return '<button type="button" class="sq-node g-' + n.group + ' ' + state + (n.id === sel ? ' sel' : '') + '" data-skill-pick="' + n.id + '" data-sq="' + nk + ':' + n.id + '" data-sq-tip="' + sqEsc(node.name) + '" data-sq-tip-desc="' + sqEsc(node.desc || node.effect || (node.active && typeof guideActiveTexts === 'function' ? guideActiveTexts(node.active).effect : '')) + '">' +
      sqIcon(icon, nk + 'Icon:' + n.id) + (state === 'locked' ? '<i class="sq-node-lock">🔒</i>' : '') + '</button>';
  }).join('');
  const learned = skillLearnedCount(type);
  let h = '<section class="sq-main sq-tree' + (guide ? ' guide' : '') + '" data-sq="panel.tree"><svg class="sq-lines" data-sq="svg.lines" aria-hidden="true"></svg>' +
    '<span class="sq-progress" data-sq="text.progress">已學 ' + learned + ' / ' + skillTotalFor(type) + '</span>' +
    '<span class="sq-crystals" data-sq="text.crystals"><img data-sq="img.crystalsIcon" src="' + SQ_CRYSTAL + '" alt="異質碎片">' + training.crystals + '</span>' +
    squadSwitchHtml('') + nodes +
    ((training.skills[type] || []).length ? '<button type="button" class="sq-reset" data-squad-reset data-sq="btn.reset">' + sqT('btn.reset', '重置技能') + '</button>' : '') + '</section>';
  // 右下：說明
  const lay = skillLayoutOf(sel, type), node = skillNodeOf(type, sel), state = skillStateOf(type, sel), cost = node.cost, afford = training.crystals >= cost;
  // 技能效果、補充說明空白：嚮導會自己發動的技能依數字自動產生（js/squad-gear.js 的 guideActiveTexts）；其他技能的效果依 mods 產生
  const auto = node.active && typeof guideActiveTexts === 'function' ? guideActiveTexts(node.active) : null;
  const icon = node.icon || skillGroupIcon(type, lay.group), effect = node.effect || (auto ? auto.effect : typeof modsText === 'function' ? modsText(node.mods) : '');
  const note = node.note || (auto ? auto.note : '');
  if (state === 'locked') {
    const req = skillNodeOf(type, lay.req), need = lay.req && !hasSkill(type, lay.req) ? null : (lay.reqAny || []).filter(id => !hasSkill(type, id)).map(id => '「' + sqEsc(skillNodeOf(type, id).name) + '」');
    // 條件提示是可以在編輯器改的範本：{name}＝這格技能、{req}＝要先學的技能、{reqs}＝還沒學的那幾個（用「或」連起來）
    sqLockHintKey = need && need.length ? 'text.lockHintAny' : 'text.lockHint';
    // 範本裡沒有 {name} 的話（例如在編輯器直接打成某一格的句子），所有技能都會顯示同一句 → 改用預設範本
    const tpl = (key, def) => { const t = sqT(key, def); return t.includes('{name}') ? t : sqEsc(def).replace(/\n/g, '<br>'); };
    const hint = (need && need.length ? tpl('text.lockHintAny', '「{name}」需先解鎖\n{reqs}其中一項技能。') : tpl('text.lockHint', '「{name}」需先解鎖\n「{req}」技能。'))
      .replace(/\{(name|reqs|req)\}/g, (_, k) => k === 'name' ? sqEsc(node.name) : k === 'reqs' ? (need || []).join('或') : sqEsc(req ? req.name : lay.req));
    h += '<section class="sq-info locked" data-sq="panel.skillInfo"><div class="sq-locked" data-sq="box.locked">' +
      '<span class="sq-lock-icon" data-sq="box.lockIcon" data-sq-center><img data-sq="img.lockIcon" src="images/ui/skill-lock.svg" alt="未解鎖"></span>' +
      '<p class="sq-lock-hint" data-sq="text.lockHint">' + hint + '</p>' +
      '<p class="sq-lock-desc" data-sq="text.lockDesc">' + [effect ? sqEsc(effect) : '', note ? sqEsc(note).replace(/\n/g, '<br>') : ''].filter(Boolean).join('<br>') + '</p></div></section>';   // 「技能描述」只在滑鼠停在技能圖示上時顯示，這裡不重複
  } else {
    const owned = state === 'owned', label = owned ? sqT('btn.learned', '已學會') : !safe ? '回基地才能培養' : afford ? sqT('btn.learn', '培養') : '碎片不足';
    h += '<section class="sq-info" data-sq="panel.skillInfo">' +
      '<span class="sq-info-icon" data-sq="box.skillIcon">' + sqIcon(icon, 'img.skillIcon') + '</span>' +
      '<b class="sq-info-name" data-sq="text.skillName">' + sqEsc(node.name) + '</b><small class="sq-info-tag" data-sq="text.skillTag">' + sqT(sqSkillTagKey = 'skillTag:' + sel, lay.tag) + '</small>' +
      '<p class="sq-info-effect" data-sq="text.skillEffect@' + type + '/' + sel + '" data-sq-base="text.skillEffect">' + sqEsc(effect) + '</p>' +   // 位置、大小每格技能各自調（沒調的照大家共用的）
      '<p class="sq-info-effect sq-info-effect2" data-sq="text.skillEffect2@' + type + '/' + sel + '" data-sq-base="text.skillEffect2">' + sqEsc(node.effect2).replace(/\n/g, '<br>') + '</p>' +   // 技能效果 2：同上，每格各自調
      '<p class="sq-info-note" data-sq="text.skillNote@' + type + '/' + sel + '" data-sq-base="text.skillNote" data-sq-group="text.skillNote@' + (sel === 'trait-1' ? 'trait' : 'other') + '">' + sqEsc(note).replace(/\n/g, '<br>') + '</p>' +
      '<div class="sq-learn' + (owned ? ' owned' : '') + '" data-sq="box.learn' + (owned ? 'ed' : '') + '">' + (owned ? '' : '<span class="sq-cost"><span data-sq="text.costLabel">' + sqT('text.costLabel', '需要') + '</span><img data-sq="img.costIcon" src="' + SQ_CRYSTAL + '" alt="異質碎片"><b data-sq="text.cost">' + cost + '</b></span>') +
      '<button type="button" class="sq-learn-btn" data-skill-learn="' + sel + '" data-sq="btn.learn' + (owned ? 'ed' : '') + '"' + (state === 'open' && safe && afford ? '' : ' disabled') + '>' + label + '</button></div></section>';
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
// 外觀裝備（服裝、配件）的說明、數值文字：編輯器可以改，存在 data/squad-layout.js 的 texts（lookDesc:id／lookStat:id）；沒改＝照下面的預設
const sqLookText = (id, f, def) => { const t = typeof SQUAD_LAYOUT !== 'undefined' && SQUAD_LAYOUT.texts && SQUAD_LAYOUT.texts[(f === 'desc' ? 'lookDesc:' : 'lookStat:') + id]; return t || def; };
let squadShownItem = null;   // 下方「裝備說明／裝備數值」現在顯示的是哪一件：{ kind: 'gear'|'look', id }（編輯器改字用）
function squadAvailList(type) {   // 下面「可用裝備」：選的是隊員裝備格→背包裡的隊員裝備；外觀格→能穿的服裝／配件
  const sl = squadPageState.slot;
  if (sl.kind === 'gear') return squadGearList().filter(g => (supplyInventory.get(g.id) || 0) > 0).map(g => ({ id: g.id, ref: { kind: 'gear', id: g.id }, name: g.name, image: squadGearImage(g), n: supplyInventory.get(g.id), desc: g.desc, stat: squadGearEffect(g) }));
  if (typeof costumeSkinsFor === 'undefined') return [];
  if (sl.id === 'skin') return costumeSkinsFor(type).map(s => ({ id: 'skin-' + s.id, wear: s.id, name: s.name, image: 'images/character/' + s.folder + '/' + s.folder.replace('_', '') + '_0000_Front.png', ref: { kind: 'look', id: s.id }, desc: sqLookText(s.id, 'desc', s.builtin ? '原本的服裝。' : '扭蛋得到的服裝' + (s.rarity ? '（' + s.rarity + '）' : '') + '。'), stat: sqLookText(s.id, 'stat', '外觀裝備，不影響數值') }));
  return COSTUME_ACCESSORIES.filter(a => accFitsSlot(a, sl.id) && costumeCanWear(type, a.id)).map(a => ({ id: a.id, wear: a.id, name: a.name, image: a.art.front, ref: { kind: 'look', id: a.id }, desc: sqLookText(a.id, 'desc', '扭蛋得到的配件' + (a.rarity ? '（' + a.rarity + '）' : '') + '。'), stat: sqLookText(a.id, 'stat', '外觀裝備，不影響數值') }));
}
function squadGearHtml(actor, safe) {
  safe = safe || (squadPageState.slot.kind === 'gear' && bagCanManageEquipment());
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
  const wornAt = pick && st.slot.kind === 'gear' ? squadGearWornAt(type, pick.id, st.slot.id) : -1;   // 同一件只能穿一格
  let cur = null;
  if (st.slot.kind === 'gear') { const g = squadGearById(gear[st.slot.id]); if (g) cur = { ref: { kind: 'gear', id: g.id }, name: g.name, desc: g.desc, stat: squadGearEffect(g) }; }
  else { const it = squadLookItem(type, st.slot.id); if (it) cur = { ref: { kind: 'look', id: it.id }, name: it.name, desc: sqLookText(it.id, 'desc', it.builtin ? '原本的服裝。' : '外觀裝備。'), stat: sqLookText(it.id, 'stat', '外觀裝備，不影響數值') }; }
  const show = pick || cur;
  squadShownItem = show ? { ...show.ref, name: show.name, desc: show.desc || '', stat: show.stat || '' } : null;
  h += '<section class="sq-info sq-gear-info" data-sq="panel.gearInfo">' +
    '<b class="sq-title desc" data-sq="text.descTitle">' + sqT('text.descTitle', '裝備說明') + '</b>' +
    '<div class="sq-box desc" data-sq="box.desc"><p data-sq="text.desc">' + (show ? '<b>' + sqEsc(show.name) + '</b>：' + sqEsc(show.desc || '').replace(/\n/g, '<br>') : '<span class="sq-dim">這一格還沒有裝備。</span>') + '</p></div>' +
    '<b class="sq-title stat" data-sq="text.statTitle">' + sqT('text.statTitle', '裝備數值') + '</b>' +
    '<div class="sq-box stat" data-sq="box.stat"><p data-sq="text.stat">' + (show ? sqEsc(show.stat || '—').replace(/\n/g, '<br>') : '<span class="sq-dim">無。</span>') + '</p></div>' +
    '<b class="sq-title avail" data-sq="text.availTitle">' + sqT('text.availTitle', '可用裝備') + '</b>' +
    '<div class="sq-avail" data-sq="panel.avail">' + (avail.length ? avail.map(a => '<button type="button" class="sq-avail-item' + (a.id === st.avail ? ' sel' : '') + '" data-avail="' + sqEsc(a.id) + '" data-sq="avail:' + sqEsc(a.id) + '" title="' + sqEsc(a.name) + '"><img data-sq="availImg:' + sqEsc(a.id) + '" src="' + sqEsc(a.image) + '" alt="">' + (a.n > 1 ? '<em>×' + a.n + '</em>' : '') + '</button>').join('')
      : '<p class="sq-dim">' + (st.slot.kind === 'gear' ? '背包裡沒有隊員裝備（便利商店有賣）' : '還沒有這個欄位的外觀裝備') + '</p>') + '</div>' +
    '<button type="button" class="sq-btn unequip" data-gear-unequip data-sq="btn.unequip"' + (cur && safe && !(st.slot.kind === 'look' && st.slot.id === 'skin' && cur.desc === '原本的服裝。') ? '' : ' disabled') + '>' + sqT('btn.unequip', '卸下裝備') + '</button>' +
    '<button type="button" class="sq-btn equip" data-gear-equip data-sq="btn.equip"' + (pick && safe && wornAt < 0 ? '' : ' disabled') + '>' + (wornAt >= 0 ? '已穿在第 ' + (wornAt + 1) + ' 格' : sqT('btn.equip', '穿上裝備')) + '</button></section>';
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
  // 第一次打開時 App 畫面還沒顯示出來（量不到位置）：顯示後（大小改變）再排一次
  if (!body._sqResize && typeof ResizeObserver !== 'undefined') { body._sqResize = new ResizeObserver(() => { fitSquadCanvas(body); placeSquadArrow(body); drawSquadLines(body); }); body._sqResize.observe(body); }
  setTimeout(() => { if (body.isConnected) { fitSquadCanvas(body); placeSquadArrow(body); drawSquadLines(body); } }, 0);
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
// 技能之間的連線：用排版位置（offset）＋編輯器的位移來算，不受 T-Pad 打開動畫、縮放影響
// 直線／折線＝前一格（req）；斜線＝「其中一項」條件（reqAny：A1 或 B1 學了其中一個，才能學核心技能）
function drawSquadLines(body) {
  const svg = body.querySelector('.sq-lines'), panel = svg && svg.parentElement; if (!svg || !panel.offsetWidth) return;
  const type = squadPageState.member, els = (typeof SQUAD_LAYOUT !== 'undefined' && SQUAD_LAYOUT.elements) || {};
  const layout = skillLayoutFor(type), nk = isGuideTree(type) ? 'gnode:' : 'node:';   // 嚮導：格子少、編輯器位移另外一組
  svg.setAttribute('viewBox', '0 0 ' + panel.offsetWidth + ' ' + panel.offsetHeight);
  const box = id => {
    const el = panel.querySelector('[data-skill-pick="' + id + '"]'); if (!el) return null;
    const o = els[nk + id] || {}, l = el.offsetLeft + (o.x || 0), t = el.offsetTop + (o.y || 0), w = el.offsetWidth, h = el.offsetHeight;
    return { l, r: l + w, t, b: t + h, cx: l + w / 2, cy: t + h / 2, w };
  };
  const cls = (from, to) => hasSkill(type, to) && hasSkill(type, from) ? 'on' : hasSkill(type, from) && skillStateOf(type, to) === 'open' ? 'next' : '';
  let paths = layout.filter(n => n.req && n.group !== 'aux').map(n => {
    const a = box(n.req), b = box(n.id); if (!a || !b) return '';
    const mx = (a.r + b.l) / 2, d = Math.abs(a.cy - b.cy) < 3 ? 'M' + a.r + ' ' + a.cy + ' H' + b.l : 'M' + a.r + ' ' + a.cy + ' H' + mx + ' V' + b.cy + ' H' + b.l;
    return '<path d="' + d + '" class="' + cls(n.req, n.id) + '"/>';
  }).join('');
  for (const n of layout) for (const from of n.reqAny || []) {
    const a = box(from), b = box(n.id); if (!a || !b) continue;
    const down = a.cy < b.cy, ax = a.cx + a.w / 4, bx = b.cx - b.w / 4;
    paths += '<path d="M' + ax + ' ' + (down ? a.b : a.t) + ' L' + bx + ' ' + (down ? b.t : b.b) + '" class="diag ' + cls(from, n.id) + '"/>';
  }
  svg.innerHTML = paths;
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
  if (!safe && !(st.slot.kind === 'gear' && bagCanManageEquipment())) { if (typeof tpadToast === 'function') tpadToast('請到基地或營地帳篷換裝備'); return; }
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
  if (!safe && !(st.slot.kind === 'gear' && bagCanManageEquipment())) { if (typeof tpadToast === 'function') tpadToast('請到基地或營地帳篷換裝備'); return; }
  if (st.slot.kind === 'gear') unequipSquadGear(type, st.slot.id);
  else {
    const eq = costumeEquip(type);
    if (st.slot.id === 'skin') delete eq.base; else eq[st.slot.id] = null;
    saveCostumes(); if (typeof applyOutfits === 'function') applyOutfits();
  }
  if (typeof sfx === 'function') sfx('switch');
  renderSquadPage(body);
}
// ---- 數值格的算式（滑鼠停 0.25 秒）：原始數值 ＋ 每個技能、裝備加的 ＝ 現在的數值 ----
const SQ_STAT_PATH = { atk: 'dmg', def: 'defense', range: 'range', rate: 'rate', acc: 'accuracy', move: 'walkSpeed' };   // 數值格 → 技能／裝備 mods 的數值名稱
const SQ_STAT_PCT = { def: true, acc: true };   // 這兩格本身就是百分比（加 0.1＝+10%）
function squadStatTipHtml(type, statId) {
  const st = SQ_STATS.find(x => x.id === statId), path = SQ_STAT_PATH[statId], spec = TYPES[type], base = (typeof SKILL_BASE !== 'undefined' && SKILL_BASE[type]) || spec;
  if (!st || !path || !spec) return '';
  const unit = ((typeof STAT_MOD_NAMES !== 'undefined' && STAT_MOD_NAMES[path]) || {}).unit || '';
  const amount = m => m.mul != null ? (m.mul >= 1 ? '+' : '−') + Math.round(Math.abs(m.mul - 1) * 100) + '%'
    : SQ_STAT_PCT[statId] ? (m.add >= 0 ? '+' : '−') + Math.round(Math.abs(m.add) * 100) + '%'
    : (m.add >= 0 ? '+' : '−') + Math.round(Math.abs(m.add) * 100) / 100 + unit;
  const parts = [];   // { amount：加多少, from：哪個技能／裝備, mul：是不是 % 加成 }
  for (const n of skillLayoutFor(type)) if (hasSkill(type, n.id)) {
    const node = skillNodeOf(type, n.id) || {};
    for (const m of node.mods || []) if (m && m.path === path) parts.push({ amount: amount(m), from: node.name, mul: m.mul != null });
  }
  if (typeof squadGearOf === 'function') for (const id of squadGearOf(type)) {
    const g = id && squadGearById(id); if (!g) continue;
    for (const m of g.mods || []) if (m && m.path === path) parts.push({ amount: amount(m), from: g.name, mul: m.mul != null });
  }
  let h = '<b>' + sqEsc(st.name) + '</b><p class="sq-formula">' + sqEsc(st.val(base)) + parts.map(p => ' ' + p.amount).join('') + ' ＝ ' + sqEsc(st.val(spec)) + '</p>';
  h += '<p>原始　' + sqEsc(st.val(base)) + parts.map(p => '<br><span class="sq-tip-add">' + p.amount + '</span>　' + sqEsc(p.from)).join('') + '</p>';
  if (!parts.length) h += '<p class="sq-tip-note">還沒有技能或裝備加成。</p>';
  else if (parts.filter(p => p.mul).length > 1) h += '<p class="sq-tip-note">％加成是一個一個乘上去的。</p>';
  if ((statId === 'def' && spec.defense >= .75) || (statId === 'acc' && spec.accuracy >= 1)) h += '<p class="sq-tip-note">已經到上限（' + (statId === 'def' ? '75%' : '100%') + '）。</p>';
  return h;
}
// 小視窗放在 el 的正上方
function placeSquadTip(body, tip, el) {
  const canvas = body.querySelector('.sq-canvas'), s = sqScale(canvas), cr = canvas.getBoundingClientRect(), r = el.getBoundingClientRect();
  const x = Math.min(SQ_W - tip.offsetWidth - 6, Math.max(6, (r.left + r.width / 2 - cr.left) / s - tip.offsetWidth / 2));
  tip.style.left = x + 'px'; tip.style.top = Math.max(4, (r.top - cr.top) / s - tip.offsetHeight - 8) + 'px';
}
// 滑鼠停在技能格上：小視窗馬上顯示名稱和「技能描述」（第一格＝原本的特性）
// 滑鼠停在數值格上：0.25 秒後顯示算式
let sqStatTipTimer = 0;
function handleSquadHover(body, e) {
  const tip = body.querySelector('.sq-tip'), node = e.target.closest && e.target.closest('[data-sq-tip]'), canvas = body.querySelector('.sq-canvas');
  const stat = e.target.closest && e.target.closest('[data-sq-stat]');
  if (!tip || !canvas) return;
  if (stat) {
    if (tip.dataset.for === 'stat:' + stat.dataset.sqStat && (!tip.hidden || sqStatTipTimer)) return;   // 還在同一格裡移動
    clearTimeout(sqStatTipTimer); tip.hidden = true; tip.dataset.for = 'stat:' + stat.dataset.sqStat;
    sqStatTipTimer = setTimeout(() => {
      sqStatTipTimer = 0; if (!stat.isConnected) return;
      const html = squadStatTipHtml(squadPageState.member, stat.dataset.sqStat); if (!html) return;
      tip.innerHTML = html; tip.hidden = false; placeSquadTip(body, tip, stat);
    }, 250);
    return;
  }
  clearTimeout(sqStatTipTimer); sqStatTipTimer = 0;
  if (!node) { tip.hidden = true; tip.dataset.for = ''; return; }
  tip.dataset.for = 'node';
  tip.innerHTML = '<b>' + node.dataset.sqTip + '</b><p>' + node.dataset.sqTipDesc + '</p>'; tip.hidden = false;
  placeSquadTip(body, tip, node);
}

// ---- 版面設定（data/squad-layout.js）：產生 CSS 蓋在原本的樣式上 ----
function squadLayoutCss() {
  let css = '';
  const els = (typeof SQUAD_LAYOUT !== 'undefined' && SQUAD_LAYOUT.elements) || {};
  const rank = k => !k.includes('@') ? 0 : k.includes('/') ? 2 : 1;
  const order = Object.entries(els).sort((a, b) => rank(a[0]) - rank(b[0]));   // 共用的先、分組的（@trait／@other）、每格各自的最後
  for (const [key, o] of order) {
    const part = squadPart(key); if (!part || !o) continue;
    const r = [], img = part.kind === 'img', sq = part.kind === 'box';
    if (o.x || o.y || key.includes('@')) r.push('translate:' + (o.x || 0) + 'px ' + (o.y || 0) + 'px !important');   // 每格各自的：0 也要寫，才蓋得過共用的位移
    if (img && o.size > 0) r.push('width:' + o.size + 'px !important', 'height:auto !important', 'max-width:none !important', 'max-height:none !important', 'min-width:0 !important', 'min-height:0 !important', 'font-size:' + Math.round(o.size * .62) + 'px !important');
    if (sq && o.size > 0) r.push('width:' + o.size + 'px !important', 'height:' + o.size + 'px !important', 'max-width:none !important', 'max-height:none !important', 'min-width:0 !important', 'min-height:0 !important', 'flex:none !important');
    if (!img && !sq && o.w > 0) r.push('width:' + o.w + 'px !important', 'max-width:none !important', 'min-width:0 !important', 'flex:none !important');
    if (!img && !sq && o.h > 0) r.push('height:' + o.h + 'px !important', 'max-height:none !important', 'min-height:0 !important');
    if (o.font > 0) r.push('font-size:' + o.font + 'px !important');
    if (o.align) r.push('text-align:' + o.align + ' !important', 'justify-content:' + ({ left: 'flex-start', center: 'center', right: 'flex-end' }[o.align] || 'center') + ' !important');
    const q = key.replace(/["\\]/g, '\\$&');
    if (r.length) css += '#tpad [data-sq="' + q + '"]' + (!key.includes('@') ? ',#tpad [data-sq-base="' + q + '"]' : rank(key) === 1 ? ',#tpad [data-sq-group="' + q + '"]' : '') + '{' + r.join(';') + '}';
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
    el.addEventListener('mouseleave', () => { clearTimeout(sqStatTipTimer); sqStatTipTimer = 0; const tip = el.querySelector('.sq-tip'); if (tip) { tip.hidden = true; tip.dataset.for = ''; } });
    el.addEventListener('scroll', e => { if (e.target.classList && e.target.classList.contains('sq-roster-list')) placeSquadArrow(el); }, true);
  }
  renderSquadPage(el);
}
function restoreTPadSquadApp() {
  squadPageState.solo = null;   // 離開隊員畫面：下次從 T-Pad 打開就是一般的（左邊有全部隊員）
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
  const els = key => { const r = root(), q = String(key).replace(/["\\]/g, '\\$&'); return r ? [...r.querySelectorAll('[data-sq="' + q + '"],[data-sq-group="' + q + '"]')].filter(el => el.getClientRects().length) : []; };   // 分組的（@trait／@other）：畫面上那一格的補充說明
  const over = key => { const E = SQUAD_LAYOUT.elements = SQUAD_LAYOUT.elements || {}; if (!E[key]) E[key] = key.includes('@') ? { ...(E[sqParentKey(key)] || {}) } : {}; return E[key]; };   // @＝每格各自：從共用（或分組）的那一份開始
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
    for (const n of GUIDE_SKILL_LAYOUT) list.push('gnode:' + n.id, 'gnodeIcon:' + n.id);   // 嚮導的技能格（另外一組位置）
    for (const s of SQ_STATS) list.push('stat:' + s.id, 'statIcon:' + s.id, 'statLabel:' + s.id, 'statValue:' + s.id);
    for (let i = 0; i < SQUAD_GEAR_SLOTS; i++) list.push('gearSlot:' + i, 'gearSlotImg:' + i, 'gearSlotName:' + i);
    for (const s of SQ_LOOK_SLOTS()) list.push('lookSlot:' + s.id, 'lookSlotImg:' + s.id, 'lookSlotName:' + s.id);
    for (const g of squadGearList()) list.push('avail:' + g.id, 'availImg:' + g.id);
    post({ type: 'parts', list: list.map(k => squadPart(k)).filter(Boolean).map(p => ({ key: p.key, group: p.group, label: p.label, kind: p.kind })),
      members: members.filter(m => TYPES[m.type]).map(m => ({ id: m.type, name: TYPES[m.type].name, guide: isGuideTree(m.type), nodes: skillLayoutFor(m.type).map(n => ({ id: n.id, tag: n.tag })) })),   // 每位隊員自己的格子（嚮導比較少）
      nodes: SKILL_LAYOUT.map(n => ({ id: n.id, tag: n.tag })) });
  }
  function textInfo(key) {
    const k = key === 'text.skillTag' ? sqSkillTagKey : key === 'text.lockHint' ? sqLockHintKey : key === 'text.intro' ? sqIntroKey : key;
    if (!k || !(k in SQ_TEXT_DEFAULT)) return null;
    const scope = k.startsWith('intro:') ? '只改「' + ((TYPES[k.slice(6)] || (typeof CHARACTERS !== 'undefined' && CHARACTERS[k.slice(6)]) || {}).name || k.slice(6)) + '」在 Y102隊員頁的簡介（每位隊員各自一段；選隊員畫面的簡介不受影響）' :
      k.startsWith('skillTag:') ? '所有隊員的這一格（' + k.slice(9) + '）共用這個字' :
      k === 'text.lockHint' ? '所有隊員共用。{name}＝這格技能的名稱、{req}＝要先學會的技能' :
      k === 'text.lockHintAny' ? '所有隊員共用（前面的技能學會其中一個就能學的格子）。{name}＝這格技能的名稱、{reqs}＝還沒學的那幾個技能（自動用「或」連起來）' : '所有隊員共用這個字';
    return { store: 'texts', k, value: (SQUAD_LAYOUT.texts || {})[k] || '', original: SQ_TEXT_DEFAULT[k], scope };
  }
  function sendInfo(key) {
    if (!key) return;
    const list = els(key), el = list[0], values = {}, part = squadPart(key) || {};
    if (el) {
      const cs = getComputedStyle(el), r = el.getBoundingClientRect();
      values.w = Math.round(el.offsetWidth || r.width / scaleOf(el)); values.h = Math.round(el.offsetHeight || r.height / scaleOf(el));
      if (part.kind === 'box') values.size = Math.round(el.offsetWidth || r.width);
      if (part.kind === 'img') {
        const nw = el.naturalWidth, nh = el.naturalHeight;
        values.size = Math.round(nw && nh && cs.objectFit === 'contain' ? Math.min(el.offsetWidth, el.offsetHeight * nw / nh) : (el.offsetWidth || r.width));
      }
      values.font = Math.round(parseFloat(cs.fontSize)); values.align = cs.textAlign === 'start' ? 'left' : cs.textAlign === 'end' ? 'right' : cs.textAlign;
    }
    const type = squadPageState.member, nodeId = /^g?node(Icon)?:/.test(key) ? key.split(':')[1] : /^text\.(skillName|skillDesc|skillEffect2?|skillNote|lockDesc)(@|$)/.test(key) ? (key.includes('/') ? key.split('/')[1] : squadPageState.skill[type]) : null;   // 技能說明的字：右下現在顯示的那一格
    const skill = nodeId && TYPES[type] && skillLayoutOf(nodeId, type) ? { member: type, memberName: TYPES[type].name, id: nodeId, tag: skillLayoutOf(nodeId, type).tag, node: skillNodeOf(type, nodeId) } : null;
    const pt = squadPart(key);
    const gearText = /^(text|box)\.(desc|stat)$/.test(key) && squadPageState.page === 'gear' ? squadShownItem : null;   // 裝備說明／裝備數值：現在顯示的那一件
    post({ type: 'info', key, visible: !!el, count: list.length, values, text: textInfo(key), skill, gearText, page: squadPageState.page, member: type, part: pt && { key, group: pt.group, label: pt.label, kind: pt.kind } });
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
    if (/@(trait|other)$/.test(key)) {   // 分組的：換到特性／其他技能
      const st = squadPageState, m = st.member; st.page = 'skills';
      if (key.endsWith('@trait')) st.skill[m] = 'trait-1'; else if (!st.skill[m] || st.skill[m] === 'trait-1') st.skill[m] = 'trait-2';
      refreshSquadPage(); applySquadLayout(); return;
    }
    if (key.includes('@')) { const [t, id] = key.split('@')[1].split('/'); squadPageState.page = 'skills'; squadPageState.member = t; squadPageState.skill[t] = id; refreshSquadPage(); applySquadLayout(); return; }
    const st = squadPageState, [p, id] = key.split(':');
    if (/^(gnode|gnodeIcon)$/.test(p) && !isGuideTree(st.member)) { const g = squadMemberList().find(x => isGuideTree(x.type)); if (g) st.member = g.type; }   // 嚮導的技能格：換到一位嚮導
    if (/^(node|nodeIcon)$/.test(p) && isGuideTree(st.member)) { const s = squadMemberList().find(x => TYPES[x.type] && !isGuideTree(x.type)); if (s) st.member = s.type; }   // 哨兵的技能格：換到一位哨兵
    if (/^g?(node|nodeIcon)$/.test(p) || /^(text\.(switchLabel|progress|crystals|skill|cost|lock)|btn\.(switch|reset|learn|learned)$|img\.(switch|skillIcon|costIcon|lockIcon|crystalsIcon)$|box\.(skillIcon|learn|locked|lockIcon)|panel\.(tree|skillInfo)|svg\.)/.test(key)) st.page = 'skills';
    if (/^(gearSlot|gearSlotImg|gearSlotName|lookSlot|lookSlotImg|lookSlotName|avail|availImg)$/.test(p) || /(G$|^text\.(gearTitle|lookTitle|desc|stat|avail)|^box\.(preview|desc|stat)|^img\.preview|^btn\.(un)?equip|^panel\.(gear|gearInfo|avail))/.test(key)) st.page = 'gear';
    if (p === 'roster' || p === 'rosterImg') st.member = id;
    if (key === 'text.noSkill') { const m = squadMemberList().find(x => x.noncombat || !TYPES[x.type]); if (m) st.member = m.type; }   // 換到一位支援人員
    if (/^box\.(locked|lockIcon)$|^img\.lockIcon$|^text\.lock/.test(key)) { const n = skillLayoutFor(st.member).find(x => skillStateOf(st.member, x.id) === 'locked'); if (n) st.skill[st.member] = n.id; }
    if (/^(box\.skillIcon|img\.skillIcon|text\.skill|(box|btn)\.learn$|text\.cost|img\.costIcon)/.test(key)) {   // 培養按鈕、價格：要換到還沒學的格子；其他：不是鎖住的就好
      const n = skillLayoutFor(st.member).find(x => skillStateOf(st.member, x.id) === 'open'), cur = skillStateOf(st.member, st.skill[st.member]);
      if (n && (cur === 'locked' || (cur === 'owned' && /^(box|btn)\.learn$|^text\.cost|^img\.costIcon/.test(key)))) st.skill[st.member] = n.id;
    }
    if (/^(box|btn)\.learned$/.test(key)) { const n = skillLayoutFor(st.member).find(x => skillStateOf(st.member, x.id) === 'owned'); if (n) st.skill[st.member] = n.id; }   // 換到學會的格子
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
      const o = over(selKey), img = /^(img|box)$/.test((squadPart(selKey) || {}).kind);   // 圖片、方框：長寬一起縮放
      drag = { key: selKey, resize: true, img, k: el.hasAttribute('data-sq-center') ? 2 : 1, sx: ev.clientX, sy: ev.clientY, size: o.size || el.offsetWidth || el.getBoundingClientRect().width / scaleOf(el), w: o.w || el.offsetWidth, h: o.h || el.offsetHeight, s: scaleOf(el.parentElement || el), moved: false };
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
    if (drag.resize && drag.img) { o.size = Math.max(4, Math.round(drag.size + dx * drag.k)); post({ type: 'resize', key: drag.key, size: o.size }); }   // 圖片：長寬一起、1px 一格
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

// ---- 跟隊友對話：「🎽 推薦裝備」按鈕（js/game.js 的 openDialogue 呼叫），只在基地：直接打開 T-Pad 這位隊員的裝備頁 ----
const gearTargetOf = actor => { const id = actor && (actor.kind === 'tower' ? actor.type : actor.id);
  return id && typeof ROSTER !== 'undefined' && ROSTER.includes(id) && TYPES[id] ? id : null; };
function onDialogueOpenedGear(actor) {
  document.getElementById('dialogueGear')?.classList.toggle('hidden', !(MAP_SAFE && gearTargetOf(actor)));
}
function openSquadGearOf(id) {
  if (!tpadOpen) openTPad();
  if (!tpadOpen) return;
  Object.assign(squadPageState, { member: id, page: 'gear', slot: { kind: 'gear', id: 0 }, solo: id });   // 只看這一位：左邊不列其他隊員
  launchTPadApp('squad');
}
document.getElementById('dialogueGear')?.addEventListener('click', () => {
  const id = gearTargetOf(dialogueState && dialogueState.actor); if (!id) return;
  closeDialogue(true);
  openSquadGearOf(id);
});
