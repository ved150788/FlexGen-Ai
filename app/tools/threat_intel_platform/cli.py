#!/usr/bin/env python3
"""
Command-line interface for the Threat Intelligence Platform

This module provides a CLI for managing crawlers and the scheduler.
"""

import os
import sys
import argparse
import logging
import json
from datetime import datetime

# Set up logging first
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Then try to load environment variables
try:
    from dotenv import load_dotenv
    load_dotenv()
    logger.info("Loaded environment variables from .env file")
except Exception as e:
    logger.warning(f"Could not load environment variables: {str(e)}")

def create_app_context():
    """Create and return a Flask app context"""
    from app.tools.threat_intel_platform.app import create_app
    app = create_app()
    return app.app_context()

def list_crawlers(args):
    """List available crawlers and their status"""
    with create_app_context():
        from app.tools.threat_intel_platform.app.crawlers.config import crawler_config
        from app.tools.threat_intel_platform.app.models.schema import FeedRun
        from app.tools.threat_intel_platform.app import db
        
        # Discover available crawlers
        crawlers = crawler_config.discover_crawlers()
        configs = crawler_config.get_all_configurations()
        
        print("\nAvailable Crawlers:")
        print("===================")
        
        for name, crawler_class in crawlers.items():
            config = configs.get(name, {})
            enabled = config.get('enabled', True)
            frequency = config.get('frequency', crawler_class.DEFAULT_FREQUENCY if hasattr(crawler_class, 'DEFAULT_FREQUENCY') else 'N/A')
            
            # Get last run info
            last_run = db.session.query(FeedRun).filter_by(feed_name=name).order_by(FeedRun.start_time.desc()).first()
            
            status = "Disabled"
            if enabled:
                status = "Enabled"
            
            display_name = crawler_class.DISPLAY_NAME if hasattr(crawler_class, 'DISPLAY_NAME') else name.title()
            
            print(f"\n{display_name} ({name}):")
            print(f"  Status: {status}")
            print(f"  Frequency: {frequency}")
            
            if last_run:
                print(f"  Last Run: {last_run.start_time.strftime('%Y-%m-%d %H:%M:%S')}")
                print(f"  Last Status: {last_run.status}")
                print(f"  Items Processed: {last_run.items_processed}")
                if last_run.error_message:
                    print(f"  Error: {last_run.error_message[:100]}...")
            else:
                print(f"  Last Run: Never")

def list_jobs(args):
    """List scheduled jobs"""
    with create_app_context():
        from app.tools.threat_intel_platform.app.scheduler import SchedulerService
        from flask import current_app
        
        scheduler = current_app.scheduler
        jobs = scheduler.get_all_jobs()
        
        print("\nScheduled Jobs:")
        print("===============")
        
        if not jobs:
            print("No scheduled jobs found.")
            return
        
        for crawler_name, job_info in jobs.items():
            print(f"\n{job_info['name']}:")
            print(f"  ID: {job_info['id']}")
            print(f"  Next Run: {job_info['next_run_time']}")
            print(f"  Trigger: {job_info['trigger']}")

def run_crawler(args):
    """Run a specific crawler"""
    crawler_name = args.name
    
    with create_app_context():
        from app.tools.threat_intel_platform.app.crawlers.config import crawler_config
        import importlib
        
        # Get the crawler class
        crawler_classes = crawler_config.discover_crawlers()
        crawler_class = crawler_classes.get(crawler_name)
        
        if not crawler_class:
            print(f"Error: Crawler '{crawler_name}' not found")
            return
        
        # Get configuration
        config = crawler_config.get_crawler_config(crawler_name)
        
        print(f"Running crawler: {crawler_name}")
        print(f"Configuration: {json.dumps(config, indent=2)}")
        
        # Initialize and run the crawler
        try:
            crawler = crawler_class(config)
            result = crawler.run()
            
            print(f"\nCrawler result: {json.dumps(result, indent=2)}")
            
        except Exception as e:
            print(f"Error running crawler: {str(e)}")
            import traceback
            traceback.print_exc()

def run_all_crawlers(args):
    """Run all enabled crawlers"""
    with create_app_context():
        from app.tools.threat_intel_platform.app.crawlers.config import crawler_config
        
        # Get enabled crawlers
        crawler_config.discover_crawlers()
        enabled_crawlers = crawler_config.get_enabled_crawlers()
        
        if not enabled_crawlers:
            print("No enabled crawlers found.")
            return
        
        print(f"Running {len(enabled_crawlers)} enabled crawlers:")
        for crawler_name in enabled_crawlers:
            print(f"- {crawler_name}")
        
        for crawler_name in enabled_crawlers:
            try:
                args.name = crawler_name
                run_crawler(args)
                print("\n---\n")
            except Exception as e:
                print(f"Error running crawler {crawler_name}: {str(e)}")

def show_stats(args):
    """Show database statistics"""
    with create_app_context():
        from app.tools.threat_intel_platform.app.models import get_stats
        
        stats = get_stats()
        print("\nThreat Intelligence Platform Statistics:")
        print("=======================================")
        
        print(f"\nTotal IOCs: {stats['total_iocs']}")
        print(f"IOCs added in last 24h: {stats['recent_iocs']}")
        
        print("\nIOC Types:")
        for ioc_type, count in stats.get('ioc_counts', {}).items():
            print(f"  {ioc_type}: {count}")
        
        print("\nFeeds:")
        for feed_name, feed_stats in stats.get('feeds', {}).items():
            print(f"  {feed_name}:")
            print(f"    Runs: {feed_stats.get('runs', 0)}")
            print(f"    Last Run: {feed_stats.get('last_run', 'Never')}")
        
        print("\nEntities:")
        print(f"  Campaigns: {stats.get('campaigns', 0)}")
        print(f"  Threat Actors: {stats.get('threat_actors', 0)}")
        print(f"  Vulnerabilities: {stats.get('vulnerabilities', 0)}")
        print(f"  Events: {stats.get('events', 0)}")
        print(f"  Relationships: {stats.get('relationships', 0)}")

def main():
    """Main entry point for the CLI"""
    parser = argparse.ArgumentParser(description="Threat Intelligence Platform CLI")
    subparsers = parser.add_subparsers(help="Commands", dest="command")
    
    # List crawlers command
    list_parser = subparsers.add_parser("list", help="List available crawlers")
    list_parser.set_defaults(func=list_crawlers)
    
    # List jobs command
    jobs_parser = subparsers.add_parser("jobs", help="List scheduled jobs")
    jobs_parser.set_defaults(func=list_jobs)
    
    # Run crawler command
    run_parser = subparsers.add_parser("run", help="Run a specific crawler")
    run_parser.add_argument("name", help="Name of the crawler to run")
    run_parser.set_defaults(func=run_crawler)
    
    # Run all crawlers command
    run_all_parser = subparsers.add_parser("run-all", help="Run all enabled crawlers")
    run_all_parser.set_defaults(func=run_all_crawlers)
    
    # Show stats command
    stats_parser = subparsers.add_parser("stats", help="Show database statistics")
    stats_parser.set_defaults(func=show_stats)
    
    args = parser.parse_args()
    
    # If no command is specified, show help
    if not hasattr(args, 'func'):
        parser.print_help()
        return
    
    # Execute the command
    args.func(args)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        logger.info("Operation cancelled by user")
        sys.exit(0)
    except Exception as e:
        logger.error(f"Unhandled exception: {str(e)}", exc_info=True)
        sys.exit(1) 