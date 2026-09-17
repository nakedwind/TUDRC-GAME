/* ===== 建築系統 =====
   建築的放置判定（只看擋路格）、建築選單、放置動畫與塵埃。
   建築種類與數值在 data/objects.js（用「物件編輯器.html」調整）。
*/
window.addEventListener('keydown', e => { if (!e.repeat && e.key.toLowerCase() === 'r') rotateBuild(); });   // R＝建築轉向

// ---- 佈署物件查詢 ----
const buildAt = (c, r) => G.grid[c + ',' + r];
const barrierAt = (c, r) => { const o = G.grid[c + ',' + r]; return (o && o.kind === 'obstacle') ? o : null; };
function removeBarrier(o) {
  obstacleSolidCells(o).forEach(([dc, dr]) => delete G.grid[(o.c + dc) + ',' + (o.r + dr)]);
  G.obstacles = G.obstacles.filter(x => x !== o);
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
// 黑暗規則：一般建築只能放亮處；「會發光的建築」（探照燈等）可蓋在光圈邊緣附近
// （光圈外再多 LIGHT.placeMargin 像素的容許範圍），用來一步步推光。
const emitsLight = ob => !!(LIGHT.buildings && LIGHT.buildings[ob.id]);
const placeExtra = ob => emitsLight(ob) ? LIGHT.placeMargin : 0;   // 0＝必須全亮
function canPlaceObstacle(v, c, r, lightExtra = 0) {
  if (c < 0 || r < 0 || c + v.w > COLS || r + v.h > ROWS) return false;
  // 只有「擋路格(solid)」才要求空地／不壓牆／不疊其他建築的擋路格／夠亮；
  // 其餘格子只是圖片，可以疊在牆或其他建築的圖片前面。
  for (const [dc, dr] of variantSolidCells(v)) {
    const cc = c + dc, rr = r + dr;
    if (!inGrid(cc, rr)) return false;
    if (isWall(cc, rr) || isEntrance(cc, rr)) return false;
    if (G.grid[cc + ',' + rr]) return false;         // 既有建築的擋路格
    if (!cellNearLight(cc, rr, lightExtra)) return false;
    // （蓋在玩家／哨兵身上是允許的：放下去的瞬間，救援機制會自動把人推到旁邊空位）
  }
  return true;
}
function footprintNearLight(v, c, r, extra) {
  // 亮度只看「擋路格」，跟放置判定／預覽框一致
  for (const [dc, dr] of variantSolidCells(v)) if (!cellNearLight(c + dc, r + dr, extra)) return false;
  return true;
}
function placeObstacle(ob, c, r) {
  const v = ob[buildOrient], extra = placeExtra(ob);
  if (!footprintNearLight(v, c, r, extra)) {
    sfx('error');
    flash(emitsLight(ob) ? '離光太遠了，要蓋在光圈邊緣附近' : '太暗了，要先照亮這裡', ...center(c, r), '#ffd24a');
    return false;
  }
  if (!canPlaceObstacle(v, c, r, extra)) { sfx('error'); flash('這裡放不下', ...center(c, r), '#ff8f8f'); return false; }
  if (G.money < ob.cost) { sfx('error'); flash('資源不足', ...center(c, r), '#ff8f8f'); return false; }
  G.money -= ob.cost;
  const solid = variantSolidCells(v).map(cell => cell.slice());
  const o = { kind: 'obstacle', type: ob.id, orient: buildOrient, c, r, w: v.w, h: v.h, solid, hp: ob.hp, maxhp: ob.hp, spawnT: 0 };
  solid.forEach(([dc, dr]) => { G.grid[(c + dc) + ',' + (r + dr)] = o; });
  G.obstacles.push(o);
  sfx('place');   // 放置成功（落地「叩」聲）
  return true;
}

// ---- 建築選單（障礙物 = data/objects.js；裝飾 = data/decorations.js）----
const buildBar = document.getElementById('buildbar');
const buildToggle = document.getElementById('buildToggle');
let buildOrient = 'h';         // 目前方向：h 橫版 / v 直版（按 R 切換）
let buildCat = 'obstacle';     // 目前選單分類：obstacle 障礙物 / decor 裝飾物件
let buildTargetCell = null;    // 從地面情境選單指定的建築格
const BUILD_CATS = [['obstacle', '🧱 障礙物'], ['decor', '🪑 裝飾']];
const DECOS = (typeof DECORATIONS !== 'undefined') ? DECORATIONS : [];
const buildList = cat => (cat === 'decor' ? DECOS : OBSTACLES);
// 依 id 找建築（跨兩類），放置時用
const buildableById = id => OBSTACLES.find(o => o.id === id) || DECOS.find(o => o.id === id);

const obstacleImgs = {};       // 預先載入每種物件的兩張圖（障礙物＋裝飾共用）
[...OBSTACLES, ...DECOS].forEach(o => {
  obstacleImgs[o.id] = {};
  ['h', 'v'].forEach(k => { const im = new Image(); im.src = o[k].file; obstacleImgs[o.id][k] = im; });
});
function renderBuildBar() {
  buildBar.innerHTML = '';
  if (buildTargetCell) {
    const note = document.createElement('div'); note.className = 'build-target';
    note.textContent = '選擇要建造的物件';
    buildBar.appendChild(note);
  }
  // 分類頁籤
  const tabs = document.createElement('div'); tabs.className = 'buildtabs';
  BUILD_CATS.forEach(([cat, label]) => {
    const tb = document.createElement('button');
    tb.className = 'buildcat' + (buildCat === cat ? ' sel' : '');
    tb.textContent = label;
    tb.addEventListener('click', () => { buildCat = cat; sfx('switch'); renderBuildBar(); });
    tabs.appendChild(tb);
  });
  buildBar.appendChild(tabs);
  // 目前分類的項目
  buildList(buildCat).forEach(o => {
    const v = o[buildOrient];
    const b = document.createElement('button');
    b.className = 'tbtn build' + (G && G.selType === 'build:' + o.id ? ' sel' : '');
    b.innerHTML = '<img src="' + v.file + '" alt=""><span>' + o.name + '　$' + o.cost + '　HP ' + o.hp + '</span>';
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
      G.selType = (G.selType === 'build:' + o.id) ? null : 'build:' + o.id;
      sfx('button');
      renderBuildBar();
      if (G.selType) { buildBar.classList.add('hidden'); }   // 選好就收起選單，開始放置（可連放）
      updateBuildToggle();
    });
    buildBar.appendChild(b);
  });
  const rot = document.createElement('button');
  rot.className = 'tbtn rotate';
  rot.innerHTML = '↻ 轉向 (R)<small>目前：' + (buildOrient === 'h' ? '橫版' : '直版') + '</small>';
  rot.addEventListener('click', rotateBuild);
  buildBar.appendChild(rot);
}
function rotateBuild() { buildOrient = buildOrient === 'h' ? 'v' : 'h'; sfx('switch'); renderBuildBar(); }
// 「🧱 建築」按鈕高亮＝選單開著或已選好建築
function updateBuildToggle() {
  const active = !buildBar.classList.contains('hidden') || (G && G.selType && G.selType.startsWith('build:'));
  buildToggle.classList.toggle('sel', !!active);
}
buildToggle.addEventListener('click', () => {
  const hadTarget = !!buildTargetCell;
  buildTargetCell = null;
  if (hadTarget) renderBuildBar();
  const opening = buildBar.classList.contains('hidden');
  buildBar.classList.toggle('hidden', !opening);
  sfx(opening ? 'menu' : 'switch');
  if (!opening && G.selType && G.selType.startsWith('build:')) { G.selType = null; renderBuildBar(); }   // 手動收起＝取消選取
  updateBuildToggle();
});
// 關閉建築選單並取消選取（Esc 或程式呼叫）
function closeBuildMenu() {
  const hadTarget = !!buildTargetCell;
  buildTargetCell = null;
  if (hadTarget) renderBuildBar();
  buildBar.classList.add('hidden');
  if (G.selType && G.selType.startsWith('build:')) { G.selType = null; renderBuildBar(); }
  updateBuildToggle();
}

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
