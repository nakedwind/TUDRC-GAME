/* ===== 素材庫：三個地圖編輯器共用的磚塊／素材 =====
   在任一個編輯器「⋯ 更多 → ＋ 加入磚塊」加的素材，三邊都能用；地圖本身依分類分開存
   （戰鬥地圖 data/maps.js、基地地圖 data/base-maps.js、劇情地圖 data/story-maps.js）。
   整段貼回 data/tiles.js 覆蓋即可。 */
const SHARED_TILES = [
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
    "w": 1,
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
    "file": "images/item-decorate/Oil_drum_V2.png",
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
    "id": "tile_eoc_ball_bed",
    "name": "球球的床",
    "role": "floor",
    "file": "images/應變中心/ball_bed.png",
    "w": 1.825,
    "h": 0.85
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
    "id": "tile_eoc_door_exit_fade",
    "name": "出口淡出（門口暗影）",
    "role": "floor",
    "file": "images/應變中心/door-exit-fade.png",
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
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_dmg_rubble_pile_medium",
    "name": "瓦礫堆（中）",
    "role": "floor",
    "file": "images/破損建築/rubble-pile-medium.png",
    "w": 3,
    "h": 2,
    "flat": true
  },
  {
    "id": "tile_dmg_rubble_pile_large",
    "name": "瓦礫堆（大）",
    "role": "floor",
    "file": "images/破損建築/rubble-pile-large.png",
    "w": 3,
    "h": 2,
    "flat": true
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
    "h": 2
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
        1
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
        10,
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
        8,
        2
      ],
      [
        9,
        2
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
      ],
      [
        9,
        3
      ],
      [
        1,
        4
      ],
      [
        9,
        4
      ],
      [
        1,
        5
      ],
      [
        9,
        5
      ],
      [
        0,
        6
      ],
      [
        1,
        6
      ],
      [
        9,
        6
      ],
      [
        10,
        6
      ]
    ],
    "baseDepth": 2
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
    "id": "tile_prop_shelf_locker_unit_02",
    "name": "層架置物櫃 02",
    "role": "floor",
    "file": "images/scene-props/shelf-locker-unit02.png",
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
    "h": 4,
    "flat": true
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
    "file": "images/field-camp/warning-line.png",
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
    "file": "images/field-camp/Backpack.png",
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
    "id": "tile_restaurant_dish_apple_pie",
    "name": "餐點－蘋果派",
    "role": "floor",
    "file": "images/餐廳/06_apple_pie_dish.png",
    "w": 1,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_restaurant_dish_cheesecake",
    "name": "餐點－起司蛋糕",
    "role": "floor",
    "file": "images/餐廳/23_cheesecake_dish.png",
    "w": 1,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_restaurant_dish_chocolate_cake",
    "name": "餐點－巧克力蛋糕",
    "role": "floor",
    "file": "images/餐廳/31_chocolatecake_dish.png",
    "w": 1,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_restaurant_dish_strawberry_cake",
    "name": "餐點－草莓蛋糕",
    "role": "floor",
    "file": "images/餐廳/91_strawberrycake_dish.png",
    "w": 1,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_restaurant_party_dish_fried_chicken",
    "name": "慶功宴－鹹酥雞",
    "role": "floor",
    "file": "images/餐廳/慶功宴/dish-fried-chicken.png",
    "w": 1,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_restaurant_party_dish_lurou_rice",
    "name": "慶功宴－滷肉飯",
    "role": "floor",
    "file": "images/餐廳/慶功宴/dish-lurou-rice.png",
    "w": 1,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_restaurant_party_dish_loofah_clam",
    "name": "慶功宴－絲瓜蛤蜊",
    "role": "floor",
    "file": "images/餐廳/慶功宴/dish-loofah-clam.png",
    "w": 1,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_restaurant_party_dish_oyster_omelet",
    "name": "慶功宴－蚵仔煎",
    "role": "floor",
    "file": "images/餐廳/慶功宴/dish-oyster-omelet.png",
    "w": 1,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_restaurant_party_dish_milkfish_congee",
    "name": "慶功宴－虱目魚肚粥",
    "role": "floor",
    "file": "images/餐廳/慶功宴/dish-milkfish-congee.png",
    "w": 1,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_restaurant_party_dish_fish_noodle_soup",
    "name": "慶功宴－魚片米粉湯",
    "role": "floor",
    "file": "images/餐廳/慶功宴/dish-fish-noodle-soup.png",
    "w": 1,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_restaurant_party_dish_burnt",
    "name": "慶功宴－烤焦的菜",
    "role": "floor",
    "file": "images/餐廳/慶功宴/dish-burnt.png",
    "w": 1,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_restaurant_party_ing_chicken",
    "name": "慶功宴食材－生雞腿",
    "role": "floor",
    "file": "images/餐廳/慶功宴/ing-chicken.png",
    "w": 1,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_restaurant_party_ing_pork",
    "name": "慶功宴食材－絞肉",
    "role": "floor",
    "file": "images/餐廳/慶功宴/ing-pork.png",
    "w": 1,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_restaurant_party_ing_clam",
    "name": "慶功宴食材－蛤蜊",
    "role": "floor",
    "file": "images/餐廳/慶功宴/ing-clam.png",
    "w": 1,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_restaurant_party_ing_oyster",
    "name": "慶功宴食材－蚵仔",
    "role": "floor",
    "file": "images/餐廳/慶功宴/ing-oyster.png",
    "w": 1,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_restaurant_party_ing_egg",
    "name": "慶功宴食材－雞蛋",
    "role": "floor",
    "file": "images/餐廳/慶功宴/ing-egg.png",
    "w": 1,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_restaurant_party_ing_vermicelli",
    "name": "慶功宴食材－米粉",
    "role": "floor",
    "file": "images/餐廳/慶功宴/ing-vermicelli.png",
    "w": 1,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_restaurant_party_ing_basil",
    "name": "慶功宴食材－九層塔",
    "role": "floor",
    "file": "images/餐廳/慶功宴/ing-basil.png",
    "w": 1,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_restaurant_party_ing_ginger",
    "name": "慶功宴食材－薑絲",
    "role": "floor",
    "file": "images/餐廳/慶功宴/ing-ginger.png",
    "w": 1,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_restaurant_party_ing_rice",
    "name": "慶功宴食材－白飯",
    "role": "floor",
    "file": "images/餐廳/慶功宴/ing-rice.png",
    "w": 1,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_restaurant_party_ing_chili_sauce",
    "name": "慶功宴食材－甜辣醬",
    "role": "floor",
    "file": "images/餐廳/慶功宴/ing-chili-sauce.png",
    "w": 1,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_restaurant_party_ing_broth",
    "name": "慶功宴食材－高湯",
    "role": "floor",
    "file": "images/餐廳/慶功宴/ing-broth.png",
    "w": 1,
    "h": 1,
    "flat": true
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
    "id": "tile_restaurant_green_tea",
    "name": "綠茶",
    "role": "floor",
    "file": "images/餐廳/restaurant-greentea.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_restaurant_kitchen_workstation_clear",
    "name": "料理台（乾淨版）",
    "role": "floor",
    "file": "images/餐廳/restaurant-kitchen-workstation-clear.png",
    "w": 2,
    "h": 3
  },
  {
    "id": "tile_restaurant_rice_cooker",
    "name": "電鍋",
    "role": "floor",
    "file": "images/餐廳/restaurant-ricecooker.png",
    "w": 1,
    "h": 1
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
    "id": "tile_mrt_room_wall",
    "name": "捷運灰牆",
    "role": "floor",
    "file": "images/捷運車站/mrt-room-wall.png",
    "w": 1,
    "h": 3
  },
  {
    "id": "tile_mrt_room_highwall",
    "name": "捷運灰高牆",
    "role": "floor",
    "file": "images/捷運車站/mrt-room-highwall.png",
    "w": 1,
    "h": 6
  },
  {
    "id": "tile_mrt_room_highwall03",
    "name": "捷運灰高牆（加高）",
    "role": "floor",
    "file": "images/捷運車站/mrt-room-highwall03.png",
    "w": 1,
    "h": 9
  },
  {
    "id": "tile_mrt_room_pillar",
    "name": "捷運灰柱",
    "role": "floor",
    "file": "images/捷運車站/mrt-room-Pillar.png",
    "w": 1,
    "h": 4
  },
  {
    "id": "tile_mrt_pillar_a",
    "name": "捷運方柱",
    "role": "floor",
    "file": "images/捷運車站/pillar_A.png",
    "w": 2,
    "h": 8
  },
  {
    "id": "tile_mrt_pillar_a02",
    "name": "捷運方柱（加高）",
    "role": "floor",
    "file": "images/捷運車站/pillar_A02.png",
    "w": 2,
    "h": 10
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
    "h": 4,
    "flat": true
  },
  {
    "id": "tile_mrt_escalator_front_high",
    "name": "手扶梯（正面・高）",
    "role": "floor",
    "file": "images/捷運車站/mrt-escalator-front-high.png",
    "w": 5,
    "h": 8,
    "flat": true
  },
  {
    "id": "tile_mrt_escalator_front_high02",
    "name": "手扶梯（正面・加高）",
    "role": "floor",
    "file": "images/捷運車站/mrt-escalator-front-high02.png",
    "w": 5,
    "h": 11,
    "flat": true
  },
  {
    "id": "tile_mrt_escalator_front_high03",
    "name": "手扶梯（正面・高・灰牆）",
    "role": "floor",
    "file": "images/捷運車站/mrt-escalator-front-high03.png",
    "w": 5,
    "h": 8,
    "flat": true
  },
  {
    "id": "tile_mrt_escalator_front_high04",
    "name": "手扶梯（正面・加高・灰牆）",
    "role": "floor",
    "file": "images/捷運車站/mrt-escalator-front-high04.png",
    "w": 5,
    "h": 11,
    "flat": true
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
    "file": "images/Poolcore/poolcore-wall-corner.png",
    "w": 1,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_poolcore_wall_vertical",
    "name": "池核｜直向牆面",
    "role": "floor",
    "file": "images/Poolcore/poolcore-wall-vertical.png",
    "w": 1,
    "h": 3,
    "flat": true
  },
  {
    "id": "tile_poolcore_floor_blue",
    "name": "池核｜藍色地磚",
    "role": "floor",
    "file": "images/Poolcore/poolcore-floor-blue.png",
    "w": 1,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_poolcore_floor_gradient",
    "name": "池核｜漸層地磚",
    "role": "floor",
    "file": "images/Poolcore/poolcore-floor-gradient.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_poolcore_deep_water_gradient",
    "name": "池核｜深水漸層",
    "role": "floor",
    "file": "images/Poolcore/poolcore-deep-water-gradient.png",
    "w": 1,
    "h": 5,
    "flat": true
  },
  {
    "id": "tile_poolcore_deep_water",
    "name": "池核｜深色水面",
    "role": "floor",
    "file": "images/Poolcore/poolcore-deep-water.png",
    "w": 1,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_poolcore_wall_wide",
    "name": "池核｜橫向牆面",
    "role": "floor",
    "file": "images/Poolcore/poolcore-wall-wide.png",
    "w": 2,
    "h": 3,
    "flat": true
  },
  {
    "id": "tile_poolcore_wall_edge",
    "name": "池核｜牆面收邊",
    "role": "floor",
    "file": "images/Poolcore/poolcore-wall-edge.png",
    "w": 2,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_poolcore_floor_pale",
    "name": "池核｜淺色地磚",
    "role": "floor",
    "file": "images/Poolcore/poolcore-floor-pale.png",
    "w": 1,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_poolcore_wall_edge_wide",
    "name": "池核｜寬版牆面收邊",
    "role": "floor",
    "file": "images/Poolcore/poolcore-wall-edge-wide.png",
    "w": 2,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_mv1cfh6l",
    "name": "poolcore-wall-corner02",
    "role": "floor",
    "file": "images/Poolcore/poolcore-wall-corner02.png",
    "w": 1,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_mv1cftaj",
    "name": "poolcore-wall-edge-wide02",
    "role": "floor",
    "file": "images/Poolcore/poolcore-wall-edge-wide02.png",
    "w": 2,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_poolcore_life_ring_blue",
    "name": "池核｜藍白救生圈",
    "role": "floor",
    "file": "images/Poolcore/Poolcore-life-ring_blue.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_poolcore_life_ring_red",
    "name": "池核｜紅白救生圈",
    "role": "floor",
    "file": "images/Poolcore/Poolcore-life-ring_red.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_poolcore_waterline_wall",
    "name": "池核｜條紋水線牆",
    "role": "floor",
    "file": "images/Poolcore/poolcore-waterline-wall.png",
    "w": 2,
    "h": 3,
    "flat": true
  },
  {
    "id": "tile_poolcore_floor_l",
    "name": "池核｜地板（大）",
    "role": "floor",
    "file": "images/Poolcore/poolcore_floor_L.png",
    "w": 3,
    "h": 3,
    "flat": true
  },
  {
    "id": "tile_poolcore_floor_m",
    "name": "池核｜地板（中）",
    "role": "floor",
    "file": "images/Poolcore/poolcore_floor_M.png",
    "w": 2,
    "h": 2,
    "flat": true
  },
  {
    "id": "tile_poolcore_floor_s",
    "name": "池核｜地板（小）",
    "role": "floor",
    "file": "images/Poolcore/poolcore_floor_S.png",
    "w": 1,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_poolcore_pillar",
    "name": "池核｜柱子",
    "role": "floor",
    "file": "images/Poolcore/Poolcore_Pillar.png",
    "w": 2,
    "h": 5
  },
  {
    "id": "tile_poolcore_ammo_crate",
    "name": "池核｜彈藥箱",
    "role": "floor",
    "file": "images/Poolcore/Poolcore_ammo-crate.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_poolcore_backpack",
    "name": "池核｜背包",
    "role": "floor",
    "file": "images/Poolcore/Poolcore_Backpack.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_poolcore_camp_bed",
    "name": "池核｜行軍床",
    "role": "floor",
    "file": "images/Poolcore/Poolcore_camp-bed.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_poolcore_camp_bed_v",
    "name": "池核｜行軍床（直）",
    "role": "floor",
    "file": "images/Poolcore/Poolcore_camp-bed-vertical.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_poolcore_camp_bed_fail",
    "name": "池核｜行軍床（直・壞掉）",
    "role": "floor",
    "file": "images/Poolcore/Poolcore_camp-bed-fail.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_poolcore_camp_bed_fail02",
    "name": "池核｜行軍床（壞掉）",
    "role": "floor",
    "file": "images/Poolcore/Poolcore_camp-bed-fail02.png",
    "w": 2,
    "h": 2
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
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_field_ammo_crate_empty",
    "name": "彈藥箱（空）",
    "role": "floor",
    "file": "images/field-camp/ammo-crate_empty.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_field_supply_box",
    "name": "物資箱",
    "role": "floor",
    "file": "images/field-camp/field-base-01.png",
    "w": 2,
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
    "id": "tile_bg_backroom_wall02_crack_breakable",
    "name": "後室牆面（裂縫・可炸開）",
    "role": "floor",
    "file": "images/background/Back-room-wall02-damage-03.png",
    "w": 3,
    "h": 3
  },
  {
    "id": "tile_bg_backroom_wall02_crack_secret",
    "name": "後室牆面（裂縫・可炸開・隱藏區）",
    "role": "floor",
    "file": "images/background/Back-room-wall02-damage-03.png",
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
    "id": "tile_bg_extra_high_pillar02",
    "name": "後室高柱（加高）",
    "role": "floor",
    "file": "images/background/Back-room-highPillar02.png",
    "w": 1,
    "h": 10
  },
  {
    "id": "tile_bg_extra_high_wall02",
    "name": "後室高牆（加高）",
    "role": "floor",
    "file": "images/background/Back-room-highwall02.png",
    "w": 1,
    "h": 9
  },
  {
    "id": "tile_bg_extra_oil_drum_background",
    "name": "油桶（背景素材）",
    "role": "floor",
    "file": "images/item-decorate/Oil_drum_V2.png",
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
  },
  {
    "id": "tile_interactive_pickup_adrenaline",
    "name": "拾取亮點（腎上腺素）",
    "role": "floor",
    "file": "images/裝備/adrenaline-injector.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_mvfjt47h",
    "name": "Back-room-floor_M",
    "role": "floor",
    "file": "images/background/Back-room-floor_M.png",
    "w": 2,
    "h": 2,
    "flat": true
  },
  {
    "id": "tile_mvfjtda0",
    "name": "Back-room-floor_L",
    "role": "floor",
    "file": "images/background/Back-room-floor_L.png",
    "w": 3,
    "h": 3,
    "flat": true
  },
  {
    "id": "tile_bg_backroom_floor_l",
    "name": "後室地板（大）",
    "role": "floor",
    "file": "images/background/Back-room-floor_L.png",
    "w": 3,
    "h": 3,
    "flat": true
  },
  {
    "id": "tile_bg_backroom_floor_m",
    "name": "後室地板（中）",
    "role": "floor",
    "file": "images/background/Back-room-floor_M.png",
    "w": 2,
    "h": 2,
    "flat": true
  },
  {
    "id": "tile_bg_station_floor_l",
    "name": "車站地磚（大）",
    "role": "floor",
    "file": "images/background/station-floor_L.png",
    "w": 3,
    "h": 3
  },
  {
    "id": "tile_bg_station_floor_m",
    "name": "車站地磚（中）",
    "role": "floor",
    "file": "images/background/station-floor_M.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_hq_floor_l",
    "name": "指揮部地板（大）",
    "role": "floor",
    "file": "images/指揮部/hq-floor_L.png",
    "w": 3,
    "h": 3
  },
  {
    "id": "tile_hq_floor_m",
    "name": "指揮部地板（中）",
    "role": "floor",
    "file": "images/指揮部/hq-floor_M.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_training_terminal",
    "name": "訓練終端機",
    "role": "floor",
    "file": "images/地下訓練室/training-terminal.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_training_gun_table",
    "name": "槍械展示桌",
    "role": "floor",
    "file": "images/地下訓練室/training-gun-table.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_training_table",
    "name": "訓練桌",
    "role": "floor",
    "file": "images/地下訓練室/training-table.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_training_shooting_lane",
    "name": "射擊靶道",
    "role": "floor",
    "file": "images/地下訓練室/training-shooting-lane.png",
    "w": 3,
    "h": 8,
    "flat": true
  },
  {
    "id": "tile_training_hazard_frame",
    "name": "訓練區警示框線",
    "role": "floor",
    "file": "images/地下訓練室/training-hazard-frame.png",
    "w": 15,
    "h": 14,
    "flat": true
  },
  {
    "id": "tile_mvfogen9",
    "name": "containment-glass-door02",
    "role": "floor",
    "file": "images/地下訓練室/containment-glass-door02.png",
    "w": 16,
    "h": 3
  },
  {
    "id": "tile_mvfonrdd",
    "name": "containment-glass-door03",
    "role": "floor",
    "file": "images/地下訓練室/containment-glass-door03.png",
    "w": 2,
    "h": 3
  },
  {
    "id": "tile_training_bench",
    "name": "長椅",
    "role": "floor",
    "file": "images/地下訓練室/training-bench.png",
    "w": 2,
    "h": 1
  },
  {
    "id": "tile_eoc_floor_sign_1f",
    "name": "樓層標示 1F",
    "role": "floor",
    "file": "images/應變中心/floor-sign-1F.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_eoc_floor_sign_2f",
    "name": "樓層標示 2F",
    "role": "floor",
    "file": "images/應變中心/floor-sign-2F.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_eoc_floor_sign_3f",
    "name": "樓層標示 3F",
    "role": "floor",
    "file": "images/應變中心/floor-sign-3F.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_eoc_floor_sign_4f",
    "name": "樓層標示 4F",
    "role": "floor",
    "file": "images/應變中心/floor-sign-4F.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_eoc_floor_sign_b1",
    "name": "樓層標示 B1",
    "role": "floor",
    "file": "images/應變中心/floor-sign-B1.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_eoc_floor_sign_b2",
    "name": "樓層標示 B2",
    "role": "floor",
    "file": "images/應變中心/floor-sign-B2.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_eoc_floor_sign_b3",
    "name": "樓層標示 B3",
    "role": "floor",
    "file": "images/應變中心/floor-sign-B3.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_eoc_floor_sign_b4",
    "name": "樓層標示 B4",
    "role": "floor",
    "file": "images/應變中心/floor-sign-B4.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_mvh22eh2",
    "name": "double-door-open02",
    "role": "floor",
    "file": "images/收容觀察室/double-door-open02.png",
    "w": 3,
    "h": 4
  },
  {
    "id": "tile_mvi1thjl",
    "name": "escape-stairs02",
    "role": "floor",
    "file": "images/應變中心/escape-stairs02.png",
    "w": 5,
    "h": 4,
    "flat": true
  },
  {
    "id": "tile_mvma4ws7",
    "name": "ammo-crate02",
    "role": "floor",
    "file": "images/field-camp/ammo-crate02.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_mvmo40q4",
    "name": "field-base-fail",
    "role": "floor",
    "file": "images/field-camp/field-base-fail.png",
    "w": 11,
    "h": 8,
    "flat": true
  },
  {
    "id": "tile_mvmo6xof",
    "name": "hole01",
    "role": "floor",
    "file": "images/破損建築/hole01.png",
    "w": 2,
    "h": 2,
    "flat": true
  },
  {
    "id": "tile_mvmo77lx",
    "name": "hole02",
    "role": "floor",
    "file": "images/破損建築/hole02.png",
    "w": 3,
    "h": 2,
    "flat": true
  },
  {
    "id": "tile_mvmo7lty",
    "name": "rubble-rocks03",
    "role": "floor",
    "file": "images/破損建築/rubble-rocks03.png",
    "w": 2,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_mvmum9xe",
    "name": "camp-bed-fail",
    "role": "floor",
    "file": "images/field-camp/camp-bed-fail.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_mvmums35",
    "name": "camp-bed-fail02",
    "role": "floor",
    "file": "images/field-camp/camp-bed-fail02.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_mvnn2p1x",
    "name": "vending-machine-purple",
    "role": "floor",
    "file": "images/scene-props/vending-machine-purple.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_mvoa0cqd",
    "name": "Poolcore_wall_02",
    "role": "floor",
    "file": "images/Poolcore/Poolcore_wall_02.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_mvobex5o",
    "name": "Poolcore_door",
    "role": "floor",
    "file": "images/Poolcore/Poolcore_door.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_mvobzfro",
    "name": "Poolcore_door_2",
    "role": "floor",
    "file": "images/Poolcore/Poolcore_door_2.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_mvocpp0c",
    "name": "Poolcore_wall_01",
    "role": "floor",
    "file": "images/Poolcore/Poolcore_wall_01.png",
    "w": 2,
    "h": 4
  },
  {
    "id": "tile_mvoddiqi",
    "name": "Poolcore_wall_01_2",
    "role": "floor",
    "file": "images/Poolcore/Poolcore_wall_01_2.png",
    "w": 2,
    "h": 4
  },
  {
    "id": "tile_mvodgug9",
    "name": "Poolcore_wall_01_3",
    "role": "floor",
    "file": "images/Poolcore/Poolcore_wall_01_3.png",
    "w": 2,
    "h": 4
  },
  {
    "id": "tile_mvoe808h",
    "name": "Poolcore_field-base",
    "role": "floor",
    "file": "images/Poolcore/Poolcore_field-base.png",
    "w": 12,
    "h": 9,
    "flat": true,
    "baseHp": 2000,
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
        2,
        7
      ],
      [
        3,
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
    "baseDepth": 5
  },
  {
    "id": "tile_mvofs5nu",
    "name": "Poolcore_warning_line",
    "role": "floor",
    "file": "images/Poolcore/Poolcore_warning_line.png",
    "w": 11,
    "h": 6,
    "flat": true
  },
  {
    "id": "tile_mvortyiv",
    "name": "Poolcore_field-generator",
    "role": "floor",
    "file": "images/Poolcore/Poolcore_field-generator.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_mvory18h",
    "name": "Poolcore_field-base-02",
    "role": "floor",
    "file": "images/Poolcore/Poolcore_field-base-02.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_mvot2yuu",
    "name": "Poolcore_field-base-01",
    "role": "floor",
    "file": "images/Poolcore/Poolcore_field-base-01.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_mvot3dds",
    "name": "Poolcore_field-base-03",
    "role": "floor",
    "file": "images/Poolcore/Poolcore_field-base-03.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_mvotgy7w",
    "name": "Poolcore_ammo-crate-open",
    "role": "floor",
    "file": "images/Poolcore/Poolcore_ammo-crate-open.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_mvotwe6t",
    "name": "Poolcore_ammo_crate02",
    "role": "floor",
    "file": "images/Poolcore/Poolcore_ammo_crate02.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_mvoanvn6",
    "name": "building",
    "role": "floor",
    "file": "images/回憶場景/building.png",
    "w": 22,
    "h": 18,
    "flat": true
  },
  {
    "id": "tile_mvoarums",
    "name": "building_door",
    "role": "floor",
    "file": "images/回憶場景/building_door.png",
    "w": 3,
    "h": 3
  },
  {
    "id": "tile_memory_building_v2",
    "name": "building_v2",
    "role": "floor",
    "file": "images/回憶場景/building_v2.png",
    "w": 22,
    "h": 18,
    "flat": true
  },
  {
    "id": "tile_memory_building_door_v2",
    "name": "building_door_v2",
    "role": "floor",
    "file": "images/回憶場景/building_door_v2.png",
    "w": 3,
    "h": 3
  },
  {
    "id": "tile_mvpa0o8b",
    "name": "Back-room-wall05",
    "role": "floor",
    "file": "images/background/Back-room-wall05.png",
    "w": 2,
    "h": 3
  },
  {
    "id": "tile_mvpa16jw",
    "name": "Back-room-wall06",
    "role": "floor",
    "file": "images/background/Back-room-wall06.png",
    "w": 2,
    "h": 4
  },
  {
    "id": "tile_mvp8n5zs",
    "name": "Poolcore_LED",
    "role": "floor",
    "file": "images/Poolcore/Poolcore_LED.png",
    "w": 2,
    "h": 1
  },
  {
    "id": "tile_mvp8nxz4",
    "name": "Poolcore_LED_glow",
    "role": "floor",
    "file": "images/Poolcore/Poolcore_LED_glow.png",
    "w": 2,
    "h": 1
  },
  {
    "id": "tile_mvph143o",
    "name": "Poolcore_block_dwn_L",
    "role": "floor",
    "file": "images/Poolcore/Poolcore_block_dwn_L.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_mvph19b4",
    "name": "Poolcore_block_dwn_M",
    "role": "floor",
    "file": "images/Poolcore/Poolcore_block_dwn_M.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_mvph1e62",
    "name": "Poolcore_block_dwn_R",
    "role": "floor",
    "file": "images/Poolcore/Poolcore_block_dwn_R.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_mvph1jix",
    "name": "Poolcore_block_up_L",
    "role": "floor",
    "file": "images/Poolcore/Poolcore_block_up_L.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_mvph1odn",
    "name": "Poolcore_block_up_M",
    "role": "floor",
    "file": "images/Poolcore/Poolcore_block_up_M.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_mvph1tds",
    "name": "Poolcore_block_up_R",
    "role": "floor",
    "file": "images/Poolcore/Poolcore_block_up_R.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_mvpj1fdy",
    "name": "Poolcore_deep_area",
    "role": "floor",
    "file": "images/Poolcore/Poolcore_deep_area.png",
    "w": 2,
    "h": 1
  },
  {
    "id": "tile_mvpj53ld",
    "name": "Poolcore_No_diving",
    "role": "floor",
    "file": "images/Poolcore/Poolcore_No_diving.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_mvpj60hi",
    "name": "Poolcore_notice",
    "role": "floor",
    "file": "images/Poolcore/Poolcore_notice.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_mvquvyy8",
    "name": "Poolcore_notice_slip",
    "role": "floor",
    "file": "images/Poolcore/Poolcore_notice_slip.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_mvqv5agz",
    "name": "Poolcore_No_diving_02",
    "role": "floor",
    "file": "images/Poolcore/Poolcore_No_diving_02.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_mvqyrysf",
    "name": "Poolcore_duck",
    "role": "floor",
    "file": "images/Poolcore/Poolcore_duck.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_mvr11rba",
    "name": "Poolcore_notice_deep",
    "role": "floor",
    "file": "images/Poolcore/Poolcore_notice_deep.png",
    "w": 2,
    "h": 4
  },
  {
    "id": "tile_mvr11zmd",
    "name": "Poolcore_No_diving_03",
    "role": "floor",
    "file": "images/Poolcore/Poolcore_No_diving_03.png",
    "w": 2,
    "h": 4
  },
  {
    "id": "tile_mvr2fi62",
    "name": "Poolcore-pool_stair_block_02",
    "role": "floor",
    "file": "images/Poolcore/Poolcore-pool_stair_block_02.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_mvr2g292",
    "name": "Poolcore-pool_stair_block",
    "role": "floor",
    "file": "images/Poolcore/Poolcore-pool_stair_block.png",
    "w": 2,
    "h": 1
  },
  {
    "id": "tile_mvr32pqo",
    "name": "Poolcore-pool_stair_block_01",
    "role": "floor",
    "file": "images/Poolcore/Poolcore-pool_stair_block_01.png",
    "w": 2,
    "h": 1
  },
  {
    "id": "tile_mvr3kqob",
    "name": "Poolcore-stair_full",
    "role": "floor",
    "file": "images/Poolcore/Poolcore-stair_full.png",
    "w": 4,
    "h": 2
  },
  {
    "id": "tile_mvr3la0q",
    "name": "Poolcore-stair_middle",
    "role": "floor",
    "file": "images/Poolcore/Poolcore-stair_middle.png",
    "w": 4,
    "h": 2
  },
  {
    "id": "tile_mvr3nuyx",
    "name": "Poolcore-stair_full_02",
    "role": "floor",
    "file": "images/Poolcore/Poolcore-stair_full_02.png",
    "w": 4,
    "h": 2
  },
  {
    "id": "tile_mvr40sp8",
    "name": "Poolcore-pool_stair_block_Straight",
    "role": "floor",
    "file": "images/Poolcore/Poolcore-pool_stair_block_Straight.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_halloween_pumpkin_large",
    "name": "南瓜燈（大）",
    "role": "floor",
    "file": "images/萬聖節裝飾/halloween-pumpkin-large.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_halloween_pumpkin_medium",
    "name": "南瓜燈（中）",
    "role": "floor",
    "file": "images/萬聖節裝飾/halloween-pumpkin-medium.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_halloween_pumpkin_small",
    "name": "南瓜燈（小）",
    "role": "floor",
    "file": "images/萬聖節裝飾/halloween-pumpkin-small.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_halloween_pumpkin_pile",
    "name": "南瓜燈堆",
    "role": "floor",
    "file": "images/萬聖節裝飾/halloween-pumpkin-pile.png",
    "w": 2,
    "h": 1
  },
  {
    "id": "tile_halloween_bat",
    "name": "蝙蝠",
    "role": "floor",
    "file": "images/萬聖節裝飾/halloween-bat.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_halloween_spider_web",
    "name": "蜘蛛網",
    "role": "floor",
    "file": "images/萬聖節裝飾/halloween-spider-web.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_halloween_bunting",
    "name": "萬聖節三角旗",
    "role": "floor",
    "file": "images/萬聖節裝飾/halloween-bunting.png",
    "w": 4,
    "h": 1
  },
  {
    "id": "tile_mvwilme2",
    "name": "floor-03",
    "role": "floor",
    "file": "images/01-station-hall/floor-03.png",
    "w": 2,
    "h": 2,
    "flat": true
  },
  {
    "id": "tile_mvwj8b1i",
    "name": "glass-floor",
    "role": "floor",
    "file": "images/background/glass-floor.png",
    "w": 2,
    "h": 2,
    "flat": true
  },
  {
    "id": "tile_mvxf5so7",
    "name": "Poolcore_round_arch",
    "role": "floor",
    "file": "images/Poolcore/Poolcore_round_arch.png",
    "w": 14,
    "h": 8
  },
  {
    "id": "tile_mvxgf9gt",
    "name": "Poolcore_Pillar_cut",
    "role": "floor",
    "file": "images/Poolcore/Poolcore_Pillar_cut.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_mvybeuxg",
    "name": "Poolcore_wall_coner_01",
    "role": "floor",
    "file": "images/Poolcore/Poolcore_wall_coner_01.png",
    "w": 3,
    "h": 5
  },
  {
    "id": "tile_mvyf045t",
    "name": "Return Area",
    "role": "floor",
    "file": "images/餐廳/Return Area.png",
    "w": 2,
    "h": 1
  },
  {
    "id": "tile_mvymwgxl",
    "name": "Poolcore_ammo-crate",
    "role": "floor",
    "file": "images/Poolcore/Poolcore_ammo-crate.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_mvyo15bc",
    "name": "Poolcore_power-switch-off",
    "role": "floor",
    "file": "images/Poolcore/Poolcore_power-switch-off.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_poolcore_power_switch_on",
    "name": "Poolcore_power-switch-on",
    "role": "floor",
    "file": "images/Poolcore/Poolcore_power-switch-on.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_mvyw7lrk",
    "name": "mrt-room-wall-straight",
    "role": "floor",
    "file": "images/捷運車站/mrt-room-wall-straight.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_mvzbgmzf",
    "name": "Poolcore_wall_coner_L_up",
    "role": "floor",
    "file": "images/Poolcore/Poolcore_wall_coner_L_up.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_mvzbmx47",
    "name": "Poolcore_wall_coner_L_up",
    "role": "floor",
    "file": "images/Poolcore/Poolcore_wall_coner_L_up.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_mvzbn4vv",
    "name": "Poolcore_wall_coner_R_dwn",
    "role": "floor",
    "file": "images/Poolcore/Poolcore_wall_coner_R_dwn.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_mvzbna04",
    "name": "Poolcore_wall_coner_R_up",
    "role": "floor",
    "file": "images/Poolcore/Poolcore_wall_coner_R_up.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_mvzbolt4",
    "name": "Poolcore_wall_coner_L_dwn",
    "role": "floor",
    "file": "images/Poolcore/Poolcore_wall_coner_L_dwn.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_mvzbvnsy",
    "name": "Poolcore_wall_coner_03",
    "role": "floor",
    "file": "images/Poolcore/Poolcore_wall_coner_03.png",
    "w": 2,
    "h": 3
  },
  {
    "id": "tile_mvzc5x73",
    "name": "Poolcore_wall_coner_02",
    "role": "floor",
    "file": "images/Poolcore/Poolcore_wall_coner_02.png",
    "w": 3,
    "h": 2
  },
  {
    "id": "tile_forest_bg_forest",
    "name": "bg_forest",
    "role": "decor",
    "file": "images/森林/bg_forest.png",
    "w": 18,
    "h": 14,
    "flat": true
  },
  {
    "id": "tile_forest_bg_forest_light",
    "name": "bg_forest_light",
    "role": "decor",
    "file": "images/森林/bg_forest_light.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_forest_bg_forest_nest",
    "name": "bg_forest_Nest",
    "role": "decor",
    "file": "images/森林/bg_forest_Nest.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_forest_bg_forest_nest_egg",
    "name": "bg_forest_Nest_egg",
    "role": "decor",
    "file": "images/森林/bg_forest_Nest_egg.png",
    "w": 2,
    "h": 2,
    "flat": true
  },
  {
    "id": "tile_forest_bg_forest_night",
    "name": "bg_forest_night",
    "role": "decor",
    "file": "images/森林/bg_forest_night.png",
    "w": 18,
    "h": 14,
    "flat": true
  },
  {
    "id": "tile_forest_bg_outside",
    "name": "bg_outside",
    "role": "decor",
    "file": "images/森林/bg_outside.png",
    "w": 18,
    "h": 14,
    "flat": true
  },
  {
    "id": "tile_forest_bg_outside_farm01",
    "name": "bg_outside_farm01",
    "role": "decor",
    "file": "images/森林/bg_outside_farm01.png",
    "w": 6,
    "h": 4,
    "flat": true
  },
  {
    "id": "tile_forest_bg_outside_house",
    "name": "bg_outside_house",
    "role": "decor",
    "file": "images/森林/bg_outside_house.png",
    "w": 9,
    "h": 9
  },
  {
    "id": "tile_forest_bg_outside_tree02",
    "name": "bg_outside_tree02",
    "role": "decor",
    "file": "images/森林/bg_outside_tree02.png",
    "w": 3,
    "h": 4
  },
  {
    "id": "tile_forest_layer_114_copy_7",
    "name": "forest_layer_114_copy_7",
    "role": "decor",
    "file": "images/森林/forest_layer_114_copy_7.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_forest_layer_115_copy_15",
    "name": "forest_layer_115_copy_15",
    "role": "decor",
    "file": "images/森林/forest_layer_115_copy_15.png",
    "w": 4,
    "h": 2
  },
  {
    "id": "tile_forest_layer_117",
    "name": "forest_layer_117",
    "role": "decor",
    "file": "images/森林/forest_layer_117.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_forest_layer_123",
    "name": "forest_layer_123",
    "role": "decor",
    "file": "images/森林/forest_layer_123.png",
    "w": 1,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_forest_layer_124_copy",
    "name": "forest_layer_124_copy",
    "role": "decor",
    "file": "images/森林/forest_layer_124_copy.png",
    "w": 2,
    "h": 2,
    "flat": true
  },
  {
    "id": "tile_forest_layer_125",
    "name": "forest_layer_125",
    "role": "decor",
    "file": "images/森林/forest_layer_125.png",
    "w": 2,
    "h": 1
  },
  {
    "id": "tile_forest_layer_126",
    "name": "forest_layer_126",
    "role": "decor",
    "file": "images/森林/forest_layer_126.png",
    "w": 2,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_forest_layer_127",
    "name": "forest_layer_127",
    "role": "decor",
    "file": "images/森林/forest_layer_127.png",
    "w": 1,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_forest_layer_130",
    "name": "forest_layer_130",
    "role": "decor",
    "file": "images/森林/forest_layer_130.png",
    "w": 2,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_forest_layer_131",
    "name": "forest_layer_131",
    "role": "decor",
    "file": "images/森林/forest_layer_131.png",
    "w": 2,
    "h": 2,
    "flat": true
  },
  {
    "id": "tile_forest_layer_132",
    "name": "forest_layer_132",
    "role": "decor",
    "file": "images/森林/forest_layer_132.png",
    "w": 2,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_forest_layer_133",
    "name": "forest_layer_133",
    "role": "decor",
    "file": "images/森林/forest_layer_133.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_forest_layer_134",
    "name": "forest_layer_134",
    "role": "decor",
    "file": "images/森林/forest_layer_134.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_forest_layer_135",
    "name": "forest_layer_135",
    "role": "decor",
    "file": "images/森林/forest_layer_135.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_forest_layer_136",
    "name": "forest_layer_136",
    "role": "decor",
    "file": "images/森林/forest_layer_136.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_forest_layer_149",
    "name": "forest_layer_149",
    "role": "decor",
    "file": "images/森林/forest_layer_149.png",
    "w": 6,
    "h": 5
  },
  {
    "id": "tile_forest_layer_150",
    "name": "forest_layer_150",
    "role": "decor",
    "file": "images/森林/forest_layer_150.png",
    "w": 5,
    "h": 6
  },
  {
    "id": "tile_forest_layer_151",
    "name": "forest_layer_151",
    "role": "decor",
    "file": "images/森林/forest_layer_151.png",
    "w": 4,
    "h": 6
  },
  {
    "id": "tile_forest_layer_152",
    "name": "forest_layer_152",
    "role": "decor",
    "file": "images/森林/forest_layer_152.png",
    "w": 3,
    "h": 2
  },
  {
    "id": "tile_forest_layer_153",
    "name": "forest_layer_153",
    "role": "decor",
    "file": "images/森林/forest_layer_153.png",
    "w": 5,
    "h": 3
  },
  {
    "id": "tile_forest_layer_155",
    "name": "forest_layer_155",
    "role": "decor",
    "file": "images/森林/forest_layer_155.png",
    "w": 3,
    "h": 3
  },
  {
    "id": "tile_forest_layer_157_copy_2",
    "name": "forest_layer_157_copy_2",
    "role": "decor",
    "file": "images/森林/forest_layer_157_copy_2.png",
    "w": 7,
    "h": 7,
    "flat": true
  },
  {
    "id": "tile_forest_layer_157_copy_3",
    "name": "forest_layer_157_copy_3",
    "role": "decor",
    "file": "images/森林/forest_layer_157_copy_3.png",
    "w": 9,
    "h": 10,
    "flat": true
  },
  {
    "id": "tile_forest_layer_157_copy",
    "name": "forest_layer_157_copy",
    "role": "decor",
    "file": "images/森林/forest_layer_157_copy.png",
    "w": 5,
    "h": 4,
    "flat": true
  },
  {
    "id": "tile_forest_layer_158",
    "name": "forest_layer_158",
    "role": "decor",
    "file": "images/森林/forest_layer_158.png",
    "w": 4,
    "h": 3
  },
  {
    "id": "tile_forest_layer_159",
    "name": "forest_layer_159",
    "role": "decor",
    "file": "images/森林/forest_layer_159.png",
    "w": 6,
    "h": 9
  },
  {
    "id": "tile_forest_layer_160",
    "name": "forest_layer_160",
    "role": "decor",
    "file": "images/森林/forest_layer_160.png",
    "w": 4,
    "h": 9
  },
  {
    "id": "tile_forest_layer_161",
    "name": "forest_layer_161",
    "role": "decor",
    "file": "images/森林/forest_layer_161.png",
    "w": 8,
    "h": 10
  },
  {
    "id": "tile_forest_layer_162",
    "name": "forest_layer_162",
    "role": "decor",
    "file": "images/森林/forest_layer_162.png",
    "w": 8,
    "h": 9
  },
  {
    "id": "tile_forest_layer_166",
    "name": "forest_layer_166",
    "role": "decor",
    "file": "images/森林/forest_layer_166.png",
    "w": 4,
    "h": 3,
    "flat": true
  },
  {
    "id": "tile_forest_layer_167",
    "name": "forest_layer_167",
    "role": "decor",
    "file": "images/森林/forest_layer_167.png",
    "w": 3,
    "h": 2,
    "flat": true
  },
  {
    "id": "tile_forest_layer_168",
    "name": "forest_layer_168",
    "role": "decor",
    "file": "images/森林/forest_layer_168.png",
    "w": 2,
    "h": 2,
    "flat": true
  },
  {
    "id": "tile_forest_layer_34_copy_4",
    "name": "forest_layer_34_copy_4",
    "role": "decor",
    "file": "images/森林/forest_layer_34_copy_4.png",
    "w": 4,
    "h": 1
  },
  {
    "id": "tile_forest_layer_45_copy",
    "name": "forest_layer_45_copy",
    "role": "decor",
    "file": "images/森林/forest_layer_45_copy.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_forest_layer_46_copy",
    "name": "forest_layer_46_copy",
    "role": "decor",
    "file": "images/森林/forest_layer_46_copy.png",
    "w": 2,
    "h": 1
  },
  {
    "id": "tile_forest_layer_48_copy",
    "name": "forest_layer_48_copy",
    "role": "decor",
    "file": "images/森林/forest_layer_48_copy.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_forest_layer_49_copy",
    "name": "forest_layer_49_copy",
    "role": "decor",
    "file": "images/森林/forest_layer_49_copy.png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_forest_gradient",
    "name": "forest_gradient",
    "role": "decor",
    "file": "images/森林/forest_gradient.png",
    "w": 1,
    "h": 3
  },
  {
    "id": "tile_forest_group_13_1",
    "name": "forest_group_13_1",
    "role": "decor",
    "file": "images/森林/forest_group_13_1.png",
    "w": 3,
    "h": 3,
    "flat": true
  },
  {
    "id": "tile_forest_group_13",
    "name": "forest_group_13",
    "role": "decor",
    "file": "images/森林/forest_group_13.png",
    "w": 2,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_forest_group_19",
    "name": "forest_group_19",
    "role": "decor",
    "file": "images/森林/forest_group_19.png",
    "w": 10,
    "h": 12
  },
  {
    "id": "tile_forest_group_20",
    "name": "forest_group_20",
    "role": "decor",
    "file": "images/森林/forest_group_20.png",
    "w": 7,
    "h": 4
  },
  {
    "id": "tile_forest_group_2002",
    "name": "forest_group_2002",
    "role": "decor",
    "file": "images/森林/forest_group_2002.png",
    "w": 7,
    "h": 4
  },
  {
    "id": "tile_forest_group_7_copy_12",
    "name": "forest_group_7_copy_12",
    "role": "decor",
    "file": "images/森林/forest_group_7_copy_12.png",
    "w": 3,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_forest_group_8_copy_2",
    "name": "forest_group_8_copy_2",
    "role": "decor",
    "file": "images/森林/forest_group_8_copy_2.png",
    "w": 1,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_forest_group_8_copy",
    "name": "forest_group_8_copy",
    "role": "decor",
    "file": "images/森林/forest_group_8_copy.png",
    "w": 1,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_mw47qirk",
    "name": "Poolcore_slide",
    "role": "floor",
    "file": "images/Poolcore/Poolcore_slide.png",
    "w": 3,
    "h": 6
  },
  {
    "id": "tile_mw49f97t",
    "name": "poolcore_ladder",
    "role": "floor",
    "file": "images/Poolcore/poolcore_ladder.png",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_mw4d9qnu",
    "name": "Poolcore_swimring",
    "role": "floor",
    "file": "images/Poolcore/Poolcore_swimring.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_mw4mgrxq",
    "name": "Army_box",
    "role": "floor",
    "file": "images/研究部/Army_box.png",
    "w": 3,
    "h": 3
  },
  {
    "id": "tile_mw4rtg2b",
    "name": "Furniture",
    "role": "floor",
    "file": "images/scene-props/Furniture.png",
    "w": 1,
    "h": 1
  },
  {
    "id": "tile_prop_furniture_173",
    "name": "長沙發",
    "role": "floor",
    "file": "images/scene-props/Furniture (173).png",
    "w": 2,
    "h": 1
  },
  {
    "id": "tile_prop_furniture_438",
    "name": "木矮櫃",
    "role": "floor",
    "file": "images/scene-props/Furniture (438).png",
    "w": 2,
    "h": 1
  },
  {
    "id": "tile_prop_furniture_475",
    "name": "書櫃",
    "role": "floor",
    "file": "images/scene-props/Furniture (475).png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_forest_ancient_tree",
    "name": "forest_ancient_tree",
    "role": "decor",
    "file": "images/森林/forest_ancient_tree.png",
    "w": 12,
    "h": 11
  },
  {
    "id": "tile_forest_ancient_tree_crimson_small",
    "name": "forest_ancient_tree_crimson_small",
    "role": "decor",
    "file": "images/森林/forest_ancient_tree_crimson_small.png",
    "w": 12,
    "h": 11
  },
  {
    "id": "tile_forest_small_tree",
    "name": "forest_small_tree",
    "role": "decor",
    "file": "images/森林/forest_small_tree.png",
    "w": 4,
    "h": 6
  },
  {
    "id": "tile_forest_tree_door",
    "name": "forest_tree_door",
    "role": "decor",
    "file": "images/森林/forest_tree_door.png",
    "w": 12,
    "h": 11
  },
  {
    "id": "tile_forest_twisted_tree_crimson_small",
    "name": "forest_twisted_tree_crimson_small",
    "role": "decor",
    "file": "images/森林/forest_twisted_tree_crimson_small.png",
    "w": 8,
    "h": 11
  },
  {
    "id": "tile_forest_twisted_tree_dark",
    "name": "forest_twisted_tree_dark",
    "role": "decor",
    "file": "images/森林/forest_twisted_tree_dark.png",
    "w": 8,
    "h": 11
  },
  {
    "id": "tile_forest_twisted_tree_dark_crystal",
    "name": "forest_twisted_tree_dark_crystal",
    "role": "decor",
    "file": "images/森林/forest_twisted_tree_dark_crystal.png",
    "w": 8,
    "h": 11
  },
  {
    "id": "tile_forest_bg_outside_tree02_crimson",
    "name": "bg_outside_tree02_crimson",
    "role": "decor",
    "file": "images/森林/bg_outside_tree02_crimson.png",
    "w": 3,
    "h": 4
  },
  {
    "id": "tile_forest_group_19_crimson",
    "name": "forest_group_19_crimson",
    "role": "decor",
    "file": "images/森林/forest_group_19_crimson.png",
    "w": 10,
    "h": 12
  },
  {
    "id": "tile_forest_layer_149_crimson",
    "name": "forest_layer_149_crimson",
    "role": "decor",
    "file": "images/森林/forest_layer_149_crimson.png",
    "w": 6,
    "h": 5
  },
  {
    "id": "tile_forest_layer_150_crimson",
    "name": "forest_layer_150_crimson",
    "role": "decor",
    "file": "images/森林/forest_layer_150_crimson.png",
    "w": 5,
    "h": 6
  },
  {
    "id": "tile_forest_layer_151_crimson",
    "name": "forest_layer_151_crimson",
    "role": "decor",
    "file": "images/森林/forest_layer_151_crimson.png",
    "w": 4,
    "h": 6
  },
  {
    "id": "tile_forest_layer_159_crimson",
    "name": "forest_layer_159_crimson",
    "role": "decor",
    "file": "images/森林/forest_layer_159_crimson.png",
    "w": 3,
    "h": 9
  },
  {
    "id": "tile_forest_layer_160_crimson",
    "name": "forest_layer_160_crimson",
    "role": "decor",
    "file": "images/森林/forest_layer_160_crimson.png",
    "w": 4,
    "h": 9
  },
  {
    "id": "tile_forest_layer_161_crimson",
    "name": "forest_layer_161_crimson",
    "role": "decor",
    "file": "images/森林/forest_layer_161_crimson.png",
    "w": 6,
    "h": 10
  },
  {
    "id": "tile_forest_layer_16202",
    "name": "forest_layer_16202",
    "role": "decor",
    "file": "images/森林/forest_layer_16202.png",
    "w": 9,
    "h": 12
  },
  {
    "id": "tile_forest_layer_16202_crimson",
    "name": "forest_layer_16202_crimson",
    "role": "decor",
    "file": "images/森林/forest_layer_16202_crimson.png",
    "w": 9,
    "h": 12
  },
  {
    "id": "tile_forest_layer_162_crimson",
    "name": "forest_layer_162_crimson",
    "role": "decor",
    "file": "images/森林/forest_layer_162_crimson.png",
    "w": 6,
    "h": 9
  },
  {
    "id": "tile_forest_small_tree_crimson",
    "name": "forest_small_tree_crimson",
    "role": "decor",
    "file": "images/森林/forest_small_tree_crimson.png",
    "w": 4,
    "h": 6
  },
  {
    "id": "tile_forest_tree_door_crimson",
    "name": "forest_tree_door_crimson",
    "role": "decor",
    "file": "images/森林/forest_tree_door_crimson.png",
    "w": 12,
    "h": 11
  },
  {
    "id": "tile_forest_wood_bridge_short",
    "name": "forest_wood_bridge_short",
    "role": "decor",
    "file": "images/森林/forest_wood_bridge_short.png",
    "w": 3,
    "h": 4,
    "flat": true
  },
  {
    "id": "tile_forest_wood_bridge_long",
    "name": "forest_wood_bridge_long",
    "role": "decor",
    "file": "images/森林/forest_wood_bridge_long.png",
    "w": 3,
    "h": 6,
    "flat": true
  },
  {
    "id": "tile_mw5ha8w3",
    "name": "Furniture (422)",
    "role": "floor",
    "file": "images/scene-props/Furniture (422).png",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_prop_furniture_422",
    "name": "L 型沙發",
    "role": "floor",
    "file": "images/scene-props/Furniture (422).png",
    "w": 2,
    "h": 1
  },
  {
    "id": "tile_mw5jkg1u",
    "name": "restaurant-gasstove",
    "role": "floor",
    "file": "images/餐廳/restaurant-gasstove.png",
    "w": 3,
    "h": 3
  },
  {
    "id": "tile_mw5yx368",
    "name": "banquet-buffet-01",
    "role": "floor",
    "file": "data:image/png;base64,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",
    "w": 4,
    "h": 2
  },
  {
    "id": "tile_mw5zi7xa",
    "name": "banquet-bunting-2",
    "role": "floor",
    "file": "data:image/png;base64,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",
    "w": 4,
    "h": 1,
    "flat": true
  },
  {
    "id": "tile_mw60u20k",
    "name": "banquet-buffet-02",
    "role": "floor",
    "file": "data:image/png;base64,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",
    "w": 4,
    "h": 2
  },
  {
    "id": "tile_mw628w22",
    "name": "banquet-buffet-03",
    "role": "floor",
    "file": "data:image/png;base64,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",
    "w": 4,
    "h": 2
  }
];
