/* ===== 🎬 劇情編輯器（改）（劇情編輯器（改）.html）=====
   資料存在 data/story-kai.js（STORY_KAI）；遊戲的播放器在 js/story-kai.js，特效在 js/story-kai-fx.js。
   ・左邊：新增指令的按鈕。按一下，右邊的指令列表就多一行（加在選取的那一行下面）。
   ・中間：預覽窗＝劇情地圖。顯示「劇情跑到選取的那一行時」角色站在哪、鏡頭拍哪裡；點一下或拖曳就能改位置。
   ・右邊：劇情列表、演出者列表（角色代號、立繪版本、配件）、一行一行的指令（每行最右邊是這行的設定）。
   ・編輯會自動存在瀏覽器（tudrc_story_kai_v1），跟專案檔自動合併（js/draft-sync.js）；「💾 存到專案」寫進 data/story-kai.js。
*/
const KAI_STORE = 'tudrc_story_kai_v1';   // 遊戲預覽（&storyDraft=1）也讀這個
const C = 40;                              // 一格幾像素（跟遊戲一樣）
const RATIO = 9 / 16;                      // 鏡頭的長寬比（跟遊戲畫面 1280×720 一樣），縮放時固定
const SIZE = 64;                           // 角色圖畫多大（跟遊戲一樣）
const $ = id => document.getElementById(id);
const clone = o => JSON.parse(JSON.stringify(o));
const r1 = v => Math.round(v * 10) / 10;
const pad = n => String(n).padStart(2, '0');
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
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

