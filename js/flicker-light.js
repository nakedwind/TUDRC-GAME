// ============================================================
//  不穩定的日光燈（地圖素材 images/background/electric-light.png）
//  ・會發光（算是真的光源：照亮的地方可以蓋建築、看得到怪物）
//  ・不穩定：平常偶爾閃一下；有時候「跳電」整個熄掉幾秒，再閃幾下才亮回來
//  ・靠近時聽得到嗡嗡的電流聲；偶爾會噴出電光火花
//  （數值集中在最上面，想調整改這裡就好）
// ============================================================
const FLICKER = {
  file: 'electric-light.png',     // 哪張素材算日光燈
  radius: 180,                     // 亮著時的照明半徑（像素）
  tube: { dx: 39, dy: 36 },        // 燈管在圖片裡的位置（從圖片左上角算，像素）
  blinkEvery: [3, 9],              // 平常每隔幾秒閃一下（隨機範圍）
  outEvery: [20, 50],              // 每隔幾秒跳電一次
  outFor: [10, 40],                // 跳電熄掉幾秒
  sparkEvery: [15, 60],            // 每隔幾秒噴一次火花
  humRange: 18,                     // 幾格內聽得到嗡嗡聲
  humVolume: 0.08,                 // 嗡嗡聲最大音量（小數要寫成 0.15 這樣，只能有一個小數點）
  // 其他長得不一樣的燈管：檔名 → 燈管在圖片裡的位置（寬、高的比例）、燈管半長（寬的比例）、光暈圖（疊在燈上、跟著亮暗）
  // 地圖上跟燈疊在同一個位置的光暈圖物件，改由這裡畫（亮著才發光、畫在黑幕上面），不會被黑幕蓋掉
  variants: [
    { file: /Poolcore_LED\.png$/i, tube: { fx: .5, fy: .4 }, half: .4, glow: 'images/Poolcore/Poolcore_LED_glow.png' },   // 池核的 LED 燈
  ],
};
const flickerVariantOf = t => t && FLICKER.variants.find(v => v.file.test(String(t.file || '')) || v.file.test(String(t.name || '') + '.png'));
const flickerGlowImgs = {};
const flickerGlowImg = src => flickerGlowImgs[src] || (flickerGlowImgs[src] = Object.assign(new Image(), { src }));
const flickRand = ([a, b]) => a + Math.random() * (b - a);

// ---- 找出地圖上所有日光燈（每次換地圖／重新開始時重建）----
function flickerLights() {
  if (!G || typeof MAP === 'undefined' || !MAP) return [];
  if (G.flickerLights && G.flickerLightsMap === MAP) return G.flickerLights;
  const list = [];
  // 認得日光燈的方式：素材 id、檔名、或素材名稱（在編輯器直接上傳的圖片沒有檔名，只能靠名稱認）
  const isTube = id => {
    if (typeof isPoweredLightTile==='function'&&isPoweredLightTile(mapTileById(id)))return false;
    if (id === 'tile_bg_electric_light') return true;
    const t = typeof mapTileById === 'function' && mapTileById(id); if (!t) return false;
    if (flickerVariantOf(t)) return true;
    const file = String(t.file || '').startsWith('data:') ? '' : String(t.file || '');
    return file.includes(FLICKER.file) || /electric-light|日光燈/i.test(String(t.name || ''));
  };
  const glowOwned = new Set();
  const add = (left, top, fx, id) => {
    const t = mapTileById(id), v = flickerVariantOf(t), w = t ? mapTileW(t) * CELL : 80, h = t ? mapTileH(t) * CELL : 80;
    const x = v ? left + w * (fx ? 1 - v.tube.fx : v.tube.fx) : left + (fx ? 80 - FLICKER.tube.dx : FLICKER.tube.dx), y = v ? top + h * v.tube.fy : top + FLICKER.tube.dy;
    if (v && v.glow) for (const s of MAP.stamps || []) {   // 疊在同一個位置的光暈圖物件：這裡接手畫
      const gt = mapTileById(s.id);
      if (gt && String(gt.file || '').endsWith(v.glow.split('/').pop()) && Math.abs(OX + s.c * CELL + (s.ox || 0) - left) < 6 && Math.abs(OY + s.r * CELL + (s.oy || 0) - top) < 6) glowOwned.add(s);
    }
    list.push({
    x, y, half: v ? w * v.half : 19, glow: v && v.glow ? { src: v.glow, left, top, w, h, fx } : null,
    on: true, level: 1, blinkT: flickRand(FLICKER.blinkEvery), outT: flickRand(FLICKER.outEvery), sparkT: flickRand(FLICKER.sparkEvery),
    flick: null, seed: Math.random() * 10,
  });
  };
  for (const layer of Object.values(MAP.layers || {}))
    for (const [key, id] of Object.entries(layer)) if (isTube(id)) { const [c, r] = key.split(',').map(Number); add(OX + c * CELL, OY + r * CELL, false, id); }
  for (const s of MAP.stamps || []) if (isTube(s.id)) add(OX + s.c * CELL + (s.ox || 0), OY + s.r * CELL + (s.oy || 0), s.fx, s.id);
  G.flickerLights = list; G.flickerLightsMap = MAP; G.elecArcs = []; G.flickerGlowStamps = glowOwned;
  return list;
}

