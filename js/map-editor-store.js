/* ===== 🗺️ 地圖編輯器（戰鬥地圖）的存檔空間 =====
   地圖、素材的暫存原本放在瀏覽器的 localStorage（大約只有 5MB，地圖越畫越多會突然存不進去）。
   現在改放到瀏覽器的資料庫（IndexedDB，空間大很多），第一次打開時會自動把舊的暫存搬過去。
   用法：頁面先載入這個檔案，再用 EditorStore.boot([...]) 依序載入編輯器程式（等資料庫讀好才開始）。
   編輯器裡讀寫地圖／素材暫存改用 EditorStore.getItem / setItem / removeItem（用法跟 localStorage 一樣）。
   其他小設定照舊放 localStorage。
   基地編輯器有自己的一份（js/base-editor-store.js）。地圖暫存用不同的名稱、兩邊互不覆蓋；只有素材庫暫存兩邊共用。
*/
const EditorStore = (() => {
  const DB_NAME = 'tudrc_editor', STORE = 'kv';
  const MAPS_KEY = 'tudrc_battle_maps_v1';     // 地圖編輯器自己的地圖暫存（js/map-editor.js 的 STORAGE_MAPS）
const TILES_KEY = 'tudrc_shared_tiles_v1';   // 素材庫：兩個編輯器共用（js/map-editor.js 的 STORAGE_TILES）
  // 放進資料庫的大資料；後面兩個是分開之前兩個編輯器共用的舊暫存，只讀來搬一次（js/map-editor.js 的 oldSharedDraft）
  // 素材還沒共用之前兩邊各自的素材暫存（tudrc_battle_tiles_v1、tudrc_base_tiles_v1）也讀進來，只搬一次
  const BIG = new Set([MAPS_KEY, TILES_KEY, 'tudrc_maps_v4', 'tudrc_tiles_v3', 'tudrc_battle_tiles_v1', 'tudrc_base_tiles_v1']);
  // 自動合併用的「基準」和合併前的備份（js/draft-sync.js）：跟著地圖、素材一起放資料庫，不佔 localStorage
  const SIDE = ['tudrc_base__', 'tudrc_backup__'];
  const isBig = k => BIG.has(k) || SIDE.some(p => k.startsWith(p) && BIG.has(k.slice(p.length)));
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
      for (const k of [...BIG, ...[...BIG].map(k => SIDE[0] + k)]) { const v = await req(st.get(k)); if (v != null) cache.set(k, v); }
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
    getItem(k) { return isBig(k) ? (cache.has(k) ? cache.get(k) : null) : localStorage.getItem(k); },
    // 寫入：回傳 Promise；失敗時 EditorStore.lastError 會記下原因（編輯器狀態列會顯示）
    setItem(k, v) {
      if (!isBig(k)) { localStorage.setItem(k, v); return Promise.resolve(); }
      cache.set(k, String(v));
      return write(k, String(v)).then(() => { failed = null; }, e => { failed = e; throw e; });
    },
    removeItem(k) {
      if (!isBig(k)) { localStorage.removeItem(k); return; }
      cache.delete(k); localStorage.removeItem(k);
      if (db) { const tx = db.transaction(STORE, 'readwrite'); tx.objectStore(STORE).delete(k); }
    },
    get lastError() { return failed; },
    // 其他東西（例如遊戲資料夾的位置）也存在同一個資料庫
    async getRaw(k) { if (!db) return null; try { return await req(db.transaction(STORE).objectStore(STORE).get(k)); } catch (_) { return null; } },
    async setRaw(k, v) { if (!db) return; const tx = db.transaction(STORE, 'readwrite'); tx.objectStore(STORE).put(v, k); },
    usingDatabase: () => !!db,
    // 用了多少：地圖、素材各多大；瀏覽器還能用多少
    async usage() {
      const size = k => (cache.get(k) || '').length * 2;
      let quota = null, used = null;
      try { if (navigator.storage && navigator.storage.estimate) { const e = await navigator.storage.estimate(); quota = e.quota; used = e.usage; } } catch (_) {}
      return { maps: size(MAPS_KEY), tiles: size(TILES_KEY), quota, used, db: !!db };
    },
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
