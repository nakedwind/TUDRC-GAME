/* ===== 音效編輯器 =====
   每個音效一條音量滑桿（倍率，1＝原本）。改動即時套用到試聽、自動存在瀏覽器（SFX.GAIN_KEY）；
   「下載 sound-volumes.js」覆蓋 data/sound-volumes.js 後，正式遊戲才會使用。
   音效清單來自 js/sfx.js（SFX.list()），新增音效時這裡會自動出現，只是沒有中文名稱、會排在「其他」。
*/
const MAX_GAIN = 3;
// 中文名稱與分組（名稱對應 js/sfx.js）
const SOUND_INFO = {
  // 介面
  button: ['介面', '按鈕'], menu: ['介面', '開選單'], switch: ['介面', '切換'], blip: ['介面', '對話下一頁'],
  place: ['介面', '放置建築'], error: ['介面', '錯誤提示'], achievement: ['介面', '達成成就'], favorUp: ['介面', '好感度提升'],
  crystalGet: ['介面', '得到異質碎片'], wave: ['介面', '波次開始'], win: ['介面', '勝利'], lose: ['介面', '失敗'],
  campWarning: ['介面', '營地被攻擊警告'], heartbeat: ['介面', '心跳'],
  // 溫特
  gunshot: ['溫特', '手槍開槍'], flare: ['溫特', '照明彈槍'], reload: ['溫特', '裝填'], footsteps: ['溫特', '走路腳步聲'],
  hit: ['溫特', '被打中'], soothe: ['溫特', '疏導'],
  // 哨兵攻擊
  rangedShot: ['哨兵攻擊', '遠程射擊'], meleeAttack: ['哨兵攻擊', '近戰攻擊'], swordSwing: ['哨兵攻擊', '揮劍'], cleaver: ['哨兵攻擊', '菜刀'],
  fireImpact: ['哨兵攻擊', '火焰命中'], lightningImpact: ['哨兵攻擊', '雷電命中'], corrosionImpact: ['哨兵攻擊', '腐蝕命中'],
  berserk: ['哨兵攻擊', '暴走'],
  // 怪物
  monsterHit: ['怪物', '怪物被打中（通用）'], monsterDown: ['怪物', '怪物倒下（史萊姆）'], kill: ['怪物', '擊殺（通用）'],
  slimeHit: ['怪物', '史萊姆撞擊'], slimeLand: ['怪物', '史萊姆落地'],
  birdHurt: ['怪物', '鳥頭人被打'], birdDeath: ['怪物', '鳥頭人死掉'], birdRun: ['怪物', '鳥頭人跑步'], birdWalk: ['怪物', '鳥頭人快走'],
  pearlShot: ['怪物', '珍珠小童噴珍珠'], pearlHit: ['怪物', '珍珠打中／碎掉'],
  // 場景與物件
  door: ['場景與物件', '關門'], backroomDoor: ['場景與物件', '後室開門'], elevator: ['場景與物件', '電梯'], shopBell: ['場景與物件', '便利商店門鈴'],
  knock2: ['場景與物件', '敲打（怪物打建築、衝撞）'], glassBreak3: ['場景與物件', '玻璃破掉 3'], glassBreak4: ['場景與物件', '玻璃破掉 4'],
  mineBeep: ['場景與物件', '地雷嗶聲'], mineGrind: ['場景與物件', '打磨'],
  smallBoom: ['場景與物件', '小爆炸'], midBoom: ['場景與物件', '中爆炸'], bigBoom: ['場景與物件', '大爆炸'],
};
const GROUP_ORDER = ['介面', '溫特', '哨兵攻擊', '怪物', '場景與物件', '其他'];

let gains = loadGains();
function loadGains() {
  try { const draft = JSON.parse(localStorage.getItem(SFX.GAIN_KEY) || 'null'); if (draft && typeof draft === 'object') return clean(draft); } catch (_) {}
  return clean(typeof SOUND_GAIN_DEFAULT !== 'undefined' ? SOUND_GAIN_DEFAULT : {});
}
function clean(map) {   // 只留 0～3 的數字；1（原本大小）不用記
  const out = {};
  for (const [k, v] of Object.entries(map || {})) {
    const n = Math.round(Math.max(0, Math.min(MAX_GAIN, Number(v))) * 100) / 100;
    if (Number.isFinite(n) && n !== 1) out[k] = n;
  }
  return out;
}
function status(text, error = false) { const el = document.getElementById('status'); el.textContent = text; el.style.color = error ? '#ffb4b4' : '#84ddbd'; }
function save() {
  gains = clean(gains);
  SFX.setGains(gains);   // 試聽立刻用新的音量
  try { localStorage.setItem(SFX.GAIN_KEY, JSON.stringify(gains)); status('已自動儲存到這台瀏覽器。'); }
  catch (_) { status('儲存失敗：瀏覽器暫存空間不足。', true); }
}