// ---- 每幀更新（在 update 裡呼叫）----
// 這張地圖的異質核心被打破了：日光燈穩定下來，一直亮著
const flickerStable = () => !!(G && G.cores && G.cores.some(c => c.dead));
function updateFlickerLights(dt) {
  const stable = flickerStable();
  for (const L of flickerLights()) {
    if (stable) { L.flick = null; L.on = true; L.level = 1; continue; }
    if (L.flick) {   // 正在閃：照一串「亮／暗」的節奏走完
      L.flick.t -= dt;
      while (L.flick && L.flick.t <= 0) {
        const step = L.flick.steps.shift();
        if (!step) { L.flick = null; L.on = true; break; }
        L.on = step[0]; L.flick.t += step[1];
      }
    } else {
      L.blinkT -= dt; L.outT -= dt;
      if (L.outT <= 0) {   // 跳電：啪一聲熄掉，暗幾秒，再閃幾下才亮回來
        L.outT = flickRand(FLICKER.outEvery); L.blinkT = flickRand(FLICKER.blinkEvery);
        playZap(L);   // 跳電：只有「啪」一聲（火花只照 sparkEvery 的時間噴）
        const steps = [[false, flickRand(FLICKER.outFor)]];
        for (let i = 0; i < 3 + Math.floor(Math.random() * 3); i++) steps.push([true, .05 + Math.random() * .12], [false, .06 + Math.random() * .25]);
        L.flick = { t: 0, steps };
      } else if (L.blinkT <= 0) {   // 平常的小閃爍
        L.blinkT = flickRand(FLICKER.blinkEvery);
        const steps = [];
        for (let i = 0; i < 1 + Math.floor(Math.random() * 3); i++) steps.push([false, .04 + Math.random() * .08], [true, .04 + Math.random() * .1]);
        L.flick = { t: 0, steps };
      }
    }
    L.sparkT -= dt;
    if (L.sparkT <= 0) { L.sparkT = flickRand(FLICKER.sparkEvery); zapSpark(L, 4 + Math.floor(Math.random() * 4)); }
    L.level = L.on ? .88 + .12 * Math.sin(performance.now() / 1000 * 47 + L.seed) : 0;   // 亮著時也有細微的電流抖動
  }
  if (G.elecArcs) { for (const a of G.elecArcs) a.life -= dt; G.elecArcs = G.elecArcs.filter(a => a.life > 0); }
  updateFlickerHum();
}

