@echo off
rem Open editor: start tools\editor-server.py, then open the map editor. See tools\editor-server.py for notes.
rem Keep this file ASCII-only: cmd mis-splits lines containing Chinese text and shows "is not recognized as a command".
cd /d "%~dp0"
start "editor-server" python tools\editor-server.py 8770
timeout /t 1 >nul
start "" "http://127.0.0.1:8770/%%E5%%9C%%B0%%E5%%9C%%96%%E7%%B7%%A8%%E8%%BC%%AF%%E5%%99%%A8.html"
