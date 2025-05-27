# Start_with_real_data.ps1
# This script fetches real AlienVault data and starts the Threat Intelligence Platform with actual data

# Enable error handling
$ErrorActionPreference = "Stop"

Write-Host "Setting up the Threat Intelligence Platform with real data..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node -v
    Write-Host "Node.js detected: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: Node.js is not installed. Please install Node.js before running this script." -ForegroundColor Red
    exit 1
}

# Check if Python is installed
try {
    $pythonVersion = python --version
    Write-Host "Python detected: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: Python is not installed. Please install Python before running this script." -ForegroundColor Red
    exit 1
}

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
    Write-Host "Database already exists. Skipping data fetch." -ForegroundColor Green
    
    # Offer the option to update data
    $updateData = Read-Host "Would you like to update the data from AlienVault? (y/n)"
    if ($updateData -eq 'y' -or $updateData -eq 'Y') {
        Write-Host "Updating data from AlienVault..." -ForegroundColor Yellow
        python $fetcherPath
    }
}

# Get script directory
$scriptDir = Split-Path -Path $MyInvocation.MyCommand.Path -Parent
$rootDir = Split-Path -Path (Split-Path -Path (Split-Path -Path $scriptDir -Parent) -Parent) -Parent

# Start API server in a new process
Write-Host "Starting API server with real data..." -ForegroundColor Green
$apiProcess = Start-Process -FilePath "python" -ArgumentList $apiServerPath -NoNewWindow -PassThru

# Wait a few seconds for the API server to start
Start-Sleep -Seconds 3

# Display API server status
if ($apiProcess.HasExited) {
    Write-Host "Error: API server failed to start" -ForegroundColor Red
    exit 1
} else {
    Write-Host "API server running on http://localhost:5000" -ForegroundColor Green
}

# Go to root directory and start Next.js app
Write-Host "Starting Next.js application..." -ForegroundColor Green
Set-Location $rootDir
npm run dev

# If npm run dev exits, clean up the API server process
Stop-Process -Id $apiProcess.Id -Force -ErrorAction SilentlyContinue
Write-Host "API server has been stopped." -ForegroundColor Yellow

Write-Host "Threat Intelligence Platform shutdown complete." -ForegroundColor Green 