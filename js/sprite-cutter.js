/* ===== ✂️ 精靈圖切割器（精靈圖切割器.html）=====
   把 320×192 的角色精靈圖（一格 64×64，5 欄 × 3 列）切成遊戲用的 15 張圖，
   存進 images/character/<角色>_<造型字母>/<角色><造型字母>_0000_Front.png …（跟 tools/split_character_sprites.py 同一套規則）。
   遊戲讀圖的檔名在 js/game.js 的 CHARACTER_SPRITE_FILES。寫檔用 js/project-save.js 的遊戲資料夾（所有編輯器共用，選一次就好）。
*/
const FRAME = 64, SHEET_W = 320, SHEET_H = 192;
// [檔名（不含前綴）, 欄, 列]：欄＝方向（正面、左側、右側、背面、眨眼）、列＝第幾張
const FRAMES = [
  ['0000_Front', 0, 0], ['0001_Front-Walking01', 0, 1], ['0002_Front-Walking02', 0, 2],
  ['0003_Leftside', 1, 0], ['0004_Leftside-walking01', 1, 1], ['0005_Leftside-walking02', 1, 2],
  ['0006_right-side', 2, 0], ['0007_right-side-walking01', 2, 1], ['0008_right-side-walking02', 2, 2],
  ['0009_back', 3, 0], ['0010_back-walking01', 3, 1], ['0011_back-walking02', 3, 2],
  ['0012_closeeyes03', 4, 2], ['0013_closeeyes02', 4, 1], ['0014_closeeyes01', 4, 0],
];
const COL_NAMES = ['正面', '左側', '右側', '背面', '眨眼'];
const LETTERS = [['A', '基地便服'], ['B', '戰鬥服'], ['C', '只有一套']];
const $ = id => document.getElementById(id);
const statusEl = $('status');
function say(msg, err = false) { statusEl.textContent = msg; statusEl.classList.toggle('err', !!err); }

// ---- ① 角色與造型 ----
const chars = Object.values(typeof CHARACTERS !== 'undefined' ? CHARACTERS : {}).filter(c => c && c.id);
let charId = '', letter = 'B', sheet = null, sheetName = '';
const folder = () => charId + '_' + letter;
const prefix = () => charId + letter + '_';
const facePath = c => { const f = String(c.sprite || ''); return f ? 'images/character/' + f + '/' + f.replace('_', '') + '_0000_Front.png' : ''; };
function renderChars() {
  $('charList').innerHTML = chars.map(c => '<button type="button" data-id="' + c.id + '" class="' + (c.id === charId ? 'on' : '') + '">' +
    '<span class="face">' + (c.sprite ? '<img src="' + facePath(c) + '" alt="" onerror="this.remove()">' : '') + '</span>' +
    '<span><b>' + c.name + '</b><small>' + c.id + (c.sprite ? '・' + c.sprite : '') + '</small></span></button>').join('');
}
$('charList').addEventListener('click', e => {
  const b = e.target.closest('[data-id]'); if (!b) return;
  const c = chars.find(x => x.id === b.dataset.id);
  charId = c.id; $('charId').value = charId;
  const m = /_([A-Z])$/.exec(c.sprite || ''); if (m) letter = m[1];   // 預設選它現在用的那套造型
  refreshTarget();
});
$('charId').addEventListener('input', () => { charId = $('charId').value.trim().toLowerCase().replace(/[^a-z0-9]/g, ''); refreshTarget(); });
function renderLetters() {
  $('letters').innerHTML = LETTERS.map(([l, n]) => '<button type="button" data-l="' + l + '" class="' + (l === letter ? 'on' : '') + '" title="' + n + '">' + l + '</button>').join('');
  const n = (LETTERS.find(x => x[0] === letter) || [])[1];
  $('letterNote').textContent = n ? letter + '＝' + n + (letter === 'A' ? '（在基地裡穿）' : letter === 'B' ? '（在戰鬥區域穿）' : '（到哪都穿這套）') : '';
}
$('letters').addEventListener('click', e => { const b = e.target.closest('[data-l]'); if (!b) return; letter = b.dataset.l; refreshTarget(); });
function refreshTarget() {
  renderChars(); renderLetters();
  $('folderPath').textContent = charId ? 'images/character/' + folder() + '/' + prefix() + '0000_Front.png …（共 15 張）' : '先選一個角色，或在上面填新角色的代號';
  // 遊戲裡哪個角色用這套圖（A/B 兩套會依場地自動換；只要角色資料的 sprite 是同一個角色的 A 或 B 就算）
  const users = chars.filter(c => c.sprite === folder() || (/^[AB]$/.test(letter) && /_[AB]$/.test(c.sprite || '') && c.sprite.replace(/_[AB]$/, '') === charId));
  const note = $('useNote');
  if (!charId) { note.textContent = ''; note.className = 'note'; }
  else if (users.length) { note.textContent = '✔ 存好後遊戲會自動使用：' + users.map(c => c.name).join('、'); note.className = 'note ok'; }
  else { note.textContent = '⚠ 目前還沒有角色使用這套圖。新角色要在角色資料（data/characters.js）加上這個角色，sprite 填「' + folder() + '」。'; note.className = 'note warn'; }
  const old = $('oldFront');
  old.style.visibility = 'visible';
  old.onerror = () => { old.style.visibility = 'hidden'; };
  old.src = charId ? 'images/character/' + folder() + '/' + prefix() + '0000_Front.png?t=' + Date.now() : '';
  updateSave();
}

