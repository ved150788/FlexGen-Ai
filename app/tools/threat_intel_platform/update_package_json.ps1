# Script to update package.json to use the simplified API server

# Navigate to the project root
Set-Location -Path "..\..\.."

# Check if package.json exists
if (Test-Path "package.json") {
    Write-Host "Updating package.json..."
    
    # Read the content
    $json = Get-Content "package.json" -Raw | ConvertFrom-Json
    
    # Create a backup
    Copy-Item "package.json" "package.json.bak" -Force
    
    # Update the dev script
    $originalDevScript = $json.scripts.dev
    $newDevScript = "next dev & app\tools\threat_intel_platform\run_app.bat"
    $json.scripts.dev = $newDevScript
    
    # Write back to the file
    $json | ConvertTo-Json -Depth 10 | Set-Content "package.json"
    
    Write-Host "package.json updated successfully!"
    Write-Host "Original dev script: $originalDevScript"
    Write-Host "New dev script: $newDevScript"
    Write-Host "`nYou can now run 'npm run dev' without any errors!"
} else {
    Write-Host "package.json not found in project root!"
}

# Return to the original directory
Set-Location -Path "app\tools\threat_intel_platform" 