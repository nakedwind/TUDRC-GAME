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
       tick(api, dt, f) {},  // 播的時候每一幀做一次（不是畫東西，例如冒光點）
       preview(ctx, m) {},   // 編輯器中間的地圖：跑到這一行之後一直畫（m＝地圖；留下來的畫面才需要，沒寫就不畫）
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

// 第 285 行：所有音效都停掉，日光燈的嗡嗡聲、跳電聲也不出聲，直到第 303 行才恢復（不用框範圍）
STORY_KAI_FX['fx_mw42huykaqf'] = {
  time: .1, noBox: true,
  start(api) { api.stopAllSounds(); api.ambient(false); },
  draw() {},
};

// 第 303 行：紅光、血漬全部消失，同伴床藏起來，日光燈的嗡嗡聲、跳電聲恢復，燈也回到平常會閃、會跳電的樣子
STORY_KAI_FX['fx_mw42sf67get'] = {
  time: .1,
  start(api, f) {
    api.clearFx();
    api.layer(COLYN_BED_LAYER, false);
    // 清乾淨之後，只留柯林身體下的血灘（這一行在黑幕淡出之前，所以一亮起來就在那裡）
    const colyn = api.actor(1);
    if (colyn) { const pool = bodyPool(colyn); api.keep('ground', ctx => drawFloorBlood(ctx, [pool])); }
    api.ambient(true);
    for (const L of api.lamps(f)) {   // 第 236 行讓燈一直亮著：這裡把計時放回去
      L.flick = null; L.on = true;
      L.blinkT = flickRand(FLICKER.blinkEvery); L.outT = flickRand(FLICKER.outEvery);
    }
  },
  draw() {},
};

// 第 315 行：塔納疏導柯林：戰鬥用的疏導特效（js/attack-fx.js、js/soothe-fx-v2.js），顏色是塔納的「特效顏色」（角色資料頁），演 2.5 秒
const TAANA_SOOTHE = { time: 2.5, blessAt: 1 };   // blessAt：開始幾秒後柯林身上出現光環（光環演 1.5 秒，剛好 2.5 秒結束）
// 剛冒出來的光點（G.effects 第 from 個之後）：壽命不超過特效剩下的時間，到結束時剛好淡掉
function endMotesBy(from, left) { for (const e of G.effects.slice(from)) if (e.mote && e.life > left) e.life = e.life0 = Math.max(.05, left); }
STORY_KAI_FX['fx_mw43v02jhqn'] = {
  time: TAANA_SOOTHE.time,
  start(api) {
    const taana = api.actor(2), colyn = api.actor(1), col = SOOTHE_COLORS.taana; if (!taana || !colyn || !col) return;
    taana.dir = 'back';   // 治療的時候背對鏡頭，特效結束才轉回朝右（快轉時 after 馬上做，直接是朝右）
    api.after(TAANA_SOOTHE.time, () => { taana.dir = 'right'; });
    if (api.skipping) return;   // 快轉經過：光就不用演了
    spawnSootheCast(taana, col, 3 * CELL, TAANA_SOOTHE.time);   // 塔納腳下的法陣、光柱、往外的光波
    api.after(TAANA_SOOTHE.blessAt, () => {   // 柯林身上的光環、光帶、光點
      const from = G.effects.length; spawnSootheEffect(colyn.x, colyn.y - 8, col, colyn);
      endMotesBy(from, TAANA_SOOTHE.time - TAANA_SOOTHE.blessAt);
    });
  },
  tick(api, dt, f) {
    const taana = api.actor(2), colyn = api.actor(1), col = SOOTHE_MOTE_COLORS.taana;
    if (!taana || !colyn || !col) return;
    const from = G.effects.length; spawnSootheMotes([taana, colyn], col, dt, this);   // 疏導期間兩個人身邊飄小光點
    endMotesBy(from, TAANA_SOOTHE.time - f.t);
  },
  draw() {},
};

// 第 338 行：柯林說完話，日光燈的嗡嗡聲 0.5 秒淡出到無聲，跳電聲也不再響（不用框範圍）
STORY_KAI_FX['fx_mw45qk7xz2l'] = {
  time: .5, noBox: true,
  start(api) { api.ambient(false, .5); },
  draw() {},
};

