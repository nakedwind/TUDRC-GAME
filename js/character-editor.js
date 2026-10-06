/* 角色資料頁：草稿只存在瀏覽器；匯出時保留其他角色與所有對話。 */
const CHARACTER_DRAFT_KEY = 'tudrc-character-editor-v1';
const cloneCharacterData = value => JSON.parse(JSON.stringify(value));
const fighterIds = Object.keys(CHARACTERS).filter(id => id === 'winter' || !!CHARACTERS[id].combat);
let charactersDraft = cloneCharacterData(CHARACTERS);
let selectedCharacterId = fighterIds[0];

const FIELD_LABELS = {
  name:'名稱', sprite:'角色圖片資料夾', rank:'等級', role:'戰鬥定位', ability:'能力',
  hp:'生命 HP', dmg:'每次傷害', rate:'每秒攻擊次數', range:'攻擊射程・格', aggroRange:'主動索敵・格',
  accuracy:'命中率・0～1', defense:'減傷比例・0～1', walkSpeed:'移動速度・px/秒', speed:'移動速度・px/秒',
  taint:'每次攻擊增加負荷', taintRegen:'每秒減少負荷', splash:'範圍半徑・格', color:'特效顏色',
  trait:'能力說明', intro:'人物簡介', captainImpression:'部隊長印象', guide:'嚮導', noAggro:'不主動吸引仇恨',
  taunt:'嘲諷範圍・格', rageDmg:'汙染加成・滿汙染額外倍率', noRetreat:'瀕臨暴走不撤退', hpRegen:'每秒恢復 HP', confuse:'混亂時間・秒', knockback:'擊退距離・格',
  stun:'暈眩時間・秒', sense:'感知範圍・格', evade:'閃避距離・格',
  duration:'持續時間・秒', damage:'每秒傷害', r:'半徑・格／碰撞 px', heal:'治療量',
  combat:'戰鬥', load:'精神負荷', ratings:'星級評價', aura:'被動支援', burn:'燒傷',
  mag:'彈匣容量', reloadTime:'裝填時間・秒', aggro:'玩家仇恨時間・秒', cone:'瞄準容許角度・弧度',
  drawSize:'角色圖尺寸・px'
};
const CORE_COMBAT = ['hp','dmg','rate','range','aggroRange','accuracy','defense','walkSpeed','taint','taintRegen','splash','color'];
const BASIC_COMBAT = ['rank','role','ability'];
const PLAYER_FIELDS = ['hp','speed','r','drawSize'];
const PLAYER_ATTACK_FIELDS = ['range','dmg','rate','mag','reloadTime','aggro','cone'];
const $character = id => document.getElementById(id);
const valueAt = (object, path) => path.reduce((current, key) => current?.[key], object);
const labelFor = key => FIELD_LABELS[key] || key;

function mergeCharacterDraft(target, saved) {
  if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return;
  for (const [key, value] of Object.entries(saved)) {
    if (!(key in target)) continue;
    if (value && typeof value === 'object' && !Array.isArray(value) && target[key] && typeof target[key] === 'object')
      mergeCharacterDraft(target[key], value);
    else if (typeof value === typeof target[key]) target[key] = value;
  }
}
try {
  const saved = JSON.parse(localStorage.getItem(CHARACTER_DRAFT_KEY) || 'null');
  for (const id of fighterIds) if (saved?.[id]) mergeCharacterDraft(charactersDraft[id], saved[id]);
} catch (_) { /* 草稿損壞時使用正式角色檔，不影響遊戲。 */ }