// ---- 指令種類：名字、新增時的預設值 ----
const KINDS = {
  map: { name: '＋演出地圖', make: () => ({ map: '' }) },   // 地圖一開始空著，自己在右邊選單選
  say: { name: '對白', make: () => ({ who: lastWho(), text: '', shake: false }) },
  end: { name: '結局', make: () => ({ title: '' }) },
  show: { name: '角色出現', make: () => ({ who: nextUnshown(), at: null }) },
  hide: { name: '角色消失', make: () => ({ who: lastWho() }) },
  cam: { name: '＋新鏡頭', make: () => ({ at: null, w: lastCamW() }) },
  camMove: { name: '鏡頭位移', make: () => ({ at: null, w: lastCamW(), ms: 1000 }) },
  camShake: { name: '鏡頭震動', make: () => ({ ms: 500, lv: 3 }) },
  camSway: { name: '鏡頭晃動', make: () => ({ on: true, lv: 2 }) },
  blackIn: { name: '黑幕淡入', make: () => ({ ms: 1000 }) },
  blackOut: { name: '黑幕淡出', make: () => ({ ms: 1000 }) },
  whiteIn: { name: '白幕淡入', make: () => ({ ms: 1000 }) },
  whiteOut: { name: '白幕淡出', make: () => ({ ms: 1000 }) },
  wait: { name: '等待時間', make: () => ({ ms: 1000 }) },
  move: { name: '角色位置', make: () => ({ who: lastWho(), at: null, ms: 1000 }) },
  act: { name: '角色演出', make: () => ({ who: lastWho(), act: 'hop', on: true }) },
  sway: { name: '角色晃動', make: () => ({ who: lastWho(), on: true, lv: 2 }) },
  tremble: { name: '角色震動', make: () => ({ who: lastWho(), on: true, lv: 2 }) },
  mshow: { name: '怪物出現', make: () => ({ mon: nextCode('mon'), type: lastMonType(), at: null }) },
  mhide: { name: '怪物消失', make: () => ({ mon: lastCode('mon') }) },
  mact: { name: '怪物演出', make: () => ({ mon: lastCode('mon'), act: 'attack' }) },
  ishow: { name: '道具出現', make: () => ({ item: nextCode('item'), id: '', at: null }) },
  ihide: { name: '道具消失', make: () => ({ item: lastCode('item') }) },
  fx: { name: '＋特效', make: () => ({ id: 'fx_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), box: null, chat: [] }) },
  dark: { name: '後室黑幕', make: () => ({ on: true }) },
  vignette: { name: '暗角', make: () => ({ lv: 5 }) },
  bgm: { name: '背景音樂', make: () => ({ src: '', fade: true, vol: 50 }) },
  bgmStop: { name: '背景音樂停止', make: () => ({}) },
  sfx: { name: '音效', make: () => ({ src: '', vol: 100 }) },
};
const WHO_KINDS = new Set(['show', 'hide', 'move', 'tremble', 'act', 'sway']);
const ACTS = [['hop', '小跳'], ['gun', '持槍'], ['down', '倒地'], ['charge', '集氣']];   // 角色演出的種類（持槍：沒有槍的角色拿平常戰鬥用的武器）
const FACES = [['', '面向：自動'], ['front', '正面'], ['back', '背面'], ['left', '朝左'], ['right', '朝右']];
// ---- 怪物、道具：怪物用「怪物代號」、道具用「道具代號」，跟角色代號分開算（不用先加進演出者列表）----
const MON_KINDS = new Set(['mshow', 'mhide', 'mact']), ITEM_KINDS = new Set(['ishow', 'ihide']);
const MON_ACTS = [['attack', '攻擊'], ['move', '移動'], ['die', '死亡']];
const MON_FACES = [['', '面向：不變'], ['front', '正面'], ['left', '朝左'], ['right', '朝右']];
// 怪物種類：data/monsters.js（怪物編輯器）；道具：背包物品（data/items.js、data/supplies.js）
const MONS = (typeof MONSTERS_DEFAULT !== 'undefined' ? MONSTERS_DEFAULT : []).map(m => ({ id: m.id, name: m.name || m.id, img: m.frames?.front || m.sprite, w: m.width || 42, h: m.height || 33,
  side: m.frames?.side?.[0], sideFacing: m.frames?.sideFacing, walkFacing: m.frames?.walkFacing }));
const PROPS = [...(typeof ITEMS !== 'undefined' ? ITEMS : []), ...(typeof SUPPLIES !== 'undefined' ? SUPPLIES : [])].filter(it => it.image).map(it => ({ id: it.id, name: it.name || it.id, img: it.image }));
const monOf = id => MONS.find(m => m.id === id), propOf = id => PROPS.find(p => p.id === id);
// 第 upto 行之前，這個代號最近一次「出現」的那一行（拿來知道是哪一種怪物、哪個道具）
function shownBy(key, no, upto) { const st = scene()?.steps || []; for (let i = Math.min(upto, st.length - 1); i >= 0; i--) if (st[i].do === (key === 'mon' ? 'mshow' : 'ishow') && st[i][key] === no) return st[i]; return null; }
const codeOk = v => v !== '' && v != null;

// ---- 角色：角色資料頁的人＋路人 ----
const CHARS = [...Object.values(typeof CHARACTERS !== 'undefined' ? CHARACTERS : {}).filter(c => c.sprite).map(c => ({ id: c.id, name: c.name || c.id, sprite: c.sprite })),
  { id: 'mob', name: '路人', sprite: 'mob_A' }];
const charOf = id => CHARS.find(c => c.id === id);
const castName = c => c.name ? c.name : c.char === 'mob' ? ({ mob_A: '嚮導', mob_B: '哨兵' }[c.sprite] || '路人') : (charOf(c.char)?.name || c.char);
const faceSrc = (sprite, dir = 'front') => sprite ? 'images/character/' + sprite + '/' + sprite.replace('_', '') + '_' + ({ front: '0000_Front', back: '0009_back', left: '0003_Leftside', right: '0006_right-side' }[dir] || '0000_Front') + '.png' : '';
// 立繪版本：images/character/ 裡同一個人的資料夾（red_A、red_B…）。用編輯器小幫手開的才讀得到資料夾清單，讀不到就列 A、B
let FOLDERS = null;
fetch('images/character/').then(r => r.ok ? r.text() : '').then(t => {
  const list = [...t.matchAll(/href="([^"?]+?)\/"/g)].map(m => decodeURIComponent(m[1]));
  if (list.length) { FOLDERS = list; renderCast(); }
}).catch(() => {});
function variants(c) {
  const ch = charOf(c.char), base = c.char === 'mob' ? 'mob' : String(ch?.sprite || c.sprite).replace(/_[A-Z]$/, '');
  const found = (FOLDERS || []).filter(f => f.startsWith(base + '_') && /_[A-Z]$/.test(f) && f.slice(0, -2) === base);
  return [...new Set([...(found.length ? found : [base + '_A', base + '_B']), c.sprite])].sort();
}
const variantName = f => ({ mob_A: '嚮導', mob_B: '哨兵' }[f] || ({ A: 'A 普通制服', B: 'B 出勤服' }[f.slice(-1)] || f.slice(-1) + ' 版'));

// ---- 資料 ----
const storyMaps = typeof STORY_MAPS !== 'undefined' ? STORY_MAPS : [];
let data = null, sceneId = null, sel = -1, castSel = null, pick = null;
function loadData(useFile) {
  let d = null;
  if (!useFile) try { d = DraftSync.load(KAI_STORE, typeof STORY_KAI !== 'undefined' ? STORY_KAI : {}, { label: '劇情（改）' }); } catch (_) {}
  data = d && typeof d === 'object' ? d : clone(typeof STORY_KAI !== 'undefined' ? STORY_KAI : {});
  for (const s of Object.values(data)) { if (!Array.isArray(s.cast)) s.cast = []; if (!Array.isArray(s.steps)) s.steps = []; }
  if (!data[sceneId]) sceneId = Object.keys(data)[0] || null;
  sel = Math.min(sel, (scene()?.steps.length || 0) - 1);
}
let saveTimer = null;
// 還沒有劇情時也能先列演出者：先放在這裡，按「＋新劇情」時搬進那段劇情
const PENDING_CAST_KEY = 'tudrc_story_kai_cast_v1';
let pendingCast = (() => { try { const v = JSON.parse(localStorage.getItem(PENDING_CAST_KEY) || '[]'); return Array.isArray(v) ? v : []; } catch (_) { return []; } })();
const castOwner = () => scene() || { cast: pendingCast, steps: [] };
function saveDraft() { clearTimeout(saveTimer); try { localStorage.setItem(PENDING_CAST_KEY, JSON.stringify(pendingCast)); localStorage.setItem(KAI_STORE, JSON.stringify(data)); status('已自動儲存到這台瀏覽器。'); } catch (e) { status('暫存失敗：' + e.message, true); } }
function commit(rerender = true) { syncMap(scene()); clearTimeout(saveTimer); saveTimer = setTimeout(saveDraft, 250); drawSoon(); if (rerender) renderAll(); }
const scene = () => data[sceneId];
// 劇情的 map（記憶之門、遊戲預覽用來找開頭的地圖）跟著第一行「＋演出地圖」
function syncMap(s) { const first = s?.steps.find(st => st.do === 'map' && st.map); if (s) s.map = first ? first.map : ''; }   // 沒有「＋演出地圖」＝還沒選地圖
// 跑到第 i 行時在哪張地圖演出（往上找最近一行「＋演出地圖」；都沒有就用劇情的 map）
function mapAt(i) { const st = scene()?.steps || []; for (let j = Math.min(i, st.length - 1); j >= 0; j--) if (st[j].do === 'map' && st[j].map) return st[j].map; return scene()?.map || null; }
const curMap = () => storyMaps.find(m => m.id === mapAt(sel)) || null;
const mapName = id => { const m = storyMaps.find(x => x.id === id); return m ? m.name || m.id : id + '（找不到）'; };
const castBy = no => no !== '' && no != null ? castOwner().cast.find(c => c.no === Number(no)) : null;
const whoText = no => { const c = castBy(no); return '[' + (no === '' || no == null ? '??' : pad(no)) + '/' + (c ? castName(c) : '角色名') + ']'; };
// 新增指令時的預設：沿用上面最近一行的角色、鏡頭大小
function lastOf(test) { const st = scene().steps; for (let i = Math.min(sel, st.length - 1); i >= 0; i--) if (test(st[i])) return st[i]; return null; }
const lastWho = () => lastOf(s => s.who !== '' && s.who != null)?.who ?? (scene().cast[0]?.no ?? '');
const lastCode = key => lastOf(s => codeOk(s[key]))?.[key] ?? 1;   // 怪物、道具：沿用上面最近一行的代號
function nextCode(key) { return (scene()?.steps || []).reduce((m, s) => codeOk(s[key]) ? Math.max(m, Number(s[key])) : m, 0) + 1; }   // 新的怪物、道具：還沒用過的下一個號碼
const lastMonType = () => lastOf(s => s.do === 'mshow' && s.type)?.type || MONS[0]?.id || '';
const lastCamW = () => lastOf(s => (s.do === 'cam' || s.do === 'camMove') && s.w)?.w || 20;
function nextUnshown() {   // 還沒出現過的第一個演出者
  const shown = new Set(scene().steps.filter(s => s.do === 'show').map(s => Number(s.who)));
  return (scene().cast.find(c => !shown.has(c.no)) || scene().cast[0])?.no ?? '';
}

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
function storyKaiExportText() {
  return '/* 回憶劇情（改）：由「🎬 劇情編輯器（改）」編輯，遊戲的播放器在 js/story-kai.js。\n' +
    '   每段劇情用 id 當名字：map＝在哪張劇情地圖演出、cast＝演出者（no＝角色代號）、steps＝一行一行的指令（從第 1 行往下跑）。\n' +
    '   座標一律是格子（欄, 列，可填小數）；時間一律是毫秒（ms）。 */\n' +
    'const STORY_KAI = ' + fmt(data) + ';\n';
}

// ---- 跑到第 upto 行時：每個人在哪、鏡頭拍哪裡、後室黑幕開了沒（預覽窗用） ----
const dirFrom = (a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1]; return Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'back' : 'front'); };
function simulate(upto) {
  const st = { actors: new Map(), mons: new Map(), items: new Map(), cam: null, dark: false, vig: 0, move: null };
  const steps = scene()?.steps || [];
  for (let i = 0; i <= upto && i < steps.length; i++) {
    const p = steps[i], no = Number(p.who), a = st.actors.get(no);
    if (p.do === 'map') { if (i > 0) { st.actors.clear(); st.mons.clear(); st.items.clear(); st.cam = null; st.move = null; } }   // 換場景：大家先不在場、鏡頭重新決定
    else if (p.do === 'mshow' && p.at && p.type) { const m = st.mons.get(Number(p.mon)); st.mons.set(Number(p.mon), { at: p.at, type: p.type, face: p.face || (m?.shown && m.type === p.type ? m.face : 'front'), src: i, shown: true }); }
    else if (p.do === 'mhide' || p.do === 'mact') {
      const m = st.mons.get(Number(p.mon)); if (!m?.shown) continue;
      if (p.do === 'mhide') m.shown = false;
      else if (p.act === 'die') { if (i === upto) m.dying = true; else m.shown = false; }   // 死亡：選到那一行時畫成半透明，之後就不在了
      else if (p.act === 'move' && p.at) { if (i === upto) st.move = { from: m.at, to: p.at }; if (p.at[0] !== m.at[0]) m.face = p.at[0] < m.at[0] ? 'left' : 'right'; m.at = p.at; m.src = i; }
      else if (p.face) m.face = p.face;
    }
    else if (p.do === 'ishow' && p.at && p.id) st.items.set(Number(p.item), { at: p.at, id: p.id, src: i, shown: true });
    else if (p.do === 'ihide') { const it = st.items.get(Number(p.item)); if (it) it.shown = false; }
    else if (p.do === 'show' && p.at) st.actors.set(no, { at: p.at, face: p.face || a?.face || 'front', src: i, shown: true });
    else if (p.do === 'move' && p.at) {
      if (i === upto && a?.shown) st.move = { from: a.at, to: p.at };
      st.actors.set(no, { at: p.at, face: p.face || (a?.shown ? dirFrom(a.at, p.at) : 'front'), src: i, shown: true });
    } else if (p.do === 'hide' && a) a.shown = false;
    else if ((p.do === 'cam' || p.do === 'camMove') && p.at) st.cam = { at: p.at, w: Number(p.w) || 20, src: i };
    else if (p.do === 'dark') st.dark = p.on !== false;
    else if (p.do === 'vignette') st.vig = Number(p.lv) || 0;
  }
  return st;
}

// ---- 預覽窗 ----
const tileMap = new Map((typeof SHARED_TILES !== 'undefined' ? SHARED_TILES : []).map(t => [t.id, t]));
const imgCache = {};
function image(src) {
  if (!src) return null;
  let rec = imgCache[src];
  if (!rec) { const img = new Image(); rec = imgCache[src] = { img, ok: false }; img.onload = () => { rec.ok = true; mapCache.dirty = true; drawSoon(); }; img.src = src; }
  return rec.ok ? rec.img : null;
}
const LAYER_ORDER = ['floor', 'ground', 'ground2', 'ground3', 'object', 'object2', 'object3', 'object4', 'overlay', 'top'];
const cv = $('map'), ctx = cv.getContext('2d');
const view = { x: 0, y: 0, z: .7, fitFor: null };   // 預覽窗的位置（世界像素）與縮放
let drawPending = false, handles = [], drag = null, rubber = null;
function drawSoon() { if (drawPending) return; drawPending = true; requestAnimationFrame(() => { drawPending = false; draw(); }); }
function drawImg(g, img, x, y, w, hh, fx, fy, rot) {
  if (!fx && !fy && !rot) { g.drawImage(img, x, y, w, hh); return; }
  g.save(); g.translate(x + w / 2, y + hh / 2); if (rot) g.rotate(rot * Math.PI / 2); g.scale(fx ? -1 : 1, fy ? -1 : 1);
  const iw = rot % 2 ? hh : w, ih = rot % 2 ? w : hh; g.drawImage(img, -iw / 2, -ih / 2, iw, ih); g.restore();
}
// 地圖本身先畫在另一張畫布上，拖曳時只要貼上去（圖片還沒載完會再重畫）
const mapCache = { id: null, canvas: document.createElement('canvas'), dirty: true };
function mapCanvas(m) {
  if (mapCache.id === m.id && !mapCache.dirty) return mapCache.canvas;
  const g = mapCache.canvas.getContext('2d'), W = m.cols * C, H = m.rows * C;
  mapCache.canvas.width = W; mapCache.canvas.height = H; mapCache.id = m.id; mapCache.dirty = false;
  g.fillStyle = '#0b1016'; g.fillRect(0, 0, W, H); g.imageSmoothingEnabled = false;
  const order = Array.isArray(m.layerOrder) && m.layerOrder.length ? m.layerOrder.map(l => l.id) : LAYER_ORDER;
  for (const lid of order) {
    for (const [k, id] of Object.entries((m.layers || {})[lid] || {})) { const t = tileMap.get(id), img = image(t?.file); if (!img) continue; const [c, r] = k.split(',').map(Number); g.drawImage(img, c * C, r * C, C, C); }
    for (const st of m.stamps || []) {
      if ((st.layer || 'top') !== lid) continue;
      const t = tileMap.get(st.id), img = image(t?.file); if (!t || !img) continue;
      const rot = ((Number(st.rot) || 0) % 4 + 4) % 4, w = (rot % 2 ? (t.h || 1) : (t.w || 1)) * C, hh = (rot % 2 ? (t.w || 1) : (t.h || 1)) * C;
      drawImg(g, img, st.c * C + (st.ox || 0), st.r * C + (st.oy || 0), w, hh, st.fx, st.fy, rot);
    }
  }
  return mapCache.canvas;
}
const toScreen = (cx, cy) => [(cx * C - view.x) * view.z, (cy * C - view.y) * view.z];   // 格子座標 → 預覽窗上的位置
const toCell = (sx, sy) => [(sx / view.z + view.x) / C, (sy / view.z + view.y) / C];
function fitView(m) {
  const W = cv.clientWidth, H = cv.clientHeight; if (!W || !H) return;
  view.z = Math.min(W / (m.cols * C), H / (m.rows * C)) * .94;
  view.x = (m.cols * C - W / view.z) / 2; view.y = (m.rows * C - H / view.z) / 2; view.fitFor = m.id;
}
function label(text, x, y, color, align = 'center') {
  ctx.font = 'bold 12px system-ui, "Microsoft JhengHei"'; ctx.textAlign = align; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,.85)';
  ctx.strokeText(text, x, y); ctx.fillStyle = color; ctx.fillText(text, x, y);
}
function arrow(x1, y1, x2, y2, color) {
  ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2.5; ctx.setLineDash([6, 5]);
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.setLineDash([]);
  const a = Math.atan2(y2 - y1, x2 - x1);
  ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - Math.cos(a - .45) * 11, y2 - Math.sin(a - .45) * 11); ctx.lineTo(x2 - Math.cos(a + .45) * 11, y2 - Math.sin(a + .45) * 11); ctx.fill(); ctx.restore();
}
function cornerHandle(x, y, on) {
  ctx.fillStyle = on ? '#ffd479' : '#fff'; ctx.strokeStyle = '#000'; ctx.lineWidth = 1.5;
  ctx.fillRect(x - 5, y - 5, 10, 10); ctx.strokeRect(x - 5, y - 5, 10, 10);
}
// 角色：跟遊戲一樣的大小，腳底在格子座標上；配件也一起畫
function drawFigure(c, p, face) {
  if (c.image) {   // 圖片角色：照原本比例、跟人一樣高
    const img = image(c.image); if (!img) return;
    const w = SIZE * img.naturalWidth / img.naturalHeight; ctx.drawImage(img, p[0] * C - w / 2, p[1] * C - SIZE + 18, w, SIZE); return;
  }
  const img = image(faceSrc(c.sprite, face)) || image(faceSrc(c.sprite)); if (!img) return;
  const x = p[0] * C - SIZE / 2, y = p[1] * C - SIZE + 18;
  const accs = typeof ACC_BY_ID !== 'undefined' ? Object.values(c.accs || {}).map(id => ACC_BY_ID[id]).filter(Boolean).sort((a, b) => accLayer(a) - accLayer(b)) : [];
  for (const a of accs) drawAccessory(ctx, a, c.char, face, 0, x, y, SIZE, 'behind');
  ctx.drawImage(img, x, y, SIZE, SIZE);
  for (const a of accs) drawAccessory(ctx, a, c.char, face, 0, x, y, SIZE, 'front');
}
// 怪物：腳底在格子座標上（跟遊戲一樣，圖的底部在腳底下 13 像素）；朝左右時有側面圖就用側面圖
function drawMonster(m, ghost) {
  const def = monOf(m.type); if (!def) return;
  const side = m.face === 'left' || m.face === 'right', img = (side && def.side && image(def.side)) || image(def.img); if (!img) return;
  const facing = side && def.side ? def.sideFacing : def.walkFacing, flip = side && facing && (m.face === 'right') === (facing === 'left');
  const x = m.at[0] * C, y = m.at[1] * C + 13;
  ctx.save(); if (ghost) ctx.globalAlpha = .4;
  ctx.translate(x, 0); if (flip) ctx.scale(-1, 1);
  ctx.drawImage(img, -def.w / 2, y - def.h, def.w, def.h); ctx.restore();
}
function drawProp(it) {   // 道具：跟遊戲裡放在地上的東西一樣大（26 像素）
  const def = propOf(it.id), img = def && image(def.img); if (!img) return;
  const k = 26 / Math.max(img.naturalWidth, img.naturalHeight), w = img.naturalWidth * k, hh = img.naturalHeight * k;
  ctx.drawImage(img, it.at[0] * C - w / 2, it.at[1] * C - hh + 2, w, hh);
}
function draw() {
  const dpr = window.devicePixelRatio || 1, W = cv.clientWidth, H = cv.clientHeight;
  if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H); ctx.imageSmoothingEnabled = false;
  handles = [];
  const m = curMap(), s = scene();
  $('zoomText').textContent = Math.round(view.z * 100) + '%';
  if (!m || !s) { $('mapTitle').textContent = !s ? '還沒有劇情：按右上「＋新劇情」' : s.map || mapAt(sel) ? '找不到地圖：' + (mapAt(sel) || s.map) : '還沒選地圖：按左邊「＋演出地圖」，再在那一行右邊選地圖'; return; }
  if (view.fitFor !== m.id) fitView(m);
  $('mapTitle').textContent = '🗺️ ' + (m.name || m.id) + (sel >= 0 ? '　｜　顯示跑到第 ' + String(sel + 1).padStart(3, '0') + ' 行時' : '');
  const st = simulate(sel), cur = s.steps[sel];
  // 世界座標（地圖、角色）
  ctx.save(); ctx.scale(view.z, view.z); ctx.translate(-view.x, -view.y); ctx.imageSmoothingEnabled = false;
  ctx.drawImage(mapCanvas(m), 0, 0);
  if (st.dark) { ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillRect(0, 0, m.cols * C, m.rows * C); }   // 後室黑幕：壓暗表示（遊戲裡只有燈照到的地方亮）
  const actors = [...st.actors.entries()].filter(([, a]) => a.shown).sort((p, q) => p[1].at[1] - q[1].at[1]);
  const mons = [...st.mons.entries()].filter(([, x]) => x.shown), items = [...st.items.entries()].filter(([, x]) => x.shown);
  // 人、怪物、道具一起依腳底的高低排前後
  const figs = [...actors.map(([no, a]) => ({ y: a.at[1], draw: () => { const c = castBy(no); if (c) drawFigure(c, a.at, a.face); } })),
    ...mons.map(([, x]) => ({ y: x.at[1], draw: () => drawMonster(x, x.dying) })), ...items.map(([, x]) => ({ y: x.at[1] - .01, draw: () => drawProp(x) }))];
  figs.sort((p, q) => p.y - q.y).forEach(f => f.draw());
  ctx.restore();
  ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 1;
  const [mx0, my0] = toScreen(0, 0), [mx1, my1] = toScreen(m.cols, m.rows); ctx.strokeRect(mx0, my0, mx1 - mx0, my1 - my0);
  if (st.dark) label('🌑 後室黑幕', mx0 + 8, my0 + 18, '#c9b5ff', 'left');
  // 這一行之前的位置 → 這一行走到哪
  if (st.move) { const [x1, y1] = toScreen(...st.move.from), [x2, y2] = toScreen(...st.move.to); arrow(x1, y1, x2, y2, '#c39bff'); }
  // 角色：腳底圓點＋名字（拖曳＝改「讓他站到這裡」的那一行）
  for (const [no, a] of actors) {
    const c = castBy(no), [x, y] = toScreen(...a.at), on = a.src === sel;
    ctx.fillStyle = on ? '#ffd479' : '#ffb38a'; ctx.strokeStyle = '#000'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(x, y, on ? 7 : 5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    label(pad(no) + ' ' + (c ? castName(c) : '？'), x, y - (SIZE - 14) * view.z - 6, on ? '#ffd479' : '#fff');
    handles.push({ x, y, r: Math.max(12, 22 * view.z), cursor: 'grab', drag: p => { s.steps[a.src].at = p; }, step: a.src });
  }
  // 怪物（紅點）、道具（藍點）：拖曳＝改那一行的位置
  const dot = (list, color, text) => { for (const [no, x] of list) {
    const [sx, sy] = toScreen(...x.at), on = x.src === sel;
    ctx.fillStyle = on ? '#ffd479' : color; ctx.strokeStyle = '#000'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(sx, sy, on ? 7 : 5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    label(text(no, x), sx, sy + 18, on ? '#ffd479' : color);
    handles.push({ x: sx, y: sy, r: Math.max(12, 18 * view.z), cursor: 'grab', drag: p => { s.steps[x.src].at = p; }, step: x.src });
  } };
  dot(mons, '#ff7b7b', (no, x) => '怪' + pad(no) + ' ' + (monOf(x.type)?.name || x.type) + (x.dying ? '（死亡）' : ''));
  dot(items, '#7fd0ff', (no, x) => '物' + pad(no) + ' ' + (propOf(x.id)?.name || x.id));
  // 鏡頭：虛線框＝劇情跑到這一行時拍到的範圍；下面那一塊是對話框會蓋住的地方
  const camStep = cur && (cur.do === 'cam' || cur.do === 'camMove');
  if (st.cam && ($('showCams').checked || camStep)) {
    if (cur?.do === 'camMove') { const prev = simulate(sel - 1).cam; if (prev) drawCam(prev, false, true); }
    drawCam(st.cam, st.cam.src === sel, false);
  }
  // 特效範圍：選到特效那一行時顯示
  if (cur?.do === 'fx' && cur.box) drawFxBox(cur);
  if (rubber) {   // 正在框特效範圍
    const [x1, y1] = toScreen(rubber.a[0], rubber.a[1]), [x2, y2] = toScreen(rubber.b[0], rubber.b[1]);
    ctx.save(); ctx.setLineDash([7, 5]); ctx.strokeStyle = '#ffd479'; ctx.lineWidth = 2; ctx.strokeRect(x1, y1, x2 - x1, y2 - y1); ctx.restore();
  }
  if (pick) { ctx.fillStyle = 'rgba(79,191,127,.06)'; ctx.fillRect(0, 0, W, H); }
}
function drawCam(c, on, ghost) {
  const s = scene(), w = c.w, hh = w * RATIO;
  const [x0, y0] = toScreen(c.at[0] - w / 2, c.at[1] - hh / 2), [x1, y1] = toScreen(c.at[0] + w / 2, c.at[1] + hh / 2), [cx, cy] = toScreen(...c.at);
  ctx.save();
  if (!ghost) { ctx.strokeStyle = 'rgba(0,0,0,.7)'; ctx.lineWidth = on ? 5 : 4; ctx.strokeRect(x0, y0, x1 - x0, y1 - y0); }   // 深色底線：淺色地圖上也看得清楚
  ctx.strokeStyle = ghost ? 'rgba(143,211,255,.45)' : on ? '#ffd479' : '#8fd3ff'; ctx.lineWidth = on ? 2.5 : 1.8; ctx.setLineDash(ghost ? [3, 6] : [9, 6]);
  ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
  if (!ghost) { ctx.fillStyle = 'rgba(255,255,255,.06)'; ctx.fillRect(x0, y0 + (y1 - y0) * .7, x1 - x0, (y1 - y0) * .3); }
  ctx.restore();
  if (ghost) { label('上一個鏡頭', x0 + 4, y0 + 14, 'rgba(143,211,255,.8)', 'left'); return; }
  label('🎥 第 ' + String(c.src + 1).padStart(3, '0') + ' 行的鏡頭', x0 + 4, y0 + 15, on ? '#ffd479' : '#8fd3ff', 'left');
  label('對話框', (x0 + x1) / 2, y0 + (y1 - y0) * .85 + 4, 'rgba(255,255,255,.35)');
  ctx.fillStyle = on ? '#ffd479' : '#8fd3ff'; ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill();
  const step = s.steps[c.src];
  // 四個角落：以中心點縮放、長寬比固定
  for (const [x, y] of [[x0, y0], [x1, y0], [x0, y1], [x1, y1]]) {
    cornerHandle(x, y, on);
    handles.push({ x, y, r: 9, cursor: 'nwse-resize', step: c.src, drag: p => { step.w = r1(clamp(2 * Math.max(Math.abs(p[0] - step.at[0]), Math.abs(p[1] - step.at[1]) / RATIO), 3, 300)); } });
  }
  handles.push({ rect: [x0, y0, x1, y1], cursor: 'move', step: c.src, move: true, drag: (p, d) => { step.at = [r1(d.at[0] + p[0] - d.p0[0]), r1(d.at[1] + p[1] - d.p0[1])]; } });
}
function drawFxBox(step) {
  const [bx, by, bw, bh] = step.box, [x0, y0] = toScreen(bx, by), [x1, y1] = toScreen(bx + bw, by + bh);
  ctx.save(); ctx.strokeStyle = 'rgba(0,0,0,.7)'; ctx.lineWidth = 4.5; ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
  ctx.strokeStyle = '#ffd479'; ctx.lineWidth = 2; ctx.setLineDash([7, 5]); ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
  ctx.fillStyle = 'rgba(255,212,121,.08)'; ctx.fillRect(x0, y0, x1 - x0, y1 - y0); ctx.restore();
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  ctx.strokeStyle = '#ffd479'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(cx - 7, cy); ctx.lineTo(cx + 7, cy); ctx.moveTo(cx, cy - 7); ctx.lineTo(cx, cy + 7); ctx.stroke();
  label('✨ 特效範圍（中心點發生）', x0 + 4, y0 - 6, '#ffd479', 'left');
  const center = () => [step.box[0] + step.box[2] / 2, step.box[1] + step.box[3] / 2];
  for (const [x, y] of [[x0, y0], [x1, y0], [x0, y1], [x1, y1]]) {
    cornerHandle(x, y, true);
    handles.push({ x, y, r: 9, cursor: 'nwse-resize', step: sel, drag: p => {
      const [ccx, ccy] = center(), hw = Math.max(.3, Math.abs(p[0] - ccx)), hh = Math.max(.3, Math.abs(p[1] - ccy));
      step.box = [r1(ccx - hw), r1(ccy - hh), r1(hw * 2), r1(hh * 2)];
    } });
  }
  handles.push({ rect: [x0, y0, x1, y1], cursor: 'move', step: sel, move: true, drag: (p, d) => { step.box = [r1(d.box[0] + p[0] - d.p0[0]), r1(d.box[1] + p[1] - d.p0[1]), step.box[2], step.box[3]]; } });
}

// ---- 預覽窗的滑鼠：點位置、框範圍、拖曳、Alt＋中鍵移動畫面、Alt＋滾輪縮放 ----
function eventXY(e) { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
function hitHandle(x, y) {
  const list = [...handles.filter(hd => hd.step === sel), ...handles.filter(hd => hd.step !== sel)];   // 選取中那一行的東西優先（疊在一起時）
  for (const hd of list) if (!hd.rect && Math.hypot(hd.x - x, hd.y - y) <= hd.r) return hd;   // 先找點（角色、角落），再找框的中間
  for (const hd of list) if (hd.rect && x >= hd.rect[0] && x <= hd.rect[2] && y >= hd.rect[1] && y <= hd.rect[3]) return hd;
  return null;
}
cv.addEventListener('mousedown', e => {
  const [x, y] = eventXY(e), p = toCell(x, y);
  if (e.button === 1 || (e.button === 0 && e.altKey)) {   // 移動畫面
    e.preventDefault(); drag = { pan: true, sx: e.clientX, sy: e.clientY, vx: view.x, vy: view.y }; cv.classList.add('panning'); return;
  }
  if (e.button !== 0) return;
  if (pick?.kind === 'point') { const fn = pick.fn; setPick(null); fn([r1(p[0]), r1(p[1])]); commit(); return; }
  if (pick?.kind === 'box') { rubber = { a: p, b: p }; e.preventDefault(); return; }
  const hd = hitHandle(x, y); if (!hd) return;
  const step = scene().steps[hd.step];
  drag = { h: hd, p0: p, at: step?.at && [...step.at], box: step?.box && [...step.box], moved: false };
  if (hd.step !== sel) flashRow(hd.step);
  e.preventDefault();
});
window.addEventListener('mousemove', e => {
  if (rubber) { const [x, y] = eventXY(e); rubber.b = toCell(x, y); drawSoon(); return; }
  if (!drag) {   // 游標提示
    if (e.target === cv && !pick) { const [x, y] = eventXY(e), hd = hitHandle(x, y); cv.style.cursor = hd ? hd.cursor : ''; }
    return;
  }
  if (drag.pan) { view.x = drag.vx - (e.clientX - drag.sx) / view.z; view.y = drag.vy - (e.clientY - drag.sy) / view.z; drawSoon(); return; }
  const [x, y] = eventXY(e), p = toCell(x, y);
  drag.moved = true; drag.h.drag(drag.h.move ? p : [r1(Math.max(0, p[0])), r1(Math.max(0, p[1]))], drag); drawSoon();
});
window.addEventListener('mouseup', () => {
  if (rubber) {
    const r = rubber; rubber = null;
    const x0 = Math.min(r.a[0], r.b[0]), y0 = Math.min(r.a[1], r.b[1]), w = Math.abs(r.b[0] - r.a[0]), hh = Math.abs(r.b[1] - r.a[1]);
    const box = w < .4 || hh < .4 ? [r1(r.a[0] - 1.5), r1(r.a[1] - 1.5), 3, 3] : [r1(x0), r1(y0), r1(w), r1(hh)];   // 只點一下：以那裡為中心的 3×3 格
    const fn = pick?.fn; setPick(null); fn?.(box); commit(); return;
  }
  if (drag?.pan) cv.classList.remove('panning');
  else if (drag?.moved) commit();
  drag = null;
});
cv.addEventListener('wheel', e => {
  if (!e.altKey) return;
  e.preventDefault();
  const [x, y] = eventXY(e), before = toCell(x, y);
  view.z = clamp(view.z * (e.deltaY < 0 ? 1.15 : 1 / 1.15), .1, 4);
  view.x = before[0] * C - x / view.z; view.y = before[1] * C - y / view.z;   // 以游標為中心縮放
  drawSoon();
}, { passive: false });
cv.addEventListener('auxclick', e => { if (e.button === 1) e.preventDefault(); });
function zoomBy(k) {
  const W = cv.clientWidth, H = cv.clientHeight, before = toCell(W / 2, H / 2);
  view.z = clamp(view.z * k, .1, 4); view.x = before[0] * C - W / 2 / view.z; view.y = before[1] * C - H / 2 / view.z; drawSoon();
}
$('zoomIn').onclick = () => zoomBy(1.2); $('zoomOut').onclick = () => zoomBy(1 / 1.2);
$('showCams').onchange = drawSoon;
new ResizeObserver(drawSoon).observe($('stage'));
function setPick(p) {
  pick = p; cv.classList.toggle('picking', !!p);
  $('pickBar').hidden = !p; if (p) $('pickBar').textContent = '👉 ' + p.label + '（按 Esc 取消）';
  renderSteps(); drawSoon();
}
function startPick(step, kind) {
  const i = scene().steps.indexOf(step); if (i >= 0 && i !== sel) { sel = i; }
  if (kind === 'box') setPick({ kind: 'box', step, label: '第 ' + String(i + 1).padStart(3, '0') + ' 行：在預覽窗的地圖上按住拖曳，框出特效範圍', fn: b => { step.box = b; } });
  else setPick({ kind: 'point', step, label: '第 ' + String(i + 1).padStart(3, '0') + ' 行：在預覽窗的地圖上點一下，設定' + (step.do === 'cam' || step.do === 'camMove' ? '鏡頭位置（鏡頭的中心）' : (MON_KINDS.has(step.do) ? '怪物位置（腳底）' : ITEM_KINDS.has(step.do) ? '道具位置' : '角色位置（腳底）')), fn: p => { step.at = p; } });
}

// ---- 右邊：劇情列表 ----
function renderScenes() {
  const sc = $('sceneSel'); sc.innerHTML = '';
  for (const [id, s] of Object.entries(data)) sc.append(h('option', { value: id }, s.title || id));
  if (!sceneId) sc.append(h('option', { value: '' }, '（還沒有劇情）'));
  sc.value = sceneId || '';
  const s = scene();
  for (const id of ['sceneId', 'sceneTitle', 'sceneSub', 'sceneCopy', 'sceneDel']) $(id).disabled = !s;
  $('sceneId').value = sceneId || ''; $('sceneTitle').value = s?.title || ''; $('sceneSub').value = s?.subtitle || '';
  if (typeof addOldScenes === 'function') addOldScenes(sc);   // 舊劇情編輯器的劇情（js/story-kai-import.js）
}
$('sceneSel').onchange = e => {
  if (e.target.value.startsWith('old:')) { const old = e.target.value.slice(4); e.target.value = sceneId || ''; importOld(old); return; }
  sceneId = e.target.value; sel = scene().steps.length ? 0 : -1; castSel = null; setPick(null); renderAll(); drawSoon(); };
$('sceneMore').onclick = () => { const box = $('sceneSettings'); box.hidden = !box.hidden; $('sceneMore').setAttribute('aria-expanded', String(!box.hidden)); };
$('sceneTitle').onchange = e => { scene().title = e.target.value.trim(); commit(); };
$('sceneSub').onchange = e => { const v = e.target.value.trim(); if (v) scene().subtitle = v; else delete scene().subtitle; commit(); };
$('sceneId').onchange = e => {
  const v = e.target.value.trim();
  if (v === sceneId) return;
  if (!/^[A-Za-z0-9_-]+$/.test(v)) { status('劇情 ID 只能用英文、數字、底線（_）或減號（-）', true); e.target.value = sceneId; return; }
  if (data[v]) { status('已經有叫「' + v + '」的劇情了', true); e.target.value = sceneId; return; }
  const out = {}; for (const [k, s] of Object.entries(data)) out[k === sceneId ? v : k] = s;   // 換名字但保留順序
  data = out; sceneId = v; commit();
  status('劇情 ID 改成「' + v + '」。記憶之門如果選了舊的 ID，要到地圖編輯器重新選一次。');
};
function uniqueId(base) { let n = 1, id; do { id = base + pad(n++); } while (data[id]); return id; }
// 新劇情：直接建立，第一行是「＋演出地圖」（地圖在那一行右邊的選單換）；標題在「⚙ 設定」改
function newScene() {
  let n = 1; while (Object.values(data).some(s => s.title === '新劇情' + n)) n++;
  const id = uniqueId('memory_kai_');
  data[id] = { map: '', title: '新劇情' + n, cast: pendingCast.splice(0), steps: [] };   // 全部空的；只有還沒有劇情時先列好的演出者會搬進來
  sceneId = id; sel = 0; castSel = null; view.fitFor = null;
  $('sceneSettings').hidden = false; $('sceneMore').setAttribute('aria-expanded', 'true');
  status('新增了「' + data[id].title + '」（ID：' + id + '）。標題可以在上面的「⚙ 設定」改；地圖用左邊「＋演出地圖」選。');
}
$('sceneNew').onclick = () => { newScene(); commit(); $('sceneTitle').select(); };
$('sceneCopy').onclick = () => {
  const id = uniqueId(sceneId.replace(/_?\d+$/, '') + '_');
  data[id] = clone(scene()); data[id].title = (data[id].title || sceneId) + '（複製）';
  for (const st of data[id].steps) if (st.do === 'fx') st.id = KINDS.fx.make().id;   // 複製出來的特效要另外做：換新的 id
  sceneId = id; commit(); status('複製成「' + id + '」。');
};
$('sceneDel').onclick = () => {
  if (!confirm('刪除劇情「' + (scene().title || sceneId) + '」？（存到專案之前都還能按「從檔案重新載入」救回來）')) return;
  delete data[sceneId]; sceneId = Object.keys(data)[0] || null; sel = scene()?.steps.length ? 0 : -1; view.fitFor = null; commit();
};

// ---- 右邊：演出者列表 ----
function renderCast() {
  const box = $('castList'); box.innerHTML = '';
  const s = castOwner();
  $('castDel').disabled = !s.cast.length;
  if (!s.cast.length) { box.append(h('div', { class: 'note', style: 'padding:6px' }, '按 Add 加入這段劇情會出現的角色。左邊的數字就是「角色代號」。')); return; }
  for (const c of s.cast) {
    // 點一下＝選這個人（給 Del 用）。只換標亮、不重畫：重畫會把正在打開的下拉選單換掉，選單就會馬上關起來
    const row = h('div', { class: 'cast-row' + (castSel === c.no ? ' on' : ''), onclick: () => { castSel = c.no; box.querySelectorAll('.cast-row').forEach(r => r.classList.toggle('on', r === row)); } });
    if (c.image) {   // 圖片角色（從舊劇情搬過來的家屬之類）：只能改名字
      row.append(h('img', { src: c.image, alt: '' }), h('input', { class: 'in', value: c.name || '', title: '名字（對白的說話者會顯示這個）', onchange: e => { c.name = e.target.value.trim(); commit(); } }),
        h('span', { class: 'note', title: c.image }, pad(c.no) + '　圖片角色'), h('span'));
      box.append(row); continue;
    }
    const pickChar = h('select', { class: 'sel', title: '角色', onchange: e => { const ch = charOf(e.target.value); c.char = ch.id; c.sprite = ch.sprite; delete c.accs; delete c.name; commit(); } },
      CHARS.map(ch => h('option', { value: ch.id }, pad(c.no) + '：' + (ch.id === c.char && c.name ? c.name : ch.name))));
    pickChar.value = c.char;
    const pickSprite = h('select', { class: 'sel', title: '立繪版本', onchange: e => { c.sprite = e.target.value; commit(); } },
      variants(c).map(f => h('option', { value: f }, variantName(f))));
    pickSprite.value = c.sprite;
    const n = Object.keys(c.accs || {}).length;
    row.append(h('img', { src: faceSrc(c.sprite), alt: '' }), pickChar, pickSprite,
      h('button', { type: 'button', class: 'small', disabled: c.char === 'mob', title: c.char === 'mob' ? '路人不能戴配件' : '扭蛋機裡的配件', onclick: () => openAcc(c) }, n ? '配件（' + n + '）' : '角色配件'));
    box.append(row);
  }
}
function addCast() {
  const s = castOwner(), used = new Set(s.cast.map(c => c.char)), ch = CHARS.find(x => !used.has(x.id)) || CHARS[0];
  const no = s.cast.reduce((m, c) => Math.max(m, c.no), 0) + 1;
  s.cast.push({ no, char: ch.id, sprite: ch.sprite }); castSel = no;
}
$('castAdd').onclick = () => {
  addCast(); commit();
};
$('castDel').onclick = () => {
  const s = castOwner(), c = castBy(castSel) || s.cast[s.cast.length - 1]; if (!c) return;   // 沒選就刪最後一個
  const used = s.steps.filter(st => Number(st.who) === c.no).length;
  if (used && !confirm(pad(c.no) + ' ' + castName(c) + ' 在 ' + used + ' 行指令裡用到，刪掉之後那些行會找不到角色。確定刪除？')) return;
  s.cast.splice(s.cast.indexOf(c), 1); castSel = null; commit();
};
$('castFold').onclick = () => { const list = $('castList'), open = list.hidden; list.hidden = !open; $('castFold').textContent = open ? '▴' : '▾'; $('castFold').setAttribute('aria-expanded', String(open)); };
let accFor = null;
function openAcc(c) {
  accFor = c; const box = $('accSlots'); box.innerHTML = '';
  $('accTitle').textContent = '角色配件：' + pad(c.no) + ' ' + castName(c);
  for (const slot of (typeof COSTUME_SLOTS !== 'undefined' ? COSTUME_SLOTS : []).filter(x => x.id !== 'skin')) {
    const list = (typeof COSTUME_ACCESSORIES !== 'undefined' ? COSTUME_ACCESSORIES : []).filter(a => a.slot === slot.id && (typeof costumeAllowed !== 'function' || costumeAllowed(c.char, a.id)));
    const select = h('select', { class: 'sel', onchange: e => { c.accs = c.accs || {}; if (e.target.value) c.accs[slot.id] = e.target.value; else delete c.accs[slot.id]; if (!Object.keys(c.accs).length) delete c.accs; commit(false); drawSoon(); } },
      h('option', { value: '' }, '（不戴）'), list.map(a => h('option', { value: a.id }, a.name || a.id)));
    select.value = c.accs?.[slot.id] || '';
    box.append(h('span', {}, slot.name), select);
  }
  $('accDlg').showModal();
}
$('accOk').onclick = () => { $('accDlg').close(); renderCast(); };

// ---- 右邊：指令列表 ----
function problem(st) {   // 這一行哪裡還沒設定好（列表上標紅）
  if ((WHO_KINDS.has(st.do) || (st.do === 'say' && st.who !== '' && st.who != null)) && !castBy(st.who)) return '角色代號不在演出者列表裡';
  if (['cam', 'camMove', 'show', 'move', 'mshow', 'ishow'].includes(st.do) && !st.at) return '還沒在地圖上點位置';
  if (st.do === 'mact' && st.act === 'move' && !st.at) return '還沒在地圖上點要走到哪';
  if (st.do === 'mshow' && !monOf(st.type)) return '還沒選怪物';
  if (st.do === 'ishow' && !propOf(st.id)) return '還沒選道具';
  if ((st.do === 'mhide' || st.do === 'mact') && !shownBy('mon', st.mon, scene().steps.indexOf(st))) return '上面沒有這個代號的「怪物出現」';
  if (st.do === 'ihide' && !shownBy('item', st.item, scene().steps.indexOf(st))) return '上面沒有這個代號的「道具出現」';
  if (st.do === 'fx' && !st.box) return '還沒框特效範圍';
  if (st.do === 'map' && !st.map) return '還沒選地圖';
  if (st.do === 'map' && !storyMaps.some(m => m.id === st.map)) return '劇情地圖編輯器裡找不到這張地圖';
  if (st.do === 'say' && !st.text) return '還沒寫對白';
  if ((st.do === 'bgm' || st.do === 'sfx') && !st.src) return '還沒選音檔';
  return '';
}
function rowLabel(st) {
  const name = '<' + (KINDS[st.do]?.name || st.do) + '>';
  let extra = '';
  if (WHO_KINDS.has(st.do)) extra = ' ' + whoText(st.who);
  if (st.do === 'say') { const t = String(st.text || '').replace(/\s+/g, ' '); extra = ' ' + (st.who === '' || st.who == null ? '[旁白]' : whoText(st.who)) + ' [「' + (t.length > 14 ? t.slice(0, 14) + '……' : t || '……') + '」]'; }
  if ((st.do === 'bgm' || st.do === 'sfx') && st.src) extra = ' ' + st.src.split('/').pop();
  if (st.do === 'end' && st.title) extra = ' 「' + st.title + '」';
  if (st.do === 'map' && st.map) extra = ' ' + mapName(st.map);
  if (MON_KINDS.has(st.do)) {
    const src = st.do === 'mshow' ? st : shownBy('mon', st.mon, scene().steps.indexOf(st));
    extra = ' [' + (codeOk(st.mon) ? pad(st.mon) : '??') + '/' + (monOf(src?.type)?.name || '怪物') + ']' + (st.do === 'mact' ? ' ' + ((MON_ACTS.find(a => a[0] === st.act) || [, '攻擊'])[1]) : '');
  }
  if (ITEM_KINDS.has(st.do)) {
    const src = st.do === 'ishow' ? st : shownBy('item', st.item, scene().steps.indexOf(st));
    extra = ' [' + (codeOk(st.item) ? pad(st.item) : '??') + '/' + (propOf(src?.id)?.name || '道具') + ']';
  }
  if (st.do === 'act') extra += ' ' + ((ACTS.find(a => a[0] === st.act) || [, '小跳'])[1]) + (st.act !== 'hop' && st.on === false ? '（停）' : '');
  return [name, extra];
}
// 每一行最右邊的設定（藍＝下拉選單、紅＝自己輸入、綠＝到地圖上點）
function numIn(st, key, min, max, title) {
  return h('input', { type: 'number', value: st[key] ?? '', min, max, step: key === 'ms' ? 100 : 1, title,
    onchange: e => { const v = e.target.value === '' ? 0 : Number(e.target.value); st[key] = clamp(Math.round(v), min, max); commit(); } });
}
const msIn = (st, title = '毫秒（1000＝1 秒）') => numIn(st, 'ms', 0, 600000, title);
function lvSel(st, max = 5) {
  const s = h('select', { title: '幅度：數字越大越明顯', onchange: e => { st.lv = Number(e.target.value); commit(); } }, Array.from({ length: max }, (_, i) => h('option', { value: i + 1 }, String(i + 1))));
  s.value = st.lv || 1; return s;
}
function codeIn(st, placeholder = '代號', key = 'who', title = '角色代號（演出者列表左邊的數字）') {
  return h('input', { type: 'text', class: 'code', value: st[key] === '' || st[key] == null ? '' : pad(st[key]), placeholder, inputmode: 'numeric', title,
    onchange: e => { const v = e.target.value.trim(); st[key] = v === '' || isNaN(Number(v)) ? '' : Number(v); commit(); } });
}
const monCode = st => codeIn(st, '代號', 'mon', '怪物代號：自己取的號碼，同一隻怪物的「出現、演出、消失」用同一個號碼');
const itemCode = st => codeIn(st, '代號', 'item', '道具代號：自己取的號碼，同一個道具的「出現、消失」用同一個號碼');
function listSel(st, key, list, empty, title) {
  const s = h('select', { title, style: 'max-width:140px', onchange: e => { st[key] = e.target.value; commit(); } }, h('option', { value: '' }, empty), list.map(x => h('option', { value: x.id }, x.name)));
  s.value = st[key] || ''; return s;
}
function monFaceSel(st, list = MON_FACES) {
  const s = h('select', { title: '怪物面向哪邊（攻擊時朝這邊揮）', onchange: e => { if (e.target.value) st.face = e.target.value; else delete st.face; commit(); } }, list.map(([v, t]) => h('option', { value: v }, t)));
  s.value = st.face || ''; return s;
}
function check(st, key, text, def = false) {
  return h('label', {}, h('input', { type: 'checkbox', checked: st[key] ?? def, onchange: e => { st[key] = e.target.checked; commit(); } }), text);
}
function faceSel(st) {
  const s = h('select', { title: '走到之後面向哪邊', onchange: e => { if (e.target.value) st.face = e.target.value; else delete st.face; commit(); } }, FACES.map(([v, t]) => h('option', { value: v }, t)));
  s.value = st.face || ''; return s;
}
function pickBtn(st, text, kind = 'point') {
  const set = kind === 'box' ? !!st.box : !!st.at;
  return h('button', { type: 'button', class: 'pick' + (set ? '' : ' unset') + (pick?.step === st ? ' active' : ''), title: set ? (kind === 'box' ? '範圍：' + st.box.join(', ') : '位置：' + st.at.join(', ')) + '（點一下重新設定；也可以在地圖上直接拖）' : '點一下，再到預覽窗的地圖上' + (kind === 'box' ? '框範圍' : '點位置'),
    onclick: e => { e.stopPropagation(); if (pick?.step === st) setPick(null); else startPick(st, kind); } }, (set ? '✔ ' : '') + text);
}
function fileBtn(st) {
  const name = st.src ? st.src.split('/').pop() : '';
  return [h('button', { type: 'button', title: st.src || '從電腦選一個音檔（要放在遊戲資料夾裡；不在裡面會自動複製進來）', style: 'max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap', onclick: e => { e.stopPropagation(); chooseAudio(st); } }, name ? '🎵 ' + name : '從檔案開啟'),
    st.src ? h('button', { type: 'button', title: '試聽', onclick: e => { e.stopPropagation(); testAudio(st); } }, '▶') : null];
}
function fxTag(st) {
  const done = typeof STORY_KAI_FX !== 'undefined' && !!STORY_KAI_FX[st.id], chat = st.chat || [];
  const lastMe = chat.map(m => m.from).lastIndexOf('me'), lastAi = chat.map(m => m.from).lastIndexOf('claude');
  if (lastMe > lastAi) return ['wait', done ? '⏳ 等修改' : '⏳ 等製作'];
  if (done) return ['ok', '✔ 已製作'];
  return ['', chat.length ? '⏳ 等製作' : '還沒寫說明'];
}
function controls(st) {
  switch (st.do) {
    case 'map': {
      const s = h('select', { title: '在哪張劇情地圖演出（📖 劇情地圖編輯器）', style: 'max-width:220px', onchange: e => { st.map = e.target.value; view.fitFor = null; commit(); } },
        h('option', { value: '' }, '（選地圖）'), storyMaps.map(m => h('option', { value: m.id }, m.name || m.id)), st.map && !storyMaps.some(m => m.id === st.map) ? h('option', { value: st.map }, st.map + '（找不到）') : null);
      s.value = st.map || ''; return [s];
    }
    case 'cam': return [pickBtn(st, '鏡頭位置')];
    case 'camMove': return [pickBtn(st, '鏡頭位置'), msIn(st, '等待時間（ms）：從上一個鏡頭移到這裡花多久')];
    case 'blackIn': case 'blackOut': case 'whiteIn': case 'whiteOut': return [h('label', {}, '秒數(ms)：', msIn(st))];
    case 'wait': return [h('label', {}, '秒數(ms)：', msIn(st, '停在這一行多久，再跑下一行'))];
    case 'camShake': return [h('label', {}, '秒數(ms)：', msIn(st, '震多久')), h('label', {}, '幅度：', lvSel(st))];
    case 'camSway': return [check(st, 'on', '晃動開', true), h('label', {}, '幅度：', lvSel(st))];
    case 'show': return [codeIn(st), pickBtn(st, '角色位置'), faceSel(st)];
    case 'hide': return [codeIn(st)];
    case 'move': return [codeIn(st), pickBtn(st, '角色位置'), msIn(st, '等待時間（ms）：走過去花多久（0＝直接出現在那裡）'), faceSel(st)];
    case 'act': {
      const pickAct = h('select', { title: '小跳：跳一下；持槍、倒地、集氣：勾「開」開始，再加一行取消勾選就停', onchange: e => { st.act = e.target.value; commit(); } }, ACTS.map(([v, t]) => h('option', { value: v }, t)));
      pickAct.value = st.act || 'hop';
      return [codeIn(st), pickAct, st.act !== 'hop' ? check(st, 'on', '開', true) : null];
    }
    case 'mshow': return [monCode(st), listSel(st, 'type', MONS, '（選怪物）', '哪一種怪物（怪物編輯器裡的）'), pickBtn(st, '怪物位置'), monFaceSel(st, [['', '正面'], ['left', '朝左'], ['right', '朝右']])];
    case 'mhide': return [monCode(st)];
    case 'mact': {
      const pickAct = h('select', { title: '攻擊：朝面向的那邊揮一下；移動：走到地圖上點的位置（會等走到才跑下一行）；死亡：倒下、變黑、消失', onchange: e => { st.act = e.target.value; if (st.act === 'move' && st.ms == null) st.ms = 1000; commit(); } }, MON_ACTS.map(([v, t]) => h('option', { value: v }, t)));
      pickAct.value = st.act || 'attack';
      if (st.act === 'move') return [monCode(st), pickAct, pickBtn(st, '怪物位置'), msIn(st, '等待時間（ms）：走過去花多久（0＝直接出現在那裡）')];
      return [monCode(st), pickAct, st.act === 'die' ? null : monFaceSel(st)];
    }
    case 'ishow': return [itemCode(st), listSel(st, 'id', PROPS, '（選道具）', '哪一個道具（背包裡的物品）'), pickBtn(st, '道具位置')];
    case 'ihide': return [itemCode(st)];
    case 'sway': return [codeIn(st), check(st, 'on', '晃動開', true), h('label', {}, '幅度：', lvSel(st))];
    case 'tremble': return [codeIn(st), check(st, 'on', '震動', true), h('label', {}, '幅度：', lvSel(st))];
    case 'say': return [codeIn(st, '旁白'), h('button', { type: 'button', onclick: e => { e.stopPropagation(); openSay(st); } }, '寫對白'), check(st, 'shake', '框震動')];
    case 'fx': { const [cls, text] = fxTag(st); return [pickBtn(st, '特效範圍', 'box'), h('button', { type: 'button', onclick: e => { e.stopPropagation(); openFx(st); } }, '特效說明'), h('span', { class: 'tag ' + cls }, text)]; }
    case 'dark': return [check(st, 'on', '開啟（只有燈照得到的地方亮）', true)];
    case 'vignette': return [h('label', {}, '暗角範圍：', numIn(st, 'lv', 0, 10, '0～10：數字越大，四周變暗的範圍越大（0＝關掉暗角）'))];
    case 'end': return [h('label', {}, '結局標題：', h('input', { type: 'text', value: st.title || '', placeholder: '空白＝直接回到原本的地圖', style: 'width:150px',
      onchange: e => { st.title = e.target.value.trim(); commit(); } }))];
    case 'bgm': return [...fileBtn(st), check(st, 'fade', '淡入', true), h('label', {}, '音量：', numIn(st, 'vol', 0, 100, '0～100'))];
    case 'bgmStop': return [h('span', { class: 'note' }, '背景音樂 1.5 秒淡出')];
    case 'sfx': return [...fileBtn(st), h('label', {}, '音量：', numIn(st, 'vol', 0, 100, '0～100'))];
  }
  return [];
}
let dragRow = null;
function renderSteps() {
  const box = $('stepList'), keep = box.scrollTop; box.innerHTML = '';
  const s = scene();
  $('stepCount').textContent = s ? s.steps.length + ' 行' : '';
  for (const id of ['playSide', 'playTop', 'playFrom']) $(id).disabled = !s;
  $('delStep').hidden = !s || sel < 0 || sel >= s.steps.length;   // 選了某一行才出現
  if (!s) { box.append(h('div', { class: 'empty' }, '還沒有劇情。按上面的「＋新劇情」開始。')); return; }
  if (!s.steps.length) { box.append(h('div', { class: 'empty' }, '還沒有指令。\n按左邊的按鈕新增，例如先「＋新鏡頭」決定拍哪裡，再「角色出現」、「＋新對白」。')); return; }
  s.steps.forEach((st, i) => {
    const warn = problem(st), [name, extra] = rowLabel(st);
    const row = h('div', { class: 'step' + (i === sel ? ' on' : '') + (warn ? ' warn' : ''), draggable: 'true', title: warn ? '⚠ ' + warn : '', 'data-i': i,
      onclick: () => { if (sel !== i) { sel = i; renderSteps(); drawSoon(); } } },
      h('span', { class: 'no' }, String(i + 1).padStart(3, '0') + '：'), h('span', { class: 'lbl' }, name, extra ? h('em', {}, extra) : null),
      h('span', { class: 'ctl', onclick: e => e.stopPropagation(), onmousedown: e => e.stopPropagation() }, controls(st)),
      h('button', { type: 'button', class: 'x', title: '刪除這一行（Delete）', onclick: e => { e.stopPropagation(); removeStep(i); } }, '✕'));
    // 拖曳換順序
    row.addEventListener('dragstart', e => { if (e.target.closest('input,select,textarea')) { e.preventDefault(); return; } dragRow = i; e.dataTransfer.effectAllowed = 'move'; });
    row.addEventListener('dragover', e => { if (dragRow == null) return; e.preventDefault(); const after = e.offsetY > row.clientHeight / 2; row.classList.toggle('drop-after', after); row.classList.toggle('drop-before', !after); });
    row.addEventListener('dragleave', () => row.classList.remove('drop-after', 'drop-before'));
    row.addEventListener('drop', e => {
      e.preventDefault(); if (dragRow == null) return;
      let to = i + (e.offsetY > row.clientHeight / 2 ? 1 : 0); const from = dragRow; dragRow = null;
      if (to > from) to--;
      if (to !== from) { const [it] = s.steps.splice(from, 1); s.steps.splice(to, 0, it); sel = to; commit(); }
      else renderSteps();
    });
    row.addEventListener('dragend', () => { dragRow = null; box.querySelectorAll('.drop-after,.drop-before').forEach(r => r.classList.remove('drop-after', 'drop-before')); });
    box.append(row);
  });
  box.scrollTop = keep;
}
function flashRow(i) {   // 在地圖上拖到別行的東西：那一行閃一下，讓人知道改的是哪一行
  const row = $('stepList').querySelector('[data-i="' + i + '"]'); if (!row) return;
  row.scrollIntoView({ block: 'nearest' });
  row.animate([{ background: '#4a3f1d' }, { background: 'transparent' }], { duration: 900 });
}
function scrollToSel() { $('stepList').querySelector('.step.on')?.scrollIntoView({ block: 'nearest' }); }
function addStep(kind) {
  const s = scene();
  if (!s) { status('先按右上「＋新劇情」建立一段劇情', true); return; }
  const st = { do: kind, ...KINDS[kind].make() };
  const at = sel >= 0 ? sel + 1 : s.steps.length;
  s.steps.splice(at, 0, st); sel = at; setPick(null); commit(); scrollToSel();
  // 新增後直接進入下一步：要寫的打開視窗、要點位置的直接開始點
  if (kind === 'say') openSay(st);
  else if (['cam', 'camMove', 'show', 'move', 'mshow', 'ishow'].includes(kind)) startPick(st, 'point');
  else if (kind === 'fx') startPick(st, 'box');
}
function removeStep(i) {
  const s = scene(); s.steps.splice(i, 1);
  if (sel >= s.steps.length) sel = s.steps.length - 1;
  setPick(null); commit();
}
$('delStep').onclick = () => { if (sel >= 0) removeStep(sel); };
document.querySelectorAll('[data-add]').forEach(b => b.addEventListener('click', () => addStep(b.dataset.add)));
$('stepList').addEventListener('keydown', e => {
  if (e.target !== $('stepList')) return;
  if ((e.key === 'Delete' || e.key === 'Backspace') && sel >= 0) { e.preventDefault(); removeStep(sel); }
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); sel = clamp(sel + (e.key === 'ArrowDown' ? 1 : -1), 0, scene().steps.length - 1); renderSteps(); scrollToSel(); drawSoon(); }
});
window.addEventListener('keydown', e => { if (e.key === 'Escape' && pick) { setPick(null); } });

