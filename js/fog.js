/* ===== 起霧＋霧樹 =====
   地圖設了 fog（'light' 薄霧／'heavy' 濃霧）才會起霧；數值在 data/balance.js 的 FOG、FOG_TREE。
   霧的畫法（兩層，先畫在一張畫面大小的暫存圖上）：
   ① 遠處白茫茫：溫特身邊看得清楚，越往外霧越濃（一個放射漸層蓋滿畫面）。
   ② 一團團的霧：在地圖上慢慢隨風飄（靠近溫特的霧團會變淡，自己腳邊不會整個看不到）。
   然後用「每一格的霧濃度」把不該有霧的地方挖掉：
   - 營地附近不起霧。
   - 霧樹：地圖自動分區，每一格歸給離它最近的那棵霧樹（地圖編輯器「🌲 霧樹」擺的）。把樹上的水晶打破，那一區的霧就散了。
   - 火海（燃燒彈、油桶）周圍的霧暫時散開，火熄了一陣子才慢慢回來。
   - 探照燈只照亮、不驅霧。
   霧會隨機變濃、變淡（FOG.weather）；站在霧裡的隊友看不清楚：鎖敵距離變短、命中率下降、走路變慢（FOG_SIGHT）。
   霧變濃時，霧裡的一位隊友會冒泡泡說一句（對話編輯器「戰鬥中・霧變濃了」）。
   霧要變濃前先起風（FOG.weather.omen 秒）：風聲、落葉變多往旁邊吹、霧團飄得快、霧慢慢聚過來。
   怪物在霧裡也看不清楚：發現溫特、隊友的距離變短（FOG_SIGHT.monster），可以趁濃霧繞過怪物。
   霧畫在黑幕之前：暗處還是黑的，有燈的地方才看得到霧。
*/

// 目前地圖的霧設定（null＝沒有霧）：每幀直接看 MAP.fog，不用管換地圖、檔案載入順序
function currentFogPreset() {
  if (window.STORY_MODE || window.TEST_MODE || typeof FOG === 'undefined' || typeof MAP === 'undefined' || !MAP) return null;   // TEST_MODE：開始畫面的 🧪 測試模式不起霧（方便測 BOSS）
  return (MAP.fog === 'light' || MAP.fog === 'heavy') ? FOG[MAP.fog] : null;
}

// ================= 霧樹 =================
// 霧樹的樹幹上嵌著一顆紫水晶：把水晶打破，那一區的霧就散了，樹變成沒有水晶的樣子。
// 霧樹有兩種擺法，玩法完全一樣：
//   ① 地圖編輯器直接擺「有水晶的樹」那張物件圖（FOG_TREE.tiles 列的那幾張）→ 自動變成霧樹，破掉時換成沒有水晶的那張。
//   ② 地圖編輯器「🌲 霧樹」點一格 → 由這裡畫 FOG_TREE.image / burntImage。
// 打得到水晶的方式：溫特開槍（游標點在水晶上，或水晶在槍口的扇形範圍內）、爆炸（地雷、油桶、魚卵…）、火海燒到樹根（慢慢扣）。
// 程式裡 tree.burnt 沿用舊名字，意思是「水晶破了、這一區不再有霧」。
const fogTreeImg = new Image(), fogTreeBurntImg = new Image();
if (typeof FOG_TREE !== 'undefined') {
  if (FOG_TREE.image) fogTreeImg.src = FOG_TREE.image;
  if (FOG_TREE.burntImage) fogTreeBurntImg.src = FOG_TREE.burntImage;
}
const imgReady = img => img.complete && img.naturalWidth > 0;

// 換地圖、開新局時（js/game.js）：照地圖種樹
function seedFogTrees() {
  G.fogTrees = []; G.fogClears = []; G.fogTreeByStamp = new Map();
  if (MAP_SAFE || typeof FOG_TREE === 'undefined' || !MAP) return;
  const hp = Math.max(1, FOG_TREE.crystalHp || 60);
  const add = (c, r, rect, stamp) => {
    const tree = { c, r, x: rect.x + rect.w / 2, y: rect.y + rect.h, rect, stamp, hp, maxhp: hp, hitT: 0, barT: 0, fireT: 0, burnt: false, clearK: 0, seed: Math.random() * 10 };
    G.fogTrees.push(tree);
    if (stamp) G.fogTreeByStamp.set(stamp, tree);
  };
  // ① 地圖上擺的「有水晶的樹」物件圖
  const tiles = FOG_TREE.tiles || {};
  for (const s of MAP.stamps || []) {
    if (!tiles[s.id]) continue;
    const t = mapTileById(s.id); if (!t) continue;
    const w0 = mapTileW(t) * CELL, h0 = mapTileH(t) * CELL, k = typeof stampScaleOf === 'function' ? stampScaleOf(s) : 1;
    const x0 = OX + s.c * CELL + (s.ox || 0), y0 = OY + s.r * CELL + (s.oy || 0);
    const rect = { x: x0 + w0 / 2 - w0 * k / 2, y: y0 + h0 - h0 * k, w: w0 * k, h: h0 * k, flip: !!s.fx };   // 放大以圖片底部中央為準（js/stamp-transform.js）
    const c = Math.floor((rect.x + rect.w / 2 - OX) / CELL), r = Math.floor((rect.y + rect.h - 1 - OY) / CELL);   // 樹根那一格（分霧區用）
    add(Math.max(0, Math.min(COLS - 1, c)), Math.max(0, Math.min(ROWS - 1, r)), rect, s);
  }
  // ② 地圖編輯器「🌲 霧樹」點的格子
  for (const key of Array.isArray(MAP.fogTrees) ? MAP.fogTrees : []) {
    const [c, r] = key.split(',').map(Number);
    if (!inGrid(c, r)) continue;
    const [x, cy] = center(c, r), y = cy + CELL / 2 - 4;
    add(c, r, { x: x - FOG_TREE.w / 2, y: y - FOG_TREE.h, w: FOG_TREE.w, h: FOG_TREE.h, flip: false }, null);
  }
}

