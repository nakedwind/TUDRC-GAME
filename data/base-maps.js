/* ===== 基地地圖：磚塊與地圖資料（由「🏠 基地編輯器」匯出）=====
   只放基地（安全區域）的地圖；戰鬥地圖在 data/maps.js，由「🗺️ 地圖編輯器」管理。
   整段貼回 data/base-maps.js 覆蓋即可。 */
const BASE_TILES = [
  {
    "id": "tile_mr4ct8od",
    "name": "Back-room-floor-01",
    "role": "floor",
    "file": "images/background/Back-room-floor-01.png",
    "w": 3,
    "h": 1
  },
  {
    "id": "tile_mr4cyc49",
    "name": "Back-room-floor-02",
    "role": "floor",
    "file": "images/background/Back-room-floor-02.png",
    "w": 3,
    "h": 1
  },
  {
    "id": "tile_mr4cyq54",
    "name": "Back-room-Pillar",
    "role": "floor",
    "file": "images/background/Back-room-Pillar.png",
    "w": 1,
    "h": 4
  },
  {
    "id": "tile_mr4cyu5g",
    "name": "Back-room-Pillar-02",
    "role": "floor",
    "file": "images/background/Back-room-Pillar-02.png",
    "w": 1,
    "h": 3
  },
  {
    "id": "tile_mr4cyy36",
    "name": "Back-room-wall",
    "role": "floor",
    "file": "images/background/Back-room-wall.png",
    "w": 1,
    "h": 3
  },
  {
    "id": "tile_mr4czvpx",
    "name": "Back-room-wall-02",
    "role": "floor",
    "file": "images/background/Back-room-wall-02.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_mr4ja2cb",
    "name": "roadblocks",
    "role": "floor",
    "file": "images/item-obstacle/04roadblocks.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_mu4yyr9r",
    "name": "box02",
    "role": "floor",
    "file": "images/item-decorate/box02.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_mu4yzgcg",
    "name": "box01",
    "role": "floor",
    "file": "images/item-decorate/box01.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_mu4z0uc9",
    "name": "gasstove",
    "role": "floor",
    "file": "images/item-decorate/gasstove.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_decor_emptybox",
    "name": "空箱",
    "role": "floor",
    "file": "images/item-decorate/emptybox.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_decor_foldingchair",
    "name": "折疊椅",
    "role": "floor",
    "file": "images/item-decorate/Foldingchair.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_decor_gasstove02",
    "name": "爐具 2",
    "role": "floor",
    "file": "images/item-decorate/gasstove02.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_decor_medicalkit",
    "name": "醫療箱",
    "role": "floor",
    "file": "images/item-decorate/Medicalkit.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_decor_waterboxes",
    "name": "水箱",
    "role": "floor",
    "file": "images/scene-props/Waterboxes.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_obstacle_wirecloth_h",
    "name": "鐵絲網（橫）",
    "role": "floor",
    "file": "images/item-obstacle/01-wirecloth.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_obstacle_wirecloth_v",
    "name": "鐵絲網（直）",
    "role": "floor",
    "file": "images/item-obstacle/01-wirecloth-vertical.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_obstacle_redroadblocks_h",
    "name": "紅色路障（橫）",
    "role": "floor",
    "file": "images/item-obstacle/02-redroadblocks.png",
    "w": 2,
    "h": 1
  },
  {
    "id": "tile_obstacle_redroadblocks_v",
    "name": "紅色路障（直）",
    "role": "floor",
    "file": "images/item-obstacle/02-redroadblocks-vertical.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_obstacle_wirefence_h",
    "name": "鐵圍籬（橫）",
    "role": "floor",
    "file": "images/item-obstacle/03-wirefence.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_obstacle_wirefence_v",
    "name": "鐵圍籬（直）",
    "role": "floor",
    "file": "images/item-obstacle/03wire-fence-vertical.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_obstacle_roadblocks_v",
    "name": "路障（直）",
    "role": "floor",
    "file": "images/item-obstacle/04-roadblocks - vertical.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_obstacle_barricades_h",
    "name": "拒馬（橫）",
    "role": "floor",
    "file": "images/item-obstacle/05-barricades.png",
    "w": 2,
    "h": 3
  },
  {
    "id": "tile_obstacle_barricades_v",
    "name": "拒馬（直）",
    "role": "floor",
    "file": "images/item-obstacle/05-barricades-vertical.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_obstacle_barricades02",
    "name": "拒馬 2",
    "role": "floor",
    "file": "images/item-obstacle/05-barricades02.png",
    "w": 2,
    "h": 3
  },
  {
    "id": "tile_obstacle_searchlight_h",
    "name": "探照燈（橫）",
    "role": "floor",
    "file": "images/item-obstacle/06-searchlight.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_obstacle_searchlight_v",
    "name": "探照燈（直）",
    "role": "floor",
    "file": "images/item-obstacle/06-searchlight-vertical.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_obstacle_camping_lights",
    "name": "露營燈",
    "role": "floor",
    "file": "images/item-obstacle/07-Camping lights.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_new_bg_floor",
    "name": "車站地磚",
    "role": "floor",
    "file": "images/background/station-floor.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_new_bg_wall_front_edge",
    "name": "牆面前緣",
    "role": "floor",
    "file": "images/background/station-wall-front-edge.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_new_bg_wall_corner",
    "name": "牆面轉角",
    "role": "floor",
    "file": "images/background/station-wall-corner.png",
    "w": 1,
    "h": 3
  },
  {
    "id": "tile_new_bg_wall",
    "name": "車站牆面",
    "role": "floor",
    "file": "images/background/station-wall.png",
    "w": 1,
    "h": 4
  },
  {
    "id": "tile_new_bg_window",
    "name": "車站窗戶",
    "role": "floor",
    "file": "images/background/station-window.png",
    "w": 3,
    "h": 2
  },
  {
    "id": "tile_new_decor_rock01",
    "name": "碎石 1",
    "role": "floor",
    "file": "images/破損建築/rock01.png",
    "w": 1,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_new_decor_rock02",
    "name": "碎石 2",
    "role": "floor",
    "file": "images/破損建築/rock02.png",
    "w": 2,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_new_decor_rock03",
    "name": "碎石 3",
    "role": "floor",
    "file": "images/破損建築/rock03.png",
    "w": 2,
    "h": 2,
    "flat": true
  },
  {
    "id": "tile_new_decor_refrigerator",
    "name": "冰箱",
    "role": "floor",
    "file": "images/scene-props/refrigerator.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_new_decor_coffee_cup",
    "name": "咖啡杯",
    "role": "floor",
    "file": "images/scene-props/coffee-cup.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_new_decor_coffee_machine",
    "name": "咖啡機",
    "role": "floor",
    "file": "images/scene-props/coffee-machine.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_new_decor_oil_drum",
    "name": "油桶",
    "role": "floor",
    "file": "images/item-decorate/oil-drum.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_new_decor_plant01",
    "name": "盆栽 1",
    "role": "floor",
    "file": "images/item-decorate/plant01.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_new_decor_plant02",
    "name": "盆栽 2",
    "role": "floor",
    "file": "images/scene-props/plant02.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_new_decor_plant03",
    "name": "盆栽 3",
    "role": "floor",
    "file": "images/scene-props/plant03.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_new_decor_table",
    "name": "桌子",
    "role": "floor",
    "file": "images/scene-props/table.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_new_decor_fire_extinguisher",
    "name": "滅火器",
    "role": "floor",
    "file": "images/scene-props/fire-extinguisher.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_new_decor_exit_sign",
    "name": "逃生指示燈",
    "role": "floor",
    "file": "images/scene-props/exit-sign.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_new_decor_vending_red",
    "name": "紅色販賣機",
    "role": "floor",
    "file": "images/scene-props/vending-machine-red.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_new_decor_vending_green",
    "name": "綠色販賣機",
    "role": "floor",
    "file": "images/scene-props/vending-machine-green.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_new_decor_chair_front",
    "name": "椅子（正面）",
    "role": "floor",
    "file": "images/scene-props/chair-front.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_new_decor_chair_side",
    "name": "椅子（側面）",
    "role": "floor",
    "file": "images/scene-props/chair-side.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_new_decor_crack01",
    "name": "地面裂痕 1",
    "role": "floor",
    "file": "images/破損建築/crack01.png",
    "w": 2,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_new_decor_crack02",
    "name": "地面裂痕 2",
    "role": "floor",
    "file": "images/破損建築/crack02.png",
    "w": 2,
    "h": 2,
    "flat": true
  },
  {
    "id": "tile_new_decor_crack03",
    "name": "地面裂痕 3",
    "role": "floor",
    "file": "images/破損建築/crack03.png",
    "w": 6,
    "h": 4,
    "flat": true
  },
  {
    "id": "tile_new_decor_crack04",
    "name": "地面裂痕 4",
    "role": "floor",
    "file": "images/破損建築/crack04.png",
    "w": 3,
    "h": 3,
    "flat": true
  },
  {
    "id": "tile_new_decor_water_dispenser",
    "name": "飲水機",
    "role": "floor",
    "file": "images/scene-props/water-dispenser.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_new_decor_poster",
    "name": "宣導海報",
    "role": "floor",
    "file": "images/scene-props/anti-harassment-poster.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_new_decor_box_three",
    "name": "三個小箱",
    "role": "floor",
    "file": "images/item-decorate/box-three-small.png",
    "w": 2,
    "h": 1
  },
  {
    "id": "tile_new_decor_box_large",
    "name": "大型紙箱",
    "role": "floor",
    "file": "images/item-decorate/box-large.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_new_decor_box_small_diagonal",
    "name": "斜放小箱",
    "role": "floor",
    "file": "images/item-decorate/box-small-diagonal.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_new_decor_box_medium",
    "name": "中型紙箱",
    "role": "floor",
    "file": "images/item-decorate/box-medium.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_new_decor_box_side",
    "name": "側放紙箱",
    "role": "floor",
    "file": "images/item-decorate/box-side.png",
    "w": 2,
    "h": 1
  },
  {
    "id": "tile_new_decor_cabinet_tall_metal",
    "name": "高鐵櫃",
    "role": "floor",
    "file": "images/scene-props/cabinet-tall-metal.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_new_decor_cabinet_tall",
    "name": "高櫃",
    "role": "floor",
    "file": "images/scene-props/cabinet-tall.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_new_decor_cabinet_low",
    "name": "矮櫃",
    "role": "floor",
    "file": "images/scene-props/cabinet-low.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_station_hall_color_brown",
    "name": "大廳棕色塊",
    "role": "floor",
    "file": "images/01-station-hall/color-brown.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_station_hall_counter",
    "name": "車站櫃台",
    "role": "floor",
    "file": "images/01-station-hall/counter.png",
    "w": 2,
    "h": 3
  },
  {
    "id": "tile_station_hall_floor02",
    "name": "大廳地板 2",
    "role": "floor",
    "file": "images/01-station-hall/floor-02.png",
    "w": 2,
    "h": 2,
    "flat": true
  },
  {
    "id": "tile_station_hall_floor_corner",
    "name": "地板轉角",
    "role": "floor",
    "file": "images/01-station-hall/floor-corner.png",
    "w": 1,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_station_hall_floor_edge",
    "name": "地板邊緣",
    "role": "floor",
    "file": "images/01-station-hall/floor-edge.png",
    "w": 1,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_station_hall_lightbox",
    "name": "大廳告示燈箱",
    "role": "floor",
    "file": "images/01-station-hall/lightbox.png",
    "w": 2,
    "h": 4
  },
  {
    "id": "tile_station_hall_pillar",
    "name": "大廳高柱",
    "role": "floor",
    "file": "images/01-station-hall/pillar.png",
    "w": 2,
    "h": 8
  },
  {
    "id": "tile_station_hall_red_line01",
    "name": "紅線裝飾 1",
    "role": "floor",
    "file": "images/01-station-hall/red-line-01.png",
    "w": 1,
    "h": 2,
    "flat": true
  },
  {
    "id": "tile_station_hall_red_line02",
    "name": "紅線裝飾 2",
    "role": "floor",
    "file": "images/01-station-hall/red-line-02.png",
    "w": 2,
    "h": 2,
    "flat": true
  },
  {
    "id": "tile_station_hall_floor",
    "name": "大廳主地板",
    "role": "floor",
    "file": "images/01-station-hall/station-hall-floor.png",
    "w": 2,
    "h": 2,
    "flat": true
  },
  {
    "id": "tile_station_hall_wall02",
    "name": "大廳牆磚 2",
    "role": "floor",
    "file": "images/01-station-hall/wall-tile-02.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_station_hall_wall03",
    "name": "大廳牆磚 3",
    "role": "floor",
    "file": "images/01-station-hall/wall-tile-03.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_mu563g4x",
    "name": "floor-edge02",
    "role": "floor",
    "file": "images/01-station-hall/floor-edge02.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_new_decor_station_timetable_board",
    "name": "車站時刻表看板",
    "role": "decor",
    "file": "images/scene-props/station-timetable-board.png",
    "w": 5,
    "h": 3
  },
  {
    "id": "tile_new_decor_station_timetable_base",
    "name": "時刻表底座",
    "role": "decor",
    "file": "images/scene-props/station-timetable-base.png",
    "w": 1,
    "h": 3
  },
  {
    "id": "tile_mu5e3ndv",
    "name": "station-wall-Pillar",
    "role": "floor",
    "file": "images/background/station-wall-Pillar.png",
    "w": 1,
    "h": 4
  },
  {
    "id": "tile_new_decor_person",
    "name": "人物",
    "role": "floor",
    "file": "images/scene-props/person.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "color_mu8nx3ez",
    "name": "色塊",
    "role": "floor",
    "color": "#000000",
    "w": 0.5,
    "h": 0.5,
    "systemColor": true,
    "flat": true
  },
  {
    "id": "color_mu8nxukw",
    "name": "色塊",
    "role": "floor",
    "color": "#000000",
    "w": 1,
    "h": 4,
    "systemColor": true,
    "flat": true
  },
  {
    "id": "color_mu8nzceg",
    "name": "色塊",
    "role": "floor",
    "color": "#000000",
    "w": 0.5,
    "h": 6,
    "systemColor": true,
    "flat": true
  },
  {
    "id": "tile_mu8rra80",
    "name": "cabinet-low-02",
    "role": "floor",
    "file": "images/scene-props/cabinet-low-02.png",
    "w": 1,
    "h": 4
  },
  {
    "id": "tile_eoc_plant_small_01",
    "name": "小盆栽 1",
    "role": "floor",
    "file": "images/應變中心/plant-small-01.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_eoc_plant_small_02",
    "name": "小盆栽 2",
    "role": "floor",
    "file": "images/應變中心/plant-small-02.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_eoc_bubble_tea",
    "name": "珍奶",
    "role": "floor",
    "file": "images/應變中心/bubble-tea.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_eoc_book_stack",
    "name": "書堆",
    "role": "floor",
    "file": "images/應變中心/book-stack.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_eoc_tea_tray",
    "name": "茶盤",
    "role": "floor",
    "file": "images/應變中心/tea-tray.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_eoc_mug",
    "name": "馬克杯",
    "role": "floor",
    "file": "images/應變中心/mug.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_eoc_pen",
    "name": "筆",
    "role": "floor",
    "file": "images/應變中心/pen.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_eoc_pen_holder",
    "name": "筆筒",
    "role": "floor",
    "file": "images/應變中心/pen-holder.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_eoc_tissue_box",
    "name": "面紙盒",
    "role": "floor",
    "file": "images/應變中心/tissue-box.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_eoc_binder_row",
    "name": "檔案夾",
    "role": "floor",
    "file": "images/應變中心/binder-row.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_eoc_walkie_talkie",
    "name": "無線電",
    "role": "floor",
    "file": "images/應變中心/walkie-talkie.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_eoc_first_aid_bag",
    "name": "急救包",
    "role": "floor",
    "file": "images/應變中心/first-aid-bag.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_eoc_security_camera",
    "name": "監視器",
    "role": "floor",
    "file": "images/應變中心/security-camera.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_eoc_office_chair_black",
    "name": "辦公椅（黑）",
    "role": "floor",
    "file": "images/應變中心/office-chair-black.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_eoc_office_chair_grey",
    "name": "辦公椅（灰）",
    "role": "floor",
    "file": "images/應變中心/office-chair-grey.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_eoc_filing_cabinet",
    "name": "文件櫃",
    "role": "floor",
    "file": "images/應變中心/filing-cabinet.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_eoc_drawer_unit",
    "name": "三抽櫃",
    "role": "floor",
    "file": "images/應變中心/drawer-unit.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_eoc_floor_lamp",
    "name": "立燈",
    "role": "floor",
    "file": "images/應變中心/floor-lamp.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_eoc_locker",
    "name": "置物櫃",
    "role": "floor",
    "file": "images/應變中心/locker.png",
    "w": 1,
    "h": 3
  },
  {
    "id": "tile_eoc_sofa_side",
    "name": "沙發（側）",
    "role": "floor",
    "file": "images/應變中心/sofa-side.png",
    "w": 1,
    "h": 3
  },
  {
    "id": "tile_eoc_sofa",
    "name": "沙發",
    "role": "floor",
    "file": "images/應變中心/sofa.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_eoc_wooden_cabinet",
    "name": "木櫃",
    "role": "floor",
    "file": "images/應變中心/wooden-cabinet.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_eoc_door",
    "name": "門",
    "role": "floor",
    "file": "images/應變中心/door.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_eoc_binder_cabinet",
    "name": "資料櫃",
    "role": "floor",
    "file": "images/應變中心/binder-cabinet.png",
    "w": 2,
    "h": 3
  },
  {
    "id": "tile_eoc_comms_desk",
    "name": "通訊台",
    "role": "floor",
    "file": "images/應變中心/comms-desk.png",
    "w": 2,
    "h": 4
  },
  {
    "id": "tile_eoc_sideboard",
    "name": "木製矮櫃",
    "role": "floor",
    "file": "images/應變中心/sideboard.png",
    "w": 3,
    "h": 2
  },
  {
    "id": "tile_eoc_server_rack",
    "name": "機櫃",
    "role": "floor",
    "file": "images/應變中心/server-rack.png",
    "w": 3,
    "h": 5
  },
  {
    "id": "tile_eoc_supply_shelf",
    "name": "物資貨架",
    "role": "floor",
    "file": "images/應變中心/supply-shelf.png",
    "w": 5,
    "h": 3
  },
  {
    "id": "tile_bg_wall_front_edge02",
    "name": "牆面前緣 2",
    "role": "floor",
    "file": "images/background/station-wall-front-edge02.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_bg_wall_front_edge03",
    "name": "牆面前緣 3",
    "role": "floor",
    "file": "images/background/station-wall-front-edge03.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_dmg_broken_wall_right",
    "name": "破牆（右斷）",
    "role": "floor",
    "file": "images/破損建築/broken-wall-right.png",
    "w": 3,
    "h": 4
  },
  {
    "id": "tile_dmg_broken_wall_left",
    "name": "破牆（左斷）",
    "role": "floor",
    "file": "images/破損建築/broken-wall-left.png",
    "w": 3,
    "h": 4
  },
  {
    "id": "tile_dmg_broken_wall_breach",
    "name": "破牆（破洞）",
    "role": "floor",
    "file": "images/破損建築/broken-wall-breach.png",
    "w": 4,
    "h": 4
  },
  {
    "id": "tile_dmg_broken_pillar_cracked",
    "name": "裂柱",
    "role": "floor",
    "file": "images/破損建築/broken-pillar-cracked.png",
    "w": 1,
    "h": 3
  },
  {
    "id": "tile_dmg_broken_pillar_rebar",
    "name": "斷柱（鋼筋）",
    "role": "floor",
    "file": "images/破損建築/broken-pillar-rebar.png",
    "w": 1,
    "h": 3
  },
  {
    "id": "tile_dmg_crack05",
    "name": "地面裂痕 5",
    "role": "floor",
    "file": "images/破損建築/crack05.png",
    "w": 2,
    "h": 2,
    "flat": true
  },
  {
    "id": "tile_dmg_crack06",
    "name": "地面裂痕 6",
    "role": "floor",
    "file": "images/破損建築/crack06.png",
    "w": 3,
    "h": 2,
    "flat": true
  },
  {
    "id": "tile_dmg_crack07",
    "name": "地面裂痕 7",
    "role": "floor",
    "file": "images/破損建築/crack07.png",
    "w": 3,
    "h": 2,
    "flat": true
  },
  {
    "id": "tile_dmg_floor_crater",
    "name": "地面坑洞",
    "role": "floor",
    "file": "images/破損建築/floor-crater.png",
    "w": 3,
    "h": 2,
    "flat": true
  },
  {
    "id": "tile_dmg_rubble_scatter",
    "name": "碎石散落",
    "role": "floor",
    "file": "images/破損建築/rubble-scatter.png",
    "w": 2,
    "h": 2,
    "flat": true
  },
  {
    "id": "tile_dmg_debris_dust",
    "name": "細碎石屑",
    "role": "floor",
    "file": "images/破損建築/debris-dust.png",
    "w": 1,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_dmg_rubble_strip",
    "name": "碎石帶",
    "role": "floor",
    "file": "images/破損建築/rubble-strip.png",
    "w": 3,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_dmg_rubble_rocks",
    "name": "石塊",
    "role": "floor",
    "file": "images/破損建築/rubble-rocks.png",
    "w": 2,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_dmg_rubble_small",
    "name": "瓦礫（小）",
    "role": "floor",
    "file": "images/破損建築/rubble-small.png",
    "w": 2,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_dmg_rubble_block_dark",
    "name": "焦黑瓦礫",
    "role": "floor",
    "file": "images/破損建築/rubble-block-dark.png",
    "w": 2,
    "h": 1
  },
  {
    "id": "tile_dmg_rubble_pile_medium",
    "name": "瓦礫堆（中）",
    "role": "floor",
    "file": "images/破損建築/rubble-pile-medium.png",
    "w": 3,
    "h": 2
  },
  {
    "id": "tile_dmg_rubble_pile_large",
    "name": "瓦礫堆（大）",
    "role": "floor",
    "file": "images/破損建築/rubble-pile-large.png",
    "w": 3,
    "h": 2
  },
  {
    "id": "tile_eoc_pillar",
    "name": "柱子",
    "role": "floor",
    "file": "images/應變中心/eoc-pillar.png",
    "w": 1,
    "h": 5
  },
  {
    "id": "tile_eoc_distance_poster",
    "name": "安全距離海報",
    "role": "floor",
    "file": "images/應變中心/distance-poster.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_eoc_security_door",
    "name": "門（電子鎖）",
    "role": "floor",
    "file": "images/應變中心/door-security.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_eoc_fire_hydrant",
    "name": "消防栓箱",
    "role": "floor",
    "file": "images/應變中心/fire-hydrant-cabinet.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_field_military_tent",
    "name": "軍用帳篷",
    "role": "floor",
    "file": "images/field-camp/military-tent.png",
    "w": 3,
    "h": 3
  },
  {
    "id": "tile_field_camp_bed",
    "name": "行軍床",
    "role": "floor",
    "file": "images/field-camp/camp-bed.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_field_camp_bed_v",
    "name": "行軍床（直）",
    "role": "floor",
    "file": "images/field-camp/camp-bed-vertical.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_field_generator",
    "name": "野戰發電機",
    "role": "floor",
    "file": "images/field-camp/field-generator.png",
    "w": 2,
    "h": 1
  },
  {
    "id": "tile_field_ammo_crate",
    "name": "彈藥箱",
    "role": "floor",
    "file": "images/field-camp/ammo-crate.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_field_base",
    "name": "臨時基地（可破壞）",
    "role": "floor",
    "file": "images/field-camp/field-base.png",
    "w": 11,
    "h": 8,
    "flat": true,
    "baseHp": 2000,
    "baseSolid": [
      [
        0,
        0
      ],
      [
        1,
        0
      ],
      [
        2,
        0
      ],
      [
        3,
        0
      ],
      [
        4,
        0
      ],
      [
        5,
        0
      ],
      [
        6,
        0
      ],
      [
        7,
        0
      ],
      [
        8,
        0
      ],
      [
        9,
        0
      ],
      [
        10,
        0
      ],
      [
        0,
        1
      ],
      [
        10,
        1
      ],
      [
        0,
        2
      ],
      [
        10,
        2
      ],
      [
        0,
        3
      ],
      [
        10,
        3
      ],
      [
        0,
        4
      ],
      [
        10,
        4
      ],
      [
        0,
        5
      ],
      [
        10,
        5
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
        0,
        7
      ],
      [
        1,
        7
      ],
      [
        2,
        7
      ],
      [
        3,
        7
      ],
      [
        7,
        7
      ],
      [
        8,
        7
      ],
      [
        9,
        7
      ],
      [
        10,
        7
      ]
    ],
    "baseDepth": 4
  },
  {
    "id": "tile_counseling_window_blinds",
    "name": "疏導室－百葉窗",
    "role": "floor",
    "file": "images/scene-props/counseling-room/window-blinds.png",
    "w": 3,
    "h": 2
  },
  {
    "id": "tile_counseling_wall_cabinet_counter",
    "name": "疏導室－壁櫃檯面",
    "role": "floor",
    "file": "images/scene-props/counseling-room/wall-cabinet-counter.png",
    "w": 7,
    "h": 2
  },
  {
    "id": "tile_counseling_medical_kit",
    "name": "疏導室－急救箱",
    "role": "floor",
    "file": "images/scene-props/counseling-room/medical-kit.png",
    "w": 2,
    "h": 1
  },
  {
    "id": "tile_counseling_wall_vent",
    "name": "疏導室－通風口",
    "role": "floor",
    "file": "images/scene-props/counseling-room/wall-vent.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_counseling_consultation_desk",
    "name": "疏導室－諮詢桌",
    "role": "floor",
    "file": "images/scene-props/counseling-room/consultation-desk.png",
    "w": 4,
    "h": 2
  },
  {
    "id": "tile_counseling_counselor_chair",
    "name": "疏導室－疏導員座椅",
    "role": "floor",
    "file": "images/scene-props/counseling-room/counselor-chair.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_counseling_visitor_chair",
    "name": "疏導室－訪客椅",
    "role": "floor",
    "file": "images/scene-props/counseling-room/visitor-chair.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_counseling_privacy_curtain_side",
    "name": "疏導室－側向隔簾",
    "role": "floor",
    "file": "images/scene-props/counseling-room/privacy-curtain-side.png",
    "w": 4,
    "h": 7
  },
  {
    "id": "tile_counseling_privacy_curtain_wide",
    "name": "疏導室－橫向隔簾",
    "role": "floor",
    "file": "images/scene-props/counseling-room/privacy-curtain-wide.png",
    "w": 4,
    "h": 3
  },
  {
    "id": "tile_counseling_medical_stool",
    "name": "疏導室－醫療圓凳",
    "role": "floor",
    "file": "images/scene-props/counseling-room/medical-stool.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_counseling_tissue_box",
    "name": "疏導室－面紙盒",
    "role": "floor",
    "file": "images/scene-props/counseling-room/tissue-box-counseling.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_counseling_monitoring_bed",
    "name": "疏導室－負荷監測床",
    "role": "floor",
    "file": "images/scene-props/counseling-room/monitoring-bed.png",
    "w": 2,
    "h": 3
  },
  {
    "id": "tile_counseling_load_monitor",
    "name": "疏導室－負荷監視器",
    "role": "floor",
    "file": "images/scene-props/counseling-room/load-monitor.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_prop_work_table",
    "name": "工作桌",
    "role": "floor",
    "file": "images/scene-props/work-table.png",
    "w": 2,
    "h": 3
  },
  {
    "id": "tile_prop_sofa_beige_side",
    "name": "米色沙發（側）",
    "role": "floor",
    "file": "images/scene-props/sofa-beige-side.png",
    "w": 1,
    "h": 3
  },
  {
    "id": "tile_prop_shelf_locker_unit",
    "name": "層架置物櫃",
    "role": "floor",
    "file": "images/scene-props/shelf-locker-unit.png",
    "w": 2,
    "h": 3
  },
  {
    "id": "tile_prop_tv_monitor",
    "name": "電視",
    "role": "floor",
    "file": "images/scene-props/tv-monitor.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_prop_tv_stand",
    "name": "電視櫃",
    "role": "floor",
    "file": "images/scene-props/tv-stand.png",
    "w": 3,
    "h": 2
  },
  {
    "id": "tile_prop_single_bed",
    "name": "單人床",
    "role": "floor",
    "file": "images/scene-props/single-bed.png",
    "w": 3,
    "h": 2
  },
  {
    "id": "tile_prop_drawer_cabinet",
    "name": "九斗櫃",
    "role": "floor",
    "file": "images/scene-props/drawer-cabinet.png",
    "w": 3,
    "h": 2
  },
  {
    "id": "tile_eoc_hydrant_red",
    "name": "消防栓箱（紅）",
    "role": "floor",
    "file": "images/應變中心/fire-hydrant-red.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_eoc_hydrant_white",
    "name": "消防栓箱（白）",
    "role": "floor",
    "file": "images/應變中心/fire-hydrant-white.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_eoc_book_and_pen",
    "name": "書和筆",
    "role": "floor",
    "file": "images/應變中心/book-and-pen.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_eoc_escape_stairs",
    "name": "逃生樓梯",
    "role": "floor",
    "file": "images/應變中心/escape-stairs.png",
    "w": 5,
    "h": 4
  },
  {
    "id": "tile_eoc_double_door_open",
    "name": "雙開鐵門（開啟）",
    "role": "floor",
    "file": "images/應變中心/double-door-open.png",
    "w": 3,
    "h": 4
  },
  {
    "id": "tile_dorm_desk",
    "name": "書桌",
    "role": "floor",
    "file": "images/宿舍/desk.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_dorm_office_chair_back",
    "name": "辦公椅（背面）",
    "role": "floor",
    "file": "images/宿舍/office-chair-back.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_dorm_chair_blue",
    "name": "藍色椅子",
    "role": "floor",
    "file": "images/宿舍/chair-blue.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_dorm_shoe_bench",
    "name": "鞋架長椅",
    "role": "floor",
    "file": "images/宿舍/shoe-bench.png",
    "w": 1,
    "h": 3
  },
  {
    "id": "tile_dorm_desk_lamp",
    "name": "桌燈",
    "role": "floor",
    "file": "images/宿舍/desk-lamp.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_dorm_rug_blue",
    "name": "藍色地毯",
    "role": "floor",
    "file": "images/宿舍/rug-blue.png",
    "w": 2,
    "h": 3,
    "flat": true
  },
  {
    "id": "tile_dorm_wardrobe_lab_coat",
    "name": "白袍衣櫃",
    "role": "floor",
    "file": "images/宿舍/wardrobe-lab-coat.png",
    "w": 2,
    "h": 3
  },
  {
    "id": "tile_dorm_cabinet_tall",
    "name": "高櫃",
    "role": "floor",
    "file": "images/宿舍/cabinet-tall.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_dorm_bedside_drawers",
    "name": "床邊抽屜櫃",
    "role": "floor",
    "file": "images/宿舍/bedside-drawers.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_dorm_computer_monitor",
    "name": "電腦螢幕",
    "role": "floor",
    "file": "images/宿舍/computer-monitor.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_dorm_bed_horizontal",
    "name": "橫向床",
    "role": "floor",
    "file": "images/宿舍/bed-horizontal.png",
    "w": 3,
    "h": 3
  },
  {
    "id": "tile_dorm_standing_fan",
    "name": "立扇",
    "role": "floor",
    "file": "images/宿舍/standing-fan.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_dorm_bed_vertical",
    "name": "直向床",
    "role": "floor",
    "file": "images/宿舍/bed-vertical.png",
    "w": 2,
    "h": 4
  },
  {
    "id": "tile_dorm_air_conditioner",
    "name": "冷氣",
    "role": "floor",
    "file": "images/宿舍/air-conditioner.png",
    "w": 2,
    "h": 1
  },
  {
    "id": "tile_dorm_window_blinds_wide",
    "name": "百葉窗（寬）",
    "role": "floor",
    "file": "images/宿舍/window-blinds-wide.png",
    "w": 3,
    "h": 2
  },
  {
    "id": "tile_dorm_window_blinds_narrow",
    "name": "百葉窗（窄）",
    "role": "floor",
    "file": "images/宿舍/window-blinds-narrow.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_dorm_binder_set",
    "name": "資料夾組",
    "role": "floor",
    "file": "images/宿舍/binder-set.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_eoc_no_entry_poster",
    "name": "禁止進入海報",
    "role": "floor",
    "file": "images/應變中心/no-entry-poster.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_muftd54p",
    "name": "warning-line",
    "role": "floor",
    "file": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAbgAAAFACAYAAADOC2nHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFFmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNi4wLWMwMDIgNzkuMTY0NDg4LCAyMDIwLzA3LzEwLTIyOjA2OjUzICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjIuMCAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDI2LTA5LTI1VDAxOjM0OjI5KzA4OjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyNi0wOS0yNVQwMTozNjoxNSswODowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyNi0wOS0yNVQwMTozNjoxNSswODowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDoxZDRkOGVmMi05MDBiLWQwNDctOGVmOC1kZTBlY2ExZWU4NGMiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MWQ0ZDhlZjItOTAwYi1kMDQ3LThlZjgtZGUwZWNhMWVlODRjIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6MWQ0ZDhlZjItOTAwYi1kMDQ3LThlZjgtZGUwZWNhMWVlODRjIj4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDoxZDRkOGVmMi05MDBiLWQwNDctOGVmOC1kZTBlY2ExZWU4NGMiIHN0RXZ0OndoZW49IjIwMjYtMDktMjVUMDE6MzQ6MjkrMDg6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyMi4wIChXaW5kb3dzKSIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz6EwS3FAAASCUlEQVR4nO3d3W4cVbqA4a8N5e2Ojc1I4YD2AVwG4mhHZC6GuSC4GDrKHCFfRjjY2Qe2lCEb3D0u2b0PTEPCELvaqfVTK88jIc2P/dWisfK6mlqrZ5vNJgCgNXulFwAAKQgcAE0SOACaJHAANEngAGiSwAHQJIEDoEkCB0CTBA6AJgkcAE0SOACaJHAANEngAGiSwAHQJIEDoEkCB0CTBA6AJgkcAE0SOACaJHAANEngAGiSwAHQJIEDoEkCB0CTBA6AJgkcAE0SOACaJHAANEngAGiSwAHQJIEDoEkCB0CTBA6AJgkcAE0SOACaJHAANEngAGiSwAHQJIEDoEkCB0CTBA6AJgkcAE0SOACaJHAANEngAGiSwAHQJIEDoEkCB0CTBA6AJgkcAE0SOACaJHAANEngAGiSwAHQJIEDoEkCB0CTBA6AJn085rBHs9l3EfHtmDMBmIzvI+Imbjuw6w3U95ebzT/GXMxss9mMNuzRbLbZP/oyfv7l3TP3531crbroz04Hz3389OXoM//25GV89FEkmRsR8cvq3XO7gz76tfV+KOud2tyIab2+1lvPeo+/+jEi4uZfP369919f/8/g62y/93KzmQ3+pgGSvEX5yaN3r/Fq1cX+vI/uq+F/8ylmvnq+SDr3aP7uuf26i+7Aej+k9U5t7tReX+utb71DQ7rr3+suRr+De332dXz29GXcbCJe/3r/7KEvQoqZKecO+c3nIXOt99bU1ju1uVN7fa33Vun1zuOniN/u4PZ+u30aEq/uoI+P1y+ncQd3vlzELCKO7/htYmtouVPMTDl3yG8+D5lrvbemtt6pzZ3a62u9t2pYb0T8HreI25De9339uhu8ll0ke4ry4tki9j6axWx2ee/XDn2hU8xMOXf7QxFhvdY7vblTe32t91YN6/2r7x0Yx1El3SZw/sPncfzocNDXPvrvF8Vmppx7+w/Weq13mnOn9vpa760a1vvX35s3csn3wV08W8SnR/f/TfXrbvALnWJmyrlD/8Fa78PmTm29U5s7tdfXem+VXu/d37v7XeBDZNnofb5cxMnAF/rwyYtiM1PO3eWH2HrbX+/U5k7t9bXeW6XX++7vPcxyN5ftJJOL5bDfJq5WO9zJJZiZcu7QHwrrfdjcqa13anOn9vpa763S633X90YMfmjlwZJsE7jL0H+p2R30cfnPL4d9bYKZ5pprrrnm7jb3t20CcV8Htt7cfjCPn6axTeAuQ/de9Otu8D+QFDPNNddcc80db+5fSX0nV+Sw5V1ekLEjt8tMc80111xzd55787DtB+Mr9mkC71P9MWZW+ENhrrnmmju5uTc3t3/9+8fTiNuDlndeU6rIjf3v4K5X8cXerkfAXK9evOv/3r5YPtYHIJ+bN/7zfX/+vvm130fEt6v44vfvGdqDFIctJwlcxG6/JRx/9WOsIvJvcwdgVPOIzSq++P2/D31oZTKfJhCx2+0pAG3adSP5mMYO3FvzSv1NAVCPXTeSjyXpv9sqWW4A6rHrRvIxJH94o1S5AahL7pueLE8nlig3APXZdSP5+8j2+L23KwHYyhG5rPvLcpYbgLql7kGRDdQiB9CuVKew7KrYCSEiB9CuoZHbn/fJejB64GopNwBlDenB1aqL/Xmf5PpJ7uBqKDcA5fVnp/d+4OrVqkty7WRvUZYuNwB1OF8u4mTAp4qPLe1JJgXLDUA9LpaLe3swtuQPmZQqNwB1OV8u4uRwFrPZZZbrZXmKskS5AajPxbNFnBwdxfGj9E3Itk0gd7kBqNP5D5/HbBZxfJg2cln3weUsNwD1uni2iL1ZxCcJe5B9o3eucgNQt/PlIvb2ItlzGkVOMslRbgCKuNllf/PFchHX12kWUuyortTlBqCcXSL36vkiyRrGDlw15QagrNInVSW5g6uh3AAU8VZXSn4OaLK3KEuXG4DySn7Y9diBq6bcANShX3dx+ORF9uumPYuyYLkBqMfVKn8Pkj9FWarcANQl901Plm0CJcoNQH36dZftGY1s++C8XQnAVo7IZd3onbPcANQtdQ+KnGQicgDt6s9OB39tyh4UO6pL5ADaNTRy3UGfrAejB66WcgNQ1pAe9OsuuoM+yfWT3MHVUG4AyuvPTuNofveh+v26S3LtZG9Rli43AHV49Xxxb+RSSHuSScFyA1CPEpFL/pBJqXIDUJc/enCZ5XpZnqIUOQAitj04zNKEbNsEcpcbgDptPwc0deSy7oPLWW4A6pUjctk3eucqNwB1S92DIieZiBxAs2522d+87UEKxY7qEjmAdtUQubEDV025ASir9ElVSe7gRA7gg/VWV0p+DmiytyhLlxuA8kp+2PXYgaum3ADUoV93cfjkRfbrpj2LsmC5AajH1Sp/D5I/RVmq3ADUJfdNT5ZtAiXKDUB9+nWX7RmNbPvgvF0JwFaOyGXd6J2z3ADULXUPipxkInIA7erPTgd/bcoeFDuqS+QA2jU0cvvzPlkPRg9cLeUGoKwhPbhadbE/75NcP8kdXA3lBqC8/uw0Pj26+1D9q1WX5NrJ3qIsXW4A6nC+XMTJPZFLIe1JJgXLDUA9LpaLe3swtuQPmZQqNwB1OV8u4uRwFrPZZZbrZXmKskS5AajPxbNFnBwdxfGj9E3Itk0gd7kBqNP5D5/HbBZxfJg2cln3weUsNwD1uni2iL1ZxCcJe5B9o3eucgNQt/PlIvb2ItlzGkVOMslRbgCKuNllf/PFchHX12kWUuyortTlBqCcXSL36vkiyRrGDlw15QagrNInVSW5g6uh3AAU8VZXSn4OaLK3KEuXG4DySn7Y9diBq6bcANShX3dx+ORF9uumPYuyYLkBqMfVKn8Pkj9FWarcANQl901Plm0CJcoNQH36dZftGY1s++C8XQnAVo7IZd3onbPcANQtdQ+KnGQicgDt6s9OB39tyh4UO6pL5ADaNTRy3UGfrAejB66WcgNQ1pAe9OsuuoM+yfWT3MHVUG4AyuvPTuNofveh+v26S3LtZG9Rli43AHV49Xxxb+RSSHuSScFyA1CPEpFL/pBJqXIDUJc/enCZ5XpZnqIUOQAitj04zNKEbNsEcpcbgDptPwc0deSy7oPLWW4A6pUjctk3eucqNwB1S92DIieZiBxAs2522d+87UEKxY7qEjmAdtUQubEDV025ASir9ElVSe7gRA7gg/VWV0p+DmiytyhLlxuA8kp+2PXYgaum3ADUoV93cfjkRfbrpj2LsmC5AajH1Sp/D5I/RVmq3ADUJfdNT5ZtAiXKDUB9+nWX7RmNbPvgvF0JwFaOyGXd6J2z3ADULXUPipxkInIA7erPTgd/bcoeFDuqS+QA2jU0cvvzPlkPRg9cLeUGoKwhPbhadbE/75NcP8kdXA3lBqC8/uw0Pj26+1D9q1WX5NrJ3qIsXW4A6nC+XMTJPZFLIe1JJgXLDUA9LpaLe3swtuQPmZQqNwB1OV8u4uRwFrPZZZbrZXmKskS5AajPxbNFnBwdxfGj9E3Itk0gd7kBqNP5D5/HbBZxfJg2cln3weUsNwD1uni2iL1ZxCcJe5B9o3eucgNQt/PlIvb2ItlzGkVOMslRbgCKuNllf/PFchHX12kWUuyortTlBqCcXSL36vkiyRrGDlw15QagrNInVSW5g6uh3AAU8VZXSn4OaLK3KEuXG4DySn7Y9diBq6bcANShX3dx+ORF9uumPYuyYLkBqMfVKn8Pkj9FWarcANQl901Plm0CJcoNQH36dZftGY1s++C8XQnAVo7IZd3onbPcANQtdQ+KnGQicgDt6s9OB39tyh4UO6pL5ADaNTRy3UGfrAejB66WcgNQ1pAe9OsuuoM+yfWT3MHVUG4AyuvPTuNofveh+v26S3LtZG9Rli43AHV49Xxxb+RSSHuSScFyA1CPEpFL/pBJqXIDUJc/enCZ5XpZnqIUOQAitj04zNKEbNsEcpcbgDptPwc0deSy7oPLWW4A6pUjctk3eucqNwB1S92DIieZiBxAs2522d+87UEKxY7qEjmAdtUQubEDV025ASir9ElVSe7gRA7gg/VWV0p+DmiytyhLlxuA8kp+2PXYgaum3ADUoV93cfjkRfbrpj2LsmC5AajH1Sp/D5I/RVmq3ADUJfdNT5ZtAiXKDUB9+nWX7RmNbPvgvF0JwFaOyGXd6J2z3ADULXUPipxkInIA7erPTgd/bcoeFDuqS+QA2jU0cvvzPlkPRg9cLeUGoKwhPbhadbE/75NcP8kdXA3lBqC8/uw0Pj26+1D9q1WX5NrJ3qIsXW4A6nC+XMTJPZFLIe1JJgXLDUA9LpaLe3swtuQPmZQqNwB1OV8u4uRwFrPZZZbrZXmKskS5AajPxbNFnBwdxfGj9E3Itk0gd7kBqNP5D5/HbBZxfJg2cln3weUsNwD1uni2iL1ZxCcJe5B9o3eucgNQt/PlIvb2ItlzGkVOMslRbgCKuNllf/PFchHX12kWUuyortTlBqCcXSL36vkiyRrGDlw15QagrNInVSW5g6uh3AAU8VZXSn4OaLK3KEuXG4DySn7Y9diBq6bcANShX3dx+ORF9uumPYuyYLkBqMfVKn8Pkj9FWarcANQl901Plm0CJcoNQH36dZftGY1s++C8XQnAVo7IZd3onbPcANQtdQ+KnGQicgDt6s9OB39tyh4UO6pL5ADaNTRy+/M+WQ9GD1wt5QagrCE9uFp1sT/vk1w/yR1cDeUGoLz+7DQ+vedQ/atVl+Tayd6iLF1uAOpwvlwU+eSYtCeZFCw3AA8zj/huHrF5wF/fvWvmxXJxbw/GNttsNqMNezSbbV6fff0f//vjpy/j51/efZ15/BSrCB8MB1CBecRf/lm+9fibl/H68tfYbB796ft+ioiIh37v5WYzageyPEVZotwApHHxbBEnR0dx/Gj3P9ff53t3lW2bwPlyESeHs5jNLnNdEoBEzn/4PGaziOPD3UP1Pt+7i6z74HKWG4C0Lp4tYm8W8ckD7+Qe+r1DZd/onavcAKR3vlzE3l486CnJ9/neIYqcZJKj3AA82M0ue5Qvlou4vh7le0eV5SnKd3n89GVERFz98uJdX3Lzxn8eM8ap5gK04GYVX+xF7HY61fFXP0ZExCq+iId879hPUX485rBd/bF14It3fcnv8Rn5CLCd5+7yG0mq48rMNddcczPNfdAv/qs//Vn+5+vsvTH13z8OX+9DFQvclH4gprRWc80119xa597c7D73fVT/cTml/8FNaa3mmmuuuS3NfV/ZAzf0hegO+iQv8C5zp7RWc80119yW5o4ha+A+++2hkvt0B31c/vPLonOntNaIiL89sd4I653q3Km9vtZ7K9V6x5ItcI+fvox/3XEe5db+fLcXIsXcKa014vaH95eV9VrvNOdO7fW13lup1jumLIH77J7Dlre6gz5+ff5l0blTWmvE8B9e633Y3Kmtd2pzp/b6Wu+tVOsdW/KnKB9/8zJ+/nXYC7HTbw8J5k5prRG7/fBab/vrndrcqb2+1nsr1XpTSHoH99nf/zdeX/466Gt3et83wdwprTVi+8NrvdY7zblTe32t91bK9aaQ7A7u8TcvY7OJ//jMn7+yy5M1KeZOaa0Rb/4wWK/1Tm/u1F5f672Vfr3jS3IH99nTl7GJiNeX99/G7vJCpJg7pbVG/PHDMOStB+vdfe7U1ju1uVN7fa33Vg3rfYjRA/f46cu4vol4fcd7tPvzPiJ2/O0hwdwprTVi2A9Dd2C9ER/Geqc2d2qvr/XeKrne95XkDu7/7qj8/ryPq1X3oBdi7LkpZqZa69Af3n5tvR/Seqc2d2qvr/WWW+8Yxv40ge8i4tvRBgLwofj+crP5x5gDRw0cANTCZ6EB0CSBA6BJAgdAkwQOgCYJHABNEjgAmiRwADRJ4ABoksAB0CSBA6BJAgdAkwQOgCYJHABNEjgAmiRwADRJ4ABoksAB0CSBA6BJAgdAkwQOgCYJHABNEjgAmiRwADRJ4ABoksAB0CSBA6BJAgdAkwQOgCYJHABNEjgAmiRwADRJ4ABoksAB0CSBA6BJAgdAkwQOgCYJHABNEjgAmiRwADRJ4ABoksAB0CSBA6BJAgdAkwQOgCYJHABNEjgAmiRwADRJ4ABoksAB0CSBA6BJAgdAkwQOgCYJHABNEjgAmiRwADRJ4ABoksAB0KT/B5qi+gjc9401AAAAAElFTkSuQmCC",
    "w": 11,
    "h": 8,
    "flat": true
  },
  {
    "id": "tile_mufv6z24",
    "name": "shoe-cabinet",
    "role": "floor",
    "file": "images/宿舍/shoe-cabinet.png",
    "w": 2,
    "h": 1
  },
  {
    "id": "tile_mufv9ytk",
    "name": "Backpack",
    "role": "floor",
    "file": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFFmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNi4wLWMwMDIgNzkuMTY0NDg4LCAyMDIwLzA3LzEwLTIyOjA2OjUzICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjIuMCAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDI2LTA5LTI1VDAyOjI5OjA5KzA4OjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyNi0wOS0yNVQwMjoyOTozNSswODowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyNi0wOS0yNVQwMjoyOTozNSswODowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDozODg5ZTNiMC1hMWM3LWU0NGEtODUyMC0zZTZhMWVjZjFiMTIiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6Mzg4OWUzYjAtYTFjNy1lNDRhLTg1MjAtM2U2YTFlY2YxYjEyIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6Mzg4OWUzYjAtYTFjNy1lNDRhLTg1MjAtM2U2YTFlY2YxYjEyIj4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDozODg5ZTNiMC1hMWM3LWU0NGEtODUyMC0zZTZhMWVjZjFiMTIiIHN0RXZ0OndoZW49IjIwMjYtMDktMjVUMDI6Mjk6MDkrMDg6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyMi4wIChXaW5kb3dzKSIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7uzA0xAAAFwklEQVRYhe2ZX2xUVR7HP+fcPzPjDNMt1DZSadBaUSgo2ibd7JPGhGTDQrIlWFf8E0x84MXog/HFV998M74YNUZiDP5JEF8gUMO6u2FZWIiioUCzdGEoQintDOPM3HvPOT7cztWh8+cOYOTB39M5Z37n+/vc8zvnd+9phTGG29nkbw3Qyn4HvFn7HfBm7bYHtG+FiBCybq0yRoub1b4hwOuB+u+7k2xakkqGCSmVNfmiXuR3I8BtAwohzauvDDF9yYvG/nVoms1/Xk7CCfsVHz785DzPbFsX+dzV7SKENO1CtgUohDRPbVmDNIu37sVLPs6Cmh8sniuN5Kkta9qGjAUohDTSshka6sNxBbnLZVSlzDcnr+F5Ic3ZCxXEQtjq2/Pf/7mI69qseyBD7jI4rmBoqA/Ldo1WQayUtwQUQpptYwN89Mn/SLkK2xYc/fYH5mZ9Bldn0CLJqVMFTp+eWzS3vz+DNAH/PDzDH5Y6PLq2m5SrANg2NhBrNdtKseMmmDhzjYdWZ/EqAVLA1WL429aNy3GkBsDXkl1fXgCgI2Pxx+EO3ITNxJlrJNxEOyGbA7qJpHlubCVqoT8zW2bk4U7uuXdJ5PP3w5cA+H8uX1dj7ZqeqJ20Chw6fjXqPze2EjeRNF6l3HAVY63gl3unwwBJl66uLJ4ySPmzZsXzGP/HDJYTHh7l66gdmNBPa0NXV5Zkshhpbt7Q1TJ2S8BCPqBYXCgpBioBBMUA3zeUSmFK1w4uazg/lyuTSkkcR6ACBxYOULHoUcjXOe7tAv7ShDQUij5SemilWbFiCb29SQDmZ0tU19QAHUtT0bxz5wpIS6J1qNGONQU0Rtf0lVLMXS0hbIVRcGV+DpRGSoOTtPnm2AwA69Z3MZX7Ea0FWBILg7DABAqlVNMYsQEt2zXbtq7i2vx8NFYue3y6e6KpIMD3p2Yb/rb6waU1/b9tWYVlu0YFXt2D0jLFew9OA5YAzMxMhddefqSu39vvfsvo1r8A8NmuPex4YW1dv/d2Rg8o9h6cNqObOprGbwmoVe2DdTc5eC++9HoE2MyvkXY9awkoLfBKZSzbBeD0ZOM988V7T0ftZn4AXqVMJuO2BGz4weo64dONbgr3SEslIAgEQRDvO8CyXTO6aVVNrLYAPd+InbsmyGYcdmwfjBXUtg22Ha+M7Ng+SDbjsHPXBJ5vGhI2BFRBWJxL5eapAlDCD8WkhZRWzVgzq2pXY9WzVntQvP/R90arACHClZmcKjR0zl0sRe2zZ8tAua6f0T5vvXMcadkATfdEnEuTAPjrpv6awX0HJqO2BkaG+/h8zxSf75liZLgP3cD3Oq2WG7YpYKOl33dgkqkPBqPAVZGR4T5Ghvtqxq73jRujai3LjAo8hJD4gWL9Qx3s3R8GOjIRvugPH72AkGDZDo4T7j/fV6jAp/oWq/ruOzDJhieW4wcqFlwswKr5Co4cm2P7kwMAjL5xks1/6mHN+iyloscPswbXDTPmeYaepYJU2uW7Y3lG3zgZzdu9P8fQI51xw8a/uI9/fZ7Rjb3s3p8DYNmyOygEkE5DOivp7nHo6HTp6HTp7nFIZyXpNBSC0LcKN7qxl/Gvz8cGFHH+PiiENI893s+qlS656TKHjl4JIbMuFSDwFZWKxuhQS0hBIiGxHYsEcCUfpnLk0WX03pVk4qzHV+OTt+bS9EvLZtNkliQZGOjkw4/P8Pyz98ea9+ZbJ3hm7D6kMEhhAa333g0BKq2Yz1ei/snTeVIpidIKYSRioWoYDEZoLGlFX935fFgTO7K38NJ0vf33RJ7+vp8DSCnxfB+lDJ7n43lhil1X4LoSy9JI6SzS+FUAyxVFMmHVjM1e9ZGWQgoIAh2t4I+BxvNAG9CqvlZci31IAB57vPZtcuLEZe5ekcaxwLIlcqEmaA0q0PgKzp8rMjh4Z828r8bDWhrnkMQFrDZv1b8EBLS+j0BMwN/SfgIG1mVk4kpSbgAAAABJRU5ErkJggg==",
    "w": 1,
    "h": 1
  },
  {
    "id": "color_mufvoh5q",
    "name": "色塊",
    "role": "floor",
    "color": "#4f8fbf",
    "w": 1,
    "h": 1,
    "systemColor": true,
    "flat": true
  },
  {
    "id": "tile_mufvqx2u",
    "name": "station-floor-2",
    "role": "floor",
    "file": "images/background/station-floor-2.png",
    "w": 1,
    "h": 1,
    "flat": true
  },
  {
    "id": "color_mufwrm72",
    "name": "色塊",
    "role": "floor",
    "color": "#000000",
    "w": 10,
    "h": 1,
    "systemColor": true,
    "flat": true
  },
  {
    "id": "tile_mufxoi3i",
    "name": "elevator",
    "role": "floor",
    "file": "images/應變中心/elevator.png",
    "w": 3,
    "h": 3
  },
  {
    "id": "tile_mufxpxnl",
    "name": "elevator-light01",
    "role": "floor",
    "file": "images/應變中心/elevator-light01.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_restaurant_waste_sorting_station",
    "name": "Waste Sorting Station",
    "role": "floor",
    "file": "images/餐廳/restaurant-waste-sorting-station.png",
    "w": 3,
    "h": 2
  },
  {
    "id": "tile_restaurant_trash_bin_small",
    "name": "Small Trash Bin",
    "role": "floor",
    "file": "images/餐廳/restaurant-trash-bin-small.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_restaurant_kitchen_workstation",
    "name": "Kitchen Workstation",
    "role": "floor",
    "file": "images/餐廳/restaurant-kitchen-workstation.png",
    "w": 7,
    "h": 3
  },
  {
    "id": "tile_restaurant_tray_stack",
    "name": "Tray Stack",
    "role": "floor",
    "file": "images/餐廳/restaurant-tray-stack.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_restaurant_chopsticks_holder",
    "name": "Chopsticks Holder",
    "role": "floor",
    "file": "images/餐廳/restaurant-chopsticks-holder.png",
    "w": 1,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_restaurant_bowl_stack",
    "name": "Bowl Stack",
    "role": "floor",
    "file": "images/餐廳/restaurant-bowl-stack.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_restaurant_storage_cabinet",
    "name": "Storage Cabinet",
    "role": "floor",
    "file": "images/餐廳/restaurant-storage-cabinet.png",
    "w": 2,
    "h": 3
  },
  {
    "id": "tile_restaurant_serving_counter",
    "name": "Serving Counter",
    "role": "floor",
    "file": "images/餐廳/restaurant-serving-counter.png",
    "w": 3,
    "h": 2
  },
  {
    "id": "tile_restaurant_counter_stool_red",
    "name": "Red Counter Stool",
    "role": "floor",
    "file": "images/餐廳/restaurant-counter-stool-red.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_restaurant_water_dispenser_01",
    "name": "折疊椅（背面）",
    "role": "floor",
    "file": "images/餐廳/restaurant-folding-chair-back.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_restaurant_water_dispenser_02",
    "name": "折疊椅（正面）",
    "role": "floor",
    "file": "images/餐廳/restaurant-folding-chair-front.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_restaurant_condiment_bottles",
    "name": "Condiment Bottles",
    "role": "floor",
    "file": "images/餐廳/restaurant-condiment-bottles.png",
    "w": 1,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_restaurant_napkin_holder",
    "name": "Napkin Holder",
    "role": "floor",
    "file": "images/餐廳/restaurant-napkin-holder.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_restaurant_partition_tall",
    "name": "Tall Partition",
    "role": "floor",
    "file": "images/餐廳/restaurant-partition-tall.png",
    "w": 2,
    "h": 6
  },
  {
    "id": "tile_restaurant_booth_seating_vertical",
    "name": "Vertical Booth Seating",
    "role": "floor",
    "file": "images/餐廳/restaurant-booth-seating-vertical.png",
    "w": 1,
    "h": 7
  },
  {
    "id": "tile_restaurant_chair_side",
    "name": "Side Chair",
    "role": "floor",
    "file": "images/餐廳/restaurant-chair-side.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_restaurant_buffet_counter_01",
    "name": "Buffet Counter 01",
    "role": "floor",
    "file": "images/餐廳/restaurant-buffet-counter-01.png",
    "w": 4,
    "h": 2
  },
  {
    "id": "tile_restaurant_buffet_counter_02",
    "name": "Buffet Counter 02",
    "role": "floor",
    "file": "images/餐廳/restaurant-buffet-counter-02.png",
    "w": 4,
    "h": 2
  },
  {
    "id": "tile_restaurant_soup_warmer",
    "name": "Soup Warmer",
    "role": "floor",
    "file": "images/餐廳/restaurant-soup-warmer.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_musc5wyq",
    "name": "restaurant-partition",
    "role": "floor",
    "file": "images/餐廳/restaurant-partition.png",
    "w": 4,
    "h": 2
  },
  {
    "id": "tile_musg7iyr",
    "name": "restaurant-buffet-counter-03",
    "role": "floor",
    "file": "images/餐廳/restaurant-buffet-counter-03.png",
    "w": 4,
    "h": 2
  },
  {
    "id": "tile_hospital_ward_floor_tile",
    "name": "病房地板",
    "role": "floor",
    "file": "images/醫院病房/hospital-ward-floor-tile.png",
    "w": 1,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_hospital_ward_wall_tile",
    "name": "病房牆面",
    "role": "floor",
    "file": "images/醫院病房/hospital-ward-wall-tile.png",
    "w": 1,
    "h": 4
  },
  {
    "id": "tile_hospital_ward_window_wide",
    "name": "病房窗戶（寬）",
    "role": "floor",
    "file": "images/醫院病房/hospital-ward-window-wide.png",
    "w": 3,
    "h": 1
  },
  {
    "id": "tile_hospital_hospital_bed",
    "name": "病床",
    "role": "floor",
    "file": "images/醫院病房/hospital-bed.png",
    "w": 2,
    "h": 3
  },
  {
    "id": "tile_hospital_hospital_bed_no_pillow",
    "name": "病床（無枕頭）",
    "role": "floor",
    "file": "images/醫院病房/hospital-bed-no-pillow.png",
    "w": 2,
    "h": 3
  },
  {
    "id": "tile_hospital_iv_stand",
    "name": "點滴架",
    "role": "floor",
    "file": "images/醫院病房/iv-stand.png",
    "w": 1,
    "h": 3
  },
  {
    "id": "tile_hospital_iv_stand_with_board",
    "name": "點滴架（附置物板）",
    "role": "floor",
    "file": "images/醫院病房/iv-stand-with-board.png",
    "w": 2,
    "h": 3
  },
  {
    "id": "tile_hospital_bedside_cabinet",
    "name": "床邊櫃",
    "role": "floor",
    "file": "images/醫院病房/bedside-cabinet.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_hospital_bedside_cabinet_back",
    "name": "床邊櫃（背面）",
    "role": "floor",
    "file": "images/醫院病房/bedside-cabinet-back.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_hospital_armchair_front",
    "name": "單人沙發椅（正面）",
    "role": "floor",
    "file": "images/醫院病房/armchair-front.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_hospital_armchair_back",
    "name": "單人沙發椅（背面）",
    "role": "floor",
    "file": "images/醫院病房/armchair-back.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_hospital_waiting_bench_side",
    "name": "候診長椅（側面）",
    "role": "floor",
    "file": "images/醫院病房/waiting-bench-side.png",
    "w": 1,
    "h": 3
  },
  {
    "id": "tile_hospital_plant_on_stool",
    "name": "盆栽（木凳）",
    "role": "floor",
    "file": "images/醫院病房/plant-on-stool.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_hospital_bed_headwall_panel",
    "name": "床頭牆板（燈＋插座）",
    "role": "floor",
    "file": "images/醫院病房/bed-headwall-panel.png",
    "w": 2,
    "h": 1
  },
  {
    "id": "tile_hospital_privacy_curtain_top",
    "name": "隔簾（上方拉起）",
    "role": "floor",
    "file": "images/醫院病房/privacy-curtain-top.png",
    "w": 5,
    "h": 7
  },
  {
    "id": "tile_hospital_privacy_curtain_top_half",
    "name": "隔簾（上方半拉）",
    "role": "floor",
    "file": "images/醫院病房/privacy-curtain-top-half.png",
    "w": 5,
    "h": 7
  },
  {
    "id": "tile_hospital_privacy_curtain_bottom",
    "name": "隔簾（下方拉起）",
    "role": "floor",
    "file": "images/醫院病房/privacy-curtain-bottom.png",
    "w": 5,
    "h": 7
  },
  {
    "id": "tile_hospital_privacy_curtain_bottom_half",
    "name": "隔簾（下方半拉）",
    "role": "floor",
    "file": "images/醫院病房/privacy-curtain-bottom-half.png",
    "w": 5,
    "h": 7
  },
  {
    "id": "tile_containment_floor_tile",
    "name": "收容室地板",
    "role": "floor",
    "file": "images/收容觀察室/containment-floor-tile.png",
    "w": 1,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_containment_wall",
    "name": "收容室牆面",
    "role": "floor",
    "file": "images/收容觀察室/containment-wall.png",
    "w": 1,
    "h": 4
  },
  {
    "id": "tile_containment_wall_top_straight",
    "name": "牆頂（直線）",
    "role": "floor",
    "file": "images/收容觀察室/containment-wall-top-straight.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_containment_wall_top_corner",
    "name": "牆頂（轉角）",
    "role": "floor",
    "file": "images/收容觀察室/containment-wall-top-corner.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_containment_glass_door",
    "name": "玻璃門（雙開）",
    "role": "floor",
    "file": "images/收容觀察室/containment-glass-door.png",
    "w": 5,
    "h": 3
  },
  {
    "id": "tile_containment_medical_monitor_cart",
    "name": "醫療儀器推車",
    "role": "floor",
    "file": "images/收容觀察室/containment-medical-monitor-cart.png",
    "w": 2,
    "h": 3
  },
  {
    "id": "tile_containment_equipment_cabinets",
    "name": "設備櫃組",
    "role": "floor",
    "file": "images/收容觀察室/containment-equipment-cabinets.png",
    "w": 2,
    "h": 4
  },
  {
    "id": "tile_containment_tall_cabinet",
    "name": "高櫃",
    "role": "floor",
    "file": "images/收容觀察室/containment-tall-cabinet.png",
    "w": 2,
    "h": 3
  },
  {
    "id": "tile_containment_table",
    "name": "桌子",
    "role": "floor",
    "file": "images/收容觀察室/containment-table.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_muu4ow6f",
    "name": "supply-shelf02",
    "role": "floor",
    "file": "images/應變中心/supply-shelf02.png",
    "w": 2,
    "h": 3
  },
  {
    "id": "tile_muu4p4el",
    "name": "supply-shelf03",
    "role": "floor",
    "file": "images/應變中心/supply-shelf03.png",
    "w": 2,
    "h": 3
  },
  {
    "id": "tile_muu6050n",
    "name": "supply-shelf04",
    "role": "floor",
    "file": "images/應變中心/supply-shelf04.png",
    "w": 2,
    "h": 3
  },
  {
    "id": "tile_mrt_floor_tile",
    "name": "車站地板",
    "role": "floor",
    "file": "images/捷運車站/mrt-floor-tile.png",
    "w": 3,
    "h": 3,
    "flat": true
  },
  {
    "id": "tile_mrt_floor_tile_strip",
    "name": "地磚（長條）",
    "role": "floor",
    "file": "images/捷運車站/mrt-floor-tile-strip.png",
    "w": 3,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_mrt_floor_guide_lines",
    "name": "地面導引線",
    "role": "floor",
    "file": "images/捷運車站/mrt-floor-guide-lines.png",
    "w": 6,
    "h": 3,
    "flat": true
  },
  {
    "id": "tile_mrt_tactile_paving_white",
    "name": "導盲磚（白）",
    "role": "floor",
    "file": "images/捷運車站/mrt-tactile-paving-white.png",
    "w": 3,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_mrt_tactile_paving_yellow",
    "name": "導盲磚（黃）",
    "role": "floor",
    "file": "images/捷運車站/mrt-tactile-paving-yellow.png",
    "w": 3,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_mrt_accessible_waiting_area",
    "name": "身障停等區",
    "role": "floor",
    "file": "images/捷運車站/mrt-accessible-waiting-area.png",
    "w": 2,
    "h": 2,
    "flat": true
  },
  {
    "id": "tile_mrt_platform_edge_line",
    "name": "月台黃線",
    "role": "floor",
    "file": "images/捷運車站/mrt-platform-edge-line.png",
    "w": 3,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_mrt_rail_track",
    "name": "軌道",
    "role": "floor",
    "file": "images/捷運車站/mrt-rail-track.png",
    "w": 3,
    "h": 3,
    "flat": true
  },
  {
    "id": "tile_mrt_rail_track_objects",
    "name": "軌道零件",
    "role": "floor",
    "file": "images/捷運車站/mrt-rail-track-objects.png",
    "w": 5,
    "h": 2,
    "flat": true
  },
  {
    "id": "tile_mrt_tunnel_wall",
    "name": "隧道牆（暗色）",
    "role": "floor",
    "file": "images/捷運車站/mrt-tunnel-wall.png",
    "w": 3,
    "h": 5,
    "flat": true
  },
  {
    "id": "tile_mrt_wall_sign_platform",
    "name": "牆面（①月台指標）",
    "role": "floor",
    "file": "images/捷運車站/mrt-wall-sign-platform.png",
    "w": 4,
    "h": 3
  },
  {
    "id": "tile_mrt_wall_blue_band",
    "name": "牆面（藍色飾帶）",
    "role": "floor",
    "file": "images/捷運車站/mrt-wall-blue-band.png",
    "w": 4,
    "h": 3
  },
  {
    "id": "tile_mrt_wall_sign_tamsui",
    "name": "牆面（往淡水指標）",
    "role": "floor",
    "file": "images/捷運車站/mrt-wall-sign-tamsui.png",
    "w": 4,
    "h": 3
  },
  {
    "id": "tile_mrt_wall_sign_station_name",
    "name": "牆面（站名：忠孝敦化）",
    "role": "floor",
    "file": "images/捷運車站/mrt-wall-sign-station-name.png",
    "w": 4,
    "h": 3
  },
  {
    "id": "tile_mrt_low_wall_blue",
    "name": "矮牆（藍邊）",
    "role": "floor",
    "file": "images/捷運車站/mrt-low-wall-blue.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_mrt_low_wall_beige",
    "name": "矮牆（米色邊）",
    "role": "floor",
    "file": "images/捷運車站/mrt-low-wall-beige.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_mrt_pillar_large",
    "name": "大柱子",
    "role": "floor",
    "file": "images/捷運車站/mrt-pillar-large.png",
    "w": 2,
    "h": 7
  },
  {
    "id": "tile_mrt_pillar_large_route_map",
    "name": "大柱子（路線圖）",
    "role": "floor",
    "file": "images/捷運車站/mrt-pillar-large-route-map.png",
    "w": 2,
    "h": 7
  },
  {
    "id": "tile_mrt_platform_screen_doors",
    "name": "月台門",
    "role": "floor",
    "file": "images/捷運車站/mrt-platform-screen-doors.png",
    "w": 6,
    "h": 2
  },
  {
    "id": "tile_mrt_glass_railing",
    "name": "玻璃圍欄",
    "role": "floor",
    "file": "images/捷運車站/mrt-glass-railing.png",
    "w": 3,
    "h": 2
  },
  {
    "id": "tile_mrt_ticket_gate",
    "name": "捷運閘門",
    "role": "floor",
    "file": "images/捷運車站/mrt-ticket-gate.png",
    "w": 3,
    "h": 2
  },
  {
    "id": "tile_mrt_gate_card_readers",
    "name": "閘門讀卡機",
    "role": "floor",
    "file": "images/捷運車站/mrt-gate-card-readers.png",
    "w": 3,
    "h": 2
  },
  {
    "id": "tile_mrt_gate_card_readers_small",
    "name": "閘門讀卡機（小）",
    "role": "floor",
    "file": "images/捷運車站/mrt-gate-card-readers-small.png",
    "w": 3,
    "h": 2
  },
  {
    "id": "tile_mrt_escalator_side",
    "name": "手扶梯（側面）",
    "role": "floor",
    "file": "images/捷運車站/mrt-escalator-side.png",
    "w": 6,
    "h": 6
  },
  {
    "id": "tile_mrt_escalator_side_cover",
    "name": "手扶梯（側面外殼）",
    "role": "floor",
    "file": "images/捷運車站/mrt-escalator-side-cover.png",
    "w": 6,
    "h": 6
  },
  {
    "id": "tile_mrt_escalator_front",
    "name": "手扶梯（正面）",
    "role": "floor",
    "file": "images/捷運車站/mrt-escalator-front.png",
    "w": 5,
    "h": 4
  },
  {
    "id": "tile_mrt_stairs_dark",
    "name": "樓梯（深色）",
    "role": "floor",
    "file": "images/捷運車站/mrt-stairs-dark.png",
    "w": 2,
    "h": 3,
    "flat": true
  },
  {
    "id": "tile_mrt_stairs_light",
    "name": "樓梯（淺色）",
    "role": "floor",
    "file": "images/捷運車站/mrt-stairs-light.png",
    "w": 2,
    "h": 3,
    "flat": true
  },
  {
    "id": "tile_mrt_train_car_head",
    "name": "車廂（車頭）",
    "role": "floor",
    "file": "images/捷運車站/mrt-train-car-head.png",
    "w": 26,
    "h": 4
  },
  {
    "id": "tile_mrt_train_car_middle",
    "name": "車廂（中段）",
    "role": "floor",
    "file": "images/捷運車站/mrt-train-car-middle.png",
    "w": 26,
    "h": 4
  },
  {
    "id": "tile_mrt_train_door",
    "name": "車門",
    "role": "floor",
    "file": "images/捷運車站/mrt-train-door.png",
    "w": 3,
    "h": 3
  },
  {
    "id": "tile_mrt_train_door_2",
    "name": "車門（款式2）",
    "role": "floor",
    "file": "images/捷運車站/mrt-train-door-2.png",
    "w": 3,
    "h": 3
  },
  {
    "id": "tile_mrt_exit_sign",
    "name": "出口指示牌",
    "role": "floor",
    "file": "images/捷運車站/mrt-exit-sign.png",
    "w": 3,
    "h": 1
  },
  {
    "id": "tile_mrt_info_board_map",
    "name": "告示牌（路線圖）",
    "role": "floor",
    "file": "images/捷運車站/mrt-info-board-map.png",
    "w": 2,
    "h": 3
  },
  {
    "id": "tile_mrt_info_board_notice",
    "name": "告示牌（公告）",
    "role": "floor",
    "file": "images/捷運車站/mrt-info-board-notice.png",
    "w": 2,
    "h": 3
  },
  {
    "id": "tile_mrt_ceiling_light",
    "name": "燈管",
    "role": "floor",
    "file": "images/捷運車站/mrt-ceiling-light.png",
    "w": 3,
    "h": 1
  },
  {
    "id": "tile_mrt_waiting_seats",
    "name": "候車椅（雙座）",
    "role": "floor",
    "file": "images/捷運車站/mrt-waiting-seats.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_mrt_recycling_bins",
    "name": "垃圾桶（分類）",
    "role": "floor",
    "file": "images/捷運車站/mrt-recycling-bins.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_mrt_planter",
    "name": "植栽",
    "role": "floor",
    "file": "images/捷運車站/mrt-planter.png",
    "w": 3,
    "h": 2
  },
  {
    "id": "tile_mrt_cardboard_boxes",
    "name": "紙箱堆",
    "role": "floor",
    "file": "images/捷運車站/mrt-cardboard-boxes.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_mrt_poster_moon_lake",
    "name": "海報（月之湖）",
    "role": "floor",
    "file": "images/捷運車站/mrt-poster-moon-lake.png",
    "w": 4,
    "h": 2
  },
  {
    "id": "tile_mrt_poster_moonlight",
    "name": "海報（月光）",
    "role": "floor",
    "file": "images/捷運車站/mrt-poster-moonlight.png",
    "w": 4,
    "h": 2
  },
  {
    "id": "tile_bg_backroom_floor03",
    "name": "後室地板（殘破）",
    "role": "floor",
    "file": "images/background/Back-room-floor03.png",
    "w": 3,
    "h": 3,
    "flat": true
  },
  {
    "id": "tile_bg_backroom_floor04",
    "name": "後室地板（殘破 2）",
    "role": "floor",
    "file": "images/background/Back-room-floor04.png",
    "w": 3,
    "h": 3,
    "flat": true
  },
  {
    "id": "tile_bg_backroom_wall02",
    "name": "後室牆面（寬）",
    "role": "floor",
    "file": "images/background/Back-room-wall02.png",
    "w": 3,
    "h": 3
  },
  {
    "id": "tile_bg_backroom_wall02_dmg_light",
    "name": "後室牆面（輕微破損）",
    "role": "floor",
    "file": "images/background/Back-room-wall02-damage-light.png",
    "w": 3,
    "h": 3
  },
  {
    "id": "tile_bg_backroom_wall02_dmg_medium",
    "name": "後室牆面（中度破損）",
    "role": "floor",
    "file": "images/background/Back-room-wall02-damage-medium.png",
    "w": 3,
    "h": 3
  },
  {
    "id": "tile_bg_backroom_wall02_dmg_heavy",
    "name": "後室牆面（嚴重破損）",
    "role": "floor",
    "file": "images/background/Back-room-wall02-damage-heavy.png",
    "w": 3,
    "h": 3
  },
  {
    "id": "tile_bg_electric_light",
    "name": "日光燈",
    "role": "floor",
    "file": "images/background/electric-light.png",
    "w": 2,
    "h": 1
  },
  {
    "id": "tile_bg_road_signs",
    "name": "指示看板",
    "role": "floor",
    "file": "images/background/Road-signs.png",
    "w": 5,
    "h": 2
  },
  {
    "id": "tile_bg_word_y28",
    "name": "看板文字（Y2-26／Y28 出口）",
    "role": "floor",
    "file": "images/background/word-y28.png",
    "w": 5,
    "h": 1
  },
  {
    "id": "tile_dmg_backroom_pillar_damaged",
    "name": "後室柱子（破損）",
    "role": "floor",
    "file": "images/破損建築/Back-room-Pillar-damaged.png",
    "w": 1,
    "h": 4
  },
  {
    "id": "tile_dmg_pillar_damaged",
    "name": "大廳柱子（破損）",
    "role": "floor",
    "file": "images/破損建築/pillar-damaged.png",
    "w": 2,
    "h": 8
  },
  {
    "id": "tile_dmg_floor_crack_cross",
    "name": "地面裂痕（交叉）",
    "role": "floor",
    "file": "images/破損建築/floor-crack-cross.png",
    "w": 2,
    "h": 2,
    "flat": true
  },
  {
    "id": "tile_dmg_floor_crack_fork",
    "name": "地面裂痕（分岔）",
    "role": "floor",
    "file": "images/破損建築/floor-crack-fork.png",
    "w": 3,
    "h": 2,
    "flat": true
  },
  {
    "id": "tile_dmg_floor_crack_stained",
    "name": "地面裂痕（污漬）",
    "role": "floor",
    "file": "images/破損建築/floor-crack-stained.png",
    "w": 2,
    "h": 2,
    "flat": true
  },
  {
    "id": "tile_dmg_floor_stain_seep",
    "name": "地面污漬（滲漏）",
    "role": "floor",
    "file": "images/破損建築/floor-stain-seep.png",
    "w": 3,
    "h": 2,
    "flat": true
  },
  {
    "id": "tile_dmg_floor_stain_smudge",
    "name": "地面污漬（擦痕）",
    "role": "floor",
    "file": "images/破損建築/floor-stain-smudge.png",
    "w": 3,
    "h": 2,
    "flat": true
  },
  {
    "id": "tile_dmg_rubble_brick_chunks",
    "name": "碎磚塊",
    "role": "floor",
    "file": "images/破損建築/rubble-brick-chunks.png",
    "w": 2,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_dmg_rubble_chips_02",
    "name": "碎石屑 2",
    "role": "floor",
    "file": "images/破損建築/rubble-chips-02.png",
    "w": 2,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_dmg_rubble_scatter_02",
    "name": "碎石散落 2",
    "role": "floor",
    "file": "images/破損建築/rubble-scatter-02.png",
    "w": 3,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_dmg_rubble_slab_fragments",
    "name": "水泥板碎片",
    "role": "floor",
    "file": "images/破損建築/rubble-slab-fragments.png",
    "w": 2,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_dmg_rubble_wall_chunks",
    "name": "牆壁碎塊",
    "role": "floor",
    "file": "images/破損建築/rubble-wall-chunks.png",
    "w": 2,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_dmg_rubble_rebar_chunk",
    "name": "鋼筋水泥塊",
    "role": "floor",
    "file": "images/破損建築/rubble-rebar-chunk.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "color_muvkb68t",
    "name": "色塊",
    "role": "floor",
    "color": "#000000",
    "w": 1,
    "h": 1,
    "systemColor": true,
    "flat": true
  },
  {
    "id": "tile_bg_backroom_floor05",
    "name": "後室地板（左緣）",
    "role": "floor",
    "file": "images/background/Back-room-floor05.png",
    "w": 1,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_bg_backroom_floor06",
    "name": "後室地板（右緣）",
    "role": "floor",
    "file": "images/background/Back-room-floor06.png",
    "w": 1,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_bg_anomalous_core",
    "name": "異質核心",
    "role": "floor",
    "file": "images/background/Anomalous-Core.png",
    "w": 2,
    "h": 3
  },
  {
    "id": "tile_bg_backroom_pillar3",
    "name": "後室柱子（裂損）",
    "role": "floor",
    "file": "images/background/Back-room-Pillar3.png",
    "w": 1,
    "h": 4
  },
  {
    "id": "tile_bg_pillar",
    "name": "大廳柱子（原版）",
    "role": "floor",
    "file": "images/background/pillar.png",
    "w": 2,
    "h": 8
  },
  {
    "id": "tile_bg_pillar02",
    "name": "大廳柱子（裂損）",
    "role": "floor",
    "file": "images/background/pillar02.png",
    "w": 2,
    "h": 8
  },
  {
    "id": "tile_bg_pillar03",
    "name": "大廳柱子（水晶突出）",
    "role": "floor",
    "file": "images/background/pillar03.png",
    "w": 2,
    "h": 8
  },
  {
    "id": "tile_bg_pillar04",
    "name": "大廳柱子（水晶嵌入）",
    "role": "floor",
    "file": "images/background/pillar04.png",
    "w": 2,
    "h": 8
  },
  {
    "id": "tile_new_decor_oil_tank",
    "name": "油箱",
    "role": "floor",
    "file": "images/item-decorate/oil-tank.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_bg_backroom_wall02_half",
    "name": "後室半牆",
    "role": "floor",
    "file": "images/background/Back-room-wall02-half.png",
    "w": 3,
    "h": 3
  },
  {
    "id": "tile_bg_backroom_wall02_hole",
    "name": "後室牆面（門洞）",
    "role": "floor",
    "file": "images/background/Back-room-wall02-hole.png",
    "w": 3,
    "h": 3
  },
  {
    "id": "tile_bg_backroom_door_wood",
    "name": "後室木門",
    "role": "floor",
    "file": "images/background/Back-room-door-v2.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_cvs_famiport",
    "name": "多媒體事務機（綠）",
    "role": "floor",
    "file": "images/convenience-store/cvs-famiport.png",
    "w": 1,
    "h": 3
  },
  {
    "id": "tile_cvs_ibon_kiosk",
    "name": "多媒體事務機（灰）",
    "role": "floor",
    "file": "images/convenience-store/cvs-ibon-kiosk.png",
    "w": 1,
    "h": 3
  },
  {
    "id": "tile_cvs_ice_cream_freezer",
    "name": "冰品櫃",
    "role": "floor",
    "file": "images/convenience-store/cvs-ice-cream-freezer.png",
    "w": 3,
    "h": 3
  },
  {
    "id": "tile_cvs_checkout_counter",
    "name": "結帳櫃台",
    "role": "floor",
    "file": "images/convenience-store/cvs-checkout-counter.png",
    "w": 5,
    "h": 3
  },
  {
    "id": "tile_cvs_counter_extension",
    "name": "櫃台（延伸段）",
    "role": "floor",
    "file": "images/convenience-store/cvs-counter-extension.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_cvs_back_counter",
    "name": "背後櫃（菸櫃＋微波爐＋茶葉蛋）",
    "role": "floor",
    "file": "images/convenience-store/cvs-back-counter.png",
    "w": 6,
    "h": 3
  },
  {
    "id": "tile_cvs_snack_shelf",
    "name": "零食櫃",
    "role": "floor",
    "file": "images/convenience-store/cvs-snack-shelf.png",
    "w": 3,
    "h": 3
  },
  {
    "id": "tile_cvs_drink_cooler",
    "name": "飲料櫃",
    "role": "floor",
    "file": "images/convenience-store/cvs-drink-cooler.png",
    "w": 3,
    "h": 3
  },
  {
    "id": "tile_cvs_sign_home_mart",
    "name": "招牌（HOME Mart）",
    "role": "floor",
    "file": "images/convenience-store/cvs-sign-home-mart.png",
    "w": 8,
    "h": 1
  },
  {
    "id": "tile_cvs_sign_twelve",
    "name": "招牌（TWELVE）",
    "role": "floor",
    "file": "images/convenience-store/cvs-sign-twelve.png",
    "w": 8,
    "h": 1
  },
  {
    "id": "tile_street_ubike",
    "name": "公共自行車",
    "role": "floor",
    "file": "images/street/street-ubike.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_street_scooter_delivery_green",
    "name": "外送機車（綠）",
    "role": "floor",
    "file": "images/street/street-scooter-delivery-green.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_street_scooter_delivery_pink",
    "name": "外送機車（粉）",
    "role": "floor",
    "file": "images/street/street-scooter-delivery-pink.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_street_capsule_toy_machines",
    "name": "扭蛋機（六台）",
    "role": "floor",
    "file": "images/street/street-capsule-toy-machines.png",
    "w": 3,
    "h": 3
  },
  {
    "id": "tile_street_utility_box_painted",
    "name": "變電箱（彩繪）",
    "role": "floor",
    "file": "images/street/street-utility-box-painted.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_street_utility_box",
    "name": "變電箱（綠）",
    "role": "floor",
    "file": "images/street/street-utility-box.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_street_folding_table",
    "name": "摺疊桌",
    "role": "floor",
    "file": "images/street/street-folding-table.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_street_plastic_stool",
    "name": "紅色塑膠椅",
    "role": "floor",
    "file": "images/street/street-plastic-stool.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_street_plastic_stools_stacked",
    "name": "紅色塑膠椅（疊放）",
    "role": "floor",
    "file": "images/street/street-plastic-stools-stacked.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_street_bottle_red",
    "name": "紅色玻璃瓶",
    "role": "floor",
    "file": "images/street/street-bottle-red.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_street_bollard_red",
    "name": "車阻（紅白）",
    "role": "floor",
    "file": "images/street/street-bollard-red.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_street_bollard_yellow",
    "name": "車阻（黃黑）",
    "role": "floor",
    "file": "images/street/street-bollard-yellow.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_street_sign_no_entry",
    "name": "標誌：禁止進入",
    "role": "floor",
    "file": "images/street/street-sign-no-entry.png",
    "w": 1,
    "h": 3
  },
  {
    "id": "tile_street_sign_stop",
    "name": "標誌：停",
    "role": "floor",
    "file": "images/street/street-sign-stop.png",
    "w": 1,
    "h": 3
  },
  {
    "id": "tile_street_sign_scooter_lanes",
    "name": "標誌：機車左轉／直行",
    "role": "floor",
    "file": "images/street/street-sign-scooter-lanes.png",
    "w": 1,
    "h": 3
  },
  {
    "id": "tile_street_sign_two_stage_turn",
    "name": "標誌：機慢車兩段左轉",
    "role": "floor",
    "file": "images/street/street-sign-two-stage-turn.png",
    "w": 1,
    "h": 3
  },
  {
    "id": "tile_street_sign_turn_right",
    "name": "標誌：右轉",
    "role": "floor",
    "file": "images/street/street-sign-turn-right.png",
    "w": 1,
    "h": 3
  },
  {
    "id": "tile_street_sign_no_left_turn",
    "name": "標誌：禁止左轉",
    "role": "floor",
    "file": "images/street/street-sign-no-left-turn.png",
    "w": 1,
    "h": 3
  },
  {
    "id": "tile_street_sign_speed_limit_50",
    "name": "標誌：速限 50",
    "role": "floor",
    "file": "images/street/street-sign-speed-limit-50.png",
    "w": 1,
    "h": 3
  },
  {
    "id": "tile_street_traffic_light",
    "name": "紅綠燈",
    "role": "floor",
    "file": "images/street/street-traffic-light.png",
    "w": 1,
    "h": 3
  },
  {
    "id": "tile_street_name_sign_pole",
    "name": "路名牌＋行人號誌（中正路）",
    "role": "floor",
    "file": "images/street/street-name-sign-pole.png",
    "w": 3,
    "h": 5
  },
  {
    "id": "tile_street_crosswalk",
    "name": "斑馬線",
    "role": "floor",
    "file": "images/street/street-crosswalk.png",
    "w": 2,
    "h": 4,
    "flat": true
  },
  {
    "id": "tile_street_area_map_board",
    "name": "周邊地圖看板",
    "role": "floor",
    "file": "images/street/street-area-map-board.png",
    "w": 4,
    "h": 4
  },
  {
    "id": "tile_street_stall_steak",
    "name": "攤車：平價牛排",
    "role": "floor",
    "file": "images/street/street-stall-steak.png",
    "w": 3,
    "h": 4
  },
  {
    "id": "tile_street_stall_noodles",
    "name": "攤車：陽春麵",
    "role": "floor",
    "file": "images/street/street-stall-noodles.png",
    "w": 4,
    "h": 4
  },
  {
    "id": "tile_street_stall_drinks",
    "name": "攤車：飲料",
    "role": "floor",
    "file": "images/street/street-stall-drinks.png",
    "w": 4,
    "h": 4
  },
  {
    "id": "tile_mrt_exit_2",
    "name": "捷運出口 2",
    "role": "floor",
    "file": "images/捷運車站/mrt-exit-2.png",
    "w": 5,
    "h": 6
  },
  {
    "id": "tile_mrt_exit_2_sealed",
    "name": "捷運出口 2（封鎖）",
    "role": "floor",
    "file": "images/捷運車站/mrt-exit-2-sealed.png",
    "w": 5,
    "h": 6
  },
  {
    "id": "tile_mrt_map_kiosk",
    "name": "路網圖看板",
    "role": "floor",
    "file": "images/捷運車站/mrt-map-kiosk.png",
    "w": 2,
    "h": 3
  },
  {
    "id": "tile_bg_backroom_wall02_dmg_crack",
    "name": "後室牆面（裂縫）",
    "role": "floor",
    "file": "images/background/Back-room-wall02-damage-03.png",
    "w": 3,
    "h": 3
  },
  {
    "id": "tile_bg_backroom_wall02_hole2",
    "name": "後室牆面（破洞）",
    "role": "floor",
    "file": "images/background/Back-room-wall02-hole2.png",
    "w": 3,
    "h": 3
  },
  {
    "id": "tile_street_claw_machine",
    "name": "夾娃娃機",
    "role": "floor",
    "file": "images/street/street-claw-machine.png",
    "w": 2,
    "h": 3
  },
  {
    "id": "tile_poolcore_wall_corner",
    "name": "池核｜牆角磁磚",
    "role": "floor",
    "file": "images/池核/poolcore-wall-corner.png",
    "w": 1,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_poolcore_wall_vertical",
    "name": "池核｜直向牆面",
    "role": "floor",
    "file": "images/池核/poolcore-wall-vertical.png",
    "w": 1,
    "h": 3,
    "flat": true
  },
  {
    "id": "tile_poolcore_floor_blue",
    "name": "池核｜藍色地磚",
    "role": "floor",
    "file": "images/池核/poolcore-floor-blue.png",
    "w": 1,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_poolcore_floor_gradient",
    "name": "池核｜漸層地磚",
    "role": "floor",
    "file": "images/池核/poolcore-floor-gradient.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_poolcore_deep_water_gradient",
    "name": "池核｜深水漸層",
    "role": "floor",
    "file": "images/池核/poolcore-deep-water-gradient.png",
    "w": 1,
    "h": 5,
    "flat": true
  },
  {
    "id": "tile_poolcore_deep_water",
    "name": "池核｜深色水面",
    "role": "floor",
    "file": "images/池核/poolcore-deep-water.png",
    "w": 1,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_poolcore_wall_wide",
    "name": "池核｜橫向牆面",
    "role": "floor",
    "file": "images/池核/poolcore-wall-wide.png",
    "w": 2,
    "h": 3,
    "flat": true
  },
  {
    "id": "tile_poolcore_wall_edge",
    "name": "池核｜牆面收邊",
    "role": "floor",
    "file": "images/池核/poolcore-wall-edge.png",
    "w": 2,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_poolcore_floor_pale",
    "name": "池核｜淺色地磚",
    "role": "floor",
    "file": "images/池核/poolcore-floor-pale.png",
    "w": 1,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_poolcore_wall_edge_wide",
    "name": "池核｜寬版牆面收邊",
    "role": "floor",
    "file": "images/池核/poolcore-wall-edge-wide.png",
    "w": 2,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_mv1cfh6l",
    "name": "poolcore-wall-corner02",
    "role": "floor",
    "file": "images/池核/poolcore-wall-corner02.png",
    "w": 1,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_mv1cftaj",
    "name": "poolcore-wall-edge-wide02",
    "role": "floor",
    "file": "images/池核/poolcore-wall-edge-wide02.png",
    "w": 2,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_poolcore_life_ring_blue",
    "name": "池核｜藍白救生圈",
    "role": "floor",
    "file": "images/池核/poolcore-life-ring-blue.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_poolcore_life_ring_red",
    "name": "池核｜紅白救生圈",
    "role": "floor",
    "file": "images/池核/poolcore-life-ring-red.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_poolcore_waterline_wall",
    "name": "池核｜條紋水線牆",
    "role": "floor",
    "file": "images/池核/poolcore-waterline-wall.png",
    "w": 2,
    "h": 3,
    "flat": true
  },
  {
    "id": "tile_mv1ejvf0",
    "name": "Back-room-wall03",
    "role": "floor",
    "file": "images/background/Back-room-wall03.png",
    "w": 1,
    "h": 5,
    "flat": true
  },
  {
    "id": "tile_mv1ek330",
    "name": "Back-room-wall - 04",
    "role": "floor",
    "file": "images/background/Back-room-wall - 04.png",
    "w": 1,
    "h": 3,
    "flat": true
  },
  {
    "id": "tile_field_ammo_crate_open",
    "name": "彈藥箱（打開）",
    "role": "floor",
    "file": "images/field-camp/ammo-crate-open.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_obstacle_ore_small",
    "name": "小型異質礦",
    "role": "floor",
    "file": "images/item-obstacle/09-ore-small.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_obstacle_ore_large",
    "name": "大型異質礦",
    "role": "floor",
    "file": "images/item-obstacle/10-ore-large.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_obstacle_ore_rare",
    "name": "稀有紫晶礦",
    "role": "floor",
    "file": "images/item-obstacle/11-ore-rare.png",
    "w": 2,
    "h": 3
  },
  {
    "id": "tile_interactive_storage_locker",
    "name": "置物箱（鎖住）",
    "role": "floor",
    "file": "images/scene-props/storage-locker-closed.png",
    "w": 3,
    "h": 3
  },
  {
    "id": "tile_interactive_storage_locker_open",
    "name": "置物箱（開啟）",
    "role": "floor",
    "file": "images/scene-props/storage-locker-open.png",
    "w": 3,
    "h": 3
  },
  {
    "id": "tile_interactive_power_switch_on",
    "name": "電源開關（開）",
    "role": "floor",
    "file": "images/scene-props/power-switch-on.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_interactive_power_switch_off",
    "name": "電源開關（關）",
    "role": "floor",
    "file": "images/scene-props/power-switch-off.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_interactive_flare_ammo",
    "name": "照明彈",
    "role": "floor",
    "file": "images/items/flare-ammo.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_interactive_storage_locker_key",
    "name": "置物箱鑰匙（可拾取）",
    "role": "floor",
    "file": "images/items/storage-locker-key.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_interactive_electric_light_02",
    "name": "electric-light-02（電源控制燈）",
    "role": "floor",
    "file": "images/background/electric-light-02.png",
    "w": 2,
    "h": 1
  },
  {
    "id": "tile_interactive_pickup_battery",
    "name": "拾取亮點（電池）",
    "role": "floor",
    "file": "images/items/battery.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_interactive_pickup_almond_water",
    "name": "拾取亮點（杏仁水）",
    "role": "floor",
    "file": "images/items/almond-water-small.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_mv5my8dk",
    "name": "electric-light-02",
    "role": "floor",
    "file": "images/background/electric-light-02.png",
    "w": 2,
    "h": 1
  },
  {
    "id": "tile_obstacle_irongate",
    "name": "滑動鐵門",
    "role": "floor",
    "file": "images/item-obstacle/12-irongate.png",
    "w": 4,
    "h": 2
  },
  {
    "id": "tile_hq_monitor_wall",
    "name": "監控大螢幕",
    "role": "floor",
    "file": "images/指揮部/hq-monitor-wall.png",
    "w": 5,
    "h": 3
  },
  {
    "id": "tile_hq_briefing_board",
    "name": "作戰白板",
    "role": "floor",
    "file": "images/指揮部/hq-briefing-board.png",
    "w": 4,
    "h": 3
  },
  {
    "id": "tile_hq_command_table",
    "name": "作戰指揮桌",
    "role": "floor",
    "file": "images/指揮部/hq-command-table.png",
    "w": 5,
    "h": 3
  },
  {
    "id": "tile_hq_computer_desk",
    "name": "電腦辦公桌",
    "role": "floor",
    "file": "images/指揮部/hq-computer-desk.png",
    "w": 4,
    "h": 3
  },
  {
    "id": "tile_hq_desk_vertical",
    "name": "辦公桌（直放）",
    "role": "floor",
    "file": "images/指揮部/hq-desk-vertical.png",
    "w": 2,
    "h": 5
  },
  {
    "id": "tile_hq_corkboard",
    "name": "軟木公告欄",
    "role": "floor",
    "file": "images/指揮部/hq-corkboard.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_hq_wall_side",
    "name": "指揮部牆面（側邊）",
    "role": "floor",
    "file": "images/指揮部/hq-wall-side.png",
    "w": 1,
    "h": 4
  },
  {
    "id": "tile_hq_server_rack",
    "name": "伺服器機櫃",
    "role": "floor",
    "file": "images/指揮部/hq-server-rack.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_hq_potted_plant",
    "name": "盆栽",
    "role": "floor",
    "file": "images/指揮部/hq-potted-plant.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_hq_office_chair_front",
    "name": "辦公椅（正面）",
    "role": "floor",
    "file": "images/指揮部/hq-office-chair-front.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_hq_office_chair_back",
    "name": "辦公椅（背面）",
    "role": "floor",
    "file": "images/指揮部/hq-office-chair-back.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_hq_sign",
    "name": "指揮部門牌",
    "role": "floor",
    "file": "images/指揮部/hq-sign.png",
    "w": 2,
    "h": 1
  },
  {
    "id": "tile_hq_poster",
    "name": "小海報",
    "role": "floor",
    "file": "images/指揮部/hq-poster.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_hq_floor",
    "name": "指揮部地板",
    "role": "floor",
    "file": "images/指揮部/hq-floor.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_hq_stairs",
    "name": "樓梯",
    "role": "floor",
    "file": "images/指揮部/hq-stairs.png",
    "w": 2,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_research_lab_tools_tray",
    "name": "研究部｜實驗工具盤",
    "role": "floor",
    "file": "images/研究部/research-tools-tray.png",
    "w": 2,
    "h": 1
  },
  {
    "id": "tile_research_lab_sample_storage",
    "name": "研究部｜樣本收納架",
    "role": "floor",
    "file": "images/研究部/research-sample-storage.png",
    "w": 2,
    "h": 3
  },
  {
    "id": "tile_research_lab_crystal_containment_pod",
    "name": "研究部｜晶體收容艙",
    "role": "floor",
    "file": "images/研究部/research-crystal-containment-pod.png",
    "w": 2,
    "h": 4
  },
  {
    "id": "tile_research_lab_microscope_workstation",
    "name": "研究部｜顯微鏡工作台",
    "role": "floor",
    "file": "images/研究部/research-microscope-workstation.png",
    "w": 3,
    "h": 4
  },
  {
    "id": "tile_research_lab_analysis_table",
    "name": "研究部｜實驗分析桌",
    "role": "floor",
    "file": "images/研究部/research-analysis-table.png",
    "w": 5,
    "h": 3
  },
  {
    "id": "tile_research_lab_specimen_cabinet",
    "name": "研究部｜樣本櫃",
    "role": "floor",
    "file": "images/研究部/research-specimen-cabinet.png",
    "w": 2,
    "h": 3
  },
  {
    "id": "tile_research_lab_control_workstation",
    "name": "研究部｜研究控制台",
    "role": "floor",
    "file": "images/研究部/research-control-workstation.png",
    "w": 4,
    "h": 3
  },
  {
    "id": "tile_mv9qoz8k",
    "name": "Research-Department",
    "role": "floor",
    "file": "images/研究部/Research-Department.png",
    "w": 2,
    "h": 1
  },
  {
    "id": "tile_street_drink_shop_narrow",
    "name": "飲料店：窄型櫃台（可互動）",
    "role": "floor",
    "file": "images/street/drink-shop-narrow.png",
    "w": 1,
    "h": 3
  },
  {
    "id": "tile_street_drink_shop_small",
    "name": "飲料店：小型店面（可互動）",
    "role": "floor",
    "file": "images/street/drink-shop-small.png",
    "w": 2,
    "h": 3
  },
  {
    "id": "tile_street_drink_shop_wide",
    "name": "飲料店：寬型店面（可互動）",
    "role": "floor",
    "file": "images/street/drink-shop-wide.png",
    "w": 3,
    "h": 3
  },
  {
    "id": "tile_mvb9505y",
    "name": "Back-room-wall-020",
    "role": "floor",
    "file": "images/background/Back-room-wall-020.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_bg_backroom_wall02_breakable",
    "name": "後室牆面（可炸開）",
    "role": "floor",
    "file": "images/background/Back-room-wall02.png",
    "w": 3,
    "h": 3
  },
  {
    "id": "tile_bg_backroom_wall02_secret",
    "name": "後室牆面（可炸開・隱藏區）",
    "role": "floor",
    "file": "images/background/Back-room-wall02.png",
    "w": 3,
    "h": 3
  },
  {
    "id": "tile_cvs_checkout_counter_backroom",
    "name": "後室便利商店櫃台（後室商店）",
    "role": "floor",
    "file": "images/convenience-store/cvs-checkout-counter.png",
    "w": 5,
    "h": 3
  },
  {
    "id": "tile_bg_extra_chained_door",
    "name": "鎖鏈木門",
    "role": "floor",
    "file": "images/background/Back-room-door-chained.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_bg_extra_floor02_extra",
    "name": "後室地板（變化 02）",
    "role": "floor",
    "file": "images/background/Back-room-floor02.png",
    "w": 1,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_bg_extra_high_pillar",
    "name": "後室高柱",
    "role": "floor",
    "file": "images/background/Back-room-highPillar.png",
    "w": 1,
    "h": 7
  },
  {
    "id": "tile_bg_extra_high_wall",
    "name": "後室高牆",
    "role": "floor",
    "file": "images/background/Back-room-highwall.png",
    "w": 1,
    "h": 6
  },
  {
    "id": "tile_bg_extra_oil_drum_background",
    "name": "油桶（背景素材）",
    "role": "floor",
    "file": "images/background/oil-drum.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_bg_extra_traffic_cone_01",
    "name": "交通錐 01",
    "role": "floor",
    "file": "images/background/Traffic cones-01.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_bg_extra_traffic_cone_02",
    "name": "交通錐 02",
    "role": "floor",
    "file": "images/background/Traffic cones-02.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_bg_extra_traffic_cone_03",
    "name": "交通錐 03",
    "role": "floor",
    "file": "images/background/Traffic cones-03.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_mvcrmipy",
    "name": "mrt-stairs-dark-high",
    "role": "floor",
    "file": "images/捷運車站/mrt-stairs-dark-high.png",
    "w": 2,
    "h": 7,
    "flat": true
  },
  {
    "id": "tile_mvcsj5eh",
    "name": "Back-room-wall04",
    "role": "floor",
    "file": "images/background/Back-room-wall04.png",
    "w": 1,
    "h": 5
  },
  {
    "id": "tile_interactive_pickup_graffiti_red",
    "name": "拾取亮點（塗鴉筆・紅）",
    "role": "floor",
    "file": "images/塗鴉筆/pen-red.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_interactive_pickup_graffiti_blue",
    "name": "拾取亮點（塗鴉筆・藍）",
    "role": "floor",
    "file": "images/塗鴉筆/pen-blue.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_interactive_pickup_graffiti_black",
    "name": "拾取亮點（塗鴉筆・黑）",
    "role": "floor",
    "file": "images/塗鴉筆/pen-black.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_interactive_pickup_backroom_door_key",
    "name": "拾取亮點（後室門鑰匙）",
    "role": "floor",
    "file": "images/碎片鑰匙/後室門鑰匙.png",
    "w": 1,
    "h": 1
  }
];

const BASE_MAPS = [
  {
    "id": "map_mu5ad7t2",
    "name": "2F-應變中心",
    "desc": "",
    "layers": {
      "floor": {
        "34,2": "tile_new_bg_floor",
        "34,3": "tile_new_bg_floor",
        "34,4": "tile_new_bg_floor",
        "34,5": "tile_new_bg_floor",
        "34,6": "tile_new_bg_floor",
        "34,7": "tile_new_bg_floor",
        "34,8": "tile_new_bg_floor",
        "34,9": "tile_new_bg_floor",
        "34,10": "tile_new_bg_floor",
        "34,11": "tile_new_bg_floor",
        "34,12": "tile_new_bg_floor",
        "33,12": "tile_new_bg_floor",
        "33,13": "floor",
        "44,13": "tile_new_bg_floor",
        "44,12": "tile_new_bg_floor",
        "44,11": "tile_new_bg_floor",
        "44,10": "tile_new_bg_floor",
        "43,13": "tile_new_bg_floor",
        "17,9": "tile_new_bg_floor",
        "17,10": "tile_new_bg_floor",
        "17,11": "tile_new_bg_floor",
        "17,12": "tile_new_bg_floor",
        "17,13": "tile_new_bg_floor",
        "18,13": "tile_new_bg_floor",
        "18,12": "tile_new_bg_floor",
        "18,11": "tile_new_bg_floor",
        "18,10": "tile_new_bg_floor",
        "18,9": "tile_new_bg_floor",
        "20,9": "tile_new_bg_floor",
        "20,10": "tile_new_bg_floor",
        "20,11": "tile_new_bg_floor",
        "19,12": "tile_new_bg_floor",
        "19,13": "tile_new_bg_floor",
        "19,11": "tile_new_bg_floor",
        "19,10": "tile_new_bg_floor",
        "19,9": "tile_new_bg_floor",
        "21,9": "tile_new_bg_floor",
        "21,10": "tile_new_bg_floor",
        "21,11": "tile_new_bg_floor",
        "21,12": "tile_new_bg_floor",
        "21,13": "tile_new_bg_floor",
        "20,13": "tile_new_bg_floor",
        "20,12": "tile_new_bg_floor",
        "22,9": "tile_new_bg_floor",
        "22,10": "tile_new_bg_floor",
        "22,11": "tile_new_bg_floor",
        "22,12": "tile_new_bg_floor",
        "22,13": "tile_new_bg_floor",
        "23,13": "tile_new_bg_floor",
        "23,12": "tile_new_bg_floor",
        "23,11": "tile_new_bg_floor",
        "23,10": "tile_new_bg_floor",
        "23,9": "tile_new_bg_floor",
        "24,9": "tile_new_bg_floor",
        "24,10": "tile_new_bg_floor",
        "24,11": "tile_new_bg_floor",
        "24,12": "tile_new_bg_floor",
        "24,13": "tile_new_bg_floor",
        "25,13": "tile_new_bg_floor",
        "25,12": "tile_new_bg_floor",
        "26,9": "tile_new_bg_floor",
        "26,10": "tile_new_bg_floor",
        "25,10": "tile_new_bg_floor",
        "25,11": "tile_new_bg_floor",
        "27,13": "tile_new_bg_floor",
        "26,13": "tile_new_bg_floor",
        "26,12": "tile_new_bg_floor",
        "26,11": "tile_new_bg_floor",
        "27,2": "tile_new_bg_floor",
        "27,3": "tile_new_bg_floor",
        "27,4": "tile_new_bg_floor",
        "27,5": "tile_new_bg_floor",
        "27,6": "tile_new_bg_floor",
        "27,7": "tile_new_bg_floor",
        "28,13": "tile_new_bg_floor",
        "28,12": "tile_new_bg_floor",
        "27,11": "tile_new_bg_floor",
        "27,10": "tile_new_bg_floor",
        "27,9": "tile_new_bg_floor",
        "27,8": "tile_new_bg_floor",
        "25,9": "tile_new_bg_floor",
        "28,11": "tile_new_bg_floor",
        "28,10": "tile_new_bg_floor",
        "28,9": "tile_new_bg_floor",
        "28,8": "tile_new_bg_floor",
        "28,7": "tile_new_bg_floor",
        "28,6": "tile_new_bg_floor",
        "28,5": "tile_new_bg_floor",
        "28,4": "tile_new_bg_floor",
        "28,3": "tile_new_bg_floor",
        "28,2": "tile_new_bg_floor",
        "29,2": "tile_new_bg_floor",
        "29,3": "tile_new_bg_floor",
        "29,4": "tile_new_bg_floor",
        "29,5": "tile_new_bg_floor",
        "29,6": "tile_new_bg_floor",
        "29,8": "tile_new_bg_floor",
        "29,9": "tile_new_bg_floor",
        "29,10": "tile_new_bg_floor",
        "29,11": "tile_new_bg_floor",
        "29,12": "tile_new_bg_floor",
        "29,13": "tile_new_bg_floor",
        "27,12": "tile_new_bg_floor",
        "29,7": "tile_new_bg_floor",
        "30,7": "tile_new_bg_floor",
        "30,6": "tile_new_bg_floor",
        "30,5": "tile_new_bg_floor",
        "31,5": "tile_new_bg_floor",
        "31,4": "tile_new_bg_floor",
        "31,3": "tile_new_bg_floor",
        "31,2": "tile_new_bg_floor",
        "33,2": "tile_new_bg_floor",
        "33,3": "tile_new_bg_floor",
        "32,3": "tile_new_bg_floor",
        "30,2": "tile_new_bg_floor",
        "30,3": "tile_new_bg_floor",
        "30,4": "tile_new_bg_floor",
        "31,6": "tile_new_bg_floor",
        "32,6": "tile_new_bg_floor",
        "32,5": "tile_new_bg_floor",
        "32,4": "tile_new_bg_floor",
        "33,4": "tile_new_bg_floor",
        "33,5": "tile_new_bg_floor",
        "33,6": "tile_new_bg_floor",
        "33,7": "tile_new_bg_floor",
        "33,8": "tile_new_bg_floor",
        "33,9": "tile_new_bg_floor",
        "33,10": "tile_new_bg_floor",
        "33,11": "tile_new_bg_floor",
        "31,13": "tile_new_bg_floor",
        "31,12": "tile_new_bg_floor",
        "31,11": "tile_new_bg_floor",
        "31,10": "tile_new_bg_floor",
        "31,9": "tile_new_bg_floor",
        "31,8": "tile_new_bg_floor",
        "31,7": "tile_new_bg_floor",
        "32,10": "tile_new_bg_floor",
        "32,11": "tile_new_bg_floor",
        "32,12": "tile_new_bg_floor",
        "32,13": "tile_new_bg_floor",
        "32,7": "tile_new_bg_floor",
        "35,4": "tile_new_bg_floor",
        "35,5": "tile_new_bg_floor",
        "35,7": "tile_new_bg_floor",
        "35,8": "tile_new_bg_floor",
        "35,9": "tile_new_bg_floor",
        "35,11": "tile_new_bg_floor",
        "34,13": "tile_new_bg_floor",
        "35,6": "tile_new_bg_floor",
        "35,10": "tile_new_bg_floor",
        "36,7": "tile_new_bg_floor",
        "37,8": "tile_new_bg_floor",
        "37,9": "tile_new_bg_floor",
        "37,10": "tile_new_bg_floor",
        "36,11": "tile_new_bg_floor",
        "36,6": "tile_new_bg_floor",
        "37,6": "tile_new_bg_floor",
        "36,10": "tile_new_bg_floor",
        "36,9": "tile_new_bg_floor",
        "36,5": "tile_new_bg_floor",
        "37,5": "tile_new_bg_floor",
        "36,8": "tile_new_bg_floor",
        "37,7": "tile_new_bg_floor",
        "37,4": "tile_new_bg_floor",
        "35,3": "tile_new_bg_floor",
        "36,3": "tile_new_bg_floor",
        "36,4": "tile_new_bg_floor",
        "35,2": "tile_new_bg_floor",
        "37,2": "tile_new_bg_floor",
        "32,2": "tile_new_bg_floor",
        "37,3": "tile_new_bg_floor",
        "36,2": "tile_new_bg_floor",
        "43,11": "tile_new_bg_floor",
        "43,12": "tile_new_bg_floor",
        "42,13": "tile_new_bg_floor",
        "30,8": "tile_new_bg_floor",
        "30,13": "tile_new_bg_floor",
        "30,12": "tile_new_bg_floor",
        "30,11": "tile_new_bg_floor",
        "30,10": "tile_new_bg_floor",
        "30,9": "tile_new_bg_floor",
        "32,8": "tile_new_bg_floor",
        "32,9": "tile_new_bg_floor",
        "38,13": "tile_new_bg_floor",
        "39,13": "tile_new_bg_floor",
        "37,13": "tile_new_bg_floor",
        "36,13": "tile_new_bg_floor",
        "35,13": "tile_new_bg_floor",
        "40,13": "tile_new_bg_floor",
        "41,13": "tile_new_bg_floor",
        "35,12": "tile_new_bg_floor",
        "37,11": "tile_new_bg_floor",
        "38,11": "tile_new_bg_floor",
        "40,11": "tile_new_bg_floor",
        "41,12": "tile_new_bg_floor",
        "42,12": "tile_new_bg_floor",
        "40,12": "tile_new_bg_floor",
        "39,12": "tile_new_bg_floor",
        "38,12": "tile_new_bg_floor",
        "37,12": "tile_new_bg_floor",
        "36,12": "tile_new_bg_floor",
        "41,11": "tile_new_bg_floor",
        "42,11": "tile_new_bg_floor",
        "40,10": "tile_new_bg_floor",
        "38,10": "tile_new_bg_floor",
        "39,10": "tile_new_bg_floor",
        "41,10": "tile_new_bg_floor",
        "43,10": "tile_new_bg_floor",
        "42,10": "tile_new_bg_floor",
        "39,11": "tile_new_bg_floor",
        "45,10": "tile_new_bg_floor",
        "45,11": "tile_new_bg_floor",
        "45,12": "tile_new_bg_floor",
        "45,13": "tile_new_bg_floor",
        "48,12": "tile_new_bg_floor",
        "48,13": "tile_new_bg_floor",
        "47,10": "tile_new_bg_floor",
        "47,11": "tile_new_bg_floor",
        "47,12": "tile_new_bg_floor",
        "47,13": "tile_new_bg_floor",
        "46,10": "tile_new_bg_floor",
        "46,12": "tile_new_bg_floor",
        "46,13": "tile_new_bg_floor",
        "46,11": "tile_new_bg_floor",
        "48,10": "tile_new_bg_floor",
        "48,11": "tile_new_bg_floor",
        "49,13": "tile_new_bg_floor",
        "50,13": "tile_new_bg_floor",
        "51,13": "tile_new_bg_floor",
        "52,13": "tile_new_bg_floor",
        "53,13": "tile_new_bg_floor",
        "54,13": "tile_new_bg_floor",
        "49,12": "tile_new_bg_floor",
        "50,12": "tile_new_bg_floor",
        "51,12": "tile_new_bg_floor",
        "52,12": "tile_new_bg_floor",
        "53,12": "tile_new_bg_floor",
        "54,12": "tile_new_bg_floor",
        "49,11": "tile_new_bg_floor",
        "50,11": "tile_new_bg_floor",
        "51,11": "tile_new_bg_floor",
        "52,11": "tile_new_bg_floor",
        "53,11": "tile_new_bg_floor",
        "54,11": "tile_new_bg_floor",
        "49,10": "tile_new_bg_floor",
        "50,10": "tile_new_bg_floor",
        "51,10": "tile_new_bg_floor",
        "52,10": "tile_new_bg_floor",
        "53,10": "tile_new_bg_floor",
        "54,10": "tile_new_bg_floor",
        "31,1": "floor",
        "16,12": "tile_new_bg_floor",
        "15,13": "tile_new_bg_floor",
        "15,12": "tile_new_bg_floor",
        "16,11": "tile_new_bg_floor",
        "16,10": "tile_new_bg_floor",
        "15,10": "tile_new_bg_floor",
        "15,11": "tile_new_bg_floor",
        "16,13": "tile_new_bg_floor",
        "15,14": "tile_new_bg_floor",
        "16,14": "tile_new_bg_floor",
        "17,14": "tile_new_bg_floor",
        "18,14": "tile_new_bg_floor",
        "19,14": "tile_new_bg_floor",
        "20,14": "tile_new_bg_floor",
        "22,14": "tile_new_bg_floor",
        "24,14": "tile_new_bg_floor",
        "26,14": "tile_new_bg_floor",
        "27,14": "tile_new_bg_floor",
        "21,14": "tile_new_bg_floor",
        "23,14": "tile_new_bg_floor",
        "28,14": "tile_new_bg_floor",
        "29,14": "tile_new_bg_floor",
        "30,14": "tile_new_bg_floor",
        "31,14": "tile_new_bg_floor",
        "32,14": "tile_new_bg_floor",
        "33,14": "tile_new_bg_floor",
        "34,14": "tile_new_bg_floor",
        "35,14": "tile_new_bg_floor",
        "36,14": "tile_new_bg_floor",
        "37,14": "tile_new_bg_floor",
        "38,14": "tile_new_bg_floor",
        "39,14": "tile_new_bg_floor",
        "40,14": "tile_new_bg_floor",
        "41,14": "tile_new_bg_floor",
        "42,14": "tile_new_bg_floor",
        "43,14": "tile_new_bg_floor",
        "44,14": "tile_new_bg_floor",
        "48,14": "tile_new_bg_floor",
        "49,14": "tile_new_bg_floor",
        "50,14": "tile_new_bg_floor",
        "51,14": "tile_new_bg_floor",
        "52,14": "tile_new_bg_floor",
        "53,14": "tile_new_bg_floor",
        "54,14": "tile_new_bg_floor",
        "46,14": "tile_new_bg_floor",
        "25,14": "tile_new_bg_floor",
        "45,14": "tile_new_bg_floor",
        "47,14": "tile_new_bg_floor",
        "14,14": "tile_new_bg_floor",
        "13,14": "tile_new_bg_floor",
        "12,14": "tile_new_bg_floor",
        "11,14": "tile_new_bg_floor",
        "10,14": "tile_new_bg_floor",
        "8,14": "tile_new_bg_floor",
        "9,14": "tile_new_bg_floor",
        "14,13": "tile_new_bg_floor",
        "13,13": "tile_new_bg_floor",
        "12,13": "tile_new_bg_floor",
        "11,13": "tile_new_bg_floor",
        "10,13": "tile_new_bg_floor",
        "9,13": "tile_new_bg_floor",
        "8,13": "tile_new_bg_floor",
        "8,12": "tile_new_bg_floor",
        "9,12": "tile_new_bg_floor",
        "10,12": "tile_new_bg_floor",
        "11,12": "tile_new_bg_floor",
        "12,12": "tile_new_bg_floor",
        "13,12": "tile_new_bg_floor",
        "14,12": "tile_new_bg_floor",
        "14,11": "tile_new_bg_floor",
        "13,11": "tile_new_bg_floor",
        "12,11": "tile_new_bg_floor",
        "11,11": "tile_new_bg_floor",
        "10,11": "tile_new_bg_floor",
        "9,11": "tile_new_bg_floor",
        "8,11": "tile_new_bg_floor",
        "14,10": "tile_new_bg_floor",
        "13,10": "tile_new_bg_floor",
        "12,10": "tile_new_bg_floor",
        "11,10": "tile_new_bg_floor",
        "10,10": "tile_new_bg_floor",
        "9,10": "tile_new_bg_floor",
        "8,10": "tile_new_bg_floor",
        "7,11": "tile_new_bg_floor",
        "6,11": "tile_new_bg_floor",
        "5,11": "tile_new_bg_floor",
        "4,11": "tile_new_bg_floor",
        "3,11": "tile_new_bg_floor",
        "2,11": "tile_new_bg_floor",
        "1,11": "tile_new_bg_floor",
        "0,11": "tile_new_bg_floor",
        "7,12": "tile_new_bg_floor",
        "6,12": "tile_new_bg_floor",
        "5,12": "tile_new_bg_floor",
        "4,12": "tile_new_bg_floor",
        "3,12": "tile_new_bg_floor",
        "2,12": "tile_new_bg_floor",
        "0,12": "tile_new_bg_floor",
        "7,13": "tile_new_bg_floor",
        "6,13": "tile_new_bg_floor",
        "5,13": "tile_new_bg_floor",
        "4,13": "tile_new_bg_floor",
        "3,13": "tile_new_bg_floor",
        "2,13": "tile_new_bg_floor",
        "1,13": "tile_new_bg_floor",
        "0,13": "tile_new_bg_floor",
        "7,14": "tile_new_bg_floor",
        "6,14": "tile_new_bg_floor",
        "5,14": "tile_new_bg_floor",
        "4,14": "tile_new_bg_floor",
        "3,14": "tile_new_bg_floor",
        "2,14": "tile_new_bg_floor",
        "1,14": "tile_new_bg_floor",
        "0,14": "tile_new_bg_floor",
        "1,12": "tile_new_bg_floor",
        "7,10": "tile_new_bg_floor",
        "6,10": "tile_new_bg_floor",
        "5,10": "tile_new_bg_floor",
        "4,10": "tile_new_bg_floor",
        "3,10": "tile_new_bg_floor",
        "2,10": "tile_new_bg_floor",
        "1,10": "tile_new_bg_floor",
        "0,10": "tile_new_bg_floor",
        "5,9": "tile_new_bg_floor",
        "6,9": "tile_new_bg_floor",
        "7,9": "tile_new_bg_floor",
        "5,8": "tile_new_bg_floor",
        "6,8": "tile_new_bg_floor",
        "7,8": "tile_new_bg_floor",
        "8,8": "tile_new_bg_floor",
        "7,7": "tile_new_bg_floor",
        "6,7": "tile_new_bg_floor",
        "5,7": "tile_new_bg_floor",
        "4,7": "tile_new_bg_floor",
        "8,7": "tile_new_bg_floor",
        "55,14": "tile_new_bg_floor",
        "56,14": "tile_new_bg_floor",
        "57,14": "tile_new_bg_floor",
        "58,14": "tile_new_bg_floor",
        "59,14": "tile_new_bg_floor",
        "60,14": "tile_new_bg_floor",
        "61,14": "tile_new_bg_floor",
        "62,14": "tile_new_bg_floor",
        "63,14": "tile_new_bg_floor",
        "55,13": "tile_new_bg_floor",
        "56,13": "tile_new_bg_floor",
        "57,13": "tile_new_bg_floor",
        "58,13": "tile_new_bg_floor",
        "59,13": "tile_new_bg_floor",
        "60,13": "tile_new_bg_floor",
        "61,13": "tile_new_bg_floor",
        "62,13": "tile_new_bg_floor",
        "63,13": "tile_new_bg_floor",
        "55,12": "tile_new_bg_floor",
        "57,12": "tile_new_bg_floor",
        "58,12": "tile_new_bg_floor",
        "59,12": "tile_new_bg_floor",
        "60,12": "tile_new_bg_floor",
        "61,12": "tile_new_bg_floor",
        "62,12": "tile_new_bg_floor",
        "63,12": "tile_new_bg_floor",
        "56,12": "tile_new_bg_floor",
        "57,11": "tile_new_bg_floor",
        "58,11": "tile_new_bg_floor",
        "59,11": "tile_new_bg_floor",
        "60,11": "tile_new_bg_floor",
        "61,11": "tile_new_bg_floor",
        "62,11": "tile_new_bg_floor",
        "63,11": "tile_new_bg_floor",
        "55,11": "tile_new_bg_floor",
        "56,11": "tile_new_bg_floor",
        "56,10": "tile_new_bg_floor",
        "57,10": "tile_new_bg_floor",
        "57,9": "tile_new_bg_floor",
        "58,9": "tile_new_bg_floor",
        "59,9": "tile_new_bg_floor",
        "59,10": "tile_new_bg_floor",
        "58,10": "tile_new_bg_floor",
        "55,10": "tile_new_bg_floor",
        "60,10": "tile_new_bg_floor",
        "61,10": "tile_new_bg_floor",
        "62,10": "tile_new_bg_floor",
        "63,10": "tile_new_bg_floor",
        "63,9": "tile_new_bg_floor",
        "56,9": "tile_new_bg_floor",
        "56,8": "tile_new_bg_floor",
        "56,7": "tile_new_bg_floor",
        "57,7": "tile_new_bg_floor",
        "58,7": "tile_new_bg_floor",
        "58,8": "tile_new_bg_floor",
        "55,9": "tile_new_bg_floor",
        "55,7": "tile_new_bg_floor",
        "55,8": "tile_new_bg_floor",
        "57,8": "tile_new_bg_floor",
        "59,8": "tile_new_bg_floor",
        "59,7": "tile_new_bg_floor",
        "60,8": "tile_new_bg_floor",
        "26,15": "tile_hq_floor",
        "27,15": "tile_hq_floor",
        "28,15": "tile_hq_floor",
        "29,15": "tile_hq_floor",
        "30,15": "tile_hq_floor",
        "31,15": "tile_hq_floor",
        "32,15": "tile_hq_floor",
        "33,15": "tile_hq_floor",
        "34,15": "tile_hq_floor",
        "35,15": "tile_hq_floor",
        "36,15": "tile_hq_floor",
        "37,15": "tile_hq_floor",
        "38,15": "tile_hq_floor",
        "39,15": "tile_hq_floor",
        "25,15": "tile_hq_floor",
        "25,16": "tile_hq_floor",
        "25,17": "tile_hq_floor",
        "25,18": "tile_hq_floor",
        "25,19": "tile_hq_floor",
        "26,16": "tile_hq_floor",
        "27,16": "tile_hq_floor",
        "28,16": "tile_hq_floor",
        "29,16": "tile_hq_floor",
        "30,16": "tile_hq_floor",
        "31,16": "tile_hq_floor",
        "32,16": "tile_hq_floor",
        "33,16": "tile_hq_floor",
        "34,16": "tile_hq_floor",
        "35,16": "tile_hq_floor",
        "36,16": "tile_hq_floor",
        "37,16": "tile_hq_floor",
        "38,16": "tile_hq_floor",
        "39,16": "tile_hq_floor",
        "39,17": "tile_hq_floor",
        "39,18": "tile_hq_floor",
        "39,19": "tile_hq_floor",
        "38,20": "tile_hq_floor",
        "37,20": "tile_hq_floor",
        "35,20": "tile_hq_floor",
        "34,20": "tile_hq_floor",
        "33,20": "tile_hq_floor",
        "32,20": "tile_hq_floor",
        "31,20": "tile_hq_floor",
        "30,20": "tile_hq_floor",
        "29,20": "tile_hq_floor",
        "28,20": "tile_hq_floor",
        "27,19": "tile_hq_floor",
        "26,19": "tile_hq_floor",
        "26,18": "tile_hq_floor",
        "27,17": "tile_hq_floor",
        "28,17": "tile_hq_floor",
        "29,17": "tile_hq_floor",
        "30,17": "tile_hq_floor",
        "31,17": "tile_hq_floor",
        "32,17": "tile_hq_floor",
        "33,17": "tile_hq_floor",
        "34,17": "tile_hq_floor",
        "35,17": "tile_hq_floor",
        "36,17": "tile_hq_floor",
        "37,17": "tile_hq_floor",
        "38,17": "tile_hq_floor",
        "37,18": "tile_hq_floor",
        "36,18": "tile_hq_floor",
        "34,18": "tile_hq_floor",
        "33,18": "tile_hq_floor",
        "32,18": "tile_hq_floor",
        "26,17": "tile_hq_floor",
        "25,20": "tile_hq_floor",
        "26,20": "tile_hq_floor",
        "27,20": "tile_hq_floor",
        "31,19": "tile_hq_floor",
        "32,19": "tile_hq_floor",
        "33,19": "tile_hq_floor",
        "34,19": "tile_hq_floor",
        "35,19": "tile_hq_floor",
        "36,19": "tile_hq_floor",
        "38,19": "tile_hq_floor",
        "35,18": "tile_hq_floor",
        "31,18": "tile_hq_floor",
        "30,18": "tile_hq_floor",
        "29,18": "tile_hq_floor",
        "28,18": "tile_hq_floor",
        "27,18": "tile_hq_floor",
        "30,19": "tile_hq_floor",
        "29,19": "tile_hq_floor",
        "28,19": "tile_hq_floor",
        "38,18": "tile_hq_floor",
        "36,20": "tile_hq_floor",
        "39,20": "tile_hq_floor",
        "24,16": "tile_hq_floor",
        "24,17": "tile_hq_floor",
        "24,18": "tile_hq_floor",
        "24,19": "tile_hq_floor",
        "24,20": "tile_hq_floor",
        "24,15": "tile_hq_floor",
        "40,15": "tile_hq_floor",
        "40,16": "tile_hq_floor",
        "40,17": "tile_hq_floor",
        "40,18": "tile_hq_floor",
        "40,19": "tile_hq_floor",
        "40,20": "tile_hq_floor",
        "23,15": "tile_hq_floor",
        "23,16": "tile_hq_floor",
        "23,17": "tile_hq_floor",
        "23,18": "tile_hq_floor",
        "23,19": "tile_hq_floor",
        "23,20": "tile_hq_floor",
        "41,15": "tile_hq_floor",
        "41,16": "tile_hq_floor",
        "41,17": "tile_hq_floor",
        "41,18": "tile_hq_floor",
        "41,19": "tile_hq_floor",
        "41,20": "tile_hq_floor",
        "22,15": "tile_hq_floor",
        "22,16": "tile_hq_floor",
        "22,17": "tile_hq_floor",
        "22,18": "tile_hq_floor",
        "22,19": "tile_hq_floor",
        "22,20": "tile_hq_floor",
        "42,15": "tile_hq_floor",
        "42,16": "tile_hq_floor",
        "42,17": "tile_hq_floor",
        "42,18": "tile_hq_floor",
        "42,19": "tile_hq_floor",
        "42,20": "tile_hq_floor",
        "22,21": "tile_hq_floor",
        "23,21": "tile_hq_floor",
        "24,21": "tile_hq_floor",
        "25,21": "tile_hq_floor",
        "26,21": "tile_hq_floor",
        "27,21": "tile_hq_floor",
        "28,21": "tile_hq_floor",
        "29,21": "tile_hq_floor",
        "30,21": "tile_hq_floor",
        "31,21": "tile_hq_floor",
        "32,21": "tile_hq_floor",
        "33,21": "tile_hq_floor",
        "34,21": "tile_hq_floor",
        "35,21": "tile_hq_floor",
        "36,21": "tile_hq_floor",
        "37,21": "tile_hq_floor",
        "38,21": "tile_hq_floor",
        "39,21": "tile_hq_floor",
        "40,21": "tile_hq_floor",
        "41,21": "tile_hq_floor",
        "42,21": "tile_hq_floor",
        "21,21": "tile_hq_floor",
        "20,21": "tile_hq_floor",
        "19,21": "tile_hq_floor",
        "18,21": "tile_hq_floor",
        "17,21": "tile_hq_floor",
        "16,21": "tile_hq_floor",
        "21,20": "tile_hq_floor",
        "20,20": "tile_hq_floor",
        "19,20": "tile_hq_floor",
        "18,20": "tile_hq_floor",
        "17,20": "tile_hq_floor",
        "16,20": "tile_hq_floor",
        "15,20": "tile_hq_floor",
        "15,21": "tile_hq_floor",
        "21,19": "tile_hq_floor",
        "20,19": "tile_hq_floor",
        "19,19": "tile_hq_floor",
        "18,19": "tile_hq_floor",
        "17,19": "tile_hq_floor",
        "16,19": "tile_hq_floor",
        "15,19": "tile_hq_floor",
        "16,18": "tile_hq_floor",
        "17,18": "tile_hq_floor",
        "18,18": "tile_hq_floor",
        "19,18": "tile_hq_floor",
        "20,18": "tile_hq_floor",
        "21,18": "tile_hq_floor",
        "21,17": "tile_hq_floor",
        "21,16": "tile_hq_floor",
        "21,15": "tile_hq_floor",
        "20,15": "tile_hq_floor",
        "19,15": "tile_hq_floor",
        "18,15": "tile_hq_floor",
        "17,15": "tile_hq_floor",
        "16,15": "tile_hq_floor",
        "15,15": "tile_hq_floor",
        "15,17": "tile_hq_floor",
        "15,18": "tile_hq_floor",
        "16,17": "tile_hq_floor",
        "16,16": "tile_hq_floor",
        "15,16": "tile_hq_floor",
        "17,16": "tile_hq_floor",
        "18,16": "tile_hq_floor",
        "19,16": "tile_hq_floor",
        "20,16": "tile_hq_floor",
        "20,17": "tile_hq_floor",
        "19,17": "tile_hq_floor",
        "18,17": "tile_hq_floor",
        "17,17": "tile_hq_floor",
        "14,16": "tile_hq_floor",
        "13,16": "tile_hq_floor",
        "12,16": "tile_hq_floor",
        "11,16": "tile_hq_floor",
        "10,16": "tile_hq_floor",
        "9,16": "tile_hq_floor",
        "9,17": "tile_hq_floor",
        "9,18": "tile_hq_floor",
        "9,19": "tile_hq_floor",
        "9,20": "tile_hq_floor",
        "9,21": "tile_hq_floor",
        "11,17": "tile_hq_floor",
        "10,18": "tile_hq_floor",
        "10,19": "tile_hq_floor",
        "10,20": "tile_hq_floor",
        "10,21": "tile_hq_floor",
        "10,17": "tile_hq_floor",
        "11,21": "tile_hq_floor",
        "11,20": "tile_hq_floor",
        "11,19": "tile_hq_floor",
        "11,18": "tile_hq_floor",
        "13,17": "tile_hq_floor",
        "13,18": "tile_hq_floor",
        "12,19": "tile_hq_floor",
        "12,20": "tile_hq_floor",
        "12,21": "tile_hq_floor",
        "13,21": "tile_hq_floor",
        "13,20": "tile_hq_floor",
        "13,19": "tile_hq_floor",
        "12,17": "tile_hq_floor",
        "12,15": "tile_hq_floor",
        "14,15": "tile_hq_floor",
        "9,15": "tile_hq_floor",
        "10,15": "tile_hq_floor",
        "11,15": "tile_hq_floor",
        "13,15": "tile_hq_floor",
        "14,17": "tile_hq_floor",
        "14,18": "tile_hq_floor",
        "14,19": "tile_hq_floor",
        "14,20": "tile_hq_floor",
        "14,21": "tile_hq_floor",
        "12,18": "tile_hq_floor"
      },
      "ground": {},
      "ground2": {},
      "ground3": {
        "37,4": "tile_new_bg_wall_front_edge",
        "37,5": "tile_new_bg_wall_front_edge",
        "37,6": "tile_new_bg_wall_front_edge",
        "37,7": "tile_new_bg_wall_front_edge",
        "37,8": "tile_new_bg_wall_front_edge",
        "37,9": "tile_new_bg_wall_front_edge",
        "36,1": "tile_eoc_security_camera",
        "26,8": "tile_eoc_security_camera",
        "0,9": "tile_new_bg_wall_front_edge",
        "0,10": "tile_new_bg_wall_front_edge",
        "0,11": "tile_new_bg_wall_front_edge",
        "0,12": "tile_new_bg_wall_front_edge",
        "0,13": "tile_new_bg_wall_front_edge",
        "0,14": "tile_new_bg_wall_front_edge",
        "0,8": "tile_new_bg_wall_front_edge"
      },
      "object": {
        "37,3": "tile_new_bg_wall_front_edge",
        "37,2": "tile_new_bg_wall_front_edge",
        "27,4": "tile_new_bg_wall_front_edge",
        "27,5": "tile_new_bg_wall_front_edge",
        "27,6": "tile_new_bg_wall_front_edge",
        "27,7": "tile_new_bg_wall_front_edge",
        "8,8": "tile_new_decor_exit_sign",
        "3,14": "tile_new_decor_fire_extinguisher",
        "1,14": "tile_new_decor_box_large"
      },
      "overlay": {},
      "top": {},
      "object2": {
        "36,9": "tile_new_decor_box_large",
        "63,8": "tile_new_bg_wall_front_edge",
        "63,9": "tile_new_bg_wall_front_edge",
        "63,10": "tile_new_bg_wall_front_edge",
        "63,11": "tile_new_bg_wall_front_edge",
        "63,12": "tile_new_bg_wall_front_edge",
        "63,13": "tile_new_bg_wall_front_edge",
        "63,14": "tile_new_bg_wall_front_edge"
      },
      "object3": {},
      "object4": {}
    },
    "stamps": [
      {
        "id": "tile_new_bg_wall",
        "c": 28,
        "r": 0,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 29,
        "r": 0,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 30,
        "r": 0,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 31,
        "r": 0,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 32,
        "r": 0,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 33,
        "r": 0,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 34,
        "r": 0,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 35,
        "r": 0,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 36,
        "r": 0,
        "layer": "ground"
      },
      {
        "id": "tile_mu5e3ndv",
        "c": 27,
        "r": 0,
        "layer": "ground",
        "fx": false
      },
      {
        "id": "tile_new_bg_window",
        "c": 28,
        "r": 1,
        "layer": "ground3",
        "ox": 0,
        "oy": 4
      },
      {
        "id": "tile_mu5e3ndv",
        "c": 37,
        "r": 0,
        "layer": "ground2",
        "fx": true
      },
      {
        "id": "tile_mu5e3ndv",
        "c": 37,
        "r": 7,
        "layer": "object3"
      },
      {
        "id": "tile_mu5e3ndv",
        "c": 26,
        "r": 7,
        "layer": "object2",
        "ox": 40,
        "oy": 0
      },
      {
        "id": "tile_new_decor_vending_red",
        "c": 34,
        "r": 2,
        "layer": "object",
        "ox": -22,
        "oy": 10
      },
      {
        "id": "tile_new_decor_vending_green",
        "c": 35,
        "r": 2,
        "layer": "ground3",
        "ox": -18,
        "oy": 10
      },
      {
        "id": "tile_new_decor_table",
        "c": 33,
        "r": 5,
        "layer": "object",
        "ox": 0,
        "oy": 18
      },
      {
        "id": "tile_new_decor_table",
        "c": 33,
        "r": 7,
        "layer": "object",
        "ox": 0,
        "oy": 10
      },
      {
        "id": "tile_new_bg_window",
        "c": 33,
        "r": 1,
        "layer": "ground2",
        "ox": 0,
        "oy": 4
      },
      {
        "id": "tile_new_bg_wall",
        "c": 40,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 41,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 42,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 43,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 44,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 45,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 47,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 46,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 48,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 23,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 21,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 19,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 17,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 18,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 20,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 22,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 24,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 38,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 39,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 25,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "color_mu8nxukw",
        "c": 48,
        "r": 3,
        "layer": "floor"
      },
      {
        "id": "color_mu8nxukw",
        "c": 38,
        "r": 4,
        "layer": "floor",
        "ox": -14,
        "oy": 0
      },
      {
        "id": "tile_new_decor_chair_side",
        "c": 35,
        "r": 5,
        "layer": "object",
        "ox": 0,
        "oy": 22
      },
      {
        "id": "tile_new_decor_chair_side",
        "c": 32,
        "r": 7,
        "layer": "object",
        "fx": true,
        "ox": 0,
        "oy": 6
      },
      {
        "id": "tile_new_decor_chair_side",
        "c": 32,
        "r": 5,
        "layer": "object",
        "fx": true,
        "ox": 0,
        "oy": 20
      },
      {
        "id": "tile_new_decor_poster",
        "c": 31,
        "r": 1,
        "layer": "object"
      },
      {
        "id": "tile_new_decor_poster",
        "c": 38,
        "r": 8,
        "layer": "object",
        "ox": 40,
        "oy": 8
      },
      {
        "id": "tile_new_decor_water_dispenser",
        "c": 27,
        "r": 2,
        "layer": "object",
        "ox": 46,
        "oy": 20
      },
      {
        "id": "tile_new_decor_plant03",
        "c": 33,
        "r": 3,
        "layer": "overlay",
        "ox": -2,
        "oy": -28
      },
      {
        "id": "tile_new_decor_fire_extinguisher",
        "c": 36,
        "r": 4,
        "layer": "object",
        "ox": 2,
        "oy": -28
      },
      {
        "id": "tile_scene_cabinet_low_02",
        "c": 27,
        "r": 4,
        "layer": "ground2",
        "ox": -10,
        "oy": 46
      },
      {
        "id": "tile_new_decor_cabinet_low",
        "c": 30,
        "r": 4,
        "layer": "object",
        "ox": 42,
        "oy": -68
      },
      {
        "id": "tile_new_decor_cabinet_low",
        "c": 31,
        "r": 4,
        "layer": "object",
        "ox": 40,
        "oy": -68
      },
      {
        "id": "tile_new_decor_coffee_machine",
        "c": 31,
        "r": 2,
        "layer": "object2",
        "ox": 0,
        "oy": 18
      },
      {
        "id": "tile_new_decor_box_medium",
        "c": 36,
        "r": 10,
        "layer": "object2",
        "ox": 4,
        "oy": -12
      },
      {
        "id": "tile_new_decor_box_small_diagonal",
        "c": 35,
        "r": 9,
        "layer": "object2",
        "ox": 42,
        "oy": -14
      },
      {
        "id": "tile_new_decor_box_three",
        "c": 34,
        "r": 2,
        "layer": "object2",
        "ox": 14,
        "oy": -12
      },
      {
        "id": "tile_new_decor_coffee_cup",
        "c": 34,
        "r": 5,
        "layer": "object3",
        "ox": -2,
        "oy": 20
      },
      {
        "id": "tile_new_bg_wall_front_edge",
        "c": 26,
        "r": 1,
        "layer": "object",
        "ox": 40,
        "oy": 6
      },
      {
        "id": "tile_new_bg_wall_front_edge",
        "c": 37,
        "r": 1,
        "layer": "object",
        "ox": 0,
        "oy": 6
      },
      {
        "id": "tile_new_bg_wall",
        "c": 49,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 50,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 51,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 52,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 53,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 54,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_mu5e3ndv",
        "c": 46,
        "r": 7,
        "layer": "ground2"
      },
      {
        "id": "tile_decor_waterboxes",
        "c": 28,
        "r": 3,
        "layer": "object",
        "ox": 42,
        "oy": 16
      },
      {
        "id": "tile_eoc_door",
        "c": 41,
        "r": 9,
        "layer": "object4",
        "ox": -20,
        "oy": -4
      },
      {
        "id": "tile_eoc_door",
        "c": 50,
        "r": 9,
        "layer": "object4",
        "ox": -18,
        "oy": -4
      },
      {
        "id": "tile_eoc_hydrant_white",
        "c": 20,
        "r": 8,
        "layer": "ground2",
        "ox": -20,
        "oy": 24
      },
      {
        "id": "tile_eoc_distance_poster",
        "c": 48,
        "r": 8,
        "layer": "ground2",
        "ox": 0,
        "oy": 6
      },
      {
        "id": "tile_new_decor_chair_side",
        "c": 35,
        "r": 7,
        "layer": "object",
        "ox": 0,
        "oy": 6
      },
      {
        "id": "tile_new_decor_exit_sign",
        "c": 55,
        "r": 8,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_mu8rra80",
        "c": 36,
        "r": 6,
        "layer": "object",
        "fx": true,
        "ox": 12,
        "oy": -36
      },
      {
        "id": "tile_eoc_pillar",
        "c": 27,
        "r": 4,
        "layer": "object",
        "ox": 22,
        "oy": -4
      },
      {
        "id": "tile_eoc_security_camera",
        "c": 38,
        "r": 8,
        "layer": "ground3",
        "fx": true
      },
      {
        "id": "tile_new_bg_wall",
        "c": 16,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 15,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall_front_edge",
        "c": 26,
        "r": 3,
        "layer": "object",
        "ox": 40,
        "oy": 0
      },
      {
        "id": "tile_new_bg_wall_front_edge",
        "c": 26,
        "r": 2,
        "layer": "object",
        "ox": 40,
        "oy": 0
      },
      {
        "id": "tile_new_bg_wall",
        "c": 26,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "color_mu8nxukw",
        "c": 26,
        "r": 5,
        "layer": "floor",
        "ox": 10,
        "oy": -42
      },
      {
        "id": "tile_eoc_no_entry_poster",
        "c": 42,
        "r": 8,
        "layer": "object",
        "ox": 0,
        "oy": 6
      },
      {
        "id": "tile_new_bg_wall",
        "c": 14,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 8,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 9,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 11,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 12,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 13,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 10,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_mu5e3ndv",
        "c": 9,
        "r": 7,
        "layer": "ground2"
      },
      {
        "id": "tile_mu5e3ndv",
        "c": 18,
        "r": 7,
        "layer": "ground2"
      },
      {
        "id": "tile_eoc_door",
        "c": 22,
        "r": 9,
        "layer": "ground3",
        "ox": 0,
        "oy": -4
      },
      {
        "id": "tile_new_bg_wall",
        "c": 4,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 3,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 2,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 1,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 0,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_mu5e3ndv",
        "c": 0,
        "r": 7,
        "layer": "ground2"
      },
      {
        "id": "tile_eoc_double_door_open",
        "c": 5,
        "r": 7,
        "layer": "ground3"
      },
      {
        "id": "tile_eoc_escape_stairs",
        "c": 4,
        "r": 5,
        "layer": "floor",
        "ox": 0,
        "oy": -24,
        "sortDepth": 0.5
      },
      {
        "id": "tile_new_bg_wall",
        "c": 61,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 62,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 63,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 60,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_mu5e3ndv",
        "c": 54,
        "r": 7,
        "layer": "object"
      },
      {
        "id": "tile_mu5e3ndv",
        "c": 63,
        "r": 7,
        "layer": "object"
      },
      {
        "id": "tile_eoc_double_door_open",
        "c": 56,
        "r": 7,
        "layer": "object2"
      },
      {
        "id": "tile_eoc_escape_stairs",
        "c": 55,
        "r": 4,
        "layer": "ground",
        "sortDepth": 0.5
      },
      {
        "id": "tile_new_bg_wall",
        "c": 55,
        "r": 7,
        "layer": "ground2"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 59,
        "r": 7,
        "layer": "ground2"
      },
      {
        "id": "tile_eoc_door",
        "c": 13,
        "r": 9,
        "layer": "object",
        "ox": 0,
        "oy": -4
      },
      {
        "id": "tile_new_decor_poster",
        "c": 11,
        "r": 8,
        "layer": "object"
      },
      {
        "id": "tile_eoc_distance_poster",
        "c": 15,
        "r": 8,
        "layer": "object"
      },
      {
        "id": "tile_eoc_locker",
        "c": 1,
        "r": 9,
        "layer": "object",
        "ox": 0,
        "oy": -28
      },
      {
        "id": "tile_eoc_locker",
        "c": 2,
        "r": 9,
        "layer": "object",
        "ox": -6,
        "oy": -28
      },
      {
        "id": "tile_eoc_locker",
        "c": 3,
        "r": 9,
        "layer": "object",
        "ox": -12,
        "oy": -28
      },
      {
        "id": "tile_mu4yyr9r",
        "c": 1,
        "r": 12,
        "layer": "object",
        "ox": -10,
        "oy": 0
      },
      {
        "id": "tile_new_decor_box_medium",
        "c": 2,
        "r": 14,
        "layer": "object",
        "ox": -4,
        "oy": 4
      },
      {
        "id": "tile_new_decor_box_three",
        "c": 1,
        "r": 8,
        "layer": "object2",
        "ox": -10,
        "oy": 26
      },
      {
        "id": "tile_new_decor_cabinet_tall_metal",
        "c": 10,
        "r": 10,
        "layer": "object2",
        "ox": 0,
        "oy": -16
      },
      {
        "id": "tile_mufxoi3i",
        "c": 60,
        "r": 8,
        "layer": "object",
        "ox": 0,
        "oy": -4
      },
      {
        "id": "tile_mufxpxnl",
        "c": 61,
        "r": 8,
        "layer": "object",
        "ox": -4,
        "oy": -8
      },
      {
        "id": "tile_new_bg_wall",
        "c": 29,
        "r": 12,
        "layer": "object2"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 30,
        "r": 12,
        "layer": "object2"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 31,
        "r": 12,
        "layer": "object2"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 32,
        "r": 12,
        "layer": "object2"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 33,
        "r": 12,
        "layer": "object2"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 34,
        "r": 12,
        "layer": "object2"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 35,
        "r": 12,
        "layer": "object2"
      },
      {
        "id": "tile_hq_wall_side",
        "c": 36,
        "r": 12,
        "layer": "object2",
        "ox": 0,
        "oy": 0
      },
      {
        "id": "tile_hq_wall_side",
        "c": 28,
        "r": 12,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_hq_monitor_wall",
        "c": 30,
        "r": 13,
        "layer": "object3",
        "fx": true,
        "ox": 0,
        "oy": -14
      },
      {
        "id": "tile_hq_stairs",
        "c": 26,
        "r": 15,
        "layer": "object",
        "fx": true,
        "ox": 0,
        "oy": -6
      },
      {
        "id": "tile_hq_wall_side",
        "c": 39,
        "r": 12,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_hq_wall_side",
        "c": 25,
        "r": 12,
        "layer": "object2"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 40,
        "r": 12,
        "layer": "object2"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 24,
        "r": 12,
        "layer": "object2"
      },
      {
        "id": "tile_hq_wall_side",
        "c": 41,
        "r": 12,
        "layer": "object2"
      },
      {
        "id": "tile_hq_wall_side",
        "c": 23,
        "r": 12,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_mu5e3ndv",
        "c": 22,
        "r": 12,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mu5e3ndv",
        "c": 42,
        "r": 12,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mu5e3ndv",
        "c": 22,
        "r": 18,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mu5e3ndv",
        "c": 42,
        "r": 18,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_new_bg_wall_front_edge",
        "c": 22,
        "r": 16,
        "layer": "ground2",
        "fx": true
      },
      {
        "id": "tile_new_bg_wall_front_edge",
        "c": 22,
        "r": 17,
        "layer": "ground2",
        "fx": true
      },
      {
        "id": "tile_new_bg_wall_front_edge",
        "c": 22,
        "r": 18,
        "layer": "ground2",
        "fx": true
      },
      {
        "id": "tile_new_bg_wall_front_edge",
        "c": 42,
        "r": 15,
        "layer": "ground2",
        "fx": true
      },
      {
        "id": "tile_new_bg_wall_front_edge",
        "c": 42,
        "r": 16,
        "layer": "ground2",
        "fx": true
      },
      {
        "id": "tile_new_bg_wall_front_edge",
        "c": 42,
        "r": 17,
        "layer": "ground2",
        "fx": true
      },
      {
        "id": "tile_new_bg_wall_front_edge",
        "c": 42,
        "r": 18,
        "layer": "ground2",
        "fx": true
      },
      {
        "id": "tile_new_bg_wall_front_edge",
        "c": 42,
        "r": 19,
        "layer": "ground2",
        "fx": true
      },
      {
        "id": "tile_new_bg_wall_front_edge",
        "c": 42,
        "r": 15,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_new_bg_wall_front_edge",
        "c": 42,
        "r": 14,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_new_bg_wall_front_edge",
        "c": 42,
        "r": 13,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_new_bg_wall_front_edge",
        "c": 22,
        "r": 13,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_new_bg_wall_front_edge",
        "c": 22,
        "r": 14,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_new_bg_wall_front_edge",
        "c": 22,
        "r": 15,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_new_bg_wall_front_edge",
        "c": 22,
        "r": 16,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_hq_command_table",
        "c": 30,
        "r": 17,
        "layer": "object4",
        "ox": 0,
        "oy": -2,
        "sortDepth": 2
      },
      {
        "id": "tile_hq_office_chair_back",
        "c": 31,
        "r": 19,
        "layer": "object4",
        "ox": 0,
        "oy": -2
      },
      {
        "id": "tile_hq_office_chair_back",
        "c": 33,
        "r": 19,
        "layer": "object4",
        "ox": 0,
        "oy": -2
      },
      {
        "id": "tile_hq_office_chair_front",
        "c": 32,
        "r": 16,
        "layer": "object3",
        "ox": 0,
        "oy": 0,
        "sortDepth": 1.75
      },
      {
        "id": "tile_hq_server_rack",
        "c": 23,
        "r": 15,
        "layer": "object3",
        "ox": 0,
        "oy": -22
      },
      {
        "id": "tile_hq_server_rack",
        "c": 24,
        "r": 15,
        "layer": "object3",
        "ox": 0,
        "oy": -22
      },
      {
        "id": "tile_hq_desk_vertical",
        "c": 23,
        "r": 16,
        "layer": "ground3",
        "ox": -10,
        "oy": 20,
        "sortDepth": 4.5
      },
      {
        "id": "tile_eoc_office_chair_grey",
        "c": 24,
        "r": 17,
        "layer": "ground3",
        "ox": 14,
        "oy": 0
      },
      {
        "id": "tile_hq_floor",
        "c": 37,
        "r": 19,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_eoc_office_chair_grey",
        "c": 29,
        "r": 18,
        "layer": "object",
        "fx": true,
        "ox": -12,
        "oy": -22
      },
      {
        "id": "tile_hq_computer_desk",
        "c": 39,
        "r": 17,
        "layer": "ground3",
        "fx": true,
        "ox": -4,
        "oy": 8,
        "sortDepth": 2.5
      },
      {
        "id": "tile_hq_stairs",
        "c": 37,
        "r": 15,
        "layer": "ground3",
        "fx": true,
        "ox": 0,
        "oy": -6
      },
      {
        "id": "tile_hq_server_rack",
        "c": 40,
        "r": 14,
        "layer": "object3",
        "fx": true,
        "ox": 0,
        "oy": 18
      },
      {
        "id": "tile_hq_server_rack",
        "c": 41,
        "r": 14,
        "layer": "object3",
        "fx": true,
        "ox": 0,
        "oy": 18
      },
      {
        "id": "tile_eoc_drawer_unit",
        "c": 35,
        "r": 15,
        "layer": "object3",
        "fx": true,
        "ox": 4,
        "oy": -24
      },
      {
        "id": "tile_eoc_drawer_unit",
        "c": 36,
        "r": 15,
        "layer": "object3",
        "fx": true,
        "ox": -6,
        "oy": -24
      },
      {
        "id": "tile_eoc_binder_row",
        "c": 35,
        "r": 14,
        "layer": "object4",
        "fx": true,
        "ox": 24,
        "oy": 18
      },
      {
        "id": "tile_new_decor_fire_extinguisher",
        "c": 28,
        "r": 15,
        "layer": "object3",
        "fx": true,
        "ox": 0,
        "oy": 6
      },
      {
        "id": "tile_eoc_office_chair_grey",
        "c": 35,
        "r": 18,
        "layer": "object3",
        "ox": 12,
        "oy": -20
      },
      {
        "id": "tile_hq_office_chair_back",
        "c": 40,
        "r": 19,
        "layer": "object3",
        "ox": 18,
        "oy": -4
      },
      {
        "id": "tile_hq_sign",
        "c": 28,
        "r": 13,
        "layer": "object4"
      },
      {
        "id": "tile_hq_poster",
        "c": 23,
        "r": 14,
        "layer": "overlay",
        "ox": 0,
        "oy": -14
      },
      {
        "id": "tile_hq_poster",
        "c": 41,
        "r": 14,
        "layer": "overlay",
        "ox": 0,
        "oy": -14
      },
      {
        "id": "tile_eoc_office_chair_grey",
        "c": 25,
        "r": 19,
        "layer": "ground3",
        "ox": -26,
        "oy": 12
      },
      {
        "id": "tile_hq_potted_plant",
        "c": 30,
        "r": 3,
        "layer": "object2",
        "ox": 0,
        "oy": -24
      },
      {
        "id": "tile_mu5e3ndv",
        "c": 8,
        "r": 18,
        "layer": "top"
      },
      {
        "id": "tile_mu5e3ndv",
        "c": 8,
        "r": 12,
        "layer": "object"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 10,
        "r": 12,
        "layer": "object"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 11,
        "r": 12,
        "layer": "object"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 12,
        "r": 12,
        "layer": "object"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 13,
        "r": 12,
        "layer": "object",
        "ox": 0,
        "oy": 0
      },
      {
        "id": "tile_new_bg_wall",
        "c": 14,
        "r": 12,
        "layer": "object"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 21,
        "r": 12,
        "layer": "object"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 20,
        "r": 12,
        "layer": "object"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 19,
        "r": 12,
        "layer": "object"
      },
      {
        "id": "tile_hq_stairs",
        "c": 16,
        "r": 15,
        "layer": "ground",
        "ox": 0,
        "oy": -4
      },
      {
        "id": "tile_hq_wall_side",
        "c": 15,
        "r": 12,
        "layer": "object"
      },
      {
        "id": "tile_hq_wall_side",
        "c": 18,
        "r": 12,
        "layer": "object",
        "fx": true,
        "ox": 0,
        "oy": 0
      },
      {
        "id": "tile_hq_floor",
        "c": 8,
        "r": 16,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_hq_floor",
        "c": 8,
        "r": 17,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_hq_floor",
        "c": 8,
        "r": 18,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_hq_floor",
        "c": 8,
        "r": 19,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_hq_floor",
        "c": 8,
        "r": 20,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_hq_floor",
        "c": 8,
        "r": 21,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_new_bg_wall",
        "c": 9,
        "r": 12,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_new_bg_wall_front_edge",
        "c": 8,
        "r": 17,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_new_bg_wall_front_edge",
        "c": 8,
        "r": 16,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_new_bg_wall_front_edge",
        "c": 8,
        "r": 15,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_new_bg_wall_front_edge",
        "c": 8,
        "r": 14,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_new_bg_wall_front_edge",
        "c": 8,
        "r": 13,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_eoc_locker",
        "c": 9,
        "r": 14,
        "layer": "object2",
        "fx": true,
        "ox": -4,
        "oy": -28,
        "sortDepth": 2.75
      },
      {
        "id": "tile_research_lab_control_workstation",
        "c": 10,
        "r": 15,
        "layer": "object2",
        "ox": -6,
        "oy": -22,
        "sortDepth": 2.5
      },
      {
        "id": "tile_research_lab_specimen_cabinet",
        "c": 14,
        "r": 14,
        "layer": "object2",
        "ox": -38,
        "oy": -20,
        "sortDepth": 2.75
      },
      {
        "id": "tile_research_lab_sample_storage",
        "c": 20,
        "r": 14,
        "layer": "object2",
        "ox": 0,
        "oy": -12,
        "sortDepth": 2.75
      },
      {
        "id": "tile_research_lab_crystal_containment_pod",
        "c": 18,
        "r": 13,
        "layer": "object2",
        "ox": 32,
        "oy": -12,
        "sortDepth": 3.75
      },
      {
        "id": "tile_new_decor_fire_extinguisher",
        "c": 18,
        "r": 15,
        "layer": "object2",
        "ox": 0,
        "oy": 8
      },
      {
        "id": "tile_hq_office_chair_back",
        "c": 11,
        "r": 16,
        "layer": "object3",
        "ox": -20,
        "oy": 16,
        "sortDepth": 1.75
      },
      {
        "id": "tile_research_lab_analysis_table",
        "c": 9,
        "r": 18,
        "layer": "object3",
        "ox": 0,
        "oy": 8,
        "sortDepth": 2.25
      },
      {
        "id": "tile_research_lab_microscope_workstation",
        "c": 19,
        "r": 17,
        "layer": "object3",
        "ox": 10,
        "oy": 2
      },
      {
        "id": "tile_eoc_office_chair_grey",
        "c": 20,
        "r": 17,
        "layer": "object2",
        "fx": true,
        "sortDepth": 1.75,
        "ox": -20,
        "oy": 10
      },
      {
        "id": "tile_eoc_filing_cabinet",
        "c": 15,
        "r": 15,
        "layer": "object3",
        "ox": -14,
        "oy": -24
      },
      {
        "id": "tile_mv9qoz8k",
        "c": 14,
        "r": 13,
        "layer": "object3",
        "ox": 4,
        "oy": 0
      }
    ],
    "solid": [
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
      "27,3",
      "28,3",
      "29,3",
      "30,3",
      "31,3",
      "32,3",
      "33,3",
      "34,3",
      "35,3",
      "36,3",
      "37,4",
      "37,5",
      "37,6",
      "37,7",
      "37,8",
      "37,9",
      "37,3",
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
      "48,10",
      "37,10",
      "33,8",
      "34,8",
      "33,6",
      "34,6",
      "27,9",
      "36,9",
      "36,10",
      "49,10",
      "50,10",
      "51,10",
      "52,10",
      "53,10",
      "54,10",
      "16,10",
      "15,10",
      "27,4",
      "27,5",
      "27,6",
      "27,7",
      "27,8",
      "27,10",
      "14,10",
      "13,10",
      "12,10",
      "11,10",
      "10,10",
      "9,10",
      "8,10",
      "4,10",
      "3,10",
      "1,10",
      "2,10",
      "0,10",
      "0,11",
      "0,12",
      "0,13",
      "0,14",
      "4,7",
      "4,8",
      "4,9",
      "4,6",
      "4,5",
      "4,4",
      "5,4",
      "6,4",
      "7,4",
      "8,4",
      "8,5",
      "8,6",
      "8,7",
      "8,8",
      "8,9",
      "55,10",
      "55,9",
      "55,7",
      "55,8",
      "55,4",
      "55,5",
      "55,6",
      "56,4",
      "56,5",
      "57,4",
      "58,4",
      "59,4",
      "59,5",
      "59,6",
      "59,7",
      "59,9",
      "59,8",
      "59,10",
      "60,10",
      "61,10",
      "62,10",
      "63,11",
      "63,12",
      "63,10",
      "63,13",
      "63,14",
      "56,6",
      "57,5",
      "57,6",
      "5,5",
      "5,6",
      "6,6",
      "6,5",
      "22,15",
      "23,15",
      "24,15",
      "25,15",
      "28,15",
      "29,15",
      "30,15",
      "31,15",
      "32,15",
      "33,15",
      "34,15",
      "35,15",
      "36,15",
      "39,15",
      "40,15",
      "41,15",
      "42,15",
      "42,16",
      "42,17",
      "42,18",
      "42,19",
      "42,20",
      "42,21",
      "0,15",
      "1,15",
      "2,15",
      "3,15",
      "4,15",
      "5,15",
      "6,15",
      "7,15",
      "8,15",
      "9,15",
      "10,15",
      "11,15",
      "12,15",
      "13,15",
      "14,15",
      "15,15",
      "18,15",
      "19,15",
      "20,15",
      "21,15",
      "22,16",
      "22,17",
      "22,18",
      "22,19",
      "22,20",
      "22,21",
      "30,18",
      "31,18",
      "32,18",
      "33,18",
      "34,18",
      "39,18",
      "40,18",
      "41,18",
      "23,17",
      "23,18",
      "23,19",
      "23,20",
      "43,15",
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
      "56,15",
      "57,15",
      "58,15",
      "59,15",
      "60,15",
      "61,15",
      "62,15",
      "63,15",
      "22,14",
      "23,14",
      "24,14",
      "25,14",
      "28,14",
      "30,14",
      "29,14",
      "31,14",
      "32,14",
      "33,14",
      "34,14",
      "35,14",
      "36,14",
      "39,14",
      "40,14",
      "41,14",
      "42,14",
      "39,19",
      "1,13",
      "1,14",
      "2,14",
      "3,14",
      "8,16",
      "8,17",
      "8,18",
      "8,19",
      "8,20",
      "8,21",
      "10,16",
      "12,16",
      "11,16",
      "9,19",
      "10,19",
      "11,19",
      "12,19",
      "13,19",
      "21,19",
      "21,18",
      "21,20",
      "20,20",
      "19,14",
      "20,14",
      "21,14",
      "18,14",
      "15,14",
      "13,14",
      "14,14",
      "12,14",
      "11,14",
      "10,14",
      "9,14",
      "8,14"
    ],
    "breakable": [],
    "camp": [
      "42,12",
      "42,13",
      "43,12",
      "43,13",
      "44,12",
      "44,13",
      "45,12",
      "45,13",
      "46,12",
      "46,13",
      "47,12",
      "47,13",
      "48,12",
      "48,13",
      "49,12",
      "49,13",
      "50,12",
      "50,13",
      "51,12",
      "51,13",
      "52,12",
      "52,13",
      "53,12",
      "53,13",
      "54,12",
      "54,13"
    ],
    "rules": {
      "money": 150,
      "guide": 100,
      "guideRegen": 9,
      "speed": 44,
      "reward": 8
    },
    "cols": 64,
    "rows": 22,
    "safe": true,
    "npcs": true,
    "portals": [
      {
        "c": 41,
        "r": 10,
        "to": "map_mua3askw"
      },
      {
        "c": 50,
        "r": 10,
        "to": "map_mubj5gxm"
      },
      {
        "c": 22,
        "r": 10,
        "to": "map_mubk73un"
      },
      {
        "c": 14,
        "r": 10,
        "to": "map_mue26feq"
      },
      {
        "c": 13,
        "r": 10,
        "to": "map_mue26feq"
      },
      {
        "c": 23,
        "r": 10,
        "to": "map_mubk73un"
      },
      {
        "c": 58,
        "r": 5,
        "to": "map_mufyx9gj"
      },
      {
        "c": 7,
        "r": 5,
        "to": "map_mufyx9gj"
      },
      {
        "c": 56,
        "r": 7,
        "to": "map_musbsgj3"
      },
      {
        "c": 5,
        "r": 7,
        "to": "map_musbsgj3"
      }
    ],
    "solidOffsets": {
      "6,5": [
        -9,
        0
      ],
      "6,6": [
        -9,
        0
      ],
      "57,5": [
        -11,
        0
      ],
      "57,6": [
        -11,
        0
      ]
    },
    "coreSpots": [],
    "coreCount": 1,
    "playerSpawn": [
      33,
      11
    ],
    "spawnZone": []
  },
  {
    "id": "map_mua3askw",
    "name": "溫特辦公室",
    "desc": "",
    "layers": {
      "floor": {
        "0,15": "tile_new_bg_floor",
        "0,16": "tile_new_bg_floor",
        "0,17": "tile_new_bg_floor",
        "1,15": "tile_new_bg_floor",
        "1,16": "tile_new_bg_floor",
        "1,17": "tile_new_bg_floor",
        "2,15": "tile_new_bg_floor",
        "2,16": "tile_new_bg_floor",
        "2,17": "tile_new_bg_floor",
        "3,2": "tile_new_bg_floor",
        "3,3": "tile_new_bg_floor",
        "3,4": "tile_new_bg_floor",
        "3,5": "tile_new_bg_floor",
        "3,6": "tile_new_bg_floor",
        "3,7": "tile_new_bg_floor",
        "3,8": "tile_new_bg_floor",
        "3,9": "tile_new_bg_floor",
        "3,10": "tile_new_bg_floor",
        "3,11": "tile_new_bg_floor",
        "3,15": "tile_new_bg_floor",
        "3,16": "tile_new_bg_floor",
        "3,17": "tile_new_bg_floor",
        "4,2": "tile_new_bg_floor",
        "4,3": "tile_new_bg_floor",
        "4,4": "tile_new_bg_floor",
        "4,5": "tile_new_bg_floor",
        "4,6": "tile_new_bg_floor",
        "4,7": "tile_new_bg_floor",
        "4,8": "tile_new_bg_floor",
        "4,9": "tile_new_bg_floor",
        "4,10": "tile_new_bg_floor",
        "4,11": "tile_new_bg_floor",
        "4,15": "tile_new_bg_floor",
        "4,16": "tile_new_bg_floor",
        "4,17": "tile_new_bg_floor",
        "5,2": "tile_new_bg_floor",
        "5,3": "tile_new_bg_floor",
        "5,4": "tile_new_bg_floor",
        "5,5": "tile_new_bg_floor",
        "5,7": "tile_new_bg_floor",
        "5,8": "tile_new_bg_floor",
        "5,9": "tile_new_bg_floor",
        "5,10": "tile_new_bg_floor",
        "5,11": "tile_new_bg_floor",
        "5,15": "tile_new_bg_floor",
        "5,16": "tile_new_bg_floor",
        "5,17": "tile_new_bg_floor",
        "6,2": "tile_new_bg_floor",
        "6,3": "tile_new_bg_floor",
        "6,4": "tile_new_bg_floor",
        "6,5": "tile_new_bg_floor",
        "6,6": "tile_new_bg_floor",
        "6,7": "tile_new_bg_floor",
        "6,8": "tile_new_bg_floor",
        "6,9": "tile_new_bg_floor",
        "6,10": "tile_new_bg_floor",
        "6,11": "tile_new_bg_floor",
        "6,15": "tile_new_bg_floor",
        "6,16": "tile_new_bg_floor",
        "6,17": "tile_new_bg_floor",
        "7,2": "tile_new_bg_floor",
        "7,3": "tile_new_bg_floor",
        "7,4": "tile_new_bg_floor",
        "7,5": "tile_new_bg_floor",
        "7,6": "tile_new_bg_floor",
        "7,7": "tile_new_bg_floor",
        "7,8": "tile_new_bg_floor",
        "7,9": "tile_new_bg_floor",
        "7,10": "tile_new_bg_floor",
        "7,11": "tile_new_bg_floor",
        "7,15": "tile_new_bg_floor",
        "7,16": "tile_new_bg_floor",
        "7,17": "tile_new_bg_floor",
        "8,2": "tile_new_bg_floor",
        "8,3": "tile_new_bg_floor",
        "8,4": "tile_new_bg_floor",
        "8,5": "tile_new_bg_floor",
        "8,6": "tile_new_bg_floor",
        "8,7": "tile_new_bg_floor",
        "8,8": "tile_new_bg_floor",
        "8,9": "tile_new_bg_floor",
        "8,10": "tile_new_bg_floor",
        "8,11": "tile_new_bg_floor",
        "8,15": "tile_new_bg_floor",
        "8,16": "tile_new_bg_floor",
        "8,17": "tile_new_bg_floor",
        "9,2": "tile_new_bg_floor",
        "9,3": "tile_new_bg_floor",
        "9,4": "tile_new_bg_floor",
        "9,5": "tile_new_bg_floor",
        "9,6": "tile_new_bg_floor",
        "9,7": "tile_new_bg_floor",
        "9,8": "tile_new_bg_floor",
        "9,9": "tile_new_bg_floor",
        "9,10": "tile_new_bg_floor",
        "9,11": "tile_new_bg_floor",
        "9,15": "tile_new_bg_floor",
        "9,16": "tile_new_bg_floor",
        "9,17": "tile_new_bg_floor",
        "10,2": "tile_new_bg_floor",
        "10,3": "tile_new_bg_floor",
        "10,4": "tile_new_bg_floor",
        "10,5": "tile_new_bg_floor",
        "10,6": "tile_new_bg_floor",
        "10,7": "tile_new_bg_floor",
        "10,8": "tile_new_bg_floor",
        "10,9": "tile_new_bg_floor",
        "10,10": "tile_new_bg_floor",
        "10,11": "tile_new_bg_floor",
        "10,15": "tile_new_bg_floor",
        "10,16": "tile_new_bg_floor",
        "10,17": "tile_new_bg_floor",
        "11,2": "tile_new_bg_floor",
        "11,3": "tile_new_bg_floor",
        "11,4": "tile_new_bg_floor",
        "11,5": "tile_new_bg_floor",
        "11,6": "tile_new_bg_floor",
        "11,7": "tile_new_bg_floor",
        "11,8": "tile_new_bg_floor",
        "11,9": "tile_new_bg_floor",
        "11,10": "tile_new_bg_floor",
        "11,11": "tile_new_bg_floor",
        "11,15": "tile_new_bg_floor",
        "11,16": "tile_new_bg_floor",
        "11,17": "tile_new_bg_floor",
        "12,2": "tile_new_bg_floor",
        "12,3": "tile_new_bg_floor",
        "12,4": "tile_new_bg_floor",
        "12,5": "tile_new_bg_floor",
        "12,6": "tile_new_bg_floor",
        "12,7": "tile_new_bg_floor",
        "12,8": "tile_new_bg_floor",
        "12,9": "tile_new_bg_floor",
        "12,10": "tile_new_bg_floor",
        "12,11": "tile_new_bg_floor",
        "12,15": "tile_new_bg_floor",
        "12,16": "tile_new_bg_floor",
        "12,17": "tile_new_bg_floor",
        "13,2": "tile_new_bg_floor",
        "13,3": "tile_new_bg_floor",
        "13,4": "tile_new_bg_floor",
        "13,5": "tile_new_bg_floor",
        "13,6": "tile_new_bg_floor",
        "13,7": "tile_new_bg_floor",
        "13,8": "tile_new_bg_floor",
        "13,9": "tile_new_bg_floor",
        "13,10": "tile_new_bg_floor",
        "13,11": "tile_new_bg_floor",
        "13,15": "tile_new_bg_floor",
        "13,16": "tile_new_bg_floor",
        "13,17": "tile_new_bg_floor",
        "14,2": "tile_new_bg_floor",
        "14,3": "tile_new_bg_floor",
        "14,6": "tile_new_bg_floor",
        "14,7": "tile_new_bg_floor",
        "14,8": "tile_new_bg_floor",
        "14,9": "tile_new_bg_floor",
        "14,10": "tile_new_bg_floor",
        "14,11": "tile_new_bg_floor",
        "14,15": "tile_new_bg_floor",
        "14,16": "tile_new_bg_floor",
        "14,17": "tile_new_bg_floor",
        "15,15": "tile_new_bg_floor",
        "15,16": "tile_new_bg_floor",
        "15,17": "tile_new_bg_floor",
        "16,15": "tile_new_bg_floor",
        "16,16": "tile_new_bg_floor",
        "16,17": "tile_new_bg_floor",
        "17,12": "tile_new_bg_floor",
        "17,14": "tile_new_bg_floor",
        "17,15": "tile_new_bg_floor",
        "17,16": "tile_new_bg_floor",
        "17,17": "tile_new_bg_floor",
        "18,12": "tile_new_bg_floor",
        "18,13": "tile_new_bg_floor",
        "18,14": "tile_new_bg_floor",
        "18,15": "tile_new_bg_floor",
        "18,16": "tile_new_bg_floor",
        "18,17": "tile_new_bg_floor",
        "19,12": "tile_new_bg_floor",
        "19,14": "tile_new_bg_floor",
        "19,15": "tile_new_bg_floor",
        "19,16": "tile_new_bg_floor",
        "19,17": "tile_new_bg_floor",
        "20,12": "tile_new_bg_floor",
        "20,14": "tile_new_bg_floor",
        "20,15": "tile_new_bg_floor",
        "20,16": "tile_new_bg_floor",
        "20,17": "tile_new_bg_floor",
        "21,12": "tile_new_bg_floor",
        "21,14": "tile_new_bg_floor",
        "21,15": "tile_new_bg_floor",
        "21,16": "tile_new_bg_floor",
        "21,17": "tile_new_bg_floor",
        "22,12": "tile_new_bg_floor",
        "22,14": "tile_new_bg_floor",
        "22,15": "tile_new_bg_floor",
        "22,16": "tile_new_bg_floor",
        "22,17": "tile_new_bg_floor",
        "23,3": "tile_new_bg_floor",
        "23,4": "tile_new_bg_floor",
        "23,5": "tile_new_bg_floor",
        "23,6": "tile_new_bg_floor",
        "23,7": "tile_new_bg_floor",
        "23,8": "tile_new_bg_floor",
        "23,9": "tile_new_bg_floor",
        "23,10": "tile_new_bg_floor",
        "23,11": "tile_new_bg_floor",
        "23,12": "tile_new_bg_floor",
        "23,14": "tile_new_bg_floor",
        "23,15": "tile_new_bg_floor",
        "23,16": "tile_new_bg_floor",
        "23,17": "tile_new_bg_floor",
        "24,2": "tile_new_bg_floor",
        "24,3": "tile_new_bg_floor",
        "24,4": "tile_new_bg_floor",
        "24,5": "tile_new_bg_floor",
        "24,6": "tile_new_bg_floor",
        "24,7": "tile_new_bg_floor",
        "24,8": "tile_new_bg_floor",
        "24,9": "tile_new_bg_floor",
        "24,10": "tile_new_bg_floor",
        "24,11": "tile_new_bg_floor",
        "24,12": "tile_new_bg_floor",
        "24,14": "tile_new_bg_floor",
        "24,15": "tile_new_bg_floor",
        "24,16": "tile_new_bg_floor",
        "24,17": "tile_new_bg_floor",
        "25,2": "tile_new_bg_floor",
        "25,3": "tile_new_bg_floor",
        "25,4": "tile_new_bg_floor",
        "25,5": "tile_new_bg_floor",
        "25,6": "tile_new_bg_floor",
        "25,7": "tile_new_bg_floor",
        "25,8": "tile_new_bg_floor",
        "25,9": "tile_new_bg_floor",
        "25,10": "tile_new_bg_floor",
        "25,11": "tile_new_bg_floor",
        "25,12": "tile_new_bg_floor",
        "25,14": "tile_new_bg_floor",
        "25,15": "tile_new_bg_floor",
        "25,16": "tile_new_bg_floor",
        "25,17": "tile_new_bg_floor",
        "26,0": "tile_new_bg_floor",
        "26,1": "tile_new_bg_floor",
        "26,2": "tile_new_bg_floor",
        "26,3": "tile_new_bg_floor",
        "26,4": "tile_new_bg_floor",
        "26,5": "tile_new_bg_floor",
        "26,6": "tile_new_bg_floor",
        "26,7": "tile_new_bg_floor",
        "26,8": "tile_new_bg_floor",
        "26,9": "tile_new_bg_floor",
        "26,10": "tile_new_bg_floor",
        "26,11": "tile_new_bg_floor",
        "26,12": "tile_new_bg_floor",
        "26,13": "tile_new_bg_floor",
        "26,14": "tile_new_bg_floor",
        "26,15": "tile_new_bg_floor",
        "26,16": "tile_new_bg_floor",
        "26,17": "tile_new_bg_floor",
        "27,0": "tile_new_bg_floor",
        "27,1": "tile_new_bg_floor",
        "27,2": "tile_new_bg_floor",
        "27,3": "tile_new_bg_floor",
        "27,4": "tile_new_bg_floor",
        "27,5": "tile_new_bg_floor",
        "27,6": "tile_new_bg_floor",
        "27,7": "tile_new_bg_floor",
        "27,8": "tile_new_bg_floor",
        "27,9": "tile_new_bg_floor",
        "27,10": "tile_new_bg_floor",
        "27,11": "tile_new_bg_floor",
        "27,12": "tile_new_bg_floor",
        "27,13": "tile_new_bg_floor",
        "27,14": "tile_new_bg_floor",
        "27,15": "tile_new_bg_floor",
        "27,16": "tile_new_bg_floor",
        "27,17": "tile_new_bg_floor",
        "28,0": "tile_new_bg_floor",
        "28,1": "tile_new_bg_floor",
        "28,2": "tile_new_bg_floor",
        "28,3": "tile_new_bg_floor",
        "28,4": "tile_new_bg_floor",
        "28,5": "tile_new_bg_floor",
        "28,6": "tile_new_bg_floor",
        "28,7": "tile_new_bg_floor",
        "28,8": "tile_new_bg_floor",
        "28,9": "tile_new_bg_floor",
        "28,10": "tile_new_bg_floor",
        "28,11": "tile_new_bg_floor",
        "28,12": "tile_new_bg_floor",
        "28,13": "tile_new_bg_floor",
        "28,14": "tile_new_bg_floor",
        "28,15": "tile_new_bg_floor",
        "28,16": "tile_new_bg_floor",
        "28,17": "tile_new_bg_floor",
        "29,0": "tile_new_bg_floor",
        "29,1": "tile_new_bg_floor",
        "29,2": "tile_new_bg_floor",
        "29,3": "tile_new_bg_floor",
        "29,4": "tile_new_bg_floor",
        "29,5": "tile_new_bg_floor",
        "29,6": "tile_new_bg_floor",
        "29,7": "tile_new_bg_floor",
        "29,8": "tile_new_bg_floor",
        "29,9": "tile_new_bg_floor",
        "29,10": "tile_new_bg_floor",
        "29,11": "tile_new_bg_floor",
        "29,12": "tile_new_bg_floor",
        "29,13": "tile_new_bg_floor",
        "29,14": "tile_new_bg_floor",
        "29,15": "tile_new_bg_floor",
        "29,16": "tile_new_bg_floor",
        "29,17": "tile_new_bg_floor",
        "30,0": "tile_new_bg_floor",
        "30,1": "tile_new_bg_floor",
        "30,2": "tile_new_bg_floor",
        "30,3": "tile_new_bg_floor",
        "30,4": "tile_new_bg_floor",
        "30,5": "tile_new_bg_floor",
        "30,6": "tile_new_bg_floor",
        "30,7": "tile_new_bg_floor",
        "30,8": "tile_new_bg_floor",
        "30,9": "tile_new_bg_floor",
        "30,10": "tile_new_bg_floor",
        "30,11": "tile_new_bg_floor",
        "30,12": "tile_new_bg_floor",
        "30,13": "tile_new_bg_floor",
        "30,14": "tile_new_bg_floor",
        "30,15": "tile_new_bg_floor",
        "30,16": "tile_new_bg_floor",
        "30,17": "tile_new_bg_floor",
        "31,0": "tile_new_bg_floor",
        "31,1": "tile_new_bg_floor",
        "31,2": "tile_new_bg_floor",
        "31,3": "tile_new_bg_floor",
        "31,4": "tile_new_bg_floor",
        "31,5": "tile_new_bg_floor",
        "31,6": "tile_new_bg_floor",
        "31,7": "tile_new_bg_floor",
        "31,8": "tile_new_bg_floor",
        "31,9": "tile_new_bg_floor",
        "31,10": "tile_new_bg_floor",
        "31,11": "tile_new_bg_floor",
        "31,12": "tile_new_bg_floor",
        "31,13": "tile_new_bg_floor",
        "31,14": "tile_new_bg_floor",
        "31,15": "tile_new_bg_floor",
        "31,16": "tile_new_bg_floor",
        "31,17": "tile_new_bg_floor",
        "14,4": "tile_mufvqx2u",
        "14,5": "tile_mufvqx2u"
      },
      "ground": {
        "3,2": "tile_new_bg_wall_front_edge",
        "3,3": "tile_new_bg_wall_front_edge",
        "3,4": "tile_new_bg_wall_front_edge",
        "3,5": "tile_new_bg_wall_front_edge",
        "3,6": "tile_new_bg_wall_front_edge",
        "3,7": "tile_new_bg_wall_front_edge",
        "3,8": "tile_new_bg_wall_front_edge",
        "3,9": "tile_new_bg_wall_front_edge",
        "3,10": "tile_new_bg_wall_front_edge",
        "3,11": "tile_new_bg_wall_front_edge",
        "14,6": "tile_new_bg_wall_front_edge",
        "14,7": "tile_new_bg_wall_front_edge",
        "14,8": "tile_new_bg_wall_front_edge",
        "14,9": "tile_new_bg_wall_front_edge",
        "14,10": "tile_new_bg_wall_front_edge",
        "14,11": "tile_new_bg_wall_front_edge"
      },
      "ground2": {},
      "ground3": {},
      "object": {},
      "object2": {},
      "object3": {},
      "object4": {
        "13,1": "tile_eoc_security_camera"
      },
      "overlay": {},
      "top": {
        "3,1": "tile_new_bg_wall_front_edge",
        "3,2": "tile_new_bg_wall_front_edge",
        "3,3": "tile_new_bg_wall_front_edge"
      }
    },
    "stamps": [
      {
        "id": "tile_mu5e3ndv",
        "c": 3,
        "r": 0,
        "layer": "ground2"
      },
      {
        "id": "tile_mu5e3ndv",
        "c": 3,
        "r": 8,
        "layer": "object4",
        "ox": 0,
        "oy": 0
      },
      {
        "id": "tile_new_bg_wall",
        "c": 4,
        "r": 0,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 5,
        "r": 0,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 6,
        "r": 0,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 7,
        "r": 0,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 8,
        "r": 0,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 9,
        "r": 0,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 10,
        "r": 0,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 11,
        "r": 0,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 12,
        "r": 0,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 13,
        "r": 0,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 14,
        "r": 0,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_window",
        "c": 6,
        "r": 1,
        "layer": "ground2",
        "ox": -10,
        "oy": 4
      },
      {
        "id": "tile_eoc_sofa",
        "c": 5,
        "r": 3,
        "layer": "object",
        "ox": 6,
        "oy": -4
      },
      {
        "id": "tile_eoc_sofa_side",
        "c": 4,
        "r": 4,
        "layer": "object",
        "ox": -6,
        "oy": -2
      },
      {
        "id": "tile_eoc_wooden_cabinet",
        "c": 5,
        "r": 5,
        "layer": "object",
        "ox": 14,
        "oy": -8
      },
      {
        "id": "tile_new_decor_fire_extinguisher",
        "c": 4,
        "r": 4,
        "layer": "ground3",
        "ox": -6,
        "oy": -4
      },
      {
        "id": "tile_new_decor_plant03",
        "c": 7,
        "r": 2,
        "layer": "object",
        "ox": 4,
        "oy": 22
      },
      {
        "id": "tile_new_decor_poster",
        "c": 4,
        "r": 1,
        "layer": "object"
      },
      {
        "id": "tile_eoc_binder_cabinet",
        "c": 9,
        "r": 2,
        "layer": "object",
        "ox": -10,
        "oy": -16
      },
      {
        "id": "tile_eoc_sideboard",
        "c": 10,
        "r": 3,
        "layer": "object",
        "ox": 2,
        "oy": -14
      },
      {
        "id": "tile_mu5e3ndv",
        "c": 14,
        "r": 8,
        "layer": "object3"
      },
      {
        "id": "tile_mu5e3ndv",
        "c": 14,
        "r": 0,
        "layer": "object"
      },
      {
        "id": "tile_eoc_office_chair_black",
        "c": 12,
        "r": 6,
        "layer": "object",
        "ox": -18,
        "oy": 28,
        "sortDepth": 1.25
      },
      {
        "id": "tile_eoc_comms_desk",
        "c": 10,
        "r": 6,
        "layer": "object",
        "ox": -20,
        "oy": -14
      },
      {
        "id": "tile_scene_cabinet_low_02",
        "c": 13,
        "r": 7,
        "layer": "object",
        "ox": 26,
        "oy": -36
      },
      {
        "id": "tile_eoc_door",
        "c": 4,
        "r": 10,
        "layer": "ground",
        "fx": true,
        "fy": true,
        "ox": 42,
        "oy": 0
      },
      {
        "id": "tile_eoc_binder_row",
        "c": 11,
        "r": 3,
        "layer": "object4",
        "fx": true,
        "fy": false,
        "ox": 18,
        "oy": -18
      },
      {
        "id": "tile_new_decor_coffee_machine",
        "c": 10,
        "r": 3,
        "layer": "object4",
        "fx": true,
        "fy": false,
        "ox": 20,
        "oy": -14
      },
      {
        "id": "tile_eoc_filing_cabinet",
        "c": 11,
        "r": 9,
        "layer": "object3",
        "ox": -38,
        "oy": -26
      },
      {
        "id": "tile_eoc_book_stack",
        "c": 11,
        "r": 8,
        "layer": "object4",
        "ox": -38,
        "oy": 14
      },
      {
        "id": "tile_eoc_tea_tray",
        "c": 5,
        "r": 5,
        "layer": "object4",
        "ox": 32,
        "oy": 6
      },
      {
        "id": "tile_eoc_locker",
        "c": 13,
        "r": 2,
        "layer": "object4",
        "ox": -18,
        "oy": -20
      },
      {
        "id": "tile_eoc_filing_cabinet",
        "c": 4,
        "r": 7,
        "layer": "object",
        "ox": -12,
        "oy": 0
      },
      {
        "id": "tile_new_decor_water_dispenser",
        "c": 5,
        "r": 7,
        "layer": "object",
        "ox": -20,
        "oy": 2
      },
      {
        "id": "tile_eoc_tissue_box",
        "c": 4,
        "r": 7,
        "layer": "object2",
        "ox": -12,
        "oy": -2
      },
      {
        "id": "color_mu8nxukw",
        "c": 15,
        "r": 6,
        "layer": "floor",
        "ox": -10,
        "oy": 2
      },
      {
        "id": "color_mu8nxukw",
        "c": 2,
        "r": 4,
        "layer": "ground",
        "ox": 10,
        "oy": 0
      },
      {
        "id": "color_mu8nxukw",
        "c": 2,
        "r": 8,
        "layer": "ground",
        "ox": 10,
        "oy": 0
      },
      {
        "id": "color_mu8nxukw",
        "c": 16,
        "r": 6,
        "layer": "ground",
        "ox": -10,
        "oy": 2
      },
      {
        "id": "tile_new_bg_floor",
        "c": 5,
        "r": 6,
        "layer": "floor",
        "ox": 0,
        "oy": 0
      },
      {
        "id": "tile_bg_wall_front_edge03",
        "c": 14,
        "r": 5,
        "layer": "top",
        "ox": 0,
        "oy": 12
      },
      {
        "id": "tile_mu8rra80",
        "c": 14,
        "r": 6,
        "layer": "object",
        "ox": -14,
        "oy": 0
      }
    ],
    "solid": [
      "14,6",
      "14,7",
      "14,8",
      "15,8",
      "15,9",
      "14,9",
      "14,10",
      "14,11",
      "15,6",
      "15,7",
      "3,4",
      "3,5",
      "3,6",
      "3,7",
      "3,8",
      "3,9",
      "3,10",
      "3,3",
      "4,3",
      "5,3",
      "6,3",
      "6,4",
      "5,4",
      "4,4",
      "4,5",
      "4,6",
      "4,8",
      "9,3",
      "10,3",
      "11,3",
      "6,6",
      "7,3",
      "8,3",
      "15,3",
      "10,7",
      "10,8",
      "10,9",
      "14,4",
      "15,5",
      "15,4",
      "12,3",
      "13,3",
      "14,3",
      "3,11"
    ],
    "breakable": [],
    "camp": [
      "24,13"
    ],
    "rules": {
      "money": 150,
      "guide": 100,
      "guideRegen": 9,
      "speed": 44,
      "reward": 8
    },
    "safe": true,
    "cols": 17,
    "rows": 12,
    "npcs": false,
    "portals": [
      {
        "c": 5,
        "r": 11,
        "to": "map_mu5ad7t2"
      },
      {
        "c": 6,
        "r": 11,
        "to": "map_mu5ad7t2"
      },
      {
        "c": 14,
        "r": 4,
        "to": "map_mufvtoiq"
      },
      {
        "c": 14,
        "r": 5,
        "to": "map_mufvtoiq"
      }
    ],
    "solidOffsets": {
      "15,3": [
        0,
        -4
      ],
      "5,3": [
        0,
        -5
      ],
      "5,4": [
        0,
        -12
      ],
      "6,4": [
        0,
        -11
      ],
      "4,5": [
        -5,
        0
      ],
      "4,6": [
        -6,
        0
      ]
    },
    "coreSpots": [],
    "coreCount": 1,
    "spawnZone": []
  },
  {
    "id": "map_mubj5gxm",
    "name": "嚮導辦公室",
    "desc": "",
    "layers": {
      "floor": {
        "11,1": "tile_new_bg_floor",
        "10,1": "tile_new_bg_floor",
        "5,2": "tile_new_bg_floor",
        "6,3": "tile_new_bg_floor",
        "7,4": "tile_new_bg_floor",
        "8,4": "tile_new_bg_floor",
        "9,4": "tile_new_bg_floor",
        "11,4": "tile_new_bg_floor",
        "12,4": "tile_new_bg_floor",
        "12,3": "tile_new_bg_floor",
        "10,3": "tile_new_bg_floor",
        "9,2": "tile_new_bg_floor",
        "7,2": "tile_new_bg_floor",
        "5,3": "tile_new_bg_floor",
        "4,3": "tile_new_bg_floor",
        "4,4": "tile_new_bg_floor",
        "3,5": "tile_new_bg_floor",
        "4,5": "tile_new_bg_floor",
        "4,6": "tile_new_bg_floor",
        "5,6": "tile_new_bg_floor",
        "7,6": "tile_new_bg_floor",
        "9,6": "tile_new_bg_floor",
        "11,5": "tile_new_bg_floor",
        "13,5": "tile_new_bg_floor",
        "14,4": "tile_new_bg_floor",
        "13,4": "tile_new_bg_floor",
        "7,5": "tile_new_bg_floor",
        "8,5": "tile_new_bg_floor",
        "9,5": "tile_new_bg_floor",
        "10,5": "tile_new_bg_floor",
        "8,3": "tile_new_bg_floor",
        "9,3": "tile_new_bg_floor",
        "11,3": "tile_new_bg_floor",
        "13,2": "tile_new_bg_floor",
        "14,2": "tile_new_bg_floor",
        "7,1": "tile_new_bg_floor",
        "8,1": "tile_new_bg_floor",
        "9,1": "tile_new_bg_floor",
        "6,1": "tile_new_bg_floor",
        "5,1": "tile_new_bg_floor",
        "11,2": "tile_new_bg_floor",
        "8,2": "tile_new_bg_floor",
        "10,2": "tile_new_bg_floor",
        "12,2": "tile_new_bg_floor",
        "7,3": "tile_new_bg_floor",
        "3,2": "tile_new_bg_floor",
        "3,3": "tile_new_bg_floor",
        "3,4": "tile_new_bg_floor",
        "3,6": "tile_new_bg_floor",
        "3,7": "tile_new_bg_floor",
        "3,8": "tile_new_bg_floor",
        "3,9": "tile_new_bg_floor",
        "3,10": "tile_new_bg_floor",
        "3,11": "tile_new_bg_floor",
        "4,2": "tile_new_bg_floor",
        "4,7": "tile_new_bg_floor",
        "4,8": "tile_new_bg_floor",
        "4,9": "tile_new_bg_floor",
        "4,10": "tile_new_bg_floor",
        "4,11": "tile_new_bg_floor",
        "5,4": "tile_new_bg_floor",
        "5,5": "tile_new_bg_floor",
        "5,7": "tile_new_bg_floor",
        "5,8": "tile_new_bg_floor",
        "5,9": "tile_new_bg_floor",
        "5,10": "tile_new_bg_floor",
        "5,11": "tile_new_bg_floor",
        "6,2": "tile_new_bg_floor",
        "6,4": "tile_new_bg_floor",
        "6,5": "tile_new_bg_floor",
        "6,6": "tile_new_bg_floor",
        "6,7": "tile_new_bg_floor",
        "6,8": "tile_new_bg_floor",
        "6,9": "tile_new_bg_floor",
        "6,10": "tile_new_bg_floor",
        "6,11": "tile_new_bg_floor",
        "7,7": "tile_new_bg_floor",
        "7,8": "tile_new_bg_floor",
        "7,9": "tile_new_bg_floor",
        "7,10": "tile_new_bg_floor",
        "7,11": "tile_new_bg_floor",
        "8,6": "tile_new_bg_floor",
        "8,7": "tile_new_bg_floor",
        "8,8": "tile_new_bg_floor",
        "8,9": "tile_new_bg_floor",
        "8,10": "tile_new_bg_floor",
        "8,11": "tile_new_bg_floor",
        "9,7": "tile_new_bg_floor",
        "9,8": "tile_new_bg_floor",
        "9,9": "tile_new_bg_floor",
        "9,10": "tile_new_bg_floor",
        "9,11": "tile_new_bg_floor",
        "10,4": "tile_new_bg_floor",
        "10,6": "tile_new_bg_floor",
        "10,7": "tile_new_bg_floor",
        "10,8": "tile_new_bg_floor",
        "10,9": "tile_new_bg_floor",
        "10,10": "tile_new_bg_floor",
        "10,11": "tile_new_bg_floor",
        "11,6": "tile_new_bg_floor",
        "11,7": "tile_new_bg_floor",
        "11,8": "tile_new_bg_floor",
        "11,9": "tile_new_bg_floor",
        "11,10": "tile_new_bg_floor",
        "11,11": "tile_new_bg_floor",
        "12,1": "tile_new_bg_floor",
        "12,5": "tile_new_bg_floor",
        "12,6": "tile_new_bg_floor",
        "12,7": "tile_new_bg_floor",
        "12,8": "tile_new_bg_floor",
        "12,9": "tile_new_bg_floor",
        "12,10": "tile_new_bg_floor",
        "12,11": "tile_new_bg_floor",
        "13,3": "tile_new_bg_floor",
        "13,6": "tile_new_bg_floor",
        "13,7": "tile_new_bg_floor",
        "13,8": "tile_new_bg_floor",
        "13,9": "tile_new_bg_floor",
        "13,10": "tile_new_bg_floor",
        "13,11": "tile_new_bg_floor",
        "14,3": "tile_new_bg_floor",
        "14,5": "tile_new_bg_floor",
        "14,6": "tile_new_bg_floor",
        "14,7": "tile_new_bg_floor",
        "14,8": "tile_new_bg_floor",
        "14,9": "tile_new_bg_floor",
        "14,10": "tile_new_bg_floor",
        "14,11": "tile_new_bg_floor",
        "15,2": "tile_new_bg_floor",
        "15,3": "tile_new_bg_floor",
        "15,4": "tile_new_bg_floor",
        "15,5": "tile_new_bg_floor",
        "15,6": "tile_new_bg_floor",
        "15,7": "tile_new_bg_floor",
        "15,8": "tile_new_bg_floor",
        "15,9": "tile_new_bg_floor",
        "15,10": "tile_new_bg_floor",
        "15,11": "tile_new_bg_floor"
      },
      "ground": {},
      "ground2": {},
      "ground3": {},
      "object": {
        "3,9": "tile_new_bg_wall_front_edge"
      },
      "object2": {
        "15,1": "tile_new_bg_wall_front_edge",
        "15,2": "tile_new_bg_wall_front_edge",
        "15,3": "tile_new_bg_wall_front_edge",
        "15,4": "tile_new_bg_wall_front_edge",
        "15,5": "tile_new_bg_wall_front_edge",
        "15,6": "tile_new_bg_wall_front_edge",
        "15,7": "tile_new_bg_wall_front_edge",
        "15,8": "tile_new_bg_wall_front_edge",
        "15,9": "tile_new_bg_wall_front_edge",
        "15,10": "tile_new_bg_wall_front_edge",
        "15,11": "tile_new_bg_wall_front_edge",
        "3,2": "tile_new_bg_wall_front_edge",
        "3,3": "tile_new_bg_wall_front_edge",
        "3,4": "tile_new_bg_wall_front_edge",
        "3,5": "tile_new_bg_wall_front_edge",
        "3,7": "tile_new_bg_wall_front_edge",
        "3,6": "tile_new_bg_wall_front_edge",
        "3,11": "tile_new_bg_wall_front_edge",
        "3,10": "tile_new_bg_wall_front_edge",
        "3,8": "tile_new_bg_wall_front_edge",
        "14,1": "tile_eoc_security_camera"
      },
      "object3": {},
      "object4": {},
      "overlay": {},
      "top": {}
    },
    "stamps": [
      {
        "id": "tile_mu5e3ndv",
        "c": 3,
        "r": 0,
        "layer": "object"
      },
      {
        "id": "tile_mu5e3ndv",
        "c": 15,
        "r": 0,
        "layer": "object"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 3,
        "r": 0,
        "layer": "ground2"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 4,
        "r": 0,
        "layer": "ground2"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 5,
        "r": 0,
        "layer": "ground2"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 6,
        "r": 0,
        "layer": "ground2"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 7,
        "r": 0,
        "layer": "ground2"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 8,
        "r": 0,
        "layer": "ground2"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 9,
        "r": 0,
        "layer": "ground2"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 10,
        "r": 0,
        "layer": "ground2"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 11,
        "r": 0,
        "layer": "ground2"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 12,
        "r": 0,
        "layer": "ground2"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 13,
        "r": 0,
        "layer": "ground2"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 14,
        "r": 0,
        "layer": "ground2"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 14,
        "r": 0,
        "layer": "ground2"
      },
      {
        "id": "tile_new_bg_window",
        "c": 5,
        "r": 1,
        "layer": "ground3",
        "ox": 0,
        "oy": 4
      },
      {
        "id": "tile_new_bg_window",
        "c": 11,
        "r": 1,
        "layer": "ground3",
        "ox": 0,
        "oy": 4
      },
      {
        "id": "tile_eoc_supply_shelf",
        "c": 4,
        "r": 2,
        "layer": "object",
        "ox": 0,
        "oy": -14
      },
      {
        "id": "tile_eoc_pillar",
        "c": 4,
        "r": 5,
        "layer": "object",
        "ox": -16,
        "oy": -14
      },
      {
        "id": "tile_eoc_server_rack",
        "c": 8,
        "r": 4,
        "layer": "object",
        "ox": 0,
        "oy": 26,
        "sortDepth": 4.5
      },
      {
        "id": "tile_mu8rra80",
        "c": 14,
        "r": 5,
        "layer": "object",
        "ox": 26,
        "oy": 10
      },
      {
        "id": "tile_new_decor_fire_extinguisher",
        "c": 14,
        "r": 4,
        "layer": "object",
        "ox": 8,
        "oy": -20
      },
      {
        "id": "tile_new_decor_poster",
        "c": 9,
        "r": 1,
        "layer": "object"
      },
      {
        "id": "tile_new_decor_cabinet_low",
        "c": 10,
        "r": 3,
        "layer": "object",
        "ox": 12,
        "oy": -22
      },
      {
        "id": "tile_new_decor_cabinet_low",
        "c": 11,
        "r": 3,
        "layer": "object",
        "ox": 12,
        "oy": -22
      },
      {
        "id": "tile_new_decor_cabinet_low",
        "c": 12,
        "r": 3,
        "layer": "object",
        "ox": 12,
        "oy": -22
      },
      {
        "id": "tile_new_decor_plant01",
        "c": 9,
        "r": 3,
        "layer": "object",
        "ox": 2,
        "oy": -14
      },
      {
        "id": "tile_decor_medicalkit",
        "c": 12,
        "r": 5,
        "layer": "object2",
        "ox": -66,
        "oy": -90
      },
      {
        "id": "tile_eoc_office_chair_grey",
        "c": 11,
        "r": 5,
        "layer": "ground2",
        "sortDepth": 1.25,
        "ox": 4,
        "oy": 0
      },
      {
        "id": "tile_eoc_office_chair_grey",
        "c": 11,
        "r": 7,
        "layer": "ground2",
        "ox": 4,
        "oy": -16
      },
      {
        "id": "tile_eoc_office_chair_grey",
        "c": 7,
        "r": 5,
        "layer": "ground2",
        "fx": true,
        "sortDepth": 1.25,
        "ox": -4,
        "oy": 0
      },
      {
        "id": "tile_eoc_office_chair_grey",
        "c": 7,
        "r": 7,
        "layer": "ground2",
        "fx": true,
        "ox": -4,
        "oy": -16
      },
      {
        "id": "tile_eoc_door",
        "c": 5,
        "r": 10,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_eoc_plant_small_02",
        "c": 14,
        "r": 6,
        "layer": "object2",
        "fx": true,
        "ox": 18,
        "oy": -12
      },
      {
        "id": "tile_eoc_plant_small_01",
        "c": 14,
        "r": 5,
        "layer": "object2",
        "fx": true,
        "ox": 18,
        "oy": -12
      },
      {
        "id": "tile_eoc_book_stack",
        "c": 13,
        "r": 7,
        "layer": "object2",
        "ox": 58,
        "oy": 0
      },
      {
        "id": "tile_new_decor_water_dispenser",
        "c": 13,
        "r": 3,
        "layer": "object",
        "ox": 14,
        "oy": -16
      },
      {
        "id": "color_mu8nxukw",
        "c": 16,
        "r": 8,
        "layer": "ground",
        "ox": -10,
        "oy": 0
      },
      {
        "id": "color_mu8nxukw",
        "c": 16,
        "r": 4,
        "layer": "ground",
        "ox": -10,
        "oy": 0
      },
      {
        "id": "color_mu8nxukw",
        "c": 2,
        "r": 4,
        "layer": "ground",
        "ox": 10,
        "oy": 0
      },
      {
        "id": "color_mu8nxukw",
        "c": 2,
        "r": 8,
        "layer": "ground",
        "ox": 10,
        "oy": 0
      }
    ],
    "solid": [
      "3,3",
      "4,3",
      "5,3",
      "6,3",
      "3,4",
      "3,5",
      "3,6",
      "3,7",
      "3,2",
      "3,10",
      "3,9",
      "3,8",
      "3,11",
      "9,8",
      "9,6",
      "8,6",
      "10,6",
      "8,8",
      "8,7",
      "10,7",
      "10,8",
      "9,9",
      "15,8",
      "15,7",
      "15,6",
      "7,3",
      "8,3",
      "9,3",
      "10,3",
      "11,3",
      "12,3",
      "13,3",
      "14,3",
      "15,3",
      "15,4",
      "15,5",
      "15,9",
      "15,10",
      "15,11"
    ],
    "breakable": [],
    "camp": [
      "5,11",
      "6,11",
      "9,10"
    ],
    "rules": {
      "money": 150,
      "guide": 100,
      "guideRegen": 9,
      "speed": 44,
      "reward": 8
    },
    "solidOffsets": {},
    "safe": true,
    "npcs": false,
    "portals": [
      {
        "c": 5,
        "r": 11,
        "to": "map_mu5ad7t2"
      },
      {
        "c": 6,
        "r": 11,
        "to": "map_mu5ad7t2"
      }
    ],
    "cols": 18,
    "rows": 12,
    "coreSpots": [],
    "coreCount": 1,
    "spawnZone": []
  },
  {
    "id": "map_mubk73un",
    "name": "哨兵休息室",
    "desc": "",
    "layers": {
      "floor": {
        "11,1": "tile_new_bg_floor",
        "10,1": "tile_new_bg_floor",
        "5,2": "tile_new_bg_floor",
        "6,3": "tile_new_bg_floor",
        "7,4": "tile_new_bg_floor",
        "8,4": "tile_new_bg_floor",
        "9,4": "tile_new_bg_floor",
        "11,4": "tile_new_bg_floor",
        "12,4": "tile_new_bg_floor",
        "12,3": "tile_new_bg_floor",
        "10,3": "tile_new_bg_floor",
        "9,2": "tile_new_bg_floor",
        "7,2": "tile_new_bg_floor",
        "5,3": "tile_new_bg_floor",
        "4,3": "tile_new_bg_floor",
        "4,4": "tile_new_bg_floor",
        "3,5": "tile_new_bg_floor",
        "4,5": "tile_new_bg_floor",
        "4,6": "tile_new_bg_floor",
        "5,6": "tile_new_bg_floor",
        "7,6": "tile_new_bg_floor",
        "9,6": "tile_new_bg_floor",
        "11,5": "tile_new_bg_floor",
        "13,5": "tile_new_bg_floor",
        "14,4": "tile_new_bg_floor",
        "13,4": "tile_new_bg_floor",
        "7,5": "tile_new_bg_floor",
        "8,5": "tile_new_bg_floor",
        "9,5": "tile_new_bg_floor",
        "10,5": "tile_new_bg_floor",
        "8,3": "tile_new_bg_floor",
        "9,3": "tile_new_bg_floor",
        "11,3": "tile_new_bg_floor",
        "13,2": "tile_new_bg_floor",
        "14,2": "tile_new_bg_floor",
        "7,1": "tile_new_bg_floor",
        "8,1": "tile_new_bg_floor",
        "9,1": "tile_new_bg_floor",
        "6,1": "tile_new_bg_floor",
        "5,1": "tile_new_bg_floor",
        "11,2": "tile_new_bg_floor",
        "8,2": "tile_new_bg_floor",
        "10,2": "tile_new_bg_floor",
        "12,2": "tile_new_bg_floor",
        "7,3": "tile_new_bg_floor",
        "3,2": "tile_new_bg_floor",
        "3,3": "tile_new_bg_floor",
        "3,4": "tile_new_bg_floor",
        "3,6": "tile_new_bg_floor",
        "3,7": "tile_new_bg_floor",
        "3,8": "tile_new_bg_floor",
        "3,9": "tile_new_bg_floor",
        "3,10": "tile_new_bg_floor",
        "3,11": "tile_new_bg_floor",
        "4,2": "tile_new_bg_floor",
        "4,7": "tile_new_bg_floor",
        "4,8": "tile_new_bg_floor",
        "4,9": "tile_new_bg_floor",
        "4,10": "tile_new_bg_floor",
        "4,11": "tile_new_bg_floor",
        "5,4": "tile_new_bg_floor",
        "5,5": "tile_new_bg_floor",
        "5,7": "tile_new_bg_floor",
        "5,8": "tile_new_bg_floor",
        "5,9": "tile_new_bg_floor",
        "5,10": "tile_new_bg_floor",
        "5,11": "tile_new_bg_floor",
        "6,2": "tile_new_bg_floor",
        "6,4": "tile_new_bg_floor",
        "6,5": "tile_new_bg_floor",
        "6,6": "tile_new_bg_floor",
        "6,7": "tile_new_bg_floor",
        "6,8": "tile_new_bg_floor",
        "6,9": "tile_new_bg_floor",
        "6,10": "tile_new_bg_floor",
        "6,11": "tile_new_bg_floor",
        "7,7": "tile_new_bg_floor",
        "7,8": "tile_new_bg_floor",
        "7,9": "tile_new_bg_floor",
        "7,10": "tile_new_bg_floor",
        "7,11": "tile_new_bg_floor",
        "8,6": "tile_new_bg_floor",
        "8,7": "tile_new_bg_floor",
        "8,8": "tile_new_bg_floor",
        "8,9": "tile_new_bg_floor",
        "8,10": "tile_new_bg_floor",
        "8,11": "tile_new_bg_floor",
        "9,7": "tile_new_bg_floor",
        "9,8": "tile_new_bg_floor",
        "9,9": "tile_new_bg_floor",
        "9,10": "tile_new_bg_floor",
        "9,11": "tile_new_bg_floor",
        "10,4": "tile_new_bg_floor",
        "10,6": "tile_new_bg_floor",
        "10,7": "tile_new_bg_floor",
        "10,8": "tile_new_bg_floor",
        "10,9": "tile_new_bg_floor",
        "10,10": "tile_new_bg_floor",
        "10,11": "tile_new_bg_floor",
        "11,6": "tile_new_bg_floor",
        "11,7": "tile_new_bg_floor",
        "11,8": "tile_new_bg_floor",
        "11,9": "tile_new_bg_floor",
        "11,10": "tile_new_bg_floor",
        "11,11": "tile_new_bg_floor",
        "12,1": "tile_new_bg_floor",
        "12,5": "tile_new_bg_floor",
        "12,6": "tile_new_bg_floor",
        "12,7": "tile_new_bg_floor",
        "12,8": "tile_new_bg_floor",
        "12,9": "tile_new_bg_floor",
        "12,10": "tile_new_bg_floor",
        "12,11": "tile_new_bg_floor",
        "13,3": "tile_new_bg_floor",
        "13,6": "tile_new_bg_floor",
        "13,7": "tile_new_bg_floor",
        "13,8": "tile_new_bg_floor",
        "13,9": "tile_new_bg_floor",
        "13,10": "tile_new_bg_floor",
        "13,11": "tile_new_bg_floor",
        "14,3": "tile_new_bg_floor",
        "14,5": "tile_new_bg_floor",
        "14,6": "tile_new_bg_floor",
        "14,7": "tile_new_bg_floor",
        "14,8": "tile_new_bg_floor",
        "14,9": "tile_new_bg_floor",
        "14,10": "tile_new_bg_floor",
        "14,11": "tile_new_bg_floor",
        "15,2": "tile_new_bg_floor",
        "15,3": "tile_new_bg_floor",
        "15,4": "tile_new_bg_floor",
        "15,5": "tile_new_bg_floor",
        "15,6": "tile_new_bg_floor",
        "15,7": "tile_new_bg_floor",
        "15,8": "tile_new_bg_floor",
        "15,9": "tile_new_bg_floor",
        "15,10": "tile_new_bg_floor",
        "15,11": "tile_new_bg_floor"
      },
      "ground": {},
      "ground2": {},
      "ground3": {},
      "object": {
        "3,9": "tile_new_bg_wall_front_edge"
      },
      "object2": {
        "15,1": "tile_new_bg_wall_front_edge",
        "15,2": "tile_new_bg_wall_front_edge",
        "15,3": "tile_new_bg_wall_front_edge",
        "15,4": "tile_new_bg_wall_front_edge",
        "15,5": "tile_new_bg_wall_front_edge",
        "15,6": "tile_new_bg_wall_front_edge",
        "15,7": "tile_new_bg_wall_front_edge",
        "15,8": "tile_new_bg_wall_front_edge",
        "15,9": "tile_new_bg_wall_front_edge",
        "15,10": "tile_new_bg_wall_front_edge",
        "15,11": "tile_new_bg_wall_front_edge",
        "3,2": "tile_new_bg_wall_front_edge",
        "3,3": "tile_new_bg_wall_front_edge",
        "3,4": "tile_new_bg_wall_front_edge",
        "3,5": "tile_new_bg_wall_front_edge",
        "3,7": "tile_new_bg_wall_front_edge",
        "3,6": "tile_new_bg_wall_front_edge",
        "3,11": "tile_new_bg_wall_front_edge",
        "3,10": "tile_new_bg_wall_front_edge",
        "3,8": "tile_new_bg_wall_front_edge",
        "14,1": "tile_eoc_security_camera"
      },
      "object3": {
        "9,5": "tile_eoc_bubble_tea"
      },
      "object4": {},
      "overlay": {},
      "top": {}
    },
    "stamps": [
      {
        "id": "tile_mu5e3ndv",
        "c": 3,
        "r": 0,
        "layer": "object"
      },
      {
        "id": "tile_mu5e3ndv",
        "c": 15,
        "r": 0,
        "layer": "object"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 3,
        "r": 0,
        "layer": "ground2"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 4,
        "r": 0,
        "layer": "ground2"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 5,
        "r": 0,
        "layer": "ground2"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 6,
        "r": 0,
        "layer": "ground2"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 7,
        "r": 0,
        "layer": "ground2"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 8,
        "r": 0,
        "layer": "ground2"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 9,
        "r": 0,
        "layer": "ground2"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 10,
        "r": 0,
        "layer": "ground2"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 11,
        "r": 0,
        "layer": "ground2"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 12,
        "r": 0,
        "layer": "ground2"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 13,
        "r": 0,
        "layer": "ground2"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 14,
        "r": 0,
        "layer": "ground2"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 14,
        "r": 0,
        "layer": "ground2"
      },
      {
        "id": "tile_new_bg_window",
        "c": 5,
        "r": 1,
        "layer": "ground3",
        "ox": 0,
        "oy": 4
      },
      {
        "id": "tile_new_bg_window",
        "c": 11,
        "r": 1,
        "layer": "ground3",
        "ox": 0,
        "oy": 4
      },
      {
        "id": "tile_new_decor_poster",
        "c": 9,
        "r": 1,
        "layer": "object",
        "ox": -20,
        "oy": 2
      },
      {
        "id": "tile_eoc_door",
        "c": 5,
        "r": 10,
        "layer": "top",
        "fx": true,
        "ox": 136,
        "oy": 0
      },
      {
        "id": "color_mu8nxukw",
        "c": 16,
        "r": 8,
        "layer": "ground",
        "ox": -10,
        "oy": 0
      },
      {
        "id": "color_mu8nxukw",
        "c": 16,
        "r": 4,
        "layer": "ground",
        "ox": -10,
        "oy": 0
      },
      {
        "id": "color_mu8nxukw",
        "c": 2,
        "r": 4,
        "layer": "ground",
        "ox": 10,
        "oy": 0
      },
      {
        "id": "color_mu8nxukw",
        "c": 2,
        "r": 8,
        "layer": "ground",
        "ox": 10,
        "oy": 0
      },
      {
        "id": "tile_prop_shelf_locker_unit",
        "c": 4,
        "r": 2,
        "layer": "object",
        "fx": true,
        "ox": -4,
        "oy": -22
      },
      {
        "id": "tile_prop_single_bed",
        "c": 4,
        "r": 5,
        "layer": "object2",
        "fx": true,
        "ox": -24,
        "oy": -24
      },
      {
        "id": "tile_prop_tv_stand",
        "c": 8,
        "r": 3,
        "layer": "object",
        "fx": true,
        "ox": 0,
        "oy": -24
      },
      {
        "id": "tile_prop_shelf_locker_unit",
        "c": 13,
        "r": 2,
        "layer": "object",
        "fx": true,
        "ox": 4,
        "oy": -22
      },
      {
        "id": "tile_prop_single_bed",
        "c": 13,
        "r": 4,
        "layer": "object",
        "ox": -16,
        "oy": 16,
        "sortDepth": 1.75
      },
      {
        "id": "tile_prop_work_table",
        "c": 8,
        "r": 5,
        "layer": "object",
        "ox": 20,
        "oy": -4,
        "sortDepth": 2.75
      },
      {
        "id": "tile_new_decor_chair_side",
        "c": 10,
        "r": 5,
        "layer": "object",
        "ox": 20,
        "oy": 20,
        "sortDepth": 1
      },
      {
        "id": "tile_prop_tv_monitor",
        "c": 9,
        "r": 2,
        "layer": "object2",
        "fx": true,
        "ox": -20,
        "oy": -18
      },
      {
        "id": "tile_new_decor_water_dispenser",
        "c": 7,
        "r": 3,
        "layer": "object2",
        "fx": true,
        "ox": 10,
        "oy": -24
      },
      {
        "id": "tile_new_decor_refrigerator",
        "c": 11,
        "r": 3,
        "layer": "object2",
        "fx": true,
        "ox": -4,
        "oy": -22
      },
      {
        "id": "tile_prop_sofa_beige_side",
        "c": 4,
        "r": 8,
        "layer": "object3",
        "ox": -10,
        "oy": 18
      },
      {
        "id": "tile_eoc_wooden_cabinet",
        "c": 5,
        "r": 8,
        "layer": "object3",
        "ox": 12,
        "oy": 48
      },
      {
        "id": "tile_eoc_locker",
        "c": 4,
        "r": 6,
        "layer": "object",
        "ox": -12,
        "oy": 0
      },
      {
        "id": "tile_eoc_locker",
        "c": 5,
        "r": 6,
        "layer": "object",
        "ox": -18,
        "oy": 0
      },
      {
        "id": "tile_eoc_locker",
        "c": 6,
        "r": 6,
        "layer": "object",
        "ox": -24,
        "oy": 0
      },
      {
        "id": "tile_prop_single_bed",
        "c": 12,
        "r": 8,
        "layer": "object",
        "ox": 24,
        "oy": 4
      },
      {
        "id": "tile_prop_shelf_locker_unit",
        "c": 13,
        "r": 6,
        "layer": "object2",
        "ox": 14,
        "oy": -30,
        "sortDepth": 2.5
      },
      {
        "id": "tile_prop_drawer_cabinet",
        "c": 12,
        "r": 9,
        "layer": "object3",
        "ox": 30,
        "oy": 14,
        "sortDepth": 1.75
      },
      {
        "id": "tile_eoc_filing_cabinet",
        "c": 11,
        "r": 9,
        "layer": "object3",
        "ox": 52,
        "oy": 8
      },
      {
        "id": "tile_new_decor_fire_extinguisher",
        "c": 14,
        "r": 11,
        "layer": "object4",
        "ox": 12,
        "oy": -4
      },
      {
        "id": "tile_new_decor_plant01",
        "c": 6,
        "r": 3,
        "layer": "object3",
        "ox": 18,
        "oy": -18
      },
      {
        "id": "tile_eoc_tissue_box",
        "c": 12,
        "r": 9,
        "layer": "overlay",
        "ox": 12,
        "oy": 6
      },
      {
        "id": "tile_eoc_drawer_unit",
        "c": 6,
        "r": 7,
        "layer": "object3",
        "ox": 8,
        "oy": 0
      },
      {
        "id": "tile_eoc_locker",
        "c": 12,
        "r": 0,
        "layer": "object",
        "ox": 12,
        "oy": 58
      },
      {
        "id": "tile_new_decor_chair_side",
        "c": 7,
        "r": 5,
        "layer": "floor",
        "fx": true,
        "ox": 22,
        "oy": 20
      }
    ],
    "solid": [
      "4,3",
      "5,3",
      "6,3",
      "7,3",
      "10,3",
      "9,3",
      "8,3",
      "3,3",
      "3,4",
      "3,5",
      "3,6",
      "3,7",
      "3,8",
      "3,9",
      "3,10",
      "3,11",
      "11,3",
      "13,3",
      "12,3",
      "14,3",
      "15,3",
      "15,4",
      "15,6",
      "15,7",
      "15,9",
      "15,8",
      "12,10",
      "13,10",
      "14,10",
      "15,10",
      "13,9",
      "14,9",
      "14,7",
      "13,7",
      "15,5",
      "14,5",
      "13,5",
      "5,5",
      "4,5",
      "4,8",
      "5,8",
      "6,8",
      "9,6",
      "4,10",
      "6,10",
      "14,11",
      "15,11"
    ],
    "breakable": [],
    "camp": [
      "7,11",
      "8,11",
      "9,11",
      "10,11",
      "11,11"
    ],
    "rules": {
      "money": 150,
      "guide": 100,
      "guideRegen": 9,
      "speed": 44,
      "reward": 8
    },
    "solidOffsets": {},
    "safe": true,
    "npcs": false,
    "portals": [
      {
        "c": 9,
        "r": 11,
        "to": "map_mu5ad7t2"
      }
    ],
    "cols": 18,
    "rows": 12,
    "coreSpots": [],
    "coreCount": 1,
    "spawnZone": []
  },
  {
    "id": "map_mue26feq",
    "name": "疏導室",
    "desc": "",
    "layers": {
      "floor": {
        "10,2": "tile_new_bg_floor",
        "9,2": "tile_new_bg_floor",
        "4,3": "tile_new_bg_floor",
        "5,4": "tile_new_bg_floor",
        "6,5": "tile_new_bg_floor",
        "7,5": "tile_new_bg_floor",
        "8,5": "tile_new_bg_floor",
        "10,5": "tile_new_bg_floor",
        "11,5": "tile_new_bg_floor",
        "11,4": "tile_new_bg_floor",
        "9,4": "tile_new_bg_floor",
        "8,3": "tile_new_bg_floor",
        "6,3": "tile_new_bg_floor",
        "4,4": "tile_new_bg_floor",
        "3,4": "tile_new_bg_floor",
        "3,5": "tile_new_bg_floor",
        "2,6": "tile_new_bg_floor",
        "3,6": "tile_new_bg_floor",
        "3,7": "tile_new_bg_floor",
        "4,7": "tile_new_bg_floor",
        "6,7": "tile_new_bg_floor",
        "8,7": "tile_new_bg_floor",
        "10,6": "tile_new_bg_floor",
        "6,6": "tile_new_bg_floor",
        "7,6": "tile_new_bg_floor",
        "8,6": "tile_new_bg_floor",
        "9,6": "tile_new_bg_floor",
        "7,4": "tile_new_bg_floor",
        "8,4": "tile_new_bg_floor",
        "10,4": "tile_new_bg_floor",
        "6,2": "tile_new_bg_floor",
        "7,2": "tile_new_bg_floor",
        "8,2": "tile_new_bg_floor",
        "5,2": "tile_new_bg_floor",
        "4,2": "tile_new_bg_floor",
        "10,3": "tile_new_bg_floor",
        "7,3": "tile_new_bg_floor",
        "9,3": "tile_new_bg_floor",
        "11,3": "tile_new_bg_floor",
        "6,4": "tile_new_bg_floor",
        "2,3": "tile_new_bg_floor",
        "2,4": "tile_new_bg_floor",
        "2,5": "tile_new_bg_floor",
        "2,7": "tile_new_bg_floor",
        "2,8": "tile_new_bg_floor",
        "2,9": "tile_new_bg_floor",
        "2,10": "tile_new_bg_floor",
        "2,11": "tile_new_bg_floor",
        "3,3": "tile_new_bg_floor",
        "3,8": "tile_new_bg_floor",
        "3,9": "tile_new_bg_floor",
        "3,10": "tile_new_bg_floor",
        "3,11": "tile_new_bg_floor",
        "4,5": "tile_new_bg_floor",
        "4,6": "tile_new_bg_floor",
        "4,8": "tile_new_bg_floor",
        "4,9": "tile_new_bg_floor",
        "4,10": "tile_new_bg_floor",
        "4,11": "tile_new_bg_floor",
        "5,3": "tile_new_bg_floor",
        "5,5": "tile_new_bg_floor",
        "5,6": "tile_new_bg_floor",
        "5,7": "tile_new_bg_floor",
        "5,8": "tile_new_bg_floor",
        "5,9": "tile_new_bg_floor",
        "5,10": "tile_new_bg_floor",
        "5,11": "tile_new_bg_floor",
        "6,8": "tile_new_bg_floor",
        "6,9": "tile_new_bg_floor",
        "6,10": "tile_new_bg_floor",
        "6,11": "tile_new_bg_floor",
        "7,7": "tile_new_bg_floor",
        "7,8": "tile_new_bg_floor",
        "7,9": "tile_new_bg_floor",
        "7,10": "tile_new_bg_floor",
        "7,11": "tile_new_bg_floor",
        "8,8": "tile_new_bg_floor",
        "8,9": "tile_new_bg_floor",
        "8,10": "tile_new_bg_floor",
        "8,11": "tile_new_bg_floor",
        "9,5": "tile_new_bg_floor",
        "9,7": "tile_new_bg_floor",
        "9,8": "tile_new_bg_floor",
        "9,9": "tile_new_bg_floor",
        "9,10": "tile_new_bg_floor",
        "9,11": "tile_new_bg_floor",
        "10,7": "tile_new_bg_floor",
        "10,8": "tile_new_bg_floor",
        "10,9": "tile_new_bg_floor",
        "10,10": "tile_new_bg_floor",
        "10,11": "tile_new_bg_floor",
        "11,2": "tile_new_bg_floor",
        "11,6": "tile_new_bg_floor",
        "11,7": "tile_new_bg_floor",
        "11,8": "tile_new_bg_floor",
        "11,9": "tile_new_bg_floor",
        "11,10": "tile_new_bg_floor",
        "11,11": "tile_new_bg_floor"
      },
      "ground": {},
      "ground2": {},
      "ground3": {},
      "object": {
        "2,10": "tile_new_bg_wall_front_edge",
        "5,8": "tile_counseling_medical_stool"
      },
      "object2": {
        "2,3": "tile_new_bg_wall_front_edge",
        "2,4": "tile_new_bg_wall_front_edge",
        "2,5": "tile_new_bg_wall_front_edge",
        "2,6": "tile_new_bg_wall_front_edge",
        "2,8": "tile_new_bg_wall_front_edge",
        "2,7": "tile_new_bg_wall_front_edge",
        "2,11": "tile_new_bg_wall_front_edge",
        "2,9": "tile_new_bg_wall_front_edge",
        "11,3": "tile_new_bg_wall_front_edge",
        "11,2": "tile_new_bg_wall_front_edge",
        "11,4": "tile_new_bg_wall_front_edge",
        "11,5": "tile_new_bg_wall_front_edge",
        "11,6": "tile_new_bg_wall_front_edge",
        "11,7": "tile_new_bg_wall_front_edge",
        "11,8": "tile_new_bg_wall_front_edge",
        "11,9": "tile_new_bg_wall_front_edge",
        "11,10": "tile_new_bg_wall_front_edge",
        "11,11": "tile_new_bg_wall_front_edge",
        "2,2": "tile_new_bg_wall_front_edge"
      },
      "object3": {
        "8,7": "tile_eoc_mug"
      },
      "object4": {},
      "overlay": {},
      "top": {}
    },
    "stamps": [
      {
        "id": "tile_mu5e3ndv",
        "c": 2,
        "r": 1,
        "layer": "object"
      },
      {
        "id": "tile_mu5e3ndv",
        "c": 11,
        "r": 1,
        "layer": "object"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 2,
        "r": 1,
        "layer": "ground2"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 3,
        "r": 1,
        "layer": "ground2"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 4,
        "r": 1,
        "layer": "ground2"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 5,
        "r": 1,
        "layer": "ground2"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 6,
        "r": 1,
        "layer": "ground2"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 7,
        "r": 1,
        "layer": "ground2"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 8,
        "r": 1,
        "layer": "ground2"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 9,
        "r": 1,
        "layer": "ground2",
        "ox": 0,
        "oy": 0
      },
      {
        "id": "tile_new_bg_wall",
        "c": 10,
        "r": 1,
        "layer": "ground2"
      },
      {
        "id": "tile_eoc_door",
        "c": 7,
        "r": 10,
        "layer": "top",
        "fx": true,
        "ox": -28,
        "oy": 0
      },
      {
        "id": "color_mu8nxukw",
        "c": 1,
        "r": 5,
        "layer": "ground",
        "ox": 10,
        "oy": 0
      },
      {
        "id": "color_mu8nxukw",
        "c": 1,
        "r": 9,
        "layer": "ground",
        "ox": 10,
        "oy": 0
      },
      {
        "id": "color_mu8nxukw",
        "c": 12,
        "r": 5,
        "layer": "ground",
        "ox": -10,
        "oy": 0
      },
      {
        "id": "color_mu8nxukw",
        "c": 12,
        "r": 9,
        "layer": "ground",
        "ox": -10,
        "oy": 0
      },
      {
        "id": "tile_counseling_counselor_chair",
        "c": 9,
        "r": 6,
        "layer": "object",
        "sortDepth": 1,
        "ox": 0,
        "oy": -6
      },
      {
        "id": "tile_counseling_consultation_desk",
        "c": 7,
        "r": 7,
        "layer": "object2",
        "ox": 26,
        "oy": 4,
        "sortDepth": 1.75
      },
      {
        "id": "tile_counseling_visitor_chair",
        "c": 9,
        "r": 8,
        "layer": "object3",
        "sortDepth": 1.25
      },
      {
        "id": "tile_counseling_privacy_curtain_side",
        "c": 2,
        "r": 5,
        "layer": "top",
        "ox": 20,
        "oy": -10
      },
      {
        "id": "tile_counseling_privacy_curtain_wide",
        "c": 2,
        "r": 4,
        "layer": "object2",
        "ox": 18,
        "oy": 18,
        "sortDepth": 2.5
      },
      {
        "id": "tile_counseling_monitoring_bed",
        "c": 3,
        "r": 6,
        "layer": "object3",
        "ox": -22,
        "oy": 16,
        "sortDepth": 2.75
      },
      {
        "id": "tile_counseling_load_monitor",
        "c": 4,
        "r": 6,
        "layer": "object4"
      },
      {
        "id": "tile_eoc_security_camera",
        "c": 3,
        "r": 2,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_counseling_window_blinds",
        "c": 4,
        "r": 2,
        "layer": "ground3",
        "ox": 2,
        "oy": 6
      },
      {
        "id": "tile_counseling_medical_kit",
        "c": 7,
        "r": 4,
        "layer": "object3",
        "ox": -2,
        "oy": -10
      },
      {
        "id": "tile_eoc_binder_row",
        "c": 9,
        "r": 4,
        "layer": "object3",
        "ox": -8,
        "oy": -14
      },
      {
        "id": "tile_counseling_wall_vent",
        "c": 6,
        "r": 4,
        "layer": "object3",
        "ox": 8,
        "oy": -14
      },
      {
        "id": "tile_counseling_tissue_box",
        "c": 5,
        "r": 4,
        "layer": "object3",
        "ox": 4,
        "oy": -16
      },
      {
        "id": "tile_eoc_binder_row",
        "c": 3,
        "r": 4,
        "layer": "object3",
        "ox": 0,
        "oy": -14
      },
      {
        "id": "tile_new_decor_poster",
        "c": 8,
        "r": 2,
        "layer": "ground3",
        "ox": -22,
        "oy": 2
      },
      {
        "id": "tile_counseling_wall_cabinet_counter",
        "c": 3,
        "r": 4,
        "layer": "object",
        "sortDepth": 1.5,
        "ox": 0,
        "oy": -4
      },
      {
        "id": "tile_eoc_locker",
        "c": 10,
        "r": 2,
        "layer": "object",
        "ox": 0,
        "oy": 26
      },
      {
        "id": "tile_eoc_pen_holder",
        "c": 10,
        "r": 7,
        "layer": "object3",
        "ox": 4,
        "oy": -16
      },
      {
        "id": "tile_eoc_tissue_box",
        "c": 10,
        "r": 7,
        "layer": "object4",
        "ox": 2,
        "oy": 4
      }
    ],
    "solid": [
      "2,4",
      "3,4",
      "5,4",
      "2,5",
      "2,6",
      "2,7",
      "2,8",
      "2,3",
      "2,11",
      "2,10",
      "2,9",
      "6,4",
      "9,4",
      "10,4",
      "11,4",
      "11,5",
      "11,6",
      "11,7",
      "11,8",
      "11,9",
      "11,10",
      "11,11",
      "7,4",
      "8,4",
      "3,0",
      "3,11",
      "4,11",
      "5,11",
      "4,4",
      "3,7",
      "3,8",
      "8,8",
      "8,7",
      "9,7",
      "10,7"
    ],
    "breakable": [],
    "camp": [
      "8,11"
    ],
    "rules": {
      "money": 150,
      "guide": 100,
      "guideRegen": 9,
      "speed": 44,
      "reward": 8
    },
    "solidOffsets": {},
    "safe": true,
    "npcs": false,
    "portals": [
      {
        "c": 7,
        "r": 11,
        "to": "map_mu5ad7t2"
      }
    ],
    "cols": 16,
    "rows": 12,
    "coreSpots": [],
    "coreCount": 1,
    "spawnZone": []
  },
  {
    "id": "map_mufu03od",
    "name": "雷德哨兵寢室",
    "desc": "",
    "layers": {
      "floor": {
        "4,2": "tile_new_bg_floor",
        "5,3": "tile_new_bg_floor",
        "6,4": "tile_new_bg_floor",
        "7,4": "tile_new_bg_floor",
        "8,4": "tile_new_bg_floor",
        "8,2": "tile_new_bg_floor",
        "6,2": "tile_new_bg_floor",
        "4,3": "tile_new_bg_floor",
        "3,3": "tile_new_bg_floor",
        "3,4": "tile_new_bg_floor",
        "2,5": "tile_new_bg_floor",
        "3,5": "tile_new_bg_floor",
        "3,6": "tile_new_bg_floor",
        "4,6": "tile_new_bg_floor",
        "6,6": "tile_new_bg_floor",
        "8,6": "tile_new_bg_floor",
        "6,5": "tile_new_bg_floor",
        "7,5": "tile_new_bg_floor",
        "8,5": "tile_new_bg_floor",
        "7,3": "tile_new_bg_floor",
        "8,3": "tile_new_bg_floor",
        "6,1": "tile_new_bg_floor",
        "7,1": "tile_new_bg_floor",
        "8,1": "tile_new_bg_floor",
        "5,1": "tile_new_bg_floor",
        "4,1": "tile_new_bg_floor",
        "7,2": "tile_new_bg_floor",
        "6,3": "tile_new_bg_floor",
        "2,2": "tile_new_bg_floor",
        "2,3": "tile_new_bg_floor",
        "2,4": "tile_new_bg_floor",
        "2,6": "tile_new_bg_floor",
        "2,7": "tile_new_bg_floor",
        "2,8": "tile_new_bg_floor",
        "2,9": "tile_new_bg_floor",
        "3,2": "tile_new_bg_floor",
        "3,7": "tile_new_bg_floor",
        "3,8": "tile_new_bg_floor",
        "3,9": "tile_new_bg_floor",
        "4,4": "tile_new_bg_floor",
        "4,5": "tile_new_bg_floor",
        "4,7": "tile_new_bg_floor",
        "4,8": "tile_new_bg_floor",
        "4,9": "tile_new_bg_floor",
        "5,2": "tile_new_bg_floor",
        "5,4": "tile_new_bg_floor",
        "5,5": "tile_new_bg_floor",
        "5,6": "tile_new_bg_floor",
        "5,7": "tile_new_bg_floor",
        "5,8": "tile_new_bg_floor",
        "5,9": "tile_new_bg_floor",
        "6,7": "tile_new_bg_floor",
        "6,8": "tile_new_bg_floor",
        "6,9": "tile_new_bg_floor",
        "7,6": "tile_new_bg_floor",
        "7,7": "tile_new_bg_floor",
        "7,8": "tile_new_bg_floor",
        "7,9": "tile_new_bg_floor",
        "8,7": "tile_new_bg_floor",
        "8,8": "tile_new_bg_floor",
        "8,9": "tile_new_bg_floor"
      },
      "ground": {},
      "ground2": {},
      "ground3": {},
      "object": {
        "2,9": "tile_new_bg_wall_front_edge"
      },
      "object2": {
        "2,2": "tile_new_bg_wall_front_edge",
        "2,3": "tile_new_bg_wall_front_edge",
        "2,4": "tile_new_bg_wall_front_edge",
        "2,5": "tile_new_bg_wall_front_edge",
        "2,7": "tile_new_bg_wall_front_edge",
        "2,6": "tile_new_bg_wall_front_edge",
        "2,8": "tile_new_bg_wall_front_edge",
        "2,1": "tile_new_bg_wall_front_edge",
        "8,1": "tile_new_bg_wall_front_edge",
        "8,2": "tile_new_bg_wall_front_edge",
        "8,3": "tile_new_bg_wall_front_edge",
        "8,4": "tile_new_bg_wall_front_edge",
        "8,5": "tile_new_bg_wall_front_edge",
        "8,6": "tile_new_bg_wall_front_edge",
        "8,7": "tile_new_bg_wall_front_edge",
        "8,8": "tile_new_bg_wall_front_edge",
        "8,9": "tile_new_bg_wall_front_edge"
      },
      "object3": {},
      "object4": {},
      "overlay": {},
      "top": {}
    },
    "stamps": [
      {
        "id": "tile_mu5e3ndv",
        "c": 2,
        "r": 0,
        "layer": "object"
      },
      {
        "id": "tile_mu5e3ndv",
        "c": 8,
        "r": 0,
        "layer": "object"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 2,
        "r": 0,
        "layer": "ground2"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 3,
        "r": 0,
        "layer": "ground2"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 4,
        "r": 0,
        "layer": "ground2"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 5,
        "r": 0,
        "layer": "ground2"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 6,
        "r": 0,
        "layer": "ground2"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 7,
        "r": 0,
        "layer": "ground2"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 8,
        "r": 0,
        "layer": "ground2"
      },
      {
        "id": "color_mu8nxukw",
        "c": 1,
        "r": 4,
        "layer": "ground",
        "ox": 10,
        "oy": 0
      },
      {
        "id": "color_mu8nxukw",
        "c": 1,
        "r": 8,
        "layer": "ground",
        "ox": 10,
        "oy": 0
      },
      {
        "id": "color_mu8nxukw",
        "c": 9,
        "r": 8,
        "layer": "ground",
        "ox": -10,
        "oy": 0
      },
      {
        "id": "tile_dorm_bed_vertical",
        "c": 3,
        "r": 2,
        "layer": "object",
        "ox": -10,
        "oy": 4
      },
      {
        "id": "tile_dorm_air_conditioner",
        "c": 3,
        "r": 1,
        "layer": "object",
        "ox": -10,
        "oy": -2
      },
      {
        "id": "tile_dorm_desk",
        "c": 5,
        "r": 2,
        "layer": "object",
        "ox": -26,
        "oy": 16,
        "sortDepth": 1
      },
      {
        "id": "tile_eoc_door",
        "c": 5,
        "r": 8,
        "layer": "top"
      },
      {
        "id": "tile_eoc_locker",
        "c": 6,
        "r": 2,
        "layer": "object",
        "ox": 6,
        "oy": -18,
        "sortDepth": 2.5
      },
      {
        "id": "color_mu8nxukw",
        "c": 9,
        "r": 4,
        "layer": "object2",
        "ox": -10,
        "oy": 0
      },
      {
        "id": "tile_eoc_locker",
        "c": 7,
        "r": 1,
        "layer": "object",
        "ox": 0,
        "oy": 22,
        "sortDepth": 2.5
      },
      {
        "id": "tile_mufv6z24",
        "c": 3,
        "r": 9,
        "layer": "object2",
        "ox": -24,
        "oy": 0
      },
      {
        "id": "tile_dorm_window_blinds_narrow",
        "c": 4,
        "r": 1,
        "layer": "ground3",
        "ox": 18,
        "oy": -14
      },
      {
        "id": "tile_mufv9ytk",
        "c": 7,
        "r": 2,
        "layer": "object3",
        "ox": 0,
        "oy": -14
      },
      {
        "id": "tile_dorm_binder_set",
        "c": 5,
        "r": 2,
        "layer": "object3",
        "ox": 16,
        "oy": 8,
        "sortDepth": 0.25
      },
      {
        "id": "tile_dorm_standing_fan",
        "c": 7,
        "r": 4,
        "layer": "object"
      },
      {
        "id": "tile_dorm_desk_lamp",
        "c": 1,
        "r": 2,
        "layer": "object3",
        "ox": 136,
        "oy": 12
      },
      {
        "id": "tile_eoc_pen_holder",
        "c": 1,
        "r": 3,
        "layer": "object3",
        "ox": 156,
        "oy": -28
      },
      {
        "id": "tile_restaurant_water_dispenser_01",
        "c": 5,
        "r": 3,
        "layer": "object2",
        "ox": -4,
        "oy": 10,
        "sortDepth": 1.75
      }
    ],
    "solid": [
      "2,3",
      "3,3",
      "5,3",
      "2,4",
      "2,5",
      "2,6",
      "2,7",
      "2,2",
      "6,3",
      "7,3",
      "8,3",
      "4,3",
      "8,7",
      "8,6",
      "8,4",
      "8,5",
      "8,8",
      "8,9",
      "3,4",
      "3,5",
      "7,5",
      "2,8",
      "2,9",
      "3,9"
    ],
    "breakable": [],
    "camp": [],
    "rules": {
      "money": 150,
      "guide": 100,
      "guideRegen": 9,
      "speed": 44,
      "reward": 8
    },
    "solidOffsets": {},
    "safe": true,
    "npcs": false,
    "portals": [
      {
        "c": 5,
        "r": 9,
        "to": "map_mufyx9gj"
      },
      {
        "c": 6,
        "r": 9,
        "to": "map_mufyx9gj"
      }
    ],
    "cols": 12,
    "rows": 10,
    "coreSpots": [],
    "coreCount": 1,
    "spawnZone": []
  },
  {
    "id": "map_mufvtoiq",
    "name": "溫特寢室",
    "desc": "",
    "layers": {
      "floor": {
        "5,2": "tile_new_bg_floor",
        "6,3": "tile_new_bg_floor",
        "7,4": "tile_new_bg_floor",
        "8,4": "tile_new_bg_floor",
        "9,4": "tile_new_bg_floor",
        "9,2": "tile_new_bg_floor",
        "7,2": "tile_new_bg_floor",
        "5,3": "tile_new_bg_floor",
        "4,3": "tile_new_bg_floor",
        "4,4": "tile_new_bg_floor",
        "3,5": "tile_new_bg_floor",
        "4,5": "tile_new_bg_floor",
        "4,6": "tile_new_bg_floor",
        "5,6": "tile_new_bg_floor",
        "7,6": "tile_new_bg_floor",
        "9,6": "tile_new_bg_floor",
        "7,5": "tile_new_bg_floor",
        "8,5": "tile_new_bg_floor",
        "9,5": "tile_new_bg_floor",
        "8,3": "tile_new_bg_floor",
        "9,3": "tile_new_bg_floor",
        "8,2": "tile_new_bg_floor",
        "7,3": "tile_new_bg_floor",
        "3,2": "tile_new_bg_floor",
        "3,3": "tile_new_bg_floor",
        "3,4": "tile_new_bg_floor",
        "3,6": "tile_new_bg_floor",
        "3,7": "tile_new_bg_floor",
        "3,8": "tile_new_bg_floor",
        "3,9": "tile_new_bg_floor",
        "4,2": "tile_new_bg_floor",
        "4,7": "tile_new_bg_floor",
        "4,8": "tile_new_bg_floor",
        "4,9": "tile_new_bg_floor",
        "5,4": "tile_new_bg_floor",
        "5,5": "tile_new_bg_floor",
        "5,7": "tile_new_bg_floor",
        "5,8": "tile_new_bg_floor",
        "5,9": "tile_new_bg_floor",
        "6,2": "tile_new_bg_floor",
        "6,4": "tile_new_bg_floor",
        "6,5": "tile_new_bg_floor",
        "6,6": "tile_new_bg_floor",
        "6,7": "tile_new_bg_floor",
        "6,8": "tile_new_bg_floor",
        "6,9": "tile_new_bg_floor",
        "7,7": "tile_new_bg_floor",
        "7,8": "tile_new_bg_floor",
        "7,9": "tile_new_bg_floor",
        "8,6": "tile_new_bg_floor",
        "8,7": "tile_new_bg_floor",
        "8,8": "tile_new_bg_floor",
        "8,9": "tile_new_bg_floor",
        "9,7": "tile_new_bg_floor",
        "9,8": "tile_new_bg_floor",
        "9,9": "tile_new_bg_floor",
        "10,4": "tile_new_bg_floor",
        "11,4": "tile_new_bg_floor",
        "11,5": "tile_new_bg_floor",
        "10,5": "tile_new_bg_floor",
        "10,3": "tile_new_bg_floor",
        "10,6": "tile_new_bg_floor",
        "10,7": "tile_new_bg_floor",
        "10,8": "tile_new_bg_floor",
        "10,9": "tile_new_bg_floor",
        "11,6": "tile_new_bg_floor",
        "11,7": "tile_new_bg_floor",
        "11,8": "tile_new_bg_floor",
        "11,9": "tile_new_bg_floor",
        "2,6": "tile_new_bg_floor",
        "2,7": "tile_new_bg_floor",
        "2,8": "tile_new_bg_floor",
        "2,9": "tile_new_bg_floor",
        "2,10": "tile_new_bg_floor",
        "2,11": "tile_new_bg_floor",
        "3,11": "tile_new_bg_floor",
        "4,11": "tile_new_bg_floor",
        "4,10": "tile_new_bg_floor",
        "3,10": "tile_new_bg_floor",
        "5,10": "tile_new_bg_floor",
        "6,10": "tile_new_bg_floor",
        "7,10": "tile_new_bg_floor",
        "8,10": "tile_new_bg_floor",
        "8,11": "tile_new_bg_floor",
        "7,11": "tile_new_bg_floor",
        "6,11": "tile_new_bg_floor",
        "5,11": "tile_new_bg_floor",
        "9,11": "tile_new_bg_floor",
        "10,11": "tile_new_bg_floor",
        "10,10": "tile_new_bg_floor",
        "9,10": "tile_new_bg_floor",
        "11,10": "tile_new_bg_floor",
        "11,11": "tile_new_bg_floor"
      },
      "ground": {},
      "ground2": {},
      "ground3": {},
      "object": {
        "2,9": "tile_new_bg_wall_front_edge"
      },
      "object2": {
        "11,2": "tile_new_bg_wall_front_edge",
        "11,3": "tile_new_bg_wall_front_edge",
        "11,4": "tile_new_bg_wall_front_edge",
        "11,5": "tile_new_bg_wall_front_edge",
        "11,6": "tile_new_bg_wall_front_edge",
        "11,7": "tile_new_bg_wall_front_edge",
        "11,8": "tile_new_bg_wall_front_edge",
        "2,6": "tile_new_bg_wall_front_edge",
        "2,7": "tile_new_bg_wall_front_edge",
        "2,8": "tile_new_bg_wall_front_edge",
        "2,10": "tile_new_bg_wall_front_edge",
        "11,9": "tile_new_bg_wall_front_edge",
        "11,10": "tile_new_bg_wall_front_edge",
        "10,11": "tile_bg_wall_front_edge02",
        "9,11": "tile_bg_wall_front_edge02",
        "8,11": "tile_bg_wall_front_edge02",
        "7,11": "tile_bg_wall_front_edge02",
        "6,11": "tile_bg_wall_front_edge02",
        "5,11": "tile_bg_wall_front_edge02",
        "4,11": "tile_bg_wall_front_edge02",
        "3,11": "tile_bg_wall_front_edge02"
      },
      "object3": {},
      "object4": {},
      "overlay": {},
      "top": {}
    },
    "stamps": [
      {
        "id": "tile_mu5e3ndv",
        "c": 2,
        "r": 0,
        "layer": "object"
      },
      {
        "id": "tile_mu5e3ndv",
        "c": 11,
        "r": 0,
        "layer": "object"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 3,
        "r": 0,
        "layer": "ground2"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 4,
        "r": 0,
        "layer": "ground2"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 5,
        "r": 0,
        "layer": "ground2"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 6,
        "r": 0,
        "layer": "ground2"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 7,
        "r": 0,
        "layer": "ground2"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 8,
        "r": 0,
        "layer": "ground2"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 10,
        "r": 0,
        "layer": "ground2"
      },
      {
        "id": "color_mu8nxukw",
        "c": 1,
        "r": 4,
        "layer": "ground",
        "ox": 10,
        "oy": 0
      },
      {
        "id": "color_mu8nxukw",
        "c": 1,
        "r": 8,
        "layer": "ground",
        "ox": 10,
        "oy": 0
      },
      {
        "id": "color_mu8nxukw",
        "c": 12,
        "r": 8,
        "layer": "ground",
        "ox": -10,
        "oy": 0
      },
      {
        "id": "color_mu8nxukw",
        "c": 12,
        "r": 4,
        "layer": "object2",
        "ox": -10,
        "oy": 0
      },
      {
        "id": "tile_new_bg_wall",
        "c": 9,
        "r": 0,
        "layer": "ground2"
      },
      {
        "id": "tile_bg_wall_front_edge03",
        "c": 11,
        "r": 11,
        "layer": "object2",
        "fx": true,
        "fy": true
      },
      {
        "id": "tile_bg_wall_front_edge03",
        "c": 2,
        "r": 11,
        "layer": "object2",
        "fy": true
      },
      {
        "id": "tile_dorm_wardrobe_lab_coat",
        "c": 9,
        "r": 2,
        "layer": "object",
        "ox": 4,
        "oy": -16,
        "sortDepth": 2.5
      },
      {
        "id": "tile_dorm_window_blinds_wide",
        "c": 6,
        "r": 1,
        "layer": "object",
        "ox": -10,
        "oy": -12
      },
      {
        "id": "tile_bg_wall_front_edge03",
        "c": 2,
        "r": 5,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_dorm_bed_horizontal",
        "c": 8,
        "r": 8,
        "layer": "object3",
        "ox": 16,
        "oy": 10,
        "sortDepth": 2.5
      },
      {
        "id": "tile_dorm_cabinet_tall",
        "c": 10,
        "r": 7,
        "layer": "object2",
        "ox": 18,
        "oy": 24
      },
      {
        "id": "tile_eoc_comms_desk",
        "c": 9,
        "r": 4,
        "layer": "object",
        "fx": true,
        "ox": 24,
        "oy": 20
      },
      {
        "id": "tile_eoc_office_chair_black",
        "c": 8,
        "r": 6,
        "layer": "object",
        "fx": true,
        "ox": 30,
        "oy": -20,
        "sortDepth": 1.75
      },
      {
        "id": "tile_dorm_shoe_bench",
        "c": 3,
        "r": 5,
        "layer": "object",
        "ox": -14,
        "oy": 0
      },
      {
        "id": "tile_dorm_rug_blue",
        "c": 4,
        "r": 5,
        "layer": "ground2",
        "ox": -28,
        "oy": 0
      },
      {
        "id": "tile_eoc_wooden_cabinet",
        "c": 4,
        "r": 8,
        "layer": "object",
        "ox": 6,
        "oy": 42
      },
      {
        "id": "tile_eoc_sofa_side",
        "c": 3,
        "r": 8,
        "layer": "object",
        "ox": -10,
        "oy": 12
      },
      {
        "id": "tile_eoc_binder_cabinet",
        "c": 3,
        "r": 1,
        "layer": "object3",
        "ox": 18,
        "oy": 24,
        "sortDepth": 2.5
      },
      {
        "id": "tile_eoc_plant_small_01",
        "c": 10,
        "r": 8,
        "layer": "object4",
        "ox": 18,
        "oy": -20
      },
      {
        "id": "tile_eoc_sideboard",
        "c": 6,
        "r": 2,
        "layer": "object2",
        "ox": 26,
        "oy": 24,
        "sortDepth": 1.5
      },
      {
        "id": "tile_eoc_sideboard",
        "c": 5,
        "r": 2,
        "layer": "object2",
        "ox": -14,
        "oy": 24,
        "sortDepth": 1.5
      },
      {
        "id": "tile_dorm_binder_set",
        "c": 5,
        "r": 2,
        "layer": "object3",
        "ox": -4,
        "oy": 20
      },
      {
        "id": "tile_mufv9ytk",
        "c": 8,
        "r": 3,
        "layer": "object3",
        "ox": 8,
        "oy": -18
      },
      {
        "id": "tile_eoc_first_aid_bag",
        "c": 7,
        "r": 3,
        "layer": "object3",
        "ox": 6,
        "oy": -20
      },
      {
        "id": "tile_eoc_book_stack",
        "c": 6,
        "r": 2,
        "layer": "object3",
        "ox": -20,
        "oy": 20
      },
      {
        "id": "tile_new_decor_plant01",
        "c": 2,
        "r": 3,
        "layer": "object3",
        "ox": 32,
        "oy": -14,
        "sortDepth": 1.5
      },
      {
        "id": "color_mufwrm72",
        "c": 2,
        "r": 11,
        "layer": "floor",
        "ox": 0,
        "oy": 30
      },
      {
        "id": "tile_mufvqx2u",
        "c": 2,
        "r": 4,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_mufvqx2u",
        "c": 2,
        "r": 5,
        "layer": "floor",
        "fx": true
      }
    ],
    "solid": [
      "3,3",
      "4,3",
      "6,3",
      "3,2",
      "7,3",
      "8,3",
      "9,3",
      "5,3",
      "2,6",
      "2,7",
      "2,8",
      "2,9",
      "2,10",
      "2,11",
      "3,11",
      "6,11",
      "4,11",
      "5,11",
      "7,11",
      "8,11",
      "9,11",
      "10,11",
      "11,11",
      "10,10",
      "9,10",
      "11,10",
      "10,3",
      "11,3",
      "11,5",
      "11,4",
      "11,6",
      "11,7",
      "11,9",
      "11,8",
      "2,3",
      "1,3",
      "1,4",
      "1,5",
      "1,6",
      "5,10",
      "10,6",
      "10,7"
    ],
    "breakable": [],
    "camp": [],
    "rules": {
      "money": 150,
      "guide": 100,
      "guideRegen": 9,
      "speed": 44,
      "reward": 8
    },
    "solidOffsets": {
      "2,10": [
        24,
        0
      ],
      "5,10": [
        -14,
        -6
      ],
      "2,6": [
        18,
        0
      ],
      "2,7": [
        19,
        0
      ],
      "1,6": [
        19,
        0
      ],
      "1,5": [
        29,
        0
      ],
      "2,3": [
        0,
        -9
      ],
      "1,4": [
        9,
        0
      ]
    },
    "safe": true,
    "npcs": false,
    "portals": [
      {
        "c": 2,
        "r": 4,
        "to": "map_mua3askw"
      }
    ],
    "cols": 14,
    "rows": 12,
    "coreSpots": [],
    "coreCount": 1,
    "spawnZone": []
  },
  {
    "id": "map_mufyx9gj",
    "name": "4F哨兵宿舍樓",
    "desc": "",
    "layers": {
      "floor": {
        "34,10": "tile_new_bg_floor",
        "34,11": "tile_new_bg_floor",
        "34,12": "tile_new_bg_floor",
        "33,12": "tile_new_bg_floor",
        "33,13": "tile_new_bg_floor",
        "44,13": "tile_new_bg_floor",
        "44,12": "tile_new_bg_floor",
        "44,11": "tile_new_bg_floor",
        "44,10": "tile_new_bg_floor",
        "43,13": "tile_new_bg_floor",
        "17,9": "tile_new_bg_floor",
        "17,10": "tile_new_bg_floor",
        "17,11": "tile_new_bg_floor",
        "17,12": "tile_new_bg_floor",
        "17,13": "tile_new_bg_floor",
        "18,13": "tile_new_bg_floor",
        "18,12": "tile_new_bg_floor",
        "18,11": "tile_new_bg_floor",
        "18,10": "tile_new_bg_floor",
        "18,9": "tile_new_bg_floor",
        "20,9": "tile_new_bg_floor",
        "20,10": "tile_new_bg_floor",
        "20,11": "tile_new_bg_floor",
        "19,12": "tile_new_bg_floor",
        "19,13": "tile_new_bg_floor",
        "19,11": "tile_new_bg_floor",
        "19,10": "tile_new_bg_floor",
        "19,9": "tile_new_bg_floor",
        "21,9": "tile_new_bg_floor",
        "21,10": "tile_new_bg_floor",
        "21,11": "tile_new_bg_floor",
        "21,12": "tile_new_bg_floor",
        "21,13": "tile_new_bg_floor",
        "20,13": "tile_new_bg_floor",
        "20,12": "tile_new_bg_floor",
        "22,9": "tile_new_bg_floor",
        "22,10": "tile_new_bg_floor",
        "22,11": "tile_new_bg_floor",
        "22,12": "tile_new_bg_floor",
        "22,13": "tile_new_bg_floor",
        "23,13": "tile_new_bg_floor",
        "23,12": "tile_new_bg_floor",
        "23,11": "tile_new_bg_floor",
        "23,10": "tile_new_bg_floor",
        "23,9": "tile_new_bg_floor",
        "24,9": "tile_new_bg_floor",
        "24,10": "tile_new_bg_floor",
        "24,11": "tile_new_bg_floor",
        "24,12": "tile_new_bg_floor",
        "24,13": "tile_new_bg_floor",
        "25,13": "tile_new_bg_floor",
        "25,12": "tile_new_bg_floor",
        "26,9": "tile_new_bg_floor",
        "26,10": "tile_new_bg_floor",
        "25,10": "tile_new_bg_floor",
        "25,11": "tile_new_bg_floor",
        "27,13": "tile_new_bg_floor",
        "26,13": "tile_new_bg_floor",
        "26,12": "tile_new_bg_floor",
        "26,11": "tile_new_bg_floor",
        "28,13": "tile_new_bg_floor",
        "28,12": "tile_new_bg_floor",
        "27,11": "tile_new_bg_floor",
        "27,10": "tile_new_bg_floor",
        "27,9": "tile_new_bg_floor",
        "25,9": "tile_new_bg_floor",
        "28,11": "tile_new_bg_floor",
        "28,10": "tile_new_bg_floor",
        "29,10": "tile_new_bg_floor",
        "29,11": "tile_new_bg_floor",
        "29,12": "tile_new_bg_floor",
        "29,13": "tile_new_bg_floor",
        "27,12": "tile_new_bg_floor",
        "33,10": "tile_new_bg_floor",
        "33,11": "tile_new_bg_floor",
        "31,13": "tile_new_bg_floor",
        "31,12": "tile_new_bg_floor",
        "31,11": "tile_new_bg_floor",
        "31,10": "tile_new_bg_floor",
        "32,10": "tile_new_bg_floor",
        "32,11": "tile_new_bg_floor",
        "32,12": "tile_new_bg_floor",
        "32,13": "tile_new_bg_floor",
        "35,11": "tile_new_bg_floor",
        "34,13": "tile_new_bg_floor",
        "35,10": "tile_new_bg_floor",
        "37,9": "tile_new_bg_floor",
        "37,10": "tile_new_bg_floor",
        "36,11": "tile_new_bg_floor",
        "36,10": "tile_new_bg_floor",
        "43,11": "tile_new_bg_floor",
        "43,12": "tile_new_bg_floor",
        "42,13": "tile_new_bg_floor",
        "30,13": "tile_new_bg_floor",
        "30,12": "tile_new_bg_floor",
        "30,11": "tile_new_bg_floor",
        "30,10": "tile_new_bg_floor",
        "38,13": "tile_new_bg_floor",
        "39,13": "tile_new_bg_floor",
        "37,13": "tile_new_bg_floor",
        "36,13": "tile_new_bg_floor",
        "35,13": "tile_new_bg_floor",
        "40,13": "tile_new_bg_floor",
        "41,13": "tile_new_bg_floor",
        "35,12": "tile_new_bg_floor",
        "37,11": "tile_new_bg_floor",
        "38,11": "tile_new_bg_floor",
        "40,11": "tile_new_bg_floor",
        "41,12": "tile_new_bg_floor",
        "42,12": "tile_new_bg_floor",
        "40,12": "tile_new_bg_floor",
        "39,12": "tile_new_bg_floor",
        "38,12": "tile_new_bg_floor",
        "37,12": "tile_new_bg_floor",
        "36,12": "tile_new_bg_floor",
        "41,11": "tile_new_bg_floor",
        "42,11": "tile_new_bg_floor",
        "40,10": "tile_new_bg_floor",
        "38,10": "tile_new_bg_floor",
        "39,10": "tile_new_bg_floor",
        "41,10": "tile_new_bg_floor",
        "43,10": "tile_new_bg_floor",
        "42,10": "tile_new_bg_floor",
        "39,11": "tile_new_bg_floor",
        "45,10": "tile_new_bg_floor",
        "45,11": "tile_new_bg_floor",
        "45,12": "tile_new_bg_floor",
        "45,13": "tile_new_bg_floor",
        "48,12": "tile_new_bg_floor",
        "48,13": "tile_new_bg_floor",
        "47,10": "tile_new_bg_floor",
        "47,11": "tile_new_bg_floor",
        "47,12": "tile_new_bg_floor",
        "47,13": "tile_new_bg_floor",
        "46,10": "tile_new_bg_floor",
        "46,12": "tile_new_bg_floor",
        "46,13": "tile_new_bg_floor",
        "46,11": "tile_new_bg_floor",
        "48,10": "tile_new_bg_floor",
        "48,11": "tile_new_bg_floor",
        "49,13": "tile_new_bg_floor",
        "50,13": "tile_new_bg_floor",
        "51,13": "tile_new_bg_floor",
        "52,13": "tile_new_bg_floor",
        "53,13": "tile_new_bg_floor",
        "54,13": "tile_new_bg_floor",
        "49,12": "tile_new_bg_floor",
        "50,12": "tile_new_bg_floor",
        "51,12": "tile_new_bg_floor",
        "52,12": "tile_new_bg_floor",
        "53,12": "tile_new_bg_floor",
        "54,12": "tile_new_bg_floor",
        "49,11": "tile_new_bg_floor",
        "50,11": "tile_new_bg_floor",
        "51,11": "tile_new_bg_floor",
        "52,11": "tile_new_bg_floor",
        "53,11": "tile_new_bg_floor",
        "54,11": "tile_new_bg_floor",
        "49,10": "tile_new_bg_floor",
        "50,10": "tile_new_bg_floor",
        "51,10": "tile_new_bg_floor",
        "52,10": "tile_new_bg_floor",
        "53,10": "tile_new_bg_floor",
        "54,10": "tile_new_bg_floor",
        "16,12": "tile_new_bg_floor",
        "15,13": "tile_new_bg_floor",
        "15,12": "tile_new_bg_floor",
        "16,11": "tile_new_bg_floor",
        "16,10": "tile_new_bg_floor",
        "15,10": "tile_new_bg_floor",
        "15,11": "tile_new_bg_floor",
        "16,13": "tile_new_bg_floor",
        "15,14": "tile_new_bg_floor",
        "16,14": "tile_new_bg_floor",
        "17,14": "tile_new_bg_floor",
        "18,14": "tile_new_bg_floor",
        "19,14": "tile_new_bg_floor",
        "20,14": "tile_new_bg_floor",
        "22,14": "tile_new_bg_floor",
        "24,14": "tile_new_bg_floor",
        "26,14": "tile_new_bg_floor",
        "27,14": "tile_new_bg_floor",
        "21,14": "tile_new_bg_floor",
        "23,14": "tile_new_bg_floor",
        "28,14": "tile_new_bg_floor",
        "29,14": "tile_new_bg_floor",
        "30,14": "tile_new_bg_floor",
        "31,14": "tile_new_bg_floor",
        "32,14": "tile_new_bg_floor",
        "33,14": "tile_new_bg_floor",
        "34,14": "tile_new_bg_floor",
        "35,14": "tile_new_bg_floor",
        "36,14": "tile_new_bg_floor",
        "37,14": "tile_new_bg_floor",
        "38,14": "tile_new_bg_floor",
        "39,14": "tile_new_bg_floor",
        "40,14": "tile_new_bg_floor",
        "41,14": "tile_new_bg_floor",
        "42,14": "tile_new_bg_floor",
        "43,14": "tile_new_bg_floor",
        "44,14": "tile_new_bg_floor",
        "48,14": "tile_new_bg_floor",
        "49,14": "tile_new_bg_floor",
        "50,14": "tile_new_bg_floor",
        "51,14": "tile_new_bg_floor",
        "52,14": "tile_new_bg_floor",
        "53,14": "tile_new_bg_floor",
        "54,14": "tile_new_bg_floor",
        "46,14": "tile_new_bg_floor",
        "25,14": "tile_new_bg_floor",
        "45,14": "tile_new_bg_floor",
        "47,14": "tile_new_bg_floor",
        "14,14": "tile_new_bg_floor",
        "13,14": "tile_new_bg_floor",
        "12,14": "tile_new_bg_floor",
        "11,14": "tile_new_bg_floor",
        "10,14": "tile_new_bg_floor",
        "8,14": "tile_new_bg_floor",
        "9,14": "tile_new_bg_floor",
        "14,13": "tile_new_bg_floor",
        "13,13": "tile_new_bg_floor",
        "12,13": "tile_new_bg_floor",
        "11,13": "tile_new_bg_floor",
        "10,13": "tile_new_bg_floor",
        "9,13": "tile_new_bg_floor",
        "8,13": "tile_new_bg_floor",
        "8,12": "tile_new_bg_floor",
        "9,12": "tile_new_bg_floor",
        "10,12": "tile_new_bg_floor",
        "11,12": "tile_new_bg_floor",
        "12,12": "tile_new_bg_floor",
        "13,12": "tile_new_bg_floor",
        "14,12": "tile_new_bg_floor",
        "14,11": "tile_new_bg_floor",
        "13,11": "tile_new_bg_floor",
        "12,11": "tile_new_bg_floor",
        "11,11": "tile_new_bg_floor",
        "10,11": "tile_new_bg_floor",
        "9,11": "tile_new_bg_floor",
        "8,11": "tile_new_bg_floor",
        "14,10": "tile_new_bg_floor",
        "13,10": "tile_new_bg_floor",
        "12,10": "tile_new_bg_floor",
        "11,10": "tile_new_bg_floor",
        "10,10": "tile_new_bg_floor",
        "9,10": "tile_new_bg_floor",
        "8,10": "tile_new_bg_floor",
        "7,11": "tile_new_bg_floor",
        "6,11": "tile_new_bg_floor",
        "5,11": "tile_new_bg_floor",
        "4,11": "tile_new_bg_floor",
        "3,11": "tile_new_bg_floor",
        "2,11": "tile_new_bg_floor",
        "1,11": "tile_new_bg_floor",
        "0,11": "tile_new_bg_floor",
        "7,12": "tile_new_bg_floor",
        "6,12": "tile_new_bg_floor",
        "5,12": "tile_new_bg_floor",
        "4,12": "tile_new_bg_floor",
        "3,12": "tile_new_bg_floor",
        "2,12": "tile_new_bg_floor",
        "0,12": "tile_new_bg_floor",
        "7,13": "tile_new_bg_floor",
        "6,13": "tile_new_bg_floor",
        "5,13": "tile_new_bg_floor",
        "4,13": "tile_new_bg_floor",
        "3,13": "tile_new_bg_floor",
        "2,13": "tile_new_bg_floor",
        "1,13": "tile_new_bg_floor",
        "0,13": "tile_new_bg_floor",
        "7,14": "tile_new_bg_floor",
        "6,14": "tile_new_bg_floor",
        "5,14": "tile_new_bg_floor",
        "4,14": "tile_new_bg_floor",
        "3,14": "tile_new_bg_floor",
        "2,14": "tile_new_bg_floor",
        "1,14": "tile_new_bg_floor",
        "0,14": "tile_new_bg_floor",
        "1,12": "tile_new_bg_floor",
        "7,10": "tile_new_bg_floor",
        "6,10": "tile_new_bg_floor",
        "5,10": "tile_new_bg_floor",
        "4,10": "tile_new_bg_floor",
        "3,10": "tile_new_bg_floor",
        "2,10": "tile_new_bg_floor",
        "1,10": "tile_new_bg_floor",
        "0,10": "tile_new_bg_floor",
        "5,9": "tile_new_bg_floor",
        "6,9": "tile_new_bg_floor",
        "7,9": "tile_new_bg_floor",
        "5,8": "tile_new_bg_floor",
        "6,8": "tile_new_bg_floor",
        "7,8": "tile_new_bg_floor",
        "8,8": "tile_new_bg_floor",
        "7,7": "tile_new_bg_floor",
        "6,7": "tile_new_bg_floor",
        "5,7": "tile_new_bg_floor",
        "4,7": "tile_new_bg_floor",
        "8,7": "tile_new_bg_floor",
        "55,14": "tile_new_bg_floor",
        "56,14": "tile_new_bg_floor",
        "57,14": "tile_new_bg_floor",
        "58,14": "tile_new_bg_floor",
        "59,14": "tile_new_bg_floor",
        "60,14": "tile_new_bg_floor",
        "61,14": "tile_new_bg_floor",
        "62,14": "tile_new_bg_floor",
        "63,14": "tile_new_bg_floor",
        "55,13": "tile_new_bg_floor",
        "56,13": "tile_new_bg_floor",
        "57,13": "tile_new_bg_floor",
        "58,13": "tile_new_bg_floor",
        "59,13": "tile_new_bg_floor",
        "60,13": "tile_new_bg_floor",
        "61,13": "tile_new_bg_floor",
        "62,13": "tile_new_bg_floor",
        "63,13": "tile_new_bg_floor",
        "55,12": "tile_new_bg_floor",
        "57,12": "tile_new_bg_floor",
        "58,12": "tile_new_bg_floor",
        "59,12": "tile_new_bg_floor",
        "60,12": "tile_new_bg_floor",
        "61,12": "tile_new_bg_floor",
        "62,12": "tile_new_bg_floor",
        "63,12": "tile_new_bg_floor",
        "56,12": "tile_new_bg_floor",
        "57,11": "tile_new_bg_floor",
        "58,11": "tile_new_bg_floor",
        "59,11": "tile_new_bg_floor",
        "60,11": "tile_new_bg_floor",
        "61,11": "tile_new_bg_floor",
        "62,11": "tile_new_bg_floor",
        "63,11": "tile_new_bg_floor",
        "55,11": "tile_new_bg_floor",
        "56,11": "tile_new_bg_floor",
        "56,10": "tile_new_bg_floor",
        "57,10": "tile_new_bg_floor",
        "57,9": "tile_new_bg_floor",
        "58,9": "tile_new_bg_floor",
        "59,9": "tile_new_bg_floor",
        "59,10": "tile_new_bg_floor",
        "58,10": "tile_new_bg_floor",
        "55,10": "tile_new_bg_floor",
        "60,10": "tile_new_bg_floor",
        "61,10": "tile_new_bg_floor",
        "62,10": "tile_new_bg_floor",
        "63,10": "tile_new_bg_floor",
        "63,9": "tile_new_bg_floor",
        "56,9": "tile_new_bg_floor",
        "56,8": "tile_new_bg_floor",
        "56,7": "tile_new_bg_floor",
        "57,7": "tile_new_bg_floor",
        "58,7": "tile_new_bg_floor",
        "58,8": "tile_new_bg_floor",
        "55,9": "tile_new_bg_floor",
        "55,7": "tile_new_bg_floor",
        "55,8": "tile_new_bg_floor",
        "57,8": "tile_new_bg_floor",
        "59,8": "tile_new_bg_floor",
        "59,7": "tile_new_bg_floor",
        "60,8": "tile_new_bg_floor"
      },
      "ground": {},
      "ground2": {},
      "ground3": {
        "0,9": "tile_new_bg_wall_front_edge",
        "0,10": "tile_new_bg_wall_front_edge",
        "0,11": "tile_new_bg_wall_front_edge",
        "0,12": "tile_new_bg_wall_front_edge",
        "0,13": "tile_new_bg_wall_front_edge",
        "0,14": "tile_new_bg_wall_front_edge",
        "0,8": "tile_new_bg_wall_front_edge"
      },
      "object": {
        "8,8": "tile_new_decor_exit_sign",
        "1,14": "tile_new_decor_box_large"
      },
      "overlay": {},
      "top": {},
      "object2": {
        "63,8": "tile_new_bg_wall_front_edge",
        "63,9": "tile_new_bg_wall_front_edge",
        "63,10": "tile_new_bg_wall_front_edge",
        "63,11": "tile_new_bg_wall_front_edge",
        "63,12": "tile_new_bg_wall_front_edge",
        "63,13": "tile_new_bg_wall_front_edge",
        "63,14": "tile_new_bg_wall_front_edge",
        "62,14": "tile_new_decor_fire_extinguisher"
      },
      "object3": {},
      "object4": {}
    },
    "stamps": [
      {
        "id": "tile_new_bg_wall",
        "c": 40,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 41,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 42,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 43,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 44,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 45,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 47,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 46,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 48,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 23,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 21,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 19,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 17,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 18,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 20,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 22,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 24,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 38,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 39,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 25,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "color_mu8nxukw",
        "c": 48,
        "r": 3,
        "layer": "floor"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 49,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 50,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 51,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 52,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 53,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 54,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_mu5e3ndv",
        "c": 45,
        "r": 7,
        "layer": "ground2"
      },
      {
        "id": "tile_eoc_door",
        "c": 42,
        "r": 9,
        "layer": "object4",
        "ox": -20,
        "oy": -4
      },
      {
        "id": "tile_eoc_door",
        "c": 51,
        "r": 9,
        "layer": "object4",
        "ox": -18,
        "oy": -4
      },
      {
        "id": "tile_eoc_hydrant_white",
        "c": 18,
        "r": 8,
        "layer": "ground2",
        "ox": -8,
        "oy": 24
      },
      {
        "id": "tile_eoc_distance_poster",
        "c": 47,
        "r": 8,
        "layer": "ground2"
      },
      {
        "id": "tile_new_decor_exit_sign",
        "c": 55,
        "r": 8,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_new_bg_wall",
        "c": 16,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 15,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 26,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 14,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 8,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 9,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 11,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 12,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 13,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 10,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_mu5e3ndv",
        "c": 9,
        "r": 7,
        "layer": "ground2"
      },
      {
        "id": "tile_mu5e3ndv",
        "c": 16,
        "r": 7,
        "layer": "ground2"
      },
      {
        "id": "tile_eoc_door",
        "c": 20,
        "r": 9,
        "layer": "ground3",
        "ox": 0,
        "oy": -4
      },
      {
        "id": "tile_new_bg_wall",
        "c": 4,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 3,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 2,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 1,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 0,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_mu5e3ndv",
        "c": 0,
        "r": 7,
        "layer": "ground2"
      },
      {
        "id": "tile_eoc_double_door_open",
        "c": 5,
        "r": 7,
        "layer": "ground3"
      },
      {
        "id": "tile_eoc_escape_stairs",
        "c": 4,
        "r": 5,
        "layer": "floor",
        "ox": 0,
        "oy": -24,
        "sortDepth": 0.5
      },
      {
        "id": "tile_new_bg_wall",
        "c": 61,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 62,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 63,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 60,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_mu5e3ndv",
        "c": 54,
        "r": 7,
        "layer": "object"
      },
      {
        "id": "tile_mu5e3ndv",
        "c": 63,
        "r": 7,
        "layer": "object"
      },
      {
        "id": "tile_eoc_double_door_open",
        "c": 56,
        "r": 7,
        "layer": "object2"
      },
      {
        "id": "tile_eoc_escape_stairs",
        "c": 55,
        "r": 4,
        "layer": "ground",
        "sortDepth": 0.5
      },
      {
        "id": "tile_new_bg_wall",
        "c": 55,
        "r": 7,
        "layer": "ground2"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 59,
        "r": 7,
        "layer": "ground2"
      },
      {
        "id": "tile_eoc_door",
        "c": 13,
        "r": 9,
        "layer": "object",
        "ox": -20,
        "oy": 0
      },
      {
        "id": "tile_new_decor_poster",
        "c": 11,
        "r": 8,
        "layer": "object"
      },
      {
        "id": "tile_eoc_locker",
        "c": 15,
        "r": 9,
        "layer": "object",
        "ox": 4,
        "oy": -28
      },
      {
        "id": "tile_eoc_locker",
        "c": 22,
        "r": 9,
        "layer": "object",
        "ox": 4,
        "oy": -28
      },
      {
        "id": "tile_eoc_locker",
        "c": 26,
        "r": 9,
        "layer": "object",
        "ox": 124,
        "oy": -28
      },
      {
        "id": "tile_mu4yyr9r",
        "c": 1,
        "r": 12,
        "layer": "object",
        "ox": -10,
        "oy": 0
      },
      {
        "id": "tile_new_decor_box_medium",
        "c": 2,
        "r": 14,
        "layer": "object",
        "ox": -4,
        "oy": 4
      },
      {
        "id": "tile_new_decor_cabinet_tall_metal",
        "c": 10,
        "r": 10,
        "layer": "object2",
        "ox": 0,
        "oy": -22
      },
      {
        "id": "tile_mufxoi3i",
        "c": 60,
        "r": 8,
        "layer": "object",
        "ox": 0,
        "oy": -4
      },
      {
        "id": "tile_mufxpxnl",
        "c": 61,
        "r": 8,
        "layer": "object",
        "ox": -4,
        "oy": -6
      },
      {
        "id": "tile_new_bg_wall",
        "c": 28,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 29,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 30,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 31,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 32,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 33,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 34,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 35,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 36,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_eoc_door",
        "c": 34,
        "r": 9,
        "layer": "object"
      },
      {
        "id": "tile_mu5e3ndv",
        "c": 23,
        "r": 7,
        "layer": "ground2"
      },
      {
        "id": "tile_mu5e3ndv",
        "c": 30,
        "r": 7,
        "layer": "ground2"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 27,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_mu5e3ndv",
        "c": 37,
        "r": 7,
        "layer": "ground"
      },
      {
        "id": "tile_eoc_security_camera",
        "c": 1,
        "r": 8,
        "layer": "object",
        "fx": true,
        "ox": 0,
        "oy": -8
      },
      {
        "id": "tile_eoc_security_camera",
        "c": 10,
        "r": 8,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_eoc_security_camera",
        "c": 53,
        "r": 8,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_eoc_security_camera",
        "c": 29,
        "r": 8,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_eoc_security_camera",
        "c": 38,
        "r": 8,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_eoc_door",
        "c": 27,
        "r": 9,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_muu4ow6f",
        "c": 3,
        "r": 9,
        "layer": "object2",
        "ox": -20,
        "oy": -20,
        "sortDepth": 2.5
      },
      {
        "id": "tile_muu6050n",
        "c": 1,
        "r": 9,
        "layer": "object2",
        "ox": -6,
        "oy": -20,
        "sortDepth": 2.5
      },
      {
        "id": "tile_eoc_locker",
        "c": 44,
        "r": 8,
        "layer": "object2",
        "ox": 0,
        "oy": 12
      },
      {
        "id": "tile_eoc_locker",
        "c": 36,
        "r": 8,
        "layer": "object2",
        "ox": 0,
        "oy": 12
      },
      {
        "id": "tile_eoc_locker",
        "c": 53,
        "r": 8,
        "layer": "object2",
        "ox": 0,
        "oy": 12
      },
      {
        "id": "tile_new_decor_fire_extinguisher",
        "c": 24,
        "r": 10,
        "layer": "object2",
        "ox": 0,
        "oy": 8
      },
      {
        "id": "tile_new_decor_plant02",
        "c": 60,
        "r": 13,
        "layer": "object2",
        "ox": 14,
        "oy": 8
      }
    ],
    "solid": [
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
      "48,10",
      "37,10",
      "49,10",
      "50,10",
      "51,10",
      "52,10",
      "53,10",
      "54,10",
      "16,10",
      "15,10",
      "27,10",
      "14,10",
      "13,10",
      "12,10",
      "11,10",
      "10,10",
      "9,10",
      "8,10",
      "4,10",
      "3,10",
      "1,10",
      "2,10",
      "0,10",
      "0,11",
      "0,12",
      "0,13",
      "0,14",
      "4,7",
      "4,8",
      "4,9",
      "4,6",
      "4,5",
      "4,4",
      "5,4",
      "6,4",
      "7,4",
      "8,4",
      "8,5",
      "8,6",
      "8,7",
      "8,8",
      "8,9",
      "55,10",
      "55,9",
      "55,7",
      "55,8",
      "55,4",
      "55,5",
      "55,6",
      "56,4",
      "56,5",
      "57,4",
      "58,4",
      "59,4",
      "59,5",
      "59,6",
      "59,7",
      "59,9",
      "59,8",
      "59,10",
      "63,11",
      "63,12",
      "63,10",
      "63,13",
      "63,14",
      "56,6",
      "57,5",
      "57,6",
      "5,5",
      "5,6",
      "6,6",
      "6,5",
      "28,10",
      "29,10",
      "30,10",
      "31,10",
      "32,10",
      "33,10",
      "34,10",
      "35,10",
      "36,10",
      "1,13",
      "1,14",
      "2,14"
    ],
    "breakable": [],
    "camp": [
      "42,12",
      "42,13",
      "43,12",
      "43,13",
      "44,12",
      "44,13",
      "45,12",
      "45,13",
      "46,12",
      "46,13",
      "47,12",
      "47,13",
      "48,12",
      "48,13",
      "49,12",
      "49,13",
      "50,12",
      "50,13",
      "51,12",
      "51,13",
      "52,12",
      "52,13",
      "53,12",
      "53,13",
      "54,12",
      "54,13"
    ],
    "rules": {
      "money": 150,
      "guide": 100,
      "guideRegen": 9,
      "speed": 44,
      "reward": 8
    },
    "cols": 64,
    "rows": 15,
    "safe": true,
    "npcs": true,
    "portals": [
      {
        "c": 7,
        "r": 5,
        "to": "map_mu5ad7t2"
      },
      {
        "c": 5,
        "r": 7,
        "to": "map_mu5ad7t2"
      },
      {
        "c": 56,
        "r": 7,
        "to": "map_mu5ad7t2"
      },
      {
        "c": 57,
        "r": 7,
        "to": "map_mu5ad7t2"
      },
      {
        "c": 51,
        "r": 10,
        "to": "map_mufu03od"
      },
      {
        "c": 13,
        "r": 10,
        "to": "map_mve6y3s2"
      }
    ],
    "solidOffsets": {
      "6,5": [
        -9,
        0
      ],
      "6,6": [
        -9,
        0
      ],
      "57,5": [
        -11,
        0
      ],
      "57,6": [
        -11,
        0
      ]
    },
    "coreSpots": [],
    "coreCount": 1,
    "spawnZone": []
  },
  {
    "id": "map_musbsgj3",
    "name": "1F-餐廳",
    "desc": "",
    "layers": {
      "floor": {
        "19,19": "tile_new_bg_floor",
        "20,19": "tile_new_bg_floor",
        "21,19": "tile_new_bg_floor",
        "22,19": "tile_new_bg_floor",
        "23,19": "tile_new_bg_floor",
        "23,20": "tile_new_bg_floor",
        "21,20": "tile_new_bg_floor",
        "20,21": "tile_new_bg_floor",
        "18,21": "tile_new_bg_floor",
        "17,21": "tile_new_bg_floor",
        "18,20": "tile_new_bg_floor",
        "20,20": "tile_new_bg_floor",
        "22,20": "tile_new_bg_floor",
        "24,20": "tile_new_bg_floor",
        "26,20": "tile_new_bg_floor",
        "26,21": "tile_new_bg_floor",
        "25,21": "tile_new_bg_floor",
        "24,21": "tile_new_bg_floor",
        "23,22": "tile_new_bg_floor",
        "22,22": "tile_new_bg_floor",
        "21,22": "tile_new_bg_floor",
        "16,15": "tile_new_bg_floor",
        "17,15": "tile_new_bg_floor",
        "19,15": "tile_new_bg_floor",
        "22,15": "tile_new_bg_floor",
        "24,15": "tile_new_bg_floor",
        "25,15": "tile_new_bg_floor",
        "25,16": "tile_new_bg_floor",
        "24,17": "tile_new_bg_floor",
        "22,18": "tile_new_bg_floor",
        "21,18": "tile_new_bg_floor",
        "18,19": "tile_new_bg_floor",
        "17,19": "tile_new_bg_floor",
        "17,18": "tile_new_bg_floor",
        "18,18": "tile_new_bg_floor",
        "19,17": "tile_new_bg_floor",
        "22,16": "tile_new_bg_floor",
        "24,16": "tile_new_bg_floor",
        "25,17": "tile_new_bg_floor",
        "23,17": "tile_new_bg_floor",
        "20,18": "tile_new_bg_floor",
        "14,18": "tile_new_bg_floor",
        "13,18": "tile_new_bg_floor",
        "13,17": "tile_new_bg_floor",
        "14,16": "tile_new_bg_floor",
        "15,16": "tile_new_bg_floor",
        "25,14": "tile_new_bg_floor",
        "26,14": "tile_new_bg_floor",
        "26,15": "tile_new_bg_floor",
        "19,16": "tile_new_bg_floor",
        "17,16": "tile_new_bg_floor",
        "16,16": "tile_new_bg_floor",
        "19,14": "tile_new_bg_floor",
        "22,13": "tile_new_bg_floor",
        "26,13": "tile_new_bg_floor",
        "26,17": "tile_new_bg_floor",
        "21,17": "tile_new_bg_floor",
        "18,17": "tile_new_bg_floor",
        "18,16": "tile_new_bg_floor",
        "21,14": "tile_new_bg_floor",
        "24,13": "tile_new_bg_floor",
        "25,18": "tile_new_bg_floor",
        "19,18": "tile_new_bg_floor",
        "15,17": "tile_new_bg_floor",
        "17,14": "tile_new_bg_floor",
        "20,13": "tile_new_bg_floor",
        "23,13": "tile_new_bg_floor",
        "25,13": "tile_new_bg_floor",
        "14,17": "tile_new_bg_floor",
        "23,15": "tile_new_bg_floor",
        "22,17": "tile_new_bg_floor",
        "15,19": "tile_new_bg_floor",
        "13,19": "tile_new_bg_floor",
        "12,18": "tile_new_bg_floor",
        "12,17": "tile_new_bg_floor",
        "12,16": "tile_new_bg_floor",
        "13,15": "tile_new_bg_floor",
        "15,14": "tile_new_bg_floor",
        "17,13": "tile_new_bg_floor",
        "19,13": "tile_new_bg_floor",
        "21,15": "tile_new_bg_floor",
        "23,18": "tile_new_bg_floor",
        "20,16": "tile_new_bg_floor",
        "20,17": "tile_new_bg_floor",
        "19,21": "tile_new_bg_floor",
        "16,21": "tile_new_bg_floor",
        "15,20": "tile_new_bg_floor",
        "11,15": "tile_new_bg_floor",
        "11,14": "tile_new_bg_floor",
        "12,13": "tile_new_bg_floor",
        "13,13": "tile_new_bg_floor",
        "16,12": "tile_new_bg_floor",
        "18,12": "tile_new_bg_floor",
        "9,14": "tile_new_bg_floor",
        "10,14": "tile_new_bg_floor",
        "11,13": "tile_new_bg_floor",
        "14,12": "tile_new_bg_floor",
        "17,12": "tile_new_bg_floor",
        "21,12": "tile_new_bg_floor",
        "26,12": "tile_new_bg_floor",
        "3,8": "tile_new_bg_floor",
        "3,9": "tile_new_bg_floor",
        "3,10": "tile_new_bg_floor",
        "3,11": "tile_new_bg_floor",
        "3,12": "tile_new_bg_floor",
        "3,13": "tile_new_bg_floor",
        "3,14": "tile_new_bg_floor",
        "3,15": "tile_new_bg_floor",
        "3,16": "tile_new_bg_floor",
        "3,17": "tile_new_bg_floor",
        "3,18": "tile_new_bg_floor",
        "3,19": "tile_new_bg_floor",
        "3,20": "tile_new_bg_floor",
        "3,21": "tile_new_bg_floor",
        "3,22": "tile_new_bg_floor",
        "3,23": "tile_new_bg_floor",
        "4,8": "tile_new_bg_floor",
        "4,9": "tile_new_bg_floor",
        "4,10": "tile_new_bg_floor",
        "4,11": "tile_new_bg_floor",
        "4,12": "tile_new_bg_floor",
        "4,13": "tile_new_bg_floor",
        "4,14": "tile_new_bg_floor",
        "4,15": "tile_new_bg_floor",
        "4,16": "tile_new_bg_floor",
        "4,17": "tile_new_bg_floor",
        "4,18": "tile_new_bg_floor",
        "4,19": "tile_new_bg_floor",
        "4,20": "tile_new_bg_floor",
        "4,21": "tile_new_bg_floor",
        "4,22": "tile_new_bg_floor",
        "4,23": "tile_new_bg_floor",
        "5,8": "tile_new_bg_floor",
        "5,9": "tile_new_bg_floor",
        "5,10": "tile_new_bg_floor",
        "5,11": "tile_new_bg_floor",
        "5,12": "tile_new_bg_floor",
        "5,13": "tile_new_bg_floor",
        "5,14": "tile_new_bg_floor",
        "5,15": "tile_new_bg_floor",
        "5,16": "tile_new_bg_floor",
        "5,17": "tile_new_bg_floor",
        "5,18": "tile_new_bg_floor",
        "5,19": "tile_new_bg_floor",
        "5,20": "tile_new_bg_floor",
        "5,21": "tile_new_bg_floor",
        "5,22": "tile_new_bg_floor",
        "5,23": "tile_new_bg_floor",
        "6,8": "tile_new_bg_floor",
        "6,9": "tile_new_bg_floor",
        "6,10": "tile_new_bg_floor",
        "6,11": "tile_new_bg_floor",
        "6,12": "tile_new_bg_floor",
        "6,13": "tile_new_bg_floor",
        "6,14": "tile_new_bg_floor",
        "6,15": "tile_new_bg_floor",
        "6,16": "tile_new_bg_floor",
        "6,17": "tile_new_bg_floor",
        "6,18": "tile_new_bg_floor",
        "6,19": "tile_new_bg_floor",
        "6,20": "tile_new_bg_floor",
        "6,21": "tile_new_bg_floor",
        "6,22": "tile_new_bg_floor",
        "6,23": "tile_new_bg_floor",
        "7,8": "tile_new_bg_floor",
        "7,9": "tile_new_bg_floor",
        "7,10": "tile_new_bg_floor",
        "7,11": "tile_new_bg_floor",
        "7,12": "tile_new_bg_floor",
        "7,13": "tile_new_bg_floor",
        "7,14": "tile_new_bg_floor",
        "7,15": "tile_new_bg_floor",
        "7,16": "tile_new_bg_floor",
        "7,17": "tile_new_bg_floor",
        "7,18": "tile_new_bg_floor",
        "7,19": "tile_new_bg_floor",
        "7,20": "tile_new_bg_floor",
        "7,21": "tile_new_bg_floor",
        "7,22": "tile_new_bg_floor",
        "7,23": "tile_new_bg_floor",
        "8,8": "tile_new_bg_floor",
        "8,9": "tile_new_bg_floor",
        "8,10": "tile_new_bg_floor",
        "8,11": "tile_new_bg_floor",
        "8,12": "tile_new_bg_floor",
        "8,13": "tile_new_bg_floor",
        "8,14": "tile_new_bg_floor",
        "8,15": "tile_new_bg_floor",
        "8,16": "tile_new_bg_floor",
        "8,17": "tile_new_bg_floor",
        "8,18": "tile_new_bg_floor",
        "8,19": "tile_new_bg_floor",
        "8,20": "tile_new_bg_floor",
        "8,21": "tile_new_bg_floor",
        "8,22": "tile_new_bg_floor",
        "8,23": "tile_new_bg_floor",
        "9,8": "tile_new_bg_floor",
        "9,9": "tile_new_bg_floor",
        "9,10": "tile_new_bg_floor",
        "9,11": "tile_new_bg_floor",
        "9,12": "tile_new_bg_floor",
        "9,13": "tile_new_bg_floor",
        "9,15": "tile_new_bg_floor",
        "9,16": "tile_new_bg_floor",
        "9,17": "tile_new_bg_floor",
        "9,18": "tile_new_bg_floor",
        "9,19": "tile_new_bg_floor",
        "9,20": "tile_new_bg_floor",
        "9,21": "tile_new_bg_floor",
        "9,22": "tile_new_bg_floor",
        "9,23": "tile_new_bg_floor",
        "10,8": "tile_new_bg_floor",
        "10,9": "tile_new_bg_floor",
        "10,10": "tile_new_bg_floor",
        "10,11": "tile_new_bg_floor",
        "10,12": "tile_new_bg_floor",
        "10,13": "tile_new_bg_floor",
        "10,15": "tile_new_bg_floor",
        "10,16": "tile_new_bg_floor",
        "10,17": "tile_new_bg_floor",
        "10,18": "tile_new_bg_floor",
        "10,19": "tile_new_bg_floor",
        "10,20": "tile_new_bg_floor",
        "10,21": "tile_new_bg_floor",
        "10,22": "tile_new_bg_floor",
        "10,23": "tile_new_bg_floor",
        "11,8": "tile_new_bg_floor",
        "11,9": "tile_new_bg_floor",
        "11,10": "tile_new_bg_floor",
        "11,11": "tile_new_bg_floor",
        "11,12": "tile_new_bg_floor",
        "11,16": "tile_new_bg_floor",
        "11,17": "tile_new_bg_floor",
        "11,18": "tile_new_bg_floor",
        "11,19": "tile_new_bg_floor",
        "11,20": "tile_new_bg_floor",
        "11,21": "tile_new_bg_floor",
        "11,22": "tile_new_bg_floor",
        "11,23": "tile_new_bg_floor",
        "12,8": "tile_new_bg_floor",
        "12,9": "tile_new_bg_floor",
        "12,10": "tile_new_bg_floor",
        "12,11": "tile_new_bg_floor",
        "12,12": "tile_new_bg_floor",
        "12,14": "tile_new_bg_floor",
        "12,15": "tile_new_bg_floor",
        "12,19": "tile_new_bg_floor",
        "12,20": "tile_new_bg_floor",
        "12,21": "tile_new_bg_floor",
        "12,22": "tile_new_bg_floor",
        "12,23": "tile_new_bg_floor",
        "13,8": "tile_new_bg_floor",
        "13,9": "tile_new_bg_floor",
        "13,10": "tile_new_bg_floor",
        "13,11": "tile_new_bg_floor",
        "13,12": "tile_new_bg_floor",
        "13,14": "tile_new_bg_floor",
        "13,16": "tile_new_bg_floor",
        "13,20": "tile_new_bg_floor",
        "13,21": "tile_new_bg_floor",
        "13,22": "tile_new_bg_floor",
        "13,23": "tile_new_bg_floor",
        "14,8": "tile_new_bg_floor",
        "14,9": "tile_new_bg_floor",
        "14,10": "tile_new_bg_floor",
        "14,11": "tile_new_bg_floor",
        "14,13": "tile_new_bg_floor",
        "14,14": "tile_new_bg_floor",
        "14,15": "tile_new_bg_floor",
        "14,19": "tile_new_bg_floor",
        "14,20": "tile_new_bg_floor",
        "14,21": "tile_new_bg_floor",
        "14,22": "tile_new_bg_floor",
        "14,23": "tile_new_bg_floor",
        "15,8": "tile_new_bg_floor",
        "15,9": "tile_new_bg_floor",
        "15,10": "tile_new_bg_floor",
        "15,11": "tile_new_bg_floor",
        "15,12": "tile_new_bg_floor",
        "15,13": "tile_new_bg_floor",
        "15,15": "tile_new_bg_floor",
        "15,18": "tile_new_bg_floor",
        "15,21": "tile_new_bg_floor",
        "15,22": "tile_new_bg_floor",
        "15,23": "tile_new_bg_floor",
        "16,8": "tile_new_bg_floor",
        "16,9": "tile_new_bg_floor",
        "16,10": "tile_new_bg_floor",
        "16,11": "tile_new_bg_floor",
        "16,13": "tile_new_bg_floor",
        "16,14": "tile_new_bg_floor",
        "16,17": "tile_new_bg_floor",
        "16,18": "tile_new_bg_floor",
        "16,19": "tile_new_bg_floor",
        "16,20": "tile_new_bg_floor",
        "16,22": "tile_new_bg_floor",
        "16,23": "tile_new_bg_floor",
        "17,8": "tile_new_bg_floor",
        "17,9": "tile_new_bg_floor",
        "17,10": "tile_new_bg_floor",
        "17,11": "tile_new_bg_floor",
        "17,17": "tile_new_bg_floor",
        "17,20": "tile_new_bg_floor",
        "17,22": "tile_new_bg_floor",
        "17,23": "tile_new_bg_floor",
        "18,8": "tile_new_bg_floor",
        "18,9": "tile_new_bg_floor",
        "18,10": "tile_new_bg_floor",
        "18,11": "tile_new_bg_floor",
        "18,13": "tile_new_bg_floor",
        "18,14": "tile_new_bg_floor",
        "18,15": "tile_new_bg_floor",
        "18,22": "tile_new_bg_floor",
        "18,23": "tile_new_bg_floor",
        "19,8": "tile_new_bg_floor",
        "19,9": "tile_new_bg_floor",
        "19,10": "tile_new_bg_floor",
        "19,11": "tile_new_bg_floor",
        "19,12": "tile_new_bg_floor",
        "19,20": "tile_new_bg_floor",
        "19,22": "tile_new_bg_floor",
        "19,23": "tile_new_bg_floor",
        "20,8": "tile_new_bg_floor",
        "20,9": "tile_new_bg_floor",
        "20,10": "tile_new_bg_floor",
        "20,11": "tile_new_bg_floor",
        "20,12": "tile_new_bg_floor",
        "20,14": "tile_new_bg_floor",
        "20,15": "tile_new_bg_floor",
        "20,22": "tile_new_bg_floor",
        "20,23": "tile_new_bg_floor",
        "21,8": "tile_new_bg_floor",
        "21,9": "tile_new_bg_floor",
        "21,10": "tile_new_bg_floor",
        "21,11": "tile_new_bg_floor",
        "21,13": "tile_new_bg_floor",
        "21,16": "tile_new_bg_floor",
        "21,21": "tile_new_bg_floor",
        "21,23": "tile_new_bg_floor",
        "22,8": "tile_new_bg_floor",
        "22,9": "tile_new_bg_floor",
        "22,10": "tile_new_bg_floor",
        "22,11": "tile_new_bg_floor",
        "22,12": "tile_new_bg_floor",
        "22,14": "tile_new_bg_floor",
        "22,21": "tile_new_bg_floor",
        "22,23": "tile_new_bg_floor",
        "23,8": "tile_new_bg_floor",
        "23,9": "tile_new_bg_floor",
        "23,10": "tile_new_bg_floor",
        "23,11": "tile_new_bg_floor",
        "23,12": "tile_new_bg_floor",
        "23,14": "tile_new_bg_floor",
        "23,16": "tile_new_bg_floor",
        "23,21": "tile_new_bg_floor",
        "23,23": "tile_new_bg_floor",
        "24,8": "tile_new_bg_floor",
        "24,9": "tile_new_bg_floor",
        "24,10": "tile_new_bg_floor",
        "24,11": "tile_new_bg_floor",
        "24,12": "tile_new_bg_floor",
        "24,14": "tile_new_bg_floor",
        "24,18": "tile_new_bg_floor",
        "24,19": "tile_new_bg_floor",
        "24,22": "tile_new_bg_floor",
        "24,23": "tile_new_bg_floor",
        "25,8": "tile_new_bg_floor",
        "25,9": "tile_new_bg_floor",
        "25,10": "tile_new_bg_floor",
        "25,11": "tile_new_bg_floor",
        "25,12": "tile_new_bg_floor",
        "25,19": "tile_new_bg_floor",
        "25,20": "tile_new_bg_floor",
        "25,22": "tile_new_bg_floor",
        "25,23": "tile_new_bg_floor",
        "26,8": "tile_new_bg_floor",
        "26,9": "tile_new_bg_floor",
        "26,10": "tile_new_bg_floor",
        "26,11": "tile_new_bg_floor",
        "26,16": "tile_new_bg_floor",
        "26,18": "tile_new_bg_floor",
        "26,19": "tile_new_bg_floor",
        "26,22": "tile_new_bg_floor",
        "26,23": "tile_new_bg_floor",
        "16,7": "tile_new_bg_floor",
        "17,7": "tile_new_bg_floor",
        "18,7": "tile_new_bg_floor",
        "20,7": "tile_new_bg_floor",
        "21,7": "tile_new_bg_floor",
        "22,7": "tile_new_bg_floor",
        "23,7": "tile_new_bg_floor",
        "24,7": "tile_new_bg_floor",
        "25,7": "tile_new_bg_floor",
        "26,7": "tile_new_bg_floor",
        "19,7": "tile_new_bg_floor",
        "15,7": "tile_new_bg_floor",
        "14,7": "tile_new_bg_floor",
        "13,7": "tile_new_bg_floor",
        "12,7": "tile_new_bg_floor",
        "11,7": "tile_new_bg_floor",
        "10,7": "tile_new_bg_floor",
        "9,7": "tile_new_bg_floor",
        "8,7": "tile_new_bg_floor",
        "7,7": "tile_new_bg_floor",
        "6,7": "tile_new_bg_floor",
        "5,7": "tile_new_bg_floor",
        "4,7": "tile_new_bg_floor",
        "3,7": "tile_new_bg_floor",
        "3,6": "tile_new_bg_floor",
        "3,5": "tile_new_bg_floor",
        "4,5": "tile_new_bg_floor",
        "5,5": "tile_new_bg_floor",
        "6,5": "tile_new_bg_floor",
        "7,5": "tile_new_bg_floor",
        "8,5": "tile_new_bg_floor",
        "9,5": "tile_new_bg_floor",
        "10,5": "tile_new_bg_floor",
        "11,5": "tile_new_bg_floor",
        "12,5": "tile_new_bg_floor",
        "13,5": "tile_new_bg_floor",
        "14,5": "tile_new_bg_floor",
        "15,5": "tile_new_bg_floor",
        "16,5": "tile_new_bg_floor",
        "17,5": "tile_new_bg_floor",
        "18,5": "tile_new_bg_floor",
        "19,5": "tile_new_bg_floor",
        "20,5": "tile_new_bg_floor",
        "21,5": "tile_new_bg_floor",
        "22,5": "tile_new_bg_floor",
        "23,5": "tile_new_bg_floor",
        "24,5": "tile_new_bg_floor",
        "25,5": "tile_new_bg_floor",
        "26,5": "tile_new_bg_floor",
        "26,6": "tile_new_bg_floor",
        "25,6": "tile_new_bg_floor",
        "24,6": "tile_new_bg_floor",
        "23,6": "tile_new_bg_floor",
        "22,6": "tile_new_bg_floor",
        "21,6": "tile_new_bg_floor",
        "20,6": "tile_new_bg_floor",
        "19,6": "tile_new_bg_floor",
        "18,6": "tile_new_bg_floor",
        "17,6": "tile_new_bg_floor",
        "16,6": "tile_new_bg_floor",
        "15,6": "tile_new_bg_floor",
        "13,6": "tile_new_bg_floor",
        "12,6": "tile_new_bg_floor",
        "11,6": "tile_new_bg_floor",
        "10,6": "tile_new_bg_floor",
        "9,6": "tile_new_bg_floor",
        "8,6": "tile_new_bg_floor",
        "7,6": "tile_new_bg_floor",
        "6,6": "tile_new_bg_floor",
        "5,6": "tile_new_bg_floor",
        "4,6": "tile_new_bg_floor",
        "14,6": "tile_new_bg_floor",
        "18,4": "tile_new_bg_floor",
        "19,4": "tile_new_bg_floor",
        "20,4": "tile_new_bg_floor",
        "1,8": "tile_new_bg_floor",
        "2,8": "tile_new_bg_floor",
        "1,9": "tile_new_bg_floor",
        "2,9": "tile_new_bg_floor",
        "1,10": "tile_new_bg_floor",
        "2,10": "tile_new_bg_floor",
        "6,4": "tile_new_bg_floor",
        "7,4": "tile_new_bg_floor",
        "8,4": "tile_new_bg_floor",
        "9,4": "tile_new_bg_floor",
        "10,4": "tile_new_bg_floor",
        "11,4": "tile_new_bg_floor",
        "12,4": "tile_new_bg_floor",
        "13,4": "tile_new_bg_floor",
        "5,4": "tile_new_bg_floor",
        "5,3": "tile_new_bg_floor",
        "6,3": "tile_new_bg_floor",
        "7,3": "tile_new_bg_floor",
        "8,3": "tile_new_bg_floor",
        "9,3": "tile_new_bg_floor",
        "10,3": "tile_new_bg_floor",
        "11,3": "tile_new_bg_floor",
        "12,3": "tile_new_bg_floor",
        "13,3": "tile_new_bg_floor",
        "13,2": "tile_new_bg_floor",
        "12,2": "tile_new_bg_floor",
        "11,2": "tile_new_bg_floor",
        "10,2": "tile_new_bg_floor",
        "9,2": "tile_new_bg_floor",
        "8,2": "tile_new_bg_floor",
        "7,2": "tile_new_bg_floor",
        "6,2": "tile_new_bg_floor",
        "5,2": "tile_new_bg_floor",
        "5,1": "tile_new_bg_floor",
        "6,1": "tile_new_bg_floor",
        "12,1": "tile_new_bg_floor",
        "13,1": "tile_new_bg_floor",
        "11,1": "tile_new_bg_floor",
        "10,1": "tile_new_bg_floor",
        "9,1": "tile_new_bg_floor",
        "8,1": "tile_new_bg_floor",
        "7,1": "tile_new_bg_floor",
        "0,8": "tile_new_bg_floor",
        "0,9": "tile_new_bg_floor",
        "0,10": "tile_new_bg_floor",
        "0,11": "tile_new_bg_floor",
        "1,11": "tile_new_bg_floor",
        "2,11": "tile_new_bg_floor",
        "1,7": "tile_new_bg_floor",
        "2,7": "tile_new_bg_floor"
      },
      "ground": {
        "26,9": "tile_new_bg_wall_front_edge",
        "26,8": "tile_new_bg_wall_front_edge",
        "26,7": "tile_new_bg_wall_front_edge",
        "13,2": "tile_new_bg_wall_front_edge",
        "13,1": "tile_new_bg_wall_front_edge",
        "13,3": "tile_new_bg_wall_front_edge",
        "13,4": "tile_new_bg_wall_front_edge",
        "0,9": "tile_new_bg_wall_front_edge",
        "0,8": "tile_new_bg_wall_front_edge",
        "0,7": "tile_new_bg_wall_front_edge",
        "0,6": "tile_new_bg_wall_front_edge",
        "0,5": "tile_new_bg_wall_front_edge"
      },
      "ground2": {},
      "ground3": {},
      "object": {
        "7,13": "tile_restaurant_counter_stool_red",
        "25,5": "tile_eoc_security_camera",
        "21,10": "tile_new_bg_wall_front_edge",
        "21,11": "tile_new_bg_wall_front_edge"
      },
      "object2": {
        "20,10": "tile_eoc_security_camera"
      },
      "object3": {},
      "object4": {
        "5,20": "tile_restaurant_napkin_holder",
        "5,19": "tile_restaurant_condiment_bottles",
        "5,21": "tile_restaurant_chopsticks_holder"
      },
      "overlay": {
        "21,17": "tile_new_bg_wall_front_edge",
        "21,18": "tile_new_bg_wall_front_edge",
        "21,19": "tile_new_bg_wall_front_edge",
        "21,20": "tile_new_bg_wall_front_edge"
      },
      "top": {
        "3,10": "tile_new_bg_wall_front_edge",
        "3,11": "tile_new_bg_wall_front_edge",
        "3,12": "tile_new_bg_wall_front_edge",
        "3,13": "tile_new_bg_wall_front_edge",
        "3,14": "tile_new_bg_wall_front_edge",
        "3,15": "tile_new_bg_wall_front_edge",
        "3,16": "tile_new_bg_wall_front_edge",
        "3,17": "tile_new_bg_wall_front_edge",
        "3,18": "tile_new_bg_wall_front_edge",
        "3,19": "tile_new_bg_wall_front_edge",
        "3,20": "tile_new_bg_wall_front_edge",
        "3,21": "tile_new_bg_wall_front_edge",
        "3,22": "tile_new_bg_wall_front_edge",
        "3,23": "tile_new_bg_wall_front_edge",
        "26,23": "tile_new_bg_wall_front_edge",
        "26,22": "tile_new_bg_wall_front_edge",
        "26,21": "tile_new_bg_wall_front_edge",
        "26,20": "tile_new_bg_wall_front_edge",
        "26,19": "tile_new_bg_wall_front_edge",
        "26,18": "tile_new_bg_wall_front_edge",
        "26,17": "tile_new_bg_wall_front_edge",
        "26,16": "tile_new_bg_wall_front_edge",
        "26,12": "tile_new_bg_wall_front_edge",
        "26,13": "tile_new_bg_wall_front_edge",
        "26,14": "tile_new_bg_wall_front_edge",
        "26,15": "tile_new_bg_wall_front_edge",
        "26,11": "tile_new_bg_wall_front_edge",
        "26,10": "tile_new_bg_wall_front_edge",
        "26,7": "tile_new_bg_wall_front_edge",
        "26,6": "tile_new_bg_wall_front_edge",
        "26,5": "tile_new_bg_wall_front_edge",
        "13,1": "tile_new_bg_wall_front_edge",
        "13,2": "tile_new_bg_wall_front_edge",
        "13,3": "tile_new_bg_wall_front_edge",
        "4,1": "tile_new_bg_wall_front_edge",
        "4,2": "tile_new_bg_wall_front_edge",
        "4,3": "tile_new_bg_wall_front_edge",
        "0,7": "tile_new_bg_wall_front_edge",
        "0,6": "tile_new_bg_wall_front_edge",
        "0,5": "tile_new_bg_wall_front_edge"
      }
    },
    "stamps": [
      {
        "id": "tile_new_bg_wall",
        "c": 4,
        "r": 9,
        "layer": "object"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 5,
        "r": 9,
        "layer": "object"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 6,
        "r": 9,
        "layer": "object"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 7,
        "r": 9,
        "layer": "object"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 8,
        "r": 9,
        "layer": "object"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 9,
        "r": 9,
        "layer": "object"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 10,
        "r": 9,
        "layer": "object"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 11,
        "r": 9,
        "layer": "object"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 12,
        "r": 9,
        "layer": "object"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 13,
        "r": 9,
        "layer": "object"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 14,
        "r": 9,
        "layer": "object"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 15,
        "r": 9,
        "layer": "object"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 16,
        "r": 9,
        "layer": "object"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 17,
        "r": 9,
        "layer": "object"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 18,
        "r": 9,
        "layer": "object"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 19,
        "r": 9,
        "layer": "object"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 20,
        "r": 9,
        "layer": "object"
      },
      {
        "id": "tile_mu5e3ndv",
        "c": 3,
        "r": 9,
        "layer": "object4"
      },
      {
        "id": "tile_mu5e3ndv",
        "c": 21,
        "r": 9,
        "layer": "ground2",
        "sortDepth": 3.5
      },
      {
        "id": "tile_mu5e3ndv",
        "c": 26,
        "r": 9,
        "layer": "ground2"
      },
      {
        "id": "tile_restaurant_kitchen_workstation",
        "c": 10,
        "r": 11,
        "layer": "object",
        "ox": -16,
        "oy": -2
      },
      {
        "id": "tile_restaurant_waste_sorting_station",
        "c": 4,
        "r": 12,
        "layer": "object"
      },
      {
        "id": "tile_restaurant_storage_cabinet",
        "c": 18,
        "r": 11,
        "layer": "object",
        "ox": -28,
        "oy": -2
      },
      {
        "id": "tile_restaurant_buffet_counter_02",
        "c": 14,
        "r": 15,
        "layer": "object",
        "ox": -16,
        "oy": -24
      },
      {
        "id": "tile_restaurant_buffet_counter_01",
        "c": 10,
        "r": 15,
        "layer": "object",
        "ox": 20,
        "oy": -24
      },
      {
        "id": "tile_restaurant_serving_counter",
        "c": 18,
        "r": 15,
        "layer": "object",
        "ox": -34,
        "oy": -24
      },
      {
        "id": "tile_restaurant_partition_tall",
        "c": 5,
        "r": 18,
        "layer": "object",
        "ox": -12,
        "oy": -22
      },
      {
        "id": "tile_restaurant_trash_bin_small",
        "c": 17,
        "r": 13,
        "layer": "object",
        "ox": -22,
        "oy": -12
      },
      {
        "id": "tile_musc5wyq",
        "c": 9,
        "r": 19,
        "layer": "object2",
        "sortDepth": 1.25,
        "ox": -16,
        "oy": -2
      },
      {
        "id": "tile_musc5wyq",
        "c": 12,
        "r": 19,
        "layer": "object2",
        "ox": -6,
        "oy": -2,
        "sortDepth": 1.25
      },
      {
        "id": "tile_musc5wyq",
        "c": 17,
        "r": 19,
        "layer": "object2",
        "ox": -76,
        "oy": -2,
        "sortDepth": 1
      },
      {
        "id": "tile_restaurant_booth_seating_vertical",
        "c": 4,
        "r": 17,
        "layer": "object",
        "ox": -10,
        "oy": -22
      },
      {
        "id": "tile_restaurant_chair_side",
        "c": 7,
        "r": 17,
        "layer": "object",
        "ox": -16,
        "oy": 0
      },
      {
        "id": "tile_restaurant_chair_side",
        "c": 7,
        "r": 19,
        "layer": "object",
        "ox": -16,
        "oy": -28
      },
      {
        "id": "tile_restaurant_chair_side",
        "c": 7,
        "r": 21,
        "layer": "object",
        "ox": -16,
        "oy": -48
      },
      {
        "id": "tile_restaurant_chair_side",
        "c": 7,
        "r": 23,
        "layer": "object",
        "ox": -16,
        "oy": -72
      },
      {
        "id": "tile_new_decor_water_dispenser",
        "c": 8,
        "r": 12,
        "layer": "object"
      },
      {
        "id": "tile_musg7iyr",
        "c": 7,
        "r": 14,
        "layer": "object",
        "ox": 16,
        "oy": 16
      },
      {
        "id": "tile_restaurant_storage_cabinet",
        "c": 19,
        "r": 11,
        "layer": "object2",
        "ox": -6,
        "oy": -2
      },
      {
        "id": "tile_restaurant_water_dispenser_01",
        "c": 9,
        "r": 20,
        "layer": "object",
        "ox": 14,
        "oy": -4
      },
      {
        "id": "tile_restaurant_water_dispenser_01",
        "c": 11,
        "r": 20,
        "layer": "object",
        "ox": -12,
        "oy": -4
      },
      {
        "id": "tile_restaurant_water_dispenser_01",
        "c": 13,
        "r": 20,
        "layer": "object",
        "ox": -14,
        "oy": -4
      },
      {
        "id": "tile_restaurant_water_dispenser_01",
        "c": 14,
        "r": 20,
        "layer": "object",
        "ox": -2,
        "oy": -4
      },
      {
        "id": "tile_restaurant_water_dispenser_01",
        "c": 16,
        "r": 20,
        "layer": "object",
        "ox": -6,
        "oy": -4
      },
      {
        "id": "tile_restaurant_water_dispenser_01",
        "c": 17,
        "r": 20,
        "layer": "object",
        "ox": 4,
        "oy": -4
      },
      {
        "id": "tile_restaurant_water_dispenser_02",
        "c": 9,
        "r": 17,
        "layer": "object",
        "ox": 16,
        "oy": 6
      },
      {
        "id": "tile_restaurant_water_dispenser_02",
        "c": 11,
        "r": 17,
        "layer": "object",
        "ox": -10,
        "oy": 6
      },
      {
        "id": "tile_restaurant_water_dispenser_02",
        "c": 13,
        "r": 17,
        "layer": "object",
        "ox": -12,
        "oy": 6
      },
      {
        "id": "tile_restaurant_water_dispenser_02",
        "c": 14,
        "r": 17,
        "layer": "object",
        "ox": 0,
        "oy": 6
      },
      {
        "id": "tile_restaurant_water_dispenser_02",
        "c": 16,
        "r": 17,
        "layer": "object",
        "ox": -4,
        "oy": 6,
        "sortDepth": 1.75
      },
      {
        "id": "tile_restaurant_water_dispenser_02",
        "c": 17,
        "r": 17,
        "layer": "object",
        "ox": 4,
        "oy": 6,
        "sortDepth": 1.75
      },
      {
        "id": "tile_restaurant_soup_warmer",
        "c": 17,
        "r": 14,
        "layer": "object2",
        "ox": 8,
        "oy": -18
      },
      {
        "id": "tile_restaurant_tray_stack",
        "c": 18,
        "r": 14,
        "layer": "object2",
        "ox": 6,
        "oy": -16
      },
      {
        "id": "tile_restaurant_bowl_stack",
        "c": 19,
        "r": 14,
        "layer": "object2",
        "ox": 2,
        "oy": 10
      },
      {
        "id": "tile_restaurant_chopsticks_holder",
        "c": 19,
        "r": 15,
        "layer": "object3",
        "ox": 2,
        "oy": -12,
        "sortDepth": 0.75
      },
      {
        "id": "tile_new_decor_poster",
        "c": 7,
        "r": 10,
        "layer": "object2"
      },
      {
        "id": "tile_new_decor_plant03",
        "c": 21,
        "r": 13,
        "layer": "object4",
        "ox": 0,
        "oy": -18,
        "sortDepth": 1.75
      },
      {
        "id": "tile_new_decor_plant01",
        "c": 4,
        "r": 14,
        "layer": "object2",
        "ox": -20,
        "oy": 12
      },
      {
        "id": "tile_new_bg_wall",
        "c": 3,
        "r": 4,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 4,
        "r": 4,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 13,
        "r": 4,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 15,
        "r": 4,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 14,
        "r": 4,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 16,
        "r": 4,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 17,
        "r": 4,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 21,
        "r": 4,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 22,
        "r": 4,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 23,
        "r": 4,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 24,
        "r": 4,
        "layer": "ground",
        "ox": 0,
        "oy": 0
      },
      {
        "id": "tile_new_bg_wall",
        "c": 25,
        "r": 4,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 26,
        "r": 4,
        "layer": "ground"
      },
      {
        "id": "tile_mu5e3ndv",
        "c": 26,
        "r": 4,
        "layer": "ground2"
      },
      {
        "id": "tile_eoc_escape_stairs",
        "c": 17,
        "r": 3,
        "layer": "floor",
        "ox": 2,
        "oy": -72,
        "sortDepth": 1
      },
      {
        "id": "tile_eoc_double_door_open",
        "c": 18,
        "r": 4,
        "layer": "ground",
        "ox": 0,
        "oy": 0,
        "sortDepth": 3.5
      },
      {
        "id": "tile_mufxoi3i",
        "c": 22,
        "r": 5,
        "layer": "object",
        "ox": 26,
        "oy": -4,
        "sortDepth": 2.75
      },
      {
        "id": "tile_mu5e3ndv",
        "c": 21,
        "r": 4,
        "layer": "object"
      },
      {
        "id": "tile_eoc_hydrant_white",
        "c": 15,
        "r": 6,
        "layer": "object",
        "ox": 20,
        "oy": 0
      },
      {
        "id": "tile_new_decor_exit_sign",
        "c": 17,
        "r": 5,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_mufxpxnl",
        "c": 24,
        "r": 5,
        "layer": "object2",
        "ox": -20,
        "oy": -6
      },
      {
        "id": "tile_eoc_locker",
        "c": 1,
        "r": 5,
        "layer": "object2",
        "ox": 0,
        "oy": 14
      },
      {
        "id": "tile_eoc_locker",
        "c": 2,
        "r": 5,
        "layer": "object2",
        "ox": -6,
        "oy": 14
      },
      {
        "id": "tile_mu4yyr9r",
        "c": 1,
        "r": 8,
        "layer": "ground3",
        "ox": -4,
        "oy": -6
      },
      {
        "id": "tile_mu4yzgcg",
        "c": 3,
        "r": 9,
        "layer": "ground3",
        "ox": -12,
        "oy": -6
      },
      {
        "id": "tile_mu5e3ndv",
        "c": 3,
        "r": 20,
        "layer": "top"
      },
      {
        "id": "tile_mu5e3ndv",
        "c": 21,
        "r": 20,
        "layer": "top"
      },
      {
        "id": "tile_mu5e3ndv",
        "c": 21,
        "r": 16,
        "layer": "object"
      },
      {
        "id": "tile_new_decor_plant02",
        "c": 19,
        "r": 22,
        "layer": "overlay",
        "ox": 8,
        "oy": 10
      },
      {
        "id": "tile_new_decor_fire_extinguisher",
        "c": 18,
        "r": 23,
        "layer": "overlay",
        "ox": 26,
        "oy": 0
      },
      {
        "id": "tile_eoc_security_door",
        "c": 24,
        "r": 22,
        "layer": "overlay"
      },
      {
        "id": "tile_eoc_security_door",
        "c": 23,
        "r": 22,
        "layer": "overlay",
        "fx": true
      },
      {
        "id": "tile_mu5e3ndv",
        "c": 21,
        "r": 10,
        "layer": "object3"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 2,
        "r": 4,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 1,
        "r": 4,
        "layer": "ground"
      },
      {
        "id": "tile_mu5e3ndv",
        "c": 0,
        "r": 4,
        "layer": "object"
      },
      {
        "id": "tile_mu5e3ndv",
        "c": 0,
        "r": 9,
        "layer": "object"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 2,
        "r": 9,
        "layer": "object"
      },
      {
        "id": "tile_mu5e3ndv",
        "c": 4,
        "r": 4,
        "layer": "object3"
      },
      {
        "id": "tile_mu5e3ndv",
        "c": 13,
        "r": 4,
        "layer": "object3"
      },
      {
        "id": "tile_new_decor_poster",
        "c": 14,
        "r": 5,
        "layer": "object2",
        "ox": -4,
        "oy": 6
      },
      {
        "id": "tile_new_bg_wall",
        "c": 13,
        "r": 0,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 12,
        "r": 0,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 11,
        "r": 0,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 10,
        "r": 0,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 9,
        "r": 0,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 7,
        "r": 0,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 8,
        "r": 0,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 5,
        "r": 0,
        "layer": "ground"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 6,
        "r": 0,
        "layer": "ground"
      },
      {
        "id": "tile_cvs_back_counter",
        "c": 5,
        "r": 2,
        "layer": "object",
        "ox": -4,
        "oy": 0,
        "sortDepth": 2.5
      },
      {
        "id": "tile_cvs_checkout_counter",
        "c": 5,
        "r": 4,
        "layer": "object2",
        "ox": 0,
        "oy": 10,
        "sortDepth": 2.75
      },
      {
        "id": "tile_cvs_sign_home_mart",
        "c": 5,
        "r": 1,
        "layer": "object2",
        "ox": 0,
        "oy": 2
      },
      {
        "id": "tile_mu5e3ndv",
        "c": 4,
        "r": 0,
        "layer": "ground2"
      },
      {
        "id": "tile_mu5e3ndv",
        "c": 13,
        "r": 0,
        "layer": "ground2"
      },
      {
        "id": "tile_cvs_snack_shelf",
        "c": 10,
        "r": 4,
        "layer": "object2",
        "ox": 34,
        "oy": 12,
        "sortDepth": 2.5
      },
      {
        "id": "tile_cvs_drink_cooler",
        "c": 11,
        "r": 2,
        "layer": "object",
        "ox": -4,
        "oy": -4,
        "sortDepth": 2.75
      },
      {
        "id": "tile_cvs_famiport",
        "c": 4,
        "r": 5,
        "layer": "object3",
        "ox": 0,
        "oy": 18
      },
      {
        "id": "tile_new_bg_wall",
        "c": 1,
        "r": 9,
        "layer": "object"
      }
    ],
    "solid": [
      "3,12",
      "4,12",
      "5,12",
      "6,12",
      "7,12",
      "8,12",
      "9,12",
      "10,12",
      "11,12",
      "12,12",
      "13,12",
      "14,12",
      "15,12",
      "16,12",
      "17,12",
      "18,12",
      "19,12",
      "20,12",
      "21,12",
      "19,13",
      "20,13",
      "18,13",
      "17,13",
      "16,13",
      "15,13",
      "14,13",
      "13,13",
      "12,13",
      "11,13",
      "10,13",
      "6,13",
      "5,13",
      "4,13",
      "3,13",
      "8,13",
      "7,13",
      "10,15",
      "9,15",
      "12,15",
      "13,15",
      "14,15",
      "15,15",
      "16,15",
      "11,15",
      "17,15",
      "18,15",
      "19,15",
      "8,15",
      "9,19",
      "10,19",
      "11,19",
      "12,19",
      "13,19",
      "14,19",
      "15,19",
      "17,19",
      "18,19",
      "16,19",
      "5,18",
      "5,20",
      "5,19",
      "5,21",
      "5,22",
      "26,13",
      "26,14",
      "26,15",
      "26,16",
      "26,17",
      "26,18",
      "26,19",
      "26,20",
      "26,21",
      "26,22",
      "26,23",
      "3,14",
      "3,15",
      "3,16",
      "3,17",
      "3,18",
      "3,19",
      "3,20",
      "3,21",
      "3,22",
      "3,23",
      "21,13",
      "3,7",
      "13,7",
      "14,7",
      "15,7",
      "16,7",
      "17,7",
      "18,7",
      "21,7",
      "22,7",
      "25,7",
      "26,8",
      "26,9",
      "26,10",
      "26,11",
      "26,12",
      "26,7",
      "20,7",
      "17,6",
      "17,5",
      "17,4",
      "17,3",
      "17,2",
      "21,2",
      "21,3",
      "21,4",
      "21,5",
      "21,6",
      "19,3",
      "18,3",
      "19,2",
      "18,2",
      "3,11",
      "4,11",
      "5,11",
      "6,11",
      "7,11",
      "8,11",
      "9,11",
      "10,11",
      "11,11",
      "12,11",
      "13,11",
      "14,11",
      "15,11",
      "16,11",
      "17,11",
      "18,11",
      "19,11",
      "20,11",
      "21,11",
      "21,18",
      "21,19",
      "21,20",
      "21,21",
      "21,22",
      "21,23",
      "20,23",
      "19,23",
      "3,10",
      "4,10",
      "5,10",
      "1,7",
      "2,7",
      "1,11",
      "1,12",
      "2,12",
      "1,10",
      "2,11",
      "2,10",
      "4,6",
      "4,5",
      "4,4",
      "4,7",
      "4,2",
      "4,3",
      "5,3",
      "5,4",
      "6,4",
      "6,3",
      "7,3",
      "7,4",
      "8,3",
      "8,4",
      "9,4",
      "10,4",
      "11,4",
      "12,4",
      "10,3",
      "9,3",
      "11,3",
      "13,3",
      "12,3",
      "13,4",
      "13,5",
      "13,6",
      "5,6",
      "6,6",
      "7,6",
      "8,6",
      "12,6",
      "11,6",
      "0,7",
      "0,8",
      "0,9",
      "0,10",
      "0,12",
      "0,11",
      "1,8",
      "1,9",
      "2,8",
      "2,9",
      "3,9",
      "20,1",
      "19,1",
      "21,1",
      "18,1",
      "17,1"
    ],
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
    "solidOffsets": {
      "20,7": [
        10,
        0
      ],
      "18,7": [
        -7,
        0
      ],
      "19,2": [
        -9,
        0
      ],
      "19,3": [
        -9,
        0
      ]
    },
    "safe": true,
    "npcs": false,
    "portals": [
      {
        "c": 20,
        "r": 2,
        "to": "map_mu5ad7t2"
      },
      {
        "c": 20,
        "r": 3,
        "to": "map_mu5ad7t2"
      },
      {
        "c": 23,
        "r": 23,
        "to": "map_muspgfxl"
      },
      {
        "c": 24,
        "r": 23,
        "to": "map_muspgfxl"
      },
      {
        "c": 23,
        "r": 22,
        "to": "map_muspgfxl"
      },
      {
        "c": 24,
        "r": 22,
        "to": "map_muspgfxl"
      },
      {
        "c": 18,
        "r": 4,
        "to": "map_musu0dlp"
      },
      {
        "c": 19,
        "r": 4,
        "to": "map_musu0dlp"
      }
    ],
    "cols": 27,
    "rows": 24,
    "spawnZone": []
  },
  {
    "id": "map_muspgfxl",
    "name": "醫院",
    "desc": "",
    "layers": {
      "floor": {
        "11,7": "tile_hospital_ward_floor_tile",
        "0,2": "tile_hospital_ward_floor_tile",
        "0,3": "tile_hospital_ward_floor_tile",
        "0,4": "tile_hospital_ward_floor_tile",
        "0,5": "tile_hospital_ward_floor_tile",
        "0,6": "tile_hospital_ward_floor_tile",
        "0,7": "tile_hospital_ward_floor_tile",
        "0,8": "tile_hospital_ward_floor_tile",
        "0,9": "tile_hospital_ward_floor_tile",
        "0,10": "tile_hospital_ward_floor_tile",
        "0,11": "tile_hospital_ward_floor_tile",
        "0,12": "tile_hospital_ward_floor_tile",
        "0,13": "tile_hospital_ward_floor_tile",
        "0,14": "tile_hospital_ward_floor_tile",
        "1,3": "tile_hospital_ward_floor_tile",
        "1,4": "tile_hospital_ward_floor_tile",
        "1,5": "tile_hospital_ward_floor_tile",
        "1,6": "tile_hospital_ward_floor_tile",
        "1,7": "tile_hospital_ward_floor_tile",
        "1,8": "tile_hospital_ward_floor_tile",
        "1,9": "tile_hospital_ward_floor_tile",
        "1,10": "tile_hospital_ward_floor_tile",
        "1,11": "tile_hospital_ward_floor_tile",
        "1,12": "tile_hospital_ward_floor_tile",
        "1,13": "tile_hospital_ward_floor_tile",
        "1,14": "tile_hospital_ward_floor_tile",
        "2,3": "tile_hospital_ward_floor_tile",
        "2,4": "tile_hospital_ward_floor_tile",
        "2,5": "tile_hospital_ward_floor_tile",
        "2,6": "tile_hospital_ward_floor_tile",
        "2,7": "tile_hospital_ward_floor_tile",
        "2,8": "tile_hospital_ward_floor_tile",
        "2,9": "tile_hospital_ward_floor_tile",
        "2,10": "tile_hospital_ward_floor_tile",
        "2,11": "tile_hospital_ward_floor_tile",
        "2,12": "tile_hospital_ward_floor_tile",
        "2,13": "tile_hospital_ward_floor_tile",
        "2,14": "tile_hospital_ward_floor_tile",
        "3,3": "tile_hospital_ward_floor_tile",
        "3,4": "tile_hospital_ward_floor_tile",
        "3,5": "tile_hospital_ward_floor_tile",
        "3,6": "tile_hospital_ward_floor_tile",
        "3,7": "tile_hospital_ward_floor_tile",
        "3,8": "tile_hospital_ward_floor_tile",
        "3,9": "tile_hospital_ward_floor_tile",
        "3,10": "tile_hospital_ward_floor_tile",
        "3,11": "tile_hospital_ward_floor_tile",
        "3,12": "tile_hospital_ward_floor_tile",
        "3,13": "tile_hospital_ward_floor_tile",
        "3,14": "tile_hospital_ward_floor_tile",
        "4,3": "tile_hospital_ward_floor_tile",
        "4,4": "tile_hospital_ward_floor_tile",
        "4,5": "tile_hospital_ward_floor_tile",
        "4,6": "tile_hospital_ward_floor_tile",
        "4,7": "tile_hospital_ward_floor_tile",
        "4,8": "tile_hospital_ward_floor_tile",
        "4,9": "tile_hospital_ward_floor_tile",
        "4,10": "tile_hospital_ward_floor_tile",
        "4,11": "tile_hospital_ward_floor_tile",
        "4,12": "tile_hospital_ward_floor_tile",
        "4,13": "tile_hospital_ward_floor_tile",
        "4,14": "tile_hospital_ward_floor_tile",
        "5,2": "tile_hospital_ward_floor_tile",
        "5,3": "tile_hospital_ward_floor_tile",
        "5,4": "tile_hospital_ward_floor_tile",
        "5,5": "tile_hospital_ward_floor_tile",
        "5,6": "tile_hospital_ward_floor_tile",
        "5,7": "tile_hospital_ward_floor_tile",
        "5,8": "tile_hospital_ward_floor_tile",
        "5,9": "tile_hospital_ward_floor_tile",
        "5,10": "tile_hospital_ward_floor_tile",
        "5,11": "tile_hospital_ward_floor_tile",
        "5,12": "tile_hospital_ward_floor_tile",
        "5,13": "tile_hospital_ward_floor_tile",
        "5,14": "tile_hospital_ward_floor_tile",
        "6,3": "tile_hospital_ward_floor_tile",
        "6,4": "tile_hospital_ward_floor_tile",
        "6,5": "tile_hospital_ward_floor_tile",
        "6,6": "tile_hospital_ward_floor_tile",
        "6,7": "tile_hospital_ward_floor_tile",
        "6,8": "tile_hospital_ward_floor_tile",
        "6,9": "tile_hospital_ward_floor_tile",
        "6,10": "tile_hospital_ward_floor_tile",
        "6,11": "tile_hospital_ward_floor_tile",
        "6,12": "tile_hospital_ward_floor_tile",
        "6,13": "tile_hospital_ward_floor_tile",
        "6,14": "tile_hospital_ward_floor_tile",
        "7,2": "tile_hospital_ward_floor_tile",
        "7,3": "tile_hospital_ward_floor_tile",
        "7,4": "tile_hospital_ward_floor_tile",
        "7,5": "tile_hospital_ward_floor_tile",
        "7,6": "tile_hospital_ward_floor_tile",
        "7,7": "tile_hospital_ward_floor_tile",
        "7,8": "tile_hospital_ward_floor_tile",
        "7,9": "tile_hospital_ward_floor_tile",
        "7,10": "tile_hospital_ward_floor_tile",
        "7,11": "tile_hospital_ward_floor_tile",
        "7,12": "tile_hospital_ward_floor_tile",
        "7,13": "tile_hospital_ward_floor_tile",
        "7,14": "tile_hospital_ward_floor_tile",
        "8,3": "tile_hospital_ward_floor_tile",
        "8,4": "tile_hospital_ward_floor_tile",
        "8,5": "tile_hospital_ward_floor_tile",
        "8,6": "tile_hospital_ward_floor_tile",
        "8,7": "tile_hospital_ward_floor_tile",
        "8,8": "tile_hospital_ward_floor_tile",
        "8,9": "tile_hospital_ward_floor_tile",
        "8,10": "tile_hospital_ward_floor_tile",
        "8,11": "tile_hospital_ward_floor_tile",
        "8,12": "tile_hospital_ward_floor_tile",
        "8,13": "tile_hospital_ward_floor_tile",
        "8,14": "tile_hospital_ward_floor_tile",
        "9,3": "tile_hospital_ward_floor_tile",
        "9,4": "tile_hospital_ward_floor_tile",
        "9,5": "tile_hospital_ward_floor_tile",
        "9,6": "tile_hospital_ward_floor_tile",
        "9,7": "tile_hospital_ward_floor_tile",
        "9,8": "tile_hospital_ward_floor_tile",
        "9,9": "tile_hospital_ward_floor_tile",
        "9,10": "tile_hospital_ward_floor_tile",
        "9,11": "tile_hospital_ward_floor_tile",
        "9,12": "tile_hospital_ward_floor_tile",
        "9,13": "tile_hospital_ward_floor_tile",
        "9,14": "tile_hospital_ward_floor_tile",
        "10,3": "tile_hospital_ward_floor_tile",
        "10,4": "tile_hospital_ward_floor_tile",
        "10,5": "tile_hospital_ward_floor_tile",
        "10,6": "tile_hospital_ward_floor_tile",
        "10,7": "tile_hospital_ward_floor_tile",
        "10,8": "tile_hospital_ward_floor_tile",
        "10,9": "tile_hospital_ward_floor_tile",
        "10,10": "tile_hospital_ward_floor_tile",
        "10,11": "tile_hospital_ward_floor_tile",
        "10,12": "tile_hospital_ward_floor_tile",
        "10,13": "tile_hospital_ward_floor_tile",
        "10,14": "tile_hospital_ward_floor_tile",
        "11,3": "tile_hospital_ward_floor_tile",
        "11,4": "tile_hospital_ward_floor_tile",
        "11,5": "tile_hospital_ward_floor_tile",
        "11,6": "tile_hospital_ward_floor_tile",
        "11,8": "tile_hospital_ward_floor_tile",
        "11,9": "tile_hospital_ward_floor_tile",
        "11,10": "tile_hospital_ward_floor_tile",
        "11,11": "tile_hospital_ward_floor_tile",
        "11,12": "tile_hospital_ward_floor_tile",
        "11,13": "tile_hospital_ward_floor_tile",
        "11,14": "tile_hospital_ward_floor_tile",
        "12,3": "tile_hospital_ward_floor_tile",
        "12,4": "tile_hospital_ward_floor_tile",
        "12,5": "tile_hospital_ward_floor_tile",
        "12,6": "tile_hospital_ward_floor_tile",
        "12,7": "tile_hospital_ward_floor_tile",
        "12,8": "tile_hospital_ward_floor_tile",
        "12,9": "tile_hospital_ward_floor_tile",
        "12,10": "tile_hospital_ward_floor_tile",
        "12,11": "tile_hospital_ward_floor_tile",
        "12,12": "tile_hospital_ward_floor_tile",
        "12,13": "tile_hospital_ward_floor_tile",
        "12,14": "tile_hospital_ward_floor_tile",
        "13,3": "tile_hospital_ward_floor_tile",
        "13,4": "tile_hospital_ward_floor_tile",
        "13,5": "tile_hospital_ward_floor_tile",
        "13,6": "tile_hospital_ward_floor_tile",
        "13,7": "tile_hospital_ward_floor_tile",
        "13,8": "tile_hospital_ward_floor_tile",
        "13,9": "tile_hospital_ward_floor_tile",
        "13,10": "tile_hospital_ward_floor_tile",
        "13,11": "tile_hospital_ward_floor_tile",
        "13,12": "tile_hospital_ward_floor_tile",
        "13,13": "tile_hospital_ward_floor_tile",
        "13,14": "tile_hospital_ward_floor_tile",
        "14,3": "tile_hospital_ward_floor_tile",
        "14,4": "tile_hospital_ward_floor_tile",
        "14,5": "tile_hospital_ward_floor_tile",
        "14,6": "tile_hospital_ward_floor_tile",
        "14,7": "tile_hospital_ward_floor_tile",
        "14,8": "tile_hospital_ward_floor_tile",
        "14,9": "tile_hospital_ward_floor_tile",
        "14,10": "tile_hospital_ward_floor_tile",
        "14,11": "tile_hospital_ward_floor_tile",
        "14,12": "tile_hospital_ward_floor_tile",
        "14,13": "tile_hospital_ward_floor_tile",
        "14,14": "tile_hospital_ward_floor_tile",
        "15,3": "tile_hospital_ward_floor_tile",
        "15,4": "tile_hospital_ward_floor_tile",
        "15,5": "tile_hospital_ward_floor_tile",
        "15,6": "tile_hospital_ward_floor_tile",
        "15,7": "tile_hospital_ward_floor_tile",
        "15,8": "tile_hospital_ward_floor_tile",
        "15,9": "tile_hospital_ward_floor_tile",
        "15,10": "tile_hospital_ward_floor_tile",
        "15,11": "tile_hospital_ward_floor_tile",
        "15,12": "tile_hospital_ward_floor_tile",
        "15,13": "tile_hospital_ward_floor_tile",
        "15,14": "tile_hospital_ward_floor_tile",
        "16,3": "tile_hospital_ward_floor_tile",
        "16,4": "tile_hospital_ward_floor_tile",
        "16,5": "tile_hospital_ward_floor_tile",
        "16,6": "tile_hospital_ward_floor_tile",
        "16,7": "tile_hospital_ward_floor_tile",
        "16,8": "tile_hospital_ward_floor_tile",
        "16,9": "tile_hospital_ward_floor_tile",
        "16,10": "tile_hospital_ward_floor_tile",
        "16,11": "tile_hospital_ward_floor_tile",
        "16,12": "tile_hospital_ward_floor_tile",
        "16,13": "tile_hospital_ward_floor_tile",
        "16,14": "tile_hospital_ward_floor_tile",
        "17,3": "tile_hospital_ward_floor_tile",
        "17,4": "tile_hospital_ward_floor_tile",
        "17,5": "tile_hospital_ward_floor_tile",
        "17,6": "tile_hospital_ward_floor_tile",
        "17,7": "tile_hospital_ward_floor_tile",
        "17,8": "tile_hospital_ward_floor_tile",
        "17,9": "tile_hospital_ward_floor_tile",
        "17,10": "tile_hospital_ward_floor_tile",
        "17,11": "tile_hospital_ward_floor_tile",
        "17,12": "tile_hospital_ward_floor_tile",
        "17,13": "tile_hospital_ward_floor_tile",
        "17,14": "tile_hospital_ward_floor_tile",
        "18,3": "tile_hospital_ward_floor_tile",
        "18,4": "tile_hospital_ward_floor_tile",
        "18,5": "tile_hospital_ward_floor_tile",
        "18,6": "tile_hospital_ward_floor_tile",
        "18,7": "tile_hospital_ward_floor_tile",
        "18,8": "tile_hospital_ward_floor_tile",
        "18,9": "tile_hospital_ward_floor_tile",
        "18,10": "tile_hospital_ward_floor_tile",
        "18,11": "tile_hospital_ward_floor_tile",
        "18,12": "tile_hospital_ward_floor_tile",
        "18,13": "tile_hospital_ward_floor_tile",
        "18,14": "tile_hospital_ward_floor_tile",
        "19,2": "tile_hospital_ward_floor_tile",
        "19,3": "tile_hospital_ward_floor_tile",
        "19,4": "tile_hospital_ward_floor_tile",
        "19,6": "tile_hospital_ward_floor_tile",
        "19,7": "tile_hospital_ward_floor_tile",
        "19,8": "tile_hospital_ward_floor_tile",
        "19,9": "tile_hospital_ward_floor_tile",
        "19,10": "tile_hospital_ward_floor_tile",
        "19,11": "tile_hospital_ward_floor_tile",
        "19,12": "tile_hospital_ward_floor_tile",
        "19,13": "tile_hospital_ward_floor_tile",
        "19,14": "tile_hospital_ward_floor_tile",
        "20,2": "tile_hospital_ward_floor_tile",
        "20,3": "tile_hospital_ward_floor_tile",
        "20,4": "tile_hospital_ward_floor_tile",
        "20,5": "tile_hospital_ward_floor_tile",
        "20,6": "tile_hospital_ward_floor_tile",
        "20,7": "tile_hospital_ward_floor_tile",
        "20,8": "tile_hospital_ward_floor_tile",
        "20,9": "tile_hospital_ward_floor_tile",
        "20,10": "tile_hospital_ward_floor_tile",
        "20,11": "tile_hospital_ward_floor_tile",
        "20,12": "tile_hospital_ward_floor_tile",
        "20,13": "tile_hospital_ward_floor_tile",
        "20,14": "tile_hospital_ward_floor_tile",
        "16,15": "tile_hospital_ward_floor_tile",
        "15,15": "tile_hospital_ward_floor_tile",
        "13,15": "tile_hospital_ward_floor_tile",
        "12,15": "tile_hospital_ward_floor_tile",
        "10,15": "tile_hospital_ward_floor_tile",
        "9,15": "tile_hospital_ward_floor_tile",
        "8,15": "tile_hospital_ward_floor_tile",
        "7,15": "tile_hospital_ward_floor_tile",
        "6,15": "tile_hospital_ward_floor_tile",
        "5,15": "tile_hospital_ward_floor_tile",
        "4,15": "tile_hospital_ward_floor_tile",
        "3,15": "tile_hospital_ward_floor_tile",
        "2,15": "tile_hospital_ward_floor_tile",
        "1,15": "tile_hospital_ward_floor_tile",
        "0,15": "tile_hospital_ward_floor_tile",
        "20,15": "tile_hospital_ward_floor_tile",
        "19,15": "tile_hospital_ward_floor_tile",
        "18,15": "tile_hospital_ward_floor_tile",
        "17,15": "tile_hospital_ward_floor_tile",
        "14,15": "tile_hospital_ward_floor_tile",
        "11,15": "tile_hospital_ward_floor_tile"
      },
      "ground": {
        "0,12": "tile_new_bg_wall_front_edge",
        "0,11": "tile_new_bg_wall_front_edge",
        "0,10": "tile_new_bg_wall_front_edge",
        "0,9": "tile_new_bg_wall_front_edge",
        "0,8": "tile_new_bg_wall_front_edge",
        "0,7": "tile_new_bg_wall_front_edge",
        "0,6": "tile_new_bg_wall_front_edge",
        "0,5": "tile_new_bg_wall_front_edge",
        "0,13": "tile_new_bg_wall_front_edge"
      },
      "ground2": {},
      "ground3": {},
      "object": {},
      "object2": {},
      "object3": {},
      "object4": {},
      "overlay": {},
      "top": {
        "0,3": "tile_new_bg_wall_front_edge",
        "0,4": "tile_new_bg_wall_front_edge",
        "0,2": "tile_new_bg_wall_front_edge",
        "20,2": "tile_new_bg_wall_front_edge",
        "20,3": "tile_new_bg_wall_front_edge",
        "20,4": "tile_new_bg_wall_front_edge",
        "20,5": "tile_new_bg_wall_front_edge",
        "20,6": "tile_new_bg_wall_front_edge",
        "20,7": "tile_new_bg_wall_front_edge",
        "20,8": "tile_new_bg_wall_front_edge",
        "20,9": "tile_new_bg_wall_front_edge",
        "20,10": "tile_new_bg_wall_front_edge",
        "20,11": "tile_new_bg_wall_front_edge",
        "20,12": "tile_new_bg_wall_front_edge",
        "20,13": "tile_new_bg_wall_front_edge",
        "20,14": "tile_new_bg_wall_front_edge",
        "20,15": "tile_new_bg_wall_front_edge"
      }
    },
    "stamps": [
      {
        "id": "tile_hospital_ward_wall_tile",
        "c": 0,
        "r": 1,
        "layer": "ground"
      },
      {
        "id": "tile_hospital_ward_wall_tile",
        "c": 1,
        "r": 1,
        "layer": "ground"
      },
      {
        "id": "tile_hospital_ward_wall_tile",
        "c": 2,
        "r": 1,
        "layer": "ground"
      },
      {
        "id": "tile_hospital_ward_wall_tile",
        "c": 3,
        "r": 1,
        "layer": "ground"
      },
      {
        "id": "tile_hospital_ward_wall_tile",
        "c": 4,
        "r": 1,
        "layer": "ground"
      },
      {
        "id": "tile_hospital_ward_wall_tile",
        "c": 5,
        "r": 1,
        "layer": "ground"
      },
      {
        "id": "tile_hospital_ward_wall_tile",
        "c": 6,
        "r": 1,
        "layer": "ground"
      },
      {
        "id": "tile_hospital_ward_wall_tile",
        "c": 7,
        "r": 1,
        "layer": "ground"
      },
      {
        "id": "tile_hospital_ward_wall_tile",
        "c": 8,
        "r": 1,
        "layer": "ground"
      },
      {
        "id": "tile_hospital_ward_wall_tile",
        "c": 9,
        "r": 1,
        "layer": "ground"
      },
      {
        "id": "tile_hospital_ward_wall_tile",
        "c": 10,
        "r": 1,
        "layer": "ground"
      },
      {
        "id": "tile_hospital_ward_wall_tile",
        "c": 11,
        "r": 1,
        "layer": "ground"
      },
      {
        "id": "tile_hospital_ward_wall_tile",
        "c": 13,
        "r": 1,
        "layer": "ground"
      },
      {
        "id": "tile_hospital_ward_wall_tile",
        "c": 12,
        "r": 1,
        "layer": "ground"
      },
      {
        "id": "tile_hospital_ward_wall_tile",
        "c": 14,
        "r": 1,
        "layer": "ground"
      },
      {
        "id": "tile_hospital_ward_wall_tile",
        "c": 15,
        "r": 1,
        "layer": "ground"
      },
      {
        "id": "tile_hospital_ward_wall_tile",
        "c": 16,
        "r": 1,
        "layer": "ground"
      },
      {
        "id": "tile_hospital_ward_wall_tile",
        "c": 17,
        "r": 1,
        "layer": "ground"
      },
      {
        "id": "tile_hospital_ward_wall_tile",
        "c": 19,
        "r": 1,
        "layer": "ground",
        "ox": 0,
        "oy": 0
      },
      {
        "id": "tile_hospital_ward_wall_tile",
        "c": 18,
        "r": 1,
        "layer": "ground"
      },
      {
        "id": "tile_hospital_ward_wall_tile",
        "c": 20,
        "r": 1,
        "layer": "ground"
      },
      {
        "id": "tile_mu5e3ndv",
        "c": 0,
        "r": 1,
        "layer": "ground2"
      },
      {
        "id": "tile_mu5e3ndv",
        "c": 0,
        "r": 12,
        "layer": "object"
      },
      {
        "id": "tile_hospital_privacy_curtain_bottom_half",
        "c": 1,
        "r": 2,
        "layer": "object4",
        "sortDepth": 6.25
      },
      {
        "id": "tile_hospital_hospital_bed",
        "c": 2,
        "r": 4,
        "layer": "object",
        "ox": 20,
        "oy": 4
      },
      {
        "id": "tile_hospital_ward_window_wide",
        "c": 2,
        "r": 2,
        "layer": "object",
        "ox": -14,
        "oy": 16
      },
      {
        "id": "tile_hospital_ward_window_wide",
        "c": 7,
        "r": 2,
        "layer": "object",
        "ox": -16,
        "oy": 16
      },
      {
        "id": "tile_hospital_ward_window_wide",
        "c": 13,
        "r": 2,
        "layer": "object",
        "ox": -52,
        "oy": 16
      },
      {
        "id": "tile_hospital_privacy_curtain_bottom",
        "c": 6,
        "r": 2,
        "layer": "object4",
        "sortDepth": 6.25
      },
      {
        "id": "tile_hospital_privacy_curtain_bottom",
        "c": 11,
        "r": 2,
        "layer": "object4",
        "sortDepth": 6.25
      },
      {
        "id": "tile_hospital_privacy_curtain_top_half",
        "c": 1,
        "r": 9,
        "layer": "ground",
        "sortDepth": 2.25
      },
      {
        "id": "tile_hospital_privacy_curtain_top",
        "c": 6,
        "r": 9,
        "layer": "ground",
        "sortDepth": 2.25
      },
      {
        "id": "tile_hospital_bedside_cabinet",
        "c": 1,
        "r": 4,
        "layer": "ground3",
        "ox": 22,
        "oy": -20
      },
      {
        "id": "tile_hospital_waiting_bench_side",
        "c": 1,
        "r": 5,
        "layer": "object",
        "ox": -16,
        "oy": -16
      },
      {
        "id": "tile_hospital_iv_stand",
        "c": 4,
        "r": 3,
        "layer": "object",
        "ox": 18,
        "oy": -18
      },
      {
        "id": "tile_hospital_bed_headwall_panel",
        "c": 7,
        "r": 3,
        "layer": "ground3",
        "ox": 16,
        "oy": 12
      },
      {
        "id": "tile_hospital_bed_headwall_panel",
        "c": 12,
        "r": 3,
        "layer": "ground3",
        "ox": 18,
        "oy": 12
      },
      {
        "id": "tile_hospital_bed_headwall_panel",
        "c": 2,
        "r": 3,
        "layer": "ground3",
        "ox": 18,
        "oy": 12
      },
      {
        "id": "tile_hospital_hospital_bed",
        "c": 7,
        "r": 4,
        "layer": "object",
        "ox": 18,
        "oy": 4
      },
      {
        "id": "tile_hospital_hospital_bed",
        "c": 12,
        "r": 4,
        "layer": "object",
        "ox": 20,
        "oy": 4
      },
      {
        "id": "tile_hospital_iv_stand",
        "c": 14,
        "r": 3,
        "layer": "object",
        "ox": 16,
        "oy": -18
      },
      {
        "id": "tile_hospital_iv_stand",
        "c": 9,
        "r": 3,
        "layer": "object",
        "ox": 16,
        "oy": -18
      },
      {
        "id": "tile_hospital_bedside_cabinet",
        "c": 6,
        "r": 3,
        "layer": "ground3",
        "ox": 20,
        "oy": 18
      },
      {
        "id": "tile_hospital_bedside_cabinet",
        "c": 11,
        "r": 3,
        "layer": "ground3",
        "ox": 20,
        "oy": 18
      },
      {
        "id": "tile_hospital_waiting_bench_side",
        "c": 6,
        "r": 5,
        "layer": "object",
        "ox": -14,
        "oy": -16
      },
      {
        "id": "tile_hospital_waiting_bench_side",
        "c": 11,
        "r": 5,
        "layer": "object",
        "ox": -14,
        "oy": -16
      },
      {
        "id": "tile_counseling_load_monitor",
        "c": 14,
        "r": 5,
        "layer": "object2"
      },
      {
        "id": "tile_counseling_load_monitor",
        "c": 9,
        "r": 5,
        "layer": "object2"
      },
      {
        "id": "tile_counseling_load_monitor",
        "c": 4,
        "r": 5,
        "layer": "object2"
      },
      {
        "id": "tile_hospital_waiting_bench_side",
        "c": 1,
        "r": 12,
        "layer": "object",
        "ox": -6,
        "oy": -8
      },
      {
        "id": "tile_hospital_waiting_bench_side",
        "c": 6,
        "r": 12,
        "layer": "object",
        "ox": -14,
        "oy": -8
      },
      {
        "id": "tile_hospital_hospital_bed_no_pillow",
        "c": 2,
        "r": 13,
        "layer": "object",
        "ox": 20,
        "oy": 0
      },
      {
        "id": "tile_hospital_hospital_bed_no_pillow",
        "c": 7,
        "r": 13,
        "layer": "object",
        "ox": 14,
        "oy": 0
      },
      {
        "id": "tile_hospital_iv_stand_with_board",
        "c": 9,
        "r": 13,
        "layer": "object",
        "ox": -8,
        "oy": -10
      },
      {
        "id": "tile_hospital_iv_stand_with_board",
        "c": 4,
        "r": 13,
        "layer": "object",
        "ox": -4,
        "oy": -10
      },
      {
        "id": "tile_hospital_bedside_cabinet_back",
        "c": 6,
        "r": 14,
        "layer": "object2",
        "ox": 10,
        "oy": 0
      },
      {
        "id": "tile_hospital_bedside_cabinet_back",
        "c": 1,
        "r": 14,
        "layer": "object2",
        "ox": 18,
        "oy": 0
      },
      {
        "id": "tile_hospital_armchair_front",
        "c": 19,
        "r": 8,
        "layer": "object"
      },
      {
        "id": "tile_hospital_plant_on_stool",
        "c": 19,
        "r": 9,
        "layer": "object2"
      },
      {
        "id": "tile_hospital_armchair_back",
        "c": 19,
        "r": 10,
        "layer": "object3"
      },
      {
        "id": "tile_containment_tall_cabinet",
        "c": 16,
        "r": 3,
        "layer": "object",
        "ox": -8,
        "oy": -14,
        "sortDepth": 2.5
      },
      {
        "id": "tile_containment_tall_cabinet",
        "c": 17,
        "r": 3,
        "layer": "object",
        "ox": -2,
        "oy": -14,
        "sortDepth": 2.25
      },
      {
        "id": "tile_hospital_ward_floor_tile",
        "c": 19,
        "r": 5,
        "layer": "floor",
        "ox": 0,
        "oy": 0
      },
      {
        "id": "tile_mu5e3ndv",
        "c": 20,
        "r": 1,
        "layer": "object2"
      },
      {
        "id": "tile_mu5e3ndv",
        "c": 20,
        "r": 12,
        "layer": "top"
      },
      {
        "id": "tile_containment_tall_cabinet",
        "c": 18,
        "r": 3,
        "layer": "object",
        "ox": 4,
        "oy": -14,
        "sortDepth": 2.5
      },
      {
        "id": "tile_eoc_security_door",
        "c": 16,
        "r": 14,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_eoc_security_door",
        "c": 17,
        "r": 14,
        "layer": "floor"
      }
    ],
    "solid": [
      "19,4",
      "18,4",
      "17,4",
      "16,4",
      "15,4",
      "14,4",
      "13,4",
      "12,4",
      "11,4",
      "10,4",
      "9,4",
      "8,4",
      "7,4",
      "6,4",
      "5,4",
      "4,4",
      "3,4",
      "2,4",
      "1,4",
      "0,5",
      "0,6",
      "0,7",
      "0,4",
      "0,8",
      "0,9",
      "0,10",
      "0,11",
      "0,12",
      "0,13",
      "0,14",
      "0,15",
      "4,5",
      "5,5",
      "4,6",
      "5,6",
      "9,5",
      "10,5",
      "9,6",
      "10,6",
      "15,5",
      "14,6",
      "15,6",
      "14,5",
      "1,15",
      "2,15",
      "5,15",
      "3,15",
      "4,15",
      "6,15",
      "7,15",
      "8,15",
      "10,15",
      "9,15",
      "9,14",
      "10,14",
      "5,14",
      "4,14",
      "20,4",
      "20,5",
      "20,6",
      "20,7",
      "20,8",
      "20,9",
      "20,10",
      "20,11",
      "20,12",
      "20,13",
      "20,14",
      "20,15",
      "5,13",
      "5,12",
      "5,11",
      "10,11",
      "10,13",
      "10,12",
      "15,7",
      "15,8",
      "10,8",
      "10,7",
      "5,7",
      "5,8"
    ],
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
    "safe": true,
    "npcs": false,
    "portals": [
      {
        "c": 16,
        "r": 15,
        "to": "map_musbsgj3"
      },
      {
        "c": 17,
        "r": 15,
        "to": "map_musbsgj3"
      }
    ],
    "cols": 22,
    "rows": 16,
    "spawnZone": []
  },
  {
    "id": "map_mussl5gx",
    "name": "B-4收容觀察室",
    "desc": "",
    "layers": {
      "floor": {
        "16,10": "tile_containment_floor_tile",
        "17,10": "tile_containment_floor_tile",
        "18,11": "tile_containment_floor_tile",
        "0,2": "tile_containment_floor_tile",
        "0,3": "tile_containment_floor_tile",
        "0,4": "tile_containment_floor_tile",
        "0,5": "tile_containment_floor_tile",
        "0,6": "tile_containment_floor_tile",
        "0,7": "tile_containment_floor_tile",
        "0,8": "tile_containment_floor_tile",
        "0,9": "tile_containment_floor_tile",
        "0,10": "tile_containment_floor_tile",
        "0,11": "tile_containment_floor_tile",
        "0,12": "tile_containment_floor_tile",
        "0,13": "tile_containment_floor_tile",
        "0,14": "tile_containment_floor_tile",
        "1,2": "tile_containment_floor_tile",
        "1,3": "tile_containment_floor_tile",
        "1,4": "tile_containment_floor_tile",
        "1,5": "tile_containment_floor_tile",
        "1,6": "tile_containment_floor_tile",
        "1,7": "tile_containment_floor_tile",
        "1,8": "tile_containment_floor_tile",
        "1,9": "tile_containment_floor_tile",
        "1,10": "tile_containment_floor_tile",
        "1,11": "tile_containment_floor_tile",
        "1,12": "tile_containment_floor_tile",
        "1,13": "tile_containment_floor_tile",
        "1,14": "tile_containment_floor_tile",
        "2,2": "tile_containment_floor_tile",
        "2,3": "tile_containment_floor_tile",
        "2,4": "tile_containment_floor_tile",
        "2,5": "tile_containment_floor_tile",
        "2,6": "tile_containment_floor_tile",
        "2,7": "tile_containment_floor_tile",
        "2,8": "tile_containment_floor_tile",
        "2,9": "tile_containment_floor_tile",
        "2,10": "tile_containment_floor_tile",
        "2,11": "tile_containment_floor_tile",
        "2,12": "tile_containment_floor_tile",
        "2,13": "tile_containment_floor_tile",
        "2,14": "tile_containment_floor_tile",
        "3,2": "tile_containment_floor_tile",
        "3,3": "tile_containment_floor_tile",
        "3,4": "tile_containment_floor_tile",
        "3,5": "tile_containment_floor_tile",
        "3,6": "tile_containment_floor_tile",
        "3,7": "tile_containment_floor_tile",
        "3,8": "tile_containment_floor_tile",
        "3,9": "tile_containment_floor_tile",
        "3,10": "tile_containment_floor_tile",
        "3,11": "tile_containment_floor_tile",
        "3,12": "tile_containment_floor_tile",
        "3,13": "tile_containment_floor_tile",
        "3,14": "tile_containment_floor_tile",
        "4,2": "tile_containment_floor_tile",
        "4,3": "tile_containment_floor_tile",
        "4,4": "tile_containment_floor_tile",
        "4,5": "tile_containment_floor_tile",
        "4,6": "tile_containment_floor_tile",
        "4,7": "tile_containment_floor_tile",
        "4,8": "tile_containment_floor_tile",
        "4,9": "tile_containment_floor_tile",
        "4,10": "tile_containment_floor_tile",
        "4,11": "tile_containment_floor_tile",
        "4,12": "tile_containment_floor_tile",
        "4,13": "tile_containment_floor_tile",
        "4,14": "tile_containment_floor_tile",
        "5,2": "tile_containment_floor_tile",
        "5,3": "tile_containment_floor_tile",
        "5,4": "tile_containment_floor_tile",
        "5,5": "tile_containment_floor_tile",
        "5,6": "tile_containment_floor_tile",
        "5,7": "tile_containment_floor_tile",
        "5,8": "tile_containment_floor_tile",
        "5,9": "tile_containment_floor_tile",
        "5,10": "tile_containment_floor_tile",
        "5,11": "tile_containment_floor_tile",
        "5,12": "tile_containment_floor_tile",
        "5,13": "tile_containment_floor_tile",
        "5,14": "tile_containment_floor_tile",
        "6,2": "tile_containment_floor_tile",
        "6,3": "tile_containment_floor_tile",
        "6,4": "tile_containment_floor_tile",
        "6,5": "tile_containment_floor_tile",
        "6,6": "tile_containment_floor_tile",
        "6,7": "tile_containment_floor_tile",
        "6,8": "tile_containment_floor_tile",
        "6,9": "tile_containment_floor_tile",
        "6,10": "tile_containment_floor_tile",
        "6,11": "tile_containment_floor_tile",
        "6,12": "tile_containment_floor_tile",
        "6,13": "tile_containment_floor_tile",
        "6,14": "tile_containment_floor_tile",
        "7,2": "tile_containment_floor_tile",
        "7,3": "tile_containment_floor_tile",
        "7,4": "tile_containment_floor_tile",
        "7,5": "tile_containment_floor_tile",
        "7,6": "tile_containment_floor_tile",
        "7,7": "tile_containment_floor_tile",
        "7,8": "tile_containment_floor_tile",
        "7,9": "tile_containment_floor_tile",
        "7,10": "tile_containment_floor_tile",
        "7,11": "tile_containment_floor_tile",
        "7,12": "tile_containment_floor_tile",
        "7,13": "tile_containment_floor_tile",
        "7,14": "tile_containment_floor_tile",
        "8,2": "tile_containment_floor_tile",
        "8,3": "tile_containment_floor_tile",
        "8,4": "tile_containment_floor_tile",
        "8,5": "tile_containment_floor_tile",
        "8,6": "tile_containment_floor_tile",
        "8,7": "tile_containment_floor_tile",
        "8,8": "tile_containment_floor_tile",
        "8,9": "tile_containment_floor_tile",
        "8,10": "tile_containment_floor_tile",
        "8,11": "tile_containment_floor_tile",
        "8,12": "tile_containment_floor_tile",
        "8,13": "tile_containment_floor_tile",
        "8,14": "tile_containment_floor_tile",
        "9,2": "tile_containment_floor_tile",
        "9,3": "tile_containment_floor_tile",
        "9,4": "tile_containment_floor_tile",
        "9,5": "tile_containment_floor_tile",
        "9,6": "tile_containment_floor_tile",
        "9,7": "tile_containment_floor_tile",
        "9,8": "tile_containment_floor_tile",
        "9,9": "tile_containment_floor_tile",
        "9,10": "tile_containment_floor_tile",
        "9,11": "tile_containment_floor_tile",
        "9,12": "tile_containment_floor_tile",
        "9,13": "tile_containment_floor_tile",
        "9,14": "tile_containment_floor_tile",
        "10,2": "tile_containment_floor_tile",
        "10,3": "tile_containment_floor_tile",
        "10,4": "tile_containment_floor_tile",
        "10,5": "tile_containment_floor_tile",
        "10,6": "tile_containment_floor_tile",
        "10,7": "tile_containment_floor_tile",
        "10,8": "tile_containment_floor_tile",
        "10,9": "tile_containment_floor_tile",
        "10,10": "tile_containment_floor_tile",
        "10,11": "tile_containment_floor_tile",
        "10,12": "tile_containment_floor_tile",
        "10,13": "tile_containment_floor_tile",
        "10,14": "tile_containment_floor_tile",
        "11,2": "tile_containment_floor_tile",
        "11,3": "tile_containment_floor_tile",
        "11,4": "tile_containment_floor_tile",
        "11,5": "tile_containment_floor_tile",
        "11,6": "tile_containment_floor_tile",
        "11,7": "tile_containment_floor_tile",
        "11,8": "tile_containment_floor_tile",
        "11,9": "tile_containment_floor_tile",
        "11,10": "tile_containment_floor_tile",
        "11,11": "tile_containment_floor_tile",
        "11,12": "tile_containment_floor_tile",
        "11,13": "tile_containment_floor_tile",
        "11,14": "tile_containment_floor_tile",
        "12,2": "tile_containment_floor_tile",
        "12,3": "tile_containment_floor_tile",
        "12,4": "tile_containment_floor_tile",
        "12,5": "tile_containment_floor_tile",
        "12,6": "tile_containment_floor_tile",
        "12,7": "tile_containment_floor_tile",
        "12,8": "tile_containment_floor_tile",
        "12,9": "tile_containment_floor_tile",
        "12,10": "tile_containment_floor_tile",
        "12,11": "tile_containment_floor_tile",
        "12,12": "tile_containment_floor_tile",
        "12,13": "tile_containment_floor_tile",
        "12,14": "tile_containment_floor_tile",
        "13,2": "tile_containment_floor_tile",
        "13,3": "tile_containment_floor_tile",
        "13,4": "tile_containment_floor_tile",
        "13,5": "tile_containment_floor_tile",
        "13,6": "tile_containment_floor_tile",
        "13,7": "tile_containment_floor_tile",
        "13,8": "tile_containment_floor_tile",
        "13,9": "tile_containment_floor_tile",
        "13,10": "tile_containment_floor_tile",
        "13,11": "tile_containment_floor_tile",
        "13,12": "tile_containment_floor_tile",
        "13,13": "tile_containment_floor_tile",
        "13,14": "tile_containment_floor_tile",
        "14,2": "tile_containment_floor_tile",
        "14,3": "tile_containment_floor_tile",
        "14,4": "tile_containment_floor_tile",
        "14,5": "tile_containment_floor_tile",
        "14,6": "tile_containment_floor_tile",
        "14,7": "tile_containment_floor_tile",
        "14,8": "tile_containment_floor_tile",
        "14,9": "tile_containment_floor_tile",
        "14,10": "tile_containment_floor_tile",
        "14,11": "tile_containment_floor_tile",
        "14,12": "tile_containment_floor_tile",
        "14,13": "tile_containment_floor_tile",
        "14,14": "tile_containment_floor_tile",
        "15,2": "tile_containment_floor_tile",
        "15,3": "tile_containment_floor_tile",
        "15,4": "tile_containment_floor_tile",
        "15,5": "tile_containment_floor_tile",
        "15,6": "tile_containment_floor_tile",
        "15,7": "tile_containment_floor_tile",
        "15,8": "tile_containment_floor_tile",
        "15,9": "tile_containment_floor_tile",
        "15,11": "tile_containment_floor_tile",
        "15,12": "tile_containment_floor_tile",
        "15,13": "tile_containment_floor_tile",
        "15,14": "tile_containment_floor_tile",
        "16,2": "tile_containment_floor_tile",
        "16,3": "tile_containment_floor_tile",
        "16,4": "tile_containment_floor_tile",
        "16,5": "tile_containment_floor_tile",
        "16,6": "tile_containment_floor_tile",
        "16,7": "tile_containment_floor_tile",
        "16,8": "tile_containment_floor_tile",
        "16,9": "tile_containment_floor_tile",
        "16,11": "tile_containment_floor_tile",
        "16,12": "tile_containment_floor_tile",
        "16,13": "tile_containment_floor_tile",
        "16,14": "tile_containment_floor_tile",
        "17,2": "tile_containment_floor_tile",
        "17,3": "tile_containment_floor_tile",
        "17,4": "tile_containment_floor_tile",
        "17,5": "tile_containment_floor_tile",
        "17,6": "tile_containment_floor_tile",
        "17,7": "tile_containment_floor_tile",
        "17,8": "tile_containment_floor_tile",
        "17,9": "tile_containment_floor_tile",
        "17,11": "tile_containment_floor_tile",
        "17,12": "tile_containment_floor_tile",
        "17,13": "tile_containment_floor_tile",
        "17,14": "tile_containment_floor_tile",
        "18,2": "tile_containment_floor_tile",
        "18,3": "tile_containment_floor_tile",
        "18,4": "tile_containment_floor_tile",
        "18,5": "tile_containment_floor_tile",
        "18,6": "tile_containment_floor_tile",
        "18,7": "tile_containment_floor_tile",
        "18,8": "tile_containment_floor_tile",
        "18,9": "tile_containment_floor_tile",
        "18,10": "tile_containment_floor_tile",
        "18,12": "tile_containment_floor_tile",
        "18,13": "tile_containment_floor_tile",
        "18,14": "tile_containment_floor_tile",
        "19,2": "tile_containment_floor_tile",
        "19,3": "tile_containment_floor_tile",
        "19,4": "tile_containment_floor_tile",
        "19,5": "tile_containment_floor_tile",
        "19,6": "tile_containment_floor_tile",
        "19,7": "tile_containment_floor_tile",
        "19,8": "tile_containment_floor_tile",
        "19,9": "tile_containment_floor_tile",
        "19,10": "tile_containment_floor_tile",
        "19,12": "tile_containment_floor_tile",
        "19,13": "tile_containment_floor_tile",
        "19,11": "tile_containment_floor_tile",
        "19,14": "tile_containment_floor_tile",
        "20,2": "tile_containment_floor_tile",
        "20,3": "tile_containment_floor_tile",
        "20,4": "tile_containment_floor_tile",
        "20,5": "tile_containment_floor_tile",
        "20,6": "tile_containment_floor_tile",
        "20,7": "tile_containment_floor_tile",
        "20,8": "tile_containment_floor_tile",
        "20,9": "tile_containment_floor_tile",
        "20,10": "tile_containment_floor_tile",
        "20,11": "tile_containment_floor_tile",
        "20,12": "tile_containment_floor_tile",
        "20,13": "tile_containment_floor_tile",
        "20,14": "tile_containment_floor_tile",
        "21,2": "tile_containment_floor_tile",
        "21,3": "tile_containment_floor_tile",
        "21,4": "tile_containment_floor_tile",
        "21,5": "tile_containment_floor_tile",
        "21,6": "tile_containment_floor_tile",
        "21,7": "tile_containment_floor_tile",
        "21,8": "tile_containment_floor_tile",
        "21,9": "tile_containment_floor_tile",
        "21,10": "tile_containment_floor_tile",
        "21,11": "tile_containment_floor_tile",
        "21,12": "tile_containment_floor_tile",
        "21,13": "tile_containment_floor_tile",
        "21,14": "tile_containment_floor_tile",
        "22,2": "tile_containment_floor_tile",
        "22,3": "tile_containment_floor_tile",
        "22,4": "tile_containment_floor_tile",
        "22,5": "tile_containment_floor_tile",
        "22,6": "tile_containment_floor_tile",
        "22,7": "tile_containment_floor_tile",
        "22,8": "tile_containment_floor_tile",
        "22,9": "tile_containment_floor_tile",
        "22,10": "tile_containment_floor_tile",
        "22,11": "tile_containment_floor_tile",
        "22,12": "tile_containment_floor_tile",
        "22,13": "tile_containment_floor_tile",
        "22,14": "tile_containment_floor_tile",
        "23,2": "tile_containment_floor_tile",
        "23,3": "tile_containment_floor_tile",
        "23,4": "tile_containment_floor_tile",
        "23,5": "tile_containment_floor_tile",
        "23,6": "tile_containment_floor_tile",
        "23,7": "tile_containment_floor_tile",
        "23,8": "tile_containment_floor_tile",
        "23,9": "tile_containment_floor_tile",
        "23,10": "tile_containment_floor_tile",
        "23,11": "tile_containment_floor_tile",
        "23,12": "tile_containment_floor_tile",
        "23,13": "tile_containment_floor_tile",
        "23,14": "tile_containment_floor_tile",
        "24,2": "tile_containment_floor_tile",
        "24,3": "tile_containment_floor_tile",
        "24,4": "tile_containment_floor_tile",
        "24,5": "tile_containment_floor_tile",
        "24,6": "tile_containment_floor_tile",
        "24,7": "tile_containment_floor_tile",
        "24,8": "tile_containment_floor_tile",
        "24,9": "tile_containment_floor_tile",
        "24,10": "tile_containment_floor_tile",
        "24,11": "tile_containment_floor_tile",
        "24,12": "tile_containment_floor_tile",
        "24,13": "tile_containment_floor_tile",
        "24,14": "tile_containment_floor_tile",
        "25,2": "tile_containment_floor_tile",
        "25,3": "tile_containment_floor_tile",
        "25,4": "tile_containment_floor_tile",
        "25,5": "tile_containment_floor_tile",
        "25,6": "tile_containment_floor_tile",
        "25,7": "tile_containment_floor_tile",
        "25,8": "tile_containment_floor_tile",
        "25,9": "tile_containment_floor_tile",
        "25,10": "tile_containment_floor_tile",
        "25,11": "tile_containment_floor_tile",
        "25,12": "tile_containment_floor_tile",
        "25,13": "tile_containment_floor_tile",
        "25,14": "tile_containment_floor_tile",
        "15,10": "tile_containment_floor_tile"
      },
      "ground": {},
      "ground2": {
        "0,7": "tile_containment_wall_top_straight",
        "0,8": "tile_containment_wall_top_straight"
      },
      "ground3": {
        "4,7": "tile_containment_wall_top_straight",
        "4,8": "tile_containment_wall_top_straight",
        "10,6": "tile_containment_wall_top_straight",
        "10,7": "tile_containment_wall_top_straight",
        "10,8": "tile_containment_wall_top_straight"
      },
      "object": {
        "24,2": "tile_eoc_security_camera"
      },
      "object2": {
        "4,8": "tile_containment_wall_top_straight",
        "4,9": "tile_containment_wall_top_straight",
        "10,8": "tile_containment_wall_top_straight",
        "10,9": "tile_containment_wall_top_straight",
        "14,9": "tile_containment_wall_top_straight",
        "20,8": "tile_containment_wall_top_straight",
        "20,9": "tile_containment_wall_top_straight",
        "14,8": "tile_containment_wall_top_straight"
      },
      "object3": {},
      "object4": {},
      "overlay": {},
      "top": {
        "14,2": "tile_containment_wall_top_straight",
        "14,3": "tile_containment_wall_top_straight",
        "14,4": "tile_containment_wall_top_straight",
        "14,5": "tile_containment_wall_top_straight",
        "14,6": "tile_containment_wall_top_straight",
        "14,7": "tile_containment_wall_top_straight",
        "10,2": "tile_containment_wall_top_straight",
        "10,3": "tile_containment_wall_top_straight",
        "10,4": "tile_containment_wall_top_straight",
        "10,5": "tile_containment_wall_top_straight",
        "4,2": "tile_containment_wall_top_straight",
        "4,3": "tile_containment_wall_top_straight",
        "4,4": "tile_containment_wall_top_straight",
        "4,5": "tile_containment_wall_top_straight",
        "4,6": "tile_containment_wall_top_straight",
        "0,2": "tile_containment_wall_top_straight",
        "0,3": "tile_containment_wall_top_straight",
        "0,4": "tile_containment_wall_top_straight",
        "0,5": "tile_containment_wall_top_straight",
        "0,6": "tile_containment_wall_top_straight"
      }
    },
    "stamps": [
      {
        "id": "tile_containment_wall",
        "c": 1,
        "r": 1,
        "layer": "ground"
      },
      {
        "id": "tile_containment_wall",
        "c": 2,
        "r": 1,
        "layer": "ground"
      },
      {
        "id": "tile_containment_wall",
        "c": 3,
        "r": 1,
        "layer": "ground"
      },
      {
        "id": "tile_containment_wall",
        "c": 4,
        "r": 1,
        "layer": "ground"
      },
      {
        "id": "tile_containment_wall",
        "c": 5,
        "r": 1,
        "layer": "ground"
      },
      {
        "id": "tile_containment_wall",
        "c": 6,
        "r": 1,
        "layer": "ground"
      },
      {
        "id": "tile_containment_wall",
        "c": 7,
        "r": 1,
        "layer": "ground"
      },
      {
        "id": "tile_containment_wall",
        "c": 8,
        "r": 1,
        "layer": "ground"
      },
      {
        "id": "tile_containment_wall",
        "c": 9,
        "r": 1,
        "layer": "ground"
      },
      {
        "id": "tile_containment_wall",
        "c": 10,
        "r": 1,
        "layer": "ground"
      },
      {
        "id": "tile_containment_wall",
        "c": 11,
        "r": 1,
        "layer": "ground"
      },
      {
        "id": "tile_containment_wall",
        "c": 12,
        "r": 1,
        "layer": "ground"
      },
      {
        "id": "tile_containment_wall",
        "c": 13,
        "r": 1,
        "layer": "ground"
      },
      {
        "id": "tile_containment_wall",
        "c": 14,
        "r": 1,
        "layer": "ground"
      },
      {
        "id": "tile_containment_wall",
        "c": 15,
        "r": 1,
        "layer": "ground"
      },
      {
        "id": "tile_containment_wall",
        "c": 16,
        "r": 1,
        "layer": "ground"
      },
      {
        "id": "tile_containment_wall",
        "c": 17,
        "r": 1,
        "layer": "ground"
      },
      {
        "id": "tile_containment_wall",
        "c": 18,
        "r": 1,
        "layer": "ground"
      },
      {
        "id": "tile_containment_wall",
        "c": 19,
        "r": 1,
        "layer": "ground"
      },
      {
        "id": "tile_containment_wall_top_corner",
        "c": 0,
        "r": 1,
        "layer": "top",
        "ox": 0,
        "oy": 2
      },
      {
        "id": "tile_containment_tall_cabinet",
        "c": 8,
        "r": 3,
        "layer": "object",
        "ox": 18,
        "oy": 0
      },
      {
        "id": "tile_containment_table",
        "c": 7,
        "r": 4,
        "layer": "object",
        "ox": -14,
        "oy": -4
      },
      {
        "id": "tile_containment_equipment_cabinets",
        "c": 9,
        "r": 6,
        "layer": "object",
        "ox": -20,
        "oy": -12
      },
      {
        "id": "tile_dorm_bed_vertical",
        "c": 5,
        "r": 4,
        "layer": "object",
        "ox": -10,
        "oy": -16
      },
      {
        "id": "tile_containment_glass_door",
        "c": 5,
        "r": 7,
        "layer": "object3"
      },
      {
        "id": "tile_eoc_security_camera",
        "c": 5,
        "r": 2,
        "layer": "object2",
        "fx": true
      },
      {
        "id": "tile_containment_medical_monitor_cart",
        "c": 5,
        "r": 6,
        "layer": "object2",
        "ox": -8,
        "oy": 0,
        "sortDepth": 2.5
      },
      {
        "id": "tile_dorm_desk_lamp",
        "c": 7,
        "r": 4,
        "layer": "object2",
        "ox": -10,
        "oy": -10
      },
      {
        "id": "tile_eoc_pen_holder",
        "c": 8,
        "r": 4,
        "layer": "object2",
        "ox": -14,
        "oy": -8
      },
      {
        "id": "tile_eoc_book_stack",
        "c": 7,
        "r": 5,
        "layer": "object2",
        "ox": 4,
        "oy": -32
      },
      {
        "id": "tile_restaurant_water_dispenser_01",
        "c": 7,
        "r": 5,
        "layer": "object3",
        "ox": 6,
        "oy": -14
      },
      {
        "id": "tile_mu5e3ndv",
        "c": 0,
        "r": 8,
        "layer": "object3"
      },
      {
        "id": "tile_new_decor_fire_extinguisher",
        "c": 13,
        "r": 5,
        "layer": "object4",
        "fx": true
      },
      {
        "id": "tile_containment_glass_door",
        "c": 15,
        "r": 7,
        "layer": "object4",
        "fx": true
      },
      {
        "id": "tile_containment_floor_tile",
        "c": 19,
        "r": 11,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_containment_floor_tile",
        "c": 20,
        "r": 11,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_containment_floor_tile",
        "c": 21,
        "r": 11,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_containment_floor_tile",
        "c": 22,
        "r": 11,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_containment_floor_tile",
        "c": 23,
        "r": 11,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_containment_floor_tile",
        "c": 25,
        "r": 12,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_containment_floor_tile",
        "c": 24,
        "r": 13,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_containment_floor_tile",
        "c": 19,
        "r": 14,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_containment_floor_tile",
        "c": 20,
        "r": 14,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_containment_floor_tile",
        "c": 21,
        "r": 14,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_containment_floor_tile",
        "c": 22,
        "r": 14,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_containment_floor_tile",
        "c": 23,
        "r": 14,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_containment_floor_tile",
        "c": 24,
        "r": 14,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_containment_floor_tile",
        "c": 25,
        "r": 14,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_containment_floor_tile",
        "c": 25,
        "r": 13,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_containment_floor_tile",
        "c": 24,
        "r": 12,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_containment_floor_tile",
        "c": 24,
        "r": 11,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_containment_floor_tile",
        "c": 24,
        "r": 10,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_containment_floor_tile",
        "c": 24,
        "r": 9,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_containment_floor_tile",
        "c": 24,
        "r": 8,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_containment_floor_tile",
        "c": 24,
        "r": 7,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_containment_floor_tile",
        "c": 24,
        "r": 6,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_containment_wall",
        "c": 20,
        "r": 1,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_containment_wall",
        "c": 21,
        "r": 1,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_containment_wall",
        "c": 22,
        "r": 1,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_containment_wall",
        "c": 23,
        "r": 1,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_containment_wall",
        "c": 24,
        "r": 1,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_containment_wall",
        "c": 25,
        "r": 1,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_containment_wall_top_straight",
        "c": 20,
        "r": 2,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_containment_wall_top_straight",
        "c": 20,
        "r": 3,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_containment_wall_top_straight",
        "c": 20,
        "r": 4,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_containment_wall_top_straight",
        "c": 20,
        "r": 5,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_containment_wall_top_straight",
        "c": 20,
        "r": 6,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_containment_wall_top_straight",
        "c": 20,
        "r": 7,
        "layer": "ground2",
        "fx": true
      },
      {
        "id": "tile_eoc_security_camera",
        "c": 15,
        "r": 2,
        "layer": "ground2",
        "fx": true
      },
      {
        "id": "tile_mufxoi3i",
        "c": 22,
        "r": 2,
        "layer": "object",
        "fx": false,
        "ox": -16,
        "oy": 0
      },
      {
        "id": "tile_mufxpxnl",
        "c": 23,
        "r": 2,
        "layer": "object3",
        "ox": -20,
        "oy": -4
      },
      {
        "id": "tile_containment_wall_top_corner",
        "c": 25,
        "r": 1,
        "layer": "top",
        "fx": true,
        "ox": 0,
        "oy": 2
      },
      {
        "id": "tile_containment_wall_top_straight",
        "c": 25,
        "r": 2,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_containment_wall_top_straight",
        "c": 25,
        "r": 3,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_containment_wall_top_straight",
        "c": 25,
        "r": 4,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_containment_wall_top_straight",
        "c": 25,
        "r": 5,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_containment_wall_top_straight",
        "c": 25,
        "r": 6,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_containment_wall_top_straight",
        "c": 25,
        "r": 7,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_containment_wall_top_straight",
        "c": 25,
        "r": 8,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_containment_wall_top_straight",
        "c": 25,
        "r": 9,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_containment_wall_top_straight",
        "c": 25,
        "r": 10,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_containment_wall_top_straight",
        "c": 25,
        "r": 11,
        "layer": "ground2",
        "fx": true
      },
      {
        "id": "tile_containment_wall_top_straight",
        "c": 25,
        "r": 12,
        "layer": "ground2",
        "fx": true
      },
      {
        "id": "tile_containment_wall_top_straight",
        "c": 25,
        "r": 13,
        "layer": "ground2",
        "fx": true
      },
      {
        "id": "tile_containment_wall_top_straight",
        "c": 25,
        "r": 14,
        "layer": "ground2",
        "fx": true
      },
      {
        "id": "tile_mu5e3ndv",
        "c": 25,
        "r": 11,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_eoc_hydrant_red",
        "c": 12,
        "r": 3,
        "layer": "object",
        "ox": -18,
        "oy": 0
      },
      {
        "id": "tile_eoc_drawer_unit",
        "c": 17,
        "r": 4,
        "layer": "object",
        "ox": -24,
        "oy": -18
      },
      {
        "id": "tile_mu5e3ndv",
        "c": 4,
        "r": 8,
        "layer": "object4"
      },
      {
        "id": "tile_mu5e3ndv",
        "c": 10,
        "r": 8,
        "layer": "object4"
      },
      {
        "id": "tile_mu5e3ndv",
        "c": 14,
        "r": 8,
        "layer": "object4"
      },
      {
        "id": "tile_mu5e3ndv",
        "c": 20,
        "r": 8,
        "layer": "object4"
      },
      {
        "id": "tile_new_decor_exit_sign",
        "c": 20,
        "r": 9,
        "layer": "overlay",
        "fx": true
      },
      {
        "id": "tile_new_decor_exit_sign",
        "c": 0,
        "r": 9,
        "layer": "overlay",
        "fx": true
      },
      {
        "id": "tile_eoc_pillar",
        "c": 24,
        "r": 10,
        "layer": "object3",
        "fx": true,
        "ox": 8,
        "oy": 0
      },
      {
        "id": "tile_counseling_load_monitor",
        "c": 18,
        "r": 4,
        "layer": "overlay",
        "fx": true,
        "ox": -46,
        "oy": -8
      },
      {
        "id": "tile_eoc_locker",
        "c": 1,
        "r": 3,
        "layer": "object",
        "fx": true
      },
      {
        "id": "tile_eoc_locker",
        "c": 2,
        "r": 3,
        "layer": "object",
        "fx": true,
        "ox": -6,
        "oy": 0
      },
      {
        "id": "tile_eoc_locker",
        "c": 3,
        "r": 3,
        "layer": "object",
        "fx": true,
        "ox": -12,
        "oy": 0
      },
      {
        "id": "tile_eoc_first_aid_bag",
        "c": 1,
        "r": 3,
        "layer": "object2",
        "ox": 4,
        "oy": 6
      },
      {
        "id": "tile_dorm_bed_vertical",
        "c": 15,
        "r": 3,
        "layer": "object",
        "ox": -10,
        "oy": 20,
        "sortDepth": 3.5
      }
    ],
    "solid": [
      "4,9",
      "4,10",
      "4,8",
      "4,7",
      "4,6",
      "4,5",
      "4,3",
      "4,2",
      "5,4",
      "6,4",
      "7,4",
      "8,4",
      "9,4",
      "9,5",
      "10,2",
      "10,3",
      "10,4",
      "10,5",
      "10,6",
      "10,7",
      "10,8",
      "10,9",
      "10,10",
      "9,8",
      "9,6",
      "9,7",
      "5,8",
      "3,4",
      "2,4",
      "1,4",
      "0,5",
      "0,6",
      "0,7",
      "0,8",
      "0,9",
      "0,10",
      "0,11",
      "0,12",
      "0,13",
      "0,14",
      "11,4",
      "12,4",
      "13,4",
      "14,4",
      "15,4",
      "16,4",
      "17,4",
      "18,4",
      "19,4",
      "20,4",
      "21,4",
      "24,4",
      "25,4",
      "20,5",
      "20,6",
      "20,7",
      "20,8",
      "20,9",
      "14,5",
      "14,6",
      "14,7",
      "14,8",
      "14,9",
      "14,10",
      "20,10",
      "25,5",
      "25,6",
      "25,7",
      "25,8",
      "25,9",
      "25,10",
      "25,11",
      "25,12",
      "25,13",
      "25,14",
      "4,11",
      "10,11",
      "14,11",
      "20,11",
      "0,4",
      "4,4",
      "1,5",
      "2,5",
      "3,5",
      "9,9",
      "8,9",
      "7,9",
      "6,9",
      "5,9",
      "19,9",
      "15,9",
      "16,9",
      "18,9",
      "17,9"
    ],
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
    "safe": true,
    "npcs": false,
    "portals": [],
    "cols": 26,
    "rows": 15,
    "spawnZone": []
  },
  {
    "id": "map_musu0dlp",
    "name": "B-3",
    "desc": "",
    "layers": {
      "floor": {
        "10,9": "tile_containment_floor_tile",
        "11,9": "tile_containment_floor_tile",
        "12,9": "tile_containment_floor_tile",
        "0,2": "tile_containment_floor_tile",
        "0,3": "tile_containment_floor_tile",
        "0,4": "tile_containment_floor_tile",
        "0,5": "tile_containment_floor_tile",
        "0,6": "tile_containment_floor_tile",
        "0,7": "tile_containment_floor_tile",
        "0,8": "tile_containment_floor_tile",
        "0,9": "tile_containment_floor_tile",
        "1,2": "tile_containment_floor_tile",
        "1,3": "tile_containment_floor_tile",
        "1,4": "tile_containment_floor_tile",
        "1,5": "tile_containment_floor_tile",
        "1,6": "tile_containment_floor_tile",
        "1,7": "tile_containment_floor_tile",
        "1,8": "tile_containment_floor_tile",
        "1,9": "tile_containment_floor_tile",
        "2,2": "tile_containment_floor_tile",
        "2,3": "tile_containment_floor_tile",
        "2,4": "tile_containment_floor_tile",
        "2,5": "tile_containment_floor_tile",
        "2,6": "tile_containment_floor_tile",
        "2,7": "tile_containment_floor_tile",
        "2,8": "tile_containment_floor_tile",
        "2,9": "tile_containment_floor_tile",
        "3,2": "tile_containment_floor_tile",
        "3,3": "tile_containment_floor_tile",
        "3,4": "tile_containment_floor_tile",
        "3,5": "tile_containment_floor_tile",
        "3,6": "tile_containment_floor_tile",
        "3,7": "tile_containment_floor_tile",
        "3,8": "tile_containment_floor_tile",
        "3,9": "tile_containment_floor_tile",
        "4,2": "tile_containment_floor_tile",
        "4,3": "tile_containment_floor_tile",
        "4,4": "tile_containment_floor_tile",
        "4,5": "tile_containment_floor_tile",
        "4,6": "tile_containment_floor_tile",
        "4,7": "tile_containment_floor_tile",
        "4,8": "tile_containment_floor_tile",
        "4,9": "tile_containment_floor_tile",
        "5,2": "tile_containment_floor_tile",
        "5,3": "tile_containment_floor_tile",
        "5,4": "tile_containment_floor_tile",
        "5,5": "tile_containment_floor_tile",
        "5,6": "tile_containment_floor_tile",
        "5,7": "tile_containment_floor_tile",
        "5,8": "tile_containment_floor_tile",
        "5,9": "tile_containment_floor_tile",
        "6,2": "tile_containment_floor_tile",
        "6,3": "tile_containment_floor_tile",
        "6,4": "tile_containment_floor_tile",
        "6,5": "tile_containment_floor_tile",
        "6,6": "tile_containment_floor_tile",
        "6,7": "tile_containment_floor_tile",
        "6,8": "tile_containment_floor_tile",
        "6,9": "tile_containment_floor_tile",
        "7,2": "tile_containment_floor_tile",
        "7,3": "tile_containment_floor_tile",
        "7,4": "tile_containment_floor_tile",
        "7,5": "tile_containment_floor_tile",
        "7,6": "tile_containment_floor_tile",
        "7,7": "tile_containment_floor_tile",
        "7,8": "tile_containment_floor_tile",
        "7,9": "tile_containment_floor_tile",
        "8,2": "tile_containment_floor_tile",
        "8,3": "tile_containment_floor_tile",
        "8,4": "tile_containment_floor_tile",
        "8,5": "tile_containment_floor_tile",
        "8,6": "tile_containment_floor_tile",
        "8,7": "tile_containment_floor_tile",
        "8,8": "tile_containment_floor_tile",
        "8,9": "tile_containment_floor_tile",
        "9,2": "tile_containment_floor_tile",
        "9,3": "tile_containment_floor_tile",
        "9,4": "tile_containment_floor_tile",
        "9,5": "tile_containment_floor_tile",
        "9,6": "tile_containment_floor_tile",
        "9,7": "tile_containment_floor_tile",
        "9,8": "tile_containment_floor_tile",
        "9,9": "tile_containment_floor_tile",
        "10,2": "tile_containment_floor_tile",
        "10,3": "tile_containment_floor_tile",
        "10,4": "tile_containment_floor_tile",
        "10,5": "tile_containment_floor_tile",
        "10,6": "tile_containment_floor_tile",
        "10,7": "tile_containment_floor_tile",
        "10,8": "tile_containment_floor_tile",
        "11,2": "tile_containment_floor_tile",
        "11,3": "tile_containment_floor_tile",
        "11,5": "tile_containment_floor_tile",
        "11,6": "tile_containment_floor_tile",
        "11,7": "tile_containment_floor_tile",
        "11,8": "tile_containment_floor_tile",
        "12,2": "tile_containment_floor_tile",
        "12,3": "tile_containment_floor_tile",
        "12,4": "tile_containment_floor_tile",
        "12,5": "tile_containment_floor_tile",
        "12,6": "tile_containment_floor_tile",
        "12,7": "tile_containment_floor_tile",
        "12,8": "tile_containment_floor_tile",
        "13,2": "tile_containment_floor_tile",
        "13,3": "tile_containment_floor_tile",
        "13,4": "tile_containment_floor_tile",
        "13,5": "tile_containment_floor_tile",
        "13,6": "tile_containment_floor_tile",
        "13,7": "tile_containment_floor_tile",
        "13,8": "tile_containment_floor_tile",
        "13,9": "tile_containment_floor_tile",
        "14,2": "tile_containment_floor_tile",
        "14,3": "tile_containment_floor_tile",
        "14,4": "tile_containment_floor_tile",
        "14,5": "tile_containment_floor_tile",
        "14,6": "tile_containment_floor_tile",
        "14,7": "tile_containment_floor_tile",
        "14,8": "tile_containment_floor_tile",
        "14,9": "tile_containment_floor_tile",
        "15,2": "tile_containment_floor_tile",
        "15,3": "tile_containment_floor_tile",
        "15,4": "tile_containment_floor_tile",
        "15,5": "tile_containment_floor_tile",
        "15,6": "tile_containment_floor_tile",
        "15,7": "tile_containment_floor_tile",
        "15,8": "tile_containment_floor_tile",
        "15,9": "tile_containment_floor_tile",
        "16,2": "tile_containment_floor_tile",
        "16,3": "tile_containment_floor_tile",
        "16,4": "tile_containment_floor_tile",
        "16,5": "tile_containment_floor_tile",
        "16,6": "tile_containment_floor_tile",
        "16,7": "tile_containment_floor_tile",
        "16,8": "tile_containment_floor_tile",
        "16,9": "tile_containment_floor_tile",
        "17,2": "tile_containment_floor_tile",
        "17,3": "tile_containment_floor_tile",
        "17,4": "tile_containment_floor_tile",
        "17,5": "tile_containment_floor_tile",
        "17,6": "tile_containment_floor_tile",
        "17,7": "tile_containment_floor_tile",
        "17,8": "tile_containment_floor_tile",
        "17,9": "tile_containment_floor_tile",
        "18,2": "tile_containment_floor_tile",
        "18,3": "tile_containment_floor_tile",
        "18,4": "tile_containment_floor_tile",
        "18,5": "tile_containment_floor_tile",
        "18,6": "tile_containment_floor_tile",
        "18,7": "tile_containment_floor_tile",
        "18,8": "tile_containment_floor_tile",
        "18,9": "tile_containment_floor_tile",
        "19,2": "tile_containment_floor_tile",
        "19,3": "tile_containment_floor_tile",
        "19,4": "tile_containment_floor_tile",
        "19,5": "tile_containment_floor_tile",
        "19,6": "tile_containment_floor_tile",
        "19,7": "tile_containment_floor_tile",
        "19,8": "tile_containment_floor_tile",
        "19,9": "tile_containment_floor_tile",
        "11,4": "tile_containment_floor_tile"
      },
      "ground": {},
      "ground2": {},
      "ground3": {},
      "object": {
        "18,1": "tile_eoc_security_camera"
      },
      "object2": {},
      "object3": {},
      "object4": {},
      "overlay": {},
      "top": {
        "19,1": "tile_containment_wall_top_straight",
        "0,1": "tile_containment_wall_top_straight",
        "0,2": "tile_containment_wall_top_straight",
        "0,3": "tile_containment_wall_top_straight",
        "0,4": "tile_containment_wall_top_straight",
        "0,5": "tile_containment_wall_top_straight"
      }
    },
    "stamps": [
      {
        "id": "tile_containment_wall",
        "c": 1,
        "r": 0,
        "layer": "ground"
      },
      {
        "id": "tile_containment_wall",
        "c": 2,
        "r": 0,
        "layer": "ground"
      },
      {
        "id": "tile_containment_wall",
        "c": 3,
        "r": 0,
        "layer": "ground"
      },
      {
        "id": "tile_containment_wall",
        "c": 4,
        "r": 0,
        "layer": "ground"
      },
      {
        "id": "tile_containment_wall",
        "c": 5,
        "r": 0,
        "layer": "ground"
      },
      {
        "id": "tile_containment_wall",
        "c": 6,
        "r": 0,
        "layer": "ground"
      },
      {
        "id": "tile_containment_wall",
        "c": 7,
        "r": 0,
        "layer": "ground"
      },
      {
        "id": "tile_containment_wall",
        "c": 8,
        "r": 0,
        "layer": "ground"
      },
      {
        "id": "tile_containment_wall",
        "c": 9,
        "r": 0,
        "layer": "ground"
      },
      {
        "id": "tile_containment_wall",
        "c": 10,
        "r": 0,
        "layer": "ground"
      },
      {
        "id": "tile_containment_wall",
        "c": 11,
        "r": 0,
        "layer": "ground"
      },
      {
        "id": "tile_containment_wall",
        "c": 12,
        "r": 0,
        "layer": "ground"
      },
      {
        "id": "tile_containment_wall",
        "c": 13,
        "r": 0,
        "layer": "ground"
      },
      {
        "id": "tile_containment_wall",
        "c": 14,
        "r": 0,
        "layer": "ground"
      },
      {
        "id": "tile_mu5e3ndv",
        "c": 0,
        "r": 6,
        "layer": "object3"
      },
      {
        "id": "tile_containment_floor_tile",
        "c": 19,
        "r": 9,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_containment_floor_tile",
        "c": 19,
        "r": 8,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_containment_floor_tile",
        "c": 19,
        "r": 7,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_containment_floor_tile",
        "c": 19,
        "r": 6,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_containment_floor_tile",
        "c": 19,
        "r": 5,
        "layer": "floor",
        "fx": true
      },
      {
        "id": "tile_containment_wall",
        "c": 15,
        "r": 0,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_containment_wall",
        "c": 16,
        "r": 0,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_containment_wall",
        "c": 17,
        "r": 0,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_containment_wall",
        "c": 18,
        "r": 0,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_containment_wall",
        "c": 19,
        "r": 0,
        "layer": "ground",
        "fx": true
      },
      {
        "id": "tile_mufxoi3i",
        "c": 16,
        "r": 1,
        "layer": "object",
        "fx": false,
        "ox": -16,
        "oy": 0
      },
      {
        "id": "tile_containment_wall_top_straight",
        "c": 19,
        "r": 2,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_containment_wall_top_straight",
        "c": 19,
        "r": 3,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_containment_wall_top_straight",
        "c": 19,
        "r": 4,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_containment_wall_top_straight",
        "c": 19,
        "r": 5,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_mu5e3ndv",
        "c": 19,
        "r": 6,
        "layer": "top",
        "fx": true
      },
      {
        "id": "tile_eoc_hydrant_red",
        "c": 14,
        "r": 2,
        "layer": "object",
        "ox": -18,
        "oy": 0
      },
      {
        "id": "tile_new_decor_exit_sign",
        "c": 14,
        "r": 1,
        "layer": "overlay",
        "fx": true
      },
      {
        "id": "tile_containment_wall_top_corner",
        "c": 19,
        "r": 0,
        "layer": "top",
        "fx": true,
        "ox": 0,
        "oy": 2
      },
      {
        "id": "tile_containment_wall_top_corner",
        "c": 0,
        "r": 0,
        "layer": "top",
        "ox": 0,
        "oy": 2
      },
      {
        "id": "tile_eoc_security_door",
        "c": 9,
        "r": 2,
        "layer": "object2"
      },
      {
        "id": "tile_eoc_security_door",
        "c": 4,
        "r": 2,
        "layer": "object2"
      },
      {
        "id": "tile_mu5e3ndv",
        "c": 12,
        "r": 0,
        "layer": "ground2"
      },
      {
        "id": "tile_mu5e3ndv",
        "c": 6,
        "r": 0,
        "layer": "ground2"
      },
      {
        "id": "tile_new_decor_fire_extinguisher",
        "c": 11,
        "r": 3,
        "layer": "object",
        "ox": 0,
        "oy": 14,
        "sortDepth": 0.75
      },
      {
        "id": "tile_eoc_locker",
        "c": 7,
        "r": 2,
        "layer": "object",
        "ox": 0,
        "oy": -16
      },
      {
        "id": "tile_eoc_locker",
        "c": 1,
        "r": 2,
        "layer": "object",
        "ox": 0,
        "oy": -16
      },
      {
        "id": "tile_eoc_locker",
        "c": 2,
        "r": 2,
        "layer": "object",
        "ox": -6,
        "oy": -16
      },
      {
        "id": "tile_new_decor_plant03",
        "c": 12,
        "r": 3,
        "layer": "object",
        "ox": 0,
        "oy": -24,
        "sortDepth": 1.75
      }
    ],
    "solid": [
      "0,3",
      "2,3",
      "3,3",
      "4,3",
      "5,3",
      "6,3",
      "7,3",
      "9,3",
      "10,3",
      "11,3",
      "12,3",
      "13,3",
      "14,3",
      "15,3",
      "19,3",
      "1,3",
      "8,3",
      "18,3",
      "0,4",
      "0,5",
      "0,6",
      "0,7",
      "0,8",
      "0,9",
      "19,4",
      "19,5",
      "19,6",
      "19,7",
      "19,8",
      "19,9"
    ],
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
    "safe": true,
    "npcs": false,
    "portals": [
      {
        "c": 9,
        "r": 3,
        "to": "map_mususr3y"
      }
    ],
    "cols": 20,
    "rows": 10,
    "spawnZone": []
  },
  {
    "id": "map_mususr3y",
    "name": "阿瓦倫房間",
    "desc": "",
    "layers": {
      "floor": {
        "4,2": "tile_new_bg_floor",
        "5,3": "tile_containment_floor_tile",
        "6,4": "tile_containment_floor_tile",
        "7,4": "tile_containment_floor_tile",
        "8,4": "tile_containment_floor_tile",
        "8,2": "tile_new_bg_floor",
        "6,2": "tile_new_bg_floor",
        "4,3": "tile_containment_floor_tile",
        "3,3": "tile_containment_floor_tile",
        "3,4": "tile_containment_floor_tile",
        "2,5": "tile_containment_floor_tile",
        "3,5": "tile_containment_floor_tile",
        "3,6": "tile_containment_floor_tile",
        "4,6": "tile_containment_floor_tile",
        "6,6": "tile_containment_floor_tile",
        "8,6": "tile_containment_floor_tile",
        "6,5": "tile_containment_floor_tile",
        "7,5": "tile_containment_floor_tile",
        "8,5": "tile_containment_floor_tile",
        "7,3": "tile_containment_floor_tile",
        "8,3": "tile_containment_floor_tile",
        "6,1": "tile_new_bg_floor",
        "7,1": "tile_new_bg_floor",
        "8,1": "tile_new_bg_floor",
        "5,1": "tile_new_bg_floor",
        "4,1": "tile_new_bg_floor",
        "7,2": "tile_new_bg_floor",
        "6,3": "tile_containment_floor_tile",
        "2,2": "tile_new_bg_floor",
        "2,3": "tile_new_bg_floor",
        "2,4": "tile_containment_floor_tile",
        "2,6": "tile_containment_floor_tile",
        "2,7": "tile_containment_floor_tile",
        "2,8": "tile_containment_floor_tile",
        "2,9": "tile_containment_floor_tile",
        "3,2": "tile_new_bg_floor",
        "3,7": "tile_containment_floor_tile",
        "3,8": "tile_containment_floor_tile",
        "3,9": "tile_containment_floor_tile",
        "4,4": "tile_containment_floor_tile",
        "4,5": "tile_containment_floor_tile",
        "4,7": "tile_containment_floor_tile",
        "4,8": "tile_containment_floor_tile",
        "4,9": "tile_containment_floor_tile",
        "5,2": "tile_new_bg_floor",
        "5,4": "tile_containment_floor_tile",
        "5,5": "tile_containment_floor_tile",
        "5,6": "tile_containment_floor_tile",
        "5,7": "tile_containment_floor_tile",
        "5,8": "tile_containment_floor_tile",
        "5,9": "tile_containment_floor_tile",
        "6,7": "tile_containment_floor_tile",
        "6,8": "tile_containment_floor_tile",
        "6,9": "tile_containment_floor_tile",
        "7,6": "tile_containment_floor_tile",
        "7,7": "tile_containment_floor_tile",
        "7,8": "tile_containment_floor_tile",
        "7,9": "tile_containment_floor_tile",
        "8,7": "tile_containment_floor_tile",
        "8,8": "tile_containment_floor_tile",
        "8,9": "tile_containment_floor_tile"
      },
      "ground": {},
      "ground2": {},
      "ground3": {},
      "object": {
        "2,9": "tile_new_bg_wall_front_edge"
      },
      "object2": {
        "2,2": "tile_new_bg_wall_front_edge",
        "2,3": "tile_new_bg_wall_front_edge",
        "2,4": "tile_new_bg_wall_front_edge",
        "2,5": "tile_new_bg_wall_front_edge",
        "2,7": "tile_new_bg_wall_front_edge",
        "2,6": "tile_new_bg_wall_front_edge",
        "2,8": "tile_new_bg_wall_front_edge",
        "2,1": "tile_new_bg_wall_front_edge",
        "8,1": "tile_new_bg_wall_front_edge",
        "8,2": "tile_new_bg_wall_front_edge",
        "8,3": "tile_new_bg_wall_front_edge",
        "8,4": "tile_new_bg_wall_front_edge",
        "8,5": "tile_new_bg_wall_front_edge",
        "8,6": "tile_new_bg_wall_front_edge",
        "8,7": "tile_new_bg_wall_front_edge",
        "8,8": "tile_new_bg_wall_front_edge",
        "8,9": "tile_new_bg_wall_front_edge"
      },
      "object3": {},
      "object4": {},
      "overlay": {},
      "top": {}
    },
    "stamps": [
      {
        "id": "tile_mu5e3ndv",
        "c": 2,
        "r": 0,
        "layer": "object"
      },
      {
        "id": "tile_mu5e3ndv",
        "c": 8,
        "r": 0,
        "layer": "object"
      },
      {
        "id": "color_mu8nxukw",
        "c": 1,
        "r": 4,
        "layer": "ground",
        "ox": 10,
        "oy": 0
      },
      {
        "id": "color_mu8nxukw",
        "c": 1,
        "r": 8,
        "layer": "ground",
        "ox": 10,
        "oy": 0
      },
      {
        "id": "color_mu8nxukw",
        "c": 9,
        "r": 8,
        "layer": "ground",
        "ox": -10,
        "oy": 0
      },
      {
        "id": "tile_dorm_bed_vertical",
        "c": 3,
        "r": 2,
        "layer": "object",
        "ox": -20,
        "oy": 4
      },
      {
        "id": "tile_dorm_air_conditioner",
        "c": 3,
        "r": 1,
        "layer": "object",
        "ox": -10,
        "oy": -2
      },
      {
        "id": "tile_dorm_desk",
        "c": 5,
        "r": 2,
        "layer": "object",
        "ox": -26,
        "oy": 14,
        "sortDepth": 1
      },
      {
        "id": "tile_eoc_door",
        "c": 5,
        "r": 8,
        "layer": "top"
      },
      {
        "id": "color_mu8nxukw",
        "c": 9,
        "r": 4,
        "layer": "object2",
        "ox": -10,
        "oy": 0
      },
      {
        "id": "tile_mufv6z24",
        "c": 3,
        "r": 9,
        "layer": "object2",
        "ox": -24,
        "oy": 0
      },
      {
        "id": "tile_mufv9ytk",
        "c": 7,
        "r": 2,
        "layer": "object3",
        "ox": -2,
        "oy": -18
      },
      {
        "id": "tile_dorm_binder_set",
        "c": 5,
        "r": 3,
        "layer": "object3",
        "ox": 14,
        "oy": -26
      },
      {
        "id": "tile_dorm_standing_fan",
        "c": 7,
        "r": 4,
        "layer": "object"
      },
      {
        "id": "tile_dorm_chair_blue",
        "c": 5,
        "r": 3,
        "layer": "object2",
        "sortDepth": 1.5,
        "ox": -6,
        "oy": 8
      },
      {
        "id": "tile_dorm_desk_lamp",
        "c": 1,
        "r": 2,
        "layer": "object3",
        "ox": 136,
        "oy": 12
      },
      {
        "id": "tile_eoc_pen_holder",
        "c": 1,
        "r": 3,
        "layer": "object3",
        "ox": 156,
        "oy": -28
      },
      {
        "id": "tile_containment_wall",
        "c": 3,
        "r": 0,
        "layer": "ground2",
        "ox": 0,
        "oy": -2
      },
      {
        "id": "tile_containment_wall",
        "c": 4,
        "r": 0,
        "layer": "ground2",
        "ox": 0,
        "oy": -2
      },
      {
        "id": "tile_containment_wall",
        "c": 5,
        "r": 0,
        "layer": "ground2",
        "ox": 0,
        "oy": -2
      },
      {
        "id": "tile_containment_wall",
        "c": 6,
        "r": 0,
        "layer": "ground2",
        "ox": 0,
        "oy": -2
      },
      {
        "id": "tile_containment_wall",
        "c": 7,
        "r": 0,
        "layer": "ground2",
        "ox": 0,
        "oy": -2
      },
      {
        "id": "tile_mu5e3ndv",
        "c": 2,
        "r": 0,
        "layer": "ground2"
      },
      {
        "id": "tile_mu5e3ndv",
        "c": 8,
        "r": 0,
        "layer": "ground2"
      },
      {
        "id": "tile_prop_shelf_locker_unit",
        "c": 6,
        "r": 2,
        "layer": "object",
        "ox": 14,
        "oy": -22,
        "sortDepth": 2.75
      },
      {
        "id": "tile_hospital_plant_on_stool",
        "c": 3,
        "r": 6,
        "layer": "object",
        "ox": -14,
        "oy": 8,
        "sortDepth": 1.75
      }
    ],
    "solid": [
      "2,3",
      "3,3",
      "5,3",
      "2,4",
      "2,5",
      "2,6",
      "2,7",
      "2,2",
      "6,3",
      "7,3",
      "8,3",
      "4,3",
      "8,7",
      "8,6",
      "8,4",
      "8,5",
      "8,8",
      "8,9",
      "3,4",
      "3,5",
      "7,5",
      "2,8",
      "2,9",
      "3,9",
      "3,7"
    ],
    "breakable": [],
    "camp": [],
    "rules": {
      "money": 150,
      "guide": 100,
      "guideRegen": 9,
      "speed": 44,
      "reward": 8
    },
    "solidOffsets": {
      "3,7": [
        -19,
        0
      ]
    },
    "safe": true,
    "npcs": false,
    "portals": [
      {
        "c": 5,
        "r": 9,
        "to": "map_musu0dlp"
      },
      {
        "c": 6,
        "r": 9,
        "to": "map_musu0dlp"
      }
    ],
    "cols": 12,
    "rows": 10,
    "coreSpots": [],
    "coreCount": 1,
    "spawnZone": []
  },
  {
    "id": "map_mve6y3s2",
    "name": "塔住這裡（匯入）",
    "desc": "",
    "layers": {
      "floor": {
        "4,2": "tile_new_bg_floor",
        "5,3": "tile_new_bg_floor",
        "6,4": "tile_new_bg_floor",
        "7,4": "tile_new_bg_floor",
        "8,4": "tile_new_bg_floor",
        "8,2": "tile_new_bg_floor",
        "6,2": "tile_new_bg_floor",
        "4,3": "tile_new_bg_floor",
        "3,3": "tile_new_bg_floor",
        "3,4": "tile_new_bg_floor",
        "2,5": "tile_new_bg_floor",
        "3,5": "tile_new_bg_floor",
        "3,6": "tile_new_bg_floor",
        "4,6": "tile_new_bg_floor",
        "6,6": "tile_new_bg_floor",
        "8,6": "tile_new_bg_floor",
        "6,5": "tile_new_bg_floor",
        "7,5": "tile_new_bg_floor",
        "8,5": "tile_new_bg_floor",
        "7,3": "tile_new_bg_floor",
        "8,3": "tile_new_bg_floor",
        "6,1": "tile_new_bg_floor",
        "7,1": "tile_new_bg_floor",
        "8,1": "tile_new_bg_floor",
        "5,1": "tile_new_bg_floor",
        "4,1": "tile_new_bg_floor",
        "7,2": "tile_new_bg_floor",
        "6,3": "tile_new_bg_floor",
        "2,2": "tile_new_bg_floor",
        "2,3": "tile_new_bg_floor",
        "2,4": "tile_new_bg_floor",
        "2,6": "tile_new_bg_floor",
        "2,7": "tile_new_bg_floor",
        "2,8": "tile_new_bg_floor",
        "2,9": "tile_new_bg_floor",
        "3,2": "tile_new_bg_floor",
        "3,7": "tile_new_bg_floor",
        "3,8": "tile_new_bg_floor",
        "3,9": "tile_new_bg_floor",
        "4,4": "tile_new_bg_floor",
        "4,5": "tile_new_bg_floor",
        "4,7": "tile_new_bg_floor",
        "4,8": "tile_new_bg_floor",
        "4,9": "tile_new_bg_floor",
        "5,2": "tile_new_bg_floor",
        "5,4": "tile_new_bg_floor",
        "5,5": "tile_new_bg_floor",
        "5,6": "tile_new_bg_floor",
        "5,7": "tile_new_bg_floor",
        "5,8": "tile_new_bg_floor",
        "5,9": "tile_new_bg_floor",
        "6,7": "tile_new_bg_floor",
        "6,8": "tile_new_bg_floor",
        "6,9": "tile_new_bg_floor",
        "7,6": "tile_new_bg_floor",
        "7,7": "tile_new_bg_floor",
        "7,8": "tile_new_bg_floor",
        "7,9": "tile_new_bg_floor",
        "8,7": "tile_new_bg_floor",
        "8,8": "tile_new_bg_floor",
        "8,9": "tile_new_bg_floor"
      },
      "ground": {},
      "ground2": {},
      "ground3": {},
      "object": {},
      "object2": {
        "2,2": "tile_new_bg_wall_front_edge",
        "2,3": "tile_new_bg_wall_front_edge",
        "2,4": "tile_new_bg_wall_front_edge",
        "2,5": "tile_new_bg_wall_front_edge",
        "2,7": "tile_new_bg_wall_front_edge",
        "2,8": "tile_new_bg_wall_front_edge",
        "2,1": "tile_new_bg_wall_front_edge",
        "8,1": "tile_new_bg_wall_front_edge",
        "8,2": "tile_new_bg_wall_front_edge",
        "8,3": "tile_new_bg_wall_front_edge",
        "8,4": "tile_new_bg_wall_front_edge",
        "8,5": "tile_new_bg_wall_front_edge",
        "8,6": "tile_new_bg_wall_front_edge",
        "8,7": "tile_new_bg_wall_front_edge",
        "8,8": "tile_new_bg_wall_front_edge",
        "8,9": "tile_new_bg_wall_front_edge",
        "2,6": "tile_new_bg_wall_front_edge",
        "2,9": "tile_new_bg_wall_front_edge"
      },
      "object3": {},
      "object4": {
        "3,7": "tile_eoc_plant_small_01"
      },
      "overlay": {},
      "top": {}
    },
    "stamps": [
      {
        "id": "tile_mu5e3ndv",
        "c": 2,
        "r": 0,
        "layer": "object"
      },
      {
        "id": "tile_mu5e3ndv",
        "c": 8,
        "r": 0,
        "layer": "object"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 2,
        "r": 0,
        "layer": "ground2"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 3,
        "r": 0,
        "layer": "ground2"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 4,
        "r": 0,
        "layer": "ground2"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 5,
        "r": 0,
        "layer": "ground2"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 6,
        "r": 0,
        "layer": "ground2"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 7,
        "r": 0,
        "layer": "ground2"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 8,
        "r": 0,
        "layer": "ground2"
      },
      {
        "id": "color_mu8nxukw",
        "c": 1,
        "r": 4,
        "layer": "ground",
        "ox": 10,
        "oy": 0
      },
      {
        "id": "color_mu8nxukw",
        "c": 1,
        "r": 8,
        "layer": "ground",
        "ox": 10,
        "oy": 0
      },
      {
        "id": "color_mu8nxukw",
        "c": 9,
        "r": 8,
        "layer": "ground",
        "ox": -10,
        "oy": 0
      },
      {
        "id": "tile_dorm_air_conditioner",
        "c": 3,
        "r": 1,
        "layer": "ground3",
        "ox": 6,
        "oy": -12
      },
      {
        "id": "color_mu8nxukw",
        "c": 9,
        "r": 4,
        "layer": "object2",
        "ox": -10,
        "oy": 0
      },
      {
        "id": "tile_dorm_window_blinds_narrow",
        "c": 4,
        "r": 1,
        "layer": "ground3",
        "ox": 22,
        "oy": -6
      },
      {
        "id": "tile_eoc_book_stack",
        "c": 5,
        "r": 2,
        "layer": "overlay",
        "ox": 2,
        "oy": 18,
        "sortDepth": 0
      },
      {
        "id": "tile_new_decor_plant01",
        "c": 4,
        "r": 2,
        "layer": "overlay",
        "ox": 18,
        "oy": -26,
        "fx": false,
        "sortDepth": 0
      },
      {
        "id": "tile_muu4p4el",
        "c": 6,
        "r": 1,
        "layer": "object2",
        "ox": 8,
        "oy": 20,
        "sortDepth": 0
      },
      {
        "id": "tile_dorm_bed_vertical",
        "c": 3,
        "r": 2,
        "layer": "ground3",
        "ox": 2,
        "oy": 0
      },
      {
        "id": "tile_dorm_desk",
        "c": 4,
        "r": 3,
        "layer": "object2",
        "ox": 22,
        "oy": -18,
        "sortDepth": 0
      },
      {
        "id": "tile_dorm_chair_blue",
        "c": 5,
        "r": 3,
        "layer": "object3",
        "ox": 2,
        "oy": 2
      },
      {
        "id": "tile_dorm_binder_set",
        "c": 6,
        "r": 3,
        "layer": "overlay",
        "ox": -16,
        "oy": -24,
        "sortDepth": 0
      },
      {
        "id": "tile_hospital_privacy_curtain_bottom_half",
        "c": 3,
        "r": 1,
        "layer": "object",
        "fx": true,
        "ox": -6,
        "oy": -12
      },
      {
        "id": "tile_prop_work_table",
        "c": 3,
        "r": 7,
        "layer": "object3",
        "ox": -20,
        "oy": -32,
        "sortDepth": 0
      },
      {
        "id": "tile_new_decor_coffee_cup",
        "c": 5,
        "r": 3,
        "layer": "top",
        "ox": -16,
        "oy": 0,
        "fx": true,
        "sortDepth": 0
      },
      {
        "id": "tile_counseling_tissue_box",
        "c": 3,
        "r": 6,
        "layer": "object3",
        "fx": true,
        "ox": -18,
        "oy": 16,
        "sortDepth": 0
      },
      {
        "id": "tile_eoc_tissue_box",
        "c": 2,
        "r": 6,
        "layer": "object3",
        "fx": false,
        "fy": false,
        "rot": 0,
        "ox": 24,
        "oy": 20,
        "sortDepth": 0
      },
      {
        "id": "tile_new_decor_chair_side",
        "c": 4,
        "r": 7,
        "layer": "object2",
        "ox": 6,
        "oy": 6
      },
      {
        "id": "tile_eoc_pen_holder",
        "c": 3,
        "r": 7,
        "layer": "object4",
        "ox": -20,
        "oy": 14
      },
      {
        "id": "tile_eoc_plant_small_01",
        "c": 3,
        "r": 7,
        "layer": "top",
        "ox": -20,
        "oy": -6
      },
      {
        "id": "tile_eoc_binder_row",
        "c": 7,
        "r": 2,
        "layer": "overlay",
        "ox": -6,
        "oy": -24,
        "sortDepth": 0
      },
      {
        "id": "tile_eoc_binder_cabinet",
        "c": 6,
        "r": 5,
        "layer": "overlay",
        "ox": 22,
        "oy": 6
      },
      {
        "id": "tile_eoc_floor_lamp",
        "c": 3,
        "r": 8,
        "layer": "top",
        "ox": -8,
        "oy": -4,
        "sortDepth": 0
      },
      {
        "id": "tile_eoc_pen",
        "c": 5,
        "r": 3,
        "layer": "top",
        "ox": 6,
        "oy": -14,
        "fx": true,
        "sortDepth": 0
      },
      {
        "id": "tile_eoc_drawer_unit",
        "c": 6,
        "r": 6,
        "layer": "overlay",
        "ox": -2,
        "oy": 2
      },
      {
        "id": "tile_dorm_desk_lamp",
        "c": 4,
        "r": 2,
        "layer": "top",
        "ox": -6,
        "oy": 0
      },
      {
        "id": "tile_eoc_book_and_pen",
        "c": 3,
        "r": 7,
        "layer": "top",
        "rot": 1,
        "ox": 10,
        "oy": 12,
        "sortDepth": 0
      },
      {
        "id": "tile_mu4yzgcg",
        "c": 7,
        "r": 4,
        "layer": "top",
        "ox": 10,
        "oy": 0,
        "sortDepth": 0
      },
      {
        "id": "tile_new_decor_box_three",
        "c": 6,
        "r": 3,
        "layer": "overlay",
        "ox": 14,
        "oy": 20,
        "sortDepth": 0
      },
      {
        "id": "tile_mu4yyr9r",
        "c": 6,
        "r": 5,
        "layer": "object",
        "ox": 12,
        "oy": 8
      },
      {
        "id": "tile_eoc_door",
        "c": 5,
        "r": 8,
        "layer": "top",
        "ox": -16,
        "oy": 0
      },
      {
        "id": "tile_eoc_plant_small_02",
        "c": 6,
        "r": 6,
        "layer": "top",
        "ox": 4,
        "oy": 2
      },
      {
        "id": "tile_eoc_sofa_side",
        "c": 7,
        "r": 7,
        "layer": "overlay",
        "fx": true,
        "ox": 10,
        "oy": 0,
        "sortDepth": 0
      },
      {
        "id": "tile_interactive_flare_ammo",
        "c": 7,
        "r": 4,
        "layer": "top",
        "ox": 8,
        "oy": 26,
        "sortDepth": 0
      },
      {
        "id": "tile_hq_poster",
        "c": 3,
        "r": 2,
        "layer": "top",
        "ox": 10,
        "oy": -10
      }
    ],
    "solid": [
      "2,3",
      "2,4",
      "2,5",
      "2,6",
      "2,7",
      "2,2",
      "8,3",
      "8,7",
      "8,6",
      "8,4",
      "8,5",
      "8,8",
      "8,9",
      "2,8",
      "3,3",
      "4,3",
      "3,4",
      "3,5",
      "4,4",
      "4,5",
      "7,3",
      "7,2",
      "6,3",
      "5,3",
      "7,4",
      "7,5",
      "6,4",
      "7,6",
      "7,7",
      "6,7",
      "6,6",
      "3,7",
      "3,8",
      "7,8",
      "7,9",
      "3,9",
      "2,9"
    ],
    "breakable": [],
    "camp": [],
    "rules": {
      "money": 150,
      "guide": 100,
      "guideRegen": 9,
      "speed": 44,
      "reward": 8
    },
    "solidOffsets": {
      "4,3": [
        -7,
        0
      ],
      "4,4": [
        -7,
        0
      ],
      "4,5": [
        -7,
        -9
      ],
      "3,5": [
        0,
        -9
      ],
      "7,4": [
        7,
        0
      ],
      "7,5": [
        7,
        0
      ],
      "6,4": [
        5,
        -16
      ],
      "6,6": [
        12,
        -5
      ],
      "7,8": [
        7,
        0
      ],
      "7,9": [
        7,
        0
      ]
    },
    "safe": true,
    "npcs": false,
    "portals": [
      {
        "c": 5,
        "r": 9,
        "to": "map_mufyx9gj"
      }
    ],
    "cols": 12,
    "rows": 10,
    "coreSpots": [],
    "coreCount": 1,
    "spawnZone": []
  },
  {
    "id": "map_mve6w8og",
    "name": "塔住這裡",
    "desc": "",
    "layers": {
      "floor": {
        "4,2": "tile_new_bg_floor",
        "5,3": "tile_new_bg_floor",
        "6,4": "tile_new_bg_floor",
        "7,4": "tile_new_bg_floor",
        "8,4": "tile_new_bg_floor",
        "8,2": "tile_new_bg_floor",
        "6,2": "tile_new_bg_floor",
        "4,3": "tile_new_bg_floor",
        "3,3": "tile_new_bg_floor",
        "3,4": "tile_new_bg_floor",
        "2,5": "tile_new_bg_floor",
        "3,5": "tile_new_bg_floor",
        "3,6": "tile_new_bg_floor",
        "4,6": "tile_new_bg_floor",
        "6,6": "tile_new_bg_floor",
        "8,6": "tile_new_bg_floor",
        "6,5": "tile_new_bg_floor",
        "7,5": "tile_new_bg_floor",
        "8,5": "tile_new_bg_floor",
        "7,3": "tile_new_bg_floor",
        "8,3": "tile_new_bg_floor",
        "6,1": "tile_new_bg_floor",
        "7,1": "tile_new_bg_floor",
        "8,1": "tile_new_bg_floor",
        "5,1": "tile_new_bg_floor",
        "4,1": "tile_new_bg_floor",
        "7,2": "tile_new_bg_floor",
        "6,3": "tile_new_bg_floor",
        "2,2": "tile_new_bg_floor",
        "2,3": "tile_new_bg_floor",
        "2,4": "tile_new_bg_floor",
        "2,6": "tile_new_bg_floor",
        "2,7": "tile_new_bg_floor",
        "2,8": "tile_new_bg_floor",
        "2,9": "tile_new_bg_floor",
        "3,2": "tile_new_bg_floor",
        "3,7": "tile_new_bg_floor",
        "3,8": "tile_new_bg_floor",
        "3,9": "tile_new_bg_floor",
        "4,4": "tile_new_bg_floor",
        "4,5": "tile_new_bg_floor",
        "4,7": "tile_new_bg_floor",
        "4,8": "tile_new_bg_floor",
        "4,9": "tile_new_bg_floor",
        "5,2": "tile_new_bg_floor",
        "5,4": "tile_new_bg_floor",
        "5,5": "tile_new_bg_floor",
        "5,6": "tile_new_bg_floor",
        "5,7": "tile_new_bg_floor",
        "5,8": "tile_new_bg_floor",
        "5,9": "tile_new_bg_floor",
        "6,7": "tile_new_bg_floor",
        "6,8": "tile_new_bg_floor",
        "6,9": "tile_new_bg_floor",
        "7,6": "tile_new_bg_floor",
        "7,7": "tile_new_bg_floor",
        "7,8": "tile_new_bg_floor",
        "7,9": "tile_new_bg_floor",
        "8,7": "tile_new_bg_floor",
        "8,8": "tile_new_bg_floor",
        "8,9": "tile_new_bg_floor"
      },
      "ground": {},
      "ground2": {},
      "ground3": {},
      "object": {},
      "object2": {
        "2,2": "tile_new_bg_wall_front_edge",
        "2,3": "tile_new_bg_wall_front_edge",
        "2,4": "tile_new_bg_wall_front_edge",
        "2,5": "tile_new_bg_wall_front_edge",
        "2,7": "tile_new_bg_wall_front_edge",
        "2,8": "tile_new_bg_wall_front_edge",
        "2,1": "tile_new_bg_wall_front_edge",
        "8,1": "tile_new_bg_wall_front_edge",
        "8,2": "tile_new_bg_wall_front_edge",
        "8,3": "tile_new_bg_wall_front_edge",
        "8,4": "tile_new_bg_wall_front_edge",
        "8,5": "tile_new_bg_wall_front_edge",
        "8,6": "tile_new_bg_wall_front_edge",
        "8,7": "tile_new_bg_wall_front_edge",
        "8,8": "tile_new_bg_wall_front_edge",
        "8,9": "tile_new_bg_wall_front_edge",
        "2,6": "tile_new_bg_wall_front_edge",
        "2,9": "tile_new_bg_wall_front_edge"
      },
      "object3": {},
      "object4": {
        "3,7": "tile_eoc_plant_small_01"
      },
      "overlay": {},
      "top": {}
    },
    "stamps": [
      {
        "id": "tile_mu5e3ndv",
        "c": 2,
        "r": 0,
        "layer": "object"
      },
      {
        "id": "tile_mu5e3ndv",
        "c": 8,
        "r": 0,
        "layer": "object"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 2,
        "r": 0,
        "layer": "ground2"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 3,
        "r": 0,
        "layer": "ground2"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 4,
        "r": 0,
        "layer": "ground2"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 5,
        "r": 0,
        "layer": "ground2"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 6,
        "r": 0,
        "layer": "ground2"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 7,
        "r": 0,
        "layer": "ground2"
      },
      {
        "id": "tile_new_bg_wall",
        "c": 8,
        "r": 0,
        "layer": "ground2"
      },
      {
        "id": "color_mu8nxukw",
        "c": 1,
        "r": 4,
        "layer": "ground",
        "ox": 10,
        "oy": 0
      },
      {
        "id": "color_mu8nxukw",
        "c": 1,
        "r": 8,
        "layer": "ground",
        "ox": 10,
        "oy": 0
      },
      {
        "id": "color_mu8nxukw",
        "c": 9,
        "r": 8,
        "layer": "ground",
        "ox": -10,
        "oy": 0
      },
      {
        "id": "tile_dorm_air_conditioner",
        "c": 3,
        "r": 1,
        "layer": "ground3",
        "ox": 6,
        "oy": -12
      },
      {
        "id": "color_mu8nxukw",
        "c": 9,
        "r": 4,
        "layer": "object2",
        "ox": -10,
        "oy": 0
      },
      {
        "id": "tile_dorm_window_blinds_narrow",
        "c": 4,
        "r": 1,
        "layer": "ground3",
        "ox": 22,
        "oy": -6
      },
      {
        "id": "tile_eoc_book_stack",
        "c": 5,
        "r": 2,
        "layer": "overlay",
        "ox": 2,
        "oy": 18,
        "sortDepth": 0
      },
      {
        "id": "tile_new_decor_plant01",
        "c": 4,
        "r": 2,
        "layer": "overlay",
        "ox": 18,
        "oy": -26,
        "fx": false,
        "sortDepth": 0
      },
      {
        "id": "tile_muu4p4el",
        "c": 6,
        "r": 1,
        "layer": "object2",
        "ox": 8,
        "oy": 20,
        "sortDepth": 0
      },
      {
        "id": "tile_dorm_bed_vertical",
        "c": 3,
        "r": 2,
        "layer": "ground3",
        "ox": 2,
        "oy": 0
      },
      {
        "id": "tile_dorm_desk",
        "c": 4,
        "r": 3,
        "layer": "object2",
        "ox": 22,
        "oy": -18,
        "sortDepth": 0
      },
      {
        "id": "tile_dorm_chair_blue",
        "c": 5,
        "r": 3,
        "layer": "object3",
        "ox": 2,
        "oy": 2
      },
      {
        "id": "tile_dorm_binder_set",
        "c": 6,
        "r": 3,
        "layer": "overlay",
        "ox": -16,
        "oy": -24,
        "sortDepth": 0
      },
      {
        "id": "tile_hospital_privacy_curtain_bottom_half",
        "c": 3,
        "r": 1,
        "layer": "object",
        "fx": true,
        "ox": -6,
        "oy": -12
      },
      {
        "id": "tile_prop_work_table",
        "c": 3,
        "r": 7,
        "layer": "object3",
        "ox": -20,
        "oy": -32,
        "sortDepth": 0
      },
      {
        "id": "tile_new_decor_coffee_cup",
        "c": 5,
        "r": 3,
        "layer": "top",
        "ox": -16,
        "oy": 0,
        "fx": true,
        "sortDepth": 0
      },
      {
        "id": "tile_counseling_tissue_box",
        "c": 3,
        "r": 6,
        "layer": "object3",
        "fx": true,
        "ox": -18,
        "oy": 16,
        "sortDepth": 0
      },
      {
        "id": "tile_eoc_tissue_box",
        "c": 2,
        "r": 6,
        "layer": "object3",
        "fx": false,
        "fy": false,
        "rot": 0,
        "ox": 24,
        "oy": 20,
        "sortDepth": 0
      },
      {
        "id": "tile_new_decor_chair_side",
        "c": 4,
        "r": 7,
        "layer": "object2",
        "ox": 6,
        "oy": 6
      },
      {
        "id": "tile_eoc_pen_holder",
        "c": 3,
        "r": 7,
        "layer": "object4",
        "ox": -20,
        "oy": 14
      },
      {
        "id": "tile_eoc_plant_small_01",
        "c": 3,
        "r": 7,
        "layer": "top",
        "ox": -20,
        "oy": -6
      },
      {
        "id": "tile_eoc_binder_row",
        "c": 7,
        "r": 2,
        "layer": "overlay",
        "ox": -6,
        "oy": -24,
        "sortDepth": 0
      },
      {
        "id": "tile_eoc_binder_cabinet",
        "c": 6,
        "r": 5,
        "layer": "overlay",
        "ox": 22,
        "oy": 6
      },
      {
        "id": "tile_eoc_floor_lamp",
        "c": 3,
        "r": 8,
        "layer": "top",
        "ox": -8,
        "oy": -4,
        "sortDepth": 0
      },
      {
        "id": "tile_eoc_pen",
        "c": 5,
        "r": 3,
        "layer": "top",
        "ox": 6,
        "oy": -14,
        "fx": true,
        "sortDepth": 0
      },
      {
        "id": "tile_eoc_drawer_unit",
        "c": 6,
        "r": 6,
        "layer": "overlay",
        "ox": -2,
        "oy": 2
      },
      {
        "id": "tile_dorm_desk_lamp",
        "c": 4,
        "r": 2,
        "layer": "top",
        "ox": -6,
        "oy": 0
      },
      {
        "id": "tile_eoc_book_and_pen",
        "c": 3,
        "r": 7,
        "layer": "top",
        "rot": 3,
        "ox": 10,
        "oy": 12,
        "sortDepth": 0
      },
      {
        "id": "tile_mu4yzgcg",
        "c": 7,
        "r": 4,
        "layer": "top",
        "ox": 10,
        "oy": 0,
        "sortDepth": 0
      },
      {
        "id": "tile_new_decor_box_three",
        "c": 6,
        "r": 3,
        "layer": "overlay",
        "ox": 14,
        "oy": 20,
        "sortDepth": 0
      },
      {
        "id": "tile_mu4yyr9r",
        "c": 6,
        "r": 5,
        "layer": "object",
        "ox": 12,
        "oy": 8
      },
      {
        "id": "tile_eoc_door",
        "c": 5,
        "r": 8,
        "layer": "top",
        "ox": -16,
        "oy": 0
      },
      {
        "id": "tile_eoc_plant_small_02",
        "c": 6,
        "r": 6,
        "layer": "top",
        "ox": 4,
        "oy": 2
      },
      {
        "id": "tile_eoc_sofa_side",
        "c": 7,
        "r": 7,
        "layer": "overlay",
        "fx": true,
        "ox": 10,
        "oy": 0,
        "sortDepth": 0
      },
      {
        "id": "tile_interactive_flare_ammo",
        "c": 7,
        "r": 4,
        "layer": "top",
        "ox": 8,
        "oy": 26,
        "sortDepth": 0
      },
      {
        "id": "tile_hq_poster",
        "c": 3,
        "r": 2,
        "layer": "top",
        "ox": 10,
        "oy": -10
      }
    ],
    "solid": [
      "2,3",
      "2,4",
      "2,5",
      "2,6",
      "2,7",
      "2,2",
      "8,3",
      "8,7",
      "8,6",
      "8,4",
      "8,5",
      "8,8",
      "8,9",
      "2,8",
      "3,3",
      "4,3",
      "3,4",
      "3,5",
      "4,4",
      "4,5",
      "7,3",
      "7,2",
      "6,3",
      "5,3",
      "7,4",
      "7,5",
      "6,4",
      "7,6",
      "7,7",
      "6,7",
      "6,6",
      "3,7",
      "3,8",
      "7,8",
      "7,9",
      "3,9",
      "2,9"
    ],
    "breakable": [],
    "camp": [],
    "rules": {
      "money": 150,
      "guide": 100,
      "guideRegen": 9,
      "speed": 44,
      "reward": 8
    },
    "solidOffsets": {
      "4,3": [
        -7,
        0
      ],
      "4,4": [
        -7,
        0
      ],
      "4,5": [
        -7,
        -9
      ],
      "3,5": [
        0,
        -9
      ],
      "7,4": [
        7,
        0
      ],
      "7,5": [
        7,
        0
      ],
      "6,4": [
        5,
        -16
      ],
      "6,6": [
        12,
        -5
      ],
      "7,8": [
        7,
        0
      ],
      "7,9": [
        7,
        0
      ]
    },
    "safe": true,
    "npcs": false,
    "portals": [
      {
        "c": 5,
        "r": 9,
        "to": "map_mufyx9gj"
      }
    ],
    "cols": 12,
    "rows": 10,
    "coreSpots": [],
    "coreCount": 1,
    "spawnZone": []
  }
];
