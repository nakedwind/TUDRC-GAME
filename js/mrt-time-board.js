/* 捷運時間牌：地圖上的「指示看板」（tile_bg_road_signs，圖 images/background/Road-signs.png）
   放在有捷運列車的地圖上，就自動變成時間牌，黑色螢幕裡用琥珀色 LED 字顯示「離它最近的那班列車」：
     ・等車中：〔紅線〕往 R89區　2:15（倒數到列車停好）
     ・剩 10 秒內、進站中：〔紅線〕即將進站（閃）　8秒
     ・門開著：每 3 秒換頁 →「往 R89區　停靠中」⇄「請上車（閃）　12秒關門」；快關門時只顯示第二頁
     ・關門、開走：往 R89區　出發
     ・發電機沒全開：暫停服務　需開啟發電機（紅字）；被花蓮老鼠王卡住：暫停服務　軌道受阻（紅字）
     ・通道列車（停著不動）：不載客　可穿越車廂（灰字）
   往哪站：列車進站前就先抽好（js/mrt-train.js 的 mrtNextDest），溫特搭上去就開到牌子寫的那站。
   站名、線的顏色讀 data/mrt-train.js 的 stations（name「R89區-紅線捷運站」拆成「R89區」「紅線」、color）。
   遊戲：js/maploader.js 畫完看板圖之後呼叫 drawMrtTimeBoard。
   地圖編輯器：用同一個 drawMrtBoardFace 畫一個範例畫面（js/map-editor.js），看得到字放在哪、多大。 */
const MRT_BOARD = {
  tile: 'tile_bg_road_signs',
  screen: [9 / 200, 15 / 40, 182 / 200, 22 / 40],   // 黑色螢幕在圖裡的位置（左、上、寬、高，佔整張圖的幾成）
  amber: '#ffb32c', red: '#e24b4a', gray: '#8a8a8a',   // 一般字、暫停服務、通道列車的字色
  soonSec: 10,   // 剩幾秒開始顯示「即將進站」
  pageSec: 3,    // 停靠中幾秒換一頁
  font: 'Consolas, "Microsoft JhengHei", monospace',
  fontPlus: 2,   // 字再加大幾 px（照看板原圖 40px 高算，看板有縮放時跟著縮放）
  glow: 6,       // LED 字的光暈有多大（照看板原圖 40px 高算，0＝不發光）；字也會畫在黑幕上面，暗處一樣看得到
};

// ---- 畫螢幕上的字（遊戲、地圖編輯器共用）----
// v＝{ badge: { text, color }（線色標籤，可以沒有）, left, right, small（右邊用小一點的字）, color（字色）, blink: 'left'|'right' }
function drawMrtBoardFace(ctx, x, y, w, h, v) {
  if (!v) return;
  const S = MRT_BOARD.screen, sx = x + S[0] * w, sy = y + S[1] * h, sw = S[2] * w, sh = S[3] * h;
  const plus = (MRT_BOARD.fontPlus || 0) * h / 40;
  const big = sh * .56 + plus, small = sh * .44 + plus, pad = sh * .18, gap = sh * .2, cy = sy + sh / 2;
  const off = (performance.now() % 1000) >= 500;   // 閃爍：每秒暗一下
  ctx.save();
  ctx.beginPath(); ctx.rect(sx, sy, sw, sh); ctx.clip();
  ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  let cx = sx + pad;
  if (v.badge) {   // 線色標籤（紅線、綠線…）
    const bf = sh * .5 + plus;
    ctx.font = 'bold ' + bf + 'px ' + MRT_BOARD.font;
    const bw = ctx.measureText(v.badge.text).width + sh * .3, bh = Math.min(sh * .92, bf + sh * .28);
    ctx.fillStyle = v.badge.color || '#666'; ctx.fillRect(cx, cy - bh / 2, bw, bh);
    ctx.fillStyle = '#fff'; ctx.fillText(v.badge.text, cx + sh * .15, cy + sh * .03);
    cx += bw + gap;
  }
  const col = v.color || MRT_BOARD.amber;
  if (MRT_BOARD.glow) { ctx.shadowColor = col; ctx.shadowBlur = MRT_BOARD.glow * h / 40; }   // LED 發光：字的顏色暈開
  if (v.left) {
    ctx.globalAlpha = v.blink === 'left' && off ? .2 : 1;
    ctx.font = 'bold ' + big + 'px ' + MRT_BOARD.font; ctx.fillStyle = col; ctx.fillText(v.left, cx, cy + sh * .03);
  }
  if (v.right) {
    ctx.globalAlpha = v.blink === 'right' && off ? .2 : 1;
    ctx.font = 'bold ' + (v.small ? small : big) + 'px ' + MRT_BOARD.font; ctx.fillStyle = col; ctx.textAlign = 'right';
    ctx.fillText(v.right, sx + sw - pad, cy + sh * .03);
  }
  ctx.restore();
}

