// ============================================================
//  捷運的鎖：閘門要刷好遊卡、封鎖的捷運入口要用異質鑰匙解封
//  ・MRT_LOCKS：哪個素材、要什麼道具（item）、用了會不會消耗（consume）、擋路的是哪一排、打開後哪幾格能走。
//  ・閘門（gate）：關著時最下面一排擋路；刷卡後中間那格（門板）打開、紅色門板不畫（這次出勤一直開著）。刷一次用掉一張好遊卡。
//  ・入口（exit）：封鎖時最下面一排擋路；用掉一把異質鑰匙解封，圖換成沒封鎖的出口（解封是永久的，存在 MRT_STORE）。
//    入口裡面如果有出入口（通往捷運地圖），封鎖時不會作用。
// ============================================================
const MRT_LOCKS = {
  tile_mrt_ticket_gate: { kind: 'gate', item: 'youyou-card', consume: true, unit: '張', open: [1], hole: [26 / 120, 0, 68 / 120, 1],   // 門翼完整範圍：原圖 x=26～94，涵蓋整張高度，避免殘留紅邊。
    locked: '閘門關著（需要好遊卡）', use: '刷好遊卡', done: '嗶！閘門打開了', sound: 'mrtGate' },   // sound：音效編輯器裡的名稱
  tile_mrt_exit_2_sealed: { kind: 'exit', item: 'anomaly-key', consume: true, openTile: 'tile_mrt_exit_2',
    locked: '入口被封鎖了（需要異質鑰匙）', use: '用異質鑰匙解開封鎖', done: '封鎖解開了，可以進去了', sound: 'mrtUnlock' },
};
const MRT_GATE_OPEN_SECONDS = .5;
const MRT_STORE = 'tudrc_mrt_unlocked_v1';   // 永久解封的入口（地圖 id → [位置…]）
const MRT_YOUYOU_CHANCE = .3;               // 打開置物櫃找到好遊卡的機率
let mrtUnlocked = {};
try { const d = JSON.parse(localStorage.getItem(MRT_STORE) || '{}'); if (d && typeof d === 'object') mrtUnlocked = d; } catch (_) {}
const mrtToken = s => [s.id, s.c, s.r].join('|');
function mrtSaveUnlocked() { try { localStorage.setItem(MRT_STORE, JSON.stringify(mrtUnlocked)); } catch (_) {} }

// 換地圖、重新開始時：哪些格子要擋（js/game.js 在 setupDoors 之後呼叫）
let mrtAddedWalls = new Set();   // 這裡加進固定牆的格子（G 會整個換掉，所以另外記：重開時先全部還原）
function setupMrtLocks() {
  for (const k of mrtAddedWalls) mapWalls.delete(k);
  mrtAddedWalls = new Set();
  G.mrtLocks = [];
  if (!MAP) return;
  const perm = mrtUnlocked[MAP.id] || [];
  for (const s of MAP.stamps || []) {
    const cfg = MRT_LOCKS[s.id]; if (!cfg) continue;
    const t = mapTileById(s.id); if (!t) continue;
    const w = mapTileW(t), h = mapTileH(t), row = s.r + h - 1;
    const x0 = OX + s.c * CELL + (s.ox || 0), y0 = OY + s.r * CELL + (s.oy || 0);
    const lock = { stamp: s, cfg, open: cfg.kind === 'exit' && perm.includes(mrtToken(s)), cells: [], added: [],
      x: x0 + w * CELL / 2, top: y0, bottom: y0 + h * CELL, c0: s.c, c1: s.c + w - 1, r0: s.r, r1: row };
    for (let dc = 0; dc < w; dc++) lock.cells.push({ key: (s.c + dc) + ',' + row, dc });
    G.mrtLocks.push(lock);
    applyMrtLock(lock);
  }
}
// 依開關狀態加／拿掉擋路格（只管原本不是牆的格子）
function applyMrtLock(lock) {
  for (const k of lock.added) { mapWalls.delete(k); mrtAddedWalls.delete(k); }
  lock.added = [];
  for (const { key, dc } of lock.cells) {
    const passable = lock.open && !lock.opening && (lock.cfg.kind === 'exit' || (lock.cfg.open || []).includes(dc));
    if (!passable && !mapWalls.has(key)) { mapWalls.add(key); lock.added.push(key); mrtAddedWalls.add(key); }
  }
  if (typeof computeFlow === 'function') computeFlow();
}
const mrtLockOf = s => (G && G.mrtLocks || []).find(l => l.stamp === s) || null;
// 畫圖：解封的入口換圖（js/maploader.js 的 drawMapStampImg）
function mrtDisplayTile(s, t) {
  const cfg = MRT_LOCKS[s.id]; if (!cfg || !cfg.openTile) return t;
  const lock = mrtLockOf(s);
  return lock && lock.open ? (mapTileById(cfg.openTile) || t) : t;
}
// 畫圖：打開的閘門不畫門板（回傳要挖掉的範圍，圖片比例）
function mrtStampHole(s) {
  const cfg = MRT_LOCKS[s.id]; if (!cfg || !cfg.hole) return null;
  const lock = mrtLockOf(s);
  return lock && lock.open ? cfg.hole : null;
}
// 封鎖中的入口裡面的出入口不作用（js/game.js 的 portalNearPlayer）
function mrtPortalBlocked(pt) {
  return (G && G.mrtLocks || []).some(l => !l.open && l.cfg.kind === 'exit' && pt.c >= l.c0 && pt.c <= l.c1 && pt.r >= l.r0 && pt.r <= l.r1);
}

