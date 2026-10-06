// ============================================================
//  對話編輯器：編輯 data/dialogues.js（所有角色的台詞與說話情境）
// ============================================================
const DIALOGUE_DRAFT_KEY = 'tudrc_dialogues_draft_v1';
const $d = id => document.getElementById(id);
const clone = v => JSON.parse(JSON.stringify(v));

// ---- 情境說明：遊戲在什麼時候用這組台詞 ----
// fallback：沒填時會改用「通用台詞」；ordered：找他說話時依序一句一句說完；name：可用 {name}
const SITUATIONS = [
  { group: '日常（基地裡）', key: 'idle', label: '閒晃時的頭上泡泡', when: '在基地等安全場景閒晃時，每隔 <b>5～13 秒</b>隨機冒出一句。' },
  { group: '日常（基地裡）', key: 'npc', label: '找他說話（基地）', ordered: true, when: '在基地走到他旁邊按 <b>Space／E</b>，會<b>依序</b>一句一句說完。沒填就改說閒晃台詞。' },
  { group: '戰鬥中', key: 'battle', label: '出勤時的頭上泡泡', when: '戰鬥地圖中，每隔 <b>11～22 秒</b>隨機冒出一句。' },
  { group: '戰鬥中', key: 'sentry', label: '找他說話（出勤中）', ordered: true, when: '戰鬥中點他、選「對話」時，<b>依序</b>一句一句說完。' },
  { group: '戰鬥中', key: 'ultimate', label: '放大招時喊的話', when: '大招冷卻好、<b>放大招的瞬間</b>。' },
  { group: '戰鬥中', key: 'guard', label: '衝去保護部隊長', when: '部隊長被怪物攻擊、他衝過去保護時（每 <b>6 秒</b>最多一次）。' },
  { group: '汙染與暴走', key: 'taintWarn', label: '瀕臨暴走', fallback: true, when: '汙染超過 <b>85</b> 時說一句，之後沒人疏導，每 <b>8～12 秒</b>再說一句。' },
  { group: '汙染與暴走', key: 'berserk', label: '暴走瞬間', fallback: true, when: '汙染到 <b>100</b>、暴走的那一刻（暗紅色泡泡）。' },
  { group: '汙染與暴走', key: 'relief', label: '瀕臨暴走時被疏導', fallback: true, when: '汙染 70 以上時被疏導、降到 <b>70 以下</b>。' },
  { group: '汙染與暴走', key: 'soothed', label: '從暴走被疏導回來', fallback: true, when: '暴走中被疏導、<b>恢復清醒</b>時。' },
  { group: '汙染與暴走', key: 'friendlyHit', label: '被暴走的隊友打到', fallback: true, name: true, when: '被暴走的隊友攻擊時（每 <b>4 秒</b>最多一次）。' },
];
// 狂戰士人格的台詞欄位
const RAGE_FIELDS = [
  { key: 'onset', label: '性格切換的那一刻', when: '汙染<b>剛到門檻</b>時說一句，周圍閃一圈光。沒填就不說。' },
  { key: 'battle', label: '變身後的戰鬥閒聊', when: '變身狀態下的頭上泡泡（比平常多話）。沒填就照常說「出勤時的頭上泡泡」。' },
  { key: 'warn', label: '瀕臨暴走', when: '取代一般的「瀕臨暴走」台詞。沒填就用一般的。' },
  { key: 'berserk', label: '暴走瞬間', when: '取代一般的「暴走瞬間」台詞。沒填就用一般的。' },
  { key: 'hit', label: '被暴走的隊友打到', name: true, when: '變身狀態下被隊友打到。沒填就用一般的。' },
  { key: 'relief', label: '瀕臨暴走時被疏導', when: '變身狀態下被疏導、恢復原本個性時。沒填就用一般的。' },
  { key: 'soothed', label: '從暴走被疏導回來', when: '從暴走恢復時。沒填就用一般的。' },
];
const SOOTHERS = { winter: '溫特', eldrin: '艾德林', chris: '克莉思' };
const KIND_LABEL = { sentinel: '哨兵', guide: '嚮導', support: '非戰鬥人員', player: '玩家' };
const DEFAULT_ID = '__default';

// ---- 載入：瀏覽器草稿優先，沒有就用 data/dialogues.js ----
let draft = clone(typeof DIALOGUES !== 'undefined' ? DIALOGUES : { characters: {}, default: {} });
let usingDraft = false;
try {
  const saved = JSON.parse(localStorage.getItem(DIALOGUE_DRAFT_KEY) || 'null');
  if (saved && saved.characters) { draft = saved; usingDraft = true; }
} catch (_) { /* 草稿損壞就用正式檔案 */ }
let selected = Object.keys(draft.characters)[0] || DEFAULT_ID;

