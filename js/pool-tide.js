/* ===== 池核的抽水機、漲潮、抽水閥、溺水 =====
   流程（有畫 🛟 深水區的地圖才有，例如池核）：
   ① 一開始：淺水區有水、深水區是深水（要坐救生圈才能進去）
   ② 抽水機（地圖上的發電機 dynamo）全部打開：只是通電，水還不會退。抽水機打開後就關不掉（按了沒效果）
   ③ 再去打開任何一個「抽水閥」（地圖編輯器選電源開關 → 勾「抽水閥」）→ 1.5 秒抽乾：淺水區變成地面（之後永遠沒水）、
      所有深水區（BOSS 大水池、抽水機水池、救生員台）都變成淺水，大家都能走；坐救生圈的人自動收起救生圈
   ④ 第一次抽乾後過 30 秒（firstHoldSecs）水漲回來（2 秒），深水區又變回深水；再打開抽水閥 → 抽乾，之後每 45 秒漲一次
   ・水要漲、要退之前 3 秒（POOL_TIDE.notice）：畫面中上方出現「水位即將上升……」「水位即將下降……」，開始漲／退就消失。
     所以打開抽水機、抽水閥之後，會先倒數 3 秒才開始退水（phase 'drainSoon'）
   ⑤ 水漲起來時還在深水區的隊友（沒坐救生圈）會溺水：每秒扣 1 HP
     （打巨大比基尼小丑魚 BOSS 時，抽乾過的水又漲回來，畫面上方中間跳「快點再次打開抽水閥」，再打開抽水閥就消失）
      溫特也一樣：原地溺水（位置不變）、每秒扣 1 HP，頭上喊「溺水了！需要救生圈！」、腳下出現「空白鍵／使用救生圈」；
      可以自己走回岸上（走上岸就下不去了），或按空白鍵原地坐上救生圈（js/swim-ring.js）
      深水區裡沒有隊友：溫特頭上冒泡泡「一定有開關可以把這些水抽走。」
   畫面怎麼跟著變：圖層名稱裡寫這些字（地圖編輯器圖層列的「改名」），那層就照水位淡入淡出
     「抽水後消失」：淺水區的水（抽水機打開後消失）　「抽水後出現」：淺水區抽乾後的地面
     「深水時顯現」：深水區是深水時的樣子　　　　　　「淺水時顯現」：深水區抽成淺水時的樣子
     看不到的圖層：裡面勾了「這是水」的素材也不算水（js/water.js） */
const POOL_TIDE = {
  firstHoldSecs: 30,    // 第一次抽乾後，過幾秒水才漲回來（原本 90 秒）
  holdSecs: 45,         // 之後每次抽乾後，過幾秒水又漲回來（越後面越趕；核心扣的血不會回來，打不完下次抽乾再接著打）
  riseSecs: 2,          // 水漲起來要幾秒
  drainSecs: 1.5,       // 抽乾要幾秒
  drownDps: 1,          // 溺水每秒扣幾 HP
  drownTalkSecs: [6, 10],   // 溺水的隊友每隔幾秒喊一句（data/dialogues.js 的 drown）
  drownSaySecs: 2.6,   // 溫特開始溺水的那一刻頭上那句（對話編輯器裡溫特的「開始溺水」）停幾秒
  ringPrompt: '空白鍵／使用救生圈',   // 溫特溺水時腳下的互動提示（js/render.js）
  warnText: '快點再次打開抽水閥',   // 只在打巨大比基尼小丑魚 BOSS 時、水又漲回來的時候出現（溺水不會跳）
  winterSecs: 3.5,      // 水漲回來時溫特自言自語（對話編輯器裡溫特的「水又漲回來」）的泡泡停多久
  pumpedText: '抽水機已經在運轉了。',   // 抽水機打開後再按
  valveSaySecs: 2.2,   // 發電機還沒全開就按抽水閥時，溫特頭上那句（對話編輯器裡溫特的「發電機還沒開」）停幾秒
  valveLowText: '水已經抽掉了。',
  valveBusyText: '抽水閥已經打開了。',   // 倒數中、正在退水時再按
  notice: { secs: 3, rise: '水位即將上升……', drain: '水位即將下降……', y: .2 },   // 漲退水前幾秒提醒、文字、在畫面高度的哪裡（.2＝從上面算 20%）
  marks: { shallowGone: '抽水後消失', shallowDry: '抽水後出現', deep: '深水時顯現', deepShallow: '淺水時顯現' },
};

