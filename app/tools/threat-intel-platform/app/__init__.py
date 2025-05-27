from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import os
from datetime import timedelta

# Initialize extensions
db = SQLAlchemy()
jwt = JWTManager()

def create_app(test_config=None):
    # Create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    
    # Load configuration
    app.config.from_mapping(
        SECRET_KEY=os.environ.get('SECRET_KEY', 'dev_key_change_in_production'),
        SQLALCHEMY_DATABASE_URI=os.environ.get('DATABASE_URI', 'sqlite:///threat_intelligence.db'),
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        JWT_SECRET_KEY=os.environ.get('JWT_SECRET_KEY', 'jwt_dev_key_change_in_production'),
        JWT_ACCESS_TOKEN_EXPIRES=timedelta(hours=1),
    )
    
    # Enable CORS
    CORS(app)
    
    # Initialize extensions with app
    db.init_app(app)
    jwt.init_app(app)
    
    # Ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass
    
    # Register blueprints
    from app.tools.threat-intel-platform.app.routes.api import api_bp
    from app.tools.threat-intel-platform.app.routes.web import web_bp
    
    app.register_blueprint(api_bp)
    app.register_blueprint(web_bp)
    
    # Create database tables
    with app.app_context():
        db.create_all()
        
    return app 