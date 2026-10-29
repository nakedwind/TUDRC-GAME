/* Search locally, walk to each pickup, then resume following the handler.
   撿到的東西先叼在嘴裡（dog.carryItem），走到收的人旁邊才交出去：
   ・溫特放在地上的急救包、杏仁水 → 給嚮導（js/ground-items.js）
   ・其他（異質碎片、拾取亮點、怪物掉的道具／裝備）→ 給溫特 */
const DOG_PICKUP = { searchCells: 16, leashCells: 16, reach: 30, speed: 170, interval: .65, scanInterval: .4, timeout: 8 };   // searchCells：找地上東西的範圍；leashCells：離領犬員多遠以內的才去撿（要跟 searchCells 一樣大，不然遠的撿不到）；speed：去撿東西、叼給嚮導時跑多快（平常跟著走是 110）
// ---- 球球的技能（T-Pad「Y102隊員」→ 球球的技能樹；js/skills.js 的 DOG_SKILL_LAYOUT）----
const dogSkill = id => typeof hasSkill === 'function' && hasSkill('ball', id);
const dogSearchCells = () => DOG_PICKUP.searchCells * (dogSkill('a-1') ? DOG_SKILL.searchMul : 1);   // 👃 搜尋範圍加大（牽繩距離跟著變大）
const dogSpeedMul = () => dogSkill('b-1') ? DOG_SKILL.speedMul : 1;                                    // 💨 移動速度加快
const dogFindsHidden = () => dogSkill('core-1');                                                      // 🔍 撿得到隱藏的物品（沒有光點的）
const dogFindsTunnels = () => dogSkill('ult');                                                        // 🕳️ 找得到隱藏的地道

