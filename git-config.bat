@echo off
set PATH=%PATH%;D:\Program Files\Git\bin;D:\Program Files\Git\cmd
set /p EMAIL="Enter your email: "
set /p NAME="Enter your name: "
git config --global user.email "%EMAIL%"
git config --global user.name "%NAME%"
git add .
git commit -m "Initial commit"
echo Git configured and committed!
pause
