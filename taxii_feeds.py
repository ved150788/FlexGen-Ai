#!/usr/bin/env python3
"""
Real TAXII Feeds Manager - connects to actual TAXII servers for threat intelligence.
No dummy data - only real threat intelligence from legitimate sources.
"""

import sqlite3
import logging
import requests
import json
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import os

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TaxiiFeedManager:
    """Manager for real TAXII threat intelligence feeds"""
    
    def __init__(self):
        self.db_path = "threat_intel.db"
        self.init_database()
        
        # Real TAXII feed configurations
        self.feeds = {
            'mitre_attack': {
                'name': 'MITRE ATT&CK',
                'description': 'Adversarial Tactics, Techniques, and Common Knowledge framework',
                'url': 'https://cti-taxii.mitre.org/taxii/',
                'collection_id': '95ecc380-afe9-11e4-9b6c-751b66dd541e',
                'api_root': 'https://cti-taxii.mitre.org/taxii/collections/',
                'format': 'STIX 2.1 via TAXII',
                'requires_auth': False,
                'active': True
            },
            'cisa_kev': {
                'name': 'CISA Known Exploited Vulnerabilities',
                'description': 'Known exploited vulnerabilities catalog maintained by CISA',
                'url': 'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json',
                'format': 'JSON Feed',
                'requires_auth': False,
                'active': True
            },
            'urlhaus': {
                'name': 'URLhaus by abuse.ch',
                'description': 'Malware URLs and payloads from URLhaus project',
                'url': 'https://urlhaus-api.abuse.ch/v1/urls/recent/',
                'format': 'JSON API',
                'requires_auth': False,
                'active': True
            },
            'malware_bazaar': {
                'name': 'MalwareBazaar by abuse.ch',
                'description': 'Malware samples and file hashes from MalwareBazaar',
                'url': 'https://mb-api.abuse.ch/api/v1/',
                'format': 'JSON API',
                'requires_auth': False,
                'active': True
            },
            'threatfox': {
                'name': 'ThreatFox by abuse.ch',
                'description': 'Indicators of Compromise (IOCs) from ThreatFox',
                'url': 'https://threatfox-api.abuse.ch/api/v1/',
                'format': 'JSON API',
                'requires_auth': False,
                'active': True
            },
            'dshield': {
                'name': 'DShield by SANS',
                'description': 'Top attacking IP addresses from DShield honeypots',
                'url': 'https://isc.sans.edu/api/sources/attacks/20/json',
                'format': 'JSON API',
                'requires_auth': False,
                'active': True
            },
            'openphish': {
                'name': 'OpenPhish',
                'description': 'Phishing URLs from OpenPhish community feed',
                'url': 'https://openphish.com/feed.txt',
                'format': 'Text Feed',
                'requires_auth': False,
                'active': True
            },
            'blocklist_de': {
                'name': 'Blocklist.de',
                'description': 'Malicious IP addresses from Blocklist.de',
                'url': 'https://lists.blocklist.de/lists/ssh.txt',
                'format': 'Text Feed',
                'requires_auth': False,
                'active': True
            },
            'feodo_tracker': {
                'name': 'Feodo Tracker by abuse.ch',
                'description': 'Botnet C&C servers from Feodo Tracker',
                'url': 'https://feodotracker.abuse.ch/downloads/ipblocklist.txt',
                'format': 'Text Feed',
                'requires_auth': False,
                'active': True
            }
        }

    def init_database(self):
        """Initialize the database with required tables"""
        conn = sqlite3.connect(self.db_path)
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
        
        conn.commit()
        conn.close()

    def get_db_connection(self):
        """Get a connection to the SQLite database"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def fetch_mitre_attack_data(self) -> List[Dict]:
        """Fetch real MITRE ATT&CK data from official TAXII server"""
        try:
            logger.info("Fetching MITRE ATT&CK data from official TAXII server...")
            
            # MITRE ATT&CK TAXII 2.1 endpoint
            url = "https://cti-taxii.mitre.org/stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/objects/"
            
            headers = {
                'Accept': 'application/taxii+json;version=2.1',
                'User-Agent': 'ThreatIntelligencePlatform/1.0'
            }
            
            response = requests.get(url, headers=headers, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            indicators = []
            
            if 'objects' in data:
                for obj in data['objects']:
                    if obj.get('type') == 'attack-pattern':
                        # Extract technique ID from external references
                        technique_id = None
                        for ref in obj.get('external_references', []):
                            if ref.get('source_name') == 'mitre-attack':
                                technique_id = ref.get('external_id')
                                break
                        
                        if technique_id:
                            indicators.append({
                                'indicator': technique_id,
                                'type': 'technique',
                                'threat_score': 7.0,
                                'source': 'MITRE ATT&CK',
                                'description': obj.get('description', '')[:500],
                                'name': obj.get('name', ''),
                                'kill_chain_phases': [phase.get('phase_name') for phase in obj.get('kill_chain_phases', [])]
                            })
                
                logger.info(f"Fetched {len(indicators)} MITRE ATT&CK techniques")
                return indicators[:50]  # Limit to 50 for performance
                
        except Exception as e:
            logger.error(f"Error fetching MITRE ATT&CK data: {e}")
        
        return []

    def fetch_cisa_kev_data(self) -> List[Dict]:
        """Fetch CISA Known Exploited Vulnerabilities"""
        try:
            logger.info("Fetching CISA Known Exploited Vulnerabilities...")
            
            url = "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json"
            
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            indicators = []
            
            if 'vulnerabilities' in data:
                # Get recent vulnerabilities (last 30 days)
                recent_date = datetime.now() - timedelta(days=30)
                
                for vuln in data['vulnerabilities']:
                    date_added = datetime.strptime(vuln.get('dateAdded', '2020-01-01'), '%Y-%m-%d')
                    
                    if date_added >= recent_date:
                        indicators.append({
                            'indicator': vuln.get('cveID', ''),
                            'type': 'vulnerability',
                            'threat_score': 8.5,  # High score for known exploited vulns
                            'source': 'CISA Known Exploited Vulnerabilities',
                            'description': f"{vuln.get('vulnerabilityName', '')} - {vuln.get('shortDescription', '')}"[:500]
                        })
                
                logger.info(f"Fetched {len(indicators)} recent CISA KEV entries")
                return indicators[:20]  # Limit to 20 most recent
                
        except Exception as e:
            logger.error(f"Error fetching CISA KEV data: {e}")
        
        return []

    def fetch_urlhaus_data(self) -> List[Dict]:
        """Fetch recent malware URLs from URLhaus"""
        try:
            logger.info("Fetching URLhaus malware URLs...")
            
            url = "https://urlhaus-api.abuse.ch/v1/payloads/recent/"
            
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            indicators = []
            
            if data.get('query_status') == 'ok' and 'payloads' in data:
                for payload in data['payloads'][:10]:  # Limit to 10 recent
                    indicators.append({
                        'indicator': payload.get('sha256_hash', ''),
                        'type': 'hash',
                        'threat_score': 8.0,
                        'source': 'URLhaus by abuse.ch',
                        'description': f"Malware payload: {payload.get('file_type', 'unknown')} - {payload.get('signature', 'unknown')}"
                    })
                
                logger.info(f"Fetched {len(indicators)} URLhaus indicators")
                return indicators
                
        except Exception as e:
            logger.error(f"Error fetching URLhaus data: {e}")
        
        return []

    def fetch_malware_bazaar_data(self) -> List[Dict]:
        """Fetch recent malware samples from MalwareBazaar"""
        try:
            logger.info("Fetching MalwareBazaar samples...")
            
            url = "https://mb-api.abuse.ch/api/v1/"
            
            # Request recent samples
            payload = {
                'query': 'get_recent',
                'selector': '100'  # Last 100 samples
            }
            
            response = requests.post(url, data=payload, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            indicators = []
            
            if data.get('query_status') == 'ok' and 'data' in data:
                for sample in data['data'][:10]:  # Limit to 10 recent
                    indicators.append({
                        'indicator': sample.get('sha256_hash', ''),
                        'type': 'hash',
                        'threat_score': 8.5,
                        'source': 'MalwareBazaar by abuse.ch',
                        'description': f"Malware: {sample.get('file_name', 'unknown')} - {sample.get('signature', 'unknown')}"
                    })
                
                logger.info(f"Fetched {len(indicators)} MalwareBazaar indicators")
                return indicators
                
        except Exception as e:
            logger.error(f"Error fetching MalwareBazaar data: {e}")
        
        return []

    def fetch_threatfox_data(self) -> List[Dict]:
        """Fetch IOCs from ThreatFox"""
        try:
            logger.info("Fetching ThreatFox IOCs...")
            
            url = "https://threatfox-api.abuse.ch/api/v1/"
            
            # Request recent IOCs
            payload = {
                'query': 'get_iocs',
                'days': '3'  # Last 3 days
            }
            
            response = requests.post(url, data=payload, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            indicators = []
            
            if data.get('query_status') == 'ok' and 'data' in data:
                for ioc in data['data'][:15]:  # Limit to 15 recent
                    ioc_type = ioc.get('ioc_type', 'unknown')
                    
                    # Map ThreatFox types to our types
                    type_mapping = {
                        'domain': 'domain',
                        'url': 'url',
                        'ip:port': 'ip',
                        'md5_hash': 'hash',
                        'sha1_hash': 'hash',
                        'sha256_hash': 'hash'
                    }
                    
                    mapped_type = type_mapping.get(ioc_type, 'unknown')
                    
                    if mapped_type != 'unknown':
                        indicators.append({
                            'indicator': ioc.get('ioc', ''),
                            'type': mapped_type,
                            'threat_score': 7.5,
                            'source': 'ThreatFox by abuse.ch',
                            'description': f"{ioc.get('malware', 'unknown')} - {ioc.get('threat_type', 'unknown')}"
                        })
                
                logger.info(f"Fetched {len(indicators)} ThreatFox indicators")
                return indicators
                
        except Exception as e:
            logger.error(f"Error fetching ThreatFox data: {e}")
        
        return []

    def fetch_dshield_data(self) -> List[Dict]:
        """Fetch DShield Top 20 attacking IPs"""
        try:
            logger.info("Fetching DShield Top 20 attacking IPs...")
            
            url = "https://isc.sans.edu/api/sources/attacks/20/json"
            
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            indicators = []
            
            if 'sources' in data:
                for source in data['sources'][:20]:  # Top 20
                    ip = source.get('ipv4', '')
                    if ip and ip != '0.0.0.0':
                        indicators.append({
                            'indicator': ip,
                            'type': 'ip',
                            'threat_score': 8.0,
                            'source': 'DShield by SANS',
                            'description': f"Top attacking IP - {source.get('attacks', 0)} attacks, {source.get('targets', 0)} targets"
                        })
                
                logger.info(f"Fetched {len(indicators)} DShield indicators")
                return indicators
                
        except Exception as e:
            logger.error(f"Error fetching DShield data: {e}")
        
        return []

    def fetch_openphish_data(self) -> List[Dict]:
        """Fetch OpenPhish phishing URLs"""
        try:
            logger.info("Fetching OpenPhish phishing URLs...")
            
            url = "https://openphish.com/feed.txt"
            
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            
            indicators = []
            urls = response.text.strip().split('\n')
            
            for url_line in urls[:20]:  # Limit to 20 recent
                url_line = url_line.strip()
                if url_line and url_line.startswith('http'):
                    indicators.append({
                        'indicator': url_line,
                        'type': 'url',
                        'threat_score': 8.5,
                        'source': 'OpenPhish',
                        'description': 'Phishing URL detected by OpenPhish'
                    })
            
            logger.info(f"Fetched {len(indicators)} OpenPhish indicators")
            return indicators
                
        except Exception as e:
            logger.error(f"Error fetching OpenPhish data: {e}")
        
        return []

    def fetch_blocklist_de_data(self) -> List[Dict]:
        """Fetch blocklist.de attacking IPs"""
        try:
            logger.info("Fetching blocklist.de attacking IPs...")
            
            # Get SSH attackers
            url = "https://lists.blocklist.de/lists/ssh.txt"
            
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            
            indicators = []
            ips = response.text.strip().split('\n')
            
            for ip in ips[:15]:  # Limit to 15 recent
                ip = ip.strip()
                if ip and not ip.startswith('#'):
                    indicators.append({
                        'indicator': ip,
                        'type': 'ip',
                        'threat_score': 7.0,
                        'source': 'Blocklist.de',
                        'description': 'IP reported for SSH attacks'
                    })
            
            logger.info(f"Fetched {len(indicators)} Blocklist.de indicators")
            return indicators
                
        except Exception as e:
            logger.error(f"Error fetching Blocklist.de data: {e}")
        
        return []

    def fetch_feodo_tracker_data(self) -> List[Dict]:
        """Fetch Feodo Tracker botnet C&C IPs"""
        try:
            logger.info("Fetching Feodo Tracker botnet C&C IPs...")
            
            url = "https://feodotracker.abuse.ch/downloads/ipblocklist.txt"
            
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            
            indicators = []
            lines = response.text.strip().split('\n')
            
            for line in lines[:20]:  # Limit to 20 recent
                line = line.strip()
                if line and not line.startswith('#') and '.' in line:
                    indicators.append({
                        'indicator': line,
                        'type': 'ip',
                        'threat_score': 9.0,  # High score for botnet C&C
                        'source': 'Feodo Tracker by abuse.ch',
                        'description': 'Botnet command and control server'
                    })
            
            logger.info(f"Fetched {len(indicators)} Feodo Tracker indicators")
            return indicators
                
        except Exception as e:
            logger.error(f"Error fetching Feodo Tracker data: {e}")
        
        return []

    def store_indicators(self, indicators: List[Dict], source: str):
        """Store indicators in the database"""
        if not indicators:
            return 0
        
        conn = self.get_db_connection()
        cursor = conn.cursor()
        
        stored_count = 0
        for indicator in indicators:
            try:
                cursor.execute('''
                    INSERT OR REPLACE INTO iocs 
                    (indicator, type, threat_score, source, description, created_at, last_seen)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ''', (
                    indicator['indicator'],
                    indicator['type'],
                    indicator.get('threat_score', 5.0),
                    source,
                    indicator.get('description', ''),
                    datetime.utcnow().isoformat(),
                    datetime.utcnow().isoformat()
                ))
                stored_count += 1
            except Exception as e:
                logger.error(f"Error storing indicator {indicator.get('indicator', 'unknown')}: {e}")
        
        conn.commit()
        conn.close()
        
        logger.info(f"Stored {stored_count} indicators from {source}")
        return stored_count

    def fetch_all_feeds(self) -> Dict[str, int]:
        """Fetch data from all active real feeds"""
        results = {}
        
        # Clear existing dummy data first
        self.clear_dummy_data()
        
        # Fetch from real feeds only
        feed_functions = {
            'MITRE ATT&CK': self.fetch_mitre_attack_data,
            'CISA Known Exploited Vulnerabilities': self.fetch_cisa_kev_data,
            'URLhaus by abuse.ch': self.fetch_urlhaus_data,
            'MalwareBazaar by abuse.ch': self.fetch_malware_bazaar_data,
            'ThreatFox by abuse.ch': self.fetch_threatfox_data,
            'DShield by SANS': self.fetch_dshield_data,
            'OpenPhish': self.fetch_openphish_data,
            'Blocklist.de': self.fetch_blocklist_de_data,
            'Feodo Tracker by abuse.ch': self.fetch_feodo_tracker_data
        }
        
        for source_name, fetch_func in feed_functions.items():
            try:
                logger.info(f"Fetching data from {source_name}...")
                
                # Record feed run start
                run_id = self.start_feed_run(source_name)
                
                indicators = fetch_func()
                stored_count = self.store_indicators(indicators, source_name)
                results[source_name] = stored_count
                
                # Record feed run completion
                self.complete_feed_run(run_id, stored_count)
                
            except Exception as e:
                logger.error(f"Error fetching from {source_name}: {e}")
                results[source_name] = 0
                if 'run_id' in locals():
                    self.complete_feed_run(run_id, 0, str(e))
        
        # Update feed status in sources table
        self.update_feed_status(results)
        
        return results

    def clear_dummy_data(self):
        """Remove all dummy/demo data from database"""
        dummy_sources = [
            'Anomali Limo',
            'MISP Community', 
            'Hail a TAXII Demo',
            'EclecticIQ Demo'
        ]
        
        conn = self.get_db_connection()
        cursor = conn.cursor()
        
        for source in dummy_sources:
            cursor.execute('DELETE FROM iocs WHERE source = ?', (source,))
            deleted = cursor.rowcount
            if deleted > 0:
                logger.info(f"Removed {deleted} dummy indicators from {source}")
        
        conn.commit()
        conn.close()

    def start_feed_run(self, source: str) -> int:
        """Record the start of a feed run"""
        conn = self.get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO feed_run (source, start_time, status)
            VALUES (?, ?, 'running')
        ''', (source, datetime.utcnow().isoformat()))
        
        run_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return run_id

    def complete_feed_run(self, run_id: int, indicators_added: int, error_message: str = None):
        """Record the completion of a feed run"""
        conn = self.get_db_connection()
        cursor = conn.cursor()
        
        status = 'error' if error_message else 'success'
        
        cursor.execute('''
            UPDATE feed_run 
            SET end_time = ?, status = ?, indicators_added = ?, error_message = ?
            WHERE id = ?
        ''', (
            datetime.utcnow().isoformat(),
            status,
            indicators_added,
            error_message,
            run_id
        ))
        
        conn.commit()
        conn.close()

    def update_feed_status(self, results: Dict[str, int]):
        """Update the status of feeds in the sources table"""
        conn = self.get_db_connection()
        cursor = conn.cursor()
        
        for source, count in results.items():
            cursor.execute('''
                INSERT OR REPLACE INTO sources (name, last_updated, status)
                VALUES (?, ?, ?)
            ''', (source, datetime.utcnow().isoformat(), 'active'))
        
        conn.commit()
        conn.close()

    def get_feed_status(self) -> Dict:
        """Get the status of all feeds"""
        conn = self.get_db_connection()
        cursor = conn.cursor()
        
        # Get feed information
        feeds = []
        for feed_key, feed_config in self.feeds.items():
            cursor.execute('''
                SELECT COUNT(*) FROM iocs WHERE source = ?
            ''', (feed_config['name'],))
            
            count = cursor.fetchone()[0]
            
            cursor.execute('''
                SELECT last_updated FROM sources WHERE name = ?
            ''', (feed_config['name'],))
            
            last_updated_row = cursor.fetchone()
            last_updated = last_updated_row[0] if last_updated_row else None
            
            feeds.append({
                'name': feed_config['name'],
                'description': feed_config['description'],
                'status': 'active' if feed_config['active'] else 'inactive',
                'indicators_count': count,
                'last_updated': last_updated,
                'format': feed_config['format'],
                'version': '2.1' if 'TAXII' in feed_config['format'] else '1.0',
                'auth_required': feed_config['requires_auth'],
                'url': feed_config['url']
            })
        
        # Get overall status
        cursor.execute('SELECT COUNT(*) FROM iocs')
        total_indicators = cursor.fetchone()[0]
        
        cursor.execute('''
            SELECT MAX(last_updated) FROM sources
        ''')
        last_sync_row = cursor.fetchone()
        last_sync = last_sync_row[0] if last_sync_row else None
        
        conn.close()
        
        return {
            'connected': total_indicators > 0,
            'lastSync': last_sync,
            'totalFeeds': len(self.feeds),
            'activeFeeds': len([f for f in self.feeds.values() if f['active']]),
            'feeds': feeds
        }

    def get_feed_run_history(self) -> List[Dict]:
        """Get the history of feed runs"""
        conn = self.get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT source, start_time, end_time, status, indicators_added, error_message
            FROM feed_run
            ORDER BY start_time DESC
            LIMIT 50
        ''')
        
        history = []
        for row in cursor.fetchall():
            history.append({
                'source': row['source'],
                'start_time': row['start_time'],
                'end_time': row['end_time'],
                'status': row['status'],
                'indicators_added': row['indicators_added'],
                'error_message': row['error_message']
            })
        
        conn.close()
        return history

    def check_database(self):
        """Check and display current database status"""
        conn = self.get_db_connection()
        cursor = conn.cursor()
        
        # Get source distribution
        cursor.execute('SELECT source, COUNT(*) FROM iocs GROUP BY source ORDER BY COUNT(*) DESC')
        rows = cursor.fetchall()
        
        print('Current sources:')
        for row in rows:
            print(f'  {row[0]}: {row[1]}')
        
        # Get total count
        cursor.execute('SELECT COUNT(*) FROM iocs')
        total = cursor.fetchone()[0]
        print(f'Total: {total}')
        
        conn.close()

# Create global instance
taxii_manager = TaxiiFeedManager()

def main():
    """Main function for testing"""
    logger.info("Testing real TAXII feeds...")
    
    # Fetch all feeds
    results = taxii_manager.fetch_all_feeds()
    
    print("\nFeed Results:")
    total_added = 0
    for source, count in results.items():
        print(f"  {source}: {count} indicators")
        total_added += count
    
    print(f"\nTotal indicators added: {total_added}")
    
    # Get status
    status = taxii_manager.get_feed_status()
    print(f"\nFeed Status:")
    print(f"  Connected: {status['connected']}")
    print(f"  Total Feeds: {status['totalFeeds']}")
    print(f"  Active Feeds: {status['activeFeeds']}")
    print(f"  Last Sync: {status['lastSync']}")

if __name__ == "__main__":
    main() 