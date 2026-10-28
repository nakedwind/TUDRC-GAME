/* ===== 新手區教學（第一關：Y25區入口，data/balance.js 的 NEWBIE_START）=====
   ・開場劇情（TUTORIAL.story）：第一次進新手區先演一段——遠處傳來爆炸聲、畫面搖晃，溫特覺得奇怪，
     希奧妮用無線電說她們在 Y25 區、請求醫療組支援。演的時候遊戲暫停；看過就不再演（死掉重來也不演）。
   ・演完：先問要不要看教學（選「跳過」就不跳任何提示）。
   ・看教學：艾德林先說營地有箱子可以開；之後玩家自由走，靠近東西（或第一次遇到某件事）才由艾德林跳一段提示。
   ・開場突襲（TUTORIAL.opening）：開場白說完，路障北邊冒出 3 隻史萊姆去打營地的路障和探照燈；艾德林提醒一句，
     畫面下方出現 WASD 和滑鼠點擊的小動畫（按下去的鍵會亮），3 隻都打倒才收起來。這 3 隻打完之前核心不召喚（js/anomalous-core.js）。
     選「跳過教學」也照樣有這 3 隻，只是不說話、不跳動畫。
   ・動畫教學（艾德林說完話才開始）：遊戲暫停、畫面變暗，只有要操作的東西發光，旁邊的卡片播操作動畫；
     玩家照做才恢復（其他按鍵、點擊都沒反應）。「按 Space 知道了」的只是告訴玩家，不用照做。
       HP 掉到 TUTORIAL.hpAt 以下 → 快捷欄的醫療包；第一次疏導完（SP 變少）→ 杏仁水
       第一次站在暗處 → 滾輪換照明彈、朝暗處開槍；照亮之後 → 把探照燈拖到發光的格子 → 示範右鍵抓建築
       第一次看到怪物 → 右鍵點隊員 → 指派位置巡邏 → 點地圖 → 示範右鍵抓隊員
       隊員汙染升高／受傷 → 先用箭頭帶玩家走過去（不暫停），走到旁邊才暫停教 C 疏導／F 急救
   ・營地的箱子：箱子上面浮一顆 Space 鍵，沒打開過就一直顯示（裝備箱要把頭盔穿上才算）。
   ・每段提示只跳一次：死掉重來不會再跳。看過哪些記在瀏覽器（TUTORIAL_KEY），開新遊戲會清掉（js/new-game.js）。
   ・台詞都在下面的 TUTORIAL.hints（一個字串＝一句，按 Space 換下一句）；動畫卡片上的字在 TUTORIAL.cards。
   必須在 js/game.js、js/camp-interactions.js、js/build.js、js/quick-slots.js、js/equipment.js 之後載入。
*/
const TUTORIAL_KEY = 'tudrc_tutorial_v1';
const TUTORIAL = {
  speaker: 'eldrin',          // 說提示的人（艾德林）
  darkDelay: .6,              // 站在暗處幾秒才跳「照明彈」提示（只是路過一下不跳）
  enemyCells: 8,              // 怪物在溫特幾格內、看得到，才算「第一次看到怪物」
  taintAt: 40,                // 隊員汙染到多少跳「疏導」提示
  hpAt: .7,                   // 溫特 HP 掉到幾成以下跳「醫療包」教學
  aidAt: .7,                  // 隊員 HP 掉到幾成以下跳「急救包」教學
  coreCells: 7,               // 核心在溫特幾格內、看得到，才跳「異質核心」提示
  coreDarkCells: 4,           // 核心在暗處：走到幾格內也算看到（核心很大顆）
  exitCells: 3,               // 離出口幾格內跳「出口」提示
  boxCells: 7,                // 離箱子幾格內才浮出 Space 鍵
  // 開場劇情：一步一步往下演。wait＝等幾秒；sfx＝音效（volume＝音量，小一點聽起來比較遠）；shake＝畫面搖晃幾秒（power＝多用力）；
  // debris＝天花板掉碎石和粉塵幾秒（rocks＝每秒掉幾顆碎石、dust＝每秒飄幾團粉塵）；
  // who＋lines＝誰說話（winter＝溫特，其他用隊員 id：eldrin 艾德林、theonie 希奧妮…）；radio＝用無線電說（名字後面加「（無線電）」）
  story: [
    { wait: .8 },
    { sfx: 'bigBoom', volume: .45, shake: 1.8, power: 9, debris: 1.6, rocks: 20, dust: 15 },
    { wait: 1.2 },
    { who: 'winter', lines: ['……！？', '好大的爆炸聲……是從裡面傳來的？'] },
    { sfx: 'radio', wait: .7 },
    { who: 'eldrin', lines: ['隊長，有無線電。'] },
    { who: 'theonie', radio: true, lines: ['這裡是希奧妮……我們在 Y25 區，剛才...發生了意外！', '雷德受傷了……請求醫療組立即支援！重複，請求醫療組立即支援！'] },
    { who: 'eldrin', lines: ['收到，我們馬上過去！', '隊長，Y25 區就在這個入口裡面，我們出發吧。'] },
  ],
  // 開場突襲：cells＝史萊姆冒出來的格子 [欄, 列]（路障北邊；那格是牆或被佔住就找旁邊最近的空格）、
  // delay＝冒出來幾秒後艾德林才提醒（讓玩家先看到牠們衝過來）
  opening: { monster: 'slime', cells: [[14, 43], [17, 43], [20, 43]], delay: 1.2 },
  hints: {
    intro: [
      '出發前先準備一下。',
      '營地這邊有物資箱和裝備箱，走到箱子前面就能打開。',
    ],
    wave: [
      '小心！上方有史萊姆襲擊！',
      'WASD 移動，滑鼠瞄準，按住左鍵開槍，把牠們打掉！',
    ],
    supply: [
      '這是物資箱，裡面有醫療包、急救包和杏仁水。',
      '我身上的急救包、杏仁水用完了，會自己回來這裡拿。你也可以按打開，把東西拿出來或放進去。',
    ],
    armor: [
      '這是裝備箱，裡面放了一頂防護頭盔。',
      '把頭盔穿上，被打到會比較不痛。',
    ],
    refill: [
      '這是彈藥箱。照明彈用完了，走過來就能補。',
    ],
    hp: [
      '隊長，你受傷了！先用醫療包包紮一下。',
    ],
    almond: [
      '疏導會用掉 SP。SP 太低會頭暈，還會聽到奇怪的聲音。',
      '喝杏仁水可以把 SP 補回來。',
    ],
    dark: [
      '前面太暗了，我們在黑暗裡看不到怪物，也沒辦法過去巡邏。',
      '先用照明彈把那一帶照亮。',
    ],
    light: [
      '照明彈過一陣子就會熄掉。',
      '在亮的地方蓋一盞探照燈，那裡就會一直亮著。',
    ],
    enemy: [
      '有異質體！叫一個隊員過去守著。',
    ],
    taint: [
      '{name}的汙染升高了！哨兵的汙染太高會暴走而失去理智，會不分敵我攻擊的！',
      '快去幫他疏導。疏導會用掉 SP。',
    ],
    aid: [
      '{name}受傷了！',
      '你身上有急救包，走過去幫他包紮。',
    ],
    core: [
      '那個就是異質核心，異質體都是從它那裡跑出來的。',
      '把它打破，這一區就能控制住。小心，攻擊會讓它醒過來，召喚出更多異質體。',
    ],
    exit: [
      '這裡通往 Y25 區，希奧妮求救的訊號就是從這裡發出來的。',
    ],
    key: [   // 打破核心、拿到異質鑰匙（關掉鑰匙的說明視窗後馬上說；跳過教學也會說）
      '拿到異質鑰匙了，趕快前往Y25區地下街吧！',
    ],
  },
  // 動畫卡片上的字（{key}＝快捷鍵、{name}＝隊員名字；可以用 <small> 寫小字）
  cards: {
    medkit: '按 <b>{key}</b> 用醫療包包紮<br><small>要站著不動 2 秒</small>',
    almond: '按 <b>{key}</b> 喝杏仁水，把 SP 補回來',
    flareSwitch: '轉<b>滑鼠滾輪</b>，換成照明彈',
    flareShoot: '朝發光的暗處點<b>左鍵</b>，射出照明彈',
    build: '把<b>探照燈</b>從建築欄拖到發光的格子<br><small>也可以先點探照燈、再點地圖</small>',
    grabBuild: '<b>按住右鍵</b>可以把自己蓋的建築抓起來，拖到別的地方放下<br><small>地雷不能抓；拖太遠或太暗的地方會回到原位</small>',
    patrolMenu: '在{name}身上點<b>右鍵</b>，打開指令選單',
    patrolPick: '選「🎯 指派位置巡邏」',
    patrolCell: '點<b>左鍵</b>指定{name}巡邏的位置<br><small>發光的格子；其他亮的地方也可以</small>',
    grabMate: '也可以<b>按住右鍵</b>把隊員抓起來，拖到想要的地方放下，他就會在那裡巡邏',
    walkTo: '走到{name}旁邊',
    soothe: '按 <b>C</b> 幫{name}疏導<br><small>要站著 3 秒，會用掉 SP</small>',
    aid: '按 <b>F</b> 用急救包幫{name}補血',
    treating: '{label}……<br><small>完成之前時間會停著</small>',
    ack: '按 <kbd>Space</kbd> 知道了',
  },
};

