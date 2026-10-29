// ============================================================
//  背景音樂：安全區（基地）放基地音樂；戰鬥地圖目前不放（BOSS 音樂另外在 js/boss-music.js）；換地圖時淡出淡入。
//  音檔、這首自己的音量在「音效編輯器」的「音樂」分類（baseMusic）調整；
//  整體音量在設定選單調整（MUSIC.volume，0～1）。按 M 靜音時音樂也一起靜音。
//  瀏覽器規定要先有點擊或按鍵才能播放聲音，所以第一次操作後才會開始播。
// ============================================================
const MUSIC = (() => {
  const ENABLED = true;
  // 每個場景用哪個音效名稱（js/sfx.js；檔案和音量在音效編輯器換）；沒寫的場景不放音樂
  const SOUNDS = { safe: 'baseMusic' };
  const fileOf = name => { const it = typeof SFX !== 'undefined' && SFX.list().find(x => x.name === name); return it && typeof it.file === 'string' ? 'Sound effects/' + it.file : null; };
  // 基地音樂也可以由玩家在 2F應變中心的電腦「音樂播放器」換（js/pc-desktop.js）：記住的是 music/基地音樂/ 裡的檔名，存在瀏覽器
  // 沒選＝照音效編輯器的設定；設定的檔案找不到（被搬走、刪掉）時，改放基地音樂資料夾的 BASE_FALLBACK
  const BASE_DIR = 'music/基地音樂/', BASE_PICK_STORE = 'tudrc_base_music_v1', BASE_FALLBACK = 'relaxing-piano-music.mp3';
  let basePick = (() => { try { return localStorage.getItem(BASE_PICK_STORE) || null; } catch (_) { return null; } })();
  let baseBroken = false;   // 音效編輯器設定的那首播不出來
  const playlist = m => {
    if (m === 'safe' && (basePick || baseBroken)) return [BASE_DIR + encodeURIComponent(basePick || BASE_FALLBACK)];
    return SOUNDS[m] && fileOf(SOUNDS[m]) ? [fileOf(SOUNDS[m])] : [];
  };
  const MAX = 0.6;            // 音量 100% 時實際的大小（不要蓋過音效）
  const FADE = 1.2;           // 淡出淡入秒數
  let volume = 0.5, unlocked = false, mode = null, index = 0;
  let audio = null;

  // 回憶劇情有自己的 BGM（js/story-scene.js）：這裡停下來，不要兩首疊在一起
  // 劇情地圖（地圖屬性 story）：時間暫停，背景音樂也停
  const wanted = () => window.STORY_MODE || (typeof MAP_STORY !== 'undefined' && MAP_STORY) ? 'story' : (typeof MAP_SAFE !== 'undefined' && MAP_SAFE) ? 'safe' : 'battle';
  const muted = () => typeof SFX !== 'undefined' && !SFX.enabled;
  const target = () => muted() ? 0 : Math.min(1, volume * MAX * (SOUNDS[mode] ? SFX.gainOf(SOUNDS[mode]) ?? 1 : 1));

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
    const list = playlist(newMode);
    if (!list || !list.length) { mode = newMode; const old = audio; audio = null; if (old) fadeTo(old, 0, () => old.pause()); return; }
    if (newMode !== mode) index = Math.floor(Math.random() * list.length);
    mode = newMode;
    const next = new Audio(list[index % list.length]);
    next.volume = 0; next.loop = list.length === 1;   // 只有一首：直接循環，不用每次重新淡入
    next.addEventListener('ended', () => { if (audio === next) { index++; play(mode); } });   // 一首播完換下一首
    next.addEventListener('error', () => {   // 基地音樂的檔案找不到：玩家選的那首不見了＝回到預設；預設的也不見了＝放資料夾裡的備用那首
      if (audio !== next || newMode !== 'safe') return;
      if (basePick) { basePick = null; try { localStorage.removeItem(BASE_PICK_STORE); } catch (_) {} play('safe'); }
      else if (!baseBroken) { baseBroken = true; play('safe'); }
    });
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
    // 基地音樂（2F 電腦的音樂播放器用）：baseDir＝資料夾、baseTrack＝玩家選的檔名（null＝預設）、setBaseTrack 換歌並記住
    baseDir: BASE_DIR,
    baseFallback: BASE_FALLBACK,
    get baseTrack() { return basePick; },
    setBaseTrack(name) {
      name = name || null; if (name === basePick) return;
      basePick = name;
      try { if (name) localStorage.setItem(BASE_PICK_STORE, name); else localStorage.removeItem(BASE_PICK_STORE); } catch (_) {}
      if (unlocked && mode === 'safe') play('safe');   // 正在基地：馬上淡出換成新的那首
    },
  };
})();
