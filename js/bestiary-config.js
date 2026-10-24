/* ===== 怪物圖鑑：設定與畫面（遊戲 js/bestiary.js、怪物圖鑑編輯器 js/bestiary-editor.js 共用）=====
   資料在 data/bestiary.js 的 BESTIARY_CONFIG（由「📕 怪物圖鑑編輯器」匯出）：
   ・layout：每一塊的位置、大小、文字大小（px，以 1060×620 的圖鑑視窗為準；遊戲視窗比較小時整個等比例縮小）
   ・texts：標題、按鈕等文字；style：星星最多幾顆、圖片框要不要框線、練習室打死的算不算
   ・monsters：每一隻怪物的名稱、星級、能力（最多 4 條，1 在最上面往下排，位置固定）、背景介紹、圖片、自己的圖片框（imageBox：位置、大小）、縮圖（大小／位移）
   ・order：怪物的排列順序（沒列到的接在後面）
   怪物清單＝怪物編輯器的怪物（data/monsters.js）＋史萊姆的變體（分裂、自爆、吐酸、巨型、小史萊姆）。
   遊戲裡「消滅過」的怪物才會出現縮圖，還沒消滅過的是黑底問號；消滅次數由遊戲自己記（js/bestiary.js）。
   必須在 data/monsters.js、js/monster-data.js、data/bestiary.js 之後載入。
*/
const BESTIARY_W = 1060, BESTIARY_H = 620;   // 圖鑑視窗的設計大小（版面的 px 都以這個為準）
const BESTIARY_MAX_ABILITIES = 4;
// 每一塊：[id, 編輯器裡的名稱, 有沒有文字]
const BESTIARY_BLOCKS = [
  ['leftPanel', '左側大框', false],
  ['rightPanel', '右側大框', false],
  ['infoPanel', '基礎訊息框', false],
  ['title', '「怪物圖鑑」標題', true],
  ['name', '怪物名稱', true],
  ['image', '怪物圖片框（每隻怪物分開；圖片放進框裡、以框的中心為準）', false],
  ['abilities', '怪物能力（1 在最上面，往下排）', true],
  ['stars', '星級（怪物等級）', true],
  ['sort', '排序按鈕（照星級／名字／消滅次數，點一下換下一種）', true],
  ['grid', '怪物縮圖區', false],
  ['prev', '上一頁按鈕', true],
  ['next', '下一頁按鈕', true],
  ['infoTitle', '「基礎訊息」標題', true],
  ['kills', '消滅次數', true],
  ['about', '背景介紹文字', true],
  ['close', '關閉按鈕', true],
];
const BESTIARY_LAYOUT_DEFAULT = {
  leftPanel: { x: 16, y: 66, w: 484, h: 540 },
  rightPanel: { x: 516, y: 14, w: 528, h: 592 },
  infoPanel: { x: 532, y: 290, w: 496, h: 300 },
  title: { x: 16, y: 14, w: 190, h: 42, font: 20 },
  name: { x: 300, y: 14, w: 200, h: 42, font: 17 },
  image: { x: 98, y: 85, w: 320, h: 320 },   // 320×320，放在左側大框裡、怪物能力上面的正中間
  abilities: { x: 32, y: 424, w: 452, h: 166, font: 13, rowH: 34, gap: 7 },   // rowH 每一條的高度、gap 條和條的間距
  stars: { x: 552, y: 30, w: 260, h: 38, font: 20 },   // 寬 260：放得下 10 顆星
  sort: { x: 828, y: 30, w: 164, h: 38, font: 14 },    // 星級右邊、關閉按鈕左邊
  grid: { x: 566, y: 84, w: 428, h: 190, cols: 7, rows: 3, gap: 10 },        // cols × rows＝一頁幾格
  prev: { x: 530, y: 159, w: 28, h: 40, font: 30 },
  next: { x: 1002, y: 159, w: 28, h: 40, font: 30 },
  infoTitle: { x: 548, y: 302, w: 132, h: 34, font: 16 },
  kills: { x: 692, y: 305, w: 150, h: 28, font: 13 },
  about: { x: 548, y: 348, w: 464, h: 228, font: 13 },
  close: { x: 1006, y: 26, w: 30, h: 30, font: 19 },
};
const BESTIARY_TEXT_DEFAULT = {
  title: '怪物圖鑑',
  infoTitle: '基礎訊息',
  kills: '消滅次數：{n}次',        // {n}＝消滅次數
  noName: '？？？',                // 還沒選怪物時，名稱欄顯示的字
  empty: '還沒有消滅過任何怪物。\n到戰鬥區域消滅怪物，就會記錄在這裡。',
  unknown: '?',                    // 還沒消滅過的怪物：黑底上的字
  prev: '‹', next: '›', close: '×',
  star: '★',
  sortStars: '照星級排序', sortName: '照名字排序', sortKills: '照消滅次數排序',   // 排序按鈕：現在照什麼排
};
// ---- 縮圖的排序（排序按鈕，點一下換下一種）----
// stars＝星級少的在前（星級一樣的：同一個系列排在一起，例如史萊姆系列、虱目魚系列、小丑魚系列）；name＝名字第一個字筆劃少的在前（瀏覽器的筆劃排序）；kills＝消滅次數多的在前
// 一樣的時候照編輯器排的順序（order）。null＝不排序（只有怪物圖鑑編輯器的預覽會用：照編輯器的順序）
const BESTIARY_SORTS = ['stars', 'name', 'kills'];
const BESTIARY_SORT_TEXT = { stars: 'sortStars', name: 'sortName', kills: 'sortKills' };
const bestiaryStroke = (() => { try { return new Intl.Collator('zh-Hant-TW-u-co-stroke').compare; } catch (_) { return (a, b) => String(a).localeCompare(String(b), 'zh-Hant'); } })();
// 同一個系列：key 冒號前面那段，再拿掉結尾的 _small（slime:splitter → slime、milkfish_kid_small → milkfish_kid、clownfish_small → clownfish）
const bestiaryFamily = key => String(key).split(':')[0].replace(/_small$/, '');
function bestiarySorted(list, mode, kills) {
  const fam = {};   // 每個系列第一次出現在第幾個（照星級排時：星級一樣的，同一個系列排在一起，系列之間照編輯器的順序）
  list.forEach((e, i) => { const f = bestiaryFamily(e.key); if (!(f in fam)) fam[f] = i; });
  const k = kills || {}, by = {
    stars: (a, b) => a.stars - b.stars || fam[bestiaryFamily(a.key)] - fam[bestiaryFamily(b.key)],
    name: (a, b) => bestiaryStroke(a.name, b.name),
    kills: (a, b) => (k[b.key] || 0) - (k[a.key] || 0),
  }[mode];
  return by ? list.map((e, i) => [e, i]).sort((a, b) => by(a[0], b[0]) || a[1] - b[1]).map(x => x[0]) : list.slice();   // 一樣的照原本的順序
}
const bestiaryNextSort = mode => BESTIARY_SORTS[(BESTIARY_SORTS.indexOf(mode) + 1) % BESTIARY_SORTS.length];
const BESTIARY_STYLE_DEFAULT = {
  maxStars: 10,         // 星星最多幾顆（沒亮的用暗色顯示）
  imageFrame: true,     // 怪物圖片框：要不要畫框線和底色
  countPractice: false, // B1 訓練室（練習模式）打死的也算進圖鑑
};
// 每一隻怪物沒有設定時的預設值
const BESTIARY_MONSTER_DEFAULT = { stars: 1, imgScale: 100, imgX: 0, imgY: 0, thumbScale: 170, thumbX: 0, thumbY: 14 };

