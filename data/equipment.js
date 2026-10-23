/* 部隊長（溫特）的裝備
   ・背包左邊的「部隊長裝備」可以換裝：頭部、上身各 1 格，下身 2 格，隨身物品 2 格。
     kind（穿在哪裡）：head 頭部裝備（頭盔、帽子類）、body 上身裝備（背心、衣服類）、legs 下身裝備（鞋子類）、acc 隨身物品。
   ・急救包、腎上腺素、杏仁水保溫杯、順順宮平安符已經改成道具（data/supplies.js），不是裝備了。
   ・回基地找諾亞對話 →「🔧 開發工坊」：用異質碎片開發新裝備、把裝備和武器升級（最高 Lv5，見下面的 EQUIP_MAX_LV）。
   ・source：'develop'＝諾亞可以開發；'field'＝只能在戰鬥區域拿到（拿到後可以找諾亞升級），where 是工坊裡「還沒拿到」時顯示的取得方式（整段照寫的顯示，例如「只能在戰鬥區域取得：…」）。
   ・cost：[開發, 升到 Lv2, 升到 Lv3, 升到 Lv4, 升到 Lv5] 要花幾個異質碎片（field 裝備的第一個數字不會用到）。
   ・levels：每一級的效果數值（Lv1～Lv5），意思寫在 stat 的說明裡。Lv4、Lv5 是照 Lv1～Lv3 的趨勢先排的，可以在開發工坊編輯器改。
   ・image：有圖就寫圖片路徑，沒有就用 icon 的表情符號。
   ・ownedDesc：說明（開發工坊下方的說明欄、第一次拿到時的介紹都用這段）。以前分成「還沒拿到時」desc 和「已擁有」兩段，10/22 合併成這一段。 */
// 背包裝備欄中間的溫特立繪：把立繪圖放到 image 這個路徑就會自動顯示（建議直立、背景透明的 PNG，高度 400～800 像素都可以）。
// 還沒有立繪時，先用 fallback（遊戲裡的小人圖）放大代替。
const EQUIP_PORTRAIT = { image: 'images/character/winter_portrait.png', fallback: 'images/character/winter_B/winterB_0000_Front.png' };

const EQUIP_MAX_LV = 5;   // 裝備、武器最高幾級（每件的 levels 要有這麼多筆，cost 也要跟著有）

const EQUIP_SLOTS = [
  { id: 'head', name: '頭部', kinds: ['head'] },
  { id: 'body', name: '上身', kinds: ['body'] },
  { id: 'legs1', name: '下身1', kinds: ['legs'] },
  { id: 'legs2', name: '下身2', kinds: ['legs'] },
  { id: 'acc1', name: '隨身物品1', kinds: ['acc'] },
  { id: 'acc2', name: '隨身物品2', kinds: ['acc'] },
];

