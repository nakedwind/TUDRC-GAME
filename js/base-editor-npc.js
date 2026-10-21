/* ===== 基地編輯器：玩家與 NPC 出生位置、NPC 活動範圍 =====
   基地編輯器.html 的右邊面板。每一章一份完整名單：NPC 平時在哪張基地地圖、從哪格出生、在哪個方框裡走動。
   ・選章節 → 每個人選地圖（「不在基地」＝這章不出現）→ 可設出生格、框出活動方框。沒框＝整張地圖閒逛。
   ・走動範圍＝NPC 平時走動的地方（不是禁止進入的地方）。可以框好幾次，框好的格子會自動併成一塊（存成最少的方框）：
     按「▭ 走動範圍」後一直停在設定模式（再按一次或 Esc 結束）；拖曳＝框一塊、點一格＝加 1 格；
     從範圍裡面開始點／拖＝刪掉那些格子。地圖上每一塊（連在一起的格子）只畫外框，名字只標一次。
   ・新增章節會複製最後一章的整份名單，再改有變動的人。
   ・編輯會自動存在瀏覽器（tudrc_npc_locations_v1），「▶ 預覽遊戲」會直接用；
     要正式保留：按「下載 npc-locations.js」，覆蓋到 data/npc-locations.js。
   遊戲讀名單的程式在 js/sentry.js（npcLocation、homeAreaOf）。必須在 js/base-editor.js、js/base-editor-save.js 之後載入。
   （這個檔以前叫 js/base-editor.js；現在 js/base-editor.js 是基地編輯器的核心程式。）
*/
const NPC_LOC_STORE = 'tudrc_npc_locations_v1';
const NPC_COLORS = ['#ff8a8a', '#ffc46b', '#f4e66b', '#9be67a', '#5fd3b0', '#66c8ff', '#8ea2ff', '#c39bff', '#ff8ad8', '#ffb38a', '#b8e0a0', '#a0d8ef', '#e0b8ff', '#ffd9a0', '#c0c0c0'];
const KIND_ORDER = { sentinel: 0, guide: 1, support: 2 };
const KIND_LABEL = { sentinel: '哨兵', guide: '嚮導', support: '後勤' };
const npcPeople = Object.values(CHARACTERS).filter(c => c.kind !== 'player')
  .sort((a, b) => (KIND_ORDER[a.kind] ?? 9) - (KIND_ORDER[b.kind] ?? 9))
  .map((c, i) => ({ id: c.id, name: c.name, kind: c.kind, color: NPC_COLORS[i % NPC_COLORS.length], sprite: c.sprite }));
const npcPerson = id => npcPeople.find(p => p.id === id);
// 頭像：角色的正面圖（images/character/<造型資料夾>/<資料夾去掉底線>_0000_Front.png，跟遊戲裡的隊員頭像一樣）
const npcFacePath = p => p.sprite ? 'images/character/' + p.sprite + '/' + p.sprite.replace('_', '') + '_0000_Front.png' : '';

let npcData = null;        // { chapters: { 1: { id: { map, spawn?, rect? } } } }
let npcChapter = '1';      // 目前編輯的章節
let npcPick = null;        // 正在框範圍的人（id）
let npcSpawnPick = null;   // 正在設定出生格的人（id）
let playerSpawnPick = false; // 正在設定玩家出生格
let npcBoxDrag = null;     // 拖曳中的方框 { c0, r0, c, r }
// 這個人的活動方框（可以好幾個）：rects＝[[c0,r0,c1,r1], …]；舊資料只有一個 rect 的，讀進來時換成 rects
const npcRects = loc => (loc && Array.isArray(loc.rects) ? loc.rects : []);
// 走動範圍的格子（"c,r"）：方框合起來
const npcCellSet = rs => { const s = new Set(); for (const [a0, b0, a1, b1] of rs) for (let c = a0; c <= a1; c++) for (let r = b0; r <= b1; r++) s.add(c + ',' + r); return s; };
const npcCellList = cells => [...cells].map(k => k.split(',').map(Number)).sort((a, b) => a[1] - b[1] || a[0] - b[0]);   // 由上往下、由左往右
function npcRectsFromCells(cells) {   // 格子 → 最少的方框（不重疊）：每次從最上面最左邊那格往右拉到底、再往下拉到整排都有
  const used = new Set(), out = [], free = (c, r) => cells.has(c + ',' + r) && !used.has(c + ',' + r);
  for (const [c, r] of npcCellList(cells)) {
    if (!free(c, r)) continue;
    let c1 = c, r1 = r;
    while (free(c1 + 1, r)) c1++;
    const rowFree = y => { for (let x = c; x <= c1; x++) if (!free(x, y)) return false; return true; };
    while (rowFree(r1 + 1)) r1++;
    for (let x = c; x <= c1; x++) for (let y = r; y <= r1; y++) used.add(x + ',' + y);
    out.push([c, r, c1, r1]);
  }
  return out;
}
const npcMergeRects = rs => npcRectsFromCells(npcCellSet(rs));   // 點一格一格框的也併成一塊
function npcRegions(cells) {   // 連在一起（上下左右相鄰）的格子分成一塊一塊：回傳每塊最上面最左邊那格（名字標在這）
  const seen = new Set(), out = [];
  for (const [c, r] of npcCellList(cells)) {
    if (seen.has(c + ',' + r)) continue;
    out.push([c, r]); seen.add(c + ',' + r);
    const stack = [[c, r]];
    while (stack.length) {
      const [x, y] = stack.pop();
      for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) { const k = nx + ',' + ny; if (cells.has(k) && !seen.has(k)) { seen.add(k); stack.push([nx, ny]); } }
    }
  }
  return out;
}
let npcShowAll = true;     // 地圖上顯示 NPC 範圍
let npcFocus = null;       // 滑過列表時強調的人

