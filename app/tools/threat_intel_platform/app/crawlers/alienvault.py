import requests
from datetime import datetime, timedelta
import time
import os
import logging
import json
from urllib.parse import urlparse

from app.tools.threat_intel_platform.app.crawlers.base import BaseCrawler
from app.tools.threat_intel_platform.app.models.schema import (
    IOC, IPDetails, DomainDetails, URLDetails, FileDetails, Tag
)
from app.tools.threat_intel_platform.app.utils.ioc_extractor import extract_and_normalize
from app.tools.threat_intel_platform.app import db
from sqlalchemy import or_

logger = logging.getLogger(__name__)

class AlienVaultCrawler(BaseCrawler):
    """
    AlienVault OTX API crawler for threat intelligence
    """
    
    NAME = "alienvault"
    DISPLAY_NAME = "AlienVault OTX"
    DESCRIPTION = "Fetches threat intelligence from AlienVault Open Threat Exchange"
    DEFAULT_FREQUENCY = "0 */6 * * *"  # Every 6 hours
    REQUIRED_KEYS = ["api_key"]
    
    BASE_URL = "https://otx.alienvault.com/api/v1"
    
    def __init__(self, config=None):
        """Initialize crawler with configuration"""
        super().__init__(config)
        self.api_key = self.config.get("api_key") or os.environ.get('ALIENVAULT_API_KEY')
        
        if not self.api_key:
            logger.warning("AlienVault API key not provided.")
            raise ValueError("AlienVault API key is required.")
        
        self.headers = {
            'X-OTX-API-KEY': self.api_key,
            'User-Agent': 'FlexGenThreatIntel/1.0'
        }
    
    def get_subscribed_pulses(self, modified_since=None):
        """
        Get pulses (intel bundles) the user is subscribed to
        
        Args:
            modified_since: Datetime object to filter by modification date
            
        Returns:
            List of pulse dictionaries
        """
        endpoint = f"{self.BASE_URL}/pulses/subscribed"
        
        params = {}
        if modified_since:
            # Format: 2020-01-01T00:00:00.000000
            params['modified_since'] = modified_since.isoformat()
        
        response = requests.get(endpoint, headers=self.headers, params=params)
        
        if response.status_code != 200:
            logger.error(f"Failed to fetch pulses: {response.status_code} {response.text}")
            return []
        
        data = response.json()
        return data.get('results', [])
    
    def get_pulse_indicators(self, pulse_id):
        """
        Get indicators from a specific pulse
        
        Args:
            pulse_id: The ID of the pulse
            
        Returns:
            List of indicator dictionaries
        """
        endpoint = f"{self.BASE_URL}/pulses/{pulse_id}/indicators"
        
        response = requests.get(endpoint, headers=self.headers)
        
        if response.status_code != 200:
            logger.error(f"Failed to fetch indicators for pulse {pulse_id}: {response.status_code} {response.text}")
            return []
        
        data = response.json()
        return data.get('results', [])
    
    def process_pulse(self, pulse):
        """
        Process a pulse and extract/store IOCs
        
        Args:
            pulse: Pulse dictionary from AlienVault API
            
        Returns:
            Number of IOCs extracted and processed
        """
        pulse_id = pulse.get('id')
        pulse_name = pulse.get('name', 'Unknown')
        pulse_url = f"https://otx.alienvault.com/pulse/{pulse_id}"
        pulse_tags = pulse.get('tags', [])
        pulse_malware_families = pulse.get('malware_families', [])
        pulse_tlp = pulse.get('tlp', 'white')
        pulse_adversary = pulse.get('adversary', '')
        pulse_industries = pulse.get('industries', [])
        pulse_targeted_countries = pulse.get('targeted_countries', [])
        
        # Combine tags
        tags = pulse_tags.copy()
        if pulse_malware_families:
            tags.extend([f"malware:{family}" for family in pulse_malware_families])
        if pulse_adversary:
            tags.append(f"adversary:{pulse_adversary}")
        tags.append(f"tlp:{pulse_tlp}")
        
        # Add industry tags if present
        if pulse_industries:
            tags.extend([f"industry:{industry}" for industry in pulse_industries])
            
        # Add country tags if present
        if pulse_targeted_countries:
            tags.extend([f"country:{country}" for country in pulse_targeted_countries])
        
        # Base confidence on pulse details
        confidence = 0.5
        if pulse.get('validated', False):
            confidence += 0.2
        if len(pulse_tags) > 3:
            confidence += 0.1
        if pulse_adversary:
            confidence += 0.1
        
        # Get all indicators from the pulse
        indicators = self.get_pulse_indicators(pulse_id)
        processed_count = 0
        
        for indicator in indicators:
            ind_type = indicator.get('type')
            ind_value = indicator.get('indicator')
            
            if not ind_type or not ind_value:
                continue
            
            # Map AlienVault types to our IOC types
            ioc_type_map = {
                'IPv4': 'ip',
                'IPv6': 'ip',
                'domain': 'domain',
                'hostname': 'domain',
                'URL': 'url',
                'URI': 'url',
                'FileHash-MD5': 'md5',
                'FileHash-SHA1': 'sha1', 
                'FileHash-SHA256': 'sha256',
                'FileHash-SHA512': 'sha512',
                'FileHash-SSDEEP': 'ssdeep',
                'email': 'email',
                'CIDR': 'cidr',
                'YARA': 'yara',
                'CVE': 'cve',
                'mutex': 'mutex',
                'JA3': 'ja3'
            }
            
            # Skip unsupported types
            if ind_type not in ioc_type_map:
                continue
                
            ioc_type = ioc_type_map[ind_type]
            
            # Process the indicator
            try:
                processed = self._process_indicator(
                    ioc_type=ioc_type,
                    ioc_value=ind_value,
                    indicator_data=indicator,
                    pulse_data=pulse,
                    pulse_url=pulse_url,
                    tags=tags,
                    confidence=confidence
                )
                
                if processed:
                    processed_count += 1
                    
                # Commit in batches
                if processed_count % 50 == 0:
                    self.commit_batch()
                    
            except Exception as e:
                logger.error(f"Error processing indicator {ind_type}:{ind_value}: {str(e)}")
                continue
                
        return processed_count
    
    def _process_indicator(self, ioc_type, ioc_value, indicator_data, pulse_data, pulse_url, tags, confidence):
        """
        Process a single indicator and add/update in database
        
        Args:
            ioc_type: Type of IOC (ip, domain, url, etc.)
            ioc_value: Value of the IOC
            indicator_data: Raw indicator data from AlienVault
            pulse_data: Raw pulse data from AlienVault
            pulse_url: URL to the pulse
            tags: List of tags to apply
            confidence: Confidence score (0.0 to 1.0)
            
        Returns:
            True if processed successfully, False otherwise
        """
        # Check if IOC already exists
        existing_ioc = IOC.query.filter_by(type=ioc_type, value=ioc_value).first()
        
        # Metadata from the indicator
        meta = {
            'pulse_id': pulse_data.get('id'),
            'pulse_name': pulse_data.get('name'),
            'description': pulse_data.get('description', ''),
            'industries': pulse_data.get('industries', []),
            'created': pulse_data.get('created', ''),
            'modified': pulse_data.get('modified', ''),
            'indicator_description': indicator_data.get('description', ''),
            'indicator_title': indicator_data.get('title', ''),
            'indicator_created': indicator_data.get('created', '')
        }
        
        # Add or update the base IOC
        if existing_ioc:
            # Update last_seen and possibly tags
            existing_ioc.last_seen = datetime.utcnow()
            
            # Find Tag objects for the tags
            tag_objects = []
            for tag_name in tags:
                tag = db.session.query(Tag).filter_by(name=tag_name).first()
                if not tag:
                    tag = Tag(name=tag_name)
                    db.session.add(tag)
                tag_objects.append(tag)
            
            # Update tags
            existing_ioc.tags = list(set(existing_ioc.tags + tag_objects))
            
            # Update confidence if higher
            if confidence > existing_ioc.confidence:
                existing_ioc.confidence = confidence
            
                        # Update metadata                current_meta = existing_ioc.meta_data or {}                current_meta.update(meta)                existing_ioc.meta_data = current_meta
            
            db.session.add(existing_ioc)
            ioc = existing_ioc
        else:
            # Find Tag objects for the tags
            tag_objects = []
            for tag_name in tags:
                tag = db.session.query(Tag).filter_by(name=tag_name).first()
                if not tag:
                    tag = Tag(name=tag_name)
                    db.session.add(tag)
                tag_objects.append(tag)
            
            # Create new IOC
            ioc = IOC(
                type=ioc_type,
                value=ioc_value,
                source=self.DISPLAY_NAME,
                source_url=pulse_url,
                confidence=confidence,
                context=pulse_data.get('name', ''),                tlp=pulse_data.get('tlp', 'white'),                meta_data=meta,                tags=tag_objects
            )
            db.session.add(ioc)
        
        # Process type-specific details
        if ioc_type == 'ip':
            self._process_ip_details(ioc, ioc_value, indicator_data)
        elif ioc_type in ['domain', 'hostname']:
            self._process_domain_details(ioc, ioc_value, indicator_data)
        elif ioc_type == 'url':
            self._process_url_details(ioc, ioc_value, indicator_data)
        elif ioc_type in ['md5', 'sha1', 'sha256', 'sha512', 'ssdeep']:
            self._process_file_details(ioc, ioc_value, ioc_type, indicator_data)
        
        return True
    
    def _process_ip_details(self, ioc, ip_value, indicator_data):
        """Add or update IP details"""
        # Check if details already exist
        if ioc.ip_details:
            details = ioc.ip_details
        else:
            details = IPDetails()
            ioc.ip_details = details
        
        # Extract any available details from indicator data
        if 'geo' in indicator_data:
            geo = indicator_data['geo']
            if 'country' in geo:
                details.country = geo.get('country_code')
                details.country_name = geo.get('country_name')
            if 'city' in geo:
                details.city = geo.get('city')
            if 'latitude' in geo and 'longitude' in geo:
                details.latitude = geo.get('latitude')
                details.longitude = geo.get('longitude')
            if 'asn' in geo:
                details.asn = geo.get('asn')
        
        # Set other available fields
        details.is_tor = indicator_data.get('is_tor', False)
        details.is_proxy = indicator_data.get('is_proxy', False)
        details.is_malicious = True  # If it's in AlienVault, it's likely malicious
        
        db.session.add(details)
    
    def _process_domain_details(self, ioc, domain_value, indicator_data):
        """Add or update domain details"""
        # Check if details already exist
        if ioc.domain_details:
            details = ioc.domain_details
        else:
            details = DomainDetails()
            ioc.domain_details = details
        
        # Extract any available details
        if 'whois' in indicator_data:
            whois = indicator_data['whois']
            details.whois = whois
            
            # Try to extract registration info
            if 'Creation Date' in whois:
                try:
                    # Parse different date formats
                    date_str = whois['Creation Date']
                    details.creation_date = datetime.strptime(date_str, '%Y-%m-%dT%H:%M:%S')
                except:
                    pass
            
            if 'Registrar' in whois:
                details.registrar = whois['Registrar']
            
            if 'Registrant Organization' in whois:
                details.registrant_org = whois['Registrant Organization']
            
            if 'Registrant Email' in whois:
                details.registrant_email = whois['Registrant Email']
        
        # Set other fields if available
        details.reputation_score = indicator_data.get('reputation', 0)
        
        # Store DNS info if available
        if 'dns' in indicator_data:
            dns = indicator_data['dns']
            if 'A' in dns:
                details.a_records = dns['A']
            if 'NS' in dns:
                details.nameservers = dns['NS']
            if 'MX' in dns:
                details.mx_records = dns['MX']
            if 'TXT' in dns:
                details.txt_records = dns['TXT']
        
        db.session.add(details)
    
    def _process_url_details(self, ioc, url_value, indicator_data):
        """Add or update URL details"""
        # Check if details already exist
        if ioc.url_details:
            details = ioc.url_details
        else:
            details = URLDetails()
            ioc.url_details = details
        
        # Parse URL components
        try:
            parsed = urlparse(url_value)
            details.scheme = parsed.scheme
            details.domain = parsed.netloc
            details.path = parsed.path
            details.query_string = parsed.query
            details.fragment = parsed.fragment
            if ':' in parsed.netloc:
                details.port = int(parsed.netloc.split(':')[1])
        except Exception as e:
            logger.warning(f"Error parsing URL {url_value}: {str(e)}")
        
        # Set other fields if available
        details.title = indicator_data.get('title')
        
        # Check if URL is shortened
        short_services = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'is.gd', 'cli.gs', 'ow.ly']
        details.is_shortened = any(service in url_value for service in short_services)
        
        # Set security flags based on tags
        tags = [tag.name for tag in ioc.tags]
        details.contains_malware = any('malware' in tag for tag in tags)
        details.contains_phishing = any('phish' in tag for tag in tags)
        details.contains_exploit = any('exploit' in tag for tag in tags)
        
        db.session.add(details)
    
    def _process_file_details(self, ioc, hash_value, hash_type, indicator_data):
        """Add or update file details"""
        # Check if details already exist
        if ioc.file_details:
            details = ioc.file_details
        else:
            details = FileDetails()
            ioc.file_details = details
        
        # Set the appropriate hash field
        if hash_type == 'md5':
            details.md5 = hash_value
        elif hash_type == 'sha1':
            details.sha1 = hash_value
        elif hash_type == 'sha256':
            details.sha256 = hash_value
        elif hash_type == 'sha512':
            details.sha512 = hash_value
        elif hash_type == 'ssdeep':
            details.ssdeep = hash_value
        
        # Extract file information from indicator data
        if 'analysis' in indicator_data:
            analysis = indicator_data['analysis']
            
            # File info
            if 'info' in analysis:
                info = analysis['info']
                details.file_name = info.get('file')
                details.file_size = info.get('size')
                details.file_type = info.get('type')
                details.mime_type = info.get('mime')
            
            # Detection info
            if 'plugins' in analysis and 'avs' in analysis['plugins']:
                avs = analysis['plugins']['avs']
                counts = {'detected': 0, 'total': 0}
                av_labels = {}
                
                for av_name, av_data in avs.items():
                    counts['total'] += 1
                    if av_data.get('detected'):
                        counts['detected'] += 1
                        av_labels[av_name] = av_data.get('result', '')
                
                details.detection_ratio = f"{counts['detected']}/{counts['total']}"
                details.av_labels = av_labels
            
            # Behavior analysis
            if 'plugins' in analysis and 'behavior' in analysis['plugins']:
                behavior = analysis['plugins']['behavior']
                
                # Network activity
                if 'network' in behavior:
                    network = behavior['network']
                    details.network_indicators = network
                
                # File activity
                if 'files' in behavior:
                    files = behavior['files']
                    details.file_indicators = files
                
                # Process activity
                process_indicators = []
                if 'processes' in behavior:
                    for process in behavior['processes']:
                        if 'calls' in process:
                            for call in process['calls']:
                                if call.get('category') == 'registry' or call.get('api', '').startswith('Reg'):
                                    process_indicators.append(call)
                
                details.behavioral_indicators = process_indicators
        
        # Determine malware family and type from tags
        tags = [tag.name for tag in ioc.tags]
        for tag in tags:
            if tag.startswith('malware:'):
                details.malware_family = tag.split(':', 1)[1]
                break
        
        for tag in tags:
            if tag in ['ransomware', 'trojan', 'backdoor', 'worm', 'spyware', 'adware', 'dropper']:
                details.malware_type = tag
                break
        
        # Calculate threat level (0-10) based on confidence and detection ratio
        confidence = ioc.confidence or 0.5
        threat_level = int(confidence * 10)
        
        if hasattr(details, 'detection_ratio') and details.detection_ratio:
            try:
                detected, total = map(int, details.detection_ratio.split('/'))
                ratio = detected / total if total > 0 else 0
                threat_level = max(threat_level, int(ratio * 10))
            except:
                pass
        
        details.threat_level = min(threat_level, 10)  # Cap at 10
        
        db.session.add(details)
    
    def run(self, hours_back=24, **kwargs):
        """
        Main method to run the crawler
        
        Args:
            hours_back: How many hours to look back for modified pulses
            **kwargs: Additional arguments
            
        Returns:
            Dictionary with crawl statistics
        """
        hours_back = int(self.config.get('hours_back', hours_back))
        
        # Start the feed run
        self.start_feed_run()
        
        try:
            # Get pulses modified since the specified time
            since_date = datetime.utcnow() - timedelta(hours=hours_back)
            pulses = self.get_subscribed_pulses(modified_since=since_date)
            
            total_processed = 0
            items_added = 0
            items_updated = 0
            
            # Process each pulse
            for pulse in pulses:
                try:
                    processed = self.process_pulse(pulse)
                    total_processed += processed
                    
                    # Get counts of added vs updated
                    since_run_start = IOC.query.filter(IOC.source == self.DISPLAY_NAME, 
                                                    IOC.first_seen >= self.feed_run.start_time).count()
                    items_added = since_run_start
                    items_updated = total_processed - items_added
                    
                    # Commit in batches to avoid large transactions
                    if total_processed % 50 == 0:
                        self.commit_batch()
                        
                except Exception as e:
                    logger.error(f"Error processing pulse {pulse.get('id')}: {str(e)}")
                    continue
            
            # Final commit
            self.commit_batch()
            
            # Update FeedRun with results
            self.finish_feed_run(
                status='success',
                items_processed=total_processed,
                items_added=items_added,
                items_updated=items_updated
            )
            
            return {
                'status': 'success',
                'pulses_processed': len(pulses),
                'indicators_processed': total_processed,
                'items_added': items_added,
                'items_updated': items_updated
            }
            
        except Exception as e:
            # Log the error and update FeedRun
            logger.error(f"Error in AlienVault crawler: {str(e)}")
            
            self.finish_feed_run(
                status='failed',
                error_message=str(e)
            )
            
            return {
                'status': 'failed',
                'error': str(e)
            } 