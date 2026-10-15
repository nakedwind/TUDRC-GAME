/* 部隊長（溫特）的裝備
   ・背包左邊的「部隊長裝備」可以換裝：頭部、身體各 1 格，飾品 2 格。
   ・回基地找諾亞對話 →「🔧 開發工坊」：用異質碎片開發新裝備、把裝備和武器升級（最高 Lv3）。
   ・source：'develop'＝諾亞可以開發；'field'＝只能在戰鬥區域拿到（拿到後可以找諾亞升級），where 寫在哪裡拿到。
   ・cost：[開發, 升到 Lv2, 升到 Lv3] 要花幾個異質碎片（field 裝備的第一個數字不會用到）。
   ・levels：每一級的效果數值（Lv1、Lv2、Lv3），意思寫在 stat 的說明裡。
   ・image：有圖就寫圖片路徑，沒有就用 icon 的表情符號。 */
// 背包裝備欄中間的溫特立繪：把立繪圖放到 image 這個路徑就會自動顯示（建議直立、背景透明的 PNG，高度 400～800 像素都可以）。
// 還沒有立繪時，先用 fallback（遊戲裡的小人圖）放大代替。
const EQUIP_PORTRAIT = { image: 'images/character/winter_portrait.png', fallback: 'images/character/winter_B/winterB_0000_Front.png' };

const EQUIP_SLOTS = [
  { id: 'head', name: '頭部', kinds: ['head'] },
  { id: 'body', name: '身體', kinds: ['body'] },
  { id: 'acc1', name: '飾品', kinds: ['acc'] },
  { id: 'acc2', name: '飾品', kinds: ['acc'] },
];

const EQUIPMENT = [
  { id: 'headlamp', name: '頭燈', kind: 'head', icon: '🔦', image: 'images/items/flashlight.png', source: 'develop', cost: [60, 120, 200],
    desc: '戴在頭上的照明燈，溫特身邊會亮一圈（只有戰鬥區域會用到）。用電池供電，沒電時會自動換上背包裡的電池。',
    stat: lv => '照明半徑 ' + lv.light + '・一顆電池撐 ' + lv.battery + ' 秒', levels: [{ light: 110, battery: 90 }, { light: 140, battery: 130 }, { light: 170, battery: 180 }] },
  { id: 'earmuffs', name: '降噪耳機', kind: 'head', icon: '🎧', source: 'develop', cost: [50, 100, 180],
    desc: '把雜音隔開，理智下降時比較不會受影響：畫面沒那麼灰、搖晃和殘影變輕，心跳和怪聲也變小。',
    stat: lv => '理智下降的影響 −' + Math.round(lv.calm * 100) + '%', levels: [{ calm: .3 }, { calm: .5 }, { calm: .7 }] },
  { id: 'vest', name: '防護背心', kind: 'body', icon: '🦺', source: 'develop', cost: [60, 120, 200],
    desc: '應變中心配發的防護背心，受到的傷害會減少。',
    stat: lv => '受到的傷害 −' + Math.round(lv.guard * 100) + '%', levels: [{ guard: .1 }, { guard: .15 }, { guard: .2 }] },
  { id: 'bracelet', name: '共感手環', kind: 'acc', icon: '💠', source: 'develop', cost: [70, 130, 220],
    desc: '幫助嚮導穩定共感的手環，疏導哨兵時花的 SP 變少。',
    stat: lv => '疏導花的 SP −' + Math.round(lv.save * 100) + '%', levels: [{ save: .15 }, { save: .25 }, { save: .35 }] },
  { id: 'thermos', name: '杏仁水保溫瓶', kind: 'acc', icon: '🧴', source: 'develop', cost: [40, 90, 160],
    desc: '杏仁水裝在保溫瓶裡，喝起來特別安心，恢復的 SP 變多。',
    stat: lv => '杏仁水恢復的 SP +' + Math.round(lv.bonus * 100) + '%', levels: [{ bonus: .2 }, { bonus: .35 }, { bonus: .5 }] },
  { id: 'sneakers', name: '輕量跑鞋', kind: 'acc', icon: '👟', source: 'develop', cost: [40, 90, 160],
    desc: '鞋底很輕，跑起來比較快。',
    stat: lv => '移動速度 +' + Math.round(lv.speed * 100) + '%', levels: [{ speed: .08 }, { speed: .12 }, { speed: .16 }] },
  { id: 'charm', name: '順順宮御守', kind: 'acc', icon: '🧧', source: 'field', where: '偶爾從順順宮帽裡掉出來', cost: [0, 120, 200],
    desc: '順順宮的平安御守。帶在身上，黑暗裡的 Smiler 比較不容易咬到溫特。',
    stat: lv => '在黑暗中被 Smiler 咬的機率 −' + Math.round(lv.ward * 100) + '%', levels: [{ ward: .4 }, { ward: .55 }, { ward: .7 }] },
  { id: 'detector', name: '異質探測器', kind: 'acc', icon: '📡', source: 'field', where: '打碎異質核心時有機會拿到', cost: [0, 120, 200],
    desc: '偵測異質反應的小儀器。附近黑暗中的異質礦、異質核心會微微發光，讓你知道在哪裡。',
    stat: lv => '偵測範圍 ' + lv.range + ' 格', levels: [{ range: 6 }, { range: 8 }, { range: 10 }] },
];
// 戰鬥區域掉落的機率（還沒拿到的時候；拿到之後就不會再掉）
const EQUIP_DROPS = { charm: .35, detector: .5 };

// 武器升級（找諾亞）：Lv1 是原本的樣子；cost：[升到 Lv2, 升到 Lv3]
const WEAPON_UPGRADES = {
  pistol: { name: '手槍', icon: '🔫', image: 'images/weapon/winter-handgun-design.png', cost: [80, 160],
    stat: lv => '傷害 ' + lv.dmg + '・彈匣 ' + lv.mag + ' 發・裝填 ' + lv.reload + ' 秒',
    levels: [{ dmg: 5, mag: 6, reload: 2 }, { dmg: 6, mag: 8, reload: 1.7 }, { dmg: 8, mag: 10, reload: 1.4 }] },
  flare: { name: '照明彈槍', icon: '🔥', image: 'images/weapon/winter-flare-gun-design.png', cost: [70, 150],
    stat: lv => '燃燒 ' + lv.burn + ' 秒・備用彈最多 ' + lv.reserve + ' 發',
    levels: [{ burn: 12, reserve: 30 }, { burn: 16, reserve: 40 }, { burn: 20, reserve: 50 }] },
};
