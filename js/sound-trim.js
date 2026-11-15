/* ===== 音效剪輯的波形視窗（劇情編輯器（改）和音效編輯器共用）=====
   畫波形：SoundTrim.draw(畫布, 解碼好的音檔, 開始毫秒, 結束毫秒, 目前播到第幾毫秒（沒在播就給 null）)
   拖曳選段：SoundTrim.bind(畫布, () => trim, 改完要做的事)
     trim＝{ buf（解碼好的音檔）, from, to（毫秒）, drag }
     在波形上按住拖曳＝選出一段；拖兩邊的黃線＝微調開始或結束；只點一下沒拖＝選整段
*/
const SoundTrim = (() => {
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const secText = ms => (Math.round(ms) / 1000).toFixed(2);   // 毫秒 → 「0.15」這種秒數文字
  const totalOf = buf => buf ? Math.round(buf.duration * 1000) : 0;   // 音檔全長（毫秒）

  function draw(cv, buf, from, to, posMs) {
    const g = cv.getContext('2d'), W = cv.width, H = cv.height;
    g.clearRect(0, 0, W, H);
    if (!buf) { g.fillStyle = '#7f93a6'; g.font = '14px sans-serif'; g.fillText('讀取音檔中…', 12, 24); return; }
    const data = buf.getChannelData(0), total = totalOf(buf), step = Math.max(1, Math.floor(data.length / W));
    const xOf = ms => ms / total * W, x0 = xOf(from), x1 = xOf(to);
    g.fillStyle = 'rgba(255,212,121,.12)'; g.fillRect(x0, 0, x1 - x0, H);   // 選取的那一段
    for (let x = 0; x < W; x++) {   // 波形：每一欄的最高、最低
      let lo = 1, hi = -1;
      for (let i = x * step, e = Math.min(data.length, i + step); i < e; i++) { const v = data[i]; if (v < lo) lo = v; if (v > hi) hi = v; }
      g.fillStyle = x >= x0 && x <= x1 ? '#8fd3ff' : '#3c5266';
      g.fillRect(x, (1 - hi) * H / 2, 1, Math.max(1, (hi - lo) * H / 2));
    }
    g.fillStyle = '#7f93a6'; g.font = '11px sans-serif';   // 時間刻度：每 0.5 秒（太長就每 1 秒）
    const tick = total > 8000 ? 1000 : 500;
    for (let ms = 0; ms <= total; ms += tick) { const x = xOf(ms); g.fillRect(x, H - 6, 1, 6); g.fillText(secText(ms), x + 2, H - 8); }
    g.fillStyle = '#ffd479'; g.fillRect(x0 - 1, 0, 2, H); g.fillRect(x1 - 1, 0, 2, H);   // 開始、結束的黃線
    if (posMs != null) { g.fillStyle = '#fff'; g.fillRect(xOf(posMs), 0, 1, H); }   // 試聽中：白線＝播到哪
  }

  function bind(cv, getTrim, changed) {
    const msAt = (e, t) => { const r = cv.getBoundingClientRect(); return clamp((e.clientX - r.left) / r.width, 0, 1) * totalOf(t.buf); };
    cv.addEventListener('pointerdown', e => {
      const t = getTrim(); if (!t?.buf) return;
      const ms = msAt(e, t), near = totalOf(t.buf) * 8 / cv.getBoundingClientRect().width;   // 離黃線 8 像素內＝拖那條線
      t.drag = Math.abs(ms - t.from) <= near ? 'from' : Math.abs(ms - t.to) <= near ? 'to' : 'new';
      if (t.drag === 'new') { t.anchor = ms; t.from = t.to = ms; }
      try { cv.setPointerCapture(e.pointerId); } catch (err) {}   // 拖到波形外面也繼續算
      changed();
    });
    cv.addEventListener('pointermove', e => {
      const t = getTrim(); if (!t?.drag) return;
      const ms = msAt(e, t);
      if (t.drag === 'new') { t.from = Math.min(t.anchor, ms); t.to = Math.max(t.anchor, ms); }
      else if (t.drag === 'from') t.from = Math.min(ms, t.to);
      else t.to = Math.max(ms, t.from);
      changed();
    });
    cv.addEventListener('pointerup', () => {
      const t = getTrim(); if (!t?.drag) return;
      if (t.drag === 'new' && t.to - t.from < 20) { t.from = 0; t.to = totalOf(t.buf); }   // 只點一下沒拖：選整段
      t.drag = null; changed();
    });
  }

  return { draw, bind, secText, totalOf };
})();
