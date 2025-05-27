# PowerShell script to create a Windows scheduled task
# This will set up a daily task to fetch the latest threat intelligence data

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -Path $scriptPath

# Task settings
$taskName = "FlexGen Threat Intelligence Update"
$taskDescription = "Daily update of threat intelligence data from AlienVault OTX"
$fetchScriptPath = Join-Path -Path $scriptPath -ChildPath "fetch_alienvault.ps1"

Write-Host "Creating scheduled task for threat intelligence updates..." -ForegroundColor Cyan

# Check if task already exists
$existingTask = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue

if ($existingTask) {
    Write-Host "Task '$taskName' already exists. Removing existing task..." -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
}

# Create the action to run the script
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-ExecutionPolicy Bypass -File `"$fetchScriptPath`""

# Create a trigger for daily execution at 6 AM
$trigger = New-ScheduledTaskTrigger -Daily -At 6AM

# Set the principal to run with highest privileges
$principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType Interactive -RunLevel Highest

# Create the task settings
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -RunOnlyIfNetworkAvailable -WakeToRun -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries

# Register the scheduled task
try {
    Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Description $taskDescription
    Write-Host "Scheduled task '$taskName' has been created successfully!" -ForegroundColor Green
    Write-Host "The task will run daily at 6 AM to update threat intelligence data." -ForegroundColor Cyan
} catch {
    Write-Host "Error creating scheduled task: $_" -ForegroundColor Red
}

# Create a task for startup execution
$startupTaskName = "FlexGen Threat Intelligence Platform Startup"
$startupTaskDescription = "Start the FlexGen Threat Intelligence Platform at system startup"
$startupScriptPath = Join-Path -Path $scriptPath -ChildPath "startup.ps1"

# Check if startup task already exists
$existingStartupTask = Get-ScheduledTask -TaskName $startupTaskName -ErrorAction SilentlyContinue

if ($existingStartupTask) {
    Write-Host "Task '$startupTaskName' already exists. Removing existing task..." -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName $startupTaskName -Confirm:$false
}

# Create the action for startup
$startupAction = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-ExecutionPolicy Bypass -WindowStyle Normal -File `"$startupScriptPath`""

# Create a trigger for system startup
$startupTrigger = New-ScheduledTaskTrigger -AtLogOn -User "$env:USERDOMAIN\$env:USERNAME"

# Register the startup task
try {
    Register-ScheduledTask -TaskName $startupTaskName -Action $startupAction -Trigger $startupTrigger -Principal $principal -Settings $settings -Description $startupTaskDescription
    Write-Host "Scheduled task '$startupTaskName' has been created successfully!" -ForegroundColor Green
    Write-Host "The Threat Intelligence Platform will start automatically at system logon." -ForegroundColor Cyan
} catch {
    Write-Host "Error creating startup task: $_" -ForegroundColor Red
}

Write-Host "`nTo manage these tasks, open Task Scheduler (taskschd.msc) and look for '$taskName' and '$startupTaskName'." -ForegroundColor White 