from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import sqlite3
import os
import time
import threading
import schedule
from datetime import datetime, timedelta
import json
import sys

# Add parent directory to path to import taxii_feeds
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from taxii_feeds import TaxiiFeedManager

app = Flask(__name__)
CORS(app)

# Database setup
DB_PATH = 'threat_intel.db'

# Initialize TAXII Feed Manager
feed_manager = TaxiiFeedManager()

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
    
    # Create feed_run table for tracking
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
    
    conn.commit()
    conn.close()

def scheduled_feed_update():
    """Scheduled function to update threat feeds"""
    try:
        print(f"[{datetime.now()}] Starting scheduled threat intelligence update...")
        
        # Use the comprehensive TAXII feed manager
        results = feed_manager.fetch_all_feeds()
        
        total_added = sum(results.values())
        print(f"[{datetime.now()}] Scheduled update completed: {total_added} indicators added")
        
        # Log the results
        for source, count in results.items():
            if count > 0:
                print(f"  {source}: {count} new indicators")
        
    except Exception as e:
        print(f"[{datetime.now()}] Error in scheduled update: {e}")

def start_scheduler():
    """Start the background scheduler for threat intelligence updates"""
    # Schedule updates every 6 hours
    schedule.every(6).hours.do(scheduled_feed_update)
    
    # Also schedule a daily comprehensive update at 2 AM
    schedule.every().day.at("02:00").do(scheduled_feed_update)
    
    def run_scheduler():
        while True:
            schedule.run_pending()
            time.sleep(60)  # Check every minute
    
    # Run scheduler in background thread
    scheduler_thread = threading.Thread(target=run_scheduler, daemon=True)
    scheduler_thread.start()
    print("Background scheduler started: Updates every 6 hours and daily at 2:00 AM")

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

@app.route('/api/dashboard', methods=['GET'])
def get_dashboard():
    """Get dashboard statistics"""
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
    
    return jsonify({
        "totalThreats": total_threats,
        "newThreats": new_threats,
        "topDomains": top_domains,
        "topIPs": top_ips,
        "threatsByType": threats_by_type,
        "sourceDistribution": source_distribution,
        "mostActiveSource": source_distribution[0]["source"] if source_distribution else "N/A",
        "highestRiskScore": highest_risk,
        "isMockData": total_threats == 0
    })

@app.route('/api/iocs', methods=['GET'])
def get_iocs():
    """Get IOCs with pagination support"""
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 50, type=int)
    type_filter = request.args.get('type', '')
    source_filter = request.args.get('source', '')
    
    offset = (page - 1) * limit
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Build query with filters
    where_clauses = []
    params = []
    
    if type_filter and type_filter != 'all':
        where_clauses.append('type = ?')
        params.append(type_filter)
    
    if source_filter and source_filter != 'all':
        where_clauses.append('source = ?')
        params.append(source_filter)
    
    where_sql = ' WHERE ' + ' AND '.join(where_clauses) if where_clauses else ''
    
    # Get total count for pagination
    count_query = f'SELECT COUNT(*) FROM iocs{where_sql}'
    cursor.execute(count_query, params)
    total_count = cursor.fetchone()[0]
    
    # Get paginated IOCs with enhanced information
    query = f'''
        SELECT indicator, type, threat_score, source, description, created_at, last_seen
        FROM iocs {where_sql}
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
    '''
    
    cursor.execute(query, params + [limit, offset])
    
    iocs = []
    for row in cursor.fetchall():
        ioc_data = {
            "indicator": row[0],
            "type": row[1],
            "threatScore": row[2],
            "source": row[3],
            "description": row[4],
            "createdAt": row[5],
            "firstSeen": row[5],  # Using created_at as first_seen for compatibility
            "lastSeen": row[6] if row[6] else row[5],
            "tags": generate_tags_for_ioc(row[0], row[1], row[3]),
            "detailedDescription": generate_detailed_description(row[0], row[1], row[3]),
            "suggestedRemedies": generate_remediation_steps(row[0], row[1]),
            "technicalDetails": generate_technical_details(row[0], row[1]),
            "externalLinks": generate_external_links(row[0], row[1]),
            "sourceUrl": generate_source_url(row[3], row[0]),
            "sampleText": row[4]  # Using description as sample text
        }
        iocs.append(ioc_data)
    
    conn.close()
    
    total_pages = (total_count + limit - 1) // limit
    
    return jsonify({
        "iocs": iocs,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total_count,
            "totalPages": total_pages,
            "hasNextPage": page < total_pages,
            "hasPrevPage": page > 1
        }
    })

