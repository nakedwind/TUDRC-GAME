/* ===== 💬 NPC 閒聊編輯器（閒聊編輯器.html）=====
   資料存在 data/npc-chats.js（格式見那個檔案開頭），遊戲程式在 js/npc-chats.js。
   ・左邊選基地地圖 → 列出這張地圖的閒聊；「＋ 新增閒聊」在這張地圖新增一段。
   ・中間是地圖（只用來看位置、點站位）：按右邊某人的「⌖ 站位」再點一格。
   ・右邊編輯：參加的人、站位與面向、發生機率、台詞（好幾段，每次隨機挑一段）。
   ・編輯自動存在瀏覽器（tudrc_npc_chats_v1），跟遊戲和專案檔三方合併（js/draft-sync.js）；「▶ 預覽遊戲」直接用；「💾 存到專案」寫進 data/npc-chats.js。
*/
const CHAT_STORE = 'tudrc_npc_chats_v1';
const CHAT_CELL = 40;
const CHAT_FACES = [['', '自動（面向對方）'], ['left', '朝左'], ['right', '朝右'], ['front', '正面（朝下）'], ['back', '背面（朝上）']];
const CHAT_RULE_NOTES = {
  checkEvery: '每幾秒檢查一次要不要開始聊天', chance: '檢查時發生的機率（一段沒有自己寫 chance 時）', cooldown: '同一段聊完後，至少隔幾秒才會再聊',
  firstDelay: '進到地圖後至少過幾秒才會開始第一段', walkTimeout: '走過去最多走幾秒（走不到就直接在原地聊）', lineBase: '每句泡泡至少顯示幾秒',
  linePerChar: '每個字再多顯示幾秒', lineMax: '每句最多顯示幾秒', lineGap: '兩句之間停多久（泡泡消失）', startPause: '溫特按「聽閒聊」後先停多久才開口',
  waitTime: '到定位後等溫特來聽幾秒（沒人來就散開）', listenRange: '離大家中間幾格內可以按 Space「聽閒聊」', leaveRange: '聽到一半，溫特走離幾格就當作不聽了（大家散開）', murmurEvery: '等人來聽時，頭上「…」大約隔幾秒冒一次',
};
const CHAT_COLORS = ['#ff8a8a', '#ffc46b', '#f4e66b', '#9be67a', '#5fd3b0', '#66c8ff', '#8ea2ff', '#c39bff', '#ff8ad8', '#ffb38a', '#b8e0a0', '#a0d8ef', '#e0b8ff', '#ffd9a0', '#c0c0c0'];
const chatPeople = Object.values(CHARACTERS).filter(c => c.kind !== 'player').map((c, i) => ({ id: c.id, name: c.name, sprite: c.sprite, color: CHAT_COLORS[i % CHAT_COLORS.length] }));
const chatPerson = id => chatPeople.find(p => p.id === id) || null;
const chatName = id => (chatPerson(id) || {}).name || id;
const chatFace = p => p && p.sprite ? 'images/character/' + p.sprite + '/' + p.sprite.replace('_', '') + '_0000_Front.png' : '';
const chatEsc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const clone = o => JSON.parse(JSON.stringify(o));
const $ = id => document.getElementById(id);
function status(msg, err = false) { const el = $('status'); el.textContent = msg; el.classList.toggle('error', !!err); }

// ---- 資料 ----
let chatData = null, chatSel = null, chatTalk = 0, chatStandPick = null;
const baseMaps = (typeof BASE_MAPS !== 'undefined' ? BASE_MAPS : []).filter(m => m.safe !== false);
let mapName = (baseMaps[0] || {}).name;
const curMap = () => baseMaps.find(m => m.name === mapName) || baseMaps[0];
function loadChatData(useFile) {
  let d = null;
  if (!useFile) try { d = DraftSync.load(CHAT_STORE, { chats: typeof NPC_CHATS !== 'undefined' ? NPC_CHATS : [] }, { label: 'NPC 閒聊' }); } catch (_) {}
  if (!d || !Array.isArray(d.chats)) d = { chats: clone(typeof NPC_CHATS !== 'undefined' ? NPC_CHATS : []) };
  for (const c of d.chats) { c.who = Array.isArray(c.who) ? c.who : []; c.talks = Array.isArray(c.talks) && c.talks.length ? c.talks : [[]]; }
  chatData = d;
}
function saveChatData() { try { localStorage.setItem(CHAT_STORE, JSON.stringify(chatData)); status('已自動儲存到這台瀏覽器。'); } catch (e) { status('暫存失敗：' + e.message, true); } }
const chatById = id => chatData.chats.find(c => c.id === id) || null;

