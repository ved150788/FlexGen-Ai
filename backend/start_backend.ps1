# Start Backend Server for Threat Intelligence Platform
# This script sets up the Python environment and starts the Flask server

Write-Host "Starting Threat Intelligence Backend Server..." -ForegroundColor Green

# Check if Python is installed
try {
    $pythonVersion = python --version
    Write-Host "Python detected: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: Python is not installed. Please install Python before running this script." -ForegroundColor Red
    exit 1
}

# Get script directory
$scriptDir = Split-Path -Path $MyInvocation.MyCommand.Path -Parent

# Check if virtual environment exists, create if it doesn't
$venvPath = Join-Path $scriptDir "venv"
if (-not (Test-Path $venvPath)) {
    Write-Host "Creating Python virtual environment..." -ForegroundColor Yellow
    python -m venv $venvPath
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& "$venvPath\Scripts\Activate.ps1"

# Install required packages
Write-Host "Installing required packages..." -ForegroundColor Yellow
pip install -r requirements.txt

# Set environment variables
$env:FLASK_APP = "app.py"
$env:FLASK_ENV = "development"

# Start the Flask server
Write-Host "Starting Flask server on http://localhost:5000..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow

python app.py 