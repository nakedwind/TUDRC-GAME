/* 由椅子編輯器匯出：深度 px、擋路格、坐下位置 px。 */
const CHAIRS_DEFAULT = {
  "tile_decor_foldingchair": {
    "enabled": true,
    "depth": 32,
    "solid": [
      [
        0,
        0
      ]
    ],
    "seat": {
      "x": 20,
      "y": 24,
      "dir": "front"
    }
  },
  "tile_new_decor_chair_front": {
    "enabled": true,
    "depth": 17,
    "solid": [
      [
        0,
        0
      ]
    ],
    "seat": {
      "x": 20,
      "y": 14,
      "dir": "front"
    }
  },
  "tile_new_decor_chair_side": {
    "enabled": true,
    "depth": 72,
    "solid": [
      [
        0,
        1
      ]
    ],
    "seat": {
      "x": 10,
      "y": 25,
      "dir": "left"
    }
  },
  "tile_eoc_office_chair_black": {
    "enabled": true,
    "depth": 58,
    "solid": [],
    "seat": {
      "x": 8,
      "y": 43,
      "dir": "left"
    }
  },
  "tile_eoc_office_chair_grey": {
    "enabled": true,
    "depth": 72,
    "solid": [
      [
        0,
        1
      ]
    ],
    "seat": {
      "x": 9,
      "y": 44,
      "dir": "left"
    }
  },
  "tile_eoc_sofa_side": {
    "enabled": true,
    "depth": 97,
    "solid": [
      [
        0,
        2
      ],
      [
        0,
        1
      ]
    ],
    "seat": {
      "x": 31,
      "y": 75,
      "dir": "right"
    }
  },
  "tile_eoc_sofa": {
    "enabled": true,
    "depth": 53,
    "solid": [
      [
        0,
        1
      ],
      [
        1,
        1
      ]
    ],
    "seat": {
      "x": 25,
      "y": 53,
      "dir": "front"
    }
  },
  "tile_counseling_counselor_chair": {
    "enabled": true,
    "depth": 46,
    "solid": [
      [
        0,
        1
      ]
    ],
    "seat": {
      "x": 20,
      "y": 38,
      "dir": "front"
    }
  },
  "tile_counseling_visitor_chair": {
    "enabled": true,
    "depth": 72,
    "solid": [
      [
        0,
        1
      ]
    ],
    "seat": {
      "x": 20,
      "y": 21,
      "dir": "back"
    }
  },
  "tile_prop_sofa_beige_side": {
    "enabled": true,
    "depth": 83,
    "solid": [
      [
        0,
        2
      ],
      [
        0,
        1
      ]
    ],
    "seat": {
      "x": 26,
      "y": 77,
      "dir": "right"
    }
  },
  "tile_dorm_office_chair_back": {
    "enabled": true,
    "depth": 65,
    "solid": [],
    "seat": {
      "x": 39,
      "y": 39,
      "dir": "back"
    }
  },
  "tile_dorm_chair_blue": {
    "enabled": true,
    "depth": 48,
    "solid": [
      [
        0,
        1
      ]
    ],
    "seat": {
      "x": 20,
      "y": 44,
      "dir": "back"
    }
  },
  "tile_dorm_shoe_bench": {
    "enabled": true,
    "depth": 92,
    "solid": [
      [
        0,
        2
      ],
      [
        0,
        1
      ]
    ],
    "seat": {
      "x": 20,
      "y": 66,
      "dir": "right"
    }
  },
  "tile_restaurant_chair_side": {
    "enabled": true,
    "depth": 51,
    "solid": [
      [
        0,
        1
      ]
    ],
    "seat": {
      "x": 17,
      "y": 41,
      "dir": "left"
    }
  },
  "tile_restaurant_booth_seating_vertical": {
    "enabled": true,
    "depth": 66,
    "solid": [
      [
        0,
        6
      ],
      [
        0,
        5
      ],
      [
        0,
        4
      ],
      [
        0,
        3
      ],
      [
        0,
        2
      ],
      [
        0,
        1
      ]
    ],
    "seat": {
      "x": 23,
      "y": 63,
      "dir": "right"
    }
  },
  "tile_field_camp_bed": {
    "enabled": true,
    "depth": 72,
    "solid": [
      [
        0,
        0
      ],
      [
        0,
        1
      ],
      [
        1,
        0
      ],
      [
        1,
        1
      ]
    ],
    "seat": {
      "x": 30,
      "y": 57,
      "dir": "front",
      "rotation": 270
    }
  },
  "tile_field_camp_bed_v": {
    "enabled": true,
    "depth": 55,
    "solid": [
      [
        0,
        0
      ],
      [
        0,
        1
      ]
    ],
    "seat": {
      "x": 20,
      "y": 45,
      "dir": "front"
    }
  },
  "tile_counseling_monitoring_bed": {
    "enabled": true,
    "depth": 55,
    "solid": [
      [
        0,
        1
      ],
      [
        0,
        2
      ],
      [
        1,
        1
      ],
      [
        1,
        2
      ],
      [
        0,
        0
      ],
      [
        1,
        0
      ]
    ],
    "seat": {
      "x": 40,
      "y": 52,
      "dir": "front"
    }
  },
  "tile_prop_single_bed": {
    "enabled": true,
    "depth": 52,
    "solid": [
      [
        0,
        1
      ],
      [
        1,
        1
      ],
      [
        2,
        1
      ]
    ],
    "seat": {
      "x": 70,
      "y": 56,
      "dir": "front",
      "rotation": 90
    }
  },
  "tile_dorm_bed_horizontal": {
    "enabled": true,
    "depth": 112,
    "solid": [
      [
        0,
        1
      ],
      [
        0,
        2
      ],
      [
        1,
        1
      ],
      [
        1,
        2
      ],
      [
        2,
        1
      ],
      [
        2,
        2
      ]
    ],
    "seat": {
      "x": 80,
      "y": 85,
      "dir": "front",
      "rotation": 90
    }
  },
  "tile_dorm_bed_vertical": {
    "enabled": true,
    "depth": 97,
    "solid": [
      [
        0,
        1
      ],
      [
        0,
        2
      ],
      [
        0,
        3
      ]
    ],
    "seat": {
      "x": 41,
      "y": 92,
      "dir": "front"
    }
  },
  "tile_counseling_medical_stool": {
    "enabled": true,
    "depth": 32,
    "solid": [
      [
        0,
        0
      ]
    ],
    "seat": {
      "x": 20,
      "y": 22,
      "dir": "front",
      "rotation": 0
    }
  },
  "tile_restaurant_counter_stool_red": {
    "enabled": true,
    "depth": 30,
    "solid": [
      [
        0,
        0
      ]
    ],
    "seat": {
      "x": 20,
      "y": 9,
      "dir": "front"
    }
  },
  "tile_hospital_hospital_bed": {
    "enabled": true,
    "depth": 95,
    "solid": [
      [
        0,
        0
      ],
      [
        1,
        0
      ],
      [
        0,
        1
      ],
      [
        1,
        1
      ],
      [
        0,
        2
      ],
      [
        1,
        2
      ]
    ],
    "seat": {
      "x": 40,
      "y": 58,
      "dir": "front"
    }
  },
  "tile_hospital_hospital_bed_no_pillow": {
    "enabled": true,
    "depth": 95,
    "solid": [
      [
        0,
        0
      ],
      [
        1,
        0
      ],
      [
        0,
        1
      ],
      [
        1,
        1
      ],
      [
        0,
        2
      ],
      [
        1,
        2
      ]
    ],
    "seat": {
      "x": 39,
      "y": 70,
      "dir": "front",
      "rotation": 180
    }
  },
  "tile_hospital_armchair_front": {
    "enabled": true,
    "depth": 46,
    "solid": [
      [
        0,
        1
      ]
    ],
    "seat": {
      "x": 20,
      "y": 40,
      "dir": "front"
    }
  },
  "tile_hospital_armchair_back": {
    "enabled": true,
    "depth": 47,
    "solid": [
      [
        0,
        1
      ]
    ],
    "seat": {
      "x": 20,
      "y": 40,
      "dir": "back"
    }
  },
  "tile_hospital_waiting_bench_side": {
    "enabled": true,
    "depth": 70,
    "solid": [
      [
        0,
        1
      ],
      [
        0,
        2
      ]
    ],
    "seat": {
      "x": 20,
      "y": 66,
      "dir": "right"
    }
  },
  "tile_restaurant_water_dispenser_01": {
    "enabled": true,
    "depth": 72,
    "solid": [
      [
        0,
        1
      ]
    ],
    "seat": {
      "x": 20,
      "y": 40,
      "dir": "back"
    }
  },
  "tile_restaurant_water_dispenser_02": {
    "enabled": true,
    "depth": 46,
    "solid": [
      [
        0,
        1
      ]
    ],
    "seat": {
      "x": 20,
      "y": 46,
      "dir": "front"
    }
  }
};