// 擺在地圖上的霧樹物件：水晶破了就換成沒有水晶的那張圖（js/maploader.js 的 drawMapStampPlain 呼叫）
function fogTreeDisplayTile(s, t) {
  const tree = G && G.fogTreeByStamp && G.fogTreeByStamp.get(s);
  if (!tree || !tree.burnt) return t;
  return mapTileById(FOG_TREE.tiles[s.id]) || t;
}
const fogTreeStampBroken = s => !!(G && G.fogTreeByStamp && G.fogTreeByStamp.get(s)?.burnt);

// 水晶在畫面上的位置（在圖上的比例：data/balance.js 的 FOG_TREE.crystalX / crystalY；左右翻轉的物件跟著翻）
function fogCrystalPos(t) {
  const R = t.rect, fx = FOG_TREE.crystalX ?? .5;
  return { x: R.x + (R.flip ? 1 - fx : fx) * R.w, y: R.y + (FOG_TREE.crystalY ?? .5) * R.h };
}
const fogCrystalScale = t => Math.max(.4, t.rect.w / 320);   // 光暈、血條跟著樹的大小縮放（原圖寬 320）

// 火海有沒有碰到樹根
function fogTreeTouchesFire(tree) {
  if (!G.oilFires) return false;
  for (const f of G.oilFires) if (f.t > 0 && Math.hypot(tree.x - f.x, (tree.y - f.y) / .7) <= f.r + FOG_TREE.hitR) return true;
  return false;
}

// ---- 傷害水晶（溫特開槍、爆炸、火海都走這裡）；quiet＝不跳數字、不出聲（火燒的每幀小傷害）----
function damageFogCrystal(tree, amount, color, quiet) {
  if (!tree || tree.burnt || !(amount > 0)) return;
  tree.hp -= amount; tree.barT = 3;   // 頭上的血條顯示 3 秒
  const cp = fogCrystalPos(tree);
  if (!quiet) {
    tree.hitT = .18;   // 閃白、抖一下
    flashDmg('-' + Math.round(amount), cp.x, cp.y - 20, color || '#d69bff');
    for (let i = 0; i < 4; i++) {   // 小碎屑
      const a = Math.random() * Math.PI * 2, sp = 40 + Math.random() * 70;
      G.effects.push({ ember: true, spark: true, x: cp.x, y: cp.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * .6 - 40,
        r: 1.2 + Math.random() * 1.4, life: .35 + Math.random() * .2, life0: .55, color: '#c47dff' });
    }
    if (typeof sfxAt === 'function') sfxAt('knock2', cp.x, cp.y, .45, 'fogcrystal-hit');
  }
  if (tree.hp <= 0) shatterFogCrystal(tree);
}

// 爆炸波及水晶（js/oil-barrels.js 的 damageCoresInBlast 呼叫：地雷、油桶、魚卵爆炸都會經過）
function damageFogCrystalsInBlast(x, y, radius, damage) {
  for (const t of G.fogTrees || []) {
    if (t.burnt) continue;
    const cp = fogCrystalPos(t), d = Math.min(Math.hypot(cp.x - x, cp.y - y), Math.hypot(t.x - x, t.y - y));
    if (d > radius + 20) continue;
    damageFogCrystal(t, damage * (1 - .4 * Math.min(1, d / radius)), '#ff9a3c');
  }
}

