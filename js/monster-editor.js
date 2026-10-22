let monsters = monsterCatalog(true);
let selectedId = monsters[0].id;
const listEl = document.getElementById('monsterList');
const fields = [...document.querySelectorAll('[data-field]')];
const currentMonster = () => monsters.find(monster => monster.id === selectedId) || monsters[0];
function status(text, error = false) {
  const el = document.getElementById('status');
  el.textContent = text; el.style.color = error ? '#ffb4b4' : '#84ddbd';
}
let slimeCfg = slimeSettings(true);
function saveMonsters() {
  try {
    localStorage.setItem(MONSTER_STORAGE_KEY, JSON.stringify(monsters));
    localStorage.setItem(SLIME_SETTINGS_STORAGE_KEY, JSON.stringify(slimeCfg));
    status('已自動儲存到這台瀏覽器。');
  } catch (_) { status('儲存失敗：瀏覽器暫存空間不足。', true); }
}
function previewSprite(monster) {
  const image = document.getElementById('spritePreview');
  const error = document.getElementById('spriteError');
  error.textContent = '';
  image.onload = () => { error.textContent = ''; };
  image.onerror = () => { error.textContent = '找不到圖片，請確認路徑與檔名。'; };
  image.src = monster.sprite;
}
function renderList() {
  listEl.replaceChildren();
  const term = document.getElementById('search').value.trim().toLowerCase();
  monsters.filter(monster => !term || (monster.name + ' ' + monster.id).toLowerCase().includes(term)).forEach(monster => {
    const button = document.createElement('button'); button.type = 'button';
    if (monster.id === selectedId) button.classList.add('selected');
    const image = document.createElement('img'); image.src = monster.sprite; image.alt = '';
    const label = document.createElement('span');
    const name = document.createElement('b'); name.textContent = monster.name;
    const id = document.createElement('small'); id.textContent = monster.id;
    label.append(name, id); button.append(image, label);
    button.addEventListener('click', () => { selectedId = monster.id; render(); });
    listEl.append(button);
  });
  if (!listEl.children.length) listEl.textContent = '沒有符合的異質體';
}
function render() {
  const monster = currentMonster();
  selectedId = monster.id;
  document.getElementById('editingTitle').textContent = monster.name + '・資料';
  document.getElementById('f_id').value = monster.id;
  fields.forEach(input => { input.value = monster[input.dataset.field]; });
  document.getElementById('f_behavior').value = monster.behavior || '';
  document.getElementById('deleteMonster').disabled = monsters.length <= 1;
  previewSprite(monster); renderList(); renderBehaviorFields(monster);
}
// 衝撞型（鳥頭人）的行為數值：欄位由 js/monster-data.js 的 CHARGER_FIELDS 產生
// 行為數值：依怪物的行為模式顯示對應欄位（欄位表在 js/monster-data.js）
const BEHAVIOR_UI = {
  burrow: { key: 'burrow', fields: () => BURROW_FIELDS, valid: c => validBurrowCfg(c), title: '🐭 鑽地出土／地底伸手',
    desc: '鑽地後瞬移到目標附近，使用「地洞剛出現」出土。本體周圍 5×5 格內可以伸手：目標在左邊用左手，右邊用右手。出手前鎖定地面並預警，可移動閃避；本體躲回去或死亡後，原地洞保留 5 秒。手的洞隨攻擊結束消失。洞口所在格暫時不能行走或放置建築，洞消失後恢復。' },
  charger: { key: 'charger', fields: () => CHARGER_FIELDS, valid: c => validChargerCfg(c), title: '🐦 衝撞行為',
    desc: '平時發呆、偶爾散步；玩家或哨兵進入注意範圍（中間沒有牆）就愣一下，然後直線衝過去，撞到會把人撞飛。玩家一出現就只追玩家，哨兵的嘲諷也引不走。' },
  shooter: { key: 'shooter', fields: () => SHOOTER_FIELDS, valid: c => validShooterCfg(c), title: '🫧 飄浮噴珍珠',
    desc: '半浮在空中慢慢移動；看到玩家或哨兵就飄到射程內，手上的珍珠閃一下後噴出珍珠，太近會往後飄。地圖上有異質核心醒著時變成生氣的紅眼圖，噴得比較快。每顆珍珠的傷害用上面的「攻擊玩家／哨兵／建築」。' },
};
function renderBehaviorFields(monster) {
  const box = document.getElementById('chargerBox'), wrap = document.getElementById('chargerFields');
  const ui = BEHAVIOR_UI[monster.behavior];
  document.getElementById('burrowPreviewBox').hidden = monster.behavior !== 'burrow';
  box.hidden = !ui;
  wrap.replaceChildren();
  if (box.hidden) return;
  document.getElementById('behaviorTitle').textContent = ui.title;
  document.getElementById('behaviorDesc').textContent = ui.desc;
  monster[ui.key] = ui.valid(monster[ui.key]);
  const cfg = () => monster[ui.key];
  for (const f of ui.fields()) {
    const label = document.createElement('label'), input = document.createElement('input');
    label.textContent = f.label;
    input.type = 'number'; input.step = f.pct ? 5 : f.step;
    input.min = f.pct ? f.min * 100 : f.min; input.max = f.pct ? f.max * 100 : f.max;
    const show = () => { input.value = f.pct ? Math.round(cfg()[f.key] * 100) : cfg()[f.key]; };
    show();
    input.title = '預設 ' + (f.pct ? Math.round(f.def * 100) + '%' : f.def);
    input.addEventListener('change', () => {
      const n = Number(input.value);
      cfg()[f.key] = f.pct ? n / 100 : n;
      monster[ui.key] = ui.valid(cfg());   // 夾在合理範圍內（發呆最長不會小於最短）
      show(); saveMonsters();
    });
    label.append(input); wrap.append(label);
  }
}
function newMonsterId() {
  let n = 2;
  while (monsters.some(monster => monster.id === 'monster_' + n)) n++;
  return 'monster_' + n;
}
function addMonster(copy = false) {
  const source = currentMonster();
  const monster = { ...source, id: newMonsterId(), name: copy ? source.name + '（複製）' : '新異質體' };
  if (source.charger) monster.charger = { ...source.charger };
  if (source.shooter) monster.shooter = { ...source.shooter };
  if (source.burrow) monster.burrow = { ...source.burrow };
  monsters.push(monster); selectedId = monster.id;
  saveMonsters(); render();
  document.getElementById('f_name').focus(); document.getElementById('f_name').select();
}
document.getElementById('addMonster').addEventListener('click', () => addMonster(false));
document.getElementById('f_behavior').addEventListener('change', e => {
  const m = currentMonster();
  if (e.target.value) m.behavior = e.target.value; else delete m.behavior;
  if (m.behavior === 'burrow') {
    m.burrow = validBurrowCfg(m.burrow);
    m.art = { ...BURROW_MOUSE_ART, ...(m.art || {}) };
    m.noHitSquash = true;
  }
  saveMonsters(); renderBehaviorFields(m);
});
document.getElementById('duplicateMonster').addEventListener('click', () => addMonster(true));
document.getElementById('deleteMonster').addEventListener('click', () => {
  if (monsters.length <= 1) return;
  const monster = currentMonster();
  if (!confirm('刪除「' + monster.name + '」？已選用它的地圖會改用可用的其他異質體。')) return;
  monsters = monsters.filter(item => item.id !== monster.id);
  selectedId = monsters[0].id; saveMonsters(); render();
});
document.getElementById('search').addEventListener('input', renderList);
fields.forEach(input => input.addEventListener(input.dataset.field === 'name' ? 'input' : 'change', () => {
  const monster = currentMonster(), key = input.dataset.field;
  if (input.type === 'number') {
    const min = Number(input.min) || 0;
    monster[key] = Math.max(min, Math.floor(Number(input.value) || min));
    input.value = monster[key];
  } else {
    monster[key] = input.value.trim() || (key === 'name' ? monster.id : 'images/monster/Monster_Slime.png');
  }
  saveMonsters();
  if (monster.id === 'slime') renderSlimeTable();   // 基本史萊姆變了，各種類的實際數值跟著更新
  if (key === 'name') { document.getElementById('editingTitle').textContent = monster.name + '・資料'; renderList(); }
  if (key === 'sprite') { previewSprite(monster); renderList(); }
}));
function exportText() {
  return '/* 怪物種類資料：由怪物編輯器匯出。地圖只記錄種類 ID 與權重。 */\n'
    + 'const MONSTERS_DEFAULT = ' + JSON.stringify(validMonsterCatalog(monsters), null, 2) + ';\n'
    + '/* 史萊姆種類（由怪物編輯器匯出）：數值是「基本史萊姆」的倍率；chance 為生成時變成這種的機率（0～1），unlockAt 為開戰幾秒後才會出現。 */\n'
    + 'const SLIME_SETTINGS_DEFAULT = ' + JSON.stringify(validSlimeSettings(slimeCfg), null, 2) + ';\n';
}

