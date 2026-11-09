/* ===== T-Pad 裡的「地圖」App：基地樓層示意圖（js/tpad.js 會把它畫在平板螢幕裡）=====
   ・左邊：樓層（目前所在的樓層有藍點）＋這層樓的人；點名字＝在地圖上標出那個人。
   ・右邊：這層樓每個房間的形狀（地圖的地板格），標出自己的位置、出入口、樓梯、電梯、鎖住的門、NPC。
   ・房間怎麼排：data/base-floorplan.js（手寫）；樓層從地圖名稱開頭讀；NPC 在哪：data/npc-locations.js（js/sentry.js 的 npcLocation）。
   ・同一張地圖裡的人用遊戲中的實際位置；別張地圖的人用出生格／活動範圍中間。
   ・基地（安全區）：樓層示意圖。戰鬥區域沒有訊號：要裝備「慣性導航記錄器」，才看得到自己走過的地方（下面「戰鬥區域」那一段）。
   必須在 data/base-maps.js、data/base-floorplan.js、js/sentry.js、js/maploader.js 之後載入。
*/
let tmapFloor = null, tmapSel = null, tmapRoomSel = null;   // tmapFloor：正在看的樓層（null＝目前所在的樓層）；tmapSel：點選的人；tmapRoomSel：點選的房間
const TMAP_FLOOR_RE = /^\s*(B-?\d+F?|\d+F)\s*[-－・]?\s*/i;   // 跟電梯選單（js/game.js）同一種寫法
const TMAP_KIND_COLOR = { sentinel: '#ff8a5c', guide: '#4fd1c5', support: '#e6a1ff' };
const TMAP_KIND_NAME = { sentinel: '哨兵', guide: '嚮導', support: '其他人員' };
const TMAP_MARK = 1.4;   // 地圖上的標記（人、門、樓梯…）放大幾倍：房間縮小時字和點還是看得清楚
const tmapEsc = t => String(t ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

function tmapParseFloor(name) {
  const hit = TMAP_FLOOR_RE.exec(String(name || '')); if (!hit) return null;
  const label = hit[1].toUpperCase().replace('-', '').replace(/^(B\d+)F$/, '$1');
  const num = Number(label.replace(/\D/g, ''));
  return { label, n: label.startsWith('B') ? -num : num, rest: String(name).slice(hit[0].length).trim() || label };
}
function tmapMaps() {
  const hidden = (typeof BASE_FLOORPLAN !== 'undefined' && BASE_FLOORPLAN.hidden) || [];
  return (typeof BASE_MAPS !== 'undefined' ? BASE_MAPS : []).filter(m => m.safe !== false && !hidden.includes(m.name) && tmapParseFloor(m.name));
}
// 每層樓：{ label, n, rooms:[{ map, name, x, y, w, h }] }，高樓層排上面
function tmapFloors() {
  const pos = (typeof BASE_FLOORPLAN !== 'undefined' && BASE_FLOORPLAN.rooms) || {};
  const floors = new Map();
  for (const m of tmapMaps()) {
    const f = tmapParseFloor(m.name);
    if (!floors.has(f.label)) floors.set(f.label, { label: f.label, n: f.n, rooms: [] });
    const at = pos[m.name], k = (at && at[2]) || 1;   // 第三個數字＝放大倍數（大廳畫大一點）
    floors.get(f.label).rooms.push({ map: m, name: f.rest, at, k, w: m.cols * k, h: m.rows * k });
  }
  for (const f of floors.values()) {   // 沒寫在 data/base-floorplan.js 的房間：排在最下面一排
    let bottom = 0; f.rooms.forEach(r => { if (r.at) bottom = Math.max(bottom, r.at[1] + r.h); });
    let x = 0; const y = f.rooms.some(r => r.at) ? bottom + 3 : 0;
    for (const r of f.rooms) {
      if (r.at) { r.x = r.at[0]; r.y = r.at[1]; }
      else { r.x = x; r.y = y; x += r.w + 3; }
    }
  }
  return [...floors.values()].sort((a, b) => b.n - a.n);
}
function tmapHereMap() { return typeof MAP !== 'undefined' && MAP && MAP_SAFE ? MAP : null; }

// 出入口：相鄰的同一個去處合成一個；去別的樓層＝樓梯
function tmapPortals(room, floor, byId) {
  const groups = [];
  for (const p of room.map.portals || []) {
    const to = byId.get(p.to); if (!to || p.to === room.map.id) continue;   // 同一張地圖裡的傳送點：不算通往別的房間
    const g = groups.find(q => q.to === p.to && Math.abs(q.c / q.k - p.c) <= 2.5 && Math.abs(q.r / q.k - p.r) <= 2.5);
    if (g) { g.c += p.c; g.r += p.r; g.k++; } else groups.push({ to: p.to, c: p.c, r: p.r, k: 1 });
  }
  return groups.map(g => {
    const target = byId.get(g.to), tf = tmapParseFloor(target.name);
    return { to: g.to, toName: target.name, x: room.x + (g.c / g.k + .5) * room.k, y: room.y + (g.r / g.k + .5) * room.k, stair: tf.label !== floor.label ? tf : null };
  });
}
function tmapStampSize(s) {
  const t = typeof mapTileById === 'function' ? mapTileById(s.id) : null;
  return [typeof mapTileW === 'function' ? mapTileW(t) : 1, typeof mapTileH === 'function' ? mapTileH(t) : 1];
}
function tmapElevators(room) {
  const isElev = s => typeof isElevatorStamp === 'function' ? isElevatorStamp(s) : s.id === 'tile_mufxoi3i';
  return (room.map.stamps || []).filter(isElev).map(s => { const [w, h] = tmapStampSize(s); return { x: room.x + (s.c + w / 2) * room.k, y: room.y + (s.r + h - .5) * room.k }; });
}
// 鎖住的門：跟 js/locked-doors.js 同一個判斷（門板範圍裡沒有出入口）
function tmapLocked(room) {
  if (typeof LOCKED_DOOR_TILES === 'undefined') return [];
  const portals = room.map.portals || [];
  return (room.map.stamps || []).filter(s => LOCKED_DOOR_TILES.includes(s.id)).map(s => {
    const [w, h] = tmapStampSize(s);
    if (portals.some(p => p.c >= s.c && p.c < s.c + w && p.r >= s.r && p.r <= s.r + h)) return null;
    return { x: room.x + (s.c + w / 2) * room.k, y: room.y + (s.r + h - .5) * room.k };
  }).filter(Boolean);
}
// 遊戲裡的座標 → 格（小數）
function tmapCellOf(o) { return [(o.x - OX) / CELL, (o.y - OY) / CELL]; }

// 基地裡的人：{ id, name, kind, mapName, c, r }；不在基地的人另外列
function tmapPeople() {
  const table = typeof npcLocationTable === 'function' ? npcLocationTable() : {};
  const here = tmapHereMap(), inBase = [], away = [];
  for (const id of Object.keys(table)) {
    const ch = typeof CHARACTERS !== 'undefined' ? CHARACTERS[id] : null;
    if (ch && ch.kind === 'player') continue;
    const person = { id, name: (ch && ch.name) || id, kind: (ch && ch.kind) || 'support' };
    const loc = typeof npcLocation === 'function' ? npcLocation(id) : table[id];
    if (!loc || !loc.map) { away.push(person); continue; }
    person.mapName = loc.map;
    const live = here && loc.map === here.name && typeof G !== 'undefined' && G
      ? [...(G.towers || []), ...(G.npcs || [])].find(o => (o.type || o.id) === id) : null;
    const rect = loc.rect || (loc.rects && loc.rects[0]);
    if (live) [person.c, person.r] = tmapCellOf(live);
    else if (loc.spawn) [person.c, person.r] = [loc.spawn[0] + .5, loc.spawn[1] + .5];
    else if (rect) [person.c, person.r] = [(rect[0] + rect[2] + 1) / 2, (rect[1] + rect[3] + 1) / 2];
    inBase.push(person);
  }
  return { inBase, away };
}

// 名單上的頭像：角色正面圖裁頭部（js/team.js 的 memberPortraitPath）；哨兵／嚮導／其他人員的顏色點在名字前面
function tmapFace(p) {
  const ch = typeof CHARACTERS !== 'undefined' ? CHARACTERS[p.id] : null;
  const src = ch && typeof memberPortraitPath === 'function' ? memberPortraitPath(ch) : '';
  return '<span class="tm-face" data-char="' + p.id + '">' +
    (src ? '<img src="' + src + '" alt="" onerror="this.remove()">' : '') + '</span>';
}

// 房間名稱：寢室名稱「希奧妮哨兵寢室」在小房間放不下 → 「希奧妮寢室」（哨兵／嚮導看樓層就知道）
const tmapRoomLabel = name => name.replace(/(哨兵|嚮導)寢室$/, '寢室');
// 名稱還是比房間寬：字縮小到剛好放得下（.tm-room-name 平常是 2.4 × --u）
function tmapRoomNameFit(r, u) {
  const len = [...tmapRoomLabel(r.name)].length, size = 2.4 * u, fit = (r.w - 1.4 * u) / len;
  return fit < size ? ' style="font-size:' + fit.toFixed(2) + 'px"' : '';
}

// 房間形狀：地板格＝淺色、固定牆＝深色（每種一條 path，格子很多也不會慢）
function tmapRoomShape(room) {
  const m = room.map, floor = (m.layers && m.layers.floor) || {}, solid = new Set(m.solid || []);
  let open = '', wall = '';
  for (const k of Object.keys(floor)) {
    const [c, r] = k.split(',').map(Number);
    if (!(c >= 0 && r >= 0 && c < m.cols && r < m.rows)) continue;
    const s = room.k, d = 'M' + (room.x + c * s) + ' ' + (room.y + r * s) + 'h' + s + 'v' + s + 'h-' + s + 'z';
    if (solid.has(k)) wall += d; else open += d;
  }
  return (wall ? '<path class="tm-wall" d="' + wall + '"/>' : '') + (open ? '<path class="tm-floor" d="' + open + '"/>' : '');
}

const TMAP_NOSIGNAL_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 20h2v-3H2zM7 20h2v-6H7zM12 20h2v-9h-2zM17 20h2V8h-2z" fill="currentColor" opacity=".35"/><path d="M3 4 21 20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
function renderMapApp(el) {
  // 戰鬥區域（含劇情地圖）：有帶慣性導航記錄器才看得到走過的地方（下面的 renderFieldMapApp）
  if (typeof MAP_FIELD !== 'undefined' && MAP_FIELD && typeof MAP !== 'undefined' && MAP) {
    if (typeof equipLv === 'function' && equipLv('navrecorder')) { renderFieldMapApp(el); return; }
    el.innerHTML = '<div class="tm-nosignal">' + TMAP_NOSIGNAL_ICON + '<b>無訊號</b><p>戰鬥區域收不到應變中心網路。<br>裝備「🧭 慣性導航記錄器」就能記錄走過的路線、在這裡查看地圖。</p></div>';
    return;
  }
  const here = tmapHereMap();
  if (!here || !tmapMaps().some(m => m.id === here.id)) {
    el.innerHTML = '<div class="tm-nosignal">' + TMAP_NOSIGNAL_ICON + '<b>無訊號</b><p>基地地圖只能在應變中心網路內查看。<br>回到基地後再打開。</p></div>';
    return;
  }
  const floors = tmapFloors(), byId = new Map(tmapMaps().map(m => [m.id, m]));
  const hereFloor = floors.find(f => f.rooms.some(r => r.map.id === here.id));
  let floor = floors.find(f => f.label === tmapFloor) || hereFloor || floors[0];
  if (!floor) { el.innerHTML = '<div class="tm-nosignal"><b>沒有基地地圖</b></div>'; return; }
  const { inBase, away } = tmapPeople();
  const roomOf = name => floor.rooms.find(r => r.map.name === name);
  const people = inBase.filter(p => roomOf(p.mapName));
  if (tmapSel && !people.some(p => p.id === tmapSel)) tmapSel = null;

  // ---- 左邊：樓層＋這層樓的人 ----
  const count = f => inBase.filter(p => f.rooms.some(r => r.map.name === p.mapName)).length;
  const side = '<nav class="aa-side tm-side"><div class="tm-sec">樓層</div>' +
    floors.map(f => '<button type="button" class="aa-tab tm-floor-btn' + (f === floor ? ' on' : '') + '" data-tmap-floor="' + f.label + '">' +
      '<span>' + f.label + (f === hereFloor ? '<i class="tm-here-dot" title="你在這層"></i>' : '') + '</span><em>' + (count(f) ? count(f) + ' 人' : '') + '</em></button>').join('') +
    '<div class="tm-sec">這層樓的人</div>' +
    (people.length ? people.map(p => '<button type="button" class="tm-person' + (p.id === tmapSel ? ' on' : '') + '" data-tmap-npc="' + p.id + '">' +
      tmapFace(p) + '<b><i class="tm-kind" style="background:' + (TMAP_KIND_COLOR[p.kind] || TMAP_KIND_COLOR.support) + '"></i>' + tmapEsc(p.name) + '</b><small>' + tmapEsc(roomOf(p.mapName).name) + '</small></button>').join('')
      : '<p class="tm-empty">這層樓沒有人</p>') +
    (away.length ? '<div class="tm-sec">不在基地</div><p class="tm-away">' + away.map(p => tmapEsc(p.name)).join('、') + '</p>' : '') +
    '</nav>';

  // ---- 右邊：示意圖 ----
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  floor.rooms.forEach(r => { x0 = Math.min(x0, r.x); y0 = Math.min(y0, r.y); x1 = Math.max(x1, r.x + r.w); y1 = Math.max(y1, r.y + r.h); });
  const pad = 1.5, minW = 46, minH = 26;   // 最小範圍：只有一個小房間的樓層也不會被放到超大
  let vw = x1 - x0 + pad * 2, vh = y1 - y0 + pad * 2, vx = x0 - pad, vy = y0 - pad;
  if (vw < minW) { vx -= (minW - vw) / 2; vw = minW; }
  if (vh < minH) { vy -= (minH - vh) / 2; vh = minH; }
  // 每層都放大到填滿畫面；字和標記用 u 抵銷縮放，所以在每層看起來一樣大（u＝1：2F 那種寬度；畫面約 2.1:1）
  const u = Math.max(vw, vh * 2.1) / 98, mk = TMAP_MARK * u;

  const portals = floor.rooms.flatMap(r => tmapPortals(r, floor, byId).map(p => ({ ...p, room: r })));
  const links = [], seen = new Set();   // 同一層樓的兩扇門：畫虛線連起來
  for (const p of portals) {
    if (p.stair) continue;
    const key = [p.room.map.id, p.to].sort().join('|'); if (seen.has(key)) continue; seen.add(key);
    const other = portals.filter(q => q.room.map.id === p.to && q.to === p.room.map.id).sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y))[0];
    if (other) links.push('<line class="tm-link" x1="' + p.x + '" y1="' + p.y + '" x2="' + other.x + '" y2="' + other.y + '"/>');
  }
  const rooms = floor.rooms.map(r => {
    const cls = 'tm-room' + (r.map.id === here.id ? ' here' : '') + (r.map.name === tmapRoomSel ? ' sel' : '') +
      (tmapSel && people.find(p => p.id === tmapSel)?.mapName === r.map.name ? ' sel' : '');
    return '<g class="' + cls + '" data-tmap-room="' + tmapEsc(r.map.name) + '"><rect class="tm-room-box" x="' + r.x + '" y="' + r.y + '" width="' + r.w + '" height="' + r.h + '" rx=".8"/>' +
      tmapRoomShape(r) + '<text class="tm-room-name" x="' + (r.x + .8 * u) + '" y="' + (r.y + 2.5 * u) + '"' + tmapRoomNameFit(r, u) + '>' + tmapEsc(tmapRoomLabel(r.name)) + '</text></g>';
  }).join('');
  const marks = [];
  for (const p of portals) {
    if (p.stair) {
      const up = p.stair.n > floor.n;
      marks.push('<g class="tm-stair" transform="translate(' + p.x + ' ' + p.y + ') scale(' + mk + ')"><title>樓梯：往 ' + tmapEsc(p.toName) + '</title><rect x="-1.1" y="-1.1" width="2.2" height="2.2" rx=".4"/>' +
        '<path d="' + (up ? 'M0 -.7 .7 .5H-.7Z' : 'M0 .7 .7 -.5H-.7Z') + '"/><text x="1.6" y=".55">' + p.stair.label + '</text></g>');
    } else {
      marks.push('<g class="tm-door" transform="translate(' + p.x + ' ' + p.y + ') scale(' + mk + ')"><title>出入口：' + tmapEsc(p.toName) + '</title><rect x="-.8" y="-.8" width="1.6" height="1.6" rx=".3"/></g>');
    }
  }
  floor.rooms.forEach(r => {
    tmapElevators(r).forEach(e => marks.push('<g class="tm-elev" transform="translate(' + e.x + ' ' + e.y + ') scale(' + mk + ')"><title>電梯</title><rect x="-1.3" y="-1.3" width="2.6" height="2.6" rx=".4"/><path d="M-.55 -.25 0 -.85 .55 -.25ZM-.55 .25 0 .85 .55 .25Z"/></g>'));
    tmapLocked(r).forEach(d => marks.push('<g class="tm-lock" transform="translate(' + d.x + ' ' + d.y + ') scale(' + mk + ')"><title>鎖住的門</title><rect x="-.65" y="-.2" width="1.3" height="1" rx=".2"/><path d="M-.38 -.2V-.5A.38 .38 0 0 1 .38 -.5V-.2" fill="none"/></g>'));
  });
  // 點一律畫在真實位置（不移動），只有名字找空位：下 → 上 → 右 → 左 → 斜角 → 遠一點，全都被擋住才不寫名字（名單和滑鼠提示還是看得到）
  const M = mk, FONT = 1.55 * M;   // 名字字級（格），跟 .tm-name 的 font-size（2.17 × --u）一樣
  const boxes = [];   // 已經佔用的範圍：[左, 上, 右, 下]
  const hit = q => boxes.some(b => q[0] < b[2] && q[2] > b[0] && q[1] < b[3] && q[3] > b[1]);
  const spots = [];   // 每個點：{ x, y, name, id }
  let me = '';
  if (floor === hereFloor && typeof G !== 'undefined' && G && G.player) {
    const r = floor.rooms.find(q => q.map.id === here.id), [c, rr] = tmapCellOf(G.player);
    spots.push({ x: r.x + c * r.k, y: r.y + rr * r.k, name: '你', me: true });
  }
  for (const p of people) {
    const r = roomOf(p.mapName);
    spots.push({ x: r.x + (p.c != null ? p.c * r.k : r.w / 2), y: r.y + (p.r != null ? p.r * r.k : r.h / 2), name: p.name, id: p.id, p });
  }
  spots.forEach(o => boxes.push([o.x - 1.1 * M, o.y - 1.1 * M, o.x + 1.1 * M, o.y + 1.1 * M]));   // 先把所有點佔起來：名字不會蓋到別人的點
  const order = [...spots].sort((a, b) => (b.me ? 2 : b.id === tmapSel ? 1 : 0) - (a.me ? 2 : a.id === tmapSel ? 1 : 0));   // 自己、點選的人優先放名字
  const names = [];
  for (const o of order) {
    const w = [...o.name].length * FONT + .3, h = FONT * 1.1, gap = 1.2 * M;
    const tries = o.me ? [['m', 0, -gap - h * .2]] : [];
    tries.push(['m', 0, gap + h * .8], ['m', 0, -gap - h * .2], ['s', gap, h * .35], ['e', -gap, h * .35],
      ['s', gap * .7, gap + h * .8], ['e', -gap * .7, gap + h * .8], ['s', gap * .7, -gap - h * .2], ['e', -gap * .7, -gap - h * .2],   // 斜角
      ['m', 0, gap + h * 1.9], ['m', 0, -gap - h * 1.3]);   // 再遠一點
    for (const [anchor, dx, dy] of tries) {
      const x = o.x + dx, y = o.y + dy, left = anchor === 'm' ? x - w / 2 : anchor === 's' ? x : x - w;
      const q = [left, y - h * .85, left + w, y + h * .15];
      if (q[0] < vx || q[2] > vx + vw || q[1] < vy || q[3] > vy + vh || hit(q)) continue;
      boxes.push(q);
      names.push('<text class="tm-name' + (o.me ? ' me' : o.id === tmapSel ? ' sel' : '') + '" x="' + x + '" y="' + y + '" text-anchor="' + { m: 'middle', s: 'start', e: 'end' }[anchor] + '">' + tmapEsc(o.name) + '</text>');
      break;
    }
  }
  const dots = spots.map(o => {
    if (o.me) {
      me = '<g class="tm-me" transform="translate(' + o.x + ' ' + o.y + ') scale(' + M + ')"><title>你的位置</title><circle class="tm-ping" r="1.8"/><circle r="1.05"/></g>';
      return '';
    }
    const color = TMAP_KIND_COLOR[o.p.kind] || TMAP_KIND_COLOR.support;
    return '<g class="tm-npc' + (o.id === tmapSel ? ' sel' : '') + '" data-tmap-npc="' + o.id + '" transform="translate(' + o.x + ' ' + o.y + ') scale(' + M + ')"><title>' + tmapEsc(o.name) + '</title>' +
      (o.id === tmapSel ? '<circle class="tm-ping" r="1.6"/>' : '') + '<circle r=".85" fill="' + color + '"/></g>';
  }).join('') + '<g class="tm-names">' + names.join('') + '</g>';
  const hereRoom = tmapParseFloor(here.name);
  const sub = floor === hereFloor ? '目前位置：' + tmapEsc(hereRoom.rest) : '你在 ' + tmapEsc(hereFloor ? hereFloor.label : '') + '・' + tmapEsc(hereRoom.rest);
  const pick = tmapRoomSel && roomOf(tmapRoomSel);
  const info = pick ? (() => {
    const ppl = people.filter(p => p.mapName === pick.map.name).map(p => tmapEsc(p.name));
    const exits = [...new Set(portals.filter(p => p.room === pick).map(p => tmapEsc(p.stair ? p.toName : tmapParseFloor(p.toName).rest)))];   // 別的樓層寫全名
    return '<b>' + tmapEsc(pick.name) + '</b>' + (pick.map.id === here.id ? '<em class="tm-you">你在這裡</em>' : '') +
      '<span>' + (ppl.length ? ppl.join('、') : '沒有人') + '</span>' + (exits.length ? '<span class="tm-dim">通往：' + exits.join('、') + '</span>' : '');
  })() : '<span class="tm-dim">點房間看裡面有誰；點左邊的名字找人。</span>';
  const legend = '<div class="tm-legend"><span><i class="lg-me"></i>你</span>' +
    Object.keys(TMAP_KIND_NAME).map(k => '<span><i class="lg-dot" style="background:' + TMAP_KIND_COLOR[k] + '"></i>' + TMAP_KIND_NAME[k] + '</span>').join('') +
    '<span><i class="lg-door"></i>出入口</span><span><i class="lg-stair"></i>樓梯</span><span><i class="lg-elev"></i>電梯</span><span><i class="lg-lock"></i>鎖住的門</span></div>';
  const main = '<main class="tm-main"><div class="tm-head"><h2 class="aa-title">' + floor.label + '</h2><p class="aa-sub">' + sub + '</p></div>' +
    '<svg class="tm-svg" style="--u:' + u.toFixed(3) + '" viewBox="' + [vx, vy, vw, vh].join(' ') + '" preserveAspectRatio="xMidYMid meet" role="img" aria-label="' + floor.label + ' 樓層示意圖">' +
    rooms + '<g>' + links.join('') + '</g>' + marks.join('') + me + dots + '</svg>' +
    '<div class="tm-info">' + info + '</div>' + legend + '</main>';
  el.innerHTML = '<div class="aa tm">' + side + main + '</div>';

  el.querySelector('.tm').addEventListener('click', e => {
    const f = e.target.closest('[data-tmap-floor]'), n = e.target.closest('[data-tmap-npc]'), r = e.target.closest('[data-tmap-room]');
    if (f) { if (f.dataset.tmapFloor === floor.label) return; tmapFloor = f.dataset.tmapFloor; tmapSel = null; tmapRoomSel = null; }
    else if (n) { tmapSel = tmapSel === n.dataset.tmapNpc ? null : n.dataset.tmapNpc; tmapRoomSel = tmapSel ? people.find(p => p.id === tmapSel).mapName : null; }
    else if (r) { tmapRoomSel = tmapRoomSel === r.dataset.tmapRoom ? null : r.dataset.tmapRoom; tmapSel = null; }
    else return;
    renderMapApp(el);
    if (typeof sfx === 'function') sfx('blip');
  });
}
// 每次打開地圖都從目前所在的樓層開始
function resetMapApp() { tmapFloor = null; tmapSel = null; tmapRoomSel = null; }

