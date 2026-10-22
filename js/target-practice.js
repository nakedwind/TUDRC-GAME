/* ===== 射擊練習（B-1 射擊訓練室）=====
   走到放手槍的桌子（tile_training_gun_table）旁邊 → 提示「練習射擊」→ 按 Space：
   ・播換彈聲，畫面壓黑加模糊，中間出現大張靶紙；用滑鼠點靶紙開槍，彈孔留在靶紙上
   ・計分：弱點 15（笑臉靶紙的呆毛）、紅心 10、三圈 9／8／7、人形其他地方 5、打在紙上 0（壓線算內圈）
   ・彈匣：發數、換彈時間跟溫特目前的手槍一樣（升級後也會變）；打完自動換彈，R 手動換彈
   ・兩種模式（上方分頁）：
       自由練習：一個彈匣算一次成績，記錄「一匣最高分」（依彈匣發數分開記）
       限時挑戰：30 秒內拿最高分；靶紙會左右移動、越來越快，偶爾轉成側面（這時打不到）
   ・N 或「換新靶紙」清掉彈孔，從 TARGET_PRACTICE.images 隨機抽一張新的；「停止練習」或 Esc 離開
   提示在 js/render.js、按鍵在 js/game.js 的互動鍵那段；開著的時候玩家停住（js/game.js 的 frame）。
*/
const TARGET_PRACTICE = {
  tables: ['tile_training_gun_table'],                     // 哪些素材是「可以練習射擊的桌子」
  reach: 26,                                               // 離桌子邊緣幾像素內可以用
  images: [                                                // 靶紙：每次換新靶紙時隨機抽一張（機率一樣；想讓某張多出現就重複列）
    'images/地下訓練室/training-shooting-lane02.png',
    'images/地下訓練室/training-shooting-lane03.png',      // 笑臉靶紙（頭上的紅色呆毛是弱點）
  ],
  height: .6,                                              // 靶紙高度佔遊戲畫面的比例（會取整數倍放大，像素才整齊）
  holeRes: 2,                                              // 彈孔畫得比靶紙像素細幾倍
  maxHoles: 300,                                           // 最多留幾個彈孔（太多就從最舊的蓋掉）
  cooldown: 120,                                           // 兩槍之間至少隔幾毫秒
  score: { bull: 10, rings: [9, 8, 7], body: 5, weak: 15 }, // 紅心、由內到外三圈、人形其他地方、弱點（紅心以外的紅色，例如笑臉靶紙的呆毛）
  timed: {
    seconds: 30, countdown: 3,                             // 挑戰幾秒、開始前倒數幾秒
    sway: .17, swayHz: [.22, .62],                         // 左右移動幅度（畫面寬的比例）、速度（開始 → 結束，每秒來回幾次）
    swayY: .035, swayYRate: 1.7,                           // 上下移動幅度（畫面高的比例）、上下比左右快幾倍（走出 8 字形，比較難預測）
    flipEvery: [3.5, 6], flipTime: 1,                      // 每隔幾秒轉成側面一次、轉一次多久
  },
};
const TP_BEST_KEY = 'tudrc_target_best_v1';   // 最佳紀錄：{ free: { 彈匣發數: 分數 }, timed: 分數 }
let targetPracticeOpen = false;
const targetHoles = [];   // 彈孔：x、y 是靶紙圖片上的像素位置，seed 讓每個洞的破口形狀固定
let tpBest = { free: {}, timed: 0 };
try { tpBest = Object.assign(tpBest, JSON.parse(localStorage.getItem(TP_BEST_KEY) || '{}')); } catch (_) {}
const saveTpBest = () => { try { localStorage.setItem(TP_BEST_KEY, JSON.stringify(tpBest)); } catch (_) {} };
const tpMag = () => (typeof PLAYER_ATK !== 'undefined' && PLAYER_ATK.mag) || 6;
const tpReloadTime = () => (typeof PLAYER_ATK !== 'undefined' && PLAYER_ATK.reloadTime) || 2;

// 這次練習的狀態
const tp = {
  mode: 'free', ammo: 0, reloadT: 0,
  magScore: 0, magShots: 0, magDone: false, newBest: false,   // 自由練習：這一匣
  run: null,                                                  // 限時挑戰：{ phase: 'countdown'|'run'|'done', t, score, shots, sway, flipT, nextFlip }
};

