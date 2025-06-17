# FlexGen AI Authentication Server Setup and Start Script
# This script installs dependencies and starts the Node.js authentication server

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FlexGen AI Authentication Server Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js not found. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "npm found: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "npm not found. Please install npm" -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "`nInstalling Node.js dependencies..." -ForegroundColor Yellow
try {
    npm install
    Write-Host "Dependencies installed successfully" -ForegroundColor Green
} catch {
    Write-Host "Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Check if backend directory exists
if (-not (Test-Path "backend")) {
    Write-Host "Creating backend directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Name "backend"
}

# Set environment variables for development
$env:NODE_ENV = "development"
$env:JWT_SECRET = "your-secret-key-change-in-production-" + (Get-Random)
$env:SESSION_SECRET = "your-session-secret-" + (Get-Random)
$env:FRONTEND_URL = "http://localhost:3000"

# Display environment information
Write-Host "`nEnvironment Configuration:" -ForegroundColor Cyan
Write-Host "NODE_ENV: $env:NODE_ENV" -ForegroundColor White
Write-Host "Frontend URL: $env:FRONTEND_URL" -ForegroundColor White
Write-Host "Auth Server Port: 3001" -ForegroundColor White

# Check if port 3001 is available
$port = 3001
$portInUse = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
if ($portInUse) {
    Write-Host "`nPort $port is already in use. Please stop any running services on this port." -ForegroundColor Yellow
    Write-Host "You can find the process using: Get-Process -Id (Get-NetTCPConnection -LocalPort $port).OwningProcess" -ForegroundColor Gray
    $response = Read-Host "Do you want to continue anyway? (y/N)"
    if ($response -ne "y" -and $response -ne "Y") {
        exit 1
    }
}

# Create .env file if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "`nCreating .env file..." -ForegroundColor Yellow
    $envContent = @"
NODE_ENV=development
JWT_SECRET=$env:JWT_SECRET
SESSION_SECRET=$env:SESSION_SECRET
FRONTEND_URL=http://localhost:3000

# OAuth Configuration (Optional - add your keys here)
# GOOGLE_CLIENT_ID=your_google_client_id
# GOOGLE_CLIENT_SECRET=your_google_client_secret
# FACEBOOK_APP_ID=your_facebook_app_id
# FACEBOOK_APP_SECRET=your_facebook_app_secret
"@
    Set-Content -Path ".env" -Value $envContent
    Write-Host ".env file created" -ForegroundColor Green
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Starting Authentication Server..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Display instructions
Write-Host "`nServer Information:" -ForegroundColor Yellow
Write-Host "Authentication API: http://localhost:3001" -ForegroundColor White
Write-Host "Health Check: http://localhost:3001/health" -ForegroundColor White
Write-Host "Login Page: http://localhost:3000/login" -ForegroundColor White
Write-Host "Dashboard: http://localhost:3000/dashboard" -ForegroundColor White

Write-Host "`nAvailable API Endpoints:" -ForegroundColor Yellow
Write-Host "POST /auth/register - Create new account" -ForegroundColor White
Write-Host "POST /auth/login - Login with email/password" -ForegroundColor White
Write-Host "GET /auth/google - Login with Google" -ForegroundColor White
Write-Host "GET /auth/facebook - Login with Facebook" -ForegroundColor White
Write-Host "GET /auth/profile - Get user profile" -ForegroundColor White
Write-Host "PUT /auth/profile - Update user profile" -ForegroundColor White
Write-Host "GET /scans/history - Get scan history" -ForegroundColor White
Write-Host "POST /scans/save - Save scan results" -ForegroundColor White

Write-Host "`nNotes:" -ForegroundColor Yellow
Write-Host "Database will be created automatically (SQLite)" -ForegroundColor White
Write-Host "Social login requires OAuth credentials in .env" -ForegroundColor White
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor White

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "Starting server now..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# Start the authentication server
try {
    Write-Host "Starting Node.js authentication server..." -ForegroundColor Yellow
    
    # Start the server directly
    node backend/server.js
    
} catch {
    Write-Host "Failed to start authentication server: $_" -ForegroundColor Red
    exit 1
} 