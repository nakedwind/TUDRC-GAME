/* ===== 開發工坊新手教學（第一次跟諾亞說話時）=====
   ・在基地第一次跟諾亞說話：諾亞先問「要我帶你看一下嗎？」，玩家選「好，介紹一下」或「我自己看就好」（跳過以後也不再問）。
   ・介紹的順序：開場說明 → 點「製作裝備」→ 諾亞免費送一件標準防護背心（WORKSHOP_TUTORIAL_GIFT，玩家自己按按鈕做出來，
     放進背包、不自動穿上）→ 說明「開發過＝學會，之後可以製作一件」→ 這件隊友也能穿（到防具箱換）→ 點「升級裝備」
     → 每一件各升各的 → 右邊可以分解 → 點「補充彈藥」→ 點「開發建築物」→ 結尾。
   ・之後第一次打開防具箱（背包裡有隊友能穿的裝備時）：再帶一次「點隊員頭像 → 點裝備 → 穿上」。
   ・畫面用新手區教學同一套（js/tutorial.js：畫面變暗、只亮要按的東西、旁邊一張卡片；照做才往下）。
   ・台詞都在 js/workshop-config.js 的 WORKSHOP_TUTORIAL_LINES（預設），開發工坊編輯器「🎓 新手教學台詞」可以改（存在 data/workshop.js 的 tutorial）。
   ・看過了記在新手教學同一格（tudrc_tutorial_v1 的 seen：'L:workshop'、'L:wsArmor'），開新遊戲會清掉。
     沒教完就被關掉（例如換地圖）：下次跟諾亞說話會再問一次。
   必須在 js/tutorial.js、js/equipment.js、js/gear-v2.js、js/backpack.js、js/workshop-config.js 之後載入。
*/
const WS_TUT_ID = 'workshop', WS_TUT_ARMOR_ID = 'wsArmor';
const wsTutQ = sel => document.querySelector(sel);
const wsTutRect = sel => tutElRect(wsTutQ(sel));
const wsTutGiftDef = () => (typeof equipDef === 'function' ? equipDef(WORKSHOP_TUTORIAL_GIFT) : null);
// 台詞：設定檔／預設＋把 {make}{up}{ammo}{build}{gift} 換成現在的名字
function wsTutText(key) {
  const g = wsTutGiftDef();
  const names = { make: workshopPageName('make'), up: workshopPageName('up'), ammo: workshopPageName('ammo'), build: workshopPageName('build'), gift: g ? g.name : '' };
  return workshopTutorialText(key).replace(/\{(\w+)\}/g, (m, k) => k in names ? names[k] : m);
}
const wsTutWho = () => (typeof CHARACTERS !== 'undefined' && CHARACTERS.noah && CHARACTERS.noah.name) || '諾亞';
const wsTutPress = e => e.type === 'mousedown' || e.type === 'click';
// 「請玩家點某個東西」的一步：只有那個東西點得到，做到 done 才往下
const wsTutClickStep = (name, sel, done, extra = {}) => ({ name, who: wsTutWho(), text: wsTutText(name), spots: () => [wsTutRect(sel)],
  allow: e => wsTutPress(e) && tutIn(e, wsTutQ(sel)), done, ...extra });
// 「告訴玩家」的一步：按 Space 知道了
const wsTutSayStep = (name, spots, extra = {}) => ({ name, who: wsTutWho(), text: wsTutText(name), ack: true, spots: () => spots().map(wsTutRect), ...extra });
// 選一格並捲到看得到的地方
function wsTutPick(key) {
  if (!key || typeof renderWorkshop !== 'function') return;
  wsPick = key; renderWorkshop();
  wsTutQ('#workshop [data-ws-pick="' + key + '"]')?.scrollIntoView({ block: 'nearest' });
}
const wsTutGiftTile = () => wsTutQ('#workshop [data-ws-pick="g:' + WORKSHOP_TUTORIAL_GIFT + '"]');
const wsTutGiftCount = () => (typeof gearTotal === 'function' ? gearTotal(WORKSHOP_TUTORIAL_GIFT) : (equipState.owned[WORKSHOP_TUTORIAL_GIFT] ? 1 : 0));

