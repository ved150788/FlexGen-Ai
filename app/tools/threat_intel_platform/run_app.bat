@echo off
echo Starting FlexGen Threat Intelligence Platform with Real Data...

rem Check if database exists, if not create it
if not exist "threat_intel.db" (
  echo Database not found, creating it with real data...
  call venv\Scripts\activate.bat
  python fetch_alienvault.py
) else (
  echo Database found, using existing data...
)

call venv\Scripts\activate.bat

rem Run the enhanced API server with real data
python api_server.py 
