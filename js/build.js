/* ===== 建築系統 =====
   建築的放置判定（只看擋路格）、建築選單、放置動畫與塵埃。
   建築種類與數值在 data/objects.js（用「物件編輯器.html」調整）。
*/
window.addEventListener('keydown', e => { if (!e.repeat && e.key.toLowerCase() === 'r') rotateBuild(); });   // R＝建築轉向

// ---- 佈署物件查詢 ----
const buildAt = (c, r) => G.grid[c + ',' + r];
const barrierAt = (c, r) => { const o = G.grid[c + ',' + r]; return (o && o.kind === 'obstacle') ? o : null; };
function removeBarrier(o) {
  if (o.isBase && o.hp <= 0 && o.baseStamp) {
    if (!G.destroyedBases) G.destroyedBases = new Set();
    G.destroyedBases.add(o.baseStamp);
  }
  obstacleSolidCells(o).forEach(([dc, dr]) => {
    const key = (o.c + dc) + ',' + (o.r + dr);
    if (G.grid[key] === o) delete G.grid[key];
  });
  if (o.mapSource) G.mapDestroyed.add(o.mapSource);
  G.obstacles = G.obstacles.filter(x => x !== o);
  if (typeof onObstacleRemoved === 'function') onObstacleRemoved(o);   // 油桶／油箱：爆炸或漏油（js/oil-barrels.js）
}

// 沒有 solid 的舊資料仍以整張圖片範圍擋路。
function variantSolidCells(v) {
  if (Array.isArray(v.solid)) return v.solid;
  const cells = [];
  for (let dc = 0; dc < (v.w || 1); dc++) for (let dr = 0; dr < (v.h || 1); dr++) cells.push([dc, dr]);
  return cells;
}
function obstacleSolidCells(o) {
  if (Array.isArray(o.solid)) return o.solid;
  return variantSolidCells({ w: o.w || 1, h: o.h || 1 });
}

