/* 捷運列車的設定：由物件編輯器「🚇 捷運列車」匯出（js/mrt-train.js 讀）。
   門洞位置是原圖像素（車廂圖 1040×160）：x＝三個門洞的左緣；y、w、h＝門洞的上緣、寬、高；art＝門的圖裡門板的範圍 [x, y, w, h]。
   cells＝車廂的格子圖（一列一串字，由上往下）：# 擋路、. 車內地板、D 外側門口、F 對面通道（兩側車門都開時才走得過）。
   stations＝互通的捷運站（搭上車會隨機開到「另一個」車站；arrive＝這個車站的到站音樂，音效編輯器裡的名稱）。
   nextTrainTime＝沒搭上車／不小心搭上車的隊員，幾秒後才搭下一班車到站。
   秒數、速度的意思見 js/mrt-train.js 最上面的 MRT_TRAIN。 */
const MRT_TRAIN_SETTINGS = {
  "outerDoor": { "x": [132, 468, 804], "y": 59, "w": 112, "h": 87, "art": [2, 16, 116, 87] },
  "farDoor": { "x": [113, 449, 785], "y": 15, "w": 112, "h": 84, "art": [3, 17, 114, 86] },
  "arriveSoundLead": 5,
  "firstWait": 8,
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
  "stations": [{"map":"map_mvxz356e","name":"R89區-紅線捷運站","arrive":"mrtArriveRed"},{"map":"map_mwizzi7s","name":"B56區-藍線捷運站","arrive":"mrtArriveBlue"}],
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
