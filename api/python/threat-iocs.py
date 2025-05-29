import json
import os
import sys
import urllib.parse
from http.server import BaseHTTPRequestHandler
from datetime import datetime, timedelta

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
            
            # Mock IOCs data for demonstration
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
                },
                {
                    "id": 3,
                    "indicator": "d41d8cd98f00b204e9800998ecf8427e",
                    "type": "hash",
                    "threat_score": 7.8,
                    "source": "CISA",
                    "description": "MD5 hash of known ransomware payload",
                    "created_at": "2024-01-15T08:00:00Z",
                    "last_seen": "2024-01-15T16:30:00Z",
                    "tags": ["file", "malware", "ransomware"],
                    "external_links": [
                        {"name": "VirusTotal", "url": f"https://www.virustotal.com/gui/file/d41d8cd98f00b204e9800998ecf8427e"},
                        {"name": "Hybrid Analysis", "url": f"https://www.hybrid-analysis.com/search?query=d41d8cd98f00b204e9800998ecf8427e"}
                    ]
                },
                {
                    "id": 4,
                    "indicator": "phishing-bank.net",
                    "type": "domain",
                    "threat_score": 9.5,
                    "source": "PhishTank",
                    "description": "Domain hosting banking credential phishing page",
                    "created_at": "2024-01-15T07:45:00Z",
                    "last_seen": "2024-01-15T17:20:00Z",
                    "tags": ["network", "dns", "phishing", "banking"],
                    "external_links": [
                        {"name": "VirusTotal", "url": f"https://www.virustotal.com/gui/domain/phishing-bank.net"},
                        {"name": "URLVoid", "url": f"https://www.urlvoid.com/scan/phishing-bank.net"}
                    ]
                }
            ]
            
            # Handle different query parameters for filtering/pagination
            page = int(query_params.get('page', ['1'])[0])
            limit = int(query_params.get('limit', ['10'])[0])
            threat_type = query_params.get('type', [None])[0]
            source = query_params.get('source', [None])[0]
            
            # Filter by type if specified
            filtered_iocs = mock_iocs
            if threat_type:
                filtered_iocs = [ioc for ioc in filtered_iocs if ioc['type'] == threat_type]
            
            # Filter by source if specified
            if source:
                filtered_iocs = [ioc for ioc in filtered_iocs if source.lower() in ioc['source'].lower()]
            
            # Pagination
            start_idx = (page - 1) * limit
            end_idx = start_idx + limit
            paginated_iocs = filtered_iocs[start_idx:end_idx]
            
            response_data = {
                "iocs": paginated_iocs,
                "total": len(filtered_iocs),
                "page": page,
                "limit": limit,
                "total_pages": (len(filtered_iocs) + limit - 1) // limit,
                "filters": {
                    "type": threat_type,
                    "source": source
                }
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