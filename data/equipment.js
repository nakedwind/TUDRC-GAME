/* 部隊長（溫特）的裝備
   ・背包左邊的「部隊長裝備」可以換裝：頭部、身體各 1 格，隨身物品 2 格。
   ・急救包、腎上腺素、杏仁水保溫杯、順順宮平安符已經改成道具（data/supplies.js），不是裝備了。
   ・回基地找諾亞對話 →「🔧 開發工坊」：用異質碎片開發新裝備、把裝備和武器升級（最高 Lv5，見下面的 EQUIP_MAX_LV）。
   ・source：'develop'＝諾亞可以開發；'field'＝只能在戰鬥區域拿到（拿到後可以找諾亞升級），where 是工坊裡「還沒拿到」時顯示的取得方式（整段照寫的顯示，例如「只能在戰鬥區域取得：…」）。
   ・cost：[開發, 升到 Lv2, 升到 Lv3, 升到 Lv4, 升到 Lv5] 要花幾個異質碎片（field 裝備的第一個數字不會用到）。
   ・levels：每一級的效果數值（Lv1～Lv5），意思寫在 stat 的說明裡。Lv4、Lv5 是照 Lv1～Lv3 的趨勢先排的，可以在開發工坊編輯器改。
   ・image：有圖就寫圖片路徑，沒有就用 icon 的表情符號。 */
// 背包裝備欄中間的溫特立繪：把立繪圖放到 image 這個路徑就會自動顯示（建議直立、背景透明的 PNG，高度 400～800 像素都可以）。
// 還沒有立繪時，先用 fallback（遊戲裡的小人圖）放大代替。
const EQUIP_PORTRAIT = { image: 'images/character/winter_portrait.png', fallback: 'images/character/winter_B/winterB_0000_Front.png' };

const EQUIP_MAX_LV = 5;   // 裝備、武器最高幾級（每件的 levels 要有這麼多筆，cost 也要跟著有）

const EQUIP_SLOTS = [
  { id: 'head', name: '頭部', kinds: ['head'] },
  { id: 'body', name: '身體', kinds: ['body'] },
  { id: 'acc1', name: '隨身物品1', kinds: ['acc'] },
  { id: 'acc2', name: '隨身物品2', kinds: ['acc'] },
];

