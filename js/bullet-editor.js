/* ===== 🔫 彈藥編輯器 =====
   改特殊子彈的數值：射擊間隔、傷害、範圍、秒數…，存到 data/bullet-tuning.js（遊戲讀的就是這一份）。
   子彈的名字、圖、顏色從 data/equipment.js 的 BULLETS 拿；一組幾發（BULLET_SET）、價錢（開發工坊編輯器）不在這裡改。
   每張卡片下面的「對怪物實際」是照遊戲的算法算出來的（乘上對怪物倍率、大型怪物減半），跟 js/special-guns.js 一樣。 */

const BULLET_DRAFT_KEY = 'tudrc_bullet_tuning_v1';   // 瀏覽器暫存
const BULLET_FILE_PATH = 'data/bullet-tuning.js';

// 每個欄位的說明：label 名稱、unit 單位、tip 白話說明、foe＝打怪物會乘倍率、big＝大型怪物減半、int＝只能整數、max＝最大值
const BULLET_FIELD_INFO = {
  gap:      { label: '射擊間隔', unit: '秒', tip: '兩發之間至少隔幾秒（越小打越快）' },
  shine:    { label: '照明時間', unit: '秒', tip: '落地後亮幾秒' },
  range:    { label: '射程', unit: '格', tip: '最遠打幾格' },
  r:        { label: '範圍半徑', unit: '格', tip: '影響範圍的半徑' },
  burn:     { label: '火海持續', unit: '秒', tip: '火海燒幾秒' },
  fireDps:  { label: '火海每秒傷害', unit: '', tip: '站在火海裡每秒扣多少（隊員、溫特照這個數字，怪物乘倍率）', foe: true },
  ignite:   { label: '身上著火', unit: '秒', tip: '被炸到的怪物離開火海後還會燒幾秒（0＝不著火）', foe: true },
  burnDmg:  { label: '著火每秒傷害', unit: '', tip: '身上著火時每秒扣多少', foe: true },
  sleep:    { label: '睡眠時間', unit: '秒', tip: '打中的怪物睡幾秒（隊員照這個數字）', foe: true, big: true },
  mist:     { label: '麻醉霧半徑', unit: '格', tip: '打中後附近的怪物也一起睡（0＝沒有麻醉霧）' },
  pellets:  { label: '一次幾顆', unit: '顆', tip: '扇形噴出幾顆小子彈', int: true },
  spread:   { label: '扇形角度', unit: '弧度', tip: '越大越散（0.5 ≈ 29 度、0.7 ≈ 40 度）' },
  dmg:      { label: '傷害', unit: '', tip: '打中扣多少血', foe: true },
  near:     { label: '全傷害距離', unit: '格', tip: '這個距離以內每顆都是全傷害，越遠越弱' },
  farMul:   { label: '射程盡頭剩幾成', unit: '倍', tip: '打到射程最遠處時，每顆只剩幾倍傷害（0～1）', max: 1 },
  stun:     { label: '暈眩時間', unit: '秒', tip: '暈幾秒（隊員照這個數字）', foe: true },
  chain:    { label: '最多再跳幾隻', unit: '隻', tip: '電流從打中的那隻跳到附近幾隻', int: true },
  chainR:   { label: '跳躍距離', unit: '格', tip: '電流最遠跳幾格' },
  heal:     { label: '補血量', unit: 'HP', tip: '打中誰就補誰（怪物也會補）' },
  stick:    { label: '黏膠留多久', unit: '秒', tip: '黏膠留在地上幾秒' },
  slow:     { label: '踩到剩幾成速度', unit: '倍', tip: '踩進黏膠時的速度（0.2＝剩兩成；怪物再除以倍率，更慢）', max: 1 },
  speed:    { label: '飛行速度', unit: '像素/秒', tip: '子彈飛多快' },
  push:     { label: '擊退距離', unit: '格', tip: '把怪物往後推幾格', foe: true },
  slide:    { label: '推出去花幾秒', unit: '秒', tip: '被推的過程多久（這段時間不能動）' },
  wallStun: { label: '撞牆暈眩', unit: '秒', tip: '推去撞到牆壁或建築暈幾秒', foe: true, big: true },
  wallDmg:  { label: '撞牆傷害', unit: '', tip: '撞到牆再扣多少', foe: true },
  confuse:  { label: '混亂時間', unit: '秒', tip: '不理溫特和隊員，改打身邊的怪物', foe: true, big: true },
  brawl:    { label: '回手時間', unit: '秒', tip: '被混亂的怪物打到的那隻，回頭打牠幾秒', foe: true },
};
// 同一個欄位在不同子彈的叫法不一樣
const BULLET_FIELD_OVERRIDE = {
  shock: { stun: { label: '麻痺時間', tip: '觸電後麻痺幾秒（不怕電的怪物不會麻痺）' }, dmg: { tip: '打中的那隻扣多少；跳出去的扣 7 成' } },
  split: { dmg: { label: '每顆傷害' } },
  sticky: { r: { label: '黏膠半徑' } },
  flash: { r: { label: '閃光半徑' }, stun: { label: '暈眩時間', big: true }, range: { tip: '最遠丟幾格' } },
  incendiary: { r: { label: '火海半徑' }, range: { tip: '最遠丟幾格（拋物線，會飛過怪物頭上）' } },
};
const fieldInfo = (id, k) => Object.assign({ label: k, unit: '', tip: '' }, BULLET_FIELD_INFO[k], (BULLET_FIELD_OVERRIDE[id] || {})[k]);

