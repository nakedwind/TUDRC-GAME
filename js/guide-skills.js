/* ===== 嚮導技能：戰鬥中自動發動 =====
   數值＝技能內容的 active（js/skills.js 的 skillNodeOf）：「Y102隊員裝備／技能編輯器」改過的優先，沒有就用 data/guide-skills.js 的 GUIDE_SKILLS
   js/game.js 每一幀對每位嚮導呼叫 updateGuideSkills；對每位隊員呼叫 tickSkillBuffs（增益倒數）
   ・學會的格子（hasSkill）才會發動；在基地（MAP_SAFE）不發動
   ・詠唱中：t.gsCast＝{ id, left }，借用疏導的站定、閉眼、小光點（t.soothingT）
   ・增益：t.skillBuffs＝{ atk: { v, left }, def: …, spd: … }，js/sortie-supply.js 的 sortieBuff 會加進去 */

const GUIDE_COMBAT_RANGE = 8;   // 'combat'：嚮導 8 格內有怪物才算戰鬥中

// 場上活著的隊友（包含嚮導自己；倒下、被吃掉的不算）
const guideSkillAllies = () => ((typeof G !== 'undefined' && G && G.towers) || []).filter(o => o.hp > 0 && !o.eatenBy);

// 這招現在需不需要放（條件成立）
function guideSkillWanted(t, s) {
  const allies = guideSkillAllies();
  if (s.when === 'hpBelow') return allies.some(o => o.maxhp > 0 && o.hp / o.maxhp < s.at);
  if (s.when === 'taintAbove') return allies.some(o => !TYPES[o.type].guide && ((o.taint || 0) >= s.at || (s.orBerserk && o.berserk)));
  if (s.when === 'combat') return ((G && G.enemies) || []).some(e => !e.dead && e.hp > 0 && Math.hypot(e.x - t.x, e.y - t.y) <= GUIDE_COMBAT_RANGE * CELL);
  return false;
}

// 技能效果（詠唱完、或不用詠唱的馬上）
function guideSkillFire(t, s) {
  const sc = (typeof SOOTHE_COLORS !== 'undefined' && (SOOTHE_COLORS[t.type] || SOOTHE_COLORS.eldrin)) || [128, 222, 112];
  const color = `rgb(${sc[0]},${sc[1]},${sc[2]})`;
  let targets = guideSkillAllies();
  if (s.one) {   // 只幫最需要的那一個人：有降負荷＝負荷最高的哨兵；只有補血＝HP 比例最低的隊友
    const worst = s.soothe ? targets.filter(o => !TYPES[o.type].guide).sort((a, b) => (b.taint || 0) - (a.taint || 0))[0]
      : targets.slice().sort((a, b) => a.hp / a.maxhp - b.hp / b.maxhp)[0];
    targets = worst ? [worst] : [];
  }
  for (const o of targets) {
    if (s.heal) {
      const before = o.hp; o.hp = Math.min(o.maxhp, o.hp + s.heal);
      if (o.hp - before >= 1) flashDmg('HP +' + Math.round(o.hp - before), o.x, o.y - 44, '#7ee08a');
    }
    if (s.soothe && !TYPES[o.type].guide) {
      const before = o.taint || 0; o.taint = Math.max(0, before - s.soothe);
      if (s.wake && o.berserk) o.berserk = false;
      else if (o.berserk && o.taint < 60) o.berserk = false;
      if (before - o.taint >= 1) flashDmg('汙染 -' + Math.round(before - o.taint), o.x, o.y - 44, color);
    }
    if (s.buff) {
      o.skillBuffs = o.skillBuffs || {};
      for (const [k, v] of Object.entries(s.buff)) {
        const cur = o.skillBuffs[k];
        o.skillBuffs[k] = { v: Math.max(v, cur && cur.left > 0 ? cur.v : 0), left: Math.max(s.time || 0, cur ? cur.left : 0) };   // 同一種增益不疊加，取比較好的
      }
    }
    if (typeof spawnSootheEffect === 'function') spawnSootheEffect(o.x, o.y - 8, sc, o);
  }
  if (s.buff && typeof flash === 'function') flash(guideBuffText(s), t.x, t.y - 58, '#ffd77a');
  if (typeof spawnSootheCast === 'function') spawnSootheCast(t, sc, (s.buff ? 3 : 4) * CELL);
  if (typeof sfxAt === 'function') sfxAt('soothe', t.x, t.y, 0.42, t.type);
}
const GUIDE_BUFF_NAMES = { atk: '攻擊力', def: '防禦率', spd: '攻擊速度' };
const guideBuffText = s => '全隊' + Object.entries(s.buff).map(([k, v]) => GUIDE_BUFF_NAMES[k] + ' +' + Math.round(v * 100) + '%').join('、');

