/* ===== 物件的大小（scale）與角度（angle）=====
   地圖物件（stamp）可以各自設定放大幾 %、多轉幾度，純外觀：佔的格子、碰撞、紅格都不會變。
   ・s.scale：百分比（150＝放大 1.5 倍）；100％ 不存。
   ・s.angle：在原本 90 度一格的 s.rot 之外再多轉幾度；0 度不存。
   放大以「圖片底部中央」為基準（樹根留在原地、往上長），旋轉繞放大後圖片的中心。
   地圖編輯器、基地編輯器、劇情地圖編輯器、遊戲（js/maploader.js）、閒聊／劇情編輯器的底圖都共用這裡的算法，看到的才會一樣。
   下面的 x、y、w、h 都是物件原本佔的範圍（像素，已含 s.rot 轉向後的寬高）。 */
const stampScaleOf = s => { const v = Number(s && s.scale); return v > 0 ? v / 100 : 1; };
const stampAngleOf = s => Number(s && s.angle) || 0;
const stampHasTransform = s => stampScaleOf(s) !== 1 || stampAngleOf(s) !== 0;
function applyStampTransform(ctx, s, x, y, w, h) {
  const k = stampScaleOf(s), a = stampAngleOf(s), cx = x + w / 2;
  ctx.translate(cx, y + h - h * k / 2);
  if (a) ctx.rotate(a * Math.PI / 180);
  if (k !== 1) ctx.scale(k, k);
  ctx.translate(-cx, -(y + h / 2));
}
// 在已套用大小、角度的座標裡畫；沒設定的物件直接畫（不多做 save／restore）
function withStampTransform(ctx, s, x, y, w, h, draw) {
  if (!stampHasTransform(s)) return draw();
  ctx.save(); applyStampTransform(ctx, s, x, y, w, h);
  const out = draw();
  ctx.restore();
  return out;
}
// 畫出來實際蓋到的外接長方形
function stampVisualBox(s, x, y, w, h) {
  const k = stampScaleOf(s), a = stampAngleOf(s) * Math.PI / 180, cos = Math.abs(Math.cos(a)), sin = Math.abs(Math.sin(a));
  const cx = x + w / 2, cy = y + h - h * k / 2, hw = (w * cos + h * sin) * k / 2, hh = (w * sin + h * cos) * k / 2;
  return { x0: cx - hw, y0: cy - hh, x1: cx + hw, y1: cy + hh };
}
// 這個點有沒有點在畫出來的圖上（轉過的圖也照轉過的範圍算）
function stampHitTest(s, x, y, w, h, px, py) {
  const k = stampScaleOf(s), a = stampAngleOf(s) * Math.PI / 180, dx = px - (x + w / 2), dy = py - (y + h - h * k / 2);
  const u = dx * Math.cos(a) + dy * Math.sin(a), v = -dx * Math.sin(a) + dy * Math.cos(a);
  return Math.abs(u) <= w * k / 2 && Math.abs(v) <= h * k / 2;
}
// 人物遮擋線：跟著圖片一起縮放，線才會留在圖片的同一個位置（depthPx＝沒縮放時離頂端幾像素）
const stampDepthY = (s, y, h, depthPx) => y + h - (h - depthPx) * stampScaleOf(s);
