/* ===== 服裝系統：換 skin、戴配件、衣櫃的服裝介面（資料在 data/costumes.js）=====
   ・存檔 tudrc_costumes_v1：{ owned: { 服裝id: 數量 }, equip: { 角色id: { base, battle, head, face, back, hand } }, gifted: { 角色id: [送給他的服裝id] } }
       base／battle＝基地、戰鬥各穿哪一套 skin（'A'、'B'＝角色原本那兩套，其他＝COSTUME_SKINS 的 id；沒設＝照原本：基地 A、戰鬥 B）
   ・遊戲裡挑精靈圖時先問 costumeOutfit（js/game.js 的 applyOutfits）；配件由 drawCostumeAccessories 畫（js/render.js 畫角色的地方）
     配件的位置、怎麼畫在 js/costume-draw.js（和服裝編輯器共用）
   ・在衣櫃（data/costumes.js 的 WARDROBE_TILES）前按 Space 打開服裝介面（只換自己的）；開著的時候玩家停住（js/game.js 的 frame）
   ・隊友的服裝：在基地跟隊友對話，按「👗 推薦穿搭」打開他的服裝介面
   必須在 js/game.js 之前載入。
*/
const COSTUME_STORE = 'tudrc_costumes_v1';
let costumeState = { owned: {}, equip: {}, gifted: {} };
try { const saved = JSON.parse(localStorage.getItem(COSTUME_STORE) || 'null'); if (saved && typeof saved === 'object') costumeState = { owned: saved.owned || {}, equip: saved.equip || {}, gifted: saved.gifted || {}, started: !!saved.started }; } catch (_) {}
const saveCostumes = () => { try { localStorage.setItem(COSTUME_STORE, JSON.stringify(costumeState)); } catch (_) {} };
if (!costumeState.started) {   // 第一次：先送測試用的服裝（扭蛋做好之前）
  for (const id of COSTUME_STARTER) costumeState.owned[id] = Math.max(1, costumeState.owned[id] || 0);
  costumeState.started = true; saveCostumes();
}
const SKIN_BY_ID = Object.fromEntries(COSTUME_SKINS.map(s => [s.id, s]));
const costumeEquip = id => costumeState.equip[id] || (costumeState.equip[id] = {});
const costumeOwned = id => (costumeState.owned[id] || 0) > 0;
const costumeGifted = (who, id) => ((costumeState.gifted || {})[who] || []).includes(id);   // 這件是送給 who 的禮物
// 能穿：溫特＝自己擁有的（＋送給她的）；隊友＝只有你送給他的。服裝編輯器設定「不能擁有」的不算
const costumeCanWear = (who, id) => (costumeGifted(who, id) || (who === 'winter' && costumeOwned(id))) && (typeof costumeAllowed !== 'function' || costumeAllowed(who, id));
const costumeCollected = id => costumeOwned(id) || Object.values(costumeState.gifted || {}).some(list => list.includes(id));   // 拿到過（扭蛋收藏用）
// 隊友身上沒送給他的服裝脫下來（以前隊友可以穿你背包裡的服裝）
for (const [who, eq] of Object.entries(costumeState.equip)) {
  if (who === 'winter' || !eq) continue;
  for (const k of Object.keys(eq)) {
    const v = eq[k]; if (!v || v === 'A' || v === 'B' || costumeGifted(who, v)) continue;
    eq[k] = (k === 'base' || k === 'battle') ? undefined : null;
  }
}
// 舊存檔：以前手部分左右手兩格，拿在左手（hand2）的改拿到手部；手部已經有拿東西就卸下
for (const eq of Object.values(costumeState.equip)) {
  if (!eq || !('hand2' in eq)) continue;
  if (!eq.hand && eq.hand2) eq.hand = eq.hand2;
  delete eq.hand2;
}
const costumeBase = folder => String(folder).replace(/_[A-Z]$/, '');
const costumeFolderOf = id => (CHARACTERS[id] && CHARACTERS[id].sprite) || '';