// ---- 溫特開槍瞄準用：跟油桶、異質礦一樣做一個「假目標」（js/game.js 的 updatePlayerAttack 讀）----
function fogCrystalProxy(t) {
  const cp = fogCrystalPos(t);
  if (!t.proxy) t.proxy = { hp: 1, maxhp: 1, fogTreeRef: t };
  t.proxy.x = cp.x; t.proxy.y = cp.y;
  return t.proxy;
}
// 找出這一槍能打到的水晶：回傳 { proxy, d, onBody }；onBody＝游標直接點在水晶附近
function fogCrystalShotTarget(p, aim, angDiff, range) {
  let best = null;
  for (const t of G.fogTrees || []) {
    if (t.burnt) continue;
    const cp = fogCrystalPos(t), d = Math.hypot(cp.x - p.x, cp.y - p.y);
    // 視線：看得到水晶、或看得到樹根（樹根本身、樹根前面一點），任一個就算打得到（水晶常常畫在牆的上方）
    if (d > range || !(hasLineOfSight(p.x, p.y, cp.x, cp.y) || hasLineOfSight(p.x, p.y, t.x, t.y - 8) || hasLineOfSight(p.x, p.y, t.x, t.y + 12))) continue;
    if (!isLit(cp.x, cp.y) && !isLit(t.x, t.y)) continue;
    const onBody = Math.hypot(aim.x - cp.x, aim.y - cp.y) <= (FOG_TREE.crystalR || 18) * fogCrystalScale(t);
    if (!onBody && angDiff(cp.x, cp.y) > playerGun().cone) continue;
    if (!best || (onBody && !best.onBody) || (onBody === best.onBody && d < best.d)) best = { proxy: fogCrystalProxy(t), d, onBody };
  }
  return best;
}

function updateFogTrees(dt) {
  updateFogWeather(dt);
  if (!G.fogTrees) G.fogTrees = [];
  for (const tree of G.fogTrees) {
    if (tree.burnt) { tree.clearK = Math.min(1, tree.clearK + dt / Math.max(.1, FOG.zoneFade)); continue; }
    if (tree.hitT > 0) tree.hitT -= dt;
    if (tree.barT > 0) tree.barT -= dt;
    // 火海燒到樹根：水晶被燒得慢慢扣血（不跳數字）
    if (fogTreeTouchesFire(tree)) {
      tree.fireT = .5;
      if (FOG_TREE.fireDps > 0) damageFogCrystal(tree, FOG_TREE.fireDps * dt, null, true);
      tree.barT = Math.max(tree.barT, .6);
    } else if (tree.fireT > 0) tree.fireT -= dt;
  }
  updateFogClears(dt);
}

// 水晶破掉：換成沒有水晶的樹圖，那一區的霧慢慢散開
function shatterFogCrystal(tree) {
  tree.burnt = true; tree.hp = 0; tree.fireT = 0; tree.burnAt = performance.now() / 1000;
  if (tree.proxy) { tree.proxy.dead = true; tree.proxy.hp = 0; }
  const cp = fogCrystalPos(tree);   // 不跳文字提示：看樹換圖、霧散開就知道
  G.effects.push({ ring: true, x: cp.x, y: cp.y, r: 8, r2: 150, life: .6, life0: .6, color: '#d69bff' });
  G.effects.push({ ring: true, x: cp.x, y: cp.y, r: 4, r2: 90, life: .45, life0: .45, color: '#f2e6ff' });
  for (let i = 0; i < 18; i++) {   // 紫色水晶碎片噴開
    const a = Math.random() * Math.PI * 2, sp = 70 + Math.random() * 140;
    G.effects.push({ ember: true, spark: true, x: cp.x, y: cp.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * .6 - 70,
      r: 1.5 + Math.random() * 2.2, life: .6 + Math.random() * .4, life0: 1, color: i % 3 ? '#c47dff' : '#f2e6ff' });
  }
  if (typeof LOOT_FX_VERSION !== 'undefined' && LOOT_FX_VERSION === 2 && typeof lootV2OreBreak === 'function') lootV2OreBreak(cp.x, cp.y);   // V2：水晶碎片、星光、一閃
  if (typeof nearbyImpact === 'function') nearbyImpact(tree.x, tree.y, 6, .05);
  if (typeof sfxAt === 'function') sfxAt('glassBreak3', cp.x, cp.y, .8, 'fogtree-down');
}

// 黑暗中淡淡的紫光（水晶發出來的；火燒到樹根時變橘光）：js/lighting.js 的 visualLights 會讀這裡
function fogTreeLights() {
  if (!G || !G.fogTrees || !G.fogTrees.length || typeof FOG_TREE === 'undefined') return [];
  const now = performance.now() / 1000, out = [];
  for (const t of G.fogTrees) {
    const cp = fogCrystalPos(t);
    if (t.burnt) {
      const fade = Math.max(0, 1 - (now - (t.burnAt || now)) / 3);   // 碎掉後殘光很快熄掉
      if (fade > .02) out.push({ x: cp.x, y: cp.y, r: 120, life: 1, life0: 1, power: .5 * fade, color: [200, 150, 255] });
    } else if (t.fireT > 0) out.push({ x: t.x, y: t.y - 30, r: 160, life: 1, life0: 1, power: .6 + .1 * Math.sin(now * 9 + t.seed), color: [255, 150, 60] });
    else if (FOG_TREE.glowR > 0) out.push({ x: cp.x, y: cp.y, r: FOG_TREE.glowR * fogCrystalScale(t), life: 1, life0: 1, power: .34 + .08 * Math.sin(now * 1.6 + t.seed), color: [170, 120, 220] });
  }
  return out;
}