// ---- 狀態（每一局重來；存在 G 裡，換地圖、重開都會重設）----
// pumped＝抽水機打開過；deep＝深水區現在的水位（1＝深水、0＝淺水）；shallow＝淺水區的水（1＝有水、0＝乾了）
function poolTide() {
  if (typeof G === 'undefined' || !G) return null;
  if (!G.poolTide || G.poolTide.map !== MAP) G.poolTide = { map: MAP, t: 0, pumped: false, deep: 1, shallow: 1, phase: 'full', riseAt: Infinity, winterUntil: 0, warn: false };
  return G.poolTide;
}
const poolTideActive = () => typeof MAP !== 'undefined' && MAP && Array.isArray(MAP.deepWater) && MAP.deepWater.length > 0;
// 深水區現在是不是深水（js/swim-ring.js 的深水判定問這個：不是深水＝不擋路、不用救生圈）
function poolDeepIsDeep() { const s = poolTideActive() ? poolTide() : null; return !s || s.deep >= .5; }

// ---- 圖層照水位顯示 ----
let poolMarkCache = { list: null, map: new Map() };
function poolLayerMark(lid) {
  const list = typeof MAP !== 'undefined' && MAP && Array.isArray(MAP.layerOrder) ? MAP.layerOrder : null;
  if (poolMarkCache.list !== list) {
    const map = new Map(), M = POOL_TIDE.marks;
    for (const l of list || []) {
      const n = String(l.name || '');
      const mark = n.includes(M.shallowGone) ? 'shallowGone' : n.includes(M.shallowDry) ? 'shallowDry' : n.includes(M.deepShallow) ? 'deepShallow' : n.includes(M.deep) ? 'deep' : '';
      if (mark) map.set(l.id, mark);
    }
    poolMarkCache = { list, map };
  }
  return poolMarkCache.map.get(lid) || '';
}
// 這個圖層現在多不透明（0～1）；沒有標記的圖層＝1（js/maploader.js 畫地圖時問）
function poolLayerAlpha(lid) {
  const mark = poolLayerMark(lid || 'top'); if (!mark) return 1;
  const s = poolTideActive() ? poolTide() : null;
  const deep = s ? s.deep : 1, shallow = s ? s.shallow : 1;
  return mark === 'shallowGone' ? shallow : mark === 'shallowDry' ? 1 - shallow : mark === 'deep' ? deep : 1 - deep;
}

// ---- 抽水機（js/storage-lockers.js 的發電機開關呼叫）----
// 回傳 true＝已經抽過水了，這次按了沒效果
function poolPumpLocked() { return poolTideActive() && poolTide().pumped; }
function poolPumpCheck() {
  if (!poolTideActive() || typeof dynamosAllOn !== 'function' || !dynamosAllOn()) return;
  const s = poolTide(); if (s.pumped) return;
  s.pumped = true;   // 只是通電：要再打開抽水閥才會抽水（usePoolValve）
  if (typeof systemNotice === 'function') systemNotice('抽水機啟動了，打開抽水閥就能把水抽走。');
}
// ---- 抽水閥（地圖編輯器勾了「抽水閥」的電源開關）----
function usePoolValve() {
  const s = poolTideActive() ? poolTide() : null;
  if (!s || !s.pumped) { sfx('error'); const say = typeof playerLine === 'function' && playerLine('valveNoPower'); if (say && G && G.player) G.player.poolSay = { text: say, until: performance.now() + POOL_TIDE.valveSaySecs * 1000 }; return; }   // 溫特頭上的泡泡（drawPoolTideBubble）
  if (s.phase === 'drainSoon' || s.phase === 'draining') { sfx('switch'); systemNotice(POOL_TIDE.valveBusyText); return; }
  if (s.phase !== 'full' && s.phase !== 'high' && s.phase !== 'rising') { sfx('switch'); systemNotice(POOL_TIDE.valveLowText); return; }
  s.firstDrain = s.phase === 'full'; poolDrainSoon(s); sfx('powerOn');   // full＝還沒抽過：第一次抽乾
}
// 要退水了：先倒數 POOL_TIDE.notice.secs 秒（畫面中上方「水位即將下降……」）才開始退；水正在漲的話，倒數時照樣漲
function poolDrainSoon(s) { s.drainFromRise = s.phase === 'rising'; s.phase = 'drainSoon'; s.drainAt = s.t + POOL_TIDE.notice.secs; }
// 抽水閥的開關圖：水抽掉的時候是「開」，漲起來是「關」
const poolValveShowsOn = () => { const s = poolTideActive() ? poolTide() : null; return !!(s && s.pumped && s.deep < .5); };