// ---- 桌子在哪、靠近了沒 ----
function targetTableSpots() {
  if (!MAP) return [];
  const spots = [];
  for (const s of MAP.stamps || []) {
    if (!TARGET_PRACTICE.tables.includes(s.id)) continue;
    const t = mapTileById(s.id); if (!t) continue;
    const x0 = OX + s.c * CELL + (s.ox || 0), y0 = OY + s.r * CELL + (s.oy || 0);
    const w = mapStampW(s, t) * CELL, h = mapStampH(s, t) * CELL;
    spots.push({ x0, y0, x1: x0 + w, y1: y0 + h, x: x0 + w / 2, top: y0 });
  }
  return spots;
}
function targetTableNearPlayer() {
  const p = G && G.player;
  if (!p || p.sitting || p.hp <= 0 || !G.running || G.over) return null;
  let best = null, bd = TARGET_PRACTICE.reach;
  for (const s of targetTableSpots()) {
    const dx = Math.max(s.x0 - p.x, 0, p.x - s.x1), dy = Math.max(s.y0 - p.y, 0, p.y - s.y1);
    const d = Math.hypot(dx, dy);
    if (d <= bd) { bd = d; best = s; }
  }
  return best;
}
function useTargetTableNearPlayer() {
  if (!targetTableNearPlayer()) return false;
  openTargetPractice();
  return true;
}

