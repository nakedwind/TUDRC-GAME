/* ===== 新手區教學（第一關：Y區地下街-75號入口，data/balance.js 的 NEWBIE_START）=====
   ・第一次進新手區：先問要不要看教學（選「跳過」就不跳任何提示）。
   ・看教學：艾德林先說營地有箱子可以開；之後玩家自由走，靠近東西（或第一次遇到某件事）才由艾德林跳一段提示。
   ・每段提示只跳一次：死掉重來不會再跳。看過哪些記在瀏覽器（TUTORIAL_KEY），開新遊戲會清掉（js/new-game.js）。
   ・台詞都在下面的 TUTORIAL.hints，直接改文字就好（一個字串＝一句，按 Space 換下一句）。
   必須在 js/game.js、js/camp-interactions.js 之後載入。
*/
const TUTORIAL_KEY = 'tudrc_tutorial_v1';
const TUTORIAL = {
  speaker: 'eldrin',          // 說提示的人（艾德林）
  darkDelay: .6,              // 站在暗處幾秒才跳「照明彈」提示（只是路過一下不跳）
  enemyCells: 8,              // 怪物在溫特幾格內、看得到，才算「第一次看到怪物」
  taintAt: 40,                // 隊員汙染到多少跳「疏導」提示
  coreCells: 7,               // 核心在溫特幾格內、看得到，才跳「異質核心」提示
  coreDarkCells: 4,           // 核心在暗處：走到幾格內也算看到（核心很大顆）
  exitCells: 3,               // 離出口幾格內跳「出口」提示
  hints: {
    intro: [
      '溫特，這裡是 75 號入口，再往裡面就是 Y 區地下街了。',
      '先熟悉一下吧：WASD 移動，滑鼠瞄準，按住左鍵開槍。',
      '營地這邊有物資箱和裝備箱，走到箱子前面按 Space 就能打開。',
      '準備好了就往前走，我們會跟在你後面。',
    ],
    supply: [
      '這是物資箱，裡面有醫療包、急救包和杏仁水。',
      '我身上的急救包、杏仁水用完了，會自己回來這裡拿。你也可以按 Space 打開，拿東西或把東西放進去。',
      '隊員受傷時，走到他旁邊按 F 就能急救。',
    ],
    armor: [
      '這是裝備箱，我們幫你放了一頂防護頭盔。',
      '按 Space 打開，把頭盔穿上，被打到會比較不痛。',
    ],
    refill: [
      '這是補彈藥箱。照明彈用完了，走過來按 Space 就能補。',
    ],
    dark: [
      '前面太暗了，我們在黑暗裡看不到怪物，也沒辦法過去巡邏。',
      '轉滑鼠滾輪換成照明彈，朝暗處開一槍，就能把那一帶照亮。',
    ],
    enemy: [
      '有異質體！',
      '在隊員身上按右鍵打開選單，選「指派位置巡邏」再點地圖，就能讓他去守那個位置。',
      '溫特也可以自己開槍，牠們會被槍聲吸引過來。',
    ],
    taint: [
      '{name}的汙染升高了！汙染太高會暴走，反過來攻擊我們。',
      '走到他旁邊按 C 疏導，或點畫面上隊員頭像旁的疏導按鈕。疏導會用掉嚮導能量。',
    ],
    core: [
      '那個就是異質核心，異質體都是從它那裡跑出來的。',
      '把它打破，這一區就能控制住。小心，開槍打它會讓它醒過來，召喚出更多異質體。',
    ],
    exit: [
      '這裡通往 Y 區地下街入口，就是下一個要攻略的地方。',
    ],
  },
};

let tutorialAskOpen = false, tutorialAskEl = null, tutorialDarkT = 0;
const tutorialState = (() => { try { return JSON.parse(localStorage.getItem(TUTORIAL_KEY) || 'null'); } catch (_) { return null; } })() || { decided: false, skip: false, seen: [] };
const tutorialSave = () => { try { localStorage.setItem(TUTORIAL_KEY, JSON.stringify(tutorialState)); } catch (_) {} };
const tutorialSeen = id => tutorialState.seen.includes(id);
const tutorialCells = n => n * CELL;

// 艾德林說一段提示（對話框開著時遊戲會暫停）；回傳 true＝真的說了
function tutorialSay(id, vars = {}) {
  if (tutorialSeen(id) || dialogueState || typeof openTextDialogue !== 'function') return false;
  const lines = (TUTORIAL.hints[id] || []).map(s => s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? ''));
  if (!lines.length) return false;
  const who = TUTORIAL.speaker, set = typeof sentrySprites !== 'undefined' && sentrySprites[who];
  const face = set && set.front && set.front[0];
  openTextDialogue({ name: (TYPES[who] || {}).name || '艾德林', image: face ? face.src : '', lines, kind: who });
  tutorialState.seen.push(id); tutorialSave();
  return true;
}

