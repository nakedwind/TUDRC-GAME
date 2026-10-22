/* 基地合圖：帳篷撤退、彈藥箱補給。互動區跟隨基地縮放、翻轉及旋轉。 */
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
    const supplyRect = typeof CAMP_SUPPLY !== 'undefined' ? CAMP_SUPPLY.rect : null;   // 物資箱（js/camp-supply.js）
    for (const [kind, rect] of [['retreat', [60, 112, 180, 174]], ['ammo', [184, 108, 230, 172]], ...(supplyRect ? [['supply', supplyRect]] : [])]) {
      const [x0, y0] = project(rect[0], rect[1]), [x1, y1] = project(rect[2], rect[3]);
      const [x, y] = project((rect[0] + rect[2]) / 2, rect[3]);
      spots.push({ base, kind, x, y, top: Math.min(y0, y1), left: Math.min(x0, x1), right: Math.max(x0, x1), bottom: Math.max(y0, y1) });
    }
  }
  return spots;
}
function campInteractionNearPlayer() {
  const p = G.player; if (!p || p.hp <= 0 || p.sitting || MAP_SAFE || G.over) return null;
  let nearest = null, distance = CELL * 1.6;
  for (const spot of campInteractionSpots()) {
    const d = Math.hypot(p.x - spot.x, p.y - spot.y);
    if (d < distance) { distance = d; nearest = spot; }
  }
  return nearest;
}
function refillCampAmmo() {
  const p = G.player; if (!p) return;
  p.ammo = PLAYER_ATK.mag; p.reloadT = 0;
  for (const id of Object.keys(BULLETS)) fillBullets(id);   // 拿到過的特殊子彈都補滿（js/flare.js）
  saveEquipment(); saveGame(); updateAmmoHud(); sfx('reload');
  systemNotice('已補滿所有子彈');
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
function openCampPlanDialog() {
  const spot = campInteractionNearPlayer();
  if (!spot || spot.kind !== 'retreat' || campPlanOpen) return;
  closeGroundMenu(); closeSentryMenu(); closeBuildMenu();
  if (!campPlanDialog) {
    campPlanDialog = document.createElement('div'); campPlanDialog.id = 'campPlanDialog'; campPlanDialog.className = 'hidden';
    campPlanDialog.innerHTML = '<section class="camp-plan-card" role="dialog" aria-modal="true" aria-labelledby="campPlanTitle"><header><div><h2 id="campPlanTitle">作戰計畫</h2></div><button type="button" data-plan-close aria-label="關閉">×</button></header><div class="camp-plan-options"><button type="button" data-plan="abort"><i>01</i><span><b>中止並撤退</b><small>返回應變中心，不保留戰場進度。</small></span></button><button type="button" data-plan="preserve"><i>02</i><span><b>保留進度並撤退</b><small>返回應變中心，下次接續作戰。</small></span></button><button type="button" data-plan="restart"><i>03</i><span><b>重新開始</b><small>重設戰場，立即重新部署。</small></span></button></div><footer><button type="button" data-plan-close>繼續作戰</button><span>Esc 關閉</span></footer></section>';
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
  else if (e.key === 'Tab') {
    const panel = campPlanPending ? campPlanDialog.querySelector('.camp-plan-confirm') : campPlanDialog.querySelector('.camp-plan-card');
    const buttons = [...panel.querySelectorAll('button')], index = buttons.indexOf(document.activeElement);
    e.preventDefault(); buttons[(index + (e.shiftKey ? -1 : 1) + buttons.length) % buttons.length].focus();
  } else if (e.key !== 'Enter' && e.code !== 'Space') e.preventDefault();
  e.stopImmediatePropagation();
}, true);
function useCampInteractionNearPlayer(allowPlan = true) {
  const spot = campInteractionNearPlayer(); if (!spot) return false;
  if (spot.kind === 'ammo') { refillCampAmmo(); return true; }
  if (spot.kind === 'supply') { if (typeof openCampSupply === 'function') openCampSupply(); return true; }
  if (allowPlan) openCampPlanDialog();
  return true;
}
