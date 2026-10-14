// ============================================================
//  任務流程（作戰桌）
//  ・打贏戰鬥地圖 →「返回應變中心」→ 亞許來報告下一個任務 → 到作戰桌選區域出擊。
//  ・區域、台詞、作戰桌位置都在 data/missions.js。進度存在瀏覽器（localStorage）。
// ============================================================
const MISSION_STORE = 'tudrc_missions_v1';
const missionState = { cleared: [], briefed: [] };   // 已控制的區域、亞許已經報告過的任務
try { const saved = JSON.parse(localStorage.getItem(MISSION_STORE) || '{}'); for (const k of ['cleared', 'briefed']) if (Array.isArray(saved[k])) missionState[k] = saved[k].filter(id => typeof id === 'string'); } catch (_) {}
function saveMissions() { try { localStorage.setItem(MISSION_STORE, JSON.stringify(missionState)); } catch (_) {} }

const missionById = id => MISSIONS.find(m => m.id === id) || null;
// 地圖 id 不分大小寫（存過的地圖可能是 y1、資料裡寫 Y1）
const sameMapId = (a, b) => !!a && !!b && String(a).toLowerCase() === String(b).toLowerCase();
const mapIndexOf = id => mapList().findIndex(m => m && sameMapId(m.id, id));
const missionOfMap = mapId => MISSIONS.find(m => sameMapId(m.map, mapId)) || null;
const missionCleared = m => missionState.cleared.includes(m.id);
const missionOpen = m => m.after.every(id => missionState.cleared.includes(id));   // 前面的區域都控制了
function missionStatus(m) {
  if (missionCleared(m)) return 'cleared';
  if (!missionOpen(m)) return 'locked';
  return m.map ? 'available' : 'soon';   // soon＝輪到它了，但地圖還沒做好
}
// 下一個要打的任務（還沒控制、已開放的第一個）
const nextMission = () => MISSIONS.find(m => !missionCleared(m) && missionOpen(m)) || null;
// 亞許有沒有新任務要報告
const briefPending = () => { const m = nextMission(); return m && !missionState.briefed.includes(m.id) ? m : null; };
const brieferNpc = () => (G && G.npcs || []).find(n => n.id === MISSION_BASE.briefer) || null;
const onBaseMap = () => MAP_SAFE && MAP && sameMapId(MAP.id, MISSION_BASE.map);

// ---- 和亞許對話：有新任務就先報告任務（game.js 的 openDialogue 呼叫）----
function missionDialogueLines(actor) {
  const m = briefPending();
  if (!m || !actor || actor.id !== MISSION_BASE.briefer) return null;
  missionState.briefed.push(m.id); saveMissions();
  const lines = typeof dialogueLines === 'function' && dialogueLines(MISSION_BASE.briefer, 'brief_' + m.id);   // 對話編輯器裡的「報告任務」
  return lines && lines.length ? lines : ['部隊長，有新的任務了。詳細的內容，作戰桌上的地圖都有標出來喔。'];
}

// ---- 左上角「目前任務」（game.js 的 updateHUD 呼叫）----
function missionHudText() {
  if (MAP_SAFE) {
    const m = nextMission();
    if (!m) return '目前任務：Y 區已全部控制';
    if (briefPending()) return '目前任務：聽' + (CHARACTERS[MISSION_BASE.briefer]?.name || '通訊員') + '報告下一個任務';
    if (!m.map) return '目前任務：等待「' + m.name + '」的情報';
    return '目前任務：到作戰桌出擊｜' + m.name;
  }
  return null;
}

