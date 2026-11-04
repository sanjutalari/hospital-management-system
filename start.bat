@echo off
title HMS - Hospital Management System
color 0A

echo ============================================
echo    Hospital Management System - Starter
echo ============================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found. Please install it from https://nodejs.org
    pause
    exit /b 1
)

cd /d "%~dp0"

echo [1/2] Starting Backend on http://localhost:3001 ...
start "HMS Backend" cmd /k "cd /d "%~dp0backend" && npm start"

echo [2/2] Starting Frontend on http://localhost:5173 ...
start "HMS Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

timeout /t 5 >nul
echo.
echo ============================================
echo   Frontend  : http://localhost:5173
echo   Backend   : http://localhost:3001
echo ============================================
echo.
echo Database is SQLite (backend/prisma/dev.db)
echo Default logins:
echo   Admin  : admin@hms.com  / admin123
echo   Doctor : doctor@hms.com / doctor123
echo   Patient: patient@hms.com / patient123
echo.
echo To stop: close the two terminal windows.
pause