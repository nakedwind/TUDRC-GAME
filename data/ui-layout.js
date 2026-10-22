/* 遊戲畫面 UI 的版面調整：由「UI編輯器.html」匯出，整份覆蓋即可。
   items：UI 元素代號（js/ui-layout.js 的 UI_ELEMENTS）→ { x, y：位移（px）, scale：大小（1＝原本）, opacity：透明度（1＝不透明）, hidden：是否隱藏 }
   沒寫到的元素＝維持原本的樣子。 */
const UI_LAYOUT = {
  "items": {
    "buildBar": {
      "y": 13,
      "scale": 0.98,
      "parts": {
        "slot": {
          "w": 50,
          "h": 50,
          "radius": 10
        }
      }
    }
  }
};
