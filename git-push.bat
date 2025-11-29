@echo off
set PATH=%PATH%;D:\Program Files\Git\bin;D:\Program Files\Git\cmd
set /p REPO="Enter your GitHub repo URL: "
git remote add origin %REPO%
git branch -M main
git push -u origin main
pause
