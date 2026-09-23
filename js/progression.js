/* 異質結晶與哨兵養成。獨立存檔，不改動地圖與編隊存檔。 */
const TRAINING_KEY = 'sentinel-crystals-v1';
const training = { crystals: 0, levels: {} };
try {
  const saved = JSON.parse(localStorage.getItem(TRAINING_KEY) || '{}');
  training.crystals = Number.isSafeInteger(saved.crystals) && saved.crystals >= 0 ? saved.crystals : 0;
  for (const key of Object.keys(TYPES)) training.levels[key] = Math.max(1, Math.min(30, Math.floor(Number(saved.levels?.[key]) || 1)));
} catch (_) {}
const trainingBase = Object.fromEntries(Object.entries(TYPES).map(([key,s]) => [key,{hp:s.hp,dmg:s.dmg}]));
function applyTraining() {
  for (const [key, base] of Object.entries(trainingBase)) {
    const n = (training.levels[key] || 1)-1;
    TYPES[key].hp = Math.round(base.hp*(1+n*.10));
    TYPES[key].dmg = Math.round(base.dmg*(1+n*.08));
  }
}
applyTraining();
function saveTraining() {
  try { localStorage.setItem(TRAINING_KEY,JSON.stringify(training)); }
  catch (_) {}
}
function earnCrystals(amount) {
  training.crystals += Math.max(0, Math.floor(amount || 0));
  saveTraining();
  if (typeof isSquadPanelOpen === 'function' && isSquadPanelOpen()) renderSquadPanel();
}
function sentryLevel(type) { return training.levels[type] || 1; }
function sentryUpgradeCost(type) { return 30 * sentryLevel(type); }
function canUpgradeSentry(type) {
  const spec = TYPES[type];
  return !!spec && typeof MAP_SAFE !== 'undefined' && MAP_SAFE && sentryLevel(type) < 30 && training.crystals >= sentryUpgradeCost(type);
}
function upgradeSentry(type) {
  if (!canUpgradeSentry(type)) return false;
  const cost = sentryUpgradeCost(type);
  training.crystals -= cost;
  training.levels[type] = sentryLevel(type) + 1;
  applyTraining(); saveTraining();
  if (typeof G !== 'undefined' && G) for (const t of G.towers) if (t.type === type) {
    const ratio = t.maxhp > 0 ? t.hp / t.maxhp : 1;
    t.maxhp = TYPES[type].hp; t.hp = Math.max(0, ratio * t.maxhp);
  }
  return true;
}

function seedCores() {
  G.cores=[];
  if(MAP_SAFE) return;
  const map=typeof MAP!=='undefined'?MAP:{};
  const difficulty=Math.max(1,Math.min(5,Number(map.difficulty)||1));
  const count=Math.max(1,Math.min(5,Math.floor(Number(map.coreCount)||difficulty)));
  const cells=spawnCells().filter(([c,r])=>!isWall(c,r)&&!G.grid[c+','+r]);
  for(let i=0;i<Math.min(count,cells.length);i++) {
    const [c,r]=cells[Math.floor(i*cells.length/Math.min(count,cells.length))];
    const [x,y]=center(c,r);
    G.cores.push({x,y,hp:200*difficulty,maxhp:200*difficulty,dead:false,timer:1.8+i*.7+Math.random()*2.4,reward:100*difficulty});
  }
}
function darkMonsterSpawnCells() {
  const recent = new Set((G.recentMonsterSpawns || []).slice(-12));
  const candidates = [], fallback = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const key = c + ',' + r;
    if (isWall(c,r) || G.grid[key]) continue;
    const [x,y] = center(c,r);
    if (G.player && Math.hypot(x-G.player.x,y-G.player.y) < CELL*4) continue;
    if (G.towers.some(t=>t.hp>0 && Math.hypot(x-t.x,y-t.y)<CELL*3)) continue;
    if (!cellLit(c,r)) {
      fallback.push([c,r]);
      if (!recent.has(key) && !G.enemies.some(e=>Math.hypot(x-e.x,y-e.y)<CELL*1.5)) candidates.push([c,r]);
    }
  }
  return candidates.length ? candidates : fallback;
}
function spawnCoreGroup(core) {
  const cells = darkMonsterSpawnCells();
  if (!cells.length) return;
  const count = Math.min(1 + Math.floor(Math.random()*3), 60-G.enemies.length, cells.length);
  for (let i=0;i<count;i++) {
    const index = Math.floor(Math.random()*cells.length), [c,r] = cells.splice(index,1)[0];
    const [x,y] = center(c,r);
    G.enemies.push({x,y,hp:WAVE_CFG.baseHp,maxhp:WAVE_CFG.baseHp,speed:WAVE_CFG.baseSpeed,reward:WAVE_CFG.reward,hasTarget:false,wanderWait:Math.random()*.8,slimeClock:Math.random()*.62});
    G.recentMonsterSpawns = G.recentMonsterSpawns || [];
    G.recentMonsterSpawns.push(c+','+r);
    if (G.recentMonsterSpawns.length>18) G.recentMonsterSpawns.shift();
  }
}
function updateCores(dt) {
  for(const core of G.cores) {
    if(core.dead) continue;
    core.timer-=dt;
    if(core.timer<=0 && G.enemies.length<60) {
      spawnCoreGroup(core);
      core.timer=2.6+Math.random()*4.2;
    }
  }
}
function drawCore(core) {
  if(core.dead) return;
  ctx.save();ctx.fillStyle='#bd76ed';ctx.strokeStyle='#f4d5ff';ctx.lineWidth=3;
  ctx.beginPath();ctx.moveTo(core.x,core.y-23);ctx.lineTo(core.x+18,core.y);ctx.lineTo(core.x,core.y+23);ctx.lineTo(core.x-18,core.y);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle='#25202b';ctx.fillRect(core.x-28,core.y-39,56,6);ctx.fillStyle='#d69bff';ctx.fillRect(core.x-28,core.y-39,56*Math.max(0,core.hp/core.maxhp),6);
  ctx.font='14px sans-serif';ctx.textAlign='center';ctx.fillStyle='white';ctx.fillText('異質核心',core.x,core.y-46);ctx.restore();
}
