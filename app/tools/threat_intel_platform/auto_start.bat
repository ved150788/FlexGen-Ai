@echo off
:: Windows Batch file to automatically start the Threat Intelligence Platform
:: Place this in your Windows Startup folder to start automatically
:: Windows + R, then type: shell:startup

echo Starting FlexGen Threat Intelligence Platform...

:: Navigate to the script directory
cd /d "%~dp0"

:: Start PowerShell with execution policy bypass to run our script
powershell.exe -ExecutionPolicy Bypass -File "%~dp0startup.ps1"

:: Keep window open if there's an error
if %ERRORLEVEL% neq 0 (
    echo Error starting the Threat Intelligence Platform
    pause
) 