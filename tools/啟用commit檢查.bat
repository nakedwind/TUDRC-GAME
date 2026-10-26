@echo off
chcp 65001 >nul
rem ===== 啟用 commit 前的素材遺失檢查（.githooks/pre-commit）=====
rem 每台電腦、每個 clone 只要雙擊一次。之後每次 commit 都會自動檢查（GitHub Desktop 也會）。
cd /d "%~dp0.."
git config core.hooksPath .githooks
if errorlevel 1 (
  echo 設定失敗：請確認電腦有安裝 git，而且這個資料夾是遊戲的 git 專案。
) else (
  echo 已啟用：之後 commit 時，如果有素材從素材庫消失、或素材圖檔沒加進 git，會先擋下來並列出是哪些。
  echo.
  python -X utf8 tools\check-assets.py
)
pause