// 繪圖排序用（js/render.js 收進 sortables，跟人物排前後）
function fogTreeSortables(list) {
  for (const t of G.fogTrees || []) list.push({ y: t.y, draw: () => drawFogTree(t) });
}

function drawFogTree(t) {
  const W = t.rect.w, H = t.rect.h, now = performance.now() / 1000, sc = fogCrystalScale(t);
  const shake = t.hitT > 0 ? Math.sin(now * 90) * 1.5 : 0;   // 被打中：水晶的光抖一下
  ctx.save();
  if (!t.stamp) {   // 「🌲 霧樹」點的：樹也由這裡畫（物件圖的樹由地圖自己畫）
    ctx.fillStyle = 'rgba(0,0,0,.32)';
    ctx.beginPath(); ctx.ellipse(t.x, t.y - 2, W * .3, 9 * sc, 0, 0, Math.PI * 2); ctx.fill();
    const custom = t.burnt ? (imgReady(fogTreeBurntImg) ? fogTreeBurntImg : null) : (imgReady(fogTreeImg) ? fogTreeImg : null);
    if (custom) ctx.drawImage(custom, Math.round(t.rect.x + shake), Math.round(t.rect.y), W, H);
    else if (t.burnt) drawFogTreeBurntPlaceholder(t, W, H);
    else drawFogTreePlaceholder(t, W, H, now);
  }
  if (!t.burnt) {
    const cp = fogCrystalPos(t);
    // 水晶一明一暗地發光（被打中時閃白），讓玩家知道要打這裡
    ctx.globalCompositeOperation = 'lighter';
    const k = t.hitT > 0 ? 1 : .45 + .25 * Math.sin(now * 2.2 + t.seed), R = 22 * sc;
    const g = ctx.createRadialGradient(cp.x + shake, cp.y, 0, cp.x + shake, cp.y, R);
    g.addColorStop(0, t.hitT > 0 ? 'rgba(255,240,255,' + (.7 * k).toFixed(3) + ')' : 'rgba(200,140,255,' + (.45 * k).toFixed(3) + ')');
    g.addColorStop(1, 'rgba(150,90,230,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cp.x + shake, cp.y, R, 0, Math.PI * 2); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    // 水晶的血條：被打過才出現，幾秒後收起
    if (t.barT > 0 && t.hp < t.maxhp) {
      const bw = 50, by = t.rect.y + H * .08;   // 樹冠上方（圖片頂端有一段空白）
      ctx.globalAlpha = Math.min(1, t.barT / .4);
      ctx.fillStyle = '#1d1528'; ctx.fillRect(t.x - bw / 2, by, bw, 6);
      ctx.fillStyle = '#c47dff'; ctx.fillRect(t.x - bw / 2, by, bw * Math.max(0, t.hp / t.maxhp), 6);
      ctx.globalAlpha = 1;
    }
  }
  ctx.restore();
}

// ---- 佔位圖（還沒有專用圖時）：扭曲的樹幹＋暗紫色的樹冠＋會一明一暗的紫色光點 ----
function drawFogTreePlaceholder(t, W, H, now) {
  const x = t.x, base = t.y, sway = Math.sin(now * .7 + t.seed) * 3;
  // 樹幹
  ctx.fillStyle = '#3a2c2a';
  ctx.beginPath();
  ctx.moveTo(x - 16, base); ctx.quadraticCurveTo(x - 6, base - H * .3, x - 12 + sway * .5, base - H * .55);
  ctx.lineTo(x + 10 + sway * .5, base - H * .55); ctx.quadraticCurveTo(x + 4, base - H * .3, x + 16, base);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#2a1f1e'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x - 4, base - 6); ctx.quadraticCurveTo(x + 2, base - H * .25, x - 3, base - H * .45); ctx.stroke();
  // 樹根
  ctx.fillStyle = '#3a2c2a';
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(x + s * 10, base - 10); ctx.quadraticCurveTo(x + s * 24, base - 4, x + s * 30, base); ctx.lineTo(x + s * 12, base); ctx.closePath(); ctx.fill(); }
  // 樹冠：幾個深淺不同的圓
  const cx = x + sway, cy = base - H * .68;
  const blobs = [[-.28, .08, .3, '#2e2540'], [.26, .1, .3, '#2e2540'], [0, -.14, .36, '#3b2f52'], [-.18, -.02, .28, '#45375f'], [.16, -.06, .26, '#4d3d6b'], [0, .12, .3, '#382c4d']];
  for (const [dx, dy, rr, col] of blobs) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(cx + dx * W, cy + dy * H, rr * W * .62, 0, Math.PI * 2); ctx.fill(); }
  // 紫色光點
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 7; i++) {
    const a = i * 2.4 + t.seed, px = cx + Math.cos(a) * W * .28, py = cy + Math.sin(a * 1.3) * H * .14;
    const k = .4 + .6 * (.5 + .5 * Math.sin(now * 2 + i * 1.7 + t.seed));
    ctx.fillStyle = 'rgba(200,150,255,' + (.55 * k).toFixed(3) + ')';
    ctx.beginPath(); ctx.arc(px, py, 2.5 + k * 1.5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalCompositeOperation = 'source-over';
}
function drawFogTreeBurntPlaceholder(t, W, H) {
  const x = t.x, base = t.y;
  ctx.fillStyle = '#1b1514';
  ctx.beginPath();
  ctx.moveTo(x - 16, base); ctx.quadraticCurveTo(x - 8, base - H * .25, x - 10, base - H * .42);
  ctx.lineTo(x - 2, base - H * .36); ctx.lineTo(x + 4, base - H * .46); ctx.lineTo(x + 9, base - H * .38);
  ctx.quadraticCurveTo(x + 6, base - H * .2, x + 16, base); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#1b1514'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x - 6, base - H * .3); ctx.lineTo(x - 24, base - H * .42); ctx.moveTo(x + 6, base - H * .28); ctx.lineTo(x + 22, base - H * .36); ctx.stroke();
  // 地上的灰燼
  ctx.fillStyle = 'rgba(40,34,32,.55)';
  ctx.beginPath(); ctx.ellipse(x, base - 2, W * .34, 10, 0, 0, Math.PI * 2); ctx.fill();
}

// ================= 火海驅霧 =================
// 每片火海對應一個「驅霧圈」：火燒著時慢慢散開，火熄了 linger 秒後霧慢慢回來
function updateFogClears(dt) {
  const list = G.fogClears || (G.fogClears = []);
  if (!currentFogPreset()) { list.length = 0; return; }
  const F = FOG.fireClear;
  for (const f of G.oilFires || []) {
    if (f.t > 0 && !list.some(c => c.ref === f)) list.push({ ref: f, x: f.x, y: f.y, r: f.r + F.extra * CELL, k: 0, hold: F.linger });
  }
  // 正在燒的霧樹：火的熱度把整棵樹周圍的霧逼開（才看得到樹在燒）
  for (const t of G.fogTrees || []) {
    if (t.fireT > 0 && !t.burnt && !list.some(c => c.ref === t)) list.push({ ref: t, tree: true, x: t.x, y: t.y - t.rect.h * .3, r: t.rect.w * .4 + F.extra * CELL, k: 0, hold: F.linger });
  }
  for (const c of list) {
    if (fogClearAlive(c)) { c.k = Math.min(1, c.k + dt / F.fadeIn); c.hold = F.linger; }
    else if (c.hold > 0) c.hold -= dt;
    else c.k -= dt / F.fadeOut;
  }
  G.fogClears = list.filter(c => c.k > 0 || fogClearAlive(c));
}
const fogClearAlive = c => c.tree ? c.ref.fireT > 0 && !c.ref.burnt : c.ref.t > 0 && (G.oilFires || []).includes(c.ref);

// ================= 每一格的霧濃度 =================
// 固定的部分（每格歸哪棵樹、營地附近多淡）換地圖才重算；樹燒掉的淡出每幀重畫
let fogStatic = { key: null, zone: null, camp: null };
function fogStaticData() {
  const trees = G.fogTrees || [];
  const key = MAP && (MAP.id + '|' + COLS + 'x' + ROWS + '|' + trees.map(t => t.c + ',' + t.r).join(';') + '|' + [...campCells].join(';'));
  if (fogStatic.key === key) return fogStatic;
  const n = COLS * ROWS, zone = new Int16Array(n).fill(-1), camp = new Float32Array(n).fill(1);
  const campList = [...campCells].map(k => k.split(',').map(Number));
  const C0 = FOG.campClear, C1 = FOG.campClear + 2;
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const i = r * COLS + c;
    let best = -1, bd = Infinity;
    for (let j = 0; j < trees.length; j++) { const d = (trees[j].c - c) ** 2 + (trees[j].r - r) ** 2; if (d < bd) { bd = d; best = j; } }
    zone[i] = best;
    let cd = Infinity;
    for (const [cc, cr] of campList) { const d = Math.hypot(cc - c, cr - r); if (d < cd) cd = d; }
    camp[i] = cd <= C0 ? 0 : cd >= C1 ? 1 : (cd - C0) / (C1 - C0);
  }
  return (fogStatic = { key, zone, camp });
}
const fogMaskCv = document.createElement('canvas'), fogMaskCtx = fogMaskCv.getContext('2d');
let fogMaskImg = null;
function updateFogMask() {
  if (fogMaskCv.width !== COLS || fogMaskCv.height !== ROWS || !fogMaskImg) {
    fogMaskCv.width = COLS; fogMaskCv.height = ROWS; fogMaskImg = fogMaskCtx.createImageData(COLS, ROWS);
  }
  const S = fogStaticData(), trees = G.fogTrees || [], px = fogMaskImg.data;
  for (let i = 0; i < S.zone.length; i++) {
    const z = S.zone[i];
    const d = S.camp[i] * (z >= 0 && trees[z] ? 1 - trees[z].clearK : 1);
    const o = i * 4;
    px[o] = px[o + 1] = px[o + 2] = 255; px[o + 3] = Math.round(255 * d);
  }
  fogMaskCtx.putImageData(fogMaskImg, 0, 0);
}

