"""
WSGI entry point for production deployment of the FlexGen Email Backend
This file is used by production WSGI servers like Gunicorn or uWSGI
"""

from app import create_app

# Create the application using the factory function
application = create_app()

if __name__ == "__main__":
    application.run() 