const bestiaryCfg = cfg => cfg || (typeof BESTIARY_CONFIG !== 'undefined' ? BESTIARY_CONFIG : {});
function bestiaryLayout(cfg) {   // 預設版面＋設定檔裡改過的
  const own = bestiaryCfg(cfg).layout || {}, out = {};
  for (const [id, d] of Object.entries(BESTIARY_LAYOUT_DEFAULT)) {
    out[id] = { ...d };
    for (const k of Object.keys(d)) if (own[id] && Number.isFinite(Number(own[id][k]))) out[id][k] = Number(own[id][k]);
  }
  return out;
}
const bestiaryTexts = cfg => ({ ...BESTIARY_TEXT_DEFAULT, ...(bestiaryCfg(cfg).texts || {}) });
const bestiaryStyle = cfg => ({ ...BESTIARY_STYLE_DEFAULT, ...(bestiaryCfg(cfg).style || {}) });

// ---- 菁英怪（地圖 BOSS）：遊戲裡是拿原本的怪物加強出來的，圖鑑裡當成另一隻（key＝原本的 id + ':elite'，接在原本那隻後面）----
// 新增菁英怪時在這裡加一行：of＝拿哪一隻怪物加強、def＝那隻菁英怪的設定（名稱 name、換色 hue；圖片跟原本那隻一樣）
// 消滅次數另外算（js/bestiary.js 的 bestiaryKeyOf）
const BESTIARY_ELITES = [
  { of: 'bird_head', def: () => typeof ELITE_BIRD !== 'undefined' ? ELITE_BIRD : { name: '鳥頭大隊長', hue: -35 } },   // js/elite-bird-head.js（沒載入時用括號裡的）
];
// ---- 遊戲裡有哪些怪物：怪物編輯器的怪物＋史萊姆變體＋菁英怪 ----
function bestiaryBaseList() {
  const cat = typeof ACTIVE_MONSTERS !== 'undefined' ? ACTIVE_MONSTERS : (typeof monsterCatalog === 'function' ? monsterCatalog() : []);
  const variants = typeof slimeSettings === 'function' ? slimeSettings().variants : [];
  const out = [];
  for (const m of cat) {
    if (m.id !== 'slime') {
      out.push({ key: m.id, name: m.name, image: m.sprite, hue: null });
      for (const el of BESTIARY_ELITES) if (el.of === m.id) { const d = el.def(); out.push({ key: m.id + ':elite', name: d.name, image: m.sprite, hue: Number.isFinite(d.hue) ? d.hue : null }); }
      continue;
    }
    for (const v of variants.length ? variants : [{ id: 'normal', name: m.name }]) {   // 史萊姆：每一種變體各一隻（顏色跟遊戲一樣）
      out.push({ key: v.id === 'normal' ? 'slime' : 'slime:' + v.id, name: v.name || m.name, image: m.sprite, hue: v.id === 'normal' || !v.hue ? null : v.hue });
    }
  }
  return out;
}
const bestiaryNum = (v, d) => Number.isFinite(Number(v)) && v !== '' && v !== null ? Number(v) : d;
const bestiaryBox = b => b && ['x', 'y', 'w', 'h'].every(k => Number.isFinite(Number(b[k]))) ? { x: +b.x, y: +b.y, w: Math.max(8, +b.w), h: Math.max(8, +b.h) } : null;
// 圖鑑裡的怪物（照 order 排）：withHidden＝連「不放進圖鑑」的也列出來（編輯器用）
function bestiaryEntries(cfg, withHidden = false) {
  const c = bestiaryCfg(cfg), base = bestiaryBaseList(), mons = c.monsters || {}, order = Array.isArray(c.order) ? c.order : [], D = BESTIARY_MONSTER_DEFAULT;
  const list = base.map((b, i) => {
    const o = mons[b.key] || {};
    return {
      key: b.key, baseName: b.name, baseImage: b.image, baseHue: b.hue, index: i,
      name: o.name || b.name, image: o.image || b.image, hue: o.hue === null ? null : bestiaryNum(o.hue, b.hue),
      stars: bestiaryNum(o.stars, D.stars),
      abilities: Array.from({ length: BESTIARY_MAX_ABILITIES }, (_, k) => String((Array.isArray(o.abilities) ? o.abilities : [])[k] ?? '')),
      about: String(o.about || ''),
      imgScale: bestiaryNum(o.imgScale, D.imgScale), imgX: bestiaryNum(o.imgX, D.imgX), imgY: bestiaryNum(o.imgY, D.imgY),
      thumbScale: bestiaryNum(o.thumbScale, D.thumbScale), thumbX: bestiaryNum(o.thumbX, D.thumbX), thumbY: bestiaryNum(o.thumbY, D.thumbY),
      imageBox: bestiaryBox(o.imageBox),   // 這隻自己的怪物圖片框（沒調過＝null，用 layout.image）
      hidden: !!o.hidden,
    };
  });
  const rank = e => { const i = order.indexOf(e.key); return i < 0 ? order.length + e.index : i; };
  list.sort((a, b) => rank(a) - rank(b));
  return withHidden ? list : list.filter(e => !e.hidden);
}

