/* ===== 配件怎麼畫：遊戲（js/costumes.js）和服裝編輯器（js/costume-editor.js）共用 =====
   位置資料在 data/costume-placement.js（服裝編輯器匯出），找的順序：
     配件專屬 items[配件][角色][方向] → 角色的欄位預設 anchors[角色][欄位][方向] → data/costumes.js 的 COSTUME_SLOT_ANCHORS
   走路時再加上 bob[角色][方向]（走路那兩張圖頭部的位移），配件才會跟著頭晃。
   offsets[角色]＝這個角色的身高偏移 { x, y }（比較矮的角色 y 填正數＝往下）：
     還沒替這個角色調過（用到欄位通用位置）時會加上；服裝編輯器「複製給所有角色」時也會自動加上兩個角色偏移的差。
   blocked[配件]＝[角色, …]：這些角色不能擁有、不能戴這個配件（衣櫃不列出、不能送給他、身上有也不會畫）。
   layers[配件]＝圖層數字：同時戴好幾個配件時，數字大的蓋在上面（沒寫＝照欄位：下身 1、背部 2、手部 3、頭飾 4、臉部 5）。
     例如尾巴要蓋在翅膀上面：尾巴填 3（比背部的 2 大）。
   從服裝編輯器按「▶ 暫存設定預覽」開的遊戲（?previewCostumes=1）用編輯器裡還沒存到專案的位置。
*/
const COSTUME_PLACEMENT_KEY = 'tudrc_costume_placement_v1';   // 服裝編輯器的暫存
const COSTUME_PLACEMENT = (() => {
  let p = typeof COSTUME_PLACEMENT_DEFAULT !== 'undefined' ? COSTUME_PLACEMENT_DEFAULT : {};
  if (/[?&]previewCostumes=1(&|$)/.test(location.search)) {
    try { const d = JSON.parse(localStorage.getItem(COSTUME_PLACEMENT_KEY) || 'null'); if (d && typeof d === 'object') p = d; } catch (_) {}
  }
  return { anchors: p.anchors || {}, items: p.items || {}, bob: p.bob || {}, offsets: p.offsets || {}, blocked: p.blocked || {}, layers: p.layers || {} };
})();
const ACC_BY_ID = Object.fromEntries(COSTUME_ACCESSORIES.map(a => [a.id, a]));
const ACC_SLOTS = ['lower', 'back', 'hand', 'head', 'face'];   // 畫的順序（後面的蓋前面的）
// 這個配件能不能戴在這個欄位
const accFitsSlot = (acc, slotId) => acc.slot === slotId;
// 圖層：數字大的畫在上面；沒設定＝欄位在 ACC_SLOTS 的順序（下身 1、背部 2…臉部 5）
const accLayerDefault = acc => ACC_SLOTS.indexOf(acc.slot) + 1;
function accLayer(acc) { const v = (COSTUME_PLACEMENT.layers || {})[acc.id]; return v != null && v !== '' && isFinite(v) ? Number(v) : accLayerDefault(acc); }
// 把身上的配件照圖層排好（一樣大就照欄位順序）
const sortAccsByLayer = list => list.map((a, i) => [a, i]).sort((p, q) => accLayer(p[0]) - accLayer(q[0]) || p[1] - q[1]).map(p => p[0]);

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
  const base = (COSTUME_SLOT_ANCHORS[acc.slot] || {})[dir] || { x: 32, y: 16 }, off = costumeCharOffset(id);   // 還沒調過：通用位置＋角色身高偏移
  return { pl: off.x || off.y ? { ...base, x: base.x + off.x, y: base.y + off.y } : base, from: 'slot' };
}
const accPlacement = (acc, id, dir) => accPlacementInfo(acc, id, dir).pl;
// 這個角色可不可以擁有／戴這個配件（服裝編輯器勾「這個角色不能擁有這個配件」＝不行）
// 不能戴：服裝編輯器勾的「不能擁有」，或配件寫了 char（角色專屬，例如溫特的狼耳、狼尾巴）而不是這個角色
const costumeAllowed = (id, accId) => {
  const acc = typeof COSTUME_ACCESSORIES !== 'undefined' && COSTUME_ACCESSORIES.find(a => a.id === accId);
  if (acc && acc.char && acc.char !== id) return false;
  return !((COSTUME_PLACEMENT.blocked || {})[accId] || []).includes(id);
};
// 角色的身高偏移（px，以角色圖 64×64 為準）；沒設定＝{ x: 0, y: 0 }
function costumeCharOffset(id) { const o = (COSTUME_PLACEMENT.offsets || {})[id] || {}; return { x: Number(o.x) || 0, y: Number(o.y) || 0 }; }
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
  if (!costumeAllowed(id, acc.id)) return null;   // 這個角色不能戴這個配件
  pl = pl || accPlacement(acc, id, dir);
  if (pl.hidden || (layer && (pl.behind ? 'behind' : 'front') !== layer)) return null;
  const art = accArt(acc, dir), img = accImage(art.src);
  if (!img || !img.complete || !img.naturalWidth) return null;
  const k = size / 64, s = pl.scale || 1, [bx, by] = costumeBob(id, dir, frame);
  const w = img.naturalWidth * k * s, h = img.naturalHeight * k * s, cx = dx + (pl.x + bx) * k, cy = dy + (pl.y + by) * k;
  ctx.save(); ctx.imageSmoothingEnabled = false;
  ctx.translate(cx, cy);
  if (pl.rot) ctx.rotate(pl.rot * Math.PI / 180);
  if (art.flip !== !!pl.flip) ctx.scale(-1, 1);   // pl.flip：服裝編輯器勾的「圖片左右翻轉」
  ctx.drawImage(img, -w / 2, -h / 2, w, h);
  ctx.restore();
  return { cx, cy, w, h };
}
