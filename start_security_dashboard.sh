#!/bin/bash

echo "Starting FlexGen.ai Security Dashboard System..."
echo

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed or not in PATH"
    echo "Please install Python 3.8+ and try again"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed or not in PATH"
    echo "Please install Node.js 18+ and try again"
    exit 1
fi

echo "[1/4] Installing Python dependencies for WebSocket server..."
pip3 install -r websocket_requirements.txt

echo
echo "[2/4] Installing Node.js dependencies..."
npm install

echo
echo "[3/4] Starting backend API server..."
python3 api_server.py &
API_PID=$!

echo
echo "[4/4] Starting WebSocket server for real-time updates..."
python3 websocket_server.py &
WS_PID=$!

echo
echo "[5/5] Starting Next.js frontend..."
sleep 3
npm run dev &
FRONTEND_PID=$!

echo
echo "========================================"
echo "Security Dashboard System Started!"
echo "========================================"
echo
echo "Frontend: http://localhost:3000"
echo "Security Dashboard: http://localhost:3000/security-dashboard"
echo "API Server: http://localhost:5000"
echo "WebSocket Server: ws://localhost:5001"
echo
echo "Process IDs:"
echo "API Server: $API_PID"
echo "WebSocket Server: $WS_PID"
echo "Frontend: $FRONTEND_PID"
echo

# Function to cleanup processes on exit
cleanup() {
    echo
    echo "Shutting down Security Dashboard System..."
    kill $API_PID $WS_PID $FRONTEND_PID 2>/dev/null
    echo "All services stopped."
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

echo "Press Ctrl+C to stop all services..."
echo "Opening Security Dashboard in browser..."

# Try to open browser (works on most systems)
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3000/security-dashboard
elif command -v open &> /dev/null; then
    open http://localhost:3000/security-dashboard
fi

# Wait for user interrupt
wait 