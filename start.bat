@echo off
echo Starting Threat Intelligence Platform...

:: Check if Python is installed
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Python is not installed or not in PATH. Please install Python and try again.
    pause
    exit /b 1
)

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Node.js is not installed or not in PATH. Please install Node.js and try again.
    pause
    exit /b 1
)

:: Install Python requirements if needed
echo Installing Python requirements...
python -m pip install -r app/tools/threat_intel_platform/requirements.txt

:: Install .env file if it doesn't exist
if not exist .env (
    echo Creating .env file with default settings...
    copy .env.example .env
)

:: Start Flask backend
echo Starting Flask backend...
start cmd /k "python app/tools/threat_intel_platform/app.py"

:: Start Next.js frontend
echo Starting Next.js frontend...
start cmd /k "npm run dev"

echo Threat Intelligence Platform is starting up.
echo - Frontend will be available at: http://localhost:3000/tools/threat-intelligence
echo - Backend API will be available at: http://localhost:5000/api
echo.
echo Close this window to shut down all components.
pause 