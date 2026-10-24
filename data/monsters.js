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
    "deathSound": "loofahDeath"
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
    "deathSound": "milkfishDeath"
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
    "noHitSquash": true,
    "knockMul": 0,
    "hitSound": "mouseHurt",
    "deathSound": "mouseDeath"
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
      "idle": [
        "images/monster/clownfish/clownfish-front.png",
        "images/monster/clownfish/clownfish-front-02.png"
      ],
      "idleFps": 1.6,
      "blink": [
        "images/monster/clownfish/clownfish-blink.png"
      ],
      "walkFront": [
        "images/monster/clownfish/clownfish-hop-crouch.png",
        "images/monster/clownfish/clownfish-hop-air.png"
      ]
    },
    "behavior": "clownfish",
    "hitSound": "clownfishHurt",
    "deathSound": "clownfishDeath",
    "knockMul": 0.6,
    "shockResist": 0.6
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
    "knockMul": 1.2
  },
  {
    "id": "golden_banana_king",
    "name": "金蕉王",
    "sprite": "images/monster/golden-banana-king/golden-banana-king-front.png",
    "hp": 150,
    "speed": 30,
    "playerDamage": 0,
    "sentryDamage": 0,
    "buildingDamage": 0,
    "reward": 40,
    "crystals": 5,
    "width": 78,
    "height": 143,
    "frames": {
      "front": "images/monster/golden-banana-king/golden-banana-king-front.png",
      "walkFacing": "left",
      "walkFront": [
        "images/monster/golden-banana-king/golden-banana-king-walk-01.png",
        "images/monster/golden-banana-king/golden-banana-king-walk-02.png",
        "images/monster/golden-banana-king/golden-banana-king-walk-03.png",
        "images/monster/golden-banana-king/golden-banana-king-walk-02.png"
      ]
    },
    "behavior": "healer",
    "hitSound": "bananaHurt",
    "deathSound": "bananaDeath"
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
