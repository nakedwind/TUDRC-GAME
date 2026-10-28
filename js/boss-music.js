// ============================================================
//  戰鬥中的 BOSS 音樂（跟 js/music.js 的一般背景音樂分開）
//  兩首各自獨立，條件都符合時一起播：
//  ・鳥頭大隊長盯上玩家（醒著、有追打目標）→ 淡入「中BOSS」；失去仇恨（走回原位、目標跑掉）或倒下 → 淡出。
//  ・異質核心甦醒 → 淡入「異質核心甦醒」，播放中音量慢慢忽大忽小；核心被打破 → 淡出。
//  ・音檔、各自的音量在「音效編輯器」的「音樂」分類（bossElite、bossCore）調整；
//    整體再乘上設定裡的「音樂」音量，按 M 靜音時也一起靜音。回到基地、劇情地圖時全部停掉。
// ============================================================
const BOSS_MUSIC = {
  sounds: { elite: 'bossElite', core: 'bossCore' },   // js/sfx.js 裡的音效名稱
  volume: 1.0,          // 整體音量倍率
  fadeIn: 2.0,          // 淡入幾秒
  fadeOut: 2.5,         // 淡出幾秒
  loseDelay: 1.5,       // 大隊長失去目標後等幾秒才淡出（衝撞完短暫停頓時不會一直切來切去）
  swell: { low: .6, high: 1.0, period: 7 },   // 核心音樂忽大忽小：最小／最大是原本的幾倍、一輪幾秒
};
const BossMusic = (() => {
  const B = BOSS_MUSIC, tracks = {};
  let unlocked = false, eliteHateT = 0, last = performance.now();

  const fileOf = name => { const it = SFX.list().find(x => x.name === name); return it && typeof it.file === 'string' ? it.file : null; };
  function track(key) {
    const file = fileOf(B.sounds[key]);
    if (!file) return null;
    if (!tracks[key] || tracks[key].file !== file) {   // 音效編輯器換了檔案：換新的
      if (tracks[key]) tracks[key].a.pause();
      const a = new Audio('Sound effects/' + file); a.loop = true; a.volume = 0;
      tracks[key] = { a, file, level: tracks[key] ? tracks[key].level : 0 };   // level：淡入淡出的進度（0～1）
    }
    return tracks[key];
  }
  const musicVolume = () => typeof SFX !== 'undefined' && !SFX.enabled ? 0 : (typeof MUSIC !== 'undefined' ? MUSIC.volume : .5) * B.volume;
  const inBattle = () => typeof G !== 'undefined' && G && !window.STORY_MODE
    && !(typeof MAP_STORY !== 'undefined' && MAP_STORY) && typeof MAP_SAFE !== 'undefined' && !MAP_SAFE;

  // 鳥頭大隊長有沒有在追打（醒著、活著、不是在走回原位、身邊有目標）
  function eliteHunting() {
    return (G.enemies || []).some(e => e.elite && e.eliteAwake && e.hp > 0 && !e.dead && e.eb
      && e.eb.state !== 'return' && (e.eb.state !== 'guard' || (typeof eliteBirdTarget === 'function' && eliteBirdTarget(e))));
  }
  const coreAwake = () => (G.cores || []).some(c => c.awake && !c.dead);

  function tick() {
    const now = performance.now(), dt = Math.min(.5, (now - last) / 1000); last = now;
    if (!unlocked) return;
    const battle = inBattle();
    if (battle && eliteHunting()) eliteHateT = B.loseDelay; else eliteHateT = Math.max(0, eliteHateT - dt);
    const want = { elite: battle && eliteHateT > 0, core: battle && coreAwake() };
    for (const key of Object.keys(B.sounds)) {
      const on = want[key];
      if (!on && !tracks[key]) continue;   // 還沒播過的不用建
      const t = track(key); if (!t) continue;
      t.level = on ? Math.min(1, t.level + dt / B.fadeIn) : Math.max(0, t.level - dt / B.fadeOut);
      const swell = key === 'core' ? B.swell.low + (B.swell.high - B.swell.low) * (.5 + .5 * Math.sin(now / 1000 * Math.PI * 2 / B.swell.period)) : 1;
      t.a.volume = Math.max(0, Math.min(1, musicVolume() * (SFX.gainOf(B.sounds[key]) ?? 1) * t.level * swell));
      if (on && t.a.paused) t.a.play().catch(() => {});
      else if (!on && t.level <= 0 && !t.a.paused) t.a.pause();   // 淡出完才停（下次從停下的地方接著播）
    }
  }
  const unlock = () => { unlocked = true; };
  window.addEventListener('pointerdown', unlock, true);
  window.addEventListener('keydown', unlock, true);
  setInterval(tick, 50);
  return { get playing() { return Object.keys(tracks).filter(k => !tracks[k].a.paused); }, level: k => tracks[k] ? tracks[k].a.volume : 0 };
})();