function editablePart(character) {
  const { name, sprite, intro, captainImpression } = character;
  return character.id === 'winter'
    ? { name, sprite, intro, captainImpression, player:character.player, playerAttack:character.playerAttack }
    : { name, sprite, intro, captainImpression, combat:character.combat };
}
function saveDraft() {
  const edits = Object.fromEntries(fighterIds.map(id => [id, editablePart(charactersDraft[id])]));
  try {
    localStorage.setItem(CHARACTER_DRAFT_KEY, JSON.stringify(edits));
    setCharacterStatus('已自動儲存在這台瀏覽器。下載檔案後才會套用到遊戲。');
  } catch (_) { setCharacterStatus('瀏覽器草稿儲存失敗；請先下載設定檔。', true); }
  if ($character('exportOut').classList.contains('visible')) $character('exportOut').value = exportSource();
}
function setCharacterStatus(message, error = false) {
  const status = $character('status');
  status.textContent = message;
  status.style.color = error ? '#ffb2ad' : '#8ce0be';
}
function portraitPath(character) {
  const folder = String(character.sprite || '');
  return 'images/character/' + encodeURIComponent(folder) + '/' + encodeURIComponent(folder.replace('_','') + '_0000_Front.png');
}
function kindLabel(character) {
  return character.kind === 'player' ? '玩家・嚮導部隊長' : character.kind === 'guide' ? '出勤嚮導' : '哨兵';
}
function renderCharacterList() {
  const list = $character('characterList');
  const term = $character('search').value.trim().toLowerCase();
  list.replaceChildren();
  for (const id of fighterIds) {
    const character = charactersDraft[id];
    const sub = character.combat ? [character.combat.rank,character.combat.role,character.combat.ability].filter(Boolean).join('・') : '玩家・開槍／疏導';
    if (term && !(character.name + id + sub).toLowerCase().includes(term)) continue;
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'character-item' + (id === selectedCharacterId ? ' selected' : '');
    button.setAttribute('aria-current', id === selectedCharacterId ? 'true' : 'false');
    button.dataset.uiSound = 'switch';
    const image = document.createElement('img'); image.src = portraitPath(character); image.alt = '';
    const text = document.createElement('span');
    const name = document.createElement('b'); name.textContent = character.name;
    const detail = document.createElement('small'); detail.textContent = sub;
    text.append(name, detail); button.append(image, text);
    button.addEventListener('click', () => { selectedCharacterId = id; renderCharacter(); });
    list.appendChild(button);
  }
  if (!list.children.length) list.textContent = '沒有符合的角色';
  $character('count').textContent = fighterIds.length + ' 位';
}
function summaryCard(label, value) {
  const card = document.createElement('div'); card.className = 'summary-card';
  const caption = document.createElement('small'); caption.textContent = label;
  const amount = document.createElement('strong'); amount.textContent = String(value);
  card.append(caption, amount); return card;
}
function renderSummary() {
  const character = charactersDraft[selectedCharacterId], box = $character('summary');
  box.replaceChildren();
  if (character.combat) {
    const c = character.combat;
    box.append(summaryCard('生命 HP', c.hp), summaryCard('每次傷害', c.dmg),
      summaryCard('射程', c.range + ' 格'), summaryCard('命中率', Math.round(c.accuracy * 100) + '%'));
  } else {
    const p = character.player, a = character.playerAttack;
    box.append(summaryCard('生命 HP', p.hp), summaryCard('槍傷害', a.dmg),
      summaryCard('射程', a.range + ' 格'), summaryCard('裝填', a.reloadTime + ' 秒'));
  }
}
function makeField(path) {
  const keys = path.split('.');
  const key = keys.at(-1), character = charactersDraft[selectedCharacterId];
  const value = valueAt(character, keys);
  if (value === undefined || value === null || typeof value === 'object') return null;
  const label = document.createElement('label');
  label.className = 'field' + (['trait','intro','captainImpression'].includes(key) ? ' wide' : '');
  const title = document.createElement('span'); title.textContent = labelFor(key);
  let input;
  if (typeof value === 'boolean') { input = document.createElement('input'); input.type = 'checkbox'; input.checked = value; }
  else if (['trait','intro','captainImpression'].includes(key)) { input = document.createElement('textarea'); input.value = value; }
  else { input = document.createElement('input'); input.type = typeof value === 'number' ? 'number' : key === 'color' ? 'color' : 'text'; input.value = value; }
  if (input.type === 'number') {
    input.step = Number.isInteger(value) ? '1' : 'any';
    if (['hp','dmg','rate','range','speed','walkSpeed','reloadTime','mag','drawSize'].includes(key)) input.min = '0.01';
    if (['accuracy','defense'].includes(key)) { input.min = '0'; input.max = '1'; }
  }
  input.dataset.path = path;
  input.addEventListener(input.type === 'number' ? 'change' : 'input', () => {
    const parent = valueAt(character, keys.slice(0,-1));
    let next = input.type === 'checkbox' ? input.checked : input.type === 'number' ? Number(input.value) : input.value;
    if (input.type === 'number' && (!input.value.trim() || !Number.isFinite(next) ||
        (input.min !== '' && next < Number(input.min)) || (input.max !== '' && next > Number(input.max)))) {
      input.value = parent[key]; setCharacterStatus('請輸入有效範圍內的數字。', true); return;
    }
    parent[key] = next;
    saveDraft(); renderSummary(); renderCharacterList();
    if (['name','sprite','rank','role','ability'].includes(key)) renderHero();
  });
  label.append(title, input);
  if (key === 'accuracy' || key === 'defense') { const note = document.createElement('em'); note.textContent = '1 = 100%；0.25 = 25%'; label.appendChild(note); }
  return label;
}
function addSection(title, paths, note = '') {
  const section = document.createElement('section'); section.className = 'field-section';
  const heading = document.createElement('h3'); heading.textContent = title; section.appendChild(heading);
  if (note) { const p = document.createElement('p'); p.textContent = note; section.appendChild(p); }
  const fields = document.createElement('div'); fields.className = 'fields';
  for (const path of paths) { const field = makeField(path); if (field) fields.appendChild(field); }
  section.appendChild(fields); $character('fields').appendChild(section);
}
function addObjectGroup(title, prefix, object) {
  const section = document.createElement('section'); section.className = 'field-section';
  const heading = document.createElement('h3'); heading.textContent = title; section.appendChild(heading);
  for (const [key, value] of Object.entries(object)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const group = document.createElement('div'); group.className = 'subgroup';
      const name = document.createElement('h4'); name.textContent = labelFor(key); group.appendChild(name);
      const fields = document.createElement('div'); fields.className = 'fields';
      for (const subkey of Object.keys(value)) { const field = makeField(prefix + '.' + key + '.' + subkey); if (field) fields.appendChild(field); }
      group.appendChild(fields); section.appendChild(group);
    } else {
      const field = makeField(prefix + '.' + key);
      if (field) { const fields = document.createElement('div'); fields.className = 'fields'; fields.appendChild(field); section.appendChild(fields); }
    }
  }
  $character('fields').appendChild(section);
}
function renderHero() {
  const c = charactersDraft[selectedCharacterId];
  $character('portrait').src = portraitPath(c);
  $character('portrait').alt = c.name + '頭像';
  $character('kindTag').textContent = kindLabel(c);
  $character('editingTitle').textContent = c.name + '・角色資料';
  $character('heroSub').textContent = c.combat ? [c.combat.rank + '級', c.combat.role, c.combat.ability].filter(Boolean).join(' · ') : '溫特・玩家操作角色';
}
function renderCharacter() {
  const c = charactersDraft[selectedCharacterId];
  renderCharacterList(); renderHero(); renderSummary(); $character('fields').replaceChildren();
  addSection('基本資料', c.combat ? ['name','sprite',...BASIC_COMBAT.map(key => 'combat.' + key)] : ['name','sprite'], '角色 ID 固定為 ' + c.id + '，避免編隊與存檔失效。');
  if (c.combat) {
    addSection('戰鬥數值', CORE_COMBAT.map(key => 'combat.' + key), '攻速以每秒攻擊次數表示；防禦與命中率以 0～1 表示。');
    const special = Object.fromEntries(Object.entries(c.combat).filter(([key]) => !BASIC_COMBAT.includes(key) && !CORE_COMBAT.includes(key) && key !== 'ratings' && key !== 'trait'));
    if (Object.keys(special).length) addObjectGroup('特殊能力', 'combat', special);
    if (c.combat.ratings) addSection('星級評價', Object.keys(c.combat.ratings).map(key => 'combat.ratings.' + key), '星級是人物介紹用的評價，實際戰鬥仍以數值欄位為準。');
  } else {
    addSection('玩家本體', PLAYER_FIELDS.map(key => 'player.' + key));
    addSection('玩家槍械', PLAYER_ATTACK_FIELDS.map(key => 'playerAttack.' + key), '這些數值會在匯出並替換角色檔後，由遊戲直接讀取。');
  }
  addSection('人物描述', c.combat ? ['combat.trait','intro','captainImpression'] : ['intro','captainImpression']);
}
function exportSource() {
  const merged = cloneCharacterData(CHARACTERS);
  for (const id of fighterIds) mergeCharacterDraft(merged[id], editablePart(charactersDraft[id]));
  return '/* 角色資料頁匯出；保留角色 ID 與非戰鬥人員資料。台詞在 data/dialogues.js（對話編輯器）。 */\nconst CHARACTERS = ' + JSON.stringify(merged, null, 2) + ';\n';
}
$character('search').addEventListener('input', renderCharacterList);
$character('showExport').addEventListener('click', () => {
  const area = $character('exportOut'); area.classList.toggle('visible');
  if (area.classList.contains('visible')) area.value = exportSource();
});
$character('download').addEventListener('click', () => {
  const blob = new Blob([exportSource()], { type:'text/javascript;charset=utf-8' });
  const url = URL.createObjectURL(blob), link = document.createElement('a');
  link.href = url; link.download = 'characters.js'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  setCharacterStatus('已下載 characters.js。請替換遊戲的 data/characters.js，再重新開啟遊戲。');
});
$character('reset').addEventListener('click', () => {
  if (!confirm('確定丟棄這台瀏覽器裡的角色草稿，從目前的 data/characters.js 重新載入嗎？')) return;
  charactersDraft = cloneCharacterData(CHARACTERS);
  localStorage.removeItem(CHARACTER_DRAFT_KEY);
  renderCharacter(); setCharacterStatus('已從目前的角色檔重新載入。');
});
renderCharacter();
