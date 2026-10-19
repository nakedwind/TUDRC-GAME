/* ===== 🏠 基地編輯器：一鍵存到專案、存檔空間顯示、工具列「更多」選單 =====
   ・「💾 存到專案」（Ctrl+S）：用 js/project-save.js 直接寫進 data/base-maps.js（只有基地地圖），
     NPC 名單 data/npc-locations.js 由 js/base-editor-npc.js 加進 EDITOR_SAVE_FILES 一起存。
   ・存檔空間：顯示地圖、素材暫存用了多少（js/base-editor-store.js）。
   地圖編輯器有自己的一份（js/map-editor-save.js），兩邊互不影響。
   必須在 js/base-editor.js 之後載入（用到 exportText、setStatus）。
*/
const EDITOR_SAVE_FILES = [{ path: 'data/base-maps.js', label: '基地地圖', text: () => exportText() }];   // js/base-editor-npc.js 會再加 npc-locations.js
// 存檔功能本身在 js/project-save.js（所有編輯器共用，遊戲資料夾只要選一次）
const editorProjectSave = ProjectSave.attach({ after: [], files: EDITOR_SAVE_FILES, status: (m, err) => setStatus(m, err ? '#ff8f8f' : '#7ee0c0') });
document.getElementById('saveProject').addEventListener('click', e => editorProjectSave.save(e.shiftKey));
document.getElementById('pickProject').addEventListener('click', e => { e.preventDefault(); editorProjectSave.save(true); });

// ---- 存檔空間 ----
const fmtSize = b => b == null ? '?' : b >= 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB';
async function refreshStorageInfo() {
  const el = document.getElementById('storageInfo'); if (!el) return;
  const u = await EditorStore.usage();
  const where = u.db ? '瀏覽器資料庫' : 'localStorage（約 5 MB 上限！）';
  const left = u.quota != null && u.used != null ? '，還可以用約 ' + fmtSize(u.quota - u.used) : '';
  el.textContent = '暫存空間：地圖 ' + fmtSize(u.maps) + '・素材 ' + fmtSize(u.tiles) + '（' + where + left + '）';
  el.style.color = u.db ? '#8c98a6' : '#ffd24a';
}
let storageInfoTimer = null;
function refreshStorageInfoSoon() { clearTimeout(storageInfoTimer); storageInfoTimer = setTimeout(refreshStorageInfo, 800); }   // editor.js 的 saveMaps 呼叫
refreshStorageInfo();

// ---- 工具列「⋯ 更多」選單：點了裡面的按鈕就收起來；點外面也收起來 ----
document.querySelectorAll('.tool-more').forEach(d => d.addEventListener('click', e => { if (e.target.closest('button')) d.open = false; }));
document.addEventListener('pointerdown', e => document.querySelectorAll('.tool-more[open]').forEach(d => { if (!d.contains(e.target)) d.open = false; }));