// ---- 角色原本的 A、B 兩套有沒有圖（有些角色只有一套）----
const costumeHas = {};   // 'red_A' → true／false（還不知道就是 undefined）
function costumeProbe(folder) {
  if (folder in costumeHas) return costumeHas[folder];
  costumeHas[folder] = undefined;
  const img = new Image(), base = costumeBase(folder), letter = folder.slice(-1);
  img.onload = () => { costumeHas[folder] = true; if (wardrobeOpen) renderWardrobe(); };
  img.onerror = () => { costumeHas[folder] = false; if (wardrobeOpen) renderWardrobe(); };
  img.src = `images/character/${folder}/${base}${letter}_0000_Front.png`;
  return undefined;
}
// skin 能不能在這裡穿：wear 'base'＝只能在應變中心、'battle'＝只能出勤；沒寫（含內建 A、B）＝都可以
const costumeSkinFitsMode = (skin, mode) => !skin || !skin.wear || skin.wear === mode;
const COSTUME_WEAR_NAMES = { base: '應變中心限定', battle: '出勤限定' };
// 這個角色可以穿的 skin：內建 A、B（有圖的）＋擁有的專屬 skin
function costumeSkinsFor(id) {
  const base = costumeBase(costumeFolderOf(id)), list = [];
  for (const k of ['A', 'B']) if (costumeProbe(base + '_' + k) !== false) list.push({ id: k, name: COSTUME_DEFAULT_SKINS[k], folder: base + '_' + k, builtin: true });
  for (const s of COSTUME_SKINS) if (s.char === id && costumeCanWear(id, s.id)) list.push(s);
  return list;
}

// ---- 換 skin：遊戲挑精靈圖時呼叫（js/game.js 的 applyOutfits）；沒指定就回傳 null（照原本）----
const costumeSkinCache = {};
function costumeSkinSet(id, folder, skinId) {
  const rec = outfitRecord(folder), base = costumeBase(folder);
  let set;
  if (skinId === 'A' || skinId === 'B') {
    if (costumeHas[base + '_' + skinId] === false) return null;
    set = rec[skinId] || (rec[skinId] = loadCharacterSprites(base + '_' + skinId));
  } else {
    const skin = SKIN_BY_ID[skinId]; if (!skin) return null;
    set = costumeSkinCache[skin.folder] || (costumeSkinCache[skin.folder] = loadCharacterSprites(skin.folder));
  }
  if (set.fail) return set;
  const fail = (rec.B && rec.B.fail) || (rec.A && rec.A.fail);   // 換穿的那套沒有倒地圖：用原本那套的
  return !set.fail && fail ? Object.assign({}, set, { fail }) : set;
}
function costumeSelectedSkin(id, mode, eqOverride) {
  const eq = eqOverride || costumeState.equip[id] || {};
  // 在基地穿著 sortie 的服裝（例如女僕裝）：出勤時沿用身上的服裝
  if (mode === 'battle' && SKIN_BY_ID[eq.base] && SKIN_BY_ID[eq.base].sortie) return eq.base;
  return mode === 'base' ? eq.base : eq.battle;
}
function costumeOutfit(id, folder) {
  const eq = costumeState.equip[id]; if (!eq) return null;
  const mode = MAP_SAFE && !MAP_STORY ? 'base' : 'battle';   // 劇情地圖：穿著原本出勤的那套
  const want = costumeSelectedSkin(id, mode);
  if (want && !costumeSkinFitsMode(SKIN_BY_ID[want], mode)) return null;   // 這裡不能穿：照原本
  return want ? costumeSkinSet(id, folder, want) : null;
}

// ---- 配件：畫某個角色身上戴的配件（位置、畫法在 js/costume-draw.js）----
// dx、dy、size＝角色圖畫在哪裡、多大；layer＝'behind'（畫在角色後面的）或 'front'
function drawCostumeAccessories(ctx, id, who, dx, dy, size, layer, equipOverride) {
  const eq = equipOverride || costumeState.equip[id]; if (!eq) return;
  const dir = (who && who.dir) || 'front', frame = costumeFrameOf(who);
  const accs = sortAccsByLayer(ACC_SLOTS.map(slot => eq[slot] && ACC_BY_ID[eq[slot]]).filter(Boolean));   // 照圖層（服裝編輯器設定）由下往上畫
  for (const acc of accs) drawAccessory(ctx, acc, id, dir, frame, dx, dy, size, layer);
}

