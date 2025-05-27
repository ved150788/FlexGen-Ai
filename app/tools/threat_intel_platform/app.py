#!/usr/bin/env python3
"""
Threat Intelligence Platform main application

This script runs the Flask application for the threat intelligence platform.
"""

import os
import sys
import logging

# Set up logging first
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Add the current directory to the path so that we can import from app
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

# Then try to load environment variables
try:
    from dotenv import load_dotenv
    load_dotenv()
    logger.info("Loaded environment variables from .env file")
except Exception as e:
    logger.warning(f"Could not load environment variables: {str(e)}")

# Import the application factory
from app import create_app

def main():
    """Main entry point for the application"""
    
    # Create the Flask application
    app = create_app()
    
    # Run the application
    host = os.environ.get('HOST', '0.0.0.0')
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('DEBUG', 'True').lower() == 'true'
    
    # Initialize scheduler if not already running
    if hasattr(app, 'scheduler') and not app.scheduler.is_running():
        with app.app_context():
            try:
                app.scheduler.start()
                logger.info("Scheduler started")
            except Exception as e:
                logger.error(f"Error starting scheduler: {str(e)}")
    
    logger.info(f"Starting Threat Intelligence Platform on {host}:{port}")
    app.run(host=host, port=port, debug=debug)

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        logger.info("Application shutdown requested")
        sys.exit(0)
    except Exception as e:
        logger.error(f"Unhandled exception: {str(e)}", exc_info=True)
        sys.exit(1) 