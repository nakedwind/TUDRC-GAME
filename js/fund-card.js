/* ===== 作戰經費提示卡：第一次到達一張戰鬥地圖時，畫面右邊滑出一張卡，告訴玩家撥了多少經費 =====
   ・什麼時候跳：js/game.js 的 begin（進入地圖）先問 fundCardDue()，經費記成「給過了」之後再 showFundCard(金額)。
     重新部署、再次出擊、接續作戰都不會再跳（經費本來就只給一次，js/missions.js 的 missionMoneyGiven）。
   ・金額：這張地圖的作戰經費（地圖編輯器「規則」的經費，START.money），不寫死。
   ・位置、大小、文字大小：UI編輯器（js/ui-layout.js 的 fundCard），編輯器裡會一直擺一張範例卡方便調整。
   ・文字改這裡的 FUND_CARD；{money} 會換成金額。 */
const FUND_CARD = {
  title: '💰 作戰經費 +${money}',
  body: '首次進入本區，應變中心已撥下這一區的作戰經費，可用來建造防禦設施與補給。',
  note: '',   // 最下面的小字；空白＝不顯示
  delay: 1.2,    // 進地圖後幾秒才滑出來（等黑幕淡出）
  stay: 7,       // 停留幾秒（點一下卡片可以提早關掉）
  sample: 5000,  // UI編輯器裡範例卡顯示的金額
};
let fundCardEl = null, fundCardTimer = 0, fundCardPinned = false;
function ensureFundCard() {
  if (fundCardEl) return fundCardEl;
  const wrap = document.getElementById('wrap'); if (!wrap) return null;
  fundCardEl = document.createElement('div');
  fundCardEl.id = 'fundCard'; fundCardEl.className = 'fund-card hidden';
  fundCardEl.setAttribute('role', 'status');
  fundCardEl.innerHTML = '<b class="fund-card-title"></b><p class="fund-card-body"></p><small class="fund-card-note"></small>';
  fundCardEl.addEventListener('click', () => { if (!fundCardPinned) hideFundCard(); });
  wrap.appendChild(fundCardEl);
  return fundCardEl;
}
function fillFundCard(money) {
  const el = ensureFundCard(); if (!el) return null;
  const fill = s => String(s || '').replace(/\{money\}/g, String(Math.round(money)));   // 金額不加千分位逗號（$5000）
  el.querySelector('.fund-card-title').textContent = fill(FUND_CARD.title);
  el.querySelector('.fund-card-body').textContent = fill(FUND_CARD.body);
  const note = el.querySelector('.fund-card-note'); note.textContent = fill(FUND_CARD.note); note.hidden = !FUND_CARD.note;
  return el;
}
// 這次進地圖要不要跳卡（要在 markMissionMapReached 記下「給過了」之前問）
function fundCardDue() {
  if (typeof PREVIEW !== 'undefined' && PREVIEW) return false;   // 開始畫面背景載入的地圖不算
  if (MAP_SAFE || MAP_STORY || window.TEST_MODE || !MAP) return false;
  if (typeof practiceOn === 'function' && practiceOn()) return false;   // 訓練室的經費另外算
  if (!(START.money > 0)) return false;
  return typeof missionMoneyGiven === 'function' && !missionMoneyGiven(MAP.id);
}
function showFundCard(money) {
  clearTimeout(fundCardTimer);
  const mapId = MAP && MAP.id;
  fundCardTimer = setTimeout(() => {
    if (!MAP || MAP.id !== mapId) return;   // 等待中換了地圖：不跳
    const el = fillFundCard(money); if (!el) return;
    el.classList.remove('hidden', 'leaving'); void el.offsetWidth; el.classList.add('show');
    if (typeof sfx === 'function') sfx('coin');
    fundCardTimer = setTimeout(hideFundCard, FUND_CARD.stay * 1000);
  }, FUND_CARD.delay * 1000);
}
function hideFundCard() {
  if (!fundCardEl || fundCardPinned) return;
  clearTimeout(fundCardTimer);
  fundCardEl.classList.add('leaving'); fundCardEl.classList.remove('show');
  fundCardTimer = setTimeout(() => fundCardEl.classList.add('hidden'), 350);
}
// UI編輯器的預覽（?uiedit=1）：一直顯示一張範例卡，才選得到、調得到
if (/[?&]uiedit=1(&|$)/.test(location.search)) {
  const pin = () => { const el = fillFundCard(FUND_CARD.sample); if (!el) return; fundCardPinned = true; el.classList.remove('hidden', 'leaving'); el.classList.add('show'); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', pin); else pin();
}
