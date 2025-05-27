"""
Base crawler class for threat intelligence

This module provides the BaseCrawler class that all crawlers should inherit from.
"""

import logging
from datetime import datetime
from app.tools.threat_intel_platform.app.models.schema import FeedRun
from app.tools.threat_intel_platform.app import db

logger = logging.getLogger(__name__)

class BaseCrawler:
    """Base class for all crawlers"""
    
    # Default attributes
    NAME = "base"  # Must be overridden in subclasses
    DISPLAY_NAME = "Base Crawler"  # Should be overridden in subclasses
    DESCRIPTION = "Base crawler class"  # Should be overridden in subclasses
    DEFAULT_FREQUENCY = "0 */12 * * *"  # Every 12 hours
    REQUIRED_KEYS = []  # List of required configuration keys
    
    def __init__(self, config=None):
        """
        Initialize the crawler with configuration
        
        Args:
            config: Dictionary with configuration parameters
        """
        self.config = config or {}
        self.feed_run = None
        
        # Validate configuration
        self._validate_config()
    
    def _validate_config(self):
        """
        Validate that required configuration keys are present
        
        Raises:
            ValueError: If a required key is missing
        """
        missing_keys = []
        
        for key in self.REQUIRED_KEYS:
            if key not in self.config and not self.config.get(key):
                missing_keys.append(key)
        
        if missing_keys:
            raise ValueError(f"Missing required configuration keys: {', '.join(missing_keys)}")
    
    def start_feed_run(self):
        """
        Start a new feed run
        
        Returns:
            FeedRun object
        """
        self.feed_run = FeedRun(
            feed_name=self.NAME,
            start_time=datetime.utcnow(),
            status='running'
        )
        
        try:
            db.session.add(self.feed_run)
            db.session.commit()
            logger.info(f"Started feed run: {self.NAME}")
        except Exception as e:
            logger.error(f"Error starting feed run: {str(e)}")
            db.session.rollback()
        
        return self.feed_run
    
    def finish_feed_run(self, status='success', items_processed=0, items_added=0, 
                         items_updated=0, error_message=None):
        """
        Finish a feed run
        
        Args:
            status: Status of the feed run (success, failed)
            items_processed: Number of items processed
            items_added: Number of items added
            items_updated: Number of items updated
            error_message: Error message if status is failed
            
        Returns:
            FeedRun object
        """
        if not self.feed_run:
            logger.warning("Trying to finish a feed run that was not started")
            return None
        
        self.feed_run.end_time = datetime.utcnow()
        self.feed_run.status = status
        self.feed_run.items_processed = items_processed
        self.feed_run.items_added = items_added
        self.feed_run.items_updated = items_updated
        
        if error_message:
            self.feed_run.error_message = error_message
        
        try:
            db.session.add(self.feed_run)
            db.session.commit()
            logger.info(f"Finished feed run: {self.NAME} ({status})")
        except Exception as e:
            logger.error(f"Error finishing feed run: {str(e)}")
            db.session.rollback()
        
        return self.feed_run
    
    def commit_batch(self):
        """Commit the current database transaction"""
        try:
            db.session.commit()
        except Exception as e:
            logger.error(f"Error committing batch: {str(e)}")
            db.session.rollback()
    
    def run(self, **kwargs):
        """
        Run the crawler
        
        This method should be implemented by subclasses
        
        Args:
            **kwargs: Additional arguments
            
        Returns:
            Dictionary with run statistics
        """
        raise NotImplementedError("Subclasses must implement run()") 