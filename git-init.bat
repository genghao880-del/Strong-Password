@echo off
set PATH=%PATH%;D:\Program Files\Git\bin;D:\Program Files\Git\cmd
git init
git add .
git commit -m "Initial commit"
echo Done! Now create GitHub repo and run git-push.bat
pause