// ---- ② 精靈圖 ----
const drop = $('drop');
drop.addEventListener('dragover', e => { e.preventDefault(); drop.classList.add('over'); });
drop.addEventListener('dragleave', () => drop.classList.remove('over'));
drop.addEventListener('drop', e => { e.preventDefault(); drop.classList.remove('over'); const f = e.dataTransfer.files[0]; if (f) loadFile(f); });
$('file').addEventListener('change', e => { const f = e.target.files[0]; if (f) loadFile(f); e.target.value = ''; });
function loadFile(file) {
  const url = URL.createObjectURL(file), img = new Image();
  img.onload = () => {
    sheet = img; sheetName = file.name; sheet.fileBlob = file;
    const ok = img.naturalWidth === SHEET_W && img.naturalHeight === SHEET_H;
    $('sizeNote').textContent = file.name + '：' + img.naturalWidth + '×' + img.naturalHeight + (ok ? '　✔ 尺寸正確' : '　✖ 尺寸要是 ' + SHEET_W + '×' + SHEET_H + '（5 欄 × 3 列，每格 64×64）');
    $('sizeNote').className = 'size ' + (ok ? 'good' : 'bad');
    sheet.ok = ok;
    drawSheet(); startAnim(); updateSave();
    say('');
  };
  img.onerror = () => say('讀不到這張圖片', true);
  img.src = url;
}
function drawSheet() {
  const c = $('sheetCanvas'), s = 2;   // 放大 2 倍看
  c.width = sheet.naturalWidth * s; c.height = sheet.naturalHeight * s;
  const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
  g.drawImage(sheet, 0, 0, c.width, c.height);
  g.strokeStyle = 'rgba(127,215,218,.55)'; g.lineWidth = 1;
  for (let x = 0; x <= c.width; x += FRAME * s) { g.beginPath(); g.moveTo(x + .5, 0); g.lineTo(x + .5, c.height); g.stroke(); }
  for (let y = 0; y <= c.height; y += FRAME * s) { g.beginPath(); g.moveTo(0, y + .5); g.lineTo(c.width, y + .5); g.stroke(); }
  g.font = 'bold 12px "Microsoft JhengHei", sans-serif'; g.textBaseline = 'top';
  for (const [, col, row] of FRAMES) {   // 每格左上角標：方向＋第幾張
    const label = COL_NAMES[col] + (col === 4 ? (3 - row) : row + 1), x = col * FRAME * s + 4, y = row * FRAME * s + 4;
    g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(x - 2, y - 2, g.measureText(label).width + 6, 17);
    g.fillStyle = '#ffd9a8'; g.fillText(label, x + 1, y);
  }
  $('sheetWrap').style.display = 'block';
}

