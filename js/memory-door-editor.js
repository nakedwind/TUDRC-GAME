/* ===== 地圖／劇情地圖／基地編輯器共用：記憶之門的設定 =====
   門的種類選「記憶之門」時，旁邊多兩個選單：🔑 用哪把回憶鑰匙（data/items.js 的 MEMORY_KEYS）、🎬 打開後播哪段劇情（data/story-scenes.js）。
   存在門的圖章上：memoryKey、memoryScene（遊戲端在 js/memory-doors.js）。
   用法：各編輯器的 refreshDoorControl() 最後呼叫 refreshMemoryDoorFields(圖章, (欄位, 值) => { 存檔、重畫 })。 */
let memoryDoorOnChange = null;
function refreshMemoryDoorFields(s, onChange) {
  const box = document.getElementById('selDoorControl'); if (!box) return;
  let wrap = document.getElementById('selMemoryDoor');
  if (!wrap) {
    wrap = document.createElement('span'); wrap.id = 'selMemoryDoor';
    wrap.innerHTML = ' 🔑 <select id="selMemoryKey" title="用哪把回憶鑰匙解開鎖鏈"></select> 🎬 <select id="selMemoryScene" title="打開後進入哪段回憶劇情（🎬 劇情編輯器）"></select>';
    box.appendChild(wrap);
    for (const [id, field] of [['selMemoryKey', 'memoryKey'], ['selMemoryScene', 'memoryScene']])
      wrap.querySelector('#' + id).addEventListener('change', e => memoryDoorOnChange && memoryDoorOnChange(field, e.target.value));
  }
  memoryDoorOnChange = onChange;
  const on = !!s && s.doorMode === 'memory';
  wrap.style.display = on ? '' : 'none';
  if (!on) return;
  const items = typeof ITEMS !== 'undefined' ? ITEMS : [];
  const keys = (typeof MEMORY_KEYS !== 'undefined' ? MEMORY_KEYS : []).map(k => [k.key, (items.find(i => i.id === k.key) || {}).name || k.key]);
  const scenes = Object.entries(typeof STORY_SCENES !== 'undefined' ? STORY_SCENES : {}).map(([id, sc]) => [id, (sc.title || id) + '（' + id + '）']);
  const fill = (sel, list, value, empty) => {
    sel.innerHTML = '';
    for (const [v, text] of [['', empty], ...list, ...(value && !list.some(o => o[0] === value) ? [[value, value + '（找不到）']] : [])]) {
      const o = document.createElement('option'); o.value = v; o.textContent = text; sel.appendChild(o);
    }
    sel.value = value || '';
  };
  fill(wrap.querySelector('#selMemoryKey'), keys, s.memoryKey, '（選鑰匙）');
  fill(wrap.querySelector('#selMemoryScene'), scenes, s.memoryScene, '（選劇情）');
}