// 這位嚮導這一格的設定（沒有＝這格不是會自己發動的技能）
const guideActiveOf = (type, id) => (typeof skillNodeOf === 'function' && (skillNodeOf(type, id) || {}).active) || null;
function updateGuideSkills(t, dt) {
  const list = { ult: guideActiveOf(t.type, 'ult'), 'a-1': guideActiveOf(t.type, 'a-1'), 'b-1': guideActiveOf(t.type, 'b-1') };
  if (!isGuideTree(t.type) || t.hp <= 0 || t.berserk || (typeof MAP_SAFE !== 'undefined' && MAP_SAFE)) { t.gsCast = null; return; }
  t.gsCd = t.gsCd || {};
  for (const id of Object.keys(t.gsCd)) t.gsCd[id] = Math.max(0, t.gsCd[id] - dt);
  // 詠唱中：時間到才放；SP 在這時才扣，不夠就作廢
  if (t.gsCast) {
    const s = list[t.gsCast.id];
    t.gsCast.left -= dt;
    t.soothingT = Math.max(t.soothingT || 0, t.gsCast.left);   // 站定、閉眼、不攻擊
    t.sootheTargets = guideSkillAllies().filter(o => o !== t);   // 詠唱時全隊身上飄小光點
    if (t.gsCast.left > 0) return;
    const id = t.gsCast.id; t.gsCast = null; t.soothingT = 0;
    if (!s || (s.sp && !spendGuideSP(t, s.sp))) return;
    guideSkillFire(t, s); t.gsCd[id] = s.cd || 0;
    return;
  }
  if (t.soothingT > 0) return;   // 一般疏導施法中：等它做完
  // 依序看大招、上排、下排：學會、冷卻好、條件成立、SP 夠的第一招
  for (const id of ['ult', 'a-1', 'b-1']) {
    const s = list[id];
    if (!s || !hasSkill(t.type, id) || (t.gsCd[id] || 0) > 0) continue;
    if (s.sp && typeof guideSP === 'function' && !(typeof guideSPPractice === 'function' && guideSPPractice()) && guideSP(t) < s.sp) continue;
    if (!guideSkillWanted(t, s)) continue;
    const name = (skillNodeOf(t.type, id) || {}).name;
    if (name) t.say = { text: name + '！', life: 1.6 };
    if (s.cast > 0) {
      t.gsCast = { id, left: s.cast };
      t.soothingT = s.cast; t.gunSwing = null; t.gunT = 0; t.dir = 'front'; t.moving = false;
      if (typeof spawnSootheCast === 'function') { const sc = SOOTHE_COLORS[t.type] || SOOTHE_COLORS.eldrin; spawnSootheCast(t, sc, 2 * CELL, s.cast); }
    } else {
      if (s.sp && !spendGuideSP(t, s.sp)) continue;
      guideSkillFire(t, s); t.gsCd[id] = s.cd || 0;
    }
    return;   // 一幀只放一招
  }
}
// 被打暈、睡著、被溫特疏導（js/game.js）：詠唱中斷，不扣 SP、不進冷卻
function cancelGuideCast(t) { if (t && t.gsCast) { t.gsCast = null; t.soothingT = 0; } }

// 增益倒數（每位隊員每一幀）
function tickSkillBuffs(t, dt) {
  if (!t.skillBuffs) return;
  for (const [k, b] of Object.entries(t.skillBuffs)) { b.left -= dt; if (b.left <= 0) delete t.skillBuffs[k]; }
}
// 增益現在加多少（atk／def／spd）；js/sortie-supply.js 的 sortieBuff 會加上這個
function guideBuff(t, key) { const b = t && t.skillBuffs && t.skillBuffs[key]; return b && b.left > 0 ? b.v : 0; }
