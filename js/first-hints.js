/* ===== 首次遊玩的提示：基地裡的東西頭上飄名字，第一次用過就不再出現 =====
   ・目前有 4 個：諾亞（開發工坊）、置物櫃、衣櫃、防具箱（裝備箱）
   ・只在基地（安全區 MAP_SAFE）畫；溫特走到旁邊、已經出現「按空白鍵」的互動提示時先藏起來，免得兩個框疊在一起
   ・第一次打開就記下來（firstHintDone），之後不再飄：
       開發工坊＝js/equipment.js 的 openWorkshop、置物櫃＝js/storage-cabinet.js 的 openCabinet、
       衣櫃＝js/costumes.js 的 openWardrobe（溫特自己的衣櫃）、防具箱＝js/backpack.js 的 openArmorPanel
   ・記在瀏覽器存檔 tudrc_first_hints_v1（js/new-game.js 的 progressKeys 有它：開新遊戲會重設、存檔欄位會一起存）
   ・提示的位置跟著物件／諾亞走，所以在基地編輯器搬動物件、改 NPC 站位，提示也會跟著過去
   ・要新增一個提示：在 FIRST_HINTS 加一項（label＝顯示的字、spots＝回傳要畫在哪些位置），再在「打開它」的函式裡呼叫 firstHintDone('那一項的名字')
*/
const FIRST_HINT_KEY = 'tudrc_first_hints_v1';
const FIRST_HINT_STYLE = {
  bg: '#9fe0ff',        // 框的底色（淡藍：跟作戰桌的黃色「作戰」分開）
  edge: 'rgba(16,40,60,.85)',
  text: '#0d2a3d',
  hideNear: 64,         // 溫特離物件幾像素內就先不畫（那時候會出現互動提示）
  merge: 60,            // 同一種東西靠得很近（例如並排的 3 個衣櫃）：左右幾像素內合成一個提示，不要擠成一排
};
let firstHintSeen = {};
try { firstHintSeen = JSON.parse(localStorage.getItem(FIRST_HINT_KEY) || '{}') || {}; } catch (_) { firstHintSeen = {}; }
// 用過某樣東西：記下來，之後不再飄
function firstHintDone(id) {
  if (firstHintSeen[id]) return;
  firstHintSeen[id] = true;
  try { localStorage.setItem(FIRST_HINT_KEY, JSON.stringify(firstHintSeen)); } catch (_) {}
}
// 每一項：label＝框裡的字；spots()＝要畫在哪些位置 [{ x, y（框的中心）, near（溫特靠近判定用的範圍） }]
const FIRST_HINTS = {
  workshop: { label: '開發工坊', spots: () => {   // 諾亞頭上（名字的上方），跟他對話就能打開開發工坊
    const n = (G.npcs || []).find(a => a && a.id === 'noah');
    if (!n || n.hp <= 0) return [];
    return [{ x: n.x, y: n.y - 70 + (NPC_LABEL_DY[n.id] || 0), near: { left: n.x, right: n.x, top: n.y, bottom: n.y } }];
  } },
  cabinet: { label: '置物櫃', spots: () => boxHintSpots('cabinet') },
  armor: { label: '防具箱', spots: () => boxHintSpots('armor') },
  wardrobe: { label: '衣櫃', spots: () => typeof wardrobeSpots === 'function'
    ? wardrobeSpots().map(w => ({ x: w.x, y: w.top - 16, near: { left: w.x0, right: w.x1, top: w.y0, bottom: w.y1 } })) : [] },
};
// 置物櫃、裝備箱：用 js/camp-interactions.js 的 mapBoxes 找位置（跟靠近判定同一套範圍）
function boxHintSpots(kind) {
  if (typeof mapBoxes !== 'function') return [];
  return mapBoxes().filter(b => b.kind === kind).map(b => ({ x: b.x, y: b.top - 16, near: b }));
}
// 並排的同一種東西合成一個：中間放一個提示，靠近判定用整排的範圍
function mergeHintSpots(spots) {
  const out = [];
  for (const s of spots.slice().sort((a, b) => a.x - b.x)) {
    const g = out.find(o => Math.abs(o.y - s.y) < 20 && s.x - o.xr < FIRST_HINT_STYLE.merge);
    if (!g) { out.push({ xl: s.x, xr: s.x, y: s.y, near: Object.assign({}, s.near) }); continue; }
    g.xr = s.x; g.y = Math.min(g.y, s.y);
    g.near = { left: Math.min(g.near.left, s.near.left), right: Math.max(g.near.right, s.near.right), top: Math.min(g.near.top, s.near.top), bottom: Math.max(g.near.bottom, s.near.bottom) };
  }
  return out.map(g => ({ x: (g.xl + g.xr) / 2, y: g.y, near: g.near }));
}
function drawFirstHints(ctx) {
  if (typeof MAP_SAFE === 'undefined' || !MAP_SAFE || !G || !G.player || G.over) return;
  const ids = Object.keys(FIRST_HINTS).filter(id => !firstHintSeen[id]);
  if (!ids.length) return;
  const p = G.player, now = performance.now() / 1000;
  ctx.save();
  ctx.font = 'bold 14px "Microsoft JhengHei", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ids.forEach((id, k) => {
    const hint = FIRST_HINTS[id];
    for (const s of mergeHintSpots(hint.spots())) {
      const b = s.near, d = Math.hypot(Math.max(b.left - p.x, 0, p.x - b.right), Math.max(b.top - p.y, 0, p.y - b.bottom));
      if (d < FIRST_HINT_STYLE.hideNear) continue;   // 溫特已經在旁邊：讓位給互動提示
      const y = Math.round(s.y + Math.sin(now * 3 + k) * 2.5);   // 上下輕輕飄（每一項錯開一點）
      const w = ctx.measureText(hint.label).width + 16, h = 22;
      ctx.fillStyle = FIRST_HINT_STYLE.bg; ctx.strokeStyle = FIRST_HINT_STYLE.edge; ctx.lineWidth = 1.5;
      roundRect(Math.round(s.x - w / 2), y - h / 2, w, h, 11); ctx.fill(); ctx.stroke();
      // 下面的小三角形，指向物件
      ctx.beginPath(); ctx.moveTo(s.x - 5, y + h / 2 - 1); ctx.lineTo(s.x + 5, y + h / 2 - 1); ctx.lineTo(s.x, y + h / 2 + 6); ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = FIRST_HINT_STYLE.text; ctx.fillText(hint.label, s.x, y + 1);
    }
  });
  ctx.restore();
}
