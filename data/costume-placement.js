/* 由服裝編輯器匯出：配件戴在每個角色身上的位置（配件、角色清單在 data/costumes.js）。
   anchors[角色][欄位][方向]＝這個角色每個欄位的預設位置（新配件沒調過就用這個）
   items[配件][角色][方向]＝某個配件專屬的位置（優先）
     x、y＝配件中心在角色圖（64×64）的位置；scale＝縮放；rot＝旋轉（度）；behind＝畫在角色後面；hidden＝這個方向不畫；flip＝圖片左右翻轉
   bob[角色][方向]＝[走路第 1 張, 走路第 2 張] 頭部相對站立圖的位移 [dx, dy]（配件跟著晃）
   offsets[角色]＝角色身高偏移 { x, y }（矮的角色 y 填正數）：還沒調過的配件會加上；「複製給所有角色」時自動加上兩個角色偏移的差
   blocked[配件]＝[角色, …]：這些角色不能擁有、不能戴這個配件
   layers[配件]＝圖層：同時戴好幾個配件時數字大的蓋在上面（沒寫＝下身 1、背部 2、手持 3、頭飾 4、臉部 5） */
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
        "front": {"x":15.5,"y":29.5,"scale":0.8},
        "left": {"x":20,"y":27,"scale":0.8},
        "back": {"x":20,"y":27,"scale":0.8},
        "right": {"x":44,"y":27,"scale":0.8}
      }
    }
  },
  "items": {
    "bear-hood": {
      "winter": {
        "front": {"x":32,"y":21},
        "back": {"x":32.5,"y":21.5},
        "left": {"x":37,"y":19.5},
        "right": {"x":29,"y":19.5}
      },
      "theonie": {
        "front": {"x":32,"y":23.5},
        "back": {"x":32,"y":25.5},
        "left": {"x":38,"y":24},
        "right": {"x":29,"y":23}
      },
      "amber": {
        "front": {"x":32.5,"y":23.5},
        "back": {"x":32,"y":23},
        "left": {"x":37.5,"y":20.5},
        "right": {"x":28,"y":21}
      },
      "red": {
        "front": {"x":32,"y":22.5},
        "back": {"x":32,"y":22},
        "left": {"x":35.5,"y":20},
        "right": {"x":29,"y":20}
      },
      "avaren": {
        "front": {"x":32,"y":20.5,"scale":1.05},
        "back": {"x":32.5,"y":21.5},
        "left": {"x":36.5,"y":19.5},
        "right": {"x":30,"y":19.5}
      },
      "luther": {
        "front": {"x":31.5,"y":21.5},
        "back": {"x":32.5,"y":21.5},
        "left": {"x":34,"y":20},
        "right": {"x":29.5,"y":19.5}
      },
      "eldrin": {
        "front": {"x":31,"y":20.5,"scale":1.05},
        "back": {"x":32.5,"y":21.5,"scale":1.05},
        "left": {"x":34.5,"y":19.5},
        "right": {"x":27,"y":19.5}
      },
      "chris": {
        "front": {"x":32,"y":22},
        "back": {"x":32,"y":22.5},
        "left": {"x":34,"y":20},
        "right": {"x":32.5,"y":20.5}
      },
      "tino": {
        "front": {"x":32,"y":22},
        "back": {"x":32,"y":23},
        "left": {"x":30,"y":26},
        "right": {"x":35,"y":26}
      },
      "claire": {
        "front": {"x":32,"y":25},
        "back": {"x":32,"y":26},
        "left": {"x":30,"y":29},
        "right": {"x":35,"y":29}
      },
      "muomn": {
        "front": {"x":32,"y":20},
        "back": {"x":32,"y":21},
        "left": {"x":29,"y":26},
        "right": {"x":36,"y":26}
      },
      "noah": {
        "front": {"x":31,"y":23},
        "back": {"x":32,"y":24},
        "left": {"x":29,"y":27},
        "right": {"x":35,"y":27}
      },
      "ash": {
        "front": {"x":32,"y":22},
        "back": {"x":32,"y":23},
        "left": {"x":30,"y":26},
        "right": {"x":35,"y":26}
      },
      "eden": {
        "front": {"x":33,"y":21},
        "back": {"x":33,"y":22.5},
        "left": {"x":35.5,"y":21},
        "right": {"x":30,"y":21.5}
      },
      "salem": {
        "front": {"x":32,"y":22.5},
        "back": {"x":32.5,"y":21},
        "left": {"x":33,"y":20},
        "right": {"x":29.5,"y":20}
      },
      "taana": {
        "front": {"x":32,"y":20.5},
        "back": {"x":32,"y":20.5},
        "left": {"x":36,"y":19.5},
        "right": {"x":30,"y":18.5}
      },
      "colyn": {
        "front": {"x":32,"y":21.5},
        "back": {"x":32,"y":22},
        "left": {"x":33.5,"y":19.5},
        "right": {"x":29.5,"y":18.5}
      },
      "rowan": {
        "front": {"x":32,"y":20},
        "back": {"x":32,"y":21},
        "left": {"x":28,"y":25},
        "right": {"x":36,"y":24}
      },
      "cael": {
        "front": {"x":31,"y":19},
        "back": {"x":32,"y":20},
        "left": {"x":30,"y":23},
        "right": {"x":35,"y":23}
      },
      "saku": {
        "front": {"x":32,"y":22},
        "back": {"x":31,"y":23},
        "left": {"x":31,"y":25},
        "right": {"x":34,"y":25}
      },
      "kakuma": {
        "front": {"x":32,"y":22},
        "back": {"x":32,"y":23},
        "left": {"x":29,"y":26},
        "right": {"x":29.5,"y":20}
      },
      "ball": {
        "front": {"x":21,"y":41,"scale":0.45},
        "left": {"x":15,"y":32,"scale":0.45},
        "back": {"x":15,"y":32,"scale":0.45},
        "right": {"x":49,"y":32,"scale":0.45}
      }
    },
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
        "right": {"x":43.5,"y":29,"behind":true,"scale":1.05},
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
        "front": {"x":32,"y":-1.5,"scale":1.2},
        "back": {"x":32,"y":1.5,"scale":1.2},
        "left": {"x":35,"y":0,"scale":1.2},
        "right": {"x":31.5,"y":0.5,"scale":1.2}
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
        "front": {"x":37,"y":4,"scale":1.2},
        "back": {"x":32,"y":6.5,"scale":1.2},
        "left": {"x":33,"y":3.5,"scale":1.2},
        "right": {"x":29,"y":6,"scale":1.2}
      },
      "avaren": {
        "front": {"x":35,"y":1,"scale":1.2},
        "back": {"x":32.5,"y":3,"scale":1.2},
        "left": {"x":34.5,"y":2,"scale":1.2},
        "right": {"x":31,"y":2.5,"scale":1.4}
      },
      "luther": {
        "front": {"x":31,"y":0},
        "back": {"x":32,"y":0},
        "left": {"x":31,"y":1},
        "right": {"x":32.5,"y":2.5}
      },
      "eldrin": {
        "front": {"x":31.5,"y":1.5,"scale":1.2},
        "back": {"x":30.5,"y":5,"scale":1.2},
        "left": {"x":32,"y":2,"scale":1.2},
        "right": {"x":30,"y":2.5,"scale":1.2}
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
        "front": {"x":20,"y":30,"flip":true},
        "left": {"x":20,"y":30,"flip":true},
        "right": {"x":44,"y":31},
        "back": {"x":20,"y":30,"rot":-1,"flip":true}
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
        "front": {"x":20,"y":30,"flip":true},
        "left": {"x":20,"y":30,"flip":true},
        "right": {"x":44,"y":30},
        "back": {"x":20,"y":30,"rot":-1,"flip":true}
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
    "large-bow-red": {
      "winter": {
        "front": {"x":32,"y":9},
        "left": {"x":30,"y":6},
        "back": {"x":31.5,"y":6.5,"behind":true},
        "right": {"x":34,"y":6}
      },
      "theonie": {
        "front": {"x":32,"y":12.5},
        "left": {"x":29,"y":13},
        "back": {"x":32,"y":13,"behind":true},
        "right": {"x":35,"y":13}
      },
      "amber": {
        "front": {"x":32,"y":10},
        "left": {"x":30.5,"y":9},
        "back": {"x":32,"y":9.5,"behind":true},
        "right": {"x":34.5,"y":8.5}
      },
      "red": {
        "front": {"x":32,"y":9},
        "left": {"x":30,"y":6},
        "back": {"x":31.5,"y":6.5,"behind":true},
        "right": {"x":34,"y":6}
      },
      "avaren": {
        "front": {"x":32,"y":9},
        "left": {"x":30,"y":6},
        "back": {"x":31.5,"y":6.5,"behind":true},
        "right": {"x":34,"y":6}
      },
      "luther": {
        "front": {"x":32,"y":9},
        "left": {"x":30,"y":6},
        "back": {"x":31.5,"y":6.5,"behind":true},
        "right": {"x":34,"y":6}
      },
      "eldrin": {
        "front": {"x":31,"y":8.5},
        "left": {"x":30,"y":6},
        "back": {"x":31.5,"y":6.5,"behind":true},
        "right": {"x":34,"y":6}
      },
      "chris": {
        "front": {"x":32,"y":9},
        "left": {"x":30,"y":6},
        "back": {"x":31.5,"y":6.5,"behind":true},
        "right": {"x":34,"y":6}
      },
      "tino": {
        "front": {"x":32,"y":9},
        "left": {"x":30,"y":6},
        "back": {"x":31.5,"y":6.5,"behind":true},
        "right": {"x":34,"y":6}
      },
      "claire": {
        "front": {"x":32,"y":9},
        "left": {"x":30,"y":6},
        "back": {"x":31.5,"y":6.5,"behind":true},
        "right": {"x":34,"y":6}
      },
      "muomn": {
        "front": {"x":32,"y":9},
        "left": {"x":30,"y":6},
        "back": {"x":31.5,"y":6.5,"behind":true},
        "right": {"x":34,"y":6}
      },
      "noah": {
        "front": {"x":32,"y":9},
        "left": {"x":30,"y":6},
        "back": {"x":31.5,"y":6.5,"behind":true},
        "right": {"x":34,"y":6}
      },
      "ash": {
        "front": {"x":32,"y":9},
        "left": {"x":30,"y":6},
        "back": {"x":31.5,"y":6.5,"behind":true},
        "right": {"x":34,"y":6}
      },
      "eden": {
        "front": {"x":32,"y":9},
        "left": {"x":30,"y":6},
        "back": {"x":31.5,"y":6.5,"behind":true},
        "right": {"x":34,"y":6}
      },
      "salem": {
        "front": {"x":32,"y":9},
        "left": {"x":30,"y":6},
        "back": {"x":31.5,"y":6.5,"behind":true},
        "right": {"x":34,"y":6}
      },
      "ball": {
        "front": {"x":32,"y":39.5},
        "left": {"x":30,"y":6},
        "back": {"x":31.5,"y":6.5,"behind":true},
        "right": {"x":34,"y":6}
      },
      "taana": {
        "front": {"x":32,"y":9},
        "left": {"x":30,"y":6},
        "back": {"x":31.5,"y":6.5,"behind":true},
        "right": {"x":34,"y":6}
      },
      "colyn": {
        "front": {"x":32,"y":9},
        "left": {"x":30,"y":6},
        "back": {"x":31.5,"y":6.5,"behind":true},
        "right": {"x":34,"y":6}
      },
      "rowan": {
        "front": {"x":32,"y":9},
        "left": {"x":30,"y":6},
        "back": {"x":31.5,"y":6.5,"behind":true},
        "right": {"x":34,"y":6}
      },
      "cael": {
        "front": {"x":32,"y":9},
        "left": {"x":30,"y":6},
        "back": {"x":31.5,"y":6.5,"behind":true},
        "right": {"x":34,"y":6}
      },
      "saku": {
        "front": {"x":32,"y":9},
        "left": {"x":30,"y":6},
        "back": {"x":31.5,"y":6.5,"behind":true},
        "right": {"x":34,"y":6}
      },
      "kakuma": {
        "front": {"x":32,"y":9},
        "left": {"x":30,"y":6},
        "back": {"x":31.5,"y":6.5,"behind":true},
        "right": {"x":34,"y":6}
      }
    },
    "round-glasses": {
      "winter": {
        "front": {"x":32,"y":35.5},
        "left": {"x":26.5,"y":36.5},
        "right": {"x":38.5,"y":36}
      },
      "theonie": {
        "front": {"x":32,"y":37},
        "left": {"x":26.5,"y":38},
        "right": {"x":38.5,"y":37.5}
      },
      "amber": {
        "front": {"x":32,"y":37},
        "left": {"x":26.5,"y":36.5},
        "right": {"x":37.5,"y":36.5}
      },
      "red": {
        "front": {"x":32,"y":36},
        "left": {"x":26.5,"y":36.5},
        "right": {"x":38.5,"y":36}
      },
      "avaren": {
        "front": {"x":32,"y":36},
        "left": {"x":26.5,"y":36.5},
        "right": {"x":38.5,"y":36}
      },
      "luther": {
        "front": {"x":32,"y":36.5},
        "left": {"x":26.5,"y":36.5},
        "right": {"x":38.5,"y":36}
      },
      "eldrin": {
        "front": {"x":31,"y":36},
        "left": {"x":23.5,"y":36.5},
        "right": {"x":39.5,"y":36}
      },
      "chris": {
        "front": {"x":32,"y":35.5},
        "left": {"x":23,"y":35.5},
        "right": {"x":42.5,"y":36}
      },
      "tino": {
        "front": {"x":32,"y":36.5},
        "left": {"x":25.5,"y":36.5},
        "right": {"x":39.5,"y":36}
      },
      "claire": {
        "front": {"x":32,"y":35.5},
        "left": {"x":24,"y":34.5},
        "right": {"x":40,"y":35}
      },
      "muomn": {
        "front": {"x":32,"y":35.5},
        "left": {"x":24.5,"y":36.5},
        "right": {"x":40.5,"y":36}
      },
      "noah": {
        "front": {"x":32,"y":11.5},
        "left": {"x":26,"y":13.5,"rot":30},
        "right": {"x":38,"y":13.5,"rot":-30}
      },
      "ash": {
        "front": {"x":32,"y":36},
        "left": {"x":26.5,"y":36.5},
        "right": {"x":38.5,"y":36}
      },
      "eden": {
        "front": {"x":32,"y":35.5},
        "left": {"x":26.5,"y":36.5},
        "right": {"x":38.5,"y":36}
      },
      "salem": {
        "front": {"x":32,"y":36.5},
        "left": {"x":26.5,"y":36.5},
        "right": {"x":38.5,"y":36}
      },
      "ball": {
        "front": {"x":32,"y":35.5},
        "left": {"x":26.5,"y":36.5},
        "right": {"x":38.5,"y":36}
      },
      "taana": {
        "front": {"x":32,"y":35.5},
        "left": {"x":26.5,"y":36.5},
        "right": {"x":38.5,"y":36}
      },
      "colyn": {
        "front": {"x":32,"y":35.5},
        "left": {"x":26.5,"y":36.5},
        "right": {"x":38.5,"y":36}
      },
      "rowan": {
        "front": {"x":32,"y":34.5},
        "left": {"x":26.5,"y":36.5},
        "right": {"x":38.5,"y":36}
      },
      "cael": {
        "front": {"x":32,"y":34.5},
        "left": {"x":26.5,"y":36.5},
        "right": {"x":38.5,"y":36}
      },
      "saku": {
        "front": {"x":32,"y":34.5},
        "left": {"x":26.5,"y":36.5},
        "right": {"x":38.5,"y":36}
      },
      "kakuma": {
        "front": {"x":32,"y":35.5},
        "left": {"x":26.5,"y":36.5},
        "right": {"x":38.5,"y":36}
      }
    },
    "sunglasses": {
      "winter": {
        "right": {"x":39,"y":36},
        "left": {"x":27,"y":36.5},
        "front": {"x":32,"y":36}
      },
      "theonie": {
        "right": {"x":40,"y":37},
        "left": {"x":26,"y":37.5},
        "front": {"x":32,"y":38}
      },
      "amber": {
        "right": {"x":39,"y":36},
        "left": {"x":27,"y":35.5},
        "front": {"x":32,"y":37}
      },
      "red": {
        "right": {"x":39,"y":36},
        "left": {"x":27,"y":35.5},
        "front": {"x":32,"y":37}
      },
      "avaren": {
        "right": {"x":40,"y":36},
        "left": {"x":25,"y":36.5},
        "front": {"x":32,"y":37}
      },
      "luther": {
        "right": {"x":40,"y":36},
        "left": {"x":24,"y":36.5},
        "front": {"x":32,"y":37}
      },
      "eldrin": {
        "right": {"x":40,"y":36},
        "left": {"x":24,"y":36.5},
        "front": {"x":31,"y":37}
      },
      "chris": {
        "right": {"x":42,"y":36},
        "left": {"x":24,"y":35.5},
        "front": {"x":32,"y":36}
      },
      "tino": {
        "right": {"x":39,"y":37},
        "left": {"x":26,"y":36.5},
        "front": {"x":32,"y":37}
      },
      "claire": {
        "right": {"x":39,"y":36},
        "left": {"x":24,"y":35.5},
        "front": {"x":32,"y":36}
      },
      "muomn": {
        "right": {"x":41,"y":36},
        "left": {"x":24,"y":36.5},
        "front": {"x":32,"y":36}
      },
      "noah": {
        "right": {"x":39.5,"y":13.5,"rot":-30},
        "left": {"x":24.5,"y":13.5,"rot":30},
        "front": {"x":31.5,"y":11.5}
      },
      "ash": {
        "right": {"x":39,"y":36},
        "left": {"x":27,"y":36.5},
        "front": {"x":32,"y":36}
      },
      "eden": {
        "right": {"x":39,"y":36},
        "left": {"x":25.5,"y":36},
        "front": {"x":32,"y":36}
      },
      "salem": {
        "right": {"x":39,"y":36},
        "left": {"x":27,"y":36.5},
        "front": {"x":32,"y":36}
      },
      "ball": {
        "right": {"x":39,"y":36},
        "left": {"x":27,"y":36.5},
        "front": {"x":32,"y":36}
      },
      "taana": {
        "right": {"x":39,"y":36},
        "left": {"x":27,"y":36.5},
        "front": {"x":32,"y":36}
      },
      "colyn": {
        "right": {"x":40,"y":36},
        "left": {"x":26,"y":36.5},
        "front": {"x":32,"y":36}
      },
      "rowan": {
        "right": {"x":40.5,"y":34.5},
        "left": {"x":27,"y":36.5},
        "front": {"x":32,"y":36}
      },
      "cael": {
        "right": {"x":39,"y":36},
        "left": {"x":27,"y":36.5},
        "front": {"x":32,"y":36}
      },
      "saku": {
        "right": {"x":39,"y":36},
        "left": {"x":27,"y":36.5},
        "front": {"x":32,"y":36}
      },
      "kakuma": {
        "right": {"x":39,"y":36},
        "left": {"x":27,"y":36.5},
        "front": {"x":32,"y":36}
      }
    },
    "flower-hair-clip": {
      "winter": {
        "front": {"x":45,"y":17.5},
        "left": {"x":35.5,"y":17.5},
        "back": {"x":22,"y":10,"hidden":true},
        "right": {"x":28.5,"y":17.5,"flip":true}
      },
      "theonie": {
        "front": {"x":43.5,"y":19.5},
        "left": {"x":35,"y":21.5},
        "back": {"x":22,"y":10,"hidden":true},
        "right": {"x":27.5,"y":19.5,"flip":true}
      },
      "amber": {
        "front": {"x":45,"y":17.5},
        "left": {"x":35.5,"y":17.5},
        "back": {"x":22,"y":10,"hidden":true},
        "right": {"x":28.5,"y":17.5,"flip":true}
      },
      "red": {
        "front": {"x":45,"y":17.5},
        "left": {"x":35.5,"y":17.5},
        "back": {"x":22,"y":10,"hidden":true},
        "right": {"x":28.5,"y":17.5,"flip":true}
      },
      "avaren": {
        "front": {"x":45,"y":17.5},
        "left": {"x":35.5,"y":17.5},
        "back": {"x":22,"y":10,"hidden":true},
        "right": {"x":28.5,"y":17.5,"flip":true}
      },
      "luther": {
        "front": {"x":45,"y":17.5},
        "left": {"x":35.5,"y":17.5},
        "back": {"x":22,"y":10,"hidden":true},
        "right": {"x":28.5,"y":17.5,"flip":true}
      },
      "eldrin": {
        "front": {"x":45,"y":17.5},
        "left": {"x":35.5,"y":17.5},
        "back": {"x":22,"y":10,"hidden":true},
        "right": {"x":28.5,"y":17.5,"flip":true}
      },
      "chris": {
        "front": {"x":45,"y":17.5},
        "left": {"x":35.5,"y":17.5},
        "back": {"x":22,"y":10,"hidden":true},
        "right": {"x":28.5,"y":17.5,"flip":true}
      },
      "tino": {
        "front": {"x":45,"y":17.5},
        "left": {"x":35.5,"y":17.5},
        "back": {"x":22,"y":10,"hidden":true},
        "right": {"x":28.5,"y":17.5,"flip":true}
      },
      "claire": {
        "front": {"x":45,"y":17.5},
        "left": {"x":35.5,"y":17.5},
        "back": {"x":22,"y":10,"hidden":true},
        "right": {"x":28.5,"y":17.5,"flip":true}
      },
      "muomn": {
        "front": {"x":45,"y":17.5},
        "left": {"x":35.5,"y":17.5},
        "back": {"x":22,"y":10,"hidden":true},
        "right": {"x":28.5,"y":17.5,"flip":true}
      },
      "noah": {
        "front": {"x":45,"y":17.5},
        "left": {"x":35.5,"y":17.5},
        "back": {"x":22,"y":10,"hidden":true},
        "right": {"x":28.5,"y":17.5,"flip":true}
      },
      "ash": {
        "front": {"x":45,"y":17.5},
        "left": {"x":35.5,"y":17.5},
        "back": {"x":22,"y":10,"hidden":true},
        "right": {"x":28.5,"y":17.5,"flip":true}
      },
      "eden": {
        "front": {"x":45,"y":17.5},
        "left": {"x":35.5,"y":17.5},
        "back": {"x":22,"y":10,"hidden":true},
        "right": {"x":28.5,"y":17.5,"flip":true}
      },
      "salem": {
        "front": {"x":45,"y":17.5},
        "left": {"x":35.5,"y":17.5},
        "back": {"x":22,"y":10,"hidden":true},
        "right": {"x":28.5,"y":17.5,"flip":true}
      },
      "ball": {
        "front": {"x":20.5,"y":38.5},
        "left": {"x":23,"y":39.5},
        "back": {"x":23.5,"y":40.5,"hidden":true},
        "right": {"x":41,"y":39.5,"flip":true}
      },
      "taana": {
        "front": {"x":45,"y":17.5},
        "left": {"x":35.5,"y":17.5},
        "back": {"x":22,"y":10,"hidden":true},
        "right": {"x":28.5,"y":17.5,"flip":true}
      },
      "colyn": {
        "front": {"x":45,"y":17.5},
        "left": {"x":35.5,"y":17.5},
        "back": {"x":22,"y":10,"hidden":true},
        "right": {"x":28.5,"y":17.5,"flip":true}
      },
      "rowan": {
        "front": {"x":45,"y":17.5},
        "left": {"x":35.5,"y":17.5},
        "back": {"x":22,"y":10,"hidden":true},
        "right": {"x":28.5,"y":17.5,"flip":true}
      },
      "cael": {
        "front": {"x":45,"y":17.5},
        "left": {"x":35.5,"y":17.5},
        "back": {"x":22,"y":10,"hidden":true},
        "right": {"x":28.5,"y":17.5,"flip":true}
      },
      "saku": {
        "front": {"x":45,"y":17.5},
        "left": {"x":35.5,"y":17.5},
        "back": {"x":22,"y":10,"hidden":true},
        "right": {"x":28.5,"y":17.5,"flip":true}
      },
      "kakuma": {
        "front": {"x":45,"y":17.5},
        "left": {"x":35.5,"y":17.5},
        "back": {"x":22,"y":10,"hidden":true},
        "right": {"x":28.5,"y":17.5,"flip":true}
      }
    },
    "large-bow-blue": {
      "winter": {
        "front": {"x":32,"y":9},
        "left": {"x":30,"y":6},
        "back": {"x":31.5,"y":6.5,"behind":true},
        "right": {"x":34,"y":6}
      },
      "theonie": {
        "front": {"x":32,"y":12.5},
        "left": {"x":29,"y":13},
        "back": {"x":32,"y":13,"behind":true},
        "right": {"x":35,"y":13}
      },
      "amber": {
        "front": {"x":32,"y":10},
        "left": {"x":30.5,"y":9},
        "back": {"x":32,"y":9.5,"behind":true},
        "right": {"x":34.5,"y":8.5}
      },
      "red": {
        "front": {"x":32,"y":9},
        "left": {"x":30,"y":6},
        "back": {"x":31.5,"y":6.5,"behind":true},
        "right": {"x":34,"y":6}
      },
      "avaren": {
        "front": {"x":32,"y":9},
        "left": {"x":30,"y":6},
        "back": {"x":31.5,"y":6.5,"behind":true},
        "right": {"x":34,"y":6}
      },
      "luther": {
        "front": {"x":32,"y":9},
        "left": {"x":30,"y":6},
        "back": {"x":31.5,"y":6.5,"behind":true},
        "right": {"x":34,"y":6}
      },
      "eldrin": {
        "front": {"x":31,"y":8.5},
        "left": {"x":30,"y":6},
        "back": {"x":31.5,"y":6.5,"behind":true},
        "right": {"x":34,"y":6}
      },
      "chris": {
        "front": {"x":32,"y":9},
        "left": {"x":30,"y":6},
        "back": {"x":31.5,"y":6.5,"behind":true},
        "right": {"x":34,"y":6}
      },
      "tino": {
        "front": {"x":32,"y":9},
        "left": {"x":30,"y":6},
        "back": {"x":31.5,"y":6.5,"behind":true},
        "right": {"x":34,"y":6}
      },
      "claire": {
        "front": {"x":32,"y":9},
        "left": {"x":30,"y":6},
        "back": {"x":31.5,"y":6.5,"behind":true},
        "right": {"x":34,"y":6}
      },
      "muomn": {
        "front": {"x":32,"y":9},
        "left": {"x":30,"y":6},
        "back": {"x":31.5,"y":6.5,"behind":true},
        "right": {"x":34,"y":6}
      },
      "noah": {
        "front": {"x":32,"y":9},
        "left": {"x":30,"y":6},
        "back": {"x":31.5,"y":6.5,"behind":true},
        "right": {"x":34,"y":6}
      },
      "ash": {
        "front": {"x":32,"y":9},
        "left": {"x":30,"y":6},
        "back": {"x":31.5,"y":6.5,"behind":true},
        "right": {"x":34,"y":6}
      },
      "eden": {
        "front": {"x":32,"y":9},
        "left": {"x":30,"y":6},
        "back": {"x":31.5,"y":6.5,"behind":true},
        "right": {"x":34,"y":6}
      },
      "salem": {
        "front": {"x":32,"y":9},
        "left": {"x":30,"y":6},
        "back": {"x":31.5,"y":6.5,"behind":true},
        "right": {"x":34,"y":6}
      },
      "ball": {
        "front": {"x":32,"y":9},
        "left": {"x":30,"y":6},
        "back": {"x":31.5,"y":6.5,"behind":true},
        "right": {"x":34,"y":6}
      },
      "taana": {
        "front": {"x":32,"y":9},
        "left": {"x":30,"y":6},
        "back": {"x":31.5,"y":6.5,"behind":true},
        "right": {"x":34,"y":6}
      },
      "colyn": {
        "front": {"x":32,"y":9},
        "left": {"x":30,"y":6},
        "back": {"x":31.5,"y":6.5,"behind":true},
        "right": {"x":34,"y":6}
      },
      "rowan": {
        "front": {"x":32,"y":9},
        "left": {"x":30,"y":6},
        "back": {"x":31.5,"y":6.5,"behind":true},
        "right": {"x":34,"y":6}
      },
      "cael": {
        "front": {"x":32,"y":9},
        "left": {"x":30,"y":6},
        "back": {"x":31.5,"y":6.5,"behind":true},
        "right": {"x":34,"y":6}
      },
      "saku": {
        "front": {"x":32,"y":9},
        "left": {"x":30,"y":6},
        "back": {"x":31.5,"y":6.5,"behind":true},
        "right": {"x":34,"y":6}
      },
      "kakuma": {
        "front": {"x":32,"y":9},
        "left": {"x":30,"y":6},
        "back": {"x":31.5,"y":6.5,"behind":true},
        "right": {"x":34,"y":6}
      }
    },
    "large-bow-white": {
      "winter": {
        "front": {"x":32,"y":9},
        "left": {"x":30,"y":6},
        "back": {"x":31.5,"y":6.5,"behind":true},
        "right": {"x":34,"y":6}
      },
      "theonie": {
        "front": {"x":32,"y":12.5},
        "left": {"x":29,"y":13},
        "back": {"x":32,"y":13,"behind":true},
        "right": {"x":35,"y":13}
      },
      "amber": {
        "front": {"x":32,"y":10},
        "left": {"x":30.5,"y":9},
        "back": {"x":32,"y":9.5,"behind":true},
        "right": {"x":34.5,"y":8.5}
      },
      "red": {
        "front": {"x":32,"y":9},
        "left": {"x":30,"y":6},
        "back": {"x":31.5,"y":6.5,"behind":true},
        "right": {"x":34,"y":6}
      },
      "avaren": {
        "front": {"x":32,"y":9},
        "left": {"x":30,"y":6},
        "back": {"x":31.5,"y":6.5,"behind":true},
        "right": {"x":34,"y":6}
      },
      "luther": {
        "front": {"x":32,"y":9},
        "left": {"x":30,"y":6},
        "back": {"x":31.5,"y":6.5,"behind":true},
        "right": {"x":34,"y":6}
      },
      "eldrin": {
        "front": {"x":31,"y":8.5},
        "left": {"x":30,"y":6},
        "back": {"x":31.5,"y":6.5,"behind":true},
        "right": {"x":34,"y":6}
      },
      "chris": {
        "front": {"x":32,"y":9},
        "left": {"x":30,"y":6},
        "back": {"x":31.5,"y":6.5,"behind":true},
        "right": {"x":34,"y":6}
      },
      "tino": {
        "front": {"x":32,"y":9},
        "left": {"x":30,"y":6},
        "back": {"x":31.5,"y":6.5,"behind":true},
        "right": {"x":34,"y":6}
      },
      "claire": {
        "front": {"x":32,"y":9},
        "left": {"x":30,"y":6},
        "back": {"x":31.5,"y":6.5,"behind":true},
        "right": {"x":34,"y":6}
      },
      "muomn": {
        "front": {"x":32,"y":9},
        "left": {"x":30,"y":6},
        "back": {"x":31.5,"y":6.5,"behind":true},
        "right": {"x":34,"y":6}
      },
      "noah": {
        "front": {"x":32,"y":9},
        "left": {"x":30,"y":6},
        "back": {"x":31.5,"y":6.5,"behind":true},
        "right": {"x":34,"y":6}
      },
      "ash": {
        "front": {"x":32,"y":9},
        "left": {"x":30,"y":6},
        "back": {"x":31.5,"y":6.5,"behind":true},
        "right": {"x":34,"y":6}
      },
      "eden": {
        "front": {"x":32,"y":9},
        "left": {"x":30,"y":6},
        "back": {"x":31.5,"y":6.5,"behind":true},
        "right": {"x":34,"y":6}
      },
      "salem": {
        "front": {"x":32,"y":9},
        "left": {"x":30,"y":6},
        "back": {"x":31.5,"y":6.5,"behind":true},
        "right": {"x":34,"y":6}
      },
      "ball": {
        "front": {"x":32,"y":9},
        "left": {"x":30,"y":6},
        "back": {"x":31.5,"y":6.5,"behind":true},
        "right": {"x":34,"y":6}
      },
      "taana": {
        "front": {"x":32,"y":9},
        "left": {"x":30,"y":6},
        "back": {"x":31.5,"y":6.5,"behind":true},
        "right": {"x":34,"y":6}
      },
      "colyn": {
        "front": {"x":32,"y":9},
        "left": {"x":30,"y":6},
        "back": {"x":31.5,"y":6.5,"behind":true},
        "right": {"x":34,"y":6}
      },
      "rowan": {
        "front": {"x":32,"y":9},
        "left": {"x":30,"y":6},
        "back": {"x":31.5,"y":6.5,"behind":true},
        "right": {"x":34,"y":6}
      },
      "cael": {
        "front": {"x":32,"y":9},
        "left": {"x":30,"y":6},
        "back": {"x":31.5,"y":6.5,"behind":true},
        "right": {"x":34,"y":6}
      },
      "saku": {
        "front": {"x":32,"y":9},
        "left": {"x":30,"y":6},
        "back": {"x":31.5,"y":6.5,"behind":true},
        "right": {"x":34,"y":6}
      },
      "kakuma": {
        "front": {"x":32,"y":9},
        "left": {"x":30,"y":6},
        "back": {"x":31.5,"y":6.5,"behind":true},
        "right": {"x":34,"y":6}
      }
    },
    "angel-wings": {
      "winter": {
        "front": {"x":32,"y":46,"behind":true},
        "back": {"x":32,"y":46},
        "left": {"x":46,"y":44.5,"behind":true},
        "right": {"x":18,"y":44.5,"behind":true}
      },
      "theonie": {
        "front": {"x":32,"y":50,"behind":true},
        "back": {"x":32,"y":50},
        "left": {"x":46,"y":48.5,"behind":true},
        "right": {"x":18,"y":48.5,"behind":true}
      },
      "amber": {
        "front": {"x":32,"y":46,"behind":true},
        "back": {"x":32,"y":46},
        "left": {"x":46,"y":44.5,"behind":true},
        "right": {"x":18,"y":44.5,"behind":true}
      },
      "red": {
        "front": {"x":32,"y":46,"behind":true},
        "back": {"x":32,"y":46},
        "left": {"x":46,"y":44.5,"behind":true},
        "right": {"x":18,"y":44.5,"behind":true}
      },
      "avaren": {
        "front": {"x":32,"y":46,"behind":true},
        "back": {"x":32,"y":46},
        "left": {"x":46,"y":44.5,"behind":true},
        "right": {"x":18,"y":44.5,"behind":true}
      },
      "luther": {
        "front": {"x":32,"y":46,"behind":true},
        "back": {"x":32,"y":46},
        "left": {"x":46,"y":44.5,"behind":true},
        "right": {"x":18,"y":44.5,"behind":true}
      },
      "eldrin": {
        "front": {"x":32,"y":46,"behind":true},
        "back": {"x":32,"y":46},
        "left": {"x":46,"y":44.5,"behind":true},
        "right": {"x":18,"y":44.5,"behind":true}
      },
      "chris": {
        "front": {"x":32,"y":46,"behind":true},
        "back": {"x":32,"y":46},
        "left": {"x":46,"y":44.5,"behind":true},
        "right": {"x":18,"y":44.5,"behind":true}
      },
      "tino": {
        "front": {"x":32,"y":46,"behind":true},
        "back": {"x":32,"y":46},
        "left": {"x":46,"y":44.5,"behind":true},
        "right": {"x":18,"y":44.5,"behind":true}
      },
      "claire": {
        "front": {"x":32,"y":46,"behind":true},
        "back": {"x":32,"y":46},
        "left": {"x":46,"y":44.5,"behind":true},
        "right": {"x":18,"y":44.5,"behind":true}
      },
      "muomn": {
        "front": {"x":32,"y":46,"behind":true},
        "back": {"x":32,"y":46},
        "left": {"x":46,"y":44.5,"behind":true},
        "right": {"x":18,"y":44.5,"behind":true}
      },
      "noah": {
        "front": {"x":32,"y":46,"behind":true},
        "back": {"x":32,"y":46},
        "left": {"x":46,"y":44.5,"behind":true},
        "right": {"x":18,"y":44.5,"behind":true}
      },
      "ash": {
        "front": {"x":32,"y":46,"behind":true},
        "back": {"x":32,"y":46},
        "left": {"x":46,"y":44.5,"behind":true},
        "right": {"x":18,"y":44.5,"behind":true}
      },
      "eden": {
        "front": {"x":32,"y":46,"behind":true},
        "back": {"x":32,"y":46},
        "left": {"x":46,"y":44.5,"behind":true},
        "right": {"x":18,"y":44.5,"behind":true}
      },
      "salem": {
        "front": {"x":32,"y":46,"behind":true},
        "back": {"x":32,"y":46},
        "left": {"x":46,"y":44.5,"behind":true},
        "right": {"x":18,"y":44.5,"behind":true}
      },
      "ball": {
        "front": {"x":32,"y":46,"behind":true},
        "back": {"x":32,"y":46},
        "left": {"x":46,"y":44.5,"behind":true},
        "right": {"x":18,"y":44.5,"behind":true}
      },
      "taana": {
        "front": {"x":32,"y":46,"behind":true},
        "back": {"x":32,"y":46},
        "left": {"x":46,"y":44.5,"behind":true},
        "right": {"x":18,"y":44.5,"behind":true}
      },
      "colyn": {
        "front": {"x":32,"y":46,"behind":true},
        "back": {"x":32,"y":46},
        "left": {"x":46,"y":44.5,"behind":true},
        "right": {"x":18,"y":44.5,"behind":true}
      },
      "rowan": {
        "front": {"x":32,"y":46,"behind":true},
        "back": {"x":32,"y":46},
        "left": {"x":46,"y":44.5,"behind":true},
        "right": {"x":18,"y":44.5,"behind":true}
      },
      "cael": {
        "front": {"x":32,"y":46,"behind":true},
        "back": {"x":32,"y":46},
        "left": {"x":46,"y":44.5,"behind":true},
        "right": {"x":18,"y":44.5,"behind":true}
      },
      "saku": {
        "front": {"x":32,"y":46,"behind":true},
        "back": {"x":32,"y":46},
        "left": {"x":46,"y":44.5,"behind":true},
        "right": {"x":18,"y":44.5,"behind":true}
      },
      "kakuma": {
        "front": {"x":32,"y":46,"behind":true},
        "back": {"x":32,"y":46},
        "left": {"x":46,"y":44.5,"behind":true},
        "right": {"x":18,"y":44.5,"behind":true}
      }
    },
    "halo": {
      "winter": {
        "back": {"x":32,"y":-2},
        "front": {"x":32,"y":-2},
        "left": {"x":32,"y":-2},
        "right": {"x":32,"y":-2}
      },
      "theonie": {
        "back": {"x":32,"y":2},
        "front": {"x":32,"y":2},
        "left": {"x":32,"y":2},
        "right": {"x":32,"y":2}
      },
      "amber": {
        "back": {"x":32,"y":-2},
        "front": {"x":32,"y":-2},
        "left": {"x":32,"y":-2},
        "right": {"x":32,"y":-2}
      },
      "red": {
        "back": {"x":32,"y":-2},
        "front": {"x":32,"y":-2},
        "left": {"x":32,"y":-2},
        "right": {"x":32,"y":-2}
      },
      "avaren": {
        "back": {"x":32,"y":-2},
        "front": {"x":32,"y":-2},
        "left": {"x":32,"y":-2},
        "right": {"x":32,"y":-2}
      },
      "luther": {
        "back": {"x":32,"y":-2},
        "front": {"x":32,"y":-2},
        "left": {"x":32,"y":-2},
        "right": {"x":32,"y":-2}
      },
      "eldrin": {
        "back": {"x":32,"y":-2},
        "front": {"x":32,"y":-2},
        "left": {"x":32,"y":-2},
        "right": {"x":32,"y":-2}
      },
      "chris": {
        "back": {"x":32,"y":-2},
        "front": {"x":32,"y":-2},
        "left": {"x":32,"y":-2},
        "right": {"x":32,"y":-2}
      },
      "tino": {
        "back": {"x":32,"y":-2},
        "front": {"x":32,"y":-2},
        "left": {"x":32,"y":-2},
        "right": {"x":32,"y":-2}
      },
      "claire": {
        "back": {"x":32,"y":-2},
        "front": {"x":32,"y":-2},
        "left": {"x":32,"y":-2},
        "right": {"x":32,"y":-2}
      },
      "muomn": {
        "back": {"x":32,"y":-2},
        "front": {"x":32,"y":-2},
        "left": {"x":32,"y":-2},
        "right": {"x":32,"y":-2}
      },
      "noah": {
        "back": {"x":32,"y":-2},
        "front": {"x":32,"y":-2},
        "left": {"x":32,"y":-2},
        "right": {"x":32,"y":-2}
      },
      "ash": {
        "back": {"x":32,"y":-2},
        "front": {"x":32,"y":-2},
        "left": {"x":32,"y":-2},
        "right": {"x":32,"y":-2}
      },
      "eden": {
        "back": {"x":32,"y":-2},
        "front": {"x":32,"y":-2},
        "left": {"x":32,"y":-2},
        "right": {"x":32,"y":-2}
      },
      "salem": {
        "back": {"x":32,"y":-2},
        "front": {"x":32,"y":-2},
        "left": {"x":32,"y":-2},
        "right": {"x":32,"y":-2}
      },
      "ball": {
        "back": {"x":14,"y":19.5},
        "front": {"x":14,"y":20},
        "left": {"x":14,"y":20},
        "right": {"x":50,"y":20}
      },
      "taana": {
        "back": {"x":32,"y":-1},
        "front": {"x":32,"y":-1},
        "left": {"x":32,"y":-1},
        "right": {"x":32,"y":-1}
      },
      "colyn": {
        "back": {"x":32,"y":-2},
        "front": {"x":32,"y":-2},
        "left": {"x":32,"y":-2},
        "right": {"x":32,"y":-2}
      },
      "rowan": {
        "back": {"x":32,"y":-2},
        "front": {"x":32,"y":-2},
        "left": {"x":32,"y":-2},
        "right": {"x":32,"y":-2}
      },
      "cael": {
        "back": {"x":32,"y":-2},
        "front": {"x":32,"y":-2},
        "left": {"x":32,"y":-2},
        "right": {"x":32,"y":-2}
      },
      "saku": {
        "back": {"x":32,"y":-2},
        "front": {"x":32,"y":-2},
        "left": {"x":32,"y":-2},
        "right": {"x":32,"y":-2}
      },
      "kakuma": {
        "back": {"x":32,"y":-2},
        "front": {"x":32,"y":-2},
        "left": {"x":32,"y":-2},
        "right": {"x":32,"y":-2}
      }
    },
    "devil-horns": {
      "winter": {
        "front": {"x":32,"y":8.5},
        "left": {"x":32.5,"y":8},
        "back": {"x":32,"y":8.5,"behind":true},
        "right": {"x":31.5,"y":8}
      },
      "theonie": {
        "front": {"x":32,"y":12.5},
        "left": {"x":32.5,"y":12},
        "back": {"x":32,"y":12.5,"behind":true},
        "right": {"x":31.5,"y":12}
      },
      "amber": {
        "front": {"x":32,"y":11.5},
        "left": {"x":32.5,"y":11},
        "back": {"x":32,"y":11.5,"behind":true},
        "right": {"x":31.5,"y":11}
      },
      "red": {
        "front": {"x":32,"y":8.5},
        "left": {"x":32.5,"y":8},
        "back": {"x":32,"y":8.5,"behind":true},
        "right": {"x":31.5,"y":8}
      },
      "avaren": {
        "front": {"x":32,"y":8.5},
        "left": {"x":32.5,"y":8},
        "back": {"x":32,"y":8.5,"behind":true},
        "right": {"x":31.5,"y":8}
      },
      "luther": {
        "front": {"x":32,"y":8.5},
        "left": {"x":32.5,"y":8},
        "back": {"x":32,"y":8.5,"behind":true},
        "right": {"x":31.5,"y":8}
      },
      "eldrin": {
        "front": {"x":32,"y":8.5},
        "left": {"x":32.5,"y":8},
        "back": {"x":32,"y":8.5,"behind":true},
        "right": {"x":31.5,"y":8}
      },
      "chris": {
        "front": {"x":32,"y":8.5},
        "left": {"x":32.5,"y":8},
        "back": {"x":32,"y":8.5,"behind":true},
        "right": {"x":31.5,"y":8}
      },
      "tino": {
        "front": {"x":32,"y":8.5},
        "left": {"x":32.5,"y":8},
        "back": {"x":32,"y":8.5,"behind":true},
        "right": {"x":31.5,"y":8}
      },
      "claire": {
        "front": {"x":32,"y":8.5},
        "left": {"x":32.5,"y":8},
        "back": {"x":32,"y":8.5,"behind":true},
        "right": {"x":31.5,"y":8}
      },
      "muomn": {
        "front": {"x":32,"y":8.5},
        "left": {"x":32.5,"y":8},
        "back": {"x":32,"y":8.5,"behind":true},
        "right": {"x":31.5,"y":8}
      },
      "noah": {
        "front": {"x":32,"y":8.5},
        "left": {"x":32.5,"y":8},
        "back": {"x":32,"y":8.5,"behind":true},
        "right": {"x":31.5,"y":8}
      },
      "ash": {
        "front": {"x":32,"y":8.5},
        "left": {"x":32.5,"y":8},
        "back": {"x":32,"y":8.5,"behind":true},
        "right": {"x":31.5,"y":8}
      },
      "eden": {
        "front": {"x":32,"y":8.5},
        "left": {"x":32.5,"y":8},
        "back": {"x":32,"y":8.5,"behind":true},
        "right": {"x":31.5,"y":8}
      },
      "salem": {
        "front": {"x":32,"y":8.5},
        "left": {"x":32.5,"y":8},
        "back": {"x":32,"y":8.5,"behind":true},
        "right": {"x":31.5,"y":8}
      },
      "ball": {
        "front": {"x":32,"y":8.5},
        "left": {"x":32.5,"y":8},
        "back": {"x":32,"y":8.5,"behind":true},
        "right": {"x":31.5,"y":8}
      },
      "taana": {
        "front": {"x":32,"y":10.5},
        "left": {"x":32.5,"y":10},
        "back": {"x":32,"y":10.5,"behind":true},
        "right": {"x":31.5,"y":10}
      },
      "colyn": {
        "front": {"x":32,"y":8.5},
        "left": {"x":32.5,"y":8},
        "back": {"x":32,"y":8.5,"behind":true},
        "right": {"x":31.5,"y":8}
      },
      "rowan": {
        "front": {"x":32,"y":8.5},
        "left": {"x":32.5,"y":8},
        "back": {"x":32,"y":8.5,"behind":true},
        "right": {"x":31.5,"y":8}
      },
      "cael": {
        "front": {"x":32,"y":8.5},
        "left": {"x":32.5,"y":8},
        "back": {"x":32,"y":8.5,"behind":true},
        "right": {"x":31.5,"y":8}
      },
      "saku": {
        "front": {"x":32,"y":8.5},
        "left": {"x":32.5,"y":8},
        "back": {"x":32,"y":8.5,"behind":true},
        "right": {"x":31.5,"y":8}
      },
      "kakuma": {
        "front": {"x":32,"y":8.5},
        "left": {"x":32.5,"y":8},
        "back": {"x":32,"y":8.5,"behind":true},
        "right": {"x":31.5,"y":8}
      }
    },
    "minnie-ribbon": {
      "winter": {
        "front": {"x":32,"y":5},
        "left": {"x":33.5,"y":3.5},
        "back": {"x":32,"y":5,"behind":true},
        "right": {"x":30.5,"y":3.5}
      },
      "theonie": {
        "front": {"x":32,"y":9},
        "left": {"x":33.5,"y":7.5},
        "back": {"x":32,"y":9,"behind":true},
        "right": {"x":30.5,"y":7.5}
      },
      "amber": {
        "front": {"x":32,"y":8},
        "left": {"x":33.5,"y":6.5},
        "back": {"x":32,"y":8,"behind":true},
        "right": {"x":30.5,"y":6.5}
      },
      "red": {
        "front": {"x":32,"y":5},
        "left": {"x":33.5,"y":3.5},
        "back": {"x":32,"y":5,"behind":true},
        "right": {"x":30.5,"y":3.5}
      },
      "avaren": {
        "front": {"x":32,"y":5},
        "left": {"x":33.5,"y":3.5},
        "back": {"x":32,"y":5,"behind":true},
        "right": {"x":30.5,"y":3.5}
      },
      "luther": {
        "front": {"x":32,"y":5},
        "left": {"x":33.5,"y":3.5},
        "back": {"x":32,"y":5,"behind":true},
        "right": {"x":30.5,"y":3.5}
      },
      "eldrin": {
        "front": {"x":32,"y":5},
        "left": {"x":33.5,"y":3.5},
        "back": {"x":32,"y":5,"behind":true},
        "right": {"x":30.5,"y":3.5}
      },
      "chris": {
        "front": {"x":32,"y":5},
        "left": {"x":33.5,"y":3.5},
        "back": {"x":32,"y":5,"behind":true},
        "right": {"x":30.5,"y":3.5}
      },
      "tino": {
        "front": {"x":32,"y":5},
        "left": {"x":33.5,"y":3.5},
        "back": {"x":32,"y":5,"behind":true},
        "right": {"x":30.5,"y":3.5}
      },
      "claire": {
        "front": {"x":32,"y":5},
        "left": {"x":33.5,"y":3.5},
        "back": {"x":32,"y":5,"behind":true},
        "right": {"x":30.5,"y":3.5}
      },
      "muomn": {
        "front": {"x":32,"y":5},
        "left": {"x":33.5,"y":3.5},
        "back": {"x":32,"y":5,"behind":true},
        "right": {"x":30.5,"y":3.5}
      },
      "noah": {
        "front": {"x":32,"y":5},
        "left": {"x":33.5,"y":3.5},
        "back": {"x":32,"y":5,"behind":true},
        "right": {"x":30.5,"y":3.5}
      },
      "ash": {
        "front": {"x":32,"y":5},
        "left": {"x":33.5,"y":3.5},
        "back": {"x":32,"y":5,"behind":true},
        "right": {"x":30.5,"y":3.5}
      },
      "eden": {
        "front": {"x":32,"y":5},
        "left": {"x":33.5,"y":3.5},
        "back": {"x":32,"y":5,"behind":true},
        "right": {"x":30.5,"y":3.5}
      },
      "salem": {
        "front": {"x":32,"y":5},
        "left": {"x":33.5,"y":3.5},
        "back": {"x":32,"y":5,"behind":true},
        "right": {"x":30.5,"y":3.5}
      },
      "ball": {
        "front": {"x":32,"y":5},
        "left": {"x":33.5,"y":3.5},
        "back": {"x":32,"y":5,"behind":true},
        "right": {"x":30.5,"y":3.5}
      },
      "taana": {
        "front": {"x":32,"y":7},
        "left": {"x":33.5,"y":5.5},
        "back": {"x":32,"y":7,"behind":true},
        "right": {"x":30.5,"y":5.5}
      },
      "colyn": {
        "front": {"x":32,"y":5},
        "left": {"x":33.5,"y":3.5},
        "back": {"x":32,"y":5,"behind":true},
        "right": {"x":30.5,"y":3.5}
      },
      "rowan": {
        "front": {"x":32,"y":5},
        "left": {"x":33.5,"y":3.5},
        "back": {"x":32,"y":5,"behind":true},
        "right": {"x":30.5,"y":3.5}
      },
      "cael": {
        "front": {"x":32,"y":5},
        "left": {"x":33.5,"y":3.5},
        "back": {"x":32,"y":5,"behind":true},
        "right": {"x":30.5,"y":3.5}
      },
      "saku": {
        "front": {"x":32,"y":5},
        "left": {"x":33.5,"y":3.5},
        "back": {"x":32,"y":5,"behind":true},
        "right": {"x":30.5,"y":3.5}
      },
      "kakuma": {
        "front": {"x":32,"y":5},
        "left": {"x":33.5,"y":3.5},
        "back": {"x":32,"y":5,"behind":true},
        "right": {"x":30.5,"y":3.5}
      }
    },
    "wolf-ears": {
      "muomn": {
        "back": {"x":24,"y":7,"scale":1.2}
      },
      "winter": {
        "back": {"x":32,"y":7.5},
        "front": {"x":32,"y":7.5},
        "left": {"x":34.5,"y":4.5},
        "right": {"x":29.5,"y":4.5}
      }
    },
    "santa-hat": {
      "winter": {
        "front": {"x":45,"y":4.5},
        "left": {"x":42.5,"y":2},
        "back": {"x":19,"y":4.5,"flip":true},
        "right": {"x":42,"y":3.5,"behind":true}
      },
      "theonie": {
        "front": {"x":45,"y":10},
        "left": {"x":42.5,"y":10},
        "back": {"x":19,"y":10,"flip":true},
        "right": {"x":42,"y":10.5,"behind":true}
      },
      "amber": {
        "front": {"x":45,"y":7.5},
        "left": {"x":42.5,"y":5},
        "back": {"x":19,"y":7.5,"flip":true},
        "right": {"x":42,"y":8,"behind":true}
      },
      "red": {
        "front": {"x":45,"y":4.5},
        "left": {"x":42.5,"y":2},
        "back": {"x":19,"y":4.5,"flip":true},
        "right": {"x":42,"y":5,"behind":true}
      },
      "avaren": {
        "front": {"x":45,"y":4.5},
        "left": {"x":42.5,"y":2},
        "back": {"x":19,"y":4.5,"flip":true},
        "right": {"x":42,"y":3.5,"behind":true}
      },
      "luther": {
        "front": {"x":45,"y":4.5},
        "left": {"x":42.5,"y":2},
        "back": {"x":19,"y":4.5,"flip":true},
        "right": {"x":42,"y":3.5,"behind":true}
      },
      "eldrin": {
        "front": {"x":45,"y":4.5},
        "left": {"x":42.5,"y":2},
        "back": {"x":19,"y":4.5,"flip":true},
        "right": {"x":42,"y":3.5,"behind":true}
      },
      "chris": {
        "front": {"x":45,"y":4.5},
        "left": {"x":42.5,"y":2},
        "back": {"x":19,"y":4.5,"flip":true},
        "right": {"x":42,"y":3.5,"behind":true}
      },
      "tino": {
        "front": {"x":45,"y":4.5},
        "left": {"x":42.5,"y":2},
        "back": {"x":19,"y":4.5,"flip":true},
        "right": {"x":42,"y":3.5,"behind":true}
      },
      "claire": {
        "front": {"x":45,"y":4.5},
        "left": {"x":42.5,"y":2},
        "back": {"x":19,"y":4.5,"flip":true},
        "right": {"x":42,"y":3.5,"behind":true}
      },
      "muomn": {
        "front": {"x":45,"y":4.5},
        "left": {"x":42.5,"y":2},
        "back": {"x":19,"y":4.5,"flip":true},
        "right": {"x":42,"y":3.5,"behind":true}
      },
      "noah": {
        "front": {"x":45,"y":4.5},
        "left": {"x":42.5,"y":2},
        "back": {"x":19,"y":4.5,"flip":true},
        "right": {"x":42,"y":3.5,"behind":true}
      },
      "ash": {
        "front": {"x":45,"y":4.5},
        "left": {"x":42.5,"y":2},
        "back": {"x":19,"y":4.5,"flip":true},
        "right": {"x":42,"y":3.5,"behind":true}
      },
      "eden": {
        "front": {"x":45,"y":4.5},
        "left": {"x":42.5,"y":2},
        "back": {"x":19,"y":4.5,"flip":true},
        "right": {"x":42,"y":3.5,"behind":true}
      },
      "salem": {
        "front": {"x":45,"y":4.5},
        "left": {"x":42.5,"y":2},
        "back": {"x":19,"y":4.5,"flip":true},
        "right": {"x":42,"y":3.5,"behind":true}
      },
      "ball": {
        "front": {"x":20,"y":24},
        "left": {"x":20,"y":24},
        "back": {"x":20,"y":24},
        "right": {"x":44,"y":24,"flip":true}
      },
      "taana": {
        "front": {"x":45,"y":6.5},
        "left": {"x":42.5,"y":4},
        "back": {"x":19,"y":6.5,"flip":true},
        "right": {"x":42,"y":5.5,"behind":true}
      },
      "colyn": {
        "front": {"x":45,"y":4.5},
        "left": {"x":42.5,"y":2},
        "back": {"x":19,"y":4.5,"flip":true},
        "right": {"x":42,"y":3.5,"behind":true}
      },
      "rowan": {
        "front": {"x":45,"y":4.5},
        "left": {"x":42.5,"y":2},
        "back": {"x":19,"y":4.5,"flip":true},
        "right": {"x":42,"y":3.5,"behind":true}
      },
      "cael": {
        "front": {"x":45,"y":4.5},
        "left": {"x":42.5,"y":2},
        "back": {"x":19,"y":4.5,"flip":true},
        "right": {"x":42,"y":3.5,"behind":true}
      },
      "saku": {
        "front": {"x":45,"y":4.5},
        "left": {"x":42.5,"y":2},
        "back": {"x":19,"y":4.5,"flip":true},
        "right": {"x":42,"y":3.5,"behind":true}
      },
      "kakuma": {
        "front": {"x":45,"y":4.5},
        "left": {"x":42.5,"y":2},
        "back": {"x":19,"y":4.5,"flip":true},
        "right": {"x":42,"y":3.5,"behind":true}
      }
    },
    "flower-blue": {
      "noah": {
        "front": {"x":48.5,"y":19},
        "back": {"x":22,"y":17.5,"behind":true},
        "left": {"x":36.5,"y":19},
        "right": {"x":27.5,"y":19}
      },
      "winter": {
        "front": {"x":48.5,"y":19},
        "back": {"x":22,"y":17.5,"behind":true},
        "left": {"x":36.5,"y":19},
        "right": {"x":27.5,"y":19}
      },
      "theonie": {
        "front": {"x":48.5,"y":23},
        "back": {"x":22,"y":21.5,"behind":true},
        "left": {"x":36.5,"y":23},
        "right": {"x":27.5,"y":23}
      },
      "amber": {
        "front": {"x":48.5,"y":22},
        "back": {"x":22,"y":20.5,"behind":true},
        "left": {"x":36.5,"y":22},
        "right": {"x":27.5,"y":22}
      },
      "red": {
        "front": {"x":48.5,"y":19},
        "back": {"x":22,"y":17.5,"behind":true},
        "left": {"x":36.5,"y":19},
        "right": {"x":27.5,"y":19}
      },
      "avaren": {
        "front": {"x":48.5,"y":19},
        "back": {"x":22,"y":17.5,"behind":true},
        "left": {"x":36.5,"y":19},
        "right": {"x":27.5,"y":19}
      },
      "luther": {
        "front": {"x":48.5,"y":19},
        "back": {"x":22,"y":17.5,"behind":true},
        "left": {"x":36.5,"y":19},
        "right": {"x":27.5,"y":19}
      },
      "eldrin": {
        "front": {"x":48.5,"y":19},
        "back": {"x":22,"y":17.5,"behind":true},
        "left": {"x":36.5,"y":19},
        "right": {"x":27.5,"y":19}
      },
      "chris": {
        "front": {"x":48.5,"y":19},
        "back": {"x":22,"y":17.5,"behind":true},
        "left": {"x":36.5,"y":19},
        "right": {"x":27.5,"y":19}
      },
      "tino": {
        "front": {"x":48.5,"y":19},
        "back": {"x":22,"y":17.5,"behind":true},
        "left": {"x":36.5,"y":19},
        "right": {"x":27.5,"y":19}
      },
      "claire": {
        "front": {"x":48.5,"y":19},
        "back": {"x":22,"y":17.5,"behind":true},
        "left": {"x":36.5,"y":19},
        "right": {"x":27.5,"y":19}
      },
      "muomn": {
        "front": {"x":48.5,"y":19},
        "back": {"x":22,"y":17.5,"behind":true},
        "left": {"x":36.5,"y":19},
        "right": {"x":27.5,"y":19}
      },
      "ash": {
        "front": {"x":48.5,"y":19},
        "back": {"x":22,"y":17.5,"behind":true},
        "left": {"x":36.5,"y":19},
        "right": {"x":27.5,"y":19}
      },
      "eden": {
        "front": {"x":48.5,"y":19},
        "back": {"x":22,"y":17.5,"behind":true},
        "left": {"x":36.5,"y":19},
        "right": {"x":27.5,"y":19}
      },
      "salem": {
        "front": {"x":48.5,"y":19},
        "back": {"x":22,"y":17.5,"behind":true},
        "left": {"x":36.5,"y":19},
        "right": {"x":27.5,"y":19}
      },
      "ball": {
        "front": {"x":23,"y":36},
        "back": {"x":23,"y":36},
        "left": {"x":23,"y":36},
        "right": {"x":41,"y":36}
      },
      "taana": {
        "front": {"x":48.5,"y":21},
        "back": {"x":22,"y":19.5,"behind":true},
        "left": {"x":36.5,"y":21},
        "right": {"x":27.5,"y":21}
      },
      "colyn": {
        "front": {"x":48.5,"y":19},
        "back": {"x":22,"y":17.5,"behind":true},
        "left": {"x":36.5,"y":19},
        "right": {"x":27.5,"y":19}
      },
      "rowan": {
        "front": {"x":48.5,"y":19},
        "back": {"x":22,"y":17.5,"behind":true},
        "left": {"x":36.5,"y":19},
        "right": {"x":27.5,"y":19}
      },
      "cael": {
        "front": {"x":48.5,"y":19},
        "back": {"x":22,"y":17.5,"behind":true},
        "left": {"x":36.5,"y":19},
        "right": {"x":27.5,"y":19}
      },
      "saku": {
        "front": {"x":48.5,"y":19},
        "back": {"x":22,"y":17.5,"behind":true},
        "left": {"x":36.5,"y":19},
        "right": {"x":27.5,"y":19}
      },
      "kakuma": {
        "front": {"x":48.5,"y":19},
        "back": {"x":22,"y":17.5,"behind":true},
        "left": {"x":36.5,"y":19},
        "right": {"x":27.5,"y":19}
      }
    },
    "flower-blue-two": {
      "winter": {
        "back": {"x":46,"y":20,"hidden":true},
        "front": {"x":48.5,"y":19},
        "left": {"x":30.5,"y":20.5},
        "right": {"x":14.5,"y":17.5,"hidden":true}
      },
      "theonie": {
        "back": {"x":46,"y":24,"hidden":true},
        "front": {"x":48.5,"y":23},
        "left": {"x":30.5,"y":24.5},
        "right": {"x":14.5,"y":21.5,"hidden":true}
      },
      "amber": {
        "back": {"x":46,"y":23,"hidden":true},
        "front": {"x":48.5,"y":22},
        "left": {"x":30.5,"y":23.5},
        "right": {"x":14.5,"y":20.5,"hidden":true}
      },
      "red": {
        "back": {"x":46,"y":20,"hidden":true},
        "front": {"x":48.5,"y":19},
        "left": {"x":30.5,"y":20.5},
        "right": {"x":14.5,"y":17.5,"hidden":true}
      },
      "avaren": {
        "back": {"x":46,"y":20,"hidden":true},
        "front": {"x":48.5,"y":19},
        "left": {"x":30.5,"y":20.5},
        "right": {"x":14.5,"y":17.5,"hidden":true}
      },
      "luther": {
        "back": {"x":46,"y":20,"hidden":true},
        "front": {"x":48.5,"y":19},
        "left": {"x":30.5,"y":20.5},
        "right": {"x":14.5,"y":17.5,"hidden":true}
      },
      "eldrin": {
        "back": {"x":46,"y":20,"hidden":true},
        "front": {"x":48.5,"y":19},
        "left": {"x":30.5,"y":20.5},
        "right": {"x":14.5,"y":17.5,"hidden":true}
      },
      "chris": {
        "back": {"x":46,"y":20,"hidden":true},
        "front": {"x":48.5,"y":19},
        "left": {"x":30.5,"y":20.5},
        "right": {"x":14.5,"y":17.5,"hidden":true}
      },
      "tino": {
        "back": {"x":46,"y":20,"hidden":true},
        "front": {"x":48.5,"y":19},
        "left": {"x":30.5,"y":20.5},
        "right": {"x":14.5,"y":17.5,"hidden":true}
      },
      "claire": {
        "back": {"x":46,"y":20,"hidden":true},
        "front": {"x":48.5,"y":19},
        "left": {"x":30.5,"y":20.5},
        "right": {"x":14.5,"y":17.5,"hidden":true}
      },
      "muomn": {
        "back": {"x":46,"y":20,"hidden":true},
        "front": {"x":48.5,"y":19},
        "left": {"x":30.5,"y":20.5},
        "right": {"x":14.5,"y":17.5,"hidden":true}
      },
      "noah": {
        "back": {"x":46,"y":20,"hidden":true},
        "front": {"x":48.5,"y":19},
        "left": {"x":30.5,"y":20.5},
        "right": {"x":14.5,"y":17.5,"hidden":true}
      },
      "ash": {
        "back": {"x":46,"y":20,"hidden":true},
        "front": {"x":48.5,"y":19},
        "left": {"x":30.5,"y":20.5},
        "right": {"x":14.5,"y":17.5,"hidden":true}
      },
      "eden": {
        "back": {"x":46,"y":20,"hidden":true},
        "front": {"x":48.5,"y":19},
        "left": {"x":30.5,"y":20.5},
        "right": {"x":14.5,"y":17.5,"hidden":true}
      },
      "salem": {
        "back": {"x":46,"y":20,"hidden":true},
        "front": {"x":48.5,"y":19},
        "left": {"x":30.5,"y":20.5},
        "right": {"x":14.5,"y":17.5,"hidden":true}
      },
      "ball": {
        "back": {"x":24,"y":36},
        "front": {"x":24,"y":36},
        "left": {"x":24,"y":36},
        "right": {"x":40,"y":36,"flip":true}
      },
      "taana": {
        "back": {"x":46,"y":22,"hidden":true},
        "front": {"x":48.5,"y":21},
        "left": {"x":30.5,"y":22.5},
        "right": {"x":14.5,"y":19.5,"hidden":true}
      },
      "colyn": {
        "back": {"x":46,"y":20,"hidden":true},
        "front": {"x":48.5,"y":19},
        "left": {"x":30.5,"y":20.5},
        "right": {"x":14.5,"y":17.5,"hidden":true}
      },
      "rowan": {
        "back": {"x":46,"y":20,"hidden":true},
        "front": {"x":48.5,"y":19},
        "left": {"x":30.5,"y":20.5},
        "right": {"x":14.5,"y":17.5,"hidden":true}
      },
      "cael": {
        "back": {"x":46,"y":20,"hidden":true},
        "front": {"x":48.5,"y":19},
        "left": {"x":30.5,"y":20.5},
        "right": {"x":14.5,"y":17.5,"hidden":true}
      },
      "saku": {
        "back": {"x":46,"y":20,"hidden":true},
        "front": {"x":48.5,"y":19},
        "left": {"x":30.5,"y":20.5},
        "right": {"x":14.5,"y":17.5,"hidden":true}
      },
      "kakuma": {
        "back": {"x":46,"y":20,"hidden":true},
        "front": {"x":48.5,"y":19},
        "left": {"x":30.5,"y":20.5},
        "right": {"x":14.5,"y":17.5,"hidden":true}
      }
    },
    "flower-white": {
      "winter": {
        "front": {"x":15.5,"y":19},
        "left": {"x":40.5,"y":16.5,"hidden":true},
        "back": {"x":22,"y":10,"hidden":true},
        "right": {"x":25.5,"y":19}
      },
      "theonie": {
        "front": {"x":15.5,"y":23},
        "left": {"x":40.5,"y":20.5,"hidden":true},
        "back": {"x":22,"y":14,"hidden":true},
        "right": {"x":25.5,"y":23}
      },
      "amber": {
        "front": {"x":15.5,"y":22},
        "left": {"x":40.5,"y":19.5,"hidden":true},
        "back": {"x":22,"y":13,"hidden":true},
        "right": {"x":25.5,"y":22}
      },
      "red": {
        "front": {"x":15.5,"y":19},
        "left": {"x":40.5,"y":16.5,"hidden":true},
        "back": {"x":22,"y":10,"hidden":true},
        "right": {"x":25.5,"y":19}
      },
      "avaren": {
        "front": {"x":15.5,"y":19},
        "left": {"x":40.5,"y":16.5,"hidden":true},
        "back": {"x":22,"y":10,"hidden":true},
        "right": {"x":25.5,"y":19}
      },
      "luther": {
        "front": {"x":15.5,"y":19},
        "left": {"x":40.5,"y":16.5,"hidden":true},
        "back": {"x":22,"y":10,"hidden":true},
        "right": {"x":25.5,"y":19}
      },
      "eldrin": {
        "front": {"x":15.5,"y":19},
        "left": {"x":40.5,"y":16.5,"hidden":true},
        "back": {"x":22,"y":10,"hidden":true},
        "right": {"x":25.5,"y":19}
      },
      "chris": {
        "front": {"x":15.5,"y":19},
        "left": {"x":40.5,"y":16.5,"hidden":true},
        "back": {"x":22,"y":10,"hidden":true},
        "right": {"x":25.5,"y":19}
      },
      "tino": {
        "front": {"x":15.5,"y":19},
        "left": {"x":40.5,"y":16.5,"hidden":true},
        "back": {"x":22,"y":10,"hidden":true},
        "right": {"x":25.5,"y":19}
      },
      "claire": {
        "front": {"x":15.5,"y":19},
        "left": {"x":40.5,"y":16.5,"hidden":true},
        "back": {"x":22,"y":10,"hidden":true},
        "right": {"x":25.5,"y":19}
      },
      "muomn": {
        "front": {"x":15.5,"y":19},
        "left": {"x":40.5,"y":16.5,"hidden":true},
        "back": {"x":22,"y":10,"hidden":true},
        "right": {"x":25.5,"y":19}
      },
      "noah": {
        "front": {"x":15.5,"y":19},
        "left": {"x":40.5,"y":16.5,"hidden":true},
        "back": {"x":22,"y":10,"hidden":true},
        "right": {"x":25.5,"y":19}
      },
      "ash": {
        "front": {"x":15.5,"y":19},
        "left": {"x":40.5,"y":16.5,"hidden":true},
        "back": {"x":22,"y":10,"hidden":true},
        "right": {"x":25.5,"y":19}
      },
      "eden": {
        "front": {"x":15.5,"y":19},
        "left": {"x":40.5,"y":16.5,"hidden":true},
        "back": {"x":22,"y":10,"hidden":true},
        "right": {"x":25.5,"y":19}
      },
      "salem": {
        "front": {"x":15.5,"y":19},
        "left": {"x":40.5,"y":16.5,"hidden":true},
        "back": {"x":22,"y":10,"hidden":true},
        "right": {"x":25.5,"y":19}
      },
      "ball": {
        "front": {"x":24,"y":36},
        "left": {"x":24,"y":36},
        "back": {"x":24,"y":36},
        "right": {"x":40,"y":36,"scale":0.95}
      },
      "taana": {
        "front": {"x":15.5,"y":21},
        "left": {"x":40.5,"y":18.5,"hidden":true},
        "back": {"x":22,"y":12,"hidden":true},
        "right": {"x":25.5,"y":21}
      },
      "colyn": {
        "front": {"x":15.5,"y":19},
        "left": {"x":40.5,"y":16.5,"hidden":true},
        "back": {"x":22,"y":10,"hidden":true},
        "right": {"x":25.5,"y":19}
      },
      "rowan": {
        "front": {"x":15.5,"y":19},
        "left": {"x":40.5,"y":16.5,"hidden":true},
        "back": {"x":22,"y":10,"hidden":true},
        "right": {"x":25.5,"y":19}
      },
      "cael": {
        "front": {"x":15.5,"y":19},
        "left": {"x":40.5,"y":16.5,"hidden":true},
        "back": {"x":22,"y":10,"hidden":true},
        "right": {"x":25.5,"y":19}
      },
      "saku": {
        "front": {"x":15.5,"y":19},
        "left": {"x":40.5,"y":16.5,"hidden":true},
        "back": {"x":22,"y":10,"hidden":true},
        "right": {"x":25.5,"y":19}
      },
      "kakuma": {
        "front": {"x":15.5,"y":19},
        "left": {"x":40.5,"y":16.5,"hidden":true},
        "back": {"x":22,"y":10,"hidden":true},
        "right": {"x":25.5,"y":19}
      }
    },
    "flower-white-two": {
      "ball": {
        "back": {"x":24,"y":36},
        "right": {"x":40,"y":36,"flip":true},
        "left": {"x":24,"y":36},
        "front": {"x":24,"y":36}
      },
      "winter": {
        "back": {"x":46.5,"y":18.5,"hidden":true},
        "right": {"x":22.5,"y":9,"hidden":true},
        "left": {"x":33.5,"y":19.5},
        "front": {"x":48.5,"y":18}
      },
      "theonie": {
        "back": {"x":46.5,"y":22.5,"hidden":true},
        "right": {"x":22.5,"y":13,"hidden":true},
        "left": {"x":33.5,"y":23.5},
        "front": {"x":48.5,"y":22}
      },
      "amber": {
        "back": {"x":46.5,"y":21.5,"hidden":true},
        "right": {"x":22.5,"y":12,"hidden":true},
        "left": {"x":33.5,"y":22.5},
        "front": {"x":48.5,"y":21}
      },
      "red": {
        "back": {"x":46.5,"y":18.5,"hidden":true},
        "right": {"x":22.5,"y":9,"hidden":true},
        "left": {"x":33.5,"y":19.5},
        "front": {"x":48.5,"y":18}
      },
      "avaren": {
        "back": {"x":46.5,"y":18.5,"hidden":true},
        "right": {"x":22.5,"y":9,"hidden":true},
        "left": {"x":33.5,"y":19.5},
        "front": {"x":48.5,"y":18}
      },
      "luther": {
        "back": {"x":46.5,"y":18.5,"hidden":true},
        "right": {"x":22.5,"y":9,"hidden":true},
        "left": {"x":33.5,"y":19.5},
        "front": {"x":48.5,"y":18}
      },
      "eldrin": {
        "back": {"x":46.5,"y":18.5,"hidden":true},
        "right": {"x":22.5,"y":9,"hidden":true},
        "left": {"x":33.5,"y":19.5},
        "front": {"x":48.5,"y":18}
      },
      "chris": {
        "back": {"x":46.5,"y":18.5,"hidden":true},
        "right": {"x":22.5,"y":9,"hidden":true},
        "left": {"x":33.5,"y":19.5},
        "front": {"x":48.5,"y":18}
      },
      "tino": {
        "back": {"x":46.5,"y":18.5,"hidden":true},
        "right": {"x":22.5,"y":9,"hidden":true},
        "left": {"x":33.5,"y":19.5},
        "front": {"x":48.5,"y":18}
      },
      "claire": {
        "back": {"x":46.5,"y":18.5,"hidden":true},
        "right": {"x":22.5,"y":9,"hidden":true},
        "left": {"x":33.5,"y":19.5},
        "front": {"x":48.5,"y":18}
      },
      "muomn": {
        "back": {"x":46.5,"y":18.5,"hidden":true},
        "right": {"x":22.5,"y":9,"hidden":true},
        "left": {"x":33.5,"y":19.5},
        "front": {"x":48.5,"y":18}
      },
      "noah": {
        "back": {"x":46.5,"y":18.5,"hidden":true},
        "right": {"x":22.5,"y":9,"hidden":true},
        "left": {"x":33.5,"y":19.5},
        "front": {"x":48.5,"y":18}
      },
      "ash": {
        "back": {"x":46.5,"y":18.5,"hidden":true},
        "right": {"x":22.5,"y":9,"hidden":true},
        "left": {"x":33.5,"y":19.5},
        "front": {"x":48.5,"y":18}
      },
      "eden": {
        "back": {"x":46.5,"y":18.5,"hidden":true},
        "right": {"x":22.5,"y":9,"hidden":true},
        "left": {"x":33.5,"y":19.5},
        "front": {"x":48.5,"y":18}
      },
      "salem": {
        "back": {"x":46.5,"y":18.5,"hidden":true},
        "right": {"x":22.5,"y":9,"hidden":true},
        "left": {"x":33.5,"y":19.5},
        "front": {"x":48.5,"y":18}
      },
      "taana": {
        "back": {"x":46.5,"y":20.5,"hidden":true},
        "right": {"x":22.5,"y":11,"hidden":true},
        "left": {"x":33.5,"y":21.5},
        "front": {"x":48.5,"y":20}
      },
      "colyn": {
        "back": {"x":46.5,"y":18.5,"hidden":true},
        "right": {"x":22.5,"y":9,"hidden":true},
        "left": {"x":33.5,"y":19.5},
        "front": {"x":48.5,"y":18}
      },
      "rowan": {
        "back": {"x":46.5,"y":18.5,"hidden":true},
        "right": {"x":22.5,"y":9,"hidden":true},
        "left": {"x":33.5,"y":19.5},
        "front": {"x":48.5,"y":18}
      },
      "cael": {
        "back": {"x":46.5,"y":18.5,"hidden":true},
        "right": {"x":22.5,"y":9,"hidden":true},
        "left": {"x":33.5,"y":19.5},
        "front": {"x":48.5,"y":18}
      },
      "saku": {
        "back": {"x":46.5,"y":18.5,"hidden":true},
        "right": {"x":22.5,"y":9,"hidden":true},
        "left": {"x":33.5,"y":19.5},
        "front": {"x":48.5,"y":18}
      },
      "kakuma": {
        "back": {"x":46.5,"y":18.5,"hidden":true},
        "right": {"x":22.5,"y":9,"hidden":true},
        "left": {"x":33.5,"y":19.5},
        "front": {"x":48.5,"y":18}
      }
    },
    "white-wings": {
      "winter": {
        "back": {"x":32,"y":46},
        "front": {"x":32,"y":46,"behind":true},
        "left": {"x":45,"y":44.5,"behind":true},
        "right": {"x":19,"y":44.5,"behind":true}
      },
      "theonie": {
        "back": {"x":32,"y":50},
        "front": {"x":32,"y":50,"behind":true},
        "left": {"x":45,"y":48.5,"behind":true},
        "right": {"x":19,"y":48.5,"behind":true}
      },
      "amber": {
        "back": {"x":32,"y":49},
        "front": {"x":32,"y":49,"behind":true},
        "left": {"x":45,"y":47.5,"behind":true},
        "right": {"x":19,"y":47.5,"behind":true}
      },
      "red": {
        "back": {"x":32,"y":46},
        "front": {"x":32,"y":46,"behind":true},
        "left": {"x":45,"y":44.5,"behind":true},
        "right": {"x":19,"y":44.5,"behind":true}
      },
      "avaren": {
        "back": {"x":32,"y":46},
        "front": {"x":32,"y":46,"behind":true},
        "left": {"x":45,"y":44.5,"behind":true},
        "right": {"x":19,"y":44.5,"behind":true}
      },
      "luther": {
        "back": {"x":32,"y":46},
        "front": {"x":32,"y":46,"behind":true},
        "left": {"x":45,"y":44.5,"behind":true},
        "right": {"x":19,"y":44.5,"behind":true}
      },
      "eldrin": {
        "back": {"x":32,"y":46},
        "front": {"x":32,"y":46,"behind":true},
        "left": {"x":45,"y":44.5,"behind":true},
        "right": {"x":19,"y":44.5,"behind":true}
      },
      "chris": {
        "back": {"x":32,"y":46},
        "front": {"x":32,"y":46,"behind":true},
        "left": {"x":45,"y":44.5,"behind":true},
        "right": {"x":19,"y":44.5,"behind":true}
      },
      "tino": {
        "back": {"x":32,"y":46},
        "front": {"x":32,"y":46,"behind":true},
        "left": {"x":45,"y":44.5,"behind":true},
        "right": {"x":19,"y":44.5,"behind":true}
      },
      "claire": {
        "back": {"x":32,"y":46},
        "front": {"x":32,"y":46,"behind":true},
        "left": {"x":45,"y":44.5,"behind":true},
        "right": {"x":19,"y":44.5,"behind":true}
      },
      "muomn": {
        "back": {"x":32,"y":46},
        "front": {"x":32,"y":46,"behind":true},
        "left": {"x":45,"y":44.5,"behind":true},
        "right": {"x":19,"y":44.5,"behind":true}
      },
      "noah": {
        "back": {"x":32,"y":46},
        "front": {"x":32,"y":46,"behind":true},
        "left": {"x":45,"y":44.5,"behind":true},
        "right": {"x":19,"y":44.5,"behind":true}
      },
      "ash": {
        "back": {"x":32,"y":46},
        "front": {"x":32,"y":46,"behind":true},
        "left": {"x":45,"y":44.5,"behind":true},
        "right": {"x":19,"y":44.5,"behind":true}
      },
      "eden": {
        "back": {"x":32,"y":46},
        "front": {"x":32,"y":46,"behind":true},
        "left": {"x":45,"y":44.5,"behind":true},
        "right": {"x":19,"y":44.5,"behind":true}
      },
      "salem": {
        "back": {"x":32,"y":46},
        "front": {"x":32,"y":46,"behind":true},
        "left": {"x":45,"y":44.5,"behind":true},
        "right": {"x":19,"y":44.5,"behind":true}
      },
      "ball": {
        "back": {"x":32,"y":46},
        "front": {"x":32,"y":46,"behind":true},
        "left": {"x":45,"y":44.5,"behind":true},
        "right": {"x":19,"y":44.5,"behind":true}
      },
      "taana": {
        "back": {"x":32,"y":48},
        "front": {"x":32,"y":48,"behind":true},
        "left": {"x":45,"y":46.5,"behind":true},
        "right": {"x":19,"y":46.5,"behind":true}
      },
      "colyn": {
        "back": {"x":32,"y":46},
        "front": {"x":32,"y":46,"behind":true},
        "left": {"x":45,"y":44.5,"behind":true},
        "right": {"x":19,"y":44.5,"behind":true}
      },
      "rowan": {
        "back": {"x":32,"y":46},
        "front": {"x":32,"y":46,"behind":true},
        "left": {"x":45,"y":44.5,"behind":true},
        "right": {"x":19,"y":44.5,"behind":true}
      },
      "cael": {
        "back": {"x":32,"y":46},
        "front": {"x":32,"y":46,"behind":true},
        "left": {"x":45,"y":44.5,"behind":true},
        "right": {"x":19,"y":44.5,"behind":true}
      },
      "saku": {
        "back": {"x":32,"y":46},
        "front": {"x":32,"y":46,"behind":true},
        "left": {"x":45,"y":44.5,"behind":true},
        "right": {"x":19,"y":44.5,"behind":true}
      },
      "kakuma": {
        "back": {"x":32,"y":46},
        "front": {"x":32,"y":46,"behind":true},
        "left": {"x":45,"y":44.5,"behind":true},
        "right": {"x":19,"y":44.5,"behind":true}
      }
    },
    "devil-wings": {
      "eldrin": {
        "front": {"x":32,"y":44,"behind":true},
        "left": {"x":46.5,"y":43,"behind":true},
        "back": {"x":32,"y":44},
        "right": {"x":17.5,"y":43,"behind":true}
      },
      "winter": {
        "front": {"x":32,"y":44,"behind":true},
        "left": {"x":46.5,"y":43,"behind":true},
        "back": {"x":32,"y":44},
        "right": {"x":17.5,"y":43,"behind":true}
      },
      "theonie": {
        "front": {"x":32,"y":48,"behind":true},
        "left": {"x":46.5,"y":47,"behind":true},
        "back": {"x":32,"y":48},
        "right": {"x":17.5,"y":47,"behind":true}
      },
      "amber": {
        "front": {"x":32,"y":47,"behind":true},
        "left": {"x":46.5,"y":46,"behind":true},
        "back": {"x":32,"y":47},
        "right": {"x":17.5,"y":46,"behind":true}
      },
      "red": {
        "front": {"x":32,"y":44,"behind":true},
        "left": {"x":46.5,"y":43,"behind":true},
        "back": {"x":32,"y":44},
        "right": {"x":17.5,"y":43,"behind":true}
      },
      "avaren": {
        "front": {"x":32,"y":44,"behind":true},
        "left": {"x":46.5,"y":43,"behind":true},
        "back": {"x":32,"y":44},
        "right": {"x":17.5,"y":43,"behind":true}
      },
      "luther": {
        "front": {"x":32,"y":44,"behind":true},
        "left": {"x":46.5,"y":43,"behind":true},
        "back": {"x":32,"y":44},
        "right": {"x":17.5,"y":43,"behind":true}
      },
      "chris": {
        "front": {"x":32,"y":44,"behind":true},
        "left": {"x":46.5,"y":43,"behind":true},
        "back": {"x":32,"y":44},
        "right": {"x":17.5,"y":43,"behind":true}
      },
      "tino": {
        "front": {"x":32,"y":44,"behind":true},
        "left": {"x":46.5,"y":43,"behind":true},
        "back": {"x":32,"y":44},
        "right": {"x":17.5,"y":43,"behind":true}
      },
      "claire": {
        "front": {"x":32,"y":44,"behind":true},
        "left": {"x":46.5,"y":43,"behind":true},
        "back": {"x":32,"y":44},
        "right": {"x":17.5,"y":43,"behind":true}
      },
      "muomn": {
        "front": {"x":32,"y":44,"behind":true},
        "left": {"x":46.5,"y":43,"behind":true},
        "back": {"x":32,"y":44},
        "right": {"x":17.5,"y":43,"behind":true}
      },
      "noah": {
        "front": {"x":32,"y":44,"behind":true},
        "left": {"x":46.5,"y":43,"behind":true},
        "back": {"x":32,"y":44},
        "right": {"x":17.5,"y":43,"behind":true}
      },
      "ash": {
        "front": {"x":32,"y":44,"behind":true},
        "left": {"x":46.5,"y":43,"behind":true},
        "back": {"x":32,"y":44},
        "right": {"x":17.5,"y":43,"behind":true}
      },
      "eden": {
        "front": {"x":32,"y":44,"behind":true},
        "left": {"x":46.5,"y":43,"behind":true},
        "back": {"x":32,"y":44},
        "right": {"x":17.5,"y":43,"behind":true}
      },
      "salem": {
        "front": {"x":32,"y":44,"behind":true},
        "left": {"x":46.5,"y":43,"behind":true},
        "back": {"x":32,"y":44},
        "right": {"x":17.5,"y":43,"behind":true}
      },
      "ball": {
        "front": {"x":32,"y":44,"behind":true},
        "left": {"x":46.5,"y":43,"behind":true},
        "back": {"x":32,"y":44},
        "right": {"x":17.5,"y":43,"behind":true}
      },
      "taana": {
        "front": {"x":32,"y":46,"behind":true},
        "left": {"x":46.5,"y":45,"behind":true},
        "back": {"x":32,"y":46},
        "right": {"x":17.5,"y":45,"behind":true}
      },
      "colyn": {
        "front": {"x":32,"y":44,"behind":true},
        "left": {"x":46.5,"y":43,"behind":true},
        "back": {"x":32,"y":44},
        "right": {"x":17.5,"y":43,"behind":true}
      },
      "rowan": {
        "front": {"x":32,"y":44,"behind":true},
        "left": {"x":46.5,"y":43,"behind":true},
        "back": {"x":32,"y":44},
        "right": {"x":17.5,"y":43,"behind":true}
      },
      "cael": {
        "front": {"x":32,"y":44,"behind":true},
        "left": {"x":46.5,"y":43,"behind":true},
        "back": {"x":32,"y":44},
        "right": {"x":17.5,"y":43,"behind":true}
      },
      "saku": {
        "front": {"x":32,"y":44,"behind":true},
        "left": {"x":46.5,"y":43,"behind":true},
        "back": {"x":32,"y":44},
        "right": {"x":17.5,"y":43,"behind":true}
      },
      "kakuma": {
        "front": {"x":32,"y":44,"behind":true},
        "left": {"x":46.5,"y":43,"behind":true},
        "back": {"x":32,"y":44},
        "right": {"x":17.5,"y":43,"behind":true}
      }
    },
    "devil-tail": {
      "winter": {
        "left": {"x":45.5,"y":53.5,"behind":true},
        "front": {"x":44,"y":55,"behind":true},
        "back": {"x":40.5,"y":55},
        "right": {"x":18.5,"y":53.5,"behind":true}
      },
      "theonie": {
        "left": {"x":45.5,"y":57.5,"behind":true},
        "front": {"x":44,"y":59,"behind":true},
        "back": {"x":40.5,"y":59},
        "right": {"x":18.5,"y":57.5,"behind":true}
      },
      "amber": {
        "left": {"x":45.5,"y":56.5,"behind":true},
        "front": {"x":44,"y":58,"behind":true},
        "back": {"x":40.5,"y":58},
        "right": {"x":18.5,"y":56.5,"behind":true}
      },
      "red": {
        "left": {"x":45.5,"y":53.5,"behind":true},
        "front": {"x":44,"y":55,"behind":true},
        "back": {"x":40.5,"y":55},
        "right": {"x":18.5,"y":53.5,"behind":true}
      },
      "avaren": {
        "left": {"x":45.5,"y":53.5,"behind":true},
        "front": {"x":44,"y":55,"behind":true},
        "back": {"x":40.5,"y":55},
        "right": {"x":18.5,"y":53.5,"behind":true}
      },
      "luther": {
        "left": {"x":45.5,"y":53.5,"behind":true},
        "front": {"x":44,"y":55,"behind":true},
        "back": {"x":40.5,"y":55},
        "right": {"x":18.5,"y":53.5,"behind":true}
      },
      "eldrin": {
        "left": {"x":45.5,"y":53.5,"behind":true},
        "front": {"x":44,"y":55,"behind":true},
        "back": {"x":40.5,"y":55},
        "right": {"x":18.5,"y":53.5,"behind":true}
      },
      "chris": {
        "left": {"x":45.5,"y":53.5,"behind":true},
        "front": {"x":44,"y":55,"behind":true},
        "back": {"x":40.5,"y":55},
        "right": {"x":18.5,"y":53.5,"behind":true}
      },
      "tino": {
        "left": {"x":45.5,"y":53.5,"behind":true},
        "front": {"x":44,"y":55,"behind":true},
        "back": {"x":40.5,"y":55},
        "right": {"x":18.5,"y":53.5,"behind":true}
      },
      "claire": {
        "left": {"x":45.5,"y":53.5,"behind":true},
        "front": {"x":44,"y":55,"behind":true},
        "back": {"x":40.5,"y":55},
        "right": {"x":18.5,"y":53.5,"behind":true}
      },
      "muomn": {
        "left": {"x":45.5,"y":53.5,"behind":true},
        "front": {"x":44,"y":55,"behind":true},
        "back": {"x":40.5,"y":55},
        "right": {"x":18.5,"y":53.5,"behind":true}
      },
      "noah": {
        "left": {"x":45.5,"y":53.5,"behind":true},
        "front": {"x":44,"y":55,"behind":true},
        "back": {"x":40.5,"y":55},
        "right": {"x":18.5,"y":53.5,"behind":true}
      },
      "ash": {
        "left": {"x":45.5,"y":53.5,"behind":true},
        "front": {"x":44,"y":55,"behind":true},
        "back": {"x":40.5,"y":55},
        "right": {"x":18.5,"y":53.5,"behind":true}
      },
      "eden": {
        "left": {"x":45.5,"y":53.5,"behind":true},
        "front": {"x":44,"y":55,"behind":true},
        "back": {"x":40.5,"y":55},
        "right": {"x":18.5,"y":53.5,"behind":true}
      },
      "salem": {
        "left": {"x":45.5,"y":53.5,"behind":true},
        "front": {"x":44,"y":55,"behind":true},
        "back": {"x":40.5,"y":55},
        "right": {"x":18.5,"y":53.5,"behind":true}
      },
      "ball": {
        "left": {"x":45.5,"y":53.5,"behind":true},
        "front": {"x":44,"y":55,"behind":true},
        "back": {"x":40.5,"y":55},
        "right": {"x":18.5,"y":53.5,"behind":true}
      },
      "taana": {
        "left": {"x":45.5,"y":55.5,"behind":true},
        "front": {"x":44,"y":57,"behind":true},
        "back": {"x":40.5,"y":57},
        "right": {"x":18.5,"y":55.5,"behind":true}
      },
      "colyn": {
        "left": {"x":45.5,"y":53.5,"behind":true},
        "front": {"x":44,"y":55,"behind":true},
        "back": {"x":40.5,"y":55},
        "right": {"x":18.5,"y":53.5,"behind":true}
      },
      "rowan": {
        "left": {"x":45.5,"y":53.5,"behind":true},
        "front": {"x":44,"y":55,"behind":true},
        "back": {"x":40.5,"y":55},
        "right": {"x":18.5,"y":53.5,"behind":true}
      },
      "cael": {
        "left": {"x":45.5,"y":53.5,"behind":true},
        "front": {"x":44,"y":55,"behind":true},
        "back": {"x":40.5,"y":55},
        "right": {"x":18.5,"y":53.5,"behind":true}
      },
      "saku": {
        "left": {"x":45.5,"y":53.5,"behind":true},
        "front": {"x":44,"y":55,"behind":true},
        "back": {"x":40.5,"y":55},
        "right": {"x":18.5,"y":53.5,"behind":true}
      },
      "kakuma": {
        "left": {"x":45.5,"y":53.5,"behind":true},
        "front": {"x":44,"y":55,"behind":true},
        "back": {"x":40.5,"y":55},
        "right": {"x":18.5,"y":53.5,"behind":true}
      }
    },
    "wolf-tail": {
      "winter": {
        "left": {"x":43,"y":58.5,"behind":true},
        "front": {"x":43,"y":56.5,"behind":true},
        "back": {"x":27,"y":59},
        "right": {"x":21,"y":58,"behind":true}
      }
    },
    "star-wand": {
      "winter": {
        "front": {"x":13.5,"y":41},
        "left": {"x":21,"y":44,"behind":true},
        "back": {"x":50,"y":40,"behind":true,"flip":true},
        "right": {"x":27.5,"y":42.5}
      },
      "theonie": {
        "front": {"x":13.5,"y":45},
        "left": {"x":21,"y":48,"behind":true},
        "back": {"x":50,"y":44,"behind":true,"flip":true},
        "right": {"x":27.5,"y":46.5}
      },
      "amber": {
        "front": {"x":13.5,"y":44},
        "left": {"x":21,"y":47,"behind":true},
        "back": {"x":50,"y":43,"behind":true,"flip":true},
        "right": {"x":27.5,"y":45.5}
      },
      "red": {
        "front": {"x":13.5,"y":41},
        "left": {"x":21,"y":44,"behind":true},
        "back": {"x":50,"y":40,"behind":true,"flip":true},
        "right": {"x":27.5,"y":42.5}
      },
      "avaren": {
        "front": {"x":13.5,"y":41},
        "left": {"x":21,"y":44,"behind":true},
        "back": {"x":50,"y":40,"behind":true,"flip":true},
        "right": {"x":27.5,"y":42.5}
      },
      "luther": {
        "front": {"x":13.5,"y":41},
        "left": {"x":21,"y":44,"behind":true},
        "back": {"x":50,"y":40,"behind":true,"flip":true},
        "right": {"x":27.5,"y":42.5}
      },
      "eldrin": {
        "front": {"x":13.5,"y":41},
        "left": {"x":21,"y":44,"behind":true},
        "back": {"x":50,"y":40,"behind":true,"flip":true},
        "right": {"x":27.5,"y":42.5}
      },
      "chris": {
        "front": {"x":13.5,"y":41},
        "left": {"x":21,"y":44,"behind":true},
        "back": {"x":50,"y":40,"behind":true,"flip":true},
        "right": {"x":27.5,"y":42.5}
      },
      "tino": {
        "front": {"x":13.5,"y":41},
        "left": {"x":21,"y":44,"behind":true},
        "back": {"x":50,"y":40,"behind":true,"flip":true},
        "right": {"x":27.5,"y":42.5}
      },
      "claire": {
        "front": {"x":13.5,"y":41},
        "left": {"x":21,"y":44,"behind":true},
        "back": {"x":50,"y":40,"behind":true,"flip":true},
        "right": {"x":27.5,"y":42.5}
      },
      "muomn": {
        "front": {"x":13.5,"y":41},
        "left": {"x":21,"y":44,"behind":true},
        "back": {"x":50,"y":40,"behind":true,"flip":true},
        "right": {"x":27.5,"y":42.5}
      },
      "noah": {
        "front": {"x":13.5,"y":41},
        "left": {"x":21,"y":44,"behind":true},
        "back": {"x":50,"y":40,"behind":true,"flip":true},
        "right": {"x":27.5,"y":42.5}
      },
      "ash": {
        "front": {"x":13.5,"y":41},
        "left": {"x":21,"y":44,"behind":true},
        "back": {"x":50,"y":40,"behind":true,"flip":true},
        "right": {"x":27.5,"y":42.5}
      },
      "eden": {
        "front": {"x":13.5,"y":41},
        "left": {"x":21,"y":44,"behind":true},
        "back": {"x":50,"y":40,"behind":true,"flip":true},
        "right": {"x":27.5,"y":42.5}
      },
      "salem": {
        "front": {"x":13.5,"y":41},
        "left": {"x":21,"y":44,"behind":true},
        "back": {"x":50,"y":40,"behind":true,"flip":true},
        "right": {"x":27.5,"y":42.5}
      },
      "ball": {
        "front": {"x":44,"y":33},
        "left": {"x":21,"y":44,"behind":true},
        "back": {"x":50,"y":40,"behind":true,"flip":true},
        "right": {"x":27.5,"y":42.5}
      },
      "taana": {
        "front": {"x":13.5,"y":43},
        "left": {"x":21,"y":46,"behind":true},
        "back": {"x":50,"y":42,"behind":true,"flip":true},
        "right": {"x":27.5,"y":44.5}
      },
      "colyn": {
        "front": {"x":13.5,"y":41},
        "left": {"x":21,"y":44,"behind":true},
        "back": {"x":50,"y":40,"behind":true,"flip":true},
        "right": {"x":27.5,"y":42.5}
      },
      "rowan": {
        "front": {"x":13.5,"y":41},
        "left": {"x":21,"y":44,"behind":true},
        "back": {"x":50,"y":40,"behind":true,"flip":true},
        "right": {"x":27.5,"y":42.5}
      },
      "cael": {
        "front": {"x":13.5,"y":41},
        "left": {"x":21,"y":44,"behind":true},
        "back": {"x":50,"y":40,"behind":true,"flip":true},
        "right": {"x":27.5,"y":42.5}
      },
      "saku": {
        "front": {"x":13.5,"y":41},
        "left": {"x":21,"y":44,"behind":true},
        "back": {"x":50,"y":40,"behind":true,"flip":true},
        "right": {"x":27.5,"y":42.5}
      },
      "kakuma": {
        "front": {"x":13.5,"y":41},
        "left": {"x":21,"y":44,"behind":true},
        "back": {"x":50,"y":40,"behind":true,"flip":true},
        "right": {"x":27.5,"y":42.5}
      }
    },
    "striped-bag": {
      "winter": {
        "front": {"x":44.5,"y":56.5},
        "left": {"x":32.5,"y":58},
        "back": {"x":18.5,"y":56.5,"behind":true},
        "right": {"x":38,"y":55,"behind":true}
      },
      "theonie": {
        "front": {"x":44.5,"y":58},
        "left": {"x":32.5,"y":58},
        "back": {"x":18.5,"y":58,"behind":true},
        "right": {"x":38,"y":58,"behind":true}
      },
      "amber": {
        "front": {"x":44.5,"y":57.5},
        "left": {"x":32.5,"y":60},
        "back": {"x":18.5,"y":59.5,"behind":true},
        "right": {"x":38,"y":56.5,"behind":true}
      },
      "red": {
        "front": {"x":44.5,"y":56.5},
        "left": {"x":32.5,"y":58},
        "back": {"x":18.5,"y":56.5,"behind":true},
        "right": {"x":38,"y":55,"behind":true}
      },
      "avaren": {
        "front": {"x":44.5,"y":56.5},
        "left": {"x":32.5,"y":58},
        "back": {"x":18.5,"y":56.5,"behind":true},
        "right": {"x":38,"y":55,"behind":true}
      },
      "luther": {
        "front": {"x":44.5,"y":56.5},
        "left": {"x":32.5,"y":58},
        "back": {"x":18.5,"y":56.5,"behind":true},
        "right": {"x":38,"y":55,"behind":true}
      },
      "eldrin": {
        "front": {"x":44.5,"y":56.5},
        "left": {"x":32.5,"y":58},
        "back": {"x":18.5,"y":56.5,"behind":true},
        "right": {"x":38,"y":55,"behind":true}
      },
      "chris": {
        "front": {"x":44.5,"y":56.5},
        "left": {"x":32.5,"y":58},
        "back": {"x":18.5,"y":56.5,"behind":true},
        "right": {"x":38,"y":55,"behind":true}
      },
      "tino": {
        "front": {"x":44.5,"y":56.5},
        "left": {"x":32.5,"y":58},
        "back": {"x":18.5,"y":56.5,"behind":true},
        "right": {"x":38,"y":55,"behind":true}
      },
      "claire": {
        "front": {"x":44.5,"y":56.5},
        "left": {"x":32.5,"y":58},
        "back": {"x":18.5,"y":56.5,"behind":true},
        "right": {"x":38,"y":55,"behind":true}
      },
      "muomn": {
        "front": {"x":44.5,"y":56.5},
        "left": {"x":32.5,"y":58},
        "back": {"x":18.5,"y":56.5,"behind":true},
        "right": {"x":38,"y":55,"behind":true}
      },
      "noah": {
        "front": {"x":44.5,"y":56.5},
        "left": {"x":32.5,"y":58},
        "back": {"x":18.5,"y":56.5,"behind":true},
        "right": {"x":38,"y":55,"behind":true}
      },
      "ash": {
        "front": {"x":44.5,"y":56.5},
        "left": {"x":32.5,"y":58},
        "back": {"x":18.5,"y":56.5,"behind":true},
        "right": {"x":38,"y":55,"behind":true}
      },
      "eden": {
        "front": {"x":44.5,"y":56.5},
        "left": {"x":32.5,"y":58},
        "back": {"x":18.5,"y":56.5,"behind":true},
        "right": {"x":38,"y":55,"behind":true}
      },
      "salem": {
        "front": {"x":44.5,"y":56.5},
        "left": {"x":32.5,"y":58},
        "back": {"x":18.5,"y":56.5,"behind":true},
        "right": {"x":38,"y":55,"behind":true}
      },
      "ball": {
        "front": {"x":31,"y":43.5},
        "left": {"x":32.5,"y":58},
        "back": {"x":18.5,"y":56.5,"behind":true},
        "right": {"x":38,"y":55,"behind":true}
      },
      "taana": {
        "front": {"x":44.5,"y":58.5},
        "left": {"x":32.5,"y":60},
        "back": {"x":18.5,"y":58.5,"behind":true},
        "right": {"x":38,"y":57,"behind":true}
      },
      "colyn": {
        "front": {"x":44.5,"y":56.5},
        "left": {"x":32.5,"y":58},
        "back": {"x":18.5,"y":56.5,"behind":true},
        "right": {"x":38,"y":55,"behind":true}
      },
      "rowan": {
        "front": {"x":44.5,"y":56.5},
        "left": {"x":32.5,"y":58},
        "back": {"x":18.5,"y":56.5,"behind":true},
        "right": {"x":38,"y":55,"behind":true}
      },
      "cael": {
        "front": {"x":44.5,"y":56.5},
        "left": {"x":32.5,"y":58},
        "back": {"x":18.5,"y":56.5,"behind":true},
        "right": {"x":38,"y":55,"behind":true}
      },
      "saku": {
        "front": {"x":44.5,"y":56.5},
        "left": {"x":32.5,"y":58},
        "back": {"x":18.5,"y":56.5,"behind":true},
        "right": {"x":38,"y":55,"behind":true}
      },
      "kakuma": {
        "front": {"x":44.5,"y":56.5},
        "left": {"x":32.5,"y":58},
        "back": {"x":18.5,"y":56.5,"behind":true},
        "right": {"x":38,"y":55,"behind":true}
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
    "colyn": {"front":[[0,0],[0,1]],"left":[[0,0],[0,1]],"right":[[0,0],[0,1]]},
    "rowan": {"back":[[0,1],[0,0]]},
    "cael": {"front":[[0,0],[0,1]],"back":[[0,1],[0,0]]},
    "saku": {"back":[[0,1],[0,0]]},
    "kakuma": {"back":[[-2,0],[-1,0]]},
    "taana": {"back":[[0,1],[0,0]]}
  },
  "offsets": {
    "theonie": {"x":0,"y":4},
    "amber": {"x":0,"y":3},
    "taana": {"x":0,"y":2}
  },
  "blocked": {"angel-wings":["ball"],"devil-horns":["ball"],"round-glasses":["ball"],"sunglasses":["ball"],"bear-hood":["ball"],"white-wings":["ball"],"devil-wings":["ball"],"devil-tail":["ball"],"star-wand":["ball"],"striped-bag":["ball"],"large-bow-red":["ball"],"large-bow-blue":["ball"],"large-bow-white":["ball"],"minnie-ribbon":["ball"]},
  "layers": {"star-wand":7}
};
