/* ===== 2F應變中心的電腦：仿舊式電腦桌面（自己畫的，不用任何真的作業系統圖片）=====
   ・在電腦前按 Space 打開（js/bestiary.js 的 useBestiaryNearPlayer）；Esc＝關掉最上面的視窗，沒有視窗時＝關機回遊戲
   ・桌面圖示點兩下打開（手機點一下）：
       🎵 音樂播放器：換基地的背景音樂（music/基地音樂/ 裡的檔案；js/music.js 的 MUSIC.setBaseTrack，記在瀏覽器）
       💣 踩地雷：左鍵翻開、右鍵插旗、點已翻開的數字＝旗子插夠了就把旁邊的一起翻開；笑臉＝重新開始
       📕 怪物圖鑑：打開原本的圖鑑視窗（js/bestiary.js 的 openBestiary）
   ・左下「開始」選單、右下的電源按鈕都可以關機
   樣式在 css/style.css 的「2F 電腦桌面」。
*/
let pcDesktopOpen = false;
const pcd = { el: null, z: 10, sel: null, wins: {}, tracks: null, mine: null, clock: 0 };
const PCD_APPS = [
  { id: 'music', name: '音樂播放器', icon: '🎵', title: '音樂播放器－基地音樂' },
  { id: 'mines', name: '踩地雷', icon: '💣', title: '踩地雷' },
  { id: 'bestiary', name: '怪物圖鑑', icon: '📕' },
];
// 列不出資料夾內容時（例如放到網路上的版本）用這份清單；在本機用 editor-server 開的話會自動讀 music/基地音樂/ 裡實際有的檔案
const PCD_TRACK_FALLBACK = ['fluffy -cute piano.mp3', 'relaxing-piano-music.mp3', 'snowfall-music-box.mp3', 'sunset-piano-music.mp3'];
const PCD_LEVELS = { easy: { name: '初級', w: 9, h: 9, n: 10 }, mid: { name: '中級', w: 16, h: 16, n: 40 } };
const pcdEsc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const pcdTrackName = f => f.replace(/\.[^.]+$/, '');   // 顯示時不要副檔名

