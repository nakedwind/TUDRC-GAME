// ============================================================
//  支線任務（作戰桌的「支線」分頁）
//  ・角色委託（data/quests.js）：承接 → 出擊時自動算進度 → 回作戰桌領取獎勵。
//  ・回憶任務：拿到某人的第一片回憶碎片後出現「○○的回憶」，顯示碎片進度；集滿拼成鑰匙後提示前往記憶之門。
//  ・進度存在瀏覽器（localStorage）。
// ============================================================
const QUEST_STORE = 'tudrc_quests_v1';
const questState = { active: {}, done: [], memSeen: [] };   // active：委託 id → 目前進度；done：領過獎勵的；memSeen：出現過的回憶任務（碎片 id）
try {
  const saved = JSON.parse(localStorage.getItem(QUEST_STORE) || '{}');
  if (saved.active && typeof saved.active === 'object') for (const [id, n] of Object.entries(saved.active)) if (Number.isFinite(n)) questState.active[id] = n;
  for (const k of ['done', 'memSeen']) if (Array.isArray(saved[k])) questState[k] = saved[k].filter(x => typeof x === 'string');
} catch (_) {}
function saveQuests() { try { localStorage.setItem(QUEST_STORE, JSON.stringify(questState)); } catch (_) {} }

const questById = id => SIDE_QUESTS.find(q => q.id === id) || null;
const charName = id => (CHARACTERS[id] && CHARACTERS[id].name) || id;
const charFace = id => CHARACTERS[id] && CHARACTERS[id].sprite ? memberPortraitPath({ sprite: CHARACTERS[id].sprite }) : '';
// 委託的狀態：available 可承接、active 進行中、ready 可領獎、done 已完成
function questStatus(q) {
  if (questState.done.includes(q.id)) return 'done';
  if (!(q.id in questState.active)) return 'available';
  return questState.active[q.id] >= q.goal.count ? 'ready' : 'active';
}
const activeCount = () => Object.keys(questState.active).length;
const readyCount = () => SIDE_QUESTS.filter(q => questStatus(q) === 'ready').length;

// ---- 回憶任務：碎片 → 角色（data/gifts.js 的 REQUEST_SHARDS 反過來查；精神的碎片是溫特自己）----
function memoryOwner(shard) {
  const hit = Object.entries(typeof REQUEST_SHARDS !== 'undefined' ? REQUEST_SHARDS : {}).find(([, s]) => s === shard);
  return hit ? hit[0] : shard === 'spirit-shard' ? 'winter' : null;
}
function memoryQuests() {
  for (const mk of MEMORY_KEYS) {   // 第一次拿到碎片（或已經有鑰匙）就記住，之後一直顯示
    if (!questState.memSeen.includes(mk.shard) && ((supplyInventory.get(mk.shard) || 0) > 0 || (supplyInventory.get(mk.key) || 0) > 0)) { questState.memSeen.push(mk.shard); saveQuests(); }
  }
  return MEMORY_KEYS.filter(mk => questState.memSeen.includes(mk.shard)).map(mk => {
    const owner = memoryOwner(mk.shard), hasKey = (supplyInventory.get(mk.key) || 0) > 0;
    return { id: 'mem:' + mk.shard, mk, owner, hasKey, have: hasKey ? mk.need : Math.min(mk.need, supplyInventory.get(mk.shard) || 0), name: charName(owner) + '的回憶' };
  });
}

// ---- 進度（遊戲裡發生事情時呼叫）----
// type：kill（data.monster）、openCap、breakOre、breakCore、win
function questEvent(type, data = {}) {
  if (typeof MAP_SAFE !== 'undefined' && MAP_SAFE) return;
  let changed = false;
  for (const q of SIDE_QUESTS) {
    if (questStatus(q) !== 'active') continue;
    const g = q.goal;
    const hit = type === 'kill' ? g.type === 'kill' && (!g.monster || g.monster === data.monster)
      : type === 'win' ? g.type === 'winWith' && (!g.member || getTeam().includes(g.member))
      : g.type === type;
    if (!hit) continue;
    questState.active[q.id] = Math.min(g.count, questState.active[q.id] + 1);
    changed = true;
    if (questState.active[q.id] >= g.count) {
      systemNotice('✔ 支線完成：「' + q.name + '」——回作戰桌領取獎勵');
      if (typeof SFX !== 'undefined') SFX.play('achievement', .7, 'quest-done');
    } else systemNotice('支線「' + q.name + '」' + questState.active[q.id] + ' / ' + g.count);
  }
  if (changed) saveQuests();
}

