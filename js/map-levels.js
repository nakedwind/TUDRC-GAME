/* ===== 地圖的樓層資料（1 樓、2 樓）：遊戲和地圖編輯器共用 =====
   原則：「在幾樓」是地圖資料裡明確寫下來的，不是從圖層名稱、有沒有鋪圖、底下有沒有牆去猜。

   地圖資料（data/maps.js 每張地圖）：
   ・deck   ＝有 2 樓地面的格子（只有 2 樓＋陸橋）
   ・ramps  ＝樓層出入口（樓梯、手扶梯）
   ・only2  ＝「只有 2 樓、底下沒有 1 樓」的格子（一定也在 deck 裡）。陸橋＝在 deck 裡、但不在 only2 裡
   ・levels ＝1：這張地圖的樓層資料已經明確寫好（轉換過）。遊戲看到它就照 only2、每張圖的 level 走，不再推算
   ・每張圖（stamp）的 level：1＝一樓的圖、2＝二樓的圖、'span'＝從一樓立到二樓的柱子／牆（上下兩半各算一層）。
     沒寫 level 的圖：照舊規則推算（名稱有「2樓」的圖層、或勾了舊的 deck2）
   還沒轉換的地圖（沒有 levels）：照舊規則推算（legacy 開頭的函式），跟以前完全一樣。
   轉換：地圖編輯器的「🏢 產生樓層資料」按鈕呼叫 MapLevels.convert，用舊規則算一次寫進地圖，之後在編輯器微調。

   tileOf：用素材 id 找素材（遊戲傳 mapTileById、編輯器傳 tileById），要有 w、h（格數）。
*/
const MapLevels = (() => {
  const LAYER_2F = /2樓|二樓/;
  const isOccLayer = lid => /^object\d*$/.test(lid) || lid === 'overlay';   // 物件、物件2～…、物件裝飾＝立體物
  const turn = s => ((Number(s && s.rot) || 0) % 4 + 4) % 4;
  const tw = t => (t && t.w) || 1, th = t => (t && t.h) || 1;
  const stampW = (s, t) => turn(s) % 2 ? th(t) : tw(t);
  const stampH = (s, t) => turn(s) % 2 ? tw(t) : th(t);
  const cellSize = () => (typeof CELL !== 'undefined' ? CELL : 40);
  const order = m => (m && Array.isArray(m.layerOrder) && m.layerOrder.length) ? m.layerOrder : [];

  // 名稱有「2樓」的圖層（整層都是 2 樓的圖）；名稱還有「上層」的永遠蓋在 2 樓的人上面
  function floor2Layers(m) {
    const all = new Set(), top = new Set();
    for (const l of order(m)) { const nm = String(l.name || ''); if (!LAYER_2F.test(nm)) continue; all.add(l.id); if (nm.includes('上層')) top.add(l.id); }
    return { all, top };
  }
  // 圖片蓋到的格子（half＝只算上半段）
  function cover(s, t, out, half = false) {
    const C = cellSize(), w = stampW(s, t), h = stampH(s, t), c0 = s.c + (s.ox || 0) / C, r0 = s.r + (s.oy || 0) / C, r1 = half ? r0 + h / 2 : r0 + h;
    for (let c = Math.ceil(c0 - .5); c + .5 < c0 + w; c++) for (let r = Math.ceil(r0 - .5); r + .5 < r1; r++) out.add(c + ',' + r);
    return out;
  }
  // ---- 舊規則（還沒轉換的地圖用；轉換時也用它算初版）----
  // 側面的手扶梯（能真的走的那種：沒有上下翻轉、旋轉、調大小角度）。遊戲有 js/escalators.js 的設定就照它；編輯器沒載入那個檔，用素材 id 判斷
  const sideEscalator = s => {
    const isSide = typeof ESCALATOR !== 'undefined' && ESCALATOR.side ? !!ESCALATOR.side.tiles[s.id] : s.id === 'tile_mrt_escalator_side';
    return isSide && !s.fy && !turn(s) && !(typeof stampHasTransform === 'function' && stampHasTransform(s));
  };
  const legacyStampOn2F = (s, L) => !!s.deck2 || L.all.has(s.layer || 'top');
  // 這張圖是不是 2 樓的圖：有寫 level 就照寫的，沒寫照舊規則
  const stampOn2F = (s, L) => s && s.level != null ? s.level !== 1 : legacyStampOn2F(s, L);
  // 2 樓「地板類」的圖蓋到的格子（不是物件、不是上層）
  function floorArtCells(m, tileOf, L) {
    const floor = new Set();
    for (const lid of L.all) if (!isOccLayer(lid) && lid !== 'top') for (const k of Object.keys((m.layers || {})[lid] || {})) floor.add(k);
    for (const s of m.stamps || []) { const lid = s.layer || 'top'; if (stampOn2F(s, L) && !isOccLayer(lid) && lid !== 'top') { const t = tileOf(s.id); if (t) cover(s, t, floor); } }
    return floor;
  }
  // 舊規則的「只有 2 樓」：2 樓地面（不是出入口）上，沒有任何一樓的圖蓋到的格子
  function legacyOnly2(m, tileOf, L) {
    const deck = new Set(m.deck || []), ramps = new Set(m.ramps || []), under = new Set();
    const ids = order(m).length ? order(m).map(l => l.id) : Object.keys(m.layers || {});
    for (const lid of ids) if (!L.all.has(lid)) for (const k in ((m.layers || {})[lid] || {})) under.add(k);
    for (const s of m.stamps || []) { if (stampOn2F(s, L)) continue; const t = tileOf(s.id); if (t) cover(s, t, under); }
    const out = new Set();
    for (const k of deck) if (!ramps.has(k) && !under.has(k)) out.add(k);
    return out;
  }
  // 舊規則的「跨樓層」（從一樓立到二樓的柱子、牆）：2 樓物件圖層裡、高 2 格以上、底部沒踩在 2 樓地面／2 樓地板圖上
  function legacyConnects(s, m, tileOf, L, deck, floorArt) {
    const lid = s.layer || 'top';
    if (!deck.size || !(m.ramps || []).length || !legacyStampOn2F(s, L) || !isOccLayer(lid) || L.top.has(lid)) return false;
    const t = tileOf(s.id); if (!t) return false;
    const C = cellSize(), w = stampW(s, t), h = stampH(s, t); if (h < 2) return false;
    if (sideEscalator(s)) return true;   // 側面的手扶梯一定是連接 1、2 樓的（跟 js/maploader.js 的 stampConnects 一樣）
    const c0 = s.c + (s.ox || 0) / C, r0 = s.r + (s.oy || 0) / C;
    for (let c = Math.ceil(c0 - .5); c + .5 < c0 + w; c++) if (deck.has(c + ',' + Math.ceil(r0 + h - .5))) return false;
    for (let c = Math.ceil(c0 - .5); c + .5 < c0 + w; c++) for (let r = Math.ceil(r0 + h / 2 - .5); r + .5 < r0 + h; r++) {
      const k = c + ',' + r; if (deck.has(k) || floorArt.has(k)) return false;
    }
    return true;
  }
  // 這張圖在幾樓：1、2 或 'span'
  function stampLevel(s, m, tileOf, ctx) {
    if (s.level != null) return s.level;
    const L = (ctx && ctx.L) || floor2Layers(m);
    if (!legacyStampOn2F(s, L)) return 1;
    const deck = (ctx && ctx.deck) || new Set(m.deck || []), art = (ctx && ctx.art) || floorArtCells(m, tileOf, L);
    return legacyConnects(s, m, tileOf, L, deck, art) ? 'span' : 2;
  }
  // 「只有 2 樓」的格子：轉換過的地圖照 only2，沒轉換的照舊規則
  function only2Cells(m, tileOf) {
    const deck = new Set(m.deck || []), ramps = new Set(m.ramps || []);
    if (m.levels) return new Set((m.only2 || []).filter(k => deck.has(k) && !ramps.has(k)));
    return legacyOnly2(m, tileOf, floor2Layers(m));
  }
  // 一格是哪一種：'1'＝只有 1 樓、'2'＝只有 2 樓、'b'＝陸橋（上下都有）、'r'＝樓層出入口
  function cellKind(k, deck, ramps, only2) {
    if (ramps.has(k)) return 'r';
    if (!deck.has(k)) return '1';
    return only2.has(k) ? '2' : 'b';
  }
  // 用舊規則算一次，把結果明確寫進地圖（只寫跟 1 樓不一樣的圖：2 樓、跨樓層，以及放在 2 樓圖層卻指定成 1 樓的）
  function convert(m, tileOf) {
    const L = floor2Layers(m), deck = new Set(m.deck || []), art = floorArtCells(m, tileOf, L);
    const only2 = legacyOnly2(m, tileOf, L);
    let n2 = 0, nSpan = 0;
    const levels = (m.stamps || []).map(s => s.level != null ? s.level : (legacyStampOn2F(s, L) ? (legacyConnects(s, m, tileOf, L, deck, art) ? 'span' : 2) : null));
    (m.stamps || []).forEach((s, i) => {
      const lv = levels[i];
      if (lv == null) return;
      s.level = lv; delete s.deck2;
      if (lv === 2) n2++; else if (lv === 'span') nSpan++;
    });
    m.only2 = [...only2]; m.levels = 1;
    return { only2: only2.size, bridge: [...deck].filter(k => !only2.has(k) && !(m.ramps || []).includes(k)).length, stamps2: n2, span: nSpan };
  }
  // 存檔前整理：only2 一定是 2 樓地面、不是出入口；沒轉換的地圖不動
  function normalize(m) {
    if (!m || !m.levels) return;
    const deck = new Set(m.deck || []), ramps = new Set(m.ramps || []);
    m.only2 = [...new Set((m.only2 || []).filter(k => deck.has(k) && !ramps.has(k)))];
  }

  // ---- 🔍 樓層檢查：列出可疑的地方 {kind, text, c, r} ----
  function check(m, tileOf) {
    const out = [], add = (kind, text, k) => { const [c, r] = String(k).split(',').map(Number); out.push({ kind, text, c, r }); };
    const deck = new Set(m.deck || []), ramps = new Set(m.ramps || []), solid = new Set(m.solid || []), solid2 = new Set(m.solid2 || []);
    if (!deck.size && !ramps.size) return out;
    if (!m.levels) out.push({ kind: 'info', text: '這張地圖還沒「🏢 產生樓層資料」：目前照舊規則推算（只有 2 樓的格子看有沒有鋪一樓的圖）', c: null, r: null });
    if (deck.size && !ramps.size) out.push({ kind: 'warn', text: '有 2 樓地面但沒有樓層出入口：沒有人上得去 2 樓', c: null, r: null });
    const only2 = only2Cells(m, tileOf), L = floor2Layers(m), art = floorArtCells(m, tileOf, L);
    const ctx = { L, deck, art };
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
    // 3. 2 樓的牆、柱子圖：最上面那列在 2 樓可以走 → 人走到邊上會被牆頂蓋住（R89 史萊姆被牆遮住就是這個）
    for (const s of m.stamps || []) {
      const lid = s.layer || 'top', lv = stampLevel(s, m, tileOf, ctx);
      if (lv !== 2 || !isOccLayer(lid) || L.top.has(lid)) continue;
      const t = tileOf(s.id); if (!t || t.flat || stampH(s, t) < 3 || Number.isFinite(s.sortDepth)) continue;
      if (!/wall|牆|欄|railing|pillar|柱/i.test(String(s.id) + String(t.name || ''))) continue;   // 只看牆、柱子、欄杆類（櫃子、箱子站在後面被遮是正常的）
      const C = cellSize(), c0 = s.c + (s.ox || 0) / C, r0 = Math.round(s.r + (s.oy || 0) / C), w = stampW(s, t);
      // 牆圖最上面那列 2 樓可以走、下一列走不過去＝這張牆是走道的前緣
      for (let c = Math.ceil(c0 - .5); c + .5 < c0 + w; c++) {
        const top = c + ',' + r0, below = c + ',' + (r0 + 1);
        if (walk2(top) && wall2(below) && deck.has(top)) { add('warn', '2 樓的牆圖最上面那列可以走：人走到邊上會被牆頂蓋住（在這列畫 🚧 2樓碰撞，或幫這張圖設排序深度）', top); break; }
      }
    }
    // 4. 物件（障礙物、礦物、會擋路的圖）一半在 2 樓地面上、一半不在
    for (const s of m.stamps || []) {
      const t = tileOf(s.id); if (!t || !(t.baseHp || /ore|礦/.test(String(s.id)))) continue;
      const all = [...cover(s, t, new Set())], bottom = Math.max(...all.map(k => +k.split(',')[1])), cells = all.filter(k => +k.split(',')[1] === bottom), on =   // 看底部那排（擋路的地方），圖片上半部伸出去沒關係
      cells.filter(k => deck.has(k) && !ramps.has(k)).length;
      const mid = cells.slice().sort((x, y) => +x.split(',')[0] - +y.split(',')[0])[Math.floor((cells.length - 1) / 2)];   // 底部中間那格（礦物、障礙物的擋路格通常在這裡）
      if (on && on < cells.length && !(deck.has(mid) && !ramps.has(mid))) add('warn', '可破壞物件（' + (t.name || s.id) + '）踩在 2 樓地面的邊緣：一半在 2 樓地面上、一半不在，會被當成 1 樓的東西', s.c + ',' + s.r);
    }
    // 5. 只有 2 樓的格子上鋪了一樓的圖（轉換過的地圖才看：可能是 only2 畫錯，或那張圖應該設成 2 樓）
    if (m.levels) {
      const under = new Set();
      for (const l of order(m)) if (!L.all.has(l.id) && !isOccLayer(l.id) && l.id !== 'top') for (const k in ((m.layers || {})[l.id] || {})) under.add(k);
      for (const s of m.stamps || []) { if (stampOn2F(s, L)) continue; const t = tileOf(s.id); if (!t || t.flat) continue; if (!isOccLayer(s.layer || 'top')) cover(s, t, under); }
      let n = 0;
      for (const k of only2) if (under.has(k) && n < 30) { add('info', '「只有 2 樓」的格子上鋪著一樓的地板圖：這格到底有沒有 1 樓？', k); n++; }
    }
    return out;
  }

  return { floor2Layers, floorArtCells, stampOn2F, stampLevel, only2Cells, cellKind, convert, normalize, check, isOccLayer };
})();
