/* ===== 記憶之門（地圖編輯器的門種類「記憶之門」，data/doors.js 的 memory）=====
   - 每扇門在編輯器選取後設定：memoryKey＝用哪把回憶鑰匙（data/items.js 的 MEMORY_KEYS）、memoryScene＝播哪段劇情（data/story-scenes.js）。
   - 鎖著：疊在門上的鎖鏈圖（素材名稱、檔名或 id 有 chain／鎖鏈）就是鎖；沒有疊圖就用程式畫的鎖鏈（js/doors.js）。
   - 帶著鑰匙按 Space：鎖鏈碎成一塊一塊掉下來消失、門打開。鑰匙是重要物品，不會用掉。
     解開過的門記在 tudrc_memory_doors_v1（開新遊戲會重設，js/new-game.js）。
   - 打開後按 Space：問要不要進入回憶；進入就在遊戲裡直接播劇情（js/story-scene.js），看完回到門前。
*/
const MEMORY_DOOR_STORE = 'tudrc_memory_doors_v1';
const MEMORY_CHOICE_DELAY = 1100;   // 鎖鏈碎完、門打開之後過多久才問要不要進入（毫秒）
const memoryDoorKey = d => MAP.id + '@' + d.stamp.c + ',' + d.stamp.r;
function memoryDoorsOpened() {
  try { return new Set(JSON.parse(localStorage.getItem(MEMORY_DOOR_STORE) || '[]')); } catch (_) { return new Set(); }
}
function rememberMemoryDoor(d) {
  const set = memoryDoorsOpened(); set.add(memoryDoorKey(d));
  try { localStorage.setItem(MEMORY_DOOR_STORE, JSON.stringify([...set])); } catch (_) {}
}
const memoryScene = d => (typeof STORY_SCENES !== 'undefined' && d.memoryScene && STORY_SCENES[d.memoryScene]) || null;
const isChainArt = t => !!t && /chain|鎖鏈/i.test([String(t.file || '').startsWith('data:') ? '' : t.file, t.name, t.id].join(' '));

// ---- 開局時（js/doors.js 的 setupDoors）：讀設定、找疊在門上的鎖鏈圖、解開過就直接開著 ----
function setupMemoryDoor(d) {
  d.memoryKey = d.stamp.memoryKey || null; d.memoryScene = d.stamp.memoryScene || null;
  d.unlocked = memoryDoorsOpened().has(memoryDoorKey(d));
  if (d.unlocked) { d.open = true; hideChainArt(d); }
}
// 跟門板左右、上下都有重疊的鎖鏈圖章（每種門都會找：門打開時鎖鏈圖一起藏起來，js/doors.js 的 setDoorOpen）
function findChainArt(d) {
  return (MAP.stamps || []).filter(s => {
    if (s === d.stamp) return false;
    const t = mapTileById(s.id); if (!isChainArt(t)) return false;
    const x0 = OX + s.c * CELL + (s.ox || 0), y0 = OY + s.r * CELL + (s.oy || 0);
    return x0 < d.right && x0 + mapStampW(s, t) * CELL > d.left && y0 < d.y && y0 + mapStampH(s, t) * CELL > d.y0;
  });
}
function hideChainArt(d) { if (G && G.mapDestroyed) for (const s of d.chainArt || []) G.mapDestroyed.add(s); }
function showChainArt(d) { if (G && G.mapDestroyed) for (const s of d.chainArt || []) G.mapDestroyed.delete(s); }

// ---- 按 Space（js/doors.js 的 toggleDoorNearPlayer）----
function memoryDoorInteract(d) {
  if (d.unlocked) { openMemoryChoice(d); return; }
  const key = d.memoryKey && itemById(d.memoryKey);
  const say = text => { sfx('error'); flash(text, d.x, d.top, '#c9b5ff', 1.6); };
  if (!key) { say('被鎖鏈鎖住了，打不開'); return; }
  if (!((supplyInventory.get(key.id) || 0) > 0)) { say('被鎖鏈鎖住了，需要' + key.name); return; }
  d.unlocked = true; rememberMemoryDoor(d);
  shatterDoorChains(d);
  setDoorOpen(d, true, true);
  if (typeof sfxAt === 'function') { sfxAt('chainUnlock', d.x, d.y, .6, 'door-unlock'); sfxAt(d.sound, d.x, d.y, .6, 'door'); }
  systemNotice('用' + key.name + '解開了記憶之門的鎖鏈');
  if (typeof saveGame === 'function') saveGame();
  setTimeout(() => { if (typeof doorNearPlayer === 'function' && doorNearPlayer() === d) openMemoryChoice(d); }, MEMORY_CHOICE_DELAY);
}

