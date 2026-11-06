/* ===== 森林的樹葉堆（地圖編輯器「🍂 樹葉堆」擺放）=====
   ・點陣圖：images/森林/leaf_pile_1.png，燒完是 leaf_pile_burnt.png（用 leaf_pile_1 壓扁一半、換成灰黑色做的）
   ・火燒得動：燃燒彈、油桶的火海碰到樹葉堆就會著火，燒 LEAF_PILE.burnTime 秒變成一堆灰燼
   ・燒完露出東西（機率在 LEAF_PILE）：
       小道具＝掉一個道具在地上（走過去撿）
       小史萊姆＝跳出 1～3 隻小史萊姆
       什麼都沒有
   ・燒完的灰燼停一下，就被風吹散、慢慢消失（灰黑色的灰一粒粒往上、往旁邊飄走）
   ・樹葉堆不擋路，只是裝飾＋寶箱
   必須在 js/render.js、js/attack-fx.js、js/oil-barrels.js 之後載入。
*/
const LEAF_PILE = {
  images: ['images/森林/leaf_pile_1.png'],   // 可以放好幾張，每堆隨機用一張
  burntImage: 'images/森林/leaf_pile_burnt.png',
  scale: 1,             // 點陣圖放大幾倍（1＝原尺寸；2＝圖上一點畫成 2×2）
  hitR: 40,             // 火海離樹葉堆多近算燒到（像素）
  burnTime: 2.5,        // 燒幾秒變成灰燼
  itemChance: .5,       // 燒完露出小道具的機率
  slimeChance: .35,     // 燒完跳出小史萊姆的機率（剩下的機率＝什麼都沒有）
  slimes: [1, 3],       // 跳出幾隻小史萊姆（最少、最多）
  // 露出的小道具：id＝data/supplies.js 的道具（'shard'＝異質碎片），數字＝抽到的比重
  items: { medkit: 3, 'almond-water': 3, firstaid: 2, banana: 2, toolbox: 1, adrenaline: 1, shard: 3 },
  shards: 2,            // 抽到異質碎片時掉幾顆
  ashHold: 1.5,         // 燒成灰燼後停幾秒，才開始被風吹散
  ashFade: 3,           // 灰燼花幾秒飄散、消失
  ashBits: 70,          // 飄散時總共飄出幾粒灰
};
const leafPileImgs = LEAF_PILE.images.map(src => { const i = new Image(); i.src = encodeURI(src); return i; });
const leafPileBurntImg = (() => { const i = new Image(); i.src = encodeURI(LEAF_PILE.burntImage); return i; })();
const leafImgOk = i => i.complete && i.naturalWidth > 0;

// ---- 開場：照地圖上的 MAP.leafPiles ['欄,列'…] 擺 ----
function seedLeafPiles() {
  G.leafPiles = [];
  if (MAP_SAFE || !MAP || !Array.isArray(MAP.leafPiles)) return;
  for (const key of MAP.leafPiles) {
    const [c, r] = key.split(',').map(Number);
    if (!inGrid(c, r)) continue;
    const [x, cy] = center(c, r);
    G.leafPiles.push({ c, r, x, y: cy + CELL / 2 - 4, img: Math.floor(Math.random() * leafPileImgs.length), fireT: 0, burnt: false, flameT: 0, burnAt: 0 });
  }
}

function leafPileTouchesFire(p) {
  for (const f of G.oilFires || []) if (f.t > 0 && Math.hypot(p.x - f.x, (p.y - f.y) / .7) <= f.r + LEAF_PILE.hitR) return true;
  return false;
}

// ---- 每幀（js/game.js 的 update 呼叫）----
function updateLeafPiles(dt) {
  if (!G || !G.leafPiles) return;
  updateLeafAsh(dt);
  for (const p of G.leafPiles) {
    if (p.gone) continue;
    if (p.burnt) { stepLeafAshPile(p, dt); continue; }
    if (p.fireT <= 0 && leafPileTouchesFire(p)) p.fireT = 1e-6;   // 著火（不跳提示字）
    if (p.fireT <= 0) continue;
    p.fireT += dt;
    if ((p.flameT -= dt) <= 0) { p.flameT = .12 + Math.random() * .12; spawnFlameBurst(p.x + (Math.random() * 2 - 1) * 32, p.y - 6 - Math.random() * 28, .7 + p.fireT / LEAF_PILE.burnTime * .5); }
    if (p.fireT >= LEAF_PILE.burnTime) burnOutLeafPile(p);
  }
}

