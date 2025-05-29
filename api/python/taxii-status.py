from datetime import datetime

def handler(request):
    """Vercel serverless function handler for TAXII status"""
    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        },
        "body": {
            "servers": [
                {
                    "name": "AlienVault OTX",
                    "status": "connected",
                    "lastUpdate": datetime.now().isoformat(),
                    "collections": 1
                },
                {
                    "name": "ThreatFox",
                    "status": "connected", 
                    "lastUpdate": datetime.now().isoformat(),
                    "collections": 1
                }
            ]
        }
    } 