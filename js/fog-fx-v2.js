// ============================================================
//  森林起霧 V2：參考 pixelfx（MIT，github.com/patch-gg/pixelfx）的 weather/fog、fireflies、falling-leaves，
//  用遊戲原本的平滑風格畫。原本的霧（溫特身邊清楚、往外越濃、一團團飄的霧、營地／燒掉的霧樹那區沒霧、火海散霧）全部照舊，V2 再疊上：
//  - 貼地的薄霧帶：又長又扁的霧貼著地面飄，比霧團飄得快一點，看起來有前後層次（一樣會被營地、燒掉的霧樹那區挖掉）
//  - 螢火蟲：霧裡有幾隻黃綠色的小光點慢慢飄、一閃一閃（畫在黑幕上面，暗處也看得到；沒霧的地方不會有）
//    目前先關掉：只有 FOG_FX_V2.fireflyMaps 列出的地圖才會出現
//  - 落葉：幾片點陣圖葉子（images/森林/leaves.png）從上面晃啊晃地飄下來，邊飄邊翻面，落到地上躺一下（leafRest 秒）再淡掉；霧要變濃前起風，落葉變多、往旁邊吹
//  霧散掉的地方（營地、燒光的霧樹那一區）不會有螢火蟲和落葉。
//
//  FOG_FX_VERSION：1＝原本畫法（只有原本那套），2＝起霧 V2（原本那套＋上面這些）
// ============================================================
const FOG_FX_VERSION = 2;
const FOG_FX_V2 = {
  wisps:     { light: 6,  heavy: 10 },   // 貼地薄霧帶數量（每 1400×1400 的區域）
  fireflies: { light: 8,  heavy: 14 },   // 畫面裡大約幾隻螢火蟲
  leaves:    { light: 7,  heavy: 5 },    // 畫面裡大約幾片落葉
  leafSize: 1.2,                         // 落葉大小倍率（1＝原本）
  leafWidth: 1.5,                        // 落葉胖瘦倍率（1＝原本的細長，數字越大越胖）
  leafCount: 1.2,                        // 落葉數量倍率（乘在上面 leaves 的數字上）
  leafRest: 5,                           // 落葉飄到地上後停幾秒才消失（最後 0.8 秒淡掉）
  fireflyMaps: [],                       // 哪些地圖才有螢火蟲：填地圖名稱，例如 ['F307區']；空的＝都沒有
  leafColors: ['#6f8f3a', '#8a9a3e', '#a0863a', '#7a5a2e', '#566f2e'],
  // 點陣圖落葉：images/森林/leaves.png（每格 13×13；橫的 3 種形狀：細長、圓、心形；直的 4 種顏色：綠、橄欖、黃、褐）
  leafSheet: 'images/森林/leaves.png', leafCell: 13, leafShapes: 3,
  leafRows: [0, 0, 1, 1, 2, 3],          // 抽顏色用：0 綠、1 橄欖、2 黃、3 褐（同一個數字放越多次越常出現）
  leafPixel: 1.5,                        // 點陣圖放大幾倍（1＝原尺寸；2＝圖上一點畫成 2×2）
  windLeaves: 3,                         // 霧要變濃前起風：落葉最多變成幾倍
};
const fogV2LeafImg = new Image();
fogV2LeafImg.src = encodeURI(FOG_FX_V2.leafSheet);
const fogV2LeafReady = () => fogV2LeafImg.complete && fogV2LeafImg.naturalWidth > 0;
// 畫一片點陣圖葉子（原點在葉子中心；呼叫前先 translate／rotate／scale 好）
function fogV2LeafSprite(ctx, l) {
  const C = FOG_FX_V2, n = C.leafCell, k = C.leafPixel || 1;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(fogV2LeafImg, l.shape * n, l.row * n, n, n, -n * k / 2, -n * k / 2, n * k, n * k);
}
const fgv2R = (a, b) => a + Math.random() * (b - a);
const fogV2On = () => typeof FOG_FX_VERSION !== 'undefined' && FOG_FX_VERSION === 2 && typeof currentFogPreset === 'function' && !!currentFogPreset();

