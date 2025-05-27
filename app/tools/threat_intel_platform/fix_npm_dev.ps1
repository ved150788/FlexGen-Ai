# Simple fix script for the Threat Intelligence Platform
Write-Host "Installing missing dependencies..." -ForegroundColor Yellow

# Create and activate virtual environment
if (-not (Test-Path -Path "venv")) {
    python -m venv venv
}

# Activate the virtual environment
& .\venv\Scripts\Activate.ps1

# Install required packages
pip install flask-migrate flask-sqlalchemy python-dotenv requests apscheduler

Write-Host "Dependencies installed successfully!" -ForegroundColor Green

# Create .env file with the correct API key
$envContent = @"
# Threat Intelligence Platform - Environment Variables

# Flask Application Settings
SECRET_KEY=flexgen_threat_intel_key_1234
FLASK_ENV=development
DEBUG=True
HOST=0.0.0.0
PORT=5000
THREAT_INTEL_PORT=5050
RUN_CRAWLERS_ON_START=false

# Database Settings
DATABASE_URL=sqlite:///threat_intel.db

# Crawler Settings - Global
ENABLE_ALL_CRAWLERS=true

# AlienVault OTX Settings
ENABLE_ALIENVAULT_CRAWLER=true
ALIENVAULT_API_KEY=61b8bc7b26584345ce93d6ac72ce015ec6c37e9f1ae37fc99ba2951acbdea1a2
ALIENVAULT_EMAIL=vedprakash150788@gmail.com
ALIENVAULT_FREQUENCY=0 */6 * * *
ALIENVAULT_HOURS_BACK=24

# Scheduler settings
SCHEDULER_TIMEZONE=UTC
SCHEDULER_JOB_DEFAULTS={"coalesce": true, "max_instances": 1}

# Logging configuration
LOG_LEVEL=INFO
LOG_FORMAT=%(asctime)s - %(name)s - %(levelname)s - %(message)s
"@

$envContent | Out-File -FilePath ".env" -Encoding utf8
Write-Host "Environment configuration created" -ForegroundColor Green

# Create instance directory if it doesn't exist
if (-not (Test-Path -Path "instance")) {
    New-Item -ItemType Directory -Path "instance" | Out-Null
}

# Create batch file for easy startup
$batchContent = @"
@echo off
echo Starting FlexGen development environment with Threat Intelligence...
cd /d %~dp0..\..\..
npm run dev
"@

$batchContent | Out-File -FilePath "fixed_npm_dev.bat" -Encoding ascii
Write-Host "Setup complete! You can now run 'npm run dev' to start the application." -ForegroundColor Green 