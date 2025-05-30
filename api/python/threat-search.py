import json
import urllib.parse
import os
import sys
from http.server import BaseHTTPRequestHandler

# Add the current directory to the path to import our database utilities
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

try:
    from database_utils import search_threats, fetch_live_threat_data
except ImportError:
    # Fallback if import fails
    def search_threats(query, limit=10, offset=0):
        # Mock search results based on query
        all_threats = [
            {
                "id": 1,
                "indicator": "192.168.1.100",
                "type": "ip",
                "threat_score": 8.5,
                "source": "ThreatFox",
                "description": "Malicious IP address associated with botnet activity"
            },
            {
                "id": 2,
                "indicator": "malicious-site.com",
                "type": "domain",
                "threat_score": 9.2,
                "source": "AlienVault OTX",
                "description": "Domain used for phishing campaigns targeting financial institutions"
            }
        ]
        
        if query:
            filtered_threats = [
                threat for threat in all_threats
                if (query.lower() in threat['indicator'].lower() or
                    query.lower() in threat['description'].lower() or
                    query.lower() in threat['source'].lower() or
                    query.lower() in threat['type'].lower())
            ]
        else:
            filtered_threats = all_threats
        
        return {
            "results": filtered_threats,
            "total": len(filtered_threats),
            "query": query
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
            
            # Parse URL and query parameters
            url_parts = self.path.split('?')
            query_params = {}
            if len(url_parts) > 1:
                query_params = urllib.parse.parse_qs(url_parts[1])
            
            # Get search query parameter
            search_query = query_params.get('q', [''])[0].lower()
            limit = int(query_params.get('limit', ['10'])[0])
            page = int(query_params.get('page', ['1'])[0])
            offset = (page - 1) * limit
            
            # Try to fetch live threat data first
            fetch_live_threat_data()
            
            # Perform search using real database
            search_results = search_threats(search_query, limit, offset)
            
            # Add suggestions for empty queries
            if not search_query:
                search_results["suggestions"] = [
                    "malicious",
                    "phishing",
                    "botnet",
                    "ransomware",
                    "ip address",
                    "domain"
                ]
            else:
                search_results["suggestions"] = []
            
            # Write the response
            self.wfile.write(json.dumps(search_results).encode())
            
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