// ---- 開發工坊那一段 ----
function wsTutSteps() {
  return [
    { name: 'ask', who: wsTutWho(), text: wsTutText('askCard'), spots: () => [wsTutRect('#dialogueBox')],
      after: '<div class="tf-choices"><button type="button" data-wst="yes">' + wsTutText('askYes') + '<kbd>Enter</kbd></button>' +
        '<button type="button" class="tf-no" data-wst="no">' + wsTutText('askNo') + '<kbd>Esc</kbd></button></div>',
      allow: e => {
        if (e.type === 'keydown' && !e.repeat && (e.key === 'Enter' || e.key === 'Escape')) { wsTutAnswer(e.key === 'Enter'); return false; }
        const b = e.target instanceof Element && e.target.closest('#tutFocus [data-wst]');
        if (b && e.type === 'click') { wsTutAnswer(b.dataset.wst === 'yes'); return false; }
        return !!b && e.type === 'mousedown';
      } },
    wsTutSayStep('intro', () => ['#dialogueBox']),
    wsTutClickStep('clickMake', '#dialogueWorkshop', () => workshopOpen && wsPage === 'make'),
    // 送的那件：製作裝備頁上沒有、或是鎖著的（被編輯器刪掉、改成戰鬥區域才拿得到）就整段跳過
    wsTutSayStep('pickGift', () => ['#workshop [data-ws-pick="g:' + WORKSHOP_TUTORIAL_GIFT + '"]', '#workshop .ws-info'],
      { skip: L => (L.data.noGift = !wsTutGiftTile() || wsTutGiftTile().classList.contains('locked')), enter: () => wsTutPick('g:' + WORKSHOP_TUTORIAL_GIFT) }),
    wsTutClickStep('freeDev', '#workshop .ws-info [data-ws]', L => wsTutGiftCount() > L.data.before, {
      skip: L => L.data.noGift,
      enter: L => { L.data.before = wsTutGiftCount(); L.data.freeUsed = false; wsTutFreeLabel(); },
      tick: () => wsTutFreeLabel() }),   // 工坊重畫時按鈕會變回原本的價錢：每一格都檢查一下
    // 做好了：亮這一格＋右邊「背包裡的裝備」裡的那一件（捲到看得到）
    wsTutSayStep('made', () => ['#workshop [data-ws-pick="g:' + WORKSHOP_TUTORIAL_GIFT + '"]', wsTutBagSel()],
      { skip: L => L.data.noGift, enter: () => { wsTutPick('g:' + WORKSHOP_TUTORIAL_GIFT); wsTutQ(wsTutBagSel())?.scrollIntoView({ block: 'nearest' }); } }),
    wsTutSayStep('squad', () => ['#workshop .ws-info .bag-tags'],
      { skip: L => L.data.noGift || !(typeof gearSquadCan === 'function' && gearSquadCan(wsTutGiftDef())) }),
    wsTutClickStep('clickUp', '#workshop [data-ws-tab="up"]', () => wsPage === 'up'),
    wsTutSayStep('upgrade', () => [wsTutUpSel(), '#workshop .ws-info .ws-btn'], {
      enter: () => { const t = wsTutQ(wsTutUpSel()); if (t) wsTutPick(t.dataset.wsPick); } }),
    wsTutSayStep('scrap', () => ['#workshop .workshop-side']),
    wsTutClickStep('clickAmmo', '#workshop [data-ws-tab="ammo"]', () => wsPage === 'ammo'),
    wsTutSayStep('ammo', () => ['#workshop [data-ws-tab="ammo"]', '#workshop .ws-ammo-scroll']),
    wsTutClickStep('clickBuild', '#workshop [data-ws-tab="build"]', () => wsPage === 'build'),
    wsTutSayStep('build', () => ['#workshop [data-ws-tab="build"]', '#workshop .ws-scroll']),
    // 結尾：按 Space 或直接關掉工坊都算看完
    wsTutSayStep('end', () => ['#workshop .workshop-close'], { done: () => !workshopOpen, allow: e => wsTutPress(e) && tutIn(e, wsTutQ('#workshop .workshop-close')) }),
  ];
}
// 工坊右邊「背包裡的裝備」裡送的那件（沒有就整個「背包裡的裝備」區）
const wsTutBagSel = () => wsTutQ('#workshop .wss-item[data-scrap^="' + WORKSHOP_TUTORIAL_GIFT + '#"]') ? '#workshop .wss-item[data-scrap^="' + WORKSHOP_TUTORIAL_GIFT + '#"]' : '#workshop .workshop-side';
// 升級裝備頁：送的那件（有好幾件就第一件）；沒有就第一格
const wsTutUpSel = () => wsTutQ('#workshop [data-ws-pick^="g:' + WORKSHOP_TUTORIAL_GIFT + '#"]') ? '#workshop [data-ws-pick^="g:' + WORKSHOP_TUTORIAL_GIFT + '#"]' : '#workshop .ws-tile';
// 免費那一步：按鈕上的價錢換成「免費」（「開發」「製作一件」那幾個字留著）
function wsTutFreeLabel() {
  const b = wsTutQ('#workshop .ws-info [data-ws]');
  if (!b || b.dataset.wstFree) return;
  b.dataset.wstFree = '1'; b.disabled = false;
  const cost = b.querySelector('.ws-btn-cost');
  if (cost) cost.innerHTML = '<b class="ws-tut-free">' + wsTutText('freeBtn') + '</b>';
  else b.innerHTML = wsTutText('freeBtn');
}
// 現在是不是在「免費送一件」那一步
const wsTutOnStep = name => typeof tutLesson !== 'undefined' && tutLesson && tutLesson.id === WS_TUT_ID && tutLesson.step && tutLesson.step.name === name;
// js/equipment.js 的 spendWorkshop 先問這裡：送的那一次不花錢（只送一次）
function wsTutorialTakeFree() {
  if (!wsTutOnStep('freeDev') || tutLesson.data.freeUsed) return false;
  tutLesson.data.freeUsed = true;
  return true;
}
// js/gear-v2.js 的 grantEquipment 讀這個：送的那件放進背包、不自動穿上（才能示範給隊友穿）
Object.defineProperty(window, 'wsTutorialGiftToBag', { get: () => wsTutOnStep('freeDev'), configurable: true });
// js/equipment.js 的 closeWorkshop 先問這裡：教學帶到結尾之前不能關工坊
const wsTutorialBusy = () => typeof tutLesson !== 'undefined' && !!tutLesson && tutLesson.id === WS_TUT_ID && !(tutLesson.step && tutLesson.step.name === 'end');