// ---- 讀取／存檔 ----
// 舊寫法 area（用素材圍出來的範圍）→ 換成方框，之後就都在編輯器裡用方框調整
function npcAreaToRect(mapName, areaName) {
  if (typeof NPC_AREAS === 'undefined' || !NPC_AREAS[areaName]) return null;
  const m = maps.find(x => x.name === mapName); if (!m) return null;
  const def = NPC_AREAS[areaName], prefixes = [].concat(def.stamps), pad = def.pad ?? 1;
  let c0 = Infinity, r0 = Infinity, c1 = -Infinity, r1 = -Infinity;
  for (const s of m.stamps || []) {
    if (!prefixes.some(p => String(s.id).startsWith(p))) continue;
    const t = tileById(s.id) || {};
    c0 = Math.min(c0, s.c); r0 = Math.min(r0, s.r);
    c1 = Math.max(c1, s.c + tileW(t) - 1); r1 = Math.max(r1, s.r + tileH(t) - 1);
  }
  if (c0 > c1) return null;
  return [Math.max(0, c0 - pad), Math.max(0, r0 - pad), Math.min(m.cols - 1, c1 + pad), Math.min(m.rows - 1, r1 + pad)];
}
function loadNpcData() {
  let d = null;
  try {   // 暫存和專案檔三方合併：朋友新增的 NPC 不會被舊暫存蓋掉（js/draft-sync.js）
    d = typeof DraftSync !== 'undefined' ? DraftSync.load(NPC_LOC_STORE, { chapters: typeof NPC_LOCATIONS !== 'undefined' ? NPC_LOCATIONS : { 1: {} } }, { label: 'NPC 名單' })
      : JSON.parse(localStorage.getItem(NPC_LOC_STORE) || 'null');
  } catch (_) {}
  if (!d || !d.chapters) d = { chapters: clone(typeof NPC_LOCATIONS !== 'undefined' ? NPC_LOCATIONS : { 1: {} }) };
  for (const table of Object.values(d.chapters)) for (const [id, loc] of Object.entries(table)) {
    if (!loc || !loc.map) { delete table[id]; continue; }
    if (typeof MAP_NAME_RENAMES !== 'undefined' && MAP_NAME_RENAMES[loc.map]) loc.map = MAP_NAME_RENAMES[loc.map];   // 地圖改名（加上樓層）：舊暫存跟著換
    if (loc.area && !loc.rect && !loc.rects) { const rect = npcAreaToRect(loc.map, loc.area); if (rect) loc.rect = rect; }
    delete loc.area;
    if (Array.isArray(loc.rect) && !Array.isArray(loc.rects)) loc.rects = [loc.rect];   // 舊的單一方框 → 方框清單
    delete loc.rect;
    if (Array.isArray(loc.rects)) loc.rects = npcMergeRects(loc.rects.filter(rc => Array.isArray(rc) && rc.length === 4).map(rc => rc.map(Number)));   // 一格一格框的：併成一塊
    if (Array.isArray(loc.rects) && !loc.rects.length) delete loc.rects;
  }
  if (!Object.keys(d.chapters).length) d.chapters = { 1: {} };
  npcData = d;
  if (!npcData.chapters[npcChapter]) npcChapter = npcChapterKeys()[0];
}
function saveNpcData() { try { localStorage.setItem(NPC_LOC_STORE, JSON.stringify(npcData)); } catch (_) {} }
const npcChapterKeys = () => Object.keys(npcData.chapters).map(Number).sort((a, b) => a - b).map(String);
const npcTable = () => npcData.chapters[npcChapter] || (npcData.chapters[npcChapter] = {});
const baseMapNames = () => (typeof sortedMaps === 'function' ? sortedMaps() : maps).filter(m => m.safe).map(m => m.name);   // 照樓層排（js/base-editor.js）

