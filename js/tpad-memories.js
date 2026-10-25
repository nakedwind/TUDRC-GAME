/* ===== T-Pad 裡的「回憶」App（js/tpad.js 會把它畫在平板螢幕裡）=====
   ・每一把回憶鑰匙（data/items.js 的 MEMORY_KEYS）＝一個人的回憶；地圖上每一扇設定了劇情的記憶之門＝一段可以看的回憶。
   ・解開過的記憶之門（js/memory-doors.js 記在存檔）＝可以觀看：點進去按「▶ 播放」就直接播（看完回到原本的地方）。
   ・還沒解開的不暴露劇情名稱，只顯示是誰的回憶、碎片收集進度、鑰匙拼好了沒、門在哪張地圖。
   版面沿用任務 App 的 .aa／.ma（css/style.css），回憶的配色在 css/memory-doors.css。
   必須在 js/quests.js、js/memory-doors.js 之後載入。
*/
let mmTab = 'all', mmSel = null;   // mmSel：正在看的那一段（null＝清單）
const MM_STATE = {   // 狀態 → 標籤文字、顏色
  open:   ['可以觀看', 'green'],
  key:    ['鑰匙已拼好', 'orange'],
  shards: ['收集碎片中', 'blue'],
  none:   ['未發現', 'gray'],
  closed: ['尚未開放', 'gray'],
};
// 所有地圖上設定了劇情的記憶之門
function memoryDoorList() {
  const out = [];
  for (const m of (typeof mapList === 'function' ? mapList() : [])) for (const s of m.stamps || [])
    if (s.doorMode === 'memory' && s.memoryScene) out.push({ map: m, stamp: s, key: s.memoryKey, scene: s.memoryScene });
  return out;
}
function memoryEntries() {
  const opened = typeof memoryDoorsOpened === 'function' ? memoryDoorsOpened() : new Set(), doors = memoryDoorList(), list = [];
  for (const mk of typeof MEMORY_KEYS !== 'undefined' ? MEMORY_KEYS : []) {
    const owner = memoryOwner(mk.shard), hasKey = (supplyInventory.get(mk.key) || 0) > 0;
    const have = hasKey ? mk.need : Math.min(mk.need, supplyInventory.get(mk.shard) || 0);
    const base = { mk, owner, hasKey, have, locked: hasKey ? 'key' : have ? 'shards' : 'none' };
    const mine = doors.filter(d => d.key === mk.key && typeof STORY_SCENES !== 'undefined' && STORY_SCENES[d.scene]);
    if (!mine.length) { list.push({ ...base, id: 'k:' + mk.key, noDoor: true, state: base.locked === 'none' ? 'closed' : base.locked }); continue; }   // 這把鑰匙還沒有記憶之門：照樣顯示碎片進度
    for (const d of mine) {
      const unlocked = opened.has(d.map.id + '@' + d.stamp.c + ',' + d.stamp.r);
      list.push({ ...base, id: 'd:' + d.map.id + '@' + d.stamp.c + ',' + d.stamp.r, scene: d.scene, data: STORY_SCENES[d.scene], mapName: d.map.name,
        state: unlocked ? 'open' : base.locked });
    }
  }
  // 同一段劇情在好幾扇門：只要解開過一扇就算可以看，清單裡只留一筆
  const seen = new Map();
  for (const e of list) { const k = e.scene || e.id, old = seen.get(k); if (!old || (e.state === 'open' && old.state !== 'open')) seen.set(k, e); }
  return [...seen.values()];
}
const mmName = e => e.state === 'open' ? e.data.title || e.scene : '？？？';
const mmFace = (e, big) => {
  const face = charFace(e.owner);
  return face ? '<span class="ma-face' + (big ? ' big' : '') + (e.state === 'none' || e.state === 'closed' ? ' mm-unknown' : '') + '"><img src="' + face + '" alt=""></span>' : mappIco('key', 'gray');
};
function mmSub(e) {
  if (e.state === 'open') return mappEsc(e.data.subtitle || '');
  if (e.state === 'key') return e.noDoor ? '鑰匙已拼好・記憶之門還沒開放' : '到「' + mappEsc(e.mapName) + '」找記憶之門';
  if (e.state === 'shards') return '回憶碎片 ' + e.have + ' / ' + e.mk.need;
  if (e.state === 'closed') return '這段回憶還沒有開放';
  return '還沒找到回憶碎片';
}