// 拿到一件服裝（扭蛋機 js/gacha.js、之後的送禮）：回傳是不是第一次拿到
function costumeGrant(id) {
  const first = !costumeOwned(id);
  costumeState.owned[id] = (costumeState.owned[id] || 0) + 1;
  saveCostumes();
  return first;
}
const costumeItem = id => ACC_BY_ID[id] || SKIN_BY_ID[id] || null;

// ---- 送禮（js/gifts.js 的禮物選單）----
// 可以送給 who 的服裝：擁有的、沒寫 giftable: false、skin 只送給那個角色、還沒送過他的
function costumeGiftable(who) {
  return [...COSTUME_ACCESSORIES, ...COSTUME_SKINS.filter(s => s.char === who)]
    .filter(item => item.giftable !== false && costumeOwned(item.id) && !costumeGifted(who, item.id) && (typeof costumeAllowed !== 'function' || costumeAllowed(who, item.id)));
}
// 送出：用掉一件、記成他的、馬上穿上
function costumeGive(who, id) {
  const item = costumeItem(id); if (!item || !costumeOwned(id)) return false;
  costumeState.owned[id] -= 1; if (costumeState.owned[id] <= 0) delete costumeState.owned[id];
  const gifted = costumeState.gifted || (costumeState.gifted = {});
  (gifted[who] = gifted[who] || []).push(id);
  const eq = costumeEquip(who);
  if (item.slot) eq[item.slot] = id;
  else for (const mode of ['base', 'battle']) if (costumeSkinFitsMode(item, mode)) eq[mode] = id;   // 限定場合的 skin 只換那一邊
  if (!costumeOwned(id)) {   // 你手上沒有了：別人身上穿的那件脫下來（送給他們的除外）
    for (const [other, e] of Object.entries(costumeState.equip)) {
      if (other === who || costumeGifted(other, id)) continue;
      for (const k of Object.keys(e)) if (e[k] === id) e[k] = (k === 'base' || k === 'battle') ? undefined : null;
    }
  }
  saveCostumes();
  if (typeof applyOutfits === 'function') applyOutfits();
  if (typeof checkAchievements === 'function') checkAchievements('allWear:');   // 成就：全員戴上某件配件
  return true;
}
// 禮物選單、扭蛋收藏裡的小圖
const costumeIconSrc = item => item.icon || (item.slot ? item.art.front : `images/character/${item.folder}/${item.folder.replace('_', '')}_0000_Front.png`);

// ---- 地圖上某種素材（衣櫃、扭蛋機）的位置；test(素材id, 素材) 決定要哪些；safeOnly＝只在基地（安全區）找 ----
function costumeSpots(test, safeOnly = true) {
  if (!MAP || (safeOnly && !MAP_SAFE)) return [];
  const spots = [];
  for (const s of MAP.stamps || []) {
    const t = mapTileById(s.id); if (!t || !test(s.id, t)) continue;
    const x0 = OX + s.c * CELL + (s.ox || 0), y0 = OY + s.r * CELL + (s.oy || 0), w = mapStampW(s, t) * CELL, h = mapStampH(s, t) * CELL;
    spots.push({ x0, y0, x1: x0 + w, y1: y0 + h, x: x0 + w / 2, top: y0 });
  }
  return spots;
}
function costumeSpotNearPlayer(spots) {   // 溫特旁邊 30px 內最近的一個
  const p = G && G.player; if (!p || p.sitting || !G.running) return null;
  let best = null, bd = 30;
  for (const s of spots) {
    const d = Math.hypot(Math.max(s.x0 - p.x, 0, p.x - s.x1), Math.max(s.y0 - p.y, 0, p.y - s.y1));
    if (d <= bd) { bd = d; best = s; }
  }
  return best;
}

// ---- 衣櫃：靠近、打開 ----
let wardrobeOpen = false;
const wardrobeSpots = () => costumeSpots((id, t) => WARDROBE_TILES.includes(id) || /衣櫃/.test(t.name || ''));
const wardrobeNearPlayer = () => costumeSpotNearPlayer(wardrobeSpots());
function useWardrobeNearPlayer() { if (!wardrobeNearPlayer()) return false; openWardrobe(); return true; }

