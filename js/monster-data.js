const MONSTER_STORAGE_KEY = 'tudrc_monsters_v1';
function validMonsterCatalog(list) {
  if (!Array.isArray(list)) return [];
  const ids = new Set();
  return list.filter(monster => {
    if (!monster || !/^[a-z][a-z0-9_]*$/.test(monster.id) || ids.has(monster.id)) return false;
    ids.add(monster.id);
    return true;
  }).map(monster => ({
    id: monster.id,
    name: String(monster.name || monster.id),
    sprite: String(monster.sprite || 'images/monster/Monster_Slime.png'),
    hp: Math.max(1, Number(monster.hp) || 40),
    speed: Math.max(1, Number(monster.speed) || 44),
    playerDamage: Math.max(0, Number(monster.playerDamage) || 0),
    sentryDamage: Math.max(0, Number(monster.sentryDamage) || 0),
    buildingDamage: Math.max(0, Number(monster.buildingDamage) || 0),
    reward: Math.max(0, Number(monster.reward) || 0),
    crystals: Math.max(0, Number(monster.crystals) || 0),
    width: Math.max(8, Number(monster.width) || 42),
    height: Math.max(8, Number(monster.height) || 33),
  }));
}
function monsterCatalog(useBrowserDraft = false) {
  if (useBrowserDraft) {
    try {
      const saved = validMonsterCatalog(JSON.parse(localStorage.getItem(MONSTER_STORAGE_KEY) || 'null'));
      if (saved.length) return saved;
    } catch (_) {}
  }
  return validMonsterCatalog(MONSTERS_DEFAULT);
}
function monsterChoices(map, catalog) {
  const available = new Set(catalog.map(monster => monster.id));
  const mix = Array.isArray(map && map.monsterMix) ? map.monsterMix : [];
  const choices = mix.filter(item => available.has(item.id) && Number(item.weight) > 0)
    .map(item => ({ id: item.id, weight: Number(item.weight) }));
  if (choices.length) return choices;
  const fallback = available.has('slime') ? 'slime' : catalog[0]?.id;
  return fallback ? [{ id: fallback, weight: 1 }] : [];
}
function chooseMonster(map, catalog, random = Math.random()) {
  const choices = monsterChoices(map, catalog);
  let roll = random * choices.reduce((sum, item) => sum + item.weight, 0);
  for (const item of choices) {
    roll -= item.weight;
    if (roll < 0) return catalog.find(monster => monster.id === item.id) || catalog[0];
  }
  return catalog[0];
}
