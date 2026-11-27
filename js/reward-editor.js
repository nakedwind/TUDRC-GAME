/* ===== 🏅 獎勵編輯器：BOSS 特別獎金、區域控制獎勵、全區控制獎勵 =====
   每一項都可以填「經費」（錢，$）和「異質碎片」，0＝不給。
   資料存在 data/rewards.js（REWARDS_DATA），遊戲的 js/missions.js 照這份發獎勵：
     ・BOSS：在任務地圖討伐後，回應變中心由通訊員報告並入帳（每次討伐都給）
     ・區域：每次控制都給（經費加進這次的作戰經費、回基地存進錢包）
     ・全區：作戰桌上所有區域都控制了，再多給一次
   改動會自動暫存在這台瀏覽器（跟專案檔自動合併，js/draft-sync.js），按「💾 存到專案」或「下載」才會寫進 data/rewards.js。 */
const REWARD_KEY = 'tudrc_rewards_v1';
const FILE_REWARDS = typeof REWARDS_DATA !== 'undefined' ? REWARDS_DATA : { bosses: [], zones: {}, allZones: { money: 0, crystals: 0 } };
const $ = id => document.getElementById(id);
// 戰鬥地圖（data/maps.js 的 BATTLE_MAPS；基地、劇情地圖不算）
const battleMaps = () => (typeof BATTLE_MAPS !== 'undefined' ? BATTLE_MAPS : []).filter(m => m && m.id && !m.safe && !m.story);
const num = v => Math.max(0, Math.floor(Number(v) || 0));
// 整理成存檔的樣子：每個數字都是 0 以上的整數；區域只留作戰桌上有的、不是 0 的
function cleanRewards(d) {
  const src = d && typeof d === 'object' ? d : {};
  const fileBoss = new Map((FILE_REWARDS.bosses || []).map(b => [b.id, b]));
  const bosses = (FILE_REWARDS.bosses || []).map(b => {   // BOSS 名單、標記照檔案的（程式用）；只有經費、碎片從暫存來
    const mine = (src.bosses || []).find(x => x && x.id === b.id) || b;
    return { id: b.id, name: b.name, flag: b.flag, money: num(mine.money), crystals: num(mine.crystals) };
  });
  for (const x of src.bosses || []) if (x && x.id && !fileBoss.has(x.id) && x.flag) bosses.push({ id: x.id, name: x.name || x.id, flag: x.flag, money: num(x.money), crystals: num(x.crystals) });
  const zones = {};
  for (const [id, r] of Object.entries(src.zones || {})) { const money = num(r && r.money), crystals = num(r && r.crystals); if (money || crystals) zones[id] = { money, crystals }; }
  const a = src.allZones || {};
  // 第一次進入的作戰經費：每張戰鬥地圖都存（沒填過的用地圖規則裡的舊經費當起始值）
  const entryFunds = {};
  for (const m of battleMaps()) { const v = (src.entryFunds || {})[m.id] ?? (FILE_REWARDS.entryFunds || {})[m.id] ?? (m.rules && m.rules.money); entryFunds[m.id] = num(v); }
  return { bosses, zones, allZones: { money: num(a.money), crystals: num(a.crystals) }, entryFunds };
}
let data = cleanRewards((typeof DraftSync !== 'undefined' && DraftSync.load(REWARD_KEY, FILE_REWARDS, { label: '獎勵' })) || FILE_REWARDS);