// ---- 畫面 ----
let tpEl = null, tpPaper = null, tpImg = null, tpCanvas = null, tpPops = null, tpBig = null;
let tpAmmoEl = null, tpScoreEl = null, tpStartBtn = null, tpNewBtn = null, tpPix = null, tpCenter = null, tpLastShot = 0;
function buildTargetPractice() {
  tpEl = document.createElement('div');
  tpEl.id = 'targetPractice';
  tpEl.className = 'hidden';
  tpEl.setAttribute('role', 'dialog');
  tpEl.setAttribute('aria-modal', 'true');
  tpEl.setAttribute('aria-label', '射擊練習');
  tpEl.innerHTML = '<div class="tp-tabs"><button type="button" data-mode="free">自由練習</button><button type="button" data-mode="timed">限時挑戰</button></div>'
    + '<div class="tp-paper"><img alt="靶紙" draggable="false"><canvas></canvas><div class="tp-pops"></div></div>'
    + '<div class="tp-big" hidden></div>'
    + '<div class="tp-hud"><div class="tp-ammo"></div><div class="tp-score"></div></div>'
    + '<div class="tp-actions"><button type="button" class="tp-new">換新靶紙 <kbd>N</kbd></button>'
    + '<button type="button" class="tp-start">開始挑戰</button>'
    + '<button type="button" class="tp-stop">停止練習</button></div>';
  document.getElementById('wrap').appendChild(tpEl);
  tpPaper = tpEl.querySelector('.tp-paper');
  tpImg = tpEl.querySelector('img');
  tpCanvas = tpEl.querySelector('canvas');
  tpPops = tpEl.querySelector('.tp-pops');
  tpBig = tpEl.querySelector('.tp-big');
  tpAmmoEl = tpEl.querySelector('.tp-ammo');
  tpScoreEl = tpEl.querySelector('.tp-score');
  tpStartBtn = tpEl.querySelector('.tp-start');
  tpNewBtn = tpEl.querySelector('.tp-new');
  tpImg.onload = () => { layoutTargetPractice(); useTargetPixels(); drawTargetHoles(); };
  // 每張靶紙先載好、讀好像素（計分用），換紙時就不用等
  for (const src of new Set(TARGET_PRACTICE.images)) {
    const im = new Image();
    im.onload = () => { tpPixCache.set(src, readTargetPixels(im)); if (tpImg.dataset.src === src) useTargetPixels(); };
    im.src = tpSrc(src);
  }
  pickTargetImage();
  tpEl.querySelector('.tp-stop').addEventListener('click', closeTargetPractice);
  tpNewBtn.addEventListener('click', newTargetPaper);
  tpStartBtn.addEventListener('click', startTimedRun);
  tpEl.querySelectorAll('.tp-tabs [data-mode]').forEach(b => b.addEventListener('click', () => setTpMode(b.dataset.mode)));
  // 點在靶紙以外也算開了一槍（只是沒打中紙）
  tpEl.addEventListener('pointerdown', e => {
    if (e.button !== 0 || e.target.closest('.tp-actions, .tp-tabs, .tp-hud')) return;
    e.preventDefault();
    shootTarget(e);
  });
  tpEl.addEventListener('contextmenu', e => e.preventDefault());
  window.addEventListener('resize', () => { if (targetPracticeOpen) layoutTargetPractice(); });
}
// 靶紙放大成整數倍（像素才不會粗細不均），高度約佔遊戲畫面 TARGET_PRACTICE.height
function layoutTargetPractice() {
  const w = tpImg.naturalWidth, h = tpImg.naturalHeight; if (!w || !h) return;
  const k = Math.max(1, Math.floor(tpEl.clientHeight * TARGET_PRACTICE.height / h));
  tpPaper.style.width = w * k + 'px'; tpPaper.style.height = h * k + 'px';
  const r = TARGET_PRACTICE.holeRes;
  if (tpCanvas.width !== w * r || tpCanvas.height !== h * r) { tpCanvas.width = w * r; tpCanvas.height = h * r; drawTargetHoles(); }
}
// ---- 換靶紙圖片：從 TARGET_PRACTICE.images 隨機抽一張 ----
const tpPixCache = new Map();   // 每張靶紙的像素與紅心位置
// 實際載入的圖片網址：直接雙擊開遊戲（file://）時瀏覽器不准讀像素（全部會變 5 分），
// 改用 data/target-papers.js 內嵌的版本（tools/build-target-papers.py 產生）；用網址開遊戲照樣讀原始圖片
const tpSrc = src => (location.protocol === 'file:' && typeof TARGET_PAPER_DATA !== 'undefined' && TARGET_PAPER_DATA[src]) || src;
function pickTargetImage() {
  const list = TARGET_PRACTICE.images, src = list[Math.floor(Math.random() * list.length)];
  tpImg.dataset.src = src;
  if (tpImg.getAttribute('src') !== tpSrc(src)) tpImg.src = tpSrc(src);
  useTargetPixels();
}
function useTargetPixels() {
  const info = tpPixCache.get(tpImg.dataset.src);
  tpPix = info ? info.pix : null; tpCenter = info ? info.center : null; tpBull = info ? info.bull : null;
}
// 讀靶紙的像素（計分用）：紅心＝最大的一塊紅色（笑臉靶紙頭上的紅色呆毛不算）；雙擊開檔時讀不到，就全部當作打中人形
let tpBull = null;
const tpIsRed = (d, i) => d[i + 3] >= 40 && d[i] > 180 && d[i + 1] < 120;
function readTargetPixels(im) {
  try {
    const c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight;
    const g = c.getContext('2d'); g.drawImage(im, 0, 0);
    const W = c.width, H = c.height, data = g.getImageData(0, 0, W, H).data, seen = new Uint8Array(W * H);
    let bull = null;
    for (let s = 0; s < W * H; s++) {   // 把相連的紅色像素分成一塊一塊，留最大的那塊
      if (seen[s] || !tpIsRed(data, s * 4)) continue;
      const blob = { n: 0, sx: 0, sy: 0, x0: W, y0: H, x1: 0, y1: 0 }, stack = [s]; seen[s] = 1;
      while (stack.length) {
        const p = stack.pop(), x = p % W, y = (p - x) / W;
        blob.n++; blob.sx += x; blob.sy += y;
        blob.x0 = Math.min(blob.x0, x); blob.x1 = Math.max(blob.x1, x); blob.y0 = Math.min(blob.y0, y); blob.y1 = Math.max(blob.y1, y);
        for (const q of [x > 0 && p - 1, x < W - 1 && p + 1, y > 0 && p - W, y < H - 1 && p + W]) {
          if (q !== false && !seen[q] && tpIsRed(data, q * 4)) { seen[q] = 1; stack.push(q); }
        }
      }
      if (!bull || blob.n > bull.n) bull = blob;
    }
    return { pix: { w: W, h: H, data }, bull,
      center: bull ? { x: bull.sx / bull.n + .5, y: bull.sy / bull.n + .5 } : { x: W / 2, y: H * .6 } };
  } catch (_) { return null; }
}
// 某個像素是什麼：bull 紅心、weak 弱點、ring 灰色環線、body 黑色人形、paper 紙、none 透明
function tpKind(x, y) {
  if (!tpPix) return 'body';
  x = Math.floor(x); y = Math.floor(y);
  if (x < 0 || y < 0 || x >= tpPix.w || y >= tpPix.h) return 'none';
  const i = (y * tpPix.w + x) * 4, d = tpPix.data, r = d[i], g = d[i + 1], b = d[i + 2];
  if (d[i + 3] < 40) return 'none';
  if (tpIsRed(d, i)) return tpBull && x >= tpBull.x0 && x <= tpBull.x1 && y >= tpBull.y0 && y <= tpBull.y1 ? 'bull' : 'weak';   // 紅心以外的紅色（呆毛）＝弱點
  if (Math.abs(r - 137) < 14 && Math.abs(g - 142) < 14 && Math.abs(b - 140) < 14) return 'ring';
  if (r + g + b < 200) return 'body';
  return 'paper';
}
// 計分：從紅心往彈點畫一條線，數經過幾條環線就知道在第幾圈（壓在線上算內圈）
function scoreAt(x, y) {
  const S = TARGET_PRACTICE.score, kind = tpKind(x, y);
  if (!tpPix) return S.body;
  if (kind === 'bull') return S.bull;
  if (kind === 'weak') return S.weak;
  if (kind !== 'body' && kind !== 'ring') return 0;
  const len = Math.hypot(x - tpCenter.x, y - tpCenter.y), steps = Math.ceil(len * 4);
  let lines = 0, onLine = false;
  for (let i = 1; i < steps; i++) {
    const t = i / steps, ring = tpKind(tpCenter.x + (x - tpCenter.x) * t, tpCenter.y + (y - tpCenter.y) * t) === 'ring';
    if (ring && !onLine) lines++;
    onLine = ring;
  }
  if (kind === 'ring' && onLine) lines--;   // 彈點本身壓在環線上：那條線不算跨過
  return lines < S.rings.length ? S.rings[Math.max(0, lines)] : S.body;
}