function burnOutLeafPile(p) {
  p.burnt = true; p.fireT = 0; p.burnAt = performance.now() / 1000; p.ashT = 0; p.ashK = 0; p.ashEmit = 0;
  for (let i = 0; i < 6; i++) spawnFlameBurst(p.x + (Math.random() * 2 - 1) * 36, p.y - Math.random() * 24, 1.2);
  G.effects.push({ ring: true, x: p.x, y: p.y - 10, r: 10, r2: 70, life: .4, life0: .4, color: '#ffb070' });
  if (typeof sfxAt === 'function') sfxAt('hitIncendiary', p.x, p.y, .5, 'leafpile');
  const roll = Math.random(), L = LEAF_PILE;
  if (roll < L.itemChance) leafPileDropItem(p);
  else if (roll < L.itemChance + L.slimeChance) leafPileSlimes(p);
  // 剩下的機率：什麼都沒有（不跳提示）
}

// 露出小道具：掉在灰燼前面一點的地上（從上面彈出來）
function leafPileDropItem(p) {
  const items = Object.entries(LEAF_PILE.items);
  let r = Math.random() * items.reduce((s, [, w]) => s + w, 0), id = items[0][0];
  for (const [k, w] of items) { if ((r -= w) <= 0) { id = k; break; } }
  const x = p.x + (Math.random() * 2 - 1) * 16, y = p.y + 10;
  if (id === 'shard') {
    if (typeof dropShard === 'function') { for (let i = 0; i < LEAF_PILE.shards; i++) dropShard(x, y - 4, 1); }
    return;
  }
  G.groundItems = G.groundItems || [];
  G.groundItems.push({ id, qty: 1, x, y, at: performance.now() / 1000 });
}

// 跳出小史萊姆：從灰燼裡往四周彈出來
function leafPileSlimes(p) {
  const spec = ACTIVE_MONSTERS.find(m => m.id === 'slime') || ACTIVE_MONSTERS[0];
  if (!spec || typeof createMonster !== 'function') return;
  const [a, b] = LEAF_PILE.slimes, n = a + Math.floor(Math.random() * (b - a + 1));
  for (let i = 0; i < n; i++) {
    const ang = Math.random() * Math.PI * 2, m = createMonster(spec, p.x, p.y - 2, 'mini');
    if (typeof enemyBlocked === 'function' && enemyBlocked(m.x, m.y)) { m.x = p.x; m.y = p.y; }
    m.knockT = .25; m.knockVX = Math.cos(ang) * 130; m.knockVY = Math.sin(ang) * 80;
    m.slimeClock = 0; m.hitSquashT = .16;
    G.enemies.push(m);
  }
}

// ---- 光：燒的時候橘光，燒完灰燼裡的餘燼淡淡發光（js/lighting.js 的 visualLights）----
function leafPileLights() {
  const out = [], now = performance.now() / 1000;
  for (const p of G.leafPiles || []) {
    if (p.fireT > 0) out.push({ x: p.x, y: p.y - 10, r: 120, life: 1, life0: 1, power: .9 + Math.sin(now * 13 + p.x) * .1, color: [255, 150, 60] });
    else if (p.burnt && !p.gone) { const k = 1 - (p.ashK || 0); if (k > 0) out.push({ x: p.x, y: p.y - 8, r: 80, life: 1, life0: 1, power: .35 * k, color: [255, 120, 40] }); }
  }
  return out;
}

// ---- 畫（跟其他東西一起排前後；js/render.js 呼叫）----
function leafPileSortables(list) {
  for (const p of (G && G.leafPiles) || []) if (!p.gone) list.push({ y: p.y - OY, draw: () => drawLeafPile(ctx, p) });
  if (G && G.leafAsh && G.leafAsh.length) list.push({ y: 1e6, draw: () => drawLeafAsh(ctx) });   // 飄在空中的灰：畫在最前面
}

