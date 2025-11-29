@echo off
echo 🚀 PassFortress Git Setup Script
echo ================================

REM Add Git to PATH
set PATH=%PATH%;D:\Program Files\Git\bin;D:\Program Files\Git\cmd

REM Initialize Git repository
echo 📦 Initializing Git repository...
git init
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to initialize Git
    pause
    exit /b 1
)

REM Add all files
echo 📝 Adding all files...
git add .

REM Create initial commit
echo 💾 Creating initial commit...
git commit -m "Initial commit: PassFortress password manager"

echo.
echo ✅ Git repository initialized successfully!
echo.
echo 📋 Next steps:
echo 1. Create a new repository on GitHub (https://github.com/new)
echo 2. Run: git remote add origin https://github.com/YOUR_USERNAME/passfortress.git
echo 3. Run: git branch -M main
echo 4. Run: git push -u origin main
echo.
pause