// ---- 寫對白（彈窗）----
let sayFor = null;
function openSay(st) {
  sayFor = st;
  $('sayTitle').textContent = '寫對白：第 ' + String(scene().steps.indexOf(st) + 1).padStart(3, '0') + ' 行';
  $('sayWho').value = st.who === '' || st.who == null ? '' : pad(st.who); $('sayText').value = st.text || ''; $('sayShake').checked = !!st.shake;
  sayName(); $('sayDlg').showModal(); $('sayText').focus();
}
function sayName() { const v = $('sayWho').value.trim(), c = v ? castBy(Number(v)) : null; $('sayName').textContent = !v ? '（旁白）' : c ? castName(c) : '⚠ 演出者列表裡沒有 ' + v; }
$('sayWho').oninput = sayName;
$('sayCancel').onclick = () => $('sayDlg').close();
$('sayOk').onclick = () => {
  const v = $('sayWho').value.trim();
  sayFor.who = v === '' || isNaN(Number(v)) ? '' : Number(v); sayFor.text = $('sayText').value.replace(/\s+$/, ''); sayFor.shake = $('sayShake').checked;
  $('sayDlg').close(); commit();
};
$('sayText').addEventListener('keydown', e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); $('sayOk').click(); } });

// ---- 特效說明（彈窗）：像聊天一樣記下跟 Claude 的對話，訊息跟劇情一起存檔 ----
let fxFor = null;
function openFx(st) {
  fxFor = st;
  $('fxTitle').textContent = '特效說明：第 ' + String(scene().steps.indexOf(st) + 1).padStart(3, '0') + ' 行';
  $('fxIdText').textContent = '特效 ID：' + st.id + '（劇情：' + sceneId + '）';
  renderFxChat(); $('fxInput').value = ''; $('fxDlg').showModal(); $('fxInput').focus();
}
function renderFxChat() {
  const box = $('fxChat'), chat = fxFor.chat || [], [cls, text] = fxTag(fxFor);
  $('fxState').className = 'tag ' + cls; $('fxState').textContent = text;
  box.innerHTML = '';
  if (!chat.length) box.append(h('div', { class: 'note' }, '還沒有說明。在下面描述想要的特效：發生什麼、什麼顏色、多大、持續多久……'));
  for (const m of chat) box.append(h('div', { class: 'msg ' + (m.from === 'claude' ? 'claude' : 'me') }, h('small', {}, (m.from === 'claude' ? 'Claude' : '我') + (m.at ? '　' + m.at : '')), m.text));
  box.scrollTop = box.scrollHeight;
}
$('fxSend').onclick = () => {
  const text = $('fxInput').value.trim(); if (!text) return;
  const d = new Date(), z = n => String(n).padStart(2, '0');
  (fxFor.chat = fxFor.chat || []).push({ from: 'me', text, at: d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate()) + ' ' + z(d.getHours()) + ':' + z(d.getMinutes()) });
  $('fxInput').value = ''; commit(); renderFxChat();
  status('特效說明已記下。按「💾 存到專案」後，到 Claude 的對話說「看特效留言」。');
};
$('fxClose').onclick = () => $('fxDlg').close();
$('fxInput').addEventListener('keydown', e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); $('fxSend').click(); } });

