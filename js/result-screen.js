// ============================================================
//  結算畫面（打贏、打輸）的版面：彈窗加寬、按鈕放進彈窗裡，不用捲動
//  ・結算時 #overlay 加上 .result：藏起「開始新遊戲」「測試模式」，把大按鈕（還有「留下來繼續探索」）搬進卡片底部。
//  ・其他時候（開始畫面…）再搬回原位。
// ============================================================
const resultOverlay = document.getElementById('overlay');
const resultCard = resultOverlay.querySelector('.overlay-card');
const resultOvBtn = document.getElementById('ov-btn');
const resultBtnHome = { parent: resultOvBtn.parentNode, next: resultOvBtn.nextSibling };   // 大按鈕原本的位置
function enterResultMode() {
  resultOverlay.classList.add('result');
  let actions = resultCard.querySelector('.result-actions');
  if (!actions) { actions = document.createElement('div'); actions.className = 'result-actions'; resultCard.appendChild(actions); }
  actions.prepend(resultOvBtn);
  const stay = document.getElementById('coreStay'); if (stay) actions.appendChild(stay);
}
function exitResultMode() {
  if (!resultOverlay.classList.contains('result')) return;
  resultOverlay.classList.remove('result');
  resultBtnHome.parent.insertBefore(resultOvBtn, resultBtnHome.next);
  resultCard.querySelector('.result-actions')?.remove();
}
// 包住原本的函式：showOverlay 先回到一般版面；winOverlay／loseOverlay 畫完再換成結算版面
const resultBaseShowOverlay = showOverlay;
showOverlay = function (...args) { exitResultMode(); return resultBaseShowOverlay.apply(this, args); };
const resultBaseWinOverlay = winOverlay;
winOverlay = function (...args) { const r = resultBaseWinOverlay.apply(this, args); enterResultMode(); return r; };
const resultBaseLoseOverlay = loseOverlay;
loseOverlay = function (...args) { const r = resultBaseLoseOverlay.apply(this, args); enterResultMode(); return r; };
