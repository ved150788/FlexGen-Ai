@echo off
echo Starting Threat Intelligence Platform with Real Data...

REM Navigate to the threat intel platform directory
cd %~dp0

REM Setup environment if needed
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
    call venv\Scripts\activate.bat
    pip install -r requirements.txt
) else (
    call venv\Scripts\activate.bat
)

REM Check if database exists, if not create it with real data
if not exist "threat_intel.db" (
    echo Database not found, creating it with real data...
    python fetch_alienvault.py
) else (
    echo Refreshing data from AlienVault...
    python fetch_alienvault.py
)

REM Kill any running Python processes that might be using the port
taskkill /F /IM python.exe /FI "WINDOWTITLE eq api_server" 2>nul
timeout /t 1 >nul

REM Start the API server in the background
start "api_server" cmd /c "python api_server.py"
echo API server started on port 5000

REM Wait for API server to initialize
echo Waiting for API server to initialize...
timeout /t 3 >nul

REM Navigate back to project root to run the frontend
cd ..\..\..
echo Starting Next.js frontend...

REM Run Next.js development server directly instead of npm run dev
echo Running: next dev
next dev

REM If Next.js exits, also kill the API server
taskkill /F /IM python.exe /FI "WINDOWTITLE eq api_server" 2>nul

echo All processes have been stopped. 