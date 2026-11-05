/* ===== 回憶劇情（改）的特效 =====
   「🎬 劇情編輯器（改）」的「＋特效」：在地圖上框一塊範圍、在「特效說明」寫下想要的效果（像聊天一樣），
   Claude 照說明把特效寫在這個檔案裡，按「從頭預覽」就看得到。
   每個特效用編輯器自動給的 id 當名字：
     STORY_KAI_FX['fx_xxxx'] = {
       time: 2,              // 播幾秒
       layer: 'top',         // 'top'＝畫在後室黑幕上面（黑暗裡也看得到，預設）；'world'＝跟場景一起被黑幕蓋住
       block: false,         // true＝等特效播完才跑下一行（預設不等）
       noBox: false,         // true＝不用框範圍（例如聲音淡出）
       start(api, f) {},     // 跑到這一行時做一次：改劇情裡的東西（燈、圖層、黑幕、角色的光……，api 見 js/story-kai.js 的 fxApi）
       draw(ctx, k, f) {},   // 每一幀畫一次：k＝播到哪（0～1）；f＝{ t: 播了幾秒, x, y, w, h: 框的範圍（像素）, cx, cy: 框的中心 }
     };
   特效永遠以框的中心點發生；框越大，特效越大。
   還沒做好的特效：遊戲裡先用一圈淡淡的閃光代替（js/story-kai.js 的 drawFxPlaceholder）。 */
const STORY_KAI_FX = {};

// ---- 柯林回憶 01 ----
const COLYN_BED_LAYER = '同伴床';   // Zk用地圖裡的圖層名稱

// 第 002 行：一開始先把「同伴床」圖層藏起來（第 204 行燈亮回來時才打開）
STORY_KAI_FX['fx_mw3x3w6o81z'] = {
  time: .1,
  start(api) { api.layer(COLYN_BED_LAYER, false); },
  draw() {},
};

// 第 200 行：燈管閃兩下，突然跳電 → 全黑，柯林的光也熄掉；燈不會再自己亮回來
STORY_KAI_FX['fx_mw3wpucgvef'] = {
  time: 1.3, block: true,   // 黑掉之後停一下，才出下一句對白
  start(api, f) {
    const lamps = api.lamps(f), outAt = .36;
    for (const L of lamps) {
      // [亮不亮, 幾秒]：暗、亮、暗、亮，最後一直暗下去（1e9 秒＝不會再亮）
      L.flick = { t: 0, steps: api.skipping ? [[false, 1e9]] : [[false, .07], [true, .09], [false, .06], [true, .14], [false, 1e9]] };
      if (api.skipping) L.on = false;
    }
    api.after(outAt, () => {
      for (const L of lamps) api.zap(L);
      const a = api.actor(1); if (a) { a.fxSavedLight = a.light || a.fxSavedLight || 0; a.light = 0; }
      api.black(1, 0);
    });
  },
  draw() {},
};

// 第 204 行：燈管很快閃兩下就全亮（柯林的光也回來），同伴床出現；整間房被暗紅色的光罩住，像鮮血未乾的停屍間，床上有血漬
STORY_KAI_FX['fx_mw3x3c090pw'] = {
  time: 1.2,
  start(api, f) {
    const lamps = api.lamps(f), onAt = .23;
    api.black(0, 0);                       // 拿掉第 200 行的全黑（黑暗裡先看得到燈在閃）
    api.layer(COLYN_BED_LAYER, true);      // 床在閃光裡就已經在那裡了
    for (const L of lamps) {
      L.flick = { t: 0, steps: api.skipping ? [] : [[true, .05], [false, .06], [true, .05], [false, .07]] };   // 閃完就一直亮著
      L.blinkT = L.outT = 1e9;             // 之後不再閃、不再跳電
      if (api.skipping) { L.on = true; L.flick = null; }
    }
    const beds = bedBlood(api.layerStamps(COLYN_BED_LAYER).stamps);
    // 地上的血漬、牆上流下來的血：跟床一樣，閃光裡就已經在那裡了（牆上的血跟牆一起排上下，人走到牆前面會擋住它）
    const floor = floorBlood();
    api.keep('ground', ctx => drawFloorBlood(ctx, floor));
    api.keep('sorted', (ctx, t) => drawWallBlood(ctx, BACK_WALL_DRIPS, t), 6 * 40);
    api.keep('sorted', (ctx, t) => drawWallBlood(ctx, FRONT_WALL_DRIPS, t), 14.75 * 40);
    api.after(onAt, () => {
      const a = api.actor(1); if (a && a.fxSavedLight) a.light = a.fxSavedLight;
      api.light(f.cx, f.cy, Math.max(f.w, f.h) * .62);   // 燈全開：整間房都照得到
      api.keep('world', (ctx, t) => drawMorgue(ctx, f, beds, api.skipping ? 1 : Math.min(1, t / .5), t));
    });
  },
  draw() {},
};

