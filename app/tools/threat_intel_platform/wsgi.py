from app import create_app
from app.scheduler import SchedulerService
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Create the Flask application
app = create_app()

# Initialize the scheduler
scheduler = SchedulerService(app) 