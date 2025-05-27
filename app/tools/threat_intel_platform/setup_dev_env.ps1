# Setup script for the Threat Intelligence Platform development environment
# This script installs missing dependencies and configures the environment

# Navigate to the script directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -Path $scriptPath

Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║      FlexGen Threat Intelligence Platform Setup Utility       ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

# Create virtual environment if it doesn't exist
if (-not (Test-Path -Path "venv")) {
    Write-Host "`n[1/5] Creating Python virtual environment..." -ForegroundColor Yellow
    python -m venv venv
    Write-Host "Virtual environment created successfully!" -ForegroundColor Green
} else {
    Write-Host "`n[1/5] Virtual environment already exists." -ForegroundColor Green
}

# Activate the virtual environment
Write-Host "`n[2/5] Activating virtual environment..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1

# Install required packages including the missing flask_migrate
Write-Host "`n[3/5] Installing required packages..." -ForegroundColor Yellow
pip install -r requirements.txt
pip install flask-migrate

# Create .env file if it doesn't exist
if (-not (Test-Path -Path ".env")) {
    Write-Host "`n[4/5] Creating .env file with configuration..." -ForegroundColor Yellow
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

    $envContent | Out-File -FilePath ".env" -Encoding utf8
    Write-Host ".env file created successfully!" -ForegroundColor Green
} else {
    Write-Host "`n[4/5] .env file already exists." -ForegroundColor Green
}

# Modify package.json to update the dev script
Write-Host "`n[5/5] Modifying npm dev script to properly start the application..." -ForegroundColor Yellow

# First, navigate to the root of the project to find package.json
Set-Location -Path "$scriptPath\..\..\..\"

# Check if package.json exists
if (Test-Path -Path "package.json") {
    # Read the package.json file
    $packageJson = Get-Content -Path "package.json" -Raw | ConvertFrom-Json
    
    # Backup the original dev script
    $originalDevScript = $packageJson.scripts.dev
    
    # Create a new dev script that first sets up the threat intel platform
    $newDevScript = "powershell.exe -ExecutionPolicy Bypass -File `"app/tools/threat_intel_platform/dev_startup.ps1`" -Background && next dev"
    
    # Update the dev script
    $packageJson.scripts.dev = $newDevScript
    
    # Save the modified package.json
    $packageJson | ConvertTo-Json -Depth 10 | Set-Content -Path "package.json"
    
    Write-Host "Package.json updated successfully!" -ForegroundColor Green
    Write-Host "Original dev script: $originalDevScript" -ForegroundColor Gray
    Write-Host "New dev script: $newDevScript" -ForegroundColor Green
} else {
    Write-Host "package.json not found in project root. Skipping this step." -ForegroundColor Yellow
}

# Return to the original directory
Set-Location -Path $scriptPath

Write-Host "`n✓ Setup completed successfully!" -ForegroundColor Green
Write-Host "  You can now run 'npm run dev' to start the application with the threat intelligence platform." -ForegroundColor Cyan

# Ask to create scheduled tasks
$createTasks = Read-Host "`nDo you want to create scheduled tasks for automatic startup? (y/n)"
if ($createTasks -eq "y") {
    Write-Host "Creating scheduled tasks..." -ForegroundColor Yellow
    & .\create_scheduled_task.ps1
}

Write-Host "`nThank you for using FlexGen Threat Intelligence Platform!" -ForegroundColor Cyan 