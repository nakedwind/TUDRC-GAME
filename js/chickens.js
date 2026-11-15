/* ===== 森林的雞、鳥巢、雞蛋（數值在 data/chickens.js 的 CHICKEN_CONFIG）=====
   ・鳥巢：地圖上照一般物件擺的鳥巢圖（有蛋／空巢都算，藍森林版也算）自動變成鳥巢。
     有蛋時靠近按空白鍵「撿雞蛋」→ 拿到一顆雞蛋，巢換成空巢的圖；空巢過 nestRespawn 秒長回一顆蛋。
   ・雞：每個鳥巢旁邊生 chickensPerNest 隻。在巢附近 range 格內閒晃（走一段、停一下，隨機 8 個方向；
     走太遠就往巢的方向走回去）。閒晃的寫法照《苦艾與甘露》的雞移植過來。
     每 layEvery 秒在腳邊下一顆蛋（播 POP），蛋就是地上的道具：走過去撿、用火烤會變烤雞蛋（js/food.js）。
   ・抱雞：靠近雞按空白鍵抱起來（雞抱在溫特胸前），再按一次放下。抱著的時候走慢一點、慢慢恢復 SP；
     溫特被打、坐下、倒下時雞會嚇得掙脫跳下來。換地圖時雞留在原本的地圖（回到巢邊）。
   ・溫特走過去撞到雞：雞被推開、咯咯叫。
   ・雞不會被怪物攻擊，也不擋路；換地圖就重新生成（不存檔）。
   必須在 js/render.js、js/maploader.js、js/ground-items.js、js/food.js 之後，js/game.js 之前載入。
*/
const chickenImg = (() => { const i = new Image(); i.src = encodeURI(CHICKEN_CONFIG.image); return i; })();
const chickenImgOk = () => chickenImg.complete && chickenImg.naturalWidth > 0;
const chickenEmptyNestIds = new Set(Object.values(CHICKEN_CONFIG.nests));
const chickenNow = () => performance.now() / 1000;
const chickenRand = ([a, b]) => a + Math.random() * (b - a);

// ---- 開場：找地圖上的鳥巢，每個巢旁邊生雞 ----
function seedChickens() {
  if (!G) return;
  G.nests = []; G.chickens = []; G.carriedChicken = null;
  if (!MAP || !Array.isArray(MAP.stamps)) return;
  const C = CHICKEN_CONFIG;
  for (const s of MAP.stamps) {
    const full = !!C.nests[s.id], empty = chickenEmptyNestIds.has(s.id);
    if (!full && !empty) continue;
    const t = mapTileById(s.id); if (!t) continue;
    const x = OX + s.c * CELL + (s.ox || 0) + mapStampW(s, t) * CELL / 2, y = OY + s.r * CELL + (s.oy || 0) + mapStampH(s, t) * CELL;   // 巢的底部中央
    const fullId = full ? s.id : Object.keys(C.nests).find(k => C.nests[k] === s.id);
    const nest = { stamp: s, x, y: y - CELL * .5, fullId, emptyId: C.nests[fullId], egg: full, t: full ? 0 : C.nestRespawn, floor: typeof hasFloors !== 'undefined' && hasFloors && typeof stampOn2F === 'function' && stampOn2F(s) ? 2 : 1 };
    G.nests.push(nest);
    for (let i = 0; i < C.chickensPerNest; i++) {
      const a = Math.random() * Math.PI * 2, d = CELL * (1 + Math.random());   // 生在巢旁邊 1～2 格
      let cx = nest.x + Math.cos(a) * d, cy = nest.y + Math.sin(a) * d * .6;
      if (chickenBlocked(cx, cy, nest.floor)) { cx = nest.x; cy = nest.y + CELL * .6; }
      G.chickens.push({ nest, x: cx, y: cy, floor: nest.floor, dx: 0, dy: 0, walkT: Math.random() * 2, frame: 0, frameT: 0, faceLeft: Math.random() < .5,
        layT: C.layEvery * (.85 + Math.random() * .3), layAnim: 0, cluckT: chickenRand(C.cluckEvery), bumpT: 0, hop: 0 });
    }
  }
}

// 雞能不能站在這裡：跟溫特一樣看牆、障礙物（雞比溫特小，但用同一套判斷比較不會卡進牆縫）
function chickenBlocked(x, y, floor = 1) {
  if (typeof playerBlocked !== 'function') return false;
  return playerBlocked(x, y, { x, y, floor });
}

