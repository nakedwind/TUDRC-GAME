/* 捷運列車的設定：由物件編輯器「🚇 捷運列車」匯出（js/mrt-train.js 讀）。
   門洞位置是原圖像素（車廂圖 1040×160）：x＝三個門洞的左緣；y、w、h＝門洞的上緣、寬、高；art＝門的圖裡門板的範圍 [x, y, w, h]。
   cells＝車廂的格子圖（一列一串字，由上往下）：# 擋路、. 車內地板、D 外側門口、F 對面通道（兩側車門都開時才走得過）。
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
  "doorPassAt": 0.7,
  "frontSortDy": 10,
  "doorSortDy": -3,
  "soundGain": 0.55,
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
