import requests
from bs4 import BeautifulSoup
import time
import logging
import re
from datetime import datetime
from app.models.ioc import IOC, FeedRun
from app.utils.ioc_extractor import extract_and_normalize
from app import db

logger = logging.getLogger(__name__)

class PastebinCrawler:
    """Crawler for Pastebin - Note: This is a basic implementation and should be enhanced"""
    
    ARCHIVE_URL = "https://pastebin.com/archive"
    RAW_URL_FORMAT = "https://pastebin.com/raw/{}"
    
    def __init__(self):
        """Initialize Pastebin crawler"""
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    
    def fetch_recent_pastes(self, limit=10):
        """
        Fetch IDs of recent pastes from the archive page
        
        Args:
            limit: Maximum number of pastes to fetch
            
        Returns:
            List of paste IDs
        """
        try:
            response = requests.get(self.ARCHIVE_URL, headers=self.headers)
            
            if response.status_code != 200:
                logger.error(f"Failed to fetch Pastebin archive: {response.status_code}")
                return []
            
            soup = BeautifulSoup(response.text, 'html.parser')
            paste_links = soup.select('table.maintable tr td:nth-child(1) a')
            
            paste_ids = []
            for link in paste_links[:limit]:
                paste_id = link['href'].strip('/')
                paste_ids.append(paste_id)
            
            return paste_ids
            
        except Exception as e:
            logger.error(f"Error fetching Pastebin archive: {str(e)}")
            return []
    
    def fetch_paste_content(self, paste_id):
        """
        Fetch the content of a specific paste
        
        Args:
            paste_id: ID of the paste to fetch
            
        Returns:
            Tuple of (paste content, paste URL)
        """
        raw_url = self.RAW_URL_FORMAT.format(paste_id)
        paste_url = f"https://pastebin.com/{paste_id}"
        
        try:
            response = requests.get(raw_url, headers=self.headers)
            
            if response.status_code != 200:
                logger.error(f"Failed to fetch paste {paste_id}: {response.status_code}")
                return None, paste_url
            
            return response.text, paste_url
            
        except Exception as e:
            logger.error(f"Error fetching paste {paste_id}: {str(e)}")
            return None, paste_url
    
    def process_paste(self, paste_id):
        """
        Process a paste and extract IOCs
        
        Args:
            paste_id: ID of the paste to process
            
        Returns:
            Number of IOCs extracted and stored
        """
        content, paste_url = self.fetch_paste_content(paste_id)
        
        if not content:
            return 0
        
        # Extract IOCs from the paste content using our utility
        normalized_iocs = extract_and_normalize(
            text=content, 
            source='Pastebin',
            source_url=paste_url,
            confidence=0.4  # Relatively low base confidence since Pastebin is noisy
        )
        
        # Store the IOCs in the database
        for ioc_data in normalized_iocs:
            # Check if IOC already exists
            existing_ioc = IOC.query.filter_by(
                type=ioc_data['type'], 
                value=ioc_data['value']
            ).first()
            
            if existing_ioc:
                # Update last_seen and possibly tags
                existing_ioc.last_seen = datetime.utcnow()
                
                # Update tags if new ones available
                current_tags = set(existing_ioc.tags) if existing_ioc.tags else set()
                new_tags = set(ioc_data['tags'])
                combined_tags = list(current_tags.union(new_tags))
                existing_ioc.tags = combined_tags
                
                db.session.add(existing_ioc)
            else:
                # Create new IOC
                new_ioc = IOC(
                    type=ioc_data['type'],
                    value=ioc_data['value'],
                    source=ioc_data['source'],
                    source_url=ioc_data['source_url'],
                    confidence=ioc_data['confidence'],
                    tags=ioc_data['tags'],
                    context=ioc_data['context'],
                    metadata={'paste_id': paste_id}
                )
                db.session.add(new_ioc)
        
        # Commit changes in batches
        db.session.commit()
        
        return len(normalized_iocs)
    
    def run(self, limit=20):
        """
        Main method to run the crawler
        
        Args:
            limit: Maximum number of pastes to process
            
        Returns:
            Dictionary with crawl statistics
        """
        # Create a FeedRun record
        feed_run = FeedRun(
            feed_name='Pastebin',
            status='running'
        )
        db.session.add(feed_run)
        db.session.commit()
        
        try:
            # Fetch recent paste IDs
            paste_ids = self.fetch_recent_pastes(limit=limit)
            
            # Process each paste
            total_processed = 0
            total_iocs = 0
            
            for paste_id in paste_ids:
                try:
                    # Add a delay to avoid rate limiting
                    time.sleep(1)
                    
                    # Process the paste
                    ioc_count = self.process_paste(paste_id)
                    total_iocs += ioc_count
                    total_processed += 1
                    
                    logger.info(f"Processed paste {paste_id}, found {ioc_count} IOCs")
                    
                except Exception as e:
                    logger.error(f"Error processing paste {paste_id}: {str(e)}")
                    continue
            
            # Update FeedRun with results
            feed_run.end_time = datetime.utcnow()
            feed_run.status = 'success'
            feed_run.items_processed = total_processed
            feed_run.items_added = total_iocs
            db.session.add(feed_run)
            db.session.commit()
            
            return {
                'status': 'success',
                'pastes_processed': total_processed,
                'iocs_found': total_iocs
            }
            
        except Exception as e:
            # Log the error and update FeedRun
            logger.error(f"Error in Pastebin crawler: {str(e)}")
            
            feed_run.end_time = datetime.utcnow()
            feed_run.status = 'failed'
            feed_run.error_message = str(e)
            db.session.add(feed_run)
            db.session.commit()
            
            return {
                'status': 'failed',
                'error': str(e)
            } 