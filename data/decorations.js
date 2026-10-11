/* ===== 玩家可建造的裝飾物件資料 =====
   跟障礙物一樣可放置、會擋路、可破壞，但 HP 很低、很便宜。
   紙箱、空箱、折疊椅、醫療箱與盆栽只供地圖編輯器使用，不列在這裡。
   結構同 data/objects.js 的 OBSTACLES：
     id / name / cost / hp + h(橫版) / v(直版) 變體(file / w / h)
   這些圖沒有橫直之分，所以 h 與 v 指同一張（按 R 轉向不會變）。
   想調 HP／價錢／哪幾格擋路，改這裡即可（省略 solid＝整張圖都擋路）。
*/
const DECORATIONS = [
  { id: 'deco_gasstove',  name: '爐具',   cost: 6, hp: 15,
    h: { file: 'images/item-decorate/gasstove.png',    w: 1, h: 2 },
    v: { file: 'images/item-decorate/gasstove.png',    w: 1, h: 2 } },
  { id: 'deco_gasstove2', name: '爐具2',  cost: 6, hp: 15,
    h: { file: 'images/item-decorate/gasstove02.png',  w: 1, h: 2 },
    v: { file: 'images/item-decorate/gasstove02.png',  w: 1, h: 2 } },
  { id: 'deco_oil_drum', name: '油桶', cost: 12, hp: 40,
    h: { file: 'images/item-decorate/oil-drum.png', w: 1, h: 2 },
    v: { file: 'images/item-decorate/oil-drum.png', w: 1, h: 2 } },
  { id: 'deco_oil_tank', name: '油箱', cost: 8, hp: 25,
    h: { file: 'images/item-decorate/oil-tank.png', w: 1, h: 1 },
    v: { file: 'images/item-decorate/oil-tank.png', w: 1, h: 1 } },
];
