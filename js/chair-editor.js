const CHAIR_CANDIDATE = /chair|sofa|bench|seating|bed|stool|椅|沙發|長椅|床|凳/i;
const savedTiles = (() => { try { return JSON.parse(localStorage.getItem('tudrc_tiles_v3') || 'null'); } catch (_) { return null; } })();
const tileById = new Map();
for (const tile of [...TILES_CUSTOM, ...(Array.isArray(savedTiles) ? savedTiles : [])]) {
  if (tile && tile.id && tile.file) tileById.set(tile.id, tile);
}
const candidates = [...tileById.values()].filter(tile => {
  const label = [tile.id, tile.name, String(tile.file).startsWith('data:') ? '' : tile.file].join(' ');
  if (CHAIRS_DEFAULT[tile.id]) return true;   // 已設定過的座椅（例如名稱沒寫「椅」的素材）
  return CHAIR_CANDIDATE.test(label) && !/bedside|床邊|drawers|抽屜|headwall|床頭牆板|plant|盆栽/i.test(label);
});
function defaultChair(tile) {
  const w = Math.max(1, Number(tile.w) || 1), h = Math.max(1, Number(tile.h) || 1);
  const bed = /bed|床/i.test(tile.id+' '+tile.name);
  return { enabled: !/booth_seating/i.test(tile.id), depth: h * 40 - 8,
    solid: Array.from({ length:w }, (_, c) => Array.from({ length:bed?h:1 }, (_, r) => [c,bed?r:h-1])).flat(),
    seat: { x: Math.round(w*20), y: Math.round(h*40*.56), dir: /side/i.test(tile.id) ? 'left' : /back/i.test(tile.id) ? 'back' : 'front', rotation: 0 } };
}
let chairs = JSON.parse(JSON.stringify(chairCatalog(true)));
for (const tile of candidates) if (!chairs[tile.id]) chairs[tile.id] = CHAIRS_DEFAULT[tile.id] ? JSON.parse(JSON.stringify(CHAIRS_DEFAULT[tile.id])) : defaultChair(tile);
let selectedId = candidates.find(tile => chairs[tile.id])?.id || Object.keys(chairs)[0];
let mode = 'seat', dragging = false, image = new Image();
const canvas = document.getElementById('preview'), ctx = canvas.getContext('2d');
const previewActor = Object.fromEntries(Object.entries({ front:'0000_Front.png', back:'0009_back.png', left:'0003_Leftside.png', right:'0006_right-side.png' }).map(([dir,file]) => {
  const img = new Image(); img.src = 'images/character/winter_B/winterB_' + file; img.onload = () => draw();
  return [dir,img];
}));
const currentTile = () => tileById.get(selectedId);
const currentChair = () => chairs[selectedId];
const size = () => ({ w: Math.max(1, Number(currentTile()?.w) || 1)*40, h: Math.max(1, Number(currentTile()?.h) || 1)*40 });
function status(message, error = false) {
  const el = document.getElementById('status'); el.textContent = message; el.style.color = error ? '#ffacaa' : '#8be0c2';
}
function save() {
  try { localStorage.setItem(CHAIR_STORAGE_KEY, JSON.stringify(chairs)); status('已自動儲存到這台瀏覽器。'); }
  catch (_) { status('儲存失敗：瀏覽器暫存空間不足。', true); }
}
function renderList() {
  const list = document.getElementById('chairList'), term = document.getElementById('search').value.trim().toLowerCase();
  list.replaceChildren();
  candidates.filter(tile => !term || (tile.id+' '+tile.name).toLowerCase().includes(term)).forEach(tile => {
    const button = document.createElement('button'); button.type = 'button';
    if (tile.id === selectedId) button.classList.add('selected');
    const img = document.createElement('img'); img.src = tile.file; img.alt = '';
    const label = document.createElement('span'), name = document.createElement('b'), id = document.createElement('small');
    name.textContent = tile.name || tile.id; id.textContent = tile.id; label.append(name,id); button.append(img,label);
    if (!chairs[tile.id]?.enabled) { const off = document.createElement('em'); off.textContent = '未啟用'; button.append(off); }
    button.addEventListener('click', () => { selectedId = tile.id; render(); }); list.append(button);
  });
  if (!list.children.length) list.textContent = '沒有符合的座椅素材';
}
function draw() {
  const {w,h} = size();
  canvas.width = w; canvas.height = h;
  const scale = Math.min(4, 440 / w, 440 / h);
  canvas.style.width = Math.round(w*scale)+'px'; canvas.style.height = Math.round(h*scale)+'px';
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = '#15202c'; ctx.fillRect(0,0,w,h);
  const chair = currentChair();
  const behind = chair && chair.seat.dir === 'back' && !/bed|床/i.test(selectedId);   // 背面椅子：人在椅子後面（跟遊戲一致）
  if (!behind && image.complete && image.naturalWidth) ctx.drawImage(image,0,0,w,h);
  if (!chair) return;
  const actor = previewActor[chair.seat.dir];
  if (actor?.complete && actor.naturalWidth) {
    ctx.globalAlpha = .34;
    ctx.save();
    ctx.translate(chair.seat.x, chair.seat.y-14);
    ctx.rotate((Number(chair.seat.rotation) || 0) * Math.PI / 180);
    ctx.drawImage(actor,-32,-32,64,64);
    ctx.restore();
    ctx.globalAlpha = 1;
  }
  if (behind && image.complete && image.naturalWidth) ctx.drawImage(image,0,0,w,h);
  for (const [c,r] of chair.solid) {
    ctx.fillStyle = 'rgba(231,75,90,.45)'; ctx.fillRect(c*40,r*40,40,40);
    ctx.strokeStyle = '#ff6571'; ctx.lineWidth = 1; ctx.strokeRect(c*40+.5,r*40+.5,39,39);
  }
  ctx.strokeStyle = 'rgba(193,220,234,.4)'; ctx.lineWidth = 1;
  for(let x=40;x<w;x+=40){ctx.beginPath();ctx.moveTo(x+.5,0);ctx.lineTo(x+.5,h);ctx.stroke();}
  for(let y=40;y<h;y+=40){ctx.beginPath();ctx.moveTo(0,y+.5);ctx.lineTo(w,y+.5);ctx.stroke();}
  ctx.strokeStyle = '#ffd36f'; ctx.lineWidth = 2; ctx.beginPath();ctx.moveTo(0,chair.depth+.5);ctx.lineTo(w,chair.depth+.5);ctx.stroke();
  ctx.fillStyle = '#ffd36f'; ctx.font = 'bold 10px sans-serif'; ctx.fillText('深度 '+chair.depth,3,Math.max(11,chair.depth-4));
  const x = chair.seat.x, y = chair.seat.y;
  ctx.strokeStyle = '#062b3c'; ctx.lineWidth = 4; ctx.beginPath();ctx.arc(x,y,7,0,Math.PI*2);ctx.stroke();
  ctx.strokeStyle = '#67dcff'; ctx.lineWidth = 2; ctx.beginPath();ctx.arc(x,y,7,0,Math.PI*2);ctx.moveTo(x-11,y);ctx.lineTo(x+11,y);ctx.moveTo(x,y-11);ctx.lineTo(x,y+11);ctx.stroke();
}
function render() {
  const tile = currentTile(), chair = currentChair(); if (!tile || !chair) return;
  document.getElementById('chairTitle').textContent = tile.name || tile.id;
  document.getElementById('chairSize').textContent = `${tile.w||1} × ${tile.h||1} 格`;
  document.getElementById('enabled').checked = !!chair.enabled;
  document.getElementById('depth').value = chair.depth;
  document.getElementById('seatX').value = chair.seat.x;
  document.getElementById('seatY').value = chair.seat.y;
  document.getElementById('direction').value = chair.seat.dir;
  document.getElementById('rotation').value = String(chair.seat.rotation || 0);
  image = new Image(); image.onload = draw; image.onerror = () => status('找不到這張椅子的圖片。', true); image.src = tile.file;
  renderList(); draw();
}
function point(event) {
  const rect = canvas.getBoundingClientRect();
  return { x: Math.max(0, Math.min(canvas.width, Math.round((event.clientX-rect.left)*canvas.width/rect.width))),
    y: Math.max(0, Math.min(canvas.height, Math.round((event.clientY-rect.top)*canvas.height/rect.height))) };
}
function applyPoint(event) {
  const chair = currentChair(), p = point(event);
  if (mode === 'seat') { chair.seat.x = p.x; chair.seat.y = p.y; }
  else if (mode === 'depth') chair.depth = p.y;
  else {
    const c = Math.min(Math.ceil(canvas.width/40)-1,Math.floor(p.x/40)), r = Math.min(Math.ceil(canvas.height/40)-1,Math.floor(p.y/40));
    const index = chair.solid.findIndex(([x,y]) => x===c && y===r);
    if (index >= 0) chair.solid.splice(index,1); else chair.solid.push([c,r]);
  }
  document.getElementById('depth').value = chair.depth;
  document.getElementById('seatX').value = chair.seat.x;
  document.getElementById('seatY').value = chair.seat.y;
  draw(); save();
}
canvas.addEventListener('pointerdown', event => { canvas.setPointerCapture(event.pointerId); dragging = mode !== 'solid'; applyPoint(event); });
canvas.addEventListener('pointermove', event => { if (dragging) applyPoint(event); });
canvas.addEventListener('pointerup', () => { dragging = false; });
canvas.addEventListener('pointercancel', () => { dragging = false; });
document.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => {
  mode = button.dataset.mode;
  document.querySelectorAll('[data-mode]').forEach(item => item.classList.toggle('active', item === button));
}));
document.getElementById('search').addEventListener('input', renderList);
document.getElementById('enabled').addEventListener('change', event => { currentChair().enabled = event.target.checked; save(); renderList(); });
for (const [id,key,parent] of [['depth','depth',null],['seatX','x','seat'],['seatY','y','seat']]) {
  document.getElementById(id).addEventListener('change', event => {
    const chair = currentChair(), field = parent ? chair[parent] : chair, max = key === 'x' ? size().w : size().h;
    field[key] = Math.max(0,Math.min(max,Math.round(Number(event.target.value)||0)));
    event.target.value = field[key]; draw(); save();
  });
}
document.getElementById('direction').addEventListener('change', event => { currentChair().seat.dir = event.target.value; draw(); save(); });
document.getElementById('rotation').addEventListener('change', event => { currentChair().seat.rotation = Number(event.target.value); draw(); save(); });
document.getElementById('previewGame').addEventListener('click', () => { save(); window.open('塔防原型.html?previewChairs=1&previewElevators=1','chair_preview'); });
document.getElementById('exportChairs').addEventListener('click', () => {
  const content = '/* 由椅子編輯器匯出：深度 px、擋路格、坐下位置 px。 */\nconst CHAIRS_DEFAULT = '+JSON.stringify(chairs,null,2)+';\n';
  const url = URL.createObjectURL(new Blob([content],{type:'text/javascript'}));
  const link = document.createElement('a'); link.href = url; link.download = 'chairs.js'; link.click();
  setTimeout(() => URL.revokeObjectURL(url),1000);
  status('已下載 chairs.js；放進 data 資料夾取代原檔即可正式套用。');
});
document.getElementById('resetChairs').addEventListener('click', () => {
  if (!confirm('丟棄這台瀏覽器裡尚未匯出的椅子設定，重新讀取 data/chairs.js？')) return;
  localStorage.removeItem(CHAIR_STORAGE_KEY); chairs = JSON.parse(JSON.stringify(CHAIRS_DEFAULT));
  for (const tile of candidates) if (!chairs[tile.id]) chairs[tile.id] = defaultChair(tile);
  render(); status('已從檔案重新載入。');
});
render();