// ---- 面板 ----
const npcPanelEl = document.getElementById('npcPanel');
function renderNpcPanel() {
  const keys = npcChapterKeys(), table = npcTable(), names = baseMapNames(), cur = curMap();
  const tabs = keys.map(k => '<button type="button" class="btn npc-ch' + (k === npcChapter ? ' primary' : '') + '" data-npc-ch="' + k + '">第 ' + k + ' 章</button>').join('');
  const opts = (sel) => '<option value="">— 不在基地 —</option>' + names.map(n => '<option' + (n === sel ? ' selected' : '') + '>' + n + '</option>').join('') +
    (sel && !names.includes(sel) ? '<option selected>' + sel + '（找不到這張地圖）</option>' : '');
  let lastKind = null;
  const rows = npcPeople.map(p => {
    const loc = table[p.id], head = p.kind !== lastKind ? '<div class="npc-kind">' + (KIND_LABEL[p.kind] || p.kind) + '</div>' : '';
    lastKind = p.kind;
    const here = loc && loc.map === cur.name;
    const rs = npcRects(loc);
    const range = !loc ? '' : rs.length ? '走動範圍 ' + npcCellSet(rs).size + ' 格' : '整張地圖閒逛';
    const spawn = loc && Array.isArray(loc.spawn) ? '出生格 ' + loc.spawn[0] + ',' + loc.spawn[1] : '隨機出生';
    const picking = npcPick === p.id || npcSpawnPick === p.id;
    return head + '<div class="npc-row' + (picking ? ' picking' : '') + (here ? ' here' : '') + '" data-npc-row="' + p.id + '">' +
      '<i style="background:' + p.color + '"></i>' +
      (p.sprite ? '<span class="npc-face" data-char="' + p.id + '"><img src="' + npcFacePath(p) + '" alt=""></span>' : '') +   // 名字前面的胸像
      '<b>' + p.name + '</b>' +
      '<select data-npc-map="' + p.id + '">' + opts(loc && loc.map) + '</select>' +
      (loc ? '<span class="npc-range">' + spawn + '・' + range + '</span>' +
        '<button type="button" class="btn small" data-npc-spawn="' + p.id + '" title="切到這張地圖，再點一格指定出生地">' + (npcSpawnPick === p.id ? '點選出生格…' : '⌖ 出生點') + '</button>' +
        (loc.spawn ? '<button type="button" class="btn small" data-npc-spawn-random="' + p.id + '" title="清除指定格，改回隨機出生">隨機</button>' : '') +
        '<button type="button" class="btn small' + (npcPick === p.id ? ' primary' : '') + '" data-npc-box="' + p.id + '" title="切到這張地圖設定走動範圍：拖曳＝框一塊、點一格＝加 1 格；從範圍裡面開始點／拖＝刪掉那些格子；框好的會自動併成一塊；再按一次或 Esc 結束">' + (npcPick === p.id ? '走動範圍設定中（再按結束）' : '▭ 走動範圍') + '</button>' +
        (npcRects(loc).length ? '<button type="button" class="btn small" data-npc-clear="' + p.id + '" title="不限範圍，整張地圖閒逛">整張</button>' : '') +
        (!here ? '<button type="button" class="btn small" data-npc-go="' + p.id + '" title="切到他所在的地圖">↪</button>' : '') : '') +
      '</div>';
  }).join('');
  npcPanelEl.innerHTML =
    '<div class="npc-note"><b>玩家出生點</b>：' + (cur.safe ? (Array.isArray(cur.playerSpawn) ? '出生格 ' + cur.playerSpawn[0] + ',' + cur.playerSpawn[1] : '沿用營地或預設位置') : '請切換到基地地圖設定') +
    (cur.safe ? ' <button type="button" class="btn small" data-player-spawn>' + (playerSpawnPick ? '點選出生格…' : '⌖ 設定玩家出生點') + '</button>' + (Array.isArray(cur.playerSpawn) ? ' <button type="button" class="btn small" data-player-spawn-random>預設位置</button>' : '') : '') + '</div>' +
    '<div class="npc-tabs">' + tabs + '<button type="button" class="btn" id="npcAddCh">＋ 新增章節</button>' +
    (keys.length > 1 ? '<button type="button" class="btn danger" id="npcDelCh">刪除這章</button>' : '') + '</div>' +
    '<p class="npc-note">遊戲會用「≤ 目前章節」的最大那一章（目前章節：data/balance.js 的 <b>CHAPTER</b>）。沒選地圖的人這章不在基地；可設出生格，活動範圍另行設定。</p>' +
    '<label class="npc-show"><input type="checkbox" id="npcShowAll"' + (npcShowAll ? ' checked' : '') + '> 在地圖上顯示 NPC 出生點與範圍</label>' +
    '<div class="npc-list">' + rows + '</div>';
  document.getElementById('npcShowAll').onchange = e => { npcShowAll = e.target.checked; draw(); };
}
npcPanelEl.addEventListener('click', e => {
  const t = e.target;
  if (t.dataset.playerSpawn !== undefined) {
    npcPick = null; npcSpawnPick = null; playerSpawnPick = !playerSpawnPick;
    if (playerSpawnPick) setStatus('點選地圖上的一格，設定玩家出生地（按 Esc 取消）', '#8fd3ff');
    renderNpcPanel(); draw(); return;
  }
  if (t.dataset.playerSpawnRandom !== undefined) {
    const m = curMap(); pushUndo(); delete m.playerSpawn; saveMaps(); playerSpawnPick = false; renderNpcPanel(); draw();
    setStatus('玩家出生點已改回營地或預設位置', '#7ee0c0'); return;
  }
  if (t.dataset.npcCh) { npcChapter = t.dataset.npcCh; npcPick = null; npcSpawnPick = null; playerSpawnPick = false; renderNpcPanel(); draw(); return; }
  if (t.id === 'npcAddCh') {
    const keys = npcChapterKeys(), last = keys[keys.length - 1], next = String(Number(last) + 1);
    npcData.chapters[next] = clone(npcData.chapters[last] || {});   // 複製最後一章
    npcChapter = next; npcPick = null; npcSpawnPick = null; playerSpawnPick = false; saveNpcData(); renderNpcPanel(); draw();
    setStatus('已新增第 ' + next + ' 章（複製第 ' + last + ' 章的名單），改有變動的人就好', '#7ee0c0');
    return;
  }
  if (t.id === 'npcDelCh') {
    if (!confirm('確定刪除第 ' + npcChapter + ' 章的名單？')) return;
    delete npcData.chapters[npcChapter]; npcChapter = npcChapterKeys()[0]; npcPick = null; npcSpawnPick = null; playerSpawnPick = false; saveNpcData(); renderNpcPanel(); draw();
    return;
  }
  const id = t.dataset.npcBox || t.dataset.npcClear || t.dataset.npcGo || t.dataset.npcSpawn || t.dataset.npcSpawnRandom;
  if (!id) return;
  const loc = npcTable()[id]; if (!loc) return;
  const m = maps.find(x => x.name === loc.map);
  if (t.dataset.npcClear) { delete loc.rects; saveNpcData(); renderNpcPanel(); draw(); setStatus(npcPerson(id).name + '：整張地圖閒逛', '#7ee0c0'); return; }
  if (t.dataset.npcSpawnRandom) { delete loc.spawn; npcSpawnPick = null; saveNpcData(); renderNpcPanel(); draw(); setStatus(npcPerson(id).name + '：出生位置改為隨機', '#7ee0c0'); return; }
  if (m && m.id !== curId) switchTo(m.id);
  if (t.dataset.npcBox) {
    playerSpawnPick = false;
    npcSpawnPick = null;
    npcPick = npcPick === id ? null : id;
    if (npcPick) setStatus('設定' + npcPerson(id).name + '的走動範圍：拖曳＝框一塊、點一格＝加 1 格、從範圍裡面點／拖＝刪掉那些格子（框好的會併成一塊；再按「走動範圍設定中」或 Esc 結束）', '#8fd3ff');
    else setStatus('已結束走動範圍設定', '#9aa4b2');
  }
  if (t.dataset.npcSpawn) {
    playerSpawnPick = false;
    npcPick = null;
    npcSpawnPick = npcSpawnPick === id ? null : id;
    if (npcSpawnPick) setStatus('點選地圖上的一格，設定' + npcPerson(id).name + '的出生地（按 Esc 取消）', '#8fd3ff');
  }
  renderNpcPanel(); draw();
});
npcPanelEl.addEventListener('change', e => {
  const id = e.target.dataset.npcMap; if (!id) return;
  const table = npcTable(), v = e.target.value;
  if (!v) delete table[id];
  else if (!table[id] || table[id].map !== v) table[id] = { map: v };   // 換地圖：方框清掉（新地圖要重框）
  if (npcPick === id) npcPick = null;
  if (npcSpawnPick === id) npcSpawnPick = null;
  playerSpawnPick = false;
  saveNpcData(); renderNpcPanel(); draw();
  setStatus(npcPerson(id).name + (v ? '：第 ' + npcChapter + ' 章平時在「' + v + '」' : '：第 ' + npcChapter + ' 章不在基地'), '#7ee0c0');
});
npcPanelEl.addEventListener('mouseover', e => { const row = e.target.closest('[data-npc-row]'); const id = row ? row.dataset.npcRow : null; if (id !== npcFocus) { npcFocus = id; draw(); } });
npcPanelEl.addEventListener('mouseleave', () => { npcFocus = null; draw(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && (npcPick || npcSpawnPick || playerSpawnPick)) { npcPick = null; npcSpawnPick = null; playerSpawnPick = false; npcBoxDrag = null; renderNpcPanel(); draw(); setStatus('已取消位置設定', '#9aa4b2'); } });

