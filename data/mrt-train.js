/* 捷運列車的設定：由物件編輯器「🚇 捷運列車」匯出（js/mrt-train.js 讀）。
   門洞位置是原圖像素（車廂圖 1040×160）：x＝三個門洞的左緣；y、w、h＝門洞的上緣、寬、高；art＝門的圖裡門板的範圍 [x, y, w, h]。
   cells＝車廂的格子圖（一列一串字，由上往下）：# 擋路、. 車內地板、D 外側門口、F 對面通道（兩側車門都開時才走得過）。
   stations＝互通的捷運站（搭上車會照順序輪流開到「其他」車站；arrive＝這個車站的到站音樂，音效編輯器裡的名稱；
     name＝搭車到這站時畫面橫幅顯示的站名；color＝橫幅上那條線的顏色）。
   nextTrainTime＝沒搭上車／不小心搭上車的隊員，幾秒後才搭下一班車到站。
   秒數、速度的意思見 js/mrt-train.js 最上面的 MRT_TRAIN。 */
const MRT_TRAIN_SETTINGS = {
  "outerDoor": { "x": [132, 468, 804], "y": 59, "w": 112, "h": 87, "art": [2, 16, 116, 87] },
  "farDoor": { "x": [113, 449, 785], "y": 15, "w": 112, "h": 84, "art": [3, 17, 114, 86] },
  "arriveSoundLead": 5,
  "firstWait": 8,
  "firstStagger": 15,
  "monsterChance": 0.3,
  "monsterMin": 2,
  "monsterMax": 4,
  "smallMonsters": ["slime", "bird_head", "pearl_kid", "fish_head", "milkfish_kid_small", "loofah_lady"],
  "waitMin": 18,
  "waitMax": 30,
  "arriveDecel": 230,
  "departAccel": 170,
  "doorTime": 1.1,
  "dwell": 5,
  "departWarnTime": 5.05,
  "warnTime": 3.76,
  "afterClose": 4.2,
  "rideTime": 6,
  "rideFadeCells": 5,
  "rideShake": 1.6,
  "powerOnShake": 4,
  "powerOnHumDelay": 1.5,
  "doorPassAt": 0.7,
  "frontSortDy": 10,
  "doorSortDy": -3,
  "soundGain": 0.55,
  "arriveFullCells": 3,
  "arriveFadeCells": 30,
  "arriveMergeCells": 60,
  "stations": [{"map":"map_mvxz356e","name":"R89區-紅線捷運站","arrive":"mrtArriveRed","color":"#e3002c"},{"map":"map_mwizzi7s","name":"B56區-藍線捷運站","arrive":"mrtArriveBlue","color":"#0070bd"},{"map":"map_mwm655e8","name":"G11區-綠線捷運站","arrive":"mrtArriveGreen","color":"#008659"},{"map":"map_691cf40a-884b-423d-b1df-beef88b16f00","name":"O666區-橘線捷運站","arrive":"mrtArriveOrange","color":"#f8b61c"}],
  "variants": {"tile_mrt_train_car_head_red":{"name":"紅色列車（O666 被花蓮老鼠王卡住的那班）","middle":"tile_mrt_train_car_middle_red","outerDoor":"images/捷運車站/mrt-train-door-red.png","farDoor":"images/捷運車站/mrt-train-door-2-red.png","dest":"map_mr4mbd88","destName":"03. 台北車站大廳（之後換成最後的 BOSS 地圖）"}},
  "nextTrainTime": 120,
  "cells": {
    "middle": [
      "###FFF#####FFF######FFF###",
      "###FFF#####FFF######FFF###",
      "..........................",
      "...DDD......DD......DDD..."
    ],
    "head": [
      "###FFF#####FFF######FFF###",
      "###FFF#####FFF######FFF###",
      ".........................#",
      "...DDD......DD......DDD..#"
    ]
  }
};
