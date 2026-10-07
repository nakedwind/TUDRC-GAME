/* ===== 音效：優先播放素材音檔，未對應的效果沿用 Web Audio 合成 =====
   呼叫：sfx('button' | 'menu' | 'switch' | 'blip' | 'place' | 'soothe'
            | 'wave' | 'win' | 'lose' | 'error' | 'berserk' | 'kill')
   調整：改 sounds 裡的參數就能改音色；SFX.volume 設總音量；按 M 鍵可靜音。
   音檔播放：開遊戲時就先把音檔解碼進記憶體（Web Audio），要播時立刻出聲、不會慢半拍。
            如果是直接雙擊 HTML 開啟（file://），瀏覽器不准預先載入，會自動退回舊的播放方式。
   音高變化：VARIED 裡的戰鬥音效每次播放音高、音量都會隨機偏一點，連續命中才不會像同一段錄音重播。
*/
const SFX = (() => {
  let ctx = null, master = null, volume = 0.35, enabled = true;
  const files = {
    button: '按鈕.mp3',
    menu: '開選單.mp3',
    switch: '切換.mp3',
    blip: '對話框下一頁音效.mp3',
    place: '放置.mp3',
    soothe: '疏導.mp3',
    door: '關門.mp3',
    backroomDoor: '後室開門.mp3',
    elevator: '電梯.mp3',
    gunshot: '開槍.mp3',
    reload: 'reload.mp3',
    monsterHit: 'hit.mp3',
    fireImpact: '火焰.mp3',
    lightningImpact: '雷電.mp3',
    corrosionImpact: '腐蝕命中.wav',
    campWarning: '警告聲.mp3',
    monsterDown: '怪物倒下.mp3',
    rangedShot: '射擊.mp3',
    knock2: '敲打2.mp3',
    cleaver: '菜刀.mp3',
    meleeAttack: '近戰攻擊.mp3',
    swordSwing: '揮劍.mp3',
    heartbeat: '心跳.mp3',
    achievement: '升級.mp3',
    glassBreak3: '玻璃破掉3.mp3',
    glassBreak4: '玻璃破掉4.mp3',
    mineBeep: 'BB聲.mp3',
    smallBoom: '小爆炸.mp3',
    midBoom: '中爆炸.mp3',
    bigBoom: '爆炸.mp3',
    slimeHit: 'slime-hit.mp3',
    slimeLand: 'slime-land.mp3',
  };
  // 戰鬥音效的隨機變化：pitch＝音高（播放速度）±比例、gain＝音量 ±比例。
  // 介面、警告、心跳等不列在 VARIED 裡，維持每次都一樣。
  const VARY = { pitch: 0.08, gain: 0.12 };
  const VARIED = new Set(['gunshot', 'monsterHit', 'fireImpact', 'lightningImpact', 'corrosionImpact', 'monsterDown',
    'rangedShot', 'knock2', 'cleaver', 'meleeAttack', 'swordSwing', 'slimeHit', 'slimeLand', 'kill', 'hit']);
  const jitter = amount => 1 + (Math.random() * 2 - 1) * amount;
  const activeAudio = new Map();     // 舊播放方式（HTML Audio）正在播的音
  const activeSources = new Set();   // Web Audio 正在播的音（靜音時要一起停掉）
  const buffers = {};                // 已解碼好的音檔：name → AudioBuffer
  const lastPlayed = new Map();
  function playFile(name, gain = 1, sourceKey = name) {
    const now = performance.now();
    if (now - (lastPlayed.get(sourceKey) || -Infinity) < 70) return;
    lastPlayed.set(sourceKey, now);
    const vary = VARIED.has(name), rate = vary ? jitter(VARY.pitch) : 1;
    if (vary) gain *= jitter(VARY.gain);
    if (buffers[name]) {             // 已預先載入：立即播放
      ensure();
      const src = ctx.createBufferSource(); src.buffer = buffers[name]; src.playbackRate.value = rate;
      const g = ctx.createGain(); g.gain.value = gain;
      src.connect(g); g.connect(master);
      activeSources.add(src);
      src.onended = () => activeSources.delete(src);
      src.start();
      return;
    }
    const audio = new Audio('Sound effects/' + files[name]);   // 還沒載入好（或 file:// 開啟）：退回舊方式
    audio.volume = Math.min(1, volume * gain);
    audio.preservesPitch = false; audio.playbackRate = rate;
    activeAudio.set(audio, gain);
    const cleanup = () => activeAudio.delete(audio);
    audio.addEventListener('ended', cleanup, { once: true });
    audio.addEventListener('error', cleanup, { once: true });
    audio.play().catch(() => { cleanup(); });
  }
  function createContext() {
    if (ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = volume; master.connect(ctx.destination);
  }
  function ensure() {
    createContext();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  // 開遊戲時先把所有音檔下載並解碼；任何一個失敗，就只有那個音沿用舊播放方式
  function preload() {
    if (location.protocol === 'file:') return;   // 雙擊開啟時瀏覽器禁止讀檔，直接用舊方式
    createContext();
    if (!ctx) return;
    for (const [name, file] of Object.entries(files)) {
      fetch('Sound effects/' + encodeURIComponent(file))
        .then(r => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
        .then(data => new Promise((ok, fail) => ctx.decodeAudioData(data, ok, fail)))
        .then(buffer => { buffers[name] = buffer; })
        .catch(() => {});
    }
  }
  // 瀏覽器規定玩家第一次點擊或按鍵後才能出聲，那時順便喚醒音效引擎
  const unlock = () => { if (ctx && ctx.state === 'suspended') ctx.resume(); };
  window.addEventListener('pointerdown', unlock);
  window.addEventListener('keydown', unlock);
  // 一個帶音量包絡的音（可做滑音：freq → freq2）
  function tone({ freq, freq2, type = 'sine', dur = 0.12, gain = 0.25, attack = 0.004, when = 0 }) {
    const t0 = ctx.currentTime + when;
    const osc = ctx.createOscillator(); osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (freq2) osc.frequency.exponentialRampToValueAtTime(Math.max(1, freq2), t0 + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g); g.connect(master);
    osc.start(t0); osc.stop(t0 + dur + 0.02);
  }
  // 一段雜訊（做敲擊、塵埃、暴走的粗糙感），經帶通濾波
  function noise({ dur = 0.14, gain = 0.15, when = 0, freq = 1400, q = 0.7 }) {
    const t0 = ctx.currentTime + when;
    const n = Math.floor(ctx.sampleRate * dur), buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(); src.buffer = buf;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = freq; bp.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(bp); bp.connect(g); g.connect(master);
    src.start(t0); src.stop(t0 + dur + 0.02);
  }
  const sounds = {
    button() { tone({ freq: 520, freq2: 660, type: 'square', dur: 0.06, gain: 0.16 }); },
    menu() { tone({ freq: 380, type: 'triangle', dur: 0.08, gain: 0.18 }); tone({ freq: 570, type: 'triangle', dur: 0.1, gain: 0.15, when: 0.05 }); },
    switch() { tone({ freq: 720, freq2: 470, type: 'sine', dur: 0.07, gain: 0.15 }); },
    blip() { tone({ freq: 880, type: 'sine', dur: 0.05, gain: 0.13 }); },
    place() { tone({ freq: 190, freq2: 85, type: 'sine', dur: 0.15, gain: 0.32 }); noise({ dur: 0.12, gain: 0.12, freq: 900 }); },
    soothe() { tone({ freq: 660, type: 'sine', dur: 0.16, gain: 0.13 }); tone({ freq: 990, type: 'sine', dur: 0.2, gain: 0.11, when: 0.1 }); },
    wave() { tone({ freq: 300, type: 'sawtooth', dur: 0.16, gain: 0.15 }); tone({ freq: 300, type: 'sawtooth', dur: 0.16, gain: 0.15, when: 0.22 }); },
    win() { [523, 659, 784, 1047].forEach((f, i) => tone({ freq: f, type: 'triangle', dur: 0.2, gain: 0.2, when: i * 0.11 })); },
    lose() { [440, 392, 311, 233].forEach((f, i) => tone({ freq: f, type: 'sawtooth', dur: 0.26, gain: 0.17, when: i * 0.14 })); },
    error() { tone({ freq: 200, freq2: 150, type: 'square', dur: 0.16, gain: 0.18 }); },
    berserk() { tone({ freq: 130, freq2: 55, type: 'sawtooth', dur: 0.4, gain: 0.24 }); noise({ dur: 0.34, gain: 0.16, freq: 500, q: 0.5 }); },
    kill() { const k = jitter(VARY.pitch); tone({ freq: 420 * k, freq2: 120 * k, type: 'sine', dur: 0.09, gain: 0.1 * jitter(VARY.gain) }); },
    hit() { const k = jitter(VARY.pitch); tone({ freq: 160 * k, freq2: 70 * k, type: 'square', dur: 0.07, gain: 0.15 * jitter(VARY.gain) }); noise({ dur: 0.06, gain: 0.08, freq: 700 * k }); },
  };
  function play(name, gain = 1, sourceKey = name) {
    if (!enabled) return;
    if (gain <= 0) return;
    if (files[name]) { playFile(name, gain, sourceKey); return; }
    const f = sounds[name];
    if (f) { ensure(); f(); }
  }
  preload();
  return {
    play,
    get enabled() { return enabled; }, set enabled(v) {
      enabled = v;
      if (!v) {
        activeAudio.forEach((_, audio) => audio.pause()); activeAudio.clear();
        activeSources.forEach(src => { try { src.stop(); } catch (_) {} }); activeSources.clear();
      }
    },
    get volume() { return volume; },
    set volume(v) { volume = v; if (master) master.gain.value = v; activeAudio.forEach((gain, audio) => { audio.volume = Math.min(1, v * gain); }); },
  };
})();
function sfx(name) {
  if (typeof UIFeedback !== 'undefined' && UIFeedback.intercept(name)) return;
  SFX.play(name);
}
// 角色發出的聲音：靠近玩家最清楚，超過 16 格逐漸淡出。
function sfxAt(name, x, y, baseGain = 0.4, sourceId = '') {
  const player = typeof G !== 'undefined' && G && G.player;
  if (!player) return;
  const cell = typeof CELL !== 'undefined' ? CELL : 40;
  const distance = Math.hypot(x - player.x, y - player.y) / cell;
  const distanceGain = distance <= 2 ? 1 : Math.max(0, (16 - distance) / 14);
  if (distanceGain > 0) SFX.play(name, baseGain * distanceGain, sourceId ? name + ':' + sourceId : name);
}

// M 鍵：靜音開關
window.addEventListener('keydown', e => {
  if (!e.repeat && e.key.toLowerCase() === 'm') {
    SFX.enabled = !SFX.enabled;
    if (typeof flash === 'function' && typeof G !== 'undefined' && G && G.player)
      flash(SFX.enabled ? '🔊 音效開' : '🔇 音效關', G.player.x, G.player.y - 40, '#8fd3ff');
  }
});
