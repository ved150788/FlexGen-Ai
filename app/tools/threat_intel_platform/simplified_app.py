#!/usr/bin/env python3
"""
Simplified Threat Intelligence Platform application

This is a modified version of app.py with fixed imports.
"""

import os
import sys
import logging
from pathlib import Path

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Fix import paths
current_dir = Path(__file__).resolve().parent
project_root = current_dir.parent.parent.parent
sys.path.insert(0, str(project_root))

# Then try to load environment variables
try:
    from dotenv import load_dotenv
    load_dotenv()
    logger.info("Loaded environment variables from .env file")
except Exception as e:
    logger.warning(f"Could not load environment variables: {str(e)}")

# Import from the app directory directly
from app.tools.threat_intel_platform.app.models.schema import *
from app.tools.threat_intel_platform.app import create_app

def main():
    """Main entry point for the application"""
    try:
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
    except Exception as e:
        logger.error(f"Error starting application: {e}")
        import traceback
        logger.error(traceback.format_exc())

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        logger.info("Application shutdown requested")
        sys.exit(0)
    except Exception as e:
        logger.error(f"Unhandled exception: {str(e)}", exc_info=True)
        sys.exit(1) 