// ---- 作戰桌：靠近會出現提示，按 Space 打開（game.js、render.js 呼叫）----
// 地圖上的作戰終端（作戰指揮桌、監控大螢幕…，見 data/missions.js 的 terminals）
function missionTerminals() {
  if (!onBaseMap() || !MAP) return [];
  const defs = MISSION_BASE.terminals || [];
  const out = [];
  for (const s of MAP.stamps || []) {
    const def = defs.find(d => d.id === s.id); if (!def) continue;
    const t = mapTileById(s.id); if (!t) continue;
    const x0 = OX + s.c * CELL + (s.ox || 0), y0 = OY + s.r * CELL + (s.oy || 0), w = mapTileW(t) * CELL, h = mapTileH(t) * CELL;
    out.push({ stamp: s, label: def.label, primary: def === defs[0], x0, y0, x1: x0 + w, y1: y0 + h, x: x0 + w / 2, y: y0 + h - CELL / 2, top: y0 });
  }
  return out;
}
function missionTablePos() {
  const list = missionTerminals(), main = list.find(t => t.primary) || list[0];
  if (main) return { x: main.x, y: main.y, top: main.top, label: main.label };
  const t = MISSION_BASE.table, [x, y] = center(t.c, t.r);   // 地圖上沒擺作戰終端：用舊的固定位置
  return { x: x + CELL / 2, y, top: y - CELL * 1.6, label: '作戰桌' };
}
function missionTableNear() {
  if (!onBaseMap() || !G || !G.player) return null;
  const p = G.player, list = missionTerminals();
  if (list.length) {   // 離桌子／螢幕的「邊緣」多近：大型素材從哪一邊靠近都按得到
    let best = null, bestD = Infinity;
    for (const t of list) {
      const dx = Math.max(t.x0 - p.x, 0, p.x - t.x1), dy = Math.max(t.y0 - p.y, 0, p.y - t.y1), d = Math.hypot(dx, dy);
      if (d < bestD) { bestD = d; best = t; }
    }
    return bestD <= (MISSION_BASE.reach ?? 1.2) * CELL ? { x: best.x, y: best.y, top: best.top, label: best.label, dist: bestD } : null;
  }
  const t = missionTablePos(), d = Math.hypot(p.x - t.x, p.y - t.y);
  return d <= MISSION_BASE.table.radius * CELL ? { ...t, dist: d } : null;
}
// 作戰桌旁邊常有椅子和人：椅子或可以對話的人比作戰桌（的邊緣）更近時，讓給坐下／對話
//（game.js 的互動鍵、render.js 的提示都用這個，看到的提示就是按下去會做的事）
function missionTableUsable() {
  const t = missionTableNear(); if (!t) return null;
  const p = G.player;
  const a = typeof interactionNearPlayer === 'function' ? interactionNearPlayer() : null;
  if (a && Math.hypot(a.x - p.x, a.y - p.y) < t.dist) return null;
  const s = typeof seatNearPlayer === 'function' ? seatNearPlayer() : null;
  if (s && Math.hypot(Math.max(s.x0 - p.x, 0, p.x - (s.x0 + s.w)), Math.max(s.y0 - p.y, 0, p.y - (s.y0 + s.h))) < t.dist) return null;
  return t;
}
// 打完回來站的位置：作戰桌正前方（找最近一格能站的）；地圖上沒有作戰終端就用 MISSION_BASE.arrive
function missionArriveCell() {
  const main = missionTerminals().find(t => t.primary);
  if (!main) return [MISSION_BASE.arrive.c, MISSION_BASE.arrive.r];
  const t = mapTileById(main.stamp.id), c0 = main.stamp.c + Math.floor(mapTileW(t) / 2), r0 = main.stamp.r + mapTileH(t);
  for (const [dc, dr] of [[0, 0], [-1, 0], [1, 0], [0, 1], [-1, 1], [1, 1], [-2, 0], [2, 0], [0, 2]]) {
    const [x, y] = center(c0 + dc, r0 + dr);
    if (!playerBlocked(x, y)) return [c0 + dc, r0 + dr];
  }
  return [MISSION_BASE.arrive.c, MISSION_BASE.arrive.r];
}
// 亞許頭上的「！」、作戰桌上的地圖記號（render.js 呼叫）
function drawMissionMarks(ctx) {
  if (!onBaseMap()) return;
  const now = performance.now() / 1000, bob = Math.sin(now * 3) * 2.5;
  const mark = (x, y, text, bg) => {
    ctx.save();
    ctx.font = 'bold 15px "Microsoft JhengHei", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const w = Math.max(22, ctx.measureText(text).width + 12), h = 22;
    ctx.fillStyle = bg; ctx.strokeStyle = 'rgba(40,30,20,.85)'; ctx.lineWidth = 1.5;
    roundRect(x - w / 2, y - h / 2, w, h, 11); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#3b2304'; ctx.fillText(text, x, y + 1);
    ctx.restore();
  };
  const ash = brieferNpc();
  if (ash && briefPending()) mark(ash.x, ash.y - 70 + bob, '！', '#ffd479');
  else if (nextMission() && nextMission().map && !missionTableNear()) { const t = missionTablePos(); mark(t.x, t.top - 4 + bob, '作戰', '#ffd479'); }
}

