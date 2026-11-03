/* ===== 回憶劇情播放器（改）：播放「🎬 劇情編輯器（改）」做的劇情 =====
   資料在 data/story-kai.js（STORY_KAI），特效在 js/story-kai-fx.js（STORY_KAI_FX）。
   跟舊的 js/story-scene.js 不同：劇情是一行一行的指令，從第 1 行往下跑，跑到「結局」或沒有下一行就結束。
   ・有些指令要等它做完才跑下一行：對白（等玩家點）、等待時間、鏡頭位移、角色位置（走路）、怪物演出的「移動」。
   ・其他指令一下就跑下一行，可以跟後面的指令疊在一起同時發生：黑幕／白幕淡入淡出、鏡頭震動、特效、音樂……
   遊戲本身只認得 StoryScene，所以檔案最後把 StoryScene 的入口接過來：播的是「改」版劇情時交給這裡，其他照舊。
   網址：?storyPreview=劇情id&storyKai=1（&storyDraft=1 用編輯器還沒存到專案的草稿；&storyFrom=N 從第 N 行開始）。
   必須在 js/story-scene.js 後面、js/maploader.js 前面載入。 */
const StoryKai = (() => {
  const DRAFT_KEY = 'tudrc_story_kai_v1';   // 劇情編輯器（改）的暫存
  const params = new URLSearchParams(location.search);
  const isPreview = () => params.get('storyKai') === '1' && !!params.get('storyPreview');
  let cache = null, state = null, ui = null, forcedId = null, resume = null;
  function scenes() {
    if (cache) return cache;
    let all = typeof STORY_KAI !== 'undefined' ? STORY_KAI : {};
    if (isPreview() && params.get('storyDraft') === '1') try { const d = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null'); if (d && typeof d === 'object') all = d; } catch (_) {}
    return (cache = all);
  }
  const has = id => !!id && !!scenes()[id];
  const previewScene = () => isPreview() ? scenes()[params.get('storyPreview')] || null : null;
  const currentId = () => forcedId || (isPreview() ? params.get('storyPreview') : null);
  const current = () => has(currentId());
  // 這段劇情用到的地圖：開頭的地圖（map）＋中途「演出地圖」換過去的
  const mapsOf = s => [s.map, ...(s.steps || []).filter(st => st.do === 'map' && st.map).map(st => st.map)];
  const config = () => { const s = scenes()[currentId()]; return s && typeof MAP !== 'undefined' && MAP && mapsOf(s).includes(MAP.id) ? s : null; };
  const el = id => document.getElementById(id);
  const rnd = (a, b) => a + Math.random() * (b - a);
  const readyImage = im => im?.complete && im.naturalWidth;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const smooth = k => k * k * (3 - 2 * k);   // 慢慢起步、慢慢停

  // ---- 幅度（編輯器裡選 1～5）換成實際的像素 ----
  const SHAKE_PX = [0, 2, 4, 7, 11, 16];      // 鏡頭震動：亂跳的幅度
  const SWAY_PX = [0, 3, 6, 10, 15, 22];      // 鏡頭晃動：慢慢晃的幅度（像拿著攝影機）
  const TREMBLE_PX = [0, .4, .8, 1.3, 2, 3];  // 角色震動（發抖）：左右快速晃的幅度
  const BOX_SHAKE_TIME = 1.5;                 // 對話框震動幾秒（css/story-kai.css 的動畫長度）
  const BGM_FADE = 1.5;                       // 背景音樂淡入、淡出幾秒
  const END_FADE = 1.8;                       // 結局：畫面變黑花幾秒
  const SHOW_FADE = .45;
  const HOP_TIME = .32;                       // 小跳：往上跳 5 像素再落下，花幾秒
  const WALK_RATE = { walk: 1, run: 1.25, slow: .25 };   // 角色演出的走路、跑步、慢走：腳步動畫放快、放慢幾倍（只改看起來的樣子；走多久照「角色位置」的 ms）
  // 持槍：有持槍圖的角色用持槍圖；拿近戰武器的角色舉起平常的武器（圖片、大小跟遊戲揮擊時一樣，js/render.js 的 drawFireAxe）
  const MELEE_WEAPON = { red: [() => typeof redAxeImg !== 'undefined' && redAxeImg, 21, 32, 22], avaren: [() => typeof avarenKnifeImg !== 'undefined' && avarenKnifeImg, 9, 29, 20],
    luther: [() => typeof lutherAxeImg !== 'undefined' && lutherAxeImg, 28, 46, 26, true], colyn: [() => typeof colynSwordImg !== 'undefined' && colynSwordImg, 9, 46, 18] };
  const FACE_ANGLE = { right: 0, front: Math.PI / 2, left: Math.PI, back: -Math.PI / 2 };                      // 角色出現、消失：淡入淡出幾秒
  const MON_LUNGE = { windup: .3, strike: .12, back: .25 };   // 沒有攻擊圖的怪物（史萊姆…）：往後縮、往前撲、退回原位各幾秒
  const MON_DIE = 2.6;                        // 怪物死亡：倒下、變黑、淡出總共幾秒（跟遊戲裡倒下的屍體一樣）
  const ITEM_SIZE = 26;                       // 道具畫多大（跟遊戲裡放在地上的東西一樣，js/ground-items.js）
  const ratio = () => VIEW_H / VIEW_W;        // 鏡頭的長寬比跟遊戲畫面一樣（16:9），畫面才不會變形

  // ---- 音量：遊戲設定靜音、或測試時 Howler.mute(true) 都不出聲 ----
  const muted = () => (typeof SFX !== 'undefined' && !SFX.enabled) || (typeof Howler !== 'undefined' && Howler._muted);
  const sfxMaster = () => typeof SFX !== 'undefined' && Number(SFX.volume) > 0 ? Math.min(1, SFX.volume / .35) : 1;

  // ---- 角色圖 ----
  const spriteCache = {};
  const sprites = name => spriteCache[name] || (spriteCache[name] = loadCharacterSprites(name));
  // 受傷差分：<資料夾>/<名字>_0000_Front_hurt_01～03.png（01＝張眼、02＝半閉、03＝閉眼）；只有正面，側面、背面、走路照原本的圖
  const hurtCache = {};
  function hurtSet(a) {
    if (a.set.single) return null;
    const name = a.cast.sprite, prefix = 'images/character/' + name + '/' + String(name).replace('_', '') + '_0000_Front_hurt_0';
    const h = hurtCache[name] || (hurtCache[name] = [1, 2, 3].map(n => { const im = new Image(); im.src = prefix + n + '.png'; return im; }));
    if (!readyImage(h[0])) return null;   // 還沒載好（或沒有畫）：先用原本的圖
    return { ...a.set, front: [h[0], ...a.set.front.slice(1)], blink: [h[1], h[2], h[2]] };
  }
  function imageSet(src) {   // 只有一張圖的路人（cast.image）：每個方向、走路都用同一張
    if (spriteCache[src]) return spriteCache[src];
    const im = new Image(); im.src = src; const one = [im, im, im];
    return (spriteCache[src] = { front: one, back: one, left: one, right: one, blink: one, single: true });
  }
  const charName = (cast) => {
    if (cast.name) return cast.name;   // 自己取的名字（例如從舊劇情搬過來的「家屬」）
    const c = typeof CHARACTERS !== 'undefined' && CHARACTERS[cast.char];
    if (c) return c.name || cast.char;
    return { mob_A: '嚮導', mob_B: '哨兵' }[cast.sprite] || cast.char || '';
  };

  // ---- 找路：跟舊播放器一樣，避開地圖上不可穿透的格子 ----
  const open = (c, r) => inGrid(c, r) && !isWall(c, r);
  function clearLine(x1, y1, x2, y2) {
    const n = Math.ceil(Math.hypot(x2 - x1, y2 - y1) / 8);
    for (let i = 1; i <= n; i++) {
      const x = x1 + (x2 - x1) * i / n, y = y1 + (y2 - y1) * i / n;
      for (const [ox, oy] of [[-9, -5], [9, -5], [-9, 5], [9, 5]]) if (!open(...cellAt(x + ox, y + oy))) return false;
    }
    return true;
  }
  function findRoute(x, y, tx, ty) {
    if (clearLine(x, y, tx, ty)) return [[tx, ty]];
    const [sc, sr] = cellAt(x, y), [gc, gr] = cellAt(tx, ty), key = (c, r) => c + ',' + r;
    const from = new Map([[key(sc, sr), null]]), queue = [[sc, sr]];
    for (let i = 0; i < queue.length; i++) {
      const [c, r] = queue[i];
      if (c === gc && r === gr) break;
      for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
        const nc = c + dc, nr = r + dr, k = key(nc, nr);
        if (from.has(k) || !(open(nc, nr) || (nc === gc && nr === gr))) continue;
        if (dc && dr && !(open(c + dc, r) && open(c, r + dr))) continue;
        from.set(k, key(c, r)); queue.push([nc, nr]);
      }
    }
    if (!from.has(key(gc, gr))) return [[tx, ty]];   // 找不到路：直接走過去
    const cells = [];
    for (let k = key(gc, gr); k && k !== key(sc, sr); k = from.get(k)) cells.unshift(k.split(',').map(Number));
    const pts = [...cells.slice(0, -1).map(([c, r]) => [(c + .5) * CELL, (r + .5) * CELL]), [tx, ty]];
    const out = [];
    for (let i = 0, px = x, py = y; i < pts.length;) {
      let j = pts.length - 1;
      while (j > i && !clearLine(px, py, ...pts[j])) j--;
      out.push(pts[j]); [px, py] = pts[j]; i = j + 1;
    }
    return out;
  }

  // ---- 畫面上的東西（暗角、黑幕、白幕、離開按鈕、結局畫面）----
  function ensureUI() {
    if (ui) return;
    ui = document.createElement('section'); ui.id = 'storyKaiUI'; ui.hidden = true;
    ui.setAttribute('aria-label', '回憶劇情');
    ui.innerHTML = '<div id="storyKaiVignette" aria-hidden="true"></div><div id="storyKaiWhite" aria-hidden="true"></div><div id="storyKaiBlack" aria-hidden="true"></div>' +
      '<button type="button" id="storyKaiExit" data-kai-action="exit">離開回憶</button>' +
      '<section id="storyKaiEnd" hidden><small>回憶片段結束</small><h2 id="storyKaiEndTitle"></h2><div><button type="button" data-kai-action="replay" id="storyKaiReplay">重新播放</button><button type="button" data-kai-action="exit" id="storyKaiEndExit">回到現實</button></div></section>';
    el('wrap').appendChild(ui);
  }
  // 暗角：等級 1～10，數字越大，四周壓暗的範圍越大（0＝沒有暗角）
  function vignetteCss(lv) {
    if (!(lv > 0)) return '';
    const clear = 66 - lv * 5, dark = clear + 28;   // 中間保持原樣的範圍、開始全暗的地方（%）
    return 'radial-gradient(ellipse 72% 72% at 50% 50%, transparent ' + clear + '%, rgba(0,0,0,.55) ' + (clear + 14) + '%, rgba(0,0,0,.92) ' + dark + '%, #000 100%)';
  }

  // ---- 對話框：借用遊戲的正式對話框（#dialogueBox）----
  const box = () => el('dialogueBox');
  function showBox(on) {
    box().classList.toggle('hidden', !on);
    if (on) { el('dialogueText').classList.remove('line-in'); void el('dialogueText').offsetWidth; el('dialogueText').classList.add('line-in'); }
  }
  function setSpeaker(step) {
    const a = step.who ? actor(step.who) : null, cast = a ? a.cast : state.cfg.cast?.find(c => c.no === Number(step.who));
    const name = cast ? charName(cast) : '';
    box().classList.toggle('story-narration', !cast);   // 沒填說話者＝旁白（不放頭像，斜體字）
    box().classList.toggle('story-noface', !!cast?.image);   // 圖片角色：有名字、沒頭像
    el('dialogueName').textContent = name;
    el('dialogueProgress').textContent = '';
    el('dialoguePortrait').style.filter = '';
    if (cast && !cast.image) {
      const set = a ? a.set : sprites(cast.sprite);
      el('dialoguePortrait').src = set.front[0].src; el('dialoguePortrait').alt = name;
      el('dialoguePortraitFrame').dataset.char = String(cast.sprite).replace(/_[A-Z]$/, '');
    }
    const b = box(); b.classList.remove('story-kai-shake');
    if (step.shake) { void b.offsetWidth; b.classList.add('story-kai-shake'); }
  }
  function renderText() {
    const t = state.talk; if (!t) return;
    const chars = Array.from(t.step.text || ''), typing = t.chars < chars.length;
    const text = chars.slice(0, Math.floor(t.chars)).join('');
    if (el('dialogueText').textContent !== text) el('dialogueText').textContent = text;
    el('dialogueText').classList.toggle('typing', typing);
    setDialogueNextLabel(typing ? '快速顯示' : '下一句');
  }

  // ---- 準備：把地圖、演員、鏡頭都擺好（還沒開始跑指令）----
  function makeActor(cast) {
    return { no: Number(cast.no), cast, set: cast.image ? imageSet(cast.image) : sprites(cast.sprite), x: 0, y: 0, dir: 'front', hidden: true, alpha: 1, fade: 0,
      anim: 0, moving: false, path: [], target: null, speed: 0, blinkTime: -1, blinkWait: 2 + Math.random() * 4, tremble: 0,
      equip: Object.keys(cast.accs || {}).length ? cast.accs : null };
  }
  const actor = no => state.actors.find(a => a.no === Number(no));
  function lights() {   // 後室黑幕時的光：地圖上放的探照燈、露營燈（算法跟 js/story-scene.js 一樣）
    const out = [], seen = new Set();
    const add = (t, c, r, w, h, ox = 0, oy = 0) => {
      if (!isMapObstacleTile(t)) return;
      const type = mapObstacleSpec(t).type, rad = LIGHT.buildings[type]; if (!rad) return;
      const key = type + '@' + c + ',' + r; if (seen.has(key)) return;
      seen.add(key);
      const x = (c + w / 2) * CELL + ox;
      out.push({ x, y: (r + h / 2) * CELL + oy, visualX: x, visualY: (r + Math.min(.38, h * .3)) * CELL + oy + 10, r: rad, warm: true, single: type === 'camping_lights', phase: c * 7 + r * 13 });
    };
    for (const layer of Object.values(MAP.layers || {})) for (const [key, id] of Object.entries(layer)) {
      const t = mapTileById(id); if (!t) continue;
      const [c, r] = key.split(',').map(Number); add(t, c, r, mapTileW(t), mapTileH(t));
    }
    for (const s of MAP.stamps || []) { const t = mapTileById(s.id); if (t) add(t, s.c, s.r, mapStampW(s, t), mapStampH(s, t), s.ox || 0, s.oy || 0); }
    return out;
  }
  function prepare() {
    ensureUI(); clearInput();
    const cfg = config(); if (!cfg) return;
    gotoMap(cfg.map);   // 重新播放時：中途換過地圖的話，先回到開頭的地圖
    G = { story: true, phase: 'ready', running: false, over: false, player: null,
      towers: [], npcs: [], enemies: [], obstacles: [], cores: [], effects: [], acidPools: [],
      grid: {}, mapDestroyed: new Set(), lightFlashes: [], selType: null, guide: NaN, vitalsSkip: true, moneySettled: true };
    LIGHT.enabled = false;
    const steps = Array.isArray(cfg.steps) ? cfg.steps : [];
    // 沒有寫鏡頭之前：整張地圖置中（跟一般地圖進來時一樣大）
    const fullW = viewW() / CELL;
    // 第一個黑幕指令是「黑幕淡出」：劇情一開始畫面是黑的，等它慢慢亮起來
    const firstBlack = steps.find(s => s.do === 'blackIn' || s.do === 'blackOut');
    state = { cfg, steps, i: 0, time: 0, playing: false, ending: null, ended: false, waitUntil: 0, talk: null, moveWait: null,
      actors: (cfg.cast || []).map(makeActor), monsters: [], items: [], cam: { x: COLS / 2, y: ROWS / 2, w: fullW }, camMove: null,
      black: { from: firstBlack?.do === 'blackOut' ? 1 : 0, to: firstBlack?.do === 'blackOut' ? 1 : 0, t: 0, dur: 0 },
      white: { from: 0, to: 0, t: 0, dur: 0 }, shake: null, sway: 0, vignette: 0, fx: [], skipping: false };
    applyCam();
    document.body.classList.add('story-scene');
    ui.hidden = true; el('storyKaiEnd').hidden = true;
    el('storyKaiExit').textContent = resume ? '離開回憶' : '離開預覽';
    el('storyKaiEndExit').textContent = resume ? '回到現實' : '結束預覽';
    el('storyKaiReplay').hidden = !!resume;   // 遊戲裡看完就回去；只有預覽才可以重新播放
    showBox(false);
    state.lights = lights();
    paintLayers();
  }
  function start() {
    prepare(); if (!state) return;
    hideOverlay(); ui.hidden = false;
    state.playing = true; G.phase = 'story';
    // &storyFrom=N：前面幾行一次做完（不播音效、不出特效），直接從第 N 行開始（編輯器「從這行預覽」用）
    const from = clamp(Number(params.get('storyFrom')) || 1, 1, state.steps.length || 1) - 1;
    if (from > 0 && !resume) fastForward(from);
    run();
  }
  function fastForward(to) {
    state.skipping = true;
    while (state.i < to) { const s = state.steps[state.i++]; if (s.do !== 'end') exec(s); settle(); }
    state.skipping = false;
    if (state.skipBgm) { const b = state.skipBgm; state.skipBgm = null; startBgm(b.src, Number(b.vol ?? 50) / 100, false); }
  }
  function settle() {   // 快轉時：正在走的人直接到、淡入淡出直接做完、要等的時間直接過去
    for (const a of state.actors) {
      if (a.target) { [a.x, a.y] = a.path.length ? a.path[a.path.length - 1] : a.target; a.target = null; a.path = []; a.moving = false; if (a.arriveDir) a.dir = a.arriveDir; }
      if (a.fade < 0) a.hidden = true;
      a.fade = 0; a.alpha = 1;
    }
    for (const e of state.monsters) {
      if (e.target) { [e.x, e.y] = e.path.length ? e.path[e.path.length - 1] : e.target; e.target = null; e.path = []; }
      e.alpha = 1; e.atk = null; e.swing = null;
    }
    state.monsters = state.monsters.filter(e => !e.dying && e.fade >= 0); for (const e of state.monsters) e.fade = 0;
    state.items = state.items.filter(it => it.fade >= 0); for (const it of state.items) { it.fade = 0; it.alpha = 1; }
    if (state.camMove) { state.cam = { ...state.camMove.to }; state.camMove = null; }
    for (const f of [state.black, state.white]) f.t = f.dur;
    state.talk = null; state.waitUntil = state.time; state.moveWait = null; state.fx = []; state.shake = null;
  }

  // ---- 跑指令：一行一行往下，遇到要等的就停在那裡 ----
  // 鏡頭位移不擋：鏡頭一邊移，下一行一邊跑；但下一行是「＋新鏡頭」時，要等上一個運鏡移完才切過去
  const camBusy = () => state.camMove && state.steps[state.i]?.do === 'cam';
  const blocked = () => state.talk || state.time < state.waitUntil || (state.moveWait && state.moveWait.target) || camBusy() || state.ending;
  function run() {
    let guard = 0;
    while (state.playing && !blocked() && guard++ < 500) {
      if (state.i >= state.steps.length) { finish(''); return; }   // 沒有下一行：當作沒有標題的結局
      exec(state.steps[state.i++]);
    }
  }
  function exec(s) {
    const ms = Math.max(0, Number(s.ms) || 0), sec = ms / 1000;
    switch (s.do) {
      case 'map': if (s.map) changeMap(s.map); break;
      case 'cam': if (s.at) state.cam = camOf(s); state.camMove = null; break;
      case 'camMove':
        if (!s.at) break;
        if (sec > 0 && !state.skipping) state.camMove = { from: { ...state.cam }, to: camOf(s), t: 0, dur: sec };
        else state.cam = camOf(s);
        break;
      case 'camShake': if (!state.skipping && sec > 0) state.shake = { t: 0, dur: sec, amp: SHAKE_PX[clamp(Number(s.lv) || 3, 1, 5)] }; break;
      case 'camSway': state.sway = s.on === false ? 0 : SWAY_PX[clamp(Number(s.lv) || 2, 1, 5)]; break;
      case 'blackIn': case 'blackOut': fade(state.black, s.do === 'blackIn' ? 1 : 0, sec); break;
      case 'whiteIn': case 'whiteOut': fade(state.white, s.do === 'whiteIn' ? 1 : 0, sec); break;
      case 'wait': state.waitUntil = state.time + sec; break;
      case 'show': {
        const a = actor(s.who); if (!a || !s.at) break;
        a.x = s.at[0] * CELL; a.y = s.at[1] * CELL; a.target = null; a.path = []; a.moving = false;
        if (s.face) a.dir = s.face;
        if (a.hidden || a.fade < 0) { a.hidden = false; a.alpha = state.skipping ? 1 : 0; a.fade = state.skipping ? 0 : 1; }
        break;
      }
      case 'hide': { const a = actor(s.who); if (a && !a.hidden) { a.target = null; a.path = []; a.moving = false; if (state.skipping) a.hidden = true; else a.fade = -1; } break; }
      case 'move': {
        const a = actor(s.who); if (!a || !s.at) break;
        const tx = s.at[0] * CELL, ty = s.at[1] * CELL;
        a.arriveDir = s.face || null;
        if (a.hidden) { a.hidden = false; a.alpha = 0; a.fade = 1; a.x = tx; a.y = ty; }   // 還沒出現的人：直接在那裡出現
        if (sec <= 0 || state.skipping) { a.x = tx; a.y = ty; a.target = null; a.path = []; if (a.arriveDir) a.dir = a.arriveDir; break; }
        a.path = findRoute(a.x, a.y, tx, ty);
        let len = 0, px = a.x, py = a.y; for (const [x, y] of a.path) { len += Math.hypot(x - px, y - py); px = x; py = y; }
        a.speed = Math.max(1, len / sec); a.target = a.path.shift();
        state.moveWait = a;   // 等這個人走到才跑下一行
        state.waitUntil = state.time + sec;
        break;
      }
      case 'act': {   // 角色演出：小跳（跳一下）、持槍、倒地、集氣（後面三個是開／關）、走路／跑步／慢走（之後走路的腳步快慢，換別的再改）
        const a = actor(s.who); if (!a) break;
        if (WALK_RATE[s.act]) { a.animRate = WALK_RATE[s.act]; break; }
        const on = s.on !== false;
        if (s.act === 'hop') { if (!state.skipping) a.hopT = HOP_TIME; }
        else if (s.act === 'gun') a.armed = on;
        else if (s.act === 'down') a.down = on;
        else if (s.act === 'charge') a.charging = on;
        else if (s.act === 'hurt') { a.hurt = on; if (on) hurtSet(a); }   // 受傷：換成流血的差分
        break;
      }
      case 'sway': { const a = actor(s.who); if (a) a.sway = s.on === false ? 0 : SWAY_PX[clamp(Number(s.lv) || 2, 1, 5)] * .5; break; }   // 角色晃動：跟鏡頭晃動同樣的 1～5 級，慢慢左右晃（像站不穩）
      case 'tremble': { const a = actor(s.who); if (a) a.tremble = s.on === false ? 0 : TREMBLE_PX[clamp(Number(s.lv) || 2, 1, 5)]; break; }
      case 'mshow': showMonster(s); break;
      case 'mhide': { const e = monster(s.mon); if (e) { e.target = null; e.path = []; if (state.skipping) dropMonster(e); else e.fade = -1; } break; }
      case 'mact': {
        const e = monster(s.mon); if (!e || e.dying) break;
        if (s.act === 'move') moveMonster(e, s, sec);
        else if (s.act === 'die') killMonster(e);
        else { if (s.face) faceMonster(e, s.face); attackMonster(e); }
        break;
      }
      case 'ishow': showItem(s); break;
      case 'ihide': { const it = state.items.find(x => x.no === Number(s.item)); if (it) { if (state.skipping) state.items.splice(state.items.indexOf(it), 1); else it.fade = -1; } break; }
      case 'say':
        if (state.skipping) break;
        state.talk = { step: s, chars: 0 };
        setSpeaker(s); showBox(true); renderText();
        break;
      case 'fx': if (!state.skipping && s.box) state.fx.push({ step: s, def: (typeof STORY_KAI_FX !== 'undefined' && STORY_KAI_FX[s.id]) || null, t: 0 }); break;
      case 'dark': LIGHT.enabled = s.on !== false; break;
      case 'vignette': state.vignette = clamp(Number(s.lv) || 0, 0, 10); el('storyKaiVignette').style.background = vignetteCss(state.vignette); break;
      case 'bgm':
        if (state.skipping) state.skipBgm = s.src ? s : null;
        else if (s.src) startBgm(s.src, Number(s.vol ?? 50) / 100, s.fade !== false);
        break;
      case 'bgmStop': if (state.skipping) state.skipBgm = null; else stopBgm(BGM_FADE); break;
      case 'sfx': if (!state.skipping && s.src) playSound(s.src, Number(s.vol ?? 100) / 100); break;
      case 'end': finish(s.title || ''); break;
    }
  }
  // ---- 演出地圖：同一段回憶裡換場景。換過去之後大家先不在場（要再用「角色出現」放進來），鏡頭先拍整張地圖 ----
  function gotoMap(id) {
    if (!id || (MAP && MAP.id === id)) return true;
    let index = mapList().findIndex(m => m.id === id);
    if (index < 0 && PREVIEW) {   // 預覽只載入一張地圖：把要換的那張放進去
      const m = (typeof MAP_DATA_STORY !== 'undefined' ? MAP_DATA_STORY : []).find(x => x.id === id); if (!m) return false;
      PREVIEW.map = m; index = 0;
    }
    if (index < 0) return false;
    const dark = LIGHT.enabled;
    MAP_INDEX = index; initMap();   // window.STORY_MODE 照樣開著（這張地圖也是這段劇情用的）
    LIGHT.enabled = dark;           // 後室黑幕開著的話繼續開著
    return true;
  }
  // ---- 怪物：用遊戲本身的怪物（js/game.js 的 createMonster、js/render.js 的 drawEnemy），只是不打架、不畫血條 ----
  const monster = no => state.monsters.find(e => e.no === Number(no) && !e.dying);
  const dropMonster = e => { const i = state.monsters.indexOf(e); if (i >= 0) state.monsters.splice(i, 1); };
  function faceMonster(e, face) {   // 正面：走路圖；朝左、朝右：有側面圖的用側面圖，沒有的左右翻
    if (face === 'left' || face === 'right') { e.animSide = true; e.faceRight = face === 'right'; }
    else if (face === 'front') { e.animSide = false; e.showBack = false; }
  }
  function showMonster(s) {
    const spec = typeof ACTIVE_MONSTERS !== 'undefined' && ACTIVE_MONSTERS.find(m => m.id === s.type);
    if (!spec || !s.at) { if (s.type) console.warn('劇情怪物不存在：' + s.type); return; }
    let e = monster(s.mon);
    if (e && e.type !== s.type) { dropMonster(e); e = null; }   // 同一個代號換了另一種怪物：重新做一隻
    if (!e) {
      e = Object.assign(createMonster(spec, 0, 0, 'normal'), { no: Number(s.mon), hideBar: true, alpha: 1, fade: 0, path: [], target: null, speed: 40 });   // 史萊姆固定用普通的（不隨機變成巨型、自爆…）
      state.monsters.push(e);
      if (!state.skipping) { e.alpha = 0; e.fade = 1; }
    } else if (e.fade < 0) e.fade = state.skipping ? 0 : 1;
    e.x = e.animX = s.at[0] * CELL; e.y = e.animY = s.at[1] * CELL; e.target = null; e.path = [];
    faceMonster(e, s.face || 'front');
  }
  function moveMonster(e, s, sec) {
    if (!s.at) return;
    const tx = s.at[0] * CELL, ty = s.at[1] * CELL;
    if (sec <= 0 || state.skipping) { e.x = e.animX = tx; e.y = e.animY = ty; e.target = null; e.path = []; return; }
    e.path = findRoute(e.x, e.y, tx, ty);
    let len = 0, px = e.x, py = e.y; for (const [x, y] of e.path) { len += Math.hypot(x - px, y - py); px = x; py = y; }
    e.speed = Math.max(1, len / sec); e.target = e.path.shift();
    state.moveWait = e; state.waitUntil = state.time + sec;   // 等牠走到才跑下一行
  }
  // 攻擊：朝面向的那邊揮一下（有攻擊圖的怪物照遊戲的揮擊動畫；沒有的往前撲一下），打下去時出現斬擊和衝擊
  function attackMonster(e) {
    if (state.skipping) return;
    const right = !!e.faceRight, art = !!(e.frames && (e.frames.attack || e.frames.attackRig));
    e.atk = { t: 0, art, right, hit: false, wind: art ? MONSTER_SWING.windup : MON_LUNGE.windup };
    if (art) e.swing = { at: performance.now() / 1000, right };
  }
  function strike(e) {
    const tx = e.x + (e.atk.right ? 1 : -1) * CELL * 1.3, ty = e.y, ang = Math.atan2(ty - e.y, tx - e.x);
    if (typeof spawnMeleeSlash === 'function') spawnMeleeSlash(tx - Math.cos(ang) * 10, ty - 14, ang, true, e.undying ? 'dark' : 'purple');
    if (typeof spawnMeleeImpact === 'function') spawnMeleeImpact(tx, ty - 10, true);
    if (!state.shake) state.shake = { t: 0, dur: .15, amp: SHAKE_PX[1] };
  }
  const lungeX = e => {   // 沒有攻擊圖的怪物：先往後縮、再往前撲、再退回來（像素）
    const a = e.atk; if (!a || a.art) return 0;
    const dir = a.right ? 1 : -1, L = MON_LUNGE;
    if (a.t < L.windup) return -dir * 4 * smooth(a.t / L.windup);
    if (a.t < L.windup + L.strike) return dir * (-4 + 16 * (a.t - L.windup) / L.strike);
    return dir * 12 * (1 - smooth(Math.min(1, (a.t - L.windup - L.strike) / L.back)));
  };
  // 死亡：倒下、慢慢變黑、淡出（跟遊戲裡鳥頭人倒下一樣，js/bird-head.js 的 drawFallCorpse）；史萊姆這種沒有走路圖的：壓扁變黑消失
  function killMonster(e) {
    e.target = null; e.path = []; e.atk = null; e.swing = null;
    if (state.skipping) { dropMonster(e); return; }
    if (state.moveWait === e) state.moveWait = null;
    const img = monsterImage(e.lastFrameFile || e.frames?.front || e.sprite || 'images/monster/Monster_Slime.png');
    e.dying = { fall: !!e.frames, img, x: e.x, y: e.y, w: e.drawWidth || 42, h: e.drawHeight || 33, t: 0, life: MON_DIE, dir: e.faceRight ? 1 : -1, flip: !!e.lastFrameFlip };
  }
  function tickMonster(e, dt) {
    if (e.fade) {
      e.alpha += e.fade * dt / SHOW_FADE;
      if (e.alpha >= 1) { e.alpha = 1; e.fade = 0; }
      if (e.alpha <= 0) { dropMonster(e); return; }
    }
    if (e.dying) {
      const c = e.dying; c.t += dt; c.life -= dt;
      if (c.fall && !c.landed && c.t >= .45) { c.landed = true; G.effects.push({ ring: true, x: c.x + c.dir * c.h * .45, y: c.y + 10, r: 6, r2: 30, life: .3, life0: .3, color: '#b9b2a2' }); }   // 倒地揚起灰塵
      if (c.life <= 0) dropMonster(e);
      return;
    }
    if (e.hitT > 0) e.hitT -= dt;
    if (e.atk) { const a = e.atk; a.t += dt; if (!a.hit && a.t >= a.wind) { a.hit = true; strike(e); } if (a.t >= a.wind + (a.art ? MONSTER_SWING.strike + MONSTER_SWING.recover : MON_LUNGE.strike + MON_LUNGE.back)) e.atk = null; }
    if (e.target) {   // 走路（走路圖由 drawEnemy 依位置變化自動換、自動轉向）
      const dx = e.target[0] - e.x, dy = e.target[1] - e.y, d = Math.hypot(dx, dy), step = dt * e.speed;
      if (d <= step) { [e.x, e.y] = e.target; e.target = e.path.shift() || null; } else { e.x += dx / d * step; e.y += dy / d * step; }
    }
  }
  function drawMonster(e) {
    ctx.save(); ctx.globalAlpha = clamp(e.alpha, 0, 1);
    const c = e.dying;
    if (c && c.fall && typeof drawFallCorpse === 'function') { ctx.imageSmoothingEnabled = false; drawFallCorpse(ctx, c); }
    else if (c) {   // 壓扁、變黑、淡出
      const k = Math.min(1, c.t / .35), img = c.img;
      if (readyImage(img)) {
        ctx.globalAlpha *= Math.min(1, c.life / .8); ctx.translate(c.x, c.y + 13); ctx.scale(1 + .35 * k, 1 - .7 * k); ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, -c.w / 2, -c.h, c.w, c.h);
        const black = typeof flashSprite === 'function' && flashSprite(img, '#07090c');
        if (black) { ctx.globalAlpha *= Math.min(.9, c.t / .6); ctx.drawImage(black, -c.w / 2, -c.h, c.w, c.h); }
      }
    } else { ctx.translate(lungeX(e), 0); drawEnemy(e); }
    ctx.restore();
  }
  // ---- 道具：背包裡的物品放在地上（圖跟背包一樣），出現、消失時淡入淡出 ----
  function showItem(s) {
    const def = typeof itemById === 'function' ? itemById(s.id) : null;
    if (!def || !def.image || !s.at) return;
    const old = state.items.find(x => x.no === Number(s.item)); if (old) state.items.splice(state.items.indexOf(old), 1);
    const img = new Image(); img.src = def.image;
    state.items.push({ no: Number(s.item), id: s.id, img, x: s.at[0] * CELL, y: s.at[1] * CELL, alpha: state.skipping || old ? 1 : 0, fade: state.skipping || old ? 0 : 1 });
  }
  function tickItem(it, dt) {
    if (!it.fade) return;
    it.alpha += it.fade * dt / SHOW_FADE;
    if (it.alpha >= 1) { it.alpha = 1; it.fade = 0; }
    if (it.alpha <= 0) state.items.splice(state.items.indexOf(it), 1);
  }
  function drawItem(it) {
    if (!readyImage(it.img)) return;
    const k = ITEM_SIZE / Math.max(it.img.naturalWidth, it.img.naturalHeight), w = it.img.naturalWidth * k, h = it.img.naturalHeight * k;
    const bob = Math.sin(state.time * 2.5 + it.x * .05);   // 輕輕上下浮動（跟地上的東西一樣）
    ctx.save(); ctx.globalAlpha = clamp(it.alpha, 0, 1);
    ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(it.x, it.y + 2, ITEM_SIZE * .36, ITEM_SIZE * .13, 0, 0, Math.PI * 2); ctx.fill();   // 影子
    ctx.imageSmoothingEnabled = false; ctx.drawImage(it.img, it.x - w / 2, it.y - h + 2 + bob, w, h);
    ctx.restore();
  }
  function changeMap(id) {
    if (MAP && MAP.id === id) return;
    if (!gotoMap(id)) { console.warn('演出地圖找不到：' + id); return; }
    for (const a of state.actors) { a.hidden = true; a.fade = 0; a.alpha = 1; a.target = null; a.path = []; a.moving = false; }
    state.monsters = []; state.items = [];   // 怪物、道具也留在上一個場景
    state.moveWait = null; state.camMove = null;
    state.cam = { x: COLS / 2, y: ROWS / 2, w: VIEW_W / Math.max(.1, VIEW_SCALE) / CELL };
    state.lights = lights();
    G.mapDestroyed = new Set(); G.effects = [];
  }
  function camOf(s) { return { x: s.at[0], y: s.at[1], w: Number(s.w) > 0 ? Number(s.w) : state.cam.w }; }
  function fade(f, to, sec) { f.from = level(f); f.to = to; f.t = 0; f.dur = state.skipping ? 0 : sec; }
  const level = f => f.dur > 0 ? f.from + (f.to - f.from) * Math.min(1, f.t / f.dur) : f.to;

  // ---- 玩家點一下／按 Space：對白打完字 → 下一行 ----
  function next() {
    if (!state?.playing || state.ending) return;
    const t = state.talk; if (!t) return;
    if (typeof sfx === 'function') sfx('blip');
    const n = Array.from(t.step.text || '').length;
    if (t.chars < n) { t.chars = n; renderText(); return; }
    state.talk = null;
    run();
    if (!state.talk) showBox(false);
  }
  // ---- 結局：畫面慢慢變黑；有標題就出現標題畫面，沒有就直接回到原本的地圖 ----
  function finish(title) {
    if (state.ending) return;
    state.talk = null; showBox(false);
    state.ending = { t: 0, title, from: level(state.black) };
    stopBgm(BGM_FADE);
  }

  // ---- 每一幀 ----
  function tick(dt) {
    if (!state) return;
    if (document.hidden) dt = 0;
    if (state.playing) {
      state.time += dt;
      for (const f of [state.black, state.white]) f.t += dt;
      if (state.camMove) {
        const m = state.camMove; m.t += dt; const k = smooth(Math.min(1, m.t / m.dur));
        state.cam = { x: m.from.x + (m.to.x - m.from.x) * k, y: m.from.y + (m.to.y - m.from.y) * k, w: m.from.w + (m.to.w - m.from.w) * k };
        if (m.t >= m.dur) state.camMove = null;
      }
      if (state.shake && (state.shake.t += dt) >= state.shake.dur) state.shake = null;
      if (state.talk) {   // 打字速度跟遊戲對話一樣（NPC_TALK.typeSpeed＝每個字幾毫秒）
        const n = Array.from(state.talk.step.text || '').length;
        if (state.talk.chars < n) { state.talk.chars = Math.min(n, state.talk.chars + dt * 1000 / Math.max(5, Number(NPC_TALK.typeSpeed) || 24)); renderText(); }
      }
      if (state.moveWait && !state.moveWait.target && state.time >= state.waitUntil) state.moveWait = null;
      if (state.ending) {
        const e = state.ending; e.t += dt;
        state.black = { from: e.from, to: 1, t: e.t, dur: END_FADE };
        if (e.t >= END_FADE && !state.ended) {
          state.ended = true; state.playing = false; G.phase = 'story-ended';
          if (!e.title && resume) { backToGame(); return; }   // 沒有結局標題：直接回到原本的地圖
          el('storyKaiEndTitle').textContent = e.title || '回憶結束';
          el('storyKaiEnd').hidden = false; el('storyKaiEnd').querySelector('button:not([hidden])')?.focus();
        }
      } else run();
    }
    if (!state) return;
    for (const a of state.actors) tickActor(a, dt);
    for (const e of [...state.monsters]) tickMonster(e, dt);
    for (const it of [...state.items]) tickItem(it, dt);
    for (const f of state.fx) f.t += dt;
    state.fx = state.fx.filter(f => f.t < fxTime(f));
    updateWorldEffects(dt); updateLightFlashes(dt);
    if (typeof updateFlickerLights === 'function') updateFlickerLights(dt);
    paintLayers(); applyCam(); draw();
  }
  function tickActor(a, dt) {
    a.anim += dt * (a.animRate || 1);   // 跑步時腳步快一點、慢走時慢一點
    if (a.hopT > 0) a.hopT = Math.max(0, a.hopT - dt);
    tickCharge(a, dt);
    if (a.fade) {
      a.alpha += a.fade * dt / SHOW_FADE;
      if (a.alpha >= 1) { a.alpha = 1; a.fade = 0; }
      if (a.alpha <= 0) { a.alpha = 1; a.fade = 0; a.hidden = true; }
    }
    if (a.target) {
      const dx = a.target[0] - a.x, dy = a.target[1] - a.y, d = Math.hypot(dx, dy), step = dt * a.speed;
      a.moving = true;
      if (d <= step) { [a.x, a.y] = a.target; a.target = a.path.shift() || null; if (!a.target) { a.moving = false; if (a.arriveDir) a.dir = a.arriveDir; } }
      else { a.x += dx / d * step; a.y += dy / d * step; a.dir = Math.abs(dx) > Math.abs(dy) ? dx < 0 ? 'left' : 'right' : dy < 0 ? 'back' : 'front'; }
    }
    if (a.hidden || a.moving) a.blinkTime = -1; else updateBlink(a, dt);
  }
  function paintLayers() {
    if (!ui) return;
    el('storyKaiBlack').style.opacity = String(level(state.black));
    el('storyKaiWhite').style.opacity = String(level(state.white));
    el('storyKaiVignette').style.opacity = state.vignette > 0 ? '1' : '0';
  }
  // 鏡頭：中心點＋寬度（格數），高度照 16:9；縮放＝遊戲畫面寬度 ÷ 鏡頭寬度
  function applyCam() {
    const c = state.cam;
    VIEW_SCALE = VIEW_W / (Math.max(2, c.w) * CELL);
    cam.x = c.x * CELL - viewW() / 2; cam.y = c.y * CELL - viewH() / 2;
    if (state.shake) { const k = state.shake.amp * (1 - .6 * state.shake.t / state.shake.dur); cam.x += rnd(-1, 1) * k / VIEW_SCALE; cam.y += rnd(-1, 1) * k * .7 / VIEW_SCALE; }
    if (state.sway) { const t = state.time; cam.x += (Math.sin(t * 1.3) + Math.sin(t * 2.1 + 1) * .4) * state.sway / VIEW_SCALE; cam.y += (Math.cos(t * 1.1 + .5) + Math.sin(t * 1.7) * .3) * state.sway * .6 / VIEW_SCALE; }
  }

  // ---- 繪圖 ----
  // 集氣：腳下法陣、身邊收束的光圈和電火花（跟舊劇情、遊戲的大招蓄力同一種畫法）
  function tickCharge(a, dt) {
    if (!a.charging || a.hidden) { if (a.sigil) { a.sigil.life = Math.min(a.sigil.life, .3); a.sigil = null; } a.chargeT = 0; return; }
    a.chargeT = (a.chargeT || 0) + dt;
    const k = Math.min(1, a.chargeT / 2.5);
    const col = (typeof ULT_CHARGE_COLOR !== 'undefined' && ULT_CHARGE_COLOR[a.cast.char]) || '#aee9ff';
    if (!a.sigil) { a.sigil = { sootheSigil: true, follow: a, col: typeof hexRgb === 'function' ? hexRgb(col) : [174, 233, 255], life: 999, life0: 999, spin: 0 }; G.effects.push(a.sigil); }
    if ((a.chargeFx = (a.chargeFx || 0) - dt) <= 0) { a.chargeFx = .45 - .2 * k; if (typeof spawnChargeFx === 'function') spawnChargeFx(a.x, a.y - 12, col); }
    if (k > .5 && Math.random() < dt * 3 * k && typeof addLightFlash === 'function') addLightFlash('lightning', a.x, a.y - 12, .5 * k);
    if (Math.random() < dt * (14 + 26 * k)) {
      const t = Math.random() * Math.PI * 2, d = rnd(14, 30 + 16 * k);
      G.effects.push({ particle: true, kind: 'lightning', x: a.x + Math.cos(t) * d, y: a.y - 12 + Math.sin(t) * d * .8, vx: -Math.cos(t) * 40, vy: -Math.sin(t) * 40, r: rnd(1.4, 2.6), life: rnd(.15, .3), life0: .3, color: '#cbf2ff' });
    }
  }
  function drawActor(a) {
    const size = PLAYER.drawSize;
    // 持槍：有持槍圖（GUN_FOLDERS）就用持槍圖；拿近戰武器的人擺出舉著武器的樣子
    const weapon = a.armed && !a.down && MELEE_WEAPON[a.cast.char];
    const pose = { ...a, sitting: null, gunT: a.armed && !weapon ? 1 : 0, meleeSwing: weapon ? { angle: FACE_ANGLE[a.dir] ?? Math.PI / 2, age: 0, wind: 1, impact: 2, duration: 3 } : null };
    const set = (a.hurt && hurtSet(a)) || a.set;
    let img = a.down && readyImage(a.set.fail) ? a.set.fail : pickCharacterFrame(set, pose);
    if (!readyImage(img)) img = a.set.front?.[0];
    if (!readyImage(img)) return;
    const shiver = a.tremble ? Math.sin(state.time * 70 + a.x) * a.tremble : 0;
    const zap = a.charging ? Math.sin(state.time * 60) * .6 : 0;   // 集氣：全身微微發抖
    const hk = a.hopT > 0 ? 1 - a.hopT / HOP_TIME : 0;
    const swayX = a.sway ? (Math.sin(state.time * 1.3 + a.no) + Math.sin(state.time * 2.1 + 1 + a.no) * .4) * a.sway : 0;
    const x = Math.round(a.x) + shiver + zap + swayX, top = a.y - size + 18 - (hk ? Math.sin(hk * Math.PI) * 5 : 0);
    ctx.save(); ctx.globalAlpha = clamp(a.alpha, 0, 1); ctx.imageSmoothingEnabled = false;
    const id = a.cast.char;
    if (a.equip && typeof drawCostumeAccessories === 'function') drawCostumeAccessories(ctx, id, a, x - size / 2, top, size, 'behind', a.equip);
    if (a.set.single) { const w = size * img.naturalWidth / img.naturalHeight; ctx.drawImage(img, x - w / 2, top, w, size); }   // 圖片角色：照原本比例、跟人一樣高
    else if (a.down && img !== a.set.fail) { ctx.save(); ctx.translate(x, a.y + 14); ctx.rotate(Math.PI / 2); ctx.drawImage(img, -size / 2, -size + 4, size, size); ctx.restore(); }   // 沒有倒地圖：整個人轉 90 度躺下
    else ctx.drawImage(img, x - size / 2, top, size, size);
    if (weapon && typeof drawSwingWeapon === 'function') { const im = weapon[0](); if (im) drawSwingWeapon({ ...pose, x: x, y: a.y }, im, weapon[1], weapon[2], weapon[3], weapon[4]); }
    if (a.equip && typeof drawCostumeAccessories === 'function') drawCostumeAccessories(ctx, id, a, x - size / 2, top, size, 'front', a.equip);
    ctx.restore();
  }
  const fxTime = f => Math.max(.1, Number(f.def?.time) || 2);
  function fxInfo(f) {
    const [bx, by, bw, bh] = f.step.box, x = bx * CELL, y = by * CELL, w = bw * CELL, h = bh * CELL;
    return { t: f.t, x, y, w, h, cx: x + w / 2, cy: y + h / 2 };
  }
  function drawFx(layer) {
    for (const f of state.fx) {
      const k = Math.min(1, f.t / fxTime(f)), info = fxInfo(f);
      if (!f.def) { if (layer === 'top') drawFxPlaceholder(k, info); continue; }
      if ((f.def.layer || 'top') !== layer) continue;
      ctx.save();
      try { f.def.draw(ctx, k, info); } catch (e) { console.warn('特效出錯：' + f.step.id, e); f.def = null; }
      ctx.restore();
    }
  }
  // 還沒做好的特效：框的中心冒一圈淡淡的光（預覽時另外標出範圍和「特效製作中」）
  function drawFxPlaceholder(k, f) {
    const r = Math.max(f.w, f.h) / 2 * (.3 + .7 * k);
    ctx.save(); ctx.globalAlpha = (1 - k) * .6;
    const g = ctx.createRadialGradient(f.cx, f.cy, 0, f.cx, f.cy, r);
    g.addColorStop(0, 'rgba(255,240,200,.9)'); g.addColorStop(1, 'rgba(255,240,200,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(f.cx, f.cy, r, 0, Math.PI * 2); ctx.fill();
    if (isPreview()) {
      ctx.globalAlpha = .8; ctx.setLineDash([8, 6]); ctx.strokeStyle = '#ffd479'; ctx.lineWidth = 2; ctx.strokeRect(f.x, f.y, f.w, f.h);
      ctx.setLineDash([]); ctx.font = 'bold 14px "Microsoft JhengHei", sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#ffd479';
      ctx.fillText('特效製作中', f.cx, f.cy);
    }
    ctx.restore();
  }
  function draw() {
    if (!state) return;
    lightsCache = [...state.lights, ...(typeof flickerLightSources === 'function' ? flickerLightSources() : []), ...(typeof poweredLightSources === 'function' ? poweredLightSources() : [])];
    computeLightField(); computeFlashField();
    ctx.clearRect(0, 0, cv.width, cv.height); ctx.save();
    ctx.scale(VIEW_SCALE, VIEW_SCALE); ctx.translate(-cam.x, -cam.y); ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#000'; ctx.fillRect(cam.x, cam.y, viewW(), viewH());
    drawMapGround(ctx);
    const sortables = []; collectMapOccluders(ctx, sortables);
    for (const a of state.actors) if (!a.hidden) sortables.push({ y: a.y + 17, draw: () => drawActor(a) });
    for (const e of state.monsters) sortables.push({ y: e.y + 13, draw: () => drawMonster(e) });
    for (const it of state.items) sortables.push({ y: it.y + 10, draw: () => drawItem(it) });
    sortables.sort((p, q) => p.y - q.y).forEach(s => s.draw());
    drawMapTop(ctx);
    drawWorldEffects();
    drawFx('world');
    drawDarkness();
    if (typeof drawPoweredLights === 'function') drawPoweredLights(ctx);
    if (typeof drawFlickerLights === 'function') drawFlickerLights(ctx);
    drawFx('top');
    ctx.restore();
  }

  // ---- 背景音樂、音效（音檔在專案資料夾裡，例如 music/xxx.mp3）----
  let bgm = null;
  function fadeAudio(a, to, sec, done) {
    clearInterval(a._fade);
    const from = a.volume, t0 = performance.now();
    if (!(sec > 0)) { a.volume = to; done?.(); return; }
    a._fade = setInterval(() => {
      const k = Math.min(1, (performance.now() - t0) / (sec * 1000));
      a.volume = from + (to - from) * k;
      if (k >= 1) { clearInterval(a._fade); done?.(); }
    }, 40);
  }
  function startBgm(src, vol, fadeIn) {
    stopBgm(0);
    const a = bgm = new Audio(src); a.loop = true; a.volume = 0; a._want = clamp(vol, 0, 1);
    a.play().catch(() => {});
    fadeAudio(a, muted() ? 0 : a._want, fadeIn ? BGM_FADE : 0);
  }
  function stopBgm(sec) {
    const a = bgm; bgm = null; if (!a) return;
    if (!sec) { clearInterval(a._fade); a.pause(); return; }
    fadeAudio(a, 0, sec, () => a.pause());
  }
  function playSound(src, vol) {
    if (muted()) return;
    const a = new Audio(src); a.volume = clamp(vol * sfxMaster(), 0, 1); a.play().catch(() => {});
  }

  // ---- 離開、回到遊戲 ----
  function clearInput() {
    if (typeof keys !== 'undefined') for (const k of Object.keys(keys)) keys[k] = false;
    if (typeof mouse !== 'undefined') { mouse.down = false; mouse.left = false; }
  }
  function leave() {
    if (!state && !ui) return;
    stopBgm(0); clearInput(); state = null;
    if (ui) { ui.hidden = true; el('storyKaiEnd').hidden = true; }
    document.body.classList.remove('story-scene');
    if (box()) { box().classList.add('hidden'); box().classList.remove('story-narration', 'story-noface', 'story-kai-shake'); }
  }
  function exit() {
    if (resume) { backToGame(); return; }
    if (window.parent !== window) { window.parent.postMessage({ storyKai: 'close' }, '*'); return; }   // 編輯器裡的預覽視窗：請編輯器關掉
    location.href = location.pathname;
  }
  // 從遊戲裡進入回憶（js/memory-doors.js）：做法跟 js/story-scene.js 的 playFromGame 一樣，
  // 先把目前的地圖、戰場整份記下來，換到劇情地圖播放；看完換回原地圖、把記下來的放回去
  function playFromGame(id, onDone) {
    const scene = scenes()[id], index = scene ? mapList().findIndex(m => m.id === scene.map) : -1;
    if (index < 0) return false;
    resume = { index: MAP_INDEX, G, walls: mapWalls, doors: mapDoors, doorWalls: doorAddedWalls, offsets: mapSolidOffsets,
      power: new Set(mapPowerOn), elevator: openElevatorStamp, onDone };
    forcedId = id;
    clearInput();
    MAP_INDEX = index; initMap();   // window.STORY_MODE 會在這裡打開
    start();
    return true;
  }
  function backToGame() {
    const r = resume; if (!r) return;
    leave(); forcedId = null; resume = null;
    MAP_INDEX = r.index; initMap();
    G = r.G; mapWalls = r.walls; mapDoors = r.doors; doorAddedWalls = r.doorWalls; mapSolidOffsets = r.offsets;
    poweredMap = MAP; mapPowerOn = r.power; openElevatorStamp = r.elevator;
    occCache = null; occCacheFor = null;
    if (typeof reclaimAddedWalls === 'function') reclaimAddedWalls();
    computeFlow(); updateCamera(); updateHUD();
    r.onDone?.(null);
  }

  // ---- 按鍵、滑鼠：播放中擋住遊戲的操作，只處理劇情自己的 ----
  const on = () => !!window.STORY_MODE && !!window.STORY_KAI_ON;
  const wakeSound = () => { if (typeof SFX !== 'undefined') SFX.unlock?.(); if (bgm && bgm.paused) bgm.play().catch(() => {}); };
  function action(name) { if (name === 'exit') exit(); else if (name === 'replay') start(); }
  window.addEventListener('keydown', e => {
    if (!on()) return;
    wakeSound();
    if (['F5', 'F9', 'F12'].includes(e.key) || ((e.ctrlKey || e.metaKey) && ['r', 'l', 'w'].includes(e.key.toLowerCase()))) return;
    e.preventDefault(); e.stopImmediatePropagation();
    if (e.repeat) return;
    if (e.key === ' ' || e.key === 'Enter') {
      const b = document.activeElement?.closest('[data-kai-action]');
      if (b && b.getClientRects().length) action(b.dataset.kaiAction); else if (state?.playing) next(); else if (!state?.ended) start();
    }
  }, true);
  window.addEventListener('keyup', e => { if (on()) { e.preventDefault(); e.stopImmediatePropagation(); } }, true);
  for (const type of ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'contextmenu', 'wheel', 'dblclick', 'touchstart']) {
    window.addEventListener(type, e => { if (on()) wakeSound(); if (on() && el('wrap')?.contains(e.target) && !e.target.closest('[data-kai-action]')) { e.preventDefault(); e.stopImmediatePropagation(); } }, { capture: true, passive: false });
  }
  window.addEventListener('click', e => {
    if (!on()) return;
    const b = e.target.closest('[data-kai-action]');
    if (b) { e.preventDefault(); e.stopImmediatePropagation(); action(b.dataset.kaiAction); }
    else if (state?.playing && el('wrap')?.contains(e.target)) { e.preventDefault(); e.stopImmediatePropagation(); next(); }
  }, true);
  const listener = () => state && { x: cam.x + viewW() / 2, y: cam.y + viewH() / 2 };
  return { has, current, isPreview, previewScene, config, prepare, start, tick, draw, leave, listener, playFromGame, ownsStamp: () => false, debug: () => state };   // debug：測試時在主控台看播放狀態
})();

