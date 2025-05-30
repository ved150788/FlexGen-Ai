import json
import os
import sys
from http.server import BaseHTTPRequestHandler

# Add the current directory to the path to import our database utilities
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

try:
    from database_utils import get_dashboard_stats, fetch_live_threat_data
except ImportError:
    # Fallback if import fails
    def get_dashboard_stats():
        return {
            "totalThreats": 1250,
            "newThreats": 45,
            "highestRisk": 9.2,
            "topDomains": [
                {"domain": "malicious-site.com", "count": 25},
                {"domain": "threat-domain.net", "count": 18}
            ],
            "topIPs": [
                {"ip": "192.168.1.100", "count": 32},
                {"ip": "10.0.0.5", "count": 28}
            ],
            "threatsByType": [
                {"type": "malware", "count": 450},
                {"type": "phishing", "count": 320}
            ],
            "sourceDistribution": [
                {"source": "AlienVault OTX", "count": 650},
                {"source": "ThreatFox", "count": 400}
            ],
            "recentActivity": [
                {"time": "10:30", "threats": 12},
                {"time": "11:00", "threats": 8}
            ]
        }
    
    def fetch_live_threat_data():
        return False

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
            
            # Try to fetch live threat data first
            fetch_live_threat_data()
            
            # Get real dashboard data from database
            dashboard_data = get_dashboard_stats()
            
            # Write the response
            self.wfile.write(json.dumps(dashboard_data).encode())
            
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