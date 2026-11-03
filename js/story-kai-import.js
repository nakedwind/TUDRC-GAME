/* ===== 劇情編輯器（改）：把舊劇情編輯器的劇情搬過來 =====
   劇情列表下面列出舊的劇情（data/story-scenes.js）；選一個，就照新的格式「另外複製一份」到劇情列表裡。
   舊的劇情和記憶之門都不會被改到（記憶之門要改播新的那份，要到地圖編輯器重新選）。
   搬得過來的：地圖、鏡頭、角色出場和走位、轉向、台詞（大喊＝框震動）、發抖、黑幕、背景音樂、自動門音效、後室黑幕、暗角。
   新編輯器還沒有的演出（背景戰鬥的群演、怪物、巨雷、選項分支、頭像表情……）搬不過來，搬完會列出來。
   必須在 js/story-kai-editor.js 後面載入。 */
const OLD_SCENES = typeof STORY_SCENES !== 'undefined' ? STORY_SCENES : {};
// 舊劇情裡的音效名字 → 音檔（js/sfx.js 的設定；新格式直接寫音檔）
const OLD_SFX_FILES = { storyDoor: 'Sound effects/環境/門與機關/電梯.mp3', door: 'Sound effects/環境/門與機關/關門.mp3', backroomDoor: 'Sound effects/環境/門與機關/後室開門.mp3',
  elevator: 'Sound effects/環境/門與機關/電梯.mp3', ironGateSlide: 'Sound effects/環境/門與機關/鐵門滑動.mp3', stairsDown: 'Sound effects/環境/腳步/footsteps03 (mp3cut.net).mp3' };
// 搬不過來的演出：欄位 → 說明
const OLD_LOST = {
  wounded: '躺在行軍床上的傷員', monsters: '怪物', shooters: '開槍的哨兵（群演）', medics: '走來走去的嚮導（群演）', explosions: '遠處的爆炸聲和震動',
  door: '自動門開關動畫', footsteps: '走路的腳步聲', lights: '劇情自己加的燈', eyes: '閉眼／睜眼', heal: '治療光點', hush: '槍聲變小',
  hop: '驚訝小跳', carry: '手上拿東西', gloom: '頭像陰沉線條', sweat: '流汗', emote: '頭上的情緒符號', portraitDark: '頭像壓暗', portraitFlip: '頭像上下顛倒',
  card: '登場介紹卡', textSize: '台詞字體大小', monsterMove: '怪物走位', monsterPose: '怪物姿勢', monsterWander: '怪物繞著人走', swallow: '怪物吞人',
  spit: '怪物吐人', preyKick: '嘴裡的人踢腳', thunder: '巨雷', charge: '集氣', fight: '打架', gun: '拿槍', down: '倒在地上', choices: '選項分支（只照順序搬台詞）',
  shield: '舉盾', bgmDelay: '換音樂的延遲',
};
const OLD_HANDLED = new Set(['speaker', 'text', 'camera', 'wait', 'move', 'exit', 'place', 'hide', 'face', 'tremble', 'shout', 'screen', 'screenFade', 'screenFree',
  'sfx', 'sfxVolume', 'bgm', 'speed', 'end', 'stop', 'label', 'thunderHold', 'thunderFade']);

