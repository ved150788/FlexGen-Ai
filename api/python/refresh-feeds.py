import json
import os
import sys
from http.server import BaseHTTPRequestHandler
from datetime import datetime

# Add the current directory to the path to import our database utilities
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

try:
    from database_utils import fetch_live_threat_data, get_db_connection
except ImportError:
    def fetch_live_threat_data():
        return False
    def get_db_connection():
        return None

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # Set response headers
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            
            # Record feed run start
            start_time = datetime.now().isoformat()
            
            # Try to fetch live threat data
            success = fetch_live_threat_data()
            
            # Get updated counts
            conn = get_db_connection()
            total_indicators = 0
            
            if conn:
                try:
                    cursor = conn.cursor()
                    total_indicators = cursor.execute('SELECT COUNT(*) FROM iocs').fetchone()[0]
                    
                    # Record feed run
                    cursor.execute(
                        'INSERT INTO feed_run (source, start_time, end_time, status, indicators_added) VALUES (?, ?, ?, ?, ?)',
                        ('Manual Refresh', start_time, datetime.now().isoformat(), 'success' if success else 'error', total_indicators)
                    )
                    conn.commit()
                    conn.close()
                except Exception as e:
                    if conn:
                        conn.close()
                    print(f"Database error: {e}")
            
            response_data = {
                "success": success,
                "message": "Feed refresh completed successfully" if success else "Feed refresh encountered errors",
                "total_indicators": total_indicators,
                "refresh_time": datetime.now().isoformat(),
                "feeds_updated": [
                    "URLhaus",
                    "ThreatFox",
                    "MITRE ATT&CK",
                    "CISA KEV"
                ] if success else []
            }
            
            # Write the response
            self.wfile.write(json.dumps(response_data).encode())
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            error_response = {"error": f"Internal server error: {str(e)}"}
            self.wfile.write(json.dumps(error_response).encode())

    def do_GET(self):
        # Redirect GET requests to POST for manual refresh
        self.do_POST()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers() 