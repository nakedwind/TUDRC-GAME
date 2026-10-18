// ============================================================
//  生命體（怪物資料裡有 "undying": true 的怪物）
//  ・HP 歸零不會死：身體碎成一節一節，堆在地上；過 30 秒會重新組裝、滿血復活
//  ・只有「火」能真的殺死它：
//      - 正在燒（希奧妮的燒傷、站在火海裡、剛被油桶／油箱爆炸炸到）時 HP 歸零
//      - 或是地上那堆碎塊被火燒到（火海、油桶／油箱爆炸、希奧妮的火焰剛好打到）
//    → 碎塊著火四散，這時才算擊殺（給經費和異質碎片）
//  （數值集中在最上面，想調整改這裡就好）
// ============================================================
const LIFEFORM = {
  revive: 30,          // 碎掉後幾秒復活
  collapse: .55,       // 碎掉、掉到地上的時間（秒）
  reassemble: 1.3,     // 重新組裝的時間（秒）
  twitch: 5,           // 復活前幾秒，碎塊開始抽動
  burnWindow: .6,      // 被火燒到後幾秒內 HP 歸零，算是被燒死
  slice: 14,           // 切成碎塊時，每塊大約幾像素高
};
const lifePiles = () => (G.lifePiles = G.lifePiles || []);
const isUndying = e => !!(e && e.undying);
const lifeNow = () => performance.now() / 1000;

// ---- 把怪物的圖切成一節一節（只切有畫東西的地方）----
const lifeSliceCache = {};
function lifeSlices(file, w, h) {
  const key = file + '|' + w + 'x' + h;
  if (lifeSliceCache[key]) return lifeSliceCache[key];
  const img = monsterImage(file);
  if (!img.complete || !img.naturalWidth) return [];
  const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight;
  const g = c.getContext('2d'); g.drawImage(img, 0, 0);
  // 直接雙擊 HTML（file://）開啟時，瀏覽器不准讀圖片像素：改成整張照格子切，不判斷哪塊有畫東西
  //（空白的碎塊本來就是透明的，畫出來看不出差別）。之前沒擋這個錯，生命體碎掉時每一幀都出錯、畫面全黑。
  let data = null;
  try { data = g.getImageData(0, 0, c.width, c.height).data; } catch (_) { data = null; }
  const kx = w / c.width, ky = h / c.height, cols = 3, rows = Math.max(4, Math.round(c.height / LIFEFORM.slice));
  const out = [];
  for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) {
    const sx = Math.floor(q * c.width / cols), sy = Math.floor(r * c.height / rows);
    const sw = Math.floor((q + 1) * c.width / cols) - sx, sh = Math.floor((r + 1) * c.height / rows) - sy;
    if (data) {
      let ink = 0;
      for (let y = sy; y < sy + sh; y += 2) for (let x = sx; x < sx + sw; x += 2) if (data[(y * c.width + x) * 4 + 3] > 60) ink++;
      if (ink < 4) continue;
    }
    // home：這塊在站姿裡的位置（以腳底中央為原點，畫面像素）
    out.push({ img, sx, sy, sw, sh, w: sw * kx, h: sh * ky, hx: (sx + sw / 2) * kx - w / 2, hy: (sy + sh / 2) * ky - h });
  }
  return (lifeSliceCache[key] = out);
}

