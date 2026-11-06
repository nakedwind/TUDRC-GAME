/* ===== 地圖編輯器：物件的大小、角度面板（三個地圖編輯器共用）=====
   有選物件就改選到的物件，沒選就改筆刷（下一個放下去的物件），跟 R、F 鍵一樣。
   資料與算法見 js/stamp-transform.js；1×1 小圖要轉成物件才存得下，做法跟翻轉、旋轉一樣。 */
(() => {
  const SCALE_MIN = 10, SCALE_MAX = 500;
  const anchor = document.getElementById('selRotate'); if (!anchor) return;
  const box = document.createElement('span');
  box.id = 'stampTransformControl';
  box.style.cssText = 'display:inline-flex;align-items:center;gap:6px;flex-wrap:nowrap;white-space:nowrap';
  box.innerHTML = '<span id="stampTransformWho" style="font-size:12px;opacity:.8"></span>' +
    '<label title="圖片放大幾 %（100＝原尺寸，可輸入 ' + SCALE_MIN + '～' + SCALE_MAX + '）。以圖片底部中央為基準，樹根留在原地往上長。只改外觀，碰撞和紅格不變。">大小 ' +
    '<input id="stampScaleInput" type="number" min="' + SCALE_MIN + '" max="' + SCALE_MAX + '" step="5" style="width:48px"> %</label>' +
    '<label title="圖片轉幾度（順時針，可輸入任意度數）。只改外觀，碰撞和紅格不變。">角度 ' +
    '<input id="stampAngleInput" type="number" step="5" style="width:44px"> °</label>' +
    '<button class="btn" id="stampTransformReset" title="大小、角度都回到原樣">↺</button>';
  anchor.after(box);
  const scaleInput = box.querySelector('#stampScaleInput'), angleInput = box.querySelector('#stampAngleInput'), who = box.querySelector('#stampTransformWho');

  const fullAngle = (turn, extra) => (((turn * 90 + extra) % 360) + 360) % 360;
  // 使用者看到的是總角度；存的時候扣掉 s.rot 那幾個 90 度（s.rot 會改變佔的格子，這裡不動它）
  const extraFor = (turn, total) => { const v = ((total - turn * 90) % 360 + 360) % 360; return v > 180 ? v - 360 : v; };
  const setOrDelete = (s, key, value, none) => { if (value === none) delete s[key]; else s[key] = value; };

  function refresh() {
    let scale = brushScale, angle = fullAngle(brushRotation, brushAngle);
    if (selections.length) {
      const sel = selections[selections.length - 1], s = sel.type === 'stamp' ? curMap().stamps[sel.index] : null;
      scale = s ? Math.round(stampScaleOf(s) * 100) : 100;
      angle = s ? fullAngle(stampTurn(s), stampAngleOf(s)) : 0;
    }
    who.textContent = selections.length ? '' : '筆刷：';   // 有選物件時不寫字（選取列才擠得進一行）
    scaleInput.value = scale; angleInput.value = angle;
  }
  window.refreshStampTransformPanel = refresh;

  // 把選取的物件都改掉（1×1 小圖先轉成物件）
  function editSelection(what, edit) {
    if (dropLockedSelections(what)) return false;
    pushUndo();
    const m = curMap();
    selections = selections.map(sel => {
      if (sel.type === 'stamp') { const s = m.stamps[sel.index]; if (s) edit(s); return sel; }
      const id = m.layers[sel.layer] && m.layers[sel.layer][sel.key];
      if (!id) return sel;
      const [c, r] = sel.key.split(',').map(Number);
      delete m.layers[sel.layer][sel.key];
      const stamp = { id, c, r, layer: sel.layer };
      edit(stamp);
      m.stamps.push(stamp);
      return { type: 'stamp', index: m.stamps.length - 1 };
    });
    selection = selections[selections.length - 1] || null;
    saveMaps(); draw(); refreshSelPanel();
    return true;
  }

  scaleInput.addEventListener('change', () => {
    const raw = parseFloat(scaleInput.value);
    if (!Number.isFinite(raw)) { refresh(); return; }
    const value = Math.max(SCALE_MIN, Math.min(SCALE_MAX, Math.round(raw)));
    if (selections.length) {
      if (editSelection('改大小', s => setOrDelete(s, 'scale', value, 100))) setStatus('已把 ' + selections.length + ' 個物件設成 ' + value + '%（碰撞不變）', '#7ee0c0');
    } else {
      brushScale = value; draw(); setStatus('筆刷大小：' + value + '%（之後放的物件都是這個大小）', '#b39ddb');
    }
    refresh();
  });
  angleInput.addEventListener('change', () => {
    const raw = parseFloat(angleInput.value);
    if (!Number.isFinite(raw)) { refresh(); return; }
    const value = Math.round(raw);
    if (selections.length) {
      if (editSelection('轉角度', s => setOrDelete(s, 'angle', extraFor(stampTurn(s), value), 0))) setStatus('已把 ' + selections.length + ' 個物件轉到 ' + fullAngle(0, value) + '°（碰撞不變）', '#7ee0c0');
    } else {
      brushAngle = extraFor(brushRotation, value); draw(); setStatus('筆刷角度：' + fullAngle(0, value) + '°（之後放的物件都是這個角度）', '#b39ddb');
    }
    refresh();
  });
  box.querySelector('#stampTransformReset').addEventListener('click', () => {
    if (selections.length) {
      // 基地的碰撞格是照 s.rot 存的，轉回去會對不上，只清掉大小和多轉的角度
      const clear = s => { delete s.scale; delete s.angle; if (!(tileById(s.id) || {}).baseHp) delete s.rot; };
      if (editSelection('重設', clear)) setStatus('已把 ' + selections.length + ' 個物件恢復原本的大小、角度', '#7ee0c0');
    } else {
      brushScale = 100; brushAngle = 0; brushRotation = 0; draw(); setStatus('筆刷恢復原本的大小、角度', '#b39ddb');
    }
    refresh();
  });
  // Enter 確定後就離開輸入框，接下來按方向鍵、R、F 才會作用在物件上
  [scaleInput, angleInput].forEach(el => el.addEventListener('keydown', e => { if (e.key === 'Enter') el.blur(); }));
  refresh();
})();