// ---- 建築放置：圖片須在地圖內，只有 solid 格會擋路／不可重疊 ----
// 黑暗規則：一般建築可以蓋在亮處、或光圈外 LIGHT.buildMargin 像素內（預設 1 格，邊緣有點暗也能蓋）；
// 「會發光的建築」（探照燈等）可蓋得更遠（光圈外 LIGHT.placeMargin 像素內），用來一步步推光。
const emitsLight = ob => !!(LIGHT.buildings && LIGHT.buildings[ob.id]);
const placeExtra = ob => emitsLight(ob) ? LIGHT.placeMargin : (LIGHT.buildMargin ?? 40);
// 放置時要檢查的格子：有擋路格就看擋路格；完全不擋路的（露營燈）就看整個佔地，不然會被放到牆上
function placeCheckCells(v) {
  const solid = variantSolidCells(v);
  if (solid.length) return solid;
  const cells = []; for (let dc = 0; dc < (v.w || 1); dc++) for (let dr = 0; dr < (v.h || 1); dr++) cells.push([dc, dr]);
  return cells;
}
function canPlaceObstacle(v, c, r, lightExtra = 0) {
  if (c < 0 || r < 0 || c + v.w > COLS || r + v.h > ROWS) return false;
  // 只有「擋路格(solid)」才要求空地／不壓牆／不疊其他建築的擋路格／夠亮；
  // 其餘格子只是圖片，可以疊在牆或其他建築的圖片前面。
  for (const [dc, dr] of placeCheckCells(v)) {
    const cc = c + dc, rr = r + dr;
    if (!inGrid(cc, rr)) return false;
    if (isWall(cc, rr) || isEntrance(cc, rr)) return false;
    if (G.grid[cc + ',' + rr]) return false;         // 既有建築的擋路格
    if (!cellNearLight(cc, rr, lightExtra)) return false;
    // （蓋在玩家／哨兵身上是允許的：放下去的瞬間，救援機制會自動把人推到旁邊空位）
  }
  return true;
}
// 建築離溫特夠不夠近（BUILD_RANGE 格內，量到建築佔地最近的地方）
function buildInRange(v, c, r) {
  const p = G && G.player; if (!p || typeof BUILD_RANGE === 'undefined') return true;
  const x0 = OX + c * CELL, y0 = OY + r * CELL, x1 = x0 + (v.w || 1) * CELL, y1 = y0 + (v.h || 1) * CELL;
  const dx = Math.max(x0 - p.x, 0, p.x - x1), dy = Math.max(y0 - p.y, 0, p.y - y1);
  return Math.hypot(dx, dy) <= BUILD_RANGE * CELL;
}
function footprintNearLight(v, c, r, extra) {
  // 亮度只看「擋路格」，跟放置判定／預覽框一致
  for (const [dc, dr] of placeCheckCells(v)) if (!cellNearLight(c + dc, r + dr, extra)) return false;
  return true;
}
// 放不了建築：建造位置跳字＋右上角系統提示（同一句 1.5 秒內不重複，連續點擊才不會洗版）
const buildFailNoticeAt = {};
function buildFail(msg, c, r, color = '#ff8f8f') {
  sfx('error');
  flash(msg, ...center(c, r), color);
  const now = performance.now();
  if (now - (buildFailNoticeAt[msg] || 0) > 1500) { buildFailNoticeAt[msg] = now; systemNotice(msg, true); }
  return false;
}
function placeObstacle(ob, c, r) {
  if(!ob||DISABLED_BUILD_IDS.has(ob.id))return false;
  const v = ob[buildOrient], extra = placeExtra(ob);
  if (!buildInRange(v, c, r)) return buildFail('太遠了', c, r);
  if (!footprintNearLight(v, c, r, extra)) return buildFail('太黑了', c, r, '#ffd24a');
  if (!canPlaceObstacle(v, c, r, extra)) return buildFail('不能放這裡', c, r);
  if (ob.trap && typeof landmineAt === 'function' && landmineAt(c, r)) return buildFail('已經有地雷了', c, r);
  // 不擋路的建築（鐵絲網、露營燈…）不會被擋路格擋住，要另外檢查：同一格不能疊同一種
  const passable = !ob.trap && ((typeof SLOW_BUILDINGS !== 'undefined' && SLOW_BUILDINGS[ob.id]) || !variantSolidCells(v).length);
  if (passable && sameBuildingOverlaps(ob.id, v, c, r)) return buildFail('已經有' + ob.name + '了', c, r);
  if (G.money < ob.cost) return buildFail('經費不足', c, r);
  G.money -= ob.cost; if (G.battle) G.battle.spent += ob.cost; if (typeof achieveOnSpend === 'function') achieveOnSpend('build', ob.cost);   // 結算畫面：本次花掉的經費
  // 地雷（trap）埋在地上、減速建築（鐵絲網）可以走過去：都不登記擋路格
  const slow = typeof SLOW_BUILDINGS !== 'undefined' && SLOW_BUILDINGS[ob.id];
  const solid = ob.trap || slow ? [] : variantSolidCells(v).map(cell => cell.slice());
  const o = { kind: 'obstacle', playerBuilt: true, type: ob.id, orient: buildOrient, c, r, w: v.w, h: v.h, solid, hp: ob.hp, maxhp: ob.hp, spawnT: 0, trap: !!ob.trap, slow: slow || null };
  solid.forEach(([dc, dr]) => { G.grid[(c + dc) + ',' + (r + dr)] = o; });
  G.obstacles.push(o);
  sfx(LIGHT.buildings && LIGHT.buildings[ob.id] ? 'placeLight' : 'place');   // 放置成功：燈類建築（探照燈、露營燈…，data/balance.js 的 LIGHT.buildings）播放燈聲，其他是落地「叩」聲
  return true;
}

