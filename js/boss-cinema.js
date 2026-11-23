/* ===== BOSS 出場演出（共用）=====
   BOSS 出場時：整個戰場的時間停住（溫特、隊員、其他怪物、核心召喚、作戰計時都不動，溫特也不能操作），
   鏡頭慢慢滑到出場的地方，畫面上下出現黑邊，強迫玩家看完出場動畫；演完鏡頭滑回溫特，遊戲繼續。
   停住的時候只有兩種東西會動：
     1. 那隻 BOSS 自己的出場（各 BOSS 傳進來的 tick）
     2. 畫面特效（粒子、閃光、屍體、大橫幅）
   用法（各 BOSS 的檔案呼叫）：
     startBossCinema({
       focus: { x, y },            // 鏡頭要對準的地方（世界座標）
       tick(dt) { ... },           // 停住的這段時間，BOSS 出場要跑的更新
       done() { return 演完了沒; },  // 回傳 true 就開始收尾（鏡頭滑回溫特）
       holdAfter: .4,              // 演完之後多停幾秒再滑回去
       maxTime: 15,                // 保險：最多演幾秒（出錯也不會永遠卡住）
     });
   誰在用：js/milkfish-king.js（虱目魚王從水池竄出）、js/gourd-king.js（葫蘆猴王撞破牆）、js/rat-king.js（花蓮老鼠王從鐵軌鑽出來）。
   接在 js/game.js 的 frame（停住時改跑 bossCinemaTick）、updateCamera（鏡頭），js/render.js 畫黑邊。
   自動測試要關掉演出：window.NO_BOSS_CINEMA = true（js/floor-tests.js）。
*/
/* BOSS 出場時整個戰場停住、溫特不能動，鏡頭滑到出場的地方並稍微拉遠，畫面上下出現黑邊，演完才滑回溫特、遊戲繼續（不能跳過）。
   目前有演出的：虱目魚王（溫特打到核心就開始，吞完核心結束）、葫蘆猴王（第 1 下撞牆前開始，撞破牆跳出來泰山壓頂、亮相完結束）、花蓮老鼠王（鐵軌下開始啃咬就開始，鑽出來開始戰鬥時結束）。
   虱目魚王登場本身的秒數、跳多高在牠自己的「登場：」欄位。 */
