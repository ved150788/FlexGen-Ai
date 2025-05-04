#!/bin/bash
# Start the FlexGen Email Backend in production mode using Gunicorn

# Activate virtual environment if it exists
if [ -d "venv" ]; then
  source venv/bin/activate
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
  echo "Warning: .env file not found. Email functionality may not work correctly."
fi

# Start Gunicorn with 4 worker processes
gunicorn --bind 0.0.0.0:5000 wsgi:application --workers 4 