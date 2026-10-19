/* ===== 基地編輯器：玩家與 NPC 出生位置、NPC 活動範圍 =====
   基地編輯器.html 的右邊面板。每一章一份完整名單：NPC 平時在哪張基地地圖、從哪格出生、在哪個方框裡走動。
   ・選章節 → 每個人選地圖（「不在基地」＝這章不出現）→ 可設出生格、拖出活動方框。沒框＝整張地圖閒逛。
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
  .map((c, i) => ({ id: c.id, name: c.name, kind: c.kind, color: NPC_COLORS[i % NPC_COLORS.length] }));
const npcPerson = id => npcPeople.find(p => p.id === id);

let npcData = null;        // { chapters: { 1: { id: { map, spawn?, rect? } } } }
let npcChapter = '1';      // 目前編輯的章節
let npcPick = null;        // 正在框範圍的人（id）
let npcSpawnPick = null;   // 正在設定出生格的人（id）
let playerSpawnPick = false; // 正在設定玩家出生格
let npcBoxDrag = null;     // 拖曳中的方框 { c0, r0, c, r }
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
  try { d = JSON.parse(localStorage.getItem(NPC_LOC_STORE) || 'null'); } catch (_) {}
  if (!d || !d.chapters) d = { chapters: clone(typeof NPC_LOCATIONS !== 'undefined' ? NPC_LOCATIONS : { 1: {} }) };
  for (const table of Object.values(d.chapters)) for (const [id, loc] of Object.entries(table)) {
    if (!loc || !loc.map) { delete table[id]; continue; }
    if (loc.area && !loc.rect) { const rect = npcAreaToRect(loc.map, loc.area); if (rect) loc.rect = rect; }
    delete loc.area;
  }
  if (!Object.keys(d.chapters).length) d.chapters = { 1: {} };
  npcData = d;
  if (!npcData.chapters[npcChapter]) npcChapter = npcChapterKeys()[0];
}
function saveNpcData() { try { localStorage.setItem(NPC_LOC_STORE, JSON.stringify(npcData)); } catch (_) {} }
const npcChapterKeys = () => Object.keys(npcData.chapters).map(Number).sort((a, b) => a - b).map(String);
const npcTable = () => npcData.chapters[npcChapter] || (npcData.chapters[npcChapter] = {});
const baseMapNames = () => maps.filter(m => m.safe).map(m => m.name);

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
    const range = !loc ? '' : loc.rect ? '方框 ' + (loc.rect[2] - loc.rect[0] + 1) + '×' + (loc.rect[3] - loc.rect[1] + 1) + ' 格' : '整張地圖閒逛';
    const spawn = loc && Array.isArray(loc.spawn) ? '出生格 ' + loc.spawn[0] + ',' + loc.spawn[1] : '隨機出生';
    const picking = npcPick === p.id || npcSpawnPick === p.id;
    return head + '<div class="npc-row' + (picking ? ' picking' : '') + (here ? ' here' : '') + '" data-npc-row="' + p.id + '">' +
      '<i style="background:' + p.color + '"></i><b>' + p.name + '</b>' +
      '<select data-npc-map="' + p.id + '">' + opts(loc && loc.map) + '</select>' +
      (loc ? '<span class="npc-range">' + spawn + '・' + range + '</span>' +
        '<button type="button" class="btn small" data-npc-spawn="' + p.id + '" title="切到這張地圖，再點一格指定出生地">' + (npcSpawnPick === p.id ? '點選出生格…' : '⌖ 出生點') + '</button>' +
        (loc.spawn ? '<button type="button" class="btn small" data-npc-spawn-random="' + p.id + '" title="清除指定格，改回隨機出生">隨機</button>' : '') +
        '<button type="button" class="btn small" data-npc-box="' + p.id + '" title="切到這張地圖，在地圖上拖一個方框">' + (npcPick === p.id ? '拖曳中…' : '▭ 框範圍') + '</button>' +
        (loc.rect ? '<button type="button" class="btn small" data-npc-clear="' + p.id + '" title="不限範圍，整張地圖閒逛">整張</button>' : '') +
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
  if (t.dataset.npcClear) { delete loc.rect; saveNpcData(); renderNpcPanel(); draw(); setStatus(npcPerson(id).name + '：整張地圖閒逛', '#7ee0c0'); return; }
  if (t.dataset.npcSpawnRandom) { delete loc.spawn; npcSpawnPick = null; saveNpcData(); renderNpcPanel(); draw(); setStatus(npcPerson(id).name + '：出生位置改為隨機', '#7ee0c0'); return; }
  if (m && m.id !== curId) switchTo(m.id);
  if (t.dataset.npcBox) {
    playerSpawnPick = false;
    npcSpawnPick = null;
    npcPick = npcPick === id ? null : id;
    if (npcPick) setStatus('在地圖上拖一個方框：' + npcPerson(id).name + ' 平時會在這個範圍裡走動（按 Esc 取消）', '#8fd3ff');
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
  const [c, r] = cellFromEvent(e);
  npcBoxDrag = { c0: c, r0: r, c, r }; cv.setPointerCapture(e.pointerId); draw();
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
  const m = curMap(), d = npcBoxDrag, loc = npcTable()[npcPick];
  const c0 = Math.max(0, Math.min(d.c0, d.c)), r0 = Math.max(0, Math.min(d.r0, d.r)), c1 = Math.min(m.cols - 1, Math.max(d.c0, d.c)), r1 = Math.min(m.rows - 1, Math.max(d.r0, d.r));
  if (loc) { loc.map = m.name; loc.rect = [c0, r0, c1, r1]; }
  setStatus(npcPerson(npcPick).name + '：平時在「' + m.name + '」這個 ' + (c1 - c0 + 1) + '×' + (r1 - r0 + 1) + ' 格的範圍裡走動', '#7ee0c0');
  npcBoxDrag = null; npcPick = null;
  saveNpcData(); renderNpcPanel(); draw();
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
    const labels = new Map();   // 同一個方框的名字往下排
    for (const p of here) {
      const loc = table[p.id];
      const rect = loc.rect;
      const strong = npcFocus === p.id || npcPick === p.id;
      if (rect && (npcShowAll || strong)) {
        const x = OX + rect[0] * CELL, y = OY + rect[1] * CELL, w = (rect[2] - rect[0] + 1) * CELL, h = (rect[3] - rect[1] + 1) * CELL;
        ctx.globalAlpha = strong ? .22 : .1; ctx.fillStyle = p.color; ctx.fillRect(x, y, w, h);
        ctx.globalAlpha = 1; ctx.strokeStyle = p.color; ctx.lineWidth = strong ? 4 : 2; ctx.setLineDash(strong ? [] : [8, 5]);
        ctx.strokeRect(x + 1, y + 1, w - 2, h - 2); ctx.setLineDash([]);
        const k = rect.join(','), n = labels.get(k) || 0; labels.set(k, n + 1);
        npcTag(ctx, p, x + 4, y + 4 + n * 22);
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
    const free = here.filter(p => !table[p.id].rect);
    free.forEach((p, i) => npcTag(ctx, p, OX + 6, OY + 6 + i * 22, '整張閒逛'));
  }
  if (npcPick && npcBoxDrag) {   // 正在拖的方框
    const d = npcBoxDrag, c0 = Math.min(d.c0, d.c), r0 = Math.min(d.r0, d.r), c1 = Math.max(d.c0, d.c), r1 = Math.max(d.r0, d.r);
    const p = npcPerson(npcPick);
    ctx.globalAlpha = .25; ctx.fillStyle = p.color; ctx.fillRect(OX + c0 * CELL, OY + r0 * CELL, (c1 - c0 + 1) * CELL, (r1 - r0 + 1) * CELL);
    ctx.globalAlpha = 1; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3; ctx.setLineDash([6, 4]);
    ctx.strokeRect(OX + c0 * CELL, OY + r0 * CELL, (c1 - c0 + 1) * CELL, (r1 - r0 + 1) * CELL); ctx.setLineDash([]);
  } else if ((npcPick || npcSpawnPick || playerSpawnPick) && hoverCell) {
    ctx.globalAlpha = .6; ctx.strokeStyle = playerSpawnPick ? '#ffffff' : npcPerson(npcPick || npcSpawnPick).color; ctx.lineWidth = 2;
    ctx.strokeRect(OX + hoverCell[0] * CELL, OY + hoverCell[1] * CELL, CELL, CELL);
  }
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
      if (Array.isArray(loc.rect)) entry.rect = loc.rect;
      chapters[k][p.id] = entry;
    }
  }
  const body = JSON.stringify(chapters, null, 2).replace(/\[\n\s+(\d+),\n\s+(\d+),\n\s+(\d+),\n\s+(\d+)\n\s+\]/g, '[$1, $2, $3, $4]');
  return `/* ===== 基地（安全區）裡每個人平時在哪裡（由「🏠 基地編輯器」匯出，整段覆蓋即可）=====
   基地的每個房間是不同張地圖。這裡決定「誰平時待在哪張地圖、哪一區」，可以依劇情章節不同。
   建議用基地編輯器調整：選章節 → 幫每個人選地圖 → 可指定出生格（spawn＝[格 c, 格 r]），並在地圖上拖活動方框（rect＝[左上格 c, 左上格 r, 右下格 c, 右下格 r]）。
   ・只有寫在這裡的人會出現在基地裡；沒寫的人就不在基地（例如出任務去了）。
   ・出勤隊伍在基地裡不會跟著溫特，大家都待在自己的位置。（戰鬥地圖照舊只出現出勤隊伍。）
   ・每個人：map＝地圖名稱；spawn＝指定出生格；rect＝活動範圍方框；area＝舊寫法（下面 NPC_AREAS 的名稱，用素材圍出範圍）。
     沒有 spawn＝隨機出生；rect、area 都沒寫＝整張地圖閒逛。
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