// ---- ③ 預覽：四個方向走路＋眨眼（跟遊戲一樣的順序）----
const ANIMS = [['正面走路', 0, [0, 1, 0, 2]], ['左側走路', 1, [0, 1, 0, 2]], ['右側走路', 2, [0, 1, 0, 2]], ['背面走路', 3, [0, 1, 0, 2]], ['眨眼', 4, [0, 1, 2, 1]]];
let animTimer = null, animStep = 0;
function startAnim() {
  $('anim').innerHTML = ANIMS.map(([n], i) => '<figure><canvas width="64" height="64" data-a="' + i + '"></canvas><figcaption>' + n + '</figcaption></figure>').join('');
  clearInterval(animTimer); animStep = 0;
  const tick = () => {
    $('anim').querySelectorAll('canvas').forEach(cv => {
      const [, col, seq] = ANIMS[+cv.dataset.a], row = seq[animStep % seq.length], g = cv.getContext('2d');
      g.clearRect(0, 0, 64, 64); g.imageSmoothingEnabled = false;
      g.drawImage(sheet, col * FRAME, row * FRAME, FRAME, FRAME, 0, 0, FRAME, FRAME);
    });
    const nf = $('newFront').getContext('2d'); nf.clearRect(0, 0, 64, 64); nf.drawImage(sheet, 0, 0, FRAME, FRAME, 0, 0, FRAME, FRAME);
    animStep++;
  };
  tick(); animTimer = setInterval(tick, 180);
}

// ---- ④ 切割並存到專案 ----
function updateSave() { $('save').disabled = !(sheet && sheet.ok && charId); }
const stamp = () => { const d = new Date(), z = n => String(n).padStart(2, '0'); return d.getFullYear() + z(d.getMonth() + 1) + z(d.getDate()) + '-' + z(d.getHours()) + z(d.getMinutes()) + z(d.getSeconds()); };
function frameBlob(col, row) {
  const c = document.createElement('canvas'); c.width = FRAME; c.height = FRAME;
  const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
  g.drawImage(sheet, col * FRAME, row * FRAME, FRAME, FRAME, 0, 0, FRAME, FRAME);
  return new Promise(res => c.toBlob(res, 'image/png'));
}
async function writeBlob(dir, name, blob) { const w = await (await dir.getFileHandle(name, { create: true })).createWritable(); await w.write(blob); await w.close(); }
async function save(pickAgain) {
  if (!sheet || !sheet.ok || !charId) return;
  $('save').disabled = true;
  try {
    const root = await ProjectSave.projectDir(pickAgain, m => say(m));
    const charRoot = await ProjectSave.subDir(root, ['images', 'character'], true);
    const target = await charRoot.getDirectoryHandle(folder(), { create: true });
    // 備份資料夾裡原本的圖（有的話）
    const old = [];
    for await (const [name, h] of target.entries()) if (h.kind === 'file' && /\.png$/i.test(name)) old.push([name, h]);
    let backupNote = '';
    if (old.length) {
      const bdir = await ProjectSave.subDir(root, ['backups', '精靈圖切割器', folder() + '-' + stamp()], true);
      for (const [name, h] of old) await writeBlob(bdir, name, await h.getFile());
      backupNote = '\n原本的 ' + old.length + ' 張圖備份在 backups/精靈圖切割器/' + folder() + '-…/';
    }
    for (const [name, col, row] of FRAMES) await writeBlob(target, prefix() + name + '.png', await frameBlob(col, row));
    await writeBlob(target, /\.png$/i.test(sheetName) ? sheetName : 'character_' + folder() + '.png', sheet.fileBlob);   // 原始精靈圖也放一份在資料夾裡
    say('✔ 已切成 15 張，存到 images/character/' + folder() + '/　遊戲按 Ctrl+F5 重新整理就會換成新圖。' + backupNote);
    refreshTarget();
  } catch (e) {
    if (e && e.name === 'AbortError') say('已取消');
    else say('存檔失敗：' + (e && e.message || e), true);
  } finally { updateSave(); }
}
$('save').addEventListener('click', () => save(false));
$('pickDir').addEventListener('click', async () => {   // 只重新選遊戲資料夾（不存檔）
  try { await ProjectSave.projectDir(true, m => say(m)); say('✔ 已選好遊戲資料夾'); }
  catch (e) { if (!(e && e.name === 'AbortError')) say('選資料夾失敗：' + (e && e.message || e), true); }
});

refreshTarget();
