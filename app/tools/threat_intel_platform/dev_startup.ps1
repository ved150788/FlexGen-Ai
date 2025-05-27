# Development Environment Startup Script for Threat Intelligence Platform
# This script is optimized for use with VSCode or other IDEs
# It runs in the background with minimal UI to avoid interfering with development

# Navigate to the script directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -Path $scriptPath

# Function to log messages
function Write-Log {
    param (
        [string]$Message,
        [string]$Level = "INFO"
    )
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    $logFile = Join-Path -Path $scriptPath -ChildPath "ti_platform_dev.log"
    Add-Content -Path $logFile -Value $logMessage
    
    # Also write to console if not in background mode
    if ($Background -ne $true) {
        switch ($Level) {
            "ERROR" { Write-Host $logMessage -ForegroundColor Red }
            "WARNING" { Write-Host $logMessage -ForegroundColor Yellow }
            "SUCCESS" { Write-Host $logMessage -ForegroundColor Green }
            default { Write-Host $logMessage }
        }
    }
}

# Check for development mode parameter
param (
    [switch]$Background = $false,
    [switch]$NoFetch = $false
)

Write-Log "Starting Threat Intelligence Platform in development mode..."

if (-not $NoFetch) {
    # Run the AlienVault data fetch in background
    Write-Log "Fetching fresh threat intelligence data..."
    try {
        # Run the fetch script with no window
        $startInfo = New-Object System.Diagnostics.ProcessStartInfo
        $startInfo.FileName = "powershell.exe"
        $startInfo.Arguments = "-ExecutionPolicy Bypass -File `"$scriptPath\fetch_alienvault.ps1`""
        $startInfo.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Hidden
        $startInfo.CreateNoWindow = $true
        
        $process = [System.Diagnostics.Process]::Start($startInfo)
        $process.WaitForExit(120000)  # 2 minute timeout
        
        Write-Log "Threat intelligence data fetch completed" -Level "SUCCESS"
    } catch {
        Write-Log "Error fetching threat data: $_" -Level "ERROR"
    }
}

# Start the Threat Intelligence Platform
Write-Log "Starting web application..."
try {
    # Create database directory if it doesn't exist
    $instanceDir = Join-Path -Path $scriptPath -ChildPath "instance"
    if (-not (Test-Path -Path $instanceDir)) {
        New-Item -ItemType Directory -Path $instanceDir | Out-Null
        Write-Log "Created instance directory" -Level "INFO"
    }
    
    # Prepare environment variables
    $env:ALIENVAULT_API_KEY = "61b8bc7b26584345ce93d6ac72ce015ec6c37e9f1ae37fc99ba2951acbdea1a2"
    $env:FLASK_ENV = "development"
    $env:DEBUG = "True"
    
    # If we're not in background mode, run the platform with a window
    if (-not $Background) {
        Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit -File `"$scriptPath\run_threat_intel.ps1`""
        Write-Log "Application started in foreground mode" -Level "SUCCESS"
    } else {
        # Run with no window in background mode
        $startInfo = New-Object System.Diagnostics.ProcessStartInfo
        $startInfo.FileName = "powershell.exe"
        $startInfo.Arguments = "-ExecutionPolicy Bypass -File `"$scriptPath\run_threat_intel.ps1`""
        $startInfo.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Hidden
        $startInfo.CreateNoWindow = $true
        
        [System.Diagnostics.Process]::Start($startInfo)
        Write-Log "Application started in background mode" -Level "SUCCESS"
    }
    
    # Write status to a file that can be checked by the IDE
    $status = @{
        "status" = "running"
        "start_time" = (Get-Date).ToString("o")
        "url" = "http://localhost:5000"
        "api_url" = "http://localhost:5000/api/v1"
    } | ConvertTo-Json
    
    $statusFile = Join-Path -Path $scriptPath -ChildPath "ti_platform_status.json"
    Set-Content -Path $statusFile -Value $status
    
} catch {
    Write-Log "Error starting application: $_" -Level "ERROR"
    exit 1
}

# Output URL information if not in background mode
if (-not $Background) {
    Write-Host "`n-----------------------------------------" -ForegroundColor Cyan
    Write-Host "Threat Intelligence Platform is running!" -ForegroundColor Green
    Write-Host "Dashboard URL: http://localhost:5000" -ForegroundColor Cyan
    Write-Host "API Endpoint: http://localhost:5000/api/v1" -ForegroundColor Cyan
    Write-Host "-----------------------------------------`n" -ForegroundColor Cyan
}

exit 0 