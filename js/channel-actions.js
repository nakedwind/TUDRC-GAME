/* ===== 要花時間的動作：疏導、急救、用醫療包 =====
   - 開始後溫特站著不動、不能開槍；對隊員做的（疏導、急救），那位隊員也站著不動、不攻擊。
   - 頭上出現進度條，跑完才算成功（效果、消耗都在跑完那一刻才發生）。
   - 溫特倒下、換地圖、戰鬥結束、疏導對象倒下時中斷（什麼都不消耗）。
   秒數在下面的 CHANNEL_TIME（急救的秒數在 data/equipment.js 的 FIRST_AID.time）。
*/
const CHANNEL_TIME = { medkit: 2 };   // 用醫療包要幾秒（疏導的秒數在 data/balance.js 的 SOOTHE.time）
let playerChannel = null;
// ch：{ kind, total（秒）, target（對誰做；自己就是 G.player）, label, color, needAlive（對象倒下就中斷）, onDone(ch), onCancel(ch), onTick(dt) }
function startChannel(ch) {
  const p = G && G.player; if (!p || playerChannel) return null;
  ch.t = 0; ch.forG = G; playerChannel = ch;
  Object.assign(p, { soothingT: ch.total + .05, gunT: 0, moving: false, dir: 'front' });   // 站定（js/game.js 的 updatePlayer：soothingT 期間不能走）
  return ch;
}
function cancelChannel() {
  const ch = playerChannel; if (!ch) return;
  playerChannel = null;
  if (G && G.player) G.player.soothingT = 0;
  if (ch.onCancel) ch.onCancel(ch);
}
// 每幀（game.js 的 update 呼叫）
function updateChannel(dt) {
  const ch = playerChannel; if (!ch) return;
  const p = G && G.player, tg = ch.target;
  if (ch.forG !== G || !p || p.hp <= 0 || G.over || (ch.needAlive && tg && tg !== p && tg.hp <= 0)) { cancelChannel(); return; }
  ch.t += dt;
  if (ch.onTick) ch.onTick(dt);   // 進行中每幀要做的事（例如疏導的光點）
  p.soothingT = Math.max(p.soothingT || 0, ch.total - ch.t + .05);
  if (tg && tg !== p) tg.frozenT = .2;   // 對象也站著不動（js/game.js 的哨兵走動、攻擊會看 frozenT）
  if (ch.t >= ch.total) { playerChannel = null; p.soothingT = 0; if (ch.onDone) ch.onDone(ch); }
}
// 進度條：畫在被幫忙的人頭上（render.js 在黑幕上面畫）
function drawChannelBar(ctx) {
  const ch = playerChannel; if (!ch || !G || !G.player) return;
  const who = ch.target || G.player, k = Math.max(0, Math.min(1, ch.t / ch.total));
  const isPlayer = who === G.player, w = 54, h = 7, x = Math.round(who.x - w / 2), y = Math.round(who.y - (isPlayer ? 74 : 70));
  ctx.save();
  ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.strokeStyle = 'rgba(0,0,0,.9)'; ctx.strokeText(ch.label, who.x, y - 4);
  ctx.fillStyle = '#fff'; ctx.fillText(ch.label, who.x, y - 4);
  ctx.fillStyle = 'rgba(8,12,18,.9)'; roundRect(x - 1, y - 1, w + 2, h + 2, 4); ctx.fill();
  ctx.fillStyle = ch.color || '#8fd3ff'; if (k > 0) { roundRect(x, y, Math.max(2, w * k), h, 3); ctx.fill(); }
  ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1; roundRect(x - 1, y - 1, w + 2, h + 2, 4); ctx.stroke();
  ctx.restore();
}