const EQUIPMENT = [
  // id 沿用 headlamp（以前叫「頭燈」），舊存檔會直接變成高亮度手電筒
  { id: 'headlamp', name: '高亮度手電筒', kind: 'acc', icon: '🔦', image: 'images/items/flashlight.png', source: 'develop', cost: [60, 120, 200, 290, 390],
    ownedDesc: '朝游標方向照明、耗電後自動換電池。',
    stat: lv => '照明距離 ' + (lv.light / 40).toFixed(1) + ' 格・扇形 ' + lv.spread * 2 + '°・一顆電池撐 ' + lv.battery + ' 秒・黑暗恐懼 −' + Math.round(lv.fear * 100) + '%',
    levels: [{ light: 220, spread: 26, battery: 90, fear: .15 }, { light: 280, spread: 28, battery: 140, fear: .25 }, { light: 340, spread: 36, battery: 200, fear: .35 }, { light: 400, spread: 40, battery: 260, fear: .4 }, { light: 460, spread: 44, battery: 320, fear: .45 }] },
  { id: 'lamphelmet', name: '照明頭盔', kind: 'head', icon: '💡', image: 'images/裝備/lamp-helmet.png', source: 'develop', cost: [50, 100, 180, 270, 370],
    ownedDesc: '持續照亮周圍並減輕黑暗恐懼，無須電池。',
    stat: lv => '照明半徑 ' + (lv.light / 40).toFixed(1) + ' 格・黑暗恐懼 −' + Math.round(lv.fear * 100) + '%',
    levels: [{ light: 70, fear: .08 }, { light: 85, fear: .12 }, { light: 100, fear: .16 }, { light: 115, fear: .2 }, { light: 130, fear: .24 }] },
  { id: 'mask', name: '防毒面具', kind: 'head', icon: '😷', image: 'images/裝備/gas-mask.png', source: 'develop', cost: [60, 120, 200, 290, 390],
    ownedDesc: '減少腐蝕池與酸液傷害。',
    stat: lv => '腐蝕、酸液的傷害 −' + Math.round(lv.filter * 100) + '%', levels: [{ filter: .4 }, { filter: .6 }, { filter: .8 }, { filter: .85 }, { filter: .9 }] },
  { id: 'helmet', name: '防護頭盔', kind: 'head', icon: '🪖', image: 'images/裝備/protective-helmet.png', source: 'develop', cost: [60, 120, 200, 290, 390],
    ownedDesc: '減少受到的傷害。可與防護背心疊加。',
    stat: lv => '受到的傷害 −' + Math.round(lv.guard * 100) + '%', levels: [{ guard: .08 }, { guard: .12 }, { guard: .16 }, { guard: .2 }, { guard: .24 }] },
  { id: 'earmuffs', name: '降噪耳機', kind: 'head', icon: '🎧', image: 'images/裝備/noise-cancelling-earmuffs.png', source: 'develop', cost: [50, 100, 180, 270, 370],
    ownedDesc: '減輕低理智時的視覺與聲音干擾。',
    stat: lv => '理智下降的影響 −' + Math.round(lv.calm * 100) + '%', levels: [{ calm: .3 }, { calm: .5 }, { calm: .7 }, { calm: .78 }, { calm: .85 }] },
  { id: 'vest', name: '防護背心', kind: 'body', icon: '🦺', image: 'images/裝備/protective-vest.png', source: 'develop', cost: [60, 120, 200, 290, 390],
    ownedDesc: '減少受到的傷害。',
    stat: lv => '受到的傷害 −' + Math.round(lv.guard * 100) + '%', levels: [{ guard: .1 }, { guard: .15 }, { guard: .2 }, { guard: .25 }, { guard: .3 }] },
  { id: 'bracelet', name: '共感手環', kind: 'acc', icon: '💠', image: 'images/裝備/empathy-bracelet.png', source: 'develop', cost: [70, 130, 220, 320, 430],
    ownedDesc: '降低疏導消耗的 SP。',
    stat: lv => '疏導花的 SP −' + Math.round(lv.save * 100) + '%', levels: [{ save: .15 }, { save: .25 }, { save: .35 }, { save: .45 }, { save: .55 }] },
  { id: 'sneakers', name: '輕量跑鞋', kind: 'legs', icon: '👟', image: 'images/裝備/lightweight-sneakers.png', source: 'develop', cost: [40, 90, 160, 240, 330],
    ownedDesc: '提高移動速度。',
    stat: lv => '移動速度 +' + Math.round(lv.speed * 100) + '%', levels: [{ speed: .08 }, { speed: .12 }, { speed: .16 }, { speed: .2 }, { speed: .24 }] },
  { id: 'fireboots', name: '防火鞋', kind: 'legs', icon: '🥾', image: 'images/裝備/fire-resistant-boots.png', source: 'develop', cost: [60, 120, 200, 290, 390],
    ownedDesc: '減少火海燙傷，不抵擋爆炸傷害。',
    stat: lv => '火海燙傷 −' + Math.round(lv.fire * 100) + '%', levels: [{ fire: .4 }, { fire: .6 }, { fire: .8 }, { fire: .85 }, { fire: .9 }] },
  { id: 'acidboots', name: '防腐鞋', kind: 'legs', icon: '🥾', image: 'images/裝備/resistant-boots.png', source: 'develop', cost: [60, 120, 200, 290, 390],
    ownedDesc: '減少踩到腐蝕池、酸液的傷害；\n可以跟防毒面具疊加。',
    stat: lv => '腐蝕池、酸液傷害 −' + Math.round(lv.corrode * 100) + '%', levels: [{ corrode: .4 }, { corrode: .6 }, { corrode: .8 }, { corrode: .85 }, { corrode: .9 }] },
  { id: 'radio', name: '無線電', kind: 'acc', icon: '📻', image: 'images/裝備/anomaly-detector.png', source: 'develop', cost: [60, 120, 200, 290, 390],
    ownedDesc: '延長疏導距離；Lv2 加快隊員赴援，Lv3 標記附近暗處敵人。',
    stat: lv => '疏導距離 +' + Math.round(lv.reach * 100) + '%' + (lv.rush ? '・指派時隊員移動 +' + Math.round(lv.rush * 100) + '%' : '') + (lv.mark ? '・標記 ' + lv.mark + ' 格內黑暗中的怪物' : ''),
    levels: [{ reach: .4 }, { reach: .6, rush: .25 }, { reach: .8, rush: .25, mark: 5 }, { reach: 1, rush: .3, mark: 6 }, { reach: 1.2, rush: .35, mark: 7 }] },
  { id: 'detector', name: '異質探測器', kind: 'acc', icon: '📡', image: 'images/裝備/handheld-radio.png', source: 'field', where: '只能在戰鬥區域取得：打碎異質核心時有機會拿到', cost: [0, 120, 200, 290, 390],
    ownedDesc: '顯示附近暗處的異質礦與核心。',
    stat: lv => '偵測範圍 ' + lv.range + ' 格', levels: [{ range: 6 }, { range: 8 }, { range: 10 }, { range: 12 }, { range: 14 }] },
];
// 戰鬥區域掉落的機率（裝備：還沒拿到的時候；拿到之後就不會再掉）
const EQUIP_DROPS = { detector: .5 };
// 後室道具掉落的機率（data/supplies.js 的道具，可以重複拿）：平安符＝順順宮帽、保溫杯＝置物櫃、腎上腺素＝置物櫃（打怪不會掉）、異質急救包＝置物櫃
const ITEM_DROPS = { charm: .35, thermos: .4, adrenaline: .2, 'anomaly-firstaid': .15 };
// 腎上腺素（道具；快捷欄或背包使用）：speed 跑速加成、dur 持續秒數、side 藥效退了變慢幾秒、slow 變慢多少
const ADRENALINE = { speed: .45, dur: 8, side: 2, slow: .3 };
// 急救包（道具，按 H）：heal 治療量、time 處理傷口要站著幾秒、reach 幾格內的隊員
const FIRST_AID = { heal: 30, time: 2.5, reach: 1.8, reviveHp: .3 };   // time：急救要幾秒（進度條跑完才算成功）   // reviveHp：異質急救包救回倒下的隊員時，HP 變成幾成

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
  ['double', '連發機率', '%'],   // 手槍：開一槍時有機率馬上再開一發（快速射擊）
  ['reserve', '持有上限', '發'],
];
const weaponStat = lv => WEAPON_STAT_TERMS.filter(([k]) => typeof lv[k] === 'number' && lv[k] !== 0)
  .map(([k, name, unit]) => name + ' ' + lv[k] + (unit ? ' ' + unit : '')).join('・');