// ---- 換地圖（黑幕淡入淡出，和走門一樣）----
function missionTravel(mapId, after) {
  if (mapTransitioning || mapIndexOf(mapId) < 0) { sfx('error'); return; }
  mapTransitioning = true;
  Object.keys(keys).forEach(key => { keys[key] = false; });
  hideOverlay();
  requestAnimationFrame(() => {
    mapTransition.classList.add('visible');
    setTimeout(() => setTimeout(() => {
      switchMap(mapIndexOf(mapId));
      begin(false);
      if (after) after();
      updateCamera(); draw();
      requestAnimationFrame(() => mapTransition.classList.remove('visible'));
      setTimeout(() => { mapTransitioning = false; }, PORTAL_FADE_MS);
    }, PORTAL_BLACK_MS), PORTAL_FADE_MS);
  });
}
// 回應變中心：站在作戰桌前；有新任務的話，亞許走過來報告
function returnToBase() {
  missionTravel(MISSION_BASE.map, () => {
    const [ac, ar] = missionArriveCell();
    const [x, y] = center(ac, ar);
    if (!playerBlocked(x, y)) { G.player.x = x; G.player.y = y; G.player.dir = 'back'; }
    const ash = brieferNpc();
    if (ash && briefPending()) {
      for (const [dc, dr] of [[1, 0], [-1, 0], [2, 0], [-2, 0], [0, 1]]) {
        const [ax, ay] = center(ac + dc, ar + dr);
        if (!playerBlocked(ax, ay)) { ash.x = ax; ash.y = ay; break; }
      }
      ash.target = null; ash.waitT = 99;   // 先站著別走開
      setTimeout(() => { if (onBaseMap() && !dialogueState) openDialogue(ash); }, PORTAL_BLACK_MS + PORTAL_FADE_MS + 300);
    }
  });
}
function sortieTo(m) {
  if (!m || !m.map) { sfx('error'); return; }
  if (!getTeam().length) { sfx('error'); systemNotice('還沒有編入出勤人員', true); return; }
  closeMissionBoard(true); sfx('button');
  missionTravel(m.map);
}

// ---- 打贏／打輸（game.js 的 winOverlay、loseOverlay、開始按鈕呼叫）----
function missionWinOverlay() {
  const m = missionOfMap(MAP && MAP.id); if (!m) return false;
  const first = !missionCleared(m);
  if (first) { missionState.cleared.push(m.id); saveMissions(); }
  const next = nextMission();
  showOverlay('✅ ' + m.name + ' 已控制',
    (first ? '所有異質核心與殘存異質體已清除！' : '再次清除了這一區的異質體！') + '異質結晶已儲存，可用於哨兵培養。' +
    (first && next ? '<br>新區域開放：<b>' + next.name + '</b>' : ''), '返回應變中心');
  return true;
}
function missionLoseExtra() {
  return MAP && !MAP_SAFE && mapIndexOf(MISSION_BASE.map) >= 0 ? '<br><button type="button" id="missionRetreat" class="mission-retreat">撤退回應變中心</button>' : '';
}
// 結算畫面的大按鈕：打贏了就回基地（回傳 true＝這裡處理掉了）
function onOverlayButton() {
  if (G && G.over && G.won && !MAP_SAFE && missionOfMap(MAP && MAP.id)) { sfx('button'); returnToBase(); return true; }
  return false;
}
document.getElementById('ov-text').addEventListener('click', e => { if (e.target.closest('#missionRetreat')) { sfx('button'); returnToBase(); } });

