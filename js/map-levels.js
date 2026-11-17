/* ===== 地圖的樓層資料（1 樓、2 樓）：遊戲和地圖編輯器共用 =====
   原則：「在幾樓」是地圖資料裡明確寫下來的，遊戲不從圖層名稱、有沒有鋪圖、底下有沒有牆去猜。

   地圖資料（data/maps.js 每張地圖）：
   ・deck   ＝有 2 樓地面的格子（只有 2 樓＋陸橋）
   ・有設 2 樓圖層的地圖：2 樓地面自動從 2 樓圖層的地板算（下面的 autoDeckCells），deckAdd／deckDel＝筆刷加的、拿掉的例外；
             deck 是算好的結果（遊戲讀地圖、編輯器存檔時用 syncDeck 重算）；deckAuto＝已經換成自動。沒有 2 樓圖層的地圖照舊：deck 全部靠筆刷畫
   ・ramps  ＝樓層出入口（樓梯、手扶梯）
   ・only2  ＝「只有 2 樓、底下沒有 1 樓」的格子（一定也在 deck 裡）。陸橋＝在 deck 裡、但不在 only2 裡
   ・圖層（layerOrder 裡）的 level：2＝2 樓的圖層（沒寫＝1 樓）；top2：true＝「2 樓上層」，永遠蓋在 2 樓的人上面（像屋簷）
   ・每張圖（stamp）的 level：1、2，或 'span'（從一樓立到二樓的柱子／牆，上下兩半各算一層）。沒寫＝跟著所在圖層的樓層
   tileOf：用素材 id 找素材（遊戲傳 mapTileById、編輯器傳 tileById），要有 w、h（格數）。
*/
const MapLevels = (() => {
  const isOccLayer = lid => /^object\d*$/.test(lid) || lid === 'overlay';   // 物件、物件2～…、物件裝飾＝立體物
  const turn = s => ((Number(s && s.rot) || 0) % 4 + 4) % 4;
  const tw = t => (t && t.w) || 1, th = t => (t && t.h) || 1;
  const stampW = (s, t) => turn(s) % 2 ? th(t) : tw(t);
  const stampH = (s, t) => turn(s) % 2 ? tw(t) : th(t);
  const cellSize = () => (typeof CELL !== 'undefined' ? CELL : 40);
  const order = m => (m && Array.isArray(m.layerOrder) && m.layerOrder.length) ? m.layerOrder : [];

  // ---- 明寫的資料 ----
  // 2 樓的圖層、2 樓上層的圖層（照圖層的 level／top2）
  function floor2Layers(m) {
    const all = new Set(), top = new Set();
    for (const l of order(m)) { if (l.level !== 2) continue; all.add(l.id); if (l.top2) top.add(l.id); }
    return { all, top };
  }
  // 這張圖在幾樓：寫了 level 就照寫的，沒寫跟著圖層（2 樓的圖層＝2，其他＝1）
  function stampLevel(s, m, tileOf, ctx) {
    if (s && s.level != null) return s.level;
    const L = (ctx && ctx.L) || floor2Layers(m);
    return L.all.has((s && s.layer) || 'top') ? 2 : 1;
  }
  const stampOn2F = (s, L) => s && s.level != null ? s.level !== 1 : L.all.has((s && s.layer) || 'top');
  // 「只有 2 樓」的格子（照 only2；一定在 2 樓地面上、不是出入口）
  function only2Cells(m) {
    const deck = new Set(m.deck || []), ramps = new Set(m.ramps || []);
    return new Set((m.only2 || []).filter(k => deck.has(k) && !ramps.has(k)));
  }
  // 一格是哪一種：'1'＝只有 1 樓、'2'＝只有 2 樓、'b'＝陸橋（上下都有）、'r'＝樓層出入口
  function cellKind(k, deck, ramps, only2) {
    if (ramps.has(k)) return 'r';
    if (!deck.has(k)) return '1';
    return only2.has(k) ? '2' : 'b';
  }
  // 圖片蓋到的格子（half＝只算上半段）
  function cover(s, t, out, half = false) {
    const C = cellSize(), w = stampW(s, t), h = stampH(s, t), c0 = s.c + (s.ox || 0) / C, r0 = s.r + (s.oy || 0) / C, r1 = half ? r0 + h / 2 : r0 + h;
    for (let c = Math.ceil(c0 - .5); c + .5 < c0 + w; c++) for (let r = Math.ceil(r0 - .5); r + .5 < r1; r++) out.add(c + ',' + r);
    return out;
  }
  // 素材的牆／地板標記（🧱 牆地板編輯器，js/surface-tags.js；沒載入那個檔＝都沒標）
  const tagOf = id => typeof surfaceTagOf === 'function' ? surfaceTagOf(id) : null;

  // ---- 牆面不是 2 樓地板 ----
  // 2 樓平台邊緣的牆（從一樓立上來的牆、柱子）：圖最上面兩列是牆頂（平台的邊，2 樓的人可以走；只有 2 列高的矮牆是最上面一列），下面幾列是往下的牆面。
  // 牆面那幾列不能當 2 樓地面走，不然人會站到牆面上、被畫在牆前面，看起來牆和地板融在一起（B56、R89 出過這個問題）。
  // 算「平台邊緣的牆」：在 🧱 牆地板編輯器 標成「牆」的素材（data/surface-tags.js；不看素材名字），而且
  //   ・樓層設成「跨樓層」（span），或
  //   ・樓層是 2 樓、但牆腳那一列不在 2 樓地面上（牆不是站在 2 樓走道上，而是平台的邊）。
  // 站在 2 樓走道上的牆（牆腳踩在 2 樓地面上）不算：那種是 2 樓房間的後牆，人本來就可以走到它後面。
  // 回傳牆面蓋到的格子。2 樓地面自動算時扣掉（syncDeck）；遊戲（js/maploader.js）另外拿來擋 2 樓的人、讓 2 樓地板圖不畫在牆面上；編輯器的 🏢 筆刷不能畫在牆面上。
  const WALL_TOP_ROWS = 2;   // 平台邊緣的牆：最上面幾列算牆頂（2 樓的人可以走），下面才是牆面
  // tops（可以不給）：Map，記每一欄牆頂第一列 → 下面也算牆頂的那幾列（2 樓地面自動算時，牆頂第一列能走，下面幾列也跟著能走）
  function wallFaceCells(m, tileOf, tops) {
    const out = new Set();
    if (!m || !(m.deck || []).length) return out;
    const deck = new Set(m.deck || []), L = floor2Layers(m), C = cellSize();
    for (const s of m.stamps || []) {
      const t = tileOf(s.id); if (!t || t.flat) continue;
      if (tagOf(s.id) !== 'wall') continue;
      const lv = s.level != null ? s.level : (L.all.has(s.layer || 'top') ? 2 : 1);
      if (lv === 1 || L.top.has(s.layer || 'top')) continue;   // 一樓的牆、2 樓上層（屋簷）不算
      const w = stampW(s, t), h = stampH(s, t); if (h < 2) continue;
      const c0 = s.c + (s.ox || 0) / C, r0 = s.r + (s.oy || 0) / C;
      const cols = []; for (let c = Math.ceil(c0 - .5); c + .5 < c0 + w; c++) cols.push(c);
      const top = Math.ceil(r0 - .5), bottom = Math.ceil(r0 + h - .5) - 1;   // 牆頂那列、牆腳那列
      if (lv !== 'span' && cols.some(c => deck.has(c + ',' + bottom))) continue;   // 站在 2 樓走道上的牆
      const walk = Math.max(1, Math.min(WALL_TOP_ROWS, bottom - top));   // 牆頂可以走幾列（矮牆至少留最下面一列當牆面）
      for (const c of cols) for (let r = top + walk; r <= bottom; r++) out.add(c + ',' + r);
      if (tops) for (const c of cols) for (let r = top + 1; r < top + walk; r++) { const k = c + ',' + top, a = tops.get(k) || []; a.push(c + ',' + r); tops.set(k, a); }
    }
    return out;
  }

  // ---- 2 樓地面自動從圖層算（只要地圖有設 2 樓圖層就是這樣，不用按按鈕）----
  // 2 樓地面＝2 樓圖層上的「地板」蓋到的格子，扣掉平台邊緣的牆面（上面的 wallFaceCells）。
  //   ・算不算地板：素材在 🧱 牆地板編輯器 標成「地板」＝算、標成「牆」＝不算；
  //     沒標或標「不是牆」的照圖層：2 樓的地板類圖層（不是物件圖層、名稱沒有「牆」）＝算
  //   ・2 樓上層（屋簷）、跨樓層的圖不算
  // 自動算不出來的地方用筆刷補：deckAdd＝多加的格子、deckDel＝拿掉的格子（例外）。
  // 地圖裡的 deck 還是照存（＝自動算的＋例外），遊戲、編輯器其他地方照舊讀 deck；
  // 遊戲讀地圖時、編輯器每次存檔時會用 syncDeck 重算一次，所以搬了圖、改了標記，2 樓地面會自己跟著變。
  // deckAuto＝true＝這張地圖已經換成自動了（第一次換的時候，原本手刷的 2 樓地面會保留成例外，換前換後一模一樣）。
  const isAutoDeck = m => !!(m && floor2Layers(m).all.size);
  function autoDeckCells(m, tileOf) {
    const L = floor2Layers(m), names = new Map(order(m).map(l => [l.id, String(l.name || '')]));
    const isFloor = (id, lid) => {
      const tag = tagOf(id);
      if (tag === 'floor') return true;
      if (tag === 'wall') return false;
      return !isOccLayer(lid) && lid !== 'top' && !/牆/.test(names.get(lid) || '');
    };
    const out = new Set();
    for (const lid of L.all) if (!L.top.has(lid)) for (const [k, id] of Object.entries((m.layers || {})[lid] || {})) if (id && isFloor(id, lid)) out.add(k);
    for (const s of m.stamps || []) {
      const lid = s.layer || 'top';
      if (s.level === 'span' || !stampOn2F(s, L) || L.top.has(lid) || !isFloor(s.id, lid)) continue;
      const t = tileOf(s.id); if (t) cover(s, t, out);
    }
    return out;
  }
  const sortKeys = a => a.sort((x, y) => { const [xc, xr] = x.split(',').map(Number), [yc, yr] = y.split(',').map(Number); return xr - yr || xc - yc; });
  // 重算 deck（自動模式才做）：自動算的＋deckAdd－deckDel，再扣掉牆面。回傳有沒有變
  function syncDeck(m, tileOf) {
    if (!isAutoDeck(m)) return false;   // 沒有 2 樓圖層：照舊，2 樓地面全部靠筆刷
    if (!m.deckAuto) {   // 第一次換成自動：已經手刷過 2 樓地面的，保留成例外（換前換後一樣）；還沒刷過的直接用自動算的
      if ((m.deck || []).length) { const before = (m.deck || []).join('|'); enableAutoDeck(m, tileOf); return before !== (m.deck || []).join('|'); }
      m.deckAuto = true;
    }
    const auto = autoDeckCells(m, tileOf);
    const add = (m.deckAdd || []).filter(k => !auto.has(k)), del = (m.deckDel || []).filter(k => auto.has(k));   // 已經跟自動一樣的例外拿掉
    const base = new Set([...auto, ...add]); for (const k of del) base.delete(k);
    // 扣掉牆面：哪些是牆面要看牆腳踩不踩在 2 樓地面上，而扣掉之後又可能變，所以從上一次算好的 2 樓地面開始，重複算到不再變（最多 6 次）
    let deck = new Set(m.deck || []);
    for (let i = 0; i < 6; i++) {
      const face = wallFaceCells({ ...m, deck: [...deck] }, tileOf), next = new Set([...base].filter(k => !face.has(k)));
      const same = next.size === deck.size && [...next].every(k => deck.has(k));
      deck = next; if (same) break;
    }
    // 牆頂第一列是 2 樓地面 → 下面也算牆頂的那幾列一起算（就算底下沒鋪 2 樓地板圖；筆刷拿掉的例外不算）
    const tops = new Map(), delSet = new Set(del); wallFaceCells({ ...m, deck: [...deck] }, tileOf, tops);
    for (const [k, rows] of tops) if (deck.has(k)) for (const r of rows) if (!delSet.has(r)) deck.add(r);
    const before = (m.deck || []).join('|'), next = sortKeys([...deck]);
    if (next.length) m.deck = next; else delete m.deck;
    if (add.length) m.deckAdd = sortKeys([...new Set(add)]); else delete m.deckAdd;
    if (del.length) m.deckDel = sortKeys([...new Set(del)]); else delete m.deckDel;
    return before !== next.join('|');
  }
  // 筆刷改了一格 2 樓地面（on＝畫上、false＝擦掉）：自動模式時記成例外，存檔重算時才不會被蓋回去
  function noteDeckEdit(m, k, on) {
    if (!isAutoDeck(m)) return;
    const drop = (f, key) => { if (m[f]) { const i = m[f].indexOf(key); if (i >= 0) m[f].splice(i, 1); } };
    const put = (f, key) => { const a = m[f] || (m[f] = []); if (!a.includes(key)) a.push(key); };
    if (on) { drop('deckDel', k); put('deckAdd', k); } else { drop('deckAdd', k); put('deckDel', k); }
  }
  // 打開自動模式：現在畫的 2 樓地面跟自動算的不一樣的格子，記成例外（打開前後 2 樓地面完全一樣）
  function enableAutoDeck(m, tileOf) {
    const stored = new Set(m.deck || []), auto = autoDeckCells(m, tileOf);
    for (const k of wallFaceCells(m, tileOf)) auto.delete(k);   // 牆面本來就會自動扣掉，不用記成例外
    m.deckAuto = true;
    m.deckAdd = [...stored].filter(k => !auto.has(k));
    m.deckDel = [...auto].filter(k => !stored.has(k));
    syncDeck(m, tileOf);
    const now = new Set(m.deck || []);
    return { auto: auto.size, add: (m.deckAdd || []).length, del: (m.deckDel || []).length, same: now.size === stored.size && [...now].every(k => stored.has(k)) };
  }

  // 存檔前整理：only2 一定是 2 樓地面、不是出入口；舊版留下的 levels（樓層資料版本）拿掉
  function normalize(m) {
    if (!m) return;
    delete m.levels;
    const deck = new Set(m.deck || []), ramps = new Set(m.ramps || []);
    m.only2 = [...new Set((m.only2 || []).filter(k => deck.has(k) && !ramps.has(k)))];
  }

  // ---- 🔍 樓層檢查：列出可疑的地方 {kind, text, c, r} ----
  function check(m, tileOf) {
    const out = [], add = (kind, text, k) => { const [c, r] = String(k).split(',').map(Number); out.push({ kind, text, c, r }); };
    const deck = new Set(m.deck || []), ramps = new Set(m.ramps || []), solid = new Set(m.solid || []), solid2 = new Set(m.solid2 || []);
    if (!deck.size && !ramps.size) return out;
    if (deck.size && !ramps.size) out.push({ kind: 'warn', text: '有 2 樓地面但沒有樓層出入口：沒有人上得去 2 樓', c: null, r: null });
    const only2 = only2Cells(m), L = floor2Layers(m);
    const ctx = { L };
    const wall2 = k => !deck.has(k) || solid2.has(k);   // 2 樓的人走不過去
    const walk2 = k => deck.has(k) && !ramps.has(k) && !solid2.has(k);
    // 1. 樓層出入口：要同時接到 2 樓地面和 1 樓地面
    const seenRamp = new Set();
    for (const k of ramps) {
      if (seenRamp.has(k)) continue;
      const group = [], q = [k]; seenRamp.add(k);
      while (q.length) { const g = q.pop(); group.push(g); const [c, r] = g.split(',').map(Number); for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const n = (c + dc) + ',' + (r + dr); if (ramps.has(n) && !seenRamp.has(n)) { seenRamp.add(n); q.push(n); } } }
      let up = false, down = false;
      for (const g of group) { const [c, r] = g.split(',').map(Number); for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const n = (c + dc) + ',' + (r + dr); if (ramps.has(n)) continue; if (deck.has(n) && !solid2.has(n)) up = true; else if (!deck.has(n) && !solid.has(n)) down = true; } }
      if (!up) add('warn', '樓層出入口沒有接到可以走的 2 樓地面', group[0]);
      if (!down) add('warn', '樓層出入口沒有接到可以走的 1 樓地面', group[0]);
    }
    // 2. 怪物出生區、核心候選點：落在那一層的牆裡
    const spawnLevelWall = k => only2.has(k) ? wall2(k) : solid.has(k);
    for (const k of m.spawnZone || []) if (spawnLevelWall(k)) add('warn', '怪物出生區畫在' + (only2.has(k) ? ' 2 樓' : ' 1 樓') + '的牆裡（怪物會卡住，遊戲會跳過這格）', k);
    for (const k of m.coreSpots || []) if (spawnLevelWall(k)) add('warn', '核心候選點在' + (only2.has(k) ? ' 2 樓' : ' 1 樓') + '的牆裡（不會被抽到）', k);
    // 3. 2 樓的牆、柱子圖：最上面那列在 2 樓可以走 → 人走到邊上會被牆頂蓋住
    for (const s of m.stamps || []) {
      const lid = s.layer || 'top', lv = stampLevel(s, m, tileOf, ctx);
      if (lv !== 2 || !isOccLayer(lid) || L.top.has(lid)) continue;
      const t = tileOf(s.id); if (!t || t.flat || stampH(s, t) < 3 || Number.isFinite(s.sortDepth)) continue;
      if (tagOf(s.id) !== 'wall') continue;   // 只看標成「牆」的素材（🧱 牆地板編輯器；櫃子、箱子站在後面被遮是正常的）
      const C = cellSize(), c0 = s.c + (s.ox || 0) / C, r0 = Math.round(s.r + (s.oy || 0) / C), w = stampW(s, t);
      for (let c = Math.ceil(c0 - .5); c + .5 < c0 + w; c++) {   // 牆圖最上面那列 2 樓可以走、下一列走不過去＝這張牆是走道的前緣
        const top = c + ',' + r0, below = c + ',' + (r0 + 1);
        if (walk2(top) && wall2(below) && deck.has(top)) { add('warn', '2 樓的牆圖最上面那列可以走：人走到邊上會被牆頂蓋住（在這列畫 🚧 2樓碰撞，或幫這張圖設排序深度）', top); break; }
      }
    }
    // 4. 物件（障礙物、礦物）踩在 2 樓地面的邊緣
    for (const s of m.stamps || []) {
      const t = tileOf(s.id); if (!t || !(t.baseHp || /ore|礦/.test(String(s.id)))) continue;
      const all = [...cover(s, t, new Set())], bottom = Math.max(...all.map(k => +k.split(',')[1])), cells = all.filter(k => +k.split(',')[1] === bottom);   // 看底部那排（擋路的地方）
      const on = cells.filter(k => deck.has(k) && !ramps.has(k)).length;
      const mid = cells.slice().sort((x, y) => +x.split(',')[0] - +y.split(',')[0])[Math.floor((cells.length - 1) / 2)];   // 底部中間那格（擋路格通常在這裡）
      if (on && on < cells.length && !(deck.has(mid) && !ramps.has(mid))) add('warn', '可破壞物件（' + (t.name || s.id) + '）踩在 2 樓地面的邊緣：一半在 2 樓地面上、一半不在，會被當成 1 樓的東西', s.c + ',' + s.r);
    }
    // 5. 只有 2 樓的格子上鋪了一樓的地板圖：可能 only2 畫錯，或那張圖應該設成 2 樓
    const under = new Set();
    for (const l of order(m)) if (!L.all.has(l.id) && !isOccLayer(l.id) && l.id !== 'top') for (const k in ((m.layers || {})[l.id] || {})) under.add(k);
    for (const s of m.stamps || []) { if (stampOn2F(s, L)) continue; const t = tileOf(s.id); if (!t || t.flat) continue; if (!isOccLayer(s.layer || 'top')) cover(s, t, under); }
    let n = 0;
    for (const k of only2) if (under.has(k) && n < 30) { add('info', '「只有 2 樓」的格子上鋪著一樓的地板圖：這格到底有沒有 1 樓？', k); n++; }
    return out;
  }

  return { floor2Layers, stampOn2F, stampLevel, only2Cells, cellKind, normalize, check, isOccLayer, wallFaceCells,
    isAutoDeck, autoDeckCells, syncDeck, noteDeckEdit };
})();
