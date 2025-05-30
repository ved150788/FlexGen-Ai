#!/usr/bin/env python3
"""
Database utilities for Vercel serverless functions.
Handles SQLite database operations with proper connection management.
"""

import sqlite3
import os
import requests
import json
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Optional

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database path - in Vercel, we'll use a temporary path
DB_PATH = "/tmp/threat_intel.db"

def init_database():
    """Initialize the database with required tables"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create tables if they don't exist
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS iocs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            indicator TEXT NOT NULL,
            type TEXT NOT NULL,
            threat_score REAL DEFAULT 5.0,
            source TEXT NOT NULL,
            description TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            last_seen TEXT DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(indicator, source)
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS sources (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            url TEXT,
            description TEXT,
            last_updated TEXT,
            status TEXT DEFAULT 'active'
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS feed_run (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            source TEXT NOT NULL,
            start_time TEXT NOT NULL,
            end_time TEXT,
            status TEXT DEFAULT 'running',
            indicators_added INTEGER DEFAULT 0,
            error_message TEXT
        )
    ''')
    
    # Insert some initial IOCs if database is empty
    cursor.execute('SELECT COUNT(*) FROM iocs')
    if cursor.fetchone()[0] == 0:
        initial_iocs = [
            ('192.168.1.100', 'ip', 8.5, 'ThreatFox', 'Malicious IP address associated with botnet activity'),
            ('malicious-site.com', 'domain', 9.2, 'AlienVault OTX', 'Domain used for phishing campaigns targeting financial institutions'),
            ('d41d8cd98f00b204e9800998ecf8427e', 'hash', 7.8, 'CISA', 'MD5 hash of known ransomware payload'),
            ('phishing-bank.net', 'domain', 9.5, 'PhishTank', 'Domain hosting banking credential phishing page'),
            ('185.220.100.240', 'ip', 8.2, 'DShield', 'Tor exit node with malicious activity'),
            ('evil-payload.exe', 'file', 9.8, 'MalwareBazaar', 'Known malware executable'),
            ('T1055', 'technique', 7.5, 'MITRE ATT&CK', 'Process Injection technique'),
            ('CVE-2023-21608', 'vulnerability', 9.1, 'CISA KEV', 'Microsoft Exchange Server vulnerability')
        ]
        
        cursor.executemany(
            'INSERT OR IGNORE INTO iocs (indicator, type, threat_score, source, description) VALUES (?, ?, ?, ?, ?)',
            initial_iocs
        )
    
    conn.commit()
    conn.close()

def get_db_connection():
    """Get a connection to the SQLite database"""
    # Initialize database if it doesn't exist
    if not os.path.exists(DB_PATH):
        init_database()
    
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def fetch_live_threat_data():
    """Fetch live threat intelligence data from various sources"""
    try:
        # Initialize database
        init_database()
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Fetch from URLhaus for recent malware URLs
        try:
            response = requests.get('https://urlhaus-api.abuse.ch/v1/urls/recent/limit/10/', timeout=5)
            if response.status_code == 200:
                data = response.json()
                for url_data in data.get('urls', []):
                    cursor.execute(
                        'INSERT OR IGNORE INTO iocs (indicator, type, threat_score, source, description) VALUES (?, ?, ?, ?, ?)',
                        (url_data.get('url', ''), 'url', 8.0, 'URLhaus', url_data.get('tags', []))
                    )
        except Exception as e:
            logger.warning(f"Failed to fetch URLhaus data: {e}")
        
        # Fetch from ThreatFox for IOCs
        try:
            response = requests.post(
                'https://threatfox-api.abuse.ch/api/v1/',
                json={'query': 'get_iocs', 'days': 1},
                timeout=5
            )
            if response.status_code == 200:
                data = response.json()
                for ioc_data in data.get('data', []):
                    cursor.execute(
                        'INSERT OR IGNORE INTO iocs (indicator, type, threat_score, source, description) VALUES (?, ?, ?, ?, ?)',
                        (ioc_data.get('ioc', ''), ioc_data.get('ioc_type', 'unknown'), 7.5, 'ThreatFox', ioc_data.get('malware', ''))
                    )
        except Exception as e:
            logger.warning(f"Failed to fetch ThreatFox data: {e}")
        
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        logger.error(f"Error fetching live threat data: {e}")
        return False

def get_dashboard_stats():
    """Get dashboard statistics from the database"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Get total threats
        total_threats = cursor.execute('SELECT COUNT(*) FROM iocs').fetchone()[0]
        
        # Get new threats (last 24 hours)
        yesterday = (datetime.now() - timedelta(days=1)).isoformat()
        new_threats = cursor.execute(
            'SELECT COUNT(*) FROM iocs WHERE created_at >= ?', (yesterday,)
        ).fetchone()[0]
        
        # Get highest risk score
        highest_risk_row = cursor.execute('SELECT MAX(threat_score) FROM iocs').fetchone()
        highest_risk = highest_risk_row[0] if highest_risk_row[0] else 0.0
        
        # Get top domains
        top_domains = cursor.execute(
            'SELECT indicator, COUNT(*) as count FROM iocs WHERE type = "domain" GROUP BY indicator ORDER BY count DESC LIMIT 5'
        ).fetchall()
        
        # Get top IPs
        top_ips = cursor.execute(
            'SELECT indicator, COUNT(*) as count FROM iocs WHERE type = "ip" GROUP BY indicator ORDER BY count DESC LIMIT 5'
        ).fetchall()
        
        # Get threats by type
        threats_by_type = cursor.execute(
            'SELECT type, COUNT(*) as count FROM iocs GROUP BY type ORDER BY count DESC'
        ).fetchall()
        
        # Get source distribution
        source_distribution = cursor.execute(
            'SELECT source, COUNT(*) as count FROM iocs GROUP BY source ORDER BY count DESC'
        ).fetchall()
        
        conn.close()
        
        return {
            "totalThreats": total_threats,
            "newThreats": new_threats,
            "highestRisk": round(highest_risk, 1),
            "topDomains": [{"domain": row[0], "count": row[1]} for row in top_domains],
            "topIPs": [{"ip": row[0], "count": row[1]} for row in top_ips],
            "threatsByType": [{"type": row[0], "count": row[1]} for row in threats_by_type],
            "sourceDistribution": [{"source": row[0], "count": row[1]} for row in source_distribution],
            "recentActivity": [
                {"time": "10:30", "threats": new_threats // 5 if new_threats > 0 else 1},
                {"time": "11:00", "threats": new_threats // 4 if new_threats > 0 else 2},
                {"time": "11:30", "threats": new_threats // 3 if new_threats > 0 else 3},
                {"time": "12:00", "threats": new_threats // 2 if new_threats > 0 else 4},
                {"time": "12:30", "threats": new_threats if new_threats > 0 else 5}
            ]
        }
    except Exception as e:
        logger.error(f"Error getting dashboard stats: {e}")
        return {
            "totalThreats": 0,
            "newThreats": 0,
            "highestRisk": 0.0,
            "topDomains": [],
            "topIPs": [],
            "threatsByType": [],
            "sourceDistribution": [],
            "recentActivity": []
        }

def search_threats(query: str, limit: int = 10, offset: int = 0):
    """Search threats in the database"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        if query:
            search_query = f"%{query.lower()}%"
            results = cursor.execute(
                '''SELECT * FROM iocs 
                   WHERE LOWER(indicator) LIKE ? OR LOWER(description) LIKE ? OR LOWER(source) LIKE ?
                   ORDER BY threat_score DESC LIMIT ? OFFSET ?''',
                (search_query, search_query, search_query, limit, offset)
            ).fetchall()
            
            total = cursor.execute(
                '''SELECT COUNT(*) FROM iocs 
                   WHERE LOWER(indicator) LIKE ? OR LOWER(description) LIKE ? OR LOWER(source) LIKE ?''',
                (search_query, search_query, search_query)
            ).fetchone()[0]
        else:
            results = cursor.execute(
                'SELECT * FROM iocs ORDER BY created_at DESC LIMIT ? OFFSET ?',
                (limit, offset)
            ).fetchall()
            
            total = cursor.execute('SELECT COUNT(*) FROM iocs').fetchone()[0]
        
        conn.close()
        
        threats = []
        for row in results:
            threats.append({
                "id": row['id'],
                "indicator": row['indicator'],
                "type": row['type'],
                "threat_score": row['threat_score'],
                "source": row['source'],
                "description": row['description'] or '',
                "created_at": row['created_at'],
                "last_seen": row['last_seen']
            })
        
        return {
            "results": threats,
            "total": total,
            "query": query
        }
    except Exception as e:
        logger.error(f"Error searching threats: {e}")
        return {"results": [], "total": 0, "query": query}

def get_iocs_with_pagination(page: int = 1, limit: int = 10, threat_type: str = None, source: str = None):
    """Get IOCs with pagination and filtering"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        offset = (page - 1) * limit
        
        # Build query with filters
        base_query = "SELECT * FROM iocs"
        count_query = "SELECT COUNT(*) FROM iocs"
        conditions = []
        params = []
        
        if threat_type:
            conditions.append("type = ?")
            params.append(threat_type)
        
        if source:
            conditions.append("source LIKE ?")
            params.append(f"%{source}%")
        
        if conditions:
            where_clause = " WHERE " + " AND ".join(conditions)
            base_query += where_clause
            count_query += where_clause
        
        # Get total count
        total = cursor.execute(count_query, params).fetchone()[0]
        
        # Get paginated results
        base_query += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
        params.extend([limit, offset])
        
        results = cursor.execute(base_query, params).fetchall()
        
        conn.close()
        
        iocs = []
        for row in results:
            # Generate external links based on type
            external_links = []
            if row['type'] == 'ip':
                external_links = [
                    {"name": "VirusTotal", "url": f"https://www.virustotal.com/gui/ip-address/{row['indicator']}"},
                    {"name": "AbuseIPDB", "url": f"https://www.abuseipdb.com/check/{row['indicator']}"}
                ]
            elif row['type'] == 'domain':
                external_links = [
                    {"name": "VirusTotal", "url": f"https://www.virustotal.com/gui/domain/{row['indicator']}"},
                    {"name": "URLVoid", "url": f"https://www.urlvoid.com/scan/{row['indicator']}"}
                ]
            elif row['type'] == 'hash':
                external_links = [
                    {"name": "VirusTotal", "url": f"https://www.virustotal.com/gui/file/{row['indicator']}"},
                    {"name": "Hybrid Analysis", "url": f"https://www.hybrid-analysis.com/search?query={row['indicator']}"}
                ]
            
            iocs.append({
                "id": row['id'],
                "indicator": row['indicator'],
                "type": row['type'],
                "threat_score": row['threat_score'],
                "source": row['source'],
                "description": row['description'] or '',
                "created_at": row['created_at'],
                "last_seen": row['last_seen'],
                "tags": [row['type'], row['source'].lower().replace(' ', '-')],
                "external_links": external_links
            })
        
        return {
            "iocs": iocs,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": (total + limit - 1) // limit
        }
    except Exception as e:
        logger.error(f"Error getting IOCs: {e}")
        return {"iocs": [], "total": 0, "page": page, "limit": limit, "total_pages": 0} 