// ================= 戰鬥區域：慣性導航記錄器 =================
// 走過的地方記成「已探索」：溫特周圍 range 格（裝備等級決定）、而且視線沒被牆擋住的格子。
// 每張地圖各自記（地圖 id → 位元組，每格一個 bit），存在瀏覽器 tudrc_explored_v1（新遊戲會清掉，見 js/new-game.js）。
// 地圖上「地板格又不是固定牆」的格子記過 TMAP_EXPLORE_DONE（95%）＝地圖完整：剩下的格子自動補齊
// （有些地板被牆整個圍住、根本走不到，一定要 100% 的話會永遠差一點）。
const TMAP_EXPLORE_KEY = 'tudrc_explored_v1';
const TMAP_EXPLORE_DONE = .95;
let tmapExplored = {}, tmapExploreDirty = false, tmapExploreSavedAt = 0;
try { tmapExplored = JSON.parse(localStorage.getItem(TMAP_EXPLORE_KEY) || '{}') || {}; } catch (_) { tmapExplored = {}; }
const tmapBitsCache = new Map();   // 地圖 id → { bits: Uint8Array, open: 可走的格數, seen: 記過的可走格數 }
// 不能記、也不算進完整度的格子（只看目前這張地圖）：
// ・還沒炸開的隱藏區（js/breakable-walls.js 的 G.hiddenAreas），炸開之後才算
// ・可以炸開的牆：整張牆圖蓋住的格子（底下有地板磚、又沒畫擋路格，不排掉的話地圖上會凸出一塊，一看就知道那裡有東西）；
//   炸開之後只剩牆一直擋路的格子（breakableWallSolid）不算，中間的破洞照常記
// ・貼著上面兩種格子的牆（地板磚＋擋路格，例如隱藏通道兩側的牆）：不排掉的話走廊上會多凸出幾顆牆，一樣會露餡；炸開後恢復
function tmapHiddenKeys(m) {
  const keys = new Set();
  if (typeof MAP === 'undefined' || MAP !== m || typeof G === 'undefined' || !G) return keys;
  for (const a of G.hiddenAreas || []) if (!a.revealAt) for (const k of a.cells) keys.add(k);
  if (typeof breakableWallSpec === 'function') for (const s of m.stamps || []) {
    if (!breakableWallSpec(s)) continue;
    if (breakableWallStage(s) >= 2) continue;   // 已經炸開：下面統一排掉一直擋路的格子
    const t = typeof mapTileById === 'function' ? mapTileById(s.id) : null, w = mapTileW(t), h = mapTileH(t);
    const c0 = s.c + Math.round((s.ox || 0) / CELL), r0 = s.r + Math.round((s.oy || 0) / CELL);
    for (let dc = 0; dc < w; dc++) for (let dr = 0; dr < h; dr++) keys.add((c0 + dc) + ',' + (r0 + dr));
  }
  if (keys.size) {   // 貼著的牆（上下左右、斜角都算）
    const solid = m._tmapSolid || (m._tmapSolid = new Set(m.solid || [])), around = [];
    for (const k of keys) {
      const [c, r] = k.split(',').map(Number);
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) { const n = (c + dc) + ',' + (r + dr); if (solid.has(n)) around.push(n); }
    }
    around.forEach(k => keys.add(k));
  }
  if (typeof breakableWallSolid !== 'undefined') for (const k of breakableWallSolid) keys.add(k);
  return keys;
}
// 地板格：一格一格刷的地板（layers.floor、ground…），加上整塊蓋上去的地板素材（stamps 放在 floor、ground… 圖層，例如 3×3 的後室地板）
// 只看刷的地板的話，用大塊地板素材鋪的地圖（例如 Y25區-地下街）幾乎整張都不算地板，導航記錄器什麼都畫不出來
function tmapFloorCells(m) {
  const keys = new Set(), isFloorLayer = l => /^(floor|ground\d*)$/.test(l || '');
  for (const [l, cells] of Object.entries(m.layers || {})) if (isFloorLayer(l) && cells) for (const k of Object.keys(cells)) keys.add(k);
  for (const s of m.stamps || []) {
    if (!isFloorLayer(s.layer)) continue;
    const t = typeof mapTileById === 'function' ? mapTileById(s.id) : null, w = mapTileW(t), h = mapTileH(t);
    const c0 = s.c + Math.round((s.ox || 0) / CELL), r0 = s.r + Math.round((s.oy || 0) / CELL);
    for (let dc = 0; dc < w; dc++) for (let dr = 0; dr < h; dr++) keys.add((c0 + dc) + ',' + (r0 + dr));
  }
  return keys;
}
function tmapExploreState(m) {
  let st = tmapBitsCache.get(m.id);
  const hidden = tmapHiddenKeys(m), sig = hidden.size;   // 隱藏區炸開（格數變了）就重算一次可走的格子
  if (st && st.cols === m.cols && st.rows === m.rows && st.sig === sig) return st;
  const n = m.cols * m.rows;
  let bits = st && st.cols === m.cols && st.rows === m.rows ? st.bits : null;   // 已經在記憶體裡的比存檔新
  if (!bits) {
    bits = new Uint8Array(Math.ceil(n / 8)); const hex = tmapExplored[m.id] || '';
    for (let i = 0; i < bits.length && i * 2 + 1 < hex.length; i++) bits[i] = parseInt(hex.substr(i * 2, 2), 16) || 0;
  }
  const solid = new Set(m.solid || []), open = new Uint8Array(n);
  let total = 0, seen = 0;
  for (const k of tmapFloorCells(m)) {
    const [c, r] = k.split(',').map(Number);
    if (!(c >= 0 && r >= 0 && c < m.cols && r < m.rows) || solid.has(k) || hidden.has(k)) continue;
    const i = r * m.cols + c; open[i] = 1; total++;
    if (bits[i >> 3] & (1 << (i & 7))) seen++;
  }
  st = { cols: m.cols, rows: m.rows, bits, open, total, seen, done: total > 0 && seen >= total, sig, hidden };
  tmapBitsCache.set(m.id, st);
  return st;
}
// 記到 95%（這一步才剛跨過去）：剩下的可走格子全部補上（地圖完整）。
// 只在「剛跨過」時補：炸開隱藏區之後完整度本來就在 95% 以上，不會一炸開就自動補好，要自己走進去記。
function tmapExploreFill(st) {
  for (let i = 0; i < st.open.length; i++) if (st.open[i]) st.bits[i >> 3] |= 1 << (i & 7);
  st.seen = st.total; st.done = true; tmapExploreDirty = true;
}
// 地圖上的「牆」：不能走（沒地板、擋路格、還沒炸開的隱藏區）、又貼著走過的地板的格子＝沿著走過的地方外圍畫一圈。
// 這樣走廊邊緣是一條完整的牆，隱藏區的入口跟其他地方一樣被牆封住：不會凸出一塊，也不會看起來還有路。
const tmapOpenSeen = (st, c, r) => c >= 0 && r >= 0 && c < st.cols && r < st.rows && !!st.open[r * st.cols + c] && tmapSeen(st, c, r);
function tmapWallAt(st, c, r) {
  if (c < 0 || r < 0 || c >= st.cols || r >= st.rows || st.open[r * st.cols + c]) return false;
  for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) if ((dc || dr) && tmapOpenSeen(st, c + dc, r + dr)) return true;
  return false;
}
const tmapSeen = (st, c, r) => { const i = r * st.cols + c; return !!(st.bits[i >> 3] & (1 << (i & 7))); };
function tmapExploreSave(force) {
  if (!tmapExploreDirty || (!force && Date.now() - tmapExploreSavedAt < 2000)) return;
  for (const [id, st] of tmapBitsCache) tmapExplored[id] = Array.from(st.bits, b => b.toString(16).padStart(2, '0')).join('');
  try { localStorage.setItem(TMAP_EXPLORE_KEY, JSON.stringify(tmapExplored)); } catch (_) {}
  tmapExploreDirty = false; tmapExploreSavedAt = Date.now();
}
// 視線：從溫特那一格到目標格，中間經過的格子不能是牆（目標格本身是牆也算看得到：牆面要畫出來）
function tmapLineClear(c0, r0, c1, r1) {
  const steps = Math.max(Math.abs(c1 - c0), Math.abs(r1 - r0));
  for (let s = 1; s < steps; s++) {
    const c = Math.round(c0 + (c1 - c0) * s / steps), r = Math.round(r0 + (r1 - r0) * s / steps);
    if (typeof isWall === 'function' && isWall(c, r)) return false;
  }
  return true;
}
function tmapExploreTick() {
  if (typeof MAP_FIELD === 'undefined' || !MAP_FIELD || typeof MAP === 'undefined' || !MAP || typeof G === 'undefined' || !G || !G.player) return;
  const lv = typeof equipLv === 'function' ? equipLv('navrecorder') : null;
  if (!lv) return;
  const st = tmapExploreState(MAP), [pc, pr] = tmapCellOf(G.player).map(Math.floor), R = lv.range;
  const wasDone = st.done, before = st.seen, need = st.total * TMAP_EXPLORE_DONE;
  for (let dr = -R; dr <= R; dr++) for (let dc = -R; dc <= R; dc++) {
    const c = pc + dc, r = pr + dr;
    if (dc * dc + dr * dr > R * R + R || c < 0 || r < 0 || c >= st.cols || r >= st.rows || tmapSeen(st, c, r) || st.hidden.has(c + ',' + r)) continue;
    if (!tmapLineClear(pc, pr, c, r)) continue;
    const i = r * st.cols + c; st.bits[i >> 3] |= 1 << (i & 7); tmapExploreDirty = true;
    if (st.open[i]) st.seen++;
  }
  if (!st.done && st.total > 0 && before < need && st.seen >= need) tmapExploreFill(st);
  else st.done = st.total > 0 && st.seen >= st.total;
  if (st.done && !wasDone && typeof systemNotice === 'function') systemNotice('🧭 「' + MAP.name + '」的地圖已經完整記錄');
  tmapExploreSave(false);
}
setInterval(tmapExploreTick, 250);
window.addEventListener('beforeunload', () => tmapExploreSave(true));