// ---- 承接、放棄、領獎 ----
function acceptQuest(q) {
  if (questStatus(q) !== 'available') return false;
  if (activeCount() >= SIDE_QUEST_RULES.maxActive) { sfx('error'); systemNotice('進行中的委託已經有 ' + SIDE_QUEST_RULES.maxActive + ' 個了', true); return false; }
  questState.active[q.id] = 0; saveQuests(); sfx('button');
  systemNotice('承接委託：「' + q.name + '」');
  return true;
}
function abandonQuest(q) { if (!(q.id in questState.active)) return; delete questState.active[q.id]; saveQuests(); sfx('switch'); }
function claimQuest(q) {
  if (questStatus(q) !== 'ready') return false;
  delete questState.active[q.id]; questState.done.push(q.id); saveQuests();
  const r = q.reward || {}, got = [];
  if (r.crystals) { earnCrystals(r.crystals); if (typeof showPickupToast === 'function') showPickupToast(r.crystals); got.push('異質碎片 ×' + r.crystals); }
  for (const [id, n] of Object.entries(r.items || {})) {
    const it = itemById(id); if (!it) continue;
    supplyInventory.set(id, (supplyInventory.get(id) || 0) + n); got.push(it.name + ' ×' + n);
  }
  if (r.items && typeof checkMemoryKeys === 'function') setTimeout(checkMemoryKeys, 600);   // 獎勵裡有回憶碎片時，集滿就拼成鑰匙
  if (r.favor && q.giver) {
    const before = favorInfo(q.giver);
    favorPoints[q.giver] = Math.max(0, (favorPoints[q.giver] || 0) + r.favor); got.push(charName(q.giver) + '好感度 +' + r.favor);
    const after = favorInfo(q.giver);
    if (after.lv > before.lv) { SFX.play('favorUp', .8, 'favor-up'); systemNotice('💗 ' + charName(q.giver) + '：好感度「' + after.name + '」'); }
  }
  SFX.play('crystalGet', .7, 'quest-claim');
  systemNotice('領取獎勵：' + got.join('、'));
  if (typeof updateHUD === 'function') updateHUD();
  return true;
}