// ---- 接到遊戲：遊戲只呼叫 StoryScene，播的是「改」版劇情時轉給 StoryKai，其他照舊交給 js/story-scene.js ----
// window.STORY_KAI_ON＝現在播的是「改」版（js/story-scene.js 看到它就不處理按鍵）
(() => {
  const base = { ...StoryScene };
  StoryScene.active = () => !!window.STORY_MODE;   // 遊戲問「現在在播劇情嗎」：兩種劇情都算（js/story-scene.js 自己的按鍵處理另外判斷）
  StoryScene.previewScene = () => StoryKai.isPreview() ? StoryKai.previewScene() : base.previewScene();
  StoryScene.config = () => {
    if (StoryKai.current()) { const c = StoryKai.config(); window.STORY_KAI_ON = !!c; return c; }
    window.STORY_KAI_ON = false; return base.config();
  };
  for (const k of ['prepare', 'start', 'tick', 'draw', 'listener', 'ownsStamp']) StoryScene[k] = (...a) => (window.STORY_KAI_ON ? StoryKai : base)[k](...a);
  StoryScene.leave = () => { StoryKai.leave(); base.leave(); };
  StoryScene.playFromGame = (id, done) => StoryKai.has(id) ? StoryKai.playFromGame(id, done) : base.playFromGame(id, done);
})();
