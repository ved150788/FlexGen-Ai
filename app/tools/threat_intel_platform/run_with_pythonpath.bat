@echo off
echo ===== FlexGen Threat Intelligence Platform =====
echo Setting up environment...

rem Activate virtual environment
call venv\Scripts\activate.bat

rem Fix missing dependencies
pip install flask-migrate

rem Setup Python path for imports
cd ..\..\..
set PYTHONPATH=%CD%

rem Run the application
echo Starting Threat Intelligence Platform...
cd app\tools\threat_intel_platform
python app.py

echo Application exited.
pause 