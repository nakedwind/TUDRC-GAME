/* ===== 躺床睡覺：頭上飄「ZZZ」=====
   ・溫特、隊員（G.towers）、基地 NPC（G.npcs）躺在床上（sitting.bed）時，頭上冒出幾個 Z：由小變大、往右上飄、邊飄邊淡出，循環播放
   ・球球睡在自己的床上（js/ball-poses.js 的 ballSleeping）也一樣
   ・起床／離開床（sitting 清掉）就不畫了；被麻醉彈打睡的（sleepT）由 js/special-guns.js 的 drawSleepMarks 畫，這裡跳過
   ・系統設定「減少動態效果」（prefers-reduced-motion）時：只畫一組不動的 Z
   ・render.js 在最上層（黑幕、屋簷之上）呼叫 drawBedZzz，不會被床或其他物件蓋住
*/
const BED_ZZZ = {
  count: 3,          // 同時幾個 Z
  period: 2.4,       // 一個 Z 從冒出到消失幾秒
  rise: 22,          // 往上飄幾像素
  drift: 12,         // 往旁邊（通常是右邊）飄幾像素
  size: [7, 13],     // 字的大小（剛冒出、快消失）
  fill: '#dff0ff',   // 淡藍白
  edge: '#1b2433',   // 深色描邊
  headUp: .18,       // 頭的中心在角色圖中心往上幾成（以角色圖尺寸算）
  above: 16,         // 橫放的床：Z 從頭的中心再往上幾像素冒出（頭在旁邊，往上才不會壓在臉上）
  side: [18, 6],     // 直放的床：頭上有名字，Z 改從頭的右側冒出（往右、往上幾像素）
};
const bedZzzStill = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
// 躺在床上的人頭頂位置：角色圖以中心旋轉（js/render.js 的 seatRotate），頭跟著轉
function bedHeadPoint(a) {
  const size = PLAYER.drawSize, deg = (a.sitting.rotation || 0) * Math.PI / 180, d = size * BED_ZZZ.headUp;
  const cx = a.x, cy = a.y - size / 2 + 18;
  const hx = cx + Math.sin(deg) * d, hy = cy - Math.cos(deg) * d;
  if (!deg) return { x: hx + BED_ZZZ.side[0], y: hy - BED_ZZZ.side[1] };
  return { x: hx, y: hy - BED_ZZZ.above };
}
// 球球睡覺圖（ballsleep.png）：圖裡狗頭朝左，床左右翻（fx）時朝右；頭上方有名字，Z 從頭那一側的名字外面冒出、往外飄
function ballHeadPoint(npc) {
  const b = npc.ballSleep.bed, img = ballPoseImgs.sleep;
  const h = img && img.naturalWidth ? b.w * img.naturalHeight / img.naturalWidth : b.h;
  return { x: b.x0 + b.w * (b.fx ? .88 : .12) - 10, y: b.y0 + b.h - h + h * .35, dir: b.fx ? 1 : -1 };
}
function drawZzzAt(ctx, x, y, now, dir = 1) {   // dir：往右（1）或往左（-1）飄
  const still = bedZzzStill && bedZzzStill.matches;
  const [s0, s1] = BED_ZZZ.size;
  for (let i = 0; i < BED_ZZZ.count; i++) {
    // still：三個 Z 排成一串斜斜往上、不動；否則每個 Z 錯開時間循環
    const k = still ? (i + .5) / BED_ZZZ.count : ((now / BED_ZZZ.period) + i / BED_ZZZ.count) % 1;
    const alpha = still ? .85 : k < .15 ? k / .15 : (1 - k) / .85;   // 快速浮現，慢慢淡出
    const px = Math.round(x + dir * (4 + k * BED_ZZZ.drift) + (still ? 0 : Math.sin(k * Math.PI * 2) * 1.5)), py = Math.round(y - k * BED_ZZZ.rise);
    ctx.globalAlpha = Math.max(0, alpha);
    ctx.font = 'bold ' + Math.round(s0 + (s1 - s0) * k) + 'px monospace';
    ctx.strokeText('Z', px, py); ctx.fillText('Z', px, py);
  }
}
function drawBedZzz(ctx) {
  const now = performance.now() / 1000;
  ctx.save();
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round';
  ctx.lineWidth = 3; ctx.strokeStyle = BED_ZZZ.edge; ctx.fillStyle = BED_ZZZ.fill;
  const lying = a => a && a.sitting && a.sitting.bed && !(a.sleepT > 0) && !(a.hp <= 0) && !a.eatenBy;
  for (const a of [G.player, ...(G.towers || []), ...(G.npcs || [])]) {
    if (lying(a)) { const h = bedHeadPoint(a); drawZzzAt(ctx, h.x, h.y, now); }
    else if (a && a.id === 'ball' && typeof ballSleeping === 'function' && ballSleeping(a)) { const h = ballHeadPoint(a); drawZzzAt(ctx, h.x, h.y, now, h.dir); }
  }
  ctx.restore();
}
