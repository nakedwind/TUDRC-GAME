// ============================================================
//  背景音樂：安全區（基地）放鋼琴曲，戰鬥地圖放戰鬥曲；換地圖時淡出淡入。
//  音量在設定選單調整（MUSIC.volume，0～1）。按 M 靜音時音樂也一起靜音。
//  瀏覽器規定要先有點擊或按鍵才能播放聲音，所以第一次操作後才會開始播。
// ============================================================
const MUSIC = (() => {
  const ENABLED = false;   // 還沒選好曲目，先關掉；選好後改成 true
  // 曲目清單：想換歌或加歌，改這裡就好（檔案放在 music/ 資料夾）
  const PLAYLISTS = {
    safe:   ['music/relaxing-piano-music.mp3', 'music/sunset-piano-music.mp3'],   // 基地：輪流播
    battle: ['music/bluelike_u-3-strike-battle-game-bgm-261231.mp3'],             // 戰鬥
  };
  const MAX = 0.6;            // 音量 100% 時實際的大小（不要蓋過音效）
  const FADE = 1.2;           // 淡出淡入秒數
  let volume = 0.5, unlocked = false, mode = null, index = 0;
  let audio = null;

  const wanted = () => (typeof MAP_SAFE !== 'undefined' && MAP_SAFE) ? 'safe' : 'battle';
  const muted = () => typeof SFX !== 'undefined' && !SFX.enabled;
  const target = () => muted() ? 0 : volume * MAX;

  function fadeTo(a, to, done) {   // 每首歌各自的淡入淡出計時器（a._fade）
    clearInterval(a._fade);
    const from = a.volume, start = performance.now();
    a._fade = setInterval(() => {
      const t = Math.min(1, (performance.now() - start) / (FADE * 1000));
      a.volume = Math.max(0, Math.min(1, from + (to - from) * t));
      if (t >= 1) { clearInterval(a._fade); if (done) done(); }
    }, 40);
  }
  function play(newMode) {
    const list = PLAYLISTS[newMode]; if (!list || !list.length) return;
    if (newMode !== mode) index = Math.floor(Math.random() * list.length);
    mode = newMode;
    const next = new Audio(list[index % list.length]);
    next.volume = 0;
    next.addEventListener('ended', () => { if (audio === next) { index++; play(mode); } });   // 一首播完換下一首
    const old = audio; audio = next;
    const start = () => { next.play().catch(() => {}); fadeTo(next, target()); };
    if (old && !old.paused) fadeTo(old, 0, () => { old.pause(); start(); }); else start();
  }
  // 每秒檢查一次：地圖從基地換到戰鬥（或反過來）就換音樂
  setInterval(() => { if (unlocked && wanted() !== mode) play(wanted()); }, 1000);
  // 第一次點擊或按鍵後才開始播
  const unlock = () => { if (unlocked || !ENABLED) return; unlocked = true; play(wanted()); };
  window.addEventListener('pointerdown', unlock, { once: true });
  window.addEventListener('keydown', unlock, { once: true });

  return {
    enabled: ENABLED,
    get volume() { return volume; },
    set volume(v) { volume = Math.max(0, Math.min(1, v)); if (audio) { clearInterval(audio._fade); audio.volume = target(); } },
    refresh() { if (audio) { clearInterval(audio._fade); audio.volume = target(); } },   // 靜音切換後呼叫
  };
})();
