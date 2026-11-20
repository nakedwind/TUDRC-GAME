/* ===== 固定牆與怪物尋路 =====
   固定牆 = 編輯地圖時放的、打不破的牆；怪物會自動繞過它。
   流場(flow) = 每一格「距離營地最短要走幾步」的地圖，怪物照著往數字小的方向走。
*/

// ---- 固定牆（地圖設計，跨局保留）----
let mapWalls = new Set();               // 存 'c,r' 字串
// ---- 樓層（陸橋）：地圖編輯器「🌉 2樓地面」「🛗 樓層出入口」畫的格子（MAP.deck、MAP.ramps）----
// 一樓＝平常的樣子（牆照 mapWalls 擋）。二樓＝只有「2樓地面」和「樓層出入口」的格子走得到，其他全是空的（掉下去的地方，走不進去）；
//   2 樓地面底下的牆（一樓的柱子、牆）不擋二樓的人；樓層出入口（手扶梯）不管幾樓都照 mapWalls 擋（扶手、隔板）。
// 換樓層：從「樓層出入口」走出去的那一步決定——走到 2 樓地面＝2 樓，走到其他格子＝1 樓。沒畫 2 樓地面的地圖完全不受影響。
// floorCtx＝現在在處理哪一層的人：game.js 的 update 處理每個角色前先設好（isWall、flowAt、邊緣碰撞都看它）。
let deckCells = new Set(), rampCells = new Set(), hasFloors = false, floorCtx = 1;
// 樓層出入口（樓梯、手扶梯）靠 2 樓那一半的格子：站在上面的人雖然還算一樓，畫面上先畫到 2 樓那一批（不會被 2 樓地板的圖蓋住）
let rampUpperCells = new Set();
function computeRampUpper() {
  rampUpperCells = new Set();
  const N = [[0, 1], [0, -1], [1, 0], [-1, 0]], dist = test => {   // 在樓層出入口的格子之間，離「符合 test 的鄰格」幾步
    const d = new Map(), q = [];
    for (const k of rampCells) { const [c, r] = k.split(',').map(Number); if (N.some(([dc, dr]) => { const n = (c + dc) + ',' + (r + dr); return !rampCells.has(n) && test(n); })) { d.set(k, 0); q.push(k); } }
    for (let h = 0; h < q.length; h++) { const [c, r] = q[h].split(',').map(Number); for (const [dc, dr] of N) { const n = (c + dc) + ',' + (r + dr); if (rampCells.has(n) && !d.has(n)) { d.set(n, d.get(q[h]) + 1); q.push(n); } } }
    return d;
  };
  const up = dist(n => deckCells.has(n)), down = dist(n => !deckCells.has(n) && !mapWalls.has(n));
  for (const k of rampCells) if ((up.get(k) ?? Infinity) <= (down.get(k) ?? Infinity)) rampUpperCells.add(k);
}
// 2 樓碰撞（地圖編輯器的「🚧 2樓碰撞」筆刷，存在 MAP.solid2）：只擋 2 樓的人，1 樓照常走。
// 1 樓的紅格（MAP.solid）跟它分開，只擋 1 樓
let floor2Solid = new Set();
// 2 樓擋路格的像素微調（地圖上用方向鍵微調過位置、有自帶碰撞格的物件，js/prop-collisions.js）：跟一樓的 mapSolidOffsets 一樣，記每格偏了幾像素
let floor2SolidOffsets = {};
const solid2OffsetAt = (c, r) => floor2SolidOffsets[c + ',' + r];
// 2 樓的人還會被「2 樓的物件加的牆」擋住（置物箱、候車椅、門…這些程式都是把擋路格加進一樓的牆 mapWalls）：js/maploader.js 的 objectWallOn2F
// 平台邊緣那排牆的牆面（js/map-levels.js 的 wallFaceCells）：就算地圖上畫成 2 樓地面，2 樓的人也走不進去，不會站到牆面上
let floor2WallFace = new Set();
function setMapWallFaces(cells) { floor2WallFace = new Set(cells || []); }
// 1 樓的人自動擋住的格子（只有 2 樓的格子；js/map-levels.js 的 auto1FWalls）：
// 只擋 1 樓的人，跟一樓紅格 mapWalls 分開放（不然 2 樓的物件牆判定、燈光都會被影響）
let floor1Auto = new Set();
function setMapFloor1Auto(cells) { floor1Auto = new Set(cells || []); }
// ---- 牆只有一份：紅格（含方向鍵微調後的位置）＋素材橘框 ----
// 撞牆（走路）照紅格「微調後的方塊」和橘框擋（js/maploader.js 的 solidBlocksPoint），用的是原始的紅格 wall1FRaw。
// 找路（隊友、怪物、出生點、蓋建築…所有問「這格是不是牆」isWall 的地方）不另外存一份，而是照同樣的牆算出來：
//   這一格的正中間（角色站的地方）有沒有被微調後的紅格或橘框蓋住。紅格被微調到隔壁格，找路就當隔壁那格是牆、原本那格空出來。
//   這樣不管紅格怎麼微調，走路和找路看到的牆都一樣，不會出現「找路以為走得過、走過去卻撞牆卡住」。
const wall1FRaw = k => mapWalls.has(k) || floor1Auto.has(k);
// 有微調過的紅格附近（本身和周圍 8 格）才需要細算；其他格子照原本的紅格判斷就好（找路一次問上萬格，要快）
// mapSolidOffsets 被換掉（換地圖、讀進度）會自動重算；在原地加、刪微調的程式要呼叫 solidOffsetsChanged()
let solidOffsetsVer = 0, nudgeNear = { src: null, ver: -1, set: new Set() };
function solidOffsetsChanged() { solidOffsetsVer++; }
function nudgeNearSet() {
  const src = typeof mapSolidOffsets !== 'undefined' ? mapSolidOffsets : null;
  if (nudgeNear.src === src && nudgeNear.ver === solidOffsetsVer) return nudgeNear.set;
  const set = new Set();
  for (const k in src || {}) { const [c, r] = k.split(',').map(Number); for (let dc = -1; dc <= 1; dc++) for (let dr = -1; dr <= 1; dr++) set.add((c + dc) + ',' + (r + dr)); }
  nudgeNear = { src, ver: solidOffsetsVer, set };
  return set;
}
// 找路用的一樓牆：k＝'c,r'
function wall1F(k, c, r) {
  if (floor1Auto.has(k)) return true;
  if (c === undefined) [c, r] = k.split(',').map(Number);
  if (typeof tileBoxCoversCellFast === 'function' && tileBoxCoversCellFast(c, r)) return true;   // 橘框蓋住這格中間
  if (!nudgeNearSet().has(k)) return mapWalls.has(k);
  if (mapWalls.has(k) && !mapSolidOffsets[k]) return true;   // 沒微調過的紅格：整格都擋
  const x = OX + c * CELL + CELL / 2, y = OY + r * CELL + CELL / 2;   // 這格正中間有沒有被（微調後的）紅格蓋住
  for (let dc = -1; dc <= 1; dc++) for (let dr = -1; dr <= 1; dr++) {
    const kk = (c + dc) + ',' + (r + dr), o = mapSolidOffsets[kk];
    if (!o || !mapWalls.has(kk)) continue;
    const x0 = OX + (c + dc) * CELL + o[0], y0 = OY + (r + dr) * CELL + o[1];
    if (x >= x0 && x < x0 + CELL && y >= y0 && y < y0 + CELL) return true;
  }
  return false;
}
const deckBlocked = k => floor2Solid.has(k) || floor2WallFace.has(k) || (mapWalls.has(k) && typeof objectWallOn2F === 'function' && objectWallOn2F(k));
function setMapFloors(deck, ramps, solid2) {
  floor2SolidOffsets = {};
  deckCells = new Set(deck || []); floor2Solid = new Set(solid2 || []); rampCells = new Set(ramps || []); computeRampUpper(); hasFloors = deckCells.size > 0 && rampCells.size > 0; floorCtx = 1; floorOnRamp = false; floorOnDeck = false;
}
// 明確指定樓層查牆（不看「現在處理誰」）：不屬於任何角色的程式（飛行物、出生點、檢查）用這個
const wallAt = (f, c, r) => hasFloors ? wallOnFloor(f, c, r) : wall1F(c + ',' + r, c, r);
// raw＝true：撞牆用，照原始的紅格（微調後的方塊由呼叫的程式自己算）；沒給＝找路用
function wallOnFloor(f, c, r, raw = false) {
  const k = c + ',' + r;
  if (rampCells.has(k)) return mapWalls.has(k);
  if (f !== 2) return raw ? wall1FRaw(k) : wall1F(k, c, r);
  return !deckCells.has(k) || deckBlocked(k);
}
// 站在樓層出入口上的人，走出去的格子照「走出去之後在哪一層」判斷：走到 2 樓地面不管一樓有沒有牆都走得過去，走到一般格子照一樓的牆
let floorOnRamp = false, floorOnDeck = false;
// floorScoped＝現在有沒有人說過「照第幾樓」（setFloorCtx／setFloorCtxTo／onFloorDo 都會設好）。
// 有陸橋的地圖上沒設就查牆＝程式漏了：照舊當一樓，但測試模式會在主控台記下是哪段程式（floorUnscoped）
let floorScoped = false;
const floorUnscopedLog = new Map();   // 漏設樓層的程式位置 → 次數（測試模式；主控台打 floorUnscopedLog 可以看）
let floorUnscopedN = 0;
function floorUnscoped() {
  if (!hasFloors || floorScoped || typeof window === 'undefined' || !(window.TEST_MODE || window.FLOOR_DEBUG)) return;
  if ((floorUnscopedN++ & 31) !== 0) return;   // 每 32 次抽查一次：抓程式位置很花時間
  const lines = String(new Error().stack || '').split('\n').map(l => l.trim()).filter(l => l.startsWith('at '));
  const helper = /floorUnscoped|wallNow|isWall|barrierAt|edgeWall|solidBlocksPoint|flowAt|enemyBlocked|lineOfSightRaw|nudgedWallAt|enemyWallCell|enemyWallPoint|enemyBarrierAt|enemyWideAt|enemyWideOpen|at Set\.|at Array\./;
  const i = lines.findIndex(l => !helper.test(l)), short = l => (l || '?').replace(/\(?https?:\/\/[^/]+\//, '(').replace(/\?v=[^:]*/, '');
  const site = i < 0 ? short(lines[2]) : short(lines[i]) + ' ← ' + short(lines[i + 1]);   // 漏設的那段程式 ← 呼叫它的地方
  if (!floorUnscopedLog.has(site)) console.warn('[樓層] 沒指定樓層就查牆／建築（照一樓算）：' + site);
  floorUnscopedLog.set(site, (floorUnscopedLog.get(site) || 0) + 1);
}
// 在某一層的規則下做事（who＝角色：連他是不是站在樓層出入口上一起算；或直接給 1、2）；做完自動還原成原本的狀態
function onFloorDo(who, fn) {
  const keep = [floorCtx, floorOnRamp, floorOnDeck, floorScoped];
  if (typeof who === 'number') setFloorCtxTo(who); else setFloorCtx(who);
  try { return fn(); } finally { [floorCtx, floorOnRamp, floorOnDeck, floorScoped] = keep; }
}
function wallNow(c, r, raw = false) {
  if (!floorScoped) floorUnscoped();
  const k = c + ',' + r, w1 = () => raw ? wall1FRaw(k) : wall1F(k, c, r);
  if (rampCells.has(k)) return mapWalls.has(k) || (floorCtx !== 2 && !floorOnRamp && floorOnDeck);   // 一樓的人站在 2 樓地面的格子上：不能從這邊走進手扶梯（只能從一樓那頭上去）
  if (floorOnRamp) return deckCells.has(k) ? deckBlocked(k) : w1();
  return floorCtx === 2 ? !deckCells.has(k) || deckBlocked(k) : w1();
}
// 找路用：這格能不能站人（照微調後的紅格和橘框算，見上面 wall1F）
const isWall = (c, r) => hasFloors ? wallNow(c, r) : wall1F(c + ',' + r, c, r);
// 撞牆用：原始的紅格（微調後的方塊、橘框由 solidBlocksPoint／nudgedWallAt 另外算）
const isWallRaw = (c, r) => hasFloors ? wallNow(c, r, true) : mapWalls.has(c + ',' + r);
// 處理某個角色之前先呼叫：設好「他在幾樓、是不是站在樓層出入口上」（算完用 clearFloorCtx 還原）
function setFloorCtx(a) {
  floorScoped = true;
  floorCtx = actorFloor(a);
  const k = hasFloors && a ? cellAt(a.x, a.y).join(',') : '';
  floorOnRamp = !!(k && rampCells.has(k));
  floorOnDeck = !!(k && deckCells.has(k) && !floorOnRamp);
}
function clearFloorCtx() { floorCtx = 1; floorOnRamp = false; floorOnDeck = false; floorScoped = false; }
// 角色走出「樓層出入口」時換樓層（每幀、每個角色呼叫一次；a._fk＝上一幀站的格子）
function updateActorFloor(a) {
  if (!hasFloors || !a) return;
  const k = cellAt(a.x, a.y).join(',');
  // 人面蝶在空中飛、不走手扶梯：牠正下方是 2 樓地面就算 2 樓，不是就算 1 樓（飛過樓層出入口時維持原本那層）。
  // 不然牠飛到 2 樓上空還是被當成一樓的怪，2 樓的人看得到卻打不到
  // 在 2 樓邊緣一格以內飛來飛去時維持原本那層：在 2 樓邊上打得到牠，不會一飛出邊緣就變成一樓的怪（從一樓飛進 2 樓邊緣也一樣）
  if (a.behavior === 'moth') {
    if (!rampCells.has(k)) {
      const [c, r] = cellAt(a.x, a.y), on = deckCells.has(k);
      let edge = false;   // 旁邊一格內有「另一種」格子（在 2 樓地面上：旁邊有不是 2 樓的；不在：旁邊有 2 樓地面）＝在邊緣
      for (let dc = -1; dc <= 1 && !edge; dc++) for (let dr = -1; dr <= 1; dr++) if (deckCells.has((c + dc) + ',' + (r + dr)) !== on) { edge = true; break; }
      if (!edge || a.floor == null) a.floor = on ? 2 : 1;   // 在邊緣：維持原本那層
    }
    a._fk = k; return;
  }
  if (a.floor == null) a.floor = spawnFloorAt(...cellAt(a.x, a.y));   // 剛生出來就站在陸橋上（一樓是牆、或只有 2 樓的地方）：算 2 樓
  // 站在「只有 2 樓、沒有 1 樓」的格子上（js/maploader.js 的 floor2OnlyCells）：一定是 2 樓的人。
  // 從別張地圖的出入口走進來、一開局就站在 2 樓的人沒有經過樓層出入口，以前會被當成一樓：2 樓的物件、2 樓碰撞都擋不到他，放的燈也算一樓
  if (a.floor !== 2 && typeof floor2OnlyCells === 'function' && MAP && floor2OnlyCells().has(k)) a.floor = 2;
  if (a._fk !== k) {
    if (a._fk && rampCells.has(a._fk) && !rampCells.has(k)) a.floor = deckCells.has(k) ? 2 : 1;
    a._fk = k;
  }
}
const actorFloor = a => (hasFloors && a && a.floor) || 1;
// 剛出現在這一格的東西算幾樓：2 樓地面底下是一樓的牆，或是「只有 2 樓、沒有 1 樓」的地方（js/maploader.js 的 floor2OnlyCells）＝2 樓；
// 其他（陸橋底下、一般地面）＝1 樓
function spawnFloorAt(c, r) {
  if (!hasFloors) return 1;
  const k = c + ',' + r;
  if (!deckCells.has(k) || rampCells.has(k)) return 1;
  return mapWalls.has(k) || (typeof floor2OnlyCells === 'function' && MAP && floor2OnlyCells().has(k)) ? 2 : 1;
}
// 怪物出生、核心擺放用：照那一格「出現後會在幾樓」判斷是不是牆（2 樓的地方看 2 樓碰撞，不是一律看一樓的牆）
const spawnWallAt = (c, r) => hasFloors ? wallOnFloor(spawnFloorAt(c, r), c, r) : mapWalls.has(c + ',' + r);
// 飛行中的東西（照明彈、特殊彈、珍珠、帽子、水柱…）不屬於任何角色：處理它之前用這個設成「它發射時在幾樓」，
// 牆、建築都照那一層判斷（算完一樣用 clearFloorCtx 還原）
function setFloorCtxTo(f) { floorScoped = true; floorCtx = hasFloors && f === 2 ? 2 : 1; floorOnRamp = false; floorOnDeck = false; }
// 飛行物、爆炸碰不碰得到這個人：不同樓層互相碰不到（沒有陸橋的地圖一律碰得到）
const onFloor = (f, a) => !hasFloors || (f === 2 ? 2 : 1) === actorFloor(a);
// 爆炸、火海、地雷、鱗粉霧：這次發生在幾樓（0＝不知道，照舊不分樓層）。引爆的地方用 withBlastFloor 包起來，
// 裡面的傷害、連鎖引爆、新起的火海都只算同一層（橋上的爆炸炸不到橋下的人，反過來也一樣）
let blastFloor = 0;
function withBlastFloor(f, fn) {
  const keep = blastFloor; blastFloor = hasFloors && f ? (f === 2 ? 2 : 1) : 0;
  try { return fn(); } finally { blastFloor = keep; }
}
// 這個人／東西（怪物、隊員、溫特、建築、核心…有 floor 的都可以）會不會被這次爆炸波及
const blastHits = a => !blastFloor || actorFloor(a) === blastFloor;
// 火海、油汙、霧這類留在地上的東西：記下的 floor 跟這個人同一層才碰得到（沒記＝不分樓層）
const fieldHits = (f, a) => !hasFloors || !f || f === actorFloor(a);
// 落在某個點的效果（酸液池、吐酸、魚卵、落石…）算幾樓：正在爆炸的那層 → 那個點上站的人 → 那格是不是只有 2 樓；沒有陸橋的地圖＝0（不分）
function floorAtPoint(x, y) {
  if (!hasFloors) return 0;
  if (blastFloor) return blastFloor;
  const f = typeof actorFloorNear === 'function' ? actorFloorNear(x, y) : 0;
  return f || spawnFloorAt(...cellAt(x, y));
}
// ---- 樓層體檢（測試模式、或主控台打 FLOOR_DEBUG = true）：場上的東西有沒有都記了樓層 ----
// 漏記的東西會被當成「不知道在幾樓」：畫錯層、打到另一層。新增會留在場上的東西（子彈、掉落物、地上的效果…）時要記 floor
const FLOOR_AUDIT_LISTS = ['enemies', 'towers', 'npcs', 'groundItems', 'fxCorpses', 'oreShards', 'cores', 'hangiCaps', 'pearls', 'capShots', 'fishDrops', 'fishEggs',
  'oilFires', 'oilSlicks', 'scorchMarks', 'mothClouds', 'flares', 'acidPools', 'spitPools', 'acidShots', 'gkRocks', 'bananaPeels', 'incShots', 'tranqDarts', 'flashShots', 'flareShots'];
const floorAuditSeen = new Set();
let floorAuditT = 0;
function floorAudit(dt) {
  if (!hasFloors || typeof window === 'undefined' || !(window.TEST_MODE || window.FLOOR_DEBUG) || typeof G === 'undefined' || !G) return;
  if ((floorAuditT -= dt) > 0) return;
  floorAuditT = 3;   // 每 3 秒查一次
  const bad = [];
  if (G.player && G.player.floor == null) bad.push('player');
  for (const name of FLOOR_AUDIT_LISTS) {
    const list = G[name]; if (!Array.isArray(list)) continue;
    const n = list.filter(o => o && o.floor == null).length;
    if (n) bad.push(name + '×' + n);
  }
  const key = bad.join(',');
  if (bad.length && !floorAuditSeen.has(key)) { floorAuditSeen.add(key); console.warn('[樓層體檢] 這些東西沒記樓層：' + key); }
  return bad;
}
// 把東西放在 (x, y) 算幾樓（放地上的物品、背包放不下掉出來的…）：只有 2 樓的格子＝2、只有 1 樓的＝1；
// 陸橋、樓層出入口（上下都有）照放的人畫面上在幾樓（站在手扶梯靠 2 樓那半＝2）。沒有陸橋的地圖＝undefined（不分）
function placeFloorAt(x, y, who) {
  if (!hasFloors) return undefined;
  const k = cellAt(x, y).join(',');
  if (rampCells.has(k) || (deckCells.has(k) && !(typeof floor2OnlyCells === 'function' && floor2OnlyCells().has(k)) && !mapWalls.has(k))) return visualFloor(who);
  return deckCells.has(k) ? 2 : 1;
}
// ---- 範圍效果的唯一入口：找出 (x, y) 附近、同一層的怪物、隊員、溫特 ----
// 爆炸、落石、自爆、濺射、霧…新寫的範圍技能都用這個找對象，就會自動分樓層（不用每次記得接）。
// opts：floor＝哪一層（沒給＝withBlastFloor 設的那層；0＝不分）、squash＝上下方向壓扁的倍率（地上的橢圓範圍，例如 .7）、
//       los＝牆後面的不算、enemies／towers／player＝要不要這幾種（預設都要）、alive＝只要還活著的（預設是）、except＝排除這一個
// 回傳 [{ a: 對象, kind: 'enemy'｜'tower'｜'player', d: 距離 }]，由近到遠
function areaTargets(x, y, R, opts = {}) {
  const f = !hasFloors ? 0 : opts.floor != null ? (opts.floor === 2 ? 2 : opts.floor ? 1 : 0) : blastFloor;
  const sq = opts.squash || 1, out = [];
  const consider = (a, kind) => {
    if (!a || a === opts.except) return;
    if (opts.alive !== false && (a.dead || !(a.hp > 0))) return;
    if (f && actorFloor(a) !== f) return;
    const d = Math.hypot(a.x - x, (a.y - y) / sq); if (d > R) return;
    if (opts.los && !hasLineOfSight(x, y, a.x, a.y)) return;
    out.push({ a, kind, d });
  };
  if (opts.enemies !== false && typeof G !== 'undefined') for (const e of G.enemies) consider(e, 'enemy');
  if (opts.towers !== false && typeof G !== 'undefined') for (const t of G.towers) consider(t, 'tower');
  if (opts.player !== false && typeof G !== 'undefined') consider(G.player, 'player');
  return out.sort((p, q) => p.d - q.d);
}
// 地上特效（礦物碎片、焦痕、照明棒、地雷、油汙、火海、水灘…）分兩輪畫（js/render.js）：
// 第 1 輪（groundFxPass＝1）畫 1 樓的、和沒記樓層的；第 2 輪（＝2）在 2 樓地板畫好之後，只畫記著 2 樓的。沒有陸橋的地圖＝0，全部照畫
let groundFxPass = 0;
const fxSkip = f => !!groundFxPass && (groundFxPass === 2) !== (f === 2);
// ---- 畫面的前後順序（js/render.js）----
// 每個要畫的東西都標明 floor（第幾樓）、band（哪一層）、y（同一層裡照底部 Y 排前後）。先畫完整個 1 樓，再畫 2 樓；
// 每一樓裡依序：ground 地板 → groundFx 地上特效 → onGround 貼著地板的（目前沒用到）→ obj 物件和人 → top 永遠在最上面（2 樓上層的屋簷）
const DRAW_BAND = { ground: 0, groundFx: 1, onGround: 1.5, obj: 2, top: 3 };
const drawOrder = (a, b) => ((a.floor || 1) - (b.floor || 1)) || ((a.band ?? DRAW_BAND.obj) - (b.band ?? DRAW_BAND.obj)) || (a.y - b.y);
// 畫面上看起來在幾樓：真的在 2 樓，或站在樓梯／手扶梯靠 2 樓的那一半 → 2。排畫面、蓋建築、身上的燈用這個
const visualFloor = a => hasFloors && a && (a.floor === 2 || rampUpperCells.has(cellAt(a.x, a.y).join(',')) || (typeof inStairUpper === 'function' && inStairUpper(a.x, a.y))) ? 2 : 1;
// 地上的東西（掉落物、屍體、核心、帽子…）畫在幾樓：產生時記下的 floor
const looseFloor = o => hasFloors && o && o.floor === 2 ? 2 : 1;
const sameFloor = (a, b) => actorFloor(a) === actorFloor(b);

// ---- 邊緣碰撞（地圖編輯器「📏 邊緣碰撞」畫的薄牆）----
// 只擋「跨過格線」，兩邊的格子都照常可以走（例如高台邊緣、階梯兩側）。
// 資料：MAP.edges = ['c,r,R'（第 c 欄 r 列那格的右邊）, 'c,r,B'（那格的下邊）…]
// 不擋子彈、視線、光，只擋走路：溫特、隊員、怪物的碰撞和尋路都認得。
// 微調：MAP.edgeOffsets = { 'c,r,R': [dx, dy] }＝這條線整段平移幾像素（地圖編輯器「🎯 碰撞微調」，最多將近一格；找路 edgeBetween 還是看原本的格線）
const EDGE_WALL = { half: 5 };   // 薄牆的厚度一半（像素）：角色身體離線這麼近就算撞到
let edgeSetMap = null, edgeSet = new Set(), edgeSegs = [];
// 2 樓的薄牆：目前只有停在 2 樓的捷運列車（js/mrt-train.js）會加，只擋 2 樓的人；地圖編輯器畫的薄牆照舊只擋一樓
let edgeSet2 = new Set(), edgeSegs2 = [];
// 程式動態加的薄牆（停靠的捷運列車，js/mrt-train.js）：不存進地圖資料，換了就重建。set＝擋一樓、set2＝擋 2 樓
let edgeExtra = new Set(), edgeExtra2 = new Set(), edgeExtraVer = 0, edgeBuiltVer = -1;
function setExtraEdges(set, set2) { edgeExtra = set; edgeExtra2 = set2 || new Set(); edgeExtraVer++; }
function mapEdgeSet() {   // 跟著目前的地圖重建（換地圖、從劇情地圖回到暫停的戰場都會自動對上）
  const m = typeof MAP !== 'undefined' ? MAP : null;
  if (edgeSetMap !== m || edgeBuiltVer !== edgeExtraVer) {
    edgeSetMap = m; edgeBuiltVer = edgeExtraVer; edgeSet = new Set([...((m && m.edges) || []), ...edgeExtra]); edgeSet2 = new Set(edgeExtra2);
    const offs = (m && m.edgeOffsets) || {};
    // 每條線換算成地圖上的線段（相對 OX、OY）：直線 x 固定、從 y0 到 y1；橫線 y 固定、從 x0 到 x1
    const segs = set => [...set].map(k => {
      const [c, r, axis] = k.split(','), [dx, dy] = offs[k] || [0, 0];
      return axis === 'R' ? { v: true, x: (+c + 1) * CELL + dx, a: +r * CELL + dy, b: (+r + 1) * CELL + dy }
        : { v: false, y: (+r + 1) * CELL + dy, a: +c * CELL + dx, b: (+c + 1) * CELL + dx };
    });
    edgeSegs = segs(edgeSet); edgeSegs2 = segs(edgeSet2);
  }
  return edgeSet;
}
// 現在處理的人在幾樓，就用那一層的薄牆：[格線的集合, 線段]
function edgesNow() {
  mapEdgeSet();
  return floorCtx === 2 ? [edgeSet2, edgeSegs2] : [edgeSet, edgeSegs];
}
// 相鄰兩格之間有沒有薄牆（尋路用；斜走不算）
function edgeBetween(c, r, nc, nr) {
  const [E] = edgesNow(); if (!E.size) return false; if (!floorScoped) floorUnscoped();   // 1 樓的人看 1 樓的薄牆、2 樓的人看 2 樓的
  if (nr === r && nc === c + 1) return E.has(c + ',' + r + ',R');
  if (nr === r && nc === c - 1) return E.has(nc + ',' + r + ',R');
  if (nc === c && nr === r + 1) return E.has(c + ',' + r + ',B');
  if (nc === c && nr === r - 1) return E.has(c + ',' + nr + ',B');
  return false;
}
// 這個點有沒有碰到薄牆（線的兩側各 EDGE_WALL.half 像素；兩端也多延伸一點，轉角接得起來）
// 一張地圖的薄牆通常只有幾十條，直接每條檢查
function edgeWallBlocksPoint(x, y) {
  const [E, segs] = edgesNow(); if (!E.size) return false; if (!floorScoped) floorUnscoped();
  const lx = x - OX, ly = y - OY, H = EDGE_WALL.half;
  for (const s of segs) {
    if (s.v ? (Math.abs(lx - s.x) <= H && ly >= s.a - H && ly <= s.b + H)
            : (Math.abs(ly - s.y) <= H && lx >= s.a - H && lx <= s.b + H)) return true;
  }
  return false;
}
// 身體（半徑 r 的方塊）從 (x0,y0) 直直移到 (x1,y1) 會不會穿過薄牆：一次走很遠（衝刺、卡頓）也不會直接跳過去
// 只處理水平或垂直的移動（溫特的移動是 x、y 分開判斷）
function edgeWallCrossed(x0, y0, x1, y1, r) {
  const [E, segs] = edgesNow(); if (!E.size) return false; if (!floorScoped) floorUnscoped();
  const passes = (line, a, b) => a < b ? line > a && line <= b : line < a && line >= b;   // 身體前緣從 a 移到 b，有沒有越過 line
  const lx0 = x0 - OX, ly0 = y0 - OY, lx1 = x1 - OX, ly1 = y1 - OY;
  for (const s of segs) {
    if (s.v && lx1 !== lx0) {
      const k = Math.sign(lx1 - lx0);
      if (ly0 + r > s.a && ly0 - r < s.b && passes(s.x, lx0 + k * r, lx1 + k * r)) return true;
    } else if (!s.v && ly1 !== ly0) {
      const k = Math.sign(ly1 - ly0);
      if (lx0 + r > s.a && lx0 - r < s.b && passes(s.y, ly0 + k * r, ly1 + k * r)) return true;
    }
  }
  return false;
}

// ---- 怪物也吃不可碰撞的像素微調（跟溫特一樣）----
// wall(c, r)＝那一格是不是牆；牆格用方向鍵微調過（js/maploader.js 的 solidOffsetAt）：擋的是移過去之後的那一格大小的範圍，原本那格空出來的地方可以走
// off：照哪一份像素微調（沒給＝一樓的 solidOffsetAt；2 樓用 solid2OffsetAt）
function nudgedWallAt(x, y, wall, offFn = null) {
  if (typeof tileBoxBlocksPoint === 'function' && tileBoxBlocksPoint(x, y)) return true;   // 素材碰撞方框（js/tile-collisions.js）
  if (typeof poolPlatformBlocksPoint === 'function' && poolPlatformBlocksPoint(x, y)) return true;   // 抽水機平台：怪物上不去（js/pool-platform.js）
  const [c, r] = cellAt(x, y), off = offFn || (typeof solidOffsetAt === 'function' ? solidOffsetAt : () => null);
  if (wall(c, r) && !off(c, r)) return true;                      // 沒微調過：整格都擋
  for (let dc = -1; dc <= 1; dc++) for (let dr = -1; dr <= 1; dr++) {
    const cc = c + dc, rr = r + dr, o = off(cc, rr);
    if (!o || !wall(cc, rr)) continue;
    const x0 = OX + cc * CELL + o[0], y0 = OY + rr * CELL + o[1];
    if (x >= x0 && x < x0 + CELL && y >= y0 && y < y0 + CELL) return true;
  }
  return false;
}
// ---- 沒對齊格子的門（編輯器裡往左右微調了半格，例如池核 24,57、8,41 的門）----
// 門洞剛好跨在兩格中間：兩格的正中間都會撞到門旁邊的牆，照「格子正中間」找路的隊友、怪物會以為過不去。
// 所以門打開時，門洞上下這幾排、門洞蓋到的格子改成「站在門洞的正中線上」：找路照這個點判斷，走路也走到這個點。
// 門有對齊格子（正中線就在格子正中間）的照舊用格子正中間，不受影響。隊友見 js/sentry.js 的 sentryCellPos、怪物見 cellStandPoint
const DOOR_LANE_ROWS = 2;   // 門擋路的那兩排，再往上、往下各多算幾排（穿過牆的那段通道）
function doorLanePoint(c, r) {
  if (typeof mapDoors === 'undefined' || !mapDoors.length) return null;   // 門在 js/doors.js
  const x0 = OX + c * CELL, cx = x0 + CELL / 2;
  for (const d of mapDoors) {
    if (!d.open || !d.cells.length) continue;
    const mid = (d.left + d.right) / 2;
    if (mid < x0 || mid > x0 + CELL || Math.abs(mid - cx) < 2) continue;   // 正中線不在這一格，或本來就在格子正中間
    const rows = d.cells.map(k => +k.split(',')[1]), r0 = Math.min(...rows) - DOOR_LANE_ROWS, r1 = Math.max(...rows) + DOOR_LANE_ROWS;
    if (r < r0 || r > r1) continue;
    return [doorLaneX(d, mid, r0, r1), OY + r * CELL + CELL / 2];
  }
  return null;
}
// 門洞通道真正的正中線：門兩旁的紅格各自微調過，空隙不一定正好在門圖的正中間（池核 24,57 差 1 像素，身體寬的鳥頭人就會擦到牆過不去）
// 在門圖正中線左右 12 像素內找「離兩邊的牆最遠」的那條線；算一次存在門上（換地圖、重開時門會重建，再重算）
function doorLaneX(d, mid, r0, r1) {
  if (d.laneX != null && d.laneKey === r0 + ',' + r1) return d.laneX;
  const wallAt = (x, y) => nudgedWallAt(x, y, (c, r) => mapWalls.has(c + ',' + r));
  let best = mid, bestGap = -1;
  for (let dx = 0; dx <= 12; dx = dx > 0 ? -dx : -dx + 1) {   // 0, 1, -1, 2, -2…：一樣寬時選最靠近門圖正中線的
    const x = mid + dx; let gap = Infinity;
    for (let r = r0; r <= r1 && gap > bestGap; r++) for (const y of [OY + r * CELL + 4, OY + r * CELL + CELL / 2, OY + r * CELL + CELL - 4]) {
      let L = 0, R = 0;
      while (L < 30 && !wallAt(x - L - 1, y)) L++;
      while (R < 30 && !wallAt(x + R + 1, y)) R++;
      gap = Math.min(gap, L, R);
    }
    if (gap > bestGap) { bestGap = gap; best = x; }
  }
  d.laneKey = r0 + ',' + r1;
  return (d.laneX = best);
}
// 怪物在這一格要站哪裡（找路、走路的目標點）：一般是格子正中間；沒對齊格子的門洞＝門洞的正中線
const cellStandPoint = (c, r) => doorLanePoint(c, r) || center(c, r);
// 怪物尋路、流場看的「這格是不是牆」：格子中心被（微調後的）牆擋住才算（門洞通道上的格子看門洞正中線）。二樓沒有微調，照原本
function enemyWallCell(c, r, f = floorCtx) {
  const [x, y] = f === 2 ? center(c, r) : cellStandPoint(c, r);
  if (f === 2) return nudgedWallAt(x, y, (cc, rr) => wallOnFloor(2, cc, rr), solid2OffsetAt);   // 2 樓：照 2 樓的像素微調
  return nudgedWallAt(x, y, (cc, rr) => wallOnFloor(1, cc, rr, true));
}
// 怪物走路的碰撞：這個點有沒有撞到（微調後的）牆
const enemyWallPoint = (x, y) => floorCtx === 2 ? nudgedWallAt(x, y, isWallRaw, solid2OffsetAt) : nudgedWallAt(x, y, isWallRaw);

// ---- 營地（怪物的目標格）；空的話預設為最下面一排 ----
let campCells = new Set();
const isCamp = (c, r) => campCells.size ? campCells.has(c + ',' + r) : (r === ROWS - 1);

// ---- 流場（每格到營地的最短步數，會繞過固定牆）----
let flow = [], flow2 = [];   // flow2＝二樓的人用的（有陸橋的地圖才有）
// 地圖設定「怪物沒目標時去打基地」（MAP.seekBase，地圖編輯器勾選）：關著的手動門也算路（怪物走到門前會推開，js/enemy-ai.js 的 enemySeekBase）
// 上鎖、記憶之門、畫作門不算（怪物打不開）
const monsterOpensDoor = d => !!d && d.mode === 'manual';
function computeFlow() {
  const doorPass = typeof MAP !== 'undefined' && MAP && MAP.seekBase && typeof mapDoors !== 'undefined'
    ? mapDoors.filter(d => !d.open && monsterOpensDoor(d)).flatMap(d => [...d.own].filter(k => mapWalls.has(k))) : [];
  for (const k of doorPass) mapWalls.delete(k);   // 算流場時先當門開著，算完馬上放回去
  try { computeFlowNow(); } finally { for (const k of doorPass) mapWalls.add(k); }
}
function computeFlowNow() {
  const keepCtx = floorCtx, keepRamp = floorOnRamp, keepDeck = floorOnDeck, keepScoped = floorScoped; floorCtx = 1; floorOnRamp = false; floorOnDeck = false; floorScoped = true;   // 算一樓的薄牆要用一樓的規則
  flow = new Array(COLS * ROWS).fill(Infinity);
  flow2 = hasFloors ? new Array(COLS * ROWS).fill(Infinity) : [];
  const q = [];   // [樓層, c, r]：營地在一樓；二樓的人要先走到樓層出入口、下到一樓才到得了
  const arr = f => f === 2 ? flow2 : flow;
  const seed = (c, r) => { if (inGrid(c, r) && !enemyWallCell(c, r, 1) && flow[r * COLS + c] > 1) { flow[r * COLS + c] = 1; q.push([1, c, r]); } };
  if (campCells.size) campCells.forEach(k => { const [c, r] = k.split(',').map(Number); seed(c, r); });
  else for (let c = 0; c < COLS; c++) seed(c, ROWS - 1);
  // 從 (f, c, r) 走一步到 (nc, nr) 會落在哪一層（出樓層出入口那一步才換層）
  const landing = (f, c, r, nc, nr) => rampCells.has(c + ',' + r) && !rampCells.has(nc + ',' + nr) ? (deckCells.has(nc + ',' + nr) ? 2 : 1) : f;
  let head = 0;
  while (head < q.length) {
    const [f, c, r] = q[head++]; const d = arr(f)[r * COLS + c];
    // 倒著找：哪些 (pf, pc, pr) 走一步會到這裡
    for (const [dc, dr] of [[0, 1], [0, -1], [-1, 0], [1, 0]]) {
      const pc = c + dc, pr = r + dr;
      if (!inGrid(pc, pr)) continue;
      for (const pf of hasFloors ? [1, 2] : [1]) {
        if (enemyWallCell(pc, pr, pf) || landing(pf, pc, pr, c, r) !== f) continue;   // 吃不可碰撞的像素微調
        if (pf !== 2 && typeof deepWaterBlocksCell === 'function' && deepWaterBlocksCell(pc, pr)) continue;   // 深水區：怪物繞過去（js/swim-ring.js）
        if (pf !== 2 && edgeBetween(pc, pr, c, r)) continue;   // 薄牆只擋一樓
        if (pf !== 2 && deckCells.has(pc + ',' + pr) && rampCells.has(c + ',' + r) && !rampCells.has(pc + ',' + pr)) continue;   // 一樓的人不能從 2 樓地面那側走進手扶梯
        const A = arr(pf);
        if (A[pr * COLS + pc] > d + 1) { A[pr * COLS + pc] = d + 1; q.push([pf, pc, pr]); }
      }
    }
  }
  floorCtx = keepCtx; floorOnRamp = keepRamp; floorOnDeck = keepDeck; floorScoped = keepScoped;
}
const flowAt = (c, r) => { if (!floorScoped) floorUnscoped(); return inGrid(c, r) ? (floorCtx === 2 ? flow2 : flow)[r * COLS + c] : Infinity; };