function buildPcDesktop() {
  const el = pcd.el = document.createElement('div');
  el.id = 'pcDesktop'; el.className = 'hidden';
  el.innerHTML = '<div class="pcd-screen">' +
      '<div class="pcd-icons">' + PCD_APPS.map(a => '<button type="button" class="pcd-icon" data-app="' + a.id + '"><span class="pcd-ico">' + a.icon + '</span><span class="pcd-label">' + a.name + '</span></button>').join('') + '</div>' +
      '<div class="pcd-wins"></div>' +
      '<div class="pcd-start hidden"><div class="pcd-start-head"><span class="pcd-avatar">Y</span>Y102 應變中心</div>' +
        '<div class="pcd-start-list">' + PCD_APPS.map(a => '<button type="button" data-app="' + a.id + '"><span>' + a.icon + '</span>' + a.name + '</button>').join('') + '</div>' +
        '<div class="pcd-start-foot"><button type="button" class="pcd-off" data-off="1"><span>⏻</span>關機</button></div></div>' +
      '<div class="pcd-bar"><button type="button" class="pcd-startbtn"><span class="pcd-orb">Y</span>開始</button>' +
        '<div class="pcd-tasks"></div><div class="pcd-tray"><span class="pcd-clock"></span><button type="button" class="pcd-power" data-off="1" title="關機，回到遊戲">⏻</button></div></div>' +
      '<div class="pcd-bye hidden">正在關機…</div>' +
    '</div>';
  document.getElementById('wrap').appendChild(el);
  const screen = el.querySelector('.pcd-screen');
  el.addEventListener('contextmenu', e => e.preventDefault());   // 右鍵不要跳出瀏覽器選單（踩地雷用右鍵插旗）
  el.addEventListener('click', e => {
    if (e.target === el) { shutdownPcDesktop(); return; }   // 點螢幕外面＝關機
    const t = e.target;
    if (t.closest('[data-off]')) { shutdownPcDesktop(); return; }
    if (t.closest('.pcd-startbtn')) { toggleStartMenu(); return; }
    const sm = t.closest('.pcd-start [data-app]');
    if (sm) { toggleStartMenu(false); openPcApp(sm.dataset.app); return; }
    if (!t.closest('.pcd-start')) toggleStartMenu(false);   // 點別的地方：收起開始選單
    const task = t.closest('.pcd-task');
    if (task) { const w = pcd.wins[task.dataset.app]; if (w.classList.contains('min') || w.style.zIndex != pcd.z) focusPcWin(task.dataset.app); else minimizePcWin(task.dataset.app); return; }
    const icon = t.closest('.pcd-icon');
    if (icon) { selectPcIcon(icon.dataset.app); return; }
    if (!t.closest('.pcd-win')) selectPcIcon(null);
  });
  el.addEventListener('dblclick', e => { const icon = e.target.closest('.pcd-icon'); if (icon) openPcApp(icon.dataset.app); });
  el.addEventListener('pointerup', e => { const icon = e.target.closest('.pcd-icon'); if (icon && e.pointerType === 'touch') openPcApp(icon.dataset.app); });   // 手機：點一下就打開
  // 視窗：按標題列拖動、最小化、關閉、點一下拿到最上面
  screen.addEventListener('pointerdown', e => {
    const win = e.target.closest('.pcd-win'); if (!win) return;
    focusPcWin(win.dataset.app);
    const bar = e.target.closest('.pcd-title'); if (!bar || e.target.closest('button') || e.button !== 0) return;
    const sr = screen.getBoundingClientRect(), wr = win.getBoundingClientRect(), dx = e.clientX - wr.left, dy = e.clientY - wr.top;
    const move = ev => {
      win.style.left = Math.max(-wr.width + 60, Math.min(sr.width - 60, ev.clientX - sr.left - dx)) + 'px';
      win.style.top = Math.max(0, Math.min(sr.height - 60, ev.clientY - sr.top - dy)) + 'px';
    };
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
    e.preventDefault();
  });
}

// ---- 開關電腦 ----
function openPcDesktop() {
  if (pcDesktopOpen) return;
  if (!pcd.el) buildPcDesktop();
  pcDesktopOpen = true;
  if (typeof keys !== 'undefined') Object.keys(keys).forEach(k => { keys[k] = false; });
  pcd.el.classList.remove('hidden');
  pcd.el.querySelector('.pcd-bye').classList.add('hidden');
  toggleStartMenu(false); selectPcIcon(null);
  updatePcClock(); pcd.clock = setInterval(updatePcClock, 1000);
  sfx('menu');
}
function closePcDesktop() {
  if (!pcDesktopOpen) return;
  pcDesktopOpen = false;
  pcd.el.classList.add('hidden');
  clearInterval(pcd.clock);
  if (typeof bestiaryOpen !== 'undefined' && bestiaryOpen) closeBestiary();
}
function shutdownPcDesktop() {   // 關機：螢幕先暗下來，再回到遊戲（打開的視窗、踩地雷的進度留著，下次打開還在）
  if (!pcDesktopOpen || pcd.shutting) return;
  pcd.shutting = true; sfx('switch');
  pcd.el.querySelector('.pcd-bye').classList.remove('hidden');
  setTimeout(() => { pcd.shutting = false; closePcDesktop(); }, 450);
}
function updatePcClock() {
  const c = pcd.el && pcd.el.querySelector('.pcd-clock'); if (!c) return;
  const d = new Date(), h = d.getHours();
  c.textContent = (h < 12 ? '上午 ' : '下午 ') + ((h + 11) % 12 + 1) + ':' + String(d.getMinutes()).padStart(2, '0');
}
function toggleStartMenu(show) {
  const m = pcd.el.querySelector('.pcd-start'), on = show ?? m.classList.contains('hidden');
  if (on === !m.classList.contains('hidden')) return;
  m.classList.toggle('hidden', !on);
  pcd.el.querySelector('.pcd-startbtn').classList.toggle('on', on);
  if (on) sfx('button');
}
function selectPcIcon(id) {
  pcd.sel = id;
  pcd.el.querySelectorAll('.pcd-icon').forEach(b => b.classList.toggle('sel', b.dataset.app === id));
}