// ---- 在地圖上拖方框（框範圍模式時，攔下編輯器原本的畫圖操作）----
cv.addEventListener('pointerdown', e => {
  if (playerSpawnPick) {
    e.stopImmediatePropagation(); e.preventDefault();
    const [c, r] = cellFromEvent(e), m = curMap(), key = c + ',' + r;
    if (!m.safe || !inGrid(c, r) || (m.solid || []).includes(key) || (m.breakable || []).includes(key)) {
      setStatus('這格不能當玩家出生地，請選可通行的空格', '#ff8f8f'); draw(); return;
    }
    pushUndo(); m.playerSpawn = [c, r]; playerSpawnPick = false; saveMaps(); renderNpcPanel(); draw();
    setStatus('玩家出生地設在「' + m.name + '」的 ' + c + ',' + r + ' 格', '#7ee0c0');
    return;
  }
  if (npcSpawnPick) {
    e.stopImmediatePropagation(); e.preventDefault();
    const [c, r] = cellFromEvent(e), m = curMap(), id = npcSpawnPick, loc = npcTable()[id];
    const key = c + ',' + r;
    if (!inGrid(c, r) || (m.solid || []).includes(key) || (m.breakable || []).includes(key)) {
      setStatus('這格不能當出生地，請選可通行的空格', '#ff8f8f'); draw(); return;
    }
    if (loc) { loc.map = m.name; loc.spawn = [c, r]; }
    npcSpawnPick = null; saveNpcData(); renderNpcPanel(); draw();
    setStatus(npcPerson(id).name + '：出生地設在「' + m.name + '」的 ' + c + ',' + r + ' 格', '#7ee0c0');
    return;
  }
  if (!npcPick) return;
  e.stopImmediatePropagation(); e.preventDefault();
  const [c, r] = cellFromEvent(e), loc = npcTable()[npcPick];
  const erase = !!loc && loc.map === curMap().name && npcCellSet(npcRects(loc)).has(c + ',' + r);   // 從範圍裡面開始＝刪格子
  npcBoxDrag = { c0: c, r0: r, c, r, erase }; cv.setPointerCapture(e.pointerId); draw();
}, true);
cv.addEventListener('pointermove', e => {
  if (!npcPick && !npcSpawnPick && !playerSpawnPick) return;
  e.stopImmediatePropagation();
  const [c, r] = cellFromEvent(e);
  hoverCell = inGrid(c, r) ? [c, r] : null;
  if (npcBoxDrag) { npcBoxDrag.c = c; npcBoxDrag.r = r; }
  draw();
}, true);
cv.addEventListener('pointerup', e => {
  if (!npcPick || !npcBoxDrag) return;
  e.stopImmediatePropagation();
  const m = curMap(), d = npcBoxDrag, loc = npcTable()[npcPick], name = npcPerson(npcPick).name;
  npcBoxDrag = null;
  if (!loc) { draw(); return; }
  const c0 = Math.max(0, Math.min(d.c0, d.c)), r0 = Math.max(0, Math.min(d.r0, d.r)), c1 = Math.min(m.cols - 1, Math.max(d.c0, d.c)), r1 = Math.min(m.rows - 1, Math.max(d.r0, d.r));
  if (d.erase) {   // 從範圍裡面開始點／拖：刪掉那些格子，剩下的重新併成最少的方框
    const cells = npcCellSet(npcRects(loc)); let gone = 0;
    for (let x = c0; x <= c1; x++) for (let y = r0; y <= r1; y++) if (cells.delete(x + ',' + y)) gone++;
    loc.rects = npcRectsFromCells(cells); if (!loc.rects.length) delete loc.rects;
    setStatus(name + '：走動範圍少了 ' + gone + ' 格' + (cells.size ? '（還有 ' + cells.size + ' 格）' : '，現在是整張地圖閒逛'), '#ffd24a');
  } else {
    if (loc.map !== m.name) delete loc.rects;   // 換到別張地圖框：舊地圖的範圍清掉
    const before = npcCellSet(loc.map === m.name ? npcRects(loc) : []).size;
    loc.map = m.name; loc.rects = npcMergeRects([...npcRects(loc), [c0, r0, c1, r1]]);   // 跟原本的併成一塊
    const total = npcCellSet(loc.rects).size;
    setStatus(name + '：走動範圍多了 ' + (total - before) + ' 格（共 ' + total + ' 格，已經併在一起）。可以繼續框；從範圍裡面點／拖＝刪掉；再按「走動範圍設定中」或 Esc 結束', '#7ee0c0');
  }
  saveNpcData(); renderNpcPanel(); draw();   // npcPick 不清掉：一直停在走動範圍設定模式
}, true);