// ---- 服裝介面 ----
const wd = { el: null, who: 'winter', mode: 'base', slot: 'skin', dir: 0, t0: 0, draft: {} };   // draft＝試穿中的服裝，按「確定更換」才真的換上
const WD_DIRS = ['front', 'left', 'back', 'right'], WD_DIR_NAMES = { front: '正面', left: '左側', back: '背面', right: '右側' };
const wardrobePeople = () => ['winter', ...(typeof ROSTER !== 'undefined' ? ROSTER : [])].filter((id, i, a) => a.indexOf(id) === i && CHARACTERS[id] && CHARACTERS[id].sprite);
function buildWardrobe() {
  const el = wd.el = document.createElement('div');
  el.id = 'wardrobe'; el.className = 'hidden';
  el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', '衣櫃');
  el.innerHTML = '<section class="wd-card"><header class="wd-head"><div class="wd-title"><h2></h2><p></p></div>'
    + '<button type="button" class="wd-close" aria-label="關閉（Esc）">×</button></header>'
    + '<div class="wd-body">'
    + '<div class="wd-stage"><nav class="wd-mode"><button type="button" data-mode="base">基地</button><button type="button" data-mode="battle">戰鬥</button></nav>'
    + '<canvas class="wd-preview" width="192" height="192"></canvas>'
    + '<div class="wd-turn"><button type="button" data-turn="-1" aria-label="往左轉">◀</button><span></span><button type="button" data-turn="1" aria-label="往右轉">▶</button></div>'
    + '<p class="wd-wearing"></p><button type="button" class="wd-confirm">確定更換</button></div>'
    + '<div class="wd-closet"><nav class="wd-tabs"></nav><div class="wd-grid"></div></div></div></section>';
  document.getElementById('wrap').appendChild(el);
  el.querySelector('.wd-close').addEventListener('click', closeWardrobe);
  el.querySelector('.wd-confirm').addEventListener('click', confirmCostume);
  el.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.mode) { wd.mode = b.dataset.mode; renderWardrobe(); }
    else if (b.dataset.turn) { wd.dir = (wd.dir + Number(b.dataset.turn) + 4) % 4; renderWardrobe(); }
    else if (b.dataset.slot) { wd.slot = b.dataset.slot; renderWardrobe(); }
    else if ('wear' in b.dataset) wearCostume(b.dataset.wear);
  });
}
// 目前穿的 skin（沒設＝照原本：基地 A、戰鬥 B）；eq＝看哪一套（衣櫃裡傳試穿中的 wd.draft，沒傳＝身上真的穿的）
function wdSkinOf(id, mode, eq) {
  const set = costumeSelectedSkin(id, mode, eq);
  if (set && costumeSkinFitsMode(SKIN_BY_ID[set], mode)) return set;
  const list = costumeSkinsFor(id), want = mode === 'base' ? 'A' : 'B';
  return list.some(s => s.id === want) ? want : (list[0] && list[0].id) || want;
}
// 點衣服：只換試穿（預覽），還沒真的換上
function wearCostume(itemId) {
  const eq = wd.draft;
  if (wd.slot === 'skin') {
    if (!costumeSkinFitsMode(SKIN_BY_ID[itemId], wd.mode)) return;   // 限定場合：這一邊不能穿
    eq[wd.mode === 'base' ? 'base' : 'battle'] = itemId;
  }
  else eq[wd.slot] = itemId || null;
  if (typeof sfx === 'function') sfx('button');
  renderWardrobe();
}
const wdDirty = () => { const a = costumeState.equip[wd.who] || {}, b = wd.draft;
  return [...new Set([...Object.keys(a), ...Object.keys(b)])].some(k => (a[k] || null) !== (b[k] || null)); };