// ---- 建築選單（障礙物 = data/objects.js；裝飾 = data/decorations.js）----
const buildBar = document.getElementById('buildbar');
const buildToggle = document.getElementById('buildToggle');
const buildQuickSlots = document.getElementById('buildQuickSlots');
const demolishToggle = document.getElementById('demolishToggle');
let buildOrient = 'h';         // 目前方向：h 橫版 / v 直版（按 R 切換）
let buildCat = 'obstacle';     // 全部可建造物件統一歸為障礙物
let buildTargetCell = null;    // 從地面情境選單指定的建築格
const BUILD_CATS = [['obstacle', '🧱 障礙物']];
const DECOS = (typeof DECORATIONS !== 'undefined') ? DECORATIONS : [];
const DISABLED_BUILD_IDS = new Set(['redroadblocks','barricades','deco_gasstove','wirefence']);   // 暫時不能蓋的建築（鐵圍籬先停用）
const buildList = () => [...OBSTACLES, ...DECOS].filter(o=>!DISABLED_BUILD_IDS.has(o.id));
// 依 id 找建築（跨兩類），放置時用
const buildableById = id => DISABLED_BUILD_IDS.has(id) ? null : (OBSTACLES.find(o => o.id === id) || DECOS.find(o => o.id === id));
// 下方建築欄：直接列出全部可以蓋的東西（不再有「建築」選單）。
// 排列：先照 BUILD_ORDER，其他的接在後面（物件編輯器新增的建築會自動出現在最後）
const BUILD_ORDER = ['camping_lights', 'searchlight', 'wirecloth', 'roadblocks', 'wirefence', 'landmine'];
const buildQuickIds = [...BUILD_ORDER.filter(id => buildableById(id)), ...buildList().map(o => o.id).filter(id => !BUILD_ORDER.includes(id))];
function renderBuildQuickSlots() {
  buildQuickSlots.innerHTML = '';
  buildQuickIds.forEach((id, index) => {
    const ob = buildableById(id); if (!ob) return;
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'build-quick-slot';
    button.dataset.buildId = id;
    button.dataset.tip = '經費 $' + ob.cost + '・HP ' + ob.hp; button.dataset.tipKey = 'build-' + id;   // 懸停提示（js/hover-tip.js）；名稱本來就寫在圖示下面
    button.setAttribute('aria-label', '建造' + ob.name);
    button.innerHTML = '<i class="bq-art" aria-hidden="true"><img src="' + ob[buildOrient].file + '" alt=""></i><span>' + ob.name + '</span>';   // bq-art：只把圖片裁在框裡，名稱不會被切掉（css/style.css）
    button.addEventListener('click', () => selectBuildType(id));
    button.draggable = true;   // 也可以直接拖到地圖上蓋（下面的 buildDrag）
    buildQuickSlots.appendChild(button);
  });
  if (typeof refreshHoverTip === 'function') refreshHoverTip();
}
function selectBuildType(id) {
  if (!G || !G.running || !MAP_FIELD || !buildableById(id)) return;   // 劇情地圖也能蓋（自己放燈照亮）
  if (buildTargetCell) {
    const [c, r] = buildTargetCell;
    const placed = placeObstacle(buildableById(id), c, r);
    if (placed) { buildTargetCell = null; buildBar.classList.add('hidden'); }
    renderBuildBar(); updateBuildToggle(); updateHUD();
    return;
  }
  G.selType = G.selType === 'build:' + id ? null : 'build:' + id;
  buildBar.classList.add('hidden');
  closeGroundMenu(); sfx('button'); renderBuildBar(); updateBuildToggle();
}

// ---- 拖曳蓋建築：把下方建築欄的按鈕拖到地圖上放開，就在那一格蓋（跟快捷欄拖道具一樣，js/quick-slots.js）----
// 拖曳中地圖上照常畫半透明預覽（放不下是紅框）；放不下就照點擊蓋的規則提示（太遠了、太黑了、經費不足…）
let buildDrag = null;   // { id, prevSel }：拖的是哪種建築、拖之前選的是什麼
const buildCanvas = document.getElementById('cv');
function buildDragCell(e) {
  const rect = buildCanvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (buildCanvas.width / rect.width) / VIEW_SCALE + cam.x;
  const y = (e.clientY - rect.top) * (buildCanvas.height / rect.height) / VIEW_SCALE + cam.y;
  const [c, r] = cellAt(x, y);
  return inGrid(c, r) ? [c, r] : null;
}
function endBuildDrag() {   // 放開後建築欄會重畫，被拖的按鈕不在畫面上、收不到 dragend：放開時也收尾
  if (!buildDrag) return;
  if (typeof releaseMoveKeys === 'function') releaseMoveKeys();   // 拖曳中瀏覽器收不到放開按鍵：全部放開，不然溫特會一直走
  if (G && G.selType === 'build:' + buildDrag.id) G.selType = buildDrag.prevSel;
  buildDrag = null; renderBuildBar(); updateBuildToggle();
}
buildQuickSlots.addEventListener('dragstart', e => {
  const button = e.target.closest && e.target.closest('.build-quick-slot');
  if (!button || !G || !G.running || G.over || !MAP_FIELD || !buildableById(button.dataset.buildId)) { e.preventDefault(); return; }
  buildDrag = { id: button.dataset.buildId, prevSel: G.selType };
  G.selType = 'build:' + buildDrag.id; buildTargetCell = null; closeGroundMenu();
  e.dataTransfer.setData('application/x-tudrc-build', buildDrag.id); e.dataTransfer.effectAllowed = 'copy';
  const ghost = document.createElement('div');   // 拖著的小圖不要畫（地圖上已經有預覽）：給一個透明的
  ghost.style.cssText = 'position:fixed;left:-50px;top:-50px;width:1px;height:1px;';
  document.body.appendChild(ghost); e.dataTransfer.setDragImage(ghost, 0, 0); setTimeout(() => ghost.remove());
});
buildCanvas.addEventListener('dragover', e => {
  if (!buildDrag) return;
  e.preventDefault(); e.dataTransfer.dropEffect = 'copy';
  hoverCell = buildDragCell(e);   // 拖曳中沒有 mousemove：預覽跟著游標要自己更新（js/game.js 的 hoverCell）
});
buildCanvas.addEventListener('drop', e => {
  if (!buildDrag) return;
  e.preventDefault();
  const cell = buildDragCell(e), ob = buildableById(buildDrag.id);
  if (cell && ob) { spawnGroundRipple(e.clientX, e.clientY); placeObstacle(ob, cell[0], cell[1]); updateHUD(); }
  endBuildDrag();
});
document.addEventListener('dragend', endBuildDrag);
document.addEventListener('drop', () => setTimeout(endBuildDrag));