// ================= 畫霧 =================
// 一團霧的圖：幾個柔邊圓疊成不規則的雲（只做一次，之後縮放重複用）
const fogPuffImgs = [];
function fogPuffImg(i) {
  if (fogPuffImgs[i]) return fogPuffImgs[i];
  const S = 256, cv = document.createElement('canvas');
  cv.width = cv.height = S;
  const c = cv.getContext('2d');
  let seed = 9173 + i * 7919;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let k = 0; k < 9; k++) {
    const a = rnd() * Math.PI * 2, d = rnd() * S * .2;
    const x = S / 2 + Math.cos(a) * d, y = S / 2 + Math.sin(a) * d * .7, r = S * (.18 + rnd() * .16);
    const g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(255,255,255,.55)');
    g.addColorStop(.55, 'rgba(255,255,255,.25)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
  }
  // 染成霧的顏色
  c.globalCompositeOperation = 'source-in';
  c.fillStyle = 'rgb(' + FOG.color.join(',') + ')';
  c.fillRect(0, 0, S, S);
  return (fogPuffImgs[i] = cv);
}

// 霧團的固定排列：在一塊 TILE×TILE 的區域裡隨機擺，整張地圖用這塊重複鋪滿（看不出接縫）
const FOG_TILE = 1400;
const fogPuffs = (() => {
  let seed = 4242;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const list = [];
  for (let i = 0; i < 24; i++) list.push({ x: rnd() * FOG_TILE, y: rnd() * FOG_TILE, s: .7 + rnd() * .6, a: .6 + rnd() * .4, img: i % 4, sp: .7 + rnd() * .6, ph: rnd() * 6.28 });
  return list;
})();