// 柯回憶02 第 2 行：幽暗但安全、舒適的黃光，像睡前的氣氛。光源是床頭的桌燈，照亮大概 5 格，一直留到劇情結束
const BEDSIDE_LAMP = { x: 172, y: 100, r: 5 * 40 };   // 桌燈的燈泡在地圖上的位置（像素）、照亮的範圍
// 校色用（從你的改圖量出來的低解析度比例圖）：x0、y0＝左上角（地圖像素）、cell＝一格幾像素；每格 6 碼＝紅綠藍要留幾成（ff＝不變）
const BEDSIDE_TONE = { x0: 65.6, y0: -3.1, cell: 20.0, rows: [
  '4d4c684f4e6b54516e59546e5f586d635a6e625b705f59725b577558557656557657567758577959587a5a597b',
  '4c4a674e4c68534f6a5c556a645a6b695e6d685e6f635c725d58755956765755765655765655765857785a597b',
  '4b49654e4a645750646559657463687c696b7c6a6f746774696178605c7a5b59795856765655755856775a597a',
  '4b48634f4a625d53617462638c73699c7f6f9f8477947f7e827684736c86686583605e7d5b59795a59785c5a7a',
  '4b4861514b60645760846d67a88972c3a07fcaaa8bbda495a5969c8f889c7d79956e6c8a6362805f5e7d5f5e7d',
  '4b4861514b60675a638e776ebc9f82e0c298ebd1a8dfcab3c9bbbab0a9b79794ac807e9a6f6e8b666583646381',
  '4b4861504c62665b67907d79c2ac95e8d6b2f7eac5f1e7d0e2dbd6ccc8d1b0aec29391ab7b7a966e6d8a696885',
  '4a48634f4c65635c6d8c7f84c0b1a6e9dec6f9f4dbf9f6e5f0ede9dedbe3c2c0d2a1a0b886859f7674916f6e8b',
  '4a49654f4d68615d7388808ebdb2b3e8dfd5fbf6e9fcfbf1f6f4f3e6e4eccccbdbacabc2908faa7e7c9a767493',
  '4c4b67514f6b62607a878397bab3bee4dedff9f5f2fcfaf8f6f5f8e8e7f1d1d1e1b5b4cb9a98b48685a47d7c9d',
  '504f6c5554706766818b89a0b9b6c7e1dee6f6f4f7faf9fbf5f4fae9e8f3d5d5e6bcbbd3a3a1bf908eb08785a9',
  '5655735c5b79706f8b9391aabdbccee1e0ebf4f3f9f8f8fcf4f4fae9eaf4d8d8e9c2c1daaba9c99997bc908db5',
  '615f7f6866867c7b999e9db6c4c3d6e2e1edf3f2f9f7f7fcf3f4faeaeaf5dbdaecc7c5e0b1afd19f9dc69694c0',
  '6f6e917775978b8aa9aaa9c3cacadde3e3eff1f1f8f5f5fbf2f2f9e9e8f5dbdaedc9c7e3b4b2d7a3a0cc9a98c7',
  '807ea58886ab9b9abbb6b5cfd0cfe3e3e3f0efeef7f2f2f9efeef8e6e5f3dad8edc9c7e4b5b2daa4a2d09c99cc',
  '918eb99896bea9a7cabfbddad2d1e7e1e1f0ebeaf6eeedf7eaeaf5e2e1f2d7d6edc7c5e5b4b2dba4a1d39c99ce',
  '9d9ac7a4a2ccb2b0d5c3c2e0d2d1e9deddf0e6e5f4e9e8f5e6e5f3dedcf0d3d1eac5c3e4b3b0dba3a0d39b98cf',
  'a6a3d0acaad4b8b6dcc5c4e3d1d0e9dbdaeee2e1f2e4e3f3e1e0f1d9d8eecfcde9c3c1e3b2b0dba3a0d49b98d0',
  'aeacd6b4b2dabdbbdfc7c5e5d1cfe9d9d7eddeddf0e0dff1dddcf0d6d5eccdcbe8c2c0e3b2b0dca4a1d59d9ad2',
  'b3b1d9b9b7dcc0bee1c8c6e5d1cfe9d8d6ecdcdbf0deddf1dcdbefd4d3ebcccbe8c2c0e3b3b0dca4a1d59f9cd3',
] };
STORY_KAI_FX['fx_mw4cw1blocg'] = {
  time: .1,
  start(api) { api.keep('world', ctx => drawBedsideLight(ctx, MAP)); },
  preview(ctx, m) { drawBedsideLight(ctx, m); },
  draw() {},
};
let bedsideToneCanvas = null;
function bedsideToneImage() {   // 把比例圖畫成一張很小的圖（放大時會自動變平滑）
  if (bedsideToneCanvas) return bedsideToneCanvas;
  const { rows } = BEDSIDE_TONE, c = document.createElement('canvas'), W = rows[0].length / 6, g = c.getContext('2d');
  c.width = W; c.height = rows.length;
  const img = g.createImageData(W, rows.length);
  rows.forEach((row, y) => { for (let x = 0; x < W; x++) for (let k = 0; k < 3; k++) img.data[(y * W + x) * 4 + k] = parseInt(row.substr(x * 6 + k * 2, 2), 16); });
  for (let i = 3; i < img.data.length; i += 4) img.data[i] = 255;
  g.putImageData(img, 0, 0);
  return (bedsideToneCanvas = c);
}
function drawBedsideLight(ctx, m) {
  const { x, y, r } = BEDSIDE_LAMP, W = m.cols * 40, H = m.rows * 40;
  ctx.save();
  // 整間房乘上暖色：燈旁邊幾乎是原本的亮度，照不到的地方幽暗但還看得見
  const room = ctx.createRadialGradient(x, y, 0, x, y, r * 1.7);
  room.addColorStop(0, 'rgb(255,226,165)'); room.addColorStop(.35, 'rgb(214,170,108)'); room.addColorStop(.59, 'rgb(128,98,64)'); room.addColorStop(1, 'rgb(74,58,44)');
  ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = room; ctx.fillRect(0, 0, W, H);
  // 燈附近多一點黃色的光暈
  ctx.globalCompositeOperation = 'lighter';
  const glow = ctx.createRadialGradient(x, y, 0, x, y, r);
  glow.addColorStop(0, 'rgba(255,190,90,.3)'); glow.addColorStop(.2, 'rgba(255,175,80,.12)'); glow.addColorStop(1, 'rgba(255,170,70,0)');
  ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  // 照改圖校色：中間（地板）幾乎不變，牆和外圍壓暗，燈附近偏橘
  ctx.globalCompositeOperation = 'multiply';
  ctx.imageSmoothingEnabled = true;
  const tone = bedsideToneImage(), { x0, y0, cell, rows } = BEDSIDE_TONE;
  const tw = rows[0].length / 6 * cell, th = rows.length * cell;
  ctx.drawImage(tone, x0, y0, tw, th);
  ctx.fillStyle = 'rgb(85,85,95)'; ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.rect(x0, y0, tw, th); ctx.fill('evenodd');   // 比例圖外面（牆外）：跟邊緣差不多暗
  ctx.restore();
}

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

