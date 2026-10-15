// ============================================================
//  溫特的 SP＝理智
//  ・SP 不會自己恢復，只有喝杏仁水（背包／F 鍵）才會恢復。換地圖、重新整理也不會補滿（會記住剩多少）。
//  ・SP 低於 grayFrom（60）開始，SP 越低遊戲畫面越灰（只有地圖畫面，介面不會變灰）。
//  ・SP 低於 swayBelow（40）時開始頭暈：視線不規則地繞圈飄、一陣一陣往一邊歪再慢慢回正、忽遠忽近對不到焦。越低越嚴重。
//  ・SP 低於 ghostBelow（20）時，畫面出現殘影（上一刻的畫面淡淡地留著、稍微錯開）。
//  ・SP 低於 soundBelow（50）時，聽得到自己的心跳聲，偶爾還有怪聲；SP 越低越大聲、怪聲越頻繁。
//  ・數值都在下面的 SANITY。
// ============================================================
const SANITY = {
  autoRegen: false,    // SP 會不會自己慢慢恢復（false＝只有杏仁水能恢復）
  grayFrom: 60,        // SP 低於這個值就開始變灰
  grayMax: 0.5,      // SP 歸零時灰到什麼程度（0＝不灰、1＝完全黑白）
  dimMax: 0.15,        // SP 歸零時畫面暗多少
  swayBelow: 20,       // SP 低於這個值才開始頭暈搖晃
  swayPx: 5,           // SP 歸零時，視線最多飄幾像素
  swayDeg: 0,          // SP 歸零時，畫面最多歪幾度（0＝不歪；之前試過 0.6）
  lurchEvery: null,    // 每隔幾秒來「一陣暈」（SP 越低越頻繁）；null＝關掉（之前試過 [2.2, 4.5]）
  focusPulse: 0,       // 忽遠忽近的幅度（畫面縮放）；0＝關掉（之前試過 0.015）
  ghostBelow: 20,      // SP 低於這個值出現殘影
  ghostAlpha: 0.25,    // SP 歸零時殘影有多濃（0～1）
  ghostShift: 5,       // 殘影錯開幾像素
  soundBelow: 50,      // SP 低於這個值開始聽到心跳聲和怪聲
  heartbeatVolume: 0.95,   // SP 歸零時心跳聲的音量（剛低於 50 時大約是這個的 1/4）
  heartbeatEvery: 5.6,    // 心跳音檔多久重播一次（音檔約 5.7 秒，接著播就不會斷）
  weirdVolume: 0.5,       // SP 歸零時怪聲的音量
  weirdEvery: [20, 50],    // 怪聲每隔幾秒出現一次（剛低於 50 時）；SP 越低越頻繁，歸零時約是一半
  warnText: '……頭好暈。得喝點杏仁水才行。',   // 剛低於 swayBelow 時，溫特說的話
};
const SP_STORE = 'tudrc_sp_v1';
let sanitySP = null;   // 記住的 SP（換地圖時帶過去）
try { const v = Number(localStorage.getItem(SP_STORE)); if (localStorage.getItem(SP_STORE) !== null && Number.isFinite(v)) sanitySP = v; } catch (_) {}
let sanitySavedAt = 0, sanityWarned = false;

// 換地圖前（game.js 的 newGame 一開始呼叫，這時 G 還是舊地圖的）：記住目前的 SP
function rememberSanitySP() {
  if (typeof G === 'undefined' || !G || !Number.isFinite(G.guide)) return;
  sanitySP = G.guide;
  try { localStorage.setItem(SP_STORE, String(Math.round(sanitySP * 10) / 10)); } catch (_) {}
}
// 載入地圖後（game.js 的 newGame 呼叫）：把記住的 SP 帶進這張地圖，不要補滿
function restoreSanitySP() {
  if (!G) return;
  if (sanitySP == null) sanitySP = G.guide;
  G.guide = Math.max(0, Math.min(G.guideMax, sanitySP));
  sanityWarned = G.guide < SANITY.swayBelow;   // 本來就很低：不要一進地圖就再說一次
}
// 0（SP 滿）～1（SP 歸零）
const sanityCalm = () => (typeof equipCalm === 'function' ? 1 - equipCalm() : 1);   // 降噪耳機：影響變輕（js/equipment.js）
const sanityLoss = () => (G && G.guideMax ? Math.max(0, Math.min(1, 1 - G.guide / G.guideMax)) : 0);