function charInfo(id) {
  if (id === DEFAULT_ID) return { name: '通用台詞', kind: 'default' };
  return (typeof CHARACTERS !== 'undefined' && CHARACTERS[id]) || { name: id, kind: '' };
}
function portraitPath(info) {
  if (!info.sprite) return '';
  return 'images/character/' + info.sprite + '/' + info.sprite.replace('_', '') + '_0000_Front.png';
}
function portraitHtml(info, cls) {
  const src = portraitPath(info);
  return src ? '<img class="' + cls + '" src="' + src + '" alt="" onerror="this.outerHTML=\'<div class=&quot;ph ' + cls + '&quot;>💬</div>\'">'
             : '<div class="ph ' + cls + '">' + (info.kind === 'default' ? '📋' : '💬') + '</div>';
}
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
function entryOf(id) { return id === DEFAULT_ID ? (draft.default = draft.default || {}) : draft.characters[id]; }

// 一個台詞欄位可能是陣列，或依章節分組的 { 章節: 陣列 }
const allLines = v => Array.isArray(v) ? v : (v && typeof v === 'object' ? Object.values(v).flat() : []);
function countLines(entry) {
  if (!entry) return 0;
  let n = 0;
  for (const [k, v] of Object.entries(entry)) {
    if (k === 'rage') {
      if (v && v.enabled) for (const f of RAGE_FIELDS) n += allLines(v[f.key]).length;
      continue;
    }
    n += allLines(v).length;
  }
  return n;
}
const query = () => $d('search').value.trim().toLowerCase();
function entryMatches(id) {
  const q = query(); if (!q) return true;
  if (charInfo(id).name.toLowerCase().includes(q)) return true;
  return JSON.stringify(entryOf(id) || {}).toLowerCase().includes(q);
}

// ---- 左側角色清單 ----
function renderList() {
  const list = $d('characterList'); list.innerHTML = '';
  const ids = Object.keys(draft.characters);
  const groups = [['戰鬥人員', ids.filter(id => ['sentinel', 'guide'].includes(charInfo(id).kind))],
                  ['非戰鬥人員', ids.filter(id => !['sentinel', 'guide'].includes(charInfo(id).kind))],
                  ['其他', [DEFAULT_ID]]];
  let total = 0;
  for (const [title, members] of groups) {
    if (!members.length) continue;
    const h = document.createElement('div'); h.className = 'list-group'; h.textContent = title; list.appendChild(h);
    for (const id of members) {
      const info = charInfo(id), n = countLines(entryOf(id)); total += n;
      const b = document.createElement('button');
      b.className = 'character-item' + (id === selected ? ' selected' : '') + (entryMatches(id) ? '' : ' dim');
      b.innerHTML = portraitHtml(info, '') + '<span><b>' + esc(info.name) + '</b><small>' +
        (id === DEFAULT_ID ? '沒填專屬台詞時使用' : (KIND_LABEL[info.kind] || '')) + '</small></span><em class="count">' + n + ' 句</em>';
      b.addEventListener('click', () => { selected = id; renderAll(); });
      list.appendChild(b);
    }
  }
  $d('total').textContent = '共 ' + total + ' 句';
}

// ---- 台詞清單（一個陣列）----
function linesEditor(container, arr, opt = {}) {
  const box = document.createElement('div'); box.className = 'lines';
  const q = query();
  const redraw = () => { box.innerHTML = ''; build(); };
  function build() {
    if (!arr.length) {
      const e = document.createElement('div'); e.className = 'empty';
      e.textContent = opt.emptyText || '還沒有台詞。';
      box.appendChild(e);
    }
    arr.forEach((text, i) => {
      const row = document.createElement('div'); row.className = 'line';
      row.innerHTML = '<span class="num">' + (opt.ordered ? (i + 1) + '.' : '•') + '</span>';
      const input = document.createElement('input');
      input.value = text; input.placeholder = '輸入台詞…';
      if (q && text.toLowerCase().includes(q)) input.classList.add('hit');
      input.addEventListener('input', () => { arr[i] = input.value; changed(false); });
      row.appendChild(input);
      const mk = (label, title, fn, cls = '') => {
        const b = document.createElement('button'); b.className = 'icon ' + cls; b.textContent = label; b.title = title;
        b.addEventListener('click', fn); row.appendChild(b); return b;
      };
      mk('↑', '往上移', () => { [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]; changed(); redraw(); }).disabled = i === 0;
      mk('↓', '往下移', () => { [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]]; changed(); redraw(); }).disabled = i === arr.length - 1;
      mk('✕', '刪除這句', () => { arr.splice(i, 1); changed(); redraw(); }, 'del');
      box.appendChild(row);
    });
  }
  build();
  container.appendChild(box);
  const actions = document.createElement('div'); actions.className = 'row-actions';
  const add = document.createElement('button'); add.className = 'small'; add.textContent = '＋ 新增一句';
  add.addEventListener('click', () => {
    arr.push(''); changed(); redraw();
    const inputs = box.querySelectorAll('input'); inputs[inputs.length - 1]?.focus();
  });
  actions.appendChild(add);
  container.appendChild(actions);
  return actions;
}

