@echo off
echo Starting FlexGen Threat Intelligence Platform Integration Fix...
echo.

rem Create and activate virtual environment if it doesn't exist
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)

rem Activate virtual environment
call venv\Scripts\activate.bat

rem Install missing dependencies
echo Installing flask-migrate...
pip install flask-migrate

echo.
echo Setup complete!
echo Run the platform with: python app.py
echo.

rem Run the platform if requested
set /p RUN_NOW=Do you want to run the platform now? (y/n): 
if /i "%RUN_NOW%"=="y" (
    python app.py
)

pause 