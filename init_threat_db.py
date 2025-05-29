#!/usr/bin/env python3
"""
Initialize the threat intelligence database with proper structure and sample data.
"""

import sqlite3
import json
from datetime import datetime, timedelta

DB_PATH = "threat_intel.db"

def init_database():
    """Initialize the database with required tables and sample data"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Drop existing tables if they exist
    cursor.execute('DROP TABLE IF EXISTS iocs')
    cursor.execute('DROP TABLE IF EXISTS sources')
    cursor.execute('DROP TABLE IF EXISTS feed_run')
    
    # Create IOCs table
    cursor.execute('''
        CREATE TABLE iocs (
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
        CREATE TABLE sources (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE,
            last_updated TIMESTAMP,
            status TEXT DEFAULT 'active'
        )
    ''')
    
    # Create feed_run table for tracking data fetches
    cursor.execute('''
        CREATE TABLE feed_run (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            start_time TIMESTAMP,
            end_time TIMESTAMP,
            status TEXT,
            items_added INTEGER DEFAULT 0,
            items_updated INTEGER DEFAULT 0,
            error_message TEXT
        )
    ''')
    
    # Insert sample realistic threat data
    sample_iocs = [
        # Malicious IPs
        ("185.176.43.94", "ip", 8.7, "AlienVault OTX", "Command and Control server for LockBit ransomware campaign"),
        ("23.32.246.157", "ip", 7.9, "AbuseIPDB", "IP associated with brute forcing SSH credentials across multiple targets"),
        ("91.240.118.172", "ip", 9.2, "MISP", "Cobalt Strike beacon infrastructure used by APT29"),
        ("45.142.213.33", "ip", 8.1, "ThreatFox", "Emotet banking trojan C2 server"),
        ("194.147.78.12", "ip", 7.5, "VirusTotal", "Scanning and exploitation attempts against web applications"),
        
        # Malicious domains
        ("cdn-delivery-system.net", "domain", 9.4, "MITRE ATT&CK", "Domain used in targeted phishing campaigns by APT29"),
        ("login-secure-verification.cc", "domain", 9.7, "CIRCL", "Domain hosting phishing pages impersonating banking institutions"),
        ("invoice-secure-download.biz", "domain", 8.8, "PhishTank", "Fake invoice delivery system hosting malware"),
        ("financial-report-2024.xyz", "domain", 8.5, "URLhaus", "Domain distributing malicious Office documents"),
        ("secure-banking-portal.org", "domain", 9.1, "MISP", "Phishing domain targeting financial institutions"),
        
        # File hashes
        ("49f9b5d516a2eae3a801366b0cc1b3b1f88be38c22e546f34972207cd9e618ae", "hash", 8.9, "VirusTotal", "BlackCat/ALPHV ransomware payload with data exfiltration capabilities"),
        ("95e8942abe27169dd3f949c523cc6d977dd3d79620068e32e971989c7c2b7f92", "hash", 8.8, "MalwareBazaar", "RedLine Stealer malware targeting credentials and cryptocurrency wallets"),
        ("a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456", "hash", 7.6, "ThreatFox", "Qakbot banking trojan variant with anti-analysis features"),
        ("deadbeef1234567890abcdef1234567890abcdef1234567890abcdef12345678", "hash", 9.3, "MISP", "Conti ransomware encryptor with network propagation capabilities"),
        
        # URLs
        ("http://invoice-secure-download.biz/document.php", "url", 9.6, "MISP", "URL hosting fake invoice documents containing Emotet banking trojan"),
        ("http://financial-report-2024.xyz/download.html", "url", 8.5, "URLhaus", "URL distributing malicious Office documents exploiting CVE-2023-21823"),
        ("https://secure-login-verification.net/auth", "url", 9.0, "PhishTank", "Phishing URL impersonating Microsoft Office 365 login"),
        ("http://cdn-updates.org/flash-update.exe", "url", 8.3, "VirusTotal", "Fake Flash update delivering AsyncRAT malware"),
        
        # Email addresses
        ("finance-director@compromised-org.com", "email", 8.3, "PhishTank", "Email address used in business email compromise (BEC) attacks"),
        ("accounts-department@exfiltration.xyz", "email", 7.8, "ThreatFox", "Email address used in targeted campaigns delivering Qakbot malware"),
        ("security-alert@phishing-domain.net", "email", 8.6, "MISP", "Spoofed security alert emails delivering credential harvesting pages"),
        ("no-reply@fake-bank-alerts.com", "email", 9.2, "CIRCL", "Email address used in banking trojan distribution campaigns")
    ]
    
    # Insert sample data with timestamps
    base_time = datetime.utcnow()
    for i, (indicator, ioc_type, score, source, description) in enumerate(sample_iocs):
        # Vary the timestamps to simulate data collected over time
        created_time = base_time - timedelta(days=i % 30, hours=i % 24)
        last_seen_time = base_time - timedelta(hours=i % 48)
        
        cursor.execute('''
            INSERT INTO iocs (indicator, type, threat_score, source, description, created_at, last_seen)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (indicator, ioc_type, score, source, description, created_time.isoformat(), last_seen_time.isoformat()))
    
    # Insert sample sources
    sources = [
        ("AlienVault OTX", datetime.utcnow().isoformat(), "active"),
        ("MISP", datetime.utcnow().isoformat(), "active"),
        ("VirusTotal", datetime.utcnow().isoformat(), "active"),
        ("ThreatFox", datetime.utcnow().isoformat(), "active"),
        ("AbuseIPDB", datetime.utcnow().isoformat(), "active"),
        ("PhishTank", datetime.utcnow().isoformat(), "active"),
        ("URLhaus", datetime.utcnow().isoformat(), "active"),
        ("MalwareBazaar", datetime.utcnow().isoformat(), "active"),
        ("CIRCL", datetime.utcnow().isoformat(), "active"),
        ("MITRE ATT&CK", datetime.utcnow().isoformat(), "active")
    ]
    
    for name, last_updated, status in sources:
        cursor.execute('''
            INSERT OR REPLACE INTO sources (name, last_updated, status)
            VALUES (?, ?, ?)
        ''', (name, last_updated, status))
    
    # Insert a sample feed run
    cursor.execute('''
        INSERT INTO feed_run (start_time, end_time, status, items_added, items_updated)
        VALUES (?, ?, ?, ?, ?)
    ''', (
        (datetime.utcnow() - timedelta(hours=2)).isoformat(),
        (datetime.utcnow() - timedelta(hours=2, minutes=5)).isoformat(),
        "success",
        len(sample_iocs),
        0
    ))
    
    conn.commit()
    conn.close()
    
    print(f"Database initialized successfully with {len(sample_iocs)} sample IOCs")
    print("Tables created: iocs, sources, feed_run")

if __name__ == "__main__":
    init_database() 