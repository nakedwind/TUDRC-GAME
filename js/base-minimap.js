/* ===== 基地右下角小地圖（應變中心裡才出現）=====
   ・畫目前這層樓的所有房間（跟 T-Pad「地圖」同一份樓層示意圖：js/tpad-map.js 的 tmapFloors），整層縮小放進框裡。
   ・標出：自己在的房間（框線變亮）、溫特的位置（藍點）、同層的人（哨兵／嚮導／其他人員的顏色點）、樓梯（黃色小方塊）。
   ・右上兩個按鈕：⛶ 打開完整地圖（T-Pad「地圖」App）、— 收起小地圖；收起後右下角留一個小按鈕可以再叫出來（記在瀏覽器 tudrc_base_minimap_hidden）。
   ・點小地圖本身也會打開完整地圖。
   ・按住標題列可以拖到畫面上任何地方，雙擊標題列回到原本位置（js/tpad-map.js 的 minimapDraggable，記在瀏覽器 tudrc_minimap_pos）。
   ・戰鬥區域、回憶劇情地圖不顯示（戰鬥區域有自己的導航記錄器小地圖：js/tpad-map.js 的 #navMinimap）。
   ・UI編輯器可以調位置：js/ui-layout.js 的 UI_ELEMENTS（baseMinimap、baseMinimapShow）。
   必須在 js/tpad-map.js、js/tpad.js 之後載入。
*/
const BMAP = { w: 210, h: 128, head: 24, pad: 6, right: 14, bottom: 14, scale: 2 };   // 地圖區大小（px）、標題列高度、地圖離邊框、離右下角幾 px、畫布解析度倍數（放大後才不會糊）
const BMAP_HIDE_KEY = 'tudrc_base_minimap_hidden';
let bmapHidden = false;
try { bmapHidden = localStorage.getItem(BMAP_HIDE_KEY) === '1'; } catch (_) {}
let bmapEl = null, bmapShowBtn = null, bmapCtx = null, bmapTitle = null;
let bmapFloorCache = null;   // { key, floor, img, S, ox, oy }：整層樓的房間先畫好一張圖，每次更新只要貼上去
let bmapPeople = [], bmapPeopleAt = 0;   // 同層的人：每秒重算一次就夠

const BMAP_ICON_FULL = MINIMAP_ICON_FULL, BMAP_ICON_HIDE = MINIMAP_ICON_HIDE, BMAP_ICON_MAP = MINIMAP_ICON_MAP;   // 圖示跟戰鬥小地圖共用（js/tpad-map.js）

