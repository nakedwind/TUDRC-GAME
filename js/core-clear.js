// ============================================================
//  打破異質核心之後：掉異質鑰匙、結算、留下來清場、徹底控制
//  ・每打破一個核心掉一把「異質鑰匙」（重要物品，直接放進背包；之後拿來開捷運入口之類的地方）。
//  ・這張地圖的核心全部打破：跳出結算畫面，可以「返回應變中心」或「留下來繼續探索」。
//  ・核心全破、異質體也清光：畫面中間跳「已徹底控制」的大橫幅，記一次成就（fullControls）。
// ============================================================
const CORE_CLEAR = { keyItem: 'anomaly-key', fullColor: '#7ee0a8', resultDelay: 3 };   // resultDelay：最後一個核心碎掉後幾秒才跳結算（先看碎裂表演）

// js/anomalous-core.js 的 breakCore 呼叫
function coreKeyDrop(core) {
  const id = CORE_CLEAR.keyItem; if (typeof itemById !== 'function' || !itemById(id)) return;
  supplyInventory.set(id, (supplyInventory.get(id) || 0) + 1);
  if (typeof itemIntroSeen !== 'undefined') itemIntroSeen.add('item:' + id);   // 下面自己跳視窗，拾取提示就不要再跳「第一次拿到」
  if (typeof showItemPickupNotice === 'function') showItemPickupNotice(id, 1);
  const item = itemById(id);   // 異質鑰匙比較特別：每次拿到都跳說明視窗
  if (typeof itemIntro === 'function') itemIntro({ key: 'item:' + id, always: true, name: item.name, image: item.image, imageScale: 2, desc: item.desc });
  G.effects.push({ text: itemById(id).name, iconImage: 'images/碎片鑰匙/異質鑰匙小.png', x: core.x, y: core.y - 70, life: 2.5, life0: 2.5, color: '#d69bff', vy: -22 });   // 飄字前面放異質鑰匙小圖
  if (typeof updateHUD === 'function') updateHUD();
}
const coreClearMapName = () => (MAP && MAP.name) || '這一區';
// 每幀檢查（game.js 的 update 呼叫；取代原本「核心全破＋異質體清光才勝利」）
function checkCoreClear(dt = 0) {
  if (MAP_SAFE || !G.cores.length || !G.cores.every(c => c.dead)) return;
  if (!G.coreClearShown) {           // 核心剛全部打破：等一下（看碎裂表演）再結算
    G.coreClearWait = (G.coreClearWait || 0) + dt;
    if (G.coreClearWait < CORE_CLEAR.resultDelay) return;
    G.coreClearShown = true;
    if (G.enemies.length === 0) markFullControl(true);
    win();                            // 記勝利、任務完成、結算畫面（js/game.js、js/missions.js）
    addCoreClearChoices();
    return;
  }
  if (!G.fullControl && !G.over && G.enemies.length === 0) markFullControl(false);   // 留下來把異質體清光了
}
function markFullControl(quiet) {
  G.fullControl = true;
  if (typeof addStat === 'function') addStat('fullControls');
  if (quiet) return;                  // 跟結算一起發生：寫在結算畫面上就好
  if (typeof coreBanner === 'function') coreBanner(coreClearMapName() + ' 已徹底控制', '這一區的異質體全部清除了，可以從營地帳篷返回應變中心', CORE_CLEAR.fullColor);
  systemNotice('✓ ' + coreClearMapName() + ' 已徹底控制');
  if (typeof sfx === 'function') sfx('win');
}
// 結算畫面：統計最上面寫剩幾隻異質體；「返回應變中心」旁邊多一個「留下來繼續探索」
function addCoreClearChoices() {
  const box = document.getElementById('ov-text'), ok = document.getElementById('ov-btn'); if (!box || !ok) return;
  const left = G.enemies.filter(e => !e.dead && e.hp > 0).length;
  const note = document.createElement('p'); note.className = 'core-clear-note' + (G.fullControl ? ' full' : '');
  note.innerHTML = G.fullControl ? '✓ 異質體也全部清除了：<b>' + coreClearMapName() + ' 已徹底控制</b>'
    : '還有 <b>' + left + '</b> 隻異質體在這一區。留下來清光，就能<b>徹底控制</b>這一區。';
  box.prepend(note);
  document.getElementById('coreStay')?.remove();
  const stay = document.createElement('button'); stay.type = 'button'; stay.id = 'coreStay'; stay.className = 'core-stay'; stay.textContent = '留下來繼續探索';
  ok.after(stay);
}
// 其他時候跳出結算畫面（輸了、開始畫面…）不要留著這個按鈕
const coreClearShowOverlay = showOverlay;
showOverlay = function (...args) { document.getElementById('coreStay')?.remove(); return coreClearShowOverlay.apply(this, args); };
document.addEventListener('click', e => {
  if (!e.target.closest('#coreStay') || !G) return;
  sfx('button');
  document.getElementById('coreStay')?.remove();
  G.over = false; G.won = false; G.running = true; G.phase = 'playing';   // 回到戰場（任務已經記成完成了）
  hideOverlay();
  systemNotice(G.fullControl ? '可以從營地帳篷返回應變中心' : '把剩下的異質體清光，就能徹底控制這一區');
});