// ---- HP 歸零時（js/game.js 呼叫）：沒在燒 → 碎成一堆，回傳 true（這次不算擊殺）----
function lifeformOnFire(e) {
  const standingInFire = typeof oilFireAt === 'function' && !!oilFireAt(e.x,e.y);
  return standingInFire || e.burnT > 0 || lifeNow() - (e.fireHitAt ?? -99) < LIFEFORM.burnWindow;
}
function lifeformCollapse(e) {
  if (!isUndying(e) || lifeformOnFire(e)) return false;   // 正在燒：照一般流程真的死掉
  const file = e.frames ? e.frames.front : e.sprite;
  const pieces = lifeSlices(file, e.drawWidth || 60, e.drawHeight || 80).map(p => ({
    ...p,
    // 堆在腳邊：每塊散落到附近、隨便轉個角度
    tx: (Math.random() - .5) * 46, ty: (Math.random() - .3) * 14, rot: (Math.random() - .5) * 3.2,
    delay: Math.random() * .18,
  }));
  lifePiles().push({ x: e.x, y: e.y, spec: ACTIVE_MONSTERS.find(m => m.id === e.type), t: LIFEFORM.revive, born: lifeNow(),
    pieces, tint: e.tint || null, state: 'collapse' });
  e.dead = true; e.lifeformPiled = true;
  if (typeof sfxAt === 'function') sfxAt('lifeformDeath', e.x, e.y, .72, 'lifeform-collapse');
  if (typeof nearbyImpact === 'function') nearbyImpact(e.x, e.y, 5, .05);
  return true;
}

// ---- 火燒到地上的碎塊：真的死掉 ----
function burnLifePilesNear(x, y, R) {
  for (const p of lifePiles()) if (p.state !== 'burn' && Math.hypot(p.x - x, p.y - y) <= R + 18) burnLifePile(p);
}
function burnLifePile(p) {
  if (p.state === 'burn') return;
  p.state = 'burn'; p.burnAt = lifeNow();
  const spec = p.spec || {};
  if (typeof dropShard === 'function') dropShard(p.x, p.y, spec.crystals ?? 3); else earnCrystals(spec.crystals ?? 3);   // 打怪不加錢；掉一顆碎片
  if (typeof trackKillAchievements === 'function') trackKillAchievements({ type: spec.id, x: p.x, y: p.y });
  lifeBurnFx(p.x, p.y);
  if (typeof sfxAt === 'function') sfxAt('lifeformDeath', p.x, p.y, .68, 'lifeform-burn-death');
  updateHUD();
}
// 活著的時候被燒死（一般死亡流程會呼叫，js/combat-feel.js）：直接變成著火四散的碎塊
function lifeformBurnAway(e) {
  const file = e.frames ? e.frames.front : e.sprite;
  const pieces = lifeSlices(file, e.drawWidth || 60, e.drawHeight || 80).map(p => ({ ...p, tx: 0, ty: 0, rot: 0, delay: 0 }));
  lifePiles().push({ x: e.x, y: e.y, spec: null, t: 0, born: lifeNow() - LIFEFORM.collapse, pieces, state: 'burn', burnAt: lifeNow(), standing: true });
  lifeBurnFx(e.x, e.y);
  if (typeof sfxAt === 'function') sfxAt('lifeformDeath', e.x, e.y, .68, 'lifeform-burn-away');
}
function lifeBurnFx(x, y) {
  if (typeof spawnFlameBurst === 'function') for (let i = 0; i < 3; i++) spawnFlameBurst(x + (Math.random() - .5) * 30, y - Math.random() * 30, 1.1);
  for (let i = 0; i < 18; i++) {
    const a = Math.random() * Math.PI * 2, sp = 40 + Math.random() * 100;
    G.effects.push({ ember: true, spark: true, x, y: y - 20, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * .6 - 50,
      r: 1.5 + Math.random() * 2, life: .6 + Math.random() * .5, life0: 1.1 });
  }
  if (typeof pushBlackSmoke === 'function') for (let i = 0; i < 4; i++) pushBlackSmoke(x + (Math.random() - .5) * 30, y - 10, true);
  if (typeof sfxAt === 'function') sfxAt('fireImpact', x, y, .7, 'lifeform-burn');
}

