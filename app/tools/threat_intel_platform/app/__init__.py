"""
Flask app initialization for the threat intelligence platform
"""

import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Try to load environment variables from .env file
try:
    from dotenv import load_dotenv
    load_dotenv()
    logger.info("Loaded environment variables from .env file")
except Exception as e:
    logger.warning(f"Could not load environment variables: {str(e)}")

# Initialize SQLAlchemy before importing models
db = SQLAlchemy()
migrate = Migrate()

def create_app(config=None):
    """
    Application factory for Flask app
    
    Args:
        config: Configuration dictionary or object
        
    Returns:
        Configured Flask application
    """
    app = Flask(__name__)
    
    # Load default configuration
    app.config.from_mapping(
        SECRET_KEY=os.environ.get('SECRET_KEY', 'dev_key_change_in_production'),
        SQLALCHEMY_DATABASE_URI=os.environ.get('DATABASE_URL', 'sqlite:///threat_intel.db'),
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        THREADS_PER_PAGE=4,
        CSRF_ENABLED=True,
        CSRF_SESSION_KEY=os.environ.get('CSRF_SESSION_KEY', 'csrf_dev_key'),
    )
    
    # Load additional configuration if provided
    if config:
        app.config.from_mapping(config)
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    
    # Import and register blueprints
    from .routes.web import web
    from .routes.api import api
    
    app.register_blueprint(web)
    app.register_blueprint(api, url_prefix='/api')
    
    # Initialize crawler config and scheduler
    with app.app_context():
        # Import and create database tables
        from .models.schema import (
            IOC, FeedRun, Tag, IPDetails, DomainDetails, URLDetails, FileDetails,
            ThreatActor, Campaign, Vulnerability, Relationship, Event
        )
        
        # Create tables if they don't exist
        db.create_all()
        
        # Initialize database with default data
        from .models import initialize_database
        initialize_database()
        
        # Load crawler configurations
        from .crawlers.config import crawler_config
        config_file = os.path.join(
            os.path.dirname(os.path.abspath(__file__)),
            'crawlers',
            'config.json'
        )
        
        # Try to load config from file
        if os.path.exists(config_file):
            crawler_config.load_from_file(config_file)
        
        # Load config from environment variables
        crawler_config.load_from_env()
        
        # Discover available crawlers
        crawler_config.discover_crawlers()
        
        # Initialize and start the scheduler
        from .scheduler import SchedulerService
        scheduler = SchedulerService(app)
        
        # Store scheduler in app context
        app.scheduler = scheduler
        
    return app 