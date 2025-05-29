@echo off
echo Starting Threat Intelligence Backend Server...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed. Please install Python before running this script.
    pause
    exit /b 1
)

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install required packages
echo Installing required packages...
pip install -r requirements.txt

REM Set environment variables
set FLASK_APP=app.py
set FLASK_ENV=development

REM Start the Flask server
echo Starting Flask server on http://localhost:5000...
echo Press Ctrl+C to stop the server
python app.py

pause 