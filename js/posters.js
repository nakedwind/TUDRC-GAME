// ============================================================
//  查看海報：走到海報前面按空白鍵／E，跳出放大的海報和說明（說明文字在 data/posters.js）
//  外觀跟 NPC 對話一樣（js/game.js 的 openTextDialogue）：左邊是海報圖，說明一句一句顯示。
// ============================================================
const POSTER_REACH = 1.4;   // 站在海報前幾格內可以看
function posterSpots() {
  if (typeof POSTERS === 'undefined' || !MAP) return [];
  const spots = [];
  const add = (id, c, r, s) => {
    const cfg = POSTERS[id], t = cfg && mapTileById(id); if (!t) return;
    const x0 = OX + c * CELL + (s?.ox || 0), y0 = OY + r * CELL + (s?.oy || 0), w = mapTileW(t) * CELL, h = mapTileH(t) * CELL;
    spots.push({ id, cfg, tile: t, x: x0 + w / 2, bottom: y0 + h, top: y0 });
  };
  for (const s of MAP.stamps || []) add(s.id, s.c, s.r, s);
  for (const layer of Object.values(MAP.layers || {})) for (const [key, id] of Object.entries(layer)) { if (!POSTERS[id]) continue; const [c, r] = key.split(',').map(Number); add(id, c, r, null); }
  return spots;
}
function posterNearPlayer() {
  const p = G && G.player; if (!p || p.sitting || p.hp <= 0) return null;
  let best = null, bd = POSTER_REACH * CELL;
  for (const s of posterSpots()) {
    if (p.y < s.bottom - 10) continue;   // 要站在海報下面（前面）
    const d = Math.hypot(s.x - p.x, s.bottom - p.y);
    if (d < bd) { bd = d; best = s; }
  }
  return best;
}
// 跟 NPC 對話一樣的對話框：左邊放海報圖、名稱欄寫海報名稱，說明照 \n 分成一句一句
function viewPoster(spot) {
  if (!spot || typeof openTextDialogue !== 'function') return false;
  openTextDialogue({ name: spot.cfg.title, image: String(spot.tile.file || ''), lines: String(spot.cfg.text || '').split('\n').filter(Boolean), kind: 'poster' });
  return true;
}
const usePosterNearPlayer = () => viewPoster(posterNearPlayer());
