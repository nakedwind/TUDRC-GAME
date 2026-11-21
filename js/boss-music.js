// ============================================================
//  戰鬥中的 BOSS 音樂（跟 js/music.js 的一般背景音樂分開）
//  兩首各自獨立，條件都符合時一起播：
//  ・鳥頭大隊長盯上玩家（醒著、有追打目標）、大夯吉寶盯上溫特（js/elite-cap-king.js）→ 淡入「中BOSS」（每場戰鬥第一次被盯上時晚 startDelay 秒才開始）；
//    失去仇恨（走回原位、目標跑掉）但畫面上方的 BOSS 血條還在 → 照樣播；BOSS 全部倒下、血條消失 → 淡出。
//    音量看溫特離最近的 BOSS 多遠：越近越大聲、越遠越小聲（distance，所有 BOSS 都一樣）。
//  ・異質核心甦醒 → 馬上淡入「異質核心甦醒」，播放中音量慢慢忽大忽小；核心被打破 → 淡出。
//  ・音檔、各自的音量在「音效編輯器」的「音樂」分類（bossElite、bossCore）調整；
//    整體再乘上設定裡的「音樂」音量，設定裡勾選靜音時也一起靜音。回到基地、劇情地圖時全部停掉。
// ============================================================
const BOSS_MUSIC = {
  sounds: { elite: 'bossElite', core: 'bossCore' },   // js/sfx.js 裡的音效名稱
  volume: 1.0,          // 整體音量倍率
  fadeIn: 2.0,          // 淡入幾秒
  fadeOut: 2.5,         // 淡出幾秒
  loseDelay: 1.5,       // 大隊長失去目標後等幾秒才淡出（衝撞完短暫停頓時不會一直切來切去）
  // 「中BOSS」音量照溫特離最近的 BOSS 幾格：[格數, 音量倍率]，中間照比例；比第一點近＝第一點的音量，比最後一點遠＝最後一點的音量
  // 2026-11-21 使用者指定：音樂音量 50%、音效編輯器 bossElite 80% 時，聽到 3 格內 0.30、20 格 0.20、40 格 0.05
  distance: [[3, .75], [20, .5], [40, .125]],
  startDelay: 2,        // 每場戰鬥第一次被大隊長盯上：等幾秒才開始播「中BOSS」（之後再被盯上就馬上播；核心甦醒的音樂一律馬上播）
  swell: { low: .6, high: 1.0, period: 7 },   // 核心音樂忽大忽小：最小／最大是原本的幾倍、一輪幾秒
  // 池核的巨大比基尼小丑魚（js/pool-boss.js）：醒了就一直算「在追打」，所以改看距離——
  // 溫特離牠 farCells 格以外就淡出（連小聲播著也不要）；走回 nearCells 格以內再淡入（中間留一點，不會在邊界忽大忽小）
  poolFar: { farCells: 30, nearCells: 28 },
};
const BossMusic = (() => {
  const B = BOSS_MUSIC, tracks = {};
  let unlocked = false, eliteHateT = 0, last = performance.now();
  let eliteWaitT = 0, eliteHeard = false, battleG = null;   // 大隊長盯上了多久；這場戰鬥的「中BOSS」播過了沒（換地圖、新的一場重算）

  // 音效編輯器裡設的檔案：一個（字串）或好幾個（陣列＝疊在一起播，跟一般音效一樣，例如「異質核心甦醒」＋「異質核心甦醒02」）
  // 以前只認一個檔案，設成兩個時整首都不播（異質核心甦醒的音樂就是這樣不見的）
  const filesOf = name => {
    const it = SFX.list().find(x => x.name === name), f = it && it.file;
    const list = Array.isArray(f) ? f : typeof f === 'string' ? [f] : [];
    return list.filter(x => typeof x === 'string' && x);
  };
  function track(key) {
    const files = filesOf(B.sounds[key]);
    if (!files.length) return null;
    const file = files.join('|');
    if (!tracks[key] || tracks[key].file !== file) {   // 音效編輯器換了檔案：換新的
      if (tracks[key]) tracks[key].as.forEach(a => a.pause());
      const as = files.map(f => { const a = new Audio('Sound effects/' + f); a.loop = true; a.volume = 0; return a; });   // 每個檔案一條，同時播
      tracks[key] = { as, file, level: tracks[key] ? tracks[key].level : 0 };   // level：淡入淡出的進度（0～1）
    }
    return tracks[key];
  }
  const musicVolume = () => typeof SFX !== 'undefined' && !SFX.enabled ? 0 : (typeof MUSIC !== 'undefined' ? MUSIC.volume : .5) * B.volume;
  const inBattle = () => typeof G !== 'undefined' && G && !window.STORY_MODE
    && !(typeof MAP_STORY !== 'undefined' && MAP_STORY) && typeof MAP_SAFE !== 'undefined' && !MAP_SAFE;

  // 鳥頭大隊長有沒有在追打（醒著、活著、不是在走回原位、身邊有目標）
  function eliteHunting() {
    if (typeof loofahQueenHunting === 'function' && loofahQueenHunting()) return true;
    if (typeof bananaEmperorHunting === 'function' && bananaEmperorHunting()) return true;
    if (typeof gourdKingHunting === 'function' && gourdKingHunting()) return true;
    if (typeof ratKingHunting === 'function' && ratKingHunting()) return true;   // 花蓮老鼠王（js/rat-king.js）   // 葫蘆猴王（js/gourd-king.js）   // 金蕉大王（js/banana-emperor.js）   // 絲瓜女王的 BOSS 戰（js/loofah-queen.js）
    if (typeof pearlBossHunting === 'function' && pearlBossHunting()) return true;
    if (typeof milkfishKingHunting === 'function' && milkfishKingHunting()) return true;   // 虱目魚王（js/milkfish-king.js）
    if (typeof mothBossHunting === 'function' && mothBossHunting()) return true;   // 人面蝶后（js/moth-boss.js）
    if (typeof poolBossHunting === 'function' && poolBossHunting() && !poolBossFar) return true;   // 池核的巨大比基尼小丑魚（js/pool-boss.js）；離太遠不算   // 珍珠大童的 BOSS 戰（js/pearl-elder.js）
    if (typeof capKingHunting === 'function' && capKingHunting()) return true;   // 大夯吉寶盯上溫特（js/elite-cap-king.js）
    return (G.enemies || []).some(e => e.elite && e.eliteAwake && e.hp > 0 && !e.dead && e.eb
      && e.eb.state !== 'return' && (e.eb.state !== 'guard' || (typeof eliteBirdTarget === 'function' && eliteBirdTarget(e))));
  }
  const coreAwake = () => (G.cores || []).some(c => c.awake && !c.dead);
  // 場上活著的 BOSS（各 BOSS 檔案給怪物加的記號）；老鼠王抓人的手不算
  const isBoss = e => e && !e.dead && e.hp > 0 && !e.ratKingHand && (e.elite || e.capKing || e.pearlBoss || e.mothBoss || e.loofahQueen
    || e.bananaEmperor || e.gourdKing || e.ratKing || e.poolBoss || e.behavior === 'milkfishKing');
  // 溫特離最近的 BOSS 幾格（找不到 BOSS，例如大夯吉寶都還躲在帽子裡＝null）
  function nearestBossCells() {
    const p = G && G.player; if (!p) return null;
    let best = null;
    for (const e of G.enemies || []) if (isBoss(e)) { const d = Math.hypot(e.x - p.x, e.y - p.y) / CELL; if (best == null || d < best) best = d; }
    return best;
  }
  // 距離 → 音量倍率（照 distance 那幾個點畫直線）
  function distanceMul(d) {
    const pts = B.distance;
    if (d == null || d <= pts[0][0]) return pts[0][1];
    for (let i = 1; i < pts.length; i++) {
      const [d0, v0] = pts[i - 1], [d1, v1] = pts[i];
      if (d <= d1) return v0 + (v1 - v0) * (d - d0) / (d1 - d0);
    }
    return pts[pts.length - 1][1];
  }
  // 溫特離池核 BOSS 夠不夠遠（tick 每次更新；超過 farCells 才變遠、回到 nearCells 以內才變近）
  let poolBossFar = false;
  function updatePoolBossFar() {
    const pb = typeof poolBossState === 'function' && poolBossState(), p = G && G.player;
    if (!pb || !pb.e || !p) { poolBossFar = false; return; }
    const d = Math.hypot(pb.e.x - p.x, pb.e.y - p.y) / CELL;
    poolBossFar = poolBossFar ? d > B.poolFar.nearCells : d > B.poolFar.farCells;
  }
  // 畫面上方還有 BOSS 血條（鳥頭大隊長、大夯吉寶、珍珠大童；跟 js/core-frenzy.js 的 drawCoreBossUI 同一份資料）
  const bossBarShown = () => [typeof eliteBossBars === 'function' && eliteBossBars(), typeof capKingBossBars === 'function' && capKingBossBars(),
    typeof pearlBossBars === 'function' && pearlBossBars(), typeof mothBossBars === 'function' && mothBossBars(), !poolBossFar && typeof poolBossBars === 'function' && poolBossBars(), typeof loofahQueenBars === 'function' && loofahQueenBars(), typeof bananaEmperorBars === 'function' && bananaEmperorBars(), typeof gourdKingBars === 'function' && gourdKingBars(), typeof milkfishKingBars === 'function' && milkfishKingBars(), typeof ratKingBars === 'function' && ratKingBars()].some(bars => bars && bars.length)
    || (typeof capKingMusicHold === 'function' && capKingMusicHold());   // 順順宮主：第一隻大夯吉寶出現後，直到全部（含帽子裡的）打倒都不停（js/elite-cap-king.js）

  function tick() {
    const now = performance.now(), dt = Math.min(.5, (now - last) / 1000); last = now;
    if (!unlocked) return;
    const battle = inBattle();
    if (battle) updatePoolBossFar();
    if (battle && eliteHunting()) eliteHateT = B.loseDelay; else eliteHateT = Math.max(0, eliteHateT - dt);
    if (!battle || G !== battleG) { battleG = battle ? G : null; eliteHeard = false; eliteWaitT = 0; }   // 離開戰鬥、新的一場：重算「第一次」
    const claw = typeof clawOpen !== 'undefined' && clawOpen;   // 夾娃娃機開著：放機台自己的音樂（js/claw-machine.js）
    const want = { elite: battle && !claw && eliteHateT > 0, core: battle && !claw && coreAwake() };
    const bars = battle && bossBarShown();
    const nearMul = battle ? distanceMul(nearestBossCells()) : 0;   // 離最近的 BOSS 越遠越小聲
    for (const key of Object.keys(B.sounds)) {
      let on = want[key];
      if (key === 'elite') {   // 這場戰鬥第一次被盯上：晚 startDelay 秒才開始播
        eliteWaitT = on ? eliteWaitT + dt : 0;
        if (on && !eliteHeard && eliteWaitT < B.startDelay) on = false;
        if (on) eliteHeard = true;
      }
      let goal = on ? 1 : 0;
      if (key === 'elite') goal = on || bars ? nearMul : 0;   // 中BOSS：在追打、或血條還在就播，音量照離 BOSS 多遠
      if (!goal && !tracks[key]) continue;   // 還沒播過的不用建
      const t = track(key); if (!t) continue;
      t.level = t.level < goal ? Math.min(goal, t.level + dt / B.fadeIn) : Math.max(goal, t.level - dt / B.fadeOut);
      on = goal > 0;
      const swell = key === 'core' ? B.swell.low + (B.swell.high - B.swell.low) * (.5 + .5 * Math.sin(now / 1000 * Math.PI * 2 / B.swell.period)) : 1;
      const vol = Math.max(0, Math.min(1, musicVolume() * (SFX.gainOf(B.sounds[key]) ?? 1) * t.level * swell));
      for (const a of t.as) {   // 疊在一起的每一條都同樣處理
        a.volume = vol;
        if (on && a.paused) a.play().catch(() => {});
        else if (!on && t.level <= 0 && !a.paused) a.pause();   // 淡出完才停（下次從停下的地方接著播）
      }
    }
  }
  const unlock = () => { unlocked = true; };
  window.addEventListener('pointerdown', unlock, true);
  window.addEventListener('keydown', unlock, true);
  setInterval(tick, 50);
  return { get playing() { return Object.keys(tracks).filter(k => tracks[k].as.some(a => !a.paused)); }, level: k => tracks[k] ? tracks[k].as[0].volume : 0 };
})();