// ---- 視窗 ----
function openPcApp(id) {
  selectPcIcon(null);
  if (id === 'bestiary') { openBestiary(); return; }   // 圖鑑用原本的視窗（蓋在桌面上，關掉回到桌面）
  const app = PCD_APPS.find(a => a.id === id); if (!app) return;
  let w = pcd.wins[id];
  if (!w) {
    w = pcd.wins[id] = document.createElement('div');
    w.className = 'pcd-win'; w.dataset.app = id;
    w.innerHTML = '<div class="pcd-title"><span class="pcd-ticon">' + app.icon + '</span><span class="pcd-ttext">' + app.title + '</span>' +
      '<button type="button" class="pcd-tb pcd-min" title="最小化">_</button><button type="button" class="pcd-tb pcd-x" title="關閉">✕</button></div><div class="pcd-body"></div>';
    const n = Object.keys(pcd.wins).length - 1;
    w.style.left = (150 + n * 40) + 'px'; w.style.top = (24 + n * 30) + 'px';
    w.querySelector('.pcd-min').addEventListener('click', () => minimizePcWin(id));
    w.querySelector('.pcd-x').addEventListener('click', () => closePcWin(id));
    pcd.el.querySelector('.pcd-wins').appendChild(w);
    if (id === 'music') initPcMusic(w.querySelector('.pcd-body'));
    if (id === 'mines') initPcMines(w.querySelector('.pcd-body'));
    sfx('menu');
  }
  focusPcWin(id);
  if (id === 'mines') fitPcMines();
}
function focusPcWin(id) {
  const w = pcd.wins[id]; if (!w) return;
  w.classList.remove('min');
  if (w.style.zIndex != pcd.z) w.style.zIndex = ++pcd.z;
  Object.values(pcd.wins).forEach(x => x.classList.toggle('active', x === w));
  renderPcTasks();
}
function minimizePcWin(id) { const w = pcd.wins[id]; if (!w) return; w.classList.add('min'); w.classList.remove('active'); renderPcTasks(); sfx('switch'); }
function closePcWin(id) {
  const w = pcd.wins[id]; if (!w) return;
  if (id === 'mines' && pcd.mine) clearInterval(pcd.mine.timer);
  w.remove(); delete pcd.wins[id]; renderPcTasks(); sfx('switch');
}
function topPcWin() {   // 最上面、沒有縮小的那個視窗
  return Object.values(pcd.wins).filter(w => !w.classList.contains('min')).sort((a, b) => b.style.zIndex - a.style.zIndex)[0] || null;
}
function renderPcTasks() {
  const top = topPcWin();
  pcd.el.querySelector('.pcd-tasks').innerHTML = Object.keys(pcd.wins).map(id => {
    const a = PCD_APPS.find(x => x.id === id);
    return '<button type="button" class="pcd-task' + (pcd.wins[id] === top ? ' on' : '') + '" data-app="' + id + '"><span>' + a.icon + '</span>' + a.name + '</button>';
  }).join('');
}