let tutorialAskOpen = false, tutorialAskEl = null, tutorialDarkT = 0;
const tutorialState = (() => { try { return JSON.parse(localStorage.getItem(TUTORIAL_KEY) || 'null'); } catch (_) { return null; } })() || { decided: false, skip: false, seen: [] };
if (!tutorialState.boxes) tutorialState.boxes = {};   // 打開過的箱子（舊存檔沒有這欄）
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

// 新手區開場：背包先放醫療包、杏仁水、急救包（只給一次；updateTutorial 呼叫，開新遊戲才會再給）
function tutorialStartBag() {
  if (tutorialState.bagGiven || typeof supplyGain !== 'function') return;
  for (const [id, n] of Object.entries(NEWBIE_START.bag || {})) supplyGain(id, n, true);
  tutorialState.bagGiven = true; tutorialSave();
}

// ---- 開場劇情：遠處爆炸、畫面搖晃、希奧妮的無線電（TUTORIAL.story）----
// 演的時候遊戲暫停（tutorialPaused）；對話框開著就等玩家看完，再往下一步
let tutStory = null;   // { i：演到第幾步, t：這一步等了幾秒, shakeT：還要搖幾秒, power }
function tutSpeak(who, lines, radio) {
  if (typeof openTextDialogue !== 'function') return;
  const winter = who === 'winter', set = winter ? (typeof playerSprites !== 'undefined' && playerSprites) : (typeof sentrySprites !== 'undefined' && sentrySprites[who]);
  const face = set && set.front && set.front[0];
  const name = winter ? ((typeof CHARACTERS !== 'undefined' && CHARACTERS.winter && CHARACTERS.winter.name) || '溫特') : ((TYPES[who] || {}).name || who);
  openTextDialogue({ name: name + (radio ? '（無線電）' : ''), image: face ? face.src : '', lines, kind: who });
}
// 爆炸震下來的碎石和粉塵：畫在遊戲畫面上面的一張透明畫布（畫面座標，暫停中也照樣掉）
// 碎石：從天花板（z 高度）掉到地上的某一點，地上有影子跟著變大；落地彈一下、揚起一點灰，躺一下再淡掉
// 粉塵：一團一團從上面慢慢飄下來，左右晃、慢慢變淡
let tutDebris = null;   // { el, ctx, parts, spawnT, rocks, dust, acc }
function tutDebrisStart(sec, rocks, dust) {
  if (!tutDebris) {
    const el = document.createElement('canvas'); el.id = 'tutDebris'; el.setAttribute('aria-hidden', 'true');
    document.body.appendChild(el);
    tutDebris = { el, ctx: el.getContext('2d'), parts: [], spawnT: 0, rocks: 0, dust: 0, acc: { rock: 0, dust: 0 } };
  }
  Object.assign(tutDebris, { spawnT: sec, spawn0: sec, rocks, dust });
}
function tutDebrisFrame(dt) {
  const D = tutDebris; if (!D) return;
  const r = cv.getBoundingClientRect(), W = Math.round(r.width), H = Math.round(r.height), dpr = devicePixelRatio || 1;
  Object.assign(D.el.style, { left: r.left + 'px', top: r.top + 'px', width: W + 'px', height: H + 'px' });
  if (D.el.width !== Math.round(W * dpr) || D.el.height !== Math.round(H * dpr)) { D.el.width = Math.round(W * dpr); D.el.height = Math.round(H * dpr); }
  const rnd = (a, b) => a + Math.random() * (b - a), P = D.parts;
  if (D.spawnT > 0) {   // 剛炸的時候掉最多，越後面越少
    const k = Math.max(0, D.spawnT / D.spawn0); D.spawnT -= dt;
    D.acc.rock += D.rocks * (.35 + k) * dt; D.acc.dust += D.dust * (.4 + k * .8) * dt;
    for (; D.acc.rock >= 1; D.acc.rock--) {
      const big = Math.random() < .18;
      P.push({ kind: 'rock', x: rnd(W * .04, W * .96), y: rnd(H * .1, H * .95), z: rnd(H * .35, H * .8), vz: rnd(0, 60), vx: rnd(-12, 12),
        s: big ? rnd(6, 10) : rnd(2.5, 5), rot: rnd(0, 6.3), spin: rnd(-6, 6), shade: Math.floor(rnd(70, 125)), bounced: 0, rest: 0, sides: Math.floor(rnd(4, 7)) });
    }
    for (; D.acc.dust >= 1; D.acc.dust--)
      P.push({ kind: 'dust', x: rnd(-W * .02, W * 1.02), y: rnd(-H * .15, H * .35), vx: rnd(-14, 14), vy: rnd(18, 55), r: rnd(10, 30), a: rnd(.1, .22), life: rnd(1.8, 3.2), t: 0, ph: rnd(0, 6.3) });
  }
  for (const p of P) {
    if (p.kind === 'dust') { p.t += dt; p.x += (p.vx + Math.sin(p.t * 2 + p.ph) * 10) * dt; p.y += p.vy * dt; p.r += 6 * dt; continue; }
    if (p.z > 0 || p.vz < 0) {
      p.vz += 900 * dt; p.z -= p.vz * dt; p.x += p.vx * dt; p.rot += p.spin * dt;
      if (p.z <= 0) {
        p.z = 0;
        if (p.bounced < 1 && p.vz > 160) { p.vz = -p.vz * .22; p.bounced++; p.vx *= .5; p.spin *= .5;   // 彈一下，揚起一小團灰
          P.push({ kind: 'dust', x: p.x, y: p.y, vx: rnd(-10, 10), vy: rnd(-8, 4), r: p.s * 2.2, a: .16, life: rnd(.6, 1), t: 0, ph: 0 }); }
        else { p.vz = 0; p.spin = 0; }
      }
    } else p.rest += dt;
  }
  D.parts = P.filter(p => p.kind === 'dust' ? p.t < p.life : p.rest < 1.6);
  const c = D.ctx; c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H);
  for (const p of D.parts) {
    if (p.kind !== 'dust') continue;
    const fade = Math.min(1, p.t / .25) * (1 - p.t / p.life), g = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
    g.addColorStop(0, 'rgba(176,160,136,' + (p.a * fade).toFixed(3) + ')'); g.addColorStop(1, 'rgba(176,160,136,0)');
    c.fillStyle = g; c.beginPath(); c.arc(p.x, p.y, p.r, 0, Math.PI * 2); c.fill();
  }
  for (const p of D.parts) {
    if (p.kind !== 'rock') continue;
    const fade = Math.max(0, 1 - Math.max(0, p.rest - 1) / .6), near = Math.max(0, 1 - p.z / (H * .8));
    c.globalAlpha = fade * (.2 + near * .35); c.fillStyle = '#000';   // 影子：越接近地面越清楚
    c.beginPath(); c.ellipse(p.x, p.y + p.s * .5, p.s * (.6 + near * .6), p.s * (.25 + near * .25), 0, 0, Math.PI * 2); c.fill();
    c.globalAlpha = fade; c.save(); c.translate(p.x, p.y - p.z); c.rotate(p.rot);
    const v = p.shade; c.fillStyle = 'rgb(' + v + ',' + (v - 6) + ',' + (v - 16) + ')'; c.strokeStyle = 'rgba(20,16,12,.7)'; c.lineWidth = 1;
    c.beginPath();
    for (let i = 0; i < p.sides; i++) { const a = i / p.sides * Math.PI * 2, rr = p.s * (.75 + ((i * 37 + v) % 10) / 30); c[i ? 'lineTo' : 'moveTo'](Math.cos(a) * rr, Math.sin(a) * rr); }
    c.closePath(); c.fill(); c.stroke(); c.restore();
  }
  c.globalAlpha = 1;
  if (!D.parts.length && D.spawnT <= 0) { D.el.remove(); tutDebris = null; }
}
function tutStoryFrame(dt) {
  tutDebrisFrame(dt);
  const S = tutStory; if (!S) return;
  if (S.shakeT > 0) { S.shakeT -= dt; if (typeof addShake === 'function') addShake(S.power * Math.min(1, S.shakeT / .6 + .25)); }   // 搖到最後慢慢變小
  if (dialogueState) return;
  const steps = TUTORIAL.story || [];
  while (S.i < steps.length) {
    const st = steps[S.i];
    if (!S.started) {   // 這一步剛開始：放音效、開始搖、開對話框
      S.started = true; S.t = 0;
      if (st.sfx) SFX.play(st.sfx, st.volume ?? 1);
      if (st.shake) { S.shakeT = st.shake; S.power = st.power || 8; }
      if (st.debris) tutDebrisStart(st.debris, st.rocks ?? 28, st.dust ?? 22);
      if (st.lines && st.lines.length) { tutSpeak(st.who || TUTORIAL.speaker, st.lines, st.radio); return; }
    }
    S.t += dt;
    if (S.t < (st.wait || 0)) return;
    S.i++; S.started = false; dt = 0;
  }
  if (S.shakeT > 0 || (tutDebris && tutDebris.parts.length)) return;   // 等搖完、碎石掉完
  tutStory = null;
  tutorialState.seen.push('story'); tutorialSave();
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

// ---- 開場突襲：3 隻史萊姆＋操作提示動畫 ----
let tutorialControlsEl = null;
function ensureTutorialControlsEl() {
  if (tutorialControlsEl) return tutorialControlsEl;
  tutorialControlsEl = document.createElement('div');
  tutorialControlsEl.id = 'tutorialControls'; tutorialControlsEl.className = 'hidden';
  tutorialControlsEl.setAttribute('aria-hidden', 'true');
  tutorialControlsEl.innerHTML =
    '<div class="tc-group"><div class="tc-keys"><kbd data-k="w">W</kbd><kbd data-k="a">A</kbd><kbd data-k="s">S</kbd><kbd data-k="d">D</kbd></div><span>移動</span></div>' +
    '<div class="tc-group"><div class="tc-mouse"><i class="tc-btn"></i><i class="tc-wheel"></i><b class="tc-ripple"></b></div><span>瞄準・按住<b>左鍵</b>開槍</span></div>';
  (document.getElementById('wrap') || document.body).appendChild(tutorialControlsEl);
  return tutorialControlsEl;
}
function showTutorialControls(on) {
  if (!on && !tutorialControlsEl) return;
  const el = ensureTutorialControlsEl();
  if (on === !el.classList.contains('hidden')) return;
  el.classList.toggle('hidden', !on);
}
// 按下去的鍵、滑鼠左鍵跟著亮（WASD 和方向鍵都算）
function lightTutorialControls() {
  if (!tutorialControlsEl || tutorialControlsEl.classList.contains('hidden')) return;
  const arrow = { w: 'arrowup', a: 'arrowleft', s: 'arrowdown', d: 'arrowright' };
  tutorialControlsEl.querySelectorAll('kbd[data-k]').forEach(k => k.classList.toggle('on', !!(keys[k.dataset.k] || keys[arrow[k.dataset.k]])));
  tutorialControlsEl.querySelector('.tc-mouse').classList.toggle('on', !!aimHeld);
}
// 史萊姆冒出來的格子：指定的格子不能站就找旁邊最近的空格
function tutorialWaveSpot(c, r) {
  for (let d = 0; d <= 3; d++) for (let dc = -d; dc <= d; dc++) for (let dr = -d; dr <= d; dr++) {
    if (Math.max(Math.abs(dc), Math.abs(dr)) !== d) continue;
    const cc = c + dc, rr = r + dr;
    if (!inGrid(cc, rr) || isWall(cc, rr) || G.grid[cc + ',' + rr]) continue;
    const [x, y] = center(cc, rr);
    if (!G.enemies.some(e => Math.hypot(e.x - x, e.y - y) < CELL * .8)) return [x, y];
  }
  return null;
}
function spawnTutorialWave() {
  const O = TUTORIAL.opening, spec = ACTIVE_MONSTERS.find(m => m.id === O.monster) || ACTIVE_MONSTERS.find(m => m.id === 'slime');
  const wave = { enemies: [], t: 0, said: false, done: false };
  if (spec) for (const [c, r] of O.cells) {
    const spot = tutorialWaveSpot(c, r); if (!spot) continue;
    const e = createMonster(spec, spot[0], spot[1]);
    G.enemies.push(e); wave.enemies.push(e);
  }
  if (!wave.enemies.length) wave.done = true;
  G.tutorialWave = wave;
}
// 開場突襲還沒打完：回傳 true（這段期間不跳其他提示）
function tutorialWaveStep(dt) {
  if (!G.tutorialWave) spawnTutorialWave();
  const w = G.tutorialWave;
  if (w.done) { showTutorialControls(false); return false; }
  w.t += dt;
  if (!w.enemies.some(e => e.hp > 0 && G.enemies.includes(e))) {
    w.done = true; showTutorialControls(false);
    if (!tutorialState.skip && !tutorialSeen('controls')) { tutorialState.seen.push('controls'); tutorialSave(); }
    return false;
  }
  if (tutorialState.skip) return true;
  if (!w.said && w.t >= TUTORIAL.opening.delay && !dialogueState) { tutorialSay('wave'); w.said = true; }
  showTutorialControls(w.said && !tutorialSeen('controls'));
  lightTutorialControls();
  return true;
}
// 開場突襲的史萊姆還沒打完：核心先不召喚（js/anomalous-core.js 的 updateCores）
const tutorialHoldsSpawns = () => isNewbieMap() && !(G && G.tutorialWave && G.tutorialWave.done);

// ==================== 動畫教學：暫停＋畫面變暗＋目標發光＋操作動畫 ====================
// 一段教學（lesson）＝幾個步驟（step），一步做完才換下一步，最後一步做完就恢復遊戲。步驟的欄位：
//   spots(L)：要發光的東西（畫面座標的方框陣列；round＝圓的）  anchor：卡片貼在第幾個發光的東西旁邊（預設第 0 個）
//   demo／text：卡片上的動畫和字  ack：按 Space「知道了」就算做完（不用照做）
//   allow(e, L)：這個輸入能不能用（true＝可以、'done'＝可以而且這一步做完了、false＝擋掉）
//   done(L)：每幀檢查，true＝這一步做完了  back(L)：回傳步驟編號＝退回那一步（例如選單被關掉了）
//   skip(L)：true＝跳過這一步  enter(L)：開始這一步時做的事  tick(dt, L)：暫停中每幀要做的事
let tutLesson = null;   // 正在進行的教學：{ id, steps, i, step, data, onEnd }
let tutGuide = null;    // 帶玩家走過去（不暫停）：{ kind: 'soothe'／'aid', t }
let tutQueued = null;   // 艾德林說完話才開始的教學
let tutBuildPending = 0;   // 照明彈教完的時間（照亮之後教放探照燈）
const tutorialPaused = () => !!tutLesson || (!!tutStory && !dialogueState);
const tutLessonSeen = id => tutorialSeen('L:' + id);
const tutCard = (id, vars = {}) => (TUTORIAL.cards[id] || '').replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
const tutMateName = t => (TYPES[t.type] || {}).name || '隊員';
const tutMateFace = t => { const set = typeof sentrySprites !== 'undefined' && sentrySprites[t.type]; return set && set.front && set.front[0] ? set.front[0].src : ''; };

// 世界座標 → 畫面座標
function tutW2C(x, y) {
  const r = cv.getBoundingClientRect();
  return { x: r.left + (x - cam.x) * VIEW_SCALE * r.width / cv.width, y: r.top + (y - cam.y) * VIEW_SCALE * r.height / cv.height };
}
function tutWorldRect(x0, y0, x1, y1, round) { const a = tutW2C(x0, y0), b = tutW2C(x1, y1); return { x: a.x, y: a.y, w: b.x - a.x, h: b.y - a.y, round }; }
const tutCellRect = (c, r, w = 1, h = 1) => tutWorldRect(OX + c * CELL, OY + r * CELL, OX + (c + w) * CELL, OY + (r + h) * CELL);
const tutMateRect = t => tutWorldRect(t.x - 26, t.y - 50, t.x + 26, t.y + 20);
function tutElRect(el) { if (!el) return null; const r = el.getBoundingClientRect(); return r.width && r.height ? { x: r.left, y: r.top, w: r.width, h: r.height } : null; }
const tutIn = (e, el) => !!(el && e.target instanceof Node && el.contains(e.target));
const tutKey = (e, k) => e.type === 'keydown' && !e.repeat && e.key.toLowerCase() === k;
const tutOnCanvas = (e, type, button) => e.target === cv && e.type === type && (button == null || e.button === button);

// 卡片上的操作動畫
const tutKeyDemo = k => '<div class="td-keys"><kbd class="td-key">' + k + '</kbd></div>';
const tutMouseDemo = kind => '<div class="td-mouse td-' + kind + '"><i class="td-l"></i><i class="td-r"></i><i class="td-w"></i></div>' + (kind === 'wheel' ? '<span class="td-wheel-arrows">▲<br>▼</span>' : '');
const tutDragDemo = (img, button) => '<div class="td-drag td-' + button + '"><span class="td-track"></span><span class="td-mover">' + (img ? '<img src="' + img + '" alt="">' : '') +
  '<span class="td-mouse td-mini td-' + button + '-hold"><i class="td-l"></i><i class="td-r"></i><i class="td-w"></i></span></span></div>';

function startTutorialLesson(id, steps, data = {}, onEnd = null) {
  tutLesson = { id, steps, i: -1, step: null, data, onEnd };
  aimHeld = false; if (typeof keys !== 'undefined') Object.keys(keys).forEach(k => { keys[k] = false; });
  if (typeof closeGroundMenu === 'function') closeGroundMenu();
  if (typeof closeSentryMenu === 'function') closeSentryMenu();
  if (typeof assigning !== 'undefined') assigning = null;
  if (G.selType && (G.selType.startsWith('build:') || G.selType === 'demolish') && typeof closeBuildMenu === 'function') closeBuildMenu();
  sfx('menu');
  tutNextStep();
}
function tutNextStep() {
  const L = tutLesson; if (!L) return;
  do L.i++; while (L.i < L.steps.length && L.steps[L.i].skip && L.steps[L.i].skip(L));
  if (L.i >= L.steps.length) { finishTutorialLesson(); return; }
  L.step = L.steps[L.i]; L.t = 0;
  if (L.step.enter) L.step.enter(L);
  renderTutCard(L);
}
function tutGoStep(L, i) { L.i = i - 1; tutNextStep(); }
function finishTutorialLesson() {
  const L = tutLesson; if (!L) return;
  tutLesson = null; hideTutFocus();
  if (!tutLessonSeen(L.id)) { tutorialState.seen.push('L:' + L.id); tutorialSave(); }
  if (L.onEnd) L.onEnd(L);
}
function abortTutorialLesson() { tutLesson = null; hideTutFocus(); }   // 沒教完（換地圖、死掉）：下次再教

// 教學進行中：只放行這一步要的操作，其他按鍵、點擊都擋掉（捕獲階段，比遊戲本身的處理先跑）
for (const type of ['keydown', 'mousedown', 'click', 'dblclick', 'contextmenu', 'wheel', 'dragstart']) {
  window.addEventListener(type, e => {
    if (tutStory && !dialogueState) { e.preventDefault(); e.stopImmediatePropagation(); return; }   // 開場劇情演出中（還沒跳對話框）：什麼都不能按
    const L = tutLesson, s = L && L.step; if (!s) return;
    if (type === 'keydown' && s.ack && (e.code === 'Space' || e.key === 'Enter')) {
      e.preventDefault(); e.stopImmediatePropagation();
      if (!e.repeat) { sfx('button'); tutNextStep(); }
      return;
    }
    const ok = s.allow ? s.allow(e, L) : false;
    if (ok === 'done') { tutNextStep(); return; }   // 做完了：教學先結束（恢復遊戲），這個輸入再照常交給遊戲處理
    if (ok) return;
    e.preventDefault(); e.stopImmediatePropagation();
  }, { capture: true, passive: false });
}

// ---- 畫面：變暗的遮罩（挖洞讓目標露出來）、發光框、卡片 ----
let tutFocusEl = null;
function ensureTutFocusEl() {
  if (tutFocusEl) return tutFocusEl;
  tutFocusEl = document.createElement('div');
  tutFocusEl.id = 'tutFocus'; tutFocusEl.className = 'hidden'; tutFocusEl.setAttribute('aria-live', 'polite');
  tutFocusEl.innerHTML = '<svg class="tf-dim" aria-hidden="true"><path class="tf-shade" fill-rule="evenodd"></path></svg><div class="tf-rings"></div><div class="tf-card"></div>';
  document.body.appendChild(tutFocusEl);
  return tutFocusEl;
}
function hideTutFocus() { if (tutFocusEl) tutFocusEl.classList.add('hidden'); }
function renderTutCard(L) {
  const el = ensureTutFocusEl(), s = L.step;
  el.classList.remove('hidden');
  const card = el.querySelector('.tf-card');
  card.innerHTML = (s.demo ? '<div class="tf-demo">' + s.demo + '</div>' : '') + '<p>' + (s.text || '') + '</p>' + (s.ack ? '<span class="tf-ack">' + tutCard('ack') + '</span>' : '');
  card.style.animation = 'none'; void card.offsetWidth; card.style.animation = '';   // 換步驟：卡片重新彈出來
}
function drawTutFocus() {
  const L = tutLesson; if (!L || !L.step || !tutFocusEl) return;
  const pad = 8, spots = (L.step.spots ? L.step.spots(L) : []).filter(Boolean);
  // 整個畫面一個大方框，發光的東西是挖掉的圓角方框（evenodd：重疊的地方變成洞）
  const hole = r => { const x = r.x - pad, y = r.y - pad, w = r.w + pad * 2, h = r.h + pad * 2, k = Math.min(r.round ? Math.max(w, h) / 2 : 12, w / 2, h / 2);
    return 'M' + (x + k) + ' ' + y + 'H' + (x + w - k) + 'A' + k + ' ' + k + ' 0 0 1 ' + (x + w) + ' ' + (y + k) + 'V' + (y + h - k) + 'A' + k + ' ' + k + ' 0 0 1 ' + (x + w - k) + ' ' + (y + h) +
      'H' + (x + k) + 'A' + k + ' ' + k + ' 0 0 1 ' + x + ' ' + (y + h - k) + 'V' + (y + k) + 'A' + k + ' ' + k + ' 0 0 1 ' + (x + k) + ' ' + y + 'Z'; };
  tutFocusEl.querySelector('.tf-shade').setAttribute('d', 'M0 0H' + innerWidth + 'V' + innerHeight + 'H0Z' + spots.map(hole).join(''));
  const rings = tutFocusEl.querySelector('.tf-rings');
  while (rings.children.length < spots.length) rings.appendChild(document.createElement('i'));
  [...rings.children].forEach((ring, k) => {
    const r = spots[k]; ring.style.display = r ? '' : 'none'; if (!r) return;
    ring.className = 'tf-ring' + (r.round ? ' round' : '');
    Object.assign(ring.style, { left: (r.x - pad) + 'px', top: (r.y - pad) + 'px', width: (r.w + pad * 2) + 'px', height: (r.h + pad * 2) + 'px' });
  });
  // 卡片：貼在發光的東西上面或下面（在畫面下半部就放上面）；沒有發光的東西就放在畫面上方中間
  const card = tutFocusEl.querySelector('.tf-card'), a = spots[L.step.anchor || 0] || spots[0];
  const cw = card.offsetWidth, ch = card.offsetHeight, W = innerWidth, H = innerHeight;
  let x = W / 2 - cw / 2, y = H * .2;
  if (a) {
    x = a.x + a.w / 2 - cw / 2;
    y = a.y + a.h / 2 > H / 2 ? a.y - pad - 16 - ch : a.y + a.h + pad + 16;
  }
  card.style.left = Math.round(Math.max(12, Math.min(W - cw - 12, x))) + 'px';
  card.style.top = Math.round(Math.max(12, Math.min(H - ch - 12, y))) + 'px';
}

// ---- 不暫停的提示：箱子上的 Space 鍵、帶玩家走去隊員旁邊的箭頭 ----
let tutMarksEl = null;
function ensureTutMarksEl() {
  if (tutMarksEl) return tutMarksEl;
  tutMarksEl = document.createElement('div');
  tutMarksEl.id = 'tutMarks'; tutMarksEl.setAttribute('aria-hidden', 'true');
  tutMarksEl.innerHTML = '<div class="tm-bubbles"></div><i class="tm-ring hidden"></i><div class="tm-arrow hidden"><i>➤</i></div><div class="tm-banner hidden"></div>';
  document.body.appendChild(tutMarksEl);
  return tutMarksEl;
}
const TUT_BOX_KINDS = ['supply', 'armor', 'refill'];
function tutBoxDone(kind) {
  if (kind === 'armor') return typeof equipState !== 'undefined' && (NEWBIE_START.gear || []).every(id => Object.values(equipState.equipped).includes(id));   // 頭盔穿上了
  return !!tutorialState.boxes[kind];
}
// 按 Space 打開箱子：記下來（物資箱另外看 campSupplyOpen）
window.addEventListener('keydown', e => {
  if (e.code !== 'Space' || e.repeat || tutLesson || !isNewbieMap() || typeof mapBoxNearPlayer !== 'function' || !G || !G.player) return;
  for (const kind of ['supply', 'refill']) if (!tutorialState.boxes[kind] && mapBoxNearPlayer(kind)) { tutorialState.boxes[kind] = true; tutorialSave(); }
}, true);
function drawTutMarks(show) {
  const el = ensureTutMarksEl();
  el.classList.toggle('hidden', !show);
  if (!show) return;
  const p = G.player;
  // 箱子：還沒打開過就浮一顆 Space 鍵（站在能打開的距離內會變大、變亮）
  const bubbles = el.querySelector('.tm-bubbles'), list = [];
  if (typeof mapBoxes === 'function' && G.tutorialWave && G.tutorialWave.done) for (const b of mapBoxes()) {
    if (!TUT_BOX_KINDS.includes(b.kind) || tutBoxDone(b.kind)) continue;
    const cx = (b.left + b.right) / 2, d = Math.hypot(Math.max(b.left - p.x, 0, p.x - b.right), Math.max(b.top - p.y, 0, p.y - b.bottom));
    if (d > tutorialCells(TUTORIAL.boxCells)) continue;
    list.push({ at: tutW2C(cx, b.top - 4), near: d <= MAP_BOX.reach + 10 });
  }
  while (bubbles.children.length < list.length) { const b = document.createElement('div'); b.className = 'tm-bubble'; b.innerHTML = '<kbd>Space</kbd>'; bubbles.appendChild(b); }
  [...bubbles.children].forEach((b, k) => {
    const m = list[k]; b.style.display = m ? '' : 'none'; if (!m) return;
    b.classList.toggle('near', m.near); b.style.left = Math.round(m.at.x) + 'px'; b.style.top = Math.round(m.at.y) + 'px';
  });
  // 帶路：隊員身上一圈光、頭上一個箭頭（在畫面外就貼著畫面邊緣指過去）、下方一行字
  const ring = el.querySelector('.tm-ring'), arrow = el.querySelector('.tm-arrow'), banner = el.querySelector('.tm-banner'), g = tutGuide;
  ring.classList.toggle('hidden', !g); arrow.classList.toggle('hidden', !g); banner.classList.toggle('hidden', !g);
  if (!g) return;
  const t = g.t, at = tutW2C(t.x, t.y - 14), head = tutW2C(t.x, t.y - 62), r = cv.getBoundingClientRect(), m = 40;
  ring.style.left = Math.round(at.x) + 'px'; ring.style.top = Math.round(at.y) + 'px';
  const inside = head.x > r.left + m && head.x < r.right - m && head.y > r.top + m && head.y < r.bottom - m;
  let ax = head.x, ay = head.y, ang = 90;
  if (!inside) {
    const cx = (r.left + r.right) / 2, cy = (r.top + r.bottom) / 2, dx = at.x - cx, dy = at.y - cy;
    const k = Math.min((r.width / 2 - m) / Math.abs(dx || 1e-6), (r.height / 2 - m) / Math.abs(dy || 1e-6));
    ax = cx + dx * k; ay = cy + dy * k; ang = Math.atan2(dy, dx) * 180 / Math.PI;
  }
  arrow.style.left = Math.round(ax) + 'px'; arrow.style.top = Math.round(ay) + 'px'; arrow.style.transform = 'rotate(' + ang.toFixed(1) + 'deg)';
  const text = tutCard('walkTo', { name: tutMateName(t) });
  if (banner.innerHTML !== text) banner.innerHTML = text;
  banner.style.left = Math.round((r.left + r.right) / 2) + 'px'; banner.style.top = Math.round(r.bottom - 74) + 'px';   // 貼著遊戲畫面下緣（建築欄上面）
}

// ---- 每幀（js/game.js 的 frame 呼叫，暫停中也會跑）：檢查教學步驟、畫遮罩和提示 ----
function tutorialFrame(dt) {
  const ok = typeof isNewbieMap === 'function' && isNewbieMap() && G && G.running && !G.over && G.player && G.player.hp > 0;
  if (tutLesson && !ok) abortTutorialLesson();
  if (!ok) { tutGuide = null; tutQueued = null; }
  if (ok && !tutStory && !tutorialSeen('story') && !(typeof mapTransitioning !== 'undefined' && mapTransitioning)) tutStory = { i: 0, t: 0, started: false, shakeT: 0, power: 0 };   // 第一次進新手區：先演開場劇情
  if (!ok) tutStory = null;
  tutStoryFrame(dt);
  const L = tutLesson;
  if (L && L.step) {
    L.t += dt;
    if (L.step.tick) L.step.tick(dt, L);
    const back = L.step.back ? L.step.back(L) : null;
    if (back != null) tutGoStep(L, back);
    else if (L.step.done && L.step.done(L)) tutNextStep();
  }
  drawTutFocus();
  if (ok && typeof campSupplyOpen !== 'undefined' && campSupplyOpen && !tutorialState.boxes.supply) { tutorialState.boxes.supply = true; tutorialSave(); }
  drawTutMarks(ok && !tutLesson && !dialogueState && tutorialState.decided && !tutorialState.skip);
}

// ---- 各段教學 ----
// 包紮、急救：按下去之後還是暫停著，只讓進度條跑（js/channel-actions.js 的 updateChannel），跑完才恢復遊戲
// 這段期間什麼都不能按（不然按移動鍵會中斷）；按了卻沒開始（例如 HP 剛好是滿的）就退回上一步
function tutTreatStep(spots, back) {
  return { enter: L => { L.data.treated = false; }, spots, text: '',
    allow: (e, L) => e.type === 'click' && !L.data.treated,   // 上一步是點快捷格：放開滑鼠的 click 才會真的用醫療包
    tick: (dt, L) => {
      if (typeof playerChannel === 'undefined' || !playerChannel) return;
      L.data.treated = true;
      const label = String(playerChannel.label || '治療中').replace(/中$/, '');
      const text = tutCard('treating', { label: label + '中' });
      if (L.step.text !== text) { L.step.text = text; renderTutCard(L); }
      updateChannel(dt);
    },
    done: L => L.data.treated && !playerChannel,
    back: L => !L.data.treated && L.t > .25 ? back : null };
}
// 補血／杏仁水：快捷欄那一格發光，按那個數字鍵（或點那一格）
function tutQuickSlotFor(use) {
  if (typeof QUICK_KEYS === 'undefined') return null;
  for (const k of QUICK_KEYS) { const it = quickItem(quickSlots[k]); if (it && it.use === use && (supplyInventory.get(it.id) || 0) > 0) return k; }
  return null;
}
const tutQuickEl = k => document.querySelector('#quickSupplies [data-qs-slot="' + k + '"]');
function startSupplyLesson(id, use) {
  const k = tutQuickSlotFor(use); if (!k) return false;
  const treat = use === 'hp';   // 醫療包要包紮 2 秒：包紮完才恢復遊戲（杏仁水是馬上喝）
  const steps = [{
    spots: () => [tutElRect(tutQuickEl(k))],
    demo: tutKeyDemo(k), text: tutCard(id, { key: k }),
    allow: e => tutKey(e, k) || ((e.type === 'mousedown' || e.type === 'click') && e.button === 0 && tutIn(e, tutQuickEl(k))) ? 'done' : false,
  }];
  if (treat) steps.push(tutTreatStep(() => [tutMateRect(G.player)], 0));
  startTutorialLesson(id, steps);
  return true;
}

// 照明彈：滾輪換成照明彈 → 朝暗處點左鍵
function tutDarkSpot() {
  const p = G.player, [pc, pr] = cellAt(p.x, p.y);
  let best = null, bd = Infinity;
  for (let dc = -8; dc <= 8; dc++) for (let dr = -8; dr <= 8; dr++) {
    const c = pc + dc, r = pr + dr; if (!inGrid(c, r) || isWall(c, r)) continue;
    const [x, y] = center(c, r), d = Math.hypot(x - p.x, y - p.y);
    if (d < CELL * 3 || d >= bd || isLit(x, y) || !hasLineOfSight(p.x, p.y, x, y)) continue;
    best = { x, y }; bd = d;
  }
  return best;
}
const tutHoldsFlare = () => playerWeapon(G.player).id === 'flare';
function startFlareLesson() {
  const spot = tutDarkSpot();
  startTutorialLesson('flare', [
    { skip: tutHoldsFlare, spots: () => [tutElRect(document.getElementById('ammoHud'))], demo: tutMouseDemo('wheel'), text: tutCard('flareSwitch'),
      allow: e => tutOnCanvas(e, 'wheel'), done: tutHoldsFlare },
    { spots: () => spot ? [tutWorldRect(spot.x - CELL, spot.y - CELL, spot.x + CELL, spot.y + CELL, true)] : [], demo: tutMouseDemo('left'), text: tutCard('flareShoot'),
      allow: e => tutOnCanvas(e, 'wheel') || (tutOnCanvas(e, 'mousedown', 0) ? 'done' : false),
      back: () => tutHoldsFlare() ? null : 0 },
  ], {}, () => { G.player.atkCd = 0; tutBuildPending = performance.now(); });   // 暫停前換子彈的冷卻還沒跑完：歸零，恢復後馬上射出去
}

// 探照燈：找一格能蓋的地方（溫特蓋得到、夠亮、空的），越靠近照明彈越好
const TUT_LIGHT_ID = 'searchlight';
function tutBuildCell() {
  const ob = typeof buildableById === 'function' && buildableById(TUT_LIGHT_ID); if (!ob) return null;
  const v = ob[buildOrient], extra = placeExtra(ob), flares = G.flares || [], p = G.player, [pc, pr] = cellAt(p.x, p.y);
  let best = null, bs = Infinity;
  for (let dc = -BUILD_RANGE; dc <= BUILD_RANGE; dc++) for (let dr = -BUILD_RANGE; dr <= BUILD_RANGE; dr++) {
    const c = pc + dc, r = pr + dr;
    if (!buildInRange(v, c, r) || !footprintNearLight(v, c, r, extra) || !canPlaceObstacle(v, c, r, extra) || sameBuildingOverlaps(TUT_LIGHT_ID, v, c, r)) continue;
    const [x, y] = center(c, r);
    const score = flares.length ? Math.min(...flares.map(f => Math.hypot(f.x - x, f.y - y))) : (isLit(x, y) ? 400 : 0) + Math.hypot(x - p.x, y - p.y);
    if (score < bs) { bs = score; best = { c, r, w: v.w || 1, h: v.h || 1 }; }
  }
  return best;
}
const tutLightsBuilt = () => G.obstacles.filter(o => o.playerBuilt && o.type === TUT_LIGHT_ID);
function startBuildLesson(cell) {
  const ob = buildableById(TUT_LIGHT_ID), slot = () => document.querySelector('#buildQuickSlots [data-build-id="' + TUT_LIGHT_ID + '"]');
  const before = tutLightsBuilt().length;
  startTutorialLesson('build', [
    { spots: () => [tutElRect(slot()), tutCellRect(cell.c, cell.r, cell.w, cell.h)], anchor: 1,
      demo: tutDragDemo(ob.h.file, 'left'), text: tutCard('build'),
      allow: e => tutIn(e, slot()) || tutKey(e, 'r')
        || (e.target === cv && G.selType === 'build:' + TUT_LIGHT_ID && (e.type === 'mousedown' || e.type === 'contextmenu')),   // 選了探照燈：左鍵蓋、右鍵取消
      done: L => { const list = tutLightsBuilt(); if (list.length > before) { L.data.built = list[list.length - 1]; return true; } return false; } },
    { enter: () => { if (G.selType && G.selType.startsWith('build:') && typeof closeBuildMenu === 'function') closeBuildMenu(); },   // 蓋好了：收起建築模式（不然右鍵抓不起來）
      spots: L => { const o = L.data.built; return [tutCellRect(o.c, o.r, o.w || 1, o.h || 1)]; },
      demo: tutDragDemo(ob.h.file, 'right'), text: tutCard('grabBuild'), ack: true },
  ]);
}

// 指派巡邏：右鍵點隊員 → 選「指派位置巡邏」→ 點地圖 → 示範按住右鍵抓隊員
function tutOnScreen(x, y) { const a = tutW2C(x, y), r = cv.getBoundingClientRect(); return a.x > r.left + 30 && a.x < r.right - 30 && a.y > r.top + 60 && a.y < r.bottom - 30; }
function tutPatrolCell(t, enemy) {
  const tx = enemy ? enemy.x : G.player.x, ty = enemy ? enemy.y : G.player.y, d = Math.hypot(tx - t.x, ty - t.y) || 1;
  for (let k = 5; k >= 1; k--) {
    const [c, r] = cellAt(t.x + (tx - t.x) / d * k * CELL, t.y + (ty - t.y) / d * k * CELL);
    if (!inGrid(c, r) || isWall(c, r) || isEntrance(c, r) || G.grid[c + ',' + r] || !isLit(...center(c, r))) continue;
    if (Math.hypot(...center(c, r).map((v, i) => v - (i ? t.y : t.x))) < CELL * 1.5) continue;   // 太近：看不出有走過去
    return { c, r };
  }
  return null;
}
const tutGotoBtn = () => typeof sentryMenu !== 'undefined' && !sentryMenu.classList.contains('hidden') ? sentryMenu.querySelector('[data-act="goto"]') : null;
function startPatrolLesson(enemy) {
  const p = G.player;
  const t0 = G.towers.filter(t => t.hp > 0 && !t.berserk && tutOnScreen(t.x, t.y)).sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y))[0];
  if (!t0) return false;
  startTutorialLesson('patrol', [
    { spots: L => [tutMateRect(L.data.t)], demo: tutMouseDemo('right'), text: tutCard('patrolMenu', { name: tutMateName(t0) }),
      allow: e => tutOnCanvas(e, 'contextmenu') || tutOnCanvas(e, 'mousedown', 2),
      done: L => { if (!menuSentry) return false; L.data.t = menuSentry; return true; } },
    { spots: () => [tutElRect(tutGotoBtn())], demo: tutMouseDemo('left'), text: tutCard('patrolPick'),
      allow: e => (e.type === 'mousedown' || e.type === 'click') && tutIn(e, tutGotoBtn()),
      done: () => !!assigning, back: () => !menuSentry && !assigning ? 0 : null },
    { enter: L => { L.data.cell = tutPatrolCell(L.data.t, enemy); L.step.text = tutCard('patrolCell', { name: tutMateName(L.data.t) }); },
      spots: L => L.data.cell ? [tutCellRect(L.data.cell.c, L.data.cell.r)] : [], demo: tutMouseDemo('left'), text: '',
      allow: e => tutOnCanvas(e, 'mousedown', 0),
      done: L => !assigning && L.data.t.mode === 'goto', back: L => !assigning && L.data.t.mode !== 'goto' ? 0 : null },
    { enter: L => { L.step.demo = tutDragDemo(tutMateFace(L.data.t), 'right'); },
      spots: L => [tutMateRect(L.data.t)], demo: '', text: tutCard('grabMate'), ack: true },
  ], { t: t0 });
  return true;
}

