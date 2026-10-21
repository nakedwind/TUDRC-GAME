/* 由服裝編輯器匯出：配件戴在每個角色身上的位置（配件、角色清單在 data/costumes.js）。
   anchors[角色][欄位][方向]＝這個角色每個欄位的預設位置（新配件沒調過就用這個）
   items[配件][角色][方向]＝某個配件專屬的位置（優先）
     x、y＝配件中心在角色圖（64×64）的位置；scale＝縮放；rot＝旋轉（度）；behind＝畫在角色後面；hidden＝這個方向不畫；flip＝圖片左右翻轉
   bob[角色][方向]＝[走路第 1 張, 走路第 2 張] 頭部相對站立圖的位移 [dx, dy]（配件跟著晃） */
const COSTUME_PLACEMENT_DEFAULT = {
  "anchors": {
    "winter": {
      "head": {
        "front": {"x":43,"y":10},
        "back": {"x":22,"y":10},
        "left": {"x":43,"y":9},
        "right": {"x":22.5,"y":9}
      }
    },
    "theonie": {
      "head": {
        "front": {"x":40,"y":17},
        "back": {"x":23,"y":17},
        "left": {"x":40,"y":16},
        "right": {"x":25,"y":16}
      }
    },
    "amber": {
      "head": {
        "front": {"x":38,"y":8},
        "back": {"x":25,"y":8},
        "left": {"x":39,"y":7},
        "right": {"x":25,"y":7}
      }
    },
    "red": {
      "head": {
        "front": {"x":39,"y":6},
        "back": {"x":24,"y":6},
        "left": {"x":41,"y":5},
        "right": {"x":24,"y":5}
      }
    },
    "avaren": {
      "head": {
        "front": {"x":41,"y":8},
        "back": {"x":21,"y":8},
        "left": {"x":40,"y":7},
        "right": {"x":24,"y":7}
      }
    },
    "luther": {
      "head": {
        "front": {"x":41,"y":9},
        "back": {"x":22,"y":9},
        "left": {"x":40,"y":8},
        "right": {"x":24,"y":8}
      }
    },
    "eldrin": {
      "head": {
        "front": {"x":42,"y":8},
        "back": {"x":20,"y":8},
        "left": {"x":40,"y":7},
        "right": {"x":21,"y":7}
      }
    },
    "chris": {
      "head": {
        "front": {"x":38,"y":8},
        "back": {"x":27,"y":6},
        "left": {"x":41,"y":5},
        "right": {"x":24,"y":5}
      }
    },
    "tino": {
      "head": {
        "front": {"x":42,"y":9},
        "back": {"x":21,"y":9},
        "left": {"x":41,"y":8},
        "right": {"x":24,"y":8}
      }
    },
    "claire": {
      "head": {
        "front": {"x":41,"y":12},
        "back": {"x":22,"y":12},
        "left": {"x":41,"y":11},
        "right": {"x":24,"y":11}
      }
    },
    "muomn": {
      "head": {
        "front": {"x":39,"y":7},
        "back": {"x":24,"y":7},
        "left": {"x":40,"y":8},
        "right": {"x":25,"y":8}
      }
    },
    "noah": {
      "head": {
        "front": {"x":43,"y":10},
        "back": {"x":20,"y":10},
        "left": {"x":40,"y":9},
        "right": {"x":24,"y":9}
      }
    },
    "ash": {
      "head": {
        "front": {"x":43,"y":9},
        "back": {"x":21,"y":9},
        "left": {"x":41,"y":8},
        "right": {"x":24,"y":8}
      }
    },
    "eden": {
      "head": {
        "front": {"x":44,"y":8},
        "back": {"x":19,"y":8},
        "left": {"x":43,"y":7},
        "right": {"x":21,"y":7}
      }
    },
    "salem": {
      "head": {
        "front": {"x":43,"y":10},
        "back": {"x":20,"y":10},
        "left": {"x":40,"y":8},
        "right": {"x":25,"y":8}
      }
    },
    "taana": {
      "head": {
        "front": {"x":42,"y":10},
        "back": {"x":22,"y":10},
        "left": {"x":42,"y":9},
        "right": {"x":23,"y":9}
      }
    },
    "colyn": {
      "head": {
        "front": {"x":39,"y":7},
        "back": {"x":24,"y":7},
        "left": {"x":40,"y":6},
        "right": {"x":24,"y":6}
      }
    },
    "rowan": {
      "head": {
        "front": {"x":41,"y":7},
        "back": {"x":22,"y":7},
        "left": {"x":39,"y":7},
        "right": {"x":25,"y":6}
      }
    },
    "cael": {
      "head": {
        "front": {"x":41,"y":6},
        "back": {"x":22,"y":6},
        "left": {"x":41,"y":5},
        "right": {"x":24,"y":5}
      }
    },
    "saku": {
      "head": {
        "front": {"x":43,"y":9},
        "back": {"x":20,"y":9},
        "left": {"x":42,"y":7},
        "right": {"x":23,"y":7}
      }
    },
    "kakuma": {
      "head": {
        "front": {"x":44,"y":9},
        "back": {"x":19,"y":9},
        "left": {"x":40,"y":8},
        "right": {"x":24,"y":8}
      }
    },
    "ball": {
      "head": {
        "front": {"x":22,"y":36,"scale":0.8},
        "left": {"x":20,"y":27,"scale":0.8},
        "back": {"x":20,"y":27,"scale":0.8},
        "right": {"x":44,"y":27,"scale":0.8}
      }
    }
  },
  "items": {
    "bow-red": {
      "winter": {
        "front": {"x":18.5,"y":10},
        "left": {"x":20.5,"y":9.5,"behind":true},
        "right": {"x":28.5,"y":11},
        "back": {"x":47.5,"y":9.5,"rot":-1,"flip":true,"behind":true}
      },
      "red": {
        "front": {"x":18.5,"y":10},
        "left": {"x":20.5,"y":9.5,"behind":true},
        "right": {"x":32,"y":10.5},
        "back": {"x":48,"y":11,"rot":-1,"flip":true,"behind":true}
      },
      "theonie": {
        "front": {"x":18.5,"y":15},
        "left": {"x":20,"y":13.5,"behind":true},
        "right": {"x":26.5,"y":17.5},
        "back": {"x":45.5,"y":15.5,"rot":-1,"flip":true,"behind":true}
      },
      "amber": {
        "front": {"x":19,"y":16},
        "left": {"x":19,"y":11,"behind":true},
        "right": {"x":30.5,"y":14},
        "back": {"x":48.5,"y":13,"rot":-1,"flip":true,"behind":true}
      },
      "avaren": {
        "front": {"x":18.5,"y":10},
        "left": {"x":20.5,"y":9.5,"behind":true},
        "right": {"x":32,"y":10.5},
        "back": {"x":47.5,"y":9.5,"rot":-1,"flip":true,"behind":true}
      },
      "luther": {
        "front": {"x":18.5,"y":10},
        "left": {"x":20.5,"y":9.5,"behind":true},
        "right": {"x":32,"y":10.5},
        "back": {"x":47.5,"y":9.5,"rot":-1,"flip":true,"behind":true}
      },
      "eldrin": {
        "front": {"x":18.5,"y":10},
        "left": {"x":20.5,"y":9.5,"behind":true},
        "right": {"x":32,"y":10.5},
        "back": {"x":47.5,"y":9.5,"rot":-1,"flip":true,"behind":true}
      },
      "chris": {
        "front": {"x":20,"y":12},
        "left": {"x":20.5,"y":9.5,"behind":true},
        "right": {"x":30.5,"y":13.5},
        "back": {"x":46,"y":10,"rot":-1,"flip":true,"behind":true}
      },
      "tino": {
        "front": {"x":18.5,"y":10},
        "left": {"x":20.5,"y":9.5,"behind":true},
        "right": {"x":31.5,"y":13},
        "back": {"x":47.5,"y":9.5,"rot":-1,"flip":true,"behind":true}
      },
      "claire": {
        "front": {"x":20,"y":11},
        "left": {"x":20.5,"y":9.5,"behind":true},
        "right": {"x":32,"y":10.5},
        "back": {"x":47.5,"y":9.5,"rot":-1,"flip":true,"behind":true}
      },
      "muomn": {
        "front": {"x":18.5,"y":10},
        "left": {"x":20.5,"y":9.5,"behind":true},
        "right": {"x":30.5,"y":11},
        "back": {"x":47.5,"y":9.5,"rot":-1,"flip":true,"behind":true}
      },
      "noah": {
        "front": {"x":18.5,"y":10},
        "left": {"x":20.5,"y":9.5,"behind":true},
        "right": {"x":32,"y":10.5},
        "back": {"x":47.5,"y":9.5,"rot":-1,"flip":true,"behind":true}
      },
      "ash": {
        "front": {"x":18.5,"y":10},
        "left": {"x":20.5,"y":9.5,"behind":true},
        "right": {"x":32,"y":10.5},
        "back": {"x":47.5,"y":9.5,"rot":-1,"flip":true,"behind":true}
      },
      "eden": {
        "front": {"x":18.5,"y":10},
        "left": {"x":20.5,"y":9.5,"behind":true},
        "right": {"x":32,"y":10.5},
        "back": {"x":47.5,"y":9.5,"rot":-1,"flip":true,"behind":true}
      },
      "salem": {
        "front": {"x":18.5,"y":10},
        "left": {"x":20.5,"y":9.5,"behind":true},
        "right": {"x":32,"y":10.5},
        "back": {"x":47.5,"y":9.5,"rot":-1,"flip":true,"behind":true}
      },
      "ball": {
        "front": {"x":20.5,"y":29.5,"flip":true},
        "left": {"x":21.5,"y":28.5,"behind":true,"flip":true},
        "right": {"x":43.5,"y":29,"behind":true},
        "back": {"x":20,"y":29.5,"rot":-1,"flip":true,"behind":true}
      },
      "taana": {
        "front": {"x":18.5,"y":10},
        "left": {"x":20.5,"y":9.5,"behind":true},
        "right": {"x":32,"y":10.5},
        "back": {"x":47.5,"y":9.5,"rot":-1,"flip":true,"behind":true}
      },
      "colyn": {
        "front": {"x":18.5,"y":10},
        "left": {"x":20.5,"y":9.5,"behind":true},
        "right": {"x":32,"y":10.5},
        "back": {"x":47.5,"y":9.5,"rot":-1,"flip":true,"behind":true}
      },
      "rowan": {
        "front": {"x":18.5,"y":10},
        "left": {"x":20.5,"y":9.5,"behind":true},
        "right": {"x":32,"y":10.5},
        "back": {"x":47.5,"y":9.5,"rot":-1,"flip":true,"behind":true}
      },
      "cael": {
        "front": {"x":18.5,"y":10},
        "left": {"x":20.5,"y":9.5,"behind":true},
        "right": {"x":32,"y":10.5},
        "back": {"x":47.5,"y":9.5,"rot":-1,"flip":true,"behind":true}
      },
      "saku": {
        "front": {"x":18.5,"y":10},
        "left": {"x":20.5,"y":9.5,"behind":true},
        "right": {"x":32,"y":10.5},
        "back": {"x":47.5,"y":9.5,"rot":-1,"flip":true,"behind":true}
      },
      "kakuma": {
        "front": {"x":18.5,"y":10},
        "left": {"x":20.5,"y":9.5,"behind":true},
        "right": {"x":32,"y":10.5},
        "back": {"x":47.5,"y":9.5,"rot":-1,"flip":true,"behind":true}
      }
    },
    "glasses-round": {
      "winter": {
        "right": {"x":47,"y":38},
        "left": {"x":18,"y":38},
        "front": {"x":32,"y":39,"scale":1.2}
      }
    },
    "bird-green": {
      "winter": {
        "front": {"x":32,"y":-1.5},
        "back": {"x":32,"y":1.5},
        "left": {"x":35,"y":0},
        "right": {"x":31.5,"y":0.5}
      },
      "theonie": {
        "front": {"x":32,"y":8},
        "back": {"x":32,"y":8},
        "left": {"x":31,"y":9},
        "right": {"x":34,"y":9}
      },
      "amber": {
        "front": {"x":31.5,"y":4},
        "back": {"x":31.5,"y":5},
        "left": {"x":31.5,"y":3.5},
        "right": {"x":34,"y":3.5}
      },
      "red": {
        "front": {"x":36.5,"y":4},
        "back": {"x":32,"y":6.5},
        "left": {"x":33,"y":3.5},
        "right": {"x":29,"y":6}
      },
      "avaren": {
        "front": {"x":35,"y":1},
        "back": {"x":32.5,"y":3},
        "left": {"x":34.5,"y":2},
        "right": {"x":31,"y":2.5}
      },
      "luther": {
        "front": {"x":31,"y":0},
        "back": {"x":32,"y":0},
        "left": {"x":31,"y":1},
        "right": {"x":32.5,"y":2.5}
      },
      "eldrin": {
        "front": {"x":31.5,"y":1.5},
        "back": {"x":30.5,"y":5},
        "left": {"x":32,"y":2},
        "right": {"x":30,"y":2.5}
      },
      "chris": {
        "front": {"x":34.5,"y":4.5},
        "back": {"x":32,"y":6.5},
        "left": {"x":35,"y":4},
        "right": {"x":33.5,"y":4}
      },
      "tino": {
        "front": {"x":33,"y":0},
        "back": {"x":32,"y":0},
        "left": {"x":32,"y":1},
        "right": {"x":33,"y":1}
      },
      "claire": {
        "front": {"x":32,"y":3},
        "back": {"x":32,"y":3},
        "left": {"x":32,"y":4},
        "right": {"x":33,"y":4}
      },
      "muomn": {
        "front": {"x":32.5,"y":0},
        "back": {"x":32,"y":3},
        "left": {"x":32,"y":2},
        "right": {"x":33.5,"y":2.5}
      },
      "noah": {
        "front": {"x":31.5,"y":1},
        "back": {"x":32,"y":3.5},
        "left": {"x":34.5,"y":2},
        "right": {"x":31,"y":2}
      },
      "ash": {
        "front": {"x":32,"y":0},
        "back": {"x":32,"y":3.5},
        "left": {"x":32,"y":1},
        "right": {"x":33,"y":1}
      },
      "eden": {
        "front": {"x":31.5,"y":1},
        "back": {"x":32,"y":3.5},
        "left": {"x":34,"y":0},
        "right": {"x":31,"y":0.5}
      },
      "salem": {
        "front": {"x":33,"y":1},
        "back": {"x":31.5,"y":3.5},
        "left": {"x":31,"y":1},
        "right": {"x":34,"y":1}
      },
      "taana": {
        "front": {"x":32,"y":1},
        "back": {"x":31.5,"y":5},
        "left": {"x":33,"y":2},
        "right": {"x":32,"y":2}
      },
      "colyn": {
        "front": {"x":32.5,"y":2},
        "back": {"x":30.5,"y":5},
        "left": {"x":32.5,"y":2.5},
        "right": {"x":31.5,"y":2}
      },
      "rowan": {
        "front": {"x":32,"y":-0.5},
        "back": {"x":32.5,"y":2.5},
        "left": {"x":31,"y":1},
        "right": {"x":33,"y":1}
      },
      "cael": {
        "front": {"x":33.5,"y":-0.5},
        "back": {"x":33.5,"y":3.5},
        "left": {"x":33,"y":0},
        "right": {"x":32.5,"y":-0.5}
      },
      "saku": {
        "front": {"x":32,"y":0},
        "back": {"x":31.5,"y":3.5},
        "left": {"x":35.5,"y":0},
        "right": {"x":31.5,"y":0}
      },
      "kakuma": {
        "front": {"x":32,"y":0},
        "back": {"x":33,"y":3.5},
        "left": {"x":31,"y":1},
        "right": {"x":33,"y":1}
      },
      "ball": {
        "front": {"x":31,"y":33.5},
        "left": {"x":16,"y":25.5},
        "back": {"x":28.5,"y":34},
        "right": {"x":47,"y":26}
      }
    },
    "bow-blue": {
      "winter": {
        "front": {"x":18.5,"y":10},
        "left": {"x":20.5,"y":9.5,"behind":true},
        "right": {"x":32,"y":10.5},
        "back": {"x":47.5,"y":9.5,"rot":-1,"flip":true,"behind":true}
      },
      "red": {
        "front": {"x":18.5,"y":10},
        "left": {"x":20.5,"y":9.5,"behind":true},
        "right": {"x":32,"y":10.5},
        "back": {"x":47.5,"y":9.5,"rot":-1,"flip":true,"behind":true}
      },
      "theonie": {
        "front": {"x":18.5,"y":15},
        "left": {"x":20,"y":13.5,"behind":true},
        "right": {"x":26.5,"y":17.5},
        "back": {"x":45.5,"y":15.5,"rot":-1,"flip":true,"behind":true}
      },
      "amber": {
        "front": {"x":18.5,"y":10},
        "left": {"x":20.5,"y":9.5,"behind":true},
        "right": {"x":32,"y":10.5},
        "back": {"x":47.5,"y":9.5,"rot":-1,"flip":true,"behind":true}
      },
      "avaren": {
        "front": {"x":18.5,"y":10},
        "left": {"x":20.5,"y":9.5,"behind":true},
        "right": {"x":32,"y":10.5},
        "back": {"x":47.5,"y":9.5,"rot":-1,"flip":true,"behind":true}
      },
      "luther": {
        "front": {"x":18.5,"y":10},
        "left": {"x":20.5,"y":9.5,"behind":true},
        "right": {"x":32,"y":10.5},
        "back": {"x":47.5,"y":9.5,"rot":-1,"flip":true,"behind":true}
      },
      "eldrin": {
        "front": {"x":18.5,"y":10},
        "left": {"x":20.5,"y":9.5,"behind":true},
        "right": {"x":32,"y":10.5},
        "back": {"x":47.5,"y":9.5,"rot":-1,"flip":true,"behind":true}
      },
      "chris": {
        "front": {"x":18.5,"y":10},
        "left": {"x":20.5,"y":9.5,"behind":true},
        "right": {"x":32,"y":10.5},
        "back": {"x":47.5,"y":9.5,"rot":-1,"flip":true,"behind":true}
      },
      "tino": {
        "front": {"x":18.5,"y":10},
        "left": {"x":20.5,"y":9.5,"behind":true},
        "right": {"x":32,"y":10.5},
        "back": {"x":47.5,"y":9.5,"rot":-1,"flip":true,"behind":true}
      },
      "claire": {
        "front": {"x":18.5,"y":10},
        "left": {"x":20.5,"y":9.5,"behind":true},
        "right": {"x":32,"y":10.5},
        "back": {"x":47.5,"y":9.5,"rot":-1,"flip":true,"behind":true}
      },
      "muomn": {
        "front": {"x":18.5,"y":10},
        "left": {"x":20.5,"y":9.5,"behind":true},
        "right": {"x":32,"y":10.5},
        "back": {"x":47.5,"y":9.5,"rot":-1,"flip":true,"behind":true}
      },
      "noah": {
        "front": {"x":18.5,"y":10},
        "left": {"x":20.5,"y":9.5,"behind":true},
        "right": {"x":32,"y":10.5},
        "back": {"x":47.5,"y":9.5,"rot":-1,"flip":true,"behind":true}
      },
      "ash": {
        "front": {"x":18.5,"y":10},
        "left": {"x":20.5,"y":9.5,"behind":true},
        "right": {"x":32,"y":10.5},
        "back": {"x":47.5,"y":9.5,"rot":-1,"flip":true,"behind":true}
      },
      "eden": {
        "front": {"x":18.5,"y":10},
        "left": {"x":20.5,"y":9.5,"behind":true},
        "right": {"x":32,"y":10.5},
        "back": {"x":47.5,"y":9.5,"rot":-1,"flip":true,"behind":true}
      },
      "salem": {
        "front": {"x":18.5,"y":10},
        "left": {"x":20.5,"y":9.5,"behind":true},
        "right": {"x":32,"y":10.5},
        "back": {"x":47.5,"y":9.5,"rot":-1,"flip":true,"behind":true}
      },
      "ball": {
        "front": {"x":18.5,"y":10},
        "left": {"x":20.5,"y":9.5,"behind":true},
        "right": {"x":32,"y":10.5},
        "back": {"x":47.5,"y":9.5,"rot":-1,"flip":true,"behind":true}
      },
      "taana": {
        "front": {"x":18.5,"y":10},
        "left": {"x":20.5,"y":9.5,"behind":true},
        "right": {"x":32,"y":10.5},
        "back": {"x":47.5,"y":9.5,"rot":-1,"flip":true,"behind":true}
      },
      "colyn": {
        "front": {"x":18.5,"y":10},
        "left": {"x":20.5,"y":9.5,"behind":true},
        "right": {"x":32,"y":10.5},
        "back": {"x":47.5,"y":9.5,"rot":-1,"flip":true,"behind":true}
      },
      "rowan": {
        "front": {"x":18.5,"y":10},
        "left": {"x":20.5,"y":9.5,"behind":true},
        "right": {"x":32,"y":10.5},
        "back": {"x":47.5,"y":9.5,"rot":-1,"flip":true,"behind":true}
      },
      "cael": {
        "front": {"x":18.5,"y":10},
        "left": {"x":20.5,"y":9.5,"behind":true},
        "right": {"x":32,"y":10.5},
        "back": {"x":47.5,"y":9.5,"rot":-1,"flip":true,"behind":true}
      },
      "saku": {
        "front": {"x":18.5,"y":10},
        "left": {"x":20.5,"y":9.5,"behind":true},
        "right": {"x":32,"y":10.5},
        "back": {"x":47.5,"y":9.5,"rot":-1,"flip":true,"behind":true}
      },
      "kakuma": {
        "front": {"x":18.5,"y":10},
        "left": {"x":20.5,"y":9.5,"behind":true},
        "right": {"x":32,"y":10.5},
        "back": {"x":47.5,"y":9.5,"rot":-1,"flip":true,"behind":true}
      }
    },
    "bow-white": {
      "winter": {
        "front": {"x":18.5,"y":10},
        "left": {"x":20.5,"y":9.5,"behind":true},
        "right": {"x":32,"y":10.5},
        "back": {"x":47.5,"y":9.5,"rot":-1,"flip":true,"behind":true}
      },
      "red": {
        "front": {"x":18.5,"y":10},
        "left": {"x":20.5,"y":9.5,"behind":true},
        "right": {"x":32,"y":10.5},
        "back": {"x":47.5,"y":9.5,"rot":-1,"flip":true,"behind":true}
      },
      "theonie": {
        "front": {"x":18.5,"y":15},
        "left": {"x":20,"y":13.5,"behind":true},
        "right": {"x":26.5,"y":17.5},
        "back": {"x":45.5,"y":15.5,"rot":-1,"flip":true,"behind":true}
      },
      "amber": {
        "front": {"x":18.5,"y":10},
        "left": {"x":20.5,"y":9.5,"behind":true},
        "right": {"x":32,"y":10.5},
        "back": {"x":47.5,"y":9.5,"rot":-1,"flip":true,"behind":true}
      },
      "avaren": {
        "front": {"x":18.5,"y":10},
        "left": {"x":20.5,"y":9.5,"behind":true},
        "right": {"x":32,"y":10.5},
        "back": {"x":47.5,"y":9.5,"rot":-1,"flip":true,"behind":true}
      },
      "luther": {
        "front": {"x":18.5,"y":10},
        "left": {"x":20.5,"y":9.5,"behind":true},
        "right": {"x":32,"y":10.5},
        "back": {"x":47.5,"y":9.5,"rot":-1,"flip":true,"behind":true}
      },
      "eldrin": {
        "front": {"x":18.5,"y":10},
        "left": {"x":20.5,"y":9.5,"behind":true},
        "right": {"x":32,"y":10.5},
        "back": {"x":47.5,"y":9.5,"rot":-1,"flip":true,"behind":true}
      },
      "chris": {
        "front": {"x":18.5,"y":10},
        "left": {"x":20.5,"y":9.5,"behind":true},
        "right": {"x":32,"y":10.5},
        "back": {"x":47.5,"y":9.5,"rot":-1,"flip":true,"behind":true}
      },
      "tino": {
        "front": {"x":18.5,"y":10},
        "left": {"x":20.5,"y":9.5,"behind":true},
        "right": {"x":32,"y":10.5},
        "back": {"x":47.5,"y":9.5,"rot":-1,"flip":true,"behind":true}
      },
      "claire": {
        "front": {"x":18.5,"y":10},
        "left": {"x":20.5,"y":9.5,"behind":true},
        "right": {"x":32,"y":10.5},
        "back": {"x":47.5,"y":9.5,"rot":-1,"flip":true,"behind":true}
      },
      "muomn": {
        "front": {"x":18.5,"y":10},
        "left": {"x":20.5,"y":9.5,"behind":true},
        "right": {"x":32,"y":10.5},
        "back": {"x":47.5,"y":9.5,"rot":-1,"flip":true,"behind":true}
      },
      "noah": {
        "front": {"x":18.5,"y":10},
        "left": {"x":20.5,"y":9.5,"behind":true},
        "right": {"x":32,"y":10.5},
        "back": {"x":47.5,"y":9.5,"rot":-1,"flip":true,"behind":true}
      },
      "ash": {
        "front": {"x":18.5,"y":10},
        "left": {"x":20.5,"y":9.5,"behind":true},
        "right": {"x":32,"y":10.5},
        "back": {"x":47.5,"y":9.5,"rot":-1,"flip":true,"behind":true}
      },
      "eden": {
        "front": {"x":18.5,"y":10},
        "left": {"x":20.5,"y":9.5,"behind":true},
        "right": {"x":32,"y":10.5},
        "back": {"x":47.5,"y":9.5,"rot":-1,"flip":true,"behind":true}
      },
      "salem": {
        "front": {"x":18.5,"y":10},
        "left": {"x":20.5,"y":9.5,"behind":true},
        "right": {"x":32,"y":10.5},
        "back": {"x":47.5,"y":9.5,"rot":-1,"flip":true,"behind":true}
      },
      "ball": {
        "front": {"x":18.5,"y":10},
        "left": {"x":20.5,"y":9.5,"behind":true},
        "right": {"x":32,"y":10.5},
        "back": {"x":47.5,"y":9.5,"rot":-1,"flip":true,"behind":true}
      },
      "taana": {
        "front": {"x":18.5,"y":10},
        "left": {"x":20.5,"y":9.5,"behind":true},
        "right": {"x":32,"y":10.5},
        "back": {"x":47.5,"y":9.5,"rot":-1,"flip":true,"behind":true}
      },
      "colyn": {
        "front": {"x":18.5,"y":10},
        "left": {"x":20.5,"y":9.5,"behind":true},
        "right": {"x":32,"y":10.5},
        "back": {"x":47.5,"y":9.5,"rot":-1,"flip":true,"behind":true}
      },
      "rowan": {
        "front": {"x":18.5,"y":10},
        "left": {"x":20.5,"y":9.5,"behind":true},
        "right": {"x":32,"y":10.5},
        "back": {"x":47.5,"y":9.5,"rot":-1,"flip":true,"behind":true}
      },
      "cael": {
        "front": {"x":18.5,"y":10},
        "left": {"x":20.5,"y":9.5,"behind":true},
        "right": {"x":32,"y":10.5},
        "back": {"x":47.5,"y":9.5,"rot":-1,"flip":true,"behind":true}
      },
      "saku": {
        "front": {"x":18.5,"y":10},
        "left": {"x":20.5,"y":9.5,"behind":true},
        "right": {"x":32,"y":10.5},
        "back": {"x":47.5,"y":9.5,"rot":-1,"flip":true,"behind":true}
      },
      "kakuma": {
        "front": {"x":18.5,"y":10},
        "left": {"x":20.5,"y":9.5,"behind":true},
        "right": {"x":32,"y":10.5},
        "back": {"x":47.5,"y":9.5,"rot":-1,"flip":true,"behind":true}
      }
    }
  },
  "bob": {
    "winter": {"back":[[0,1],[0,0]],"front":[[0,1],[0,0]],"right":[[0,1],[0,0]],"left":[[0,1],[0,0]]},
    "theonie": {"front":[[0,-1],[0,0]],"left":[[0,-1],[0,0]],"back":[[0,-1],[0,0]],"right":[[0,-1],[0,0]]},
    "amber": {"front":[[0,-1],[0,0]],"left":[[0,-1],[0,0]],"back":[[0,-1],[0,0]],"right":[[0,-1],[0,0]]},
    "avaren": {"front":[[0,0],[0,1]],"left":[[0,0],[0,1]],"back":[[-1,0],[0,0]],"right":[[0,0],[0,1]]},
    "luther": {"back":[[-1,0],[0,0]]},
    "eldrin": {"right":[[1,0],[0,0]]},
    "tino": {"front":[[0,0],[0,1]],"left":[[0,0],[0,1]]},
    "ash": {"back":[[0,0],[0,-1]]},
    "eden": {"front":[[0,0],[0,1]],"left":[[0,0],[0,1]]},
    "salem": {"front":[[0,0],[0,1]],"left":[[0,0],[0,1]]},
    "ball": {"left":[[0,0],[0,1]],"back":[[0,0],[0,1]],"right":[[0,0],[0,1]],"front":[[0,0],[0,1]]},
    "taana": {"back":[[0,1],[0,0]]},
    "colyn": {"front":[[0,0],[0,1]],"left":[[0,0],[0,1]],"right":[[0,0],[0,1]]},
    "rowan": {"back":[[0,1],[0,0]]},
    "cael": {"front":[[0,0],[0,1]],"back":[[0,1],[0,0]]},
    "saku": {"back":[[0,1],[0,0]]},
    "kakuma": {"back":[[-2,0],[-1,0]]}
  }
};