// 雷達風格的格線：細線每 2 格、粗線每 10 格，畫在地圖下面（線條粗細乘上 u：不管地圖多大，畫面上看起來一樣粗；顏色在 css/tpad-map.css 的 .tmf-grid）
function tmapRadarLayer(vx, vy, vw, vh, u) {
  return '<defs><pattern id="tmfGridS" width="2" height="2" patternUnits="userSpaceOnUse"><path class="tmf-grid" d="M2 0H0V2"/></pattern>' +
    '<pattern id="tmfGridL" width="10" height="10" patternUnits="userSpaceOnUse"><path class="tmf-grid major" d="M10 0H0V10"/></pattern></defs>' +
    '<rect x="' + vx + '" y="' + vy + '" width="' + vw + '" height="' + vh + '" fill="url(#tmfGridS)"/><rect x="' + vx + '" y="' + vy + '" width="' + vw + '" height="' + vh + '" fill="url(#tmfGridL)"/>';
}

// 無線電＋慣性導航記錄器都帶著：地圖上（T-Pad、右下小地圖）看得到隊員在哪（被虱目魚小子吃掉的畫成紫色，位置就是那隻魚）
const tmapSquadOn = () => typeof equipLv === 'function' && !!equipLv('radio') && !!equipLv('navrecorder');
const tmapSquad = () => (G.towers || []).filter(t => TYPES[t.type]);
// T-Pad「地圖」在戰鬥區域：只畫記過的格子，加上自己的位置、記過的出入口、還沒打碎的異質核心
function renderFieldMapApp(el) {
  tmapExploreTick();
  const m = MAP, st = tmapExploreState(m), pct = st.total ? Math.floor(st.seen / st.total * 100) : 0;
  const pad = 1.5, vx = -pad, vy = -pad, vw = m.cols + pad * 2, vh = m.rows + pad * 2;
  const u = Math.max(vw, vh * 2.1) / 98, mk = TMAP_MARK * u;
  let open = '', wall = '';
  for (let r = 0; r < m.rows; r++) for (let c = 0; c < m.cols; c++) {
    const d = 'M' + c + ' ' + r + 'h1v1h-1z';
    if (tmapOpenSeen(st, c, r)) open += d; else if (tmapWallAt(st, c, r)) wall += d;
  }
  const marks = [], names = new Map((typeof mapList === 'function' ? mapList() : []).map(x => [x.id, x.name])), groups = [];
  for (const p of m.portals || []) {   // 相鄰的同一個去處合成一個
    if (!tmapSeen(st, p.c, p.r) || st.hidden.has(p.c + ',' + p.r) || (p.hidden && typeof portalUsable === 'function' && !portalUsable(p))) continue;   // 還沒找到的隱藏地道不顯示
    const g = groups.find(q => q.to === p.to && Math.abs(q.c / q.k - p.c) <= 2.5 && Math.abs(q.r / q.k - p.r) <= 2.5);
    if (g) { g.c += p.c; g.r += p.r; g.k++; } else groups.push({ to: p.to, c: p.c, r: p.r, k: 1 });
  }
  for (const g of groups) marks.push('<g class="tm-door" transform="translate(' + (g.c / g.k + .5) + ' ' + (g.r / g.k + .5) + ') scale(' + mk + ')"><title>出入口：' + tmapEsc(names.get(g.to) || '') + '</title><rect x="-.8" y="-.8" width="1.6" height="1.6" rx=".3"/></g>');
  for (const core of (G.cores || [])) {
    if (core.dead || core.hidden) continue;   // 躲在順順宮帽裡：地圖上不顯示（js/elite-cap-king.js）
    const [c, r] = tmapCellOf(core);
    if ((!tmapSeen(st, Math.floor(c), Math.floor(r)) || st.hidden.has(Math.floor(c) + ',' + Math.floor(r)))) continue;
    marks.push('<g class="tm-core" transform="translate(' + c + ' ' + r + ') scale(' + mk + ')"><title>異質核心</title><path d="M0 -1.2 1 0 0 1.2 -1 0Z"/></g>');
  }
  const squad = tmapSquadOn();
  if (squad) for (const t of tmapSquad()) {   // 無線電＋導航：隊員的位置（沒走過的地方也看得到）
    const [c, r] = tmapCellOf(t), name = (TYPES[t.type] && TYPES[t.type].name) || '';
    marks.push('<g class="tm-mate' + (t.eatenBy ? ' eaten' : t.hp <= 0 ? ' down' : '') + '" transform="translate(' + c + ' ' + r + ') scale(' + mk + ')"><title>' + tmapEsc(name + (t.eatenBy ? '（被虱目魚小子吃掉）' : t.hp <= 0 ? '（倒下）' : '')) + '</title><circle r=".85"/></g>');
  }
  const [pc, pr] = tmapCellOf(G.player);
  const me = '<g class="tm-me" transform="translate(' + pc + ' ' + pr + ') scale(' + mk + ')"><title>你的位置</title><circle class="tm-ping" r="1.8"/><circle r="1.05"/></g>';
  const side = '<nav class="aa-side tm-side tmf-side"><div class="tm-sec">慣性導航記錄器</div>' +
    '<div class="tmf-pct"><b>' + pct + '<small>%</small></b><span>已記錄</span></div><i class="aa-bar tmf-bar"><u style="width:' + pct + '%"></u></i>' +
    '<p class="tmf-note">' + (st.done ? '地圖已完整記錄。' : '走過的地方會自動記錄。') + '</p></nav>';
  const main = '<main class="tm-main"><div class="tm-head"><h2 class="aa-title">' + tmapEsc(m.name) + '</h2><p class="aa-sub">離線模式・導航記錄中</p></div>' +
    '<svg class="tm-svg" style="--u:' + u.toFixed(3) + '" viewBox="' + [vx, vy, vw, vh].join(' ') + '" preserveAspectRatio="xMidYMid meet" role="img" aria-label="' + tmapEsc(m.name) + ' 已探索的地圖">' +
    tmapRadarLayer(vx, vy, vw, vh, u) + (wall ? '<path class="tm-wall" d="' + wall + '"/>' : '') + (open ? '<path class="tm-floor" d="' + open + '"/>' : '') + marks.join('') + me + '</svg>' +
    '<div class="tm-legend"><span><i class="lg-me"></i>你</span><span><i class="lg-door"></i>出入口</span><span><i class="lg-core"></i>異質核心</span>' + (squad ? '<span><i class="lg-mate"></i>隊員</span>' : '') + '<span><i class="lg-fog"></i>還沒走過</span></div></main>';
  el.innerHTML = '<div class="aa tm tmf">' + side + main + '</div>';
}

