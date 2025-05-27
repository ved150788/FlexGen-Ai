# PowerShell script to run the Threat Intelligence Platform

# Change to the script directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -Path $scriptPath

# Create .env file with the provided API key
$envContent = @"
# Threat Intelligence Platform - Environment Variables

# Flask Application Settings
SECRET_KEY=flexgen_threat_intel_key_1234
FLASK_ENV=development
DEBUG=True
HOST=0.0.0.0
PORT=5000
THREAT_INTEL_PORT=5050
RUN_CRAWLERS_ON_START=true

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

# Write the .env file
$envContent | Out-File -FilePath ".env" -Encoding utf8

# Create Python virtual environment if it doesn't exist
if (-not (Test-Path -Path "venv")) {
    Write-Host "Creating Python virtual environment..."
    python -m venv venv
}

# Activate the virtual environment
Write-Host "Activating virtual environment..."
& .\venv\Scripts\Activate.ps1

# Install requirements
Write-Host "Installing requirements..."
pip install -r requirements.txt

# Run the application
Write-Host "Starting Threat Intelligence Platform..."
Write-Host "AlienVault API Key configured: 61b8bc7b26584345ce93d6ac72ce015ec6c37e9f1ae37fc99ba2951acbdea1a2"
python app.py 