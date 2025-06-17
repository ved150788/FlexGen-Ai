@echo off
echo ========================================
echo FlexGen.ai Complete Application Startup
echo ========================================
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed or not in PATH. Please install Node.js and try again.
    pause
    exit /b 1
)

:: Check if Python is installed
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Python is not installed or not in PATH. Please install Python and try again.
    pause
    exit /b 1
)

:: Check if npm dependencies are installed
if not exist node_modules (
    echo 📦 Installing Node.js dependencies...
    npm install
)

:: Check if Python dependencies are installed
echo 🐍 Installing Python dependencies...
python -m pip install -r requirements.txt >nul 2>nul

:: Install feedback system dependencies
echo 💬 Setting up feedback system...
cd app\feedback\backend
if not exist node_modules (
    npm install >nul 2>nul
)
cd ..\..\..

:: Install email backend dependencies
echo 📧 Setting up email service...
cd flask-email-backend
python -m pip install -r requirements.txt >nul 2>nul
cd ..

:: Create .env.local if it doesn't exist
if not exist .env.local (
    echo 🔧 Creating default .env.local file...
    echo # FlexGen.ai Environment Variables > .env.local
    echo NEXT_PUBLIC_API_URL=http://localhost:5000 >> .env.local
    echo NEXT_PUBLIC_SITE_URL=http://localhost:3000 >> .env.local
    echo NEXT_PUBLIC_FEEDBACK_API_URL=http://localhost:3001 >> .env.local
    echo JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars >> .env.local
    echo SESSION_SECRET=your-session-secret-key-change-in-production-min-32-chars >> .env.local
    echo NODE_ENV=development >> .env.local
    echo FEEDBACK_DB_URL=file:./feedback.db >> .env.local
    echo THREAT_INTEL_DB_PATH=./threat_intel.db >> .env.local
)

:: Initialize databases
echo 🗄️ Initializing databases...
python init_threat_db.py >nul 2>nul

cd app\feedback\backend
npx prisma generate >nul 2>nul
npx prisma migrate dev --name init >nul 2>nul
cd ..\..\..

echo.
echo ========================================
echo Starting All Services...
echo ========================================
echo.

echo 🚀 Service URLs:
echo - Frontend:           http://localhost:3000
echo - Auth Backend:       http://localhost:3001
echo - Threat Intel API:   http://localhost:5000
echo - Email Service:      http://localhost:5002
echo - WebSocket:          ws://localhost:8080
echo.

echo 📱 Application Pages:
echo - Homepage:           http://localhost:3000
echo - Login:              http://localhost:3000/login
echo - Dashboard:          http://localhost:3000/dashboard
echo - Threat Intel:       http://localhost:3000/tools/threat-intelligence
echo - Feedback Admin:     http://localhost:3000/feedback-dashboard
echo - My Feedback:        http://localhost:3000/my-feedback
echo.

echo ⚡ Starting services (press Ctrl+C to stop all)...
echo.

:: Start all services using concurrently
npx concurrently ^
  --names "Frontend,Auth,ThreatIntel,Feedback,Email,WebSocket" ^
  --prefix "{name}" ^
  --prefix-colors "cyan,green,yellow,magenta,blue,red" ^
  "npm run dev:frontend" ^
  "npm run dev:backend" ^
  "python api_server.py" ^
  "cd app/feedback/backend && npm run dev" ^
  "cd flask-email-backend && python app.py" ^
  "python websocket_server.py"

echo.
echo 🛑 All services stopped.
pause 