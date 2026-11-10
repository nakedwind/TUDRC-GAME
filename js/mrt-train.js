/* ===== 捷運列車：到站、開門、關門、離站（R89 區-捷運站）=====
   地圖編輯器照常擺「車廂（車頭）」「車廂（中段）」物件（同一排的車廂算同一班列車，一起跑）。
   進遊戲時程式把車廂圖藏起來，改成會動的版本，每節車廂由下往上疊四層：
     ① 對面的車門（mrt-train-door-2，對在車廂內部的門洞）
     ② 車廂內部（mrt-train-car-middle-bg，座椅、吊環）
     ③ 靠月台這側的車門（mrt-train-door，對在外殼的門洞）
     ④ 車廂外殼（車頭／中段的原圖）
   車門是左右兩片，開門時各自往旁邊滑進牆裡（超出門洞的部分不畫）。
   一輪表演：播到站音樂 → arriveSoundLead 秒後列車出現、減速進站 → 停好開門（開門聲）→ 門開好 dwell 秒後播離站警示音
     → departWarnTime 秒後播「車門即將關閉」→ warnTime 秒後關門（關門聲）→ afterClose 秒後開走（列車啟動音）→ 再等下一班。
   停靠時預設只開靠月台這側（外側）的門；地圖編輯器選車廂勾「兩側車門都開」（stamp.bothDoors），對面的門也一起開。
   車頭可以設「後面接幾節車廂」（stamp.cars）：程式自動在車頭後面接上中段車廂，不用一節一節擺（地圖放不下也沒關係）。
   車頭朝哪邊，列車就往哪邊開（地圖編輯器左右翻轉車頭＝反方向）。
   列車只畫在軌道（mrt-rail-track）的範圍裡，軌道兩端就像隧道口。
   走進車廂：列車停好時照「格子圖」擋路（物件編輯器「🚇 捷運列車」用畫筆畫，車頭、中段各一張，存在 MRT_TRAIN.cells）：
     # 擋路（車身）、. 車內地板、D 外側門口（地板；車門開著時往下走得出去）、F 對面通道（兩側車門都開的班次，門開著時才走得過）
     地板和車外之間是薄牆（js/pathfinding.js 的邊緣碰撞）→ 只能從車門上下車。車廂之間是通的。溫特、隊員、怪物的尋路都認得。
     沒有格子圖時照門洞自動產生：最下面一排是地板（外側門洞那幾欄是 D），上面是擋路（對面門洞那幾欄是 F）。
     軌道上畫了碰撞格（不可穿透）也沒關係：列車停好時，車廂裡走得進去的格子會暫時打開，列車開走再擋回去。
   圖層：①② 跟車廂上緣一起排（在車內的人畫在內部圖上面），③④ 排在車廂下緣再往下一點（蓋住車內的人，月台上的人照樣在前面）。
     ③④ 裡外側門口那幾欄另外排、排得比較前面（doorSortDy）：站在門口、腳還在門檻外的人不會被車殼蓋住。
   關門時溫特在車上 → 搭車：車上的人（溫特、隊員、怪物）跟著列車一起開走，快開進隧道時畫面才變黑；
     在隧道裡黑一陣子、搖晃（rideTime），再載著大家開進站、停好開門（之後可以改成送到別張地圖）。搭車時車上的人不能動。
   車廂裡蓋的建築（燈、路障…，地雷除外）：列車開走時跟著車廂一起走（燈光也跟著動），下次停好時放回原本的格子。
     溫特不在車上 → 留在車上的隊員、怪物先被請下車（放到門外月台），列車才開走。
   （數值在物件編輯器的「🚇 捷運列車」調，存在 data/mrt-train.js；下面 MRT_TRAIN 是沒有設定檔時的預設）
*/
const MRT_TRAIN = {
  cars: { tile_mrt_train_car_head: 'head', tile_mrt_train_car_middle: 'middle' },
  middleTile: 'tile_mrt_train_car_middle',   // 車頭後面自動接的車廂
  maxCars: 9,           // 車頭後面最多接幾節
  railTile: 'tile_mrt_rail_track',
  inside: 'images/捷運車站/mrt-train-car-middle-bg.png',   // 車廂內部（車頭、中段共用）
  // 門的圖、要對到的門洞（原圖像素，車廂圖是 1040×160）：
  //   x：三個門洞的左緣；y、w、h：門洞的上緣、寬、高；art：門的圖裡門板的範圍（x、y、w、h）
  outerDoor: { file: 'images/捷運車站/mrt-train-door.png',   x: [132, 468, 804], y: 59, w: 112, h: 87, art: [2, 16, 116, 87] },
  farDoor:   { file: 'images/捷運車站/mrt-train-door-2.png', x: [113, 449, 785], y: 15, w: 112, h: 84, art: [3, 17, 114, 86] },
  firstWait: 3,         // 開始戰鬥後幾秒來第一班
  waitMin: 18, waitMax: 30,   // 離站後隔多久來下一班（秒，隨機）
  arriveDecel: 230,     // 進站減速度（像素／秒²）：越小進站越久
  departAccel: 170,     // 離站加速度
  doorTime: 1.1,        // 開門、關門各幾秒
  dwell: 5,             // 門開好後幾秒播離站警示音
  departWarnTime: 5.05, // 離站警示音響多久才播「車門即將關閉」（離站警示音的長度）
  warnTime: 3.76,       // 「車門即將關閉」響多久才開始關門（這段音效的長度）
  afterClose: 4.2,      // 門關好後幾秒開走（關門聲 5.3 秒，扣掉關門的 1.1 秒）
  arriveSoundLead: 5,   // 到站音樂先響幾秒，列車才出現
  rideTime: 6,          // 溫特搭車：開進隧道後畫面黑幾秒才開進站（要比 arriveSoundLead 長，到站音樂才會先響）
  rideFadeCells: 5,     // 溫特離軌道盡頭（隧道口）幾格時畫面開始變黑；進站時進到軌道幾格才亮回來
  rideShake: 1.6,       // 搭車時畫面搖晃的強度
  doorPassAt: .7,       // 車門開到幾成才走得過去
  sounds: { arrive: 'mrtArrive', open: 'mrtDoorOpen', departWarn: 'mrtDepartWarn', warn: 'mrtDoorWarn', close: 'mrtDoorClose', depart: 'mrtDepart' },   // 音效編輯器裡的名稱
  soundGain: .55,
  frontSortDy: 10,      // 前層（外殼）排在車廂下緣往下幾像素：車內的人畫在兩層中間、月台上的人在最前面
  doorSortDy: -3,       // 外側門口那幾欄的外殼另外排，排在車廂下緣往下幾像素（負的＝往上）：站在門口、腳還沒跨進車裡的人畫在前面
};
// 物件編輯器「🚇 捷運列車」調的數值（data/mrt-train.js）蓋過上面的預設
if (typeof MRT_TRAIN_SETTINGS !== 'undefined') for (const [k, v] of Object.entries(MRT_TRAIN_SETTINGS)) {
  if (v && typeof v === 'object' && !Array.isArray(v) && MRT_TRAIN[k]) Object.assign(MRT_TRAIN[k], v);
  else MRT_TRAIN[k] = v;
}

