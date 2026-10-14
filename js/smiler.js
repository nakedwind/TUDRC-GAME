// ============================================================
//  Smiler（黑暗中的笑臉）
//  ・只活在黑暗裡，打不到、也不會被消滅。
//  ・注視：偶爾在玩家附近隨機的黑暗處浮現一雙眼睛，原地看著玩家，嘴角慢慢咧開笑一下，然後消失。
//    那一格被照亮就立刻消失。
//  ・咬人：玩家或隊員（哨兵、嚮導）待在黑暗裡越久，越可能被它從黑暗中咬一口。
//  ・想調整出現頻率、傷害，改下面的 SMILER 就好。
// ============================================================
const SMILER = {
  image: 'images/monster/Smiler/smiler.png',
  size: 64,              // 畫在地圖上的大小（像素）
  eyesRows: 14,          // 圖片上方幾列是眼睛（只露眼睛時用）
  jawRow: 24,            // 從第幾列開始是下巴（笑的時候往下張開）
  jawOpen: 2.5,          // 笑的時候下巴張開幾個像素（以 40×40 原圖計）
  chuckle: 1,            // 笑的時候下巴一抖一抖的幅度
  tilt: -0.16,           // 笑的時候整張臉歪幾度（弧度；負數往左歪，約 9 度）
  skew: 0.1,             // 嘴巴歪斜的程度（一邊高一邊低）
  // 注視
  watchEvery: [18, 35],  // 每隔幾秒出現一次（隨機）
  watchDist: [4, 9],     // 離玩家幾格的黑暗處
  stare: [3, 4.5],       // 只露出眼睛盯著看幾秒
  smile: 1.2,            // 嘴巴慢慢咧開的時間（秒）
  laughHold: 4,          // 咧開嘴之後，繼續笑著看你幾秒才消失
  // 咬人
  grace: 2,              // 進到黑暗後，安全幾秒
  biteRate: 0.15,        // 安全時間過後，每秒被咬的機率
  biteRamp: 0.05,        // 在黑暗中每多待 1 秒，機率再增加多少
  biteMax: 0.45,         // 每秒機率最高到多少
  biteCd: 5,             // 被咬過之後，幾秒內不會再被咬
  playerDmg: 12,         // 咬玩家的傷害
  sentryDmg: 16,         // 咬隊員的傷害（會依防禦減少）
  woundLife: 1.1,        // 噴血特效持續幾秒
  biteLinger: 1.2,       // 咬完之後，帶著沾血的牙齒停留幾秒才消失
  shakePlayer: 7,        // 溫特被咬時畫面震動的幅度
  shakeTeammate: 0,      // 隊員被咬時畫面震動的幅度（0＝不震）
  flashTeammate: 0,      // 隊員被咬時，畫面邊框閃紅的強度（溫特被咬＝1；0＝不閃）
  laughVolume: 0.9,      // 注視時笑聲的音量（離越遠越小聲）；錄音本身很小聲，原本 0.22 會被背景白噪音蓋掉
  biteVolume: 0.8,       // 咬人音效的音量
};
const smilerImg = new Image();
let smilerBloody = null;          // 牙齒沾血版本（咬過人之後用）
smilerImg.onload = () => { try { smilerBloody = makeBloodyTeeth(smilerImg); } catch (_) { smilerBloody = null; } };   // 直接雙擊 HTML 開啟時讀不到像素：就不做沾血版
smilerImg.src = SMILER.image;
// 用原圖做一張「牙齒沾血」的版本：亮白的牙齒依每一欄不同程度染紅，有幾欄往下滴血
function makeBloodyTeeth(img) {
  const c = document.createElement('canvas'), W = c.width = img.naturalWidth, H = c.height = img.naturalHeight;
  const g = c.getContext('2d'); g.drawImage(img, 0, 0);
  const d = g.getImageData(0, 0, W, H), px = d.data, top = Math.round(SMILER.eyesRows * H / 40);
  let seed = 11; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;   // 固定的亂數：每次都長一樣
  const col = Array.from({ length: W }, () => rnd());
  const lowest = new Array(W).fill(-1);
  for (let y = top; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4; if (px[i + 3] < 40) continue;
    lowest[x] = y;
    const bright = (px[i] + px[i + 1] + px[i + 2]) / 3; if (bright < 110) continue;   // 只染牙齒（亮的地方）
    const k = col[x] > .4 ? .5 + .45 * col[x] : .18;
    px[i] = px[i] * (1 - k) + 150 * k; px[i + 1] = px[i + 1] * (1 - k) + 6 * k; px[i + 2] = px[i + 2] * (1 - k) + 16 * k;
  }
  for (let x = 0; x < W; x++) if (col[x] > .78 && lowest[x] >= 0) {   // 滴下來的血
    const len = 1 + Math.floor(col[x] * 10) % 3;
    for (let y = lowest[x] + 1; y <= Math.min(H - 1, lowest[x] + len); y++) { const i = (y * W + x) * 4; px[i] = 115; px[i + 1] = 0; px[i + 2] = 10; px[i + 3] = 230; }
  }
  g.putImageData(d, 0, 0);
  return c;
}
let smilers = [];                 // 目前畫面上的笑臉
let smilerWounds = [];            // 噴血特效
let smilerScreenFlash = null;     // 畫面邊框閃紅：{ t, strength }
let smilerWatchT = 12;            // 下一次注視還有幾秒
let smilerWarned = false;         // 這張地圖第一次被咬時提醒一次
const smilerRand = ([a, b]) => a + Math.random() * (b - a);
const smilerActive = () => G && G.running && !G.over && !MAP_SAFE && LIGHT.enabled;