// ---- 鳥巢顯示哪張圖（js/maploader.js 的 drawMapStampPlain 呼叫）：有蛋＝原本有蛋的圖、沒蛋＝空巢 ----
function nestDisplayTile(s, t) {
  if (!G || !G.nests) return t;
  const n = G.nests.find(q => q.stamp === s); if (!n) return t;
  return mapTileById(n.egg ? n.fullId : n.emptyId) || t;
}
// 給重疊補畫的快取用：巢的圖換了要重做（js/maploader.js 的 occluderStateSig）
const nestStampSig = s => { const n = G && G.nests && G.nests.find(q => q.stamp === s); return n ? (n.egg ? 'E' : 'e') : ''; };

// ---- 每幀（js/game.js 的 update 呼叫）----
function updateChickens(dt) {
  if (!G) return;
  if (!G.nests) seedChickens();   // 接續「保留進度」的戰場不會跑開場：第一次更新時補生
  const C = CHICKEN_CONFIG, p = G.player;
  for (const n of G.nests) {   // 空巢：時間到長回一顆蛋
    if (n.egg) continue;
    if ((n.t -= dt) <= 0) { n.egg = true; G.effects.push({ ring: true, x: n.x, y: n.y - 8, r: 4, r2: 24, life: .4, life0: .4, color: '#fff3c4' }); }
  }
  // 抱著雞：被打、坐下、倒下 → 雞掙脫跳下來；抱著的時候慢慢恢復 SP
  const held = G.carriedChicken;
  if (held) {
    if (!p || p.hp <= 0 || p.sitting || (held.hp0 != null && p.hp < held.hp0)) dropChicken(true);
    else { held.hp0 = p.hp; if (C.carrySp > 0 && G.guide < G.guideMax) G.guide = Math.min(G.guideMax, G.guide + C.carrySp * dt); }
  }
  for (const ch of G.chickens) {
    ch.bumpT = Math.max(0, ch.bumpT - dt);
    ch.hop = Math.max(0, ch.hop - dt);
    if (ch === G.carriedChicken) continue;
    // 下蛋：時間到停下來、蹲一下、POP 一顆蛋在腳邊
    if (ch.layAnim > 0) { if ((ch.layAnim -= dt) <= 0) chickenLayEgg(ch); continue; }
    if ((ch.layT -= dt) <= 0) {
      ch.layT = C.layEvery;
      if (chickenEggsNear(ch.nest) < C.maxGroundEggs) { ch.layAnim = .6; ch.dx = ch.dy = 0; ch.frame = 0; continue; }
    }
    chickenWander(ch, dt);
    // 溫特撞到雞：雞被推開、咯咯叫
    if (p && p.hp > 0 && actorFloor(p) === ch.floor) {
      const d = Math.hypot(ch.x - p.x, ch.y - (p.y + 8));
      if (d < 22) {
        const k = (22 - d) / Math.max(d, 1), nx = ch.x + (ch.x - p.x) * k, ny = ch.y + (ch.y - p.y - 8) * k;
        if (!chickenBlocked(nx, ny, ch.floor)) { ch.x = nx; ch.y = ny; }
        if (ch.bumpT <= 0) { ch.bumpT = C.bumpCooldown; ch.hop = .25; chickenCluck(ch); }
      }
      // 平常隨機咯咯叫（溫特在附近才聽得到）
      if ((ch.cluckT -= dt) <= 0) { ch.cluckT = chickenRand(C.cluckEvery); if (d < C.cluckRange * CELL) chickenCluck(ch); }
    }
  }
}