// ---- 作戰桌「支線」分頁（js/missions.js 的 renderMissionBoard 呼叫）----
let sideSel = null;
const STATUS_LABEL = { available: '可承接', active: '進行中', ready: '可領取', done: '已完成' };
function sideRow(id, face, title, right, cls) {
  return '<button type="button" class="side-row ' + cls + (sideSel === id ? ' sel' : '') + '" data-side="' + id + '">' +
    (face ? '<img src="' + face + '" alt="">' : '<span class="side-face-empty"></span>') + '<b>' + title + '</b><span>' + right + '</span></button>';
}
function renderSideBoard() {
  const mems = memoryQuests();
  const order = { ready: 0, active: 1, available: 2, done: 3 };
  const quests = [...SIDE_QUESTS].sort((a, b) => order[questStatus(a)] - order[questStatus(b)]);
  const all = [...quests.map(q => q.id), ...mems.map(m => m.id)];
  if (!all.includes(sideSel)) sideSel = all[0] || null;
  const list =
    '<h4>角色委託 <small>進行中 ' + activeCount() + ' / ' + SIDE_QUEST_RULES.maxActive + '</small></h4>' +
    quests.map(q => { const s = questStatus(q), p = questState.active[q.id] ?? 0;
      return sideRow(q.id, charFace(q.giver), q.name, s === 'active' ? p + ' / ' + q.goal.count : STATUS_LABEL[s], s); }).join('') +
    '<h4>回憶</h4>' +
    (mems.length ? mems.map(m => sideRow(m.id, charFace(m.owner), m.name, m.hasKey ? '🔑 鑰匙' : '碎片 ' + m.have + ' / ' + m.mk.need, m.hasKey ? 'ready' : 'active')).join('')
      : '<p class="side-empty">拿到回憶碎片後，這裡會出現那個人的回憶。</p>');
  return '<div class="side-list">' + list + '</div><aside class="mission-detail side-detail">' + sideDetail(mems) + '</aside>';
}
function sideDetail(mems) {
  const mem = mems.find(m => m.id === sideSel);
  if (mem) {
    const it = itemById(mem.mk.shard), key = itemById(mem.mk.key);
    return '<div class="mission-detail-main">' +
      '<div class="side-giver">' + (charFace(mem.owner) ? '<img src="' + charFace(mem.owner) + '" alt="">' : '') + '<div><em class="mission-status ' + (mem.hasKey ? 'available' : '') + '">回憶</em><h3>' + mem.name + '</h3></div></div>' +
      '<div class="side-shards">' + Array.from({ length: mem.mk.need }, (_, i) => '<img src="' + it.image + '" alt="" class="' + (i < mem.have ? 'got' : '') + '">').join('') + '</div>' +
      '<p>' + (mem.hasKey
        ? '「' + key.name + '」已經拼好了。<br>找到記憶之門，就能看到這段回憶。<br><small>（記憶之門尚未開放）</small>'
        : '集滿 ' + mem.mk.need + ' 片「' + it.name + '」就能拼成鑰匙。<br>目前 ' + mem.have + ' / ' + mem.mk.need + '。<br><small>回憶碎片可以從「今日想吃」委託拿到。</small>') + '</p></div>';
  }
  const q = questById(sideSel);
  if (!q) return '<div class="mission-detail-main"><p>沒有委託。</p></div>';
  const s = questStatus(q), p = Math.min(q.goal.count, questState.active[q.id] ?? (s === 'done' ? q.goal.count : 0));
  const r = q.reward || {}, rewards = [
    r.crystals ? '◆ 異質碎片 ×' + r.crystals : '',
    ...Object.entries(r.items || {}).map(([id, n]) => { const it = itemById(id); return it ? '<img src="' + it.image + '" alt="">' + it.name + ' ×' + n : ''; }),
    r.favor ? '💗 ' + charName(q.giver) + '好感度 +' + r.favor : '',
  ].filter(Boolean);
  const btn = s === 'available' ? '<button type="button" class="mission-go side-accept">承接委託</button>'
    : s === 'ready' ? '<button type="button" class="mission-go side-claim">領取獎勵</button>'
    : s === 'active' ? '<button type="button" class="mission-team side-abandon">放棄委託</button>'
    : '<button type="button" class="mission-go" disabled>已完成</button>';
  return '<div class="mission-detail-main">' +
    '<div class="side-giver">' + (charFace(q.giver) ? '<img src="' + charFace(q.giver) + '" alt="">' : '') + '<div><em class="mission-status ' + (s === 'ready' || s === 'available' ? 'available' : s === 'done' ? 'cleared' : '') + '">' + charName(q.giver) + '的委託・' + STATUS_LABEL[s] + '</em><h3>' + q.name + '</h3></div></div>' +
    '<blockquote class="side-ask">「' + (s === 'done' || s === 'ready' ? q.thanks || q.ask : q.ask) + '」</blockquote>' +
    '<div class="side-goal"><span>' + (q.goal.text || '目標') + '</span><b>' + p + ' / ' + q.goal.count + '</b><i><u style="width:' + (p / q.goal.count * 100) + '%"></u></i></div>' +
    '<div class="side-rewards"><span>獎勵</span>' + rewards.map(x => '<em>' + x + '</em>').join('') + '</div></div>' + btn;
}
// 點「支線」分頁裡的東西（js/missions.js 的面板點擊呼叫）；回傳 true＝這裡處理掉了
function handleSideBoardClick(e) {
  const row = e.target.closest('[data-side]');
  if (row) { sideSel = row.dataset.side; sfx('blip'); renderMissionBoard(); return true; }
  const q = questById(sideSel);
  if (e.target.closest('.side-accept') && q) { acceptQuest(q); renderMissionBoard(); return true; }
  if (e.target.closest('.side-claim') && q) { if (claimQuest(q)) renderMissionBoard(); return true; }
  if (e.target.closest('.side-abandon') && q) { abandonQuest(q); renderMissionBoard(); return true; }
  return false;
}