// ---- 灰燼被風吹散 ----
// 灰燼停 ashHold 秒後開始散：整堆越來越淡、越來越扁，同時一粒粒灰往上、往旁邊飄走
function stepLeafAshPile(p, dt) {
  const L = LEAF_PILE;
  p.ashT = (p.ashT || 0) + dt;
  if (p.ashT < L.ashHold) return;
  p.ashK = Math.min(1, (p.ashT - L.ashHold) / L.ashFade);
  p.ashEmit = (p.ashEmit || 0) + dt * L.ashBits / L.ashFade;
  const list = G.leafAsh || (G.leafAsh = []), wind = typeof fogGust === 'function' ? fogGust() : 0;
  while (p.ashEmit >= 1 && p.ashK < 1) {
    p.ashEmit -= 1;
    const w = leafPileW(p) * (1 - p.ashK * .5);
    list.push({ x: p.x + (Math.random() * 2 - 1) * w * .5, y: p.y - Math.random() * 18 * L.scale * (1 - p.ashK), vx: 18 + Math.random() * 26 + wind * 60, vy: -(14 + Math.random() * 22),
      t: 0, life: 1.4 + Math.random() * 1.2, ph: Math.random() * 6.28, s: Math.random() < .3 ? 3 : 2, col: ['#5f5a53', '#45413c', '#2e2b28'][Math.floor(Math.random() * 3)] });   // 灰黑色的灰
  }
  if (p.ashK >= 1) p.gone = true;
}
function updateLeafAsh(dt) {
  const list = G.leafAsh; if (!list || !list.length) return;
  for (const a of list) {
    a.t += dt; a.ph += dt * 3;
    a.x += (a.vx + Math.sin(a.ph) * 12) * dt; a.y += a.vy * dt;
    a.vy *= Math.pow(.6, dt);   // 慢慢飄平
  }
  G.leafAsh = list.filter(a => a.t < a.life);
}
function drawLeafAsh(ctx) {
  ctx.save();
  for (const a of G.leafAsh) {
    const q = a.t / a.life;
    ctx.globalAlpha = (q < .15 ? q / .15 : 1 - (q - .15) / .85) * .9;
    ctx.fillStyle = a.col;
    ctx.fillRect(Math.round(a.x), Math.round(a.y), a.s, a.s);   // 一粒一粒方形的灰（點陣風格）
  }
  ctx.restore();
}
// 這堆樹葉畫出來多寬（像素）
function leafPileW(p) { const img = leafPileImgs[p.img]; return (leafImgOk(img) ? img.naturalWidth : 80) * (LEAF_PILE.scale || 1); }
function drawLeafPile(ctx, p) {
  const img = p.burnt ? leafPileBurntImg : leafPileImgs[p.img];
  ctx.save();
  const S = LEAF_PILE.scale || 1, fade = p.burnt ? 1 - (p.ashK || 0) : 1;
  ctx.globalAlpha *= fade;
  const sw = leafPileW(p) * .45;   // 影子跟圖一樣寬（中心在腳底往上 6 像素）
  ctx.fillStyle = 'rgba(0,0,0,.22)';
  ctx.beginPath(); ctx.ellipse(p.x, p.y - 6, sw, Math.max(5, sw * .2), 0, 0, Math.PI * 2); ctx.fill();
  if (leafImgOk(img)) {
    ctx.imageSmoothingEnabled = false;
    const w = img.naturalWidth * S, h = img.naturalHeight * S, x = Math.round(p.x - w / 2), y = Math.round(p.y - h + 2 * S);
    if (p.burnt && p.ashK > 0) {   // 被吹散：越來越扁、往旁邊攤開
      const k = p.ashK;
      ctx.translate(p.x, p.y); ctx.scale(1 + k * .25, 1 - k * .6); ctx.translate(-p.x, -p.y);
    }
    if (p.fireT > 0) {   // 燒的時候：抖一下、越燒越焦黑越扁
      const k = Math.min(1, p.fireT / LEAF_PILE.burnTime), sh = 1 - k * .35;
      ctx.translate(p.x + (Math.random() - .5) * 1.5, p.y + 2); ctx.scale(1, sh); ctx.translate(-p.x, -(p.y + 2));
      ctx.filter = 'sepia(' + k.toFixed(2) + ') brightness(' + (1 - k * .6).toFixed(2) + ')';
    }
    ctx.drawImage(img, x, y, w, h);
    ctx.filter = 'none';
  }
  ctx.restore();
}