def generate_tags_for_ioc(indicator, ioc_type, source):
    """Generate relevant tags for an IOC"""
    tags = []
    
    # Add type-based tags
    if ioc_type.lower() in ['ip', 'ipv4', 'ipv6']:
        tags.extend(['network', 'infrastructure'])
        if indicator.startswith('192.168.') or indicator.startswith('10.') or indicator.startswith('172.'):
            tags.append('private-ip')
        else:
            tags.append('public-ip')
    elif ioc_type.lower() in ['domain', 'hostname']:
        tags.extend(['network', 'dns'])
        if any(tld in indicator for tld in ['.tk', '.ml', '.ga', '.cf']):
            tags.append('suspicious-tld')
    elif ioc_type.lower() in ['url']:
        tags.extend(['network', 'web'])
        if 'http://' in indicator:
            tags.append('unencrypted')
        elif 'https://' in indicator:
            tags.append('encrypted')
    elif ioc_type.lower() in ['hash', 'md5', 'sha1', 'sha256']:
        tags.extend(['file', 'malware'])
    elif ioc_type.lower() in ['email']:
        tags.extend(['communication', 'phishing'])
    
    # Add source-based tags
    if 'mitre' in source.lower():
        tags.append('apt')
    elif 'cisa' in source.lower():
        tags.append('vulnerability')
    elif 'threatfox' in source.lower() or 'malware' in source.lower():
        tags.append('malware')
    elif 'phish' in source.lower():
        tags.append('phishing')
    elif 'urlhaus' in source.lower():
        tags.append('payload')
    
    return list(set(tags))  # Remove duplicates

def generate_detailed_description(indicator, ioc_type, source):
    """Generate detailed description for an IOC"""
    descriptions = {
        'ip': f"This IP address ({indicator}) has been identified as a potential threat by {source}. IP addresses can be used for various malicious activities including hosting malware, command and control servers, or as part of botnet infrastructure.",
        'domain': f"The domain {indicator} has been flagged by {source} as potentially malicious. Malicious domains are often used for phishing campaigns, malware distribution, or as command and control infrastructure for cyber attacks.",
        'url': f"This URL ({indicator}) has been identified by {source} as containing malicious content. Such URLs may host malware, conduct phishing attacks, or redirect users to other malicious resources.",
        'hash': f"This file hash ({indicator}) corresponds to a file that has been identified as malicious by {source}. File hashes are unique fingerprints that allow security professionals to identify known malware samples.",
        'email': f"This email address ({indicator}) has been associated with malicious activity according to {source}. It may be used for phishing campaigns, spam distribution, or other cyber criminal activities."
    }
    
    base_desc = descriptions.get(ioc_type.lower(), f"This indicator ({indicator}) has been flagged by {source} as potentially malicious.")
    
    # Add source-specific context
    if 'mitre' in source.lower():
        base_desc += " This indicator is associated with Advanced Persistent Threat (APT) groups and sophisticated attack campaigns documented by MITRE."
    elif 'cisa' in source.lower():
        base_desc += " This indicator is part of CISA's Known Exploited Vulnerabilities catalog, indicating active exploitation in the wild."
    elif 'threatfox' in source.lower():
        base_desc += " This indicator was reported to ThreatFox, a collaborative threat intelligence platform maintained by abuse.ch."
    elif 'urlhaus' in source.lower():
        base_desc += " This indicator was identified through URLhaus, which tracks malware URLs and payload distribution."
    
    return base_desc

