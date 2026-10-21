/* ===== 編輯器暫存 × 專案檔：自動合併（多人協作不掉資料）=====
   問題：每個編輯器都把資料暫存在瀏覽器裡，打開時「暫存優先」。朋友推送了新內容、你拉下來之後，
         編輯器還是顯示你瀏覽器裡的舊暫存；一按「💾 存到專案」，就用舊暫存把朋友的修改整個蓋掉。
   解法：暫存旁邊多記一份「基準」＝這份暫存是根據哪一版專案檔編輯的。打開編輯器時三方比對：
         ・只有檔案變了（朋友改的、你剛拉下來的）→ 用檔案的
         ・只有暫存變了（你自己改、還沒存到專案的）→ 用你的
         ・兩邊都改了 → 一層一層往下比，各取各改的地方（例如朋友加了 NPC、你改了地圖物件，兩個都留下）
         ・兩邊改了「同一個值」→ 保留你的，並在畫面上方提示；被取代的版本備份在瀏覽器裡
   用法（取代原本的 JSON.parse(localStorage.getItem(KEY))）：
     const merged = DraftSync.load(KEY, 檔案裡的資料, { label: '戰鬥地圖', store: EditorStore });
     // merged：合併後的資料；沒有暫存時回傳 null（照舊用檔案的資料）
   另外 js/project-save.js 存檔前會再檢查一次：檔案在你打開編輯器之後被改過（例如剛拉取），就先擋下來請你重新整理。
*/
const DraftSync = (() => {
  const BASE_PREFIX = 'tudrc_base__';      // 基準：BASE_PREFIX + 暫存的 key（大資料放 EditorStore 的資料庫，見 js/map-editor-store.js）
  const BACKUP_PREFIX = 'tudrc_backup__';  // 被取代的版本：每個暫存只留最近一份
  const notes = [];

  // ---- 比對用：key 排序後轉成字串（物件 key 順序不同也算一樣）----
  const memo = new WeakMap();
  function canon(v) {
    if (v === undefined) return undefined;
    if (v === null || typeof v !== 'object') return JSON.stringify(v);
    if (memo.has(v)) return memo.get(v);
    const s = Array.isArray(v)
      ? '[' + v.map(x => canon(x) ?? 'null').join(',') + ']'
      : '{' + Object.keys(v).filter(k => v[k] !== undefined).sort().map(k => JSON.stringify(k) + ':' + canon(v[k])).join(',') + '}';
    memo.set(v, s);
    return s;
  }
  const eq = (a, b) => canon(a) === canon(b);
  const isObj = v => !!v && typeof v === 'object' && !Array.isArray(v);
  const hasId = v => isObj(v) && (typeof v.id === 'string' || typeof v.id === 'number');

  // ---- 三方合併：b＝基準、d＝你的暫存、f＝現在的檔案；legacy＝沒有基準（第一次啟用）----
  function merge(b, d, f, ctx, path) {
    if (eq(d, f)) return d;
    if (ctx.legacy) {   // 不知道誰改的：兩邊都有的東西都留下；同一個值不一樣時用檔案的（你的舊暫存另外備份）
      if (d === undefined) return f;
      if (f === undefined) return d;
    } else {
      if (eq(b, d)) { ctx.fromFile++; return f; }   // 只有檔案改了
      if (eq(b, f)) return d;                         // 只有你改了
    }
    if (isObj(d) && isObj(f) && (b === undefined || isObj(b))) {
      const out = {}, bb = b || {};
      for (const k of [...Object.keys(d), ...Object.keys(f).filter(k => !(k in d))]) {
        const v = merge(bb[k], d[k], f[k], ctx, path + '.' + k);
        if (v !== undefined) out[k] = v;
      }
      return out;
    }
    if (Array.isArray(d) && Array.isArray(f) && (b === undefined || Array.isArray(b))) return mergeArray(b, d, f, ctx, path);
    if (ctx.legacy) { ctx.legacyFile++; return f; }
    ctx.conflicts.push(path || '（整份資料）');
    return d;   // 兩邊改了同一個值：保留你的
  }
  // 陣列：元素都有 id（地圖、素材、怪物…）→ 依 id 對應；其他（地圖上擺的物件、台詞…）→ 依內容增減
  function mergeArray(b, d, f, ctx, path) {
    const bb = b || [];
    const uniqueIds = list => new Set(list.map(x => String(x.id))).size === list.length;   // 地圖上擺的物件 id＝素材 id，會重複：那種不能用 id 對應
    if ([...d, ...f, ...bb].every(hasId) && uniqueIds(d) && uniqueIds(f) && uniqueIds(bb)) {
      const bm = new Map(bb.map(x => [String(x.id), x])), fm = new Map(f.map(x => [String(x.id), x]));
      const out = [];
      for (const x of d) {
        const id = String(x.id), v = merge(bm.get(id), x, fm.get(id), ctx, path + '[' + id + ']');
        if (v !== undefined) out.push(v);
      }
      const ids = () => out.map(x => String(x.id));
      f.forEach((x, i) => {
        const id = String(x.id);
        if (d.some(y => String(y.id) === id)) return;
        const v = merge(bm.get(id), undefined, x, ctx, path + '[' + id + ']');
        if (v === undefined) return;
        let at = out.length;   // 插在檔案裡它前一個元素的後面
        for (let j = i - 1; j >= 0; j--) { const k = ids().indexOf(String(f[j].id)); if (k >= 0) { at = k + 1; break; } }
        out.splice(at, 0, v);
      });
      return out;
    }
    if (ctx.legacy) { ctx.legacyFile++; return f; }   // 沒有基準時分不出誰加誰刪：用檔案的（避免同一個物件出現兩次）
    // 依內容增減：每種內容最後要有幾個＝誰改了數量就聽誰的
    const count = list => { const m = new Map(); for (const x of list) { const k = canon(x); m.set(k, (m.get(k) || 0) + 1); } return m; };
    const cb = count(bb), cd = count(d), cf = count(f), want = new Map();
    for (const k of new Set([...cd.keys(), ...cf.keys()])) {
      const nb = cb.get(k) || 0, nd = cd.get(k) || 0, nf = cf.get(k) || 0;
      want.set(k, nd === nf ? nd : nd === nb ? nf : nf === nb ? nd : Math.max(nd, nf));
      if (nd !== nf && nd === nb) ctx.fromFile++;
    }
    const out = [], keys = [];
    for (const x of d) { const k = canon(x); if ((want.get(k) || 0) > 0) { out.push(x); keys.push(k); want.set(k, want.get(k) - 1); } }
    f.forEach((x, i) => {
      const k = canon(x); if (!((want.get(k) || 0) > 0)) return;
      want.set(k, want.get(k) - 1);
      let at = out.length;
      for (let j = i - 1; j >= 0; j--) { const p = keys.lastIndexOf(canon(f[j])); if (p >= 0) { at = p + 1; break; } }
      out.splice(at, 0, x); keys.splice(at, 0, k);
    });
    return out;
  }

  function readJson(store, key) { try { const s = store.getItem(key); return s == null ? undefined : JSON.parse(s); } catch (_) { return undefined; } }
  function write(store, key, value) { try { const r = store.setItem(key, JSON.stringify(value)); if (r && r.catch) r.catch(e => console.warn('暫存失敗', key, e)); } catch (e) { console.warn('暫存失敗', key, e); } }

  // 讀暫存並和檔案合併。回傳合併後的資料；沒有暫存（或暫存壞掉）回傳 null。
  // opts.store：暫存放哪裡（預設 localStorage；地圖、素材用 EditorStore）；opts.label：提示訊息裡的名稱
  function load(key, fileData, opts = {}) {
    const store = opts.store || localStorage, label = opts.label || key;
    const file = fileData === undefined ? undefined : JSON.parse(JSON.stringify(fileData));
    const draft = readJson(store, key);
    const setBase = () => { if (file !== undefined) write(store, BASE_PREFIX + key, file); };
    if (draft === undefined || draft === null) { setBase(); return null; }
    if (file === undefined) return draft;
    const base = readJson(store, BASE_PREFIX + key);
    if (eq(draft, file)) { setBase(); return draft; }
    const ctx = { legacy: base === undefined, conflicts: [], fromFile: 0, legacyFile: 0 };
    let merged;
    try { merged = merge(base, draft, file, ctx, ''); }
    catch (e) { console.error('合併失敗，先用你的暫存', e); return draft; }
    if (!eq(merged, draft)) {
      write(store, BACKUP_PREFIX + key, { at: new Date().toLocaleString(), draft });   // 合併前的暫存留一份
      write(store, key, merged);
      if (ctx.legacy) note(label + '：已用專案檔更新（第一次啟用自動合併；你瀏覽器裡獨有的內容都保留了）');
      else note(label + '：已自動合併專案檔的新內容' + (ctx.conflicts.length ? '；有 ' + ctx.conflicts.length + ' 處你和檔案改了同一個地方，保留了你的版本' : ''));
    } else if (ctx.conflicts.length) note(label + '：有 ' + ctx.conflicts.length + ' 處你和檔案改了同一個地方，保留了你的版本');
    setBase();
    return merged;
  }
  // 「丟棄暫存、重新載入檔案」之類的按鈕：基準也一起清掉
  function forget(key, store = localStorage) { try { store.removeItem(BASE_PREFIX + key); } catch (_) {} }

  // ---- 畫面上方的提示列 ----
  function note(msg) { notes.push(msg); console.info('[自動合併] ' + msg); showSoon(); }
  let shown = null;
  function showSoon() {
    if (!document.body) { document.addEventListener('DOMContentLoaded', showSoon, { once: true }); return; }
    if (!shown) {
      shown = document.createElement('div');
      shown.style.cssText = 'position:fixed;left:50%;top:10px;transform:translateX(-50%);z-index:100000;max-width:min(760px,92vw);background:#16324a;color:#e6f4ff;border:1px solid #4f9cc9;border-radius:10px;padding:10px 38px 10px 14px;font:14px/1.6 "Microsoft JhengHei",sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.45)';
      const x = document.createElement('button'); x.textContent = '✕'; x.title = '關閉';
      x.style.cssText = 'position:absolute;right:8px;top:6px;background:none;border:0;color:#9fc7e4;font-size:16px;cursor:pointer';
      x.onclick = () => shown.remove();
      shown.appendChild(x); shown.appendChild(document.createElement('div'));
      document.body.appendChild(shown);
    }
    shown.lastChild.innerHTML = '<b>🔄 已和專案檔同步</b><br>' + notes.map(n => '・' + n.replace(/</g, '&lt;')).join('<br>');
  }

  // ---- 把資料檔（data/*.js）的文字轉成資料：存檔前比對用（js/project-save.js）----
  function evalDataFile(text) {
    const names = [...String(text).matchAll(/^(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=/gm)].map(m => m[1]);
    if (!names.length) return null;
    try { return new Function(String(text).replace(/^(\s*)(const|let)\s+/gm, '$1var ') + '\nreturn {' + names.join(',') + '};')(); }
    catch (_) { return null; }
  }
  return { load, forget, merge: (b, d, f) => merge(b, d, f, { legacy: b === undefined, conflicts: [], fromFile: 0, legacyFile: 0 }, ''), canon, evalDataFile, BASE_PREFIX, BACKUP_PREFIX };
})();
