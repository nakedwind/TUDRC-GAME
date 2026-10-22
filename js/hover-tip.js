/* ===== 懸停提示（下方快捷欄、建造欄的小道具）=====
   ・游標停在有 data-tip／data-tip-name 的按鈕上 HOVER_TIP.delay 秒後出現（取代瀏覽器的 title 小黃框）：
     data-tip＝圖示上方的 UI 框（效果，例如「SP+30」）；data-tip-name＝圖示下方的名稱（沒寫就不顯示）
   ・文字一律置中；比圖示寬時以圖示的中心往左右延展（只有超出畫面邊緣時才往內推）
   ・按下滑鼠、拖曳、移開就收起來；按鈕重畫（例如數量變了）時呼叫 refreshHoverTip() 跟著更新文字
   ・data-tip-key：按鈕重畫後用來找回同一格（例如 qs-2＝快捷欄第 2 格）
   ・樣式在 css/style.css 的 .hover-tip-box、.hover-tip-name
*/
const HOVER_TIP = { delay: .2, gap: 6, nameGap: 3, edge: 4 };   // gap：框和圖示上緣的距離；nameGap：名稱和圖示下緣的距離；edge：離畫面邊緣至少幾 px
const refreshHoverTip = (() => {
  const box = document.createElement('div'); box.className = 'hover-tip-box'; box.hidden = true;
  const name = document.createElement('div'); name.className = 'hover-tip-name'; name.hidden = true;
  document.body.append(box, name);
  let target = null, timer = 0, shown = false;
  const tipEl = el => (el instanceof Element ? el.closest('[data-tip], [data-tip-name]') : null);
  function place(el, node, above) {
    const r = el.getBoundingClientRect(), cx = r.left + r.width / 2, half = node.offsetWidth / 2;
    node.style.left = Math.max(HOVER_TIP.edge + half, Math.min(innerWidth - HOVER_TIP.edge - half, cx)) + 'px';
    node.style.top = (above ? r.top - HOVER_TIP.gap : r.bottom + HOVER_TIP.nameGap) + 'px';
  }
  function show() {
    if (!target || !target.isConnected) { hide(); return; }
    const t = target.dataset.tip || '', n = target.dataset.tipName || '';
    box.textContent = t; box.hidden = !t; name.textContent = n; name.hidden = !n;
    if (t) place(target, box, true);
    if (n) place(target, name, false);
    shown = !!(t || n);
  }
  function hide() { clearTimeout(timer); timer = 0; box.hidden = name.hidden = true; shown = false; }
  document.addEventListener('pointerover', e => {
    const el = tipEl(e.target); if (el === target) return;
    hide(); target = el;
    if (el) timer = setTimeout(show, HOVER_TIP.delay * 1000);
  });
  document.addEventListener('pointerout', e => {
    if (!target || tipEl(e.relatedTarget) === target) return;
    hide(); target = null;
  });
  for (const type of ['pointerdown', 'dragstart', 'wheel']) window.addEventListener(type, () => { if (target) hide(); }, true);
  window.addEventListener('blur', () => { hide(); target = null; });
  return () => {   // 按鈕重畫了：同一格還在游標下就更新文字和位置
    if (!target) return;
    if (!target.isConnected) {
      const key = target.dataset.tipKey, again = key ? document.querySelector('[data-tip-key="' + CSS.escape(key) + '"]') : null;
      if (!again || !again.matches(':hover')) { hide(); target = null; return; }
      target = again;
    }
    if (shown) show();
  };
})();
