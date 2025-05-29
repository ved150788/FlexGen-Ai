import json
import os
import sqlite3
from datetime import datetime, timedelta
import requests
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
            
            # Since SQLite database won't work in serverless environment,
            # we'll return mock data for demonstration
            dashboard_data = {
                "totalThreats": 1250,
                "newThreats": 45,
                "highestRisk": 9.2,
                "topDomains": [
                    {"domain": "malicious-site.com", "count": 25},
                    {"domain": "threat-domain.net", "count": 18},
                    {"domain": "suspicious-host.org", "count": 12},
                    {"domain": "phishing-site.io", "count": 9},
                    {"domain": "malware-drop.xyz", "count": 7}
                ],
                "topIPs": [
                    {"ip": "192.168.1.100", "count": 32},
                    {"ip": "10.0.0.5", "count": 28},
                    {"ip": "172.16.1.20", "count": 22},
                    {"ip": "203.0.113.15", "count": 19},
                    {"ip": "198.51.100.8", "count": 15}
                ],
                "threatsByType": [
                    {"type": "malware", "count": 450},
                    {"type": "phishing", "count": 320},
                    {"type": "botnet", "count": 280},
                    {"type": "ransomware", "count": 200}
                ],
                "sourceDistribution": [
                    {"source": "AlienVault OTX", "count": 650},
                    {"source": "ThreatFox", "count": 400},
                    {"source": "Internal", "count": 200}
                ],
                "recentActivity": [
                    {"time": "10:30", "threats": 12},
                    {"time": "11:00", "threats": 8},
                    {"time": "11:30", "threats": 15},
                    {"time": "12:00", "threats": 20},
                    {"time": "12:30", "threats": 10}
                ]
            }
            
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