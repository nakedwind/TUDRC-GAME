/* ===== 劇情地圖（由「📖 劇情地圖編輯器」匯出）=====
   只放劇情地圖；每張圖可自行設定為安全場景或戰鬥場景。
   素材（磚塊）在三個編輯器共用的 data/tiles.js。
   整段貼回 data/story-maps.js 覆蓋即可。 */
const STORY_MAPS = [
  {
    "id": "story_start",
    "name": "雷德回憶01",
    "desc": "",
    "safe": true,
    "npcs": false,
    "cols": 32,
    "rows": 18,
    "layers": {
      "floor": {
        "0,15": "floor",
        "0,14": "floor",
        "0,13": "floor",
        "0,12": "floor",
        "0,11": "floor",
        "0,10": "floor",
        "0,9": "floor",
        "0,4": "floor",
        "0,5": "floor",
        "0,8": "floor",
        "0,7": "floor",
        "0,6": "floor",
        "0,0": "floor",
        "1,0": "floor",
        "2,0": "floor",
        "3,0": "floor",
        "4,0": "floor",
        "5,0": "floor",
        "6,0": "floor",
        "7,0": "floor",
        "8,0": "floor",
        "9,0": "floor",
        "10,0": "floor",
        "11,0": "floor",
        "12,0": "floor",
        "13,0": "floor",
        "14,0": "floor",
        "15,0": "floor",
        "16,0": "floor",
        "17,0": "floor",
        "18,0": "floor",
        "19,0": "floor",
        "20,0": "floor",
        "21,0": "floor",
        "22,0": "floor",
        "23,0": "floor",
        "24,0": "floor",
        "25,0": "floor",
        "26,0": "floor",
        "27,0": "floor",
        "28,0": "floor",
        "29,0": "floor",
        "30,0": "floor",
        "31,0": "floor",
        "15,14": "floor",
        "15,13": "floor",
        "13,13": "tile_obstacle_camping_lights"
      },
      "ground": {},
      "ground2": {},
      "ground3": {},
      "object": {},
      "object2": {},
      "object3": {
        "7,4": "tile_obstacle_wirecloth_v"
      },
      "object4": {
        "16,10": "tile_obstacle_camping_lights",
        "13,13": "tile_obstacle_camping_lights"
      },
      "overlay": {},
      "top": {
        "3,14": "tile_mr4czvpx",
        "3,15": "tile_mr4czvpx",
        "3,16": "tile_mr4czvpx",
        "3,17": "tile_mr4czvpx",
        "28,14": "tile_mr4czvpx",
        "28,15": "tile_mr4czvpx",
        "28,16": "tile_mr4czvpx",
        "28,17": "tile_mr4czvpx"
      }
    },
    "stamps": [
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 7,
        "r": 7,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 10,
        "r": 7,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 13,
        "r": 7,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 16,
        "r": 7,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 19,
        "r": 7,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 7,
        "r": 10,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 10,
        "r": 10,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 13,
        "r": 10,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 16,
        "r": 10,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 19,
        "r": 10,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 7,
        "r": 13,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 10,
        "r": 13,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 19,
        "r": 13,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 16,
        "r": 13,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 13,
        "r": 13,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 22,
        "r": 13,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 22,
        "r": 7,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 22,
        "r": 10,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 4,
        "r": 13,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 4,
        "r": 10,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 4,
        "r": 7,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 4,
        "r": 4,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 7,
        "r": 4,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 10,
        "r": 4,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 13,
        "r": 4,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 16,
        "r": 4,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 19,
        "r": 4,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 22,
        "r": 4,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 25,
        "r": 4,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 25,
        "r": 7,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 25,
        "r": 10,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 25,
        "r": 13,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 4,
        "r": 1,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 7,
        "r": 1,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 10,
        "r": 1,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 13,
        "r": 1,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 16,
        "r": 1,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 19,
        "r": 1,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 22,
        "r": 1,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 25,
        "r": 1,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_pillar3",
        "c": 3,
        "r": 12,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_pillar3",
        "c": 28,
        "r": 12,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_pillar3",
        "c": 3,
        "r": 0,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_pillar3",
        "c": 28,
        "r": 0,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02_dmg_heavy",
        "c": 4,
        "r": 1,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 7,
        "r": 1,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 8,
        "r": 1,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 9,
        "r": 1,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 21,
        "r": 1,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 22,
        "r": 1,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 23,
        "r": 1,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 24,
        "r": 1,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 25,
        "r": 1,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 26,
        "r": 1,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 27,
        "r": 1,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 20,
        "r": 1,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 14,
        "r": 1,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 15,
        "r": 1,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 16,
        "r": 1,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 17,
        "r": 1,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 18,
        "r": 1,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 19,
        "r": 1,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 28,
        "r": 4,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 28,
        "r": 7,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 28,
        "r": 10,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 28,
        "r": 13,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 1,
        "r": 4,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 1,
        "r": 7,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 1,
        "r": 10,
        "layer": "floor"
      },
      {
        "id": "tile_mvmo40q4",
        "c": 17,
        "r": 4,
        "layer": "object"
      },
      {
        "id": "tile_mvmo77lx",
        "c": 8,
        "r": 13,
        "layer": "ground"
      },
      {
        "id": "tile_mvmo7lty",
        "c": 15,
        "r": 5,
        "layer": "ground"
      },
      {
        "id": "tile_mvmo7lty",
        "c": 24,
        "r": 11,
        "layer": "ground2"
      },
      {
        "id": "tile_mvmo7lty",
        "c": 26,
        "r": 11,
        "layer": "ground2"
      },
      {
        "id": "tile_mvmo7lty",
        "c": 19,
        "r": 8,
        "layer": "ground2"
      },
      {
        "id": "tile_dmg_rubble_pile_large",
        "c": 11,
        "r": 4,
        "layer": "ground2"
      },
      {
        "id": "tile_dmg_rubble_pile_medium",
        "c": 4,
        "r": 10,
        "layer": "ground2"
      },
      {
        "id": "tile_dmg_rubble_block_dark",
        "c": 7,
        "r": 11,
        "layer": "ground2"
      },
      {
        "id": "tile_dmg_floor_crack_cross",
        "c": 14,
        "r": 7,
        "layer": "ground2"
      },
      {
        "id": "tile_dmg_floor_crack_cross",
        "c": 28,
        "r": 7,
        "layer": "ground2"
      },
      {
        "id": "tile_dmg_floor_crack_fork",
        "c": 10,
        "r": 7,
        "layer": "ground2"
      },
      {
        "id": "tile_dmg_floor_crack_stained",
        "c": 27,
        "r": 9,
        "layer": "ground2"
      },
      {
        "id": "tile_dmg_floor_stain_seep",
        "c": 9,
        "r": 9,
        "layer": "ground2"
      },
      {
        "id": "tile_dmg_floor_stain_smudge",
        "c": 22,
        "r": 13,
        "layer": "ground2"
      },
      {
        "id": "tile_dmg_rubble_brick_chunks",
        "c": 10,
        "r": 9,
        "layer": "ground2"
      },
      {
        "id": "tile_dmg_rubble_brick_chunks",
        "c": 7,
        "r": 12,
        "layer": "ground2"
      },
      {
        "id": "tile_dmg_rubble_brick_chunks",
        "c": 1,
        "r": 11,
        "layer": "ground2"
      },
      {
        "id": "tile_dmg_rubble_chips_02",
        "c": 5,
        "r": 14,
        "layer": "ground2"
      },
      {
        "id": "tile_dmg_rubble_wall_chunks",
        "c": 16,
        "r": 15,
        "layer": "ground2"
      },
      {
        "id": "tile_dmg_rubble_wall_chunks",
        "c": 9,
        "r": 6,
        "layer": "ground2"
      },
      {
        "id": "tile_dmg_rubble_scatter",
        "c": 8,
        "r": 5,
        "layer": "ground2"
      },
      {
        "id": "tile_dmg_floor_crater",
        "c": 4,
        "r": 6,
        "layer": "ground2"
      },
      {
        "id": "tile_dmg_floor_crater",
        "c": 24,
        "r": 13,
        "layer": "ground2"
      },
      {
        "id": "tile_new_decor_rock02",
        "c": 8,
        "r": 11,
        "layer": "ground2"
      },
      {
        "id": "tile_new_decor_rock02",
        "c": 18,
        "r": 4,
        "layer": "ground2"
      },
      {
        "id": "tile_new_decor_rock02",
        "c": 15,
        "r": 4,
        "layer": "ground2"
      },
      {
        "id": "tile_new_decor_rock02",
        "c": 28,
        "r": 6,
        "layer": "ground2"
      },
      {
        "id": "tile_new_decor_rock02",
        "c": 24,
        "r": 4,
        "layer": "ground3"
      },
      {
        "id": "tile_new_decor_rock02",
        "c": 29,
        "r": 8,
        "layer": "ground3"
      },
      {
        "id": "tile_new_decor_rock03",
        "c": 21,
        "r": 11,
        "layer": "ground3"
      },
      {
        "id": "tile_new_decor_rock03",
        "c": 16,
        "r": 7,
        "layer": "ground3"
      },
      {
        "id": "tile_new_decor_rock03",
        "c": 4,
        "r": 4,
        "layer": "ground3"
      },
      {
        "id": "tile_new_decor_rock03",
        "c": 0,
        "r": 4,
        "layer": "ground3"
      },
      {
        "id": "tile_new_decor_crack02",
        "c": 14,
        "r": 13,
        "layer": "ground"
      },
      {
        "id": "tile_new_decor_crack04",
        "c": 19,
        "r": 12,
        "layer": "ground"
      },
      {
        "id": "tile_new_decor_crack04",
        "c": 16,
        "r": 9,
        "layer": "ground"
      },
      {
        "id": "tile_dmg_floor_crack_cross",
        "c": 22,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_dmg_crack05",
        "c": 23,
        "r": 11,
        "layer": "ground"
      },
      {
        "id": "tile_dmg_crack05",
        "c": 16,
        "r": 6,
        "layer": "ground"
      },
      {
        "id": "tile_dmg_crack06",
        "c": 12,
        "r": 8,
        "layer": "ground"
      },
      {
        "id": "tile_dmg_crack06",
        "c": 22,
        "r": 4,
        "layer": "ground"
      },
      {
        "id": "tile_dmg_rubble_rocks",
        "c": 5,
        "r": 13,
        "layer": "ground"
      },
      {
        "id": "tile_dmg_rubble_rocks",
        "c": 1,
        "r": 5,
        "layer": "ground"
      },
      {
        "id": "tile_dmg_rubble_rocks",
        "c": 28,
        "r": 4,
        "layer": "ground"
      },
      {
        "id": "tile_dmg_rubble_pile_large",
        "c": 2,
        "r": 4,
        "layer": "ground"
      },
      {
        "id": "tile_dmg_rubble_pile_large",
        "c": 0,
        "r": 6,
        "layer": "ground"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 31,
        "r": 4,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 31,
        "r": 7,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 31,
        "r": 10,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 31,
        "r": 13,
        "layer": "floor"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 29,
        "r": 1,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 30,
        "r": 1,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 31,
        "r": 1,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 2,
        "r": 1,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 0,
        "r": 1,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 1,
        "r": 1,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 0,
        "r": 13,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 1,
        "r": 13,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 2,
        "r": 13,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 29,
        "r": 13,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 31,
        "r": 13,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 30,
        "r": 13,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 4,
        "r": 15,
        "layer": "overlay"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 5,
        "r": 15,
        "layer": "overlay"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 6,
        "r": 15,
        "layer": "overlay"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 7,
        "r": 15,
        "layer": "overlay"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 8,
        "r": 15,
        "layer": "overlay"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 9,
        "r": 15,
        "layer": "overlay"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 10,
        "r": 15,
        "layer": "overlay"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 11,
        "r": 15,
        "layer": "overlay"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 12,
        "r": 15,
        "layer": "overlay"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 13,
        "r": 15,
        "layer": "overlay"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 15,
        "r": 15,
        "layer": "overlay"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 14,
        "r": 15,
        "layer": "overlay"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 16,
        "r": 15,
        "layer": "overlay"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 18,
        "r": 15,
        "layer": "overlay"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 17,
        "r": 15,
        "layer": "overlay"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 20,
        "r": 15,
        "layer": "overlay"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 19,
        "r": 15,
        "layer": "overlay"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 21,
        "r": 15,
        "layer": "overlay"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 22,
        "r": 15,
        "layer": "overlay"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 23,
        "r": 15,
        "layer": "overlay"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 24,
        "r": 15,
        "layer": "overlay"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 26,
        "r": 15,
        "layer": "overlay"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 25,
        "r": 15,
        "layer": "overlay"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 27,
        "r": 15,
        "layer": "overlay"
      },
      {
        "id": "tile_field_camp_bed",
        "c": 14,
        "r": 10,
        "layer": "object2",
        "sortDepth": 1.5
      },
      {
        "id": "tile_mvmo77lx",
        "c": 16,
        "r": 5,
        "layer": "ground"
      },
      {
        "id": "tile_dmg_broken_pillar_rebar",
        "c": 1,
        "r": 9,
        "layer": "object2"
      },
      {
        "id": "tile_dmg_broken_wall_right",
        "c": 4,
        "r": 6,
        "layer": "object2",
        "ox": 0,
        "oy": 8
      },
      {
        "id": "tile_mr4cyy36",
        "c": 3,
        "r": 7,
        "layer": "object2"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 2,
        "r": 7,
        "layer": "object2"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 1,
        "r": 7,
        "layer": "object2"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 0,
        "r": 7,
        "layer": "object2"
      },
      {
        "id": "tile_dmg_broken_wall_breach",
        "c": 10,
        "r": 0,
        "layer": "object2",
        "ox": 0,
        "oy": 10
      },
      {
        "id": "tile_mvmo6xof",
        "c": 17,
        "r": 7,
        "layer": "ground3"
      },
      {
        "id": "tile_mvmo6xof",
        "c": 5,
        "r": 5,
        "layer": "ground3"
      },
      {
        "id": "tile_dmg_crack06",
        "c": 9,
        "r": 11,
        "layer": "ground"
      },
      {
        "id": "tile_dmg_crack06",
        "c": 17,
        "r": 12,
        "layer": "ground"
      },
      {
        "id": "tile_dmg_floor_crater",
        "c": 14,
        "r": 12,
        "layer": "ground",
        "ox": -14,
        "oy": 0
      },
      {
        "id": "tile_dmg_floor_crater",
        "c": 8,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_dmg_floor_crater",
        "c": 30,
        "r": 5,
        "layer": "ground"
      },
      {
        "id": "tile_dmg_floor_crack_stained",
        "c": 30,
        "r": 11,
        "layer": "ground"
      },
      {
        "id": "tile_dmg_floor_crack_stained",
        "c": 12,
        "r": 14,
        "layer": "ground"
      },
      {
        "id": "tile_dmg_rubble_pile_large",
        "c": 8,
        "r": 0,
        "layer": "ground3"
      },
      {
        "id": "tile_dmg_rubble_pile_large",
        "c": 29,
        "r": 4,
        "layer": "ground"
      },
      {
        "id": "tile_dmg_rubble_pile_large",
        "c": 27,
        "r": 11,
        "layer": "ground"
      },
      {
        "id": "tile_dmg_rubble_pile_large",
        "c": 10,
        "r": 13,
        "layer": "ground"
      },
      {
        "id": "tile_obstacle_roadblocks_v",
        "c": 7,
        "r": 5,
        "layer": "object3"
      },
      {
        "id": "tile_obstacle_roadblocks_v",
        "c": 7,
        "r": 7,
        "layer": "object3"
      },
      {
        "id": "tile_obstacle_roadblocks_v",
        "c": 7,
        "r": 9,
        "layer": "object3"
      },
      {
        "id": "tile_obstacle_roadblocks_v",
        "c": 7,
        "r": 11,
        "layer": "object3"
      },
      {
        "id": "tile_obstacle_roadblocks_v",
        "c": 4,
        "r": 11,
        "layer": "object3"
      },
      {
        "id": "tile_mr4ja2cb",
        "c": 6,
        "r": 8,
        "layer": "object"
      },
      {
        "id": "tile_mr4ja2cb",
        "c": 8,
        "r": 8,
        "layer": "object"
      },
      {
        "id": "tile_obstacle_wirefence_v",
        "c": 3,
        "r": 10,
        "layer": "object3"
      },
      {
        "id": "tile_obstacle_roadblocks_v",
        "c": 28,
        "r": 4,
        "layer": "object3"
      },
      {
        "id": "tile_obstacle_roadblocks_v",
        "c": 28,
        "r": 6,
        "layer": "object3"
      },
      {
        "id": "tile_obstacle_roadblocks_v",
        "c": 28,
        "r": 8,
        "layer": "object3"
      },
      {
        "id": "tile_obstacle_roadblocks_v",
        "c": 28,
        "r": 10,
        "layer": "object3"
      },
      {
        "id": "tile_mr4ja2cb",
        "c": 27,
        "r": 12,
        "layer": "object3"
      },
      {
        "id": "tile_mr4ja2cb",
        "c": 26,
        "r": 12,
        "layer": "object3"
      },
      {
        "id": "tile_mr4ja2cb",
        "c": 25,
        "r": 12,
        "layer": "object3"
      },
      {
        "id": "tile_obstacle_searchlight_h",
        "c": 24,
        "r": 12,
        "layer": "object4"
      },
      {
        "id": "tile_obstacle_searchlight_h",
        "c": 3,
        "r": 5,
        "layer": "object4"
      },
      {
        "id": "tile_obstacle_searchlight_h",
        "c": 26,
        "r": 3,
        "layer": "object4"
      },
      {
        "id": "tile_obstacle_searchlight_h",
        "c": 7,
        "r": 14,
        "layer": "object4"
      },
      {
        "id": "tile_mvmum9xe",
        "c": 11,
        "r": 6,
        "layer": "object3",
        "ox": 0,
        "oy": 2,
        "sortDepth": 1.5
      },
      {
        "id": "tile_mvmums35",
        "c": 13,
        "r": 5,
        "layer": "object3",
        "ox": 0,
        "oy": 4,
        "sortDepth": 1.75
      },
      {
        "id": "tile_mvmums35",
        "c": 13,
        "r": 7,
        "layer": "object3",
        "sortDepth": 1.5
      },
      {
        "id": "tile_field_camp_bed",
        "c": 11,
        "r": 10,
        "layer": "object3",
        "sortDepth": 1.75
      },
      {
        "id": "tile_field_camp_bed",
        "c": 16,
        "r": 12,
        "layer": "object3",
        "sortDepth": 1.5
      },
      {
        "id": "tile_obstacle_searchlight_h",
        "c": 9,
        "r": 3,
        "layer": "object2"
      },
      {
        "id": "tile_mvmo6xof",
        "c": 7,
        "r": 4,
        "layer": "ground3"
      },
      {
        "id": "tile_obstacle_searchlight_h",
        "c": 17,
        "r": 8,
        "layer": "object4"
      },
      {
        "id": "tile_bg_electric_light",
        "c": 16,
        "r": 1,
        "layer": "overlay"
      },
      {
        "id": "tile_bg_electric_light",
        "c": 26,
        "r": 1,
        "layer": "overlay"
      },
      {
        "id": "tile_field_camp_bed",
        "c": 19,
        "r": 12,
        "layer": "object3"
      },
      {
        "id": "tile_bg_electric_light",
        "c": 18,
        "r": 15,
        "layer": "top"
      }
    ],
    "solid": [
      "0,3",
      "1,3",
      "2,3",
      "3,3",
      "4,3",
      "5,3",
      "7,3",
      "8,3",
      "10,3",
      "12,3",
      "13,3",
      "14,3",
      "15,3",
      "17,3",
      "18,3",
      "20,3",
      "21,3",
      "22,3",
      "23,3",
      "24,3",
      "25,3",
      "26,3",
      "27,3",
      "28,3",
      "29,3",
      "30,3",
      "31,3",
      "11,3",
      "13,2",
      "14,2",
      "15,2",
      "16,2",
      "17,2",
      "19,2",
      "20,2",
      "21,2",
      "22,2",
      "23,2",
      "24,2",
      "25,2",
      "26,2",
      "27,2",
      "28,2",
      "29,2",
      "30,2",
      "31,2",
      "18,2",
      "10,2",
      "9,2",
      "8,2",
      "7,2",
      "6,2",
      "5,2",
      "4,2",
      "3,2",
      "2,2",
      "1,2",
      "0,2",
      "11,2",
      "12,2",
      "0,1",
      "1,1",
      "2,1",
      "3,1",
      "5,1",
      "7,1",
      "8,1",
      "10,1",
      "11,1",
      "12,1",
      "13,1",
      "14,1",
      "15,1",
      "16,1",
      "17,1",
      "18,1",
      "19,1",
      "20,1",
      "21,1",
      "22,1",
      "23,1",
      "24,1",
      "25,1",
      "26,1",
      "27,1",
      "28,1",
      "29,1",
      "30,1",
      "31,0",
      "30,0",
      "28,0",
      "27,0",
      "25,0",
      "24,0",
      "22,0",
      "21,0",
      "20,0",
      "19,0",
      "18,0",
      "17,0",
      "16,0",
      "15,0",
      "14,0",
      "13,0",
      "12,0",
      "11,0",
      "10,0",
      "9,0",
      "8,0",
      "7,0",
      "6,0",
      "5,0",
      "4,0",
      "3,0",
      "2,0",
      "1,0",
      "23,0",
      "26,0",
      "29,0",
      "31,1",
      "28,4",
      "28,5",
      "28,6",
      "28,7",
      "28,8",
      "28,9",
      "28,10",
      "28,11",
      "28,12",
      "25,13",
      "26,13",
      "27,13",
      "29,14",
      "30,13",
      "31,13",
      "31,14",
      "29,13",
      "30,14",
      "28,14",
      "29,15",
      "30,15",
      "31,15",
      "28,13",
      "28,15",
      "27,15",
      "26,15",
      "25,15",
      "24,15",
      "23,15",
      "22,15",
      "21,15",
      "20,15",
      "19,15",
      "18,15",
      "17,15",
      "13,15",
      "12,15",
      "11,15",
      "10,15",
      "9,15",
      "8,15",
      "6,15",
      "5,15",
      "3,15",
      "3,13",
      "3,14",
      "2,13",
      "1,13",
      "0,13",
      "2,14",
      "1,14",
      "0,14",
      "1,15",
      "0,15",
      "2,15",
      "3,16",
      "4,16",
      "5,16",
      "6,16",
      "7,16",
      "8,16",
      "9,16",
      "10,16",
      "11,16",
      "12,16",
      "13,17",
      "16,17",
      "17,17",
      "18,17",
      "19,17",
      "20,17",
      "21,17",
      "22,17",
      "23,17",
      "24,17",
      "24,16",
      "25,16",
      "26,16",
      "27,16",
      "28,16",
      "28,17",
      "27,17",
      "26,17",
      "25,17",
      "23,16",
      "22,16",
      "21,16",
      "20,16",
      "19,16",
      "18,16",
      "17,16",
      "16,16",
      "14,16",
      "13,16",
      "14,15",
      "14,17",
      "12,17",
      "11,17",
      "10,17",
      "9,17",
      "8,17",
      "7,17",
      "6,17",
      "5,17",
      "4,17",
      "3,17",
      "16,15",
      "18,6",
      "18,7",
      "18,8",
      "18,9",
      "18,10",
      "19,10",
      "20,10",
      "21,10",
      "22,10",
      "23,10",
      "24,10",
      "25,10",
      "26,10",
      "19,6",
      "20,6",
      "21,6",
      "22,6",
      "23,6",
      "24,6",
      "26,7",
      "26,8",
      "26,9",
      "25,7",
      "24,7",
      "23,7",
      "22,7",
      "21,7",
      "20,7",
      "19,7",
      "19,8",
      "20,8",
      "21,8",
      "22,8",
      "23,9",
      "24,9",
      "25,9",
      "25,8",
      "24,8",
      "23,8",
      "21,9",
      "20,9",
      "19,9",
      "22,9",
      "7,6",
      "7,7",
      "7,8",
      "7,10",
      "7,11",
      "7,12",
      "8,9",
      "6,9",
      "5,9",
      "4,9",
      "3,9",
      "2,9",
      "1,9",
      "0,9",
      "4,8",
      "3,8",
      "2,8",
      "1,8",
      "0,8",
      "1,11",
      "4,12",
      "4,11",
      "3,10",
      "3,11",
      "11,6",
      "13,6",
      "14,6",
      "14,8",
      "13,8",
      "11,7",
      "18,5",
      "19,5",
      "20,5",
      "21,5",
      "22,5",
      "23,5",
      "24,5",
      "25,5",
      "26,6",
      "25,6",
      "26,5",
      "4,1",
      "0,0",
      "6,1",
      "9,1",
      "7,4",
      "7,5",
      "9,3",
      "17,8",
      "15,15",
      "15,16",
      "15,17",
      "7,15",
      "7,9",
      "6,3",
      "16,3",
      "19,3"
    ],
    "solidOffsets": {},
    "breakable": [],
    "camp": [],
    "coreSpots": [],
    "spawnZone": [],
    "portals": [],
    "coreCount": 1,
    "monsterMix": [
      {
        "id": "slime",
        "weight": 100
      }
    ],
    "rules": {
      "money": 3000,
      "guide": 100,
      "guideRegen": 9,
      "speed": 44,
      "reward": 8
    }
  }
];
