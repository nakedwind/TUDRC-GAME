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
     在隧道裡黑一陣子、搖晃（rideTime），再載著大家開進站、停好開門。搭車時車上的人不能動。
     互通的捷運站（data/mrt-train.js 的 stations）：從其中一站搭車，會隨機開到「另一個」車站（換地圖，車上的隊員一起過去）；
       不在名單裡的地圖照舊開回同一站。每站的到站音樂也在 stations 設（arrive）。
     沒搭上車的隊員：留在原本那站，nextTrainTime 秒（預設 2 分鐘）後搭下一班車到溫特這站（隊員欄顯示「正在搭下班車」倒數）。
     溫特沒上車、隊員不小心留在車上：隊員跟著列車開走，nextTrainTime 秒後搭車回站（隊員欄顯示「不小心搭上車」倒數）。
       時間到了以後，等下一班車進站時從車上走下來；在沒有捷運的地圖就直接回到營地；回應變中心就全員歸隊。
     發電機：捷運站裡的發電機（js/storage-lockers.js 的 dynamo）全部打開之前，列車停在月台、車門關著不動（狀態 idle）；
       全部打開後開門、照常一班一班來（mrtPowered）。溫特還在車上時不會關門停住（避免被關在車裡出不去）。地圖上沒放發電機就不用開。
   車廂裡蓋的建築（燈、路障…，地雷除外）：列車開走時跟著車廂一起走（燈光也跟著動），下次停好時放回原本的格子。
     溫特不在車上 → 留在車上的怪物、場景 NPC 先被請下車（放到門外月台），列車才開走；隊員會被載走（見上面）。
   （數值在物件編輯器的「🚇 捷運列車」調，存在 data/mrt-train.js；下面 MRT_TRAIN 是沒有設定檔時的預設）
*/
const MRT_TRAIN = {
  cars: { tile_mrt_train_car_head: 'head', tile_mrt_train_car_middle: 'middle', tile_mrt_train_car_head_red: 'head', tile_mrt_train_car_middle_red: 'middle' },
  // 別種顏色的列車（車頭圖章的 id → 這班車用的中段車廂、車門圖、搭上車開去哪張地圖）。設定在 data/mrt-train.js 的 variants
  //   dest：搭這班車一律開到這張地圖（不照 stations 隨機）；別站的車開進這站時不會挑這班車
  variants: {},
  middleTile: 'tile_mrt_train_car_middle',   // 車頭後面自動接的車廂
  maxCars: 9,           // 車頭後面最多接幾節
  railTile: 'tile_mrt_rail_track',
  inside: 'images/捷運車站/mrt-train-car-middle-bg.png',   // 車廂內部（車頭、中段共用）
  // 門的圖、要對到的門洞（原圖像素，車廂圖是 1040×160）：
  //   x：三個門洞的左緣；y、w、h：門洞的上緣、寬、高；art：門的圖裡門板的範圍（x、y、w、h）
  outerDoor: { file: 'images/捷運車站/mrt-train-door.png',   x: [132, 468, 804], y: 59, w: 112, h: 87, art: [2, 16, 116, 87] },
  farDoor:   { file: 'images/捷運車站/mrt-train-door-2.png', x: [113, 449, 785], y: 15, w: 112, h: 84, art: [3, 17, 114, 86] },
  firstWait: 3,         // 開始戰鬥後幾秒來第一班
  monsterChance: .3,    // 地圖編輯器勾了「會載怪物」的列車：每班到站有多少機率載怪物（0～1）
  monsterMin: 2, monsterMax: 4,   // 載怪物時一班幾隻（隨機；怪物種類照這張地圖的怪物比例）
  firstStagger: 15,     // 第一班錯開：每台車再多等 0～這麼多秒（隨機），不會全部同時到站；發電機全開時也照這個一台一台陸續開門
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
  powerOnShake: 4,      // 捷運站發電機全部打開那一刻，畫面震一下的強度（js/storage-lockers.js 呼叫 mrtPowerOnFx）
  powerOnHumDelay: 1.5, // 全部打開後幾秒播「台北捷運(白噪音) 02」（音效編輯器裡的 mrtPowerHum；先讓發電機發動聲響一下）
  doorPassAt: .7,       // 車門開到幾成才走得過去
  sounds: { arrive: 'mrtArrive', open: 'mrtDoorOpen', departWarn: 'mrtDepartWarn', warn: 'mrtDoorWarn', close: 'mrtDoorClose', depart: 'mrtDepart' },   // 音效編輯器裡的名稱
  soundGain: .55,
  arriveFullCells: 3,   // 到站音樂：離列車幾格以內最大聲
  arriveFadeCells: 30,  // 到站音樂：離列車幾格完全聽不到（中間越遠越小聲；音樂播的時候一直跟著調）
  arriveMergeCells: 60, // 到站音樂：兩台車相距不到幾格，同時到站只播一首（建議＝完全聽不到的格數×2，任何地方都不會同時聽到兩首）
  stations: [],         // 互通的捷運站 [{ map: 地圖 id, name: 名稱（只是方便看）, arrive: 這站的到站音樂（音效編輯器裡的名稱） }]
  nextTrainTime: 120,   // 沒搭上車／不小心搭上車的隊員，幾秒後搭下一班車到站
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
// 列車在幾樓：照車頭那張圖的樓層（地圖編輯器選物件的「🏢 樓層」，或放在 2 樓圖層）。
// 擋路格加在一樓的牆裡，停在 2 樓時靠 js/maploader.js 的 objectWallOn2F 擋 2 樓的人；薄牆照樓層分開（js/pathfinding.js 的 setExtraEdges）
const mrtTrainFloor = tr => tr && tr.cars && tr.cars[0] && typeof stampDrawFloor === 'function' ? stampDrawFloor(tr.cars[0].stamp) : 1;
function mrtTrainRestoreCleared(tr) {
  const solid = new Set((MAP && MAP.solid) || []);
  for (const k of tr.cleared || []) if (solid.has(k)) mapWalls.add(k);   // 只放回這張地圖本來畫的牆
  tr.cleared = [];
  // 2 樓的列車：軌道用「🚧 2樓碰撞」擋（MAP.solid2），列車停著時拿掉的那幾格放回去
  const solid2 = new Set((MAP && MAP.solid2) || []);
  for (const k of tr.cleared2 || []) if (solid2.has(k) && typeof floor2Solid !== 'undefined') floor2Solid.add(k);
  tr.cleared2 = [];
  // 2 樓的列車：停著時暫時當成 2 樓地面的車內格子，拿掉（列車開走、門開關時重算）
  // （換地圖後這兩份會換成新的一份：只還原到當初改的那一份，不會弄到新地圖）
  if (typeof deckCells !== 'undefined' && tr.deckRef === deckCells) for (const k of tr.addedDeck || []) deckCells.delete(k);
  tr.addedDeck = [];
  if (typeof floor2WallFace !== 'undefined' && tr.faceRef === floor2WallFace) for (const k of tr.clearedFace || []) floor2WallFace.add(k);   // 拿掉的平台邊緣牆面放回去
  tr.clearedFace = [];
}
function mrtTrainApplyEdges() {
  const all = new Set(), up = new Set();   // all：擋一樓的人；up：停在 2 樓的列車（例如 B56 上面那班），只擋 2 樓的人
  for (const tr of (G && G.mrtTrains) || []) for (const k of tr.edges || []) (mrtTrainFloor(tr) === 2 ? up : all).add(k);
  if (typeof setExtraEdges === 'function') setExtraEdges(all, up);
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
    const variant = (MRT_TRAIN.variants || {})[head.stamp.id] || null;   // 別種顏色的列車（例如 O666 的紅色列車）
    if (variant) [variant.outerDoor, variant.farDoor].filter(Boolean).forEach(mrtTrainImg);
    // 車頭後面自動接的車廂（車頭朝右就往左接）
    const midTile = mapTileById((variant && variant.middle) || MRT_TRAIN.middleTile), extra = Math.min(MRT_TRAIN.maxCars, Math.max(0, Math.floor(+head.stamp.cars || 0)));
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
    G.mrtTrains.push({ cars, dir, variant, bothDoors: cars.some(c => c.stamp.bothDoors),
      monsterCar: cars.some(c => c.stamp.mrtMonsters),   // 地圖編輯器勾了「會載怪物」：到站時有機率載怪物下車
      fixed: cars.some(c => c.stamp.mrtFixed),           // 地圖編輯器勾了「停著不動（通道）」：一直停在月台，發電機全開後門一直開著
      clipL, clipR, top, bottom, x: (left + right) / 2, y: bottom,
      inDist: Math.max(0, inDist) + CELL, outDist: Math.max(0, outDist) + CELL,
      state: 'away', t: MRT_TRAIN.firstWait + Math.random() * (MRT_TRAIN.firstStagger || 0), off: 0, door: 0, soundId: 'mrt-train-' + head.stamp.c + ',' + head.stamp.r,
      walls: [], edges: [], cleared: [], solidKey: '' });
  }
  setupMrtGates();
}
// ---- 軌道、列車停靠範圍：這一格是不是（順順宮帽等「不能出現在軌道上、車廂裡」的東西用；js/hangi-bao.js）----
// 軌道＝地圖上鋪了軌道素材（圖檔 mrt-rail-track*.png：一般軌道、有雜物的軌道、mrt-rail-track25…，大圖或格子小圖都算）蓋到的格子；
// 列車＝每班列車停好時車廂蓋住的格子（不管現在車在不在站上）。換地圖、重開時自動重算
const MRT_RAIL_FILE = /\/mrt-rail-track[^/]*\.png$/i;
let mrtTrackCache = { map: null, trains: null, set: new Set() };
function mrtTrackCells() {
  const trains = (G && G.mrtTrains) || null;
  if (mrtTrackCache.map === MAP && mrtTrackCache.trains === trains) return mrtTrackCache.set;
  const set = new Set(), isRail = id => { const t = id && mapTileById(id); return !!t && (id === MRT_TRAIN.railTile || MRT_RAIL_FILE.test(String(t.file || ''))); };
  for (const s of (MAP && MAP.stamps) || []) {
    if (!isRail(s.id)) continue;
    const t = mapTileById(s.id), c0 = s.c + Math.round((s.ox || 0) / CELL), r0 = s.r + Math.round((s.oy || 0) / CELL);
    const w = typeof mapStampW === 'function' ? mapStampW(s, t) : mapTileW(t), h = typeof mapStampH === 'function' ? mapStampH(s, t) : mapTileH(t);
    for (let dc = 0; dc < w; dc++) for (let dr = 0; dr < h; dr++) set.add((c0 + dc) + ',' + (r0 + dr));
  }
  for (const L of Object.values((MAP && MAP.layers) || {})) for (const k in L) if (isRail(L[k])) set.add(k);
  for (const tr of trains || []) for (const car of tr.cars) for (const x of mrtCarCells(car).cells) {
    const cx = OX + x.c * CELL;
    if (cx >= tr.clipL - 1 && cx + CELL <= tr.clipR + 1) set.add(x.c + ',' + x.r);   // 隧道裡（畫面外）的車廂不算
  }
  mrtTrackCache = { map: MAP, trains, set };
  return set;
}
const mrtTrackCell = (c, r) => mrtTrackCells().has(c + ',' + r);
// 視線、子彈能不能穿過這格：軌道上的碰撞格只擋走路（人不能跳下軌道），不擋射擊，隔著軌道可以打到對面月台的怪物。
// 列車停在站上（車廂擋路格加好了）時，車廂蓋住的格子照樣擋（js/maploader.js 的 lineOfSightRaw 呼叫）
function mrtSeeThroughCell(c, r) {
  if (!mrtTrackCell(c, r)) return false;
  const k = c + ',' + r;
  return !((G && G.mrtTrains) || []).some(tr => tr.solidKey && tr.cover && tr.cover.has(k));
}

