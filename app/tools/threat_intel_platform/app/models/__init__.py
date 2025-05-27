"""
Models package initialization file

This file imports all models to make them available from the models package
and provides utility functions for database operations.
"""

# Import all models to register them with SQLAlchemy
from .schema import (
    # Core models
    IOC, FeedRun, Tag,
    
    # Detail models
    IPDetails, DomainDetails, URLDetails, FileDetails,
    
    # Intelligence models
    ThreatActor, Campaign, Vulnerability, Relationship, Event,
    
    # Association tables
    ioc_tags, ioc_campaigns, actor_campaigns, ioc_vulnerabilities
)

from .. import db
from sqlalchemy import func
import datetime

def get_stats():
    """
    Get database statistics
    
    Returns:
        Dictionary with statistics
    """
    stats = {}
    
    # Get IOC counts by type
    try:
        ioc_types = db.session.query(
            IOC.type, 
            func.count(IOC.id)
        ).group_by(IOC.type).all()
        
        stats['ioc_counts'] = {
            t[0]: t[1] for t in ioc_types
        }
        stats['total_iocs'] = sum(stats['ioc_counts'].values())
    except Exception as e:
        stats['ioc_counts'] = {}
        stats['total_iocs'] = 0
    
    # Get recent IOCs
    try:
        recent_cutoff = datetime.datetime.utcnow() - datetime.timedelta(days=1)
        stats['recent_iocs'] = db.session.query(IOC).filter(
            IOC.first_seen >= recent_cutoff
        ).count()
    except Exception:
        stats['recent_iocs'] = 0
    
    # Get feed statistics
    try:
        feed_runs = db.session.query(
            FeedRun.feed_name,
            func.count(FeedRun.id),
            func.max(FeedRun.start_time)
        ).group_by(FeedRun.feed_name).all()
        
        stats['feeds'] = {
            f[0]: {
                'runs': f[1],
                'last_run': f[2].isoformat() if f[2] else None
            } for f in feed_runs
        }
    except Exception:
        stats['feeds'] = {}
    
    # Get other entity counts
    try:
        stats['campaigns'] = db.session.query(Campaign).count()
        stats['threat_actors'] = db.session.query(ThreatActor).count()
        stats['vulnerabilities'] = db.session.query(Vulnerability).count()
        stats['events'] = db.session.query(Event).count()
        stats['relationships'] = db.session.query(Relationship).count()
    except Exception:
        stats['campaigns'] = 0
        stats['threat_actors'] = 0
        stats['vulnerabilities'] = 0
        stats['events'] = 0
        stats['relationships'] = 0
    
    return stats

def initialize_database():
    """Initialize the database with any required default data"""
    # Create common tags
    common_tags = [
        {"name": "malware", "category": "threat_type", "description": "Malicious software"},
        {"name": "phishing", "category": "threat_type", "description": "Phishing campaigns"},
        {"name": "ransomware", "category": "malware", "description": "Ransomware family"},
        {"name": "trojan", "category": "malware", "description": "Trojan family"},
        {"name": "botnet", "category": "infrastructure", "description": "Botnet infrastructure"},
        {"name": "c2", "category": "infrastructure", "description": "Command and control server"},
        {"name": "apt", "category": "actor", "description": "Advanced Persistent Threat"},
        {"name": "financial", "category": "target", "description": "Financial sector target"},
        {"name": "healthcare", "category": "target", "description": "Healthcare sector target"},
        {"name": "government", "category": "target", "description": "Government sector target"},
        {"name": "high_confidence", "category": "confidence", "description": "High confidence indicator"}
    ]
    
    for tag_data in common_tags:
        # Check if tag already exists
        tag = db.session.query(Tag).filter_by(name=tag_data["name"]).first()
        
        if not tag:
            tag = Tag(
                name=tag_data["name"],
                category=tag_data["category"],
                description=tag_data["description"]
            )
            db.session.add(tag)
    
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        print(f"Error initializing database: {str(e)}") 