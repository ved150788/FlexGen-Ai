@echo off
REM Start the FlexGen Email Backend in production mode using Gunicorn on Windows

REM Activate virtual environment if it exists
if exist venv\Scripts\activate.bat (
    call venv\Scripts\activate.bat
)

REM Check if .env file exists
if not exist .env (
    echo Warning: .env file not found. Email functionality may not work correctly.
)

REM Start Gunicorn with 4 worker processes
gunicorn --bind 0.0.0.0:5000 wsgi:application --workers 4

pause 