// ---- 開槍 ----
function shootTarget(e) {
  const now = performance.now();
  if (tpSwapping || now - tpLastShot < TARGET_PRACTICE.cooldown) return;   // 換靶紙的時候不能開槍
  const run = tp.run;
  if (tp.mode === 'timed' && (!run || run.phase !== 'run')) return;      // 限時挑戰：按「開始挑戰」才算數
  if (tp.reloadT > 0) return;                                            // 換彈中
  if (tp.ammo <= 0) { startTpReload(); return; }
  tpLastShot = now;
  tp.ammo--;
  if (typeof sfx === 'function') sfx('gunshot');
  const rect = tpPaper.getBoundingClientRect();   // 先量位置，再讓靶紙震（震動中的位置才不會影響這一槍）
  tpPaper.classList.remove('kick'); void tpPaper.offsetWidth; tpPaper.classList.add('kick');   // 靶紙被打到震一下
  if (tp.mode === 'free' && tp.magDone) { tp.magScore = 0; tp.magShots = 0; tp.magDone = false; tp.newBest = false; }   // 新的一匣
  const x = (e.clientX - rect.left) / rect.width * tpImg.naturalWidth, y = (e.clientY - rect.top) / rect.height * tpImg.naturalHeight;
  const turned = run && run.phase === 'run' && run.flipT > 0 && tpFlipScale(run) < .6;   // 靶紙轉成側面：打不到
  const onPaper = !turned && x >= 0 && y >= 0 && x < tpImg.naturalWidth && y < tpImg.naturalHeight && tpKind(x, y) !== 'none';
  const points = onPaper ? scoreAt(x, y) : 0;
  if (onPaper) {
    targetHoles.push({ x, y, seed: Math.floor(Math.random() * 1e9) });
    if (targetHoles.length > TARGET_PRACTICE.maxHoles) targetHoles.shift();
    drawTargetHoles();
    tpPop(x, y, points);
  }
  if (tp.mode === 'free') {
    tp.magScore += points; tp.magShots++;
    if (tp.ammo <= 0) finishMagazine();
  } else { run.score += points; run.shots++; }
  if (tp.ammo <= 0) startTpReload();   // 打完自動換彈
  renderTpHud();
}
// 彈點旁邊跳出分數
function tpPop(x, y, points) {
  const el = document.createElement('div');
  const weak = points === TARGET_PRACTICE.score.weak && tpKind(x, y) === 'weak';
  el.className = 'tp-pop' + (weak ? ' weak' : points >= 10 ? ' bull' : points === 0 ? ' zero' : '');
  el.textContent = weak ? '弱點 +' + points : points ? '+' + points : '0';
  el.style.left = x / tpImg.naturalWidth * 100 + '%'; el.style.top = y / tpImg.naturalHeight * 100 + '%';
  tpPops.appendChild(el);
  setTimeout(() => el.remove(), 750);
}
// 自由練習：打完一整匣，看看有沒有破紀錄（依彈匣發數分開記，升級手槍後重新算）
function finishMagazine() {
  tp.magDone = true;
  const mag = tpMag(), best = tpBest.free[mag] || 0;
  if (tp.magScore > best) {
    tpBest.free[mag] = tp.magScore; saveTpBest(); tp.newBest = best > 0;
    if (tp.newBest) tpShowBig('新紀錄！', 'record');
  }
}
function startTpReload() {
  if (tp.reloadT > 0 || tp.ammo >= tpMag()) return;
  if (tp.mode === 'free' && tp.magShots > 0 && !tp.magDone) { tp.magScore = 0; tp.magShots = 0; }   // 沒打完就換彈：這一匣不算成績
  tp.reloadT = tpReloadTime();
  if (typeof sfx === 'function') sfx('reload');
}

