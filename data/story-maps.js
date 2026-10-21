/* ===== 劇情地圖（由「📖 劇情地圖編輯器」匯出）=====
   只放劇情地圖；每張圖可自行設定為安全場景或戰鬥場景。
   素材（磚塊）在三個編輯器共用的 data/tiles.js。
   整段貼回 data/story-maps.js 覆蓋即可。 */
const STORY_MAPS = [
  {
    "id": "story_start",
    "name": "新劇情地圖",
    "desc": "",
    "safe": true,
    "npcs": false,
    "cols": 32,
    "rows": 18,
    "layers": {},
    "stamps": [],
    "solid": [],
    "solidOffsets": {},
    "breakable": [],
    "camp": [],
    "coreSpots": [],
    "spawnZone": [],
    "portals": [],
    "coreCount": 1,
    "monsterMix": [
      { "id": "slime", "weight": 100 }
    ],
    "rules": {
      "money": 3000,
      "guide": 100,
      "guideRegen": 9,
      "speed": 44,
      "reward": 8
    }
  }
];
