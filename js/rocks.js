/* ===== 地圖上擺的石頭（data/objects.js 的 rock_*：小石頭、中石頭、大石頭）=====
   ・在地圖編輯器擺（格子素材或圖章），血量、碰撞在物件編輯器調；不能蓋（data/balance.js 的 DISABLED_BUILD_IDS）。
   ・溫特開槍：游標點在石頭的圖上才打石頭（不搶怪物的子彈；點在怪物身上還是打怪物）。
     每一發扣血、石頭閃白、噴碎石；血量打完就碎成好幾塊飛出去（借虱目魚王吐建築落地的碎掉動畫，js/milkfish-king.js 的 mkShatter）。
   ・碎掉後就跟被怪物打掉一樣：擋路格拿掉、這場戰鬥裡這顆石頭不會再出現（js/build.js 的 removeBarrier）。
   ・虱目魚王會把石頭吞下去再吐出來砸人（js/milkfish-king.js）。
   js/game.js 開槍時呼叫 rockShotTarget／damageRock；js/render.js 畫障礙物時呼叫 drawRockFlash。
*/
const ROCK_FX = {
  chips: 6,          // 每一發噴幾顆碎石
  breakChips: 16,    // 碎掉時另外噴幾顆碎石
  flashTime: .12,    // 被打中閃白幾秒
};
const isRock = o => !!(o && o.kind === 'obstacle' && /^rock_/.test(String(o.type || '')));
// 石頭的圖在畫面上的範圍（瞄準、閃白用）：圖章照圖章的位置和大小；格子素材固定一格（跟地圖畫的一樣）
function rockArtBox(o) {
  const s = o.mapSource && typeof o.mapSource === 'object' ? o.mapSource : null;
  if (s && typeof mapStampW === 'function') {
    const t = o.mapTileId && typeof mapTileById === 'function' ? mapTileById(o.mapTileId) : null;
    return { x: OX + s.c * CELL + (s.ox || 0), y: OY + s.r * CELL + (s.oy || 0), w: mapStampW(s, t) * CELL, h: mapStampH(s, t) * CELL };
  }
  const off = typeof obstacleOff === 'function' ? obstacleOff(o) : [0, 0];
  return { x: OX + o.c * CELL + off[0], y: OY + o.r * CELL + off[1], w: (o.w || 1) * CELL, h: (o.h || 1) * CELL };
}
const rockCenter = o => { const b = rockArtBox(o); return { x: b.x + b.w / 2, y: b.y + b.h * .6 }; };
// 給溫特瞄準用的「假目標」（跟油桶、異質礦一樣）
function rockProxy(o) {
  if (!o.rockProxy) { const c = rockCenter(o); o.rockProxy = { x: c.x, y: c.y, hp: 1, maxhp: 1, rockRef: o }; }
  return o.rockProxy;
}
// 溫特開槍：游標點在哪顆石頭的圖上（射程內、照得到、中間沒有牆）→ 回傳 { proxy, d }；沒有就 null
function rockShotTarget(p, aim, range) {
  let best = null;
  for (const o of G.obstacles) {
    if (!isRock(o) || o.hp <= 0) continue;
    const b = rockArtBox(o), pad = 4;
    if (aim.x < b.x - pad || aim.x > b.x + b.w + pad || aim.y < b.y - pad || aim.y > b.y + b.h + pad) continue;
    const c = rockCenter(o), d = Math.hypot(c.x - p.x, c.y - p.y);
    if (d > range || (typeof isLit === 'function' && !isLit(c.x, c.y)) || !hasLineOfSight(p.x, p.y, c.x, c.y)) continue;
    if (!best || d < best.d) best = { proxy: rockProxy(o), d };
  }
  return best;
}
// 扣石頭的血（source：'player'…）；打完就碎掉
function damageRock(o, amount, source) {
  if (!isRock(o) || o.hp <= 0 || !G.obstacles.includes(o)) return;
  const c = rockCenter(o);
  o.hp -= amount; o.lastHitBy = source; o.rockFlashT = ROCK_FX.flashTime;
  flashDmg('-' + Math.round(amount), c.x, c.y - 26, '#d8cfc0', { small: true });
  rockChips(o, ROCK_FX.chips, 1);
  if (o.hp > 0) { if (typeof sfxAt === 'function') sfxAt('knock2', c.x, c.y, .5, 'rock-hit'); return; }
  breakRock(o);
}
// 碎掉：切成好幾塊飛出去、噴一大把碎石和灰、震一下，再把石頭拿掉
function breakRock(o) {
  const c = rockCenter(o), b = rockArtBox(o);
  if (typeof mkShatter === 'function') mkShatter(o, b.x + b.w / 2, b.y + b.h);   // 用石頭的圖切成好幾塊（js/milkfish-king.js）
  rockChips(o, ROCK_FX.breakChips, 1.8);
  if (typeof rockBurstFx === 'function' && typeof ELITE_BIRD !== 'undefined') rockBurstFx(c.x, b.y + b.h - 4, ELITE_BIRD.runDust);   // 一團灰（js/gourd-monkey.js）
  if (typeof nearbyImpact === 'function') nearbyImpact(c.x, c.y, 3 + Math.min(4, (o.maxhp || o.hp || 150) / 100), 0);
  if (typeof sfxAt === 'function') { sfxAt('knock2', c.x, c.y, 1, 'rock-break'); sfxAt('storySandbagBreak', c.x, c.y, .6, 'rock-break-2'); }
  o.hp = 0;
  if (typeof destroyObstacleNow === 'function') destroyObstacleNow(o); else removeBarrier(o);   // 擋路格拿掉、大家重新找路
}
// 碎石：灰灰的小顆粒往外噴
function rockChips(o, n, power) {
  const c = rockCenter(o);
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (Math.random() * 2 - 1) * 1.5, sp = (60 + Math.random() * 90) * power;
    G.effects.push({ particle: true, kind: 'spark', x: c.x + (Math.random() - .5) * 14, y: c.y - 4, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: 1.5 + Math.random() * 2.2, life: .4 + Math.random() * .2, life0: .5, color: i % 3 ? '#9a9286' : '#c9c0b0' });
  }
}
// 被打中時整顆石頭閃白（js/render.js 的 drawObstacle 呼叫；地圖上的石頭是地圖自己畫的，這裡只蓋一層白色）
const rockWhiteCache = new Map();
function drawRockFlash(ctx, o, dt) {
  if (!(o.rockFlashT > 0)) return;
  const img = typeof mkItemImage === 'function' ? mkItemImage(o) : null;
  if (!img || !img.naturalWidth) return;
  let white = rockWhiteCache.get(img);
  if (!white) {   // 把石頭的圖做成一張純白剪影（只做一次）
    white = document.createElement('canvas'); white.width = img.naturalWidth; white.height = img.naturalHeight;
    const g = white.getContext('2d'); g.drawImage(img, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = '#ffffff'; g.fillRect(0, 0, white.width, white.height);
    rockWhiteCache.set(img, white);
  }
  const b = rockArtBox(o);
  ctx.save(); ctx.globalAlpha = .75 * Math.min(1, o.rockFlashT / ROCK_FX.flashTime); ctx.drawImage(white, b.x, b.y, b.w, b.h); ctx.restore();
}
// 每幀倒數閃白（js/game.js 的 update 呼叫）
function updateRocks(dt) {
  if (!G || !G.obstacles) return;
  for (const o of G.obstacles) if (o.rockFlashT > 0) o.rockFlashT -= dt;
}
