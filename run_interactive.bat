@echo off
setlocal
chcp 65001 >nul
set "PYTHONUTF8=1"
set "PYTHONIOENCODING=utf-8"
echo Starting Biomni Interactive Mode...
cd /d "%~dp0"
"C:\Users\xjtul\AppData\Local\Programs\Python\Python312\python.exe" interactive_mode.py
pause