// ---- 換新靶紙：舊紙往上抽走、新紙放下來，彈孔清空（動畫中間才清，看起來像真的換了一張）----
let tpSwapping = false;
function newTargetPaper() {
  if (tpSwapping || !tpPaper || (tp.run && tp.run.phase !== 'done')) return;   // 挑戰中不能換
  tpSwapping = true;
  if (typeof sfx === 'function') sfx('switch');
  tpPaper.classList.remove('kick', 'swap'); void tpPaper.offsetWidth; tpPaper.classList.add('swap');
  setTimeout(() => { targetHoles.length = 0; drawTargetHoles(); pickTargetImage(); }, 160);   // 紙抽走的瞬間換成新的一張（隨機抽）
  setTimeout(() => { tpPaper.classList.remove('swap'); tpSwapping = false; }, 360);
}

// ---- 模式 ----
function setTpMode(mode) {
  if (tp.mode === mode) return;
  tp.mode = mode;
  endTimedRun(true);
  tp.ammo = tpMag(); tp.reloadT = 0; tp.magScore = 0; tp.magShots = 0; tp.magDone = false; tp.newBest = false;
  if (typeof sfx === 'function') sfx('switch');
  renderTpHud();
}
// ---- 限時挑戰 ----
const tpRand = ([a, b]) => a + Math.random() * (b - a);
function startTimedRun() {
  if (tp.mode !== 'timed') return;
  const T = TARGET_PRACTICE.timed;
  targetHoles.length = 0; drawTargetHoles(); pickTargetImage();   // 每次挑戰都換一張新靶紙（隨機抽）
  tp.ammo = tpMag(); tp.reloadT = 0;
  tp.run = { phase: 'countdown', t: T.countdown, score: 0, shots: 0, sway: 0, flipT: 0, nextFlip: tpRand(T.flipEvery), lastTick: Math.ceil(T.countdown) + 1, newBest: false };
  tpPaper.style.translate = ''; tpPaper.style.scale = '';
  renderTpHud();
}
function endTimedRun(abort) {
  const run = tp.run; if (!run) return;
  tpPaper.style.translate = ''; tpPaper.style.scale = ''; tpPaper.style.filter = '';
  tpBig.hidden = true;
  if (abort) { tp.run = null; return; }
  run.phase = 'done';
  if (typeof achieveMax === 'function') { achieveMax('tpBestScore', run.score); achieveMax('tpMostShots', run.shots); }   // 成就：限時挑戰的分數、發數
  if (run.score > (tpBest.timed || 0)) { run.newBest = (tpBest.timed || 0) > 0; tpBest.timed = run.score; saveTpBest(); }
  tpShowBig(run.newBest ? '新紀錄！' : '時間到', run.newBest ? 'record' : '');
  if (typeof sfx === 'function') sfx(run.newBest ? 'itemReveal' : 'switch');
}
// 轉成側面的寬度比例（1＝正面，接近 0＝側面）
const tpFlipScale = run => Math.max(.04, Math.abs(Math.cos((1 - run.flipT / TARGET_PRACTICE.timed.flipTime) * Math.PI)));
function tpShowBig(text, cls) {
  tpBig.textContent = text; tpBig.className = 'tp-big ' + (cls || ''); tpBig.hidden = false;
  tpBig.style.animation = 'none'; void tpBig.offsetWidth; tpBig.style.animation = '';
  clearTimeout(tpShowBig.timer);
  if (text.length > 1) tpShowBig.timer = setTimeout(() => { tpBig.hidden = true; }, 1300);
}

