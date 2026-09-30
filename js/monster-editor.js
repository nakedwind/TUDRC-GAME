let monsters = monsterCatalog(true);
let selectedId = monsters[0].id;
const listEl = document.getElementById('monsterList');
const fields = [...document.querySelectorAll('[data-field]')];
const currentMonster = () => monsters.find(monster => monster.id === selectedId) || monsters[0];
function status(text, error = false) {
  const el = document.getElementById('status');
  el.textContent = text; el.style.color = error ? '#ffb4b4' : '#84ddbd';
}
function saveMonsters() {
  try {
    localStorage.setItem(MONSTER_STORAGE_KEY, JSON.stringify(monsters));
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
  document.getElementById('deleteMonster').disabled = monsters.length <= 1;
  previewSprite(monster); renderList();
}
function newMonsterId() {
  let n = 2;
  while (monsters.some(monster => monster.id === 'monster_' + n)) n++;
  return 'monster_' + n;
}
function addMonster(copy = false) {
  const source = currentMonster();
  const monster = { ...source, id: newMonsterId(), name: copy ? source.name + '（複製）' : '新異質體' };
  monsters.push(monster); selectedId = monster.id;
  saveMonsters(); render();
  document.getElementById('f_name').focus(); document.getElementById('f_name').select();
}
document.getElementById('addMonster').addEventListener('click', () => addMonster(false));
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
  if (key === 'name') { document.getElementById('editingTitle').textContent = monster.name + '・資料'; renderList(); }
  if (key === 'sprite') { previewSprite(monster); renderList(); }
}));
function exportText() {
  return '/* 怪物種類資料：由怪物編輯器匯出。地圖只記錄種類 ID 與權重。 */\n'
    + 'const MONSTERS_DEFAULT = ' + JSON.stringify(validMonsterCatalog(monsters), null, 2) + ';\n';
}
document.getElementById('exportMonsters').addEventListener('click', () => {
  const content = exportText();
  document.getElementById('exportOut').value = content;
  const url = URL.createObjectURL(new Blob([content], { type: 'text/javascript' }));
  const link = document.createElement('a'); link.href = url; link.download = 'monsters.js'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  status('已下載 monsters.js。將它放到遊戲的 data 資料夾，正式遊戲就會使用新設定。');
});
document.getElementById('previewGame').addEventListener('click', () => {
  saveMonsters(); window.open('塔防原型.html?previewMonsters=1', 'monster_preview');
  status('已開啟使用瀏覽器暫存怪物設定的遊戲預覽。');
});
document.getElementById('resetMonsters').addEventListener('click', () => {
  if (!confirm('丟棄這台瀏覽器裡尚未匯出的怪物設定，重新載入 data/monsters.js？')) return;
  localStorage.removeItem(MONSTER_STORAGE_KEY);
  monsters = monsterCatalog(false); selectedId = monsters[0].id;
  render(); status('已從檔案重新載入。');
});
render();
