/* ===== 素材搬家：把瀏覽器裡的舊路徑換成新路徑 =====
   素材搬到別的資料夾之後（素材搬家.bat、tools/asset-move.py），專案裡的檔案已經改好了，
   但編輯器的暫存（瀏覽器的 localStorage、資料庫）還寫著舊路徑。這裡在頁面一打開時換一次：
   ・對照表在 data/asset-moves.js，一次搬家一批。這台瀏覽器做過第幾批記在 localStorage，做過的不會重做。
   ・合併用的備份（tudrc_backup__ 開頭）不改：那是留著救資料用的原始內容。
   ・編輯器的暫存空間（js/map-editor-store.js 等）會等 AssetMoves.ready 做完才開始讀。
   ・換路徑的規則跟 tools/asset-move.py 的 Rewriter 一樣，改這裡要一起改。
   必須在 data/asset-moves.js 之後、其他程式之前載入。 */
window.AssetMoves = (() => {
  const MARK = 'tudrc_asset_moves_applied', BACKUP_PREFIX = 'tudrc_backup__';
  const batches = window.ASSET_MOVE_BATCHES || [];
  const isWord = ch => /[\p{L}\p{N}_-]/u.test(ch);
  function makeRewriter(batch) {
    const rows = [...Object.entries(batch.files || {}).map(([o, n]) => [o, n, false]), ...Object.entries(batch.folders || {}).map(([o, n]) => [o, n, true])]
      .sort((a, b) => b[0].length - a[0].length);
    const tops = [...new Set(rows.map(r => r[0].split('/')[0]))];
    const sound = batch.sound || {};
    const startOk = (s, i) => {
      if (i === 0) return true;
      const prev = s[i - 1];
      if (prev === '/') return s.slice(Math.max(0, i - 3), i) === '../' || s.slice(Math.max(0, i - 2), i) === './';
      return !(isWord(prev) || prev === '.' || prev === '\\');
    };
    const endOk = (s, end, old, isFolder) => {
      const after = s[end] || '';
      if (after && isWord(after)) return false;
      if (after === '.' && s[end + 1] && isWord(s[end + 1])) return false;
      if (isFolder && !old.includes('/')) return after === '/';   // 最上層資料夾（images、music…）也常是一般的字（例如 id: 'music'）：只換後面接著 / 的
      return true;
    };
    return s => {
      let out = '', last = 0;
      if (tops.length) {
        const anchor = new RegExp(tops.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g');
        for (let m; (m = anchor.exec(s));) {
          const pos = m.index;
          if (pos < last || !startOk(s, pos)) continue;
          const hit = rows.find(([old, , isFolder]) => s.startsWith(old, pos) && endOk(s, pos + old.length, old, isFolder));
          if (hit) { out += s.slice(last, pos) + hit[1]; last = pos + hit[0].length; }
        }
      }
      out += s.slice(last);
      if (Object.keys(sound).length) out = out.replace(/(["'`])([^"'`\n]+\.(?:mp3|ogg|wav|m4a|flac))\1/gi, (all, q, path) => sound[path] ? q + sound[path] + q : all);
      return out;
    };
  }
  function run() {
    let applied = 0;
    try { applied = Number(localStorage.getItem(MARK)) || 0; } catch (_) { return Promise.resolve(); }
    if (applied >= batches.length) return Promise.resolve();   // 平常都走這裡：沒有新的搬家，什麼都不用做
    const fixers = batches.slice(applied).map(makeRewriter);
    const fix = s => fixers.reduce((text, f) => f(text), s);
    const done = () => { try { localStorage.setItem(MARK, String(batches.length)); } catch (_) {} };
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k === MARK || k.startsWith(BACKUP_PREFIX)) continue;
        const v = localStorage.getItem(k), next = fix(v);
        if (next !== v) localStorage.setItem(k, next);
      }
    } catch (e) { console.warn('素材搬家：瀏覽器暫存沒有換完', e); }
    return new Promise(resolve => {
      const finish = () => { done(); resolve(); };
      let r;
      try { r = indexedDB.open('tudrc_editor', 1); } catch (_) { finish(); return; }
      r.onupgradeneeded = () => r.result.createObjectStore('kv');
      r.onerror = finish;
      r.onsuccess = () => {
        const db = r.result, tx = db.transaction('kv', 'readwrite');
        tx.objectStore('kv').openCursor().onsuccess = e => {
          const c = e.target.result; if (!c) return;
          if (typeof c.value === 'string' && !String(c.key).startsWith(BACKUP_PREFIX)) { const next = fix(c.value); if (next !== c.value) c.update(next); }
          c.continue();
        };
        tx.oncomplete = () => { db.close(); finish(); };
        tx.onerror = tx.onabort = () => { db.close(); console.warn('素材搬家：編輯器暫存沒有換完', tx.error); resolve(); };   // 沒成功：不記做過，下次再試
      };
    });
  }
  return { ready: run() };
})();
