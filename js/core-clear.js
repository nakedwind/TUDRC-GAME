// ============================================================
//  打破異質核心之後：掉異質鑰匙、結算、留下來清場、徹底控制
//  ・每打破一個核心掉一把「異質鑰匙」（重要物品；之後拿來開捷運入口之類的地方）：
//    先從核心彈出來掉在地上發光，過 CORE_KEY_DROP.wait 秒自動收進背包（地上的鑰匙消失、跳出說明視窗）。
//  ・這張地圖的核心全部打破：跳出結算畫面，可以「返回應變中心」或「留下來繼續探索」。
//  ・核心全破、異質體也清光：畫面中間跳「已徹底控制」的大橫幅，記一次成就（fullControls）。
// ============================================================
const CORE_CLEAR = { keyItem: 'anomaly-key', fullColor: '#7ee0a8', resultDelay: 3 };   // resultDelay：最後一個核心碎掉後幾秒才跳結算（先看碎裂表演）

const CORE_KEY_DROP = { wait: 3, image: 'images/碎片鑰匙/異質鑰匙小.png', w: 16, h: 36 };   // wait：掉在地上幾秒後自動收進背包
const coreKeyGroundImg = new Image(); coreKeyGroundImg.src = CORE_KEY_DROP.image;

// js/anomalous-core.js 的 breakCore 呼叫：鑰匙從核心彈出來，掉在地上
function coreKeyDrop(core) {
  const id = CORE_CLEAR.keyItem; if (typeof itemById !== 'function' || !itemById(id)) return;
  const a = Math.random() * Math.PI * 2, sp = 25 + Math.random() * 25;
  (G.coreKeyDrops = G.coreKeyDrops || []).push({ id, x: core.x, y: core.y + 4, z: 50, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * .6, vz: 170, t: 0, spin: Math.random() * 6 });
}
// 每幀（game.js 的 update 呼叫）：拋物線落地、彈一下；時間到就收進背包
function updateCoreKeyDrops(dt) {
  const list = G.coreKeyDrops; if (!list || !list.length) return;
  for (const d of [...list]) {
    d.t += dt;
    if (d.z > 0 || d.vz > 0) {
      d.vz -= 620 * dt; d.z += d.vz * dt;
      if (d.z <= 0) {
        d.z = 0; d.vz = Math.abs(d.vz) > 60 ? -d.vz * .35 : 0; d.vx *= .5; d.vy *= .5;
        if (!d.landed) { d.landed = true; G.effects.push({ ring: true, x: d.x, y: d.y + 2, r: 4, r2: 22, life: .3, life0: .3, color: '#d69bff' }); if (typeof sfxAt === 'function') sfxAt('pop', d.x, d.y, .6, 'core-key-land'); }
      }
    }
    const nx = d.x + d.vx * dt, ny = d.y + d.vy * dt;
    const blocked = (x, y) => typeof playerBlocked === 'function' ? playerBlocked(x, y) : solidBlocksPoint(x, y);
    if (!(blocked(nx, ny) && !blocked(d.x, d.y))) { d.x = nx; d.y = ny; } else { d.vx = 0; d.vy = 0; }
    if (d.z === 0) { d.vx *= Math.pow(.02, dt); d.vy *= Math.pow(.02, dt); }
    if (d.t >= CORE_KEY_DROP.wait) collectCoreKey(d);
  }
}
// 自動收進背包：地上的鑰匙消失（閃一下），跳出拿到異質鑰匙的視窗
function collectCoreKey(d) {
  G.coreKeyDrops = G.coreKeyDrops.filter(o => o !== d);
  G.effects.push({ ring: true, x: d.x, y: d.y - 10, r: 4, r2: 30, life: .35, life0: .35, color: '#f1ddff' });
  const id = d.id;
  supplyGain(id, 1);
  if (typeof itemIntroSeen !== 'undefined') itemIntroSeen.add('item:' + id);   // 下面自己跳視窗，拾取提示就不要再跳「第一次拿到」
  if (typeof showItemPickupNotice === 'function') showItemPickupNotice(id, 1);
  const item = itemById(id);   // 異質鑰匙比較特別：每次拿到都跳說明視窗
  if (typeof itemIntro === 'function') itemIntro({ key: 'item:' + id, always: true, name: item.name, image: item.image, imageScale: 2, desc: item.desc });
  G.effects.push({ text: itemById(id).name, iconImage: CORE_KEY_DROP.image, x: d.x, y: d.y - 40, life: 3, life0: 3, color: '#d69bff', vy: -22 });   // 飄字前面放異質鑰匙小圖
  if (typeof updateHUD === 'function') updateHUD();
}
// 地上的鑰匙（render.js 在黑幕之後呼叫：畫在黑暗上面，暗處也看得到）
function drawCoreKeyDrops(ctx) {
  const list = G && G.coreKeyDrops; if (!list || !list.length || !coreKeyGroundImg.complete || !coreKeyGroundImg.naturalWidth) return;
  const now = performance.now() / 1000, { w, h } = CORE_KEY_DROP;
  for (const d of list) {
    const bob = d.z === 0 ? Math.sin(now * 3 + d.spin) * 1.5 : 0, x = d.x, y = d.y - d.z + bob;
    const blink = d.t > CORE_KEY_DROP.wait - .6 ? .75 + .25 * Math.sin(now * 30) : 1;   // 快被收走前閃一下
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(d.x, d.y + 3, 8, 3, 0, 0, Math.PI * 2); ctx.fill();   // 影子
    const g = ctx.createRadialGradient(x, y - h * .4, 0, x, y - h * .4, 26);   // 紫色光暈
    g.addColorStop(0, 'rgba(214,155,255,.6)'); g.addColorStop(1, 'rgba(180,100,255,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y - h * .4, 26, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = blink; ctx.imageSmoothingEnabled = false;
    ctx.translate(x, y); ctx.rotate(d.z > 0 ? Math.sin(d.t * 14) * .6 : Math.sin(d.spin) * .12);   // 飛在空中時翻轉
    ctx.drawImage(coreKeyGroundImg, -w / 2, -h, w, h);
    ctx.restore();
  }
}
// 地上鑰匙的紫光（js/lighting.js 呼叫）
function coreKeyLights() {
  return ((G && G.coreKeyDrops) || []).map(d => ({ x: d.x, y: d.y - 14, r: 60, life: 1, life0: 1, power: .45, color: [200, 130, 255] }));
}
const coreClearMapName = () => (MAP && MAP.name) || '這一區';
// 每幀檢查（game.js 的 update 呼叫；取代原本「核心全破＋異質體清光才勝利」）
function checkCoreClear(dt = 0) {
  if (MAP_SAFE || !G.cores.length || !G.cores.every(c => c.dead)) return;
  if (!G.coreClearShown) {           // 核心剛全部打破：等一下（看碎裂表演）再結算
    G.coreClearWait = (G.coreClearWait || 0) + dt;
    if ((G.coreKeyDrops && G.coreKeyDrops.length) || (typeof itemIntroOpen !== 'undefined' && itemIntroOpen)) {   // 鑰匙還在地上、或拿到鑰匙的視窗還開著：先別跳結算
      G.coreClearWait = Math.min(G.coreClearWait, CORE_CLEAR.resultDelay - .6); return;   // 視窗關掉後 0.6 秒再跳
    }
    if (G.coreClearWait < CORE_CLEAR.resultDelay) return;
    G.coreClearShown = true;
    if (G.enemies.length === 0 && !(typeof burrowLurkerCount === 'function' ? burrowLurkerCount() : 0)) markFullControl(true);
    win();                            // 記勝利、任務完成、結算畫面（js/game.js、js/missions.js）
    addCoreClearChoices();
    return;
  }
  if (!G.fullControl && !G.over && G.enemies.length === 0 && !(typeof burrowLurkerCount === 'function' ? burrowLurkerCount() : 0)) markFullControl(false);   // 留下來把異質體清光了
}
function markFullControl(quiet) {
  G.fullControl = true;
  if (typeof addStat === 'function') { addStat('fullControls'); achieveOnBattleEnd('control'); }   // 成就：沒用醫療包、10 分鐘內
  if (quiet) return;                  // 跟結算一起發生：寫在結算畫面上就好
  if (typeof coreBanner === 'function') coreBanner(coreClearMapName() + ' 已徹底控制', '這一區的異質體全部清除了，可以從營地帳篷返回應變中心', CORE_CLEAR.fullColor);
  systemNotice('✓ ' + coreClearMapName() + ' 已徹底控制');
  if (typeof sfx === 'function') sfx('win');
}
// 結算畫面：統計最上面寫剩幾隻異質體；「返回應變中心」旁邊多一個「留下來繼續探索」
function addCoreClearChoices() {
  const box = document.getElementById('ov-text'), ok = document.getElementById('ov-btn'); if (!box || !ok) return;
  const left = G.enemies.filter(e => !e.dead && e.hp > 0).length + (typeof burrowLurkerCount === 'function' ? burrowLurkerCount() : 0);
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
