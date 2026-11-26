/* ===== 地圖專屬的環境背景音：在某張地圖上一直循環播放，離開這張地圖就淡出 =====
   ・哪張地圖播哪些：地圖編輯器 →「地圖設定」→「🔊 環境背景音」打勾（可以勾好幾個，一起播）
     存在地圖資料的 ambient：['音效名稱', …]（空陣列＝都不播）
   ・Y 區的白噪音（js/ambience.js）另外算：每張地圖可以調它的音量（地圖設定的「白噪音音量 %」＝MAP.whiteNoise）
   ・音檔、音量在「音效編輯器」調整（音效名稱就是下面 AMBIENT_SOUNDS 的 sound）
   ・音量跟著設定裡的「音效」音量走；勾選靜音、編輯器預覽視窗關掉背景音時也會一起靜音
   ・瀏覽器規定網頁要先被點一下或按一個鍵才能出聲，所以第一次操作之後才會開始播 */

// 地圖編輯器裡可以勾的背景音（想加新的：先在 js/sfx.js 加音效，再在這裡加一行）
const AMBIENT_SOUNDS = [
  { sound: 'poolDrip', name: '滴水聲' },
  { sound: 'poolWaterDrop', name: '水滴聲' },
];
// 地圖資料還沒設定過時的預設（地圖編輯器改過一次之後就照地圖資料）
const MAP_AMBIENT_DEFAULT = {
  map_mv1bzur4: { ambient: ['poolDrip', 'poolWaterDrop'], whiteNoise: 70 },   // 04. 池核：滴水聲＋水滴聲，白噪音 70%
  'map_89aacb92-4b89-47ec-a76b-0908972d3fdf': { ambient: ['poolDrip', 'poolWaterDrop'], whiteNoise: 70 },   // W118區 地下水池：跟池核一樣
  'map_w118_deep_test': { ambient: ['poolDrip', 'poolWaterDrop'], whiteNoise: 70 },   // W118區 超深水區（魚頭王測試）：跟 W118 一樣
};
const MAP_AMBIENT_FADE = 1.5;   // 進出地圖時淡入淡出幾秒

// 這張地圖要播的背景音（音效名稱的陣列）
function mapAmbientOf(m) {
  if (!m) return [];
  const v = m.ambient !== undefined ? m.ambient : (MAP_AMBIENT_DEFAULT[m.id] || {}).ambient;
  return Array.isArray(v) ? v.filter(Boolean) : (typeof v === 'string' && v ? [v] : []);   // 舊資料是一個字串：也認得
}
// 這張地圖的白噪音音量（0～1；js/ambience.js 用）
function mapWhiteNoiseOf(m) {
  if (!m) return 1;
  const v = Number(m.whiteNoise !== undefined ? m.whiteNoise : (MAP_AMBIENT_DEFAULT[m.id] || {}).whiteNoise);
  return Number.isFinite(v) ? Math.max(0, Math.min(100, v)) / 100 : 1;
}

(() => {
  if (typeof document === 'undefined' || !/塔防原型/.test(decodeURIComponent(location.pathname))) return;   // 只有遊戲畫面會播（編輯器只借用上面的清單）
  let unlocked = false;
  const players = new Map();   // 音效名稱 → { audio, file }
  ['pointerdown', 'keydown'].forEach(n => window.addEventListener(n, () => { unlocked = true; }, true));
  const fileOf = name => { const it = SFX.list().find(x => x.name === name); return it && typeof it.file === 'string' ? it.file : null; };
  function tick() {
    if (!unlocked || typeof SFX === 'undefined') return;
    const want = new Set(typeof MAP !== 'undefined' ? mapAmbientOf(MAP) : []);
    const muted = !SFX.enabled || (typeof previewBgMuted === 'function' && previewBgMuted());
    for (const name of new Set([...want, ...players.keys()])) {
      const file = fileOf(name);
      const vol = want.has(name) && file && !muted ? Math.min(1, SFX.volume * (SFX.gainOf(name) ?? 1)) : 0;
      let pl = players.get(name);
      if (file && vol > 0 && (!pl || (pl.file !== file && pl.audio.volume <= 0))) {   // 第一次播，或在音效編輯器換了音檔（等舊的淡出再換）
        if (pl) pl.audio.pause();
        pl = { audio: new Audio('Sound effects/' + file), file }; pl.audio.loop = true; pl.audio.volume = 0; players.set(name, pl);
      }
      if (!pl) continue;
      const target = pl.file === file ? vol : 0, a = pl.audio;
      const step = .1 / MAP_AMBIENT_FADE * Math.max(vol, a.volume, .05);
      a.volume = Math.max(0, Math.min(1, a.volume + Math.max(-step, Math.min(step, target - a.volume))));
      if (target > 0 && a.paused) a.play().catch(() => {});
      else if (target <= 0 && a.volume <= 0 && !a.paused) a.pause();
    }
  }
  setInterval(tick, 100);
})();