// ---- 鎖鏈碎掉：把鎖鏈圖切成小塊，往外彈、受重力掉到地上彈一下，再淡出 ----
function shatterDoorChains(d) {
  const arts = (d.chainArt || []).map(s => { const t = mapTileById(s.id);
    return { s, img: tileImage(t), x: OX + s.c * CELL + (s.ox || 0), y: OY + s.r * CELL + (s.oy || 0), w: mapStampW(s, t) * CELL, h: mapStampH(s, t) * CELL }; });
  let x0 = d.left, y0 = d.y0, x1 = d.right, y1 = d.y;
  for (const a of arts) { x0 = Math.min(x0, a.x); y0 = Math.min(y0, a.y); x1 = Math.max(x1, a.x + a.w); y1 = Math.max(y1, a.y + a.h); }
  const W = Math.ceil(x1 - x0), H = Math.ceil(y1 - y0), src = document.createElement('canvas');
  src.width = W; src.height = H;
  const g = src.getContext('2d'); g.imageSmoothingEnabled = false;
  if (arts.length) for (const a of arts) {
    if (!(a.img && a.img.complete && a.img.naturalWidth)) continue;
    g.save(); g.translate(a.x - x0 + a.w / 2, a.y - y0 + a.h / 2); g.scale(a.s.fx ? -1 : 1, a.s.fy ? -1 : 1);
    g.drawImage(a.img, -a.w / 2, -a.h / 2, a.w, a.h); g.restore();
  } else {   // 沒有鎖鏈圖：碎掉的是程式畫的鎖鏈和大鎖
    const h = d.y - d.y0; g.translate(-x0, -y0);
    drawChainX(g, d.left + 2, d.y0 + h * .2, d.right - 2, d.y - 6, 0); drawPadlock(g, d.x, d.y0 + h * .55, 1.25, '#b58cff', 0);
  }
  hideChainArt(d);
  let alpha = null; try { alpha = g.getImageData(0, 0, W, H).data; } catch (_) {}   // file:// 開啟時讀不到像素：每一塊都留
  const P = 7, rnd = (a, b) => a + Math.random() * (b - a), cy = (d.y0 + d.y) / 2, list = G.memoryShards || (G.memoryShards = []);
  for (let py = 0; py < H; py += P) for (let px = 0; px < W; px += P) {
    if (alpha) {   // 只留有畫到東西的小塊
      let hit = 0;
      for (let yy = py; yy < Math.min(H, py + P); yy += 2) for (let xx = px; xx < Math.min(W, px + P); xx += 2) if (alpha[(yy * W + xx) * 4 + 3] > 40) hit++;
      if (hit < 2) continue;
    }
    const x = x0 + px + P / 2, y = y0 + py + P / 2, away = Math.sign(x - d.x) || (Math.random() < .5 ? -1 : 1);
    list.push({ src, sx: px, sy: py, x, y, vx: away * rnd(20, 110) + (x - d.x) * 1.5, vy: rnd(-170, -40) + (y - cy) * .8,
      rot: 0, vr: rnd(-9, 9), t: 0, life: rnd(1, 1.6), floor: d.y + rnd(-2, 10) });
  }
  // 碎掉的瞬間：紫色閃光、衝擊環、小火花、鏡頭輕震
  if (typeof addLightFlash === 'function') addLightFlash('lightning', d.x, cy, .9);
  G.effects.push({ ring: true, x: d.x, y: cy, r: 6, r2: 52, life: .35, life0: .35, color: '#d6c2ff' });
  for (let i = 0; i < 14; i++) {
    const a = Math.random() * Math.PI * 2, sp = rnd(70, 170);
    G.effects.push({ particle: true, kind: 'spark', x: d.x, y: cy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: rnd(1.6, 2.8), life: rnd(.25, .45), life0: .45, color: '#e5d8ff' });
  }
  if (typeof addShake === 'function') addShake(3);
}
function updateMemoryShards(dt) {
  if (!G.memoryShards || !G.memoryShards.length) return;
  for (const p of G.memoryShards) {
    p.t += dt; p.vy += 900 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
    if (p.y > p.floor && p.vy > 0) { p.y = p.floor; p.vy *= -.3; p.vx *= .55; p.vr *= .5; }   // 掉到地上彈一下
  }
  G.memoryShards = G.memoryShards.filter(p => p.t < p.life);
}
function drawMemoryShards(ctx) {
  for (const p of G.memoryShards || []) {
    const k = p.t / p.life, P = 7;
    ctx.save(); ctx.globalAlpha = k < .55 ? 1 : 1 - (k - .55) / .45; ctx.imageSmoothingEnabled = false;
    ctx.translate(p.x, p.y); ctx.rotate(p.rot);
    ctx.drawImage(p.src, p.sx, p.sy, P, P, -P / 2, -P / 2, P, P);
    ctx.restore();
  }
}