// ---- 每一幀（js/game.js 的 update 呼叫）----
let poolDeepWas = true;
function updatePoolTide(dt) {
  if (!poolTideActive()) { poolWarnShow(false); if (G && G.player) G.player.drowning = false; if (poolFlowOn) { poolFlowOn = false; SFX.fadeOut('poolWaterFlow', POOL_TIDE.flowSoundFade); } return; }   // 離開池核：流水聲也淡掉
  if (typeof updatePoolBoss === 'function') updatePoolBoss(dt);   // 池核 BOSS：游泳、潛水、擱淺（js/pool-boss.js）
  if (typeof updateFishKing === 'function') updateFishKing(dt);   // 魚頭王：冒頭偷看、潛水、水砲、水柱衝天、擱淺（js/fish-king.js）
  if (typeof updateWaterMonsters === 'function') updateWaterMonsters(dt);   // 水中怪物下潛、被撞飛的人、泳圈開槍的後座力（js/water-monsters.js）
  if (typeof poolFallTick === 'function') poolFallTick(dt);   // 失足掉進深水：隊員搖晃、掉下去、掙扎濺水花、自動戴泳圈（js/pool-fall.js）
  if (typeof poolSurgeTick === 'function') poolSurgeTick(dt);   // 大型怪物落水、水溢上岸把人推開（js/pool-surge.js）
  const s = poolTide(); s.t += dt;
  if (s.phase === 'drainSoon') {
    if (s.drainFromRise) s.deep = Math.min(1, s.deep + dt / POOL_TIDE.riseSecs);
    if (s.t >= s.drainAt) s.phase = 'draining';
  } else if (s.phase === 'draining') {
    const k = dt / POOL_TIDE.drainSecs;
    s.deep = Math.max(0, s.deep - k); s.shallow = Math.max(0, s.shallow - k);
    if (s.deep <= 0 && s.shallow <= 0) { s.drained = true; s.phase = 'low'; s.riseAt = s.t + (s.firstDrain ? POOL_TIDE.firstHoldSecs : POOL_TIDE.holdSecs); }
  } else if (s.phase === 'low' && s.t >= s.riseAt) {
    s.phase = 'rising';
    const mates = poolMatesInDeep();
    if (!mates.length) { s.winterText = typeof playerLine === 'function' ? playerLine('tideSwitch') : null; s.winterUntil = performance.now() + POOL_TIDE.winterSecs * 1000; }   // 深水區沒有隊友：溫特自言自語（沒填就不說）
  } else if (s.phase === 'rising') {
    s.deep = Math.min(1, s.deep + dt / POOL_TIDE.riseSecs);
    if (s.deep >= 1) s.phase = 'high';
  }
  updatePoolTideNotice(s, dt);
  poolWaterFlowSound(s);
  // 深水 ↔ 淺水 換過去的那一刻：坐救生圈的人收起來、怪物重新找路
  const deepNow = s.deep >= .5;
  if (deepNow !== poolDeepWas) {
    poolDeepWas = deepNow;
    if (!deepNow) { if (G.player) G.player.swimRing = false; for (const t of G.towers || []) t.swimRing = false; }
    else poolDouseLights();   // 水漲回深水：放在深水區裡的燈熄滅、消失
    if (typeof computeFlow === 'function') computeFlow();
  }
  // 溺水：深水時，還在深水區、沒坐救生圈的隊友每秒扣血
  const drowning = deepNow && s.drained ? poolMatesInDeep() : [];   // 抽乾過、水又漲回來才會溺水（剛通電還沒開抽水閥＝跟一開始一樣）
  for (const t of G.towers || []) if (poolFellIn(t) && !drowning.includes(t)) drowning.push(t);   // 失足掉進深水的（js/pool-fall.js）：不管有沒有抽過水都會溺水
  for (const t of G.towers || []) {
    const now = drowning.includes(t);
    if (now && !t.drowning) poolDrownBubbleOnce(t, 'poolDrownMate', t.id ?? t.type);   // 剛開始溺水：冒泡泡的聲音（一次落水只播一次）
    t.drowning = now;
  }
  for (const t of drowning) {
    t.hp = Math.max(0, t.hp - POOL_TIDE.drownDps * dt);
    // 溺水扣血不閃紅（會蓋住掙扎的 >< 表情）
    if ((t.drownTalkT = (t.drownTalkT ?? 0) - dt) <= 0) {
      const [a, b] = POOL_TIDE.drownTalkSecs; t.drownTalkT = a + Math.random() * (b - a);
      const line = typeof pickDialogueLine === 'function' ? pickDialogueLine(t.type, 'drown') : null;
      if (line && !t.berserk) t.say = { text: line, life: 2.6 };
    }
    if (t.hp <= 0) { t.target = null; if (typeof sentryStatus === 'function') sentryStatus(t, '失去戰鬥能力', '#ff5b6e', true); }
  }
  updateWinterDrown(dt, deepNow && s.drained);
  poolWarnShow(poolWarnWanted(s) && G.running && !G.over);
}
// 溫特溺水：跟隊友一樣，水漲起來時還在深水區、沒坐救生圈就原地溺水，每秒扣 drownDps
function updateWinterDrown(dt, deep) {
  const p = G.player; if (!p) return;
  const was = !!p.drowning;
  p.drowning = (deep && p.hp > 0 && !p.swimRing && !p.sitting && !p.vineCap && poolPointInDeepZone(p.x, p.y)   // vineCap：被水柱噴飛在空中（js/fish-king.js）不算
    && !(typeof poolPlatformStandingAny === 'function' && poolPlatformStandingAny())) || poolFellIn(p);   // 失足掉進深水（js/pool-fall.js）也算
  if (!p.drowning) return;
  if (!was) {   // 開始溺水的那一刻：喊一聲（蓋掉「一定有開關可以把這些水抽走。」）
    poolDrownBubbleOnce(p, 'poolDrownSelf', 'winter');   // 冒泡泡的聲音（一次落水只播一次）
    const cry = typeof playerLine === 'function' && playerLine('drownStart');   // 對話編輯器裡溫特的「開始溺水」；沒填就不說
    p.poolSay = cry ? { text: cry, until: performance.now() + POOL_TIDE.drownSaySecs * 1000 } : null;
    poolTide().winterUntil = 0; p.swimHintAt = 0;
  }
  const before = Math.ceil(p.hp);
  p.hp = Math.max(0, p.hp - POOL_TIDE.drownDps * dt);
  if (Math.ceil(p.hp) !== before && typeof updateHUD === 'function') updateHUD();   // 每少 1 點更新一次畫面（溺水扣血不閃紅，會蓋住掙扎的 >< 表情）
  if (p.hp <= 0 && !G.over) { flash('部隊長失去戰鬥能力', p.x, p.y - 58, '#ff5b6e'); lose('player', '溺水'); }
}
// 失足掉進深水、正在掙扎（js/pool-fall.js）
const poolFellIn = a => !!(a && a.poolFall && a.poolFall.phase === 'struggle' && a.hp > 0 && !a.swimRing);
// ---- 池核的水聲 ----
// 溺水的泡泡聲：開始溺水時播一次，播 drownSoundSecs 秒後用 drownSoundFade 秒淡出（音檔、音量在音效編輯器：隊友 poolDrownMate、溫特 poolDrownSelf）
POOL_TIDE.drownSoundSecs = 2; POOL_TIDE.drownSoundFade = 1;
POOL_TIDE.drownSoundGap = 6;   // 播過之後至少隔幾秒才會再播（在水邊進進出出、被抓起來又放下時不會一直重播）
// 一次落水只播一次泡泡聲：掉進水裡掙扎的（a.poolFall）整段只播一次；漲潮溺水的隔 drownSoundGap 秒內不重播
function poolDrownBubbleOnce(a, name, who) {
  const f = a.poolFall, now = performance.now();
  if (f) { if (f.bubbled) return; f.bubbled = true; }
  if (now < (a.drownBubbleUntil || 0)) return;
  a.drownBubbleUntil = now + POOL_TIDE.drownSoundGap * 1000;
  poolDrownSound(name, who);
}
function poolDrownSound(name, who) {
  if (typeof SFX === 'undefined') return;
  const key = name + ':' + who;   // 每個人各自一個，淡出時不會把別人的也一起關掉
  SFX.play(name, 1, key);
  setTimeout(() => SFX.fadeOut(key, POOL_TIDE.drownSoundFade), POOL_TIDE.drownSoundSecs * 1000);
}
// 流水聲：水位開始上升或下降時播，水漲滿（或退乾）的那一刻用 flowSoundFade 秒淡出（音效編輯器的 poolWaterFlow）
POOL_TIDE.flowSoundFade = 1;
let poolFlowOn = false;
function poolWaterFlowSound(s) {
  const moving = s.phase === 'rising' || s.phase === 'draining' || (s.phase === 'drainSoon' && s.drainFromRise && s.deep < 1);
  if (moving === poolFlowOn || typeof SFX === 'undefined') return;
  poolFlowOn = moving;
  if (moving) SFX.play('poolWaterFlow', 1, 'poolWaterFlow');
  else SFX.fadeOut('poolWaterFlow', POOL_TIDE.flowSoundFade);
}
const poolPlayerDrowning = () => !!(typeof G !== 'undefined' && G && G.player && G.player.drowning);
// 「水位即將上升／下降……」：漲水前最後幾秒、退水倒數中顯示；開始漲／退就淡出（s.notice＝{ kind, t, out }）
function updatePoolTideNotice(s, dt) {
  const want = s.phase === 'low' && s.riseAt - s.t <= POOL_TIDE.notice.secs ? 'rise' : s.phase === 'drainSoon' ? 'drain' : null;
  if (want) { if (!s.notice || s.notice.kind !== want || s.notice.out) s.notice = { kind: want, t: 0 }; s.notice.t += dt; }
  else if (s.notice) { s.notice.out = (s.notice.out || 0) + dt; if (s.notice.out > .35) s.notice = null; }
}
// 畫面中上方的提醒（js/render.js 在異質核心的大橫幅之後呼叫）：照 js/core-frenzy.js 的甦醒大橫幅，小一號、顏色淡一些
function drawPoolTideNotice(ctx, cv) {
  const n = typeof G !== 'undefined' && G && !G.over && G.poolTide && G.poolTide.map === MAP ? G.poolTide.notice : null; if (!n) return;
  const inT = .35, outT = .35;
  const k = n.out ? Math.max(0, 1 - n.out / outT) : Math.min(1, n.t / inT);
  const ease = 1 - (1 - k) * (1 - k), cy = cv.height * POOL_TIDE.notice.y, bh = 52 * ease;
  ctx.save();
  const band = ctx.createLinearGradient(0, 0, cv.width, 0);   // 左右淡出的深藍底
  band.addColorStop(0, 'rgba(6,18,30,0)'); band.addColorStop(.3, 'rgba(6,18,30,.55)'); band.addColorStop(.7, 'rgba(6,18,30,.55)'); band.addColorStop(1, 'rgba(6,18,30,0)');
  ctx.fillStyle = band; ctx.fillRect(0, cy - bh / 2, cv.width, bh);
  const edge = ctx.createLinearGradient(cv.width * .25, 0, cv.width * .75, 0);   // 上下兩條淡藍細線
  edge.addColorStop(0, 'transparent'); edge.addColorStop(.2, 'rgba(150,210,255,.55)'); edge.addColorStop(.8, 'rgba(150,210,255,.55)'); edge.addColorStop(1, 'transparent');
  ctx.globalAlpha = ease; ctx.fillStyle = edge;
  ctx.fillRect(cv.width * .25, cy - bh / 2, cv.width * .5, 1); ctx.fillRect(cv.width * .25, cy + bh / 2 - 1, cv.width * .5, 1);
  ctx.globalAlpha = ease * (.78 + .22 * Math.sin(n.t * 6));   // 字輕輕一明一暗
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = 'bold 26px "Microsoft JhengHei", sans-serif';
  ctx.fillStyle = '#d4ecff'; ctx.fillText(POOL_TIDE.notice[n.kind], cv.width / 2 + (1 - ease) * 40, cy + 1);
  ctx.restore();
}
// 在深水區裡、沒坐救生圈、還站得起來的隊友
function poolMatesInDeep() {
  if (typeof deepWaterAtPoint !== 'function') return [];
  return (G.towers || []).filter(t => t.hp > 0 && !t.swimRing && !t.eatenBy && !t.mrtRide && !t.grabbed && !t.grabFall && !t.vineCap && poolPointInDeepZone(t.x, t.y));   // 被溫特抓在空中（js/grab.js）不算
}
// 不管現在水位，這個點在不在畫好的深水區範圍裡
function poolPointInDeepZone(x, y) {
  const list = MAP && MAP.deepWater; if (!Array.isArray(list) || !list.length) return false;
  if (poolZoneCache.list !== list || poolZoneCache.keep !== MAP.deepWaterKeep) poolZoneCache = { list, keep: MAP.deepWaterKeep, set: new Set([...list, ...(MAP.deepWaterKeep || [])]) };   // 永遠深水也算在深水區裡
  return typeof deepCellsHavePoint === 'function' ? deepCellsHavePoint(poolZoneCache.set, x, y) : poolZoneCache.set.has(cellAt(x, y).join(','));   // 有微調過的深水格照微調後的位置（js/swim-ring.js）
}
let poolZoneCache = { list: null, set: null };
// 異質核心泡在深水裡（深水區的水還沒抽乾）：打不到——溫特的槍、隊員、油桶爆炸都傷不了它，隊員也不會去打它
// （js/anomalous-core.js、js/game.js、js/sentry.js、js/oil-barrels.js 問這個）
function poolCoreSubmerged(core) { return !!core && typeof deepWaterAtPoint === 'function' && deepWaterAtPoint(core.x, core.y); }
// 泡在深水裡的核心：畫的時候水面以下半透明（跟 BOSS、泡在水裡的人同一套畫法，js/water.js 的 drawWaded）；水抽乾了就恢復清楚
//   line＝水面在核心圖片的哪裡（從底部往上算，.55＝泡到 55% 高）；see＝水面以下多清楚（深水區沒有水素材時用這個）
const POOL_CORE_WADE = { line: .55, see: .45 };
function poolCoreWade(core) {
  if (!poolCoreSubmerged(core) || typeof CORE === 'undefined') return null;
  const lift = typeof coreLift === 'function' ? Math.max(0, coreLift(core)) : 0;
  const H = CORE.h + lift + 30;   // 處理的範圍：核心本體＋浮起來的高度＋頭上的血條
  const w = typeof waterAt === 'function' ? waterAt(core.x, core.y + 10) : null;
  const see = w && Number.isFinite(w.see) ? w.see : POOL_CORE_WADE.see;
  return { w: { depth: CORE.h * POOL_CORE_WADE.line / H, see }, bottom: core.y + 20, height: H, width: 60 };   // width：水面波紋的寬度
}

