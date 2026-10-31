/* ===== 戰鬥地圖（由「🗺️ 地圖編輯器」匯出）=====
   只放戰鬥地圖；基地（安全區域）的地圖在 data/base-maps.js，由「🏠 基地編輯器」管理。
   素材（磚塊）在三個編輯器共用的 data/tiles.js。
   整段貼回 data/maps.js 覆蓋即可。 */
const BATTLE_MAPS = [
  {
    "id": "y1",
    "name": "(測試地圖)",
    "desc": "第一張地圖，難度較低，用來熟悉守營地。",
    "layers": {
      "floor": {
        "10,31": "floor",
        "10,32": "floor",
        "11,32": "floor",
        "12,32": "floor",
        "23,45": "floor",
        "24,45": "floor",
        "18,36": "floor",
        "18,35": "floor",
        "19,34": "floor",
        "20,34": "floor",
        "22,34": "floor",
        "24,35": "floor",
        "25,36": "floor",
        "27,37": "floor",
        "27,38": "floor",
        "27,39": "floor",
        "27,40": "floor",
        "25,41": "floor",
        "22,41": "floor",
        "19,41": "floor",
        "17,41": "floor",
        "16,41": "floor",
        "15,41": "floor",
        "15,40": "floor",
        "17,40": "floor",
        "19,40": "floor",
        "21,40": "floor",
        "23,40": "floor",
        "26,40": "floor",
        "27,41": "floor",
        "28,42": "floor",
        "28,43": "floor",
        "27,43": "floor",
        "25,44": "floor",
        "22,44": "floor",
        "19,44": "floor",
        "16,44": "floor",
        "15,44": "floor",
        "14,44": "floor",
        "15,43": "floor",
        "17,43": "floor",
        "19,42": "floor",
        "22,42": "floor",
        "24,42": "floor",
        "26,42": "floor",
        "27,44": "floor",
        "26,44": "floor",
        "12,44": "floor",
        "12,43": "floor",
        "13,43": "floor",
        "14,43": "floor",
        "15,42": "floor",
        "16,42": "floor",
        "18,42": "floor",
        "20,42": "floor",
        "23,42": "floor",
        "25,42": "floor",
        "27,42": "floor",
        "29,42": "floor",
        "23,43": "floor",
        "22,43": "floor",
        "20,43": "floor",
        "19,43": "floor",
        "21,43": "floor",
        "9,40": "floor",
        "9,41": "floor",
        "9,42": "floor",
        "9,43": "floor",
        "9,44": "floor",
        "9,45": "floor",
        "9,46": "floor",
        "9,47": "floor",
        "10,30": "floor",
        "10,33": "floor",
        "10,34": "floor",
        "10,35": "floor",
        "10,36": "floor",
        "10,37": "floor",
        "10,38": "floor",
        "10,39": "floor",
        "10,40": "floor",
        "10,41": "floor",
        "10,42": "floor",
        "10,43": "floor",
        "10,44": "floor",
        "10,45": "floor",
        "10,46": "floor",
        "10,47": "floor",
        "11,30": "floor",
        "11,31": "floor",
        "11,33": "floor",
        "11,34": "floor",
        "11,35": "floor",
        "11,36": "floor",
        "11,37": "floor",
        "11,38": "floor",
        "11,39": "floor",
        "11,40": "floor",
        "11,41": "floor",
        "11,42": "floor",
        "11,43": "floor",
        "11,44": "floor",
        "11,45": "floor",
        "11,46": "floor",
        "11,47": "floor",
        "12,30": "floor",
        "12,31": "floor",
        "12,33": "floor",
        "12,34": "floor",
        "12,35": "floor",
        "12,36": "floor",
        "12,37": "floor",
        "12,38": "floor",
        "12,39": "floor",
        "12,40": "floor",
        "12,41": "floor",
        "12,42": "floor",
        "12,45": "floor",
        "12,46": "floor",
        "12,47": "floor",
        "13,30": "floor",
        "13,31": "floor",
        "13,32": "floor",
        "13,33": "floor",
        "13,34": "floor",
        "13,35": "floor",
        "13,36": "floor",
        "13,37": "floor",
        "13,38": "floor",
        "13,39": "floor",
        "13,40": "floor",
        "13,41": "floor",
        "13,42": "floor",
        "13,44": "floor",
        "13,45": "floor",
        "13,46": "floor",
        "13,47": "floor",
        "14,30": "floor",
        "14,31": "floor",
        "14,32": "floor",
        "14,33": "floor",
        "14,34": "floor",
        "14,35": "floor",
        "14,36": "floor",
        "14,37": "floor",
        "14,38": "floor",
        "14,39": "floor",
        "14,40": "floor",
        "14,41": "floor",
        "14,42": "floor",
        "14,45": "floor",
        "14,46": "floor",
        "14,47": "floor",
        "15,30": "floor",
        "15,31": "floor",
        "15,32": "floor",
        "15,33": "floor",
        "15,34": "floor",
        "15,35": "floor",
        "15,36": "floor",
        "15,37": "floor",
        "15,38": "floor",
        "15,39": "floor",
        "15,45": "floor",
        "15,46": "floor",
        "15,47": "floor",
        "16,30": "floor",
        "16,31": "floor",
        "16,32": "floor",
        "16,33": "floor",
        "16,34": "floor",
        "16,35": "floor",
        "16,36": "floor",
        "16,37": "floor",
        "16,38": "floor",
        "16,39": "floor",
        "16,40": "floor",
        "16,43": "floor",
        "16,45": "floor",
        "16,46": "floor",
        "16,47": "floor",
        "17,30": "floor",
        "17,31": "floor",
        "17,32": "floor",
        "17,33": "floor",
        "17,34": "floor",
        "17,35": "floor",
        "17,36": "floor",
        "17,37": "floor",
        "17,38": "floor",
        "17,39": "floor",
        "17,42": "floor",
        "17,44": "floor",
        "17,45": "floor",
        "17,46": "floor",
        "17,47": "floor",
        "18,30": "floor",
        "18,31": "floor",
        "18,32": "floor",
        "18,33": "floor",
        "18,34": "floor",
        "18,37": "floor",
        "18,38": "floor",
        "18,39": "floor",
        "18,40": "floor",
        "18,41": "floor",
        "18,43": "floor",
        "18,44": "floor",
        "18,45": "floor",
        "18,46": "floor",
        "18,47": "floor",
        "19,30": "floor",
        "19,31": "floor",
        "19,32": "floor",
        "19,33": "floor",
        "19,35": "floor",
        "19,36": "floor",
        "19,37": "floor",
        "19,38": "floor",
        "19,39": "floor",
        "19,45": "floor",
        "19,46": "floor",
        "19,47": "floor",
        "20,30": "floor",
        "20,31": "floor",
        "20,32": "floor",
        "20,33": "floor",
        "20,35": "floor",
        "20,36": "floor",
        "20,37": "floor",
        "20,38": "floor",
        "20,39": "floor",
        "20,40": "floor",
        "20,41": "floor",
        "20,44": "floor",
        "20,45": "floor",
        "20,46": "floor",
        "20,47": "floor",
        "21,30": "floor",
        "21,31": "floor",
        "21,32": "floor",
        "21,33": "floor",
        "21,34": "floor",
        "21,35": "floor",
        "21,36": "floor",
        "21,37": "floor",
        "21,38": "floor",
        "21,39": "floor",
        "21,41": "floor",
        "21,42": "floor",
        "21,44": "floor",
        "21,45": "floor",
        "22,30": "floor",
        "22,31": "floor",
        "22,32": "floor",
        "22,33": "floor",
        "22,35": "floor",
        "22,36": "floor",
        "22,37": "floor",
        "22,38": "floor",
        "22,39": "floor",
        "22,40": "floor",
        "22,45": "floor",
        "22,47": "floor",
        "23,30": "floor",
        "23,31": "floor",
        "23,32": "floor",
        "23,33": "floor",
        "23,34": "floor",
        "23,35": "floor",
        "23,36": "floor",
        "23,37": "floor",
        "23,38": "floor",
        "23,39": "floor",
        "23,41": "floor",
        "23,44": "floor",
        "23,46": "floor",
        "23,47": "floor",
        "24,30": "floor",
        "24,31": "floor",
        "24,32": "floor",
        "24,33": "floor",
        "24,34": "floor",
        "24,36": "floor",
        "24,37": "floor",
        "24,38": "floor",
        "24,39": "floor",
        "24,40": "floor",
        "24,41": "floor",
        "24,43": "floor",
        "24,44": "floor",
        "24,46": "floor",
        "24,47": "floor",
        "25,30": "floor",
        "25,31": "floor",
        "25,32": "floor",
        "25,33": "floor",
        "25,34": "floor",
        "25,35": "floor",
        "25,37": "floor",
        "25,38": "floor",
        "25,39": "floor",
        "25,40": "floor",
        "25,43": "floor",
        "25,45": "floor",
        "25,46": "floor",
        "25,47": "floor",
        "26,30": "floor",
        "26,31": "floor",
        "26,32": "floor",
        "26,33": "floor",
        "26,34": "floor",
        "26,35": "floor",
        "26,36": "floor",
        "26,37": "floor",
        "26,38": "floor",
        "26,39": "floor",
        "26,41": "floor",
        "26,43": "floor",
        "26,45": "floor",
        "26,46": "floor",
        "26,47": "floor",
        "27,30": "floor",
        "27,31": "floor",
        "27,32": "floor",
        "27,33": "floor",
        "27,34": "floor",
        "27,35": "floor",
        "27,36": "floor",
        "27,45": "floor",
        "27,46": "floor",
        "27,47": "floor",
        "28,30": "floor",
        "28,31": "floor",
        "28,32": "floor",
        "28,33": "floor",
        "28,34": "floor",
        "28,35": "floor",
        "28,36": "floor",
        "28,37": "floor",
        "28,38": "floor",
        "28,39": "floor",
        "28,40": "floor",
        "28,41": "floor",
        "28,44": "floor",
        "28,45": "floor",
        "28,46": "floor",
        "28,47": "floor",
        "29,30": "floor",
        "29,31": "floor",
        "29,32": "floor",
        "29,34": "floor",
        "29,35": "floor",
        "29,36": "floor",
        "29,37": "floor",
        "29,38": "floor",
        "29,39": "floor",
        "29,40": "floor",
        "29,41": "floor",
        "29,43": "floor",
        "29,44": "floor",
        "29,45": "floor",
        "29,46": "floor",
        "29,47": "floor",
        "30,30": "floor",
        "30,31": "floor",
        "30,32": "floor",
        "30,33": "floor",
        "30,34": "floor",
        "30,35": "floor",
        "30,36": "floor",
        "30,37": "floor",
        "30,38": "floor",
        "30,39": "floor",
        "30,40": "floor",
        "30,41": "floor",
        "30,46": "floor",
        "30,47": "floor",
        "31,30": "floor",
        "31,31": "floor",
        "31,32": "floor",
        "31,33": "floor",
        "31,34": "floor",
        "31,35": "floor",
        "31,36": "floor",
        "31,37": "floor",
        "31,38": "floor",
        "31,39": "floor",
        "31,40": "floor",
        "31,41": "floor",
        "31,46": "floor",
        "31,47": "floor",
        "32,30": "floor",
        "32,31": "floor",
        "32,32": "floor",
        "32,33": "floor",
        "32,34": "floor",
        "32,35": "tile_bg_backroom_floor06",
        "32,36": "tile_bg_backroom_floor06",
        "32,37": "tile_bg_backroom_floor06",
        "32,38": "tile_bg_backroom_floor06",
        "32,39": "tile_bg_backroom_floor06",
        "32,40": "floor",
        "32,41": "floor",
        "32,46": "floor",
        "32,47": "floor",
        "33,30": "floor",
        "33,31": "floor",
        "33,32": "floor",
        "33,33": "floor",
        "33,34": "floor",
        "33,46": "floor",
        "33,47": "floor",
        "34,30": "floor",
        "34,31": "floor",
        "34,32": "floor",
        "34,33": "floor",
        "34,46": "floor",
        "34,47": "floor",
        "35,30": "floor",
        "35,31": "floor",
        "35,32": "floor",
        "35,33": "floor",
        "35,34": "floor",
        "35,46": "floor",
        "35,47": "floor",
        "36,30": "floor",
        "36,31": "floor",
        "36,32": "floor",
        "36,33": "floor",
        "36,34": "floor",
        "36,46": "floor",
        "36,47": "floor",
        "37,30": "floor",
        "37,31": "floor",
        "37,32": "floor",
        "37,33": "floor",
        "37,34": "floor",
        "37,35": "floor",
        "37,36": "floor",
        "37,37": "floor",
        "37,38": "floor",
        "37,39": "floor",
        "37,40": "floor",
        "37,41": "floor",
        "37,42": "floor",
        "37,43": "floor",
        "37,44": "floor",
        "37,45": "floor",
        "37,46": "floor",
        "37,47": "floor",
        "38,30": "floor",
        "38,31": "floor",
        "38,32": "floor",
        "38,33": "floor",
        "38,34": "floor",
        "38,35": "floor",
        "38,36": "floor",
        "38,37": "floor",
        "38,38": "floor",
        "38,39": "floor",
        "38,40": "floor",
        "38,41": "floor",
        "38,42": "floor",
        "38,43": "floor",
        "38,44": "floor",
        "38,45": "floor",
        "38,46": "floor",
        "38,47": "floor",
        "39,30": "floor",
        "39,31": "floor",
        "39,32": "floor",
        "39,33": "floor",
        "39,34": "floor",
        "39,35": "floor",
        "39,36": "floor",
        "39,37": "floor",
        "39,38": "floor",
        "39,39": "floor",
        "39,40": "floor",
        "39,41": "floor",
        "39,42": "floor",
        "39,43": "floor",
        "39,44": "floor",
        "39,45": "floor",
        "39,46": "floor",
        "39,47": "floor",
        "40,30": "floor",
        "40,31": "floor",
        "40,32": "floor",
        "40,33": "floor",
        "40,34": "floor",
        "40,35": "floor",
        "40,36": "floor",
        "40,37": "floor",
        "40,38": "floor",
        "40,39": "floor",
        "40,40": "floor",
        "40,41": "floor",
        "40,42": "floor",
        "40,43": "floor",
        "40,44": "floor",
        "40,45": "floor",
        "40,46": "floor",
        "40,47": "floor",
        "29,33": "floor",
        "9,49": "floor",
        "9,48": "floor",
        "10,48": "floor",
        "11,48": "floor",
        "10,49": "floor",
        "11,49": "floor",
        "12,49": "floor",
        "13,49": "floor",
        "14,49": "floor",
        "15,49": "floor",
        "16,49": "floor",
        "17,49": "floor",
        "18,49": "floor",
        "19,49": "floor",
        "20,49": "floor",
        "22,49": "floor",
        "23,49": "floor",
        "24,49": "floor",
        "25,49": "floor",
        "26,49": "floor",
        "27,49": "floor",
        "28,49": "floor",
        "29,49": "floor",
        "30,49": "floor",
        "31,49": "floor",
        "32,49": "floor",
        "33,49": "floor",
        "34,50": "floor",
        "35,50": "floor",
        "36,50": "floor",
        "37,50": "floor",
        "38,50": "floor",
        "38,49": "floor",
        "39,49": "floor",
        "40,49": "floor",
        "40,48": "floor",
        "39,48": "floor",
        "38,48": "floor",
        "37,48": "floor",
        "36,48": "floor",
        "35,48": "floor",
        "34,48": "floor",
        "33,48": "floor",
        "32,48": "floor",
        "31,48": "floor",
        "30,48": "floor",
        "29,48": "floor",
        "28,48": "floor",
        "27,48": "floor",
        "26,48": "floor",
        "25,48": "floor",
        "24,48": "floor",
        "23,48": "floor",
        "22,48": "floor",
        "21,48": "floor",
        "20,48": "floor",
        "19,48": "floor",
        "18,48": "floor",
        "17,48": "floor",
        "16,48": "floor",
        "15,48": "floor",
        "14,48": "floor",
        "12,48": "floor",
        "13,48": "floor",
        "21,49": "floor",
        "21,50": "floor",
        "22,50": "floor",
        "9,50": "floor",
        "9,51": "floor",
        "9,52": "floor",
        "9,53": "floor",
        "9,54": "floor",
        "9,55": "floor",
        "9,56": "floor",
        "9,57": "floor",
        "9,58": "floor",
        "9,59": "floor",
        "10,59": "floor",
        "11,59": "floor",
        "10,58": "floor",
        "10,57": "floor",
        "10,56": "floor",
        "10,55": "floor",
        "10,51": "floor",
        "10,50": "floor",
        "11,50": "floor",
        "11,51": "floor",
        "11,52": "floor",
        "11,53": "floor",
        "11,54": "floor",
        "10,54": "floor",
        "10,53": "floor",
        "10,52": "floor",
        "12,51": "floor",
        "13,51": "floor",
        "13,50": "floor",
        "12,50": "floor",
        "14,50": "floor",
        "15,50": "floor",
        "16,50": "floor",
        "17,50": "floor",
        "18,50": "floor",
        "19,50": "floor",
        "20,50": "floor",
        "23,50": "floor",
        "24,50": "floor",
        "25,50": "floor",
        "26,50": "floor",
        "27,50": "floor",
        "28,50": "floor",
        "29,50": "floor",
        "30,50": "floor",
        "31,50": "floor",
        "32,50": "floor",
        "33,50": "floor",
        "36,49": "floor",
        "37,49": "floor",
        "35,49": "floor",
        "34,49": "floor",
        "39,50": "floor",
        "40,50": "floor",
        "41,50": "floor",
        "40,51": "floor",
        "40,52": "floor",
        "40,53": "floor",
        "40,54": "floor",
        "40,55": "floor",
        "40,56": "floor",
        "40,57": "floor",
        "40,58": "floor",
        "40,59": "floor",
        "39,59": "floor",
        "38,59": "floor",
        "37,59": "floor",
        "36,59": "floor",
        "35,59": "floor",
        "34,59": "floor",
        "33,59": "floor",
        "31,59": "floor",
        "30,59": "floor",
        "29,59": "floor",
        "28,59": "floor",
        "27,59": "floor",
        "26,59": "floor",
        "25,59": "floor",
        "24,59": "floor",
        "23,59": "floor",
        "22,59": "floor",
        "21,59": "floor",
        "20,59": "floor",
        "19,59": "floor",
        "18,59": "floor",
        "17,59": "floor",
        "16,59": "floor",
        "15,59": "floor",
        "14,59": "floor",
        "13,59": "floor",
        "12,59": "floor",
        "12,58": "floor",
        "11,58": "floor",
        "11,57": "floor",
        "11,56": "floor",
        "11,55": "floor",
        "12,55": "floor",
        "12,54": "floor",
        "12,53": "floor",
        "13,53": "floor",
        "13,52": "floor",
        "14,51": "floor",
        "15,51": "floor",
        "16,51": "floor",
        "17,51": "floor",
        "12,52": "floor",
        "14,53": "floor",
        "15,53": "floor",
        "16,53": "floor",
        "17,53": "floor",
        "18,53": "floor",
        "19,53": "floor",
        "20,53": "floor",
        "21,53": "floor",
        "22,52": "floor",
        "23,52": "floor",
        "24,52": "floor",
        "25,52": "floor",
        "26,52": "floor",
        "27,52": "floor",
        "28,52": "floor",
        "29,52": "floor",
        "30,52": "floor",
        "31,52": "floor",
        "32,52": "floor",
        "33,52": "floor",
        "34,52": "floor",
        "35,52": "floor",
        "36,52": "floor",
        "37,52": "floor",
        "37,53": "floor",
        "38,53": "floor",
        "38,54": "floor",
        "37,54": "floor",
        "37,55": "floor",
        "36,55": "floor",
        "35,55": "floor",
        "34,55": "floor",
        "33,55": "floor",
        "31,55": "floor",
        "30,55": "floor",
        "29,55": "floor",
        "28,55": "floor",
        "27,55": "floor",
        "26,54": "floor",
        "25,54": "floor",
        "24,54": "floor",
        "23,54": "floor",
        "22,54": "floor",
        "21,55": "floor",
        "20,55": "floor",
        "19,55": "floor",
        "18,55": "floor",
        "17,55": "floor",
        "16,55": "floor",
        "15,55": "floor",
        "14,55": "floor",
        "13,55": "floor",
        "12,56": "floor",
        "12,57": "floor",
        "13,57": "floor",
        "14,57": "floor",
        "16,57": "floor",
        "17,57": "floor",
        "18,57": "floor",
        "19,57": "floor",
        "20,57": "floor",
        "21,57": "floor",
        "22,57": "floor",
        "23,57": "floor",
        "24,57": "floor",
        "25,57": "floor",
        "26,57": "floor",
        "27,57": "floor",
        "28,57": "floor",
        "29,57": "floor",
        "30,57": "floor",
        "31,57": "floor",
        "32,57": "floor",
        "33,57": "floor",
        "34,57": "floor",
        "35,57": "floor",
        "36,57": "floor",
        "37,57": "floor",
        "38,57": "floor",
        "39,57": "floor",
        "39,58": "floor",
        "38,58": "floor",
        "37,58": "floor",
        "36,58": "floor",
        "32,59": "floor",
        "26,58": "floor",
        "25,58": "floor",
        "24,58": "floor",
        "23,58": "floor",
        "22,58": "floor",
        "21,58": "floor",
        "20,58": "floor",
        "19,58": "floor",
        "18,58": "floor",
        "17,58": "floor",
        "16,58": "floor",
        "15,58": "floor",
        "14,58": "floor",
        "13,58": "floor",
        "13,56": "floor",
        "14,56": "floor",
        "15,56": "floor",
        "16,56": "floor",
        "17,56": "floor",
        "18,56": "floor",
        "19,56": "floor",
        "20,56": "floor",
        "21,56": "floor",
        "22,56": "floor",
        "23,56": "floor",
        "25,56": "floor",
        "26,56": "floor",
        "27,56": "floor",
        "28,56": "floor",
        "29,56": "floor",
        "30,56": "floor",
        "31,56": "floor",
        "32,56": "floor",
        "33,56": "floor",
        "34,56": "floor",
        "35,56": "floor",
        "36,56": "floor",
        "37,56": "floor",
        "38,55": "floor",
        "39,55": "floor",
        "39,54": "floor",
        "39,56": "floor",
        "38,56": "floor",
        "15,57": "floor",
        "24,55": "floor",
        "25,55": "floor",
        "26,55": "floor",
        "27,54": "floor",
        "23,55": "floor",
        "17,54": "floor",
        "16,54": "floor",
        "15,54": "floor",
        "14,54": "floor",
        "13,54": "floor",
        "16,52": "floor",
        "17,52": "floor",
        "18,52": "floor",
        "19,52": "floor",
        "20,52": "floor",
        "21,52": "floor",
        "32,51": "floor",
        "33,51": "floor",
        "34,51": "floor",
        "35,51": "floor",
        "36,51": "floor",
        "37,51": "floor",
        "38,51": "floor",
        "39,51": "floor",
        "39,53": "floor",
        "39,52": "floor",
        "38,52": "floor",
        "31,51": "floor",
        "30,51": "floor",
        "29,51": "floor",
        "28,51": "floor",
        "27,51": "floor",
        "26,51": "floor",
        "25,51": "floor",
        "24,51": "floor",
        "23,51": "floor",
        "22,51": "floor",
        "21,51": "floor",
        "20,51": "floor",
        "19,51": "floor",
        "18,51": "floor",
        "14,52": "floor",
        "15,52": "floor",
        "18,54": "floor",
        "19,54": "floor",
        "20,54": "floor",
        "21,54": "floor",
        "23,53": "floor",
        "22,53": "floor",
        "24,53": "floor",
        "25,53": "floor",
        "26,53": "floor",
        "27,53": "floor",
        "29,53": "floor",
        "30,53": "floor",
        "31,53": "floor",
        "32,53": "floor",
        "33,53": "floor",
        "34,53": "floor",
        "35,53": "floor",
        "36,53": "floor",
        "36,54": "floor",
        "35,54": "floor",
        "34,54": "floor",
        "33,54": "floor",
        "32,54": "floor",
        "31,54": "floor",
        "30,54": "floor",
        "29,54": "floor",
        "28,54": "floor",
        "28,53": "floor",
        "32,55": "floor",
        "22,55": "floor",
        "24,56": "floor",
        "27,58": "floor",
        "28,58": "floor",
        "29,58": "floor",
        "30,58": "floor",
        "31,58": "floor",
        "32,58": "floor",
        "33,58": "floor",
        "34,58": "floor",
        "35,58": "floor",
        "41,59": "floor",
        "42,59": "floor",
        "43,59": "floor",
        "44,59": "floor",
        "45,59": "floor",
        "45,58": "floor",
        "44,58": "floor",
        "43,58": "floor",
        "42,58": "floor",
        "41,58": "floor",
        "41,57": "floor",
        "41,56": "floor",
        "42,56": "floor",
        "43,57": "floor",
        "44,57": "floor",
        "45,57": "floor",
        "45,55": "floor",
        "44,55": "floor",
        "43,55": "floor",
        "42,55": "floor",
        "41,55": "floor",
        "44,56": "floor",
        "45,56": "floor",
        "43,56": "floor",
        "42,57": "floor",
        "42,54": "floor",
        "42,53": "floor",
        "42,52": "floor",
        "42,51": "floor",
        "41,51": "floor",
        "41,52": "floor",
        "41,54": "floor",
        "43,54": "floor",
        "44,54": "floor",
        "45,54": "floor",
        "46,54": "floor",
        "47,54": "floor",
        "48,54": "floor",
        "48,53": "floor",
        "47,53": "floor",
        "46,53": "floor",
        "45,53": "floor",
        "44,53": "floor",
        "43,53": "floor",
        "43,51": "floor",
        "44,51": "floor",
        "44,52": "floor",
        "45,52": "floor",
        "46,52": "floor",
        "47,52": "floor",
        "48,52": "floor",
        "48,51": "floor",
        "47,51": "floor",
        "46,51": "floor",
        "45,51": "floor",
        "43,52": "floor",
        "42,49": "floor",
        "42,50": "floor",
        "43,50": "floor",
        "44,50": "floor",
        "45,50": "floor",
        "46,50": "floor",
        "47,50": "floor",
        "48,50": "floor",
        "48,49": "floor",
        "47,49": "floor",
        "46,49": "floor",
        "45,49": "floor",
        "44,49": "floor",
        "43,49": "floor",
        "41,49": "floor",
        "41,48": "floor",
        "41,47": "floor",
        "42,47": "floor",
        "42,48": "floor",
        "43,48": "floor",
        "44,48": "floor",
        "45,48": "floor",
        "46,48": "floor",
        "47,48": "floor",
        "48,48": "floor",
        "44,47": "floor",
        "43,47": "floor",
        "42,46": "floor",
        "41,46": "floor",
        "41,45": "floor",
        "42,45": "floor",
        "43,45": "floor",
        "44,44": "floor",
        "43,44": "floor",
        "42,44": "floor",
        "41,44": "floor",
        "41,43": "floor",
        "42,43": "floor",
        "43,43": "floor",
        "44,43": "floor",
        "44,46": "floor",
        "43,46": "floor",
        "41,42": "floor",
        "41,41": "floor",
        "41,40": "floor",
        "41,39": "floor",
        "42,39": "floor",
        "43,39": "floor",
        "43,40": "floor",
        "43,41": "floor",
        "43,42": "floor",
        "44,42": "floor",
        "44,41": "floor",
        "45,41": "floor",
        "42,42": "floor",
        "42,41": "floor",
        "42,40": "floor",
        "41,38": "floor",
        "42,38": "floor",
        "43,38": "floor",
        "44,38": "floor",
        "45,38": "floor",
        "46,39": "floor",
        "47,39": "floor",
        "47,40": "floor",
        "47,41": "floor",
        "44,40": "floor",
        "44,39": "floor",
        "46,38": "floor",
        "48,39": "floor",
        "48,40": "floor",
        "48,41": "floor",
        "48,37": "floor",
        "48,36": "floor",
        "48,35": "floor",
        "48,34": "floor",
        "47,30": "floor",
        "46,30": "floor",
        "45,30": "floor",
        "44,30": "floor",
        "43,30": "floor",
        "42,30": "floor",
        "41,30": "floor",
        "41,31": "floor",
        "41,32": "floor",
        "41,33": "floor",
        "41,34": "floor",
        "41,35": "floor",
        "42,36": "floor",
        "42,37": "floor",
        "41,36": "floor",
        "42,31": "floor",
        "42,33": "floor",
        "42,34": "floor",
        "42,35": "floor",
        "41,37": "floor",
        "42,32": "floor",
        "44,34": "floor",
        "43,35": "floor",
        "43,36": "floor",
        "43,37": "floor",
        "43,34": "floor",
        "45,34": "floor",
        "44,35": "floor",
        "44,36": "floor",
        "44,37": "floor",
        "45,39": "floor",
        "45,40": "floor",
        "46,41": "floor",
        "46,40": "floor",
        "45,37": "floor",
        "45,35": "floor",
        "46,34": "floor",
        "45,36": "floor",
        "46,37": "floor",
        "46,36": "floor",
        "46,35": "floor",
        "47,34": "floor",
        "47,35": "floor",
        "47,36": "floor",
        "47,37": "floor",
        "47,38": "floor",
        "48,38": "floor",
        "21,47": "floor",
        "21,46": "floor",
        "22,46": "floor",
        "14,28": "floor",
        "15,28": "floor",
        "16,28": "floor",
        "18,28": "floor",
        "20,28": "floor",
        "21,28": "floor",
        "22,28": "floor",
        "23,28": "floor",
        "24,28": "floor",
        "25,28": "floor",
        "26,28": "floor",
        "28,28": "floor",
        "29,28": "floor",
        "31,28": "floor",
        "32,28": "floor",
        "33,28": "floor",
        "34,28": "floor",
        "36,28": "floor",
        "37,28": "floor",
        "38,28": "floor",
        "40,28": "floor",
        "41,28": "floor",
        "42,28": "floor",
        "43,28": "floor",
        "44,28": "floor",
        "45,28": "floor",
        "9,27": "floor",
        "9,28": "floor",
        "9,29": "floor",
        "10,23": "floor",
        "10,24": "floor",
        "10,25": "floor",
        "10,26": "floor",
        "10,27": "floor",
        "10,28": "floor",
        "10,29": "floor",
        "11,23": "floor",
        "11,24": "floor",
        "11,25": "floor",
        "11,26": "floor",
        "11,27": "floor",
        "11,28": "floor",
        "11,29": "floor",
        "12,23": "floor",
        "12,24": "floor",
        "12,25": "floor",
        "12,26": "floor",
        "12,27": "floor",
        "12,28": "floor",
        "12,29": "floor",
        "13,23": "floor",
        "13,24": "floor",
        "13,25": "floor",
        "13,26": "floor",
        "13,27": "floor",
        "13,28": "floor",
        "13,29": "floor",
        "14,23": "floor",
        "14,24": "floor",
        "14,25": "floor",
        "14,26": "floor",
        "14,27": "floor",
        "14,29": "floor",
        "15,23": "floor",
        "15,24": "floor",
        "15,25": "floor",
        "15,26": "floor",
        "15,27": "floor",
        "15,29": "floor",
        "16,23": "floor",
        "16,24": "floor",
        "16,25": "floor",
        "16,26": "floor",
        "16,27": "floor",
        "16,29": "floor",
        "17,23": "floor",
        "17,24": "floor",
        "17,25": "floor",
        "17,26": "floor",
        "17,27": "floor",
        "17,28": "floor",
        "17,29": "floor",
        "18,23": "floor",
        "18,24": "floor",
        "18,25": "floor",
        "18,26": "floor",
        "18,27": "floor",
        "18,29": "floor",
        "19,23": "floor",
        "19,24": "floor",
        "19,25": "floor",
        "19,26": "floor",
        "19,27": "floor",
        "19,28": "floor",
        "19,29": "floor",
        "20,23": "floor",
        "20,24": "floor",
        "20,25": "floor",
        "20,26": "floor",
        "20,27": "floor",
        "20,29": "floor",
        "21,23": "floor",
        "21,24": "floor",
        "21,25": "floor",
        "21,26": "floor",
        "21,27": "floor",
        "21,29": "floor",
        "22,23": "floor",
        "22,24": "floor",
        "22,25": "floor",
        "22,26": "floor",
        "22,27": "floor",
        "22,29": "floor",
        "23,23": "floor",
        "23,24": "floor",
        "23,25": "floor",
        "23,26": "floor",
        "23,27": "floor",
        "23,29": "floor",
        "24,23": "floor",
        "24,24": "floor",
        "24,25": "floor",
        "24,26": "floor",
        "24,27": "floor",
        "24,29": "floor",
        "25,23": "floor",
        "25,24": "floor",
        "25,25": "floor",
        "25,26": "floor",
        "25,27": "floor",
        "25,29": "floor",
        "26,23": "floor",
        "26,24": "floor",
        "26,25": "floor",
        "26,26": "floor",
        "26,27": "floor",
        "26,29": "floor",
        "27,23": "floor",
        "27,24": "floor",
        "27,25": "floor",
        "27,26": "floor",
        "27,27": "floor",
        "27,28": "floor",
        "27,29": "floor",
        "28,23": "floor",
        "28,24": "floor",
        "28,25": "floor",
        "28,26": "floor",
        "28,27": "floor",
        "28,29": "floor",
        "29,23": "floor",
        "29,24": "floor",
        "29,25": "floor",
        "29,26": "floor",
        "29,27": "floor",
        "29,29": "floor",
        "30,24": "floor",
        "30,25": "floor",
        "30,26": "floor",
        "30,27": "floor",
        "30,28": "floor",
        "30,29": "floor",
        "31,24": "floor",
        "31,25": "floor",
        "31,26": "floor",
        "31,27": "floor",
        "31,29": "floor",
        "32,24": "floor",
        "32,25": "floor",
        "32,26": "floor",
        "32,27": "floor",
        "32,29": "floor",
        "33,24": "floor",
        "33,25": "floor",
        "33,26": "floor",
        "33,27": "floor",
        "33,29": "floor",
        "34,24": "floor",
        "34,25": "floor",
        "34,26": "floor",
        "34,27": "floor",
        "34,29": "floor",
        "35,24": "floor",
        "35,25": "floor",
        "35,26": "floor",
        "35,27": "floor",
        "35,28": "floor",
        "35,29": "floor",
        "36,24": "floor",
        "36,25": "floor",
        "36,26": "floor",
        "36,27": "floor",
        "36,29": "floor",
        "37,24": "floor",
        "37,25": "floor",
        "37,26": "floor",
        "37,27": "floor",
        "37,29": "floor",
        "38,24": "floor",
        "38,25": "floor",
        "38,26": "floor",
        "38,27": "floor",
        "38,29": "floor",
        "39,24": "floor",
        "39,25": "floor",
        "39,26": "floor",
        "39,27": "floor",
        "39,28": "floor",
        "39,29": "floor",
        "40,24": "floor",
        "40,25": "floor",
        "40,26": "floor",
        "40,27": "floor",
        "40,29": "floor",
        "41,24": "floor",
        "41,25": "floor",
        "41,26": "floor",
        "41,27": "floor",
        "41,29": "floor",
        "42,24": "floor",
        "42,25": "floor",
        "42,26": "floor",
        "42,27": "floor",
        "42,29": "floor",
        "43,24": "floor",
        "43,25": "floor",
        "43,26": "floor",
        "43,27": "floor",
        "43,29": "floor",
        "44,24": "floor",
        "44,25": "floor",
        "44,26": "floor",
        "44,27": "floor",
        "44,29": "floor",
        "45,24": "floor",
        "45,25": "floor",
        "45,26": "floor",
        "45,27": "floor",
        "45,29": "floor",
        "46,24": "floor",
        "46,25": "floor",
        "46,26": "floor",
        "46,27": "floor",
        "46,28": "floor",
        "46,29": "floor",
        "47,24": "floor",
        "47,25": "floor",
        "47,26": "floor",
        "47,27": "floor",
        "47,28": "floor",
        "47,29": "floor",
        "9,39": "floor",
        "9,34": "floor",
        "9,33": "floor",
        "9,32": "floor",
        "31,23": "floor",
        "31,22": "floor",
        "31,21": "floor",
        "32,21": "floor",
        "32,22": "floor",
        "32,23": "floor",
        "30,21": "floor",
        "29,21": "floor",
        "23,21": "floor",
        "22,21": "floor",
        "21,21": "floor",
        "20,21": "floor",
        "19,21": "floor",
        "18,21": "floor",
        "17,21": "floor",
        "16,21": "floor",
        "15,21": "floor",
        "14,21": "floor",
        "13,21": "floor",
        "12,21": "floor",
        "12,22": "floor",
        "11,22": "floor",
        "11,21": "floor",
        "13,22": "floor",
        "14,22": "floor",
        "15,22": "floor",
        "16,22": "floor",
        "17,22": "floor",
        "18,22": "floor",
        "30,23": "floor",
        "19,22": "floor",
        "20,22": "floor",
        "21,22": "floor",
        "22,22": "floor",
        "23,22": "floor",
        "24,22": "floor",
        "25,22": "floor",
        "26,22": "floor",
        "27,22": "floor",
        "28,22": "floor",
        "29,22": "floor",
        "30,22": "floor",
        "33,21": "floor",
        "33,22": "floor",
        "33,23": "floor",
        "34,21": "floor",
        "35,21": "floor",
        "36,21": "floor",
        "37,21": "floor",
        "38,21": "floor",
        "39,21": "floor",
        "40,21": "floor",
        "41,21": "floor",
        "42,21": "floor",
        "43,21": "floor",
        "44,21": "floor",
        "46,21": "floor",
        "47,22": "floor",
        "47,23": "floor",
        "46,23": "floor",
        "45,23": "floor",
        "43,23": "floor",
        "37,23": "floor",
        "38,23": "floor",
        "39,23": "floor",
        "41,23": "floor",
        "42,22": "floor",
        "42,23": "floor",
        "40,23": "floor",
        "35,23": "floor",
        "35,22": "floor",
        "37,22": "floor",
        "39,22": "floor",
        "41,22": "floor",
        "43,22": "floor",
        "40,22": "floor",
        "36,22": "floor",
        "34,22": "floor",
        "38,22": "floor",
        "34,23": "floor",
        "36,23": "floor",
        "11,18": "floor",
        "11,19": "floor",
        "11,20": "floor",
        "12,18": "floor",
        "13,18": "floor",
        "14,18": "floor",
        "15,18": "floor",
        "16,18": "floor",
        "20,19": "floor",
        "20,20": "floor",
        "17,18": "floor",
        "14,19": "floor",
        "13,19": "floor",
        "13,20": "floor",
        "14,20": "floor",
        "15,20": "floor",
        "16,20": "floor",
        "17,20": "floor",
        "18,20": "floor",
        "19,20": "floor",
        "21,20": "floor",
        "18,19": "floor",
        "19,19": "floor",
        "21,19": "floor",
        "17,19": "floor",
        "12,20": "floor",
        "12,19": "floor",
        "15,19": "floor",
        "16,19": "floor",
        "11,17": "floor",
        "12,17": "floor",
        "13,17": "floor",
        "14,17": "floor",
        "15,17": "floor",
        "16,17": "floor",
        "17,17": "floor",
        "22,19": "floor",
        "22,20": "floor",
        "44,22": "floor",
        "46,22": "floor",
        "45,22": "floor",
        "44,23": "floor",
        "49,36": "floor",
        "49,37": "floor",
        "49,38": "floor",
        "49,39": "floor",
        "49,40": "floor",
        "49,41": "floor",
        "49,48": "floor",
        "49,49": "floor",
        "49,50": "floor",
        "49,51": "floor",
        "49,53": "floor",
        "49,54": "floor",
        "49,52": "floor",
        "18,18": "floor",
        "19,18": "floor",
        "20,18": "floor",
        "21,18": "floor",
        "22,18": "floor",
        "40,15": "floor",
        "40,16": "floor",
        "40,17": "floor",
        "40,18": "floor",
        "40,19": "floor",
        "40,20": "floor",
        "41,15": "floor",
        "42,15": "floor",
        "42,16": "floor",
        "42,17": "floor",
        "42,18": "floor",
        "42,19": "floor",
        "42,20": "floor",
        "41,16": "floor",
        "41,17": "floor",
        "41,18": "floor",
        "41,19": "floor",
        "41,20": "floor",
        "40,12": "floor",
        "40,13": "floor",
        "40,14": "floor",
        "41,12": "floor",
        "42,12": "floor",
        "42,13": "floor",
        "42,14": "floor",
        "41,13": "floor",
        "41,14": "floor",
        "40,10": "floor",
        "40,11": "floor",
        "41,10": "floor",
        "42,10": "floor",
        "42,11": "floor",
        "41,11": "floor",
        "13,11": "floor",
        "14,11": "floor",
        "15,11": "floor",
        "16,11": "floor",
        "17,11": "floor",
        "18,11": "floor",
        "17,12": "floor",
        "17,13": "floor",
        "17,14": "floor",
        "17,15": "floor",
        "17,16": "floor",
        "16,12": "floor",
        "16,13": "floor",
        "16,14": "floor",
        "16,15": "floor",
        "16,16": "floor",
        "15,12": "floor",
        "15,13": "floor",
        "15,14": "floor",
        "15,15": "floor",
        "15,16": "floor",
        "14,12": "floor",
        "14,13": "floor",
        "14,14": "floor",
        "14,15": "floor",
        "14,16": "floor",
        "13,12": "floor",
        "13,13": "floor",
        "13,14": "floor",
        "13,15": "floor",
        "13,16": "floor",
        "18,12": "floor",
        "18,13": "floor",
        "18,14": "floor",
        "18,15": "floor",
        "18,16": "floor",
        "18,17": "floor",
        "16,9": "floor",
        "39,4": "floor",
        "39,5": "floor",
        "39,6": "floor",
        "39,7": "floor",
        "39,8": "floor",
        "40,8": "floor",
        "40,9": "floor",
        "40,4": "floor",
        "41,5": "floor",
        "41,6": "floor",
        "40,7": "floor",
        "41,4": "floor",
        "42,6": "floor",
        "42,7": "floor",
        "42,8": "floor",
        "42,9": "floor",
        "43,3": "floor",
        "43,4": "floor",
        "43,5": "floor",
        "43,6": "floor",
        "43,7": "floor",
        "43,8": "floor",
        "43,9": "floor",
        "43,10": "floor",
        "43,11": "floor",
        "43,12": "floor",
        "42,4": "floor",
        "42,5": "floor",
        "41,7": "floor",
        "40,5": "floor",
        "40,6": "floor",
        "41,9": "floor",
        "41,8": "floor",
        "14,6": "floor",
        "14,7": "floor",
        "14,8": "floor",
        "14,9": "floor",
        "14,10": "floor",
        "15,6": "floor",
        "15,7": "floor",
        "15,8": "floor",
        "15,9": "floor",
        "15,10": "floor",
        "16,7": "floor",
        "16,8": "floor",
        "16,10": "floor",
        "16,6": "floor",
        "17,6": "floor",
        "18,6": "floor",
        "18,7": "floor",
        "18,8": "floor",
        "18,9": "floor",
        "18,10": "floor",
        "17,7": "floor",
        "17,8": "floor",
        "17,9": "floor",
        "17,10": "floor",
        "39,9": "floor",
        "39,10": "floor",
        "39,11": "floor",
        "39,12": "floor",
        "39,13": "floor",
        "39,14": "floor",
        "39,15": "floor",
        "39,16": "floor",
        "10,20": "floor",
        "9,20": "floor",
        "8,20": "floor",
        "7,20": "floor",
        "6,20": "floor",
        "5,20": "floor",
        "5,21": "floor",
        "6,21": "floor",
        "7,21": "floor",
        "8,21": "floor",
        "9,21": "floor",
        "10,21": "floor",
        "5,22": "floor",
        "6,22": "floor",
        "7,22": "floor",
        "8,22": "floor",
        "9,22": "floor",
        "10,22": "floor",
        "5,23": "floor",
        "6,23": "floor",
        "7,23": "floor",
        "8,23": "floor",
        "9,23": "floor",
        "5,24": "floor",
        "6,24": "floor",
        "7,24": "floor",
        "8,24": "floor",
        "9,24": "floor",
        "2,20": "floor",
        "3,20": "floor",
        "4,20": "floor",
        "2,21": "floor",
        "3,21": "floor",
        "4,21": "floor",
        "2,22": "floor",
        "4,22": "floor",
        "2,24": "floor",
        "3,24": "floor",
        "4,24": "floor",
        "2,23": "floor",
        "3,23": "floor",
        "4,23": "floor",
        "41,53": "floor",
        "50,54": "floor",
        "51,54": "floor",
        "52,54": "floor",
        "53,54": "floor",
        "50,48": "floor",
        "50,49": "floor",
        "50,50": "floor",
        "50,51": "floor",
        "50,52": "floor",
        "50,53": "floor",
        "51,48": "floor",
        "51,49": "floor",
        "51,50": "floor",
        "51,51": "floor",
        "51,52": "floor",
        "52,53": "floor",
        "52,48": "floor",
        "52,49": "floor",
        "52,50": "floor",
        "52,51": "floor",
        "52,52": "floor",
        "53,49": "floor",
        "53,50": "floor",
        "53,51": "floor",
        "53,52": "floor",
        "53,53": "floor",
        "54,54": "floor",
        "54,53": "floor",
        "54,52": "floor",
        "54,51": "floor",
        "54,50": "floor",
        "54,49": "floor",
        "54,48": "floor",
        "54,47": "floor",
        "54,46": "floor",
        "54,45": "floor",
        "54,44": "floor",
        "54,43": "floor",
        "54,42": "floor",
        "54,41": "floor",
        "54,39": "floor",
        "53,38": "floor",
        "53,37": "floor",
        "53,36": "floor",
        "54,37": "floor",
        "54,38": "floor",
        "50,36": "floor",
        "51,36": "floor",
        "50,37": "floor",
        "51,37": "floor",
        "52,37": "floor",
        "50,39": "floor",
        "51,39": "floor",
        "52,39": "floor",
        "53,39": "floor",
        "50,38": "floor",
        "51,38": "floor",
        "52,38": "floor",
        "51,53": "floor",
        "53,48": "floor",
        "53,40": "floor",
        "53,41": "floor",
        "53,43": "floor",
        "53,44": "floor",
        "53,45": "floor",
        "53,46": "floor",
        "53,47": "floor",
        "51,40": "floor",
        "51,41": "floor",
        "51,42": "floor",
        "51,43": "floor",
        "51,44": "floor",
        "51,45": "floor",
        "51,46": "floor",
        "51,47": "floor",
        "52,43": "floor",
        "52,42": "floor",
        "52,41": "floor",
        "52,40": "floor",
        "50,43": "floor",
        "50,44": "floor",
        "50,45": "floor",
        "50,46": "floor",
        "50,47": "floor",
        "52,44": "floor",
        "50,41": "floor",
        "50,42": "floor",
        "50,40": "floor",
        "53,42": "floor",
        "52,45": "floor",
        "52,46": "floor",
        "52,47": "floor",
        "8,42": "floor",
        "7,42": "floor",
        "6,42": "floor",
        "8,43": "floor",
        "7,43": "floor",
        "6,43": "floor",
        "5,43": "floor",
        "5,42": "floor",
        "2,36": "floor",
        "2,37": "floor",
        "2,38": "floor",
        "2,39": "floor",
        "2,40": "floor",
        "2,41": "floor",
        "2,42": "floor",
        "2,43": "floor",
        "3,43": "floor",
        "4,43": "floor",
        "3,37": "floor",
        "3,38": "floor",
        "3,39": "floor",
        "3,40": "floor",
        "3,41": "floor",
        "3,42": "floor",
        "4,36": "floor",
        "4,37": "floor",
        "4,38": "floor",
        "4,39": "floor",
        "4,40": "floor",
        "4,41": "floor",
        "4,42": "floor",
        "3,36": "floor",
        "9,38": "floor",
        "9,37": "floor",
        "9,36": "floor",
        "9,35": "floor",
        "7,31": "floor",
        "7,32": "floor",
        "7,33": "floor",
        "7,34": "floor",
        "47,21": "floor",
        "48,21": "floor",
        "49,22": "floor",
        "50,22": "floor",
        "51,22": "floor",
        "52,22": "floor",
        "53,22": "floor",
        "50,21": "floor",
        "49,21": "floor",
        "51,21": "floor",
        "52,21": "floor",
        "53,21": "floor",
        "53,23": "floor",
        "53,24": "floor",
        "53,25": "floor",
        "53,26": "floor",
        "53,27": "floor",
        "53,28": "floor",
        "53,29": "floor",
        "53,30": "floor",
        "52,30": "floor",
        "51,30": "floor",
        "50,30": "floor",
        "49,30": "floor",
        "48,28": "floor",
        "49,28": "floor",
        "50,28": "floor",
        "51,28": "floor",
        "52,29": "floor",
        "51,29": "floor",
        "50,29": "floor",
        "49,29": "floor",
        "52,28": "floor",
        "50,27": "floor",
        "51,26": "floor",
        "51,25": "floor",
        "52,25": "floor",
        "52,24": "floor",
        "52,23": "floor",
        "52,26": "floor",
        "52,27": "floor",
        "51,27": "floor",
        "49,27": "floor",
        "49,26": "floor",
        "49,25": "floor",
        "49,24": "floor",
        "48,26": "floor",
        "48,25": "floor",
        "48,24": "floor",
        "48,23": "floor",
        "48,22": "floor",
        "48,27": "floor",
        "49,23": "floor",
        "50,26": "floor",
        "50,25": "floor",
        "50,24": "floor",
        "50,23": "floor",
        "51,24": "floor",
        "51,23": "floor",
        "2,30": "floor",
        "2,31": "floor",
        "2,32": "floor",
        "2,33": "floor",
        "2,34": "floor",
        "2,35": "floor",
        "3,33": "floor",
        "3,34": "floor",
        "3,35": "floor",
        "5,40": "floor",
        "6,40": "floor",
        "7,40": "floor",
        "8,40": "floor",
        "6,30": "floor",
        "7,30": "floor",
        "8,30": "floor",
        "9,30": "floor",
        "9,31": "floor",
        "8,31": "floor",
        "6,31": "floor",
        "5,31": "floor",
        "4,31": "floor",
        "4,30": "floor",
        "3,30": "floor",
        "5,30": "floor",
        "3,31": "floor",
        "3,29": "floor",
        "4,29": "floor",
        "5,29": "floor",
        "4,28": "floor",
        "4,27": "floor",
        "5,26": "floor",
        "5,25": "floor",
        "9,25": "floor",
        "8,25": "floor",
        "7,26": "floor",
        "4,25": "floor",
        "9,26": "floor",
        "8,27": "floor",
        "6,27": "floor",
        "5,27": "floor",
        "7,27": "floor",
        "50,31": "floor",
        "50,32": "floor",
        "50,33": "floor",
        "50,34": "floor",
        "50,35": "floor",
        "51,35": "floor",
        "51,34": "floor",
        "51,33": "floor",
        "51,32": "floor",
        "51,31": "floor",
        "52,31": "floor",
        "52,32": "floor",
        "52,33": "floor",
        "52,34": "floor",
        "52,35": "floor",
        "52,36": "floor",
        "54,36": "floor",
        "45,21": "floor",
        "24,15": "floor",
        "24,16": "floor",
        "24,17": "floor",
        "23,17": "floor",
        "23,18": "floor",
        "23,19": "floor",
        "23,15": "floor",
        "23,14": "floor",
        "23,13": "floor",
        "23,16": "floor",
        "24,13": "floor",
        "24,14": "floor",
        "24,18": "floor",
        "25,18": "floor",
        "25,19": "floor",
        "25,17": "floor",
        "25,16": "floor",
        "25,15": "floor",
        "25,14": "floor",
        "25,13": "floor",
        "23,20": "floor",
        "24,20": "floor",
        "25,20": "floor",
        "23,12": "floor",
        "24,12": "floor",
        "25,12": "floor",
        "55,49": "floor",
        "55,50": "floor",
        "55,51": "floor",
        "55,52": "floor",
        "55,53": "floor",
        "55,54": "floor",
        "56,54": "floor",
        "57,54": "floor",
        "58,54": "floor",
        "59,54": "floor",
        "60,54": "floor",
        "61,54": "floor",
        "61,53": "floor",
        "61,52": "floor",
        "61,51": "floor",
        "61,50": "floor",
        "61,49": "floor",
        "60,49": "floor",
        "59,49": "floor",
        "58,49": "floor",
        "57,49": "floor",
        "56,49": "floor",
        "56,50": "floor",
        "57,50": "floor",
        "58,50": "floor",
        "59,50": "floor",
        "60,50": "floor",
        "60,51": "floor",
        "59,51": "floor",
        "58,51": "floor",
        "57,51": "floor",
        "56,51": "floor",
        "60,52": "floor",
        "59,53": "floor",
        "58,53": "floor",
        "57,53": "floor",
        "56,53": "floor",
        "56,52": "floor",
        "57,52": "floor",
        "58,52": "floor",
        "59,52": "floor",
        "60,53": "floor",
        "56,35": "floor",
        "56,36": "floor",
        "56,37": "floor",
        "56,38": "floor",
        "56,39": "floor",
        "56,40": "floor",
        "56,41": "floor",
        "56,42": "floor",
        "57,42": "floor",
        "57,43": "floor",
        "57,44": "floor",
        "57,45": "floor",
        "57,46": "floor",
        "57,47": "floor",
        "57,48": "floor",
        "56,48": "floor",
        "56,47": "floor",
        "56,46": "floor",
        "56,45": "floor",
        "56,44": "floor",
        "56,43": "floor",
        "57,35": "floor",
        "58,35": "floor",
        "59,35": "floor",
        "60,35": "floor",
        "58,36": "floor",
        "58,37": "floor",
        "58,38": "floor",
        "58,39": "floor",
        "58,40": "floor",
        "58,41": "floor",
        "58,42": "floor",
        "58,43": "floor",
        "57,36": "floor",
        "57,37": "floor",
        "57,38": "floor",
        "57,39": "floor",
        "57,40": "floor",
        "58,44": "floor",
        "58,45": "floor",
        "59,45": "floor",
        "59,46": "floor",
        "59,47": "floor",
        "59,48": "floor",
        "58,48": "floor",
        "58,47": "floor",
        "58,46": "floor",
        "57,41": "floor",
        "59,36": "floor",
        "59,37": "floor",
        "59,38": "floor",
        "59,39": "floor",
        "60,39": "floor",
        "60,40": "floor",
        "60,41": "floor",
        "60,42": "floor",
        "60,43": "floor",
        "60,44": "floor",
        "60,45": "floor",
        "60,46": "floor",
        "60,47": "floor",
        "60,48": "floor",
        "59,44": "floor",
        "59,43": "floor",
        "59,42": "floor",
        "59,41": "floor",
        "59,40": "floor",
        "60,36": "floor",
        "60,37": "floor",
        "60,38": "floor",
        "56,21": "floor",
        "56,22": "floor",
        "56,23": "floor",
        "56,24": "floor",
        "56,25": "floor",
        "56,26": "floor",
        "56,27": "floor",
        "56,28": "floor",
        "56,29": "floor",
        "57,30": "floor",
        "57,31": "floor",
        "57,32": "floor",
        "57,33": "floor",
        "57,34": "floor",
        "56,34": "floor",
        "56,33": "floor",
        "56,32": "floor",
        "56,31": "floor",
        "56,30": "floor",
        "57,20": "floor",
        "57,21": "floor",
        "57,22": "floor",
        "57,23": "floor",
        "57,24": "floor",
        "57,25": "floor",
        "57,26": "floor",
        "57,27": "floor",
        "57,28": "floor",
        "57,29": "floor",
        "58,19": "floor",
        "58,20": "floor",
        "58,21": "floor",
        "58,22": "floor",
        "58,23": "floor",
        "58,24": "floor",
        "58,25": "floor",
        "58,26": "floor",
        "58,27": "floor",
        "58,28": "floor",
        "58,29": "floor",
        "58,30": "floor",
        "58,31": "floor",
        "58,32": "floor",
        "58,33": "floor",
        "58,34": "floor",
        "59,18": "floor",
        "59,19": "floor",
        "59,20": "floor",
        "59,21": "floor",
        "59,22": "floor",
        "59,23": "floor",
        "59,25": "floor",
        "59,27": "floor",
        "59,28": "floor",
        "59,29": "floor",
        "59,30": "floor",
        "59,31": "floor",
        "59,32": "floor",
        "59,33": "floor",
        "59,34": "floor",
        "60,18": "floor",
        "60,19": "floor",
        "60,20": "floor",
        "60,21": "floor",
        "60,22": "floor",
        "60,23": "floor",
        "60,24": "floor",
        "60,25": "floor",
        "60,26": "floor",
        "60,27": "floor",
        "60,28": "floor",
        "60,29": "floor",
        "60,30": "floor",
        "60,31": "floor",
        "60,32": "floor",
        "60,33": "floor",
        "60,34": "floor",
        "59,24": "floor",
        "59,26": "floor",
        "56,16": "floor",
        "56,17": "floor",
        "56,18": "floor",
        "56,19": "floor",
        "56,20": "floor",
        "57,15": "floor",
        "57,16": "floor",
        "57,17": "floor",
        "57,18": "floor",
        "57,19": "floor",
        "58,15": "floor",
        "58,16": "floor",
        "58,17": "floor",
        "58,18": "floor",
        "59,15": "floor",
        "59,16": "floor",
        "59,17": "floor",
        "60,15": "floor",
        "60,16": "floor",
        "60,17": "floor",
        "57,10": "floor",
        "57,11": "floor",
        "57,12": "floor",
        "57,13": "floor",
        "57,14": "floor",
        "56,10": "floor",
        "56,11": "floor",
        "56,12": "floor",
        "56,13": "floor",
        "56,14": "floor",
        "56,15": "floor",
        "58,10": "floor",
        "58,11": "floor",
        "58,12": "floor",
        "58,13": "floor",
        "58,14": "floor",
        "59,10": "floor",
        "59,11": "floor",
        "59,12": "floor",
        "59,13": "floor",
        "59,14": "floor",
        "60,10": "floor",
        "60,11": "floor",
        "60,12": "floor",
        "60,13": "floor",
        "60,14": "floor",
        "56,3": "floor",
        "56,4": "floor",
        "56,5": "floor",
        "56,6": "floor",
        "56,7": "floor",
        "56,8": "floor",
        "56,9": "floor",
        "57,2": "floor",
        "57,3": "floor",
        "57,4": "floor",
        "57,5": "floor",
        "57,9": "floor",
        "58,4": "floor",
        "58,5": "floor",
        "58,6": "floor",
        "58,7": "floor",
        "58,8": "floor",
        "58,9": "floor",
        "58,3": "floor",
        "59,3": "floor",
        "59,4": "floor",
        "59,5": "floor",
        "59,6": "floor",
        "59,7": "floor",
        "59,8": "floor",
        "59,9": "floor",
        "60,3": "floor",
        "60,4": "floor",
        "60,5": "floor",
        "60,6": "floor",
        "60,7": "floor",
        "60,8": "floor",
        "60,9": "floor",
        "61,11": "floor",
        "61,12": "floor",
        "57,7": "floor",
        "57,6": "floor",
        "57,8": "floor",
        "41,3": "floor",
        "41,2": "floor",
        "24,19": "floor",
        "6,25": "floor",
        "6,26": "floor",
        "6,28": "floor",
        "6,29": "floor",
        "5,28": "floor",
        "4,26": "floor",
        "7,25": "floor",
        "7,28": "floor",
        "7,29": "floor",
        "8,26": "floor",
        "8,28": "floor",
        "8,29": "floor",
        "8,32": "floor",
        "8,34": "floor",
        "6,34": "floor",
        "5,34": "floor",
        "5,41": "floor",
        "6,41": "floor",
        "7,41": "floor",
        "8,41": "floor",
        "55,43": "floor",
        "55,44": "floor",
        "55,45": "floor",
        "55,46": "floor",
        "55,47": "floor",
        "55,48": "floor",
        "61,40": "floor",
        "61,41": "floor",
        "61,42": "floor",
        "61,43": "floor",
        "61,44": "floor",
        "61,45": "floor",
        "61,46": "floor",
        "61,47": "floor",
        "61,48": "floor",
        "55,36": "floor",
        "55,37": "floor",
        "55,38": "floor",
        "55,39": "floor",
        "55,40": "floor",
        "55,41": "floor",
        "55,42": "floor",
        "61,29": "floor",
        "61,30": "floor",
        "61,31": "floor",
        "61,32": "floor",
        "61,33": "floor",
        "61,34": "floor",
        "61,35": "floor",
        "61,36": "floor",
        "61,37": "floor",
        "61,38": "floor",
        "61,39": "floor",
        "48,30": "floor",
        "48,29": "floor",
        "55,35": "floor",
        "55,34": "floor",
        "55,33": "floor",
        "55,32": "floor",
        "55,31": "floor",
        "53,31": "floor",
        "53,32": "floor",
        "53,33": "floor",
        "54,33": "floor",
        "55,23": "floor",
        "55,24": "floor",
        "55,25": "floor",
        "55,26": "floor",
        "55,27": "floor",
        "55,28": "floor",
        "55,29": "floor",
        "55,30": "floor",
        "61,28": "floor",
        "61,27": "floor",
        "61,26": "floor",
        "61,25": "floor",
        "61,24": "floor",
        "61,23": "floor",
        "61,22": "floor",
        "61,21": "floor",
        "61,20": "floor",
        "61,19": "floor",
        "61,13": "floor",
        "61,14": "floor",
        "61,15": "floor",
        "61,16": "floor",
        "61,17": "floor",
        "61,18": "floor",
        "61,3": "floor",
        "61,4": "floor",
        "61,5": "floor",
        "61,6": "floor",
        "61,7": "floor",
        "61,8": "floor",
        "61,9": "floor",
        "61,10": "floor",
        "61,2": "floor",
        "60,2": "floor",
        "59,2": "floor",
        "58,2": "floor",
        "56,2": "floor",
        "55,2": "floor",
        "55,3": "floor",
        "55,4": "floor",
        "55,5": "floor",
        "55,6": "floor",
        "55,7": "floor",
        "55,8": "floor",
        "55,9": "floor",
        "55,10": "floor",
        "55,11": "floor",
        "55,12": "floor",
        "55,13": "floor",
        "55,14": "floor",
        "55,15": "floor",
        "55,16": "floor",
        "55,17": "floor",
        "55,18": "floor",
        "55,19": "floor",
        "55,20": "floor",
        "55,21": "floor",
        "55,22": "floor",
        "39,3": "floor",
        "40,3": "floor",
        "42,3": "floor",
        "39,2": "floor",
        "40,2": "floor",
        "42,2": "floor",
        "43,2": "floor",
        "43,13": "floor",
        "43,14": "floor",
        "43,15": "floor",
        "43,16": "floor",
        "43,17": "floor",
        "43,18": "floor",
        "43,19": "floor",
        "43,20": "floor",
        "39,17": "floor",
        "39,18": "floor",
        "39,19": "floor",
        "39,20": "floor",
        "22,12": "floor",
        "22,13": "floor",
        "22,14": "floor",
        "22,15": "floor",
        "22,16": "floor",
        "22,17": "floor",
        "22,11": "floor",
        "23,11": "floor",
        "24,11": "floor",
        "25,11": "floor",
        "26,11": "floor",
        "26,12": "floor",
        "26,13": "floor",
        "26,14": "floor",
        "26,15": "floor",
        "26,16": "floor",
        "26,17": "floor",
        "26,18": "floor",
        "26,19": "floor",
        "26,20": "floor",
        "19,6": "floor",
        "19,7": "floor",
        "19,8": "floor",
        "19,9": "floor",
        "19,10": "floor",
        "19,11": "floor",
        "19,12": "floor",
        "19,13": "floor",
        "19,14": "floor",
        "19,15": "floor",
        "19,16": "floor",
        "19,17": "floor",
        "13,6": "floor",
        "13,7": "floor",
        "13,8": "floor",
        "13,9": "floor",
        "13,10": "floor",
        "14,4": "floor",
        "15,4": "floor",
        "16,4": "floor",
        "17,4": "floor",
        "18,4": "floor",
        "18,5": "floor",
        "17,5": "floor",
        "16,5": "floor",
        "15,5": "floor",
        "14,5": "floor",
        "13,4": "floor",
        "13,5": "floor",
        "19,4": "floor",
        "19,5": "floor",
        "2,29": "floor",
        "1,29": "floor",
        "1,30": "floor",
        "1,31": "floor",
        "1,32": "floor",
        "1,33": "floor",
        "1,34": "floor",
        "1,35": "floor",
        "1,36": "floor",
        "1,37": "floor",
        "1,38": "floor",
        "1,39": "floor",
        "1,40": "floor",
        "1,41": "floor",
        "1,42": "floor",
        "1,43": "floor",
        "49,34": "floor",
        "49,35": "floor",
        "54,34": "floor",
        "54,35": "floor",
        "49,31": "floor",
        "49,32": "floor",
        "49,33": "floor",
        "34,34": "floor",
        "53,35": "floor",
        "53,34": "floor"
      },
      "ground": {
        "44,40": "tile_mr4czvpx",
        "44,41": "tile_mr4czvpx",
        "44,42": "floor",
        "37,41": "floor",
        "37,42": "floor",
        "45,41": "floor",
        "10,27": "tile_mr4czvpx",
        "10,26": "tile_mr4czvpx"
      },
      "object": {
        "22,34": "tile_mr4czvpx",
        "22,33": "tile_mr4czvpx",
        "44,41": "tile_mr4czvpx",
        "44,40": "tile_mr4czvpx",
        "44,42": "tile_mr4czvpx",
        "11,42": "tile_obstacle_ore_small",
        "36,54": "tile_obstacle_ore_small",
        "60,38": "tile_interactive_pickup_almond_water",
        "56,27": "tile_interactive_storage_locker_key"
      },
      "overlay": {},
      "top": {
        "15,33": "tile_mr4czvpx",
        "15,34": "tile_mr4czvpx",
        "22,35": "tile_mr4czvpx",
        "15,35": "tile_mr4czvpx",
        "12,40": "tile_mr4czvpx",
        "12,41": "tile_mr4czvpx",
        "12,42": "tile_mr4czvpx",
        "9,34": "tile_mr4czvpx",
        "9,33": "tile_mr4czvpx",
        "42,31": "tile_mr4czvpx",
        "42,30": "tile_mr4czvpx",
        "42,29": "tile_mr4czvpx",
        "9,30": "tile_mr4czvpx",
        "9,29": "tile_mr4czvpx",
        "9,28": "tile_mr4czvpx",
        "32,33": "tile_mr4czvpx",
        "32,34": "tile_mr4czvpx",
        "32,35": "tile_mr4czvpx",
        "32,36": "tile_mr4czvpx",
        "32,37": "tile_mr4czvpx",
        "29,41": "tile_mr4czvpx",
        "29,40": "tile_mr4czvpx",
        "37,34": "tile_mr4czvpx",
        "37,33": "tile_mr4czvpx",
        "37,35": "tile_mr4czvpx",
        "29,24": "tile_mr4czvpx",
        "10,25": "tile_mr4czvpx",
        "29,42": "tile_mr4czvpx",
        "29,43": "tile_mr4czvpx",
        "9,41": "tile_mr4czvpx",
        "9,42": "tile_mr4czvpx",
        "9,43": "tile_mr4czvpx",
        "9,44": "tile_mr4czvpx",
        "9,53": "tile_mr4czvpx",
        "9,54": "tile_mr4czvpx",
        "9,55": "tile_mr4czvpx",
        "9,49": "tile_mr4czvpx",
        "9,50": "tile_mr4czvpx",
        "9,47": "tile_mr4czvpx",
        "9,48": "tile_mr4czvpx",
        "29,22": "tile_mr4czvpx",
        "29,21": "tile_mr4czvpx",
        "29,20": "tile_mr4czvpx",
        "45,54": "tile_mr4czvpx",
        "45,55": "tile_mr4czvpx",
        "9,59": "tile_mvb9505y",
        "9,56": "tile_mr4czvpx",
        "9,57": "tile_mr4czvpx",
        "9,58": "tile_mr4czvpx",
        "43,9": "tile_mr4czvpx",
        "43,10": "tile_mr4czvpx",
        "43,11": "tile_mr4czvpx",
        "43,12": "tile_mr4czvpx",
        "43,13": "tile_mr4czvpx",
        "43,14": "tile_mr4czvpx",
        "43,15": "tile_mr4czvpx",
        "43,16": "tile_mr4czvpx",
        "19,13": "tile_mr4czvpx",
        "13,13": "tile_mr4czvpx",
        "13,12": "tile_mr4czvpx",
        "13,11": "tile_mr4czvpx",
        "19,12": "tile_mr4czvpx",
        "19,11": "tile_mr4czvpx",
        "13,10": "tile_mr4czvpx",
        "19,10": "tile_mr4czvpx",
        "39,2": "tile_mr4czvpx",
        "39,3": "tile_mr4czvpx",
        "43,2": "tile_mr4czvpx",
        "43,3": "tile_mr4czvpx",
        "43,4": "tile_mr4czvpx",
        "43,5": "tile_mr4czvpx",
        "43,6": "tile_mr4czvpx",
        "43,7": "tile_mr4czvpx",
        "43,8": "tile_mr4czvpx",
        "43,1": "tile_mr4czvpx",
        "39,1": "tile_mr4czvpx",
        "19,4": "tile_mr4czvpx",
        "19,5": "tile_mr4czvpx",
        "19,6": "tile_mr4czvpx",
        "19,7": "tile_mr4czvpx",
        "19,8": "tile_mr4czvpx",
        "19,9": "tile_mr4czvpx",
        "13,4": "tile_mr4czvpx",
        "13,5": "tile_mr4czvpx",
        "13,6": "tile_mr4czvpx",
        "13,7": "tile_mr4czvpx",
        "13,8": "tile_mr4czvpx",
        "13,9": "tile_mr4czvpx",
        "39,16": "tile_mr4czvpx",
        "39,15": "tile_mr4czvpx",
        "39,14": "tile_mr4czvpx",
        "39,13": "tile_mr4czvpx",
        "39,12": "tile_mr4czvpx",
        "39,11": "tile_mr4czvpx",
        "39,10": "tile_mr4czvpx",
        "39,9": "tile_mr4czvpx",
        "39,8": "tile_mr4czvpx",
        "39,7": "tile_mr4czvpx",
        "39,6": "tile_mr4czvpx",
        "39,5": "tile_mr4czvpx",
        "39,4": "tile_mr4czvpx",
        "43,17": "tile_mr4czvpx",
        "39,17": "tile_mr4czvpx",
        "1,18": "tile_mr4czvpx",
        "1,19": "tile_mr4czvpx",
        "1,20": "tile_mr4czvpx",
        "1,21": "tile_mr4czvpx",
        "1,22": "tile_mr4czvpx",
        "10,18": "tile_mr4czvpx",
        "10,19": "tile_mr4czvpx",
        "10,20": "tile_mr4czvpx",
        "10,21": "tile_mr4czvpx",
        "10,22": "tile_mr4czvpx",
        "55,34": "tile_mr4czvpx",
        "55,35": "tile_mr4czvpx",
        "55,36": "tile_mr4czvpx",
        "55,37": "tile_mr4czvpx",
        "55,41": "tile_mr4czvpx",
        "55,42": "tile_mr4czvpx",
        "55,43": "tile_mr4czvpx",
        "55,44": "tile_mr4czvpx",
        "37,37": "tile_mr4czvpx",
        "37,36": "tile_mr4czvpx",
        "44,43": "tile_mr4czvpx",
        "44,44": "tile_mr4czvpx",
        "29,44": "tile_mr4czvpx",
        "12,43": "tile_mr4czvpx",
        "15,36": "tile_mr4czvpx",
        "15,37": "tile_mr4czvpx",
        "15,38": "tile_mr4czvpx",
        "15,39": "tile_mr4czvpx",
        "9,35": "tile_mr4czvpx",
        "22,36": "tile_mr4czvpx",
        "22,37": "tile_mr4czvpx",
        "22,38": "tile_mr4czvpx",
        "22,39": "tile_mr4czvpx",
        "29,25": "tile_mr4czvpx",
        "22,33": "tile_mr4czvpx",
        "22,34": "tile_mr4czvpx",
        "55,38": "tile_mr4czvpx",
        "55,39": "tile_mr4czvpx",
        "55,40": "tile_mr4czvpx",
        "50,40": "tile_mr4czvpx",
        "50,41": "tile_mr4czvpx",
        "50,42": "tile_mr4czvpx",
        "50,43": "tile_mr4czvpx",
        "50,44": "tile_mr4czvpx",
        "38,49": "tile_mr4czvpx",
        "38,48": "tile_mr4czvpx",
        "38,47": "tile_mr4czvpx",
        "12,38": "tile_mr4czvpx",
        "12,39": "tile_mr4czvpx",
        "1,36": "tile_mr4czvpx",
        "1,37": "tile_mr4czvpx",
        "1,38": "tile_mr4czvpx",
        "1,39": "tile_mr4czvpx",
        "4,33": "tile_mr4czvpx",
        "4,34": "tile_mr4czvpx",
        "4,35": "tile_mr4czvpx",
        "12,44": "tile_mr4czvpx",
        "49,24": "tile_mr4czvpx",
        "49,25": "tile_mr4czvpx",
        "49,26": "tile_mr4czvpx",
        "49,29": "tile_mr4czvpx",
        "49,30": "tile_mr4czvpx",
        "49,31": "tile_mr4czvpx",
        "53,24": "tile_mr4czvpx",
        "53,25": "tile_mr4czvpx",
        "53,26": "tile_mr4czvpx",
        "53,29": "tile_mr4czvpx",
        "53,30": "tile_mr4czvpx",
        "53,31": "tile_mr4czvpx",
        "53,19": "tile_mr4czvpx",
        "53,21": "tile_mr4czvpx",
        "53,20": "tile_mr4czvpx",
        "37,40": "tile_mr4czvpx",
        "37,41": "tile_mr4czvpx",
        "37,42": "tile_mr4czvpx",
        "37,43": "tile_mr4czvpx",
        "37,44": "tile_mr4czvpx",
        "22,42": "tile_mr4czvpx",
        "22,43": "tile_mr4czvpx",
        "22,44": "tile_mr4czvpx",
        "22,45": "tile_mr4czvpx",
        "23,20": "tile_mr4czvpx",
        "22,11": "tile_mr4czvpx",
        "22,12": "tile_mr4czvpx",
        "22,13": "tile_mr4czvpx",
        "26,11": "tile_mr4czvpx",
        "26,12": "tile_mr4czvpx",
        "26,13": "tile_mr4czvpx",
        "26,14": "tile_mr4czvpx",
        "26,15": "tile_mr4czvpx",
        "26,16": "tile_mr4czvpx",
        "26,17": "tile_mr4czvpx",
        "61,51": "tile_mr4czvpx",
        "61,50": "tile_mr4czvpx",
        "61,49": "tile_mr4czvpx",
        "61,48": "tile_mr4czvpx",
        "61,47": "tile_mr4czvpx",
        "61,46": "tile_mr4czvpx",
        "55,22": "tile_mr4czvpx",
        "55,23": "tile_mr4czvpx",
        "55,24": "tile_mr4czvpx",
        "55,25": "tile_mr4czvpx",
        "55,26": "tile_mr4czvpx",
        "55,27": "tile_mr4czvpx",
        "55,28": "tile_mr4czvpx",
        "55,29": "tile_mr4czvpx",
        "55,30": "tile_mr4czvpx",
        "55,31": "tile_mr4czvpx",
        "55,21": "tile_mr4czvpx",
        "55,20": "tile_mr4czvpx",
        "61,8": "tile_mr4czvpx",
        "61,9": "tile_mr4czvpx",
        "61,10": "tile_mr4czvpx",
        "61,11": "tile_mr4czvpx",
        "61,12": "tile_mr4czvpx",
        "61,13": "tile_mr4czvpx",
        "61,14": "tile_mr4czvpx",
        "61,15": "tile_mr4czvpx",
        "61,16": "tile_mr4czvpx",
        "61,17": "tile_mr4czvpx",
        "61,18": "tile_mr4czvpx",
        "61,19": "tile_mr4czvpx",
        "61,20": "tile_mr4czvpx",
        "61,21": "tile_mr4czvpx",
        "61,22": "tile_mr4czvpx",
        "61,23": "tile_mr4czvpx",
        "61,24": "tile_mr4czvpx",
        "61,25": "tile_mr4czvpx",
        "61,26": "tile_mr4czvpx",
        "61,27": "tile_mr4czvpx",
        "61,28": "tile_mr4czvpx",
        "61,29": "tile_mr4czvpx",
        "61,30": "tile_mr4czvpx",
        "61,31": "tile_mr4czvpx",
        "61,32": "tile_mr4czvpx",
        "61,33": "tile_mr4czvpx",
        "61,34": "tile_mr4czvpx",
        "61,35": "tile_mr4czvpx",
        "61,36": "tile_mr4czvpx",
        "61,37": "tile_mr4czvpx",
        "61,39": "tile_mr4czvpx",
        "61,40": "tile_mr4czvpx",
        "61,41": "tile_mr4czvpx",
        "61,42": "tile_mr4czvpx",
        "61,43": "tile_mr4czvpx",
        "61,44": "tile_mr4czvpx",
        "61,45": "tile_mr4czvpx",
        "61,38": "tile_mr4czvpx",
        "55,8": "tile_mr4czvpx",
        "55,9": "tile_mr4czvpx",
        "55,10": "tile_mr4czvpx",
        "55,11": "tile_mr4czvpx",
        "55,12": "tile_mr4czvpx",
        "55,13": "tile_mr4czvpx",
        "55,14": "tile_mr4czvpx",
        "55,15": "tile_mr4czvpx",
        "55,16": "tile_mr4czvpx",
        "55,17": "tile_mr4czvpx",
        "55,18": "tile_mr4czvpx",
        "55,19": "tile_mr4czvpx",
        "55,6": "tile_mr4czvpx",
        "55,5": "tile_mr4czvpx",
        "55,1": "tile_mr4czvpx",
        "55,2": "tile_mr4czvpx",
        "55,3": "tile_mr4czvpx",
        "55,4": "tile_mr4czvpx",
        "55,7": "tile_mr4czvpx",
        "61,7": "tile_mr4czvpx",
        "61,6": "tile_mr4czvpx",
        "61,5": "tile_mr4czvpx",
        "61,4": "tile_mr4czvpx",
        "61,3": "tile_mr4czvpx",
        "61,2": "tile_mr4czvpx",
        "61,1": "tile_mr4czvpx"
      },
      "ground2": {
        "21,56": "tile_dmg_debris_dust",
        "18,53": "tile_new_decor_rock01",
        "16,50": "tile_new_decor_rock01"
      },
      "ground3": {},
      "object2": {
        "13,57": "tile_interactive_pickup_battery",
        "15,56": "tile_interactive_storage_locker_key",
        "40,42": "tile_interactive_pickup_almond_water",
        "13,18": "tile_interactive_pickup_almond_water",
        "54,42": "tile_obstacle_ore_small",
        "43,57": "tile_interactive_storage_locker_key",
        "15,44": "tile_interactive_pickup_almond_water",
        "41,44": "tile_obstacle_ore_small",
        "11,21": "tile_interactive_storage_locker_key",
        "54,36": "tile_interactive_pickup_almond_water",
        "31,37": "tile_interactive_pickup_almond_water",
        "35,26": "tile_interactive_pickup_almond_water",
        "12,30": "tile_interactive_pickup_almond_water",
        "40,55": "tile_interactive_storage_locker_key",
        "44,55": "tile_interactive_pickup_battery",
        "33,57": "tile_interactive_pickup_battery",
        "20,52": "tile_interactive_pickup_almond_water",
        "33,52": "tile_interactive_pickup_almond_water",
        "35,53": "tile_decor_foldingchair",
        "35,54": "tile_decor_gasstove02",
        "42,51": "tile_interactive_pickup_almond_water",
        "52,21": "tile_interactive_pickup_almond_water",
        "39,21": "tile_interactive_pickup_backroom_door_key",
        "42,14": "tile_interactive_storage_locker_key",
        "58,52": "tile_interactive_pickup_battery"
      },
      "object3": {
        "8,30": "tile_obstacle_ore_small"
      },
      "object4": {}
    },
    "stamps": [
      {
        "id": "tile_mr4cyy36",
        "c": 10,
        "r": 32,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 11,
        "r": 32,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 15,
        "r": 32,
        "layer": "object",
        "ox": 0,
        "oy": -30
      },
      {
        "id": "tile_mr4cyq54",
        "c": 28,
        "r": 32,
        "layer": "object",
        "ox": 0,
        "oy": -24
      },
      {
        "id": "tile_mr4cyq54",
        "c": 37,
        "r": 31,
        "layer": "object",
        "ox": 0,
        "oy": 16
      },
      {
        "id": "tile_mr4cyy36",
        "c": 33,
        "r": 32,
        "layer": "object",
        "ox": 0,
        "oy": 4
      },
      {
        "id": "tile_mr4cyq54",
        "c": 22,
        "r": 32,
        "layer": "object",
        "ox": 0,
        "oy": -34
      },
      {
        "id": "tile_mr4cyy36",
        "c": 23,
        "r": 32,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 27,
        "r": 32,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 32,
        "r": 32,
        "layer": "object",
        "ox": 0,
        "oy": -26
      },
      {
        "id": "tile_mr4cyy36",
        "c": 30,
        "r": 39,
        "layer": "object",
        "ox": 0,
        "oy": 0
      },
      {
        "id": "tile_mr4cyy36",
        "c": 31,
        "r": 39,
        "layer": "object",
        "ox": 0,
        "oy": 0
      },
      {
        "id": "tile_mr4cyy36",
        "c": 38,
        "r": 39,
        "layer": "object",
        "ox": 0,
        "oy": -2
      },
      {
        "id": "tile_mr4cyy36",
        "c": 39,
        "r": 39,
        "layer": "object",
        "ox": 0,
        "oy": -2
      },
      {
        "id": "tile_mr4cyy36",
        "c": 40,
        "r": 39,
        "layer": "object",
        "ox": 0,
        "oy": -2
      },
      {
        "id": "tile_mr4cyq54",
        "c": 37,
        "r": 39,
        "layer": "object",
        "ox": 0,
        "oy": -40
      },
      {
        "id": "tile_mr4ct8od",
        "c": 23,
        "r": 45,
        "layer": "floor"
      },
      {
        "id": "tile_mr4ct8od",
        "c": 23,
        "r": 43,
        "layer": "floor"
      },
      {
        "id": "tile_mr4ct8od",
        "c": 23,
        "r": 41,
        "layer": "floor"
      },
      {
        "id": "tile_mr4ct8od",
        "c": 23,
        "r": 39,
        "layer": "floor"
      },
      {
        "id": "tile_mr4ct8od",
        "c": 23,
        "r": 37,
        "layer": "floor"
      },
      {
        "id": "tile_mr4ct8od",
        "c": 26,
        "r": 37,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mr4ct8od",
        "c": 26,
        "r": 39,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mr4ct8od",
        "c": 26,
        "r": 41,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mr4ct8od",
        "c": 26,
        "r": 43,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mr4ct8od",
        "c": 26,
        "r": 45,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mr4cyq54",
        "c": 29,
        "r": 39,
        "layer": "object",
        "fx": true,
        "ox": 0,
        "oy": -34
      },
      {
        "id": "tile_mr4cyc49",
        "c": 26,
        "r": 47,
        "layer": "floor"
      },
      {
        "id": "tile_mr4cyc49",
        "c": 26,
        "r": 49,
        "layer": "floor"
      },
      {
        "id": "tile_mr4cyc49",
        "c": 26,
        "r": 51,
        "layer": "floor"
      },
      {
        "id": "tile_mr4ct8od",
        "c": 23,
        "r": 49,
        "layer": "floor"
      },
      {
        "id": "tile_mr4ct8od",
        "c": 23,
        "r": 47,
        "layer": "floor"
      },
      {
        "id": "tile_mr4ct8od",
        "c": 23,
        "r": 51,
        "layer": "floor"
      },
      {
        "id": "tile_mr4ct8od",
        "c": 23,
        "r": 53,
        "layer": "floor"
      },
      {
        "id": "tile_mr4cyc49",
        "c": 26,
        "r": 53,
        "layer": "floor"
      },
      {
        "id": "tile_mr4cyc49",
        "c": 26,
        "r": 55,
        "layer": "floor"
      },
      {
        "id": "tile_mr4cyc49",
        "c": 26,
        "r": 35,
        "layer": "floor"
      },
      {
        "id": "tile_mr4cyc49",
        "c": 30,
        "r": 30,
        "layer": "floor"
      },
      {
        "id": "tile_mr4ct8od",
        "c": 23,
        "r": 55,
        "layer": "floor"
      },
      {
        "id": "tile_mr4ct8od",
        "c": 23,
        "r": 57,
        "layer": "floor"
      },
      {
        "id": "tile_mr4ct8od",
        "c": 23,
        "r": 35,
        "layer": "floor"
      },
      {
        "id": "tile_mr4ct8od",
        "c": 27,
        "r": 30,
        "layer": "floor"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 21,
        "r": 46,
        "layer": "ground2"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 22,
        "r": 46,
        "layer": "ground2"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 23,
        "r": 46,
        "layer": "ground2"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 24,
        "r": 46,
        "layer": "ground2"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 25,
        "r": 46,
        "layer": "ground2"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 26,
        "r": 46,
        "layer": "ground2"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 27,
        "r": 46,
        "layer": "ground2"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 28,
        "r": 46,
        "layer": "ground2"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 30,
        "r": 46,
        "layer": "ground2"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 31,
        "r": 46,
        "layer": "ground2"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 33,
        "r": 46,
        "layer": "ground2"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 32,
        "r": 46,
        "layer": "ground2"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 20,
        "r": 46,
        "layer": "ground2"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 17,
        "r": 46,
        "layer": "ground"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 19,
        "r": 46,
        "layer": "ground2"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 16,
        "r": 46,
        "layer": "ground"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 18,
        "r": 46,
        "layer": "ground",
        "ox": 0,
        "oy": 0
      },
      {
        "id": "tile_mr4cyy36",
        "c": 14,
        "r": 46,
        "layer": "ground2"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 15,
        "r": 46,
        "layer": "ground2"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 13,
        "r": 46,
        "layer": "ground2"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 34,
        "r": 46,
        "layer": "ground2"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 35,
        "r": 46,
        "layer": "ground2"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 36,
        "r": 46,
        "layer": "ground2"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 37,
        "r": 46,
        "layer": "ground2"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 44,
        "r": 38,
        "layer": "ground"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 44,
        "r": 46,
        "layer": "object",
        "ox": 0,
        "oy": -40
      },
      {
        "id": "tile_mr4cyq54",
        "c": 12,
        "r": 46,
        "layer": "object",
        "ox": 0,
        "oy": -40
      },
      {
        "id": "tile_field_base",
        "c": 22,
        "r": 49,
        "layer": "object",
        "baseHp": 2000,
        "baseDepth": 4,
        "baseSolid": [
          [
            10,
            1
          ],
          [
            0,
            6
          ],
          [
            10,
            6
          ],
          [
            2,
            3
          ],
          [
            1,
            3
          ],
          [
            3,
            3
          ],
          [
            4,
            2
          ],
          [
            9,
            2
          ],
          [
            9,
            3
          ],
          [
            8,
            2
          ],
          [
            6,
            2
          ],
          [
            5,
            2
          ],
          [
            7,
            2
          ],
          [
            9,
            5
          ],
          [
            9,
            6
          ],
          [
            1,
            6
          ],
          [
            1,
            5
          ],
          [
            1,
            4
          ],
          [
            4,
            3
          ],
          [
            5,
            3
          ],
          [
            8,
            3
          ],
          [
            6,
            3
          ],
          [
            7,
            3
          ],
          [
            9,
            4
          ],
          [
            3,
            2
          ],
          [
            2,
            2
          ],
          [
            1,
            2
          ],
          [
            0,
            1
          ]
        ],
        "oy": 10,
        "ox": 0
      },
      {
        "id": "tile_dmg_broken_wall_right",
        "c": 51,
        "r": 45,
        "layer": "object",
        "ox": 0,
        "oy": 6
      },
      {
        "id": "tile_dmg_broken_wall_left",
        "c": 26,
        "r": 38,
        "layer": "object",
        "ox": 0,
        "oy": 4
      },
      {
        "id": "tile_dmg_broken_wall_breach",
        "c": 18,
        "r": 31,
        "layer": "object",
        "ox": 0,
        "oy": 0
      },
      {
        "id": "tile_mr4cyq54",
        "c": 17,
        "r": 31,
        "layer": "object",
        "ox": 8,
        "oy": 0
      },
      {
        "id": "tile_dmg_rubble_rocks",
        "c": 20,
        "r": 49,
        "layer": "ground2"
      },
      {
        "id": "tile_dmg_rubble_block_dark",
        "c": 42,
        "r": 42,
        "layer": "ground2"
      },
      {
        "id": "tile_new_decor_rock02",
        "c": 12,
        "r": 52,
        "layer": "ground2"
      },
      {
        "id": "tile_dmg_crack05",
        "c": 37,
        "r": 55,
        "layer": "ground2"
      },
      {
        "id": "tile_dmg_rubble_small",
        "c": 40,
        "r": 50,
        "layer": "ground3"
      },
      {
        "id": "tile_dmg_rubble_small",
        "c": 45,
        "r": 49,
        "layer": "ground3"
      },
      {
        "id": "tile_dmg_crack07",
        "c": 36,
        "r": 56,
        "layer": "ground3"
      },
      {
        "id": "tile_dmg_crack07",
        "c": 16,
        "r": 50,
        "layer": "ground3",
        "fx": true
      },
      {
        "id": "tile_dmg_crack07",
        "c": 22,
        "r": 47,
        "layer": "ground3",
        "fx": true
      },
      {
        "id": "tile_dmg_crack05",
        "c": 36,
        "r": 47,
        "layer": "ground3",
        "fx": true
      },
      {
        "id": "tile_dmg_crack06",
        "c": 58,
        "r": 43,
        "layer": "ground3",
        "fx": true
      },
      {
        "id": "tile_dmg_broken_pillar_rebar",
        "c": 13,
        "r": 48,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_muftd54p",
        "c": 22,
        "r": 50,
        "layer": "ground",
        "ox": 0,
        "oy": -14
      },
      {
        "id": "tile_obstacle_redroadblocks_v",
        "c": 48,
        "r": 49,
        "layer": "object2"
      },
      {
        "id": "tile_dmg_rubble_block_dark",
        "c": 19,
        "r": 33,
        "layer": "ground2"
      },
      {
        "id": "tile_dmg_floor_crater",
        "c": 46,
        "r": 37,
        "layer": "ground2"
      },
      {
        "id": "tile_dmg_floor_crater",
        "c": 50,
        "r": 28,
        "layer": "ground2"
      },
      {
        "id": "tile_dmg_floor_crater",
        "c": 17,
        "r": 39,
        "layer": "ground2"
      },
      {
        "id": "tile_bg_backroom_wall02_dmg_medium",
        "c": 34,
        "r": 32,
        "layer": "object",
        "ox": 0,
        "oy": 4
      },
      {
        "id": "tile_bg_backroom_wall02_dmg_medium",
        "c": 12,
        "r": 32,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02_dmg_heavy",
        "c": 16,
        "r": 41,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02_dmg_heavy",
        "c": 41,
        "r": 39,
        "layer": "object",
        "ox": 0,
        "oy": -2
      },
      {
        "id": "tile_bg_backroom_wall02_dmg_heavy",
        "c": 14,
        "r": 46,
        "layer": "ground2"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 22,
        "r": 27,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 23,
        "r": 27,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 24,
        "r": 27,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 28,
        "r": 27,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 27,
        "r": 27,
        "layer": "object"
      },
      {
        "id": "tile_mrt_stairs_light",
        "c": 25,
        "r": 27,
        "layer": "ground",
        "ox": 0,
        "oy": 6,
        "sortDepth": 0
      },
      {
        "id": "tile_mr4cyq54",
        "c": 29,
        "r": 26,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 30,
        "r": 23,
        "layer": "ground"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 31,
        "r": 23,
        "layer": "ground"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 35,
        "r": 23,
        "layer": "ground"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 40,
        "r": 23,
        "layer": "ground"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 41,
        "r": 23,
        "layer": "ground"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 42,
        "r": 23,
        "layer": "ground"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 44,
        "r": 23,
        "layer": "ground"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 43,
        "r": 23,
        "layer": "ground"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 45,
        "r": 23,
        "layer": "ground"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 46,
        "r": 23,
        "layer": "ground"
      },
      {
        "id": "tile_bg_backroom_wall02_dmg_medium",
        "c": 37,
        "r": 23,
        "layer": "ground"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 41,
        "r": 28,
        "layer": "ground"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 42,
        "r": 28,
        "layer": "ground"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 43,
        "r": 28,
        "layer": "ground"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 44,
        "r": 28,
        "layer": "ground"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 45,
        "r": 28,
        "layer": "ground"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 46,
        "r": 28,
        "layer": "ground"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 47,
        "r": 28,
        "layer": "ground"
      },
      {
        "id": "tile_dmg_broken_wall_right",
        "c": 38,
        "r": 27,
        "layer": "object",
        "fx": true,
        "ox": 0,
        "oy": 8
      },
      {
        "id": "tile_mr4cyq54",
        "c": 12,
        "r": 36,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 9,
        "r": 31,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 10,
        "r": 37,
        "layer": "ground2",
        "ox": 0,
        "oy": -8
      },
      {
        "id": "tile_mr4cyy36",
        "c": 11,
        "r": 37,
        "layer": "ground2",
        "ox": 0,
        "oy": -8
      },
      {
        "id": "tile_bg_backroom_pillar3",
        "c": 42,
        "r": 28,
        "layer": "ground2",
        "ox": 0,
        "oy": -12
      },
      {
        "id": "tile_bg_backroom_pillar3",
        "c": 42,
        "r": 32,
        "layer": "ground2",
        "sortDepth": 3.25,
        "ox": 0,
        "oy": 0
      },
      {
        "id": "tile_bg_backroom_pillar3",
        "c": 55,
        "r": 32,
        "layer": "ground2",
        "sortDepth": 3.25,
        "ox": 0,
        "oy": -4
      },
      {
        "id": "tile_bg_backroom_wall02_dmg_heavy",
        "c": 43,
        "r": 33,
        "layer": "ground2",
        "ox": 0,
        "oy": 0
      },
      {
        "id": "tile_mr4cyy36",
        "c": 20,
        "r": 27,
        "layer": "object2"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 19,
        "r": 27,
        "layer": "object2"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 18,
        "r": 27,
        "layer": "object2"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 17,
        "r": 27,
        "layer": "object2"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 16,
        "r": 27,
        "layer": "object2"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 15,
        "r": 27,
        "layer": "object2"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 14,
        "r": 27,
        "layer": "object2"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 13,
        "r": 27,
        "layer": "object2"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 12,
        "r": 27,
        "layer": "object2"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 11,
        "r": 27,
        "layer": "object2"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 9,
        "r": 26,
        "layer": "object2",
        "ox": 0,
        "oy": -10
      },
      {
        "id": "tile_mr4cyy36",
        "c": 21,
        "r": 27,
        "layer": "object2"
      },
      {
        "id": "tile_dmg_broken_wall_right",
        "c": 23,
        "r": 40,
        "layer": "object2",
        "ox": 0,
        "oy": 8
      },
      {
        "id": "tile_mr4cyq54",
        "c": 32,
        "r": 38,
        "layer": "object",
        "ox": 0,
        "oy": 0
      },
      {
        "id": "tile_dmg_rubble_wall_chunks",
        "c": 21,
        "r": 26,
        "layer": "ground2"
      },
      {
        "id": "tile_dmg_rubble_wall_chunks",
        "c": 10,
        "r": 30,
        "layer": "ground2",
        "ox": 0,
        "oy": 6
      },
      {
        "id": "tile_dmg_rubble_slab_fragments",
        "c": 27,
        "r": 26,
        "layer": "ground2"
      },
      {
        "id": "tile_dmg_floor_stain_seep",
        "c": 13,
        "r": 25,
        "layer": "ground2"
      },
      {
        "id": "tile_mr4ct8od",
        "c": 16,
        "r": 25,
        "layer": "ground2"
      },
      {
        "id": "tile_mr4ct8od",
        "c": 12,
        "r": 31,
        "layer": "ground2"
      },
      {
        "id": "tile_mr4cyc49",
        "c": 19,
        "r": 30,
        "layer": "ground2"
      },
      {
        "id": "tile_mr4cyc49",
        "c": 26,
        "r": 25,
        "layer": "ground2"
      },
      {
        "id": "tile_bg_backroom_wall02_hole",
        "c": 38,
        "r": 46,
        "layer": "ground2"
      },
      {
        "id": "tile_bg_backroom_door_wood",
        "c": 39,
        "r": 47,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_wall02_hole",
        "c": 24,
        "r": 32,
        "layer": "ground"
      },
      {
        "id": "tile_bg_backroom_door_wood",
        "c": 25,
        "r": 33,
        "layer": "ground2",
        "sortDepth": 1.5
      },
      {
        "id": "tile_mr4cyq54",
        "c": 29,
        "r": 45,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 19,
        "r": 45,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02_hole",
        "c": 19,
        "r": 41,
        "layer": "ground2"
      },
      {
        "id": "tile_bg_backroom_door_wood",
        "c": 20,
        "r": 42,
        "layer": "object"
      },
      {
        "id": "tile_mr4czvpx",
        "c": 29,
        "r": 23,
        "layer": "top",
        "ox": 0,
        "oy": 0
      },
      {
        "id": "tile_mr4cyq54",
        "c": 10,
        "r": 26,
        "layer": "object2",
        "ox": 0,
        "oy": 4
      },
      {
        "id": "tile_bg_backroom_wall02_hole",
        "c": 9,
        "r": 46,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02_hole",
        "c": 12,
        "r": 52,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_door_wood",
        "c": 13,
        "r": 53,
        "layer": "object2"
      },
      {
        "id": "tile_bg_backroom_door_wood",
        "c": 10,
        "r": 47,
        "layer": "object2"
      },
      {
        "id": "tile_dmg_broken_wall_right",
        "c": 30,
        "r": 26,
        "layer": "object2",
        "ox": 0,
        "oy": 6
      },
      {
        "id": "tile_mr4cyq54",
        "c": 15,
        "r": 51,
        "layer": "object2"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 9,
        "r": 51,
        "layer": "object2"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 11,
        "r": 52,
        "layer": "object2"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 10,
        "r": 52,
        "layer": "object2"
      },
      {
        "id": "tile_bg_backroom_wall02_hole2",
        "c": 51,
        "r": 39,
        "layer": "object",
        "sortDepth": 2.75
      },
      {
        "id": "tile_mr4cyy36",
        "c": 54,
        "r": 39,
        "layer": "object"
      },
      {
        "id": "tile_bg_electric_light",
        "c": 19,
        "r": 46,
        "layer": "object3",
        "ox": -20,
        "oy": 4
      },
      {
        "id": "tile_bg_electric_light",
        "c": 43,
        "r": 46,
        "layer": "object3",
        "ox": 20,
        "oy": 8
      },
      {
        "id": "tile_street_utility_box",
        "c": 40,
        "r": 30,
        "layer": "object2"
      },
      {
        "id": "tile_street_crosswalk",
        "c": 39,
        "r": 34,
        "layer": "object2"
      },
      {
        "id": "tile_street_area_map_board",
        "c": 16,
        "r": 27,
        "layer": "object3",
        "ox": 0,
        "oy": -12,
        "sortDepth": 3.5
      },
      {
        "id": "tile_bg_electric_light",
        "c": 42,
        "r": 33,
        "layer": "object3",
        "ox": -20,
        "oy": -4
      },
      {
        "id": "tile_mr4cyy36",
        "c": 29,
        "r": 32,
        "layer": "ground"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 30,
        "r": 32,
        "layer": "ground"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 31,
        "r": 32,
        "layer": "ground"
      },
      {
        "id": "tile_bg_electric_light",
        "c": 30,
        "r": 23,
        "layer": "object2"
      },
      {
        "id": "tile_bg_electric_light",
        "c": 40,
        "r": 28,
        "layer": "object2"
      },
      {
        "id": "tile_bg_electric_light",
        "c": 30,
        "r": 32,
        "layer": "top"
      },
      {
        "id": "tile_bg_electric_light",
        "c": 16,
        "r": 41,
        "layer": "top"
      },
      {
        "id": "tile_bg_electric_light",
        "c": 29,
        "r": 27,
        "layer": "top",
        "ox": -20,
        "oy": 6
      },
      {
        "id": "tile_obstacle_ore_large",
        "c": 15,
        "r": 26,
        "layer": "object"
      },
      {
        "id": "tile_obstacle_ore_rare",
        "c": 10,
        "r": 33,
        "layer": "object2"
      },
      {
        "id": "tile_obstacle_ore_large",
        "c": 42,
        "r": 25,
        "layer": "object2"
      },
      {
        "id": "tile_obstacle_ore_large",
        "c": 45,
        "r": 49,
        "layer": "object2"
      },
      {
        "id": "tile_interactive_storage_locker",
        "c": 10,
        "r": 53,
        "layer": "object3",
        "ox": 0,
        "oy": -8,
        "lockerLoot": {
          "kind": "item",
          "id": "youyou-card",
          "qty": 1
        }
      },
      {
        "id": "tile_interactive_storage_locker",
        "c": 30,
        "r": 33,
        "layer": "object3",
        "ox": 0,
        "oy": -4,
        "lockerLoot": {
          "kind": "item",
          "id": "battery",
          "qty": 1
        }
      },
      {
        "id": "tile_interactive_storage_locker",
        "c": 32,
        "r": 19,
        "layer": "object3",
        "ox": 0,
        "oy": -8,
        "lockerLoot": {
          "kind": "item",
          "id": "almond-water",
          "qty": 1
        }
      },
      {
        "id": "tile_interactive_power_switch_off",
        "c": 18,
        "r": 47,
        "layer": "object3",
        "ox": 0,
        "oy": 14,
        "circuit": 1
      },
      {
        "id": "tile_bg_electric_light",
        "c": 17,
        "r": 32,
        "layer": "object3",
        "ox": -8,
        "oy": -4
      },
      {
        "id": "tile_mv5my8dk",
        "c": 13,
        "r": 46,
        "layer": "object",
        "circuit": 1
      },
      {
        "id": "tile_mv5my8dk",
        "c": 33,
        "r": 46,
        "layer": "object",
        "circuit": 1
      },
      {
        "id": "tile_mv5my8dk",
        "c": 38,
        "r": 39,
        "layer": "object2"
      },
      {
        "id": "tile_mv5my8dk",
        "c": 30,
        "r": 39,
        "layer": "object2",
        "ox": 0,
        "oy": -2,
        "circuit": 2
      },
      {
        "id": "tile_mr4cyq54",
        "c": 9,
        "r": 45,
        "layer": "object2"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 10,
        "r": 14,
        "layer": "object",
        "ox": 0,
        "oy": 0
      },
      {
        "id": "tile_mr4cyy36",
        "c": 11,
        "r": 15,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 19,
        "r": 14,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 23,
        "r": 21,
        "layer": "object2"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 29,
        "r": 18,
        "layer": "object2"
      },
      {
        "id": "tile_bg_backroom_wall02_hole",
        "c": 32,
        "r": 23,
        "layer": "ground"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 24,
        "r": 22,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 25,
        "r": 22,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 26,
        "r": 22,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 27,
        "r": 22,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 28,
        "r": 22,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_door_wood",
        "c": 33,
        "r": 24,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 30,
        "r": 18,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 31,
        "r": 18,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 33,
        "r": 18,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 32,
        "r": 18,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 34,
        "r": 18,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 35,
        "r": 18,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 37,
        "r": 18,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 38,
        "r": 18,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 39,
        "r": 18,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 43,
        "r": 18,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 44,
        "r": 18,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 45,
        "r": 18,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 46,
        "r": 18,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 36,
        "r": 17,
        "layer": "object"
      },
      {
        "id": "tile_street_drink_shop_small",
        "c": 30,
        "r": 19,
        "layer": "object2",
        "sortDepth": 2.5,
        "ox": 0,
        "oy": -8
      },
      {
        "id": "tile_mr4cyq54",
        "c": 50,
        "r": 38,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 61,
        "r": 52,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 49,
        "r": 52,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 45,
        "r": 52,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 48,
        "r": 53,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 47,
        "r": 53,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 46,
        "r": 53,
        "layer": "object"
      },
      {
        "id": "tile_mv1ejvf0",
        "c": 17,
        "r": 19,
        "layer": "object",
        "sortDepth": 4
      },
      {
        "id": "tile_mv1ejvf0",
        "c": 17,
        "r": 19,
        "layer": "object",
        "sortDepth": 3.5
      },
      {
        "id": "tile_mr4cyy36",
        "c": 22,
        "r": 19,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 20,
        "r": 19,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 21,
        "r": 19,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 19,
        "r": 19,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 18,
        "r": 19,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 20,
        "r": 15,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 21,
        "r": 15,
        "layer": "object"
      },
      {
        "id": "tile_mv1ejvf0",
        "c": 17,
        "r": 52,
        "layer": "object",
        "fx": true,
        "sortDepth": 4
      },
      {
        "id": "tile_mr4cyy36",
        "c": 16,
        "r": 52,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 10,
        "r": 59,
        "layer": "top",
        "rot": 1
      },
      {
        "id": "tile_mr4czvpx",
        "c": 11,
        "r": 59,
        "layer": "top",
        "rot": 1
      },
      {
        "id": "tile_mr4czvpx",
        "c": 12,
        "r": 59,
        "layer": "top",
        "rot": 1
      },
      {
        "id": "tile_mr4czvpx",
        "c": 13,
        "r": 59,
        "layer": "top",
        "rot": 1
      },
      {
        "id": "tile_mr4czvpx",
        "c": 14,
        "r": 59,
        "layer": "top",
        "rot": 1
      },
      {
        "id": "tile_mr4czvpx",
        "c": 15,
        "r": 59,
        "layer": "top",
        "rot": 1
      },
      {
        "id": "tile_mr4czvpx",
        "c": 17,
        "r": 59,
        "layer": "top",
        "rot": 1
      },
      {
        "id": "tile_mr4czvpx",
        "c": 16,
        "r": 59,
        "layer": "top",
        "rot": 1
      },
      {
        "id": "tile_mr4czvpx",
        "c": 18,
        "r": 59,
        "layer": "top",
        "rot": 1
      },
      {
        "id": "tile_mr4czvpx",
        "c": 19,
        "r": 59,
        "layer": "top",
        "rot": 1
      },
      {
        "id": "tile_mr4czvpx",
        "c": 21,
        "r": 59,
        "layer": "top",
        "rot": 1
      },
      {
        "id": "tile_mr4czvpx",
        "c": 22,
        "r": 59,
        "layer": "top",
        "rot": 1
      },
      {
        "id": "tile_mr4czvpx",
        "c": 23,
        "r": 59,
        "layer": "top",
        "rot": 1
      },
      {
        "id": "tile_mr4czvpx",
        "c": 24,
        "r": 59,
        "layer": "top",
        "rot": 1
      },
      {
        "id": "tile_mr4czvpx",
        "c": 25,
        "r": 59,
        "layer": "top",
        "rot": 1
      },
      {
        "id": "tile_mr4czvpx",
        "c": 26,
        "r": 59,
        "layer": "top",
        "rot": 1
      },
      {
        "id": "tile_mr4czvpx",
        "c": 20,
        "r": 59,
        "layer": "top",
        "rot": 1
      },
      {
        "id": "tile_mr4czvpx",
        "c": 27,
        "r": 59,
        "layer": "top",
        "rot": 1
      },
      {
        "id": "tile_mr4czvpx",
        "c": 28,
        "r": 59,
        "layer": "top",
        "rot": 1
      },
      {
        "id": "tile_mr4czvpx",
        "c": 29,
        "r": 59,
        "layer": "top",
        "rot": 1
      },
      {
        "id": "tile_mr4czvpx",
        "c": 30,
        "r": 59,
        "layer": "top",
        "rot": 1
      },
      {
        "id": "tile_mr4czvpx",
        "c": 31,
        "r": 59,
        "layer": "top",
        "rot": 1
      },
      {
        "id": "tile_mr4czvpx",
        "c": 32,
        "r": 59,
        "layer": "top",
        "rot": 1
      },
      {
        "id": "tile_mr4czvpx",
        "c": 33,
        "r": 59,
        "layer": "top",
        "rot": 1
      },
      {
        "id": "tile_mr4czvpx",
        "c": 34,
        "r": 59,
        "layer": "top",
        "rot": 1
      },
      {
        "id": "tile_mr4czvpx",
        "c": 35,
        "r": 59,
        "layer": "top",
        "rot": 1
      },
      {
        "id": "tile_mr4czvpx",
        "c": 36,
        "r": 59,
        "layer": "top",
        "rot": 1
      },
      {
        "id": "tile_mr4czvpx",
        "c": 37,
        "r": 59,
        "layer": "top",
        "rot": 1
      },
      {
        "id": "tile_mr4czvpx",
        "c": 38,
        "r": 59,
        "layer": "top",
        "rot": 1
      },
      {
        "id": "tile_mr4czvpx",
        "c": 39,
        "r": 59,
        "layer": "top",
        "rot": 1
      },
      {
        "id": "tile_mr4czvpx",
        "c": 40,
        "r": 59,
        "layer": "top",
        "rot": 1
      },
      {
        "id": "tile_mr4czvpx",
        "c": 41,
        "r": 59,
        "layer": "top",
        "rot": 1
      },
      {
        "id": "tile_mr4czvpx",
        "c": 42,
        "r": 59,
        "layer": "top",
        "rot": 1
      },
      {
        "id": "tile_mr4czvpx",
        "c": 43,
        "r": 59,
        "layer": "top",
        "rot": 1
      },
      {
        "id": "tile_mr4czvpx",
        "c": 44,
        "r": 59,
        "layer": "top",
        "rot": 1
      },
      {
        "id": "tile_mr4czvpx",
        "c": 45,
        "r": 56,
        "layer": "top",
        "rot": 2
      },
      {
        "id": "tile_mr4czvpx",
        "c": 45,
        "r": 57,
        "layer": "top",
        "rot": 2
      },
      {
        "id": "tile_mr4czvpx",
        "c": 45,
        "r": 58,
        "layer": "top",
        "rot": 2
      },
      {
        "id": "tile_mvb9505y",
        "c": 45,
        "r": 59,
        "layer": "top",
        "fy": true,
        "rot": 2
      },
      {
        "id": "tile_interactive_electric_light_02",
        "c": 47,
        "r": 18,
        "layer": "object2",
        "circuit": 3
      },
      {
        "id": "tile_interactive_electric_light_02",
        "c": 50,
        "r": 18,
        "layer": "object2",
        "circuit": 3
      },
      {
        "id": "tile_interactive_electric_light_02",
        "c": 39,
        "r": 23,
        "layer": "object2",
        "circuit": 3
      },
      {
        "id": "tile_interactive_electric_light_02",
        "c": 30,
        "r": 18,
        "layer": "object2",
        "circuit": 3
      },
      {
        "id": "tile_bg_backroom_wall02_hole",
        "c": 40,
        "r": 1,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_door_wood",
        "c": 41,
        "r": 2,
        "layer": "object2",
        "doorMode": "picture"
      },
      {
        "id": "tile_mrt_exit_2_sealed",
        "c": 14,
        "r": 1,
        "layer": "object",
        "sortDepth": 5.25,
        "ox": 0,
        "oy": 0
      },
      {
        "id": "tile_mr4cyq54",
        "c": 13,
        "r": 14,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 12,
        "r": 15,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 19,
        "r": 3,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 13,
        "r": 3,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 43,
        "r": 0,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 39,
        "r": 0,
        "layer": "object"
      },
      {
        "id": "tile_obstacle_ore_large",
        "c": 19,
        "r": 21,
        "layer": "object2"
      },
      {
        "id": "tile_obstacle_ore_large",
        "c": 20,
        "r": 17,
        "layer": "object2",
        "fx": false
      },
      {
        "id": "tile_mrt_cardboard_boxes",
        "c": 34,
        "r": 20,
        "layer": "object2",
        "fx": true,
        "ox": -4,
        "oy": 0
      },
      {
        "id": "tile_bg_electric_light",
        "c": 13,
        "r": 27,
        "layer": "object3",
        "fx": true
      },
      {
        "id": "tile_bg_electric_light",
        "c": 21,
        "r": 27,
        "layer": "object3",
        "fx": true
      },
      {
        "id": "tile_bg_electric_light",
        "c": 20,
        "r": 19,
        "layer": "object3",
        "fx": true
      },
      {
        "id": "tile_street_capsule_toy_machines",
        "c": 11,
        "r": 16,
        "layer": "object3",
        "fx": true,
        "ox": -18,
        "oy": -28,
        "sortDepth": 2.5
      },
      {
        "id": "tile_street_utility_box_painted",
        "c": 21,
        "r": 21,
        "layer": "object3",
        "fx": true,
        "ox": 8,
        "oy": -16,
        "sortDepth": 1.75
      },
      {
        "id": "tile_obstacle_ore_small",
        "c": 16,
        "r": 40,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_mrt_ticket_gate",
        "c": 15,
        "r": 16,
        "layer": "object",
        "ox": 0,
        "oy": -4,
        "sortDepth": 1.75
      },
      {
        "id": "tile_mr4cyu5g",
        "c": 14,
        "r": 15,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyu5g",
        "c": 18,
        "r": 15,
        "layer": "object"
      },
      {
        "id": "tile_interactive_power_switch_off",
        "c": 46,
        "r": 24,
        "layer": "object2",
        "ox": 0,
        "oy": 18,
        "circuit": 3
      },
      {
        "id": "tile_new_decor_oil_drum",
        "c": 38,
        "r": 41,
        "layer": "object2"
      },
      {
        "id": "tile_new_decor_oil_drum",
        "c": 41,
        "r": 34,
        "layer": "object2"
      },
      {
        "id": "tile_new_decor_oil_drum",
        "c": 44,
        "r": 49,
        "layer": "object2"
      },
      {
        "id": "tile_bg_backroom_wall02_secret",
        "c": 40,
        "r": 18,
        "layer": "object"
      },
      {
        "id": "tile_interactive_power_switch_off",
        "c": 23,
        "r": 33,
        "layer": "object3",
        "ox": 0,
        "oy": 14,
        "circuit": 2
      },
      {
        "id": "tile_mr4cyy36",
        "c": 5,
        "r": 17,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 6,
        "r": 17,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 7,
        "r": 17,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 8,
        "r": 17,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 9,
        "r": 17,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 4,
        "r": 17,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 3,
        "r": 17,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 2,
        "r": 17,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 1,
        "r": 16,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 10,
        "r": 23,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 10,
        "r": 16,
        "layer": "object",
        "ox": 0,
        "oy": 6
      },
      {
        "id": "tile_mr4czvpx",
        "c": 10,
        "r": 15,
        "layer": "top",
        "ox": 0,
        "oy": 8
      },
      {
        "id": "tile_cvs_sign_twelve",
        "c": 2,
        "r": 17,
        "layer": "object2",
        "ox": 0,
        "oy": -12
      },
      {
        "id": "tile_cvs_back_counter",
        "c": 2,
        "r": 18,
        "layer": "object3",
        "ox": -2,
        "oy": -18
      },
      {
        "id": "tile_cvs_counter_extension",
        "c": 2,
        "r": 20,
        "layer": "object4",
        "ox": 0,
        "oy": 16,
        "sortDepth": 1.5
      },
      {
        "id": "floor",
        "c": 3,
        "r": 22,
        "layer": "floor",
        "ox": 0,
        "oy": 0
      },
      {
        "id": "tile_bg_road_signs",
        "c": 14,
        "r": 13,
        "layer": "top"
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 2,
        "r": 24,
        "layer": "object"
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 3,
        "r": 24,
        "layer": "object"
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 4,
        "r": 24,
        "layer": "object"
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 7,
        "r": 24,
        "layer": "object"
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 8,
        "r": 24,
        "layer": "object"
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 9,
        "r": 24,
        "layer": "object"
      },
      {
        "id": "tile_bg_extra_high_pillar",
        "c": 1,
        "r": 23,
        "layer": "object"
      },
      {
        "id": "tile_mvcrmipy",
        "c": 5,
        "r": 24,
        "layer": "object",
        "fx": true
      },
      {
        "id": "floor",
        "c": 4,
        "r": 32,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 3,
        "r": 32,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 4,
        "r": 33,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 5,
        "r": 32,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 5,
        "r": 33,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 6,
        "r": 33,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 6,
        "r": 32,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 4,
        "r": 34,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 4,
        "r": 35,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 6,
        "r": 39,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 8,
        "r": 39,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 7,
        "r": 39,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 5,
        "r": 39,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mr4cyq54",
        "c": 1,
        "r": 40,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyq54",
        "c": 4,
        "r": 31,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyq54",
        "c": 5,
        "r": 40,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 6,
        "r": 41,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 7,
        "r": 41,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 8,
        "r": 41,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 2,
        "r": 41,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 3,
        "r": 41,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 4,
        "r": 41,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 1,
        "r": 26,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 1,
        "r": 27,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 1,
        "r": 28,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 1,
        "r": 29,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 1,
        "r": 30,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 1,
        "r": 31,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 1,
        "r": 32,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 1,
        "r": 33,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 1,
        "r": 34,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 1,
        "r": 35,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_interactive_storage_locker",
        "c": 1,
        "r": 28,
        "layer": "object2",
        "fx": true,
        "ox": 0,
        "oy": -16,
        "sortDepth": 2.5,
        "lockerLoot": {
          "kind": "item",
          "id": "almond-water",
          "qty": 1
        }
      },
      {
        "id": "tile_mr4cyy36",
        "c": 8,
        "r": 32,
        "layer": "floor"
      },
      {
        "id": "tile_obstacle_wirefence_h",
        "c": 38,
        "r": 34,
        "layer": "object3"
      },
      {
        "id": "floor",
        "c": 54,
        "r": 40,
        "layer": "floor",
        "rot": 3
      },
      {
        "id": "tile_mr4cyy36",
        "c": 50,
        "r": 53,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 52,
        "r": 53,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 51,
        "r": 53,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 53,
        "r": 53,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 54,
        "r": 53,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 54,
        "r": 33,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 53,
        "r": 33,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 49,
        "r": 33,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 48,
        "r": 33,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 46,
        "r": 33,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 15,
        "r": 40,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 22,
        "r": 40,
        "layer": "object"
      },
      {
        "id": "floor",
        "c": 44,
        "r": 45,
        "layer": "floor",
        "ox": 0,
        "oy": 0
      },
      {
        "id": "tile_mr4cyy36",
        "c": 45,
        "r": 46,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 46,
        "r": 46,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 47,
        "r": 46,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 48,
        "r": 46,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 49,
        "r": 46,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 45,
        "r": 39,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 46,
        "r": 39,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 47,
        "r": 39,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 49,
        "r": 39,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 48,
        "r": 39,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 50,
        "r": 45,
        "layer": "object"
      },
      {
        "id": "tile_mvcsj5eh",
        "c": 36,
        "r": 25,
        "layer": "object2"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 47,
        "r": 33,
        "layer": "object"
      },
      {
        "id": "tile_mvcsj5eh",
        "c": 38,
        "r": 50,
        "layer": "object2"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 9,
        "r": 36,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 7,
        "r": 32,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 6,
        "r": 32,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 5,
        "r": 32,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 8,
        "r": 37,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 7,
        "r": 37,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 6,
        "r": 37,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 5,
        "r": 37,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 4,
        "r": 36,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 29,
        "r": 17,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 36,
        "r": 19,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 36,
        "r": 21,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 36,
        "r": 20,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4cyq54",
        "c": 36,
        "r": 22,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 48,
        "r": 28,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 47,
        "r": 23,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 48,
        "r": 23,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 47,
        "r": 18,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 48,
        "r": 18,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 50,
        "r": 18,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 49,
        "r": 18,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 51,
        "r": 18,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 52,
        "r": 18,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_pillar3",
        "c": 53,
        "r": 27,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_pillar3",
        "c": 53,
        "r": 22,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_pillar3",
        "c": 53,
        "r": 17,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_pillar3",
        "c": 49,
        "r": 27,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_pillar3",
        "c": 49,
        "r": 22,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 49,
        "r": 32,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 53,
        "r": 32,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 38,
        "r": 45,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 37,
        "r": 45,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02_hole",
        "c": 50,
        "r": 33,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_door_wood",
        "c": 51,
        "r": 34,
        "layer": "object2"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 23,
        "r": 19,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 24,
        "r": 19,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 25,
        "r": 19,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 26,
        "r": 18,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 26,
        "r": 9,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 22,
        "r": 9,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 22,
        "r": 14,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 23,
        "r": 10,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 24,
        "r": 10,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 25,
        "r": 10,
        "layer": "object"
      },
      {
        "id": "tile_interactive_storage_locker",
        "c": 23,
        "r": 11,
        "layer": "object2",
        "lockerLoot": {
          "kind": "item",
          "id": "youyou-card",
          "qty": 1
        }
      },
      {
        "id": "tile_cvs_checkout_counter_backroom",
        "c": 4,
        "r": 19,
        "layer": "object4",
        "ox": 0,
        "oy": 16
      },
      {
        "id": "tile_mv5my8dk",
        "c": 27,
        "r": 27,
        "layer": "object3",
        "circuit": 2
      },
      {
        "id": "tile_mv5my8dk",
        "c": 27,
        "r": 22,
        "layer": "object3",
        "circuit": 2
      },
      {
        "id": "tile_mv5my8dk",
        "c": 12,
        "r": 32,
        "layer": "object3",
        "circuit": 2
      },
      {
        "id": "tile_field_camp_bed",
        "c": 29,
        "r": 53,
        "layer": "overlay",
        "ox": 6,
        "sortDepth": 1.5,
        "oy": 34
      },
      {
        "id": "tile_field_camp_bed",
        "c": 27,
        "r": 53,
        "layer": "overlay",
        "sortDepth": 1.5,
        "oy": 34,
        "ox": 4
      },
      {
        "id": "tile_mr4cyy36",
        "c": 55,
        "r": 53,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 56,
        "r": 53,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 57,
        "r": 53,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 58,
        "r": 53,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 59,
        "r": 53,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 60,
        "r": 53,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 55,
        "r": 45,
        "layer": "object3"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 56,
        "r": 0,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 57,
        "r": 0,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 58,
        "r": 0,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 59,
        "r": 0,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 60,
        "r": 0,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02_hole",
        "c": 57,
        "r": 46,
        "layer": "ground2"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 56,
        "r": 46,
        "layer": "ground2"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 60,
        "r": 46,
        "layer": "ground2"
      },
      {
        "id": "tile_bg_backroom_door_wood",
        "c": 58,
        "r": 47,
        "layer": "object2"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 55,
        "r": 0,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 61,
        "r": 0,
        "layer": "object"
      },
      {
        "id": "tile_interactive_power_switch_off",
        "c": 56,
        "r": 1,
        "layer": "object4",
        "circuit": 4,
        "ox": 0,
        "oy": 24
      },
      {
        "id": "tile_interactive_electric_light_02",
        "c": 59,
        "r": 0,
        "layer": "object4",
        "circuit": 4
      },
      {
        "id": "tile_bg_electric_light",
        "c": 57,
        "r": 0,
        "layer": "object4"
      },
      {
        "id": "tile_obstacle_ore_rare",
        "c": 59,
        "r": 1,
        "layer": "object4"
      },
      {
        "id": "tile_dmg_floor_crater",
        "c": 56,
        "r": 10,
        "layer": "object4"
      },
      {
        "id": "tile_street_sign_no_entry",
        "c": 60,
        "r": 47,
        "layer": "object4",
        "ox": 0,
        "oy": -12
      },
      {
        "id": "tile_street_bollard_yellow",
        "c": 55,
        "r": 48,
        "layer": "object4",
        "ox": 0,
        "oy": -22
      },
      {
        "id": "tile_street_bollard_yellow",
        "c": 56,
        "r": 48,
        "layer": "object4",
        "ox": 0,
        "oy": -22
      },
      {
        "id": "tile_street_bollard_yellow",
        "c": 57,
        "r": 48,
        "layer": "object4",
        "ox": 0,
        "oy": -22
      },
      {
        "id": "tile_street_crosswalk",
        "c": 57,
        "r": 13,
        "layer": "object4",
        "rot": 1,
        "ox": -12,
        "oy": 0
      },
      {
        "id": "tile_field_supply_box",
        "c": 26,
        "r": 51,
        "layer": "object2",
        "ox": 28,
        "oy": 20
      },
      {
        "id": "tile_field_ammo_crate_open",
        "c": 28,
        "r": 51,
        "layer": "object2",
        "oy": 20,
        "ox": 0
      },
      {
        "id": "tile_mvma4ws7",
        "c": 29,
        "r": 51,
        "layer": "object2",
        "ox": 10,
        "oy": 20
      },
      {
        "id": "tile_interactive_storage_locker",
        "c": 41,
        "r": 11,
        "layer": "object2"
      },
      {
        "id": "tile_bg_backroom_wall02_hole",
        "c": 40,
        "r": 6,
        "layer": "object2"
      },
      {
        "id": "tile_bg_backroom_door_wood",
        "c": 41,
        "r": 7,
        "layer": "object3",
        "doorMode": "key"
      },
      {
        "id": "tile_bg_backroom_wall02_crack_breakable",
        "c": 41,
        "r": 46,
        "layer": "ground2"
      },
      {
        "id": "tile_mvnn2p1x",
        "c": 15,
        "r": 53,
        "layer": "object3",
        "ox": 34,
        "oy": 22
      }
    ],
    "solid": [
      "9,34",
      "10,34",
      "11,34",
      "12,34",
      "13,34",
      "14,34",
      "15,34",
      "15,35",
      "15,36",
      "15,37",
      "15,38",
      "15,39",
      "15,40",
      "15,41",
      "22,40",
      "22,39",
      "22,41",
      "22,38",
      "22,37",
      "22,36",
      "22,35",
      "24,34",
      "26,34",
      "27,34",
      "28,34",
      "30,41",
      "31,41",
      "33,41",
      "34,41",
      "35,41",
      "36,41",
      "37,41",
      "38,41",
      "39,41",
      "40,41",
      "32,34",
      "33,34",
      "34,34",
      "35,34",
      "36,34",
      "37,34",
      "37,40",
      "37,38",
      "37,37",
      "37,36",
      "37,35",
      "13,48",
      "14,48",
      "15,48",
      "16,48",
      "17,48",
      "18,48",
      "19,48",
      "20,48",
      "21,48",
      "22,48",
      "23,48",
      "24,48",
      "25,48",
      "26,48",
      "27,48",
      "28,48",
      "29,48",
      "30,48",
      "31,48",
      "32,48",
      "33,48",
      "34,48",
      "35,48",
      "36,48",
      "37,48",
      "38,48",
      "44,48",
      "44,47",
      "44,45",
      "44,44",
      "44,43",
      "44,42",
      "41,41",
      "42,41",
      "43,41",
      "44,41",
      "45,48",
      "46,48",
      "27,41",
      "28,41",
      "29,41",
      "18,34",
      "19,34",
      "20,34",
      "21,34",
      "23,34",
      "22,34",
      "45,55",
      "9,33",
      "11,33",
      "10,33",
      "13,33",
      "14,33",
      "12,33",
      "22,42",
      "22,43",
      "21,43",
      "19,43",
      "17,43",
      "15,43",
      "15,42",
      "16,43",
      "18,43",
      "12,42",
      "12,43",
      "12,44",
      "12,45",
      "12,41",
      "32,35",
      "32,36",
      "32,37",
      "32,38",
      "32,40",
      "32,41",
      "42,34",
      "42,30",
      "42,31",
      "42,32",
      "42,33",
      "40,30",
      "41,30",
      "39,30",
      "43,30",
      "44,30",
      "45,30",
      "46,30",
      "47,30",
      "30,25",
      "31,25",
      "32,25",
      "34,25",
      "36,25",
      "37,25",
      "38,25",
      "39,25",
      "40,25",
      "41,25",
      "42,25",
      "43,25",
      "44,25",
      "45,25",
      "46,25",
      "47,25",
      "29,25",
      "29,26",
      "29,27",
      "29,28",
      "29,29",
      "27,29",
      "28,29",
      "24,29",
      "23,29",
      "22,29",
      "21,29",
      "20,29",
      "19,29",
      "18,29",
      "17,29",
      "16,29",
      "15,29",
      "14,29",
      "13,29",
      "12,29",
      "11,29",
      "10,29",
      "9,29",
      "9,27",
      "24,28",
      "27,28",
      "9,28",
      "9,30",
      "9,31",
      "9,32",
      "15,33",
      "28,28",
      "29,24",
      "29,23",
      "33,40",
      "33,38",
      "33,36",
      "33,35",
      "33,37",
      "34,38",
      "34,37",
      "34,36",
      "34,35",
      "35,35",
      "36,35",
      "36,36",
      "35,36",
      "35,37",
      "36,37",
      "36,38",
      "35,38",
      "43,34",
      "43,33",
      "44,34",
      "45,34",
      "46,34",
      "47,34",
      "48,34",
      "48,33",
      "30,24",
      "31,24",
      "32,24",
      "36,24",
      "37,24",
      "38,24",
      "39,24",
      "40,24",
      "41,24",
      "42,24",
      "43,24",
      "44,24",
      "45,24",
      "46,24",
      "47,24",
      "10,28",
      "11,28",
      "12,28",
      "13,28",
      "14,28",
      "15,28",
      "16,28",
      "17,28",
      "18,28",
      "19,28",
      "20,28",
      "21,28",
      "22,28",
      "23,28",
      "10,27",
      "10,26",
      "10,25",
      "10,24",
      "29,42",
      "29,43",
      "29,44",
      "29,45",
      "29,47",
      "18,33",
      "17,33",
      "17,34",
      "23,33",
      "22,33",
      "21,33",
      "26,33",
      "27,33",
      "28,33",
      "32,33",
      "34,33",
      "33,33",
      "35,33",
      "36,33",
      "37,33",
      "38,40",
      "39,40",
      "40,40",
      "41,40",
      "42,40",
      "44,40",
      "43,40",
      "27,40",
      "28,40",
      "31,40",
      "30,40",
      "29,40",
      "20,47",
      "21,47",
      "22,47",
      "23,47",
      "24,47",
      "25,47",
      "26,47",
      "27,47",
      "28,47",
      "30,47",
      "31,47",
      "32,47",
      "33,47",
      "34,47",
      "35,47",
      "36,47",
      "37,47",
      "38,47",
      "45,47",
      "18,47",
      "17,47",
      "16,47",
      "15,47",
      "14,47",
      "13,47",
      "19,47",
      "42,35",
      "43,35",
      "44,35",
      "45,35",
      "46,35",
      "48,35",
      "47,35",
      "12,47",
      "12,48",
      "13,50",
      "11,48",
      "9,48",
      "11,47",
      "9,47",
      "9,54",
      "10,54",
      "11,54",
      "12,54",
      "12,53",
      "11,53",
      "10,53",
      "9,53",
      "14,53",
      "14,54",
      "15,53",
      "30,29",
      "31,29",
      "30,28",
      "40,29",
      "41,29",
      "42,29",
      "43,29",
      "44,29",
      "45,29",
      "46,29",
      "16,42",
      "17,42",
      "18,42",
      "19,42",
      "21,42",
      "23,42",
      "23,43",
      "45,40",
      "45,41",
      "47,40",
      "47,41",
      "48,41",
      "48,40",
      "40,31",
      "41,31",
      "29,34",
      "30,34",
      "31,34",
      "31,33",
      "29,33",
      "30,33",
      "24,43",
      "10,19",
      "10,18",
      "23,20",
      "23,21",
      "24,21",
      "25,21",
      "26,21",
      "27,21",
      "28,21",
      "29,22",
      "29,21",
      "29,20",
      "29,19",
      "29,18",
      "30,20",
      "31,20",
      "32,20",
      "33,20",
      "34,20",
      "35,20",
      "36,20",
      "37,20",
      "38,20",
      "39,20",
      "44,20",
      "45,20",
      "46,20",
      "47,20",
      "11,17",
      "12,17",
      "13,17",
      "19,17",
      "20,17",
      "21,17",
      "22,17",
      "19,16",
      "19,15",
      "19,14",
      "19,13",
      "19,12",
      "19,11",
      "19,10",
      "13,10",
      "13,11",
      "13,12",
      "13,13",
      "13,14",
      "13,15",
      "13,16",
      "17,21",
      "18,21",
      "19,21",
      "20,21",
      "21,21",
      "22,21",
      "17,22",
      "17,23",
      "39,18",
      "39,17",
      "39,16",
      "39,15",
      "39,14",
      "39,13",
      "39,12",
      "39,11",
      "43,13",
      "43,14",
      "43,16",
      "43,17",
      "43,18",
      "9,46",
      "9,45",
      "9,44",
      "9,43",
      "9,42",
      "9,49",
      "9,50",
      "9,51",
      "9,52",
      "17,56",
      "9,55",
      "9,56",
      "9,57",
      "9,58",
      "10,59",
      "11,59",
      "13,59",
      "14,59",
      "15,59",
      "16,59",
      "17,59",
      "18,59",
      "19,59",
      "20,59",
      "21,59",
      "22,59",
      "12,59",
      "9,59",
      "23,59",
      "24,59",
      "25,59",
      "26,59",
      "27,59",
      "28,59",
      "29,59",
      "30,59",
      "31,59",
      "32,59",
      "33,59",
      "34,59",
      "35,59",
      "36,59",
      "37,59",
      "38,59",
      "39,59",
      "40,59",
      "41,59",
      "42,59",
      "43,59",
      "44,59",
      "45,56",
      "45,57",
      "45,58",
      "45,59",
      "46,55",
      "47,55",
      "48,55",
      "49,55",
      "49,54",
      "49,48",
      "49,47",
      "49,41",
      "49,40",
      "49,35",
      "49,34",
      "49,33",
      "44,33",
      "45,33",
      "46,33",
      "47,33",
      "34,21",
      "35,21",
      "14,17",
      "18,17",
      "12,40",
      "16,53",
      "17,53",
      "13,4",
      "13,3",
      "13,9",
      "19,3",
      "19,4",
      "19,5",
      "19,6",
      "19,7",
      "19,9",
      "39,1",
      "39,2",
      "39,3",
      "39,4",
      "39,5",
      "39,6",
      "39,7",
      "39,8",
      "39,9",
      "43,1",
      "43,2",
      "43,3",
      "43,4",
      "43,5",
      "43,6",
      "43,7",
      "43,8",
      "43,9",
      "43,10",
      "39,10",
      "40,3",
      "42,3",
      "38,19",
      "30,19",
      "31,19",
      "32,19",
      "33,19",
      "34,19",
      "35,19",
      "36,19",
      "37,19",
      "39,19",
      "43,19",
      "44,19",
      "45,19",
      "46,19",
      "38,18",
      "37,18",
      "36,18",
      "35,18",
      "34,18",
      "33,18",
      "32,18",
      "31,18",
      "30,18",
      "45,18",
      "44,18",
      "44,17",
      "45,17",
      "46,17",
      "46,18",
      "38,17",
      "37,17",
      "36,17",
      "35,17",
      "34,17",
      "33,17",
      "32,17",
      "31,17",
      "30,17",
      "29,17",
      "40,0",
      "41,0",
      "42,0",
      "43,0",
      "40,2",
      "40,1",
      "41,1",
      "42,1",
      "39,0",
      "24,20",
      "25,20",
      "26,20",
      "27,20",
      "28,20",
      "18,20",
      "19,20",
      "20,20",
      "21,20",
      "22,20",
      "17,20",
      "28,39",
      "29,39",
      "30,39",
      "31,39",
      "27,39",
      "32,39",
      "33,39",
      "34,40",
      "35,40",
      "36,40",
      "34,39",
      "35,39",
      "36,39",
      "37,39",
      "30,46",
      "31,46",
      "32,46",
      "33,46",
      "34,46",
      "35,46",
      "36,46",
      "37,46",
      "29,46",
      "44,46",
      "12,46",
      "45,54",
      "46,54",
      "47,54",
      "48,54",
      "9,24",
      "2,24",
      "3,24",
      "4,24",
      "8,24",
      "7,24",
      "2,25",
      "2,26",
      "3,25",
      "3,26",
      "4,25",
      "4,26",
      "7,25",
      "8,25",
      "8,26",
      "9,25",
      "9,26",
      "7,26",
      "1,26",
      "1,25",
      "1,24",
      "1,23",
      "1,22",
      "1,21",
      "1,20",
      "1,19",
      "1,18",
      "2,19",
      "3,19",
      "4,19",
      "5,19",
      "6,19",
      "7,19",
      "8,19",
      "9,19",
      "2,18",
      "3,18",
      "4,18",
      "5,18",
      "6,18",
      "7,18",
      "8,18",
      "9,18",
      "2,21",
      "3,21",
      "4,21",
      "5,21",
      "7,21",
      "6,21",
      "1,27",
      "1,28",
      "1,29",
      "1,30",
      "1,31",
      "1,32",
      "1,33",
      "1,34",
      "1,35",
      "1,36",
      "10,39",
      "11,39",
      "12,39",
      "2,29",
      "3,29",
      "4,29",
      "7,29",
      "8,28",
      "8,27",
      "8,29",
      "7,28",
      "7,27",
      "4,27",
      "4,28",
      "3,27",
      "3,28",
      "2,27",
      "2,28",
      "8,33",
      "24,33",
      "28,32",
      "22,44",
      "22,45",
      "36,23",
      "36,21",
      "36,22",
      "36,27",
      "36,26",
      "36,28",
      "36,29",
      "47,29",
      "48,29",
      "48,30",
      "49,30",
      "49,29",
      "49,28",
      "49,27",
      "49,26",
      "49,25",
      "49,24",
      "48,24",
      "48,25",
      "48,20",
      "47,19",
      "48,19",
      "49,19",
      "50,19",
      "51,19",
      "49,20",
      "50,20",
      "51,20",
      "52,20",
      "53,20",
      "47,18",
      "48,18",
      "49,18",
      "50,18",
      "51,18",
      "52,18",
      "53,18",
      "47,17",
      "48,17",
      "49,17",
      "50,17",
      "52,17",
      "53,17",
      "51,17",
      "52,19",
      "53,19",
      "53,21",
      "53,22",
      "53,23",
      "53,24",
      "53,25",
      "53,26",
      "53,27",
      "53,28",
      "53,29",
      "53,30",
      "53,31",
      "53,32",
      "53,33",
      "53,34",
      "53,35",
      "54,35",
      "52,35",
      "50,35",
      "50,34",
      "52,34",
      "54,34",
      "55,34",
      "55,35",
      "55,36",
      "55,37",
      "55,38",
      "55,39",
      "55,40",
      "55,41",
      "55,43",
      "55,44",
      "55,42",
      "55,47",
      "54,54",
      "54,55",
      "50,54",
      "50,55",
      "51,55",
      "52,55",
      "51,54",
      "53,54",
      "53,55",
      "52,54",
      "51,48",
      "50,48",
      "47,48",
      "48,48",
      "46,47",
      "47,47",
      "48,47",
      "50,47",
      "51,47",
      "54,41",
      "54,40",
      "50,41",
      "50,42",
      "50,43",
      "50,44",
      "50,45",
      "50,46",
      "46,41",
      "46,40",
      "51,41",
      "50,40",
      "51,40",
      "53,40",
      "53,41",
      "38,46",
      "38,49",
      "38,50",
      "38,51",
      "38,52",
      "38,53",
      "38,54",
      "1,37",
      "1,38",
      "1,39",
      "1,40",
      "1,42",
      "2,43",
      "3,43",
      "4,43",
      "5,43",
      "6,43",
      "7,43",
      "8,43",
      "1,43",
      "2,42",
      "3,42",
      "4,42",
      "5,42",
      "6,42",
      "7,42",
      "8,42",
      "5,39",
      "6,39",
      "5,38",
      "7,33",
      "4,33",
      "4,34",
      "4,35",
      "5,34",
      "5,33",
      "6,34",
      "6,33",
      "7,34",
      "8,34",
      "4,36",
      "4,37",
      "4,38",
      "4,39",
      "6,38",
      "7,38",
      "7,39",
      "10,38",
      "11,38",
      "1,41",
      "26,19",
      "26,18",
      "26,17",
      "26,16",
      "26,15",
      "26,14",
      "26,13",
      "26,12",
      "23,12",
      "24,12",
      "25,12",
      "22,12",
      "22,13",
      "22,14",
      "22,15",
      "22,16",
      "20,16",
      "21,16",
      "34,24",
      "35,24",
      "35,25",
      "23,22",
      "23,23",
      "24,24",
      "25,24",
      "26,24",
      "27,24",
      "28,24",
      "23,24",
      "24,22",
      "24,23",
      "25,22",
      "26,22",
      "26,23",
      "27,22",
      "27,23",
      "28,23",
      "28,22",
      "25,23",
      "22,11",
      "23,11",
      "24,11",
      "25,11",
      "26,11",
      "10,20",
      "10,21",
      "10,22",
      "10,23",
      "37,42",
      "37,43",
      "37,44",
      "37,45",
      "13,2",
      "14,2",
      "15,2",
      "16,2",
      "17,2",
      "18,2",
      "19,2",
      "14,3",
      "15,3",
      "16,3",
      "17,3",
      "18,3",
      "9,35",
      "49,31",
      "49,32",
      "43,31",
      "44,31",
      "45,31",
      "46,31",
      "47,31",
      "47,32",
      "48,31",
      "48,32",
      "46,32",
      "45,32",
      "44,32",
      "43,32",
      "30,42",
      "31,42",
      "32,42",
      "33,42",
      "34,42",
      "35,42",
      "36,42",
      "36,43",
      "36,44",
      "36,45",
      "35,45",
      "34,45",
      "33,45",
      "32,45",
      "31,45",
      "30,45",
      "30,43",
      "31,43",
      "32,43",
      "33,43",
      "34,43",
      "35,43",
      "35,44",
      "34,44",
      "33,44",
      "32,44",
      "31,44",
      "30,44",
      "1,44",
      "2,44",
      "3,44",
      "4,44",
      "5,44",
      "6,44",
      "7,44",
      "8,44",
      "1,45",
      "2,45",
      "3,45",
      "4,45",
      "5,45",
      "6,45",
      "7,45",
      "8,45",
      "2,46",
      "3,46",
      "4,46",
      "5,46",
      "6,46",
      "7,46",
      "8,46",
      "1,46",
      "6,47",
      "6,48",
      "6,49",
      "5,52",
      "5,54",
      "5,55",
      "5,56",
      "5,57",
      "5,58",
      "6,50",
      "6,51",
      "6,52",
      "6,53",
      "6,54",
      "6,55",
      "6,56",
      "6,57",
      "6,58",
      "7,47",
      "7,48",
      "8,48",
      "8,49",
      "8,52",
      "8,53",
      "8,54",
      "8,55",
      "8,56",
      "8,57",
      "7,58",
      "7,59",
      "8,47",
      "7,52",
      "7,53",
      "7,54",
      "7,55",
      "7,56",
      "7,57",
      "7,51",
      "8,51",
      "8,50",
      "7,50",
      "7,49",
      "5,53",
      "8,58",
      "8,59",
      "4,59",
      "5,59",
      "6,59",
      "5,47",
      "4,47",
      "4,48",
      "4,52",
      "4,53",
      "4,54",
      "4,55",
      "4,56",
      "4,57",
      "4,58",
      "5,49",
      "5,50",
      "5,51",
      "4,51",
      "4,49",
      "5,48",
      "3,51",
      "2,51",
      "2,53",
      "2,54",
      "2,55",
      "2,56",
      "3,53",
      "3,54",
      "3,55",
      "3,56",
      "3,52",
      "1,48",
      "1,47",
      "2,47",
      "2,50",
      "1,49",
      "2,49",
      "3,49",
      "3,50",
      "4,50",
      "3,48",
      "3,47",
      "2,48",
      "1,50",
      "1,52",
      "2,52",
      "1,51",
      "1,53",
      "1,54",
      "1,55",
      "1,56",
      "1,57",
      "1,58",
      "2,57",
      "3,57",
      "2,58",
      "3,58",
      "5,35",
      "6,35",
      "7,35",
      "8,35",
      "5,36",
      "6,36",
      "7,36",
      "5,37",
      "6,37",
      "7,37",
      "45,46",
      "46,46",
      "47,46",
      "48,46",
      "49,46",
      "49,45",
      "48,45",
      "48,44",
      "48,43",
      "49,43",
      "49,42",
      "48,42",
      "47,42",
      "46,42",
      "45,42",
      "45,43",
      "45,44",
      "45,45",
      "47,43",
      "47,44",
      "46,44",
      "46,43",
      "46,45",
      "47,45",
      "49,44",
      "46,56",
      "47,56",
      "48,56",
      "49,56",
      "50,56",
      "51,56",
      "52,56",
      "52,57",
      "53,57",
      "54,57",
      "55,57",
      "53,56",
      "54,56",
      "55,56",
      "46,57",
      "47,57",
      "48,57",
      "49,57",
      "50,57",
      "51,57",
      "46,58",
      "47,58",
      "48,58",
      "49,58",
      "50,58",
      "51,58",
      "52,58",
      "53,58",
      "54,58",
      "55,58",
      "47,59",
      "48,59",
      "49,59",
      "50,59",
      "51,59",
      "52,59",
      "53,59",
      "54,59",
      "55,59",
      "46,59",
      "54,33",
      "54,32",
      "54,31",
      "54,30",
      "54,29",
      "54,28",
      "55,28",
      "55,27",
      "55,26",
      "55,17",
      "55,18",
      "54,18",
      "54,19",
      "54,20",
      "54,21",
      "54,22",
      "54,23",
      "54,24",
      "54,25",
      "54,26",
      "54,27",
      "54,17",
      "55,19",
      "55,20",
      "55,21",
      "55,22",
      "55,23",
      "55,24",
      "55,30",
      "55,31",
      "55,32",
      "55,33",
      "55,29",
      "55,25",
      "44,16",
      "45,16",
      "46,16",
      "47,16",
      "48,16",
      "49,16",
      "50,16",
      "51,16",
      "52,16",
      "53,16",
      "54,16",
      "55,16",
      "44,15",
      "45,15",
      "46,15",
      "47,15",
      "48,15",
      "49,15",
      "50,15",
      "51,15",
      "52,15",
      "53,15",
      "54,15",
      "55,15",
      "43,15",
      "44,14",
      "45,14",
      "46,14",
      "47,14",
      "48,14",
      "49,14",
      "50,14",
      "51,14",
      "52,14",
      "53,14",
      "54,14",
      "55,14",
      "28,19",
      "27,19",
      "27,17",
      "28,18",
      "27,18",
      "28,17",
      "27,16",
      "28,16",
      "29,16",
      "30,16",
      "31,16",
      "32,16",
      "33,16",
      "34,16",
      "35,16",
      "36,16",
      "37,16",
      "38,16",
      "27,15",
      "28,14",
      "28,13",
      "28,12",
      "28,11",
      "28,10",
      "29,10",
      "27,10",
      "27,11",
      "27,12",
      "27,13",
      "27,14",
      "28,15",
      "29,15",
      "29,11",
      "29,12",
      "29,13",
      "29,14",
      "30,14",
      "30,15",
      "30,11",
      "30,12",
      "31,12",
      "31,13",
      "31,14",
      "32,14",
      "32,15",
      "33,15",
      "30,13",
      "31,15",
      "33,13",
      "34,13",
      "35,13",
      "36,14",
      "37,14",
      "38,14",
      "38,15",
      "37,15",
      "36,15",
      "35,15",
      "34,15",
      "33,14",
      "34,14",
      "35,14",
      "32,13",
      "32,12",
      "33,12",
      "34,12",
      "35,12",
      "36,12",
      "37,12",
      "38,12",
      "36,13",
      "37,13",
      "38,13",
      "20,7",
      "20,8",
      "19,8",
      "20,9",
      "20,10",
      "20,11",
      "20,12",
      "20,13",
      "20,15",
      "20,14",
      "21,15",
      "21,14",
      "21,13",
      "21,12",
      "21,11",
      "21,9",
      "21,10",
      "12,14",
      "11,14",
      "12,15",
      "11,15",
      "12,16",
      "11,16",
      "10,17",
      "10,16",
      "10,15",
      "10,14",
      "9,17",
      "8,17",
      "7,17",
      "6,17",
      "5,17",
      "4,17",
      "3,17",
      "2,17",
      "9,16",
      "8,16",
      "6,16",
      "5,16",
      "4,16",
      "3,16",
      "2,16",
      "1,16",
      "7,16",
      "9,15",
      "8,15",
      "7,15",
      "6,15",
      "5,15",
      "4,15",
      "3,15",
      "2,15",
      "9,14",
      "8,14",
      "7,14",
      "6,14",
      "5,14",
      "4,14",
      "3,14",
      "2,14",
      "1,14",
      "1,15",
      "0,15",
      "0,17",
      "1,17",
      "0,16",
      "0,18",
      "0,19",
      "0,20",
      "0,21",
      "1,13",
      "2,13",
      "3,13",
      "4,13",
      "5,13",
      "6,13",
      "7,13",
      "8,13",
      "9,13",
      "10,13",
      "11,13",
      "12,13",
      "12,12",
      "12,11",
      "12,10",
      "12,9",
      "13,5",
      "13,6",
      "13,7",
      "13,8",
      "12,7",
      "12,6",
      "12,5",
      "12,4",
      "12,3",
      "12,2",
      "10,2",
      "10,3",
      "10,4",
      "10,5",
      "10,6",
      "10,7",
      "10,8",
      "9,9",
      "9,10",
      "9,11",
      "9,12",
      "10,12",
      "10,11",
      "10,10",
      "10,9",
      "11,12",
      "11,11",
      "11,10",
      "11,9",
      "11,8",
      "11,7",
      "11,6",
      "11,5",
      "11,4",
      "11,3",
      "11,2",
      "12,8",
      "0,13",
      "0,14",
      "0,12",
      "1,12",
      "2,12",
      "3,12",
      "4,12",
      "5,12",
      "6,12",
      "7,12",
      "8,11",
      "8,10",
      "8,9",
      "8,8",
      "8,7",
      "8,6",
      "8,5",
      "8,4",
      "9,3",
      "9,2",
      "8,3",
      "9,4",
      "9,5",
      "9,6",
      "9,7",
      "9,8",
      "8,12",
      "7,11",
      "6,11",
      "5,11",
      "4,11",
      "3,11",
      "2,11",
      "1,11",
      "0,11",
      "7,10",
      "6,10",
      "5,10",
      "4,10",
      "3,10",
      "2,10",
      "2,9",
      "1,9",
      "0,9",
      "0,10",
      "1,10",
      "7,9",
      "6,9",
      "5,9",
      "4,9",
      "3,9",
      "7,8",
      "5,8",
      "4,8",
      "3,8",
      "2,8",
      "1,8",
      "0,8",
      "6,8",
      "7,7",
      "6,7",
      "5,7",
      "4,7",
      "3,7",
      "2,7",
      "1,7",
      "0,7",
      "7,6",
      "6,6",
      "5,6",
      "4,6",
      "3,6",
      "2,6",
      "1,6",
      "0,6",
      "6,5",
      "7,5",
      "2,5",
      "1,5",
      "0,5",
      "4,5",
      "5,5",
      "3,5",
      "7,4",
      "6,4",
      "5,4",
      "4,4",
      "3,4",
      "2,4",
      "1,4",
      "0,4",
      "7,3",
      "6,3",
      "5,3",
      "4,3",
      "3,3",
      "2,3",
      "1,3",
      "0,3",
      "8,2",
      "7,2",
      "6,2",
      "5,2",
      "4,2",
      "3,2",
      "2,2",
      "1,2",
      "0,2",
      "0,1",
      "1,1",
      "2,1",
      "3,1",
      "4,1",
      "5,1",
      "6,1",
      "7,1",
      "8,1",
      "9,1",
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
      "6,0",
      "5,0",
      "4,0",
      "3,0",
      "2,0",
      "1,0",
      "0,0",
      "20,2",
      "20,3",
      "20,4",
      "20,5",
      "20,6",
      "21,8",
      "22,8",
      "23,8",
      "25,8",
      "22,9",
      "23,9",
      "24,9",
      "25,9",
      "26,9",
      "22,10",
      "23,10",
      "24,10",
      "25,10",
      "26,10",
      "24,8",
      "21,7",
      "23,7",
      "24,7",
      "25,7",
      "21,6",
      "21,5",
      "21,4",
      "21,3",
      "22,2",
      "23,2",
      "24,2",
      "25,2",
      "26,2",
      "27,2",
      "27,3",
      "28,3",
      "21,2",
      "22,3",
      "23,3",
      "23,4",
      "23,5",
      "23,6",
      "24,6",
      "25,6",
      "26,6",
      "26,5",
      "26,4",
      "26,3",
      "25,3",
      "24,3",
      "24,4",
      "24,5",
      "25,5",
      "25,4",
      "22,4",
      "22,5",
      "26,7",
      "27,7",
      "27,8",
      "26,8",
      "22,6",
      "22,7",
      "27,9",
      "28,9",
      "29,9",
      "30,9",
      "30,10",
      "31,10",
      "32,10",
      "34,10",
      "35,10",
      "36,10",
      "37,10",
      "38,10",
      "38,11",
      "37,11",
      "36,11",
      "35,11",
      "34,11",
      "33,11",
      "32,11",
      "31,11",
      "33,10",
      "32,9",
      "33,9",
      "37,9",
      "38,9",
      "9,0",
      "8,0",
      "7,0",
      "44,0",
      "45,0",
      "46,0",
      "47,0",
      "48,0",
      "49,0",
      "50,0",
      "51,0",
      "52,0",
      "53,0",
      "54,0",
      "55,0",
      "44,1",
      "44,2",
      "44,3",
      "44,4",
      "44,5",
      "44,6",
      "44,7",
      "44,13",
      "45,13",
      "45,7",
      "45,6",
      "45,5",
      "45,4",
      "46,1",
      "45,1",
      "45,2",
      "45,3",
      "47,3",
      "47,5",
      "37,8",
      "37,7",
      "37,6",
      "37,5",
      "37,4",
      "37,3",
      "37,2",
      "37,1",
      "37,0",
      "38,0",
      "38,1",
      "38,2",
      "38,3",
      "38,4",
      "38,5",
      "38,6",
      "38,7",
      "38,8",
      "36,8",
      "36,7",
      "36,6",
      "36,5",
      "36,4",
      "36,3",
      "36,2",
      "36,1",
      "36,0",
      "35,0",
      "35,1",
      "35,2",
      "35,3",
      "35,4",
      "35,5",
      "35,6",
      "35,7",
      "35,8",
      "34,8",
      "34,7",
      "34,6",
      "34,5",
      "34,4",
      "34,3",
      "34,2",
      "34,1",
      "34,0",
      "34,9",
      "33,0",
      "33,1",
      "33,2",
      "33,3",
      "33,4",
      "33,5",
      "33,6",
      "33,7",
      "33,8",
      "35,9",
      "36,9",
      "3,59",
      "2,59",
      "1,59",
      "0,59",
      "0,44",
      "0,58",
      "0,57",
      "0,56",
      "0,55",
      "0,54",
      "0,53",
      "0,52",
      "0,51",
      "0,50",
      "0,49",
      "0,48",
      "0,47",
      "0,46",
      "0,45",
      "0,43",
      "0,42",
      "0,41",
      "0,22",
      "0,23",
      "0,24",
      "0,25",
      "0,26",
      "0,27",
      "0,29",
      "0,30",
      "0,28",
      "0,31",
      "0,32",
      "0,33",
      "0,34",
      "0,35",
      "0,36",
      "0,37",
      "0,38",
      "0,40",
      "0,39",
      "44,9",
      "44,10",
      "44,11",
      "43,11",
      "43,12",
      "44,12",
      "44,8",
      "45,8",
      "46,8",
      "46,9",
      "47,9",
      "48,9",
      "49,9",
      "50,9",
      "51,9",
      "52,9",
      "53,10",
      "54,10",
      "45,9",
      "45,10",
      "45,11",
      "46,11",
      "47,11",
      "48,11",
      "49,11",
      "50,12",
      "51,12",
      "52,12",
      "53,12",
      "54,12",
      "55,12",
      "46,12",
      "47,12",
      "48,12",
      "45,12",
      "46,13",
      "47,13",
      "48,13",
      "49,13",
      "50,13",
      "51,13",
      "52,13",
      "53,13",
      "54,13",
      "55,13",
      "49,12",
      "47,10",
      "48,10",
      "49,10",
      "50,10",
      "51,10",
      "52,10",
      "46,10",
      "50,11",
      "51,11",
      "52,11",
      "53,11",
      "54,11",
      "55,11",
      "23,0",
      "24,0",
      "25,0",
      "26,0",
      "27,0",
      "28,0",
      "29,0",
      "30,0",
      "31,0",
      "32,0",
      "26,1",
      "27,1",
      "28,1",
      "29,1",
      "30,1",
      "30,2",
      "31,2",
      "32,2",
      "31,1",
      "32,1",
      "28,2",
      "29,2",
      "28,4",
      "29,4",
      "30,4",
      "31,4",
      "31,5",
      "27,4",
      "27,5",
      "28,5",
      "28,6",
      "29,6",
      "29,5",
      "30,5",
      "30,8",
      "29,8",
      "28,7",
      "29,7",
      "30,7",
      "31,7",
      "31,8",
      "31,9",
      "28,8",
      "27,6",
      "31,6",
      "32,6",
      "32,8",
      "32,7",
      "30,6",
      "29,3",
      "30,3",
      "31,3",
      "32,4",
      "32,5",
      "32,3",
      "46,2",
      "46,3",
      "46,4",
      "46,5",
      "46,6",
      "47,7",
      "48,7",
      "49,7",
      "50,7",
      "51,7",
      "52,7",
      "53,7",
      "54,7",
      "46,7",
      "47,8",
      "48,8",
      "49,8",
      "51,8",
      "52,8",
      "53,8",
      "54,8",
      "54,9",
      "53,9",
      "50,8",
      "47,6",
      "48,6",
      "49,6",
      "51,6",
      "54,6",
      "55,6",
      "50,6",
      "53,6",
      "52,6",
      "47,4",
      "48,4",
      "49,4",
      "50,4",
      "51,4",
      "52,4",
      "53,4",
      "54,4",
      "55,4",
      "48,5",
      "49,5",
      "50,5",
      "51,5",
      "52,5",
      "53,5",
      "54,5",
      "55,5",
      "48,2",
      "49,2",
      "50,2",
      "51,2",
      "53,2",
      "54,2",
      "55,2",
      "48,3",
      "49,3",
      "50,3",
      "51,3",
      "52,3",
      "54,3",
      "55,3",
      "52,2",
      "53,3",
      "47,2",
      "47,1",
      "48,1",
      "49,1",
      "50,1",
      "51,1",
      "52,1",
      "53,1",
      "54,1",
      "55,1",
      "22,46",
      "12,0",
      "10,0",
      "10,1",
      "11,1",
      "11,0",
      "61,52",
      "61,53",
      "61,54",
      "61,55",
      "55,48",
      "55,46",
      "61,11",
      "61,12",
      "61,15",
      "62,7",
      "63,7",
      "64,7",
      "65,7",
      "65,6",
      "64,6",
      "63,6",
      "62,6",
      "61,6",
      "61,5",
      "62,5",
      "63,5",
      "64,5",
      "65,5",
      "64,4",
      "61,16",
      "61,17",
      "61,18",
      "61,19",
      "61,20",
      "61,21",
      "61,22",
      "61,23",
      "61,24",
      "61,25",
      "61,26",
      "61,27",
      "61,28",
      "61,29",
      "62,29",
      "62,30",
      "65,30",
      "65,31",
      "65,32",
      "61,30",
      "61,31",
      "61,32",
      "61,33",
      "61,34",
      "61,35",
      "61,36",
      "61,37",
      "61,38",
      "61,39",
      "61,40",
      "62,40",
      "62,41",
      "62,42",
      "62,43",
      "61,42",
      "61,43",
      "61,44",
      "61,45",
      "61,46",
      "61,47",
      "61,48",
      "61,49",
      "61,50",
      "61,51",
      "55,54",
      "55,55",
      "56,55",
      "57,55",
      "58,55",
      "59,55",
      "60,55",
      "60,54",
      "59,54",
      "58,54",
      "57,54",
      "56,54",
      "56,56",
      "57,56",
      "58,56",
      "59,56",
      "60,56",
      "61,56",
      "62,56",
      "56,57",
      "57,57",
      "58,57",
      "59,57",
      "60,57",
      "61,57",
      "62,57",
      "63,57",
      "64,57",
      "65,57",
      "65,58",
      "65,59",
      "64,59",
      "56,59",
      "56,58",
      "57,58",
      "58,58",
      "59,58",
      "60,58",
      "61,58",
      "62,58",
      "63,58",
      "64,58",
      "57,59",
      "59,59",
      "60,59",
      "61,59",
      "62,59",
      "58,59",
      "63,59",
      "63,56",
      "64,56",
      "65,56",
      "65,55",
      "64,55",
      "63,55",
      "62,55",
      "62,54",
      "62,53",
      "63,53",
      "63,54",
      "64,54",
      "65,54",
      "65,53",
      "65,52",
      "64,53",
      "64,51",
      "64,50",
      "65,50",
      "65,49",
      "65,48",
      "65,47",
      "62,44",
      "62,45",
      "62,46",
      "62,47",
      "62,48",
      "62,49",
      "62,50",
      "62,51",
      "62,52",
      "63,52",
      "64,52",
      "65,51",
      "63,51",
      "63,50",
      "63,49",
      "63,48",
      "63,47",
      "63,46",
      "63,45",
      "63,44",
      "64,49",
      "64,48",
      "64,47",
      "64,46",
      "64,45",
      "64,44",
      "63,40",
      "63,41",
      "63,42",
      "63,43",
      "64,43",
      "64,42",
      "64,41",
      "64,40",
      "61,41",
      "65,46",
      "65,45",
      "65,44",
      "65,43",
      "65,42",
      "65,41",
      "65,40",
      "65,39",
      "65,38",
      "65,37",
      "65,36",
      "64,37",
      "64,38",
      "64,39",
      "63,39",
      "62,39",
      "62,38",
      "62,37",
      "63,37",
      "63,38",
      "63,32",
      "63,33",
      "63,34",
      "63,35",
      "62,34",
      "62,33",
      "62,32",
      "62,31",
      "64,32",
      "64,33",
      "65,33",
      "65,35",
      "65,34",
      "64,34",
      "64,35",
      "64,36",
      "63,36",
      "62,36",
      "64,31",
      "63,31",
      "64,30",
      "63,30",
      "65,29",
      "64,29",
      "63,29",
      "62,35",
      "63,17",
      "63,18",
      "62,18",
      "62,19",
      "62,20",
      "62,21",
      "62,22",
      "62,23",
      "62,24",
      "62,25",
      "62,26",
      "62,27",
      "62,28",
      "63,28",
      "64,28",
      "64,27",
      "64,26",
      "63,25",
      "63,24",
      "63,23",
      "64,20",
      "64,19",
      "63,19",
      "63,20",
      "63,21",
      "63,22",
      "64,21",
      "64,22",
      "64,23",
      "64,24",
      "64,25",
      "63,26",
      "63,27",
      "65,28",
      "65,27",
      "65,26",
      "65,25",
      "65,24",
      "65,23",
      "65,22",
      "65,21",
      "65,20",
      "65,19",
      "65,18",
      "65,17",
      "64,18",
      "64,17",
      "64,16",
      "64,15",
      "64,14",
      "64,13",
      "64,12",
      "64,11",
      "64,10",
      "64,9",
      "64,8",
      "65,8",
      "65,9",
      "65,10",
      "65,11",
      "65,12",
      "65,13",
      "65,14",
      "65,15",
      "65,16",
      "63,15",
      "63,14",
      "63,13",
      "63,12",
      "63,11",
      "63,10",
      "63,9",
      "63,8",
      "62,8",
      "62,9",
      "62,10",
      "62,11",
      "62,12",
      "62,13",
      "62,14",
      "62,15",
      "62,17",
      "62,16",
      "63,16",
      "56,0",
      "57,0",
      "58,0",
      "59,0",
      "60,0",
      "61,0",
      "62,0",
      "63,0",
      "64,0",
      "65,0",
      "65,1",
      "65,2",
      "65,4",
      "65,3",
      "64,1",
      "63,1",
      "62,1",
      "61,1",
      "61,2",
      "61,3",
      "61,4",
      "62,2",
      "63,2",
      "64,2",
      "64,3",
      "63,3",
      "62,3",
      "62,4",
      "63,4",
      "56,48",
      "57,48",
      "59,48",
      "60,48",
      "55,45",
      "61,13",
      "61,14",
      "55,7",
      "55,8",
      "55,9",
      "55,10",
      "56,1",
      "57,1",
      "61,7",
      "61,8",
      "61,9",
      "61,10",
      "58,1",
      "59,1",
      "60,1",
      "60,2",
      "59,2",
      "58,2",
      "57,2",
      "56,2",
      "9,39",
      "9,38",
      "9,36",
      "9,37",
      "41,13",
      "42,13",
      "40,8",
      "42,8",
      "41,2",
      "8,39",
      "8,38",
      "8,37",
      "8,36",
      "15,54",
      "16,54",
      "17,54",
      "17,55",
      "12,38",
      "42,2",
      "40,48",
      "40,47",
      "43,20"
    ],
    "breakable": [],
    "camp": [
      "16,58",
      "16,59",
      "17,58",
      "17,59",
      "18,58",
      "18,59",
      "19,58",
      "19,59",
      "20,58",
      "20,59",
      "21,58",
      "21,59",
      "22,58",
      "22,59",
      "23,58",
      "23,59",
      "24,58",
      "24,59",
      "25,58",
      "25,59",
      "26,58",
      "26,59",
      "27,58",
      "27,59",
      "28,58",
      "28,59",
      "29,58",
      "29,59",
      "30,58",
      "30,59",
      "31,58",
      "31,59"
    ],
    "rules": {
      "money": 3000,
      "guide": 100,
      "guideRegen": 9,
      "speed": 14,
      "reward": 30
    },
    "cols": 66,
    "rows": 60,
    "safe": false,
    "npcs": false,
    "portals": [
      {
        "c": 41,
        "r": 3,
        "to": "map_mvnjr2ze"
      }
    ],
    "solidOffsets": {},
    "coreSpots": [
      "58,11"
    ],
    "coreCount": 1,
    "monsterMix": [
      {
        "id": "slime",
        "weight": 50
      },
      {
        "id": "bird_head",
        "weight": 40
      },
      {
        "id": "pearl_kid",
        "weight": 20
      },
      {
        "id": "lifeform",
        "weight": 30
      },
      {
        "id": "hangi_bao",
        "weight": 30
      },
      {
        "id": "fish_head",
        "weight": 50
      },
      {
        "id": "loofah_lady",
        "weight": 100
      },
      {
        "id": "milkfish_kid",
        "weight": 100
      },
      {
        "id": "milkfish_kid_small",
        "weight": 100
      },
      {
        "id": "burrowing_mouse",
        "weight": 50
      },
      {
        "id": "clownfish",
        "weight": 50
      },
      {
        "id": "clownfish_small",
        "weight": 100
      },
      {
        "id": "golden_banana_king",
        "weight": 100
      }
    ],
    "spawnZone": [
      "12,26",
      "12,25",
      "13,25",
      "13,24",
      "14,24",
      "15,25",
      "16,26",
      "15,26",
      "14,26",
      "13,26",
      "14,25",
      "11,26",
      "11,25",
      "11,24",
      "12,24",
      "15,24",
      "16,24",
      "12,23",
      "13,23",
      "14,23",
      "15,23",
      "21,23",
      "22,23",
      "35,22",
      "38,21",
      "37,21",
      "39,21",
      "40,21",
      "41,21",
      "42,21",
      "43,21",
      "44,21",
      "45,21",
      "45,22",
      "44,22",
      "43,22",
      "42,22",
      "41,22",
      "40,22",
      "39,22",
      "38,22",
      "37,22",
      "41,26",
      "42,26",
      "43,26",
      "44,26",
      "45,26",
      "41,27",
      "42,27",
      "43,27",
      "44,27",
      "45,27",
      "46,27",
      "31,26",
      "32,26",
      "33,26",
      "34,26",
      "34,27",
      "33,28",
      "32,28",
      "32,27",
      "33,27",
      "23,30",
      "24,30",
      "25,30",
      "26,30",
      "27,30",
      "28,30",
      "29,30",
      "30,30",
      "31,30",
      "32,30",
      "23,31",
      "24,31",
      "25,31",
      "26,31",
      "27,31",
      "11,31",
      "12,31",
      "13,31",
      "14,31",
      "12,30",
      "13,30",
      "14,30",
      "11,30",
      "15,30",
      "19,35",
      "20,35",
      "21,35",
      "21,36",
      "20,36",
      "19,36",
      "18,35",
      "18,36",
      "21,37",
      "20,37",
      "18,37",
      "28,36",
      "29,36",
      "30,36",
      "30,37",
      "29,37",
      "28,37",
      "27,36",
      "27,37",
      "13,43",
      "13,42",
      "13,41",
      "13,40",
      "42,43",
      "41,43",
      "40,43",
      "39,43",
      "40,44",
      "41,44",
      "42,44",
      "39,44",
      "38,44",
      "11,51",
      "11,50",
      "12,50",
      "12,51",
      "10,57",
      "10,58",
      "11,58",
      "12,58",
      "13,58",
      "48,49",
      "48,50",
      "48,51",
      "48,52",
      "47,52",
      "47,51",
      "47,50",
      "47,49",
      "42,36",
      "43,36",
      "44,36",
      "45,36",
      "46,36",
      "47,36",
      "48,36",
      "38,36",
      "38,37",
      "39,36",
      "39,37",
      "38,38",
      "39,38",
      "40,38",
      "41,38",
      "42,38",
      "38,31",
      "36,31",
      "35,31",
      "38,28",
      "38,29",
      "38,30",
      "38,27",
      "37,30",
      "36,30",
      "35,30",
      "39,27",
      "40,27",
      "38,26",
      "39,26",
      "40,26",
      "46,26",
      "12,21",
      "13,21",
      "14,21",
      "14,22",
      "15,22",
      "12,22",
      "13,22",
      "14,20",
      "15,20",
      "15,21",
      "16,23",
      "16,22",
      "16,21",
      "16,20",
      "15,18",
      "14,19",
      "13,19",
      "12,19",
      "12,20",
      "11,23",
      "11,22",
      "11,21",
      "15,19",
      "22,24",
      "21,24",
      "20,24",
      "19,24",
      "18,24",
      "16,25",
      "17,25",
      "18,25",
      "19,25",
      "20,25",
      "22,25",
      "21,25",
      "17,26",
      "18,26",
      "19,26",
      "20,26",
      "21,26",
      "17,24",
      "13,20",
      "2,23",
      "3,23",
      "4,23",
      "5,23",
      "6,23",
      "7,23",
      "8,23",
      "9,23",
      "10,23",
      "18,23",
      "19,23",
      "20,23",
      "2,31",
      "3,31",
      "5,31",
      "3,32",
      "2,32",
      "6,31",
      "25,36",
      "26,36",
      "24,37",
      "26,37",
      "25,41",
      "25,40",
      "25,39",
      "25,38",
      "25,37",
      "25,42",
      "26,38",
      "26,42",
      "26,43",
      "26,44",
      "26,41",
      "26,40",
      "26,39",
      "14,38",
      "14,39",
      "14,40",
      "14,41",
      "14,42",
      "14,43",
      "14,44",
      "13,38",
      "13,39",
      "18,38",
      "18,39",
      "18,40",
      "19,39",
      "19,40",
      "19,37",
      "19,38",
      "53,44",
      "53,45",
      "53,46",
      "53,47",
      "53,48",
      "53,49",
      "53,50",
      "53,51",
      "53,52",
      "54,44",
      "54,45",
      "54,46",
      "54,47",
      "54,48",
      "54,49",
      "54,50",
      "54,51",
      "50,49",
      "51,49",
      "52,49",
      "51,50",
      "52,50",
      "51,51",
      "50,51",
      "50,50",
      "52,51",
      "52,52",
      "51,52",
      "50,52",
      "41,51",
      "42,51",
      "43,51",
      "44,51",
      "45,51",
      "46,51",
      "41,52",
      "43,52",
      "44,52",
      "46,52",
      "11,57",
      "12,57",
      "13,57",
      "14,57",
      "15,57",
      "16,57",
      "14,58",
      "15,58",
      "16,58",
      "17,58",
      "18,58",
      "19,58",
      "20,58",
      "21,58",
      "43,53",
      "44,53",
      "44,54",
      "44,55",
      "42,56",
      "42,55",
      "42,54",
      "42,53",
      "42,52",
      "43,55",
      "43,54",
      "34,22",
      "23,15",
      "23,16",
      "23,17",
      "23,18",
      "24,18",
      "24,17",
      "24,16",
      "24,15",
      "57,12",
      "57,13",
      "57,14",
      "57,15",
      "57,16",
      "57,17",
      "57,18",
      "58,12",
      "58,13",
      "58,14",
      "58,15",
      "58,16",
      "58,17",
      "58,18",
      "59,12",
      "59,13",
      "59,14",
      "59,15",
      "59,16",
      "59,17",
      "59,18",
      "60,12",
      "60,13",
      "60,14",
      "60,15",
      "60,16",
      "60,17",
      "60,18",
      "56,12",
      "56,13",
      "56,14",
      "56,15",
      "56,16",
      "56,17",
      "56,18",
      "57,39",
      "57,40",
      "57,41",
      "57,42",
      "57,43",
      "57,44",
      "57,45",
      "58,45",
      "58,44",
      "58,43",
      "58,42",
      "58,41",
      "58,40",
      "58,39",
      "58,38",
      "59,38",
      "60,39",
      "60,40",
      "60,41",
      "60,42",
      "60,43",
      "60,44",
      "60,45",
      "59,45",
      "59,44",
      "59,43",
      "59,42",
      "59,41",
      "59,40",
      "59,39",
      "56,39",
      "56,40",
      "56,41",
      "56,42",
      "56,43",
      "56,44",
      "56,45",
      "56,51",
      "57,51",
      "58,51",
      "59,51",
      "59,50",
      "58,50",
      "57,50",
      "56,50",
      "60,51",
      "60,52",
      "59,52",
      "59,53",
      "58,53",
      "57,53",
      "56,53",
      "55,53",
      "55,52",
      "54,52",
      "56,52",
      "57,52",
      "58,52",
      "56,38",
      "57,38",
      "60,38",
      "60,37",
      "59,37",
      "59,36",
      "58,36",
      "57,36",
      "57,37",
      "56,37",
      "58,37",
      "60,36",
      "57,4",
      "57,3",
      "59,3",
      "60,3",
      "59,4",
      "58,4",
      "58,3",
      "60,4",
      "56,3",
      "57,5",
      "58,5",
      "59,5",
      "60,5",
      "56,4",
      "56,5",
      "56,6",
      "60,6",
      "59,6",
      "58,6",
      "57,6",
      "60,7",
      "59,7",
      "58,7",
      "57,7",
      "56,7"
    ],
    "elite": {
      "of": "bird_head",
      "c": 58,
      "r": 13,
      "wakeRow": 14,
      "guards": [
        [
          56,
          13
        ],
        [
          60,
          13
        ],
        [
          59,
          12
        ]
      ],
      "ambush": [
        [
          57,
          33
        ],
        [
          58,
          33
        ],
        [
          59,
          33
        ]
      ]
    },
    "hiddenPickups": []
  },
  {
    "id": "map_mr4mbd88",
    "name": "台北車站大廳",
    "desc": "",
    "layers": {
      "floor": {
        "6,0": "tile_station_hall_color_brown",
        "7,0": "tile_station_hall_color_brown",
        "8,0": "tile_station_hall_color_brown",
        "9,0": "tile_station_hall_color_brown",
        "10,0": "tile_station_hall_color_brown",
        "11,0": "tile_station_hall_color_brown",
        "12,1": "tile_station_hall_color_brown",
        "13,1": "tile_station_hall_color_brown",
        "14,1": "tile_station_hall_color_brown",
        "15,1": "tile_station_hall_color_brown",
        "16,1": "tile_station_hall_color_brown",
        "17,1": "tile_station_hall_color_brown",
        "18,1": "tile_station_hall_color_brown",
        "18,0": "tile_station_hall_color_brown",
        "19,0": "tile_station_hall_color_brown",
        "17,0": "tile_station_hall_color_brown",
        "16,0": "tile_station_hall_color_brown",
        "15,0": "tile_station_hall_color_brown",
        "14,0": "tile_station_hall_color_brown",
        "13,0": "tile_station_hall_color_brown",
        "12,0": "tile_station_hall_color_brown",
        "6,1": "tile_station_hall_color_brown",
        "7,1": "tile_station_hall_color_brown",
        "9,1": "tile_station_hall_color_brown",
        "10,1": "tile_station_hall_color_brown",
        "11,1": "tile_station_hall_color_brown",
        "19,1": "tile_station_hall_color_brown",
        "20,1": "tile_station_hall_color_brown",
        "21,1": "tile_station_hall_color_brown",
        "22,1": "tile_station_hall_color_brown",
        "23,1": "tile_station_hall_color_brown",
        "24,1": "tile_station_hall_color_brown",
        "25,1": "tile_station_hall_color_brown",
        "25,0": "tile_station_hall_color_brown",
        "26,0": "tile_station_hall_color_brown",
        "27,0": "tile_station_hall_color_brown",
        "20,0": "tile_station_hall_color_brown",
        "21,0": "tile_station_hall_color_brown",
        "22,0": "tile_station_hall_color_brown",
        "23,0": "tile_station_hall_color_brown",
        "24,0": "tile_station_hall_color_brown",
        "8,1": "tile_station_hall_color_brown",
        "33,0": "tile_station_hall_color_brown",
        "32,0": "tile_station_hall_color_brown",
        "31,0": "tile_station_hall_color_brown",
        "30,0": "tile_station_hall_color_brown",
        "29,0": "tile_station_hall_color_brown",
        "28,0": "tile_station_hall_color_brown",
        "26,1": "tile_station_hall_color_brown",
        "27,1": "tile_station_hall_color_brown",
        "28,1": "tile_station_hall_color_brown",
        "29,1": "tile_station_hall_color_brown",
        "31,1": "tile_station_hall_color_brown",
        "32,1": "tile_station_hall_color_brown",
        "33,1": "tile_station_hall_color_brown",
        "30,1": "tile_station_hall_color_brown",
        "6,2": "tile_station_hall_color_brown",
        "7,2": "tile_station_hall_color_brown",
        "8,2": "tile_station_hall_color_brown",
        "9,2": "tile_station_hall_color_brown",
        "10,2": "tile_station_hall_color_brown",
        "11,2": "tile_station_hall_color_brown",
        "12,2": "tile_station_hall_color_brown",
        "13,2": "tile_station_hall_color_brown",
        "14,2": "tile_station_hall_color_brown",
        "15,2": "tile_station_hall_color_brown",
        "16,2": "tile_station_hall_color_brown",
        "17,2": "tile_station_hall_color_brown",
        "18,2": "tile_station_hall_color_brown",
        "19,2": "tile_station_hall_color_brown",
        "20,2": "tile_station_hall_color_brown",
        "21,2": "tile_station_hall_color_brown",
        "22,2": "tile_station_hall_color_brown",
        "23,2": "tile_station_hall_color_brown",
        "24,2": "tile_station_hall_color_brown",
        "25,2": "tile_station_hall_color_brown",
        "26,2": "tile_station_hall_color_brown",
        "27,2": "tile_station_hall_color_brown",
        "28,2": "tile_station_hall_color_brown",
        "29,2": "tile_station_hall_color_brown",
        "30,2": "tile_station_hall_color_brown",
        "31,2": "tile_station_hall_color_brown",
        "32,2": "tile_station_hall_color_brown",
        "33,2": "tile_station_hall_color_brown",
        "24,3": "tile_station_hall_color_brown",
        "27,3": "tile_station_hall_color_brown",
        "26,3": "tile_station_hall_color_brown",
        "25,3": "tile_station_hall_color_brown",
        "22,3": "tile_station_hall_color_brown",
        "20,3": "tile_station_hall_color_brown",
        "19,3": "tile_station_hall_color_brown",
        "17,3": "tile_station_hall_color_brown",
        "16,3": "tile_station_hall_color_brown",
        "15,3": "tile_station_hall_color_brown",
        "14,3": "tile_station_hall_color_brown",
        "13,3": "tile_station_hall_color_brown",
        "12,3": "tile_station_hall_color_brown",
        "11,3": "tile_station_hall_color_brown",
        "10,3": "tile_station_hall_color_brown",
        "9,3": "tile_station_hall_color_brown",
        "8,3": "tile_station_hall_color_brown",
        "7,3": "tile_station_hall_color_brown",
        "6,3": "tile_station_hall_color_brown",
        "18,3": "tile_station_hall_color_brown",
        "21,3": "tile_station_hall_color_brown",
        "23,3": "tile_station_hall_color_brown",
        "28,3": "tile_station_hall_color_brown",
        "29,3": "tile_station_hall_color_brown",
        "30,3": "tile_station_hall_color_brown",
        "31,3": "tile_station_hall_color_brown",
        "32,3": "tile_station_hall_color_brown",
        "33,3": "tile_station_hall_color_brown"
      },
      "ground": {
        "31,19": "tile_mu563g4x",
        "31,20": "tile_mu563g4x",
        "31,21": "tile_mu563g4x",
        "31,22": "tile_mu563g4x",
        "31,23": "tile_mu563g4x",
        "31,24": "tile_mu563g4x",
        "31,25": "tile_mu563g4x",
        "31,26": "tile_mu563g4x",
        "31,27": "tile_mu563g4x",
        "31,11": "tile_station_hall_floor_corner",
        "31,12": "tile_mu563g4x",
        "31,13": "tile_mu563g4x",
        "31,14": "tile_mu563g4x",
        "31,15": "tile_mu563g4x",
        "31,16": "tile_mu563g4x",
        "31,17": "tile_mu563g4x",
        "31,18": "tile_mu563g4x",
        "9,11": "tile_station_hall_floor_edge",
        "10,11": "tile_station_hall_floor_edge",
        "11,11": "tile_station_hall_floor_edge",
        "12,11": "tile_station_hall_floor_edge",
        "13,11": "tile_station_hall_floor_edge",
        "14,11": "tile_station_hall_floor_edge",
        "15,11": "tile_station_hall_floor_edge",
        "16,11": "tile_station_hall_floor_edge",
        "17,11": "tile_station_hall_floor_edge",
        "18,11": "tile_station_hall_floor_edge",
        "19,11": "tile_station_hall_floor_edge",
        "20,11": "tile_station_hall_floor_edge",
        "21,11": "tile_station_hall_floor_edge",
        "22,11": "tile_station_hall_floor_edge",
        "23,11": "tile_station_hall_floor_edge",
        "24,11": "tile_station_hall_floor_edge",
        "25,11": "tile_station_hall_floor_edge",
        "26,11": "tile_station_hall_floor_edge",
        "27,11": "tile_station_hall_floor_edge",
        "28,11": "tile_station_hall_floor_edge",
        "29,11": "tile_station_hall_floor_edge",
        "30,11": "tile_station_hall_floor_edge"
      },
      "object": {},
      "overlay": {},
      "top": {},
      "ground2": {
        "13,32": "tile_dmg_debris_dust"
      },
      "ground3": {},
      "object2": {},
      "object3": {},
      "object4": {}
    },
    "stamps": [
      {
        "id": "tile_station_hall_floor",
        "c": 9,
        "r": 12,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 11,
        "r": 12,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 13,
        "r": 12,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 9,
        "r": 14,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 11,
        "r": 14,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 13,
        "r": 14,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 15,
        "r": 12,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 17,
        "r": 12,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 17,
        "r": 14,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 15,
        "r": 14,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 19,
        "r": 12,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 19,
        "r": 14,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 21,
        "r": 14,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 0,
        "r": 4,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 2,
        "r": 4,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 4,
        "r": 4,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 0,
        "r": 6,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 2,
        "r": 6,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 0,
        "r": 8,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 0,
        "r": 10,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 0,
        "r": 12,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 0,
        "r": 14,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 0,
        "r": 16,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 0,
        "r": 18,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 0,
        "r": 20,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 0,
        "r": 22,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 0,
        "r": 24,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 2,
        "r": 8,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 2,
        "r": 10,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 2,
        "r": 12,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 2,
        "r": 14,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 2,
        "r": 16,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 2,
        "r": 18,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 2,
        "r": 20,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 2,
        "r": 22,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 2,
        "r": 24,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 4,
        "r": 6,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 4,
        "r": 8,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 4,
        "r": 10,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 4,
        "r": 12,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 4,
        "r": 14,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 4,
        "r": 16,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 4,
        "r": 18,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 4,
        "r": 20,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 4,
        "r": 22,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 4,
        "r": 24,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 30,
        "r": 4,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 34,
        "r": 4,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 36,
        "r": 4,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 38,
        "r": 4,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 30,
        "r": 6,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 34,
        "r": 6,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 36,
        "r": 6,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 38,
        "r": 6,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 38,
        "r": 8,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 36,
        "r": 8,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 34,
        "r": 8,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 38,
        "r": 10,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 36,
        "r": 10,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 34,
        "r": 10,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 38,
        "r": 12,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 36,
        "r": 12,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 34,
        "r": 12,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 38,
        "r": 14,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 36,
        "r": 14,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 34,
        "r": 14,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 38,
        "r": 16,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 36,
        "r": 16,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 34,
        "r": 16,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 38,
        "r": 18,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 36,
        "r": 18,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 34,
        "r": 18,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 38,
        "r": 20,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 36,
        "r": 20,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 34,
        "r": 20,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 38,
        "r": 22,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 36,
        "r": 22,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 34,
        "r": 22,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 36,
        "r": 24,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 34,
        "r": 24,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 38,
        "r": 24,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 38,
        "r": 26,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 36,
        "r": 26,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 34,
        "r": 26,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 38,
        "r": 28,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 36,
        "r": 28,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 34,
        "r": 28,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 38,
        "r": 30,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 36,
        "r": 30,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 34,
        "r": 30,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 38,
        "r": 32,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 36,
        "r": 32,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 34,
        "r": 32,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 21,
        "r": 12,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 23,
        "r": 12,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 23,
        "r": 14,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 25,
        "r": 12,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 25,
        "r": 14,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 9,
        "r": 16,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 11,
        "r": 16,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 13,
        "r": 16,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 15,
        "r": 16,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 17,
        "r": 16,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 19,
        "r": 16,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 21,
        "r": 16,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 23,
        "r": 16,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 25,
        "r": 16,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 27,
        "r": 12,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 27,
        "r": 14,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 29,
        "r": 12,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 29,
        "r": 14,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 29,
        "r": 16,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 27,
        "r": 16,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 9,
        "r": 18,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 11,
        "r": 18,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 13,
        "r": 18,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 15,
        "r": 18,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 17,
        "r": 18,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 19,
        "r": 18,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 21,
        "r": 18,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 23,
        "r": 18,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 25,
        "r": 18,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 27,
        "r": 18,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 29,
        "r": 18,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 9,
        "r": 20,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 11,
        "r": 20,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 9,
        "r": 22,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 11,
        "r": 22,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 13,
        "r": 20,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 13,
        "r": 22,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 15,
        "r": 20,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 17,
        "r": 20,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 15,
        "r": 22,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 17,
        "r": 22,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 19,
        "r": 20,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 19,
        "r": 22,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 21,
        "r": 20,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 21,
        "r": 22,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 23,
        "r": 20,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 23,
        "r": 22,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 25,
        "r": 20,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 25,
        "r": 22,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 27,
        "r": 20,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 29,
        "r": 20,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 29,
        "r": 22,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 27,
        "r": 22,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 9,
        "r": 24,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 11,
        "r": 24,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 13,
        "r": 24,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 15,
        "r": 24,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 17,
        "r": 24,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 19,
        "r": 24,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 21,
        "r": 24,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 23,
        "r": 24,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 25,
        "r": 24,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 27,
        "r": 24,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 29,
        "r": 24,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 29,
        "r": 26,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 9,
        "r": 26,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 11,
        "r": 26,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 13,
        "r": 26,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 15,
        "r": 26,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 17,
        "r": 26,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 19,
        "r": 26,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 21,
        "r": 26,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 23,
        "r": 26,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 25,
        "r": 26,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 27,
        "r": 26,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 6,
        "r": 4,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 8,
        "r": 4,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 8,
        "r": 6,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 6,
        "r": 6,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 6,
        "r": 8,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 8,
        "r": 8,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 10,
        "r": 4,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 12,
        "r": 4,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 14,
        "r": 4,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 16,
        "r": 4,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 18,
        "r": 4,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 20,
        "r": 4,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 22,
        "r": 4,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 24,
        "r": 4,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 26,
        "r": 4,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 28,
        "r": 4,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 28,
        "r": 6,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 26,
        "r": 6,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 24,
        "r": 6,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 22,
        "r": 6,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 20,
        "r": 6,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 18,
        "r": 6,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 16,
        "r": 6,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 14,
        "r": 6,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 12,
        "r": 6,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 10,
        "r": 6,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 10,
        "r": 8,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 6,
        "r": 12,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 6,
        "r": 14,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 6,
        "r": 16,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 6,
        "r": 18,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 6,
        "r": 20,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 6,
        "r": 22,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 6,
        "r": 24,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 6,
        "r": 26,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 4,
        "r": 26,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 0,
        "r": 26,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 2,
        "r": 26,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 36,
        "r": 34,
        "layer": "floor",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 34,
        "r": 34,
        "layer": "floor",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 32,
        "r": 32,
        "layer": "floor",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 32,
        "r": 34,
        "layer": "floor",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 6,
        "r": 32,
        "layer": "floor",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 6,
        "r": 34,
        "layer": "floor",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 4,
        "r": 32,
        "layer": "floor",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 4,
        "r": 34,
        "layer": "floor",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 2,
        "r": 32,
        "layer": "floor",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 0,
        "r": 32,
        "layer": "floor",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 2,
        "r": 34,
        "layer": "floor",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 0,
        "r": 34,
        "layer": "floor",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_mu563g4x",
        "c": 8,
        "r": 12,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_mu563g4x",
        "c": 8,
        "r": 13,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_mu563g4x",
        "c": 8,
        "r": 14,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_mu563g4x",
        "c": 8,
        "r": 15,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_mu563g4x",
        "c": 8,
        "r": 16,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_mu563g4x",
        "c": 8,
        "r": 17,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_mu563g4x",
        "c": 8,
        "r": 18,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_mu563g4x",
        "c": 8,
        "r": 19,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_mu563g4x",
        "c": 8,
        "r": 20,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_mu563g4x",
        "c": 8,
        "r": 21,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_mu563g4x",
        "c": 8,
        "r": 22,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_mu563g4x",
        "c": 8,
        "r": 23,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_mu563g4x",
        "c": 8,
        "r": 24,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_mu563g4x",
        "c": 8,
        "r": 25,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_mu563g4x",
        "c": 8,
        "r": 26,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_mu563g4x",
        "c": 8,
        "r": 27,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 6,
        "r": 28,
        "layer": "floor",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 4,
        "r": 28,
        "layer": "floor",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 0,
        "r": 28,
        "layer": "floor",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 2,
        "r": 28,
        "layer": "floor",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 0,
        "r": 30,
        "layer": "floor",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 2,
        "r": 30,
        "layer": "floor",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 4,
        "r": 30,
        "layer": "floor",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 6,
        "r": 30,
        "layer": "floor",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 32,
        "r": 12,
        "layer": "floor",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 32,
        "r": 14,
        "layer": "floor",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 32,
        "r": 16,
        "layer": "floor",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 32,
        "r": 18,
        "layer": "floor",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 32,
        "r": 20,
        "layer": "floor",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 32,
        "r": 22,
        "layer": "floor",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 32,
        "r": 24,
        "layer": "floor",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 32,
        "r": 26,
        "layer": "floor",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 32,
        "r": 28,
        "layer": "floor",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 32,
        "r": 30,
        "layer": "floor",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 38,
        "r": 34,
        "layer": "floor",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 8,
        "r": 34,
        "layer": "floor",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 8,
        "r": 32,
        "layer": "floor",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 8,
        "r": 30,
        "layer": "floor",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 10,
        "r": 34,
        "layer": "floor",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 10,
        "r": 32,
        "layer": "floor",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 10,
        "r": 30,
        "layer": "floor",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 12,
        "r": 34,
        "layer": "floor",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 14,
        "r": 34,
        "layer": "floor",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 16,
        "r": 34,
        "layer": "floor",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 18,
        "r": 34,
        "layer": "floor",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 24,
        "r": 34,
        "layer": "floor",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 26,
        "r": 34,
        "layer": "floor",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 28,
        "r": 34,
        "layer": "floor",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 30,
        "r": 34,
        "layer": "floor",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 30,
        "r": 32,
        "layer": "floor",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 28,
        "r": 32,
        "layer": "floor",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 26,
        "r": 32,
        "layer": "floor",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 24,
        "r": 32,
        "layer": "floor",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 22,
        "r": 32,
        "layer": "floor",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 20,
        "r": 32,
        "layer": "floor",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 20,
        "r": 34,
        "layer": "floor",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 22,
        "r": 34,
        "layer": "floor",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 18,
        "r": 32,
        "layer": "floor",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 12,
        "r": 32,
        "layer": "floor",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 14,
        "r": 32,
        "layer": "floor",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 16,
        "r": 32,
        "layer": "floor",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 12,
        "r": 30,
        "layer": "floor",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 14,
        "r": 30,
        "layer": "floor",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 16,
        "r": 30,
        "layer": "floor",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 18,
        "r": 30,
        "layer": "floor",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 20,
        "r": 30,
        "layer": "floor",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 22,
        "r": 30,
        "layer": "floor",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 24,
        "r": 30,
        "layer": "floor",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 26,
        "r": 30,
        "layer": "floor",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 28,
        "r": 30,
        "layer": "floor",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 30,
        "r": 30,
        "layer": "floor",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_new_decor_station_timetable_base",
        "c": 8,
        "r": 3,
        "layer": "object"
      },
      {
        "id": "tile_new_decor_station_timetable_base",
        "c": 9,
        "r": 3,
        "layer": "object"
      },
      {
        "id": "tile_new_decor_station_timetable_base",
        "c": 10,
        "r": 3,
        "layer": "object"
      },
      {
        "id": "tile_new_decor_station_timetable_base",
        "c": 11,
        "r": 3,
        "layer": "object"
      },
      {
        "id": "tile_new_decor_station_timetable_base",
        "c": 12,
        "r": 3,
        "layer": "object"
      },
      {
        "id": "tile_new_decor_station_timetable_base",
        "c": 13,
        "r": 3,
        "layer": "object"
      },
      {
        "id": "tile_new_decor_station_timetable_base",
        "c": 14,
        "r": 3,
        "layer": "object"
      },
      {
        "id": "tile_new_decor_station_timetable_base",
        "c": 15,
        "r": 3,
        "layer": "object"
      },
      {
        "id": "tile_new_decor_station_timetable_base",
        "c": 16,
        "r": 3,
        "layer": "object"
      },
      {
        "id": "tile_new_decor_station_timetable_base",
        "c": 20,
        "r": 3,
        "layer": "object"
      },
      {
        "id": "tile_new_decor_station_timetable_base",
        "c": 18,
        "r": 3,
        "layer": "object"
      },
      {
        "id": "tile_new_decor_station_timetable_base",
        "c": 17,
        "r": 3,
        "layer": "object"
      },
      {
        "id": "tile_new_decor_station_timetable_base",
        "c": 19,
        "r": 3,
        "layer": "object"
      },
      {
        "id": "tile_new_decor_station_timetable_base",
        "c": 21,
        "r": 3,
        "layer": "object"
      },
      {
        "id": "tile_new_decor_station_timetable_base",
        "c": 23,
        "r": 3,
        "layer": "object"
      },
      {
        "id": "tile_new_decor_station_timetable_base",
        "c": 28,
        "r": 3,
        "layer": "object"
      },
      {
        "id": "tile_new_decor_station_timetable_base",
        "c": 22,
        "r": 3,
        "layer": "object"
      },
      {
        "id": "tile_new_decor_station_timetable_base",
        "c": 25,
        "r": 3,
        "layer": "object"
      },
      {
        "id": "tile_new_decor_station_timetable_base",
        "c": 26,
        "r": 3,
        "layer": "object"
      },
      {
        "id": "tile_new_decor_station_timetable_base",
        "c": 27,
        "r": 3,
        "layer": "object"
      },
      {
        "id": "tile_new_decor_station_timetable_base",
        "c": 24,
        "r": 3,
        "layer": "object"
      },
      {
        "id": "tile_new_decor_station_timetable_base",
        "c": 29,
        "r": 3,
        "layer": "object"
      },
      {
        "id": "tile_new_decor_station_timetable_base",
        "c": 30,
        "r": 3,
        "layer": "object"
      },
      {
        "id": "tile_new_decor_station_timetable_base",
        "c": 31,
        "r": 3,
        "layer": "overlay"
      },
      {
        "id": "tile_new_decor_station_timetable_board",
        "c": 17,
        "r": 3,
        "layer": "overlay"
      },
      {
        "id": "tile_station_hall_pillar",
        "c": 6,
        "r": 0,
        "layer": "ground"
      },
      {
        "id": "tile_station_hall_counter",
        "c": 8,
        "r": 6,
        "layer": "overlay"
      },
      {
        "id": "tile_station_hall_counter",
        "c": 10,
        "r": 6,
        "layer": "overlay"
      },
      {
        "id": "tile_station_hall_counter",
        "c": 12,
        "r": 6,
        "layer": "overlay"
      },
      {
        "id": "tile_station_hall_counter",
        "c": 14,
        "r": 6,
        "layer": "overlay"
      },
      {
        "id": "tile_station_hall_counter",
        "c": 16,
        "r": 6,
        "layer": "overlay"
      },
      {
        "id": "tile_station_hall_counter",
        "c": 18,
        "r": 6,
        "layer": "overlay"
      },
      {
        "id": "tile_station_hall_counter",
        "c": 20,
        "r": 6,
        "layer": "overlay"
      },
      {
        "id": "tile_station_hall_counter",
        "c": 22,
        "r": 6,
        "layer": "overlay"
      },
      {
        "id": "tile_station_hall_counter",
        "c": 24,
        "r": 6,
        "layer": "overlay"
      },
      {
        "id": "tile_station_hall_counter",
        "c": 26,
        "r": 6,
        "layer": "overlay"
      },
      {
        "id": "tile_station_hall_counter",
        "c": 28,
        "r": 6,
        "layer": "overlay"
      },
      {
        "id": "tile_station_hall_counter",
        "c": 30,
        "r": 6,
        "layer": "overlay"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 6,
        "r": 10,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 8,
        "r": 10,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 10,
        "r": 10,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 12,
        "r": 10,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 12,
        "r": 8,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 14,
        "r": 8,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 16,
        "r": 8,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 18,
        "r": 8,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 20,
        "r": 8,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 24,
        "r": 8,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 22,
        "r": 8,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 26,
        "r": 8,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 28,
        "r": 8,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 30,
        "r": 8,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 32,
        "r": 10,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 32,
        "r": 8,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 30,
        "r": 10,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 32,
        "r": 4,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 32,
        "r": 6,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 14,
        "r": 10,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 16,
        "r": 10,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 18,
        "r": 10,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 20,
        "r": 10,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 22,
        "r": 10,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 24,
        "r": 10,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 26,
        "r": 10,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 9,
        "r": 28,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 11,
        "r": 28,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 13,
        "r": 28,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 15,
        "r": 28,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 17,
        "r": 28,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 19,
        "r": 28,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 21,
        "r": 28,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 23,
        "r": 28,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 25,
        "r": 28,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 27,
        "r": 28,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor",
        "c": 29,
        "r": 28,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor_edge",
        "c": 9,
        "r": 30,
        "layer": "ground",
        "fy": true
      },
      {
        "id": "tile_station_hall_floor_edge",
        "c": 10,
        "r": 30,
        "layer": "ground",
        "fy": true
      },
      {
        "id": "tile_station_hall_floor_edge",
        "c": 11,
        "r": 30,
        "layer": "ground",
        "fy": true
      },
      {
        "id": "tile_station_hall_floor_edge",
        "c": 12,
        "r": 30,
        "layer": "ground",
        "fy": true
      },
      {
        "id": "tile_station_hall_floor_edge",
        "c": 13,
        "r": 30,
        "layer": "ground",
        "fy": true
      },
      {
        "id": "tile_station_hall_floor_edge",
        "c": 14,
        "r": 30,
        "layer": "ground",
        "fy": true
      },
      {
        "id": "tile_station_hall_floor_edge",
        "c": 15,
        "r": 30,
        "layer": "ground",
        "fy": true
      },
      {
        "id": "tile_station_hall_floor_edge",
        "c": 16,
        "r": 30,
        "layer": "ground",
        "fy": true
      },
      {
        "id": "tile_station_hall_floor_edge",
        "c": 17,
        "r": 30,
        "layer": "ground",
        "fy": true
      },
      {
        "id": "tile_station_hall_floor_edge",
        "c": 18,
        "r": 30,
        "layer": "ground",
        "fy": true
      },
      {
        "id": "tile_station_hall_floor_edge",
        "c": 19,
        "r": 30,
        "layer": "ground",
        "fy": true
      },
      {
        "id": "tile_station_hall_floor_edge",
        "c": 20,
        "r": 30,
        "layer": "ground",
        "fy": true
      },
      {
        "id": "tile_station_hall_floor_edge",
        "c": 21,
        "r": 30,
        "layer": "ground",
        "fy": true
      },
      {
        "id": "tile_station_hall_floor_edge",
        "c": 22,
        "r": 30,
        "layer": "ground",
        "fy": true
      },
      {
        "id": "tile_station_hall_floor_edge",
        "c": 23,
        "r": 30,
        "layer": "ground",
        "fy": true
      },
      {
        "id": "tile_station_hall_floor_edge",
        "c": 24,
        "r": 30,
        "layer": "ground",
        "fy": true
      },
      {
        "id": "tile_station_hall_floor_edge",
        "c": 25,
        "r": 30,
        "layer": "ground",
        "fy": true
      },
      {
        "id": "tile_station_hall_floor_edge",
        "c": 26,
        "r": 30,
        "layer": "ground",
        "fy": true
      },
      {
        "id": "tile_station_hall_floor_edge",
        "c": 27,
        "r": 30,
        "layer": "ground",
        "fy": true
      },
      {
        "id": "tile_station_hall_floor_edge",
        "c": 28,
        "r": 30,
        "layer": "ground",
        "fy": true
      },
      {
        "id": "tile_station_hall_floor_edge",
        "c": 29,
        "r": 30,
        "layer": "ground",
        "fy": true
      },
      {
        "id": "tile_station_hall_floor_edge",
        "c": 30,
        "r": 30,
        "layer": "ground",
        "fy": true
      },
      {
        "id": "tile_station_hall_floor02",
        "c": 28,
        "r": 10,
        "layer": "floor"
      },
      {
        "id": "tile_station_hall_floor_corner",
        "c": 8,
        "r": 11,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_station_hall_floor_corner",
        "c": 8,
        "r": 30,
        "layer": "ground",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_station_hall_floor_corner",
        "c": 31,
        "r": 30,
        "layer": "ground",
        "fy": true
      },
      {
        "id": "tile_mu563g4x",
        "c": 31,
        "r": 28,
        "layer": "ground",
        "fy": true
      },
      {
        "id": "tile_mu563g4x",
        "c": 31,
        "r": 29,
        "layer": "ground",
        "fy": true
      },
      {
        "id": "tile_mu563g4x",
        "c": 8,
        "r": 28,
        "layer": "ground",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_mu563g4x",
        "c": 8,
        "r": 29,
        "layer": "ground",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_station_hall_pillar",
        "c": 32,
        "r": 0,
        "layer": "ground"
      },
      {
        "id": "tile_station_hall_pillar",
        "c": 6,
        "r": 1,
        "layer": "ground"
      },
      {
        "id": "tile_station_hall_pillar",
        "c": 32,
        "r": 1,
        "layer": "ground"
      },
      {
        "id": "tile_station_hall_red_line02",
        "c": 10,
        "r": 9,
        "layer": "object"
      },
      {
        "id": "tile_station_hall_red_line02",
        "c": 12,
        "r": 9,
        "layer": "object"
      },
      {
        "id": "tile_station_hall_red_line02",
        "c": 14,
        "r": 9,
        "layer": "object"
      },
      {
        "id": "tile_station_hall_red_line02",
        "c": 16,
        "r": 9,
        "layer": "object"
      },
      {
        "id": "tile_station_hall_red_line02",
        "c": 18,
        "r": 9,
        "layer": "object"
      },
      {
        "id": "tile_station_hall_red_line02",
        "c": 20,
        "r": 9,
        "layer": "object"
      },
      {
        "id": "tile_station_hall_red_line02",
        "c": 22,
        "r": 9,
        "layer": "object"
      },
      {
        "id": "tile_station_hall_red_line02",
        "c": 24,
        "r": 9,
        "layer": "object"
      },
      {
        "id": "tile_station_hall_red_line02",
        "c": 26,
        "r": 9,
        "layer": "object"
      },
      {
        "id": "tile_station_hall_red_line02",
        "c": 28,
        "r": 9,
        "layer": "object"
      },
      {
        "id": "tile_station_hall_red_line02",
        "c": 30,
        "r": 9,
        "layer": "object"
      },
      {
        "id": "tile_station_hall_red_line01",
        "c": 32,
        "r": 9,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_station_hall_red_line01",
        "c": 7,
        "r": 9,
        "layer": "object"
      },
      {
        "id": "tile_station_hall_red_line02",
        "c": 8,
        "r": 9,
        "layer": "object"
      },
      {
        "id": "tile_new_decor_crack02",
        "c": 30,
        "r": 12,
        "layer": "overlay"
      },
      {
        "id": "tile_new_decor_crack02",
        "c": 10,
        "r": 13,
        "layer": "overlay",
        "fx": true
      },
      {
        "id": "tile_new_decor_crack02",
        "c": 5,
        "r": 17,
        "layer": "overlay",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_new_decor_crack02",
        "c": 6,
        "r": 21,
        "layer": "overlay",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_new_decor_crack02",
        "c": 30,
        "r": 20,
        "layer": "overlay",
        "fy": true
      },
      {
        "id": "tile_new_decor_crack02",
        "c": 23,
        "r": 16,
        "layer": "overlay",
        "fy": true
      },
      {
        "id": "tile_new_decor_rock01",
        "c": 34,
        "r": 8,
        "layer": "overlay",
        "fx": true
      },
      {
        "id": "tile_new_decor_rock03",
        "c": 2,
        "r": 7,
        "layer": "overlay"
      },
      {
        "id": "tile_new_decor_rock02",
        "c": 4,
        "r": 9,
        "layer": "object"
      },
      {
        "id": "tile_new_decor_rock02",
        "c": 35,
        "r": 9,
        "layer": "object"
      },
      {
        "id": "tile_new_decor_rock02",
        "c": 32,
        "r": 18,
        "layer": "object"
      },
      {
        "id": "tile_new_decor_rock02",
        "c": 9,
        "r": 12,
        "layer": "object"
      },
      {
        "id": "tile_station_hall_lightbox",
        "c": 6,
        "r": 12,
        "layer": "overlay"
      },
      {
        "id": "tile_station_hall_lightbox",
        "c": 6,
        "r": 21,
        "layer": "overlay"
      },
      {
        "id": "tile_station_hall_lightbox",
        "c": 32,
        "r": 21,
        "layer": "overlay"
      },
      {
        "id": "tile_station_hall_lightbox",
        "c": 32,
        "r": 12,
        "layer": "overlay"
      },
      {
        "id": "tile_station_hall_lightbox",
        "c": 6,
        "r": 30,
        "layer": "overlay"
      },
      {
        "id": "tile_station_hall_lightbox",
        "c": 32,
        "r": 30,
        "layer": "overlay"
      },
      {
        "id": "tile_dmg_crack05",
        "c": 18,
        "r": 28,
        "layer": "ground"
      },
      {
        "id": "tile_dmg_crack05",
        "c": 10,
        "r": 25,
        "layer": "ground"
      },
      {
        "id": "tile_dmg_crack05",
        "c": 25,
        "r": 28,
        "layer": "ground"
      },
      {
        "id": "tile_dmg_crack05",
        "c": 29,
        "r": 25,
        "layer": "ground"
      },
      {
        "id": "tile_dmg_crack05",
        "c": 32,
        "r": 28,
        "layer": "ground"
      },
      {
        "id": "tile_dmg_floor_crater",
        "c": 25,
        "r": 20,
        "layer": "ground2"
      },
      {
        "id": "tile_dmg_floor_crater",
        "c": 9,
        "r": 28,
        "layer": "ground2"
      },
      {
        "id": "tile_dmg_rubble_scatter",
        "c": 27,
        "r": 31,
        "layer": "ground2"
      },
      {
        "id": "tile_dmg_rubble_pile_large",
        "c": 12,
        "r": 12,
        "layer": "ground2"
      },
      {
        "id": "tile_dmg_rubble_pile_large",
        "c": 34,
        "r": 16,
        "layer": "ground2"
      },
      {
        "id": "tile_dmg_broken_wall_right",
        "c": 0,
        "r": 18,
        "layer": "ground2"
      },
      {
        "id": "tile_dmg_broken_wall_right",
        "c": 0,
        "r": 14,
        "layer": "ground2"
      },
      {
        "id": "tile_cvs_sign_home_mart",
        "c": 23,
        "r": 12,
        "layer": "top"
      },
      {
        "id": "tile_cvs_checkout_counter_backroom",
        "c": 22,
        "r": 15,
        "layer": "top",
        "oy": 10,
        "ox": 30,
        "sortDepth": 1.75
      },
      {
        "id": "tile_cvs_back_counter",
        "c": 22,
        "r": 12,
        "layer": "top",
        "ox": 30,
        "oy": 30,
        "sortDepth": 2.5
      },
      {
        "id": "tile_cvs_ibon_kiosk",
        "c": 21,
        "r": 12,
        "layer": "top",
        "oy": 30,
        "ox": 30
      },
      {
        "id": "tile_cvs_ice_cream_freezer",
        "c": 28,
        "r": 13,
        "layer": "top",
        "ox": 14,
        "sortDepth": 2.75
      },
      {
        "id": "tile_cvs_counter_extension",
        "c": 27,
        "r": 16,
        "layer": "ground",
        "ox": 10,
        "oy": 10,
        "sortDepth": 0.75
      },
      {
        "id": "tile_field_base",
        "c": 12,
        "r": 23,
        "layer": "overlay",
        "baseHp": 2000,
        "baseDepth": 4,
        "baseSolid": [
          [
            0,
            1
          ],
          [
            10,
            1
          ],
          [
            10,
            6
          ],
          [
            0,
            6
          ],
          [
            1,
            1
          ],
          [
            2,
            1
          ],
          [
            3,
            1
          ],
          [
            4,
            1
          ],
          [
            5,
            1
          ],
          [
            6,
            1
          ],
          [
            7,
            1
          ],
          [
            8,
            1
          ],
          [
            9,
            1
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
          ],
          [
            4,
            2
          ],
          [
            5,
            2
          ],
          [
            6,
            2
          ],
          [
            7,
            2
          ],
          [
            7,
            3
          ],
          [
            8,
            3
          ],
          [
            9,
            3
          ],
          [
            8,
            2
          ],
          [
            9,
            2
          ],
          [
            6,
            3
          ],
          [
            5,
            3
          ],
          [
            4,
            3
          ],
          [
            3,
            3
          ],
          [
            2,
            3
          ],
          [
            1,
            3
          ],
          [
            9,
            5
          ],
          [
            9,
            4
          ]
        ]
      },
      {
        "id": "tile_field_camp_bed_v",
        "c": 22,
        "r": 25,
        "layer": "top",
        "ox": 10,
        "oy": 6
      },
      {
        "id": "tile_field_camp_bed_v",
        "c": 22,
        "r": 27,
        "layer": "floor",
        "ox": 10
      }
    ],
    "solid": [
      "6,0",
      "6,1",
      "6,2",
      "6,3",
      "6,4",
      "6,5",
      "6,6",
      "6,7",
      "7,8",
      "8,8",
      "9,8",
      "10,8",
      "11,8",
      "6,8",
      "12,8",
      "13,8",
      "14,8",
      "15,8",
      "16,8",
      "17,8",
      "18,8",
      "19,8",
      "20,8",
      "21,8",
      "22,8",
      "23,8",
      "24,8",
      "25,8",
      "26,8",
      "27,8",
      "28,8",
      "29,8",
      "30,8",
      "31,8",
      "32,8",
      "33,7",
      "33,6",
      "33,5",
      "33,4",
      "33,3",
      "33,2",
      "33,1",
      "33,0",
      "33,8",
      "7,10",
      "8,10",
      "9,10",
      "10,10",
      "11,10",
      "12,10",
      "13,10",
      "14,10",
      "15,10",
      "16,10",
      "17,10",
      "18,10",
      "19,10",
      "20,10",
      "21,10",
      "22,10",
      "23,10",
      "24,10",
      "25,10",
      "26,10",
      "27,10",
      "28,10",
      "29,10",
      "30,10",
      "31,10",
      "32,10",
      "23,12",
      "24,12",
      "25,12",
      "26,12",
      "27,12",
      "28,12",
      "30,12",
      "29,12",
      "22,13",
      "23,13",
      "24,13",
      "25,13",
      "26,13",
      "27,13",
      "28,13",
      "29,13",
      "30,13",
      "22,14",
      "23,14",
      "24,14",
      "25,14",
      "26,14",
      "27,14",
      "28,14",
      "29,14",
      "30,14",
      "23,17",
      "24,17",
      "25,17",
      "26,17",
      "27,17",
      "28,17"
    ],
    "breakable": [],
    "camp": [
      "15,34",
      "15,35",
      "16,34",
      "16,35",
      "17,34",
      "17,35",
      "18,34",
      "18,35",
      "19,34",
      "19,35",
      "20,34",
      "20,35",
      "21,34",
      "21,35",
      "22,34",
      "22,35"
    ],
    "rules": {
      "money": 150,
      "guide": 100,
      "guideRegen": 9,
      "speed": 44,
      "reward": 8
    },
    "cols": 40,
    "rows": 36,
    "safe": false,
    "npcs": false,
    "portals": [],
    "solidOffsets": {},
    "coreSpots": [],
    "coreCount": 1,
    "spawnZone": [],
    "hiddenPickups": []
  },
  {
    "id": "map_mv1bzur4",
    "name": "戰鬥-池核",
    "desc": "",
    "layers": {
      "floor": {
        "5,7": "tile_poolcore_floor_blue",
        "6,7": "tile_poolcore_floor_blue",
        "7,7": "tile_poolcore_floor_blue",
        "8,7": "tile_poolcore_floor_blue",
        "9,7": "tile_poolcore_floor_blue",
        "10,7": "tile_poolcore_floor_blue",
        "11,7": "tile_poolcore_floor_blue",
        "12,7": "tile_poolcore_floor_blue",
        "13,7": "tile_poolcore_floor_blue",
        "14,7": "tile_poolcore_floor_blue",
        "14,5": "tile_poolcore_floor_blue",
        "14,6": "tile_poolcore_floor_blue",
        "13,5": "tile_poolcore_floor_blue",
        "13,6": "tile_poolcore_floor_blue",
        "12,5": "tile_poolcore_floor_blue",
        "12,6": "tile_poolcore_floor_blue",
        "11,6": "tile_poolcore_floor_blue",
        "11,5": "tile_poolcore_floor_blue",
        "10,5": "tile_poolcore_floor_blue",
        "10,6": "tile_poolcore_floor_blue",
        "9,6": "tile_poolcore_floor_blue",
        "9,5": "tile_poolcore_floor_blue",
        "8,5": "tile_poolcore_floor_blue",
        "8,6": "tile_poolcore_floor_blue",
        "7,6": "tile_poolcore_floor_blue",
        "7,5": "tile_poolcore_floor_blue",
        "6,5": "tile_poolcore_floor_blue",
        "6,6": "tile_poolcore_floor_blue",
        "5,6": "tile_poolcore_floor_blue",
        "5,5": "tile_poolcore_floor_blue"
      },
      "ground": {
        "26,10": "tile_poolcore_deep_water",
        "27,10": "tile_poolcore_deep_water",
        "28,10": "tile_poolcore_deep_water",
        "29,10": "tile_poolcore_deep_water",
        "30,10": "tile_poolcore_deep_water",
        "31,10": "tile_poolcore_deep_water",
        "32,10": "tile_poolcore_deep_water",
        "33,10": "tile_poolcore_deep_water",
        "34,10": "tile_poolcore_deep_water",
        "26,11": "tile_poolcore_deep_water",
        "27,11": "tile_poolcore_deep_water",
        "28,11": "tile_poolcore_deep_water",
        "29,11": "tile_poolcore_deep_water",
        "30,11": "tile_poolcore_deep_water",
        "31,11": "tile_poolcore_deep_water",
        "32,11": "tile_poolcore_deep_water",
        "33,11": "tile_poolcore_deep_water",
        "34,11": "tile_poolcore_deep_water",
        "26,12": "tile_poolcore_deep_water",
        "27,12": "tile_poolcore_deep_water",
        "28,12": "tile_poolcore_deep_water",
        "29,12": "tile_poolcore_deep_water",
        "30,12": "tile_poolcore_deep_water",
        "31,12": "tile_poolcore_deep_water",
        "32,12": "tile_poolcore_deep_water",
        "33,12": "tile_poolcore_deep_water",
        "34,12": "tile_poolcore_deep_water",
        "35,10": "tile_poolcore_deep_water",
        "35,11": "tile_poolcore_deep_water",
        "35,12": "tile_poolcore_deep_water",
        "14,28": "tile_mv1cfh6l",
        "14,27": "tile_poolcore_floor_pale",
        "14,26": "tile_poolcore_floor_pale",
        "14,25": "tile_poolcore_floor_pale",
        "14,24": "tile_poolcore_floor_pale",
        "14,23": "tile_poolcore_floor_pale",
        "24,4": "tile_poolcore_wall_corner",
        "24,5": "tile_poolcore_floor_pale",
        "24,6": "tile_poolcore_floor_pale",
        "24,7": "tile_poolcore_floor_pale",
        "24,8": "tile_poolcore_floor_pale",
        "24,9": "tile_poolcore_floor_pale",
        "24,10": "tile_poolcore_floor_pale",
        "24,11": "tile_poolcore_floor_pale",
        "24,12": "tile_poolcore_floor_pale",
        "25,12": "tile_poolcore_deep_water",
        "25,11": "tile_poolcore_deep_water",
        "25,10": "tile_poolcore_deep_water",
        "4,9": "tile_poolcore_floor_pale",
        "4,8": "tile_poolcore_floor_pale",
        "4,7": "tile_poolcore_floor_pale",
        "4,6": "tile_poolcore_floor_pale",
        "4,5": "tile_poolcore_floor_pale",
        "4,4": "tile_poolcore_floor_pale",
        "4,3": "tile_poolcore_floor_pale",
        "4,2": "tile_poolcore_floor_pale",
        "4,1": "tile_poolcore_wall_corner",
        "30,14": "tile_poolcore_floor_pale",
        "26,20": "tile_poolcore_floor_pale",
        "26,21": "tile_poolcore_floor_pale"
      },
      "ground2": {},
      "object": {},
      "top": {},
      "ground4": {
        "10,13": "tile_mvpj60hi"
      },
      "object6": {},
      "object7": {},
      "object5": {},
      "object8": {},
      "object9": {}
    },
    "stamps": [
      {
        "id": "tile_poolcore_wall_vertical",
        "c": 9,
        "r": 2,
        "layer": "floor"
      },
      {
        "id": "tile_poolcore_wall_vertical",
        "c": 10,
        "r": 2,
        "layer": "floor"
      },
      {
        "id": "tile_poolcore_wall_vertical",
        "c": 11,
        "r": 2,
        "layer": "floor"
      },
      {
        "id": "tile_poolcore_wall_vertical",
        "c": 12,
        "r": 2,
        "layer": "floor"
      },
      {
        "id": "tile_poolcore_wall_vertical",
        "c": 13,
        "r": 2,
        "layer": "floor"
      },
      {
        "id": "tile_poolcore_wall_vertical",
        "c": 8,
        "r": 2,
        "layer": "floor"
      },
      {
        "id": "tile_poolcore_wall_vertical",
        "c": 7,
        "r": 2,
        "layer": "floor"
      },
      {
        "id": "tile_poolcore_wall_vertical",
        "c": 6,
        "r": 2,
        "layer": "floor"
      },
      {
        "id": "tile_poolcore_wall_vertical",
        "c": 14,
        "r": 2,
        "layer": "floor"
      },
      {
        "id": "tile_poolcore_wall_vertical",
        "c": 15,
        "r": 2,
        "layer": "floor"
      },
      {
        "id": "tile_poolcore_floor_gradient",
        "c": 6,
        "r": 8,
        "layer": "floor"
      },
      {
        "id": "tile_poolcore_floor_gradient",
        "c": 7,
        "r": 8,
        "layer": "floor"
      },
      {
        "id": "tile_poolcore_floor_gradient",
        "c": 8,
        "r": 8,
        "layer": "floor"
      },
      {
        "id": "tile_poolcore_floor_gradient",
        "c": 9,
        "r": 8,
        "layer": "floor"
      },
      {
        "id": "tile_poolcore_floor_gradient",
        "c": 10,
        "r": 8,
        "layer": "floor"
      },
      {
        "id": "tile_poolcore_floor_gradient",
        "c": 12,
        "r": 8,
        "layer": "floor"
      },
      {
        "id": "tile_poolcore_floor_gradient",
        "c": 11,
        "r": 8,
        "layer": "floor"
      },
      {
        "id": "tile_poolcore_floor_gradient",
        "c": 13,
        "r": 8,
        "layer": "floor"
      },
      {
        "id": "tile_poolcore_floor_gradient",
        "c": 14,
        "r": 8,
        "layer": "floor"
      },
      {
        "id": "tile_poolcore_floor_gradient",
        "c": 15,
        "r": 8,
        "layer": "floor"
      },
      {
        "id": "tile_poolcore_floor_pale",
        "c": 16,
        "r": 2,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_poolcore_floor_pale",
        "c": 16,
        "r": 3,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_poolcore_floor_pale",
        "c": 16,
        "r": 4,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_poolcore_floor_pale",
        "c": 16,
        "r": 5,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_poolcore_floor_pale",
        "c": 16,
        "r": 6,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_poolcore_floor_pale",
        "c": 16,
        "r": 7,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_poolcore_floor_pale",
        "c": 16,
        "r": 9,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_poolcore_floor_pale",
        "c": 16,
        "r": 8,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_poolcore_wall_edge_wide",
        "c": 6,
        "r": 1,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_poolcore_wall_edge_wide",
        "c": 8,
        "r": 1,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_poolcore_wall_edge_wide",
        "c": 10,
        "r": 1,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_poolcore_wall_edge_wide",
        "c": 12,
        "r": 1,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_poolcore_wall_edge_wide",
        "c": 14,
        "r": 1,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_poolcore_wall_corner",
        "c": 16,
        "r": 1,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_poolcore_wall_edge_wide",
        "c": 6,
        "r": 9,
        "layer": "ground",
        "oy": 32
      },
      {
        "id": "tile_poolcore_wall_edge_wide",
        "c": 8,
        "r": 9,
        "layer": "ground",
        "oy": 32
      },
      {
        "id": "tile_poolcore_wall_edge_wide",
        "c": 27,
        "r": 13,
        "layer": "ground",
        "oy": 32
      },
      {
        "id": "tile_poolcore_wall_corner",
        "c": 5,
        "r": 9,
        "layer": "ground",
        "oy": 32
      },
      {
        "id": "tile_poolcore_wall_corner",
        "c": 28,
        "r": 14,
        "layer": "ground",
        "oy": 2,
        "fx": true,
        "ox": 20
      },
      {
        "id": "tile_poolcore_deep_water_gradient",
        "c": 25,
        "r": 5,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_deep_water_gradient",
        "c": 26,
        "r": 5,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_deep_water_gradient",
        "c": 26,
        "r": 5,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_deep_water_gradient",
        "c": 27,
        "r": 5,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_deep_water_gradient",
        "c": 28,
        "r": 5,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_deep_water_gradient",
        "c": 29,
        "r": 5,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_deep_water_gradient",
        "c": 30,
        "r": 5,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_deep_water_gradient",
        "c": 31,
        "r": 5,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_deep_water_gradient",
        "c": 32,
        "r": 5,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_deep_water_gradient",
        "c": 33,
        "r": 5,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_deep_water_gradient",
        "c": 34,
        "r": 5,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge_wide",
        "c": 25,
        "r": 4,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge_wide",
        "c": 32,
        "r": 4,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_deep_water_gradient",
        "c": 35,
        "r": 5,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_floor_pale",
        "c": 36,
        "r": 6,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_poolcore_floor_pale",
        "c": 36,
        "r": 7,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_poolcore_floor_pale",
        "c": 36,
        "r": 8,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_poolcore_floor_pale",
        "c": 36,
        "r": 9,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_poolcore_floor_pale",
        "c": 36,
        "r": 10,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_poolcore_floor_pale",
        "c": 36,
        "r": 11,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_poolcore_floor_pale",
        "c": 36,
        "r": 12,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_poolcore_wall_edge_wide",
        "c": 25,
        "r": 12,
        "layer": "ground",
        "oy": 32
      },
      {
        "id": "tile_poolcore_wall_edge_wide",
        "c": 26,
        "r": 13,
        "layer": "ground",
        "ox": 0,
        "oy": -8
      },
      {
        "id": "tile_poolcore_wall_edge_wide",
        "c": 28,
        "r": 13,
        "layer": "ground",
        "ox": 0,
        "oy": -8
      },
      {
        "id": "tile_poolcore_wall_edge_wide",
        "c": 30,
        "r": 13,
        "layer": "ground",
        "ox": 0,
        "oy": -8
      },
      {
        "id": "tile_poolcore_wall_edge_wide",
        "c": 32,
        "r": 13,
        "layer": "ground",
        "ox": 0,
        "oy": -8
      },
      {
        "id": "tile_poolcore_wall_edge_wide",
        "c": 34,
        "r": 13,
        "layer": "ground",
        "ox": 0,
        "oy": -8
      },
      {
        "id": "tile_poolcore_wall_corner",
        "c": 36,
        "r": 13,
        "layer": "ground",
        "fx": true,
        "ox": 0,
        "oy": -8
      },
      {
        "id": "tile_poolcore_wall_corner",
        "c": 24,
        "r": 12,
        "layer": "ground",
        "oy": 32
      },
      {
        "id": "tile_poolcore_wall_wide",
        "c": 15,
        "r": 23,
        "layer": "ground",
        "sortDepth": 0.5,
        "oy": 10
      },
      {
        "id": "tile_poolcore_wall_wide",
        "c": 16,
        "r": 23,
        "layer": "ground",
        "sortDepth": 0.5,
        "oy": 10
      },
      {
        "id": "tile_poolcore_wall_wide",
        "c": 18,
        "r": 23,
        "layer": "ground",
        "sortDepth": 0.5,
        "oy": 10
      },
      {
        "id": "tile_poolcore_wall_wide",
        "c": 20,
        "r": 23,
        "layer": "ground",
        "sortDepth": 0.5,
        "oy": 10
      },
      {
        "id": "tile_poolcore_wall_wide",
        "c": 22,
        "r": 23,
        "layer": "ground",
        "sortDepth": 0.25,
        "oy": 10
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 15,
        "r": 23,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 15,
        "r": 24,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 16,
        "r": 23,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 16,
        "r": 24,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 18,
        "r": 23,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 18,
        "r": 24,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 20,
        "r": 24,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 20,
        "r": 23,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 22,
        "r": 23,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 22,
        "r": 24,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 24,
        "r": 24,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 24,
        "r": 23,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 26,
        "r": 23,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 26,
        "r": 24,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 28,
        "r": 23,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 28,
        "r": 24,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 30,
        "r": 23,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 30,
        "r": 24,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 32,
        "r": 23,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 32,
        "r": 24,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 34,
        "r": 23,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 34,
        "r": 24,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 15,
        "r": 26,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 15,
        "r": 27,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 15,
        "r": 25,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 16,
        "r": 25,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 16,
        "r": 27,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 16,
        "r": 26,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 18,
        "r": 25,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 18,
        "r": 26,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 18,
        "r": 27,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 20,
        "r": 25,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 20,
        "r": 26,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 20,
        "r": 27,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 22,
        "r": 26,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 22,
        "r": 27,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 22,
        "r": 25,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 24,
        "r": 25,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 24,
        "r": 26,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 24,
        "r": 27,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 26,
        "r": 27,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 26,
        "r": 25,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 26,
        "r": 26,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 28,
        "r": 26,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 28,
        "r": 27,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 28,
        "r": 25,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 32,
        "r": 25,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 30,
        "r": 25,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 34,
        "r": 25,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 34,
        "r": 26,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 34,
        "r": 27,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 30,
        "r": 26,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 32,
        "r": 26,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 32,
        "r": 27,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 30,
        "r": 27,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 26,
        "r": 21,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 26,
        "r": 22,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 28,
        "r": 21,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 30,
        "r": 21,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 32,
        "r": 21,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 34,
        "r": 21,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 28,
        "r": 22,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 30,
        "r": 22,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 32,
        "r": 22,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 34,
        "r": 22,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_wide",
        "c": 26,
        "r": 15,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_wide",
        "c": 28,
        "r": 15,
        "layer": "ground",
        "ox": 0,
        "oy": 0,
        "sortDepth": 0.25
      },
      {
        "id": "tile_poolcore_wall_wide",
        "c": 30,
        "r": 15,
        "layer": "ground",
        "sortDepth": 0.5
      },
      {
        "id": "tile_poolcore_wall_wide",
        "c": 32,
        "r": 15,
        "layer": "ground",
        "sortDepth": 0.25
      },
      {
        "id": "tile_poolcore_wall_wide",
        "c": 34,
        "r": 15,
        "layer": "ground",
        "sortDepth": 0.25
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 26,
        "r": 18,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 26,
        "r": 19,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 26,
        "r": 20,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 28,
        "r": 18,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 28,
        "r": 19,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 28,
        "r": 20,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 30,
        "r": 18,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 30,
        "r": 20,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 30,
        "r": 19,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 32,
        "r": 18,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 32,
        "r": 19,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 32,
        "r": 20,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 34,
        "r": 18,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 34,
        "r": 19,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_wall_edge",
        "c": 34,
        "r": 20,
        "layer": "ground"
      },
      {
        "id": "tile_poolcore_floor_pale",
        "c": 36,
        "r": 16,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_poolcore_floor_pale",
        "c": 36,
        "r": 17,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_poolcore_floor_pale",
        "c": 36,
        "r": 18,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_poolcore_floor_pale",
        "c": 36,
        "r": 19,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_poolcore_floor_pale",
        "c": 36,
        "r": 20,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_poolcore_floor_pale",
        "c": 36,
        "r": 21,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_poolcore_floor_pale",
        "c": 36,
        "r": 22,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_poolcore_floor_pale",
        "c": 36,
        "r": 23,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_poolcore_floor_pale",
        "c": 36,
        "r": 24,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_poolcore_floor_pale",
        "c": 36,
        "r": 25,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_poolcore_floor_pale",
        "c": 36,
        "r": 26,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_poolcore_floor_pale",
        "c": 36,
        "r": 27,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_mv1cftaj",
        "c": 15,
        "r": 28,
        "layer": "ground"
      },
      {
        "id": "tile_mv1cftaj",
        "c": 16,
        "r": 28,
        "layer": "ground"
      },
      {
        "id": "tile_mv1cftaj",
        "c": 18,
        "r": 28,
        "layer": "ground"
      },
      {
        "id": "tile_mv1cftaj",
        "c": 20,
        "r": 28,
        "layer": "ground"
      },
      {
        "id": "tile_mv1cftaj",
        "c": 22,
        "r": 28,
        "layer": "ground"
      },
      {
        "id": "tile_mv1cftaj",
        "c": 24,
        "r": 28,
        "layer": "ground"
      },
      {
        "id": "tile_mv1cftaj",
        "c": 26,
        "r": 28,
        "layer": "ground"
      },
      {
        "id": "tile_mv1cftaj",
        "c": 28,
        "r": 28,
        "layer": "ground"
      },
      {
        "id": "tile_mv1cftaj",
        "c": 30,
        "r": 28,
        "layer": "ground"
      },
      {
        "id": "tile_mv1cftaj",
        "c": 32,
        "r": 28,
        "layer": "ground"
      },
      {
        "id": "tile_mv1cftaj",
        "c": 34,
        "r": 28,
        "layer": "ground"
      },
      {
        "id": "tile_mv1cfh6l",
        "c": 36,
        "r": 28,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_poolcore_wall_corner",
        "c": 36,
        "r": 15,
        "layer": "ground",
        "fx": true,
        "ox": 0,
        "oy": 6
      },
      {
        "id": "tile_poolcore_wall_corner",
        "c": 14,
        "r": 23,
        "layer": "ground",
        "oy": 22
      },
      {
        "id": "tile_poolcore_floor_pale",
        "c": 14,
        "r": 24,
        "layer": "ground",
        "oy": 10
      },
      {
        "id": "tile_cvs_sign_twelve",
        "c": 45,
        "r": 19,
        "layer": "object5",
        "ox": 4
      },
      {
        "id": "tile_cvs_back_counter",
        "c": 47,
        "r": 19,
        "layer": "object5",
        "fx": true,
        "sortDepth": 2.5,
        "ox": 10,
        "oy": 30
      },
      {
        "id": "tile_cvs_drink_cooler",
        "c": 45,
        "r": 19,
        "layer": "object5",
        "sortDepth": 2.5,
        "oy": 30
      },
      {
        "id": "tile_cvs_checkout_counter_backroom",
        "c": 48,
        "r": 21,
        "layer": "object5",
        "ox": 30,
        "oy": 20,
        "sortDepth": 1.75
      },
      {
        "id": "tile_cvs_counter_extension",
        "c": 46,
        "r": 22,
        "layer": "object5",
        "ox": 30,
        "oy": 20,
        "sortDepth": 0.75
      },
      {
        "id": "tile_mvofs5nu",
        "c": 1,
        "r": 24,
        "layer": "object6",
        "ox": 20,
        "oy": 10
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 0,
        "r": 0,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 3,
        "r": 0,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 6,
        "r": 0,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 9,
        "r": 0,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 12,
        "r": 0,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 15,
        "r": 0,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 18,
        "r": 0,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 21,
        "r": 0,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 24,
        "r": 0,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 27,
        "r": 0,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 30,
        "r": 0,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 33,
        "r": 0,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 36,
        "r": 0,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 0,
        "r": 3,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 3,
        "r": 3,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 6,
        "r": 3,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 9,
        "r": 3,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 12,
        "r": 3,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 15,
        "r": 3,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 18,
        "r": 3,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 21,
        "r": 3,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 24,
        "r": 3,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 27,
        "r": 3,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 30,
        "r": 3,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 33,
        "r": 3,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 36,
        "r": 3,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 39,
        "r": 0,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 39,
        "r": 3,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 0,
        "r": 6,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 0,
        "r": 9,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 39,
        "r": 6,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 39,
        "r": 9,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 39,
        "r": 12,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 39,
        "r": 15,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 39,
        "r": 18,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 39,
        "r": 21,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 39,
        "r": 24,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 39,
        "r": 27,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 39,
        "r": 30,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 36,
        "r": 30,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 0,
        "r": 12,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 0,
        "r": 15,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 0,
        "r": 18,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 3,
        "r": 6,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 6,
        "r": 6,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 9,
        "r": 6,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 12,
        "r": 6,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 15,
        "r": 6,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 18,
        "r": 6,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 21,
        "r": 6,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 0,
        "r": 6,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 0,
        "r": 9,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 18,
        "r": 3,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 21,
        "r": 3,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 24,
        "r": 3,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 27,
        "r": 3,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 30,
        "r": 3,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 33,
        "r": 3,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 36,
        "r": 3,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 39,
        "r": 0,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 39,
        "r": 3,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 24,
        "r": 6,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 27,
        "r": 6,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 30,
        "r": 6,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 33,
        "r": 6,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 36,
        "r": 6,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 3,
        "r": 9,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 3,
        "r": 12,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 3,
        "r": 15,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 6,
        "r": 9,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 9,
        "r": 9,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 12,
        "r": 9,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 15,
        "r": 9,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 18,
        "r": 9,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 21,
        "r": 9,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 24,
        "r": 9,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 27,
        "r": 9,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 30,
        "r": 9,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 33,
        "r": 9,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 36,
        "r": 9,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 6,
        "r": 12,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 9,
        "r": 12,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 12,
        "r": 12,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 15,
        "r": 12,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 18,
        "r": 12,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 21,
        "r": 12,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 24,
        "r": 12,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 27,
        "r": 12,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 30,
        "r": 12,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 33,
        "r": 12,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 36,
        "r": 12,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 6,
        "r": 15,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 9,
        "r": 15,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 12,
        "r": 15,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 15,
        "r": 15,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 18,
        "r": 15,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 21,
        "r": 15,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 24,
        "r": 15,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 27,
        "r": 15,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 30,
        "r": 15,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 33,
        "r": 15,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 36,
        "r": 15,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 3,
        "r": 18,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 6,
        "r": 18,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 9,
        "r": 18,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 12,
        "r": 18,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 15,
        "r": 18,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 18,
        "r": 18,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 21,
        "r": 18,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 24,
        "r": 18,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 27,
        "r": 18,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 30,
        "r": 18,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 33,
        "r": 18,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 36,
        "r": 18,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 0,
        "r": 21,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 0,
        "r": 24,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 0,
        "r": 27,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 0,
        "r": 30,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 3,
        "r": 21,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 3,
        "r": 24,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 3,
        "r": 27,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 3,
        "r": 30,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 6,
        "r": 21,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 9,
        "r": 21,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 6,
        "r": 24,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 9,
        "r": 24,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 6,
        "r": 27,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 9,
        "r": 27,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 6,
        "r": 30,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 9,
        "r": 30,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 12,
        "r": 21,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 12,
        "r": 24,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 12,
        "r": 27,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 12,
        "r": 30,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 15,
        "r": 21,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 15,
        "r": 24,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 18,
        "r": 21,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 18,
        "r": 24,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 21,
        "r": 21,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 21,
        "r": 24,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 24,
        "r": 21,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 27,
        "r": 21,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 24,
        "r": 24,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 27,
        "r": 24,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 30,
        "r": 21,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 33,
        "r": 21,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 36,
        "r": 21,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 30,
        "r": 24,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 33,
        "r": 24,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 36,
        "r": 24,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 36,
        "r": 27,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 15,
        "r": 27,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 18,
        "r": 27,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 21,
        "r": 27,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 24,
        "r": 27,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 27,
        "r": 27,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 30,
        "r": 27,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 33,
        "r": 27,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 33,
        "r": 30,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 30,
        "r": 30,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 27,
        "r": 30,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 24,
        "r": 30,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 21,
        "r": 30,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 18,
        "r": 30,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 15,
        "r": 30,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 42,
        "r": 0,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 42,
        "r": 3,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 42,
        "r": 6,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 45,
        "r": 0,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 45,
        "r": 3,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 45,
        "r": 6,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 42,
        "r": 9,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 45,
        "r": 9,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 42,
        "r": 12,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 45,
        "r": 12,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 42,
        "r": 15,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 45,
        "r": 15,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 42,
        "r": 18,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 45,
        "r": 18,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 42,
        "r": 21,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 45,
        "r": 21,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 42,
        "r": 24,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 45,
        "r": 24,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 54,
        "r": 0,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 51,
        "r": 0,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 48,
        "r": 0,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 57,
        "r": 0,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 54,
        "r": 3,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 51,
        "r": 3,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 48,
        "r": 3,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 54,
        "r": 6,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 51,
        "r": 6,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 48,
        "r": 6,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 48,
        "r": 9,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 51,
        "r": 9,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 54,
        "r": 9,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 48,
        "r": 12,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 54,
        "r": 12,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 51,
        "r": 12,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 51,
        "r": 15,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 54,
        "r": 15,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 48,
        "r": 15,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 48,
        "r": 18,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 51,
        "r": 18,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 54,
        "r": 18,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 57,
        "r": 3,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 57,
        "r": 6,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 57,
        "r": 9,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 57,
        "r": 12,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 57,
        "r": 15,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 57,
        "r": 18,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 51,
        "r": 21,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 48,
        "r": 21,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 48,
        "r": 24,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 51,
        "r": 24,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 57,
        "r": 21,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 54,
        "r": 21,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 54,
        "r": 24,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 57,
        "r": 24,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 42,
        "r": 27,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 45,
        "r": 27,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 48,
        "r": 27,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 51,
        "r": 27,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 54,
        "r": 27,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 57,
        "r": 27,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 42,
        "r": 30,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 45,
        "r": 30,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 48,
        "r": 30,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 51,
        "r": 30,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 54,
        "r": 30,
        "layer": "ground4"
      },
      {
        "id": "tile_poolcore_floor_l",
        "c": 57,
        "r": 30,
        "layer": "ground4"
      },
      {
        "id": "tile_mvocpp0c",
        "c": 3,
        "r": 18,
        "layer": "object7",
        "oy": 10
      },
      {
        "id": "tile_mvocpp0c",
        "c": 5,
        "r": 18,
        "layer": "object7",
        "oy": 10
      },
      {
        "id": "tile_mvoddiqi",
        "c": 7,
        "r": 18,
        "layer": "object7",
        "oy": 10
      },
      {
        "id": "tile_mvoddiqi",
        "c": 0,
        "r": 18,
        "layer": "object7",
        "oy": 10
      },
      {
        "id": "tile_mvodgug9",
        "c": 11,
        "r": 18,
        "layer": "object7",
        "oy": 10
      },
      {
        "id": "tile_mvodgug9",
        "c": 9,
        "r": 18,
        "layer": "object7",
        "oy": 10
      },
      {
        "id": "tile_mvoe808h",
        "c": 1,
        "r": 22,
        "layer": "object6",
        "oy": 10,
        "baseSolid": [
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
            4,
            2
          ],
          [
            5,
            2
          ],
          [
            6,
            2
          ],
          [
            7,
            2
          ],
          [
            8,
            2
          ],
          [
            9,
            2
          ],
          [
            10,
            2
          ],
          [
            1,
            3
          ],
          [
            1,
            4
          ],
          [
            1,
            5
          ],
          [
            1,
            6
          ],
          [
            10,
            3
          ],
          [
            10,
            4
          ],
          [
            10,
            5
          ],
          [
            10,
            6
          ],
          [
            1,
            7
          ],
          [
            10,
            7
          ]
        ]
      },
      {
        "id": "tile_poolcore_camp_bed",
        "c": 8,
        "r": 27,
        "layer": "object6",
        "oy": 20,
        "ox": 20
      },
      {
        "id": "tile_poolcore_camp_bed",
        "c": 6,
        "r": 27,
        "layer": "object6",
        "oy": 20,
        "ox": 20
      },
      {
        "id": "tile_mvot2yuu",
        "c": 6,
        "r": 25,
        "layer": "object6"
      },
      {
        "id": "tile_mvotgy7w",
        "c": 7,
        "r": 25,
        "layer": "object6",
        "ox": 10
      },
      {
        "id": "tile_mvotwe6t",
        "c": 8,
        "r": 25,
        "layer": "object6",
        "ox": 32,
        "oy": 0
      },
      {
        "id": "tile_mvocpp0c",
        "c": 22,
        "r": 18,
        "layer": "object7",
        "oy": 10
      },
      {
        "id": "tile_mvocpp0c",
        "c": 16,
        "r": 18,
        "layer": "object7",
        "oy": 10
      },
      {
        "id": "tile_mvoddiqi",
        "c": 18,
        "r": 18,
        "layer": "object7",
        "oy": 10
      },
      {
        "id": "tile_mvodgug9",
        "c": 20,
        "r": 18,
        "layer": "object7",
        "oy": 10
      },
      {
        "id": "tile_mvodgug9",
        "c": 14,
        "r": 18,
        "layer": "object7",
        "oy": 10
      },
      {
        "id": "tile_mvobex5o",
        "c": 17,
        "r": 20,
        "layer": "object7",
        "sortDepth": 1.5
      },
      {
        "id": "tile_poolcore_pillar",
        "c": 12,
        "r": 17,
        "layer": "object7",
        "ox": 20,
        "oy": 20
      },
      {
        "id": "tile_poolcore_pillar",
        "c": 1,
        "r": 17,
        "layer": "object7",
        "ox": 20,
        "oy": 20
      },
      {
        "id": "tile_mvocpp0c",
        "c": 15,
        "r": 10,
        "layer": "object",
        "oy": 20
      },
      {
        "id": "tile_mvoddiqi",
        "c": 17,
        "r": 10,
        "layer": "object",
        "oy": 20
      },
      {
        "id": "tile_mvodgug9",
        "c": 21,
        "r": 10,
        "layer": "object",
        "oy": 20
      },
      {
        "id": "tile_mvocpp0c",
        "c": 19,
        "r": 10,
        "layer": "object",
        "oy": 20
      },
      {
        "id": "tile_poolcore_pillar",
        "c": 13,
        "r": 9,
        "layer": "object",
        "ox": 30,
        "oy": 30
      },
      {
        "id": "tile_poolcore_pillar",
        "c": 22,
        "r": 9,
        "layer": "object",
        "ox": 10,
        "oy": 30
      },
      {
        "id": "tile_mvoa0cqd",
        "c": 14,
        "r": 17,
        "layer": "object",
        "ox": 10,
        "oy": 30
      },
      {
        "id": "tile_mvoa0cqd",
        "c": 14,
        "r": 16,
        "layer": "object",
        "ox": 10,
        "oy": 30
      },
      {
        "id": "tile_mvoa0cqd",
        "c": 14,
        "r": 15,
        "layer": "object",
        "ox": 10,
        "oy": 30
      },
      {
        "id": "tile_mvoa0cqd",
        "c": 14,
        "r": 14,
        "layer": "object",
        "ox": 10,
        "oy": 30
      },
      {
        "id": "tile_mvoa0cqd",
        "c": 14,
        "r": 13,
        "layer": "object",
        "ox": 10,
        "oy": 30
      },
      {
        "id": "tile_mvoa0cqd",
        "c": 14,
        "r": 12,
        "layer": "object",
        "ox": 10,
        "oy": 30
      },
      {
        "id": "tile_mvoa0cqd",
        "c": 14,
        "r": 11,
        "layer": "object",
        "ox": 10,
        "oy": 30
      },
      {
        "id": "tile_mvoa0cqd",
        "c": 22,
        "r": 17,
        "layer": "object",
        "ox": 30,
        "oy": 30
      },
      {
        "id": "tile_mvoa0cqd",
        "c": 22,
        "r": 16,
        "layer": "object",
        "ox": 30,
        "oy": 30
      },
      {
        "id": "tile_mvoa0cqd",
        "c": 22,
        "r": 15,
        "layer": "object",
        "ox": 30,
        "oy": 30
      },
      {
        "id": "tile_mvoa0cqd",
        "c": 22,
        "r": 14,
        "layer": "object",
        "ox": 30,
        "oy": 30
      },
      {
        "id": "tile_mvoa0cqd",
        "c": 22,
        "r": 13,
        "layer": "object",
        "ox": 30,
        "oy": 30
      },
      {
        "id": "tile_mvoa0cqd",
        "c": 22,
        "r": 12,
        "layer": "object",
        "ox": 30,
        "oy": 30
      },
      {
        "id": "tile_mvoa0cqd",
        "c": 22,
        "r": 11,
        "layer": "object",
        "ox": 30,
        "oy": 30
      },
      {
        "id": "tile_mvp8n5zs",
        "c": 9,
        "r": 19,
        "layer": "top",
        "oy": 20,
        "ox": 10
      },
      {
        "id": "tile_mvobex5o",
        "c": 21,
        "r": 12,
        "layer": "object",
        "ox": 10,
        "oy": 10,
        "sortDepth": 1.5
      },
      {
        "id": "tile_mvph1jix",
        "c": 3,
        "r": 12,
        "layer": "object8",
        "ox": 10
      },
      {
        "id": "tile_mvph1tds",
        "c": 7,
        "r": 12,
        "layer": "object8",
        "ox": 2,
        "oy": 0
      },
      {
        "id": "tile_mvph1odn",
        "c": 5,
        "r": 12,
        "layer": "object8",
        "ox": 10
      },
      {
        "id": "tile_mvph143o",
        "c": 3,
        "r": 14,
        "layer": "object8",
        "ox": 10
      },
      {
        "id": "tile_mvph19b4",
        "c": 5,
        "r": 14,
        "layer": "object8",
        "ox": 10
      },
      {
        "id": "tile_mvph1e62",
        "c": 7,
        "r": 14,
        "layer": "object8",
        "ox": 2,
        "oy": 0
      },
      {
        "id": "tile_mvpj1fdy",
        "c": 3,
        "r": 12,
        "layer": "object8",
        "ox": 10
      },
      {
        "id": "tile_mvpj53ld",
        "c": 5,
        "r": 12,
        "layer": "object8",
        "ox": 10,
        "oy": 10
      },
      {
        "id": "tile_mvpj60hi",
        "c": 6,
        "r": 12,
        "layer": "object8",
        "ox": 10
      },
      {
        "id": "tile_poolcore_life_ring_blue",
        "c": 6,
        "r": 13,
        "layer": "object8",
        "ox": 30
      },
      {
        "id": "tile_poolcore_life_ring_red",
        "c": 7,
        "r": 12,
        "layer": "object8",
        "ox": 30,
        "oy": 20
      },
      {
        "id": "tile_mvquvyy8",
        "c": 3,
        "r": 12,
        "layer": "object8",
        "ox": 10,
        "oy": 30
      },
      {
        "id": "tile_mvqv5agz",
        "c": 4,
        "r": 13,
        "layer": "object8",
        "ox": 20,
        "oy": 10
      },
      {
        "id": "tile_mvqyrysf",
        "c": 5,
        "r": 13,
        "layer": "object8",
        "ox": 20,
        "oy": 30
      },
      {
        "id": "tile_mvr11rba",
        "c": 9,
        "r": 12,
        "layer": "floor",
        "ox": 10
      },
      {
        "id": "tile_mvr11zmd",
        "c": 11,
        "r": 12,
        "layer": "floor"
      },
      {
        "id": "tile_mvr32pqo",
        "c": 17,
        "r": 14,
        "layer": "object8",
        "oy": 10,
        "ox": 30
      },
      {
        "id": "tile_mvr32pqo",
        "c": 18,
        "r": 14,
        "layer": "object8",
        "oy": 10,
        "ox": 6
      },
      {
        "id": "tile_mvr40sp8",
        "c": 15,
        "r": 15,
        "layer": "object8",
        "ox": 6,
        "oy": 0
      },
      {
        "id": "tile_mvr40sp8",
        "c": 19,
        "r": 15,
        "layer": "object8",
        "ox": 36,
        "oy": 6
      },
      {
        "id": "tile_mvr32pqo",
        "c": 15,
        "r": 14,
        "layer": "object8",
        "oy": 10,
        "ox": 30
      },
      {
        "id": "tile_mvr32pqo",
        "c": 18,
        "r": 16,
        "layer": "object8",
        "oy": 30,
        "ox": 20
      },
      {
        "id": "tile_mvr2fi62",
        "c": 20,
        "r": 14,
        "layer": "object8",
        "oy": 10,
        "ox": 0
      },
      {
        "id": "tile_mvr32pqo",
        "c": 15,
        "r": 16,
        "layer": "object8",
        "oy": 30,
        "ox": 30
      },
      {
        "id": "tile_mvr2fi62",
        "c": 15,
        "r": 16,
        "layer": "object8",
        "ox": 10,
        "oy": 30
      },
      {
        "id": "tile_mvr32pqo",
        "c": 17,
        "r": 16,
        "layer": "object8",
        "oy": 30,
        "ox": 30
      },
      {
        "id": "tile_mvr3kqob",
        "c": 16,
        "r": 13,
        "layer": "object8",
        "ox": 20,
        "oy": 10
      },
      {
        "id": "tile_mvr2fi62",
        "c": 20,
        "r": 16,
        "layer": "object8",
        "oy": 30
      },
      {
        "id": "tile_mvr2fi62",
        "c": 15,
        "r": 14,
        "layer": "object8",
        "ox": 10,
        "oy": 10
      },
      {
        "id": "tile_poolcore_life_ring_blue",
        "c": 19,
        "r": 12,
        "layer": "object8",
        "ox": 30,
        "oy": 30
      },
      {
        "id": "tile_poolcore_life_ring_red",
        "c": 18,
        "r": 12,
        "layer": "object8",
        "ox": 20
      },
      {
        "id": "tile_mvph1jix",
        "c": 20,
        "r": 25,
        "layer": "ground2",
        "oy": 30,
        "ox": 6
      },
      {
        "id": "tile_mvph1tds",
        "c": 22,
        "r": 25,
        "layer": "ground2",
        "oy": 30,
        "ox": 6
      },
      {
        "id": "tile_mvph143o",
        "c": 20,
        "r": 27,
        "layer": "ground2",
        "oy": 30,
        "ox": 6
      },
      {
        "id": "tile_mvph1e62",
        "c": 22,
        "r": 27,
        "layer": "ground2",
        "oy": 30,
        "ox": 6
      },
      {
        "id": "tile_mvr3la0q",
        "c": 13,
        "r": 27,
        "layer": "ground2",
        "oy": 30,
        "rot": 0,
        "ox": 30
      },
      {
        "id": "tile_poolcore_pillar",
        "c": 23,
        "r": 17,
        "layer": "object7",
        "ox": 20,
        "oy": 30
      },
      {
        "id": "tile_mvoa0cqd",
        "c": 24,
        "r": 19,
        "layer": "object7",
        "oy": 30
      },
      {
        "id": "tile_mvoa0cqd",
        "c": 24,
        "r": 20,
        "layer": "object7",
        "oy": 30
      },
      {
        "id": "tile_mvoa0cqd",
        "c": 24,
        "r": 22,
        "layer": "object7",
        "oy": 30
      },
      {
        "id": "tile_mvoa0cqd",
        "c": 24,
        "r": 21,
        "layer": "object7",
        "oy": 30
      },
      {
        "id": "tile_mvoa0cqd",
        "c": 24,
        "r": 24,
        "layer": "object7",
        "oy": 30
      },
      {
        "id": "tile_mvoa0cqd",
        "c": 24,
        "r": 23,
        "layer": "object7",
        "oy": 30
      },
      {
        "id": "tile_mvoa0cqd",
        "c": 24,
        "r": 25,
        "layer": "object7",
        "oy": 30
      },
      {
        "id": "tile_mvoa0cqd",
        "c": 24,
        "r": 26,
        "layer": "object7",
        "oy": 30
      },
      {
        "id": "tile_mvoa0cqd",
        "c": 24,
        "r": 28,
        "layer": "object7",
        "oy": 30
      },
      {
        "id": "tile_mvoa0cqd",
        "c": 24,
        "r": 27,
        "layer": "object7",
        "oy": 30
      },
      {
        "id": "tile_mvr40sp8",
        "c": 35,
        "r": 27,
        "layer": "object7",
        "ox": 8,
        "oy": 16
      },
      {
        "id": "tile_mvocpp0c",
        "c": 27,
        "r": 27,
        "layer": "object7"
      },
      {
        "id": "tile_mvodgug9",
        "c": 25,
        "r": 27,
        "layer": "object7"
      },
      {
        "id": "tile_poolcore_pillar",
        "c": 23,
        "r": 26,
        "layer": "object7",
        "ox": 20,
        "oy": 20
      },
      {
        "id": "tile_mvr3kqob",
        "c": 20,
        "r": 28,
        "layer": "ground2",
        "ox": 20,
        "oy": 10
      },
      {
        "id": "tile_mvocpp0c",
        "c": 39,
        "r": 26,
        "layer": "object7",
        "oy": 10
      },
      {
        "id": "tile_poolcore_pillar",
        "c": 30,
        "r": 20,
        "layer": "object7",
        "ox": 20,
        "oy": 20
      },
      {
        "id": "tile_mvoddiqi",
        "c": 41,
        "r": 26,
        "layer": "object7",
        "oy": 10
      },
      {
        "id": "tile_mvocpp0c",
        "c": 37,
        "r": 26,
        "layer": "object7",
        "oy": 10
      },
      {
        "id": "tile_mvoa0cqd",
        "c": 31,
        "r": 26,
        "layer": "object7",
        "oy": 20
      },
      {
        "id": "tile_mvoa0cqd",
        "c": 31,
        "r": 25,
        "layer": "object7",
        "oy": 20
      },
      {
        "id": "tile_mvoa0cqd",
        "c": 31,
        "r": 24,
        "layer": "object7",
        "oy": 20
      },
      {
        "id": "tile_mvoa0cqd",
        "c": 31,
        "r": 23,
        "layer": "object7",
        "oy": 20
      },
      {
        "id": "tile_mvoa0cqd",
        "c": 31,
        "r": 22,
        "layer": "object7",
        "oy": 20
      },
      {
        "id": "tile_mvr2fi62",
        "c": 35,
        "r": 26,
        "layer": "object7",
        "oy": 20,
        "ox": 12
      },
      {
        "id": "tile_mvoddiqi",
        "c": 29,
        "r": 27,
        "layer": "object7"
      },
      {
        "id": "tile_mvobzfro",
        "c": 29,
        "r": 28,
        "layer": "object7",
        "ox": 10,
        "oy": 30
      },
      {
        "id": "tile_poolcore_pillar",
        "c": 30,
        "r": 26,
        "layer": "object7",
        "ox": 20,
        "oy": 20
      },
      {
        "id": "tile_mvquvyy8",
        "c": 11,
        "r": 19,
        "layer": "object9",
        "oy": 20
      },
      {
        "id": "tile_mvp8n5zs",
        "c": 0,
        "r": 19,
        "layer": "top",
        "oy": 20
      },
      {
        "id": "tile_mvp8nxz4",
        "c": 9,
        "r": 19,
        "layer": "top",
        "oy": 20,
        "blend": "hard-light",
        "ox": 10
      },
      {
        "id": "tile_mvp8nxz4",
        "c": 0,
        "r": 19,
        "layer": "top",
        "oy": 20,
        "blend": "hard-light"
      },
      {
        "id": "tile_poolcore_pillar",
        "c": 35,
        "r": 25,
        "layer": "object7",
        "ox": 20,
        "oy": 30
      },
      {
        "id": "tile_mvr3nuyx",
        "c": 32,
        "r": 29,
        "layer": "object7",
        "oy": 10
      }
    ],
    "solid": [],
    "breakable": [],
    "coreSpots": [],
    "coreCount": 1,
    "monsterMix": [
      {
        "id": "slime",
        "weight": 100
      }
    ],
    "camp": [],
    "rules": {
      "money": 150,
      "guide": 100,
      "guideRegen": 9,
      "speed": 44,
      "reward": 8
    },
    "solidOffsets": {},
    "safe": false,
    "npcs": false,
    "portals": [],
    "cols": 60,
    "rows": 33,
    "spawnZone": [],
    "layerOrder": [
      {
        "id": "ground4",
        "name": "池核地板"
      },
      {
        "id": "object6",
        "name": "基地"
      },
      {
        "id": "object5",
        "name": "商店"
      },
      {
        "id": "ground2",
        "name": "一塊一塊"
      },
      {
        "id": "object",
        "name": "柱子、牆壁2"
      },
      {
        "id": "object7",
        "name": "柱子、牆壁"
      },
      {
        "id": "floor",
        "name": "🟫 地板"
      },
      {
        "id": "ground",
        "name": "🌿 地面裝飾"
      },
      {
        "id": "object8",
        "name": "測試小塊"
      },
      {
        "id": "top",
        "name": "燈光"
      },
      {
        "id": "object9",
        "name": "牆上裝飾"
      }
    ],
    "hiddenPickups": []
  },
  {
    "id": "map_mvnjr2ze",
    "name": "時間混亂的房間",
    "desc": "",
    "layers": {
      "floor": {
        "21,22": "tile_bg_extra_floor02_extra",
        "21,23": "floor",
        "12,28": "floor",
        "13,28": "floor",
        "14,28": "floor",
        "15,28": "floor",
        "16,28": "floor",
        "16,29": "floor",
        "15,29": "floor",
        "14,29": "floor",
        "13,29": "floor",
        "12,29": "floor",
        "13,21": "tile_bg_extra_floor02_extra",
        "13,22": "tile_bg_extra_floor02_extra",
        "13,24": "tile_bg_extra_floor02_extra",
        "12,24": "tile_bg_extra_floor02_extra",
        "12,25": "tile_bg_extra_floor02_extra",
        "12,26": "tile_bg_extra_floor02_extra",
        "12,27": "tile_bg_extra_floor02_extra",
        "13,27": "tile_bg_extra_floor02_extra",
        "14,27": "tile_bg_extra_floor02_extra",
        "15,26": "tile_bg_extra_floor02_extra",
        "14,25": "tile_bg_extra_floor02_extra",
        "14,24": "tile_bg_extra_floor02_extra",
        "14,22": "tile_bg_extra_floor02_extra",
        "14,21": "tile_bg_extra_floor02_extra",
        "12,21": "tile_bg_extra_floor02_extra",
        "12,22": "tile_bg_extra_floor02_extra",
        "12,23": "tile_bg_extra_floor02_extra",
        "13,26": "tile_bg_extra_floor02_extra",
        "14,26": "tile_bg_extra_floor02_extra",
        "13,25": "tile_bg_extra_floor02_extra",
        "15,23": "tile_bg_extra_floor02_extra",
        "15,22": "tile_bg_extra_floor02_extra",
        "16,22": "tile_bg_extra_floor02_extra",
        "16,21": "tile_bg_extra_floor02_extra",
        "16,24": "tile_bg_extra_floor02_extra",
        "16,25": "tile_bg_extra_floor02_extra",
        "16,26": "tile_bg_extra_floor02_extra",
        "16,27": "tile_bg_extra_floor02_extra",
        "15,25": "tile_bg_extra_floor02_extra",
        "15,24": "tile_bg_extra_floor02_extra",
        "15,21": "tile_bg_extra_floor02_extra",
        "7,16": "tile_bg_extra_floor02_extra",
        "8,16": "tile_bg_extra_floor02_extra",
        "9,16": "tile_bg_extra_floor02_extra",
        "10,16": "tile_bg_extra_floor02_extra",
        "11,16": "tile_bg_extra_floor02_extra",
        "12,16": "tile_bg_extra_floor02_extra",
        "13,16": "tile_bg_extra_floor02_extra",
        "14,16": "tile_bg_extra_floor02_extra",
        "15,16": "tile_bg_extra_floor02_extra",
        "16,16": "tile_bg_extra_floor02_extra",
        "17,16": "tile_bg_extra_floor02_extra",
        "18,16": "tile_bg_extra_floor02_extra",
        "19,16": "tile_bg_extra_floor02_extra",
        "20,16": "tile_bg_extra_floor02_extra",
        "21,16": "tile_bg_extra_floor02_extra",
        "21,17": "tile_bg_extra_floor02_extra",
        "21,20": "tile_bg_extra_floor02_extra",
        "21,21": "tile_bg_extra_floor02_extra",
        "20,22": "tile_bg_extra_floor02_extra",
        "19,22": "tile_bg_extra_floor02_extra",
        "18,22": "tile_bg_extra_floor02_extra",
        "11,22": "tile_bg_extra_floor02_extra",
        "10,22": "tile_bg_extra_floor02_extra",
        "9,22": "tile_bg_extra_floor02_extra",
        "8,22": "tile_bg_extra_floor02_extra",
        "7,22": "tile_bg_extra_floor02_extra",
        "7,21": "tile_bg_extra_floor02_extra",
        "7,20": "tile_bg_extra_floor02_extra",
        "6,20": "tile_bg_extra_floor02_extra",
        "6,19": "tile_bg_extra_floor02_extra",
        "6,18": "tile_bg_extra_floor02_extra",
        "7,17": "tile_bg_extra_floor02_extra",
        "8,17": "tile_bg_extra_floor02_extra",
        "11,17": "tile_bg_extra_floor02_extra",
        "10,18": "tile_bg_extra_floor02_extra",
        "8,19": "tile_bg_extra_floor02_extra",
        "7,19": "tile_bg_extra_floor02_extra",
        "7,18": "tile_bg_extra_floor02_extra",
        "7,23": "tile_bg_extra_floor02_extra",
        "8,23": "tile_bg_extra_floor02_extra",
        "9,23": "tile_bg_extra_floor02_extra",
        "10,23": "tile_bg_extra_floor02_extra",
        "11,23": "tile_bg_extra_floor02_extra",
        "8,21": "tile_bg_extra_floor02_extra",
        "8,20": "tile_bg_extra_floor02_extra",
        "8,18": "tile_bg_extra_floor02_extra",
        "9,21": "tile_bg_extra_floor02_extra",
        "9,24": "tile_bg_extra_floor02_extra",
        "10,20": "tile_bg_extra_floor02_extra",
        "10,19": "tile_bg_extra_floor02_extra",
        "10,21": "tile_bg_extra_floor02_extra",
        "11,21": "tile_bg_extra_floor02_extra",
        "12,18": "tile_bg_extra_floor02_extra",
        "14,18": "tile_bg_extra_floor02_extra",
        "15,17": "tile_bg_extra_floor02_extra",
        "17,17": "tile_bg_extra_floor02_extra",
        "18,18": "tile_bg_extra_floor02_extra",
        "19,18": "tile_bg_extra_floor02_extra",
        "17,19": "tile_bg_extra_floor02_extra",
        "16,19": "tile_bg_extra_floor02_extra",
        "15,18": "tile_bg_extra_floor02_extra",
        "13,18": "tile_bg_extra_floor02_extra",
        "13,17": "tile_bg_extra_floor02_extra",
        "20,20": "tile_bg_extra_floor02_extra",
        "20,21": "tile_bg_extra_floor02_extra",
        "17,22": "tile_bg_extra_floor02_extra",
        "17,21": "tile_bg_extra_floor02_extra",
        "18,23": "tile_bg_extra_floor02_extra",
        "17,23": "tile_bg_extra_floor02_extra",
        "18,21": "tile_bg_extra_floor02_extra",
        "19,19": "tile_bg_extra_floor02_extra",
        "18,19": "tile_bg_extra_floor02_extra",
        "19,21": "tile_bg_extra_floor02_extra",
        "20,17": "tile_bg_extra_floor02_extra",
        "19,17": "tile_bg_extra_floor02_extra",
        "16,18": "tile_bg_extra_floor02_extra",
        "17,18": "tile_bg_extra_floor02_extra",
        "14,19": "tile_bg_extra_floor02_extra",
        "13,19": "tile_bg_extra_floor02_extra",
        "12,19": "tile_bg_extra_floor02_extra",
        "16,20": "tile_bg_extra_floor02_extra",
        "12,20": "tile_bg_extra_floor02_extra",
        "15,27": "floor",
        "7,13": "tile_bg_extra_floor02_extra",
        "7,14": "tile_bg_extra_floor02_extra",
        "7,15": "tile_bg_extra_floor02_extra",
        "8,13": "tile_bg_extra_floor02_extra",
        "9,13": "tile_bg_extra_floor02_extra",
        "10,13": "tile_bg_extra_floor02_extra",
        "10,14": "tile_bg_extra_floor02_extra",
        "10,15": "tile_bg_extra_floor02_extra",
        "9,15": "tile_bg_extra_floor02_extra",
        "8,15": "tile_bg_extra_floor02_extra",
        "8,14": "tile_bg_extra_floor02_extra",
        "9,14": "tile_bg_extra_floor02_extra",
        "9,11": "tile_bg_extra_floor02_extra",
        "9,12": "tile_bg_extra_floor02_extra",
        "8,11": "tile_bg_extra_floor02_extra",
        "7,11": "tile_bg_extra_floor02_extra",
        "6,11": "tile_bg_extra_floor02_extra",
        "5,11": "tile_bg_extra_floor02_extra",
        "8,12": "tile_bg_extra_floor02_extra",
        "7,12": "tile_bg_extra_floor02_extra",
        "6,12": "tile_bg_extra_floor02_extra",
        "5,9": "tile_bg_extra_floor02_extra",
        "5,10": "tile_bg_extra_floor02_extra",
        "6,9": "tile_bg_extra_floor02_extra",
        "7,9": "tile_bg_extra_floor02_extra",
        "8,9": "tile_bg_extra_floor02_extra",
        "9,9": "tile_bg_extra_floor02_extra",
        "9,10": "tile_bg_extra_floor02_extra",
        "8,10": "tile_bg_extra_floor02_extra",
        "7,10": "tile_bg_extra_floor02_extra",
        "6,10": "tile_bg_extra_floor02_extra",
        "5,12": "tile_bg_extra_floor02_extra",
        "6,13": "tile_bg_extra_floor02_extra",
        "6,14": "tile_bg_extra_floor02_extra",
        "5,14": "tile_bg_extra_floor02_extra",
        "5,13": "tile_bg_extra_floor02_extra",
        "9,8": "tile_bg_extra_floor02_extra",
        "8,8": "tile_bg_extra_floor02_extra",
        "7,8": "tile_bg_extra_floor02_extra",
        "6,8": "tile_bg_extra_floor02_extra",
        "5,8": "tile_bg_extra_floor02_extra",
        "4,8": "tile_bg_extra_floor02_extra",
        "4,9": "tile_bg_extra_floor02_extra",
        "4,10": "tile_bg_extra_floor02_extra",
        "4,11": "tile_bg_extra_floor02_extra",
        "4,12": "tile_bg_extra_floor02_extra",
        "4,13": "tile_bg_extra_floor02_extra",
        "4,14": "tile_bg_extra_floor02_extra",
        "10,8": "tile_bg_extra_floor02_extra",
        "10,9": "tile_bg_extra_floor02_extra",
        "10,10": "tile_bg_extra_floor02_extra",
        "10,11": "tile_bg_extra_floor02_extra",
        "10,12": "tile_bg_extra_floor02_extra",
        "11,8": "tile_bg_extra_floor02_extra",
        "12,8": "tile_bg_extra_floor02_extra",
        "13,8": "tile_bg_extra_floor02_extra",
        "14,8": "tile_bg_extra_floor02_extra",
        "15,8": "tile_bg_extra_floor02_extra",
        "16,8": "tile_bg_extra_floor02_extra",
        "17,8": "tile_bg_extra_floor02_extra",
        "18,8": "tile_bg_extra_floor02_extra",
        "19,8": "tile_bg_extra_floor02_extra",
        "20,8": "tile_bg_extra_floor02_extra",
        "21,8": "tile_bg_extra_floor02_extra",
        "21,9": "tile_bg_extra_floor02_extra",
        "22,9": "tile_bg_extra_floor02_extra",
        "22,10": "tile_bg_extra_floor02_extra",
        "22,11": "tile_bg_extra_floor02_extra",
        "22,12": "tile_bg_extra_floor02_extra",
        "22,13": "tile_bg_extra_floor02_extra",
        "22,14": "tile_bg_extra_floor02_extra",
        "21,14": "tile_bg_extra_floor02_extra",
        "21,15": "tile_bg_extra_floor02_extra",
        "20,15": "tile_bg_extra_floor02_extra",
        "19,15": "tile_bg_extra_floor02_extra",
        "17,15": "tile_bg_extra_floor02_extra",
        "16,14": "tile_bg_extra_floor02_extra",
        "14,14": "tile_bg_extra_floor02_extra",
        "13,14": "tile_bg_extra_floor02_extra",
        "12,14": "tile_bg_extra_floor02_extra",
        "11,14": "tile_bg_extra_floor02_extra",
        "11,12": "tile_bg_extra_floor02_extra",
        "13,12": "tile_bg_extra_floor02_extra",
        "14,12": "tile_bg_extra_floor02_extra",
        "16,12": "tile_bg_extra_floor02_extra",
        "17,12": "tile_bg_extra_floor02_extra",
        "17,13": "tile_bg_extra_floor02_extra",
        "16,13": "tile_bg_extra_floor02_extra",
        "15,13": "tile_bg_extra_floor02_extra",
        "14,13": "tile_bg_extra_floor02_extra",
        "12,13": "tile_bg_extra_floor02_extra",
        "11,13": "tile_bg_extra_floor02_extra",
        "12,12": "tile_bg_extra_floor02_extra",
        "15,12": "tile_bg_extra_floor02_extra",
        "18,12": "tile_bg_extra_floor02_extra",
        "21,12": "tile_bg_extra_floor02_extra",
        "21,13": "tile_bg_extra_floor02_extra",
        "20,13": "tile_bg_extra_floor02_extra",
        "19,13": "tile_bg_extra_floor02_extra",
        "13,13": "tile_bg_extra_floor02_extra",
        "19,12": "tile_bg_extra_floor02_extra",
        "20,12": "tile_bg_extra_floor02_extra",
        "13,11": "tile_bg_extra_floor02_extra",
        "12,11": "tile_bg_extra_floor02_extra",
        "11,11": "tile_bg_extra_floor02_extra",
        "16,11": "tile_bg_extra_floor02_extra",
        "18,11": "tile_bg_extra_floor02_extra",
        "20,11": "tile_bg_extra_floor02_extra",
        "21,11": "tile_bg_extra_floor02_extra",
        "14,11": "tile_bg_extra_floor02_extra",
        "11,9": "tile_bg_extra_floor02_extra",
        "13,9": "tile_bg_extra_floor02_extra",
        "15,9": "tile_bg_extra_floor02_extra",
        "17,9": "tile_bg_extra_floor02_extra",
        "18,9": "tile_bg_extra_floor02_extra",
        "17,10": "tile_bg_extra_floor02_extra",
        "15,10": "tile_bg_extra_floor02_extra",
        "14,10": "tile_bg_extra_floor02_extra",
        "12,10": "tile_bg_extra_floor02_extra",
        "11,10": "tile_bg_extra_floor02_extra",
        "12,9": "tile_bg_extra_floor02_extra",
        "14,9": "tile_bg_extra_floor02_extra",
        "16,9": "tile_bg_extra_floor02_extra",
        "19,9": "tile_bg_extra_floor02_extra",
        "21,10": "tile_bg_extra_floor02_extra",
        "19,10": "tile_bg_extra_floor02_extra",
        "16,10": "tile_bg_extra_floor02_extra",
        "13,10": "tile_bg_extra_floor02_extra",
        "15,11": "tile_bg_extra_floor02_extra",
        "17,11": "tile_bg_extra_floor02_extra",
        "18,10": "tile_bg_extra_floor02_extra",
        "20,9": "tile_bg_extra_floor02_extra",
        "20,10": "tile_bg_extra_floor02_extra",
        "19,11": "tile_bg_extra_floor02_extra",
        "18,13": "tile_bg_extra_floor02_extra",
        "15,14": "tile_bg_extra_floor02_extra",
        "12,15": "tile_bg_extra_floor02_extra",
        "11,15": "tile_bg_extra_floor02_extra",
        "22,8": "tile_bg_extra_floor02_extra",
        "23,8": "tile_bg_extra_floor02_extra",
        "23,9": "tile_bg_extra_floor02_extra",
        "24,9": "tile_bg_extra_floor02_extra",
        "24,10": "tile_bg_extra_floor02_extra",
        "24,11": "tile_bg_extra_floor02_extra",
        "23,11": "tile_bg_extra_floor02_extra",
        "23,12": "tile_bg_extra_floor02_extra",
        "23,13": "tile_bg_extra_floor02_extra",
        "23,14": "tile_bg_extra_floor02_extra",
        "23,15": "tile_bg_extra_floor02_extra",
        "24,8": "tile_bg_extra_floor02_extra",
        "24,12": "tile_bg_extra_floor02_extra",
        "24,13": "tile_bg_extra_floor02_extra",
        "24,14": "tile_bg_extra_floor02_extra",
        "24,15": "tile_bg_extra_floor02_extra",
        "23,10": "tile_bg_extra_floor02_extra",
        "4,15": "tile_bg_extra_floor02_extra",
        "5,15": "tile_bg_extra_floor02_extra",
        "6,15": "tile_bg_extra_floor02_extra",
        "6,16": "tile_bg_extra_floor02_extra",
        "6,17": "tile_bg_extra_floor02_extra",
        "5,17": "tile_bg_extra_floor02_extra",
        "5,16": "tile_bg_extra_floor02_extra",
        "5,18": "tile_bg_extra_floor02_extra",
        "5,19": "tile_bg_extra_floor02_extra",
        "5,20": "tile_bg_extra_floor02_extra",
        "5,21": "tile_bg_extra_floor02_extra",
        "5,22": "tile_bg_extra_floor02_extra",
        "5,23": "tile_bg_extra_floor02_extra",
        "5,24": "tile_bg_extra_floor02_extra",
        "6,24": "tile_bg_extra_floor02_extra",
        "6,23": "tile_bg_extra_floor02_extra",
        "6,22": "tile_bg_extra_floor02_extra",
        "6,21": "tile_bg_extra_floor02_extra",
        "23,16": "tile_bg_extra_floor02_extra",
        "23,17": "tile_bg_extra_floor02_extra",
        "23,18": "tile_bg_extra_floor02_extra",
        "23,19": "tile_bg_extra_floor02_extra",
        "23,20": "tile_bg_extra_floor02_extra",
        "23,21": "tile_bg_extra_floor02_extra",
        "23,22": "tile_bg_extra_floor02_extra",
        "23,23": "tile_bg_extra_floor02_extra",
        "22,23": "tile_bg_extra_floor02_extra",
        "22,22": "tile_bg_extra_floor02_extra",
        "22,21": "tile_bg_extra_floor02_extra",
        "22,20": "tile_bg_extra_floor02_extra",
        "22,19": "tile_bg_extra_floor02_extra",
        "22,18": "tile_bg_extra_floor02_extra",
        "22,17": "tile_bg_extra_floor02_extra",
        "22,16": "tile_bg_extra_floor02_extra",
        "24,16": "tile_bg_extra_floor02_extra",
        "25,16": "tile_bg_extra_floor02_extra",
        "26,16": "tile_bg_extra_floor02_extra",
        "26,17": "tile_bg_extra_floor02_extra",
        "26,18": "tile_bg_extra_floor02_extra",
        "26,19": "tile_bg_extra_floor02_extra",
        "26,20": "tile_bg_extra_floor02_extra",
        "25,20": "tile_bg_extra_floor02_extra",
        "25,21": "tile_bg_extra_floor02_extra",
        "25,22": "tile_bg_extra_floor02_extra",
        "26,23": "tile_bg_extra_floor02_extra",
        "25,23": "tile_bg_extra_floor02_extra",
        "26,22": "tile_bg_extra_floor02_extra",
        "26,21": "tile_bg_extra_floor02_extra",
        "27,15": "tile_bg_extra_floor02_extra",
        "27,16": "tile_bg_extra_floor02_extra",
        "27,17": "tile_bg_extra_floor02_extra",
        "27,18": "tile_bg_extra_floor02_extra",
        "27,19": "tile_bg_extra_floor02_extra",
        "27,20": "tile_bg_extra_floor02_extra",
        "27,21": "tile_bg_extra_floor02_extra",
        "27,22": "tile_bg_extra_floor02_extra",
        "27,23": "tile_bg_extra_floor02_extra",
        "25,17": "tile_bg_extra_floor02_extra",
        "24,18": "tile_bg_extra_floor02_extra",
        "24,19": "tile_bg_extra_floor02_extra",
        "24,20": "tile_bg_extra_floor02_extra",
        "24,21": "tile_bg_extra_floor02_extra",
        "24,22": "tile_bg_extra_floor02_extra",
        "24,23": "tile_bg_extra_floor02_extra",
        "25,19": "tile_bg_extra_floor02_extra",
        "25,18": "tile_bg_extra_floor02_extra",
        "24,17": "tile_bg_extra_floor02_extra",
        "4,16": "tile_bg_extra_floor02_extra",
        "4,17": "tile_bg_extra_floor02_extra",
        "4,18": "tile_bg_extra_floor02_extra",
        "4,19": "tile_bg_extra_floor02_extra",
        "4,20": "tile_bg_extra_floor02_extra",
        "4,21": "tile_bg_extra_floor02_extra",
        "4,22": "tile_bg_extra_floor02_extra",
        "4,23": "tile_bg_extra_floor02_extra",
        "3,24": "tile_bg_extra_floor02_extra",
        "3,23": "tile_bg_extra_floor02_extra",
        "3,22": "tile_bg_extra_floor02_extra",
        "3,21": "tile_bg_extra_floor02_extra",
        "3,20": "tile_bg_extra_floor02_extra",
        "3,19": "tile_bg_extra_floor02_extra",
        "3,18": "tile_bg_extra_floor02_extra",
        "3,17": "tile_bg_extra_floor02_extra",
        "3,16": "tile_bg_extra_floor02_extra",
        "25,9": "tile_bg_extra_floor02_extra",
        "25,8": "tile_bg_extra_floor02_extra",
        "25,10": "tile_bg_extra_floor02_extra",
        "25,11": "tile_bg_extra_floor02_extra",
        "25,12": "tile_bg_extra_floor02_extra",
        "25,13": "tile_bg_extra_floor02_extra",
        "25,14": "tile_bg_extra_floor02_extra",
        "25,15": "tile_bg_extra_floor02_extra",
        "26,8": "tile_bg_extra_floor02_extra",
        "26,9": "tile_bg_extra_floor02_extra",
        "26,10": "tile_bg_extra_floor02_extra",
        "26,11": "tile_bg_extra_floor02_extra",
        "26,12": "tile_bg_extra_floor02_extra",
        "26,13": "tile_bg_extra_floor02_extra",
        "26,14": "tile_bg_extra_floor02_extra",
        "26,15": "tile_bg_extra_floor02_extra",
        "4,4": "tile_bg_extra_floor02_extra",
        "4,5": "tile_bg_extra_floor02_extra",
        "4,6": "tile_bg_extra_floor02_extra",
        "4,7": "tile_bg_extra_floor02_extra",
        "5,4": "tile_bg_extra_floor02_extra",
        "6,4": "tile_bg_extra_floor02_extra",
        "7,4": "tile_bg_extra_floor02_extra",
        "8,4": "tile_bg_extra_floor02_extra",
        "8,5": "tile_bg_extra_floor02_extra",
        "8,6": "tile_bg_extra_floor02_extra",
        "8,7": "tile_bg_extra_floor02_extra",
        "7,5": "tile_bg_extra_floor02_extra",
        "7,6": "tile_bg_extra_floor02_extra",
        "7,7": "tile_bg_extra_floor02_extra",
        "6,5": "tile_bg_extra_floor02_extra",
        "6,6": "tile_bg_extra_floor02_extra",
        "6,7": "tile_bg_extra_floor02_extra",
        "5,5": "tile_bg_extra_floor02_extra",
        "5,6": "tile_bg_extra_floor02_extra",
        "5,7": "tile_bg_extra_floor02_extra",
        "3,4": "tile_bg_extra_floor02_extra",
        "3,5": "tile_bg_extra_floor02_extra",
        "3,6": "tile_bg_extra_floor02_extra",
        "3,7": "tile_bg_extra_floor02_extra",
        "3,8": "tile_bg_extra_floor02_extra",
        "3,9": "tile_bg_extra_floor02_extra",
        "3,10": "tile_bg_extra_floor02_extra",
        "3,3": "tile_bg_extra_floor02_extra",
        "4,3": "tile_bg_extra_floor02_extra",
        "5,3": "tile_bg_extra_floor02_extra",
        "6,3": "tile_bg_extra_floor02_extra",
        "7,3": "tile_bg_extra_floor02_extra",
        "8,3": "tile_bg_extra_floor02_extra",
        "9,3": "tile_bg_extra_floor02_extra",
        "9,4": "tile_bg_extra_floor02_extra",
        "9,5": "tile_bg_extra_floor02_extra",
        "9,6": "tile_bg_extra_floor02_extra",
        "9,7": "tile_bg_extra_floor02_extra",
        "3,2": "tile_bg_extra_floor02_extra",
        "4,2": "tile_bg_extra_floor02_extra",
        "5,2": "tile_bg_extra_floor02_extra",
        "6,2": "tile_bg_extra_floor02_extra",
        "7,2": "tile_bg_extra_floor02_extra",
        "8,2": "tile_bg_extra_floor02_extra",
        "9,2": "tile_bg_extra_floor02_extra",
        "3,1": "tile_bg_extra_floor02_extra",
        "4,1": "tile_bg_extra_floor02_extra",
        "5,1": "tile_bg_extra_floor02_extra",
        "6,1": "tile_bg_extra_floor02_extra",
        "7,1": "tile_bg_extra_floor02_extra",
        "8,1": "tile_bg_extra_floor02_extra",
        "9,1": "tile_bg_extra_floor02_extra"
      },
      "ground": {
        "16,23": "tile_bg_extra_floor02_extra",
        "15,23": "tile_bg_extra_floor02_extra",
        "14,23": "tile_bg_extra_floor02_extra",
        "13,23": "tile_bg_extra_floor02_extra",
        "13,22": "tile_bg_extra_floor02_extra",
        "13,21": "tile_bg_extra_floor02_extra",
        "13,20": "tile_bg_extra_floor02_extra",
        "13,19": "tile_bg_extra_floor02_extra",
        "14,19": "tile_bg_extra_floor02_extra",
        "15,19": "tile_bg_extra_floor02_extra",
        "15,20": "tile_bg_extra_floor02_extra",
        "14,20": "tile_bg_extra_floor02_extra",
        "12,20": "tile_bg_extra_floor02_extra",
        "12,19": "tile_bg_extra_floor02_extra",
        "11,18": "tile_bg_extra_floor02_extra",
        "10,18": "tile_bg_extra_floor02_extra",
        "10,17": "tile_bg_extra_floor02_extra",
        "9,17": "tile_bg_extra_floor02_extra",
        "9,18": "tile_bg_extra_floor02_extra",
        "9,19": "tile_bg_extra_floor02_extra",
        "9,20": "tile_bg_extra_floor02_extra",
        "9,21": "tile_bg_extra_floor02_extra",
        "10,20": "tile_bg_extra_floor02_extra",
        "10,19": "tile_bg_extra_floor02_extra",
        "11,17": "tile_bg_extra_floor02_extra",
        "12,16": "tile_bg_extra_floor02_extra",
        "13,16": "tile_bg_extra_floor02_extra",
        "13,17": "tile_bg_extra_floor02_extra",
        "11,21": "tile_bg_extra_floor02_extra",
        "11,20": "tile_bg_extra_floor02_extra",
        "11,19": "tile_bg_extra_floor02_extra",
        "12,18": "tile_bg_extra_floor02_extra",
        "12,17": "tile_bg_extra_floor02_extra",
        "14,17": "tile_bg_extra_floor02_extra",
        "15,17": "tile_bg_extra_floor02_extra",
        "16,17": "tile_bg_extra_floor02_extra",
        "17,17": "tile_bg_extra_floor02_extra",
        "18,17": "tile_bg_extra_floor02_extra",
        "19,17": "tile_bg_extra_floor02_extra",
        "20,17": "tile_bg_extra_floor02_extra",
        "20,18": "tile_bg_extra_floor02_extra",
        "21,18": "tile_bg_extra_floor02_extra",
        "21,19": "tile_bg_extra_floor02_extra",
        "20,19": "tile_bg_extra_floor02_extra",
        "20,20": "tile_bg_extra_floor02_extra",
        "19,20": "tile_bg_extra_floor02_extra",
        "18,20": "tile_bg_extra_floor02_extra",
        "17,20": "tile_bg_extra_floor02_extra",
        "16,20": "tile_bg_extra_floor02_extra",
        "15,21": "tile_bg_extra_floor02_extra",
        "15,22": "tile_bg_extra_floor02_extra",
        "14,22": "tile_bg_extra_floor02_extra",
        "14,24": "tile_bg_extra_floor02_extra",
        "13,24": "tile_bg_extra_floor02_extra",
        "12,24": "tile_bg_extra_floor02_extra",
        "12,23": "tile_bg_extra_floor02_extra",
        "12,22": "tile_bg_extra_floor02_extra"
      },
      "ground2": {},
      "ground3": {
        "21,16": "tile_obstacle_ore_small"
      },
      "object": {},
      "object2": {},
      "object3": {},
      "object4": {},
      "overlay": {},
      "top": {
        "11,23": "tile_mr4czvpx",
        "11,24": "tile_mr4czvpx",
        "11,25": "tile_mr4czvpx",
        "17,25": "tile_mr4czvpx",
        "17,24": "tile_mr4czvpx",
        "17,23": "tile_mr4czvpx",
        "3,20": "tile_mr4czvpx",
        "3,19": "tile_mr4czvpx",
        "3,18": "tile_mr4czvpx",
        "3,17": "tile_mr4czvpx",
        "3,16": "tile_mr4czvpx",
        "3,15": "tile_mr4czvpx",
        "3,14": "tile_mr4czvpx",
        "27,20": "tile_mr4czvpx",
        "27,19": "tile_mr4czvpx",
        "27,18": "tile_mr4czvpx",
        "27,17": "tile_mr4czvpx",
        "27,16": "tile_mr4czvpx",
        "27,15": "tile_mr4czvpx",
        "27,14": "tile_mr4czvpx",
        "3,11": "tile_mr4czvpx",
        "3,10": "tile_mr4czvpx",
        "3,9": "tile_mr4czvpx",
        "3,8": "tile_mr4czvpx",
        "9,11": "tile_mr4czvpx",
        "9,10": "tile_mr4czvpx",
        "9,9": "tile_mr4czvpx",
        "9,8": "tile_mr4czvpx",
        "27,11": "tile_mr4czvpx",
        "27,10": "tile_mr4czvpx",
        "27,9": "tile_mr4czvpx",
        "27,8": "tile_mr4czvpx",
        "15,11": "tile_mr4czvpx",
        "15,10": "tile_mr4czvpx",
        "15,9": "tile_mr4czvpx",
        "15,8": "tile_mr4czvpx",
        "21,11": "tile_mr4czvpx",
        "21,10": "tile_mr4czvpx",
        "21,9": "tile_mr4czvpx",
        "21,8": "tile_mr4czvpx",
        "3,2": "tile_mr4czvpx",
        "3,3": "tile_mr4czvpx",
        "3,4": "tile_mr4czvpx",
        "3,5": "tile_mr4czvpx",
        "9,2": "tile_mr4czvpx",
        "9,3": "tile_mr4czvpx",
        "9,4": "tile_mr4czvpx",
        "9,5": "tile_mr4czvpx"
      }
    },
    "stamps": [
      {
        "id": "tile_mvfjt47h",
        "c": 19,
        "r": 22,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_wall02_hole",
        "c": 5,
        "r": 13,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02_hole",
        "c": 11,
        "r": 13,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02_hole",
        "c": 23,
        "r": 13,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02_hole",
        "c": 17,
        "r": 13,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 3,
        "r": 12,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 21,
        "r": 12,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_door_wood",
        "c": 18,
        "r": 14,
        "layer": "object2",
        "doorMode": "memory"
      },
      {
        "id": "tile_bg_backroom_door_wood",
        "c": 6,
        "r": 14,
        "layer": "object2",
        "doorMode": "memory",
        "memoryKey": "pure-key",
        "memoryScene": "red_memory_01"
      },
      {
        "id": "tile_bg_backroom_door_wood",
        "c": 12,
        "r": 14,
        "layer": "object2",
        "doorMode": "memory"
      },
      {
        "id": "tile_bg_backroom_door_wood",
        "c": 14,
        "r": 28,
        "layer": "object2"
      },
      {
        "id": "tile_bg_backroom_wall02_hole",
        "c": 13,
        "r": 27,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 16,
        "r": 27,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 12,
        "r": 27,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 3,
        "r": 21,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 7,
        "r": 22,
        "layer": "top"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 8,
        "r": 22,
        "layer": "top"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 9,
        "r": 22,
        "layer": "top"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 10,
        "r": 22,
        "layer": "top"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 18,
        "r": 22,
        "layer": "top"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 19,
        "r": 22,
        "layer": "top"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 20,
        "r": 22,
        "layer": "top"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 21,
        "r": 22,
        "layer": "top"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 17,
        "r": 21,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 11,
        "r": 21,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 11,
        "r": 26,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 17,
        "r": 26,
        "layer": "object"
      },
      {
        "id": "tile_bg_extra_chained_door",
        "c": 6,
        "r": 14,
        "layer": "object3"
      },
      {
        "id": "tile_bg_extra_chained_door",
        "c": 12,
        "r": 14,
        "layer": "object3"
      },
      {
        "id": "tile_bg_extra_chained_door",
        "c": 18,
        "r": 14,
        "layer": "object3"
      },
      {
        "id": "tile_mvfjt47h",
        "c": 7,
        "r": 22,
        "layer": "floor"
      },
      {
        "id": "tile_mvfjt47h",
        "c": 9,
        "r": 22,
        "layer": "floor"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 6,
        "r": 22,
        "layer": "top"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 5,
        "r": 22,
        "layer": "top"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 4,
        "r": 13,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 9,
        "r": 12,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 15,
        "r": 12,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 10,
        "r": 13,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 14,
        "r": 13,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 8,
        "r": 13,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 16,
        "r": 13,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 20,
        "r": 13,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 4,
        "r": 22,
        "layer": "top"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 22,
        "r": 22,
        "layer": "top"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 23,
        "r": 22,
        "layer": "top"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 24,
        "r": 22,
        "layer": "top"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 25,
        "r": 22,
        "layer": "top"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 22,
        "r": 13,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 26,
        "r": 13,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 27,
        "r": 12,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 27,
        "r": 21,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 26,
        "r": 22,
        "layer": "top"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 9,
        "r": 6,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 3,
        "r": 6,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 4,
        "r": 7,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 8,
        "r": 7,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02_hole",
        "c": 5,
        "r": 7,
        "layer": "object"
      },
      {
        "id": "tile_bg_extra_chained_door",
        "c": 6,
        "r": 8,
        "layer": "object3"
      },
      {
        "id": "tile_bg_backroom_door_wood",
        "c": 6,
        "r": 8,
        "layer": "object2",
        "doorMode": "memory",
        "memoryKey": "pure-key",
        "memoryScene": "red_memory_02"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 10,
        "r": 7,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 11,
        "r": 7,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 12,
        "r": 7,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 13,
        "r": 7,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 14,
        "r": 7,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 17,
        "r": 7,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 16,
        "r": 7,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 19,
        "r": 7,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 18,
        "r": 7,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 20,
        "r": 7,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 22,
        "r": 7,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 23,
        "r": 7,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 25,
        "r": 7,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 24,
        "r": 7,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 26,
        "r": 7,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 27,
        "r": 6,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 21,
        "r": 6,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 15,
        "r": 6,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 9,
        "r": 0,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 3,
        "r": 0,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 4,
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
        "id": "tile_bg_backroom_wall02_hole",
        "c": 5,
        "r": 1,
        "layer": "object"
      },
      {
        "id": "tile_bg_extra_chained_door",
        "c": 6,
        "r": 2,
        "layer": "object3"
      },
      {
        "id": "tile_bg_backroom_door_wood",
        "c": 6,
        "r": 2,
        "layer": "object2",
        "doorMode": "memory",
        "memoryKey": "pure-key",
        "memoryScene": "red_memory_03"
      }
    ],
    "solid": [
      "6,24",
      "7,24",
      "8,24",
      "9,24",
      "10,24",
      "11,24",
      "11,25",
      "11,26",
      "11,27",
      "11,28",
      "11,29",
      "12,29",
      "13,29",
      "15,29",
      "16,29",
      "17,29",
      "17,24",
      "17,25",
      "17,26",
      "17,27",
      "17,28",
      "18,24",
      "19,24",
      "20,24",
      "21,24",
      "22,24",
      "5,24",
      "4,24",
      "3,24",
      "3,13",
      "3,15",
      "3,16",
      "3,17",
      "3,18",
      "3,19",
      "3,20",
      "3,21",
      "3,22",
      "3,23",
      "4,15",
      "5,15",
      "7,15",
      "8,15",
      "9,15",
      "10,15",
      "11,15",
      "13,15",
      "14,15",
      "16,15",
      "17,15",
      "19,15",
      "20,15",
      "21,15",
      "22,15",
      "23,15",
      "25,15",
      "26,15",
      "27,15",
      "23,24",
      "24,24",
      "25,24",
      "26,24",
      "27,23",
      "27,24",
      "27,22",
      "27,21",
      "27,20",
      "27,19",
      "27,18",
      "27,17",
      "27,16",
      "27,14",
      "27,13",
      "27,12",
      "27,11",
      "27,10",
      "27,9",
      "27,8",
      "26,9",
      "25,9",
      "24,9",
      "23,9",
      "22,9",
      "21,9",
      "20,9",
      "19,9",
      "18,9",
      "17,9",
      "16,9",
      "15,9",
      "14,9",
      "13,9",
      "12,9",
      "11,9",
      "10,9",
      "9,9",
      "8,9",
      "7,9",
      "5,9",
      "4,9",
      "3,9",
      "3,12",
      "3,11",
      "3,10",
      "9,13",
      "9,12",
      "9,11",
      "9,10",
      "15,14",
      "15,13",
      "15,12",
      "15,11",
      "15,10",
      "15,15",
      "21,14",
      "21,13",
      "21,12",
      "21,11",
      "21,10",
      "3,8",
      "3,7",
      "3,6",
      "3,5",
      "3,4",
      "3,3",
      "3,2",
      "9,8",
      "9,7",
      "9,6",
      "9,5",
      "9,4",
      "9,3",
      "9,2",
      "4,3",
      "5,3",
      "7,3",
      "8,3",
      "3,14",
      "3,1",
      "4,1",
      "5,1",
      "6,1",
      "7,1",
      "8,1",
      "9,1",
      "4,2",
      "5,2",
      "7,2",
      "8,2",
      "5,8",
      "4,8",
      "7,8",
      "8,8",
      "10,8",
      "11,8",
      "12,8",
      "13,8",
      "14,8",
      "16,8",
      "17,8",
      "18,8",
      "19,8",
      "20,8",
      "22,8",
      "23,8",
      "24,8",
      "25,8",
      "26,8",
      "21,8",
      "15,8",
      "4,14",
      "5,14",
      "7,14",
      "8,14",
      "9,14",
      "10,14",
      "11,14",
      "14,14",
      "13,14",
      "16,14",
      "17,14",
      "19,14",
      "20,14",
      "22,14",
      "23,14",
      "25,14",
      "26,14"
    ],
    "breakable": [],
    "coreSpots": [],
    "spawnZone": [],
    "coreCount": 1,
    "monsterMix": [
      {
        "id": "slime",
        "weight": 100
      }
    ],
    "camp": [],
    "rules": {
      "money": 3000,
      "guide": 100,
      "guideRegen": 9,
      "speed": 44,
      "reward": 8
    },
    "solidOffsets": {},
    "safe": false,
    "npcs": false,
    "story": true,
    "portals": [
      {
        "c": 14,
        "r": 29,
        "to": "y1"
      }
    ],
    "cols": 32,
    "rows": 30,
    "hiddenPickups": []
  },
  {
    "id": "map_a46c5e1a-9802-4db5-a3b9-486b4649c206",
    "name": "Y25區入口-新手教學",
    "desc": "",
    "layers": {
      "floor": {
        "9,44": "floor",
        "9,45": "floor",
        "7,46": "floor",
        "7,47": "floor",
        "7,48": "floor",
        "7,49": "floor",
        "7,50": "floor",
        "7,51": "floor",
        "8,46": "floor",
        "9,46": "floor",
        "18,50": "floor",
        "19,50": "floor",
        "20,50": "floor",
        "21,50": "floor",
        "22,50": "floor",
        "23,50": "floor",
        "14,47": "floor",
        "15,47": "floor",
        "16,47": "floor",
        "17,47": "floor",
        "18,47": "floor",
        "19,47": "floor",
        "20,47": "floor",
        "21,47": "floor",
        "14,46": "floor",
        "15,46": "floor",
        "16,46": "floor",
        "17,46": "floor",
        "18,46": "floor",
        "19,46": "floor",
        "20,46": "floor",
        "21,46": "floor",
        "18,51": "floor",
        "18,52": "floor",
        "18,53": "floor",
        "22,40": "floor",
        "23,40": "floor",
        "23,41": "floor",
        "23,42": "floor",
        "23,43": "floor",
        "22,43": "floor",
        "22,42": "floor",
        "22,41": "floor",
        "14,36": "floor",
        "14,37": "floor",
        "14,38": "floor",
        "14,39": "floor",
        "14,40": "floor",
        "14,41": "floor",
        "14,42": "floor",
        "14,43": "floor",
        "14,44": "floor",
        "14,45": "floor",
        "17,36": "floor",
        "16,36": "floor",
        "15,36": "floor",
        "9,30": "floor",
        "9,31": "floor",
        "9,32": "floor",
        "9,33": "floor",
        "9,34": "floor",
        "9,35": "floor",
        "9,36": "floor",
        "9,37": "floor",
        "9,38": "floor",
        "9,39": "floor",
        "8,39": "floor",
        "8,40": "floor",
        "9,40": "floor",
        "9,41": "floor",
        "32,9": "floor",
        "32,10": "floor",
        "32,11": "floor",
        "32,12": "floor",
        "32,13": "floor",
        "32,14": "floor",
        "32,15": "floor",
        "32,16": "floor",
        "32,17": "floor",
        "32,18": "floor",
        "32,19": "floor",
        "32,20": "floor",
        "32,21": "floor",
        "31,9": "floor",
        "31,10": "floor",
        "31,11": "floor",
        "31,12": "floor",
        "31,13": "floor",
        "31,14": "floor",
        "31,15": "floor",
        "31,16": "floor",
        "31,17": "floor",
        "31,18": "floor",
        "31,19": "floor",
        "31,20": "floor",
        "31,21": "floor",
        "33,21": "floor",
        "33,20": "floor",
        "33,19": "floor",
        "33,18": "floor",
        "33,17": "floor",
        "33,16": "floor",
        "33,15": "floor",
        "33,14": "floor",
        "33,13": "floor",
        "33,12": "floor",
        "33,11": "floor",
        "33,10": "floor",
        "33,9": "floor",
        "23,14": "floor",
        "23,15": "floor",
        "24,16": "floor",
        "24,17": "floor",
        "24,18": "floor",
        "23,18": "floor",
        "23,19": "floor",
        "23,16": "floor",
        "24,14": "floor",
        "25,14": "floor",
        "26,14": "floor",
        "27,14": "floor",
        "27,15": "floor",
        "27,16": "floor",
        "27,17": "floor",
        "27,18": "floor",
        "27,19": "floor",
        "25,19": "floor",
        "24,19": "floor",
        "23,17": "floor",
        "24,15": "floor",
        "25,15": "floor",
        "26,15": "floor",
        "26,16": "floor",
        "26,17": "floor",
        "26,18": "floor",
        "25,18": "floor",
        "25,17": "floor",
        "25,16": "floor",
        "24,48": "floor",
        "25,48": "floor",
        "26,48": "floor",
        "27,48": "floor",
        "28,48": "floor",
        "29,48": "floor",
        "28,47": "floor",
        "29,47": "floor",
        "29,46": "floor",
        "29,45": "floor",
        "28,45": "floor",
        "28,44": "floor",
        "28,43": "floor",
        "28,42": "floor",
        "28,41": "floor",
        "28,40": "floor",
        "28,39": "floor",
        "29,39": "floor",
        "29,38": "floor",
        "29,37": "floor",
        "29,36": "floor",
        "28,36": "floor",
        "28,37": "floor",
        "28,38": "floor",
        "28,46": "floor",
        "29,40": "floor",
        "29,41": "floor",
        "29,42": "floor",
        "29,43": "floor",
        "29,44": "floor",
        "30,36": "floor",
        "30,37": "floor",
        "30,38": "floor",
        "30,39": "floor",
        "30,40": "floor",
        "30,41": "floor",
        "30,42": "floor",
        "30,43": "floor",
        "30,44": "floor",
        "30,45": "floor",
        "30,46": "floor",
        "30,47": "floor",
        "30,48": "floor",
        "24,50": "floor",
        "25,50": "floor",
        "26,50": "floor",
        "27,50": "floor",
        "28,50": "floor",
        "29,50": "floor",
        "30,50": "floor",
        "30,49": "floor",
        "29,49": "floor",
        "28,49": "floor",
        "27,49": "floor",
        "26,49": "floor",
        "25,49": "floor",
        "24,49": "floor",
        "4,26": "floor",
        "4,27": "floor",
        "4,28": "floor",
        "4,29": "floor",
        "4,30": "floor",
        "4,31": "floor",
        "17,29": "floor",
        "17,28": "floor",
        "17,27": "floor",
        "17,26": "floor",
        "18,26": "floor",
        "18,27": "floor",
        "18,28": "floor",
        "18,29": "floor",
        "19,26": "floor",
        "19,27": "floor",
        "19,28": "floor",
        "19,29": "floor",
        "20,29": "floor",
        "21,29": "floor",
        "22,29": "floor",
        "23,29": "floor",
        "24,29": "floor",
        "25,29": "floor",
        "20,26": "floor",
        "21,26": "floor",
        "22,26": "floor",
        "23,26": "floor",
        "24,26": "floor",
        "28,17": "floor",
        "29,17": "floor",
        "30,17": "floor",
        "28,16": "floor",
        "29,16": "floor",
        "30,16": "floor",
        "28,15": "floor",
        "29,15": "floor",
        "30,15": "floor",
        "28,18": "floor",
        "29,18": "floor",
        "30,18": "floor",
        "23,13": "floor",
        "24,13": "floor",
        "25,13": "floor",
        "26,13": "floor",
        "27,13": "floor",
        "26,23": "floor",
        "26,24": "floor",
        "26,25": "floor",
        "26,26": "floor",
        "29,24": "floor",
        "29,25": "floor",
        "29,26": "floor",
        "34,30": "floor",
        "29,29": "floor",
        "36,29": "floor",
        "27,29": "floor",
        "27,28": "floor",
        "27,30": "floor",
        "27,31": "floor",
        "27,32": "floor",
        "27,33": "floor",
        "27,34": "floor",
        "27,35": "floor",
        "36,31": "floor",
        "36,32": "floor",
        "36,33": "floor",
        "36,34": "floor",
        "36,35": "floor",
        "35,35": "floor",
        "34,35": "floor",
        "33,35": "floor",
        "32,35": "floor",
        "31,35": "floor",
        "35,34": "floor",
        "34,34": "floor",
        "33,34": "floor",
        "31,44": "floor",
        "32,44": "floor",
        "33,44": "floor",
        "34,44": "floor",
        "35,44": "floor",
        "36,44": "floor",
        "35,45": "floor",
        "36,46": "floor",
        "36,47": "floor",
        "36,48": "floor",
        "36,49": "floor",
        "35,49": "floor",
        "36,45": "floor",
        "36,50": "floor",
        "35,50": "floor",
        "34,50": "floor",
        "33,50": "floor",
        "32,50": "floor",
        "31,50": "floor",
        "31,45": "floor",
        "31,46": "floor",
        "31,48": "floor",
        "31,47": "floor",
        "32,46": "floor",
        "32,45": "floor",
        "32,48": "floor",
        "31,49": "floor",
        "32,49": "floor",
        "32,47": "floor",
        "33,46": "floor",
        "33,45": "floor",
        "33,47": "floor",
        "33,48": "floor",
        "34,45": "floor",
        "34,46": "floor",
        "35,47": "floor",
        "34,48": "floor",
        "34,49": "floor",
        "35,46": "floor",
        "35,48": "floor",
        "34,47": "floor",
        "33,49": "floor",
        "19,51": "floor",
        "19,52": "floor",
        "19,53": "floor",
        "20,51": "floor",
        "20,52": "floor",
        "20,53": "floor",
        "21,53": "floor",
        "21,51": "floor",
        "21,52": "floor",
        "31,8": "floor",
        "32,8": "floor",
        "34,8": "floor",
        "33,8": "floor",
        "34,6": "floor",
        "34,7": "floor",
        "34,9": "floor",
        "34,10": "floor",
        "34,11": "floor",
        "34,12": "floor",
        "34,13": "floor",
        "34,14": "floor",
        "34,15": "floor",
        "34,16": "floor",
        "34,17": "floor",
        "34,18": "floor",
        "34,19": "floor",
        "34,20": "floor",
        "34,21": "floor",
        "30,9": "floor",
        "30,10": "floor",
        "30,11": "floor",
        "30,12": "floor",
        "30,13": "floor",
        "30,14": "floor",
        "30,20": "floor",
        "30,19": "floor",
        "1,42": "floor",
        "1,43": "floor",
        "8,11": "floor",
        "8,12": "floor",
        "8,13": "floor",
        "8,14": "floor",
        "9,14": "floor",
        "10,14": "floor",
        "11,14": "floor",
        "12,14": "floor",
        "13,14": "floor",
        "14,14": "floor",
        "15,14": "floor",
        "16,14": "floor",
        "1,5": "floor",
        "1,6": "floor",
        "1,7": "floor",
        "1,8": "floor",
        "1,9": "floor",
        "1,10": "floor",
        "2,10": "floor",
        "2,9": "floor",
        "2,8": "floor",
        "2,7": "floor",
        "2,6": "floor",
        "2,5": "floor",
        "10,5": "floor",
        "10,6": "floor",
        "10,7": "floor",
        "10,8": "floor",
        "10,9": "floor",
        "10,10": "floor",
        "9,10": "floor",
        "9,9": "floor",
        "9,8": "floor",
        "9,7": "floor",
        "9,6": "floor",
        "9,5": "floor",
        "9,4": "floor",
        "15,37": "floor",
        "15,38": "floor",
        "15,39": "floor",
        "15,40": "floor",
        "15,41": "floor",
        "15,42": "floor",
        "15,43": "floor",
        "15,44": "floor",
        "15,45": "floor",
        "16,45": "floor",
        "17,45": "floor",
        "28,14": "floor",
        "29,14": "floor",
        "8,8": "floor",
        "18,45": "floor",
        "19,45": "floor",
        "25,38": "floor",
        "11,50": "floor",
        "12,50": "floor",
        "12,42": "floor",
        "10,58": "floor",
        "11,58": "floor",
        "12,58": "floor",
        "13,58": "floor",
        "14,58": "floor",
        "15,58": "floor",
        "16,58": "floor",
        "17,58": "floor",
        "18,58": "floor",
        "19,58": "floor",
        "20,58": "floor",
        "21,58": "floor",
        "21,57": "floor"
      },
      "ground": {},
      "ground2": {},
      "ground3": {},
      "object": {},
      "object2": {
        "35,44": "tile_interactive_storage_locker_key",
        "4,23": "tile_interactive_storage_locker_key",
        "34,6": "tile_interactive_storage_locker_key",
        "2,47": "tile_interactive_pickup_almond_water",
        "10,5": "tile_interactive_pickup_almond_water",
        "30,40": "tile_obstacle_ore_small",
        "35,47": "tile_obstacle_ore_small",
        "6,41": "tile_obstacle_ore_small",
        "27,26": "tile_obstacle_ore_small",
        "7,30": "tile_obstacle_ore_small",
        "31,19": "tile_obstacle_ore_small",
        "16,12": "tile_obstacle_ore_small",
        "5,38": "tile_interactive_pickup_battery",
        "18,6": "tile_interactive_storage_locker_key",
        "16,35": "tile_interactive_storage_locker_key",
        "34,18": "tile_interactive_pickup_almond_water",
        "35,32": "tile_interactive_pickup_graffiti_red"
      },
      "object3": {},
      "object4": {
        "14,23": "tile_obstacle_ore_small",
        "23,45": "tile_obstacle_ore_small"
      },
      "overlay": {},
      "top": {
        "10,29": "tile_mr4czvpx",
        "10,30": "tile_mr4czvpx",
        "10,31": "tile_mr4czvpx",
        "10,32": "tile_mr4czvpx",
        "10,33": "tile_mr4czvpx",
        "10,34": "tile_mr4czvpx",
        "10,35": "tile_mr4czvpx",
        "10,36": "tile_mr4czvpx",
        "24,41": "tile_mr4czvpx",
        "24,40": "tile_mr4czvpx",
        "24,39": "tile_mr4czvpx",
        "24,38": "tile_mr4czvpx",
        "31,39": "tile_mr4czvpx",
        "31,38": "tile_mr4czvpx",
        "31,37": "tile_mr4czvpx",
        "31,36": "tile_mr4czvpx",
        "31,35": "tile_mr4czvpx",
        "31,34": "tile_mr4czvpx",
        "36,46": "tile_mr4czvpx",
        "36,45": "tile_mr4czvpx",
        "36,44": "tile_mr4czvpx",
        "36,43": "tile_mr4czvpx",
        "36,42": "tile_mr4czvpx",
        "21,49": "tile_mr4czvpx",
        "1,47": "tile_mr4czvpx",
        "1,46": "tile_mr4czvpx",
        "1,45": "tile_mr4czvpx",
        "1,44": "tile_mr4czvpx",
        "1,43": "tile_mr4czvpx",
        "1,42": "tile_mr4czvpx",
        "1,41": "tile_mr4czvpx",
        "1,40": "tile_mr4czvpx",
        "1,39": "tile_mr4czvpx",
        "1,38": "tile_mr4czvpx",
        "1,37": "tile_mr4czvpx",
        "1,36": "tile_mr4czvpx",
        "7,47": "tile_mr4czvpx",
        "10,49": "tile_mr4czvpx",
        "10,48": "tile_mr4czvpx",
        "10,47": "tile_mr4czvpx",
        "3,14": "tile_mr4czvpx",
        "3,13": "tile_mr4czvpx",
        "3,12": "tile_mr4czvpx",
        "15,9": "tile_mr4czvpx",
        "15,8": "tile_mr4czvpx",
        "15,7": "tile_mr4czvpx",
        "15,6": "tile_mr4czvpx",
        "15,5": "tile_mr4czvpx",
        "15,4": "tile_mr4czvpx",
        "11,3": "tile_mr4czvpx",
        "11,4": "tile_mr4czvpx",
        "11,5": "tile_mr4czvpx",
        "11,6": "tile_mr4czvpx",
        "10,28": "tile_mr4czvpx",
        "35,18": "tile_mr4czvpx",
        "35,17": "tile_mr4czvpx",
        "35,16": "tile_mr4czvpx",
        "35,15": "tile_mr4czvpx",
        "35,14": "tile_mr4czvpx",
        "35,13": "tile_mr4czvpx",
        "35,12": "tile_mr4czvpx",
        "35,11": "tile_mr4czvpx",
        "35,10": "tile_mr4czvpx",
        "35,9": "tile_mr4czvpx",
        "35,8": "tile_mr4czvpx",
        "35,7": "tile_mr4czvpx",
        "35,6": "tile_mr4czvpx",
        "35,5": "tile_mr4czvpx",
        "35,4": "tile_mr4czvpx",
        "36,31": "tile_mr4czvpx",
        "36,30": "tile_mr4czvpx",
        "6,30": "tile_mr4czvpx",
        "6,31": "tile_mr4czvpx",
        "6,33": "tile_mr4czvpx",
        "6,32": "tile_mr4czvpx",
        "2,27": "tile_mr4czvpx",
        "2,26": "tile_mr4czvpx",
        "2,25": "tile_mr4czvpx",
        "2,24": "tile_mr4czvpx",
        "2,23": "tile_mr4czvpx",
        "2,22": "tile_mr4czvpx",
        "2,21": "tile_mr4czvpx",
        "26,26": "tile_mr4czvpx",
        "20,8": "tile_mr4czvpx",
        "20,9": "tile_mr4czvpx",
        "20,10": "tile_mr4czvpx",
        "20,11": "tile_mr4czvpx",
        "20,12": "tile_mr4czvpx",
        "20,13": "tile_mr4czvpx",
        "20,14": "tile_mr4czvpx",
        "20,15": "tile_mr4czvpx",
        "20,16": "tile_mr4czvpx",
        "20,17": "tile_mr4czvpx",
        "20,18": "tile_mr4czvpx",
        "20,19": "tile_mr4czvpx",
        "20,20": "tile_mr4czvpx",
        "20,21": "tile_mr4czvpx",
        "20,22": "tile_mr4czvpx",
        "23,12": "tile_mr4czvpx",
        "23,13": "tile_mr4czvpx",
        "23,14": "tile_mr4czvpx",
        "23,15": "tile_mr4czvpx",
        "29,8": "tile_mr4czvpx",
        "29,9": "tile_mr4czvpx",
        "30,18": "tile_mr4czvpx",
        "0,6": "tile_mr4czvpx",
        "0,5": "tile_mr4czvpx",
        "0,4": "tile_mr4czvpx",
        "0,3": "tile_mr4czvpx",
        "15,18": "tile_mr4czvpx",
        "15,17": "tile_mr4czvpx",
        "8,9": "tile_mr4czvpx",
        "26,24": "tile_mr4czvpx",
        "26,25": "tile_mr4czvpx",
        "10,37": "tile_mr4czvpx",
        "14,37": "tile_mr4czvpx",
        "14,36": "tile_mr4czvpx",
        "14,35": "tile_mr4czvpx",
        "14,34": "tile_mr4czvpx",
        "14,33": "tile_mr4czvpx",
        "14,32": "tile_mr4czvpx",
        "26,29": "tile_mr4czvpx",
        "29,10": "tile_mr4czvpx",
        "21,51": "tile_mr4czvpx",
        "21,50": "tile_mr4czvpx",
        "10,50": "tile_mr4czvpx",
        "10,51": "tile_mr4czvpx",
        "21,52": "tile_mr4czvpx",
        "21,53": "tile_mr4czvpx",
        "10,53": "tile_mr4czvpx",
        "10,52": "tile_mr4czvpx",
        "21,54": "tile_mr4czvpx",
        "10,54": "tile_mr4czvpx"
      }
    },
    "stamps": [
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 10,
        "r": 52,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 10,
        "r": 50,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 12,
        "r": 52,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 12,
        "r": 50,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 14,
        "r": 50,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 14,
        "r": 52,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 16,
        "r": 52,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 16,
        "r": 50,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 12,
        "r": 48,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 10,
        "r": 48,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 14,
        "r": 48,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 16,
        "r": 48,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 10,
        "r": 46,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 12,
        "r": 46,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 10,
        "r": 44,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 12,
        "r": 44,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 12,
        "r": 42,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 10,
        "r": 42,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 8,
        "r": 42,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 5,
        "r": 44,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 5,
        "r": 46,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 3,
        "r": 46,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 14,
        "r": 34,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 16,
        "r": 34,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 18,
        "r": 34,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 20,
        "r": 34,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 22,
        "r": 34,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 24,
        "r": 34,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 26,
        "r": 34,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 28,
        "r": 34,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 28,
        "r": 32,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 28,
        "r": 30,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 28,
        "r": 28,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 28,
        "r": 26,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 26,
        "r": 26,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 24,
        "r": 26,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 24,
        "r": 28,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 26,
        "r": 28,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 18,
        "r": 48,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 20,
        "r": 48,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 22,
        "r": 48,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 22,
        "r": 46,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 22,
        "r": 44,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 20,
        "r": 44,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 18,
        "r": 44,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 18,
        "r": 42,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 20,
        "r": 42,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 26,
        "r": 36,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 26,
        "r": 38,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 26,
        "r": 40,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 26,
        "r": 42,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 26,
        "r": 44,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 26,
        "r": 46,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 24,
        "r": 46,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 18,
        "r": 40,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 20,
        "r": 40,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 18,
        "r": 36,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 18,
        "r": 38,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 15,
        "r": 28,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 15,
        "r": 26,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 13,
        "r": 28,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 11,
        "r": 28,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 9,
        "r": 28,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 7,
        "r": 28,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 7,
        "r": 30,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 7,
        "r": 32,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 7,
        "r": 34,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 7,
        "r": 36,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 7,
        "r": 38,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 7,
        "r": 40,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 2,
        "r": 30,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 2,
        "r": 28,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 2,
        "r": 26,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 2,
        "r": 24,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 2,
        "r": 22,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 4,
        "r": 22,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 6,
        "r": 22,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 6,
        "r": 24,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 4,
        "r": 24,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 3,
        "r": 48,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 5,
        "r": 48,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 8,
        "r": 22,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 10,
        "r": 22,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 12,
        "r": 22,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 14,
        "r": 22,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 16,
        "r": 22,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 16,
        "r": 20,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 16,
        "r": 18,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 16,
        "r": 16,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 22,
        "r": 27,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 20,
        "r": 27,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 27,
        "r": 24,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 33,
        "r": 30,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 31,
        "r": 30,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 30,
        "r": 30,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 30,
        "r": 32,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 32,
        "r": 32,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 30,
        "r": 34,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 32,
        "r": 34,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 34,
        "r": 32,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 16,
        "r": 14,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 16,
        "r": 12,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 16,
        "r": 10,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 16,
        "r": 8,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 18,
        "r": 8,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 18,
        "r": 10,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 18,
        "r": 12,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 18,
        "r": 14,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 18,
        "r": 16,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 18,
        "r": 18,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 18,
        "r": 20,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 18,
        "r": 22,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 8,
        "r": 24,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 10,
        "r": 24,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 12,
        "r": 24,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 14,
        "r": 24,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 16,
        "r": 24,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 18,
        "r": 24,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 1,
        "r": 46,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 1,
        "r": 48,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 1,
        "r": 50,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 3,
        "r": 50,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 5,
        "r": 50,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 7,
        "r": 44,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 20,
        "r": 8,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 22,
        "r": 8,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 24,
        "r": 8,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 26,
        "r": 8,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 29,
        "r": 8,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 3,
        "r": 5,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 3,
        "r": 7,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 3,
        "r": 9,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 5,
        "r": 5,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 7,
        "r": 5,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 5,
        "r": 7,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 7,
        "r": 7,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 5,
        "r": 9,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 7,
        "r": 9,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 4,
        "r": 11,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 6,
        "r": 11,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 4,
        "r": 13,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 4,
        "r": 15,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 6,
        "r": 13,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 6,
        "r": 15,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 8,
        "r": 15,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 4,
        "r": 17,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 6,
        "r": 17,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 8,
        "r": 17,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 10,
        "r": 15,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 10,
        "r": 17,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 12,
        "r": 15,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 12,
        "r": 17,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 14,
        "r": 15,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 14,
        "r": 17,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 28,
        "r": 8,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 30,
        "r": 8,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 16,
        "r": 6,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 18,
        "r": 6,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 20,
        "r": 6,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 22,
        "r": 6,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 24,
        "r": 6,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 26,
        "r": 6,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 28,
        "r": 6,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 30,
        "r": 6,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 32,
        "r": 6,
        "layer": "floor"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 1,
        "r": 48,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 7,
        "r": 48,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 10,
        "r": 55,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 21,
        "r": 55,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 21,
        "r": 47,
        "layer": "ground3"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 36,
        "r": 47,
        "layer": "ground3"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 31,
        "r": 40,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 36,
        "r": 40,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 24,
        "r": 42,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 24,
        "r": 36,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 20,
        "r": 36,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 31,
        "r": 32,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 26,
        "r": 27,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 5,
        "r": 40,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 5,
        "r": 38,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 6,
        "r": 42,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 4,
        "r": 42,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 3,
        "r": 44,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 1,
        "r": 44,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 2,
        "r": 42,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 3,
        "r": 40,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 3,
        "r": 38,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 1,
        "r": 40,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 1,
        "r": 38,
        "layer": "floor"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 1,
        "r": 34,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 6,
        "r": 34,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 6,
        "r": 28,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 2,
        "r": 28,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 15,
        "r": 15,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 3,
        "r": 15,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 22,
        "r": 48,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 25,
        "r": 48,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 28,
        "r": 48,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 31,
        "r": 48,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 11,
        "r": 56,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 18,
        "r": 56,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 2,
        "r": 49,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 32,
        "r": 41,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 32,
        "r": 33,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 22,
        "r": 31,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 19,
        "r": 31,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 16,
        "r": 31,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 3,
        "r": 35,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 27,
        "r": 23,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 22,
        "r": 23,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 12,
        "r": 20,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 4,
        "r": 16,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 7,
        "r": 16,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 10,
        "r": 16,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 23,
        "r": 7,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 26,
        "r": 7,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 11,
        "r": 27,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 14,
        "r": 27,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 17,
        "r": 27,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 20,
        "r": 27,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 23,
        "r": 27,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 5,
        "r": 49,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 6,
        "r": 49,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 34,
        "r": 48,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 35,
        "r": 48,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 35,
        "r": 41,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 3,
        "r": 29,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 2,
        "r": 35,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 13,
        "r": 16,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 26,
        "r": 17,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 27,
        "r": 17,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 28,
        "r": 17,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 29,
        "r": 17,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 26,
        "r": 11,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 27,
        "r": 11,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 19,
        "r": 3,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 22,
        "r": 3,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 25,
        "r": 3,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 28,
        "r": 3,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 32,
        "r": 3,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 35,
        "r": 19,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 15,
        "r": 2,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 35,
        "r": 2,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 20,
        "r": 6,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 29,
        "r": 6,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 23,
        "r": 16,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 25,
        "r": 11,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 24,
        "r": 11,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 25,
        "r": 17,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 24,
        "r": 17,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 14,
        "r": 30,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 10,
        "r": 45,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 7,
        "r": 45,
        "layer": "ground"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 8,
        "r": 46,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 9,
        "r": 46,
        "layer": "object"
      },
      {
        "id": "tile_mvcsj5eh",
        "c": 6,
        "r": 36,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 21,
        "r": 37,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 15,
        "r": 10,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 0,
        "r": 7,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 11,
        "r": 7,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 0,
        "r": 1,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 11,
        "r": 1,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 2,
        "r": 8,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 9,
        "r": 8,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 10,
        "r": 8,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 14,
        "r": 16,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 15,
        "r": 19,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 16,
        "r": 3,
        "layer": "object"
      },
      {
        "id": "tile_mrt_exit_2_sealed",
        "c": 4,
        "r": -1,
        "layer": "object",
        "ox": 0,
        "oy": 18,
        "sortDepth": 3.25
      },
      {
        "id": "tile_mr4cyq54",
        "c": 3,
        "r": 1,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 9,
        "r": 1,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 9,
        "r": 20,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 6,
        "r": 20,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 3,
        "r": 20,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 2,
        "r": 19,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 5,
        "r": 29,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 10,
        "r": 26,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 13,
        "r": 26,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 11,
        "r": 26,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 9,
        "r": 26,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 7,
        "r": 26,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 5,
        "r": 26,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 5,
        "r": 28,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 5,
        "r": 30,
        "layer": "floor"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 4,
        "r": 29,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 24,
        "r": 36,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 22,
        "r": 36,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 20,
        "r": 36,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 24,
        "r": 38,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 24,
        "r": 40,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 20,
        "r": 38,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 22,
        "r": 38,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 24,
        "r": 42,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 24,
        "r": 44,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 35,
        "r": 30,
        "layer": "floor"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 1,
        "r": 8,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 1,
        "r": 2,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 2,
        "r": 2,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 10,
        "r": 2,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 8,
        "r": 10,
        "layer": "object2"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 9,
        "r": 11,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 10,
        "r": 11,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 11,
        "r": 11,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 12,
        "r": 11,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 13,
        "r": 11,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 14,
        "r": 11,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 21,
        "r": 7,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 22,
        "r": 7,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 34,
        "r": 20,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 33,
        "r": 20,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 32,
        "r": 20,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 31,
        "r": 20,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 30,
        "r": 19,
        "layer": "object"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 20,
        "r": 22,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 26,
        "r": 22,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 25,
        "r": 23,
        "layer": "object"
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 30,
        "r": 23,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 30,
        "r": 26,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 30,
        "r": 28,
        "layer": "floor"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 31,
        "r": 26,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 33,
        "r": 27,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 34,
        "r": 27,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 16,
        "r": 37,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 16,
        "r": 39,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 16,
        "r": 41,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 16,
        "r": 43,
        "layer": "floor"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 14,
        "r": 38,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 10,
        "r": 38,
        "layer": "object"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 25,
        "r": 30,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 15,
        "r": 31,
        "layer": "object"
      },
      {
        "id": "tile_mvcsj5eh",
        "c": 29,
        "r": 10,
        "layer": "object2"
      },
      {
        "id": "tile_mvcsj5eh",
        "c": 29,
        "r": 11,
        "layer": "object2"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 28,
        "r": 11,
        "layer": "object"
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 35,
        "r": 27,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa16jw",
        "c": 35,
        "r": 32,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_wall02_hole",
        "c": 7,
        "r": 31,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02_hole",
        "c": 17,
        "r": 9,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02_hole",
        "c": 4,
        "r": 11,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 7,
        "r": 11,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 16,
        "r": 9,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_door_wood",
        "c": 8,
        "r": 32,
        "layer": "object2"
      },
      {
        "id": "tile_bg_backroom_door_wood",
        "c": 18,
        "r": 10,
        "layer": "object2"
      },
      {
        "id": "tile_bg_backroom_wall02_dmg_light",
        "c": 3,
        "r": 35,
        "layer": "object3"
      },
      {
        "id": "tile_bg_backroom_wall02_dmg_medium",
        "c": 32,
        "r": 41,
        "layer": "object3"
      },
      {
        "id": "tile_bg_backroom_wall02_dmg_medium",
        "c": 22,
        "r": 27,
        "layer": "object3"
      },
      {
        "id": "tile_bg_backroom_wall02_dmg_medium",
        "c": 7,
        "r": 20,
        "layer": "object3"
      },
      {
        "id": "tile_bg_backroom_wall02_dmg_medium",
        "c": 26,
        "r": 11,
        "layer": "object3"
      },
      {
        "id": "tile_bg_backroom_wall02_dmg_medium",
        "c": 17,
        "r": 3,
        "layer": "object3"
      },
      {
        "id": "tile_bg_backroom_wall02_dmg_medium",
        "c": 30,
        "r": 3,
        "layer": "object3"
      },
      {
        "id": "tile_mr4ct8od",
        "c": 13,
        "r": 50,
        "layer": "ground"
      },
      {
        "id": "tile_mr4ct8od",
        "c": 13,
        "r": 48,
        "layer": "ground"
      },
      {
        "id": "tile_mr4ct8od",
        "c": 13,
        "r": 46,
        "layer": "ground"
      },
      {
        "id": "tile_mr4ct8od",
        "c": 13,
        "r": 44,
        "layer": "ground"
      },
      {
        "id": "tile_mr4cyc49",
        "c": 17,
        "r": 50,
        "layer": "ground"
      },
      {
        "id": "tile_mr4cyc49",
        "c": 17,
        "r": 48,
        "layer": "ground"
      },
      {
        "id": "tile_mr4cyc49",
        "c": 17,
        "r": 46,
        "layer": "ground"
      },
      {
        "id": "tile_mr4cyc49",
        "c": 17,
        "r": 44,
        "layer": "ground"
      },
      {
        "id": "tile_mr4cyc49",
        "c": 17,
        "r": 42,
        "layer": "ground"
      },
      {
        "id": "tile_mr4cyc49",
        "c": 17,
        "r": 40,
        "layer": "ground"
      },
      {
        "id": "tile_mr4cyc49",
        "c": 17,
        "r": 38,
        "layer": "ground"
      },
      {
        "id": "tile_mr4cyc49",
        "c": 17,
        "r": 36,
        "layer": "ground"
      },
      {
        "id": "tile_interactive_storage_locker",
        "c": 34,
        "r": 28,
        "layer": "object2",
        "ox": -14,
        "oy": -16,
        "lockerLoot": {
          "kind": "item",
          "id": "backroom-door-key",
          "qty": 1
        }
      },
      {
        "id": "tile_field_ammo_crate",
        "c": 2,
        "r": 37,
        "layer": "object2",
        "ox": 0,
        "oy": -16,
        "lockerLoot": {
          "kind": "item",
          "id": "storage-locker-key",
          "qty": 1
        }
      },
      {
        "id": "tile_interactive_power_switch_off",
        "c": 30,
        "r": 24,
        "layer": "object3",
        "ox": -12,
        "oy": 14,
        "circuit": 1
      },
      {
        "id": "tile_mv5my8dk",
        "c": 15,
        "r": 31,
        "layer": "object4",
        "circuit": 1
      },
      {
        "id": "tile_mv5my8dk",
        "c": 25,
        "r": 31,
        "layer": "object4",
        "circuit": 1
      },
      {
        "id": "tile_mv5my8dk",
        "c": 27,
        "r": 23,
        "layer": "object4",
        "circuit": 1
      },
      {
        "id": "tile_mv5my8dk",
        "c": 21,
        "r": 23,
        "layer": "object4",
        "circuit": 1
      },
      {
        "id": "tile_mv5my8dk",
        "c": 32,
        "r": 27,
        "layer": "object4"
      },
      {
        "id": "tile_bg_electric_light",
        "c": 20,
        "r": 31,
        "layer": "object4"
      },
      {
        "id": "tile_bg_electric_light",
        "c": 22,
        "r": 37,
        "layer": "object4"
      },
      {
        "id": "tile_bg_electric_light",
        "c": 4,
        "r": 35,
        "layer": "object4"
      },
      {
        "id": "tile_bg_electric_light",
        "c": 3,
        "r": 20,
        "layer": "object4"
      },
      {
        "id": "tile_bg_electric_light",
        "c": 13,
        "r": 20,
        "layer": "object4"
      },
      {
        "id": "tile_bg_electric_light",
        "c": 21,
        "r": 3,
        "layer": "object4"
      },
      {
        "id": "tile_bg_electric_light",
        "c": 16,
        "r": 9,
        "layer": "object4"
      },
      {
        "id": "tile_bg_electric_light",
        "c": 33,
        "r": 3,
        "layer": "object4"
      },
      {
        "id": "tile_field_ammo_crate",
        "c": 25,
        "r": 25,
        "layer": "object2",
        "ox": 0,
        "oy": -16,
        "lockerLoot": {
          "kind": "item",
          "id": "almond-water",
          "qty": 1
        }
      },
      {
        "id": "tile_interactive_storage_locker",
        "c": 27,
        "r": 12,
        "layer": "object3",
        "ox": -14,
        "oy": -18,
        "sortDepth": 2.5,
        "lockerLoot": {
          "kind": "item",
          "id": "firstaid",
          "qty": 2
        }
      },
      {
        "id": "tile_mvpa16jw",
        "c": 23,
        "r": 16,
        "layer": "object"
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 8,
        "r": 8,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 4,
        "r": 11,
        "layer": "object"
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 2,
        "r": 8,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 23,
        "r": 11,
        "layer": "object"
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 29,
        "r": 17,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa16jw",
        "c": 30,
        "r": 19,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 28,
        "r": 37,
        "layer": "object"
      },
      {
        "id": "tile_obstacle_ore_large",
        "c": 1,
        "r": 4,
        "layer": "object2"
      },
      {
        "id": "tile_mr4ja2cb",
        "c": 15,
        "r": 40,
        "layer": "object2"
      },
      {
        "id": "tile_mr4ja2cb",
        "c": 16,
        "r": 40,
        "layer": "object2"
      },
      {
        "id": "tile_obstacle_searchlight_h",
        "c": 20,
        "r": 49,
        "layer": "object2"
      },
      {
        "id": "tile_dmg_broken_wall_right",
        "c": 25,
        "r": 42,
        "layer": "object"
      },
      {
        "id": "tile_dmg_broken_wall_left",
        "c": 28,
        "r": 26,
        "layer": "object",
        "ox": 0,
        "oy": 6
      },
      {
        "id": "tile_dmg_floor_crack_cross",
        "c": 17,
        "r": 24,
        "layer": "ground2"
      },
      {
        "id": "tile_dmg_floor_crater",
        "c": 6,
        "r": 5,
        "layer": "ground2"
      },
      {
        "id": "tile_dmg_rubble_small",
        "c": 28,
        "r": 45,
        "layer": "ground2"
      },
      {
        "id": "tile_dmg_rubble_small",
        "c": 14,
        "r": 42,
        "layer": "ground2"
      },
      {
        "id": "tile_dmg_floor_stain_smudge",
        "c": 27,
        "r": 30,
        "layer": "ground2"
      },
      {
        "id": "tile_dmg_floor_stain_smudge",
        "c": 16,
        "r": 20,
        "layer": "ground2"
      },
      {
        "id": "tile_dmg_floor_stain_smudge",
        "c": 31,
        "r": 7,
        "layer": "ground2"
      },
      {
        "id": "tile_street_drink_shop_small",
        "c": 24,
        "r": 12,
        "layer": "object2",
        "sortDepth": 2.5,
        "ox": 2,
        "oy": -14
      },
      {
        "id": "tile_new_decor_oil_drum",
        "c": 25,
        "r": 39,
        "layer": "object3"
      },
      {
        "id": "tile_new_decor_oil_drum",
        "c": 27,
        "r": 39,
        "layer": "object3"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 10,
        "r": 54,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 12,
        "r": 54,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 14,
        "r": 54,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 16,
        "r": 54,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 18,
        "r": 54,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 20,
        "r": 54,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 10,
        "r": 56,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 12,
        "r": 56,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 14,
        "r": 56,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 16,
        "r": 56,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 18,
        "r": 56,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 20,
        "r": 56,
        "layer": "floor"
      },
      {
        "id": "tile_mr4ct8od",
        "c": 13,
        "r": 52,
        "layer": "ground"
      },
      {
        "id": "tile_mr4ct8od",
        "c": 13,
        "r": 54,
        "layer": "ground"
      },
      {
        "id": "tile_mr4cyc49",
        "c": 17,
        "r": 52,
        "layer": "ground"
      },
      {
        "id": "tile_mr4cyc49",
        "c": 17,
        "r": 54,
        "layer": "ground"
      },
      {
        "id": "tile_bg_backroom_door_wood",
        "c": 5,
        "r": 12,
        "layer": "object2",
        "doorMode": "key"
      },
      {
        "id": "tile_interactive_storage_locker",
        "c": 10,
        "r": 21,
        "layer": "object2",
        "lockerLoot": {
          "kind": "item",
          "id": "firstaid",
          "qty": 1
        },
        "ox": 2,
        "oy": -22,
        "sortDepth": 2.5
      },
      {
        "id": "tile_bg_backroom_wall02_crack_breakable",
        "c": 25,
        "r": 37,
        "layer": "object"
      },
      {
        "id": "tile_field_ammo_crate_open",
        "c": 11,
        "r": 51,
        "layer": "object"
      },
      {
        "id": "tile_field_supply_box",
        "c": 13,
        "r": 51,
        "layer": "object",
        "ox": -32,
        "oy": 0
      },
      {
        "id": "tile_mvma4ws7",
        "c": 19,
        "r": 51,
        "layer": "object"
      },
      {
        "id": "tile_mvnn2p1x",
        "c": 2,
        "r": 4,
        "layer": "object4",
        "ox": 8,
        "oy": -12
      },
      {
        "id": "tile_field_ammo_crate",
        "c": 16,
        "r": 5,
        "layer": "object2",
        "lockerLoot": {
          "kind": "item",
          "id": "anomaly-firstaid",
          "qty": 1
        },
        "ox": 0,
        "oy": -16
      },
      {
        "id": "tile_field_ammo_crate",
        "c": 12,
        "r": 41,
        "layer": "object4",
        "lockerLoot": {
          "kind": "item",
          "id": "firstaid",
          "qty": 2
        },
        "ox": -4,
        "oy": -12
      },
      {
        "id": "tile_bg_backroom_wall02_dmg_light",
        "c": 11,
        "r": 39,
        "layer": "object3",
        "sortDepth": 3
      },
      {
        "id": "tile_interactive_storage_locker",
        "c": 10,
        "r": 21,
        "layer": "object2",
        "lockerLoot": {
          "kind": "item",
          "id": "firstaid",
          "qty": 2
        },
        "ox": 2,
        "oy": -22,
        "sortDepth": 2.5
      },
      {
        "id": "tile_bg_extra_oil_drum_background",
        "c": 31,
        "r": 16,
        "layer": "object2"
      },
      {
        "id": "tile_field_supply_box",
        "c": 11,
        "r": 51,
        "layer": "object2"
      },
      {
        "id": "tile_field_ammo_crate_open",
        "c": 12,
        "r": 51,
        "layer": "object2",
        "ox": 8,
        "oy": 0
      },
      {
        "id": "tile_mvma4ws7",
        "c": 19,
        "r": 51,
        "layer": "object2"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 3,
        "r": 10,
        "layer": "object2"
      },
      {
        "id": "tile_field_ammo_crate",
        "c": 3,
        "r": 23,
        "layer": "object2",
        "lockerLoot": {
          "kind": "item",
          "id": "firstaid",
          "qty": 2
        }
      },
      {
        "id": "tile_bg_electric_light",
        "c": 11,
        "r": 39,
        "layer": "object4"
      },
      {
        "id": "tile_bg_electric_light",
        "c": 32,
        "r": 41,
        "layer": "object4"
      },
      {
        "id": "tile_dmg_broken_wall_right",
        "c": 17,
        "r": 36,
        "layer": "object",
        "fx": true,
        "ox": 0,
        "oy": 6
      },
      {
        "id": "tile_dmg_broken_wall_breach",
        "c": 14,
        "r": 55,
        "layer": "object2",
        "ox": 0,
        "oy": 10
      },
      {
        "id": "tile_obstacle_irongate",
        "c": 14,
        "r": 48,
        "layer": "object2"
      },
      {
        "id": "tile_mr4ja2cb",
        "c": 13,
        "r": 48,
        "layer": "object"
      },
      {
        "id": "tile_mr4ja2cb",
        "c": 18,
        "r": 48,
        "layer": "object"
      },
      {
        "id": "tile_mr4ja2cb",
        "c": 19,
        "r": 48,
        "layer": "object"
      },
      {
        "id": "tile_mr4ja2cb",
        "c": 20,
        "r": 48,
        "layer": "object"
      },
      {
        "id": "tile_mr4ja2cb",
        "c": 11,
        "r": 48,
        "layer": "object"
      },
      {
        "id": "tile_mr4ja2cb",
        "c": 12,
        "r": 48,
        "layer": "object"
      },
      {
        "id": "tile_obstacle_searchlight_h",
        "c": 11,
        "r": 49,
        "layer": "object2"
      },
      {
        "id": "tile_obstacle_searchlight_h",
        "c": 16,
        "r": 56,
        "layer": "ground3"
      },
      {
        "id": "tile_field_ammo_crate",
        "c": 19,
        "r": 11,
        "layer": "object2",
        "ox": 0,
        "oy": -12,
        "lockerLoot": {
          "kind": "item",
          "id": "medkit",
          "qty": 1
        }
      }
    ],
    "solid": [
      "2,51",
      "3,51",
      "4,51",
      "5,51",
      "6,51",
      "7,51",
      "1,51",
      "1,50",
      "2,50",
      "3,50",
      "4,50",
      "5,50",
      "6,50",
      "7,50",
      "7,49",
      "7,48",
      "7,47",
      "8,47",
      "8,48",
      "9,47",
      "9,48",
      "10,47",
      "10,48",
      "10,49",
      "10,50",
      "10,51",
      "10,52",
      "10,53",
      "10,54",
      "10,55",
      "10,56",
      "11,57",
      "12,57",
      "13,57",
      "14,57",
      "10,57",
      "17,57",
      "18,57",
      "19,57",
      "20,57",
      "21,57",
      "21,56",
      "21,55",
      "21,54",
      "21,53",
      "21,52",
      "21,51",
      "22,50",
      "23,50",
      "21,50",
      "21,49",
      "22,49",
      "23,49",
      "24,50",
      "25,50",
      "26,50",
      "27,50",
      "28,50",
      "29,50",
      "30,50",
      "31,50",
      "32,50",
      "33,50",
      "34,50",
      "35,50",
      "36,50",
      "24,49",
      "25,49",
      "26,49",
      "27,49",
      "28,49",
      "29,49",
      "30,49",
      "31,49",
      "32,49",
      "33,49",
      "34,49",
      "35,49",
      "36,49",
      "36,43",
      "36,44",
      "36,45",
      "36,46",
      "36,47",
      "36,48",
      "36,42",
      "35,42",
      "34,42",
      "33,42",
      "32,42",
      "31,42",
      "31,43",
      "32,43",
      "33,43",
      "34,43",
      "35,43",
      "31,41",
      "31,40",
      "31,39",
      "31,38",
      "31,37",
      "31,36",
      "31,35",
      "31,34",
      "20,39",
      "21,39",
      "22,39",
      "23,39",
      "24,39",
      "28,39",
      "29,39",
      "30,39",
      "20,38",
      "21,38",
      "22,38",
      "23,38",
      "24,38",
      "28,38",
      "29,38",
      "30,38",
      "32,35",
      "33,35",
      "34,35",
      "35,35",
      "36,35",
      "32,34",
      "33,34",
      "34,34",
      "35,34",
      "36,34",
      "29,29",
      "30,29",
      "31,29",
      "32,29",
      "33,29",
      "34,29",
      "35,29",
      "29,28",
      "30,28",
      "31,28",
      "32,28",
      "33,28",
      "34,28",
      "35,28",
      "26,33",
      "25,33",
      "24,33",
      "23,33",
      "22,33",
      "21,33",
      "20,33",
      "19,33",
      "18,33",
      "17,33",
      "16,33",
      "15,32",
      "16,32",
      "17,32",
      "18,32",
      "19,32",
      "20,32",
      "21,32",
      "22,32",
      "23,32",
      "24,32",
      "25,32",
      "26,32",
      "26,31",
      "26,30",
      "26,29",
      "26,28",
      "14,32",
      "14,34",
      "14,35",
      "14,36",
      "14,37",
      "14,38",
      "14,39",
      "14,40",
      "13,41",
      "12,41",
      "11,41",
      "10,41",
      "10,40",
      "11,40",
      "12,40",
      "13,40",
      "14,41",
      "14,33",
      "15,33",
      "11,29",
      "12,29",
      "13,29",
      "14,29",
      "15,29",
      "16,29",
      "17,29",
      "18,29",
      "19,29",
      "20,29",
      "21,29",
      "22,29",
      "23,29",
      "24,29",
      "24,28",
      "23,28",
      "22,28",
      "21,28",
      "20,28",
      "19,28",
      "18,28",
      "17,28",
      "16,28",
      "15,28",
      "14,28",
      "13,28",
      "12,28",
      "11,28",
      "25,28",
      "25,29",
      "10,28",
      "10,29",
      "10,30",
      "10,31",
      "10,32",
      "10,33",
      "10,34",
      "10,35",
      "10,36",
      "10,37",
      "10,38",
      "10,39",
      "6,40",
      "6,39",
      "6,38",
      "6,37",
      "6,36",
      "5,36",
      "4,36",
      "3,36",
      "2,36",
      "1,36",
      "2,37",
      "3,37",
      "4,37",
      "5,37",
      "1,37",
      "1,38",
      "1,39",
      "1,40",
      "1,41",
      "1,42",
      "1,43",
      "1,44",
      "1,45",
      "1,46",
      "1,47",
      "1,48",
      "1,49",
      "0,51",
      "0,50",
      "0,49",
      "0,48",
      "0,47",
      "0,46",
      "0,45",
      "0,44",
      "0,43",
      "0,42",
      "0,41",
      "0,40",
      "0,39",
      "0,38",
      "0,37",
      "0,36",
      "0,52",
      "1,52",
      "2,52",
      "3,52",
      "4,52",
      "5,52",
      "6,52",
      "7,52",
      "8,52",
      "0,53",
      "1,53",
      "2,53",
      "3,53",
      "4,53",
      "5,53",
      "6,53",
      "7,53",
      "8,53",
      "8,49",
      "8,50",
      "8,51",
      "9,49",
      "9,50",
      "9,51",
      "9,52",
      "9,53",
      "9,54",
      "9,55",
      "1,54",
      "2,54",
      "3,54",
      "4,54",
      "5,54",
      "6,54",
      "7,54",
      "8,54",
      "0,54",
      "0,55",
      "0,56",
      "1,56",
      "1,57",
      "2,57",
      "3,57",
      "4,57",
      "5,57",
      "6,57",
      "7,57",
      "8,57",
      "9,57",
      "8,56",
      "7,56",
      "6,56",
      "5,56",
      "4,56",
      "3,56",
      "2,56",
      "1,55",
      "2,55",
      "3,55",
      "4,55",
      "5,55",
      "6,55",
      "7,55",
      "8,55",
      "9,56",
      "0,57",
      "22,51",
      "23,51",
      "24,51",
      "25,51",
      "26,51",
      "27,51",
      "28,51",
      "29,51",
      "30,51",
      "31,51",
      "32,51",
      "33,51",
      "34,51",
      "35,51",
      "36,51",
      "36,52",
      "35,52",
      "34,52",
      "33,52",
      "32,52",
      "31,52",
      "30,52",
      "29,52",
      "28,52",
      "27,52",
      "26,52",
      "25,52",
      "24,52",
      "23,52",
      "22,53",
      "22,54",
      "22,55",
      "22,56",
      "22,57",
      "22,52",
      "23,53",
      "23,54",
      "23,55",
      "23,56",
      "24,54",
      "36,54",
      "35,55",
      "34,55",
      "32,54",
      "33,54",
      "24,53",
      "34,54",
      "30,54",
      "29,54",
      "25,53",
      "26,53",
      "27,53",
      "28,54",
      "25,55",
      "26,54",
      "27,54",
      "27,55",
      "26,56",
      "25,56",
      "25,57",
      "24,55",
      "23,57",
      "24,57",
      "24,56",
      "25,54",
      "26,55",
      "28,53",
      "29,53",
      "30,53",
      "32,53",
      "33,53",
      "34,53",
      "35,53",
      "31,53",
      "31,54",
      "31,56",
      "31,57",
      "26,57",
      "27,57",
      "28,57",
      "29,57",
      "30,57",
      "27,56",
      "28,56",
      "29,56",
      "28,55",
      "29,55",
      "30,56",
      "33,55",
      "32,55",
      "31,55",
      "30,55",
      "32,56",
      "33,57",
      "34,57",
      "35,57",
      "36,56",
      "35,56",
      "34,56",
      "33,56",
      "32,57",
      "36,57",
      "36,55",
      "36,53",
      "35,54",
      "37,42",
      "38,57",
      "38,54",
      "38,53",
      "38,47",
      "37,43",
      "37,44",
      "37,45",
      "37,46",
      "37,47",
      "37,51",
      "37,50",
      "38,48",
      "38,49",
      "38,50",
      "38,51",
      "38,52",
      "37,48",
      "37,49",
      "37,52",
      "37,53",
      "37,54",
      "38,55",
      "37,57",
      "37,55",
      "37,56",
      "39,56",
      "39,57",
      "38,56",
      "39,55",
      "39,54",
      "39,53",
      "39,52",
      "39,51",
      "39,50",
      "39,49",
      "39,48",
      "39,47",
      "39,46",
      "39,45",
      "39,44",
      "39,43",
      "39,42",
      "39,41",
      "39,40",
      "38,46",
      "38,45",
      "38,44",
      "38,43",
      "38,42",
      "38,41",
      "38,40",
      "32,41",
      "33,41",
      "34,41",
      "35,41",
      "36,41",
      "37,41",
      "37,40",
      "36,40",
      "35,40",
      "34,40",
      "33,40",
      "32,39",
      "32,38",
      "32,37",
      "32,36",
      "32,40",
      "33,36",
      "34,36",
      "35,36",
      "36,36",
      "37,36",
      "33,37",
      "34,37",
      "35,37",
      "36,37",
      "37,37",
      "33,38",
      "34,38",
      "35,38",
      "36,38",
      "37,38",
      "33,39",
      "34,39",
      "35,39",
      "36,39",
      "37,39",
      "38,39",
      "39,39",
      "38,38",
      "39,38",
      "39,37",
      "39,36",
      "39,35",
      "39,34",
      "38,34",
      "38,33",
      "39,31",
      "39,30",
      "39,32",
      "39,33",
      "38,37",
      "38,36",
      "38,35",
      "37,35",
      "37,34",
      "37,33",
      "38,30",
      "38,29",
      "38,28",
      "38,27",
      "38,32",
      "37,32",
      "37,31",
      "37,30",
      "37,29",
      "37,28",
      "37,27",
      "38,31",
      "36,28",
      "36,29",
      "36,30",
      "36,31",
      "36,32",
      "36,33",
      "36,27",
      "34,26",
      "35,26",
      "36,26",
      "37,26",
      "38,26",
      "39,26",
      "39,28",
      "39,27",
      "39,29",
      "31,27",
      "32,27",
      "33,27",
      "34,27",
      "35,27",
      "31,26",
      "31,24",
      "31,23",
      "27,25",
      "28,25",
      "29,25",
      "30,25",
      "27,24",
      "28,24",
      "29,24",
      "30,24",
      "31,25",
      "32,26",
      "33,26",
      "32,24",
      "32,25",
      "33,25",
      "34,25",
      "35,25",
      "36,25",
      "37,25",
      "38,25",
      "39,25",
      "33,24",
      "34,24",
      "35,24",
      "36,24",
      "37,24",
      "38,24",
      "39,24",
      "32,23",
      "33,23",
      "34,23",
      "35,23",
      "36,23",
      "38,23",
      "39,23",
      "30,22",
      "31,22",
      "32,22",
      "33,22",
      "34,22",
      "35,22",
      "37,23",
      "36,22",
      "37,22",
      "38,22",
      "30,21",
      "31,21",
      "32,21",
      "33,21",
      "35,21",
      "36,21",
      "37,21",
      "38,21",
      "34,21",
      "35,20",
      "36,20",
      "37,20",
      "38,20",
      "39,20",
      "35,19",
      "36,19",
      "37,19",
      "38,19",
      "39,19",
      "39,21",
      "39,22",
      "35,7",
      "35,8",
      "35,11",
      "35,12",
      "35,13",
      "35,14",
      "35,15",
      "35,16",
      "35,17",
      "36,17",
      "35,18",
      "36,18",
      "37,18",
      "38,18",
      "39,18",
      "37,17",
      "38,17",
      "39,17",
      "36,16",
      "37,16",
      "38,16",
      "39,16",
      "36,15",
      "37,15",
      "38,15",
      "39,15",
      "37,14",
      "38,14",
      "39,14",
      "36,14",
      "35,10",
      "35,9",
      "36,9",
      "36,10",
      "36,11",
      "36,12",
      "36,13",
      "37,13",
      "38,13",
      "39,13",
      "37,12",
      "38,12",
      "39,12",
      "37,11",
      "38,11",
      "37,10",
      "38,10",
      "39,10",
      "39,11",
      "37,9",
      "38,9",
      "39,9",
      "38,8",
      "39,8",
      "36,7",
      "36,8",
      "37,8",
      "37,7",
      "38,7",
      "39,7",
      "39,6",
      "38,6",
      "37,6",
      "36,6",
      "35,6",
      "35,5",
      "35,4",
      "36,4",
      "36,5",
      "37,5",
      "38,5",
      "39,5",
      "39,4",
      "38,4",
      "37,4",
      "37,3",
      "35,3",
      "36,2",
      "36,1",
      "37,1",
      "38,1",
      "38,2",
      "39,3",
      "39,1",
      "39,0",
      "34,0",
      "33,0",
      "32,0",
      "29,1",
      "30,1",
      "31,1",
      "32,1",
      "33,1",
      "34,1",
      "35,1",
      "35,0",
      "36,0",
      "37,0",
      "38,0",
      "39,2",
      "38,3",
      "37,2",
      "36,3",
      "35,2",
      "29,0",
      "31,0",
      "30,0",
      "28,0",
      "28,1",
      "28,2",
      "29,2",
      "30,2",
      "31,2",
      "32,2",
      "33,2",
      "34,2",
      "34,3",
      "34,4",
      "33,3",
      "32,3",
      "31,3",
      "31,4",
      "30,4",
      "29,4",
      "28,4",
      "27,4",
      "28,3",
      "29,3",
      "30,3",
      "33,4",
      "32,4",
      "34,5",
      "33,5",
      "32,5",
      "31,5",
      "30,5",
      "29,5",
      "28,5",
      "27,5",
      "26,5",
      "25,5",
      "24,5",
      "23,5",
      "22,5",
      "21,5",
      "16,0",
      "17,0",
      "18,0",
      "19,0",
      "20,0",
      "21,0",
      "22,0",
      "23,0",
      "24,0",
      "25,0",
      "26,0",
      "27,0",
      "27,1",
      "27,2",
      "27,3",
      "26,3",
      "25,3",
      "24,3",
      "23,3",
      "22,3",
      "21,3",
      "20,3",
      "19,3",
      "18,3",
      "17,3",
      "16,3",
      "16,2",
      "17,2",
      "18,2",
      "19,2",
      "20,2",
      "21,2",
      "22,2",
      "23,2",
      "24,2",
      "25,2",
      "25,1",
      "24,1",
      "23,1",
      "22,1",
      "21,1",
      "20,1",
      "19,1",
      "18,1",
      "17,1",
      "16,1",
      "15,1",
      "26,1",
      "26,2",
      "26,4",
      "25,4",
      "24,4",
      "23,4",
      "22,4",
      "21,4",
      "15,5",
      "15,4",
      "16,4",
      "17,4",
      "18,4",
      "19,4",
      "20,4",
      "20,5",
      "19,5",
      "18,5",
      "17,5",
      "16,5",
      "15,3",
      "15,2",
      "15,0",
      "14,0",
      "14,1",
      "14,2",
      "14,3",
      "14,4",
      "14,5",
      "14,6",
      "14,7",
      "14,8",
      "15,8",
      "15,9",
      "15,10",
      "15,11",
      "15,12",
      "15,13",
      "14,13",
      "13,13",
      "11,13",
      "10,13",
      "11,12",
      "11,11",
      "11,10",
      "11,9",
      "11,8",
      "11,7",
      "11,6",
      "11,5",
      "11,4",
      "11,3",
      "11,2",
      "11,1",
      "11,0",
      "12,0",
      "13,1",
      "13,2",
      "13,3",
      "13,4",
      "13,5",
      "13,6",
      "13,7",
      "13,8",
      "13,9",
      "13,10",
      "13,11",
      "13,12",
      "12,11",
      "12,10",
      "12,9",
      "12,8",
      "12,7",
      "12,6",
      "12,5",
      "12,4",
      "12,3",
      "12,2",
      "12,1",
      "13,0",
      "15,6",
      "15,7",
      "14,9",
      "14,10",
      "14,11",
      "14,12",
      "12,12",
      "12,13",
      "22,9",
      "23,9",
      "24,9",
      "25,9",
      "26,9",
      "27,9",
      "28,9",
      "29,11",
      "28,11",
      "29,9",
      "29,10",
      "27,10",
      "28,10",
      "29,8",
      "28,8",
      "27,8",
      "26,8",
      "25,8",
      "24,8",
      "23,8",
      "22,8",
      "21,8",
      "20,8",
      "20,9",
      "21,9",
      "26,10",
      "25,10",
      "24,10",
      "23,10",
      "23,11",
      "22,11",
      "21,11",
      "20,10",
      "22,10",
      "21,10",
      "20,15",
      "20,11",
      "20,12",
      "20,13",
      "21,12",
      "21,13",
      "21,14",
      "21,15",
      "21,16",
      "21,17",
      "22,13",
      "22,14",
      "22,15",
      "22,16",
      "22,17",
      "22,18",
      "23,12",
      "23,13",
      "23,14",
      "23,15",
      "23,16",
      "23,17",
      "23,19",
      "22,12",
      "20,14",
      "24,11",
      "25,11",
      "26,11",
      "27,11",
      "24,12",
      "25,12",
      "26,12",
      "27,12",
      "28,12",
      "24,13",
      "25,13",
      "26,13",
      "27,13",
      "28,13",
      "29,13",
      "29,14",
      "29,15",
      "29,12",
      "23,18",
      "24,18",
      "25,18",
      "26,18",
      "27,18",
      "28,18",
      "29,18",
      "30,18",
      "30,19",
      "30,20",
      "29,19",
      "28,19",
      "27,19",
      "26,19",
      "25,19",
      "24,19",
      "21,20",
      "22,20",
      "23,20",
      "24,20",
      "25,20",
      "26,20",
      "27,20",
      "28,20",
      "29,20",
      "29,21",
      "28,21",
      "27,21",
      "26,21",
      "25,21",
      "24,21",
      "23,21",
      "22,21",
      "21,21",
      "21,22",
      "22,22",
      "23,22",
      "24,22",
      "25,22",
      "26,22",
      "27,22",
      "28,22",
      "29,22",
      "30,23",
      "29,23",
      "28,23",
      "27,23",
      "26,23",
      "25,23",
      "24,23",
      "23,23",
      "22,23",
      "21,23",
      "20,16",
      "20,17",
      "20,18",
      "20,19",
      "20,20",
      "20,21",
      "20,22",
      "20,24",
      "21,18",
      "21,19",
      "22,19",
      "20,23",
      "2,0",
      "1,0",
      "0,0",
      "3,0",
      "4,0",
      "5,0",
      "6,0",
      "7,0",
      "8,0",
      "9,0",
      "10,0",
      "10,1",
      "9,1",
      "8,1",
      "7,1",
      "6,1",
      "5,1",
      "4,1",
      "3,1",
      "2,1",
      "1,1",
      "0,1",
      "1,2",
      "2,2",
      "3,2",
      "0,2",
      "9,2",
      "10,2",
      "10,3",
      "10,4",
      "9,4",
      "9,3",
      "3,3",
      "3,4",
      "0,3",
      "1,3",
      "2,3",
      "0,4",
      "1,4",
      "2,4",
      "0,5",
      "0,6",
      "0,7",
      "0,8",
      "0,9",
      "0,10",
      "1,10",
      "2,10",
      "1,9",
      "2,9",
      "3,10",
      "3,11",
      "3,12",
      "3,13",
      "3,14",
      "3,15",
      "3,16",
      "2,16",
      "2,17",
      "3,17",
      "3,18",
      "4,18",
      "4,17",
      "5,17",
      "6,17",
      "7,17",
      "8,17",
      "8,18",
      "9,18",
      "9,17",
      "10,17",
      "11,17",
      "12,17",
      "13,17",
      "14,17",
      "15,17",
      "10,18",
      "11,18",
      "12,18",
      "13,18",
      "14,18",
      "15,18",
      "5,18",
      "6,18",
      "7,18",
      "2,20",
      "5,20",
      "6,20",
      "7,20",
      "8,20",
      "9,20",
      "10,20",
      "11,20",
      "12,20",
      "13,20",
      "14,20",
      "15,20",
      "15,19",
      "2,19",
      "3,19",
      "4,19",
      "5,19",
      "6,19",
      "7,19",
      "8,19",
      "9,19",
      "10,19",
      "11,19",
      "12,19",
      "13,19",
      "14,19",
      "15,21",
      "14,21",
      "13,21",
      "12,21",
      "11,21",
      "10,21",
      "9,21",
      "8,21",
      "7,21",
      "6,21",
      "6,22",
      "5,22",
      "4,22",
      "3,22",
      "3,21",
      "4,21",
      "5,21",
      "3,20",
      "4,20",
      "0,11",
      "0,12",
      "0,13",
      "0,14",
      "0,15",
      "0,16",
      "0,17",
      "0,18",
      "0,19",
      "0,20",
      "0,21",
      "0,22",
      "0,23",
      "1,11",
      "1,12",
      "1,13",
      "1,14",
      "1,15",
      "1,16",
      "1,17",
      "1,18",
      "1,19",
      "1,20",
      "1,21",
      "1,22",
      "1,23",
      "1,24",
      "2,11",
      "2,12",
      "2,13",
      "2,14",
      "2,15",
      "2,18",
      "2,22",
      "2,23",
      "2,24",
      "2,21",
      "7,22",
      "8,22",
      "9,22",
      "10,22",
      "11,22",
      "12,22",
      "13,22",
      "14,22",
      "15,22",
      "21,24",
      "22,24",
      "23,24",
      "24,24",
      "25,24",
      "20,25",
      "21,25",
      "22,25",
      "23,25",
      "24,25",
      "25,25",
      "11,30",
      "11,31",
      "11,32",
      "11,33",
      "11,34",
      "11,35",
      "11,36",
      "11,37",
      "11,38",
      "11,39",
      "12,37",
      "12,36",
      "12,35",
      "12,34",
      "12,33",
      "12,32",
      "12,31",
      "12,30",
      "13,30",
      "13,31",
      "13,32",
      "13,33",
      "13,34",
      "13,35",
      "13,36",
      "13,37",
      "12,39",
      "12,38",
      "13,39",
      "13,38",
      "14,30",
      "15,30",
      "16,30",
      "17,30",
      "18,30",
      "19,30",
      "20,30",
      "21,30",
      "22,30",
      "23,30",
      "24,30",
      "25,30",
      "14,31",
      "15,31",
      "16,31",
      "17,31",
      "18,31",
      "19,31",
      "20,31",
      "21,31",
      "22,31",
      "23,31",
      "24,31",
      "25,31",
      "0,24",
      "0,25",
      "0,26",
      "0,27",
      "0,28",
      "0,29",
      "0,30",
      "0,31",
      "0,32",
      "0,33",
      "0,34",
      "0,35",
      "1,25",
      "1,26",
      "1,27",
      "1,28",
      "1,29",
      "1,30",
      "1,31",
      "1,32",
      "1,33",
      "1,35",
      "2,26",
      "2,27",
      "2,28",
      "2,29",
      "2,30",
      "2,31",
      "2,32",
      "2,33",
      "2,34",
      "1,34",
      "2,35",
      "3,35",
      "4,35",
      "6,35",
      "6,34",
      "6,33",
      "6,32",
      "6,31",
      "6,30",
      "3,30",
      "3,31",
      "3,32",
      "3,33",
      "3,34",
      "4,34",
      "4,33",
      "4,32",
      "4,31",
      "4,30",
      "5,31",
      "5,32",
      "5,33",
      "5,34",
      "2,25",
      "5,35",
      "5,30",
      "7,33",
      "7,32",
      "9,32",
      "9,33",
      "6,12",
      "7,12",
      "8,12",
      "9,12",
      "10,12",
      "6,13",
      "7,13",
      "8,13",
      "9,13",
      "4,13",
      "4,12",
      "9,10",
      "10,10",
      "8,11",
      "9,11",
      "10,11",
      "8,9",
      "8,10",
      "9,9",
      "10,9",
      "3,9",
      "16,11",
      "17,11",
      "17,10",
      "16,10",
      "19,10",
      "19,11",
      "24,40",
      "24,41",
      "24,42",
      "24,43",
      "24,44",
      "24,45",
      "25,45",
      "25,44",
      "26,45",
      "26,27",
      "26,26",
      "26,25",
      "26,24",
      "18,39",
      "19,39",
      "19,38",
      "10,58",
      "11,58",
      "12,58",
      "13,58",
      "14,58",
      "15,58",
      "16,58",
      "17,58",
      "18,58",
      "19,58",
      "20,58",
      "21,58",
      "20,56",
      "15,57",
      "16,57",
      "6,2",
      "7,2",
      "8,2",
      "5,2",
      "4,2"
    ],
    "breakable": [],
    "coreSpots": [
      "33,16"
    ],
    "spawnZone": [
      "2,6",
      "3,6",
      "4,6",
      "5,6",
      "6,6",
      "7,6",
      "8,6",
      "2,7",
      "3,7",
      "4,7",
      "5,7",
      "6,7",
      "7,7",
      "8,7",
      "9,7",
      "9,6",
      "5,8",
      "5,9",
      "5,10",
      "6,8",
      "6,9",
      "6,10",
      "5,15",
      "6,15",
      "7,15",
      "8,15",
      "9,15",
      "10,15",
      "11,15",
      "12,15",
      "13,15",
      "6,14",
      "7,14",
      "8,14",
      "9,14",
      "10,14",
      "11,14",
      "12,14",
      "13,14",
      "17,7",
      "17,8",
      "18,8",
      "19,8",
      "19,7",
      "18,7",
      "21,6",
      "22,6",
      "23,6",
      "24,6",
      "25,6",
      "26,6",
      "27,6",
      "28,6",
      "31,6",
      "31,7",
      "31,8",
      "31,9",
      "31,10",
      "31,11",
      "31,12",
      "31,13",
      "31,14",
      "32,15",
      "32,14",
      "33,14",
      "34,14",
      "34,13",
      "34,12",
      "34,11",
      "34,10",
      "34,9",
      "33,8",
      "33,7",
      "32,7",
      "32,6",
      "32,8",
      "32,9",
      "32,10",
      "32,11",
      "32,12",
      "32,13",
      "33,12",
      "33,11",
      "33,10",
      "33,9",
      "33,13",
      "25,15",
      "25,16",
      "26,16",
      "27,16",
      "27,15",
      "26,15",
      "31,17",
      "32,17",
      "33,18",
      "32,18",
      "33,17",
      "33,19",
      "32,19",
      "31,18",
      "31,16",
      "32,16",
      "33,15",
      "34,15",
      "34,16",
      "34,17",
      "34,18",
      "34,19",
      "18,15",
      "18,16",
      "18,17",
      "18,18",
      "17,19",
      "17,20",
      "18,21",
      "18,22",
      "18,23",
      "17,23",
      "17,24",
      "16,23",
      "16,22",
      "16,21",
      "17,18",
      "17,17",
      "17,16",
      "17,15",
      "17,14",
      "17,13",
      "18,13",
      "19,13",
      "19,14",
      "19,15",
      "19,16",
      "19,17",
      "19,18",
      "19,19",
      "19,20",
      "19,21",
      "19,22",
      "19,23",
      "19,24",
      "18,24",
      "17,22",
      "17,21",
      "18,20",
      "18,19",
      "18,14",
      "16,13",
      "16,18",
      "16,19",
      "16,20",
      "15,14",
      "16,14",
      "16,15",
      "16,16",
      "16,17",
      "5,24",
      "6,24",
      "7,24",
      "8,24",
      "10,24",
      "11,24",
      "13,24",
      "14,24",
      "14,25",
      "13,25",
      "12,26",
      "11,26",
      "10,26",
      "7,26",
      "6,26",
      "6,25",
      "5,25",
      "4,25",
      "9,24",
      "12,25",
      "10,25",
      "9,25",
      "8,25",
      "7,25",
      "11,25",
      "4,24",
      "4,26",
      "5,26",
      "9,26",
      "12,24",
      "13,26",
      "14,26",
      "8,26",
      "8,27",
      "8,28",
      "8,29",
      "8,30",
      "9,29",
      "9,28",
      "9,27",
      "9,30",
      "4,27",
      "5,27",
      "6,27",
      "7,27",
      "2,38",
      "2,39",
      "2,40",
      "2,41",
      "2,42",
      "2,43",
      "2,44",
      "2,45",
      "3,45",
      "3,46",
      "3,47",
      "4,47",
      "4,48",
      "6,43",
      "5,42",
      "5,41",
      "5,40",
      "5,39",
      "4,39",
      "4,40",
      "4,41",
      "3,42",
      "3,43",
      "3,44",
      "4,46",
      "5,45",
      "5,44",
      "5,43",
      "4,42",
      "3,40",
      "3,39",
      "3,41",
      "5,46",
      "4,44",
      "4,43",
      "4,45",
      "2,47",
      "2,48",
      "3,48",
      "5,48",
      "8,36",
      "8,37",
      "8,38",
      "8,39",
      "8,40",
      "8,41",
      "8,42",
      "9,43",
      "10,43",
      "12,43",
      "11,43",
      "18,43",
      "19,43",
      "20,43",
      "21,43",
      "22,43",
      "23,43",
      "10,44",
      "13,44",
      "14,44",
      "15,44",
      "16,44",
      "17,44",
      "18,44",
      "15,43",
      "16,43",
      "17,43",
      "13,45",
      "12,45",
      "14,45",
      "15,45",
      "16,45",
      "17,45",
      "19,46",
      "20,46",
      "21,46",
      "22,46",
      "19,45",
      "20,45",
      "21,45",
      "22,45",
      "23,44",
      "22,44",
      "21,44",
      "20,44",
      "18,45",
      "19,44",
      "13,43",
      "14,43",
      "7,36",
      "7,37",
      "7,38",
      "7,39",
      "7,40",
      "7,41",
      "7,42",
      "16,34",
      "18,35",
      "19,35",
      "19,36",
      "19,37",
      "18,37",
      "18,38",
      "17,38",
      "17,39",
      "16,39",
      "16,38",
      "15,37",
      "15,36",
      "15,35",
      "16,35",
      "17,35",
      "18,36",
      "16,37",
      "16,36",
      "17,36",
      "17,37",
      "17,34",
      "18,34",
      "19,34",
      "20,34",
      "21,34",
      "22,34",
      "24,34",
      "25,34",
      "26,34",
      "27,34",
      "28,34",
      "21,35",
      "22,35",
      "23,35",
      "24,35",
      "26,35",
      "27,35",
      "28,35",
      "23,34",
      "28,27",
      "28,28",
      "28,29",
      "28,30",
      "28,31",
      "28,32",
      "28,33",
      "27,27",
      "27,28",
      "27,30",
      "27,31",
      "27,32",
      "27,33",
      "33,31",
      "32,31",
      "31,31",
      "30,31",
      "29,31",
      "33,30",
      "32,30",
      "31,30",
      "30,30",
      "29,30",
      "30,32",
      "30,33",
      "30,34",
      "30,35",
      "29,35",
      "29,34",
      "29,33",
      "29,32",
      "27,29",
      "28,43",
      "28,44",
      "28,45",
      "28,46",
      "28,47",
      "26,42",
      "27,42",
      "28,42",
      "29,42",
      "30,42",
      "29,44",
      "29,46",
      "29,43",
      "24,47",
      "25,47",
      "26,47",
      "27,47",
      "29,47",
      "30,47",
      "31,47",
      "32,47",
      "33,47",
      "34,47",
      "24,46",
      "25,46",
      "26,46",
      "30,46",
      "31,46",
      "32,46",
      "33,46",
      "25,41",
      "26,41",
      "27,41",
      "28,41",
      "29,41",
      "30,41",
      "19,47",
      "18,47",
      "17,47",
      "16,47",
      "15,47",
      "14,47",
      "13,47",
      "12,47",
      "11,47",
      "11,46",
      "12,46",
      "14,46",
      "15,46",
      "16,46",
      "17,46",
      "18,46",
      "11,44",
      "11,45",
      "12,44",
      "13,46",
      "10,45",
      "7,45",
      "8,45",
      "9,45"
    ],
    "coreCount": 1,
    "monsterMix": [
      {
        "id": "slime",
        "weight": 100
      },
      {
        "id": "bird_head",
        "weight": 60
      }
    ],
    "camp": [],
    "rules": {
      "money": 5000,
      "guide": 100,
      "guideRegen": 9,
      "speed": 44,
      "reward": 8
    },
    "solidOffsets": {},
    "safe": false,
    "npcs": false,
    "portals": [
      {
        "c": 4,
        "r": 3,
        "to": "map_mvtnqrs7"
      },
      {
        "c": 5,
        "r": 3,
        "to": "map_mvtnqrs7"
      },
      {
        "c": 6,
        "r": 3,
        "to": "map_mvtnqrs7"
      },
      {
        "c": 7,
        "r": 3,
        "to": "map_mvtnqrs7"
      },
      {
        "c": 8,
        "r": 3,
        "to": "map_mvtnqrs7"
      }
    ],
    "cols": 40,
    "rows": 60,
    "hiddenPickups": []
  },
  {
    "id": "map_mvtnqrs7",
    "name": "Y25區地下街",
    "desc": "",
    "layers": {
      "floor": {
        "61,72": "floor",
        "62,72": "floor",
        "63,72": "floor",
        "64,72": "floor",
        "65,72": "floor",
        "60,72": "floor",
        "62,44": "floor",
        "62,45": "floor",
        "54,45": "floor",
        "55,45": "floor",
        "56,45": "floor",
        "57,45": "floor",
        "58,45": "floor",
        "59,45": "floor",
        "60,45": "floor",
        "61,45": "floor",
        "50,48": "floor",
        "50,47": "floor",
        "50,46": "floor",
        "50,45": "floor",
        "50,44": "floor",
        "50,41": "floor",
        "50,42": "floor",
        "50,43": "floor",
        "62,43": "floor",
        "62,42": "floor",
        "62,41": "floor",
        "61,41": "floor",
        "60,41": "floor",
        "59,41": "floor",
        "59,40": "floor",
        "60,40": "floor",
        "61,40": "floor",
        "62,40": "floor",
        "60,34": "floor",
        "60,35": "floor",
        "60,36": "floor",
        "61,34": "floor",
        "61,35": "floor",
        "61,36": "floor",
        "70,43": "floor",
        "70,44": "floor",
        "70,45": "floor",
        "70,42": "floor",
        "14,40": "floor",
        "14,41": "floor",
        "14,42": "floor",
        "13,40": "floor",
        "13,41": "floor",
        "13,42": "floor",
        "12,40": "floor",
        "12,41": "floor",
        "12,42": "floor",
        "11,40": "floor",
        "11,41": "floor",
        "11,42": "floor",
        "10,40": "floor",
        "10,41": "floor",
        "10,42": "floor",
        "10,39": "floor",
        "11,39": "floor",
        "12,39": "floor",
        "13,39": "floor",
        "14,39": "floor",
        "76,30": "floor",
        "76,31": "floor",
        "76,32": "floor",
        "76,33": "floor",
        "76,34": "floor",
        "76,35": "floor",
        "76,36": "floor",
        "76,37": "floor",
        "76,38": "floor",
        "76,39": "floor",
        "76,40": "floor",
        "76,41": "floor",
        "76,42": "floor",
        "76,43": "floor",
        "76,44": "floor",
        "76,45": "floor",
        "76,46": "floor",
        "76,47": "floor",
        "76,48": "floor",
        "76,49": "floor",
        "76,50": "floor",
        "76,51": "floor",
        "76,52": "floor",
        "76,53": "floor",
        "33,37": "floor",
        "33,38": "floor",
        "33,39": "floor",
        "34,35": "floor",
        "34,36": "floor",
        "34,37": "floor",
        "34,38": "floor",
        "34,39": "floor",
        "34,40": "floor",
        "34,41": "floor",
        "5,88": "floor",
        "6,88": "floor",
        "7,88": "floor",
        "8,88": "floor",
        "9,88": "floor",
        "10,88": "floor",
        "11,88": "floor",
        "5,89": "floor",
        "6,89": "floor",
        "7,89": "floor",
        "8,89": "floor",
        "9,89": "floor",
        "10,89": "floor",
        "11,89": "floor",
        "59,27": "floor",
        "60,27": "floor",
        "61,27": "floor",
        "62,27": "floor",
        "63,27": "floor",
        "64,27": "floor",
        "65,27": "floor",
        "66,27": "floor",
        "31,88": "floor",
        "32,88": "floor",
        "33,88": "floor",
        "34,88": "floor",
        "35,88": "floor",
        "36,88": "floor",
        "37,88": "floor",
        "38,88": "floor",
        "39,88": "floor",
        "40,88": "floor",
        "41,88": "floor",
        "42,88": "floor",
        "43,88": "floor",
        "44,88": "floor",
        "44,85": "floor",
        "43,85": "floor",
        "43,86": "floor",
        "43,87": "floor",
        "44,87": "floor",
        "44,86": "floor",
        "87,69": "floor",
        "87,68": "floor",
        "87,67": "floor",
        "87,66": "floor",
        "87,65": "floor",
        "87,64": "floor",
        "87,63": "floor",
        "87,62": "floor",
        "87,61": "floor",
        "87,60": "floor",
        "87,59": "floor",
        "87,58": "floor",
        "87,57": "floor",
        "87,56": "floor",
        "87,55": "floor",
        "87,54": "floor",
        "88,52": "floor",
        "88,53": "floor",
        "88,54": "floor",
        "88,55": "floor",
        "88,56": "floor",
        "88,57": "floor",
        "88,58": "floor",
        "88,59": "floor",
        "88,60": "floor",
        "88,61": "floor",
        "88,62": "floor",
        "88,63": "floor",
        "88,64": "floor",
        "88,65": "floor",
        "88,66": "floor",
        "88,67": "floor",
        "88,68": "floor",
        "88,69": "floor",
        "80,65": "floor",
        "80,64": "floor",
        "80,63": "floor",
        "80,62": "floor",
        "80,61": "floor",
        "80,60": "floor",
        "80,59": "floor",
        "80,58": "floor",
        "80,57": "floor",
        "80,56": "floor",
        "80,55": "floor",
        "80,54": "floor",
        "80,53": "floor",
        "80,52": "floor"
      },
      "ground": {
        "30,80": "tile_dmg_debris_dust"
      },
      "ground2": {},
      "ground3": {},
      "object": {
        "21,54": "tile_mr4czvpx",
        "21,55": "tile_mr4czvpx",
        "21,56": "tile_mr4czvpx",
        "25,54": "tile_mr4czvpx",
        "25,55": "tile_mr4czvpx",
        "25,56": "tile_mr4czvpx",
        "35,54": "tile_mr4czvpx",
        "35,55": "tile_mr4czvpx",
        "35,56": "tile_mr4czvpx",
        "10,61": "tile_mr4czvpx",
        "54,40": "tile_mr4czvpx",
        "54,41": "tile_mr4czvpx",
        "54,42": "tile_mr4czvpx",
        "56,35": "tile_mr4czvpx",
        "56,34": "tile_mr4czvpx",
        "56,33": "tile_mr4czvpx",
        "56,32": "tile_mr4czvpx",
        "56,31": "tile_mr4czvpx",
        "70,49": "tile_mr4czvpx",
        "70,48": "tile_mr4czvpx",
        "70,47": "tile_mr4czvpx",
        "70,46": "tile_mr4czvpx",
        "70,45": "tile_mr4czvpx",
        "51,26": "tile_mr4czvpx",
        "51,27": "tile_mr4czvpx",
        "51,28": "tile_mr4czvpx",
        "51,29": "tile_mr4czvpx",
        "51,30": "tile_mr4czvpx",
        "51,31": "tile_mr4czvpx",
        "51,32": "tile_mr4czvpx",
        "51,33": "tile_mr4czvpx",
        "51,34": "tile_mr4czvpx",
        "51,35": "tile_mr4czvpx",
        "16,54": "tile_mr4czvpx",
        "16,55": "tile_mr4czvpx",
        "16,56": "tile_mr4czvpx",
        "1,14": "tile_mr4czvpx",
        "1,15": "tile_mr4czvpx",
        "1,16": "tile_mr4czvpx",
        "1,17": "tile_mr4czvpx",
        "1,18": "tile_mr4czvpx",
        "1,19": "tile_mr4czvpx",
        "1,20": "tile_mr4czvpx",
        "1,21": "tile_mr4czvpx",
        "1,22": "tile_mr4czvpx",
        "1,23": "tile_mr4czvpx",
        "1,24": "tile_mr4czvpx",
        "1,25": "tile_mr4czvpx",
        "1,26": "tile_mr4czvpx",
        "1,27": "tile_mr4czvpx",
        "1,28": "tile_mr4czvpx",
        "1,29": "tile_mr4czvpx",
        "1,30": "tile_mr4czvpx",
        "1,31": "tile_mr4czvpx",
        "1,32": "tile_mr4czvpx",
        "1,33": "tile_mr4czvpx",
        "1,34": "tile_mr4czvpx",
        "1,35": "tile_mr4czvpx",
        "1,36": "tile_mr4czvpx",
        "1,37": "tile_mr4czvpx",
        "1,38": "tile_mr4czvpx",
        "1,39": "tile_mr4czvpx",
        "1,40": "tile_mr4czvpx",
        "1,41": "tile_mr4czvpx",
        "1,42": "tile_mr4czvpx",
        "1,43": "tile_mr4czvpx",
        "1,44": "tile_mr4czvpx",
        "1,45": "tile_mr4czvpx",
        "1,46": "tile_mr4czvpx",
        "1,47": "tile_mr4czvpx",
        "1,48": "tile_mr4czvpx",
        "1,49": "tile_mr4czvpx",
        "1,50": "tile_mr4czvpx",
        "7,60": "tile_mr4czvpx",
        "7,59": "tile_mr4czvpx",
        "16,28": "tile_mr4czvpx",
        "35,73": "tile_obstacle_camping_lights",
        "21,52": "tile_mr4czvpx",
        "21,53": "tile_mr4czvpx",
        "16,53": "tile_mr4czvpx",
        "16,52": "tile_mr4czvpx",
        "1,13": "tile_mr4czvpx",
        "16,61": "tile_interactive_storage_locker_key",
        "24,52": "tile_interactive_storage_locker_key",
        "10,45": "tile_interactive_storage_locker_key",
        "48,34": "tile_interactive_storage_locker_key",
        "74,73": "tile_interactive_storage_locker_key",
        "68,38": "tile_interactive_storage_locker_key",
        "51,46": "tile_interactive_storage_locker_key",
        "57,8": "tile_interactive_storage_locker_key",
        "33,28": "tile_interactive_storage_locker_key",
        "2,26": "tile_interactive_storage_locker_key",
        "18,17": "tile_interactive_storage_locker_key",
        "15,73": "tile_interactive_storage_locker_key",
        "38,69": "tile_interactive_storage_locker_key",
        "53,59": "tile_interactive_storage_locker_key",
        "5,73": "tile_obstacle_ore_small",
        "43,62": "tile_obstacle_ore_small",
        "13,52": "tile_obstacle_ore_small",
        "30,37": "tile_obstacle_ore_small",
        "6,76": "tile_interactive_storage_locker_key",
        "43,83": "tile_obstacle_ore_small",
        "8,34": "tile_mr4czvpx",
        "8,33": "tile_mr4czvpx",
        "8,32": "tile_mr4czvpx",
        "8,31": "tile_mr4czvpx",
        "8,30": "tile_mr4czvpx",
        "8,29": "tile_mr4czvpx",
        "8,28": "tile_mr4czvpx",
        "8,27": "tile_mr4czvpx",
        "8,26": "tile_mr4czvpx",
        "8,25": "tile_mr4czvpx",
        "8,24": "tile_mr4czvpx",
        "8,23": "tile_mr4czvpx",
        "8,22": "tile_mr4czvpx",
        "8,21": "tile_mr4czvpx",
        "8,20": "tile_mr4czvpx",
        "8,19": "tile_mr4czvpx",
        "8,18": "tile_mr4czvpx",
        "8,17": "tile_mr4czvpx",
        "8,16": "tile_mr4czvpx",
        "8,15": "tile_mr4czvpx",
        "8,14": "tile_mr4czvpx",
        "8,13": "tile_mr4czvpx",
        "80,61": "tile_mr4czvpx",
        "80,60": "tile_mr4czvpx",
        "80,59": "tile_mr4czvpx",
        "80,58": "tile_mr4czvpx",
        "80,57": "tile_mr4czvpx",
        "80,56": "tile_mr4czvpx",
        "80,55": "tile_mr4czvpx",
        "80,54": "tile_mr4czvpx",
        "88,54": "tile_mr4czvpx",
        "88,55": "tile_mr4czvpx",
        "88,56": "tile_mr4czvpx",
        "88,57": "tile_mr4czvpx",
        "88,58": "tile_mr4czvpx",
        "88,59": "tile_mr4czvpx",
        "88,60": "tile_mr4czvpx",
        "88,61": "tile_mr4czvpx",
        "88,62": "tile_mr4czvpx",
        "88,63": "tile_mr4czvpx",
        "88,64": "tile_mr4czvpx",
        "88,65": "tile_mr4czvpx",
        "88,66": "tile_mr4czvpx"
      },
      "object2": {
        "3,73": "tile_interactive_pickup_graffiti_black",
        "72,63": "tile_interactive_pickup_almond_water",
        "48,75": "tile_interactive_pickup_battery",
        "64,63": "tile_interactive_pickup_battery",
        "36,53": "tile_interactive_pickup_battery",
        "57,45": "tile_interactive_pickup_battery",
        "17,33": "tile_interactive_pickup_battery",
        "45,28": "tile_interactive_pickup_battery",
        "43,58": "tile_interactive_pickup_graffiti_black",
        "12,52": "tile_interactive_pickup_graffiti_black",
        "40,16": "tile_interactive_pickup_graffiti_black",
        "60,79": "tile_obstacle_ore_small",
        "66,84": "tile_obstacle_ore_small",
        "53,75": "tile_obstacle_ore_small",
        "65,61": "tile_obstacle_ore_small",
        "37,67": "tile_obstacle_ore_small",
        "33,73": "tile_interactive_pickup_almond_water",
        "24,73": "tile_obstacle_ore_small",
        "32,85": "tile_interactive_pickup_adrenaline",
        "82,65": "tile_interactive_storage_locker_key",
        "71,44": "tile_interactive_storage_locker_key",
        "87,62": "tile_interactive_storage_locker_key",
        "56,70": "tile_interactive_storage_locker_key"
      },
      "object3": {},
      "object4": {
        "2,19": "tile_interactive_pickup_battery",
        "7,21": "tile_interactive_pickup_almond_water",
        "25,28": "tile_interactive_pickup_almond_water",
        "62,47": "tile_interactive_pickup_almond_water",
        "50,37": "tile_interactive_pickup_almond_water",
        "65,82": "tile_interactive_pickup_almond_water",
        "6,13": "tile_interactive_storage_locker_key"
      },
      "overlay": {},
      "top": {
        "2,73": "tile_mr4czvpx",
        "2,74": "tile_mr4czvpx",
        "5,79": "tile_mr4czvpx",
        "5,80": "tile_mr4czvpx",
        "5,81": "tile_mr4czvpx",
        "5,82": "tile_mr4czvpx",
        "5,83": "tile_mr4czvpx",
        "5,85": "tile_mr4czvpx",
        "5,86": "tile_mr4czvpx",
        "5,87": "tile_mr4czvpx",
        "5,84": "tile_mr4czvpx",
        "11,86": "tile_mr4czvpx",
        "11,87": "tile_mr4czvpx",
        "44,81": "tile_mr4czvpx",
        "44,80": "tile_mr4czvpx",
        "44,79": "tile_mr4czvpx",
        "44,78": "tile_mr4czvpx",
        "44,77": "tile_mr4czvpx",
        "44,76": "tile_mr4czvpx",
        "44,75": "tile_mr4czvpx",
        "44,74": "tile_mr4czvpx",
        "44,73": "tile_mr4czvpx",
        "44,72": "tile_mr4czvpx",
        "44,71": "tile_mr4czvpx",
        "44,70": "tile_mr4czvpx",
        "44,69": "tile_mr4czvpx",
        "44,68": "tile_mr4czvpx",
        "36,67": "tile_mr4czvpx",
        "36,68": "tile_mr4czvpx",
        "44,64": "tile_mr4czvpx",
        "44,65": "tile_mr4czvpx",
        "44,66": "tile_mr4czvpx",
        "44,67": "tile_mr4czvpx",
        "56,64": "tile_mr4czvpx",
        "56,65": "tile_mr4czvpx",
        "56,66": "tile_mr4czvpx",
        "60,67": "tile_mr4czvpx",
        "53,83": "tile_mr4czvpx",
        "47,70": "tile_mr4czvpx",
        "47,71": "tile_mr4czvpx",
        "47,72": "tile_mr4czvpx",
        "47,73": "tile_mr4czvpx",
        "47,74": "tile_mr4czvpx",
        "50,53": "tile_mr4czvpx",
        "63,53": "tile_mr4czvpx",
        "42,50": "tile_mr4czvpx",
        "42,51": "tile_mr4czvpx",
        "42,52": "tile_mr4czvpx",
        "42,53": "tile_mr4czvpx",
        "42,54": "tile_mr4czvpx",
        "34,36": "tile_mr4czvpx",
        "34,35": "tile_mr4czvpx",
        "17,13": "tile_mr4czvpx",
        "17,12": "tile_mr4czvpx",
        "17,11": "tile_mr4czvpx",
        "17,10": "tile_mr4czvpx",
        "26,11": "tile_mr4czvpx",
        "26,12": "tile_mr4czvpx",
        "26,13": "tile_mr4czvpx",
        "26,10": "tile_mr4czvpx",
        "5,88": "tile_mr4czvpx",
        "5,89": "tile_mr4czvpx",
        "11,88": "tile_mr4czvpx",
        "11,89": "tile_mr4czvpx",
        "7,51": "tile_mr4czvpx",
        "7,50": "tile_mr4czvpx",
        "30,59": "tile_mr4czvpx",
        "30,60": "tile_mr4czvpx",
        "30,61": "tile_mr4czvpx",
        "30,62": "tile_mr4czvpx",
        "30,63": "tile_mr4czvpx",
        "16,50": "tile_mr4czvpx",
        "16,51": "tile_mr4czvpx",
        "12,47": "tile_mr4czvpx",
        "12,46": "tile_mr4czvpx",
        "12,45": "tile_mr4czvpx",
        "44,82": "tile_mr4czvpx",
        "44,83": "tile_mr4czvpx",
        "80,53": "tile_mr4czvpx",
        "80,52": "tile_mr4czvpx",
        "88,53": "tile_mr4czvpx",
        "88,52": "tile_mr4czvpx",
        "80,35": "tile_mr4czvpx",
        "80,36": "tile_mr4czvpx",
        "80,37": "tile_mr4czvpx",
        "80,38": "tile_mr4czvpx",
        "80,39": "tile_mr4czvpx",
        "80,40": "tile_mr4czvpx",
        "80,41": "tile_mr4czvpx",
        "80,42": "tile_mr4czvpx",
        "80,43": "tile_mr4czvpx",
        "88,35": "tile_mr4czvpx",
        "88,36": "tile_mr4czvpx",
        "88,37": "tile_mr4czvpx",
        "88,38": "tile_mr4czvpx",
        "88,39": "tile_mr4czvpx",
        "88,40": "tile_mr4czvpx",
        "88,41": "tile_mr4czvpx",
        "88,42": "tile_mr4czvpx",
        "88,43": "tile_mr4czvpx"
      },
      "ground4": {
        "62,26": "floor",
        "63,26": "floor",
        "64,26": "floor",
        "62,25": "floor",
        "63,25": "floor",
        "64,25": "floor",
        "62,24": "floor",
        "63,24": "floor",
        "64,24": "floor",
        "62,23": "floor",
        "63,23": "floor",
        "64,23": "floor",
        "62,22": "floor",
        "63,22": "floor",
        "64,22": "floor",
        "65,22": "floor",
        "66,22": "floor",
        "62,21": "floor",
        "63,21": "floor",
        "64,21": "floor",
        "65,21": "floor",
        "66,21": "floor",
        "67,21": "floor",
        "67,22": "floor",
        "68,22": "floor",
        "69,22": "floor",
        "69,21": "floor",
        "68,21": "floor",
        "71,21": "floor",
        "70,22": "floor",
        "70,21": "floor",
        "71,22": "floor",
        "69,20": "floor",
        "70,20": "floor",
        "71,18": "floor",
        "71,19": "floor",
        "71,20": "floor",
        "69,14": "floor",
        "69,15": "floor",
        "69,16": "floor",
        "69,17": "floor",
        "70,14": "floor",
        "71,14": "floor",
        "71,15": "floor",
        "71,16": "floor",
        "71,17": "floor",
        "70,17": "floor",
        "70,16": "floor",
        "70,15": "floor",
        "69,10": "floor",
        "69,11": "floor",
        "69,12": "floor",
        "69,13": "floor",
        "70,10": "floor",
        "71,10": "floor",
        "71,11": "floor",
        "71,12": "floor",
        "71,13": "floor",
        "70,13": "floor",
        "70,12": "floor",
        "70,11": "floor",
        "61,20": "floor",
        "62,20": "floor",
        "63,20": "floor",
        "64,20": "floor",
        "65,20": "floor",
        "66,20": "floor",
        "67,20": "floor",
        "68,20": "floor",
        "61,21": "floor",
        "61,22": "floor",
        "62,19": "floor",
        "63,19": "floor",
        "64,19": "floor",
        "65,19": "floor",
        "66,19": "floor",
        "67,19": "floor",
        "68,19": "floor",
        "69,19": "floor",
        "70,19": "floor",
        "62,18": "floor",
        "63,18": "floor",
        "64,18": "floor",
        "65,18": "floor",
        "66,18": "floor",
        "67,18": "floor",
        "68,18": "floor",
        "69,18": "floor",
        "70,18": "floor",
        "61,18": "floor",
        "61,19": "floor"
      },
      "object5": {
        "61,20": "tile_mr4czvpx",
        "68,15": "tile_mr4czvpx",
        "68,13": "tile_mr4czvpx",
        "68,12": "tile_mr4czvpx",
        "72,12": "tile_mr4czvpx",
        "72,13": "tile_mr4czvpx",
        "72,14": "tile_mr4czvpx",
        "72,15": "tile_mr4czvpx",
        "72,16": "tile_mr4czvpx",
        "72,17": "tile_mr4czvpx",
        "72,18": "tile_mr4czvpx",
        "68,14": "tile_mr4czvpx",
        "65,23": "tile_mr4czvpx"
      },
      "object6": {}
    },
    "stamps": [
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 15,
        "r": 76,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 18,
        "r": 76,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 18,
        "r": 73,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 12,
        "r": 76,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 15,
        "r": 73,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 12,
        "r": 73,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 21,
        "r": 73,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 21,
        "r": 76,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 24,
        "r": 73,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 24,
        "r": 76,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 27,
        "r": 76,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 9,
        "r": 76,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 9,
        "r": 73,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 6,
        "r": 73,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 6,
        "r": 76,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 3,
        "r": 76,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 3,
        "r": 73,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 27,
        "r": 73,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 6,
        "r": 79,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 9,
        "r": 79,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 9,
        "r": 70,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 12,
        "r": 70,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 15,
        "r": 70,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 18,
        "r": 70,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 21,
        "r": 70,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 24,
        "r": 70,
        "layer": "object"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 2,
        "r": 75,
        "layer": "object"
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 2,
        "r": 70,
        "layer": "object"
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 1,
        "r": 62,
        "layer": "object"
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 4,
        "r": 76,
        "layer": "object",
        "fx": true,
        "rot": 0
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 12,
        "r": 79,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 15,
        "r": 79,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 18,
        "r": 79,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 21,
        "r": 79,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 24,
        "r": 79,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 27,
        "r": 79,
        "layer": "floor"
      },
      {
        "id": "tile_muftd54p",
        "c": 14,
        "r": 75,
        "layer": "ground",
        "ox": 0,
        "oy": -26
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 6,
        "r": 82,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 9,
        "r": 82,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 6,
        "r": 85,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 9,
        "r": 85,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 12,
        "r": 82,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 15,
        "r": 82,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 18,
        "r": 82,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 21,
        "r": 82,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 24,
        "r": 82,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 27,
        "r": 82,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 30,
        "r": 73,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 30,
        "r": 76,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 30,
        "r": 79,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 30,
        "r": 82,
        "layer": "floor"
      },
      {
        "id": "tile_field_base",
        "c": 14,
        "r": 74,
        "layer": "object",
        "baseHp": 2000,
        "baseDepth": 3,
        "baseSolid": [
          [
            1,
            6
          ],
          [
            1,
            5
          ],
          [
            1,
            4
          ],
          [
            1,
            3
          ],
          [
            1,
            2
          ],
          [
            1,
            1
          ],
          [
            2,
            1
          ],
          [
            3,
            1
          ],
          [
            4,
            1
          ],
          [
            5,
            1
          ],
          [
            6,
            1
          ],
          [
            7,
            1
          ],
          [
            8,
            1
          ],
          [
            9,
            1
          ],
          [
            9,
            2
          ],
          [
            9,
            3
          ],
          [
            9,
            4
          ],
          [
            9,
            5
          ],
          [
            9,
            6
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
            4,
            2
          ],
          [
            5,
            2
          ],
          [
            6,
            2
          ],
          [
            7,
            2
          ],
          [
            8,
            2
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
          ]
        ]
      },
      {
        "id": "tile_field_supply_box",
        "c": 19,
        "r": 76,
        "layer": "object2",
        "ox": -14,
        "oy": 12
      },
      {
        "id": "tile_field_ammo_crate_open",
        "c": 20,
        "r": 76,
        "layer": "object2",
        "ox": -2,
        "oy": 12
      },
      {
        "id": "tile_mvma4ws7",
        "c": 21,
        "r": 76,
        "layer": "object2",
        "ox": 12,
        "oy": 14
      },
      {
        "id": "tile_field_camp_bed",
        "c": 19,
        "r": 78,
        "layer": "object2",
        "ox": 8,
        "oy": 22
      },
      {
        "id": "tile_field_camp_bed",
        "c": 21,
        "r": 78,
        "layer": "object2",
        "ox": 10,
        "oy": 22
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 11,
        "r": 83,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 16,
        "r": 83,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 19,
        "r": 83,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 22,
        "r": 83,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 25,
        "r": 83,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 28,
        "r": 83,
        "layer": "object"
      },
      {
        "id": "tile_obstacle_searchlight_h",
        "c": 6,
        "r": 81,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_obstacle_searchlight_h",
        "c": 11,
        "r": 81,
        "layer": "object"
      },
      {
        "id": "tile_obstacle_searchlight_h",
        "c": 30,
        "r": 74,
        "layer": "object2"
      },
      {
        "id": "tile_obstacle_searchlight_h",
        "c": 43,
        "r": 72,
        "layer": "object4"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 33,
        "r": 73,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 33,
        "r": 76,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 33,
        "r": 79,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 33,
        "r": 82,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 36,
        "r": 82,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 36,
        "r": 79,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 36,
        "r": 76,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 36,
        "r": 73,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 39,
        "r": 73,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 39,
        "r": 76,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 39,
        "r": 79,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 39,
        "r": 82,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 42,
        "r": 82,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 42,
        "r": 79,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 42,
        "r": 76,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 42,
        "r": 73,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 42,
        "r": 70,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 39,
        "r": 70,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 36,
        "r": 70,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 36,
        "r": 67,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 39,
        "r": 67,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 42,
        "r": 67,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 36,
        "r": 64,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 39,
        "r": 64,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 34,
        "r": 64,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 31,
        "r": 64,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 39,
        "r": 61,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 36,
        "r": 61,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 33,
        "r": 61,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 31,
        "r": 61,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 28,
        "r": 64,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 25,
        "r": 64,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 22,
        "r": 64,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 33,
        "r": 86,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 39,
        "r": 86,
        "layer": "object"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 43,
        "r": 85,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa16jw",
        "c": 35,
        "r": 69,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 33,
        "r": 70,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 34,
        "r": 70,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 4,
        "r": 70,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 5,
        "r": 70,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 42,
        "r": 64,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 42,
        "r": 61,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 45,
        "r": 61,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 39,
        "r": 58,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 36,
        "r": 58,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 48,
        "r": 61,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 51,
        "r": 61,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 54,
        "r": 61,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 57,
        "r": 61,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 57,
        "r": 64,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 57,
        "r": 67,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 57,
        "r": 70,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 54,
        "r": 70,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 54,
        "r": 73,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 57,
        "r": 73,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 60,
        "r": 73,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 63,
        "r": 73,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 63,
        "r": 76,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 63,
        "r": 79,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 60,
        "r": 79,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 60,
        "r": 82,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 63,
        "r": 82,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 60,
        "r": 61,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 63,
        "r": 61,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 63,
        "r": 58,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 57,
        "r": 52,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 57,
        "r": 55,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 54,
        "r": 55,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 54,
        "r": 52,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 51,
        "r": 52,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 51,
        "r": 55,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 51,
        "r": 49,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 54,
        "r": 49,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 57,
        "r": 49,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 51,
        "r": 46,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 51,
        "r": 43,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 51,
        "r": 40,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 63,
        "r": 28,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 63,
        "r": 31,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 60,
        "r": 28,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 60,
        "r": 31,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 19,
        "r": 64,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 16,
        "r": 64,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 13,
        "r": 64,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 7,
        "r": 64,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 4,
        "r": 64,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 4,
        "r": 49,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 7,
        "r": 52,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 4,
        "r": 46,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 7,
        "r": 46,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 4,
        "r": 43,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 7,
        "r": 43,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 4,
        "r": 40,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 7,
        "r": 40,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 4,
        "r": 37,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 7,
        "r": 37,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 4,
        "r": 34,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 4,
        "r": 31,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 4,
        "r": 28,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 4,
        "r": 25,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 4,
        "r": 22,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 4,
        "r": 19,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 39,
        "r": 55,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 39,
        "r": 52,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 39,
        "r": 49,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 36,
        "r": 55,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 36,
        "r": 52,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 36,
        "r": 49,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 33,
        "r": 49,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 30,
        "r": 49,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 27,
        "r": 49,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 24,
        "r": 49,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 21,
        "r": 49,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 18,
        "r": 49,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 15,
        "r": 49,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 28,
        "r": 61,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 25,
        "r": 61,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 22,
        "r": 61,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 22,
        "r": 58,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 22,
        "r": 55,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 22,
        "r": 52,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 10,
        "r": 52,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 13,
        "r": 55,
        "layer": "floor",
        "fx": false
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 48,
        "r": 40,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 45,
        "r": 40,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 42,
        "r": 40,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 42,
        "r": 43,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 39,
        "r": 43,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 36,
        "r": 43,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 33,
        "r": 43,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 30,
        "r": 43,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 27,
        "r": 43,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 24,
        "r": 43,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 21,
        "r": 43,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 18,
        "r": 43,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 15,
        "r": 43,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 15,
        "r": 40,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 18,
        "r": 40,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 21,
        "r": 40,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 21,
        "r": 37,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 18,
        "r": 37,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 15,
        "r": 37,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 20,
        "r": 34,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 20,
        "r": 31,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 22,
        "r": 28,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 25,
        "r": 28,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 34,
        "r": 34,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 34,
        "r": 31,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 34,
        "r": 28,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 34,
        "r": 25,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 34,
        "r": 22,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 33,
        "r": 19,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 33,
        "r": 16,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 45,
        "r": 37,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 45,
        "r": 34,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 45,
        "r": 31,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 45,
        "r": 28,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 45,
        "r": 25,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 42,
        "r": 25,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 39,
        "r": 25,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 36,
        "r": 16,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 39,
        "r": 16,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 42,
        "r": 16,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 45,
        "r": 16,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 57,
        "r": 82,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 54,
        "r": 82,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 54,
        "r": 85,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 57,
        "r": 85,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 60,
        "r": 85,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 48,
        "r": 25,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 48,
        "r": 28,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 48,
        "r": 31,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 48,
        "r": 34,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 49,
        "r": 13,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 48,
        "r": 16,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 48,
        "r": 19,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 51,
        "r": 19,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 51,
        "r": 16,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 52,
        "r": 13,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 55,
        "r": 13,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 54,
        "r": 16,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 45,
        "r": 19,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 42,
        "r": 19,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 39,
        "r": 19,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 36,
        "r": 19,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 18,
        "r": 16,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 49,
        "r": 10,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 52,
        "r": 10,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 55,
        "r": 10,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 57,
        "r": 31,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 57,
        "r": 34,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 57,
        "r": 37,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 66,
        "r": 57,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 69,
        "r": 57,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 72,
        "r": 57,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 66,
        "r": 37,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 63,
        "r": 37,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 72,
        "r": 60,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 72,
        "r": 63,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 72,
        "r": 66,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 72,
        "r": 69,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 72,
        "r": 72,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 72,
        "r": 75,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 69,
        "r": 75,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 66,
        "r": 75,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 47,
        "r": 7,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 50,
        "r": 7,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 53,
        "r": 7,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 47,
        "r": 4,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 50,
        "r": 4,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 53,
        "r": 4,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 24,
        "r": 37,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 27,
        "r": 37,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 30,
        "r": 37,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 31,
        "r": 34,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 31,
        "r": 31,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 19,
        "r": 28,
        "layer": "floor",
        "fx": false
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 17,
        "r": 31,
        "layer": "floor",
        "fx": false
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 17,
        "r": 34,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 1,
        "r": 64,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 1,
        "r": 19,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 1,
        "r": 22,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 1,
        "r": 25,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 1,
        "r": 28,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 1,
        "r": 31,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 1,
        "r": 34,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 1,
        "r": 37,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 1,
        "r": 40,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 1,
        "r": 43,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 1,
        "r": 46,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 1,
        "r": 49,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 1,
        "r": 16,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 4,
        "r": 16,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 1,
        "r": 13,
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
        "c": 63,
        "r": 85,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 13,
        "r": 64,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 19,
        "r": 64,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 22,
        "r": 64,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 25,
        "r": 64,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 28,
        "r": 64,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 31,
        "r": 64,
        "layer": "object"
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 44,
        "r": 61,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 46,
        "r": 61,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 49,
        "r": 61,
        "layer": "object"
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 55,
        "r": 61,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 35,
        "r": 64,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 34,
        "r": 64,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 19,
        "r": 61,
        "layer": "floor",
        "fx": false
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 16,
        "r": 61,
        "layer": "floor",
        "fx": false
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 13,
        "r": 61,
        "layer": "floor",
        "fx": false
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 51,
        "r": 70,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 48,
        "r": 70,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 48,
        "r": 73,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 51,
        "r": 73,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 48,
        "r": 76,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 51,
        "r": 76,
        "layer": "floor"
      },
      {
        "id": "tile_obstacle_wirefence_h",
        "c": 37,
        "r": 71,
        "layer": "object"
      },
      {
        "id": "tile_obstacle_irongate",
        "c": 39,
        "r": 71,
        "layer": "object"
      },
      {
        "id": "tile_mr4ja2cb",
        "c": 43,
        "r": 71,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 42,
        "r": 58,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 45,
        "r": 58,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 48,
        "r": 58,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 51,
        "r": 58,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 54,
        "r": 58,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 57,
        "r": 58,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 51,
        "r": 67,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 48,
        "r": 76,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 45,
        "r": 55,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 25,
        "r": 58,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 31,
        "r": 58,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 57,
        "r": 73,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 57,
        "r": 85,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 60,
        "r": 85,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 63,
        "r": 85,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 66,
        "r": 76,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 69,
        "r": 76,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 72,
        "r": 76,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 63,
        "r": 64,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 18,
        "r": 58,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 72,
        "r": 51,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 66,
        "r": 42,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 69,
        "r": 55,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 72,
        "r": 55,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 69,
        "r": 59,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 69,
        "r": 72,
        "layer": "object"
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 66,
        "r": 59,
        "layer": "object"
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 60,
        "r": 64,
        "layer": "object"
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 47,
        "r": 67,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 68,
        "r": 59,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 62,
        "r": 64,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 54,
        "r": 67,
        "layer": "object"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 55,
        "r": 66,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa16jw",
        "c": 53,
        "r": 75,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 51,
        "r": 76,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 52,
        "r": 76,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 54,
        "r": 73,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 56,
        "r": 73,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 56,
        "r": 73,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa16jw",
        "c": 60,
        "r": 68,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 65,
        "r": 68,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa16jw",
        "c": 65,
        "r": 71,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 67,
        "r": 72,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 68,
        "r": 72,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 62,
        "r": 69,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 63,
        "r": 69,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 64,
        "r": 69,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 66,
        "r": 63,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 75,
        "r": 54,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 75,
        "r": 75,
        "layer": "object"
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 59,
        "r": 76,
        "layer": "object"
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 58,
        "r": 73,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa16jw",
        "c": 58,
        "r": 79,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa16jw",
        "c": 53,
        "r": 84,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 55,
        "r": 85,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 56,
        "r": 85,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 57,
        "r": 80,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 56,
        "r": 80,
        "layer": "object"
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 53,
        "r": 80,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 55,
        "r": 80,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02_hole",
        "c": 63,
        "r": 76,
        "layer": "object"
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 50,
        "r": 10,
        "layer": "object"
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 49,
        "r": 10,
        "layer": "object"
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 48,
        "r": 10,
        "layer": "object"
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 56,
        "r": 10,
        "layer": "object"
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 57,
        "r": 10,
        "layer": "object"
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 58,
        "r": 10,
        "layer": "object"
      },
      {
        "id": "tile_bg_extra_high_pillar",
        "c": 47,
        "r": 9,
        "layer": "object"
      },
      {
        "id": "tile_bg_extra_high_pillar",
        "c": 59,
        "r": 9,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 60,
        "r": 37,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 54,
        "r": 46,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 57,
        "r": 46,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 60,
        "r": 46,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 60,
        "r": 49,
        "layer": "floor"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 47,
        "r": 75,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 49,
        "r": 76,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 50,
        "r": 76,
        "layer": "object"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 66,
        "r": 84,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 63,
        "r": 85,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 64,
        "r": 85,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 67,
        "r": 83,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 67,
        "r": 82,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 67,
        "r": 81,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 67,
        "r": 80,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 67,
        "r": 79,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 67,
        "r": 77,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 67,
        "r": 78,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 68,
        "r": 76,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 65,
        "r": 85,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 66,
        "r": 76,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 60,
        "r": 76,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 57,
        "r": 73,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 59,
        "r": 76,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 59,
        "r": 77,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 59,
        "r": 78,
        "layer": "top",
        "fx": true
      },
      {
        "id": "floor",
        "c": 66,
        "r": 78,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 66,
        "r": 79,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 66,
        "r": 80,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 66,
        "r": 81,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 66,
        "r": 82,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 66,
        "r": 83,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 66,
        "r": 84,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 66,
        "r": 85,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 66,
        "r": 86,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 71,
        "r": 62,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 71,
        "r": 63,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 71,
        "r": 64,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 71,
        "r": 65,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 71,
        "r": 66,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 71,
        "r": 67,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 71,
        "r": 68,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 71,
        "r": 69,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 71,
        "r": 70,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mvpa16jw",
        "c": 70,
        "r": 71,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 70,
        "r": 59,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 69,
        "r": 59,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 69,
        "r": 72,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 75,
        "r": 74,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 75,
        "r": 73,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 75,
        "r": 72,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 75,
        "r": 71,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 75,
        "r": 70,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 75,
        "r": 69,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 75,
        "r": 62,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 75,
        "r": 61,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 75,
        "r": 60,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 75,
        "r": 59,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 75,
        "r": 58,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 75,
        "r": 56,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 75,
        "r": 57,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 66,
        "r": 62,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 65,
        "r": 70,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 69,
        "r": 42,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 38,
        "r": 23,
        "layer": "object"
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 50,
        "r": 23,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 53,
        "r": 37,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 41,
        "r": 36,
        "layer": "object"
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 41,
        "r": 47,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa16jw",
        "c": 34,
        "r": 57,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa16jw",
        "c": 13,
        "r": 63,
        "layer": "object"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 20,
        "r": 57,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 20,
        "r": 49,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 15,
        "r": 64,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 18,
        "r": 58,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 19,
        "r": 58,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 17,
        "r": 49,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 18,
        "r": 49,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 7,
        "r": 67,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 4,
        "r": 67,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 1,
        "r": 67,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 1,
        "r": 70,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 4,
        "r": 70,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 7,
        "r": 70,
        "layer": "floor"
      },
      {
        "id": "tile_mr4czvpx",
        "c": 1,
        "r": 65,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 1,
        "r": 66,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 1,
        "r": 67,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 1,
        "r": 68,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 10,
        "r": 65,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 10,
        "r": 66,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 10,
        "r": 67,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 10,
        "r": 68,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyq54",
        "c": 1,
        "r": 69,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 10,
        "r": 69,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 11,
        "r": 70,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 3,
        "r": 70,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 9,
        "r": 70,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 8,
        "r": 61,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 10,
        "r": 55,
        "layer": "floor",
        "fx": false
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 13,
        "r": 52,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 13,
        "r": 49,
        "layer": "floor"
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 34,
        "r": 51,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 25,
        "r": 51,
        "layer": "object"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 25,
        "r": 57,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 27,
        "r": 58,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 27,
        "r": 51,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 28,
        "r": 51,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 29,
        "r": 51,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 32,
        "r": 51,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 33,
        "r": 51,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 37,
        "r": 47,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 34,
        "r": 47,
        "layer": "object"
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 10,
        "r": 58,
        "layer": "object"
      },
      {
        "id": "tile_mrt_escalator_front_high",
        "c": 53,
        "r": 49,
        "layer": "object",
        "ox": 0,
        "oy": -8
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 51,
        "r": 49,
        "layer": "object"
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 52,
        "r": 49,
        "layer": "object"
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 58,
        "r": 49,
        "layer": "object"
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 59,
        "r": 49,
        "layer": "object"
      },
      {
        "id": "tile_mrt_escalator_front_high",
        "c": 51,
        "r": 10,
        "layer": "object2",
        "ox": 0,
        "oy": -8
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 49,
        "r": 41,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_bg_extra_high_pillar",
        "c": 50,
        "r": 48,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_bg_extra_high_pillar",
        "c": 63,
        "r": 48,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 50,
        "r": 44,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 50,
        "r": 45,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 50,
        "r": 46,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 50,
        "r": 47,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 60,
        "r": 49,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 61,
        "r": 49,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 62,
        "r": 49,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 60,
        "r": 55,
        "layer": "floor",
        "fx": false
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 60,
        "r": 58,
        "layer": "floor",
        "fx": false
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 48,
        "r": 55,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 63,
        "r": 55,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvpa16jw",
        "c": 49,
        "r": 54,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa16jw",
        "c": 63,
        "r": 54,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 65,
        "r": 55,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 48,
        "r": 55,
        "layer": "object"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 42,
        "r": 54,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 44,
        "r": 55,
        "layer": "object"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 54,
        "r": 41,
        "layer": "object"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 58,
        "r": 41,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 57,
        "r": 42,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 56,
        "r": 42,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 63,
        "r": 45,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 63,
        "r": 46,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 63,
        "r": 47,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 63,
        "r": 42,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 65,
        "r": 42,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 59,
        "r": 42,
        "layer": "floor"
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 58,
        "r": 37,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 59,
        "r": 40,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa16jw",
        "c": 56,
        "r": 36,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 63,
        "r": 40,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 66,
        "r": 40,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 63,
        "r": 42,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 66,
        "r": 42,
        "layer": "floor"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 70,
        "r": 50,
        "layer": "object"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 75,
        "r": 50,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 76,
        "r": 48,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 76,
        "r": 47,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 76,
        "r": 46,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 76,
        "r": 45,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 76,
        "r": 44,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 76,
        "r": 43,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 76,
        "r": 49,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 76,
        "r": 42,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 76,
        "r": 41,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 76,
        "r": 40,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 76,
        "r": 39,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 76,
        "r": 38,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 76,
        "r": 37,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 76,
        "r": 36,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa16jw",
        "c": 43,
        "r": 35,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 44,
        "r": 35,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 44,
        "r": 34,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 44,
        "r": 33,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 44,
        "r": 32,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 44,
        "r": 31,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 44,
        "r": 30,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa16jw",
        "c": 38,
        "r": 26,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 40,
        "r": 27,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 41,
        "r": 27,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 42,
        "r": 27,
        "layer": "object"
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 43,
        "r": 27,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa16jw",
        "c": 40,
        "r": 37,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 38,
        "r": 38,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 39,
        "r": 38,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 36,
        "r": 38,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 24,
        "r": 34,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 45,
        "r": 41,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 47,
        "r": 41,
        "layer": "object",
        "fx": false
      },
      {
        "id": "tile_mr4cyy36",
        "c": 48,
        "r": 41,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 39,
        "r": 40,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 36,
        "r": 40,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 33,
        "r": 40,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 30,
        "r": 40,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 27,
        "r": 40,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 24,
        "r": 40,
        "layer": "floor"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 40,
        "r": 23,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 42,
        "r": 23,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 41,
        "r": 23,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 43,
        "r": 23,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 44,
        "r": 23,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 45,
        "r": 23,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 46,
        "r": 23,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 48,
        "r": 23,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 47,
        "r": 23,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 49,
        "r": 23,
        "layer": "object"
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 56,
        "r": 29,
        "layer": "object"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 58,
        "r": 28,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 59,
        "r": 27,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 66,
        "r": 27,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 66,
        "r": 28,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 66,
        "r": 29,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 66,
        "r": 30,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa16jw",
        "c": 65,
        "r": 31,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 64,
        "r": 32,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 62,
        "r": 32,
        "layer": "object"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 62,
        "r": 34,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 64,
        "r": 35,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 66,
        "r": 35,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 65,
        "r": 35,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 67,
        "r": 35,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 68,
        "r": 35,
        "layer": "object"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 69,
        "r": 34,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 70,
        "r": 33,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 70,
        "r": 32,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 70,
        "r": 31,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 70,
        "r": 30,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 76,
        "r": 30,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 76,
        "r": 31,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 76,
        "r": 32,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 76,
        "r": 33,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 76,
        "r": 35,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 76,
        "r": 34,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa16jw",
        "c": 16,
        "r": 57,
        "layer": "object"
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 12,
        "r": 58,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 10,
        "r": 62,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 10,
        "r": 63,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 10,
        "r": 64,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 13,
        "r": 61,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 13,
        "r": 62,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 13,
        "r": 58,
        "layer": "floor",
        "fx": false
      },
      {
        "id": "tile_mvpa16jw",
        "c": 44,
        "r": 42,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 41,
        "r": 43,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 38,
        "r": 43,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 34,
        "r": 43,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 7,
        "r": 1,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 1,
        "r": 1,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 3,
        "r": 1,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 6,
        "r": 1,
        "layer": "object"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 1,
        "r": 48,
        "layer": "object"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 6,
        "r": 61,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 3,
        "r": 62,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 4,
        "r": 62,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyq54",
        "c": 7,
        "r": 52,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 7,
        "r": 57,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 7,
        "r": 58,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 10,
        "r": 43,
        "layer": "floor"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 8,
        "r": 35,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 11,
        "r": 36,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 12,
        "r": 36,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 13,
        "r": 36,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvcrmipy",
        "c": 8,
        "r": 58,
        "layer": "ground"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 5,
        "r": 62,
        "layer": "object"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 34,
        "r": 37,
        "layer": "object"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 22,
        "r": 33,
        "layer": "object"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 29,
        "r": 33,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 25,
        "r": 34,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 26,
        "r": 34,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 27,
        "r": 34,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 28,
        "r": 34,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 36,
        "r": 19,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 38,
        "r": 19,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 41,
        "r": 19,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 44,
        "r": 19,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 47,
        "r": 19,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 50,
        "r": 19,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 53,
        "r": 19,
        "layer": "object"
      },
      {
        "id": "tile_mr4czvpx",
        "c": 7,
        "r": 56,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 7,
        "r": 55,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 7,
        "r": 54,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 3,
        "r": 49,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 4,
        "r": 49,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 6,
        "r": 49,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 5,
        "r": 49,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 7,
        "r": 55,
        "layer": "floor",
        "fx": false
      },
      {
        "id": "tile_bg_backroom_wall02_crack_breakable",
        "c": 6,
        "r": 70,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa16jw",
        "c": 15,
        "r": 35,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 14,
        "r": 36,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 16,
        "r": 29,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 16,
        "r": 30,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 16,
        "r": 31,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 16,
        "r": 32,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 16,
        "r": 33,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 16,
        "r": 34,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 16,
        "r": 25,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 18,
        "r": 25,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 19,
        "r": 25,
        "layer": "object"
      },
      {
        "id": "tile_mr4czvpx",
        "c": 36,
        "r": 22,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 36,
        "r": 23,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 36,
        "r": 24,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 36,
        "r": 25,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 36,
        "r": 26,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 36,
        "r": 27,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 36,
        "r": 28,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 36,
        "r": 29,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 36,
        "r": 30,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 36,
        "r": 31,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 36,
        "r": 32,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 37,
        "r": 38,
        "layer": "object"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 35,
        "r": 33,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 34,
        "r": 34,
        "layer": "object"
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 22,
        "r": 30,
        "layer": "object"
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 29,
        "r": 30,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 24,
        "r": 30,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 26,
        "r": 30,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 25,
        "r": 30,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 27,
        "r": 30,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 28,
        "r": 30,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 31,
        "r": 28,
        "layer": "floor",
        "fx": false
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 28,
        "r": 28,
        "layer": "floor",
        "fx": false
      },
      {
        "id": "tile_bg_extra_high_pillar",
        "c": 33,
        "r": 9,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 46,
        "r": 10,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 45,
        "r": 10,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 44,
        "r": 10,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 43,
        "r": 10,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 42,
        "r": 10,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 41,
        "r": 10,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 40,
        "r": 10,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 38,
        "r": 10,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 37,
        "r": 10,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 36,
        "r": 10,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 35,
        "r": 10,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 34,
        "r": 10,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 39,
        "r": 10,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 33,
        "r": 13,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 33,
        "r": 14,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 33,
        "r": 15,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 33,
        "r": 16,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 33,
        "r": 17,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 33,
        "r": 18,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 33,
        "r": 19,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 33,
        "r": 20,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 33,
        "r": 21,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 33,
        "r": 22,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 33,
        "r": 23,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 33,
        "r": 24,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mvpa16jw",
        "c": 32,
        "r": 24,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 31,
        "r": 25,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 30,
        "r": 25,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 29,
        "r": 25,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 16,
        "r": 28,
        "layer": "floor"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 28,
        "r": 25,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 26,
        "r": 25,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 27,
        "r": 25,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 25,
        "r": 25,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 24,
        "r": 25,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 21,
        "r": 16,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 24,
        "r": 16,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 18,
        "r": 19,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 21,
        "r": 19,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 24,
        "r": 19,
        "layer": "floor"
      },
      {
        "id": "tile_mvcrmipy",
        "c": 21,
        "r": 22,
        "layer": "ground",
        "ox": 0,
        "oy": -8
      },
      {
        "id": "tile_mvpa16jw",
        "c": 17,
        "r": 18,
        "layer": "object"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 25,
        "r": 18,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 18,
        "r": 13,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 21,
        "r": 13,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 24,
        "r": 13,
        "layer": "floor"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 24,
        "r": 19,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 19,
        "r": 19,
        "layer": "object"
      },
      {
        "id": "tile_mr4czvpx",
        "c": 26,
        "r": 14,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 26,
        "r": 15,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 26,
        "r": 16,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 26,
        "r": 17,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 17,
        "r": 17,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 17,
        "r": 16,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 17,
        "r": 15,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 17,
        "r": 14,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4cyq54",
        "c": 20,
        "r": 18,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyq54",
        "c": 23,
        "r": 18,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyq54",
        "c": 20,
        "r": 24,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyq54",
        "c": 23,
        "r": 24,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 20,
        "r": 20,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 20,
        "r": 21,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 20,
        "r": 22,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 20,
        "r": 23,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 23,
        "r": 23,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 23,
        "r": 22,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 23,
        "r": 21,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 23,
        "r": 20,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_cvs_back_counter",
        "c": 18,
        "r": 11,
        "layer": "object2",
        "ox": 0,
        "oy": -8,
        "sortDepth": 2.5
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 24,
        "r": 7,
        "layer": "object"
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 25,
        "r": 7,
        "layer": "object"
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 23,
        "r": 7,
        "layer": "object"
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 22,
        "r": 7,
        "layer": "object"
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 21,
        "r": 7,
        "layer": "object"
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 20,
        "r": 7,
        "layer": "object"
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 19,
        "r": 7,
        "layer": "object"
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 18,
        "r": 7,
        "layer": "object"
      },
      {
        "id": "tile_bg_extra_high_pillar",
        "c": 26,
        "r": 6,
        "layer": "object"
      },
      {
        "id": "tile_bg_extra_high_pillar",
        "c": 17,
        "r": 6,
        "layer": "object"
      },
      {
        "id": "tile_cvs_checkout_counter_backroom",
        "c": 18,
        "r": 13,
        "layer": "object3",
        "ox": 0,
        "oy": -12,
        "sortDepth": 2.75
      },
      {
        "id": "tile_cvs_sign_twelve",
        "c": 18,
        "r": 10,
        "layer": "object",
        "ox": 0,
        "oy": 8
      },
      {
        "id": "tile_cvs_ibon_kiosk",
        "c": 25,
        "r": 11,
        "layer": "object2",
        "ox": -2,
        "oy": -8,
        "sortDepth": 2.5
      },
      {
        "id": "tile_cvs_snack_shelf",
        "c": 24,
        "r": 14,
        "layer": "object3",
        "ox": -8,
        "oy": 0,
        "sortDepth": 2.5
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 21,
        "r": 22,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 69,
        "r": 38,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 69,
        "r": 40,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 69,
        "r": 42,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 70,
        "r": 51,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 73,
        "r": 51,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 70,
        "r": 48,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 73,
        "r": 48,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 70,
        "r": 45,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 73,
        "r": 45,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 70,
        "r": 42,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 73,
        "r": 42,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 70,
        "r": 39,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 73,
        "r": 39,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 70,
        "r": 36,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 73,
        "r": 36,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 70,
        "r": 33,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 73,
        "r": 33,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 70,
        "r": 30,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 73,
        "r": 30,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 60,
        "r": 76,
        "layer": "floor"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 62,
        "r": 76,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 57,
        "r": 16,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 57,
        "r": 19,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 54,
        "r": 19,
        "layer": "floor"
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 59,
        "r": 24,
        "layer": "object"
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 65,
        "r": 24,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 61,
        "r": 24,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 56,
        "r": 19,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 57,
        "r": 19,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 58,
        "r": 19,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_bg_extra_high_pillar",
        "c": 59,
        "r": 15,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 59,
        "r": 11,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 59,
        "r": 12,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 59,
        "r": 13,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 59,
        "r": 14,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 56,
        "r": 7,
        "layer": "floor",
        "fx": false
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 56,
        "r": 4,
        "layer": "floor",
        "fx": false
      },
      {
        "id": "tile_mvpa16jw",
        "c": 51,
        "r": 36,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 48,
        "r": 37,
        "layer": "floor"
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 70,
        "r": 27,
        "layer": "object"
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 75,
        "r": 27,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 72,
        "r": 27,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 73,
        "r": 27,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 74,
        "r": 27,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mrt_exit_2_sealed",
        "c": 51,
        "r": -1,
        "layer": "object2",
        "fx": false
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 48,
        "r": 1,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 56,
        "r": 1,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_mr4cyq54",
        "c": 47,
        "r": 0,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_mr4cyq54",
        "c": 59,
        "r": 0,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 59,
        "r": 8,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 59,
        "r": 7,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 59,
        "r": 6,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 59,
        "r": 5,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 59,
        "r": 4,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 59,
        "r": 3,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 59,
        "r": 2,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 47,
        "r": 2,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 47,
        "r": 3,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 47,
        "r": 4,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 47,
        "r": 5,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 47,
        "r": 6,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 47,
        "r": 7,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 47,
        "r": 8,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mrt_ticket_gate",
        "c": 52,
        "r": 6,
        "layer": "object2",
        "fx": true,
        "ox": 0,
        "oy": -6
      },
      {
        "id": "tile_mrt_glass_railing",
        "c": 55,
        "r": 6,
        "layer": "object2",
        "fx": true,
        "ox": 0,
        "oy": -6
      },
      {
        "id": "tile_mrt_glass_railing",
        "c": 49,
        "r": 6,
        "layer": "object2",
        "fx": true,
        "ox": 0,
        "oy": -6
      },
      {
        "id": "tile_mr4cyu5g",
        "c": 58,
        "r": 5,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_mr4cyu5g",
        "c": 48,
        "r": 5,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_eoc_door_exit_fade",
        "c": 6,
        "r": 88,
        "layer": "ground",
        "ox": -16,
        "oy": 0
      },
      {
        "id": "tile_eoc_door_exit_fade",
        "c": 7,
        "r": 88,
        "layer": "ground",
        "ox": -8,
        "oy": 0
      },
      {
        "id": "tile_eoc_door_exit_fade",
        "c": 8,
        "r": 88,
        "layer": "ground",
        "ox": 0,
        "oy": 0
      },
      {
        "id": "tile_eoc_door_exit_fade",
        "c": 9,
        "r": 88,
        "layer": "ground",
        "ox": 8,
        "oy": 0
      },
      {
        "id": "tile_eoc_door_exit_fade",
        "c": 9,
        "r": 89,
        "layer": "ground"
      },
      {
        "id": "tile_eoc_door_exit_fade",
        "c": 10,
        "r": 88,
        "layer": "ground",
        "ox": 16,
        "oy": 0
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 7,
        "r": 58,
        "layer": "floor",
        "fx": false
      },
      {
        "id": "tile_mr4cyq54",
        "c": 7,
        "r": 48,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02_crack_breakable",
        "c": 8,
        "r": 49,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 10,
        "r": 46,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 10,
        "r": 49,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 8,
        "r": 49,
        "layer": "floor"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 12,
        "r": 48,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 11,
        "r": 49,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02_secret",
        "c": 62,
        "r": 24,
        "layer": "object"
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 61,
        "r": 16,
        "layer": "object5"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 71,
        "r": 19,
        "layer": "object5",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 61,
        "r": 21,
        "layer": "object5",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 61,
        "r": 22,
        "layer": "object5",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 61,
        "r": 23,
        "layer": "object5",
        "fx": true
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 65,
        "r": 20,
        "layer": "object5"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 66,
        "r": 20,
        "layer": "object5"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 68,
        "r": 20,
        "layer": "object5"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 67,
        "r": 20,
        "layer": "object5"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 69,
        "r": 20,
        "layer": "object5"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 70,
        "r": 20,
        "layer": "object5"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 63,
        "r": 16,
        "layer": "object5"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 64,
        "r": 16,
        "layer": "object5"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 65,
        "r": 16,
        "layer": "object5"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 66,
        "r": 16,
        "layer": "object5"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 67,
        "r": 15,
        "layer": "object5",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 68,
        "r": 10,
        "layer": "object5",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 68,
        "r": 11,
        "layer": "object5",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 72,
        "r": 10,
        "layer": "object5",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 72,
        "r": 11,
        "layer": "object5",
        "fx": true
      },
      {
        "id": "tile_mr4cyq54",
        "c": 68,
        "r": 8,
        "layer": "ground4",
        "fx": true
      },
      {
        "id": "tile_mr4cyq54",
        "c": 72,
        "r": 8,
        "layer": "ground4",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_wall02_hole",
        "c": 69,
        "r": 8,
        "layer": "object5",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_wall02_hole",
        "c": 69,
        "r": 15,
        "layer": "object5",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 61,
        "r": 19,
        "layer": "object5",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_door_wood",
        "c": 70,
        "r": 9,
        "layer": "object6",
        "doorMode": "picture"
      },
      {
        "id": "tile_bg_backroom_door_wood",
        "c": 70,
        "r": 16,
        "layer": "object6",
        "doorMode": "key"
      },
      {
        "id": "tile_bg_backroom_wall02_hole",
        "c": 4,
        "r": 42,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 2,
        "r": 41,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 9,
        "r": 41,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 3,
        "r": 42,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 7,
        "r": 42,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 8,
        "r": 42,
        "layer": "object"
      },
      {
        "id": "tile_mrt_tactile_paving_yellow",
        "c": 60,
        "r": 57,
        "layer": "ground2"
      },
      {
        "id": "tile_mrt_tactile_paving_yellow",
        "c": 57,
        "r": 57,
        "layer": "ground2"
      },
      {
        "id": "tile_mrt_tactile_paving_yellow",
        "c": 54,
        "r": 57,
        "layer": "ground2"
      },
      {
        "id": "tile_mrt_tactile_paving_yellow",
        "c": 51,
        "r": 57,
        "layer": "ground2"
      },
      {
        "id": "tile_mrt_floor_tile",
        "c": 51,
        "r": 55,
        "layer": "ground"
      },
      {
        "id": "tile_mrt_floor_tile",
        "c": 54,
        "r": 55,
        "layer": "ground"
      },
      {
        "id": "tile_mrt_floor_tile",
        "c": 57,
        "r": 55,
        "layer": "ground"
      },
      {
        "id": "tile_mrt_floor_tile",
        "c": 60,
        "r": 55,
        "layer": "ground"
      },
      {
        "id": "tile_mrt_floor_tile",
        "c": 56,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_mrt_floor_tile",
        "c": 53,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_mrt_floor_tile",
        "c": 50,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_mrt_floor_tile",
        "c": 47,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_mrt_floor_tile",
        "c": 47,
        "r": 4,
        "layer": "ground"
      },
      {
        "id": "tile_mrt_floor_tile",
        "c": 50,
        "r": 4,
        "layer": "ground"
      },
      {
        "id": "tile_mrt_floor_tile",
        "c": 53,
        "r": 4,
        "layer": "ground"
      },
      {
        "id": "tile_mrt_floor_tile",
        "c": 56,
        "r": 4,
        "layer": "ground"
      },
      {
        "id": "tile_dmg_broken_wall_breach",
        "c": 2,
        "r": 35,
        "layer": "object2"
      },
      {
        "id": "tile_dmg_broken_wall_right",
        "c": 22,
        "r": 57,
        "layer": "object2"
      },
      {
        "id": "tile_dmg_broken_wall_left",
        "c": 41,
        "r": 63,
        "layer": "object2"
      },
      {
        "id": "tile_dmg_broken_pillar_rebar",
        "c": 37,
        "r": 64,
        "layer": "object2"
      },
      {
        "id": "tile_bg_backroom_wall02_hole",
        "c": 46,
        "r": 31,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 45,
        "r": 31,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 49,
        "r": 31,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 50,
        "r": 31,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_door_wood",
        "c": 47,
        "r": 32,
        "layer": "object2"
      },
      {
        "id": "tile_bg_backroom_door_wood",
        "c": 5,
        "r": 43,
        "layer": "object2"
      },
      {
        "id": "tile_bg_backroom_door_wood",
        "c": 64,
        "r": 77,
        "layer": "object2"
      },
      {
        "id": "tile_bg_backroom_wall02_hole",
        "c": 60,
        "r": 42,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 30,
        "r": 57,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 28,
        "r": 58,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 29,
        "r": 58,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02_dmg_medium",
        "c": 30,
        "r": 70,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02_dmg_medium",
        "c": 16,
        "r": 64,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02_dmg_medium",
        "c": 37,
        "r": 43,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02_dmg_medium",
        "c": 52,
        "r": 61,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02_dmg_heavy",
        "c": 3,
        "r": 49,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02_dmg_medium",
        "c": 2,
        "r": 62,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02_dmg_heavy",
        "c": 10,
        "r": 36,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02_dmg_medium",
        "c": 26,
        "r": 34,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02_dmg_medium",
        "c": 29,
        "r": 25,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02_dmg_medium",
        "c": 56,
        "r": 42,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02_dmg_medium",
        "c": 60,
        "r": 76,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02_dmg_medium",
        "c": 48,
        "r": 67,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02_dmg_light",
        "c": 36,
        "r": 86,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02_dmg_medium",
        "c": 13,
        "r": 83,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02_dmg_heavy",
        "c": 66,
        "r": 55,
        "layer": "object"
      },
      {
        "id": "tile_mrt_escalator_front_high",
        "c": 22,
        "r": 41,
        "layer": "object",
        "ox": 0,
        "oy": -8
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 21,
        "r": 41,
        "layer": "object"
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 27,
        "r": 41,
        "layer": "object"
      },
      {
        "id": "tile_bg_extra_high_pillar",
        "c": 20,
        "r": 40,
        "layer": "object"
      },
      {
        "id": "tile_bg_extra_high_pillar",
        "c": 28,
        "r": 40,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 13,
        "r": 46,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 16,
        "r": 46,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 19,
        "r": 46,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 22,
        "r": 46,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 25,
        "r": 46,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 28,
        "r": 46,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 13,
        "r": 43,
        "layer": "floor"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 32,
        "r": 46,
        "layer": "object"
      },
      {
        "id": "tile_bg_extra_high_pillar",
        "c": 12,
        "r": 40,
        "layer": "object"
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 13,
        "r": 41,
        "layer": "object"
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 14,
        "r": 41,
        "layer": "object"
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 15,
        "r": 41,
        "layer": "object"
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 16,
        "r": 41,
        "layer": "object"
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 17,
        "r": 41,
        "layer": "object"
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 18,
        "r": 41,
        "layer": "object"
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 19,
        "r": 41,
        "layer": "object"
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 29,
        "r": 41,
        "layer": "object"
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 30,
        "r": 41,
        "layer": "object"
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 31,
        "r": 41,
        "layer": "object"
      },
      {
        "id": "tile_bg_extra_high_pillar",
        "c": 32,
        "r": 40,
        "layer": "ground3"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 33,
        "r": 43,
        "layer": "ground3"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 42,
        "r": 37,
        "layer": "floor"
      },
      {
        "id": "tile_mrt_floor_tile",
        "c": 13,
        "r": 47,
        "layer": "ground"
      },
      {
        "id": "tile_mrt_floor_tile",
        "c": 16,
        "r": 47,
        "layer": "ground"
      },
      {
        "id": "tile_mrt_floor_tile",
        "c": 19,
        "r": 47,
        "layer": "ground"
      },
      {
        "id": "tile_mrt_floor_tile",
        "c": 22,
        "r": 47,
        "layer": "ground"
      },
      {
        "id": "tile_mrt_floor_tile",
        "c": 25,
        "r": 47,
        "layer": "ground"
      },
      {
        "id": "tile_mrt_floor_tile",
        "c": 28,
        "r": 47,
        "layer": "ground"
      },
      {
        "id": "tile_mrt_floor_tile",
        "c": 31,
        "r": 47,
        "layer": "ground"
      },
      {
        "id": "tile_mrt_tactile_paving_yellow",
        "c": 13,
        "r": 50,
        "layer": "ground2"
      },
      {
        "id": "tile_mrt_tactile_paving_yellow",
        "c": 16,
        "r": 50,
        "layer": "ground2"
      },
      {
        "id": "tile_mrt_tactile_paving_yellow",
        "c": 19,
        "r": 50,
        "layer": "ground2"
      },
      {
        "id": "tile_mrt_tactile_paving_yellow",
        "c": 22,
        "r": 49,
        "layer": "ground2"
      },
      {
        "id": "tile_mrt_tactile_paving_yellow",
        "c": 25,
        "r": 49,
        "layer": "ground2"
      },
      {
        "id": "tile_mrt_tactile_paving_yellow",
        "c": 28,
        "r": 49,
        "layer": "ground2"
      },
      {
        "id": "tile_mrt_tactile_paving_yellow",
        "c": 31,
        "r": 49,
        "layer": "ground2"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 16,
        "r": 48,
        "layer": "ground2"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 13,
        "r": 49,
        "layer": "ground2"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 14,
        "r": 49,
        "layer": "ground2"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 15,
        "r": 49,
        "layer": "ground2"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 19,
        "r": 49,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 10,
        "r": 42,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 11,
        "r": 42,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 40,
        "r": 47,
        "layer": "object"
      },
      {
        "id": "tile_interactive_storage_locker",
        "c": 31,
        "r": 59,
        "layer": "object2",
        "ox": 2,
        "oy": -14,
        "lockerLoot": {
          "kind": "item",
          "id": "firstaid",
          "qty": 1
        }
      },
      {
        "id": "tile_interactive_power_switch_off",
        "c": 11,
        "r": 43,
        "layer": "object3",
        "circuit": 1
      },
      {
        "id": "tile_interactive_power_switch_off",
        "c": 18,
        "r": 71,
        "layer": "object3",
        "circuit": 2
      },
      {
        "id": "tile_interactive_power_switch_off",
        "c": 54,
        "r": 81,
        "layer": "object3",
        "circuit": 3
      },
      {
        "id": "tile_interactive_power_switch_off",
        "c": 40,
        "r": 24,
        "layer": "object3",
        "circuit": 4
      },
      {
        "id": "tile_new_decor_exit_sign",
        "c": 36,
        "r": 71,
        "layer": "object3",
        "fx": true,
        "ox": -14,
        "oy": -16
      },
      {
        "id": "tile_bg_electric_light",
        "c": 33,
        "r": 70,
        "layer": "object3",
        "fx": true
      },
      {
        "id": "tile_bg_electric_light",
        "c": 9,
        "r": 70,
        "layer": "object3",
        "fx": true,
        "ox": 18,
        "oy": 0
      },
      {
        "id": "tile_bg_electric_light",
        "c": 18,
        "r": 58,
        "layer": "object3",
        "fx": true
      },
      {
        "id": "tile_bg_electric_light",
        "c": 40,
        "r": 47,
        "layer": "object3",
        "fx": true
      },
      {
        "id": "tile_bg_electric_light",
        "c": 34,
        "r": 38,
        "layer": "object3",
        "fx": true
      },
      {
        "id": "tile_bg_electric_light",
        "c": 22,
        "r": 34,
        "layer": "object3",
        "fx": true
      },
      {
        "id": "tile_bg_electric_light",
        "c": 15,
        "r": 36,
        "layer": "object3",
        "fx": true
      },
      {
        "id": "tile_bg_electric_light",
        "c": 24,
        "r": 25,
        "layer": "object3",
        "fx": true
      },
      {
        "id": "tile_bg_electric_light",
        "c": 49,
        "r": 31,
        "layer": "object3",
        "fx": true
      },
      {
        "id": "tile_bg_electric_light",
        "c": 48,
        "r": 1,
        "layer": "object3",
        "fx": true
      },
      {
        "id": "tile_bg_electric_light",
        "c": 55,
        "r": 67,
        "layer": "object3",
        "fx": true
      },
      {
        "id": "tile_bg_electric_light",
        "c": 73,
        "r": 55,
        "layer": "object3",
        "fx": true
      },
      {
        "id": "tile_bg_electric_light",
        "c": 74,
        "r": 27,
        "layer": "object3",
        "fx": true
      },
      {
        "id": "tile_mv5my8dk",
        "c": 21,
        "r": 70,
        "layer": "object3",
        "fx": true,
        "circuit": 2
      },
      {
        "id": "tile_mv5my8dk",
        "c": 14,
        "r": 70,
        "layer": "object3",
        "fx": true,
        "circuit": 2
      },
      {
        "id": "tile_mv5my8dk",
        "c": 34,
        "r": 58,
        "layer": "object3",
        "fx": true,
        "circuit": 2
      },
      {
        "id": "tile_mv5my8dk",
        "c": 28,
        "r": 58,
        "layer": "object3",
        "fx": true,
        "circuit": 2
      },
      {
        "id": "tile_mv5my8dk",
        "c": 43,
        "r": 55,
        "layer": "object3",
        "fx": true,
        "circuit": 2
      },
      {
        "id": "tile_mv5my8dk",
        "c": 58,
        "r": 80,
        "layer": "object3",
        "fx": true,
        "circuit": 3
      },
      {
        "id": "tile_mv5my8dk",
        "c": 48,
        "r": 67,
        "layer": "object3",
        "fx": true,
        "circuit": 3
      },
      {
        "id": "tile_mv5my8dk",
        "c": 60,
        "r": 69,
        "layer": "object3",
        "fx": true,
        "circuit": 3
      },
      {
        "id": "tile_mv5my8dk",
        "c": 70,
        "r": 72,
        "layer": "object3",
        "fx": true
      },
      {
        "id": "tile_mv5my8dk",
        "c": 65,
        "r": 76,
        "layer": "object3",
        "fx": true,
        "circuit": 3
      },
      {
        "id": "tile_mv5my8dk",
        "c": 63,
        "r": 55,
        "layer": "object3",
        "fx": true,
        "circuit": 3
      },
      {
        "id": "tile_mv5my8dk",
        "c": 3,
        "r": 42,
        "layer": "object3",
        "fx": true,
        "circuit": 1
      },
      {
        "id": "tile_mv5my8dk",
        "c": 7,
        "r": 42,
        "layer": "object3",
        "fx": true,
        "circuit": 1
      },
      {
        "id": "tile_mv5my8dk",
        "c": 14,
        "r": 49,
        "layer": "object3",
        "fx": true,
        "circuit": 1
      },
      {
        "id": "tile_mv5my8dk",
        "c": 11,
        "r": 36,
        "layer": "object3",
        "fx": true,
        "circuit": 1
      },
      {
        "id": "tile_mv5my8dk",
        "c": 18,
        "r": 44,
        "layer": "object3",
        "fx": true,
        "circuit": 1
      },
      {
        "id": "tile_mv5my8dk",
        "c": 29,
        "r": 44,
        "layer": "object3",
        "fx": true,
        "circuit": 1
      },
      {
        "id": "tile_mv5my8dk",
        "c": 42,
        "r": 23,
        "layer": "object3",
        "fx": true,
        "circuit": 4
      },
      {
        "id": "tile_mv5my8dk",
        "c": 49,
        "r": 23,
        "layer": "object3",
        "fx": true,
        "circuit": 4
      },
      {
        "id": "tile_mv5my8dk",
        "c": 43,
        "r": 36,
        "layer": "object3",
        "fx": true,
        "circuit": 4
      },
      {
        "id": "tile_mv5my8dk",
        "c": 52,
        "r": 37,
        "layer": "object3",
        "fx": true,
        "circuit": 4
      },
      {
        "id": "tile_mv5my8dk",
        "c": 57,
        "r": 29,
        "layer": "object3",
        "fx": true,
        "circuit": 4
      },
      {
        "id": "tile_mv5my8dk",
        "c": 34,
        "r": 13,
        "layer": "object3",
        "fx": true,
        "circuit": 4
      },
      {
        "id": "tile_mv5my8dk",
        "c": 57,
        "r": 13,
        "layer": "object3",
        "fx": true,
        "circuit": 4
      },
      {
        "id": "tile_interactive_storage_locker",
        "c": 60,
        "r": 53,
        "layer": "object2",
        "fx": false,
        "ox": 0,
        "oy": -18,
        "lockerLoot": {
          "kind": "item",
          "id": "backroom-door-key",
          "qty": 1
        }
      },
      {
        "id": "tile_interactive_storage_locker",
        "c": 51,
        "r": 53,
        "layer": "object2",
        "fx": false,
        "ox": 0,
        "oy": -18,
        "lockerLoot": {
          "kind": "item",
          "id": "thermos",
          "qty": 1
        }
      },
      {
        "id": "tile_interactive_storage_locker",
        "c": 48,
        "r": 68,
        "layer": "object2",
        "fx": false,
        "ox": 6,
        "oy": -4,
        "lockerLoot": {
          "kind": "item",
          "id": "backroom-door-key",
          "qty": 1
        }
      },
      {
        "id": "tile_interactive_storage_locker",
        "c": 60,
        "r": 80,
        "layer": "object2",
        "fx": false,
        "lockerLoot": {
          "kind": "bullet",
          "id": "flash",
          "qty": 1
        }
      },
      {
        "id": "tile_interactive_storage_locker",
        "c": 57,
        "r": 30,
        "layer": "object2",
        "fx": false,
        "lockerLoot": {
          "kind": "item",
          "id": "anomaly-firstaid",
          "qty": 1
        }
      },
      {
        "id": "tile_interactive_storage_locker",
        "c": 34,
        "r": 14,
        "layer": "object2",
        "fx": false,
        "lockerLoot": {
          "kind": "item",
          "id": "firstaid",
          "qty": 1
        }
      },
      {
        "id": "tile_interactive_storage_locker",
        "c": 17,
        "r": 26,
        "layer": "object2",
        "fx": false,
        "lockerLoot": {
          "kind": "item",
          "id": "youyou-card",
          "qty": 1
        }
      },
      {
        "id": "tile_new_decor_oil_drum",
        "c": 10,
        "r": 72,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_new_decor_oil_drum",
        "c": 43,
        "r": 74,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_new_decor_oil_drum",
        "c": 36,
        "r": 72,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_new_decor_oil_drum",
        "c": 43,
        "r": 66,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_new_decor_oil_drum",
        "c": 41,
        "r": 56,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_street_capsule_toy_machines",
        "c": 55,
        "r": 81,
        "layer": "object3",
        "fx": true,
        "ox": -2,
        "oy": -20,
        "sortDepth": 2.75
      },
      {
        "id": "tile_street_capsule_toy_machines",
        "c": 56,
        "r": 2,
        "layer": "object3",
        "fx": true,
        "ox": 18,
        "oy": -16
      },
      {
        "id": "tile_street_utility_box",
        "c": 40,
        "r": 49,
        "layer": "object3",
        "fx": true
      },
      {
        "id": "tile_street_utility_box_painted",
        "c": 63,
        "r": 71,
        "layer": "object3",
        "fx": true
      },
      {
        "id": "tile_street_utility_box_painted",
        "c": 2,
        "r": 64,
        "layer": "object3",
        "fx": true
      },
      {
        "id": "tile_street_utility_box_painted",
        "c": 42,
        "r": 38,
        "layer": "object3",
        "fx": true
      },
      {
        "id": "tile_street_drink_shop_wide",
        "c": 48,
        "r": 24,
        "layer": "object3"
      },
      {
        "id": "tile_interactive_storage_locker",
        "c": 2,
        "r": 2,
        "layer": "object2",
        "lockerLoot": {
          "kind": "bullet",
          "id": "shock",
          "qty": 1
        },
        "ox": 0,
        "oy": -14
      },
      {
        "id": "tile_interactive_storage_locker",
        "c": 4,
        "r": 2,
        "layer": "object2",
        "lockerLoot": {
          "kind": "bullet",
          "id": "heal",
          "qty": 1
        },
        "ox": -2,
        "oy": -14
      },
      {
        "id": "tile_interactive_storage_locker",
        "c": 6,
        "r": 2,
        "layer": "object2",
        "lockerLoot": {
          "kind": "item",
          "id": "anomaly-firstaid",
          "qty": 1
        },
        "ox": -4,
        "oy": -14
      },
      {
        "id": "tile_bg_backroom_door_wood",
        "c": 61,
        "r": 43,
        "layer": "object2",
        "doorMode": "key"
      },
      {
        "id": "tile_field_ammo_crate",
        "c": 6,
        "r": 64,
        "layer": "object2",
        "lockerLoot": {
          "kind": "bullet",
          "id": "knock",
          "qty": 1
        },
        "ox": 0,
        "oy": -18
      },
      {
        "id": "tile_field_ammo_crate",
        "c": 31,
        "r": 46,
        "layer": "object2",
        "lockerLoot": {
          "kind": "bullet",
          "id": "flash",
          "qty": 1
        },
        "ox": 0,
        "oy": -22
      },
      {
        "id": "tile_field_ammo_crate",
        "c": 66,
        "r": 78,
        "layer": "object2",
        "lockerLoot": {
          "kind": "bullet",
          "id": "sticky",
          "qty": 1
        },
        "ox": 0,
        "oy": -20
      },
      {
        "id": "tile_field_ammo_crate",
        "c": 35,
        "r": 32,
        "layer": "object2",
        "lockerLoot": {
          "kind": "item",
          "id": "firstaid",
          "qty": 1
        }
      },
      {
        "id": "tile_field_ammo_crate",
        "c": 2,
        "r": 44,
        "layer": "object2",
        "lockerLoot": {
          "kind": "item",
          "id": "medkit",
          "qty": 1
        },
        "ox": 0,
        "oy": -14
      },
      {
        "id": "tile_interactive_storage_locker",
        "c": 13,
        "r": 45,
        "layer": "object2",
        "ox": 0,
        "oy": -10,
        "lockerLoot": {
          "kind": "item",
          "id": "firstaid",
          "qty": 2
        }
      },
      {
        "id": "tile_mvnn2p1x",
        "c": 15,
        "r": 46,
        "layer": "object3",
        "ox": 2,
        "oy": -16
      },
      {
        "id": "tile_mvnn2p1x",
        "c": 70,
        "r": 37,
        "layer": "object3",
        "ox": -4,
        "oy": -6
      },
      {
        "id": "tile_field_ammo_crate",
        "c": 15,
        "r": 51,
        "layer": "object3",
        "ox": 0,
        "oy": -16,
        "lockerLoot": {
          "kind": "item",
          "id": "adrenaline",
          "qty": 1
        }
      },
      {
        "id": "tile_field_ammo_crate",
        "c": 39,
        "r": 25,
        "layer": "object2",
        "lockerLoot": {
          "kind": "item",
          "id": "toolbox",
          "qty": 1
        }
      },
      {
        "id": "tile_field_ammo_crate",
        "c": 71,
        "r": 29,
        "layer": "object2",
        "lockerLoot": {
          "kind": "item",
          "id": "anomaly-firstaid",
          "qty": 1
        }
      },
      {
        "id": "tile_field_ammo_crate",
        "c": 74,
        "r": 57,
        "layer": "object2",
        "ox": 0,
        "oy": -16,
        "lockerLoot": {
          "kind": "item",
          "id": "charm",
          "qty": 1
        }
      },
      {
        "id": "tile_street_sign_stop",
        "c": 21,
        "r": 34,
        "layer": "object3"
      },
      {
        "id": "tile_street_traffic_light",
        "c": 17,
        "r": 36,
        "layer": "object3"
      },
      {
        "id": "tile_street_crosswalk",
        "c": 3,
        "r": 9,
        "layer": "ground2",
        "rot": 1,
        "fx": false
      },
      {
        "id": "tile_mr4cyq54",
        "c": 6,
        "r": 35,
        "layer": "object2"
      },
      {
        "id": "tile_field_ammo_crate",
        "c": 58,
        "r": 15,
        "layer": "object2",
        "lockerLoot": {
          "kind": "item",
          "id": "eye-drops",
          "qty": 1
        },
        "ox": -2,
        "oy": -20
      },
      {
        "id": "tile_field_ammo_crate",
        "c": 65,
        "r": 30,
        "layer": "object",
        "lockerLoot": {
          "kind": "item",
          "id": "adrenaline",
          "qty": 1
        }
      },
      {
        "id": "tile_interactive_storage_locker",
        "c": 12,
        "r": 71,
        "layer": "object2",
        "lockerLoot": {
          "kind": "item",
          "id": "toolbox",
          "qty": 1
        }
      },
      {
        "id": "tile_mv5my8dk",
        "c": 41,
        "r": 13,
        "layer": "object3",
        "circuit": 4
      },
      {
        "id": "tile_field_ammo_crate",
        "c": 75,
        "r": 49,
        "layer": "object2",
        "lockerLoot": {
          "kind": "bullet",
          "id": "incendiary",
          "qty": 1
        }
      },
      {
        "id": "tile_field_ammo_crate",
        "c": 53,
        "r": 39,
        "layer": "object2",
        "ox": 0,
        "oy": -18,
        "lockerLoot": {
          "kind": "item",
          "id": "firstaid",
          "qty": 1
        }
      },
      {
        "id": "tile_dmg_rubble_pile_large",
        "c": 41,
        "r": 84,
        "layer": "ground"
      },
      {
        "id": "tile_dmg_rubble_pile_medium",
        "c": 3,
        "r": 75,
        "layer": "ground"
      },
      {
        "id": "tile_dmg_rubble_small",
        "c": 10,
        "r": 74,
        "layer": "ground"
      },
      {
        "id": "tile_dmg_floor_crater",
        "c": 34,
        "r": 73,
        "layer": "ground"
      },
      {
        "id": "tile_dmg_broken_wall_breach",
        "c": 40,
        "r": 79,
        "layer": "ground"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 39,
        "r": 79,
        "layer": "ground"
      },
      {
        "id": "tile_dmg_floor_stain_smudge",
        "c": 25,
        "r": 77,
        "layer": "ground"
      },
      {
        "id": "tile_dmg_floor_stain_smudge",
        "c": 35,
        "r": 62,
        "layer": "ground"
      },
      {
        "id": "tile_dmg_floor_stain_smudge",
        "c": 38,
        "r": 51,
        "layer": "ground"
      },
      {
        "id": "tile_dmg_floor_stain_smudge",
        "c": 63,
        "r": 59,
        "layer": "ground"
      },
      {
        "id": "tile_dmg_floor_stain_smudge",
        "c": 46,
        "r": 38,
        "layer": "ground"
      },
      {
        "id": "tile_dmg_floor_stain_smudge",
        "c": 46,
        "r": 16,
        "layer": "ground"
      },
      {
        "id": "tile_dmg_floor_stain_smudge",
        "c": 5,
        "r": 32,
        "layer": "ground"
      },
      {
        "id": "tile_dmg_crack05",
        "c": 24,
        "r": 62,
        "layer": "ground"
      },
      {
        "id": "tile_dmg_crack05",
        "c": 8,
        "r": 85,
        "layer": "ground"
      },
      {
        "id": "tile_dmg_crack05",
        "c": 51,
        "r": 72,
        "layer": "ground"
      },
      {
        "id": "tile_dmg_crack05",
        "c": 59,
        "r": 45,
        "layer": "ground"
      },
      {
        "id": "tile_dmg_crack05",
        "c": 74,
        "r": 37,
        "layer": "ground"
      },
      {
        "id": "tile_dmg_crack05",
        "c": 71,
        "r": 46,
        "layer": "ground"
      },
      {
        "id": "tile_dmg_crack05",
        "c": 20,
        "r": 38,
        "layer": "ground"
      },
      {
        "id": "tile_dmg_crack05",
        "c": 3,
        "r": 20,
        "layer": "ground"
      },
      {
        "id": "tile_dmg_rubble_scatter",
        "c": 61,
        "r": 29,
        "layer": "ground"
      },
      {
        "id": "tile_new_decor_crack04",
        "c": 59,
        "r": 60,
        "layer": "ground"
      },
      {
        "id": "tile_new_decor_crack04",
        "c": 2,
        "r": 29,
        "layer": "ground"
      },
      {
        "id": "tile_dmg_broken_pillar_rebar",
        "c": 39,
        "r": 58,
        "layer": "object"
      },
      {
        "id": "tile_dmg_broken_pillar_rebar",
        "c": 71,
        "r": 41,
        "layer": "ground"
      },
      {
        "id": "tile_dmg_rubble_brick_chunks",
        "c": 5,
        "r": 39,
        "layer": "ground"
      },
      {
        "id": "tile_dmg_rubble_brick_chunks",
        "c": 6,
        "r": 15,
        "layer": "ground"
      },
      {
        "id": "tile_dmg_rubble_brick_chunks",
        "c": 74,
        "r": 34,
        "layer": "ground"
      },
      {
        "id": "tile_dmg_rubble_small",
        "c": 71,
        "r": 36,
        "layer": "ground"
      },
      {
        "id": "tile_dmg_rubble_small",
        "c": 2,
        "r": 35,
        "layer": "ground"
      },
      {
        "id": "tile_dmg_rubble_small",
        "c": 14,
        "r": 39,
        "layer": "ground"
      },
      {
        "id": "tile_street_area_map_board",
        "c": 45,
        "r": 13,
        "layer": "object2",
        "ox": 0,
        "oy": -20
      },
      {
        "id": "tile_mvnn2p1x",
        "c": 51,
        "r": 69,
        "layer": "object2",
        "ox": 2,
        "oy": -12
      },
      {
        "id": "tile_street_bollard_yellow",
        "c": 18,
        "r": 37,
        "layer": "object2"
      },
      {
        "id": "tile_street_bollard_yellow",
        "c": 19,
        "r": 37,
        "layer": "object2"
      },
      {
        "id": "tile_street_bollard_yellow",
        "c": 20,
        "r": 37,
        "layer": "object2"
      },
      {
        "id": "tile_street_bollard_yellow",
        "c": 21,
        "r": 37,
        "layer": "object2"
      },
      {
        "id": "tile_obstacle_wirefence_h",
        "c": 6,
        "r": 83,
        "layer": "object2"
      },
      {
        "id": "tile_obstacle_wirefence_h",
        "c": 9,
        "r": 83,
        "layer": "object2"
      },
      {
        "id": "tile_obstacle_ore_rare",
        "c": 60,
        "r": 35,
        "layer": "object2"
      },
      {
        "id": "tile_obstacle_ore_rare",
        "c": 74,
        "r": 28,
        "layer": "object2"
      },
      {
        "id": "tile_obstacle_ore_large",
        "c": 28,
        "r": 60,
        "layer": "object2"
      },
      {
        "id": "tile_obstacle_ore_large",
        "c": 36,
        "r": 15,
        "layer": "object2"
      },
      {
        "id": "tile_obstacle_ore_large",
        "c": 45,
        "r": 33,
        "layer": "object2"
      },
      {
        "id": "tile_obstacle_ore_large",
        "c": 56,
        "r": 15,
        "layer": "object2"
      },
      {
        "id": "tile_obstacle_ore_large",
        "c": 2,
        "r": 68,
        "layer": "object2",
        "fx": true,
        "ox": -18,
        "oy": -4
      },
      {
        "id": "tile_obstacle_ore_rare",
        "c": 2,
        "r": 38,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_dmg_crack05",
        "c": 32,
        "r": 30,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 1,
        "r": 10,
        "layer": "floor",
        "fx": false
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 4,
        "r": 10,
        "layer": "floor",
        "fx": false
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 1,
        "r": 7,
        "layer": "floor",
        "fx": false
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 4,
        "r": 7,
        "layer": "floor",
        "fx": false
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 1,
        "r": 4,
        "layer": "floor",
        "fx": false
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 4,
        "r": 4,
        "layer": "floor",
        "fx": false
      },
      {
        "id": "tile_mr4czvpx",
        "c": 8,
        "r": 11,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 8,
        "r": 12,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 8,
        "r": 4,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 8,
        "r": 5,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 8,
        "r": 6,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 8,
        "r": 7,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 8,
        "r": 8,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 8,
        "r": 9,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 8,
        "r": 10,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 1,
        "r": 4,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 1,
        "r": 5,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 1,
        "r": 6,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 1,
        "r": 7,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 1,
        "r": 8,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 1,
        "r": 9,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 1,
        "r": 10,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 1,
        "r": 11,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 1,
        "r": 12,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4ct8od",
        "c": 27,
        "r": 81,
        "layer": "ground2"
      },
      {
        "id": "tile_mr4ct8od",
        "c": 27,
        "r": 79,
        "layer": "ground2"
      },
      {
        "id": "tile_mr4ct8od",
        "c": 27,
        "r": 77,
        "layer": "ground2"
      },
      {
        "id": "tile_mr4ct8od",
        "c": 27,
        "r": 75,
        "layer": "ground2"
      },
      {
        "id": "tile_mr4cyc49",
        "c": 31,
        "r": 81,
        "layer": "ground2"
      },
      {
        "id": "tile_mr4cyc49",
        "c": 31,
        "r": 79,
        "layer": "ground2"
      },
      {
        "id": "tile_mr4cyc49",
        "c": 31,
        "r": 77,
        "layer": "ground2"
      },
      {
        "id": "tile_mr4cyc49",
        "c": 31,
        "r": 75,
        "layer": "ground2"
      },
      {
        "id": "tile_mvcsj5eh",
        "c": 29,
        "r": 71,
        "layer": "object2"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 31,
        "r": 85,
        "layer": "object"
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 30,
        "r": 83,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 42,
        "r": 86,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 44,
        "r": 84,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 31,
        "r": 85,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 34,
        "r": 85,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 37,
        "r": 85,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 40,
        "r": 85,
        "layer": "floor"
      },
      {
        "id": "tile_field_ammo_crate",
        "c": 40,
        "r": 82,
        "layer": "ground",
        "lockerLoot": {
          "kind": "item",
          "id": "firstaid",
          "qty": 1
        }
      },
      {
        "id": "tile_mr4ct8od",
        "c": 36,
        "r": 61,
        "layer": "ground2"
      },
      {
        "id": "tile_mr4ct8od",
        "c": 36,
        "r": 59,
        "layer": "ground2"
      },
      {
        "id": "tile_mr4ct8od",
        "c": 36,
        "r": 57,
        "layer": "ground2"
      },
      {
        "id": "tile_mr4ct8od",
        "c": 36,
        "r": 55,
        "layer": "ground2"
      },
      {
        "id": "tile_mr4ct8od",
        "c": 36,
        "r": 53,
        "layer": "ground2"
      },
      {
        "id": "tile_mr4ct8od",
        "c": 36,
        "r": 51,
        "layer": "ground2"
      },
      {
        "id": "tile_mr4cyc49",
        "c": 39,
        "r": 51,
        "layer": "ground2"
      },
      {
        "id": "tile_mr4cyc49",
        "c": 39,
        "r": 53,
        "layer": "ground2"
      },
      {
        "id": "tile_mr4cyc49",
        "c": 39,
        "r": 55,
        "layer": "ground2"
      },
      {
        "id": "tile_mr4cyc49",
        "c": 39,
        "r": 57,
        "layer": "ground2"
      },
      {
        "id": "tile_mr4cyc49",
        "c": 39,
        "r": 59,
        "layer": "ground2"
      },
      {
        "id": "tile_mr4cyc49",
        "c": 39,
        "r": 61,
        "layer": "ground2"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 7,
        "r": 35,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 7,
        "r": 33,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 7,
        "r": 31,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 7,
        "r": 29,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 7,
        "r": 27,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 7,
        "r": 25,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 7,
        "r": 23,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 7,
        "r": 21,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 7,
        "r": 19,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 7,
        "r": 17,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 7,
        "r": 15,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 7,
        "r": 13,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 7,
        "r": 11,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 7,
        "r": 9,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 7,
        "r": 7,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 7,
        "r": 5,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_m",
        "c": 7,
        "r": 3,
        "layer": "floor"
      },
      {
        "id": "tile_mr4ct8od",
        "c": 2,
        "r": 28,
        "layer": "ground2"
      },
      {
        "id": "tile_mr4ct8od",
        "c": 2,
        "r": 25,
        "layer": "ground2"
      },
      {
        "id": "tile_mr4ct8od",
        "c": 2,
        "r": 22,
        "layer": "ground2"
      },
      {
        "id": "tile_mr4ct8od",
        "c": 2,
        "r": 19,
        "layer": "ground2"
      },
      {
        "id": "tile_mr4ct8od",
        "c": 2,
        "r": 16,
        "layer": "ground2"
      },
      {
        "id": "tile_mr4cyc49",
        "c": 5,
        "r": 28,
        "layer": "ground2"
      },
      {
        "id": "tile_mr4cyc49",
        "c": 5,
        "r": 25,
        "layer": "ground2"
      },
      {
        "id": "tile_mr4cyc49",
        "c": 5,
        "r": 22,
        "layer": "ground2"
      },
      {
        "id": "tile_mr4cyc49",
        "c": 5,
        "r": 19,
        "layer": "ground2"
      },
      {
        "id": "tile_mr4cyc49",
        "c": 5,
        "r": 16,
        "layer": "ground2"
      },
      {
        "id": "tile_mrt_floor_tile_strip",
        "c": 2,
        "r": 8,
        "layer": "ground"
      },
      {
        "id": "tile_mrt_floor_tile_strip",
        "c": 5,
        "r": 8,
        "layer": "ground"
      },
      {
        "id": "tile_mrt_floor_tile_strip",
        "c": 2,
        "r": 4,
        "layer": "ground"
      },
      {
        "id": "tile_mrt_floor_tile_strip",
        "c": 5,
        "r": 4,
        "layer": "ground"
      },
      {
        "id": "tile_obstacle_searchlight_h",
        "c": 25,
        "r": 77,
        "layer": "object2"
      },
      {
        "id": "tile_obstacle_searchlight_h",
        "c": 41,
        "r": 77,
        "layer": "object2"
      },
      {
        "id": "tile_obstacle_searchlight_h",
        "c": 34,
        "r": 83,
        "layer": "object2"
      },
      {
        "id": "tile_bg_electric_light",
        "c": 26,
        "r": 70,
        "layer": "object2"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 29,
        "r": 69,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 27,
        "r": 70,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 28,
        "r": 70,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 75,
        "r": 66,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 78,
        "r": 66,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 81,
        "r": 66,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 84,
        "r": 66,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 84,
        "r": 63,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 81,
        "r": 63,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 81,
        "r": 60,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 84,
        "r": 60,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 81,
        "r": 57,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 84,
        "r": 57,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 81,
        "r": 54,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 84,
        "r": 54,
        "layer": "floor"
      },
      {
        "id": "tile_mrt_escalator_front_high02",
        "c": 82,
        "r": 45,
        "layer": "ground",
        "ox": 0,
        "oy": -8
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 75,
        "r": 67,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 77,
        "r": 63,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 78,
        "r": 63,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 77,
        "r": 67,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 78,
        "r": 67,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 79,
        "r": 67,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 80,
        "r": 67,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 81,
        "r": 67,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 85,
        "r": 67,
        "layer": "object"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 87,
        "r": 66,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa16jw",
        "c": 79,
        "r": 62,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa16jw",
        "c": 75,
        "r": 62,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 86,
        "r": 67,
        "layer": "object"
      },
      {
        "id": "tile_bg_extra_high_pillar02",
        "c": 80,
        "r": 44,
        "layer": "object"
      },
      {
        "id": "tile_bg_extra_high_pillar02",
        "c": 88,
        "r": 44,
        "layer": "object"
      },
      {
        "id": "tile_bg_extra_high_wall02",
        "c": 81,
        "r": 45,
        "layer": "object"
      },
      {
        "id": "tile_bg_extra_high_wall02",
        "c": 87,
        "r": 45,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 80,
        "r": 43,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 83,
        "r": 43,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 86,
        "r": 43,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 80,
        "r": 40,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 83,
        "r": 40,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 86,
        "r": 40,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 80,
        "r": 37,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 83,
        "r": 37,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 86,
        "r": 37,
        "layer": "floor"
      },
      {
        "id": "tile_mrt_exit_2_sealed",
        "c": 82,
        "r": 32,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 80,
        "r": 33,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 88,
        "r": 33,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 81,
        "r": 34,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 87,
        "r": 34,
        "layer": "object"
      },
      {
        "id": "tile_mrt_ticket_gate",
        "c": 83,
        "r": 40,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyu5g",
        "c": 81,
        "r": 39,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyu5g",
        "c": 82,
        "r": 39,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyu5g",
        "c": 86,
        "r": 39,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyu5g",
        "c": 87,
        "r": 39,
        "layer": "object"
      },
      {
        "id": "tile_interactive_storage_locker",
        "c": 81,
        "r": 40,
        "layer": "object2",
        "ox": 0,
        "oy": -12
      },
      {
        "id": "tile_interactive_storage_locker",
        "c": 86,
        "r": 40,
        "layer": "object2",
        "ox": 0,
        "oy": -14
      },
      {
        "id": "tile_obstacle_ore_rare",
        "c": 86,
        "r": 36,
        "layer": "object2"
      },
      {
        "id": "tile_obstacle_ore_large",
        "c": 86,
        "r": 65,
        "layer": "object2"
      },
      {
        "id": "tile_obstacle_ore_large",
        "c": 68,
        "r": 74,
        "layer": "object2"
      },
      {
        "id": "tile_obstacle_ore_large",
        "c": 71,
        "r": 57,
        "layer": "object2"
      },
      {
        "id": "tile_obstacle_ore_small",
        "c": 81,
        "r": 44,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_obstacle_ore_small",
        "c": 57,
        "r": 69,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_wall02_crack_breakable",
        "c": 57,
        "r": 65,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_dmg_broken_wall_right",
        "c": 85,
        "r": 57,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_dmg_broken_wall_right",
        "c": 81,
        "r": 60,
        "layer": "object2"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 82,
        "r": 69,
        "layer": "ground4"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 82,
        "r": 72,
        "layer": "ground4"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 82,
        "r": 75,
        "layer": "ground4"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 82,
        "r": 78,
        "layer": "ground4"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 79,
        "r": 78,
        "layer": "ground4"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 85,
        "r": 78,
        "layer": "ground4"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 79,
        "r": 81,
        "layer": "ground4"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 82,
        "r": 81,
        "layer": "ground4"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 85,
        "r": 81,
        "layer": "ground4"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 78,
        "r": 81,
        "layer": "object5"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 87,
        "r": 81,
        "layer": "object5",
        "fx": true
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 87,
        "r": 75,
        "layer": "object5",
        "fx": true
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 78,
        "r": 75,
        "layer": "object5"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 80,
        "r": 82,
        "layer": "object5"
      },
      {
        "id": "tile_bg_backroom_wall02",
        "c": 83,
        "r": 82,
        "layer": "object5"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 86,
        "r": 82,
        "layer": "object5"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 85,
        "r": 74,
        "layer": "object5"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 80,
        "r": 74,
        "layer": "object5",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 78,
        "r": 78,
        "layer": "object5",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 78,
        "r": 79,
        "layer": "object5",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 78,
        "r": 80,
        "layer": "object5",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 88,
        "r": 80,
        "layer": "object5",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 88,
        "r": 79,
        "layer": "object5",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 88,
        "r": 78,
        "layer": "object5",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 81,
        "r": 73,
        "layer": "object5",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 81,
        "r": 72,
        "layer": "object5",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 81,
        "r": 71,
        "layer": "object5",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 81,
        "r": 70,
        "layer": "object5",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 85,
        "r": 70,
        "layer": "object5",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 85,
        "r": 71,
        "layer": "object5",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 85,
        "r": 72,
        "layer": "object5",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 85,
        "r": 73,
        "layer": "object5",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 81,
        "r": 69,
        "layer": "object6",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 81,
        "r": 68,
        "layer": "object6",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 85,
        "r": 69,
        "layer": "object6",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 85,
        "r": 68,
        "layer": "object6",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_wall02_secret",
        "c": 82,
        "r": 67,
        "layer": "object3",
        "fx": true
      },
      {
        "id": "tile_interactive_storage_locker",
        "c": 79,
        "r": 76,
        "layer": "object6",
        "lockerLoot": {
          "kind": "item",
          "id": "anomaly-firstaid",
          "qty": 1
        },
        "ox": 8,
        "oy": -16,
        "sortDepth": 2.75
      },
      {
        "id": "tile_interactive_storage_locker",
        "c": 86,
        "r": 76,
        "layer": "object6",
        "ox": -18,
        "oy": -16,
        "lockerLoot": {
          "kind": "item",
          "id": "charm",
          "qty": 1
        },
        "sortDepth": 2.75
      },
      {
        "id": "tile_field_ammo_crate",
        "c": 79,
        "r": 79,
        "layer": "object6",
        "lockerLoot": {
          "kind": "bullet",
          "id": "shock",
          "qty": 1
        }
      },
      {
        "id": "tile_field_ammo_crate",
        "c": 81,
        "r": 79,
        "layer": "object6",
        "lockerLoot": {
          "kind": "bullet",
          "id": "sticky",
          "qty": 1
        }
      },
      {
        "id": "tile_field_ammo_crate",
        "c": 83,
        "r": 79,
        "layer": "object6",
        "lockerLoot": {
          "kind": "bullet",
          "id": "flash",
          "qty": 1
        }
      },
      {
        "id": "tile_field_ammo_crate",
        "c": 85,
        "r": 79,
        "layer": "object6",
        "lockerLoot": {
          "kind": "bullet",
          "id": "heal",
          "qty": 1
        }
      },
      {
        "id": "tile_field_ammo_crate",
        "c": 87,
        "r": 79,
        "layer": "object6",
        "lockerLoot": {
          "kind": "bullet",
          "id": "knock",
          "qty": 1
        }
      },
      {
        "id": "tile_obstacle_ore_rare",
        "c": 83,
        "r": 74,
        "layer": "object6"
      },
      {
        "id": "tile_obstacle_ore_rare",
        "c": 82,
        "r": 70,
        "layer": "object6",
        "fx": true
      }
    ],
    "solid": [
      "1,0",
      "2,0",
      "3,0",
      "4,0",
      "5,0",
      "6,0",
      "7,0",
      "8,0",
      "9,0",
      "0,0",
      "0,1",
      "0,2",
      "1,1",
      "2,1",
      "3,1",
      "4,1",
      "5,1",
      "6,1",
      "7,1",
      "8,1",
      "9,1",
      "1,2",
      "2,2",
      "3,2",
      "4,2",
      "5,2",
      "6,2",
      "7,2",
      "8,2",
      "9,2",
      "0,3",
      "1,3",
      "2,3",
      "3,3",
      "4,3",
      "5,3",
      "6,3",
      "7,3",
      "8,3",
      "9,3",
      "10,3",
      "10,0",
      "10,2",
      "10,1",
      "11,0",
      "11,1",
      "11,2",
      "11,3",
      "12,4",
      "12,5",
      "12,6",
      "12,7",
      "12,8",
      "12,9",
      "12,10",
      "9,4",
      "9,5",
      "9,6",
      "9,8",
      "9,9",
      "9,10",
      "9,11",
      "9,12",
      "9,13",
      "9,7",
      "10,5",
      "10,6",
      "10,7",
      "10,8",
      "10,9",
      "10,10",
      "10,11",
      "10,12",
      "10,13",
      "11,4",
      "11,5",
      "11,6",
      "11,7",
      "11,8",
      "11,9",
      "11,10",
      "11,11",
      "11,12",
      "11,13",
      "10,4",
      "0,9",
      "0,10",
      "0,11",
      "0,12",
      "0,13",
      "0,14",
      "1,14",
      "1,13",
      "1,12",
      "1,11",
      "1,10",
      "1,9",
      "1,4",
      "1,5",
      "1,6",
      "1,7",
      "1,8",
      "0,4",
      "0,5",
      "0,6",
      "0,7",
      "0,8",
      "0,16",
      "0,17",
      "0,18",
      "0,19",
      "0,20",
      "0,21",
      "0,22",
      "0,23",
      "0,15",
      "1,15",
      "1,16",
      "1,17",
      "1,18",
      "1,19",
      "1,20",
      "1,21",
      "1,22",
      "0,28",
      "0,29",
      "0,30",
      "0,31",
      "0,32",
      "0,33",
      "0,34",
      "0,35",
      "0,24",
      "0,25",
      "0,26",
      "0,27",
      "1,23",
      "1,24",
      "1,26",
      "1,28",
      "1,29",
      "1,30",
      "1,31",
      "1,32",
      "1,33",
      "1,34",
      "1,35",
      "1,36",
      "1,25",
      "1,27",
      "0,36",
      "0,37",
      "0,38",
      "0,39",
      "0,40",
      "0,41",
      "0,42",
      "0,43",
      "0,44",
      "0,45",
      "0,46",
      "0,51",
      "1,37",
      "1,38",
      "1,39",
      "1,40",
      "1,42",
      "1,43",
      "1,44",
      "1,45",
      "1,46",
      "1,47",
      "1,48",
      "1,49",
      "1,51",
      "1,41",
      "0,47",
      "0,48",
      "0,49",
      "0,50",
      "1,50",
      "0,52",
      "1,52",
      "2,52",
      "3,52",
      "4,52",
      "5,52",
      "6,52",
      "0,53",
      "1,53",
      "2,53",
      "3,53",
      "4,53",
      "5,53",
      "6,53",
      "0,54",
      "1,54",
      "2,54",
      "3,54",
      "4,54",
      "5,54",
      "6,54",
      "0,55",
      "1,55",
      "2,55",
      "3,55",
      "4,55",
      "5,55",
      "6,55",
      "0,56",
      "1,56",
      "2,56",
      "3,56",
      "4,56",
      "5,56",
      "6,56",
      "2,51",
      "3,51",
      "4,51",
      "5,51",
      "6,51",
      "2,50",
      "3,50",
      "4,50",
      "5,50",
      "6,50",
      "7,50",
      "7,51",
      "7,52",
      "7,53",
      "7,54",
      "7,55",
      "7,56",
      "7,57",
      "7,58",
      "7,59",
      "7,60",
      "7,61",
      "7,62",
      "7,63",
      "7,64",
      "6,64",
      "5,64",
      "4,64",
      "3,64",
      "2,64",
      "1,64",
      "6,63",
      "5,63",
      "4,63",
      "3,63",
      "2,63",
      "1,63",
      "6,62",
      "5,62",
      "4,62",
      "3,62",
      "2,62",
      "1,62",
      "3,65",
      "2,65",
      "1,65",
      "5,61",
      "4,61",
      "3,61",
      "2,61",
      "1,61",
      "6,61",
      "6,60",
      "6,59",
      "6,58",
      "6,57",
      "0,57",
      "1,57",
      "2,57",
      "3,57",
      "4,57",
      "5,57",
      "0,58",
      "1,58",
      "2,58",
      "3,58",
      "4,58",
      "5,59",
      "5,60",
      "4,60",
      "3,60",
      "2,60",
      "1,60",
      "0,60",
      "0,59",
      "1,59",
      "2,59",
      "3,59",
      "4,59",
      "5,58",
      "0,61",
      "0,62",
      "0,63",
      "0,64",
      "0,65",
      "0,66",
      "0,67",
      "0,68",
      "0,69",
      "0,70",
      "0,71",
      "0,73",
      "1,66",
      "1,67",
      "1,68",
      "1,69",
      "1,70",
      "1,71",
      "1,72",
      "0,72",
      "0,74",
      "0,75",
      "1,75",
      "1,76",
      "1,77",
      "1,78",
      "1,79",
      "1,80",
      "1,81",
      "1,82",
      "1,83",
      "1,84",
      "0,76",
      "0,77",
      "0,78",
      "0,79",
      "0,85",
      "0,86",
      "0,87",
      "0,88",
      "0,80",
      "0,81",
      "0,82",
      "0,83",
      "1,73",
      "1,74",
      "0,84",
      "2,78",
      "3,78",
      "4,78",
      "4,79",
      "3,79",
      "2,79",
      "2,80",
      "2,81",
      "2,82",
      "3,82",
      "3,84",
      "4,83",
      "4,82",
      "4,81",
      "4,80",
      "3,80",
      "3,81",
      "2,83",
      "3,83",
      "2,84",
      "1,85",
      "1,86",
      "1,87",
      "1,88",
      "0,89",
      "1,89",
      "2,89",
      "3,89",
      "4,89",
      "5,89",
      "4,84",
      "4,85",
      "4,86",
      "4,87",
      "4,88",
      "3,88",
      "2,88",
      "2,87",
      "2,86",
      "2,85",
      "3,85",
      "3,86",
      "3,87",
      "5,88",
      "5,87",
      "5,86",
      "5,85",
      "5,84",
      "5,83",
      "5,82",
      "5,81",
      "5,80",
      "5,79",
      "5,78",
      "11,84",
      "11,85",
      "11,86",
      "11,87",
      "11,88",
      "11,89",
      "12,85",
      "13,85",
      "14,85",
      "15,85",
      "16,84",
      "17,84",
      "18,84",
      "19,85",
      "20,85",
      "21,85",
      "22,85",
      "23,85",
      "24,85",
      "25,85",
      "26,84",
      "27,84",
      "28,84",
      "29,84",
      "30,84",
      "31,84",
      "44,85",
      "45,85",
      "44,84",
      "45,84",
      "12,84",
      "13,84",
      "14,84",
      "15,84",
      "16,85",
      "17,85",
      "18,85",
      "19,84",
      "20,84",
      "21,84",
      "22,84",
      "23,84",
      "24,84",
      "25,84",
      "26,85",
      "27,85",
      "28,85",
      "29,85",
      "30,85",
      "31,85",
      "12,86",
      "13,86",
      "15,86",
      "18,86",
      "22,86",
      "26,86",
      "29,86",
      "32,86",
      "34,86",
      "36,86",
      "37,86",
      "38,86",
      "39,86",
      "40,86",
      "41,86",
      "42,86",
      "43,86",
      "44,86",
      "45,86",
      "46,86",
      "14,86",
      "12,87",
      "12,88",
      "12,89",
      "13,89",
      "14,89",
      "15,89",
      "16,89",
      "17,89",
      "18,88",
      "17,87",
      "16,87",
      "15,87",
      "14,87",
      "13,87",
      "13,88",
      "14,88",
      "15,88",
      "16,88",
      "17,86",
      "16,86",
      "17,88",
      "19,87",
      "20,87",
      "21,87",
      "23,87",
      "24,87",
      "25,87",
      "26,87",
      "27,87",
      "28,87",
      "29,87",
      "30,87",
      "31,87",
      "32,87",
      "33,87",
      "34,87",
      "35,87",
      "36,87",
      "37,87",
      "38,87",
      "39,87",
      "40,87",
      "41,87",
      "42,87",
      "43,87",
      "44,87",
      "45,87",
      "46,87",
      "18,87",
      "19,86",
      "20,86",
      "21,86",
      "19,89",
      "20,89",
      "21,89",
      "22,89",
      "23,89",
      "24,89",
      "25,89",
      "26,89",
      "27,89",
      "28,89",
      "29,89",
      "18,89",
      "20,88",
      "21,88",
      "22,88",
      "23,88",
      "24,88",
      "25,88",
      "26,88",
      "27,88",
      "28,88",
      "29,88",
      "30,88",
      "31,88",
      "32,88",
      "33,88",
      "34,88",
      "19,88",
      "22,87",
      "24,86",
      "25,86",
      "23,86",
      "27,86",
      "28,86",
      "30,86",
      "31,86",
      "33,86",
      "30,89",
      "31,89",
      "32,89",
      "33,89",
      "34,89",
      "35,89",
      "36,89",
      "37,89",
      "38,89",
      "39,89",
      "40,89",
      "41,89",
      "42,89",
      "43,89",
      "44,89",
      "45,89",
      "46,89",
      "47,89",
      "35,88",
      "36,88",
      "37,88",
      "38,88",
      "40,88",
      "41,88",
      "42,88",
      "43,88",
      "44,88",
      "45,88",
      "46,88",
      "35,86",
      "39,88",
      "45,80",
      "45,81",
      "44,81",
      "44,82",
      "44,83",
      "45,83",
      "46,83",
      "46,82",
      "45,82",
      "44,76",
      "44,77",
      "44,78",
      "44,79",
      "44,80",
      "45,76",
      "45,77",
      "45,78",
      "45,79",
      "46,77",
      "46,78",
      "46,79",
      "46,80",
      "46,81",
      "46,76",
      "47,77",
      "47,78",
      "47,79",
      "47,80",
      "47,81",
      "47,82",
      "47,83",
      "47,84",
      "47,85",
      "47,86",
      "46,84",
      "46,85",
      "47,87",
      "47,88",
      "48,89",
      "51,89",
      "53,89",
      "56,89",
      "59,89",
      "61,89",
      "62,89",
      "63,89",
      "64,89",
      "65,89",
      "66,89",
      "67,89",
      "68,89",
      "69,89",
      "70,89",
      "71,89",
      "72,89",
      "73,89",
      "74,89",
      "50,89",
      "49,89",
      "48,88",
      "48,87",
      "48,86",
      "48,85",
      "48,84",
      "48,83",
      "48,82",
      "48,81",
      "48,80",
      "48,79",
      "49,79",
      "49,80",
      "49,81",
      "49,82",
      "49,83",
      "50,83",
      "50,84",
      "50,85",
      "50,86",
      "49,88",
      "49,86",
      "49,85",
      "49,84",
      "50,80",
      "50,81",
      "50,82",
      "51,79",
      "51,80",
      "51,81",
      "51,82",
      "51,83",
      "51,84",
      "51,85",
      "51,86",
      "50,88",
      "49,87",
      "50,87",
      "51,87",
      "51,88",
      "52,88",
      "53,88",
      "54,88",
      "55,88",
      "56,88",
      "57,88",
      "58,88",
      "59,88",
      "60,88",
      "61,88",
      "62,88",
      "63,88",
      "64,88",
      "65,88",
      "66,88",
      "67,88",
      "68,88",
      "69,88",
      "70,88",
      "52,89",
      "54,89",
      "55,89",
      "57,89",
      "58,89",
      "79,89",
      "78,89",
      "77,89",
      "76,89",
      "75,89",
      "71,88",
      "72,88",
      "73,88",
      "74,88",
      "75,88",
      "76,88",
      "77,88",
      "78,88",
      "79,88",
      "79,87",
      "78,87",
      "77,87",
      "76,87",
      "75,87",
      "74,87",
      "73,87",
      "72,87",
      "71,87",
      "70,87",
      "69,87",
      "68,87",
      "67,87",
      "66,87",
      "65,87",
      "64,87",
      "63,87",
      "62,87",
      "61,87",
      "60,87",
      "59,87",
      "58,87",
      "57,87",
      "56,87",
      "55,87",
      "54,87",
      "53,87",
      "52,87",
      "53,86",
      "54,86",
      "55,86",
      "56,86",
      "57,86",
      "58,86",
      "59,86",
      "60,86",
      "61,86",
      "62,86",
      "63,86",
      "64,86",
      "65,86",
      "66,86",
      "67,86",
      "68,86",
      "69,86",
      "70,86",
      "71,86",
      "72,86",
      "73,86",
      "74,86",
      "75,86",
      "76,86",
      "77,86",
      "78,86",
      "79,86",
      "52,86",
      "52,85",
      "52,84",
      "52,83",
      "52,82",
      "52,81",
      "52,80",
      "52,79",
      "50,79",
      "48,78",
      "49,78",
      "50,78",
      "51,78",
      "52,78",
      "53,78",
      "54,78",
      "55,78",
      "48,77",
      "49,77",
      "50,77",
      "51,77",
      "52,77",
      "53,77",
      "54,77",
      "55,77",
      "53,79",
      "54,79",
      "55,79",
      "56,79",
      "57,79",
      "58,79",
      "56,77",
      "56,78",
      "57,77",
      "57,78",
      "58,77",
      "58,78",
      "55,76",
      "56,76",
      "57,76",
      "58,76",
      "58,75",
      "57,75",
      "56,75",
      "55,75",
      "55,74",
      "56,74",
      "57,74",
      "58,74",
      "59,75",
      "59,76",
      "59,77",
      "59,78",
      "59,79",
      "59,80",
      "58,80",
      "58,81",
      "59,74",
      "54,74",
      "54,75",
      "54,76",
      "47,76",
      "47,75",
      "47,74",
      "47,73",
      "47,72",
      "47,71",
      "48,69",
      "48,68",
      "48,67",
      "47,67",
      "47,68",
      "47,69",
      "47,70",
      "48,70",
      "49,70",
      "49,67",
      "49,68",
      "49,69",
      "50,68",
      "50,69",
      "50,67",
      "51,67",
      "52,67",
      "53,67",
      "54,67",
      "55,68",
      "56,68",
      "56,69",
      "55,69",
      "54,69",
      "53,69",
      "52,69",
      "51,68",
      "52,68",
      "53,68",
      "54,68",
      "55,67",
      "56,67",
      "44,75",
      "45,75",
      "46,75",
      "44,74",
      "44,73",
      "44,72",
      "44,71",
      "44,70",
      "44,69",
      "45,68",
      "45,67",
      "46,67",
      "46,68",
      "46,69",
      "46,70",
      "46,71",
      "46,72",
      "46,73",
      "46,74",
      "45,74",
      "45,73",
      "45,72",
      "45,71",
      "45,70",
      "45,69",
      "67,85",
      "67,84",
      "67,83",
      "67,82",
      "67,81",
      "67,80",
      "67,79",
      "53,85",
      "53,84",
      "53,83",
      "53,82",
      "53,81",
      "59,82",
      "58,82",
      "57,82",
      "56,82",
      "55,82",
      "54,82",
      "59,81",
      "57,81",
      "56,81",
      "55,81",
      "54,81",
      "53,80",
      "54,80",
      "55,80",
      "56,80",
      "57,80",
      "60,78",
      "61,78",
      "62,78",
      "63,78",
      "63,77",
      "62,77",
      "61,77",
      "60,77",
      "65,77",
      "66,77",
      "67,77",
      "65,78",
      "66,78",
      "68,78",
      "69,78",
      "70,78",
      "67,78",
      "69,77",
      "70,77",
      "71,77",
      "72,77",
      "73,77",
      "74,77",
      "75,77",
      "75,78",
      "74,78",
      "73,78",
      "72,78",
      "71,78",
      "68,77",
      "60,89",
      "68,85",
      "69,85",
      "70,85",
      "71,85",
      "72,84",
      "73,84",
      "74,84",
      "75,84",
      "76,84",
      "77,84",
      "78,84",
      "79,85",
      "78,85",
      "77,85",
      "76,85",
      "75,85",
      "74,85",
      "73,85",
      "72,85",
      "68,84",
      "69,84",
      "70,84",
      "71,84",
      "71,83",
      "70,83",
      "69,83",
      "68,83",
      "68,82",
      "68,81",
      "68,80",
      "69,80",
      "69,79",
      "70,79",
      "71,79",
      "72,79",
      "73,79",
      "74,79",
      "74,80",
      "75,80",
      "75,81",
      "74,81",
      "74,82",
      "73,82",
      "72,82",
      "71,82",
      "70,82",
      "69,82",
      "69,81",
      "70,81",
      "71,81",
      "72,81",
      "73,81",
      "73,80",
      "72,80",
      "71,80",
      "70,80",
      "68,79",
      "75,79",
      "76,79",
      "77,79",
      "77,80",
      "77,81",
      "76,81",
      "76,82",
      "74,83",
      "73,83",
      "72,83",
      "75,82",
      "76,80",
      "76,83",
      "77,83",
      "78,83",
      "79,83",
      "79,84",
      "75,83",
      "78,82",
      "79,82",
      "78,80",
      "78,79",
      "78,78",
      "78,77",
      "78,81",
      "77,82",
      "75,68",
      "75,69",
      "75,70",
      "75,71",
      "75,72",
      "75,73",
      "75,74",
      "75,75",
      "75,76",
      "77,78",
      "77,76",
      "76,78",
      "77,77",
      "76,77",
      "76,76",
      "76,75",
      "76,74",
      "76,73",
      "76,72",
      "77,71",
      "77,70",
      "77,68",
      "79,68",
      "79,69",
      "79,70",
      "79,73",
      "79,74",
      "79,75",
      "78,76",
      "78,75",
      "78,74",
      "78,73",
      "78,72",
      "78,71",
      "78,70",
      "78,69",
      "78,68",
      "79,72",
      "77,73",
      "77,74",
      "77,75",
      "77,72",
      "79,71",
      "76,71",
      "76,70",
      "76,68",
      "76,65",
      "76,64",
      "76,63",
      "76,62",
      "76,61",
      "76,60",
      "76,59",
      "76,58",
      "76,57",
      "76,56",
      "75,56",
      "75,57",
      "75,58",
      "75,59",
      "75,60",
      "75,61",
      "75,62",
      "75,63",
      "75,64",
      "75,65",
      "76,69",
      "77,69",
      "77,65",
      "78,65",
      "79,65",
      "79,64",
      "79,63",
      "79,62",
      "79,61",
      "78,60",
      "78,59",
      "78,58",
      "78,57",
      "78,56",
      "78,55",
      "78,54",
      "78,53",
      "78,52",
      "79,52",
      "79,53",
      "79,54",
      "79,60",
      "79,58",
      "79,57",
      "79,59",
      "79,55",
      "77,54",
      "77,55",
      "77,56",
      "77,57",
      "77,58",
      "77,59",
      "77,60",
      "77,63",
      "77,64",
      "78,62",
      "78,63",
      "78,64",
      "77,61",
      "77,62",
      "78,61",
      "79,56",
      "75,55",
      "74,55",
      "73,55",
      "72,55",
      "71,55",
      "70,55",
      "67,56",
      "66,56",
      "65,56",
      "64,56",
      "63,56",
      "63,55",
      "64,55",
      "65,55",
      "66,55",
      "67,55",
      "68,55",
      "69,55",
      "68,56",
      "72,56",
      "73,56",
      "74,56",
      "65,57",
      "66,57",
      "67,57",
      "68,57",
      "69,57",
      "70,57",
      "71,57",
      "72,57",
      "73,57",
      "74,57",
      "70,56",
      "69,56",
      "71,56",
      "63,57",
      "63,54",
      "63,53",
      "63,51",
      "63,50",
      "63,49",
      "63,48",
      "63,47",
      "64,47",
      "65,47",
      "66,47",
      "67,47",
      "68,48",
      "68,49",
      "68,50",
      "68,51",
      "68,52",
      "68,53",
      "67,53",
      "67,54",
      "66,54",
      "65,54",
      "64,54",
      "64,53",
      "64,52",
      "64,51",
      "64,50",
      "64,49",
      "64,48",
      "65,48",
      "66,48",
      "67,49",
      "67,50",
      "67,51",
      "66,52",
      "66,53",
      "65,53",
      "65,52",
      "65,51",
      "65,50",
      "65,49",
      "66,49",
      "66,50",
      "66,51",
      "67,52",
      "67,48",
      "63,52",
      "64,57",
      "68,54",
      "69,54",
      "70,54",
      "71,54",
      "72,54",
      "73,54",
      "74,54",
      "75,54",
      "76,54",
      "76,55",
      "69,53",
      "70,53",
      "71,53",
      "72,53",
      "73,53",
      "74,53",
      "75,53",
      "76,53",
      "77,53",
      "69,52",
      "70,52",
      "71,52",
      "72,52",
      "73,52",
      "74,52",
      "75,52",
      "76,52",
      "77,52",
      "77,51",
      "78,51",
      "60,71",
      "61,71",
      "62,71",
      "63,71",
      "64,71",
      "65,71",
      "60,70",
      "61,70",
      "62,70",
      "63,70",
      "64,70",
      "65,70",
      "66,70",
      "65,74",
      "66,74",
      "67,74",
      "68,74",
      "69,74",
      "70,74",
      "71,74",
      "65,73",
      "66,73",
      "67,73",
      "68,73",
      "69,73",
      "70,73",
      "71,73",
      "65,72",
      "66,72",
      "67,72",
      "68,72",
      "69,72",
      "70,72",
      "71,72",
      "71,71",
      "71,70",
      "71,69",
      "71,68",
      "71,67",
      "71,66",
      "71,65",
      "71,64",
      "71,63",
      "71,62",
      "71,61",
      "70,61",
      "69,61",
      "68,61",
      "67,61",
      "66,61",
      "66,62",
      "66,63",
      "66,64",
      "66,65",
      "66,66",
      "61,66",
      "62,66",
      "63,66",
      "64,66",
      "65,66",
      "65,65",
      "64,65",
      "63,65",
      "62,65",
      "61,65",
      "60,65",
      "60,66",
      "60,67",
      "60,68",
      "60,69",
      "61,69",
      "62,69",
      "63,69",
      "64,69",
      "65,69",
      "66,69",
      "61,68",
      "62,68",
      "63,68",
      "64,68",
      "61,67",
      "62,67",
      "63,67",
      "64,67",
      "65,67",
      "66,67",
      "67,67",
      "65,68",
      "66,68",
      "67,68",
      "66,71",
      "67,71",
      "68,71",
      "69,71",
      "70,71",
      "67,70",
      "68,70",
      "69,70",
      "70,70",
      "67,69",
      "68,69",
      "69,69",
      "70,69",
      "69,68",
      "70,68",
      "68,68",
      "68,67",
      "69,67",
      "70,67",
      "70,66",
      "68,66",
      "67,66",
      "69,66",
      "67,65",
      "68,65",
      "69,65",
      "70,65",
      "70,64",
      "69,64",
      "68,64",
      "67,64",
      "67,63",
      "68,63",
      "69,63",
      "70,63",
      "70,62",
      "69,62",
      "68,62",
      "67,62",
      "66,60",
      "67,60",
      "68,60",
      "69,60",
      "70,60",
      "71,60",
      "69,51",
      "69,50",
      "69,49",
      "69,48",
      "69,47",
      "69,46",
      "69,45",
      "68,47",
      "68,46",
      "67,45",
      "66,45",
      "65,45",
      "64,45",
      "63,45",
      "63,46",
      "64,46",
      "65,46",
      "66,46",
      "67,46",
      "68,45",
      "63,44",
      "64,44",
      "65,44",
      "66,44",
      "67,44",
      "68,44",
      "69,44",
      "70,44",
      "63,43",
      "64,43",
      "65,43",
      "66,43",
      "67,43",
      "68,43",
      "69,43",
      "70,43",
      "70,45",
      "70,46",
      "70,47",
      "70,48",
      "70,49",
      "70,50",
      "71,51",
      "72,51",
      "73,51",
      "74,51",
      "75,51",
      "76,51",
      "70,51",
      "76,50",
      "77,50",
      "78,50",
      "76,29",
      "76,30",
      "76,31",
      "76,32",
      "76,33",
      "77,33",
      "77,34",
      "77,35",
      "76,35",
      "76,36",
      "76,41",
      "76,42",
      "76,43",
      "76,44",
      "76,45",
      "77,45",
      "77,46",
      "77,47",
      "76,47",
      "76,48",
      "76,49",
      "77,49",
      "78,49",
      "79,49",
      "79,48",
      "78,48",
      "77,48",
      "78,47",
      "78,46",
      "78,45",
      "78,44",
      "78,43",
      "78,42",
      "78,41",
      "78,40",
      "78,39",
      "78,38",
      "78,37",
      "78,36",
      "78,35",
      "78,34",
      "78,33",
      "79,33",
      "79,34",
      "79,35",
      "79,36",
      "79,37",
      "79,38",
      "79,39",
      "79,40",
      "79,41",
      "79,42",
      "79,43",
      "79,44",
      "79,45",
      "79,46",
      "79,47",
      "76,46",
      "77,43",
      "77,42",
      "77,41",
      "77,36",
      "77,38",
      "77,39",
      "77,40",
      "77,44",
      "77,37",
      "76,37",
      "76,38",
      "76,39",
      "76,40",
      "76,34",
      "77,32",
      "78,32",
      "79,32",
      "75,29",
      "74,29",
      "73,29",
      "72,29",
      "71,29",
      "70,29",
      "70,28",
      "71,28",
      "72,28",
      "73,28",
      "74,28",
      "76,27",
      "75,27",
      "74,27",
      "73,27",
      "72,27",
      "71,27",
      "70,27",
      "76,28",
      "75,28",
      "77,31",
      "78,31",
      "79,31",
      "78,30",
      "77,30",
      "77,29",
      "78,29",
      "79,29",
      "79,30",
      "77,28",
      "78,28",
      "77,27",
      "78,27",
      "79,27",
      "79,28",
      "70,30",
      "70,31",
      "70,32",
      "70,33",
      "70,34",
      "70,35",
      "70,36",
      "69,37",
      "68,37",
      "67,37",
      "66,37",
      "65,37",
      "64,37",
      "63,37",
      "62,37",
      "62,36",
      "63,36",
      "64,36",
      "65,36",
      "66,36",
      "67,36",
      "68,36",
      "69,36",
      "70,37",
      "62,35",
      "63,35",
      "64,35",
      "65,35",
      "66,35",
      "67,35",
      "68,35",
      "69,35",
      "62,34",
      "63,34",
      "64,34",
      "65,34",
      "66,34",
      "67,34",
      "68,34",
      "69,34",
      "63,33",
      "64,33",
      "65,33",
      "66,33",
      "69,33",
      "62,33",
      "68,33",
      "66,32",
      "66,31",
      "66,30",
      "66,29",
      "66,28",
      "66,27",
      "66,26",
      "66,25",
      "66,24",
      "67,33",
      "67,32",
      "67,31",
      "68,32",
      "69,32",
      "68,31",
      "67,30",
      "68,26",
      "68,25",
      "67,25",
      "67,24",
      "68,24",
      "69,24",
      "69,25",
      "69,26",
      "69,27",
      "69,28",
      "69,29",
      "69,30",
      "67,26",
      "67,27",
      "69,31",
      "67,29",
      "68,27",
      "67,28",
      "68,28",
      "68,29",
      "68,30",
      "59,31",
      "58,31",
      "57,31",
      "56,39",
      "57,39",
      "58,39",
      "59,39",
      "59,40",
      "59,41",
      "59,42",
      "59,43",
      "59,44",
      "60,44",
      "62,44",
      "62,43",
      "60,43",
      "57,43",
      "56,43",
      "55,43",
      "54,43",
      "54,44",
      "55,44",
      "56,44",
      "57,44",
      "58,44",
      "58,43",
      "58,42",
      "57,42",
      "56,42",
      "55,42",
      "54,41",
      "54,40",
      "55,39",
      "55,38",
      "55,37",
      "54,37",
      "54,38",
      "54,39",
      "54,42",
      "55,40",
      "56,40",
      "57,40",
      "58,40",
      "55,41",
      "56,41",
      "57,41",
      "58,41",
      "56,38",
      "57,38",
      "58,38",
      "59,38",
      "56,37",
      "56,36",
      "56,35",
      "56,34",
      "56,33",
      "56,32",
      "55,32",
      "55,31",
      "55,30",
      "56,30",
      "55,29",
      "56,29",
      "56,31",
      "51,39",
      "52,39",
      "53,39",
      "51,38",
      "52,38",
      "53,38",
      "53,37",
      "52,37",
      "51,37",
      "51,36",
      "51,35",
      "51,34",
      "51,33",
      "51,32",
      "51,31",
      "51,30",
      "51,29",
      "52,29",
      "53,29",
      "54,29",
      "52,30",
      "53,30",
      "54,31",
      "54,32",
      "54,33",
      "54,34",
      "54,35",
      "54,36",
      "52,32",
      "52,33",
      "52,34",
      "52,35",
      "52,36",
      "53,36",
      "53,34",
      "53,33",
      "53,35",
      "53,32",
      "53,31",
      "52,31",
      "54,30",
      "55,33",
      "55,34",
      "55,35",
      "55,36",
      "57,30",
      "58,30",
      "59,30",
      "59,24",
      "59,25",
      "59,26",
      "59,27",
      "59,28",
      "59,29",
      "57,29",
      "58,24",
      "58,25",
      "58,26",
      "58,27",
      "58,28",
      "58,29",
      "51,28",
      "52,28",
      "53,28",
      "54,28",
      "55,28",
      "56,28",
      "57,28",
      "57,27",
      "51,27",
      "52,27",
      "53,27",
      "54,27",
      "55,27",
      "56,27",
      "57,26",
      "51,26",
      "52,26",
      "53,26",
      "54,26",
      "55,26",
      "56,26",
      "51,25",
      "52,25",
      "53,25",
      "54,25",
      "55,25",
      "57,25",
      "52,24",
      "53,24",
      "54,24",
      "55,24",
      "56,24",
      "57,24",
      "56,25",
      "51,24",
      "60,26",
      "61,26",
      "61,25",
      "60,25",
      "60,24",
      "61,24",
      "65,24",
      "65,26",
      "65,25",
      "65,20",
      "65,21",
      "65,22",
      "65,23",
      "66,23",
      "67,23",
      "68,23",
      "69,23",
      "70,23",
      "66,22",
      "67,22",
      "68,22",
      "69,22",
      "70,22",
      "72,22",
      "66,21",
      "67,21",
      "68,21",
      "69,21",
      "70,21",
      "71,21",
      "72,21",
      "66,20",
      "67,20",
      "68,20",
      "69,20",
      "70,20",
      "71,20",
      "72,20",
      "71,22",
      "70,26",
      "71,26",
      "72,26",
      "73,26",
      "74,26",
      "75,26",
      "76,26",
      "77,26",
      "78,26",
      "79,26",
      "70,24",
      "70,25",
      "71,23",
      "71,24",
      "71,25",
      "72,25",
      "72,24",
      "72,23",
      "73,23",
      "73,24",
      "73,25",
      "74,25",
      "74,24",
      "74,23",
      "73,20",
      "73,21",
      "73,22",
      "74,20",
      "74,21",
      "74,22",
      "75,20",
      "75,21",
      "75,22",
      "75,23",
      "75,24",
      "75,25",
      "76,20",
      "76,21",
      "76,22",
      "76,23",
      "76,24",
      "77,24",
      "77,25",
      "77,20",
      "77,21",
      "77,22",
      "77,23",
      "78,20",
      "78,21",
      "78,22",
      "78,23",
      "78,24",
      "78,25",
      "79,20",
      "79,21",
      "79,22",
      "79,23",
      "79,24",
      "79,25",
      "76,25",
      "72,19",
      "73,19",
      "74,19",
      "76,19",
      "77,19",
      "78,19",
      "79,19",
      "75,19",
      "72,18",
      "73,18",
      "74,18",
      "75,18",
      "76,18",
      "77,18",
      "78,18",
      "79,18",
      "72,17",
      "73,17",
      "74,17",
      "75,17",
      "76,17",
      "77,17",
      "78,17",
      "79,17",
      "72,16",
      "73,16",
      "74,16",
      "75,16",
      "76,16",
      "77,16",
      "78,16",
      "79,16",
      "72,15",
      "73,15",
      "74,15",
      "75,15",
      "76,15",
      "77,15",
      "79,15",
      "72,14",
      "73,14",
      "74,14",
      "75,14",
      "76,14",
      "77,14",
      "78,14",
      "79,14",
      "79,7",
      "79,8",
      "79,9",
      "79,10",
      "79,11",
      "79,12",
      "72,13",
      "73,13",
      "74,13",
      "75,13",
      "76,13",
      "77,13",
      "78,13",
      "79,13",
      "78,15",
      "72,8",
      "72,9",
      "72,10",
      "72,11",
      "72,12",
      "73,12",
      "74,12",
      "75,12",
      "76,12",
      "77,12",
      "77,11",
      "78,10",
      "77,9",
      "77,8",
      "76,8",
      "76,7",
      "75,7",
      "74,7",
      "74,8",
      "73,8",
      "73,9",
      "73,10",
      "73,11",
      "74,11",
      "75,11",
      "76,11",
      "76,10",
      "76,9",
      "75,8",
      "74,9",
      "75,9",
      "74,10",
      "75,10",
      "77,10",
      "78,12",
      "78,9",
      "78,8",
      "78,7",
      "77,7",
      "78,11",
      "79,6",
      "78,6",
      "77,5",
      "76,5",
      "75,5",
      "74,5",
      "73,5",
      "72,5",
      "71,5",
      "70,5",
      "70,6",
      "69,6",
      "68,6",
      "68,7",
      "69,7",
      "70,7",
      "71,7",
      "72,7",
      "73,7",
      "71,6",
      "72,6",
      "73,6",
      "74,6",
      "75,6",
      "76,6",
      "78,5",
      "79,5",
      "79,4",
      "79,3",
      "79,2",
      "79,1",
      "79,0",
      "78,0",
      "77,0",
      "76,0",
      "75,0",
      "74,1",
      "73,1",
      "72,1",
      "71,1",
      "70,1",
      "69,1",
      "67,1",
      "68,0",
      "69,0",
      "70,0",
      "71,0",
      "72,0",
      "73,0",
      "74,0",
      "68,1",
      "68,2",
      "69,2",
      "70,2",
      "71,2",
      "72,2",
      "72,3",
      "73,3",
      "74,3",
      "75,3",
      "76,3",
      "77,3",
      "78,3",
      "73,2",
      "74,2",
      "75,2",
      "76,2",
      "77,2",
      "78,2",
      "78,1",
      "76,1",
      "77,1",
      "77,4",
      "78,4",
      "75,4",
      "75,1",
      "77,6",
      "76,4",
      "74,4",
      "73,4",
      "72,4",
      "71,4",
      "70,4",
      "69,4",
      "68,4",
      "67,4",
      "66,4",
      "65,4",
      "64,4",
      "63,4",
      "71,3",
      "68,3",
      "67,3",
      "66,3",
      "65,3",
      "64,3",
      "62,3",
      "61,3",
      "69,3",
      "70,3",
      "69,5",
      "68,5",
      "67,5",
      "66,5",
      "65,5",
      "64,5",
      "63,5",
      "62,5",
      "63,3",
      "67,2",
      "66,2",
      "65,2",
      "64,2",
      "63,2",
      "62,2",
      "60,2",
      "67,0",
      "66,0",
      "65,0",
      "64,0",
      "63,0",
      "62,0",
      "62,1",
      "61,1",
      "60,1",
      "60,0",
      "61,0",
      "59,0",
      "59,1",
      "59,4",
      "59,5",
      "59,6",
      "59,7",
      "59,8",
      "59,9",
      "59,10",
      "59,11",
      "60,3",
      "60,4",
      "60,5",
      "60,6",
      "60,7",
      "60,8",
      "60,9",
      "60,10",
      "60,11",
      "60,12",
      "61,4",
      "62,4",
      "61,2",
      "63,1",
      "64,1",
      "65,1",
      "66,1",
      "67,6",
      "67,7",
      "67,8",
      "67,9",
      "67,10",
      "67,11",
      "67,12",
      "66,13",
      "66,14",
      "66,15",
      "61,5",
      "61,6",
      "61,7",
      "61,8",
      "61,9",
      "61,10",
      "61,11",
      "61,12",
      "61,13",
      "61,14",
      "61,15",
      "62,15",
      "62,6",
      "62,7",
      "62,8",
      "62,9",
      "62,10",
      "62,11",
      "62,12",
      "62,13",
      "62,14",
      "63,6",
      "64,6",
      "65,6",
      "66,6",
      "66,7",
      "66,8",
      "66,9",
      "66,10",
      "66,11",
      "65,11",
      "65,12",
      "66,12",
      "63,7",
      "63,8",
      "63,9",
      "63,10",
      "63,11",
      "63,12",
      "63,13",
      "63,14",
      "65,15",
      "63,15",
      "64,15",
      "64,7",
      "64,8",
      "64,9",
      "64,10",
      "64,11",
      "64,12",
      "64,13",
      "64,14",
      "65,14",
      "65,13",
      "65,8",
      "65,9",
      "65,10",
      "65,7",
      "68,9",
      "68,10",
      "68,11",
      "68,12",
      "68,13",
      "68,14",
      "68,15",
      "68,16",
      "68,17",
      "69,10",
      "69,9",
      "68,8",
      "69,8",
      "70,8",
      "71,8",
      "71,9",
      "71,10",
      "69,17",
      "69,16",
      "71,16",
      "71,17",
      "68,18",
      "67,18",
      "66,18",
      "65,18",
      "64,18",
      "63,18",
      "62,18",
      "61,17",
      "62,17",
      "63,17",
      "64,17",
      "65,17",
      "66,17",
      "67,17",
      "67,16",
      "67,15",
      "67,14",
      "67,13",
      "61,16",
      "62,16",
      "63,16",
      "64,16",
      "65,16",
      "66,16",
      "61,22",
      "61,21",
      "61,20",
      "61,19",
      "61,18",
      "61,23",
      "59,12",
      "59,13",
      "59,14",
      "59,15",
      "59,16",
      "59,17",
      "59,18",
      "59,19",
      "59,20",
      "59,21",
      "58,22",
      "59,22",
      "59,23",
      "58,23",
      "60,13",
      "60,14",
      "60,15",
      "60,16",
      "60,17",
      "60,18",
      "60,19",
      "60,20",
      "60,21",
      "60,22",
      "60,23",
      "40,21",
      "41,21",
      "42,21",
      "43,21",
      "44,21",
      "45,21",
      "46,21",
      "47,21",
      "48,21",
      "49,21",
      "50,21",
      "51,21",
      "52,21",
      "53,21",
      "54,21",
      "55,21",
      "56,21",
      "58,20",
      "57,20",
      "56,20",
      "55,20",
      "54,20",
      "53,20",
      "52,20",
      "51,20",
      "50,20",
      "49,20",
      "48,20",
      "47,20",
      "46,20",
      "45,20",
      "44,20",
      "43,20",
      "42,20",
      "41,20",
      "40,20",
      "39,20",
      "37,20",
      "37,21",
      "38,20",
      "38,21",
      "39,21",
      "58,21",
      "57,21",
      "37,22",
      "38,22",
      "39,22",
      "40,22",
      "41,22",
      "42,22",
      "43,22",
      "44,22",
      "45,22",
      "46,22",
      "47,22",
      "48,22",
      "49,22",
      "50,22",
      "51,22",
      "52,22",
      "53,22",
      "54,22",
      "55,22",
      "56,22",
      "57,22",
      "57,23",
      "56,23",
      "55,23",
      "54,23",
      "53,23",
      "52,23",
      "51,23",
      "50,23",
      "49,23",
      "48,23",
      "47,23",
      "46,23",
      "45,23",
      "44,23",
      "43,23",
      "42,23",
      "41,23",
      "40,23",
      "39,23",
      "38,23",
      "37,23",
      "36,20",
      "36,21",
      "36,22",
      "36,23",
      "36,24",
      "36,25",
      "36,26",
      "37,27",
      "37,28",
      "37,29",
      "37,30",
      "37,31",
      "37,32",
      "37,34",
      "38,24",
      "37,25",
      "37,24",
      "37,26",
      "38,25",
      "38,26",
      "38,27",
      "38,28",
      "38,29",
      "38,30",
      "38,31",
      "38,32",
      "38,33",
      "38,35",
      "39,25",
      "40,25",
      "41,25",
      "42,25",
      "43,25",
      "44,25",
      "45,25",
      "46,25",
      "47,25",
      "48,25",
      "48,24",
      "49,24",
      "50,24",
      "50,25",
      "49,25",
      "47,24",
      "46,24",
      "45,24",
      "44,24",
      "43,24",
      "42,24",
      "41,24",
      "39,24",
      "36,27",
      "36,28",
      "36,29",
      "36,30",
      "36,31",
      "36,32",
      "36,33",
      "36,34",
      "36,35",
      "36,36",
      "36,37",
      "37,33",
      "37,35",
      "37,37",
      "37,36",
      "38,36",
      "38,34",
      "38,37",
      "35,35",
      "35,36",
      "35,37",
      "35,38",
      "35,39",
      "34,35",
      "34,36",
      "34,37",
      "34,38",
      "34,39",
      "35,40",
      "34,40",
      "36,38",
      "36,39",
      "37,38",
      "37,39",
      "37,40",
      "36,40",
      "38,40",
      "39,40",
      "40,40",
      "41,40",
      "38,39",
      "39,39",
      "40,39",
      "41,39",
      "38,38",
      "39,38",
      "40,38",
      "41,38",
      "42,39",
      "43,39",
      "42,38",
      "43,38",
      "44,38",
      "44,37",
      "43,37",
      "42,37",
      "41,37",
      "40,37",
      "44,36",
      "43,36",
      "42,36",
      "41,36",
      "40,36",
      "39,37",
      "39,36",
      "39,29",
      "39,30",
      "39,31",
      "39,32",
      "39,33",
      "39,34",
      "39,35",
      "39,28",
      "40,28",
      "40,29",
      "40,30",
      "40,31",
      "40,32",
      "40,33",
      "40,34",
      "40,35",
      "41,28",
      "41,29",
      "41,30",
      "41,31",
      "41,32",
      "41,33",
      "41,34",
      "42,28",
      "42,29",
      "42,30",
      "42,31",
      "42,35",
      "41,35",
      "42,34",
      "42,33",
      "42,32",
      "43,28",
      "43,29",
      "43,30",
      "43,31",
      "44,28",
      "44,29",
      "44,30",
      "44,31",
      "44,32",
      "43,32",
      "43,33",
      "43,34",
      "43,35",
      "44,33",
      "44,35",
      "44,34",
      "45,33",
      "46,33",
      "46,32",
      "45,32",
      "48,32",
      "48,33",
      "49,32",
      "49,33",
      "50,32",
      "50,33",
      "46,43",
      "47,43",
      "48,43",
      "49,43",
      "50,43",
      "50,44",
      "50,45",
      "50,46",
      "50,47",
      "50,48",
      "46,42",
      "47,42",
      "48,42",
      "49,42",
      "50,42",
      "45,42",
      "45,43",
      "45,44",
      "45,45",
      "33,45",
      "34,45",
      "35,45",
      "36,45",
      "37,45",
      "38,45",
      "39,45",
      "40,45",
      "41,45",
      "42,45",
      "43,45",
      "44,45",
      "44,44",
      "43,44",
      "42,44",
      "41,44",
      "40,44",
      "39,44",
      "38,44",
      "37,44",
      "36,44",
      "35,44",
      "34,44",
      "33,44",
      "32,44",
      "32,45",
      "32,46",
      "32,47",
      "32,48",
      "32,49",
      "33,49",
      "34,49",
      "35,49",
      "36,49",
      "37,49",
      "38,49",
      "39,49",
      "40,49",
      "41,49",
      "42,49",
      "43,49",
      "41,50",
      "42,50",
      "40,50",
      "33,48",
      "34,48",
      "35,48",
      "36,48",
      "37,48",
      "38,48",
      "39,48",
      "40,48",
      "41,48",
      "42,48",
      "43,48",
      "33,47",
      "34,47",
      "35,47",
      "36,47",
      "37,47",
      "38,47",
      "39,47",
      "40,47",
      "41,47",
      "42,47",
      "33,46",
      "34,46",
      "35,46",
      "36,46",
      "37,46",
      "38,46",
      "39,46",
      "40,46",
      "41,46",
      "42,46",
      "43,46",
      "44,46",
      "45,46",
      "43,47",
      "44,47",
      "45,47",
      "46,47",
      "47,47",
      "46,44",
      "46,45",
      "46,46",
      "47,44",
      "47,45",
      "47,46",
      "48,44",
      "48,45",
      "48,46",
      "48,47",
      "49,44",
      "49,45",
      "49,46",
      "49,47",
      "44,48",
      "45,48",
      "46,48",
      "47,48",
      "48,48",
      "44,49",
      "45,49",
      "46,49",
      "47,49",
      "48,49",
      "50,49",
      "49,48",
      "49,49",
      "50,50",
      "50,51",
      "50,52",
      "50,53",
      "50,54",
      "50,55",
      "50,56",
      "50,57",
      "42,51",
      "42,52",
      "42,53",
      "42,54",
      "42,55",
      "42,56",
      "42,57",
      "43,57",
      "44,57",
      "45,57",
      "46,57",
      "47,57",
      "48,57",
      "49,57",
      "43,56",
      "44,56",
      "45,56",
      "46,56",
      "47,56",
      "48,56",
      "49,56",
      "48,50",
      "49,50",
      "49,51",
      "49,52",
      "49,53",
      "49,54",
      "48,54",
      "47,54",
      "46,54",
      "45,54",
      "44,54",
      "43,54",
      "43,53",
      "43,52",
      "44,52",
      "44,51",
      "45,51",
      "45,50",
      "46,50",
      "46,51",
      "47,51",
      "47,52",
      "46,53",
      "45,53",
      "44,53",
      "45,52",
      "46,52",
      "43,50",
      "43,51",
      "44,50",
      "47,50",
      "48,51",
      "48,53",
      "47,53",
      "48,52",
      "43,55",
      "44,55",
      "45,55",
      "46,55",
      "47,55",
      "48,55",
      "49,55",
      "51,53",
      "51,54",
      "52,54",
      "52,53",
      "52,52",
      "52,51",
      "51,51",
      "51,52",
      "51,50",
      "51,49",
      "52,49",
      "52,50",
      "58,49",
      "58,50",
      "58,51",
      "58,52",
      "58,53",
      "58,54",
      "59,49",
      "59,50",
      "59,51",
      "59,52",
      "59,53",
      "59,54",
      "60,54",
      "61,54",
      "62,54",
      "62,51",
      "62,52",
      "62,53",
      "60,53",
      "61,53",
      "61,52",
      "60,52",
      "60,51",
      "60,49",
      "61,49",
      "62,49",
      "61,50",
      "60,50",
      "61,51",
      "62,50",
      "44,68",
      "44,67",
      "44,66",
      "44,65",
      "44,64",
      "44,63",
      "44,62",
      "42,65",
      "43,66",
      "42,66",
      "43,65",
      "45,63",
      "46,63",
      "47,63",
      "48,63",
      "49,63",
      "50,63",
      "51,63",
      "52,63",
      "53,63",
      "55,63",
      "45,62",
      "46,62",
      "47,62",
      "48,62",
      "49,62",
      "50,62",
      "51,62",
      "52,62",
      "53,62",
      "54,62",
      "55,62",
      "56,62",
      "54,63",
      "56,63",
      "56,64",
      "56,65",
      "56,66",
      "45,64",
      "46,64",
      "47,64",
      "48,64",
      "49,64",
      "50,64",
      "51,64",
      "52,64",
      "53,64",
      "54,64",
      "55,64",
      "55,65",
      "54,65",
      "53,65",
      "52,65",
      "51,65",
      "50,65",
      "49,65",
      "48,65",
      "47,65",
      "46,65",
      "45,65",
      "45,66",
      "46,66",
      "47,66",
      "48,66",
      "49,66",
      "50,66",
      "51,66",
      "52,66",
      "53,66",
      "54,66",
      "55,66",
      "2,77",
      "3,77",
      "4,77",
      "5,77",
      "2,71",
      "2,72",
      "2,73",
      "2,74",
      "2,75",
      "2,76",
      "3,71",
      "4,71",
      "5,71",
      "6,71",
      "7,71",
      "8,71",
      "9,71",
      "10,71",
      "3,72",
      "4,72",
      "5,72",
      "6,72",
      "7,72",
      "8,72",
      "9,72",
      "10,72",
      "11,72",
      "12,72",
      "13,72",
      "14,72",
      "15,72",
      "16,72",
      "17,72",
      "18,72",
      "19,72",
      "20,72",
      "21,72",
      "32,72",
      "33,72",
      "34,72",
      "35,72",
      "36,71",
      "35,71",
      "34,71",
      "33,71",
      "32,71",
      "22,71",
      "21,71",
      "20,71",
      "19,71",
      "18,71",
      "17,71",
      "11,71",
      "12,71",
      "13,71",
      "14,71",
      "15,71",
      "16,71",
      "23,71",
      "24,71",
      "25,71",
      "26,71",
      "27,71",
      "28,71",
      "22,72",
      "23,72",
      "24,72",
      "25,72",
      "26,72",
      "27,72",
      "28,72",
      "29,72",
      "31,71",
      "29,71",
      "30,72",
      "31,72",
      "30,71",
      "36,72",
      "36,65",
      "36,66",
      "36,67",
      "36,68",
      "36,69",
      "36,70",
      "10,65",
      "10,66",
      "10,67",
      "10,68",
      "10,69",
      "10,70",
      "11,70",
      "12,70",
      "13,70",
      "14,70",
      "15,70",
      "16,70",
      "17,70",
      "18,70",
      "19,69",
      "20,69",
      "21,69",
      "22,69",
      "23,69",
      "24,69",
      "25,69",
      "26,69",
      "27,69",
      "28,69",
      "29,70",
      "30,70",
      "31,70",
      "32,70",
      "33,70",
      "34,70",
      "35,70",
      "29,69",
      "30,69",
      "31,69",
      "32,69",
      "33,69",
      "34,69",
      "35,69",
      "19,70",
      "20,70",
      "21,70",
      "22,70",
      "23,70",
      "24,70",
      "25,70",
      "26,70",
      "27,70",
      "28,70",
      "11,69",
      "12,69",
      "13,69",
      "14,69",
      "15,69",
      "16,69",
      "17,69",
      "18,69",
      "11,68",
      "12,68",
      "13,68",
      "14,68",
      "15,68",
      "16,68",
      "17,68",
      "18,68",
      "19,68",
      "20,68",
      "21,68",
      "22,68",
      "23,68",
      "24,68",
      "25,68",
      "26,68",
      "27,68",
      "28,68",
      "29,68",
      "30,67",
      "31,67",
      "32,67",
      "33,67",
      "34,67",
      "35,67",
      "35,68",
      "34,68",
      "33,68",
      "32,68",
      "31,68",
      "30,68",
      "29,67",
      "28,67",
      "27,67",
      "26,67",
      "25,67",
      "24,67",
      "23,67",
      "22,67",
      "21,67",
      "20,67",
      "19,67",
      "18,67",
      "17,67",
      "16,67",
      "15,67",
      "14,67",
      "13,67",
      "12,67",
      "11,66",
      "12,66",
      "13,66",
      "14,66",
      "15,66",
      "16,66",
      "17,66",
      "18,66",
      "19,66",
      "20,66",
      "21,66",
      "22,66",
      "23,66",
      "24,66",
      "25,66",
      "26,66",
      "27,66",
      "28,66",
      "29,66",
      "30,66",
      "31,65",
      "32,65",
      "33,65",
      "34,65",
      "35,65",
      "35,66",
      "34,66",
      "33,66",
      "31,66",
      "32,66",
      "29,65",
      "28,65",
      "27,65",
      "26,65",
      "25,65",
      "24,65",
      "23,65",
      "22,65",
      "21,65",
      "20,65",
      "19,65",
      "18,65",
      "17,65",
      "16,65",
      "15,65",
      "14,65",
      "13,65",
      "12,65",
      "11,65",
      "11,67",
      "30,65",
      "30,60",
      "30,61",
      "30,62",
      "30,63",
      "30,64",
      "10,59",
      "10,60",
      "10,61",
      "10,62",
      "10,63",
      "10,64",
      "11,64",
      "12,64",
      "13,64",
      "13,63",
      "13,62",
      "13,61",
      "13,60",
      "13,59",
      "11,60",
      "11,62",
      "11,63",
      "12,63",
      "12,62",
      "11,61",
      "12,60",
      "11,59",
      "12,59",
      "12,61",
      "16,60",
      "17,60",
      "18,60",
      "19,60",
      "20,60",
      "21,60",
      "22,60",
      "16,59",
      "17,59",
      "18,59",
      "19,59",
      "20,59",
      "21,59",
      "22,59",
      "16,58",
      "17,58",
      "18,58",
      "19,58",
      "20,58",
      "11,50",
      "11,51",
      "12,50",
      "12,51",
      "13,50",
      "13,51",
      "14,50",
      "14,51",
      "15,50",
      "15,51",
      "16,50",
      "16,51",
      "16,52",
      "16,53",
      "16,54",
      "16,55",
      "16,56",
      "16,57",
      "17,50",
      "18,50",
      "19,50",
      "20,50",
      "17,51",
      "18,51",
      "19,51",
      "20,51",
      "17,52",
      "17,53",
      "17,54",
      "17,55",
      "17,57",
      "18,52",
      "18,53",
      "18,54",
      "18,55",
      "18,56",
      "18,57",
      "17,56",
      "19,52",
      "19,53",
      "19,54",
      "19,55",
      "19,56",
      "19,57",
      "20,52",
      "20,53",
      "20,54",
      "20,55",
      "20,56",
      "20,57",
      "21,50",
      "21,51",
      "21,52",
      "21,53",
      "21,54",
      "21,55",
      "21,56",
      "21,57",
      "21,58",
      "25,59",
      "26,59",
      "27,59",
      "28,59",
      "29,59",
      "26,60",
      "27,60",
      "28,60",
      "29,60",
      "25,60",
      "30,59",
      "31,59",
      "32,59",
      "33,59",
      "34,59",
      "35,59",
      "31,60",
      "32,60",
      "33,60",
      "34,60",
      "35,60",
      "35,52",
      "35,53",
      "35,54",
      "35,55",
      "35,56",
      "35,57",
      "35,58",
      "25,52",
      "25,54",
      "25,55",
      "25,56",
      "25,57",
      "25,58",
      "26,58",
      "27,58",
      "28,58",
      "29,58",
      "30,58",
      "31,58",
      "32,58",
      "33,58",
      "34,58",
      "26,52",
      "27,52",
      "28,52",
      "29,52",
      "30,52",
      "31,52",
      "32,52",
      "34,52",
      "33,53",
      "32,53",
      "31,53",
      "30,53",
      "29,53",
      "28,53",
      "27,53",
      "26,53",
      "25,53",
      "26,54",
      "26,55",
      "26,56",
      "26,57",
      "27,54",
      "27,55",
      "27,56",
      "27,57",
      "28,54",
      "28,55",
      "28,56",
      "28,57",
      "29,55",
      "29,56",
      "29,57",
      "30,54",
      "30,55",
      "29,54",
      "30,56",
      "30,57",
      "31,54",
      "31,55",
      "31,56",
      "31,57",
      "32,54",
      "32,55",
      "32,56",
      "32,57",
      "33,54",
      "33,55",
      "33,56",
      "33,57",
      "34,53",
      "34,54",
      "34,55",
      "34,56",
      "34,57",
      "33,52",
      "2,44",
      "2,43",
      "3,43",
      "3,44",
      "4,43",
      "4,44",
      "6,43",
      "6,44",
      "7,43",
      "7,44",
      "8,43",
      "8,44",
      "9,43",
      "9,44",
      "10,43",
      "10,44",
      "11,43",
      "11,44",
      "12,43",
      "12,44",
      "12,45",
      "12,46",
      "12,47",
      "12,48",
      "12,49",
      "13,43",
      "13,44",
      "13,45",
      "13,46",
      "14,46",
      "15,46",
      "16,46",
      "17,46",
      "18,46",
      "19,46",
      "14,45",
      "15,45",
      "16,45",
      "17,45",
      "18,45",
      "19,45",
      "14,44",
      "15,44",
      "16,44",
      "17,44",
      "18,44",
      "19,44",
      "14,43",
      "15,43",
      "16,43",
      "17,43",
      "18,43",
      "19,43",
      "20,43",
      "20,44",
      "20,45",
      "20,46",
      "21,46",
      "21,45",
      "21,44",
      "21,43",
      "27,43",
      "27,44",
      "27,45",
      "27,46",
      "28,46",
      "28,45",
      "28,44",
      "28,43",
      "29,43",
      "29,44",
      "29,45",
      "29,46",
      "30,46",
      "30,45",
      "30,44",
      "30,43",
      "31,43",
      "31,44",
      "31,45",
      "31,46",
      "32,43",
      "27,42",
      "28,42",
      "29,42",
      "30,42",
      "31,42",
      "32,42",
      "13,42",
      "14,42",
      "15,42",
      "16,42",
      "17,42",
      "18,42",
      "19,42",
      "20,42",
      "21,42",
      "22,36",
      "22,35",
      "23,35",
      "24,35",
      "25,35",
      "26,35",
      "27,35",
      "29,36",
      "30,36",
      "30,35",
      "29,35",
      "23,36",
      "24,36",
      "25,36",
      "26,36",
      "27,36",
      "28,36",
      "28,35",
      "22,34",
      "23,34",
      "24,34",
      "25,34",
      "26,34",
      "27,34",
      "28,34",
      "29,34",
      "30,34",
      "22,31",
      "22,32",
      "22,33",
      "23,31",
      "23,32",
      "23,33",
      "24,32",
      "24,33",
      "24,31",
      "25,31",
      "26,31",
      "27,31",
      "28,31",
      "29,31",
      "30,31",
      "29,32",
      "30,32",
      "30,33",
      "29,33",
      "26,33",
      "25,33",
      "27,33",
      "28,33",
      "28,32",
      "26,32",
      "25,32",
      "27,32",
      "9,14",
      "9,16",
      "9,17",
      "9,18",
      "9,19",
      "9,20",
      "9,21",
      "9,22",
      "9,23",
      "9,24",
      "9,25",
      "9,26",
      "10,26",
      "10,27",
      "10,28",
      "10,29",
      "10,30",
      "10,31",
      "10,32",
      "10,33",
      "10,34",
      "9,34",
      "9,35",
      "9,36",
      "9,37",
      "9,27",
      "9,28",
      "9,29",
      "9,30",
      "9,31",
      "9,32",
      "9,33",
      "9,15",
      "11,14",
      "11,15",
      "11,16",
      "10,16",
      "10,17",
      "10,18",
      "10,19",
      "10,20",
      "10,21",
      "10,22",
      "10,23",
      "10,24",
      "10,25",
      "10,14",
      "10,15",
      "11,17",
      "11,18",
      "11,19",
      "11,20",
      "11,21",
      "11,22",
      "11,23",
      "11,24",
      "11,25",
      "11,26",
      "11,27",
      "11,28",
      "11,29",
      "11,30",
      "11,31",
      "11,32",
      "11,33",
      "11,34",
      "9,38",
      "10,38",
      "11,38",
      "12,38",
      "13,38",
      "14,38",
      "15,38",
      "16,38",
      "11,36",
      "10,35",
      "11,35",
      "10,36",
      "10,37",
      "11,37",
      "12,37",
      "13,37",
      "14,37",
      "15,37",
      "16,37",
      "12,36",
      "13,36",
      "14,36",
      "15,36",
      "17,26",
      "16,26",
      "16,27",
      "16,28",
      "16,29",
      "16,30",
      "16,31",
      "16,32",
      "16,33",
      "16,34",
      "16,35",
      "16,36",
      "12,24",
      "12,25",
      "12,26",
      "12,27",
      "12,28",
      "12,29",
      "12,30",
      "12,31",
      "12,32",
      "12,33",
      "12,34",
      "12,35",
      "13,35",
      "14,35",
      "14,34",
      "15,34",
      "15,33",
      "15,32",
      "15,31",
      "15,30",
      "15,29",
      "15,28",
      "15,27",
      "15,26",
      "15,25",
      "14,24",
      "13,24",
      "13,25",
      "13,26",
      "13,27",
      "13,28",
      "13,29",
      "13,30",
      "13,31",
      "13,32",
      "13,33",
      "13,34",
      "14,32",
      "14,31",
      "14,30",
      "14,29",
      "14,28",
      "14,27",
      "14,26",
      "14,33",
      "15,35",
      "14,25",
      "16,25",
      "17,25",
      "18,25",
      "19,25",
      "20,25",
      "18,26",
      "19,26",
      "20,26",
      "18,27",
      "19,27",
      "20,27",
      "17,27",
      "23,25",
      "24,25",
      "25,25",
      "26,25",
      "27,25",
      "28,25",
      "29,25",
      "30,25",
      "30,24",
      "31,24",
      "32,24",
      "33,24",
      "23,26",
      "25,26",
      "26,26",
      "27,26",
      "28,26",
      "29,26",
      "30,26",
      "31,26",
      "33,26",
      "33,27",
      "32,27",
      "31,27",
      "30,27",
      "29,27",
      "28,27",
      "27,27",
      "26,27",
      "25,27",
      "24,27",
      "23,27",
      "24,26",
      "32,26",
      "31,25",
      "33,25",
      "32,25",
      "33,23",
      "33,22",
      "33,21",
      "33,20",
      "33,19",
      "33,18",
      "33,17",
      "33,16",
      "33,15",
      "33,14",
      "33,13",
      "34,15",
      "35,15",
      "36,15",
      "37,15",
      "38,15",
      "39,15",
      "40,15",
      "41,15",
      "42,15",
      "43,15",
      "44,15",
      "45,15",
      "46,15",
      "47,15",
      "34,14",
      "35,14",
      "36,14",
      "37,14",
      "38,14",
      "39,14",
      "40,14",
      "41,14",
      "42,14",
      "43,14",
      "44,14",
      "45,14",
      "46,14",
      "47,14",
      "34,13",
      "35,13",
      "36,13",
      "37,13",
      "38,13",
      "39,13",
      "40,13",
      "41,13",
      "42,13",
      "43,13",
      "44,13",
      "45,13",
      "46,13",
      "47,13",
      "48,13",
      "48,14",
      "48,15",
      "49,15",
      "49,14",
      "49,13",
      "50,13",
      "50,14",
      "50,15",
      "50,12",
      "50,11",
      "33,12",
      "34,12",
      "35,12",
      "36,12",
      "37,12",
      "38,12",
      "39,12",
      "40,12",
      "41,12",
      "42,12",
      "43,12",
      "44,12",
      "45,12",
      "46,12",
      "47,12",
      "48,12",
      "49,12",
      "49,11",
      "48,11",
      "47,11",
      "46,11",
      "45,11",
      "44,11",
      "43,11",
      "42,11",
      "41,11",
      "40,11",
      "39,11",
      "38,11",
      "34,11",
      "33,11",
      "32,10",
      "32,11",
      "35,11",
      "36,11",
      "37,11",
      "34,10",
      "33,10",
      "35,10",
      "36,10",
      "37,10",
      "38,10",
      "39,10",
      "40,10",
      "41,10",
      "42,10",
      "43,10",
      "44,10",
      "45,10",
      "46,10",
      "47,10",
      "32,12",
      "32,13",
      "32,14",
      "32,15",
      "31,16",
      "31,17",
      "31,18",
      "31,19",
      "31,20",
      "31,21",
      "31,22",
      "31,23",
      "32,17",
      "32,18",
      "32,19",
      "32,20",
      "32,21",
      "24,24",
      "25,24",
      "26,24",
      "27,24",
      "27,23",
      "28,23",
      "29,23",
      "12,0",
      "13,0",
      "14,0",
      "15,0",
      "16,0",
      "17,0",
      "18,0",
      "19,0",
      "20,0",
      "22,0",
      "23,0",
      "24,0",
      "25,0",
      "26,0",
      "27,0",
      "28,0",
      "29,0",
      "30,0",
      "31,0",
      "32,0",
      "33,0",
      "34,0",
      "35,0",
      "36,0",
      "37,0",
      "38,0",
      "39,0",
      "40,0",
      "41,0",
      "42,0",
      "43,0",
      "44,0",
      "45,0",
      "46,0",
      "48,0",
      "49,0",
      "50,0",
      "51,0",
      "52,0",
      "53,0",
      "54,0",
      "55,0",
      "55,1",
      "56,1",
      "58,1",
      "56,0",
      "57,0",
      "58,0",
      "57,1",
      "54,1",
      "53,1",
      "52,1",
      "51,1",
      "50,1",
      "49,1",
      "48,1",
      "47,1",
      "46,1",
      "45,1",
      "44,1",
      "43,1",
      "42,1",
      "41,1",
      "40,1",
      "39,1",
      "38,1",
      "37,1",
      "36,1",
      "35,1",
      "35,2",
      "34,2",
      "33,2",
      "32,2",
      "31,2",
      "30,2",
      "29,2",
      "28,2",
      "27,2",
      "26,2",
      "25,2",
      "24,2",
      "23,2",
      "22,2",
      "21,2",
      "20,2",
      "19,2",
      "18,2",
      "17,2",
      "16,2",
      "15,1",
      "14,2",
      "14,1",
      "13,2",
      "12,2",
      "12,1",
      "15,2",
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
      "31,1",
      "47,0",
      "47,2",
      "46,2",
      "45,2",
      "44,2",
      "43,2",
      "42,2",
      "41,2",
      "40,2",
      "39,2",
      "38,2",
      "36,2",
      "32,1",
      "33,1",
      "34,1",
      "21,0",
      "16,1",
      "13,1",
      "12,3",
      "13,3",
      "14,3",
      "15,3",
      "16,3",
      "17,3",
      "18,3",
      "19,3",
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
      "32,3",
      "33,3",
      "34,3",
      "34,4",
      "35,4",
      "36,4",
      "37,4",
      "38,4",
      "39,4",
      "40,4",
      "41,4",
      "42,4",
      "43,4",
      "44,4",
      "45,4",
      "46,4",
      "47,4",
      "47,3",
      "37,2",
      "48,2",
      "49,2",
      "50,2",
      "56,2",
      "57,2",
      "58,2",
      "56,3",
      "57,3",
      "58,3",
      "48,3",
      "49,3",
      "50,3",
      "59,2",
      "59,3",
      "58,7",
      "55,7",
      "56,7",
      "57,7",
      "48,7",
      "49,7",
      "50,7",
      "51,7",
      "47,5",
      "47,6",
      "47,7",
      "47,8",
      "47,9",
      "56,11",
      "56,12",
      "56,13",
      "56,14",
      "56,15",
      "57,15",
      "58,15",
      "58,14",
      "57,14",
      "57,13",
      "57,12",
      "57,11",
      "58,11",
      "58,12",
      "58,13",
      "35,3",
      "36,3",
      "37,3",
      "38,3",
      "39,3",
      "40,3",
      "41,3",
      "42,3",
      "43,3",
      "44,3",
      "45,3",
      "46,3",
      "46,6",
      "45,5",
      "44,5",
      "43,5",
      "42,5",
      "41,5",
      "39,5",
      "38,5",
      "37,5",
      "36,5",
      "35,5",
      "34,5",
      "33,5",
      "32,5",
      "32,6",
      "31,6",
      "31,7",
      "34,8",
      "35,8",
      "36,8",
      "37,8",
      "38,8",
      "39,8",
      "40,8",
      "41,8",
      "42,8",
      "43,8",
      "44,8",
      "45,8",
      "46,8",
      "46,9",
      "45,9",
      "44,9",
      "43,9",
      "42,9",
      "41,9",
      "40,9",
      "39,9",
      "38,9",
      "37,9",
      "36,9",
      "35,9",
      "34,9",
      "33,9",
      "32,9",
      "32,8",
      "33,8",
      "32,7",
      "33,7",
      "34,7",
      "35,7",
      "36,7",
      "37,7",
      "38,7",
      "39,7",
      "40,7",
      "41,7",
      "42,7",
      "43,7",
      "44,7",
      "45,7",
      "46,7",
      "46,5",
      "45,6",
      "44,6",
      "43,6",
      "42,6",
      "41,6",
      "40,6",
      "39,6",
      "38,6",
      "37,6",
      "36,6",
      "35,6",
      "34,6",
      "33,6",
      "40,5",
      "33,4",
      "32,4",
      "31,4",
      "31,5",
      "30,4",
      "30,5",
      "30,6",
      "30,7",
      "30,8",
      "30,9",
      "30,10",
      "30,11",
      "30,13",
      "31,13",
      "31,12",
      "31,11",
      "31,10",
      "31,9",
      "31,8",
      "32,16",
      "31,14",
      "30,14",
      "30,15",
      "31,15",
      "32,22",
      "32,23",
      "13,7",
      "13,4",
      "13,5",
      "13,6",
      "14,4",
      "14,5",
      "14,6",
      "14,7",
      "14,8",
      "13,8",
      "13,11",
      "12,11",
      "12,12",
      "12,13",
      "12,14",
      "12,15",
      "12,17",
      "12,18",
      "12,19",
      "12,20",
      "12,21",
      "12,22",
      "12,23",
      "13,23",
      "14,23",
      "15,23",
      "15,24",
      "16,24",
      "17,24",
      "18,24",
      "19,24",
      "20,23",
      "20,22",
      "20,21",
      "20,20",
      "18,20",
      "19,20",
      "18,21",
      "19,21",
      "20,24",
      "23,24",
      "23,20",
      "23,21",
      "23,22",
      "23,23",
      "24,23",
      "25,23",
      "26,23",
      "24,22",
      "25,22",
      "26,22",
      "27,22",
      "24,21",
      "24,20",
      "25,20",
      "26,21",
      "27,21",
      "25,21",
      "26,20",
      "28,22",
      "29,22",
      "30,22",
      "30,23",
      "28,24",
      "29,24",
      "28,21",
      "29,21",
      "30,21",
      "27,20",
      "28,20",
      "29,20",
      "30,20",
      "27,9",
      "27,10",
      "27,11",
      "27,12",
      "27,13",
      "27,14",
      "27,15",
      "27,16",
      "27,17",
      "27,18",
      "27,19",
      "26,19",
      "26,18",
      "26,17",
      "26,16",
      "26,15",
      "26,14",
      "26,13",
      "26,12",
      "26,11",
      "26,10",
      "29,9",
      "29,10",
      "28,11",
      "28,12",
      "28,13",
      "28,14",
      "28,15",
      "28,16",
      "28,17",
      "28,18",
      "28,19",
      "29,19",
      "29,18",
      "29,17",
      "29,16",
      "29,15",
      "29,14",
      "29,13",
      "29,12",
      "30,16",
      "30,17",
      "30,18",
      "30,19",
      "30,12",
      "29,11",
      "17,9",
      "17,10",
      "17,11",
      "17,13",
      "17,14",
      "17,15",
      "17,16",
      "17,17",
      "17,18",
      "17,19",
      "17,22",
      "17,21",
      "17,20",
      "18,22",
      "19,22",
      "19,23",
      "17,23",
      "16,23",
      "18,23",
      "13,22",
      "14,22",
      "15,22",
      "16,22",
      "16,21",
      "15,20",
      "15,19",
      "15,18",
      "15,16",
      "15,15",
      "15,14",
      "15,13",
      "15,12",
      "15,11",
      "15,10",
      "15,9",
      "15,8",
      "16,7",
      "16,9",
      "16,10",
      "16,12",
      "16,13",
      "16,14",
      "16,15",
      "16,16",
      "16,17",
      "16,18",
      "16,19",
      "16,20",
      "13,21",
      "14,21",
      "15,21",
      "13,20",
      "14,20",
      "13,19",
      "14,19",
      "13,18",
      "14,18",
      "13,17",
      "14,17",
      "15,17",
      "12,16",
      "14,16",
      "14,12",
      "13,12",
      "13,13",
      "13,14",
      "13,15",
      "14,13",
      "14,14",
      "14,15",
      "13,16",
      "13,9",
      "13,10",
      "14,9",
      "14,10",
      "14,11",
      "16,8",
      "16,11",
      "17,12",
      "17,8",
      "18,12",
      "19,12",
      "20,12",
      "21,12",
      "22,12",
      "23,12",
      "24,12",
      "25,12",
      "18,11",
      "19,11",
      "20,11",
      "21,11",
      "22,11",
      "23,11",
      "24,11",
      "25,11",
      "25,10",
      "24,10",
      "23,10",
      "22,10",
      "21,10",
      "20,10",
      "19,10",
      "18,10",
      "18,9",
      "19,9",
      "20,9",
      "21,9",
      "22,9",
      "23,9",
      "24,9",
      "25,9",
      "26,9",
      "28,10",
      "28,9",
      "29,8",
      "28,8",
      "27,8",
      "26,8",
      "25,8",
      "24,8",
      "23,8",
      "22,8",
      "21,8",
      "20,8",
      "19,8",
      "18,8",
      "17,7",
      "18,7",
      "19,7",
      "20,7",
      "21,7",
      "22,7",
      "23,7",
      "24,7",
      "25,7",
      "26,7",
      "27,7",
      "28,7",
      "29,7",
      "15,7",
      "15,6",
      "15,5",
      "15,4",
      "16,4",
      "17,4",
      "18,4",
      "19,4",
      "20,4",
      "21,4",
      "24,5",
      "25,5",
      "26,5",
      "27,5",
      "22,4",
      "23,4",
      "24,4",
      "25,4",
      "26,4",
      "27,4",
      "28,4",
      "29,6",
      "28,6",
      "27,6",
      "26,6",
      "25,6",
      "24,6",
      "23,6",
      "22,6",
      "21,6",
      "20,6",
      "19,6",
      "18,6",
      "17,6",
      "16,5",
      "16,6",
      "17,5",
      "18,5",
      "19,5",
      "20,5",
      "21,5",
      "22,5",
      "23,5",
      "28,5",
      "29,5",
      "29,4",
      "6,37",
      "6,38",
      "5,38",
      "5,37",
      "2,37",
      "3,38",
      "2,38",
      "4,38",
      "71,43",
      "39,60",
      "37,66",
      "39,82",
      "40,82",
      "39,81",
      "40,81",
      "41,82",
      "42,82",
      "43,82",
      "43,81",
      "29,73",
      "29,74",
      "29,75",
      "8,4",
      "8,5",
      "8,6",
      "8,7",
      "8,8",
      "8,9",
      "8,10",
      "8,11",
      "8,12",
      "8,13",
      "8,14",
      "8,15",
      "8,16",
      "8,17",
      "8,18",
      "8,19",
      "8,20",
      "8,21",
      "8,22",
      "8,23",
      "8,24",
      "8,25",
      "8,26",
      "8,27",
      "8,28",
      "8,29",
      "8,30",
      "8,31",
      "8,32",
      "8,33",
      "8,34",
      "8,35",
      "8,36",
      "8,37",
      "8,38",
      "40,24",
      "51,69",
      "17,38",
      "80,89",
      "81,89",
      "82,89",
      "83,89",
      "84,89",
      "86,89",
      "87,89",
      "85,89",
      "88,89",
      "89,89",
      "89,88",
      "88,88",
      "87,88",
      "86,88",
      "85,88",
      "84,88",
      "83,88",
      "82,88",
      "81,88",
      "80,88",
      "80,87",
      "81,87",
      "82,87",
      "83,87",
      "85,87",
      "86,87",
      "87,87",
      "88,87",
      "89,87",
      "89,86",
      "88,86",
      "87,86",
      "86,86",
      "85,86",
      "84,86",
      "83,86",
      "82,86",
      "81,86",
      "80,86",
      "84,87",
      "80,85",
      "81,85",
      "82,85",
      "83,85",
      "85,85",
      "86,85",
      "87,85",
      "88,85",
      "89,85",
      "84,85",
      "80,84",
      "80,83",
      "80,82",
      "80,75",
      "80,74",
      "80,73",
      "80,72",
      "80,71",
      "80,70",
      "80,69",
      "80,68",
      "81,68",
      "85,68",
      "86,68",
      "87,68",
      "88,68",
      "89,68",
      "81,69",
      "81,70",
      "81,71",
      "81,72",
      "81,73",
      "81,74",
      "81,75",
      "81,82",
      "81,83",
      "81,84",
      "82,84",
      "83,84",
      "84,84",
      "85,84",
      "86,84",
      "87,84",
      "88,84",
      "89,84",
      "82,82",
      "83,82",
      "82,83",
      "83,83",
      "84,83",
      "85,83",
      "86,83",
      "87,83",
      "88,83",
      "89,83",
      "84,82",
      "85,77",
      "85,76",
      "85,75",
      "85,74",
      "85,73",
      "85,72",
      "85,71",
      "85,70",
      "85,69",
      "86,69",
      "86,70",
      "86,71",
      "86,72",
      "86,73",
      "86,74",
      "86,75",
      "86,76",
      "86,77",
      "87,77",
      "87,76",
      "87,75",
      "87,74",
      "87,73",
      "87,72",
      "87,71",
      "87,70",
      "88,69",
      "88,70",
      "88,71",
      "88,72",
      "88,73",
      "88,74",
      "88,75",
      "88,76",
      "88,77",
      "88,78",
      "88,79",
      "88,80",
      "88,81",
      "89,81",
      "89,80",
      "89,79",
      "89,78",
      "89,77",
      "89,76",
      "89,75",
      "89,74",
      "89,73",
      "89,72",
      "89,71",
      "89,70",
      "89,69",
      "87,69",
      "85,82",
      "86,82",
      "87,82",
      "88,82",
      "89,82",
      "91,80",
      "91,81",
      "91,82",
      "91,83",
      "91,84",
      "91,85",
      "91,86",
      "91,87",
      "90,86",
      "90,85",
      "90,84",
      "90,83",
      "90,82",
      "90,81",
      "90,80",
      "90,79",
      "90,78",
      "90,77",
      "90,87",
      "88,67",
      "88,66",
      "88,65",
      "88,64",
      "88,63",
      "88,62",
      "88,61",
      "88,60",
      "88,59",
      "88,58",
      "88,57",
      "88,56",
      "88,55",
      "88,54",
      "88,53",
      "88,52",
      "80,65",
      "80,64",
      "80,63",
      "80,62",
      "80,61",
      "80,60",
      "80,59",
      "80,58",
      "80,57",
      "80,56",
      "80,55",
      "80,54",
      "80,53",
      "80,52",
      "80,51",
      "79,50",
      "79,51",
      "89,52",
      "89,53",
      "89,55",
      "89,56",
      "89,57",
      "89,58",
      "89,59",
      "89,60",
      "89,61",
      "89,62",
      "89,63",
      "89,64",
      "89,65",
      "89,67",
      "89,66",
      "90,52",
      "90,53",
      "90,54",
      "90,56",
      "90,57",
      "90,58",
      "90,59",
      "90,60",
      "90,61",
      "90,62",
      "90,63",
      "90,64",
      "90,65",
      "90,67",
      "90,68",
      "90,69",
      "90,70",
      "90,71",
      "90,72",
      "90,73",
      "90,74",
      "90,76",
      "91,79",
      "91,78",
      "91,77",
      "91,76",
      "91,75",
      "91,74",
      "91,73",
      "91,72",
      "91,71",
      "91,70",
      "91,69",
      "91,68",
      "91,67",
      "91,66",
      "91,65",
      "91,64",
      "91,63",
      "91,62",
      "91,61",
      "91,60",
      "91,59",
      "91,58",
      "91,57",
      "91,56",
      "91,55",
      "91,54",
      "91,53",
      "91,52",
      "91,51",
      "89,54",
      "90,55",
      "90,66",
      "90,75",
      "90,88",
      "90,89",
      "91,89",
      "91,88",
      "88,43",
      "88,44",
      "88,45",
      "88,46",
      "88,47",
      "88,48",
      "88,49",
      "88,50",
      "88,51",
      "90,51",
      "89,51",
      "90,36",
      "90,37",
      "89,40",
      "89,41",
      "89,42",
      "89,43",
      "89,44",
      "89,45",
      "89,46",
      "89,47",
      "89,48",
      "89,49",
      "89,50",
      "90,50",
      "91,50",
      "91,49",
      "91,48",
      "91,47",
      "91,46",
      "91,45",
      "91,44",
      "91,43",
      "91,42",
      "91,41",
      "91,40",
      "91,39",
      "91,38",
      "90,38",
      "90,39",
      "90,40",
      "90,41",
      "90,42",
      "90,43",
      "90,44",
      "90,45",
      "90,46",
      "90,47",
      "90,48",
      "90,49",
      "88,42",
      "88,41",
      "88,40",
      "88,39",
      "89,37",
      "89,36",
      "89,35",
      "89,34",
      "90,32",
      "90,33",
      "90,34",
      "90,35",
      "91,37",
      "91,36",
      "91,35",
      "91,34",
      "91,33",
      "91,32",
      "91,31",
      "80,50",
      "80,49",
      "80,48",
      "80,47",
      "80,46",
      "80,45",
      "80,44",
      "80,43",
      "80,42",
      "80,41",
      "80,40",
      "80,39",
      "80,38",
      "81,37",
      "81,36",
      "81,35",
      "81,34",
      "81,33",
      "81,32",
      "81,31",
      "81,30",
      "81,29",
      "81,28",
      "81,27",
      "81,26",
      "81,25",
      "81,24",
      "81,23",
      "81,22",
      "81,21",
      "81,20",
      "81,19",
      "81,18",
      "81,17",
      "80,16",
      "80,7",
      "80,8",
      "80,9",
      "80,10",
      "80,11",
      "80,12",
      "80,13",
      "80,14",
      "80,15",
      "80,17",
      "80,18",
      "80,19",
      "80,20",
      "80,21",
      "80,22",
      "80,23",
      "80,24",
      "80,25",
      "80,26",
      "80,27",
      "80,28",
      "80,29",
      "80,30",
      "80,31",
      "80,32",
      "80,33",
      "80,34",
      "80,35",
      "80,37",
      "80,36",
      "82,35",
      "82,34",
      "83,34",
      "84,34",
      "85,34",
      "86,34",
      "86,35",
      "87,35",
      "87,34",
      "88,35",
      "88,36",
      "88,37",
      "88,38",
      "89,38",
      "89,39",
      "87,36",
      "83,35",
      "84,35",
      "85,35",
      "88,34",
      "89,33",
      "82,33",
      "83,33",
      "84,33",
      "85,33",
      "86,33",
      "87,33",
      "88,33",
      "82,32",
      "83,32",
      "84,32",
      "85,32",
      "86,32",
      "87,32",
      "88,32",
      "89,32",
      "82,31",
      "83,31",
      "84,31",
      "85,31",
      "86,31",
      "87,31",
      "88,31",
      "89,31",
      "90,31",
      "82,30",
      "83,30",
      "84,30",
      "85,30",
      "86,30",
      "87,30",
      "88,30",
      "89,30",
      "90,30",
      "91,30",
      "82,17",
      "83,18",
      "83,19",
      "83,20",
      "83,21",
      "83,23",
      "83,24",
      "83,25",
      "83,26",
      "83,27",
      "83,28",
      "83,29",
      "82,29",
      "82,28",
      "82,27",
      "82,26",
      "82,25",
      "82,24",
      "82,23",
      "82,22",
      "82,21",
      "82,20",
      "82,19",
      "82,18",
      "84,29",
      "85,29",
      "86,29",
      "87,29",
      "88,29",
      "89,29",
      "90,29",
      "91,29",
      "84,28",
      "85,28",
      "86,28",
      "87,28",
      "88,28",
      "89,28",
      "90,28",
      "91,28",
      "84,27",
      "85,27",
      "86,27",
      "88,27",
      "89,27",
      "91,27",
      "87,27",
      "90,27",
      "84,26",
      "85,26",
      "86,26",
      "88,26",
      "89,26",
      "90,26",
      "91,26",
      "87,26",
      "84,25",
      "85,25",
      "86,25",
      "87,25",
      "88,25",
      "89,25",
      "90,25",
      "91,25",
      "84,24",
      "85,24",
      "86,24",
      "87,24",
      "88,24",
      "89,24",
      "90,24",
      "91,24",
      "84,23",
      "85,23",
      "86,23",
      "87,23",
      "88,23",
      "89,23",
      "90,23",
      "91,23",
      "84,22",
      "85,22",
      "86,22",
      "87,22",
      "88,22",
      "89,22",
      "90,22",
      "91,22",
      "83,22",
      "84,21",
      "85,21",
      "86,21",
      "87,21",
      "88,21",
      "89,21",
      "90,21",
      "91,21",
      "84,20",
      "85,20",
      "86,20",
      "87,20",
      "89,20",
      "90,20",
      "91,20",
      "84,19",
      "85,19",
      "87,19",
      "89,19",
      "91,19",
      "88,20",
      "86,19",
      "88,19",
      "84,18",
      "85,18",
      "86,18",
      "90,18",
      "91,18",
      "90,19",
      "87,18",
      "89,18",
      "88,18",
      "80,6",
      "80,5",
      "80,4",
      "80,3",
      "80,2",
      "80,1",
      "80,0",
      "81,0",
      "82,0",
      "83,0",
      "84,0",
      "85,0",
      "86,0",
      "88,0",
      "89,0",
      "90,0",
      "91,0",
      "87,0",
      "81,1",
      "82,1",
      "83,1",
      "84,1",
      "85,1",
      "86,1",
      "87,1",
      "88,1",
      "89,1",
      "90,1",
      "91,1",
      "91,2",
      "91,4",
      "91,5",
      "91,6",
      "91,7",
      "91,8",
      "91,9",
      "91,10",
      "91,11",
      "91,12",
      "91,14",
      "91,15",
      "91,16",
      "91,17",
      "91,13",
      "81,2",
      "82,2",
      "83,2",
      "84,2",
      "85,2",
      "86,2",
      "87,2",
      "88,2",
      "89,2",
      "90,4",
      "90,5",
      "90,6",
      "90,7",
      "90,8",
      "90,9",
      "90,10",
      "90,11",
      "90,12",
      "90,13",
      "90,14",
      "90,15",
      "90,16",
      "90,17",
      "89,17",
      "88,17",
      "87,17",
      "86,17",
      "85,17",
      "84,17",
      "83,17",
      "83,16",
      "84,16",
      "85,16",
      "86,16",
      "87,16",
      "89,16",
      "89,15",
      "89,14",
      "89,13",
      "89,12",
      "89,11",
      "89,10",
      "89,9",
      "89,8",
      "89,7",
      "89,6",
      "89,5",
      "89,4",
      "88,4",
      "87,4",
      "87,3",
      "86,3",
      "85,3",
      "84,3",
      "83,3",
      "82,3",
      "81,3",
      "81,4",
      "81,5",
      "81,6",
      "81,7",
      "81,8",
      "81,9",
      "81,10",
      "81,11",
      "81,12",
      "81,13",
      "81,14",
      "81,15",
      "81,16",
      "82,16",
      "82,15",
      "82,14",
      "83,14",
      "83,13",
      "82,12",
      "82,11",
      "82,10",
      "82,9",
      "82,8",
      "82,7",
      "82,6",
      "82,5",
      "82,4",
      "83,4",
      "84,4",
      "85,4",
      "86,4",
      "87,5",
      "87,6",
      "87,7",
      "87,8",
      "87,9",
      "87,10",
      "87,11",
      "87,12",
      "87,13",
      "87,14",
      "87,15",
      "86,15",
      "85,15",
      "84,15",
      "84,14",
      "84,13",
      "84,12",
      "83,11",
      "83,10",
      "83,9",
      "83,8",
      "83,7",
      "83,6",
      "83,5",
      "84,5",
      "85,5",
      "86,5",
      "86,6",
      "86,7",
      "86,8",
      "86,9",
      "86,10",
      "86,11",
      "86,12",
      "86,13",
      "86,14",
      "85,14",
      "85,13",
      "85,12",
      "85,11",
      "85,10",
      "85,9",
      "85,8",
      "85,7",
      "85,6",
      "84,6",
      "84,7",
      "84,8",
      "84,9",
      "84,10",
      "84,11",
      "88,15",
      "88,14",
      "88,13",
      "88,12",
      "88,11",
      "88,10",
      "88,9",
      "88,8",
      "88,7",
      "88,6",
      "88,5",
      "88,3",
      "89,3",
      "90,2",
      "88,16",
      "83,15",
      "82,13",
      "83,12",
      "81,76",
      "80,76",
      "79,76",
      "79,77",
      "80,77",
      "81,77",
      "90,3",
      "91,3",
      "81,53",
      "81,52",
      "81,51",
      "81,50",
      "81,49",
      "81,48",
      "81,47",
      "81,46",
      "81,45",
      "87,53",
      "87,52",
      "87,51",
      "87,50",
      "87,49",
      "87,48",
      "87,47",
      "87,46",
      "87,45",
      "81,63",
      "81,62",
      "87,60",
      "87,59",
      "81,41",
      "82,41",
      "82,40",
      "81,40",
      "86,40",
      "87,40",
      "86,41",
      "87,41"
    ],
    "breakable": [],
    "coreSpots": [
      "73,31",
      "5,7",
      "73,48"
    ],
    "spawnZone": [
      "37,17",
      "38,17",
      "39,17",
      "40,17",
      "41,17",
      "42,17",
      "43,17",
      "44,17",
      "45,17",
      "46,17",
      "47,17",
      "48,17",
      "49,17",
      "50,17",
      "51,17",
      "52,17",
      "53,17",
      "54,17",
      "55,17",
      "56,17",
      "57,17",
      "57,18",
      "56,18",
      "55,18",
      "54,18",
      "53,18",
      "52,18",
      "51,18",
      "50,18",
      "49,18",
      "48,18",
      "47,18",
      "46,18",
      "45,18",
      "44,18",
      "43,18",
      "42,18",
      "41,18",
      "40,18",
      "39,18",
      "38,18",
      "37,18",
      "34,18",
      "34,19",
      "34,20",
      "34,21",
      "34,22",
      "34,23",
      "34,24",
      "34,25",
      "34,26",
      "34,27",
      "34,28",
      "33,28",
      "33,30",
      "19,28",
      "20,28",
      "21,28",
      "22,28",
      "23,28",
      "24,28",
      "25,28",
      "26,28",
      "27,28",
      "28,28",
      "29,28",
      "30,28",
      "31,28",
      "32,28",
      "33,29",
      "32,29",
      "31,29",
      "30,29",
      "29,29",
      "28,29",
      "26,29",
      "25,29",
      "24,29",
      "23,29",
      "22,29",
      "21,29",
      "20,29",
      "20,16",
      "21,16",
      "22,16",
      "23,16",
      "23,17",
      "23,18",
      "22,18",
      "21,18",
      "20,18",
      "20,17",
      "21,17",
      "22,17",
      "19,30",
      "19,31",
      "18,31",
      "18,32",
      "18,33",
      "18,34",
      "18,35",
      "18,36",
      "18,37",
      "19,37",
      "19,38",
      "20,38",
      "20,37",
      "20,36",
      "20,35",
      "20,34",
      "20,33",
      "20,32",
      "20,31",
      "20,30",
      "19,33",
      "19,34",
      "19,35",
      "19,36",
      "19,32",
      "19,29",
      "18,29",
      "18,30",
      "7,19",
      "6,19",
      "6,20",
      "6,21",
      "6,22",
      "6,23",
      "6,24",
      "6,25",
      "6,26",
      "6,27",
      "6,28",
      "6,29",
      "6,30",
      "6,31",
      "6,32",
      "6,33",
      "7,33",
      "7,32",
      "7,31",
      "7,30",
      "7,29",
      "7,28",
      "7,27",
      "7,26",
      "7,25",
      "7,24",
      "7,23",
      "7,22",
      "7,21",
      "7,20",
      "6,40",
      "7,40",
      "8,40",
      "9,40",
      "10,40",
      "6,46",
      "7,46",
      "8,46",
      "9,46",
      "13,40",
      "14,40",
      "15,40",
      "16,40",
      "17,40",
      "18,40",
      "19,40",
      "10,54",
      "11,54",
      "12,54",
      "13,54",
      "13,55",
      "13,56",
      "12,56",
      "11,56",
      "10,56",
      "10,55",
      "12,55",
      "11,55",
      "17,62",
      "18,62",
      "19,62",
      "20,62",
      "21,62",
      "22,62",
      "23,62",
      "24,62",
      "25,62",
      "26,62",
      "27,62",
      "28,62",
      "16,62",
      "23,51",
      "23,52",
      "23,53",
      "23,54",
      "23,55",
      "22,55",
      "22,56",
      "22,57",
      "26,49",
      "27,49",
      "28,49",
      "29,49",
      "30,49",
      "17,47",
      "18,47",
      "19,47",
      "20,47",
      "20,48",
      "21,48",
      "37,51",
      "37,52",
      "37,53",
      "37,54",
      "37,55",
      "36,56",
      "36,57",
      "36,58",
      "37,58",
      "37,59",
      "37,60",
      "38,59",
      "38,58",
      "38,56",
      "37,56",
      "38,55",
      "38,54",
      "39,53",
      "39,52",
      "39,54",
      "39,55",
      "39,56",
      "40,57",
      "40,58",
      "40,59",
      "37,57",
      "38,57",
      "39,57",
      "39,58",
      "42,59",
      "43,59",
      "44,59",
      "45,59",
      "46,59",
      "47,59",
      "48,59",
      "49,59",
      "50,59",
      "51,59",
      "53,59",
      "54,59",
      "55,59",
      "56,59",
      "57,59",
      "58,59",
      "59,59",
      "60,59",
      "61,59",
      "62,59",
      "62,60",
      "63,60",
      "73,60",
      "73,61",
      "73,62",
      "73,63",
      "73,64",
      "73,65",
      "72,65",
      "72,66",
      "72,67",
      "72,68",
      "72,69",
      "72,70",
      "72,71",
      "72,72",
      "72,73",
      "72,74",
      "61,73",
      "62,73",
      "63,73",
      "63,74",
      "62,74",
      "62,75",
      "61,75",
      "61,74",
      "58,63",
      "58,64",
      "58,65",
      "58,66",
      "58,67",
      "58,68",
      "58,69",
      "58,70",
      "58,71",
      "49,72",
      "50,72",
      "51,72",
      "52,72",
      "52,73",
      "52,74",
      "51,74",
      "50,74",
      "49,74",
      "49,73",
      "50,73",
      "51,73",
      "59,60",
      "58,60",
      "58,61",
      "58,62",
      "62,80",
      "63,80",
      "64,80",
      "65,80",
      "65,81",
      "64,81",
      "64,82",
      "63,82",
      "62,82",
      "62,81",
      "63,81",
      "57,84",
      "58,84",
      "59,84",
      "60,84",
      "61,84",
      "62,84",
      "63,84",
      "64,84",
      "54,84",
      "55,84",
      "56,84",
      "32,77",
      "33,77",
      "34,77",
      "35,77",
      "36,77",
      "37,77",
      "37,78",
      "37,79",
      "35,81",
      "34,81",
      "33,81",
      "32,81",
      "31,81",
      "31,80",
      "31,79",
      "32,78",
      "34,78",
      "35,78",
      "35,79",
      "34,80",
      "33,80",
      "32,80",
      "32,79",
      "33,78",
      "34,79",
      "36,78",
      "36,79",
      "38,74",
      "39,74",
      "40,74",
      "41,74",
      "42,74",
      "43,74",
      "43,75",
      "42,75",
      "41,75",
      "40,75",
      "39,75",
      "38,75",
      "37,74",
      "37,75",
      "37,76",
      "8,88",
      "8,87",
      "8,86",
      "8,85",
      "8,84",
      "8,83",
      "8,82",
      "8,81",
      "8,80",
      "8,79",
      "8,78",
      "8,77",
      "8,76",
      "8,75",
      "7,74",
      "8,74",
      "9,74",
      "10,74",
      "10,75",
      "10,76",
      "10,77",
      "9,77",
      "9,76",
      "9,75",
      "7,75",
      "7,76",
      "7,77",
      "9,78",
      "10,78",
      "11,78",
      "12,78",
      "14,78",
      "14,79",
      "14,80",
      "38,76",
      "38,77",
      "38,78",
      "38,79",
      "38,80",
      "37,80",
      "36,80",
      "35,80",
      "33,79",
      "4,67",
      "5,67",
      "6,67",
      "7,67",
      "8,67",
      "8,68",
      "7,68",
      "7,69",
      "6,69",
      "5,69",
      "5,68",
      "6,68",
      "8,69",
      "4,69",
      "4,68",
      "4,66",
      "5,66",
      "6,66",
      "7,66",
      "8,66",
      "38,61",
      "39,61",
      "39,62",
      "39,63",
      "39,64",
      "39,65",
      "39,66",
      "39,67",
      "39,68",
      "39,69",
      "40,69",
      "40,70",
      "40,68",
      "40,67",
      "40,66",
      "40,65",
      "40,64",
      "40,63",
      "40,62",
      "40,61",
      "37,61",
      "42,69",
      "41,70",
      "41,69",
      "42,70",
      "34,62",
      "34,63",
      "39,70",
      "33,62",
      "33,63",
      "41,59",
      "40,60",
      "38,60",
      "52,47",
      "53,47",
      "54,47",
      "55,47",
      "56,47",
      "57,47",
      "58,47",
      "59,47",
      "60,47",
      "61,47",
      "52,46",
      "53,46",
      "54,46",
      "55,46",
      "56,46",
      "57,46",
      "58,46",
      "59,46",
      "60,46",
      "47,36",
      "47,37",
      "47,38",
      "46,38",
      "46,39",
      "47,39",
      "48,39",
      "49,39",
      "49,38",
      "49,37",
      "49,36",
      "48,36",
      "48,35",
      "48,37",
      "48,38",
      "46,36",
      "46,37",
      "46,35",
      "47,35",
      "49,35",
      "34,42",
      "35,42",
      "35,41",
      "36,41",
      "37,41",
      "38,41",
      "39,41",
      "40,41",
      "40,42",
      "41,42",
      "42,42",
      "42,41",
      "43,41",
      "44,41",
      "36,42",
      "37,42",
      "38,42",
      "39,42",
      "41,41",
      "44,42",
      "34,41",
      "43,42",
      "21,38",
      "22,38",
      "23,38",
      "24,38",
      "25,38",
      "26,38",
      "27,38",
      "28,38",
      "29,38",
      "30,38",
      "22,39",
      "23,39",
      "24,39",
      "25,39",
      "26,39",
      "27,39",
      "28,39",
      "29,39",
      "30,39",
      "32,30",
      "33,31",
      "32,33",
      "32,34",
      "32,35",
      "32,36",
      "32,37",
      "32,38",
      "32,39",
      "31,38",
      "31,37",
      "5,19",
      "5,20",
      "5,21",
      "5,22",
      "5,24",
      "5,25",
      "5,27",
      "5,28",
      "5,29",
      "5,30",
      "5,31",
      "5,32",
      "3,6",
      "3,5",
      "3,7",
      "3,8",
      "3,10",
      "3,12",
      "3,13",
      "3,15",
      "3,16",
      "4,5",
      "5,5",
      "6,5",
      "7,5",
      "7,6",
      "7,7",
      "7,8",
      "7,10",
      "7,11",
      "7,12",
      "7,13",
      "7,14",
      "7,15",
      "7,16",
      "7,17",
      "6,17",
      "6,18",
      "5,18",
      "4,18",
      "4,17",
      "3,9",
      "3,11",
      "4,12",
      "5,8",
      "5,9",
      "5,10",
      "5,12",
      "5,13",
      "5,15",
      "5,16",
      "5,17",
      "50,9",
      "49,9",
      "51,9",
      "52,9",
      "53,9",
      "54,9",
      "55,9",
      "56,9",
      "57,9",
      "50,5",
      "51,5",
      "52,5",
      "53,5",
      "54,5",
      "55,5",
      "56,5",
      "58,34",
      "58,35",
      "62,40",
      "62,39",
      "63,39",
      "64,39",
      "65,39",
      "66,39",
      "66,40",
      "65,40",
      "64,40",
      "63,40",
      "59,34",
      "59,35",
      "59,36",
      "72,33",
      "72,34",
      "72,35",
      "72,36",
      "72,37",
      "72,39",
      "72,40",
      "72,41",
      "72,42",
      "72,43",
      "72,44",
      "72,45",
      "72,46",
      "72,47",
      "72,48",
      "73,48",
      "73,47",
      "74,47",
      "74,46",
      "74,45",
      "74,44",
      "74,43",
      "74,42",
      "74,41",
      "74,40",
      "74,39",
      "74,38",
      "74,37",
      "74,36",
      "74,35",
      "74,34",
      "74,33",
      "73,33",
      "73,34",
      "73,35",
      "73,36",
      "73,37",
      "73,38",
      "73,39",
      "73,40",
      "73,41",
      "73,42",
      "73,43",
      "73,44",
      "73,45",
      "73,46",
      "72,38",
      "6,45",
      "5,46",
      "4,46",
      "3,46",
      "3,47",
      "4,47",
      "5,47",
      "6,47",
      "7,47",
      "8,47",
      "9,47",
      "36,83",
      "37,83",
      "38,84",
      "39,84",
      "40,84",
      "41,84",
      "40,85",
      "39,85",
      "38,85",
      "37,85",
      "36,85",
      "35,85",
      "34,85",
      "34,84",
      "35,84",
      "36,84",
      "37,84",
      "41,85",
      "42,85",
      "34,82",
      "35,82",
      "36,82",
      "35,83",
      "34,83",
      "42,76",
      "41,76",
      "40,76",
      "39,76",
      "29,77",
      "29,78",
      "29,79",
      "29,80",
      "30,80",
      "31,78",
      "31,77",
      "30,78",
      "30,79",
      "30,77",
      "28,78",
      "28,79",
      "28,80",
      "28,77",
      "27,77",
      "27,78",
      "27,79",
      "27,80",
      "13,77",
      "13,82",
      "14,81",
      "16,81",
      "18,81",
      "20,81",
      "22,81",
      "23,81",
      "24,81",
      "25,81",
      "26,81",
      "27,81",
      "28,81"
    ],
    "coreCount": 2,
    "monsterMix": [
      {
        "id": "slime",
        "weight": 90
      },
      {
        "id": "bird_head",
        "weight": 90
      },
      {
        "id": "milkfish_kid",
        "weight": 40
      },
      {
        "id": "milkfish_kid_small",
        "weight": 70
      }
    ],
    "camp": [],
    "rules": {
      "money": 3000,
      "guide": 100,
      "guideRegen": 9,
      "speed": 44,
      "reward": 8
    },
    "solidOffsets": {},
    "safe": false,
    "npcs": false,
    "portals": [
      {
        "c": 6,
        "r": 89,
        "to": "map_a46c5e1a-9802-4db5-a3b9-486b4649c206"
      },
      {
        "c": 7,
        "r": 89,
        "to": "map_a46c5e1a-9802-4db5-a3b9-486b4649c206"
      },
      {
        "c": 8,
        "r": 89,
        "to": "map_a46c5e1a-9802-4db5-a3b9-486b4649c206"
      },
      {
        "c": 9,
        "r": 89,
        "to": "map_a46c5e1a-9802-4db5-a3b9-486b4649c206"
      },
      {
        "c": 10,
        "r": 89,
        "to": "map_a46c5e1a-9802-4db5-a3b9-486b4649c206"
      },
      {
        "c": 70,
        "r": 10,
        "to": "map_mvnjr2ze"
      }
    ],
    "hiddenPickups": [
      "object:53,59",
      "object:38,69",
      "object:15,73",
      "object4:7,21",
      "object4:2,19",
      "object4:25,28",
      "object2:45,28",
      "object2:33,75",
      "object2:33,73",
      "object2:82,65"
    ],
    "cols": 92,
    "rows": 90,
    "layerOrder": [
      {
        "id": "floor",
        "name": "🟫 地板"
      },
      {
        "id": "ground",
        "name": "🌿 地面裝飾"
      },
      {
        "id": "ground2",
        "name": "🍂 地面裝飾 2"
      },
      {
        "id": "ground4",
        "name": "隱藏地圖",
        "secret": true
      },
      {
        "id": "object5",
        "name": "隱藏地圖02",
        "secret": true
      },
      {
        "id": "ground3",
        "name": "🩹 地面裝飾 3"
      },
      {
        "id": "object",
        "name": "📦 物件"
      },
      {
        "id": "object2",
        "name": "🧰 物件 2"
      },
      {
        "id": "object3",
        "name": "🪑 物件 3"
      },
      {
        "id": "object6",
        "name": "隱藏地圖03",
        "secret": true
      },
      {
        "id": "object4",
        "name": "🚧 物件 4"
      },
      {
        "id": "overlay",
        "name": "🎯 物件裝飾"
      },
      {
        "id": "top",
        "name": "☁️ 上層"
      }
    ],
    "coreFixed": [
      "5,7"
    ],
    "mrtExitKeys": 2,
    "elite": {
      "of": "bird_head",
      "c": 5,
      "r": 9,
      "wakeRow": 10,
      "guards": [
        [
          3,
          9
        ],
        [
          7,
          9
        ],
        [
          6,
          8
        ]
      ],
      "ambush": [
        [
          4,
          29
        ],
        [
          5,
          29
        ],
        [
          6,
          29
        ]
      ]
    }
  },
  {
    "id": "map_mvvdbiyx",
    "name": "新地圖 7",
    "desc": "",
    "layers": {
      "floor": {
        "44,70": "floor",
        "44,69": "floor",
        "44,68": "floor",
        "43,70": "floor",
        "42,70": "floor",
        "41,70": "floor",
        "40,70": "floor",
        "39,70": "floor",
        "38,70": "floor",
        "37,70": "floor",
        "36,70": "floor",
        "36,69": "floor",
        "37,69": "floor",
        "38,69": "floor",
        "39,69": "floor",
        "40,69": "floor",
        "41,69": "floor",
        "42,69": "floor",
        "43,69": "floor",
        "39,77": "floor",
        "40,77": "floor",
        "41,77": "floor",
        "42,77": "floor",
        "43,77": "floor",
        "44,77": "floor",
        "45,77": "floor",
        "46,77": "floor",
        "47,77": "floor",
        "38,74": "floor",
        "37,74": "floor",
        "36,74": "floor",
        "35,74": "floor",
        "34,74": "floor",
        "33,74": "floor",
        "32,74": "floor",
        "32,73": "floor",
        "32,72": "floor",
        "32,70": "floor",
        "32,69": "floor",
        "32,68": "floor",
        "32,67": "floor",
        "32,66": "floor",
        "32,65": "floor",
        "32,64": "floor",
        "32,63": "floor",
        "32,62": "floor",
        "36,60": "floor",
        "36,61": "floor",
        "36,62": "floor",
        "36,63": "floor",
        "36,64": "floor",
        "36,65": "floor",
        "36,66": "floor",
        "36,67": "floor",
        "36,68": "floor",
        "36,46": "tile_mr4czvpx",
        "36,45": "tile_mr4czvpx",
        "36,44": "tile_mr4czvpx",
        "36,43": "tile_mr4czvpx",
        "48,24": "floor",
        "51,27": "floor",
        "52,27": "floor",
        "53,27": "floor",
        "63,15": "tile_bg_extra_floor02_extra",
        "64,15": "tile_bg_extra_floor02_extra",
        "65,15": "tile_bg_extra_floor02_extra",
        "66,15": "tile_bg_extra_floor02_extra",
        "67,15": "tile_bg_extra_floor02_extra",
        "68,15": "tile_bg_extra_floor02_extra",
        "69,15": "tile_bg_extra_floor02_extra",
        "70,15": "tile_bg_extra_floor02_extra",
        "71,15": "tile_bg_extra_floor02_extra",
        "72,15": "tile_bg_extra_floor02_extra",
        "73,15": "tile_bg_extra_floor02_extra",
        "74,15": "tile_bg_extra_floor02_extra",
        "63,16": "tile_bg_extra_floor02_extra",
        "64,16": "tile_bg_extra_floor02_extra",
        "65,16": "tile_bg_extra_floor02_extra",
        "66,16": "tile_bg_extra_floor02_extra",
        "67,16": "tile_bg_extra_floor02_extra",
        "68,16": "tile_bg_extra_floor02_extra",
        "69,16": "tile_bg_extra_floor02_extra",
        "70,16": "tile_bg_extra_floor02_extra",
        "71,16": "tile_bg_extra_floor02_extra",
        "72,16": "tile_bg_extra_floor02_extra",
        "73,16": "tile_bg_extra_floor02_extra",
        "74,16": "tile_bg_extra_floor02_extra",
        "63,17": "tile_bg_extra_floor02_extra",
        "64,17": "tile_bg_extra_floor02_extra",
        "65,17": "tile_bg_extra_floor02_extra",
        "66,17": "tile_bg_extra_floor02_extra",
        "67,17": "tile_bg_extra_floor02_extra",
        "68,17": "tile_bg_extra_floor02_extra",
        "69,17": "tile_bg_extra_floor02_extra",
        "70,17": "tile_bg_extra_floor02_extra",
        "71,17": "tile_bg_extra_floor02_extra",
        "72,17": "tile_bg_extra_floor02_extra",
        "73,17": "tile_bg_extra_floor02_extra",
        "74,17": "tile_bg_extra_floor02_extra",
        "63,18": "tile_bg_extra_floor02_extra",
        "64,18": "tile_bg_extra_floor02_extra",
        "65,18": "tile_bg_extra_floor02_extra",
        "66,18": "tile_bg_extra_floor02_extra",
        "67,18": "tile_bg_extra_floor02_extra",
        "68,18": "tile_bg_extra_floor02_extra",
        "69,18": "tile_bg_extra_floor02_extra",
        "70,18": "tile_bg_extra_floor02_extra",
        "71,18": "tile_bg_extra_floor02_extra",
        "72,18": "tile_bg_extra_floor02_extra",
        "73,18": "tile_bg_extra_floor02_extra",
        "74,18": "tile_bg_extra_floor02_extra",
        "63,19": "tile_bg_extra_floor02_extra",
        "64,19": "tile_bg_extra_floor02_extra",
        "65,19": "tile_bg_extra_floor02_extra",
        "66,19": "tile_bg_extra_floor02_extra",
        "67,19": "tile_bg_extra_floor02_extra",
        "68,19": "tile_bg_extra_floor02_extra",
        "69,19": "tile_bg_extra_floor02_extra",
        "70,19": "tile_bg_extra_floor02_extra",
        "71,19": "tile_bg_extra_floor02_extra",
        "72,19": "tile_bg_extra_floor02_extra",
        "73,19": "tile_bg_extra_floor02_extra",
        "74,19": "tile_bg_extra_floor02_extra",
        "63,20": "tile_bg_extra_floor02_extra",
        "64,20": "tile_bg_extra_floor02_extra",
        "65,20": "tile_bg_extra_floor02_extra",
        "66,20": "tile_bg_extra_floor02_extra",
        "67,20": "tile_bg_extra_floor02_extra",
        "68,20": "tile_bg_extra_floor02_extra",
        "69,20": "tile_bg_extra_floor02_extra",
        "70,20": "tile_bg_extra_floor02_extra",
        "71,20": "tile_bg_extra_floor02_extra",
        "72,20": "tile_bg_extra_floor02_extra",
        "73,20": "tile_bg_extra_floor02_extra",
        "74,20": "tile_bg_extra_floor02_extra",
        "63,21": "tile_bg_extra_floor02_extra",
        "64,21": "tile_bg_extra_floor02_extra",
        "65,21": "tile_bg_extra_floor02_extra",
        "66,21": "tile_bg_extra_floor02_extra",
        "67,21": "tile_bg_extra_floor02_extra",
        "68,21": "tile_bg_extra_floor02_extra",
        "69,21": "tile_bg_extra_floor02_extra",
        "70,21": "tile_bg_extra_floor02_extra",
        "71,21": "tile_bg_extra_floor02_extra",
        "73,21": "tile_bg_extra_floor02_extra",
        "74,21": "tile_bg_extra_floor02_extra",
        "63,22": "tile_bg_extra_floor02_extra",
        "64,22": "tile_bg_extra_floor02_extra",
        "65,22": "tile_bg_extra_floor02_extra",
        "66,22": "tile_bg_extra_floor02_extra",
        "67,22": "tile_bg_extra_floor02_extra",
        "68,22": "tile_bg_extra_floor02_extra",
        "69,22": "tile_bg_extra_floor02_extra",
        "70,22": "tile_bg_extra_floor02_extra",
        "71,22": "tile_bg_extra_floor02_extra",
        "63,23": "tile_bg_extra_floor02_extra",
        "64,23": "tile_bg_extra_floor02_extra",
        "65,23": "tile_bg_extra_floor02_extra",
        "66,23": "tile_bg_extra_floor02_extra",
        "67,23": "tile_bg_extra_floor02_extra",
        "68,23": "tile_bg_extra_floor02_extra",
        "69,23": "tile_bg_extra_floor02_extra",
        "70,23": "tile_bg_extra_floor02_extra",
        "71,23": "tile_bg_extra_floor02_extra",
        "60,24": "tile_bg_extra_floor02_extra",
        "61,24": "tile_bg_extra_floor02_extra",
        "62,24": "tile_bg_extra_floor02_extra",
        "63,24": "tile_bg_extra_floor02_extra",
        "64,24": "tile_bg_extra_floor02_extra",
        "65,24": "tile_bg_extra_floor02_extra",
        "66,24": "tile_bg_extra_floor02_extra",
        "67,24": "tile_bg_extra_floor02_extra",
        "68,24": "tile_bg_extra_floor02_extra",
        "69,24": "tile_bg_extra_floor02_extra",
        "70,24": "tile_bg_extra_floor02_extra",
        "71,24": "tile_bg_extra_floor02_extra",
        "63,25": "tile_bg_extra_floor02_extra",
        "64,25": "tile_bg_extra_floor02_extra",
        "65,25": "tile_bg_extra_floor02_extra",
        "66,25": "tile_bg_extra_floor02_extra",
        "67,25": "tile_bg_extra_floor02_extra",
        "68,25": "tile_bg_extra_floor02_extra",
        "69,25": "tile_bg_extra_floor02_extra",
        "70,25": "tile_bg_extra_floor02_extra",
        "71,25": "tile_bg_extra_floor02_extra",
        "63,26": "tile_bg_extra_floor02_extra",
        "64,26": "tile_bg_extra_floor02_extra",
        "65,26": "tile_bg_extra_floor02_extra",
        "66,26": "tile_bg_extra_floor02_extra",
        "67,26": "tile_bg_extra_floor02_extra",
        "68,26": "tile_bg_extra_floor02_extra",
        "69,26": "tile_bg_extra_floor02_extra",
        "70,26": "tile_bg_extra_floor02_extra",
        "71,26": "tile_bg_extra_floor02_extra",
        "63,27": "tile_bg_extra_floor02_extra",
        "64,27": "tile_bg_extra_floor02_extra",
        "65,27": "tile_bg_extra_floor02_extra",
        "66,27": "tile_bg_extra_floor02_extra",
        "67,27": "tile_bg_extra_floor02_extra",
        "68,27": "tile_bg_extra_floor02_extra",
        "69,27": "tile_bg_extra_floor02_extra",
        "70,27": "tile_bg_extra_floor02_extra",
        "71,27": "tile_bg_extra_floor02_extra",
        "63,28": "tile_bg_extra_floor02_extra",
        "64,28": "tile_bg_extra_floor02_extra",
        "65,28": "tile_bg_extra_floor02_extra",
        "66,28": "tile_bg_extra_floor02_extra",
        "67,28": "tile_bg_extra_floor02_extra",
        "68,28": "tile_bg_extra_floor02_extra",
        "69,28": "tile_bg_extra_floor02_extra",
        "70,28": "tile_bg_extra_floor02_extra",
        "71,28": "tile_bg_extra_floor02_extra",
        "72,28": "tile_bg_extra_floor02_extra",
        "73,28": "tile_bg_extra_floor02_extra",
        "74,28": "tile_bg_extra_floor02_extra",
        "63,29": "tile_bg_extra_floor02_extra",
        "64,29": "tile_bg_extra_floor02_extra",
        "65,29": "tile_bg_extra_floor02_extra",
        "66,29": "tile_bg_extra_floor02_extra",
        "67,29": "tile_bg_extra_floor02_extra",
        "68,29": "tile_bg_extra_floor02_extra",
        "69,29": "tile_bg_extra_floor02_extra",
        "70,29": "tile_bg_extra_floor02_extra",
        "71,29": "tile_bg_extra_floor02_extra",
        "63,30": "tile_bg_extra_floor02_extra",
        "64,30": "tile_bg_extra_floor02_extra",
        "65,30": "tile_bg_extra_floor02_extra",
        "66,30": "tile_bg_extra_floor02_extra",
        "67,30": "tile_bg_extra_floor02_extra",
        "68,30": "tile_bg_extra_floor02_extra",
        "69,30": "tile_bg_extra_floor02_extra",
        "70,30": "tile_bg_extra_floor02_extra",
        "71,30": "tile_bg_extra_floor02_extra",
        "66,31": "tile_bg_extra_floor02_extra",
        "67,31": "tile_bg_extra_floor02_extra",
        "68,31": "tile_bg_extra_floor02_extra",
        "69,31": "tile_bg_extra_floor02_extra",
        "70,31": "tile_bg_extra_floor02_extra",
        "71,31": "tile_bg_extra_floor02_extra",
        "57,32": "tile_bg_extra_floor02_extra",
        "58,32": "tile_bg_extra_floor02_extra",
        "59,32": "tile_bg_extra_floor02_extra",
        "66,32": "tile_bg_extra_floor02_extra",
        "67,32": "tile_bg_extra_floor02_extra",
        "68,32": "tile_bg_extra_floor02_extra",
        "69,32": "tile_bg_extra_floor02_extra",
        "70,32": "tile_bg_extra_floor02_extra",
        "71,32": "tile_bg_extra_floor02_extra",
        "57,33": "tile_bg_extra_floor02_extra",
        "58,33": "tile_bg_extra_floor02_extra",
        "59,33": "tile_bg_extra_floor02_extra",
        "66,33": "tile_bg_extra_floor02_extra",
        "67,33": "tile_bg_extra_floor02_extra",
        "68,33": "tile_bg_extra_floor02_extra",
        "69,33": "tile_bg_extra_floor02_extra",
        "70,33": "tile_bg_extra_floor02_extra",
        "71,33": "tile_bg_extra_floor02_extra",
        "57,34": "tile_bg_extra_floor02_extra",
        "58,34": "tile_bg_extra_floor02_extra",
        "59,34": "tile_bg_extra_floor02_extra",
        "66,34": "tile_bg_extra_floor02_extra",
        "67,34": "tile_bg_extra_floor02_extra",
        "62,14": "tile_bg_extra_floor02_extra",
        "63,14": "tile_bg_extra_floor02_extra",
        "64,14": "tile_bg_extra_floor02_extra",
        "65,14": "tile_bg_extra_floor02_extra",
        "66,14": "tile_bg_extra_floor02_extra",
        "67,14": "tile_bg_extra_floor02_extra",
        "68,14": "tile_bg_extra_floor02_extra",
        "69,14": "tile_bg_extra_floor02_extra",
        "70,14": "tile_bg_extra_floor02_extra",
        "71,14": "tile_bg_extra_floor02_extra",
        "72,14": "tile_bg_extra_floor02_extra",
        "73,14": "tile_bg_extra_floor02_extra",
        "74,14": "tile_bg_extra_floor02_extra",
        "75,14": "tile_bg_extra_floor02_extra",
        "62,13": "tile_bg_extra_floor02_extra",
        "63,13": "tile_bg_extra_floor02_extra",
        "64,13": "tile_bg_extra_floor02_extra",
        "65,13": "tile_bg_extra_floor02_extra",
        "66,13": "tile_bg_extra_floor02_extra",
        "67,13": "tile_bg_extra_floor02_extra",
        "68,13": "tile_bg_extra_floor02_extra",
        "70,13": "tile_bg_extra_floor02_extra",
        "71,13": "tile_bg_extra_floor02_extra",
        "72,13": "tile_bg_extra_floor02_extra",
        "73,13": "tile_bg_extra_floor02_extra",
        "74,13": "tile_bg_extra_floor02_extra",
        "75,13": "tile_bg_extra_floor02_extra",
        "69,13": "tile_bg_extra_floor02_extra",
        "62,12": "tile_bg_extra_floor02_extra",
        "62,11": "tile_bg_extra_floor02_extra",
        "62,10": "tile_bg_extra_floor02_extra",
        "62,9": "tile_bg_extra_floor02_extra",
        "62,8": "tile_bg_extra_floor02_extra",
        "62,7": "tile_bg_extra_floor02_extra",
        "63,6": "tile_bg_extra_floor02_extra",
        "64,6": "tile_bg_extra_floor02_extra",
        "65,6": "tile_bg_extra_floor02_extra",
        "66,6": "tile_bg_extra_floor02_extra",
        "74,6": "tile_bg_extra_floor02_extra",
        "73,6": "tile_bg_extra_floor02_extra",
        "62,6": "tile_bg_extra_floor02_extra",
        "75,6": "tile_bg_extra_floor02_extra",
        "75,7": "tile_bg_extra_floor02_extra",
        "75,8": "tile_bg_extra_floor02_extra",
        "75,9": "tile_bg_extra_floor02_extra",
        "74,10": "tile_bg_extra_floor02_extra",
        "74,11": "tile_bg_extra_floor02_extra",
        "74,12": "tile_bg_extra_floor02_extra",
        "75,12": "tile_bg_extra_floor02_extra",
        "75,11": "tile_bg_extra_floor02_extra",
        "75,10": "tile_bg_extra_floor02_extra",
        "63,10": "tile_bg_extra_floor02_extra",
        "63,11": "tile_bg_extra_floor02_extra",
        "63,12": "tile_bg_extra_floor02_extra",
        "64,12": "tile_bg_extra_floor02_extra",
        "65,12": "tile_bg_extra_floor02_extra",
        "66,12": "tile_bg_extra_floor02_extra",
        "67,12": "tile_bg_extra_floor02_extra",
        "68,12": "tile_bg_extra_floor02_extra",
        "69,12": "tile_bg_extra_floor02_extra",
        "70,12": "tile_bg_extra_floor02_extra",
        "71,12": "tile_bg_extra_floor02_extra",
        "72,12": "tile_bg_extra_floor02_extra",
        "73,12": "tile_bg_extra_floor02_extra",
        "73,11": "tile_bg_extra_floor02_extra",
        "73,10": "tile_bg_extra_floor02_extra",
        "71,10": "tile_bg_extra_floor02_extra",
        "72,10": "tile_bg_extra_floor02_extra",
        "72,11": "tile_bg_extra_floor02_extra",
        "71,11": "tile_bg_extra_floor02_extra",
        "70,11": "tile_bg_extra_floor02_extra",
        "69,11": "tile_bg_extra_floor02_extra",
        "68,11": "tile_bg_extra_floor02_extra",
        "67,11": "tile_bg_extra_floor02_extra",
        "67,10": "tile_bg_extra_floor02_extra",
        "66,10": "tile_bg_extra_floor02_extra",
        "65,10": "tile_bg_extra_floor02_extra",
        "68,10": "tile_bg_extra_floor02_extra",
        "69,10": "tile_bg_extra_floor02_extra",
        "70,10": "tile_bg_extra_floor02_extra",
        "64,10": "tile_bg_extra_floor02_extra",
        "64,11": "tile_bg_extra_floor02_extra",
        "65,11": "tile_bg_extra_floor02_extra",
        "66,11": "tile_bg_extra_floor02_extra",
        "75,15": "tile_bg_extra_floor02_extra",
        "75,16": "tile_bg_extra_floor02_extra",
        "75,17": "tile_bg_extra_floor02_extra",
        "75,18": "tile_bg_extra_floor02_extra",
        "75,19": "tile_bg_extra_floor02_extra",
        "75,20": "tile_bg_extra_floor02_extra",
        "75,21": "tile_bg_extra_floor02_extra",
        "75,22": "tile_bg_extra_floor02_extra",
        "62,15": "tile_bg_extra_floor02_extra",
        "62,16": "tile_bg_extra_floor02_extra",
        "62,17": "tile_bg_extra_floor02_extra",
        "62,18": "tile_bg_extra_floor02_extra",
        "62,19": "tile_bg_extra_floor02_extra",
        "62,20": "tile_bg_extra_floor02_extra",
        "62,21": "tile_bg_extra_floor02_extra",
        "93,69": "floor",
        "24,71": "tile_mr4czvpx"
      },
      "ground": {
        "67,53": "tile_bg_extra_floor02_extra",
        "67,54": "tile_bg_extra_floor02_extra",
        "68,54": "tile_bg_extra_floor02_extra",
        "69,54": "tile_bg_extra_floor02_extra",
        "69,53": "tile_bg_extra_floor02_extra",
        "69,52": "tile_bg_extra_floor02_extra",
        "68,52": "tile_bg_extra_floor02_extra",
        "68,53": "tile_bg_extra_floor02_extra",
        "70,54": "tile_bg_extra_floor02_extra",
        "70,53": "tile_bg_extra_floor02_extra",
        "70,52": "tile_bg_extra_floor02_extra",
        "69,51": "tile_bg_extra_floor02_extra",
        "68,51": "tile_bg_extra_floor02_extra",
        "67,52": "tile_bg_extra_floor02_extra",
        "67,51": "tile_bg_extra_floor02_extra",
        "67,50": "tile_bg_extra_floor02_extra",
        "67,49": "tile_bg_extra_floor02_extra",
        "67,48": "tile_bg_extra_floor02_extra",
        "67,47": "tile_bg_extra_floor02_extra",
        "68,47": "tile_bg_extra_floor02_extra",
        "69,47": "tile_bg_extra_floor02_extra",
        "70,47": "tile_bg_extra_floor02_extra",
        "70,48": "tile_bg_extra_floor02_extra",
        "70,49": "tile_bg_extra_floor02_extra",
        "70,50": "tile_bg_extra_floor02_extra",
        "70,51": "tile_bg_extra_floor02_extra",
        "68,50": "tile_bg_extra_floor02_extra",
        "68,49": "tile_bg_extra_floor02_extra",
        "68,48": "tile_bg_extra_floor02_extra",
        "69,48": "tile_bg_extra_floor02_extra",
        "69,49": "tile_bg_extra_floor02_extra",
        "69,50": "tile_bg_extra_floor02_extra",
        "68,42": "tile_bg_extra_floor02_extra",
        "68,43": "tile_bg_extra_floor02_extra",
        "67,43": "tile_bg_extra_floor02_extra",
        "67,44": "tile_bg_extra_floor02_extra",
        "67,45": "tile_bg_extra_floor02_extra",
        "67,46": "tile_bg_extra_floor02_extra",
        "69,43": "tile_bg_extra_floor02_extra",
        "70,43": "tile_bg_extra_floor02_extra",
        "70,44": "tile_bg_extra_floor02_extra",
        "70,45": "tile_bg_extra_floor02_extra",
        "70,46": "tile_bg_extra_floor02_extra",
        "68,46": "tile_bg_extra_floor02_extra",
        "68,45": "tile_bg_extra_floor02_extra",
        "68,44": "tile_bg_extra_floor02_extra",
        "69,44": "tile_bg_extra_floor02_extra",
        "69,45": "tile_bg_extra_floor02_extra",
        "69,46": "tile_bg_extra_floor02_extra",
        "68,41": "tile_bg_extra_floor02_extra",
        "67,41": "tile_bg_extra_floor02_extra",
        "67,40": "tile_bg_extra_floor02_extra",
        "67,39": "tile_bg_extra_floor02_extra",
        "67,38": "tile_bg_extra_floor02_extra",
        "67,42": "tile_bg_extra_floor02_extra",
        "68,39": "tile_bg_extra_floor02_extra",
        "69,39": "tile_bg_extra_floor02_extra",
        "70,39": "tile_bg_extra_floor02_extra",
        "70,40": "tile_bg_extra_floor02_extra",
        "70,41": "tile_bg_extra_floor02_extra",
        "70,42": "tile_bg_extra_floor02_extra",
        "69,42": "tile_bg_extra_floor02_extra",
        "68,40": "tile_bg_extra_floor02_extra",
        "69,41": "tile_bg_extra_floor02_extra",
        "69,40": "tile_bg_extra_floor02_extra",
        "68,38": "tile_bg_extra_floor02_extra",
        "69,38": "tile_bg_extra_floor02_extra",
        "70,38": "tile_bg_extra_floor02_extra",
        "67,35": "tile_bg_extra_floor02_extra",
        "67,36": "tile_bg_extra_floor02_extra",
        "67,37": "tile_bg_extra_floor02_extra",
        "69,34": "tile_bg_extra_floor02_extra",
        "69,35": "tile_bg_extra_floor02_extra",
        "69,36": "tile_bg_extra_floor02_extra",
        "69,37": "tile_bg_extra_floor02_extra",
        "68,37": "tile_bg_extra_floor02_extra",
        "68,36": "tile_bg_extra_floor02_extra",
        "68,35": "tile_bg_extra_floor02_extra",
        "68,34": "tile_bg_extra_floor02_extra",
        "70,34": "tile_bg_extra_floor02_extra",
        "70,35": "tile_bg_extra_floor02_extra",
        "70,36": "tile_bg_extra_floor02_extra",
        "70,37": "tile_bg_extra_floor02_extra",
        "66,54": "tile_bg_extra_floor02_extra",
        "66,53": "tile_bg_extra_floor02_extra",
        "66,52": "tile_bg_extra_floor02_extra",
        "66,51": "tile_bg_extra_floor02_extra",
        "66,50": "tile_bg_extra_floor02_extra",
        "66,49": "tile_bg_extra_floor02_extra",
        "66,48": "tile_bg_extra_floor02_extra",
        "66,47": "tile_bg_extra_floor02_extra",
        "66,46": "tile_bg_extra_floor02_extra",
        "66,45": "tile_bg_extra_floor02_extra",
        "66,44": "tile_bg_extra_floor02_extra",
        "66,43": "tile_bg_extra_floor02_extra",
        "66,42": "tile_bg_extra_floor02_extra",
        "66,41": "tile_bg_extra_floor02_extra",
        "66,40": "tile_bg_extra_floor02_extra",
        "66,39": "tile_bg_extra_floor02_extra",
        "66,38": "tile_bg_extra_floor02_extra",
        "66,37": "tile_bg_extra_floor02_extra",
        "66,36": "tile_bg_extra_floor02_extra",
        "66,35": "tile_bg_extra_floor02_extra",
        "71,34": "tile_bg_extra_floor02_extra",
        "71,35": "tile_bg_extra_floor02_extra",
        "71,36": "tile_bg_extra_floor02_extra",
        "71,37": "tile_bg_extra_floor02_extra",
        "71,38": "tile_bg_extra_floor02_extra",
        "71,39": "tile_bg_extra_floor02_extra",
        "71,40": "tile_bg_extra_floor02_extra",
        "71,41": "tile_bg_extra_floor02_extra",
        "71,42": "tile_bg_extra_floor02_extra",
        "71,43": "tile_bg_extra_floor02_extra",
        "71,44": "tile_bg_extra_floor02_extra",
        "71,45": "tile_bg_extra_floor02_extra",
        "71,51": "tile_bg_extra_floor02_extra",
        "71,52": "tile_bg_extra_floor02_extra",
        "71,53": "tile_bg_extra_floor02_extra",
        "71,54": "tile_bg_extra_floor02_extra",
        "71,50": "tile_bg_extra_floor02_extra",
        "71,49": "tile_bg_extra_floor02_extra",
        "71,48": "tile_bg_extra_floor02_extra",
        "71,47": "tile_bg_extra_floor02_extra",
        "71,46": "tile_bg_extra_floor02_extra",
        "63,41": "tile_bg_extra_floor02_extra",
        "64,41": "tile_bg_extra_floor02_extra",
        "65,41": "tile_bg_extra_floor02_extra",
        "74,36": "tile_bg_extra_floor02_extra",
        "73,36": "tile_bg_extra_floor02_extra",
        "72,36": "tile_bg_extra_floor02_extra",
        "51,36": "tile_bg_extra_floor02_extra",
        "51,37": "tile_bg_extra_floor02_extra",
        "51,38": "tile_bg_extra_floor02_extra",
        "51,39": "tile_bg_extra_floor02_extra",
        "51,40": "tile_bg_extra_floor02_extra",
        "51,41": "tile_bg_extra_floor02_extra",
        "51,42": "tile_bg_extra_floor02_extra",
        "51,43": "tile_bg_extra_floor02_extra",
        "51,44": "tile_bg_extra_floor02_extra",
        "51,45": "tile_bg_extra_floor02_extra",
        "51,46": "tile_bg_extra_floor02_extra",
        "51,47": "tile_bg_extra_floor02_extra",
        "51,48": "tile_bg_extra_floor02_extra",
        "51,49": "tile_bg_extra_floor02_extra",
        "51,50": "tile_bg_extra_floor02_extra",
        "51,51": "tile_bg_extra_floor02_extra",
        "51,52": "tile_bg_extra_floor02_extra",
        "51,53": "tile_bg_extra_floor02_extra",
        "51,54": "tile_bg_extra_floor02_extra",
        "51,55": "tile_bg_extra_floor02_extra",
        "51,56": "tile_bg_extra_floor02_extra",
        "51,57": "tile_bg_extra_floor02_extra",
        "51,58": "tile_bg_extra_floor02_extra",
        "56,58": "tile_bg_extra_floor02_extra",
        "55,58": "tile_bg_extra_floor02_extra",
        "54,58": "tile_bg_extra_floor02_extra",
        "53,58": "tile_bg_extra_floor02_extra",
        "52,58": "tile_bg_extra_floor02_extra",
        "52,57": "tile_bg_extra_floor02_extra",
        "52,56": "tile_bg_extra_floor02_extra",
        "52,55": "tile_bg_extra_floor02_extra",
        "52,54": "tile_bg_extra_floor02_extra",
        "52,53": "tile_bg_extra_floor02_extra",
        "52,52": "tile_bg_extra_floor02_extra",
        "52,51": "tile_bg_extra_floor02_extra",
        "52,50": "tile_bg_extra_floor02_extra",
        "52,49": "tile_bg_extra_floor02_extra",
        "52,48": "tile_bg_extra_floor02_extra",
        "52,47": "tile_bg_extra_floor02_extra",
        "52,46": "tile_bg_extra_floor02_extra",
        "52,45": "tile_bg_extra_floor02_extra",
        "52,44": "tile_bg_extra_floor02_extra",
        "52,43": "tile_bg_extra_floor02_extra",
        "52,42": "tile_bg_extra_floor02_extra",
        "52,41": "tile_bg_extra_floor02_extra",
        "52,40": "tile_bg_extra_floor02_extra",
        "52,39": "tile_bg_extra_floor02_extra",
        "52,38": "tile_bg_extra_floor02_extra",
        "52,37": "tile_bg_extra_floor02_extra",
        "52,36": "tile_bg_extra_floor02_extra",
        "53,36": "tile_bg_extra_floor02_extra",
        "54,36": "tile_bg_extra_floor02_extra",
        "55,36": "tile_bg_extra_floor02_extra",
        "56,36": "tile_bg_extra_floor02_extra",
        "56,37": "tile_bg_extra_floor02_extra",
        "56,38": "tile_bg_extra_floor02_extra",
        "56,39": "tile_bg_extra_floor02_extra",
        "56,40": "tile_bg_extra_floor02_extra",
        "56,41": "tile_bg_extra_floor02_extra",
        "56,42": "tile_bg_extra_floor02_extra",
        "56,43": "tile_bg_extra_floor02_extra",
        "56,44": "tile_bg_extra_floor02_extra",
        "56,45": "tile_bg_extra_floor02_extra",
        "56,46": "tile_bg_extra_floor02_extra",
        "56,47": "tile_bg_extra_floor02_extra",
        "56,48": "tile_bg_extra_floor02_extra",
        "56,49": "tile_bg_extra_floor02_extra",
        "56,50": "tile_bg_extra_floor02_extra",
        "56,51": "tile_bg_extra_floor02_extra",
        "56,52": "tile_bg_extra_floor02_extra",
        "56,53": "tile_bg_extra_floor02_extra",
        "56,54": "tile_bg_extra_floor02_extra",
        "56,55": "tile_bg_extra_floor02_extra",
        "56,56": "tile_bg_extra_floor02_extra",
        "56,57": "tile_bg_extra_floor02_extra",
        "55,57": "tile_bg_extra_floor02_extra",
        "54,57": "tile_bg_extra_floor02_extra",
        "53,57": "tile_bg_extra_floor02_extra",
        "53,56": "tile_bg_extra_floor02_extra",
        "53,55": "tile_bg_extra_floor02_extra",
        "53,54": "tile_bg_extra_floor02_extra",
        "53,53": "tile_bg_extra_floor02_extra",
        "53,52": "tile_bg_extra_floor02_extra",
        "53,51": "tile_bg_extra_floor02_extra",
        "53,50": "tile_bg_extra_floor02_extra",
        "53,49": "tile_bg_extra_floor02_extra",
        "53,48": "tile_bg_extra_floor02_extra",
        "53,47": "tile_bg_extra_floor02_extra",
        "53,46": "tile_bg_extra_floor02_extra",
        "53,45": "tile_bg_extra_floor02_extra",
        "54,44": "tile_bg_extra_floor02_extra",
        "54,43": "tile_bg_extra_floor02_extra",
        "54,42": "tile_bg_extra_floor02_extra",
        "54,41": "tile_bg_extra_floor02_extra",
        "54,40": "tile_bg_extra_floor02_extra",
        "54,39": "tile_bg_extra_floor02_extra",
        "54,38": "tile_bg_extra_floor02_extra",
        "54,37": "tile_bg_extra_floor02_extra",
        "53,37": "tile_bg_extra_floor02_extra",
        "53,38": "tile_bg_extra_floor02_extra",
        "53,39": "tile_bg_extra_floor02_extra",
        "53,40": "tile_bg_extra_floor02_extra",
        "53,41": "tile_bg_extra_floor02_extra",
        "53,42": "tile_bg_extra_floor02_extra",
        "53,43": "tile_bg_extra_floor02_extra",
        "53,44": "tile_bg_extra_floor02_extra",
        "55,37": "tile_bg_extra_floor02_extra",
        "55,38": "tile_bg_extra_floor02_extra",
        "55,39": "tile_bg_extra_floor02_extra",
        "55,40": "tile_bg_extra_floor02_extra",
        "55,41": "tile_bg_extra_floor02_extra",
        "55,42": "tile_bg_extra_floor02_extra",
        "55,43": "tile_bg_extra_floor02_extra",
        "55,44": "tile_bg_extra_floor02_extra",
        "55,45": "tile_bg_extra_floor02_extra",
        "55,46": "tile_bg_extra_floor02_extra",
        "55,47": "tile_bg_extra_floor02_extra",
        "55,48": "tile_bg_extra_floor02_extra",
        "55,49": "tile_bg_extra_floor02_extra",
        "55,50": "tile_bg_extra_floor02_extra",
        "54,50": "tile_bg_extra_floor02_extra",
        "54,51": "tile_bg_extra_floor02_extra",
        "54,52": "tile_bg_extra_floor02_extra",
        "54,53": "tile_bg_extra_floor02_extra",
        "54,54": "tile_bg_extra_floor02_extra",
        "54,55": "tile_bg_extra_floor02_extra",
        "54,46": "tile_bg_extra_floor02_extra",
        "54,47": "tile_bg_extra_floor02_extra",
        "54,48": "tile_bg_extra_floor02_extra",
        "54,49": "tile_bg_extra_floor02_extra",
        "54,45": "tile_bg_extra_floor02_extra",
        "54,56": "tile_bg_extra_floor02_extra",
        "55,56": "tile_bg_extra_floor02_extra",
        "55,55": "tile_bg_extra_floor02_extra",
        "55,54": "tile_bg_extra_floor02_extra",
        "55,53": "tile_bg_extra_floor02_extra",
        "55,52": "tile_bg_extra_floor02_extra",
        "55,51": "tile_bg_extra_floor02_extra",
        "48,53": "tile_bg_extra_floor02_extra",
        "49,53": "tile_bg_extra_floor02_extra",
        "50,53": "tile_bg_extra_floor02_extra",
        "48,54": "tile_bg_extra_floor02_extra",
        "49,54": "tile_bg_extra_floor02_extra",
        "50,54": "tile_bg_extra_floor02_extra",
        "59,46": "tile_bg_extra_floor02_extra",
        "58,46": "tile_bg_extra_floor02_extra",
        "57,46": "tile_bg_extra_floor02_extra",
        "49,39": "tile_bg_extra_floor02_extra",
        "50,39": "tile_bg_extra_floor02_extra",
        "50,38": "tile_bg_extra_floor02_extra",
        "48,39": "tile_bg_extra_floor02_extra",
        "57,36": "tile_bg_extra_floor02_extra",
        "58,36": "tile_bg_extra_floor02_extra",
        "59,36": "tile_bg_extra_floor02_extra",
        "59,35": "tile_bg_extra_floor02_extra",
        "57,35": "tile_bg_extra_floor02_extra",
        "58,35": "tile_bg_extra_floor02_extra",
        "87,26": "tile_bg_extra_floor02_extra",
        "87,27": "tile_bg_extra_floor02_extra",
        "87,28": "tile_bg_extra_floor02_extra",
        "87,29": "tile_bg_extra_floor02_extra",
        "87,30": "tile_bg_extra_floor02_extra",
        "88,30": "tile_bg_extra_floor02_extra",
        "89,30": "tile_bg_extra_floor02_extra",
        "89,29": "tile_bg_extra_floor02_extra",
        "89,28": "tile_bg_extra_floor02_extra",
        "89,27": "tile_bg_extra_floor02_extra",
        "89,26": "tile_bg_extra_floor02_extra",
        "88,26": "tile_bg_extra_floor02_extra",
        "88,27": "tile_bg_extra_floor02_extra",
        "88,28": "tile_bg_extra_floor02_extra",
        "88,29": "tile_bg_extra_floor02_extra",
        "79,31": "tile_bg_extra_floor02_extra",
        "80,31": "tile_bg_extra_floor02_extra",
        "81,31": "tile_bg_extra_floor02_extra",
        "82,31": "tile_bg_extra_floor02_extra",
        "83,31": "tile_bg_extra_floor02_extra",
        "84,31": "tile_bg_extra_floor02_extra",
        "85,31": "tile_bg_extra_floor02_extra",
        "86,31": "tile_bg_extra_floor02_extra",
        "87,31": "tile_bg_extra_floor02_extra",
        "88,31": "tile_bg_extra_floor02_extra",
        "89,31": "tile_bg_extra_floor02_extra",
        "90,31": "tile_bg_extra_floor02_extra",
        "90,26": "tile_bg_extra_floor02_extra",
        "90,27": "tile_bg_extra_floor02_extra",
        "90,28": "tile_bg_extra_floor02_extra",
        "90,29": "tile_bg_extra_floor02_extra",
        "90,30": "tile_bg_extra_floor02_extra",
        "91,27": "tile_bg_extra_floor02_extra",
        "91,29": "tile_bg_extra_floor02_extra",
        "91,26": "tile_bg_extra_floor02_extra",
        "91,28": "tile_bg_extra_floor02_extra",
        "92,28": "tile_bg_extra_floor02_extra",
        "93,28": "tile_bg_extra_floor02_extra",
        "94,28": "tile_bg_extra_floor02_extra",
        "95,28": "tile_bg_extra_floor02_extra",
        "95,27": "tile_bg_extra_floor02_extra",
        "95,26": "tile_bg_extra_floor02_extra",
        "94,26": "tile_bg_extra_floor02_extra",
        "93,26": "tile_bg_extra_floor02_extra",
        "92,26": "tile_bg_extra_floor02_extra",
        "92,27": "tile_bg_extra_floor02_extra",
        "93,27": "tile_bg_extra_floor02_extra",
        "94,27": "tile_bg_extra_floor02_extra",
        "95,29": "tile_bg_extra_floor02_extra",
        "95,30": "tile_bg_extra_floor02_extra",
        "95,31": "tile_bg_extra_floor02_extra",
        "94,31": "tile_bg_extra_floor02_extra",
        "93,31": "tile_bg_extra_floor02_extra",
        "92,31": "tile_bg_extra_floor02_extra",
        "91,31": "tile_bg_extra_floor02_extra",
        "91,30": "tile_bg_extra_floor02_extra",
        "92,30": "tile_bg_extra_floor02_extra",
        "93,30": "tile_bg_extra_floor02_extra",
        "94,30": "tile_bg_extra_floor02_extra",
        "94,29": "tile_bg_extra_floor02_extra",
        "93,29": "tile_bg_extra_floor02_extra",
        "92,29": "tile_bg_extra_floor02_extra"
      },
      "ground2": {
        "90,45": "tile_obstacle_ore_small"
      },
      "ground3": {
        "57,40": "tile_mr4czvpx",
        "57,41": "tile_mr4czvpx",
        "60,35": "tile_mr4czvpx",
        "60,34": "tile_mr4czvpx",
        "60,33": "tile_mr4czvpx",
        "60,32": "tile_mr4czvpx"
      },
      "object": {
        "47,72": "tile_mr4czvpx",
        "47,73": "tile_mr4czvpx",
        "36,19": "tile_mr4czvpx",
        "36,20": "tile_mr4czvpx",
        "36,21": "tile_mr4czvpx",
        "36,22": "tile_mr4czvpx",
        "36,23": "tile_mr4czvpx",
        "36,24": "tile_mr4czvpx",
        "36,25": "tile_mr4czvpx",
        "36,26": "tile_mr4czvpx",
        "36,27": "tile_mr4czvpx",
        "36,28": "tile_mr4czvpx",
        "36,29": "tile_mr4czvpx",
        "36,30": "tile_mr4czvpx",
        "36,31": "tile_mr4czvpx",
        "36,32": "tile_mr4czvpx",
        "36,33": "tile_mr4czvpx",
        "36,34": "tile_mr4czvpx",
        "74,62": "tile_mr4czvpx",
        "74,63": "tile_mr4czvpx",
        "69,63": "tile_mr4czvpx",
        "69,62": "tile_mr4czvpx",
        "69,61": "tile_mr4czvpx",
        "72,50": "tile_mr4czvpx",
        "72,41": "tile_mr4czvpx",
        "72,40": "tile_mr4czvpx",
        "65,46": "tile_mr4czvpx",
        "65,47": "tile_mr4czvpx",
        "65,45": "tile_mr4czvpx",
        "65,35": "tile_mr4czvpx",
        "65,34": "tile_mr4czvpx",
        "65,36": "tile_mr4czvpx",
        "62,29": "tile_mr4czvpx",
        "62,28": "tile_mr4czvpx",
        "57,50": "tile_mr4czvpx",
        "57,51": "tile_mr4czvpx",
        "57,52": "tile_mr4czvpx",
        "57,53": "tile_mr4czvpx",
        "57,54": "tile_mr4czvpx",
        "57,55": "tile_mr4czvpx",
        "50,57": "tile_mr4czvpx",
        "50,58": "tile_mr4czvpx",
        "50,59": "tile_mr4czvpx",
        "50,60": "tile_mr4czvpx",
        "50,61": "tile_mr4czvpx",
        "50,62": "tile_mr4czvpx",
        "50,63": "tile_mr4czvpx",
        "44,40": "tile_mr4czvpx",
        "44,39": "tile_mr4czvpx",
        "44,38": "tile_mr4czvpx",
        "44,37": "tile_mr4czvpx",
        "44,36": "tile_mr4czvpx",
        "44,35": "tile_mr4czvpx",
        "44,34": "tile_mr4czvpx",
        "41,30": "tile_mr4czvpx",
        "41,29": "tile_mr4czvpx",
        "41,28": "tile_mr4czvpx",
        "41,27": "tile_mr4czvpx",
        "41,26": "tile_mr4czvpx",
        "41,25": "tile_mr4czvpx",
        "41,24": "tile_mr4czvpx",
        "41,23": "tile_mr4czvpx",
        "41,22": "tile_mr4czvpx",
        "41,21": "tile_mr4czvpx",
        "41,20": "tile_mr4czvpx",
        "41,19": "tile_mr4czvpx",
        "48,19": "tile_mr4czvpx",
        "48,20": "tile_mr4czvpx",
        "48,21": "tile_mr4czvpx",
        "48,22": "tile_mr4czvpx",
        "25,43": "tile_mr4czvpx",
        "25,44": "tile_mr4czvpx",
        "25,45": "tile_mr4czvpx",
        "25,46": "tile_mr4czvpx",
        "25,47": "tile_mr4czvpx",
        "25,48": "tile_mr4czvpx",
        "57,82": "tile_mr4czvpx",
        "65,81": "tile_mr4czvpx",
        "65,82": "tile_mr4czvpx",
        "51,77": "tile_mr4czvpx",
        "51,78": "tile_mr4czvpx",
        "51,79": "tile_mr4czvpx",
        "51,80": "tile_mr4czvpx",
        "84,65": "tile_mr4czvpx",
        "84,64": "tile_mr4czvpx",
        "84,63": "tile_mr4czvpx",
        "28,82": "tile_mr4czvpx",
        "28,81": "tile_mr4czvpx",
        "28,80": "tile_mr4czvpx",
        "28,79": "tile_mr4czvpx",
        "28,78": "tile_mr4czvpx",
        "28,77": "tile_mr4czvpx",
        "28,76": "tile_mr4czvpx",
        "5,79": "tile_mr4czvpx",
        "5,80": "tile_mr4czvpx",
        "5,81": "tile_mr4czvpx",
        "5,82": "tile_mr4czvpx",
        "24,74": "tile_mr4czvpx",
        "24,73": "tile_mr4czvpx",
        "24,72": "tile_mr4czvpx",
        "62,7": "tile_mr4czvpx",
        "62,8": "tile_mr4czvpx",
        "62,9": "tile_mr4czvpx",
        "62,10": "tile_mr4czvpx",
        "62,11": "tile_mr4czvpx",
        "62,12": "tile_mr4czvpx",
        "62,13": "tile_mr4czvpx",
        "62,14": "tile_mr4czvpx",
        "62,15": "tile_mr4czvpx",
        "62,16": "tile_mr4czvpx",
        "62,17": "tile_mr4czvpx",
        "62,18": "tile_mr4czvpx",
        "62,19": "tile_mr4czvpx",
        "75,19": "tile_mr4czvpx",
        "75,18": "tile_mr4czvpx",
        "75,17": "tile_mr4czvpx",
        "75,16": "tile_mr4czvpx",
        "75,15": "tile_mr4czvpx",
        "75,14": "tile_mr4czvpx",
        "75,13": "tile_mr4czvpx",
        "75,12": "tile_mr4czvpx",
        "75,11": "tile_mr4czvpx",
        "75,10": "tile_mr4czvpx",
        "75,9": "tile_mr4czvpx",
        "75,8": "tile_mr4czvpx",
        "75,7": "tile_mr4czvpx",
        "79,81": "tile_mr4czvpx",
        "79,80": "tile_mr4czvpx",
        "79,79": "tile_mr4czvpx",
        "79,78": "tile_mr4czvpx",
        "79,77": "tile_mr4czvpx",
        "88,77": "tile_mr4czvpx",
        "94,69": "tile_mr4czvpx",
        "94,70": "tile_mr4czvpx",
        "94,71": "tile_mr4czvpx",
        "94,72": "tile_mr4czvpx",
        "94,73": "tile_mr4czvpx",
        "94,74": "tile_mr4czvpx",
        "94,75": "tile_mr4czvpx",
        "94,76": "tile_mr4czvpx",
        "94,77": "tile_mr4czvpx",
        "94,78": "tile_mr4czvpx",
        "94,79": "tile_mr4czvpx",
        "94,80": "tile_mr4czvpx",
        "94,81": "tile_mr4czvpx",
        "91,77": "tile_mr4czvpx",
        "91,76": "tile_mr4czvpx",
        "91,75": "tile_mr4czvpx",
        "91,74": "tile_mr4czvpx",
        "6,11": "tile_mr4czvpx",
        "6,12": "tile_mr4czvpx",
        "6,13": "tile_mr4czvpx",
        "6,14": "tile_mr4czvpx",
        "6,15": "tile_mr4czvpx",
        "6,16": "tile_mr4czvpx",
        "6,17": "tile_mr4czvpx",
        "6,18": "tile_mr4czvpx",
        "6,19": "tile_mr4czvpx",
        "6,20": "tile_mr4czvpx",
        "6,21": "tile_mr4czvpx",
        "6,22": "tile_mr4czvpx",
        "6,23": "tile_mr4czvpx",
        "6,24": "tile_mr4czvpx",
        "6,29": "tile_mr4czvpx",
        "6,30": "tile_mr4czvpx",
        "6,31": "tile_mr4czvpx",
        "6,32": "tile_mr4czvpx",
        "6,28": "tile_mr4czvpx",
        "6,27": "tile_mr4czvpx",
        "6,26": "tile_mr4czvpx",
        "6,25": "tile_mr4czvpx",
        "13,48": "tile_mr4czvpx",
        "13,47": "tile_mr4czvpx",
        "13,46": "tile_mr4czvpx",
        "13,45": "tile_mr4czvpx",
        "13,44": "tile_mr4czvpx",
        "13,43": "tile_mr4czvpx",
        "81,22": "tile_mr4czvpx",
        "81,23": "tile_mr4czvpx",
        "81,21": "tile_mr4czvpx",
        "81,20": "tile_mr4czvpx"
      },
      "object2": {},
      "object3": {
        "61,61": "tile_street_plastic_stool",
        "45,21": "tile_street_plastic_stool",
        "42,21": "tile_street_plastic_stool"
      },
      "object4": {},
      "overlay": {},
      "top": {},
      "ground4": {},
      "object5": {
        "49,23": "tile_mr4czvpx",
        "49,22": "tile_mr4czvpx",
        "49,21": "tile_mr4czvpx",
        "49,20": "tile_mr4czvpx",
        "49,19": "tile_mr4czvpx",
        "49,18": "tile_mr4czvpx",
        "49,17": "tile_mr4czvpx",
        "49,16": "tile_mr4czvpx",
        "49,15": "tile_mr4czvpx",
        "49,14": "tile_mr4czvpx",
        "49,13": "tile_mr4czvpx",
        "49,12": "tile_mr4czvpx",
        "49,11": "tile_mr4czvpx",
        "49,10": "tile_mr4czvpx",
        "53,23": "tile_mr4czvpx",
        "53,22": "tile_mr4czvpx",
        "53,21": "tile_mr4czvpx",
        "53,20": "tile_mr4czvpx",
        "53,19": "tile_mr4czvpx",
        "53,18": "tile_mr4czvpx",
        "53,17": "tile_mr4czvpx",
        "53,16": "tile_mr4czvpx",
        "53,15": "tile_mr4czvpx",
        "53,14": "tile_mr4czvpx",
        "53,13": "tile_mr4czvpx",
        "53,12": "tile_mr4czvpx",
        "53,11": "tile_mr4czvpx",
        "53,10": "tile_mr4czvpx"
      },
      "object6": {},
      "ground5": {}
    },
    "stamps": [
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 57,
        "r": 69,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 60,
        "r": 69,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 57,
        "r": 66,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 60,
        "r": 66,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 63,
        "r": 69,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 63,
        "r": 66,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 60,
        "r": 63,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 60,
        "r": 60,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 57,
        "r": 60,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 54,
        "r": 60,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 54,
        "r": 57,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 51,
        "r": 57,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 54,
        "r": 54,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 63,
        "r": 57,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 66,
        "r": 57,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 66,
        "r": 54,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 66,
        "r": 51,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 66,
        "r": 48,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 66,
        "r": 45,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 69,
        "r": 45,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 69,
        "r": 48,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 69,
        "r": 51,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 69,
        "r": 54,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 69,
        "r": 57,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 66,
        "r": 42,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 69,
        "r": 42,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 66,
        "r": 39,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 69,
        "r": 39,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 54,
        "r": 45,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 54,
        "r": 42,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 51,
        "r": 42,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 57,
        "r": 46,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 48,
        "r": 39,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 60,
        "r": 72,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 60,
        "r": 75,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 60,
        "r": 78,
        "layer": "floor",
        "fx": false
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 45,
        "r": 68,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 45,
        "r": 71,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 45,
        "r": 74,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 42,
        "r": 74,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 42,
        "r": 71,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 63,
        "r": 60,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 63,
        "r": 52,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 72,
        "r": 46,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 63,
        "r": 41,
        "layer": "floor"
      },
      {
        "id": "tile_muftd54p",
        "c": 56,
        "r": 65,
        "layer": "ground"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 57,
        "r": 72,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 63,
        "r": 72,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 54,
        "r": 66,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 54,
        "r": 69,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 54,
        "r": 72,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 66,
        "r": 72,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 66,
        "r": 69,
        "layer": "floor",
        "fx": false
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 66,
        "r": 66,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 57,
        "r": 63,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 63,
        "r": 63,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 54,
        "r": 63,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 66,
        "r": 63,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 66,
        "r": 60,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 51,
        "r": 68,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 48,
        "r": 68,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 69,
        "r": 68,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 72,
        "r": 68,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 75,
        "r": 68,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 78,
        "r": 68,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 78,
        "r": 65,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 75,
        "r": 65,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 81,
        "r": 65,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 81,
        "r": 68,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 39,
        "r": 71,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 39,
        "r": 74,
        "layer": "floor"
      },
      {
        "id": "tile_field_base",
        "c": 56,
        "r": 65,
        "layer": "object",
        "baseHp": 2000,
        "baseDepth": 4,
        "baseSolid": [
          [
            1,
            6
          ],
          [
            1,
            5
          ],
          [
            1,
            4
          ],
          [
            1,
            3
          ],
          [
            1,
            2
          ],
          [
            1,
            1
          ],
          [
            2,
            1
          ],
          [
            3,
            1
          ],
          [
            4,
            1
          ],
          [
            6,
            1
          ],
          [
            8,
            1
          ],
          [
            7,
            1
          ],
          [
            5,
            1
          ],
          [
            9,
            1
          ],
          [
            9,
            2
          ],
          [
            9,
            3
          ],
          [
            9,
            4
          ],
          [
            9,
            5
          ],
          [
            9,
            6
          ],
          [
            2,
            2
          ],
          [
            3,
            3
          ],
          [
            3,
            2
          ],
          [
            2,
            3
          ],
          [
            8,
            2
          ],
          [
            7,
            2
          ],
          [
            6,
            2
          ],
          [
            5,
            2
          ],
          [
            4,
            2
          ]
        ],
        "ox": 0,
        "oy": -8
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 81,
        "r": 34,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 81,
        "r": 37,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 81,
        "r": 40,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 66,
        "r": 36,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 69,
        "r": 36,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 42,
        "r": 46,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 42,
        "r": 43,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 42,
        "r": 40,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 42,
        "r": 37,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 42,
        "r": 34,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 42,
        "r": 31,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 45,
        "r": 31,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 48,
        "r": 31,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 48,
        "r": 28,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 51,
        "r": 28,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 48,
        "r": 25,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 45,
        "r": 25,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 42,
        "r": 25,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 42,
        "r": 22,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 45,
        "r": 22,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 42,
        "r": 19,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 45,
        "r": 19,
        "layer": "floor"
      },
      {
        "id": "tile_mrt_exit_2_sealed",
        "c": 67,
        "r": 1,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 72,
        "r": 36,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 81,
        "r": 31,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 81,
        "r": 28,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 81,
        "r": 25,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 57,
        "r": 36,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 39,
        "r": 39,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 36,
        "r": 39,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 33,
        "r": 39,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 33,
        "r": 36,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 33,
        "r": 33,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 33,
        "r": 30,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 33,
        "r": 27,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 30,
        "r": 27,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 30,
        "r": 30,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 27,
        "r": 27,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 27,
        "r": 30,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 24,
        "r": 27,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 24,
        "r": 30,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 24,
        "r": 33,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 27,
        "r": 33,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 30,
        "r": 33,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 33,
        "r": 42,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 33,
        "r": 45,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 33,
        "r": 48,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 33,
        "r": 51,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 33,
        "r": 54,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 36,
        "r": 54,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 36,
        "r": 51,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 39,
        "r": 51,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 39,
        "r": 54,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 39,
        "r": 57,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 36,
        "r": 57,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 33,
        "r": 57,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 30,
        "r": 51,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 30,
        "r": 54,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 33,
        "r": 60,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 33,
        "r": 63,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 33,
        "r": 66,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 33,
        "r": 69,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 33,
        "r": 72,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 75,
        "r": 62,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 78,
        "r": 62,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 81,
        "r": 62,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 78,
        "r": 59,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 78,
        "r": 56,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 78,
        "r": 53,
        "layer": "floor"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 47,
        "r": 65,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 46,
        "r": 65,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 45,
        "r": 65,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 48,
        "r": 65,
        "layer": "object"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 51,
        "r": 81,
        "layer": "object",
        "fx": false
      },
      {
        "id": "tile_mvpa16jw",
        "c": 46,
        "r": 74,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa16jw",
        "c": 39,
        "r": 74,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 41,
        "r": 75,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 42,
        "r": 75,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 43,
        "r": 75,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 44,
        "r": 75,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 45,
        "r": 75,
        "layer": "object"
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 43,
        "r": 65,
        "layer": "object"
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 36,
        "r": 58,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 39,
        "r": 68,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 41,
        "r": 68,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 40,
        "r": 68,
        "layer": "object"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 42,
        "r": 67,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 34,
        "r": 72,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 36,
        "r": 72,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 35,
        "r": 72,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 37,
        "r": 72,
        "layer": "object",
        "fx": false
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 38,
        "r": 72,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 36,
        "r": 71,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 36,
        "r": 61,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 36,
        "r": 62,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 36,
        "r": 63,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 36,
        "r": 64,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 36,
        "r": 65,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 36,
        "r": 66,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa16jw",
        "c": 36,
        "r": 67,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 38,
        "r": 68,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 49,
        "r": 69,
        "layer": "object"
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 50,
        "r": 69,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 47,
        "r": 69,
        "layer": "object"
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 29,
        "r": 48,
        "layer": "object"
      },
      {
        "id": "tile_mr4czvpx",
        "c": 29,
        "r": 51,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 29,
        "r": 52,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 29,
        "r": 53,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 29,
        "r": 54,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 29,
        "r": 55,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa16jw",
        "c": 29,
        "r": 56,
        "layer": "object"
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 31,
        "r": 57,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 32,
        "r": 60,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 39,
        "r": 48,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 38,
        "r": 48,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa16jw",
        "c": 31,
        "r": 47,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 32,
        "r": 46,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 32,
        "r": 45,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 32,
        "r": 44,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 32,
        "r": 43,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 32,
        "r": 42,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 32,
        "r": 41,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 32,
        "r": 40,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 32,
        "r": 39,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 32,
        "r": 38,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 32,
        "r": 37,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa16jw",
        "c": 36,
        "r": 47,
        "layer": "object"
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 31,
        "r": 34,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 25,
        "r": 34,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 26,
        "r": 34,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 27,
        "r": 34,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 28,
        "r": 34,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 29,
        "r": 34,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 30,
        "r": 34,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa16jw",
        "c": 6,
        "r": 33,
        "layer": "object"
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 36,
        "r": 40,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 38,
        "r": 40,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 39,
        "r": 40,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 38,
        "r": 36,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 39,
        "r": 36,
        "layer": "object"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 36,
        "r": 35,
        "layer": "object"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 40,
        "r": 35,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 41,
        "r": 34,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 41,
        "r": 33,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 41,
        "r": 32,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 41,
        "r": 31,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 50,
        "r": 28,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 52,
        "r": 28,
        "layer": "object"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 53,
        "r": 27,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 40,
        "r": 40,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 41,
        "r": 43,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 41,
        "r": 44,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyq54",
        "c": 41,
        "r": 45,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 42,
        "r": 46,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 43,
        "r": 46,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 44,
        "r": 46,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 45,
        "r": 46,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 47,
        "r": 46,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 46,
        "r": 46,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 48,
        "r": 46,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyq54",
        "c": 42,
        "r": 47,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 40,
        "r": 48,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 41,
        "r": 48,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_mvpa16jw",
        "c": 41,
        "r": 57,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 38,
        "r": 58,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 39,
        "r": 58,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 40,
        "r": 58,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 42,
        "r": 51,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 42,
        "r": 52,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 42,
        "r": 53,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 42,
        "r": 54,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 42,
        "r": 55,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 42,
        "r": 56,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 42,
        "r": 49,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 42,
        "r": 50,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 72,
        "r": 70,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 74,
        "r": 70,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 75,
        "r": 70,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 76,
        "r": 70,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 77,
        "r": 70,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 78,
        "r": 70,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 79,
        "r": 70,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 80,
        "r": 70,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 81,
        "r": 70,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 82,
        "r": 70,
        "layer": "object"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 90,
        "r": 78,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 83,
        "r": 60,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 74,
        "r": 60,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 71,
        "r": 65,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 72,
        "r": 65,
        "layer": "object"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 73,
        "r": 64,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa16jw",
        "c": 69,
        "r": 64,
        "layer": "object"
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 69,
        "r": 58,
        "layer": "object"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 71,
        "r": 57,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 72,
        "r": 56,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 72,
        "r": 55,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 72,
        "r": 54,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 72,
        "r": 53,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 72,
        "r": 52,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 72,
        "r": 51,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 72,
        "r": 47,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 79,
        "r": 53,
        "layer": "object"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 72,
        "r": 42,
        "layer": "object"
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 72,
        "r": 37,
        "layer": "object"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 74,
        "r": 36,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 74,
        "r": 33,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa16jw",
        "c": 72,
        "r": 32,
        "layer": "object",
        "rot": 0
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 72,
        "r": 29,
        "layer": "object"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 72,
        "r": 24,
        "layer": "object"
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 72,
        "r": 21,
        "layer": "object"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 74,
        "r": 20,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 74,
        "r": 4,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 62,
        "r": 49,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 63,
        "r": 54,
        "layer": "floor"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 60,
        "r": 57,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 59,
        "r": 57,
        "layer": "object"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 61,
        "r": 56,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 62,
        "r": 52,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 62,
        "r": 53,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 62,
        "r": 54,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 62,
        "r": 55,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa16jw",
        "c": 64,
        "r": 48,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa16jw",
        "c": 62,
        "r": 41,
        "layer": "object"
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 62,
        "r": 38,
        "layer": "object"
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 64,
        "r": 42,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 64,
        "r": 31,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa16jw",
        "c": 62,
        "r": 30,
        "layer": "object"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 64,
        "r": 37,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa16jw",
        "c": 59,
        "r": 24,
        "layer": "object"
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 61,
        "r": 25,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 59,
        "r": 21,
        "layer": "object"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 61,
        "r": 20,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 62,
        "r": 4,
        "layer": "object"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 81,
        "r": 59,
        "layer": "object"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 76,
        "r": 59,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 77,
        "r": 58,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 77,
        "r": 57,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 77,
        "r": 56,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 77,
        "r": 54,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 77,
        "r": 53,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 81,
        "r": 53,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 81,
        "r": 54,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 81,
        "r": 56,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 81,
        "r": 57,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 81,
        "r": 58,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_street_drink_shop_wide",
        "c": 78,
        "r": 54,
        "layer": "object2"
      },
      {
        "id": "tile_street_stall_steak",
        "c": 63,
        "r": 50,
        "layer": "object2",
        "ox": 0,
        "oy": -12
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 57,
        "r": 75,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 54,
        "r": 75,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 54,
        "r": 78,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 57,
        "r": 78,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 63,
        "r": 75,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 66,
        "r": 75,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 63,
        "r": 78,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 66,
        "r": 78,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 51,
        "r": 65,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 51,
        "r": 62,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 51,
        "r": 60,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 69,
        "r": 71,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 69,
        "r": 74,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 69,
        "r": 77,
        "layer": "floor"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 53,
        "r": 82,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 54,
        "r": 82,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 55,
        "r": 82,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 67,
        "r": 78,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 69,
        "r": 78,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 68,
        "r": 78,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 70,
        "r": 78,
        "layer": "object"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 71,
        "r": 77,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 72,
        "r": 76,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 72,
        "r": 75,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 72,
        "r": 74,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 72,
        "r": 73,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 72,
        "r": 72,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 51,
        "r": 72,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 51,
        "r": 73,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 51,
        "r": 74,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 51,
        "r": 75,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 51,
        "r": 76,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 51,
        "r": 71,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 51,
        "r": 74,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 51,
        "r": 77,
        "layer": "floor"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 49,
        "r": 64,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa16jw",
        "c": 47,
        "r": 53,
        "layer": "object"
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 49,
        "r": 54,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 47,
        "r": 50,
        "layer": "object"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 49,
        "r": 49,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 49,
        "r": 46,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 59,
        "r": 43,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa16jw",
        "c": 59,
        "r": 46,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 57,
        "r": 47,
        "layer": "object"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 57,
        "r": 56,
        "layer": "object"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 57,
        "r": 42,
        "layer": "object"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 47,
        "r": 39,
        "layer": "object"
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 49,
        "r": 40,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 47,
        "r": 36,
        "layer": "object"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 49,
        "r": 35,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyq54",
        "c": 50,
        "r": 32,
        "layer": "ground3",
        "fx": true
      },
      {
        "id": "tile_mvpa16jw",
        "c": 59,
        "r": 36,
        "layer": "ground3",
        "fx": true
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 57,
        "r": 37,
        "layer": "ground3"
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 59,
        "r": 29,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 56,
        "r": 29,
        "layer": "object"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 55,
        "r": 32,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 51,
        "r": 33,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 52,
        "r": 33,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 53,
        "r": 33,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 54,
        "r": 33,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 58,
        "r": 29,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 50,
        "r": 31,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 45,
        "r": 28,
        "layer": "floor",
        "fx": false
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 42,
        "r": 28,
        "layer": "floor",
        "fx": false
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 45,
        "r": 45,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 48,
        "r": 45,
        "layer": "floor"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 44,
        "r": 41,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 46,
        "r": 42,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 47,
        "r": 42,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 49,
        "r": 42,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 48,
        "r": 42,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 50,
        "r": 41,
        "layer": "object"
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 44,
        "r": 32,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 46,
        "r": 32,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 47,
        "r": 32,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 48,
        "r": 32,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 49,
        "r": 32,
        "layer": "object"
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 53,
        "r": 24,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 47,
        "r": 16,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa16jw",
        "c": 48,
        "r": 23,
        "layer": "object"
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 41,
        "r": 16,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 43,
        "r": 16,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 44,
        "r": 16,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 45,
        "r": 16,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 46,
        "r": 16,
        "layer": "object"
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 6,
        "r": 8,
        "layer": "object"
      },
      {
        "id": "tile_street_capsule_toy_machines",
        "c": 39,
        "r": 49,
        "layer": "object3",
        "fx": true,
        "ox": 18,
        "oy": -4
      },
      {
        "id": "tile_street_folding_table",
        "c": 63,
        "r": 54,
        "layer": "object3",
        "fx": true,
        "ox": 0,
        "oy": -24
      },
      {
        "id": "tile_street_plastic_stool",
        "c": 65,
        "r": 54,
        "layer": "object3",
        "fx": true
      },
      {
        "id": "tile_street_sign_speed_limit_50",
        "c": 66,
        "r": 42,
        "layer": "object3"
      },
      {
        "id": "tile_street_crosswalk",
        "c": 68,
        "r": 51,
        "layer": "ground2"
      },
      {
        "id": "tile_street_crosswalk",
        "c": 68,
        "r": 47,
        "layer": "ground2"
      },
      {
        "id": "tile_street_crosswalk",
        "c": 68,
        "r": 43,
        "layer": "ground2"
      },
      {
        "id": "tile_street_crosswalk",
        "c": 68,
        "r": 39,
        "layer": "ground2"
      },
      {
        "id": "tile_street_crosswalk",
        "c": 68,
        "r": 35,
        "layer": "ground2"
      },
      {
        "id": "tile_street_crosswalk",
        "c": 68,
        "r": 31,
        "layer": "ground2"
      },
      {
        "id": "tile_street_crosswalk",
        "c": 68,
        "r": 27,
        "layer": "ground2"
      },
      {
        "id": "tile_street_crosswalk",
        "c": 68,
        "r": 23,
        "layer": "ground2"
      },
      {
        "id": "tile_street_scooter_delivery_pink",
        "c": 63,
        "r": 40,
        "layer": "object4"
      },
      {
        "id": "tile_street_scooter_delivery_green",
        "c": 73,
        "r": 35,
        "layer": "object4",
        "fx": true
      },
      {
        "id": "tile_street_scooter_delivery_green",
        "c": 63,
        "r": 29,
        "layer": "object4",
        "fx": true
      },
      {
        "id": "tile_street_scooter_delivery_pink",
        "c": 73,
        "r": 27,
        "layer": "object4",
        "fx": true
      },
      {
        "id": "tile_street_ubike",
        "c": 60,
        "r": 23,
        "layer": "object4"
      },
      {
        "id": "tile_street_ubike",
        "c": 73,
        "r": 17,
        "layer": "object4",
        "fx": true
      },
      {
        "id": "tile_street_ubike",
        "c": 63,
        "r": 20,
        "layer": "object4",
        "fx": true
      },
      {
        "id": "tile_street_ubike",
        "c": 70,
        "r": 25,
        "layer": "object4",
        "fx": true
      },
      {
        "id": "tile_street_bollard_yellow",
        "c": 70,
        "r": 53,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_street_bollard_yellow",
        "c": 71,
        "r": 53,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_street_bollard_yellow",
        "c": 66,
        "r": 53,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_street_bollard_yellow",
        "c": 67,
        "r": 53,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_street_traffic_light",
        "c": 71,
        "r": 43,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_street_traffic_light",
        "c": 66,
        "r": 38,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_street_traffic_light",
        "c": 71,
        "r": 33,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_street_sign_two_stage_turn",
        "c": 71,
        "r": 38,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 72,
        "r": 21,
        "layer": "floor"
      },
      {
        "id": "tile_street_crosswalk",
        "c": 53,
        "r": 54,
        "layer": "ground2"
      },
      {
        "id": "tile_street_crosswalk",
        "c": 53,
        "r": 50,
        "layer": "ground2"
      },
      {
        "id": "tile_street_crosswalk",
        "c": 53,
        "r": 46,
        "layer": "ground2"
      },
      {
        "id": "tile_street_crosswalk",
        "c": 53,
        "r": 42,
        "layer": "ground2"
      },
      {
        "id": "tile_street_crosswalk",
        "c": 53,
        "r": 38,
        "layer": "ground2"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 64,
        "r": 4,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 51,
        "r": 25,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_wall02_secret",
        "c": 50,
        "r": 24,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 50,
        "r": 22,
        "layer": "ground4"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 50,
        "r": 19,
        "layer": "ground4"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 50,
        "r": 16,
        "layer": "ground4"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 50,
        "r": 13,
        "layer": "ground4"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 50,
        "r": 10,
        "layer": "ground4"
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 49,
        "r": 8,
        "layer": "object5"
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 52,
        "r": 8,
        "layer": "object5",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_wall02_hole",
        "c": 50,
        "r": 8,
        "layer": "object5",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_wall02_hole",
        "c": 50,
        "r": 18,
        "layer": "object5",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_door_wood",
        "c": 50,
        "r": 19,
        "layer": "object6",
        "fx": true,
        "doorMode": "key"
      },
      {
        "id": "tile_bg_backroom_door_wood",
        "c": 50,
        "r": 9,
        "layer": "object6",
        "fx": true,
        "doorMode": "picture"
      },
      {
        "id": "tile_street_scooter_delivery_pink",
        "c": 58,
        "r": 45,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_street_scooter_delivery_green",
        "c": 48,
        "r": 52,
        "layer": "object"
      },
      {
        "id": "tile_street_scooter_delivery_green",
        "c": 48,
        "r": 38,
        "layer": "object"
      },
      {
        "id": "tile_street_scooter_delivery_pink",
        "c": 51,
        "r": 35,
        "layer": "object"
      },
      {
        "id": "tile_street_utility_box_painted",
        "c": 82,
        "r": 19,
        "layer": "object2"
      },
      {
        "id": "tile_street_stall_noodles",
        "c": 57,
        "r": 57,
        "layer": "object2",
        "ox": -4,
        "oy": 0
      },
      {
        "id": "tile_street_stall_drinks",
        "c": 42,
        "r": 17,
        "layer": "object2",
        "ox": -8,
        "oy": -28
      },
      {
        "id": "tile_field_ammo_crate_open",
        "c": 62,
        "r": 67,
        "layer": "object2",
        "ox": 0,
        "oy": 0
      },
      {
        "id": "tile_field_supply_box",
        "c": 61,
        "r": 67,
        "layer": "object2",
        "ox": -12,
        "oy": 0
      },
      {
        "id": "tile_mvma4ws7",
        "c": 63,
        "r": 67,
        "layer": "object2",
        "ox": 10,
        "oy": 0
      },
      {
        "id": "tile_field_camp_bed",
        "c": 63,
        "r": 69,
        "layer": "object2",
        "ox": 10,
        "oy": 8
      },
      {
        "id": "tile_field_camp_bed",
        "c": 61,
        "r": 69,
        "layer": "object2",
        "ox": 2,
        "oy": 8
      },
      {
        "id": "tile_street_scooter_delivery_green",
        "c": 48,
        "r": 30,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_street_scooter_delivery_pink",
        "c": 52,
        "r": 26,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 30,
        "r": 65,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 27,
        "r": 65,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 24,
        "r": 65,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 21,
        "r": 65,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 18,
        "r": 65,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 18,
        "r": 62,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 18,
        "r": 59,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 21,
        "r": 59,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 21,
        "r": 62,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mrt_escalator_front_high02",
        "c": 14,
        "r": 50,
        "layer": "ground",
        "ox": 0,
        "oy": -8
      },
      {
        "id": "tile_bg_extra_high_wall02",
        "c": 19,
        "r": 50,
        "layer": "object"
      },
      {
        "id": "tile_bg_extra_high_pillar02",
        "c": 13,
        "r": 49,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 15,
        "r": 59,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 15,
        "r": 62,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 15,
        "r": 65,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 24,
        "r": 59,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 24,
        "r": 60,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 24,
        "r": 61,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 24,
        "r": 62,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 24,
        "r": 63,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 24,
        "r": 64,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 25,
        "r": 59,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 25,
        "r": 60,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 25,
        "r": 61,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 25,
        "r": 62,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 25,
        "r": 63,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 25,
        "r": 64,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvpa16jw",
        "c": 25,
        "r": 61,
        "layer": "object"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 31,
        "r": 61,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa16jw",
        "c": 5,
        "r": 65,
        "layer": "object",
        "fx": false
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 31,
        "r": 66,
        "layer": "object",
        "fx": true
      },
      {
        "id": "floor",
        "c": 15,
        "r": 68,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 16,
        "r": 68,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 17,
        "r": 68,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 18,
        "r": 68,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 23,
        "r": 68,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 24,
        "r": 68,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 25,
        "r": 68,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 26,
        "r": 68,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 27,
        "r": 68,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 28,
        "r": 68,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 29,
        "r": 68,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 30,
        "r": 68,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 31,
        "r": 68,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 19,
        "r": 68,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 20,
        "r": 68,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 21,
        "r": 68,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 22,
        "r": 68,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 17,
        "r": 66,
        "layer": "object",
        "fx": false
      },
      {
        "id": "tile_mr4cyy36",
        "c": 19,
        "r": 66,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 18,
        "r": 66,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 20,
        "r": 66,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 21,
        "r": 66,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 22,
        "r": 66,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 23,
        "r": 66,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 24,
        "r": 66,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 25,
        "r": 66,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 26,
        "r": 66,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 27,
        "r": 66,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 28,
        "r": 66,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 29,
        "r": 66,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 30,
        "r": 66,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 27,
        "r": 62,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 28,
        "r": 62,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 29,
        "r": 62,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 30,
        "r": 62,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 5,
        "r": 64,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 13,
        "r": 59,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 13,
        "r": 58,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 13,
        "r": 57,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 25,
        "r": 58,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 25,
        "r": 57,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 24,
        "r": 40,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 13,
        "r": 40,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 17,
        "r": 40,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 19,
        "r": 40,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 18,
        "r": 40,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 20,
        "r": 40,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 21,
        "r": 40,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 23,
        "r": 40,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 22,
        "r": 40,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02_hole",
        "c": 78,
        "r": 59,
        "layer": "object3"
      },
      {
        "id": "tile_cvs_sign_home_mart",
        "c": 14,
        "r": 41,
        "layer": "object2",
        "ox": 0,
        "oy": -12
      },
      {
        "id": "tile_cvs_back_counter",
        "c": 14,
        "r": 41,
        "layer": "object2"
      },
      {
        "id": "tile_cvs_checkout_counter",
        "c": 14,
        "r": 43,
        "layer": "object2"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 22,
        "r": 34,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 23,
        "r": 34,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 24,
        "r": 34,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 21,
        "r": 33,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 21,
        "r": 30,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 21,
        "r": 27,
        "layer": "floor"
      },
      {
        "id": "tile_street_capsule_toy_machines",
        "c": 38,
        "r": 49,
        "layer": "object3",
        "ox": -26,
        "oy": -4
      },
      {
        "id": "tile_street_claw_machine",
        "c": 30,
        "r": 49,
        "layer": "object3",
        "ox": 0,
        "oy": -16
      },
      {
        "id": "tile_mrt_info_board_map",
        "c": 63,
        "r": 5,
        "layer": "object2",
        "ox": 0,
        "oy": -14
      },
      {
        "id": "tile_mrt_glass_railing",
        "c": 66,
        "r": 8,
        "layer": "object2",
        "ox": 0,
        "oy": 4
      },
      {
        "id": "tile_mrt_glass_railing",
        "c": 72,
        "r": 8,
        "layer": "object2",
        "ox": 0,
        "oy": 4
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 60,
        "r": 81,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 57,
        "r": 81,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 63,
        "r": 81,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 57,
        "r": 84,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 60,
        "r": 84,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 63,
        "r": 84,
        "layer": "floor"
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 65,
        "r": 78,
        "layer": "object"
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 56,
        "r": 82,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa16jw",
        "c": 64,
        "r": 83,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa16jw",
        "c": 57,
        "r": 83,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 59,
        "r": 83,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyq54",
        "c": 63,
        "r": 83,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 54,
        "r": 81,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 51,
        "r": 80,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 84,
        "r": 40,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 84,
        "r": 37,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 84,
        "r": 34,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 84,
        "r": 31,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 84,
        "r": 28,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 84,
        "r": 25,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 81,
        "r": 22,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 84,
        "r": 22,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 81,
        "r": 19,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 84,
        "r": 19,
        "layer": "floor"
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 77,
        "r": 53,
        "layer": "object"
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 80,
        "r": 53,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 74,
        "r": 25,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 75,
        "r": 25,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 76,
        "r": 25,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 74,
        "r": 29,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 75,
        "r": 29,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 76,
        "r": 29,
        "layer": "object"
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 77,
        "r": 29,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_bg_extra_floor02_extra",
        "c": 75,
        "r": 28,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_bg_extra_floor02_extra",
        "c": 76,
        "r": 28,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_bg_extra_floor02_extra",
        "c": 77,
        "r": 28,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_bg_extra_floor02_extra",
        "c": 78,
        "r": 28,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_bg_extra_floor02_extra",
        "c": 79,
        "r": 28,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_bg_extra_floor02_extra",
        "c": 80,
        "r": 28,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_bg_extra_floor02_extra",
        "c": 81,
        "r": 28,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_bg_extra_floor02_extra",
        "c": 82,
        "r": 28,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_bg_extra_floor02_extra",
        "c": 83,
        "r": 28,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_bg_extra_floor02_extra",
        "c": 79,
        "r": 27,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_bg_extra_floor02_extra",
        "c": 80,
        "r": 27,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_bg_extra_floor02_extra",
        "c": 84,
        "r": 28,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_bg_extra_floor02_extra",
        "c": 85,
        "r": 28,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_bg_extra_floor02_extra",
        "c": 86,
        "r": 28,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_bg_extra_floor02_extra",
        "c": 86,
        "r": 27,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_bg_extra_floor02_extra",
        "c": 85,
        "r": 27,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_bg_extra_floor02_extra",
        "c": 84,
        "r": 27,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_bg_extra_floor02_extra",
        "c": 83,
        "r": 27,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_bg_extra_floor02_extra",
        "c": 82,
        "r": 27,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_bg_extra_floor02_extra",
        "c": 81,
        "r": 27,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_bg_extra_floor02_extra",
        "c": 79,
        "r": 29,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_bg_extra_floor02_extra",
        "c": 80,
        "r": 29,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_bg_extra_floor02_extra",
        "c": 81,
        "r": 29,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_bg_extra_floor02_extra",
        "c": 82,
        "r": 29,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_bg_extra_floor02_extra",
        "c": 83,
        "r": 29,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_bg_extra_floor02_extra",
        "c": 84,
        "r": 29,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_bg_extra_floor02_extra",
        "c": 85,
        "r": 29,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_bg_extra_floor02_extra",
        "c": 86,
        "r": 29,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_bg_extra_floor02_extra",
        "c": 79,
        "r": 30,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_bg_extra_floor02_extra",
        "c": 80,
        "r": 30,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_bg_extra_floor02_extra",
        "c": 81,
        "r": 30,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_bg_extra_floor02_extra",
        "c": 82,
        "r": 30,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_bg_extra_floor02_extra",
        "c": 83,
        "r": 30,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_bg_extra_floor02_extra",
        "c": 84,
        "r": 30,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_bg_extra_floor02_extra",
        "c": 85,
        "r": 30,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_bg_extra_floor02_extra",
        "c": 86,
        "r": 30,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_bg_extra_floor02_extra",
        "c": 79,
        "r": 26,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_bg_extra_floor02_extra",
        "c": 80,
        "r": 26,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_bg_extra_floor02_extra",
        "c": 81,
        "r": 26,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_bg_extra_floor02_extra",
        "c": 82,
        "r": 26,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_bg_extra_floor02_extra",
        "c": 83,
        "r": 26,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_bg_extra_floor02_extra",
        "c": 84,
        "r": 26,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_bg_extra_floor02_extra",
        "c": 85,
        "r": 26,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_bg_extra_floor02_extra",
        "c": 86,
        "r": 26,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_street_crosswalk",
        "c": 82,
        "r": 28,
        "layer": "ground2",
        "fx": true,
        "rot": 3,
        "ox": 34,
        "oy": 0
      },
      {
        "id": "tile_street_crosswalk",
        "c": 87,
        "r": 28,
        "layer": "ground2",
        "fx": true,
        "rot": 3,
        "ox": -10,
        "oy": 0
      },
      {
        "id": "tile_mvpa16jw",
        "c": 74,
        "r": 46,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 74,
        "r": 43,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_bg_extra_floor02_extra",
        "c": 72,
        "r": 46,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_bg_extra_floor02_extra",
        "c": 73,
        "r": 46,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_bg_extra_floor02_extra",
        "c": 74,
        "r": 46,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_bg_extra_floor02_extra",
        "c": 75,
        "r": 46,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_street_ubike",
        "c": 73,
        "r": 45,
        "layer": "object4",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 29,
        "r": 72,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 26,
        "r": 72,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 26,
        "r": 75,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 26,
        "r": 78,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 26,
        "r": 81,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 26,
        "r": 84,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 23,
        "r": 84,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 23,
        "r": 81,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 23,
        "r": 78,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 20,
        "r": 84,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 17,
        "r": 84,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 14,
        "r": 84,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 16,
        "r": 34,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 18,
        "r": 34,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 19,
        "r": 34,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 20,
        "r": 34,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 21,
        "r": 34,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 17,
        "r": 34,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 14,
        "r": 34,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 15,
        "r": 34,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 36,
        "r": 15,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 36,
        "r": 16,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 36,
        "r": 17,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 36,
        "r": 18,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa16jw",
        "c": 5,
        "r": 83,
        "layer": "object"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 27,
        "r": 83,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 5,
        "r": 76,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 16,
        "r": 84,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 17,
        "r": 84,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 18,
        "r": 84,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 19,
        "r": 84,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 20,
        "r": 84,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 21,
        "r": 84,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 22,
        "r": 84,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 23,
        "r": 84,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 24,
        "r": 84,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 25,
        "r": 84,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 26,
        "r": 84,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 16,
        "r": 76,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 18,
        "r": 76,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 19,
        "r": 76,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 17,
        "r": 76,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 21,
        "r": 76,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 20,
        "r": 76,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 22,
        "r": 76,
        "layer": "object"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 23,
        "r": 75,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 24,
        "r": 68,
        "layer": "object"
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 28,
        "r": 72,
        "layer": "object"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 31,
        "r": 67,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 27,
        "r": 68,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 29,
        "r": 68,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 28,
        "r": 68,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 30,
        "r": 68,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 30,
        "r": 72,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 31,
        "r": 72,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 32,
        "r": 72,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 33,
        "r": 72,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 28,
        "r": 75,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_eoc_door_exit_fade",
        "c": 60,
        "r": 85,
        "layer": "ground3",
        "fx": true,
        "ox": -16,
        "oy": 0
      },
      {
        "id": "tile_eoc_door_exit_fade",
        "c": 62,
        "r": 85,
        "layer": "ground3",
        "fx": true
      },
      {
        "id": "tile_eoc_door_exit_fade",
        "c": 61,
        "r": 85,
        "layer": "ground3",
        "fx": true,
        "ox": -8,
        "oy": 0
      },
      {
        "id": "tile_mrt_exit_2_sealed",
        "c": 9,
        "r": 73,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 7,
        "r": 84,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 9,
        "r": 84,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 8,
        "r": 84,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 10,
        "r": 84,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 12,
        "r": 84,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 11,
        "r": 84,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 13,
        "r": 84,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 15,
        "r": 84,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 14,
        "r": 84,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 11,
        "r": 84,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 8,
        "r": 84,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 5,
        "r": 84,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mr4cyq54",
        "c": 8,
        "r": 75,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyq54",
        "c": 14,
        "r": 75,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 15,
        "r": 76,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 7,
        "r": 76,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 26,
        "r": 68,
        "layer": "object",
        "fx": true
      },
      {
        "id": "floor",
        "c": 25,
        "r": 72,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 25,
        "r": 73,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 25,
        "r": 74,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 25,
        "r": 75,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 25,
        "r": 76,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 25,
        "r": 77,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 24,
        "r": 77,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 24,
        "r": 76,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 24,
        "r": 75,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 24,
        "r": 74,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 24,
        "r": 73,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 24,
        "r": 72,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 25,
        "r": 71,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 26,
        "r": 71,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 27,
        "r": 71,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 28,
        "r": 71,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 29,
        "r": 71,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 30,
        "r": 71,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 31,
        "r": 71,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 32,
        "r": 71,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mrt_ticket_gate",
        "c": 25,
        "r": 77,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mrt_pillar_large",
        "c": 65,
        "r": 0,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mrt_pillar_large",
        "c": 72,
        "r": 0,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mrt_ticket_gate",
        "c": 69,
        "r": 8,
        "layer": "object2",
        "fx": true,
        "ox": 0,
        "oy": 4
      },
      {
        "id": "tile_mrt_pillar_large_route_map",
        "c": 94,
        "r": 14,
        "layer": "overlay",
        "fx": true
      },
      {
        "id": "tile_mrt_pillar_large_route_map",
        "c": 31,
        "r": 8,
        "layer": "object3"
      },
      {
        "id": "tile_street_folding_table",
        "c": 61,
        "r": 59,
        "layer": "object3",
        "ox": -22,
        "oy": 4
      },
      {
        "id": "tile_street_plastic_stool",
        "c": 64,
        "r": 55,
        "layer": "object3",
        "ox": -20,
        "oy": 12
      },
      {
        "id": "tile_mrt_glass_railing",
        "c": 63,
        "r": 8,
        "layer": "object2",
        "fx": true,
        "ox": 0,
        "oy": 4
      },
      {
        "id": "tile_street_crosswalk",
        "c": 68,
        "r": 19,
        "layer": "ground2",
        "fx": true
      },
      {
        "id": "tile_street_crosswalk",
        "c": 68,
        "r": 15,
        "layer": "ground2",
        "fx": true
      },
      {
        "id": "tile_street_crosswalk",
        "c": 68,
        "r": 11,
        "layer": "ground2",
        "fx": true
      },
      {
        "id": "tile_street_bollard_yellow",
        "c": 74,
        "r": 18,
        "layer": "object4",
        "fx": true
      },
      {
        "id": "tile_street_bollard_yellow",
        "c": 74,
        "r": 16,
        "layer": "object4",
        "fx": true
      },
      {
        "id": "tile_street_bollard_yellow",
        "c": 74,
        "r": 14,
        "layer": "object4",
        "fx": true
      },
      {
        "id": "tile_street_bollard_yellow",
        "c": 74,
        "r": 12,
        "layer": "object4",
        "fx": true
      },
      {
        "id": "tile_street_bollard_yellow",
        "c": 74,
        "r": 10,
        "layer": "object4",
        "fx": true
      },
      {
        "id": "tile_street_bollard_yellow",
        "c": 63,
        "r": 10,
        "layer": "object4",
        "fx": true
      },
      {
        "id": "tile_street_bollard_yellow",
        "c": 63,
        "r": 12,
        "layer": "object4",
        "fx": true
      },
      {
        "id": "tile_street_bollard_yellow",
        "c": 63,
        "r": 14,
        "layer": "object4",
        "fx": true
      },
      {
        "id": "tile_street_bollard_yellow",
        "c": 63,
        "r": 16,
        "layer": "object4",
        "fx": true
      },
      {
        "id": "tile_street_bollard_yellow",
        "c": 63,
        "r": 18,
        "layer": "object4",
        "fx": true
      },
      {
        "id": "tile_street_scooter_delivery_green",
        "c": 63,
        "r": 13,
        "layer": "object4"
      },
      {
        "id": "tile_street_name_sign_pole",
        "c": 51,
        "r": 54,
        "layer": "object4",
        "ox": -14,
        "oy": 0
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 87,
        "r": 40,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 87,
        "r": 37,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 87,
        "r": 34,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 87,
        "r": 31,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 87,
        "r": 28,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 87,
        "r": 25,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 87,
        "r": 22,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 87,
        "r": 19,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 85,
        "r": 70,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 88,
        "r": 70,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 91,
        "r": 70,
        "layer": "floor",
        "fx": false
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 91,
        "r": 73,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 91,
        "r": 76,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 91,
        "r": 79,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 91,
        "r": 82,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 88,
        "r": 82,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 85,
        "r": 82,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 82,
        "r": 82,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 79,
        "r": 82,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 79,
        "r": 79,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 82,
        "r": 79,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 85,
        "r": 79,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 79,
        "r": 76,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 82,
        "r": 76,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 85,
        "r": 76,
        "layer": "floor"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 79,
        "r": 82,
        "layer": "object"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 93,
        "r": 82,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 87,
        "r": 74,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 79,
        "r": 74,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 81,
        "r": 74,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 83,
        "r": 74,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 82,
        "r": 74,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 84,
        "r": 74,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 85,
        "r": 74,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 86,
        "r": 74,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 81,
        "r": 83,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 83,
        "r": 83,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 84,
        "r": 83,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 85,
        "r": 83,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 86,
        "r": 83,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 87,
        "r": 83,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 88,
        "r": 83,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 90,
        "r": 83,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 91,
        "r": 83,
        "layer": "object",
        "fx": false
      },
      {
        "id": "tile_mr4cyy36",
        "c": 89,
        "r": 83,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 82,
        "r": 83,
        "layer": "object"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 88,
        "r": 78,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 92,
        "r": 83,
        "layer": "object"
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 93,
        "r": 66,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 83,
        "r": 70,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 84,
        "r": 70,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 85,
        "r": 70,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 86,
        "r": 70,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 87,
        "r": 70,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 88,
        "r": 70,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 89,
        "r": 70,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 88,
        "r": 66,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 87,
        "r": 66,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 86,
        "r": 66,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 89,
        "r": 66,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 90,
        "r": 66,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 91,
        "r": 66,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 92,
        "r": 66,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa16jw",
        "c": 84,
        "r": 65,
        "layer": "object"
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 90,
        "r": 70,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 91,
        "r": 73,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 90,
        "r": 67,
        "layer": "floor",
        "fx": false
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 87,
        "r": 68,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 84,
        "r": 68,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvcsj5eh",
        "c": 77,
        "r": 61,
        "layer": "object"
      },
      {
        "id": "tile_mvcsj5eh",
        "c": 81,
        "r": 61,
        "layer": "object"
      },
      {
        "id": "tile_mvcsj5eh",
        "c": 36,
        "r": 49,
        "layer": "object"
      },
      {
        "id": "tile_mvcsj5eh",
        "c": 14,
        "r": 77,
        "layer": "object"
      },
      {
        "id": "tile_street_capsule_toy_machines",
        "c": 72,
        "r": 5,
        "layer": "object2",
        "ox": 16,
        "oy": -18
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 6,
        "r": 30,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 6,
        "r": 33,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 9,
        "r": 33,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 9,
        "r": 30,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 9,
        "r": 27,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 18,
        "r": 27,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 15,
        "r": 27,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 12,
        "r": 27,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 12,
        "r": 30,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 12,
        "r": 33,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 16,
        "r": 34,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 15,
        "r": 33,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 15,
        "r": 30,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 18,
        "r": 30,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 18,
        "r": 33,
        "layer": "floor"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 8,
        "r": 34,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 10,
        "r": 34,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 11,
        "r": 34,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 12,
        "r": 34,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 9,
        "r": 34,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 13,
        "r": 34,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 8,
        "r": 8,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 9,
        "r": 8,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 10,
        "r": 8,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 12,
        "r": 8,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 15,
        "r": 8,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 11,
        "r": 8,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 13,
        "r": 8,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 14,
        "r": 8,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 16,
        "r": 8,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 17,
        "r": 8,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 18,
        "r": 8,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 19,
        "r": 8,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 20,
        "r": 8,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 21,
        "r": 8,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 6,
        "r": 9,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 9,
        "r": 9,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 12,
        "r": 9,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 15,
        "r": 9,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 18,
        "r": 9,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 21,
        "r": 9,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 24,
        "r": 9,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 27,
        "r": 9,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 30,
        "r": 9,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 33,
        "r": 9,
        "layer": "floor"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 22,
        "r": 8,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 23,
        "r": 8,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 24,
        "r": 8,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 25,
        "r": 8,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 26,
        "r": 8,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 27,
        "r": 8,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 28,
        "r": 8,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 29,
        "r": 8,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 30,
        "r": 8,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 31,
        "r": 8,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 32,
        "r": 8,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 33,
        "r": 8,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 34,
        "r": 8,
        "layer": "object"
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 35,
        "r": 8,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 36,
        "r": 11,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 36,
        "r": 12,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 36,
        "r": 13,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 36,
        "r": 14,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 35,
        "r": 27,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 33,
        "r": 27,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 34,
        "r": 27,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 32,
        "r": 27,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 31,
        "r": 27,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 30,
        "r": 27,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 29,
        "r": 27,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 27,
        "r": 27,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 28,
        "r": 27,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 26,
        "r": 27,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 24,
        "r": 27,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 25,
        "r": 27,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 23,
        "r": 27,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 22,
        "r": 27,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 20,
        "r": 27,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 19,
        "r": 27,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 18,
        "r": 27,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 17,
        "r": 27,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 15,
        "r": 27,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 14,
        "r": 27,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 21,
        "r": 27,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 16,
        "r": 27,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 13,
        "r": 27,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 11,
        "r": 27,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 12,
        "r": 27,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_mvcrmipy",
        "c": 7,
        "r": 27,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 9,
        "r": 27,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_bg_extra_high_wall",
        "c": 10,
        "r": 27,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 34,
        "r": 25,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 34,
        "r": 23,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 34,
        "r": 21,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 34,
        "r": 19,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 34,
        "r": 17,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 34,
        "r": 15,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 34,
        "r": 13,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 34,
        "r": 11,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 32,
        "r": 11,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 32,
        "r": 13,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 32,
        "r": 15,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 32,
        "r": 17,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 32,
        "r": 19,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 32,
        "r": 21,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 32,
        "r": 23,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 32,
        "r": 25,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 30,
        "r": 25,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 30,
        "r": 23,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 30,
        "r": 21,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 30,
        "r": 19,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 30,
        "r": 17,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 30,
        "r": 15,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 30,
        "r": 13,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 30,
        "r": 11,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 28,
        "r": 11,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 28,
        "r": 13,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 28,
        "r": 15,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 28,
        "r": 17,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 28,
        "r": 19,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 28,
        "r": 21,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 28,
        "r": 23,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 28,
        "r": 25,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 26,
        "r": 25,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 26,
        "r": 23,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 26,
        "r": 21,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 26,
        "r": 19,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 26,
        "r": 17,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 26,
        "r": 15,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 26,
        "r": 13,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 26,
        "r": 11,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 24,
        "r": 11,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 22,
        "r": 11,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 20,
        "r": 11,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 18,
        "r": 11,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 16,
        "r": 11,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 14,
        "r": 11,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 12,
        "r": 11,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 10,
        "r": 11,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 8,
        "r": 11,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 6,
        "r": 11,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 24,
        "r": 13,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 24,
        "r": 15,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 24,
        "r": 17,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 24,
        "r": 19,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 24,
        "r": 21,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 24,
        "r": 23,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 24,
        "r": 25,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 22,
        "r": 13,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 22,
        "r": 15,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 22,
        "r": 17,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 22,
        "r": 19,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 22,
        "r": 21,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 22,
        "r": 23,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 22,
        "r": 25,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 20,
        "r": 13,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 20,
        "r": 15,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 20,
        "r": 17,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 20,
        "r": 19,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 20,
        "r": 21,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 20,
        "r": 23,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 20,
        "r": 25,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 18,
        "r": 13,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 18,
        "r": 15,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 18,
        "r": 17,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 18,
        "r": 19,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 18,
        "r": 21,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 18,
        "r": 23,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 18,
        "r": 25,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 16,
        "r": 13,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 16,
        "r": 15,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 16,
        "r": 17,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 16,
        "r": 19,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 16,
        "r": 21,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 16,
        "r": 23,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 16,
        "r": 25,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 14,
        "r": 13,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 14,
        "r": 15,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 14,
        "r": 17,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 14,
        "r": 19,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 14,
        "r": 21,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 14,
        "r": 23,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 14,
        "r": 25,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 12,
        "r": 13,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 12,
        "r": 15,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 12,
        "r": 17,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 12,
        "r": 19,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 12,
        "r": 21,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 12,
        "r": 23,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 12,
        "r": 25,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 10,
        "r": 13,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 8,
        "r": 13,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 6,
        "r": 13,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 10,
        "r": 15,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 10,
        "r": 17,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 10,
        "r": 19,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 10,
        "r": 21,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 10,
        "r": 23,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 10,
        "r": 25,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 8,
        "r": 15,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 8,
        "r": 17,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 8,
        "r": 19,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 8,
        "r": 21,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 8,
        "r": 23,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 8,
        "r": 25,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 6,
        "r": 15,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 6,
        "r": 17,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 6,
        "r": 19,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 6,
        "r": 21,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 6,
        "r": 23,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 6,
        "r": 25,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 6,
        "r": 27,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwilme2",
        "c": 8,
        "r": 27,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mrt_escalator_front_high02",
        "c": 20,
        "r": 50,
        "layer": "object",
        "fx": true,
        "ox": 0,
        "oy": -8
      },
      {
        "id": "tile_mr4cyy36",
        "c": 15,
        "r": 66,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 16,
        "r": 66,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 25,
        "r": 59,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 25,
        "r": 60,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_bg_extra_high_pillar02",
        "c": 25,
        "r": 49,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 15,
        "r": 40,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 16,
        "r": 40,
        "layer": "object",
        "fx": true
      },
      {
        "id": "floor",
        "c": 14,
        "r": 57,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 14,
        "r": 58,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 14,
        "r": 59,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 14,
        "r": 60,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall03",
        "c": 63,
        "r": 7,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall03",
        "c": 64,
        "r": 7,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall03",
        "c": 65,
        "r": 7,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall03",
        "c": 66,
        "r": 7,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall03",
        "c": 67,
        "r": 7,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall03",
        "c": 67,
        "r": 6,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall03",
        "c": 68,
        "r": 6,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall03",
        "c": 68,
        "r": 7,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall03",
        "c": 69,
        "r": 7,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall03",
        "c": 69,
        "r": 6,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall03",
        "c": 70,
        "r": 6,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall03",
        "c": 70,
        "r": 7,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall03",
        "c": 71,
        "r": 6,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall03",
        "c": 71,
        "r": 7,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall03",
        "c": 72,
        "r": 7,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall03",
        "c": 72,
        "r": 6,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall03",
        "c": 73,
        "r": 7,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall03",
        "c": 74,
        "r": 7,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall03",
        "c": 74,
        "r": 8,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall03",
        "c": 73,
        "r": 8,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall03",
        "c": 72,
        "r": 8,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall03",
        "c": 71,
        "r": 8,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall03",
        "c": 70,
        "r": 8,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall03",
        "c": 69,
        "r": 8,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall03",
        "c": 68,
        "r": 8,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall03",
        "c": 67,
        "r": 8,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall03",
        "c": 66,
        "r": 8,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall03",
        "c": 65,
        "r": 8,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall03",
        "c": 64,
        "r": 8,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall03",
        "c": 63,
        "r": 8,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall03",
        "c": 63,
        "r": 9,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall03",
        "c": 64,
        "r": 9,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall03",
        "c": 65,
        "r": 9,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall03",
        "c": 66,
        "r": 9,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall03",
        "c": 67,
        "r": 9,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall03",
        "c": 68,
        "r": 9,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall03",
        "c": 69,
        "r": 9,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall03",
        "c": 70,
        "r": 9,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall03",
        "c": 71,
        "r": 9,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall03",
        "c": 72,
        "r": 9,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall03",
        "c": 73,
        "r": 9,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall03",
        "c": 74,
        "r": 9,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 14,
        "r": 49,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 15,
        "r": 49,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 16,
        "r": 49,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 17,
        "r": 49,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 18,
        "r": 49,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 19,
        "r": 49,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 20,
        "r": 49,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 21,
        "r": 49,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 22,
        "r": 49,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 23,
        "r": 49,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 24,
        "r": 49,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 24,
        "r": 48,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 23,
        "r": 48,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 22,
        "r": 48,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 21,
        "r": 48,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 20,
        "r": 48,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 19,
        "r": 48,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 18,
        "r": 48,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 17,
        "r": 48,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 16,
        "r": 48,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 15,
        "r": 48,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 15,
        "r": 47,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 14,
        "r": 48,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 14,
        "r": 47,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 14,
        "r": 46,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 15,
        "r": 46,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 16,
        "r": 46,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 17,
        "r": 46,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 18,
        "r": 46,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 19,
        "r": 46,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 20,
        "r": 46,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 21,
        "r": 46,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 22,
        "r": 46,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 23,
        "r": 46,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 24,
        "r": 46,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 24,
        "r": 47,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 23,
        "r": 47,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 22,
        "r": 47,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 21,
        "r": 47,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 20,
        "r": 47,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 19,
        "r": 47,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 18,
        "r": 47,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 17,
        "r": 47,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 16,
        "r": 47,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 14,
        "r": 45,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 15,
        "r": 45,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 16,
        "r": 45,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 24,
        "r": 45,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 23,
        "r": 45,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 22,
        "r": 45,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 21,
        "r": 45,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 20,
        "r": 45,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 19,
        "r": 45,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 18,
        "r": 45,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 17,
        "r": 45,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 14,
        "r": 44,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 15,
        "r": 44,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 16,
        "r": 44,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 17,
        "r": 44,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 18,
        "r": 44,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 19,
        "r": 44,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 20,
        "r": 44,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 21,
        "r": 44,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 22,
        "r": 44,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 23,
        "r": 44,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 24,
        "r": 44,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 24,
        "r": 43,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 23,
        "r": 43,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 22,
        "r": 43,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 21,
        "r": 43,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 20,
        "r": 43,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 19,
        "r": 43,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 18,
        "r": 43,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 17,
        "r": 43,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 16,
        "r": 43,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 15,
        "r": 43,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_station_hall_wall02",
        "c": 14,
        "r": 43,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_cvs_drink_cooler",
        "c": 22,
        "r": 41,
        "layer": "object2",
        "fx": true,
        "ox": -4,
        "oy": -6
      },
      {
        "id": "tile_cvs_ice_cream_freezer",
        "c": 20,
        "r": 41,
        "layer": "object2",
        "fx": true,
        "ox": -8,
        "oy": -6
      },
      {
        "id": "tile_cvs_counter_extension",
        "c": 21,
        "r": 44,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_cvs_counter_extension",
        "c": 23,
        "r": 44,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_mvwj8b1i",
        "c": 6,
        "r": 79,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwj8b1i",
        "c": 8,
        "r": 79,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwj8b1i",
        "c": 8,
        "r": 77,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwj8b1i",
        "c": 5,
        "r": 79,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwj8b1i",
        "c": 10,
        "r": 79,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwj8b1i",
        "c": 10,
        "r": 77,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwj8b1i",
        "c": 12,
        "r": 79,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwj8b1i",
        "c": 12,
        "r": 76,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwj8b1i",
        "c": 12,
        "r": 77,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwj8b1i",
        "c": 5,
        "r": 81,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwj8b1i",
        "c": 7,
        "r": 81,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwj8b1i",
        "c": 9,
        "r": 81,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwj8b1i",
        "c": 11,
        "r": 81,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwj8b1i",
        "c": 13,
        "r": 81,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwj8b1i",
        "c": 5,
        "r": 83,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwj8b1i",
        "c": 7,
        "r": 83,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwj8b1i",
        "c": 9,
        "r": 83,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwj8b1i",
        "c": 11,
        "r": 83,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwj8b1i",
        "c": 13,
        "r": 83,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwj8b1i",
        "c": 15,
        "r": 79,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwj8b1i",
        "c": 15,
        "r": 81,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwj8b1i",
        "c": 17,
        "r": 79,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwj8b1i",
        "c": 17,
        "r": 83,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwj8b1i",
        "c": 19,
        "r": 79,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwj8b1i",
        "c": 19,
        "r": 83,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwj8b1i",
        "c": 21,
        "r": 81,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwj8b1i",
        "c": 21,
        "r": 83,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor03",
        "c": 20,
        "r": 81,
        "layer": "ground"
      },
      {
        "id": "tile_bg_backroom_floor04",
        "c": 11,
        "r": 80,
        "layer": "ground"
      },
      {
        "id": "tile_bg_backroom_floor03",
        "c": 6,
        "r": 81,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_mvwj8b1i",
        "c": 15,
        "r": 83,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwj8b1i",
        "c": 17,
        "r": 81,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwj8b1i",
        "c": 19,
        "r": 81,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mvwj8b1i",
        "c": 21,
        "r": 79,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor04",
        "c": 17,
        "r": 80,
        "layer": "ground"
      },
      {
        "id": "tile_interactive_storage_locker",
        "c": 22,
        "r": 77,
        "layer": "object2"
      },
      {
        "id": "tile_interactive_storage_locker",
        "c": 19,
        "r": 77,
        "layer": "object2"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 77,
        "r": 25,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 78,
        "r": 25,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 79,
        "r": 25,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 81,
        "r": 17,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 83,
        "r": 17,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 85,
        "r": 17,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 84,
        "r": 17,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 86,
        "r": 17,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 90,
        "r": 40,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 90,
        "r": 37,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 90,
        "r": 34,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 90,
        "r": 31,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 90,
        "r": 28,
        "layer": "floor",
        "rot": 2
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 90,
        "r": 25,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 90,
        "r": 22,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 90,
        "r": 19,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 93,
        "r": 19,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 93,
        "r": 22,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 93,
        "r": 25,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 93,
        "r": 28,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 93,
        "r": 31,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 93,
        "r": 34,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 93,
        "r": 37,
        "layer": "floor"
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 93,
        "r": 40,
        "layer": "floor"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 78,
        "r": 39,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 80,
        "r": 40,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 81,
        "r": 40,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 84,
        "r": 40,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 82,
        "r": 40,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 83,
        "r": 40,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 86,
        "r": 40,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 85,
        "r": 40,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 92,
        "r": 40,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 93,
        "r": 40,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 94,
        "r": 40,
        "layer": "object"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 95,
        "r": 39,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 78,
        "r": 38,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 78,
        "r": 37,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 78,
        "r": 36,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 78,
        "r": 35,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 78,
        "r": 34,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 78,
        "r": 33,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 78,
        "r": 32,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 96,
        "r": 38,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 96,
        "r": 37,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 96,
        "r": 36,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 96,
        "r": 35,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 96,
        "r": 34,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 96,
        "r": 33,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 96,
        "r": 32,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 96,
        "r": 31,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 96,
        "r": 30,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 96,
        "r": 29,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 96,
        "r": 28,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 96,
        "r": 27,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 96,
        "r": 26,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 96,
        "r": 25,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 96,
        "r": 24,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 96,
        "r": 23,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 96,
        "r": 22,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 96,
        "r": 21,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 96,
        "r": 20,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 95,
        "r": 17,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 90,
        "r": 17,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 92,
        "r": 17,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 93,
        "r": 17,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 94,
        "r": 17,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 91,
        "r": 17,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_pillar3",
        "c": 81,
        "r": 24,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 80,
        "r": 25,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 81,
        "r": 26,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 81,
        "r": 27,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 81,
        "r": 28,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 81,
        "r": 29,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 81,
        "r": 30,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 81,
        "r": 31,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 81,
        "r": 32,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mvcsj5eh",
        "c": 81,
        "r": 33,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 78,
        "r": 37,
        "layer": "floor",
        "fx": false
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 78,
        "r": 34,
        "layer": "floor",
        "fx": false
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 78,
        "r": 31,
        "layer": "floor",
        "fx": false
      },
      {
        "id": "tile_bg_backroom_wall02_secret",
        "c": 87,
        "r": 17,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 87,
        "r": 16,
        "layer": "ground4",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 87,
        "r": 13,
        "layer": "ground4",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 87,
        "r": 10,
        "layer": "ground4",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 87,
        "r": 7,
        "layer": "ground4",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 84,
        "r": 7,
        "layer": "ground4",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 84,
        "r": 10,
        "layer": "ground4",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 90,
        "r": 10,
        "layer": "ground4",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 90,
        "r": 7,
        "layer": "ground4",
        "fx": true
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 92,
        "r": 4,
        "layer": "object5",
        "fx": true
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 83,
        "r": 4,
        "layer": "object5"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 83,
        "r": 10,
        "layer": "object5"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 92,
        "r": 10,
        "layer": "object5",
        "fx": true
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 90,
        "r": 11,
        "layer": "object5"
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 85,
        "r": 11,
        "layer": "object5",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 85,
        "r": 4,
        "layer": "object5",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 87,
        "r": 4,
        "layer": "object5",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 88,
        "r": 4,
        "layer": "object5",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 86,
        "r": 4,
        "layer": "object5",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 89,
        "r": 4,
        "layer": "object5",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 90,
        "r": 4,
        "layer": "object5",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 91,
        "r": 4,
        "layer": "object5",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 83,
        "r": 7,
        "layer": "object5",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 83,
        "r": 8,
        "layer": "object5",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 83,
        "r": 9,
        "layer": "object5",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 93,
        "r": 7,
        "layer": "object5",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 93,
        "r": 8,
        "layer": "object5",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 93,
        "r": 9,
        "layer": "object5",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 86,
        "r": 14,
        "layer": "object5",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 86,
        "r": 15,
        "layer": "object5",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 86,
        "r": 16,
        "layer": "object5",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 90,
        "r": 15,
        "layer": "object5",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 90,
        "r": 14,
        "layer": "object5",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 90,
        "r": 16,
        "layer": "object5",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 88,
        "r": 50,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 91,
        "r": 50,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 88,
        "r": 53,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 91,
        "r": 53,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 85,
        "r": 50,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 85,
        "r": 53,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 88,
        "r": 47,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 88,
        "r": 44,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 88,
        "r": 41,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_wall02_dmg_crack",
        "c": 88,
        "r": 40,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyq54",
        "c": 87,
        "r": 39,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyq54",
        "c": 91,
        "r": 39,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa16jw",
        "c": 84,
        "r": 53,
        "layer": "object"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 93,
        "r": 53,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 93,
        "r": 47,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 84,
        "r": 47,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 86,
        "r": 54,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 88,
        "r": 54,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 87,
        "r": 54,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 89,
        "r": 54,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 91,
        "r": 54,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 92,
        "r": 54,
        "layer": "object"
      },
      {
        "id": "tile_mr4cyy36",
        "c": 90,
        "r": 54,
        "layer": "object"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 91,
        "r": 46,
        "layer": "object"
      },
      {
        "id": "tile_mvpa16jw",
        "c": 86,
        "r": 46,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 87,
        "r": 41,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 87,
        "r": 42,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 87,
        "r": 43,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 87,
        "r": 44,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 87,
        "r": 45,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 91,
        "r": 41,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 91,
        "r": 42,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 91,
        "r": 43,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 91,
        "r": 44,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 91,
        "r": 45,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 84,
        "r": 51,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 84,
        "r": 50,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 84,
        "r": 52,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 94,
        "r": 50,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 94,
        "r": 51,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 94,
        "r": 52,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_obstacle_ore_rare",
        "c": 92,
        "r": 49,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_obstacle_ore_rare",
        "c": 87,
        "r": 51,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_obstacle_ore_large",
        "c": 92,
        "r": 53,
        "layer": "ground2"
      },
      {
        "id": "tile_obstacle_ore_large",
        "c": 85,
        "r": 53,
        "layer": "ground2"
      },
      {
        "id": "tile_obstacle_ore_large",
        "c": 88,
        "r": 46,
        "layer": "ground2"
      },
      {
        "id": "tile_obstacle_ore_small",
        "c": 89,
        "r": 49,
        "layer": "ground2",
        "fx": true
      },
      {
        "id": "tile_obstacle_ore_small",
        "c": 90,
        "r": 48,
        "layer": "ground2",
        "fx": true
      },
      {
        "id": "tile_obstacle_ore_small",
        "c": 85,
        "r": 51,
        "layer": "ground2",
        "fx": true
      },
      {
        "id": "tile_obstacle_ore_small",
        "c": 93,
        "r": 52,
        "layer": "ground2",
        "fx": true
      },
      {
        "id": "tile_interactive_storage_locker",
        "c": 85,
        "r": 5,
        "layer": "object6",
        "ox": -6,
        "oy": -22
      },
      {
        "id": "tile_interactive_storage_locker",
        "c": 88,
        "r": 5,
        "layer": "object6",
        "ox": -18,
        "oy": -22
      },
      {
        "id": "tile_interactive_storage_locker",
        "c": 91,
        "r": 5,
        "layer": "object6",
        "ox": -30,
        "oy": -22
      },
      {
        "id": "tile_field_ammo_crate",
        "c": 84,
        "r": 8,
        "layer": "object6",
        "lockerLoot": {
          "kind": "bullet",
          "id": "knock",
          "qty": 1
        }
      },
      {
        "id": "tile_field_ammo_crate",
        "c": 85,
        "r": 8,
        "layer": "object6",
        "lockerLoot": {
          "kind": "bullet",
          "id": "flash",
          "qty": 1
        }
      },
      {
        "id": "tile_field_ammo_crate",
        "c": 92,
        "r": 8,
        "layer": "object6",
        "lockerLoot": {
          "kind": "item",
          "id": "anomaly-firstaid",
          "qty": 1
        }
      },
      {
        "id": "tile_field_ammo_crate",
        "c": 91,
        "r": 8,
        "layer": "object6",
        "lockerLoot": {
          "kind": "item",
          "id": "adrenaline",
          "qty": 1
        }
      },
      {
        "id": "tile_street_crosswalk",
        "c": 91,
        "r": 28,
        "layer": "ground2",
        "rot": 1,
        "ox": 6,
        "oy": 0
      },
      {
        "id": "tile_obstacle_ore_rare",
        "c": 50,
        "r": 10,
        "layer": "object2"
      },
      {
        "id": "tile_obstacle_ore_rare",
        "c": 51,
        "r": 12,
        "layer": "object2"
      },
      {
        "id": "tile_obstacle_ore_rare",
        "c": 50,
        "r": 13,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 5,
        "r": 61,
        "layer": "object",
        "fx": false
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 12,
        "r": 62,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 9,
        "r": 62,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 12,
        "r": 65,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 9,
        "r": 65,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 6,
        "r": 62,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_bg_backroom_floor_l",
        "c": 6,
        "r": 65,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 7,
        "r": 66,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 8,
        "r": 66,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 9,
        "r": 66,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 10,
        "r": 66,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 11,
        "r": 66,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 12,
        "r": 66,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 13,
        "r": 66,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 14,
        "r": 66,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa16jw",
        "c": 12,
        "r": 60,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyy36",
        "c": 11,
        "r": 61,
        "layer": "object",
        "fx": true
      },
      {
        "id": "floor",
        "c": 14,
        "r": 61,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 13,
        "r": 57,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 13,
        "r": 58,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 13,
        "r": 59,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 13,
        "r": 60,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mr4cyq54",
        "c": 7,
        "r": 60,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4cyq54",
        "c": 10,
        "r": 60,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mrt_stairs_dark",
        "c": 8,
        "r": 60,
        "layer": "object",
        "fx": true
      },
      {
        "id": "floor",
        "c": 7,
        "r": 59,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 8,
        "r": 59,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 9,
        "r": 59,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 10,
        "r": 59,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 10,
        "r": 60,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 9,
        "r": 60,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 8,
        "r": 60,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 7,
        "r": 60,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 7,
        "r": 61,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 8,
        "r": 61,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 9,
        "r": 61,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 10,
        "r": 61,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 10,
        "r": 58,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 9,
        "r": 58,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 8,
        "r": 58,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 7,
        "r": 58,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 7,
        "r": 57,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 8,
        "r": 57,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 9,
        "r": 57,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 10,
        "r": 57,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 10,
        "r": 56,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 9,
        "r": 56,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 8,
        "r": 56,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 7,
        "r": 56,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 7,
        "r": 54,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 8,
        "r": 54,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 8,
        "r": 55,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 9,
        "r": 55,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 10,
        "r": 55,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 10,
        "r": 54,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 9,
        "r": 54,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "floor",
        "c": 7,
        "r": 55,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 7,
        "r": 55,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 7,
        "r": 56,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 7,
        "r": 57,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 7,
        "r": 58,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 7,
        "r": 59,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 10,
        "r": 59,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 10,
        "r": 58,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 10,
        "r": 57,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 10,
        "r": 56,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mr4czvpx",
        "c": 10,
        "r": 55,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 9,
        "r": 52,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mvpa0o8b",
        "c": 7,
        "r": 52,
        "layer": "object"
      },
      {
        "id": "tile_mvcsj5eh",
        "c": 32,
        "r": 49,
        "layer": "object3"
      },
      {
        "id": "tile_bg_backroom_wall02_hole",
        "c": 33,
        "r": 51,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_wall02_hole",
        "c": 33,
        "r": 35,
        "layer": "object"
      },
      {
        "id": "tile_bg_backroom_door_wood",
        "c": 34,
        "r": 36,
        "layer": "object2",
        "doorMode": "key"
      },
      {
        "id": "tile_bg_backroom_door_wood",
        "c": 34,
        "r": 52,
        "layer": "object2"
      },
      {
        "id": "tile_bg_backroom_wall02_dmg_crack",
        "c": 33,
        "r": 66,
        "layer": "object2"
      },
      {
        "id": "tile_bg_backroom_wall02_dmg_crack",
        "c": 25,
        "r": 73,
        "layer": "object2"
      },
      {
        "id": "tile_interactive_storage_locker",
        "c": 12,
        "r": 62,
        "layer": "object2",
        "ox": 0,
        "oy": -18
      },
      {
        "id": "tile_interactive_storage_locker",
        "c": 42,
        "r": 69,
        "layer": "object2"
      },
      {
        "id": "tile_interactive_storage_locker",
        "c": 34,
        "r": 31,
        "layer": "object2",
        "ox": 0,
        "oy": -24
      },
      {
        "id": "tile_interactive_storage_locker",
        "c": 8,
        "r": 9,
        "layer": "object2"
      },
      {
        "id": "tile_interactive_storage_locker",
        "c": 11,
        "r": 9,
        "layer": "object2"
      },
      {
        "id": "tile_interactive_storage_locker",
        "c": 14,
        "r": 9,
        "layer": "object2"
      },
      {
        "id": "tile_interactive_storage_locker",
        "c": 28,
        "r": 9,
        "layer": "object2"
      },
      {
        "id": "tile_interactive_storage_locker",
        "c": 31,
        "r": 9,
        "layer": "object2"
      },
      {
        "id": "tile_interactive_storage_locker",
        "c": 46,
        "r": 17,
        "layer": "object2"
      },
      {
        "id": "tile_interactive_storage_locker",
        "c": 82,
        "r": 35,
        "layer": "object2"
      },
      {
        "id": "tile_interactive_storage_locker",
        "c": 57,
        "r": 30,
        "layer": "object2",
        "ox": 0,
        "oy": -22
      },
      {
        "id": "tile_interactive_storage_locker",
        "c": 80,
        "r": 75,
        "layer": "object2",
        "ox": 0,
        "oy": -10
      },
      {
        "id": "tile_interactive_storage_locker",
        "c": 84,
        "r": 75,
        "layer": "object2",
        "ox": 0,
        "oy": -12
      },
      {
        "id": "tile_field_ammo_crate",
        "c": 83,
        "r": 76,
        "layer": "object2",
        "ox": -18,
        "oy": -16
      },
      {
        "id": "tile_field_ammo_crate",
        "c": 83,
        "r": 62,
        "layer": "object2",
        "ox": 0,
        "oy": -18
      },
      {
        "id": "tile_field_ammo_crate",
        "c": 75,
        "r": 62,
        "layer": "object2",
        "ox": 0,
        "oy": -18
      },
      {
        "id": "tile_field_ammo_crate",
        "c": 71,
        "r": 76,
        "layer": "object2"
      },
      {
        "id": "tile_field_ammo_crate",
        "c": 58,
        "r": 83,
        "layer": "ground2"
      },
      {
        "id": "tile_field_ammo_crate",
        "c": 41,
        "r": 53,
        "layer": "object2"
      },
      {
        "id": "tile_field_ammo_crate",
        "c": 33,
        "r": 43,
        "layer": "object2"
      },
      {
        "id": "tile_field_ammo_crate",
        "c": 47,
        "r": 24,
        "layer": "object2"
      },
      {
        "id": "tile_field_ammo_crate",
        "c": 65,
        "r": 6,
        "layer": "object2"
      },
      {
        "id": "tile_mr4ct8od",
        "c": 57,
        "r": 80,
        "layer": "ground"
      },
      {
        "id": "tile_mr4ct8od",
        "c": 57,
        "r": 78,
        "layer": "ground"
      },
      {
        "id": "tile_mr4ct8od",
        "c": 57,
        "r": 76,
        "layer": "ground"
      },
      {
        "id": "tile_mr4ct8od",
        "c": 57,
        "r": 74,
        "layer": "ground"
      },
      {
        "id": "tile_mr4cyc49",
        "c": 61,
        "r": 80,
        "layer": "ground"
      },
      {
        "id": "tile_mr4cyc49",
        "c": 61,
        "r": 78,
        "layer": "ground"
      },
      {
        "id": "tile_mr4cyc49",
        "c": 61,
        "r": 76,
        "layer": "ground"
      },
      {
        "id": "tile_mr4cyc49",
        "c": 61,
        "r": 74,
        "layer": "ground"
      },
      {
        "id": "tile_mr4ct8od",
        "c": 57,
        "r": 64,
        "layer": "ground"
      },
      {
        "id": "tile_mr4ct8od",
        "c": 57,
        "r": 62,
        "layer": "ground"
      },
      {
        "id": "tile_mr4cyc49",
        "c": 61,
        "r": 64,
        "layer": "ground"
      },
      {
        "id": "tile_mr4cyc49",
        "c": 61,
        "r": 62,
        "layer": "ground"
      },
      {
        "id": "tile_dmg_broken_wall_right",
        "c": 52,
        "r": 75,
        "layer": "ground3"
      },
      {
        "id": "tile_dmg_broken_wall_left",
        "c": 69,
        "r": 70,
        "layer": "ground3"
      },
      {
        "id": "tile_dmg_broken_wall_left",
        "c": 66,
        "r": 60,
        "layer": "ground3"
      },
      {
        "id": "tile_dmg_broken_wall_left",
        "c": 39,
        "r": 53,
        "layer": "object4"
      },
      {
        "id": "tile_field_ammo_crate",
        "c": 49,
        "r": 31,
        "layer": "ground3"
      },
      {
        "id": "tile_field_ammo_crate",
        "c": 71,
        "r": 57,
        "layer": "ground3"
      },
      {
        "id": "tile_field_ammo_crate",
        "c": 95,
        "r": 39,
        "layer": "ground3"
      },
      {
        "id": "tile_field_ammo_crate",
        "c": 86,
        "r": 39,
        "layer": "ground3"
      },
      {
        "id": "tile_field_ammo_crate",
        "c": 84,
        "r": 10,
        "layer": "ground3"
      },
      {
        "id": "tile_field_ammo_crate",
        "c": 92,
        "r": 10,
        "layer": "ground3"
      },
      {
        "id": "tile_interactive_power_switch_off",
        "c": 38,
        "r": 37,
        "layer": "object3",
        "circuit": 4
      },
      {
        "id": "tile_interactive_power_switch_off",
        "c": 87,
        "r": 75,
        "layer": "object3",
        "circuit": 1
      },
      {
        "id": "tile_interactive_power_switch_off",
        "c": 80,
        "r": 26,
        "layer": "object3",
        "circuit": 2
      },
      {
        "id": "tile_interactive_power_switch_off",
        "c": 59,
        "r": 30,
        "layer": "object3",
        "circuit": 3
      },
      {
        "id": "tile_interactive_electric_light_02",
        "c": 73,
        "r": 65,
        "layer": "overlay",
        "circuit": 1
      },
      {
        "id": "tile_interactive_electric_light_02",
        "c": 86,
        "r": 66,
        "layer": "overlay",
        "circuit": 1
      },
      {
        "id": "tile_interactive_electric_light_02",
        "c": 92,
        "r": 66,
        "layer": "overlay",
        "circuit": 1
      },
      {
        "id": "tile_interactive_electric_light_02",
        "c": 82,
        "r": 74,
        "layer": "overlay",
        "circuit": 1
      },
      {
        "id": "tile_interactive_electric_light_02",
        "c": 89,
        "r": 79,
        "layer": "overlay",
        "circuit": 1
      },
      {
        "id": "tile_interactive_electric_light_02",
        "c": 78,
        "r": 53,
        "layer": "overlay",
        "circuit": 1
      },
      {
        "id": "tile_interactive_electric_light_02",
        "c": 72,
        "r": 43,
        "layer": "overlay",
        "circuit": 2
      },
      {
        "id": "tile_interactive_electric_light_02",
        "c": 61,
        "r": 57,
        "layer": "overlay",
        "circuit": 1
      },
      {
        "id": "tile_interactive_electric_light_02",
        "c": 84,
        "r": 17,
        "layer": "overlay",
        "circuit": 2
      },
      {
        "id": "tile_interactive_electric_light_02",
        "c": 91,
        "r": 17,
        "layer": "overlay",
        "circuit": 2
      },
      {
        "id": "tile_interactive_electric_light_02",
        "c": 77,
        "r": 25,
        "layer": "overlay",
        "circuit": 2
      },
      {
        "id": "tile_interactive_electric_light_02",
        "c": 73,
        "r": 25,
        "layer": "overlay",
        "circuit": 2
      },
      {
        "id": "tile_interactive_electric_light_02",
        "c": 60,
        "r": 21,
        "layer": "overlay",
        "circuit": 2
      },
      {
        "id": "tile_interactive_electric_light_02",
        "c": 73,
        "r": 33,
        "layer": "overlay",
        "circuit": 2
      },
      {
        "id": "tile_interactive_electric_light_02",
        "c": 46,
        "r": 16,
        "layer": "overlay"
      },
      {
        "id": "tile_interactive_electric_light_02",
        "c": 48,
        "r": 24,
        "layer": "overlay",
        "circuit": 3
      },
      {
        "id": "tile_interactive_electric_light_02",
        "c": 55,
        "r": 33,
        "layer": "overlay",
        "circuit": 3
      },
      {
        "id": "tile_interactive_electric_light_02",
        "c": 48,
        "r": 42,
        "layer": "overlay",
        "circuit": 3
      },
      {
        "id": "tile_interactive_electric_light_02",
        "c": 49,
        "r": 50,
        "layer": "overlay",
        "circuit": 3
      },
      {
        "id": "tile_interactive_electric_light_02",
        "c": 40,
        "r": 48,
        "layer": "overlay",
        "circuit": 3
      },
      {
        "id": "tile_interactive_electric_light_02",
        "c": 31,
        "r": 62,
        "layer": "overlay",
        "circuit": 3
      },
      {
        "id": "tile_interactive_electric_light_02",
        "c": 40,
        "r": 36,
        "layer": "overlay",
        "circuit": 4
      },
      {
        "id": "tile_interactive_electric_light_02",
        "c": 10,
        "r": 30,
        "layer": "overlay",
        "circuit": 4
      },
      {
        "id": "tile_interactive_electric_light_02",
        "c": 32,
        "r": 30,
        "layer": "overlay",
        "circuit": 4
      },
      {
        "id": "tile_interactive_electric_light_02",
        "c": 21,
        "r": 30,
        "layer": "overlay",
        "circuit": 4
      },
      {
        "id": "tile_interactive_electric_light_02",
        "c": 30,
        "r": 48,
        "layer": "overlay",
        "circuit": 4
      },
      {
        "id": "tile_bg_electric_light",
        "c": 25,
        "r": 62,
        "layer": "overlay"
      },
      {
        "id": "tile_bg_electric_light",
        "c": 28,
        "r": 62,
        "layer": "overlay"
      },
      {
        "id": "tile_bg_electric_light",
        "c": 30,
        "r": 68,
        "layer": "overlay"
      },
      {
        "id": "tile_bg_electric_light",
        "c": 49,
        "r": 65,
        "layer": "overlay"
      },
      {
        "id": "tile_bg_electric_light",
        "c": 44,
        "r": 65,
        "layer": "overlay"
      },
      {
        "id": "tile_bg_electric_light",
        "c": 36,
        "r": 68,
        "layer": "overlay"
      },
      {
        "id": "tile_bg_electric_light",
        "c": 42,
        "r": 68,
        "layer": "overlay"
      },
      {
        "id": "tile_bg_electric_light",
        "c": 16,
        "r": 76,
        "layer": "overlay"
      },
      {
        "id": "tile_bg_electric_light",
        "c": 69,
        "r": 65,
        "layer": "overlay"
      },
      {
        "id": "tile_bg_electric_light",
        "c": 75,
        "r": 60,
        "layer": "overlay"
      },
      {
        "id": "tile_bg_electric_light",
        "c": 15,
        "r": 30,
        "layer": "overlay"
      },
      {
        "id": "tile_bg_electric_light",
        "c": 27,
        "r": 30,
        "layer": "overlay"
      },
      {
        "id": "tile_bg_electric_light",
        "c": 18,
        "r": 8,
        "layer": "overlay"
      },
      {
        "id": "tile_bg_electric_light",
        "c": 24,
        "r": 8,
        "layer": "overlay"
      },
      {
        "id": "tile_bg_electric_light",
        "c": 34,
        "r": 8,
        "layer": "overlay"
      },
      {
        "id": "tile_bg_electric_light",
        "c": 9,
        "r": 8,
        "layer": "overlay"
      },
      {
        "id": "tile_street_folding_table",
        "c": 43,
        "r": 20,
        "layer": "object3",
        "ox": -2,
        "oy": 8
      },
      {
        "id": "tile_street_stall_steak",
        "c": 20,
        "r": 8,
        "layer": "object2",
        "ox": 4,
        "oy": 16
      },
      {
        "id": "tile_street_folding_table",
        "c": 14,
        "r": 15,
        "layer": "object2"
      },
      {
        "id": "tile_street_folding_table",
        "c": 14,
        "r": 21,
        "layer": "object2"
      },
      {
        "id": "tile_street_folding_table",
        "c": 24,
        "r": 15,
        "layer": "object2"
      },
      {
        "id": "tile_street_folding_table",
        "c": 24,
        "r": 21,
        "layer": "object2"
      },
      {
        "id": "tile_street_plastic_stools_stacked",
        "c": 23,
        "r": 10,
        "layer": "object2"
      },
      {
        "id": "tile_street_plastic_stools_stacked",
        "c": 24,
        "r": 10,
        "layer": "object2"
      },
      {
        "id": "tile_street_plastic_stools_stacked",
        "c": 19,
        "r": 10,
        "layer": "object2"
      },
      {
        "id": "tile_dmg_broken_wall_left",
        "c": 63,
        "r": 20,
        "layer": "object4",
        "fx": true,
        "ox": 0,
        "oy": 6
      },
      {
        "id": "tile_street_bollard_yellow",
        "c": 51,
        "r": 58,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_street_bollard_yellow",
        "c": 52,
        "r": 58,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_street_bollard_yellow",
        "c": 55,
        "r": 58,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_street_bollard_yellow",
        "c": 56,
        "r": 58,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_street_claw_machine",
        "c": 84,
        "r": 18,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_street_claw_machine",
        "c": 34,
        "r": 9,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_dmg_rubble_rocks",
        "c": 54,
        "r": 78,
        "layer": "ground5",
        "fx": true
      },
      {
        "id": "tile_dmg_rubble_rocks",
        "c": 65,
        "r": 63,
        "layer": "ground5",
        "fx": true
      },
      {
        "id": "tile_dmg_rubble_rocks",
        "c": 86,
        "r": 79,
        "layer": "ground5",
        "fx": true
      },
      {
        "id": "tile_dmg_rubble_rocks",
        "c": 90,
        "r": 51,
        "layer": "ground5",
        "fx": true
      },
      {
        "id": "tile_dmg_rubble_rocks",
        "c": 83,
        "r": 33,
        "layer": "ground5",
        "fx": true
      },
      {
        "id": "tile_dmg_rubble_rocks",
        "c": 64,
        "r": 20,
        "layer": "ground5",
        "fx": true
      },
      {
        "id": "tile_dmg_rubble_rocks",
        "c": 48,
        "r": 29,
        "layer": "ground5",
        "fx": true
      },
      {
        "id": "tile_dmg_rubble_rocks",
        "c": 38,
        "r": 56,
        "layer": "ground5",
        "fx": true
      },
      {
        "id": "tile_dmg_rubble_pile_medium",
        "c": 52,
        "r": 80,
        "layer": "ground5",
        "fx": true
      },
      {
        "id": "tile_dmg_rubble_pile_medium",
        "c": 86,
        "r": 50,
        "layer": "ground5",
        "fx": true
      },
      {
        "id": "tile_dmg_rubble_brick_chunks",
        "c": 70,
        "r": 56,
        "layer": "ground5",
        "fx": true
      },
      {
        "id": "tile_dmg_rubble_brick_chunks",
        "c": 30,
        "r": 55,
        "layer": "ground5",
        "fx": true
      },
      {
        "id": "tile_dmg_rubble_brick_chunks",
        "c": 15,
        "r": 64,
        "layer": "ground5",
        "fx": true
      },
      {
        "id": "tile_dmg_rubble_brick_chunks",
        "c": 43,
        "r": 25,
        "layer": "ground5",
        "fx": true
      },
      {
        "id": "tile_dmg_rubble_chips_02",
        "c": 66,
        "r": 76,
        "layer": "ground5",
        "fx": true
      },
      {
        "id": "tile_dmg_rubble_chips_02",
        "c": 82,
        "r": 68,
        "layer": "ground5",
        "fx": true
      },
      {
        "id": "tile_dmg_rubble_chips_02",
        "c": 81,
        "r": 81,
        "layer": "ground5",
        "fx": true
      },
      {
        "id": "tile_dmg_rubble_chips_02",
        "c": 90,
        "r": 53,
        "layer": "ground5",
        "fx": true
      },
      {
        "id": "tile_dmg_rubble_chips_02",
        "c": 93,
        "r": 22,
        "layer": "ground5",
        "fx": true
      },
      {
        "id": "tile_dmg_rubble_chips_02",
        "c": 29,
        "r": 14,
        "layer": "ground5",
        "fx": true
      },
      {
        "id": "tile_dmg_rubble_chips_02",
        "c": 33,
        "r": 24,
        "layer": "ground5",
        "fx": true
      },
      {
        "id": "tile_dmg_rubble_strip",
        "c": 19,
        "r": 62,
        "layer": "ground5",
        "fx": true
      },
      {
        "id": "tile_dmg_rubble_strip",
        "c": 52,
        "r": 63,
        "layer": "ground5",
        "fx": true
      },
      {
        "id": "tile_dmg_rubble_strip",
        "c": 93,
        "r": 35,
        "layer": "ground5",
        "fx": true
      },
      {
        "id": "tile_dmg_rubble_strip",
        "c": 16,
        "r": 33,
        "layer": "ground5",
        "fx": true
      },
      {
        "id": "tile_dmg_floor_crater",
        "c": 91,
        "r": 30,
        "layer": "ground5",
        "fx": true
      },
      {
        "id": "tile_dmg_floor_crater",
        "c": 9,
        "r": 22,
        "layer": "ground5",
        "fx": true
      },
      {
        "id": "tile_dmg_floor_crater",
        "c": 20,
        "r": 14,
        "layer": "ground5",
        "fx": true
      },
      {
        "id": "tile_dmg_floor_crater",
        "c": 33,
        "r": 58,
        "layer": "ground5",
        "fx": true
      },
      {
        "id": "tile_dmg_rubble_scatter",
        "c": 25,
        "r": 82,
        "layer": "ground5",
        "fx": true
      },
      {
        "id": "tile_dmg_floor_crater",
        "c": 21,
        "r": 80,
        "layer": "ground5",
        "fx": true
      },
      {
        "id": "tile_dmg_rubble_pile_medium",
        "c": 19,
        "r": 82,
        "layer": "ground5"
      },
      {
        "id": "tile_dmg_rubble_rocks",
        "c": 6,
        "r": 80,
        "layer": "ground5"
      },
      {
        "id": "tile_dmg_rubble_pile_medium",
        "c": 7,
        "r": 81,
        "layer": "ground5"
      },
      {
        "id": "tile_dmg_rubble_scatter",
        "c": 12,
        "r": 82,
        "layer": "ground5"
      },
      {
        "id": "tile_dmg_rubble_scatter",
        "c": 40,
        "r": 71,
        "layer": "ground5"
      },
      {
        "id": "tile_dmg_rubble_scatter",
        "c": 42,
        "r": 33,
        "layer": "ground5"
      },
      {
        "id": "tile_dmg_rubble_scatter",
        "c": 64,
        "r": 26,
        "layer": "ground5"
      },
      {
        "id": "tile_dmg_floor_crater",
        "c": 70,
        "r": 12,
        "layer": "ground5"
      },
      {
        "id": "tile_dmg_floor_crater",
        "c": 69,
        "r": 22,
        "layer": "ground5"
      },
      {
        "id": "tile_dmg_rubble_pile_medium",
        "c": 66,
        "r": 49,
        "layer": "ground5"
      },
      {
        "id": "tile_dmg_floor_crater",
        "c": 51,
        "r": 49,
        "layer": "ground5"
      },
      {
        "id": "tile_dmg_floor_crater",
        "c": 53,
        "r": 42,
        "layer": "ground5"
      },
      {
        "id": "tile_dmg_floor_crater",
        "c": 57,
        "r": 34,
        "layer": "ground5"
      }
    ],
    "solid": [],
    "breakable": [],
    "coreSpots": [],
    "spawnZone": [],
    "coreCount": 1,
    "monsterMix": [
      {
        "id": "slime",
        "weight": 70
      },
      {
        "id": "bird_head",
        "weight": 80
      },
      {
        "id": "pearl_kid",
        "weight": 80
      },
      {
        "id": "fish_head",
        "weight": 80
      },
      {
        "id": "milkfish_kid",
        "weight": 80
      }
    ],
    "camp": [],
    "rules": {
      "money": 3000,
      "guide": 100,
      "guideRegen": 9,
      "speed": 44,
      "reward": 8
    },
    "solidOffsets": {},
    "safe": false,
    "npcs": false,
    "portals": [
      {
        "c": 51,
        "r": 10,
        "to": "map_mvnjr2ze"
      }
    ],
    "hiddenPickups": [],
    "cols": 100,
    "rows": 89,
    "layerOrder": [
      {
        "id": "floor",
        "name": "🟫 地板"
      },
      {
        "id": "ground",
        "name": "🌿 地面裝飾"
      },
      {
        "id": "ground2",
        "name": "🍂 地面裝飾 2"
      },
      {
        "id": "ground5",
        "name": "裂痕"
      },
      {
        "id": "ground3",
        "name": "🩹 地面裝飾 3"
      },
      {
        "id": "ground4",
        "name": "隱藏地板",
        "secret": true
      },
      {
        "id": "object5",
        "name": "隱藏區",
        "secret": true
      },
      {
        "id": "object6",
        "name": "隱藏門",
        "secret": true
      },
      {
        "id": "object",
        "name": "📦 物件"
      },
      {
        "id": "object2",
        "name": "🧰 物件 2"
      },
      {
        "id": "object3",
        "name": "🪑 物件 3"
      },
      {
        "id": "object4",
        "name": "🚧 物件 4"
      },
      {
        "id": "overlay",
        "name": "🎯 物件裝飾"
      },
      {
        "id": "top",
        "name": "☁️ 上層"
      }
    ]
  }
];
// 刪掉的地圖：別人的編輯器打開時，瀏覽器暫存裡的這幾張也會跟著刪掉，不會再被補回來
const BATTLE_MAPS_DELETED = ["map_mvp7r4j0"];