// 子彈卡片下面的「對怪物實際」：照遊戲的算法（js/special-guns.js）
const fmt = v => (Math.round(v * 100) / 100).toString();
function bulletSummary(id, b, foe) {
  const half = '（大型怪物一半）';
  switch (id) {
    case 'flare': return '落地亮 ' + fmt(b.shine) + ' 秒';
    case 'incendiary': return '火海每秒 ' + fmt(b.fireDps * foe) + '，燒 ' + fmt(b.burn) + ' 秒' + (b.ignite > 0 ? '；離開後再燒 ' + fmt(b.ignite * foe) + ' 秒（每秒 ' + fmt(b.burnDmg * foe) + '，共 ' + fmt(b.ignite * foe * b.burnDmg * foe) + '）' : '；不會著火');
    case 'tranq': return '睡 ' + fmt(b.sleep * foe) + ' 秒' + half + (b.mist > 0 ? '，附近 ' + fmt(b.mist) + ' 格一起睡' : '');
    case 'paint': return '標記怪物，讓隊員優先集火';
    case 'split': return '貼臉全中最多 ' + fmt(b.pellets * b.dmg * foe) + '；射程盡頭每顆 ' + fmt(b.dmg * foe * b.farMul);
    case 'flash': return '半徑 ' + fmt(b.r) + ' 格內暈 ' + fmt(b.stun * foe) + ' 秒' + half;
    case 'shock': return '主目標 ' + fmt(Math.round(b.dmg * foe)) + '，跳出去的每隻 ' + fmt(Math.round(b.dmg * foe * .7)) + '（最多 ' + b.chain + ' 隻），麻痺 ' + fmt(b.stun * foe) + ' 秒';
    case 'heal': return '補 ' + fmt(b.heal) + ' HP（怪物不乘倍率）';
    case 'sticky': return '怪物剩 ' + fmt(b.slow / foe * 100) + '% 速度、隊員剩 ' + fmt(b.slow * 100) + '%，留 ' + fmt(b.stick) + ' 秒';
    case 'knock': return '傷害 ' + fmt(b.dmg * foe) + '，推 ' + fmt(b.push * foe) + ' 格；撞牆再 ' + fmt(b.wallDmg * foe) + '、暈 ' + fmt(b.wallStun * foe) + ' 秒' + half;
    case 'confuse': return '混亂 ' + fmt(b.confuse * foe) + ' 秒' + half + '，被打的回手 ' + fmt(b.brawl * foe) + ' 秒';
  }
  return '';
}

