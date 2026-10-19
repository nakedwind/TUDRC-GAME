/* ===== 🪑 椅子編輯器：讀地圖編輯器、基地編輯器的素材暫存 =====
   椅子編輯器要列出「還沒存到專案、只在編輯器暫存裡」的新素材，所以要讀兩個地圖編輯器放在瀏覽器資料庫（IndexedDB）的素材暫存。
   這裡只拿來讀，不會改動兩個編輯器暫存的內容。
   用法：頁面先載入這個檔案，再用 EditorStore.boot([...]) 依序載入編輯器程式（等資料庫讀好才開始）。
*/
const EditorStore = (() => {
  const DB_NAME = 'tudrc_editor', STORE = 'kv';
  // 地圖編輯器、基地編輯器各自的素材暫存；最後一個是分開之前兩邊共用的舊暫存（js/chair-editor.js 會依序讀）
  const BIG = new Set(['tudrc_battle_tiles_v1', 'tudrc_base_tiles_v1', 'tudrc_tiles_v3']);
  const cache = new Map();
  let db = null, failed = null;
  const req = r => new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  function open() {
    return new Promise((res, rej) => {
      const r = indexedDB.open(DB_NAME, 1);
      r.onupgradeneeded = () => r.result.createObjectStore(STORE);
      r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
    });
  }
  function write(key, value) {
    if (!db) { try { localStorage.setItem(key, value); return Promise.resolve(); } catch (e) { return Promise.reject(e); } }
    return new Promise((res, rej) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(value, key);
      tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); tx.onabort = () => rej(tx.error);
    });
  }
  async function load() {
    try {
      db = await open();
      const st = db.transaction(STORE).objectStore(STORE);
      for (const k of BIG) { const v = await req(st.get(k)); if (v != null) cache.set(k, v); }
    } catch (e) { db = null; console.warn('瀏覽器資料庫打不開，改用 localStorage', e); }
    // 舊暫存搬家：localStorage → 資料庫（確定寫進去了才刪掉舊的，騰出空間）
    for (const k of BIG) {
      const v = localStorage.getItem(k);
      if (v == null) continue;
      if (!cache.has(k)) cache.set(k, v);
      if (db) { try { if (cache.get(k) === v) await write(k, v); localStorage.removeItem(k); } catch (e) { console.warn('搬家失敗，保留舊暫存', k, e); } }
    }
  }
  return {
    getItem(k) { return BIG.has(k) ? (cache.has(k) ? cache.get(k) : null) : localStorage.getItem(k); },
    // 寫入：回傳 Promise；失敗時 EditorStore.lastError 會記下原因（編輯器狀態列會顯示）
    setItem(k, v) {
      if (!BIG.has(k)) { localStorage.setItem(k, v); return Promise.resolve(); }
      cache.set(k, String(v));
      return write(k, String(v)).then(() => { failed = null; }, e => { failed = e; throw e; });
    },
    removeItem(k) {
      if (!BIG.has(k)) { localStorage.removeItem(k); return; }
      cache.delete(k); localStorage.removeItem(k);
      if (db) { const tx = db.transaction(STORE, 'readwrite'); tx.objectStore(STORE).delete(k); }
    },
    get lastError() { return failed; },
    // 其他東西（例如遊戲資料夾的位置）也存在同一個資料庫
    async getRaw(k) { if (!db) return null; try { return await req(db.transaction(STORE).objectStore(STORE).get(k)); } catch (_) { return null; } },
    async setRaw(k, v) { if (!db) return; const tx = db.transaction(STORE, 'readwrite'); tx.objectStore(STORE).put(v, k); },
    usingDatabase: () => !!db,
    // 等資料庫讀好，再依序載入編輯器的程式檔
    boot(srcs, onDone) {   // onDone：全部載入完成後執行
      load().finally(() => {
        const next = i => {
          if (i >= srcs.length) { if (onDone) onDone(); return; }
          const s = document.createElement('script'); s.src = srcs[i]; s.onload = () => next(i + 1);
          s.onerror = () => { console.error('載入失敗：' + srcs[i]); next(i + 1); };
          document.body.appendChild(s);
        };
        next(0);
      });
    },
  };
})();
