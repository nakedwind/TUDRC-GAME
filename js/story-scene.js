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
    ui.innerHTML = '<div id="storyVignette" aria-hidden="true"></div><header class="story-head"><div><small id="storySubtitle"></small><h1 id="storyTitle"></h1></div><button type="button" data-story-action="exit" id="storyExitTop">離開預覽</button></header><div id="storyFade" aria-hidden="true"></div><div id="storyFlash" aria-hidden="true"></div><div id="storyChoices" role="group" aria-label="要怎麼做" hidden></div><aside id="storyCard" hidden><img id="storyCardImg" alt=""><div><small id="storyCardSub"></small><h3 id="storyCardTitle"></h3><p id="storyCardText"></p></div></aside><button id="storyAudioStart" type="button" data-story-action="opening" hidden>點一下開始回憶</button><section id="storyEnd" hidden><small>回憶片段結束</small><h2 id="storyEndTitle"></h2><p id="storyEndText"></p><div><button type="button" data-story-action="replay">重新播放</button><button type="button" data-story-action="exit" id="storyExitEnd">返回開始畫面</button></div></section>';
    el('wrap').appendChild(ui);
    // 頭像外面包一層：上下顛倒時只翻頭像，頭像框上的汗滴、陰沉線條不跟著翻（框裡原本的排版規則照樣套用）
    const pic = el('dialoguePortrait');
    if (pic && pic.parentNode.id === 'dialoguePortraitFrame') { const wrap = document.createElement('span'); wrap.id = 'storyPortraitFlip'; pic.before(wrap); wrap.appendChild(pic); }
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
    // 頭像情緒（css/story-scene.css）：sweat 流汗（一滴汗往下滑）、gloom 陰沉線條（頭上垂下黑線）、
    // portraitFlip 頭像上下顛倒、portraitDark 頭像壓黑（0～1，0.4＝暗四成）
    box().classList.toggle('story-sweat', !!beat.sweat);
    box().classList.toggle('story-gloom', !!beat.gloom);
    box().classList.toggle('story-flip', !!beat.portraitFlip);
    const dark = Math.max(0, Math.min(1, Number(beat.portraitDark) || 0));
    el('dialoguePortrait').style.filter = dark ? 'brightness(' + (1 - dark) + ')' : '';
    el('dialogueName').textContent = beat.speaker || '';
    if (sprite) {
      const who = state.actors.find(a => a.name === beat.speaker && a.sprite === sprite);
      const set = who ? who.set : sprites(sprite);   // 頭像一律用一般正面圖（雷德舉盾時頭像也不拿盾）
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
  // 舉盾（shield）：雷德換成遊戲裡舉盾的那套圖（js/game.js 的 redShieldSprites）；其他人沒有盾牌圖，照常
  const actorSet = a => a.shield && a.sprite === 'red_B' && typeof redShieldSprites !== 'undefined' && redShieldSprites.front ? redShieldSprites : a.set;
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
      dir: a.dir || seat?.dir || 'front', anim: 0, moving: false, blinkTime: -1, blinkWait: 2 + Math.random() * 4, eyesClosed: !!seat?.bed,   // bed 也可以是椅子：坐椅子的人眼睛睜開
      gunT: a.gun ? 1 : a.gunT || 0 };   // gun：拿著槍預備（用持槍圖，只有 GUN_FOLDERS 裡的角色有）
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
  // 驚訝小跳（每頁 hop: { 角色id: true }）：同一個時機往上輕輕跳一下，對話框不震
  const SHOUT_TIME = .4, HOP_TIME = .32;
  function shout(beat) {
    for (const [id, on] of Object.entries(beat.hop || {})) { const a = on && actor(id); if (a) a.hopT = HOP_TIME; }
    const ids = Object.keys(beat.shout || {}).filter(id => beat.shout[id]);
    for (const id of ids) { const a = actor(id); if (a) a.shoutT = SHOUT_TIME; }
    const b = box(); b.classList.remove('story-shout');
    if (ids.length) { void b.offsetWidth; b.classList.add('story-shout'); }
    b.classList.toggle('story-loud', ids.length > 0);   // 大喊的台詞字放大加粗（css/story-scene.css）
  }
  // 鏡頭 [欄, 列, 縮放]：第三個數字可省略（＝劇情的 zoom），越大拍得越近
  const camZoom = (p, base) => Number(p?.[2]) > 0 ? Number(p[2]) : base;
  // ---- 登場介紹卡（每頁 card: { image, title, subtitle, text }）：像格鬥遊戲一樣從側邊滑出一張卡，翻到下一頁就收起來 ----
  function showCard(card) {
    const box = el('storyCard'); if (!box) return;
    if (!card || !(card.title || card.image)) { box.hidden = true; return; }
    el('storyCardImg').src = card.image || ''; el('storyCardImg').hidden = !card.image;
    el('storyCardSub').textContent = card.subtitle || ''; el('storyCardTitle').textContent = card.title || ''; el('storyCardText').textContent = card.text || '';
    box.hidden = false; box.classList.remove('in'); void box.offsetWidth; box.classList.add('in');   // 每次都重播滑入動畫
  }
  // ---- 嘴裡的人抽一下（每頁 preyKick: { 怪物名字: true }）：被吞的人的腳踢幾下、魚嘴冒一縷煙（還活著） ----
  function kickPrey(e) {
    e.mf.prey.kickUntil = performance.now() + 700;
    const hx = e.fried ? e.x + (e.fallDir || 1) * 100 : e.x, hy = e.fried ? e.y - 4 : e.y - 110;   // 倒在地上時魚嘴在頭那一側
    for (let i = 0; i < 3; i++) if (typeof pushBlackSmoke === 'function') pushBlackSmoke(hx + rnd(-8, 8), hy + rnd(-6, 6));
  }
  // ---- 虱目魚小子的演出（js/milkfish-kid.js 的圖）----
  // 每頁 monsterPose: { 怪物名字: 'smile' 笑（兩張笑臉圖交替）／'attack' 張嘴（朝最近的人）／'' 站好 }；只有虱目魚小子有這些圖
  // 每頁 swallow: { 怪物名字: 角色id }：張嘴撲過去，一口把人吞進頭上的魚嘴（只露出兩隻腳在踢）
  const GULP_TIME = .35, LAUGH_FPS = 7;
  const isMilkfish = e => e.behavior === 'milkfish' || e.behavior === 'milkfishSmall';
  function gulpNow(e, a) {
    e.gulp = null; e.x = a.x; e.y = a.y + 2;
    a.hidden = true; a.target = null; a.path = []; a.charging = false; a.fight = false; a.meleeSwing = null; a.swallowedBy = e;
    // 嘴裡的腳用遊戲的畫法；storyPrey：不畫名字和血條（js/milkfish-kid.js 的 drawMilkfishPrey）
    e.mf = { prey: { type: String(a.sprite || '').replace(/_[A-Z]$/, ''), storyPrey: true } };
    if (state.skipping) return;
    if (typeof flash === 'function') flash('被吃掉了！', e.x, e.y - 30, '#ffb36b', 3, true);   // 跟遊戲一樣彈出提示（js/game.js 的 sentryStatus）
    G.effects.push({ ring: true, x: e.x, y: e.y - 40, r: 6, r2: 34, life: .3, life0: .3, color: '#f3e7c9' });
    playSfx('milkfishGulp', .9, e.x, e.y, e.id);
    state.shake = Math.max(state.shake, 3);
  }
  // 吐出來（每頁 spit: { 怪物名字: true }）：嘴裡的人掉在魚嘴前面，倒在地上（被雷劈過的話還是焦黑的）
  const SPIT_TIME = .6;
  function spitOut(e) {
    e.spitT = 0;
    const a = state.actors.find(x => x.swallowedBy === e); e.mf = null; if (!a) return;
    const x = e.fried ? e.x + (e.fallDir || 1) * 3.4 * CELL : e.x + (e.faceRight ? 1 : -1) * CELL, y = e.y + 19;
    Object.assign(a, { swallowedBy: null, hidden: false, alpha: 1, x, y, down: true, target: null, path: [] });
    if (e.fried) a.charred = true;
    if (state.skipping) return;
    G.effects.push({ ring: true, x, y: y - 6, r: 6, r2: 30, life: .3, life0: .3, color: '#f3e7c9' });
    playSfx('milkfishSpit', .9, x, y, e.id);
    state.shake = Math.max(state.shake, 3);
  }
  function poseMonster(e) {
    if (!isMilkfish(e) || typeof mfPose !== 'function') return;
    if (e.gulp) { mfPose(e, 'attack', e.gulp.who.x); return; }
    if (e.pose === 'smile') { mfPose(e, 'smile-0' + (1 + Math.floor((state.time + (e.phase || 0)) * LAUGH_FPS) % 2)); return; }
    if (e.pose === 'attack' || e.biteT > 0) {   // 朝最近的人（或嘴裡含著人的那隻）張嘴；biteT＝被打時咬回去
      const marks = [...state.actors.filter(a => !a.hidden), ...state.monsters.filter(m => m !== e && m.mf?.prey && !m.gone)];
      const near = marks.sort((p, q) => Math.hypot(p.x - e.x, p.y - e.y) - Math.hypot(q.x - e.x, q.y - e.y))[0];
      mfPose(e, 'attack', near ? near.x : e.x + (e.faceRight ? 1 : -1)); return;
    }
    mfPose(e, null);
  }
  // ---- 集氣（每頁 charge: { 角色id: true／false }）：身邊收束的光圈、電火花；劈雷之後自動停 ----
  // 越集越強：full＝幾秒集滿；集滿時光圈、電火花最密，腳下法陣全亮，鏡頭推近 zoom 倍（0.25＝近四分之一）
  const CHARGE = { full: 2.5, zoom: .25, margin: 2, sparks: [14, 40], ring: [.45, .25] };   // sparks／ring：一開始→集滿（每秒幾顆電火花／每隔幾秒一圈光圈）
  // 集氣的人一定要在畫面裡：鏡頭推近後他會跑出去的話，把鏡頭中心往他那邊挪（左右留 CHARGE.margin 格，下面要避開對話框）
  function keepChargerInView(target, zoom) {
    let [cx, cy] = target;
    const halfW = VIEW_W / zoom / CELL / 2, vh = VIEW_H / zoom / CELL, m = CHARGE.margin;
    for (const a of state.actors) {
      if (!a.charging || a.hidden) continue;
      const ax = a.x / CELL, ay = a.y / CELL;
      cx = Math.min(Math.max(cx, ax - halfW + m), ax + halfW - m);
      cy = Math.min(Math.max(cy, ay - vh * .2), ay + vh * .42 - m);   // 鏡頭中心在畫面 42% 高的地方（positionCamera）；下面 30% 是對話框
    }
    return [cx, cy];
  }
  const chargeLevel = () => Math.max(0, ...state.actors.filter(a => a.charging && !a.hidden).map(a => Math.min(1, (a.chargeT || 0) / CHARGE.full)));
  function tickCharge(a, dt) {
    if (!a.charging || a.hidden) { if (a.sigil) { a.sigil.life = Math.min(a.sigil.life, .3); a.sigil = null; } a.chargeT = 0; return; }
    a.chargeT = (a.chargeT || 0) + dt;
    const k = Math.min(1, a.chargeT / CHARGE.full), lerp = ([p, q]) => p + (q - p) * k;
    const col = (typeof ULT_CHARGE_COLOR !== 'undefined' && ULT_CHARGE_COLOR[String(a.sprite).replace(/_[A-Z]$/, '')]) || '#aee9ff';
    if (!a.sigil) { a.sigil = { sootheSigil: true, follow: a, col: typeof hexRgb === 'function' ? hexRgb(col) : [174, 233, 255], life: 999, life0: 999, spin: 0 }; G.effects.push(a.sigil); }   // 腳下法陣（疏導法陣的畫法）
    if ((a.chargeFx = (a.chargeFx || 0) - dt) <= 0) { a.chargeFx = lerp(CHARGE.ring); if (typeof spawnChargeFx === 'function') spawnChargeFx(a.x, a.y - 12, col); }
    if (k > .5 && Math.random() < dt * 3 * k && typeof addLightFlash === 'function') addLightFlash('lightning', a.x, a.y - 12, .5 * k);   // 快集滿時身上一閃一閃
    for (let n = Math.random() < (dt * lerp(CHARGE.sparks)) % 1 ? 1 : 0, m = Math.floor(dt * lerp(CHARGE.sparks)) + n; m > 0; m--) {
      const s = Math.random() * Math.PI * 2, d = rnd(14, 30 + 16 * k);
      G.effects.push({ particle: true, kind: 'lightning', x: a.x + Math.cos(s) * d, y: a.y - 12 + Math.sin(s) * d * .8, vx: -Math.cos(s) * 40, vy: -Math.sin(s) * 40,
        r: rnd(1.4, 2.6), life: rnd(.15, .3), life0: .3, color: '#cbf2ff' });
    }
  }
  // ---- 巨雷（每頁 thunder: true）：好幾道雷劈在所有怪物身上＋大爆炸：畫面白、黑閃好幾下再全白，thunderFade 秒慢慢亮回來 ----
  // 畫面劇烈搖晃、天花板掉碎石和粉塵（跟新手區開場一樣，js/tutorial.js 的 tutDebrisStart）
  // 怪物被劈得焦黑、抖一下後往後倒，躺在地上冒煙；被吞掉的人還卡在魚嘴裡（腳也焦黑）
  // bolts＝連續劈幾秒、every＝每隔幾秒一道、fry＝焦黑抖多久才倒下、fall＝倒下花幾秒、hold＝全白停幾秒
  // shake＝鏡頭晃多大（像素）、shakeTime＝晃幾秒；debris＝碎石掉幾秒、rocks／dust＝每秒掉幾顆碎石、幾團粉塵；scorch＝焦痕大小
  const THUNDER = { freeze: .35, bolts: .9, every: .07, fry: .9, fall: .35, hold: .35, shake: 34, shakeTime: 2.6,
    debris: 2.2, rocks: 30, dust: 24, scorch: 60, sfx: 'storyThunder' };
  // 閃光的順序：[幾秒, 顏色, 濃度]；第一下淡淡的，讓大家先看到雷劈下來，接著白、黑、白、黑閃，最後全白再慢慢退
  const FLASH_SEQ = [[.16, '#fff', .25], [.08, '#fff', 1], [.07, '#000', 1], [.09, '#fff', 1], [.07, '#000', .9]];
  // 劈下去之前畫面靜止一下（THUNDER.freeze 秒，什麼都不動），再劈
  function thunder(beat) {
    if (state.skipping || !(THUNDER.freeze > 0)) { strike(beat); return; }
    state.freeze = { t: THUNDER.freeze, beat };
  }
  function strike(beat) {
    const targets = state.monsters.filter(e => !e.gone);
    for (const a of state.actors) { a.charging = false; a.fight = false; }
    targets.forEach((e, i) => {
      e.gulp = null; e.pose = ''; e.goal = null; e.wander = null; e.biteT = 0; poseMonster(e);   // 張著嘴的也收回站姿：焦黑的笑臉
      // 嘴裡含著人的那隻往左倒、嘴裡的人不再踢腳；其他往右倒
      e.fried = true; e.friedT = state.skipping ? 99 : 0; e.fallDir = e.mf?.prey ? -1 : 1;
      if (e.mf?.prey) e.mf.prey.still = true;
    });
    if (state.skipping) return;
    const cx = targets.length ? targets.reduce((s, e) => s + e.x, 0) / targets.length : state.camera[0] * CELL;
    const cy = targets.length ? targets.reduce((s, e) => s + e.y, 0) / targets.length : state.camera[1] * CELL;
    state.zap = { t: 0, next: 0, targets, cx, cy };
    // thunderHold＝全白停幾秒、thunderFade＝花幾秒亮回來
    state.flash = { t: 0, hold: Number(beat.thunderHold) > 0 ? Number(beat.thunderHold) : THUNDER.hold, dur: Math.max(.3, Number(beat.thunderFade) || 3) };
    state.rumble = { amp: THUNDER.shake, t: 0, dur: THUNDER.shakeTime };
    state.shake = Math.max(state.shake, THUNDER.shake * .4);
    if (typeof SFX !== 'undefined') SFX.play(THUNDER.sfx, 1, THUNDER.sfx + ':story');
    if (typeof tutDebrisStart === 'function') tutDebrisStart(THUNDER.debris, THUNDER.rocks, THUNDER.dust);
    for (const e of targets) if (typeof addScorchMark === 'function') addScorchMark(e.x, e.y + 10, THUNDER.scorch, null, 'lightning');
    if (typeof addScorchMark === 'function') addScorchMark(cx, cy + 10, THUNDER.scorch * 1.5, null, 'lightning');
  }
  // 被雷劈的怪物：先焦黑抖，再往後倒、躺著冒煙（倒下那一刻播一次死掉的聲音）
  function tickFried(e, dt) {
    e.friedT += dt;
    if (e.friedT < THUNDER.fry) e.hitT = .1;
    else if (!e.fell) {
      e.fell = true;
      if (!state.skipping) {
        G.effects.push({ ring: true, x: e.x + e.fallDir * 40, y: e.y + 10, r: 8, r2: 46, life: .35, life0: .35, color: '#6a6258' });
        if (!state.deathSfx) { state.deathSfx = true; playSfx('milkfishDeath', .8, e.x, e.y, e.id); }   // 一起倒：只播一次
        state.shake = Math.max(state.shake, 4);
      }
    }
    if ((e.smokeT = (e.smokeT || 0) - dt) <= 0 && typeof pushBlackSmoke === 'function') {
      e.smokeT = rnd(.3, .55); pushBlackSmoke(e.x + (e.fell ? e.fallDir * rnd(10, 60) : rnd(-20, 20)), e.y - (e.fell ? rnd(0, 14) : rnd(10, 50)));
    }
  }
  // ---- 繞著人走（每頁 monsterWander: { 怪物名字: 角色id }）：在那個人身邊 WANDER.near～far 格內走來走去，停一下再換地方 ----
  // 換成走位、擺姿勢、吞人、劈雷，或那個人不見了（被吞）就停
  // bite＝每走到一個點，有多少機率張嘴撲咬那個人一下
  const WANDER = { near: 1, far: 1.5, speed: 45, rest: [.3, 1], bite: .6 };
  function wanderStep(e, dt) {
    const a = actor(e.wander.who);
    if (!a || a.hidden) { e.wander = null; return; }
    if (a.target) return;   // 那個人還在跑：等他停下來再圍過去（不然會走到他起跑的地方）
    if (e.wander.arrived) { e.wander.arrived = false; if (Math.random() < WANDER.bite) { e.biteT = .45; playSfx('milkfishChew', .35, e.x, e.y, e.id + '-bite'); } }
    if ((e.wander.wait -= dt) > 0) return;
    for (let i = 0; i < 8; i++) {   // 挑一個走得到的點（不在牆裡）
      const ang = -rnd(.15, Math.PI - .15), r = rnd(WANDER.near, WANDER.far) * CELL;   // 只走到那個人的上方、左右：怪物很大隻，走到前面會把人整個擋住
      const x = a.x + Math.cos(ang) * r, y = a.y + Math.sin(ang) * r * .75;
      if (!open(...cellAt(x, y))) continue;
      e.goal = [x, y]; e.wander.arrived = true; break;
    }
    e.wander.wait = rnd(...WANDER.rest);
  }
  // ---- 打架（每頁 fight: { 角色id: true／false }）：走到怪物旁邊後，第一下是舉盾衝撞（把怪物撞退、鏡頭震），之後一直揮擊最近的怪物 ----
  // 用遊戲裡的近戰揮擊圖（雷德舉盾時是盾牌揮擊圖）；被吞掉、劈雷之後自動停
  // wind＝舉斧、impact＝劈中的時間、swing＝整下揮完（秒）；斧頭的弧線用遊戲的 drawSwingWeapon（js/render.js）
  const FIGHT = { reach: 3.2, wind: .12, impact: .2, swing: .42, every: [.55, 1], ramPush: 26, hurtEvery: 2 };
  function tickFight(a, dt) {
    if (a.meleeSwing) {
      const s = a.meleeSwing; s.age += dt;
      if (!s.hit && s.age >= s.impact) { s.hit = true; fightHit(a, s); }
      if (s.age >= FIGHT.swing) a.meleeSwing = null;
    }
    if (!a.fight || a.hidden || a.target || a.down) return;
    if ((a.fightT = (a.fightT ?? 0) - dt) > 0) return;
    const foes = state.monsters.filter(e => !e.gone && !e.fried && Math.hypot(e.x - a.x, e.y - a.y) <= FIGHT.reach * CELL);
    const foe = foes.sort((p, q) => Math.hypot(p.x - a.x, p.y - a.y) - Math.hypot(q.x - a.x, q.y - a.y))[0];
    if (!foe) { a.fightT = .3; return; }
    const ram = !!a.fightRam; a.fightRam = false;
    const ang = Math.atan2(foe.y - 20 - a.y, foe.x - a.x);
    a.meleeSwing = ram ? { angle: ang, age: 0, wind: .04, impact: .06, duration: FIGHT.swing, foe, ram }
      : { angle: ang, age: 0, wind: FIGHT.wind, impact: FIGHT.impact, duration: FIGHT.swing, foe };
    a.dir = Math.abs(Math.cos(ang)) >= Math.abs(Math.sin(ang)) ? (Math.cos(ang) < 0 ? 'left' : 'right') : (Math.sin(ang) < 0 ? 'back' : 'front');
    a.fightT = ram ? .8 : rnd(...FIGHT.every);
    playSfx('meleeAttack', .55, a.x, a.y, a.id + '-swing');
  }
  function fightHit(a, s) {
    const e = s.foe; if (!e || e.gone || e.fried) return;
    const hx = e.x - Math.cos(s.angle) * 22, hy = e.y - 30;
    if (typeof spawnMeleeSlash === 'function') spawnMeleeSlash(hx, hy, s.angle, s.ram, 'blue');
    if (typeof spawnMeleeImpact === 'function') spawnMeleeImpact(hx, hy, s.ram);
    e.hitT = .16; e.hitSquashT = .16;
    if (isMilkfish(e) && !e.pose && !e.mf?.prey) e.biteT = .35;   // 被打的那隻張嘴咬回去
    if (s.ram) {   // 衝撞：怪物被撞退一段，之後自己走回來
      const back = [e.x, e.y], push = Math.cos(s.angle) * FIGHT.ramPush;
      e.x += push; if (!e.goal) e.goal = back;
      state.shake = Math.max(state.shake, 7);
      playSfx('knock2', .8, e.x, e.y, a.id + '-ram');
    }
    if ((a.hits = (a.hits || 0) + 1) % FIGHT.hurtEvery === 1 || s.ram) playSfx('milkfishHurt', .55, e.x, e.y, e.id);
  }
  function tickZap(dt) {
    const z = state.zap; if (!z) return;
    z.t += dt;
    while (z.next <= Math.min(z.t, THUNDER.bolts)) {   // 一開始最粗的一道劈在中間，接著每隻身上連續閃好幾道
      if (typeof spawnLightningBolt === 'function') {
        if (!z.next) spawnLightningBolt(z.cx, z.cy, 5);
        for (const e of z.targets) spawnLightningBolt(e.x + rnd(-10, 10), e.y - 20, rnd(2.4, 3.4));
      }
      z.next += THUNDER.every;
    }
    if (z.t > THUNDER.bolts) state.zap = null;
  }
  // 閃光：照 FLASH_SEQ 白黑閃，再全白停一下，dur 秒慢慢退掉（頭尾慢、中間快）；回傳 [顏色, 濃度]
  function flashLevel() {
    const f = state?.flash; if (!f) return ['#fff', 0];
    let t = f.t;
    for (const [sec, col, a] of FLASH_SEQ) { if (t < sec) return [col, a]; t -= sec; }
    if (t < f.hold) return ['#fff', 1];
    const k = Math.min(1, (t - f.hold) / f.dur);
    return ['#fff', 1 - k * k * (3 - 2 * k)];
  }
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
  const screenBusy = () => !!state.screen && !state.screen.free && state.screen.t < state.screen.dur;
  function finish(auto) {   // 劇情結束：畫面淡黑；auto＝這頁設了 end 秒數，不用等點擊、馬上開始變黑
    showCard(null);
    state.ending = true; state.beatTime = 0; state.endDelay = auto ? 0 : 1.4; showBox(false); stopBgm(5);
  }
  function makeMonster(m) {
    const spec = ACTIVE_MONSTERS.find(s => s.id === (m.type || 'lifeform'));
    if (!spec) throw new Error('劇情怪物不存在：' + (m.type || 'lifeform'));
    // speed＝演出裡走位的速度（像素／秒）；phase：每隻笑的節奏錯開一點
    return Object.assign(createMonster(spec, m.at[0] * CELL, m.at[1] * CELL), { id: m.id, hideBar: true, faceRight: m.face === 'right', cd: rnd(.8, 2.6),
      storySpeed: Number(m.speed) > 0 ? Number(m.speed) : 40, pose: '', phase: Math.random(),
      // fried：一開始就是被雷劈過、焦黑倒在地上（fall：-1 往左倒、1 往右倒）
      ...(m.fried ? { fried: true, friedT: 99, fell: true, fallDir: Number(m.fall) < 0 ? -1 : 1 } : {}) });
  }
  const monster = id => state.monsters.find(e => e.id === id && !e.gone);
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
      ...(cfg.wounded || []).map((w, i) => makeActor({ id: 'wounded' + i, sprite: 'mob_B', wounded: true, ...w }, seats)),   // 呼吸起伏看起來像漂浮，預設不開（要的話傷員自己寫 breathing: true）
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
      door: findDoor(cfg), screen: null, endDelay: 1.4, baseZoom, zoom: camZoom(cfg.cameras?.[cameraKey], baseZoom), flash: null, zap: null };
    VIEW_SCALE = state.zoom;
    document.body.classList.add('story-scene');
    ui.hidden = true;
    el('storyTitle').textContent = cfg.title || ''; el('storySubtitle').textContent = cfg.subtitle || '';
    el('storyEndTitle').textContent = cfg.endTitle || cfg.title || ''; el('storyEndText').textContent = cfg.endText || '';
    // autoExit：從遊戲裡播的（例如新遊戲的開場）看完直接回遊戲，不出現結束畫面；上面的按鈕變成「跳過劇情」
    el('storyExitTop').textContent = resume ? (cfg.autoExit ? '跳過劇情' : '離開回憶') : '離開預覽';
    el('storyFlash').style.opacity = '0'; el('storyExitEnd').textContent = resume ? '回到現實' : '返回開始畫面';
    showBox(false); el('storyEnd').hidden = true;
    el('storyFade').style.opacity = '1';
    el('storyVignette').style.opacity = String(Math.max(0, Math.min(1, Number(cfg.vignette) || 0)));   // vignette：畫面四周壓暗的強度 0～1
    el('storyAudioStart').hidden = true;
    ui.querySelector('.story-head').style.opacity = '0';
    state.lights = lights();
    // 怪物 prey＝一開始嘴裡就含著這個角色（被雷劈過倒地的話，腳也不踢了）
    for (const m of cfg.monsters || []) {
      const e = m.prey && state.monsters.find(x => x.id === m.id), a = e && actor(m.prey); if (!a) continue;
      Object.assign(a, { hidden: true, swallowedBy: e }); e.mf = { prey: { type: String(a.sprite || '').replace(/_[A-Z]$/, ''), storyPrey: true, still: !!e.fried } };
    }
    // 演出途中才用到的圖（虱目魚小子張嘴、笑、嘴裡的腳）先下載：開場的「載入中」會等它們好，演到一半才不會變成一團色塊
    if (state.monsters.some(isMilkfish) && typeof MILKFISH_ART !== 'undefined')
      for (const f of ['attack', 'smile-01', 'smile-02', ...[1, 2, 3].flatMap(i => ['legs-sentry-0' + i, 'legs-guide-0' + i])]) monsterImage(MILKFISH_ART + f + '.png');
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
      for (const e of state.monsters) if (e.goal) { [e.x, e.y] = e.goal; e.goal = null; }
      if (state.door) state.door.open = state.door.target;
      if (state.screen) state.screen.t = state.screen.dur;
    }
    state.skipping = false;
    if ('skipBgm' in state && !state.waitingForSound) { if (state.skipBgm) startBgm(state.skipBgm); else stopBgm(0); }   // 快轉經過換音樂的頁
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
    // textSize：這頁台詞的字體大小（像素）；沒填＝預設（一般 17、大喊 23，css/story-scene.css）
    el('dialogueText').style.fontSize = Number(beat.textSize) > 0 ? Number(beat.textSize) + 'px' : '';
    state.beatWait = index === 0 ? Math.max(beat.wait || 0, state.openingBlack + state.openingFade) : (beat.wait || 0);
    state.nextAt = state.time + state.beatWait;
    if (beat.camera) state.cameraKey = beat.camera;
    if (beat.screen === 'black' || beat.screen === 'clear') {   // 黑幕：從現在的亮度慢慢變過去
      const from = state.screen ? screenDark() : 0;
      // screenFree：變暗途中也可以翻頁（一邊說話一邊慢慢變黑）
      state.screen = { from, to: beat.screen === 'black' ? 1 : 0, t: 0, dur: Math.max(.1, Number(beat.screenFade) || 2), free: !!beat.screenFree };
    }
    if (state.door && (beat.door === 'open' || beat.door === 'close')) state.door.target = beat.door === 'open' ? 1 : 0;
    // sfx：翻到這頁時播一個音效（js/sfx.js 的名字，例如 storyDoor 自動門）；sfxVolume＝音量倍率；快轉（storyFrom）時不播
    // bgm：這頁換音樂（先把現在的收掉，bgmDelay 秒後播新的；空白＝只停掉）
    if ('bgm' in beat) {
      if (state.skipping) state.skipBgm = beat.bgm || '';
      else { stopBgm(.4); state.nextBgm = beat.bgm ? { src: beat.bgm, at: state.time + (Number(beat.bgmDelay) || 0) } : null; }
    }
    if (beat.sfx && typeof SFX !== 'undefined' && !state.skipping) SFX.play(beat.sfx, Number(beat.sfxVolume) > 0 ? Number(beat.sfxVolume) : 1, beat.sfx + ':story-beat');
    const show = a => { if (a.hidden) { a.hidden = false; a.alpha = 0; } a.fading = false; };   // 先隱藏的人：淡入出現
    for (const id of Object.keys(beat.hide || {})) { const a = actor(id); if (a) { a.hidden = true; a.target = null; a.path = []; a.exiting = a.fading = false; } }
    for (const [id, p] of Object.entries(beat.place || {})) {   // 瞬間移到某處（黑幕轉場時用）
      const a = actor(id); if (!a) continue;
      a.hidden = false; a.alpha = 1; a.fading = a.exiting = false; a.target = null; a.path = []; a.x = p[0] * CELL; a.y = p[1] * CELL; a.sitting = null;
    }
    for (const [id, v] of Object.entries(beat.speed || {})) { const a = actor(id); if (a && Number(v) > 0) a.speed = Number(v); }
    for (const [id, v] of Object.entries(beat.tremble || {})) { const a = actor(id); if (a) a.tremble = !!v; }
    for (const [id, v] of Object.entries(beat.carry || {})) { const a = actor(id); if (a) a.carry = v || null; }
    const rise = a => { if (a.sitting && !a.sitting.bed) a.sitting = null; };   // 坐在椅子上的人：站起來再走（躺床的不會自己下床）
    for (const [id, p] of Object.entries(beat.move || {})) { const a = actor(id); if (!a) continue; show(a); rise(a); a.exiting = false; walkTo(a, p); }
    for (const [id, p] of Object.entries(beat.exit || {})) { const a = actor(id); if (!a) continue; show(a); rise(a); a.exiting = true; walkTo(a, p); }   // 走到那裡後淡出消失（走進門裡）
    for (const [id, d] of Object.entries(beat.face || {})) {   // 方向，或看向某個地點／某個人
      const a = actor(id); if (!a) continue;
      const point = state.cfg.points?.[d], other = !point && actor(d);
      const dir = point ? faceToward(a, point) : other ? faceToward(a, [other.x / CELL, other.y / CELL]) : d;
      a.arriveDir = dir; if (!a.target) a.dir = dir;
    }
    for (const [id, e] of Object.entries(beat.eyes || {})) { const a = actor(id); if (a) a.eyesClosed = e === 'closed'; }
    for (const [id, v] of Object.entries(beat.gun || {})) { const a = actor(id); if (a) a.gunT = v ? 1 : 0; }   // 拿槍預備／放下
    for (const [id, v] of Object.entries(beat.shield || {})) { const a = actor(id); if (a) a.shield = !!v; }   // 舉盾／放下
    for (const [id, v] of Object.entries(beat.down || {})) { const a = actor(id); if (a) { a.down = !!v; if (!v) a.charred = false; } }   // 倒在地上（倒地圖）／爬起來
    for (const [id, v] of Object.entries(beat.charge || {})) { const a = actor(id); if (a) { a.charging = !!v; a.chargeFx = 0; } }
    for (const [id, v] of Object.entries(beat.fight || {})) { const a = actor(id); if (a) { a.fight = !!v; a.fightRam = !!v && !state.skipping; a.fightT = 0; } }   // 開始打：第一下是衝撞
    for (const [id, who] of Object.entries(beat.monsterWander || {})) { const e = monster(id); if (e) e.wander = who ? { who, wait: rnd(0, .5) } : null; }
    for (const [id, p] of Object.entries(beat.monsterMove || {})) { const e = monster(id); if (e) { e.goal = [p[0] * CELL, p[1] * CELL]; e.wander = null; } }
    for (const [id, v] of Object.entries(beat.monsterPose || {})) { const e = monster(id); if (e) { e.pose = v || ''; if (v) e.wander = null; } }
    for (const [id, who] of Object.entries(beat.swallow || {})) {
      const e = monster(id), a = actor(who); if (!e || !a || a.hidden) continue;
      e.goal = null; e.pose = ''; e.wander = null;
      if (state.skipping) gulpNow(e, a); else e.gulp = { who: a, t: 0, from: [e.x, e.y] };
    }
    state.choosing = false; if (el('storyChoices')) el('storyChoices').hidden = true;
    for (const [id, v] of Object.entries(beat.spit || {})) { const e = monster(id); if (v && e?.mf?.prey) { if (state.skipping) spitOut(e); else e.spitT = SPIT_TIME; } }   // 吐出來：先抖一下
    if (beat.thunder) thunder(beat);
    showCard(state.skipping ? null : beat.card);
    for (const [id, v] of Object.entries(beat.preyKick || {})) { const e = monster(id) || state.monsters.find(m => m.id === id); if (v && e && e.mf?.prey && !state.skipping) kickPrey(e); }
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
    if (state.choosing) return;   // 有選項：要選了才能往下
    if (beat.stop) { finish(false); return; }   // stop：這頁之後就結束（分支的最後一頁，後面接的是另一條分支）
    if (state.index + 1 < state.cfg.beats.length) setBeat(state.index + 1);
    else finish(false);   // 畫面淡黑時音樂慢慢收掉
  }
  // ---- 選項（每頁 choices: [{ text, goto: 跳到哪個 label 的頁, outcome: 結果 }]）：台詞打完字後出現按鈕，選了才往下 ----
  // outcome 會在劇情結束時交給呼叫的程式（例如 js/story-triggers.js 依結果換隊伍、回應變中心）
  function showChoices() {
    const beat = state.cfg.beats[state.index], box = el('storyChoices');
    if (!beat.choices?.length) { box.hidden = true; state.choosing = false; return; }
    state.choosing = true;
    box.innerHTML = '';
    beat.choices.forEach((c, i) => {
      const b = document.createElement('button'); b.type = 'button'; b.dataset.storyAction = 'choose:' + i;
      b.innerHTML = '<kbd>' + (i + 1) + '</kbd> '; b.append(c.text || '…');
      box.appendChild(b);
    });
    box.hidden = false; box.querySelector('button')?.focus();
  }
  function choose(i) {
    const c = state?.choosing && state.cfg.beats[state.index].choices?.[i]; if (!c) return;
    if (typeof sfx === 'function') sfx('button');
    state.choosing = false; el('storyChoices').hidden = true;
    if (el('storyChoices').contains(document.activeElement)) document.activeElement.blur();   // 焦點留在收起來的按鈕上，Enter 會一直按到它
    if (c.outcome) state.outcome = c.outcome;
    const to = c.goto ? state.cfg.beats.findIndex(b => b.label === c.goto) : -1;
    if (to >= 0) setBeat(to); else if (state.index + 1 < state.cfg.beats.length) setBeat(state.index + 1); else finish(false);
  }
  function renderText() {
    const beat = state.cfg.beats[state.index], chars = Array.from(beat.text);
    const text = chars.slice(0, Math.floor(state.chars)).join('');
    const typing = state.chars < chars.length;
    if (!typing && beat.choices?.length && !state.choosing && el('storyChoices').hidden) showChoices();
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
  // bgm 也可以是清單：["music/a.mp3", "music/a.mp3", "music/b.mp3"]＝照順序播，最後一首一直循環
  // src：換成這首（每頁 bgm）；沒給就用劇情設定的 bgm
  function startBgm(src) {
    stopBgm(0);
    const want = src !== undefined ? src : state?.cfg.bgm;
    const list = (Array.isArray(want) ? want : [want]).filter(Boolean);
    if (!list.length) return;
    const a = bgm = new Audio(list[0]); let i = 0;
    a.loop = list.length === 1; a.volume = 0;
    a.addEventListener('ended', () => {   // 一首播完換下一首（同一個播放器，音量與淡出照舊）
      if (bgm !== a || i >= list.length - 1) return;
      i++; a.src = list[i]; a.loop = i === list.length - 1; a.play().catch(() => {});
    });
    a.play().catch(() => {});
    bgmFade(a, bgmTarget(), 1.5);
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
    if (e.hitSquashT > 0) e.hitSquashT = Math.max(0, e.hitSquashT - dt);   // 被打時壓扁回彈（js/render.js 的 drawEnemy）
    if (e.biteT > 0) e.biteT -= dt;
    if (e.gone) return;
    if (e.spitT > 0) { e.hitT = .1; if ((e.spitT -= dt) <= 0) spitOut(e); }   // 抖一抖再吐
    if (e.fried) { tickFried(e, dt); return; }
    if (e.gulp) {   // 張嘴撲過去，最後一下最快
      const g = e.gulp; g.t += dt; const k = Math.min(1, g.t / GULP_TIME);
      e.x = g.from[0] + (g.who.x - g.from[0]) * k * k; e.y = g.from[1] + (g.who.y + 2 - g.from[1]) * k * k;
      poseMonster(e);
      if (k >= 1) gulpNow(e, g.who);
      return;
    }
    if (e.wander && e.goal) {   // 繞著走的目標離那個人太遠了（他移動了）：重新挑
      const a = actor(e.wander.who);
      if (a && Math.hypot(e.goal[0] - a.x, e.goal[1] - a.y) > (WANDER.far + .6) * CELL) e.goal = null;
    }
    if (!e.goal && e.wander) wanderStep(e, dt);
    if (e.goal) {   // 走位（直線走過去，走路圖由 js/render.js 依移動自動換）
      const dx = e.goal[0] - e.x, dy = e.goal[1] - e.y, d = Math.hypot(dx, dy), step = dt * (e.wander ? WANDER.speed : e.storySpeed);
      if (d <= step) { [e.x, e.y] = e.goal; e.goal = null; } else { e.x += dx / d * step; e.y += dy / d * step; }
    }
    poseMonster(e);
    if (e.type !== 'lifeform') return;   // 只有生命體會一直揮擊；其他怪物只做走位、姿勢
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
      if (state.flash) state.flash.t += dt;
      if (state.nextBgm && state.time >= state.nextBgm.at && !state.ending) { const src = state.nextBgm.src; state.nextBgm = null; startBgm(src); }
      if (state.ending) {
        el('storyFade').style.opacity = String(Math.max(screenDark(), Math.min(1, Math.max(0, (state.beatTime - state.endDelay) / 1.8))));
        if (state.beatTime >= state.endDelay + 1.8 && state.cfg.autoExit && resume) { backToGame(); return; }   // 開場這類：變黑後直接回遊戲
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
    if (state.freeze) {   // 劈雷前的靜止：世界整個停住，時間到才劈
      if ((state.freeze.t -= dt) <= 0) { const b = state.freeze.beat; state.freeze = null; strike(b); }
      else { positionCamera(); draw(); return; }
    }
    if (state.playing || state.ended) {   // 回憶結束畫面後面，背景的戰鬥仍繼續
      for (const a of state.actors) {
        a.anim += dt;
        if (a.role === 'shooter') tickShooter(a, dt);
        if (a.role === 'medic') { if (!a.target) a.pause -= dt; tickMedic(a); }
        if (!a.target) continue;
        const dx = a.target[0] - a.x, dy = a.target[1] - a.y, d = Math.hypot(dx, dy), step = dt * (a.speed || 26);
        a.moving = d > step;
        if (d <= step) { [a.x, a.y] = a.target; a.target = a.path?.shift() || null; if (!a.target) { if (a.exiting) a.fading = true; else a.dir = a.arriveDir || a.dir; } }   // 離場（exit）的人走到後維持走路的方向淡出，不轉身
        else { a.x += dx / d * step; a.y += dy / d * step; a.dir = Math.abs(dx) > Math.abs(dy) ? dx < 0 ? 'left' : 'right' : dy < 0 ? 'back' : 'front'; }
      }
      for (const a of state.actors) {
        tickActorBlink(a, dt);
        tickCharge(a, dt);
        tickFight(a, dt);
        if (a.moving && (a.speed || 26) >= 100 && Math.random() < dt * 18)   // 全力衝刺：腳下揚起灰塵
          G.effects.push({ dust: true, x: a.x + rnd(-8, 8), y: a.y + 14, vx: rnd(-10, 10), vy: rnd(-12, -4), r: rnd(2, 3.5), life: .5, life0: .5 });
        if (a.charred && !a.hidden && (a.smokeT = (a.smokeT || 0) - dt) <= 0 && typeof pushBlackSmoke === 'function') { a.smokeT = rnd(.35, .6); pushBlackSmoke(a.x + rnd(-10, 10), a.y - 4); }   // 焦黑的人一直冒煙
        if (a.shoutT > 0) a.shoutT = Math.max(0, a.shoutT - dt);
        if (a.hopT > 0) a.hopT = Math.max(0, a.hopT - dt);
        if (a.fading) { a.alpha -= dt / .45; if (a.alpha <= 0) { a.alpha = 1; a.hidden = true; a.fading = a.exiting = false; } }   // 走進門裡：淡出
        else if (a.alpha < 1) a.alpha = Math.min(1, a.alpha + dt / .45);   // 剛出現：淡入
      }
      if (state.door) { const d = state.door, s = dt / DOOR_TIME; d.open = d.open < d.target ? Math.min(d.target, d.open + s) : Math.max(d.target, d.open - s); }
      for (const e of state.monsters) tickMonster(e, dt);
      tickZap(dt);
      if (G.scorchMarks) for (const m of G.scorchMarks) m.t = Math.max(m.t - dt, (m.st.fade || 0) + .01);   // 雷擊焦痕：劇情裡一直留著（不淡掉）
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
      const zoomTo = camZoom(target, state.baseZoom) * (1 + CHARGE.zoom * chargeLevel());   // 集氣時鏡頭慢慢推近
      const aim = keepChargerInView(target, zoomTo);
      state.camera = [0, 1].map(i => state.camera[i] + (aim[i] - state.camera[i]) * k);
      state.zoom += (zoomTo - state.zoom) * k; VIEW_SCALE = state.zoom;   // 鏡頭推近／拉遠跟移動一樣慢慢來
      updateSteps();
    }
    const [flashCol, flashA] = flashLevel();
    el('storyFlash').style.background = flashCol; el('storyFlash').style.opacity = String(flashA);
    if (typeof tutDebrisFrame === 'function') tutDebrisFrame(state ? dt : 0);   // 大爆炸震下來的碎石、粉塵
    positionCamera(); draw();
  }
  function drawActor(a) {
    const size = PLAYER.drawSize;
    const frameActor = { ...a, sitting: null };
    const set = actorSet(a);
    let img = a.down && readyImage(a.set.fail) ? a.set.fail : a.wounded ? woundedFrame(a) : a.eyesClosed ? set.blink?.[2] : pickCharacterFrame(set, frameActor);
    if (!readyImage(img)) img = set.front?.[0];
    if (!readyImage(img)) return;
    ctx.save(); ctx.imageSmoothingEnabled = false; ctx.globalAlpha = Math.max(0, Math.min(1, a.alpha ?? 1));
    if (a.charred) ctx.filter = 'brightness(.5) saturate(.55) contrast(1.15)';   // 被雷劈到焦黑（還認得出是誰）
    const zap = a.charging ? Math.sin(state.time * 60) * .6 : 0;   // 集氣：全身微微發抖
    const breath = a.breathing ? Math.sin(state.time * 2.1 + a.x) * .45 : 0;
    const treating = state.heal && a.id === state.heal.from && !a.target;
    const kick = a.recoil ? (a.dir === 'left' ? a.recoil : -a.recoil) : 0;   // 開槍後座力：往後退一點
    const shiver = a.tremble ? Math.sin(state.time * 70 + a.x) * .45 : 0;   // 顫抖：左右快速小幅晃動（不取整數，晃動才夠細）
    // 大喊（shout）：說出口那一刻整個人往上一頓、左右震幾下，0.4 秒內收掉
    const sk = a.shoutT > 0 ? a.shoutT / SHOUT_TIME : 0;
    const hk = a.hopT > 0 ? 1 - a.hopT / HOP_TIME : 0;   // 小跳：拋物線往上 5 像素再落回
    const shoutX = sk ? Math.sin(a.shoutT * 95) * 2.2 * sk : 0, shoutY = (sk ? -Math.sin((1 - sk) * Math.PI) * 3 : 0) - (hk ? Math.sin(hk * Math.PI) * 5 : 0);
    ctx.translate(Math.round(a.x + kick) + shiver + shoutX + zap, a.y - size / 2 + 18 + breath + shoutY);
    ctx.rotate(treating ? .035 + Math.sin(state.time * 2) * .015 : 0);
    if (a.sitting?.rotation) ctx.rotate(a.sitting.rotation * Math.PI / 180);
    // 單張圖：照原本比例、跟人一樣高；imageScale＝照原圖像素大小畫（1＝跟角色同一個比例，例如擔架），底部對齊腳底
    const nat = a.set.single && Number(a.imageScale) > 0 ? Number(a.imageScale) * size / 64 : 0;
    const w = nat ? img.naturalWidth * nat : a.set.single ? size * img.naturalWidth / img.naturalHeight : size, hgt = nat ? img.naturalHeight * nat : size;
    ctx.drawImage(img, -w / 2, size / 2 - hgt, w, hgt);
    // 手上拿的東西（carry＝圖片）：畫在身體前面、腰的高度；背對鏡頭時被身體擋住
    const held = a.carry && a.dir !== 'back' && imageOnce(a.carry);
    if (readyImage(held)) {
      const k = size / 64 * Math.min(1, 24 / Math.max(held.naturalWidth, held.naturalHeight)), hw = held.naturalWidth * k, hh = held.naturalHeight * k;   // 太大的圖（急救包）縮到手拿得住
      ctx.drawImage(held, Math.round(-hw / 2 + (a.dir === 'left' ? -6 : a.dir === 'right' ? 6 : 0) * k), Math.round(size * .14), hw, hh);
    }
    ctx.restore();
    // 雷德揮擊時手上的斧頭（跟遊戲一樣：fire_axe_01，衝撞那一下只用盾不拿斧）
    if (a.meleeSwing && !a.meleeSwing.ram && a.sprite === 'red_B' && typeof drawSwingWeapon === 'function' && typeof redAxeImg !== 'undefined') {
      ctx.save(); if (a.charred) ctx.filter = 'brightness(.5) saturate(.55) contrast(1.15)'; drawSwingWeapon(a, redAxeImg, 21, 32, 22); ctx.restore();
    }
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
    // 劇情自己加的光（劇情設定 lights: [[欄, 列, 半徑格數], …]）：地圖上沒有燈、但演出要看得到的地方；只照亮，不畫燈頭光暈
    for (const [c, r, rad] of state?.cfg.lights || []) out.push({ x: c * CELL, y: r * CELL, r: (Number(rad) || 4) * CELL, warm: false, phase: 0 });
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
    if (typeof drawScorchMarks === 'function') drawScorchMarks(ctx);   // 雷擊焦痕
    drawDoor();   // 自動門畫在地面這層：從門裡走出來、走進去的人都在門前面
    const sortables = []; collectMapOccluders(ctx, sortables);
    for (const a of state.actors) if (!a.hidden) sortables.push({ y: a.sitting ? seatDrawY(a.sitting) : a.y + 17, draw: () => drawActor(a) });
    const drawFried = e => {   // 被雷劈：焦黑；倒下時以腳底為軸往後轉 90 度，躺在地上
      const k = Math.max(0, Math.min(1, (e.friedT - THUNDER.fry) / THUNDER.fall)), fy = e.y + 13;
      ctx.save(); ctx.filter = 'brightness(.25) contrast(1.4)';
      if (k > 0) { ctx.translate(e.x, fy); ctx.rotate(e.fallDir * Math.PI / 2 * k * k); ctx.translate(-e.x, -fy); }
      drawEnemy(e); ctx.restore();
    };
    for (const e of state.monsters) if (!e.gone) sortables.push({ y: e.y + 13, draw: () => e.fried ? drawFried(e) : drawEnemy(e) });
    sortables.sort((a, b) => a.y - b.y).forEach(s => s.draw());
    drawMapTop(ctx);
    drawWorldEffects();
    drawDarkness();
    if (typeof drawPoweredLights === 'function') drawPoweredLights(ctx);
    if (typeof drawFlickerLights === 'function') drawFlickerLights(ctx);   // 日光燈的光暈、電弧（畫在黑幕上面）
    if (typeof drawTextEffects === 'function') drawTextEffects();   // flash() 的提示字（「被吃掉了！」），跟遊戲一樣畫在黑幕上面
    ctx.restore();
  }
  function leave() {
    if (ui) { el('storyChoices').hidden = true; }
    if (ui) showCard(null);
    stopBgm(0); clearInput(); state = null; updateSteps();
    document.body.classList.remove('story-scene');
    if (ui) ui.hidden = true;
    if (box()) { box().classList.add('hidden'); box().classList.remove('story-narration', 'story-sweat', 'story-loud', 'story-gloom', 'story-flip'); el('dialogueText').style.fontSize = ''; el('dialoguePortrait').style.filter = ''; }
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
    const outcome = state?.outcome || null;   // 選項選了什麼（沒選就跳過劇情＝null）
    leave(); forcedId = null; resume = null;
    MAP_INDEX = r.index; initMap();
    G = r.G; mapWalls = r.walls; mapDoors = r.doors; doorAddedWalls = r.doorWalls; mapSolidOffsets = r.offsets;
    poweredMap = MAP; mapPowerOn = r.power; openElevatorStamp = r.elevator;
    occCache = null; occCacheFor = null;
    computeFlow(); updateCamera(); updateHUD();
    r.onDone?.(outcome);
  }
  function action(name) { if (name === 'opening') { wakeSound(); return; } if (name.startsWith('choose:')) { choose(Number(name.slice(7))); return; } if (name === 'exit') exit(); else if (name === 'replay') start(); else if (name === 'next') next(); }
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
    if (['F5', 'F9', 'F12'].includes(e.key) || ((e.ctrlKey || e.metaKey) && ['r', 'l', 'w'].includes(e.key.toLowerCase()))) return;
    e.preventDefault(); e.stopImmediatePropagation();
    if (e.repeat) return;
    if (e.key === 'Tab') {
      const buttons = [...(ui?.querySelectorAll('button') || [])].filter(b => b.getClientRects().length);
      const i = buttons.indexOf(document.activeElement);
      buttons[(i + (e.shiftKey ? -1 : 1) + buttons.length) % buttons.length]?.focus();
    } else if (state?.choosing && /^[1-9]$/.test(e.key)) {
      choose(Number(e.key) - 1);
    } else if (e.key === ' ' || e.key === 'Enter') {
      const button = document.activeElement?.closest('[data-story-action]');
      if (button && button.getClientRects().length) action(button.dataset.storyAction);
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
