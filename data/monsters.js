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
      "back": "images/monster/bird-head/bird-head-back.png",
      "walkBack": [
        "images/monster/bird-head/bird-head-back-walk-01.png",
        "images/monster/bird-head/bird-head-back.png",
        "images/monster/bird-head/bird-head-back-walk-02.png",
        "images/monster/bird-head/bird-head-back.png"
      ],
      "backFacing": "right",
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
    "deathSound": "pearlDeath",
    "element": "water"
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
    "deathSound": "fishDeath",
    "element": "water"
  },
  {
    "id": "loofah_lady",
    "name": "絲瓜小姐",
    "sprite": "images/monster/loofah-lady/loofah-lady.png",
    "hp": 140,
    "speed": 40,
    "playerDamage": 6,
    "sentryDamage": 8,
    "buildingDamage": 20,
    "reward": 55,
    "crystals": 5,
    "width": 80,
    "height": 107,
    "frames": {
      "front": "images/monster/loofah-lady/loofah-lady.png",
      "walkFront": [
        "images/monster/loofah-lady/loofah-lady-walk-01.png",
        "images/monster/loofah-lady/loofah-lady-walk-02.png",
        "images/monster/loofah-lady/loofah-lady-walk-03.png",
        "images/monster/loofah-lady/loofah-lady-walk-02.png"
      ],
      "blink": [
        "images/monster/loofah-lady/loofah-lady-blink-01.png",
        "images/monster/loofah-lady/loofah-lady-blink-02.png"
      ]
    },
    "behavior": "vine",
    "hitSound": "loofahHurt",
    "deathSound": "loofahDeath",
    "element": "grass"
  },
  {
    "id": "milkfish_kid",
    "name": "虱目魚小子",
    "sprite": "images/monster/milkfish-kid/milkfish-kid-front.png",
    "hp": 160,
    "speed": 45,
    "playerDamage": 8,
    "sentryDamage": 10,
    "buildingDamage": 20,
    "reward": 60,
    "crystals": 5,
    "width": 110,
    "height": 132,
    "frames": {
      "front": "images/monster/milkfish-kid/milkfish-kid-front.png",
      "walkFront": [
        "images/monster/milkfish-kid/milkfish-kid-walk-01.png",
        "images/monster/milkfish-kid/milkfish-kid-walk-02.png",
        "images/monster/milkfish-kid/milkfish-kid-walk-03.png",
        "images/monster/milkfish-kid/milkfish-kid-walk-02.png"
      ]
    },
    "behavior": "milkfish",
    "hitSound": "milkfishHurt",
    "deathSound": "milkfishDeath",
    "wide": true,
    "element": "water",
    "stagger": 0.15,
    "knockMul": 0.4
  },
  {
    "id": "milkfish_kid_small",
    "name": "小虱目魚小子",
    "sprite": "images/monster/milkfish-kid-small/milkfish-kid-small-front.png",
    "hp": 60,
    "speed": 55,
    "playerDamage": 0,
    "sentryDamage": 0,
    "buildingDamage": 15,
    "reward": 25,
    "crystals": 2,
    "width": 70,
    "height": 80,
    "frames": {
      "front": "images/monster/milkfish-kid-small/milkfish-kid-small-front.png",
      "walkFront": [
        "images/monster/milkfish-kid-small/milkfish-kid-small-walk-01.png",
        "images/monster/milkfish-kid-small/milkfish-kid-small-walk-02.png",
        "images/monster/milkfish-kid-small/milkfish-kid-small-walk-03.png",
        "images/monster/milkfish-kid-small/milkfish-kid-small-walk-02.png"
      ]
    },
    "behavior": "milkfishSmall",
    "hitSound": "milkfishHurt",
    "deathSound": "milkfishDeath",
    "element": "water"
  },
  {
    "id": "milkfish_king",
    "name": "虱目魚王",
    "sprite": "images/monster/milkfish-kid/milkfish-kid-front.png",
    "hp": 4500,
    "speed": 50,
    "playerDamage": 22,
    "sentryDamage": 20,
    "buildingDamage": 60,
    "reward": 400,
    "crystals": 30,
    "width": 220,
    "height": 264,
    "frames": {
      "front": "images/monster/milkfish-kid/milkfish-kid-front.png",
      "walkFront": [
        "images/monster/milkfish-kid/milkfish-kid-walk-01.png",
        "images/monster/milkfish-kid/milkfish-kid-walk-03.png"
      ]
    },
    "behavior": "milkfishKing",
    "mfKing": {
      "noticeRange": 8,
      "leash": 40,
      "eatSense": 12,
      "chewTime": 0.5,
      "bellyMax": 10,
      "maxPrey": 2,
      "holdTime": 8,
      "mateLandDamage": 25,
      "mateStun": 2.5,
      "spitRange": 9,
      "spitWindup": 0.8,
      "spitFlight": 0.9,
      "spitCooldown": 1,
      "spitRadius": 1.2,
      "spitDamage": 30,
      "coreSpitHp": 0.4,
      "coreOutTime": 2,
      "rushSpeedMul": 2.2,
      "stepShake": 6,
      "coreAtkMul": 1.3,
      "acidPoolR": 1.1,
      "acidPoolLife": 5,
      "acidPoolDps": 8,
      "enrageHp": 0.5,
      "enrageSpitCooldown": 0.5,
      "chargeCooldown": 7,
      "chargeChain": 2,
      "chargeWindup": 0.6,
      "chargeSpeed": 320,
      "chargeDist": 10,
      "chargeDamage": 35,
      "chargeKnock": 3,
      "chaseRadius": 50,
      "jumpRange": 8,
      "jumpWindup": 0.5,
      "jumpTime": 1,
      "jumpHeight": 150,
      "jumpDamage": 35,
      "jumpSlamR": 1.8,
      "jumpKnock": 2,
      "coreHp": 2000,
      "coreShield": 0.9,
      "introRumble": 7.2,
      "introShake": 7,
      "introLeapTime": 2.4,
      "introLeapHeight": 180,
      "introLandShake": 12
    },
    "hitSound": "milkfishHurt",
    "deathSound": "milkfishDeath",
    "wide": true,
    "element": "water",
    "noHitSquash": true,
    "stagger": 0,
    "knockMul": 0
  },
  {
    "id": "burrowing_mouse",
    "name": "花蓮版權老鼠",
    "sprite": "images/monster/burrowing-mouse/mouse-open.png",
    "hp": 180,
    "speed": 65,
    "playerDamage": 14,
    "sentryDamage": 18,
    "buildingDamage": 35,
    "reward": 45,
    "crystals": 5,
    "width": 110,
    "height": 90,
    "frames": {
      "front": "images/monster/burrowing-mouse/mouse-open.png",
      "walkFront": [
        "images/monster/burrowing-mouse/mouse-open.png"
      ]
    },
    "behavior": "burrow",
    "burrow": {
      "noticeRange": 14,
      "hitRadius": 1.2,
      "tunnelSpeed": 1.75,
      "windup": 0.8,
      "handRise": 0.2,
      "handHold": 0.4,
      "cooldown": 2.6,
      "emergeTime": 0.75
    },
    "art": {
      "body": "images/monster/burrowing-mouse/mouse-open.png",
      "bodyHalf": "images/monster/burrowing-mouse/mouse-half.png",
      "bodyClosed": "images/monster/burrowing-mouse/mouse-closed.png",
      "hole": "images/monster/burrowing-mouse/hole.png",
      "crack": "images/monster/burrowing-mouse/hole-appear.png",
      "deathHole": "images/monster/burrowing-mouse/hole02.png",
      "dizzy1": "images/monster/burrowing-mouse/mouse-dizzy01.png",
      "dizzy2": "images/monster/burrowing-mouse/mouse-dizzy02.png",
      "dizzy3": "images/monster/burrowing-mouse/mouse-dizzy03.png",
      "dizzy4": "images/monster/burrowing-mouse/mouse-dizzy04.png",
      "hand": "images/monster/burrowing-mouse/left-hand.png",
      "handHole": "images/monster/burrowing-mouse/left-hole.png"
    },
    "hitSound": "mouseHurt",
    "deathSound": "mouseDeath",
    "noHitSquash": true,
    "knockMul": 0
  },
  {
    "id": "clownfish",
    "name": "比基尼小丑魚",
    "sprite": "images/monster/clownfish/clownfish-front.png",
    "hp": 120,
    "speed": 75,
    "playerDamage": 12,
    "sentryDamage": 14,
    "buildingDamage": 30,
    "reward": 26,
    "crystals": 3,
    "width": 108,
    "height": 132,
    "frames": {
      "front": "images/monster/clownfish/clownfish-front.png",
      "walkFront": [
        "images/monster/clownfish/clownfish-hop-crouch.png",
        "images/monster/clownfish/clownfish-hop-air.png"
      ],
      "idle": [
        "images/monster/clownfish/clownfish-front.png",
        "images/monster/clownfish/clownfish-front-02.png"
      ],
      "idleFacing": "left",
      "idleFps": 1.6,
      "blink": [
        "images/monster/clownfish/clownfish-blink.png"
      ]
    },
    "behavior": "clownfish",
    "hitSound": "clownfishHurt",
    "deathSound": "clownfishDeath",
    "wide": true,
    "element": "water",
    "shockResist": 0.6,
    "knockMul": 0.6
  },
  {
    "id": "clownfish_small",
    "name": "小丑魚幼體",
    "sprite": "images/monster/clownfish/clownfish-small-front.png",
    "hp": 35,
    "speed": 120,
    "playerDamage": 5,
    "sentryDamage": 6,
    "buildingDamage": 10,
    "reward": 8,
    "crystals": 1,
    "width": 50,
    "height": 64,
    "frames": {
      "front": "images/monster/clownfish/clownfish-small-front.png",
      "walkFront": [
        "images/monster/clownfish/clownfish-small-front.png",
        "images/monster/clownfish/clownfish-small-hop.png"
      ]
    },
    "behavior": "clownfish",
    "hitSound": "clownfishHurt",
    "deathSound": "clownfishSmallDeath",
    "element": "water",
    "knockMul": 1.2
  },
  {
    "id": "golden_banana_king",
    "name": "金蕉王",
    "sprite": "images/monster/golden-banana-king/golden-banana-king-front.png",
    "hp": 300,
    "speed": 40,
    "playerDamage": 0,
    "sentryDamage": 0,
    "buildingDamage": 0,
    "reward": 40,
    "crystals": 5,
    "width": 78,
    "height": 143,
    "frames": {
      "front": "images/monster/golden-banana-king/golden-banana-king-front.png",
      "walkFront": [
        "images/monster/golden-banana-king/golden-banana-king-walk-01.png",
        "images/monster/golden-banana-king/golden-banana-king-walk-02.png",
        "images/monster/golden-banana-king/golden-banana-king-walk-03.png",
        "images/monster/golden-banana-king/golden-banana-king-walk-02.png"
      ],
      "walkFacing": "left"
    },
    "behavior": "healer",
    "hitSound": "bananaHurt",
    "deathSound": "bananaDeath",
    "element": "grass"
  },
  {
    "id": "gourd_monkey",
    "name": "葫蘆猴",
    "sprite": "images/monster/gourd-monkey/gourd-monkey-front.png",
    "hp": 700,
    "speed": 36,
    "playerDamage": 22,
    "sentryDamage": 28,
    "buildingDamage": 80,
    "reward": 60,
    "crystals": 6,
    "width": 105,
    "height": 165,
    "frames": {
      "front": "images/monster/gourd-monkey/gourd-monkey-front.png",
      "walkFront": [
        "images/monster/gourd-monkey/gourd-monkey-sway-right.png",
        "images/monster/gourd-monkey/gourd-monkey-sway-left.png"
      ],
      "blink": [
        "images/monster/gourd-monkey/gourd-monkey-blink-01.png",
        "images/monster/gourd-monkey/gourd-monkey-blink-02.png"
      ]
    },
    "behavior": "gourd",
    "deathSound": "gourdDeath",
    "wide": true,
    "noHitSquash": true,
    "stagger": 0,
    "noStun": true,
    "knockMul": 0
  },
  {
    "id": "human_face_butterfly",
    "name": "人面蝶",
    "sprite": "images/monster/人面蝶/人面蝶 正.png",
    "hp": 250,
    "speed": 30,
    "playerDamage": 0,
    "sentryDamage": 0,
    "buildingDamage": 0,
    "reward": 55,
    "crystals": 5,
    "width": 163,
    "height": 125,
    "frames": {
      "front": "images/monster/人面蝶/人面蝶 正.png",
      "walkFront": [
        "images/monster/人面蝶/怪物 人面蝶01.png",
        "images/monster/人面蝶/怪物 人面蝶02.png"
      ]
    },
    "behavior": "moth",
    "hitSound": "mothHurt",
    "deathSound": "mothDeath",
    "noHitSquash": true,
    "knockMul": 0.5
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

/* BOSS 數值（由怪物編輯器匯出）：每隻 BOSS 程式檔裡設定的數字，遊戲開場時用這裡的蓋過去（js/monster-data.js 的 applyBossSettings）。 */
const BOSS_SETTINGS_DEFAULT = {
  "ELITE_BIRD": {
    "hpMul": 12,
    "dmgMul": 2.2,
    "rewardMul": 5,
    "crystalMul": 5,
    "scale": 2.5,
    "speedMul": 0.5,
    "knockMul": 0,
    "stagger": 0,
    "stunResist": 0.5,
    "wakeRange": 7,
    "guardTurn": [
      0.15,
      0.55
    ],
    "scream": 1.2,
    "loseRange": 12,
    "chargeRange": 8,
    "leash": 24,
    "windup": 1,
    "aimLock": 0.55,
    "chargeSpeed": 110,
    "chargeStart": 0.3,
    "chargeAccel": 0.6,
    "chargeBrake": 1.4,
    "dashCells": 20,
    "hitWidth": 40,
    "knockback": 140,
    "sentryKnockMul": 0.8,
    "knockTime": 0.36,
    "redBlockDmgMul": 0.5,
    "redBlockKnockMul": 0.35,
    "redBlockSlow": 0.45,
    "recoverHit": 1,
    "recoverMiss": 0.8,
    "dazed": 2.6,
    "coreShield": 0.6,
    "returnSpeedMul": 1.1,
    "returnDashFrom": 1,
    "returnRamCd": 1,
    "stepEvery": 60,
    "stepShake": 10,
    "walkShake": 5,
    "runCrack": {
      "scale": 0.32,
      "life": 3
    },
    "runDust": {
      "rocks": 0,
      "dust": 8,
      "dustRise": 2,
      "size": 0.6,
      "spread": 10
    }
  },
  "CAP_KING": {
    "capScale": 2.3,
    "blockW": 3,
    "blockH": 2,
    "coreHp": 1000,
    "bigCaps": 4,
    "bigCapHangi": 2,
    "spawnCount": [
      3,
      5
    ],
    "reopenCount": [
      1,
      1
    ],
    "exposeTime": 10,
    "cycleTime": 30,
    "warnTime": 3,
    "closeTime": 0.45,
    "shuffle": {
      "rounds": 7,
      "pairs": 2,
      "swapTime": 0.55,
      "arc": 34,
      "pause": 0.12,
      "near": 1.5
    },
    "coreShield": 0.9,
    "big": {
      "scale": 2.6,
      "hpMul": 18,
      "dmgMul": 1.8,
      "rewardMul": 5,
      "crystalMul": 5,
      "lordHp": 1800,
      "speedMul": 1.5,
      "walkStride": 18,
      "capSpread": {
        "n": 3,
        "angle": 22,
        "scale": 1.8,
        "hitR": 28
      },
      "boomerang": {
        "noticeRange": 12,
        "loseRange": 20,
        "throwRange": 6.5,
        "keepDistance": 2.5,
        "windup": 0.55,
        "cooldown": 2.2,
        "capSpeed": 230
      },
      "stepEvery": 46,
      "stepShake": 6
    }
  },
  "BANANA_EMPEROR": {
    "standOff": 3.5,
    "wander": {
      "near": 3,
      "far": 5.5,
      "speed": 0.5,
      "pause": [
        1.5,
        3.5
      ]
    },
    "hp": 2000,
    "rewardMul": 6,
    "crystalMul": 6,
    "scale": 2.3,
    "wakeRange": 8,
    "castEvery": 4.5,
    "firstCast": 1.5,
    "raiseTime": 0.9,
    "tapHold": 0.45,
    "circle": 9,
    "healBelow": 0.85,
    "spells": {
      "heal": {
        "amount": 80
      },
      "atk": {
        "mul": 1.5,
        "time": 12
      },
      "def": {
        "cut": 0.2,
        "time": 12
      },
      "spd": {
        "mul": 1.5,
        "time": 10
      },
      "peels": {
        "count": 7,
        "aimed": 3,
        "near": 2,
        "far": 7,
        "fall": 1.1,
        "height": 420
      },
      "wind": {
        "dist": 8,
        "away": 0.5,
        "leaves": 36,
        "leafRise": [
          140,
          260
        ],
        "leafLife": [
          1.4,
          2.4
        ]
      }
    },
    "debuffs": {
      "heal": {
        "drain": 10
      },
      "atk": {
        "mul": 0.6,
        "time": 8
      },
      "def": {
        "mul": 1.4,
        "time": 8
      },
      "spd": {
        "mul": 0.6,
        "time": 8
      }
    },
    "shake": 16,
    "tap1": {
      "hold": 0.28,
      "lift": 0.22,
      "shake": 8,
      "crack": 0.6
    },
    "step": {
      "every": 30,
      "shake": 4.5,
      "range": 18
    },
    "cracks": {
      "count": 8,
      "len": [
        55,
        120
      ],
      "extra": 2,
      "extraScale": 0.7,
      "glow": 1.4,
      "max": 30,
      "slow": 0.5,
      "fade": 3
    },
    "core": {
      "adopt": 4,
      "pull": 12
    },
    "squad": {
      "leash": 6,
      "regroup": 1.5,
      "roam": 1,
      "formation": {
        "vertexDown": 1.5,
        "armAngle": 30,
        "spacing": 2.4,
        "kingsUp": 2,
        "kingsApart": 2.4
      },
      "kings": 2
    }
  },
  "LOOFAH_QUEEN": {
    "hp": 3000,
    "dmgMul": 1.5,
    "rewardMul": 6,
    "crystalMul": 6,
    "scale": 2.5,
    "slow": 2,
    "wakeRange": 7,
    "loseRange": 16,
    "leash": 9,
    "stompRange": 13.5,
    "stomp": {
      "shake": 16,
      "crack": 1,
      "rocks": 9,
      "leaves": 30,
      "leafRange": 9,
      "leafHigh": [
        180,
        320
      ],
      "leafDrop": [
        240,
        330
      ],
      "leafSlow": 129,
      "leafDrag": 3.2,
      "leafDelay": 0.25,
      "leafRest": 2.5,
      "rockFall": 0.9,
      "rockDelay": [
        0.05,
        0.5
      ],
      "rockHeight": 360,
      "rockRadius": 16,
      "rockDamage": 5,
      "rockAimed": 2,
      "rockRest": 2
    },
    "keepDistance": 3,
    "vines": {
      "count": 7,
      "aimed": 3,
      "aimJitter": 0.5,
      "spreadMin": 3,
      "spreadMax": 10.5,
      "down": 0.75,
      "hangChance": 0.5,
      "gap": 1.5,
      "life": 6,
      "ground": {
        "count": 8,
        "linger": 6,
        "touchR": 26,
        "warn": 0.9,
        "grabR": 32,
        "hold": 4,
        "throwChance": 0.5,
        "throwAfter": 3,
        "windup": 0.6,
        "throwRange": 8,
        "throwSpeed": 430,
        "throwUp": 160,
        "wallDamage": 15
      }
    },
    "core": {
      "hp": 1000,
      "adopt": 9,
      "above": 26,
      "hungH": 90,
      "lowerSpeed": 110,
      "fireR": 30,
      "shotHits": 3,
      "shield": 0.6,
      "move": {
        "grab": 0.45,
        "up": 0.55,
        "down": 0.75,
        "high": 380,
        "near": 3,
        "far": 8,
        "minMove": 3
      },
      "fall": 1700
    },
    "guards": {
      "count": 3,
      "radius": 2.5
    },
    "farm": {
      "range": 16,
      "cols": [
        1.3,
        2.4,
        3.5,
        4.6
      ],
      "rows": [
        1.5,
        2.6
      ],
      "catchR": 20,
      "rootTime": 4,
      "safeTime": 2,
      "fireR": 20,
      "burnTime": 40
    }
  },
  "PEARL_ELDER": {
    "hp": 3000,
    "dmgMul": 0.75,
    "rewardMul": 6,
    "crystalMul": 6,
    "scale": 2.6,
    "speedMul": 1.2,
    "hover": 26,
    "wakeRange": 6,
    "loseRange": 20,
    "loseTime": 8,
    "leash": 14,
    "returnAt": 18,
    "returnTo": 10,
    "returnMax": 6,
    "wanderRadius": 4,
    "wanderSpeedMul": 0.6,
    "idle": [
      1.5,
      3.5
    ],
    "keepDistance": 4,
    "body": {
      "x": 0.4,
      "y": 0.16
    },
    "coreShare": 0.1,
    "coreHp": 1000,
    "coreArt": {
      "x": 0.4,
      "y": 0.7,
      "len": 0.5,
      "angle": -73
    },
    "scatter": {
      "count": 7,
      "spread": 70,
      "speed": 220,
      "range": 18,
      "windup": 0.8,
      "cooldown": 2.4
    },
    "shell": {
      "time": 30,
      "defense": 0.1,
      "grace": 4
    },
    "stun": {
      "time": 2.5,
      "dmgMul": 1.3
    },
    "rain": {
      "smallEvery": 0.35,
      "bigEvery": 2.2,
      "warn": 2.2,
      "fall": 0.7,
      "smallR": 24,
      "bigR": 38,
      "smallDmg": 12,
      "bigDmg": 25,
      "smallMin": 1,
      "smallMax": 15,
      "bigMin": 3,
      "bigMax": 10
    },
    "big": {
      "r": 34,
      "max": 10,
      "hp": 8,
      "pushSpeed": 110,
      "shotPush": 150,
      "maxSpeed": 380,
      "knockSpeed": 650,
      "friction": 1.4,
      "bounce": 0.45,
      "hitSpeed": 40,
      "ramSpeed": 140,
      "nudge": 0.8,
      "bossDmg": 0.08,
      "monsterDmg": 60
    },
    "roll": {
      "first": 2,
      "every": 5,
      "range": 18,
      "windup": 0.9,
      "speed": 300,
      "len": 18,
      "hitR": 46,
      "dmg": 22,
      "knock": 1.6,
      "knockTime": 0.3,
      "bounces": [
        2,
        3
      ],
      "bounceLen": 1,
      "wallStun": 1.5
    },
    "beads": {
      "chance": 0.6,
      "per": 2,
      "spread": 18,
      "r": 4,
      "life": 14,
      "max": 24,
      "trigger": 14,
      "safe": 2
    },
    "shake": {
      "land": 11,
      "bounce": 11,
      "bump": 14
    },
    "land": {
      "shakeMax": 10,
      "shakeMin": 3,
      "shakeRange": 12
    }
  },
  "GOURD_KING": {
    "scale": 2,
    "hp": 3600,
    "atk": 1.6,
    "speedMul": 1.1,
    "rewardMul": 8,
    "crystalMul": 8,
    "blastMul": 0.6,
    "knock": {
      "delay": 2.2,
      "gaps": [
        3.4,
        2.9,
        2.4
      ],
      "shake": [
        12,
        15,
        18,
        24
      ],
      "rumble": [
        0.55,
        0.7,
        0.9,
        1.6
      ],
      "hitstop": [
        0.03,
        0.05,
        0.07,
        0.09
      ],
      "jitter": [
        4,
        6,
        8,
        0
      ],
      "pebbles": [
        12,
        20,
        30
      ],
      "ceiling": [
        5,
        9,
        14
      ],
      "dust": [
        8,
        13,
        20
      ],
      "sift": [
        36,
        60,
        90
      ],
      "haze": [
        3,
        6,
        10
      ],
      "chunks": [
        4,
        8,
        12
      ],
      "shakeRange": 30
    },
    "breach": {
      "bursts": 5,
      "smoke": 34,
      "smokeLife": [
        1.6,
        2.6
      ],
      "pebbles": 26,
      "flash": 0.35
    },
    "landing": {
      "shake": 22,
      "rumble": 1.1,
      "smoke": 22,
      "bursts": 3
    },
    "emerge": {
      "start": 70,
      "rise": 0.5,
      "height": 210,
      "hang": 0.35,
      "drop": 0.15,
      "land": 6.5,
      "squash": 0.5,
      "hold": 0.4
    },
    "slam": {
      "noticeRange": 14,
      "loseRange": 40,
      "slamRange": 6,
      "maxLeap": 7,
      "crouch": 0.6,
      "rise": 0.75,
      "hang": 0.45,
      "drop": 0.14,
      "recover": 1.6,
      "cooldown": 3,
      "height": 200,
      "track": 70,
      "hitRadius": 140,
      "knockRadius": 270,
      "knockMax": 3.2,
      "knockMin": 1.2,
      "tossHeight": 70,
      "tossMinHeight": 30,
      "shakeMax": 16,
      "shakeMin": 6,
      "shakeRange": 22,
      "crackScale": 2.2,
      "markEvery": 14
    },
    "rocks": {
      "count": 12,
      "aimed": 4,
      "near": 2.5,
      "far": 8,
      "delay": [
        0.15,
        0.7
      ],
      "fall": 1.1,
      "height": 420,
      "radius": 30,
      "playerDamage": 14,
      "sentryDamage": 18,
      "monsterDamage": 60,
      "quick": 3,
      "big": {
        "chance": 0.5,
        "radius": 46,
        "damageMul": 1.6,
        "hp": 400,
        "life": 25
      }
    },
    "ores": {
      "crushPad": 0.6
    },
    "enrageAt": 0.5,
    "enrage": {
      "speed": 1.3
    },
    "combo": {
      "hops": 2,
      "gap": 0.3,
      "crouch": 0.25,
      "rise": 0.42,
      "hang": 0.16,
      "height": 130,
      "tired": 2.4
    }
  },
  "MOTH_BOSS": {
    "hp": 3000,
    "coreHp": 1500,
    "rewardMul": 8,
    "crystalMul": 8,
    "scale": 2.16,
    "height": 120,
    "sleepHeight": 60,
    "speedMul": 2,
    "flySpeedMul": 1.8,
    "wakeRange": 2,
    "scream": 1.4,
    "flyDefense": 0.34,
    "flyFloor": 0.06,
    "trailEvery": 0.55,
    "sky": {
      "chance": 0.5,
      "up": 2.6,
      "away": 1.6,
      "down": 1.5,
      "rise": 700,
      "grow": 1.4,
      "fadeFrom": 0.5
    },
    "leash": 16,
    "flight": {
      "accel": 260,
      "brake": 1.5,
      "tilt": 13,
      "lean": 5,
      "tiltSpeed": 6,
      "flapEvery": [
        0.28,
        0.55
      ],
      "flapDown": 0.12,
      "flapKick": 90,
      "sink": 140,
      "bobSpring": 6,
      "bobRange": 26,
      "wobble": 22,
      "cruiseLift": 170,
      "circleR": 4,
      "circleSpeed": 0.45,
      "cruiseSpeedMul": 1.6,
      "strafeLift": 35,
      "strafeRise": 4,
      "strafeLen": 4,
      "strafeSpeedMul": 3,
      "circleRest": 3,
      "liftSpeed": 6,
      "shadowLow": 40,
      "shadowHigh": 260,
      "shadowMinW": 0.18,
      "shadowMaxW": 0.5,
      "shadowMinA": 0.12,
      "shadowMaxA": 0.42
    },
    "orbit": {
      "min": 1.6,
      "max": 3.2
    },
    "nestOrbit": 2.2,
    "burst": {
      "every": [
        7,
        10
      ],
      "first": 2.5,
      "telegraph": 1.6,
      "time": 1.2,
      "puffs": 12,
      "cover": 0.7
    },
    "meleeLift": 70,
    "intro": {
      "range": 12,
      "shadow": 1.6,
      "shadowScale": 2.6,
      "shadowAlpha": 0.55,
      "dive": 1.8,
      "diveRise": 80,
      "diveAlpha": 0.35,
      "land": 0.9
    },
    "omen": {
      "every": [
        25,
        45
      ],
      "first": 12,
      "time": 4.8,
      "scale": 1.8,
      "alpha": 0.5,
      "flapEvery": 0.4,
      "volume": 0.7
    },
    "leaveTelegraph": 0.9,
    "grab": {
      "every": [
        5,
        14
      ],
      "first": 4,
      "range": 10,
      "warn": 0.8,
      "dive": 1.6,
      "diveSpeedMul": 4,
      "diveLift": 40,
      "reach": 0.8,
      "circle": 1.5,
      "carryLift": 260,
      "circleR": 2.5,
      "circleSpeed": 0.9,
      "carrySpeedMul": 1.2,
      "playerCircleMul": 2,
      "eightW": 640,
      "eightH": 160,
      "eightLoops": 1,
      "eightTime": 7,
      "eightEase": 0.12,
      "eightJoin": 0.8,
      "mateAway": 3,
      "mateDropMin": 2,
      "mateDropMax": 5,
      "breakDmg": 0.05,
      "struggleAngle": 8,
      "struggleShake": 2
    },
    "coreShield": 0.5,
    "sound": {
      "wake": 1.8,
      "flap": 0.85
    }
  },
  "RAT_KING": {
    "scale": 4,
    "showRow": 72,
    "hp": 4200,
    "atk": 1.4,
    "rewardMul": 8,
    "crystalMul": 8,
    "sway": {
      "cells": 1.5,
      "speed": 0.35
    },
    "armor": {
      "perCore": 0.25,
      "max": 0.8
    },
    "stun": {
      "time": 6,
      "dmgMul": 2
    },
    "enrageAt": 0.5,
    "emerge": {
      "delay": 2.2,
      "rumble": 2.4,
      "rise": 2.4,
      "hold": 1.2
    },
    "hands": {
      "every": [
        2.8,
        4.2
      ],
      "count": [
        1,
        1
      ],
      "frenzyEvery": [
        2.8,
        4.2
      ],
      "frenzyCount": [
        2,
        3
      ],
      "frenzyTargets": 2,
      "frenzyGrabs": 2,
      "frenzySpeed": 0.75,
      "grabChance": 0.6,
      "scale": 2.5,
      "riseSpeed": 0.5,
      "coreHoleGap": 2.5,
      "holeReach": 3,
      "holeChance": 0.7,
      "holdSway": {
        "angle": 0.1,
        "speed": 2.4
      }
    },
    "dig": {
      "size": 1,
      "linger": 1.2
    },
    "punch": {
      "windup": 0.95,
      "rise": 0.18,
      "hold": 0.35,
      "sink": 0.3,
      "radius": 2.2,
      "launch": {
        "dist": [
          2.5,
          3.8
        ],
        "up": 230
      },
      "monsterDamage": 40,
      "maxHits": 0
    },
    "grab": {
      "windup": 1.15,
      "rise": 0.22,
      "radius": 2,
      "hold": 5,
      "handHp": 260,
      "under": 6,
      "spitDamageMul": 1.2,
      "daze": 1.4,
      "cooldown": 3,
      "dragChance": 0.5,
      "throw": {
        "dist": [
          4.5,
          7
        ],
        "up": 260,
        "height": 100,
        "wallDamage": 12,
        "damageMul": 1
      },
      "pop": {
        "warn": 0.7,
        "up": 520,
        "dist": [
          1.5,
          3
        ]
      }
    },
    "core": {
      "react": {
        "shake": 0.55,
        "windup": 0.2
      },
      "exposeCap": 0.2,
      "first": [
        10,
        14
      ],
      "every": [
        16,
        24
      ],
      "windup": 1,
      "rise": 0.25,
      "hold": 0.55,
      "sink": 0.4,
      "under": [
        1.2,
        2
      ],
      "popHold": 1,
      "minMove": 6
    },
    "mice": {
      "every": [
        9,
        13
      ],
      "count": [
        1,
        2
      ],
      "max": 4
    },
    "ram": {
      "decelMul": 2,
      "fly": 2.2,
      "slowMo": {
        "time": 1,
        "scale": 0.3
      },
      "flyDir": 1,
      "flyAngle": 10,
      "flyDist": 34,
      "reach": 0.55
    },
    "finale": {
      "daze": 2.5,
      "musicLead": 17,
      "brakeLead": 1.6,
      "musicGain": 0.8,
      "slowMo": {
        "time": 0.5,
        "scale": 0.5
      },
      "camera": {
        "last": 10,
        "focusUp": 2,
        "holdAfter": 1.5,
        "zoom": 1,
        "bars": 0,
        "maxTime": 40
      }
    },
    "grip": {
      "held": [
        33,
        31
      ],
      "core": [
        48,
        31
      ],
      "coreSize": 1
    }
  },
  "POOL_BOSS": {
    "scale": 2.2,
    "hp": 4800,
    "coreHpMul": 2,
    "rewardMul": 6,
    "crystalMul": 6,
    "swimSpeed": 190,
    "surfacedSpeedMul": 0.4,
    "leapSpeedMul": 0.8,
    "dash": {
      "every": [
        1.5,
        3.5
      ],
      "time": 0.6,
      "mul": 1.8
    },
    "turnRate": 4,
    "weave": {
      "amp": 0.55,
      "freq": 3.2
    },
    "dive": [
      3,
      6
    ],
    "surface": [
      2.5,
      4
    ],
    "wanderCells": 14,
    "leapUp": {
      "time": 1,
      "height": 0.6
    },
    "leapDive": {
      "time": 1.15,
      "height": 0.5,
      "sink": 0.45,
      "splashAt": 0.62
    },
    "surfaceDepth": 0.5,
    "silhouette": 0.35,
    "defaultSee": 0.45,
    "flop": [
      1.2,
      3
    ],
    "flopTime": 0.32,
    "flopLift": 14,
    "splash": {
      "gravity": 700,
      "up": {
        "drops": 80,
        "column": 30,
        "mist": 12,
        "up": 380,
        "spread": 260,
        "shake": 8
      },
      "dive": {
        "drops": 70,
        "column": 55,
        "mist": 14,
        "up": 560,
        "spread": 200,
        "shake": 10
      },
      "land": {
        "drops": 36,
        "column": 0,
        "mist": 6,
        "up": 200,
        "spread": 200,
        "shake": 4
      }
    },
    "surge": {
      "speed": 9,
      "pushTime": 0.35,
      "linger": 1.4,
      "ringPush": 0.6,
      "up": {
        "range": 11,
        "spill": 2.2,
        "push": 90
      },
      "dive": {
        "range": 15.4,
        "spill": 3.3,
        "push": 140
      },
      "land": {
        "range": 7.7,
        "spill": 1.1,
        "push": 55
      }
    },
    "body": {
      "rx": 0.3,
      "ry": 0.14
    },
    "touchDamage": 18,
    "nearSpawn": 14,
    "hatchlingChance": 0.8
  },
  "FISH_KING": {
    "scale": 2.904,
    "hp": 4200,
    "rewardMul": 6,
    "crystalMul": 6,
    "peek": {
      "every": [
        14,
        26
      ],
      "stay": 4.5,
      "rise": 2.2,
      "sink": 2.4,
      "distMin": 4,
      "distMax": 10,
      "splashRise": 0.5,
      "splashSink": 0.7,
      "deepChance": 0.75,
      "deepDistMax": 16,
      "drift": 22
    },
    "shoreGap": 0,
    "surfaceRise": 1.2,
    "fadeAt": 0.7,
    "oval": {
      "wide": 1,
      "flat": 0.3
    },
    "introSecs": 1.1,
    "introHeight": 150,
    "introSplash": 3.2,
    "knockMul": 0.6,
    "swimSpeed": 90,
    "surfacedSpeedMul": 0.35,
    "turnRate": 1.6,
    "accel": 0.9,
    "weave": {
      "amp": 0.2,
      "freq": 1.5
    },
    "strokeSecs": 0.55,
    "dive": [
      3,
      5
    ],
    "surface": [
      4,
      6
    ],
    "approachMax": 4,
    "diveTurn": 1.4,
    "surfaceDepth": 0.57,
    "silhouette": 0.4,
    "defaultSee": 0.45,
    "splashSize": 2.4,
    "cannon": {
      "every": [
        2.5,
        4
      ],
      "windup": 1.1,
      "sweep": 1.4,
      "arc": 2.094,
      "range": 14.2,
      "width": 60,
      "damage": 14,
      "push": 2.4,
      "reach": 8,
      "shore": 2.5,
      "jumpSecs": 0.8,
      "jumpHeight": 120,
      "stay": 0.6,
      "impact": {
        "rate": 26,
        "size": 0.8,
        "life": 0.45,
        "wobble": 0.45,
        "spread": 2.2
      }
    },
    "geyser": {
      "every": [
        4,
        6.5
      ],
      "warn": 1.2,
      "column": 0.7,
      "radius": 0.9,
      "count": 2,
      "range": 16,
      "up": 620,
      "distMin": 2,
      "distMax": 4.5,
      "landDamage": 14,
      "panic": 3,
      "panicPlayer": 1
    },
    "leap": {
      "every": [
        6,
        10
      ],
      "hops": [
        1,
        3
      ],
      "secs": 1.1,
      "height": 150,
      "distMin": 4,
      "distMax": 14,
      "tilt": 0.6,
      "otherPool": 0.7,
      "waveRadius": 6,
      "wavePush": 2.2
    },
    "flinch": {
      "turn": 0.5
    },
    "shocked": {
      "shake": 0.8,
      "tilt": 30,
      "fall": 1600,
      "sink": 1.1,
      "gone": [
        2.5,
        4
      ]
    },
    "strandSecs": 6,
    "strandMul": 2,
    "hopSecs": 0.75,
    "hopHeight": 90,
    "flop": [
      0.9,
      1.8
    ],
    "flopLift": 16,
    "shock": {
      "boss": 60,
      "mate": 12,
      "minion": 40,
      "daze": 0.8,
      "cd": 0.6
    },
    "minions": {
      "at": [
        0.7,
        0.4
      ],
      "count": 3,
      "hideSecs": 4,
      "fleeMul": 1.8
    }
  },
  "WATER_MONSTERS": {
    "spawnChance": 0.4,
    "spawnMin": 5,
    "spawnMax": 16,
    "minPool": 8,
    "swimMul": 1,
    "noticeRange": 10,
    "sink": 0.45,
    "fishHeadSink": 0.725,
    "see": 0.35,
    "shoreGap": 1,
    "milkfish": {
      "lunge": 2.5,
      "leapSecs": 0.55,
      "leapHeight": 50
    },
    "small": {
      "every": [
        4,
        7
      ],
      "range": 9,
      "reach": 1.8,
      "swimMul": 1.8,
      "diveMax": 4,
      "warn": 0.7,
      "radius": 1,
      "leap": 70,
      "up": 520,
      "distMin": 1.5,
      "distMax": 3,
      "landDamage": 10,
      "panic": 2
    },
    "clown": {
      "every": [
        2.5,
        4
      ],
      "near": 6,
      "keep": 2.5,
      "eggLife": 30,
      "maxEggs": 10
    }
  },
  "WATER_COMBAT": {
    "rateMul": 0.5,
    "hitMul": 0.7,
    "recoil": 18,
    "recoilSecs": 0.35
  },
  "BOSS_CINEMA": {
    "pan": 0.8,
    "back": 0.7,
    "bars": 0.1,
    "zoom": 0.8,
    "maxTime": 16,
    "milkfish": {
      "focusUp": 90,
      "zoom": 1,
      "bars": 0,
      "holdAfter": 0.6
    },
    "gourd": {
      "lead": 1.2,
      "focusDown": 3.5,
      "zoom": 1,
      "bars": 0,
      "holdAfter": 0.3
    },
    "rat": {
      "focusUp": 2,
      "zoom": 1,
      "bars": 0,
      "holdAfter": 0.3
    },
    "moth": {
      "focusUp": 4,
      "zoom": 1,
      "bars": 0,
      "holdAfter": 0.4
    }
  },
  "POOL_MONSTER_FALL": {
    "fallSecs": 0.4,
    "fallLift": 14,
    "fallIn": 44,
    "panicSecs": 1,
    "swimMul": 0.35,
    "dpsPct": 8,
    "sink": 0.38,
    "see": 0.35,
    "bobAmp": 3,
    "bobSpeed": 5,
    "swayAmp": 0.14,
    "swaySpeed": 3.2,
    "splashScale": 1.2,
    "splashGap": 0.35,
    "swimmerMul": 0.7
  }
};