// ---- 電光火花：往下噴的藍白火星＋一小段鋸齒電弧＋滋滋聲 ----
function zapSpark(L, n) {
  for (let i = 0; i < n; i++) {
    const a = Math.PI / 2 + (Math.random() - .5) * 2.2, sp = 50 + Math.random() * 110;
    G.effects.push({ ember: true, spark: true, x: L.x + (Math.random() - .5) * 30, y: L.y + 2, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
      r: 1 + Math.random() * 1.6, life: .3 + Math.random() * .35, life0: .65, color: Math.random() < .5 ? '#bfe8ff' : '#fff6c8' });
  }
  const pts = [], x0 = L.x + (Math.random() - .5) * 26;
  for (let i = 0; i < 6; i++) pts.push([x0 + (Math.random() - .5) * 14, L.y + i * (4 + Math.random() * 3)]);
  (G.elecArcs = G.elecArcs || []).push({ pts, life: .12, life0: .12 });
  if (typeof addLightFlash === 'function') addLightFlash('lightning', L.x, L.y, .5);
  playZap(L);
}

// ---- 光源（js/lighting.js 的 getLights 會呼叫）：亮著時才算光 ----
function flickerLightSources() {
  return flickerLights().filter(L => L.on).map(L => ({ x: L.x, y: L.y + 20, visualX: L.x, visualY: L.y, r: FLICKER.radius * (.95 + .05 * L.level) }));
}

// ---- 繪製：燈管的光暈與電弧（畫在黑幕上面，才看得出是在發光）----
function drawFlickerLights(ctx) {
  const list = flickerLights(); if (!list.length) return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (const L of list) {
    if (L.level <= 0) continue;
    const k = L.level;
    // 燈管周圍的光暈：壓扁成橢圓，漸層一路淡到 0，邊緣不會有一圈銳利的線
    ctx.save(); ctx.translate(L.x, L.y + 6); ctx.scale(1.25, .8);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 80);
    g.addColorStop(0, `rgba(255,248,210,${.34 * k})`); g.addColorStop(.25, `rgba(240,240,225,${.16 * k})`);
    g.addColorStop(.6, `rgba(210,225,255,${.05 * k})`); g.addColorStop(1, 'rgba(200,220,255,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 80, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.fillStyle = `rgba(255,255,235,${.85 * k})`; ctx.fillRect(L.x - L.half, L.y - 1.5, L.half * 2, 3);   // 燈管本身發亮
    if (L.glow) {   // 有自己的光暈圖（池核 LED）：亮著時疊上去，跟著閃
      const img = flickerGlowImg(L.glow.src), g = L.glow;
      if (img.complete && img.naturalWidth) { ctx.globalAlpha = k; ctx.save(); if (g.fx) { ctx.translate(g.left * 2 + g.w, 0); ctx.scale(-1, 1); } ctx.drawImage(img, g.left, g.top, g.w, g.h); ctx.restore(); ctx.globalAlpha = 1; }
    }
  }
  for (const a of G.elecArcs || []) {   // 鋸齒電弧
    const k = a.life / a.life0;
    ctx.strokeStyle = `rgba(190,235,255,${k})`; ctx.lineWidth = 2; ctx.shadowColor = '#9fdcff'; ctx.shadowBlur = 8;
    ctx.beginPath(); a.pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
    ctx.strokeStyle = `rgba(255,255,255,${k})`; ctx.lineWidth = .8; ctx.stroke();
  }
  ctx.restore();
}

