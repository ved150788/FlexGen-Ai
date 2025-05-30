import json
import os
import sys
from http.server import BaseHTTPRequestHandler
from datetime import datetime

# Add the current directory to the path to import our database utilities
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

try:
    from database_utils import get_db_connection, fetch_live_threat_data
except ImportError:
    def get_db_connection():
        return None
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
            data_fetch_success = fetch_live_threat_data()
            
            # Get database connection to check feed status
            conn = get_db_connection()
            
            # Real TAXII feed configurations
            feeds_status = {
                'mitre_attack': {
                    'name': 'MITRE ATT&CK',
                    'description': 'Adversarial Tactics, Techniques, and Common Knowledge framework',
                    'url': 'https://cti-taxii.mitre.org/taxii/',
                    'status': 'active' if data_fetch_success else 'error',
                    'last_updated': datetime.now().isoformat(),
                    'indicators_count': 0,
                    'format': 'STIX 2.1 via TAXII'
                },
                'cisa_kev': {
                    'name': 'CISA Known Exploited Vulnerabilities',
                    'description': 'Known exploited vulnerabilities catalog maintained by CISA',
                    'url': 'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json',
                    'status': 'active',
                    'last_updated': datetime.now().isoformat(),
                    'indicators_count': 0,
                    'format': 'JSON Feed'
                },
                'urlhaus': {
                    'name': 'URLhaus by abuse.ch',
                    'description': 'Malware URLs and payloads from URLhaus project',
                    'url': 'https://urlhaus-api.abuse.ch/v1/urls/recent/',
                    'status': 'active' if data_fetch_success else 'error',
                    'last_updated': datetime.now().isoformat(),
                    'indicators_count': 0,
                    'format': 'JSON API'
                },
                'threatfox': {
                    'name': 'ThreatFox by abuse.ch',
                    'description': 'Indicators of Compromise (IOCs) from ThreatFox',
                    'url': 'https://threatfox-api.abuse.ch/api/v1/',
                    'status': 'active' if data_fetch_success else 'error',
                    'last_updated': datetime.now().isoformat(),
                    'indicators_count': 0,
                    'format': 'JSON API'
                },
                'dshield': {
                    'name': 'DShield by SANS',
                    'description': 'Top attacking IP addresses from DShield honeypots',
                    'url': 'https://isc.sans.edu/api/sources/attacks/20/json',
                    'status': 'active',
                    'last_updated': datetime.now().isoformat(),
                    'indicators_count': 0,
                    'format': 'JSON API'
                },
                'openphish': {
                    'name': 'OpenPhish',
                    'description': 'Phishing URLs from OpenPhish community feed',
                    'url': 'https://openphish.com/feed.txt',
                    'status': 'active',
                    'last_updated': datetime.now().isoformat(),
                    'indicators_count': 0,
                    'format': 'Text Feed'
                }
            }
            
            # Get actual counts from database if connection is available
            if conn:
                try:
                    cursor = conn.cursor()
                    
                    # Get counts by source
                    source_counts = cursor.execute(
                        'SELECT source, COUNT(*) as count FROM iocs GROUP BY source'
                    ).fetchall()
                    
                    source_count_dict = {row[0]: row[1] for row in source_counts}
                    
                    # Update counts in feeds_status
                    for feed_id, feed_info in feeds_status.items():
                        feed_name = feed_info['name']
                        # Match by name or partial name
                        for source, count in source_count_dict.items():
                            if (feed_name.lower() in source.lower() or 
                                any(word in source.lower() for word in feed_name.lower().split())):
                                feeds_status[feed_id]['indicators_count'] = count
                                break
                    
                    # Get total indicators
                    total_indicators = cursor.execute('SELECT COUNT(*) FROM iocs').fetchone()[0]
                    
                    # Get last feed run information
                    last_run = cursor.execute(
                        'SELECT * FROM feed_run ORDER BY start_time DESC LIMIT 1'
                    ).fetchone()
                    
                    conn.close()
                    
                except Exception as e:
                    if conn:
                        conn.close()
                    total_indicators = 0
                    last_run = None
            else:
                total_indicators = 0
                last_run = None
            
            # Prepare response
            response_data = {
                "feeds": feeds_status,
                "summary": {
                    "total_feeds": len(feeds_status),
                    "active_feeds": sum(1 for feed in feeds_status.values() if feed['status'] == 'active'),
                    "total_indicators": total_indicators,
                    "last_refresh": datetime.now().isoformat(),
                    "data_ingestion_active": data_fetch_success
                },
                "last_run": {
                    "source": last_run[1] if last_run else "Unknown",
                    "start_time": last_run[2] if last_run else datetime.now().isoformat(),
                    "end_time": last_run[3] if last_run else datetime.now().isoformat(),
                    "status": last_run[4] if last_run else "success",
                    "indicators_added": last_run[5] if last_run else 0
                } if last_run else None
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