// ---- 地圖畫面（簡化版：只畫素材圖片，用來看位置）----
const tileList = typeof SHARED_TILES !== 'undefined' ? SHARED_TILES : [];
const tileMap = new Map(tileList.map(t => [t.id, t]));
const imgCache = {};
function tileImg(t) {
  if (!t || !t.file) return null;
  let rec = imgCache[t.file];
  if (!rec) { const img = new Image(); rec = imgCache[t.file] = { img, ok: false }; img.onload = () => { rec.ok = true; drawSoon(); }; img.src = t.file; }
  return rec.ok ? rec.img : null;
}
const LAYER_ORDER = ['floor', 'ground', 'ground2', 'ground3', 'object', 'object2', 'object3', 'object4', 'overlay', 'top'];
const cv = $('map'), ctx = cv.getContext('2d');
let zoom = .6, hoverCell = null, drawPending = false;
function drawSoon() { if (drawPending) return; drawPending = true; requestAnimationFrame(() => { drawPending = false; drawMap(); }); }
function drawImg(img, x, y, w, h, fx, fy, rot) {
  if (!fx && !fy && !rot) { ctx.drawImage(img, x, y, w, h); return; }
  ctx.save(); ctx.translate(x + w / 2, y + h / 2); if (rot) ctx.rotate(rot * Math.PI / 2); ctx.scale(fx ? -1 : 1, fy ? -1 : 1);
  const iw = rot % 2 ? h : w, ih = rot % 2 ? w : h; ctx.drawImage(img, -iw / 2, -ih / 2, iw, ih); ctx.restore();
}
function drawMap() {
  const m = curMap(); if (!m) return;
  const C = CHAT_CELL, W = m.cols * C, H = m.rows * C;
  cv.width = W; cv.height = H; cv.style.width = Math.round(W * zoom) + 'px'; cv.style.height = Math.round(H * zoom) + 'px';
  $('zoomText').textContent = Math.round(zoom * 100) + '%';
  ctx.fillStyle = '#0b1016'; ctx.fillRect(0, 0, W, H); ctx.imageSmoothingEnabled = false;
  const order = Array.isArray(m.layerOrder) && m.layerOrder.length ? m.layerOrder.map(l => l.id) : LAYER_ORDER;
  for (const lid of order) {
    const cells = (m.layers || {})[lid] || {};
    for (const [k, id] of Object.entries(cells)) { const t = tileMap.get(id), img = tileImg(t); if (!img) continue; const [c, r] = k.split(',').map(Number); ctx.drawImage(img, c * C, r * C, C, C); }
    for (const s of m.stamps || []) {
      if ((s.layer || 'top') !== lid) continue;
      const t = tileMap.get(s.id), img = tileImg(t); if (!t) continue;
      const rot = ((Number(s.rot) || 0) % 4 + 4) % 4, w = (rot % 2 ? (t.h || 1) : (t.w || 1)) * C, h = (rot % 2 ? (t.w || 1) : (t.h || 1)) * C;
      const x = s.c * C + (s.ox || 0), y = s.r * C + (s.oy || 0);
      if (img) drawImg(img, x, y, w, h, s.fx, s.fy, rot); else if (t.color) { ctx.fillStyle = t.color; ctx.fillRect(x, y, w, h); }
    }
  }
  if ($('showSolid').checked) {
    ctx.fillStyle = 'rgba(200,50,50,.22)'; ctx.strokeStyle = 'rgba(255,90,90,.5)'; ctx.lineWidth = 1;
    for (const k of m.solid || []) { const [c, r] = k.split(',').map(Number); ctx.fillRect(c * C, r * C, C, C); ctx.strokeRect(c * C + 1.5, r * C + 1.5, C - 3, C - 3); }
  }
  ctx.strokeStyle = 'rgba(255,255,255,.05)'; ctx.beginPath();
  for (let c = 1; c < m.cols; c++) { ctx.moveTo(c * C + .5, 0); ctx.lineTo(c * C + .5, H); }
  for (let r = 1; r < m.rows; r++) { ctx.moveTo(0, r * C + .5); ctx.lineTo(W, r * C + .5); }
  ctx.stroke();
  drawStands(m);
}
function standDir(pts, p) {   // 自動面向：看其他人在哪個方向
  const o = pts.filter(q => q !== p); if (!o.length) return 'front';
  const ox = o.reduce((s, q) => s + q.x, 0) / o.length - p.x, oy = o.reduce((s, q) => s + q.y, 0) / o.length - p.y;
  return Math.abs(ox) >= Math.abs(oy) ? (ox < 0 ? 'left' : 'right') : (oy < 0 ? 'back' : 'front');
}
function drawStands(m) {
  const C = CHAT_CELL;
  for (const c of chatData.chats) {
    if (c.map !== m.name || !c.stand) continue;
    const sel = c.id === chatSel;
    ctx.globalAlpha = sel || !chatSel ? 1 : .35;
    const pts = c.who.filter(id => c.stand[id]).map(id => ({ id, x: (c.stand[id][0] + .5) * C, y: (c.stand[id][1] + .5) * C, face: c.stand[id][2] }));
    if (pts.length > 1) { ctx.setLineDash([5, 4]); ctx.strokeStyle = sel ? '#ffd479' : '#9aa4b2'; ctx.lineWidth = 2; ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.stroke(); ctx.setLineDash([]); }
    for (const p of pts) {
      const col = (chatPerson(p.id) || {}).color || '#fff', face = p.face || standDir(pts, p);
      ctx.fillStyle = '#10151c'; ctx.beginPath(); ctx.arc(p.x, p.y, 13, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(p.x, p.y, 10, 0, Math.PI * 2); ctx.stroke();
      const [dx, dy] = { left: [-1, 0], right: [1, 0], front: [0, 1], back: [0, -1] }[face];
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(p.x + dx * 19, p.y + dy * 19); ctx.lineTo(p.x + dx * 11 - dy * 6, p.y + dy * 11 + dx * 6); ctx.lineTo(p.x + dx * 11 + dy * 6, p.y + dy * 11 - dx * 6); ctx.fill();
      const label = chatName(p.id) + (sel ? '' : '（' + c.id + '）');
      ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = '#000'; ctx.strokeText(label, p.x, p.y - 17); ctx.fillStyle = '#fff'; ctx.fillText(label, p.x, p.y - 17);
    }
  }
  ctx.globalAlpha = 1;
  if (chatStandPick && hoverCell) { ctx.strokeStyle = (chatPerson(chatStandPick) || {}).color || '#fff'; ctx.lineWidth = 3; ctx.strokeRect(hoverCell[0] * C + 2, hoverCell[1] * C + 2, C - 4, C - 4); }
}
function cellOf(e) { const r = cv.getBoundingClientRect(); return [Math.floor((e.clientX - r.left) / r.width * cv.width / CHAT_CELL), Math.floor((e.clientY - r.top) / r.height * cv.height / CHAT_CELL)]; }
cv.addEventListener('pointermove', e => { const [c, r] = cellOf(e), m = curMap(); const h = c >= 0 && r >= 0 && c < m.cols && r < m.rows ? [c, r] : null; if (String(h) !== String(hoverCell)) { hoverCell = h; if (chatStandPick) drawSoon(); } });
cv.addEventListener('pointerleave', () => { hoverCell = null; drawSoon(); });
cv.addEventListener('pointerdown', e => {
  const m = curMap(), [col, row] = cellOf(e);
  if (!chatStandPick) {   // 沒在設站位：點站位圓點＝選那一段閒聊
    for (const c of chatData.chats) if (c.map === m.name && c.stand && c.who.some(id => c.stand[id] && c.stand[id][0] === col && c.stand[id][1] === row)) { chatSel = c.id; chatTalk = 0; renderAll(); return; }
    return;
  }
  const c = chatSel && chatById(chatSel), id = chatStandPick; if (!c) { chatStandPick = null; return; }
  if (col < 0 || row < 0 || col >= m.cols || row >= m.rows || (m.solid || []).includes(col + ',' + row)) { status('這格站不了人，請選可通行的空格', true); return; }
  if (c.map !== m.name) { c.map = m.name; c.stand = {}; }
  c.stand = c.stand || {};
  const face = c.stand[id] && c.stand[id][2];
  c.stand[id] = face ? [col, row, face] : [col, row];
  const next = c.who.find(w => w !== id && !c.stand[w]);
  chatStandPick = next || null;
  saveChatData(); renderAll();
  status(chatName(id) + '站在 ' + col + ',' + row + (next ? '。接著點' + chatName(next) + '的站位' : ''));
});
$('zoomIn').onclick = () => { zoom = Math.min(2, +(zoom + .1).toFixed(2)); drawMap(); };
$('zoomOut').onclick = () => { zoom = Math.max(.2, +(zoom - .1).toFixed(2)); drawMap(); };
$('showSolid').onchange = drawMap;

// ---- 左邊：地圖、清單 ----
function renderLeft() {
  $('mapSel').innerHTML = baseMaps.map(m => '<option' + (m.name === mapName ? ' selected' : '') + '>' + chatEsc(m.name) + '</option>').join('');
  const here = chatData.chats.filter(c => c.map === mapName);
  $('chatList').innerHTML = here.map(c => '<button type="button" class="item' + (c.id === chatSel ? ' on' : '') + '" data-pick="' + chatEsc(c.id) + '"><b>' + chatEsc(c.id) + '</b><small>' + (c.who.map(chatName).join('・') || '還沒有人') + '・' + c.talks.length + ' 段台詞</small></button>').join('') || '<p class="note">這張地圖還沒有閒聊。</p>';
  const chap = typeof NPC_LOCATIONS !== 'undefined' ? NPC_LOCATIONS[Object.keys(NPC_LOCATIONS).sort((a, b) => b - a)[0]] || {} : {};
  const people = Object.entries(chap).filter(([, l]) => l && l.map === mapName).map(([id]) => chatName(id));
  $('peopleHere').textContent = people.length ? people.join('、') : '（沒有人，或在 data/npc-locations.js 沒設定）';
  $('mapTitle').textContent = mapName;
}
$('mapSel').onchange = e => { mapName = e.target.value; chatStandPick = null; if (chatSel && (chatById(chatSel) || {}).map !== mapName) chatSel = null; renderAll(); };
$('chatList').onclick = e => { const b = e.target.closest('[data-pick]'); if (!b) return; chatSel = b.dataset.pick; chatTalk = 0; chatStandPick = null; renderAll(); };
$('chatNew').onclick = () => {
  let n = 1; while (chatById('閒聊' + n)) n++;
  chatData.chats.push({ id: '閒聊' + n, map: mapName, who: [], stand: {}, talks: [[]] });
  chatSel = '閒聊' + n; chatTalk = 0; saveChatData(); renderAll(); status('新增了一段閒聊：先加參加的人、設站位，再打台詞');
};

// ---- 右邊：編輯 ----
function renderEdit() {
  const c = chatSel && chatById(chatSel), box = $('editBox');
  $('editTitle').textContent = c ? '編輯「' + c.id + '」' : '編輯';
  if (!c) { box.innerHTML = '<p class="note">左邊選一段閒聊，或按「＋ 新增閒聊」。也可以直接點地圖上的站位圓點。</p>'; return; }
  if (chatTalk >= c.talks.length) chatTalk = c.talks.length - 1;
  const stand = c.stand || {};
  const people = c.who.map(id => {
    const p = chatPerson(id) || { id, name: id }, s = stand[id];
    return '<div class="who' + (chatStandPick === id ? ' picking' : '') + '">' + (p.color ? '<i style="background:' + p.color + '"></i>' : '') +
      (p.sprite ? '<span class="face" data-char="' + id + '"><img src="' + chatFace(p) + '" alt=""></span>' : '') + '<b>' + chatEsc(p.name) + '</b>' +
      '<span class="pos">' + (s ? '站 ' + s[0] + ',' + s[1] : '還沒設站位') + '</span>' +
      '<button type="button" class="small' + (chatStandPick === id ? ' on' : '') + '" data-stand="' + id + '">' + (chatStandPick === id ? '點地圖上的一格…' : '⌖ 站位') + '</button>' +
      '<select data-face="' + id + '" title="說話時面向哪邊">' + CHAT_FACES.map(([v, t]) => '<option value="' + v + '"' + ((s && s[2] || '') === v ? ' selected' : '') + '>' + t + '</option>').join('') + '</select>' +
      '<button type="button" class="small danger" data-out="' + id + '" title="這個人不參加">✕</button></div>';
  }).join('');
  const missing = c.who.filter(id => !stand[id]);
  const addOpts = chatPeople.filter(p => !c.who.includes(p.id)).map(p => '<option value="' + p.id + '">' + chatEsc(p.name) + '</option>').join('');
  const talks = c.talks.map((_, i) => '<button type="button" class="small' + (i === chatTalk ? ' on' : '') + '" data-talk="' + i + '">第 ' + (i + 1) + ' 段</button>').join('');
  const lines = (c.talks[chatTalk] || []).map(([who, text], i) =>
    '<div class="line"><select data-who="' + i + '">' + c.who.map(id => '<option value="' + id + '"' + (id === who ? ' selected' : '') + '>' + chatEsc(chatName(id)) + '</option>').join('') +
    (c.who.includes(who) ? '' : '<option selected value="' + chatEsc(who) + '">' + chatEsc(chatName(who)) + '（沒參加）</option>') + '</select>' +
    '<input type="text" data-text="' + i + '" value="' + chatEsc(text) + '" placeholder="台詞">' +
    '<button type="button" class="small" data-up="' + i + '" title="往上移"' + (i ? '' : ' disabled') + '>↑</button>' +
    '<button type="button" class="small" data-down="' + i + '" title="往下移"' + (i < c.talks[chatTalk].length - 1 ? '' : ' disabled') + '>↓</button>' +
    '<button type="button" class="small danger" data-del-line="' + i + '" title="刪掉這句">✕</button></div>').join('');
  const R = typeof NPC_CHAT_RULES !== 'undefined' ? NPC_CHAT_RULES : { chance: .35, checkEvery: 25 };
  box.innerHTML =
    '<label class="f">名稱（不重複就好）<input type="text" id="chatId" value="' + chatEsc(c.id) + '"></label>' +
    '<div class="sub">參加的人</div><div class="list">' + people + '</div>' +
    (c.who.length < 2 ? '<p class="note warn">至少要兩個人才聊得起來。</p>' : '') +
    '<select id="chatAddWho" style="width:100%;margin-top:6px"><option value="">＋ 加一個人…</option>' + addOpts + '</select>' +
    (missing.length && c.who.length ? '<p class="note warn">⚠ ' + missing.map(chatName).join('、') + ' 還沒設站位：全部設好才會照站位站' + (c.spot && c.spot.tile ? '（現在會自動站在「' + chatEsc((tileMap.get(c.spot.tile) || {}).name || c.spot.tile) + '」旁邊）' : '') + '。</p>' : '') +
    '<label class="f">發生機率（0～1，空白＝預設 ' + R.chance + '；每 ' + R.checkEvery + ' 秒檢查一次）<input type="number" id="chatChance" min="0" max="1" step="0.05" value="' + (c.chance ?? '') + '" placeholder="' + R.chance + '"></label>' +
    '<div class="sub">台詞（每次隨機挑一段）</div><div class="tabs">' + talks + '<button type="button" class="small" id="addTalk">＋ 一段</button>' +
    (c.talks.length > 1 ? '<button type="button" class="small danger" id="delTalk">刪掉這段</button>' : '') + '</div>' +
    '<div class="lines">' + (lines || '<p class="note">還沒有台詞。</p>') + '</div>' +
    '<div class="row" style="margin-top:8px"><button type="button" id="addLine">＋ 加一句</button><span style="flex:1"></span><button type="button" class="danger" id="delChat">刪除這個閒聊</button></div>';
}
function renderAll() { renderLeft(); renderEdit(); drawMap(); }
$('editBox').addEventListener('click', e => {
  const t = e.target.closest('button'); if (!t) return;
  const c = chatSel && chatById(chatSel); if (!c) return;
  const d = t.dataset, lines = c.talks[chatTalk];
  if (d.stand) { chatStandPick = chatStandPick === d.stand ? null : d.stand; renderEdit(); drawMap(); if (chatStandPick) status('點地圖上的一格，設定' + chatName(chatStandPick) + '聊天時站的位置（Esc 取消）'); return; }
  if (d.out) { c.who = c.who.filter(id => id !== d.out); if (c.stand) delete c.stand[d.out]; saveChatData(); renderAll(); return; }
  if (d.talk) { chatTalk = +d.talk; renderEdit(); return; }
  if (t.id === 'addTalk') { c.talks.push([]); chatTalk = c.talks.length - 1; saveChatData(); renderEdit(); return; }
  if (t.id === 'delTalk') { if (!confirm('刪掉第 ' + (chatTalk + 1) + ' 段台詞？')) return; c.talks.splice(chatTalk, 1); chatTalk = Math.max(0, chatTalk - 1); saveChatData(); renderAll(); return; }
  if (t.id === 'addLine') {
    const last = lines[lines.length - 1], next = c.who.find(id => !last || id !== last[0]) || c.who[0] || '';   // 預設換另一個人說
    lines.push([next, '']); saveChatData(); renderEdit();
    const inputs = $('editBox').querySelectorAll('[data-text]'); inputs[inputs.length - 1]?.focus(); return;
  }
  if (d.up) { const i = +d.up; [lines[i - 1], lines[i]] = [lines[i], lines[i - 1]]; saveChatData(); renderEdit(); return; }
  if (d.down) { const i = +d.down; [lines[i + 1], lines[i]] = [lines[i], lines[i + 1]]; saveChatData(); renderEdit(); return; }
  if (d.delLine) { lines.splice(+d.delLine, 1); saveChatData(); renderEdit(); return; }
  if (t.id === 'delChat') { if (!confirm('刪除閒聊「' + c.id + '」？')) return; chatData.chats = chatData.chats.filter(x => x !== c); chatSel = null; chatStandPick = null; saveChatData(); renderAll(); }
});
$('editBox').addEventListener('change', e => {
  const c = chatSel && chatById(chatSel); if (!c) return;
  const t = e.target, d = t.dataset;
  if (t.id === 'chatAddWho' && t.value) { c.who.push(t.value); saveChatData(); renderAll(); return; }
  if (t.id === 'chatId') {
    const v = t.value.trim();
    if (!v || (v !== c.id && chatById(v))) { status('名稱不能空白、也不能跟別段重複', true); t.value = c.id; return; }
    c.id = v; chatSel = v; saveChatData(); renderAll(); return;
  }
  if (t.id === 'chatChance') { const v = t.value === '' ? null : Math.max(0, Math.min(1, Number(t.value))); if (v == null || isNaN(v)) delete c.chance; else c.chance = v; saveChatData(); return; }
  if (d.face) { const s = (c.stand || {})[d.face]; if (!s) { status('先設定' + chatName(d.face) + '的站位', true); renderEdit(); return; } s.length = 2; if (t.value) s.push(t.value); saveChatData(); drawMap(); return; }
  if (d.who != null) { c.talks[chatTalk][+d.who][0] = t.value; saveChatData(); return; }
});
$('editBox').addEventListener('input', e => {   // 台詞：打字就存（不重畫，游標不會跳掉）
  const c = chatSel && chatById(chatSel), d = e.target.dataset; if (!c || d.text == null) return;
  c.talks[chatTalk][+d.text][1] = e.target.value; saveChatData();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && chatStandPick) { chatStandPick = null; renderEdit(); drawMap(); status('已取消站位設定'); } });

