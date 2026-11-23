/* ===== 基地裡的提示：基地裡的東西頭上飄名字（常駐，用過也一直在） =====
   ・目前有：諾亞（開發工坊）、置物櫃、衣櫃、防具箱（裝備箱）、電腦、射擊練習桌、販賣機、飲料店、商店、餐廳的餐盤架、醫院病床
   ・後室（戰鬥地圖）裡的商店、販賣機不飄：只在基地畫，紫色的後室販賣機也排除
   ・只在基地（安全區 MAP_SAFE）畫；溫特走到旁邊、已經出現「按空白鍵」的互動提示時先藏起來，免得兩個框疊在一起
   ・提示一直都在（FIRST_HINT_STYLE.persistent＝true）；改成 false 就回到「第一次打開就記下來（firstHintDone），之後不再飄」：
       開發工坊＝js/equipment.js 的 openWorkshop、置物櫃＝js/storage-cabinet.js 的 openCabinet、
       衣櫃＝js/costumes.js 的 openWardrobe（溫特自己的衣櫃）、防具箱＝js/backpack.js 的 openArmorPanel、
       電腦＝js/bestiary.js 的 useBestiaryNearPlayer、射擊練習＝js/target-practice.js 的 useTargetTableNearPlayer、
       販賣機／飲料店／商店＝js/shop.js 的 openVendingMachine／openDrinkShop／openSupplyShop（三個各自分開記）、
       餐廳＝js/meal.js 從餐盤架拿餐盤、病床＝溫特在醫院躺上病床（這個檔的 drawFirstHints 自己檢查）
   ・記在瀏覽器存檔 tudrc_first_hints_v1（js/new-game.js 的 progressKeys 有它：開新遊戲會重設、存檔欄位會一起存）
   ・提示的位置跟著物件／諾亞走，所以在基地編輯器搬動物件、改 NPC 站位，提示也會跟著過去
   ・物件的提示對準「圖片上真的有畫東西的地方」：素材圖四周常有透明空白（例如櫃子只畫在圖的左下角），
     照整張圖的框放會偏一邊、飄太高，所以第一次用到時讀一次圖片的透明度，找出看得到的範圍（hintArtFrac）
   ・要新增一個提示：在 FIRST_HINTS 加一項（label＝顯示的字、spots＝回傳要畫在哪些位置），再在「打開它」的函式裡呼叫 firstHintDone('那一項的名字')
*/
const FIRST_HINT_KEY = 'tudrc_first_hints_v1';
const FIRST_HINT_STYLE = {
  color: null,          // 泡泡顏色：null＝跟隊友頭上的對話泡泡一樣（js/render.js 的 BUBBLE_DEFAULT）；要換色就寫 { bg: 底色, bd: 邊框和小三角形, tx: 字 }
  hideNear: 64,         // 溫特離物件幾像素內就先不畫（那時候會出現互動提示）
  screenTop: 40,        // 提示最高只到畫面頂端往下幾像素（遊戲座標），免得跑出畫面或被「目前任務」那行字蓋住
  merge: 60,           // 同一種東西靠得很近（例如並排的 3 個衣櫃）：左右幾像素內合成一個提示，不要擠成一排
  persistent: true,     // true＝提示常駐（用過也不會消失）；false＝第一次用過就不再飄
  gap: 2,               // 泡泡下面小三角形的尖端離物件（看得到的部分）頂端幾像素
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
    return [{ x: n.x, y: n.y - 80 + (NPC_LABEL_DY[n.id] || 0), near: { left: n.x, right: n.x, top: n.y, bottom: n.y } }];
  } },
  cabinet: { label: '置物櫃', spots: () => boxHintSpots('cabinet') },
  armor: { label: '防具箱', spots: () => boxHintSpots('armor') },
  wardrobe: { label: '衣櫃', spots: () => typeof wardrobeSpots === 'function' ? wardrobeSpots().map(rectHintSpot) : [] },
  computer: { label: '電腦', spots: () => typeof bestiarySpots === 'function' ? bestiarySpots().map(rectHintSpot) : [] },   // 電腦桌面：怪物圖鑑、音樂、小遊戲
  target: { label: '射擊練習', spots: () => typeof targetTableSpots === 'function' ? targetTableSpots().map(rectHintSpot) : [] },
  vending: { label: '販賣機', spots: () => typeof VENDING !== 'undefined' ? shopHintSpots(VENDING, id => vendingColorOf(id) !== 'purple') : [] },   // 紫色＝後室販賣機，不飄
  drinkshop: { label: '飲料店', spots: () => typeof DRINK_SHOP !== 'undefined' ? shopHintSpots(DRINK_SHOP) : [] },
  shop: { label: '商店', spots: () => typeof SHOP_COUNTER !== 'undefined' ? shopHintSpots(SHOP_COUNTER) : [] },   // HOME Mart 結帳櫃台
  meal: { label: '拿餐盤吃飯', spots: () => typeof mealMapReady === 'function' && mealMapReady()   // 餐廳：從餐盤架開始
    ? MAP.stamps.filter(s => MEAL.trayTiles.includes(s.id) && mapTileById(s.id)).map(s => { const r = mealStampRect(s);
      return rectHintSpot({ x: r.x, top: r.top, x0: r.x0, x1: r.x0 + r.w, y0: r.y0, y1: r.bottom, stamp: s }); }) : [] },
  hospital: { label: '病床', spots: () => {   // 醫院：只在第一張沒人躺的病床上飄一個（5 張都飄太擠）
    if (typeof onHospitalMap !== 'function' || !onHospitalMap() || typeof mapSeats !== 'function') return [];
    const s = mapSeats().find(b => b.bed && !(typeof seatTaken === 'function' && seatTaken(b, G.player)));
    return s ? [rectHintSpot({ x: s.x0 + s.w / 2, top: s.y0 + 40, x0: s.x0, x1: s.x0 + s.w, y0: s.y0, y1: s.y0 + s.h })] : [];   // 飄在床頭上（貼牆的病床上方常常在畫面外）
  } },
};
// 一般物件（有 x、top 和外框 x0～x1、y0～y1）：提示放在物件上方
//   有 stamp（地圖上擺的那個物件）就對準圖片上看得到的部分；y＝泡泡中間，尖端在 y+17
const rectHintSpot = w => {
  const near = { left: w.x0, right: w.x1, top: w.y0, bottom: w.y1 };
  const a = w.stamp && stampArtBox(w.stamp);
  return a ? { x: (a.x0 + a.x1) / 2, y: a.y0 - FIRST_HINT_STYLE.gap - 17, artBottom: a.y1, near }
    : { x: w.x, y: w.top - 16, near };
};
// 素材圖上真的有畫東西的範圍（比例 0～1：[左, 上, 右, 下]）；圖還沒載好回傳 null（先用整張圖的框）
const hintArtCache = {};
function hintArtFrac(t) {
  if (hintArtCache[t.id]) return hintArtCache[t.id];
  const img = typeof tileImage === 'function' ? tileImage(t) : null;
  if (!img || !img.naturalWidth) return null;
  let f = [0, 0, 1, 1];
  try {
    const k = Math.min(1, 256 / Math.max(img.naturalWidth, img.naturalHeight));   // 縮小到最多 256 像素再讀，夠準也比較快
    const W = Math.max(1, Math.round(img.naturalWidth * k)), H = Math.max(1, Math.round(img.naturalHeight * k));
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d'); g.drawImage(img, 0, 0, W, H);
    const d = g.getImageData(0, 0, W, H).data;
    let x0 = W, y0 = H, x1 = -1, y1 = -1;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (d[(y * W + x) * 4 + 3] > 20) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    if (x1 >= 0) f = [x0 / W, y0 / H, (x1 + 1) / W, (y1 + 1) / H];
  } catch (_) {}   // 讀不到像素（例如用 file:// 開）：照整張圖
  hintArtCache[t.id] = f;
  return f;
}
// 地圖上某個物件「看得到的部分」在世界座標的範圍：照 js/maploader.js 畫物件的方式算（左右／上下翻轉、90 度轉向、大小、角度）
function stampArtBox(s) {
  const t = mapTileById(s.id); if (!t) return null;
  const f = hintArtFrac(t) || [0, 0, 1, 1];
  const w = mapTileW(t) * CELL, h = mapTileH(t) * CELL, rot = mapStampTurn(s);
  const x = OX + s.c * CELL + (s.ox || 0), y = OY + s.r * CELL + (s.oy || 0);
  const dw = rot % 2 ? h : w, dh = rot % 2 ? w : h;   // 轉向後佔的寬高
  const k = typeof stampScaleOf === 'function' ? stampScaleOf(s) : 1, ang = (typeof stampAngleOf === 'function' ? stampAngleOf(s) : 0) * Math.PI / 180;
  const cos = Math.cos(ang), sin = Math.sin(ang);
  const pts = [[f[0], f[1]], [f[2], f[1]], [f[0], f[3]], [f[2], f[3]]].map(([u, v]) => {
    let px = (u - .5) * w * (s.fx ? -1 : 1), py = (v - .5) * h * (s.fy ? -1 : 1);   // 圖片中心為原點，先翻轉
    for (let i = 0; i < rot; i++) [px, py] = [-py, px];   // 每次順時針轉 90 度
    // 大小、角度：以圖片底部中央為準放大、繞放大後的中心轉（js/stamp-transform.js 的 applyStampTransform）
    const qx = px * k, qy = py * k;
    return [x + dw / 2 + qx * cos - qy * sin, y + dh - dh * k / 2 + qx * sin + qy * cos];
  });
  return { x0: Math.min(...pts.map(p => p[0])), x1: Math.max(...pts.map(p => p[0])), y0: Math.min(...pts.map(p => p[1])), y1: Math.max(...pts.map(p => p[1])) };
}
// 販賣機、飲料店、商店櫃台：跟 js/shop.js 的 shopStampNearPlayer 用同一套素材判定；keep＝再多篩掉哪些
function shopHintSpots(cfg, keep = () => true) {
  const out = [];
  for (const s of (MAP && MAP.stamps) || []) {
    const t = mapTileById(s.id); if (!t || !cfg.match(s.id, t) || !keep(s.id)) continue;
    const x0 = OX + s.c * CELL + (s.ox || 0), y0 = OY + s.r * CELL + (s.oy || 0), x1 = x0 + mapTileW(t) * CELL, y1 = y0 + mapTileH(t) * CELL;
    out.push(rectHintSpot({ x: (x0 + x1) / 2, top: y0, x0, x1, y0, y1, stamp: s }));
  }
  return out;
}
// 置物櫃、裝備箱：用 js/camp-interactions.js 的 mapBoxes 找位置（跟靠近判定同一套範圍）
function boxHintSpots(kind) {
  if (typeof mapBoxes !== 'function') return [];
  return mapBoxes().filter(b => b.kind === kind).map(b => Object.assign(rectHintSpot({ x: b.x, top: b.top, x0: b.left, x1: b.right, y0: b.top, y1: b.bottom, stamp: b.stamp }), { near: b }));
}
// 並排的同一種東西合成一個：中間放一個提示，靠近判定用整排的範圍
function mergeHintSpots(spots, gap = FIRST_HINT_STYLE.merge) {
  const out = [];
  for (const s of spots.slice().sort((a, b) => a.x - b.x)) {
    const g = out.find(o => Math.abs(o.y - s.y) < 20 && s.x - o.xr < gap);
    if (!g) { out.push({ xl: s.x, xr: s.x, y: s.y, artBottom: s.artBottom, near: Object.assign({}, s.near) }); continue; }
    g.xr = s.x; g.y = Math.min(g.y, s.y); if (s.artBottom != null) g.artBottom = Math.max(g.artBottom ?? -Infinity, s.artBottom);
    g.near = { left: Math.min(g.near.left, s.near.left), right: Math.max(g.near.right, s.near.right), top: Math.min(g.near.top, s.near.top), bottom: Math.max(g.near.bottom, s.near.bottom) };
  }
  return out.map(g => ({ x: (g.xl + g.xr) / 2, y: g.y, artBottom: g.artBottom, near: g.near }));
}
function drawFirstHints(ctx) {
  if (typeof MAP_SAFE === 'undefined' || !MAP_SAFE || !G || !G.player || G.over) return;
  // 醫院病床：溫特在醫院躺上病床就算用過（躺床是 js/game.js 的 toggleSit，這裡每幀看一下就好）
  if (!firstHintSeen.hospital && G.player.sitting && G.player.sitting.bed && typeof onHospitalMap === 'function' && onHospitalMap()) firstHintDone('hospital');
  const ids = Object.keys(FIRST_HINTS).filter(id => FIRST_HINT_STYLE.persistent || !firstHintSeen[id]);
  if (!ids.length) return;
  const p = G.player, now = performance.now() / 1000;
  ctx.save();
  ids.forEach((id, k) => {
    const hint = FIRST_HINTS[id];
    for (const s of mergeHintSpots(hint.spots(), hint.merge)) {
      const b = s.near, d = Math.hypot(Math.max(b.left - p.x, 0, p.x - b.right), Math.max(b.top - p.y, 0, p.y - b.bottom));
      if (d < FIRST_HINT_STYLE.hideNear) continue;   // 溫特已經在旁邊：讓位給互動提示
      // 貼著上面牆壁的東西（商店櫃台、衣櫃…）：提示放在物件上方會跑出畫面、或被左上角的「目前任務」蓋住，就往下移到物件身上
      const top = typeof cam !== 'undefined' ? cam.y + FIRST_HINT_STYLE.screenTop : -Infinity;
      const baseY = Math.min(Math.max(s.y, top), (s.artBottom ?? b.bottom) - 14);
      const y = Math.round(baseY + Math.sin(now * 3 + k) * 2.5);   // 上下輕輕飄（每一項錯開一點）
      drawSpeechBubble(s.x, y + 17, hint.label, FIRST_HINT_STYLE.color);   // 跟隊友的對話泡泡同一個畫法；y＝泡泡中間，y+17＝下面小三角形的尖端
    }
  });
  ctx.restore();
}
