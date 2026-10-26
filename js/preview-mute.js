/* ===== 編輯器「▶ 預覽遊戲」的背景音開關 =====
   地圖編輯器、劇情地圖編輯器、基地編輯器的工具列有「🔇 預覽背景音」按鈕：
   關掉時，從編輯器開的預覽視窗（塔防原型.html?preview=1）不播背景音（環境白噪音 js/ambience.js、燈管嗡嗡聲 js/flicker-light.js），
   邊編輯邊開著預覽也不會一直吵。只影響預覽視窗，正式玩遊戲的聲音完全不變。
   設定記在瀏覽器（PREVIEW_MUTE.key）；預設是關著（不播）。按鈕一按，開著的預覽視窗馬上跟著變（storage 事件）。
   編輯器和遊戲都載入這個檔：編輯器那邊接上按鈕，遊戲那邊提供 previewBgMuted() 給背景音判斷。
*/
const PREVIEW_MUTE = { key: 'tudrc_preview_bg_mute_v1' };
const isPreviewWindow = /[?&]preview=1(&|$)/.test(location.search);
function previewBgMuteSetting() { try { return localStorage.getItem(PREVIEW_MUTE.key) !== '0'; } catch (_) { return true; } }   // 沒設定過＝不播
// 遊戲用：這個視窗是編輯器開的預覽、而且編輯器那邊把背景音關掉了
const previewBgMuted = () => isPreviewWindow && previewBgMuteSetting();
// 編輯器用：接上工具列的按鈕
(() => {
  const btn = document.getElementById('previewBgMute'); if (!btn) return;
  const paint = () => {
    const muted = previewBgMuteSetting();
    btn.textContent = muted ? '🔇 預覽背景音：關' : '🔊 預覽背景音：開';
    btn.title = '從這裡開的「▶ 預覽遊戲」視窗要不要播背景音（環境白噪音、燈管嗡嗡聲）。只影響預覽，正式遊戲不受影響。';
    btn.classList.toggle('on', !muted);
  };
  btn.addEventListener('click', () => {
    try { localStorage.setItem(PREVIEW_MUTE.key, previewBgMuteSetting() ? '0' : '1'); } catch (_) {}
    paint();
  });
  window.addEventListener('storage', e => { if (e.key === PREVIEW_MUTE.key) paint(); });   // 另一個編輯器按了：這裡的按鈕也跟著變
  paint();
})();
