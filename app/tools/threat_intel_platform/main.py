#!/usr/bin/env python
"""
Main entry point for the Threat Intelligence Platform
This script ensures proper Python path setup for imports to work correctly
"""

import os
import sys
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Determine the project root directory
current_dir = Path(__file__).resolve().parent
project_root = current_dir.parent.parent.parent  # Go up three levels to the project root

# Add the project root to Python path
sys.path.insert(0, str(project_root))

try:
    # Now we can import with the corrected path
    from app.tools.threat_intel_platform.app import create_app
    
    logger.info("Starting Threat Intelligence Platform...")
    app = create_app()
    
    # Run the application
    if __name__ == "__main__":
        port = int(os.environ.get("THREAT_INTEL_PORT", 5050))
        logger.info(f"Running on port {port}")
        app.run(host="0.0.0.0", port=port, debug=True)
        
except Exception as e:
    logger.error(f"Error starting application: {e}")
    import traceback
    logger.error(traceback.format_exc()) 