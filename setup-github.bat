@echo off
setlocal enabledelayedexpansion

echo ============================================
echo Hospital Management System - Complete GitHub Setup
echo ============================================
echo.

REM Initialize git if needed
if not exist ".git" (
    echo Step 1: Initializing Git repository...
    git init
    git branch -M main
) else (
    echo Step 1: Git repository already initialized.
    git branch -M main
)

echo.
echo Step 2: Adding files and creating commit...
git add .
git commit -m "Initial commit: Hospital Management System" -m "Complete hospital management system with frontend and backend" -m "" -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>" 2>nul
if errorlevel 1 (
    echo Files already committed or using existing commits.
) else (
    echo Commit created successfully!
)

echo.
echo Step 3: Checking for existing remote...
git remote -v | findstr origin >nul
if errorlevel 1 (
    echo No remote configured yet.
    echo.
    echo Please enter your GitHub repository URL:
    echo Example: https://github.com/username/repo-name.git
    echo.
    set /p REPO_URL="Repository URL: "
    
    if "!REPO_URL!"=="" (
        echo ERROR: No URL provided
        pause
        exit /b 1
    )
    
    echo.
    echo Adding remote origin...
    git remote add origin !REPO_URL!
    if errorlevel 1 (
        echo ERROR: Failed to add remote
        pause
        exit /b 1
    )
) else (
    echo Remote already configured:
    git remote -v
)

echo.
echo Step 4: Pushing to GitHub...
echo.
git push -u origin main
if errorlevel 1 (
    echo.
    echo Push failed. This might be because:
    echo 1. The repository already has content (try: git pull origin main --rebase)
    echo 2. Authentication failed (check your credentials)
    echo 3. Network issues
    echo.
    echo You can try manually with: git push -u origin main --force
    pause
    exit /b 1
)

echo.
echo ============================================
echo SUCCESS! Repository pushed to GitHub!
echo ============================================
echo.
git remote -v
echo.
pause