const obstacleImgs = {};       // 預先載入每種物件的兩張圖（障礙物＋裝飾共用）
[...OBSTACLES, ...DECOS].forEach(o => {
  obstacleImgs[o.id] = {};
  ['h', 'v'].forEach(k => { const im = new Image(); im.src = o[k].file; obstacleImgs[o.id][k] = im; });
});
function renderBuildBar() {
  buildBar.innerHTML = '';
  const quickHint = document.createElement('div');
  quickHint.className = 'build-quick-hint';
  quickHint.textContent = '拖曳建築到下方快捷欄，可以替換';
  buildBar.appendChild(quickHint);
  if (buildTargetCell) {
    const note = document.createElement('div'); note.className = 'build-target';
    note.textContent = '選擇要建造的物件';
    buildBar.appendChild(note);
  }
  // 目前分類的項目
  buildList(buildCat).forEach(o => {
    const v = o[buildOrient];
    const b = document.createElement('button');
    b.className = 'tbtn build' + (G && G.selType === 'build:' + o.id ? ' sel' : '');
    b.draggable = true;
    b.title = '點擊建造，或拖到下方快捷欄替換';
    b.addEventListener('dragstart', e => {
      e.dataTransfer.effectAllowed = 'copy';
      e.dataTransfer.setData('application/x-tudrc-build', o.id);
      e.dataTransfer.setData('text/plain', o.id);
    });
    const image=document.createElement('img');image.src=v.file;image.alt='';
    const info=document.createElement('span');info.className='build-option-info';
    const name=document.createElement('span');name.className='build-option-name';name.textContent=o.name;
    const stats=document.createElement('span');stats.className='build-option-stats';stats.textContent='$'+o.cost+'　HP '+o.hp;
    info.append(name,stats);b.append(image,info);
    b.addEventListener('click', () => {
      if (buildTargetCell) {
        const [targetC, targetR] = buildTargetCell;
        G.selType = 'build:' + o.id;
        const placed = placeObstacle(o, targetC, targetR);
        G.selType = null;
        if (placed) { buildTargetCell = null; buildBar.classList.add('hidden'); }
        sfx('button'); renderBuildBar(); updateBuildToggle(); updateHUD();
        return;
      }
      selectBuildType(o.id);
    });
    buildBar.appendChild(b);
  });
  const rot = document.createElement('button');
  rot.className = 'tbtn rotate';
  rot.innerHTML = '↻ 轉向 (R)<small>目前：' + (buildOrient === 'h' ? '橫版' : '直版') + '</small>';
  rot.addEventListener('click', rotateBuild);
  buildBar.appendChild(rot);
}
function rotateBuild() { buildOrient = buildOrient === 'h' ? 'v' : 'h'; sfx('switch'); renderBuildBar(); renderBuildQuickSlots(); updateBuildToggle(); }
// 「🧱 建築」按鈕高亮＝選單開著或已選好建築
function updateBuildToggle() {
  const placing = !!(G && G.selType && (G.selType.startsWith('build:') || G.selType === 'demolish'));
  const active = !buildBar.classList.contains('hidden') || !!(G && G.selType && G.selType.startsWith('build:'));
  buildToggle.classList.toggle('sel', !!active);
  demolishToggle.classList.toggle('sel', !!(G && G.selType === 'demolish'));
  buildQuickSlots.querySelectorAll('.build-quick-slot').forEach((button, index) =>
    button.classList.toggle('sel', !!(G && G.selType === 'build:' + buildQuickIds[index])));
  document.getElementById('wrap').classList.toggle('placing-building', placing);
  document.getElementById('wrap').classList.toggle('demolishing', !!(G && G.selType === 'demolish'));   // 拆除模式：游標變槌子（css/style.css）
  if (placing && typeof closeFieldCommandMenu === 'function') closeFieldCommandMenu();
}
demolishToggle.addEventListener('click', () => {
  if (!G || !G.running || !MAP_FIELD) return;
  const wasActive = G.selType === 'demolish';
  closeBuildMenu(); closeGroundMenu();
  G.selType = wasActive ? null : 'demolish';
  if (!wasActive && G.player) flash('點選要拆的建築', G.player.x, G.player.y - 28, '#ffd479');
  sfx('button'); updateBuildToggle();
});
buildToggle.addEventListener('click', () => {
  const hadTarget = !!buildTargetCell;
  buildTargetCell = null;
  if (hadTarget) renderBuildBar();
  const opening = buildBar.classList.contains('hidden');
  buildBar.classList.toggle('hidden', !opening);
  if (G.selType === 'demolish') G.selType = null;
  sfx(opening ? 'menu' : 'switch');
  if (!opening && G.selType && G.selType.startsWith('build:')) { G.selType = null; renderBuildBar(); }   // 手動收起＝取消選取
  updateBuildToggle();
});
// 關閉建築選單並取消選取（Esc 或程式呼叫）
function closeBuildMenu() {
  // 載入編隊的收合設定時，game.js 還沒建立 G；先收起選單即可。
  const gameReady = typeof G !== 'undefined' && !!G;
  const hadTarget = !!buildTargetCell;
  buildTargetCell = null;
  if (hadTarget && gameReady) renderBuildBar();
  buildBar.classList.add('hidden');
  if (!gameReady) return;
  if (G.selType && (G.selType.startsWith('build:') || G.selType === 'demolish')) { G.selType = null; renderBuildBar(); }
  updateBuildToggle();
}
window.addEventListener('keydown', e => {
  if (e.key === 'Escape' && (!buildBar.classList.contains('hidden') || (G && G.selType && (G.selType.startsWith('build:') || G.selType === 'demolish')))) {
    e.preventDefault(); closeBuildMenu(); return;   // preventDefault：這次 Esc 用掉了（js/save.js 的 Esc 層級）
  }
  // 數字鍵不再選建築：1／2 留給切換槍枝（js/flare.js）；建築請點下方快捷欄
});
renderBuildQuickSlots();