// ---- 作戰桌面板（外觀和商店、出勤配置同一套）----
let missionBoard = null, missionBoardOpen = false, missionSel = null;
const STATUS_TEXT = { cleared: '已控制', available: '可出擊', locked: '未開放', soon: '情報收集中' };
function ensureMissionBoard() {
  if (missionBoard) return;
  missionBoard = document.createElement('div');
  missionBoard.id = 'missionBoard'; missionBoard.className = 'hidden';
  missionBoard.addEventListener('click', e => {
    if (e.target === missionBoard || e.target.closest('.mission-close')) { closeMissionBoard(); return; }
    const node = e.target.closest('[data-mission]');
    if (node) { missionSel = node.dataset.mission; sfx('blip'); renderMissionBoard(); return; }
    if (e.target.closest('.mission-team')) { closeMissionBoard(true); openTeamPanel(); return; }
    if (e.target.closest('.mission-go')) sortieTo(missionById(missionSel));
  });
  document.getElementById('wrap').appendChild(missionBoard);
}
function renderMissionBoard() {
  const sel = missionById(missionSel) || nextMission() || MISSIONS[0], st = missionStatus(sel);
  missionSel = sel.id;
  const lines = MISSIONS.flatMap(m => m.after.map(id => { const a = missionById(id); return a ? '<line x1="' + a.x + '" y1="' + a.y + '" x2="' + m.x + '" y2="' + m.y + '" class="' + (missionCleared(a) ? 'done' : '') + '"/>' : ''; })).join('');
  const nodes = MISSIONS.map(m => {
    const s = missionStatus(m);
    return '<button type="button" class="mission-node ' + s + (m.boss ? ' boss' : '') + (m.id === sel.id ? ' sel' : '') + '" data-mission="' + m.id + '" style="left:' + m.x + '%;top:' + m.y + '%">' +
      '<i>' + (m.boss ? '⚠' : s === 'cleared' ? '✓' : s === 'available' ? '!' : '') + '</i><span>' + m.name + '</span></button>';
  }).join('');
  const team = getTeam(), cleared = MISSIONS.filter(missionCleared).length;
  const teamFaces = team.map(id => '<img src="' + memberPortraitPath(TYPES[id]) + '" alt="' + TYPES[id].name + '" title="' + TYPES[id].name + '">').join('');
  const canGo = !!sel.map && st !== 'locked';
  missionBoard.innerHTML =
    '<section class="mission-card" role="dialog" aria-modal="true" aria-label="作戰桌">' +
      '<header class="mission-head"><div class="mission-title"><small>作戰桌</small><div class="mission-title-line"><h2>Y 區作戰地圖</h2><p>選擇要前往的區域</p></div></div>' +
        '<span class="mission-progress"><small>已控制</small><b>' + cleared + ' / ' + MISSIONS.length + '</b></span>' +
        '<button type="button" class="mission-close" aria-label="關閉（Esc）">×</button></header>' +
      '<div class="mission-body">' +
        '<div class="mission-map"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">' + lines + '</svg>' + nodes + '</div>' +
        '<aside class="mission-detail">' +
          '<div class="mission-detail-main"><em class="mission-status ' + st + '">' + (sel.boss ? '⚠ BOSS 反應・' : '') + STATUS_TEXT[st] + '</em>' +
            '<h3>' + sel.name + '</h3><p>' + (st === 'locked' ? '先控制前面的區域，才能前往這裡。' : sel.desc) + '</p></div>' +
          '<div class="mission-team-row"><span>出勤人員 ' + team.length + ' 位</span><div class="mission-faces">' + (teamFaces || '<small>尚未編入</small>') + '</div>' +
            '<button type="button" class="mission-team">🧑‍🤝‍🧑 出勤配置</button></div>' +
          '<button type="button" class="mission-go"' + (canGo ? '' : ' disabled') + '>' + (canGo ? (st === 'cleared' ? '再次出擊' : '出擊') : STATUS_TEXT[st]) + '</button>' +
        '</aside>' +
      '</div>' +
    '</section>';
}
function openMissionBoard() {
  ensureMissionBoard(); missionSel = null;
  missionBoardOpen = true; Object.keys(keys).forEach(key => { keys[key] = false; });
  renderMissionBoard(); missionBoard.classList.remove('hidden'); sfx('menu');
}
function closeMissionBoard(silent = false) { if (!missionBoardOpen) return; missionBoardOpen = false; missionBoard.classList.add('hidden'); if (!silent) sfx('switch'); }
window.addEventListener('keydown', e => {
  if (!missionBoardOpen) return;
  if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); closeMissionBoard(); }
  else if (e.key === 'Enter' && !e.repeat) { e.preventDefault(); sortieTo(missionById(missionSel)); }
}, true);
