// ============================================================
//  對話框：點畫面任何地方都能換下一句（跟按 Space、點「下一句」一樣）
//  ・所有用 #dialogueBox 的對話都適用：新手區艾德林的提示、希奧妮的無線電、找隊員／NPC 說話、海報告示…
//  ・點到按鈕（送禮、開發工坊、× 關閉…）、輸入框、送禮清單時照原本的功能，不會換頁。
//  ・剛打開的一瞬間不算（打開對話框的那一下點擊不會順便跳過第一句）。
//  ・回憶劇情（js/story-scene.js）有自己的點擊換頁，這裡不管。
//  必須在 js/game.js 之後載入。
// ============================================================
const DIALOGUE_CLICK = {
  openGrace: .25,   // 對話框打開後幾秒內的點擊不算
};
(() => {
  let openedAt = 0, wasOpen = false;
  // 記下對話框什麼時候打開的
  new MutationObserver(() => {
    const open = !dialogueBox.classList.contains('hidden');
    if (open && !wasOpen) openedAt = performance.now();
    wasOpen = open;
  }).observe(dialogueBox, { attributes: true, attributeFilter: ['class'] });

  window.addEventListener('click', e => {
    if (!dialogueState || dialogueBox.classList.contains('hidden') || e.button !== 0) return;
    if (typeof StoryScene !== 'undefined' && StoryScene.active()) return;
    if (performance.now() - openedAt < DIALOGUE_CLICK.openGrace * 1000) return;
    if (e.target.closest('button, a, input, select, textarea, label, #giftPicker, .dialogue-options')) return;
    e.preventDefault();
    advanceDialogue();
  }, true);
})();
