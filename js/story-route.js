/* 回憶劇情的找路：角色從 A 走到 B 實際會走哪條路。
   遊戲（js/story-scene.js）和劇情編輯器（js/story-editor.js）共用這一份，
   所以編輯器地圖上畫的走位虛線＝遊戲裡真的會走的路線（遇到牆、長椅會繞過去）。
   座標單位都是「遊戲像素」（一格 cell 像素）；open(欄, 列)＝這格能不能走、cellAt(x, y)＝像素在哪一格。 */
const StoryRoute = (() => {
  // 腳底的一小塊範圍（像素）：這四個角沿直線走過去都不能碰到擋路的格子
  const FOOT = [[-9, -5], [9, -5], [-9, 5], [9, 5]];
  function clearLine(x1, y1, x2, y2, open, cellAt) {
    const n = Math.ceil(Math.hypot(x2 - x1, y2 - y1) / 8);
    for (let i = 1; i <= n; i++) {
      const x = x1 + (x2 - x1) * i / n, y = y1 + (y2 - y1) * i / n;
      for (const [ox, oy] of FOOT) if (!open(...cellAt(x + ox, y + oy))) return false;
    }
    return true;
  }
  // 直線走得過去就直接走；不行就做 8 方向格線搜尋，再把看得到的轉角拉直（人才不會一格一格轉彎）
  // 回傳一串要經過的點 [[x, y], …]，最後一點就是 (tx, ty)
  function find(x, y, tx, ty, open, cellAt, cell) {
    if (clearLine(x, y, tx, ty, open, cellAt)) return [[tx, ty]];
    const [sc, sr] = cellAt(x, y), [gc, gr] = cellAt(tx, ty), key = (c, r) => c + ',' + r;
    const from = new Map([[key(sc, sr), null]]), queue = [[sc, sr]];
    for (let i = 0; i < queue.length; i++) {
      const [c, r] = queue[i];
      if (c === gc && r === gr) break;
      for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
        const nc = c + dc, nr = r + dr, k = key(nc, nr);
        if (from.has(k) || !(open(nc, nr) || (nc === gc && nr === gr))) continue;
        if (dc && dr && !(open(c + dc, r) && open(c, r + dr))) continue;   // 斜走不切牆角
        from.set(k, key(c, r)); queue.push([nc, nr]);
      }
    }
    if (!from.has(key(gc, gr))) return [[tx, ty]];   // 找不到路：直接走過去
    const cells = [];
    for (let k = key(gc, gr); k && k !== key(sc, sr); k = from.get(k)) cells.unshift(k.split(',').map(Number));
    const pts = [...cells.slice(0, -1).map(([c, r]) => [(c + .5) * cell, (r + .5) * cell]), [tx, ty]];
    const out = [];
    for (let i = 0, px = x, py = y; i < pts.length;) {
      let j = pts.length - 1;
      while (j > i && !clearLine(px, py, ...pts[j], open, cellAt)) j--;
      out.push(pts[j]); [px, py] = pts[j]; i = j + 1;
    }
    return out;
  }
  // 給編輯器用：一張地圖上擋路的格子＝地圖畫的不可穿透格＋椅子、床的擋路格（椅子編輯器設定）
  // 算法跟遊戲 js/maploader.js 的 addChairSolid 一樣（圖章用方向鍵微調過位置的，擋路格也跟著挪整數格）
  // 電梯（關著）：先把電梯圖範圍內畫的牆清掉，再放電梯設定的擋路格（跟 js/maploader.js 的 setElevatorSolids 一樣）
  // tileSize(id)＝[寬, 高]（格）、chairCfg(id)＝椅子設定、elevatorCfg(id)＝電梯設定（沒有就回傳空）
  function mapWalls(map, tileSize, chairCfg, cell, elevatorCfg = () => null) {
    const walls = new Set(map?.solid || []);
    for (const s of map?.stamps || []) {
      const cfg = elevatorCfg(s.id); if (!cfg?.closed) continue;
      const [w, h] = tileSize(s.id), c0 = s.c + Math.round((s.ox || 0) / cell), r0 = s.r + Math.round((s.oy || 0) / cell);
      for (let dr = 0; dr < h; dr++) for (let dc = 0; dc < w; dc++) walls.delete((c0 + dc) + ',' + (r0 + dr));
      for (const [dc, dr] of cfg.closed.solid || []) if (dc >= 0 && dc < w && dr >= 0 && dr < h) walls.add((c0 + dc) + ',' + (r0 + dr));
    }
    const add = (id, c, r, stamp) => {
      const cfg = chairCfg(id); if (!cfg || !Array.isArray(cfg.solid)) return;
      const [tw, th] = tileSize(id), rot = stamp ? ((Number(stamp.rot) || 0) % 4 + 4) % 4 : 0;
      const w = rot % 2 ? th : tw, h = rot % 2 ? tw : th;
      for (const [x, y] of cfg.solid) {
        const [dx, dy] = rot === 1 ? [th - 1 - y, x] : rot === 2 ? [tw - 1 - x, th - 1 - y] : rot === 3 ? [y, tw - 1 - x] : [x, y];
        walls.add((c + (stamp?.fx ? w - 1 - dx : dx)) + ',' + (r + (stamp?.fy ? h - 1 - dy : dy)));
      }
    };
    for (const layer of Object.values(map?.layers || {})) for (const [k, id] of Object.entries(layer)) { const [c, r] = k.split(',').map(Number); add(id, c, r, null); }
    for (const s of map?.stamps || []) add(s.id, s.c + Math.round((s.ox || 0) / cell), s.r + Math.round((s.oy || 0) / cell), s);
    return walls;
  }
  return { clearLine, find, mapWalls };
})();
