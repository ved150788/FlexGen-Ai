import json
from http.server import BaseHTTPRequestHandler
from datetime import datetime

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            # Set response headers
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            
            # Mock TAXII status data
            taxii_status = {
                "feeds": [
                    {
                        "name": "AlienVault OTX",
                        "url": "https://otx.alienvault.com/api/v1/",
                        "status": "active",
                        "last_updated": "2024-01-15T16:30:00Z",
                        "indicators_count": 650,
                        "health": "healthy",
                        "response_time": "120ms"
                    },
                    {
                        "name": "ThreatFox",
                        "url": "https://threatfox-api.abuse.ch/api/v1/",
                        "status": "active",
                        "last_updated": "2024-01-15T16:25:00Z",
                        "indicators_count": 400,
                        "health": "healthy",
                        "response_time": "95ms"
                    },
                    {
                        "name": "PhishTank",
                        "url": "https://phishtank.org/api/",
                        "status": "active",
                        "last_updated": "2024-01-15T16:20:00Z",
                        "indicators_count": 200,
                        "health": "healthy",
                        "response_time": "200ms"
                    }
                ],
                "overall_status": "healthy",
                "total_indicators": 1250,
                "last_sync": "2024-01-15T16:30:00Z",
                "next_sync": "2024-01-15T17:30:00Z"
            }
            
            # Write the response
            self.wfile.write(json.dumps(taxii_status).encode())
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            error_response = {"error": f"Internal server error: {str(e)}"}
            self.wfile.write(json.dumps(error_response).encode())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers() 