const mrtTrainImgs = {};
function mrtTrainImg(file) {
  let rec = mrtTrainImgs[file];
  if (!rec) { rec = mrtTrainImgs[file] = { img: new Image(), ok: false }; rec.img.onload = () => { rec.ok = true; }; rec.img.src = file; }
  return rec.ok ? rec.img : null;
}

// ---- 碰撞：列車加進固定牆的格子、薄牆（每班車自己記 tr.walls、tr.edges；總表給換地圖、重開時整個還原）----
// tr.cleared：地圖本來就是牆（軌道上畫的碰撞格）、但列車停著時是車內地板的格子，暫時拿掉，列車沒停好就擋回去
let mrtTrainWalls = new Set();
function mrtTrainRestoreCleared(tr) {
  const solid = new Set((MAP && MAP.solid) || []);
  for (const k of tr.cleared || []) if (solid.has(k)) mapWalls.add(k);   // 只放回這張地圖本來畫的牆
  tr.cleared = [];
}
function mrtTrainApplyEdges() {
  const all = new Set();
  for (const tr of (G && G.mrtTrains) || []) for (const k of tr.edges || []) all.add(k);
  if (typeof setExtraEdges === 'function') setExtraEdges(all);
}

// 每局開始（js/game.js 的 newGame）：找出地圖上的車廂，同一排的組成一班列車
function setupMrtTrains() {
  for (const tr of (G && G.mrtTrains) || []) mrtTrainRestoreCleared(tr);   // 同一張地圖重開：上一局拿掉的軌道碰撞格放回去
  for (const k of mrtTrainWalls) mapWalls.delete(k);
  mrtTrainWalls = new Set();
  G.mrtTrains = [];
  mrtTrainApplyEdges();
  if (mrtRiding) mrtRideFade(false);   // 搭車搭到一半換地圖、重開
  if (!MAP) return;
  const rows = new Map();
  for (const s of MAP.stamps || []) {
    const kind = MRT_TRAIN.cars[s.id], tile = kind && mapTileById(s.id);
    if (!tile) continue;
    const key = s.r + ':' + (s.oy || 0);
    if (!rows.has(key)) rows.set(key, []);
    rows.get(key).push({ stamp: s, tile, kind, x: OX + s.c * CELL + (s.ox || 0), y: OY + s.r * CELL + (s.oy || 0), w: mapTileW(tile) * CELL, h: mapTileH(tile) * CELL });
  }
  if (!rows.size) return;
  [MRT_TRAIN.inside, MRT_TRAIN.outerDoor.file, MRT_TRAIN.farDoor.file].forEach(mrtTrainImg);
  for (const cars of rows.values()) {
    for (const car of cars) G.mapDestroyed.add(car.stamp);
    const head = cars.find(c => c.kind === 'head') || cars[0];
    // 車頭後面自動接的車廂（車頭朝右就往左接）
    const midTile = mapTileById(MRT_TRAIN.middleTile), extra = Math.min(MRT_TRAIN.maxCars, Math.max(0, Math.floor(+head.stamp.cars || 0)));
    if (head.kind === 'head' && midTile) for (let i = 1; i <= extra; i++) {
      const w = mapTileW(midTile) * CELL, back = head.stamp.fx ? head.x + head.w + (i - 1) * w : head.x - i * w;
      cars.push({ stamp: { fx: head.stamp.fx }, tile: midTile, kind: 'middle', x: back, y: head.y, w, h: mapTileH(midTile) * CELL });
    }
    const left = Math.min(...cars.map(c => c.x)), right = Math.max(...cars.map(c => c.x + c.w));
    const top = Math.min(...cars.map(c => c.y)), bottom = Math.max(...cars.map(c => c.y + c.h));
    // 軌道範圍：跟列車上下重疊的軌道，最左到最右（沒擺軌道就用整張地圖）
    let clipL = Infinity, clipR = -Infinity;
    for (const s of MAP.stamps || []) {
      if (s.id !== MRT_TRAIN.railTile) continue;
      const t = mapTileById(s.id); if (!t) continue;
      const x = OX + s.c * CELL + (s.ox || 0), y = OY + s.r * CELL + (s.oy || 0), w = mapTileW(t) * CELL, h = mapTileH(t) * CELL;
      if (y < bottom && y + h > top) { clipL = Math.min(clipL, x); clipR = Math.max(clipR, x + w); }
    }
    if (clipL === Infinity) { clipL = OX; clipR = OX + MAP.cols * CELL; }
    const dir = head.stamp.fx ? -1 : 1;
    // 進站前停在軌道外（整列看不到）的距離、離站要開多遠才完全看不到
    const inDist = dir > 0 ? right - clipL : clipR - left, outDist = dir > 0 ? clipR - left : right - clipL;
    G.mrtTrains.push({ cars, dir, bothDoors: cars.some(c => c.stamp.bothDoors), clipL, clipR, top, bottom, x: (left + right) / 2, y: bottom,
      inDist: Math.max(0, inDist) + CELL, outDist: Math.max(0, outDist) + CELL,
      state: 'away', t: MRT_TRAIN.firstWait, off: 0, door: 0, soundId: 'mrt-train-' + head.stamp.c + ',' + head.stamp.r,
      walls: [], edges: [], cleared: [], solidKey: '' });
  }
}
// 接續「保留進度」、劇情看完回原地圖（mapWalls 整份換回來，js/combat-progress.js 的 reclaimAddedWalls）：照每班車記的格子湊回總表
function restoreMrtTrains() {
  mrtTrainWalls = new Set();
  for (const tr of (G && G.mrtTrains) || []) for (const k of tr.walls || []) mrtTrainWalls.add(k);
  mrtTrainApplyEdges();
}

