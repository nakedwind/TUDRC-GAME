/* ===== 載入畫面（圖片還沒下載完時先擋住畫面）=====
   網路慢的時候（例如 GitHub Pages），圖片要下載好一陣子；還沒下載到的圖片在遊戲裡會變成黑塊。
   這裡追蹤遊戲裡所有正在下載的圖片：只要還有圖片沒下載完，就蓋上「載入中」畫面並暫停遊戲，
   全部下載完（或下載失敗）就自動消失。之後換地圖遇到新圖片要下載，也會再出現。
   ・必須是第一個載入的程式（之後的程式建立的圖片才追蹤得到）
   ・背景慢慢下載、不需要等的圖片，用 AssetGate.quiet(() => { ... }) 包起來就不會被追蹤
   ・等太久會出現「先開始遊戲」按鈕；單張圖片超過 TIMEOUT 秒還沒好就不再等它
   ・只有「開場」和「換地圖」的時候會擋（armed）：這兩個時候載好之後就放手，遊戲進行中才第一次用到的圖片
     （第一次出現的怪物、特效、撿到的東西…）在背景慢慢下載，不會再跳「載入中」把遊戲停住。
     換地圖時 js/maploader.js 的 switchMap 會呼叫 AssetGate.arm()。
*/
const AssetGate = (() => {
  const SHOW_DELAY = 250;   // 毫秒：很快就下載好的（瀏覽器快取）不顯示，避免畫面閃一下
  const SKIP_AFTER = 15;    // 秒：等這麼久還沒好，出現「先開始遊戲」按鈕
  const TIMEOUT = 60;       // 秒：單張圖片等超過這麼久就當作好了
  const pending = new Map();   // 圖片 → 開始下載的時間
  let batchTotal = 0, batchDone = 0, batchStart = 0, quietDepth = 0, skipped = false;
  let el = null, barEl = null, birdEl = null, textEl = null, skipBtn = null;
  const idleWaiters = [];
  const ARM_MIN = 500;   // 毫秒：開場／換地圖之後至少等這麼久（讓這段時間裡要下載的東西都先登記到）
  let armed = true, armedAt = performance.now();   // 開場先擋

  function finish(img) {
    if (!pending.has(img)) return;
    pending.delete(img); batchDone++;
    if (!pending.size) {
      batchTotal = 0; batchDone = 0; skipped = false;
      idleWaiters.splice(0).forEach(fn => { try { fn(); } catch (err) { console.error(err); } });
    }
  }
  function track(img) {
    if (!armed || quietDepth > 0 || !img || pending.has(img)) return;   // 遊戲進行中：不擋，背景下載
    if (!pending.size) batchStart = performance.now();
    pending.set(img, performance.now()); batchTotal++;
    const done = () => finish(img);
    img.addEventListener('load', done, { once: true });
    img.addEventListener('error', done, { once: true });
  }
  // 圖片以外要等的東西（例如音效）：傳一個 Promise，成功或失敗都算好了
  function wait(promise) {
    if (!armed) return;   // 遊戲進行中才要的音效：背景下載，不擋
    const token = {};
    if (!pending.size) batchStart = performance.now();
    pending.set(token, performance.now()); batchTotal++;
    Promise.resolve(promise).then(() => finish(token), () => finish(token));
  }
  // 攔截所有圖片的 src 設定（new Image() 或 <img> 都算）
  const desc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
  if (desc && desc.set) {
    Object.defineProperty(HTMLImageElement.prototype, 'src', {
      configurable: true, enumerable: desc.enumerable, get: desc.get,
      set(v) { desc.set.call(this, v); if (v) track(this); },
    });
  }

  // 載入畫面上跟著進度條飛的小鳥（兩張圖輪流＝拍翅膀）；先在背景下載好，載入畫面出現時就有圖
  const BIRD = ['images/loading/bird-fly01.png', 'images/loading/bird-fly02.png'];
  quietDepth++; BIRD.forEach(src => { new Image().src = src; }); quietDepth--;

  function build() {
    el = document.createElement('div');
    el.id = 'assetGate';
    el.innerHTML = '<div class="ag-box"><div class="ag-title">載入中…</div><div class="ag-track"><b class="ag-bird"></b><div class="ag-bar"><i></i></div></div>'
      + '<div class="ag-text"></div><div class="ag-note">第一次開啟要下載遊戲圖片和音效，網路比較慢時需要等一下。</div>'
      + '<button type="button" class="ag-skip" hidden>先開始遊戲</button></div>';
    const css = document.createElement('style');
    css.textContent = `
      #assetGate { position:fixed; inset:0; z-index:100000; display:flex; align-items:center; justify-content:center;
        background:rgba(8,11,16,.92); color:#e8edf5; font-family:system-ui,'Microsoft JhengHei',sans-serif; }
      #assetGate[hidden] { display:none }
      #assetGate .ag-box { width:min(360px, calc(100vw - 32px)); text-align:center; }
      #assetGate .ag-title { font-size:20px; font-weight:700; margin-bottom:14px; letter-spacing:2px }
      #assetGate .ag-track { position:relative; padding-top:34px }
      #assetGate .ag-bird { position:absolute; top:0; left:0; width:40px; height:40px; margin-left:-20px; transition:left .2s;
        background:url(${BIRD[0]}) center/contain no-repeat; image-rendering:pixelated; animation:ag-flap .3s step-end infinite, ag-bob .6s ease-in-out infinite }
      @keyframes ag-flap { 0% { background-image:url(${BIRD[0]}) } 50% { background-image:url(${BIRD[1]}) } }
      @keyframes ag-bob { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-3px) } }
      #assetGate .ag-bar { height:10px; border-radius:99px; background:#1f2a36; border:1px solid #3a4b60; overflow:hidden }
      #assetGate .ag-bar i { display:block; height:100%; width:0; background:linear-gradient(90deg,#5fb3c4,#a98bff); transition:width .2s }
      #assetGate .ag-text { margin-top:10px; font-size:14px; color:#b8c9da }
      #assetGate .ag-note { margin-top:6px; font-size:12px; color:#7f91a5 }
      #assetGate .ag-skip { margin-top:16px; cursor:pointer; color:#eaf3ff; background:#2a3e54; border:1px solid #5b7793; border-radius:8px; padding:8px 14px; font:inherit }`;
    document.head.appendChild(css);
    document.body.appendChild(el);
    barEl = el.querySelector('.ag-bar i'); birdEl = el.querySelector('.ag-bird'); textEl = el.querySelector('.ag-text'); skipBtn = el.querySelector('.ag-skip');
    skipBtn.dataset.uiSound = 'none';
    skipBtn.addEventListener('click', () => { skipped = true; refresh(); });
  }
  function blocking() {
    if (!pending.size || skipped) return false;
    const now = performance.now();
    for (const [img, t0] of pending) if (now - t0 > TIMEOUT * 1000) finish(img);   // 太久的不等了
    return pending.size > 0 && now - batchStart > SHOW_DELAY;
  }
  function refresh() {
    if (armed && !pending.size && performance.now() - armedAt > ARM_MIN) armed = false;   // 開場／換地圖要的都好了：放手
    const show = blocking();
    if (!el) { if (!show || !document.body) return; build(); }
    el.hidden = !show;
    if (!show) return;
    const pct = batchTotal ? Math.round(batchDone / batchTotal * 100) : 0;
    barEl.style.width = pct + '%';
    birdEl.style.left = pct + '%';   // 小鳥跟著進度條的前端飛
    textEl.textContent = `圖片、音效 ${batchDone} / ${batchTotal}（${pct}%）`;
    skipBtn.hidden = performance.now() - batchStart < SKIP_AFTER * 1000;
  }
  setInterval(refresh, 150);   // 遊戲主迴圈還沒開始時也要更新進度

  return {
    blocking,      // true＝還在等圖片：遊戲先暫停
    refresh,
    arm() { armed = true; armedAt = performance.now(); },   // 換地圖：接下來要下載的圖片先擋住等它們好（js/maploader.js）
    wait,          // 等一個 Promise 完成（音效下載＋解碼，js/sfx.js）
    quiet(fn) { quietDepth++; try { return fn(); } finally { quietDepth--; } },   // 這裡面建立的圖片不追蹤（背景下載）
    whenIdle(fn) { if (!pending.size) fn(); else idleWaiters.push(fn); },        // 目前這批圖片都好了再做
    get pendingCount() { return pending.size; },
  };
})();