// ---- 每幀更新（在 update 裡呼叫）----
function updateLifePiles(dt) {
  const list = lifePiles(); if (!list.length) return;
  const now = lifeNow();
  for (const p of list) {
    if (p.state === 'burn') { if (now - p.burnAt > 1.4) p.gone = true; continue; }
    // 火海燒到碎塊
    if ((G.oilFires || []).some(f => f.t > 0 && Math.hypot(p.x - f.x, (p.y - f.y) / .7) <= f.r + 10)) { burnLifePile(p); continue; }
    if (p.state === 'collapse' && now - p.born > LIFEFORM.collapse + .2) p.state = 'pile';
    if (p.state === 'pile') {
      p.t -= dt;
      if (p.t <= 0) { p.state = 'rise'; p.riseAt = now; if (typeof sfxAt === 'function') sfxAt('lifeformRevive', p.x, p.y, .72, 'lifeform-rise'); }
    } else if (p.state === 'rise' && now - p.riseAt >= LIFEFORM.reassemble) {
      p.gone = true;   // 組裝完成：變回怪物，滿血
      if (p.spec) {
        const e = createMonster(p.spec, p.x, p.y);
        if (p.tint) e.tint = p.tint;
        G.enemies.push(e);
      }
    }
  }
  G.lifePiles = list.filter(p => !p.gone);
}

// ---- 繪製：碎掉掉落 → 堆在地上（快復活時抽動）→ 飛回去組裝；著火時四散變黑淡出 ----
// 跟角色一起依深度排序（js/render.js），組裝到一半的身體才不會被前面的箱子蓋住
function lifePileSortables(sortables) {
  for (const p of lifePiles()) if (typeof isVisible !== 'function' || isVisible(p.x, p.y)) sortables.push({ y: p.y + 13, draw: () => drawLifePile(ctx, p) });
}
function drawLifePile(ctx, p) {
  const now = lifeNow();
  {
    const footY = p.y + 13;
    for (const q of p.pieces) {
      // 「站姿位置」和「地上位置」之間插值：k=0 站著、k=1 躺在地上
      let k = 1, x, y, rot, alpha = 1, burn = 0;
      if (p.state === 'collapse') k = Math.min(1, Math.max(0, (now - p.born - q.delay) / LIFEFORM.collapse));
      if (p.state === 'rise') { const r = Math.min(1, (now - p.riseAt) / LIFEFORM.reassemble); k = 1 - (r * r * (3 - 2 * r)); }
      if (p.standing) k = 0;
      const ease = k * k;   // 掉落越來越快
      x = p.x + q.hx + (q.tx - q.hx) * ease;
      y = footY + q.hy + (q.ty - q.hy) * ease - Math.sin(k * Math.PI) * (p.state === 'rise' ? 18 : 6);
      rot = q.rot * ease;
      if (p.state === 'pile' && p.t < LIFEFORM.twitch && Math.random() < .25) { x += (Math.random() - .5) * 2.5; rot += (Math.random() - .5) * .15; }   // 快復活了：抽動
      if (p.state === 'burn') {   // 著火：往外飛散、轉、變黑淡出
        const b = Math.min(1, (now - p.burnAt) / 1.3); burn = b;
        const dir = Math.atan2(q.hy + 30, q.hx) + (q.sx % 7) * .3;
        x += Math.cos(dir) * 50 * b; y += Math.sin(dir) * 20 * b - 30 * b * (1 - b) * 2;
        rot += (q.sx % 2 ? 1 : -1) * 3 * b; alpha = 1 - b;
      }
      ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y); ctx.rotate(rot);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(q.img, q.sx, q.sy, q.sw, q.sh, -q.w / 2, -q.h / 2, q.w, q.h);
      if (burn > 0) { ctx.globalCompositeOperation = 'source-atop'; ctx.fillStyle = `rgba(255,${Math.round(140 - 120 * burn)},40,${.6 * (1 - burn * .4)})`; ctx.fillRect(-q.w / 2, -q.h / 2, q.w, q.h); }
      ctx.restore();
    }
    if (p.state === 'pile' && p.t < LIFEFORM.twitch) {   // 快復活了：地上冒出淡淡的紫光
      const a = (1 - p.t / LIFEFORM.twitch) * (.25 + .15 * Math.sin(now * 8));
      const g = ctx.createRadialGradient(p.x, footY, 0, p.x, footY, 34);
      g.addColorStop(0, `rgba(180,110,255,${a})`); g.addColorStop(1, 'rgba(180,110,255,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(p.x, footY, 34, 14, 0, 0, Math.PI * 2); ctx.fill();
    }
  }
}