// 第 256 行：心跳聲在 0.8 秒內淡出到無聲（不用框範圍，下一行照常接著跑）
STORY_KAI_FX['fx_mw3yf1j82i2'] = {
  time: .8, noBox: true,
  start(api) { api.fadeLoop('音效素材/心跳.mp3', .8); },
  draw() {},
};

const seededRandom = seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647;

// 地上的血漬：走道上幾灘大的、旁邊幾滴小的（格子座標，位置固定）
const FLOOR_POOLS = [[32.3, 6.5, 1.3], [33.2, 7.6, .8], [32.1, 8.7, 1.5], [33.3, 9.8, 1.1], [32.5, 10.9, 1.6], [33.5, 11.4, .7], [31.95, 11.3, .6], [32.9, 6.05, .6]];
function floorBlood() {
  const rnd = seededRandom(41), C = 40, out = [];
  for (const [cx, cy, size] of FLOOR_POOLS) {
    const blobs = [], n = 4 + Math.floor(rnd() * 4), r = size * 11;
    for (let i = 0; i < n; i++) blobs.push([cx * C + (rnd() - .5) * r * 1.8, cy * C + (rnd() - .5) * r * .9, r * (.3 + rnd() * .45)]);
    const drops = [];
    for (let i = 0; i < 5; i++) { const a = rnd() * Math.PI * 2, d = r * (1 + rnd() * .9); drops.push([cx * C + Math.cos(a) * d, cy * C + Math.sin(a) * d * .55, .8 + rnd() * 1.6]); }
    out.push({ blobs, drops });
  }
  return out;
}
function drawFloorBlood(ctx, pools) {
  const blob = (list, grow) => { ctx.beginPath(); for (const [x, y, r] of list) { ctx.moveTo(x + r + grow, y); ctx.ellipse(x, y, r + grow, (r + grow) * .62, 0, 0, Math.PI * 2); } ctx.fill(); };
  for (const p of pools) {
    ctx.fillStyle = '#590e05'; blob(p.blobs, 1.2);   // 暗一點的邊（跟滴血同色系）
    ctx.fillStyle = '#7c1c16'; blob(p.blobs, 0);
    ctx.fillStyle = '#6a140f'; blob(p.drops, 0);
  }
}

// 牆上流下來的血：[x, 從哪裡開始流, 流到哪裡, 幾像素寬]（格子座標；避開門）。一開始流到一部分，之後慢慢往下流、越來越慢
function makeDrip([x, y0, y1, w], i) {
  const rnd = seededRandom(97 + i * 13), bends = [];   // 流的路線稍微歪來歪去，才不會像尺畫的直線
  for (let y = 10 + rnd() * 10; y < (y1 - y0) * 40; y += 9 + rnd() * 14) bends.push([y, Math.round((rnd() - .5) * 3)]);
  return { x: x * 40, y0: y0 * 40, len: (y1 - y0) * 40, w, bends, slow: 5 + rnd() * 9, top: 3 + rnd() * 4 };
}
const BACK_WALL_DRIPS = [[29.95, 3.6, 4.9, 3], [30.25, 3.9, 4.6, 2], [32.05, 3.5, 5.15, 3], [32.4, 4.1, 4.8, 2], [33.1, 4.2, 5.2, 4], [33.45, 4.3, 4.85, 2], [34.15, 3.7, 4.7, 2], [35.05, 3.5, 5.1, 3], [35.45, 3.9, 4.5, 2]].map(makeDrip);
const FRONT_WALL_DRIPS = [[30.1, 12.3, 13.7, 3], [30.6, 12.5, 13.3, 2], [31.3, 12.25, 14, 4], [31.9, 12.6, 13.4, 2], [32.7, 12.3, 13.8, 3], [33.3, 12.5, 13.2, 2], [35.4, 12.3, 13.6, 3]].map(makeDrip);
function drawWallBlood(ctx, drips, t) {
  for (const d of drips) {
    const len = d.len * (.25 + .75 * (1 - Math.exp(-t / d.slow)));   // 越流越慢
    ctx.fillStyle = '#590e05'; ctx.beginPath(); ctx.ellipse(d.x, d.y0, d.top + 1, (d.top + 1) * .7, 0, 0, Math.PI * 2); ctx.fill();   // 上面那一灘
    ctx.fillStyle = '#7c1c16'; ctx.beginPath(); ctx.ellipse(d.x, d.y0, d.top, d.top * .7, 0, 0, Math.PI * 2); ctx.fill();
    let y = 0, dx = 0;
    for (const [by, bx] of [...d.bends, [Infinity, 0]]) {   // 一段一段往下畫，到現在流到的地方為止
      const end = Math.min(by, len);
      if (end > y) { ctx.fillStyle = '#590e05'; ctx.fillRect(d.x + dx - d.w / 2 - .5, d.y0 + y, d.w + 1, end - y); ctx.fillStyle = '#7c1c16'; ctx.fillRect(d.x + dx - d.w / 2, d.y0 + y, d.w, end - y); y = end; }
      if (by >= len) break;
      dx += bx;
    }
    ctx.fillStyle = '#7c1c16'; ctx.beginPath(); ctx.ellipse(d.x + dx, d.y0 + len, d.w * .75, d.w, 0, 0, Math.PI * 2); ctx.fill();   // 往下流的那一滴
  }
}

