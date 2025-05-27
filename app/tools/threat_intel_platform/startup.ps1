# Automated startup script for the Threat Intelligence Platform
# This script will:
# 1. Fetch the latest threat intelligence data from AlienVault
# 2. Start the Threat Intelligence Platform web application

# Navigate to the script directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -Path $scriptPath

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         FlexGen Threat Intelligence Platform Startup       ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

# Run the AlienVault data fetch script
Write-Host "`n[1/2] Fetching real-time threat intelligence data from AlienVault..." -ForegroundColor Yellow
try {
    # Use Start-Process to create a new window and wait for it to complete
    $fetchProcess = Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit -File `"$scriptPath\fetch_alienvault.ps1`"" -PassThru
    Write-Host "Fetch process started with ID: $($fetchProcess.Id)" -ForegroundColor Green
    
    # Wait for the fetch process to complete with a timeout
    $fetchProcess.WaitForExit(300000)  # 5 minute timeout
    
    if ($fetchProcess.HasExited) {
        if ($fetchProcess.ExitCode -eq 0) {
            Write-Host "Threat intelligence data fetch completed successfully!" -ForegroundColor Green
        } else {
            Write-Host "Warning: Fetch process exited with code $($fetchProcess.ExitCode)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "Warning: Fetch process is still running after timeout. Continuing with startup." -ForegroundColor Yellow
    }
} catch {
    Write-Host "Error starting fetch process: $_" -ForegroundColor Red
}

# Start the Threat Intelligence Platform
Write-Host "`n[2/2] Starting the Threat Intelligence Platform..." -ForegroundColor Yellow
try {
    # Start the main application
    Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit -File `"$scriptPath\run_threat_intel.ps1`""
    Write-Host "Threat Intelligence Platform started successfully!" -ForegroundColor Green
    
    # Open the application in the default browser
    Start-Sleep -Seconds 5  # Give the application a few seconds to start
    Start-Process "http://localhost:5000"
    Write-Host "Opening dashboard in web browser..." -ForegroundColor Cyan
} catch {
    Write-Host "Error starting application: $_" -ForegroundColor Red
}

Write-Host "`n✓ Startup sequence completed." -ForegroundColor Green
Write-Host "  Dashboard URL: http://localhost:5000" -ForegroundColor Cyan
Write-Host "  API Endpoint: http://localhost:5000/api/v1" -ForegroundColor Cyan 