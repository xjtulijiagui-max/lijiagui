@echo off
setlocal
chcp 65001 >nul
set "PYTHONUTF8=1"
set "PYTHONIOENCODING=utf-8"

echo ====================================
echo   Biomni 交互模式启动器
echo ====================================
echo.
echo 正在启动 Biomni AI 生物医学助手...
echo.

cd /d "%~dp0"
"C:\Users\xjtul\AppData\Local\Programs\Python\Python312\python.exe" interactive_mode.py

echo.
echo ====================================
echo   程序已结束，按任意键退出
echo ====================================
pause >nul