// 頭暈（render.js 在畫世界之前呼叫）：
//  1. 視線繞著小圈不規則地飄（圈的大小、速度一直在變）
//  2. 一陣一陣的暈：突然往一邊歪過去，再慢慢回正
//  3. 忽遠忽近，像對不到焦
// 畫面會稍微放大，邊緣才不會露出空白。
let sanityLurch = { at: -99, side: 1, next: 0 };
function applySanitySway(ctx, cv) {
  if (!G || G.guide >= SANITY.swayBelow) return;
  const k = Math.min(1, (SANITY.swayBelow - G.guide) / SANITY.swayBelow) * sanityCalm(), t = performance.now() / 1000;
  // 1. 不規則繞圈
  const orbitR = SANITY.swayPx * k * (.55 + .45 * Math.sin(t * .37));
  const orbitA = t * 1.6 + Math.sin(t * .53) * 1.8;
  let dx = Math.cos(orbitA) * orbitR, dy = Math.sin(orbitA) * orbitR * .7;
  // 2. 一陣暈：0.3 秒內歪過去，之後約 1.5 秒慢慢回正
  if (SANITY.lurchEvery && t >= sanityLurch.next) {
    const [a, b] = SANITY.lurchEvery;
    sanityLurch = { at: t, side: Math.random() < .5 ? -1 : 1, next: t + b - (b - a) * k + Math.random() };
  }
  const lt = t - sanityLurch.at, f = !SANITY.lurchEvery ? 0 : lt < .3 ? Math.sin(lt / .3 * Math.PI / 2) : Math.exp(-(lt - .3) * 2.2);
  dx += sanityLurch.side * f * SANITY.swayPx * 1.3 * k;
  dy += f * SANITY.swayPx * .4 * k;
  const rot = (sanityLurch.side * f + Math.sin(t * .7) * .25) * SANITY.swayDeg * k * Math.PI / 180;
  // 3. 忽遠忽近
  const zoom = 1 + .045 * k + Math.sin(t * 2.1 + Math.sin(t * .8)) * SANITY.focusPulse * k;
  const cx = cv.width / 2, cy = cv.height / 2;
  ctx.translate(cx + dx, cy + dy); ctx.rotate(rot); ctx.scale(zoom, zoom); ctx.translate(-cx, -cy);
}
// 殘影（game.js 每畫完一幀呼叫）：把上一刻的畫面淡淡疊上來、稍微錯開，再記住這一刻的畫面
let sanityGhostCv = null;
function sanityAfterDraw() {
  const cv = document.getElementById('cv'); if (!cv || !G) return;
  if (G.guide >= SANITY.ghostBelow) { sanityGhostCv = null; return; }
  if (!sanityGhostCv || sanityGhostCv.width !== cv.width || sanityGhostCv.height !== cv.height) {
    sanityGhostCv = document.createElement('canvas'); sanityGhostCv.width = cv.width; sanityGhostCv.height = cv.height;
    sanityGhostCv.getContext('2d').drawImage(cv, 0, 0);
    return;
  }
  const k = Math.min(1, (SANITY.ghostBelow - G.guide) / SANITY.ghostBelow) * sanityCalm(), t = performance.now() / 1000;
  const c = cv.getContext('2d'), sx = Math.cos(t * 1.9) * SANITY.ghostShift * (.5 + .5 * k), sy = Math.sin(t * 1.3) * SANITY.ghostShift * .5 * k;
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
  c.globalAlpha = SANITY.ghostAlpha * (.4 + .6 * k);
  c.drawImage(sanityGhostCv, sx, sy);   // 上一刻的畫面（本身也帶著更早的殘影，會拖出一串）
  c.restore();
  const g = sanityGhostCv.getContext('2d'); g.clearRect(0, 0, cv.width, cv.height); g.drawImage(cv, 0, 0);
}

// 每一幀：變灰、記住 SP、低理智提示
(function sanityLoop() {
  requestAnimationFrame(sanityLoop);
  const cv = document.getElementById('cv'); if (!cv || typeof G === 'undefined' || !G) return;
  const sp = G.guide, loss = (SANITY.grayFrom > 0 ? Math.max(0, Math.min(1, (SANITY.grayFrom - sp) / SANITY.grayFrom)) : 0) * sanityCalm();
  const filter = loss > .005 ? `grayscale(${(loss * SANITY.grayMax).toFixed(3)}) brightness(${(1 - loss * SANITY.dimMax).toFixed(3)})` : '';
  if (cv.style.filter !== filter) cv.style.filter = filter;
  if (sanitySP !== sp) {
    sanitySP = sp;
    if (performance.now() - sanitySavedAt > 1000) { sanitySavedAt = performance.now(); try { localStorage.setItem(SP_STORE, String(Math.round(sp * 10) / 10)); } catch (_) {} }
  }
  sanitySounds(sp);
  if (sp < SANITY.swayBelow && !sanityWarned && G.player) {
    sanityWarned = true;
    if (typeof systemNotice === 'function') systemNotice('溫特的理智正在下降', true);
    if (typeof flash === 'function') flash(SANITY.warnText, G.player.x, G.player.y - 60, '#c9b8ff', 3);
  } else if (sp >= SANITY.swayBelow + 5) sanityWarned = false;
})();
// 心跳聲、怪聲（每一幀檢查）：SP 越低越大聲，怪聲也越常出現
let sanityBeatAt = 0, sanityWeirdAt = 0;
function sanitySounds(sp) {
  const now = performance.now() / 1000;
  if (!G.player || sp >= SANITY.soundBelow || (typeof mapTransitioning !== 'undefined' && mapTransitioning)) { sanityBeatAt = 0; sanityWeirdAt = 0; return; }
  const k = Math.min(1, (SANITY.soundBelow - sp) / SANITY.soundBelow), level = (.25 + .75 * k) * sanityCalm();
  if (now >= sanityBeatAt) {
    sanityBeatAt = now + SANITY.heartbeatEvery;
    SFX.play('heartbeat', SANITY.heartbeatVolume * level, 'sanity-heartbeat');
  }
  if (!sanityWeirdAt) sanityWeirdAt = now + 2 + Math.random() * 3;   // 剛低於 50：幾秒後第一聲
  else if (now >= sanityWeirdAt) {
    SFX.play('weirdNoise', SANITY.weirdVolume * level, 'sanity-weird');
    const [a, b] = SANITY.weirdEvery, shrink = 1 - .5 * k;
    sanityWeirdAt = now + (a + Math.random() * (b - a)) * shrink;
  }
}
window.addEventListener('beforeunload', () => { try { if (sanitySP != null) localStorage.setItem(SP_STORE, String(sanitySP)); } catch (_) {} });