// 床上的痕跡：白布上的血跡、怪物爪痕（每張床照順序用固定的亂數，每次播都一樣，不會亂跳）
const BED_TILE = 'tile_mvmums35';   // 同伴床的素材（圖層裡還有地上的裂痕、灰塵，那些不畫）
const BED_CLOTH = { x0: .2, x1: .82, y0: .37, y1: .74 };   // 白布在床的圖裡的範圍（比例）
function bedBlood(stamps) {
  const rnd = seededRandom(7), C = 40, ox = typeof OX !== 'undefined' ? OX : 0, oy = typeof OY !== 'undefined' ? OY : 0, out = [];
  for (const s of stamps) {
    if (s.id !== BED_TILE) continue;
    const t = mapTileById(s.id) || {}, w = (t.w || 1) * C, h = (t.h || 1) * C, x = ox + s.c * C + (s.ox || 0), y = oy + s.r * C + (s.oy || 0);
    const at = () => [x + w * (BED_CLOTH.x0 + rnd() * (BED_CLOTH.x1 - BED_CLOTH.x0)), y + h * (BED_CLOTH.y0 + rnd() * (BED_CLOTH.y1 - BED_CLOTH.y0))];
    const bed = { blots: [], claws: [], cloth: [x + w * BED_CLOTH.x0, y + h * BED_CLOTH.y0, w * (BED_CLOTH.x1 - BED_CLOTH.x0), h * (BED_CLOTH.y1 - BED_CLOTH.y0)] };   // cloth：痕跡只畫在白布上
    for (let i = 0, n = 2 + Math.floor(rnd() * 3); i < n; i++) {   // 血跡：每張床 2～4 灘
      const [bx, by] = at(), r = 2.5 + rnd() * 6, blobs = [];
      for (let j = 0; j < 5; j++) blobs.push([bx + (rnd() - .5) * r * 1.5, by + (rnd() - .5) * r * .8, r * (.3 + rnd() * .5)]);
      bed.blots.push({ blobs, dark: rnd() < .5 });
    }
    if (rnd() < .55) {   // 怪物爪痕：3～4 條平行、細細長長的抓破痕跡（風格參考 images/破損建築/floor-crack-fork.png，不要小石塊）
      const [X, Y, W, H] = bed.cloth, cx = X + W * (.3 + rnd() * .4), cy = Y + H * (.35 + rnd() * .3), n = 3 + Math.floor(rnd() * 2), tilt = (rnd() < .5 ? -1 : 1) * (.35 + rnd() * .4), gap = 4 + rnd() * 1.5;
      const inset = 2, fit = (mx, my, dx, dy) => {   // 從 (mx, my) 往兩邊各伸 (dx, dy)：超出白布就縮短，頭尾才不會被切平
        const room = (c, d, a, b) => d ? Math.max(0, Math.min((b - inset - c) / Math.abs(d), (c - a - inset) / Math.abs(d))) : 1;
        return Math.min(1, room(mx, dx, X, X + W), room(my, dy, Y, Y + H));
      };
      for (let i = 0; i < n; i++) {
        const off = (i - (n - 1) / 2) * gap, l = 26 + rnd() * 16, mx = cx - Math.sin(tilt) * off + (rnd() - .5) * 4, my = cy + Math.cos(tilt) * off;
        const s = fit(mx, my, Math.cos(tilt) * l / 2, Math.sin(tilt) * l / 2), dx = Math.cos(tilt) * l / 2 * s, dy = Math.sin(tilt) * l / 2 * s;
        if (Math.hypot(dx, dy) < 5) continue;   // 太靠邊、放不下：這條不畫
        bed.claws.push(slashShape(mx - dx, my - dy, mx + dx, my + dy, 1.5 + rnd() * .9, rnd));
        if (rnd() < .6) {   // 小分岔（只往白布裡面長）
          const k = .3 + rnd() * .4, fx = mx - dx + dx * 2 * k, fy = my - dy + dy * 2 * k, a = tilt + (rnd() < .5 ? -1 : 1) * (.5 + rnd() * .4), fl = 5 + rnd() * 5, ex = fx + Math.cos(a) * fl, ey = fy + Math.sin(a) * fl;
          if (ex > X + inset && ex < X + W - inset && ey > Y + inset && ey < Y + H - inset) bed.claws.push(slashShape(fx, fy, ex, ey, .7, rnd));
        }
      }
    }
    out.push(bed);
  }
  return out;
}
// 一條抓破的痕跡：沿著路線稍微歪來歪去，中間最寬、頭尾都是尖的
function slashShape(x0, y0, x1, y1, width, rnd) {
  const len = Math.hypot(x1 - x0, y1 - y0) || 1, nx = -(y1 - y0) / len, ny = (x1 - x0) / len, steps = Math.max(3, Math.round(len / 4)), pts = [];
  for (let i = 0; i <= steps; i++) {
    const k = i / steps, wob = i && i < steps ? (rnd() - .5) * 1.6 : 0;
    pts.push([x0 + (x1 - x0) * k + nx * wob, y0 + (y1 - y0) * k + ny * wob, Math.sin(k * Math.PI) ** .8 * width / 2]);
  }
  return { pts, nx, ny };
}
function slashPath(ctx, c, grow) {
  ctx.beginPath();
  c.pts.forEach(([x, y, w], i) => ctx[i ? 'lineTo' : 'moveTo'](x + c.nx * w * grow, y + c.ny * w * grow));
  for (let i = c.pts.length - 1; i >= 0; i--) { const [x, y, w] = c.pts[i]; ctx.lineTo(x - c.nx * w * grow, y - c.ny * w * grow); }
  ctx.closePath();
}
function drawBedMarks(ctx, beds) {
  for (const b of beds) {
    ctx.save(); ctx.beginPath(); ctx.rect(...b.cloth); ctx.clip();
    for (const bl of b.blots) {
      ctx.fillStyle = bl.dark ? '#4a0a0b' : '#6e1214';
      ctx.beginPath(); for (const [x, y, r] of bl.blobs) { ctx.moveTo(x + r, y); ctx.ellipse(x, y, r, r * .7, 0, 0, Math.PI * 2); } ctx.fill();
    }
    for (const c of b.claws) {   // 爪痕：外面一圈暗紅（血滲開），中間深色的裂口
      ctx.fillStyle = 'rgba(110,18,20,.55)'; slashPath(ctx, c, 1.7); ctx.fill();
      ctx.fillStyle = '#1e0a0a'; slashPath(ctx, c, 1); ctx.fill();
    }
    ctx.restore();
  }
}

// 柯林身體下的血灘：以他躺著的位置為中心，頭那一邊多一點（倒地順時針＝頭朝右）
function bodyPool(a) {
  const rnd = seededRandom(23), head = a.down === 'cw' ? 1 : a.down === 'ccw' ? -1 : 0, cx = a.x + head * 16, cy = a.y + 15, blobs = [], drops = [];
  for (let i = 0; i < 10; i++) blobs.push([cx + (rnd() - .5) * 42, cy + (rnd() - .5) * 13, 6 + rnd() * 7]);
  for (let i = 0; i < 6; i++) { const k = rnd() * 6.28; drops.push([cx + Math.cos(k) * (30 + rnd() * 9), cy + Math.sin(k) * (10 + rnd() * 6), .8 + rnd() * 1.3]); }
  return { blobs, drops };
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
  ctx.save(); ctx.globalAlpha = k * .9; drawBedMarks(ctx, beds); ctx.restore();
}