// 一個情境欄位：支援「不分章節的陣列」與「依章節分組」
function fieldEditor(container, obj, key, opt) {
  if (!Array.isArray(obj[key]) && !(obj[key] && typeof obj[key] === 'object')) obj[key] = [];
  const value = obj[key];
  if (Array.isArray(value)) {
    const actions = linesEditor(container, value, opt);
    if (opt.chapters !== false) {
      const b = document.createElement('button'); b.className = 'small'; b.textContent = '改成依章節分組';
      b.title = '不同章節說不同的話（例如劇情推進後改變台詞）';
      b.addEventListener('click', () => { obj[key] = { 1: value }; changed(); renderEditor(); });
      actions.appendChild(b);
    }
    return;
  }
  // 依章節分組：{ 章節: 陣列 }
  const keys = Object.keys(value).sort((a, b) => a - b);
  for (const ch of keys) {
    const wrap = document.createElement('div'); wrap.className = 'chapter';
    const head = document.createElement('div'); head.className = 'chapter-head';
    head.innerHTML = '從第 ';
    const n = document.createElement('input'); n.type = 'number'; n.min = 1; n.value = ch;
    n.addEventListener('change', () => {
      const to = String(Math.max(1, parseInt(n.value) || 1));
      if (to !== ch && !value[to]) { value[to] = value[ch]; delete value[ch]; changed(); renderEditor(); } else n.value = ch;
    });
    head.appendChild(n);
    head.insertAdjacentHTML('beforeend', ' 章開始使用');
    const del = document.createElement('button'); del.className = 'small danger'; del.textContent = '刪除這個章節';
    del.addEventListener('click', () => {
      if (!confirm('確定刪除第 ' + ch + ' 章起的這組台詞嗎？')) return;
      delete value[ch];
      if (!Object.keys(value).length) obj[key] = [];
      changed(); renderEditor();
    });
    head.appendChild(del);
    wrap.appendChild(head);
    linesEditor(wrap, value[ch], opt);
    container.appendChild(wrap);
  }
  const actions = document.createElement('div'); actions.className = 'row-actions';
  const add = document.createElement('button'); add.className = 'small'; add.textContent = '＋ 新增章節';
  add.addEventListener('click', () => {
    const next = Math.max(...Object.keys(value).map(Number), 0) + 1;
    value[next] = []; changed(); renderEditor();
  });
  actions.appendChild(add);
  if (keys.length === 1) {
    const flat = document.createElement('button'); flat.className = 'small'; flat.textContent = '改回不分章節';
    flat.addEventListener('click', () => { obj[key] = value[keys[0]]; changed(); renderEditor(); });
    actions.appendChild(flat);
  }
  container.appendChild(actions);
}

function situationBox(parent, title, whenHtml, count, extraCls = '') {
  const box = document.createElement('div'); box.className = 'situation ' + extraCls;
  box.innerHTML = '<div class="sit-head"><h3>' + esc(title) + '</h3><span class="count">' + count + ' 句</span></div><p class="when">' + whenHtml + '</p>';
  parent.appendChild(box);
  return box;
}

