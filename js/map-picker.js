/* ===== 選地圖的小視窗（基地編輯器、地圖編輯器設出入口時用）=====
   原本用瀏覽器的 prompt() 列出所有地圖，地圖一多文字會被 Chrome 截成「...」，後面新增的地圖就看不到。
   這裡改成畫在頁面上的清單：可以捲動、可以打字篩選；點一下＝選定，Esc／點外面＝取消。
   用法：const map = await pickMapDialog('這個出入口要通到哪一張地圖？', 地圖陣列);   // 取消＝null
*/
function pickMapDialog(title, list) {
  if (!document.getElementById('mapPickerStyle')) {
    const st = document.createElement('style'); st.id = 'mapPickerStyle';
    st.textContent = '.mp-back{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;background:rgba(0,0,0,.55)}' +
      '.mp-box{display:flex;flex-direction:column;width:min(420px,92vw);max-height:80vh;border-radius:12px;background:#1f2329;color:#e8eef5;box-shadow:0 18px 50px rgba(0,0,0,.5);font:14px "Microsoft JhengHei",sans-serif}' +
      '.mp-box h3{margin:0;padding:14px 16px 8px;font-size:15px}' +
      '.mp-box input{margin:0 16px 10px;padding:8px 10px;border:1px solid #3a414b;border-radius:8px;background:#15181d;color:inherit;font:inherit}' +
      '.mp-list{overflow-y:auto;padding:0 8px 8px}' +
      '.mp-list button{display:flex;gap:10px;width:100%;padding:7px 10px;border:0;border-radius:7px;background:none;color:inherit;font:inherit;text-align:left;cursor:pointer}' +
      '.mp-list button:hover,.mp-list button.on{background:#2f3742}.mp-list em{min-width:24px;color:#7f8b98;font-style:normal;text-align:right}' +
      '.mp-empty{padding:10px;color:#7f8b98}.mp-foot{padding:8px 16px 12px;color:#7f8b98;font-size:12px}';
    document.head.appendChild(st);
  }
  return new Promise(resolve => {
    const back = document.createElement('div'); back.className = 'mp-back';
    back.innerHTML = '<div class="mp-box" role="dialog" aria-modal="true"><h3></h3><input type="text" placeholder="打字篩選，例如 4F、寢室"><div class="mp-list"></div><div class="mp-foot">點一下選定・Enter 選第一個・Esc 取消</div></div>';
    back.querySelector('h3').textContent = title;
    const input = back.querySelector('input'), box = back.querySelector('.mp-list');
    let shown = [];
    const render = () => {
      const q = input.value.trim().toLowerCase();
      shown = list.map((m, i) => ({ m, i })).filter(x => !q || String(x.m.name).toLowerCase().includes(q));
      box.replaceChildren(...shown.map(({ m, i }, k) => {
        const b = document.createElement('button'); b.type = 'button'; b.className = k === 0 && q ? 'on' : '';
        b.innerHTML = '<em>' + (i + 1) + '</em><span></span>'; b.querySelector('span').textContent = m.name;
        b.addEventListener('click', () => done(m));
        return b;
      }));
      if (!shown.length) box.innerHTML = '<div class="mp-empty">沒有符合的地圖</div>';
    };
    const done = m => { document.removeEventListener('keydown', onKey, true); back.remove(); resolve(m); };
    const onKey = e => {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); done(null); }
      else if (e.key === 'Enter' && shown.length) { e.preventDefault(); e.stopPropagation(); done(shown[0].m); }
    };
    back.addEventListener('pointerdown', e => { if (e.target === back) done(null); });
    input.addEventListener('input', render);
    document.addEventListener('keydown', onKey, true);
    document.body.appendChild(back);
    render(); input.focus();
  });
}