// ---- 遊戲：這塊牌子現在要顯示什麼 ----
// 每塊牌子跟「離它最近的那班列車」（看車廂停好時的範圍），換地圖、重開時重算
let mrtBoardCache = { trains: null, map: new Map() };
function mrtBoardTrain(s) {
  const trains = typeof G !== 'undefined' && G && G.mrtTrains;
  if (!trains || !trains.length) return null;
  if (mrtBoardCache.trains !== trains) mrtBoardCache = { trains, map: new Map() };
  if (mrtBoardCache.map.has(s)) return mrtBoardCache.map.get(s);
  const t = mapTileById(s.id) || {};
  const bx = OX + s.c * CELL + (s.ox || 0) + mapStampW(s, t) * CELL / 2, by = OY + s.r * CELL + (s.oy || 0) + mapStampH(s, t) * CELL / 2;
  let best = null, bd = Infinity;
  for (const tr of trains) {
    const left = Math.min(...tr.cars.map(c => c.x)), right = Math.max(...tr.cars.map(c => c.x + c.w));
    const d = Math.hypot(Math.max(left, Math.min(right, bx)) - bx, Math.max(tr.top, Math.min(tr.bottom, by)) - by);
    if (d < bd) { bd = d; best = tr; }
  }
  mrtBoardCache.map.set(s, best);
  return best;
}
// 目的地的顯示文字：「R89區-紅線捷運站」→ 區域「R89區」、線「紅線」；不在車站名單裡的（例如紅色列車開去的台北車站大廳）用地圖名稱、沒有線色標籤
function mrtBoardDest(mapId) {
  if (!mapId) return null;
  const st = typeof mrtStationOf === 'function' ? mrtStationOf(mapId) : null;
  if (st && st.name) {
    const cut = st.name.split(/\s*[-－–]\s*/), area = cut[0], rest = cut.slice(1).join('');
    const line = (rest.match(/^(.*?線)/) || [])[1];
    return { area, badge: line ? { text: line, color: st.color || '#666' } : null };
  }
  const m = typeof mapList === 'function' ? mapList().find(x => x && x.id === mapId) : null;
  return { area: String((m && m.name) || '').replace(/^\s*\d+\s*[.、．]\s*/, ''), badge: null };
}
function mrtBoardView(s) {
  const tr = mrtBoardTrain(s); if (!tr) return null;
  const T = MRT_TRAIN, B = MRT_BOARD;
  if (tr.fixed) return { left: '不載客', right: '可穿越車廂', small: true, color: B.gray };
  if (typeof ratKingBlocksTrain === 'function' && ratKingBlocksTrain(tr)) return { left: '暫停服務', right: '軌道受阻', small: true, color: B.red };
  if (!mrtPowered()) return { left: '暫停服務', right: '需開啟發電機', small: true, color: B.red };
  const d = mrtBoardDest(mrtNextDest(tr)), badge = d && d.badge, to = d && d.area ? '往 ' + d.area : '列車';
  const sec = n => Math.max(0, Math.ceil(n));
  const soon = n => ({ badge, left: '即將進站', blink: 'left', right: sec(n) + '秒' });
  const st = tr.state;
  if (st === 'away' || st === 'tunnel') {
    const n = tr.t + Math.sqrt(2 * tr.inDist / T.arriveDecel);   // 等車的時間＋進站減速要開多久
    if (n <= B.soonSec) return soon(n);
    const s2 = sec(n);
    return { badge, left: to, right: Math.floor(s2 / 60) + ':' + String(s2 % 60).padStart(2, '0') };
  }
  if (st === 'arrive') return soon((tr.v || 0) / (T.arriveDecel * (tr.decelMul || 1)));
  if (st === 'idle') return { badge, left: to, right: '停靠中', small: true };   // 剛通電、等著開門
  const close = st === 'opening' ? tr.t + T.dwell + T.departWarnTime + T.warnTime
    : st === 'dwell' ? tr.t + T.departWarnTime + T.warnTime : st === 'departWarn' ? tr.t + T.warnTime : st === 'warn' ? tr.t : null;
  if (close != null) {
    const page = Math.floor(performance.now() / 1000 / B.pageSec) % 2;
    if ((st === 'opening' || st === 'dwell') && page === 0) return { badge, left: to, right: '停靠中', small: true };
    return { left: '請上車', blink: 'left', right: sec(close) + '秒關門' };
  }
  return { badge, left: to, right: '出發', small: true };   // 關門、開走
}
// js/maploader.js 畫完一張地圖物件後呼叫：是時間牌就把字畫上去（沒有列車的地圖照原本的看板）
// 這一幀畫了哪些時間牌：黑幕蓋上去之後再把字畫一次（drawMrtBoardGlow），字才會在暗處發光
// 用 Map 記（同一塊牌子同一幀被畫好幾次只算一次）；也記下當時的畫布位移，黑幕上面才畫得回同一個位置
let mrtBoardLit = new Map();
function drawMrtTimeBoard(ctx, s, x, y, w, h) {
  if (s.id !== MRT_BOARD.tile) return;
  const v = mrtBoardView(s); if (!v) return;
  drawMrtBoardFace(ctx, x, y, w, h, v);
  if (MRT_BOARD.glow && mrtBoardLit.size < 200) mrtBoardLit.set(s, { x, y, w, h, v, m: ctx.getTransform() });
}
// js/render.js 蓋完黑幕後呼叫：把這一幀的時間牌字畫在黑幕上面（只畫字和線色標籤，看板本體照樣被黑幕蓋）
function drawMrtBoardGlow(ctx) {
  const list = mrtBoardLit; mrtBoardLit = new Map();
  for (const b of list.values()) { ctx.save(); ctx.setTransform(b.m); drawMrtBoardFace(ctx, b.x, b.y, b.w, b.h, b.v); ctx.restore(); }
}
