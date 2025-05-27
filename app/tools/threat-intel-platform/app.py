import os
from app.tools.threat-intel-platform.app import create_app
from app.tools.threat-intel-platform.app.scheduler import SchedulerService
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Create the Flask application
app = create_app()

# Initialize the scheduler
scheduler = SchedulerService(app)

if __name__ == '__main__':
    # Get port from environment or use default
    port = int(os.environ.get('PORT', 5000))
    
    # Run the application
    app.run(host='0.0.0.0', port=port, debug=True) 