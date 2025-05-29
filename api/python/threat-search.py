import json
import urllib.parse
from http.server import BaseHTTPRequestHandler

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
                },
                {
                    "id": 3,
                    "indicator": "d41d8cd98f00b204e9800998ecf8427e",
                    "type": "hash",
                    "threat_score": 7.8,
                    "source": "CISA",
                    "description": "MD5 hash of known ransomware payload"
                },
                {
                    "id": 4,
                    "indicator": "phishing-bank.net",
                    "type": "domain",
                    "threat_score": 9.5,
                    "source": "PhishTank",
                    "description": "Domain hosting banking credential phishing page"
                }
            ]
            
            # Filter results based on search query
            if search_query:
                filtered_threats = [
                    threat for threat in all_threats
                    if (search_query in threat['indicator'].lower() or
                        search_query in threat['description'].lower() or
                        search_query in threat['source'].lower() or
                        search_query in threat['type'].lower())
                ]
            else:
                filtered_threats = all_threats
            
            response_data = {
                "results": filtered_threats,
                "total": len(filtered_threats),
                "query": search_query,
                "suggestions": [
                    "malicious",
                    "phishing",
                    "botnet",
                    "ransomware",
                    "ip address",
                    "domain"
                ] if not search_query else []
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