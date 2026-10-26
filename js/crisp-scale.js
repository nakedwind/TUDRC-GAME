/* ===== 平滑放大：先整數倍放大、再平滑縮回（減少 1.5 倍這種非整數放大的鋸齒）=====
   像素圖放大 1.5 倍時，每個原始像素有的變 1 格、有的變 2 格，線條粗細不均 → 鋸齒。
   做法：整個畫面先畫在一張看不見的大畫布上，放大倍率湊成整數（1.5 → 2、1.75 → 2、2.1 → 3），
   每個像素都一樣大；再把這張大畫布「平滑地」縮小貼回遊戲畫面。像素邊緣會稍微柔和一點，但不再忽粗忽細。
   ・倍率本來就是整數（1、2、3…）時直接照舊畫，不多花效能。
   ・開關：設定 → 🔊 聲音／畫面 頁的「平滑放大」，或按 F9 立刻切換比較（記在這台瀏覽器）。
   ・必須在 js/render.js（draw）之後、js/game.js 之前載入：這裡把 draw 包一層，遊戲照常呼叫 draw()。 */
const CRISP_SCALE = (() => {
  const KEY = 'tudrc_crisp_scale_v1';
  let on = true;
  try { on = localStorage.getItem(KEY) !== '0'; } catch (_) {}
  const big = document.createElement('canvas'), bigCtx = big.getContext('2d');
  const drawRaw = draw;
  draw = function crispDraw() {
    const f = Math.ceil(VIEW_SCALE - 1e-6) / VIEW_SCALE;   // 大畫布要大幾倍，世界才剛好是整數倍
    if (!on || !(f > 1.001)) { drawRaw(); return; }
    const w = Math.round(cv.width * f), h = Math.round(cv.height * f);
    if (big.width !== w || big.height !== h) { big.width = w; big.height = h; }
    bigCtx.setTransform(w / cv.width, 0, 0, h / cv.height, 0, 0);
    bigCtx.imageSmoothingEnabled = false;
    const real = ctx;
    ctx = bigCtx;   // js/game.js 的 ctx 是 let：這一幀所有東西都畫到大畫布上（js/water.js 也用同一招）
    try { drawRaw(); } finally { ctx = real; }
    real.save();
    real.setTransform(1, 0, 0, 1, 0, 0); real.globalAlpha = 1; real.globalCompositeOperation = 'copy'; real.filter = 'none';
    real.imageSmoothingEnabled = true; real.imageSmoothingQuality = 'high';
    real.drawImage(big, 0, 0, cv.width, cv.height);
    real.restore();
  };
  // ---- 開關 ----
  let tip = null, tipTimer = 0;
  function showTip() {   // 按 F9 時畫面中間上方提示目前是哪一種
    if (!tip) {
      tip = document.createElement('div');
      tip.style.cssText = 'position:fixed;left:50%;top:18px;transform:translateX(-50%);z-index:100000;padding:6px 14px;border-radius:999px;background:rgba(10,16,24,.88);border:1px solid #57718b;color:#e8f2ff;font:600 13px system-ui,"Microsoft JhengHei",sans-serif;pointer-events:none';
      document.body.appendChild(tip);
    }
    tip.textContent = on ? '平滑放大：開（先 2 倍再縮回）' : '平滑放大：關（原本的畫法）';
    tip.style.display = ''; clearTimeout(tipTimer); tipTimer = setTimeout(() => { tip.style.display = 'none'; }, 1400);
  }
  function set(v, tipToo) {
    on = !!v;
    try { localStorage.setItem(KEY, on ? '1' : '0'); } catch (_) {}
    const box = document.getElementById('crispScale'); if (box) box.checked = on;
    if (tipToo) showTip();
  }
  window.addEventListener('keydown', e => {
    if (e.key !== 'F9' || e.repeat) return;
    e.preventDefault(); set(!on, true);
  });
  document.addEventListener('DOMContentLoaded', () => {
    const box = document.getElementById('crispScale'); if (!box) return;
    box.checked = on; box.addEventListener('change', () => set(box.checked, false));
  });
  return { get on() { return on; }, set };
})();