// 某一點的霧濃度（0～1，看每格的霧濃度圖；營地、燒光的霧樹那區＝0）
function fogV2DensityAt(x, y) {
  if (typeof fogMaskImg === 'undefined' || !fogMaskImg || typeof COLS === 'undefined') return 1;
  const c = Math.floor((x - OX) / CELL), r = Math.floor((y - OY) / CELL);
  if (c < 0 || r < 0 || c >= COLS || r >= ROWS) return 0;
  return fogMaskImg.data[(r * COLS + c) * 4 + 3] / 255;
}

// 貼地薄霧帶（drawFog 畫霧團之後呼叫；畫在霧的暫存圖上，之後一起被營地、霧樹那區挖掉）
const fogV2WispList = (() => {
  let seed = 777;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const list = [];
  for (let i = 0; i < 16; i++) list.push({ x: rnd() * 1400, y: rnd() * 1400, w: 380 + rnd() * 320, h: 46 + rnd() * 30, a: .5 + rnd() * .5, sp: 1.4 + rnd() * .8, ph: rnd() * 6.28, img: i % 4 });
  return list;
})();
function fogV2Wisps(fc, t, P, vx, vy, vw, vh, px, py) {
  const n = Math.min(fogV2WispList.length, (MAP && MAP.fog === 'heavy') ? FOG_FX_V2.wisps.heavy : FOG_FX_V2.wisps.light), TILE = 1400;
  for (let i = 0; i < n; i++) {
    const f = fogV2WispList[i], bx = f.x + t * P.wind * f.sp, by = f.y + Math.sin(t * .2 + f.ph) * 12;
    const x0 = Math.floor((vx - f.w - bx) / TILE), x1 = Math.floor((vx + vw + f.w - bx) / TILE), y0 = Math.floor((vy - f.h - by) / TILE), y1 = Math.floor((vy + vh + f.h - by) / TILE);
    for (let ix = x0; ix <= x1; ix++) for (let iy = y0; iy <= y1; iy++) {
      const x = bx + ix * TILE, y = by + iy * TILE, near = Math.min(1, Math.hypot(x - px, y - py) / (P.clear + 120));
      const a = P.puffAlpha * 1.1 * f.a * (.3 + .7 * near) * (.8 + .2 * Math.sin(t * .5 + f.ph));
      if (a < .01) continue;
      fc.globalAlpha = a;
      fc.drawImage(fogPuffImg(f.img), x - f.w / 2, y - f.h / 2, f.w, f.h);
    }
  }
  fc.globalAlpha = 1;
}