const EQUIPMENT = [
  // id 沿用 headlamp（以前叫「頭燈」），舊存檔會直接變成高亮度手電筒
  { id: 'headlamp', name: '高亮度手電筒', kind: 'acc', icon: '🔦', image: 'images/items/flashlight.png', source: 'develop', cost: [60, 120, 200, 290, 390],
    desc: '朝游標方向照明並減輕黑暗恐懼；耗電後自動換電池，Lv3 光束加寬。',
    stat: lv => '照明距離 ' + (lv.light / 40).toFixed(1) + ' 格・扇形 ' + lv.spread * 2 + '°・一顆電池撐 ' + lv.battery + ' 秒・黑暗恐懼 −' + Math.round(lv.fear * 100) + '%',
    levels: [{ light: 220, spread: 26, battery: 90, fear: .15 }, { light: 280, spread: 28, battery: 140, fear: .25 }, { light: 340, spread: 36, battery: 200, fear: .35 }, { light: 400, spread: 40, battery: 260, fear: .4 }, { light: 460, spread: 44, battery: 320, fear: .45 }] },
  { id: 'lamphelmet', name: '照明頭盔', kind: 'head', icon: '💡', image: 'images/裝備/lamp-helmet.png', source: 'develop', cost: [50, 100, 180, 270, 370],
    desc: '持續照亮周圍並減輕黑暗恐懼，無須電池。',
    stat: lv => '照明半徑 ' + (lv.light / 40).toFixed(1) + ' 格・黑暗恐懼 −' + Math.round(lv.fear * 100) + '%',
    levels: [{ light: 70, fear: .08 }, { light: 85, fear: .12 }, { light: 100, fear: .16 }, { light: 115, fear: .2 }, { light: 130, fear: .24 }] },
  { id: 'mask', name: '防毒面具', kind: 'head', icon: '😷', image: 'images/裝備/gas-mask.png', source: 'develop', cost: [60, 120, 200, 290, 390],
    desc: '減少腐蝕池與酸液傷害。',
    stat: lv => '腐蝕、酸液的傷害 −' + Math.round(lv.filter * 100) + '%', levels: [{ filter: .4 }, { filter: .6 }, { filter: .8 }, { filter: .85 }, { filter: .9 }] },
  { id: 'helmet', name: '防護頭盔', kind: 'head', icon: '🪖', image: 'images/裝備/protective-helmet.png', source: 'develop', cost: [60, 120, 200, 290, 390],
    desc: '減少受傷，可與防護背心疊加。',
    stat: lv => '受到的傷害 −' + Math.round(lv.guard * 100) + '%', levels: [{ guard: .08 }, { guard: .12 }, { guard: .16 }, { guard: .2 }, { guard: .24 }] },
  { id: 'earmuffs', name: '降噪耳機', kind: 'head', icon: '🎧', image: 'images/裝備/noise-cancelling-earmuffs.png', source: 'develop', cost: [50, 100, 180, 270, 370],
    desc: '減輕低理智時的視覺與聲音干擾。',
    stat: lv => '理智下降的影響 −' + Math.round(lv.calm * 100) + '%', levels: [{ calm: .3 }, { calm: .5 }, { calm: .7 }, { calm: .78 }, { calm: .85 }] },
  { id: 'vest', name: '防護背心', kind: 'body', icon: '🦺', image: 'images/裝備/protective-vest.png', source: 'develop', cost: [60, 120, 200, 290, 390],
    desc: '減少受到的傷害。',
    stat: lv => '受到的傷害 −' + Math.round(lv.guard * 100) + '%', levels: [{ guard: .1 }, { guard: .15 }, { guard: .2 }, { guard: .25 }, { guard: .3 }] },
  { id: 'bracelet', name: '共感手環', kind: 'acc', icon: '💠', image: 'images/裝備/empathy-bracelet.png', source: 'develop', cost: [70, 130, 220, 320, 430],
    desc: '降低疏導消耗的 SP。',
    stat: lv => '疏導花的 SP −' + Math.round(lv.save * 100) + '%', levels: [{ save: .15 }, { save: .25 }, { save: .35 }, { save: .45 }, { save: .55 }] },
  { id: 'sneakers', name: '輕量跑鞋', kind: 'acc', icon: '👟', image: 'images/裝備/lightweight-sneakers.png', source: 'develop', cost: [40, 90, 160, 240, 330],
    desc: '提高移動速度。',
    stat: lv => '移動速度 +' + Math.round(lv.speed * 100) + '%', levels: [{ speed: .08 }, { speed: .12 }, { speed: .16 }, { speed: .2 }, { speed: .24 }] },
  { id: 'fireboots', name: '防火鞋', kind: 'acc', icon: '🥾', image: 'images/裝備/fire-resistant-boots.png', source: 'develop', cost: [60, 120, 200, 290, 390],
    desc: '減少火海燙傷，不抵擋爆炸傷害。',
    stat: lv => '火海燙傷 −' + Math.round(lv.fire * 100) + '%', levels: [{ fire: .4 }, { fire: .6 }, { fire: .8 }, { fire: .85 }, { fire: .9 }] },
  { id: 'acidboots', name: '防腐鞋', kind: 'acc', icon: '🥾', image: 'images/裝備/resistant-boots.png', source: 'develop', cost: [60, 120, 200, 290, 390],
    desc: '減少踩到腐蝕池、酸液的傷害；可以跟防毒面具疊加。',
    stat: lv => '腐蝕池、酸液傷害 −' + Math.round(lv.corrode * 100) + '%', levels: [{ corrode: .4 }, { corrode: .6 }, { corrode: .8 }, { corrode: .85 }, { corrode: .9 }] },
  { id: 'radio', name: '無線電', kind: 'acc', icon: '📻', image: 'images/裝備/anomaly-detector.png', source: 'develop', cost: [60, 120, 200, 290, 390],
    desc: '延長疏導距離；Lv2 加快隊員赴援，Lv3 標記附近暗處敵人。',
    stat: lv => '疏導距離 +' + Math.round(lv.reach * 100) + '%' + (lv.rush ? '・指派時隊員移動 +' + Math.round(lv.rush * 100) + '%' : '') + (lv.mark ? '・標記 ' + lv.mark + ' 格內黑暗中的怪物' : ''),
    levels: [{ reach: .4 }, { reach: .6, rush: .25 }, { reach: .8, rush: .25, mark: 5 }, { reach: 1, rush: .3, mark: 6 }, { reach: 1.2, rush: .35, mark: 7 }] },
  { id: 'detector', name: '異質探測器', kind: 'acc', icon: '📡', image: 'images/裝備/handheld-radio.png', source: 'field', where: '只能在戰鬥區域取得：打碎異質核心時有機會拿到', cost: [0, 120, 200, 290, 390],
    desc: '顯示附近暗處的異質礦與核心。',
    stat: lv => '偵測範圍 ' + lv.range + ' 格', levels: [{ range: 6 }, { range: 8 }, { range: 10 }, { range: 12 }, { range: 14 }] },
];
// 戰鬥區域掉落的機率（裝備：還沒拿到的時候；拿到之後就不會再掉）
const EQUIP_DROPS = { detector: .5 };
// 後室道具掉落的機率（data/supplies.js 的道具，可以重複拿）：平安符＝順順宮帽、保溫杯＝置物櫃、腎上腺素＝鳥頭人
const ITEM_DROPS = { charm: .35, thermos: .4, adrenaline: .2 };
// 腎上腺素（道具，按 J）：speed 跑速加成、dur 持續秒數、side 藥效退了變慢幾秒、slow 變慢多少
const ADRENALINE = { speed: .45, dur: 8, side: 2, slow: .3 };
// 急救包（道具，按 H）：heal 治療量、time 處理傷口要站著幾秒、reach 幾格內的隊員
const FIRST_AID = { heal: 60, time: 1.2, reach: 1.8 };

