@echo off
echo Starting Threat Intelligence Platform API with real data...
powershell -ExecutionPolicy Bypass -File "%~dp0run_api_with_real_data.ps1"
if %errorlevel% neq 0 (
  echo An error occurred while running the API server.
  pause
  exit /b %errorlevel%
)
pause 