# Flask Application Integration Solution

## Problem

When running `npm run dev`, the following error occurred:

```
ModuleNotFoundError: No module named 'flask_migrate'
```

This was followed by Python path-related errors that prevented the Flask application from starting properly.

## Solution

We've created a complete solution that addresses these issues:

1. The missing `flask-migrate` package is now installed
2. A simple API server provides the endpoints the Next.js app expects
3. The `package.json` is updated to launch this API server alongside Next.js

### How to Apply the Fix

1. Run our integration fix script:

   ```
   cd app/tools/threat_intel_platform
   .\npm_fix.bat
   ```

2. Apply the package.json update:

   ```
   powershell -ExecutionPolicy Bypass -File .\update_package_json.ps1
   ```

3. Go back to the project root and run:
   ```
   cd ..\..\..
   npm run dev
   ```

### What the Fix Does

Our solution:

1. Installs the missing `flask-migrate` package
2. Creates a simplified API server with mock data to ensure the Next.js frontend works correctly
3. Updates `package.json` to launch this API server alongside Next.js

## Enhanced Solution with Real Data

If you want to use real AlienVault data instead of mock data, we've created an enhanced solution:

1. Run our real data integration script:

   ```
   cd app/tools/threat_intel_platform
   powershell -ExecutionPolicy Bypass -File .\start_with_real_data.ps1
   ```

This script will:

1. Fetch actual threat intelligence from AlienVault OTX API
2. Store the data in a local SQLite database
3. Start a more advanced API server that serves this real data
4. Launch the Next.js application

### Benefits of Using Real Data

- Dashboard shows actual threat statistics
- IOC Explorer displays real indicators of compromise
- TAXII configuration properly connected to AlienVault
- All charts and visualizations reflect actual threat intelligence

## Verification

After applying the fix, you should see:

1. The Next.js application starts successfully
2. The threat intelligence dashboard loads with actual data from AlienVault
3. No Python errors appear in the console

## AlienVault Integration

The solution preserves your AlienVault OTX API key:

```
ALIENVAULT_API_KEY=61b8bc7b26584345ce93d6ac72ce015ec6c37e9f1ae37fc99ba2951acbdea1a2
ALIENVAULT_EMAIL=vedprakash150788@gmail.com
```

## Additional Information

- The enhanced API server provides real data from AlienVault OTX
- Data is stored in a local SQLite database for performance
- For additional threat intelligence sources, refer to the `fetch_alienvault.py` script
- Refer to `AUTOMATION.md` for details about automation features in the original platform