// ---- 匯出 data/npc-chats.js ----
function chatExportText() {
  const R = typeof NPC_CHAT_RULES !== 'undefined' ? NPC_CHAT_RULES : {};
  const rules = Object.entries(R).map(([k, v]) => '  ' + k + ': ' + JSON.stringify(v) + ',' + (CHAT_RULE_NOTES[k] ? '   // ' + CHAT_RULE_NOTES[k] : '')).join('\n');
  const chats = chatData.chats.map(c => {
    const o = { id: c.id, map: c.map, who: c.who };
    if (c.stand && Object.keys(c.stand).length) o.stand = c.stand;
    if (c.spot) o.spot = c.spot;
    if (c.chance != null) o.chance = c.chance;
    o.talks = c.talks.map(t => t.filter(l => l && String(l[1] || '').trim()));
    return o;
  });
  const body = JSON.stringify(chats, null, 2)
    .replace(/\[\n\s+("(?:[^"\\]|\\.)*"),\n\s+("(?:[^"\\]|\\.)*")\n\s+\]/g, '[$1, $2]')                 // 一句台詞一行
    .replace(/\[\n\s+(\d+),\n\s+(\d+)(?:,\n\s+("[a-z]+"))?\n\s+\]/g, (_, a, b, f) => '[' + a + ', ' + b + (f ? ', ' + f : '') + ']')   // 站位一行
    .replace(/"who": \[\n\s+([^\]]*?)\n\s+\]/g, (_, s) => '"who": [' + s.replace(/,\n\s+/g, ', ') + ']');   // 參加的人一行
  return `/* ===== 基地裡的 NPC 閒聊小表演（程式在 js/npc-chats.js）=====
   兩個（或更多）人偶爾會走到同一個地方，面對面聊幾句；玩家從頭上的泡泡看他們在聊什麼，聊完各自回去做原本的事。
   ・只在基地（安全區）、而且這幾個人剛好都在同一張地圖時才會發生。
   ・建議用「💬 NPC 閒聊編輯器」（閒聊編輯器.html）設定：選人、在地圖上點站位、打台詞，按「💾 存到專案」就會寫進這個檔案。
   ・每一段：
       id：名字（不重複就好）
       map：在哪張基地地圖（地圖名稱）
       who：參加的人（角色 id，NPC 或隊員都可以）；排第一個的站左邊、第二個站右邊
       stand：（選填）每個人站哪一格、面向哪邊：{ 角色: [格 c, 格 r, 'left'／'right'／'front'／'back'] }（面向沒寫＝面向其他人）
       spot：沒有 stand 時，在哪裡聊——{ tile: 地圖素材 id }＝走到那個素材（例如桌子）前面；或 [格 c, 格 r]＝走到那一格
       talks：好幾段可以聊的內容，每次隨機挑一段；每一句是 [誰, 台詞]
       chance：（選填）每次檢查時發生的機率，沒寫用 NPC_CHAT_RULES.chance
*/
const NPC_CHAT_RULES = {
${rules}
};
const NPC_CHATS = ${body};
`;
}
$('previewGame').onclick = () => { saveChatData(); window.open('塔防原型.html?previewChats=1', 'chat_preview'); };
$('exportFile').onclick = () => {
  const url = URL.createObjectURL(new Blob([chatExportText()], { type: 'text/javascript' }));
  const a = document.createElement('a'); a.href = url; a.download = 'npc-chats.js'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  status('已下載 npc-chats.js，放到 data/ 取代舊檔。');
};
$('resetFile').onclick = () => {
  if (!confirm('丟掉瀏覽器裡的編輯，改用 data/npc-chats.js 的內容？')) return;
  try { localStorage.removeItem(CHAT_STORE); } catch (_) {}
  DraftSync.forget(CHAT_STORE); loadChatData(true); chatSel = null; chatStandPick = null; renderAll(); status('已從檔案重新載入。');
};

// ---- 啟動：預設打開第一段閒聊所在的地圖 ----
loadChatData(false);
if (chatData.chats[0] && baseMaps.some(m => m.name === chatData.chats[0].map)) mapName = chatData.chats[0].map;
renderAll();
