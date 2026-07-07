/* ===== 裝飾物件資料 =====
   跟障礙物一樣可放置、會擋路、可破壞，但 HP 很低、很便宜，主要拿來佈置場景。
   結構同 data/objects.js 的 OBSTACLES：
     id / name / cost / hp + h(橫版) / v(直版) 變體(file / w / h)
   這些圖沒有橫直之分，所以 h 與 v 指同一張（按 R 轉向不會變）。
   想調 HP／價錢／哪幾格擋路，改這裡即可（省略 solid＝整張圖都擋路）。
*/
const DECORATIONS = [
  { id: 'deco_box01',     name: '紙箱',   cost: 5, hp: 15,
    h: { file: 'images/item-decorate/box01.png',       w: 1, h: 1 },
    v: { file: 'images/item-decorate/box01.png',       w: 1, h: 1 } },
  { id: 'deco_box02',     name: '大紙箱', cost: 8, hp: 20,
    h: { file: 'images/item-decorate/box02.png',       w: 2, h: 2 },
    v: { file: 'images/item-decorate/box02.png',       w: 2, h: 2 } },
  { id: 'deco_emptybox',  name: '空箱',   cost: 4, hp: 10,
    h: { file: 'images/item-decorate/emptybox.png',    w: 1, h: 1 },
    v: { file: 'images/item-decorate/emptybox.png',    w: 1, h: 1 } },
  { id: 'deco_chair',     name: '折疊椅', cost: 4, hp: 10,
    h: { file: 'images/item-decorate/Foldingchair.png', w: 1, h: 1 },
    v: { file: 'images/item-decorate/Foldingchair.png', w: 1, h: 1 } },
  { id: 'deco_gasstove',  name: '爐具',   cost: 6, hp: 15,
    h: { file: 'images/item-decorate/gasstove.png',    w: 1, h: 2 },
    v: { file: 'images/item-decorate/gasstove.png',    w: 1, h: 2 } },
  { id: 'deco_gasstove2', name: '爐具2',  cost: 6, hp: 15,
    h: { file: 'images/item-decorate/gasstove02.png',  w: 1, h: 2 },
    v: { file: 'images/item-decorate/gasstove02.png',  w: 1, h: 2 } },
  { id: 'deco_medkit',    name: '醫療箱', cost: 5, hp: 12,
    h: { file: 'images/item-decorate/Medicalkit.png',  w: 1, h: 1 },
    v: { file: 'images/item-decorate/Medicalkit.png',  w: 1, h: 1 } },
  { id: 'deco_water',     name: '水箱',   cost: 5, hp: 12,
    h: { file: 'images/item-decorate/Waterboxes.png',  w: 1, h: 1 },
    v: { file: 'images/item-decorate/Waterboxes.png',  w: 1, h: 1 } },
];
