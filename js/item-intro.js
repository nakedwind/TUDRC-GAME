/* ===== 第一次拿到新東西：畫面中間跳出說明視窗 =====
   第一次撿到某樣物品、裝備或武器時，跳出它的圖片、名稱、分類與說明，遊戲暫停；
   按「知道了」（或 Space／Enter／Esc）關掉才繼續。同時拿到好幾樣會一個接一個顯示。
   看過的東西記在瀏覽器（ITEM_INTRO_KEY），之後再拿到就不會跳。
   呼叫：itemIntro({ key, name, image, icon, tag, desc })
*/
const ITEM_INTRO_KEY = 'tudrc_seen_items_v1';
const itemIntroSeen = new Set((() => { try { return JSON.parse(localStorage.getItem(ITEM_INTRO_KEY) || '[]'); } catch (_) { return []; } })());
const itemIntroQueue = [];
let itemIntroOpen = false, itemIntroEl = null;
let itemIntroFromLocker = false, itemIntroCount = 0;   // 置物櫃開出來的東西：每次都跳（不只第一次），標題改成「在置物櫃找到」

function itemIntro(info) {
  if (!info || !info.key) return;
  const locker = itemIntroFromLocker;
  if (info.always) { itemIntroQueue.push(info); itemIntroCount++; if (!itemIntroOpen) showNextItemIntro(); return; }   // 每次都跳（異質鑰匙這類特別的東西）
  if (!locker && itemIntroSeen.has(info.key)) return;
  itemIntroSeen.add(info.key);
  try { localStorage.setItem(ITEM_INTRO_KEY, JSON.stringify([...itemIntroSeen])); } catch (_) {}
  itemIntroQueue.push(locker ? { ...info, headline: '在置物櫃找到' } : info); itemIntroCount++;
  if (!itemIntroOpen) showNextItemIntro();
}
function ensureItemIntroEl() {
  if (itemIntroEl) return itemIntroEl;
  itemIntroEl = document.createElement('div');
  itemIntroEl.id = 'itemIntro'; itemIntroEl.className = 'hidden';
  itemIntroEl.setAttribute('role', 'dialog'); itemIntroEl.setAttribute('aria-modal', 'true');
  itemIntroEl.addEventListener('click', e => { if (e.target.closest('.item-intro-ok')) closeItemIntro(); });
  (document.getElementById('wrap') || document.body).appendChild(itemIntroEl);
  return itemIntroEl;
}
function showNextItemIntro() {
  const info = itemIntroQueue.shift();
  if (!info) { itemIntroOpen = false; return; }
  const el = ensureItemIntroEl();
  el.style.setProperty('--intro-image-scale',String(info.imageScale||1));
  itemIntroOpen = true; aimHeld = false;
  if (typeof keys !== 'undefined') Object.keys(keys).forEach(k => { keys[k] = false; });
  const esc = s => String(s || '').replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
  el.innerHTML = '<section class="item-intro-card">' +
    '<small class="item-intro-new">✦ ' + (info.headline ? esc(info.headline) : '獲得新' + esc(info.kindLabel || '物品')) + '</small>' +
    '<div class="item-intro-image' + (info.imageHtml ? ' custom' : '') + '">' + (info.imageHtml ? info.imageHtml : info.image ? '<img' + (info.imageClass ? ' class="' + esc(info.imageClass) + '"' : '') + ' src="' + esc(info.image) + '" alt="">' : '<i>' + esc(info.icon || '🎁') + '</i>') + '</div>' +
    '<h2>' + esc(info.name) + '</h2>' +
    (info.tag ? '<span class="item-intro-tag">' + esc(info.tag) + '</span>' : '') +
    (info.desc ? '<p>' + esc(info.desc) + '</p>' : '') +
    (info.stat ? '<p class="item-intro-stat">' + esc(info.stat).replace(/\n/g, '<br>') + '</p>' : '') +   // stat 裡的換行（\n）＝分排
    '<button type="button" class="item-intro-ok">知道了 <kbd>Enter</kbd></button></section>';
  const img = el.querySelector('.item-intro-image img');   // 很小的圖（最長邊 ≤ 48 像素，例如急救包、鑰匙）放大 2 倍
  if (img && !img.classList.contains('ui-icon')) { const big = () => { const w = img.naturalWidth, h = img.naturalHeight; if (w && Math.max(w, h) <= 48) { img.style.width = w * 2 + 'px'; img.style.height = h * 2 + 'px'; } }; if (img.complete) big(); else img.onload = big; }
  el.classList.remove('hidden');
  if (typeof SFX !== 'undefined') SFX.play(info.sound || 'itemReveal', .8, 'item-reveal');   // info.sound：指定別的音效（例如住院通知用提示彈窗） else if (typeof sfx === 'function') sfx('menu');   // 開置物櫃音效（js/sfx.js）
  setTimeout(() => el.querySelector('.item-intro-ok')?.focus(), 0);
}
function closeItemIntro() {
  if (!itemIntroOpen) return;
  if (typeof sfx === 'function') sfx('button');
  itemIntroEl.classList.add('hidden');
  itemIntroOpen = false;
  if (itemIntroQueue.length) setTimeout(showNextItemIntro, 120);   // 還有下一個：稍等一下再跳
}
// 視窗開著時：Space／Enter／Esc 關掉，其他按鍵不傳給遊戲
window.addEventListener('keydown', e => {
  if (!itemIntroOpen) return;
  e.preventDefault(); e.stopImmediatePropagation();
  if (!e.repeat && (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape')) closeItemIntro();
}, true);

// ---- 各種東西的說明怎麼組 ----
function itemIntroForItem(id, qty = 1) {
  const item = typeof itemById === 'function' ? itemById(id) : null; if (!item) return;
  const cat = typeof categoryOf === 'function' ? categoryOf(item.category) : null;
  itemIntro({ key: 'item:' + item.id, kindLabel: '物品', name: item.name + (itemIntroFromLocker && qty > 1 ? ' ×' + qty : ''), image: item.image,
    tag: cat ? (cat.icon ? cat.icon + ' ' : '') + cat.name : '', desc: typeof itemDesc === 'function' ? itemDesc(item) : item.desc });
}
function itemIntroForEquipment(id) {
  const d = typeof equipDef === 'function' ? equipDef(id) : null; if (!d) return;
  const part = { head: '頭部', body: '上身', legs: '下身', acc: '隨身物品' }[d.kind] || '裝備';
  itemIntro({ key: 'equip:' + id, kindLabel: '裝備', name: d.name, image: d.image, icon: d.icon, tag: '🛡️ ' + part, desc: d.ownedDesc || d.desc,
    stat: d.stat && d.levels ? 'Lv1：' + d.stat(d.levels[0]) : '' });
}
function itemIntroForBullet(id, n) {
  const b = typeof BULLETS !== 'undefined' ? BULLETS[id] : null; if (!b) return;
  itemIntro({ key: 'bullet:' + id, kindLabel: '子彈', name: b.name + (n ? ' ×' + n : ''), image: b.image, icon: b.icon, tag: '🔫 手槍的子彈', desc: b.desc,
    stat: '最多帶 ' + b.max + ' 發・戰鬥中用滑鼠滾輪換成這種子彈' });
}
function itemIntroForWeapon(id) {
  const w = typeof WEAPON_UPGRADES !== 'undefined' ? WEAPON_UPGRADES[id] : null; if (!w) return;
  itemIntro({ key: 'weapon:' + id, kindLabel: '武器', name: w.name, image: w.image, icon: w.icon, tag: '🔫 武器', desc: w.ownedDesc || w.desc,
    stat: w.stat && w.levels ? 'Lv1：' + w.stat(w.levels[0]) : '' });
}
