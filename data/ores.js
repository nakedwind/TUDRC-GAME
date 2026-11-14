/* 異質礦資料（由物件編輯器匯出） */
const ORE_TYPES = {
  "ore_small": {
    "name": "小型異質礦",
    "file": "images/item-obstacle/09-ore-small.png",
    "crystals": 8,
    "shards": 3,
    "glow": 0.22,
    "hp": 9999,
    "w": 1,
    "h": 1,
    "solid": [
      [
        0,
        0
      ]
    ]
  },
  "ore_large": {
    "name": "大型異質礦",
    "file": "images/item-obstacle/10-ore-large.png",
    "crystals": 20,
    "shards": 5,
    "glow": 0.32,
    "hp": 9999,
    "w": 2,
    "h": 2,
    "solid": [
      [
        0,
        1
      ]
    ]
  },
  "ore_rare": {
    "name": "稀有紫晶礦",
    "file": "images/item-obstacle/11-ore-rare.png",
    "crystals": 50,
    "shards": 8,
    "glow": 0.55,
    "hp": 9999,
    "w": 2,
    "h": 3,
    "solid": [
      [
        0,
        2
      ],
      [
        1,
        2
      ]
    ]
  },
  "ore_coal": {
    "name": "煤礦",
    "file": "images/item-obstacle/15-ore-coal.png",
    "crystals": 0,
    "shards": 0,
    "glow": 0,
    "hp": 9999,
    "blasts": 3,
    "w": 4,
    "h": 3,
    "solid": [
      [
        0,
        2
      ],
      [
        1,
        2
      ],
      [
        2,
        2
      ],
      [
        3,
        2
      ]
    ]
  },
  "ore_tin": {
    "name": "錫礦",
    "file": "images/item-obstacle/16-ore-tin.png",
    "crystals": 0,
    "shards": 0,
    "glow": 0,
    "hp": 9999,
    "blasts": 3,
    "w": 6,
    "h": 6,
    "solid": [
      [
        1,
        3
      ],
      [
        2,
        3
      ],
      [
        3,
        3
      ],
      [
        4,
        3
      ],
      [
        1,
        4
      ],
      [
        2,
        4
      ],
      [
        3,
        4
      ],
      [
        4,
        4
      ],
      [
        0,
        5
      ],
      [
        1,
        5
      ],
      [
        2,
        5
      ],
      [
        3,
        5
      ],
      [
        4,
        5
      ],
      [
        5,
        5
      ]
    ]
  },
  "ore_limestone": {
    "name": "石灰岩",
    "file": "images/item-obstacle/17-ore-limestone.png",
    "crystals": 0,
    "shards": 0,
    "glow": 0,
    "hp": 9999,
    "blasts": 2,
    "w": 4,
    "h": 4,
    "solid": [
      [
        1,
        2
      ],
      [
        2,
        2
      ],
      [
        3,
        2
      ],
      [
        0,
        3
      ],
      [
        1,
        3
      ],
      [
        2,
        3
      ],
      [
        3,
        3
      ]
    ]
  },
  "ore_manganese": {
    "name": "錳礦",
    "file": "images/item-obstacle/18-ore-manganese.png",
    "crystals": 0,
    "shards": 0,
    "glow": 0,
    "hp": 9999,
    "blasts": 4,
    "w": 4,
    "h": 4,
    "solid": [
      [
        1,
        2
      ],
      [
        2,
        2
      ],
      [
        3,
        2
      ],
      [
        0,
        3
      ],
      [
        1,
        3
      ],
      [
        2,
        3
      ],
      [
        3,
        3
      ]
    ]
  }
};