function wsTutAnswer(yes) {
  sfx('button');
  if (yes) { tutNextStep(); return; }
  tutLesson.steps.length = tutLesson.i + 1;   // 跳過：後面的步驟拿掉，直接結束（記成看過了，以後不再問）
  tutNextStep();
}
// 教完或跳過：對話框從「要我介紹嗎？」換到諾亞原本要說的話
function wsTutDialogueOn() {
  if (typeof dialogueState !== 'undefined' && dialogueState && dialogueState.wsTutAsk && dialogueState.index === 0 && dialogueState.lines.length > 1) {
    dialogueState.index = 1; if (typeof renderDialogueLine === 'function') renderDialogueLine();
  }
}
// js/equipment.js 的 onDialogueOpenedWorkshop 呼叫（跟諾亞說話、在基地裡）
function wsTutorialMaybeStart() {
  if (tutLessonSeen(WS_TUT_ID) || tutLesson || typeof dialogueState === 'undefined' || !dialogueState || dialogueState.wsTutAsk) return;
  // 對話框第一句換成諾亞問要不要介紹，原本的台詞接在後面（教完或跳過就接著說）
  dialogueState.lines = [wsTutText('ask').replace(/<[^>]*>/g, '')].concat(dialogueState.lines);
  dialogueState.index = 0; dialogueState.wsTutAsk = true;
  if (typeof renderDialogueLine === 'function') renderDialogueLine();
  setTimeout(() => {   // 等對話框排好版再亮
    if (tutLesson || !dialogueState || !dialogueState.wsTutAsk) return;
    startTutorialLesson(WS_TUT_ID, wsTutSteps(), {
      anyMap: true,   // 不在新手區也要教（js/tutorial.js 的 tutorialFrame）
      alive: () => workshopOpen || (typeof dialogueState !== 'undefined' && !!dialogueState && !!dialogueState.wsTutAsk),
    }, wsTutDialogueOn);
  }, 0);
}