function renderMemoryApp(el) {
  const all = memoryEntries(), open = all.filter(e => e.state === 'open');
  const tabs = [['all', '全部', all.length], ['open', '可以觀看', open.length], ['locked', '尚未解鎖', all.length - open.length]];
  const shown = mmTab === 'open' ? open : mmTab === 'locked' ? all.filter(e => e.state !== 'open') : all;
  const side = '<nav class="aa-side ma-side"><div class="ma-now mm-now"><small>已解鎖的回憶</small><b>' + open.length + ' / ' + all.length + '</b></div>' +
    tabs.map(([k, label, n]) => '<button type="button" class="aa-tab' + (k === mmTab ? ' on' : '') + '" data-mm-tab="' + k + '"><span>' + label + '</span><em>' + n + '</em></button>').join('') + '</nav>';
  const main = mmSel ? mmDetail(all.find(e => e.id === mmSel)) : mmList(shown);
  el.innerHTML = '<div class="aa ma mm">' + side + '<main class="aa-main' + (mmSel ? ' ma-push' : '') + '">' + main + '</main></div>';
  el.querySelector('.mm').addEventListener('click', e => {
    const t = e.target.closest('[data-mm-tab]'), row = e.target.closest('[data-mapp-sel]'), back = e.target.closest('.ma-back'), play = e.target.closest('[data-mm-play]');
    if (play) { playMemoryFromTPad(play.dataset.mmPlay); return; }
    if (t) { if (t.dataset.mmTab === mmTab && !mmSel) return; mmTab = t.dataset.mmTab; mmSel = null; }
    else if (row) mmSel = row.dataset.mappSel;
    else if (back) mmSel = null;
    else return;
    renderMemoryApp(el);
    if (typeof sfx === 'function') sfx('blip');
  });
}
function mmList(list) {
  const title = mmTab === 'open' ? '可以觀看' : mmTab === 'locked' ? '尚未解鎖' : '回憶';
  return '<h2 class="aa-title">' + title + '</h2><p class="aa-sub">用回憶鑰匙打開記憶之門，看過的回憶都可以在這裡重看</p>' +
    (list.length ? '<div class="aa-list">' + list.map(e => {
      const [label, cls] = MM_STATE[e.state];
      return mappRow(e.id, mmFace(e), '<small class="mm-who">' + mappEsc(charName(e.owner)) + '篇</small>' + mappEsc(mmName(e)), mmSub(e),
        e.state === 'open' ? '<em class="ma-pill green">▶ 播放</em>' : '<em class="ma-pill ' + cls + '">' + label + '</em>');
    }).join('') + '</div>'
      : mappNote(mmTab === 'open' ? '還沒有解開任何記憶之門。' : '全部的回憶都解鎖了！'));
}
function mmDetail(e) {
  if (!e) return mappBack('回憶') + mappNote('找不到這段回憶。');
  const [label, cls] = MM_STATE[e.state], shard = itemById(e.mk.shard), key = itemById(e.mk.key);
  const hero = '<div class="ma-hero">' + mmFace(e, true) + '<div><em class="ma-pill ' + cls + '">' + mappEsc(charName(e.owner)) + '篇・' + label + '</em><h2 class="aa-title">' + mappEsc(mmName(e)) + '</h2>' +
    (e.state === 'open' && e.data.subtitle ? '<p class="aa-sub">' + mappEsc(e.data.subtitle) + '</p>' : '') + '</div></div>';
  if (e.state === 'open') {
    return mappBack('回憶') + hero +
      (e.data.endTitle || e.data.endText ? '<div class="ma-card mm-quote"><b>' + mappEsc(e.data.endTitle || '') + '</b>' + (e.data.endText ? '<p>' + mappEsc(e.data.endText) + '</p>' : '') + '</div>' : '') +
      '<button type="button" class="mm-play" data-mm-play="' + mappEsc(e.scene) + '">▶ 播放這段回憶</button>' +
      mappNote('看完會回到現在的位置。記憶之門在「' + mappEsc(e.mapName) + '」。');
  }
  const shards = '<div class="side-shards">' + Array.from({ length: e.mk.need }, (_, i) => '<img src="' + shard.image + '" alt="" class="' + (i < e.have ? 'got' : '') + '">').join('') + '</div>';
  const keyLine = '<div class="mm-key' + (e.hasKey ? ' got' : '') + '"><img src="' + key.image + '" alt=""><span>' + mappEsc(key.name) + (e.hasKey ? '（已拼好）' : '') + '</span></div>';
  const how = e.state === 'closed' ? '這段回憶還沒有開放，之後的更新會加入。'
    : e.state === 'key' && e.noDoor ? '鑰匙已經拼好了。這段回憶的記憶之門還沒開放，之後的更新會加入。'
    : e.state === 'key' ? '鑰匙已經拼好了。到「' + mappEsc(e.mapName) + '」找到被鎖鏈鎖住的記憶之門，帶著鑰匙按 Space 就能打開。'
    : '集滿 ' + e.mk.need + ' 片「' + mappEsc(shard.name) + '」就能拼成鑰匙。目前 ' + e.have + ' / ' + e.mk.need + '。<br><small>回憶碎片可以從「今日想吃」委託拿到。</small>';
  return mappBack('回憶') + hero + '<div class="ma-card">' + shards + keyLine + '<p>' + how + '</p></div>';
}
function playMemoryFromTPad(id) {
  if (window.STORY_MODE) return;
  if (typeof closeTPad === 'function') closeTPad(true);
  if (typeof saveGame === 'function') saveGame();   // 劇情播放中不存檔：進去前先存
  if (!StoryScene.playFromGame(id, () => systemNotice('……回到了現實'))) systemNotice('這段回憶打不開', true);
}