function bmapBuild() {
  const css = document.createElement('style');
  css.textContent =
    '#baseMinimap{position:absolute;right:' + BMAP.right + 'px;bottom:' + BMAP.bottom + 'px;z-index:9;width:' + BMAP.w + 'px;border-radius:10px;overflow:hidden;' +
      'background:rgba(0,4,10,.62);box-shadow:0 0 0 1px rgba(143,211,255,.22),0 4px 14px rgba(0,0,0,.45);font-family:"Microsoft JhengHei",sans-serif;user-select:none}' +
    '#baseMinimap .bmap-head{touch-action:none;display:flex;align-items:center;gap:4px;height:' + BMAP.head + 'px;padding:0 3px 0 8px;background:rgba(143,211,255,.08);border-bottom:1px solid rgba(143,211,255,.14)}' +
    '#baseMinimap .bmap-title{flex:1;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;color:#dbe8f3;font-size:12px;font-weight:700;letter-spacing:.02em}' +
    '#baseMinimap .bmap-title b{color:#7fd7ff;margin-right:5px}' +
    '#baseMinimap button,#baseMinimapShow{display:grid;place-items:center;padding:0;border:0;border-radius:6px;cursor:pointer;color:#cfe2f0;background:rgba(255,255,255,.06);transition:background .12s,color .12s}' +
    '#baseMinimap button{width:20px;height:18px}' +
    '#baseMinimap button:hover,#baseMinimapShow:hover{background:rgba(127,215,255,.28);color:#fff}' +
    '#baseMinimap button svg{width:13px;height:13px}' +
    // 蓋掉 css/style.css 全域 canvas 的深色底、圓角、寬度 100%
    '#baseMinimap canvas{display:block;width:' + BMAP.w + 'px;height:' + BMAP.h + 'px;background:none;border-radius:0;box-shadow:none;cursor:pointer}' +
    '#baseMinimapShow{position:absolute;right:' + BMAP.right + 'px;bottom:' + BMAP.bottom + 'px;z-index:9;width:34px;height:34px;border-radius:10px;' +
      'background:rgba(0,4,10,.62);box-shadow:0 0 0 1px rgba(143,211,255,.22),0 4px 14px rgba(0,0,0,.45)}' +
    '#baseMinimapShow svg{width:19px;height:19px}';
  document.head.appendChild(css);
  const wrap = document.getElementById('wrap') || document.body;
  bmapEl = document.createElement('div'); bmapEl.id = 'baseMinimap'; bmapEl.style.display = 'none';
  bmapEl.innerHTML = '<div class="bmap-head"><span class="bmap-title"></span>' +
    '<button type="button" data-bmap="full" title="打開完整地圖（T-Pad 地圖）">' + BMAP_ICON_FULL + '</button>' +
    '<button type="button" data-bmap="hide" title="收起小地圖">' + BMAP_ICON_HIDE + '</button></div>';
  const cv = document.createElement('canvas'); cv.width = BMAP.w * BMAP.scale; cv.height = BMAP.h * BMAP.scale; cv.title = '點一下打開完整地圖';
  bmapEl.append(cv);
  bmapCtx = cv.getContext('2d'); bmapTitle = bmapEl.querySelector('.bmap-title');
  bmapShowBtn = document.createElement('button'); bmapShowBtn.type = 'button'; bmapShowBtn.id = 'baseMinimapShow';
  bmapShowBtn.title = '顯示小地圖'; bmapShowBtn.innerHTML = BMAP_ICON_MAP; bmapShowBtn.style.display = 'none';
  wrap.append(bmapEl, bmapShowBtn);
  bmapEl.addEventListener('click', e => {
    const b = e.target.closest('[data-bmap]');
    if (b && b.dataset.bmap === 'hide') bmapSetHidden(true);
    else if (b || e.target === cv) bmapOpenFull();
  });
  bmapShowBtn.addEventListener('click', () => bmapSetHidden(false));
  // 點小地圖不要讓按鈕留著焦點（不然之後按空白鍵會再按一次）
  [bmapEl, bmapShowBtn].forEach(el => el.addEventListener('mouseup', () => { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); }));
  minimapDraggable(bmapEl, bmapEl.querySelector('.bmap-head'), 'base', BMAP);
}
function bmapSetHidden(v) {
  bmapHidden = v;
  try { localStorage.setItem(BMAP_HIDE_KEY, v ? '1' : '0'); } catch (_) {}
  if (typeof sfx === 'function') sfx(v ? 'switch' : 'blip');
  bmapUpdate();
}
// 打開 T-Pad 並直接進「地圖」App
function bmapOpenFull() { minimapOpenFull(); }

// 現在要不要顯示：在基地（有樓層的安全區地圖）、遊戲開始了、開始畫面沒蓋著
function bmapActive() {
  if (typeof MAP_FIELD !== 'undefined' && MAP_FIELD) return false;
  const here = typeof tmapHereMap === 'function' ? tmapHereMap() : null;
  if (!here || typeof G === 'undefined' || !G || !G.player || G.over) return false;
  const ov = document.getElementById('overlay');
  if (ov && ov.style.display !== 'none' && !ov.classList.contains('hidden') && getComputedStyle(ov).display !== 'none') return false;
  return tmapMaps().some(m => m.id === here.id);
}

// 整層樓的房間畫成一張圖（換樓層、房間地圖變了才重畫）
function bmapFloorImage(floor) {
  const key = floor.label + '|' + floor.rooms.map(r => r.map.id + ':' + r.x + ',' + r.y + ':' + r.map.cols + 'x' + r.map.rows).join(';');
  if (bmapFloorCache && bmapFloorCache.key === key) return bmapFloorCache;
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  floor.rooms.forEach(r => { x0 = Math.min(x0, r.x); y0 = Math.min(y0, r.y); x1 = Math.max(x1, r.x + r.w); y1 = Math.max(y1, r.y + r.h); });
  const W = BMAP.w * BMAP.scale, H = BMAP.h * BMAP.scale, P = BMAP.pad * BMAP.scale;
  const S = Math.min((W - P * 2) / (x1 - x0), (H - P * 2) / (y1 - y0));   // 一格幾 px（整層剛好放進框裡）
  const ox = (W - (x1 - x0) * S) / 2 - x0 * S, oy = (H - (y1 - y0) * S) / 2 - y0 * S;
  const img = document.createElement('canvas'); img.width = W; img.height = H;
  const g = img.getContext('2d');
  for (const r of floor.rooms) {
    const m = r.map, solid = new Set(m.solid || []), cs = r.k * S;
    g.fillStyle = 'rgba(143,211,255,.06)'; g.fillRect(ox + r.x * S, oy + r.y * S, r.w * S, r.h * S);   // 房間底色
    const open = new Path2D(), wall = new Path2D();
    for (const k of tmapFloorCells(m)) {
      const [c, rr] = k.split(',').map(Number);
      if (!(c >= 0 && rr >= 0 && c < m.cols && rr < m.rows)) continue;
      (solid.has(k) ? wall : open).rect(ox + (r.x + c * r.k) * S, oy + (r.y + rr * r.k) * S, cs + .6, cs + .6);   // 多 .6 px：格子之間不會有細縫
    }
    g.fillStyle = '#262d37'; g.fill(wall);
    g.fillStyle = '#4c5869'; g.fill(open);   // 跟 T-Pad 地圖、導航小地圖的地面同色
  }
  // 樓梯（通往別的樓層的出入口）
  const byId = new Map(tmapMaps().map(m => [m.id, m])), stairs = [];
  floor.rooms.forEach(r => tmapPortals(r, floor, byId).forEach(p => { if (p.stair) stairs.push(p); }));
  bmapFloorCache = { key, floor, img, S, ox, oy, stairs };
  return bmapFloorCache;
}

