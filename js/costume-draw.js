/* ===== 配件怎麼畫：遊戲（js/costumes.js）和服裝編輯器（js/costume-editor.js）共用 =====
   位置資料在 data/costume-placement.js（服裝編輯器匯出），找的順序：
     配件專屬 items[配件][角色][方向] → 角色的欄位預設 anchors[角色][欄位][方向] → data/costumes.js 的 COSTUME_SLOT_ANCHORS
   走路時再加上 bob[角色][方向]（走路那兩張圖頭部的位移），配件才會跟著頭晃。
   從服裝編輯器按「▶ 暫存設定預覽」開的遊戲（?previewCostumes=1）用編輯器裡還沒存到專案的位置。
*/
const COSTUME_PLACEMENT_KEY = 'tudrc_costume_placement_v1';   // 服裝編輯器的暫存
const COSTUME_PLACEMENT = (() => {
  let p = typeof COSTUME_PLACEMENT_DEFAULT !== 'undefined' ? COSTUME_PLACEMENT_DEFAULT : {};
  if (/[?&]previewCostumes=1(&|$)/.test(location.search)) {
    try { const d = JSON.parse(localStorage.getItem(COSTUME_PLACEMENT_KEY) || 'null'); if (d && typeof d === 'object') p = d; } catch (_) {}
  }
  return { anchors: p.anchors || {}, items: p.items || {}, bob: p.bob || {} };
})();
const ACC_BY_ID = Object.fromEntries(COSTUME_ACCESSORIES.map(a => [a.id, a]));
const ACC_SLOTS = ['back', 'hand', 'head', 'face'];   // 畫的順序（後面的蓋前面的）

const accImgCache = {};
function accImage(src) { if (!src) return null; let img = accImgCache[src]; if (!img) { img = accImgCache[src] = new Image(); img.src = src; } return img; }
for (const a of COSTUME_ACCESSORIES) for (const src of Object.values(a.art || {})) accImage(src);   // 先載好，第一次畫就看得到

const pick3 = (o, a, b, c) => o && o[a] && o[a][b] && o[a][b][c];
// 這個配件在這個角色、這個方向要放哪裡；from＝用到哪一層（'item'、'anchor'、'slot'）
function accPlacementInfo(acc, id, dir) {
  const own = pick3(COSTUME_PLACEMENT.items, acc.id, id, dir);
  if (own) return { pl: own, from: 'item' };
  const anchor = pick3(COSTUME_PLACEMENT.anchors, id, acc.slot, dir);
  if (anchor) return { pl: anchor, from: 'anchor' };
  return { pl: (COSTUME_SLOT_ANCHORS[acc.slot] || {})[dir] || { x: 32, y: 16 }, from: 'slot' };
}
const accPlacement = (acc, id, dir) => accPlacementInfo(acc, id, dir).pl;
// 這個方向用哪張圖、要不要左右翻（側面圖畫朝左，往右走時翻過來）
function accArt(acc, dir) {
  const a = acc.art || {};
  if (dir === 'back') return { src: a.back || a.front, flip: false };
  if (dir === 'left') return { src: a.side || a.front, flip: false };
  if (dir === 'right') return { src: a.right || a.side || a.front, flip: !a.right && !!a.side };
  return { src: a.front, flip: false };
}
// 現在畫的是哪一張：0＝站立、1＝走路第 1 張、2＝走路第 2 張（跟 js/game.js 的 pickCharacterFrame 一樣算）
function costumeFrameOf(who) {
  if (!who) return 0;
  if (who.frame != null) return who.frame;
  if (!who.moving || who.gunT > 0) return 0;
  return [1, 0, 2, 0][Math.floor((who.anim || 0) * 8) % 4];
}
function costumeBob(id, dir, frame) {
  const b = frame > 0 && COSTUME_PLACEMENT.bob[id] && COSTUME_PLACEMENT.bob[id][dir];
  return (b && b[frame - 1]) || [0, 0];
}
// 畫一個配件；pl 不給就照資料找。dx、dy、size＝角色圖畫在哪裡、多大；layer＝'behind'／'front'（不給＝不管前後都畫）
function drawAccessory(ctx, acc, id, dir, frame, dx, dy, size, layer, pl) {
  pl = pl || accPlacement(acc, id, dir);
  if (pl.hidden || (layer && (pl.behind ? 'behind' : 'front') !== layer)) return null;
  const art = accArt(acc, dir), img = accImage(art.src);
  if (!img || !img.complete || !img.naturalWidth) return null;
  const k = size / 64, s = pl.scale || 1, [bx, by] = costumeBob(id, dir, frame);
  const w = img.naturalWidth * k * s, h = img.naturalHeight * k * s, cx = dx + (pl.x + bx) * k, cy = dy + (pl.y + by) * k;
  ctx.save(); ctx.imageSmoothingEnabled = false;
  ctx.translate(cx, cy);
  if (pl.rot) ctx.rotate(pl.rot * Math.PI / 180);
  if (art.flip) ctx.scale(-1, 1);
  ctx.drawImage(img, -w / 2, -h / 2, w, h);
  ctx.restore();
  return { cx, cy, w, h };
}