const fogCv = document.createElement('canvas'), fogCtx = fogCv.getContext('2d');
function drawFog(ctx) {
  const P = fogWeatherPreset(currentFogPreset());
  if (!P) return;
  const t = performance.now() / 1000;
  const vx = cam.x, vy = cam.y, vw = viewW(), vh = viewH();
  const W = Math.ceil(vw) + 4, H = Math.ceil(vh) + 4;
  if (fogCv.width !== W || fogCv.height !== H) { fogCv.width = W; fogCv.height = H; }
  const fc = fogCtx;
  fc.setTransform(1, 0, 0, 1, 0, 0); fc.globalCompositeOperation = 'source-over'; fc.globalAlpha = 1;
  fc.clearRect(0, 0, W, H);
  fc.translate(-(vx - 2), -(vy - 2));   // 之後都用世界座標畫
  const pl = G.player;
  const px = pl ? pl.x : vx + vw / 2, py = pl ? pl.y : vy + vh / 2;
  const [cr, cg, cb] = FOG.color;

  // ② 飄動的霧團
  const n = Math.min(P.puffs, fogPuffs.length);
  for (let i = 0; i < n; i++) {
    const f = fogPuffs[i];
    const size = P.size * f.s;
    const wind = G.fogWx ? G.fogWx.wind : t;   // 累積的飄動距離（起風時飄得快）
    const bx = f.x + wind * P.wind * f.sp, by = f.y + Math.sin(t * .12 + f.ph) * 30;   // 往右飄，上下微微起伏
    // 找出這團霧在畫面附近的所有重複位置
    const x0 = Math.floor((vx - size - bx) / FOG_TILE), x1 = Math.floor((vx + vw + size - bx) / FOG_TILE);
    const y0 = Math.floor((vy - size - by) / FOG_TILE), y1 = Math.floor((vy + vh + size - by) / FOG_TILE);
    for (let ix = x0; ix <= x1; ix++) for (let iy = y0; iy <= y1; iy++) {
      const x = bx + ix * FOG_TILE, y = by + iy * FOG_TILE;
      const near = Math.min(1, Math.hypot(x - px, y - py) / (P.clear + size * .5));   // 靠近溫特的霧團變淡
      const a = P.puffAlpha * f.a * (.35 + .65 * near) * (.85 + .15 * Math.sin(t * .3 + f.ph));
      if (a < .01) continue;
      fc.globalAlpha = a;
      fc.drawImage(fogPuffImg(f.img), x - size / 2, y - size * .35, size, size * .7);
    }
  }
  fc.globalAlpha = 1;
  if (typeof FOG_FX_VERSION !== 'undefined' && FOG_FX_VERSION === 2) fogV2Wisps(fc, t, P, vx, vy, vw, vh, px, py);   // 起霧 V2：貼地薄霧帶（js/fog-fx-v2.js）

  // ① 遠處白茫茫：溫特身邊透明，往外越來越濃
  const breathe = 1 + Math.sin(t * .4) * .04;   // 霧的邊界輕輕呼吸
  const g = fc.createRadialGradient(px, py, P.clear * breathe, px, py, P.far * breathe);
  g.addColorStop(0, 'rgba(' + cr + ',' + cg + ',' + cb + ',0)');
  g.addColorStop(.5, 'rgba(' + cr + ',' + cg + ',' + cb + ',' + (P.haze * .55).toFixed(3) + ')');
  g.addColorStop(1, 'rgba(' + cr + ',' + cg + ',' + cb + ',' + P.haze + ')');
  fc.fillStyle = g;
  fc.fillRect(vx - 2, vy - 2, W, H);

  // 每格的霧濃度：營地、燒掉的霧樹那一區挖掉（一格一像素的小圖平滑放大，邊界會自然變柔）
  updateFogMask();
  fc.globalCompositeOperation = 'destination-in';
  fc.imageSmoothingEnabled = true;
  fc.drawImage(fogMaskCv, OX, OY, COLS * CELL, ROWS * CELL);

  // 火海周圍暫時散開
  fc.globalCompositeOperation = 'destination-out';
  for (const c of G.fogClears || []) {
    if (c.k <= 0) continue;
    const e = c.k * c.k * (3 - 2 * c.k);   // 平滑淡入淡出
    const rg = fc.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.r);
    rg.addColorStop(0, 'rgba(0,0,0,' + e.toFixed(3) + ')');
    rg.addColorStop(.55, 'rgba(0,0,0,' + (e * .85).toFixed(3) + ')');
    rg.addColorStop(1, 'rgba(0,0,0,0)');
    fc.fillStyle = rg; fc.beginPath(); fc.arc(c.x, c.y, c.r, 0, Math.PI * 2); fc.fill();
  }
  fc.globalCompositeOperation = 'source-over';

  ctx.drawImage(fogCv, vx - 2, vy - 2, W, H);
}

