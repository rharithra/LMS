@echo off
echo Starting Leave Management System...
echo.

echo Stopping any existing processes...
taskkill /f /im node.exe >nul 2>&1

echo Starting Database Server on port 5001...
cd /d "%~dp0server"
start "Database Server" cmd /k "node server.js"

echo Waiting for server to start...
timeout /t 5 /nobreak >nul

echo Starting React Client...
cd /d "%~dp0client"
set REACT_APP_API_URL=http://localhost:5001
start "React Client" cmd /k "npm start"

echo.
echo Both servers are starting...
echo Database Server: http://localhost:5001
echo React Client: Will open automatically
echo.
echo Login with: admin@company.com / password123
pause
