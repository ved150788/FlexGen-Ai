"""
Configuration manager for threat intelligence crawlers

This module provides functionality to load, store, and manage crawler configurations
from various sources (files, environment variables, etc.)
"""

import os
import json
import importlib
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class CrawlerConfig:
    """Configuration manager for crawlers"""
    
    def __init__(self):
        """Initialize the crawler configuration manager"""
        self.configurations = {}
        self.crawler_classes = {}
        
    def load_from_file(self, file_path):
        """
        Load crawler configurations from a JSON file
        
        Args:
            file_path: Path to the JSON configuration file
        """
        try:
            with open(file_path, 'r') as f:
                config_data = json.load(f)
                
            # Update configurations
            self.configurations.update(config_data)
            logger.info(f"Loaded crawler configurations from {file_path}")
            
        except Exception as e:
            logger.error(f"Error loading crawler configurations from {file_path}: {str(e)}")
    
    def load_from_env(self):
        """
        Load crawler configurations from environment variables
        
        Environment variables should be in the format:
        CRAWLER_<NAME>_<SETTING> = value
        
        For example:
        CRAWLER_ALIENVAULT_API_KEY=1234567890
        CRAWLER_ALIENVAULT_ENABLED=true
        """
        crawler_vars = {}
        
        # Find all CRAWLER_ prefixed environment variables
        for key, value in os.environ.items():
            if key.startswith('CRAWLER_'):
                parts = key.split('_', 2)  # CRAWLER_NAME_SETTING
                if len(parts) >= 3:
                    crawler_name = parts[1].lower()
                    setting_name = parts[2].lower()
                    
                    if crawler_name not in crawler_vars:
                        crawler_vars[crawler_name] = {}
                    
                    # Convert values to appropriate types
                    if value.lower() == 'true':
                        value = True
                    elif value.lower() == 'false':
                        value = False
                    elif value.isdigit():
                        value = int(value)
                    
                    crawler_vars[crawler_name][setting_name] = value
        
        # Update configurations with environment variables
        for crawler_name, settings in crawler_vars.items():
            if crawler_name not in self.configurations:
                self.configurations[crawler_name] = {}
            
            self.configurations[crawler_name].update(settings)
        
        if crawler_vars:
            logger.info(f"Loaded crawler configurations from environment variables")
    
    def save_to_file(self, file_path):
        """
        Save current configurations to a JSON file
        
        Args:
            file_path: Path to save the configurations
        """
        try:
            # Ensure the directory exists
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            
            with open(file_path, 'w') as f:
                json.dump(self.configurations, f, indent=2)
                
            logger.info(f"Saved crawler configurations to {file_path}")
            
        except Exception as e:
            logger.error(f"Error saving crawler configurations to {file_path}: {str(e)}")
    
    def get_crawler_config(self, crawler_name):
        """
        Get configuration for a specific crawler
        
        Args:
            crawler_name: Name of the crawler
            
        Returns:
            Dictionary with configuration or empty dict if not found
        """
        return self.configurations.get(crawler_name, {})
    
    def set_crawler_config(self, crawler_name, config):
        """
        Set configuration for a specific crawler
        
        Args:
            crawler_name: Name of the crawler
            config: Configuration dictionary
        """
        self.configurations[crawler_name] = config
    
    def get_all_configurations(self):
        """
        Get all crawler configurations
        
        Returns:
            Dictionary with all crawler configurations
        """
        return self.configurations
    
    def get_enabled_crawlers(self):
        """
        Get list of enabled crawlers
        
        Returns:
            List of crawler names that are enabled
        """
        return [
            name for name, config in self.configurations.items() 
            if config.get('enabled', True)
        ]
    
    def discover_crawlers(self, package_path='app.tools.threat_intel_platform.app.crawlers'):
        """
        Discover available crawler classes
        
        Args:
            package_path: Python package path to search for crawlers
            
        Returns:
            Dictionary mapping crawler names to crawler classes
        """
        try:
            # Get the physical path of the package
            package = importlib.import_module(package_path)
            package_dir = Path(package.__file__).parent
            
            # Find Python files (excluding __init__.py and this file)
            for file_path in package_dir.glob('*.py'):
                filename = file_path.name
                
                if filename.startswith('__') or filename == 'config.py' or filename == 'base.py':
                    continue
                
                # Import the module
                module_name = f"{package_path}.{filename[:-3]}"
                try:
                    module = importlib.import_module(module_name)
                    
                    # Find crawler classes in the module
                    for attr_name in dir(module):
                        attr = getattr(module, attr_name)
                        
                        # Check if it's a crawler class
                        if (
                            isinstance(attr, type) and 
                            attr_name.endswith('Crawler') and 
                            hasattr(attr, 'NAME') and
                            hasattr(attr, 'run')
                        ):
                            crawler_name = attr.NAME
                            self.crawler_classes[crawler_name] = attr
                            
                            # Add default configuration if not exists
                            if crawler_name not in self.configurations:
                                self.configurations[crawler_name] = {}
                            
                            # Add default frequency if available and not set
                            if hasattr(attr, 'DEFAULT_FREQUENCY') and 'frequency' not in self.configurations[crawler_name]:
                                self.configurations[crawler_name]['frequency'] = attr.DEFAULT_FREQUENCY
                            
                except Exception as e:
                    logger.error(f"Error loading crawler module {module_name}: {str(e)}")
            
            logger.info(f"Discovered {len(self.crawler_classes)} crawler classes")
            return self.crawler_classes
            
        except Exception as e:
            logger.error(f"Error discovering crawlers: {str(e)}")
            return {}
    
    def get_crawler_class(self, crawler_name):
        """
        Get the crawler class for a given name
        
        Args:
            crawler_name: Name of the crawler
            
        Returns:
            Crawler class or None if not found
        """
        if not self.crawler_classes:
            self.discover_crawlers()
            
        return self.crawler_classes.get(crawler_name)

# Create a singleton instance
crawler_config = CrawlerConfig() 