@echo off
rem Asset mover: after renaming asset folders or moving images/sounds, update every path in the project. See tools\asset-move.py for notes.
rem Keep this file ASCII-only: cmd mis-splits lines containing Chinese text and shows "is not recognized as a command".
cd /d "%~dp0"
chcp 65001 >nul
set PYTHONUTF8=1
python tools\asset-move.py %*
echo.
pause
