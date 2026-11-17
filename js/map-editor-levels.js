/* ===== 地圖編輯器：🏢 樓層功能（1 樓、2 樓）=====
   規則和資料格式寫在 js/map-levels.js（遊戲也讀同一份）。這裡只管編輯器的畫面和按鈕：
   ・🏢 樓層種類筆刷：把格子畫成「只有 2 樓／陸橋（上下都有）／樓層出入口／只有 1 樓」
   ・顯示：兩層／只看 1 樓／只看 2 樓（只影響編輯器畫面）
   ・🔍 樓層檢查：列出可疑的地方，點一下跳過去
   ・選物件時的「樓層」選單在 js/map-editor.js 的 refreshDeck2Control
*/
let levelView = 'all';      // 'all'＝兩層都畫、'1'＝只看 1 樓、'2'＝只看 2 樓
let levelKind = '2';        // 🏢 筆刷要畫成哪一種：'2' 只有 2 樓、'b' 陸橋、'r' 樓層出入口、'1' 只有 1 樓（擦掉）
let levelFocusKey = null;   // 🔍 檢查清單點到的那一格（畫黃框）
let levelCheckList = null;  // 上一次檢查的結果（檢查面板開著時）

// 這一次畫圖要用的樓層資料：同一次 draw 裡共用，畫完就丟掉（下次重算，地圖改過也會跟著變）
let levelCache = null;
function levelInfo(m) {
  if (levelCache && levelCache.m === m) return levelCache;
  const L = MapLevels.floor2Layers(m);
  levelCache = { m, L, deck: new Set(m.deck || []), ramps: new Set(m.ramps || []), only2: MapLevels.only2Cells(m, tileById) };
  levelCache.ctx = { L };
  // 平台邊緣那排牆的牆面（js/map-levels.js 的 wallFaceCells）：不能畫成 2 樓地面，畫了遊戲也會擋住
  let faceSet = null;
  Object.defineProperty(levelCache, 'face', { get: () => faceSet || (faceSet = MapLevels.wallFaceCells(m, tileById)) });
  levelCache.add = new Set(m.deckAdd || []); levelCache.del = new Set(m.deckDel || []);   // 2 樓地面自動模式的筆刷例外
  queueMicrotask(() => { levelCache = null; });
  return levelCache;
}
// 這格是不是牆面（不能當 2 樓地面）
const levelIsWallFace = (m, key) => levelInfo(m).face.has(key);
const WALL_FACE_TIP = '這格是 2 樓平台邊緣的牆面，不能畫成 2 樓地面（人會站到牆面上、牆和地板融在一起）。真的要讓 2 樓的人走到這裡，請把那張牆往下移，或把它的「🏢 樓層」改掉';
const stampLevelOf = s => { const m = curMap(); const info = levelInfo(m); return MapLevels.stampLevel(s, m, tileById, info.ctx); };

// ---- 只看 1 樓／2 樓（js/map-editor.js 的 draw 呼叫）----
function levelLayerShown(l) {
  if (levelView === 'all') return true;
  const on2 = levelInfo(curMap()).L.all.has(l.id);
  return levelView === '2' ? on2 : !on2;
}
function levelStampShown(s) {
  if (levelView === 'all') return true;
  const lv = stampLevelOf(s);
  return lv === 'span' || (levelView === '2' ? lv === 2 : lv === 1);
}
const levelOverlayOn = () => !!levelFocusKey || levelView !== 'all';

// ---- 格子上的顏色：只有 2 樓（藍）、陸橋（青色斜線）、樓層出入口（橘）----
function drawLevelCell(x, y, key) {
  const info = levelInfo(curMap()), kind = MapLevels.cellKind(key, info.deck, info.ramps, info.only2);
  if (kind !== '1') {
    const st = { '2': ['rgba(70,150,255,.28)', 'rgba(140,200,255,.85)', ''], b: ['rgba(40,210,210,.22)', 'rgba(120,255,240,.85)', '🌉'], r: ['rgba(255,160,40,.32)', 'rgba(255,200,120,.9)', '🛗'] }[kind];
    ctx.fillStyle = st[0]; ctx.fillRect(x, y, CELL, CELL);
    if (kind === 'b') {   // 陸橋：斜線，一眼分得出「底下還有 1 樓」
      ctx.save(); ctx.beginPath(); ctx.rect(x, y, CELL, CELL); ctx.clip(); ctx.strokeStyle = 'rgba(120,255,240,.45)'; ctx.lineWidth = 2;
      for (let d = -CELL; d < CELL; d += 10) { ctx.beginPath(); ctx.moveTo(x + d, y + CELL); ctx.lineTo(x + d + CELL, y); ctx.stroke(); }
      ctx.restore();
    }
    ctx.strokeStyle = st[1]; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]); ctx.strokeRect(x + 2.5, y + 2.5, CELL - 5, CELL - 5); ctx.setLineDash([]);
    if (st[2]) { ctx.globalAlpha = .8; ctx.font = '14px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff'; ctx.fillText(st[2], x + CELL / 2, y + CELL / 2); ctx.textBaseline = 'alphabetic'; ctx.globalAlpha = 1; }
  }
  // 2 樓地面自動模式的筆刷例外：＋＝自動算沒有、筆刷加的；－＝自動算有、筆刷拿掉的（js/map-levels.js 的 deckAdd／deckDel）
  if (info.add.has(key) || info.del.has(key)) {
    const add = info.add.has(key);
    ctx.save(); ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(x + 1, y + 1, 13, 14);
    ctx.fillStyle = add ? '#7dffa0' : '#ff8a8a'; ctx.fillText(add ? '＋' : '－', x + 1, y + 1); ctx.restore();
  }
  if (key === levelFocusKey) { ctx.save(); ctx.strokeStyle = '#ffe14d'; ctx.lineWidth = 3; ctx.strokeRect(x + 1.5, y + 1.5, CELL - 3, CELL - 3); ctx.restore(); }
}
function levelCountText(m) {
  const info = levelInfo(m); let n2 = 0, nb = 0;
  for (const k of info.deck) { if (info.ramps.has(k)) continue; if (info.only2.has(k)) n2++; else nb++; }
  return '🏢 只有2樓 ' + n2 + ' 格／🌉 陸橋 ' + nb + ' 格／🛗 出入口 ' + info.ramps.size + ' 格／🚧 2樓碰撞 ' + (m.solid2 || []).length + ' 格'
    + (MapLevels.isAutoDeck(m) ? '／2樓地面自動（筆刷例外 ＋' + info.add.size + '、－' + info.del.size + '）' : '');
}

