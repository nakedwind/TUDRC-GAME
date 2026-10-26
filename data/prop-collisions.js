/* 地圖物件自帶的行走碰撞（販賣機、營地的箱子）：由物件編輯器匯出。
   tile＝地圖上放的素材 id；h.solid＝從圖片左上角算，哪幾格擋路（[第幾欄, 第幾列]）。左右、上下翻轉的物件會跟著翻。 */
const PROP_COLLISIONS = [
  {
    "id": "prop-vending-red",
    "name": "紅色販賣機",
    "tile": "tile_new_decor_vending_red",
    "cost": 0,
    "hp": 0,
    "h": {
      "file": "images/scene-props/vending-machine-red.png",
      "w": 2,
      "h": 2,
      "solid": [
        [
          0,
          1
        ]
      ]
    }
  },
  {
    "id": "prop-vending-green",
    "name": "綠色販賣機",
    "tile": "tile_new_decor_vending_green",
    "cost": 0,
    "hp": 0,
    "h": {
      "file": "images/scene-props/vending-machine-green.png",
      "w": 2,
      "h": 2,
      "solid": [
        [
          0,
          1
        ]
      ]
    }
  },
  {
    "id": "prop-vending-purple",
    "name": "後室販賣機（紫）",
    "tile": "tile_mvnn2p1x",
    "cost": 0,
    "hp": 0,
    "h": {
      "file": "images/scene-props/vending-machine-purple.png",
      "w": 2,
      "h": 2,
      "solid": [
        [
          0,
          1
        ]
      ]
    }
  },
  {
    "id": "prop-supply-box",
    "name": "物資箱",
    "tile": "tile_field_supply_box",
    "cost": 0,
    "hp": 0,
    "h": {
      "file": "images/field-camp/field-base-01.png",
      "w": 2,
      "h": 2,
      "solid": [
        [
          0,
          1
        ]
      ]
    }
  },
  {
    "id": "prop-ammo-refill",
    "name": "補彈藥箱（營地）",
    "tile": "tile_field_ammo_crate_open",
    "cost": 0,
    "hp": 0,
    "h": {
      "file": "images/field-camp/ammo-crate-open.png",
      "w": 2,
      "h": 2,
      "solid": [
        [
          0,
          1
        ]
      ]
    }
  },
  {
    "id": "prop-ammo-crate",
    "name": "彈藥箱（可打開）",
    "tile": "tile_field_ammo_crate",
    "cost": 0,
    "hp": 0,
    "h": {
      "file": "images/field-camp/ammo-crate.png",
      "w": 1,
      "h": 2,
      "solid": [
        [
          0,
          1
        ]
      ]
    }
  },
  {
    "id": "prop-ammo-crate-empty",
    "name": "彈藥箱（空）",
    "tile": "tile_field_ammo_crate_empty",
    "cost": 0,
    "hp": 0,
    "h": {
      "file": "images/field-camp/ammo-crate_empty.png",
      "w": 1,
      "h": 2,
      "solid": [
        [
          0,
          1
        ]
      ]
    }
  },
  {
    "id": "prop-armor-chest",
    "name": "裝備箱",
    "tile": "tile_mvma4ws7",
    "cost": 0,
    "hp": 0,
    "h": {
      "file": "images/field-camp/ammo-crate02.png",
      "w": 2,
      "h": 2,
      "solid": [
        [
          0,
          1
        ],
        [
          1,
          1
        ]
      ]
    }
  }
];