// 床上的血漬：每張床幾灘，位置固定（每次播都一樣，不會亂跳）
function bedBlood(stamps) {
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const ox = typeof OX !== 'undefined' ? OX : 0, oy = typeof OY !== 'undefined' ? OY : 0, C = typeof CELL !== 'undefined' ? CELL : 40;
  const out = [];
  for (const s of stamps) {
    const t = typeof mapTileById === 'function' ? mapTileById(s.id) || {} : {}, w = (t.w || 1) * C, h = (t.h || 1) * C;
    const x = ox + s.c * C + (s.ox || 0), y = oy + s.r * C + (s.oy || 0);
    for (let i = 0, n = rnd() < .35 ? 0 : 1 + Math.floor(rnd() * 2); i < n; i++) {
      const r = 3 + rnd() * 6, blobs = [];
      for (let j = 0; j < 5; j++) blobs.push([(rnd() - .5) * r * 1.4, (rnd() - .5) * r * .9, r * (.35 + rnd() * .5)]);
      out.push({ x: x + w * (.3 + rnd() * .4), y: y + h * (.35 + rnd() * .45), r, blobs, dark: rnd() < .5 });
    }
  }
  return out;
}

// 停屍間的紅光：整間房乘上暗紅色（中間最紅、邊緣淡掉），微微一明一暗；床上畫血漬
function drawMorgue(ctx, f, beds, k, t) {
  const pulse = .88 + .12 * Math.sin(t * 1.4) * Math.sin(t * .53 + 1);
  ctx.save();
  ctx.translate(f.cx, f.cy); ctx.scale(f.w / Math.max(f.w, f.h), f.h / Math.max(f.w, f.h));
  const R = Math.max(f.w, f.h) * .75, g = ctx.createRadialGradient(0, 0, R * .15, 0, 0, R);
  g.addColorStop(0, 'rgb(165,38,40)'); g.addColorStop(.7, 'rgb(190,70,70)'); g.addColorStop(1, 'rgb(255,255,255)');   // 白＝不變色
  ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = k * pulse; ctx.fillStyle = g;
  ctx.fillRect(-R, -R, R * 2, R * 2);
  ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = k * .1 * pulse;   // 一點點紅色的光暈，看起來像是紅光而不只是變暗
  const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, R * .8);
  glow.addColorStop(0, 'rgba(255,40,40,1)'); glow.addColorStop(1, 'rgba(255,40,40,0)');
  ctx.fillStyle = glow; ctx.fillRect(-R, -R, R * 2, R * 2);
  ctx.restore();
  ctx.save(); ctx.globalAlpha = k * .9;
  for (const b of beds) {
    ctx.fillStyle = b.dark ? '#4a0a0b' : '#6e1214';
    ctx.beginPath(); for (const [dx, dy, r] of b.blobs) { ctx.moveTo(b.x + dx + r, b.y + dy); ctx.ellipse(b.x + dx, b.y + dy, r, r * .7, 0, 0, Math.PI * 2); } ctx.fill();
  }
  ctx.restore();
}