// ---- 車廂的格子圖：一列一串字（由上往下），每個字是一格：# 擋路、. 地板、D 外側門口、F 對面通道 ----
// 照門洞自動產生（中心在門洞裡的那幾欄算門口；物件編輯器的「依門洞重新產生」也用這個）
function mrtAutoLayout(w = 26, h = 4) {
  const inHole = (D, c) => { const ix = (c + .5) * 40; return D.x.some(hx => ix > hx && ix < hx + D.w); };
  const rows = [];
  for (let r = 0; r < h; r++) {
    let row = '';
    for (let c = 0; c < w; c++) row += r < h - 1 ? (inHole(MRT_TRAIN.farDoor, c) ? 'F' : '#') : (inHole(MRT_TRAIN.outerDoor, c) ? 'D' : '.');
    rows.push(row);
  }
  return rows;
}
function mrtCarLayout(kind) {
  const L = MRT_TRAIN.cells && MRT_TRAIN.cells[kind];
  return Array.isArray(L) && L.length ? L : mrtAutoLayout();
}
// 一節車廂停在原位時每一格是什麼（左右翻轉的車廂格子圖也跟著翻）
function mrtCarCells(car) {
  const c0 = Math.round((car.x - OX) / CELL), r0 = Math.round((car.y - OY) / CELL), w = Math.round(car.w / CELL), h = Math.round(car.h / CELL);
  const L = mrtCarLayout(car.kind), cells = [];
  for (let dr = 0; dr < h; dr++) for (let dc = 0; dc < w; dc++) {
    const ch = (L[dr] || '')[car.stamp.fx ? w - 1 - dc : dc] || '#';
    cells.push({ c: c0 + dc, r: r0 + dr, t: ch });
  }
  return { c0, r0, w, h, cells };
}
// 列車擋路的樣子：沒停好＝不擋；停好＝照格子圖，門開著時門口（D）、對面通道（F，兩側都開的班次）走得過
function mrtTrainSolidState(tr) {
  if (['away', 'arrive', 'depart', 'tunnel'].includes(tr.state)) return '';
  return tr.door >= MRT_TRAIN.doorPassAt ? 'open' : 'closed';
}
function mrtTrainUpdateSolid(tr) {
  const key = mrtTrainSolidState(tr);
  if (key === tr.solidKey) return;
  const wasOff = !tr.solidKey;
  tr.solidKey = key;
  for (const k of tr.walls) { mapWalls.delete(k); mrtTrainWalls.delete(k); }
  mrtTrainRestoreCleared(tr);
  tr.walls = []; tr.edges = []; tr.floor = [];
  if (key) {
    const open = key === 'open', far = open && tr.bothDoors;
    const type = new Map();
    let rMax = -Infinity;
    // 超出軌道範圍（隧道裡、畫面上看不到）的車廂格子不算：不然看不到的車廂會在旁邊的手扶梯上造出看不見的牆和地板
    for (const car of tr.cars) for (const x of mrtCarCells(car).cells) {
      const cx = OX + x.c * CELL;
      if (cx < tr.clipL - 1 || cx + CELL > tr.clipR + 1) continue;
      type.set(x.c + ',' + x.r, x.t); rMax = Math.max(rMax, x.r);
    }
    const pass = t => t === '.' || t === 'D' || (t === 'F' && far);
    for (const [k, t] of type) {
      const [c, r] = k.split(',').map(Number);
      if (!pass(t)) { if (inGrid(c, r) && !mapWalls.has(k)) { mapWalls.add(k); mrtTrainWalls.add(k); tr.walls.push(k); } continue; }
      tr.floor.push(k);
      if (mapWalls.has(k)) { mapWalls.delete(k); tr.cleared.push(k); }   // 軌道上的碰撞格：列車停著時是車內地板
      // 走得進去的格子跟車外之間放薄牆：外側門口往下、對面通道往上，門開著時不擋
      const out = (cc, rr) => !type.has(cc + ',' + rr);
      if (out(c, r + 1) && !(t === 'D' && open)) tr.edges.push(c + ',' + r + ',B');
      if (out(c, r - 1) && !(t === 'F' && far)) tr.edges.push(c + ',' + (r - 1) + ',B');
      if (out(c - 1, r)) tr.edges.push((c - 1) + ',' + r + ',R');
      if (out(c + 1, r)) tr.edges.push(c + ',' + r + ',R');
    }
    tr.bottomRow = rMax;
    mrtTrainUnstick(tr, wasOff);
    if (!open) mrtTrainClearSill(tr, type);   // 車門關上：站在門檻上的人推進車裡或推回月台
  }
  mrtTrainApplyEdges();
  if (typeof computeFlow === 'function') computeFlow();
  for (const a of [...G.towers, ...G.npcs, ...G.enemies]) { a.navPath = null; a.navGoal = null; a.navFailed = false; }
}
const mrtTrainActors = () => [G.player, ...G.towers, ...G.npcs, ...G.enemies].filter(a => a && !a.dead);
const mrtCellKey = a => cellAt(a.x, a.y).join(',');
// 誰在列車上（站在車廂走得進去的格子裡）
function mrtOnTrain(tr, a) { return !!(tr.solidKey && a && tr.floor && tr.floor.includes(mrtCellKey(a))); }
// 擋路的格子變多時，站在裡面的人移開：列車剛停好（站在軌道上的人）→ 月台；門關上（站在對面通道裡的人）→ 最近的車內地板
function mrtTrainUnstick(tr, toPlatform) {
  const walls = new Set(tr.walls), platformY = OY + (tr.bottomRow + 1.5) * CELL;
  const floor = tr.floor.map(k => k.split(',').map(Number));
  for (const a of mrtTrainActors()) {
    const [c, r] = cellAt(a.x, a.y);
    if (!walls.has(c + ',' + r)) continue;
    if (toPlatform || !floor.length) a.y = platformY;
    else {
      let best = floor[0], bd = Infinity;
      for (const f of floor) { const d = Math.abs(f[0] - c) * 1.5 + Math.abs(f[1] - r); if (d < bd) { bd = d; best = f; } }
      a.x = OX + (best[0] + .5) * CELL; a.y = OY + (best[1] + .5) * CELL;
    }
    a.navPath = null; a.navGoal = null;
  }
}
// 車門關上：站在門檻上（車殼底邊那條線附近）的人，腳已經跨進去的推進車裡，還沒跨進去的推回月台（不然會卡在牆上）
function mrtTrainClearSill(tr, type) {
  const sill = OY + (tr.bottomRow + 1) * CELL, gap = 20;   // 車廂下緣（薄牆）
  for (const a of mrtTrainActors()) {
    const [c, r] = cellAt(a.x, a.y);
    if (type.get(c + ',' + tr.bottomRow) !== 'D' || r < tr.bottomRow || r > tr.bottomRow + 1 || Math.abs(a.y - sill) >= gap) continue;
    a.y = a.y < sill ? sill - gap : OY + (tr.bottomRow + 1) * CELL + gap;
    a.navPath = null; a.navGoal = null;
  }
}
// 列車開走前：還在車上的隊員、怪物請下車（放到列車正下方的月台）
function mrtTrainUnload(tr) {
  const platformY = OY + (tr.bottomRow + 1.5) * CELL;
  for (const a of mrtTrainActors()) if (a !== G.player && mrtOnTrain(tr, a)) { a.y = platformY; a.navPath = null; a.navGoal = null; }
}
// ---- 搭車：車上的人跟著列車一起動（a.mrtRide＝搭車中，溫特、隊員、怪物這時不自己動：js/game.js、js/sentry.js、js/enemy-ai.js）----
function mrtTrainBoard(tr) {
  tr.riders = mrtTrainActors().filter(a => mrtOnTrain(tr, a)).map(a => {
    a.mrtRide = true; a.navPath = null; a.navGoal = null; a.moving = false;
    return { a, x: a.x - tr.off * tr.dir };
  });
}
function mrtTrainMoveRiders(tr) {
  for (const r of tr.riders || []) r.a.x = r.x + tr.off * tr.dir;
}
function mrtTrainGetOff(tr) {
  for (const r of tr.riders || []) { r.a.mrtRide = false; r.a.navPath = null; r.a.navGoal = null; }
  tr.riders = null;
  if (mrtRiding) mrtRideFade(false);
}
// ---- 車廂裡蓋的建築：列車開走時拿出格子（不擋路），跟著車廂畫、燈光跟著動（o.artX）；停好時放回原本的格子 ----
function mrtTrainLoadCargo(tr) {
  const floor = new Set(tr.floor || []);
  tr.cargo = [];
  for (const o of G.obstacles) {
    if (o.isBase || o.mapSource || o.trap || o.mrtCargo) continue;
    // 看建築最下面那排（站的位置）在不在車廂地板上；露營燈、鐵絲網這種不擋路的建築也算
    const w = o.w || 1, h = o.h || 1;
    if (!mrtObstacleBaseKeys(o).some(k => floor.has(k))) continue;
    const keys = [];
    for (let dc = 0; dc < w; dc++) for (let dr = 0; dr < h; dr++) { const k = (o.c + dc) + ',' + (o.r + dr); if (G.grid[k] === o) keys.push(k); }
    for (const k of keys) delete G.grid[k];
    o.mrtCargo = true;
    tr.cargo.push({ o, keys });
  }
  if (!tr.cargo.length) tr.cargo = null;
}
function mrtTrainMoveCargo(tr) {
  const shift = tr.off * tr.dir;
  for (const { o } of tr.cargo) {
    const x = OX + o.c * CELL + shift;
    o.mrtShift = shift; o.artX = x; o.artY = OY + o.r * CELL;
    o.mrtHidden = x + (o.w || 1) * CELL <= tr.clipL || x >= tr.clipR;   // 開進隧道（軌道範圍外）就不畫
  }
}
// 蓋在車廂裡的建築排前後：一定排在車殼（含門口那段）後面，不然站在門口那排的建築會畫到車門前面（js/render.js）
function mrtObstacleBaseKeys(o) {
  const w = o.w || 1, h = o.h || 1, base = [];
  for (let dc = 0; dc < w; dc++) base.push((o.c + dc) + ',' + (o.r + h - 1));
  return base;
}
function mrtObstacleSortY(o) {
  const y = (o.r + (o.h || 1)) * CELL;
  for (const tr of (G && G.mrtTrains) || []) {
    if (tr.state === 'away') continue;
    const inside = o.mrtCargo ? !!(tr.cargo && tr.cargo.some(x => x.o === o))
      : !!(tr.solidKey && tr.floor && mrtObstacleBaseKeys(o).some(k => tr.floor.includes(k)));
    if (inside) return Math.min(y, tr.bottom - OY - 20);
  }
  return y;
}
function mrtTrainUnloadCargo(tr) {
  for (const { o, keys } of tr.cargo || []) {
    delete o.mrtCargo; delete o.mrtShift; delete o.mrtHidden; delete o.artX; delete o.artY;
    if (!G.obstacles.includes(o) || o.hp <= 0) continue;   // 路上被打壞了
    for (const k of keys) if (!G.grid[k]) G.grid[k] = o;
  }
  tr.cargo = null;
}
// 溫特在不在隧道口附近：'out'＝開走時快開進隧道；'in'＝進站時已經進到軌道範圍
function mrtPlayerInTunnel(tr, which) {
  const p = G.player; if (!p) return false;
  const m = MRT_TRAIN.rideFadeCells * CELL;
  if (which === 'out') return tr.dir > 0 ? p.x > tr.clipR - m : p.x < tr.clipL + m;
  return tr.dir > 0 ? p.x > tr.clipL + m : p.x < tr.clipR - m;
}
// 溫特搭車：畫面變黑（借用換地圖的黑幕 #mapTransition）
let mrtRiding = false;
function mrtRideFade(on) {
  mrtRiding = on;
  const el = document.getElementById('mapTransition');
  if (el) el.classList.toggle('visible', on);
}