// 數字以 data/monsters.js 的 BOSS_SETTINGS_DEFAULT 為準（怪物編輯器「👑 BOSS 數值」）；這裡的數字只在那邊沒有這一格時才用。
// 新增或刪掉數字欄位、改了註解之後，要跑一次 tools/build-boss-fields.py（編輯器的欄位和說明才會跟著更新）
const BOSS_CINEMA = applyBossSettings('BOSS_CINEMA', {
  pan: .8,        // 鏡頭滑過去幾秒
  back: .7,       // 演完滑回溫特幾秒（這段時間也還停著）
  bars: .1,       // 上下黑邊各佔畫面高度的幾成
  zoom: .8,       // 演出時鏡頭拉遠：放大倍率變成平常的幾倍（.8＝看到的範圍大 25%，大隻的 BOSS 跳起來才不會被切到）
  maxTime: 16,    // 保險：一段演出最多幾秒（出了問題也不會永遠停住）
  milkfish: {     // 虱目魚王
    focusUp: 90, // 鏡頭對準核心再往上幾像素（上面留空間給牠跳起來）
    holdAfter: .6,   // 吞完核心後多停幾秒才滑回溫特
  },
  gourd: {        // 葫蘆猴王
    lead: 1.2,    // 第 1 下撞牆之前幾秒開始演出（牆一開始震就停住，整段撞牆、撞破跳出來壓頂都看得到）
    focusDown: 3.5,  // 撞牆時鏡頭對準牆頂往下幾格（整面牆都在畫面裡）；跳出來之後鏡頭會自己往上移，跳到最高和落地都看得到
    zoom: .65,    // 這段的鏡頭拉遠倍率（牠跳很高，要比上面共用的再拉遠一點）
    holdAfter: .3,   // 亮相完後多停幾秒才滑回溫特
  },
  rat: {          // 花蓮老鼠王
    focusUp: 2,   // 鏡頭對準月台邊緣再往上幾格
    holdAfter: .3,   // 鑽出來亮相完後多停幾秒才滑回溫特
  },
});
let bossCinema = null;
function startBossCinema(opt) {
  if (bossCinema || window.NO_BOSS_CINEMA || !opt) return false;
  bossCinema = { focus: opt.focus, tick: opt.tick, done: opt.done, holdAfter: opt.holdAfter ?? .4, maxTime: opt.maxTime ?? BOSS_CINEMA.maxTime,
    zoom: opt.zoom ?? BOSS_CINEMA.zoom, baseScale: VIEW_SCALE, t: 0, phase: 'in', k: 0, doneT: null, outT: 0 };
  return true;
}
// 重開一場、換地圖時（js/game.js 的 newGame）：還在演的直接收掉、鏡頭縮放還原，不然新的一場會被停住
function resetBossCinema() {
  if (bossCinema) VIEW_SCALE = bossCinema.baseScale;
  bossCinema = null;
}
const bossCinemaActive = () => !!bossCinema;
const bcEase = k => k * k * (3 - 2 * k);   // 慢慢開始、慢慢停（不要一下子跳過去）
// 停住的這段時間每一幀跑這個（js/game.js 的 frame 用它代替 update）
function bossCinemaTick(dt) {
  const C = bossCinema; if (!C) return;
  C.t += dt;
  if (C.phase !== 'out') {
    try { if (C.tick) C.tick(dt); } catch (err) { console.error('BOSS 出場演出出錯', err); C.phase = 'out'; }
    if (C.phase === 'in') { C.k = Math.min(1, C.t / BOSS_CINEMA.pan); if (C.k >= 1) C.phase = 'hold'; }
    const finished = (C.done && C.done()) || C.t >= C.maxTime;
    if (finished && C.doneT == null) C.doneT = C.t;
    if (C.doneT != null && C.t - C.doneT >= C.holdAfter) { C.phase = 'out'; C.outT = 0; }
  } else {
    C.outT += dt;
    C.k = 1 - Math.min(1, C.outT / BOSS_CINEMA.back);
    if (C.outT >= BOSS_CINEMA.back) { VIEW_SCALE = C.baseScale; bossCinema = null; return; }
  }
  VIEW_SCALE = C.baseScale * (1 + (C.zoom - 1) * bcEase(C.k));   // 鏡頭慢慢拉遠、結束時慢慢拉回來
  // 畫面特效照樣動（爆炸、粒子、閃光、地上痕跡）
  if (typeof updateWorldEffects === 'function') updateWorldEffects(dt);
  if (typeof updateLightFlashes === 'function') updateLightFlashes(dt);
  if (typeof updateCombatFeel === 'function') updateCombatFeel(dt);
  if (G && G.coreBanner) { G.coreBanner.t += dt; if (typeof CORE_FRENZY !== 'undefined' && G.coreBanner.t > CORE_FRENZY.banner) G.coreBanner = null; }   // 「○○現身」大橫幅照常播完（平常在 js/core-frenzy.js 計時）
  G.effects = (G.effects || []).filter(f => f.life > 0);
}
// 鏡頭（js/game.js 的 updateCamera 算完跟著溫特的位置後呼叫）：從溫特那邊滑到 focus
function bossCinemaCamera() {
  const C = bossCinema; if (!C || !C.focus) return;
  const k = bcEase(C.k), vw = viewW(), vh = viewH();
  const tx = Math.max(0, Math.min(COLS * CELL - vw, C.focus.x - vw / 2)), ty = Math.max(0, Math.min(ROWS * CELL - vh, C.focus.y - vh / 2));
  cam.x += (tx - cam.x) * k; cam.y += (ty - cam.y) * k;
}
// 上下的黑邊（js/render.js 最後畫）：螢幕座標
function drawBossCinemaBars(ctx, cv) {
  const C = bossCinema; if (!C) return;
  const h = cv.height * BOSS_CINEMA.bars * bcEase(C.k);
  if (h < .5) return;
  ctx.save(); ctx.fillStyle = '#000';   // 跟其他畫面介面一樣照目前的縮放畫（不要重設座標，高解析度螢幕會畫歪）
  ctx.fillRect(0, 0, cv.width, h); ctx.fillRect(0, cv.height - h, cv.width, h);
  ctx.restore();
}