// ---- 畫面：溫特頭上的泡泡（js/render.js 的 drawInteractionPrompts 呼叫）----
function drawPoolTideBubble() {
  const s = poolTideActive() ? poolTide() : null, p = G && G.player;
  if (p && p.poolSay) {   // 抽水閥還沒反應：「需要先開啟所有發電機」（usePoolValve）
    if (performance.now() < p.poolSay.until) { if (typeof queueTowerBubble === 'function') queueTowerBubble(p, p.x, p.y - 50, p.poolSay.text); return; }
    p.poolSay = null;
  }
  if (!s || !p || !s.winterText || performance.now() > s.winterUntil) return;
  if (typeof queueTowerBubble === 'function') queueTowerBubble(p, p.x, p.y - 50, s.winterText);
}
// 要不要跳「快點再次打開抽水閥」：正在打巨大比基尼小丑魚 BOSS（被叫醒了、還活著），而且抽乾過的水又漲回來（正在漲、或已經漲滿）
// 溺水不會跳；打開抽水閥（開始倒數退水）就消失
function poolWarnWanted(s) {
  if (!s || !s.drained || (s.phase !== 'rising' && s.phase !== 'high')) return false;
  const pb = typeof poolBossState === 'function' ? poolBossState() : null;
  return !!(pb && typeof poolBossAlive === 'function' && poolBossAlive(pb) && pb.e.eliteAwake);
}
// 畫面上方中間的警告「快點再次打開抽水閥」（蓋在遊戲畫面上的一行字，跟著畫面位置走）
let poolWarnEl = null;
function poolWarnShow(on) {
  if (!on) { if (poolWarnEl) poolWarnEl.style.display = 'none'; return; }
  if (!poolWarnEl) {
    poolWarnEl = document.createElement('div');
    poolWarnEl.textContent = POOL_TIDE.warnText;
    poolWarnEl.style.cssText = 'position:fixed;z-index:50;transform:translateX(-50%);padding:6px 18px;border-radius:8px;font:bold 20px sans-serif;letter-spacing:2px;'
      + 'color:#fff;background:rgba(150,20,30,.82);border:2px solid #ff8a8a;box-shadow:0 0 18px rgba(255,60,60,.55);pointer-events:none;animation:poolWarnBlink 1s ease-in-out infinite';
    const st = document.createElement('style'); st.textContent = '@keyframes poolWarnBlink{0%,100%{opacity:1}50%{opacity:.55}}'; document.head.appendChild(st);
    document.body.appendChild(poolWarnEl);
  }
  const cv = document.getElementById('cv'), r = cv ? cv.getBoundingClientRect() : { left: 0, top: 0, width: innerWidth };
  poolWarnEl.style.left = (r.left + r.width / 2) + 'px'; poolWarnEl.style.top = (r.top + r.height * .26) + 'px';   // 在 BOSS 血條下面
  poolWarnEl.style.display = 'block';
}

