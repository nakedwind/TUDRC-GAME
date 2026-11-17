/* ===== 1、2 樓自動測試（樓層測試.html 把這個檔案載進遊戲畫面裡跑）=====
   每一項都在真的遊戲裡擺好情境、跑一次，看結果對不對。改了樓層相關的程式（js/pathfinding.js、js/map-levels.js、
   js/render.js、範圍攻擊、地上效果…）之後，打開 樓層測試.html 跑一次，全部通過再推。
   測試會用測試模式開 R89（或第一張有 2 樓的地圖），不會存檔。
*/
window.runFloorTests = async function (report) {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const results = [];
  const test = async (name, fn) => {
    let ok = false, note = '';
    try { const r = await fn(); ok = r === true || (r && r.ok); note = r && r.note ? r.note : ''; }
    catch (e) { ok = false; note = '程式錯誤：' + (e && e.message || e); }
    results.push({ name, ok, note }); if (report) report({ name, ok, note });
  };
  // ---- 準備：測試模式、靜音、開有 2 樓的地圖 ----
  try { Howler.mute(true); } catch (_) {}
  window.TEST_MODE = true;
  const map = mapList().find(m => m && m.id === 'map_mvxz356e') || mapList().find(m => m && (m.deck || []).length);
  if (!map) { report && report({ name: '找有 2 樓的地圖', ok: false, note: '沒有任何地圖有 2 樓地面' }); return results; }
  switchMap(mapIndexById(map.id)); await wait(800); begin(false); await wait(1200);
  window.TEST_MODE = true; G.player.hp = G.player.maxhp = 1e9; G.cores.forEach(c => { c.timer = 1e9; });
  G.enemies.length = 0;
  const only = floor2OnlyCells();
  const bridge = [...deckCells].filter(k => !only.has(k) && !rampCells.has(k) && !wallAt(2, ...k.split(',').map(Number)));
  const bridgeSpot = () => { const [c, r] = bridge[0].split(',').map(Number); return center(c, r); };
  const tower = () => { const t = G.towers[0]; t.frozenT = 999; t.hurtGraceT = 0; return t; };
  const putTower = (x, y, floor) => { const t = tower(); t.x = x; t.y = y; t.floor = floor; t._fk = cellAt(x, y).join(','); t.hp = t.maxhp; return t; };

  await test('地圖的樓層資料是明寫的（2 樓圖層、只有 2 樓的格子）', () => ({
    ok: only.size > 0 && (MAP.layerOrder || []).some(l => l.level === 2),
    note: '只有 2 樓 ' + only.size + ' 格、陸橋 ' + bridge.length + ' 格、2 樓圖層 ' + (MAP.layerOrder || []).filter(l => l.level === 2).length + ' 層' }));

  await test('珍珠：2 樓的會撞 2 樓的牆停下，1 樓的照常飛過去', () => {
    let pick = null;
    for (const k of deckCells) { const [c, r] = k.split(',').map(Number); if (wallAt(2, c, r) && !mapWalls.has(k) && [1, 2, 3].every(d => deckCells.has((c - d) + ',' + r) && !wallAt(2, c - d, r) && !wallAt(1, c - d, r))) { pick = [c, r]; break; } }
    if (!pick) return { ok: true, note: '這張地圖沒有適合的牆，略過' };
    const [x0, y0] = center(pick[0] - 3, pick[1]), owner = { x: x0, y: y0, atkCd: 0 };
    const fly = floor => { G.pearls = [{ x: x0, y: y0, z: 20, vx: 200, vy: 0, vz: 0, left: 400, owner, floor, spin: 0, trail: [] }]; let lastX = x0, n = 0; while (G.pearls.length && n < 60) { lastX = G.pearls[0].x; updatePearls(1 / 30); n++; } return (lastX - OX) / CELL; };
    const a = fly(2), b = fly(1);
    return { ok: a < pick[0] + .5 && b > pick[0] + .5, note: '牆在第 ' + pick[0] + ' 欄；2 樓的停在 ' + a.toFixed(1) + '、1 樓的飛到 ' + b.toFixed(1) };
  });

  await test('照明彈：照溫特在幾樓判斷牆', () => {
    const p = G.player; let pick = null;
    for (const k of deckCells) { const [c, r] = k.split(',').map(Number); if (wallAt(2, c, r) && !mapWalls.has(k) && [1, 2, 3].every(d => deckCells.has((c - d) + ',' + r) && !wallAt(2, c - d, r))) { pick = [c, r]; break; } }
    if (!pick) return { ok: true, note: '略過' };
    const [x, y] = center(pick[0] - 3, pick[1]); p.x = x; p.y = y; p.floor = 2;
    G.flareShots = []; setFloorCtx(p); fireFlare(p, { x: x + 400, y }); clearFloorCtx();
    const land = (G.flareShots[0].x1 - OX) / CELL; G.flareShots = [];
    return { ok: land < pick[0] + .5, note: '牆在第 ' + pick[0] + ' 欄，照明彈落在 ' + land.toFixed(1) };
  });

  const slime = ACTIVE_MONSTERS.find(m => m.id === 'slime');
  await test('史萊姆自爆：2 樓的炸不到正下方 1 樓的隊員，1 樓的炸得到', () => {
    if (!bridge.length || !slime) return { ok: true, note: '沒有陸橋或史萊姆，略過' };
    const [x, y] = bridgeSpot();
    let t = putTower(x, y, 1); const s2 = createMonster(slime, x, y); s2.floor = 2; G.enemies.push(s2); slimeExplode(s2, 1); const hurt2 = t.hp < t.maxhp;
    t = putTower(x, y, 1); const s1 = createMonster(slime, x, y); s1.floor = 1; G.enemies.push(s1); slimeExplode(s1, 1); const hurt1 = t.hp < t.maxhp;
    G.enemies.length = 0;
    return { ok: !hurt2 && hurt1, note: '2 樓自爆傷到 1 樓：' + hurt2 + '；1 樓自爆傷到 1 樓：' + hurt1 };
  });

  await test('地雷：2 樓的地雷炸不到同位置 1 樓的怪物', () => {
    if (!bridge.length || !slime) return { ok: true, note: '略過' };
    const [x, y] = bridgeSpot(), [c, r] = cellAt(x, y);
    const e = createMonster(slime, x, y); e.floor = 1; e.variant = null; G.enemies.push(e); const hp0 = e.hp;
    const mine = { kind: 'obstacle', trap: true, type: 'landmine', c, r, w: 1, h: 1, solid: [], hp: 10, maxhp: 10, floor: 2 }; G.obstacles.push(mine); detonateMine(mine);
    const ok = e.hp === hp0; G.enemies.length = 0;
    return { ok, note: ok ? '沒被炸到' : '被炸到了' };
  });

  await test('魚卵、酸液池：只影響同一層', () => {
    if (!bridge.length) return { ok: true, note: '略過' };
    const [x, y] = bridgeSpot();
    let t = putTower(x, y, 1); (G.fishEggs = G.fishEggs || []).push({ x, y, floor: 2, vx: 0, vy: 0, arm: 0, life: 9, age: 0, fuse: 0, seed: 1 }); blowFishEgg(G.fishEggs[G.fishEggs.length - 1]);
    const egg = t.hp < t.maxhp;
    t = putTower(x, y, 1); G.acidPools = [{ x, y, floor: 2, r: 60, t: 9, t0: 9, dps: 50, blobs: [], fizz: 0 }]; for (let i = 0; i < 60; i++) update(1 / 30); const acid = t.hp < t.maxhp; G.acidPools = [];
    return { ok: !egg && !acid, note: '2 樓魚卵傷到 1 樓：' + egg + '；2 樓酸液傷到 1 樓：' + acid };
  });

  await test('葫蘆猴王落石：落在陸橋上只砸 2 樓的人', () => {
    if (!bridge.length || typeof gkRockFloor !== 'function') return { ok: true, note: '略過' };
    const [x, y] = bridgeSpot(), R = GOURD_KING.rocks;
    let t = putTower(x, y, 1); G.gkRocks = [{ x, y, floor: gkRockFloor(x, y), t: R.fall, seed: 1, size: 1 }]; updateGkRocks(1 / 30); const under = t.hp < t.maxhp;
    t = putTower(x, y, 2); G.gkRocks = [{ x, y, floor: gkRockFloor(x, y), t: R.fall, seed: 1, size: 1 }]; updateGkRocks(1 / 30); const on = t.hp < t.maxhp;
    return { ok: !under && on, note: '橋下被砸：' + under + '；橋上被砸：' + on };
  });

  await test('範圍效果入口 areaTargets：只回傳同一層', () => {
    if (!bridge.length) return { ok: true, note: '略過' };
    const [x, y] = bridgeSpot(); putTower(x, y, 1);
    const a1 = areaTargets(x, y, 40, { floor: 1, enemies: false, player: false }).length, a2 = areaTargets(x, y, 40, { floor: 2, enemies: false, player: false }).length;
    return { ok: a1 === 1 && a2 === 0, note: '1 樓找到 ' + a1 + '、2 樓找到 ' + a2 };
  });

  await test('怪物出生區：不會挑到那一層的牆', () => {
    const zone = MAP.spawnZone || []; if (!zone.length) return { ok: true, note: '這張地圖沒畫出生區，略過' };
    const cells = zoneSpawnCells(zone), bad = cells.filter(([c, r]) => spawnWallAt(c, r)).length;
    return { ok: bad === 0, note: '候選 ' + cells.length + ' 格、其中在牆裡 ' + bad + ' 格' };
  });

  await test('碎片：2 樓的碎片在 1 樓撿不到', () => {
    if (!bridge.length) return { ok: true, note: '略過' };
    const [x, y] = bridgeSpot(), p = G.player; p.x = x; p.y = y; p.floor = 1;
    G.oreShards = [{ x, y: y + 4, z: 0, vx: 0, vy: 0, vz: 0, value: 1, t: 9, spin: 0, floor: 2 }];
    const from1 = !!shardNearPlayer(); p.floor = 2; const from2 = !!shardNearPlayer(); G.oreShards = [];
    return { ok: !from1 && from2, note: '1 樓撿得到：' + from1 + '；2 樓撿得到：' + from2 };
  });

  await test('畫面順序：先畫完 1 樓再畫 2 樓，2 樓地板在 2 樓的人下面', () => {
    const s = [{ floor: 2, band: DRAW_BAND.obj, y: 5 }, { floor: 1, band: DRAW_BAND.obj, y: 99999 }, { floor: 2, band: DRAW_BAND.ground, y: 1 }, { floor: 2, band: DRAW_BAND.groundFx, y: 0 }, { floor: 1, band: DRAW_BAND.ground, y: 3 }];
    const order = s.slice().sort(drawOrder).map(o => o.floor + ':' + o.band).join(' ');
    const items = mapOccluders(), wrong = items.filter(it => (itemOn2F(it) ? 2 : 1) !== it.floor).length;
    return { ok: order === '1:0 1:2 2:0 2:1 2:2' && wrong === 0, note: '排序 ' + order + '；地圖圖片樓層標錯 ' + wrong + ' 張（共 ' + items.length + ' 張）' };
  });

  await test('手扶梯：乘客的身體碰到上半段時畫在 2 樓地板之上（不會被上半段的階梯蓋住）', () => {
    const lanes = typeof escalatorSideLanes === 'function' ? escalatorSideLanes().filter(L => escalatorSideTo2F(L)) : [];
    if (!lanes.length) return { ok: true, note: '這張地圖沒有接到 2 樓的側面手扶梯，略過' };
    const p = G.player; let bad = 0, n = 0;
    for (const L of lanes) {
      for (let f = 0; f <= 1.001; f += .05) {
        const ix = L.spec.x0 + (L.spec.x1 - L.spec.x0) * f; p.x = L.fx ? L.x + (L.spec.size - ix) * L.k : L.x + ix * L.k;
        p.y = escalatorSideTopY(L, p.x) + (L.spec.band[0] + L.spec.band[1]) / 2 * L.k - ESCALATOR.footDy; p.floor = 1; p.escSide = null;
        setFloorCtx(p); rideSideEscalator(p, ESCALATOR.footDy, .001, () => false); clearFloorCtx();
        if (!p.escSide) continue; n++;
        const key = escalatorRiderKey(p, p.y + 16), reachesUpper = p.y + ESCALATOR.footDy - ESCALATOR.riderTall < L.y + L.h / 2;
        if (reachesUpper && key.floor !== 2) bad++;
      }
    }
    p.escSide = null;
    return { ok: bad === 0 && n > 0, note: '檢查 ' + n + ' 個位置，身體碰到上半段卻畫在 1 樓的有 ' + bad + ' 個' };
  });

  await test('放東西：只有 2 樓的格子一律放在 2 樓，陸橋上照放的人在幾樓', () => {
    const p = G.player, o = [...only][0]; if (!o || !bridge.length) return { ok: true, note: '略過' };
    const [ox, oy] = center(...o.split(',').map(Number)), [bx, by] = bridgeSpot();
    p.floor = 1; p.escSide = null; p.x = bx; p.y = by;
    const onOnly = placeFloorAt(ox, oy, p), onBridge1 = placeFloorAt(bx, by, p); p.floor = 2; const onBridge2 = placeFloorAt(bx, by, p);
    return { ok: onOnly === 2 && onBridge1 === 1 && onBridge2 === 2, note: '只有 2 樓→' + onOnly + '；陸橋（人在 1 樓）→' + onBridge1 + '；陸橋（人在 2 樓）→' + onBridge2 };
  });

  await test('微調過位置的自帶碰撞物件：碰撞格跟著圖片走（1、2 樓都是）', () => {
    if (typeof propCollisionList !== 'function') return { ok: true, note: '略過' };
    const probe = (f, x, y) => onFloorDo(f, () => solidBlocksPoint(x, y));
    let checked = 0, bad = 0, sample = '';
    for (const s of MAP.stamps || []) {
      const cfg = (propCollisionList().find(o => o.tile === s.id) || {}).h; if (!cfg || !(s.ox || s.oy)) continue;
      const f = stampOn2F(s) && s.level !== 'span' ? 2 : 1;
      for (const [dc, dr] of cfg.solid || []) {
        if (dc < 0 || dr < 0 || dc >= cfg.w || dr >= cfg.h) continue;
        const c = s.c + (s.fx ? cfg.w - 1 - dc : dc), r = s.r + (s.fy ? cfg.h - 1 - dr : dr);
        const k = (c + Math.round((s.ox || 0) / CELL)) + ',' + (r + Math.round((s.oy || 0) / CELL));
        if (!(f === 2 ? propAddedWalls2F.has(k) : propAddedWalls.has(k))) continue;   // 那格本來就被別的東西擋住：不算
        checked++;
        if (!probe(f, OX + (c + .5) * CELL + (s.ox || 0), OY + (r + .5) * CELL + (s.oy || 0))) { bad++; sample = s.id + ' (' + c + ',' + r + ')'; }   // 微調後的位置一定要擋
      }
    }
    return { ok: bad === 0, note: '檢查 ' + checked + ' 格，微調後的位置沒擋住的有 ' + bad + ' 格' + (sample ? '（例如 ' + sample + '）' : '') };
  });

  await test('微調過位置的礦物、可破壞物件：碰撞跟著圖片走', () => {
    let checked = 0, bad = 0, sample = '';
    for (const o of G.obstacles) {
      if (!o.mapSource || typeof o.mapSource !== 'object' || !o.solid || !o.solid.length) continue;
      const s = o.mapSource; if (!(s.ox || s.oy)) continue;
      const t = mapTileById(s.id), spec = mapObstacleSpec(t), w = mapStampW(s, t), h = mapStampH(s, t);
      if (typeof stampScaleOf === 'function' && stampScaleOf(s) !== 1) continue;   // 放大縮小過的另外算，這裡略過
      const want = (spec.solid || []).map(([dc, dr]) => [s.fx ? w - 1 - dc : dc, s.fy ? h - 1 - dr : dr]);
      for (const [dc, dr] of want) {
        if (!o.solid.some(([a, b]) => a === dc && b === dr)) continue;   // 被旁邊的東西佔走的格子：不算
        const x = OX + (s.c + dc + .5) * CELL + (s.ox || 0), y = OY + (s.r + dr + .5) * CELL + (s.oy || 0);   // 圖片上這一格的中心（含微調）
        checked++;
        if (onFloorDo(looseFloor(o), () => gridAtPointForWalker(x, y)) !== o) { bad++; sample = o.type + ' (' + s.c + ',' + s.r + ')'; }
      }
    }
    return { ok: bad === 0, note: '檢查 ' + checked + ' 格，圖片位置上沒擋住的有 ' + bad + ' 格' + (sample ? '（例如 ' + sample + '）' : '') };
  });

  await test('隊員找路：手扶梯優先走順向（只有逆向能到才走逆向）', () => {
    if (typeof escalatorFlowAt !== 'function') return { ok: true, note: '略過' };
    const t = tower(); t.escSide = null; let checked = 0, bad = 0, note = '';
    const walk = (c, r, f) => onFloorDo(f, () => sentryCellWalkable(c, r, false, true));
    // 每一組正面手扶梯（一上一下並排）：從下面找路到上面、從上面找路到下面，都不能逆著走
    for (const l of escalatorLanes()) {
      const c0 = Math.floor(((l.x0 + l.x1) / 2 - OX) / CELL), rTop = Math.floor((l.y0 - OY) / CELL), rBot = Math.floor((l.y1 - OY) / CELL);
      if (!escalatorLanes().some(o => o !== l && o.stamp === l.stamp && Math.sign(o.dir) !== Math.sign(l.dir))) continue;   // 只有一條的不算（沒得選）
      let below = null, above = null;
      for (let r = rBot + 4; r >= rBot && !below; r--) for (let c = c0 - 2; c <= c0 + 3; c++) if (!deckCells.has(c + ',' + r) && walk(c, r, 1)) { below = [c, r]; break; }
      for (let r = rTop - 4; r <= rTop && !above; r++) for (let c = c0 - 2; c <= c0 + 3; c++) if (deckCells.has(c + ',' + r) && !rampCells.has(c + ',' + r) && walk(c, r, 2)) { above = [c, r]; break; }
      if (!below || !above) continue;
      for (const [from, ff, to, tf] of [[below, 1, above, 2], [above, 2, below, 1]]) {
        [t.x, t.y] = center(...from); t.floor = ff;
        const path = buildSentryPath(t, ...center(...to), true, tf); if (!path) continue;
        checked++; let prev = from;
        for (const n of path) { const fl = escalatorFlowAt(n.c, n.r) || escalatorFlowAt(prev[0], prev[1]); if (fl && (n.c - prev[0]) * fl[0] + (n.r - prev[1]) * fl[1] < 0) { bad++; note = '(' + from + ')→(' + to + ') 有逆向'; break; } prev = [n.c, n.r]; }
      }
      break;   // 測一組就夠
    }
    return { ok: bad === 0, note: checked ? '檢查 ' + checked + ' 條路線，逆向的 ' + bad + ' 條' + (note ? '：' + note : '') : '這張地圖沒有一上一下的正面手扶梯，略過' };
  });

  await test('隊員跟著溫特上下樓（會搭側面手扶梯，不會停在手扶梯上）', async () => {
    const links = typeof sentryEscalatorLinks === 'function' ? sentryEscalatorLinks(true) : [];
    if (!links.length) return { ok: true, note: '這張地圖沒有側面手扶梯，略過' };
    const ln = links[0], p = G.player, keep = { light: LIGHT.enabled };
    LIGHT.enabled = false;   // 只測找路，不管暗處
    try {
      G.enemies.length = 0; G.cores.forEach(c => { c.timer = 1e9; });
      const [lx, ly] = center(...ln.a), [hx, hy] = center(...ln.b);
      p.x = lx; p.y = ly + CELL; p.floor = 1; p._fk = null; p.escSide = null;
      G.towers.forEach((t, i) => { t.x = lx - CELL * (1 + i % 2); t.y = ly + CELL * (i >> 1); t.floor = 1; t._fk = null; t.escSide = null; t.navPath = null; t.navGoal = null; t.mode = 'free'; t.target = null; t.hp = t.maxhp; t.frozenT = 0; });
      for (let i = 0; i < 30; i++) update(1 / 30);
      const upTo = (deckCells.has((ln.b[0] + 2) + ',' + ln.b[1]) ? [ln.b[0] + 2, ln.b[1]] : ln.b);
      [p.x, p.y] = center(...upTo); p.floor = 2; p._fk = null;
      let upT = null; for (let i = 0; i < 30 * 30; i++) { update(1 / 30); if (G.towers.every(t => t.floor === 2 && !onMovingEscalator(t))) { upT = i / 30; break; } if (i % 300 === 0) await wait(0); }
      // 沒到齊的隊員停在哪裡（失敗時寫在說明裡，方便查）
      const stuck = want => G.towers.filter(t => !(t.floor === want && !onMovingEscalator(t))).map(t => (t.type || '?') + '@' + cellAt(t.x, t.y).join(',') + ' ' + t.floor + '樓' + (onMovingEscalator(t) ? '(手扶梯上)' : '') + (t.frozenT > 0 ? '(定住)' : '') + (t.mode && t.mode !== 'free' ? '(' + t.mode + ')' : '')).join('、');
      const upStuck = upT == null ? stuck(2) : '';
      p.x = lx; p.y = ly + CELL; p.floor = 1; p._fk = null;
      let downT = null; for (let i = 0; i < 30 * 40; i++) { update(1 / 30); if (G.towers.every(t => t.floor === 1 && !onMovingEscalator(t))) { downT = i / 30; break; } if (i % 300 === 0) await wait(0); }
      const downStuck = downT == null ? stuck(1) : '';
      return { ok: upT != null && downT != null, note: '上樓 ' + (upT != null ? upT.toFixed(1) + ' 秒全員到齊' : '30 秒內沒到齊（' + upStuck + '）') + '；下樓 ' + (downT != null ? downT.toFixed(1) + ' 秒' : '40 秒內沒到齊（' + downStuck + '）') };
    } finally { LIGHT.enabled = keep.light; }
  });

  await test('實際打一分鐘：沒有漏設樓層、體檢乾淨、畫面沒有沒標樓層的東西', async () => {
    begin(false); await wait(800); window.TEST_MODE = true; G.player.hp = G.player.maxhp = 1e9;
    floorUnscopedLog.clear(); floorAuditSeen.clear(); drawFloorWarned.clear();
    const warns = [], ow = console.warn; console.warn = (...a) => { warns.push(a.join(' ')); ow(...a); };
    const onlyList = [...only];
    try {
      for (let i = 0; i < 1800; i++) {
        if (i % 90 === 0 && onlyList.length) { const k = onlyList[Math.floor(Math.random() * onlyList.length)].split(',').map(Number); [G.player.x, G.player.y] = center(...k); G.player.floor = 2; updateCamera(); }
        setFloorCtx(G.player); updatePlayer(1 / 30); updateActorFloor(G.player); clearFloorCtx(); update(1 / 30);
        if (i % 10 === 0) draw();
        if (i % 150 === 0) G.cores.forEach(c => { if (!c.awake) wakeCore(c); c.timer = Math.min(c.timer, .2); });
        if (i % 300 === 0) await wait(0);   // 讓畫面有機會更新進度
      }
    } finally { console.warn = ow; }
    const floorWarns = [...new Set(warns.filter(w => w.includes('樓層')))];
    return { ok: !floorWarns.length && !(floorAudit(99) || []).length, note: '場上怪物 ' + G.enemies.length + ' 隻；' + (floorWarns.length ? floorWarns.slice(0, 3).join('｜') : '沒有任何樓層警告') };
  });
  return results;
};
