const elevatorId = Object.keys(ELEVATORS_DEFAULT)[0];
let elevatorDraft = JSON.parse(JSON.stringify(elevatorCatalog(true)));
if (!elevatorDraft[elevatorId]) elevatorDraft[elevatorId] = JSON.parse(JSON.stringify(ELEVATORS_DEFAULT[elevatorId]));
for (const state of ['closed', 'open']) {
  const setting = elevatorDraft[elevatorId][state];
  for (const edge of ['left', 'right', 'top', 'bottom']) {
    const key = edge + 'Inset';
    setting[key] = Math.max(0, Math.min(40, Number(setting[key] ?? ELEVATORS_DEFAULT[elevatorId][state][key]) || 0));
  }
  if (!setting.passage) setting.passage = JSON.parse(JSON.stringify(ELEVATORS_DEFAULT[elevatorId][state].passage));
}
let elevatorState = 'closed', elevatorMode = 'solid', elevatorDragging = false;
let passageStart = null;
const elevatorCanvas = document.getElementById('elevatorPreview');
const elevatorCtx = elevatorCanvas.getContext('2d');
const elevatorImages = { closed: new Image(), open: new Image() };
elevatorImages.closed.src = 'images/應變中心/elevator.png';
elevatorImages.open.src = 'images/應變中心/elevator-open.png';
Object.values(elevatorImages).forEach(img => { img.onload = drawElevatorEditor; });
function elevatorStatus(message, error = false) {
  const el = document.getElementById('elevatorStatus');
  el.textContent = message; el.style.color = error ? '#ffacaa' : '#8be0c2';
}
function saveElevatorDraft() {
  try { localStorage.setItem(ELEVATOR_STORAGE_KEY, JSON.stringify(elevatorDraft)); elevatorStatus('已自動儲存到這台瀏覽器。'); }
  catch (_) { elevatorStatus('儲存失敗：瀏覽器暫存空間不足。', true); }
}
function elevatorSetting() { return elevatorDraft[elevatorId][elevatorState]; }
function drawElevatorEditor() {
  const ctx = elevatorCtx, canvas = elevatorCanvas, setting = elevatorSetting();
  canvas.width = 120; canvas.height = 120;
  canvas.style.width = '420px'; canvas.style.height = '420px';
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = '#17212c'; ctx.fillRect(0, 0, 120, 120);
  const image = elevatorImages[elevatorState];
  if (image.complete && image.naturalWidth) {
    ctx.drawImage(image, 0, 0, 120, 120);
  }
  const blocked = new Set(setting.solid.map(([c, r]) => c + ',' + r));
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
    const solid = blocked.has(c + ',' + r);
    const x0 = c * 40 + (solid && c === 0 ? setting.leftInset : 0);
    const x1 = (c + 1) * 40 - (solid && c === 2 ? setting.rightInset : 0);
    const y0 = r * 40 + (solid && r === 0 ? setting.topInset : 0);
    const y1 = (r + 1) * 40 - (solid && r === 2 ? setting.bottomInset : 0);
    ctx.fillStyle = 'rgba(73,190,141,.13)'; ctx.fillRect(c * 40, r * 40, 40, 40);
    if (solid && x1 > x0 && y1 > y0) { ctx.fillStyle = 'rgba(231,75,90,.43)'; ctx.fillRect(x0, y0, x1 - x0, y1 - y0); }
    ctx.strokeStyle = solid && x1 > x0 && y1 > y0 ? '#ff6571' : '#5ecb9d';
    ctx.lineWidth = 1;
    if (solid && x1 > x0 && y1 > y0) ctx.strokeRect(x0 + .5, y0 + .5, x1 - x0 - 1, y1 - y0 - 1);
    else ctx.strokeRect(c * 40 + .5, r * 40 + .5, 39, 39);
  }
  const passage = setting.passage;
  if (passage.w > 0 && passage.h > 0) {
    ctx.fillStyle = 'rgba(80,245,112,.27)'; ctx.fillRect(passage.x, passage.y, passage.w, passage.h);
    ctx.strokeStyle = '#5fff83'; ctx.lineWidth = 2; ctx.strokeRect(passage.x + .5, passage.y + .5, passage.w - 1, passage.h - 1);
  }
  if (elevatorMode.endsWith('Edge')) {
    ctx.strokeStyle = '#67dcff'; ctx.lineWidth = 1.5;
    ctx.beginPath();
    if (elevatorMode === 'leftEdge' || elevatorMode === 'rightEdge') {
      const x = (elevatorMode === 'leftEdge' ? setting.leftInset : 120 - setting.rightInset) + .5;
      ctx.moveTo(x, 0); ctx.lineTo(x, 120);
    } else {
      const y = (elevatorMode === 'topEdge' ? setting.topInset : 120 - setting.bottomInset) + .5;
      ctx.moveTo(0, y); ctx.lineTo(120, y);
    }
    ctx.stroke();
  }
  ctx.strokeStyle = '#ffd36f'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, setting.depth + .5); ctx.lineTo(120, setting.depth + .5); ctx.stroke();
  ctx.fillStyle = '#ffd36f'; ctx.font = 'bold 10px sans-serif';
  ctx.fillText('深度 ' + setting.depth, 3, Math.max(11, setting.depth - 4));
}
function elevatorPoint(event) {
  const rect = elevatorCanvas.getBoundingClientRect();
  return { x: Math.max(0, Math.min(120, Math.round((event.clientX - rect.left) * 120 / rect.width))),
    y: Math.max(0, Math.min(120, Math.round((event.clientY - rect.top) * 120 / rect.height))) };
}
function refreshElevatorFields() {
  const setting = elevatorSetting();
  document.getElementById('elevatorDepth').value = setting.depth;
  for (const edge of ['left', 'right', 'top', 'bottom'])
    document.getElementById('elevator' + edge[0].toUpperCase() + edge.slice(1) + 'Inset').value = setting[edge + 'Inset'];
  for (const key of ['x', 'y', 'w', 'h'])
    document.getElementById('elevatorPassage' + key.toUpperCase()).value = setting.passage[key];
}
function setElevatorDepth(event) {
  elevatorSetting().depth = elevatorPoint(event).y;
  refreshElevatorFields();
  drawElevatorEditor(); saveElevatorDraft();
}
function setElevatorEdge(event) {
  const point = elevatorPoint(event), edge = elevatorMode.slice(0, -4);
  const raw = edge === 'left' ? point.x : edge === 'right' ? 120 - point.x : edge === 'top' ? point.y : 120 - point.y;
  elevatorSetting()[edge + 'Inset'] = Math.max(0, Math.min(40, raw));
  refreshElevatorFields();
  drawElevatorEditor(); saveElevatorDraft();
}
function setElevatorPassage(event) {
  const point = elevatorPoint(event);
  const x0 = Math.min(passageStart.x, point.x), y0 = Math.min(passageStart.y, point.y);
  elevatorSetting().passage = { x: x0, y: y0, w: Math.abs(point.x - passageStart.x), h: Math.abs(point.y - passageStart.y) };
  refreshElevatorFields(); drawElevatorEditor(); saveElevatorDraft();
}
elevatorCanvas.addEventListener('pointerdown', event => {
  elevatorCanvas.setPointerCapture(event.pointerId);
  if (elevatorMode === 'depth') { elevatorDragging = true; setElevatorDepth(event); return; }
  if (elevatorMode.endsWith('Edge')) { elevatorDragging = true; setElevatorEdge(event); return; }
  if (elevatorMode === 'passage') { passageStart = elevatorPoint(event); elevatorDragging = true; return; }
  const { x, y } = elevatorPoint(event), c = Math.min(2, Math.floor(x / 40)), r = Math.min(2, Math.floor(y / 40));
  const solid = elevatorSetting().solid, index = solid.findIndex(([sc, sr]) => sc === c && sr === r);
  if (index >= 0) solid.splice(index, 1); else solid.push([c, r]);
  drawElevatorEditor(); saveElevatorDraft();
});
elevatorCanvas.addEventListener('pointermove', event => { if (elevatorDragging) (elevatorMode === 'depth' ? setElevatorDepth : elevatorMode === 'passage' ? setElevatorPassage : setElevatorEdge)(event); });
for (const type of ['pointerup', 'pointercancel']) elevatorCanvas.addEventListener(type, event => {
  if (elevatorDragging && elevatorMode === 'passage') setElevatorPassage(event);
  elevatorDragging = false; passageStart = null;
});
document.querySelectorAll('[data-elevator-state]').forEach(button => button.addEventListener('click', () => {
  elevatorState = button.dataset.elevatorState;
  document.querySelectorAll('[data-elevator-state]').forEach(item => item.classList.toggle('active', item === button));
  refreshElevatorFields();
  drawElevatorEditor();
}));
document.querySelectorAll('[data-elevator-mode]').forEach(button => button.addEventListener('click', () => {
  elevatorMode = button.dataset.elevatorMode;
  document.querySelectorAll('[data-elevator-mode]').forEach(item => item.classList.toggle('active', item === button));
}));
document.querySelectorAll('[data-editor-tab]').forEach(button => button.addEventListener('click', () => {
  const elevator = button.dataset.editorTab === 'elevator';
  document.getElementById('seatsPanel').hidden = elevator;
  document.getElementById('elevatorPanel').hidden = !elevator;
  document.querySelectorAll('[data-editor-tab]').forEach(item => {
    item.classList.toggle('active', item === button);
    item.setAttribute('aria-selected', String(item === button));
  });
}));
document.getElementById('elevatorDepth').addEventListener('change', event => {
  elevatorSetting().depth = Math.max(0, Math.min(120, Math.round(Number(event.target.value) || 0)));
  event.target.value = elevatorSetting().depth;
  drawElevatorEditor(); saveElevatorDraft();
});
for (const edge of ['left', 'right', 'top', 'bottom']) {
  const input = document.getElementById('elevator' + edge[0].toUpperCase() + edge.slice(1) + 'Inset');
  input.addEventListener('change', event => {
    elevatorSetting()[edge + 'Inset'] = Math.max(0, Math.min(40, Math.round(Number(event.target.value) || 0)));
    refreshElevatorFields(); drawElevatorEditor(); saveElevatorDraft();
  });
}
for (const key of ['x', 'y', 'w', 'h']) {
  const input = document.getElementById('elevatorPassage' + key.toUpperCase());
  input.addEventListener('change', event => {
    const passage = elevatorSetting().passage;
    passage[key] = Math.max(0, Math.min(120, Math.round(Number(event.target.value) || 0)));
    passage.w = Math.min(passage.w, 120 - passage.x);
    passage.h = Math.min(passage.h, 120 - passage.y);
    refreshElevatorFields(); drawElevatorEditor(); saveElevatorDraft();
  });
}
document.getElementById('previewElevator').addEventListener('click', () => {
  saveElevatorDraft(); window.open('塔防原型.html?previewChairs=1&previewElevators=1', 'elevator_preview');
});
document.getElementById('exportElevators').addEventListener('click', () => {
  const content = '/* 由互動物件編輯器匯出：電梯關門／開門的擋路格與遮擋深度。 */\nconst ELEVATORS_DEFAULT = ' + JSON.stringify(elevatorDraft, null, 2) + ';\n';
  const url = URL.createObjectURL(new Blob([content], { type: 'text/javascript' }));
  const link = document.createElement('a'); link.href = url; link.download = 'elevators.js'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  elevatorStatus('已下載 elevators.js；放進 data 資料夾取代原檔即可正式套用。');
});
document.getElementById('resetElevators').addEventListener('click', () => {
  if (!confirm('丟棄這台瀏覽器裡尚未匯出的電梯設定，重新讀取 data/elevators.js？')) return;
  localStorage.removeItem(ELEVATOR_STORAGE_KEY);
  elevatorDraft = JSON.parse(JSON.stringify(ELEVATORS_DEFAULT));
  refreshElevatorFields();
  drawElevatorEditor(); elevatorStatus('已從檔案重新載入。');
});
refreshElevatorFields();
drawElevatorEditor();
