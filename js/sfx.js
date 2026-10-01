/* ===== 音效：優先播放素材音檔，未對應的效果沿用 Web Audio 合成 =====
   呼叫：sfx('button' | 'menu' | 'switch' | 'blip' | 'place' | 'soothe'
            | 'wave' | 'win' | 'lose' | 'error' | 'berserk' | 'kill')
   調整：改 sounds 裡的參數就能改音色；SFX.volume 設總音量；按 M 鍵可靜音。
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
    gunshot: '開槍.mp3',
    reload: 'reload.mp3',
  };
  const activeAudio = new Set();
  const lastPlayed = new Map();
  function playFile(name) {
    const now = performance.now();
    if (now - (lastPlayed.get(name) || -Infinity) < 70) return;
    lastPlayed.set(name, now);
    const audio = new Audio('Sound effects/' + files[name]);
    audio.volume = Math.min(1, volume);
    activeAudio.add(audio);
    const cleanup = () => activeAudio.delete(audio);
    audio.addEventListener('ended', cleanup, { once: true });
    audio.addEventListener('error', cleanup, { once: true });
    audio.play().catch(() => { cleanup(); });
  }
  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = volume; master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
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
    kill() { tone({ freq: 420, freq2: 120, type: 'sine', dur: 0.09, gain: 0.1 }); },
    hit() { tone({ freq: 160, freq2: 70, type: 'square', dur: 0.07, gain: 0.15 }); noise({ dur: 0.06, gain: 0.08, freq: 700 }); },
  };
  function play(name) {
    if (!enabled) return;
    if (files[name]) { playFile(name); return; }
    const f = sounds[name];
    if (f) { ensure(); f(); }
  }
  return {
    play,
    get enabled() { return enabled; }, set enabled(v) {
      enabled = v;
      if (!v) { activeAudio.forEach(audio => audio.pause()); activeAudio.clear(); }
    },
    set volume(v) { volume = v; if (master) master.gain.value = v; activeAudio.forEach(audio => { audio.volume = Math.min(1, v); }); },
  };
})();
function sfx(name) {
  if (typeof UIFeedback !== 'undefined' && UIFeedback.intercept(name)) return;
  SFX.play(name);
}

// M 鍵：靜音開關
window.addEventListener('keydown', e => {
  if (!e.repeat && e.key.toLowerCase() === 'm') {
    SFX.enabled = !SFX.enabled;
    if (typeof flash === 'function' && typeof G !== 'undefined' && G && G.player)
      flash(SFX.enabled ? '🔊 音效開' : '🔇 音效關', G.player.x, G.player.y - 40, '#8fd3ff');
  }
});
