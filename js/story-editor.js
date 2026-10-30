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
// 每頁的音效：js/sfx.js 的音效名字（音效編輯器裡看得到全部）；選單先列劇情常用的
const STORY_SFX = [['storyDoor', '自動門開關'], ['door', '關門'], ['backroomDoor', '後室開門'], ['elevator', '電梯'], ['ironGateSlide', '鐵門滑動'], ['stairsDown', '腳步聲（樓梯）'],
  ['soothe', '疏導'], ['itemPickup', '撿東西'], ['knock2', '敲打'], ['glassBreak3', '玻璃破掉'], ['midBoom', '中爆炸']];
document.body.append(h('datalist', { id: 'sfxList' }, STORY_SFX.map(([v, t]) => h('option', { value: v }, t))));
function testSfx(name, gain) {   // 編輯器沒有載入音效引擎：照 js/sfx.js 的檔名直接播
  const file = (typeof SFX !== 'undefined' && SFX.defaultFiles?.()[name]) || { storyDoor: '環境/門與機關/電梯.mp3', door: '環境/門與機關/關門.mp3', backroomDoor: '環境/門與機關/後室開門.mp3', elevator: '環境/門與機關/電梯.mp3', ironGateSlide: '環境/門與機關/鐵門滑動.mp3', stairsDown: '環境/腳步/footsteps03 (mp3cut.net).mp3' }[name];
  if (typeof file !== 'string') { status('這個音效只能在遊戲預覽裡聽：' + name, true); return; }
  const a = new Audio('Sound effects/' + file); a.volume = Math.min(1, .5 * (Number(gain) > 0 ? Number(gain) : 1)); a.play().catch(() => status('播放失敗：' + file, true));
}
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
  for (const k of ['actors', 'wounded', 'monsters', 'shooters', 'medics', 'beats', 'lights']) if (!Array.isArray(s[k])) s[k] = [];
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
// 床位／座位：地圖上的床圖章，和椅子編輯器設定過坐姿的椅子（遊戲用 bed: [欄, 列] 找這張床或椅子）
const seatCfg = id => { const c = typeof CHAIRS_DEFAULT !== 'undefined' && CHAIRS_DEFAULT[id]; return c && c.enabled && c.seat ? c : null; };
const bedStamps = m => (m?.stamps || []).filter(s => /bed/i.test(s.id) || seatCfg(s.id));
const seatName = s => (/bed|床/i.test(s.id) ? '床' : (tileMap.get(s.id)?.name || '椅子')) + ' (' + s.c + ', ' + s.r + ')';
function bedCenter(m, bed) {
  const s = bedStamps(m).find(b => b.c === bed[0] && b.r === bed[1]); if (!s) return null;
  const t = tileMap.get(s.id) || {}, rot = ((Number(s.rot) || 0) % 4 + 4) % 4, cfg = seatCfg(s.id);
  const w = rot % 2 ? (t.h || 1) : (t.w || 1), hh = rot % 2 ? (t.w || 1) : (t.h || 1);
  if (cfg && !rot) {   // 椅子：用椅子編輯器設定的坐下位置（跟遊戲一樣，左右／上下翻轉也照算）
    const x = s.fx ? w * C - cfg.seat.x : cfg.seat.x, y = s.fy ? hh * C - cfg.seat.y : cfg.seat.y;
    return [s.c + (x + (s.ox || 0)) / C, s.r + (y + (s.oy || 0)) / C];
  }
  return [s.c + w / 2 + (s.ox || 0) / C, s.r + hh / 2 + (s.oy || 0) / C];
}
// 遊戲畫面看得到幾格（跟 js/maploader.js 的 VIEW_SCALE 算法一樣）
function viewCells(m, zoom) {
  if (zoom > 0) return [1280 / (C * zoom), 720 / (C * zoom)];   // 劇情的 zoom 或鏡頭自己的縮放（第三個數字）
  const fw = 1280 / (m.cols * C), fh = 720 / (m.rows * C);
  let sc = Math.max(1, Math.min(fw, fh));
  if (fw < 1 && fh > 1) sc = fh;
  if (fw < 1 || fh < 1) sc *= 1.5; else sc = Math.max(sc, 1.5);
  return [1280 / (C * sc), 720 / (C * sc)];
}
function camRect(m, p) {   // 鏡頭中心 → 實際拍到的範圍（貼地圖邊時會被擋住，跟遊戲一樣）
  const [vw, vh] = viewCells(m, Number(p[2]) || Number(scene()?.zoom) || 0);
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
    handle(key, p, 12, q => { s.cameras[name] = [...q, ...s.cameras[name].slice(2)]; });   // 拖曳只改位置，縮放保留
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
  // 劇情自己加的燈（lights: [欄, 列, 半徑格數]）：黃色圈＝照亮的範圍
  s.lights.forEach((lt, i) => {
    const key = 'light:' + i, on = selKey() === key, x = lt[0] * C, y = lt[1] * C;
    ctx.save(); ctx.setLineDash([6, 5]); ctx.strokeStyle = on ? '#ffd479' : 'rgba(255,228,120,.55)'; ctx.lineWidth = on ? 2.5 : 1.5;
    ctx.beginPath(); ctx.arc(x, y, (lt[2] || 4) * C, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    label('💡 燈' + (i + 1), x, y + 4, on ? '#ffd479' : '#ffe9a0');
    handle(key, lt, 12, q => { s.lights[i] = [q[0], q[1], lt[2] || 4]; });
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
    figure(a.image || faceSrc(a.sprite), p, '#ffb38a', key, (a.name || a.id) + (a.hidden ? '（先隱藏）' : ''), !!a.hidden);
    if (!a.bed && a.dir) { const d = dirVec(a.dir); arrow(p[0] * C, p[1] * C, p[0] * C + d[0] * 24, p[1] * C + d[1] * 24, '#ffb38a'); }
    handle(key, p, 14, q => { if (a.bed) { const b = nearestBed(q); if (b) a.bed = b; } else a.at = q; });
  });
  // 目前這一頁：走位目標（紫色箭頭，起點是上一個已知位置）
  // 離場（走過去後淡出，橘色）、瞬移（黑幕轉場時直接換位置，青色、不畫箭頭）
  if (beat) for (const [kind, color, text] of [['move', '#c39bff', '走到這'], ['exit', '#ffab5e', '走到這後消失'], ['place', '#5fe0d0', '瞬移到這']]) for (const [id, q] of Object.entries(beat[kind] || {})) {
    const from = actorPosBefore(beatSel, id), key = kind + ':' + beatSel + ':' + id;
    if (from && kind !== 'place') arrow(from[0] * C, from[1] * C, q[0] * C, q[1] * C, color, true);
    ctx.fillStyle = color; ctx.strokeStyle = selKey() === key ? '#ffd479' : '#000'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(q[0] * C, q[1] * C, 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    label('第' + (beatSel + 1) + '頁：' + actorName(id) + text, q[0] * C, q[1] * C - 12, color);
    handle(key, q, 12, p => { beat[kind][id] = p; });
  }
  if (pick) { ctx.fillStyle = 'rgba(255,212,121,.08)'; ctx.fillRect(0, 0, W, H); }
}
// 某一頁開始前，這個角色在哪（往前找最近一次走位；沒有就用初始位置）
function actorPosBefore(index, id) {
  const s = scene();
  for (let i = index - 1; i >= 0; i--) { const b = s.beats[i], q = b.move?.[id] || b.exit?.[id] || b.place?.[id]; if (q) return q; }
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
  if (kind === 'move' || kind === 'exit' || kind === 'place') { beatSel = Number(a); showTab('beats'); }
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
function xy(obj, key, text) {   // 座標：兩個數字＋「⌖ 點地圖」（後面多的數字，例如鏡頭的縮放，原樣保留）
  const p = obj[key] || [0, 0], rest = () => obj[key]?.slice(2) || [];
  const nx = h('input', { type: 'number', step: .1, value: p[0], onchange: e => { obj[key] = [r1(Number(e.target.value) || 0), obj[key]?.[1] ?? 0, ...rest()]; commit(false); } });
  const ny = h('input', { type: 'number', step: .1, value: p[1], onchange: e => { obj[key] = [obj[key]?.[0] ?? 0, r1(Number(e.target.value) || 0), ...rest()]; commit(false); } });
  return h('span', { class: 'row' }, nx, ny, h('button', { type: 'button', class: 'small', onclick: () => setPick({ label: text || '選位置', fn: q => { obj[key] = [...q, ...rest()]; } }) }, '⌖ 點地圖'));
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
    chk(s, 'footsteps', '主要角色走路時有腳步聲（跑得快播得快）'),
    chk(s, 'autoExit', '從遊戲裡播的時候，看完直接回遊戲（不出現結束畫面；上面的按鈕變「跳過劇情」）'),
    h('div', { class: 'row', style: 'font-size:12px;margin:6px 0' }, '畫面四周壓暗', num(s, 'vignette', { min: 0, step: .05, optional: true, placeholder: '0' }), h('small', { style: 'color:#8c98a6' }, '（0＝不壓暗，1＝最暗）')),
    doorBox(s),
    explosionBox(s),
    bgmBox(s));
}
// 自動門：door: [欄, 列]＝地圖上哪張門圖章；對話演出用「門：打開／關上」，兩片門板往左右滑開
function doorBox(s) {
  const stamps = (curMap()?.stamps || []).filter(st => { const t = tileMap.get(st.id); return t && (t.w || 1) * (t.h || 1) <= 16; });
  const holder = { v: Array.isArray(s.door) ? s.door.join(',') : '' };
  return field('會開關的自動門（選地圖上的門圖章）', choose(holder, 'v', [['', '沒有'], ...stamps.map(st => [st.c + ',' + st.r, (tileMap.get(st.id)?.name || st.id) + '（' + st.c + ', ' + st.r + '）'])],
    { parse: v => { if (v) s.door = v.split(',').map(Number); else delete s.door; return v; } }));
}
// BGM：bgm＝音樂檔路徑（放在 music/ 資料夾）、bgmVolume＝音量 0～1；劇情開始淡入、整段循環、結尾淡出
let bgmTest = null;
function bgmList(s, stopTest) {   // 一首＝存成字串；好幾首＝存成清單
  const list = Array.isArray(s.bgm) ? s.bgm : s.bgm ? [s.bgm] : [];
  const area = h('textarea', { rows: Math.max(2, list.length), placeholder: 'music/檔名.mp3', onchange: e => {
    const v = e.target.value.split('\n').map(x => x.trim()).filter(Boolean);
    if (!v.length) delete s.bgm; else s.bgm = v.length === 1 ? v[0] : v;
    stopTest(); commit();
  } });
  area.value = list.join('\n');
  return area;
}
function bgmBox(s) {
  const stopTest = () => { if (bgmTest) { bgmTest.pause(); bgmTest = null; } };
  const test = h('button', { type: 'button', class: 'small', onclick: e => {
    if (bgmTest) { stopTest(); e.target.textContent = '▶ 試聽'; return; }
    if (!s.bgm) return;
    bgmTest = new Audio(Array.isArray(s.bgm) ? s.bgm[0] : s.bgm);   // 清單：試聽第一首 bgmTest.volume = Math.max(0, Math.min(1, s.bgmVolume ?? .5)); bgmTest.loop = true;
    bgmTest.play().then(() => { e.target.textContent = '■ 停止'; }).catch(() => { stopTest(); status('播放失敗：找不到音樂檔 ' + s.bgm, true); });
  } }, bgmTest ? '■ 停止' : '▶ 試聽');
  return h('div', {},
    field('BGM（音樂檔，放在 music/ 資料夾；一行一首，照順序播放，最後一首一直循環；空白＝沒有音樂）', bgmList(s, stopTest)),
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
  group('怪物（生命體會一直揮擊）', s.monsters.map((m, i) => ['monster:' + i, '#ff5b5b', m.id || '生命體', dirName(m.face)]),
    placeNew('生命體', q => { let n = s.monsters.length + 1; while (s.monsters.some(m => m.id === '怪物' + n)) n++; s.monsters.push({ id: '怪物' + n, type: 'lifeform', at: q, face: 'left' }); return 'monster:' + (s.monsters.length - 1); }));
  group('開槍的路人哨兵', s.shooters.map((sh, i) => ['shooter:' + i, '#66c8ff', '哨兵' + (i + 1), '打 ' + (sh.shoot || '？')]),
    placeNew('哨兵', q => { s.shooters.push({ at: q, dir: 'left', shoot: s.monsters[0]?.id || '' }); return 'shooter:' + (s.shooters.length - 1); }));
  group('走動的路人嚮導', s.medics.map((md, i) => ['medic:' + i, '#6ee696', '嚮導' + (i + 1), md.route.length + ' 個停留點']),
    placeNew('嚮導的第一個停留點', q => { s.medics.push({ route: [{ at: q, wait: 2, face: 'front' }] }); return 'medic:' + (s.medics.length - 1); }));
  group('鏡頭', Object.keys(s.cameras).map(k => ['camera:' + k, '#8fd3ff', '🎥 ' + k]),
    placeNew('鏡頭中心', q => { let n = Object.keys(s.cameras).length + 1; while (s.cameras['鏡頭' + n]) n++; s.cameras['鏡頭' + n] = q; return 'camera:鏡頭' + n; }));
  group('劇情的燈（黑幕時照亮，不畫燈）', s.lights.map((lt, i) => ['light:' + i, '#ffe36e', '💡 燈' + (i + 1), '半徑 ' + (lt[2] || 4) + ' 格']),
    placeNew('燈', q => { s.lights.push([q[0], q[1], 4]); return 'light:' + (s.lights.length - 1); }));
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
    const beds = bedStamps(curMap()).map(st => [st.c + ',' + st.r, '躺／坐：' + seatName(st)]);
    const posMode = { mode: ac.bed ? ac.bed.join(',') : '' };
    box.append(h('h2', {}, '主要角色：' + (ac.name || ac.id)),
      field('名字（對話框、清單顯示）', txt(ac, 'name', { rerender: true })),
      field('id（對話演出裡用這個指名）', txt(ac, 'id', { after: (v, old) => renameActor(s, old, v), rerender: true })),
      field('角色圖資料夾', txt(ac, 'sprite', { list: 'spriteList', rerender: true, optional: true })),
      field('單張圖（只有一張圖的路人，例如家屬的背影；填了就不用角色圖資料夾）', txt(ac, 'image', { optional: true, rerender: true, placeholder: 'images/回憶場景/檔名.png' })),
      ac.image && field('單張圖照原圖大小畫（1＝跟角色同一個比例，例如擔架；空白＝跟人一樣高）', num(ac, 'imageScale', { optional: true, min: .1, step: .1, placeholder: '—' })),
      field('一開始手上拿著（圖片，例如遺物箱；空白＝沒拿東西）', txt(ac, 'carry', { optional: true, placeholder: 'images/回憶場景/relics.png' })),
      field('拿著的東西往上／往下幾像素（負＝往上）', num(ac, 'carryDy', { optional: true, step: 1, placeholder: '0' })),
      field('位置', choose(posMode, 'mode', [['', '站著（自己選格子）'], ...beds], { parse: v => { if (v) { ac.bed = v.split(',').map(Number); delete ac.at; } else { delete ac.bed; ac.at = ac.at || [r1(curMap().cols / 2), r1(curMap().rows / 2)]; } return v; } })),
      !ac.bed && field('站的格子', xy(ac, 'at', '選' + (ac.name || '角色') + '站的位置')),
      !ac.bed && field('一開始面向', choose(ac, 'dir', DIRS)),
      field('走路速度（像素／秒，預設 26，溫特用 90）', num(ac, 'speed', { optional: true, step: 1, placeholder: '26' })),
      chk(ac, 'hidden', '一開始先隱藏（第一次走位才出現）'),
      chk(ac, 'gun', '一開始拿著槍預備（持槍圖：希奧妮、安柏、艾德林、克里斯、溫特有）'),
      chk(ac, 'shield', '一開始舉著盾（只有雷德有盾牌圖）'),
      chk(ac, 'breathing', '呼吸起伏（躺著的人）'),
      del('這個角色', () => s.actors.splice(i, 1)));
  } else if (kind === 'wounded') {
    const w = s.wounded[i]; if (!w) return;
    const beds = bedStamps(curMap()).filter(st => /bed/i.test(st.id)).map(st => [st.c + ',' + st.r, '床 (' + st.c + ', ' + st.r + ')']);
    const pos = { bed: (w.bed || []).join(',') };
    box.append(h('h2', {}, '受傷的路人哨兵 ' + (i + 1)), h('p', { class: 'note' }, '用 mob_B 的受傷圖躺在床上。'),
      field('躺哪張床', choose(pos, 'bed', beds, { parse: v => { w.bed = v.split(',').map(Number); return v; } })),
      del('這個傷員', () => s.wounded.splice(i, 1)));
  } else if (kind === 'monster') {
    const mo = s.monsters[i]; if (!mo) return;
    box.append(h('h2', {}, '怪物：' + (mo.id || '')), h('p', { class: 'note' }, '不會受傷。生命體一直做攻擊動作與打擊特效；其他怪物站著不動，用對話演出的「怪物走位／姿勢／吞人」來演。'),
      field('名字（哨兵、對話演出用這個指定是哪一隻）', txt(mo, 'id', { after: (v, old) => renameMonster(s, old, v), rerender: true })),
      field('種類', choose(mo, 'type', monsterTypes)),
      field('位置', xy(mo, 'at', '選怪物的位置')),
      field('朝哪邊（生命體往這邊揮）', choose(mo, 'face', DIRS.filter(d => d[0] === 'left' || d[0] === 'right'))),
      field('走位速度（像素／秒，預設 40）', num(mo, 'speed', { optional: true, step: 1, placeholder: '40' })),
      chk(mo, 'fried', '一開始就被雷劈過：焦黑倒在地上', { rerender: true }),
      mo.fried && field('往哪邊倒', choose(mo, 'fall', [[1, '往右倒'], [-1, '往左倒']], { parse: Number })),
      field('一開始嘴裡就含著（虱目魚小子）', choose(mo, 'prey', [['', '沒有'], ...actorOptions()], { optional: true })),
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
  } else if (kind === 'light') {
    const lt = s.lights[i]; if (!lt) return;
    const holder = { r: lt[2] || 4 };
    box.append(h('h2', {}, '💡 劇情的燈 ' + (i + 1)), h('p', { class: 'note' }, '地圖上沒有燈、但演出要看得到的地方（劇情設定要勾「後室黑幕」）。只照亮，畫面上不會多一盞燈。'),
      field('位置', xy(s.lights, i, '選燈的位置')),
      field('照亮半徑（格）', h('input', { type: 'number', step: .5, min: 1, value: holder.r, onchange: e => { s.lights[i] = [lt[0], lt[1], Math.max(1, Number(e.target.value) || 4)]; commit(); } })),
      del('這盞燈', () => s.lights.splice(i, 1)));
  } else if (kind === 'camera' || kind === 'point') {
    const map = kind === 'camera' ? s.cameras : s.points, name = sel.key.slice(kind.length + 1); if (!map[name]) return;
    box.append(h('h2', {}, (kind === 'camera' ? '🎥 鏡頭：' : '📍 地點：') + name),
      h('p', { class: 'note' }, kind === 'camera' ? '點是鏡頭中心，框是遊戲畫面實際拍到的範圍（貼地圖邊時會被擋住）。對話的人會留在對話框上方。' : '對話演出的「轉向」可以選「看向這個地點」。'),
      field('名字', h('input', { type: 'text', value: name, onchange: e => renameKey(map, name, e.target.value.trim(), kind) })),
      field(kind === 'camera' ? '中心' : '位置', xy(map, name, '選' + (kind === 'camera' ? '鏡頭中心' : '地點'))),
      kind === 'camera' && field('縮放（越大拍得越近；空白＝用劇情的 ' + (s.zoom || '預設') + '）', h('input', { type: 'number', step: .05, min: .5, value: map[name][2] ?? '', placeholder: String(s.zoom || ''),
        onchange: e => { const v = Number(e.target.value); map[name] = v > 0 ? [map[name][0], map[name][1], v] : map[name].slice(0, 2); commit(false); } })),
      del(kind === 'camera' ? '這個鏡頭' : '這個地點', () => delete map[name]));
  } else if (kind === 'move' || kind === 'exit' || kind === 'place') {
    showTab('beats');
  }
}
function renameMonster(s, old, v) {   // 怪物改名：哨兵要打的、對話演出裡的指名一起改
  if (!old || !v || old === v) return;
  for (const sh of s.shooters) if (sh.shoot === old) sh.shoot = v;
  for (const b of s.beats) for (const k of MONSTER_ACTS) if (b[k] && old in b[k]) { b[k][v] = b[k][old]; delete b[k][old]; }
}
function renameActor(s, old, v) {   // 主要角色改 id：對話演出裡的指名一起改
  if (!old || !v || old === v) return;
  for (const b of s.beats) for (const k of ['swallow', 'monsterWander']) for (const id of Object.keys(b[k] || {})) if (b[k][id] === old) b[k][id] = v;
  for (const b of s.beats) for (const k of ACTOR_ACTS) if (b[k] && old in b[k]) { b[k][v] = b[k][old]; delete b[k][old]; }
  for (const b of s.beats) { if (b.heal) { if (b.heal.from === old) b.heal.from = v; if (b.heal.to === old) b.heal.to = v; } for (const [k, d] of Object.entries(b.face || {})) if (d === old) b.face[k] = v; }
}

// ---- 右邊：對話與演出 ----
// 每頁可以指名角色的演出（同一個人一頁只能有一筆）
const ACTOR_ACTS = ['move', 'exit', 'place', 'hide', 'face', 'eyes', 'speed', 'tremble', 'shout', 'hop', 'carry', 'gun', 'shield', 'down', 'charge', 'fight', 'emote'];
// 每頁指名怪物的演出（monsterMove 走位、monsterPose 姿勢、swallow 吞掉哪個角色）
const MONSTER_ACTS = ['monsterMove', 'monsterPose', 'swallow', 'monsterWander', 'preyKick', 'spit'];
const MONSTER_POSES = [['', '站好（一般站姿、走路圖）'], ['smile', '笑（笑臉圖交替）'], ['attack', '張嘴（朝最近的人）']];
const beatTags = b => [b.camera && '🎥', b.move && '🚶', b.exit && '🚪', b.place && '⤴', b.hide && '👻', b.face && '↻', b.eyes && '👁', b.tremble && '〰', b.shout && '❗', b.hop && '⤒', b.carry && '📦',
  b.gun && '🔫', b.shield && '🛡', b.down && '⤓', b.charge && '✦', b.fight && '⚔', b.emote && '💢', b.monsterMove && '🐟', b.monsterPose && '🐟', b.monsterWander && '🐟', b.swallow && '🍽', b.preyKick && '🦵', b.spit && '💦', b.choices && '🔀', b.label && '🏷', b.stop && '⏹', b.card && '🃏', b.thunder && '⚡', b.sweat && '💧', (b.gloom || b.portraitFlip || b.portraitDark) && '😶',
  'heal' in b && '✚', 'hush' in b && '🔇', b.door && '⇆', b.sfx && '🔊', Number(b.textSize) > 0 && '🔠', 'bgm' in b && '🎵', b.screen && '⬛', Number.isFinite(b.end) && '⏹'].filter(Boolean).join('');
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
  rows('exit', '離場', id => h('span', { class: 'row' }, xy(b.exit, id, actorName(id) + '在第 ' + (i + 1) + ' 頁走到哪後消失'), h('small', {}, '走到後淡出')));
  rows('place', '瞬移', id => h('span', { class: 'row' }, xy(b.place, id, actorName(id) + '在第 ' + (i + 1) + ' 頁瞬移到哪'), h('small', {}, '直接換位置（黑幕時用）')));
  rows('hide', '消失', () => h('small', {}, '這頁一開始就不見'));
  rows('speed', '速度', id => h('span', { class: 'row' }, num(b.speed, id, { min: 1, step: 1 }), h('small', {}, '像素／秒（之後都用這個速度）')));
  const onOff = (map, id, on, off) => { const hd = { v: map[id] ? 'on' : 'off' }; return choose(hd, 'v', [['on', on], ['off', off]], { parse: v => { map[id] = v === 'on'; return v; } }); };
  rows('tremble', '顫抖', id => onOff(b.tremble, id, '開始顫抖', '停止顫抖'));
  rows('shout', '大喊', () => h('small', {}, '台詞出現時這個人頓一下，對話框也震一下'));
  rows('hop', '小跳', () => h('small', {}, '台詞出現時驚訝地輕輕跳一下（對話框不震）'));
  rows('carry', '拿著', id => txt(b.carry, id, { placeholder: '圖片路徑；空白＝放下', style: 'flex:1' }));
  rows('gun', '持槍', id => onOff(b.gun, id, '拿槍預備', '放下槍'));
  rows('shield', '盾牌', id => onOff(b.shield, id, '舉盾（只有雷德）', '放下盾'));
  rows('down', '倒地', id => onOff(b.down, id, '倒在地上', '爬起來'));
  rows('charge', '集氣', id => onOff(b.charge, id, '開始集氣（光圈、電火花）', '停止'));
  rows('emote', '情緒符號', id => choose(b.emote, id, [['anger', '💢 生氣（紅色青筋一跳一跳）'], ['sweat', '💧 慌張冒汗（汗滴往下滑）'], ['', '收掉']]));
  rows('fight', '打架', id => onOff(b.fight, id, '開始打（走到怪物旁第一下是衝撞，之後一直揮擊）', '停手'));
  // 怪物的演出：每列一隻怪物
  const monRows = (key, title, make) => {
    for (const id of Object.keys(b[key] || {})) acts.append(h('div', { class: 'act' }, h('b', {}, title), monSelect(b[key], id), make(id),
      h('button', { type: 'button', class: 'small danger', onclick: () => { delete b[key][id]; if (!Object.keys(b[key]).length) delete b[key]; commit(); } }, '×')));
  };
  const monSelect = (map, id) => h('select', { onchange: e => { const v = e.target.value; if (map[v] !== undefined) { status(v + '這頁已經有了。', true); e.target.value = id; return; } const n = {}; for (const [k, x] of Object.entries(map)) n[k === id ? v : k] = x; for (const k of Object.keys(map)) delete map[k]; Object.assign(map, n); commit(); } },
    s.monsters.map(m => h('option', { value: m.id, ...(m.id === id ? { selected: true } : {}) }, m.id)));
  monRows('monsterMove', '怪物走位', id => xy(b.monsterMove, id, id + '在第 ' + (i + 1) + ' 頁走到哪'));
  monRows('monsterPose', '怪物姿勢', id => choose(b.monsterPose, id, MONSTER_POSES));
  monRows('monsterWander', '繞著人走', id => h('span', { class: 'row' }, '在', choose(b.monsterWander, id, actorOptions()), h('small', {}, '身邊 1～1.5 格走來走去（換走位、姿勢或那個人被吞就停）')));
  monRows('spit', '吐出來', () => h('small', {}, '抖一下，把嘴裡的人吐在魚嘴前面（倒在地上）'));
  monRows('preyKick', '嘴裡的人抽一下', () => h('small', {}, '被吞的人腳踢幾下、魚嘴冒一縷煙（還活著）'));
  monRows('swallow', '吞人', id => h('span', { class: 'row' }, '吞掉', choose(b.swallow, id, actorOptions()), h('small', {}, '撲過去一口吞進魚嘴（虱目魚小子）')));
  acts.append(h('div', { class: 'act' }, h('b', {}, '巨雷'), chk(b, 'thunder', '雷劈在所有怪物身上＋大爆炸：畫面白黑閃、劇烈搖晃、掉碎石，怪物焦黑倒地（被吞的人還在嘴裡）', { rerender: true }),
    b.thunder && h('span', { class: 'row' }, '全白停', num(b, 'thunderHold', { min: .1, optional: true, placeholder: '0.35' }), '秒，再花', num(b, 'thunderFade', { min: .3, optional: true, placeholder: '3' }), '秒慢慢退掉')));
  // 登場介紹卡：勾了才出現欄位
  const cardRow = h('div', { class: 'act' }, h('b', {}, '介紹卡'), h('label', { class: 'row', style: 'font-size:12px' }, h('input', { type: 'checkbox', checked: !!b.card,
    onchange: e => { if (e.target.checked) b.card = { image: '', subtitle: '', title: '', text: '' }; else delete b.card; commit(); } }), '從右邊滑出一張介紹卡（翻下一頁收起來）'));
  if (b.card) cardRow.append(h('div', { style: 'display:grid;gap:4px;width:100%' },
    txt(b.card, 'image', { placeholder: '圖片，例如 images/monster/milkfish-kid/milkfish-kid-front.png' }), txt(b.card, 'subtitle', { placeholder: '小標（例如 A級異質體 NO.727）' }),
    txt(b.card, 'title', { placeholder: '名字（大字）' }), txt(b.card, 'text', { placeholder: '說明' })));
  acts.append(cardRow);
  // 頭像情緒：可以同時開好幾個
  acts.append(h('div', { class: 'act' }, h('b', {}, '頭像情緒'), chk(b, 'sweat', '流汗'), chk(b, 'gloom', '陰沉線條（頭上垂下黑線）'), chk(b, 'portraitFlip', '上下顛倒'),
    h('span', { class: 'row', style: 'font-size:12px' }, '壓黑', num(b, 'portraitDark', { min: 0, step: .05, optional: true, placeholder: '0' }), h('small', {}, '（0～1，0.4＝暗四成）'))));
  const healHolder = { v: b.heal === false ? 'stop' : b.heal ? 'start' : '' };
  const healRow = h('div', { class: 'act' }, h('b', {}, '治療'), choose(healHolder, 'v', [['', '不變'], ['start', '開始'], ['stop', '停止']], { parse: v => {
    if (v === 'start') b.heal = { from: s.actors[1]?.id || s.actors[0]?.id || '', to: s.actors[0]?.id || '' }; else if (v === 'stop') b.heal = false; else delete b.heal; return v; } }));
  if (b.heal) healRow.append(choose(b.heal, 'from', actorOptions()), '替', choose(b.heal, 'to', actorOptions()), '治療（光點）');
  acts.append(healRow);
  const hushHolder = { v: b.hush === true ? 'on' : b.hush === false ? 'off' : '' };
  acts.append(h('div', { class: 'act' }, h('b', {}, '槍聲'), choose(hushHolder, 'v', [['', '不變'], ['on', '變稀疏（安靜下來）'], ['off', '恢復']], { parse: v => { if (v === 'on') b.hush = true; else if (v === 'off') b.hush = false; else delete b.hush; return v; } })));
  if (s.door) {
    const doorHolder = { v: b.door || '' };
    acts.append(h('div', { class: 'act' }, h('b', {}, '自動門'), choose(doorHolder, 'v', [['', '不變'], ['open', '打開'], ['close', '關上']], { parse: v => { if (v) b.door = v; else delete b.door; return v; } })));
  }
  const screenHolder = { v: b.screen || '' };
  const screenRow = h('div', { class: 'act' }, h('b', {}, '黑幕'), choose(screenHolder, 'v', [['', '不變'], ['black', '畫面漸漸變黑'], ['clear', '從黑幕亮回來']], { parse: v => { if (v) b.screen = v; else { delete b.screen; delete b.screenFade; } return v; } }));
  if (b.screen) screenRow.append('花', num(b, 'screenFade', { min: .1, optional: true, placeholder: '2' }), '秒', chk(b, 'screenFree', '變暗途中也能翻頁（一邊說一邊變黑；沒勾＝變完才能翻頁）'));
  acts.append(screenRow);
  const bgmHolder = { v: !('bgm' in b) ? 'keep' : b.bgm ? 'change' : 'stop' };
  const bgmRow = h('div', { class: 'act' }, h('b', {}, '音樂'), choose(bgmHolder, 'v', [['keep', '不變'], ['change', '換成別首'], ['stop', '停掉']], { parse: v => {
    if (v === 'keep') { delete b.bgm; delete b.bgmDelay; } else if (v === 'stop') b.bgm = ''; else b.bgm = b.bgm || 'music/'; return v; } }));
  if ('bgm' in b) bgmRow.append(b.bgm !== '' ? txt(b, 'bgm', { placeholder: 'music/檔名.mp3', style: 'width:180px' }) : '', '翻到這頁先停掉現在的音樂，', num(b, 'bgmDelay', { min: 0, optional: true, placeholder: '0' }), '秒後' + (b.bgm ? '播新的' : '（不放音樂）'));
  acts.append(bgmRow);
  const sfxRow = h('div', { class: 'act' }, h('b', {}, '音效'), txt(b, 'sfx', { optional: true, list: 'sfxList', placeholder: '翻到這頁時播（空白＝不播）', rerender: true, style: 'width:150px' }));
  if (b.sfx) sfxRow.append('音量', num(b, 'sfxVolume', { min: 0, step: .1, optional: true, placeholder: '1' }), h('button', { type: 'button', class: 'small', onclick: () => testSfx(b.sfx, b.sfxVolume) }, '▶ 試聽'));
  acts.append(sfxRow);
  // 分支：label＝這頁的名字（選項跳過來用）；choices＝選項；stop＝這頁之後就結束（分支的最後一頁）
  const labels = s.beats.map(x => x.label).filter(Boolean);
  acts.append(h('div', { class: 'act' }, h('b', {}, '分支'), '這頁的名字', txt(b, 'label', { optional: true, rerender: true, placeholder: '選項跳過來用，例如 stay', style: 'width:110px' }),
    chk(b, 'stop', '這頁之後就結束劇情（分支的最後一頁）')));
  const choiceBox = h('div', { class: 'act', style: 'flex-wrap:wrap' }, h('b', {}, '選項'));
  (b.choices || []).forEach((c, j) => choiceBox.append(h('span', { class: 'row', style: 'width:100%' }, (j + 1) + '.', txt(c, 'text', { placeholder: '按鈕上的字', style: 'flex:1' }),
    '跳到', choose(c, 'goto', [['', '下一頁'], ...labels.map(l => [l, l])], { optional: true }), '結果', txt(c, 'outcome', { optional: true, placeholder: '例如 stay', style: 'width:80px' }),
    h('button', { type: 'button', class: 'small danger', onclick: () => { b.choices.splice(j, 1); if (!b.choices.length) delete b.choices; commit(); } }, '×'))));
  choiceBox.append(h('button', { type: 'button', class: 'small', onclick: () => { (b.choices = b.choices || []).push({ text: '' }); commit(); } }, '＋ 選項'),
    h('small', {}, '台詞打完字後出現按鈕，選了才往下；「結果」會交給遊戲決定接下來怎麼走（js/story-triggers.js）'));
  acts.append(choiceBox);
  acts.append(h('div', { class: 'act' }, h('b', {}, '結束'), '這頁', num(b, 'end', { min: 0, optional: true, placeholder: '—' }), '秒後自動結束劇情（空白＝最後一頁按了才結束）'));
  const addAct = (key, text, make) => h('button', { type: 'button', class: 'small', disabled: !s.actors.length, onclick: () => {
    const id = s.actors.find(a => !(b[key] && a.id in b[key]))?.id; if (!id) return;
    (b[key] = b[key] || {})[id] = make(id); commit();
  } }, text);
  const pickAct = (key, text, what) => h('button', { type: 'button', class: 'small', disabled: !s.actors.length, onclick: () => {
    const id = s.actors.find(a => !(b[key] && a.id in b[key]))?.id; if (!id) return;
    setPick({ label: actorName(id) + '在第 ' + (i + 1) + ' 頁' + what + '（加好後可以換人）', fn: q => { (b[key] = b[key] || {})[id] = q; } });
  } }, text);
  const moveBtn = pickAct('move', '＋ 走位', '走到哪');
  // 怪物的演出：先加給這頁還沒有的那隻，再用左邊的選單換
  const freeMon = key => s.monsters.find(m => !(b[key] && m.id in b[key]))?.id;
  const monAct = (key, text, make) => h('button', { type: 'button', class: 'small', disabled: !s.monsters.length, onclick: () => {
    const id = freeMon(key); if (!id) return;
    (b[key] = b[key] || {})[id] = make(id); commit();
  } }, text);
  const monMoveBtn = h('button', { type: 'button', class: 'small', disabled: !s.monsters.length, onclick: () => {
    const id = freeMon('monsterMove'); if (!id) return;
    setPick({ label: id + '在第 ' + (i + 1) + ' 頁走到哪（加好後可以換別隻）', fn: q => { (b.monsterMove = b.monsterMove || {})[id] = q; } });
  } }, '＋ 怪物走位');
  return h('div', { class: 'beat-body' },
    dl, h('div', { class: 'row' }, h('label', { class: 'f', style: 'flex:1' }, '說話者（空白＝旁白）', txt(b, 'speaker', { list: 'speakerList', rerender: true, placeholder: '旁白' })),
      h('label', { class: 'f' }, '等幾秒', num(b, 'wait', { min: 0 })),
      h('label', { class: 'f', title: '空白＝預設：一般台詞 17、大喊 23' }, '字體大小', num(b, 'textSize', { min: 8, step: 1, optional: true, placeholder: b.shout && Object.values(b.shout).some(Boolean) ? '23' : '17' }))),
    h('label', { class: 'f' }, '台詞', text),
    acts,
    h('div', { class: 'row' }, moveBtn, addAct('face', '＋ 轉向', () => 'front'), addAct('eyes', '＋ 眼睛', () => 'open'),
      pickAct('exit', '＋ 離場', '走到哪後消失'), pickAct('place', '＋ 瞬移', '瞬移到哪'), addAct('hide', '＋ 消失', () => true),
      addAct('speed', '＋ 速度', () => 60), addAct('tremble', '＋ 顫抖', () => true), addAct('shout', '＋ 大喊', () => true), addAct('hop', '＋ 小跳', () => true), addAct('carry', '＋ 拿著', () => ''),
      addAct('gun', '＋ 持槍', () => true), addAct('shield', '＋ 盾牌', () => true), addAct('down', '＋ 倒地', () => true), addAct('charge', '＋ 集氣', () => true), addAct('fight', '＋ 打架', () => true), addAct('emote', '＋ 情緒符號', () => 'anger')),
    s.monsters.length ? h('div', { class: 'row' }, monMoveBtn, monAct('monsterPose', '＋ 怪物姿勢', () => 'smile'),
      monAct('swallow', '＋ 吞人', () => s.actors[0]?.id || ''), monAct('monsterWander', '＋ 繞著人走', () => s.actors[0]?.id || ''), monAct('preyKick', '＋ 嘴裡的人抽一下', () => true), monAct('spit', '＋ 吐出來', () => true)) : null,
    actorSwitchNote(s),
    h('div', { class: 'row', style: 'margin-top:8px' },
      h('button', { type: 'button', class: 'small', disabled: i === 0, onclick: () => { [s.beats[i - 1], s.beats[i]] = [s.beats[i], s.beats[i - 1]]; beatSel = i - 1; commit(); } }, '↑ 上移'),
      h('button', { type: 'button', class: 'small', disabled: i === s.beats.length - 1, onclick: () => { [s.beats[i + 1], s.beats[i]] = [s.beats[i], s.beats[i + 1]]; beatSel = i + 1; commit(); } }, '↓ 下移'),
      h('button', { type: 'button', class: 'small', onclick: () => { s.beats.splice(i + 1, 0, { speaker: b.speaker || '', text: '', wait: .3 }); beatSel = i + 1; commit(); } }, '＋ 在下面插入'),
      h('button', { type: 'button', class: 'small danger', disabled: s.beats.length <= 1, onclick: () => { s.beats.splice(i, 1); beatSel = Math.min(i, s.beats.length - 1); commit(); } }, '刪除這頁'),
      h('span', { class: 'grow' }),
      h('button', { type: 'button', class: 'small primary', onclick: () => preview(i + 1) }, '▶ 從這頁預覽')));
}
function actorSwitchNote(s) { return s.actors.length > 1 ? h('p', { class: 'note' }, '同一個人一頁只能有一筆同類的演出（走位、轉向、離場…）；按「＋」會先加給還沒有的人，再用左邊的選單換人。') : null; }

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
  if (s.door && !(m.stamps || []).some(st => st.c === s.door[0] && st.r === s.door[1])) out.push(['自動門（' + s.door.join(', ') + '）不在地圖上', null]);
  s.actors.forEach((a, i) => { if (!a.bed && !a.sprite && !a.image) out.push([(a.name || a.id) + '沒有角色圖資料夾，也沒有單張圖', 'actor:' + i]); });
  if (s.explosions && !(s.explosions.max >= s.explosions.min)) out.push(['遠處爆炸的秒數：後面的數字要比前面大', null]);
  if (!s.beats.length) out.push(['至少要有一頁對話', null]);
  s.beats.forEach((b, i) => {
    const at = '第' + (i + 1) + '頁：', key = 'beat:' + i;
    if (b.camera && !s.cameras[b.camera]) out.push([at + '鏡頭「' + b.camera + '」不存在', key]);
    for (const c of b.choices || []) if (c.goto && !s.beats.some(x => x.label === c.goto)) out.push([at + '選項要跳到的「' + c.goto + '」沒有這頁', key]);
    if (b.choices?.some(c => !c.text)) out.push([at + '有選項沒寫按鈕上的字', key]);
    for (const k of ACTOR_ACTS) for (const id of Object.keys(b[k] || {})) if (!ids.has(id)) out.push([at + '找不到角色「' + id + '」', key]);
    for (const k of ['move', 'exit', 'place']) for (const [id, q] of Object.entries(b[k] || {})) if (isSolid(m, q)) out.push([at + actorName(id) + '的目標位置在不可穿透的格子裡', key]);
    for (const k of MONSTER_ACTS) for (const id of Object.keys(b[k] || {})) if (!mons.has(id)) out.push([at + '找不到怪物「' + id + '」', key]);
    for (const [id, q] of Object.entries(b.monsterMove || {})) if (isSolid(m, q)) out.push([at + id + '的目標位置在不可穿透的格子裡', key]);
    for (const [id, who] of Object.entries(b.swallow || {})) if (!ids.has(who)) out.push([at + id + '要吞的角色「' + who + '」不存在', key]);
    for (const [id, who] of Object.entries(b.monsterWander || {})) if (!ids.has(who)) out.push([at + id + '要繞著走的角色「' + who + '」不存在', key]);
    if (b.door && !s.door) out.push([at + '要開關自動門，但劇情設定裡還沒選門', key]);
    for (const d of Object.values(b.face || {})) if (!DIRS.some(x => x[0] === d) && !s.points[d] && !ids.has(d)) out.push([at + '轉向的目標「' + d + '」不存在', key]);
    if (b.heal && (!ids.has(b.heal.from) || !ids.has(b.heal.to))) out.push([at + '治療的人不存在', key]);
    // 單張圖的路人（家屬背影）本來就沒有正面頭像，不用提醒
    if (b.speaker && !s.portraits[b.speaker] && !s.actors.some(a => a.image && a.name === b.speaker)) out.push([at + '「' + b.speaker + '」沒有設定頭像（會不放頭像）', key]);
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
// ---- 專案檔在編輯器開著的時候被別人（例如 Claude）改過了 ----
// 這時編輯器記憶體裡還是舊資料：直接預覽或存檔會把舊的蓋回去（例如新加的 BGM 不見）。
// 重新整理頁面就會跟暫存自動合併（js/draft-sync.js），所以偵測到就提醒重新整理。
const FILE_AT_LOAD = JSON.stringify(typeof STORY_SCENES !== 'undefined' ? STORY_SCENES : {});
async function fileChangedOnDisk() {
  try {   // 雙擊開啟（file://）讀不到檔案：當作沒變
    const text = await (await fetch('data/story-scenes.js?t=' + Date.now(), { cache: 'no-store' })).text();
    return JSON.stringify(new Function(text.replace('const STORY_SCENES =', 'return ').replace(/;\s*$/, ''))()) !== FILE_AT_LOAD;
  } catch (_) { return false; }
}
async function askReloadIfStale() {
  if (!(await fileChangedOnDisk())) return false;
  status('專案檔 data/story-scenes.js 有新的內容，請重新整理這頁（你的修改會自動合併保留）。', true);
  if (!confirm('專案檔 data/story-scenes.js 在這頁開著時被更新了（例如新加的 BGM 或演出）。\n\n現在重新整理編輯器嗎？你在這裡的修改會先存好，再跟新內容自動合併。')) return false;
  saveDraft(); location.reload(); return true;
}
window.addEventListener('focus', () => { askReloadIfStale(); });
async function preview(from = 1) {
  if (!scene()) return;
  const win = window.open('', 'story_preview');   // 先開視窗（點擊當下才不會被擋），確認檔案沒過期再載入預覽
  if (await askReloadIfStale()) { win?.close(); return; }
  saveDraft();
  const url = '塔防原型.html?storyPreview=' + encodeURIComponent(sceneId) + '&storyDraft=1' + (from > 1 ? '&storyFrom=' + from : '');
  if (win) win.location.href = url; else window.open(url, 'story_preview');
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