// 疏導／急救：已經走到隊員旁邊了，按 C／F
// 按 C／F 時不交給遊戲本身（它會挑最近的隊員，旁邊剛好有別人受傷就會幫錯人）：教學自己對這位隊員疏導／急救
function startMateKeyLesson(id, key, t) {
  const act = () => id === 'soothe' ? soothe(t) : firstAidOn(t);
  const steps = [{ spots: () => [tutMateRect(t)], demo: tutKeyDemo(key.toUpperCase()), text: tutCard(id, { name: tutMateName(t) }),
    allow: e => { if (!tutKey(e, key)) return false; tutNextStep(); act(); return false; } }];
  if (id === 'aid') steps.push(tutTreatStep(() => [tutMateRect(t)], 0));   // 急救：急救完才恢復遊戲（疏導照常，按了就恢復）
  startTutorialLesson(id, steps);
}
// 帶路中：走到旁邊就開始教（頭上出現「C 疏導」「F 急救」那個距離）
function tutGuideStep() {
  const g = tutGuide; if (!g) return false;
  const t = g.t, need = g.kind === 'soothe' ? t.taint > 0 || t.berserk : aidUsableOn(t);
  if (t.hp <= 0 || !G.towers.includes(t) || !need) { tutGuide = null; return false; }
  // 要走到「這位」隊員旁邊才算（路上經過別的受傷隊員不算）：急救看 FIRST_AID.reach，疏導看對話距離（跟頭上出現 C 疏導一樣）
  const reach = g.kind === 'soothe' ? NPC_TALK.radius * (typeof equipTalkReach === 'function' ? equipTalkReach() : 1) : (typeof equipAidReach === 'function' ? equipAidReach() : FIRST_AID.reach * CELL);
  if (Math.hypot(t.x - G.player.x, t.y - G.player.y) > reach || (typeof playerChannel !== 'undefined' && playerChannel)) return false;
  tutGuide = null;
  startMateKeyLesson(g.kind, g.kind === 'soothe' ? 'c' : 'f', t);
  return true;
}

