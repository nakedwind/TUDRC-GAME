/* ===== 🎬 劇情編輯器（劇情編輯器.html）=====
   資料存在 data/story-scenes.js（STORY_SCENES），遊戲的播放器在 js/story-scene.js。
   ・左邊：選哪一段劇情、劇情設定、場上的人與鏡頭清單、檢查（找不到的人、站在牆裡…）。
   ・中間：劇情地圖。點一下選取、按住拖曳移動；選到某一頁對話時，畫出那一頁的走位目標與鏡頭。
   ・右邊：每一頁的台詞與演出、選取物件的屬性、說話者頭像。
   ・編輯自動存在瀏覽器（tudrc_story_scenes_v1），跟專案檔三方合併（js/draft-sync.js）；
     「▶ 預覽」開遊戲並使用草稿；「💾 存到專案」寫進 data/story-scenes.js。
*/
const STORY_STORE = 'tudrc_story_scenes_v1';   // 遊戲預覽（&storyDraft=1）也讀這個
const C = 40;                                   // 一格幾像素（跟遊戲一樣）
const $ = id => document.getElementById(id);
const clone = o => JSON.parse(JSON.stringify(o));
const r1 = v => Math.round(v * 10) / 10;
function status(msg, err = false) { const el = $('status'); el.textContent = msg; el.classList.toggle('error', !!err); }
// 建 DOM 的小工具：h('button', { class: 'small', onclick: fn }, '文字')
function h(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') e.className = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (k === 'value') e.value = v;
    else if (k === 'checked') e.checked = !!v;
    else if (v !== undefined && v !== null && v !== false) e.setAttribute(k, v === true ? '' : v);
  }
  for (const k of kids.flat()) if (k != null && k !== false) e.append(k);
  return e;
}

// ---- 選項 ----
const DIRS = [['left', '朝左'], ['right', '朝右'], ['front', '正面'], ['back', '背面']];
const dirName = d => (DIRS.find(x => x[0] === d) || [d, d])[1];
const storyMaps = typeof STORY_MAPS !== 'undefined' ? STORY_MAPS : [];
const monsterTypes = (typeof MONSTERS_DEFAULT !== 'undefined' ? MONSTERS_DEFAULT : []).map(m => [m.id, m.name || m.id]);
const monsterSpec = id => (typeof MONSTERS_DEFAULT !== 'undefined' ? MONSTERS_DEFAULT : []).find(m => m.id === id);
// 角色圖資料夾：角色資料頁的人（戰鬥服 _B、便服 _A）＋路人（mob_A 嚮導、mob_B 哨兵）
const SPRITES = [...new Set([...Object.values(typeof CHARACTERS !== 'undefined' ? CHARACTERS : {}).flatMap(c => c.sprite ? [c.sprite, c.sprite.replace(/_[A-Z]$/, '_A')] : []), 'mob_A', 'mob_B'])].sort();
document.body.append(h('datalist', { id: 'spriteList' }, SPRITES.map(s => h('option', { value: s }))));
const faceSrc = sprite => sprite ? 'images/character/' + sprite + '/' + sprite.replace('_', '') + '_0000_Front.png' : '';

// ---- 資料 ----
let data = null, sceneId = null, sel = null, beatSel = 0, pick = null, tab = 'beats';
function loadData(useFile) {
  let d = null;
  if (!useFile) try { d = DraftSync.load(STORY_STORE, typeof STORY_SCENES !== 'undefined' ? STORY_SCENES : {}, { label: '劇情' }); } catch (_) {}
  data = d && typeof d === 'object' ? d : clone(typeof STORY_SCENES !== 'undefined' ? STORY_SCENES : {});
  for (const s of Object.values(data)) normalize(s);
  if (!data[sceneId]) sceneId = Object.keys(data)[0] || null;
}
function normalize(s) {   // 缺的欄位補成空的，編輯器才不用到處判斷
  for (const k of ['actors', 'wounded', 'monsters', 'shooters', 'medics', 'beats']) if (!Array.isArray(s[k])) s[k] = [];
  for (const k of ['cameras', 'points', 'portraits']) if (!s[k] || typeof s[k] !== 'object') s[k] = {};
  for (const m of s.medics) if (!Array.isArray(m.route)) m.route = [];
}
let saveTimer = null;
function saveDraft() { try { localStorage.setItem(STORY_STORE, JSON.stringify(data)); status('已自動儲存到這台瀏覽器。'); } catch (e) { status('暫存失敗：' + e.message, true); } }
function commit(rerender = true) { clearTimeout(saveTimer); saveTimer = setTimeout(saveDraft, 250); drawSoon(); if (rerender) renderPanels(); else renderChecks(); }
const scene = () => data[sceneId];
const curMap = () => storyMaps.find(m => m.id === scene()?.map) || null;
const actorName = id => { const a = scene().actors.find(x => x.id === id); return a ? (a.name || a.id) : id; };

// ---- 匯出：key 都加引號；短的物件、陣列擠成一行，長的展開 ----
function inline(v) {
  if (v === null || typeof v !== 'object') return JSON.stringify(v);
  if (Array.isArray(v)) return '[' + v.map(inline).join(', ') + ']';
  const e = Object.entries(v).filter(([, x]) => x !== undefined);
  return e.length ? '{ ' + e.map(([k, x]) => JSON.stringify(k) + ': ' + inline(x)).join(', ') + ' }' : '{}';
}
function fmt(v, ind = '') {
  const one = inline(v);
  if (v === null || typeof v !== 'object' || one.length + ind.length <= 150) return one;
  const ni = ind + '  ';
  if (Array.isArray(v)) return '[\n' + v.map(x => ni + fmt(x, ni)).join(',\n') + '\n' + ind + ']';
  return '{\n' + Object.entries(v).filter(([, x]) => x !== undefined).map(([k, x]) => ni + JSON.stringify(k) + ': ' + fmt(x, ni)).join(',\n') + '\n' + ind + '}';
}
function storyExportText() {
  const out = {};
  for (const [id, s] of Object.entries(data)) {   // 空的分類不寫進檔案
    const o = {};
    for (const [k, v] of Object.entries(s)) if (!(Array.isArray(v) && !v.length) && !(v && typeof v === 'object' && !Array.isArray(v) && !Object.keys(v).length)) o[k] = v;
    out[id] = o;
  }
  return '/* 劇情資料：由「🎬 劇情編輯器」編輯；地圖編輯器重新匯出不會覆蓋這裡。\n' +
    '   每段劇情用 id 當名字，map＝在哪張劇情地圖演出。座標一律是格子（欄, 列，可填小數）。 */\n' +
    'const STORY_SCENES = ' + fmt(out) + ';\n';
}