// 閒晃（照《苦艾與甘露》的雞）：每走一段隨機挑 8 個方向之一或停下來；撞牆就停、下一段再換方向；走出範圍就往巢走回去
function chickenWander(ch, dt) {
  const C = CHICKEN_CONFIG;
  if ((ch.walkT -= dt) <= 0) {
    ch.walkT = chickenRand(C.walkTime);
    const far = Math.hypot(ch.x - ch.nest.x, ch.y - ch.nest.y) > C.range * CELL;
    if (far && !(ch.detour > 0)) { const a = Math.atan2(ch.nest.y - ch.y, ch.nest.x - ch.x) + (Math.random() - .5) * .8; ch.dx = Math.cos(a); ch.dy = Math.sin(a); }   // 走太遠：大致往巢的方向走回去
    else if (!far && Math.random() < C.stopChance) ch.dx = ch.dy = 0;
    else { const a = Math.floor(Math.random() * 8) * Math.PI / 4; ch.dx = Math.round(Math.cos(a)); ch.dy = Math.round(Math.sin(a)); }
    if (ch.detour > 0) ch.detour--;
  }
  if (ch.dx || ch.dy) {
    const len = Math.hypot(ch.dx, ch.dy), nx = ch.x + ch.dx / len * C.speed * dt, ny = ch.y + ch.dy / len * C.speed * dt;
    // 撞到牆、樹就停，下一段改走隨機方向繞一下（detour）；本來就卡在牆裡（被推進去、放下時）則照走，讓牠自己走出來
    if (chickenBlocked(nx, ny, ch.floor) && !chickenBlocked(ch.x, ch.y, ch.floor)) { ch.dx = ch.dy = 0; ch.walkT = Math.min(ch.walkT, .4); ch.detour = 2; }
    else { ch.x = nx; ch.y = ny; }
    if (ch.dx) ch.faceLeft = ch.dx < 0;
    if ((ch.frameT += dt) >= 1 / C.fps) { ch.frameT -= 1 / C.fps; ch.frame = (ch.frame + 1) % C.frames; }
  } else { ch.frame = 0; ch.frameT = 0; }
}

// 巢附近（range 格內）地上還有幾顆沒撿的蛋
function chickenEggsNear(nest) {
  const R = CHICKEN_CONFIG.range * CELL;
  let n = 0;
  for (const g of G.groundItems || []) if ((g.id === 'egg' || g.id === 'roasted-egg') && Math.hypot(g.x - nest.x, g.y - nest.y) <= R) n += g.qty || 1;
  return n;
}
function chickenLayEgg(ch) {
  if (typeof itemById !== 'function' || !itemById('egg')) return;
  const x = ch.x + (ch.faceLeft ? 10 : -10), y = ch.y + 10;   // 生在屁股後面
  G.groundItems = G.groundItems || [];
  G.groundItems.push({ id: 'egg', qty: 1, x, y, at: chickenNow(), floor: ch.floor });
  ch.hop = .25;
  if (typeof sfxAt === 'function') sfxAt('chickenLay', ch.x, ch.y, .7, 'chicken-lay');
  flash('🥚', ch.x, ch.y - 36, '#fff3c4');
}
function chickenCluck(ch) { if (typeof sfxAt === 'function') sfxAt('chickenCluck', ch.x, ch.y, .6, 'chicken-cluck'); }

// ---- 空白鍵：放下雞／撿鳥巢的蛋／抱起雞（js/game.js 的互動鍵、js/render.js 的提示共用）----
function chickenTarget() {
  const p = G && G.player;
  if (!p || p.sitting || p.hp <= 0 || !G.chickens) return null;
  if (G.carriedChicken) return { kind: 'drop', x: p.x, y: p.y - PLAYER.drawSize + 8, label: '放下雞' };
  const R = CHICKEN_CONFIG.pickRange, fy = p.y + 8;   // 溫特的腳邊
  let best = null, bd = R;
  for (const n of G.nests || []) {
    if (!n.egg || actorFloor(p) !== n.floor) continue;
    const d = Math.hypot(n.x - p.x, n.y - fy); if (d < bd) { bd = d; best = { kind: 'nest', nest: n, x: n.x, y: n.y - CELL * 1.3, label: '撿雞蛋' }; }
  }
  for (const ch of G.chickens) {
    if (ch.layAnim > 0 || actorFloor(p) !== ch.floor) continue;
    const d = Math.hypot(ch.x - p.x, ch.y - fy); if (d < bd) { bd = d; best = { kind: 'chicken', ch, x: ch.x, y: ch.y - 36, label: '抱起雞' }; }
  }
  return best;
}
const chickenPrompt = chickenTarget;
function useChickenNearPlayer() {
  const q = chickenTarget(); if (!q) return false;
  if (q.kind === 'drop') return dropChicken(false);
  if (q.kind === 'nest') {
    if (!supplyGain('egg', 1)) return true;   // 拿不下（supplyGain 會跳提示）：蛋留在巢裡
    q.nest.egg = false; q.nest.t = CHICKEN_CONFIG.nestRespawn;
    sfx('itemPickup'); if (typeof showItemPickupNotice === 'function') showItemPickupNotice('egg', 1);
    updateHUD(); if (typeof saveGame === 'function') saveGame();
    return true;
  }
  const ch = q.ch;
  G.carriedChicken = ch; ch.hp0 = G.player.hp; ch.dx = ch.dy = 0; ch.frame = 0;
  if (typeof sfxAt === 'function') sfxAt('chickenPickup', ch.x, ch.y, .7, 'chicken-pick');
  return true;
}
// scared：被打、坐下時雞自己掙脫（往旁邊跳一下）
function dropChicken(scared) {
  const ch = G && G.carriedChicken, p = G && G.player; if (!ch) return false;
  G.carriedChicken = null; ch.hp0 = null;
  const side = p && p.dir === 'left' ? -1 : 1;
  let x = p ? p.x + side * (scared ? 30 : 18) : ch.x, y = p ? p.y + 10 : ch.y;
  if (chickenBlocked(x, y, ch.floor)) { x = p ? p.x : ch.x; y = p ? p.y + 10 : ch.y; }
  ch.x = x; ch.y = y; ch.floor = p ? actorFloor(p) : ch.floor;
  ch.walkT = scared ? .1 : 1.5; ch.hop = .3; ch.dx = ch.dy = 0;
  if (scared) { ch.dx = side; ch.walkT = .8; }   // 嚇到：往外衝一小段
  if (typeof sfxAt === 'function') sfxAt(scared ? 'chickenCluck' : 'chickenDrop', ch.x, ch.y, .7, 'chicken-drop');
  return true;
}
// 抱著雞時的走路速度倍率（js/food.js 的 foodSpeedMul 乘上去）
const chickenCarrySpeedMul = () => (G && G.carriedChicken ? CHICKEN_CONFIG.carrySpeed : 1);

