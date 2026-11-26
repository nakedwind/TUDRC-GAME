/* ===== 水草微微晃動 =====
   地圖上擺的水草物件圖（KELP_SWAY.tiles 列的那幾張）會跟著水流輕輕左右擺：
   根部（圖的最下面）固定不動，越往上擺得越多，而且上下不同段的擺動會錯開一點，看起來像一條軟軟的水草在水裡飄。
   做法：把圖橫切成很多薄片，每一片照它的高度往左或往右挪一點再畫（js/maploader.js 的 drawMapStampPlain 呼叫 drawKelpSway）。
   每一株的節奏用它在地圖上的位置錯開，不會整片一起擺。
   只影響畫面，不影響碰撞、圖層前後。 */
const KELP_SWAY = {
  tiles: ['tile_poolcore_kelp_curved', 'tile_poolcore_kelp_tall', 'tile_poolcore_kelp_slender'],   // 哪些物件圖會晃（data/tiles.js 的 id）
  amp: 3,          // 最頂端最多往左右擺幾像素
  speed: 1.1,      // 擺多快（數字越大越快）
  wave: 1.6,       // 從根部到頂端錯開多少（0＝整株一起擺，越大越像波浪往上傳）
  bend: 1.6,       // 擺動怎麼隨高度變大（1＝平均變大，越大越集中在頂端、根部越穩）
  strips: 16,      // 切成幾片來畫（越多越平滑，但越耗效能）
};
const kelpSwaySet = new Set(KELP_SWAY.tiles);
// 這張物件要不要晃：是水草就自己畫、回傳 true；不是就回傳 false 讓原本的畫法畫
// (x, y, w, h)：圖要畫在哪裡、多大（已經照物件的位置算好）
function drawKelpSway(ctx, s, t, img, x, y, w, h) {
  if (!t || !kelpSwaySet.has(t.id) || !img || !img.naturalWidth) return false;
  const C = KELP_SWAY, now = performance.now() / 1000;
  const seed = (s.c * 12.9898 + s.r * 78.233) % 6.283;   // 每一株用位置錯開節奏
  const n = Math.max(2, C.strips | 0), iw = img.naturalWidth, ih = img.naturalHeight;
  for (let i = 0; i < n; i++) {
    const v0 = i / n, v1 = (i + 1) / n;            // 這一片在圖裡的上緣、下緣（0＝最上面）
    const up = 1 - (v0 + v1) / 2;                  // 離根部多高（0＝根部、1＝頂端）
    const dx = Math.pow(up, C.bend) * C.amp * Math.sin(now * C.speed + seed - up * C.wave);
    const sy = Math.floor(v0 * ih), sh = Math.max(1, Math.floor(v1 * ih) - sy);
    const dy = y + v0 * h, dh = h * (v1 - v0) + .5;   // 多畫半像素，片與片之間不會露出細縫
    ctx.drawImage(img, 0, sy, iw, sh, x + dx, dy, w, dh);
  }
  return true;
}
