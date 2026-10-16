/* ===== 所有編輯器共用：一鍵「💾 存到專案」=====
   第一次會請你選遊戲資料夾（有 塔防原型.html 的那個），之後一鍵就把匯出內容直接寫進 data/，
   不用再下載、手動覆蓋。資料夾只要選一次，所有編輯器共用。
   寫入前會把舊檔備份到 backups/編輯器存檔/（每種檔案保留最近 10 份）；內容沒變的檔案不會重寫。
   需要 Chrome 或 Edge；其他瀏覽器請照舊用「下載」。快捷鍵：Ctrl+S。

   用法（在編輯器頁面最後）：
     ProjectSave.attach({
       after: ['exportMonsters'],                       // 按鈕放在哪些按鈕後面（可以好幾個）
       files: [{ path: 'data/monsters.js', label: '怪物', text: () => exportText() }],
       status: (msg, isError) => ...,                   // 顯示訊息的方式
     });
*/
const ProjectSave = (() => {
  const DB_NAME = 'tudrc_editor', STORE = 'kv', HANDLE_KEY = 'projectDir';
  const BACKUP_DIR = ['backups', '編輯器存檔'], BACKUP_KEEP = 10;
  const idb = () => new Promise((res, rej) => {
    const r = indexedDB.open(DB_NAME, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE);
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  });
  async function getHandle() { try { const db = await idb(); return await new Promise(res => { const q = db.transaction(STORE).objectStore(STORE).get(HANDLE_KEY); q.onsuccess = () => res(q.result || null); q.onerror = () => res(null); }); } catch (_) { return null; } }
  async function setHandle(h) { try { const db = await idb(); db.transaction(STORE, 'readwrite').objectStore(STORE).put(h, HANDLE_KEY); } catch (_) {} }

  async function projectDir(pickAgain, say) {
    let dir = pickAgain ? null : await getHandle();
    if (dir) {
      let perm = await dir.queryPermission({ mode: 'readwrite' });
      if (perm !== 'granted') perm = await dir.requestPermission({ mode: 'readwrite' });
      if (perm === 'granted') return dir;
    }
    if (!window.showDirectoryPicker) throw new Error('這個瀏覽器不支援直接存檔，請用 Chrome 或 Edge，或改用「下載」');
    say('請選擇遊戲資料夾（裡面有 塔防原型.html 的那個資料夾）');
    dir = await window.showDirectoryPicker({ id: 'tudrc-game', mode: 'readwrite' });
    try { await dir.getFileHandle('塔防原型.html'); await dir.getDirectoryHandle('data'); }
    catch (_) { throw new Error('選的資料夾不對：裡面要有 塔防原型.html 和 data 資料夾'); }
    await setHandle(dir);
    return dir;
  }
  async function subDir(dir, parts, create) { for (const p of parts) dir = await dir.getDirectoryHandle(p, { create }); return dir; }
  // 寫一個檔案：回傳 'same'（沒變動）或 'saved'
  async function writeFile(root, path, text, stamp) {
    const parts = path.split('/'), name = parts.pop(), dir = await subDir(root, parts, false);
    try {   // 備份舊檔
      const old = await (await (await dir.getFileHandle(name)).getFile()).text();
      if (old === text) return 'same';
      const bdir = await subDir(root, BACKUP_DIR, true), base = name.replace(/\.js$/, '');
      const bf = await (await bdir.getFileHandle(base + '-' + stamp + '.js', { create: true })).createWritable();
      await bf.write(old); await bf.close();
      const olds = [];
      for await (const [n] of bdir.entries()) if (n.startsWith(base + '-') && /^\d{8}-\d{6}\.js$/.test(n.slice(base.length + 1))) olds.push(n);
      olds.sort();
      for (const n of olds.slice(0, Math.max(0, olds.length - BACKUP_KEEP))) await bdir.removeEntry(n);
    } catch (e) { if (e && e.name !== 'NotFoundError') console.warn('備份失敗', e); }
    const w = await (await dir.getFileHandle(name, { create: true })).createWritable();
    await w.write(text); await w.close();
    return 'saved';
  }
  const timeStamp = () => { const d = new Date(), z = n => String(n).padStart(2, '0'); return d.getFullYear() + z(d.getMonth() + 1) + z(d.getDate()) + '-' + z(d.getHours()) + z(d.getMinutes()) + z(d.getSeconds()); };

  // 存這一頁的所有檔案
  async function save(files, say, pickAgain, buttons) {
    buttons.forEach(b => { b.disabled = true; });
    try {
      const root = await projectDir(pickAgain, m => say(m, false)), stamp = timeStamp(), done = [];
      for (const f of files) {
        const r = await writeFile(root, f.path, f.text(), stamp);
        done.push(f.label + (r === 'same' ? '（沒有變動）' : ' ✓'));
      }
      say('已存到專案：' + done.join('、') + '　遊戲頁按 Ctrl+F5 重新整理就會套用；舊檔備份在 backups/編輯器存檔/', false);
      return true;
    } catch (e) {
      if (e && e.name === 'AbortError') say('已取消存檔', false);
      else say('存到專案失敗：' + (e && e.message || e), true);
      return false;
    } finally { buttons.forEach(b => { b.disabled = false; }); }
  }

  function attach({ after = [], files, status, title }) {
    const say = (m, err) => { try { status(m, err); } catch (_) { console.log(m); } };
    const buttons = [];
    for (const id of [].concat(after)) {
      const ref = document.getElementById(id); if (!ref) continue;
      const b = document.createElement('button');
      b.type = 'button'; b.className = (ref.className || '') + ' project-save-btn';
      b.textContent = '💾 存到專案';
      b.title = title || ('直接寫進遊戲資料夾：' + files.map(f => f.path).join('、') + '（Ctrl+S）。按住 Shift 點可以重新選資料夾');
      b.addEventListener('click', e => save(files, say, e.shiftKey, buttons));
      ref.insertAdjacentElement('afterend', b);
      buttons.push(b);
    }
    document.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) { e.preventDefault(); save(files, say, false, buttons); }
    });
    return { save: pickAgain => save(files, say, pickAgain, buttons) };
  }
  return { attach, writeFile, subDir };
})();