// 清單：sfx.js 的音效＋溫特的走路腳步聲（另外用 Audio 循環播放，不在 sfx.js 的清單裡）
function allSounds() {
  const list = SFX.list();
  list.push({ name: 'footsteps', file: 'footsteps01.mp3／footsteps02.mp3' });
  return list.map(s => {
    const [group, label] = SOUND_INFO[s.name] || ['其他', s.name];
    return { ...s, group, label };
  });
}
// 試聽：腳步聲另外播一小段，其他走 SFX（會套用目前的倍率）
let stepAudio = null;
function preview(sound) {
  if (!SFX.enabled) SFX.enabled = true;
  if (sound.name === 'footsteps') {
    if (stepAudio) stepAudio.pause();
    stepAudio = new Audio('Sound effects/footsteps01.mp3');
    stepAudio.volume = Math.min(1, .5 * SFX.volume / .35 * SFX.gainOf('footsteps'));
    stepAudio.play().catch(() => {});
    setTimeout(() => stepAudio && stepAudio.pause(), 1600);
    return;
  }
  SFX.play(sound.name, 1, 'editor-preview-' + sound.name);
}

const groupsEl = document.getElementById('groups');
function render() {
  const term = document.getElementById('search').value.trim().toLowerCase();
  const sounds = allSounds().filter(s => !term || (s.label + ' ' + s.name + ' ' + (s.file || '')).toLowerCase().includes(term));
  groupsEl.replaceChildren();
  for (const group of GROUP_ORDER) {
    const items = sounds.filter(s => s.group === group);
    if (!items.length) continue;
    const panel = document.createElement('section'); panel.className = 'panel';
    const h = document.createElement('h2'); h.textContent = group; panel.append(h);
    for (const s of items) panel.append(soundRow(s));
    groupsEl.append(panel);
  }
  if (!groupsEl.children.length) groupsEl.textContent = '沒有符合的音效';
}
function soundRow(s) {
  const row = document.createElement('div'); row.className = 'row';
  const name = document.createElement('div'); name.className = 'name';
  const b = document.createElement('b'); b.textContent = s.label;
  const sm = document.createElement('small'); sm.textContent = (s.file ? s.file : '程式合成') + '・' + s.name;
  name.append(b, sm);
  const range = document.createElement('input'); range.type = 'range'; range.min = 0; range.max = MAX_GAIN * 100; range.step = 5;
  range.setAttribute('aria-label', s.label + ' 音量');
  const pct = document.createElement('label'); pct.className = 'pct';
  const num = document.createElement('input'); num.type = 'number'; num.min = 0; num.max = MAX_GAIN * 100; num.step = 5;
  num.setAttribute('aria-label', s.label + ' 音量百分比');
  pct.append(num, '%');
  const play = document.createElement('button'); play.className = 'play'; play.type = 'button'; play.textContent = '▶ 試聽';
  const reset = document.createElement('button'); reset.className = 'reset'; reset.type = 'button'; reset.textContent = '↺'; reset.title = '恢復 100%';
  play.dataset.uiSound = reset.dataset.uiSound = 'none';   // 試聽時不要疊上按鈕的點擊聲
  const show = () => {
    const v = Math.round((gains[s.name] ?? 1) * 100);
    range.value = v; num.value = v;
    row.classList.toggle('changed', v !== 100); reset.disabled = v === 100;
  };
  const set = v => { gains[s.name] = Math.max(0, Math.min(MAX_GAIN * 100, Number(v) || 0)) / 100; save(); show(); };
  range.addEventListener('input', () => set(range.value));
  range.addEventListener('change', () => preview(s));   // 放開滑桿時試聽一下
  num.addEventListener('change', () => { set(num.value); preview(s); });
  play.addEventListener('click', () => preview(s));
  reset.addEventListener('click', () => { delete gains[s.name]; save(); show(); preview(s); });
  show();
  row.append(name, range, pct, play, reset);
  return row;
}

function exportText() {
  const sorted = Object.fromEntries(Object.entries(clean(gains)).sort(([a], [b]) => a.localeCompare(b)));
  return '/* 音效音量（由音效編輯器匯出）：每個音效的音量倍率，1＝原本大小，沒列出的就是 1。\n'
    + '   名稱對應 js/sfx.js 裡的音效；footsteps＝溫特走路的腳步聲。\n'
    + '   調整方式：打開「音效編輯器.html」拖滑桿試聽，調好後下載這個檔案覆蓋。 */\n'
    + 'const SOUND_GAIN_DEFAULT = ' + JSON.stringify(sorted, null, 2) + ';\n';
}
document.getElementById('search').addEventListener('input', render);
document.getElementById('exportBtn').addEventListener('click', () => {
  const content = exportText();
  document.getElementById('exportOut').value = content;
  const url = URL.createObjectURL(new Blob([content], { type: 'text/javascript' }));
  const a = document.createElement('a'); a.href = url; a.download = 'sound-volumes.js'; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  status('已下載 sound-volumes.js。放到遊戲的 data 資料夾覆蓋，正式遊戲就會使用新音量。');
});
document.getElementById('previewGame').addEventListener('click', () => {
  save(); window.open('塔防原型.html?previewSounds=1', 'sound_preview');
  status('已開啟使用瀏覽器暫存音量的遊戲預覽。');
});
document.getElementById('resetAll').addEventListener('click', () => {
  if (!confirm('把所有音效都恢復成 100%？')) return;
  gains = {}; save(); render();
});
document.getElementById('reloadFile').addEventListener('click', () => {
  if (!confirm('丟棄這台瀏覽器裡尚未匯出的音量設定，重新載入 data/sound-volumes.js？')) return;
  localStorage.removeItem(SFX.GAIN_KEY);
  gains = clean(typeof SOUND_GAIN_DEFAULT !== 'undefined' ? SOUND_GAIN_DEFAULT : {});
  SFX.setGains(gains); render(); status('已從檔案重新載入。');
});
SFX.setGains(gains);
render();