// ---- 每幀（js/game.js 的 update 呼叫）：檢查要不要跳提示 ----
function updateTutorial(dt) {
  if (!isNewbieMap() || !G || !G.running || G.over || !G.player || G.player.hp <= 0) { showTutorialControls(false); return; }
  tutorialStartBag();
  if (!tutorialSeen('story')) return;   // 開場劇情演完才問要不要看教學
  if (!tutorialState.decided) { if (!tutorialAskOpen) openTutorialAsk(); return; }
  if (!tutorialState.skip && !tutorialSeen('intro')) { if (!dialogueState) tutorialSay('intro'); return; }
  // 拿到異質鑰匙（比進這張地圖時多了一把）：艾德林催大家出發（結算畫面在這句說完後才跳）
  const keys0 = supplyInventory.get(CORE_CLEAR.keyItem) || 0; if (G.tutorialKeyBase == null) G.tutorialKeyBase = keys0;
  if (!tutorialSeen('key') && !dialogueState && !tutLesson && keys0 > G.tutorialKeyBase && tutorialSay('key')) return;
  if (tutorialWaveStep(dt) || tutorialState.skip || dialogueState || tutLesson) return;
  if (tutQueued) { const f = tutQueued; tutQueued = null; f(); if (tutLesson) return; }   // 艾德林說完了：開始動畫教學
  if (tutGuideStep()) return;
  const p = G.player, near = (x, y, cells) => Math.hypot(x - p.x, y - p.y) <= tutorialCells(cells);
  const busy = typeof playerChannel !== 'undefined' && playerChannel;   // 正在包紮、疏導、急救
  // 受傷：醫療包
  if (!tutLessonSeen('medkit') && !busy && p.hp < p.maxhp * TUTORIAL.hpAt && tutQuickSlotFor('hp')) { tutorialSay('hp'); tutQueued = () => startSupplyLesson('medkit', 'hp'); return; }
  // 疏導完、SP 變少：杏仁水
  if (!tutLessonSeen('almond') && tutLessonSeen('soothe') && !busy && G.guide < G.guideMax && tutQuickSlotFor('sp')) { tutorialSay('almond'); tutQueued = () => startSupplyLesson('almond', 'sp'); return; }
  // 營地的箱子
  if (typeof mapBoxes === 'function') {   // 箱子擠在一起時 mapBoxNearPlayer 只認最近的那個，這裡每一種各自量
    const boxNear = kind => mapBoxes().some(b => b.kind === kind && Math.hypot(Math.max(b.left - p.x, 0, p.x - b.right), Math.max(b.top - p.y, 0, p.y - b.bottom)) <= MAP_BOX.reach + 10);
    for (const kind of TUT_BOX_KINDS) if (!tutorialSeen(kind) && boxNear(kind) && tutorialSay(kind)) return;
  }
  // 第一次走進暗處（站一下才算）：照明彈
  tutorialDarkT = typeof isLit === 'function' && !isLit(p.x, p.y) ? tutorialDarkT + dt : 0;
  if (!tutLessonSeen('flare') && tutorialDarkT >= TUTORIAL.darkDelay) { tutorialSay('dark'); tutQueued = startFlareLesson; return; }
  // 照明彈射出去、亮起來之後：探照燈（照明彈沒射出去也等 5 秒就教，在營地旁邊找地方蓋）
  if (!tutLessonSeen('build') && tutLessonSeen('flare')) {
    const waited = performance.now() - tutBuildPending;
    if (!tutBuildPending || waited > 1200 && ((G.flares || []).length || waited > 5000)) {
      const ob = buildableById(TUT_LIGHT_ID), cell = ob && tutBuildCell();
      if (!ob || G.money < ob.cost) { tutorialState.seen.push('L:build'); tutorialSave(); }   // 蓋不起來：不教了
      else if (cell) { tutorialSay('light'); tutQueued = () => startBuildLesson(cell); return; }
    }
  }
  // 第一次看到怪物：指派巡邏
  const seenEnemy = !tutLessonSeen('patrol') && (G.enemies || []).find(e => e.hp > 0 && near(e.x, e.y, TUTORIAL.enemyCells) && (typeof enemyVisible !== 'function' || enemyVisible(e)));
  if (seenEnemy) { tutorialSay('enemy'); tutQueued = () => startPatrolLesson(seenEnemy); return; }
  // 隊員汙染升高：帶玩家走過去疏導
  if (!tutLessonSeen('soothe') && !tutGuide) {
    const tainted = (G.towers || []).find(t => t.hp > 0 && !t.berserk && (t.taint || 0) >= TUTORIAL.taintAt);
    if (tainted) { tutorialSay('taint', { name: tutMateName(tainted) }); tutGuide = { kind: 'soothe', t: tainted }; return; }
  }
  // 隊員受傷、HP 掉到 TUTORIAL.aidAt 以下（溫特身上有急救包）：帶玩家走過去急救
  if (!tutLessonSeen('aid') && !tutGuide && typeof aidUsableOn === 'function') {
    const hurt = (G.towers || []).find(t => t.hp > 0 && t.hp <= t.maxhp * TUTORIAL.aidAt && aidUsableOn(t));
    if (hurt) { tutorialSay('aid', { name: tutMateName(hurt) }); tutGuide = { kind: 'aid', t: hurt }; return; }
  }
  // 看到異質核心
  if (!tutorialSeen('core') && (G.cores || []).some(c => !c.dead && near(c.x, c.y, TUTORIAL.coreCells) && (typeof isLit !== 'function' || isLit(c.x, c.y) || near(c.x, c.y, TUTORIAL.coreDarkCells))) && tutorialSay('core')) return;
  // 出口
  if (!tutorialSeen('exit') && typeof mapPortals !== 'undefined' && (mapPortals || []).some(o => { const [x, y] = center(o.c, o.r); return near(x, y, TUTORIAL.exitCells); }) && tutorialSay('exit')) return;
}
