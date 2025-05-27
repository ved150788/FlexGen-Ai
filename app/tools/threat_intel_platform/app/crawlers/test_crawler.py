"""
Test crawler for demonstration purposes

This is a simple crawler used for testing the scheduler and crawler framework.
"""

import logging
from datetime import datetime
import time
import random

from app.tools.threat_intel_platform.app.crawlers.base import BaseCrawler
from app.tools.threat_intel_platform.app.models.schema import IOC, Tag
from app.tools.threat_intel_platform.app import db

logger = logging.getLogger(__name__)

class TestCrawler(BaseCrawler):
    """Test crawler for verifying scheduler functionality"""
    
    NAME = "test"
    DISPLAY_NAME = "Test Crawler"
    DESCRIPTION = "A simple crawler for testing the scheduler and crawler framework"
    DEFAULT_FREQUENCY = "*/5 * * * *"  # Run every 5 minutes for testing
    
    def __init__(self, config=None):
        """Initialize the test crawler"""
        super().__init__(config)
        
        # Get configuration options with defaults
        self.num_iocs = int(self.config.get('num_iocs', 5))
        self.delay = int(self.config.get('delay', 2))
        self.fail_probability = float(self.config.get('fail_probability', 0))
    
    def run(self, **kwargs):
        """
        Run the test crawler
        
        Returns:
            Dictionary with statistics
        """
        logger.info(f"Running test crawler with {self.num_iocs} IOCs, {self.delay}s delay")
        
        # Start the feed run
        self.start_feed_run()
        
        try:
            # Random failure for testing error handling
            if random.random() < self.fail_probability:
                raise RuntimeError("Random test failure")
            
            # Generate some test IOCs
            items_added = 0
            items_updated = 0
            
            for i in range(self.num_iocs):
                # Add some delay to simulate work
                time.sleep(self.delay)
                
                # Generate a random test IOC
                ioc_type = random.choice(['ip', 'domain', 'url', 'md5'])
                
                if ioc_type == 'ip':
                    ioc_value = f"192.0.2.{random.randint(1, 254)}"  # TEST-NET-1 range
                elif ioc_type == 'domain':
                    ioc_value = f"test-{random.randint(1000, 9999)}.example.com"
                elif ioc_type == 'url':
                    ioc_value = f"https://test-{random.randint(1000, 9999)}.example.com/page{random.randint(1, 100)}.html"
                elif ioc_type == 'md5':
                    ioc_value = ''.join(random.choice('0123456789abcdef') for _ in range(32))
                
                # Check if IOC already exists
                existing_ioc = db.session.query(IOC).filter_by(type=ioc_type, value=ioc_value).first()
                
                if existing_ioc:
                    # Update existing IOC
                    existing_ioc.last_seen = datetime.utcnow()
                    db.session.add(existing_ioc)
                    items_updated += 1
                else:
                    # Create a test tag if it doesn't exist
                    test_tag = db.session.query(Tag).filter_by(name='test').first()
                    if not test_tag:
                        test_tag = Tag(name='test', category='test', description='Test tag')
                        db.session.add(test_tag)
                    
                    # Create new IOC
                    new_ioc = IOC(
                        type=ioc_type,
                        value=ioc_value,
                        source='Test Crawler',
                        source_url='https://example.com/test',
                        confidence=random.uniform(0.1, 1.0),
                        context='Test IOC generated for scheduler testing',
                        meta_data={
                            'test_id': i,
                            'timestamp': datetime.utcnow().isoformat()
                        }
                    )
                    new_ioc.tags.append(test_tag)
                    db.session.add(new_ioc)
                    items_added += 1
                
                # Commit in batches
                if (i + 1) % 2 == 0:
                    self.commit_batch()
            
            # Commit any remaining items
            self.commit_batch()
            
            # Finish the feed run
            self.finish_feed_run(
                status='success',
                items_processed=self.num_iocs,
                items_added=items_added,
                items_updated=items_updated
            )
            
            return {
                'status': 'success',
                'iocs_processed': self.num_iocs,
                'items_added': items_added,
                'items_updated': items_updated
            }
            
        except Exception as e:
            logger.error(f"Error in test crawler: {str(e)}")
            
            self.finish_feed_run(
                status='failed',
                items_processed=0,
                error_message=str(e)
            )
            
            return {
                'status': 'failed',
                'error': str(e)
            } 