// ---- 資料 ----
const fromFile = () => JSON.parse(JSON.stringify(BULLET_TUNING));
let fileData = fromFile();
let data = (typeof DraftSync !== 'undefined' ? DraftSync.load(BULLET_DRAFT_KEY, fileData, { label: '彈藥數值' }) : null) || fromFile();
// 檔案有、暫存沒有的欄位補上（例如之後新增的欄位）
function normalize() {
  if (!Number.isFinite(data.foeMul)) data.foeMul = fileData.foeMul;
  if (!Number.isFinite(data.bigHp)) data.bigHp = fileData.bigHp;
  if (!Array.isArray(data.off)) data.off = Array.isArray(fileData.off) ? fileData.off.slice() : [];   // 停用的子彈
  if (!Array.isArray(fileData.off)) fileData.off = [];
  data.bullets = data.bullets || {};
  for (const id in fileData.bullets) {
    data.bullets[id] = data.bullets[id] || {};
    for (const k in fileData.bullets[id]) if (!Number.isFinite(data.bullets[id][k])) data.bullets[id][k] = fileData.bullets[id][k];
  }
}
normalize();

// ---- 存檔文字（格式跟 data/bullet-tuning.js 一樣，沒改的話存出來一模一樣）----
function exportSource() {
  const ids = Object.keys(data.bullets);
  return '/* ===== 特殊子彈的數值（由「🔫 彈藥編輯器」存出來）=====\n' +
    '   遊戲和彈藥編輯器都讀這一份；子彈的名字、圖、說明、一組幾發還是在 data/equipment.js 的 BULLETS。\n' +
    '   遊戲載入時，下面 bullets 裡每種子彈的數字會蓋進 BULLETS（data/equipment.js 最後面）。\n' +
    '   foeMul：打「怪物」時，傷害、睡／暈／麻痺／混亂秒數、擊退距離、黏膠減速都乘上這個數（打到溫特、隊員照原本的數字）\n' +
    '   bigHp：血量多少以上算大型怪物（麻醉、閃光、混亂、撞牆暈的秒數減半）\n' +
    '   off：停用的子彈（遊戲裡當作沒有這種子彈：背包、商店、置物櫃、彈藥箱都不會出現；數值留著，取消停用就回來）\n' +
    '   整段貼回 data/bullet-tuning.js 覆蓋即可。 */\n' +
    'const BULLET_TUNING = {\n' +
    '  "foeMul": ' + JSON.stringify(data.foeMul) + ',\n' +
    '  "bigHp": ' + JSON.stringify(data.bigHp) + ',\n' +
    (data.off.length ? '  "off": ' + JSON.stringify(data.off).replace(/,/g, ', ') + ',\n' : '') +
    '  "bullets": {\n' +
    ids.map(id => '    ' + JSON.stringify(id) + ': { ' + Object.keys(data.bullets[id]).map(k => JSON.stringify(k) + ': ' + JSON.stringify(data.bullets[id][k])).join(', ') + ' }').join(',\n') + '\n' +
    '  }\n' +
    '};\n';
}

// ---- 畫面 ----
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function setStatus(msg, err) { const el = $('status'); el.textContent = msg; el.style.color = err ? '#ff9c8f' : '#8ce0be'; }
function saveDraft() {
  try { localStorage.setItem(BULLET_DRAFT_KEY, JSON.stringify(data)); setStatus('已自動儲存在這台瀏覽器。按「💾 存到專案」後，遊戲重新整理才會套用。'); }
  catch (e) { setStatus('瀏覽器暫存失敗：' + e.message, true); }
  updateDirty();
}
function changedCount() {
  let n = (data.foeMul !== fileData.foeMul) + (data.bigHp !== fileData.bigHp);
  for (const id in data.bullets) if (isOff(id) !== fileData.off.includes(id)) n++;   // 停用／取消停用也算一個修改
  for (const id in data.bullets) for (const k in data.bullets[id]) if (data.bullets[id][k] !== (fileData.bullets[id] || {})[k]) n++;
  return n;
}
function updateDirty() {
  const n = changedCount();
  $('dirty').textContent = n ? '還有 ' + n + ' 個數值跟專案檔不一樣（尚未存到專案）' : '跟專案檔一樣';
  $('dirty').classList.toggle('warn', !!n);
}

