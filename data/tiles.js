/* ===== 素材庫：兩個編輯器共用的磚塊／素材（由「🗺️ 地圖編輯器」或「🏠 基地編輯器」匯出）=====
   在任一個編輯器「⋯ 更多 → ＋ 加入磚塊」加的素材，兩邊都能用；地圖本身還是分開存
   （戰鬥地圖 data/maps.js、基地地圖 data/base-maps.js）。
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
  },
  {
    "id": "tile_bg_backroom_floor_l",
    "name": "後室地板（大）",
    "role": "floor",
    "file": "images/background/Back-room-floor_L.png",
    "w": 3,
    "h": 3
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
    "w": 12,
    "h": 11,
    "flat": true
  },
  {
    "id": "tile_mvfogen9",
    "name": "containment-glass-door02",
    "role": "floor",
    "file": "images/地下訓練室/containment-glass-door02.png",
    "w": 12,
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
    "id": "tile_mvfqc6g7",
    "name": "shoe-cabinet02",
    "role": "floor",
    "file": "images/地下訓練室/shoe-cabinet02.png",
    "w": 2,
    "h": 1
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
    "id": "tile_mvh22eh2",
    "name": "double-door-open02",
    "role": "floor",
    "file": "images/收容觀察室/double-door-open02.png",
    "w": 3,
    "h": 4
  }
];