// ---- 每一幀：換彈進度、挑戰的計時與靶紙移動、更新文字 ----
let tpLoopLast = 0;
function tpLoop(now) {
  if (!targetPracticeOpen) return;
  const dt = Math.max(0, Math.min(.05, (now - (tpLoopLast || now)) / 1000)); tpLoopLast = now;
  if (tp.reloadT > 0) { tp.reloadT -= dt; if (tp.reloadT <= 0) { tp.reloadT = 0; tp.ammo = tpMag(); } }
  const run = tp.run, T = TARGET_PRACTICE.timed;
  if (run && run.phase === 'countdown') {
    run.t -= dt;
    const n = Math.ceil(run.t);
    if (n !== run.lastTick && n > 0) { run.lastTick = n; tpShowBig(String(n), 'count'); if (typeof sfx === 'function') sfx('switch'); }
    if (run.t <= 0) { run.phase = 'run'; run.t = T.seconds; tpShowBig('開始！', 'go'); }
  } else if (run && run.phase === 'run') {
    run.t -= dt;
    const prog = 1 - Math.max(0, run.t) / T.seconds;
    run.sway += dt * Math.PI * 2 * (T.swayHz[0] + (T.swayHz[1] - T.swayHz[0]) * prog);   // 越到後面晃越快
    tpPaper.style.translate = Math.round(Math.sin(run.sway) * tpEl.clientWidth * T.sway) + 'px '
      + Math.round(Math.sin(run.sway * T.swayYRate + 1.1) * tpEl.clientHeight * T.swayY) + 'px';
    if (run.flipT > 0) {
      run.flipT -= dt;
      const sx = run.flipT > 0 ? tpFlipScale(run) : 1;
      tpPaper.style.scale = sx + ' 1'; tpPaper.style.filter = 'brightness(' + (.55 + .45 * sx) + ')';
    } else if ((run.nextFlip -= dt) <= 0) { run.flipT = T.flipTime; run.nextFlip = tpRand(T.flipEvery); }
    if (run.t <= 0) endTimedRun(false);
  }
  renderTpHud();
  requestAnimationFrame(tpLoop);
}
function renderTpHud() {
  if (!tpEl) return;
  const mag = tpMag(), run = tp.run;
  tpEl.querySelectorAll('.tp-tabs [data-mode]').forEach(b => b.classList.toggle('active', b.dataset.mode === tp.mode));
  // 子彈：剩幾發；換彈中顯示進度條
  let ammo = '';
  if (tp.reloadT > 0) ammo = '<span class="tp-reload"><i style="width:' + Math.round((1 - tp.reloadT / tpReloadTime()) * 100) + '%"></i></span>換彈中';
  else { for (let i = 0; i < mag; i++) ammo += '<i class="' + (i < tp.ammo ? 'on' : '') + '"></i>'; ammo += '<small>R 換彈</small>'; }
  if (tpAmmoEl.dataset.v !== ammo) { tpAmmoEl.innerHTML = ammo; tpAmmoEl.dataset.v = ammo; }
  let text;
  if (tp.mode === 'free') {
    const best = tpBest.free[mag] || 0;
    text = tp.magDone ? '這一匣 <b>' + tp.magScore + '</b> 分' + (tp.newBest ? ' <em>新紀錄！</em>' : '')
      : '這一匣 <b>' + tp.magScore + '</b> 分（' + tp.magShots + ' / ' + mag + ' 發）';
    text += '・最佳 <b>' + best + '</b>';
  } else if (!run) text = TARGET_PRACTICE.timed.seconds + ' 秒內打出最高分，靶紙會移動、轉成側面・最佳 <b>' + (tpBest.timed || 0) + '</b>';
  else if (run.phase === 'countdown') text = '準備…';
  else if (run.phase === 'run') text = '剩 <b>' + Math.max(0, run.t).toFixed(1) + '</b> 秒・得分 <b>' + run.score + '</b>';
  else text = '挑戰結束：<b>' + run.score + '</b> 分（' + run.shots + ' 發）' + (run.newBest ? ' <em>新紀錄！</em>' : '') + '・最佳 <b>' + (tpBest.timed || 0) + '</b>';
  if (tpScoreEl.dataset.v !== text) { tpScoreEl.innerHTML = text; tpScoreEl.dataset.v = text; }
  tpStartBtn.hidden = tp.mode !== 'timed';
  tpStartBtn.textContent = !run ? '開始挑戰' : run.phase === 'done' ? '再挑戰一次' : '重新開始';
  tpNewBtn.disabled = !!(run && run.phase !== 'done');
}

