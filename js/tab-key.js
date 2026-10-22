/* ===== Tab 鍵：只用來開關 T-Pad =====
   ・這個檔案在 塔防原型.html 最先載入，所以最先收到 Tab：一律擋掉瀏覽器預設的「Tab 切換焦點」（按鈕、輸入框之間跳來跳去）。
   ・真正開關 T-Pad 的是 js/tpad.js（Tab 也不會再傳給遊戲的其他按鍵處理）；
     其他視窗開著、把按鍵整個吃掉時（例如作戰計畫、怪物圖鑑、衣櫃），Tab 就什麼都不做。
*/
window.addEventListener('keydown', e => { if (e.key === 'Tab') e.preventDefault(); }, true);
