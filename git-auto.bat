@echo off
set PATH=%PATH%;D:\Program Files\Git\bin;D:\Program Files\Git\cmd
git config --global user.email "user@example.com"
git config --global user.name "PassFortress User"
git add .
git commit -m "Initial commit: PassFortress"
echo Done! Repository ready.
echo.
echo Next: Create GitHub repo at https://github.com/new
echo Then run: git remote add origin YOUR_REPO_URL
echo Then run: git push -u origin main
pause
