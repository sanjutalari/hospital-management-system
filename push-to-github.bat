@echo off
REM Hospital Management System - Git Push Script
REM This script initializes the repository and pushes to GitHub

echo ============================================
echo Hospital Management System - GitHub Push
echo ============================================
echo.

REM Check if already a git repository
if exist ".git" (
    echo Git repository already initialized.
) else (
    echo Initializing Git repository...
    git init
    if errorlevel 1 (
        echo ERROR: Failed to initialize git repository
        pause
        exit /b 1
    )
)

echo.
echo Adding all files to git...
git add .
if errorlevel 1 (
    echo ERROR: Failed to add files
    pause
    exit /b 1
)

echo.
echo Creating commit...
git commit -m "Initial commit: Hospital Management System" -m "Complete hospital management system with frontend and backend" -m "" -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
if errorlevel 1 (
    echo Note: Files may already be committed or no changes to commit
)

echo.
echo Setting default branch to main...
git branch -M main

echo.
echo ============================================
echo Repository is ready to push!
echo ============================================
echo.
echo OPTION 1: If you haven't created a GitHub repo yet:
echo   1. Go to https://github.com/new
echo   2. Create a new repository
echo   3. Copy the repository URL
echo   4. Run: git remote add origin YOUR_REPO_URL
echo   5. Run: git push -u origin main
echo.
echo OPTION 2: If you already have a GitHub repo URL:
echo   Run: git remote add origin YOUR_REPO_URL
echo   Run: git push -u origin main
echo.
echo OPTION 3: Push to an existing remote:
echo   Run: git push -u origin main
echo.
echo ============================================
echo.
git remote -v
echo.
pause