// 這站的列車能不能開：捷運站裡放了發電機，就要全部打開（js/storage-lockers.js）；沒放發電機、或不是捷運站的地圖一律可以
function mrtPowered() {
  if (!MAP || typeof dynamoCount !== 'function' || typeof dynamoStationMap !== 'function' || !dynamoStationMap(MAP)) return true;
  const [on, total] = dynamoCount();
  return total === 0 || on === total;
}
// 捷運站的發電機「最後一台」打開的那一刻（js/storage-lockers.js 呼叫；發動聲 dynamoStart 由那邊播）：
// 畫面稍微震一下，過 powerOnHumDelay 秒再播一次「台北捷運(白噪音) 02」（mrtPowerHum，不循環）。
// 強度、秒數在 data/mrt-train.js（powerOnShake、powerOnHumDelay）；音量在音效編輯器調
function mrtPowerOnFx() {
  const T = MRT_TRAIN;
  if (typeof addShake === 'function' && T.powerOnShake > 0) addShake(T.powerOnShake);
  const mapId = MAP && MAP.id;
  setTimeout(() => { if (MAP && MAP.id === mapId) sfx('mrtPowerHum'); }, Math.max(0, Number(T.powerOnHumDelay) || 0) * 1000);   // 這段時間換了地圖就不播
}
// 接續「保留進度」、劇情看完回原地圖（mapWalls 整份換回來，js/combat-progress.js 的 reclaimAddedWalls）：照每班車記的格子湊回總表
function restoreMrtTrains() {
  mrtTrainWalls = new Set();
  for (const tr of (G && G.mrtTrains) || []) for (const k of tr.walls || []) mrtTrainWalls.add(k);   // 閘門：下一幀照列車現在的狀態重新開關
  if (typeof floor2Solid !== 'undefined') for (const tr of (G && G.mrtTrains) || []) for (const k of tr.cleared2 || []) floor2Solid.delete(k);   // 停在 2 樓的列車：車廂底下的 2 樓碰撞照舊拿掉
  mrtTrainApplyEdges();
}