def generate_remediation_steps(indicator, ioc_type):
    """Generate remediation steps based on IOC type"""
    remediation_map = {
        'ip': [
            "Block the IP address in your firewall and network security devices",
            "Review network logs for any connections to or from this IP address",
            "Check for any internal systems that may have communicated with this IP",
            "Update threat intelligence feeds to include this indicator",
            "Monitor for any lateral movement if internal systems were compromised",
            "Consider implementing geolocation blocking if the IP is from an unexpected region"
        ],
        'domain': [
            "Block the domain in your DNS filtering solution",
            "Add the domain to your web proxy blocklist",
            "Check DNS logs for any queries to this domain",
            "Review web traffic logs for connections to this domain",
            "Update email security filters to block emails from this domain",
            "Educate users about the risks of visiting unknown domains"
        ],
        'url': [
            "Block the URL in your web proxy and security appliances",
            "Check web access logs for any visits to this URL",
            "Scan any systems that may have accessed this URL for malware",
            "Update web filtering rules to prevent access to similar URLs",
            "Review browser history on user workstations for this URL",
            "Implement additional web content filtering if necessary"
        ],
        'hash': [
            "Scan all systems for files matching this hash signature",
            "Remove any files found with this hash from affected systems",
            "Quarantine or delete the malicious file if found",
            "Update antivirus signatures to detect this hash",
            "Review file execution logs for this hash",
            "Implement application whitelisting to prevent execution of unknown files"
        ],
        'email': [
            "Block this email address in your email security solution",
            "Review email logs for any messages from this address",
            "Check if any users have received emails from this address",
            "Add the email to your spam and phishing filters",
            "Educate users about phishing attempts from this sender",
            "Implement additional email authentication mechanisms (SPF, DKIM, DMARC)"
        ]
    }
    
    return remediation_map.get(ioc_type.lower(), [
        "Review security logs for any activity related to this indicator",
        "Update security controls to detect and block this indicator",
        "Monitor for additional related indicators of compromise",
        "Consider threat hunting activities to identify related threats",
        "Update incident response procedures based on this threat type"
    ])

def generate_technical_details(indicator, ioc_type):
    """Generate technical details for an IOC"""
    import ipaddress
    import socket
    import hashlib
    
    details = {}
    
    try:
        if ioc_type.lower() in ['ip', 'ipv4', 'ipv6']:
            ip = ipaddress.ip_address(indicator)
            details['ip_version'] = f"IPv{ip.version}"
            details['is_private'] = str(ip.is_private)
            details['is_multicast'] = str(ip.is_multicast)
            details['is_reserved'] = str(ip.is_reserved)
            
        elif ioc_type.lower() in ['domain', 'hostname']:
            details['domain_length'] = str(len(indicator))
            details['subdomain_count'] = str(indicator.count('.'))
            details['tld'] = indicator.split('.')[-1] if '.' in indicator else 'none'
            
        elif ioc_type.lower() in ['hash', 'md5', 'sha1', 'sha256']:
            details['hash_length'] = str(len(indicator))
            if len(indicator) == 32:
                details['hash_type'] = 'MD5'
            elif len(indicator) == 40:
                details['hash_type'] = 'SHA1'
            elif len(indicator) == 64:
                details['hash_type'] = 'SHA256'
            else:
                details['hash_type'] = 'Unknown'
                
        elif ioc_type.lower() in ['url']:
            details['url_length'] = str(len(indicator))
            details['protocol'] = indicator.split('://')[0] if '://' in indicator else 'unknown'
            details['has_parameters'] = str('?' in indicator)
            
    except Exception:
        details['error'] = 'Unable to parse technical details'
    
    return details

