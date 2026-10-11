/* 怪物種類資料：由怪物編輯器匯出。地圖只記錄種類 ID 與權重。 */
const MONSTERS_DEFAULT = [
  {
    "id": "slime",
    "name": "史萊姆",
    "sprite": "images/monster/Monster_Slime.png",
    "hp": 50,
    "speed": 25,
    "playerDamage": 12,
    "sentryDamage": 14,
    "buildingDamage": 60,
    "reward": 30,
    "crystals": 3,
    "width": 42,
    "height": 33
  },
  {
    "id": "bird_head",
    "name": "鳥頭人",
    "sprite": "images/monster/bird-head/bird-head-front.png",
    "hp": 150,
    "speed": 40,
    "playerDamage": 12,
    "sentryDamage": 18,
    "buildingDamage": 80,
    "reward": 50,
    "crystals": 5,
    "width": 60,
    "height": 80,
    "frames": {
      "front": "images/monster/bird-head/bird-head-front.png",
      "walkFront": [
        "images/monster/bird-head/bird-head-front-walk-01.png",
        "images/monster/bird-head/bird-head-front.png",
        "images/monster/bird-head/bird-head-front-walk-02.png",
        "images/monster/bird-head/bird-head-front.png"
      ],
      "idle": [
        "images/monster/bird-head/bird-head-side-01.png",
        "images/monster/bird-head/bird-head-side-02.png",
        "images/monster/bird-head/bird-head-side-03.png",
        "images/monster/bird-head/bird-head-side-04.png"
      ],
      "idleFacing": "left",
      "idleFps": 4,
      "eyes": [
        [
          14.5,
          12.5
        ],
        [
          45.5,
          12.5
        ]
      ],
      "idleEyes": [
        [
          37,
          14
        ]
      ]
    },
    "behavior": "charger",
    "charger": {
      "noticeRange": 6,
      "loseRange": 12,
      "idleMin": 2.5,
      "idleMax": 5,
      "wanderChance": 0.4,
      "wanderRadius": 3,
      "wanderSpeedMul": 0.45,
      "noticeTime": 0.45,
      "chargeRange": 7,
      "chargeSpeed": 250,
      "chargeOvershoot": 1.2,
      "huntSpeedMul": 1.5,
      "recoverHit": 0.9,
      "recoverMiss": 0.5,
      "recoverWall": 1.2,
      "knockback": 30
    },
    "hitSound": "birdHurt",
    "deathSound": "birdDeath"
  },
  {
    "id": "pearl_kid",
    "name": "珍珠小童",
    "sprite": "images/monster/pearl-kid/pearl-kid.png",
    "hp": 80,
    "speed": 28,
    "playerDamage": 20,
    "sentryDamage": 10,
    "buildingDamage": 20,
    "reward": 80,
    "crystals": 4,
    "width": 80,
    "height": 74,
    "behavior": "shooter",
    "shooter": {
      "noticeRange": 7,
      "loseRange": 12,
      "shootRange": 5,
      "keepDistance": 2.5,
      "retreatSpeedMul": 0.8,
      "hover": 16,
      "windup": 0.5,
      "cooldown": 2.4,
      "angryCooldownMul": 0.75,
      "pearlSpeed": 240,
      "pearlCount": 1,
      "pearlSpread": 14,
      "wanderRadius": 2.5,
      "wanderSpeedMul": 0.7,
      "idleMin": 1.5,
      "idleMax": 3.5
    },
    "art": {
      "normal": "images/monster/pearl-kid/pearl-kid.png",
      "half": "images/monster/pearl-kid/pearl-kid-half-closed.png",
      "closed": "images/monster/pearl-kid/pearl-kid-closed.png",
      "angry": "images/monster/pearl-kid/pearl-kid-angry.png",
      "angryHalf": "images/monster/pearl-kid/pearl-kid-angry-half-closed.png",
      "pearl": "images/monster/pearl-kid/pearl.png"
    }
  }
];
/* 史萊姆種類（由怪物編輯器匯出）：數值是「基本史萊姆」的倍率；chance 為生成時變成這種的機率（0～1），unlockAt 為開戰幾秒後才會出現。 */
const SLIME_SETTINGS_DEFAULT = {
  "variants": [
    {
      "id": "normal",
      "name": "史萊姆",
      "chance": 0,
      "unlockAt": 0,
      "hpMul": 1,
      "speedMul": 1,
      "dmgMul": 1,
      "rewardMul": 1,
      "scale": 1,
      "hue": 0
    },
    {
      "id": "splitter",
      "name": "分裂史萊姆",
      "chance": 0.14,
      "unlockAt": 15,
      "hpMul": 1.25,
      "speedMul": 1,
      "dmgMul": 1,
      "rewardMul": 1,
      "scale": 1,
      "hue": -75
    },
    {
      "id": "bomber",
      "name": "自爆史萊姆",
      "chance": 0.11,
      "unlockAt": 30,
      "hpMul": 0.7,
      "speedMul": 1.3,
      "dmgMul": 1,
      "rewardMul": 1,
      "scale": 1,
      "hue": 170
    },
    {
      "id": "spitter",
      "name": "吐酸史萊姆",
      "chance": 0.12,
      "unlockAt": 40,
      "hpMul": 0.9,
      "speedMul": 0.85,
      "dmgMul": 1,
      "rewardMul": 1,
      "scale": 1,
      "hue": -130
    },
    {
      "id": "giant",
      "name": "巨型史萊姆",
      "chance": 0,
      "unlockAt": 0,
      "hpMul": 4,
      "speedMul": 0.7,
      "dmgMul": 2,
      "rewardMul": 4,
      "scale": 1.65,
      "hue": 95
    },
    {
      "id": "mini",
      "name": "小史萊姆",
      "chance": 0,
      "unlockAt": 0,
      "hpMul": 0.3,
      "speedMul": 1.35,
      "dmgMul": 0.5,
      "rewardMul": 0.25,
      "scale": 0.6,
      "hue": -75
    }
  ],
  "giant": {
    "first": 45,
    "every": 75
  }
};
