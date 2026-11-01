// ============================================================
//  烹飪：餐廳的廚房工作台（Kitchen Workstation）左邊的爐灶可以煮生食
//  ・站在爐灶前按互動鍵：背包裡的生食（data/supplies.js 有 cookTo 的：虱目魚肚、生魚片、香蕉…）放一份到空的爐口
//  ・COOKING.time 秒後煮好，熟食直接放進背包（背包放不下就放在爐灶前的地上）；三個爐口可以同時煮
//  ・畫面：爐火、食物在鍋上抖動、油花、蒸氣、上面的進度圈；煮好彈一下＋「🍳 烤虱目魚肚」
//  ・靠近判定跟裝備箱一樣（js/camp-interactions.js 的 MAP_BOX，kind 'stove'，範圍＝爐灶那一段）
// ============================================================
const COOKING = {
  tiles: ['tile_restaurant_kitchen_workstation'],
  time: 1.5,   // 煮幾秒
  burners: [[33, 67], [60, 67], [88, 67]],   // 爐口在圖片上的位置（圖片像素，圖 280×120）
  img: [280, 120],
};
const cookingPots = [];   // 正在煮的：{ stamp, k（第幾個爐口）, id（生食）, to（熟食）, t, x, y }
let cookSteam = [];       // 蒸氣、油花的小顆粒
const cookImgs = {};
function cookImg(item) {
  const src = item && item.image; if (!src) return null;
  if (!cookImgs[src]) { cookImgs[src] = new Image(); cookImgs[src].src = src; }
  return cookImgs[src];
}
const stoveNearPlayer = () => typeof mapBoxNearPlayer === 'function' ? mapBoxNearPlayer('stove') : null;
const rawFoods = () => allItems().filter(it => it.cookTo && itemById(it.cookTo) && (supplyInventory.get(it.id) || 0) > 0);
// 爐口在地圖上的位置（左右翻轉的工作台也跟著翻）
function burnerPos(s, k) {
  const t = mapTileById(s.id), w = mapStampW(s, t) * CELL, h = mapStampH(s, t) * CELL, [bx, by] = COOKING.burners[k];
  const u = bx / COOKING.img[0] * w;
  return { x: OX + s.c * CELL + (s.ox || 0) + (s.fx ? w - u : u), y: OY + s.r * CELL + (s.oy || 0) + by / COOKING.img[1] * h };
}
function useStoveNearPlayer() {
  const b = stoveNearPlayer(); if (!b) return false;
  const raw = rawFoods()[0];
  if (!raw) { sfx('error'); systemNotice('身上沒有可以煮的生食（虱目魚肚、生魚片…）', true); return true; }
  const busy = new Set(cookingPots.filter(p => p.stamp === b.stamp).map(p => p.k));
  const k = COOKING.burners.findIndex((_, i) => !busy.has(i));
  if (k < 0) { sfx('error'); systemNotice('三個爐口都在煮了，等一下', true); return true; }
  consumeItem(raw.id);
  const pos = burnerPos(b.stamp, k);
  cookingPots.push({ stamp: b.stamp, k, id: raw.id, to: raw.cookTo, t: 0, x: pos.x, y: pos.y });
  if (typeof sfxAt === 'function') sfxAt('fireImpact', pos.x, pos.y, .25, 'cook-start');
  if (typeof updateHUD === 'function') updateHUD();
  return true;
}
function finishCooking(p) {
  const to = itemById(p.to); if (!to) return;
  if (supplyGain(to.id, 1, true) < 1) {   // 背包滿了：放在爐灶前的地上（走過去可以撿）
    G.groundItems = G.groundItems || [];
    G.groundItems.push({ id: to.id, qty: 1, x: p.x, y: p.y + 40, at: performance.now() / 1000 });
    systemNotice('背包滿了：' + to.name + ' 放在爐灶前');
  }
  flash('🍳 ' + to.name, p.x, p.y - 34, '#ffb35c');
  G.effects.push({ ring: true, x: p.x, y: p.y - 6, r: 4, r2: 24, life: .4, life0: .4, color: '#ffb35c' });
  if (typeof sfxAt === 'function') sfxAt('pop', p.x, p.y, .6, 'food-cooked');
  if (typeof updateHUD === 'function') updateHUD();
}
function updateCooking(dt) {
  for (let i = cookingPots.length - 1; i >= 0; i--) {
    const p = cookingPots[i];
    if (!MAP || !(MAP.stamps || []).includes(p.stamp)) { cookingPots.splice(i, 1); continue; }   // 換地圖了：鍋上的東西不見（生食已經放上去了）
    p.t += dt;
    if (Math.random() < dt * 14) cookSteam.push({ x: p.x + (Math.random() - .5) * 14, y: p.y - 8, vx: (Math.random() - .5) * 10, vy: -18 - Math.random() * 16, life: .8 + Math.random() * .5, age: 0, steam: Math.random() < .55 });
    if (p.t >= COOKING.time) { cookingPots.splice(i, 1); finishCooking(p); }
  }
  for (const s of cookSteam) { s.age += dt; s.x += s.vx * dt; s.y += s.vy * dt; if (!s.steam) s.vy += 60 * dt; }   // 油花：跳起來再掉下去
  cookSteam = cookSteam.filter(s => s.age < s.life);
}
function drawCooking(ctx) {
  if (!cookingPots.length && !cookSteam.length) return;
  const now = performance.now() / 1000;
  ctx.save();
  for (const p of cookingPots) {
    const flick = .75 + Math.sin(now * 24 + p.k * 2) * .15 + Math.random() * .1;
    // 爐火：底下一圈藍火＋橘色光暈
    const glow = ctx.createRadialGradient(p.x, p.y, 2, p.x, p.y, 22);
    glow.addColorStop(0, 'rgba(255,170,70,' + (.55 * flick) + ')'); glow.addColorStop(1, 'rgba(255,120,30,0)');
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(p.x, p.y, 22, 0, Math.PI * 2); ctx.fill();
    for (let j = 0; j < 8; j++) {
      const a = j / 8 * Math.PI * 2 + now * 3, fx = p.x + Math.cos(a) * 8, fy = p.y + Math.sin(a) * 3, fh = 4 + Math.random() * 3;
      ctx.fillStyle = j % 2 ? 'rgba(90,170,255,.85)' : 'rgba(255,190,90,.85)';
      ctx.beginPath(); ctx.moveTo(fx - 1.6, fy); ctx.lineTo(fx, fy - fh); ctx.lineTo(fx + 1.6, fy); ctx.closePath(); ctx.fill();
    }
    // 食物：放在爐口上，越煮越焦黃、會抖
    const k = Math.min(1, p.t / COOKING.time), shake = Math.sin(now * 40 + p.k) * 1.2, img = cookImg(itemById(p.id));
    if (img && img.complete && img.naturalWidth) {
      const s = 22;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, p.x - s / 2 + shake, p.y - s + 4, s, s);
      ctx.fillStyle = 'rgba(150,80,20,' + (k * .35) + ')'; ctx.beginPath(); ctx.ellipse(p.x + shake, p.y - 6, 9, 5, 0, 0, Math.PI * 2); ctx.fill();   // 焦黃色
    }
    // 進度圈
    const cx = p.x, cy = p.y - 30;
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,.55)'; ctx.beginPath(); ctx.arc(cx, cy, 7, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = '#ffb35c'; ctx.beginPath(); ctx.arc(cx, cy, 7, -Math.PI / 2, -Math.PI / 2 + k * Math.PI * 2); ctx.stroke();
  }
  // 蒸氣（白色、往上飄、變大變淡）和油花（黃色小點、跳一下）
  for (const s of cookSteam) {
    const f = s.age / s.life;
    if (s.steam) { ctx.fillStyle = 'rgba(235,240,245,' + (.35 * (1 - f)) + ')'; ctx.beginPath(); ctx.arc(s.x, s.y, 2 + f * 6, 0, Math.PI * 2); ctx.fill(); }
    else { ctx.fillStyle = 'rgba(255,220,120,' + (1 - f) + ')'; ctx.fillRect(s.x - 1, s.y - 1, 2, 2); }
  }
  ctx.restore();
}