// ---- 溺水的隊友往岸上逃（js/sentry.js 的 updateSentryMain 呼叫；回傳 true＝這一幀由這裡移動，隊員不攻擊）----
// 用隊員自己走路速度的 POOL_TIDE.drownFleeMul 倍，沿著深水區的格子游到最近的岸邊
POOL_TIDE.drownFleeMul = .3;   // 溺水時逃上岸的速度＝自己走路速度的幾倍
function poolDrownFlee(t, dt) {
  if (!t.drowning) return false;
  const now = performance.now();
  if (!t.drownPath || !t.drownPath.length || now > (t.drownPathAt || 0) + 1000) { t.drownPath = poolShorePath(t); t.drownPathAt = now; }
  t.target = null; t.navPath = null;
  const path = t.drownPath; if (!path || !path.length) { t.moving = false; return true; }
  const [gx, gy] = path[0], dx = gx - t.x, dy = gy - t.y, d = Math.hypot(dx, dy);
  const speed = ((typeof TYPES !== 'undefined' && TYPES[t.type] && TYPES[t.type].walkSpeed) || 80) * POOL_TIDE.drownFleeMul;
  const step = Math.min(d, speed * dt);
  if (d > .5) {
    const nx = t.x + dx / d * step, ny = t.y + dy / d * step;
    t.x = nx; t.y = ny;
    if (Math.abs(dx) > Math.abs(dy)) t.dir = dx < 0 ? 'left' : 'right'; else t.dir = dy < 0 ? 'back' : 'front';
  }
  if (d <= 4) path.shift();
  t.moving = true;
  return true;
}
// 從隊員站的格子，沿著深水區的格子找最近的岸邊（不是深水區、走得到的格子），回傳一路上每格中心
function poolShorePath(t) {
  const [c0, r0] = cellAt(t.x, t.y), seen = new Map([[c0 + ',' + r0, null]]), q = [[c0, r0]];
  const inZone = (c, r) => poolPointInDeepZone(...center(c, r));
  for (let h = 0; h < q.length && h < 4000; h++) {
    const [c, r] = q[h];
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nc = c + dc, nr = r + dr, k = nc + ',' + nr;
      if (seen.has(k) || !inGrid(nc, nr) || isWall(nc, nr)) continue;
      seen.set(k, c + ',' + r);
      if (!inZone(nc, nr)) {   // 找到岸邊：倒回去組出路線
        const out = []; let cur = k;
        while (cur) { const [cc, rr] = cur.split(',').map(Number); out.unshift(center(cc, rr)); cur = seen.get(cur); }
        out.shift();   // 第一格是自己站的
        return out;
      }
      q.push([nc, nr]);
    }
  }
  return [];
}