// ---- 畫（跟其他東西一起排前後；js/render.js 呼叫）----
function chickenSortables(list) {
  if (!G || !G.chickens) return;
  for (const ch of G.chickens) {
    if (ch === G.carriedChicken) continue;
    list.push({ floor: looseFloor(ch), y: ch.y + 12, draw: () => drawChicken(ctx, ch, ch.x, ch.y + 12) });
  }
  const ch = G.carriedChicken, p = G.player;
  if (ch && p) {   // 抱在身前（位置照《苦艾與甘露》：雞的腳在溫特腳底往上 carryLift 倍身高的地方）
    const C = CHICKEN_CONFIG, H = PLAYER.drawSize, back = p.dir === 'back';
    ch.faceLeft = p.dir === 'left' ? true : p.dir === 'right' ? false : ch.faceLeft;
    ch.x = p.x; ch.y = p.y;
    // 正面、側面：排在溫特後面一點點（畫在溫特身上）；背面：排在溫特前面一點點（先畫雞，被溫特的背擋住）
    list.push({ floor: visualFloor(p), y: p.y + (back ? 15.5 : 16.5), draw: () => drawChicken(ctx, ch, p.x + H * C.carryDx, p.y + 18 - H * C.carryLift) });
  }
}
// 畫一隻雞：fx, fy＝腳底中央
function drawChicken(ctx, ch, fx, fy) {
  const C = CHICKEN_CONFIG;
  ctx.save();
  const held = ch === G.carriedChicken;
  if (!held) { ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(fx, fy - 1, 11 * C.scale, 4 * C.scale, 0, 0, Math.PI * 2); ctx.fill(); }   // 影子
  if (!chickenImgOk()) { ctx.fillStyle = '#d9a37a'; ctx.beginPath(); ctx.arc(fx, fy - 10, 9, 0, Math.PI * 2); ctx.fill(); ctx.restore(); return; }
  const fw = chickenImg.naturalWidth / C.frames, fh = chickenImg.naturalHeight, w = Math.round(fw) * C.scale, h = fh * C.scale;
  let sy = 1, sx = 1, lift = 0;
  if (ch.layAnim > 0) { const k = Math.sin((1 - ch.layAnim / .6) * Math.PI); sy = 1 - .18 * k; sx = 1 + .12 * k; }   // 下蛋：蹲下去
  if (ch.hop > 0) lift = Math.sin(ch.hop / .3 * Math.PI) * 6;   // 被撞到、剛放下：跳一下
  if (held) lift = Math.sin(chickenNow() * 6) * 1;   // 抱著：輕輕晃
  ctx.imageSmoothingEnabled = false;
  ctx.translate(Math.round(fx), Math.round(fy - lift));
  ctx.scale((ch.faceLeft ? -1 : 1) * sx, sy);
  ctx.drawImage(chickenImg, Math.round(ch.frame * fw), 0, Math.round(fw), fh, -w / 2, -h, w, h);
  ctx.restore();
}