function dogPickupTargetExists(target) {
  if (target.kind === 'shard') {
    const shard = target.shard;
    return G.oreShards?.includes(shard) && !shard.picked && shard.z <= 0 && shard.t >= SHARD.delay;
  }
  return storagePropEntries().some(prop => isPickupProp(prop) && (target.prop.drop ? prop.drop === target.prop.drop : prop.token === target.prop.token));
}
function dogPickupPosition(target) {
  return target.kind === 'shard' ? target.shard : target.prop;
}
function dogPickupApproach(dog, position) {
  const [c0, r0] = cellAt(position.x, position.y), options = [];
  if (!sentryBlocked(position.x, position.y) && personnelInLight(position.x, position.y)) options.push({ x: position.x, y: position.y });
  for (let dc = -1; dc <= 1; dc++) for (let dr = -1; dr <= 1; dr++) {
    const c = c0 + dc, r = r0 + dr;
    if (!sentryCellWalkable(c, r)) continue;
    const [x, y] = center(c, r);
    if (Math.hypot(x - position.x, y - position.y) < DOG_PICKUP.reach && personnelStepAllowed(x, y, position.x, position.y)) options.push({ x, y });
  }
  for (const point of options) {
    const path = buildSentryPath(dog, point.x, point.y);
    if (path) return { ...point, path };
  }
  return null;
}
function findDogPickup(dog, anchor) {
  const candidates = [];
  for (const shard of G.oreShards || []) if (!shard.picked && shard.z <= 0 && shard.t >= SHARD.delay) candidates.push({ kind: 'shard', shard });
  for (const prop of storagePropEntries()) if (isPickupProp(prop) && !(prop.hidden && !dogFindsHidden()) && (prop.kind !== 'ground-item' || groundItemGuide(prop.drop.id, prop))) candidates.push({ kind: 'prop', prop });   // 溫特放在地上的：只撿嚮導用得到、還沒帶滿的（js/ground-items.js）
  const nearby = candidates.filter(target => {
    const pos = dogPickupPosition(target);
    const ignored = (dog.pickupIgnored || []).some(entry => entry.key === (target.shard || target.prop.drop || target.prop.token));
    return !ignored && isLit(pos.x, pos.y) && Math.hypot(pos.x - dog.x, pos.y - dog.y) <= dogSearchCells() * CELL
      && Math.hypot(pos.x - anchor.x, pos.y - anchor.y) <= dogSearchCells() * CELL;
  }).sort((a, b) => {
    const pa = dogPickupPosition(a), pb = dogPickupPosition(b);
    return Math.hypot(pa.x - dog.x, pa.y - dog.y) - Math.hypot(pb.x - dog.x, pb.y - dog.y);
  });
  for (const target of nearby) {
    const approach = dogPickupApproach(dog, dogPickupPosition(target));
    if (approach) return { ...target, approach, age: 0 };
    ignoreDogPickup(dog, target);
  }
  return null;
}
function ignoreDogPickup(dog, target) {
  dog.pickupIgnored = dog.pickupIgnored || [];
  dog.pickupIgnored.push({ key: target.shard || target.prop.drop || target.prop.token, remaining: 3 });
}
function clearDogPickup(dog) {
  dog.pickupTarget = null;
  dog.navPath = null; dog.navGoal = null; dog.navTimer = 0;
}
function updateRescueDogPickup(dog, anchor, dt) {
  if (dog.id !== 'ball' || MAP_SAFE || !getTeam().includes('ball') || !anchor) return false;
  dog.pickupCooldown = Math.max(0, (dog.pickupCooldown || 0) - dt);
  dog.pickupScan = Math.max(0, (dog.pickupScan || 0) - dt);
  dog.pickupIgnored = (dog.pickupIgnored || []).filter(entry => (entry.remaining -= dt) > 0);
  if (dog.carryItem) return dogCarryStep(dog, dt);   // 嘴裡叼著要給嚮導的東西：先送過去（不受牽繩距離限制）
  if (Math.hypot(dog.x - anchor.x, dog.y - anchor.y) > dogSearchCells() * CELL) {
    if (dog.pickupTarget) clearDogPickup(dog);
    return false;
  }
  if (dog.pickupCooldown > 0) return false;
  let target = dog.pickupTarget;
  if (target) {
    const pos = dogPickupPosition(target);
    target.age += dt;
    if (!dogPickupTargetExists(target) || !isLit(pos.x, pos.y) || target.age > DOG_PICKUP.timeout
        || Math.hypot(pos.x - anchor.x, pos.y - anchor.y) > dogSearchCells() * CELL) {
      if (target.age > DOG_PICKUP.timeout) ignoreDogPickup(dog, target);
      clearDogPickup(dog); target = null;
    }
  }
  if (!target && dog.pickupScan <= 0) {
    dog.pickupScan = DOG_PICKUP.scanInterval;
    dog.pickupTarget = target = findDogPickup(dog, anchor);
    if (target) { dog.navPath = target.approach.path; dog.navGoal = cellAt(target.approach.x, target.approach.y).join(','); dog.navTimer = .75; }
  }
  if (!target) return false;
  const pos = dogPickupPosition(target);
  if (Math.hypot(dog.x - pos.x, dog.y - pos.y) < DOG_PICKUP.reach && personnelStepAllowed(dog.x, dog.y, pos.x, pos.y)) {
    const carry = dogTakePickup(dog, target);
    clearDogPickup(dog);
    if (!carry) { ignoreDogPickup(dog, target); return true; }   // 撿不起來（例如溫特已達持有上限）：先不要再去撿這個
    dog.carryItem = { ...carry, age: 0 };
    if (typeof sfxAt === 'function') sfxAt('pop', dog.x, dog.y, .5, 'dog-carry');
    return true;
  }
  moveSentryWithPath(dog, target.approach.x, target.approach.y, DOG_PICKUP.speed * dogSpeedMul(), dt);
  if (dog.navFailed) { ignoreDogPickup(dog, target); clearDogPickup(dog); return false; }
  return true;
}
// 把地上的東西叼起來（從地上拿掉）；回傳叼著的內容，撿不起來＝null
function dogTakePickup(dog, target) {
  if (target.kind === 'shard') {
    const sh = target.shard;
    if (!G.oreShards?.includes(sh) || sh.picked || sh.z > 0 || sh.t < SHARD.delay) return null;
    sh.picked = true; G.oreShards = G.oreShards.filter(o => o !== sh);
    return { to: 'player', shard: { value: sh.value, rare: sh.rare } };
  }
  const prop = target.prop;
  if (!dogPickupTargetExists(target)) return null;
  if (prop.kind === 'ground-item') {   // 溫特放在地上的急救包、杏仁水：叼去給嚮導
    const guide = groundItemGuide(prop.drop.id, dog); if (!guide) return null;
    removeGroundItem(prop.drop, 1);
    return { to: 'guide', id: prop.drop.id, guide };
  }
  if (prop.kind === 'equipment-drop') {
    const d = prop.drop;
    if (d.item && carryRoom(d.item) <= 0) return null;
    G.equipmentDrops = (G.equipmentDrops || []).filter(o => o !== d);
    return d.item ? { to: 'player', id: d.item } : { to: 'player', equip: d.id };
  }
  const loot = WORLD_PICKUPS[prop.kind]; if (!loot || carryRoom(loot.item) <= 0) return null;
  collectedStorageKeys.add(prop.token);   // 地圖上的拾取亮點：叼起來就從地上消失
  return { to: 'player', id: loot.item };
}
// 叼著東西走去給收的人：嚮導倒下／帶滿了就換給別的嚮導；都不需要、或一直走不到就放回地上
function dogCarryStep(dog, dt) {
  const c = dog.carryItem; c.age += dt;
  let who;
  if (c.to === 'guide') {
    const ok = t => t && G.towers.includes(t) && t.hp > 0 && !t.berserk && (guideKit(t)[c.id] || 0) < CAMP_SUPPLY.carry;
    if (!ok(c.guide)) c.guide = groundItemGuide(c.id, dog);
    who = c.guide;
  } else who = G.player && G.player.hp > 0 ? G.player : null;
  if (!who || c.age > DOG_PICKUP.timeout * 2.5) { dogDropCarry(dog); return false; }
  if (Math.hypot(dog.x - who.x, dog.y - who.y) < CELL * 1.1) {
    if (c.to === 'guide') giveGuideItem(who, c.id); else dogGivePlayer(dog, c);
    dog.carryItem = null; clearDogPickup(dog); dog.pickupCooldown = DOG_PICKUP.interval;
    return true;
  }
  moveSentryWithPath(dog, who.x, who.y, DOG_PICKUP.speed * dogSpeedMul(), dt);
  if (dog.navFailed) c.age += dt * 3;   // 走不到：很快就放棄
  return true;
}
// 走到溫特旁邊：交給溫特（拿不下的放在溫特腳邊，自己走過去撿）
function dogGivePlayer(dog, c) {
  const p = G.player;
  if (c.shard) {
    earnCrystals(c.shard.value); showPickupToast(c.shard.value);
    flash('+' + c.shard.value, p.x, p.y - 50, '#d69bff', .9); SFX.play('crystalGet', .7, 'shard-pickup');
  } else if (c.equip) {
    if (grantEquipment(c.equip, '球球叼來了')) sfx('itemPickup');
  } else if (supplyGain(c.id, 1)) {
    sfx('itemPickup'); showItemPickupNotice(c.id, 1);
  } else { (G.groundItems = G.groundItems || []).push({ id: c.id, qty: 1, x: p.x, y: p.y + 6 }); }
  updateHUD(); saveGame();
}
// 送不出去：放在球球腳邊
function dogDropCarry(dog) {
  const c = dog.carryItem, x = dog.x, y = dog.y + 4;
  if (c.shard) (G.oreShards = G.oreShards || []).push({ x, y, z: 0, vx: 0, vy: 0, vz: 0, value: c.shard.value, rare: c.shard.rare, t: SHARD.delay, spin: Math.random() * 6 });
  else if (c.equip) (G.equipmentDrops = G.equipmentDrops || []).push({ id: c.equip, x, y });
  else (G.groundItems = G.groundItems || []).push({ id: c.id, qty: 1, x, y });
  dog.carryItem = null; clearDogPickup(dog); dog.pickupCooldown = DOG_PICKUP.interval;
}