def generate_external_links(indicator, ioc_type):
    """Generate external analysis links for an IOC"""
    links = []
    
    if ioc_type.lower() in ['ip', 'ipv4', 'ipv6']:
        links.extend([
            {
                "name": "VirusTotal Analysis",
                "url": f"https://www.virustotal.com/gui/ip-address/{indicator}",
                "description": "Comprehensive malware analysis and reputation scoring"
            },
            {
                "name": "AbuseIPDB Report",
                "url": f"https://www.abuseipdb.com/check/{indicator}",
                "description": "Community-driven IP reputation and abuse reporting"
            },
            {
                "name": "Shodan Search",
                "url": f"https://www.shodan.io/host/{indicator}",
                "description": "Internet-connected device and service information"
            }
        ])
    elif ioc_type.lower() in ['domain', 'hostname']:
        links.extend([
            {
                "name": "VirusTotal Domain Analysis",
                "url": f"https://www.virustotal.com/gui/domain/{indicator}",
                "description": "Domain reputation and malware detection results"
            },
            {
                "name": "URLVoid Reputation Check",
                "url": f"https://www.urlvoid.com/scan/{indicator}",
                "description": "Domain reputation check across multiple engines"
            },
            {
                "name": "WHOIS Information",
                "url": f"https://whois.domaintools.com/{indicator}",
                "description": "Domain registration and ownership information"
            }
        ])
    elif ioc_type.lower() in ['hash', 'md5', 'sha1', 'sha256']:
        links.extend([
            {
                "name": "VirusTotal Hash Analysis",
                "url": f"https://www.virustotal.com/gui/file/{indicator}",
                "description": "File analysis and malware detection results"
            },
            {
                "name": "Hybrid Analysis",
                "url": f"https://www.hybrid-analysis.com/search?query={indicator}",
                "description": "Dynamic malware analysis and behavior reports"
            }
        ])
    
    return links

def generate_source_url(source, indicator):
    """Generate source URL based on the threat intelligence source"""
    source_urls = {
        'AlienVault OTX': f"https://otx.alienvault.com/indicator/ip/{indicator}",
        'ThreatFox': "https://threatfox.abuse.ch/",
        'MITRE ATT&CK': "https://attack.mitre.org/",
        'CISA KEV': "https://www.cisa.gov/known-exploited-vulnerabilities-catalog",
        'URLhaus': "https://urlhaus.abuse.ch/",
        'MalwareBazaar': "https://bazaar.abuse.ch/",
        'DShield': "https://isc.sans.edu/",
        'OpenPhish': "https://openphish.com/",
        'Blocklist.de': "https://www.blocklist.de/",
        'Feodo Tracker': "https://feodotracker.abuse.ch/"
    }
    
    return source_urls.get(source, None)