// ---- 右側：選中角色的所有情境 ----
function renderEditor() {
  const info = charInfo(selected), entry = entryOf(selected) || {};
  $d('hero').innerHTML = portraitHtml(info, '') +
    '<div><span class="tag">' + (selected === DEFAULT_ID ? '備用' : (KIND_LABEL[info.kind] || '')) + '</span><h2>' + esc(info.name) + '</h2><p>' +
    (selected === DEFAULT_ID ? '角色的「汙染與暴走」情境沒有填寫專屬台詞時，會改用這裡的台詞。'
                              : '共 ' + countLines(entry) + ' 句台詞。') + '</p></div>';
  const ed = $d('editor'); ed.innerHTML = '';
  const q = query();
  let lastGroup = '';
  for (const s of SITUATIONS) {
    if (!(s.key in entry)) continue;
    if (s.group !== lastGroup) {
      lastGroup = s.group;
      const g = document.createElement('div'); g.className = 'group-title'; g.textContent = s.group; ed.appendChild(g);
    }
    const lines = allLines(entry[s.key]);
    const hit = q && lines.some(l => l.toLowerCase().includes(q));
    let when = s.when;
    if (s.name) when += ' 可以用 <code>{name}</code> 代表攻擊他的人的名字。';
    if (s.ordered) when += ' 可以用 ↑↓ 調整順序。';
    const box = situationBox(ed, s.label, when, lines.length, hit ? 'match' : '');
    fieldEditor(box, entry, s.key, {
      ordered: s.ordered,
      emptyText: s.fallback && selected !== DEFAULT_ID ? '沒有專屬台詞，會改用「通用台詞」。' : '還沒有台詞，這個情境不會說話。',
    });
  }
  if (entry.rage) renderRage(ed, entry.rage);
}

// ---- 狂戰士人格 ----
function renderRage(ed, rage) {
  const g = document.createElement('div'); g.className = 'group-title'; g.textContent = '狂戰士人格（高汙染時性格大變）'; ed.appendChild(g);
  const box = document.createElement('div'); box.className = 'situation rage'; ed.appendChild(box);
  box.innerHTML = '<p class="when">汙染到<b>門檻</b>以上時，說話方式完全改變；被疏導後恢復原本的個性。下面每個欄位<b>沒填就沿用一般台詞</b>。</p>';
  const toggle = document.createElement('label'); toggle.className = 'rage-toggle';
  toggle.innerHTML = '<input type="checkbox"' + (rage.enabled ? ' checked' : '') + '> 啟用狂戰士人格';
  toggle.querySelector('input').addEventListener('change', e => { rage.enabled = e.target.checked; changed(); renderEditor(); });
  box.appendChild(toggle);
  const body = document.createElement('div'); body.className = 'rage-body' + (rage.enabled ? '' : ' off'); box.appendChild(body);
  rage.bubble = rage.bubble || { bg: '#3a1012', bd: '#ff4d4d', tx: '#ffd0d0' };
  const settings = document.createElement('div'); settings.className = 'rage-settings'; body.appendChild(settings);
  const num = (label, key, min, max, step) => {
    const l = document.createElement('label'); l.innerHTML = label;
    const i = document.createElement('input'); i.type = 'number'; i.min = min; i.max = max; i.step = step; i.value = rage[key];
    i.addEventListener('change', () => { rage[key] = Math.max(min, Math.min(max, parseFloat(i.value) || min)); i.value = rage[key]; changed(false); });
    l.appendChild(i); settings.appendChild(l);
  };
  num('變身門檻（汙染值）', 'at', 1, 99, 1);
  num('多話程度（越小越多話）', 'talkGap', .1, 1, .05);
  const preview = document.createElement('div');
  const paint = () => {
    const sample = allLines(rage.battle)[0] || allLines(rage.onset)[0] || '哈哈！再來！';
    preview.innerHTML = '<span class="bubble" style="background:' + rage.bubble.bg + ';border-color:' + rage.bubble.bd + ';color:' + rage.bubble.tx + '">' + esc(sample) + '</span>';
  };
  for (const [k, label] of [['bg', '泡泡底色'], ['bd', '框線'], ['tx', '文字']]) {
    const l = document.createElement('label'); l.innerHTML = label;
    const i = document.createElement('input'); i.type = 'color'; i.value = rage.bubble[k];
    i.addEventListener('input', () => { rage.bubble[k] = i.value; paint(); changed(false); });
    l.appendChild(i); settings.appendChild(l);
  }
  const pl = document.createElement('label'); pl.textContent = '泡泡預覽'; pl.appendChild(preview); settings.appendChild(pl);
  paint();
  for (const f of RAGE_FIELDS) {
    const sub = document.createElement('div'); sub.className = 'sub';
    const n = allLines(rage[f.key]).length;
    sub.innerHTML = '<h4>' + esc(f.label) + ' <span class="count">' + n + ' 句</span></h4><p class="when">' + f.when +
      (f.name ? ' 可以用 <code>{name}</code> 代表攻擊他的人。' : '') + '</p>';
    fieldEditor(sub, rage, f.key, { emptyText: '沒填，會沿用一般台詞。' });
    // 依疏導者的專屬台詞（被疏導後的兩種情境）
    if (f.key === 'relief' || f.key === 'soothed') {
      const byKey = f.key + 'By';
      rage[byKey] = rage[byKey] || {};
      for (const [sid, sname] of Object.entries(SOOTHERS)) {
        const has = Array.isArray(rage[byKey][sid]);
        const wrap = document.createElement('div'); wrap.className = 'chapter';
        wrap.innerHTML = '<div class="chapter-head">被<b style="color:#ffd7a0">' + sname + '</b>疏導時的專屬台詞' + (has ? '' : '（沒有，用上面那組）') + '</div>';
        if (has) {
          linesEditor(wrap, rage[byKey][sid], { emptyText: '沒填，用上面那組。' });
          const del = document.createElement('button'); del.className = 'small danger'; del.textContent = '移除' + sname + '專屬台詞';
          del.addEventListener('click', () => { delete rage[byKey][sid]; changed(); renderEditor(); });
          wrap.lastChild.appendChild(del);
        } else {
          const add = document.createElement('button'); add.className = 'small'; add.textContent = '＋ 加入' + sname + '專屬台詞';
          add.addEventListener('click', () => { rage[byKey][sid] = ['']; changed(); renderEditor(); });
          wrap.appendChild(add);
        }
        sub.appendChild(wrap);
      }
    }
    body.appendChild(sub);
  }
}

