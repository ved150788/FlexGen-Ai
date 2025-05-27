# Threat Intelligence Platform Automation Guide

This document explains how to set up and use the automation features for the FlexGen Threat Intelligence Platform.

## Quick Start

If you're encountering issues with the `npm run dev` command not properly starting the threat intelligence platform, run:

```
cd app/tools/threat_intel_platform
.\fix_npm_dev.ps1
```

This script will:

1. Install missing dependencies (including flask_migrate)
2. Update the npm dev script to properly launch the threat intelligence platform
3. Set up the required environment configuration
4. Pre-fetch threat intelligence data from AlienVault

After running this script, you can use `npm run dev` from the project root, and both the Next.js app and the threat intelligence platform will start together.

## npm Integration

The threat intelligence platform is integrated with npm scripts for easy development:

| Command                     | Description                                                      |
| --------------------------- | ---------------------------------------------------------------- |
| `npm run dev`               | Starts both the Next.js app and the threat intelligence platform |
| `npm run threatintel`       | Starts only the threat intelligence platform                     |
| `npm run threatintel:fetch` | Fetches the latest threat intelligence data                      |
| `npm run threatintel:setup` | Sets up the threat intelligence environment                      |

## Automation Scripts

The platform includes the following automation scripts:

1. **startup.ps1** - Main startup script that fetches the latest threat intelligence data and starts the platform
2. **auto_start.bat** - Windows batch file for adding to the Startup folder
3. **create_scheduled_task.ps1** - Creates Windows scheduled tasks for automatic updates and startup
4. **fetch_alienvault.ps1** - Script to fetch the latest threat data from AlienVault OTX
5. **dev_startup.ps1** - Special version optimized for development environments
6. **fix_npm_dev.ps1** - One-click solution to fix npm integration issues

## How to Set Up Automation

### Method 1: Windows Startup Folder

1. Right-click on `auto_start.bat` and select "Create shortcut"
2. Press `Windows + R`, type `shell:startup` and press Enter
3. Move the shortcut to this Startup folder
4. The platform will now start automatically when you log in to Windows

### Method 2: Scheduled Tasks (Recommended)

1. Open PowerShell as Administrator
2. Navigate to the threat_intel_platform directory
3. Run the following command:
   ```
   .\create_scheduled_task.ps1
   ```
4. This will create two scheduled tasks:
   - **FlexGen Threat Intelligence Update** - Runs daily at 6 AM to update threat data
   - **FlexGen Threat Intelligence Platform Startup** - Starts the platform at system logon

### Method 3: VSCode Integration

If you're using VSCode, we've included predefined tasks:

1. Open VSCode in the project folder
2. Press `Ctrl+Shift+P` and type "Tasks: Run Task"
3. Select one of the available tasks:
   - **Start Threat Intelligence Platform**
   - **Start Platform (Background Mode)**
   - **Fetch Latest Threat Intelligence**
   - **Create Scheduled Tasks**
   - **Open Threat Intelligence Dashboard**

## Manual Execution

If you prefer to start the platform manually:

1. To fetch the latest threat intelligence data:

   ```
   .\fetch_alienvault.ps1
   ```

2. To start the platform with the latest data:

   ```
   .\startup.ps1
   ```

3. To run only the web application without fetching new data:
   ```
   .\run_threat_intel.ps1
   ```

## Accessing the Platform

Once started, the platform can be accessed at:

- Dashboard: http://localhost:5000
- API: http://localhost:5000/api/v1

## Troubleshooting

If you encounter issues with the automation:

1. Ensure PowerShell execution policy allows running scripts:

   ```
   Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope CurrentUser
   ```

2. Check that your AlienVault API key is correct in `fetch_alienvault.ps1`

   - Current API key: 61b8bc7b26584345ce93d6ac72ce015ec6c37e9f1ae37fc99ba2951acbdea1a2

3. If you see an error about missing modules like `flask_migrate`:

   ```
   .\fix_npm_dev.ps1
   ```

4. If the platform doesn't start when running `npm run dev`:

   - Check that the flask application is installed correctly
   - Verify that the virtual environment has all required packages
   - Run `.\fix_npm_dev.ps1` to fix integration issues

5. Review logs in the Task Scheduler for any scheduled task failures

6. Make sure Python and required packages are installed correctly

## Development Environment Integration

For development environments, you can add a call to the startup script in your project's initialization process or IDE startup scripts.
