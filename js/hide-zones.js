/* ===== 🙈 完全遮住區（地圖編輯器畫的紫色方框，MAP.hideZones＝[[x, y, 寬, 高], …]，從地圖左上角算的像素）=====
   角色（溫特、隊員、NPC、怪物）的腳踩進方框就整個人不畫：走到牆、柱子後面，牆的圖不夠高、頭會露出來的地方用。
   不影響走路、碰撞、尋路、攻擊，只是看不到。靠近方框邊緣 HIDE_ZONE_FADE 像素內慢慢淡出，不會一下子消失（js/render.js 的 wadeDraw 呼叫）。 */
const HIDE_ZONE_FADE = 12;
// 這個角色現在要畫多不透明：1＝照常、0＝完全不畫
function hideZoneAlpha(a) {
  const list = typeof MAP !== 'undefined' && MAP && Array.isArray(MAP.hideZones) ? MAP.hideZones : null;
  if (!list || !list.length || !a) return 1;
  const x = a.x - OX, y = a.y - OY;
  let k = 1;
  for (const [zx, zy, zw, zh] of list) {
    if (x < zx || y < zy || x >= zx + zw || y >= zy + zh) continue;
    const d = Math.min(x - zx, zx + zw - x, y - zy, zy + zh - y);   // 離最近的邊幾像素
    k = Math.min(k, Math.max(0, 1 - d / HIDE_ZONE_FADE));
    if (k <= 0) return 0;
  }
  return k;
}
