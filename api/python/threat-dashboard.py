from flask import Flask, jsonify
import sqlite3
import os
from datetime import datetime, timedelta
import requests

app = Flask(__name__)

# Database setup - use absolute path for serverless
DB_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'backend', 'threat_intel.db')

def init_db():
    """Initialize the database with required tables"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create IOCs table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS iocs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            indicator TEXT UNIQUE,
            type TEXT,
            threat_score REAL,
            source TEXT,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create sources table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS sources (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE,
            last_updated TIMESTAMP,
            status TEXT DEFAULT 'active'
        )
    ''')
    
    conn.commit()
    conn.close()

def fetch_alienvault_data():
    """Fetch data from AlienVault OTX"""
    try:
        # Using a demo API key - replace with real one for production
        api_key = "61b8bc7b26584345ce93d6ac72ce015ec6c37e9f1ae37fc99ba2951acbdea1a2"
        headers = {"X-OTX-API-KEY": api_key}
        
        # Fetch recent pulses
        url = "https://otx.alienvault.com/api/v1/pulses/subscribed"
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            return data.get('results', [])[:10]  # Limit to 10 recent pulses
    except Exception as e:
        print(f"Error fetching AlienVault data: {e}")
    
    return []

def fetch_threatfox_data():
    """Fetch data from ThreatFox"""
    try:
        url = "https://threatfox-api.abuse.ch/api/v1/"
        data = {"query": "get_iocs", "days": 1}
        
        response = requests.post(url, json=data, timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            if result.get('query_status') == 'ok':
                return result.get('data', [])[:20]  # Limit to 20 recent IOCs
    except Exception as e:
        print(f"Error fetching ThreatFox data: {e}")
    
    return []

def store_iocs(iocs_data, source):
    """Store IOCs in the database"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    for ioc in iocs_data:
        try:
            if source == 'alienvault':
                # Process AlienVault data
                for indicator in ioc.get('indicators', []):
                    cursor.execute('''
                        INSERT OR REPLACE INTO iocs 
                        (indicator, type, threat_score, source, description)
                        VALUES (?, ?, ?, ?, ?)
                    ''', (
                        indicator.get('indicator', ''),
                        indicator.get('type', ''),
                        min(indicator.get('reputation', 0) / 10, 10),  # Normalize to 0-10
                        'AlienVault OTX',
                        ioc.get('name', '')[:200]  # Limit description length
                    ))
            
            elif source == 'threatfox':
                # Process ThreatFox data
                cursor.execute('''
                    INSERT OR REPLACE INTO iocs 
                    (indicator, type, threat_score, source, description)
                    VALUES (?, ?, ?, ?, ?)
                ''', (
                    ioc.get('ioc', ''),
                    ioc.get('ioc_type', ''),
                    min(ioc.get('confidence_level', 50) / 10, 10),  # Normalize to 0-10
                    'ThreatFox',
                    ioc.get('malware', '')[:200]
                ))
        except Exception as e:
            print(f"Error storing IOC: {e}")
            continue
    
    conn.commit()
    conn.close()

def handler(request):
    """Vercel serverless function handler"""
    # Initialize database if it doesn't exist
    if not os.path.exists(DB_PATH):
        init_db()
        # Fetch initial data
        alienvault_data = fetch_alienvault_data()
        if alienvault_data:
            store_iocs(alienvault_data, 'alienvault')
        
        threatfox_data = fetch_threatfox_data()
        if threatfox_data:
            store_iocs(threatfox_data, 'threatfox')
    
    # Get dashboard statistics
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Get total threats
    cursor.execute('SELECT COUNT(*) FROM iocs')
    total_threats = cursor.fetchone()[0]
    
    # Get new threats (last 24 hours)
    yesterday = datetime.now() - timedelta(days=1)
    cursor.execute('SELECT COUNT(*) FROM iocs WHERE created_at > ?', (yesterday,))
    new_threats = cursor.fetchone()[0]
    
    # Get top domains from real data only
    cursor.execute('''
        SELECT indicator, COUNT(*) as count 
        FROM iocs 
        WHERE type IN ('domain', 'hostname', 'url') 
        GROUP BY indicator 
        ORDER BY count DESC 
        LIMIT 5
    ''')
    top_domains = [{"domain": row[0], "count": row[1]} for row in cursor.fetchall()]
    
    # Get top IPs from real data only
    cursor.execute('''
        SELECT indicator, COUNT(*) as count 
        FROM iocs 
        WHERE type IN ('ip', 'IPv4', 'IPv6') 
        GROUP BY indicator 
        ORDER BY count DESC 
        LIMIT 5
    ''')
    top_ips = [{"ip": row[0], "count": row[1]} for row in cursor.fetchall()]
    
    # Get threats by type
    cursor.execute('''
        SELECT type, COUNT(*) as count 
        FROM iocs 
        GROUP BY type 
        ORDER BY count DESC
    ''')
    threats_by_type = [{"type": row[0], "count": row[1]} for row in cursor.fetchall()]
    
    # Get source distribution
    cursor.execute('''
        SELECT source, COUNT(*) as count 
        FROM iocs 
        GROUP BY source 
        ORDER BY count DESC
    ''')
    source_distribution = [{"source": row[0], "count": row[1]} for row in cursor.fetchall()]
    
    # Get highest risk score
    cursor.execute('SELECT MAX(threat_score) FROM iocs')
    highest_risk = cursor.fetchone()[0] or 0
    
    conn.close()
    
    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        },
        "body": {
            "totalThreats": total_threats,
            "newThreats": new_threats,
            "topDomains": top_domains,
            "topIPs": top_ips,
            "threatsByType": threats_by_type,
            "sourceDistribution": source_distribution,
            "mostActiveSource": source_distribution[0]["source"] if source_distribution else "N/A",
            "highestRiskScore": highest_risk,
            "isMockData": total_threats == 0
        }
    } 