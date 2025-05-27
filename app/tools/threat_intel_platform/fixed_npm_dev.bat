@echo off
echo Starting FlexGen development environment with Threat Intelligence...

cd /d %~dp0
call venv\Scripts\activate.bat

echo Setting up Python path...
set PYTHONPATH=%~dp0..\..\..\

echo Starting Next.js app...
cd /d %~dp0..\..\..
start cmd /c "npm run dev"

echo Starting Threat Intelligence Platform...
cd /d %~dp0
python app.py

pause