// ---- 畫面：遊戲和編輯器的預覽用同一份 ----
const bestiaryEsc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const bestiaryPos = b => 'left:' + b.x + 'px;top:' + b.y + 'px;width:' + b.w + 'px;height:' + b.h + 'px' + (b.font ? ';font-size:' + b.font + 'px' : '');
// 圖片：先照框的大小等比例放大／縮小（整張放得進去），再乘上大小（%）、移動位移（px）；史萊姆變體換色跟遊戲一樣
//   大小是以圖片的中心縮放（css/style.css 的 .bst-art），只動圖片本身，框和背景不動（怪物圖鑑編輯器每隻的「怪物圖片大小／位移」）
const bestiaryArtStyle = (scale, x, y, hue) => '--s:' + (scale / 100) + ';--x:' + x + 'px;--y:' + y + 'px' + (hue != null ? ';filter:hue-rotate(' + hue + 'deg) saturate(1.35)' : '');
// 能力：「名稱：說明」的名稱用金色
const bestiaryAbility = t => { const s = bestiaryEsc(t), i = s.indexOf('：'); return i > 0 ? '<b>' + s.slice(0, i + 1) + '</b>' + s.slice(i + 1) : s; };
// st：{ entries, kills: { key: 次數 }, sel: 選到的 key, page: 第幾頁 }
function bestiaryPageCount(cfg, n) { const g = bestiaryLayout(cfg).grid, per = Math.max(1, g.cols * g.rows); return Math.max(1, Math.ceil(n / per)); }
function bestiaryHtml(cfg, st) {
  const L = bestiaryLayout(cfg), T = bestiaryTexts(cfg), S = bestiaryStyle(cfg);
  const list = st.entries, kills = st.kills || {}, known = e => (kills[e.key] || 0) > 0;
  const per = Math.max(1, L.grid.cols * L.grid.rows), pages = bestiaryPageCount(cfg, list.length), page = Math.max(0, Math.min(pages - 1, st.page | 0));
  const sel = list.find(e => e.key === st.sel && known(e)) || null;
  // 一塊：位置、大小照 layout；more＝這塊另外加的樣式
  const block = (id, cls, inner, tag = 'div', attr = '', more = '', box = L[id]) => '<' + tag + (tag === 'button' ? ' type="button"' : '') + ' class="bst-block bst-' + id + (cls ? ' ' + cls : '') + '" data-block="' + id + '" style="' + bestiaryPos(box) + more + '"' + attr + '>' + inner + '</' + tag + '>';
  // 左邊：怪物圖片、能力
  const art = sel ? '<img class="bst-art" src="' + bestiaryEsc(sel.image) + '" alt="" style="' + bestiaryArtStyle(sel.imgScale, sel.imgX, sel.imgY, sel.hue) + '">'
    : '<p class="bst-empty">' + bestiaryEsc(list.some(known) ? '' : T.empty) + '</p>';
  // 能力 1～4 的位置固定（1 在最上面，往下排）：沒寫的那一條還是佔著位置、只是看不到，不會讓下面的往上補位
  const abil = sel ? Array.from({ length: BESTIARY_MAX_ABILITIES }, (_, k) => String(sel.abilities[k] || '').trim()) : [];
  const rows = abil.map((t, i) => '<div class="bst-ability' + (t ? '' : ' empty') + '" data-ability="' + (i + 1) + '" style="height:' + L.abilities.rowH + 'px">' + (t ? bestiaryAbility(t) : '') + '</div>').join('');
  // 右邊：星級、縮圖、基礎訊息
  const max = Math.max(1, S.maxStars | 0), on = sel ? Math.max(0, Math.min(max, sel.stars | 0)) : 0;
  // data-star＝第幾顆（怪物圖鑑編輯器的預覽：點第 n 顆＝這隻設成 n 星）
  const stars = Array.from({ length: max }, (_, i) => '<i class="' + (i < on ? 'on' : 'off') + '" data-star="' + (i + 1) + '">' + bestiaryEsc(T.star) + '</i>').join('');
  const g = L.grid, cell = Math.max(10, Math.min((g.w - g.gap * (g.cols - 1)) / g.cols, (g.h - g.gap * (g.rows - 1)) / g.rows));
  const cells = Array.from({ length: per }, (_, i) => {
    const e = list[page * per + i];
    if (!e) return '<span class="bst-cell blank"></span>';
    if (!known(e)) return '<span class="bst-cell unknown" data-key="' + bestiaryEsc(e.key) + '" title="尚未發現">' + bestiaryEsc(T.unknown) + '</span>';
    return '<button type="button" class="bst-cell known' + (sel && sel.key === e.key ? ' sel' : '') + '" data-key="' + bestiaryEsc(e.key) + '" title="' + bestiaryEsc(e.name) + '">' +
      '<img src="' + bestiaryEsc(e.image) + '" alt="" style="' + bestiaryArtStyle(e.thumbScale, e.thumbX, e.thumbY, e.hue) + '"></button>';
  }).join('');
  const kn = sel ? kills[sel.key] || 0 : 0;
  const killText = bestiaryEsc(T.kills).replace('{n}', '<b>' + (sel ? kn : '?') + '</b>');
  return '<section class="bst-card" role="dialog" aria-modal="true" aria-label="' + bestiaryEsc(T.title) + '" style="width:' + BESTIARY_W + 'px;height:' + BESTIARY_H + 'px">' +
    block('leftPanel', '', '') + block('rightPanel', '', '') + block('infoPanel', '', '') +
    block('title', '', bestiaryEsc(T.title), 'h2') +
    block('name', sel ? '' : 'none', bestiaryEsc(sel ? sel.name : T.noName)) +
    block('image', S.imageFrame ? 'framed' : '', art, 'div', '', '', sel && sel.imageBox ? sel.imageBox : L.image) +   // 怪物圖片框：每隻自己的（沒調過＝預設的）
    block('abilities', '', rows, 'div', '', ';gap:' + L.abilities.gap + 'px') +
    block('stars', '', stars) +
    block('sort', '', bestiaryEsc(st.sort ? T[BESTIARY_SORT_TEXT[st.sort]] : '編輯器的順序'), 'button', ' aria-label="換排序方式"') +   // 排序按鈕：寫現在照什麼排（st.sort；entries 要先用 bestiarySorted 排好）
    block('grid', '', cells, 'div', '', ';grid-template-columns:repeat(' + g.cols + ',' + cell + 'px);grid-auto-rows:' + cell + 'px;gap:' + g.gap + 'px') +
    block('prev', page > 0 ? '' : 'off', bestiaryEsc(T.prev), 'button', ' aria-label="上一頁"' + (page > 0 ? '' : ' disabled')) +
    block('next', page < pages - 1 ? '' : 'off', bestiaryEsc(T.next), 'button', ' aria-label="下一頁"' + (page < pages - 1 ? '' : ' disabled')) +
    block('infoTitle', '', bestiaryEsc(T.infoTitle)) +
    block('kills', '', killText) +
    block('about', '', sel ? bestiaryEsc(sel.about) : '') +
    block('close', '', bestiaryEsc(T.close), 'button', ' aria-label="關閉（Esc）"') +
    (pages > 1 ? '<span class="bst-page" style="left:' + (L.grid.x + L.grid.w / 2) + 'px;top:' + (L.grid.y + L.grid.h + 2) + 'px">' + (page + 1) + ' / ' + pages + '</span>' : '') +
    '</section>';
}
