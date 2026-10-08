// ============================================================
//  不穩定的日光燈（地圖素材 images/background/electric-light.png）
//  ・會發光（算是真的光源：照亮的地方可以蓋建築、看得到怪物）
//  ・不穩定：平常偶爾閃一下；有時候「跳電」整個熄掉幾秒，再閃幾下才亮回來
//  ・靠近時聽得到嗡嗡的電流聲；偶爾會噴出電光火花
//  （數值集中在最上面，想調整改這裡就好）
// ============================================================
const FLICKER = {
  file: 'electric-light.png',     // 哪張素材算日光燈
  radius: 150,                     // 亮著時的照明半徑（像素）
  tube: { dx: 39, dy: 36 },        // 燈管在圖片裡的位置（從圖片左上角算，像素）
  blinkEvery: [3, 9],              // 平常每隔幾秒閃一下（隨機範圍）
  outEvery: [14, 32],              // 每隔幾秒跳電一次
  outFor: [1.5, 4],                // 跳電熄掉幾秒
  sparkEvery: [4, 12],             // 每隔幾秒噴一次火花
  humRange: 6,                     // 幾格內聽得到嗡嗡聲
  humVolume: .05,                  // 嗡嗡聲最大音量
};
const flickRand = ([a, b]) => a + Math.random() * (b - a);

// ---- 找出地圖上所有日光燈（每次換地圖／重新開始時重建）----
function flickerLights() {
  if (!G || typeof MAP === 'undefined' || !MAP) return [];
  if (G.flickerLights && G.flickerLightsMap === MAP) return G.flickerLights;
  const list = [];
  const isTube = id => { const t = typeof mapTileById === 'function' && mapTileById(id); return t && String(t.file || '').includes(FLICKER.file); };
  const add = (left, top, fx) => list.push({
    x: left + (fx ? 80 - FLICKER.tube.dx : FLICKER.tube.dx), y: top + FLICKER.tube.dy,
    on: true, level: 1, blinkT: flickRand(FLICKER.blinkEvery), outT: flickRand(FLICKER.outEvery), sparkT: flickRand(FLICKER.sparkEvery),
    flick: null, seed: Math.random() * 10,
  });
  for (const layer of Object.values(MAP.layers || {}))
    for (const [key, id] of Object.entries(layer)) if (isTube(id)) { const [c, r] = key.split(',').map(Number); add(OX + c * CELL, OY + r * CELL, false); }
  for (const s of MAP.stamps || []) if (isTube(s.id)) add(OX + s.c * CELL + (s.ox || 0), OY + s.r * CELL + (s.oy || 0), s.fx);
  G.flickerLights = list; G.flickerLightsMap = MAP; G.elecArcs = [];
  return list;
}

// ---- 每幀更新（在 update 裡呼叫）----
function updateFlickerLights(dt) {
  for (const L of flickerLights()) {
    if (L.flick) {   // 正在閃：照一串「亮／暗」的節奏走完
      L.flick.t -= dt;
      while (L.flick && L.flick.t <= 0) {
        const step = L.flick.steps.shift();
        if (!step) { L.flick = null; L.on = true; break; }
        L.on = step[0]; L.flick.t += step[1];
        if (!L.on && Math.random() < .35) zapSpark(L, 3);   // 熄掉的瞬間常常會爆一點火花
      }
    } else {
      L.blinkT -= dt; L.outT -= dt;
      if (L.outT <= 0) {   // 跳電：啪一聲熄掉，暗幾秒，再閃幾下才亮回來
        L.outT = flickRand(FLICKER.outEvery); L.blinkT = flickRand(FLICKER.blinkEvery);
        zapSpark(L, 8);
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
    let g = ctx.createRadialGradient(L.x, L.y, 0, L.x, L.y, 70);   // 燈管周圍的光暈
    g.addColorStop(0, `rgba(255,248,210,${.42 * k})`); g.addColorStop(.35, `rgba(220,235,255,${.16 * k})`); g.addColorStop(1, 'rgba(180,210,255,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(L.x, L.y + 8, 70, 46, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = `rgba(255,255,235,${.85 * k})`; ctx.fillRect(L.x - 19, L.y - 1.5, 38, 3);   // 燈管本身發亮
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
function updateFlickerHum() {
  const list = flickerLights(), p = G.player;
  let best = 0;
  if (p && list.length) for (const L of list) {
    if (!L.on) continue;
    const d = Math.hypot(L.x - p.x, L.y - p.y) / CELL;
    best = Math.max(best, Math.max(0, 1 - d / FLICKER.humRange));
  }
  if (!best && !humAudio) return;
  const h = humContext(); if (!h) return;
  const enabled = typeof SFX === 'undefined' || SFX.enabled;
  const vol = enabled ? best * best * FLICKER.humVolume * ((typeof SFX !== 'undefined' ? SFX.volume : .35) / .35) : 0;
  h.out.gain.setTargetAtTime(vol, h.ctx.currentTime, .05);
}
function playZap(L) {
  const p = G.player; if (!p) return;
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