@app.route('/api/ioc/<path:indicator>', methods=['GET'])
def get_ioc_details(indicator):
    """Get detailed information for a specific IOC"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT indicator, type, threat_score, source, description, created_at, last_seen
        FROM iocs 
        WHERE indicator = ?
    ''', (indicator,))
    
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        return jsonify({"error": "IOC not found"}), 404
    
    ioc_data = {
        "indicator": row[0],
        "type": row[1],
        "threatScore": row[2],
        "source": row[3],
        "description": row[4],
        "createdAt": row[5],
        "firstSeen": row[5],
        "lastSeen": row[6] if row[6] else row[5],
        "tags": generate_tags_for_ioc(row[0], row[1], row[3]),
        "detailedDescription": generate_detailed_description(row[0], row[1], row[3]),
        "suggestedRemedies": generate_remediation_steps(row[0], row[1]),
        "technicalDetails": generate_technical_details(row[0], row[1]),
        "externalLinks": generate_external_links(row[0], row[1]),
        "sourceUrl": generate_source_url(row[3], row[0]),
        "sampleText": row[4]
    }
    
    return jsonify(ioc_data)

@app.route('/api/search', methods=['GET'])
def search_threats():
    """Search for threats with detailed information"""
    query = request.args.get('query', '')
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 50, type=int)
    
    if not query:
        return jsonify({
            "results": [],
            "pagination": {
                "page": page,
                "limit": limit,
                "total": 0,
                "totalPages": 0,
                "hasNextPage": False,
                "hasPrevPage": False
            }
        })
    
    offset = (page - 1) * limit
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Get total count for pagination
    count_query = '''
        SELECT COUNT(*) FROM iocs 
        WHERE indicator LIKE ? OR description LIKE ? OR source LIKE ?
    '''
    cursor.execute(count_query, (f'%{query}%', f'%{query}%', f'%{query}%'))
    total_count = cursor.fetchone()[0]
    
    # Get search results with pagination
    search_query = '''
        SELECT indicator, type, threat_score, source, description, created_at, last_seen
        FROM iocs 
        WHERE indicator LIKE ? OR description LIKE ? OR source LIKE ?
        ORDER BY threat_score DESC, created_at DESC
        LIMIT ? OFFSET ?
    '''
    
    cursor.execute(search_query, (f'%{query}%', f'%{query}%', f'%{query}%', limit, offset))
    
    results = []
    for row in cursor.fetchall():
        ioc_data = {
            "indicator": row[0],
            "type": row[1],
            "threatScore": row[2],
            "source": row[3],
            "description": row[4],
            "createdAt": row[5],
            "firstSeen": row[5],
            "lastSeen": row[6] if row[6] else row[5],
            "tags": generate_tags_for_ioc(row[0], row[1], row[3]),
            "detailedDescription": generate_detailed_description(row[0], row[1], row[3]),
            "suggestedRemedies": generate_remediation_steps(row[0], row[1]),
            "technicalDetails": generate_technical_details(row[0], row[1]),
            "externalLinks": generate_external_links(row[0], row[1]),
            "sourceUrl": generate_source_url(row[3], row[0]),
            "sampleText": row[4]
        }
        results.append(ioc_data)
    
    conn.close()
    
    total_pages = (total_count + limit - 1) // limit
    
    return jsonify({
        "results": results,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total_count,
            "totalPages": total_pages,
            "hasNextPage": page < total_pages,
            "hasPrevPage": page > 1
        }
    })

@app.route('/api/taxii-status', methods=['GET'])
def get_taxii_status():
    """Get comprehensive TAXII server status"""
    try:
        # Get status from comprehensive feed manager
        feed_status = feed_manager.get_feed_status()
        
        return jsonify({
            "connected": feed_status['connected'],
            "lastSync": feed_status['lastSync'],
            "totalFeeds": feed_status['totalFeeds'],
            "activeFeeds": feed_status['activeFeeds'],
            "feeds": feed_status['feeds']
        })
    except Exception as e:
        return jsonify({
            "connected": False,
            "error": str(e),
            "feeds": []
        })

@app.route('/api/feed-history', methods=['GET'])
def get_feed_history():
    """Get feed run history"""
    try:
        history = feed_manager.get_feed_run_history()
        return jsonify(history)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/manual-update', methods=['POST'])
def manual_update():
    """Manually trigger a comprehensive update"""
    try:
        print("Manual update triggered...")
        results = feed_manager.fetch_all_feeds()
        total_added = sum(results.values())
        
        return jsonify({
            "success": True,
            "message": f"Manual update completed: {total_added} indicators added",
            "sources": results,
            "total_count": total_added
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Manual update failed: {str(e)}"
        }), 500

@app.route('/api/taxii-fetch', methods=['POST'])
def fetch_taxii_data():
    """Fetch data from TAXII servers"""
    try:
        # Fetch from AlienVault
        alienvault_data = fetch_alienvault_data()
        if alienvault_data:
            store_iocs(alienvault_data, 'alienvault')
        
        # Fetch from ThreatFox
        threatfox_data = fetch_threatfox_data()
        if threatfox_data:
            store_iocs(threatfox_data, 'threatfox')
        
        total_fetched = len(alienvault_data) + len(threatfox_data)
        
        return jsonify({
            "success": True,
            "message": f"Successfully fetched {total_fetched} new indicators",
            "count": total_fetched,
            "duration": 2.5
        })
    
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error fetching data: {str(e)}"
        }), 500

@app.route('/api/refresh-data', methods=['POST'])
def refresh_data():
    """Force refresh of all threat intelligence data using comprehensive TAXII feeds"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Clear existing data to ensure fresh start
        cursor.execute('DELETE FROM iocs')
        cursor.execute('DELETE FROM sources')
        conn.commit()
        conn.close()
        
        print("Cleared existing data, fetching fresh threat intelligence from all sources...")
        
        # Use comprehensive TAXII feed manager
        results = feed_manager.fetch_all_feeds()
        
        total_fetched = sum(results.values())
        
        print(f"Comprehensive refresh completed: {total_fetched} indicators from {len(results)} sources")
        
        # Log detailed results
        for source, count in results.items():
            if count > 0:
                print(f"  {source}: {count} indicators")
        
        return jsonify({
            "success": True,
            "message": f"Successfully refreshed with {total_fetched} fresh indicators from {len(results)} sources",
            "sources": results,
            "total_count": total_fetched,
            "sources_used": list(results.keys())
        })
    
    except Exception as e:
        print(f"Error in comprehensive refresh: {e}")
        return jsonify({
            "success": False,
            "message": f"Error refreshing data: {str(e)}"
        }), 500

