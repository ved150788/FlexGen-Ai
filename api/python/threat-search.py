import sqlite3
import os
from urllib.parse import parse_qs

# Database setup - use absolute path for serverless
DB_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'backend', 'threat_intel.db')

def handler(request):
    """Vercel serverless function handler for threat search"""
    try:
        # Parse query parameters
        query = ""
        if hasattr(request, 'args') and request.args.get('query'):
            query = request.args.get('query', '')
        elif hasattr(request, 'url') and '?' in request.url:
            parsed = parse_qs(request.url.split('?')[1])
            query = parsed.get('query', [''])[0]
        
        if not query:
            return {
                "statusCode": 200,
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type"
                },
                "body": []
            }
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT indicator, type, threat_score, source, description, created_at
            FROM iocs 
            WHERE indicator LIKE ? OR description LIKE ?
            ORDER BY threat_score DESC
            LIMIT 50
        ''', (f'%{query}%', f'%{query}%'))
        
        results = []
        for row in cursor.fetchall():
            results.append({
                "indicator": row[0],
                "type": row[1],
                "threatScore": row[2],
                "source": row[3],
                "description": row[4],
                "createdAt": row[5]
            })
        
        conn.close()
        
        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            },
            "body": results
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            "body": {"error": str(e)}
        } 