// ---- 建築放置動畫：從上方掉下 → 落地壓扁 → 回彈，落地瞬間揚起塵埃 ----
const DROP = {
  fall: 0.16,      // 掉落時間（秒）
  squash: 0.10,    // 壓扁時間
  rebound: 0.18,   // 回彈時間
  height: 70,      // 從多高掉下來（像素）
};
const DROP_TOTAL = DROP.fall + DROP.squash + DROP.rebound;
// 依動畫進行到第 t 秒，回傳目前的位移與縮放（null＝動畫結束，正常畫）
function dropAnim(t) {
  if (t === undefined || t >= DROP_TOTAL) return null;
  if (t < DROP.fall) {                       // 掉落：加速往下
    const p = t / DROP.fall;
    return { dy: -DROP.height * (1 - p * p), sx: 1, sy: 1 };
  }
  if (t < DROP.fall + DROP.squash) {         // 壓扁：變矮變寬
    const p = (t - DROP.fall) / DROP.squash;
    return { dy: 0, sx: 1 + 0.18 * Math.sin(p * Math.PI), sy: 1 - 0.22 * Math.sin(p * Math.PI) };
  }
  const p = (t - DROP.fall - DROP.squash) / DROP.rebound;   // 回彈：微微拉高再回正
  const k = 0.06 * Math.sin(p * Math.PI);
  return { dy: 0, sx: 1 - k, sy: 1 + k };
}
// 落地瞬間在建築底部揚起塵埃
function spawnDust(o) {
  const w = (o.w || 1) * CELL, x0 = OX + o.c * CELL, yb = OY + (o.r + (o.h || 1)) * CELL;
  for (let i = 0; i < 10; i++) {
    const px = x0 + Math.random() * w;
    const side = px < x0 + w / 2 ? -1 : 1;   // 往左右兩側飄
    const life = 0.45 + Math.random() * 0.3;
    G.effects.push({
      dust: true, x: px, y: yb - 2 - Math.random() * 5,
      vx: side * (20 + Math.random() * 55), vy: -(12 + Math.random() * 28),
      r: 2.5 + Math.random() * 3.5, life, life0: life,
    });
  }
}