function mrtTrainSound(tr, key) {
  const name = MRT_TRAIN.sounds[key], p = G.player;
  if (!name || typeof SFX === 'undefined' || !p) return;
  // 整個月台都聽得到：用列車上離溫特最近的點算距離
  const x = Math.max(tr.clipL, Math.min(tr.clipR, p.x)), y = Math.max(tr.top, Math.min(tr.bottom, p.y));
  if (typeof sfxAt === 'function') sfxAt(name, x, y, MRT_TRAIN.soundGain, tr.soundId + '-' + key);
}

// 狀態：away（看不到，等下一班）→ arrive（減速進站）→ opening → dwell（門開著）→ departWarn（離站警示音）→ warn（車門即將關閉）
//      → closing → closed → depart（加速離站）→ away
function updateMrtTrains(dt) {
  if (!G.mrtTrains || !G.mrtTrains.length) return;
  const T = MRT_TRAIN;
  for (const tr of G.mrtTrains) {
    tr.t -= dt;
    if (tr.state === 'away') {
      tr.off = -tr.inDist; tr.door = 0;
      if (tr.t <= T.arriveSoundLead && !tr.chimed) { tr.chimed = true; mrtTrainSound(tr, 'arrive'); }
      if (tr.t > 0) continue;
      // 等減速：v0²＝2aD，整段 D 剛好停在原位
      tr.state = 'arrive'; tr.v = Math.sqrt(2 * T.arriveDecel * tr.inDist);
    } else if (tr.state === 'arrive') {
      tr.v = Math.max(0, tr.v - T.arriveDecel * dt);
      tr.off = Math.min(0, tr.off + tr.v * dt);
      mrtTrainMoveRiders(tr);
      if (tr.riders && mrtRiding && mrtPlayerInTunnel(tr, 'in')) mrtRideFade(false);   // 載著溫特進站：進到軌道範圍才亮回來
      if (tr.off >= -.5 || tr.v <= 0) { tr.off = 0; mrtTrainMoveRiders(tr); mrtTrainGetOff(tr); mrtTrainUnloadCargo(tr); tr.state = 'opening'; tr.t = T.doorTime; mrtTrainSound(tr, 'open'); }
    } else if (tr.state === 'opening') {
      tr.door = 1 - Math.max(0, tr.t) / T.doorTime;
      if (tr.t <= 0) { tr.door = 1; tr.state = 'dwell'; tr.t = T.dwell; }
    } else if (tr.state === 'dwell') {
      if (tr.t <= 0) { tr.state = 'departWarn'; tr.t = T.departWarnTime; mrtTrainSound(tr, 'departWarn'); }
    } else if (tr.state === 'departWarn') {
      if (tr.t <= 0) { tr.state = 'warn'; tr.t = T.warnTime; mrtTrainSound(tr, 'warn'); }
    } else if (tr.state === 'warn') {
      if (tr.t <= 0) { tr.state = 'closing'; tr.t = T.doorTime; mrtTrainSound(tr, 'close'); }
    } else if (tr.state === 'closing') {
      tr.door = Math.max(0, tr.t) / T.doorTime;
      if (tr.t <= 0) { tr.door = 0; tr.state = 'closed'; tr.t = T.afterClose; }
    } else if (tr.state === 'closed') {
      if (tr.t <= 0) {
        mrtTrainSound(tr, 'depart');
        if (mrtOnTrain(tr, G.player)) mrtTrainBoard(tr);   // 溫特在車上：車上的人跟著列車開走（搭車）
        else mrtTrainUnload(tr);
        mrtTrainLoadCargo(tr);   // 車廂裡蓋的建築跟著走
        tr.state = 'depart'; tr.v = 0;
      }
    } else if (tr.state === 'tunnel') {   // 載著溫特在隧道裡（畫面黑的）
      if (typeof addShake === 'function') addShake(T.rideShake);
      if (tr.t <= T.arriveSoundLead && !tr.chimed) { tr.chimed = true; mrtTrainSound(tr, 'arrive'); }
      if (tr.t <= 0) {
        // 不用從最遠的地方開進來：從溫特快進到軌道範圍的位置開始（畫面還是黑的），照一樣的減速度停在原位
        const r = tr.riders && tr.riders.find(x => x.a === G.player), m = (T.rideFadeCells - 1) * CELL;
        const x0 = tr.dir > 0 ? tr.clipL + m : tr.clipR - m;
        tr.off = r ? Math.max(-tr.inDist, Math.min(0, (x0 - r.x) / tr.dir)) : -tr.inDist;
        tr.state = 'arrive'; tr.v = Math.sqrt(2 * T.arriveDecel * -tr.off); mrtTrainMoveRiders(tr);
      }
    } else if (tr.state === 'depart') {
      tr.v += T.departAccel * dt;
      tr.off += tr.v * dt;
      mrtTrainMoveRiders(tr);
      if (tr.riders && !mrtRiding && mrtPlayerInTunnel(tr, 'out')) { mrtRideFade(true); tr.fadeT = 0; }   // 快開進隧道：畫面變黑
      if (tr.riders && mrtRiding) tr.fadeT = (tr.fadeT || 0) + dt;
      if (tr.off >= tr.outDist || (tr.riders && tr.fadeT > .6)) {   // 載著溫特：畫面黑了就直接算進隧道
        tr.chimed = false;
        if (tr.riders) { tr.state = 'tunnel'; tr.t = T.rideTime; tr.fadeT = 0; mrtRideFade(true); }
        else { tr.state = 'away'; tr.t = T.waitMin + Math.random() * (T.waitMax - T.waitMin); tr.off = -tr.inDist; }
      }
    }
    if (tr.riders && typeof addShake === 'function' && (tr.state === 'depart' || tr.state === 'arrive')) addShake(T.rideShake * .35);   // 坐在車上：輕輕晃
    if (tr.cargo) mrtTrainMoveCargo(tr);
    mrtTrainUpdateSolid(tr);
  }
}

