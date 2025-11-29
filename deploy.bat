@echo off
TITLE PassFortress Deployment Script

echo 🚀 Starting PassFortress Full Deployment...
echo -------------------------------------------

REM 1. Install dependencies
echo 📦 Step 1/6: Installing project dependencies (npm install)...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to install dependencies
    exit /b 1
)
echo ✅ Dependencies installed.
echo.

REM 2. Log in to Cloudflare
echo 👤 Step 2/6: Logging in to Cloudflare...
echo Your browser will open for you to log in and authorize Wrangler.
call npx wrangler login
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to log in to Cloudflare
    exit /b 1
)
echo ✅ Logged in successfully.
echo.

REM 3. Create the D1 database
echo 🗄️ Step 3/6: Creating D1 Database 'passfortress-db'...
echo Note: If the database already exists, this step will not fail.
call npx wrangler d1 create passfortress-db
echo ✅ Database creation step completed.
echo.

REM 4. Apply the database schema
echo 📋 Step 4/6: Applying database schema...
call npx wrangler d1 execute passfortress-db --file=./schema.sql
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to apply database schema
    exit /b 1
)
echo ✅ Schema applied.
echo.

REM 5. Deploy the application
echo ☁️ Deploying to Cloudflare Pages...
call npx wrangler pages deploy . --project-name=passfortress
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Deployment failed
    exit /b 1
)

echo -------------------------------------------
echo 🎉 DEPLOYMENT COMPLETE! 🎉
echo Your PassFortress application is now live.
echo -------------------------------------------