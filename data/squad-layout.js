/* ===== T-Pad「Y102隊員」頁的版面（由「🧑‍🚀 Y102隊員裝備／技能編輯器」匯出，整段覆蓋即可）=====
   elements：每個可以調整的區域／圖片／文字 → { x, y：位移（像素）, w, h：寬高（像素）, size：圖片大小（寬，高度照比例）, font：字級, align：文字對齊 }
   texts：改過的介面文字（標題、按鈕…）
   沒寫在這裡的就照原本的樣子。套用的程式在 js/squad-page.js。 */
const SQUAD_LAYOUT = {
  "elements": {
    "box.bars": {
      "y": -10
    },
    "stat:atk": {
      "y": -10
    },
    "stat:rate": {
      "y": -10
    },
    "stat:acc": {
      "y": -10
    },
    "stat:def": {
      "y": -10
    },
    "stat:range": {
      "y": -10
    },
    "stat:move": {
      "y": -10
    },
    "text.status": {
      "y": 2
    }
  },
  "texts": {}
};
