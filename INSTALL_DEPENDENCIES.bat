@echo off
echo Installing required dependencies...
echo.

echo Installing nodemailer for email...
call npm install nodemailer
call npm install --save-dev @types/nodemailer

echo.
echo ✅ All dependencies installed!
echo.
echo Next steps:
echo 1. Update .env.local with your Gmail credentials
echo 2. Enable 2FA on your Gmail account
echo 3. Generate App Password: https://myaccount.google.com/apppasswords
echo 4. Run: npm run dev
echo.
pause
