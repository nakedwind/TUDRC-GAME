/* 怪物種類資料：由怪物編輯器匯出。地圖只記錄種類 ID 與權重。 */
const MONSTERS_DEFAULT = [
  {
    "id": "slime",
    "name": "史萊姆",
    "sprite": "images/monster/Monster_Slime.png",
    "hp": 98,
    "speed": 50,
    "playerDamage": 12,
    "sentryDamage": 14,
    "buildingDamage": 60,
    "reward": 8,
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
      "closed": "images/monster/pearl-kid/pearl-kid-eyes-closed.png",
      "shell": "images/monster/pearl-kid/pearl-kid-closed-green.png",
      "angry": "images/monster/pearl-kid/pearl-kid-angry.png",
      "angryHalf": "images/monster/pearl-kid/pearl-kid-angry-half-closed.png",
      "pearl": "images/monster/pearl-kid/pearl.png"
    },
    "hitSound": "pearlHurt",
    "deathSound": "pearlDeath"
  },
  {
    "id": "lifeform",
    "name": "生命體",
    "sprite": "images/monster/Lifeform/Monster_Lifeform01.png",
    "hp": 200,
    "speed": 24,
    "playerDamage": 18,
    "sentryDamage": 20,
    "buildingDamage": 50,
    "reward": 60,
    "crystals": 6,
    "width": 111,
    "height": 160,
    "frames": {
      "front": "images/monster/Lifeform/Monster_Lifeform01.png",
      "walkFront": [
        "images/monster/Lifeform/Monster_Lifeform01.png",
        "images/monster/Lifeform/Monster_Lifeform02.png",
        "images/monster/Lifeform/Monster_Lifeform03.png",
        "images/monster/Lifeform/Monster_Lifeform04.png",
        "images/monster/Lifeform/Monster_Lifeform05.png",
        "images/monster/Lifeform/Monster_Lifeform06.png",
        "images/monster/Lifeform/Monster_Lifeform07.png",
        "images/monster/Lifeform/Monster_Lifeform08.png",
        "images/monster/Lifeform/Monster_Lifeform09.png"
      ],
      "walkFacing": "left",
      "attack": [
        "images/monster/Lifeform/Monster_Lifeform_attack01.png",
        "images/monster/Lifeform/Monster_Lifeform_attack02.png",
        "images/monster/Lifeform/Monster_Lifeform_attack03.png",
        "images/monster/Lifeform/Monster_Lifeform_attack04.png"
      ],
      "attackFacing": "left",
      "attackRig": {
        "body": "images/monster/Lifeform/Monster_Lifeform_body.png",
        "arm": "images/monster/Lifeform/Monster_Lifeform_arm.png",
        "pivot": [
          35.5,
          25
        ],
        "rest": 101.6,
        "angles": [
          208,
          258,
          150
        ],
        "facing": "left"
      }
    },
    "undying": true,
    "noHitSquash": true,
    "stagger": 0,
    "noStun": true,
    "sweep": {
      "range": 1.5,
      "arc": 140
    },
    "knockMul": 0.4
  },
  {
    "id": "hangi_bao",
    "name": "夯吉寶",
    "sprite": "images/monster/Hangi-Bao/hangi-bao.png",
    "hp": 45,
    "speed": 48,
    "playerDamage": 6,
    "sentryDamage": 8,
    "buildingDamage": 15,
    "reward": 20,
    "crystals": 2,
    "width": 80,
    "height": 80,
    "frames": {
      "front": "images/monster/Hangi-Bao/hangi-bao.png",
      "walkFront": [
        "images/monster/Hangi-Bao/hangi-bao-walk-01.png",
        "images/monster/Hangi-Bao/hangi-bao-walk-02.png"
      ],
      "blink": [
        "images/monster/Hangi-Bao/hangi-bao-blink-01.png",
        "images/monster/Hangi-Bao/hangi-bao-blink-02.png"
      ]
    },
    "behavior": "boomerang",
    "boomerang": {
      "noticeRange": 7,
      "loseRange": 12,
      "throwRange": 4.5,
      "keepDistance": 2,
      "retreatSpeedMul": 0.8,
      "windup": 0.35,
      "cooldown": 1.6,
      "capSpeed": 260,
      "returnSpeedMul": 1.15,
      "wanderRadius": 2.5,
      "wanderSpeedMul": 0.6,
      "idleMin": 1,
      "idleMax": 3
    },
    "art": {
      "cap": "images/monster/Hangi-Bao/shunshun-cap-small.png"
    },
    "hitSound": "hangiHurt",
    "deathSound": "hangiDeath"
  },
  {
    "id": "fish_head",
    "name": "魚頭君",
    "sprite": "images/monster/fish-head/fish-head-front.png",
    "hp": 110,
    "speed": 70,
    "playerDamage": 5,
    "sentryDamage": 6,
    "buildingDamage": 20,
    "reward": 45,
    "crystals": 4,
    "width": 80,
    "height": 80,
    "frames": {
      "front": "images/monster/fish-head/fish-head-front.png",
      "walkFront": [
        "images/monster/fish-head/fish-head-front-walk-01.png",
        "images/monster/fish-head/fish-head-front-walk-02.png"
      ],
      "walkFacing": "left",
      "back": "images/monster/fish-head/fish-head-back.png",
      "walkBack": [
        "images/monster/fish-head/fish-head-back-walk-01.png",
        "images/monster/fish-head/fish-head-back-walk-02.png"
      ],
      "backFacing": "right"
    },
    "behavior": "fishhead",
    "hitSound": "fishHurt",
    "deathSound": "fishDeath"
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
