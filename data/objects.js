/* ===== 障礙物資料（由物件編輯器匯出）===== */
const OBSTACLES = [
  {
    "id": "wirecloth",
    "name": "鐵絲網",
    "cost": 10,
    "hp": 80,
    "h": {
      "file": "images/item-obstacle/01-wirecloth.png",
      "w": 1,
      "h": 1,
      "solid": [
        [
          0,
          0
        ]
      ]
    },
    "v": {
      "file": "images/item-obstacle/01-wirecloth-vertical.png",
      "w": 1,
      "h": 1,
      "solid": [
        [
          0,
          0
        ]
      ]
    }
  },
  {
    "id": "redroadblocks",
    "name": "紅色路障",
    "cost": 20,
    "hp": 160,
    "h": {
      "file": "images/item-obstacle/02-redroadblocks.png",
      "w": 2,
      "h": 1,
      "solid": [
        [
          0,
          0
        ],
        [
          1,
          0
        ]
      ]
    },
    "v": {
      "file": "images/item-obstacle/02-redroadblocks-vertical.png",
      "w": 1,
      "h": 2,
      "solid": [
        [
          0,
          0
        ],
        [
          0,
          1
        ]
      ]
    }
  },
  {
    "id": "wirefence",
    "name": "鐵圍籬",
    "cost": 35,
    "hp": 300,
    "h": {
      "file": "images/item-obstacle/03-wirefence.png",
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
    },
    "v": {
      "file": "images/item-obstacle/03wire-fence-vertical.png",
      "w": 1,
      "h": 2,
      "solid": [
        [
          0,
          0
        ],
        [
          0,
          1
        ]
      ]
    }
  },
  {
    "id": "roadblocks",
    "name": "路障",
    "cost": 30,
    "hp": 260,
    "h": {
      "file": "images/item-obstacle/04roadblocks.png",
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
    },
    "v": {
      "file": "images/item-obstacle/04-roadblocks - vertical.png",
      "w": 1,
      "h": 2,
      "solid": [
        [
          0,
          0
        ],
        [
          0,
          1
        ]
      ]
    }
  },
  {
    "id": "barricades",
    "name": "拒馬",
    "cost": 45,
    "hp": 420,
    "h": {
      "file": "images/item-obstacle/05-barricades.png",
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
    "v": {
      "file": "images/item-obstacle/05-barricades-vertical.png",
      "w": 1,
      "h": 2,
      "solid": [
        [
          0,
          0
        ],
        [
          0,
          1
        ]
      ]
    }
  },
  {
    "id": "searchlight",
    "name": "探照燈",
    "cost": 40,
    "hp": 220,
    "h": {
      "file": "images/item-obstacle/06-searchlight.png",
      "w": 1,
      "h": 2,
      "solid": [
        [
          0,
          1
        ]
      ]
    },
    "v": {
      "file": "images/item-obstacle/06-searchlight-vertical.png",
      "w": 1,
      "h": 2,
      "solid": [
        [
          0,
          1
        ]
      ]
    }
  }
];