// ---- 建築欄可以收起來（收合狀態跟隊員欄一起記在瀏覽器，js/team.js 的 hudCollapsed）----
function applyBuildCollapse() {
  const bar = document.getElementById('buildToolbar'), btn = document.getElementById('buildCollapse');
  if (!bar || !btn || typeof hudCollapsed === 'undefined') return;
  const folded = !!hudCollapsed.build;
  bar.classList.toggle('collapsed', folded);
  btn.textContent = '';   // 收起來也一樣是細長的按鈕，只換箭頭方向
  btn.title = folded ? '展開建築欄' : '收起建築欄';
  btn.setAttribute('aria-expanded', !folded);
  if (folded && typeof closeBuildMenu === 'function') closeBuildMenu();   // 收起來時順便關掉建築清單
}
document.getElementById('buildCollapse')?.addEventListener('click', e => {
  e.stopPropagation();
  setHudCollapsed('build', !hudCollapsed.build); applyBuildCollapse();
});
applyBuildCollapse();
// 建築太多、欄位放不下時：滑鼠滾輪可以左右捲
document.querySelector('#buildToolbar .build-fold')?.addEventListener('wheel', e => {
  const f = e.currentTarget; if (f.scrollWidth <= f.clientWidth) return;
  e.preventDefault(); f.scrollLeft += e.deltaY || e.deltaX;
}, { passive: false });

// ---- 減速建築（鐵絲網）：站在上面的速度倍率（data/balance.js 的 SLOW_BUILDINGS）----
// who：'enemy' 怪物、'ally' 溫特和隊員。疊好幾個也只算最慢的那個
function slowFactorAt(x, y, who) {
  if (!G || !G.obstacles) return 1;
  const [c, r] = cellAt(x, y);
  let k = 1;
  for (const o of G.obstacles) {
    if (!o.slow || o.hp <= 0) continue;
    if (c >= o.c && r >= o.r && c < o.c + (o.w || 1) && r < o.r + (o.h || 1)) k = Math.min(k, o.slow[who] ?? 1);
  }
  if (typeof burrowMouseSlowAt === 'function') k = Math.min(k, burrowMouseSlowAt(x, y));   // 版權老鼠死後的洞（js/burrowing-mouse.js）
  if (typeof waterSlowAt === 'function') k = Math.min(k, waterSlowAt(x, y));   // 走在水裡（js/water.js：素材勾了「這是水」，速度 % 在編輯器填）
  return k;
}
// 這個位置是不是已經有同一種建築（不擋路的建築一格只能放一個）
function sameBuildingOverlaps(id, v, c, r) {
  const w = v.w || 1, h = v.h || 1;
  return G.obstacles.some(o => o.type === id && o.hp > 0 && c < o.c + (o.w || 1) && o.c < c + w && r < o.r + (o.h || 1) && o.r < r + h);
}
// 怪物踩在減速建築上會慢慢把它磨壞（SLOW_BUILDINGS[id].wear：每 every 秒、每隻怪磨掉 dmg）；game.js 的 update 每幀呼叫
function updateSlowBuildingWear(dt) {
  for (const o of [...G.obstacles]) {
    if (!o.slow || !o.slow.wear || o.hp <= 0) continue;
    const n = G.enemies.filter(e => !e.dead && e.hp > 0 && !e.flying && (() => { const [c, r] = cellAt(e.x, e.y); return c >= o.c && r >= o.r && c < o.c + (o.w || 1) && r < o.r + (o.h || 1); })()).length;
    if (!n) { o.wearT = 0; continue; }   // 沒人踩：重新計時
    o.wearT = (o.wearT || 0) + dt;
    if (o.wearT < o.slow.wear.every) continue;
    o.wearT -= o.slow.wear.every;
    o.hp -= o.slow.wear.dmg * n; o.hitT = .15;   // 每隻踩著的怪各磨一次，閃一下紅
    if (o.hp <= 0) { o.lastHitBy = 'enemy'; removeBarrier(o); computeFlow(); }
  }
}
