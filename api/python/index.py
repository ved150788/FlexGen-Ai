from http.server import BaseHTTPRequestHandler
import json

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        """Handle GET requests"""
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        response = {
            "status": "running",
            "message": "FlexGen Email Backend API is running",
            "endpoints": [
                {"path": "/api/contact", "method": "POST", "description": "Submit contact form data"},
                {"path": "/api/security-audit", "method": "POST", "description": "Submit security audit request"}
            ],
            "version": "1.0.0"
        }
        
        self.wfile.write(json.dumps(response).encode()) 