// ---- 🏢 樓層種類筆刷（js/map-editor.js 的 paintCell 呼叫）：回傳 false＝這次不畫 ----
function paintLevelCell(m, key, isDown) {
  const list = f => m[f] || (m[f] = []), add = (f, k) => { const a = list(f); if (!a.includes(k)) a.push(k); }, del = (f, k) => { if (m[f]) removeFrom(m[f], k); };
  const k = levelKind;
  if ((k === '2' || k === 'b') && levelIsWallFace(m, key)) { setStatus(WALL_FACE_TIP, '#ff8f8f'); return false; }   // 牆面不能畫成 2 樓地面
  levelCache = null;   // 地圖改了：樓層資料要重算
  if (k === '1') { del('deck', key); del('ramps', key); del('only2', key); MapLevels.noteDeckEdit(m, key, false); }
  else if (k === '2') { add('deck', key); add('only2', key); del('ramps', key); MapLevels.noteDeckEdit(m, key, true); }
  else if (k === 'b') { add('deck', key); del('only2', key); del('ramps', key); MapLevels.noteDeckEdit(m, key, true); }   // noteDeckEdit：2 樓地面自動模式時記成筆刷例外
  else if (k === 'r') { add('ramps', key); del('only2', key); }
  for (const f of ['deck', 'ramps']) if (m[f] && !m[f].length) delete m[f];
  return true;
}

// ---- 🔍 樓層檢查面板 ----
function runLevelCheck() {
  const m = curMap();
  levelCheckList = MapLevels.check(m, tileById);
  let panel = document.getElementById('levelCheckPanel');
  if (!panel) {
    panel = document.createElement('div'); panel.id = 'levelCheckPanel'; panel.className = 'level-check-panel';
    document.body.appendChild(panel);
  }
  const warn = levelCheckList.filter(i => i.kind === 'warn').length;
  panel.innerHTML = '';
  const head = document.createElement('div'); head.className = 'level-check-head';
  head.innerHTML = '<b>🔍 樓層檢查</b><span>' + (levelCheckList.length ? warn + ' 個問題、' + (levelCheckList.length - warn) + ' 個提醒' : '沒有發現問題') + '</span>';
  const again = document.createElement('button'); again.className = 'btn'; again.textContent = '重新檢查'; again.onclick = runLevelCheck;
  const close = document.createElement('button'); close.className = 'btn'; close.textContent = '✕'; close.title = '關掉';
  close.onclick = () => { panel.remove(); levelFocusKey = null; levelCheckList = null; draw(); };
  head.append(again, close); panel.appendChild(head);
  const ul = document.createElement('div'); ul.className = 'level-check-list';
  for (const it of levelCheckList) {
    const row = document.createElement('button'); row.type = 'button'; row.className = 'level-check-item ' + it.kind;
    row.textContent = (it.kind === 'warn' ? '⚠️ ' : 'ℹ️ ') + (it.c != null ? '(' + it.c + ',' + it.r + ') ' : '') + it.text;
    if (it.c != null) row.onclick = () => levelJumpTo(it.c, it.r);
    else row.disabled = true;
    ul.appendChild(row);
  }
  panel.appendChild(ul);
  setStatus('樓層檢查：' + (levelCheckList.length ? warn + ' 個問題、' + (levelCheckList.length - warn) + ' 個提醒（點清單跳過去）' : '沒有發現問題'), warn ? '#ffd479' : '#7ee0c0');
}
// 捲到那一格、畫黃框
function levelJumpTo(c, r) {
  levelFocusKey = c + ',' + r;
  const wrap = document.getElementById('wrap');
  if (wrap) {
    const wx = OX + (c + .5) * CELL, wy = OY + (r + .5) * CELL;
    wrap.scrollLeft = wx * editorZoom + cv.offsetLeft - wrap.clientWidth / 2;
    wrap.scrollTop = wy * editorZoom + cv.offsetTop - wrap.clientHeight / 2;
  }
  draw();
}

// ---- 按鈕 ----
(() => {
  const kindSel = document.getElementById('levelKind');
  if (kindSel) kindSel.addEventListener('change', () => {
    levelKind = kindSel.value;
    const btn = document.querySelector('.tool[data-mode="level"]'); if (btn && brush.mode !== 'level') btn.click();
    setStatus('🏢 樓層種類筆刷：畫成「' + kindSel.options[kindSel.selectedIndex].text + '」（拖曳畫一片）', '#8fc8ff');
  });
  const viewSel = document.getElementById('levelView');
  if (viewSel) viewSel.addEventListener('change', () => { levelView = viewSel.value; draw(); });
  document.getElementById('levelCheck')?.addEventListener('click', runLevelCheck);
})();