// ---- 聲音：嗡嗡的電流聲（靠近才聽得到、熄掉時停）與火花的滋滋聲；用 Web Audio 即時合成 ----
let humAudio = null;
function humContext() {
  if (humAudio) return humAudio;
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
  const ctx = new AC(), out = ctx.createGain(); out.gain.value = 0; out.connect(ctx.destination);
  const wobNode = ctx.createGain(); wobNode.gain.value = .75; wobNode.connect(out);   // 忽大忽小的不安感（.5～1 之間晃）
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900; lp.connect(wobNode);
  [[120, 'sawtooth', .5], [240, 'square', .12], [360, 'sine', .08]].forEach(([f, type, v]) => {   // 市電 60Hz 的倍頻：日光燈特有的嗡嗡聲
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.value = f; g.gain.value = v; o.connect(g); g.connect(lp); o.start();
  });
  const wob = ctx.createOscillator(), wobG = ctx.createGain(); wob.frequency.value = 6.3; wobG.gain.value = .25; wob.connect(wobG); wobG.connect(wobNode.gain); wob.start();
  humAudio = { ctx, out };
  const resume = () => { if (ctx.state === 'suspended') ctx.resume(); };
  window.addEventListener('pointerdown', resume); window.addEventListener('keydown', resume);
  return humAudio;
}
// 聽聲音的位置：玩家；回憶劇情裡沒有玩家，改用鏡頭中心（js/story-scene.js）
const flickerListener = () => G.player || (window.STORY_MODE && typeof StoryScene !== 'undefined' ? StoryScene.listener() : null);
const flickerQuiet = () => MAP_SAFE && !MAP_STORY && !window.STORY_MODE;   // 應變中心（安全區）沒有嗡嗡聲；回憶劇情的地圖也算安全區，但要聽得到
let humUpdatedAt = 0;   // 上一次照遊戲畫面更新嗡嗡聲的時間（遊戲邏輯停住時，下面的計時器會把聲音關掉）
function updateFlickerHum() {
  const list = flickerLights(), p = flickerListener();
  humUpdatedAt = performance.now();
  let best = 0;
  if (p && list.length && !flickerQuiet()) for (const L of list) {   // 應變中心（安全區）：不會有嗡嗡聲
    if (!L.on) continue;
    const d = Math.hypot(L.x - p.x, L.y - p.y) / CELL;
    best = Math.max(best, Math.max(0, 1 - d / FLICKER.humRange));
  }
  if (!best && !humAudio) return;
  const h = humContext(); if (!h) return;
  const enabled = (typeof SFX === 'undefined' || SFX.enabled) && !(typeof previewBgMuted === 'function' && previewBgMuted());   // 編輯器的預覽視窗可以關掉背景音（js/preview-mute.js）
  const vol = enabled ? best * best * FLICKER.humVolume * ((typeof SFX !== 'undefined' ? SFX.volume : .35) / .35) : 0;
  h.out.gain.setTargetAtTime(vol, h.ctx.currentTime, .05);
}
// 保險：遊戲邏輯沒在跑（換地圖、結算畫面、選單開著…）或回到安全區時，嗡嗡聲不會停在上一次的音量
setInterval(() => {
  if (!humAudio) return;
  const idle = performance.now() - humUpdatedAt > 300;
  if (idle || (typeof MAP_SAFE !== 'undefined' && flickerQuiet())) humAudio.out.gain.setTargetAtTime(0, humAudio.ctx.currentTime, .05);
}, 200);
function playZap(L) {
  const p = flickerListener(); if (!p || flickerQuiet()) return;
  const d = Math.hypot(L.x - p.x, L.y - p.y) / CELL; if (d > FLICKER.humRange + 4) return;
  if (typeof SFX !== 'undefined' && !SFX.enabled) return;
  const h = humContext(); if (!h || h.ctx.state !== 'running') return;
  const ctx = h.ctx, now = ctx.currentTime, len = .18;
  const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * len), ctx.sampleRate), data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (Math.random() < .25 ? 1 : .25) * Math.pow(1 - i / data.length, 2);   // 劈啪的電流噪音
  const src = ctx.createBufferSource(); src.buffer = buf;
  const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 1800;
  const g = ctx.createGain(); g.gain.value = .5 * Math.max(.15, 1 - d / (FLICKER.humRange + 4)) * ((typeof SFX !== 'undefined' ? SFX.volume : .35) / .35);
  src.connect(hp); hp.connect(g); g.connect(ctx.destination); src.start(now);
}