// ---- 開場：要不要看教學 ----
function ensureTutorialAskEl() {
  if (tutorialAskEl) return tutorialAskEl;
  tutorialAskEl = document.createElement('div');
  tutorialAskEl.id = 'tutorialAsk'; tutorialAskEl.className = 'hidden';
  tutorialAskEl.setAttribute('role', 'dialog'); tutorialAskEl.setAttribute('aria-modal', 'true');
  tutorialAskEl.innerHTML = '<section class="item-intro-card">' +
    '<h2>新手教學</h2>' +
    '<p>要讓艾德林一邊走一邊教你怎麼玩嗎？<br>已經玩過的話可以跳過。</p>' +
    '<div class="tutorial-ask-buttons">' +
    '<button type="button" class="item-intro-ok" data-tutorial="watch">看教學 <kbd>Enter</kbd></button>' +
    '<button type="button" class="item-intro-ok tutorial-skip" data-tutorial="skip">跳過教學 <kbd>Esc</kbd></button>' +
    '</div></section>';
  tutorialAskEl.addEventListener('click', e => { const b = e.target.closest('[data-tutorial]'); if (b) closeTutorialAsk(b.dataset.tutorial === 'skip'); });
  (document.getElementById('wrap') || document.body).appendChild(tutorialAskEl);
  return tutorialAskEl;
}
function openTutorialAsk() {
  const el = ensureTutorialAskEl();
  tutorialAskOpen = true; aimHeld = false;
  if (typeof keys !== 'undefined') Object.keys(keys).forEach(k => { keys[k] = false; });
  el.classList.remove('hidden'); sfx('menu');
  setTimeout(() => el.querySelector('[data-tutorial="watch"]')?.focus(), 0);
}
function closeTutorialAsk(skip) {
  if (!tutorialAskOpen) return;
  tutorialAskOpen = false; tutorialAskEl.classList.add('hidden'); sfx('button');
  tutorialState.decided = true; tutorialState.skip = skip; tutorialSave();
  if (!skip) setTimeout(() => tutorialSay('intro'), 150);
}
window.addEventListener('keydown', e => {
  if (!tutorialAskOpen) return;
  e.preventDefault(); e.stopImmediatePropagation();
  if (e.repeat) return;
  if (e.key === 'Enter' || e.key === ' ') closeTutorialAsk(false);
  else if (e.key === 'Escape') closeTutorialAsk(true);
}, true);

// ---- 每幀（js/game.js 的 update 呼叫）：檢查要不要跳提示 ----
function updateTutorial(dt) {
  if (!isNewbieMap() || !G || !G.running || G.over || !G.player || G.player.hp <= 0) return;
  if (!tutorialState.decided) { if (!tutorialAskOpen) openTutorialAsk(); return; }
  if (tutorialState.skip || dialogueState) return;
  if (!tutorialSeen('intro')) { tutorialSay('intro'); return; }
  const p = G.player, near = (x, y, cells) => Math.hypot(x - p.x, y - p.y) <= tutorialCells(cells);
  // 營地的箱子
  if (typeof mapBoxes === 'function') {   // 箱子擠在一起時 mapBoxNearPlayer 只認最近的那個，這裡每一種各自量
    const boxNear = kind => mapBoxes().some(b => b.kind === kind && Math.hypot(Math.max(b.left - p.x, 0, p.x - b.right), Math.max(b.top - p.y, 0, p.y - b.bottom)) <= MAP_BOX.reach + 10);
    for (const kind of ['supply', 'armor', 'refill']) if (!tutorialSeen(kind) && boxNear(kind) && tutorialSay(kind)) return;
  }
  // 第一次走進暗處（站一下才算）
  tutorialDarkT = typeof isLit === 'function' && !isLit(p.x, p.y) ? tutorialDarkT + dt : 0;
  if (tutorialDarkT >= TUTORIAL.darkDelay && tutorialSay('dark')) return;
  // 第一次看到怪物
  if (!tutorialSeen('enemy') && (G.enemies || []).some(e => e.hp > 0 && near(e.x, e.y, TUTORIAL.enemyCells) && (typeof enemyVisible !== 'function' || enemyVisible(e))) && tutorialSay('enemy')) return;
  // 隊員汙染升高
  const tainted = !tutorialSeen('taint') && (G.towers || []).find(t => t.hp > 0 && (t.taint || 0) >= TUTORIAL.taintAt);
  if (tainted && tutorialSay('taint', { name: (TYPES[tainted.type] || {}).name || '隊員' })) return;
  // 看到異質核心
  if (!tutorialSeen('core') && (G.cores || []).some(c => !c.dead && near(c.x, c.y, TUTORIAL.coreCells) && (typeof isLit !== 'function' || isLit(c.x, c.y) || near(c.x, c.y, TUTORIAL.coreDarkCells))) && tutorialSay('core')) return;
  // 出口
  if (!tutorialSeen('exit') && typeof mapPortals !== 'undefined' && (mapPortals || []).some(o => { const [x, y] = center(o.c, o.r); return near(x, y, TUTORIAL.exitCells); }) && tutorialSay('exit')) return;
}
