/* ===== 地上的坑洞：角色走過「坑洞」素材會變慢（例如 images/破損建築 的 hole01、hole02） =====
   哪些素材是坑洞、慢多少：地圖編輯器／基地編輯器選素材後，在「選中素材」那一列勾「這是坑洞」再填 %
   （存在 data/tiles.js 每個素材的 pit：{ ally, enemy }）
     ally：溫特、隊員、哨兵走過去的速度＝平常的幾 %（20＝慢 80%）
     enemy：怪物走過去的速度＝平常的幾 %（50＝慢 50%）
   ・坑洞的範圍＝素材圖中間的一個橢圓（圖的邊邊是噴濺出去的碎裂紋，踩到不算），大小在 PIT.area
   ・走路變慢：js/build.js 的 slowFactorAt 會問 pitSlowAt
   ・飛在空中的怪物、鑽在地底的版權老鼠不受影響 */
const PIT = {
  area: .7,     // 橢圓佔素材圖寬、高的幾成（1＝整張圖都算）
  footDy: 14,   // 角色的位置（x, y）往下幾點是腳（用腳踩的地方判斷）
};
const PIT_DEFAULT = { ally: 20, enemy: 50 };   // 沒填的數字用這個

// 素材的坑洞設定（沒有＝不是坑洞）；數字超出範圍會被拉回來，換成 0～1 的倍率
function pitSpecOf(t) {
  const p = t && t.pit; if (!p) return null;
  const num = (v, d) => Math.max(5, Math.min(100, Number.isFinite(+v) ? +v : d)) / 100;
  return { ally: num(p.ally, PIT_DEFAULT.ally), enemy: num(p.enemy, PIT_DEFAULT.enemy) };
}
// 這張地圖哪裡有坑洞：換地圖、地圖物件數量變了才重新整理一次
let pitCache = { map: null, n: -1, list: [] };
function pitIndex() {
  if (typeof MAP === 'undefined' || !MAP) return [];
  const n = (MAP.stamps || []).length;
  if (pitCache.map === MAP && pitCache.n === n) return pitCache.list;
  const list = [];
  const add = (x0, y0, w, h, spec) => list.push({ cx: x0 + w / 2, cy: y0 + h / 2, rx: w * PIT.area / 2, ry: h * PIT.area / 2, spec });
  const order = typeof MAP_LAYER_ORDER !== 'undefined' ? MAP_LAYER_ORDER : Object.keys(MAP.layers || {});
  for (const lid of order) {   // 一格一格放的小圖
    const layer = (MAP.layers || {})[lid] || {};
    for (const key in layer) {
      const t = mapTileById(layer[key]), spec = pitSpecOf(t); if (!spec) continue;
      const [c, r] = key.split(',').map(Number);
      add(OX + c * CELL, OY + r * CELL, mapTileW(t) * CELL, mapTileH(t) * CELL, spec);
    }
  }
  for (const s of MAP.stamps || []) {   // 大張的物件（會跟著物件的大小 %、旋轉）
    const t = mapTileById(s.id), spec = pitSpecOf(t); if (!spec) continue;
    add(OX + s.c * CELL + (s.ox || 0), OY + s.r * CELL + (s.oy || 0), mapStampW(s, t) * CELL, mapStampH(s, t) * CELL, spec);
  }
  pitCache = { map: MAP, n, list };
  return list;
}
// 給 js/build.js 的 slowFactorAt：踩在坑洞裡走路變慢
// who：'ally'（溫特、隊員）或 'enemy'（怪物）；actor：誰在走（飛的、鑽地底的不算）
function pitSlowAt(x, y, who, actor) {
  const list = pitIndex(); if (!list.length) return 1;
  if (actor && (actor.flying || (typeof burrowUnderground === 'function' && burrowUnderground(actor)))) return 1;
  const fy = y + PIT.footDy;
  let k = 1;
  for (const p of list) {
    const dx = (x - p.cx) / p.rx, dy = (fy - p.cy) / p.ry;
    if (dx * dx + dy * dy <= 1) k = Math.min(k, who === 'enemy' ? p.spec.enemy : p.spec.ally);
  }
  return k;
}