// ---- 音檔：從電腦選（要在遊戲資料夾裡；不在裡面就複製到 music/劇情/ 或 Sound effects/劇情/）----
async function chooseAudio(st) {
  const folder = st.do === 'bgm' ? ['music', '劇情'] : ['Sound effects', '劇情'];
  const set = rel => { st.src = rel; commit(); };
  if (window.showOpenFilePicker && typeof ProjectSave !== 'undefined') {
    try {
      const root = await ProjectSave.projectDir(false, m => status(m));
      const [fh] = await window.showOpenFilePicker({ id: 'tudrc-story-audio', startIn: root, types: [{ description: '音檔', accept: { 'audio/*': ['.mp3', '.ogg', '.wav', '.m4a'] } }] });
      let rel = await root.resolve(fh);
      if (!rel) {
        const dir = await ProjectSave.subDir(root, folder, true), file = await fh.getFile();
        const w = await (await dir.getFileHandle(file.name, { create: true })).createWritable(); await w.write(file); await w.close();
        rel = [...folder, file.name];
        status('這個音檔不在遊戲資料夾裡，已經複製一份到 ' + rel.join('/'));
      } else status('選好音檔：' + rel.join('/'));
      set(rel.join('/'));
    } catch (e) {
      if (e && e.name === 'AbortError') return;
      status('選音檔失敗：' + (e && e.message || e) + (e && e.name === 'SecurityError' ? '（請再按一次「從檔案開啟」）' : ''), true);
    }
    return;
  }
  // 瀏覽器不支援直接讀資料夾：用一般的選檔視窗，只能記下檔名（音檔要自己放進對應的資料夾）
  const input = h('input', { type: 'file', accept: 'audio/*' });
  input.onchange = () => { const f = input.files[0]; if (!f) return; set(folder[0] + '/' + f.name); status('記下了「' + folder[0] + '/' + f.name + '」：請確認這個音檔放在遊戲的 ' + folder[0] + ' 資料夾裡', true); };
  input.click();
}
let testing = null;
function testAudio(st) {
  if (testing) { testing.pause(); const same = testing.src.endsWith(encodeURI(st.src)); testing = null; if (same) return; }
  testing = new Audio(st.src); testing.volume = clamp(Number(st.vol ?? (st.do === 'bgm' ? 50 : 100)) / 100, 0, 1);
  testing.play().catch(() => status('播放失敗：找不到 ' + st.src, true));
  testing.onended = () => { testing = null; };
}