// ================= 小地圖拖移（基地小地圖 js/base-minimap.js、戰鬥小地圖 #navMinimap 共用）=================
// 按住小地圖上面的標題列可以拖到畫面上任何地方；雙擊標題列＝回到原本的位置。
// 拖到哪裡記在瀏覽器（tudrc_minimap_pos），記的是「離原本位置差多少 px」，所以 UI 編輯器改原本位置時會一起跟著動。
// UI 編輯器預覽（?uiedit=1）裡不套用玩家拖過的位置，編輯器看到的永遠是原本位置。
const MINIMAP_POS_KEY = 'tudrc_minimap_pos';
const MINIMAP_UIEDIT = /[?&]uiedit=1(&|$)/.test(location.search);
let minimapPosCache = null;   // 讀一次就記在這裡；拖的時候先改這裡，放開才寫進瀏覽器
function minimapPos(id) {
  if (MINIMAP_UIEDIT) return { x: 0, y: 0 };
  if (!minimapPosCache) { try { minimapPosCache = JSON.parse(localStorage.getItem(MINIMAP_POS_KEY) || '{}') || {}; } catch (_) { minimapPosCache = {}; } }
  const p = minimapPosCache[id];
  return p ? { x: +p.x || 0, y: +p.y || 0 } : { x: 0, y: 0 };
}
function minimapPosSave(id, p, keep = true) {   // keep＝寫進瀏覽器（拖動中只改記憶體）
  minimapPos(id); minimapPosCache[id] = { x: Math.round(p.x), y: Math.round(p.y) };
  if (keep) try { localStorage.setItem(MINIMAP_POS_KEY, JSON.stringify(minimapPosCache)); } catch (_) {}
}
// 把小地圖放到「原本位置＋拖過的距離」；超出遊戲畫面就推回來（視窗變小時也不會跑到外面）
// def＝原本離右下角幾 px：{ right, bottom }
function minimapPlace(el, id, def, p) {
  p = p || minimapPos(id);
  el.style.right = (def.right - p.x) + 'px'; el.style.bottom = (def.bottom - p.y) + 'px';
  const wrap = el.offsetParent; if (!wrap || !el.offsetWidth) return p;
  const r = el.getBoundingClientRect(), wr = wrap.getBoundingClientRect(), m = 4;
  let dx = 0, dy = 0;
  if (r.left < wr.left + m) dx = wr.left + m - r.left; else if (r.right > wr.right - m) dx = wr.right - m - r.right;
  if (r.top < wr.top + m) dy = wr.top + m - r.top; else if (r.bottom > wr.bottom - m) dy = wr.bottom - m - r.bottom;
  if (dx || dy) { p = { x: p.x + dx, y: p.y + dy }; el.style.right = (def.right - p.x) + 'px'; el.style.bottom = (def.bottom - p.y) + 'px'; }
  return p;
}
// 讓 el 可以拖：handle＝按住哪裡拖（按到按鈕不算）
function minimapDraggable(el, handle, id, def) {
  let drag = null;
  handle.style.cursor = 'move'; handle.title = handle.title || '按住拖動小地圖；雙擊回到原本位置';
  handle.addEventListener('pointerdown', e => {
    if (e.button !== 0 || e.target.closest('button')) return;
    e.preventDefault(); e.stopPropagation();
    drag = { sx: e.clientX, sy: e.clientY, p: minimapPos(id), now: null };
    handle.setPointerCapture(e.pointerId);
  });
  handle.addEventListener('pointermove', e => {
    if (!drag) return;
    drag.now = minimapPlace(el, id, def, { x: drag.p.x + e.clientX - drag.sx, y: drag.p.y + e.clientY - drag.sy });
    minimapPosSave(id, drag.now, false);   // 每 0.1 秒的畫面更新也會用到位置，先記著才不會被拉回去
  });
  const end = () => { if (!drag) return; if (drag.now) minimapPosSave(id, drag.now); drag = null; };
  handle.addEventListener('pointerup', end); handle.addEventListener('pointercancel', end);
  handle.addEventListener('dblclick', e => { if (e.target.closest('button')) return; minimapPosSave(id, { x: 0, y: 0 }); minimapPlace(el, id, def); });
}
// 兩個小地圖共用的按鈕圖示
const MINIMAP_ICON_FULL = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const MINIMAP_ICON_HIDE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>';
const MINIMAP_ICON_MAP = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9 4v13.5M15 6.5V20" stroke="currentColor" stroke-width="2"/></svg>';
// 打開 T-Pad 並直接進「地圖」App（小地圖的 ⛶ 按鈕）
function minimapOpenFull() {
  if (typeof openTPad !== 'function' || typeof launchTPadApp !== 'function') return;
  if (!(typeof tpadOpen !== 'undefined' && tpadOpen)) openTPad();
  if (typeof tpadOpen !== 'undefined' && tpadOpen) launchTPadApp('map');
}

