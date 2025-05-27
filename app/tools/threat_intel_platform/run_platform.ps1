# Run the threat intelligence platform
Write-Host "Starting FlexGen Threat Intelligence Platform..." -ForegroundColor Cyan

# Activate the virtual environment
if (Test-Path -Path "venv") {
    & .\venv\Scripts\Activate.ps1
} else {
    Write-Host "Virtual environment not found. Creating one..."
    python -m venv venv
    & .\venv\Scripts\Activate.ps1
    pip install flask flask-migrate flask-sqlalchemy python-dotenv requests apscheduler
}

# Run the main entry point that properly configures the Python path
python main.py 