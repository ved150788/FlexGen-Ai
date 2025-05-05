from http.server import BaseHTTPRequestHandler

def handler(request, response):
    """Handle requests to this serverless function"""
    return {
        "status": 200,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        },
        "body": {
            "status": "running",
            "message": "FlexGen Email Backend API is running",
            "endpoints": [
                {"path": "/api/python/contact", "method": "POST", "description": "Submit contact form data"},
                {"path": "/api/python/security-audit", "method": "POST", "description": "Submit security audit request"}
            ],
            "version": "1.0.0"
        }
    } 