/* ===== 特殊子彈的數值（由「🔫 彈藥編輯器」存出來）=====
   遊戲和彈藥編輯器都讀這一份；子彈的名字、圖、說明、一組幾發還是在 data/equipment.js 的 BULLETS。
   遊戲載入時，下面 bullets 裡每種子彈的數字會蓋進 BULLETS（data/equipment.js 最後面）。
   foeMul：打「怪物」時，傷害、睡／暈／麻痺／混亂秒數、擊退距離、黏膠減速都乘上這個數（打到溫特、隊員照原本的數字）
   bigHp：血量多少以上算大型怪物（麻醉、閃光、混亂、撞牆暈的秒數減半）
   整段貼回 data/bullet-tuning.js 覆蓋即可。 */
const BULLET_TUNING = {
  "foeMul": 2,
  "bigHp": 150,
  "bullets": {
    "flare": { "gap": 0.8, "shine": 24 },
    "incendiary": { "gap": 0.6, "range": 8, "r": 1.1, "burn": 6, "fireDps": 10, "ignite": 0, "burnDmg": 4 },
    "tranq": { "gap": 0.35, "range": 9, "sleep": 3, "mist": 0 },
    "paint": { "gap": 0.3 },
    "split": { "gap": 0.5, "pellets": 8, "spread": 0.7, "dmg": 4, "range": 5, "near": 1, "farMul": 0.4 },
    "flash": { "gap": 0.7, "r": 2.4, "stun": 2.5, "range": 8 },
    "shock": { "gap": 0.5, "dmg": 10, "chain": 3, "chainR": 3, "stun": 1.2 },
    "heal": { "gap": 0.8, "heal": 40 },
    "sticky": { "gap": 0.6, "r": 1.3, "stick": 30, "slow": 0.2, "range": 8, "speed": 700 },
    "knock": { "gap": 0.5, "dmg": 6, "push": 2.2, "slide": 0.2, "wallStun": 1.8, "wallDmg": 8, "range": 9 },
    "confuse": { "gap": 0.5, "confuse": 6, "brawl": 3, "range": 9 }
  }
};