// ---- 球球跟誰：右鍵點球球、或點左邊隊員欄球球的頭像，選要跟哪位隊員或溫特 ----
// G.dogFollow：隊員的 type，或 'player'＝溫特；沒選＝跟領犬員（換地圖就重設）。選的人倒下／暴走：先跟領犬員，恢復了再跟回去
function dogFollowAnchor() {
  const ok = t => t && t.hp > 0 && !t.berserk;
  if (G.dogFollow === 'player') return G.player;
  const picked = G.dogFollow && G.towers.find(t => t.type === G.dogFollow);
  if (ok(picked)) return picked;
  return G.towers.find(t => RESCUE_DOG_HANDLERS.includes(t.type) && ok(t)) || G.player;
}
const dogFollowName = who => who === G.player ? '溫特' : (TYPES[who.type] || {}).name || '隊員';
// 地圖上點到的球球（只有出勤時）；沒點到＝null
function dogAt(x, y) {
  if (MAP_SAFE || !getTeam().includes('ball')) return null;
  const dog = (G.npcs || []).find(n => n.id === 'ball');
  return dog && Math.hypot(dog.x - x, dog.y - 8 - y) <= 20 ? dog : null;
}
// left、top：選單左上角的畫面座標（clientX／clientY）。借用隊員欄的指令選單（js/team.js 的 fieldCommandMenu）
function openDogFollowMenu(left, top) {
  if (typeof fieldCommandMenu === 'undefined' || !fieldCommandMenu) return;
  if (!fieldCommandMenu.classList.contains('hidden') && fieldCommandMenu.dataset.type === 'ball') { closeFieldCommandMenu(); return; }   // 再點一次＝關閉
  const now = dogFollowAnchor();
  const option = (key, who, name) => {
    const off = who !== G.player && (who.hp <= 0 || who.berserk), on = who === now;
    return '<button type="button" class="field-command-option' + (on ? ' active' : '') + '" data-dog-follow="' + key + '"' + (off ? ' disabled' : '') + '>' + name +
      (on ? '<small>跟隨中</small>' : off ? '<small>無法行動</small>' : '') + '</button>';
  };
  fieldCommandMenu.innerHTML = '<div class="field-command-head"><strong>球球要跟誰？</strong>' +
    '<button type="button" class="field-command-close" aria-label="關閉選單">×</button></div>' +
    option('player', G.player, '溫特（自己）') + G.towers.map(t => option(t.type, t, (TYPES[t.type] || {}).name || t.type)).join('');
  fieldCommandMenu.querySelector('.field-command-close').addEventListener('click', () => { sfx('switch'); closeFieldCommandMenu(); });
  fieldCommandMenu.querySelectorAll('[data-dog-follow]').forEach(b => b.addEventListener('click', () => setDogFollow(b.dataset.dogFollow)));
  fieldCommandMenu.dataset.type = 'ball';
  const wrapRect = document.getElementById('wrap').getBoundingClientRect();
  fieldCommandMenu.style.left = Math.round(left - wrapRect.left) + 'px';
  fieldCommandMenu.style.top = Math.round(top - wrapRect.top) + 'px';
  fieldCommandMenu.classList.remove('hidden');
  sfx('menu');
}
function setDogFollow(key) {
  G.dogFollow = key;
  const dog = (G.npcs || []).find(n => n.id === 'ball'), who = dogFollowAnchor();
  if (dog) { dog.navPath = null; dog.navGoal = null; flash('球球：跟著' + dogFollowName(who), dog.x, dog.y - 24, '#8fd3ff', 3); }
  sfx('button'); closeFieldCommandMenu();
}