// ================= 史萊姆種類 =================
// 靠機率出現的種類（巨型靠時間、小史萊姆靠分裂、一般史萊姆是預設）
const SLIME_ROLLED = new Set(['splitter', 'bomber', 'spitter']);
const SLIME_COLS = [
  { key: 'chance', step: 1, min: 0, max: 100, pct: true },
  { key: 'unlockAt', step: 5, min: 0 },
  { key: 'hpMul', step: .05, min: .05 }, { key: 'speedMul', step: .05, min: .05 },
  { key: 'dmgMul', step: .05, min: 0 }, { key: 'rewardMul', step: .05, min: 0 },
  { key: 'scale', step: .05, min: .2 }, { key: 'hue', step: 5, min: -180, max: 180 },
];
const slimeBody = document.querySelector('#slimeTable tbody');
function slimeBase() { return monsters.find(m => m.id === 'slime') || monsters[0]; }
function slimeActualText(v) {
  const b = slimeBase(), r = n => Math.round(n);
  return `血量 ${r(b.hp * v.hpMul)}・速度 ${r(b.speed * v.speedMul)}<br>攻擊 玩家 ${r(b.playerDamage * v.dmgMul)}／哨兵 ${r(b.sentryDamage * v.dmgMul)}／建築 ${r(b.buildingDamage * v.dmgMul)}<br>獎勵 經費 ${r(b.reward * v.rewardMul)}・結晶 ${r(b.crystals * v.rewardMul)}`;
}
function slimeThumb(img, v) {
  const b = slimeBase(), k = Math.min(1.2, .9 * v.scale);
  img.src = b.sprite; img.style.width = Math.round((b.width || 42) * k) + 'px'; img.style.height = Math.round((b.height || 33) * k) + 'px';
  img.style.filter = v.hue ? `hue-rotate(${v.hue}deg) saturate(1.35)` : '';
}
function renderSlimeTable() {
  slimeBody.replaceChildren();
  for (const v of slimeCfg.variants) {
    const tr = document.createElement('tr');
    const thumbTd = document.createElement('td'), thumb = document.createElement('div'), img = new Image();
    thumb.className = 'slime-thumb'; thumb.append(img); thumbTd.append(thumb); slimeThumb(img, v);
    const nameTd = document.createElement('td'), name = document.createElement('input');
    name.className = 'name'; name.value = v.name; name.maxLength = 40;
    name.addEventListener('input', () => { v.name = name.value.trim() || v.id; saveMonsters(); });
    nameTd.append(name); tr.append(thumbTd, nameTd);
    const actual = document.createElement('td'); actual.className = 'actual'; actual.innerHTML = slimeActualText(v);
    for (const col of SLIME_COLS) {
      const td = document.createElement('td');
      if ((col.key === 'chance' || col.key === 'unlockAt') && !SLIME_ROLLED.has(v.id)) {
        td.className = 'na'; td.textContent = v.id === 'giant' ? '依下方時間' : v.id === 'mini' ? '分裂時出現' : '預設';
      } else if (v.id === 'normal' && col.key !== 'hue') {
        td.className = 'na'; td.textContent = '1';   // 一般史萊姆就是基準，倍率固定 1
      } else {
        const input = document.createElement('input'); input.type = 'number'; input.step = col.step; input.min = col.min;
        if (col.max != null) input.max = col.max;
        const show = () => { input.value = col.pct ? Math.round(v[col.key] * 1000) / 10 : v[col.key]; };
        show();
        input.addEventListener('change', () => {
          let n = Number(input.value); if (!Number.isFinite(n)) n = col.min;
          v[col.key] = col.pct ? n / 100 : n;
          slimeCfg = validSlimeSettings(slimeCfg);   // 夾在合理範圍內
          Object.assign(v, slimeCfg.variants.find(x => x.id === v.id));
          slimeCfg.variants[slimeCfg.variants.findIndex(x => x.id === v.id)] = v;
          show(); actual.innerHTML = slimeActualText(v); slimeThumb(img, v); saveMonsters();
        });
        td.append(input);
      }
      tr.append(td);
    }
    tr.append(actual); slimeBody.append(tr);
  }
  document.getElementById('g_first').value = slimeCfg.giant.first;
  document.getElementById('g_every').value = slimeCfg.giant.every;
}
for (const key of ['first', 'every']) document.getElementById('g_' + key).addEventListener('change', e => {
  slimeCfg.giant[key] = Number(e.target.value); slimeCfg = validSlimeSettings(slimeCfg);
  e.target.value = slimeCfg.giant[key]; saveMonsters(); renderSlimeTable();
});
document.getElementById('exportMonsters').addEventListener('click', () => {
  const content = exportText();
  document.getElementById('exportOut').value = content;
  const url = URL.createObjectURL(new Blob([content], { type: 'text/javascript' }));
  const link = document.createElement('a'); link.href = url; link.download = 'monsters.js'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  status('已下載 monsters.js。將它放到遊戲的 data 資料夾，正式遊戲就會使用新設定。');
});
document.getElementById('previewMonster').addEventListener('click', () => {
  saveMonsters();
  const query = new URLSearchParams({ previewMonsters: '1', monsterPreview: '1', monsterId: currentMonster().id });
  window.open('塔防原型.html?' + query, 'single_monster_preview');
  status('已開啟單隻測試場：可移動閃避、射擊；不會寫入正式存檔，也不改地圖配置。');
});
document.getElementById('previewGame').addEventListener('click', () => {
  saveMonsters(); window.open('塔防原型.html?previewMonsters=1', 'monster_preview');
  status('已開啟使用瀏覽器暫存怪物設定的遊戲預覽。');
});
document.getElementById('resetMonsters').addEventListener('click', () => {
  if (!confirm('丟棄這台瀏覽器裡尚未匯出的怪物設定，重新載入 data/monsters.js？')) return;
  localStorage.removeItem(MONSTER_STORAGE_KEY); localStorage.removeItem(SLIME_SETTINGS_STORAGE_KEY);
  monsters = monsterCatalog(false); selectedId = monsters[0].id; slimeCfg = slimeSettings(false);
  render(); renderSlimeTable(); status('已從檔案重新載入。');
});
// 與遊戲共用素材、出土選圖、手部前搖；只繪圖，不寫入遊戲存檔。
const burrowPreviewImages = new Map();
let burrowPreviewStarted = performance.now();
document.getElementById('burrowPreviewMode').addEventListener('change', () => { burrowPreviewStarted = performance.now(); });
function previewBurrowImage(file) {
  if (!burrowPreviewImages.has(file)) { const img = new Image(); img.src = file; burrowPreviewImages.set(file, img); }
  return burrowPreviewImages.get(file);
}
function drawBurrowEditorPreview(now) {
  const m = currentMonster();
  if (m.behavior === 'burrow') {
    const canvas = document.getElementById('burrowAnimation'), pc = canvas.getContext('2d');
    const c = validBurrowCfg(m.burrow), art = burrowMouseArt(m), mode = document.getElementById('burrowPreviewMode').value;
    const t = (now - burrowPreviewStarted) / 1000, handDuration = c.windup + c.handRise + c.handHold + .22;
    let phase = 'idle', age = t, hand = null;
    if (mode === 'emerge' || mode === 'sink') { phase = mode; age = t % (c.emergeTime + .7); }
    else if (mode === 'left' || mode === 'right') hand = { x: mode === 'left' ? 220 : 380, y: 180, age: t % (handDuration + .7), side: mode };
    else if (mode.startsWith('strike-')) { age = 1; hand = { x: mode === 'strike-left' ? 220 : 380, y: 180, age: c.windup + c.handRise + Math.min(.1, c.handHold / 2), side: mode.slice(7) }; }
    else if (mode === 'cycle') {
      const u = t % (c.emergeTime * 2 + 2.4 + handDuration * 2);
      if (u < c.emergeTime) { phase = 'emerge'; age = u; }
      else if (u < c.emergeTime + 2.4) age = u - c.emergeTime;
      else if (u < c.emergeTime + 2.4 + handDuration * 2) {
        const h = u - c.emergeTime - 2.4, left = h < handDuration;
        hand = { x: left ? 220 : 380, y: 180, side: left ? 'left' : 'right', age: h % handDuration };
      } else { phase = 'sink'; age = u - c.emergeTime - 2.4 - handDuration * 2; }
    }
    pc.clearRect(0, 0, canvas.width, canvas.height); pc.fillStyle = '#222e38'; pc.fillRect(0, 0, canvas.width, canvas.height);
    pc.strokeStyle = '#35434c'; pc.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) { pc.beginPath(); pc.moveTo(x, 0); pc.lineTo(x, canvas.height); pc.stroke(); }
    for (let y = 0; y < canvas.height; y += 40) { pc.beginPath(); pc.moveTo(0, y); pc.lineTo(canvas.width, y); pc.stroke(); }
    pc.strokeStyle = '#64c4a0'; pc.strokeRect(200, 80, 200, 200);
    if (hand && hand.age <= handDuration) {
      drawBurrowWarning(pc, hand, c);
      drawBurrowFrame(pc, previewBurrowImage(burrowMouseHandFrame(art, hand.side, hand.age, c)), hand.x, hand.y);
    }
    drawBurrowFrame(pc, previewBurrowImage(burrowMouseBodyFrame(art, phase, age, c.emergeTime)), 300, 180, m.width || 110, m.height || 90);
    pc.fillStyle = '#e4edf3'; pc.font = '15px "Microsoft JhengHei", sans-serif';
    pc.fillText('目標在左用左手，右邊用右手', 36, 35);
    pc.fillText('綠框：本體周圍 5×5 格；離開後原地洞保留 5 秒', 36, 62);
  }
  requestAnimationFrame(drawBurrowEditorPreview);
}
requestAnimationFrame(drawBurrowEditorPreview);
render();
renderSlimeTable();