// ===== 月台閘門（閘門讀卡機）：捷運停好、車門打開才可以通過 =====
// 地圖上放在列車旁邊（左右跟列車停的位置重疊、上下離列車 2 格以內）的「閘門讀卡機」「閘門讀卡機（小）」會跟那班車連動。
// 擋路規則（每一格）：
//   ・列車沒停在站上（還沒來、進站中、開走了）：閘門圖片最下面那一排全部擋住（軌道上空著也不能走過去）
//   ・列車停好了：跟車廂重疊的格子交給列車自己管（車門、車廂走道）；月台那側的格子照車門開關——車門開到可以走才打開
// 畫：兩片門板跟著車門一起往左右滑開，收進閘門兩側（drawMrtCardGate）
// 在月台邊（上下離列車 2 格以內）、但左右超出列車停車範圍的閘門：車廂停不到，永遠不會開，一律關著擋路。
// 完全不靠近任何列車的閘門照原本的樣子（只看地圖編輯器畫的紅格）。
const MRT_GATE_TILES = new Set(['tile_mrt_gate_card_readers', 'tile_mrt_gate_card_readers_small']);
const MRT_GATE = { link: 2, slide: .42 };   // link：離列車幾格內算同一班；slide：門板打開時往外滑多遠（閘門寬度的幾成，每片門板是一半寬）
let mrtGateCells = new Set();   // 所有閘門管的格子（換地圖、重開時先還原成地圖原本的樣子）
function setupMrtGates() {
  const drawn = new Set((MAP && MAP.solid) || []);
  for (const k of mrtGateCells) { if (drawn.has(k)) mapWalls.add(k); else mapWalls.delete(k); }
  mrtGateCells = new Set();
  const linked = new Set(), besidePlatform = new Map();   // 跟列車連動的閘門；在月台邊但車廂停不到的閘門（→ 它蓋到的格子）
  for (const tr of G.mrtTrains || []) {
    tr.gates = []; tr.gateKey = null;
    const trainCells = new Set();
    for (const car of tr.cars) for (const x of mrtCarCells(car).cells) trainCells.add(x.c + ',' + x.r);
    const rows = [...trainCells].map(k => +k.split(',')[1]), top = Math.min(...rows), bottom = Math.max(...rows);
    // 左右範圍：列車停好時實際佔的欄（軌道範圍外、看不到的車廂不算）——停車位置旁邊的閘門才連動
    const cols = [...trainCells].map(k => +k.split(',')[0]);
    const cL = Math.max(Math.min(...cols), Math.round((tr.clipL - OX) / CELL)), cR = Math.min(Math.max(...cols) + 1, Math.round((tr.clipR - OX) / CELL));
    tr.trainCells = trainCells;
    for (const s of MAP.stamps || []) {
      if (!MRT_GATE_TILES.has(s.id)) continue;
      const t = mapTileById(s.id); if (!t) continue;
      const w = mapStampW(s, t), h = mapStampH(s, t);
      // 圖片實際蓋到的格子（含方向鍵微調的 ox/oy）：格子中心在圖片範圍裡的才算
      const x0 = s.c + (s.ox || 0) / CELL, y0 = s.r + (s.oy || 0) / CELL;
      const cells = [];
      for (let c = Math.ceil(x0 - .5); c + .5 < x0 + w; c++) for (let r = Math.ceil(y0 - .5); r + .5 < y0 + h; r++) if (inGrid(c, r)) cells.push(c + ',' + r);
      if (!cells.length) continue;
      const cs = cells.map(k => +k.split(',')[0]), rs = cells.map(k => +k.split(',')[1]);
      // 擋路只擋圖片最下面那一排（門腳站的地方）：上面那排是門的上半身，人可以走到門前、被門的圖遮住一點，跟其他物件「最下排擋路」一樣
      const footRow = Math.max(...rs), foot = cells.filter(k => +k.split(',')[1] === footRow);
      if (Math.min(...rs) > bottom + MRT_GATE.link || Math.max(...rs) < top - MRT_GATE.link) continue;   // 上下離這班車太遠：不在這個月台
      if (Math.max(...cs) < cL || Math.min(...cs) >= cR) { besidePlatform.set(s, foot); continue; }   // 在月台邊、但超出列車停的範圍：車廂停不到
      linked.add(s);
      foot.forEach(k => mrtGateCells.add(k));
      tr.gates.push({ stamp: s, cells: foot, added: new Set(), cleared: new Set(), below: Math.max(...rs) > bottom });   // below：閘門在列車下面（推人時往下推）
    }
  }
  // 車廂停不到的閘門（沒跟任何一班車連動）：一直關著，蓋到的格子都擋（重開、換地圖時跟其他閘門一樣先還原）
  for (const [st, cells] of besidePlatform) {
    if (linked.has(st)) continue;
    for (const k of cells) { mrtGateCells.add(k); mapWalls.add(k); }
  }
}
// 每幀（列車更新擋路格的前後各一次）：照列車狀態算每一格該不該擋。前一次：列車剛停好時先把閘門加的牆拿掉，列車才記得到自己的牆；
// 後一次：列車剛開走、拿掉自己的牆之後，閘門再把軌道上那幾格擋回來
// 地圖上手畫的紅格（MAP.solid）整理成一份好查的清單：同一張地圖只整理一次
// （以前每一幀、每個閘門都重新整理一次，捷運站有七千多個紅格，會拖慢畫面）
let mrtDrawnSolidCache = { list: null, n: -1, set: new Set() };
function mrtDrawnSolid() {
  const list = (MAP && MAP.solid) || [];
  if (mrtDrawnSolidCache.list !== list || mrtDrawnSolidCache.n !== list.length) mrtDrawnSolidCache = { list, n: list.length, set: new Set(list) };
  return mrtDrawnSolidCache.set;
}
function updateMrtGates(tr) {
  if (!tr.gates || !tr.gates.length) return;
  const key = mrtTrainSolidState(tr), present = !!key, open = key === 'open';
  const drawn = mrtDrawnSolid();
  let changed = false;
  const newlyBlocked = new Set();
  for (const g of tr.gates) for (const k of g.cells) {
    const onTrain = tr.trainCells.has(k);
    const want = !present || (!onTrain && !open);   // 這格現在要不要由閘門擋
    if (want) {
      if (g.cleared.has(k)) { mapWalls.add(k); g.cleared.delete(k); changed = true; newlyBlocked.add(k); }
      if (!mapWalls.has(k)) { mapWalls.add(k); g.added.add(k); changed = true; newlyBlocked.add(k); }
    } else {
      if (g.added.has(k)) { mapWalls.delete(k); g.added.delete(k); changed = true; }
      if (open && !onTrain && drawn.has(k) && mapWalls.has(k)) { mapWalls.delete(k); g.cleared.add(k); changed = true; }   // 月台那側畫了紅格的：開門時也打開
    }
  }
  if (!changed) return;
  if (tr.gateKey === 'open' && !open) {   // 剛關上：站在閘門上的人推到閘門外面（月台那一側），被擋住就推到另一邊
    for (const a of mrtTrainActors()) {
      const k = mrtCellKey(a); if (!newlyBlocked.has(k)) continue;
      const g = tr.gates.find(x => x.cells.includes(k));
      const [c, r] = k.split(',').map(Number), rs = g.cells.map(x => +x.split(',')[1]);
      const out = g.below ? Math.max(...rs) + 1 : Math.min(...rs) - 1, back = g.below ? Math.min(...rs) - 1 : Math.max(...rs) + 1;
      a.y = OY + ((!isWall(c, out) ? out : back) + .5) * CELL; a.navPath = null; a.navGoal = null;
    }
  }
  tr.gateKey = key;
  if (typeof computeFlow === 'function') computeFlow();
  for (const a of [...G.towers, ...G.npcs, ...G.enemies]) { a.navPath = null; a.navGoal = null; a.navFailed = false; }
}
// 閘門開了幾成（0＝關著、1＝全開）：跟著車門一起動
function mrtCardGateOpen(s) {
  if (typeof G === 'undefined' || !G || !G.mrtTrains) return null;
  for (const tr of G.mrtTrains) if (tr.gates && tr.gates.some(g => g.stamp === s)) {
    if (['away', 'arrive', 'depart', 'tunnel'].includes(tr.state)) return 0;
    return Math.max(0, Math.min(1, tr.door / MRT_TRAIN.doorPassAt));   // 車門開到可以走的時候，閘門剛好全開
  }
  return null;
}
// 畫連動的閘門（js/maploader.js 的 drawMapStampPlain）：圖片左右各一片門板，打開時各自往外滑、收進閘門兩側（超出圖片範圍的不畫）。
// 回傳 false＝不是連動的閘門，照一般圖片畫
function drawMrtCardGate(ctx, s, img, x, y, w, h) {
  if (!MRT_GATE_TILES.has(s.id)) return false;
  const open = mrtCardGateOpen(s); if (open == null) return false;
  if (!img.naturalWidth) return false;
  const k = open * open * (3 - 2 * open), travel = w * MRT_GATE.slide * k, sw = img.naturalWidth, sh = img.naturalHeight;
  ctx.save(); ctx.imageSmoothingEnabled = false;
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.drawImage(img, 0, 0, sw / 2, sh, x - travel, y, w / 2, h);
  ctx.drawImage(img, sw / 2, 0, sw / 2, sh, x + w / 2 + travel, y, w / 2, h);
  ctx.restore();
  return true;
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
    const open = key === 'open', far = open && tr.bothDoors, up = mrtTrainFloor(tr) === 2 && typeof floor2Solid !== 'undefined';
    const type = new Map();
    let rMax = -Infinity, rMin = Infinity;
    // 超出軌道範圍（隧道裡、畫面上看不到）的車廂格子不算：不然看不到的車廂會在旁邊的手扶梯上造出看不見的牆和地板
    for (const car of tr.cars) for (const x of mrtCarCells(car).cells) {
      const cx = OX + x.c * CELL;
      if (cx < tr.clipL - 1 || cx + CELL > tr.clipR + 1) continue;
      type.set(x.c + ',' + x.r, x.t); rMax = Math.max(rMax, x.r); rMin = Math.min(rMin, x.r);
    }
    const pass = t => t === '.' || t === 'D' || (t === 'F' && far);
    for (const [k, t] of type) {
      const [c, r] = k.split(',').map(Number);
      if (!pass(t)) { if (inGrid(c, r) && !mapWalls.has(k)) { mapWalls.add(k); mrtTrainWalls.add(k); tr.walls.push(k); } continue; }
      tr.floor.push(k);
      if (mapWalls.has(k)) { mapWalls.delete(k); tr.cleared.push(k); }   // 軌道上的碰撞格：列車停著時是車內地板
      if (up && floor2Solid.has(k)) { floor2Solid.delete(k); (tr.cleared2 ||= []).push(k); }   // 2 樓的列車：軌道上的 2 樓碰撞也一樣
      // 2 樓的列車：車內走得進去的格子都要算「2 樓地面」，不然只有剛好疊在 2 樓月台上的那幾格走得過，
      // 隊員、怪物找路會把車廂其他地方（含車門）當成牆
      if (up && typeof deckCells !== 'undefined' && !deckCells.has(k)) { deckCells.add(k); (tr.addedDeck ||= []).push(k); tr.deckRef = deckCells; }
      // 2 樓平台邊緣自動算出來的牆面（js/map-levels.js 的 wallFaceCells）剛好落在車廂裡：列車停著時也拿掉，不然會把車廂切成兩半
      if (up && typeof floor2WallFace !== 'undefined' && floor2WallFace.has(k)) { floor2WallFace.delete(k); (tr.clearedFace ||= []).push(k); tr.faceRef = floor2WallFace; }
      // 走得進去的格子跟車外之間放薄牆：外側門口往下、對面通道往上，門開著時不擋
      const out = (cc, rr) => !type.has(cc + ',' + rr);
      if (out(c, r + 1) && !(t === 'D' && open)) tr.edges.push(c + ',' + r + ',B');
      if (out(c, r - 1) && !(t === 'F' && far)) tr.edges.push(c + ',' + (r - 1) + ',B');
      if (out(c - 1, r)) tr.edges.push((c - 1) + ',' + r + ',R');
      if (out(c + 1, r)) tr.edges.push(c + ',' + r + ',R');
    }
    tr.bottomRow = rMax; tr.topRow = rMin;
    tr.cover = new Set(type.keys());   // 停著的車廂蓋住的格子：擋視線、子彈（mrtSeeThroughCell）
    mrtTrainUnstick(tr, wasOff, type);
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
// 兩邊都有月台時（列車停在地圖中間）：推往比較近的那一邊。上方月台＝列車最上排再往上一格，下方月台＝列車正下方
// 門關上時站在對面通道（F，上方的門）裡的人：離上方月台比較近就推出去，離車內走道比較近才推進車裡
function mrtTrainUnstick(tr, toPlatform, type) {
  const walls = new Set(tr.walls), platformY = OY + (tr.bottomRow + 1.5) * CELL;
  const topY = OY + (tr.topRow - .5) * CELL;   // 上方月台（列車上緣外面那一格的中間）
  const free = (x, y) => { const [c, r] = cellAt(x, y); return inGrid(c, r) && !isWall(c, r); };
  const floor = tr.floor.map(k => k.split(',').map(Number));
  for (const a of mrtTrainActors()) {
    const [c, r] = cellAt(a.x, a.y);
    if (!walls.has(c + ',' + r)) continue;
    const upFirst = r - tr.topRow + 1 <= tr.bottomRow + 1 - r;   // 往上推出去比較近（一樣近也往上，人原本就是從上面走進來的）
    if (toPlatform || !floor.length) a.y = upFirst && free(a.x, topY) ? topY : platformY;
    else if (type && type.get(c + ',' + r) === 'F' && r - tr.topRow + 1 <= tr.bottomRow - r && free(a.x, topY)) a.y = topY;   // 上方車門關上：推回上方月台
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
// 列車開走前（溫特不在車上）：還在車上的怪物、場景 NPC 請下車（放到列車正下方的月台）；隊員不請下車，會被列車載走（mrtTrainBoard）
function mrtTrainUnload(tr) {
  const platformY = OY + (tr.bottomRow + 1.5) * CELL;
  for (const a of mrtTrainActors()) if (a !== G.player && (!G.towers.includes(a) || a.mrtArrivedOn === tr.soundId) && mrtOnTrain(tr, a)) { a.y = platformY; a.navPath = null; a.navGoal = null; }   // 坐這班車來、還沒走下車的隊員也請下車
  for (const t of G.towers) if (t.mrtArrivedOn === tr.soundId) delete t.mrtArrivedOn;
}
// 溫特在不在這班車上（tr.riders 也可能只有不小心搭上車的隊員、或搭下班車回來的隊員）
const mrtPlayerAboard = tr => !!(tr.riders && G.player && tr.riders.some(r => r.a === G.player));
// ---- 搭車：車上的人跟著列車一起動（a.mrtRide＝搭車中，溫特、隊員、怪物這時不自己動：js/game.js、js/sentry.js、js/enemy-ai.js）----
function mrtTrainBoard(tr) {
  for (const t of G.towers) if (t.mrtArrivedOn === tr.soundId) delete t.mrtArrivedOn;   // 跟溫特一起搭車：不用再請下車
  tr.riders = mrtTrainActors().filter(a => mrtOnTrain(tr, a)).map(a => {
    a.mrtRide = true; a.navPath = null; a.navGoal = null; a.moving = false;
    return { a, x: a.x - tr.off * tr.dir };
  });
}
function mrtTrainMoveRiders(tr) {
  for (const r of tr.riders || []) r.a.x = r.x + tr.off * tr.dir;
}
function mrtTrainGetOff(tr) {
  for (const r of tr.riders || []) {
    r.a.mrtRide = false; r.a.navPath = null; r.a.navGoal = null;
    // 坐這班車來的隊員：記下來（開走前還在車上就請下車，不會又被載走），改成跟隨護衛部隊長，自己走下車
    if (r.a !== G.player && G.towers.includes(r.a)) { r.a.mrtArrivedOn = tr.soundId; if (typeof setSentryEscort === 'function' && !r.a.berserk && r.a.hp > 0) setSentryEscort(r.a); }
  }
  tr.riders = null;
  if (mrtRiding) mrtRideFade(false);
}
// ---- 車廂裡蓋的建築：列車開走時拿出格子（不擋路），跟著車廂畫、燈光跟著動（o.artX）；停好時放回原本的格子 ----
function mrtTrainLoadCargo(tr) {
  const floor = new Set(tr.floor || []);
  tr.cargo = [];
  for (const o of G.obstacles) {
    if (o.isBase || o.mapSource || o.mrtCargo) continue;   // 地雷（trap）也跟著走
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
// 這顆地雷在哪一班列車上（停著時放在車廂地板上的、或跟著列車開走中的）；不在車上＝null
function mrtMineOnTrain(o) {
  for (const tr of (G && G.mrtTrains) || []) {
    if (tr.state === 'away') continue;
    if (o.mrtCargo ? !!(tr.cargo && tr.cargo.some(x => x.o === o)) : !!(tr.solidKey && tr.floor && tr.floor.includes(o.c + ',' + o.r))) return tr;
  }
  return null;
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

// ===== 捷運站互通、搭下班車的隊員 =====
const mrtStationOf = id => (MRT_TRAIN.stations || []).find(st => st && st.map === id) || null;
// 這站的到站音樂（stations 沒設就用音效編輯器的「捷運列車：到站音樂」）
function mrtArriveSound() { const st = MAP && mrtStationOf(MAP.id); return (st && st.arrive) || MRT_TRAIN.sounds.arrive; }
// 溫特搭車要開去哪：互通車站裡隨機一站（不是現在這站、地圖要存在）；現在這站不在名單裡、或沒有別站 → null（開回同一站）
function mrtPickDestination(tr) {
  if ((typeof PREVIEW !== 'undefined' && PREVIEW) || !MAP) return null;
  const fixed = tr && tr.variant && tr.variant.dest;   // 這班車有指定開去哪（data/mrt-train.js 的 variants）
  if (fixed && fixed !== MAP.id && mapIndexById(fixed) >= 0) return fixed;
  if (!mrtStationOf(MAP.id)) return null;
  const list = (MRT_TRAIN.stations || []).filter(st => st && st.map !== MAP.id && mapIndexById(st.map) >= 0);
  return list.length ? list[Math.floor(Math.random() * list.length)].map : null;
}
// 不在溫特身邊的隊員：{ type, t: 還要幾秒, why: 'missed'＝沒搭上車（搭下班車到站）| 'rode'＝不小心搭上車（搭車回站） }
// 換地圖也記得（不放在 G 裡）；回應變中心就清空（全員歸隊）。隊員欄（js/team.js 的 renderFieldSquadHud）照這份顯示倒數
let mrtAway = [];
function mrtAwayList() { return mrtAway; }
function mrtSendAway(t, why) {
  if (!t || !TYPES[t.type] || t.type === PLAYER_CHARACTER || mrtAway.some(m => m.type === t.type)) return;
  if (typeof vitalsMate === 'function') { const m = vitalsMate(t.type); m.hp = t.hp; m.taint = t.taint || 0; m.berserk = !!t.berserk; }   // HP、負荷照現在的帶走（回來時 spawnSentries 會套回去）
  mrtAway.push({ type: t.type, t: Math.max(1, +MRT_TRAIN.nextTrainTime || 120), why });
}
function updateMrtAway(dt) {
  if (!mrtAway.length || !G || G.over) return;
  for (const m of mrtAway) m.t = Math.max(0, m.t - dt);
  // 時間到了：這張地圖有捷運 → 等下一班車進站時從車上下來（mrtTrainBringBack）；沒有捷運的戰鬥地圖 → 直接回到營地
  if (!(G.mrtTrains && G.mrtTrains.length) && !MAP_SAFE) {
    const due = mrtAway.filter(m => m.t <= 0);
    if (!due.length) return;
    mrtAway = mrtAway.filter(m => m.t > 0);
    const back = mrtRejoin(due.map(m => m.type));
    if (back.length) systemNotice(back.map(t => TYPES[t.type].name).join('、') + '回到隊伍了');
  }
}
// 隊員回到隊伍：照出勤的方式生出來（HP、負荷用記下來的，js/vitals.js），回傳生出來的隊員
function mrtRejoin(types) {
  const have = new Set(G.towers.map(t => t.type)), team = typeof getTeam === 'function' ? getTeam() : types;
  const list = types.filter(id => TYPES[id] && !have.has(id) && team.includes(id) && id !== PLAYER_CHARACTER);
  if (!list.length) return [];
  const before = G.towers.length;
  spawnSentries(list);
  return G.towers.slice(before);
}
// 列車停在原位時車內地板（.）的格子中心：軌道看得到的範圍裡，離列車中間近的排前面
function mrtTrainSeats(tr) {
  const seats = [];
  for (const car of tr.cars) for (const x of mrtCarCells(car).cells) {
    const cx = OX + x.c * CELL;
    if (x.t !== '.' || cx < tr.clipL || cx + CELL > tr.clipR) continue;
    seats.push(center(x.c, x.r));
  }
  const xs = seats.map(p => p[0]), mid = xs.length ? (Math.min(...xs) + Math.max(...xs)) / 2 : tr.x;
  return seats.sort((a, b) => Math.abs(a[0] - mid) - Math.abs(b[0] - mid) || b[1] - a[1]);
}
// 把這些人放上車（搭車中，跟著列車動）
function mrtTrainSeatRiders(tr, actors) {
  const seats = mrtTrainSeats(tr);
  tr.riders = tr.riders || [];
  const f = mrtTrainFloor(tr) === 2 ? 2 : 1;   // 這班車停在幾樓
  actors.forEach((a, i) => {
    const [x, y] = seats[i % Math.max(1, seats.length)] || [tr.x, tr.bottom - CELL / 2];
    Object.assign(a, { mrtRide: true, navPath: null, navGoal: null, moving: false, y, x: x + tr.off * tr.dir });
    // 坐上車的人改成「這班車那一層」。不然從 B56（列車停在 2 樓）搭到 R89（列車停在 1 樓）時，人還記著 2 樓，
    // 下車走到 1 樓月台就會整個卡住：溫特走不動也不能放東西、隊員說「部隊長在 1 樓，找不到上下樓的路」
    if (hasFloors) { a.floor = f; a._fk = null; a.escSide = null; }
    if (a !== G.player) a.target = null;
    tr.riders.push({ a, x });
  });
}
// 列車進站前：搭下班車的隊員時間到了，就坐這班車來（停好開門後走下車）
function mrtTrainBringBack(tr) {
  if (MAP_SAFE || !mrtAway.some(m => m.t <= 0)) return;
  const due = mrtAway.filter(m => m.t <= 0);
  mrtAway = mrtAway.filter(m => m.t > 0);
  const back = mrtRejoin(due.map(m => m.type));
  if (!back.length) return;
  mrtTrainSeatRiders(tr, back);
  systemNotice(back.map(t => TYPES[t.type].name).join('、') + '搭的列車進站了');
}
// 溫特沒上車：留在車上的隊員跟著列車開走了 → 從隊伍裡拿掉，nextTrainTime 秒後搭車回站
function mrtTrainCarryAway(tr) {
  const gone = [];
  for (const r of tr.riders || []) {
    const t = r.a; t.mrtRide = false;
    if (!G.towers.includes(t)) continue;
    mrtSendAway(t, 'rode'); gone.push(t);
  }
  tr.riders = null;
  if (!gone.length) return;
  G.towers = G.towers.filter(t => !gone.includes(t));
  for (const t of gone) t.hp = 0;   // 怪物還瞄著他的話，當作不在了（HP 已經記下來，回來時照記下來的）
  const mins = Math.round((+MRT_TRAIN.nextTrainTime || 120) / 60);
  systemNotice(gone.map(t => TYPES[t.type].name).join('、') + '不小心搭上捷運了，約 ' + mins + ' 分鐘後回站', true);
}
// 溫特搭車開到另一站：沒搭上的隊員留下（搭下班車）、這張地圖的列車回到等車的樣子，換地圖後載著車上的隊員進站
function mrtRideToStation(tr, dest) {
  const riders = (tr.riders || []).map(r => r.a);
  const mates = riders.filter(a => G.towers.includes(a) && TYPES[a.type]).map(a => a.type);
  for (const t of G.towers) if (!riders.includes(t)) mrtSendAway(t, 'missed');
  // 這張地圖的列車整理好（之後走回來接續戰場時才正常）：車上的人放回月台、車廂裡的建築放回去、列車回到隧道裡等下一班
  const platformY = OY + ((tr.bottomRow != null ? tr.bottomRow : Math.round((tr.bottom - OY) / CELL) - 1) + 1.5) * CELL;
  for (const r of tr.riders || []) Object.assign(r.a, { mrtRide: false, x: r.x, y: platformY, navPath: null, navGoal: null });
  tr.riders = null;
  mrtTrainUnloadCargo(tr);
  Object.assign(tr, { state: 'away', t: MRT_TRAIN.waitMin + Math.random() * (MRT_TRAIN.waitMax - MRT_TRAIN.waitMin), off: -tr.inDist, door: 0, chimed: false, fadeT: 0 });
  mrtRideFade(true);
  mapTransitioning = true;
  Object.keys(keys).forEach(k => { keys[k] = false; });
  setTimeout(() => {
    if (typeof suspendLeavingBattle === 'function') suspendLeavingBattle();   // 這裡的戰場暫停，走回來接著打（js/combat-progress.js）
    if (!resumePausedBattle(dest)) { switchMap(mapIndexById(dest)); begin(false); }
    mrtArriveAtStation(mates);
    setTimeout(() => { mapTransitioning = false; }, 300);
  }, 400);
}
// 換到新車站之後：隨機一班列車載著溫特和同車的隊員，在隧道裡黑一陣子再進站
function mrtArriveAtStation(mates) {
  const trains = G.mrtTrains || [];
  for (const a of mrtTrainActors()) a.mrtRide = false;
  if (!trains.length) { mrtRideFade(false); return; }
  if (mates.length) mrtRejoin(mates);   // 接續的戰場裡沒有這位隊員：補上
  const crew = [G.player, ...mates.map(id => G.towers.find(t => t.type === id)).filter(Boolean)];
  const dog = (G.npcs || []).find(n => n.id === 'ball');   // 球球跟著部隊一起來
  if (dog) crew.push(dog);
  // 別站開過來：不挑被老鼠王卡住的車、不挑指定開去別處的車（例如 O666 的紅色列車）
  const normal = trains.filter(t => !(t.variant && t.variant.dest) && !(typeof ratKingBlocksTrain === 'function' && ratKingBlocksTrain(t)));
  const pick = normal.length ? normal : trains, tr = pick[Math.floor(Math.random() * pick.length)];
  Object.assign(tr, { riders: [], state: 'tunnel', off: -tr.inDist, door: 0, chimed: false, fadeT: 0,
    t: Math.max(MRT_TRAIN.arriveSoundLead + 1, MRT_TRAIN.rideTime * .6) });
  mrtTrainSeatRiders(tr, crew);
  mrtTrainUpdateSolid(tr);
  mrtRideFade(true);
  if (typeof updateCamera === 'function') updateCamera();
}
// 花蓮老鼠王血量歸零（js/rat-king.js）：這班車鳴笛、馬上從隧道衝進站（減速度 ×decelMul，所以進站比較快），撞飛老鼠王後照常停靠
function mrtRamArrive(tr, decelMul = 3) {
  if (!tr || tr.state !== 'away') return;
  mrtTrainBringBack(tr);
  tr.off = -tr.inDist; tr.door = 0; tr.chimed = true; tr.decelMul = decelMul;
  tr.state = 'arrive'; tr.v = Math.sqrt(2 * MRT_TRAIN.arriveDecel * decelMul * tr.inDist);
}
// 每次開始一張地圖（js/game.js 的 begin）：回應變中心＝全員歸隊；其他地圖：不在身邊的隊員先不出現
function mrtAwayOnBegin() {
  if (typeof MAP_SAFE !== 'undefined' && MAP_SAFE) { mrtAway = []; if (typeof dynamoForget === 'function') dynamoForget(); return; }   // 捷運站的發電機不會關回去（打開過就永遠開著，js/storage-lockers.js）
  if (!mrtAway.length || !G || !Array.isArray(G.towers)) return;
  const away = new Set(mrtAway.map(m => m.type));
  G.towers = G.towers.filter(t => !away.has(t.type));
}

// ---- 到站音樂：越遠越小聲、靠近的列車同時到站只播一首 ----
// 每一首正在播的到站音樂是一「組」：記著是哪幾台車的。新的一台車要播時，離某一組裡的車不到 arriveMergeCells 格，
// 就併進那一組、不另外播（不然好幾台車一起到站，同一首疊在一起像回音，綠線 8 台車最明顯）。
// 音量每一幀照「溫特離這一組裡最近那台車的最近一點」重算：arriveFullCells 格內最大聲，到 arriveFadeCells 格完全聽不到。
let mrtArriveGroups = [], mrtArriveSeq = 0;
// 兩台列車（整個月台範圍）之間最近相距幾格
function mrtTrainGap(a, b) {
  const dx = Math.max(0, a.clipL - b.clipR, b.clipL - a.clipR), dy = Math.max(0, a.top - b.bottom, b.top - a.bottom);
  return Math.hypot(dx, dy) / CELL;
}
// 這一組到站音樂現在該多大聲（0～soundGain）
function mrtArriveGain(group) {
  const p = G.player; if (!p) return 0;
  const T = MRT_TRAIN, full = T.arriveFullCells ?? 3, fade = Math.max(full + .1, T.arriveFadeCells ?? 30);
  let d = Infinity;
  for (const tr of group.trains) {
    const x = Math.max(tr.clipL, Math.min(tr.clipR, p.x)), y = Math.max(tr.top, Math.min(tr.bottom, p.y));   // 列車上離溫特最近的點
    d = Math.min(d, Math.hypot(x - p.x, y - p.y) / CELL);
  }
  const k = d <= full ? 1 : Math.max(0, (fade - d) / (fade - full));
  return T.soundGain * k;
}
function mrtPlayArrive(tr, name) {
  if (typeof SFX === 'undefined' || !SFX.isPlaying) return;
  mrtArriveGroups = mrtArriveGroups.filter(g => g.map === MAP && SFX.isPlaying(g.key));   // 播完的、別張地圖的不算
  const merge = MRT_TRAIN.arriveMergeCells ?? 60;
  const near = mrtArriveGroups.filter(g => g.name === name && g.trains.some(o => o === tr || mrtTrainGap(o, tr) < merge));
  if (near.length) {   // 附近已經在播同一首：併進去（最早開始播的那一組）
    const keep = near[0];
    if (!keep.trains.includes(tr)) keep.trains.push(tr);
    // 這台車剛好夾在兩組中間（兩組都靠得很近）：後來的那組淡出、車子併進最早那組，站在中間不會同時聽到兩首
    for (const g of near.slice(1)) { SFX.fadeOut(g.key, .5); keep.trains.push(...g.trains.filter(o => !keep.trains.includes(o))); }
    if (near.length > 1) mrtArriveGroups = mrtArriveGroups.filter(g => !near.slice(1).includes(g));
    return;
  }
  const group = { key: 'mrtArrive#' + (++mrtArriveSeq), name, map: MAP, trains: [tr] };
  SFX.play(name, Math.max(1e-4, mrtArriveGain(group)), group.key);   // 太遠也照樣開始播（音量幾乎 0），走近時從中間慢慢聽到
  mrtArriveGroups.push(group);
}
// 每一幀：照溫特現在的位置調整到站音樂的音量
function mrtArriveMusicTick() {
  if (!mrtArriveGroups.length || typeof SFX === 'undefined' || !SFX.setSourceGain) return;
  for (const g of mrtArriveGroups) if (g.map === MAP) SFX.setSourceGain(g.key, Math.max(1e-4, mrtArriveGain(g)));
}
function mrtTrainSound(tr, key) {
  const name = key === 'arrive' ? mrtArriveSound() : MRT_TRAIN.sounds[key], p = G.player;
  if (!name || typeof SFX === 'undefined' || !p) return;
  if (key === 'arrive') { mrtPlayArrive(tr, name); return; }
  // 整個月台都聽得到：用列車上離溫特最近的點算距離
  const x = Math.max(tr.clipL, Math.min(tr.clipR, p.x)), y = Math.max(tr.top, Math.min(tr.bottom, p.y));
  if (typeof sfxAt === 'function') sfxAt(name, x, y, MRT_TRAIN.soundGain, tr.soundId + '-' + key);
}

// ---- 載怪物的列車（地圖編輯器勾「會載怪物」的車廂）----
// 每班要開進站時抽一次：monsterChance 的機率載 monsterMin～monsterMax 隻；門開好時怪物出現在車門口、自己走下車
// 載著溫特進站的那班不載（不然溫特一下車就被包圍）；安全區不載
function mrtRollMonsters(tr) {
  const T = MRT_TRAIN;
  if (!tr.monsterCar || MAP_SAFE || mrtPlayerAboard(tr) || Math.random() >= (T.monsterChance ?? .3)) return 0;
  const lo = Math.max(0, Math.round(T.monsterMin ?? 2)), hi = Math.max(lo, Math.round(T.monsterMax ?? 4));
  return lo + Math.floor(Math.random() * (hi - lo + 1));
}
function mrtSpawnMonsters(tr, n) {
  if (!n || typeof createMonster !== 'function' || typeof chooseMonster !== 'function' || typeof ACTIVE_MONSTERS === 'undefined') return;
  // 出生點：每一扇車門的正中間，怪物才不會卡在門框上。
  //   下方車門＝最下面一排連在一起的門口格 D（往下走出去）；兩側都開的班次再加上方車門＝最上面一排的對面通道格 F（往上走出去）
  //   只挑門外是月台的門（門外是牆、地圖邊緣的不挑）：例如 B56 下面那班車貼著地圖下緣，怪物只會從上方車門出來
  const floorSet = new Set(tr.floor || []), f = mrtTrainFloor(tr), doorCells = { 1: [], '-1': [] }, inside = [];
  for (const car of tr.cars) for (const x of mrtCarCells(car).cells) {
    const k = x.c + ',' + x.r; if (!floorSet.has(k)) continue;
    if (x.t === 'D') doorCells[1].push([x.c, x.r]);
    else if (x.t === 'F' && tr.bothDoors && x.r === tr.topRow) doorCells[-1].push([x.c, x.r]);
    else inside.push([x.c, x.r]);
  }
  const outsideFree = (c, rr) => inGrid(c, rr) && !floorSet.has(c + ',' + rr) && !onFloorDo(f, () => isWall(c, rr));   // 車外這格是不是月台（照列車那一層的牆）
  const doors = [];
  for (const dir of [1, -1]) {
    const has = new Set(doorCells[dir].map(d => d.join(',')));
    for (const [c, r] of doorCells[dir].sort((a, b) => a[1] - b[1] || a[0] - b[0])) {
      if (has.has((c - 1) + ',' + r)) continue;   // 不是這扇門最左邊那格
      let w = 1; while (has.has((c + w) + ',' + r)) w++;
      const mc = c + Math.floor(w / 2);
      doors.push({ x: OX + (c + w / 2) * CELL, c: mc, r, dir, out: outsideFree(mc, r + dir) });
    }
  }
  const usable = doors.filter(d => d.out);
  const pick = usable.length ? usable : doors;   // 每扇門外面都是牆：照舊隨便挑一扇（怪物自己找路）
  if (!pick.length) for (const [c, r] of inside) pick.push({ x: center(c, r)[0], c, r, dir: 1 });
  if (!pick.length) return;
  for (let i = 0; i < n; i++) {
    const d = pick[Math.floor(Math.random() * pick.length)];   // 隨機挑一扇門
    const y = OY + (d.r + .5) * CELL;
    const m = createMonster(chooseMonster(MAP, ACTIVE_MONSTERS), d.x, y);
    if (hasFloors) m.floor = f === 2 ? 2 : 1;
    m.mrtFrom = tr.soundId;
    // 下車：從車門口直直走到月台上（車外 2 格；先照這扇門朝的方向，走不出去再試另一邊）
    for (const dir of [d.dir, -d.dir]) {
      const r1 = d.r + dir, r2 = d.r + dir * 2;
      if (!outsideFree(d.c, r1)) continue;
      m.mrtExit = { x: d.x, y: OY + ((outsideFree(d.c, r2) ? r2 : r1) + .5) * CELL, t: 3 }; break;   // 車外只剩一格（例如列車貼著地圖邊）：走出去一格就好
    }
    G.enemies.push(m);
  }
}
// 剛下車的怪物走一步（js/enemy-ai.js 的 stepEnemy 呼叫）：走到月台上、被擋住、或走超過 3 秒就結束，回傳 true＝這一幀由這裡處理完了
function mrtStepExit(e, dt) {
  const g = e.mrtExit;
  g.t -= dt;
  if (g.t <= 0 || Math.hypot(g.x - e.x, g.y - e.y) < 3) { delete e.mrtExit; return false; }
  if (!moveEnemyToward(e, g, dt)) { delete e.mrtExit; return false; }   // 被擋住：照平常的行為
  e.moving = true;
  return true;
}
// 狀態：away（看不到，等下一班）→ arrive（減速進站）→ opening → dwell（門開著）→ departWarn（離站警示音）→ warn（車門即將關閉）
//      → closing → closed → depart（加速離站）→ away
function updateMrtTrains(dt) {
  mrtArriveMusicTick();   // 到站音樂：越遠越小聲
  updateMrtAway(dt);   // 沒搭上車／不小心搭上車的隊員：倒數
  if (!G.mrtTrains || !G.mrtTrains.length) return;
  const T = MRT_TRAIN;
  // 發電機剛全部打開：停在月台的列車排好各自幾秒後開門（離溫特最近的那台馬上開，其他隨機錯開 0～firstStagger 秒）
  if (mrtPowered() && G.mrtTrains.some(tr => tr.state === 'idle' && tr.powerDelay == null)) {
    const p = G.player, idle = G.mrtTrains.filter(tr => tr.state === 'idle' && tr.powerDelay == null);
    const dist = tr => p ? Math.hypot(Math.max(tr.clipL, Math.min(tr.clipR, p.x)) - p.x, Math.max(tr.top, Math.min(tr.bottom, p.y)) - p.y) : 0;
    idle.sort((a, b) => dist(a) - dist(b)).forEach((tr, i) => { tr.powerDelay = i === 0 ? 0 : Math.random() * (T.firstStagger || 0); });
  }
  for (const tr of G.mrtTrains) {
    updateMrtGates(tr);   // 月台閘門：每幀先對一次（車還沒來的時候也要擋；下面等車的時候會直接跳過）
    tr.t -= dt;
    if (typeof ratKingBlocksTrain === 'function' && ratKingBlocksTrain(tr) && ['away', 'idle'].includes(tr.state)) {   // 軌道被花蓮老鼠王卡住：躲在隧道裡不進站，有沒有電都一樣（js/rat-king.js）
      tr.state = 'away'; tr.off = -tr.inDist; tr.door = 0; tr.t = Math.max(tr.t, T.arriveSoundLead + 1); tr.powerDelay = null; continue;
    }
    if (tr.fixed && tr.state === 'away') { tr.state = 'idle'; tr.off = 0; tr.door = 0; tr.chimed = false; }   // 通道列車：不會開走，一直停在月台
    if (tr.state === 'away' && !mrtPowered()) { tr.state = 'idle'; tr.off = 0; tr.door = 0; tr.chimed = false; }   // 還在等車時發現沒電（剛進地圖）：直接停在月台
    if (tr.state === 'idle') {   // 沒電：停在月台、門關著；發電機全部打開就開門，之後照常
      tr.off = 0; tr.door = 0;
      if (mrtPowered() && tr.powerDelay != null) tr.powerDelay -= dt;
      if (mrtPowered() && tr.powerDelay != null && tr.powerDelay <= 0) { tr.powerDelay = null; tr.state = 'opening'; tr.t = T.doorTime; mrtTrainSound(tr, 'open'); }
    } else if (tr.state === 'away') {
      tr.off = -tr.inDist; tr.door = 0;
      if (tr.t <= T.arriveSoundLead && !tr.chimed) { tr.chimed = true; mrtTrainSound(tr, 'arrive'); }
      if (tr.t > 0) continue;
      mrtTrainBringBack(tr);   // 搭下班車的隊員時間到了：坐這班車進站
      tr.monsterLoad = mrtRollMonsters(tr);   // 這班有沒有載怪物（幾隻）
      // 等減速：v0²＝2aD，整段 D 剛好停在原位
      tr.state = 'arrive'; tr.v = Math.sqrt(2 * T.arriveDecel * tr.inDist);
    } else if (tr.state === 'arrive') {
      tr.v = Math.max(0, tr.v - T.arriveDecel * (tr.decelMul || 1) * dt);   // decelMul：撞飛老鼠王那次衝得比較快（mrtRamArrive）
      tr.off = Math.min(0, tr.off + tr.v * dt);
      mrtTrainMoveRiders(tr);
      if (mrtPlayerAboard(tr) && mrtRiding && mrtPlayerInTunnel(tr, 'in')) mrtRideFade(false);   // 載著溫特進站：進到軌道範圍才亮回來
      if (tr.off >= -.5 || tr.v <= 0) { tr.off = 0; tr.decelMul = 0; mrtTrainMoveRiders(tr); mrtTrainGetOff(tr); mrtTrainUnloadCargo(tr); tr.state = 'opening'; tr.t = T.doorTime; mrtTrainSound(tr, 'open'); }
    } else if (tr.state === 'opening') {
      tr.door = 1 - Math.max(0, tr.t) / T.doorTime;
      if (tr.t <= 0) { tr.door = 1; tr.state = 'dwell'; tr.t = T.dwell; tr.monsterOut = !!tr.monsterLoad; }
    } else if (tr.state === 'dwell') {
      if (tr.fixed) tr.t = T.dwell;   // 通道列車：門一直開著，不會關門開走
      else if (tr.t <= 0) { tr.state = 'departWarn'; tr.t = T.departWarnTime; mrtTrainSound(tr, 'departWarn'); }
    } else if (tr.state === 'departWarn') {
      if (tr.t <= 0) { tr.state = 'warn'; tr.t = T.warnTime; mrtTrainSound(tr, 'warn'); }
    } else if (tr.state === 'warn') {
      if (tr.t <= 0) { tr.state = 'closing'; tr.t = T.doorTime; mrtTrainSound(tr, 'close'); }
    } else if (tr.state === 'closing') {
      tr.door = Math.max(0, tr.t) / T.doorTime;
      if (tr.t <= 0) { tr.door = 0; tr.state = 'closed'; tr.t = T.afterClose; }
    } else if (tr.state === 'closed') {
      if (tr.t <= 0 && !mrtPowered()) {   // 沒電開不走：停在月台；溫特在車上就重新開門讓他下車
        if (mrtOnTrain(tr, G.player)) { tr.state = 'opening'; tr.t = T.doorTime; mrtTrainSound(tr, 'open'); }
        else tr.state = 'idle';   // 溫特已經下車：關著門停在月台。還在車上的隊員會被關在裡面，這是故意的（要趕快找發電機救他們出來），不要放他們下車
      } else if (tr.t <= 0) {
        mrtTrainSound(tr, 'depart');
        if (mrtOnTrain(tr, G.player)) mrtTrainBoard(tr);   // 溫特在車上：車上的人跟著列車開走（搭車）
        else { mrtTrainUnload(tr); mrtTrainBoard(tr); if (!tr.riders.length) tr.riders = null; }   // 溫特不在車上：怪物請下車，留在車上的隊員被載走
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
      const aboard = mrtPlayerAboard(tr);
      if (aboard && !mrtRiding && mrtPlayerInTunnel(tr, 'out')) { mrtRideFade(true); tr.fadeT = 0; }   // 快開進隧道：畫面變黑
      if (aboard && mrtRiding) tr.fadeT = (tr.fadeT || 0) + dt;
      if (tr.off >= tr.outDist || (aboard && tr.fadeT > .6)) {   // 載著溫特：畫面黑了就直接算進隧道
        tr.chimed = false;
        const dest = aboard ? mrtPickDestination(tr) : null;
        if (dest) { mrtRideToStation(tr, dest); return; }   // 互通的捷運站：開到另一站（換地圖，這一幀後面的列車不用再更新）
        if (aboard) { tr.state = 'tunnel'; tr.t = T.rideTime; tr.fadeT = 0; mrtRideFade(true); }
        else {
          mrtTrainCarryAway(tr);   // 不小心搭上車的隊員：跟著列車走了，過一陣子才回站
          tr.state = 'away'; tr.t = T.waitMin + Math.random() * (T.waitMax - T.waitMin); tr.off = -tr.inDist;
        }
      }
    }
    if (mrtPlayerAboard(tr) && typeof addShake === 'function' && (tr.state === 'depart' || tr.state === 'arrive')) addShake(T.rideShake * .35);   // 坐在車上：輕輕晃
    if (tr.cargo) mrtTrainMoveCargo(tr);
    updateMrtGates(tr);   // 月台閘門：列車剛停好時先讓位
    mrtTrainUpdateSolid(tr);
    if (tr.monsterOut && tr.solidKey === 'open') { tr.monsterOut = false; mrtSpawnMonsters(tr, tr.monsterLoad); tr.monsterLoad = 0; }   // 門開好了：車上的怪物下車
    updateMrtGates(tr);   // 月台閘門：列車剛開走時把軌道擋回來
  }
}

// ---- 畫列車：跟角色一起排前後（js/render.js）----
// 後層（對面的門＋車廂內部）跟車廂上緣排；前層（外側的門＋外殼）排在車廂下緣往下 frontSortDy：
// 車內走道上的人（腳底最多到車廂下緣）會畫在兩層中間，月台上的人畫在最前面
function mrtTrainSortables(list) {
  for (const tr of G.mrtTrains || []) {
    if (tr.state === 'away') continue;
    const floor = mrtTrainFloor(tr);   // 列車在幾樓：照車頭那張圖的樓層
    list.push({ floor, y: tr.top, draw: () => drawMrtTrain(ctx, tr, 'back') });
    // 車廂裡的地雷：畫在車廂內部（後層）上面、人的下面
    const mines = (G.obstacles || []).filter(o => o.trap && mrtMineOnTrain(o) === tr);
    if (mines.length && typeof drawLandmine === 'function') list.push({ floor, y: tr.top + .5, draw: () => mines.forEach(o => drawLandmine(ctx, o)) });
    list.push({ floor, y: tr.bottom + MRT_TRAIN.frontSortDy, draw: () => drawMrtTrain(ctx, tr, 'front') });
    list.push({ floor, y: tr.bottom + MRT_TRAIN.doorSortDy, draw: () => drawMrtTrain(ctx, tr, 'frontDoor') });
  }
}
// 地圖上擺的物件（例如月台邊的閘門讀卡機、圍欄）底部剛好落在列車底邊附近時：
// 車殼排在底邊往下 frontSortDy、車門那幾欄排在底邊往下 doorSortDy，物件夾在兩者中間就會「車門處在前面、其他地方被車殼蓋住」，看起來破圖。
// 這種物件一律排到整個車殼前面（js/maploader.js 的 collectMapOccluders 會問這裡）。
function mrtMapItemSortY(it, y) {
  if (!G || !G.mrtTrains || it.part || it.floor === 2) return y;   // 2 樓的東西、上下拆開的柱子不管
  for (const tr of G.mrtTrains) {
    if (tr.state === 'away') continue;
    const lo = tr.bottom + Math.min(MRT_TRAIN.doorSortDy, MRT_TRAIN.frontSortDy), hi = tr.bottom + Math.max(MRT_TRAIN.doorSortDy, MRT_TRAIN.frontSortDy);
    if (y < lo || y > hi) continue;
    if (OX + it.x1 <= tr.clipL || OX + it.x0 >= tr.clipR || OY + it.y0 >= tr.bottom) continue;   // 不在軌道範圍、或整個在列車下面
    return hi + 0.5;
  }
  return y;
}
// 門開的程度 0～1 → 先快後慢滑開（關門時倒過來）
const mrtDoorEase = k => 1 - Math.pow(1 - Math.max(0, Math.min(1, k)), 2);
function drawMrtTrain(ctx, tr, part) {
  const T = MRT_TRAIN, V = tr.variant || {}, inside = mrtTrainImg(T.inside), outer = mrtTrainImg(V.outerDoor || T.outerDoor.file), far = mrtTrainImg(V.farDoor || T.farDoor.file);   // 別種顏色的列車用自己的車門圖
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
