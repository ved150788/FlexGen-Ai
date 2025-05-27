# run_api_with_real_data.ps1
# This script runs the API server with real data from the database

Write-Host "Starting the Threat Intelligence API server with real data..." -ForegroundColor Green

# Define file paths
$apiServerPath = Join-Path $PSScriptRoot "api_server.py"
$fetcherPath = Join-Path $PSScriptRoot "fetch_alienvault.py"
$dbPath = Join-Path $PSScriptRoot "threat_intel.db"

# Check if virtual environment exists, create if it doesn't
$venvPath = Join-Path $PSScriptRoot "venv"
if (-not (Test-Path $venvPath)) {
    Write-Host "Creating Python virtual environment..." -ForegroundColor Yellow
    python -m venv $venvPath
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& "$venvPath\Scripts\Activate.ps1"

# Install required packages
Write-Host "Installing required packages..." -ForegroundColor Yellow
pip install requests 2>&1 | Out-Null

# Check if database exists, fetch data if needed
if (-not (Test-Path $dbPath) -or (Get-Item $dbPath).Length -lt 10000) {
    Write-Host "Database doesn't exist or is empty. Fetching data from AlienVault..." -ForegroundColor Yellow
    python $fetcherPath
} else {
    Write-Host "Database exists with real data." -ForegroundColor Green
}

# Start API server
Write-Host "Starting API server with real data on port 5000..." -ForegroundColor Green
python $apiServerPath

Write-Host "API server has been stopped." -ForegroundColor Yellow 