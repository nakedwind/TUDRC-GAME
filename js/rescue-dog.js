/* Search locally, walk to each pickup, then resume following the handler. */
const DOG_PICKUP = { searchCells: 6, leashCells: 8, reach: 30, speed: 110, interval: .65, scanInterval: .4, timeout: 8 };

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
  for (const prop of storagePropEntries()) if (isPickupProp(prop)) candidates.push({ kind: 'prop', prop });
  const nearby = candidates.filter(target => {
    const pos = dogPickupPosition(target);
    const ignored = (dog.pickupIgnored || []).some(entry => entry.key === (target.shard || target.prop.drop || target.prop.token));
    return !ignored && isLit(pos.x, pos.y) && Math.hypot(pos.x - dog.x, pos.y - dog.y) <= DOG_PICKUP.searchCells * CELL
      && Math.hypot(pos.x - anchor.x, pos.y - anchor.y) <= DOG_PICKUP.leashCells * CELL;
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
  if (Math.hypot(dog.x - anchor.x, dog.y - anchor.y) > DOG_PICKUP.leashCells * CELL) {
    if (dog.pickupTarget) clearDogPickup(dog);
    return false;
  }
  if (dog.pickupCooldown > 0) return false;
  let target = dog.pickupTarget;
  if (target) {
    const pos = dogPickupPosition(target);
    target.age += dt;
    if (!dogPickupTargetExists(target) || !isLit(pos.x, pos.y) || target.age > DOG_PICKUP.timeout
        || Math.hypot(pos.x - anchor.x, pos.y - anchor.y) > DOG_PICKUP.leashCells * CELL) {
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
    const picked = target.kind === 'shard' ? pickShard(target.shard, dog, DOG_PICKUP.reach) : pickupStorageProp(target.prop);
    if (!picked) ignoreDogPickup(dog, target);   // 撿不起來（例如溫特已達持有上限）：先不要再去撿這個
    clearDogPickup(dog);
    if (picked) dog.pickupCooldown = DOG_PICKUP.interval;
    return true;
  }
  moveSentryWithPath(dog, target.approach.x, target.approach.y, DOG_PICKUP.speed, dt);
  if (dog.navFailed) { ignoreDogPickup(dog, target); clearDogPickup(dog); return false; }
  return true;
}
