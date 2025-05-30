import json
import os
import sys
import urllib.parse
from http.server import BaseHTTPRequestHandler
from datetime import datetime, timedelta

# Add the current directory to the path to import our database utilities
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

try:
    from database_utils import get_iocs_with_pagination, fetch_live_threat_data
except ImportError:
    # Fallback if import fails
    def get_iocs_with_pagination(page=1, limit=10, threat_type=None, source=None):
        mock_iocs = [
            {
                "id": 1,
                "indicator": "192.168.1.100",
                "type": "ip",
                "threat_score": 8.5,
                "source": "ThreatFox",
                "description": "Malicious IP address associated with botnet activity",
                "created_at": "2024-01-15T10:30:00Z",
                "last_seen": "2024-01-15T14:22:00Z",
                "tags": ["network", "infrastructure", "botnet"],
                "external_links": [
                    {"name": "VirusTotal", "url": f"https://www.virustotal.com/gui/ip-address/192.168.1.100"},
                    {"name": "AbuseIPDB", "url": f"https://www.abuseipdb.com/check/192.168.1.100"}
                ]
            },
            {
                "id": 2,
                "indicator": "malicious-site.com",
                "type": "domain",
                "threat_score": 9.2,
                "source": "AlienVault OTX",
                "description": "Domain used for phishing campaigns targeting financial institutions",
                "created_at": "2024-01-15T09:15:00Z",
                "last_seen": "2024-01-15T15:45:00Z",
                "tags": ["network", "dns", "phishing"],
                "external_links": [
                    {"name": "VirusTotal", "url": f"https://www.virustotal.com/gui/domain/malicious-site.com"},
                    {"name": "URLVoid", "url": f"https://www.urlvoid.com/scan/malicious-site.com"}
                ]
            }
        ]
        
        # Apply filters
        filtered_iocs = mock_iocs
        if threat_type:
            filtered_iocs = [ioc for ioc in filtered_iocs if ioc['type'] == threat_type]
        if source:
            filtered_iocs = [ioc for ioc in filtered_iocs if source.lower() in ioc['source'].lower()]
        
        return {
            "iocs": filtered_iocs,
            "total": len(filtered_iocs),
            "page": page,
            "limit": limit,
            "total_pages": 1
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
            path = url_parts[0]
            query_params = {}
            if len(url_parts) > 1:
                query_params = urllib.parse.parse_qs(url_parts[1])
            
            # Handle different query parameters for filtering/pagination
            page = int(query_params.get('page', ['1'])[0])
            limit = int(query_params.get('limit', ['10'])[0])
            threat_type = query_params.get('type', [None])[0]
            source = query_params.get('source', [None])[0]
            
            # Try to fetch live threat data first
            fetch_live_threat_data()
            
            # Get IOCs from database with pagination
            response_data = get_iocs_with_pagination(page, limit, threat_type, source)
            
            # Add filters to response
            response_data["filters"] = {
                "type": threat_type,
                "source": source
            }
            
            # Write the response
            self.wfile.write(json.dumps(response_data).encode())
            
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