// 劇情列表下面：舊劇情（選了就搬一份過來）
function addOldScenes(select) {
  const list = Object.entries(OLD_SCENES); if (!list.length) return;
  const group = h('optgroup', { label: '── 舊劇情編輯器的劇情（選了會照新格式複製一份）──' });
  for (const [id, old] of list) {
    const done = Object.values(data).some(s => s.from === id);
    group.append(h('option', { value: 'old:' + id }, '📥 ' + (old.title || id) + '（' + id + '）' + (done ? '　已搬過' : '')));
  }
  select.append(group);
}
function importOld(oldId) {
  const old = OLD_SCENES[oldId]; if (!old) return;
  const done = Object.values(data).some(s => s.from === oldId);
  if (!confirm('把舊劇情「' + (old.title || oldId) + '」照新的格式複製一份到劇情列表？' + (done ? '\n（之前已經搬過一份，這次會再多一份）' : '') + '\n\n舊的劇情和記憶之門都不會被改到。新編輯器還沒有的演出會略過，搬完會列給你看。')) return;
  const { scene: s, lost, notes } = convertOld(old);
  let id = oldId + '_kai'; for (let n = 2; data[id]; n++) id = oldId + '_kai' + n;
  s.from = oldId;
  data[id] = s; sceneId = id; sel = 0; castSel = null; view.fitFor = null; commit();
  const lostList = Object.entries(lost).map(([k, n]) => '<li>' + (OLD_LOST[k] || k) + (n > 1 ? '（' + n + ' 處）' : '') + '</li>').join('');
  $('infoTitle').textContent = '搬好了：' + (s.title || id);
  $('infoBody').innerHTML = '<p>新的劇情 ID：<b>' + id + '</b>，共 ' + s.steps.length + ' 行。舊的「' + oldId + '」沒有被改到。</p>' +
    (notes.length ? '<p>要注意：</p><ul>' + notes.map(n => '<li>' + n + '</li>').join('') + '</ul>' : '') +
    (lostList ? '<p>新編輯器還沒有、所以略過的演出：</p><ul>' + lostList + '</ul><p>需要的話可以用「＋特效」描述給 Claude 做，或跟 Claude 說要加哪種指令。</p>' : '<p>全部都搬過來了。</p>') +
    '<p>記憶之門要改播新的這份，請到地圖編輯器選門，把劇情改成「【改】' + (s.title || id) + '」。</p>';
  $('infoDlg').showModal();
}
$('infoOk').onclick = () => $('infoDlg').close();