// ================= 右下角小地圖（裝備慣性導航記錄器、在戰鬥區域時）=================
// 以溫特為中心、畫附近記過的格子；右下角的子彈（js/game.js 的 #ammoHud）往左讓位到小地圖左邊。
// 上面一條標題列：按住可以拖動；⛶ 打開完整地圖（T-Pad「地圖」）、— 收起；收起後右下角留一個小按鈕可以再叫出來（記在瀏覽器 tudrc_nav_minimap_hidden）。
// 小地圖畫面本身不擋滑鼠（在戰鬥中點下去還是照常射擊），只有標題列和按鈕可以按。
// UI編輯器可以調位置：js/ui-layout.js 的 UI_ELEMENTS（navMinimap、navMinimapShow）。
const TMAP_MINI = { w: 184, h: 132, head: 22, cell: 6, gap: 12, right: 14, bottom: 14 };   // 地圖區大小（px）、標題列高度、一格幾 px、跟子彈之間的距離、離右下角幾 px（背景 60% 不透明寫在下面的 CSS；地面、牆不透明）
const TMAP_MINI_HIDE_KEY = 'tudrc_nav_minimap_hidden';
let tmapMiniHidden = false;
try { tmapMiniHidden = localStorage.getItem(TMAP_MINI_HIDE_KEY) === '1'; } catch (_) {}
let tmapMiniEl = null, tmapMiniCtx = null, tmapMiniShowBtn = null, tmapMiniOn = false;
function tmapMiniBuild() {
  const css = document.createElement('style');
  css.textContent = '#navMinimap{position:absolute;right:' + TMAP_MINI.right + 'px;bottom:' + TMAP_MINI.bottom + 'px;z-index:9;width:' + TMAP_MINI.w + 'px;border-radius:10px;overflow:hidden;pointer-events:none;user-select:none;' +
    'background:rgba(0,4,10,.6);box-shadow:0 0 0 1px rgba(255,255,255,.14),0 4px 14px rgba(0,0,0,.45);font-family:"Microsoft JhengHei",sans-serif}' +
    '#navMinimap .nmap-head{display:flex;align-items:center;gap:4px;height:' + TMAP_MINI.head + 'px;padding:0 3px 0 8px;pointer-events:auto;touch-action:none;background:rgba(143,211,255,.08);border-bottom:1px solid rgba(143,211,255,.14)}' +
    '#navMinimap .nmap-title{flex:1;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;color:#dbe8f3;font-size:12px;font-weight:700}' +
    '#navMinimap button,#navMinimapShow{display:grid;place-items:center;padding:0;border:0;border-radius:6px;cursor:pointer;color:#cfe2f0;background:rgba(255,255,255,.06);transition:background .12s,color .12s}' +
    '#navMinimap button{width:20px;height:17px}' +
    '#navMinimap button:hover,#navMinimapShow:hover{background:rgba(127,215,255,.28);color:#fff}' +
    '#navMinimap button svg{width:13px;height:13px}' +
    '#navMinimap canvas{display:block;width:' + TMAP_MINI.w + 'px;height:' + TMAP_MINI.h + 'px;image-rendering:pixelated;background:none;border-radius:0;box-shadow:none;cursor:inherit}' +   // 蓋掉 css/style.css 全域 canvas 的深色底（不然外圍永遠不透明）
    '#navMinimapShow{position:absolute;right:' + TMAP_MINI.right + 'px;bottom:' + TMAP_MINI.bottom + 'px;z-index:9;width:34px;height:34px;border-radius:10px;' +
      'background:rgba(0,4,10,.62);box-shadow:0 0 0 1px rgba(143,211,255,.22),0 4px 14px rgba(0,0,0,.45)}' +
    '#navMinimapShow svg{width:19px;height:19px}';
  document.head.appendChild(css);
  const wrap = document.getElementById('wrap') || document.body;
  tmapMiniEl = document.createElement('div'); tmapMiniEl.id = 'navMinimap';
  tmapMiniEl.innerHTML = '<div class="nmap-head"><span class="nmap-title">導航記錄器</span>' +
    '<button type="button" data-nmap="full" title="打開完整地圖（T-Pad 地圖，M 鍵）">' + MINIMAP_ICON_FULL + '</button>' +
    '<button type="button" data-nmap="hide" title="收起小地圖">' + MINIMAP_ICON_HIDE + '</button></div>';
  const cv = document.createElement('canvas'); cv.width = TMAP_MINI.w; cv.height = TMAP_MINI.h;
  tmapMiniEl.append(cv);   // 完整度只在 T-Pad「地圖」裡看
  tmapMiniShowBtn = document.createElement('button'); tmapMiniShowBtn.type = 'button'; tmapMiniShowBtn.id = 'navMinimapShow';
  tmapMiniShowBtn.title = '顯示小地圖'; tmapMiniShowBtn.innerHTML = MINIMAP_ICON_MAP; tmapMiniShowBtn.style.display = 'none';
  wrap.append(tmapMiniEl, tmapMiniShowBtn);
  tmapMiniCtx = cv.getContext('2d');
  tmapMiniEl.addEventListener('click', e => {
    const b = e.target.closest('[data-nmap]'); if (!b) return;
    if (b.dataset.nmap === 'hide') tmapMiniSetHidden(true); else minimapOpenFull();
  });
  tmapMiniShowBtn.addEventListener('click', () => tmapMiniSetHidden(false));
  // 按完不要讓按鈕留著焦點（不然之後按空白鍵會再按一次）
  [tmapMiniEl, tmapMiniShowBtn].forEach(el => el.addEventListener('mouseup', () => { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); }));
  // 按鈕、標題列不要觸發戰鬥中的射擊／移動
  [tmapMiniEl.querySelector('.nmap-head'), tmapMiniShowBtn].forEach(el => ['pointerdown', 'mousedown'].forEach(t => el.addEventListener(t, e => e.stopPropagation())));
  minimapDraggable(tmapMiniEl, tmapMiniEl.querySelector('.nmap-head'), 'field', TMAP_MINI);
}
function tmapMiniSetHidden(v) {
  tmapMiniHidden = v;
  try { localStorage.setItem(TMAP_MINI_HIDE_KEY, v ? '1' : '0'); } catch (_) {}
  if (typeof sfx === 'function') sfx(v ? 'switch' : 'blip');
  tmapMiniUpdate();
}
function tmapMiniUpdate() {
  const ammo = document.getElementById('ammoHud');
  const on = typeof MAP_FIELD !== 'undefined' && MAP_FIELD && typeof MAP !== 'undefined' && MAP && typeof G !== 'undefined' && G && G.player &&
    (MINIMAP_UIEDIT || (typeof equipLv === 'function' && !!equipLv('navrecorder')));   // UI 編輯器預覽：沒帶記錄器也顯示，才能調位置
  tmapMiniOn = !!on;
  if (!on) { if (tmapMiniEl) { tmapMiniEl.style.display = 'none'; tmapMiniShowBtn.style.display = 'none'; } if (ammo) ammo.style.right = ''; return; }
  if (!tmapMiniEl) tmapMiniBuild();
  const hidden = tmapMiniHidden && !MINIMAP_UIEDIT;
  tmapMiniEl.style.display = hidden ? 'none' : '';
  tmapMiniShowBtn.style.display = hidden ? '' : 'none';
  // 子彈往左讓位：小地圖在原本的右下角才需要讓；收起時只讓出小按鈕的寬度；拖去別的地方就不用讓
  const p = hidden ? { x: 0, y: 0 } : minimapPlace(tmapMiniEl, 'field', TMAP_MINI);
  if (ammo) ammo.style.right = hidden ? (TMAP_MINI.right + 34 + TMAP_MINI.gap) + 'px' : (p.x === 0 && p.y === 0) ? (TMAP_MINI.right + TMAP_MINI.w + TMAP_MINI.gap) + 'px' : '';
  if (hidden) return;
  const m = MAP, st = tmapExploreState(m), ctx = tmapMiniCtx, S = TMAP_MINI.cell, W = TMAP_MINI.w, H = TMAP_MINI.h;
  const [pc, pr] = tmapCellOf(G.player), ox = W / 2 - pc * S, oy = H / 2 - pr * S;   // 格子 → 小地圖上的 px（溫特在正中間）
  const c0 = Math.max(0, Math.floor(-ox / S)), c1 = Math.min(m.cols - 1, Math.ceil((W - ox) / S));
  const r0 = Math.max(0, Math.floor(-oy / S)), r1 = Math.min(m.rows - 1, Math.ceil((H - oy) / S));
  ctx.clearRect(0, 0, W, H);
  // 雷達格線：每 5 格一條（跟著地圖移動），先畫、在地圖下面
  ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(80,200,255,.14)'; ctx.beginPath();
  const G5 = S * 5;
  for (let x = ((ox % G5) + G5) % G5; x <= W; x += G5) { ctx.moveTo(Math.round(x) + .5, 0); ctx.lineTo(Math.round(x) + .5, H); }
  for (let y = ((oy % G5) + G5) % G5; y <= H; y += G5) { ctx.moveTo(0, Math.round(y) + .5); ctx.lineTo(W, Math.round(y) + .5); }
  ctx.stroke();
  for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) {
    const isOpen = tmapOpenSeen(st, c, r);
    if (!isOpen && !tmapWallAt(st, c, r)) continue;
    ctx.fillStyle = isOpen ? '#4c5869' : '#2a313c';   // 地面跟 T-Pad 戰鬥地圖同色；牆：小地圖 #2a313c、T-Pad 地圖 #1f242d
    ctx.fillRect(Math.round(ox + c * S), Math.round(oy + r * S), S, S);
  }
  ctx.fillStyle = '#5fd38a';   // 出入口
  for (const p of m.portals || []) if (tmapSeen(st, p.c, p.r) && !st.hidden.has(p.c + ',' + p.r) && !(p.hidden && typeof portalUsable === 'function' && !portalUsable(p))) ctx.fillRect(Math.round(ox + p.c * S) + 1, Math.round(oy + p.r * S) + 1, S - 2, S - 2);
  ctx.fillStyle = '#b77cff';   // 還沒打碎的異質核心
  for (const core of (G.cores || [])) {
    if (core.dead || core.hidden) continue;   // 躲在順順宮帽裡：地圖上不顯示（js/elite-cap-king.js）
    const [c, r] = tmapCellOf(core); if ((!tmapSeen(st, Math.floor(c), Math.floor(r)) || st.hidden.has(Math.floor(c) + ',' + Math.floor(r)))) continue;
    const x = ox + c * S, y = oy + r * S;
    ctx.beginPath(); ctx.moveTo(x, y - 5); ctx.lineTo(x + 4, y); ctx.lineTo(x, y + 5); ctx.lineTo(x - 4, y); ctx.closePath(); ctx.fill();
  }
  if (tmapSquadOn()) for (const t of tmapSquad()) {   // 無線電＋導航：隊員（倒下＝紅色、被虱目魚小子吃掉＝紫色）
    const [c, r] = tmapCellOf(t), x = ox + c * S, y = oy + r * S; if (x < -4 || y < -4 || x > W + 4 || y > H + 4) continue;
    ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fillStyle = t.eatenBy ? '#c77dff' : t.hp <= 0 ? '#ff5a5a' : '#ffb84a'; ctx.fill(); ctx.lineWidth = 1; ctx.strokeStyle = '#16191e'; ctx.stroke();
  }
  ctx.beginPath(); ctx.arc(W / 2, H / 2, 4, 0, Math.PI * 2);   // 自己
  ctx.fillStyle = '#4aa3ff'; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = '#fff'; ctx.stroke();
}
setInterval(tmapMiniUpdate, 100);

