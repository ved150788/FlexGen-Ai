"""
Scheduler service for running crawlers at configured intervals

This module provides the SchedulerService class that manages scheduled execution
of threat intelligence crawlers based on their configuration.
"""

import logging
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.jobstores.sqlalchemy import SQLAlchemyJobStore
from apscheduler.executors.pool import ThreadPoolExecutor
import importlib
import os
from datetime import datetime
import traceback

logger = logging.getLogger(__name__)

class SchedulerService:
    """Service for scheduling and running crawlers"""
    
    def __init__(self, app):
        """
        Initialize the scheduler service
        
        Args:
            app: Flask application instance
        """
        self.app = app
        self.scheduler = None
        self.crawler_jobs = {}
        self.system_jobs = {}
        
        # Initialize the scheduler
        self._init_scheduler()
        
    def _init_scheduler(self):
        """Initialize the APScheduler instance"""
        # Get database URL from Flask config
        db_url = self.app.config['SQLALCHEMY_DATABASE_URI']
        
        # Configure job stores and executors
        jobstores = {
            'default': SQLAlchemyJobStore(url=db_url)
        }
        
        executors = {
            'default': ThreadPoolExecutor(20)
        }
        
        job_defaults = {
            'coalesce': True,
            'max_instances': 1,
            'misfire_grace_time': 60 * 60  # 1 hour grace time
        }
        
        # Create and configure the scheduler
        self.scheduler = BackgroundScheduler(
            jobstores=jobstores,
            executors=executors,
            job_defaults=job_defaults,
            timezone='UTC'
        )
        
        # Start the scheduler
        self.scheduler.start()
        logger.info("Scheduler started")
        
        # Schedule all enabled crawlers
        self._schedule_all_crawlers()
        
        # Schedule the TAXII client
        self._schedule_taxii_client()
        
    def _schedule_all_crawlers(self):
        """Schedule all enabled crawlers from configuration"""
        # Import the crawler config
        from app.tools.threat_intel_platform.app.crawlers.config import crawler_config
        
        # Get all crawler configurations
        configurations = crawler_config.get_all_configurations()
        
        for crawler_name, config in configurations.items():
            # Skip disabled crawlers
            if not config.get('enabled', True):
                logger.info(f"Crawler {crawler_name} is disabled, skipping scheduling")
                continue
            
            # Schedule the crawler
            frequency = config.get('frequency')
            if frequency:
                self.schedule_crawler(crawler_name, frequency, config)
            else:
                logger.warning(f"No frequency defined for crawler {crawler_name}, skipping scheduling")
    
    def _schedule_taxii_client(self):
        """Schedule the TAXII client to fetch intelligence data"""
        try:
            # Only import when needed
            from app.tools.threat_intel_platform.app.utils.taxii_client import fetch_and_store_intelligence
            
            # Create a job to run the TAXII client every 6 hours
            job = self.scheduler.add_job(
                func=self._run_taxii_client,
                trigger=IntervalTrigger(hours=6),
                id="taxii_intelligence_fetch",
                name="TAXII Intelligence Fetch",
                replace_existing=True
            )
            
            self.system_jobs["taxii_client"] = job.id
            logger.info("Scheduled TAXII client to run every 6 hours")
            
            # Run the job once immediately to populate initial data
            job.modify(next_run_time=datetime.now())
            
        except Exception as e:
            logger.error(f"Error scheduling TAXII client: {str(e)}")
    
    def _run_taxii_client(self):
        """Run the TAXII client to fetch threat intelligence"""
        logger.info("Running TAXII client to fetch threat intelligence")
        
        try:
            from app.tools.threat_intel_platform.app.utils.taxii_client import fetch_and_store_intelligence
            
            # Run the client with app context
            with self.app.app_context():
                total_iocs = fetch_and_store_intelligence()
                logger.info(f"TAXII client completed. Added {total_iocs} new IOCs.")
                return {"status": "success", "added_iocs": total_iocs}
                
        except Exception as e:
            error_msg = f"Error running TAXII client: {str(e)}\n{traceback.format_exc()}"
            logger.error(error_msg)
            
            # Record the error to feed_runs table
            try:
                from app.tools.threat_intel_platform.app.models.schema import FeedRun
                from app.tools.threat_intel_platform.app import db
                
                with self.app.app_context():
                    feed_run = FeedRun(
                        feed_name="taxii_client",
                        start_time=datetime.utcnow(),
                        end_time=datetime.utcnow(),
                        status='failed',
                        error_message=str(e)
                    )
                    db.session.add(feed_run)
                    db.session.commit()
            except Exception as db_error:
                logger.error(f"Could not record TAXII client error to database: {str(db_error)}")
                
            return {"status": "failed", "error": str(e)}
    
    def schedule_crawler(self, crawler_name, frequency, config=None):
        """
        Schedule a crawler to run at the specified frequency
        
        Args:
            crawler_name: Name of the crawler
            frequency: Cron expression for scheduling
            config: Configuration dictionary for the crawler
            
        Returns:
            Job ID if scheduled successfully, None otherwise
        """
        # Check if job already exists
        if crawler_name in self.crawler_jobs:
            # Remove existing job
            self.remove_crawler_job(crawler_name)
        
        # Create the job
        try:
            with self.app.app_context():
                job = self.scheduler.add_job(
                    func=self._run_crawler,
                    trigger=CronTrigger.from_crontab(frequency),
                    args=[crawler_name, config],
                    id=f"crawler_{crawler_name}",
                    name=f"Crawler: {crawler_name}",
                    replace_existing=True
                )
                
                self.crawler_jobs[crawler_name] = job.id
                logger.info(f"Scheduled crawler {crawler_name} with frequency {frequency}")
                
                return job.id
                
        except Exception as e:
            logger.error(f"Error scheduling crawler {crawler_name}: {str(e)}")
            return None
    
    def _run_crawler(self, crawler_name, config=None):
        """
        Run a crawler
        
        Args:
            crawler_name: Name of the crawler
            config: Configuration dictionary
            
        Returns:
            Result dictionary from the crawler run
        """
        logger.info(f"Running crawler: {crawler_name}")
        
        try:
            # Import the crawler class dynamically
            module_name = f"app.tools.threat_intel_platform.app.crawlers.{crawler_name}"
            class_name = f"{crawler_name.title().replace('_', '')}Crawler"
            
            # Try specific naming first
            try:
                module = importlib.import_module(module_name)
                crawler_class = getattr(module, class_name)
            except (ImportError, AttributeError):
                # Try generic naming convention
                crawler_classes = [cls for cls in dir(module) if cls.endswith('Crawler')]
                if crawler_classes:
                    crawler_class = getattr(module, crawler_classes[0])
                else:
                    raise ImportError(f"Could not find crawler class in module {module_name}")
            
            # Initialize the crawler
            crawler = crawler_class(config)
            
            # Run the crawler with app context
            with self.app.app_context():
                result = crawler.run()
                logger.info(f"Crawler {crawler_name} completed: {result}")
                return result
                
        except Exception as e:
            error_msg = f"Error running crawler {crawler_name}: {str(e)}\n{traceback.format_exc()}"
            logger.error(error_msg)
            
            # Record the error to feed_runs table if possible
            try:
                from app.tools.threat_intel_platform.app.models.schema import FeedRun
                from app.tools.threat_intel_platform.app import db
                
                with self.app.app_context():
                    feed_run = FeedRun(
                        feed_name=crawler_name,
                        start_time=datetime.utcnow(),
                        end_time=datetime.utcnow(),
                        status='failed',
                        error_message=str(e)
                    )
                    db.session.add(feed_run)
                    db.session.commit()
            except Exception as db_error:
                logger.error(f"Could not record crawler error to database: {str(db_error)}")
                
            return {"status": "failed", "error": str(e)}
    
    def remove_crawler_job(self, crawler_name):
        """
        Remove a scheduled crawler job
        
        Args:
            crawler_name: Name of the crawler
            
        Returns:
            True if removed, False otherwise
        """
        job_id = self.crawler_jobs.get(crawler_name)
        if job_id:
            try:
                self.scheduler.remove_job(job_id)
                del self.crawler_jobs[crawler_name]
                logger.info(f"Removed crawler job {crawler_name}")
                return True
            except Exception as e:
                logger.error(f"Error removing crawler job {crawler_name}: {str(e)}")
        
        return False
    
    def get_job_info(self, crawler_name):
        """
        Get information about a scheduled job
        
        Args:
            crawler_name: Name of the crawler
            
        Returns:
            Dictionary with job information or None
        """
        job_id = self.crawler_jobs.get(crawler_name)
        if job_id:
            try:
                job = self.scheduler.get_job(job_id)
                if job:
                    return {
                        "id": job.id,
                        "name": job.name,
                        "next_run_time": job.next_run_time.isoformat() if job.next_run_time else None,
                        "trigger": str(job.trigger)
                    }
            except Exception as e:
                logger.error(f"Error getting job info for {crawler_name}: {str(e)}")
        
        return None
    
    def get_all_jobs(self):
        """
        Get information about all scheduled jobs
        
        Returns:
            Dictionary mapping crawler names to job information
        """
        result = {}
        
        # Get crawler jobs
        for crawler_name, job_id in self.crawler_jobs.items():
            job_info = self.get_job_info(crawler_name)
            if job_info:
                result[crawler_name] = job_info
        
        # Get system jobs (like TAXII client)
        for job_name, job_id in self.system_jobs.items():
            try:
                job = self.scheduler.get_job(job_id)
                if job:
                    result[job_name] = {
                        "id": job.id,
                        "name": job.name,
                        "next_run_time": job.next_run_time.isoformat() if job.next_run_time else None,
                        "trigger": str(job.trigger)
                    }
            except Exception as e:
                logger.error(f"Error getting job info for {job_name}: {str(e)}")
        
        return result
    
    def shutdown(self):
        """Shutdown the scheduler"""
        if self.scheduler and self.scheduler.running:
            self.scheduler.shutdown()
            logger.info("Scheduler shutdown") 