@echo off
chcp 65001 >nul
rem ===== 開啟編輯器：啟動本機小幫手（tools\editor-server.py），再用瀏覽器打開地圖編輯器 =====
rem 用這個方式打開編輯器，素材圖右鍵「以檔案總管開啟」才能直接打開資料夾。
rem 黑色視窗要開著；關掉就停止。需要電腦有安裝 Python。
cd /d "%~dp0"
start "編輯器小幫手" python tools\editor-server.py 8770
timeout /t 1 >nul
start "" "http://127.0.0.1:8770/地圖編輯器.html"
