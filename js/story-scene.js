/* 純劇情播放器：獨立時鐘、演員與繪圖，不跑戰鬥或行軍床 AI。
   背景群演（開槍的哨兵、揮擊的生命體、走動的嚮導）只有動作與特效，不會造成傷害。
   在輸入程式前載入；所有遊戲狀態只在 prepare/start 後存取。
   劇情資料在 data/story-scenes.js（🎬 劇情編輯器編輯）；每段劇情用 map 指定在哪張劇情地圖演出。
   網址：?storyPreview=1（第一段）或 ?storyPreview=劇情id；&storyDraft=1 用劇情編輯器還沒存檔的草稿；&storyFrom=N 從第 N 頁開始。 */
const StoryScene = (() => {
  let state = null, ui = null, sceneCache = null;
  let forcedId = null, resume = null;   // 從遊戲裡的記憶之門進來：播哪段、看完要回去的地圖與戰場（playFromGame）
  const DRAFT_KEY = 'tudrc_story_scenes_v1';   // 劇情編輯器的暫存
  const params = new URLSearchParams(location.search);
  function scenes() {
    if (sceneCache) return sceneCache;
    let all = typeof STORY_SCENES !== 'undefined' ? STORY_SCENES : {};
    if (params.get('storyDraft') === '1') try { const d = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null'); if (d && typeof d === 'object') all = d; } catch (_) {}
    return (sceneCache = all);
  }
  function previewScene() {   // 網址指定要預覽的那一段（沒指定就第一段）
    const id = params.get('storyPreview'); if (!id) return null;
    const all = scenes();
    return all[id] || Object.values(all)[0] || null;
  }
  const config = () => {
    if (typeof MAP === 'undefined' || !MAP) return null;
    const want = forcedId ? scenes()[forcedId] : previewScene();
    return want && want.map === MAP.id ? want : Object.values(scenes()).find(s => s.map === MAP.id) || null;
  };
  const active = () => !!window.STORY_MODE;
  const el = id => document.getElementById(id);
  const readyImage = im => im?.complete && im.naturalWidth;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const image = src => { const im = new Image(); im.src = src; return im; };
  // 找路：地圖的不可穿透格（含床）做 8 方向格線搜尋，再把看得到的轉角拉直，人才不會一格一格轉彎
  const open = (c, r) => inGrid(c, r) && !isWall(c, r);
  function clearLine(x1, y1, x2, y2) {   // 腳底一小塊範圍沿直線走過去都不碰到牆
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
        if (dc && dr && !(open(c + dc, r) && open(c, r + dr))) continue;   // 斜走不切牆角
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
  function walkTo(a, p) { a.path = findRoute(a.x, a.y, p[0] * CELL, p[1] * CELL); a.target = a.path.shift(); }
  // 路人哨兵的持槍圖、受傷躺床圖（檔名跟主角的 _withgun 不同，另外載入）
  const MOB_B_EXTRA = { gunLeft: 'mobB_0003_Leftside_gun.png', gunRight: 'mobB_0006_right-side_gun.png' };
  const spriteCache = {};
  function sprites(name) {
    if (spriteCache[name]) return spriteCache[name];
    const set = loadCharacterSprites(name);
    if (name === 'mob_B') {
      for (const k in MOB_B_EXTRA) set[k] = [image('images/character/mob_B/' + MOB_B_EXTRA[k])];
      set.wounded = image('images/character/mob_B/mobB_0012_wounded.png');
    }
    if (name === 'red_B') {
      set.woundedOpen = image('images/character/red_B/redB_0000_Front_hurt.png');
      set.wounded = image('images/character/red_B/redB_0012_closeeyes_hurt.png');
    }
    return (spriteCache[name] = set);
  }
  function imageSet(src) {   // 只有一張圖的路人（例如家屬的背影）：每個方向、走路、眨眼都用同一張
    if (spriteCache[src]) return spriteCache[src];
    const im = image(src), one = [im, im, im];
    return (spriteCache[src] = { front: one, back: one, left: one, right: one, blink: one, single: true });
  }
  const extraImages = {};
  const imageOnce = src => extraImages[src] || (extraImages[src] = image(src));
  function ensureUI() {
    if (ui) return;
    ui = document.createElement('section'); ui.id = 'storySceneUI';
    ui.setAttribute('aria-label', '回憶劇情');
    ui.innerHTML = '<div id="storyVignette" aria-hidden="true"></div><header class="story-head"><div><small id="storySubtitle"></small><h1 id="storyTitle"></h1></div><button type="button" data-story-action="exit" id="storyExitTop">離開預覽</button></header><div id="storyFade" aria-hidden="true"></div><button id="storyAudioStart" type="button" data-story-action="opening" hidden>點一下開始回憶</button><section id="storyEnd" hidden><small>回憶片段結束</small><h2 id="storyEndTitle"></h2><p id="storyEndText"></p><div><button type="button" data-story-action="replay">重新播放</button><button type="button" data-story-action="exit" id="storyExitEnd">返回開始畫面</button></div></section>';
    el('wrap').appendChild(ui);
  }
  // 對話直接用遊戲裡的正式對話框（#dialogueBox）；翻頁與打字由劇情自己控制，不經過 dialogueState
  const box = () => el('dialogueBox');
  function showBox(on) {
    box().classList.toggle('hidden', !on);
    if (on) { el('dialogueText').classList.remove('line-in'); void el('dialogueText').offsetWidth; el('dialogueText').classList.add('line-in'); }
  }
  function setSpeaker(beat) {   // 頭像用說話者的正面圖；旁白（沒有 speaker）不放頭像
    const sprite = beat.speaker && state.cfg.portraits?.[beat.speaker];
    box().classList.toggle('story-narration', !beat.speaker);
    box().classList.toggle('story-noface', !!beat.speaker && !sprite);   // 有名字、沒頭像的人（家屬）：不放頭像，但不是旁白的斜體
    el('dialogueName').textContent = beat.speaker || '';
    if (sprite) {
      const who = state.actors.find(a => a.name === beat.speaker && a.sprite === sprite);
      const set = sprites(sprite);
      const portrait = who ? portraitFrame(who) : null;
      el('dialoguePortrait').src = (portrait || set.front[0]).src; el('dialoguePortrait').alt = beat.speaker;
      el('dialoguePortraitFrame').dataset.char = sprite.replace(/_[A-Z]$/, '');
    }
  }
  // 受傷的雷德只在兩張受傷圖之間切換，避免眨眼時閃回健康的臉。
  function woundedFrame(a) {
    return a.eyesClosed || (a.blinkTime >= .07 && a.blinkTime < .28)
      ? a.set.wounded : a.set.woundedOpen || a.set.wounded;
  }
  function portraitFrame(a) {
    if (a.wounded) return a.eyesClosed ? a.set.wounded : a.set.woundedOpen || a.set.wounded;
    if (a.eyesClosed) return a.set.blink?.[2] || a.set.front[0];
    return a.set.front[0];
  }
  function tickActorBlink(a, dt) {
    if (a.hidden || a.eyesClosed || a.moving || a.target || a.gunT > 0) {
      a.blinkTime = -1;
      return;
    }
    updateBlink(a, dt);
  }
  function clearInput() {
    if (typeof keys !== 'undefined') for (const k of Object.keys(keys)) keys[k] = false;
    if (typeof mouse !== 'undefined') { mouse.down = false; mouse.left = false; }
  }
  function makeActor(a, seats) {
    const seat = a.bed && seats.find(s => s.key.endsWith('@' + a.bed.join(',')));
    if (a.bed && !seat) throw new Error('劇情床位不存在：' + (a.name || a.id) + '（' + a.bed + '）');
    return { ...a, set: a.image ? imageSet(a.image) : sprites(a.sprite), sitting: seat || null,
      x: seat ? seat.x : a.at[0] * CELL, y: seat ? seat.y : a.at[1] * CELL, alpha: 1,
      dir: a.dir || 'front', anim: 0, moving: false, blinkTime: -1, blinkWait: 2 + Math.random() * 4, eyesClosed: !!a.bed };
  }
  // ---- 自動門（door: [欄, 列]＝地圖上門圖章的位置）：劇情自己畫，兩片門板往左右滑開 ----
  // 門圖（images/回憶場景/building_door.png，120×120）裡兩片門板的範圍，單位是圖片像素：
  // box＝門板整塊（左、上、寬、高），也是遮罩，門板滑出這塊就看不到；split＝兩片門板中間的縫（左片 0～57、右片 58～113）
  const DOOR_PANELS = { box: [0, 32, 114, 88], split: 58 }, DOOR_TIME = .8;
  function findDoor(cfg) {
    if (!Array.isArray(cfg.door)) return null;
    const stamp = (MAP.stamps || []).find(s => s.c === cfg.door[0] && s.r === cfg.door[1]);
    return stamp ? { stamp, open: 0, target: 0 } : null;
  }
  const ownsStamp = s => !!state?.door && state.door.stamp === s;   // js/maploader.js 問：這張圖章由劇情自己畫嗎
  function drawDoor() {
    const d = state.door; if (!d) return;
    const s = d.stamp, t = mapTileById(s.id), img = t && tileImage(t); if (!readyImage(img)) return;
    const x = OX + s.c * CELL + (s.ox || 0), y = OY + s.r * CELL + (s.oy || 0), w = mapTileW(t) * CELL, h = mapTileH(t) * CELL;
    const iw = img.naturalWidth, ih = img.naturalHeight, sx = w / iw, sy = h / ih;
    const [bx, by, bw, bh] = DOOR_PANELS.box, cut = DOOR_PANELS.split;
    const k = d.open * d.open * (3 - 2 * d.open);   // 慢慢起步、慢慢停
    ctx.save(); ctx.beginPath(); ctx.rect(x + bx * sx, y + by * sy, bw * sx, bh * sy); ctx.clip();   // 門後直接露出地圖上鋪的地板
    ctx.drawImage(img, bx, by, cut - bx, bh, x + (bx - k * (cut - bx)) * sx, y + by * sy, (cut - bx) * sx, bh * sy);   // 左片往左滑
    ctx.drawImage(img, cut, by, bx + bw - cut, bh, x + (cut + k * (bx + bw - cut)) * sx, y + by * sy, (bx + bw - cut) * sx, bh * sy);   // 右片往右滑
    ctx.restore();
  }
  // 大喊（每頁 shout: { 角色id: true }）：台詞出現的那一刻，那個人頓一下、對話框跟著震一下
  const SHOUT_TIME = .4;
  function shout(beat) {
    const ids = Object.keys(beat.shout || {}).filter(id => beat.shout[id]);
    for (const id of ids) { const a = actor(id); if (a) a.shoutT = SHOUT_TIME; }
    const b = box(); b.classList.remove('story-shout');
    if (ids.length) { void b.offsetWidth; b.classList.add('story-shout'); }
  }
  // 鏡頭 [欄, 列, 縮放]：第三個數字可省略（＝劇情的 zoom），越大拍得越近
  const camZoom = (p, base) => Number(p?.[2]) > 0 ? Number(p[2]) : base;
  // ---- 腳步聲（劇情設定 footsteps: true）：主要角色走路時循環播放，跟遊戲裡玩家走路同一個音檔；跑得快播得快 ----
  const STEP_FILE = 'Sound effects/環境/腳步/footsteps02.mp3';
  let stepAudio = null;
  function updateSteps() {
    const walkers = state?.cfg.footsteps && !state.ended ? state.actors.filter(a => !a.hidden && a.moving && a.role !== 'medic') : [];
    if (!walkers.length) { if (stepAudio && !stepAudio.paused) stepAudio.pause(); return; }
    if (!stepAudio) { stepAudio = new Audio(STEP_FILE); stepAudio.loop = true; }
    const speed = Math.max(...walkers.map(a => a.speed || 26));
    stepAudio.playbackRate = Math.max(.7, Math.min(1.8, speed / 45));
    stepAudio.volume = typeof SFX === 'undefined' ? .4 : Math.min(1, .45 * SFX.volume / .35 * (SFX.gainOf?.('footsteps') ?? 1));
    stepAudio.muted = typeof SFX !== 'undefined' && !SFX.enabled;
    if (stepAudio.paused) stepAudio.play().catch(() => {});
  }
  // 中途的黑幕轉場（screen: 'black'／'clear'，screenFade＝幾秒）
  const screenDark = () => { const sc = state.screen; if (!sc) return 0; const k = Math.min(1, sc.t / sc.dur); return sc.from + (sc.to - sc.from) * k; };
  const screenBusy = () => !!state.screen && state.screen.t < state.screen.dur;
  function finish(auto) {   // 劇情結束：畫面淡黑；auto＝這頁設了 end 秒數，不用等點擊、馬上開始變黑
    state.ending = true; state.beatTime = 0; state.endDelay = auto ? 0 : 1.4; showBox(false); stopBgm(5);
  }
  function makeMonster(m) {
    const spec = ACTIVE_MONSTERS.find(s => s.id === (m.type || 'lifeform'));
    if (!spec) throw new Error('劇情怪物不存在：' + (m.type || 'lifeform'));
    return Object.assign(createMonster(spec, m.at[0] * CELL, m.at[1] * CELL), { id: m.id, hideBar: true, faceRight: m.face === 'right', cd: rnd(.8, 2.6) });
  }
  function prepare() {
    ensureUI(); clearInput();
    const cfg = config();
    if (Number.isFinite(cfg.zoom) && cfg.zoom > 0) VIEW_SCALE = cfg.zoom;
    G = { story: true, phase: 'ready', running: false, over: false, player: null,
      towers: [], npcs: [], enemies: [], obstacles: [], cores: [], effects: [], acidPools: [],
      grid: {}, mapDestroyed: new Set(), lightFlashes: [], selType: null, guide: NaN,
      vitalsSkip: true, moneySettled: true };
    LIGHT.enabled = !!cfg.darkness;
    const seats = mapSeats();
    const actors = [
      ...cfg.actors.map(a => makeActor(a, seats)),
      ...(cfg.wounded || []).map((w, i) => makeActor({ id: 'wounded' + i, sprite: 'mob_B', breathing: true, wounded: true, ...w }, seats)),
      ...(cfg.shooters || []).map((s, i) => makeActor({ id: 'shooter' + i, sprite: 'mob_B', role: 'shooter', gunT: 1, cd: rnd(0, 1.2), ...s }, seats)),
      ...(cfg.medics || []).map((m, i) => makeActor({ id: 'medic' + i, sprite: 'mob_A', role: 'medic', speed: 40,
        at: m.route[0].at, leg: 0, pause: (m.delay || 0) + (m.route[0].wait || 0), dir: m.route[0].face || 'front', ...m }, seats))
    ];
    const cameraKey = cfg.beats[0]?.camera || Object.keys(cfg.cameras || {})[0];
    const baseZoom = VIEW_SCALE;   // 鏡頭沒寫第三個數字（縮放）時用劇情的 zoom
    state = { cfg, actors, monsters: (cfg.monsters || []).map(makeMonster), time: 0, beatTime: 0, index: -1, chars: 0,
      playing: false, ending: false, ended: false, nextAt: 0, cameraKey, camera: [...(cfg.cameras?.[cameraKey] || [COLS / 2, ROWS / 2])],
      heal: false, hush: false, shake: 0, rumble: null, moteT: 0, boomT: cfg.opening?.firstExplosion ?? rnd(3, 6),
      openingBlack: Math.max(0, Number(cfg.opening?.black) || 0), openingFade: Math.max(.1, Number(cfg.opening?.fade) || 1.5), waitingForSound: false,
      door: findDoor(cfg), screen: null, endDelay: 1.4, baseZoom, zoom: camZoom(cfg.cameras?.[cameraKey], baseZoom) };
    VIEW_SCALE = state.zoom;
    document.body.classList.add('story-scene');
    ui.hidden = true;
    el('storyTitle').textContent = cfg.title || ''; el('storySubtitle').textContent = cfg.subtitle || '';
    el('storyEndTitle').textContent = cfg.endTitle || cfg.title || ''; el('storyEndText').textContent = cfg.endText || '';
    el('storyExitTop').textContent = resume ? '離開回憶' : '離開預覽'; el('storyExitEnd').textContent = resume ? '回到現實' : '返回開始畫面';
    showBox(false); el('storyEnd').hidden = true;
    el('storyFade').style.opacity = '1';
    el('storyVignette').style.opacity = String(Math.max(0, Math.min(1, Number(cfg.vignette) || 0)));   // vignette：畫面四周壓暗的強度 0～1
    el('storyAudioStart').hidden = true;
    ui.querySelector('.story-head').style.opacity = '0';
    state.lights = lights();
    positionCamera();
  }
  function start() {
    prepare(); hideOverlay(); ui.hidden = false;
    state.playing = true; G.phase = 'story';
    state.waitingForSound = !!state.cfg.opening && navigator.userActivation?.hasBeenActive === false;
    el('storyAudioStart').hidden = !state.waitingForSound;
    if (!state.waitingForSound) startBgm();
    // G.running 保持 false：成就、自動存檔與戰鬥的外掛不會把演員視作真正隊伍。
    // &storyFrom=N：前面幾頁的走位、轉向一次做完，直接從第 N 頁開始（劇情編輯器調整用）
    const from = Math.min(state.cfg.beats.length, Math.max(1, Number(params.get('storyFrom')) || 1)) - 1;
    state.skipping = true;
    for (let i = 0; i < from; i++) {
      setBeat(i);
      for (const a of state.actors) if (a.target && a.role !== 'medic') {
        [a.x, a.y] = a.path?.length ? a.path[a.path.length - 1] : a.target;
        a.target = null; a.path = []; a.dir = a.arriveDir || a.dir;
      }
      for (const a of state.actors) { if (a.exiting) a.hidden = true; a.exiting = a.fading = false; a.alpha = 1; }
      if (state.door) state.door.open = state.door.target;
      if (state.screen) state.screen.t = state.screen.dur;
    }
    state.skipping = false;
    if (from) {
      const p = state.cfg.cameras?.[state.cameraKey];
      state.camera = p ? [p[0], p[1]] : state.camera; state.zoom = VIEW_SCALE = camZoom(p, state.baseZoom);
      state.time = state.openingBlack + state.openingFade;
    }
    setBeat(from);
  }
  const actor = id => state.actors.find(a => a.id === id);
  function faceToward(a, p) {   // p：[欄, 列]
    const dx = p[0] * CELL - a.x, dy = p[1] * CELL - a.y;
    return Math.abs(dx) > Math.abs(dy) ? dx < 0 ? 'left' : 'right' : dy < 0 ? 'back' : 'front';
  }
  function setBeat(index) {
    state.index = index; state.beatTime = 0; state.chars = 0;
    const beat = state.cfg.beats[index];
    state.shown = false; showBox(false);
    el('dialogueProgress').textContent = (index + 1) + ' / ' + state.cfg.beats.length;
    el('dialogueText').textContent = '';
    state.beatWait = index === 0 ? Math.max(beat.wait || 0, state.openingBlack + state.openingFade) : (beat.wait || 0);
    state.nextAt = state.time + state.beatWait;
    if (beat.camera) state.cameraKey = beat.camera;
    if (beat.screen === 'black' || beat.screen === 'clear') {   // 黑幕：從現在的亮度慢慢變過去
      const from = state.screen ? screenDark() : 0;
      state.screen = { from, to: beat.screen === 'black' ? 1 : 0, t: 0, dur: Math.max(.1, Number(beat.screenFade) || 2) };
    }
    if (state.door && (beat.door === 'open' || beat.door === 'close')) state.door.target = beat.door === 'open' ? 1 : 0;
    // sfx：翻到這頁時播一個音效（js/sfx.js 的名字，例如 storyDoor 自動門）；sfxVolume＝音量倍率；快轉（storyFrom）時不播
    if (beat.sfx && typeof SFX !== 'undefined' && !state.skipping) SFX.play(beat.sfx, Number(beat.sfxVolume) > 0 ? Number(beat.sfxVolume) : 1, beat.sfx + ':story-beat');
    const show = a => { if (a.hidden) { a.hidden = false; a.alpha = 0; } a.fading = false; };   // 先隱藏的人：淡入出現
    for (const id of Object.keys(beat.hide || {})) { const a = actor(id); if (a) { a.hidden = true; a.target = null; a.path = []; a.exiting = a.fading = false; } }
    for (const [id, p] of Object.entries(beat.place || {})) {   // 瞬間移到某處（黑幕轉場時用）
      const a = actor(id); if (!a) continue;
      a.hidden = false; a.alpha = 1; a.fading = a.exiting = false; a.target = null; a.path = []; a.x = p[0] * CELL; a.y = p[1] * CELL;
    }
    for (const [id, v] of Object.entries(beat.speed || {})) { const a = actor(id); if (a && Number(v) > 0) a.speed = Number(v); }
    for (const [id, v] of Object.entries(beat.tremble || {})) { const a = actor(id); if (a) a.tremble = !!v; }
    for (const [id, v] of Object.entries(beat.carry || {})) { const a = actor(id); if (a) a.carry = v || null; }
    for (const [id, p] of Object.entries(beat.move || {})) { const a = actor(id); if (!a) continue; show(a); a.exiting = false; walkTo(a, p); }
    for (const [id, p] of Object.entries(beat.exit || {})) { const a = actor(id); if (!a) continue; show(a); a.exiting = true; walkTo(a, p); }   // 走到那裡後淡出消失（走進門裡）
    for (const [id, d] of Object.entries(beat.face || {})) {   // 方向，或看向某個地點／某個人
      const a = actor(id); if (!a) continue;
      const point = state.cfg.points?.[d], other = !point && actor(d);
      const dir = point ? faceToward(a, point) : other ? faceToward(a, [other.x / CELL, other.y / CELL]) : d;
      a.arriveDir = dir; if (!a.target) a.dir = dir;
    }
    for (const [id, e] of Object.entries(beat.eyes || {})) { const a = actor(id); if (a) a.eyesClosed = e === 'closed'; }
    if ('heal' in beat) state.heal = beat.heal;
    if ('hush' in beat) state.hush = beat.hush;
    setSpeaker(beat);   // 眼睛狀態套用後，頭像才跟著切換睜眼／閉眼受傷圖。
  }
  function next() {
    if (!state?.playing || state.ending || state.time < state.nextAt || screenBusy()) return;   // 黑幕還在變：等它變完才能翻頁
    const beat = state.cfg.beats[state.index], length = Array.from(beat.text).length;
    state.nextAt = state.time + .18;
    if (typeof sfx === 'function') sfx('blip');
    if (state.chars < length) { state.chars = length; renderText(); return; }
    if (state.index + 1 < state.cfg.beats.length) setBeat(state.index + 1);
    else finish(false);   // 畫面淡黑時音樂慢慢收掉
  }
  function renderText() {
    const beat = state.cfg.beats[state.index], chars = Array.from(beat.text);
    const text = chars.slice(0, Math.floor(state.chars)).join('');
    const typing = state.chars < chars.length;
    if (el('dialogueText').textContent !== text) el('dialogueText').textContent = text;
    el('dialogueText').classList.toggle('typing', typing);
    setDialogueNextLabel(typing ? '快速顯示' : state.index === state.cfg.beats.length - 1 ? '結束' : '下一句');
  }
  function positionCamera() {
    const vw = viewW(), vh = viewH(), mw = COLS * CELL, mh = ROWS * CELL;
    cam.x = mw <= vw ? (mw - vw) / 2 : Math.max(0, Math.min(mw - vw, state.camera[0] * CELL - vw / 2));
    // 床邊主角留在對話框上方。
    cam.y = mh <= vh ? (mh - vh) / 2 : Math.max(0, Math.min(mh - vh, state.camera[1] * CELL - vh * .42));
    if (state.shake > 0) { cam.x += rnd(-1, 1) * state.shake; cam.y += rnd(-1, 1) * state.shake * .6; }
    const rb = state.rumble;   // 爆炸的震動：一開始最大，慢慢平息；用兩個不同頻率的波，晃起來比亂跳順
    if (rb) { const k = (1 - rb.t / rb.dur) ** 2 * rb.amp; cam.x += Math.sin(rb.t * 47) * k; cam.y += Math.cos(rb.t * 39 + 1) * k * .7; }
  }
  // 音效：跟遊戲的 sfxAt 一樣的音量與距離衰減，只是「聽的人」換成鏡頭中心（劇情裡沒有玩家）。
  // hush（槍聲變稀疏）時整體再小聲一點；source 讓每個人各自限制連發，不會互相吃掉聲音
  function playSfx(name, gain, x, y, source) {
    if (typeof SFX === 'undefined') return;
    const d = Math.hypot(x - (cam.x + viewW() / 2), y - (cam.y + viewH() * .42)) / CELL;
    const k = (d <= 2 ? 1 : Math.max(0, (16 - d) / 14)) * (state.hush ? .4 : 1);
    if (k > 0) SFX.play(name, gain * k, name + ':story-' + source);
  }
  // ---- BGM：bgm＝音樂檔（music/ 資料夾）、bgmVolume＝音量 0～1；整段循環，開始淡入、結尾淡出 ----
  // 遊戲本身的背景音樂（js/music.js）是關著的，劇情自己播；按 M 靜音時也不出聲
  let bgm = null;
  const bgmTarget = () => (typeof SFX !== 'undefined' && !SFX.enabled) ? 0 : Math.max(0, Math.min(1, state?.cfg.bgmVolume ?? .5));
  function bgmFade(a, to, sec, done) {
    clearInterval(a._fade);
    const from = a.volume, t0 = performance.now();
    a._fade = setInterval(() => {
      const k = Math.min(1, (performance.now() - t0) / (sec * 1000));
      a.volume = from + (to - from) * k;
      if (k >= 1) { clearInterval(a._fade); done?.(); }
    }, 40);
  }
  function startBgm() {
    stopBgm(0);
    if (!state?.cfg.bgm) return;
    bgm = new Audio(state.cfg.bgm); bgm.loop = true; bgm.volume = 0;
    bgm.play().catch(() => {});
    bgmFade(bgm, bgmTarget(), 1.5);
  }
  function stopBgm(sec = 1.5) {
    const a = bgm; bgm = null; if (!a) return;
    if (!sec) { clearInterval(a._fade); a.pause(); return; }
    bgmFade(a, 0, sec, () => a.pause());
  }
  // 遠處的爆炸（explosions: { min, max, gain, shake }＝每隔 min～max 秒一次）：聲音、鏡頭晃動、天花板落下一點灰塵
  function distantBoom(cfg) {
    const name = ['midBoom', 'bigBoom', 'smallBoom'][Math.floor(Math.random() * 3)];
    if (typeof SFX !== 'undefined') SFX.play(name, (cfg.gain ?? .5) * rnd(.6, 1) * (state.hush ? .4 : 1), name + ':story-far');
    // shake：鏡頭晃動強度（像素，0＝不晃）；hush 時跟聲音一起變小
    const amp = (cfg.shake ?? 8) * rnd(.7, 1) * (state.hush ? .5 : 1);
    if (amp > 0) state.rumble = { amp, t: 0, dur: .6 + amp * .05 };
    for (let i = 0; i < 14; i++) {
      const L = rnd(1.2, 2.2);
      G.effects.push({ dust: true, x: cam.x + rnd(0, viewW()), y: cam.y + rnd(0, viewH() * .6), vx: rnd(-6, 6), vy: rnd(18, 40), r: rnd(1.2, 2.6), life: L, life0: L });
    }
  }
  function motes(x, y, col, spread) {   // 治療時往上飄的光點（畫法同疏導光點）
    const L = rnd(.8, 1.4);
    G.effects.push({ mote: true, x: x + rnd(-spread, spread), y: y + rnd(-8, 6), vx: rnd(-5, 5), vy: -rnd(12, 26),
      r: rnd(1.8, 3.2), seed: Math.random() * 99, wob: rnd(5, 10), life: L, life0: L, col });
  }
  function tickShooter(a, dt) {
    a.recoil = Math.max(0, (a.recoil || 0) - dt * 24);
    a.cd -= dt; if (a.cd > 0) return;
    const foe = state.monsters.find(m => m.id === a.shoot); if (!foe) return;
    a.burst = ((a.burst || 0) + 1) % 4;   // 三連發後停一下
    a.cd = state.hush ? rnd(2.6, 4.5) : a.burst ? rnd(.16, .3) : rnd(.9, 1.9);
    const tx = foe.x + rnd(-14, 14), ty = foe.y + 13 - (foe.drawHeight || 60) * .5 + rnd(-18, 18);
    const ang = Math.atan2(ty - a.y, tx - a.x), m = gunMuzzleAt(a, ang);
    G.effects.push({ muzzle: true, x: m.x, y: m.y, ang, life: .07, life0: .07 });
    G.effects.push({ bullet: true, x1: m.x, y1: m.y, x2: tx, y2: ty, life: .07, life0: .07, color: '#ffe79a' });
    addLightFlash('muzzle', m.x, m.y); spawnShellCasing(m.x, m.y, ang);
    for (let i = 0; i < 3; i++) {   // 打在生命體身上的小火花
      const s = Math.random() * Math.PI * 2, sp = rnd(50, 110);
      G.effects.push({ particle: true, kind: 'spark', x: tx, y: ty, vx: Math.cos(s) * sp, vy: Math.sin(s) * sp, r: rnd(1.5, 2.4), life: rnd(.12, .22), life0: .22, color: '#ffe7b0' });
    }
    foe.hitT = .16; a.recoil = 2.5;
    playSfx('gunshot', .42, a.x, a.y, a.id);
    playSfx('monsterHit', .48, foe.x, foe.y, foe.id);
    if ((a.shots = (a.shots || 0) + 1) % 12 === 0) {   // 一個彈匣打完：換彈停一下
      a.cd = rnd(1.6, 2.2); playSfx('reload', .35, a.x, a.y, a.id);
    }
  }
  function tickMonster(e, dt) {
    if (e.hitT > 0) e.hitT -= dt;
    e.cd -= dt;
    // 往面前一格多的地方揮（拒馬、哨兵那邊），只有斬擊與衝擊特效
    const tx = e.x + (e.faceRight ? 1 : -1) * CELL * 1.3, ty = e.y;
    monsterSwingCue(e, e.cd, tx, ty);
    if (e.cd > 0) return;
    monsterSwingHit(e, tx, ty);
    playSfx('lifeformAttack', .68, e.x, e.y, e.id);
    playSfx('knock2', .52, tx, ty, e.id);   // 打在拒馬上的敲擊聲
    e.cd = rnd(2, 3.3) * (state.hush ? 1.8 : 1);
    state.shake = Math.max(state.shake, 2);
  }
  function tickMedic(a) {
    if (a.target) return;
    if (a.pause > 0) {   // 停在傷員旁：治療光點
      const stop = a.route[a.leg];
      if (stop.heal && Math.random() < .3) motes(a.x + (a.dir === 'left' ? -18 : a.dir === 'right' ? 18 : 0), a.y + 4, [90, 230, 140], 10);
      return;
    }
    a.leg = (a.leg + 1) % a.route.length;
    const p = a.route[a.leg];
    walkTo(a, p.at); a.arriveDir = p.face || 'front'; a.pause = p.wait || 0;
  }
  function tick(dt) {
    if (!state) return;
    if (state.waitingForSound) { draw(); return; }
    if (document.hidden) dt = 0;
    if (state.playing) {
      state.time += dt; state.beatTime += dt;
      const beat = state.cfg.beats[state.index];
      if (state.screen) state.screen.t += dt;
      if (state.ending) {
        el('storyFade').style.opacity = String(Math.max(screenDark(), Math.min(1, Math.max(0, (state.beatTime - state.endDelay) / 1.8))));
        if (state.beatTime >= state.endDelay + 1.8) {
          state.playing = false; state.ended = true; G.phase = 'story-ended';
          el('storyEnd').hidden = false; el('storyEnd').querySelector('button').focus();
        }
      } else {
        const reveal = Math.max(0, Math.min(1, (state.time - state.openingBlack) / state.openingFade));
        el('storyFade').style.opacity = String(Math.max(1 - reveal, screenDark()));
        ui.querySelector('.story-head').style.opacity = String(reveal);
        if (Number.isFinite(beat.end) && state.beatTime >= beat.end) finish(true);   // end：這頁幾秒後自動結束（邊走邊轉場）
        else if (state.beatTime >= state.beatWait) {
          if (!state.shown) { state.shown = true; showBox(true); shout(beat); }
          // 打字速度跟遊戲對話一樣（NPC_TALK.typeSpeed＝每個字幾毫秒）
          state.chars = Math.min(Array.from(beat.text).length, state.chars + dt * 1000 / Math.max(5, Number(NPC_TALK.typeSpeed) || 24));
          renderText();
        }
      }
    }
    if (state.playing || state.ended) {   // 回憶結束畫面後面，背景的戰鬥仍繼續
      for (const a of state.actors) {
        a.anim += dt;
        if (a.role === 'shooter') tickShooter(a, dt);
        if (a.role === 'medic') { if (!a.target) a.pause -= dt; tickMedic(a); }
        if (!a.target) continue;
        const dx = a.target[0] - a.x, dy = a.target[1] - a.y, d = Math.hypot(dx, dy), step = dt * (a.speed || 26);
        a.moving = d > step;
        if (d <= step) { [a.x, a.y] = a.target; a.target = a.path?.shift() || null; if (!a.target) { a.dir = a.arriveDir || a.dir; if (a.exiting) a.fading = true; } }
        else { a.x += dx / d * step; a.y += dy / d * step; a.dir = Math.abs(dx) > Math.abs(dy) ? dx < 0 ? 'left' : 'right' : dy < 0 ? 'back' : 'front'; }
      }
      for (const a of state.actors) {
        tickActorBlink(a, dt);
        if (a.shoutT > 0) a.shoutT = Math.max(0, a.shoutT - dt);
        if (a.fading) { a.alpha -= dt / .45; if (a.alpha <= 0) { a.alpha = 1; a.hidden = true; a.fading = a.exiting = false; } }   // 走進門裡：淡出
        else if (a.alpha < 1) a.alpha = Math.min(1, a.alpha + dt / .45);   // 剛出現：淡入
      }
      if (state.door) { const d = state.door, s = dt / DOOR_TIME; d.open = d.open < d.target ? Math.min(d.target, d.open + s) : Math.max(d.target, d.open - s); }
      for (const e of state.monsters) tickMonster(e, dt);
      // heal：{ from: 治療者, to: 被治療的人 }；光點用治療者的疏導色
      const patient = state.heal && actor(state.heal.to);
      if (patient && (state.moteT -= dt) <= 0) { state.moteT = .12; motes(patient.x, patient.y - 10, SOOTHE_MOTE_COLORS[state.heal.from] || [90, 230, 140], 22); }
      updateWorldEffects(dt); updateLightFlashes(dt);
      if (typeof updateFlickerLights === 'function') updateFlickerLights(dt);   // 日光燈偶爾閃、跳電、噴火花
      const boom = state.cfg.explosions;
      if (boom && (state.boomT -= dt) <= 0) { state.boomT = rnd(boom.min ?? 7, Math.max(boom.min ?? 7, boom.max ?? 16)); distantBoom(boom); }
      state.shake = Math.max(0, state.shake - dt * 10);
      if (state.rumble && (state.rumble.t += dt) >= state.rumble.dur) state.rumble = null;
      const target = state.cfg.cameras?.[state.cameraKey] || state.camera, k = 1 - Math.exp(-dt * 1.5);
      state.camera = [0, 1].map(i => state.camera[i] + (target[i] - state.camera[i]) * k);
      state.zoom += (camZoom(target, state.baseZoom) - state.zoom) * k; VIEW_SCALE = state.zoom;   // 鏡頭推近／拉遠跟移動一樣慢慢來
      updateSteps();
    }
    positionCamera(); draw();
  }
  function drawActor(a) {
    const size = PLAYER.drawSize;
    const frameActor = { ...a, sitting: null };
    let img = a.wounded ? woundedFrame(a) : a.eyesClosed ? a.set.blink?.[2] : pickCharacterFrame(a.set, frameActor);
    if (!readyImage(img)) img = a.set.front?.[0];
    if (!readyImage(img)) return;
    ctx.save(); ctx.imageSmoothingEnabled = false; ctx.globalAlpha = Math.max(0, Math.min(1, a.alpha ?? 1));
    const breath = a.breathing ? Math.sin(state.time * 2.1 + a.x) * .45 : 0;
    const treating = state.heal && a.id === state.heal.from && !a.target;
    const kick = a.recoil ? (a.dir === 'left' ? a.recoil : -a.recoil) : 0;   // 開槍後座力：往後退一點
    const shiver = a.tremble ? Math.sin(state.time * 70 + a.x) * .45 : 0;   // 顫抖：左右快速小幅晃動（不取整數，晃動才夠細）
    // 大喊（shout）：說出口那一刻整個人往上一頓、左右震幾下，0.4 秒內收掉
    const sk = a.shoutT > 0 ? a.shoutT / SHOUT_TIME : 0;
    const shoutX = sk ? Math.sin(a.shoutT * 95) * 2.2 * sk : 0, shoutY = sk ? -Math.sin((1 - sk) * Math.PI) * 3 : 0;
    ctx.translate(Math.round(a.x + kick) + shiver + shoutX, a.y - size / 2 + 18 + breath + shoutY);
    ctx.rotate(treating ? .035 + Math.sin(state.time * 2) * .015 : 0);
    if (a.sitting?.rotation) ctx.rotate(a.sitting.rotation * Math.PI / 180);
    const w = a.set.single ? size * img.naturalWidth / img.naturalHeight : size;   // 單張圖的路人照原本比例
    ctx.drawImage(img, -w / 2, -size / 2, w, size);
    // 手上拿的東西（carry＝圖片）：畫在身體前面、腰的高度；背對鏡頭時被身體擋住
    const held = a.carry && a.dir !== 'back' && imageOnce(a.carry);
    if (readyImage(held)) {
      const k = size / 64, hw = held.naturalWidth * k, hh = held.naturalHeight * k;
      ctx.drawImage(held, Math.round(-hw / 2 + (a.dir === 'left' ? -6 : a.dir === 'right' ? 6 : 0) * k), Math.round(size * .14), hw, hh);
    }
    ctx.restore();
  }
  function lights() {
    // 只取地圖實際放置的燈；不加入普通戰鬥地圖的預設營地底排光或玩家裝備光。
    // 探照燈、露營燈（半徑在 LIGHT.buildings）：圖層格子和大圖章都算，算法跟 js/lighting.js 的發光建築一樣
    const out = [], seen = new Set();
    const add = (t, c, r, w, h, ox = 0, oy = 0) => {
      if (!isMapObstacleTile(t)) return;
      const type = mapObstacleSpec(t).type, rad = LIGHT.buildings[type]; if (!rad) return;
      const key = type + '@' + c + ',' + r; if (seen.has(key)) return;   // 同一格不同圖層各放一盞：跟遊戲一樣只算一盞
      seen.add(key);
      const x = (c + w / 2) * CELL + ox;
      out.push({ x, y: (r + h / 2) * CELL + oy, visualX: x, visualY: (r + Math.min(.38, h * .3)) * CELL + oy + 10,
        r: rad, warm: true, single: type === 'camping_lights', phase: c * 7 + r * 13 });
    };
    for (const layer of Object.values(MAP.layers || {})) for (const [key, id] of Object.entries(layer)) {
      const t = mapTileById(id); if (!t) continue;
      const [c, r] = key.split(',').map(Number); add(t, c, r, mapTileW(t), mapTileH(t));
    }
    for (const s of MAP.stamps || []) { const t = mapTileById(s.id); if (t) add(t, s.c, s.r, mapStampW(s, t), mapStampH(s, t), s.ox || 0, s.oy || 0); }
    return out;
  }
  function drawScene() {
    if (!state) return;
    // 會閃的日光燈（js/flicker-light.js）只在亮著時算光；有開電源的電燈（js/powered-lights.js）也算
    lightsCache = [...state.lights, ...(typeof flickerLightSources === 'function' ? flickerLightSources() : []), ...(typeof poweredLightSources === 'function' ? poweredLightSources() : [])];
    computeLightField(); computeFlashField();   // 槍口火光會暫時照亮黑暗
    ctx.clearRect(0, 0, cv.width, cv.height); ctx.save();
    ctx.scale(VIEW_SCALE, VIEW_SCALE); ctx.translate(-cam.x, -cam.y); ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#000'; ctx.fillRect(cam.x, cam.y, viewW(), viewH());
    drawMapGround(ctx);
    drawDoor();   // 自動門畫在地面這層：從門裡走出來、走進去的人都在門前面
    const sortables = []; collectMapOccluders(ctx, sortables);
    for (const a of state.actors) if (!a.hidden) sortables.push({ y: a.sitting ? seatDrawY(a.sitting) : a.y + 17, draw: () => drawActor(a) });
    for (const e of state.monsters) sortables.push({ y: e.y + 13, draw: () => drawEnemy(e) });
    sortables.sort((a, b) => a.y - b.y).forEach(s => s.draw());
    drawMapTop(ctx);
    drawWorldEffects();
    drawDarkness();
    if (typeof drawPoweredLights === 'function') drawPoweredLights(ctx);
    if (typeof drawFlickerLights === 'function') drawFlickerLights(ctx);   // 日光燈的光暈、電弧（畫在黑幕上面）
    ctx.restore();
  }
  function leave() {
    stopBgm(0); clearInput(); state = null; updateSteps();
    document.body.classList.remove('story-scene');
    if (ui) ui.hidden = true;
    if (box()) { box().classList.add('hidden'); box().classList.remove('story-narration'); }
  }
  function exit() {
    if (resume) { backToGame(); return; }   // 從記憶之門進來的：回到門前
    // 預覽回到一般入口，由原有存檔恢復；不把回憶中的人物寫回隊伍。
    location.href = location.pathname;
  }
  // ---- 從遊戲裡進入回憶（js/memory-doors.js）----
  // 先把目前的地圖、戰場（G）、牆、門、電源、電梯整份記下來，換到劇情地圖播放；看完換回原地圖、把記下來的放回去，
  // 就像什麼都沒發生（做法跟 js/combat-progress.js 接續作戰一樣，只是放在記憶體裡）。
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
    computeFlow(); updateCamera(); updateHUD();
    r.onDone?.();
  }
  function action(name) { if (name === 'opening') { wakeSound(); return; } if (name === 'exit') exit(); else if (name === 'replay') start(); else if (name === 'next') next(); }
  // 最早註冊的 capture 擋住所有遊戲快捷鍵與滑鼠操作。只接受劇情介面的動作。
  // 擋住之後 js/sfx.js 收不到「第一次按鍵／點擊」，所以這裡替它喚醒音效引擎
  const wakeSound = () => {
    if (state?.waitingForSound) {
      state.waitingForSound = false; el('storyAudioStart').hidden = true; startBgm();
    }
    if (typeof SFX !== 'undefined') SFX.unlock?.();
    if (typeof humAudio !== 'undefined' && humAudio && humAudio.ctx.state === 'suspended') humAudio.ctx.resume();   // 日光燈嗡嗡聲（js/flicker-light.js）
    if (bgm && bgm.paused) bgm.play().catch(() => {});   // 劇情自動開始時瀏覽器還不准出聲：第一次按鍵／點擊再開始播 BGM
  };
  window.addEventListener('keydown', e => {
    if (!active()) return;
    wakeSound();
    if (['F5', 'F12'].includes(e.key) || ((e.ctrlKey || e.metaKey) && ['r', 'l', 'w'].includes(e.key.toLowerCase()))) return;
    e.preventDefault(); e.stopImmediatePropagation();
    if (e.repeat) return;
    if (e.key === 'Tab') {
      const buttons = [...(ui?.querySelectorAll('button') || [])].filter(b => b.getClientRects().length);
      const i = buttons.indexOf(document.activeElement);
      buttons[(i + (e.shiftKey ? -1 : 1) + buttons.length) % buttons.length]?.focus();
    } else if (e.key === ' ' || e.key === 'Enter') {
      const button = document.activeElement?.closest('[data-story-action]');
      if (button) action(button.dataset.storyAction);
      else if (state?.playing) next(); else if (!state?.ended) start();
    }
  }, true);
  window.addEventListener('keyup', e => { if (active()) { e.preventDefault(); e.stopImmediatePropagation(); } }, true);
  for (const type of ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'contextmenu', 'wheel', 'dblclick', 'touchstart']) {
    window.addEventListener(type, e => { if (active()) wakeSound(); if (active() && el('wrap')?.contains(e.target)) { e.preventDefault(); e.stopImmediatePropagation(); } }, { capture: true, passive: false });
  }
  window.addEventListener('click', e => {
    if (!active()) return;
    const button = e.target.closest('[data-story-action]');
    if (button) { e.preventDefault(); e.stopImmediatePropagation(); action(button.dataset.storyAction); }
    else if (state?.playing && el('wrap')?.contains(e.target)) { e.preventDefault(); e.stopImmediatePropagation(); next(); }
  }, true);
  // 劇情裡沒有玩家：要算「離聲音多遠」的地方（日光燈嗡嗡聲）改用鏡頭中心
  const listener = () => state && { x: cam.x + viewW() / 2, y: cam.y + viewH() * .42 };
  return { config, previewScene, active, prepare, start, tick, draw: drawScene, leave, listener, playFromGame, ownsStamp };
})();
