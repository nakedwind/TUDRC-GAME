/* 基地合圖：帳篷＝作戰計畫（互動區跟隨基地縮放、翻轉及旋轉）。彈藥箱、物資箱改成另外放在地圖上的物件（js/flare.js、js/camp-supply.js） */
function campInteractionSpots() {
  const spots = [];
  for (const base of G.obstacles) {
    if (!base.isBase || base.hp <= 0) continue;
    const s = base.baseStamp, t = s && mapTileById(s.id);
    if (!t || !/field-base\.png$/.test(String(t.file || ''))) continue;
    const w = mapTileW(t) * CELL, h = mapTileH(t) * CELL, rot = mapStampTurn(s);
    const project = (u, v) => {
      let x = (u / 440 - .5) * w * (s.fx ? -1 : 1), y = (v / 320 - .5) * h * (s.fy ? -1 : 1);
      for (let i = 0; i < rot; i++) [x, y] = [-y, x];
      return [base.artX + mapStampW(s, t) * CELL / 2 + x, base.artY + mapStampH(s, t) * CELL / 2 + y];
    };
    for (const [kind, rect] of [['retreat', [60, 112, 180, 174]]]) {
      const [x0, y0] = project(rect[0], rect[1]), [x1, y1] = project(rect[2], rect[3]);
      const [x, y] = project((rect[0] + rect[2]) / 2, rect[3]);
      spots.push({ base, kind, x, y, top: Math.min(y0, y1), left: Math.min(x0, x1), right: Math.max(x0, x1), bottom: Math.max(y0, y1) });
    }
  }
  return spots;
}
// ---- 地圖上的箱子：彈藥箱（js/flare.js）、物資箱（js/camp-supply.js）、裝備箱（js/backpack.js）----
// 判定範圍＝圖片裡真正有畫東西的地方（art：圖片像素的左、上、右、下；沒寫＝整張圖），溫特腳下離它 reach 以內就算靠近。
// 同時靠近好幾個：算最近的那一個（每個箱子的 xxxNearPlayer 只在自己是最近的那個時才回傳）。換了圖記得重量 art。
const MAP_BOX = { reach: 30, kinds: [
  { kind: 'ammo', match: id => AMMO_CRATE.ids.includes(id), art: {} },   // 能打開、開出東西的彈藥箱（js/flare.js）
  { kind: 'refill', match: (id, t) => AMMO_REFILL.ids.includes(id) || AMMO_REFILL.file.test(String(t.file || '')), art: { tile_field_ammo_crate_open: [0, 16, 46, 80, 80, 80] } },   // 營地的補彈藥箱（js/flare.js）；最後兩個數字＝圖片寬高
  { kind: 'supply', match: id => id === CAMP_SUPPLY.box.id, art: { tile_field_supply_box: [0, 16, 46, 80, 80, 80] } },   // field-base-01～03 都一樣
  { kind: 'armor', match: (id, t) => ARMOR_CHEST.tiles.includes(id) || ARMOR_CHEST.names.includes(String(t.name || '').trim()), art: { tile_mvma4ws7: [0, 11, 76, 80, 80, 80] } },
] };
function mapBoxes() {
  if (!MAP) return [];
  const list = [];
  for (const s of MAP.stamps || []) {
    const t = mapTileById(s.id); if (!t) continue;
    const k = MAP_BOX.kinds.find(k => k.match(s.id, t)); if (!k || (MAP_SAFE && k.kind !== 'armor')) continue;   // 彈藥箱、物資箱只在戰鬥地圖有用
    if (k.kind === 'ammo' && typeof ammoCrateLooted === 'function' && ammoCrateLooted(s)) continue;   // 開過的彈藥箱：不能再開（js/flare.js）
    const x0 = OX + s.c * CELL + (s.ox || 0), y0 = OY + s.r * CELL + (s.oy || 0), w = mapStampW(s, t) * CELL, h = mapStampH(s, t) * CELL;
    const a = k.art[s.id] || [0, 0, 1, 1, 1, 1], fx = u => s.fx ? w - u : u;   // 左右翻轉的箱子：範圍也翻過去
    const l = Math.min(fx(a[0] / a[4] * w), fx(a[2] / a[4] * w)), r = Math.max(fx(a[0] / a[4] * w), fx(a[2] / a[4] * w));
    list.push({ kind: k.kind, stamp: s, left: x0 + l, right: x0 + r, top: y0 + a[1] / a[5] * h, bottom: y0 + a[3] / a[5] * h, x: x0 + (l + r) / 2, y: y0 + a[3] / a[5] * h });
  }
  return list;
}
// kind：只要這一種（最近的不是這一種就回傳 null）；不給＝最近的任何一個
function mapBoxNearPlayer(kind) {
  const p = G && G.player; if (!p || p.hp <= 0 || p.sitting || G.over) return null;
  let best = null, bd = MAP_BOX.reach;
  for (const b of mapBoxes()) {
    const d = Math.hypot(Math.max(b.left - p.x, 0, p.x - b.right), Math.max(b.top - p.y, 0, p.y - b.bottom));
    if (d <= bd) { bd = d; best = b; }
  }
  return best && (!kind || best.kind === kind) ? best : null;
}
function campInteractionNearPlayer() {
  const p = G.player; if (!p || p.hp <= 0 || p.sitting || MAP_SAFE || G.over) return null;
  const box = mapBoxNearPlayer(); if (box) return box.kind === 'supply' ? box : null;   // 補彈藥箱、彈藥箱、裝備箱各自處理（js/flare.js、js/backpack.js）   // 站在箱子前面：箱子優先（帳篷不搶）
  let nearest = null, distance = CELL * 1.6;
  for (const spot of campInteractionSpots()) {
    const d = Math.hypot(p.x - spot.x, p.y - spot.y);
    if (d < distance) { distance = d; nearest = spot; }
  }
  return nearest;
}
let campPlanOpen = false, campPlanDialog = null, campPlanFocus = null;
let campPlanPending = null, campPlanConfirmFocus = null;
function cancelCampPlanConfirmation() {
  campPlanDialog?.querySelector('.camp-plan-confirm')?.remove();
  const card = campPlanDialog?.querySelector('.camp-plan-card'); if (card) card.hidden = false;
  campPlanPending = null;
  if (campPlanConfirmFocus?.isConnected) campPlanConfirmFocus.focus();
}
function showCampPlanConfirmation(action, trigger) {
  const text = {
    abort: ['中止本次作戰？', '本次戰場進度將放棄，並撤退回應變中心。'],
    preserve: ['保留進度並撤退？', '保存目前戰場並返回應變中心，下次進入會接續作戰。'],
    restart: ['重新開始本次作戰？', '本次戰場將重設，並立即重新部署。'],
  }[action];
  if (!text) return;
  campPlanPending = action; campPlanConfirmFocus = trigger;
  campPlanDialog.querySelector('.camp-plan-card').hidden = true;
  const panel = document.createElement('section'); panel.className = 'camp-plan-confirm';
  panel.setAttribute('role', 'alertdialog'); panel.setAttribute('aria-modal', 'true');
  panel.setAttribute('aria-labelledby', 'campPlanConfirmTitle'); panel.setAttribute('aria-describedby', 'campPlanConfirmText');
  panel.innerHTML = '<h2 id="campPlanConfirmTitle"></h2><p id="campPlanConfirmText"></p><div><button type="button" data-plan-cancel>取消</button><button type="button" data-plan-confirm>確定</button></div>';
  panel.querySelector('h2').textContent = text[0]; panel.querySelector('p').textContent = text[1];
  campPlanDialog.appendChild(panel); panel.querySelector('[data-plan-cancel]').focus();
}
function closeCampPlanDialog() {
  if (!campPlanOpen) return;
  cancelCampPlanConfirmation();
  campPlanOpen = false; campPlanDialog.classList.add('hidden');
  Object.keys(keys).forEach(key => { keys[key] = false; }); aimHeld = false;
  if (campPlanFocus?.isConnected) campPlanFocus.focus();
}
// 作戰計畫選項的圖示：實心剪影（風格跟諾亞、亞許名字前的圖示一樣），顏色跟著文字（currentColor，CSS 設成金色）
// 直接寫在這裡、不讀外部 svg 檔：雙擊 html 開遊戲（file://）時，CSS 遮罩讀不到本機圖檔
const PLAN_ICON = (() => {
  const svg = (id, body) => '<svg class="plan-icon" viewBox="0 0 24 24" aria-hidden="true"><defs><mask id="planIcon-' + id + '">' + body + '</mask></defs><rect width="24" height="24" fill="currentColor" mask="url(#planIcon-' + id + ')"/></svg>';
  const arrow = 'd="M10.2 12H18.6M15.6 7.9L19.8 12L15.6 16.1" fill="none" stroke-linecap="round" stroke-linejoin="round"';
  return {
    abort: svg('abort', '<rect x="3" y="2.5" width="11.5" height="19" rx="2.4" fill="#fff"/><circle cx="6.6" cy="12" r="1.25" fill="#000"/><path ' + arrow + ' stroke="#000" stroke-width="7"/><path ' + arrow + ' stroke="#fff" stroke-width="3.2"/>'),   // 門＋往外走的箭頭
    preserve: svg('preserve', '<path d="M7 2.6H17A1.9 1.9 0 0 1 18.9 4.5V20.6L12 16.2L5.1 20.6V4.5A1.9 1.9 0 0 1 7 2.6Z" fill="#fff" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/><path d="M8.6 9.4L11.1 11.9L15.6 7.3" fill="none" stroke="#000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>'),   // 書籤＋打勾（進度存好了）
    restart: svg('restart', '<path d="M16.6 5.6A7.6 7.6 0 1 1 7.4 5.9" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/><path d="M10.4 3.6L8.7 8.7L5.1 3.9Z" fill="#fff" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/>'),   // 繞一圈的箭頭
  };
})();
const planIcon = name => PLAN_ICON[name];
function openCampPlanDialog() {
  const spot = campInteractionNearPlayer();
  if (!spot || spot.kind !== 'retreat' || campPlanOpen) return;
  closeGroundMenu(); closeSentryMenu(); closeBuildMenu();
  if (!campPlanDialog) {
    campPlanDialog = document.createElement('div'); campPlanDialog.id = 'campPlanDialog'; campPlanDialog.className = 'hidden';
    campPlanDialog.innerHTML = '<section class="camp-plan-card" role="dialog" aria-modal="true" aria-labelledby="campPlanTitle"><header><div><h2 id="campPlanTitle">作戰計畫</h2></div><button type="button" data-plan-close aria-label="關閉">×</button></header><div class="camp-plan-options"><button type="button" data-plan="abort"><i>01</i>' + planIcon('abort') + '<span><b>中止並撤退</b><small>返回應變中心，不保留戰場進度。</small></span></button><button type="button" data-plan="preserve"><i>02</i>' + planIcon('preserve') + '<span><b>保留進度並撤退</b><small>返回應變中心，下次接續作戰。</small></span></button><button type="button" data-plan="restart"><i>03</i>' + planIcon('restart') + '<span><b>重新開始</b><small>重設戰場，立即重新部署。</small></span></button></div><footer><button type="button" data-plan-close>繼續作戰</button><span>Esc 關閉</span></footer></section>';
    document.getElementById('wrap').appendChild(campPlanDialog);
    campPlanDialog.addEventListener('click', e => {
      if (campPlanPending) {
        if (e.target === campPlanDialog || e.target.closest('[data-plan-cancel]')) cancelCampPlanConfirmation();
        else if (e.target.closest('[data-plan-confirm]') && executeCampPlan(campPlanPending)) closeCampPlanDialog();
        return;
      }
      if (e.target === campPlanDialog || e.target.closest('[data-plan-close]')) { closeCampPlanDialog(); return; }
      const button = e.target.closest('[data-plan]');
      if (button) showCampPlanConfirmation(button.dataset.plan, button);
    });
    campPlanDialog.addEventListener('contextmenu', e => e.preventDefault());
  }
  campPlanFocus = document.activeElement; campPlanOpen = true;
  G.player.moving = false;
  Object.keys(keys).forEach(key => { keys[key] = false; }); aimHeld = false;
  campPlanDialog.classList.remove('hidden'); campPlanDialog.querySelector('[data-plan-close]').focus(); sfx('menu');
}
window.addEventListener('keydown', e => {
  if (!campPlanOpen) return;
  if (e.key === 'Escape') { e.preventDefault(); if (campPlanPending) cancelCampPlanConfirmation(); else closeCampPlanDialog(); }
  else if (e.key !== 'Enter' && e.code !== 'Space') e.preventDefault();   // Tab 也是：Tab 只用來開關 T-Pad（js/tab-key.js），這裡不切換按鈕
  e.stopImmediatePropagation();
}, true);
function useCampInteractionNearPlayer(allowPlan = true) {
  const spot = campInteractionNearPlayer(); if (!spot) return false;
  if (spot.kind === 'supply') { if (typeof openCampSupply === 'function') openCampSupply(); return true; }
  if (allowPlan) openCampPlanDialog();
  return true;
}
