#!/usr/bin/env python3
"""
Enhanced Flask API server for the Threat Intelligence Platform.
This now connects to real data from the database instead of using mock data.
"""

from flask import Flask, jsonify, request
import logging
import os
import sqlite3
from datetime import datetime, timedelta
import json
import requests

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Database path
DB_PATH = "threat_intel.db"

# AlienVault API configuration
API_KEY = "61b8bc7b26584345ce93d6ac72ce015ec6c37e9f1ae37fc99ba2951acbdea1a2"
BASE_URL = "https://otx.alienvault.com/api/v1"

# Create a simple Flask app
app = Flask(__name__)

def get_db_connection():
    """Get a connection to the SQLite database"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def index():
    """Basic API information"""
    return jsonify({
        "status": "running",
        "message": "Threat Intelligence Platform API is operational",
        "alienvault_configured": True,
        "api_key": API_KEY
    })

@app.route('/api/stats')
def stats():
    """Get basic stats about the IOCs"""
    try:
        conn = get_db_connection()
        
        # Count total IOCs
        total_iocs = conn.execute('SELECT COUNT(*) FROM ioc').fetchone()[0]
        
        # Get the last update time
        last_update_row = conn.execute(
            'SELECT MAX(end_time) FROM feed_run WHERE status = "success"'
        ).fetchone()
        
        last_update = last_update_row[0] if last_update_row and last_update_row[0] else datetime.utcnow().isoformat()
        
        # Count total pulses (feed runs)
        total_pulses = conn.execute('SELECT COUNT(*) FROM feed_run').fetchone()[0]
        
        conn.close()
        
        return jsonify({
            "total_iocs": total_iocs,
            "total_pulses": total_pulses,
            "last_update": last_update,
            "alienvault_status": "connected" if total_iocs > 0 else "not connected"
        })
    except Exception as e:
        logger.error(f"Error getting stats: {str(e)}")
        return jsonify({
            "total_iocs": 0,
            "total_pulses": 0,
            "last_update": datetime.utcnow().isoformat(),
            "alienvault_status": "error",
            "error": str(e)
        })

@app.route('/api/indicators')
def indicators():
    """Get IOC indicators from the database"""
    try:
        # Get page and limit from query params
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 10, type=int)
        offset = (page - 1) * limit
        
        conn = get_db_connection()
        
        # Get total count
        total = conn.execute('SELECT COUNT(*) FROM ioc').fetchone()[0]
        
        # Get indicators with pagination
        cursor = conn.execute(
            'SELECT id, type, value, source, confidence_score, first_seen FROM ioc ORDER BY first_seen DESC LIMIT ? OFFSET ?', 
            (limit, offset)
        )
        
        results = []
        for row in cursor:
            results.append({
                "id": row['id'],
                "type": row['type'],
                "value": row['value'],
                "source": row['source'],
                "first_seen": row['first_seen'],
                "confidence": row['confidence_score']
            })
        
        conn.close()
        
        return jsonify({
            "indicators": results,
            "total": total,
            "page": page,
            "page_size": limit
        })
    except Exception as e:
        logger.error(f"Error getting indicators: {str(e)}")
        return jsonify({
            "indicators": [],
            "total": 0,
            "page": 1,
            "page_size": 10,
            "error": str(e)
        })

# Add routes for the API endpoints the Next.js app is trying to access
@app.route('/api/tools/threat-intelligence/iocs/')
def nextjs_iocs():
    """API endpoint for Next.js IOC explorer"""
    try:
        conn = get_db_connection()
        
        cursor = conn.execute(
            'SELECT id, type, value, source, confidence_score, first_seen, last_seen, description, tags FROM ioc ORDER BY first_seen DESC'
        )
        
        results = []
        for row in cursor:
            # Parse tags if they exist
            tags = []
            if row['tags']:
                try:
                    tags = json.loads(row['tags'])
                except:
                    pass
            
            # Calculate a threat score based on confidence
            threat_score = float(row['confidence_score']) * 10 if row['confidence_score'] else 5.0
            
            results.append({
                "id": row['id'],
                "type": row['type'],
                "value": row['value'],
                "source": row['source'],
                "firstSeen": row['first_seen'],
                "lastSeen": row['last_seen'],
                "description": row['description'],
                "tags": tags,
                "threatScore": round(threat_score, 1)
            })
        
        conn.close()
        
        return jsonify({
            "results": results
        })
    except Exception as e:
        logger.error(f"Error getting IOCs for Next.js: {str(e)}")
        return jsonify({
            "results": [],
            "error": str(e)
        })

@app.route('/api/tools/threat-intelligence/dashboard/')
def nextjs_dashboard():
    """API endpoint for Next.js dashboard"""
    try:
        conn = get_db_connection()
        
        # Calculate total threats
        total_threats = conn.execute('SELECT COUNT(*) FROM ioc').fetchone()[0]
        
        # Calculate new threats in last 24h
        yesterday = (datetime.utcnow() - timedelta(days=1)).isoformat()
        new_threats = conn.execute(
            'SELECT COUNT(*) FROM ioc WHERE first_seen >= ?', 
            (yesterday,)
        ).fetchone()[0]
        
        # Get top domains
        cursor = conn.execute(
            'SELECT value, COUNT(*) as count FROM ioc WHERE type = "domain" GROUP BY value ORDER BY count DESC LIMIT 5'
        )
        top_domains = [{"domain": row['value'], "count": row['count']} for row in cursor]
        
        # Get top IPs
        cursor = conn.execute(
            'SELECT value, COUNT(*) as count FROM ioc WHERE type = "ip" GROUP BY value ORDER BY count DESC LIMIT 5'
        )
        top_ips = [{"ip": row['value'], "count": row['count']} for row in cursor]
        
        # Get threats by type
        cursor = conn.execute(
            'SELECT type, COUNT(*) as count FROM ioc GROUP BY type ORDER BY count DESC'
        )
        threats_by_type = [{"type": row['type'].capitalize(), "count": row['count']} for row in cursor]
        
        # Get source distribution
        cursor = conn.execute(
            'SELECT source, COUNT(*) as count FROM ioc GROUP BY source ORDER BY count DESC'
        )
        source_distribution = [{"source": row['source'], "count": row['count']} for row in cursor]
        
        # Get most active source
        cursor = conn.execute(
            'SELECT source, COUNT(*) as count FROM ioc GROUP BY source ORDER BY count DESC LIMIT 1'
        )
        most_active_row = cursor.fetchone()
        most_active_source = most_active_row['source'] if most_active_row else "Unknown"
        
        # Get highest risk score
        cursor = conn.execute(
            'SELECT MAX(confidence_score) as max_score FROM ioc'
        )
        max_score_row = cursor.fetchone()
        highest_risk_score = round(float(max_score_row['max_score']) * 10, 1) if max_score_row and max_score_row['max_score'] else 0
        
        conn.close()
        
        return jsonify({
            "totalThreats": total_threats,
            "newThreats": new_threats,
            "topDomains": top_domains,
            "topIPs": top_ips,
            "threatsByType": threats_by_type,
            "sourceDistribution": source_distribution,
            "mostActiveSource": most_active_source,
            "highestRiskScore": highest_risk_score,
            "isMockData": False
        })
    except Exception as e:
        logger.error(f"Error getting dashboard data for Next.js: {str(e)}")
        return jsonify({
            "totalThreats": 0,
            "newThreats": 0,
            "topDomains": [],
            "topIPs": [],
            "threatsByType": [],
            "sourceDistribution": [],
            "mostActiveSource": "Unknown",
            "highestRiskScore": 0,
            "isMockData": True,
            "error": str(e)
        })

@app.route('/api/tools/threat-intelligence/taxii-status/', methods=['GET'])
def taxii_status():
    """Return TAXII configuration status"""
    return jsonify({
        "configured": True,
        "collections": [
            {
                "name": "AlienVault OTX",
                "description": "AlienVault Open Threat Exchange",
                "status": "Connected",
                "lastSync": datetime.utcnow().isoformat(),
                "itemCount": 100
            }
        ]
    })

if __name__ == '__main__':
    # Use port 5000 which is what the Next.js app expects
    port = int(os.environ.get("PORT", 5000))
    logger.info(f"Starting Threat Intelligence API on port {port}")
    app.run(host='0.0.0.0', port=port, debug=True) 