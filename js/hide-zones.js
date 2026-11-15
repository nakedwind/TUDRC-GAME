/* ===== 🙈 完全遮住區（地圖編輯器畫的紫色方框，MAP.hideZones＝[[x, y, 寬, 高], …]，從地圖左上角算的像素）=====
   角色（溫特、隊員、NPC、怪物）的腳踩進方框就整個人不畫：走到牆、柱子後面，牆的圖不夠高、頭會露出來的地方用。
   不影響走路、碰撞、尋路、攻擊，只是看不到（js/render.js 的 wadeDraw 呼叫）。
   ・腳一踩進去就整個人消失、一走出來就整個人出現，中間沒有半透明（HIDE_ZONE_FADE＝0；想改回慢慢淡出就填像素，例如 12）
   ・看的是「腳」的位置（畫面上腳底那一點），不是身體中心：跟編輯器裡照著腳畫的方框對得上
   ・好幾個方框接在一起（或疊在一起）時，算成一整塊：有淡出時只有整塊的外緣會淡出，接縫的地方不會出現半透明 */
const HIDE_ZONE_FADE = 0;
// 腳底在角色位置（x, y）往下幾像素：溫特、隊員、NPC 是 16，怪物是 13（跟 js/render.js 排前後用的腳底一樣）
const HIDE_ZONE_FOOT = { char: 16, enemy: 13 };
// 這個點在不在任何一個方框裡
function hideZoneHas(list, x, y) {
  for (const [zx, zy, zw, zh] of list) if (x >= zx && y >= zy && x < zx + zw && y < zy + zh) return true;
  return false;
}
// 這個角色現在要畫多不透明：1＝照常、0＝完全不畫。kind：'char'（溫特、隊員、NPC）或 'enemy'（怪物）
function hideZoneAlpha(a, kind = 'char') {
  const list = typeof MAP !== 'undefined' && MAP && Array.isArray(MAP.hideZones) ? MAP.hideZones : null;
  if (!list || !list.length || !a) return 1;
  const x = a.x - OX, y = a.y + (HIDE_ZONE_FOOT[kind] ?? HIDE_ZONE_FOOT.char) - OY;   // 腳底的位置
  if (!hideZoneHas(list, x, y)) return 1;
  if (!(HIDE_ZONE_FADE > 0)) return 0;   // 沒有淡出：踩進去就完全不畫
  // 離整塊遮住區的外緣多遠：往上下左右各走一小步一小步，走出所有方框就停（接在一起的方框會繼續往下一個走）
  let d = HIDE_ZONE_FADE;
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    for (let s = 1; s <= d; s++) if (!hideZoneHas(list, x + dx * s, y + dy * s)) { d = s - 1; break; }
    if (d <= 0) break;
  }
  return Math.max(0, 1 - d / HIDE_ZONE_FADE);
}