// ---- 轉換：舊格式（每一頁台詞＋這頁的演出）→ 新格式（一行一行的指令）----
function convertOld(old) {
  const m = storyMaps.find(x => x.id === old.map) || { cols: 32, rows: 18 };
  const steps = [], lost = {}, notes = [], cast = [];
  const miss = (k, n = 1) => { lost[k] = (lost[k] || 0) + n; };
  for (const k of ['wounded', 'monsters', 'shooters', 'medics']) if (old[k]?.length) miss(k, old[k].length);
  for (const k of ['explosions', 'door', 'footsteps']) if (old[k]) miss(k);
  if (old.lights?.length) miss('lights', old.lights.length);
  // 演出者：舊的主要角色＋只出聲音的說話者（頭像設定裡有、場上沒有的人）
  const byId = {}, byName = {}, pos = {}, hidden = {}, speed = {};
  const baseOf = sp => String(sp).replace(/_[A-Z]$/, '');
  const addCast = (sprite, name) => {
    const ch = sprite.startsWith('mob_') ? charOf('mob') : CHARS.find(c => baseOf(c.sprite) === baseOf(sprite));
    if (!ch) return null;
    const c = { no: cast.length + 1, char: ch.id, sprite };
    if (name && name !== castName(c)) c.name = name;
    cast.push(c); return c;
  };
  for (const a of old.actors || []) {
    let c;
    if (!a.sprite && a.image) { c = { no: cast.length + 1, char: 'image', image: a.image, name: a.name || a.id }; cast.push(c); if (a.imageScale) notes.push('「' + c.name + '」原本照圖片原尺寸畫，改成跟人一樣高。'); }
    else if (!a.sprite) continue;
    else c = addCast(a.sprite, a.name); if (!c) { notes.push('找不到「' + (a.name || a.id) + '」的角色資料（' + a.sprite + '），略過了。'); continue; }
    byId[a.id] = c; if (a.name) byName[a.name] = byName[a.name] || c;
    pos[a.id] = a.bed ? [a.bed[0] + .5, a.bed[1] + .5] : a.at; hidden[a.id] = !!a.hidden; speed[a.id] = Number(a.speed) || 26;
    if (a.bed) notes.push('「' + (a.name || a.id) + '」原本躺在床上，改成站在那張床的位置。');
  }
  for (const [name, sprite] of Object.entries(old.portraits || {})) if (!byName[name]) { const c = addCast(sprite, name); if (c) byName[name] = c; }
  // 舊的鏡頭：中心在畫面 42% 高的地方、貼地圖邊會被擋住；換成新的「中心點＋寬度」，拍到的範圍一樣
  const baseZoom = Number(old.zoom) || 0;
  const camOf = p => {
    const z = Number(p[2]) > 0 ? Number(p[2]) : baseZoom, [vw, vh] = viewCells(m, z);
    const x = m.cols <= vw ? (m.cols - vw) / 2 : clamp(p[0] - vw / 2, 0, m.cols - vw);
    const y = m.rows <= vh ? (m.rows - vh) / 2 : clamp(p[1] - vh * .42, 0, m.rows - vh);
    return { at: [r1(x + vw / 2), r1(y + vh / 2)], w: r1(vw) };
  };
  const beats = old.beats || [];
  // 開頭：地圖、後室黑幕、暗角、音樂、鏡頭、一開始就在場上的人，再從黑畫面慢慢亮起來
  steps.push({ do: 'map', map: old.map });
  if (old.darkness) steps.push({ do: 'dark', on: true });
  if (Number(old.vignette) > 0) steps.push({ do: 'vignette', lv: clamp(Math.round(old.vignette * 10), 1, 10) });
  const bgmOf = b => Array.isArray(b) ? b.filter(Boolean)[0] : b;
  if (Array.isArray(old.bgm) && new Set(old.bgm).size > 1) notes.push('背景音樂原本是好幾首照順序播，只搬了第一首。');
  if (bgmOf(old.bgm)) steps.push({ do: 'bgm', src: bgmOf(old.bgm), fade: true, vol: Math.round((old.bgmVolume ?? .5) * 100) });
  let camKey = beats[0]?.camera || Object.keys(old.cameras || {})[0];
  if (camKey && old.cameras?.[camKey]) steps.push({ do: 'cam', ...camOf(old.cameras[camKey]) });
  for (const [id, c] of Object.entries(byId)) if (!hidden[id] && pos[id]) {
    const a = old.actors.find(x => x.id === id), st = { do: 'show', who: c.no, at: [...pos[id]] };
    if (a.dir) st.face = a.dir; steps.push(st);
  }
  const black = Math.max(0, Number(old.opening?.black) || 0), fade = Math.max(.1, Number(old.opening?.fade) || 1.5);
  if (black) steps.push({ do: 'wait', ms: Math.round(black * 1000) });
  steps.push({ do: 'blackOut', ms: Math.round(fade * 1000) });
  // 每一頁
  const faceDir = (id, d) => {
    const p = old.points?.[d] || (pos[d] && pos[d]); if (!p) return d;
    const me = pos[id]; return me ? dirFrom(me, p) : 'front';
  };
  let ended = false;
  beats.forEach((b, bi) => {
    if (ended) return;
    for (const k of Object.keys(b)) if (!OLD_HANDLED.has(k)) miss(k);
    let wait = Number(b.wait) || 0;
    if (bi === 0) wait = Math.max(0, wait - black - fade);   // 第一頁的等待原本包含開頭變亮的時間
    if (b.camera && b.camera !== camKey && old.cameras?.[b.camera]) {   // 換鏡頭：慢慢移過去（1.5 秒）
      camKey = b.camera; steps.push({ do: 'camMove', ...camOf(old.cameras[b.camera]), ms: 1500 }); wait -= 1.5;
    }
    if (b.screen === 'black' || b.screen === 'clear') steps.push({ do: b.screen === 'black' ? 'blackIn' : 'blackOut', ms: Math.round((Number(b.screenFade) || 2) * 1000) });
    if ('bgm' in b) steps.push(b.bgm ? { do: 'bgm', src: bgmOf(b.bgm), fade: true, vol: Math.round((old.bgmVolume ?? .5) * 100) } : { do: 'bgmStop' });
    if (b.sfx) { if (OLD_SFX_FILES[b.sfx]) steps.push({ do: 'sfx', src: OLD_SFX_FILES[b.sfx], vol: Math.round((Number(b.sfxVolume) || 1) * 100) }); else miss('sfx:' + b.sfx); }
    for (const id of Object.keys(b.hide || {})) if (byId[id]) { steps.push({ do: 'hide', who: byId[id].no }); hidden[id] = true; }
    for (const [id, v] of Object.entries(b.speed || {})) if (Number(v) > 0) speed[id] = Number(v);
    for (const [id, p] of Object.entries(b.place || {})) if (byId[id]) {   // 瞬間移過去
      steps.push(hidden[id] ? { do: 'show', who: byId[id].no, at: [...p] } : { do: 'move', who: byId[id].no, at: [...p], ms: 0 });
      pos[id] = p; hidden[id] = false;
    }
    const moved = new Set();
    for (const kind of ['move', 'exit']) for (const [id, p] of Object.entries(b[kind] || {})) {
      const c = byId[id]; if (!c) continue;
      if (hidden[id] && pos[id]) steps.push({ do: 'show', who: c.no, at: [...pos[id]] });
      const dist = pos[id] ? Math.hypot(p[0] - pos[id][0], p[1] - pos[id][1]) * 40 : 0;
      const ms = Math.round(Math.min(4000, Math.max(300, dist / speed[id] * 1000)) / 100) * 100;
      const st = { do: 'move', who: c.no, at: [...p], ms };
      const f = b.face?.[id]; if (f && kind === 'move') st.face = faceDir(id, f);
      steps.push(st); pos[id] = p; hidden[id] = false; moved.add(id); wait -= ms / 1000;
      if (kind === 'exit') { steps.push({ do: 'hide', who: c.no }); hidden[id] = true; }
    }
    if (moved.size > 1) notes.push('第 ' + (bi + 1) + ' 頁好幾個人同時走路，新格式會一個走完換下一個。');
    for (const [id, d] of Object.entries(b.face || {})) {   // 只轉頭（原地、0 秒的角色位置）
      if (moved.has(id) || !byId[id] || !pos[id] || hidden[id]) continue;
      steps.push({ do: 'move', who: byId[id].no, at: [...pos[id]], ms: 0, face: faceDir(id, d) });
    }
    for (const [id, v] of Object.entries(b.tremble || {})) if (byId[id]) steps.push({ do: 'tremble', who: byId[id].no, on: !!v, lv: 2 });
    if (wait >= .5) steps.push({ do: 'wait', ms: Math.round(wait * 10) * 100 });
    // 台詞：說話者找演出者；找不到（沒有角色圖的人）就當旁白，名字寫在台詞前面
    const sp = b.speaker || '', c = sp ? byName[sp] : null;
    const say = { do: 'say', who: c ? c.no : '', text: c || !sp ? b.text || '' : sp + '：' + (b.text || ''), shake: Object.values(b.shout || {}).some(Boolean) };
    if (sp && !c && !notes.some(n => n.includes('「' + sp + '」說的話'))) notes.push('「' + sp + '」說的話沒有對應的角色圖，改成旁白、名字寫在台詞前面。');
    steps.push(say);
    if (Number.isFinite(b.end)) ended = true;   // 這頁之後就結束
  });
  if (beats.some(b => b.stop)) miss('choices');
  steps.push({ do: 'end', title: old.autoExit ? '' : old.endTitle || old.title || '' });
  for (const k of Object.keys(lost)) if (k.startsWith('sfx:')) { OLD_LOST[k] = '音效「' + k.slice(4) + '」（遊戲內建的音效，新格式要選音檔）'; }
  notes.push('走路、換鏡頭的時間是照舊劇情的速度估的；舊的走路可以邊走邊說話，新的會走完才出台詞，播起來節奏可能不太一樣。');
  return { scene: { map: old.map, title: old.title || '', ...(old.subtitle ? { subtitle: old.subtitle } : {}), cast, steps }, lost, notes };
}
// 舊編輯器的算法：遊戲畫面看得到幾格（劇情的 zoom 或鏡頭自己的縮放）
function viewCells(m, zoom) {
  if (zoom > 0) return [1280 / (40 * zoom), 720 / (40 * zoom)];
  const fw = 1280 / (m.cols * 40), fh = 720 / (m.rows * 40);
  let sc = Math.max(1, Math.min(fw, fh));
  if (fw < 1 || fh < 1) sc *= 1.5; else sc = Math.max(sc, 1.5);
  return [1280 / (40 * sc), 720 / (40 * sc)];
}
renderScenes();