// ---- 要不要進入回憶：跟遊戲對話框同風格的小視窗 ----
let memoryChoice = null;
const canAskMemory = () => !window.STORY_MODE && G && G.running && !G.over && !(typeof paused !== 'undefined' && paused) && G.player && G.player.hp > 0;
function openMemoryChoice(d) {
  if (!canAskMemory()) return;   // 倒下、結算、暫停中、已經在回憶裡：不問
  const scene = memoryScene(d);
  if (!scene) { flash('門後還什麼都沒有……', d.x, d.top, '#c9b5ff', 1.6); return; }   // 劇情還沒做好
  closeMemoryChoice(true);
  MOVE_KEYS.forEach(k => { keys[k] = false; });
  const box = document.createElement('section');
  box.id = 'memoryChoice'; box.setAttribute('role', 'alertdialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-labelledby', 'memoryChoiceTitle');
  box.innerHTML = '<small>記憶之門</small><h2 id="memoryChoiceTitle"></h2><p class="sub"></p><p>要進入這段回憶嗎？</p>' +
    '<div><button type="button" data-memory="cancel">取消</button><button type="button" data-memory="enter" class="go">進入</button></div>';
  box.querySelector('h2').textContent = scene.title || d.memoryScene;
  box.querySelector('.sub').textContent = scene.subtitle || '';
  document.getElementById('wrap').appendChild(box);
  memoryChoice = { box, door: d };
  box.querySelector('[data-memory="enter"]').focus();
  sfx('menu');
}
function closeMemoryChoice(silent = false) {
  if (!memoryChoice) return;
  memoryChoice.box.remove(); memoryChoice = null;
  if (!silent) sfx('switch');
}
function enterMemory() {
  const d = memoryChoice && memoryChoice.door; if (!d) return;
  closeMemoryChoice(true);
  if (typeof saveGame === 'function') saveGame();   // 劇情播放中不存檔：進去前先存
  if (!StoryScene.playFromGame(d.memoryScene, () => systemNotice('……回到了現實'))) flash('這段回憶打不開', d.x, d.top, '#ff8f8f', 1.6);
}
function memoryChoiceAction(name) { if (name === 'enter') enterMemory(); else closeMemoryChoice(); }
// 視窗開著時：擋住遊戲的按鍵和滑鼠，只處理視窗自己的按鈕
window.addEventListener('keydown', e => {
  if (!memoryChoice) return;
  e.preventDefault(); e.stopImmediatePropagation();
  if (e.repeat) return;
  const buttons = [...memoryChoice.box.querySelectorAll('button')], i = buttons.indexOf(document.activeElement);
  if (e.key === 'Escape') closeMemoryChoice();
  else if (['ArrowLeft', 'ArrowRight', 'Tab', 'a', 'd', 'A', 'D'].includes(e.key)) buttons[(i + 1 + buttons.length) % buttons.length].focus();
  else if (e.key === ' ' || e.key === 'Enter') memoryChoiceAction(document.activeElement?.dataset.memory || 'enter');
}, true);
window.addEventListener('keyup', e => { if (memoryChoice) { e.preventDefault(); e.stopImmediatePropagation(); } }, true);
for (const type of ['pointerdown', 'mousedown', 'mouseup', 'contextmenu', 'wheel']) {
  window.addEventListener(type, e => { if (memoryChoice && !memoryChoice.box.contains(e.target)) { e.preventDefault(); e.stopImmediatePropagation(); } }, { capture: true, passive: false });
}
window.addEventListener('click', e => {
  if (!memoryChoice) return;
  const b = e.target.closest('[data-memory]');
  if (b && memoryChoice.box.contains(b)) { e.preventDefault(); e.stopImmediatePropagation(); memoryChoiceAction(b.dataset.memory); }
  else if (!memoryChoice.box.contains(e.target)) { e.preventDefault(); e.stopImmediatePropagation(); }
}, true);