function bmapUpdate() {
  const on = bmapActive();
  if (!on && !bmapEl) return;
  if (!bmapEl) bmapBuild();
  bmapEl.style.display = on && !bmapHidden ? '' : 'none';
  bmapShowBtn.style.display = on && bmapHidden ? '' : 'none';
  if (!on || bmapHidden) return;
  minimapPlace(bmapEl, 'base', BMAP);   // 玩家拖過的位置（超出畫面會推回來）
  const here = tmapHereMap(), floor = tmapFloors().find(f => f.rooms.some(r => r.map.id === here.id));
  if (!floor) return;
  const room = floor.rooms.find(r => r.map.id === here.id), info = tmapParseFloor(here.name);
  const title = '<b>' + tmapEsc(floor.label) + '</b>' + tmapEsc(info ? info.rest : here.name);
  if (bmapTitle.innerHTML !== title) bmapTitle.innerHTML = title;
  const fc = bmapFloorImage(floor), ctx = bmapCtx, K = BMAP.scale, S = fc.S;
  const at = (rm, c, r) => [fc.ox + (rm.x + c * rm.k) * S, fc.oy + (rm.y + r * rm.k) * S];   // 某房間裡的格 → 畫布 px
  ctx.clearRect(0, 0, BMAP.w * K, BMAP.h * K);
  ctx.drawImage(fc.img, 0, 0);
  // 自己在的房間：亮框
  ctx.lineWidth = 1.5 * K; ctx.strokeStyle = 'rgba(127,215,255,.85)';
  ctx.strokeRect(fc.ox + room.x * S, fc.oy + room.y * S, room.w * S, room.h * S);
  // 樓梯
  ctx.fillStyle = '#ffd166';
  for (const p of fc.stairs) { const x = fc.ox + p.x * S, y = fc.oy + p.y * S; ctx.fillRect(x - 2.5 * K, y - 2.5 * K, 5 * K, 5 * K); }
  // 同層的人
  if (Date.now() - bmapPeopleAt > 1000 || !bmapPeople.floor || bmapPeople.floor !== floor.label) {
    bmapPeople = tmapPeople().inBase.filter(p => floor.rooms.some(r => r.map.name === p.mapName)); bmapPeople.floor = floor.label; bmapPeopleAt = Date.now();
  }
  for (const p of bmapPeople) {
    const rm = floor.rooms.find(r => r.map.name === p.mapName); if (!rm) continue;
    let c = p.c, r = p.r;
    if (rm === room && typeof G !== 'undefined') {   // 同一個房間：用即時位置（不然看起來會一格一格跳）
      const live = [...(G.towers || []), ...(G.npcs || [])].find(o => (o.type || o.id) === p.id);
      if (live) [c, r] = tmapCellOf(live);
    }
    const [x, y] = c != null ? at(rm, c, r) : [fc.ox + (rm.x + rm.w / 2) * S, fc.oy + (rm.y + rm.h / 2) * S];
    ctx.beginPath(); ctx.arc(x, y, 2.6 * K, 0, Math.PI * 2);
    ctx.fillStyle = TMAP_KIND_COLOR[p.kind] || TMAP_KIND_COLOR.support; ctx.fill();
    ctx.lineWidth = 1 * K; ctx.strokeStyle = '#16191e'; ctx.stroke();
  }
  // 自己（溫特）：外圈慢慢一閃一閃
  const [pc, pr] = tmapCellOf(G.player), [x, y] = at(room, pc, pr), t = (Date.now() % 1400) / 1400;
  ctx.beginPath(); ctx.arc(x, y, (4 + t * 6) * K, 0, Math.PI * 2); ctx.fillStyle = 'rgba(74,163,255,' + (.45 * (1 - t)).toFixed(3) + ')'; ctx.fill();
  ctx.beginPath(); ctx.arc(x, y, 3.8 * K, 0, Math.PI * 2);
  ctx.fillStyle = '#4aa3ff'; ctx.fill(); ctx.lineWidth = 1.5 * K; ctx.strokeStyle = '#fff'; ctx.stroke();
}
setInterval(bmapUpdate, 100);
