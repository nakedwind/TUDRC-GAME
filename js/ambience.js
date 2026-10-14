// ============================================================
//  環境背景音：Y 區的地圖（戰鬥地圖）一直循環播放白噪音，音量慢慢忽大忽小。
//  ・只要在 Y 區地圖上就會播（開始畫面、暫停、結算畫面也一樣）；回到基地（安全區）就淡出。
//  ・音量跟著設定裡的「音效」音量走；按 M 靜音時也會一起靜音。
//  ・音檔、整體音量可以在「音效編輯器」的 whiteNoise（環境白噪音）調整。
//  ・瀏覽器規定網頁要先被點一下或按一個鍵才能出聲，所以第一次操作之後才會開始播。
// ============================================================
const AMBIENCE = {
  sound: 'whiteNoise',     // js/sfx.js 裡的音效名稱
  volume: 1.0,             // 整體音量倍率
  low: 0.35,               // 忽大忽小：最小聲是原本的幾倍
  high: 1.0,               //           最大聲是原本的幾倍
  swing: [3, 8],           // 每隔幾秒換一次大小（隨機）
  fade: 1.5,               // 進出 Y 區地圖時淡入淡出幾秒
};
const Ambience = (() => {
  let ctx = null, gain = null, drift = null, src = null, buffer = null, loading = false, unlocked = false;
  let driftUntil = 0, active = false, fallback = null;

  const fileOf = () => { const it = SFX.list().find(x => x.name === AMBIENCE.sound); return it && typeof it.file === 'string' ? it.file : null; };
  const inYZone = () => typeof MAP_SAFE !== 'undefined' && typeof MAP !== 'undefined' && MAP && !MAP_SAFE;   // Y 區＝戰鬥地圖
  const baseVolume = () => (SFX.enabled ? SFX.volume : 0) * AMBIENCE.volume * (SFX.gainOf(AMBIENCE.sound) ?? 1);

  async function load() {
    if (buffer || loading || fallback) return;   // 已經在用備用方式播了：不要再建一個（之前每按一次鍵就多疊一層白噪音，越來越大聲）
    const file = fileOf(); if (!file) return;
    loading = true;
    try {
      const data = await fetch('Sound effects/' + file).then(r => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); });
      buffer = await ctx.decodeAudioData(data);
    } catch (_) {
      // 直接雙擊 HTML（file://）開啟時讀不到檔案：改用一般的播放方式循環
      fallback = new Audio('Sound effects/' + file); fallback.loop = true; fallback.volume = 0;
    }
    loading = false;
  }
  function start() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      ctx = new AC(); gain = ctx.createGain(); drift = ctx.createGain();
      gain.gain.value = 0; drift.gain.value = 1;
      drift.connect(gain); gain.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    load();
  }
  function ensureSource() {
    if (src || !buffer) return;
    src = ctx.createBufferSource(); src.buffer = buffer; src.loop = true;
    src.loopStart = Math.min(.05, buffer.duration / 4); src.loopEnd = Math.max(src.loopStart + .1, buffer.duration - .05);   // 頭尾各剪一點點，循環時比較不會「喀」一聲
    src.connect(drift); src.start(0, Math.random() * buffer.duration * .8);   // 從隨機位置開始，每次聽起來不一樣
  }
  // 每 0.2 秒檢查一次：在不在 Y 區、音量、忽大忽小
  function tick() {
    if (!unlocked || !ctx) return;
    const want = inYZone() ? baseVolume() : 0, now = ctx.currentTime;
    if (fallback) {   // 備用播放方式
      if (want > 0 && fallback.paused) fallback.play().catch(() => {});
      const wobble = AMBIENCE.low + (AMBIENCE.high - AMBIENCE.low) * (.5 + .5 * Math.sin(performance.now() / 2300));
      fallback.volume = Math.max(0, Math.min(1, want * wobble));
      return;
    }
    if (want > 0) ensureSource();
    if (active !== want > 0 || Math.abs(gain.gain.value - want) > .002) {   // 進出 Y 區、改音量：慢慢淡過去
      gain.gain.cancelScheduledValues(now); gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.linearRampToValueAtTime(want, now + (active !== want > 0 ? AMBIENCE.fade : .25));
      active = want > 0;
    }
    if (active && performance.now() > driftUntil) {   // 忽大忽小：隨機挑一個大小，花幾秒慢慢變過去
      const secs = AMBIENCE.swing[0] + Math.random() * (AMBIENCE.swing[1] - AMBIENCE.swing[0]);
      const to = AMBIENCE.low + Math.random() * (AMBIENCE.high - AMBIENCE.low);
      drift.gain.cancelScheduledValues(now); drift.gain.setValueAtTime(drift.gain.value, now);
      drift.gain.linearRampToValueAtTime(to, now + secs);
      driftUntil = performance.now() + secs * 1000;
    }
  }
  const unlock = () => { unlocked = true; start(); };
  window.addEventListener('pointerdown', unlock, true);
  window.addEventListener('keydown', unlock, true);
  setInterval(tick, 200);
  return { get playing() { return active; }, get level() { return gain ? gain.gain.value * drift.gain.value : 0; }, get drift() { return drift ? drift.gain.value : 0; } };
})();