// M 鍵：有右下角小地圖的地方（基地，見 js/base-minimap.js；戰鬥區域要裝備慣性導航記錄器），打開 T-Pad 的「地圖」；地圖開著時再按一次＝關掉
window.addEventListener('keydown', e => {
  if ((e.key || '').toLowerCase() !== 'm' || e.repeat || e.ctrlKey || e.altKey || e.metaKey) return;
  if (e.target instanceof Element && e.target.closest('input, textarea, select, [contenteditable]')) return;   // 在打字
  if (typeof tpadOpen === 'undefined' || typeof openTPad !== 'function') return;
  if (tpadOpen) {
    if (tpadView === 'map') { closeTPad(); e.preventDefault(); e.stopImmediatePropagation(); }
    return;
  }
  const fieldMini = tmapMiniOn, baseMini = typeof bmapActive === 'function' && bmapActive();   // 小地圖收起來也算
  if (!fieldMini && !baseMini) return;   // 戰鬥區域沒帶記錄器：M 沒有作用
  if (G.over || (typeof paused !== 'undefined' && paused) || (typeof settingsOpen !== 'undefined' && settingsOpen)) return;
  if (typeof dialogueState !== 'undefined' && dialogueState) return;   // 跟 Tab 一樣：對話、背包、其他介面開著時不要蓋上去
  if (typeof backpackOpen !== 'undefined' && backpackOpen) return;
  if (TPAD_APPS.some(a => { try { return a.isOpen && a.isOpen(); } catch (_) { return false; } })) return;
  e.preventDefault();
  openTPad(); if (tpadOpen) launchTPadApp('map');
}, true);   // capture：比其他按鍵處理先收到（T-Pad 開著時別的處理會把按鍵擋掉）