// ---- 防具箱那一段：幫隊友穿上裝備 ----
const wsTutSquadGearInBag = () => typeof gearSquadCan === 'function' && typeof gearBagCount === 'function' && EQUIPMENT.some(d => gearSquadCan(d) && gearBagCount(d.id) > 0);
const wsTutArmorItemSel = () => wsTutQ('#backpackGrid [data-drag-sgear^="' + WORKSHOP_TUTORIAL_GIFT + '#"]') ? '#backpackGrid [data-drag-sgear^="' + WORKSHOP_TUTORIAL_GIFT + '#"]' : '#backpackGrid .bag-cell.squadgear';
function wsTutArmorSteps() {
  const T = key => ({ text: wsTutText(key) });
  const member = '#equipPanel [data-armor-who]:not([data-armor-who="winter"])';
  return [
    { name: 'armorWho', ...T('armorWho'), spots: () => [wsTutRect(member)], allow: e => wsTutPress(e) && tutIn(e, wsTutQ(member)), done: () => armorWho !== 'winter' },
    { name: 'armorItem', ...T('armorItem'), skip: () => !wsTutQ(wsTutArmorItemSel()), spots: () => [wsTutRect(wsTutArmorItemSel())],
      allow: e => wsTutPress(e) && tutIn(e, wsTutQ(wsTutArmorItemSel())), done: () => String(backpackSel || '').startsWith(SQ_ARMOR_PREFIX) },
    { name: 'armorWear', ...T('armorWear'), skip: () => !wsTutQ('#backpackDetail [data-sq-wear]'), spots: () => [wsTutRect('#backpackDetail [data-sq-wear]')],
      allow: e => wsTutPress(e) && tutIn(e, wsTutQ('#backpackDetail [data-sq-wear]')), done: () => String(backpackSel || '').startsWith(SQ_WORN_PREFIX) },
    { name: 'armorDone', ...T('armorDone'), ack: true, spots: () => [wsTutRect('#equipPanel')] },
  ];
}
// js/backpack.js 的 openArmorPanel 呼叫：看過工坊教學、背包裡有隊友能穿的裝備、有隊員，才教
function wsTutorialArmorMaybeStart() {
  if (typeof GEAR_V2 === 'undefined' || !GEAR_V2 || !MAP_SAFE || tutLesson || !tutLessonSeen(WS_TUT_ID) || tutLessonSeen(WS_TUT_ARMOR_ID)) return;
  if (!campArmorOpen || !armorMembers().length || !wsTutSquadGearInBag()) return;
  setTimeout(() => {
    if (tutLesson || !campArmorOpen || !wsTutQ('#equipPanel [data-armor-who]:not([data-armor-who="winter"])')) return;
    startTutorialLesson(WS_TUT_ARMOR_ID, wsTutArmorSteps(), { anyMap: true, alive: () => campArmorOpen });
  }, 0);
}