// 「確定更換」：試穿的那套真的換上
function confirmCostume() {
  if (!wdDirty()) return;
  costumeState.equip[wd.who] = Object.assign({}, wd.draft);
  saveCostumes();
  if (typeof applyOutfits === 'function') applyOutfits();   // 遊戲裡的角色馬上跟著換
  if (typeof checkAchievements === 'function') checkAchievements('allWear:');   // 成就：全員戴上某件配件
  if (typeof sfx === 'function') sfx('switch');
  if (typeof systemNotice === 'function') systemNotice(CHARACTERS[wd.who].name + '換上新的穿搭了');
  renderWardrobe();
}
function renderWardrobe() {
  if (!wd.el) return;
  const el = wd.el, id = wd.who, eq = wd.draft;
  const self = id === 'winter';   // 衣櫃＝換自己的；跟隊友對話的「推薦穿搭」＝換那位隊友的
  el.querySelector('.wd-title h2').textContent = self ? '衣櫃' : '推薦穿搭';
  el.querySelector('.wd-title p').textContent = self ? '換上服裝和配件' : '幫' + CHARACTERS[id].name + '挑選服裝和配件';
  el.setAttribute('aria-label', self ? '衣櫃' : '推薦穿搭');
  el.querySelectorAll('.wd-mode [data-mode]').forEach(b => b.classList.toggle('on', b.dataset.mode === wd.mode));
  el.querySelector('.wd-turn span').textContent = WD_DIR_NAMES[WD_DIRS[wd.dir]];
  el.querySelector('.wd-tabs').innerHTML = COSTUME_SLOTS.map(s => '<button type="button" data-slot="' + s.id + '" class="' + (s.id === wd.slot ? 'on' : '') + '">' + s.name + '</button>').join('');
  // 衣服格：skin＝這個角色能穿的；配件＝擁有的、這個欄位的，第一格是「不戴」
  let cards = '';
  if (wd.slot === 'skin') {
    const cur = wdSkinOf(id, wd.mode, wd.draft);
    // 限定場合、這一邊不能穿的 skin：照樣列出來但變灰、不能點，標出能在哪裡穿
    cards = costumeSkinsFor(id).map(s => { const ok = costumeSkinFitsMode(s, wd.mode);
      return '<button type="button" class="wd-item' + (s.id === cur ? ' on' : '') + (ok ? '' : ' wd-off') + '" data-wear="' + s.id + '"' + (ok ? '' : ' disabled title="' + COSTUME_WEAR_NAMES[s.wear] + '"') + '>'
      + '<span class="wd-face"><img src="images/character/' + s.folder + '/' + s.folder.replace('_', '') + '_0000_Front.png" alt=""></span><b>' + s.name + '</b>'
      + (s.rarity ? '<em class="r-' + s.rarity + '">' + s.rarity + '</em>' : '')
      + (s.wear ? '<small class="wd-wear">' + COSTUME_WEAR_NAMES[s.wear] + '</small>' : '') + '</button>'; }).join('');
  } else {
    const cur = eq[wd.slot] || '';
    cards = '<button type="button" class="wd-item wd-none' + (!cur ? ' on' : '') + '" data-wear=""><span class="wd-icon">✕</span><b>不戴</b></button>'
      + COSTUME_ACCESSORIES.filter(a => accFitsSlot(a, wd.slot) && costumeCanWear(id, a.id)).map(a => '<button type="button" class="wd-item' + (a.id === cur ? ' on' : '') + '" data-wear="' + a.id + '"' + (costumeGifted(id, a.id) ? ' title="你送的禮物"' : '') + '>'
        + '<span class="wd-icon"><img src="' + costumeIconSrc(a) + '" alt=""></span><b>' + a.name + '</b>'
        + (a.rarity ? '<em class="r-' + a.rarity + '">' + a.rarity + '</em>' : '') + (costumeGifted(id, a.id) ? '<i>🎁</i>' : costumeState.owned[a.id] > 1 ? '<i>×' + costumeState.owned[a.id] + '</i>' : '') + '</button>').join('');
    if (!COSTUME_ACCESSORIES.some(a => accFitsSlot(a, wd.slot) && costumeCanWear(id, a.id))) cards += '<p class="wd-empty">' + (id === 'winter' ? '還沒有這個欄位的配件' : '還沒送' + CHARACTERS[id].name + '這個欄位的配件<br><small>在對話裡按「🎁 送禮」→「服飾」送給他</small>') + '</p>';
  }
  el.querySelector('.wd-grid').innerHTML = cards;
  const skin = wdSkinOf(id, wd.mode, wd.draft), skinName = (SKIN_BY_ID[skin] && SKIN_BY_ID[skin].name) || COSTUME_DEFAULT_SKINS[skin] || skin;
  const accs = ACC_SLOTS.map(s => eq[s] && ACC_BY_ID[eq[s]] && ACC_BY_ID[eq[s]].name).filter(Boolean);
  el.querySelector('.wd-wearing').textContent = CHARACTERS[id].name + '：' + skinName + (accs.length ? '・' + accs.join('、') : '');
  const dirty = wdDirty(), ok = el.querySelector('.wd-confirm');
  ok.disabled = !dirty; ok.textContent = dirty ? '確定更換' : '目前穿著';
}
// 預覽：站著的圖（不播走路動畫），配件跟著畫
function wardrobePreviewLoop(now) {
  if (!wardrobeOpen || !wd.el) return;
  const cvs = wd.el.querySelector('.wd-preview'), c = cvs.getContext('2d'), id = wd.who, dir = WD_DIRS[wd.dir];
  c.clearRect(0, 0, cvs.width, cvs.height);
  const set = costumeSkinSet(id, costumeFolderOf(id), wdSkinOf(id, wd.mode, wd.draft));
  const frames = set && set[dir], step = 0, img = frames && frames[step];   // 0＝站著的那張
  const size = 168, dx = (cvs.width - size) / 2, dy = cvs.height - size - 6;
  c.fillStyle = 'rgba(0,0,0,.28)'; c.beginPath(); c.ellipse(cvs.width / 2, cvs.height - 14, 40, 9, 0, 0, Math.PI * 2); c.fill();
  c.imageSmoothingEnabled = false;
  drawCostumeAccessories(c, id, { dir, frame: step }, dx, dy, size, 'behind', wd.draft);
  if (img && img.complete && img.naturalWidth) c.drawImage(img, dx, dy, size, size);
  drawCostumeAccessories(c, id, { dir, frame: step }, dx, dy, size, 'front', wd.draft);
  requestAnimationFrame(wardrobePreviewLoop);
}
function openWardrobe(who = 'winter') {
  if (wardrobeOpen || !CHARACTERS[who]) return;
  if (!wd.el) buildWardrobe();
  wardrobeOpen = true; wd.t0 = performance.now(); wd.who = who;
  wd.draft = Object.assign({}, costumeState.equip[who] || {});   // 試穿從身上這套開始；沒按「確定更換」就關掉＝不換
  if (typeof keys !== 'undefined') Object.keys(keys).forEach(k => { keys[k] = false; });
  wd.el.classList.remove('hidden'); renderWardrobe();
  if (typeof sfx === 'function') sfx('menu');
  requestAnimationFrame(wardrobePreviewLoop);
}
function closeWardrobe() {
  if (!wardrobeOpen) return;
  wardrobeOpen = false; wd.el.classList.add('hidden');
  if (typeof sfx === 'function') sfx('switch');
}
// ---- 跟隊友對話：多一個「👗 推薦穿搭」按鈕（game.js 的 openDialogue 呼叫），只在基地 ----
const outfitTargetOf = actor => { const id = actor && (actor.kind === 'tower' ? actor.type : actor.id);
  return id && id !== 'winter' && typeof ROSTER !== 'undefined' && ROSTER.includes(id) && CHARACTERS[id] && CHARACTERS[id].sprite ? id : null; };
function onDialogueOpenedOutfit(actor) {
  const btn = document.getElementById('dialogueOutfit'); if (!btn) return;
  btn.classList.toggle('hidden', !(MAP_SAFE && outfitTargetOf(actor)));
}
document.getElementById('dialogueOutfit')?.addEventListener('click', () => {
  const id = outfitTargetOf(dialogueState && dialogueState.actor); if (!id) return;
  if (typeof closeDialogue === 'function') closeDialogue(true);
  openWardrobe(id);
});
// 開著的時候：Esc 關掉，其他按鍵都不要傳給遊戲
window.addEventListener('keydown', e => {
  if (!wardrobeOpen) return;
  if (e.key === 'Escape') closeWardrobe();
  else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { wd.dir = (wd.dir + (e.key === 'ArrowLeft' ? -1 : 1) + 4) % 4; renderWardrobe(); }
  if (e.key === ' ' || e.key.startsWith('Arrow')) e.preventDefault();
  e.stopImmediatePropagation();
}, { capture: true });