// ===== 🕳️ 隱藏的地道：學會「地道搜索」後，球球聞到附近藏起來的地道 → 跑過去坐下汪汪叫 → 地道出現，可以進去 =====
// 隱藏地道＝地圖編輯器用「🕳️ 隱藏地道」工具設的出入口（portal.hidden）；發現過的記在瀏覽器（每張地圖、每個地道各自記）
const TUNNEL_FOUND_KEY = 'tudrc_tunnels_found_v1';
const DOG_TUNNEL = { barkTime: 2.2, barkEvery: .75, scanInterval: .6 };   // 叫多久地道才出現、多久叫一聲、多久聞一次
const tunnelsFound = (() => { try { return new Set(JSON.parse(localStorage.getItem(TUNNEL_FOUND_KEY) || '[]')); } catch (_) { return new Set(); } })();
const tunnelKey = pt => (MAP && (MAP.id || MAP_INDEX)) + '|' + pt.c + ',' + pt.r;
function tunnelFound(pt) { return tunnelsFound.has(tunnelKey(pt)); }
// 這個出入口現在能不能用：一般出入口都可以；隱藏地道要先被球球找到（js/game.js 的 portalNearPlayer、T-Pad 地圖用）
function portalUsable(pt) { return !pt.hidden || tunnelFound(pt); }
function revealTunnel(pt, dog) {
  tunnelsFound.add(tunnelKey(pt));
  try { localStorage.setItem(TUNNEL_FOUND_KEY, JSON.stringify([...tunnelsFound])); } catch (_) {}
  const [x, y] = center(pt.c, pt.r);
  G.effects.push({ ring: true, x, y: y + 6, r: 6, r2: 42, life: .45, life0: .45, color: '#c8a46a' });
  for (let i = 0; i < 10; i++) G.effects.push({ particle: true, kind: 'spark', x: x + (Math.random() - .5) * 24, y: y + 6, vx: (Math.random() - .5) * 60, vy: -(30 + Math.random() * 50), r: 2 + Math.random() * 2, life: .5 + Math.random() * .3, life0: .8, color: Math.random() < .5 ? '#a8936c' : '#cdbb91' });
  if (typeof systemNotice === 'function') systemNotice('🐾 球球發現了隱藏的地道！');
  if (typeof flash === 'function') flash('發現地道！', x, y - 30, '#ffd479', 1.6);
  if (typeof sfxAt === 'function') sfxAt('loofahVine', x, y, .5, 'tunnel-open');
}
function hiddenTunnelsHere() { return (MAP && MAP.portals || []).filter(pt => pt.hidden && !tunnelFound(pt)); }
// 每幀由 js/sentry.js 呼叫（球球跟隊出勤時）；回傳 true＝這幀球球在忙著找地道
function updateDogTunnel(dog, anchor, dt) {
  if (dog.id !== 'ball' || MAP_SAFE || !anchor || !dogFindsTunnels() || dog.carryItem) { dog.tunnel = null; return false; }
  const tn = dog.tunnel;
  if (tn) {
    if (tunnelFound(tn.pt) || Math.hypot(dog.x - anchor.x, dog.y - anchor.y) > dogSearchCells() * CELL * 1.3) { dog.tunnel = null; dog.navPath = null; return false; }
    const [x, y] = center(tn.pt.c, tn.pt.r);
    if (tn.state === 'go') {
      if (Math.hypot(dog.x - tn.goal.x, dog.y - tn.goal.y) < 10) { tn.state = 'bark'; tn.t = 0; tn.next = .5; dog.moving = false; dog.faceRight = x > dog.x; return true; }
      moveSentryWithPath(dog, tn.goal.x, tn.goal.y, DOG_PICKUP.speed * dogSpeedMul(), dt);
      if (dog.navFailed) { dog.tunnel = null; dog.tunnelIgnore = { key: tunnelKey(tn.pt), t: 6 }; return false; }
      return true;
    }
    // 坐下汪汪叫（停住超過一下子會自動坐下：js/ball-poses.js）
    dog.moving = false; tn.t += dt; tn.next -= dt;
    if (tn.next <= 0) {
      tn.next = DOG_TUNNEL.barkEvery;
      if (typeof sfxAt === 'function') sfxAt('ballBark', dog.x, dog.y, .8, 'dog-tunnel-bark');
      if (typeof flash === 'function') flash('汪！', dog.x + (Math.random() - .5) * 10, dog.y - 40, '#fff2c4', .6);
    }
    if (tn.t >= DOG_TUNNEL.barkTime) { revealTunnel(tn.pt, dog); dog.tunnel = null; }
    return true;
  }
  if (dog.tunnelIgnore && (dog.tunnelIgnore.t -= dt) <= 0) dog.tunnelIgnore = null;
  dog.tunnelScan = (dog.tunnelScan || 0) - dt;
  if (dog.tunnelScan > 0) return false;
  dog.tunnelScan = DOG_TUNNEL.scanInterval;
  const R = dogSearchCells() * CELL;
  const near = hiddenTunnelsHere().map(pt => { const [x, y] = center(pt.c, pt.r); return { pt, x, y, d: Math.hypot(x - dog.x, y - dog.y) }; })
    .filter(o => o.d <= R && Math.hypot(o.x - anchor.x, o.y - anchor.y) <= R && !(dog.tunnelIgnore && dog.tunnelIgnore.key === tunnelKey(o.pt)))
    .sort((a, b) => a.d - b.d);
  for (const o of near) {
    // 站在地道旁邊（地道那一格常常是牆或門框）：找一格走得到的
    for (const [dc, dr] of [[0, 1], [0, 0], [1, 0], [-1, 0], [0, -1], [1, 1], [-1, 1]]) {
      const c = o.pt.c + dc, r = o.pt.r + dr;
      if (!sentryCellWalkable(c, r)) continue;
      const [gx, gy] = center(c, r), path = buildSentryPath(dog, gx, gy);
      if (!path) continue;
      dog.tunnel = { pt: o.pt, goal: { x: gx, y: gy }, state: 'go', t: 0 };
      dog.navPath = path; dog.navGoal = c + ',' + r; dog.navTimer = .75;
      if (typeof flash === 'function') flash('？', dog.x, dog.y - 40, '#fff2c4', .7);   // 聞到了
      return true;
    }
  }
  return false;
}
// 找到的地道：地上畫一個洞（js/render.js 的地面層）
function drawHiddenTunnels(ctx) {
  for (const pt of (MAP && MAP.portals) || []) {
    if (!pt.hidden || !tunnelFound(pt)) continue;
    const [x, y] = center(pt.c, pt.r);
    if (typeof isVisible === 'function' && !isVisible(x, y)) continue;
    ctx.save();
    ctx.fillStyle = 'rgba(122,101,69,.85)'; ctx.beginPath(); ctx.ellipse(x, y + 8, 19, 9, 0, 0, Math.PI * 2); ctx.fill();   // 翻起來的土
    ctx.fillStyle = '#120d08'; ctx.beginPath(); ctx.ellipse(x, y + 8, 14, 6, 0, 0, Math.PI * 2); ctx.fill();               // 洞
    ctx.fillStyle = 'rgba(205,187,145,.8)';
    for (const [dx, dy] of [[-17, 3], [15, 5], [-8, 15], [10, 14], [0, -1]]) { ctx.beginPath(); ctx.arc(x + dx, y + 8 + dy * .5, 2, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  }
}