function setStatus(text, error = false) { const el = $('status'); el.textContent = text; el.style.color = error ? '#ffb4b4' : '#84ddbd'; }
function save() {
  data = cleanRewards(data);
  try { localStorage.setItem(REWARD_KEY, JSON.stringify(data)); setStatus('已自動暫存在這台瀏覽器；記得按「💾 存到專案」。'); }
  catch (_) { setStatus('暫存失敗：瀏覽器暫存空間不足。', true); }
  renderTotals();
}
// 一列：名稱＋經費＋碎片兩個輸入框
function row(label, sub, get, set, keys = ['money', 'crystals']) {
  const tr = document.createElement('tr');
  const name = document.createElement('td'); name.innerHTML = '<b></b><small></small>'; name.querySelector('b').textContent = label; name.querySelector('small').textContent = sub || '';
  tr.append(name);
  for (const key of keys) {
    const td = document.createElement('td'), inp = document.createElement('input');
    inp.type = 'number'; inp.min = 0; inp.step = key === 'money' ? 500 : 10; inp.value = get()[key] || 0;
    inp.setAttribute('aria-label', label + (key === 'money' ? ' 經費' : ' 異質碎片'));
    inp.onchange = () => { set(key, num(inp.value)); inp.value = num(inp.value); tr.classList.toggle('zero', !(get().money || get().crystals)); save(); };
    td.append(inp); tr.append(td);
  }
  tr.classList.toggle('zero', !(get().money || get().crystals));
  if (keys.length < 2) tr.append(document.createElement('td'));
  return tr;
}
function render() {
  const boss = $('bossRows'); boss.replaceChildren();
  for (const b of data.bosses) boss.append(row(b.name, b.id, () => b, (k, v) => { b[k] = v; }));
  const zone = $('zoneRows'); zone.replaceChildren();
  for (const m of (typeof MISSIONS !== 'undefined' ? MISSIONS : []).filter(m => m.map)) {
    const get = () => data.zones[m.id] || { money: 0, crystals: 0 };
    zone.append(row(m.name, m.id + (m.metroOnly ? '・搭捷運' : ''), get, (k, v) => { data.zones[m.id] = { ...get(), [k]: v }; }));
  }
  const fund = $('fundRows'); fund.replaceChildren();
  const zoneOf = id => (typeof MISSIONS !== 'undefined' ? MISSIONS : []).find(m => m.map === id);
  for (const m of battleMaps()) {
    const z = zoneOf(m.id);
    fund.append(row(z ? z.name : m.name, z ? '作戰桌：' + z.name + '（' + m.name + '）' : m.name + '（不在作戰桌上）', () => ({ money: data.entryFunds[m.id] || 0 }), (k, v) => { data.entryFunds[m.id] = v; }, ['money']));
  }
  const all = $('allRows'); all.replaceChildren();
  all.append(row('全區控制', '作戰桌上所有區域都控制了', () => data.allZones, (k, v) => { data.allZones[k] = v; }));
  renderTotals();
}
// 下面的合計：照現在填的數字，全部打完能拿多少（BOSS 各打一次）
function renderTotals() {
  const sum = (list, k) => list.reduce((s, r) => s + num(r[k]), 0);
  const zones = Object.values(data.zones), b = data.bosses, a = [data.allZones];
  const zoneMaps = new Set((typeof MISSIONS !== 'undefined' ? MISSIONS : []).map(m => m.map).filter(Boolean));
  const entry = Object.entries(data.entryFunds).filter(([id]) => zoneMaps.has(id)).reduce((s, [, v]) => s + num(v), 0);
  $('totals').textContent = '合計（作戰桌各區第一次進入＋BOSS 各打一次＋所有區域＋全區）：經費 $' + (entry + sum(b, 'money') + sum(zones, 'money') + sum(a, 'money')).toLocaleString()
    + '、異質碎片 ' + (sum(b, 'crystals') + sum(zones, 'crystals') + sum(a, 'crystals')).toLocaleString();
}
// 匯出成 data/rewards.js 的內容（遊戲、對話編輯器都讀這份）
function exportSource() {
  const d = cleanRewards(data);
  const lines = ['/* 獎勵設定（由「🏅 獎勵編輯器」匯出）：經費＝錢（$）、碎片＝異質碎片。0＝不給。',
    '   ・bosses：BOSS 特別獎金。在任務地圖討伐後，回應變中心由通訊員報告並入帳（每次討伐都給，重新出擊再打倒可以再領；js/missions.js）',
    '       flag＝怪物身上用來認出這隻 BOSS 的標記（程式用，不要改）；台詞在對話編輯器「報告任務」的 bounty_id（{money}＝經費、{crystals}＝碎片）',
    '   ・zones：區域控制獎勵。每次控制都給（打贏結算畫面；新手區看完救援劇情那次也算），重新出擊再清一次可以再領，經費加進這次的作戰經費、回基地存進錢包',
    '   ・allZones：全區控制獎勵。作戰桌上所有區域都控制了，再多給一次（只給一次）',
    '   ・entryFunds：第一次進入的作戰經費（地圖 id → 經費）。每張戰鬥地圖第一次進去時撥一次（js/maploader.js 讀；沒寫的地圖才用地圖編輯器「規則」裡舊的經費） */',
    'const REWARDS_DATA = {',
    '  "bosses": [',
    d.bosses.map(b => '    ' + JSON.stringify(b).replace(/,"/g, ', "').replace(/":/g, '": ').replace(/^\{/, '{ ').replace(/\}$/, ' }')).join(',\n'),
    '  ],',
    '  "zones": ' + JSON.stringify(d.zones, null, 2).replace(/\n/g, '\n  ') + ',',
    '  "entryFunds": ' + JSON.stringify(d.entryFunds, null, 2).replace(/\n/g, '\n  ') + ',',
    '  "allZones": ' + JSON.stringify(d.allZones).replace(/,"/g, ', "').replace(/":/g, '": ').replace(/^\{/, '{ ').replace(/\}$/, ' }'),
    '};',
    '// 遊戲和對話編輯器讀這個名字（js/missions.js、js/dialogue-editor.js）',
    'const BOSS_BOUNTIES = REWARDS_DATA.bosses;', ''];
  return lines.join('\r\n');
}
$('download').onclick = () => {
  const url = URL.createObjectURL(new Blob([exportSource()], { type: 'text/javascript' })), a = document.createElement('a');
  a.href = url; a.download = 'rewards.js'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  setStatus('已下載 rewards.js；放進 data 資料夾覆蓋就會生效。');
};
$('reload').onclick = () => {
  if (!confirm('丟棄瀏覽器裡還沒存到專案的獎勵，重新載入 data/rewards.js？')) return;
  localStorage.removeItem(REWARD_KEY); data = cleanRewards(FILE_REWARDS); render(); setStatus('已從 data/rewards.js 重新載入。');
};
render();