// 數字輸入框：改了就存暫存、更新說明
function numInput(value, fileValue, opts, onChange) {
  const wrap = document.createElement('label');
  wrap.className = 'field' + (value !== fileValue ? ' changed' : '');
  wrap.title = opts.tip || '';
  wrap.innerHTML = '<span class="f-label">' + esc(opts.label) + (opts.unit ? '<em>' + esc(opts.unit) + '</em>' : '') + (opts.foe ? '<b class="tag foe" title="打怪物時乘上對怪物倍率">×倍率</b>' : '') + (opts.big ? '<b class="tag big" title="大型怪物秒數減半">大型減半</b>' : '') + '</span>' +
    '<input type="number" step="any" min="0"' + (opts.max != null ? ' max="' + opts.max + '"' : '') + '>' +
    '<small>' + esc(opts.tip || '') + (value !== fileValue ? '　<span class="was">專案檔：' + fileValue + '</span>' : '') + '</small>';
  const inp = wrap.querySelector('input');
  inp.value = value;
  inp.addEventListener('change', () => {
    let v = Number(inp.value);
    if (!Number.isFinite(v) || v < 0) { setStatus('「' + opts.label + '」要填 0 以上的數字', true); inp.value = value; return; }
    if (opts.int) v = Math.round(v);
    if (opts.max != null) v = Math.min(opts.max, v);
    onChange(v);
  });
  return wrap;
}

function renderGlobal() {
  const box = $('globalFields'); box.innerHTML = '';
  box.appendChild(numInput(data.foeMul, fileData.foeMul, { label: '對怪物倍率', unit: '倍', tip: '打怪物時，標「×倍率」的數字都乘上這個數；打到溫特、隊員照原本' }, v => { data.foeMul = v; saveDraft(); render(); }));
  box.appendChild(numInput(data.bigHp, fileData.bigHp, { label: '大型怪物門檻', unit: 'HP', tip: '血量這麼多以上算大型怪物，標「大型減半」的秒數只有一半', int: true }, v => { data.bigHp = v; saveDraft(); render(); }));
  // 哪些怪物算大型（怪物編輯器的血量）
  const list = typeof MONSTERS_DEFAULT !== 'undefined' ? MONSTERS_DEFAULT.filter(m => m && m.hp && m.name) : [];
  const big = list.filter(m => m.hp >= data.bigHp).sort((a, b) => a.hp - b.hp), small = list.filter(m => m.hp < data.bigHp).sort((a, b) => a.hp - b.hp);
  $('bigList').innerHTML = list.length ? '<b>算大型怪物（秒數減半）：</b>' + (big.map(m => esc(m.name) + ' ' + m.hp).join('、') || '沒有') + '<br><b>一般怪物（吃滿秒數）：</b>' + (small.map(m => esc(m.name) + ' ' + m.hp).join('、') || '沒有') : '';
  // 手槍傷害當參考
  const lv = (typeof WEAPON_UPGRADES !== 'undefined' && WEAPON_UPGRADES.pistol) ? WEAPON_UPGRADES.pistol.levels : [];
  $('pistolRef').innerHTML = lv.length ? '<b>參考：一般子彈（手槍）每發傷害</b> ' + lv.map((l, i) => 'Lv' + (i + 1) + '＝' + l.dmg).join('、') + '（一般子彈不乘倍率）' : '';
}