// 武器升級（找諾亞）：Lv1 是原本的樣子；cost：[升到 Lv2, 升到 Lv3, 升到 Lv4, 升到 Lv5]
// 測試用：true＝所有槍都解鎖，每次開遊戲彈藥補滿（測完改成 false）
const TEST_UNLOCK_ALL_GUNS = !!window.TEST_MODE;

// 武器的效果說明：每一把都照同一個順序排（有這個數值、而且不是 0 才顯示），持有上限永遠在最後：
//   傷害＝照明＝燃燒 ＞ 彈匣 ＞ 睡眠＝火海半徑＝怪物著火＝麻醉霧半徑 ＞ 裝填 ＞ 持有上限
// 開發工坊編輯器的數值表也照這個順序排。[數值名, 說明裡的名稱, 單位]
const WEAPON_STAT_TERMS = [
  ['dmg', '傷害', ''], ['shine', '照明', '秒'], ['burn', '燃燒', '秒'],
  ['mag', '彈匣', '發'],
  ['sleep', '睡眠', '秒'], ['r', '火海半徑', '格'], ['ignite', '怪物著火', '秒'], ['mist', '麻醉霧半徑', '格'],
  ['reload', '裝填', '秒'],
  ['reserve', '持有上限', '發'],
];
const weaponStat = lv => WEAPON_STAT_TERMS.filter(([k]) => typeof lv[k] === 'number' && lv[k] !== 0)
  .map(([k, name, unit]) => name + ' ' + lv[k] + (unit ? ' ' + unit : '')).join('・');

