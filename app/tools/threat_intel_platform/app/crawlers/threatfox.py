import requests
import json
from datetime import datetime, timedelta
import logging
from app.models.ioc import IOC, FeedRun
from app import db

logger = logging.getLogger(__name__)

class ThreatFoxCrawler:
    """Crawler for Abuse.ch ThreatFox API"""
    
    API_URL = "https://threatfox-api.abuse.ch/api/v1/"
    
    def __init__(self):
        """Initialize ThreatFox crawler"""
        self.headers = {
            'User-Agent': 'FlexGenThreatIntel/1.0',
            'Content-Type': 'application/json'
        }
    
    def fetch_recent_iocs(self, days=1):
        """
        Fetch recent IOCs from ThreatFox
        
        Args:
            days: Number of days to look back
            
        Returns:
            List of IOC dictionaries
        """
        # Prepare API request payload
        payload = {
            "query": "get_iocs",
            "days": days
        }
        
        response = requests.post(
            self.API_URL, 
            headers=self.headers,
            data=json.dumps(payload)
        )
        
        if response.status_code != 200:
            logger.error(f"Failed to fetch ThreatFox IOCs: {response.status_code}")
            return []
        
        data = response.json()
        
        # Check for API response status
        if data.get('query_status') != 'ok':
            logger.error(f"ThreatFox API error: {data.get('query_status')}")
            return []
        
        return data.get('data', [])
    
    def process_iocs(self, iocs):
        """
        Process IOCs from ThreatFox and store in database
        
        Args:
            iocs: List of IOC dictionaries from ThreatFox
            
        Returns:
            Tuple of (processed count, new count)
        """
        processed_count = 0
        new_count = 0
        
        for ioc in iocs:
            try:
                # Extract basic info
                ioc_id = ioc.get('id')
                ioc_value = ioc.get('ioc')
                ioc_type = ioc.get('ioc_type')
                threat_type = ioc.get('threat_type')
                malware_name = ioc.get('malware_printable')
                
                # Skip if essential data is missing
                if not ioc_value or not ioc_type:
                    continue
                
                # Map ThreatFox types to our IOC types
                ioc_type_map = {
                    'ip:port': 'ip',
                    'ip': 'ip',
                    'domain': 'domain',
                    'url': 'url',
                    'md5_hash': 'md5',
                    'sha1_hash': 'sha1',
                    'sha256_hash': 'sha256'
                }
                
                # Skip unsupported types
                if ioc_type not in ioc_type_map:
                    continue
                
                # Normalize the IOC type
                normalized_type = ioc_type_map[ioc_type]
                
                # Extract IOC value (handle ip:port format)
                if ioc_type == 'ip:port':
                    # Extract just the IP part
                    ioc_value = ioc_value.split(':')[0]
                
                # Create tags
                tags = []
                
                # Add malware name tag
                if malware_name:
                    tags.append(f"malware:{malware_name}")
                
                # Add threat type tag
                if threat_type:
                    tags.append(f"threat:{threat_type}")
                
                # Calculate confidence based on data quality
                confidence = 0.6  # Base confidence for ThreatFox
                if malware_name:
                    confidence += 0.1
                if threat_type:
                    confidence += 0.1
                if ioc.get('confidence_level'):
                    # ThreatFox uses 0-100 scale
                    confidence = min(0.9, confidence + (ioc.get('confidence_level', 0) / 100))
                
                # Parse dates
                first_seen = None
                if ioc.get('first_seen'):
                    try:
                        first_seen = datetime.fromtimestamp(ioc.get('first_seen'))
                    except (ValueError, TypeError):
                        pass
                
                last_seen = None
                if ioc.get('last_seen'):
                    try:
                        last_seen = datetime.fromtimestamp(ioc.get('last_seen'))
                    except (ValueError, TypeError):
                        pass
                
                # Create metadata
                metadata = {
                    'threatfox_id': ioc_id,
                    'malware_name': malware_name,
                    'threat_type': threat_type,
                    'reference': ioc.get('reference'),
                    'reporter': ioc.get('reporter'),
                    'confidence_level': ioc.get('confidence_level')
                }
                
                # Add or update the IOC
                added = self._add_or_update_ioc(
                    normalized_type, 
                    ioc_value, 
                    tags, 
                    confidence, 
                    first_seen, 
                    last_seen,
                    metadata
                )
                
                if added:
                    new_count += 1
                
                processed_count += 1
                
            except Exception as e:
                logger.error(f"Error processing ThreatFox IOC: {str(e)}")
                continue
        
        return processed_count, new_count
    
    def _add_or_update_ioc(self, ioc_type, value, tags, confidence, first_seen, last_seen, metadata):
        """
        Helper method to add or update an IOC in the database
        
        Returns:
            Boolean indicating if this was a new IOC
        """
        # Check if IOC already exists
        existing_ioc = IOC.query.filter_by(type=ioc_type, value=value).first()
        
        if existing_ioc:
            # Update last_seen
            if last_seen:
                existing_ioc.last_seen = last_seen
            else:
                existing_ioc.last_seen = datetime.utcnow()
            
            # Update tags if new ones available
            current_tags = set(existing_ioc.tags) if existing_ioc.tags else set()
            new_tags = set(tags)
            combined_tags = list(current_tags.union(new_tags))
            existing_ioc.tags = combined_tags
            
            # Update confidence if higher
            if confidence > existing_ioc.confidence:
                existing_ioc.confidence = confidence
                
            # Update metadata
            if existing_ioc.metadata:
                existing_ioc.metadata.update(metadata)
            else:
                existing_ioc.metadata = metadata
            
            db.session.add(existing_ioc)
            return False
        else:
            # Create new IOC
            source_url = f"https://threatfox.abuse.ch/browse/"
            
            new_ioc = IOC(
                type=ioc_type,
                value=value,
                source='Abuse.ch ThreatFox',
                source_url=source_url,
                confidence=confidence,
                tags=tags,
                context=f"Threat indicator from ThreatFox ({metadata.get('malware_name', 'unknown')})",
                metadata=metadata
            )
            
            # Set first_seen if available
            if first_seen:
                new_ioc.first_seen = first_seen
                
            # Set last_seen if available
            if last_seen:
                new_ioc.last_seen = last_seen
                
            db.session.add(new_ioc)
            return True
    
    def run(self, days=1):
        """
        Main method to run the crawler
        
        Args:
            days: Number of days to look back for IOCs
            
        Returns:
            Dictionary with crawl statistics
        """
        # Create a FeedRun record
        feed_run = FeedRun(
            feed_name='Abuse.ch ThreatFox',
            status='running'
        )
        db.session.add(feed_run)
        db.session.commit()
        
        try:
            # Fetch recent IOCs
            iocs = self.fetch_recent_iocs(days=days)
            
            # Process IOCs
            processed_count, new_count = self.process_iocs(iocs)
            
            # Commit changes
            db.session.commit()
            
            # Update FeedRun with results
            feed_run.end_time = datetime.utcnow()
            feed_run.status = 'success'
            feed_run.items_processed = processed_count
            feed_run.items_added = new_count
            db.session.add(feed_run)
            db.session.commit()
            
            return {
                'status': 'success',
                'iocs_processed': processed_count,
                'items_added': new_count
            }
            
        except Exception as e:
            # Log the error and update FeedRun
            logger.error(f"Error in ThreatFox crawler: {str(e)}")
            
            feed_run.end_time = datetime.utcnow()
            feed_run.status = 'failed'
            feed_run.error_message = str(e)
            db.session.add(feed_run)
            db.session.commit()
            
            return {
                'status': 'failed',
                'error': str(e)
            } 