const WEAPON_UPGRADES = {
  pistol: { name: '手槍', icon: '🔫', image: 'images/weapon/winter-handgun-design.png', cost: [80, 160, 250, 350],
    stat: weaponStat,
    levels: [{ dmg: 5, mag: 6, reload: 2 }, { dmg: 6, mag: 8, reload: 1.7 }, { dmg: 8, mag: 10, reload: 1.4, double: 20 }, { dmg: 10, mag: 12, reload: 1.2, double: 35 }, { dmg: 12, mag: 14, reload: 1, double: 50 }] },   // double：連發機率（%，Lv3 起；快速射擊）
  flare: { name: '照明彈槍', icon: '🔥', image: 'images/weapon/winter-flare-gun-design.png', cost: [70, 150, 240, 340],
    stat: weaponStat,
    levels: [{ shine: 24, reserve: 30 }, { shine: 32, reserve: 40 }, { shine: 40, reserve: 50 }, { shine: 48, reserve: 60 }, { shine: 56, reserve: 70 }] },   // shine：照明彈落地後亮幾秒（只照明，不會燒傷）；reserve：持有上限
  // 下面兩把只能在後室（戰鬥區域）撿到（field），撿到後才能升級；彈藥以後在後室的商店、轉蛋機取得（js/special-guns.js）
  // 燃燒彈槍：r 火海半徑（格）、burn 火海燒幾秒、reload 每發裝填秒數、reserve 持有上限（備用彈最多帶幾發）、ignite 被燒到的怪物身上著火幾秒（Lv3 起）
  incendiary: { name: '燃燒彈槍', icon: '🧨', image: 'images/weapon/incendiary_launcher.png', field: true, where: '只能在戰鬥區域取得：有機會在上鎖的置物箱裡找到', cost: [100, 180, 270, 370],
    ownedDesc: '落地形成火海，可點燃油桶、油汙並焚毀怪物「生命體」；也會傷及友軍。',
    stat: weaponStat,
    levels: [{ r: 1.1, burn: 6, reload: 2.2, reserve: 6 }, { r: 1.4, burn: 7, reload: 1.9, reserve: 8 }, { r: 1.6, burn: 9, reload: 1.6, reserve: 10, ignite: 4 }, { r: 1.8, burn: 10, reload: 1.4, reserve: 12, ignite: 5 }, { r: 2, burn: 12, reload: 1.2, reserve: 14, ignite: 6 }] },
  // 麻醉槍：sleep 睡幾秒、mag 彈匣、reload 裝填秒數、reserve 持有上限（備用彈最多帶幾發）、mist 麻醉霧半徑（格，Lv3 起）
  tranq: { name: '麻醉槍', icon: '💤', image: 'images/weapon/tranquilizer_gun.png', field: true, where: '只能在戰鬥區域取得：有機會在上鎖的置物箱裡找到', cost: [100, 180, 270, 370],
    ownedDesc: '使怪物睡眠或使暴走隊員冷靜下來；\n大型怪物效果較短，對怪物「生命體」無效。',
    stat: weaponStat,
    levels: [{ sleep: 3, mag: 2, reload: 2, reserve: 8 }, { sleep: 4, mag: 2, reload: 1.5, reserve: 10 }, { sleep: 5, mag: 3, reload: 1.5, reserve: 12, mist: 1.2 }, { sleep: 6, mag: 3, reload: 1.3, reserve: 14, mist: 1.4 }, { sleep: 7, mag: 4, reload: 1.1, reserve: 16, mist: 1.6 }] },
};
// ===== 手槍的子彈：溫特從頭到尾只有一把手槍，差別只在子彈（滾輪換子彈，js/flare.js）=====
// 一般子彈無限（彈匣、裝填、傷害看手槍等級）；特殊子彈有數量，打完會停在空的（扣扳機只會「喀」一聲），要自己滾回別的子彈。
// 特殊子彈的效果固定、不會升級（只有手槍能找諾亞升級）。上面照明彈槍、燃燒彈槍、麻醉槍的等級表已經不用了。
// 要先裝進彈匣（背包「武器」分頁）才換得到（js/magazine.js；只有一般子彈不佔彈匣）。
// image：子彈的圖（images/weapon/bullet/，統一 48×16）；max：最多帶幾發；gap：兩發至少隔幾秒；color：右下角、切換時的顏色
// source：怎麼拿到——develop＝諾亞的開發工坊開發（cost 碎片，每次出勤自動補滿）；field＝只能在後室（戰鬥區域）的置物櫃找到（打完就沒了）；supply＝補給箱、彈藥箱補
const BULLETS = {
  pistol:     { name: '一般子彈', icon: '•', image: 'images/weapon/bullet/Ordinarybullets.png', color: '#ffe79a' },
  flare:      { name: '照明彈', icon: '🔥', image: 'images/weapon/bullet/Flare.png', color: '#ff8a5c', max: 30, gap: .8, shine: 24, source: 'supply',   // shine：落地後亮幾秒
    desc: '打出去落地後燃燒、照亮周圍一大片；照亮的地方隊員看得到怪物、也能蓋建築。打完可以到地圖上的彈藥箱補滿。' },
  incendiary: { name: '燃燒彈', icon: '🧨', image: 'images/weapon/bullet/Incendiary bomb.png', color: '#ff9a3c', max: 8, gap: .6, r: 1.1, burn: 6, ignite: 0, source: 'field',   // r：火海半徑（格）、burn：火海燒幾秒、ignite：被炸到的怪物身上著火幾秒（0＝不著火）
    desc: '拋物線飛過怪物頭上，落地燒出一片火海；會點燃油桶、油汙，燒掉怪物「生命體」碎掉的那堆。火海敵我都會燙。' },
  tranq:      { name: '麻醉彈', icon: '💤', image: 'images/weapon/bullet/tranquilizerdarts.png', color: '#b9a7ff', max: 10, gap: .35, sleep: 3, mist: 0, source: 'develop', cost: 120,   // sleep：睡幾秒（大型怪物一半）、mist：麻醉霧半徑（格，0＝沒有）
    desc: '打中的怪物睡著（不動、不攻擊）；打中暴走的隊員會睡一下，醒來恢復正常。對怪物「生命體」沒有效果。' },
  paint:      { name: '螢光漆彈', icon: '🎨', image: 'images/weapon/bullet/Paintball.png', color: '#ff5fd6', max: 12, gap: .3, source: 'develop', cost: 100,
    desc: '打中的怪物沾上螢光漆：隊員會優先集火牠，躲進黑暗也看得到。同時只能標一隻，打新的舊的就消失；怪物死掉漆就跟著消失。' },
  split:      { name: '分裂彈', icon: '✳️', image: 'images/weapon/bullet/SplitBullet.png', color: '#9fe3ff', max: 20, gap: .5, pellets: 5, spread: .55, dmg: 4, range: 5, source: 'develop', cost: 150,   // pellets：一次幾顆、spread：扇形角度（弧度）、dmg：每顆傷害、range：射程（格）
    desc: '一次扇形噴出好幾顆小子彈，近距離打一整群小怪。距離越遠越散。' },
  flash:      { name: '閃光彈', icon: '💥', image: 'images/weapon/bullet/Flashbang.png', color: '#fff6a8', max: 6, gap: .7, r: 2.4, stun: 2.5, range: 8, source: 'field',   // r：閃光半徑（格）、stun：暈幾秒、range：最遠丟幾格
    desc: '丟出去爆出強光，範圍內的怪物暈眩幾秒。範圍內的隊員也會被閃到、暈一下。對怪物「生命體」沒有效果。' },
  shock:      { name: '雷電彈', icon: '⚡', image: 'images/weapon/bullet/ElectronBomb.png', color: '#8fd8ff', max: 8, gap: .5, dmg: 10, chain: 3, chainR: 3, stun: 1.2, source: 'field',   // dmg：傷害、chain：最多再跳幾隻、chainR：跳躍距離（格）、stun：麻痺幾秒
    desc: '打中的怪物觸電受傷、短暫麻痺，電流再跳到附近幾隻怪物。旁邊有隊員也會被電到。' },
  heal:       { name: '治療彈', icon: '💚', image: 'images/weapon/bullet/TreatmentBullet.png', color: '#7ee0a0', max: 5, gap: .8, heal: 40, source: 'field',   // heal：補多少 HP
    desc: '打中誰就補誰的 HP：瞄準隊員可以幫他補血；打歪打到怪物，也會幫怪物補血。' },
};
// 在置物箱裡找到特殊子彈（只有後室才找得到的 field 子彈）：ammo 找到子彈的機率；kinds 會找到哪幾種；ammoFind 一次給幾發；start 第一次拿到（設定好的置物櫃）給幾發
const GUN_FINDS = { ammo: .5, kinds: ['incendiary', 'flash', 'shock', 'heal'],
  ammoFind: { incendiary: 2, flash: 2, shock: 2, heal: 1, tranq: 3, paint: 4 },
  start: { incendiary: 3, flash: 3, shock: 4, heal: 2, tranq: 5, paint: 6 } };
// ===== 彈匣（js/magazine.js）：在背包「武器」分頁把子彈拖進彈匣格，戰鬥中滾輪只換得到彈匣裡的 =====
// free：不佔彈匣、一定帶著；slots[等級-1]＝彈匣裝得下幾種；cost[i]＝從第 i+1 級升到下一級花幾個異質碎片（開發工坊）
const MAGAZINE = { free: ['pistol'], slots: [2, 3, 4, 5], cost: [150, 250, 380], name: '彈匣', icon: '🧰' };
