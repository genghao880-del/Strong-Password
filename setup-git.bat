@echo off
chcp 65001 >nul
set PATH=%PATH%;D:\Program Files\Git\bin;D:\Program Files\Git\cmd
git config user.email "user@example.com"
git config user.name "PassFortress"
git add .
git commit -m "Initial commit"
echo Repository ready! Create GitHub repo and push.
