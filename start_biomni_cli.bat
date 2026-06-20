@echo off
setlocal

cd /d "%~dp0"

set "PYEXE="

where python >nul 2>nul
if %errorlevel%==0 (
  set "PYEXE=python"
)

if not defined PYEXE (
  where py >nul 2>nul
  if %errorlevel%==0 (
    set "PYEXE=py"
  )
)

if not defined PYEXE (
  if exist "%LOCALAPPDATA%\Programs\Python\Python312\python.exe" (
    set "PYEXE=%LOCALAPPDATA%\Programs\Python\Python312\python.exe"
  )
)

if not defined PYEXE (
  if exist "%LOCALAPPDATA%\Programs\Python\Python311\python.exe" (
    set "PYEXE=%LOCALAPPDATA%\Programs\Python\Python311\python.exe"
  )
)

if not defined PYEXE (
  echo Cannot find Python.
  echo Please install Python, or edit this file and set PYEXE to python.exe.
  pause
  exit /b 1
)

"%PYEXE%" student_cli.py

pause
