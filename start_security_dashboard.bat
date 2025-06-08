@echo off
echo Starting FlexGen.ai Security Dashboard System...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ and try again
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js 18+ and try again
    pause
    exit /b 1
)

echo [1/4] Installing Python dependencies for WebSocket server...
pip install -r websocket_requirements.txt

echo.
echo [2/4] Installing Node.js dependencies...
npm install

echo.
echo [3/4] Starting backend API server...
start "FlexGen API Server" cmd /k "python api_server.py"

echo.
echo [4/4] Starting WebSocket server for real-time updates...
start "Security Dashboard WebSocket" cmd /k "python websocket_server.py"

echo.
echo [5/5] Starting Next.js frontend...
timeout /t 3 /nobreak >nul
start "FlexGen Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo Security Dashboard System Started!
echo ========================================
echo.
echo Frontend: http://localhost:3000
echo Security Dashboard: http://localhost:3000/security-dashboard
echo API Server: http://localhost:5000
echo WebSocket Server: ws://localhost:5001
echo.
echo Press any key to open the Security Dashboard in your browser...
pause >nul

start http://localhost:3000/security-dashboard

echo.
echo System is running. Close this window to stop all services.
echo To stop individual services, close their respective command windows.
pause 