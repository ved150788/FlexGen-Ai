@echo off
echo ===== FlexGen Threat Intelligence Platform: Complete Fix =====
echo Installing missing dependencies and fixing Python path issues...

rem Create and activate virtual environment if it doesn't exist
if not exist venv (
    echo Creating Python virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing required packages...
pip install flask flask-migrate flask-sqlalchemy python-dotenv requests apscheduler

rem Create a modified script for running the application with proper path
echo Creating run_app.bat with proper Python path setup...
echo @echo off > run_app.bat
echo echo Starting FlexGen Threat Intelligence Platform... >> run_app.bat
echo call venv\Scripts\activate.bat >> run_app.bat
echo cd ..\..\.. >> run_app.bat
echo set PYTHONPATH=%%CD%% >> run_app.bat
echo cd app\tools\threat_intel_platform >> run_app.bat
echo python app.py >> run_app.bat

echo.
echo ===== Step 1 Complete =====
echo.
echo To complete the setup:
echo 1. Run the PowerShell script to update package.json:
echo    powershell -ExecutionPolicy Bypass -File .\update_package_json.ps1
echo.
echo 2. Go back to the project root:
echo    cd ..\..\..
echo.
echo 3. Run the application:
echo    npm run dev
echo.
echo These steps will ensure the application starts with the correct Python environment.
echo.

pause 