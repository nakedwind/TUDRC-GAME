# 花蓮版權老鼠 RPG 素材

來源為使用者提供的「花蓮版權老鼠」資料夾。17 張獨立 PNG 原像素、透明度與 110×90 共用畫布完整保留，只整理英文檔名；中文對照在 source-map.json。未使用 AI 重繪或重新壓縮圖片。

- 本體出土：hole → mouse-emerge → mouse-hole-open。
- 待機眨眼：mouse-hole-open → mouse-hole-half → mouse-hole-closed → mouse-hole-half。
- 本體入土：出土順序反向。
- 左手攻擊：left-hole → left-hand-rise → left-hand-hole → left-hand-rise；右手使用 right 組。
- 不含洞口的 mouse-open／half／closed、left-hand／right-hand 保留給其他 RPG 系統組合使用。

所有圖以同一個畫布位置對齊，請勿逐張裁掉透明邊緣，否則動畫會跳動。遊戲以腳底中央為基準，貼圖底部位於世界 y+13；原圖地洞邊緣約在畫布 y=74。保持 nearest-neighbor／pixelated 縮放。

怪物 ID 是 burrowing_mouse，behavior 是 burrow。數值與 art 映射經怪物編輯器匯出到 data/monsters.js。可在怪物編輯器調整出土時間、預警時間、手部速度、攻擊距離／半徑、間隔，以及一般 HP／傷害。再於地圖編輯器的怪物種類／權重選用；本次不更改既有地圖的怪物配置。

機制：地底手先鎖定落點並顯示橘圈，預警後才命中一次；玩家離開該落點即可閃避。手與本體分開深度排序，暈眩／睡眠可取消蓄力中的手，死亡後縮回地洞。地下移動沿既有尋路，不穿牆；本體在入土／移動時仍可受傷，沒有隱藏無敵階段。

怪物編輯器的「單隻測試場」可直接用目前設定實際移動、射擊與閃避。測試場會隔離原有的測試生怪，不改正式地圖，也不寫入正式遊戲進度；可按 P 暫停查看動作。重新挑戰會重新放入同一隻怪物。