// 換地圖／重新開始時清空（game.js 的 newGame 呼叫）
function resetSmilers() { smilers = []; smilerWounds = []; smilerScreenFlash = null; smilerWatchT = smilerRand([8, 16]); smilerWarned = false; }

// 找一個離玩家 min～max 格、沒被照亮、不是牆的格子
function smilerDarkSpot(x, y, min, max) {
  const [pc, pr] = cellAt(x, y);
  for (let tries = 0; tries < 40; tries++) {
    const a = Math.random() * Math.PI * 2, d = min + Math.random() * (max - min);
    const c = Math.round(pc + Math.cos(a) * d), r = Math.round(pr + Math.sin(a) * d);
    if (!inGrid(c, r) || isWall(c, r) || cellLit(c, r)) continue;
    const [cx, cy] = center(c, r);
    return { x: cx, y: cy };
  }
  return null;
}

function updateSmilers(dt) {
  if (!smilerActive()) { smilers = []; smilerWounds = []; smilerScreenFlash = null; return; }
  // 噴血、邊框閃紅的計時
  for (const w of smilerWounds) {
    w.t += dt;
    for (const d of w.drops) { d.x += d.vx * dt; d.y += d.vy * dt; d.vy += 420 * dt; }
  }
  smilerWounds = smilerWounds.filter(w => w.t < SMILER.woundLife);
  if (smilerScreenFlash && (smilerScreenFlash.t += dt) > 0.55) smilerScreenFlash = null;
  // ---- 注視 ----
  smilerWatchT -= dt;
  if (smilerWatchT <= 0 && G.player && G.player.hp > 0) {
    smilerWatchT = smilerRand(SMILER.watchEvery);
    const spot = smilerDarkSpot(G.player.x, G.player.y, SMILER.watchDist[0], SMILER.watchDist[1]);
    if (spot && !smilers.some(s => s.kind === 'watch')) smilers.push({ kind: 'watch', x: spot.x, y: spot.y, t: 0, stare: smilerRand(SMILER.stare) });
  }
  // ---- 咬人：玩家和隊員在黑暗中待太久 ----
  const victims = [];
  if (G.player && G.player.hp > 0) victims.push(G.player);
  for (const t of G.towers) if (t.hp > 0) victims.push(t);
  for (const v of victims) {
    v.smilerCd = Math.max(0, (v.smilerCd || 0) - dt);
    if (isLit(v.x, v.y)) { v.darkT = 0; continue; }
    v.darkT = (v.darkT || 0) + dt;
    if (v.darkT < SMILER.grace || v.smilerCd > 0 || smilers.some(s => s.victim === v)) continue;
    const rate = Math.min(SMILER.biteMax, SMILER.biteRate + (v.darkT - SMILER.grace) * SMILER.biteRamp);
    if (Math.random() < rate * dt) startSmilerBite(v);
  }
  // ---- 動畫 ----
  for (const s of smilers) {
    s.t += dt;
    if (s.kind === 'watch') {
      const end = 0.8 + s.stare + SMILER.smile + SMILER.laughHold;
      if (!s.laughed && !s.fading && s.t >= 0.8 + s.stare) { s.laughed = true; sfxAt('smilerLaugh', s.x, s.y, SMILER.laughVolume, 'smiler-watch'); }   // 嘴角咧開時小聲笑
      if (!s.fading && (s.t > end || isLit(s.x, s.y))) {   // 被照到就馬上消失
        s.fading = true; s.fadeT = 0; s.fadeDur = s.t > end ? 0.9 : 0.15;
        if (s.laughed) SFX.fadeOut('smilerLaugh:smiler-watch', s.t > end ? 1.2 : 0.3);   // 笑聲跟著淡出
      }
    } else if (s.kind === 'bite' && !s.bitten && s.t >= 0.35) {
      s.bitten = true; s.x = s.victim.x + s.ox; s.y = s.victim.y + s.oy;   // 咬下去的瞬間停在原地，不再跟著被咬的人
      smilerBite(s.victim, s);
    } else if (s.kind === 'bite' && s.t > 0.35 + SMILER.biteLinger && !s.fading) { s.fading = true; s.fadeT = 0; s.fadeDur = 0.5; }   // 咬完帶著血笑一下才消失
    if (s.fading) s.fadeT += dt;
  }
  smilers = smilers.filter(s => !s.fading || s.fadeT < s.fadeDur);
}
function startSmilerBite(v) {
  const a = Math.random() * Math.PI * 2;
  smilers.push({ kind: 'bite', victim: v, ox: Math.cos(a) * 26, oy: Math.sin(a) * 18 - 10, t: 0 });
}
function smilerBite(v, s) {
  v.smilerCd = SMILER.biteCd;
  if (v.hp <= 0) return;
  const isPlayer = v === G.player;
  const dmg = isPlayer ? SMILER.playerDmg : SMILER.sentryDmg * (1 - sentryDefense(v));
  v.hp = Math.max(0, v.hp - dmg);
  v.hitT = Math.max(v.hitT || 0, .3); v.hitColor = '#ff3b4f';
  if (isPlayer) playPlayerHit(1, true);   // 咬到溫特：跟其他怪物一樣用溫特被打中的音效
  else sfxAt('smilerBite', v.x, v.y, SMILER.biteVolume, 'smiler');   // 咬到隊員：咬人音效（js/sfx.js 的 smilerBite）
  // 噴血（跟著被咬的人）；畫面震一下；溫特被咬時畫面邊框閃紅一次
  const drops = Array.from({ length: 9 }, () => { const a = -Math.PI / 2 + (Math.random() - .5) * 2.4, sp = 70 + Math.random() * 110; return { x: 0, y: 0, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: 1.6 + Math.random() * 2 }; });
  smilerWounds.push({ x: v.x, y: v.y - 14, t: 0, drops });   // 血噴在咬的位置，不跟著人走
  addShake(isPlayer ? SMILER.shakePlayer : SMILER.shakeTeammate);
  const strength = isPlayer ? 1 : SMILER.flashTeammate;
  if (strength > 0 && (!smilerScreenFlash || smilerScreenFlash.strength <= strength)) smilerScreenFlash = { t: 0, strength };
  flashDmg('-' + Math.round(dmg), v.x, v.y - 30, '#ff5b6e');
  if (!smilerWarned) { smilerWarned = true; systemNotice('黑暗裡有東西……待在亮處！', true); }
  if (isPlayer) {
    flash('被咬了！', v.x, v.y - 58, '#ff5b6e');
    if (v.hp <= 0 && !G.over) { flash('部隊長失去戰鬥能力', v.x, v.y - 58, '#ff5b6e'); lose('player', '在黑暗中被 Smiler 咬傷'); }
  } else {
    if (v.hp <= 0) { v.target = null; sentryStatus(v, '失去戰鬥能力', '#ff5b6e', true); }
    else v.say = { text: '……！什麼東西咬我！', life: 2.2 };
  }
}