// ================= 霧隨機變濃、變淡 =================
// G.fogWx：{ level, m（現在的濃度倍率）, from, to, t（換濃度進行了幾秒）, hold（這種濃度還要維持幾秒） }
function fogPickLevel(not) {
  const L = FOG.weather.levels, keys = Object.keys(L).filter(k => k !== not);
  let r = Math.random() * keys.reduce((s, k) => s + L[k].weight, 0);
  for (const k of keys) { if ((r -= L[k].weight) <= 0) return k; }
  return keys[keys.length - 1];
}
function updateFogWeather(dt) {
  if (!currentFogPreset() || !FOG.weather) { G.fogWx = null; return; }
  const W = FOG.weather, rnd = (a, b) => a + Math.random() * (b - a);
  const wx = G.fogWx || (G.fogWx = { level: 'normal', m: 1, from: 1, to: 1, t: W.change, hold: rnd(W.hold[0], W.hold[1]), omen: 0, gust: 0, wind: 0 });
  // 起風（預兆）：gust 0～1；風吹得越大，霧團飄越快（wind＝累積的飄動距離，換速度時霧團不會跳）
  const gustWant = wx.omen > 0 ? 1 : 0;
  wx.gust += (gustWant - wx.gust) * Math.min(1, dt * (gustWant ? 1.2 : .5));
  wx.wind = (wx.wind || 0) + dt * (1 + ((W.omenWind || 1) - 1) * wx.gust);
  if (wx.omen > 0) {   // 預兆中：時間到才真的開始變濃
    wx.omen -= dt;
    if (wx.omen <= 0) { wx.omen = 0; wx.from = wx.m; wx.to = W.levels.thick.mul; wx.t = 0; wx.level = 'thick'; fogThickTalk(); fogWindSound(false); }
    return;
  }
  if (wx.t < W.change) {
    wx.t = Math.min(W.change, wx.t + dt);
    const k = wx.t / W.change, e = k * k * (3 - 2 * k);
    wx.m = wx.from + (wx.to - wx.from) * e;
    return;
  }
  if ((wx.hold -= dt) > 0) return;
  const prev = wx.level, next = fogPickLevel(prev);
  wx.hold = rnd(W.hold[0], W.hold[1]);
  if (next === 'thick' && W.omen > 0) { wx.omen = W.omen; fogWindSound(true); return; }   // 要變濃：先起風
  wx.level = next; wx.from = wx.m; wx.to = W.levels[next].mul; wx.t = 0;
}
// 現在風多大（0～1）：霧要變濃之前起風（js/fog-fx-v2.js 的落葉也會看）
function fogGust() { return G && G.fogWx ? G.fogWx.gust || 0 : 0; }
// 起風的聲音：風聲＋樹葉沙沙聲一起播（音效編輯器「森林起風」那兩格），霧開始變濃時一起淡掉
function fogWindSound(on) {
  if (typeof SFX === 'undefined' || !SFX.enabled) return;
  if (on) { SFX.play('fogWind', .9, 'fog-wind'); SFX.play('fogLeaves', .9, 'fog-leaves'); }
  else { SFX.fadeOut('fog-wind', 2.5); SFX.fadeOut('fog-leaves', 2.5); }
}
// 依現在的濃度調整霧的樣子：看得清楚的範圍變小、白茫茫和霧團變濃
function fogWeatherPreset(P) {
  const wx = G && G.fogWx, m = P && wx ? wx.m + (wx.omen > 0 ? (FOG.weather.omenGather || 0) * Math.min(1, 1 - wx.omen / FOG.weather.omen) : 0) : 1;   // 起風時霧慢慢聚過來
  if (!P || m === 1) return P;
  return { ...P, clear: P.clear / Math.pow(m, .8), far: P.far / Math.pow(m, .6), haze: Math.min(.95, P.haze * m), puffAlpha: Math.min(.75, P.puffAlpha * m) };
}
// 霧變濃：霧裡的一位隊友冒泡泡說一句（對話編輯器「霧變濃了」；沒填就不說）
function fogThickTalk() {
  if (!G || MAP_SAFE || typeof pickDialogueLine !== 'function') return;
  const list = (G.towers || []).filter(t => t.hp > 0 && !t.berserk && !t.vineCap && !t.eatenBy && !(t.say && t.say.text && t.say.hurt) && fogSightAt(t.x, t.y) > .2);
  for (let tries = 0; tries < 4 && list.length; tries++) {
    const t = list.splice(Math.floor(Math.random() * list.length), 1)[0], text = pickDialogueLine(t.type, 'fogThick');
    if (!text) continue;
    t.say = { text, life: 3 };
    t.sayWait = Math.max(t.sayWait || 0, 4);
    return;
  }
}