// 螢火蟲、落葉：跟著鏡頭，在畫面附近補到設定的數量
function updateFogV2(dt) {
  const F = G.fogV2 || (G.fogV2 = { flies: [], leaves: [], t: 0 });
  if (!fogV2On() || typeof cam === 'undefined') { F.flies.length = 0; F.leaves.length = 0; return; }
  F.t += dt;
  const heavy = MAP.fog === 'heavy', vx = cam.x, vy = cam.y, vw = viewW(), vh = viewH(), C = FOG_FX_V2;
  const inView = (x, y, m) => x > vx - m && x < vx + vw + m && y > vy - m && y < vy + vh + m;
  // 螢火蟲
  const fliesHere = (C.fireflyMaps || []).includes(MAP.name) || (C.fireflyMaps || []).includes(MAP.id);   // 只有指定的地圖才有螢火蟲
  F.flies = fliesHere ? F.flies.filter(f => inView(f.x, f.y, 120) && fogV2DensityAt(f.x, f.y) > .2) : [];
  for (let tries = 0; fliesHere && F.flies.length < (heavy ? C.fireflies.heavy : C.fireflies.light) && tries < 6; tries++) {
    const x = vx + Math.random() * vw, y = vy + Math.random() * vh;
    if (fogV2DensityAt(x, y) > .5) F.flies.push({ x, y, h: fgv2R(10, 40), ph: Math.random() * 6.28, sp: fgv2R(10, 22), blink: fgv2R(1.6, 3.2), bph: Math.random() * 6.28, a: Math.random() * 6.28 });
  }
  for (const f of F.flies) {   // 慢慢繞圈飄、上下浮
    f.a += (Math.sin(F.t * .7 + f.ph) * 1.4) * dt;
    f.x += Math.cos(f.a) * f.sp * dt; f.y += Math.sin(f.a) * f.sp * .5 * dt;
    f.h = Math.max(6, Math.min(50, f.h + Math.sin(F.t * 1.3 + f.ph) * 8 * dt));
  }
  // 落葉
  const rest = C.leafRest ?? 5;
  F.leaves = F.leaves.filter(l => l.landed ? l.restT < rest + .8 && l.x > vx - 200 && l.x < vx + vw + 200 && l.y > vy - 200 && l.y < vy + vh + 200
    : l.y < vy + vh + 40 && l.x > vx - 80 && l.x < vx + vw + 80);
  const gust = typeof fogGust === 'function' ? fogGust() : 0;   // 霧要變濃前起風（js/fog.js）：落葉變多、往旁邊吹
  const flying = F.leaves.filter(l => !l.landed).length, want = Math.round((heavy ? C.leaves.heavy : C.leaves.light) * (C.leafCount || 1) * (1 + ((C.windLeaves || 1) - 1) * gust));
  if (flying < want && Math.random() < dt * 1.5 * (C.leafCount || 1) * (1 + 3 * gust)) {
    const x = vx + Math.random() * (vw + 160) - 120, y = vy - 20 + Math.random() * vh * .7, ground = y + fgv2R(70, 220);   // 從畫面任何高度飄出來（剛出現時淡入），往下飄一小段就落地
    if (fogV2DensityAt(x, Math.min(vy + vh, ground)) > .3)
      F.leaves.push({ x, y, ground, vy: fgv2R(18, 34), sway: fgv2R(14, 28), ph: Math.random() * 6.28, spin: fgv2R(2, 4) * (Math.random() < .5 ? -1 : 1), s: fgv2R(4, 6.5) * (C.leafSize || 1), col: C.leafColors[Math.floor(Math.random() * C.leafColors.length)],
        shape: Math.floor(Math.random() * C.leafShapes), row: C.leafRows[Math.floor(Math.random() * C.leafRows.length)], landed: false, restT: 0, age: 0 });
  }
  for (const l of F.leaves) {
    if (l.landed) { l.restT += dt; continue; }
    l.age += dt; l.ph += dt * (1 + gust); l.y += l.vy * dt; l.x += (Math.cos(l.ph * 1.6) * l.sway + 10 + 70 * gust) * dt;   // 起風：吹得比較快、往右飄
    if (l.y >= l.ground) { l.landed = true; l.restAng = Math.sin(l.ph * 1.6) * .6 + fgv2R(-.6, .6); l.restFlip = Math.cos(l.ph * l.spin) >= 0 ? 1 : -1; }   // 落地：躺平
  }
}