// ---- 這個電源開關是不是抽水閥：地圖編輯器勾了「抽水閥」，或放在名稱有「抽水閥」的圖層（取消勾選的＝valve: false，不算）----
function poolIsValve(stamp) {
  if (!stamp) return false;
  if (stamp.valve === true) return true;
  if (stamp.valve === false) return false;
  const list = typeof MAP !== 'undefined' && MAP && Array.isArray(MAP.layerOrder) ? MAP.layerOrder : [];
  const l = list.find(x => x.id === (stamp.layer || 'top'));
  return !!(l && String(l.name || '').includes('抽水閥'));
}

// ---- 水漲回深水：玩家放在深水區裡的燈（js/build.js 的 emitsLight）熄滅、消失 ----
// 燈只能放在淺水池：深水區要等水抽乾才放得下去（深水時不能蓋，js/build.js 的放置判定），水一漲回來就被淹掉
function poolDouseLights() {
  if (typeof emitsLight !== 'function' || typeof removeBarrier !== 'function') return;
  let n = 0;
  for (const o of [...(G.obstacles || [])]) {
    if (o.hp <= 0 || !emitsLight({ id: o.type })) continue;
    let wet = false;
    for (let dc = 0; dc < (o.w || 1) && !wet; dc++) for (let dr = 0; dr < (o.h || 1) && !wet; dr++) wet = poolPointInDeepZone(...center(o.c + dc, o.r + dr));
    if (!wet) continue;
    const [x, y] = center(o.c + ((o.w || 1) - 1) / 2, o.r + ((o.h || 1) - 1) / 2);
    o.lastHitBy = 'eaten';   // 安全移除（不會觸發爆炸之類的效果）
    removeBarrier(o); n++;
    G.effects.push({ ring: true, x, y: y + 8, r: 6, r2: 40, life: .5, life0: .5, color: '#cfeeff' });
    if (typeof pushBlackSmoke === 'function') for (let i = 0; i < 3; i++) pushBlackSmoke(x + (Math.random() - .5) * 16, y - 6);   // 冒一點煙
    if (typeof flash === 'function') flash('熄滅了', x, y - 24, '#9fd8ff');
    if (typeof sfxAt === 'function') sfxAt('poolLightDouse', x, y, 1, 'pool-light-douse'); else if (typeof sfx === 'function') sfx('poolLightDouse');
  }
  if (n) { for (const t of G.towers || []) { t.navPath = null; t.navGoal = null; t.navTimer = 0; } }
}