// ================= 霧擋住隊友的視線 =================
// 這個位置的霧有多濃：0＝沒有霧（營地、燒掉霧樹那一區、火海旁邊）～1＝最濃
function fogSightAt(x, y) {
  const P = fogWeatherPreset(currentFogPreset());
  if (!P || !G) return 0;
  const c = Math.floor((x - OX) / CELL), r = Math.floor((y - OY) / CELL);
  if (c < 0 || r < 0 || c >= COLS || r >= ROWS) return 0;
  const S = fogStaticData(), i = r * COLS + c, z = S.zone[i], tree = z >= 0 && G.fogTrees ? G.fogTrees[z] : null;
  let local = S.camp[i] * (tree ? 1 - tree.clearK : 1);
  for (const f of G.fogClears || []) {   // 火海周圍暫時散開
    const d = Math.hypot(x - f.x, y - f.y);
    if (d < f.r) local *= 1 - f.k * Math.min(1, (1 - d / f.r) * 1.6);
  }
  return Math.max(0, Math.min(1, local * Math.min(1, P.haze)));
}
const fogMateOn = t => t && t.kind === 'tower' && !MAP_SAFE && typeof FOG_SIGHT !== 'undefined';
// 隊友在霧裡：鎖敵距離倍率、命中率倍率、走路速度倍率（js/sentry.js、js/game.js 呼叫）
function fogRangeMul(t) { return fogMateOn(t) ? 1 - FOG_SIGHT.range * fogSightAt(t.x, t.y) : 1; }
function fogHitMul(t) { return fogMateOn(t) ? 1 - FOG_SIGHT.miss * fogSightAt(t.x, t.y) : 1; }
function fogSpeedMul(t) { return fogMateOn(t) ? 1 - FOG_SIGHT.slow * fogSightAt(t.x, t.y) : 1; }
// 怪物也看不清楚：怪物發現 target（溫特或隊友）的距離倍率；怪物或被看的人站在霧裡都算（js/enemy-ai.js 呼叫）
function fogSenseMul(e, target) {
  if (!e || !target || MAP_SAFE || typeof FOG_SIGHT === 'undefined' || !FOG_SIGHT.monster || !currentFogPreset()) return 1;
  return 1 - FOG_SIGHT.monster * Math.max(fogSightAt(e.x, e.y), fogSightAt(target.x, target.y));
}
// 走路變慢：包住 js/sentry.js 的 moveSentryWithPath（隊友各種走路都經過這裡）
if (typeof moveSentryWithPath === 'function') {
  const fogBaseMoveSentry = moveSentryWithPath;
  moveSentryWithPath = (t, x, y, speed, dt) => fogBaseMoveSentry(t, x, y, speed * fogSpeedMul(t), dt);
}