// ---- 彈孔：像素風（深色洞＋被撕開的紙邊＋淡淡的燒痕）----
function drawTargetHoles() {
  if (!tpCanvas) return;
  const g = tpCanvas.getContext('2d'), r = TARGET_PRACTICE.holeRes;
  g.clearRect(0, 0, tpCanvas.width, tpCanvas.height);
  for (const h of targetHoles) {
    let s = h.seed;
    const rand = () => (s = (s * 1103515245 + 12345) % 2147483648) / 2147483648;
    const cx = Math.round(h.x * r), cy = Math.round(h.y * r);
    const tear = Array.from({ length: 8 }, () => rand());   // 紙邊破口：八個方向各自長短不一
    for (let dy = -5; dy <= 5; dy++) for (let dx = -5; dx <= 5; dx++) {
      const d = Math.hypot(dx, dy);
      const dir = Math.round((Math.atan2(dy, dx) / (Math.PI * 2) + 1) * 8) % 8;
      if (d <= 1.6) g.fillStyle = '#0d0907';                                  // 洞
      else if (d <= 2.4) g.fillStyle = '#2a211b';                             // 洞的邊緣
      else if (d <= 2.4 + tear[dir] * 1.6) g.fillStyle = 'rgba(244,236,214,.9)';   // 撕開翻起的紙
      else if (d <= 4.6 && rand() < .35) g.fillStyle = 'rgba(40,30,22,.28)';   // 燒痕
      else continue;
      g.fillRect(cx + dx, cy + dy, 1, 1);
    }
  }
}

function openTargetPractice() {
  if (targetPracticeOpen) return;
  if (!tpEl) buildTargetPractice();
  targetPracticeOpen = true;
  if (typeof keys !== 'undefined') Object.keys(keys).forEach(k => { keys[k] = false; });   // 放掉方向鍵，關掉後不會自己走
  if (typeof sfx === 'function') sfx('reload');
  tp.ammo = tpMag(); tp.reloadT = 0; tp.magScore = 0; tp.magShots = 0; tp.magDone = false; tp.newBest = false;
  tpEl.classList.remove('hidden');
  layoutTargetPractice(); drawTargetHoles(); renderTpHud();
  tpLoopLast = 0; requestAnimationFrame(tpLoop);
}
function closeTargetPractice() {
  if (!targetPracticeOpen) return;
  targetPracticeOpen = false;
  endTimedRun(true);
  tpEl.classList.add('hidden');
  if (typeof sfx === 'function') sfx('menu');
}
// 開著的時候：Esc 離開、R 換彈、N 換新靶紙；其他按鍵都不要傳給遊戲（不會走路、開背包、互動）
window.addEventListener('keydown', e => {
  if (!targetPracticeOpen) return;
  const k = e.key.toLowerCase();
  if (k === 'escape') closeTargetPractice();
  else if (!e.repeat && k === 'r') startTpReload();
  else if (!e.repeat && k === 'n') newTargetPaper();
  if (k === ' ' || k.startsWith('arrow')) e.preventDefault();
  e.stopImmediatePropagation();
}, { capture: true });