// 這種子彈有沒有停用（停用＝遊戲裡拿不到、看不到）
const isOff = id => data.off.includes(id);
function renderBullets() {
  const box = $('bulletList'); box.innerHTML = '';
  for (const id in data.bullets) {
    const b = data.bullets[id], f = fileData.bullets[id] || {}, meta = (typeof BULLETS !== 'undefined' && BULLETS[id]) || { name: id };
    const card = document.createElement('section');
    card.className = 'bullet'; card.id = 'b-' + id;
    card.style.setProperty('--c', meta.color || '#8fd3ff');
    const off = isOff(id), changed = Object.keys(b).some(k => b[k] !== f[k]) || off !== fileData.off.includes(id);
    if (off) card.classList.add('off');
    card.innerHTML = '<header><span class="b-icon">' + (meta.image ? '<img src="' + esc(meta.image) + '" alt="">' : esc(meta.icon || '')) + '</span>' +
      '<h2>' + esc(meta.name) + '</h2><code>' + esc(id) + '</code>' +
      '<label class="off-toggle" title="停用＝遊戲裡當作沒有這種子彈：背包、商店、置物櫃、彈藥箱都不會出現；數值會留著，取消勾選就回來"><input type="checkbox"' + (off ? ' checked' : '') + '> 🚫 停用</label>' +
      (changed ? '<button type="button" class="small revert">還原成專案檔</button>' : '') + '</header>' +
      (off ? '<p class="off-note">已停用：遊戲裡拿不到、背包和商店都看不到這種子彈。</p>' : '') +
      '<div class="fields"></div><p class="summary"><b>對怪物實際：</b>' + esc(bulletSummary(id, b, data.foeMul)) + '</p>';
    const fields = card.querySelector('.fields');
    for (const k in b) fields.appendChild(numInput(b[k], f[k], fieldInfo(id, k), v => { b[k] = v; saveDraft(); render(); }));
    card.querySelector('.off-toggle input').addEventListener('change', e => {
      data.off = data.off.filter(x => x !== id); if (e.target.checked) data.off.push(id);
      saveDraft(); render(); setStatus(meta.name + (e.target.checked ? '已停用' : '已取消停用') + '（按「💾 存到專案」後遊戲才會套用）');
    });
    const rv = card.querySelector('.revert');
    if (rv) rv.addEventListener('click', () => { data.bullets[id] = JSON.parse(JSON.stringify(f)); data.off = data.off.filter(x => x !== id); if (fileData.off.includes(id)) data.off.push(id); saveDraft(); render(); setStatus(meta.name + '已還原成專案檔的數值'); });
    box.appendChild(card);
  }
  // 左邊的目錄
  $('toc').innerHTML = Object.keys(data.bullets).map(id => {
    const meta = (typeof BULLETS !== 'undefined' && BULLETS[id]) || { name: id };
    const changed = Object.keys(data.bullets[id]).some(k => data.bullets[id][k] !== (fileData.bullets[id] || {})[k]) || isOff(id) !== fileData.off.includes(id);
    return '<a href="#b-' + id + '"' + (changed ? ' class="changed"' : '') + '>' + esc(meta.name) + (isOff(id) ? '（停用）' : '') + '</a>';
  }).join('');
}

function render() {
  const y = window.scrollY;
  renderGlobal(); renderBullets(); updateDirty();
  if (!$('exportOut').hidden) $('exportOut').value = exportSource();
  window.scrollTo(0, y);
}

$('download').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([exportSource()], { type: 'text/javascript' }));
  a.download = 'bullet-tuning.js'; a.click(); URL.revokeObjectURL(a.href);
  setStatus('已下載 bullet-tuning.js：放進遊戲資料夾的 data/（取代原本的檔案），再重新整理遊戲。');
});
$('showExport').addEventListener('click', () => { const o = $('exportOut'); o.hidden = !o.hidden; if (!o.hidden) o.value = exportSource(); });
$('reset').addEventListener('click', () => {
  if (changedCount() && !confirm('丟掉這台瀏覽器裡還沒存到專案的修改，改回專案檔的數值？')) return;
  data = fromFile(); normalize();
  try { localStorage.removeItem(BULLET_DRAFT_KEY); } catch (_) {}
  if (typeof DraftSync !== 'undefined') DraftSync.forget(BULLET_DRAFT_KEY);
  render(); setStatus('已改回專案檔的數值');
});

render();
if (typeof ProjectSave !== 'undefined')
  ProjectSave.attach({ after: ['download'], files: [{ path: BULLET_FILE_PATH, label: '彈藥數值', text: () => exportSource() }],
    status: (m, e) => { setStatus(m, e); if (!e && /^已存到專案/.test(m)) { fileData = JSON.parse(JSON.stringify(data)); render(); } } });   // 存好了：專案檔＝目前的數值，「不一樣」的標示歸零
