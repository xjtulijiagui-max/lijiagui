@echo off
chcp 65001 >nul
echo ====================================
echo   Biomni Web 界面启动器
echo ====================================
echo.
echo 正在启动 Web 界面...
echo 启动后请在浏览器中打开: http://localhost:5000
echo.

cd /d C:\Users\xjtul\Biomni

C:\Users\xjtul\AppData\Local\Programs\Python\Python312\python.exe flask_web.py

echo.
echo ====================================
echo   Web 服务器已停止
echo   按任意键退出
echo ====================================
pause >nul