@app.route('/api/filter-options', methods=['GET'])
def get_filter_options():
    """Get available filter options for IOC explorer"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Get available types
    cursor.execute('SELECT DISTINCT type FROM iocs ORDER BY type')
    types = [{'value': row[0], 'label': row[0]} for row in cursor.fetchall()]
    types.insert(0, {'value': 'all', 'label': 'All Types'})
    
    # Get available sources
    cursor.execute('SELECT DISTINCT source FROM iocs ORDER BY source')
    sources = [{'value': row[0], 'label': row[0]} for row in cursor.fetchall()]
    sources.insert(0, {'value': 'all', 'label': 'All Sources'})
    
    conn.close()
    
    return jsonify({
        "types": types,
        "sources": sources,
        "timeRanges": [
            {'value': 'all', 'label': 'All Time'},
            {'value': '24h', 'label': 'Last 24 Hours'},
            {'value': '7d', 'label': 'Last 7 Days'},
            {'value': '30d', 'label': 'Last 30 Days'},
            {'value': '90d', 'label': 'Last 90 Days'}
        ]
    })

@app.route('/api/ioc-stats', methods=['GET'])
def get_ioc_stats():
    """Get IOC statistics for the explorer"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Get total count
    cursor.execute('SELECT COUNT(*) FROM iocs')
    total_count = cursor.fetchone()[0]
    
    # Get type distribution
    cursor.execute('SELECT type, COUNT(*) as count FROM iocs GROUP BY type ORDER BY count DESC')
    type_distribution = [{'type': row[0], 'count': row[1]} for row in cursor.fetchall()]
    
    # Get source distribution
    cursor.execute('SELECT source, COUNT(*) as count FROM iocs GROUP BY source ORDER BY count DESC')
    source_distribution = [{'source': row[0], 'count': row[1]} for row in cursor.fetchall()]
    
    # Get recent activity (last 7 days)
    week_ago = (datetime.now() - timedelta(days=7)).isoformat()
    cursor.execute('SELECT COUNT(*) FROM iocs WHERE created_at > ?', (week_ago,))
    recent_count = cursor.fetchone()[0]
    
    conn.close()
    
    return jsonify({
        "totalCount": total_count,
        "recentCount": recent_count,
        "typeDistribution": type_distribution,
        "sourceDistribution": source_distribution
    })

if __name__ == '__main__':
    init_db()
    
    # Fetch initial data if database is empty
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('SELECT COUNT(*) FROM iocs')
    count = cursor.fetchone()[0]
    conn.close()
    
    if count == 0:
        print("Database is empty, fetching initial data...")
        alienvault_data = fetch_alienvault_data()
        if alienvault_data:
            store_iocs(alienvault_data, 'alienvault')
        
        threatfox_data = fetch_threatfox_data()
        if threatfox_data:
            store_iocs(threatfox_data, 'threatfox')
        
        print(f"Loaded {len(alienvault_data) + len(threatfox_data)} initial IOCs")
    
    start_scheduler()
    app.run(host='0.0.0.0', port=5000, debug=True) 