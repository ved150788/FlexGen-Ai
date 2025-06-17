# FlexGen.ai Complete Application Startup Script
# PowerShell version for Windows users

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FlexGen.ai Complete Application Startup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js not found. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if Python is installed
try {
    $pythonVersion = python --version
    Write-Host "Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "Python not found. Please install Python from https://python.org/" -ForegroundColor Red
    exit 1
}

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing Node.js dependencies..." -ForegroundColor Blue
    npm install
}

Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
python -m pip install -r requirements.txt | Out-Null

# Setup feedback system
Write-Host "Setting up feedback system..." -ForegroundColor Cyan
Set-Location "app/feedback/backend"
if (-not (Test-Path "node_modules")) {
    npm install | Out-Null
}
Set-Location "../../.."

# Setup email service
Write-Host "Setting up email service..." -ForegroundColor Blue
Set-Location "flask-email-backend"
python -m pip install -r requirements.txt | Out-Null
Set-Location ".."

# Create .env.local if it doesn't exist
if (-not (Test-Path ".env.local")) {
    Write-Host "Creating default .env.local file..." -ForegroundColor Green
    $envContent = "# FlexGen.ai Environment Variables`nNEXT_PUBLIC_API_URL=http://localhost:5000`nNEXT_PUBLIC_SITE_URL=http://localhost:3000`nNEXT_PUBLIC_FEEDBACK_API_URL=http://localhost:3002`nJWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars`nSESSION_SECRET=your-session-secret-key-change-in-production-min-32-chars`nNODE_ENV=development`nFEEDBACK_DB_URL=file:./feedback.db`nTHREAT_INTEL_DB_PATH=./threat_intel.db"
    Set-Content -Path ".env.local" -Value $envContent
}

# Initialize databases
Write-Host "Initializing databases..." -ForegroundColor Yellow
python init_threat_db.py | Out-Null

Set-Location "app/feedback/backend"
npx prisma generate | Out-Null
npx prisma migrate dev --name init | Out-Null
Set-Location "../../.."

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting All Services..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Service URLs:" -ForegroundColor Cyan
Write-Host "- Frontend:           http://localhost:3000" -ForegroundColor White
Write-Host "- Auth Backend:       http://localhost:3001" -ForegroundColor White
Write-Host "- Feedback Backend:   http://localhost:3002" -ForegroundColor White
Write-Host "- Threat Intel API:   http://localhost:5000" -ForegroundColor White
Write-Host "- Email Service:      http://localhost:5001" -ForegroundColor White
Write-Host "- WebSocket:          ws://localhost:8080" -ForegroundColor White
Write-Host ""

Write-Host "Application Pages:" -ForegroundColor Green
Write-Host "- Homepage:           http://localhost:3000" -ForegroundColor White
Write-Host "- Login:              http://localhost:3000/login" -ForegroundColor White
Write-Host "- Dashboard:          http://localhost:3000/dashboard" -ForegroundColor White
Write-Host "- Threat Intel:       http://localhost:3000/tools/threat-intelligence" -ForegroundColor White
Write-Host "- Feedback Admin:     http://localhost:3000/feedback-dashboard" -ForegroundColor White
Write-Host "- My Feedback:        http://localhost:3000/my-feedback" -ForegroundColor White
Write-Host ""

Write-Host "Starting services (press Ctrl+C to stop all)..." -ForegroundColor Yellow
Write-Host ""

# Start all services using npm script
try {
    npm run start:complete
} catch {
    Write-Host "Failed to start services. Please check if all dependencies are installed." -ForegroundColor Red
    Write-Host "Run 'npm run setup:complete' to install all dependencies." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "All services stopped." -ForegroundColor Red 