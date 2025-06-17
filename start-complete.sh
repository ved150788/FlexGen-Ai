#!/bin/bash

echo "========================================"
echo "FlexGen.ai Complete Application Startup"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js and try again.${NC}"
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo -e "${RED}❌ Python is not installed. Please install Python and try again.${NC}"
    exit 1
fi

# Set Python command
PYTHON_CMD=$(command -v python3 || command -v python)

# Check if npm dependencies are installed
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}📦 Installing Node.js dependencies...${NC}"
    npm install
fi

# Install Python dependencies
echo -e "${YELLOW}🐍 Installing Python dependencies...${NC}"
$PYTHON_CMD -m pip install -r requirements.txt > /dev/null 2>&1

# Install feedback system dependencies
echo -e "${CYAN}💬 Setting up feedback system...${NC}"
cd app/feedback/backend
if [ ! -d "node_modules" ]; then
    npm install > /dev/null 2>&1
fi
cd ../../..

# Install email backend dependencies
echo -e "${BLUE}📧 Setting up email service...${NC}"
cd flask-email-backend
$PYTHON_CMD -m pip install -r requirements.txt > /dev/null 2>&1
cd ..

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo -e "${GREEN}🔧 Creating default .env.local file...${NC}"
    cat > .env.local << EOF
# FlexGen.ai Environment Variables
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_FEEDBACK_API_URL=http://localhost:3001
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
SESSION_SECRET=your-session-secret-key-change-in-production-min-32-chars
NODE_ENV=development
FEEDBACK_DB_URL=file:./feedback.db
THREAT_INTEL_DB_PATH=./threat_intel.db
EOF
fi

# Initialize databases
echo -e "${YELLOW}🗄️ Initializing databases...${NC}"
$PYTHON_CMD init_threat_db.py > /dev/null 2>&1

cd app/feedback/backend
npx prisma generate > /dev/null 2>&1
npx prisma migrate dev --name init > /dev/null 2>&1
cd ../../..

echo ""
echo "========================================"
echo "Starting All Services..."
echo "========================================"
echo ""

echo -e "${CYAN}🚀 Service URLs:${NC}"
echo "- Frontend:           http://localhost:3000"
echo "- Auth Backend:       http://localhost:3001"
echo "- Threat Intel API:   http://localhost:5000"
echo "- Email Service:      http://localhost:5002"
echo "- WebSocket:          ws://localhost:8080"
echo ""

echo -e "${GREEN}📱 Application Pages:${NC}"
echo "- Homepage:           http://localhost:3000"
echo "- Login:              http://localhost:3000/login"
echo "- Dashboard:          http://localhost:3000/dashboard"
echo "- Threat Intel:       http://localhost:3000/tools/threat-intelligence"
echo "- Feedback Admin:     http://localhost:3000/feedback-dashboard"
echo "- My Feedback:        http://localhost:3000/my-feedback"
echo ""

echo -e "${YELLOW}⚡ Starting services (press Ctrl+C to stop all)...${NC}"
echo ""

# Start all services using concurrently
npx concurrently \
  --names "Frontend,Auth,ThreatIntel,Feedback,Email,WebSocket" \
  --prefix "{name}" \
  --prefix-colors "cyan,green,yellow,magenta,blue,red" \
  "npm run dev:frontend" \
  "npm run dev:backend" \
  "$PYTHON_CMD api_server.py" \
  "cd app/feedback/backend && npm run dev" \
  "cd flask-email-backend && $PYTHON_CMD app.py" \
  "$PYTHON_CMD websocket_server.py"

echo ""
echo -e "${RED}🛑 All services stopped.${NC}" 