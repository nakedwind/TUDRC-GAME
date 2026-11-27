/* 獎勵設定（由「🏅 獎勵編輯器」匯出）：經費＝錢（$）、碎片＝異質碎片。0＝不給。
   ・bosses：BOSS 特別獎金。在任務地圖討伐後，回應變中心由通訊員報告並入帳（每次討伐都給，重新出擊再打倒可以再領；js/missions.js）
       flag＝怪物身上用來認出這隻 BOSS 的標記（程式用，不要改）；台詞在對話編輯器「報告任務」的 bounty_id（{money}＝經費、{crystals}＝碎片）
   ・zones：區域控制獎勵。每次控制都給（打贏結算畫面；新手區看完救援劇情那次也算），重新出擊再清一次可以再領，經費加進這次的作戰經費、回基地存進錢包
   ・allZones：全區控制獎勵。作戰桌上所有區域都控制了，再多給一次（只給一次）
   ・entryFunds：第一次進入的作戰經費（地圖 id → 經費）。每張戰鬥地圖第一次進去時撥一次（js/maploader.js 讀；沒寫的地圖才用地圖編輯器「規則」裡舊的經費） */
const REWARDS_DATA = {
  "bosses": [
    { "id": "bird", "name": "鳥頭大隊長", "flag": "elite", "money": 2000, "crystals": 0 },
    { "id": "capKing", "name": "順順宮主", "flag": "capKingLord", "money": 3000, "crystals": 0 },
    { "id": "pearl", "name": "珍珠大童", "flag": "pearlBoss", "money": 3000, "crystals": 0 },
    { "id": "loofahQueen", "name": "絲瓜女王", "flag": "loofahQueen", "money": 4000, "crystals": 0 },
    { "id": "bananaEmperor", "name": "金蕉皇帝", "flag": "bananaEmperor", "money": 4000, "crystals": 0 },
    { "id": "gourdKing", "name": "葫蘆猴王", "flag": "gourdKing", "money": 5000, "crystals": 0 },
    { "id": "mothBoss", "name": "人面蝶后", "flag": "mothBoss", "money": 5000, "crystals": 0 },
    { "id": "milkfishKing", "name": "虱目魚王", "flag": "milkfishKing", "money": 5000, "crystals": 0 },
    { "id": "ratKing", "name": "花蓮老鼠王", "flag": "ratKing", "money": 5000, "crystals": 0 },
    { "id": "poolBoss", "name": "巨大比基尼小丑魚", "flag": "poolBoss", "money": 4000, "crystals": 0 },
    { "id": "fishKing", "name": "魚頭王", "flag": "fishKing", "money": 0, "crystals": 0 }
  ],
  "zones": {
    "y25_entry": {
      "money": 300,
      "crystals": 100
    },
    "y1": {
      "money": 500,
      "crystals": 200
    },
    "k56": {
      "money": 1000,
      "crystals": 300
    },
    "f307": {
      "money": 2000,
      "crystals": 400
    },
    "r89": {
      "money": 2000,
      "crystals": 400
    },
    "pool": {
      "money": 2000,
      "crystals": 400
    },
    "b56": {
      "money": 1000,
      "crystals": 300
    },
    "g11": {
      "money": 1000,
      "crystals": 300
    },
    "o666": {
      "money": 1000,
      "crystals": 300
    }
  },
  "entryFunds": {
    "y1": 5000,
    "map_mr4mbd88": 5000,
    "map_mv1bzur4": 5000,
    "map_a46c5e1a-9802-4db5-a3b9-486b4649c206": 5000,
    "map_mvtnqrs7": 5000,
    "map_mvvdbiyx": 5000,
    "map_mvxz356e": 4000,
    "map_mw2dn6re": 5000,
    "map_mwizzi7s": 3000,
    "map_mwm655e8": 3000,
    "map_691cf40a-884b-423d-b1df-beef88b16f00": 3000,
    "map_89aacb92-4b89-47ec-a76b-0908972d3fdf": 5000,
    "map_w118_deep_test": 5000
  },
  "allZones": { "money": 10000, "crystals": 1000 }
};
// 遊戲和對話編輯器讀這個名字（js/missions.js、js/dialogue-editor.js）
const BOSS_BOUNTIES = REWARDS_DATA.bosses;
