#!/usr/bin/env python3
"""
Wrapper script to run the threat intelligence platform
"""

import os
import sys
import subprocess

def main():
    """Run the threat intelligence platform"""
    # Get the path to the app.py file
    app_path = os.path.join(
        os.path.dirname(os.path.abspath(__file__)),
        'app', 'tools', 'threat_intel_platform', 'app.py'
    )
    
    # Change to the directory containing app.py
    os.chdir(os.path.dirname(app_path))
    
    # Run the application
    try:
        # Print a message to the user
        print("Starting the Threat Intelligence Platform...")
        print("Access the dashboard at http://localhost:5000")
        print("Press Ctrl+C to stop the server")
        
        # Run the application
        subprocess.run([sys.executable, app_path], check=True)
    except KeyboardInterrupt:
        print("\nServer stopped")
    except subprocess.CalledProcessError as e:
        print(f"Error running the application: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main() 