// ---- 畫列車：跟角色一起排前後（js/render.js）----
// 後層（對面的門＋車廂內部）跟車廂上緣排；前層（外側的門＋外殼）排在車廂下緣往下 frontSortDy：
// 車內走道上的人（腳底最多到車廂下緣）會畫在兩層中間，月台上的人畫在最前面
function mrtTrainSortables(list) {
  for (const tr of G.mrtTrains || []) {
    if (tr.state === 'away') continue;
    list.push({ y: tr.top, draw: () => drawMrtTrain(ctx, tr, 'back') });
    list.push({ y: tr.bottom + MRT_TRAIN.frontSortDy, draw: () => drawMrtTrain(ctx, tr, 'front') });
    list.push({ y: tr.bottom + MRT_TRAIN.doorSortDy, draw: () => drawMrtTrain(ctx, tr, 'frontDoor') });
  }
}
// 門開的程度 0～1 → 先快後慢滑開（關門時倒過來）
const mrtDoorEase = k => 1 - Math.pow(1 - Math.max(0, Math.min(1, k)), 2);
function drawMrtTrain(ctx, tr, part) {
  const T = MRT_TRAIN, inside = mrtTrainImg(T.inside), outer = mrtTrainImg(T.outerDoor.file), far = mrtTrainImg(T.farDoor.file);
  const shift = tr.off * tr.dir, open = mrtDoorEase(tr.door);
  ctx.save();
  ctx.beginPath(); ctx.rect(tr.clipL, tr.top - 2 * CELL, tr.clipR - tr.clipL, tr.bottom - tr.top + 4 * CELL); ctx.clip();
  for (const car of tr.cars) {
    const shell = tileImage(car.tile); if (!shell) continue;
    const k = car.w / shell.naturalWidth;   // 原圖像素 → 畫面像素
    ctx.save();
    ctx.translate(car.x + shift, car.y);
    if (car.stamp.fx) { ctx.translate(car.w, 0); ctx.scale(-1, 1); }
    ctx.scale(k, car.h / shell.naturalHeight);
    if (!part || part === 'back') {
      if (far) drawMrtDoors(ctx, far, T.farDoor, tr.bothDoors ? open : 0);
      if (inside) ctx.drawImage(inside, 0, 0);
    }
    if (part !== 'back') {
      // 外側門口那幾欄（格子圖最下面一排的 D）：'frontDoor' 只畫這幾欄、'front' 畫其他部分
      ctx.save();
      if (part) {
        const L = mrtCarLayout(car.kind), bottom = L[L.length - 1] || '', colW = shell.naturalWidth / bottom.length;
        ctx.beginPath();
        if (part === 'front') ctx.rect(0, 0, shell.naturalWidth, shell.naturalHeight);
        for (let c = 0; c < bottom.length; c++) if (bottom[c] === 'D') ctx.rect(c * colW, 0, colW, shell.naturalHeight);
        ctx.clip(part === 'front' ? 'evenodd' : 'nonzero');
      }
      if (outer) drawMrtDoors(ctx, outer, T.outerDoor, open);
      ctx.drawImage(shell, 0, 0);
      ctx.restore();
    }
    ctx.restore();
  }
  ctx.restore();
}
// 一節車廂的三個門：左右兩片各自往外滑，只畫在門洞裡（原圖像素座標）
function drawMrtDoors(ctx, img, D, open) {
  const [ax, ay, aw, ah] = D.art, half = aw / 2, slide = half * open;
  for (const hx of D.x) {
    const dx = hx + D.w / 2 - (ax + half), dy = D.y - ay;   // 門板中線對門洞中線、上緣對上緣
    ctx.save();
    ctx.beginPath(); ctx.rect(hx, D.y, D.w, D.h + 2); ctx.clip();
    if (open < 1) {
      ctx.drawImage(img, ax, ay, half, ah, ax + dx - slide, ay + dy, half, ah);            // 左片
      ctx.drawImage(img, ax + half, ay, half, ah, ax + half + dx + slide, ay + dy, half, ah); // 右片
    }
    ctx.restore();
  }
}
