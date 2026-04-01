@echo off
echo ============================================
echo Hospital Management System - GitHub Push
echo Repository: sanjutalari/hospital-management-system
echo ============================================
echo.

cd /d "%~dp0"

echo [1/6] Checking git installation...
git --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Git is not installed or not in PATH
    echo Please install Git from https://git-scm.com/download/win
    pause
    exit /b 1
)
echo Git found!

echo.
echo [2/6] Initializing Git repository...
if exist ".git" (
    echo Git repository already exists
) else (
    git init
    if errorlevel 1 (
        echo ERROR: Failed to initialize git
        pause
        exit /b 1
    )
    echo Repository initialized!
)

echo.
echo [3/6] Adding all files...
git add .
if errorlevel 1 (
    echo ERROR: Failed to add files
    pause
    exit /b 1
)
echo Files added!

echo.
echo [4/6] Creating commit...
git commit -m "Initial commit: Hospital Management System" -m "Complete hospital management system with frontend and backend" -m "" -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>" >nul 2>&1
if errorlevel 1 (
    echo No new changes to commit (files may already be committed)
) else (
    echo Commit created!
)

echo.
echo [5/6] Setting branch to main and adding remote...
git branch -M main

git remote get-url origin >nul 2>&1
if errorlevel 1 (
    git remote add origin https://github.com/sanjutalari/hospital-management-system.git
    echo Remote 'origin' added!
) else (
    echo Remote 'origin' already exists
    git remote set-url origin https://github.com/sanjutalari/hospital-management-system.git
    echo Remote 'origin' updated!
)

echo.
echo [6/6] Pushing to GitHub...
echo This may take a moment...
git push -u origin main
if errorlevel 1 (
    echo.
    echo ============================================
    echo Push failed! Common solutions:
    echo ============================================
    echo 1. If remote has content: git pull origin main --rebase
    echo    Then run: git push -u origin main
    echo.
    echo 2. To force push (overwrites remote):
    echo    git push -u origin main --force
    echo.
    echo 3. Check GitHub authentication is configured
    echo ============================================
    pause
    exit /b 1
)

echo.
echo ============================================
echo SUCCESS!
echo ============================================
echo Your code is now on GitHub!
echo https://github.com/sanjutalari/hospital-management-system
echo ============================================
echo.
pause
