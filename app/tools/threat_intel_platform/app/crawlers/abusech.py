"""
Abuse.ch crawler module
"""

import requests
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
import re

from app.tools.threat_intel_platform.app.crawlers.base import BaseCrawler
from app.tools.threat_intel_platform.app.utils.ioc_extractor import extract_and_normalize

logger = logging.getLogger(__name__)

class AbusechCrawler(BaseCrawler):
    """
    Crawler for Abuse.ch feeds
    
    This crawler fetches data from various Abuse.ch feeds:
    - URLhaus (malicious URLs)
    - MalwareBazaar (malware samples)
    - FeodoTracker (C&C servers)
    - SSL Blacklist
    """
    
    NAME = "abusech"
    DISPLAY_NAME = "Abuse.ch"
    DESCRIPTION = "Crawler for various Abuse.ch threat intelligence feeds"
    DEFAULT_FREQUENCY = "0 */6 * * *"  # Every 6 hours
    
    # API endpoints
    URLHAUS_URL = "https://urlhaus.abuse.ch/downloads/csv_recent/"
    FEODOTRACKER_URL = "https://feodotracker.abuse.ch/downloads/ipblocklist.csv"
    SSLBL_URL = "https://sslbl.abuse.ch/blacklist/sslblacklist.csv"
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """Initialize the Abuse.ch crawler"""
        super().__init__(config)
        
    def fetch_urlhaus(self) -> List[Dict[str, Any]]:
        """
        Fetch recent malicious URLs from URLhaus
        
        Returns:
            List of dictionaries with URL data
        """
        try:
            response = requests.get(self.URLHAUS_URL, timeout=30)
            
            if response.status_code != 200:
                logger.error(f"Failed to fetch URLhaus data: {response.status_code}")
                return []
            
            # Parse CSV data (skipping comment lines starting with #)
            lines = response.text.split('\n')
            data_lines = [line for line in lines if not line.startswith('#') and line.strip()]
            
            results = []
            for line in data_lines:
                try:
                    # Parse CSV line
                    parts = line.split(',')
                    if len(parts) < 7:
                        continue
                    
                    # Clean URL (remove quotes)
                    url = parts[2].strip('"')
                    
                    # Extract domain from URL
                    domain_match = re.search(r'https?://([^/]+)', url)
                    domain = domain_match.group(1) if domain_match else None
                    
                    results.append({
                        'date_added': parts[0],
                        'url': url,
                        'domain': domain,
                        'status': parts[3],
                        'threat_type': parts[4],
                        'tags': parts[5].split(','),
                        'urlhaus_link': parts[6]
                    })
                except Exception as e:
                    logger.warning(f"Error parsing URLhaus entry: {str(e)}")
                    continue
            
            return results
            
        except Exception as e:
            logger.error(f"Error fetching URLhaus data: {str(e)}")
            return []
    
    def fetch_feodotracker(self) -> List[Dict[str, Any]]:
        """
        Fetch C&C servers from FeodoTracker
        
        Returns:
            List of dictionaries with C&C server data
        """
        try:
            response = requests.get(self.FEODOTRACKER_URL, timeout=30)
            
            if response.status_code != 200:
                logger.error(f"Failed to fetch FeodoTracker data: {response.status_code}")
                return []
            
            # Parse CSV data (skipping comment lines starting with #)
            lines = response.text.split('\n')
            data_lines = [line for line in lines if not line.startswith('#') and line.strip()]
            
            results = []
            for line in data_lines:
                try:
                    # Parse CSV line
                    parts = line.split(',')
                    if len(parts) < 3:
                        continue
                    
                    results.append({
                        'ip_address': parts[0],
                        'port': parts[1],
                        'malware_family': parts[2],
                        'first_seen': parts[3] if len(parts) > 3 else None
                    })
                except Exception as e:
                    logger.warning(f"Error parsing FeodoTracker entry: {str(e)}")
                    continue
            
            return results
            
        except Exception as e:
            logger.error(f"Error fetching FeodoTracker data: {str(e)}")
            return []
    
    def fetch_sslbl(self) -> List[Dict[str, Any]]:
        """
        Fetch SSL certificates from SSL Blacklist
        
        Returns:
            List of dictionaries with SSL certificate data
        """
        try:
            response = requests.get(self.SSLBL_URL, timeout=30)
            
            if response.status_code != 200:
                logger.error(f"Failed to fetch SSL Blacklist data: {response.status_code}")
                return []
            
            # Parse CSV data (skipping comment lines starting with #)
            lines = response.text.split('\n')
            data_lines = [line for line in lines if not line.startswith('#') and line.strip()]
            
            results = []
            for line in data_lines:
                try:
                    # Parse CSV line
                    parts = line.split(',')
                    if len(parts) < 2:
                        continue
                    
                    results.append({
                        'timestamp': parts[0],
                        'ssl_fingerprint': parts[1],
                        'malware_family': parts[2] if len(parts) > 2 else None
                    })
                except Exception as e:
                    logger.warning(f"Error parsing SSL Blacklist entry: {str(e)}")
                    continue
            
            return results
            
        except Exception as e:
            logger.error(f"Error fetching SSL Blacklist data: {str(e)}")
            return []
    
    def process_urlhaus_data(self, urlhaus_data: List[Dict[str, Any]]) -> int:
        """
        Process URLhaus data and add to database
        
        Args:
            urlhaus_data: List of dictionaries with URLhaus data
            
        Returns:
            Number of IOCs added
        """
        processed_count = 0
        
        for entry in urlhaus_data:
            try:
                # Add URL IOC
                if entry.get('url'):
                    self.add_ioc(
                        ioc_type='url',
                        ioc_value=entry['url'],
                        source_url=entry.get('urlhaus_link', 'https://urlhaus.abuse.ch/'),
                        confidence=0.8,
                        tags=['abuse.ch', 'urlhaus'] + entry.get('tags', []),
                        context=f"Malicious URL - {entry.get('threat_type', 'unknown')}",
                        metadata={
                            'date_added': entry.get('date_added'),
                            'status': entry.get('status'),
                            'threat_type': entry.get('threat_type')
                        }
                    )
                    processed_count += 1
                
                # Add domain IOC if available
                if entry.get('domain'):
                    self.add_ioc(
                        ioc_type='domain',
                        ioc_value=entry['domain'],
                        source_url=entry.get('urlhaus_link', 'https://urlhaus.abuse.ch/'),
                        confidence=0.7,  # Slightly lower confidence for domain
                        tags=['abuse.ch', 'urlhaus'] + entry.get('tags', []),
                        context=f"Domain hosting malicious URL - {entry.get('threat_type', 'unknown')}",
                        metadata={
                            'date_added': entry.get('date_added'),
                            'status': entry.get('status'),
                            'threat_type': entry.get('threat_type'),
                            'associated_url': entry.get('url')
                        }
                    )
                    processed_count += 1
                
                # Commit in batches
                if processed_count % 50 == 0:
                    self.commit_batch()
                    
            except Exception as e:
                logger.warning(f"Error processing URLhaus entry: {str(e)}")
                continue
        
        return processed_count
    
    def process_feodotracker_data(self, feodotracker_data: List[Dict[str, Any]]) -> int:
        """
        Process FeodoTracker data and add to database
        
        Args:
            feodotracker_data: List of dictionaries with FeodoTracker data
            
        Returns:
            Number of IOCs added
        """
        processed_count = 0
        
        for entry in feodotracker_data:
            try:
                # Add IP IOC
                if entry.get('ip_address'):
                    self.add_ioc(
                        ioc_type='ip',
                        ioc_value=entry['ip_address'],
                        source_url='https://feodotracker.abuse.ch/',
                        confidence=0.9,
                        tags=['abuse.ch', 'feodotracker', f"malware:{entry.get('malware_family', 'unknown')}"],
                        context=f"C&C server for {entry.get('malware_family', 'unknown')}",
                        metadata={
                            'port': entry.get('port'),
                            'malware_family': entry.get('malware_family'),
                            'first_seen': entry.get('first_seen')
                        }
                    )
                    processed_count += 1
                
                # Commit in batches
                if processed_count % 50 == 0:
                    self.commit_batch()
                    
            except Exception as e:
                logger.warning(f"Error processing FeodoTracker entry: {str(e)}")
                continue
        
        return processed_count
    
    def process_sslbl_data(self, sslbl_data: List[Dict[str, Any]]) -> int:
        """
        Process SSL Blacklist data and add to database
        
        Args:
            sslbl_data: List of dictionaries with SSL Blacklist data
            
        Returns:
            Number of IOCs added
        """
        processed_count = 0
        
        for entry in sslbl_data:
            try:
                # Add SSL fingerprint IOC
                if entry.get('ssl_fingerprint'):
                    self.add_ioc(
                        ioc_type='ssl_fingerprint',
                        ioc_value=entry['ssl_fingerprint'],
                        source_url='https://sslbl.abuse.ch/',
                        confidence=0.8,
                        tags=['abuse.ch', 'sslbl', f"malware:{entry.get('malware_family', 'unknown')}"],
                        context=f"Malicious SSL certificate used by {entry.get('malware_family', 'unknown')}",
                        metadata={
                            'timestamp': entry.get('timestamp'),
                            'malware_family': entry.get('malware_family')
                        }
                    )
                    processed_count += 1
                
                # Commit in batches
                if processed_count % 50 == 0:
                    self.commit_batch()
                    
            except Exception as e:
                logger.warning(f"Error processing SSL Blacklist entry: {str(e)}")
                continue
        
        return processed_count
    
    def run(self, **kwargs) -> Dict[str, Any]:
        """
        Run the Abuse.ch crawler
        
        Args:
            **kwargs: Additional arguments
            
        Returns:
            Dictionary with crawl statistics
        """
        # Start the feed run
        self.start_feed_run()
        
        try:
            stats = {
                'urlhaus': {'processed': 0, 'success': False},
                'feodotracker': {'processed': 0, 'success': False},
                'sslbl': {'processed': 0, 'success': False}
            }
            
            # Process URLhaus data
            try:
                urlhaus_data = self.fetch_urlhaus()
                processed = self.process_urlhaus_data(urlhaus_data)
                stats['urlhaus'] = {
                    'processed': processed,
                    'success': True,
                    'count': len(urlhaus_data)
                }
            except Exception as e:
                logger.error(f"Error processing URLhaus data: {str(e)}")
                stats['urlhaus']['error'] = str(e)
            
            # Process FeodoTracker data
            try:
                feodotracker_data = self.fetch_feodotracker()
                processed = self.process_feodotracker_data(feodotracker_data)
                stats['feodotracker'] = {
                    'processed': processed,
                    'success': True,
                    'count': len(feodotracker_data)
                }
            except Exception as e:
                logger.error(f"Error processing FeodoTracker data: {str(e)}")
                stats['feodotracker']['error'] = str(e)
            
            # Process SSL Blacklist data
            try:
                sslbl_data = self.fetch_sslbl()
                processed = self.process_sslbl_data(sslbl_data)
                stats['sslbl'] = {
                    'processed': processed,
                    'success': True,
                    'count': len(sslbl_data)
                }
            except Exception as e:
                logger.error(f"Error processing SSL Blacklist data: {str(e)}")
                stats['sslbl']['error'] = str(e)
            
            # Final commit
            self.commit_batch()
            
            # Calculate totals
            total_processed = (
                stats['urlhaus']['processed'] +
                stats['feodotracker']['processed'] +
                stats['sslbl']['processed']
            )
            
            # Finish the feed run
            self.finish_feed_run(
                status='success',
                items_processed=total_processed,
                items_added=total_processed  # Simplified - in reality, this should count only new items
            )
            
            return {
                'status': 'success',
                'stats': stats,
                'total_processed': total_processed
            }
            
        except Exception as e:
            logger.error(f"Error in Abuse.ch crawler: {str(e)}")
            self.finish_feed_run(
                status='failed',
                error_message=str(e)
            )
            return {
                'status': 'failed',
                'error': str(e)
            } 