// ---- 存檔／匯出 ----
let saveTimer = null;
function changed(rerenderList = true) {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveDraft, 300);
  if (rerenderList) renderList();
  else clearTimeout(changed.listTimer), changed.listTimer = setTimeout(renderList, 400);
}
function saveDraft() {
  try {
    localStorage.setItem(DIALOGUE_DRAFT_KEY, JSON.stringify(draft));
    setStatus('已自動儲存在這台瀏覽器。下載 dialogues.js 並取代檔案後，遊戲才會套用。');
  } catch (_) { setStatus('瀏覽器草稿儲存失敗；請先下載檔案。', true); }
  if ($d('exportOut').classList.contains('visible')) $d('exportOut').value = exportSource();
}
function setStatus(msg, error = false) { const s = $d('status'); s.textContent = msg; s.style.color = error ? '#ffb2ad' : '#8ce0be'; }
// 匯出時把空白台詞清掉
function cleaned() {
  const out = clone(draft);
  const clean = v => Array.isArray(v) ? v.map(s => String(s).trim()).filter(Boolean)
    : (v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, clean(x)])) : v);
  for (const entry of [...Object.values(out.characters), out.default || {}]) {
    for (const [k, v] of Object.entries(entry)) {
      if (k !== 'rage') { entry[k] = clean(v); continue; }
      for (const f of RAGE_FIELDS) if (v[f.key] != null) v[f.key] = clean(v[f.key]);
      for (const byKey of ['reliefBy', 'soothedBy']) if (v[byKey]) v[byKey] = clean(v[byKey]);
    }
  }
  return out;
}
function exportSource() {
  return '/* 對話資料：所有角色的台詞與說話情境。請用「對話編輯器.html」編輯，下載後取代這個檔案。 */\n' +
    'const DIALOGUES = ' + JSON.stringify(cleaned(), null, 2) + ';\n';
}
$d('download').addEventListener('click', () => {
  const blob = new Blob([exportSource()], { type: 'text/javascript;charset=utf-8' });
  const url = URL.createObjectURL(blob), link = document.createElement('a');
  link.href = url; link.download = 'dialogues.js'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  setStatus('已下載 dialogues.js。請取代遊戲的 data/dialogues.js，再重新整理遊戲。');
});
$d('showExport').addEventListener('click', () => {
  const area = $d('exportOut'); area.classList.toggle('visible');
  if (area.classList.contains('visible')) area.value = exportSource();
});
$d('reset').addEventListener('click', () => {
  if (!confirm('確定丟棄這台瀏覽器裡的對話草稿，從目前的 data/dialogues.js 重新載入嗎？')) return;
  draft = clone(DIALOGUES); localStorage.removeItem(DIALOGUE_DRAFT_KEY);
  if (!draft.characters[selected] && selected !== DEFAULT_ID) selected = Object.keys(draft.characters)[0];
  renderAll(); setStatus('已從目前的對話檔重新載入。');
});
$d('search').addEventListener('input', () => {
  renderList();
  const q = query();
  if (q && !entryMatches(selected)) {   // 目前角色沒有符合的台詞，就跳到第一個有的
    const first = [...Object.keys(draft.characters), DEFAULT_ID].find(entryMatches);
    if (first) { selected = first; renderAll(); return; }
  }
  renderEditor();
});
function renderAll() { renderList(); renderEditor(); }
renderAll();
if (usingDraft) setStatus('已載入這台瀏覽器裡尚未下載的草稿。');
