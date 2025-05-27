#!/usr/bin/env python3
"""
Direct fix for the Threat Intelligence Platform import issues.
This script patches the import statements in schema.py and runs the application.
"""

import os
import sys
import re
from pathlib import Path
import subprocess

def fix_schema_imports():
    """Fix the imports in schema.py"""
    schema_path = Path('app/models/schema.py')
    
    if not schema_path.exists():
        print(f"Error: {schema_path} not found.")
        return False
        
    # Read the schema file
    with open(schema_path, 'r') as file:
        content = file.read()
    
    # Replace the problematic import
    fixed_content = re.sub(
        r'from app\.tools\.threat_intel_platform\.app import db',
        'import sys\nfrom pathlib import Path\nsys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))\nfrom app import db',
        content
    )
    
    # Write the fixed content
    with open(schema_path, 'w') as file:
        file.write(fixed_content)
    
    print(f"✓ Fixed imports in {schema_path}")
    return True

def main():
    """Main function"""
    print("Starting Threat Intelligence Platform fix...")
    
    # Create and activate virtual environment
    venv_path = Path('venv')
    if not venv_path.exists():
        print("Creating virtual environment...")
        subprocess.run(['python', '-m', 'venv', 'venv'], check=True)
    
    # Install requirements
    print("Installing requirements...")
    if os.name == 'nt':  # Windows
        pip_path = venv_path / 'Scripts' / 'pip'
    else:
        pip_path = venv_path / 'bin' / 'pip'
    
    subprocess.run([str(pip_path), 'install', 'flask', 'flask-sqlalchemy', 'flask-migrate', 'python-dotenv', 'requests', 'apscheduler'], check=True)
    
    # Fix the imports
    if not fix_schema_imports():
        print("Failed to fix imports. Exiting.")
        return
    
    print("Starting application...")
    if os.name == 'nt':  # Windows
        python_path = venv_path / 'Scripts' / 'python'
    else:
        python_path = venv_path / 'bin' / 'python'
    
    try:
        subprocess.run([str(python_path), 'app.py'], check=True)
    except KeyboardInterrupt:
        print("Application stopped by user.")
    except Exception as e:
        print(f"Error running application: {e}")

if __name__ == "__main__":
    main() 