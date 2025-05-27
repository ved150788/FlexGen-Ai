"""
Crawler manager for coordinating multiple crawlers
"""

import os
import logging
import importlib
import inspect
from typing import Dict, Any, List, Optional, Type
from datetime import datetime
from app.tools.threat_intel_platform.app.crawlers.config import crawler_config
from app.tools.threat_intel_platform.app.crawlers.base import BaseCrawler
from flask import current_app

logger = logging.getLogger(__name__)

class CrawlerManager:
    """
    Manager for all threat intelligence crawlers
    
    This class is responsible for:
    - Discovering and loading crawler classes
    - Running crawlers either individually or as a group
    - Managing crawler configurations
    - Tracking crawler results
    """
    
    def __init__(self):
        """Initialize the crawler manager"""
        self.results = {}
        self._discover_crawlers()
    
    def _discover_crawlers(self) -> None:
        """
        Discover and register all crawler classes
        
        This method searches for all BaseCrawler subclasses in the crawlers package
        and registers them with the crawler_config.
        """
        # Get the crawlers package
        crawlers_package = "app.tools.threat_intel_platform.app.crawlers"
        
        try:
            # Get all modules in the crawlers package (excluding __init__, base, config, etc.)
            crawler_modules = [
                f"{crawlers_package}.{module}" for module in [
                    "alienvault", "malwarebazaar", "threatfox", "pastebin", "reddit", "abusech"
                ] if importlib.util.find_spec(f"{crawlers_package}.{module}")
            ]
            
            # Import all crawler modules
            for module_name in crawler_modules:
                try:
                    module = importlib.import_module(module_name)
                    
                    # Find all classes that inherit from BaseCrawler
                    for name, obj in inspect.getmembers(module):
                        if (inspect.isclass(obj) and 
                            issubclass(obj, BaseCrawler) and 
                            obj is not BaseCrawler):
                            
                            # Register the crawler
                            crawler_config.register_crawler(obj)
                            logger.info(f"Registered crawler: {obj.NAME} ({obj.DISPLAY_NAME})")
                            
                except Exception as e:
                    logger.error(f"Error loading crawler module {module_name}: {str(e)}")
                    
        except Exception as e:
            logger.error(f"Error discovering crawlers: {str(e)}")
    
    def get_available_crawlers(self) -> List[Dict[str, Any]]:
        """
        Get the list of available crawlers with their configurations
        
        Returns:
            List of dictionaries with crawler details
        """
        crawlers = []
        
        for name, crawler_class in crawler_config.crawler_registry.items():
            config = crawler_config.get_crawler_config(name)
            
            crawlers.append({
                'name': name,
                'display_name': crawler_class.DISPLAY_NAME,
                'description': crawler_class.DESCRIPTION,
                'enabled': config.get('enabled', False),
                'frequency': config.get('frequency', crawler_class.DEFAULT_FREQUENCY)
            })
            
        return crawlers
    
    def run_all(self) -> Dict[str, Any]:
        """
        Run all enabled crawlers
        
        Returns:
            Dictionary with results for each crawler
        """
        self.results = {}
        enabled_crawlers = crawler_config.get_enabled_crawlers()
        
        for crawler_name in enabled_crawlers:
            try:
                self.run_crawler(crawler_name)
            except Exception as e:
                logger.error(f"Error running crawler {crawler_name}: {str(e)}")
                self.results[crawler_name] = {'status': 'failed', 'error': str(e)}
        
        return self.results
    
    def run_crawler(self, crawler_name: str, **kwargs) -> Dict[str, Any]:
        """
        Run a specific crawler by name
        
        Args:
            crawler_name: Name of the crawler to run
            **kwargs: Additional arguments to pass to the crawler
            
        Returns:
            Dictionary with crawler results
        """
        # Check if crawler exists
        crawler_class = crawler_config.get_crawler_class(crawler_name)
        if not crawler_class:
            logger.error(f"Unknown crawler: {crawler_name}")
            return {'status': 'failed', 'error': f"Unknown crawler: {crawler_name}"}
        
        # Get configuration for the crawler
        config = crawler_config.get_crawler_config(crawler_name)
        
        # Check if crawler is enabled
        if not config.get('enabled', True):
            logger.info(f"Crawler {crawler_name} is disabled, skipping")
            return {'status': 'skipped', 'reason': 'Disabled'}
        
        try:
            # Create crawler instance
            crawler = crawler_class(config)
            
            # Validate configuration
            if not crawler.validate_config():
                return {'status': 'skipped', 'reason': 'Invalid configuration'}
            
            # Run the crawler
            logger.info(f"Starting crawler: {crawler_name}")
            result = crawler.run(**kwargs)
            logger.info(f"Crawler {crawler_name} finished: {result}")
            
            # Store the result
            self.results[crawler_name] = result
            return result
            
        except Exception as e:
            logger.error(f"Error running crawler {crawler_name}: {str(e)}")
            self.results[crawler_name] = {'status': 'failed', 'error': str(e)}
            return self.results[crawler_name]
    
    def get_results(self) -> Dict[str, Any]:
        """
        Get the results of the last crawl run
        
        Returns:
            Dictionary with results for each crawler
        """
        return self.results
    
    def update_crawler_config(self, crawler_name: str, config: Dict[str, Any]) -> bool:
        """
        Update the configuration for a crawler
        
        Args:
            crawler_name: Name of the crawler
            config: New configuration
            
        Returns:
            True if successful, False otherwise
        """
        try:
            crawler_config.update_crawler_config(crawler_name, config)
            return True
        except Exception as e:
            logger.error(f"Error updating configuration for crawler {crawler_name}: {str(e)}")
            return False 