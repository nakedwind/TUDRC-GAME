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
    "file": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAbgAAAFACAYAAADOC2nHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFFmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNi4wLWMwMDIgNzkuMTY0NDg4LCAyMDIwLzA3LzEwLTIyOjA2OjUzICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjIuMCAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDI2LTA5LTI1VDAxOjM0OjI5KzA4OjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyNi0wOS0yNVQwMTozNjoxNSswODowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyNi0wOS0yNVQwMTozNjoxNSswODowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDoxZDRkOGVmMi05MDBiLWQw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",
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
    "file": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFFmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNi4wLWMwMDIgNzkuMTY0NDg4LCAyMDIwLzA3LzEwLTIyOjA2OjUzICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjIuMCAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDI2LTA5LTI1VDAyOjI5OjA5KzA4OjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyNi0wOS0yNVQwMjoyOTozNSswODowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyNi0wOS0yNVQwMjoyOTozNSswODowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDozODg5ZTNiMC1hMWM3LWU0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",
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
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_field_ammo_crate_empty",
    "name": "彈藥箱（空）",
    "role": "floor",
    "file": "images/field-camp/ammo-crate_empty.png",
    "w": 1,
    "h": 1
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
    "h": 2
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
    "file": "data:image/png;base64,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",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_mvmo40q4",
    "name": "field-base-fail",
    "role": "floor",
    "file": "data:image/png;base64,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",
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
    "file": "data:image/png;base64,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",
    "w": 1,
    "h": 2
  },
  {
    "id": "tile_mvmums35",
    "name": "camp-bed-fail02",
    "role": "floor",
    "file": "data:image/png;base64,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",
    "w": 2,
    "h": 2
  },
  {
    "id": "tile_mvnn2p1x",
    "name": "vending-machine-purple",
    "role": "floor",
    "file": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAADoElEQVR4nO2cPWgUQRTH98Q0FnJaGQxoOFAjRiXpVCSFQqKFlYJFhBSiFqLGRpuA6Y2KhYqFYAohnYXJgSJB1O6CGvFUCBoIRBH0EElzxcpb2XVn3d37eB83e74fHDn23c3O/O+9mXmzk8k5ROQ61kBBLlV5zOTc6grJHVYT1tM9dugeYXF8TE2PwA9N4jyrLG1jZiAVcOHTvPXtpq6jeiASFRCJCohEBUSiAiJRAZFQTqQ9sjCVoYRcwFJ5oqUNqkV/zyhpeaQCFrp7nUK3/elcqUxXlvaBSMhDOMzU9IhgU5LhXORgExDEezL7gqv4hjgwsJdNRFYPhIq3O6wCdnZtskK+5aVFtrJZBXRiKh8WVdrGAauA0Jill0XjWteeQa9RYKvMPDZs+aGDge3552eGbd/m/YHt450xw7bl1HhgW5hZNmyFoU7ydoVh98A0vr9+51nX79re0Pd+LW6UrWgKOg9E0lIP9PE9MYuoByJRAZGogEgodyYYD9ZtTuWgbm51haTtmsoh0VQOiaZySNhTuQs37hvXrp07kZp2+bbJB6cN2/Dx24HtTfGmYds5eDawzd06Ytj6zjwkb1cYHYWRqIBIRFK5L/MdErdpCeweGBZvQ2/VtvajEQ3hdvREUQHb0QM1lUOiqRwSTeWQaCqHhD2VS3vyNjk7Z9iGB/oC29gjM10bP/w3XSs+vRRc//a1YqR5cakjJ6KjcDlPF0ogHLyinO/fRnaPemAXkFI0GxHxQGkRJb2QXcCeiuxIfL30XvR+on2gpJhSXqjLWUg0lUOiqRwSNgGz8s/XWKzYXERNdHN7JjeZO03u0o/2VY18PvydrTt2e38/vH3lXcvcJvNmB5Foh+8LEQeIE0dYPHif9DkKrA9hzsZTYLWAtcI5KXx90ryXiswMIvX2YeHwbfS7zWC9gGkDSS1hJKZSVgsI4qWFYXR0hfe+4FLz0EyE8M/Kj3+urc2vi/2s9AReFxOQWD8KJ/WB8PzDhnTR+hC2PafWEEaiAiJhXc5qZj0wa8tgrH3g/7AmyLoa0yr8H05iUs3qgRLJfBQ/Bwbx/H0xnOuBOoggYZ8HxqVhXCSld5yoByJpWwGhz4N0jzvlYw1hyfCNu1/m1wM5t9bagj5YR0IqIJxeCWcIptklkKyDyHIWVFryZEs4YBFOqkwTkgqRM1RBvIt3R8l2gtXD1ZMTruPQHvcZB6mASV7mi3fl6GXK29Ui90dERhzH+Q3skZCbE7NwLAAAAABJRU5ErkJggg==",
    "w": 2,
    "h": 2
  }
];
