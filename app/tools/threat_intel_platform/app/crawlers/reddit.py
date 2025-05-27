import praw
import os
import logging
from datetime import datetime
from app.models.ioc import IOC, FeedRun
from app.utils.ioc_extractor import extract_and_normalize
from app import db

logger = logging.getLogger(__name__)

class RedditCrawler:
    """Crawler for security-related subreddits"""
    
    # Security-focused subreddits
    SUBREDDITS = [
        'netsec',
        'ThreatHunting',
        'Malware',
        'cybersecurity'
    ]
    
    def __init__(self):
        """Initialize Reddit crawler with API credentials"""
        client_id = os.environ.get('REDDIT_CLIENT_ID')
        client_secret = os.environ.get('REDDIT_CLIENT_SECRET')
        user_agent = 'FlexGenThreatIntel/1.0'
        
        if not client_id or not client_secret:
            logger.warning("Reddit API credentials not provided.")
            raise ValueError("Reddit API credentials are required.")
        
        self.reddit = praw.Reddit(
            client_id=client_id,
            client_secret=client_secret,
            user_agent=user_agent
        )
    
    def fetch_subreddit_posts(self, subreddit_name, limit=25):
        """
        Fetch recent posts from a subreddit
        
        Args:
            subreddit_name: Name of the subreddit to fetch
            limit: Maximum number of posts to fetch
            
        Returns:
            List of submission objects
        """
        try:
            subreddit = self.reddit.subreddit(subreddit_name)
            return list(subreddit.new(limit=limit))
        except Exception as e:
            logger.error(f"Error fetching posts from r/{subreddit_name}: {str(e)}")
            return []
    
    def process_submission(self, submission):
        """
        Process a Reddit submission and extract IOCs
        
        Args:
            submission: Reddit submission object
            
        Returns:
            Number of IOCs extracted and stored
        """
        # Combine title and selftext for IOC extraction
        content = f"{submission.title}\n\n{submission.selftext}"
        submission_url = f"https://reddit.com{submission.permalink}"
        
        # Extract IOCs from the content
        normalized_iocs = extract_and_normalize(
            text=content, 
            source=f"Reddit r/{submission.subreddit.display_name}",
            source_url=submission_url,
            confidence=0.5  # Medium confidence for Reddit
        )
        
        # If there are comments, process them too
        submission.comments.replace_more(limit=0)  # Only get top-level comments
        comment_count = 0
        
        for comment in submission.comments.list():
            # Skip if too many comments already processed or empty comment
            if comment_count >= 5 or not comment.body:
                continue
                
            comment_iocs = extract_and_normalize(
                text=comment.body,
                source=f"Reddit r/{submission.subreddit.display_name}",
                source_url=f"https://reddit.com{comment.permalink}",
                confidence=0.4  # Slightly lower confidence for comments
            )
            
            normalized_iocs.extend(comment_iocs)
            comment_count += 1
        
        # Store the IOCs in the database
        for ioc_data in normalized_iocs:
            # Check if IOC already exists
            existing_ioc = IOC.query.filter_by(
                type=ioc_data['type'], 
                value=ioc_data['value']
            ).first()
            
            if existing_ioc:
                # Update last_seen
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
                    metadata={
                        'reddit_title': submission.title,
                        'subreddit': submission.subreddit.display_name,
                        'score': submission.score,
                        'submission_id': submission.id
                    }
                )
                db.session.add(new_ioc)
        
        # Commit changes
        db.session.commit()
        
        return len(normalized_iocs)
    
    def run(self, limit_per_subreddit=10):
        """
        Main method to run the crawler
        
        Args:
            limit_per_subreddit: Maximum posts to fetch per subreddit
            
        Returns:
            Dictionary with crawl statistics
        """
        # Create a FeedRun record
        feed_run = FeedRun(
            feed_name='Reddit Security Subreddits',
            status='running'
        )
        db.session.add(feed_run)
        db.session.commit()
        
        try:
            total_posts = 0
            total_iocs = 0
            
            # Process each subreddit
            for subreddit_name in self.SUBREDDITS:
                try:
                    # Fetch posts from the subreddit
                    submissions = self.fetch_subreddit_posts(
                        subreddit_name, 
                        limit=limit_per_subreddit
                    )
                    
                    # Process each submission
                    for submission in submissions:
                        try:
                            ioc_count = self.process_submission(submission)
                            total_iocs += ioc_count
                            total_posts += 1
                            
                            logger.info(f"Processed r/{subreddit_name} post '{submission.title}', found {ioc_count} IOCs")
                            
                        except Exception as e:
                            logger.error(f"Error processing submission {submission.id}: {str(e)}")
                            continue
                
                except Exception as e:
                    logger.error(f"Error processing subreddit r/{subreddit_name}: {str(e)}")
                    continue
            
            # Update FeedRun with results
            feed_run.end_time = datetime.utcnow()
            feed_run.status = 'success'
            feed_run.items_processed = total_posts
            feed_run.items_added = total_iocs
            db.session.add(feed_run)
            db.session.commit()
            
            return {
                'status': 'success',
                'posts_processed': total_posts,
                'iocs_found': total_iocs,
                'subreddits': len(self.SUBREDDITS)
            }
            
        except Exception as e:
            # Log the error and update FeedRun
            logger.error(f"Error in Reddit crawler: {str(e)}")
            
            feed_run.end_time = datetime.utcnow()
            feed_run.status = 'failed'
            feed_run.error_message = str(e)
            db.session.add(feed_run)
            db.session.commit()
            
            return {
                'status': 'failed',
                'error': str(e)
            } 