// ============================================================
//  查看海報：走到海報前面按空白鍵，跳出放大的海報和說明（說明文字在 data/posters.js）
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
  if (spot.cfg.art) showPosterArt(spot.cfg.art);
  return true;
}
// ---- 原始海報的大圖（data/posters.js 的 art）：畫面左右置中，從低一點的位置在 POSTER_ART.time 秒內滑到最終位置（easeOutCubic）----
// 位置、大小都是「遊戲畫面高度的幾 %」：h＝海報高度、from＝剛出現時的上緣、to＝最後停住的上緣（照示意圖量的）
// gap＝海報下緣和說明對話框之間至少留幾 px：視窗比較矮、會被對話框擋到時，海報自動縮小（從剛出現的最低點就不會被擋）
const POSTER_ART = { time: 1, h: 51.7, from: 23.8, to: 18.9, gap: 12 };
let posterArtEl = null, posterArtRaf = 0;
function posterArtHeight(wrap) {
  const H = wrap.clientHeight, box = document.getElementById('dialogueBox');
  let h = H * POSTER_ART.h / 100;
  if (box && !box.classList.contains('hidden')) {
    const room = (box.getBoundingClientRect().top - wrap.getBoundingClientRect().top) - POSTER_ART.gap - H * POSTER_ART.from / 100;
    h = Math.min(h, room);
  }
  return Math.max(80, h);
}
function showPosterArt(src) {
  const wrap = document.getElementById('wrap'); if (!wrap) return;
  if (!posterArtEl) { posterArtEl = document.createElement('img'); posterArtEl.id = 'posterArt'; posterArtEl.alt = ''; wrap.appendChild(posterArtEl); }
  const el = posterArtEl, t0 = performance.now();
  el.src = src; el.style.height = posterArtHeight(wrap) + 'px'; el.style.top = POSTER_ART.from + '%'; el.hidden = false;
  cancelAnimationFrame(posterArtRaf);
  const step = now => {
    if (typeof dialogueState === 'undefined' || !dialogueState) { el.hidden = true; return; }   // 對話框關掉：海報一起收起來
    const k = Math.min(1, (now - t0) / (POSTER_ART.time * 1000)), ease = 1 - Math.pow(1 - k, 3);   // easeOutCubic
    el.style.top = (POSTER_ART.from + (POSTER_ART.to - POSTER_ART.from) * ease) + '%';
    posterArtRaf = requestAnimationFrame(step);
  };
  posterArtRaf = requestAnimationFrame(step);
}
const usePosterNearPlayer = () => viewPoster(posterNearPlayer());
