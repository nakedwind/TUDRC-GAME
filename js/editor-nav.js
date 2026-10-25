/* ===== 所有編輯器共用：最上方的編輯器入口（方便切換編輯器）=====
   每個編輯器頁面最後載入這個檔案。要加新的編輯器，只要在下面的 EDITORS 多加一行（跟遊戲下方的 #editors 一樣）。
   ・標題裡本來就有連結的頁面（地圖、基地、劇情地圖、物件編輯器）：連結換成完整的一排，接在標題後面
   ・其他頁面：最上面多一排；原本零散的「回遊戲」等連結拿掉（不重複）
   ・目前這一頁的連結會標亮
*/
(() => {
  const EDITORS = [
    ['塔防原型.html', '← 回遊戲', 'home'],
    ['地圖編輯器.html', '🗺️ 地圖編輯器'],
    ['基地編輯器.html', '🏠 基地編輯器'],
    ['劇情地圖編輯器.html', '📖 劇情地圖編輯器'],
    ['劇情編輯器.html', '🎬 劇情編輯器'],
    ['物件編輯器.html', '🧱 物件編輯器'],
    ['怪物編輯器.html', '🐾 怪物編輯器'],
    ['角色資料頁.html', '🪪 角色資料頁'],
    ['對話編輯器.html', '💬 對話編輯器'],
    ['閒聊編輯器.html', '🗨️ 閒聊編輯器'],
    ['椅子編輯器.html', '🪑 椅子編輯器'],
    ['服裝編輯器.html', '👗 服裝編輯器'],
    ['精靈圖切割器.html', '✂️ 精靈圖切割器'],
    ['音效編輯器.html', '🔊 音效編輯器'],
    ['開發工坊編輯器.html', '🔧 開發工坊編輯器'],
    ['UI編輯器.html', '🖥️ UI編輯器'],
    ['背包編輯器.html', '🎒 背包編輯器'],
    ['隊員裝備技能編輯器.html', '🧑‍🚀 Y102隊員裝備／技能編輯器'],
    ['怪物圖鑑編輯器.html', '📕 怪物圖鑑編輯器'],
    ['成就編輯器.html', '🏆 成就編輯器'],
  ];
  const pages = new Set(EDITORS.map(e => e[0]));
  const fileOf = href => { try { return decodeURIComponent(new URL(href, location.href).pathname.split('/').pop()); } catch (_) { return ''; } };
  const here = fileOf(location.href);

  const style = document.createElement('style');
  style.textContent =
    // 選擇器寫明確一點（nav.editor-nav）：各頁原本的樣式（例如遊戲的 css/style.css 對 nav 的設定）才不會影響這一排
    'nav.editor-nav { position: static; display: flex; flex-wrap: wrap; justify-content: flex-start; align-content: flex-start; gap: 4px 6px; align-items: center; width: auto; height: auto; font: 600 12px/1.25 system-ui, "Microsoft JhengHei", sans-serif; letter-spacing: 0; text-align: left; }' +
    'nav.editor-nav.top { box-sizing: border-box; margin: 0 0 12px; padding: 6px 8px; border: 1px solid #2c3a48; border-radius: 10px; background: #121a23; }' +
    'nav.editor-nav.inline { display: inline-flex; vertical-align: middle; margin: 4px 0 0 10px; }' +
    'nav.editor-nav a { display: inline-block; flex: none; margin: 0; padding: 3px 9px; border: 1px solid #34465a; border-radius: 999px; background: #1a2430; color: #9fd3ff; text-decoration: none; white-space: nowrap; }' +
    'nav.editor-nav a:hover { border-color: #8fd3ff; color: #fff; }' +
    'nav.editor-nav a.home { color: #ffe3a1; border-color: #5a4d32; }' +
    'nav.editor-nav a[aria-current="page"] { background: #2b526b; border-color: #8fd3ff; color: #fff; cursor: default; }';
  document.head.appendChild(style);

  const nav = document.createElement('nav');
  nav.className = 'editor-nav'; nav.setAttribute('aria-label', '切換編輯器');
  nav.innerHTML = EDITORS.map(([file, label, cls]) =>
    '<a href="' + file + '"' + (cls ? ' class="' + cls + '"' : '') + (file === here ? ' aria-current="page"' : '') + '>' + label + '</a>').join('');

  // 原本零散的連結：標題裡的、.nav 區塊裡的，只要是連到遊戲或編輯器的就拿掉
  const oldLinks = [...document.querySelectorAll('h1 a[href], .nav a[href], nav.nav a[href]')].filter(a => pages.has(fileOf(a.getAttribute('href'))));
  const h1WithLinks = oldLinks.map(a => a.closest('h1')).find(Boolean);
  for (const a of oldLinks) {
    const box = a.closest('.nav');
    const prev = a.previousSibling;   // 連結前面的全形空白
    if (prev && prev.nodeType === 3 && /^[\s　]*$/.test(prev.textContent)) prev.remove();
    a.remove();
    if (box && !box.querySelector('a, button, input, select')) box.remove();   // 整塊都是連結：一起拿掉
  }
  if (h1WithLinks) {   // 地圖編輯器那種：接在標題後面
    const h1 = h1WithLinks;
    if (h1.lastChild && h1.lastChild.nodeType === 3) h1.lastChild.textContent = h1.lastChild.textContent.replace(/[\s　]+$/, '');
    nav.classList.add('inline'); h1.appendChild(nav);
  } else {   // 其他頁面：最上面一排
    nav.classList.add('top'); document.body.insertBefore(nav, document.body.firstChild);
  }
})();