// ---- 地圖畫面 ----
const tileMap = new Map((typeof SHARED_TILES !== 'undefined' ? SHARED_TILES : []).map(t => [t.id, t]));
const imgCache = {};
function image(src) {
  if (!src) return null;
  let rec = imgCache[src];
  if (!rec) { const img = new Image(); rec = imgCache[src] = { img, ok: false }; img.onload = () => { rec.ok = true; drawSoon(); }; img.src = src; }
  return rec.ok ? rec.img : null;
}
const LAYER_ORDER = ['floor', 'ground', 'ground2', 'ground3', 'object', 'object2', 'object3', 'object4', 'overlay', 'top'];
const cv = $('map'), ctx = cv.getContext('2d');
let zoom = .7, drawPending = false, handles = [], drag = null;
function drawSoon() { if (drawPending) return; drawPending = true; requestAnimationFrame(() => { drawPending = false; drawMap(); }); }
function drawImg(img, x, y, w, hh, fx, fy, rot) {
  if (!fx && !fy && !rot) { ctx.drawImage(img, x, y, w, hh); return; }
  ctx.save(); ctx.translate(x + w / 2, y + hh / 2); if (rot) ctx.rotate(rot * Math.PI / 2); ctx.scale(fx ? -1 : 1, fy ? -1 : 1);
  const iw = rot % 2 ? hh : w, ih = rot % 2 ? w : hh; ctx.drawImage(img, -iw / 2, -ih / 2, iw, ih); ctx.restore();
}
// 床位：地圖上的床圖章（遊戲用 bed: [欄, 列] 找這張床）
const bedStamps = m => (m?.stamps || []).filter(s => /bed/i.test(s.id));
function bedCenter(m, bed) {
  const s = bedStamps(m).find(b => b.c === bed[0] && b.r === bed[1]); if (!s) return null;
  const t = tileMap.get(s.id) || {}, rot = ((Number(s.rot) || 0) % 4 + 4) % 4;
  const w = rot % 2 ? (t.h || 1) : (t.w || 1), hh = rot % 2 ? (t.w || 1) : (t.h || 1);
  return [s.c + w / 2 + (s.ox || 0) / C, s.r + hh / 2 + (s.oy || 0) / C];
}
// 遊戲畫面看得到幾格（跟 js/maploader.js 的 VIEW_SCALE 算法一樣）
function viewCells(m) {
  const fw = 1280 / (m.cols * C), fh = 720 / (m.rows * C);
  let sc = Math.max(1, Math.min(fw, fh));
  if (fw < 1 && fh > 1) sc = fh;
  if (fw < 1 || fh < 1) sc *= 1.5; else sc = Math.max(sc, 1.5);
  return [1280 / (C * sc), 720 / (C * sc)];
}
function camRect(m, p) {   // 鏡頭中心 → 實際拍到的範圍（貼地圖邊時會被擋住，跟遊戲一樣）
  const [vw, vh] = viewCells(m);
  const x = m.cols <= vw ? (m.cols - vw) / 2 : Math.max(0, Math.min(m.cols - vw, p[0] - vw / 2));
  const y = m.rows <= vh ? (m.rows - vh) / 2 : Math.max(0, Math.min(m.rows - vh, p[1] - vh * .42));
  return [x, y, vw, vh];
}
const isSolid = (m, p) => (m.solid || []).includes(Math.floor(p[0]) + ',' + Math.floor(p[1]));
const selKey = () => sel && sel.key;
function handle(key, p, r, move, info) { handles.push({ key, x: p[0] * C, y: p[1] * C, r, move, info }); }
function label(text, x, y, color) {
  ctx.font = 'bold 12px system-ui, "Microsoft JhengHei"'; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,.85)';
  ctx.strokeText(text, x, y); ctx.fillStyle = color; ctx.fillText(text, x, y);
}
function figure(src, p, color, key, text, dim = false) {   // 角色：正面圖＋腳底圓點＋名字
  const x = p[0] * C, y = p[1] * C, img = image(src), on = selKey() === key;
  ctx.globalAlpha = dim ? .45 : 1;
  if (img) ctx.drawImage(img, x - 26, y - 46, 52, 52);
  ctx.globalAlpha = 1;
  ctx.fillStyle = color; ctx.strokeStyle = on ? '#ffd479' : '#000'; ctx.lineWidth = on ? 3 : 1.5;
  ctx.beginPath(); ctx.arc(x, y, on ? 7 : 5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  if (text) label(text, x, y - 48, on ? '#ffd479' : '#fff');
}
function arrow(x1, y1, x2, y2, color, dash) {
  ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2.5; if (dash) ctx.setLineDash([6, 5]);
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.setLineDash([]);
  const a = Math.atan2(y2 - y1, x2 - x1);
  ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - Math.cos(a - .45) * 11, y2 - Math.sin(a - .45) * 11); ctx.lineTo(x2 - Math.cos(a + .45) * 11, y2 - Math.sin(a + .45) * 11); ctx.fill(); ctx.restore();
}
const dirVec = d => ({ left: [-1, 0], right: [1, 0], front: [0, 1], back: [0, -1] })[d] || [0, 1];
function drawMap() {
  const m = curMap(), s = scene();
  handles = [];
  if (!m || !s) { cv.width = 400; cv.height = 200; ctx.fillStyle = '#0b1016'; ctx.fillRect(0, 0, 400, 200); $('mapTitle').textContent = s ? '找不到地圖：' + s.map : '沒有劇情'; return; }
  const W = m.cols * C, H = m.rows * C;
  cv.width = W; cv.height = H; cv.style.width = Math.round(W * zoom) + 'px'; cv.style.height = Math.round(H * zoom) + 'px';
  $('zoomText').textContent = Math.round(zoom * 100) + '%'; $('mapTitle').textContent = m.name || m.id;
  ctx.fillStyle = '#0b1016'; ctx.fillRect(0, 0, W, H); ctx.imageSmoothingEnabled = false;
  const order = Array.isArray(m.layerOrder) && m.layerOrder.length ? m.layerOrder.map(l => l.id) : LAYER_ORDER;
  for (const lid of order) {
    for (const [k, id] of Object.entries((m.layers || {})[lid] || {})) { const t = tileMap.get(id), img = image(t?.file); if (!img) continue; const [c, r] = k.split(',').map(Number); ctx.drawImage(img, c * C, r * C, C, C); }
    for (const st of m.stamps || []) {
      if ((st.layer || 'top') !== lid) continue;
      const t = tileMap.get(st.id), img = image(t?.file); if (!t) continue;
      const rot = ((Number(st.rot) || 0) % 4 + 4) % 4, w = (rot % 2 ? (t.h || 1) : (t.w || 1)) * C, hh = (rot % 2 ? (t.w || 1) : (t.h || 1)) * C;
      if (img) drawImg(img, st.c * C + (st.ox || 0), st.r * C + (st.oy || 0), w, hh, st.fx, st.fy, rot);
    }
  }
  ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(0, 0, W, H);   // 壓暗一點，標記比較清楚
  if ($('showSolid').checked) {
    ctx.fillStyle = 'rgba(200,50,50,.22)'; ctx.strokeStyle = 'rgba(255,90,90,.45)'; ctx.lineWidth = 1;
    for (const k of m.solid || []) { const [c, r] = k.split(',').map(Number); ctx.fillRect(c * C, r * C, C, C); ctx.strokeRect(c * C + 1.5, r * C + 1.5, C - 3, C - 3); }
  }
  ctx.strokeStyle = 'rgba(255,255,255,.06)'; ctx.lineWidth = 1; ctx.beginPath();
  for (let c = 1; c < m.cols; c++) { ctx.moveTo(c * C + .5, 0); ctx.lineTo(c * C + .5, H); }
  for (let r = 1; r < m.rows; r++) { ctx.moveTo(0, r * C + .5); ctx.lineTo(W, r * C + .5); }
  ctx.stroke();
  const beat = s.beats[beatSel];
  // 鏡頭：細框＝全部、粗黃框＝目前這頁的鏡頭
  for (const [name, p] of Object.entries(s.cameras)) {
    const key = 'camera:' + name, cur = beat && beatCamera(beatSel) === name;
    if (!$('showCams').checked && !cur && selKey() !== key) continue;
    const [x, y, w, hh] = camRect(m, p), on = selKey() === key;
    ctx.save(); ctx.strokeStyle = cur ? '#ffd479' : on ? '#fff' : 'rgba(143,211,255,.55)'; ctx.lineWidth = cur || on ? 3 : 1.5; if (!cur && !on) ctx.setLineDash([8, 6]);
    ctx.strokeRect(x * C + 2, y * C + 2, w * C - 4, hh * C - 4); ctx.restore();
    ctx.fillStyle = cur ? '#ffd479' : '#8fd3ff'; ctx.beginPath(); ctx.arc(p[0] * C, p[1] * C, 6, 0, Math.PI * 2); ctx.fill();
    label('🎥 ' + name, p[0] * C, p[1] * C - 10, cur ? '#ffd479' : '#8fd3ff');
    handle(key, p, 12, q => { s.cameras[name] = q; });
  }
  // 地點（轉頭看的目標）
  for (const [name, p] of Object.entries(s.points)) {
    const key = 'point:' + name, on = selKey() === key;
    ctx.fillStyle = '#ffe36e'; ctx.strokeStyle = on ? '#fff' : '#000'; ctx.lineWidth = 2;
    ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? 4 : 9; ctx.lineTo(p[0] * C + Math.cos(a) * rr, p[1] * C + Math.sin(a) * rr); } ctx.closePath(); ctx.fill(); ctx.stroke();
    label('📍 ' + name, p[0] * C, p[1] * C - 12, '#ffe36e');
    handle(key, p, 12, q => { s.points[name] = q; });
  }
  // 嚮導路線
  s.medics.forEach((md, i) => {
    const pts = md.route.map(st => st.at); if (!pts.length) return;
    ctx.save(); ctx.strokeStyle = 'rgba(110,230,150,.75)'; ctx.lineWidth = 2; ctx.setLineDash([5, 5]);
    ctx.beginPath(); pts.forEach((p, j) => j ? ctx.lineTo(p[0] * C, p[1] * C) : ctx.moveTo(p[0] * C, p[1] * C)); if (pts.length > 2) ctx.closePath(); ctx.stroke(); ctx.restore();
    md.route.forEach((st, j) => {
      const key = 'medic:' + i + ':' + j, on = selKey() === key || selKey() === 'medic:' + i;
      if (j === 0) figure(faceSrc('mob_A'), st.at, '#6ee696', key, '嚮導' + (i + 1));
      ctx.fillStyle = st.heal ? '#6ee696' : '#2f6b45'; ctx.strokeStyle = on ? '#ffd479' : '#000'; ctx.lineWidth = on ? 3 : 1.5;
      ctx.beginPath(); ctx.arc(st.at[0] * C, st.at[1] * C, 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#000'; ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'center'; ctx.fillText(String(j + 1), st.at[0] * C, st.at[1] * C + 3.5);
      handle(key, st.at, 11, q => { st.at = q; });
    });
  });
  // 生命體與哨兵
  s.monsters.forEach((mo, i) => {
    const key = 'monster:' + i, spec = monsterSpec(mo.type || 'lifeform'), img = image(spec?.sprite), on = selKey() === key, x = mo.at[0] * C, y = mo.at[1] * C;
    if (img) { const w = (spec.width || 42) * .8, hh = (spec.height || 33) * .8; ctx.save(); ctx.globalAlpha = .9; if (mo.face === 'right') { ctx.translate(x, 0); ctx.scale(-1, 1); ctx.translate(-x, 0); } ctx.drawImage(img, x - w / 2, y + 10 - hh, w, hh); ctx.restore(); }
    ctx.fillStyle = '#ff5b5b'; ctx.strokeStyle = on ? '#ffd479' : '#000'; ctx.lineWidth = on ? 3 : 1.5; ctx.fillRect(x - 6, y - 6, 12, 12); ctx.strokeRect(x - 6, y - 6, 12, 12);
    const d = dirVec(mo.face); arrow(x, y, x + d[0] * 30, y + d[1] * 30, '#ff8a8a');
    label('👾 ' + (mo.id || '生命體'), x, y + 22, on ? '#ffd479' : '#ff9d9d');
    handle(key, mo.at, 14, q => { mo.at = q; });
  });
  s.shooters.forEach((sh, i) => {
    const key = 'shooter:' + i, target = s.monsters.find(mo => mo.id === sh.shoot);
    if (target) { ctx.save(); ctx.strokeStyle = 'rgba(255,231,154,.35)'; ctx.setLineDash([3, 6]); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(sh.at[0] * C, sh.at[1] * C - 8); ctx.lineTo(target.at[0] * C, target.at[1] * C - 30); ctx.stroke(); ctx.restore(); }
    figure('images/character/mob_B/mobB_' + (sh.dir === 'right' ? '0006_right-side_gun' : '0003_Leftside_gun') + '.png', sh.at, '#66c8ff', key, '哨兵' + (i + 1));
    handle(key, sh.at, 12, q => { sh.at = q; });
  });
  // 傷員與主要角色（躺床的畫在床上，拖曳時換到最近的床）
  const beds = bedStamps(m);
  const nearestBed = q => { let best = null, bd = Infinity; for (const b of beds) { const c = bedCenter(m, [b.c, b.r]), d = Math.hypot(c[0] - q[0], c[1] - q[1]); if (d < bd) { bd = d; best = [b.c, b.r]; } } return best; };
  s.wounded.forEach((w, i) => {
    const p = bedCenter(m, w.bed || []); if (!p) return;
    figure('images/character/mob_B/mobB_0012_wounded.png', p, '#c0c0c0', 'wounded:' + i, '傷員' + (i + 1));
    handle('wounded:' + i, p, 14, q => { const b = nearestBed(q); if (b) w.bed = b; });
  });
  s.actors.forEach((a, i) => {
    const key = 'actor:' + i, p = a.bed ? bedCenter(m, a.bed) : a.at; if (!p) return;
    figure(faceSrc(a.sprite), p, '#ffb38a', key, (a.name || a.id) + (a.hidden ? '（先隱藏）' : ''), !!a.hidden);
    if (!a.bed && a.dir) { const d = dirVec(a.dir); arrow(p[0] * C, p[1] * C, p[0] * C + d[0] * 24, p[1] * C + d[1] * 24, '#ffb38a'); }
    handle(key, p, 14, q => { if (a.bed) { const b = nearestBed(q); if (b) a.bed = b; } else a.at = q; });
  });
  // 目前這一頁：走位目標（紫色箭頭，起點是上一個已知位置）
  if (beat) for (const [id, q] of Object.entries(beat.move || {})) {
    const from = actorPosBefore(beatSel, id), key = 'move:' + beatSel + ':' + id;
    if (from) arrow(from[0] * C, from[1] * C, q[0] * C, q[1] * C, '#c39bff', true);
    ctx.fillStyle = '#c39bff'; ctx.strokeStyle = selKey() === key ? '#ffd479' : '#000'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(q[0] * C, q[1] * C, 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    label('第' + (beatSel + 1) + '頁：' + actorName(id) + '走到這', q[0] * C, q[1] * C - 12, '#d9c2ff');
    handle(key, q, 12, p => { beat.move[id] = p; });
  }
  if (pick) { ctx.fillStyle = 'rgba(255,212,121,.08)'; ctx.fillRect(0, 0, W, H); }
}
// 某一頁開始前，這個角色在哪（往前找最近一次走位；沒有就用初始位置）
function actorPosBefore(index, id) {
  const s = scene();
  for (let i = index - 1; i >= 0; i--) { const q = s.beats[i].move?.[id]; if (q) return q; }
  const a = s.actors.find(x => x.id === id); if (!a) return null;
  return a.bed ? bedCenter(curMap(), a.bed) : a.at;
}
function beatCamera(index) {   // 這一頁用哪個鏡頭（沒寫就沿用前一頁）
  const s = scene();
  for (let i = index; i >= 0; i--) if (s.beats[i]?.camera) return s.beats[i].camera;
  return Object.keys(s.cameras)[0];
}

// ---- 滑鼠：選取、拖曳、在地圖上點位置 ----
function eventCell(e) {
  const rect = cv.getBoundingClientRect();
  return [(e.clientX - rect.left) * (cv.width / rect.width) / C, (e.clientY - rect.top) * (cv.height / rect.height) / C];
}
cv.addEventListener('mousedown', e => {
  if (e.button !== 0) return;
  const p = eventCell(e);
  if (pick) { const fn = pick.fn; setPick(null); fn([r1(p[0]), r1(p[1])]); commit(); return; }
  let best = null, bd = Infinity;
  for (const hd of handles) { const d = Math.hypot(hd.x - p[0] * C, hd.y - p[1] * C); if (d <= hd.r + 4 && d <= bd) { best = hd; bd = d; } }
  if (!best) return;
  select(best.key);
  drag = { h: best, moved: false };
  e.preventDefault();
});
window.addEventListener('mousemove', e => {
  if (!drag) return;
  const p = eventCell(e); drag.moved = true;
  drag.h.move([r1(Math.max(0, p[0])), r1(Math.max(0, p[1]))]); drawSoon();
});
window.addEventListener('mouseup', () => { if (drag?.moved) commit(); drag = null; });
cv.addEventListener('wheel', e => { if (!e.altKey) return; e.preventDefault(); setZoom(zoom * (e.deltaY < 0 ? 1.15 : 1 / 1.15)); }, { passive: false });
function setZoom(z) { zoom = Math.max(.25, Math.min(3, z)); drawSoon(); }
$('zoomIn').onclick = () => setZoom(zoom * 1.2); $('zoomOut').onclick = () => setZoom(zoom / 1.2);
$('showSolid').onchange = drawSoon; $('showCams').onchange = drawSoon;
function setPick(p) {
  pick = p; cv.classList.toggle('picking', !!p);
  $('pickBar').hidden = !p; if (p) $('pickBar').textContent = '👉 ' + p.label + '（在地圖上點一下；按 Esc 取消）';
  drawSoon();
}
window.addEventListener('keydown', e => { if (e.key === 'Escape' && pick) setPick(null); });
function select(key) {
  sel = key ? { key } : null;
  const [kind, a] = (key || '').split(':');
  if (kind === 'move') { beatSel = Number(a); showTab('beats'); }
  else if (key) showTab('obj');
  renderPanels(); drawSoon();
}

// ---- 共用輸入元件（改了就存）----
function txt(obj, key, opts = {}) {
  return h('input', { type: 'text', value: obj[key] ?? '', placeholder: opts.placeholder || '', list: opts.list, style: opts.style,
    onchange: e => { const v = e.target.value.trim(), old = obj[key]; if (!v && opts.optional) delete obj[key]; else obj[key] = v; opts.after?.(v, old); commit(!!opts.rerender); } });
}
function num(obj, key, opts = {}) {
  return h('input', { type: 'number', step: opts.step || .1, min: opts.min, value: obj[key] ?? '', placeholder: opts.placeholder || '',
    onchange: e => { const v = e.target.value; if (v === '' && opts.optional) delete obj[key]; else obj[key] = Number(v) || 0; commit(false); } });
}
function choose(obj, key, options, opts = {}) {
  const cur = obj[key] ?? '';
  const list = options.some(o => o[0] === cur) || cur === '' ? options : [...options, [cur, cur + '（找不到）']];
  return h('select', { onchange: e => { const v = e.target.value; if (v === '' && opts.optional) delete obj[key]; else obj[key] = opts.parse ? opts.parse(v) : v; commit(opts.rerender !== false); } },
    list.map(([v, t]) => h('option', { value: v, ...(v === cur ? { selected: true } : {}) }, t)));
}
function chk(obj, key, text, opts = {}) {
  return h('label', { class: 'row', style: 'font-size:12px' }, h('input', { type: 'checkbox', checked: !!obj[key], onchange: e => { if (e.target.checked) obj[key] = true; else delete obj[key]; commit(opts.rerender !== false); } }), text);
}
function xy(obj, key, text) {   // 座標：兩個數字＋「⌖ 點地圖」
  const p = obj[key] || [0, 0];
  const nx = h('input', { type: 'number', step: .1, value: p[0], onchange: e => { obj[key] = [r1(Number(e.target.value) || 0), obj[key]?.[1] ?? 0]; commit(false); } });
  const ny = h('input', { type: 'number', step: .1, value: p[1], onchange: e => { obj[key] = [obj[key]?.[0] ?? 0, r1(Number(e.target.value) || 0)]; commit(false); } });
  return h('span', { class: 'row' }, nx, ny, h('button', { type: 'button', class: 'small', onclick: () => setPick({ label: text || '選位置', fn: q => { obj[key] = q; } }) }, '⌖ 點地圖'));
}
const field = (text, ...input) => h('label', { class: 'f' }, text, ...input);
const actorOptions = () => scene().actors.map(a => [a.id, (a.name || a.id)]);
const cameraOptions = () => Object.keys(scene().cameras).map(k => [k, k]);

// ---- 左邊：劇情清單與設定 ----
function renderScenes() {
  const ss = $('sceneSel'); ss.innerHTML = '';
  for (const [id, s] of Object.entries(data)) ss.append(h('option', { value: id, ...(id === sceneId ? { selected: true } : {}) }, (s.title || id) + '（' + id + '）'));
  const s = scene(), box = $('sceneBox'); box.innerHTML = '';
  if (!s) { box.append(h('p', { class: 'note' }, '還沒有劇情，按「＋ 新劇情」。')); return; }
  const idInput = h('input', { type: 'text', value: sceneId, onchange: e => renameScene(e.target.value.trim()) });
  box.append(
    field('劇情 id（英數字，遊戲網址用）', idInput),
    field('演出地圖', choose(s, 'map', storyMaps.map(m => [m.id, m.name || m.id]))),
    field('標題', txt(s, 'title', { rerender: true })),
    field('副標題', txt(s, 'subtitle')),
    field('結尾標題', txt(s, 'endTitle', { optional: true, placeholder: '沒填就用標題' })),
    field('結尾說明', txt(s, 'endText', { optional: true })),
    chk(s, 'darkness', '後室黑幕（只有燈照得到的地方亮）'),
    explosionBox(s),
    bgmBox(s));
}
// BGM：bgm＝音樂檔路徑（放在 music/ 資料夾）、bgmVolume＝音量 0～1；劇情開始淡入、整段循環、結尾淡出
let bgmTest = null;
function bgmBox(s) {
  const stopTest = () => { if (bgmTest) { bgmTest.pause(); bgmTest = null; } };
  const test = h('button', { type: 'button', class: 'small', onclick: e => {
    if (bgmTest) { stopTest(); e.target.textContent = '▶ 試聽'; return; }
    if (!s.bgm) return;
    bgmTest = new Audio(s.bgm); bgmTest.volume = Math.max(0, Math.min(1, s.bgmVolume ?? .5)); bgmTest.loop = true;
    bgmTest.play().then(() => { e.target.textContent = '■ 停止'; }).catch(() => { stopTest(); status('播放失敗：找不到音樂檔 ' + s.bgm, true); });
  } }, bgmTest ? '■ 停止' : '▶ 試聽');
  return h('div', {},
    field('BGM（音樂檔，放在 music/ 資料夾；空白＝沒有音樂）', txt(s, 'bgm', { optional: true, placeholder: 'music/檔名.mp3', after: stopTest, rerender: true })),
    s.bgm && h('div', { class: 'row', style: 'font-size:12px' }, '音量', num(s, 'bgmVolume', { min: 0, step: .05, optional: true, placeholder: '0.5' }), h('small', { style: 'color:#8c98a6' }, '（0～1）'), test));
}
function explosionBox(s) {   // 遠處爆炸：explosions: { min, max, gain, shake }，沒有這個欄位＝不會爆炸
  const box = h('div', {}, h('label', { class: 'row', style: 'font-size:12px' }, h('input', { type: 'checkbox', checked: !!s.explosions,
    onchange: e => { if (e.target.checked) s.explosions = { min: 7, max: 16, gain: .5, shake: 8 }; else delete s.explosions; commit(); } }), '遠處偶爾傳來爆炸聲（鏡頭晃動、落灰）'));
  if (s.explosions) box.append(h('div', { class: 'row', style: 'font-size:12px;margin:4px 0 0 20px' },
    '每隔', num(s.explosions, 'min', { min: 1 }), '～', num(s.explosions, 'max', { min: 1 }), '秒', h('span', { style: 'flex-basis:100%' }), '音量', num(s.explosions, 'gain', { min: 0, step: .05 }), h('small', { style: 'color:#8c98a6' }, '（0.5 約為一般爆炸的一半）'),
    h('span', { style: 'flex-basis:100%' }), '鏡頭晃動', num(s.explosions, 'shake', { min: 0, step: 1, optional: true, placeholder: '8' }), h('small', { style: 'color:#8c98a6' }, '（0＝不晃，越大晃越兇也越久）')));
  return box;
}
function renameScene(id) {
  if (!id || id === sceneId) return;
  if (!/^[A-Za-z0-9_-]+$/.test(id)) { status('劇情 id 只能用英文、數字、底線、減號。', true); renderScenes(); return; }
  if (data[id]) { status('已經有叫 ' + id + ' 的劇情了。', true); renderScenes(); return; }
  const next = {}; for (const [k, v] of Object.entries(data)) next[k === sceneId ? id : k] = v;
  data = next; sceneId = id; commit();
}
$('sceneSel').onchange = e => { sceneId = e.target.value; sel = null; beatSel = 0; renderPanels(); drawSoon(); };
$('sceneNew').onclick = () => {
  let n = Object.keys(data).length + 1; while (data['scene_' + String(n).padStart(2, '0')]) n++;
  const id = 'scene_' + String(n).padStart(2, '0'), m = curMap() || storyMaps[0];
  data[id] = { map: m?.id || '', title: '新劇情', subtitle: '', darkness: true, cameras: { '全景': m ? [r1(m.cols / 2), r1(m.rows / 2)] : [10, 6] },
    points: {}, portraits: {}, actors: [], wounded: [], monsters: [], shooters: [], medics: [], beats: [{ speaker: '', text: '……', wait: 1 }] };
  sceneId = id; sel = null; beatSel = 0; commit(); status('已新增劇情 ' + id + '。');
};
$('sceneCopy').onclick = () => {
  if (!scene()) return;
  let id = sceneId + '_copy', n = 2; while (data[id]) id = sceneId + '_copy' + n++;
  data[id] = clone(scene()); data[id].title = (data[id].title || '') + '（複製）'; sceneId = id; commit();
};
$('sceneDel').onclick = () => {
  if (!scene() || !confirm('刪除劇情「' + (scene().title || sceneId) + '」？（存到專案前都可以用「從檔案重新載入」救回來）')) return;
  delete data[sceneId]; sceneId = Object.keys(data)[0] || null; sel = null; beatSel = 0; commit();
};

// ---- 左邊：場上的人與鏡頭 ----
function renderObjects() {
  const s = scene(), box = $('objList'); box.innerHTML = ''; if (!s) return;
  const group = (title, items, add) => {
    box.append(h('div', { class: 'sub', style: 'margin:8px 0 4px;font-size:12px' }, title, h('span', { class: 'grow' }), add && h('button', { type: 'button', class: 'small', onclick: add }, '＋')));
    box.append(h('div', { class: 'list' }, items.map(([key, color, text, note]) =>
      h('button', { type: 'button', class: 'item' + (selKey() === key ? ' on' : ''), onclick: () => select(key) }, h('i', { style: 'background:' + color }), text, note && h('small', {}, note)))));
  };
  const placeNew = (text, make) => () => setPick({ label: '放置' + text, fn: q => { const key = make(q); sel = { key }; showTab('obj'); } });
  group('主要角色', s.actors.map((a, i) => ['actor:' + i, '#ffb38a', a.name || a.id, a.bed ? '躺床' : '']),
    placeNew('主要角色', q => { let n = s.actors.length + 1; while (s.actors.some(a => a.id === 'actor' + n)) n++; s.actors.push({ id: 'actor' + n, name: '新角色', sprite: 'winter_B', at: q, dir: 'front' }); return 'actor:' + (s.actors.length - 1); }));
  group('受傷躺床的路人', s.wounded.map((w, i) => ['wounded:' + i, '#c0c0c0', '傷員' + (i + 1), (w.bed || []).join(',')]),
    () => { const b = bedStamps(curMap()).find(b => ![...s.wounded, ...s.actors].some(x => x.bed && x.bed[0] === b.c && x.bed[1] === b.r)); if (!b) { status('地圖上沒有空的床了。', true); return; } s.wounded.push({ bed: [b.c, b.r] }); sel = { key: 'wounded:' + (s.wounded.length - 1) }; showTab('obj'); commit(); });
  group('生命體（只做攻擊動作）', s.monsters.map((m, i) => ['monster:' + i, '#ff5b5b', m.id || '生命體', dirName(m.face)]),
    placeNew('生命體', q => { let n = s.monsters.length + 1; while (s.monsters.some(m => m.id === '怪物' + n)) n++; s.monsters.push({ id: '怪物' + n, type: 'lifeform', at: q, face: 'left' }); return 'monster:' + (s.monsters.length - 1); }));
  group('開槍的路人哨兵', s.shooters.map((sh, i) => ['shooter:' + i, '#66c8ff', '哨兵' + (i + 1), '打 ' + (sh.shoot || '？')]),
    placeNew('哨兵', q => { s.shooters.push({ at: q, dir: 'left', shoot: s.monsters[0]?.id || '' }); return 'shooter:' + (s.shooters.length - 1); }));
  group('走動的路人嚮導', s.medics.map((md, i) => ['medic:' + i, '#6ee696', '嚮導' + (i + 1), md.route.length + ' 個停留點']),
    placeNew('嚮導的第一個停留點', q => { s.medics.push({ route: [{ at: q, wait: 2, face: 'front' }] }); return 'medic:' + (s.medics.length - 1); }));
  group('鏡頭', Object.keys(s.cameras).map(k => ['camera:' + k, '#8fd3ff', '🎥 ' + k]),
    placeNew('鏡頭中心', q => { let n = Object.keys(s.cameras).length + 1; while (s.cameras['鏡頭' + n]) n++; s.cameras['鏡頭' + n] = q; return 'camera:鏡頭' + n; }));
  group('地點（轉頭看的目標）', Object.keys(s.points).map(k => ['point:' + k, '#ffe36e', '📍 ' + k]),
    placeNew('地點', q => { let n = Object.keys(s.points).length + 1; while (s.points['地點' + n]) n++; s.points['地點' + n] = q; return 'point:地點' + n; }));
}

// ---- 右邊：選取物件的屬性 ----
function renameKey(objMap, oldKey, newKey, kind) {   // 鏡頭、地點改名：對話裡用到的地方一起改
  if (!newKey || newKey === oldKey) return;
  if (objMap[newKey]) { status('已經有「' + newKey + '」了。', true); renderPanels(); return; }
  const next = {}; for (const [k, v] of Object.entries(objMap)) next[k === oldKey ? newKey : k] = v;
  for (const k of Object.keys(objMap)) delete objMap[k]; Object.assign(objMap, next);
  for (const b of scene().beats) {
    if (kind === 'camera' && b.camera === oldKey) b.camera = newKey;
    if (kind === 'point') for (const [id, d] of Object.entries(b.face || {})) if (d === oldKey) b.face[id] = newKey;
  }
  sel = { key: kind + ':' + newKey }; commit();
}
function renderObj() {
  const box = $('paneObj'); box.innerHTML = '';
  const s = scene(); if (!s || !sel) { box.append(h('p', { class: 'note' }, '在地圖上或左邊清單點一個人、鏡頭或地點。')); return; }
  const [kind, a, b] = sel.key.split(':'), i = Number(a);
  const del = (text, fn) => h('div', { class: 'row', style: 'margin-top:10px' }, h('button', { type: 'button', class: 'small danger', onclick: () => { if (!confirm('刪除' + text + '？')) return; fn(); sel = null; commit(); } }, '刪除' + text));
  if (kind === 'actor') {
    const ac = s.actors[i]; if (!ac) return;
    const beds = bedStamps(curMap()).map(st => [st.c + ',' + st.r, '床 (' + st.c + ', ' + st.r + ')']);
    const posMode = { mode: ac.bed ? ac.bed.join(',') : '' };
    box.append(h('h2', {}, '主要角色：' + (ac.name || ac.id)),
      field('名字（對話框、清單顯示）', txt(ac, 'name', { rerender: true })),
      field('id（對話演出裡用這個指名）', txt(ac, 'id', { after: (v, old) => renameActor(s, old, v), rerender: true })),
      field('角色圖資料夾', txt(ac, 'sprite', { list: 'spriteList', rerender: true })),
      field('位置', choose(posMode, 'mode', [['', '站著（自己選格子）'], ...beds], { parse: v => { if (v) { ac.bed = v.split(',').map(Number); delete ac.at; } else { delete ac.bed; ac.at = ac.at || [r1(curMap().cols / 2), r1(curMap().rows / 2)]; } return v; } })),
      !ac.bed && field('站的格子', xy(ac, 'at', '選' + (ac.name || '角色') + '站的位置')),
      !ac.bed && field('一開始面向', choose(ac, 'dir', DIRS)),
      field('走路速度（像素／秒，預設 26，溫特用 90）', num(ac, 'speed', { optional: true, step: 1, placeholder: '26' })),
      chk(ac, 'hidden', '一開始先隱藏（第一次走位才出現）'),
      chk(ac, 'breathing', '呼吸起伏（躺著的人）'),
      del('這個角色', () => s.actors.splice(i, 1)));
  } else if (kind === 'wounded') {
    const w = s.wounded[i]; if (!w) return;
    const beds = bedStamps(curMap()).map(st => [st.c + ',' + st.r, '床 (' + st.c + ', ' + st.r + ')']);
    const pos = { bed: (w.bed || []).join(',') };
    box.append(h('h2', {}, '受傷的路人哨兵 ' + (i + 1)), h('p', { class: 'note' }, '用 mob_B 的受傷圖躺在床上，會慢慢呼吸。'),
      field('躺哪張床', choose(pos, 'bed', beds, { parse: v => { w.bed = v.split(',').map(Number); return v; } })),
      del('這個傷員', () => s.wounded.splice(i, 1)));
  } else if (kind === 'monster') {
    const mo = s.monsters[i]; if (!mo) return;
    box.append(h('h2', {}, '怪物：' + (mo.id || '')), h('p', { class: 'note' }, '只做攻擊動作與打擊特效，不會移動、不會受傷。'),
      field('名字（哨兵用這個指定要打誰）', txt(mo, 'id', { after: (v, old) => { for (const sh of s.shooters) if (sh.shoot === old) sh.shoot = v; }, rerender: true })),
      field('種類', choose(mo, 'type', monsterTypes)),
      field('位置', xy(mo, 'at', '選怪物的位置')),
      field('朝哪邊揮', choose(mo, 'face', DIRS.filter(d => d[0] === 'left' || d[0] === 'right'))),
      del('這隻怪物', () => s.monsters.splice(i, 1)));
  } else if (kind === 'shooter') {
    const sh = s.shooters[i]; if (!sh) return;
    box.append(h('h2', {}, '開槍的路人哨兵 ' + (i + 1)), h('p', { class: 'note' }, 'mob_B 的持槍圖只有朝左、朝右。'),
      field('位置', xy(sh, 'at', '選哨兵的位置')),
      field('面向', choose(sh, 'dir', DIRS.filter(d => d[0] === 'left' || d[0] === 'right'))),
      field('朝哪隻怪物開槍', choose(sh, 'shoot', s.monsters.map(m => [m.id, m.id]))),
      del('這個哨兵', () => s.shooters.splice(i, 1)));
  } else if (kind === 'medic') {
    const md = s.medics[i]; if (!md) return;
    const stops = h('div', { class: 'acts' });
    md.route.forEach((st, j) => stops.append(h('div', { class: 'act', style: selKey() === 'medic:' + i + ':' + j ? 'outline:1px solid #ffd479;border-radius:6px;padding:2px' : '' },
      h('b', {}, '第' + (j + 1) + '站'), xy(st, 'at', '選嚮導第 ' + (j + 1) + ' 站'),
      '停', num(st, 'wait', { min: 0 }), '秒', choose(st, 'face', DIRS), chk(st, 'heal', '治療光'),
      h('button', { type: 'button', class: 'small danger', onclick: () => { md.route.splice(j, 1); sel = { key: 'medic:' + i }; commit(); } }, '×'))));
    box.append(h('h2', {}, '走動的路人嚮導 ' + (i + 1)), h('p', { class: 'note' }, '用 mob_A，照順序一站一站走、走完回到第 1 站，會自己繞過不可穿透的格子。勾「治療光」的站，停下時會冒綠色光點。'),
      field('一開始先等幾秒才出發（錯開大家的步調）', num(md, 'delay', { optional: true, min: 0, placeholder: '0' })),
      stops, h('button', { type: 'button', class: 'small', onclick: () => setPick({ label: '加一個停留點', fn: q => { md.route.push({ at: q, wait: 1.5, face: 'front' }); sel = { key: 'medic:' + i }; } }) }, '＋ 停留點'),
      del('這個嚮導', () => s.medics.splice(i, 1)));
  } else if (kind === 'camera' || kind === 'point') {
    const map = kind === 'camera' ? s.cameras : s.points, name = sel.key.slice(kind.length + 1); if (!map[name]) return;
    box.append(h('h2', {}, (kind === 'camera' ? '🎥 鏡頭：' : '📍 地點：') + name),
      h('p', { class: 'note' }, kind === 'camera' ? '點是鏡頭中心，框是遊戲畫面實際拍到的範圍（貼地圖邊時會被擋住）。對話的人會留在對話框上方。' : '對話演出的「轉向」可以選「看向這個地點」。'),
      field('名字', h('input', { type: 'text', value: name, onchange: e => renameKey(map, name, e.target.value.trim(), kind) })),
      field(kind === 'camera' ? '中心' : '位置', xy(map, name, '選' + (kind === 'camera' ? '鏡頭中心' : '地點'))),
      del(kind === 'camera' ? '這個鏡頭' : '這個地點', () => delete map[name]));
  } else if (kind === 'move') {
    showTab('beats');
  }
}
function renameActor(s, old, v) {   // 主要角色改 id：對話演出裡的指名一起改
  if (!old || !v || old === v) return;
  for (const b of s.beats) for (const k of ['move', 'face', 'eyes']) if (b[k] && old in b[k]) { b[k][v] = b[k][old]; delete b[k][old]; }
  for (const b of s.beats) { if (b.heal) { if (b.heal.from === old) b.heal.from = v; if (b.heal.to === old) b.heal.to = v; } for (const [k, d] of Object.entries(b.face || {})) if (d === old) b.face[k] = v; }
}

// ---- 右邊：對話與演出 ----
const beatTags = b => [b.camera && '🎥', b.move && '🚶', b.face && '↻', b.eyes && '👁', 'heal' in b && '✚', 'hush' in b && '🔇'].filter(Boolean).join('');
function renderBeats() {
  const box = $('paneBeats'), s = scene(); box.innerHTML = ''; if (!s) return;
  box.append(h('p', { class: 'note' }, '一頁一句話。點一頁展開編輯；「等幾秒」＝翻到這頁後，先讓畫面演幾秒才出現文字（不會自動翻頁）。'));
  s.beats.forEach((b, i) => {
    const on = i === beatSel;
    const head = h('div', { class: 'beat-head', onclick: () => { beatSel = on ? -1 : i; renderBeats(); drawSoon(); } },
      h('span', { class: 'n' }, String(i + 1)), h('b', {}, b.speaker || '旁白'), h('span', {}, b.text || '（空白）'), h('span', { class: 'tags' }, beatTags(b)));
    const card = h('div', { class: 'beat' + (on ? ' on' : '') }, head);
    if (on) card.append(beatBody(s, b, i));
    box.append(card);
  });
  box.append(h('button', { type: 'button', class: 'small', onclick: () => { s.beats.push({ speaker: '', text: '', wait: .3 }); beatSel = s.beats.length - 1; commit(); } }, '＋ 加一頁'));
}
function beatBody(s, b, i) {
  const speakers = [...new Set([...Object.keys(s.portraits), ...s.actors.map(a => a.name).filter(Boolean)])];
  const dl = h('datalist', { id: 'speakerList' }, speakers.map(n => h('option', { value: n })));
  const text = h('textarea', { rows: 2, oninput: e => { b.text = e.target.value; commit(false); } }); text.value = b.text || '';
  const acts = h('div', { class: 'acts' });
  const camHolder = { v: b.camera || '' };
  acts.append(h('div', { class: 'act' }, h('b', {}, '鏡頭'), choose(camHolder, 'v', [['', '不變（沿用前一頁）'], ...cameraOptions()], { parse: v => { if (v) b.camera = v; else delete b.camera; return v; } })));
  // 走位、轉向、眼睛：每列一個角色
  const rows = (key, title, make, addDefault) => {
    for (const id of Object.keys(b[key] || {})) acts.append(h('div', { class: 'act' }, h('b', {}, title), whoSelect(b[key], id), make(id),
      h('button', { type: 'button', class: 'small danger', onclick: () => { delete b[key][id]; if (!Object.keys(b[key]).length) delete b[key]; commit(); } }, '×')));
  };
  // 這一列換成別人（那個人在這頁還沒有同一種演出才行）
  const whoSelect = (map, id) => h('select', { onchange: e => { const v = e.target.value; if (map[v] !== undefined) { status(actorName(v) + '這頁已經有了。', true); e.target.value = id; return; } const n = {}; for (const [k, x] of Object.entries(map)) n[k === id ? v : k] = x; for (const k of Object.keys(map)) delete map[k]; Object.assign(map, n); commit(); } },
    s.actors.map(a => h('option', { value: a.id, ...(a.id === id ? { selected: true } : {}) }, a.name || a.id)));
  rows('move', '走位', id => xy(b.move, id, actorName(id) + '在第 ' + (i + 1) + ' 頁走到哪'));
  const faceOptions = [...DIRS, ...Object.keys(s.points).map(k => [k, '看向📍' + k]), ...s.actors.map(a => [a.id, '看向' + (a.name || a.id)])];
  rows('face', '轉向', id => choose(b.face, id, faceOptions.filter(o => o[0] !== id)));
  rows('eyes', '眼睛', id => choose(b.eyes, id, [['open', '睜開'], ['closed', '閉上']]));
  const healHolder = { v: b.heal === false ? 'stop' : b.heal ? 'start' : '' };
  const healRow = h('div', { class: 'act' }, h('b', {}, '治療'), choose(healHolder, 'v', [['', '不變'], ['start', '開始'], ['stop', '停止']], { parse: v => {
    if (v === 'start') b.heal = { from: s.actors[1]?.id || s.actors[0]?.id || '', to: s.actors[0]?.id || '' }; else if (v === 'stop') b.heal = false; else delete b.heal; return v; } }));
  if (b.heal) healRow.append(choose(b.heal, 'from', actorOptions()), '替', choose(b.heal, 'to', actorOptions()), '治療（光點、輕輕晃）');
  acts.append(healRow);
  const hushHolder = { v: b.hush === true ? 'on' : b.hush === false ? 'off' : '' };
  acts.append(h('div', { class: 'act' }, h('b', {}, '槍聲'), choose(hushHolder, 'v', [['', '不變'], ['on', '變稀疏（安靜下來）'], ['off', '恢復']], { parse: v => { if (v === 'on') b.hush = true; else if (v === 'off') b.hush = false; else delete b.hush; return v; } })));
  const addAct = (key, text, make) => h('button', { type: 'button', class: 'small', disabled: !s.actors.length, onclick: () => {
    const id = s.actors.find(a => !(b[key] && a.id in b[key]))?.id; if (!id) return;
    (b[key] = b[key] || {})[id] = make(id); commit();
  } }, text);
  const moveBtn = h('button', { type: 'button', class: 'small', disabled: !s.actors.length, onclick: () => {
    const id = s.actors.find(a => !(b.move && a.id in b.move))?.id; if (!id) return;
    setPick({ label: actorName(id) + '在第 ' + (i + 1) + ' 頁走到哪（加好後可以換人）', fn: q => { (b.move = b.move || {})[id] = q; } });
  } }, '＋ 走位');
  return h('div', { class: 'beat-body' },
    dl, h('div', { class: 'row' }, h('label', { class: 'f', style: 'flex:1' }, '說話者（空白＝旁白）', txt(b, 'speaker', { list: 'speakerList', rerender: true, placeholder: '旁白' })),
      h('label', { class: 'f' }, '等幾秒', num(b, 'wait', { min: 0 }))),
    h('label', { class: 'f' }, '台詞', text),
    acts,
    h('div', { class: 'row' }, moveBtn, addAct('face', '＋ 轉向', () => 'front'), addAct('eyes', '＋ 眼睛', () => 'open')),
    actorSwitchNote(s),
    h('div', { class: 'row', style: 'margin-top:8px' },
      h('button', { type: 'button', class: 'small', disabled: i === 0, onclick: () => { [s.beats[i - 1], s.beats[i]] = [s.beats[i], s.beats[i - 1]]; beatSel = i - 1; commit(); } }, '↑ 上移'),
      h('button', { type: 'button', class: 'small', disabled: i === s.beats.length - 1, onclick: () => { [s.beats[i + 1], s.beats[i]] = [s.beats[i], s.beats[i + 1]]; beatSel = i + 1; commit(); } }, '↓ 下移'),
      h('button', { type: 'button', class: 'small', onclick: () => { s.beats.splice(i + 1, 0, { speaker: b.speaker || '', text: '', wait: .3 }); beatSel = i + 1; commit(); } }, '＋ 在下面插入'),
      h('button', { type: 'button', class: 'small danger', disabled: s.beats.length <= 1, onclick: () => { s.beats.splice(i, 1); beatSel = Math.min(i, s.beats.length - 1); commit(); } }, '刪除這頁'),
      h('span', { class: 'grow' }),
      h('button', { type: 'button', class: 'small primary', onclick: () => preview(i + 1) }, '▶ 從這頁預覽')));
}
function actorSwitchNote(s) { return s.actors.length > 1 ? h('p', { class: 'note' }, '同一個人一頁只能有一筆走位／轉向／眼睛；按「＋」會先加給還沒有的人，再用左邊的選單換人。') : null; }

// ---- 右邊：頭像 ----
function renderFaces() {
  const box = $('paneFaces'), s = scene(); box.innerHTML = ''; if (!s) return;
  box.append(h('p', { class: 'note' }, '說話者名字 → 對話框左邊用哪個角色圖的正面頭像。沒列出的名字和旁白不放頭像。'));
  for (const name of Object.keys(s.portraits)) {
    const img = h('img', { src: faceSrc(s.portraits[name]), style: 'width:36px;height:36px;image-rendering:pixelated;background:#0b1016;border-radius:6px' });
    box.append(h('div', { class: 'act', style: 'margin:4px 0' }, img,
      h('input', { type: 'text', value: name, style: 'width:90px', onchange: e => { const v = e.target.value.trim(); if (!v || s.portraits[v]) { renderFaces(); return; } const n = {}; for (const [k, x] of Object.entries(s.portraits)) n[k === name ? v : k] = x; s.portraits = n; commit(); } }),
      '→', txt(s.portraits, name, { list: 'spriteList', rerender: true }),
      h('button', { type: 'button', class: 'small danger', onclick: () => { delete s.portraits[name]; commit(); } }, '×')));
  }
  box.append(h('button', { type: 'button', class: 'small', onclick: () => { let n = 1; while (s.portraits['說話者' + n]) n++; s.portraits['說話者' + n] = 'mob_B'; commit(); } }, '＋ 頭像'));
}

// ---- 檢查：找不到的東西、站在不可穿透格裡 ----
function problems() {
  const s = scene(), m = curMap(), out = [];
  if (!s) return out;
  if (!m) { out.push(['找不到演出地圖「' + s.map + '」', null]); return out; }
  const ids = new Set(s.actors.map(a => a.id)), mons = new Set(s.monsters.map(x => x.id));
  const inWall = (p, text, key) => { if (p && isSolid(m, p)) out.push([text + '站在不可穿透的格子裡', key]); };
  const beds = bedStamps(m);
  const hasBed = bed => bed && beds.some(b => b.c === bed[0] && b.r === bed[1]);
  s.actors.forEach((a, i) => { if (a.bed) { if (!hasBed(a.bed)) out.push([(a.name || a.id) + '的床不在地圖上', 'actor:' + i]); } else inWall(a.at, a.name || a.id, 'actor:' + i); });
  if (ids.size !== s.actors.length) out.push(['有兩個主要角色的 id 一樣', null]);
  s.wounded.forEach((w, i) => { if (!hasBed(w.bed)) out.push(['傷員' + (i + 1) + '的床不在地圖上', 'wounded:' + i]); });
  s.monsters.forEach((x, i) => inWall(x.at, '怪物「' + x.id + '」', 'monster:' + i));
  s.shooters.forEach((x, i) => { inWall(x.at, '哨兵' + (i + 1), 'shooter:' + i); if (!mons.has(x.shoot)) out.push(['哨兵' + (i + 1) + '要打的怪物「' + (x.shoot || '') + '」不存在', 'shooter:' + i]); });
  s.medics.forEach((md, i) => { if (!md.route.length) out.push(['嚮導' + (i + 1) + '沒有停留點', 'medic:' + i]); md.route.forEach((st, j) => inWall(st.at, '嚮導' + (i + 1) + '第' + (j + 1) + '站', 'medic:' + i + ':' + j)); });
  if (!Object.keys(s.cameras).length) out.push(['至少要有一個鏡頭', null]);
  if (s.explosions && !(s.explosions.max >= s.explosions.min)) out.push(['遠處爆炸的秒數：後面的數字要比前面大', null]);
  if (!s.beats.length) out.push(['至少要有一頁對話', null]);
  s.beats.forEach((b, i) => {
    const at = '第' + (i + 1) + '頁：', key = 'beat:' + i;
    if (b.camera && !s.cameras[b.camera]) out.push([at + '鏡頭「' + b.camera + '」不存在', key]);
    for (const k of ['move', 'face', 'eyes']) for (const id of Object.keys(b[k] || {})) if (!ids.has(id)) out.push([at + '找不到角色「' + id + '」', key]);
    for (const [id, q] of Object.entries(b.move || {})) if (isSolid(m, q)) out.push([at + actorName(id) + '的走位目標在不可穿透的格子裡', key]);
    for (const d of Object.values(b.face || {})) if (!DIRS.some(x => x[0] === d) && !s.points[d] && !ids.has(d)) out.push([at + '轉向的目標「' + d + '」不存在', key]);
    if (b.heal && (!ids.has(b.heal.from) || !ids.has(b.heal.to))) out.push([at + '治療的人不存在', key]);
    if (b.speaker && !s.portraits[b.speaker]) out.push([at + '「' + b.speaker + '」沒有設定頭像（會不放頭像）', key]);
  });
  return out;
}
function renderChecks() {
  const box = $('checkList'); box.innerHTML = '';
  const list = problems();
  if (!list.length) { box.append(h('div', { class: 'item ok' }, '✔ 沒有發現問題')); return; }
  for (const [text, key] of list) box.append(h('button', { type: 'button', class: 'item warn', onclick: () => {
    if (!key) return;
    if (key.startsWith('beat:')) { beatSel = Number(key.slice(5)); showTab('beats'); renderPanels(); drawSoon(); } else select(key);
  } }, '⚠ ' + text));
}

// ---- 分頁、預覽、存檔 ----
function showTab(t) {
  tab = t;
  for (const [id, name] of [['Beats', 'beats'], ['Obj', 'obj'], ['Faces', 'faces']]) { $('tab' + id).classList.toggle('on', name === t); $('pane' + id).hidden = name !== t; }
}
$('tabBeats').onclick = () => showTab('beats'); $('tabObj').onclick = () => { showTab('obj'); renderObj(); }; $('tabFaces').onclick = () => showTab('faces');
function renderPanels() {
  renderScenes(); renderObjects(); renderObj(); renderBeats(); renderFaces(); renderChecks();
}
function preview(from = 1) {
  if (!scene()) return;
  saveDraft();
  window.open('塔防原型.html?storyPreview=' + encodeURIComponent(sceneId) + '&storyDraft=1' + (from > 1 ? '&storyFrom=' + from : ''), 'story_preview');
}
$('previewGame').onclick = () => preview(1);
$('exportFile').onclick = () => {
  const url = URL.createObjectURL(new Blob([storyExportText()], { type: 'text/javascript' }));
  const a = document.createElement('a'); a.href = url; a.download = 'story-scenes.js'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  status('已下載 story-scenes.js，放到 data/ 取代舊檔。');
};
$('resetFile').onclick = () => {
  if (!confirm('丟掉瀏覽器裡還沒存到專案的修改，改回 data/story-scenes.js 的內容？')) return;
  localStorage.removeItem(STORY_STORE); DraftSync.forget(STORY_STORE); loadData(true); sel = null; beatSel = 0; renderPanels(); drawSoon(); status('已從檔案重新載入。');
};

// ---- 啟動 ----
loadData(false);
renderPanels(); drawSoon();
