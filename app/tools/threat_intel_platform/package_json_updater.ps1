# PowerShell script to update package.json with proper integration
# This script will modify the npm dev script to include the threat intelligence platform

# Navigate to the project root directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -Path "$scriptPath\..\..\..\"

Write-Host "╔═════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║      Package.json Updater for Threat Intelligence       ║" -ForegroundColor Cyan
Write-Host "╚═════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

# Check if package.json exists
if (-not (Test-Path -Path "package.json")) {
    Write-Host "Error: package.json not found in project root." -ForegroundColor Red
    exit 1
}

# Read the package.json file
try {
    $packageJson = Get-Content -Path "package.json" -Raw | ConvertFrom-Json
    
    # Backup the original file
    Copy-Item -Path "package.json" -Destination "package.json.bak" -Force
    Write-Host "Created backup of package.json at package.json.bak" -ForegroundColor Green
    
    # Backup the original dev script
    $originalDevScript = $packageJson.scripts.dev
    Write-Host "Original dev script: $originalDevScript" -ForegroundColor Gray
    
    # Create a new dev script that runs both the threat intel platform and the Next.js app
    $newDevScript = "powershell.exe -ExecutionPolicy Bypass -File `"app/tools/threat_intel_platform/dev_startup.ps1`" -Background && next dev"
    
    # Update the dev script
    $packageJson.scripts.dev = $newDevScript
    
    # Add additional scripts for the threat intelligence platform
    if (-not $packageJson.scripts.PSObject.Properties["threatintel"]) {
        Add-Member -InputObject $packageJson.scripts -MemberType NoteProperty -Name "threatintel" -Value "powershell.exe -ExecutionPolicy Bypass -File `"app/tools/threat_intel_platform/startup.ps1`""
    }
    
    if (-not $packageJson.scripts.PSObject.Properties["threatintel:fetch"]) {
        Add-Member -InputObject $packageJson.scripts -MemberType NoteProperty -Name "threatintel:fetch" -Value "powershell.exe -ExecutionPolicy Bypass -File `"app/tools/threat_intel_platform/fetch_alienvault.ps1`""
    }
    
    if (-not $packageJson.scripts.PSObject.Properties["threatintel:setup"]) {
        Add-Member -InputObject $packageJson.scripts -MemberType NoteProperty -Name "threatintel:setup" -Value "powershell.exe -ExecutionPolicy Bypass -File `"app/tools/threat_intel_platform/setup_dev_env.ps1`""
    }
    
    # Save the modified package.json
    $packageJson | ConvertTo-Json -Depth 10 | Set-Content -Path "package.json"
    
    Write-Host "Package.json updated successfully!" -ForegroundColor Green
    Write-Host "New dev script: $newDevScript" -ForegroundColor Green
    Write-Host "Added new npm scripts:" -ForegroundColor Green
    Write-Host "  - npm run threatintel: Start the threat intelligence platform" -ForegroundColor Cyan
    Write-Host "  - npm run threatintel:fetch: Fetch latest threat data" -ForegroundColor Cyan
    Write-Host "  - npm run threatintel:setup: Set up the threat intelligence environment" -ForegroundColor Cyan
    
} catch {
    Write-Host "Error updating package.json: $_" -ForegroundColor Red
    # Restore backup if it exists
    if (Test-Path -Path "package.json.bak") {
        Copy-Item -Path "package.json.bak" -Destination "package.json" -Force
        Write-Host "Restored backup from package.json.bak" -ForegroundColor Yellow
    }
    exit 1
}

# Return to the original directory
Set-Location -Path $scriptPath

Write-Host "`n✓ Package.json update completed successfully!" -ForegroundColor Green
Write-Host "  You can now run 'npm run dev' to start both the Next.js app and threat intelligence platform." -ForegroundColor Cyan
Write-Host "  Run 'npm run threatintel:setup' first to ensure all dependencies are installed." -ForegroundColor Yellow 