// 落葉（世界層，黑幕之下：暗處的葉子也是暗的）
// layer：'ground'＝只畫落在地上的（js/render.js 在人物之前呼叫，葉子在人物腳下）；'air'＝只畫還在空中飄的
function drawFogV2Leaves(ctx, layer) {
  const F = G.fogV2;
  if (!F || !F.leaves.length || !fogV2On()) return;
  ctx.save();
  const rest = FOG_FX_V2.leafRest ?? 5, LW = .8 * (FOG_FX_V2.leafWidth || 1);   // LW：葉子胖瘦
  for (const l of F.leaves) {
    if (layer === 'ground' && !l.landed) continue;
    if (layer === 'air' && l.landed) continue;
    if (l.landed && fogV2LeafReady()) {   // 點陣圖：躺在地上不動，最後 0.8 秒淡掉
      const a = l.restT < rest ? 1 : Math.max(0, 1 - (l.restT - rest) / .8);
      ctx.save(); ctx.translate(Math.round(l.x), Math.round(l.y)); ctx.rotate(l.restAng); if (l.restFlip < 0) ctx.scale(-1, 1);
      ctx.globalAlpha = .9 * a; fogV2LeafSprite(ctx, l); ctx.restore(); continue;
    }
    if (!l.landed && fogV2LeafReady()) {   // 點陣圖：邊飄邊翻面（寬度變窄＝轉到側面，翻過去就鏡射）
      const flip = Math.cos(l.ph * l.spin);
      ctx.save(); ctx.translate(Math.round(l.x), Math.round(l.y)); ctx.rotate(Math.sin(l.ph * 1.6) * .6); ctx.scale(Math.sign(flip || 1) * Math.max(.2, Math.abs(flip)), 1);
      ctx.globalAlpha = .95 * Math.min(1, l.age / .5); fogV2LeafSprite(ctx, l); ctx.restore(); continue;
    }
    if (l.landed) {   // 躺在地上：不動、壓扁一點（貼地），最後 0.8 秒淡掉
      const a = l.restT < rest ? 1 : Math.max(0, 1 - (l.restT - rest) / .8);
      ctx.save(); ctx.translate(l.x, l.y); ctx.scale(1, .6); ctx.rotate(l.restAng);
      ctx.globalAlpha = .85 * a; ctx.fillStyle = l.col;
      ctx.beginPath(); ctx.moveTo(0, -l.s); ctx.quadraticCurveTo(l.s * LW, 0, 0, l.s); ctx.quadraticCurveTo(-l.s * LW, 0, 0, -l.s); ctx.fill();
      ctx.globalAlpha = .4 * a; ctx.strokeStyle = l.restFlip > 0 ? 'rgba(255,255,220,.6)' : 'rgba(0,0,0,.35)'; ctx.lineWidth = .8;
      ctx.beginPath(); ctx.moveTo(0, -l.s * .8); ctx.lineTo(0, l.s * .8); ctx.stroke();
      ctx.restore(); continue;
    }
    const flip = Math.cos(l.ph * l.spin);   // 翻面：寬度在 -1～1 之間變，看起來在轉
    ctx.save(); ctx.translate(l.x, l.y); ctx.rotate(Math.sin(l.ph * 1.6) * .6); ctx.scale(Math.max(.15, Math.abs(flip)), 1);
    ctx.globalAlpha = .9 * Math.min(1, l.age / .5); ctx.fillStyle = l.col;   // 剛出現時淡入
    ctx.beginPath(); ctx.moveTo(0, -l.s); ctx.quadraticCurveTo(l.s * LW, 0, 0, l.s); ctx.quadraticCurveTo(-l.s * LW, 0, 0, -l.s); ctx.fill();
    ctx.globalAlpha = .45; ctx.strokeStyle = flip > 0 ? 'rgba(255,255,220,.6)' : 'rgba(0,0,0,.35)'; ctx.lineWidth = .8;   // 葉脈
    ctx.beginPath(); ctx.moveTo(0, -l.s * .8); ctx.lineTo(0, l.s * .8); ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}
// 螢火蟲（畫在黑幕上面，暗處也看得到）
function drawFogV2Glow(ctx) {
  const F = G.fogV2;
  if (!F || !F.flies.length || !fogV2On()) return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (const f of F.flies) {
    const b = Math.max(0, Math.sin(F.t * Math.PI * 2 / f.blink + f.bph)), a = Math.pow(b, 2.2) * Math.min(1, fogV2DensityAt(f.x, f.y) * 1.5);
    if (a < .02) continue;
    const x = f.x, y = f.y - f.h, g = ctx.createRadialGradient(x, y, 0, x, y, 9);
    g.addColorStop(0, `rgba(210,255,120,${(.55 * a).toFixed(3)})`); g.addColorStop(1, 'rgba(170,240,90,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 9, 0, 6.283); ctx.fill();
    ctx.fillStyle = `rgba(245,255,200,${a.toFixed(3)})`; ctx.beginPath(); ctx.arc(x, y, 1.3, 0, 6.283); ctx.fill();
  }
  ctx.restore();
}