// ---- 地圖上畫出 NPC 範圍（editor.js 的 draw 最後呼叫）----
function drawEditorOverlay(ctx, m) {
  if (!npcData) return;
  const table = npcTable(), here = npcPeople.filter(p => table[p.id] && table[p.id].map === m.name);
  ctx.save();
  if (Array.isArray(m.playerSpawn)) {
    const [c, r] = m.playerSpawn, x = OX + (c + .5) * CELL, y = OY + (r + .5) * CELL;
    ctx.globalAlpha = .95; ctx.fillStyle = '#10151c'; ctx.beginPath(); ctx.arc(x, y, 13, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('P', x, y);
    npcTag(ctx, { name: '玩家', color: '#ffffff' }, x + 13, y - 22, '出生');
  }
  if (npcShowAll || npcFocus || npcPick || npcSpawnPick) {
    const labels = new Map();   // 同一格開頭的名字往下排（兩個人的範圍從同一格開始時）
    for (const p of here) {
      const loc = table[p.id];
      const strong = npcFocus === p.id || npcPick === p.id;
      const rs = npcRects(loc), cells = npcCellSet(rs);
      if ((npcShowAll || strong) && cells.size) {
        ctx.globalAlpha = strong ? .22 : .1; ctx.fillStyle = p.color;
        for (const [a0, b0, a1, b1] of rs) ctx.fillRect(OX + a0 * CELL, OY + b0 * CELL, (a1 - a0 + 1) * CELL, (b1 - b0 + 1) * CELL);   // 方框不重疊（npcRectsFromCells）
        ctx.globalAlpha = 1; npcOutline(ctx, rs, cells, p.color, strong ? 4 : 2, strong ? [] : [8, 5]);
        for (const [c, r] of npcRegions(cells)) {   // 每一塊只標一次名字（最上面最左邊那格）
          const k = c + ',' + r, n = labels.get(k) || 0; labels.set(k, n + 1);
          npcTag(ctx, p, OX + c * CELL + 4, OY + r * CELL + 4 + n * 22, '');
        }
        if (npcPick === p.id && !npcBoxDrag && hoverCell && cells.has(hoverCell[0] + ',' + hoverCell[1])) {   // 滑到範圍裡的格子：點一下會刪掉這格
          const x = OX + hoverCell[0] * CELL, y = OY + hoverCell[1] * CELL;
          ctx.globalAlpha = .35; ctx.fillStyle = '#ff4d4d'; ctx.fillRect(x, y, CELL, CELL);
          ctx.globalAlpha = 1; ctx.strokeStyle = '#ff4d4d'; ctx.lineWidth = 2; ctx.strokeRect(x + 1, y + 1, CELL - 2, CELL - 2);
          npcTag(ctx, { name: '點一下刪除這格', color: '#ff4d4d' }, x + CELL + 4, y + 4, '');
        }
      }
      const spawn = loc.spawn;
      if (Array.isArray(spawn) && (npcShowAll || npcFocus === p.id || npcPick === p.id || npcSpawnPick === p.id)) {
        const x = OX + (spawn[0] + .5) * CELL, y = OY + (spawn[1] + .5) * CELL;
        ctx.globalAlpha = .95; ctx.fillStyle = '#10151c'; ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = p.color; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = p.color; ctx.beginPath(); ctx.moveTo(x, y - 6); ctx.lineTo(x + 6, y); ctx.lineTo(x, y + 6); ctx.lineTo(x - 6, y); ctx.closePath(); ctx.fill();
        npcTag(ctx, p, x + 12, y - 22, '出生');
      }
    }
    // 沒框範圍的人：左上角列出「整張地圖閒逛」
    const free = here.filter(p => !npcRects(table[p.id]).length);
    free.forEach((p, i) => npcTag(ctx, p, OX + 6, OY + 6 + i * 22, '整張閒逛'));
  }
  if (npcPick && npcBoxDrag) {   // 正在拖的方框（紅色＝刪格子）
    const d = npcBoxDrag, c0 = Math.min(d.c0, d.c), r0 = Math.min(d.r0, d.r), c1 = Math.max(d.c0, d.c), r1 = Math.max(d.r0, d.r);
    const p = npcPerson(npcPick);
    ctx.globalAlpha = d.erase ? .35 : .25; ctx.fillStyle = d.erase ? '#ff4d4d' : p.color; ctx.fillRect(OX + c0 * CELL, OY + r0 * CELL, (c1 - c0 + 1) * CELL, (r1 - r0 + 1) * CELL);
    ctx.globalAlpha = 1; ctx.strokeStyle = d.erase ? '#ff4d4d' : '#ffffff'; ctx.lineWidth = 3; ctx.setLineDash([6, 4]);
    ctx.strokeRect(OX + c0 * CELL, OY + r0 * CELL, (c1 - c0 + 1) * CELL, (r1 - r0 + 1) * CELL); ctx.setLineDash([]);
    if (d.erase) npcTag(ctx, { name: '刪掉這些格子', color: '#ff4d4d' }, OX + c0 * CELL + 4, OY + r0 * CELL + 4, '');
  } else if ((npcPick || npcSpawnPick || playerSpawnPick) && hoverCell) {
    ctx.globalAlpha = .6; ctx.strokeStyle = playerSpawnPick ? '#ffffff' : npcPerson(npcPick || npcSpawnPick).color; ctx.lineWidth = 2;
    ctx.strokeRect(OX + hoverCell[0] * CELL, OY + hoverCell[1] * CELL, CELL, CELL);
  }
  ctx.restore();
}
// 整塊範圍的外框：只畫外圍的邊（相鄰格子之間不畫線），同一條直線上的邊連成一段；線畫在範圍裡面（用範圍當遮罩）
function npcOutline(ctx, rs, cells, color, width, dash) {
  const has = (c, r) => cells.has(c + ',' + r), h = new Map(), v = new Map();
  const add = (map, line, at) => { if (!map.has(line)) map.set(line, []); map.get(line).push(at); };
  for (const k of cells) {
    const [c, r] = k.split(',').map(Number);
    if (!has(c, r - 1)) add(h, r, c); if (!has(c, r + 1)) add(h, r + 1, c);   // 上、下邊：y＝格線 r／r+1，從 c 到 c+1
    if (!has(c - 1, r)) add(v, c, r); if (!has(c + 1, r)) add(v, c + 1, r);   // 左、右邊：x＝格線 c／c+1，從 r 到 r+1
  }
  ctx.save();
  ctx.beginPath(); for (const [a0, b0, a1, b1] of rs) ctx.rect(OX + a0 * CELL, OY + b0 * CELL, (a1 - a0 + 1) * CELL, (b1 - b0 + 1) * CELL); ctx.clip();
  ctx.beginPath();
  const runs = (map, seg) => { for (const [line, list] of map) { list.sort((a, b) => a - b); let s = list[0], e = s + 1;
    for (let i = 1; i <= list.length; i++) { if (i < list.length && list[i] === e) { e++; continue; } seg(line, s, e); if (i < list.length) { s = list[i]; e = s + 1; } } } };
  runs(h, (y, a, b) => { ctx.moveTo(OX + a * CELL, OY + y * CELL); ctx.lineTo(OX + b * CELL, OY + y * CELL); });
  runs(v, (x, a, b) => { ctx.moveTo(OX + x * CELL, OY + a * CELL); ctx.lineTo(OX + x * CELL, OY + b * CELL); });
  ctx.strokeStyle = color; ctx.lineWidth = width * 2; ctx.setLineDash(dash); ctx.stroke();   // 一半被遮罩切掉，看起來就是 width 粗、畫在範圍裡面
  ctx.restore();
}
function npcTag(ctx, p, x, y, extra) {
  const text = p.name + (extra ? '・' + extra : '');
  ctx.font = 'bold 13px "Microsoft JhengHei", sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  const w = ctx.measureText(text).width + 22;
  ctx.globalAlpha = .88; ctx.fillStyle = '#0d1218'; ctx.fillRect(x, y, w, 19);
  ctx.globalAlpha = 1; ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(x + 9, y + 9.5, 5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#f2f6fa'; ctx.fillText(text, x + 17, y + 3);
}

// ---- 地圖改名：名單裡的地圖名稱一起改（editor.js 呼叫）----
function onEditorMapRenamed(oldName, newName) {
  let n = 0;
  for (const table of Object.values(npcData.chapters)) for (const loc of Object.values(table)) if (loc.map === oldName) { loc.map = newName; n++; }
  if (n) { saveNpcData(); setStatus('地圖改名：NPC 名單裡的「' + oldName + '」也改成「' + newName + '」（' + n + ' 筆）', '#7ee0c0'); }
  renderNpcPanel();
}
// 切換地圖時更新面板（哪些人在這張）
mapSelect.addEventListener('change', () => { npcPick = null; npcSpawnPick = null; playerSpawnPick = false; renderNpcPanel(); });

// ---- 匯出 ----
function npcExportText() {
  const areas = typeof NPC_AREAS !== 'undefined' ? NPC_AREAS : {};
  const chapters = {};
  for (const k of npcChapterKeys()) {
    chapters[k] = {};
    for (const p of npcPeople) {
      const loc = npcData.chapters[k][p.id]; if (!loc) continue;
      const entry = { map: loc.map };
      if (Array.isArray(loc.spawn)) entry.spawn = loc.spawn;
      const rs = npcRects(loc);
      if (rs.length === 1) entry.rect = rs[0]; else if (rs.length > 1) entry.rects = rs;   // 一個方框＝rect；好幾個＝rects
      chapters[k][p.id] = entry;
    }
  }
  const body = JSON.stringify(chapters, null, 2).replace(/\[\n\s+(\d+),\n\s+(\d+),\n\s+(\d+),\n\s+(\d+)\n\s+\]/g, '[$1, $2, $3, $4]');   // 方框寫成一行（rects 裡的每個方框也是）
  return `/* ===== 基地（安全區）裡每個人平時在哪裡（由「🏠 基地編輯器」匯出，整段覆蓋即可）=====
   基地的每個房間是不同張地圖。這裡決定「誰平時待在哪張地圖、哪一區」，可以依劇情章節不同。
   建議用基地編輯器調整：選章節 → 幫每個人選地圖 → 可指定出生格（spawn＝[格 c, 格 r]），並在地圖上拖活動方框（rect＝[左上格 c, 左上格 r, 右下格 c, 右下格 r]）。
   ・只有寫在這裡的人會出現在基地裡；沒寫的人就不在基地（例如出任務去了）。
   ・出勤隊伍在基地裡不會跟著溫特，大家都待在自己的位置。（戰鬥地圖照舊只出現出勤隊伍。）
   ・每個人：map＝地圖名稱；spawn＝指定出生格；rect＝活動範圍方框（平時在這裡面走動）；rects＝好幾個方框（合起來是走動範圍）；
     area＝舊寫法（下面 NPC_AREAS 的名稱，用素材圍出範圍）。沒有 spawn＝隨機出生；rect、rects、area 都沒寫＝整張地圖閒逛。
   ・章節：NPC_LOCATIONS 用章節數字當 key。目前章節（data/balance.js 的 CHAPTER）會用「≤ 目前章節」的最大那一章；
     基地編輯器新增章節時會自動複製上一章的整份名單，再改有變動的人。
   讀取名單的程式在 js/sentry.js（npcLocation）。
*/

// 舊寫法用的活動範圍（用素材圍出來）；基地編輯器會把它們換成方框
const NPC_AREAS = ${JSON.stringify(areas, null, 2)};

const NPC_LOCATIONS = ${body};
`;
}
document.getElementById('npcGenExport').addEventListener('click', () => { document.getElementById('npcExportOut').value = npcExportText(); setStatus('已產生 NPC 名單，請「複製」或「下載」後覆蓋 data/npc-locations.js', '#8fd3ff'); });
document.getElementById('npcCopyExport').addEventListener('click', () => {
  const ta = document.getElementById('npcExportOut'); ta.value = npcExportText();
  ta.select(); ta.setSelectionRange(0, 999999);
  try { document.execCommand('copy'); setStatus('已複製 NPC 名單 ✓', '#7ee0c0'); } catch (_) { setStatus('複製失敗，請手動選取文字複製', '#ff8f8f'); }
});
document.getElementById('npcDownloadExport').addEventListener('click', () => {
  const blob = new Blob([npcExportText()], { type: 'text/javascript' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'npc-locations.js'; a.click(); URL.revokeObjectURL(a.href);
  setStatus('已下載 npc-locations.js，請把它覆蓋到 data/npc-locations.js', '#7ee0c0');
});
document.getElementById('npcResetFile').addEventListener('click', () => {
  if (!confirm('確定丟棄瀏覽器暫存，改用 data/npc-locations.js 檔案的內容？未匯出的 NPC 變更會不見。')) return;
  localStorage.removeItem(NPC_LOC_STORE); npcPick = null; loadNpcData(); renderNpcPanel(); draw();
  setStatus('NPC 名單已重設為檔案內容', '#ffd24a');
});

// 「💾 存到專案」一起寫入 NPC 名單（js/base-editor-save.js）
if (typeof EDITOR_SAVE_FILES !== 'undefined') EDITOR_SAVE_FILES.push({ path: 'data/npc-locations.js', label: 'NPC 名單', text: () => npcExportText() });

// ---- 啟動 ----
loadNpcData();
renderNpcPanel();
draw();
