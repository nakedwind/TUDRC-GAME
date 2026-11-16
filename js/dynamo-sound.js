/* ===== 發電機運轉聲：靠近開著的發電機時一直循環播放，越靠近越大聲 =====
   ・哪些發電機會響：地圖上能開關的發電機（js/storage-lockers.js 的 dynamo），打開的那幾台
   ・音檔、音量在「音效編輯器」調：名稱「發電機運轉聲」（dynamoLoop）；全部打開時的發動聲是 dynamoStart（js/storage-lockers.js 播）
   ・距離：DYNAMO_SOUND.near 格以內最大聲，越遠越小，far 格以外聽不到（有好幾台就照最近的那台算）
   ・跟著設定裡的「音效」音量和靜音走；遊戲停下來（輸了、暫停）時淡出
   ・瀏覽器規定網頁要先被點一下或按一個鍵才能出聲，所以第一次操作之後才會開始播 */
const DYNAMO_SOUND = { near: 1.5, far: 9, fade: .4 };   // near、far：格；fade：音量變化要幾秒追上（走來走去時不會一頓一頓）

(() => {
  if (typeof document === 'undefined' || !/塔防原型/.test(decodeURIComponent(location.pathname))) return;   // 只有遊戲畫面會播
  let unlocked = false, audio = null, audioFile = null;
  ['pointerdown', 'keydown'].forEach(n => window.addEventListener(n, () => { unlocked = true; }, true));
  const fileOf = name => { const it = SFX.list().find(x => x.name === name); return it && typeof it.file === 'string' ? it.file : null; };
  // 離最近一台開著的發電機多遠 → 0～1 的音量比例
  function closeness() {
    if (typeof G === 'undefined' || !G || !G.player || !G.running || G.over || typeof storagePropEntries !== 'function' || typeof dynamoIsOn !== 'function') return 0;
    let best = 0;
    for (const prop of storagePropEntries()) {
      if (prop.kind !== 'dynamo' || !dynamoIsOn(prop.token)) continue;
      const d = Math.hypot(prop.x - G.player.x, prop.y - G.player.y) / CELL;
      const k = d <= DYNAMO_SOUND.near ? 1 : Math.max(0, (DYNAMO_SOUND.far - d) / (DYNAMO_SOUND.far - DYNAMO_SOUND.near));
      if (k > best) best = k;
    }
    return best;
  }
  function tick() {
    if (!unlocked || typeof SFX === 'undefined') return;
    const file = fileOf('dynamoLoop'), muted = !SFX.enabled;
    const target = file && !muted ? Math.min(1, SFX.volume * (SFX.gainOf('dynamoLoop') ?? 1) * closeness()) : 0;
    if (file && target > 0 && (!audio || (audioFile !== file && audio.volume <= 0))) {   // 第一次播，或在音效編輯器換了音檔
      if (audio) audio.pause();
      audio = new Audio('Sound effects/' + file); audio.loop = true; audio.volume = 0; audioFile = file;
    }
    if (!audio) return;
    const want = audioFile === file ? target : 0, step = .1 / DYNAMO_SOUND.fade;
    audio.volume = Math.max(0, Math.min(1, audio.volume + Math.max(-step, Math.min(step, want - audio.volume))));
    if (want > 0 && audio.paused) audio.play().catch(() => {});
    else if (want <= 0 && audio.volume <= 0 && !audio.paused) audio.pause();
  }
  setInterval(tick, 100);
})();