// ---- 互動 ----
function mrtLockNearPlayer() {
  const p = G && G.player; if (!p || p.sitting || p.hp <= 0) return null;
  let best = null, bd = CELL * 1.6;
  for (const l of G.mrtLocks || []) {
    if (l.open) continue;
    if (p.y < l.bottom - 12) continue;   // 從前面（下方）靠近
    const d = Math.hypot(l.x - p.x, l.bottom - p.y);
    if (d < bd) { bd = d; best = l; }
  }
  return best;
}
function mrtLockPrompt(l) { return (supplyInventory.get(l.cfg.item) || 0) > 0 ? l.cfg.use : l.cfg.locked; }
function useMrtLockNearPlayer() {
  const l = mrtLockNearPlayer(); if (!l) return false;
  const n = supplyInventory.get(l.cfg.item) || 0;
  if (n <= 0) { sfx('error'); flash(l.cfg.locked, l.x, l.top - 6, '#ffcf89', 1.8); return true; }
  if (l.cfg.consume) { if (n <= 1) supplyInventory.delete(l.cfg.item); else supplyInventory.set(l.cfg.item, n - 1); }
  l.open = true;
  if(l.cfg.kind==='gate'){l.opening=true;l.openProgress=0;}
  applyMrtLock(l);
  if (l.cfg.kind === 'exit') {   // 入口解封：永久記住
    (mrtUnlocked[MAP.id] = mrtUnlocked[MAP.id] || []).push(mrtToken(l.stamp)); mrtSaveUnlocked();
    G.effects.push({ ring: true, x: l.x, y: l.bottom - CELL, r: 10, r2: 110, life: .6, life0: .6, color: '#b56bff' });
  }
  if (typeof sfxAt === 'function') sfxAt(l.cfg.sound, l.x, l.bottom, .7, 'mrt-lock');
  flash(l.cfg.done, l.x, l.top - 6, '#9ff0c0', 2);
  if (l.cfg.consume) systemNotice('消耗 1 ' + (l.cfg.unit || '支') + itemById(l.cfg.item).name);
  for (const a of [...G.towers, ...G.npcs]) { a.navPath = null; a.navGoal = null; a.navFailed = false; }
  if (typeof updateHUD === 'function') updateHUD();
  if (typeof saveGame === 'function') saveGame();
  return true;
}
// 置物櫃（沒指定內容的）：有機會找到好遊卡（js/storage-lockers.js 呼叫）
function tryYouyouCardFind() {
  if (Math.random() >= MRT_YOUYOU_CHANCE) return;
  if (!supplyGain('youyou-card', 1)) return;
  if (typeof showItemPickupNotice === 'function') showItemPickupNotice('youyou-card', 1);
}

// 門翼向兩側收回，完成後才開放通行。
function updateMrtGateAnimations(dt){
  for(const lock of G?.mrtLocks||[]){
    if(!lock.opening)continue;
    lock.openProgress=Math.min(1,(lock.openProgress||0)+dt/MRT_GATE_OPEN_SECONDS);
    if(lock.openProgress>=1){
      lock.opening=false;applyMrtLock(lock);
      for(const actor of [...G.towers,...G.npcs]){actor.navPath=null;actor.navGoal=null;actor.navFailed=false;}
      for(const enemy of G.enemies)if(typeof resetEnemyNavigation==='function')resetEnemyNavigation(enemy);
    }
  }
}
const MRT_GATE_ART = {
  frame: {id:'__mrt-gate-frame',file:'images/捷運車站/mrt-ticket-gate01.png'},
  wings: {id:'__mrt-gate-wings',file:'images/捷運車站/mrt-ticket-gate02.png'},
};
function drawMrtGateAnimation(ctx,stamp,img,x,y,w,h){
  const cfg=MRT_LOCKS[stamp.id];if(cfg?.kind!=='gate')return false;
  const frame=tileImage(MRT_GATE_ART.frame),wings=tileImage(MRT_GATE_ART.wings);
  if(!frame||!wings){ctx.drawImage(img,x,y,w,h);return true;}
  const lock=mrtLockOf(stamp),raw=lock?.open?(lock.openProgress??1):0;
  const progress=raw*raw*(3-2*raw);
  ctx.save();ctx.imageSmoothingEnabled=false;
  ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();
  if(progress<1){
    // 門翼圖的中央是透明間隙，左右各半獨立平移，機台最後覆蓋在前。
    const sw=wings.naturalWidth,sh=wings.naturalHeight,travel=w*.3*progress;
    ctx.drawImage(wings,0,0,sw/2,sh,x-travel,y,w/2,h);
    ctx.drawImage(wings,sw/2,0,sw/2,sh,x+w/2+travel,y,w/2,h);
  }
  ctx.drawImage(frame,x,y,w,h);ctx.restore();return true;
}