// ---- 畫在黑幕上面（黑暗中也看得到）；render.js 呼叫 ----
// 圖片拆成三塊來動：眼睛（0～eyesRows 列）、上排牙齒（到 jawRow 列）、下巴（jawRow 列以下）
const smilerEase = p => 1 - Math.pow(1 - Math.max(0, Math.min(1, p)), 3);
function drawSmilers(ctx) {
  if ((!smilers.length && !smilerWounds.length) || !smilerImg.complete || !smilerImg.naturalWidth) return;
  const W = smilerImg.naturalWidth, H = smilerImg.naturalHeight, u = H / 40;
  const eyeH = Math.round(SMILER.eyesRows * u), jawY = Math.round(SMILER.jawRow * u);
  ctx.save(); ctx.imageSmoothingEnabled = false;
  for (const s of smilers) {
    const fade = s.fading ? Math.max(0, 1 - s.fadeT / s.fadeDur) : 1;
    let x = s.x, y = s.y, size = SMILER.size, eyes = 1, mouth = 0, open = 0, tilt = 0, skew = 0;
    if (s.kind === 'watch') {
      eyes = Math.min(1, s.t / 0.8);                                         // 眼睛慢慢亮起來
      const lt = s.t - 0.8 - s.stare;                                        // 開始笑之後過了幾秒
      mouth = Math.max(0, Math.min(1, lt / SMILER.smile));                   // 嘴角咧開
      const p = smilerEase(lt / 0.45);
      open = p * SMILER.jawOpen + (lt > 0 ? Math.abs(Math.sin(lt * 24)) * SMILER.chuckle * p : 0);   // 下巴張開，笑的時候一抖一抖
      tilt = p * SMILER.tilt;                                                // 整張臉歪一邊
      skew = p * SMILER.skew;                                                // 嘴巴一邊高一邊低
    } else {
      if (!s.bitten) { x = s.victim.x + s.ox; y = s.victim.y + s.oy; }   // 撲上來時跟著目標；咬下去之後停在原地
      mouth = Math.min(1, s.t / 0.25);
      size *= 1 + Math.min(1, s.t / 0.35) * 0.35;                            // 撲上來：突然變大
      const after = s.t - 0.35;                                              // 咬下去之後過了幾秒
      open = !s.bitten ? smilerEase(s.t / 0.3) * SMILER.jawOpen * 2           // 張大嘴，咬下去的瞬間闔上
        : after < 0.15 ? 0 : SMILER.jawOpen * 0.6 + Math.abs(Math.sin(after * 22)) * SMILER.chuckle;   // 咬完：咧著沾血的牙齒笑
      tilt = SMILER.tilt * 0.6;
      if (!s.bitten) { x += (Math.random() - .5) * 3; y += (Math.random() - .5) * 3; }
    }
    const k = size / W, half = size / 2;
    const img = s.kind === 'bite' && s.bitten && smilerBloody ? smilerBloody : smilerImg;   // 咬過之後牙齒沾血
    ctx.save();
    ctx.translate(x, y); ctx.rotate(tilt);
    ctx.globalAlpha = fade * eyes;
    ctx.drawImage(img, 0, 0, W, eyeH, -half, -half, size, eyeH * k);  // 眼睛
    if (mouth > 0) {
      const mw = size * (0.75 + mouth * 0.25);   // 嘴巴從窄慢慢拉寬
      const top = -half + eyeH * k;
      ctx.globalAlpha = fade * mouth;
      ctx.transform(1, skew, 0, 1, 0, 0);        // 歪嘴
      ctx.drawImage(img, 0, eyeH, W, jawY - eyeH, -mw / 2, top, mw, (jawY - eyeH) * k);           // 上排牙齒
      ctx.drawImage(img, 0, jawY, W, H - jawY, -mw / 2, -half + jawY * k + open * k, mw, (H - jawY) * k);   // 下巴（往下張開）
    }
    ctx.restore();
  }
  for (const w of smilerWounds) drawSmilerWound(ctx, w);
  ctx.restore();
}
// 噴血：幾滴血往上噴出再掉下來，然後淡掉
function drawSmilerWound(ctx, w) {
  const x = w.x, y = w.y, life = SMILER.woundLife;
  ctx.save();
  ctx.globalAlpha = w.t < life - 0.5 ? 1 : Math.max(0, (life - w.t) / 0.5);
  ctx.fillStyle = '#b00c22';
  for (const d of w.drops) { ctx.beginPath(); ctx.arc(x + d.x, y + d.y, d.r * (1 - w.t / life * .5), 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}
// 畫面邊框閃紅（螢幕座標；render.js 在最後呼叫）：咬下去的瞬間暗紅一閃，再淡掉
function drawSmilerScreenFlash(ctx, cv) {
  const f = smilerScreenFlash; if (!f) return;
  const a = f.strength * (f.t < 0.05 ? f.t / 0.05 : Math.max(0, 1 - (f.t - 0.05) / 0.5));
  if (a <= 0.01) return;
  const W = cv.width, H = cv.height, r = Math.hypot(W, H) / 2;
  const g = ctx.createRadialGradient(W / 2, H / 2, r * 0.3, W / 2, H / 2, r);   // 從畫面中間 30% 外開始變紅，越往邊越濃
  g.addColorStop(0, 'rgba(90,0,8,0)');
  g.addColorStop(0.55, `rgba(90,0,8,${.35 * a})`);
  g.addColorStop(1, `rgba(70,0,6,${.85 * a})`);
  ctx.save(); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
}