// ---- 🎵 音樂播放器：換基地音樂 ----
function initPcMusic(body) {
  body.innerHTML = '<div class="pcd-music"><div class="pcd-now"></div><div class="pcd-tracks">讀取中…</div>' +
    '<p class="pcd-hint">點一首歌，基地的背景音樂就會換成那首，下次打開遊戲也會記得。<br>想加新的歌：把音樂檔放進 <b>music/基地音樂/</b> 資料夾。</p></div>';
  body.addEventListener('click', e => {
    const b = e.target.closest('[data-track]'); if (!b) return;
    MUSIC.setBaseTrack(b.dataset.track || null); sfx('button'); renderPcMusic(body);
  });
  loadPcTracks().then(() => renderPcMusic(body));
}
async function loadPcTracks() {   // 讀 music/基地音樂/ 的資料夾列表（跟音效編輯器讀 music/ 一樣的方法）
  if (pcd.tracks) return pcd.tracks;
  let list = null;
  try {
    const res = await fetch(MUSIC.baseDir);
    if (res.ok && (res.headers.get('content-type') || '').includes('html')) {
      const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
      list = [...doc.querySelectorAll('a[href]')].map(a => { try { return decodeURIComponent(a.getAttribute('href')); } catch (_) { return ''; } })
        .filter(n => n && !/[/?#]/.test(n) && /\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(n));
    }
  } catch (_) {}
  return pcd.tracks = (list && list.length ? list : PCD_TRACK_FALLBACK).slice().sort((a, b) => a.localeCompare(b));
}
function renderPcMusic(body) {
  const pick = MUSIC.baseTrack, muted = typeof SFX !== 'undefined' && !SFX.enabled;
  body.querySelector('.pcd-now').innerHTML = '🎶 現在的基地音樂：<b>' + pcdEsc(pick ? pcdTrackName(pick) : '預設（音效編輯器的設定）') + '</b>' +
    (muted ? '<span class="pcd-muted">（目前靜音中，按 M 取消）</span>' : '');
  body.querySelector('.pcd-tracks').innerHTML =
    '<button type="button" class="pcd-track' + (!pick ? ' on' : '') + '" data-track=""><span class="pcd-play">' + (!pick ? '▶' : '') + '</span>預設（音效編輯器的設定）</button>' +
    (pcd.tracks || []).map(f => '<button type="button" class="pcd-track' + (pick === f ? ' on' : '') + '" data-track="' + pcdEsc(f) + '"><span class="pcd-play">' + (pick === f ? '▶' : '') + '</span>' + pcdEsc(pcdTrackName(f)) + '</button>').join('');
}

// ---- 💣 踩地雷 ----
function initPcMines(body) {
  body.innerHTML = '<div class="pcd-mines"><div class="pcd-mlevels">' + Object.entries(PCD_LEVELS).map(([k, l]) => '<button type="button" data-level="' + k + '">' + l.name + '</button>').join('') + '</div>' +
    '<div class="pcd-mframe"><div class="pcd-mhead"><span class="pcd-led pcd-mleft"></span><button type="button" class="pcd-face" title="重新開始"></button><span class="pcd-led pcd-mtime"></span></div>' +
    '<div class="pcd-mgrid"></div></div><div class="pcd-mmsg"></div></div>';
  const grid = body.querySelector('.pcd-mgrid');
  body.querySelector('.pcd-face').addEventListener('click', () => { newPcMines(pcd.mine.level); sfx('button'); });
  body.querySelector('.pcd-mlevels').addEventListener('click', e => { const b = e.target.closest('[data-level]'); if (b) { newPcMines(b.dataset.level); sfx('button'); } });
  grid.addEventListener('pointerdown', e => { if (e.button === 0 && e.target.closest('.pcd-cell') && !pcd.mine.over) setPcFace('😮'); });
  grid.addEventListener('click', e => { const c = e.target.closest('.pcd-cell'); if (c) pcMinesOpen(+c.dataset.i); });
  grid.addEventListener('contextmenu', e => { e.preventDefault(); const c = e.target.closest('.pcd-cell'); if (c) pcMinesFlag(+c.dataset.i); });
  pcd.mine = { body };
  newPcMines('easy');
}
function newPcMines(level) {
  const m = pcd.mine, L = PCD_LEVELS[level];
  clearInterval(m.timer);
  Object.assign(m, { level, w: L.w, h: L.h, n: L.n, cells: Array.from({ length: L.w * L.h }, () => ({ mine: false, open: false, flag: false, num: 0 })),
    started: false, over: false, won: false, time: 0, opened: 0, boom: -1, timer: 0 });
  m.body.querySelectorAll('[data-level]').forEach(b => b.classList.toggle('on', b.dataset.level === level));
  const grid = m.body.querySelector('.pcd-mgrid');
  grid.style.gridTemplateColumns = 'repeat(' + L.w + ', var(--pcd-cell))';
  grid.innerHTML = m.cells.map((_, i) => '<button type="button" class="pcd-cell" data-i="' + i + '"></button>').join('');
  renderPcMines();
  fitPcMines();
}
function fitPcMines() {   // 螢幕太小（中級 16×16 放不下）：格子縮小，視窗往上移到整個看得到
  const m = pcd.mine, w = pcd.wins.mines; if (!m || !m.cells || !w || !pcd.el) return;
  const screen = pcd.el.querySelector('.pcd-screen'), H = screen.clientHeight - 34, W = screen.clientWidth;
  const size = Math.max(14, Math.min(24, Math.floor((H - 200) / m.h) - 2, Math.floor((W - 60) / m.w) - 2));
  m.body.querySelector('.pcd-mines').style.setProperty('--pcd-cell', size + 'px');
  const r = w.getBoundingClientRect(), sr = screen.getBoundingClientRect();
  if (r.bottom > sr.top + H) w.style.top = Math.max(0, H - r.height) + 'px';
  if (r.right > sr.right) w.style.left = Math.max(0, W - r.width) + 'px';
}
const pcMinesAround = (m, i) => {
  const x = i % m.w, y = Math.floor(i / m.w), out = [];
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    const nx = x + dx, ny = y + dy;
    if ((dx || dy) && nx >= 0 && ny >= 0 && nx < m.w && ny < m.h) out.push(ny * m.w + nx);
  }
  return out;
};
function placePcMines(m, safe) {   // 第一下點的那格和旁邊一圈一定沒有地雷
  const banned = new Set([safe, ...pcMinesAround(m, safe)]);
  const spots = m.cells.map((_, i) => i).filter(i => !banned.has(i));
  for (let k = 0; k < m.n; k++) { const j = k + Math.floor(Math.random() * (spots.length - k)); [spots[k], spots[j]] = [spots[j], spots[k]]; m.cells[spots[k]].mine = true; }
  m.cells.forEach((c, i) => { c.num = pcMinesAround(m, i).filter(j => m.cells[j].mine).length; });
  m.started = true;
  m.timer = setInterval(() => { if (pcDesktopOpen && m.time < 999) { m.time++; renderPcMinesHead(); } }, 1000);
}
function pcMinesOpen(i) {
  const m = pcd.mine, c = m.cells[i]; if (m.over || c.flag) return;
  if (!m.started) placePcMines(m, i);
  if (c.open) {   // 點已經翻開的數字：旁邊的旗子插夠了，就把其他格子一起翻開
    const around = pcMinesAround(m, i);
    if (!c.num || around.filter(j => m.cells[j].flag).length !== c.num) return;
    around.forEach(j => { if (!m.cells[j].flag && !m.cells[j].open) revealPcCell(m, j); });
  } else revealPcCell(m, i);
  if (!m.over && m.opened === m.w * m.h - m.n) {   // 沒有地雷的格子全翻開＝贏
    m.over = m.won = true; clearInterval(m.timer);
    m.cells.forEach(x => { if (x.mine) x.flag = true; });
    sfx('achievement');
  } else if (!m.over) sfx('blip');
  renderPcMines();
}
function revealPcCell(m, i) {
  const c = m.cells[i]; if (c.open || c.flag) return;
  if (c.mine) {   // 踩到地雷：輸了，把所有地雷翻出來
    c.open = true; m.over = true; m.boom = i; clearInterval(m.timer);
    m.cells.forEach(x => { if (x.mine && !x.flag) x.open = true; });
    sfx('error');
    return;
  }
  const stack = [i];   // 數字 0 的格子：旁邊的一路自動翻開
  while (stack.length) {
    const j = stack.pop(), x = m.cells[j]; if (x.open || x.flag) continue;
    x.open = true; m.opened++;
    if (!x.num) pcMinesAround(m, j).forEach(k => { if (!m.cells[k].open) stack.push(k); });
  }
}
function pcMinesFlag(i) {
  const m = pcd.mine, c = m.cells[i]; if (m.over || c.open) return;
  c.flag = !c.flag; sfx('switch'); renderPcMines();
}
function setPcFace(f) { const b = pcd.mine && pcd.mine.body.querySelector('.pcd-face'); if (b && b.textContent !== f) b.textContent = f; }
const pcLed = n => (n < 0 ? '-' + String(-n).padStart(2, '0') : String(n).padStart(3, '0')).slice(-3);
function renderPcMinesHead() {
  const m = pcd.mine;
  m.body.querySelector('.pcd-mleft').textContent = pcLed(m.n - m.cells.filter(c => c.flag).length);
  m.body.querySelector('.pcd-mtime').textContent = pcLed(m.time);
}
function renderPcMines() {
  const m = pcd.mine;
  renderPcMinesHead();
  setPcFace(m.won ? '😎' : m.over ? '😵' : '🙂');
  m.body.querySelector('.pcd-mmsg').textContent = m.won ? '全部找出來了！花了 ' + m.time + ' 秒。按笑臉再玩一次' : m.over ? '踩到地雷了…按笑臉重新開始' : '左鍵翻開、右鍵插旗';
  m.body.querySelectorAll('.pcd-cell').forEach((b, i) => {
    const c = m.cells[i];
    let cls = 'pcd-cell', txt = '';
    if (c.open) {
      cls += ' open';
      if (c.mine) { cls += ' mine' + (i === m.boom ? ' boom' : ''); txt = '✹'; }
      else if (c.num) { cls += ' n' + c.num; txt = c.num; }
    } else if (c.flag) {
      cls += ' flag' + (m.over && !m.won && !c.mine ? ' wrong' : ''); txt = m.over && !m.won && !c.mine ? '✕' : '⚑';
    }
    if (b.className !== cls) b.className = cls;
    if (b.textContent !== String(txt)) b.textContent = txt;
  });
}

window.addEventListener('resize', () => { if (pcDesktopOpen) fitPcMines(); });
window.addEventListener('pointerup', () => { if (pcDesktopOpen && pcd.mine && pcd.mine.cells && !pcd.mine.over) setPcFace('🙂'); });   // 按住格子時笑臉張嘴，放開變回來

// 開著的時候：Esc＝關掉開始選單／最上面的視窗／關機；其他按鍵都不要傳給遊戲（圖鑑開著時讓圖鑑自己處理）
window.addEventListener('keydown', e => {
  if (!pcDesktopOpen || (typeof bestiaryOpen !== 'undefined' && bestiaryOpen)) return;
  if (e.key === 'Escape' && !e.repeat) {
    const top = topPcWin();
    if (!pcd.el.querySelector('.pcd-start').classList.contains('hidden')) toggleStartMenu(false);
    else if (top) closePcWin(top.dataset.app);
    else shutdownPcDesktop();
  } else if (e.key === 'Enter' && pcd.sel) openPcApp(pcd.sel);
  if (e.key === ' ' || e.key === 'Tab' || e.key.startsWith('Arrow')) e.preventDefault();
  e.stopImmediatePropagation();
}, { capture: true });
