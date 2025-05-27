#!/bin/bash

echo "Starting Threat Intelligence Platform..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Python is not installed. Please install Python and try again."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js and try again."
    exit 1
fi

# Install Python requirements if needed
echo "Installing Python requirements..."
python3 -m pip install -r app/tools/threat_intel_platform/requirements.txt

# Install .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file with default settings..."
    cp .env.example .env
fi

# Start Flask backend
echo "Starting Flask backend..."
python3 app/tools/threat_intel_platform/app.py &
FLASK_PID=$!

# Start Next.js frontend
echo "Starting Next.js frontend..."
npm run dev &
NEXT_PID=$!

echo "Threat Intelligence Platform is starting up."
echo "- Frontend will be available at: http://localhost:3000/tools/threat-intelligence"
echo "- Backend API will be available at: http://localhost:5000/api"
echo
echo "Press Ctrl+C to shut down all components."

# Handle shutdown gracefully
trap "kill $FLASK_PID $NEXT_PID; exit" INT TERM
wait 