const WEAPON_UPGRADES = {
  pistol: { name: '手槍', icon: '🔫', image: 'images/weapon/winter-handgun-design.png', cost: [80, 160, 250, 350],
    stat: weaponStat,
    levels: [{ dmg: 5, mag: 6, reload: 2 }, { dmg: 6, mag: 8, reload: 1.7 }, { dmg: 8, mag: 10, reload: 1.4 }, { dmg: 10, mag: 12, reload: 1.2 }, { dmg: 12, mag: 14, reload: 1 }] },
  flare: { name: '照明彈槍', icon: '🔥', image: 'images/weapon/winter-flare-gun-design.png', cost: [70, 150, 240, 340],
    stat: weaponStat,
    levels: [{ shine: 24, reserve: 30 }, { shine: 32, reserve: 40 }, { shine: 40, reserve: 50 }, { shine: 48, reserve: 60 }, { shine: 56, reserve: 70 }] },   // shine：照明彈落地後亮幾秒（只照明，不會燒傷）；reserve：持有上限
  // 下面兩把只能在後室（戰鬥區域）撿到（field），撿到後才能升級；彈藥以後在後室的商店、轉蛋機取得（js/special-guns.js）
  // 燃燒彈槍：r 火海半徑（格）、burn 火海燒幾秒、reload 每發裝填秒數、reserve 持有上限（備用彈最多帶幾發）、ignite 被燒到的怪物身上著火幾秒（Lv3 起）
  incendiary: { name: '燃燒彈槍', icon: '🧨', image: 'images/weapon/incendiary_launcher.png', field: true, where: '只能在戰鬥區域取得：有機會在上鎖的置物箱裡找到', cost: [100, 180, 270, 370],
    desc: '落地形成火海，可點燃油汙、油桶並焚毀生命體；也會傷及友軍。',
    stat: weaponStat,
    levels: [{ r: 1.1, burn: 6, reload: 2.2, reserve: 6 }, { r: 1.4, burn: 7, reload: 1.9, reserve: 8 }, { r: 1.6, burn: 9, reload: 1.6, reserve: 10, ignite: 4 }, { r: 1.8, burn: 10, reload: 1.4, reserve: 12, ignite: 5 }, { r: 2, burn: 12, reload: 1.2, reserve: 14, ignite: 6 }] },
  // 麻醉槍：sleep 睡幾秒、mag 彈匣、reload 裝填秒數、reserve 持有上限（備用彈最多帶幾發）、mist 麻醉霧半徑（格，Lv3 起）
  tranq: { name: '麻醉槍', icon: '💤', image: 'images/weapon/tranquilizer_gun.png', field: true, where: '只能在戰鬥區域取得：有機會在上鎖的置物箱裡找到', cost: [100, 180, 270, 370],
    desc: '使怪物睡眠，或讓暴走隊員恢復正常；大型怪物效果較短，生命體無效。',
    stat: weaponStat,
    levels: [{ sleep: 3, mag: 2, reload: 2, reserve: 8 }, { sleep: 4, mag: 2, reload: 1.5, reserve: 10 }, { sleep: 5, mag: 3, reload: 1.5, reserve: 12, mist: 1.2 }, { sleep: 6, mag: 3, reload: 1.3, reserve: 14, mist: 1.4 }, { sleep: 7, mag: 4, reload: 1.1, reserve: 16, mist: 1.6 }] },
};
// 在置物箱裡找到槍、彈藥：gun 還沒有的槍出現的機率；ammo 已經有槍時找到彈藥的機率（商店、轉蛋機做好之前的暫時來源）
// start：撿到槍時附的彈藥（mag 裝在槍裡、reserve 備用）；ammoFind：找到彈藥時給幾發
const GUN_FINDS = { gun: .35, ammo: .5,
  start: { incendiary: { mag: 1, reserve: 3 }, tranq: { mag: 2, reserve: 4 } },
  ammoFind: { incendiary: 2, tranq: 3 } };
