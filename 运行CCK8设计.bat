@echo off
chcp 65001 >nul
echo ====================================
echo   CCK8细胞增殖实验设计专家
echo ====================================
echo.
echo 正在启动CCK8实验设计分析...
echo 将为您提供完整的实验设计方案
echo.

cd /d C:\Users\xjtul\Biomni

C:\Users\xjtul\AppData\Local\Programs\Python\Python312\python.exe cck8_experiment_design.py

echo.
echo ====================================
echo   分析完成！
echo   按任意键退出
echo ====================================
pause >nul