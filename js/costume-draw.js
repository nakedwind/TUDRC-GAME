/* ===== 配件怎麼畫：遊戲（js/costumes.js）和服裝編輯器（js/costume-editor.js）共用 =====
   位置資料在 data/costume-placement.js（服裝編輯器匯出），找的順序：
     配件專屬 items[配件][角色][方向] → 角色的欄位預設 anchors[角色][欄位][方向] → data/costumes.js 的 COSTUME_SLOT_ANCHORS
   走路時再加上 bob[角色][方向]（走路那兩張圖頭部的位移），配件才會跟著頭晃。
   offsets[角色]＝這個角色的身高偏移 { x, y }（比較矮的角色 y 填正數＝往下）：
     還沒替這個角色調過（用到欄位通用位置）時會加上；服裝編輯器「複製給所有角色」時也會自動加上兩個角色偏移的差。
   blocked[配件]＝[角色, …]：這些角色不能擁有、不能戴這個配件（衣櫃不列出、不能送給他、身上有也不會畫）。
   added＝[配件, …]：服裝編輯器「＋ 新增配件」加的配件（寫法跟 data/costumes.js 的 COSTUME_ACCESSORIES 一樣），遊戲裡跟其他配件一起用。
   配件的 blink＝偶爾換成第 2 張圖（像眨眼）：{ front, side, back：第 2 張圖, every：大約每幾秒一次, hold：第 2 張停幾秒 }
   artFill[配件]＝{ art, blink }：服裝編輯器打開時自動找到、幫 data/costumes.js 的配件補上的側面／背面／第 2 張圖（沒寫的方向才補）。
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
  return { anchors: p.anchors || {}, items: p.items || {}, bob: p.bob || {}, offsets: p.offsets || {}, blocked: p.blocked || {}, layers: p.layers || {}, names: p.names || {}, rarity: p.rarity || {}, added: p.added || [], artFill: p.artFill || {} };
})();
const ACC_BY_ID = {};   // 配件 id → 配件（data/costumes.js 的＋服裝編輯器新增的）
// 配件名稱、稀有等級：服裝編輯器改的（names[配件]、rarity[配件]）蓋過 data/costumes.js 的 name、rarity；衣櫃、扭蛋、送禮…遊戲裡所有地方都用改過的
for (const a of COSTUME_ACCESSORIES) { a.baseName = a.name; a.baseRarity = a.rarity; a.baseArt = a.art; a.baseBlink = a.blink; }   // 原本的（恢復預設用）
// 服裝編輯器新增的配件（COSTUME_PLACEMENT.added）放進 COSTUME_ACCESSORIES；刪掉的拿掉。跟 data/costumes.js 同 id 的以 data 為準
function syncAddedAccs() {
  const added = (COSTUME_PLACEMENT.added || []).filter(x => x && x.id && x.art && x.art.front);
  for (let i = COSTUME_ACCESSORIES.length - 1; i >= 0; i--) if (COSTUME_ACCESSORIES[i].added && !added.some(x => x.id === COSTUME_ACCESSORIES[i].id)) COSTUME_ACCESSORIES.splice(i, 1);
  for (const x of added) {
    let a = COSTUME_ACCESSORIES.find(o => o.id === x.id);
    if (a && !a.added) continue;
    if (!a) { a = {}; COSTUME_ACCESSORIES.push(a); }
    for (const k of Object.keys(a)) delete a[k];   // 同一個物件換內容（別的地方拿著它也會跟著變）
    Object.assign(a, JSON.parse(JSON.stringify(x)), { added: true });
    a.baseName = a.name; a.baseRarity = a.rarity;
  }
  for (const k of Object.keys(ACC_BY_ID)) delete ACC_BY_ID[k];
  for (const a of COSTUME_ACCESSORIES) ACC_BY_ID[a.id] = a;
}
function applyAccNames() {
  syncAddedAccs();
  const names = COSTUME_PLACEMENT.names || {}, rarity = COSTUME_PLACEMENT.rarity || {}, fill = COSTUME_PLACEMENT.artFill || {};
  for (const a of COSTUME_ACCESSORIES) {
    if (!a.added) {   // 自動補上的圖（artFill）：只補 data/costumes.js 沒寫的方向
      const f = fill[a.id] || {};
      a.art = f.art ? Object.assign({}, f.art, a.baseArt) : a.baseArt;
      if (f.blink || a.baseBlink) a.blink = Object.assign({ every: 5, hold: 0.1 }, f.blink, a.baseBlink); else delete a.blink;
    }
    a.name = names[a.id] ? names[a.id] : a.baseName;
    if (rarity[a.id]) a.rarity = rarity[a.id]; else if (a.baseRarity === undefined) delete a.rarity; else a.rarity = a.baseRarity;
  }
}
applyAccNames();
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
for (const a of COSTUME_ACCESSORIES) for (const src of [...Object.values(a.art || {}), ...Object.values(a.blink || {})]) if (typeof src === 'string') accImage(src);   // 先載好，第一次畫就看得到

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
// blinking＝現在是不是「眨眼」那一下：有畫第 2 張的方向就換成第 2 張
function accArt(acc, dir, blinking) {
  const a = acc.art || {}, b = (blinking && acc.blink) || {}, pic = k => (typeof b[k] === 'string' && b[k]) || a[k];
  if (dir === 'back') return { src: a.back ? pic('back') : pic('front'), flip: false };
  if (dir === 'left') return { src: a.side ? pic('side') : pic('front'), flip: false };
  if (dir === 'right') return a.right ? { src: pic('right'), flip: false } : a.side ? { src: pic('side'), flip: true } : { src: pic('front'), flip: false };
  return { src: pic('front'), flip: false };
}
// 配件的「眨眼」：大約每 every 秒換一次第 2 張，停 hold 秒。每個角色錯開一點，不會大家同時眨
function accBlinking(acc, who) {
  const b = acc.blink; if (!b) return false;
  let h = 0; for (const ch of String(who || '') + acc.id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const every = Math.max(.5, Number(b.every) || 5) * (0.85 + (h % 31) / 100), hold = Math.max(.02, Number(b.hold) || .1);   // 每個角色的間隔差一點（85%～115%）
  return ((performance.now() / 1000 + (h % 997) / 97) % every) < hold;
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
  const art = accArt(acc, dir, accBlinking(acc, id)), img = accImage(art.src);
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