// ---- 從頭預覽：在編輯器裡打開遊戲播放（用還沒存到專案的草稿）----
function play(from = 1) {
  if (!scene()) return;
  saveDraft();
  $('playFrame').src = '塔防原型.html?storyPreview=' + encodeURIComponent(sceneId) + '&storyKai=1&storyDraft=1' + (from > 1 ? '&storyFrom=' + from : '');
  $('playModal').hidden = false; $('playFrame').focus();
}
function closePlay() { $('playModal').hidden = true; $('playFrame').src = 'about:blank'; }
$('playTop').onclick = () => play(1); $('playSide').onclick = () => play(1); $('playFrom').onclick = () => play(Math.max(1, sel + 1));
$('playClose').onclick = closePlay;
window.addEventListener('message', e => { if (e.data && e.data.storyKai === 'close') closePlay(); });
window.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('playModal').hidden) closePlay(); });

// ---- 下載、從檔案重新載入 ----
$('exportFile').onclick = () => {
  const url = URL.createObjectURL(new Blob([storyKaiExportText()], { type: 'text/javascript' }));
  const a = document.createElement('a'); a.href = url; a.download = 'story-kai.js'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  status('已下載 story-kai.js，放到 data/ 取代舊檔。');
};
$('resetFile').onclick = () => {
  if (!confirm('丟掉瀏覽器裡還沒存到專案的修改，改回 data/story-kai.js 的內容？')) return;
  localStorage.removeItem(KAI_STORE); DraftSync.forget(KAI_STORE); loadData(true); sel = scene()?.steps.length ? 0 : -1; castSel = null; view.fitFor = null; renderAll(); drawSoon(); status('已從檔案重新載入。');
};
// 專案檔在編輯器開著的時候被改過了（例如 Claude 回覆了特效留言）：提醒重新整理，修改會自動合併保留
const FILE_AT_LOAD = JSON.stringify(typeof STORY_KAI !== 'undefined' ? STORY_KAI : {});
async function askReloadIfStale() {
  if (location.protocol === 'file:') return;
  try {
    const text = await (await fetch('data/story-kai.js?t=' + Date.now(), { cache: 'no-store' })).text();
    const now = JSON.stringify(new Function(text.replace('const STORY_KAI =', 'return ').replace(/;\s*$/, ''))());
    if (now === FILE_AT_LOAD) return;
  } catch (_) { return; }
  status('專案檔 data/story-kai.js 有新的內容（例如 Claude 回覆了特效留言），請重新整理這頁（你的修改會自動合併保留）。', true);
  if (confirm('專案檔 data/story-kai.js 在這頁開著時被更新了（例如 Claude 回覆了特效留言）。\n\n現在重新整理編輯器嗎？你在這裡的修改會先存好，再跟新內容自動合併。')) { saveDraft(); location.reload(); }
}
window.addEventListener('focus', () => { askReloadIfStale(); });

// ---- 啟動 ----
function renderAll() { renderScenes(); renderCast(); renderSteps(); }
loadData(false);
if (scene() && sel < 0 && scene().steps.length) sel = 0;
renderAll(); drawSoon();
