/* ===== 池核的力場產生器（Poolcore_field-generator.png）：溫特第一次走近時的音效 =====
   ・溫特走到產生器一格內：同時播「無線電雜音＋無線電」和「拉炮」，過 0.4 秒再播「生日吹笛」、過 0.6 秒再播「Jumpscare」
   ・在這張地圖裡只會觸發一次；離開這張地圖再回來，才會再觸發一次
   ・只有 FIELD_GEN.maps 裡的地圖會觸發（其他地圖放這張圖只是裝飾）
   ・音檔、音量在「音效編輯器」調整：fieldGenRadio、fieldGenPopper、fieldGenHorn（js/sfx.js）；Jumpscare＝音效編輯器裡的自訂音效「Jumpscare」（音檔、剪輯的段落都在 data/sound-settings.js） */
const FIELD_GEN = {
  maps: ['map_mv1bzur4'],   // 04. 池核
  file: /\/Poolcore_field-generator\.png$/,
  reach: 1,                 // 離產生器幾格內算「走近」（量到圖片範圍最近的地方）
  hornDelay: 400,           // 生日吹笛晚幾毫秒播
  jumpscareDelay: 600,      // Jumpscare 晚幾毫秒播（跟無線電、拉炮比）
};

(() => {
  if (typeof document === 'undefined') return;
  let doneMap = null, spotsMap = null, spots = [];
  // 這張地圖上所有的產生器（圖片的範圍，像素）：換地圖才重找
  function genSpots() {
    if (spotsMap === MAP) return spots;
    spotsMap = MAP; spots = [];
    const isGen = id => { const t = mapTileById(id); return !!t && FIELD_GEN.file.test(String(t.file || '').replace(/\\/g, '/')); };
    for (const s of MAP.stamps || []) {
      if (!isGen(s.id)) continue;
      const t = mapTileById(s.id), x0 = OX + s.c * CELL + (s.ox || 0), y0 = OY + s.r * CELL + (s.oy || 0);
      spots.push({ x0, y0, x1: x0 + mapStampW(s, t) * CELL, y1: y0 + mapStampH(s, t) * CELL });
    }
    for (const lid in MAP.layers || {}) for (const key in MAP.layers[lid]) {   // 鋪在圖層上的小圖
      if (!isGen(MAP.layers[lid][key])) continue;
      const [c, r] = key.split(',').map(Number), x0 = OX + c * CELL, y0 = OY + r * CELL;
      spots.push({ x0, y0, x1: x0 + CELL, y1: y0 + CELL });
    }
    return spots;
  }
  let lastMap = null, lastG = null;
  setInterval(() => {
    if (typeof MAP === 'undefined' || !MAP || typeof G === 'undefined' || !G) return;
    if (MAP !== lastMap || G !== lastG) { lastMap = MAP; lastG = G; doneMap = null; }   // 換了地圖（離開再回來也算）、重新開始這一局：可以再觸發一次
    if (doneMap === MAP || !FIELD_GEN.maps.includes(MAP.id) || !G.running || G.over || !G.player) return;
    const p = G.player, R = FIELD_GEN.reach * CELL;
    const near = genSpots().some(b => Math.hypot(Math.max(b.x0 - p.x, 0, p.x - b.x1), Math.max(b.y0 - p.y, 0, p.y - b.y1)) <= R);
    if (!near) return;
    doneMap = MAP;
    sfx('fieldGenRadio'); sfx('fieldGenPopper');
    setTimeout(() => sfx('fieldGenHorn'), FIELD_GEN.hornDelay);
    setTimeout(() => sfx('Jumpscare'), FIELD_GEN.jumpscareDelay);
  }, 100);
})();
